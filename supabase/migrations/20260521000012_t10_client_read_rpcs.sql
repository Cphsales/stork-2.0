-- Trin 10 T10.12: read-RPC'er for klient + felt-definitioner
--
-- client_get: hent én klient med metadata (has_logo bool — logo hentes via
--             dedikeret client_logo_get for at undgå unødigt bytea-payload).
-- client_list: list alle klienter (aktive + inaktive per krav-dok §3.1).
-- client_field_definitions_list: list felt-definitioner (filter på is_active).
--
-- Tab-aware has_permission ('manage', false) per V6-fix: null-tab matcher
-- ikke T10.13's tab-grants. SECURITY INVOKER — caller's role + RLS-policy gælder.

create or replace function core_identity.client_get(p_client_id uuid)
returns table (
  id uuid,
  name text,
  fields jsonb,
  is_active boolean,
  logo_content_type text,
  logo_filename text,
  has_logo boolean,
  created_at timestamptz,
  updated_at timestamptz
) language plpgsql stable security invoker set search_path = ''
as $$
begin
  if not core_identity.has_permission('clients', 'manage', false) then
    raise exception 'client_get: permission_denied' using errcode = '42501';
  end if;
  return query
    select c.id, c.name, c.fields, c.is_active,
           c.logo_content_type, c.logo_filename,
           c.logo_bytes is not null,
           c.created_at, c.updated_at
      from core_identity.clients c
     where c.id = p_client_id;
end; $$;

comment on function core_identity.client_get(uuid) is
  'T10.12: hent én klient. has_logo bool i stedet for bytea (logo via dedikeret client_logo_get). Tab-aware permission.';

revoke all on function core_identity.client_get(uuid) from public, anon;
grant execute on function core_identity.client_get(uuid) to authenticated;

-- ─── client_list: alle klienter (aktive + inaktive per krav-dok §3.1) ───
create or replace function core_identity.client_list()
returns table (
  id uuid, name text, is_active boolean,
  has_logo boolean, created_at timestamptz, updated_at timestamptz
) language plpgsql stable security invoker set search_path = ''
as $$
begin
  if not core_identity.has_permission('clients', 'manage', false) then
    raise exception 'client_list: permission_denied' using errcode = '42501';
  end if;
  return query
    select c.id, c.name, c.is_active, c.logo_bytes is not null,
           c.created_at, c.updated_at
      from core_identity.clients c
     order by c.name asc;
end; $$;

comment on function core_identity.client_list() is
  'T10.12: list alle klienter (aktive + inaktive per krav-dok §3.1 "Hent klient-liste"). Tab-aware permission.';

revoke all on function core_identity.client_list() from public, anon;
grant execute on function core_identity.client_list() to authenticated;

-- ─── client_field_definitions_list: list felt-def ───────────────────────
-- p_include_inactive default false: standard returnerer kun aktive (krav-dok §3.2
-- "Hent felt-definitioner: alle aktive"). p_include_inactive=true for fuld liste.
--
-- T10.16 tilføjer denne RPC til LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS (Codex V1
-- MELLEM #3): client_field_definitions har kun is_active, ingen status-kolonne.
create or replace function core_identity.client_field_definitions_list(p_include_inactive boolean default false)
returns setof core_identity.client_field_definitions
language plpgsql stable security invoker set search_path = ''
as $$
begin
  if not core_identity.has_permission('client_field_definitions', 'manage', false) then
    raise exception 'client_field_definitions_list: permission_denied' using errcode = '42501';
  end if;
  return query
    select * from core_identity.client_field_definitions
     where p_include_inactive or is_active = true
     order by display_order, key;
end; $$;

comment on function core_identity.client_field_definitions_list(boolean) is
  'T10.12: list felt-definitioner. Default kun aktive (krav-dok §3.2). p_include_inactive=true for fuld liste. R7d-allowlist via T10.16.';

revoke all on function core_identity.client_field_definitions_list(boolean) from public, anon;
grant execute on function core_identity.client_field_definitions_list(boolean) to authenticated;
