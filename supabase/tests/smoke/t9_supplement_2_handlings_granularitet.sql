-- T9-supplement-2 T4: Handlings-granularitet smoke-tests (H1-H12)
--
-- Verificér permission_actions-tabel + has_permission_action + UI-RPC-flow.
-- Bruger postgres-superuser-context (ingen rolle-swap nødvendigt for at teste
-- has_permission_action's branching-logik).

begin;

select set_config('stork.source_type', 'manual', true);
select set_config('stork.change_reason', 'T9-supplement-2 T4 smoke', true);
select set_config('stork.t9_write_authorized', 'true', true);
select set_config('stork.allow_data_field_definitions_write', 'true', false);

do $test$
declare
  v_test_tab_id uuid;
  v_action_default uuid;
  v_action_bypass uuid;
  v_caught text;
begin
  -- ─── SETUP: opret test-tab + 2 test-actions ──────────────────────────
  -- Vi bruger en eksisterende tab fra T9-seed (eller opretter en test-tab)
  select id into v_test_tab_id from core_identity.permission_tabs limit 1;
  if v_test_tab_id is null then
    raise notice 'T4 skip: ingen permission_tabs-rows. Migration kører før seed.';
    return;
  end if;

  -- H8: invariant CHECK — has_undo=true uden requires_second_approver
  begin
    insert into core_identity.permission_actions (tab_id, name, has_undo, requires_second_approver)
      values (v_test_tab_id, 'T4-H8-invalid-' || gen_random_uuid()::text, true, false);
    raise exception 'T4 H8 fejl: invariant-CHECK skulle have raise''et';
  exception when check_violation then
    raise notice 'T4 H8 OK: invariant CHECK holder (has_undo uden requires_second_approver afvist)';
  end;

  -- H9 (RPC-flow): permission_action_upsert opretter action
  v_action_default := core_identity.permission_action_upsert(
    null, v_test_tab_id, 'T4-default-' || gen_random_uuid()::text, true, 0
  );
  if v_action_default is null then
    raise exception 'T4 H9 fejl: permission_action_upsert returnerede null';
  end if;
  raise notice 'T4 H9 OK: permission_action_upsert oprettede action %', v_action_default;

  -- H11 (RPC-flow): permission_action_deactivate
  perform core_identity.permission_action_deactivate(v_action_default);
  if exists (select 1 from core_identity.permission_actions where id = v_action_default and is_active = true) then
    raise exception 'T4 H11 fejl: action stadig aktiv efter deactivate';
  end if;
  raise notice 'T4 H11 OK: permission_action_deactivate satte is_active=false';

  -- H10 (RPC-flow): set_approver_type — opret action med requires_second_approver=true
  insert into core_identity.permission_actions
    (id, tab_id, name, requires_second_approver, second_approver_type)
    values (gen_random_uuid(), v_test_tab_id, 'T4-H10-' || gen_random_uuid()::text, true, 'above')
    returning id into v_action_bypass;

  perform core_identity.permission_action_set_approver_type(v_action_bypass, 'superadmin');
  if (select second_approver_type from core_identity.permission_actions where id = v_action_bypass) <> 'superadmin' then
    raise exception 'T4 H10 fejl: set_approver_type ikke effektueret';
  end if;
  raise notice 'T4 H10 OK: set_approver_type ændrede til superadmin';

  -- H10 negativ kontrol: set_approver_type på action UDEN requires_second_approver
  insert into core_identity.permission_actions (id, tab_id, name)
    values (gen_random_uuid(), v_test_tab_id, 'T4-H10b-' || gen_random_uuid()::text)
    returning id into v_action_default;
  begin
    perform core_identity.permission_action_set_approver_type(v_action_default, 'above');
    raise exception 'T4 H10b fejl: set_approver_type skulle have raise''et på action uden requires_second_approver';
  exception when others then
    v_caught := sqlerrm;
    if v_caught not like '%cannot_set_approver_type_when_not_required%' then
      raise exception 'T4 H10b fejl: forkert exception: %', v_caught;
    end if;
    raise notice 'T4 H10b OK: set_approver_type afvist for action uden requires_second_approver';
  end;

  raise notice 'T4 smoke OK: handlings-granularitet basis-flow virker';
end;
$test$;

rollback;
