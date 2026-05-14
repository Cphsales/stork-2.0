-- Trin 7 / §4 trin 7: salary_corrections (immutable kompenserings-modposter).
--
-- Master-plan §1.6 + §2.1: salary-corrections for åbne perioder. Append-only.
-- Target_period_id må ikke være låst ved INSERT. Source_cancellation_id FK
-- aktiveres efter cancellations-skeleton-tabellen er oprettet.

-- no-dedup-key: snapshot/correction-tabel; FK-relations er natural key.
create table core_money.salary_corrections (
  id uuid primary key default gen_random_uuid(),
  target_period_id uuid not null references core_money.pay_periods(id) on delete restrict,
  source_sale_id uuid,
  source_period_id uuid references core_money.pay_periods(id) on delete restrict,
  amount numeric(12, 2) not null,
  reason text not null,
  description text,
  source_cancellation_id uuid,
  created_at timestamptz not null default now(),
  created_by uuid references core_identity.employees(id) on delete restrict,
  constraint salary_corrections_reason_check
    check (reason in ('cancellation', 'cancellation_reversal', 'kurv_correction', 'manual_error', 'other')),
  constraint salary_corrections_amount_nonzero check (amount <> 0),
  constraint salary_corrections_reason_sign_check check (
    (reason = 'cancellation' and amount < 0) or
    (reason = 'cancellation_reversal' and amount > 0) or
    (reason in ('kurv_correction', 'manual_error', 'other'))
  )
);

comment on table core_money.salary_corrections is
  'Master-plan §1.6 + §2.1: immutable lønkorrektioner. Append-only. Rollback sker via ny correction-række (reason=cancellation_reversal). target_period_id skal være open ved INSERT. source_period_id nullable hvis original ikke har frossen snapshot endnu. source_cancellation_id FK aktiveres efter cancellations-tabel eksisterer.';

create index salary_corrections_target_idx on core_money.salary_corrections (target_period_id);
create index salary_corrections_source_sale_idx on core_money.salary_corrections (source_sale_id);
create index salary_corrections_source_period_idx on core_money.salary_corrections (source_period_id);
create index salary_corrections_source_cancellation_idx on core_money.salary_corrections (source_cancellation_id);
create index salary_corrections_created_by_idx on core_money.salary_corrections (created_by);

-- ─── Validér target_period_id er open ved INSERT ─────────────────────────
create or replace function core_money.salary_corrections_validate_target()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare v_status text;
begin
  select status into v_status from core_money.pay_periods where id = new.target_period_id;
  if v_status is null then
    raise exception 'salary_corrections: target_period_id % ikke fundet', new.target_period_id
      using errcode = 'P0002';
  end if;
  if v_status <> 'open' then
    raise exception 'salary_corrections: target_period_id % er ikke open (status=%)', new.target_period_id, v_status
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger salary_corrections_validate_target
  before insert on core_money.salary_corrections
  for each row execute function core_money.salary_corrections_validate_target();

-- ─── Immutability + truncate-block ───────────────────────────────────────
create or replace function core_money.salary_corrections_immutability_check()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'salary_corrections[%]: er immutable — INSERT-only', old.id
    using errcode = 'P0001';
end;
$$;

create trigger salary_corrections_immutability
  before update or delete on core_money.salary_corrections
  for each row execute function core_money.salary_corrections_immutability_check();

create trigger salary_corrections_block_truncate
  before truncate on core_money.salary_corrections
  for each statement execute function core_compliance.block_truncate_immutable();

create trigger salary_corrections_audit
  after insert on core_money.salary_corrections
  for each row execute function core_compliance.stork_audit();

alter table core_money.salary_corrections enable row level security;
alter table core_money.salary_corrections force row level security;

create policy salary_corrections_insert on core_money.salary_corrections
  for insert to authenticated
  with check (current_setting('stork.allow_salary_corrections_write', true) = 'true');

-- SELECT: admin indtil scope-helpers (trin 16/17).
create policy salary_corrections_select on core_money.salary_corrections
  for select to authenticated
  using (core_identity.is_admin());

revoke all on table core_money.salary_corrections from public, anon, service_role;
grant select, insert on table core_money.salary_corrections to authenticated;
