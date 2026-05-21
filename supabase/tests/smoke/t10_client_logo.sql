-- Trin 10 T10.15: client_logo smoke-test
--
-- Dækker: client_logo_set + client_logo_get + client_logo_clear.
-- V3 (Codex V2 KRITISK-SIKKERHEDSHUL) assertion: client_upsert UPDATE af
-- name/fields bevarer logo_bytes uændret (read før+efter; sammenlign).
-- consistency-CHECK blokerer partiel logo. client_logo_set fejler hvis ét
-- felt er NULL.
-- V12 (Codex V11 KRITISK-SIKKERHEDSHUL): audit_log har logo_filename + logo_bytes
-- SHA256-hashed efter client_logo_set; logo_content_type forbliver klartekst.

begin;

do $test$
declare
  v_client_id uuid;
  v_caught text;
  v_logo_bytes_before bytea;
  v_logo_bytes_after bytea;
  v_logo_filename_before text;
  v_logo_filename_after text;
  v_returned_bytes bytea;
  v_returned_ct text;
  v_returned_fn text;
  v_test_logo bytea := decode('89504e470d0a1a0a', 'hex');
  v_test_logo_2 bytea := decode('89504e470d0a1a0a0000000d49484452', 'hex');
  v_superadmin_auth_id uuid;
begin
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'T10 logo smoke', true);

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

  -- Setup: opret klient
  v_client_id := core_identity.client_upsert(
    'Logo Test Klient', '{}'::jsonb,
    'T10-logo setup: opret klient', true, null
  );

  -- ─── T1: client_logo_set + client_logo_get ──────────────────────────
  perform core_identity.client_logo_set(
    v_client_id, v_test_logo, 'image/png', 'logo.png',
    'T10-logo T1: upload logo'
  );

  select logo_bytes, logo_content_type, logo_filename
    into v_returned_bytes, v_returned_ct, v_returned_fn
    from core_identity.client_logo_get(v_client_id);
  if v_returned_bytes is null or v_returned_bytes <> v_test_logo then
    raise exception 'T1 FAIL: client_logo_get returnerede ikke set bytes';
  end if;
  if v_returned_ct <> 'image/png' or v_returned_fn <> 'logo.png' then
    raise exception 'T1 FAIL: metadata mismatch';
  end if;

  -- ─── T2 (V3 KRITISK): client_upsert UPDATE bevarer logo ─────────────
  select logo_bytes, logo_filename into v_logo_bytes_before, v_logo_filename_before
    from core_identity.clients where id = v_client_id;

  perform core_identity.client_upsert(
    'Logo Test Klient (omdøbt)', '{}'::jsonb,
    'T10-logo T2: ren navne-ændring — logo skal bevares',
    true, v_client_id
  );

  select logo_bytes, logo_filename into v_logo_bytes_after, v_logo_filename_after
    from core_identity.clients where id = v_client_id;

  if v_logo_bytes_after is distinct from v_logo_bytes_before then
    raise exception 'T2 FAIL (V3 KRITISK): client_upsert UPDATE skal IKKE røre logo_bytes!';
  end if;
  if v_logo_filename_after is distinct from v_logo_filename_before then
    raise exception 'T2 FAIL (V3 KRITISK): client_upsert UPDATE skal IKKE røre logo_filename!';
  end if;

  -- ─── T3: client_logo_set fejler hvis ét felt NULL ───────────────────
  begin
    v_caught := null;
    perform core_identity.client_logo_set(
      v_client_id, v_test_logo, 'image/png', null, 'T10-logo T3: partiel'
    );
  exception when sqlstate '22023' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T3 FAIL: client_logo_set med NULL filename skal afvises';
  end if;

  -- ─── T4: client_logo_clear nulstiller alle tre felter ───────────────
  perform core_identity.client_logo_clear(v_client_id, 'T10-logo T4: fjern logo');

  select logo_bytes, logo_content_type, logo_filename
    into v_returned_bytes, v_returned_ct, v_returned_fn
    from core_identity.clients where id = v_client_id;
  if v_returned_bytes is not null or v_returned_ct is not null or v_returned_fn is not null then
    raise exception 'T4 FAIL: client_logo_clear skal nulstille alle tre felter';
  end if;

  -- ─── T5 (V12 KRITISK-SIKKERHEDSHUL): audit-PII-hashing af logo_filename
  -- audit_log skrives af stork_audit-trigger. Vi verificerer at logo_filename
  -- + logo_bytes er sha256-hashed i new_values (pii_level='direct' i T10.4).
  perform core_identity.client_logo_set(
    v_client_id, v_test_logo_2, 'image/png', 'personlig-info-logo.png',
    'T10-logo T5: upload til audit-test'
  );

  -- Audit-log INSERT'er via after-trigger. SELECT seneste UPDATE-row for clients.
  if not exists (
    select 1 from core_compliance.audit_log
    where table_schema = 'core_identity'
      and table_name = 'clients'
      and record_id = v_client_id
      and operation = 'UPDATE'
      and (new_values ->> 'logo_filename') like 'sha256:%'
      and (new_values ->> 'logo_bytes') like 'sha256:%'
  ) then
    raise exception 'T5 FAIL (V12 KRITISK-SIKKERHEDSHUL): logo_filename + logo_bytes skal være SHA256-hashed i audit_log.new_values';
  end if;

  -- logo_content_type forbliver klartekst (pii_level='none')
  if not exists (
    select 1 from core_compliance.audit_log
    where table_schema = 'core_identity'
      and table_name = 'clients'
      and record_id = v_client_id
      and operation = 'UPDATE'
      and (new_values ->> 'logo_content_type') = 'image/png'
  ) then
    raise exception 'T5 FAIL: logo_content_type skal være klartekst i audit_log (pii_level=none)';
  end if;

  raise notice 'T10 logo smoke: ALL TESTS PASSED (T1-T5)';
end;
$test$;

rollback;
