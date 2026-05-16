-- Trin 7 / §4 trin 7: Lock-pipeline RPC'er (atomar forberedt-aggregat).
--
-- Master-plan §1.6 + rettelse 19 C3.
--
-- Fase 1 (pre-compute): pay_period_compute_candidate(period_id, reason)
--   - Beregner aggregater til candidate-tabeller
--   - Sætter pay_period_candidate_runs med data_checksum
--   - Tidligere is_current candidate markeres is_current=false
--
-- Fase 2 (lock): pay_period_lock(period_id, change_reason)
--   - Validerer at status='open' og candidate findes med is_current=true
--   - Sammenligner candidate's data_checksum med live data
--   - Hvis stale: re-genererer candidate inline
--   - Promoverer candidate-rows → final tabeller (INSERT)
--   - UPDATE'er pay_periods.status='locked'
--   - Hele transaktionen er atomar
--
-- Statement_timeout 5 min på pay_period_lock (master-plan §1.14, rettelse 18 A4).
--
-- pay_period_unlock kræver break-glass-flow (§1.15) — bygges som intern
-- dispatcher-RPC i t7c_break_glass.sql.
--
-- TRIN 7 SKELETON: candidate-compute er en STUB der pt. ikke har sales/payroll-
-- formler at trække fra (sales kommer trin 14, formler trin 13, aggregater
-- trin 22). Den genererer i stedet aggregat fra eksisterende salary_corrections
-- og opretter tomme commission-snapshot-candidate-rækker pr. aktiv medarbejder
-- for at validere pipeline-mekanikken. Fuld compute-logik tilføjes når
-- afhængigheder eksisterer.

-- ─── _compute_period_data_checksum(period_id): intern helper ──────────────
-- Returnerer (checksum_text, checksum_inputs_jsonb) der tilsammen identificerer
-- nuværende tilstand af live source-data. Bruges til at detektere stale candidate.
-- TRIN 7: kun salary_corrections + employees er live source-data. Sales (trin 14)
-- tilføjes når salgs-tabellen findes.

create or replace function core_money._compute_period_data_checksum(p_period_id uuid)
returns table (checksum text, inputs jsonb)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_sc_count integer;
  v_sc_max_ts timestamptz;
  v_emp_count integer;
  v_inputs jsonb;
begin
  -- Salary_corrections med target_period_id = denne periode.
  select count(*), max(created_at)
    into v_sc_count, v_sc_max_ts
    from core_money.salary_corrections
   where target_period_id = p_period_id;

  -- Aktive medarbejdere (ikke anonymized, ikke termineret før period start).
  select count(*)
    into v_emp_count
    from core_identity.employees e
    join core_money.pay_periods pp on pp.id = p_period_id
   where e.anonymized_at is null
     and (e.termination_date is null or e.termination_date >= pp.start_date);

  v_inputs := jsonb_build_object(
    'salary_corrections_count', v_sc_count,
    'salary_corrections_latest', coalesce(v_sc_max_ts, '1970-01-01'::timestamptz),
    'active_employees_count', v_emp_count,
    'period_id', p_period_id
  );

  checksum := encode(
    extensions.digest(v_inputs::text, 'sha256'),
    'hex'
  );
  inputs := v_inputs;
  return next;
end;
$$;

comment on function core_money._compute_period_data_checksum(uuid) is
  'Intern helper: checksum af live source-data for periode. Sammenlignes med candidate-run.data_checksum for at detektere stale candidate. Udvides i trin 14+ med sales-state og trin 13+ med formel-version.';

revoke all on function core_money._compute_period_data_checksum(uuid) from public;
grant execute on function core_money._compute_period_data_checksum(uuid) to authenticated, service_role;

-- ─── pay_period_compute_candidate(period_id, change_reason) ──────────────
-- SECURITY DEFINER. Idempotent: tidligere current candidate markeres
-- is_current=false, ny candidate oprettes med is_current=true.

create or replace function core_money.pay_period_compute_candidate(
  p_period_id uuid,
  p_change_reason text
)
returns core_money.pay_period_candidate_runs
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_period record;
  v_started timestamptz := clock_timestamp();
  v_checksum_row record;
  v_run core_money.pay_period_candidate_runs;
  v_employee record;
  v_commission_count integer := 0;
  v_correction_count integer := 0;
