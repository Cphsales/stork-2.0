-- Trin 10 T10.15: client active-check smoke-test (V7 + V10 + V13 + V14)
--
-- TEST-BEGRÆNSNING: non-admin med auth_user_id kan ikke skabes i smoke-test
-- (employees.auth_user_id har FK til auth.users; auth.users er service-managed
-- og kan ikke INSERTes via smoke-tx). Derfor:
-- - Wrapper-flow-tests (T1, T5, T6): superadmin auth (fungerer fuldt)
-- - Non-admin requester/approver-scenarier (T3, T7, T8): manuel pending-INSERT
--   med specifikke requested_by/approved_by; apply-handler verificerer
--   is_admin_by_employee_id-logic via real employee-rows.
-- Test-pattern matcher T9-supplement-tests (også manuel pending-INSERT hvor
-- auth.users-FK forhindrer wrapper-call).

begin;

select set_config('stork.source_type', 'manual', true);
select set_config('stork.change_reason', 'T10 active-check smoke setup', true);
select set_config('stork.t9_write_authorized', 'true', true);
update core_identity.undo_settings
  set undo_period_seconds = 0
  where change_type in ('client_place', 'client_close');

do $test$
declare
  v_client_id uuid;
  v_client_b_id uuid;
  v_client_c_id uuid;
  v_client_d_id uuid;
  v_client_e_id uuid;
  v_team_node_id uuid := gen_random_uuid();
  v_root_id uuid := gen_random_uuid();
  v_superadmin_auth_id uuid;
  v_superadmin_emp_id uuid;
  v_normal_role_id uuid;
  v_normal_emp_id uuid;
  v_uuid_suffix text;
  v_pending_id uuid;
  v_caught text;
