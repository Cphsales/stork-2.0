-- R1b smoke-test: 'admin'-rolle er omdøbt til 'superadmin'.
-- Verificerer at omdøbning ikke har brudt:
--   - rolle-navnet er 'superadmin' (ikke 'admin')
--   - mg@ + km@ stadig peger på rollen via FK
--   - system.manage-permission stadig knyttet til rollen (is_admin() virker)

do $test$
declare
  v_superadmin_count integer;
  v_admin_count integer;
  v_employees_with_role integer;
begin
  select count(*) into v_superadmin_count from core_identity.roles where name = 'superadmin';
  if v_superadmin_count <> 1 then
    raise exception 'TEST FAILED: forventede 1 superadmin-rolle, fik %', v_superadmin_count;
  end if;

  select count(*) into v_admin_count from core_identity.roles where name = 'admin';
  if v_admin_count <> 0 then
    raise exception 'TEST FAILED: % admin-rolle(r) tilbage', v_admin_count;
  end if;

  select count(*) into v_employees_with_role
    from core_identity.employees e
    join core_identity.roles r on r.id = e.role_id
   where r.name = 'superadmin' and e.email in ('mg@copenhagensales.dk', 'km@copenhagensales.dk');
  if v_employees_with_role <> 2 then
    raise exception 'TEST FAILED: forventede 2 employees med superadmin-rolle, fik %', v_employees_with_role;
  end if;

  if not exists (
    select 1 from core_identity.roles r
    join core_identity.role_page_permissions p on p.role_id = r.id
    where r.name = 'superadmin'
      and p.page_key = 'system' and p.tab_key = 'manage'
      and p.scope = 'all' and p.can_edit = true
  ) then
    raise exception 'TEST FAILED: superadmin mangler system.manage.all.can_edit-permission';
  end if;
end;
$test$;
