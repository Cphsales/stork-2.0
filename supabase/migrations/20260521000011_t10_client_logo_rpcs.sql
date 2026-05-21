-- Trin 10 T10.11: client_logo_set + client_logo_clear + client_logo_get
--
-- Dedikerede RPC'er for logo. Adskilt fra client_upsert for at forhindre
-- datatab (V3 Codex V2 KRITISK-SIKKERHEDSHUL: default-null-parametre i upsert
-- ville utilsigtet slette logo ved name/fields-UPDATE).
--
-- client_logo_set: alle tre logo-felter atomisk (matcher T10.1's
-- clients_logo_consistency CHECK).
-- client_logo_clear: nulstiller alle tre atomisk.
-- client_logo_get: returnerer bytea + content_type + filename for caller.

create or replace function core_identity.client_logo_set(
  p_client_id uuid,
  p_logo_bytes bytea,
  p_logo_content_type text,
  p_logo_filename text,
  p_change_reason text
) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not core_identity.has_permission('clients', 'manage', true) then
    raise exception 'client_logo_set: permission_denied' using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'client_logo_set: change_reason er paakraevet' using errcode = '22023';
  end if;
  if p_logo_bytes is null or p_logo_content_type is null or p_logo_filename is null then
    raise exception 'client_logo_set: alle tre logo-felter er paakraevede (brug client_logo_clear for at fjerne)' using errcode = '22023';
  end if;

  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);
  perform set_config('stork.allow_clients_write', 'true', true);

  update core_identity.clients
    set logo_bytes = p_logo_bytes,
        logo_content_type = p_logo_content_type,
        logo_filename = p_logo_filename
   where id = p_client_id;
  if not found then
    raise exception 'client_logo_set: client % findes ikke', p_client_id using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function core_identity.client_logo_set(uuid, bytea, text, text, text) from public, anon;
grant execute on function core_identity.client_logo_set(uuid, bytea, text, text, text) to authenticated;

-- ─── client_logo_clear: nulstiller alle tre logo-felter atomisk ─────────
create or replace function core_identity.client_logo_clear(
  p_client_id uuid,
  p_change_reason text
) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not core_identity.has_permission('clients', 'manage', true) then
    raise exception 'client_logo_clear: permission_denied' using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'client_logo_clear: change_reason er paakraevet' using errcode = '22023';
  end if;

  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);
  perform set_config('stork.allow_clients_write', 'true', true);

  update core_identity.clients
    set logo_bytes = null,
        logo_content_type = null,
        logo_filename = null
   where id = p_client_id;
  if not found then
    raise exception 'client_logo_clear: client % findes ikke', p_client_id using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function core_identity.client_logo_clear(uuid, text) from public, anon;
grant execute on function core_identity.client_logo_clear(uuid, text) to authenticated;

-- ─── client_logo_get: SECURITY INVOKER read-RPC ─────────────────────────
create or replace function core_identity.client_logo_get(p_client_id uuid)
returns table (logo_bytes bytea, logo_content_type text, logo_filename text)
language plpgsql stable security invoker set search_path = ''
as $$
begin
  if not core_identity.has_permission('clients', 'manage', false) then
    raise exception 'client_logo_get: permission_denied' using errcode = '42501';
  end if;
  return query
    select c.logo_bytes, c.logo_content_type, c.logo_filename
      from core_identity.clients c
     where c.id = p_client_id and c.logo_bytes is not null;
end; $$;

comment on function core_identity.client_logo_get(uuid) is
  'T10.11: returner logo (bytea + metadata) for klient. SECURITY INVOKER. Tab-aware permission (V6).';

revoke all on function core_identity.client_logo_get(uuid) from public, anon;
grant execute on function core_identity.client_logo_get(uuid) to authenticated;
