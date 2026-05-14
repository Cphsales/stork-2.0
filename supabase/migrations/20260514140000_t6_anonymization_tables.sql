-- Trin 6 / §4 trin 6: Anonymisering — tabeller + konfig.
--
-- Master-plan §1.4: UPDATE-mønster bevarer master-row evigt; PII-felter
-- erstattes med hash/placeholder. Backup-paradox (rettelse 18 A3) løses via
-- anonymization_state som autoritativ kilde til "hvad er anonymiseret" —
-- kan replayes mod restored data.
--
-- Erstatnings-strategier (§1.4):
--   blank      → '[anonymized]'
--   hash       → 'sha256:' || hex(sha256(value))
--   hash_email → 'anon-' || hex(sha256(value))[0:16] || '@anonymized.local'
--   delete_key → kun for jsonb-keys (sletter key fra jsonb-bag)
--
-- Felt-strategi er deklareret data (anonymization_mappings, UI-redigerbar),
-- ikke hardkodet i kode.

-- ─── anonymization_mappings (konfig: hvilke felter, hvilken strategi pr. entity) ──
-- no-dedup-key: konfig-tabel; (entity_type, table_schema, table_name) er natural key.
create table core_compliance.anonymization_mappings (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  table_schema text not null,
  table_name text not null,
  field_strategies jsonb not null,
  jsonb_field_strategies jsonb,
  strategy_version integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_type, table_schema, table_name)
);

comment on table core_compliance.anonymization_mappings is
  'Master-plan §1.4 anonymiserings-mapping. Pr. entity: hvilke felter, hvilken strategi. UI-redigerbar (lag F). Strategy_version bumpes ved ændring; eksisterende anonymization_state-rows bevarer deres snapshot-version.';

comment on column core_compliance.anonymization_mappings.field_strategies is
  'jsonb {"field_name": "strategy"} med strategier: blank / hash / hash_email / delete_key';

comment on column core_compliance.anonymization_mappings.jsonb_field_strategies is
  'For tabeller med jsonb felt-bag (eks. clients.fields): {"jsonb_column": {"key": "strategy"}}';

create index anonymization_mappings_lookup_idx
  on core_compliance.anonymization_mappings (entity_type, table_schema, table_name)
  where is_active = true;

alter table core_compliance.anonymization_mappings enable row level security;
alter table core_compliance.anonymization_mappings force row level security;

revoke all on table core_compliance.anonymization_mappings from public, anon, service_role;
grant select on table core_compliance.anonymization_mappings to authenticated;

create policy anonymization_mappings_select on core_compliance.anonymization_mappings
  for select to authenticated using (true);

create policy anonymization_mappings_insert on core_compliance.anonymization_mappings
  for insert to authenticated
  with check (current_setting('stork.allow_anonymization_mappings_write', true) = 'true');

create policy anonymization_mappings_update on core_compliance.anonymization_mappings
  for update to authenticated
  using (current_setting('stork.allow_anonymization_mappings_write', true) = 'true')
  with check (current_setting('stork.allow_anonymization_mappings_write', true) = 'true');

grant insert, update on table core_compliance.anonymization_mappings to authenticated;

create trigger anonymization_mappings_set_updated_at
  before update on core_compliance.anonymization_mappings
  for each row execute function core_compliance.set_updated_at();

create trigger anonymization_mappings_audit
  after insert or update on core_compliance.anonymization_mappings
  for each row execute function core_compliance.stork_audit();

-- ─── anonymization_state (immutable log af udførte anonymiseringer) ──────
-- no-dedup-key: log-tabel; (entity_type, entity_id, anonymized_at) er natural key.
create table core_compliance.anonymization_state (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  table_schema text not null,
  table_name text not null,
  entity_id uuid not null,
  anonymized_at timestamptz not null default now(),
  anonymization_reason text not null check (length(trim(anonymization_reason)) > 0),
  strategy_version integer not null,
  field_mapping_snapshot jsonb not null,
  jsonb_field_mapping_snapshot jsonb,
  audit_reference uuid,
  created_by uuid,
  unique (entity_type, entity_id)
);

comment on table core_compliance.anonymization_state is
  'Master-plan §1.4 (rettelse 18 A3) autoritativ kilde til hvad-er-anonymiseret. Immutable + evig retention. Bruges af replay_anonymization() ved backup-restore og af verify_anonymization_consistency() til drift-tjek.';

create index anonymization_state_entity_idx
  on core_compliance.anonymization_state (table_schema, table_name);
create index anonymization_state_when_idx
  on core_compliance.anonymization_state (anonymized_at desc);

alter table core_compliance.anonymization_state enable row level security;
alter table core_compliance.anonymization_state force row level security;

revoke all on table core_compliance.anonymization_state from public, authenticated, anon, service_role;
-- 0 SELECT-policies. Læsning via anonymization_state_read() RPC med is_admin().
-- Insert kun via anonymize_<entity>-RPC'er (SECURITY DEFINER kan INSERT'e uden policy).

-- Immutability: BEFORE UPDATE/DELETE blokeret.
create or replace function core_compliance.anonymization_state_immutability_check()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'anonymization_state er immutable (operation %)', tg_op
    using errcode = 'P0001';
end;
$$;

create trigger anonymization_state_immutability
  before update or delete on core_compliance.anonymization_state
  for each row execute function core_compliance.anonymization_state_immutability_check();

create trigger anonymization_state_block_truncate
  before truncate on core_compliance.anonymization_state
  for each statement execute function core_compliance.block_truncate_immutable();

create trigger anonymization_state_audit
  after insert on core_compliance.anonymization_state
  for each row execute function core_compliance.stork_audit();

-- ─── Seed: mapping for core_identity.employees ───────────────────────────
select set_config('stork.allow_anonymization_mappings_write', 'true', false);
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason', 'legacy_import_t0: t6 anonymisering — seed mapping for employees', false);

insert into core_compliance.anonymization_mappings
  (entity_type, table_schema, table_name, field_strategies, strategy_version) values
  ('employee', 'core_identity', 'employees',
   '{"first_name": "blank", "last_name": "blank", "email": "hash_email"}'::jsonb,
   1);
