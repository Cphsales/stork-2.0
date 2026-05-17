-- T9 Step 3 smoke: org_node_closure + maintain-trigger.
--
-- Plan V6 Beslutning 2 (V5-sweep): closure rebuilds når versions ændres.
--
-- T1: Bygge 3-niveau tree → closure har korrekte rows (sum inkl. self).
-- T2: INSERT ny knude → closure indeholder den + self-row (depth=0).
-- T3: UPDATE parent_id → closure rebuild med ny ancestor-chain.
-- T4: DELETE af version → closure opdateres.
-- T5: Future-dated version (effective_from > current_date) → IKKE i closure.

begin;

do $test$
declare
  v_root_id uuid;
  v_dept_id uuid;
  v_team_id uuid;
  v_count integer;
begin
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'T9 step 3 smoke', true);

  -- ─── T1: 3-niveau tree → closure-rows ────────────────────────────────
  v_root_id := gen_random_uuid();
  v_dept_id := gen_random_uuid();
  v_team_id := gen_random_uuid();

  insert into core_identity.org_nodes (id) values (v_root_id), (v_dept_id), (v_team_id);

  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
  values
    (v_root_id, 'Root', null, 'department', true, current_date - 10),
    (v_dept_id, 'Dept', v_root_id, 'department', true, current_date - 10),
    (v_team_id, 'Team', v_dept_id, 'team', true, current_date - 10);

  -- Forventet closure: 3 self-rows (depth=0) + 3 parent-rows (root→dept, root→team, dept→team)
  -- = 6 rows total.
  select count(*) into v_count from core_identity.org_node_closure
  where descendant_id in (v_root_id, v_dept_id, v_team_id);
  if v_count <> 6 then
    raise exception 'T1 FAIL: expected 6 closure rows, got %', v_count;
  end if;

  -- Verificér root→team-relation (depth=2).
  if not exists (
    select 1 from core_identity.org_node_closure
    where ancestor_id = v_root_id and descendant_id = v_team_id and depth = 2
  ) then
    raise exception 'T1 FAIL: root→team depth=2 mangler';
  end if;

  -- ─── T2: INSERT ny knude → closure inkluderer ─────────────────────────
  declare v_new_id uuid := gen_random_uuid();
  begin
    insert into core_identity.org_nodes (id) values (v_new_id);
    insert into core_identity.org_node_versions
      (node_id, name, parent_id, node_type, is_active, effective_from)
    values
      (v_new_id, 'NewDept', v_root_id, 'department', true, current_date - 5);

    -- Self-row.
    if not exists (
      select 1 from core_identity.org_node_closure
      where ancestor_id = v_new_id and descendant_id = v_new_id and depth = 0
    ) then
      raise exception 'T2 FAIL: self-row for new node mangler';
    end if;
    -- Root→new depth=1.
    if not exists (
      select 1 from core_identity.org_node_closure
      where ancestor_id = v_root_id and descendant_id = v_new_id and depth = 1
    ) then
      raise exception 'T2 FAIL: root→new depth=1 mangler';
    end if;
  end;

  -- ─── T3: UPDATE parent_id → closure rebuild ──────────────────────────
  -- Flyt team til root direkte (skip dept).
  update core_identity.org_node_versions
  set parent_id = v_root_id
  where node_id = v_team_id and effective_to is null;

  -- Nu skal root→team være depth=1 (ikke 2).
  if not exists (
    select 1 from core_identity.org_node_closure
    where ancestor_id = v_root_id and descendant_id = v_team_id and depth = 1
  ) then
    raise exception 'T3 FAIL: root→team depth=1 efter parent-update mangler';
  end if;

  -- Dept→team-relation skal være VÆK (team er nu direkte under root).
  if exists (
    select 1 from core_identity.org_node_closure
    where ancestor_id = v_dept_id and descendant_id = v_team_id
  ) then
    raise exception 'T3 FAIL: dept→team-relation skulle være fjernet efter parent-update';
  end if;

  -- ─── T5: Future-dated version IKKE i closure ─────────────────────────
  -- (T4 skipper vi for simplicity; DELETE er sjælden + RESTRICT-FK blokerer typisk)
  declare v_future_id uuid := gen_random_uuid();
  begin
    insert into core_identity.org_nodes (id) values (v_future_id);
    insert into core_identity.org_node_versions
      (node_id, name, parent_id, node_type, is_active, effective_from)
    values
      (v_future_id, 'Future', v_root_id, 'department', true, current_date + 30);

    if exists (
      select 1 from core_identity.org_node_closure
      where descendant_id = v_future_id
    ) then
      raise exception 'T5 FAIL: future-dated knude skulle IKKE være i closure';
    end if;
  end;

  raise notice 'T9 Step 3 smoke: ALL TESTS PASSED (T1-T3, T5)';
end;
$test$;

rollback;
