-- R6: drop legacy candidate-tabeller efter R3 UPDATE-flag-refactor.
--
-- BAGGRUND:
-- Pre-R3 to-tabel-mønster brugte commission_snapshots_candidate +
-- salary_corrections_candidate som scratch-buffers under compute-fasen.
-- R3 introducerede is_candidate-flag direkte i commission_snapshots; R4
-- fjernede dead-code writes til salary_corrections_candidate. De to
-- _candidate-tabeller er nu uden formål.
--
-- BESLUTNING (Mathias 2026-05-15):
-- - Drop commission_snapshots_candidate + salary_corrections_candidate
-- - Behold pay_period_candidate_runs (run-historik med checksum + duration)
--
-- DATA-TAB: 132 + 1 rows er pre-cutover test-data. Tilhørende runs er
-- automatisk markeret is_current=false ved næste compute pr. periode (post-R3
-- compute UPDATE'r is_current=false som første step).
--
-- Markér eksisterende test-runs som is_current=false eksplicit nu, så
-- ingen fremtidig compute kan blive forvirret af stale state.

select set_config('stork.source_type', 'migration', false);
select set_config('stork.allow_pay_period_candidate_runs_write', 'true', false);
select set_config('stork.change_reason',
  'R6: deaktivér legacy candidate-runs før DROP TABLE candidate-tables', false);

update core_money.pay_period_candidate_runs
   set is_current = false
 where is_current = true;

-- Drop tabellerne (RLS-policies, triggers, indexes, FK'er fjernes automatisk)
drop table core_money.commission_snapshots_candidate;
drop table core_money.salary_corrections_candidate;

-- Fjern klassifikationer for de droppede tabeller
select set_config('stork.allow_data_field_definitions_write', 'true', false);
select set_config('stork.change_reason',
  'R6: ryd klassifikationer for droppede candidate-tabeller', false);

delete from core_compliance.data_field_definitions
 where (table_schema, table_name) in (
   ('core_money', 'commission_snapshots_candidate'),
   ('core_money', 'salary_corrections_candidate')
 );
