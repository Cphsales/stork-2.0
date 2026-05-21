-- T9 Step 4+5 smoke: employee_node_placements + client_node_placements + apply-handlers.
--
-- Plan V6 Beslutning 3+14 + Valg 4.
--
-- HERMETIC FIXTURE (G053 refactor 2026-05-19):
-- Testen opretter egne throwaway-rolle, employees og org-tree. Ingen brug
-- af mg@/km@. Assertions filtrerer på fixture-employee/-node IDs.

begin;

do $test$
declare
  v_caught text;
  v_root_id uuid;
  v_team_id uuid;
  v_team_b_id uuid;
  v_dept_id uuid;
  v_role_id uuid;
  v_emp_a_id uuid;  -- primær test-target (oprindelig mg@)
  v_emp_b_id uuid;  -- secondary (oprindelig km@; approver/requester-role i pending_changes)
  v_client_id uuid := gen_random_uuid();
  v_pending_id uuid;
  v_count integer;
  v_uuid_suffix text;
begin
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'T9 step 4+5 smoke hermetic fixture', true);

  v_uuid_suffix := replace(gen_random_uuid()::text, '-', '');

  -- ─── Throwaway-rolle + employees ─────────────────────────────────────
  perform set_config('stork.allow_roles_write', 'true', true);
  insert into core_identity.roles (name, description)
  values ('t9_smoke_role_' || v_uuid_suffix, 'T9 placements smoke role')
  returning id into v_role_id;

  perform set_config('stork.allow_employees_write', 'true', true);
  insert into core_identity.employees (first_name, last_name, email, role_id)
  values ('T9', 'EmpA', 't9_empa_' || v_uuid_suffix || '@test.invalid', v_role_id)
  returning id into v_emp_a_id;

  insert into core_identity.employees (first_name, last_name, email, role_id)
  values ('T9', 'EmpB', 't9_empb_' || v_uuid_suffix || '@test.invalid', v_role_id)
  returning id into v_emp_b_id;

  -- ─── Setup throwaway tree (current_date - 10) ────────────────────────
  v_root_id := gen_random_uuid();
  v_dept_id := gen_random_uuid();
  v_team_id := gen_random_uuid();
  v_team_b_id := gen_random_uuid();
  insert into core_identity.org_nodes (id) values (v_root_id), (v_dept_id), (v_team_id), (v_team_b_id);
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
  values
    (v_root_id, 'Root_' || v_uuid_suffix, null, 'department', true, current_date - 10),
    (v_dept_id, 'Dept_' || v_uuid_suffix, v_root_id, 'department', true, current_date - 10),
    (v_team_id, 'TeamA_' || v_uuid_suffix, v_dept_id, 'team', true, current_date - 10),
    (v_team_b_id, 'TeamB_' || v_uuid_suffix, v_dept_id, 'team', true, current_date - 10);

  -- ─── T1: _apply_employee_place ────────────────────────────────────────
  -- Pending-change row med fixture-employees som requested_by/approved_by.
  insert into core_identity.pending_changes
    (change_type, target_id, payload, effective_from, requested_by, status, approved_by, approved_at, undo_deadline)
  values
    ('employee_place', v_emp_a_id::uuid,
     jsonb_build_object('employee_id', v_emp_a_id::text, 'node_id', v_team_id::text, 'effective_from', (current_date - 5)::text),
     current_date - 5, v_emp_b_id, 'approved', v_emp_a_id,
     now() - interval '1 hour', now() - interval '30 minutes')
  returning id into v_pending_id;

  perform core_identity._apply_employee_place(
    (select payload from core_identity.pending_changes where id = v_pending_id),
    v_pending_id
  );

  if not exists (
    select 1 from core_identity.employee_node_placements
    where employee_id = v_emp_a_id and node_id = v_team_id and effective_to is null
  ) then
    raise exception 'T1 FAIL: _apply_employee_place oprettede ikke placement for fixture-employee';
  end if;

  -- ─── T2: _apply_employee_place på allerede placeret (flyt) ────────────
  perform core_identity._apply_employee_place(
    jsonb_build_object('employee_id', v_emp_a_id::text, 'node_id', v_team_b_id::text, 'effective_from', current_date::text),
    null
  );

  -- Count filter på fixture-employee (ikke global state).
  select count(*) into v_count
  from core_identity.employee_node_placements
  where employee_id = v_emp_a_id;
  if v_count <> 2 then
    raise exception 'T2 FAIL: flyt skal give 2 rows for fixture-employee (lukket+åben), got %', v_count;
  end if;

  if not exists (
    select 1 from core_identity.employee_node_placements
    where employee_id = v_emp_a_id and node_id = v_team_b_id and effective_to is null
  ) then
    raise exception 'T2 FAIL: ny placement på team_b mangler';
  end if;

  -- ─── T3: _apply_employee_remove ──────────────────────────────────────
  perform core_identity._apply_employee_remove(
    jsonb_build_object('employee_id', v_emp_a_id::text, 'effective_from', (current_date + 1)::text),
    null
  );

  if exists (
    select 1 from core_identity.employee_node_placements
    where employee_id = v_emp_a_id and effective_to is null
  ) then
    raise exception 'T3 FAIL: efter remove skal ingen open-ended placement findes for fixture-employee';
  end if;

  -- ─── T4: Authenticated direkte kald af _apply_*-handlers afvises ──────
  -- Permission-denied rejection sker FØR handleren rør state; fixture-IDs
  -- bruges som payload-input men handlerens revoke from authenticated
  -- raiser 42501 inden noget INSERT/UPDATE.
  begin
    v_caught := null;
    set local role authenticated;
    perform core_identity._apply_employee_place(
      jsonb_build_object('employee_id', v_emp_a_id::text, 'node_id', v_team_id::text, 'effective_from', current_date::text),
      null
    );
    reset role;
  exception when sqlstate '42501' then
    v_caught := 'ok';
    reset role;
  end;
  if v_caught is null then
    raise exception 'T4 FAIL: authenticated kald skal afvises';
  end if;

  -- ─── T5: _apply_client_place → team-only validering ──────────────────
  -- Trin 10 T10.7a: seed core_identity.clients-fixture FØR _apply_client_place
  -- (FK på client_node_placements.client_id → clients.id kræver eksistens; trin 10
  -- tilføjer aktiv-check i apply-handler der kræver klient findes + aktiv).
  perform set_config('stork.allow_clients_write', 'true', true);
  insert into core_identity.clients (id, name)
  values (v_client_id, 'T9-smoke fixture client')
  on conflict (id) do nothing;

  perform core_identity._apply_client_place(
    jsonb_build_object('client_id', v_client_id::text, 'node_id', v_team_id::text, 'effective_from', current_date::text),
    null
  );

  if not exists (
    select 1 from core_identity.client_node_placements
    where client_id = v_client_id and node_id = v_team_id and effective_to is null
  ) then
    raise exception 'T5 FAIL: client placement på team mangler';
  end if;

  -- ─── T6: _apply_client_place på department → BLOKERET ────────────────
  begin
    v_caught := null;
    perform core_identity._apply_client_place(
      jsonb_build_object('client_id', gen_random_uuid()::text, 'node_id', v_dept_id::text, 'effective_from', current_date::text),
      null
    );
  exception when sqlstate 'P0001' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T6 FAIL: client placement på department skal blokeres af team-only trigger';
  end if;

  -- ─── T7: _apply_team_close lukker placements ─────────────────────────
  -- Placér fixture-employee på team_a igen (efter T3's remove).
  perform core_identity._apply_employee_place(
    jsonb_build_object('employee_id', v_emp_a_id::text, 'node_id', v_team_id::text, 'effective_from', (current_date + 2)::text),
    null
  );

  perform core_identity._apply_team_close(
    jsonb_build_object('node_id', v_team_id::text, 'effective_from', (current_date + 5)::text),
    null
  );

  -- team_a har is_active=false (ny version)
  if not exists (
    select 1 from core_identity.org_node_versions
    where node_id = v_team_id and is_active = false and effective_to is null
  ) then
    raise exception 'T7 FAIL: team_close skal oprette ny version is_active=false';
  end if;

  -- Ingen åbne placements på fixture-team_a (filter på fixture-node).
  if exists (
    select 1 from core_identity.employee_node_placements
    where node_id = v_team_id and effective_to is null
  ) then
    raise exception 'T7 FAIL: team_close skal lukke alle åbne employee-placements på team';
  end if;

  if exists (
    select 1 from core_identity.client_node_placements
    where node_id = v_team_id and effective_to is null
  ) then
    raise exception 'T7 FAIL: team_close skal lukke alle åbne client-placements på team';
  end if;

  -- ─── T8: _apply_team_close på department → BLOKERET ──────────────────
  begin
    v_caught := null;
    perform core_identity._apply_team_close(
      jsonb_build_object('node_id', v_dept_id::text, 'effective_from', current_date::text),
      null
    );
  exception when sqlstate '22023' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T8 FAIL: team_close på department skal blokeres';
  end if;

  raise notice 'T9 Step 4+5 smoke: ALL TESTS PASSED (T1-T8)';
end;
$test$;

rollback;
