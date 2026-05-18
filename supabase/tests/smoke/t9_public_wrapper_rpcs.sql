-- T9 Step 8 smoke: public pending-wrapper RPCs.
--
-- Minimal smoke — wrappers er tynde passthroughs til pending_change_request +
-- apply-handlers (testet i Steps 1-5).
--
-- T0: Uden auth → permission_denied (PR #39 pattern: has_permission FØR validation)
-- T1: Med superadmin auth → invalid node_type → 22023 (validation-path)
-- T2: Med superadmin auth → client_node_place på department → 22023 (team-only pre-check)
-- T3: Med superadmin auth → team_close på department → 22023 (node_type pre-check)
--
-- HERMETIC FIXTURE (G053 refactor 2026-05-19 / Mathias Vej D):
-- Denne test bruger eksisterende superadmin read-only som auth-caller for at
-- nå authorized wrapper-path. Den muterer IKKE seed-employees; alle business-
-- fixtures er transaction-local throwaway rows (org_nodes, names, client uuids).
-- Auth-caller-pattern bruger generisk superadmin-lookup, ikke hardcoded mg@/km@.

begin;

do $test$
declare
  v_caught text;
  v_dept_id uuid;
  v_uuid_suffix text;
  v_superadmin_auth_id uuid;
begin
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'T9 step 8 smoke hermetic fixture', true);

  v_uuid_suffix := replace(gen_random_uuid()::text, '-', '');

  -- Setup throwaway dept-knude (current_date - 10).
  v_dept_id := gen_random_uuid();
  insert into core_identity.org_nodes (id) values (v_dept_id);
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
  values
    (v_dept_id, 'TestDept_' || v_uuid_suffix, null, 'department', true, current_date - 10);

  -- ─── T0: Unauthenticated → permission_denied (42501) ──────────────────
  -- Ingen JWT claim sat → current_employee_id() er null → has_permission
  -- returnerer false → wrapper raiser 42501 FØR validation.
  begin
    v_caught := null;
    perform core_identity.org_node_upsert(null, 'unauth_' || v_uuid_suffix, null, 'invalid_type', true, current_date);
  exception when sqlstate '42501' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T0 FAIL: unauthenticated kald skal afvises med 42501 før validation';
  end if;

  -- ─── Authorized superadmin context ────────────────────────────────────
  -- Find generisk superadmin med active auth_user_id. Setup-fail hvis ingen.
  select e.auth_user_id into v_superadmin_auth_id
  from core_identity.employees e
  join core_identity.roles r on r.id = e.role_id
  where r.name = 'superadmin'
    and e.auth_user_id is not null
    and core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
  limit 1;

  if v_superadmin_auth_id is null then
    raise exception 'SETUP FAIL: ingen aktiv superadmin med auth_user_id fundet';
  end if;

  perform set_config('request.jwt.claim.sub', v_superadmin_auth_id::text, true);

  -- Verificér at superadmin har de permissions wrapper-T1/T2/T3 kræver.
  if not core_identity.has_permission('org_nodes', 'manage', true) then
    raise exception 'SETUP FAIL: superadmin mangler org_nodes/manage/can_edit (M1-seed?)';
  end if;
  if not core_identity.has_permission('client_placements', 'manage', true) then
    raise exception 'SETUP FAIL: superadmin mangler client_placements/manage/can_edit (M1-seed?)';
  end if;

  -- ─── T1: Med auth → invalid node_type → 22023 ─────────────────────────
  begin
    v_caught := null;
    perform core_identity.org_node_upsert(null, 'authed_' || v_uuid_suffix, null, 'invalid_type', true, current_date);
  exception when sqlstate '22023' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T1 FAIL: org_node_upsert skal afvise invalid node_type med 22023';
  end if;

  -- ─── T2: Med auth → client_node_place på department → 22023 ──────────
  begin
    v_caught := null;
    perform core_identity.client_node_place(gen_random_uuid(), v_dept_id, current_date);
  exception when sqlstate '22023' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T2 FAIL: client_node_place på department skal blokeres pre-check med 22023';
  end if;

  -- ─── T3: Med auth → team_close på department → 22023 ─────────────────
  begin
    v_caught := null;
    perform core_identity.team_close(v_dept_id, current_date);
  exception when sqlstate '22023' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T3 FAIL: team_close på department skal blokeres pre-check med 22023';
  end if;

  raise notice 'T9 Step 8 smoke: ALL TESTS PASSED (T0-T3)';
end;
$test$;

rollback;
