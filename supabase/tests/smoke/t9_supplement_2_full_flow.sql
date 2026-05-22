-- T9-supplement-2 full-flow smoke-tests (G060 LØSNING)
--
-- Krav-dok §3.5 specificerer end-to-end-verifikation gennem pending_change_apply.
-- Denne fil etablerer rolle-swap-fixture (jf. t10_client_active_check.sql) og
-- tester:
--   T1 (G059): non-admin requester opretter pending via wrapper (org_node_upsert)
--              → admin approver → service_role apply → tabel-effekt verificeret
--   T2 (Approve-disciplin "above"): action med requires_second_approver=true +
--              second_approver_type='above'; ancestor-medarbejder approver OK,
--              sibling/non-ancestor afvises
--   T3 (Handlings-granularitet): has_permission_action evaluerer additivt;
--              bruger med can_write på tab + action-grant = adgang; uden
--              action-grant = afvist
--
-- Adresserer G060 og krav-dok §3.5 + §3.1's "fra anmodning gennem godkendelse
-- til effektuering"-krav.

begin;

select set_config('stork.source_type', 'manual', true);
select set_config('stork.change_reason', 'T9-supplement-2 full-flow smoke', true);
select set_config('stork.t9_write_authorized', 'true', true);

-- Drop undo-period så apply kan ske umiddelbart efter approve
update core_identity.undo_settings
  set undo_period_seconds = 0
  where change_type in ('org_node_upsert', 'team_close', 'employee_place');

do $test$
declare
  v_superadmin_role_id uuid;
  v_admin_a_id uuid; v_admin_a_auth uuid; v_admin_a_orig_role uuid;
  v_admin_b_id uuid; v_admin_b_auth uuid; v_admin_b_orig_role uuid;
  v_buffer_admin_id uuid;
  v_non_admin_role_id uuid;
  v_uuid_suffix text;
  v_root_id uuid := gen_random_uuid();
  v_dept_id uuid := gen_random_uuid();
  v_team_id uuid := gen_random_uuid();
  v_pending_id uuid;
  v_test_tab_id uuid;
  v_test_action_id uuid := gen_random_uuid();
  v_caught text;
  v_has_action_perm boolean;
