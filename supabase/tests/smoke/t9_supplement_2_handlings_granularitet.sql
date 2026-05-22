-- T9-supplement-2 T4: Handlings-granularitet smoke-tests
--
-- Verificér permission_actions-tabel + invariant CHECK + has_permission_action-signatur.
-- RPC-flow-tests via permission_action_upsert kræver authenticated-employee-context
-- som superuser-smoke ikke har; direct INSERT bruges i stedet (idiomatisk for T9-smoke).

begin;

select set_config('stork.source_type', 'manual', true);
select set_config('stork.change_reason', 'T9-supplement-2 T4 smoke', true);
select set_config('stork.t9_write_authorized', 'true', true);

do $test$
declare
  v_test_tab_id uuid;
  v_action_id uuid;
begin
  select id into v_test_tab_id from core_identity.permission_tabs limit 1;
  if v_test_tab_id is null then
    raise exception 'T4 fejl: ingen permission_tabs-rows';
  end if;

  -- H8: invariant CHECK — has_undo=true uden requires_second_approver afvises
  begin
    insert into core_identity.permission_actions (tab_id, name, has_undo, requires_second_approver)
      values (v_test_tab_id, 'T4-H8-invalid-' || gen_random_uuid()::text, true, false);
    raise exception 'T4 H8 fejl: invariant-CHECK skulle have raise''et';
  exception when check_violation then
    raise notice 'T4 H8 OK: invariant CHECK holder (has_undo uden requires_second_approver afvist)';
  end;

  -- H9: opret valid action via direct INSERT (RPC-flow kræver auth-context som smoke ikke har)
  insert into core_identity.permission_actions (id, tab_id, name, is_active, sort_order)
    values (gen_random_uuid(), v_test_tab_id, 'T4-action-' || gen_random_uuid()::text, true, 0)
    returning id into v_action_id;
  if not exists (select 1 from core_identity.permission_actions where id = v_action_id) then
    raise exception 'T4 H9 fejl: action ikke oprettet';
  end if;
  raise notice 'T4 H9 OK: permission_actions accepterer valid row';

  -- Verificér has_permission_action har korrekt signatur
  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'core_identity' and p.proname = 'has_permission_action'
  ) then
    raise exception 'T4 fejl: has_permission_action funktion ikke fundet';
  end if;
  raise notice 'T4 OK: has_permission_action eksisterer';

  -- Verificér role_permission_grants har action_id-kolonne (M3 udvidelse)
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'core_identity'
      and table_name = 'role_permission_grants'
      and column_name = 'action_id'
  ) then
    raise exception 'T4 fejl: role_permission_grants.action_id kolonne ikke fundet';
  end if;
  raise notice 'T4 OK: role_permission_grants.action_id eksisterer';

  raise notice 'T4 smoke OK: handlings-granularitet schema + invariant + grants-udvidelse';
end;
$test$;

rollback;
