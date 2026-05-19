-- T9-supplement smoke: backdated historical traversal i alle 7 apply-handlers.
--
-- V4 plan Valg 1 + V2 KRITISK 4: split-at-boundary-mønster med per-tabel
-- close-branches. Verificerer alle 5 edge-cases for place/upsert-handlers og
-- per-tabel exact-start-branches for close-handlers.
--
-- HERMETIC FIXTURE (G053): Throwaway-rolle, employees, org-tree, client-IDs.

begin;

do $test$
declare
  v_uuid_suffix text;
  v_role_id uuid;
  v_emp_a_id uuid;
  v_node_root_id uuid;
  v_node_dept_id uuid;
  v_node_team_a_id uuid;
  v_node_team_b_id uuid;
  v_client_id uuid := gen_random_uuid();
  v_count integer;
  v_first_node uuid;
  v_second_node uuid;
  v_third_node uuid;
begin
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'T9-supplement backdated traversal smoke', true);
  v_uuid_suffix := replace(gen_random_uuid()::text, '-', '');

  -- ─── Fixture: throwaway-rolle + employee + org-tree ─────────────────────
  perform set_config('stork.allow_roles_write', 'true', true);
  insert into core_identity.roles (name, description)
  values ('t9_supplement_role_' || v_uuid_suffix, 'T9-supplement backdated smoke')
  returning id into v_role_id;

  perform set_config('stork.allow_employees_write', 'true', true);
  insert into core_identity.employees (first_name, last_name, email, role_id)
  values ('T9S', 'EmpA', 't9s_empa_' || v_uuid_suffix || '@test.invalid', v_role_id)
  returning id into v_emp_a_id;

  v_node_root_id := gen_random_uuid();
  v_node_dept_id := gen_random_uuid();
  v_node_team_a_id := gen_random_uuid();
  v_node_team_b_id := gen_random_uuid();
  insert into core_identity.org_nodes (id) values (v_node_root_id),(v_node_dept_id),(v_node_team_a_id),(v_node_team_b_id);
  insert into core_identity.org_node_versions (node_id, name, parent_id, node_type, is_active, effective_from) values
    (v_node_root_id, 'Root_' || v_uuid_suffix, null, 'department', true, current_date - 200),
    (v_node_dept_id, 'Dept_' || v_uuid_suffix, v_node_root_id, 'department', true, current_date - 200),
    (v_node_team_a_id, 'TeamA_' || v_uuid_suffix, v_node_dept_id, 'team', true, current_date - 200),
    (v_node_team_b_id, 'TeamB_' || v_uuid_suffix, v_node_dept_id, 'team', true, current_date - 200);

  -- ═══════════════════════════════════════════════════════════════════════
  -- BLOCK 1 — _apply_employee_place: pre-history + exact-start + split
  -- ═══════════════════════════════════════════════════════════════════════

  -- Setup: A placeret 2026-04-01 → 2026-06-01, B placeret 2026-06-01 → ∞
  -- Brug direkte INSERT for at simulere etableret historik.
  insert into core_identity.employee_node_placements (employee_id, node_id, effective_from, effective_to) values
    (v_emp_a_id, v_node_team_a_id, '2026-04-01', '2026-06-01'),
    (v_emp_a_id, v_node_team_b_id, '2026-06-01', null);

  -- T1: BACKDATED til 2026-05-15 (inde i A-intervallet) → split A
  -- Forventet: existing team_a [2026-04-01, 2026-06-01) splittes til
  --   team_a [2026-04-01, 2026-05-15) (luknings-branch)
  --   team_a [2026-05-15, 2026-06-01) (ny backdated row)
  --   team_b [2026-06-01, null) (uændret)
  -- Codex KRITISK 2: Assert direkte mod tabel — RPC kræver auth-context vi
  -- ikke har i smoke-tx, og denne test handler om backdated traversal, ikke
  -- read-gates.
  perform core_identity._apply_employee_place(
    jsonb_build_object('employee_id', v_emp_a_id::text, 'node_id', v_node_team_a_id::text, 'effective_from', '2026-05-15'),
    null
  );

  -- Luknings-branch: team_a [2026-04-01, 2026-05-15)
  if not exists (
    select 1 from core_identity.employee_node_placements
    where employee_id = v_emp_a_id and node_id = v_node_team_a_id
      and effective_from = '2026-04-01' and effective_to = '2026-05-15'
  ) then
    raise exception 'T1 FAIL: luknings-branch team_a [2026-04-01, 2026-05-15) mangler';
  end if;

  -- Backdated-branch: team_a [2026-05-15, 2026-06-01)
  if not exists (
    select 1 from core_identity.employee_node_placements
    where employee_id = v_emp_a_id and node_id = v_node_team_a_id
      and effective_from = '2026-05-15' and effective_to = '2026-06-01'
  ) then
    raise exception 'T1 FAIL: backdated row team_a [2026-05-15, 2026-06-01) mangler';
  end if;

  -- team_b [2026-06-01, null) uændret
  if not exists (
    select 1 from core_identity.employee_node_placements
    where employee_id = v_emp_a_id and node_id = v_node_team_b_id
      and effective_from = '2026-06-01' and effective_to is null
  ) then
    raise exception 'T1 FAIL: team_b [2026-06-01, null) skulle være uændret';
  end if;

  -- T2: PRE-HISTORY backdating til 2026-03-15 (før alle existing intervals)
  perform core_identity._apply_employee_place(
    jsonb_build_object('employee_id', v_emp_a_id::text, 'node_id', v_node_team_a_id::text, 'effective_from', '2026-03-15'),
    null
  );
  -- Forventet: ny row team_a [2026-03-15, 2026-04-01) (efterfølgende interval)
  if not exists (
    select 1 from core_identity.employee_node_placements
    where employee_id = v_emp_a_id and effective_from = '2026-03-15' and effective_to = '2026-04-01'
  ) then
    raise exception 'T2 FAIL: pre-history row [2026-03-15, 2026-04-01) mangler';
  end if;

  -- T3: EXACT-START på 2026-04-01 (matcher existing effective_from)
  -- Forventet: UPDATE den eksisterende row (ingen ny INSERT), undgår zero-length
  select count(*) into v_count from core_identity.employee_node_placements where employee_id = v_emp_a_id and effective_from = '2026-04-01';
  if v_count <> 1 then raise exception 'T3 setup FAIL'; end if;
  perform core_identity._apply_employee_place(
    jsonb_build_object('employee_id', v_emp_a_id::text, 'node_id', v_node_team_b_id::text, 'effective_from', '2026-04-01'),
    null
  );
  select count(*) into v_count from core_identity.employee_node_placements where employee_id = v_emp_a_id and effective_from = '2026-04-01';
  if v_count <> 1 then raise exception 'T3 FAIL: exact-start skulle UPDATE, ikke INSERT (count=%)', v_count; end if;

  -- ═══════════════════════════════════════════════════════════════════════
  -- BLOCK 2 — _apply_employee_remove: per-tabel exact-start (DELETE)
  -- ═══════════════════════════════════════════════════════════════════════
  -- Reset fixture for employee-remove tests.
  delete from core_identity.employee_node_placements where employee_id = v_emp_a_id;
  insert into core_identity.employee_node_placements (employee_id, node_id, effective_from, effective_to) values
    (v_emp_a_id, v_node_team_a_id, '2026-04-01', null);

  -- T4: EXACT-START remove (matcher existing.effective_from) → DELETE
  perform core_identity._apply_employee_remove(
    jsonb_build_object('employee_id', v_emp_a_id::text, 'effective_from', '2026-04-01'),
    null
  );
  if exists (select 1 from core_identity.employee_node_placements where employee_id = v_emp_a_id) then
    raise exception 'T4 FAIL: exact-start remove skulle DELETE row';
  end if;

  -- T5: SPLIT-close remove (inde i existing interval)
  insert into core_identity.employee_node_placements (employee_id, node_id, effective_from, effective_to) values
    (v_emp_a_id, v_node_team_a_id, '2026-04-01', null);
  perform core_identity._apply_employee_remove(
    jsonb_build_object('employee_id', v_emp_a_id::text, 'effective_from', '2026-05-15'),
    null
  );
  if not exists (
    select 1 from core_identity.employee_node_placements
    where employee_id = v_emp_a_id and effective_from = '2026-04-01' and effective_to = '2026-05-15'
  ) then
    raise exception 'T5 FAIL: split-close skulle lukke interval ved 2026-05-15';
  end if;

  -- T6: NO-active remove → idempotent
  perform core_identity._apply_employee_remove(
    jsonb_build_object('employee_id', v_emp_a_id::text, 'effective_from', '2099-01-01'),
    null
  );
  -- Skulle ikke raise, ikke ændre state.

  -- ═══════════════════════════════════════════════════════════════════════
  -- BLOCK 3 — _apply_client_place + _apply_client_close (parallelt mønster)
  -- ═══════════════════════════════════════════════════════════════════════
  insert into core_identity.client_node_placements (client_id, node_id, effective_from, effective_to) values
    (v_client_id, v_node_team_a_id, '2026-04-01', '2026-06-01'),
    (v_client_id, v_node_team_b_id, '2026-06-01', null);

  -- T7: client backdating split
  perform core_identity._apply_client_place(
    jsonb_build_object('client_id', v_client_id::text, 'node_id', v_node_team_a_id::text, 'effective_from', '2026-05-15'),
    null
  );
  if not exists (
    select 1 from core_identity.client_node_placements
    where client_id = v_client_id and effective_from = '2026-05-15' and effective_to = '2026-06-01'
  ) then
    raise exception 'T7 FAIL: client split skulle skabe row [2026-05-15, 2026-06-01)';
  end if;

  -- T8: client close exact-start → DELETE
  delete from core_identity.client_node_placements where client_id = v_client_id;
  insert into core_identity.client_node_placements (client_id, node_id, effective_from, effective_to) values
    (v_client_id, v_node_team_a_id, '2026-04-01', null);
  perform core_identity._apply_client_close(
    jsonb_build_object('client_id', v_client_id::text, 'effective_from', '2026-04-01'),
    null
  );
  if exists (select 1 from core_identity.client_node_placements where client_id = v_client_id) then
    raise exception 'T8 FAIL: client exact-start close skulle DELETE';
  end if;

  -- ═══════════════════════════════════════════════════════════════════════
  -- BLOCK 4 — _apply_org_node_deactivate: exact-start UPDATE in-place
  -- ═══════════════════════════════════════════════════════════════════════
  -- Reset team_a fixture med ren is_active=true version.
  delete from core_identity.org_node_versions where node_id = v_node_team_a_id;
  insert into core_identity.org_node_versions (node_id, name, parent_id, node_type, is_active, effective_from) values
    (v_node_team_a_id, 'TeamA_' || v_uuid_suffix, v_node_dept_id, 'team', true, '2026-04-01');

  -- T9: EXACT-START deactivate → UPDATE is_active=false in-place (én version)
  perform core_identity._apply_org_node_deactivate(
    jsonb_build_object('node_id', v_node_team_a_id::text, 'effective_from', '2026-04-01'),
    null
  );
  select count(*) into v_count from core_identity.org_node_versions where node_id = v_node_team_a_id;
  if v_count <> 1 then raise exception 'T9 FAIL: exact-start deactivate skulle UPDATE in-place (count=%)', v_count; end if;
  if not exists (select 1 from core_identity.org_node_versions where node_id = v_node_team_a_id and is_active = false) then
    raise exception 'T9 FAIL: version skulle have is_active=false';
  end if;

  -- T10: SPLIT-deactivate
  delete from core_identity.org_node_versions where node_id = v_node_team_a_id;
  insert into core_identity.org_node_versions (node_id, name, parent_id, node_type, is_active, effective_from) values
    (v_node_team_a_id, 'TeamA_' || v_uuid_suffix, v_node_dept_id, 'team', true, '2026-04-01');
  perform core_identity._apply_org_node_deactivate(
    jsonb_build_object('node_id', v_node_team_a_id::text, 'effective_from', '2026-05-15'),
    null
  );
  select count(*) into v_count from core_identity.org_node_versions where node_id = v_node_team_a_id;
  if v_count <> 2 then raise exception 'T10 FAIL: split-deactivate skulle give 2 versions (count=%)', v_count; end if;

  -- ═══════════════════════════════════════════════════════════════════════
  -- BLOCK 5 — _apply_org_node_upsert: backdated rename split
  -- ═══════════════════════════════════════════════════════════════════════
  -- Codex runde 1 MELLEM 1: tilføj _apply_org_node_upsert backdated dækning.
  -- Setup: én version af team_b [2026-04-01, null) med navn 'TeamB_<suffix>'.
  -- Backdated rename til 2026-05-15 (inde i intervallet) → split.
  delete from core_identity.org_node_versions where node_id = v_node_team_b_id;
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
  values
    (v_node_team_b_id, 'TeamB_orig_' || v_uuid_suffix, v_node_dept_id, 'team', true, '2026-04-01');

  perform core_identity._apply_org_node_upsert(
    jsonb_build_object(
      'id', v_node_team_b_id::text,
      'name', 'TeamB_renamed_' || v_uuid_suffix,
      'parent_id', v_node_dept_id::text,
      'node_type', 'team',
      'is_active', true,
      'effective_from', '2026-05-15'
    ),
    null
  );
  -- Forventet: 2 versions (lukket original + ny renamed fra 2026-05-15)
  select count(*) into v_count from core_identity.org_node_versions where node_id = v_node_team_b_id;
  if v_count <> 2 then
    raise exception 'T11 FAIL: backdated upsert skulle splitte version (count=%)', v_count;
  end if;
  if not exists (
    select 1 from core_identity.org_node_versions
    where node_id = v_node_team_b_id and name = 'TeamB_renamed_' || v_uuid_suffix
      and effective_from = '2026-05-15' and effective_to is null
  ) then
    raise exception 'T11 FAIL: renamed version [2026-05-15, null) mangler';
  end if;

  -- ═══════════════════════════════════════════════════════════════════════
  -- BLOCK 6 — _apply_team_close: split team-version + cascade luk placements
  -- ═══════════════════════════════════════════════════════════════════════
  -- Reset team_a som team-version + employee+client placement inden i.
  delete from core_identity.org_node_versions where node_id = v_node_team_a_id;
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
  values
    (v_node_team_a_id, 'TeamA_close_' || v_uuid_suffix, v_node_dept_id, 'team', true, '2026-04-01');

  delete from core_identity.employee_node_placements where employee_id = v_emp_a_id;
  insert into core_identity.employee_node_placements (employee_id, node_id, effective_from, effective_to) values
    (v_emp_a_id, v_node_team_a_id, '2026-04-01', null);

  delete from core_identity.client_node_placements where client_id = v_client_id;
  insert into core_identity.client_node_placements (client_id, node_id, effective_from, effective_to) values
    (v_client_id, v_node_team_a_id, '2026-04-01', null);

  -- T12: SPLIT team-close ved 2026-05-15 (midt i interval)
  perform core_identity._apply_team_close(
    jsonb_build_object('node_id', v_node_team_a_id::text, 'effective_from', '2026-05-15'),
    null
  );

  -- Team-version splittet (2 versions: aktiv før, inaktiv efter)
  select count(*) into v_count from core_identity.org_node_versions where node_id = v_node_team_a_id;
  if v_count <> 2 then raise exception 'T12 FAIL: split team-close skulle give 2 versions (count=%)', v_count; end if;

  -- Employee placement lukket på 2026-05-15
  if not exists (
    select 1 from core_identity.employee_node_placements
    where employee_id = v_emp_a_id and node_id = v_node_team_a_id
      and effective_from = '2026-04-01' and effective_to = '2026-05-15'
  ) then
    raise exception 'T12 FAIL: cascade-luk af employee_placement mangler';
  end if;

  -- Client placement lukket på 2026-05-15
  if not exists (
    select 1 from core_identity.client_node_placements
    where client_id = v_client_id and node_id = v_node_team_a_id
      and effective_from = '2026-04-01' and effective_to = '2026-05-15'
  ) then
    raise exception 'T12 FAIL: cascade-luk af client_placement mangler';
  end if;

  raise notice 'T9-supplement backdated traversal: ALL TESTS PASSED (T1-T12)';
end;
$test$;

rollback;
