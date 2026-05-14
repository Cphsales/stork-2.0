-- Trin 7 / §4 trin 7: commission_snapshots (immutable frosne tal ved lock).
--
-- Master-plan §1.6 + §2.1: provision-snapshot pr. (period, sale, employee).
-- UNIQUE-key tillader provision-split mellem flere medarbejdere på samme salg.
-- INSERT-only — promoveres fra commission_snapshots_candidate ved lock.
--
-- FK på pay_periods. FK på sales + employees deferred til trin 14/15 hvor
-- sales-tabel og identitets-master tilføjes (vi har employees nu, men sales
-- kommer senere).

-- no-dedup-key: snapshot-tabel; UNIQUE(period, sale, employee) er natural key.
create table core_money.commission_snapshots (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references core_money.pay_periods(id) on delete restrict,
  employee_id uuid not null references core_identity.employees(id) on delete restrict,
  sale_id uuid not null,
  amount numeric(12, 2) not null,
  status_at_lock text not null,
  created_at timestamptz not null default now(),
  constraint commission_snapshots_unique unique (period_id, sale_id, employee_id)
);

comment on table core_money.commission_snapshots is
  'Master-plan §1.6 + §2.1: immutable frosne provision-tal ved pay_period lock. UNIQUE(period, sale, employee) tillader provision-split (samme salg → flere medarbejdere). INSERT-only via lock-pipeline. sale_id FK aktiveres i trin 14 (sales-stamme).';

create index commission_snapshots_period_idx on core_money.commission_snapshots (period_id);
create index commission_snapshots_employee_idx on core_money.commission_snapshots (employee_id);
create index commission_snapshots_sale_idx on core_money.commission_snapshots (sale_id);

-- Immutability + truncate-block
create or replace function core_money.commission_snapshots_immutability_check()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'commission_snapshots[%]: er immutable — kun INSERT tillades, ingen UPDATE/DELETE', old.id
    using errcode = 'P0001';
end;
$$;

create trigger commission_snapshots_immutability
  before update or delete on core_money.commission_snapshots
  for each row execute function core_money.commission_snapshots_immutability_check();

create trigger commission_snapshots_block_truncate
  before truncate on core_money.commission_snapshots
  for each statement execute function core_compliance.block_truncate_immutable();

create trigger commission_snapshots_audit
  after insert on core_money.commission_snapshots
  for each row execute function core_compliance.stork_audit();

alter table core_money.commission_snapshots enable row level security;
alter table core_money.commission_snapshots force row level security;

create policy commission_snapshots_insert on core_money.commission_snapshots
  for insert to authenticated
  with check (current_setting('stork.allow_commission_snapshots_write', true) = 'true');

-- SELECT-policy bygges fuldt i trin 16/17 hvor scope-helpers (self/team/subtree)
-- er klar. Indtil da: admin-only via RLS (default-deny + admin-bypass).
create policy commission_snapshots_select on core_money.commission_snapshots
  for select to authenticated
  using (core_identity.is_admin());

revoke all on table core_money.commission_snapshots from public, anon, service_role;
grant select, insert on table core_money.commission_snapshots to authenticated;