begin
  -- Permission: admin eller service-role-cron.
  if not core_identity.is_admin() and current_user not in ('service_role', 'supabase_admin', 'postgres') then
    raise exception 'pay_period_compute_candidate kraever admin-permission eller service-role' using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;

  select pp.id, pp.status, pp.start_date, pp.end_date
    into v_period
    from core_money.pay_periods pp where pp.id = p_period_id;
  if v_period.id is null then
    raise exception 'pay_period ikke fundet: %', p_period_id using errcode = 'P0002';
  end if;
  if v_period.status <> 'open' then
    raise exception 'pay_period % er ikke open (status=%) — candidate kan kun beregnes for åbne perioder', p_period_id, v_period.status
      using errcode = 'P0001';
  end if;

  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);

  -- Beregn data_checksum
  select * into v_checksum_row from core_money._compute_period_data_checksum(p_period_id);

  -- Marker tidligere current candidate som ikke-current
  perform set_config('stork.allow_pay_period_candidate_runs_write', 'true', true);
  update core_money.pay_period_candidate_runs
     set is_current = false
   where period_id = p_period_id
     and is_current = true;

  -- Indsæt ny candidate_run
  insert into core_money.pay_period_candidate_runs (
    period_id, generated_by, data_checksum, data_checksum_inputs,
    is_current, commission_row_count, correction_row_count
  ) values (
    p_period_id, auth.uid(), v_checksum_row.checksum, v_checksum_row.inputs,
    true, 0, 0
  )
  returning * into v_run;

  -- TRIN 7 SKELETON: opret tomme commission-candidate-rows pr. aktiv medarbejder.
  -- Fuld logik tilføjes når sales (trin 14) og aggregat-formler (trin 13/22) findes.
  -- Skeleton genererer 0-amount placeholder så pipeline-mekanikken er testbar.
  perform set_config('stork.allow_commission_snapshots_candidate_write', 'true', true);
  for v_employee in
    select e.id
      from core_identity.employees e
     where e.anonymized_at is null
       and (e.termination_date is null or e.termination_date >= v_period.start_date)
  loop
    insert into core_money.commission_snapshots_candidate (
      candidate_run_id, period_id, employee_id, sale_id,
      amount, status_at_lock
    ) values (
      v_run.id, p_period_id, v_employee.id, gen_random_uuid(),
      0.00, 'skeleton_placeholder'
    );
    v_commission_count := v_commission_count + 1;
  end loop;

  -- Kopiér eksisterende åbne salary_corrections til candidate (snapshot ved compute-tid).
  perform set_config('stork.allow_salary_corrections_candidate_write', 'true', true);
  insert into core_money.salary_corrections_candidate (
    candidate_run_id, target_period_id, source_sale_id, source_period_id,
    amount, reason, description, source_cancellation_id, created_by, created_at
  )
  select v_run.id, target_period_id, source_sale_id, source_period_id,
         amount, reason, description, source_cancellation_id, created_by, created_at
    from core_money.salary_corrections
   where target_period_id = p_period_id;

  get diagnostics v_correction_count = row_count;

  -- Opdatér run-tæller + varighed
  update core_money.pay_period_candidate_runs
     set commission_row_count = v_commission_count,
         correction_row_count = v_correction_count,
         computation_duration_ms = (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer
   where id = v_run.id
   returning * into v_run;

  return v_run;
end;
$$;

comment on function core_money.pay_period_compute_candidate(uuid, text) is
  'Master-plan §1.6 + rettelse 19 C3 fase 1. Beregner candidate-aggregater. TRIN 7 SKELETON: skeleton-implementation der genererer 0-amount placeholder commission-candidate-rows og kopierer eksisterende salary_corrections. Fuld compute-logik tilføjes når sales (trin 14) og aggregater (trin 22) findes.';

-- Statement_timeout: pre-compute må gerne tage tid (5-30 min acceptable).
alter function core_money.pay_period_compute_candidate(uuid, text) set statement_timeout = '30min';

revoke all on function core_money.pay_period_compute_candidate(uuid, text) from public;
grant execute on function core_money.pay_period_compute_candidate(uuid, text) to authenticated, service_role;

-- ─── pay_period_lock(period_id, change_reason) ───────────────────────────
-- Atomar fase-2-promovering. Validerer + promoverer + UPDATE status='locked'.
-- Statement_timeout 5 min.

create or replace function core_money.pay_period_lock(
  p_period_id uuid,
  p_change_reason text
)
returns core_money.pay_periods
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_period record;
  v_run core_money.pay_period_candidate_runs;
  v_live_checksum_row record;
  v_started timestamptz := clock_timestamp();
  v_result core_money.pay_periods;
begin
  -- Permission: admin eller service-role-cron.
  if not core_identity.is_admin() and current_user not in ('service_role', 'supabase_admin', 'postgres') then
    raise exception 'pay_period_lock kraever admin-permission eller service-role' using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;

  -- Lock periode-rækken FOR UPDATE for at forhindre samtidig lock-forsøg.
  select * into v_period from core_money.pay_periods where id = p_period_id for update;
  if v_period.id is null then
    raise exception 'pay_period ikke fundet: %', p_period_id using errcode = 'P0002';
  end if;
  if v_period.status <> 'open' then
    raise exception 'pay_period % er ikke open (status=%) — kan ikke låses', p_period_id, v_period.status
      using errcode = 'P0001';
  end if;

  perform set_config('stork.source_type',
    case when current_user in ('service_role', 'supabase_admin', 'postgres') then 'cron' else 'manual' end,
    true);
  perform set_config('stork.change_reason', p_change_reason, true);

  -- Find current candidate
  select * into v_run from core_money.pay_period_candidate_runs
   where period_id = p_period_id and is_current = true;

  -- Sammenlign med live data
  select * into v_live_checksum_row from core_money._compute_period_data_checksum(p_period_id);

  if v_run.id is null then
    -- Ingen candidate findes → generér inline.
    v_run := core_money.pay_period_compute_candidate(p_period_id, 'inline_compute_at_lock: ' || p_change_reason);
  elsif v_run.data_checksum <> v_live_checksum_row.checksum then
    -- Candidate er stale → re-generér inline.
    v_run := core_money.pay_period_compute_candidate(p_period_id, 'stale_recompute_at_lock: ' || p_change_reason);
  end if;

  -- Promovér candidate → final
  perform set_config('stork.allow_commission_snapshots_write', 'true', true);
  insert into core_money.commission_snapshots (
    period_id, employee_id, sale_id, amount, status_at_lock, created_at
  )
  select period_id, employee_id, sale_id, amount, status_at_lock, created_at
    from core_money.commission_snapshots_candidate
   where candidate_run_id = v_run.id;

  -- salary_corrections promoveres IKKE — de er allerede i core_money.salary_corrections
  -- (candidate er kun snapshot af eksisterende åbne corrections). Final-tabellens
  -- target_period_id-validering blokerer fremtidige INSERT'er fordi periode er låst.

  -- UPDATE pay_periods → locked
  perform set_config('stork.allow_pay_periods_write', 'true', true);
  update core_money.pay_periods
     set status = 'locked',
         consecutive_lock_failures = 0,
         last_lock_attempt_at = now(),
         last_lock_error = null
   where id = p_period_id
   returning * into v_result;

  return v_result;
exception when others then
  -- Log fejl-attempt på periode-rækken (men rul transaktion tilbage).
  -- Vi kan ikke skrive til pay_periods her fordi vi er midt i en fejlet
  -- transaktion. Auto-lock-cron's wrapper opdaterer last_lock_error
  -- + consecutive_lock_failures i en separat transaktion.
  raise;
end;
$$;

comment on function core_money.pay_period_lock(uuid, text) is
  'Master-plan §1.6 + rettelse 19 C3 fase 2. Atomar promovering af candidate → final. Validerer + re-generér candidate hvis stale + promovér + lock status. Statement_timeout 5 min.';

alter function core_money.pay_period_lock(uuid, text) set statement_timeout = '5min';

revoke all on function core_money.pay_period_lock(uuid, text) from public;
grant execute on function core_money.pay_period_lock(uuid, text) to authenticated, service_role;

-- ─── pay_period_unlock_via_break_glass(period_id, change_reason) ─────────
-- Intern RPC kun callable via break_glass_execute-dispatcher (trin 7c).
-- Sætter session-var allow_pay_period_unlock_break_glass='true' så
-- pay_periods_lock_and_delete_check tillader status='locked' → 'open'.
-- Final commission_snapshots forbliver i tabellen — break-glass nulstiller
-- KUN periode-status. Re-lock vil overskrive med ny candidate.

create or replace function core_money.pay_period_unlock_via_break_glass(
  p_period_id uuid,
  p_change_reason text
)
returns core_money.pay_periods
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_period record;
  v_result core_money.pay_periods;
begin
  -- Permission-check: kun callable via break_glass_execute (sætter session-var).
  if current_setting('stork.break_glass_dispatch', true) <> 'true' then
    raise exception 'pay_period_unlock_via_break_glass må kun kaldes via break_glass_execute' using errcode = '42501';
  end if;

  select * into v_period from core_money.pay_periods where id = p_period_id for update;
  if v_period.id is null then
    raise exception 'pay_period ikke fundet: %', p_period_id using errcode = 'P0002';
  end if;
  if v_period.status <> 'locked' then
    raise exception 'pay_period % er ikke locked (status=%) — kan ikke unlocke', p_period_id, v_period.status
      using errcode = 'P0001';
  end if;

  perform set_config('stork.allow_pay_periods_write', 'true', true);
  perform set_config('stork.allow_pay_period_unlock_break_glass', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'break_glass_unlock: ' || p_change_reason, true);

  -- Final commission_snapshots bevares ved break-glass unlock.
  -- Post-R3/R4: commission_snapshots bruger flag-UPDATE-mønster (is_candidate
  -- flag på samme tabel; lock UPDATE'er flag fra true → false). Re-lock efter
  -- break-glass-unlock genberegner candidate-rows (DELETE is_candidate=true
  -- + ny INSERT) og UPDATE'er flag på de promoverede rows tilbage til false.
  -- Idempotens sikres via candidate_run_id-tracking + DELETE-før-INSERT i
  -- compute (R5). Ingen ON CONFLICT-mønster nødvendig.

  update core_money.pay_periods
     set status = 'open',
         locked_at = null,
         locked_by = null
   where id = p_period_id
   returning * into v_result;

  return v_result;
end;
$$;

comment on function core_money.pay_period_unlock_via_break_glass(uuid, text) is
  'Master-plan §1.6 + §1.15: intern RPC kun callable via break_glass_execute-dispatcher (sætter stork.break_glass_dispatch=true). Sætter pay_periods.status=open. Final commission_snapshots bevares; re-lock håndteres via R3/R4 flag-UPDATE-mønster (compute DELETE+INSERT candidate-rows; lock UPDATE is_candidate=false).';

revoke all on function core_money.pay_period_unlock_via_break_glass(uuid, text) from public;
grant execute on function core_money.pay_period_unlock_via_break_glass(uuid, text) to service_role;
-- Ikke grant to authenticated direkte — kun via dispatcher.

-- ─── pay_period_lock_attempt(period_id): cron-vej der logger fejl ────────
-- Wrapper omkring pay_period_lock der opdaterer consecutive_lock_failures
-- i en separat transaktion ved fejl. Bruges af auto-lock-cron.

create or replace function core_money.pay_period_lock_attempt(p_period_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result core_money.pay_periods;
  v_error text;
begin
  if current_user not in ('service_role', 'supabase_admin', 'postgres') then
    raise exception 'pay_period_lock_attempt er kun callable af service-role/cron' using errcode = '42501';
  end if;

  begin
    v_result := core_money.pay_period_lock(p_period_id, 'auto_lock_default');
    return jsonb_build_object('ok', true, 'period_id', p_period_id, 'status', v_result.status);
  exception when others then
    v_error := sqlerrm;
  end;

  -- Fejl-håndtering i SEPARAT statement (autonomous transaction-like).
  -- pay_period_lock_attempt's hovedtransaktion er rullet tilbage; vi
  -- skriver bare fejl-log i en ny statement.
  perform set_config('stork.allow_pay_periods_write', 'true', true);
  perform set_config('stork.source_type', 'cron', true);
  perform set_config('stork.change_reason', 'auto_lock_failure_log', true);

  update core_money.pay_periods
     set consecutive_lock_failures = consecutive_lock_failures + 1,
         last_lock_attempt_at = now(),
         last_lock_error = v_error
   where id = p_period_id;

  return jsonb_build_object('ok', false, 'period_id', p_period_id, 'error', v_error);
end;
$$;

comment on function core_money.pay_period_lock_attempt(uuid) is
  'Cron-vej. Wrapper omkring pay_period_lock der altid returnerer jsonb-status (ok/error). Opdaterer consecutive_lock_failures + last_lock_error på fejl.';

revoke all on function core_money.pay_period_lock_attempt(uuid) from public;
grant execute on function core_money.pay_period_lock_attempt(uuid) to service_role;
