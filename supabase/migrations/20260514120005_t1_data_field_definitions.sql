-- Trin 1 / fundament — klassifikations-registry.
--
-- Master-plan §1.2: hver kolonne i hele systemet har eksplicit semantik.
-- 5 kategorier, 3 PII-niveauer, 4 retention-typer.
--
-- Migration-gate Phase 1: warner ved uklassificerede kolonner.
-- Phase 2 strict aktiveres senere via MIGRATION_GATE_STRICT=true.

create table core_compliance.data_field_definitions (
  id uuid primary key default gen_random_uuid(),
  table_schema text not null,
  table_name text not null,
  column_name text not null,
  category text not null check (category in (
    'operationel', 'konfiguration', 'master_data', 'audit', 'raw_payload'
  )),
  pii_level text not null check (pii_level in ('none', 'indirect', 'direct')),
  retention_type text check (retention_type in ('time_based', 'event_based', 'legal', 'manual')),
  retention_value jsonb,
  match_role text,
  purpose text not null check (length(trim(purpose)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Retention-konsistens: type+value følges ad eller begge NULL
  constraint retention_consistency check (
    (retention_type is null and retention_value is null)
    or (retention_type is not null and retention_value is not null)
  ),
  unique (table_schema, table_name, column_name)
);

comment on table core_compliance.data_field_definitions is
  'Master-plan §1.2 klassifikations-registry. Pr. (schema, table, column). UI-redigerbar (lag F). Migration-gate Phase 2 blokerer ny kolonne uden indgang.';

-- ─── Indexes ─────────────────────────────────────────────────────────────
create index data_field_definitions_table_idx
  on core_compliance.data_field_definitions (table_schema, table_name);
create index data_field_definitions_pii_idx
  on core_compliance.data_field_definitions (pii_level)
  where pii_level = 'direct';
create index data_field_definitions_category_idx
  on core_compliance.data_field_definitions (category);

-- ─── set_updated_at-helper (generelt mønster) ────────────────────────────
create or replace function core_compliance.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger data_field_definitions_set_updated_at
  before update on core_compliance.data_field_definitions
  for each row execute function core_compliance.set_updated_at();

-- ─── Retention-validation-trigger ────────────────────────────────────────
create or replace function core_compliance.data_field_definitions_validate_retention()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v jsonb := new.retention_value;
begin
  if new.retention_type is null then
    return new;
  end if;

  case new.retention_type
    when 'time_based' then
      if not (v ? 'max_days' and (v->>'max_days') ~ '^\d+$') then
        raise exception 'time_based retention_value kræver {"max_days": <int>}, fik %', v
          using errcode = '22023';
      end if;
    when 'event_based' then
      if not (v ? 'event' and v ? 'days_after' and (v->>'days_after') ~ '^\d+$') then
        raise exception 'event_based retention_value kræver {"event": <text>, "days_after": <int>}, fik %', v
          using errcode = '22023';
      end if;
    when 'legal' then
      if not (v ? 'max_days' and (v->>'max_days') ~ '^\d+$') then
        raise exception 'legal retention_value kræver {"max_days": <int>}, fik %', v
          using errcode = '22023';
      end if;
    when 'manual' then
      if not (v ? 'max_days' or v ? 'event') then
        raise exception 'manual retention_value kræver {"max_days": <int>} eller {"event": <text>}, fik %', v
          using errcode = '22023';
      end if;
  end case;

  return new;
end;
$$;

create trigger data_field_definitions_validate_retention
  before insert or update on core_compliance.data_field_definitions
  for each row execute function core_compliance.data_field_definitions_validate_retention();

-- ─── RLS ─────────────────────────────────────────────────────────────────
alter table core_compliance.data_field_definitions enable row level security;
alter table core_compliance.data_field_definitions force row level security;

-- SELECT: åben for authenticated (metadata, ikke PII selv).
create policy data_field_definitions_select on core_compliance.data_field_definitions
  for select to authenticated
  using (true);

-- INSERT/UPDATE/DELETE: kun via RPC der sætter session-var.
create policy data_field_definitions_insert on core_compliance.data_field_definitions
  for insert to authenticated
  with check (current_setting('stork.allow_data_field_definitions_write', true) = 'true');

create policy data_field_definitions_update on core_compliance.data_field_definitions
  for update to authenticated
  using (current_setting('stork.allow_data_field_definitions_write', true) = 'true')
  with check (current_setting('stork.allow_data_field_definitions_write', true) = 'true');

create policy data_field_definitions_delete on core_compliance.data_field_definitions
  for delete to authenticated
  using (current_setting('stork.allow_data_field_definitions_write', true) = 'true');

-- REVOKE direkte rettigheder; alt går via policy + RPC.
revoke all on table core_compliance.data_field_definitions from public, anon, service_role;
grant select on table core_compliance.data_field_definitions to authenticated;
grant insert, update, delete on table core_compliance.data_field_definitions to authenticated;

-- ─── Audit-trigger ───────────────────────────────────────────────────────
create trigger data_field_definitions_audit
  after insert or update or delete on core_compliance.data_field_definitions
  for each row execute function core_compliance.stork_audit();

-- ─── Upsert-RPC ──────────────────────────────────────────────────────────
create or replace function core_compliance.data_field_definition_upsert(
  p_table_schema text,
  p_table_name text,
  p_column_name text,
  p_category text,
  p_pii_level text,
  p_purpose text,
  p_retention_type text default null,
  p_retention_value jsonb default null,
  p_match_role text default null,
  p_change_reason text default null
)
returns core_compliance.data_field_definitions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row core_compliance.data_field_definitions;
begin
  if not core_identity.is_admin() then
    raise exception 'data_field_definition_upsert kræver admin-permission' using errcode = '42501';
  end if;

  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er påkrævet' using errcode = '22023';
  end if;

  perform set_config('stork.allow_data_field_definitions_write', 'true', true);
  perform set_config('stork.change_reason', p_change_reason, true);

  insert into core_compliance.data_field_definitions (
    table_schema, table_name, column_name,
    category, pii_level, retention_type, retention_value, match_role, purpose
  ) values (
    p_table_schema, p_table_name, p_column_name,
    p_category, p_pii_level, p_retention_type, p_retention_value, p_match_role, p_purpose
  )
  on conflict (table_schema, table_name, column_name) do update set
    category = excluded.category,
    pii_level = excluded.pii_level,
    retention_type = excluded.retention_type,
    retention_value = excluded.retention_value,
    match_role = excluded.match_role,
    purpose = excluded.purpose
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function core_compliance.data_field_definition_upsert(text, text, text, text, text, text, text, jsonb, text, text) from public;
grant execute on function core_compliance.data_field_definition_upsert(text, text, text, text, text, text, text, jsonb, text, text) to authenticated;

-- ─── Delete-RPC ──────────────────────────────────────────────────────────
create or replace function core_compliance.data_field_definition_delete(
  p_table_schema text,
  p_table_name text,
  p_column_name text,
  p_change_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not core_identity.is_admin() then
    raise exception 'data_field_definition_delete kræver admin-permission' using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er påkrævet' using errcode = '22023';
  end if;

  perform set_config('stork.allow_data_field_definitions_write', 'true', true);
  perform set_config('stork.change_reason', p_change_reason, true);

  delete from core_compliance.data_field_definitions
   where table_schema = p_table_schema
     and table_name = p_table_name
     and column_name = p_column_name;
end;
$$;

revoke all on function core_compliance.data_field_definition_delete(text, text, text, text) from public;
grant execute on function core_compliance.data_field_definition_delete(text, text, text, text) to authenticated;