begin
  v_uuid_suffix := replace(gen_random_uuid()::text, '-', '');

  -- Setup: find aktiv superadmin
  select e.id, e.auth_user_id into v_superadmin_emp_id, v_superadmin_auth_id
  from core_identity.employees e
  join core_identity.roles r on r.id = e.role_id
  where r.name = 'superadmin' and e.auth_user_id is not null
    and core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
  limit 1;
  if v_superadmin_auth_id is null then
    raise exception 'SETUP FAIL: ingen aktiv superadmin';
  end if;
  perform set_config('request.jwt.claim.sub', v_superadmin_auth_id::text, true);

  -- Setup: non-admin rolle + employee (UDEN auth_user_id pga. FK-begrænsning)
  perform set_config('stork.allow_roles_write', 'true', true);
  insert into core_identity.roles (name, description)
  values ('t10_active_normal_' || v_uuid_suffix, 'non-admin')
  returning id into v_normal_role_id;

  perform set_config('stork.allow_employees_write', 'true', true);
  insert into core_identity.employees (first_name, last_name, email, role_id)
  values ('Normal', 'T10', 'normal_' || v_uuid_suffix || '@test.invalid', v_normal_role_id)
  returning id into v_normal_emp_id;

  -- Setup: org-tree med team
  perform set_config('stork.allow_org_nodes_write', 'true', true);
  insert into core_identity.org_nodes (id) values (v_team_node_id), (v_root_id);
  perform set_config('stork.allow_org_node_versions_write', 'true', true);
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
  values (v_team_node_id, 't10-active team', v_root_id, 'team', true, current_date - 5);

  -- ═════════════════════════════════════════════════════════════════════
  -- T1: superadmin wrapper-flow på aktiv klient → success
  -- ═════════════════════════════════════════════════════════════════════
  v_client_id := core_identity.client_upsert('t10-active klient', '{}'::jsonb,
    'T1 opret', true, null);
  v_pending_id := core_identity.client_node_place(v_client_id, v_team_node_id, current_date - 1);
  perform core_identity.pending_change_approve(v_pending_id);
  perform core_identity.pending_change_apply(v_pending_id);
  if not exists (
    select 1 from core_identity.client_node_placements
    where client_id = v_client_id and node_id = v_team_node_id and effective_to is null
  ) then
    raise exception 'T1 FAIL: placement mangler';
  end if;

  -- ═════════════════════════════════════════════════════════════════════
  -- T2: deaktiver klient → apply-handler ramme aktiv-check uden admin → P0001
  -- (Wrapper-test for inaktiv kræver non-admin auth; smoke-test bruger
  -- direct _apply_client_place med null pending → ingen admin-involved.)
  -- ═════════════════════════════════════════════════════════════════════
  perform core_identity.client_set_active(v_client_id, false, 'T2 deaktiver');
  begin
    v_caught := null;
    perform core_identity._apply_client_place(
      jsonb_build_object('client_id', v_client_id::text,
                         'node_id', v_team_node_id::text,
                         'effective_from', current_date::text),
      null
    );
  exception when sqlstate 'P0001' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T2 FAIL: apply skal P0001 ved inaktiv klient uden admin-bypass';
  end if;

  -- ═════════════════════════════════════════════════════════════════════
  -- T3 (apply-path P0001): non-admin requester + non-admin approver
  -- Manuel pending-INSERT (auth.users-FK forhindrer non-admin wrapper-flow).
  -- ═════════════════════════════════════════════════════════════════════
  v_client_b_id := core_identity.client_upsert('t10-active klient B', '{}'::jsonb,
    'T3 opret', true, null);

  v_pending_id := gen_random_uuid();
  perform set_config('stork.t9_write_authorized', 'true', true);
  insert into core_identity.pending_changes
    (id, change_type, target_id, payload, effective_from, requested_by,
     approved_by, approved_at, undo_deadline, status)
  values
    (v_pending_id, 'client_place', v_client_b_id,
     jsonb_build_object('client_id', v_client_b_id::text,
                        'node_id', v_team_node_id::text,
                        'effective_from', current_date::text),
     current_date, v_normal_emp_id, v_normal_emp_id, now(), now(), 'approved');

  perform core_identity.client_set_active(v_client_b_id, false, 'T3 deaktiver mens pending');

  begin
    v_caught := null;
    perform core_identity.pending_change_apply(v_pending_id);
  exception when sqlstate 'P0001' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T3 FAIL: apply skal P0001 ved inaktiv + non-admin requester+approver';
  end if;

  -- ═════════════════════════════════════════════════════════════════════
  -- T4: client_node_close på inaktiv klient → success (ingen aktiv-check)
  -- ═════════════════════════════════════════════════════════════════════
  v_pending_id := core_identity.client_node_close(v_client_id, current_date);
  perform core_identity.pending_change_approve(v_pending_id);
  perform core_identity.pending_change_apply(v_pending_id);
  if not exists (
    select 1 from core_identity.client_node_placements
    where client_id = v_client_id and effective_to is not null
  ) then
    raise exception 'T4 FAIL: close skulle lukke placement på inaktiv klient';
  end if;

  -- ═════════════════════════════════════════════════════════════════════
  -- T4a (V14): client_node_close på non-existent client_id → P0002
  -- ═════════════════════════════════════════════════════════════════════
  begin
    v_caught := null;
    perform core_identity.client_node_close(gen_random_uuid(), current_date);
  exception when sqlstate 'P0002' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T4a FAIL (V14): close skal P0002 ved non-existent client_id';
  end if;

  -- ═════════════════════════════════════════════════════════════════════
  -- T5 (superadmin-bypass wrapper): superadmin → place inaktiv → success
  -- ═════════════════════════════════════════════════════════════════════
  v_client_c_id := core_identity.client_upsert('t10-active klient C', '{}'::jsonb,
    'T5 opret', true, null);
  perform core_identity.client_set_active(v_client_c_id, false, 'T5 deaktiver');

  v_pending_id := core_identity.client_node_place(v_client_c_id, v_team_node_id, current_date);
  perform core_identity.pending_change_approve(v_pending_id);
  perform core_identity.pending_change_apply(v_pending_id);
  if not exists (
    select 1 from core_identity.client_node_placements
    where client_id = v_client_c_id and effective_to is null
  ) then
    raise exception 'T5 FAIL: superadmin-bypass skulle tillade place på inaktiv';
  end if;

  -- ═════════════════════════════════════════════════════════════════════
  -- T6 (V10 cron-context): superadmin wrapper-flow → race deaktivering → apply success
  -- ═════════════════════════════════════════════════════════════════════
  v_client_d_id := core_identity.client_upsert('t10-active klient D', '{}'::jsonb,
    'T6 opret', true, null);
  v_pending_id := core_identity.client_node_place(v_client_d_id, v_team_node_id, current_date);
  perform core_identity.pending_change_approve(v_pending_id);
  perform core_identity.client_set_active(v_client_d_id, false, 'T6 deaktiver mens approved');
  perform core_identity.pending_change_apply(v_pending_id);
  if not exists (
    select 1 from core_identity.client_node_placements
    where client_id = v_client_d_id and effective_to is null
  ) then
    raise exception 'T6 FAIL (V10): superadmin-requester bypass skulle tillade apply';
  end if;

  -- ═════════════════════════════════════════════════════════════════════
  -- T7 (V10): non-admin requester + superadmin approver via manuel INSERT
  -- Pattern: simulér scenario hvor non-admin opretter, admin approver
  -- (auth.users-FK forhindrer ren wrapper-flow for non-admin requester).
  -- ═════════════════════════════════════════════════════════════════════
  v_client_e_id := core_identity.client_upsert('t10-active klient E', '{}'::jsonb,
    'T7 opret', true, null);

  v_pending_id := gen_random_uuid();
  perform set_config('stork.t9_write_authorized', 'true', true);
  insert into core_identity.pending_changes
    (id, change_type, target_id, payload, effective_from, requested_by,
     approved_by, approved_at, undo_deadline, status)
  values
    (v_pending_id, 'client_place', v_client_e_id,
     jsonb_build_object('client_id', v_client_e_id::text,
                        'node_id', v_team_node_id::text,
                        'effective_from', current_date::text),
     current_date, v_normal_emp_id, v_superadmin_emp_id, now(), now(), 'approved');

  perform core_identity.client_set_active(v_client_e_id, false, 'T7 deaktiver');

  -- Apply: approver=superadmin → bypass via is_admin_by_employee_id(approved_by)
  perform core_identity.pending_change_apply(v_pending_id);
  if not exists (
    select 1 from core_identity.client_node_placements
    where client_id = v_client_e_id and effective_to is null
  ) then
    raise exception 'T7 FAIL (V10): admin-approver bypass skulle tillade apply';
  end if;

  -- ═════════════════════════════════════════════════════════════════════
  -- T8 (V10): non-admin + non-admin → P0001
  -- Identisk apply-path som T3; dækket via T3-assertion ovenfor.
  -- ═════════════════════════════════════════════════════════════════════
  -- T3 verificerede allerede non-admin requester + non-admin approver → P0001.

  raise notice 'T10 active-check smoke: ALL TESTS PASSED (T1-T8 inkl. T4a)';
end;
$test$;

rollback;
