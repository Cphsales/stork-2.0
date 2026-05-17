-- T9 Step 8 smoke: public pending-wrapper RPCs.
--
-- Minimal smoke — wrappers er tynde passthroughs til pending_change_request +
-- apply-handlers (testet i Steps 1-5).
--
-- T1: org_node_upsert wrapper validerer node_type input.
-- T2: client_node_place wrapper pre-checks team-only.
-- T3: team_close wrapper pre-checks node_type.

begin;

do $test$
declare
  v_caught text;
  v_dept_id uuid;
begin
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'T9 step 8 smoke', true);

  -- Setup en dept-knude (current_date - 10).
  v_dept_id := gen_random_uuid();
  insert into core_identity.org_nodes (id) values (v_dept_id);
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
  values
    (v_dept_id, 'Test Dept', null, 'department', true, current_date - 10);

  -- T1: org_node_upsert med invalid node_type
  begin
    v_caught := null;
    perform core_identity.org_node_upsert(null, 'Test', null, 'invalid_type', true, current_date);
  exception when sqlstate '22023' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T1 FAIL: org_node_upsert skal afvise invalid node_type';
  end if;

  -- T2: client_node_place på department blokeres (pre-check).
  begin
    v_caught := null;
    perform core_identity.client_node_place(gen_random_uuid(), v_dept_id, current_date);
  exception when sqlstate '22023' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T2 FAIL: client_node_place på department skal blokeres pre-check';
  end if;

  -- T3: team_close på department blokeres (pre-check).
  begin
    v_caught := null;
    perform core_identity.team_close(v_dept_id, current_date);
  exception when sqlstate '22023' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T3 FAIL: team_close på department skal blokeres pre-check';
  end if;

  raise notice 'T9 Step 8 smoke: ALL TESTS PASSED (T1-T3)';
end;
$test$;

rollback;
