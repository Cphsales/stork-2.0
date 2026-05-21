-- Trin 10 T10.15: clients_validate_fields smoke-test
--
-- LENIENT-default: unknown key i fields → warning, INSERT accepteret.
-- Strict-mode (stork.clients_fields_strict='true'): unknown key → exception.
-- V2 (Codex V1 MELLEM): assert at non-object fields ('"scalar"'::jsonb,
-- '[1,2]'::jsonb) afvises af clients_fields_is_object-CHECK (errcode 23514).
-- V2 (Codex V1 KRITISK-SIKKERHEDSHUL): assert audit-PII-hashing rammer
-- direct-PII keys i fields selv efter felt-definitionen er sat is_active=false.

begin;

do $test$
declare
  v_client_id uuid;
  v_field_id uuid;
  v_caught text;
  v_superadmin_auth_id uuid;
begin
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'T10 validate_fields smoke', true);

  select e.auth_user_id into v_superadmin_auth_id
  from core_identity.employees e
  join core_identity.roles r on r.id = e.role_id
  where r.name = 'superadmin'
    and e.auth_user_id is not null
    and core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
  limit 1;
  if v_superadmin_auth_id is null then
    raise exception 'SETUP FAIL: ingen aktiv superadmin';
  end if;
  perform set_config('request.jwt.claim.sub', v_superadmin_auth_id::text, true);

  -- Setup: opret felt-definition
  v_field_id := core_identity.client_field_definition_upsert(
    'kontakt_email', 'Kontakt-email', 'email', 'direct',
    'T10-validate setup', false, 0, true, null
  );

  -- ─── T1: LENIENT-default: ukendt key → WARNING (ingen exception) ────
  -- Skal IKKE raise
  v_client_id := core_identity.client_upsert(
    'Validate-test klient',
    '{"ukendt_key": "x"}'::jsonb,
    'T10-validate T1: LENIENT', true, null
  );
  if v_client_id is null then
    raise exception 'T1 FAIL: LENIENT-default skal acceptere INSERT med ukendt key (kun warning)';
  end if;

  -- ─── T2 (V2 MELLEM): non-object fields afvises af CHECK ─────────────
  begin
    v_caught := null;
    perform core_identity.client_upsert(
      'Bad-fields klient',
      '"scalar"'::jsonb,
      'T10-validate T2: non-object', true, null
    );
  exception when sqlstate '23514' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T2 FAIL (V2 MELLEM): scalar jsonb skal afvises af clients_fields_is_object-CHECK';
  end if;

  begin
    v_caught := null;
    perform core_identity.client_upsert(
      'Bad-fields klient',
      '[1,2,3]'::jsonb,
      'T10-validate T2b: array', true, null
    );
  exception when sqlstate '23514' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T2b FAIL: array jsonb skal afvises af clients_fields_is_object-CHECK';
  end if;

  -- ─── T3: strict-mode: ukendt key → exception ────────────────────────
  perform set_config('stork.clients_fields_strict', 'true', true);
  begin
    v_caught := null;
    perform core_identity.client_upsert(
      'Strict-test klient',
      '{"ukendt_strict_key": "x"}'::jsonb,
      'T10-validate T3: strict', true, null
    );
  exception when sqlstate '23514' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T3 FAIL: strict-mode skal afvise ukendt key (errcode 23514)';
  end if;
  perform set_config('stork.clients_fields_strict', 'false', true);

  -- ─── T4 (V2 KRITISK-SIKKERHEDSHUL): audit-PII-hashing efter is_active=false
  -- Skab klient med direct-PII key, deaktiver felt-def, opdater klient,
  -- verificér hashing fortsætter.
  declare v_client_pii_id uuid; begin
    v_client_pii_id := core_identity.client_upsert(
      'PII-test klient',
      '{"kontakt_email": "user@example.com"}'::jsonb,
      'T10-validate T4: opret med direct-PII', true, null
    );

    -- Deaktiver felt-def
    perform core_identity.client_field_definition_set_active(v_field_id, false, 'T10-validate T4: deaktiver felt-def');

    -- UPDATE klient (genererer audit-row)
    perform core_identity.client_upsert(
      'PII-test klient (opdateret)',
      '{"kontakt_email": "user-new@example.com"}'::jsonb,
      'T10-validate T4: UPDATE efter felt-def deaktivering',
      true, v_client_pii_id
    );

    -- Verificér: audit_log.new_values.fields.kontakt_email er HASHED
    -- (V2 fix: audit_filter_values' clients-special-case ignorerer is_active-filter)
    if not exists (
      select 1 from core_compliance.audit_log
      where table_schema = 'core_identity'
        and table_name = 'clients'
        and record_id = v_client_pii_id
        and operation = 'UPDATE'
        and (new_values -> 'fields' ->> 'kontakt_email') like 'sha256:%'
    ) then
      raise exception 'T4 FAIL (V2 KRITISK-SIKKERHEDSHUL): direct-PII key skal hashes selv efter felt-def is_active=false (datalæk-forhindring)';
    end if;
  end;

  raise notice 'T10 validate_fields smoke: ALL TESTS PASSED (T1-T4)';
end;
$test$;

rollback;
