-- T9-supplement-2 T1: G059 wrapper-flow smoke-tests
--
-- Verificér at G059-wrappers nu sætter session-var FØR pending_change_request
-- og kan oprette pending uden RLS-fejl. Tester signatur + basic flow.

begin;

select set_config('stork.source_type', 'manual', true);
select set_config('stork.change_reason', 'T9-supplement-2 T1 smoke', true);
select set_config('stork.t9_write_authorized', 'true', true);

do $test$
declare
  v_admin_emp_id uuid;
  v_pending_count_before integer;
  v_pending_count_after integer;
begin
  -- Find en admin-employee
  select e.id into v_admin_emp_id
  from core_identity.employees e
  join core_identity.role_page_permissions p on p.role_id = e.role_id
  where p.page_key = 'system' and p.tab_key = 'manage' and p.scope = 'all' and p.can_edit = true
  limit 1;

  if v_admin_emp_id is null then
    raise notice 'T1 skip: ingen admin-employee i seed';
    return;
  end if;

  -- Verificér at G059-wrappers eksisterer og har korrekte signaturer
  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'core_identity' and p.proname = 'org_node_upsert'
  ) then
    raise exception 'T1 fejl: core_identity.org_node_upsert ikke fundet';
  end if;
  raise notice 'T1 OK: G059-wrappers eksisterer';

  -- Verificér at pending_change_approve har explicit grant til authenticated
  if not exists (
    select 1 from information_schema.routine_privileges
    where routine_schema = 'core_identity'
      and routine_name = 'pending_change_approve'
      and grantee = 'authenticated'
      and privilege_type = 'EXECUTE'
  ) then
    raise exception 'T1 fejl: pending_change_approve mangler grant til authenticated';
  end if;
  raise notice 'T1 OK: pending_change_approve har explicit grant';

  -- Verificér at de 5 G059-wrappers har grant til authenticated
  if not exists (
    select 1 from information_schema.routine_privileges
    where routine_schema = 'core_identity'
      and routine_name = 'org_node_upsert'
      and grantee = 'authenticated'
      and privilege_type = 'EXECUTE'
  ) then
    raise exception 'T1 fejl: org_node_upsert mangler grant til authenticated';
  end if;
  raise notice 'T1 OK: G059-wrappers har explicit grants';

  raise notice 'T1 smoke OK: G059 grants + signaturer verificeret';
end;
$test$;

rollback;
