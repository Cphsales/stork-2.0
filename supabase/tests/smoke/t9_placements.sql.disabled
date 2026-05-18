-- T9 Step 4+5 smoke: employee_node_placements + client_node_placements + apply-handlers.
--
-- Plan V6 Beslutning 3+14 + Valg 4.

begin;

do $test$
declare
  v_caught text;
  v_root_id uuid;
  v_team_id uuid;
  v_team_b_id uuid;
  v_dept_id uuid;
  v_mg_id uuid;
  v_km_id uuid;
  v_client_id uuid := gen_random_uuid();
  v_pending_id uuid;
  v_count integer;
begin
  if not exists (select 1 from information_schema.tables where table_schema='core_identity' and table_name='employee_node_placements') then
    raise notice 'T9 smoke: pre-migration state — target table not yet created; skipping';
    return;
  end if;
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'T9 step 4+5 smoke', true);

  select id into v_mg_id from core_identity.employees where email = 'mg@copenhagensales.dk';
  select id into v_km_id from core_identity.employees where email = 'km@copenhagensales.dk';

  -- Setup tree (current_date - 10).
  v_root_id := gen_random_uuid();
  v_dept_id := gen_random_uuid();
  v_team_id := gen_random_uuid();
  v_team_b_id := gen_random_uuid();
  insert into core_identity.org_nodes (id) values (v_root_id), (v_dept_id), (v_team_id), (v_team_b_id);
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
  values
    (v_root_id, 'Root', null, 'department', true, current_date - 10),
    (v_dept_id, 'Dept', v_root_id, 'department', true, current_date - 10),
    (v_team_id, 'Team A', v_dept_id, 'team', true, current_date - 10),
    (v_team_b_id, 'Team B', v_dept_id, 'team', true, current_date - 10);

  -- ─── T1: _apply_employee_place ────────────────────────────────────────
  insert into core_identity.pending_changes
    (change_type, target_id, payload, effective_from, requested_by, status, approved_by, approved_at, undo_deadline)
  values
    ('employee_place', v_mg_id::uuid,
     jsonb_build_object('employee_id', v_mg_id::text, 'node_id', v_team_id::text, 'effective_from', (current_date - 5)::text),
     current_date - 5, v_km_id, 'approved', v_mg_id,
     now() - interval '1 hour', now() - interval '30 minutes')
  returning id into v_pending_id;

  perform core_identity._apply_employee_place(
    (select payload from core_identity.pending_changes where id = v_pending_id),
    v_pending_id
  );

  if not exists (
    select 1 from core_identity.employee_node_placements
    where employee_id = v_mg_id and node_id = v_team_id and effective_to is null
  ) then
    raise exception 'T1 FAIL: _apply_employee_place oprettede ikke placement';
  end if;

  -- ─── T2: _apply_employee_place på allerede placeret (flyt) ────────────
  perform core_identity._apply_employee_place(
    jsonb_build_object('employee_id', v_mg_id::text, 'node_id', v_team_b_id::text, 'effective_from', current_date::text),
    null
  );

  select count(*) into v_count
  from core_identity.employee_node_placements
  where employee_id = v_mg_id;
  if v_count <> 2 then
    raise exception 'T2 FAIL: flyt skal give 2 rows (lukket+åben), got %', v_count;
  end if;

  if not exists (
    select 1 from core_identity.employee_node_placements
    where employee_id = v_mg_id and node_id = v_team_b_id and effective_to is null
  ) then
    raise exception 'T2 FAIL: ny placement på team_b mangler';
  end if;

  -- ─── T3: _apply_employee_remove ──────────────────────────────────────
  perform core_identity._apply_employee_remove(
    jsonb_build_object('employee_id', v_mg_id::text, 'effective_from', (current_date + 1)::text),
    null
  );

  if exists (
    select 1 from core_identity.employee_node_placements
    where employee_id = v_mg_id and effective_to is null
  ) then
    raise exception 'T3 FAIL: efter remove skal ingen open-ended placement findes';
  end if;

  -- ─── T4: Authenticated direkte kald af _apply_*-handlers ──────────────
  begin
    v_caught := null;
    set local role authenticated;
    perform core_identity._apply_employee_place(
      jsonb_build_object('employee_id', v_mg_id::text, 'node_id', v_team_id::text, 'effective_from', current_date::text),
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
  -- Placér klient på team — skal virke.
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
  -- Placér nye employees + client på team_a.
  perform core_identity._apply_employee_place(
    jsonb_build_object('employee_id', v_mg_id::text, 'node_id', v_team_id::text, 'effective_from', (current_date + 2)::text),
    null
  );

  perform core_identity._apply_team_close(
    jsonb_build_object('node_id', v_team_id::text, 'effective_from', (current_date + 5)::text),
    null
  );

  -- Verificér: team_a har is_active=false (ny version)
  if not exists (
    select 1 from core_identity.org_node_versions
    where node_id = v_team_id and is_active = false and effective_to is null
  ) then
    raise exception 'T7 FAIL: team_close skal opretter ny version is_active=false';
  end if;

  -- Verificér: ingen åbne placements på team_a.
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
