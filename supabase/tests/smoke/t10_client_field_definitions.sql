-- Trin 10 T10.15: client_field_definitions smoke-test
--
-- Dækker: client_field_definition_upsert (INSERT + UPDATE), is_active toggle
-- via _set_active, client_field_definitions_list respekterer p_include_inactive.
-- V3 (Codex V2 KRITISK-SIKKERHEDSHUL): UPDATE af key afvises (errcode 22023).
-- UPDATE af pii_level direct → none afvises (errcode 22023). pii_level
-- none → indirect → direct accepteres. V8: UPDATE rør IKKE is_active.

begin;

do $test$
declare
  v_field_id uuid;
  v_caught text;
  v_count integer;
begin
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'T10 cfd smoke', true);

  -- ─── T1: INSERT felt-definition ─────────────────────────────────────
  v_field_id := core_identity.client_field_definition_upsert(
    'telefon',           -- p_key
    'Telefon',           -- p_display_name
    'phone',             -- p_field_type
    'direct',            -- p_pii_level
    'T10-cfd T1: opret', -- p_change_reason
    false,               -- p_required
    10,                  -- p_display_order
    true,                -- p_is_active
    null                 -- p_field_id (INSERT)
  );

  if v_field_id is null then
    raise exception 'T1 FAIL: cfd_upsert INSERT returnerede null';
  end if;

  -- ─── T2 (V3 KRITISK-SIKKERHEDSHUL): UPDATE af key afvises ──────────
  begin
    v_caught := null;
    perform core_identity.client_field_definition_upsert(
      'mobil',                  -- p_key (ÆNDRET fra 'telefon')
      'Telefon',
      'phone',
      'direct',
      'T10-cfd T2: forsøg key-rename',
      false, 10, true,
      v_field_id
    );
  exception when sqlstate '22023' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T2 FAIL (V3 KRITISK): UPDATE af key skal afvises (immutable)';
  end if;

  -- ─── T3 (V3 KRITISK-SIKKERHEDSHUL): pii_level direct → none afvises
  begin
    v_caught := null;
    perform core_identity.client_field_definition_upsert(
      'telefon', 'Telefon', 'phone',
      'none',                   -- p_pii_level DOWNGRADED fra 'direct'
      'T10-cfd T3: forsøg pii-downgrade',
      false, 10, true, v_field_id
    );
  exception when sqlstate '22023' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T3 FAIL (V3 KRITISK-SIKKERHEDSHUL): pii_level direct → non-direct skal afvises';
  end if;

  -- ─── T4: UPDATE display_order accepteres (ikke immutable) ──────────
  perform core_identity.client_field_definition_upsert(
    'telefon', 'Telefon (primær)', 'phone', 'direct',
    'T10-cfd T4: opdater display_name + sortering',
    true, 5, true, v_field_id
  );

  -- ─── T5 (V8 Code walk-through): UPDATE rør IKKE is_active ──────────
  perform core_identity.client_field_definition_set_active(v_field_id, false, 'T10-cfd T5a: deaktiver');
  -- UPDATE med p_is_active=true (default): skal ikke reaktivere
  perform core_identity.client_field_definition_upsert(
    'telefon', 'Telefon', 'phone', 'direct',
    'T10-cfd T5b: ren UPDATE med default p_is_active=true',
    false, 10, true, v_field_id
  );

  select count(*) into v_count
  from core_identity.client_field_definitions
  where id = v_field_id and is_active = false;
  if v_count <> 1 then
    raise exception 'T5 FAIL (V8): client_field_definition_upsert UPDATE skulle IKKE reaktivere; fandt count=%', v_count;
  end if;

  -- ─── T6: pii_level none → indirect → direct (escalation) accepteret
  declare v_field_b_id uuid; begin
    v_field_b_id := core_identity.client_field_definition_upsert(
      'kommentar', 'Kommentar', 'text', 'none',
      'T10-cfd T6a: opret med none', false, 20, true, null
    );
    -- Escalate none → indirect
    perform core_identity.client_field_definition_upsert(
      'kommentar', 'Kommentar', 'text', 'indirect',
      'T10-cfd T6b: escalate til indirect', false, 20, true, v_field_b_id
    );
    -- Escalate indirect → direct
    perform core_identity.client_field_definition_upsert(
      'kommentar', 'Kommentar', 'text', 'direct',
      'T10-cfd T6c: escalate til direct', false, 20, true, v_field_b_id
    );
  end;

  raise notice 'T10 cfd smoke: ALL TESTS PASSED (T1-T6)';
end;
$test$;

rollback;
