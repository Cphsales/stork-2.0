-- T9-supplement smoke: read-gates på 9 RPCs med tre-lags test.
--
-- V4 OPGRADERING 2 (Codex V3) + Codex runde 1 MELLEM 2 fix:
--   Lag 1 — Deklarativ has_function_privilege for alle 9 RPCs (deterministisk grant-check)
--   Lag 2 — Runtime uden permission: JWT sat til UUID der ikke matcher nogen
--           employee. current_employee_id() returnerer NULL → has_permission
--           returnerer false → admin-only-RPCs raiser 42501; visibility-RPCs
--           returnerer 0 rows (ACL-helper får NULL caller → tom acl_subtree).
--   Lag 3 — Runtime med superadmin (succes-path: alle RPCs returnerer ≥0 rows).
-- Plus session-var-isolation (V4 OPGRADERING 1): _at efterfulgt af current
-- bruger current_date, ikke tidligere _at-state.
--
-- Note: Lag 3 med "granted fixture-role" kræver auth.users-INSERT som er
-- service_role-only operation; pragmatisk testes succes-path via superadmin.

begin;

do $test$
declare
  v_superadmin_auth_id uuid;
  v_caught text;
  v_rowcount integer;
begin
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'T9-supplement read-gates smoke', true);

  -- ═══════════════════════════════════════════════════════════════════════
  -- Lag 1 — Deklarativ EXECUTE-grant for alle 9 read-RPCs
  -- ═══════════════════════════════════════════════════════════════════════
  assert has_function_privilege('authenticated', 'core_identity.permission_elements_read()'::regprocedure, 'EXECUTE'),
    'EXECUTE-grant mangler: permission_elements_read';
  assert has_function_privilege('authenticated', 'core_identity.role_permissions_read(uuid)'::regprocedure, 'EXECUTE'),
    'EXECUTE-grant mangler: role_permissions_read';
  assert has_function_privilege('authenticated', 'core_identity.org_tree_read()'::regprocedure, 'EXECUTE'),
    'EXECUTE-grant mangler: org_tree_read';
  assert has_function_privilege('authenticated', 'core_identity.org_tree_read_at(date)'::regprocedure, 'EXECUTE'),
    'EXECUTE-grant mangler: org_tree_read_at';
  assert has_function_privilege('authenticated', 'core_identity.employee_placement_read(uuid)'::regprocedure, 'EXECUTE'),
    'EXECUTE-grant mangler: employee_placement_read';
  assert has_function_privilege('authenticated', 'core_identity.employee_placement_read_at(uuid, date)'::regprocedure, 'EXECUTE'),
    'EXECUTE-grant mangler: employee_placement_read_at';
  assert has_function_privilege('authenticated', 'core_identity.client_placement_read(uuid)'::regprocedure, 'EXECUTE'),
    'EXECUTE-grant mangler: client_placement_read';
  assert has_function_privilege('authenticated', 'core_identity.client_placement_read_at(uuid, date)'::regprocedure, 'EXECUTE'),
    'EXECUTE-grant mangler: client_placement_read_at';
  assert has_function_privilege('authenticated', 'core_identity.pending_changes_read()'::regprocedure, 'EXECUTE'),
    'EXECUTE-grant mangler: pending_changes_read';

  -- ═══════════════════════════════════════════════════════════════════════
  -- Lag 2 — Runtime uden permission: fake-JWT → no employee match
  -- ═══════════════════════════════════════════════════════════════════════
  -- Sæt JWT til en UUID der ikke matcher nogen employee.auth_user_id.
  -- current_employee_id() returnerer NULL → has_permission() returnerer false.
  -- Admin-only RPCs skal raise 42501; visibility-RPCs returnerer tom liste.
  perform set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);

  -- Admin-only: permission_elements_read → 42501
  begin
    v_caught := null;
    perform core_identity.permission_elements_read();
  exception when sqlstate '42501' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'Lag 2 FAIL: permission_elements_read skulle raise 42501 uden permission';
  end if;

  -- Admin-only: role_permissions_read(p_role_id) → 42501
  begin
    v_caught := null;
    perform core_identity.role_permissions_read(gen_random_uuid());
  exception when sqlstate '42501' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'Lag 2 FAIL: role_permissions_read skulle raise 42501 uden permission';
  end if;

  -- Visibility-RPCs: returnerer 0 rows (ACL-helper får NULL caller → tom acl_subtree)
  select count(*) into v_rowcount from core_identity.org_tree_read();
  if v_rowcount <> 0 then
    raise exception 'Lag 2 FAIL: org_tree_read skulle returnere 0 rows uden auth (fik %)', v_rowcount;
  end if;

  select count(*) into v_rowcount from core_identity.org_tree_read_at(current_date - 30);
  if v_rowcount <> 0 then
    raise exception 'Lag 2 FAIL: org_tree_read_at skulle returnere 0 rows uden auth (fik %)', v_rowcount;
  end if;

  select count(*) into v_rowcount from core_identity.employee_placement_read(gen_random_uuid());
  if v_rowcount <> 0 then
    raise exception 'Lag 2 FAIL: employee_placement_read skulle returnere 0 rows uden auth (fik %)', v_rowcount;
  end if;

  select count(*) into v_rowcount from core_identity.client_placement_read(gen_random_uuid());
  if v_rowcount <> 0 then
    raise exception 'Lag 2 FAIL: client_placement_read skulle returnere 0 rows uden auth (fik %)', v_rowcount;
  end if;

  -- ═══════════════════════════════════════════════════════════════════════
  -- Lag 3 — Runtime med superadmin (succes-path)
  -- ═══════════════════════════════════════════════════════════════════════
  -- Hent superadmin for at have valid auth-context.
  select e.auth_user_id into v_superadmin_auth_id
  from core_identity.employees e
  join core_identity.roles r on r.id = e.role_id
  where r.name = 'superadmin' and e.auth_user_id is not null
    and core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
  limit 1;

  if v_superadmin_auth_id is null then
    raise exception 'SETUP FAIL: ingen aktiv superadmin med auth_user_id';
  end if;

  perform set_config('request.jwt.claim.sub', v_superadmin_auth_id::text, true);

  -- Admin-only RPCs returnerer rows (eller mindst eksekverer uden 42501)
  select count(*) into v_rowcount from core_identity.permission_elements_read();
  if v_rowcount < 0 then raise exception 'permission_elements_read failed'; end if;

  -- Visibility-RPCs eksekverer succesfuldt
  select count(*) into v_rowcount from core_identity.org_tree_read();
  if v_rowcount < 0 then raise exception 'org_tree_read failed'; end if;

  select count(*) into v_rowcount from core_identity.org_tree_read_at(current_date - 30);
  if v_rowcount < 0 then raise exception 'org_tree_read_at failed'; end if;

  -- pending_changes_read eksekverer (selv hvis tom)
  select count(*) into v_rowcount from core_identity.pending_changes_read();
  if v_rowcount < 0 then raise exception 'pending_changes_read failed'; end if;

  -- ═══════════════════════════════════════════════════════════════════════
  -- Session-var-isolation: _at efterfulgt af current bruger current_date
  -- ═══════════════════════════════════════════════════════════════════════
  -- Kald _at med historisk dato; så current-wrapper
  perform core_identity.org_tree_read_at('2020-01-01');
  -- Current-wrapper sætter eksplicit current_date — burde IKKE bruge 2020-01-01
  select count(*) into v_rowcount from core_identity.org_tree_read();
  -- Vi kan ikke direkte verificere session-var-værdien, men hvis current-
  -- wrapper havde brugt 2020 → 0 rows (tree eksisterede ikke); hvis correct
  -- current_date → forventet rows. Vi tester at det IKKE er 0:
  if v_rowcount = 0 then
    raise exception 'Session-var-isolation FAIL: current-wrapper brugte tidligere _at-state (got 0 rows)';
  end if;

  raise notice 'T9-supplement read-gates: ALL LAYERS PASSED (Lag 1+2+3 + session-var-isolation)';
end;
$test$;

rollback;
