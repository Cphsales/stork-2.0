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

begin;

do $test$
declare
  v_caught text;
  v_root_id uuid;
  v_dept_id uuid;
  v_team_id uuid;
  v_team_b_id uuid;
  v_mg_id uuid;
  v_km_id uuid;
  v_pending_id uuid;
  v_count integer;
begin
  if not exists (select 1 from information_schema.tables where table_schema='core_identity' and table_name='org_node_versions') then
    raise notice 'T9 smoke: pre-migration state — target table not yet created; skipping';
    return;
  end if;
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'T9 step 2 smoke', true);

  select id into v_mg_id from core_identity.employees where email = 'mg@copenhagensales.dk';
  select id into v_km_id from core_identity.employees where email = 'km@copenhagensales.dk';

  if v_mg_id is null or v_km_id is null then
    raise exception 'SETUP FAILED: bootstrap employees mangler';
  end if;

  -- ─── T1: INSERT identity + version direkte ────────────────────────────
  v_root_id := gen_random_uuid();
  insert into core_identity.org_nodes (id) values (v_root_id);
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
  values
    (v_root_id, 'Test Root', null, 'department', true, current_date);

  if not exists (
    select 1 from core_identity.org_node_versions
    where node_id = v_root_id and effective_to is null
  ) then
    raise exception 'T1 FAIL: version-row mangler efter INSERT';
  end if;

  -- ─── T2: Cycle-detect blokeret ────────────────────────────────────────
  -- Opret dept under root.
  v_dept_id := gen_random_uuid();
  insert into core_identity.org_nodes (id) values (v_dept_id);
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
  values
    (v_dept_id, 'Test Dept', v_root_id, 'department', true, current_date);

  -- Forsøg at sætte root's parent til dept → cycle.
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
  -- Opret team under dept.
  v_team_id := gen_random_uuid();
  insert into core_identity.org_nodes (id) values (v_team_id);
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
  values
    (v_team_id, 'Test Team', v_dept_id, 'team', true, current_date);

  -- Forsøg at oprette barn under team.
  begin
    v_caught := null;
    declare v_child_id uuid := gen_random_uuid();
    begin
      insert into core_identity.org_nodes (id) values (v_child_id);
      insert into core_identity.org_node_versions
        (node_id, name, parent_id, node_type, is_active, effective_from)
      values
        (v_child_id, 'Test Child', v_team_id, 'team', true, current_date);
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
       'name', 'Apply Test Root',
       'parent_id', null,
       'node_type', 'department',
       'is_active', true,
       'effective_from', current_date::text
     ),
     current_date, v_mg_id, 'approved', v_km_id,
     now() - interval '1 hour', now() - interval '30 minutes')
  returning id into v_pending_id;

  perform core_identity._apply_org_node_upsert(
    (select payload from core_identity.pending_changes where id = v_pending_id),
    v_pending_id
  );

  select count(*) into v_count
  from core_identity.org_node_versions
  where name = 'Apply Test Root' and effective_to is null;

  if v_count <> 1 then
    raise exception 'T4 FAIL: _apply_org_node_upsert oprettede ikke version (count=%)', v_count;
  end if;

  -- ─── T5: _apply_org_node_upsert EXISTING node (rename) ────────────────
  declare v_existing_id uuid;
  begin
    select node_id into v_existing_id
    from core_identity.org_node_versions
    where name = 'Apply Test Root' and effective_to is null
    limit 1;

    perform core_identity._apply_org_node_upsert(
      jsonb_build_object(
        'id', v_existing_id::text,
        'name', 'Apply Test Root RENAMED',
        'parent_id', null,
        'node_type', 'department',
        'is_active', true,
        'effective_from', (current_date + 1)::text
      ),
      null
    );

    -- Verify 2 versions: gammel (lukket) + ny (åben)
    select count(*) into v_count
    from core_identity.org_node_versions
    where node_id = v_existing_id;
    if v_count <> 2 then
      raise exception 'T5 FAIL: efter UPDATE skal have 2 versions (got %)', v_count;
    end if;

    if not exists (
      select 1 from core_identity.org_node_versions
      where node_id = v_existing_id and name = 'Apply Test Root RENAMED' and effective_to is null
    ) then
      raise exception 'T5 FAIL: ny version med renamed name mangler';
    end if;
  end;

  -- ─── T6: _apply_org_node_deactivate ───────────────────────────────────
  declare v_deact_id uuid;
  begin
    select node_id into v_deact_id
    from core_identity.org_node_versions
    where name = 'Apply Test Root RENAMED' and effective_to is null
    limit 1;

    perform core_identity._apply_org_node_deactivate(
      jsonb_build_object(
        'node_id', v_deact_id::text,
        'effective_from', (current_date + 2)::text
      ),
      null
    );

    if not exists (
      select 1 from core_identity.org_node_versions
      where node_id = v_deact_id and is_active = false and effective_to is null
    ) then
      raise exception 'T6 FAIL: deactivate-version mangler eller has wrong is_active';
    end if;
  end;

  -- ─── T7: Authenticated kald af _apply_*-handlers → permission denied ──
  begin
    v_caught := null;
    set local role authenticated;
    perform core_identity._apply_org_node_upsert(
      '{"name":"x","node_type":"department","is_active":true,"effective_from":"2026-05-17"}'::jsonb,
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
      (v_root_id, 'Duplicate Open Version', null, 'department', true, current_date + 10);
  exception when sqlstate '23505' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T8 FAIL: to open-ended versions skal blokeres af partial UNIQUE';
  end if;

  -- ─── T9: EXCLUDE — overlap blokeret ───────────────────────────────────
  -- Luk root's eksisterende version først.
  update core_identity.org_node_versions
  set effective_to = current_date + 100
  where node_id = v_root_id and effective_to is null;

  -- Indsæt overlap'ende version.
  begin
    v_caught := null;
    insert into core_identity.org_node_versions
      (node_id, name, parent_id, node_type, is_active, effective_from, effective_to)
    values
      (v_root_id, 'Overlap', null, 'department', true, current_date + 50, current_date + 150);
  exception when sqlstate '23P01' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T9 FAIL: overlap-version skal blokeres af EXCLUDE';
  end if;

  -- ─── T10: V6 central apply-gate — future-dated afvises ───────────────
  insert into core_identity.pending_changes
    (change_type, target_id, payload, effective_from, requested_by, status, approved_by, approved_at, undo_deadline)
  values
    ('org_node_upsert', null,
     jsonb_build_object('name','Future','node_type','department','is_active',true,'effective_from',(current_date+30)::text),
     current_date + 30, v_mg_id, 'approved', v_km_id,
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
