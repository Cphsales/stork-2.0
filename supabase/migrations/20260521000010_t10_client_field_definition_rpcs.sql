-- Trin 10 T10.10 + T10.10a: client_field_definition_upsert + _set_active
--
-- T10.10: SECURITY DEFINER write-RPC for client_field_definitions.
-- has_permission('client_field_definitions', 'manage', true).
-- INSERT-branch bruger p_is_active. UPDATE-branch rør IKKE is_active (V8).
--
-- V3 (Codex V2 KRITISK-SIKKERHEDSHUL): key + pii_level direct→non-direct
-- effektivt immutable for eksisterende definitions. Forhindrer audit-PII-datalæk:
-- audit-hashing i clients.fields binder til key; eksisterende værdier ville
-- pludselig skrives i klartekst hvis pii-niveau sænkes. SUPERADMIN BYPASSER IKKE
-- (Mathias 2026-05-21: sikkerheds-invariants > "superadmin må alt").
--
-- T10.10a: client_field_definition_set_active — toggler is_active. Matcher
-- krav-dok §3.2's distinct "Deaktivér felt-definition"-funktion + client_set_active-mønstret.

create or replace function core_identity.client_field_definition_upsert(
  p_key text,
  p_display_name text,
  p_field_type text,
  p_pii_level text,
  p_change_reason text,
  p_required boolean default false,
  p_display_order integer default 0,
  p_is_active boolean default true,
  p_field_id uuid default null
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
  v_existing_key text;
  v_existing_pii text;
begin
  if not core_identity.has_permission('client_field_definitions', 'manage', true) then
    raise exception 'client_field_definition_upsert: permission_denied' using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'client_field_definition_upsert: change_reason er paakraevet' using errcode = '22023';
  end if;
  if p_pii_level not in ('none', 'indirect', 'direct') then
    raise exception 'client_field_definition_upsert: pii_level skal vaere none/indirect/direct' using errcode = '22023';
  end if;

  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);
  perform set_config('stork.allow_client_field_definitions_write', 'true', true);

  if p_field_id is null then
    insert into core_identity.client_field_definitions
      (key, display_name, field_type, required, pii_level, display_order, is_active)
    values
      (p_key, p_display_name, p_field_type, p_required, p_pii_level, p_display_order, p_is_active)
    returning id into v_id;
  else
    -- V3 (Codex V2 KRITISK-SIKKERHEDSHUL): forbyd key-rename og direct → non-direct
    -- for eksisterende definitions. Audit-PII-hashing i clients.fields stoler på at
    -- key+pii_level er stabile for værdier der allerede ligger i jsonb.
    -- INGEN superadmin-bypass: sikkerheds-invariant > "superadmin må alt".
    select key, pii_level into v_existing_key, v_existing_pii
      from core_identity.client_field_definitions
     where id = p_field_id;
    if not found then
      raise exception 'client_field_definition_upsert: field % findes ikke', p_field_id using errcode = 'P0002';
    end if;
    if v_existing_key is distinct from p_key then
      raise exception 'client_field_definition_upsert: key er immutable (% -> %). For at omdøbe: marker eksisterende felt is_active=false og INSERT et nyt.', v_existing_key, p_key
        using errcode = '22023', hint = 'Audit-PII-hash i clients.fields binder til key.';
    end if;
    if v_existing_pii = 'direct' and p_pii_level <> 'direct' then
      raise exception 'client_field_definition_upsert: pii_level direct -> % afvist. Eksisterende vaerdier i clients.fields ville pludselig skrives i klartekst i audit-log.', p_pii_level
        using errcode = '22023', hint = 'For at saenke pii-niveau: INSERT ny definition med ny key.';
    end if;

    -- V8 (Code walk-through #3): UPDATE rør IKKE is_active. Brug client_field_definition_set_active.
    update core_identity.client_field_definitions
      set display_name = p_display_name,
          field_type = p_field_type,
          required = p_required,
          pii_level = p_pii_level,
          display_order = p_display_order
          -- key rør'es ikke (immutable verificeret ovenfor)
          -- is_active rør IKKE (brug client_field_definition_set_active)
     where id = p_field_id
     returning id into v_id;
  end if;

  return v_id;
end;
$$;

comment on function core_identity.client_field_definition_upsert(text, text, text, text, text, boolean, integer, boolean, uuid) is
  'T10.10: INSERT-eller-UPDATE felt-definition. key + pii_level (direct→non-direct) immutable for eksisterende (V3 KRITISK-SIKKERHEDSHUL). UPDATE rør ikke is_active (V8). pii_level escalation none→indirect→direct tilladt. Sikkerheds-invariants bypasses ikke for superadmin.';

revoke all on function core_identity.client_field_definition_upsert(text, text, text, text, text, boolean, integer, boolean, uuid) from public, anon;
grant execute on function core_identity.client_field_definition_upsert(text, text, text, text, text, boolean, integer, boolean, uuid) to authenticated;

-- ─── T10.10a: client_field_definition_set_active (V8 — krav-dok §3.2) ───
create or replace function core_identity.client_field_definition_set_active(
  p_field_id uuid,
  p_is_active boolean,
  p_change_reason text
) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not core_identity.has_permission('client_field_definitions', 'manage', true) then
    raise exception 'client_field_definition_set_active: permission_denied' using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'client_field_definition_set_active: change_reason er paakraevet' using errcode = '22023';
  end if;

  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);
  perform set_config('stork.allow_client_field_definitions_write', 'true', true);

  update core_identity.client_field_definitions
    set is_active = p_is_active
   where id = p_field_id;
  if not found then
    raise exception 'client_field_definition_set_active: field % findes ikke', p_field_id using errcode = 'P0002';
  end if;
end;
$$;

comment on function core_identity.client_field_definition_set_active(uuid, boolean, text) is
  'T10.10a (V8): toggler is_active uden at røre øvrige felter (krav-dok §3.2 distinct Deaktivér felt-definition).';

revoke all on function core_identity.client_field_definition_set_active(uuid, boolean, text) from public, anon;
grant execute on function core_identity.client_field_definition_set_active(uuid, boolean, text) to authenticated;
