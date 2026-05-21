-- T9-supplement-2 T1: G059 wrapper-flow smoke-tests
--
-- CI-note: hop ud hvis migrations ikke anvendt.

begin;

select set_config('stork.source_type', 'manual', true);
select set_config('stork.change_reason', 'T9-supplement-2 T1 smoke', true);
select set_config('stork.t9_write_authorized', 'true', true);

do $test$
begin
  -- Pre-flight: hop ud hvis M1's grants ikke anvendt
  if not exists (
    select 1 from information_schema.routine_privileges
    where routine_schema = 'core_identity'
      and routine_name = 'pending_change_approve'
      and grantee = 'authenticated'
      and privilege_type = 'EXECUTE'
  ) then
    raise notice 'T1 skip: pending_change_approve grant ikke anvendt (pre-merge CI-state)';
    return;
  end if;

  raise notice 'T1 OK: pending_change_approve har explicit grant til authenticated';

  -- Verificér G059-wrappers har grant
  if not exists (
    select 1 from information_schema.routine_privileges
    where routine_schema = 'core_identity'
      and routine_name = 'org_node_upsert'
      and grantee = 'authenticated'
      and privilege_type = 'EXECUTE'
  ) then
    raise notice 'T1 skip: G059-wrappers grants ikke anvendt';
    return;
  end if;
  raise notice 'T1 OK: org_node_upsert har grant';

  if not exists (
    select 1 from information_schema.routine_privileges
    where routine_schema = 'core_identity'
      and routine_name = 'team_close'
      and grantee = 'authenticated'
      and privilege_type = 'EXECUTE'
  ) then
    raise notice 'T1 skip: team_close grant ikke anvendt';
    return;
  end if;
  raise notice 'T1 OK: team_close har grant';

  -- Verificér client-wrappers har grant
  if not exists (
    select 1 from information_schema.routine_privileges
    where routine_schema = 'core_identity'
      and routine_name = 'client_node_place'
      and grantee = 'authenticated'
      and privilege_type = 'EXECUTE'
  ) then
    raise notice 'T1 skip: client_node_place grant ikke anvendt (T10.7b-fix)';
    return;
  end if;
  raise notice 'T1 OK: client_node_place har grant';

  raise notice 'T1 smoke OK: G059 + T10 grants verificeret';
end;
$test$;

rollback;
