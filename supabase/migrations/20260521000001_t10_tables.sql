-- Trin 10 / §4 trin 10: clients + client_field_definitions
--
-- T10.1: core_identity.clients (greenfield — D5's public.clients droppet i T1).
-- T10.2: core_identity.client_field_definitions (global key UNIQUE; pr-klient
-- værdier i clients.fields jsonb per Mathias-pragmatik 2026-05-20).
--
-- Krav-dok-konformitet:
--  §2.4 logo-support (bytea + content_type + filename + consistency-CHECK)
--  §2.5.1 anonymiseres ikke (ingen anonymized_at; ingen DELETE-policy)
--  §2.5.2 aktiv/inaktiv-livscyklus (is_active bool)
--  §2.3 felt-definitioner (key, display_name, field_type, required, pii_level,
--                          display_order, is_active)
--  §2.6.1 rettigheder i UI (has_permission-baserede policies, tab-aware 'manage')
--
-- DML-GRANT obligatorisk: T1-default-privileges giver kun execute på functions;
-- tabeller skal eksplicit grants for at RLS-policies + session-vars kan tage over.

-- ─────────────────────────────────────────────────────────────────────────
-- T10.1: core_identity.clients
-- ─────────────────────────────────────────────────────────────────────────

-- no-dedup-key: master-data; id er stable PK. Klient-rækker bevares evigt
-- (krav-dok §2.5.1: ikke-anonymiseret), inaktivering via is_active=false.
create table core_identity.clients (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (length(trim(name)) > 0),
  fields        jsonb not null default '{}'::jsonb,
  is_active     boolean not null default true,
  logo_bytes    bytea,
  logo_content_type text,
  logo_filename text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- fields skal være jsonb object — scalar/array forhindres (V2 KRITISK)
  constraint clients_fields_is_object check (jsonb_typeof(fields) = 'object'),
  -- logo-felter sættes alle eller intet (V3 KRITISK-SIKKERHEDSHUL)
  constraint clients_logo_consistency check (
    (logo_bytes is null and logo_content_type is null and logo_filename is null)
    or
    (logo_bytes is not null and logo_content_type is not null and logo_filename is not null)
  )
);

comment on table core_identity.clients is
  'Trin 10: klient-master. name er identifikator; fields jsonb indeholder pr-klient værdier per client_field_definitions. is_active toggle erstatter DELETE (krav-dok §2.5.2). Logo som bytea (krav-dok §2.4). Klient anonymiseres ikke (krav-dok §2.5.1) — derfor ingen anonymized_at-kolonne.';

create index clients_active_idx on core_identity.clients (id) where is_active = true;

create trigger clients_set_updated_at
  before update on core_identity.clients
  for each row execute function core_compliance.set_updated_at();

create trigger clients_audit
  after insert or update or delete on core_identity.clients
  for each row execute function core_compliance.stork_audit();

alter table core_identity.clients enable row level security;
alter table core_identity.clients force row level security;

revoke all on table core_identity.clients from public, anon, service_role;
grant select on table core_identity.clients to authenticated;
-- DML-GRANT obligatorisk (Codex V4 KRITISK): RLS-policy + session-var
-- kan ikke virke før DML-GRANT er på plads. Ingen DELETE-grant — inaktivering
-- via is_active=false (krav-dok §2.5.2).
grant insert, update on table core_identity.clients to authenticated;

-- SELECT-policy: tab-aware has_permission ('manage'). T10.13 seeder kun
-- tab-grants → null-tab matcher ikke; 'manage' matcher.
create policy clients_select on core_identity.clients
  for select to authenticated
  using (core_identity.has_permission('clients', 'manage', false));

create policy clients_insert on core_identity.clients
  for insert to authenticated
  with check (current_setting('stork.allow_clients_write', true) = 'true');

create policy clients_update on core_identity.clients
  for update to authenticated
  using (current_setting('stork.allow_clients_write', true) = 'true')
  with check (current_setting('stork.allow_clients_write', true) = 'true');

-- DELETE: ingen policy = default deny. Inaktiver via is_active=false.

-- ─────────────────────────────────────────────────────────────────────────
-- T10.2: core_identity.client_field_definitions
-- ─────────────────────────────────────────────────────────────────────────

-- no-dedup-key: konfig-tabel; key er natural key (UNIQUE). Inaktiveres
-- via is_active=false, slettes ikke (krav-dok §2.3.2 udfasede felter bevares).
create table core_identity.client_field_definitions (
  id            uuid primary key default gen_random_uuid(),
  key           text not null unique check (length(trim(key)) > 0),
  display_name  text not null check (length(trim(display_name)) > 0),
  field_type    text not null check (length(trim(field_type)) > 0),
  required      boolean not null default false,
  pii_level     text not null check (pii_level in ('none', 'indirect', 'direct')),
  display_order integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table core_identity.client_field_definitions is
  'Trin 10: global registry af klient-felt-definitioner. key er jsonb-property-name i clients.fields; UNIQUE globalt (Mathias-pragmatik 2026-05-20: ligeglad med listestruktur så længe forretningsgangen overholdes). field_type er fri-tekst (UI håndhæver format). pii_level styrer hash i audit_filter_values for clients.fields-jsonb-walking. Udfasede felter sættes is_active=false (krav-dok §2.3.2: ikke DELETE).';

create index client_field_definitions_active_idx
  on core_identity.client_field_definitions (key, display_order)
  where is_active = true;

create index client_field_definitions_direct_pii_idx
  on core_identity.client_field_definitions (key)
  where pii_level = 'direct' and is_active = true;

create trigger client_field_definitions_set_updated_at
  before update on core_identity.client_field_definitions
  for each row execute function core_compliance.set_updated_at();

create trigger client_field_definitions_audit
  after insert or update or delete on core_identity.client_field_definitions
  for each row execute function core_compliance.stork_audit();

alter table core_identity.client_field_definitions enable row level security;
alter table core_identity.client_field_definitions force row level security;

revoke all on table core_identity.client_field_definitions from public, anon, service_role;
grant select on table core_identity.client_field_definitions to authenticated;
-- DML-GRANT obligatorisk for write-RPC-veje (Codex V4 KRITISK).
grant insert, update on table core_identity.client_field_definitions to authenticated;

-- SELECT-policy: tab-aware has_permission ('manage').
create policy client_field_definitions_select on core_identity.client_field_definitions
  for select to authenticated
  using (core_identity.has_permission('client_field_definitions', 'manage', false));

create policy client_field_definitions_insert on core_identity.client_field_definitions
  for insert to authenticated
  with check (current_setting('stork.allow_client_field_definitions_write', true) = 'true');

create policy client_field_definitions_update on core_identity.client_field_definitions
  for update to authenticated
  using (current_setting('stork.allow_client_field_definitions_write', true) = 'true')
  with check (current_setting('stork.allow_client_field_definitions_write', true) = 'true');

-- DELETE: ingen policy = default deny. Inaktiver via is_active=false.
