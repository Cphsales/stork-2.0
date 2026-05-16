-- H024: pre-cutover test-artefakt cleanup.
--
-- Rydder ~382 stale test-rows på tværs af 7 tabeller via marker-based DELETE
-- + DISABLE/ENABLE TRIGGER pattern. One-shot pre-cutover; ingen permanent
-- bypass-infrastruktur. Mathias-godkendt DISABLE TRIGGER-pattern (qwerg
-- 2026-05-16 på plan V2 / commit 38c4574).
--
-- Bevarede rows (ekspliciteret af krav-dok + V2-plan tolkning b):
--   - 3 reelle pay_periods (2026-04-15..2026-07-14 status=open)
--   - 1 reel candidate_run (e8070819 paired with f4c86616 reelle pay_period)
--   - 0 cancellations (allerede tom)
--
-- Audit-spor pr. tabel:
--   - pay_periods: AFTER DELETE-trigger fyrer; row-level audit_log skrives ✓
--   - commission_snapshots: audit-EXEMPT post-R3 (audit-trigger droppet i
--     20260515090000_r3_r4_*); audit-spor = denne fil + commit-hash + NOTICE.
--   - salary_corrections: AFTER INSERT-only; DELETE-spor = denne fil + NOTICE.
--   - candidate_runs: ingen immutability/audit-trigger; sporbar via migration.
--   - anonymization_state: AFTER INSERT-only; DELETE-spor = denne fil + NOTICE.
--   - anonymization_strategies: AFTER INSERT/UPDATE/DELETE-trigger fyrer ✓.
--   - employees: AFTER INSERT/UPDATE/DELETE-trigger fyrer ✓.

set local stork.source_type = 'migration';
set local stork.change_reason = 'H024: pre-cutover test-artefakt cleanup';

-- =========================================================================
-- Step 1: Capture clean-target pay_period IDs til temp-table
-- =========================================================================
-- Vi capturer FØR vi sletter pay_period_candidate_runs, da data_checksum-marker
-- kun virker mens candidate_runs eksisterer.
create temp table h024_pay_period_clean_targets as
select p.id, p.start_date, p.end_date, p.status
from core_money.pay_periods p
where (p.start_date = '2020-01-15' and p.end_date = '2020-02-14' and p.status = 'locked')
   or p.id in (
     select period_id from core_money.pay_period_candidate_runs
     where data_checksum in ('r3-smoke-checksum', 'test-checksum')
   );

-- Pre-precondition: forventet count og reelle bevares
do $h024_pre$
declare
  v_target_count int;
  v_preserved_count int;
begin
  select count(*) into v_target_count from h024_pay_period_clean_targets;
  if v_target_count < 27 then
    raise exception 'H024 precondition fejlet: pay_period clean-targets = % (forventet >= 27 — 1 G017 + 1 tidlig + >=25 R3-smoke)', v_target_count;
  end if;
  raise notice 'H024: pay_period clean-target count = %', v_target_count;

  select count(*) into v_preserved_count from core_money.pay_periods
   where status = 'open' and start_date between '2026-04-15' and '2026-06-15'
     and id not in (select id from h024_pay_period_clean_targets);
  if v_preserved_count <> 3 then
    raise exception 'H024 precondition fejlet: reelle pay_periods = % (forventet 3)', v_preserved_count;
  end if;
  raise notice 'H024: reelle pay_periods preserved = %', v_preserved_count;
end;
$h024_pre$;

-- =========================================================================
-- Step 2: DELETE commission_snapshots (FK child of pay_periods + candidate_runs)
-- =========================================================================
-- Audit-exempt post-R3; audit-spor = denne fil + NOTICE.
alter table core_money.commission_snapshots disable trigger commission_snapshots_immutability;
do $h024_snapshots$
declare v_count int;
begin
  delete from core_money.commission_snapshots
   where period_id in (select id from h024_pay_period_clean_targets);
  get diagnostics v_count = row_count;
  raise notice 'H024: commission_snapshots deleted = %', v_count;
end;
$h024_snapshots$;
alter table core_money.commission_snapshots enable trigger commission_snapshots_immutability;

-- =========================================================================
-- Step 3: DELETE salary_corrections (FK child of pay_periods + marker-based)
-- =========================================================================
-- AFTER INSERT-only audit; DELETE-spor = denne fil + NOTICE.
alter table core_money.salary_corrections disable trigger salary_corrections_immutability;
do $h024_salary$
declare v_count int;
begin
  delete from core_money.salary_corrections
   where (description = 'smoke test' and amount = -100.00 and reason = 'cancellation')
      or target_period_id in (select id from h024_pay_period_clean_targets);
  get diagnostics v_count = row_count;
  raise notice 'H024: salary_corrections deleted = %', v_count;
