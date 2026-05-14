-- Trin 7 / §4 trin 7: cancellations-skabelon (immutable, INSERT-only).
--
-- Master-plan §2.1.3 cancellations. Skeleton i trin 7: tabel-struktur og
-- immutability-trigger. INGEN RPC'er og INGEN faktiske rows endnu —
-- cancellation-handlinger + dispatcher bygges i trin 16 (sale_apply_feedback
-- + rejections + basket_corrections).
--
-- FK på sales aktiveres trin 14. FK på cancellations (reverses_cancellation_id
-- self-FK) er aktiv allerede. FK til salary_corrections cross-aktiveres efter
-- begge tabeller findes.

-- no-dedup-key: feedback-tabel; (source_sale_id, reason, created_at) er natural key.
create table core_money.cancellations (
  id uuid primary key default gen_random_uuid(),
  source_sale_id uuid not null,
  target_period_id uuid references core_money.pay_periods(id) on delete restrict,
  effekt_dato date not null,
  amount numeric(12, 2) not null check (amount > 0),
  reason text not null check (reason in ('kunde_annullering', 'match_rettelse')),
  source text not null check (source in ('manual', 'excel_upload', 'crm_match', 'unknown')),
  match_id text,
  reverses_cancellation_id uuid references core_money.cancellations(id) on delete restrict,
  created_at timestamptz not null default now(),
  created_by uuid references core_identity.employees(id) on delete restrict,
  constraint cancellations_match_rettelse_requires_reverses_or_match check (
    reason <> 'match_rettelse' or (reverses_cancellation_id is not null or match_id is not null)
  )
);

comment on table core_money.cancellations is
  'Master-plan §2.1.3 cancellations skeleton (trin 7). Immutable feedback-tabel for annullerede salg. Faktiske RPC-mekanik + sale_apply_feedback-dispatcher bygges i trin 16. Sales-FK aktiveres trin 14. reason=match_rettelse bruges også som cancellation-reversal med reverses_cancellation_id.';

create index cancellations_source_sale_idx on core_money.cancellations (source_sale_id);
create index cancellations_target_period_idx on core_money.cancellations (target_period_id);
create index cancellations_reverses_idx on core_money.cancellations (reverses_cancellation_id);
create index cancellations_match_id_idx on core_money.cancellations (match_id);

-- ─── Immutability + truncate-block ───────────────────────────────────────
create or replace function core_money.cancellations_immutability_check()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'cancellations[%]: er immutable — INSERT-only (reversal via ny row med reason=match_rettelse + reverses_cancellation_id)', old.id
    using errcode = 'P0001';
end;
$$;

create trigger cancellations_immutability
  before update or delete on core_money.cancellations
  for each row execute function core_money.cancellations_immutability_check();

create trigger cancellations_block_truncate
  before truncate on core_money.cancellations
  for each statement execute function core_compliance.block_truncate_immutable();

create trigger cancellations_audit
  after insert on core_money.cancellations
  for each row execute function core_compliance.stork_audit();

alter table core_money.cancellations enable row level security;
alter table core_money.cancellations force row level security;

-- INSERT-policy: skrives kun via session-var (trin 16's RPC sætter den).
create policy cancellations_insert on core_money.cancellations
  for insert to authenticated
  with check (current_setting('stork.allow_cancellations_write', true) = 'true');

create policy cancellations_select on core_money.cancellations
  for select to authenticated
  using (core_identity.is_admin());

revoke all on table core_money.cancellations from public, anon, service_role;
grant select, insert on table core_money.cancellations to authenticated;

-- ─── Cross-FK aktivering: salary_corrections.source_cancellation_id ──────
alter table core_money.salary_corrections
  add constraint salary_corrections_source_cancellation_fkey
  foreign key (source_cancellation_id) references core_money.cancellations(id);
