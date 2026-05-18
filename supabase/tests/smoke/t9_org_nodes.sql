-- T9 Step 2 smoke: org_nodes (identity) + org_node_versions + cycle-detect + apply-handlers.
--
-- Plan V6 Beslutning 13 + V5-sweep.
--
-- T1: INSERT identity + version pair via direct apply.
-- T2: Cycle-detect — forsøg på cycle blokeret.
-- T3: Team-har-børn — forsøg på team med barn blokeret.
-- T4: _apply_org_node_upsert NEW node → opretter identity + version.
-- T5: _apply_org_node_upsert EXISTING → UPDATE prior + INSERT new.
-- T6: _apply_org_node_deactivate → luk prior + INSERT is_active=false.
-- T7: Authenticated direkte kald af _apply_*-handlers → permission denied.
-- T8: Partial UNIQUE — to open-ended versions for samme node_id blokeret.
-- T9: EXCLUDE — overlap af versions for samme node_id blokeret.
-- T10: V6 central apply-gate — pending_change_apply afviser future-dated.
--
-- HERMETIC FIXTURE (G053 refactor 2026-05-19):
-- Testen opretter egne throwaway-rolle, employees og uuid-suffixed node-navne.
-- Assertions filtrerer på fixture-node ID'er. Ingen brug af mg@/km@.

begin;

do $test$
declare
  v_caught text;
  v_root_id uuid;
  v_dept_id uuid;
  v_team_id uuid;
  v_role_id uuid;
  v_emp_a_id uuid;
  v_emp_b_id uuid;
  v_pending_id uuid;
  v_count integer;
  v_uuid_suffix text;
  v_apply_root_id uuid;
  v_apply_name text;
  v_renamed_name text;
