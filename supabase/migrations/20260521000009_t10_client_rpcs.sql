-- Trin 10 T10.8 + T10.9: client_upsert + client_set_active RPC'er
--
-- client_upsert: SECURITY DEFINER write-RPC. has_permission('clients', 'manage', true).
-- INSERT-branch bruger p_is_active (default true for nye klienter).
-- UPDATE-branch rør IKKE is_active (V8 Code walk-through #2: forhindrer
-- utilsigtet reaktivering ved navne-ændring). UPDATE rør IKKE logo (V3 KRITISK-
-- SIKKERHEDSHUL: forhindrer datatab). Toggle via client_set_active; logo via
-- client_logo_set/clear.
--
-- client_set_active: dedikeret toggle-RPC. Adskilt RPC fordi UI-flow er distinkt
-- ("deaktiver klient" vs "redigér klient"). Matcher krav-dok §3.1's distinct
-- "Deaktivér klient"-funktion.

-- Drop D5's signatur (Public.client_upsert blev droppet af T1; greenfield i core_identity).
-- Ingen drop nødvendig — første gang vi opretter i core_identity.

create or replace function core_identity.client_upsert(
  p_name text,
  p_fields jsonb,
  p_change_reason text,
  p_is_active boolean default true,
  p_client_id uuid default null
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
begin
  if not core_identity.has_permission('clients', 'manage', true) then
    raise exception 'client_upsert: permission_denied' using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'client_upsert: change_reason er paakraevet' using errcode = '22023';
  end if;
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'client_upsert: name er paakraevet' using errcode = '22023';
  end if;

  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);
  perform set_config('stork.allow_clients_write', 'true', true);

  if p_client_id is null then
    -- INSERT: p_is_active anvendes (default true for nye klienter)
    insert into core_identity.clients (name, fields, is_active)
    values (p_name, coalesce(p_fields, '{}'::jsonb), p_is_active)
    returning id into v_id;
  else
    -- V8 (Code walk-through #2): UPDATE rør IKKE is_active. Brug client_set_active.
    -- V3 (Codex V2 KRITISK-SIKKERHEDSHUL): UPDATE rør IKKE logo. Brug client_logo_set/clear.
    update core_identity.clients
      set name = p_name,
          fields = coalesce(p_fields, '{}'::jsonb)
     where id = p_client_id
     returning id into v_id;
    if v_id is null then
      raise exception 'client_upsert: client % findes ikke', p_client_id using errcode = 'P0002';
    end if;
  end if;

  return v_id;
end;
$$;

comment on function core_identity.client_upsert(text, jsonb, text, boolean, uuid) is
  'T10.8: INSERT-eller-UPDATE klient. UPDATE rør ikke is_active eller logo (V8 + V3 forhindrer utilsigtet reaktivering/datatab). Toggle via client_set_active; logo via client_logo_set/clear.';

revoke all on function core_identity.client_upsert(text, jsonb, text, boolean, uuid) from public, anon;
grant execute on function core_identity.client_upsert(text, jsonb, text, boolean, uuid) to authenticated;

-- ─── client_set_active: toggler is_active uden at røre øvrige felter ─────
create or replace function core_identity.client_set_active(
  p_client_id uuid,
  p_is_active boolean,
  p_change_reason text
) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not core_identity.has_permission('clients', 'manage', true) then
    raise exception 'client_set_active: permission_denied' using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'client_set_active: change_reason er paakraevet' using errcode = '22023';
  end if;

  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);
  perform set_config('stork.allow_clients_write', 'true', true);

  update core_identity.clients
    set is_active = p_is_active
   where id = p_client_id;
  if not found then
    raise exception 'client_set_active: client % findes ikke', p_client_id using errcode = 'P0002';
  end if;
end;
$$;

comment on function core_identity.client_set_active(uuid, boolean, text) is
  'T10.9: toggler is_active uden at røre øvrige felter (krav-dok §3.1 distinct Deaktivér-funktion). Matcher client_logo_set/clear-mønstret.';

revoke all on function core_identity.client_set_active(uuid, boolean, text) from public, anon;
grant execute on function core_identity.client_set_active(uuid, boolean, text) to authenticated;