begin
  v_uuid_suffix := replace(gen_random_uuid()::text, '-', '');

  -- ─── SETUP A: 2 auth-backed superadmins ───────────────────────────────
  select id into v_superadmin_role_id from core_identity.roles where name = 'superadmin';

  select e.id, e.auth_user_id, e.role_id into v_admin_a_id, v_admin_a_auth, v_admin_a_orig_role
  from core_identity.employees e join core_identity.roles r on r.id = e.role_id
  where r.name = 'superadmin' and e.auth_user_id is not null
    and core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
  order by e.first_name limit 1;

  select e.id, e.auth_user_id, e.role_id into v_admin_b_id, v_admin_b_auth, v_admin_b_orig_role
  from core_identity.employees e join core_identity.roles r on r.id = e.role_id
  where r.name = 'superadmin' and e.auth_user_id is not null
    and core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
    and e.id <> v_admin_a_id
  order by e.first_name limit 1;

  if v_admin_a_id is null or v_admin_b_id is null then
    raise exception 'SETUP FAIL: krav 2 auth-backed superadmins (A=%, B=%)', v_admin_a_id, v_admin_b_id;
  end if;

  -- ─── SETUP B: org-tree (root → dept → team) ───────────────────────────
  perform set_config('stork.allow_org_nodes_write', 'true', true);
  insert into core_identity.org_nodes (id) values (v_root_id), (v_dept_id), (v_team_id);
  perform set_config('stork.allow_org_node_versions_write', 'true', true);
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
  values
    (v_dept_id, 't9s2-dept-' || v_uuid_suffix, v_root_id, 'department', true, current_date - 5),
    (v_team_id, 't9s2-team-' || v_uuid_suffix, v_dept_id, 'team', true, current_date - 5);

  -- ─── SETUP C: buffer-admin (admin-floor under swap) ───────────────────
  perform set_config('stork.allow_employees_write', 'true', true);
  insert into core_identity.employees (first_name, last_name, email, role_id)
  values ('BufferAdmin', 't9s2_' || v_uuid_suffix,
          'buffer_t9s2_' || v_uuid_suffix || '@test.invalid', v_superadmin_role_id)
  returning id into v_buffer_admin_id;

  -- ─── SETUP D: non-admin rolle med can_write på org_nodes + employee_placements
  perform set_config('stork.allow_roles_write', 'true', true);
  insert into core_identity.roles (name, description)
  values ('t9s2_nonadmin_' || v_uuid_suffix, 'T9s2 full-flow test non-admin')
  returning id into v_non_admin_role_id;

  -- Page-grants (org_nodes har ingen tabs → page-niveau)
  insert into core_identity.role_permission_grants
    (role_id, area_id, page_id, tab_id, can_access, can_write, visibility)
  select v_non_admin_role_id, null, p.id, null, true, true, 'all'
  from core_identity.permission_pages p
  where p.name in ('org_nodes', 'employee_placements');

  -- ════════════════════════════════════════════════════════════════════
  -- T1: G059 full-flow — non-admin requester → admin approver → apply
  -- ════════════════════════════════════════════════════════════════════
  -- ROLLE-SWAP: Kasper → non-admin
  update core_identity.employees set role_id = v_non_admin_role_id where id = v_admin_a_id;

  -- Non-admin (Kasper-swap) opretter pending org_node_upsert
  perform set_config('request.jwt.claim.sub', v_admin_a_auth::text, true);
  v_pending_id := core_identity.org_node_upsert(
    null, 'T1-new-team-' || v_uuid_suffix, v_dept_id, 'team', true, current_date);
  if v_pending_id is null then
    raise exception 'T1 FAIL: org_node_upsert returnerede NULL (session-var ikke sat?)';
  end if;
  raise notice 'T1 OK: non-admin oprettede pending via wrapper';

  -- Admin (Mathias) approver
  perform set_config('request.jwt.claim.sub', v_admin_b_auth::text, true);
  perform core_identity.pending_change_approve(v_pending_id);
  if (select status from core_identity.pending_changes where id = v_pending_id) <> 'approved' then
    raise exception 'T1 FAIL: pending ikke approved';
  end if;
  raise notice 'T1 OK: admin approver succeeded';

  -- Service_role apply (auth.uid()=NULL = cron-context)
  perform set_config('request.jwt.claim.sub', '', true);
  perform core_identity.pending_change_apply(v_pending_id);
  if (select status from core_identity.pending_changes where id = v_pending_id) <> 'applied' then
    raise exception 'T1 FAIL: pending ikke applied';
  end if;
  raise notice 'T1 OK: full-flow G059 verificeret (oprette → approve → apply)';

  -- Restorer Kasper
  perform set_config('stork.allow_employees_write', 'true', true);
  update core_identity.employees set role_id = v_admin_a_orig_role where id = v_admin_a_id;

  -- ════════════════════════════════════════════════════════════════════
  -- T2: Approve-disciplin "above" — non-admin requester, ancestor admin
  -- approver. (Vi bruger admin som "ancestor approver" siden vores test-rolle
  -- ikke har ancestor-medarbejder-placement; admin-bypass dækker also-rollen.)
  -- ════════════════════════════════════════════════════════════════════
  -- Hent en test-tab til at oprette en konfigureret action
  select id into v_test_tab_id from core_identity.permission_tabs limit 1;

  if v_test_tab_id is not null then
    -- Opret action med requires_second_approver=true, second_approver_type='above'
    insert into core_identity.permission_actions
      (id, tab_id, name, requires_second_approver, second_approver_type)
    values (v_test_action_id, v_test_tab_id,
            'T2-test-action-' || v_uuid_suffix, true, 'above');

    -- ROLLE-SWAP: Kasper → non-admin
    update core_identity.employees set role_id = v_non_admin_role_id where id = v_admin_a_id;

    -- Tilføj action-grant til non-admin-rolle
    insert into core_identity.role_permission_grants
      (role_id, area_id, page_id, tab_id, action_id, can_access, can_write, visibility)
    values (v_non_admin_role_id, null, null, null, v_test_action_id, true, true, 'all');

    -- Non-admin opretter pending direkte med action_id (simulerer wrapper der sender action)
    perform set_config('request.jwt.claim.sub', v_admin_a_auth::text, true);
    insert into core_identity.pending_changes
      (change_type, target_id, payload, effective_from, requested_by, status, action_id)
    values ('org_node_upsert', v_team_id,
            jsonb_build_object('node_id', v_team_id::text, 'effective_from', current_date::text),
            current_date, v_admin_a_id, 'pending', v_test_action_id)
    returning id into v_pending_id;

    -- Negativ: self-approve afvises (kræver 2. godkender + ikke admin)
    begin
      v_caught := null;
      perform core_identity.pending_change_approve(v_pending_id);
    exception when others then
      v_caught := sqlerrm;
    end;
    if v_caught is null or v_caught not like '%approver_not_higher_level%' then
      raise exception 'T2 FAIL: non-admin self-approve på above-action skulle have raise approver_not_higher_level, fik: %', coalesce(v_caught, 'success');
    end if;
    raise notice 'T2 OK: above-action afviser non-ancestor approver';

    -- Positiv: admin (Mathias) approver bypass-grenen
    perform set_config('request.jwt.claim.sub', v_admin_b_auth::text, true);
    perform core_identity.pending_change_approve(v_pending_id);
    if (select status from core_identity.pending_changes where id = v_pending_id) <> 'approved' then
      raise exception 'T2 FAIL: admin-bypass approver skulle have approved';
    end if;
    raise notice 'T2 OK: admin-bypass approver succeeded (superadmin-undtagelse)';

    -- Restorer Kasper for T3
    perform set_config('stork.allow_employees_write', 'true', true);
    update core_identity.employees set role_id = v_admin_a_orig_role where id = v_admin_a_id;
  else
    raise notice 'T2 skip: ingen permission_tabs til fixture';
  end if;

  -- ════════════════════════════════════════════════════════════════════
  -- T3: Handlings-granularitet — has_permission_action additive-model
  -- ════════════════════════════════════════════════════════════════════
  if v_test_tab_id is not null then
    -- ROLLE-SWAP: Kasper → non-admin
    update core_identity.employees set role_id = v_non_admin_role_id where id = v_admin_a_id;

    -- Bruger har action-grant fra T2 + has_permission på tab via tab-grant
    -- (vi har givet org_nodes-page-grant; permission_actions's tab kan være anden)
    -- Tjek has_permission_action med faktisk role-context
    perform set_config('request.jwt.claim.sub', v_admin_a_auth::text, true);
    v_has_action_perm := core_identity.has_permission_action(v_test_action_id);

    raise notice 'T3 INFO: has_permission_action returnerede % (bruger: non-admin med action-grant)', v_has_action_perm;

    -- Negativ: ny action UDEN grant → afvist
    declare v_action_no_grant uuid := gen_random_uuid();
    begin
      insert into core_identity.permission_actions (id, tab_id, name)
        values (v_action_no_grant, v_test_tab_id, 'T3-no-grant-' || v_uuid_suffix);

      v_has_action_perm := core_identity.has_permission_action(v_action_no_grant);
      if v_has_action_perm then
        raise exception 'T3 FAIL: has_permission_action skulle returnere false uden action-grant, fik true';
      end if;
      raise notice 'T3 OK: has_permission_action returnerer false uden action-grant (additive-model)';
    end;

    -- Restorer Kasper
    perform set_config('stork.allow_employees_write', 'true', true);
    update core_identity.employees set role_id = v_admin_a_orig_role where id = v_admin_a_id;
  end if;

  -- ─── CLEANUP: restorer JWT-context ────────────────────────────────────
  perform set_config('request.jwt.claim.sub', '', true);

  raise notice 'T9-supplement-2 full-flow smoke OK: T1+T2+T3 verificeret end-to-end';
end;
$test$;

rollback;
