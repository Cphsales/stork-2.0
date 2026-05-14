-- R3 + R4 (atomisk): commission_snapshots UPDATE-flag-refactor +
-- salary_corrections_candidate-rensning.
--
-- BAGGRUND (master-plan §1.6 + rettelser 22 + 23):
-- Pre-R3 (legacy): compute_candidate INSERT'er til commission_snapshots_candidate;
-- lock INSERT'er kopier til commission_snapshots. To-tabel-mønster med snapshot-
-- replikering.
-- Post-R3 (UPDATE-flag): compute_candidate INSERT'er direkte i commission_snapshots
-- med is_candidate=true + candidate_run_id=<run>. Lock UPDATE'r is_candidate=false
-- + candidate_run_id=null. Én tabel, idempotent recompute via DELETE-WHERE-flag.
--
-- DESIGN-VALG (godkendt af Mathias 2026-05-15):
-- - R3: Drop stork_audit-trigger helt; AUDIT_EXEMPT_SNAPSHOT_TABLES forklarer
--   fraværet (master-plan rettelse 23). State-overgange spores via flag-kolonner
--   + periode-lock-audit på pay_periods.
-- - R3: Backfill is_candidate=false for eksisterende rows (DEFAULT håndterer
--   automatisk; rows pre-R3 var allerede 'locked' via INSERT-kopi-flow).
-- - R3: Conditional immutability via jsonb-subtraktion (Fund 3):
--     to_jsonb(NEW) - flag-keys = to_jsonb(OLD) - flag-keys
-- - R3: Idempotent recompute via DELETE candidate-rows før INSERT (Fund 22).
-- - R4: salary_corrections_candidate-INSERT fjernes fra compute (dead code).
--   _candidate-tabellen selv beholdes indtil R6.
--
-- FUND-INTEGRATION:
-- - Fund 3+22: conditional immutability + idempotent recompute
-- - Fund 4: UPDATE-policy + GRANT UPDATE til authenticated

-- ─── R3.1: Tilføj flag-kolonner ────────────────────────────────────────────
-- no-dedup-key: commission_snapshots har eksisterende GRANDFATHERED_NO_DEDUP_KEY.
alter table core_money.commission_snapshots
  add column is_candidate boolean not null default false,
  add column candidate_run_id uuid references core_money.pay_period_candidate_runs(id);

-- Index-navn er kollisions-sikkert (legacy commission_snapshots_candidate
-- har commission_snapshots_candidate_run_idx — droppes i R6).
create index commission_snapshots_main_candidate_run_idx
  on core_money.commission_snapshots (candidate_run_id, period_id)
  where is_candidate = true;

comment on column core_money.commission_snapshots.is_candidate is
  'R3: true = candidate-tilstand (kan slettes/recomputeres); false = locked snapshot.';
comment on column core_money.commission_snapshots.candidate_run_id is
  'R3: FK til pay_period_candidate_runs (kun set når is_candidate=true).';

-- ─── R3.2: Drop stork_audit-trigger ────────────────────────────────────────
-- AUDIT_EXEMPT_SNAPSHOT_TABLES (scripts/fitness.mjs) dokumenterer fraværet.
drop trigger if exists commission_snapshots_audit on core_money.commission_snapshots;

-- ─── R3.3: Replace immutability-check med conditional jsonb-subtraktion ────
create or replace function core_money.commission_snapshots_immutability_check()
returns trigger
language plpgsql
set search_path = ''
as $func$
declare
  v_old jsonb;
  v_new jsonb;
begin
  if tg_op = 'DELETE' then
    if old.is_candidate then
      return old;  -- DELETE tilladt på candidate-rows (Fund 22 idempotent recompute)
    end if;
    raise exception 'commission_snapshots[%]: locked rows er immutable (is_candidate=false)', old.id
      using errcode = 'P0001';
  end if;
  -- UPDATE: kun is_candidate + candidate_run_id må ændres
  v_old := to_jsonb(old) - 'is_candidate' - 'candidate_run_id';
  v_new := to_jsonb(new) - 'is_candidate' - 'candidate_run_id';
  if v_old <> v_new then
    raise exception 'commission_snapshots[%]: kun is_candidate/candidate_run_id maa muteres (Fund 3 conditional immutability)', old.id
      using errcode = 'P0001';
  end if;
  return new;
end;
$func$;

comment on function core_money.commission_snapshots_immutability_check() is
  'R3: conditional immutability via jsonb-subtraktion. UPDATE: kun flag-kolonner. DELETE: kun candidate-rows.';

-- ─── R3.4: UPDATE-policy + GRANT (Fund 4) ──────────────────────────────────
create policy commission_snapshots_update_flag on core_money.commission_snapshots
  for update to authenticated
  using (current_setting('stork.allow_commission_snapshots_flag_update', true) = 'true')
  with check (current_setting('stork.allow_commission_snapshots_flag_update', true) = 'true');

create policy commission_snapshots_delete_candidate on core_money.commission_snapshots
  for delete to authenticated
  using (
    is_candidate = true
    and current_setting('stork.allow_commission_snapshots_candidate_delete', true) = 'true'
  );

