-- Trin 7 / §4 trin 7: candidate-snapshot-tabeller (forberedt-aggregat-mønster).
--
-- Master-plan §1.6 + rettelse 19 C3: to-fase candidate-mønster.
--   Fase 1: pre-compute beregner aggregater til candidate-tabeller (asynkron).
--   Fase 2: lock-pipeline promoverer candidate → final (atomisk, hurtig).
--
-- pay_period_candidate_runs sporer hvilke candidate-genereringer der findes
-- og deres data_checksum (hash af source-data tilstand). Hvis live-data ændres
-- efter candidate er beregnet, er candidate stale og skal re-genereres.

-- no-dedup-key: tracker-tabel; (period_id, generated_at) er natural key.
create table core_money.pay_period_candidate_runs (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references core_money.pay_periods(id) on delete restrict,
  generated_at timestamptz not null default now(),
  generated_by uuid references core_identity.employees(id) on delete restrict,
  data_checksum text not null,
  data_checksum_inputs jsonb not null,
  is_current boolean not null default true,
  commission_row_count integer not null default 0,
  correction_row_count integer not null default 0,
  computation_duration_ms integer,
  created_at timestamptz not null default now()
);

comment on table core_money.pay_period_candidate_runs is
  'Master-plan §1.6 + rettelse 19 C3: tracker for candidate-genereringer. data_checksum er hash af source-data tilstand ved compute-tid; lock-pipeline sammenligner med nuværende state for at afgøre stale. is_current=false markerer ældre candidate-runs der er erstattet.';

create index pay_period_candidate_runs_period_idx on core_money.pay_period_candidate_runs (period_id, generated_at desc);
create unique index pay_period_candidate_runs_current_idx
  on core_money.pay_period_candidate_runs (period_id)
  where is_current = true;

alter table core_money.pay_period_candidate_runs enable row level security;
alter table core_money.pay_period_candidate_runs force row level security;

create policy pay_period_candidate_runs_select on core_money.pay_period_candidate_runs
  for select to authenticated
  using (core_identity.is_admin());

create policy pay_period_candidate_runs_insert on core_money.pay_period_candidate_runs
  for insert to authenticated
  with check (current_setting('stork.allow_pay_period_candidate_runs_write', true) = 'true');

create policy pay_period_candidate_runs_update on core_money.pay_period_candidate_runs
  for update to authenticated
  using (current_setting('stork.allow_pay_period_candidate_runs_write', true) = 'true')
  with check (current_setting('stork.allow_pay_period_candidate_runs_write', true) = 'true');

revoke all on table core_money.pay_period_candidate_runs from public, anon, service_role;
grant select, insert, update on table core_money.pay_period_candidate_runs to authenticated;

create trigger pay_period_candidate_runs_audit
  after insert or update on core_money.pay_period_candidate_runs
  for each row execute function core_compliance.stork_audit();

-- ─── commission_snapshots_candidate (mutable, pre-compute output) ─────────
-- no-dedup-key: candidate-tabel; (candidate_run_id, sale_id, employee_id) er natural key.
create table core_money.commission_snapshots_candidate (
  id uuid primary key default gen_random_uuid(),
  candidate_run_id uuid not null references core_money.pay_period_candidate_runs(id) on delete cascade,
  period_id uuid not null references core_money.pay_periods(id) on delete restrict,
  employee_id uuid not null references core_identity.employees(id) on delete restrict,
  sale_id uuid not null,
  amount numeric(12, 2) not null,
  status_at_lock text not null,
  created_at timestamptz not null default now(),
  constraint commission_snapshots_candidate_unique unique (candidate_run_id, sale_id, employee_id)
);

comment on table core_money.commission_snapshots_candidate is
  'Master-plan §1.6 + rettelse 19 C3: candidate provision-snapshots. Mutable — kan re-genereres ubegrænset. Promoveres til core_money.commission_snapshots ved lock. CASCADE-delete fra candidate_run for nem opryd.';

create index commission_snapshots_candidate_period_idx on core_money.commission_snapshots_candidate (period_id);
create index commission_snapshots_candidate_run_idx on core_money.commission_snapshots_candidate (candidate_run_id);

alter table core_money.commission_snapshots_candidate enable row level security;
alter table core_money.commission_snapshots_candidate force row level security;

create policy commission_snapshots_candidate_select on core_money.commission_snapshots_candidate
  for select to authenticated
  using (core_identity.is_admin());

create policy commission_snapshots_candidate_insert on core_money.commission_snapshots_candidate
  for insert to authenticated
  with check (current_setting('stork.allow_commission_snapshots_candidate_write', true) = 'true');

create policy commission_snapshots_candidate_delete on core_money.commission_snapshots_candidate
  for delete to authenticated
  using (current_setting('stork.allow_commission_snapshots_candidate_write', true) = 'true');

revoke all on table core_money.commission_snapshots_candidate from public, anon, service_role;
grant select, insert, delete on table core_money.commission_snapshots_candidate to authenticated;

-- Candidate-tabeller auditeres ikke pr. row (kan re-genereres tusindvis af gange).
-- Audit fanges på pay_period_candidate_runs som operationel handling.

-- ─── salary_corrections_candidate (mutable, pre-compute output) ───────────
-- no-dedup-key: candidate-tabel; FK + amount + reason er natural key.
create table core_money.salary_corrections_candidate (
  id uuid primary key default gen_random_uuid(),
  candidate_run_id uuid not null references core_money.pay_period_candidate_runs(id) on delete cascade,
  target_period_id uuid not null references core_money.pay_periods(id) on delete restrict,
  source_sale_id uuid,
  source_period_id uuid references core_money.pay_periods(id) on delete restrict,
  amount numeric(12, 2) not null check (amount <> 0),
  reason text not null check (reason in ('cancellation', 'cancellation_reversal', 'kurv_correction', 'manual_error', 'other')),
  description text,
  source_cancellation_id uuid references core_money.cancellations(id) on delete restrict,
  created_by uuid references core_identity.employees(id) on delete restrict,
  created_at timestamptz not null default now()
);

comment on table core_money.salary_corrections_candidate is
  'Master-plan §1.6 + rettelse 19 C3: candidate salary-corrections. Mutable; promoveres til core_money.salary_corrections ved lock.';

create index salary_corrections_candidate_target_idx on core_money.salary_corrections_candidate (target_period_id);
create index salary_corrections_candidate_run_idx on core_money.salary_corrections_candidate (candidate_run_id);

alter table core_money.salary_corrections_candidate enable row level security;
alter table core_money.salary_corrections_candidate force row level security;

create policy salary_corrections_candidate_select on core_money.salary_corrections_candidate
  for select to authenticated
  using (core_identity.is_admin());

create policy salary_corrections_candidate_insert on core_money.salary_corrections_candidate
  for insert to authenticated
  with check (current_setting('stork.allow_salary_corrections_candidate_write', true) = 'true');

create policy salary_corrections_candidate_delete on core_money.salary_corrections_candidate
  for delete to authenticated
  using (current_setting('stork.allow_salary_corrections_candidate_write', true) = 'true');

revoke all on table core_money.salary_corrections_candidate from public, anon, service_role;
grant select, insert, delete on table core_money.salary_corrections_candidate to authenticated;
