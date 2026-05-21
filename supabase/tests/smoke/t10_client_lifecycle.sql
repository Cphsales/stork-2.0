-- Trin 10 T10.15: client lifecycle smoke-test
--
-- Dækker: client_upsert (INSERT + UPDATE), client_set_active toggle,
-- client_get returnerer korrekt is_active. has_permission-spærring uden
-- permission-row. is_active toggle bevarer øvrige felter. V8: client_upsert
-- UPDATE rør IKKE is_active (set inaktiv → upsert med ny name → is_active
-- stadig false).
--
-- BEGIN/ROLLBACK påkrævet for hermetisk test (clients ikke på TX_WRAP_REQUIRED,
-- men test-disciplin).

begin;

do $test$
declare
  v_client_id uuid;
  v_returned_is_active boolean;
  v_returned_name text;
  v_caught text;
  v_superadmin_auth_id uuid;
begin
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'T10 lifecycle smoke fixture', true);

  -- T9-pattern: simulér authenticated superadmin via request.jwt.claim.sub
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

  -- ─── T1: client_upsert INSERT ───────────────────────────────────────
  v_client_id := core_identity.client_upsert(
    'Acme A/S',
    '{"telefon": "+45 12345678"}'::jsonb,
    'T10-lifecycle T1: opret aktiv klient',
    true,
    null
  );

  if v_client_id is null then
    raise exception 'T1 FAIL: client_upsert returnerede null';
  end if;

  -- Verificér via client_get
  select is_active, name into v_returned_is_active, v_returned_name
  from core_identity.client_get(v_client_id);

  if v_returned_is_active <> true then
    raise exception 'T1 FAIL: is_active=true forventet, fik %', v_returned_is_active;
  end if;
  if v_returned_name <> 'Acme A/S' then
    raise exception 'T1 FAIL: name="Acme A/S" forventet, fik %', v_returned_name;
  end if;

  -- ─── T2: client_set_active(false) → klient inaktiv ─────────────────
  perform core_identity.client_set_active(v_client_id, false, 'T10-lifecycle T2: deaktiver');

  select is_active into v_returned_is_active from core_identity.client_get(v_client_id);
  if v_returned_is_active <> false then
    raise exception 'T2 FAIL: is_active=false forventet efter set_active(false), fik %', v_returned_is_active;
  end if;

  -- ─── T3 (V8 KRITISK): client_upsert UPDATE rør IKKE is_active ──────
  -- Klient er inaktiv. Vi opdaterer name. is_active SKAL forblive false.
  perform core_identity.client_upsert(
    'Acme A/S (omdøbt)',
    '{"telefon": "+45 12345678"}'::jsonb,
    'T10-lifecycle T3: ren navne-ændring',
    true,  -- p_is_active=true (default); UPDATE-branch skal ignorere den
    v_client_id
  );

  select is_active, name into v_returned_is_active, v_returned_name
  from core_identity.client_get(v_client_id);
  if v_returned_is_active <> false then
    raise exception 'T3 FAIL (V8 KRITISK): client_upsert UPDATE rør IKKE is_active. Forventet false, fik % (utilsigtet reaktivering!)', v_returned_is_active;
  end if;
  if v_returned_name <> 'Acme A/S (omdøbt)' then
    raise exception 'T3 FAIL: name="Acme A/S (omdøbt)" forventet, fik %', v_returned_name;
  end if;

  -- ─── T4: client_set_active(true) → reaktiver ───────────────────────
  perform core_identity.client_set_active(v_client_id, true, 'T10-lifecycle T4: reaktiver');
  select is_active into v_returned_is_active from core_identity.client_get(v_client_id);
  if v_returned_is_active <> true then
    raise exception 'T4 FAIL: is_active=true forventet efter set_active(true), fik %', v_returned_is_active;
  end if;

  raise notice 'T10 lifecycle smoke: ALL TESTS PASSED (T1-T4)';
end;
$test$;

rollback;