grant update, delete on table core_money.commission_snapshots to authenticated;

-- ─── R3.5: Klassifikation af nye kolonner ──────────────────────────────────
-- Per D2: commission_snapshots forretningsdata har retention_type=NULL (default).
-- is_candidate + candidate_run_id er operationelle flag, samme retention.
select set_config('stork.source_type', 'migration', false);
select set_config('stork.allow_data_field_definitions_write', 'true', false);
select set_config('stork.change_reason',
  'R3: klassifikation af commission_snapshots flag-kolonner', false);

insert into core_compliance.data_field_definitions
  (table_schema, table_name, column_name, category, pii_level, retention_type, retention_value, match_role, purpose) values
  ('core_money', 'commission_snapshots', 'is_candidate', 'operationel', 'none', null, null, null,
    'R3: true=candidate-tilstand (kan slettes/recomputeres); false=locked snapshot'),
  ('core_money', 'commission_snapshots', 'candidate_run_id', 'operationel', 'none', null, null, null,
    'R3: FK til pay_period_candidate_runs naar is_candidate=true')
on conflict (table_schema, table_name, column_name) do nothing;

-- ─── R3.6 + R4: Refactor _pay_period_compute_candidate_internal ────────────
-- Ændringer:
-- (a) Idempotent recompute: DELETE candidate-rows for period inden INSERT (Fund 22).
-- (b) INSERT'er nu direkte i commission_snapshots med is_candidate=true (ikke til _candidate).
-- (c) salary_corrections_candidate-INSERT fjernes (R4 cleanup — dead-code).

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

  select pp.id, pp.status, pp.start_date, pp.end_date
    into v_period
    from core_money.pay_periods pp where pp.id = p_period_id;
  if v_period.id is null then
    raise exception 'pay_period ikke fundet: %', p_period_id using errcode = 'P0002';
  end if;
  if v_period.status <> 'open' then
    raise exception 'pay_period % er ikke open (status=%)', p_period_id, v_period.status
      using errcode = 'P0001';
  end if;

  select * into v_checksum_row from core_money._compute_period_data_checksum(p_period_id);

  -- (a) Idempotent recompute: ryd tidligere candidate-rows for denne periode (Fund 22)
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

  -- (b) INSERT candidate-rows direkte i commission_snapshots med is_candidate=true
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

  -- (c) R4: salary_corrections_candidate-INSERT er fjernet (dead-code).
  -- Korrektioner ligger allerede i salary_corrections-master-tabellen og
  -- tæller via row_count på matching target_period_id.
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

-- ─── R3.7: Refactor _pay_period_lock_internal ──────────────────────────────
-- Ændring: kopierings-INSERT erstattes med flag-UPDATE.

create or replace function core_money._pay_period_lock_internal(
  p_period_id uuid, p_change_reason text
)
returns core_money.pay_periods
language plpgsql security definer set search_path = ''
set statement_timeout to '5min'
as $function$
declare
  v_period record;
  v_run core_money.pay_period_candidate_runs;
  v_live_checksum_row record;
  v_result core_money.pay_periods;
  v_locked_count integer;
begin
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;

  select * into v_period from core_money.pay_periods where id = p_period_id for update;
  if v_period.id is null then
    raise exception 'pay_period ikke fundet: %', p_period_id using errcode = 'P0002';
  end if;
  if v_period.status <> 'open' then
    raise exception 'pay_period % er ikke open (status=%)', p_period_id, v_period.status
      using errcode = 'P0001';
  end if;

  select * into v_run from core_money.pay_period_candidate_runs
   where period_id = p_period_id and is_current = true;

  select * into v_live_checksum_row from core_money._compute_period_data_checksum(p_period_id);

  if v_run.id is null then
    v_run := core_money._pay_period_compute_candidate_internal(
      p_period_id, 'inline_compute_at_lock: ' || p_change_reason);
  elsif v_run.data_checksum <> v_live_checksum_row.checksum then
    v_run := core_money._pay_period_compute_candidate_internal(
      p_period_id, 'stale_recompute_at_lock: ' || p_change_reason);
  end if;

  -- R3: lock = flag-UPDATE (ikke INSERT-copy)
  perform set_config('stork.allow_commission_snapshots_flag_update', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason',
    'R3 lock flag-update: ' || p_change_reason, true);

  update core_money.commission_snapshots
     set is_candidate = false,
         candidate_run_id = null
   where candidate_run_id = v_run.id;

  get diagnostics v_locked_count = row_count;
  if v_locked_count <> v_run.commission_row_count then
    raise exception 'lock-mismatch: forventede % candidate-rows men UPDATE'' ramte %', v_run.commission_row_count, v_locked_count
      using errcode = 'P0001';
  end if;

  perform set_config('stork.allow_pay_periods_write', 'true', true);
  update core_money.pay_periods
     set status = 'locked', consecutive_lock_failures = 0,
         last_lock_attempt_at = now(), last_lock_error = null
   where id = p_period_id
   returning * into v_result;

  return v_result;
end;
$function$;
