-- Q-HR: konvertér 5 HR/role-RPC'er fra is_admin() til has_permission().
--
-- KONVERTERINGER:
-- - employee_upsert             → has_permission('employees', 'manage', true)
-- - employee_terminate          → has_permission('employees', 'terminate', true)
-- - anonymize_employee          → has_permission('employees', 'anonymize', true)
-- - role_upsert                 → has_permission('roles', 'manage', true)
-- - role_page_permission_upsert → has_permission('roles', 'permissions', true)

create or replace function core_identity.employee_upsert(
  p_id uuid,
  p_auth_user_id uuid,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_hire_date date default null,
  p_termination_date date default null,
  p_role_id uuid default null,
  p_change_reason text default null
)
returns core_identity.employees
language plpgsql security definer set search_path = ''
as $function$
declare
  v_row core_identity.employees;
begin
  if not core_identity.has_permission('employees', 'manage', true) then
    raise exception 'employee_upsert kraever permission employees.manage.can_edit'
      using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;

  perform set_config('stork.allow_employees_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);

  if p_id is null then
    insert into core_identity.employees
      (auth_user_id, first_name, last_name, email, hire_date, termination_date, role_id)
    values
      (p_auth_user_id, p_first_name, p_last_name, p_email, p_hire_date, p_termination_date, p_role_id)
    returning * into v_row;
  else
    insert into core_identity.employees
      (id, auth_user_id, first_name, last_name, email, hire_date, termination_date, role_id)
    values
      (p_id, p_auth_user_id, p_first_name, p_last_name, p_email, p_hire_date, p_termination_date, p_role_id)
    on conflict (id) do update set
      auth_user_id = excluded.auth_user_id,
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      email = excluded.email,
      hire_date = excluded.hire_date,
      termination_date = excluded.termination_date,
      role_id = excluded.role_id
    returning * into v_row;
  end if;

  return v_row;
end;
$function$;

create or replace function core_identity.employee_terminate(
  p_employee_id uuid,
  p_termination_date date,
  p_change_reason text
)
returns core_identity.employees
language plpgsql security definer set search_path = ''
as $function$
declare
  v_row core_identity.employees;
begin
  if not core_identity.has_permission('employees', 'terminate', true) then
    raise exception 'employee_terminate kraever permission employees.terminate.can_edit'
      using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;
  if p_termination_date is null then
    raise exception 'termination_date er paakraevet' using errcode = '22023';
  end if;

  perform set_config('stork.allow_employees_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);

  update core_identity.employees
     set termination_date = p_termination_date
   where id = p_employee_id
   returning * into v_row;

  if v_row.id is null then
    raise exception 'employee ikke fundet: %', p_employee_id using errcode = 'P0002';
  end if;

  return v_row;
end;
$function$;

create or replace function core_identity.anonymize_employee(
  p_employee_id uuid, p_reason text
)
returns core_identity.employees
language plpgsql security definer set search_path = ''
as $function$
declare
  v_mapping core_compliance.anonymization_mappings;
  v_row core_identity.employees;
begin
  if not core_identity.has_permission('employees', 'anonymize', true) then
    raise exception 'anonymize_employee kraever permission employees.anonymize.can_edit'
      using errcode = '42501';
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'reason er paakraevet' using errcode = '22023';
  end if;
  select * into v_mapping from core_compliance.anonymization_mappings
   where entity_type = 'employee' and is_active = true;
  if v_mapping.id is null then
    raise exception 'ingen aktiv anonymiserings-mapping for employee' using errcode = 'P0002';
  end if;
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'anonymization: ' || p_reason, true);
  v_row := core_identity._anonymize_employee_apply(p_employee_id, v_mapping.field_strategies, p_reason);
  perform core_identity._anonymize_employee_log_state(
    p_employee_id, p_reason, v_mapping.field_strategies, v_mapping.strategy_version
  );
  return v_row;
end;
$function$;

create or replace function core_identity.role_upsert(
  p_id uuid,
  p_name text,
  p_description text default null,
  p_change_reason text default null
)
returns core_identity.roles
language plpgsql security definer set search_path = ''
as $function$
declare
  v_row core_identity.roles;
begin
  if not core_identity.has_permission('roles', 'manage', true) then
    raise exception 'role_upsert kraever permission roles.manage.can_edit'
      using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;

  perform set_config('stork.allow_roles_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);

  if p_id is null then
    insert into core_identity.roles (name, description)
    values (p_name, p_description)
    returning * into v_row;
  else
    insert into core_identity.roles (id, name, description)
    values (p_id, p_name, p_description)
    on conflict (id) do update set
      name = excluded.name,
      description = excluded.description
    returning * into v_row;
  end if;

  return v_row;
end;
$function$;

create or replace function core_identity.role_page_permission_upsert(
  p_role_id uuid,
  p_page_key text,
  p_tab_key text,
  p_can_view boolean,
  p_can_edit boolean,
  p_scope text,
  p_change_reason text
)
returns core_identity.role_page_permissions
language plpgsql security definer set search_path = ''
as $function$
declare
  v_row core_identity.role_page_permissions;
begin
  if not core_identity.has_permission('roles', 'permissions', true) then
    raise exception 'role_page_permission_upsert kraever permission roles.permissions.can_edit'
      using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;
  if p_scope not in ('all', 'subtree', 'team', 'self') then
    raise exception 'invalid scope %', p_scope using errcode = '22023';
  end if;

  perform set_config('stork.allow_role_page_permissions_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);

  insert into core_identity.role_page_permissions
    (role_id, page_key, tab_key, can_view, can_edit, scope)
  values
    (p_role_id, p_page_key, p_tab_key, p_can_view, p_can_edit, p_scope)
  on conflict (role_id, page_key, coalesce(tab_key, '')) do update set
    can_view = excluded.can_view,
    can_edit = excluded.can_edit,
    scope = excluded.scope
  returning * into v_row;

  return v_row;
end;
$function$;
