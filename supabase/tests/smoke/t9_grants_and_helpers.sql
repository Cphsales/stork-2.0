-- T9 Steps 6+7 smoke: permission-elementer + grants + helpers.
--
-- HERMETIC FIXTURE (G053 refactor 2026-05-19):
-- Testen opretter egne throwaway-rolle, employees, org-tree og placements
-- inde i BEGIN/ROLLBACK. Ingen brug af mg@/km@ eller andre seed-fixtures.
-- Ingen DELETE/UPDATE af eksisterende seed-state.

begin;

do $test$
declare
  v_caught text;
  v_root_id uuid;
  v_dept_id uuid;
  v_team_id uuid;
  v_emp_a_id uuid;
  v_emp_b_id uuid;
  v_role_id uuid;
  v_area_id uuid;
  v_page_id uuid;
  v_tab_id uuid;
  v_grant_id uuid;
  v_resolve record;
  v_subtree uuid[];
  v_uuid_suffix text;
begin
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'T9 step 6+7 smoke hermetic fixture', true);

  v_uuid_suffix := replace(gen_random_uuid()::text, '-', '');

  -- ─── Throwaway-rolle ───────────────────────────────────────────────────
  perform set_config('stork.allow_roles_write', 'true', true);
  insert into core_identity.roles (name, description)
  values ('t9_smoke_role_' || v_uuid_suffix, 'T9 smoke throwaway role')
  returning id into v_role_id;

  -- ─── Throwaway-employees (uden auth_user_id; brugt til placement + acl-tests) ─
  perform set_config('stork.allow_employees_write', 'true', true);
  insert into core_identity.employees (first_name, last_name, email, role_id)
  values ('T9', 'EmpA', 't9_empa_' || v_uuid_suffix || '@test.invalid', v_role_id)
  returning id into v_emp_a_id;

  insert into core_identity.employees (first_name, last_name, email, role_id)
  values ('T9', 'EmpB', 't9_empb_' || v_uuid_suffix || '@test.invalid', v_role_id)
  returning id into v_emp_b_id;

  -- ─── T1: Permission-elementer FK-kæde ─────────────────────────────────
  insert into core_identity.permission_areas (name) values ('test_area_' || v_uuid_suffix) returning id into v_area_id;
  insert into core_identity.permission_pages (area_id, name) values (v_area_id, 'test_page_' || v_uuid_suffix) returning id into v_page_id;
  insert into core_identity.permission_tabs (page_id, name) values (v_page_id, 'test_tab_' || v_uuid_suffix) returning id into v_tab_id;

  if not exists (
    select 1 from core_identity.permission_tabs t
    join core_identity.permission_pages p on p.id = t.page_id
    join core_identity.permission_areas a on a.id = p.area_id
    where t.id = v_tab_id and a.id = v_area_id
  ) then
    raise exception 'T1 FAIL: FK-kæde area→page→tab brudt';
  end if;

  -- ─── T2: Grants — CHECK kræver præcis ét element-niveau ───────────────
  begin
    v_caught := null;
    insert into core_identity.role_permission_grants
      (role_id, area_id, page_id, tab_id, can_access, can_write, visibility)
    values
      (v_role_id, v_area_id, v_page_id, null, true, false, 'self');
  exception when sqlstate '23514' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T2 FAIL: CHECK skal afvise to element-niveauer sat samtidigt';
  end if;

  begin
    v_caught := null;
    insert into core_identity.role_permission_grants
      (role_id, area_id, page_id, tab_id, can_access, can_write, visibility)
    values
      (v_role_id, null, null, null, true, false, 'self');
  exception when sqlstate '23514' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T2 FAIL: CHECK skal afvise ingen element-niveau';
  end if;

  insert into core_identity.role_permission_grants
    (role_id, area_id, page_id, tab_id, can_access, can_write, visibility)
  values
    (v_role_id, v_area_id, null, null, true, false, 'all')
  returning id into v_grant_id;

  -- ─── T3: permission_resolve arve fra area → page → tab ───────────────
  select * into v_resolve from core_identity.permission_resolve(v_role_id, 'tab', v_tab_id);
  if v_resolve.can_access <> true or v_resolve.visibility <> 'all' then
    raise exception 'T3 FAIL: tab-resolve skulle arve fra area (can_access=%, visibility=%)', v_resolve.can_access, v_resolve.visibility;
  end if;

  insert into core_identity.role_permission_grants
    (role_id, area_id, page_id, tab_id, can_access, can_write, visibility)
  values
    (v_role_id, null, v_page_id, null, true, true, 'subtree');

  select * into v_resolve from core_identity.permission_resolve(v_role_id, 'page', v_page_id);
  if v_resolve.can_write <> true or v_resolve.visibility <> 'subtree' then
    raise exception 'T3 FAIL: page-resolve skulle bruge page-grant (can_write=%, visibility=%)', v_resolve.can_write, v_resolve.visibility;
  end if;

  -- ─── T4: acl_subtree_org_nodes/employees med throwaway placement ─────
  v_root_id := gen_random_uuid();
  v_dept_id := gen_random_uuid();
  v_team_id := gen_random_uuid();
  insert into core_identity.org_nodes (id) values (v_root_id), (v_dept_id), (v_team_id);
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
  values
    (v_root_id, 'Root_' || v_uuid_suffix, null, 'department', true, current_date - 10),
    (v_dept_id, 'Dept_' || v_uuid_suffix, v_root_id, 'department', true, current_date - 10),
    (v_team_id, 'Team_' || v_uuid_suffix, v_dept_id, 'team', true, current_date - 10);

  insert into core_identity.employee_node_placements
    (employee_id, node_id, effective_from)
  values
    (v_emp_a_id, v_dept_id, current_date - 5);

  v_subtree := core_identity.acl_subtree_org_nodes(v_emp_a_id);
  if not (v_dept_id = any(v_subtree)) then
    raise exception 'T4 FAIL: acl_subtree_org_nodes(emp_a) mangler dept (subtree=%)', v_subtree;
  end if;
  if not (v_team_id = any(v_subtree)) then
    raise exception 'T4 FAIL: acl_subtree_org_nodes(emp_a) mangler team (subtree=%)', v_subtree;
  end if;

  insert into core_identity.employee_node_placements
    (employee_id, node_id, effective_from)
  values
    (v_emp_b_id, v_team_id, current_date - 5);

  v_subtree := core_identity.acl_subtree_employees(v_emp_a_id);
  if not (v_emp_b_id = any(v_subtree)) then
    raise exception 'T4 FAIL: acl_subtree_employees(emp_a) mangler emp_b (subtree=%)', v_subtree;
  end if;

  -- ─── T5: acl_visibility_check ────────────────────────────────────────
  if not core_identity.acl_visibility_check(v_emp_a_id, v_emp_b_id, 'employee', 'all') then
    raise exception 'T5 FAIL: visibility=all skal returnere true';
  end if;

  if core_identity.acl_visibility_check(v_emp_a_id, v_emp_b_id, 'employee', 'self') then
    raise exception 'T5 FAIL: visibility=self skal afvise non-self';
  end if;
  if not core_identity.acl_visibility_check(v_emp_a_id, v_emp_a_id, 'employee', 'self') then
    raise exception 'T5 FAIL: visibility=self skal acceptere self';
  end if;

  if not core_identity.acl_visibility_check(v_emp_a_id, v_emp_b_id, 'employee', 'subtree') then
    raise exception 'T5 FAIL: visibility=subtree skal acceptere emp_b i emp_a subtree';
  end if;

  raise notice 'T9 Steps 6+7 smoke: ALL TESTS PASSED (T1-T5)';
end;
$test$;

rollback;
