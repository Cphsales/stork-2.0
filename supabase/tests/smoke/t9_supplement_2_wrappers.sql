-- T9-supplement-2 T1: G059 wrapper-flow smoke-tests
--
-- Verificér explicit grants på G059-wrappers + T10-client-wrappers + pending_change_approve.

begin;

select set_config('stork.source_type', 'manual', true);
select set_config('stork.change_reason', 'T9-supplement-2 T1 smoke', true);

do $test$
begin
  -- pending_change_approve grant (M5/V7)
  if not exists (
    select 1 from information_schema.routine_privileges
    where routine_schema = 'core_identity'
      and routine_name = 'pending_change_approve'
      and grantee = 'authenticated'
      and privilege_type = 'EXECUTE'
  ) then
    raise exception 'T1 fejl: pending_change_approve mangler grant til authenticated';
  end if;

  -- G059-wrappers grants (M1)
  if not exists (
    select 1 from information_schema.routine_privileges
    where routine_schema = 'core_identity'
      and routine_name = 'org_node_upsert'
      and grantee = 'authenticated'
      and privilege_type = 'EXECUTE'
  ) then
    raise exception 'T1 fejl: org_node_upsert mangler grant til authenticated';
  end if;

  if not exists (
    select 1 from information_schema.routine_privileges
    where routine_schema = 'core_identity'
      and routine_name = 'team_close'
      and grantee = 'authenticated'
      and privilege_type = 'EXECUTE'
  ) then
    raise exception 'T1 fejl: team_close mangler grant til authenticated';
  end if;

  if not exists (
    select 1 from information_schema.routine_privileges
    where routine_schema = 'core_identity'
      and routine_name = 'employee_place'
      and grantee = 'authenticated'
      and privilege_type = 'EXECUTE'
  ) then
    raise exception 'T1 fejl: employee_place mangler grant til authenticated';
  end if;

  -- T10-client-wrappers grants (M1 udvidelse — Codex V7 systemisk fix)
  if not exists (
    select 1 from information_schema.routine_privileges
    where routine_schema = 'core_identity'
      and routine_name = 'client_node_place'
      and grantee = 'authenticated'
      and privilege_type = 'EXECUTE'
  ) then
    raise exception 'T1 fejl: client_node_place mangler grant til authenticated';
  end if;

  raise notice 'T1 OK: G059 + T10 grants verificeret';
end;
$test$;

rollback;