begin
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'T9 step 2 smoke hermetic fixture', true);

  v_uuid_suffix := replace(gen_random_uuid()::text, '-', '');
  v_apply_name := 'ApplyTestRoot_' || v_uuid_suffix;
  v_renamed_name := 'ApplyTestRootRENAMED_' || v_uuid_suffix;

  -- ─── Throwaway-rolle + employees (til pending-row actors) ────────────
  perform set_config('stork.allow_roles_write', 'true', true);
  insert into core_identity.roles (name, description)
  values ('t9_smoke_role_' || v_uuid_suffix, 'T9 org_nodes smoke role')
  returning id into v_role_id;

  perform set_config('stork.allow_employees_write', 'true', true);
  insert into core_identity.employees (first_name, last_name, email, role_id)
  values ('T9', 'EmpA', 't9_empa_' || v_uuid_suffix || '@test.invalid', v_role_id)
  returning id into v_emp_a_id;

  insert into core_identity.employees (first_name, last_name, email, role_id)
  values ('T9', 'EmpB', 't9_empb_' || v_uuid_suffix || '@test.invalid', v_role_id)
  returning id into v_emp_b_id;

  -- ─── T1: INSERT identity + version direkte ────────────────────────────
  v_root_id := gen_random_uuid();
  insert into core_identity.org_nodes (id) values (v_root_id);
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
  values
    (v_root_id, 'TestRoot_' || v_uuid_suffix, null, 'department', true, current_date);

  if not exists (
    select 1 from core_identity.org_node_versions
    where node_id = v_root_id and effective_to is null
  ) then
    raise exception 'T1 FAIL: version-row mangler efter INSERT';
  end if;

  -- ─── T2: Cycle-detect blokeret ────────────────────────────────────────
  v_dept_id := gen_random_uuid();
  insert into core_identity.org_nodes (id) values (v_dept_id);
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
  values
    (v_dept_id, 'TestDept_' || v_uuid_suffix, v_root_id, 'department', true, current_date);

  begin
    v_caught := null;
    update core_identity.org_node_versions
    set parent_id = v_dept_id
    where node_id = v_root_id and effective_to is null;
  exception when sqlstate 'P0001' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T2 FAIL: cycle-detect skulle blokere root→dept→root';
  end if;

  -- ─── T3: Team-har-børn blokeret ───────────────────────────────────────
  v_team_id := gen_random_uuid();
  insert into core_identity.org_nodes (id) values (v_team_id);
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
  values
    (v_team_id, 'TestTeam_' || v_uuid_suffix, v_dept_id, 'team', true, current_date);

  begin
    v_caught := null;
    declare v_child_id uuid := gen_random_uuid();
    begin
      insert into core_identity.org_nodes (id) values (v_child_id);
      insert into core_identity.org_node_versions
        (node_id, name, parent_id, node_type, is_active, effective_from)
      values
        (v_child_id, 'TestChild_' || v_uuid_suffix, v_team_id, 'team', true, current_date);
    end;
  exception when sqlstate 'P0001' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T3 FAIL: team-har-børn-blokering virkede ikke';
  end if;

  -- ─── T4: _apply_org_node_upsert NEW node ──────────────────────────────
  insert into core_identity.pending_changes
    (change_type, target_id, payload, effective_from, requested_by, status, approved_by, approved_at, undo_deadline)
  values
    ('org_node_upsert', null,
     jsonb_build_object(
       'name', v_apply_name,
       'parent_id', null,
       'node_type', 'department',
       'is_active', true,
       'effective_from', current_date::text
     ),
     current_date, v_emp_a_id, 'approved', v_emp_b_id,
     now() - interval '1 hour', now() - interval '30 minutes')
  returning id into v_pending_id;

  perform core_identity._apply_org_node_upsert(
    (select payload from core_identity.pending_changes where id = v_pending_id),
    v_pending_id
  );

  select count(*) into v_count
  from core_identity.org_node_versions
  where name = v_apply_name and effective_to is null;

  if v_count <> 1 then
    raise exception 'T4 FAIL: _apply_org_node_upsert oprettede ikke version (count=%)', v_count;
  end if;

  -- ─── T5: _apply_org_node_upsert EXISTING node (rename) ────────────────
  select node_id into v_apply_root_id
  from core_identity.org_node_versions
  where name = v_apply_name and effective_to is null
  limit 1;

  perform core_identity._apply_org_node_upsert(
    jsonb_build_object(
      'id', v_apply_root_id::text,
      'name', v_renamed_name,
      'parent_id', null,
      'node_type', 'department',
      'is_active', true,
      'effective_from', (current_date + 1)::text
    ),
    null
  );

  select count(*) into v_count
  from core_identity.org_node_versions
  where node_id = v_apply_root_id;
  if v_count <> 2 then
    raise exception 'T5 FAIL: efter UPDATE skal have 2 versions (got %)', v_count;
  end if;

  if not exists (
    select 1 from core_identity.org_node_versions
    where node_id = v_apply_root_id and name = v_renamed_name and effective_to is null
  ) then
    raise exception 'T5 FAIL: ny version med renamed name mangler';
  end if;

  -- ─── T6: _apply_org_node_deactivate ───────────────────────────────────
  perform core_identity._apply_org_node_deactivate(
    jsonb_build_object(
      'node_id', v_apply_root_id::text,
      'effective_from', (current_date + 2)::text
    ),
    null
  );

  if not exists (
    select 1 from core_identity.org_node_versions
    where node_id = v_apply_root_id and is_active = false and effective_to is null
  ) then
    raise exception 'T6 FAIL: deactivate-version mangler eller has wrong is_active';
  end if;

  -- ─── T7: Authenticated kald af _apply_*-handlers → permission denied ──
  begin
    v_caught := null;
    set local role authenticated;
    perform core_identity._apply_org_node_upsert(
      jsonb_build_object('name', 'authtest_' || v_uuid_suffix, 'node_type', 'department', 'is_active', true, 'effective_from', current_date::text),
      null
    );
    reset role;
  exception when sqlstate '42501' then
    v_caught := 'ok';
    reset role;
  end;
  if v_caught is null then
    raise exception 'T7 FAIL: authenticated direkte kald af _apply_org_node_upsert skal afvises';
  end if;

  -- ─── T8: Partial UNIQUE — to open-ended versions blokeret ─────────────
  begin
    v_caught := null;
    insert into core_identity.org_node_versions
      (node_id, name, parent_id, node_type, is_active, effective_from)
    values
      (v_root_id, 'DuplicateOpen_' || v_uuid_suffix, null, 'department', true, current_date + 10);
  exception when sqlstate '23505' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T8 FAIL: to open-ended versions skal blokeres af partial UNIQUE';
  end if;

  -- ─── T9: EXCLUDE — overlap blokeret ───────────────────────────────────
  update core_identity.org_node_versions
  set effective_to = current_date + 100
  where node_id = v_root_id and effective_to is null;

  begin
    v_caught := null;
    insert into core_identity.org_node_versions
      (node_id, name, parent_id, node_type, is_active, effective_from, effective_to)
    values
      (v_root_id, 'Overlap_' || v_uuid_suffix, null, 'department', true, current_date + 50, current_date + 150);
  exception when sqlstate '23P01' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T9 FAIL: overlap-version skal blokeres af EXCLUDE';
  end if;

  -- ─── T10: V6 central apply-gate — future-dated afvises ───────────────
  insert into core_identity.pending_changes
    (change_type, target_id, payload, effective_from, requested_by, status, approved_by, approved_at, undo_deadline)
  values
    ('org_node_upsert', null,
     jsonb_build_object('name','Future_' || v_uuid_suffix,'node_type','department','is_active',true,'effective_from',(current_date+30)::text),
     current_date + 30, v_emp_a_id, 'approved', v_emp_b_id,
     now() - interval '1 hour', now() - interval '30 minutes')
  returning id into v_pending_id;

  begin
    v_caught := null;
    perform core_identity.pending_change_apply(v_pending_id);
  exception when sqlstate '22023' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T10 FAIL: pending_change_apply skal afvise future-dated (V6 central gate)';
  end if;

  raise notice 'T9 Step 2 smoke: ALL TESTS PASSED (T1-T10)';
end;
$test$;

rollback;
