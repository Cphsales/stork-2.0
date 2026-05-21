-- Trin 10 T10.15: client_node_placements FK smoke-test
--
-- V6 (Code-validering fund #6): Test SKAL være begin/rollback-wrapped —
-- core_identity.client_node_placements er på TX_WRAP_REQUIRED_FOR_TEST_INSERT.
--
-- Dækker: FK virker (INSERT med ikke-eksisterende client_id fejler). DELETE
-- af klient med åbne placements fejler ON DELETE RESTRICT.

begin;

do $test$
declare
  v_client_id uuid;
  v_role_id uuid;
  v_employee_id uuid;
  v_team_node_id uuid := gen_random_uuid();
  v_uuid_suffix text;
  v_caught text;
begin
  v_uuid_suffix := replace(gen_random_uuid()::text, '-', '');
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'T10 FK smoke', true);

  -- Setup minimal: én team-node + én klient
  perform set_config('stork.allow_org_nodes_write', 'true', true);
  insert into core_identity.org_nodes (id) values (v_team_node_id);
  perform set_config('stork.allow_org_node_versions_write', 'true', true);
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
  values (v_team_node_id, 'T10-fk team', null, 'team', true, current_date - 5);

  perform set_config('stork.allow_clients_write', 'true', true);
  insert into core_identity.clients (name) values ('T10-fk klient') returning id into v_client_id;

  -- ─── T1: FK afviser INSERT med ikke-eksisterende client_id ──────────
  begin
    v_caught := null;
    insert into core_identity.client_node_placements
      (client_id, node_id, effective_from)
    values (gen_random_uuid(), v_team_node_id, current_date);
  exception when foreign_key_violation then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T1 FAIL: FK skal afvise ikke-eksisterende client_id';
  end if;

  -- ─── T2: INSERT med eksisterende client_id success ──────────────────
  insert into core_identity.client_node_placements
    (client_id, node_id, effective_from)
  values (v_client_id, v_team_node_id, current_date);

  -- ─── T3: ON DELETE RESTRICT — DELETE klient med åbne placements ─────
  begin
    v_caught := null;
    delete from core_identity.clients where id = v_client_id;
  exception when foreign_key_violation then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T3 FAIL: ON DELETE RESTRICT skal blokere DELETE af klient med åbne placements';
  end if;

  raise notice 'T10 FK smoke: ALL TESTS PASSED (T1-T3)';
end;
$test$;

rollback;