end;
$h024_salary$;
alter table core_money.salary_corrections enable trigger salary_corrections_immutability;

-- =========================================================================
-- Step 4: DELETE pay_period_candidate_runs (FK child of pay_periods)
-- =========================================================================
-- Ingen immutability-trigger; DELETE direkte. Marker = data_checksum + cluster.
do $h024_runs$
declare v_count int;
begin
  delete from core_money.pay_period_candidate_runs
   where data_checksum in ('r3-smoke-checksum', 'test-checksum')
      or period_id in (select id from h024_pay_period_clean_targets);
  get diagnostics v_count = row_count;
  raise notice 'H024: candidate_runs deleted = %', v_count;
end;
$h024_runs$;

-- =========================================================================
-- Step 5: DELETE pay_periods
-- =========================================================================
-- AFTER DELETE-trigger fyrer; row-level audit_log skrives.
alter table core_money.pay_periods disable trigger pay_periods_lock_and_delete_check;
do $h024_periods$
declare v_count int;
begin
  delete from core_money.pay_periods
   where id in (select id from h024_pay_period_clean_targets);
  get diagnostics v_count = row_count;
  raise notice 'H024: pay_periods deleted = %', v_count;
end;
$h024_periods$;
alter table core_money.pay_periods enable trigger pay_periods_lock_and_delete_check;

-- =========================================================================
-- Step 6: DELETE anonymization_state (C002 test row)
-- =========================================================================
-- AFTER INSERT-only audit; DELETE-spor = denne fil + NOTICE.
alter table core_compliance.anonymization_state disable trigger anonymization_state_immutability;
do $h024_anon_state$
declare v_count int;
begin
  delete from core_compliance.anonymization_state
   where anonymization_reason = 'C002 test: retention via cron';
  get diagnostics v_count = row_count;
  raise notice 'H024: anonymization_state deleted = %', v_count;
end;
$h024_anon_state$;
alter table core_compliance.anonymization_state enable trigger anonymization_state_immutability;

-- =========================================================================
-- Step 7: DELETE anonymization_strategies (test5 + p1a_smoke_t5_*)
-- =========================================================================
-- Lifecycle-trigger blokerer DELETE for status<>'draft'. DISABLE midlertidigt.
alter table core_compliance.anonymization_strategies disable trigger anonymization_strategies_delete_check;
do $h024_strategies$
declare v_count int;
begin
  delete from core_compliance.anonymization_strategies
   where strategy_name = 'test5' or strategy_name like 'p1a_smoke_t5_%';
  get diagnostics v_count = row_count;
  raise notice 'H024: anonymization_strategies deleted = %', v_count;
end;
$h024_strategies$;
alter table core_compliance.anonymization_strategies enable trigger anonymization_strategies_delete_check;

-- =========================================================================
-- Step 8: DELETE G017 anonymized test-employee
-- =========================================================================
-- AFTER DELETE-trigger fyrer; row-level audit_log skrives.
do $h024_employee$
declare v_count int;
begin
  delete from core_identity.employees
   where first_name = '[anonymized]'
     and last_name = '[anonymized]'
     and email like 'anon-%@anonymized.local'
     and termination_date = '2020-05-14';
  get diagnostics v_count = row_count;
  raise notice 'H024: anonymized test-employees deleted = %', v_count;
end;
$h024_employee$;

-- =========================================================================
-- Step 9: Final post-conditions
-- =========================================================================
do $h024_post$
declare
  v_remaining int;
begin
  -- G017 pay_period should be gone
  select count(*) into v_remaining from core_money.pay_periods
   where start_date = '2020-01-15' and end_date = '2020-02-14' and status = 'locked';
  if v_remaining <> 0 then
    raise exception 'H024 post-condition fejlet: G017 pay_period remaining = %', v_remaining;
  end if;

  -- 3 reelle pay_periods bevared
  select count(*) into v_remaining from core_money.pay_periods
   where status = 'open' and start_date between '2026-04-15' and '2026-06-15';
  if v_remaining <> 3 then
    raise exception 'H024 post-condition fejlet: reelle pay_periods = % (forventet 3)', v_remaining;
  end if;

  -- Mindst 1 reel candidate_run bevared
  select count(*) into v_remaining from core_money.pay_period_candidate_runs
   where data_checksum not in ('r3-smoke-checksum', 'test-checksum');
  if v_remaining < 1 then
    raise exception 'H024 post-condition fejlet: reelle candidate_runs remaining = %', v_remaining;
  end if;

  raise notice 'H024 cleanup complete. Reelle bevared: 3 pay_periods + % candidate_run(s)', v_remaining;
end;
$h024_post$;

-- Cleanup temp-table (auto-droppes ved transaction-end, men eksplicit for klarhed)
drop table h024_pay_period_clean_targets;
