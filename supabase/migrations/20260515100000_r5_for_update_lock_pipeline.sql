-- R5: lock_pipeline_v2 — FOR UPDATE-locking i compute (Fund 6).
--
-- BAGGRUND (Codex Fund 6):
-- _pay_period_compute_candidate_internal læser pay_period uden FOR UPDATE.
-- Hvis to processer kører compute samtidig på samme periode, kan begge
-- nå at INSERT'e candidate-rows + opdatere is_current=true på pay_period_
-- candidate_runs. Race-conditions giver inkonsistent state.
--
-- FIX: SELECT pay_period FOR UPDATE i compute (matcher lock-internal).
--
-- DEFERRED til R5b (G030): deterministic sale_id (Fund 5). Kræver sales-
-- tabel der bygges i lag E (trin 9+). Indtil da bevares gen_random_uuid()
-- som placeholder.
--
-- Fund 25 (row-count assertion) er allerede implementeret i R3 lock_internal.

create or replace function core_money._pay_period_compute_candidate_internal(
  p_period_id uuid, p_change_reason text
)
returns core_money.pay_period_candidate_runs
language plpgsql security definer set search_path = ''
set statement_timeout to '30min'
as $function$
declare
  v_period record;
  v_started timestamptz := clock_timestamp();
  v_checksum_row record;
  v_run core_money.pay_period_candidate_runs;
  v_employee record;
  v_commission_count integer := 0;
  v_correction_count integer := 0;
begin
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;

  -- R5 (Fund 6): FOR UPDATE forhindrer concurrent compute paa samme periode.
  select pp.id, pp.status, pp.start_date, pp.end_date
    into v_period
    from core_money.pay_periods pp
   where pp.id = p_period_id
   for update;
  if v_period.id is null then
    raise exception 'pay_period ikke fundet: %', p_period_id using errcode = 'P0002';
  end if;
  if v_period.status <> 'open' then
    raise exception 'pay_period % er ikke open (status=%)', p_period_id, v_period.status
      using errcode = 'P0001';
  end if;

  select * into v_checksum_row from core_money._compute_period_data_checksum(p_period_id);

  perform set_config('stork.allow_commission_snapshots_candidate_delete', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason',
    'R3 idempotent recompute: ' || p_change_reason, true);
  delete from core_money.commission_snapshots
   where period_id = p_period_id and is_candidate = true;

  perform set_config('stork.allow_pay_period_candidate_runs_write', 'true', true);
  update core_money.pay_period_candidate_runs
     set is_current = false
   where period_id = p_period_id and is_current = true;

  insert into core_money.pay_period_candidate_runs (
    period_id, generated_by, data_checksum, data_checksum_inputs,
    is_current, commission_row_count, correction_row_count
  ) values (
    p_period_id, auth.uid(), v_checksum_row.checksum, v_checksum_row.inputs,
    true, 0, 0
  )
  returning * into v_run;

  perform set_config('stork.allow_commission_snapshots_write', 'true', true);
  for v_employee in
    select e.id from core_identity.employees e
     where core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
       and (e.termination_date is null or e.termination_date >= v_period.start_date)
  loop
    insert into core_money.commission_snapshots (
      period_id, employee_id, sale_id,
      amount, status_at_lock, is_candidate, candidate_run_id
    ) values (
      p_period_id, v_employee.id, gen_random_uuid(),
      0.00, 'skeleton_placeholder', true, v_run.id
    );
    v_commission_count := v_commission_count + 1;
  end loop;

  select count(*) into v_correction_count
    from core_money.salary_corrections
   where target_period_id = p_period_id;

  update core_money.pay_period_candidate_runs
     set commission_row_count = v_commission_count,
         correction_row_count = v_correction_count,
         computation_duration_ms = (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer
   where id = v_run.id
   returning * into v_run;

  return v_run;
end;
$function$;
