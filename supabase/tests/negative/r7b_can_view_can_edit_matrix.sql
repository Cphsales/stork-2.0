-- R7b matrix-test: has_permission boolean-matrix verificerer can_view-fix.
--
-- R7h v2.1 — erstatter placebo-test r7b_can_view_false_can_edit_true.sql.
-- Placebo-bug: testen kørte uden auth.uid()-context → has_permission
-- returnerede false uanset row-state. Verificerede ingenting.
--
-- Fix: mock auth.uid() via set_config('request.jwt.claim.sub', ..., true).
--
-- Setup-strategi: omtildel mg til test-rolle der HAR system.manage
-- (så admin-floor bevares: km via superadmin + mg via test_role = 2 admins).
-- Custom r7b_t1/t2/t3 permissions på test_role. ROLLBACK rydder alt.
--
-- Pre-fix bevisførelse (boolean-evaluering pr. case):
-- T1 (can_view=true, can_edit=false) — positiv control:
--   pre-R7b: (not false or ...) = true ✓
--   post-R7b: can_view=true AND ... = true ✓
-- T2 (can_view=false, can_edit=true) — REGRESSIONS-TEST:
--   pre-R7b: (not true or can_edit=true) = (false or true) = true → BUG
--   post-R7b: can_view=false AND ... = false → korrekt
--   T2 FEJLER pre-R7b; PASSERER post-R7b
-- T3 (can_view=false, can_edit=false):
--   pre-R7b: (not false or ...) = true → BUG
--   post-R7b: can_view=false AND ... = false → korrekt
--   T3 FEJLER pre-R7b; PASSERER post-R7b

begin;
do $test$
declare
  v_mg_auth_id uuid;
  v_test_role_id uuid;
begin
  -- 1. Hent mg's auth_user_id
  select auth_user_id into v_mg_auth_id
    from core_identity.employees where email = 'mg@copenhagensales.dk';
  if v_mg_auth_id is null then
    raise exception 'R7b SETUP FAIL: mg findes ikke';
  end if;

  -- 2. Opret test-rolle
  perform set_config('stork.allow_roles_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'R7b matrix-test', true);
  insert into core_identity.roles (name, description)
    values ('r7b_matrix_' || extract(epoch from clock_timestamp())::text, 'r7b matrix')
    returning id into v_test_role_id;

  -- 3. Tilføj system.manage til test-rolle FØR mg flyttes
  --    (sikrer admin-floor bevares: km + mg-via-test_role = 2 admins)
  perform set_config('stork.allow_role_page_permissions_write', 'true', true);
  insert into core_identity.role_page_permissions
    (role_id, page_key, tab_key, can_view, can_edit, scope)
  values (v_test_role_id, 'system', 'manage', true, true, 'all');

  -- 4. Flyt mg til test-rolle
  perform set_config('stork.allow_employees_write', 'true', true);
  update core_identity.employees set role_id = v_test_role_id where auth_user_id = v_mg_auth_id;

  -- 5. Mock auth.uid() til mg
  perform set_config('request.jwt.claim.sub', v_mg_auth_id::text, true);

  -- ─── T1: can_view=true, can_edit=false (positiv control) ──────────────────
  insert into core_identity.role_page_permissions
    (role_id, page_key, tab_key, can_view, can_edit, scope)
  values (v_test_role_id, 'r7b_t1', 't1', true, false, 'all');

  if not core_identity.has_permission('r7b_t1', 't1', false) then
    raise exception 'T1 FAIL: can_view=true skulle give has_permission(_,_,false)=true';
  end if;
  if core_identity.has_permission('r7b_t1', 't1', true) then
    raise exception 'T1 FAIL: can_edit=false skulle give has_permission(_,_,true)=false';
  end if;

  -- ─── T2: can_view=false, can_edit=true (REGRESSIONS-TEST) ────────────────
  insert into core_identity.role_page_permissions
    (role_id, page_key, tab_key, can_view, can_edit, scope)
  values (v_test_role_id, 'r7b_t2', 't2', false, true, 'all');

  if core_identity.has_permission('r7b_t2', 't2', true) then
    raise exception 'T2 FAIL (R7b regression): can_view=false skulle blokere has_permission uanset can_edit=true';
  end if;

  -- ─── T3: can_view=false, can_edit=false ──────────────────────────────────
  insert into core_identity.role_page_permissions
    (role_id, page_key, tab_key, can_view, can_edit, scope)
  values (v_test_role_id, 'r7b_t3', 't3', false, false, 'all');

  if core_identity.has_permission('r7b_t3', 't3', false) then
    raise exception 'T3 FAIL: can_view=false skulle blokere has_permission(_,_,false)';
  end if;
end;
$test$;
rollback;
