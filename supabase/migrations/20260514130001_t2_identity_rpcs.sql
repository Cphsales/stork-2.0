-- Trin 2 / §4 trin 5: Identitet del 1 — RPC'er for employees/roles/permissions.
--
-- Master-plan §1.7 + §1.1 (FORCE RLS via session-vars).
--
-- Hver mutation-RPC sætter:
--   - stork.allow_<table>_write='true' (transaktion-lokal, bærer policy)
--   - stork.change_reason=p_change_reason (audit-krav)
--   - stork.source_type='manual' (override hvis kaldt fra cron etc.)
--
-- is_admin()-check på hver RPC. SECURITY DEFINER så RPC kan sætte session-vars
-- og INSERT/UPDATE selvom caller ikke har direkte rettigheder.

-- ─── INSERT-policies på employees/roles/permissions ─────────────────────
-- Bootstrap (trin 1) oprettede tabellerne med SELECT-policy. RPC-baseret
-- mutation kræver INSERT/UPDATE/DELETE-policies med session-var.

create policy employees_insert on core_identity.employees
  for insert to authenticated
  with check (current_setting('stork.allow_employees_write', true) = 'true');

create policy employees_update on core_identity.employees
  for update to authenticated
  using (current_setting('stork.allow_employees_write', true) = 'true')
  with check (current_setting('stork.allow_employees_write', true) = 'true');

grant insert, update on table core_identity.employees to authenticated;

create policy roles_insert on core_identity.roles
  for insert to authenticated
  with check (current_setting('stork.allow_roles_write', true) = 'true');

create policy roles_update on core_identity.roles
  for update to authenticated
  using (current_setting('stork.allow_roles_write', true) = 'true')
  with check (current_setting('stork.allow_roles_write', true) = 'true');

create policy roles_delete on core_identity.roles
  for delete to authenticated
  using (current_setting('stork.allow_roles_write', true) = 'true');

grant insert, update, delete on table core_identity.roles to authenticated;

create policy role_page_permissions_insert on core_identity.role_page_permissions
  for insert to authenticated
  with check (current_setting('stork.allow_role_page_permissions_write', true) = 'true');

create policy role_page_permissions_update on core_identity.role_page_permissions
  for update to authenticated
  using (current_setting('stork.allow_role_page_permissions_write', true) = 'true')
  with check (current_setting('stork.allow_role_page_permissions_write', true) = 'true');

create policy role_page_permissions_delete on core_identity.role_page_permissions
  for delete to authenticated
  using (current_setting('stork.allow_role_page_permissions_write', true) = 'true');

grant insert, update, delete on table core_identity.role_page_permissions to authenticated;

-- ─── employee_upsert: opret eller opdatér medarbejder ────────────────────
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
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row core_identity.employees;
begin
  if not core_identity.is_admin() then
    raise exception 'employee_upsert kraever admin-permission' using errcode = '42501';
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
$$;

revoke all on function core_identity.employee_upsert(uuid, uuid, text, text, text, date, date, uuid, text) from public;
grant execute on function core_identity.employee_upsert(uuid, uuid, text, text, text, date, date, uuid, text) to authenticated;

-- ─── employee_terminate: sæt termination_date (anonymisering venter til trin 6) ──
create or replace function core_identity.employee_terminate(
  p_employee_id uuid,
  p_termination_date date,
  p_change_reason text
)
returns core_identity.employees
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row core_identity.employees;
begin
  if not core_identity.is_admin() then
    raise exception 'employee_terminate kraever admin-permission' using errcode = '42501';
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
$$;

revoke all on function core_identity.employee_terminate(uuid, date, text) from public;
grant execute on function core_identity.employee_terminate(uuid, date, text) to authenticated;

-- ─── role_upsert ────────────────────────────────────────────────────────
create or replace function core_identity.role_upsert(
  p_id uuid,
  p_name text,
  p_description text default null,
  p_change_reason text default null
)
returns core_identity.roles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row core_identity.roles;
begin
  if not core_identity.is_admin() then
    raise exception 'role_upsert kraever admin-permission' using errcode = '42501';
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
$$;

revoke all on function core_identity.role_upsert(uuid, text, text, text) from public;
grant execute on function core_identity.role_upsert(uuid, text, text, text) to authenticated;

-- ─── role_page_permission_upsert ─────────────────────────────────────────
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
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row core_identity.role_page_permissions;
begin
  if not core_identity.is_admin() then
    raise exception 'role_page_permission_upsert kraever admin-permission' using errcode = '42501';
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
$$;

revoke all on function core_identity.role_page_permission_upsert(uuid, text, text, boolean, boolean, text, text) from public;
grant execute on function core_identity.role_page_permission_upsert(uuid, text, text, boolean, boolean, text, text) to authenticated;

-- ─── superadmin_settings_update ──────────────────────────────────────────
create or replace function core_compliance.superadmin_settings_update(
  p_min_admin_count integer,
  p_change_reason text
)
returns core_compliance.superadmin_settings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row core_compliance.superadmin_settings;
begin
  if not core_identity.is_admin() then
    raise exception 'superadmin_settings_update kraever admin-permission' using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;
  if p_min_admin_count < 1 then
    raise exception 'min_admin_count skal vaere >= 1' using errcode = '22023';
  end if;

  perform set_config('stork.allow_superadmin_settings_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);

  update core_compliance.superadmin_settings
     set min_admin_count = p_min_admin_count
   where id = 1
   returning * into v_row;

  return v_row;
end;
$$;

revoke all on function core_compliance.superadmin_settings_update(integer, text) from public;
grant execute on function core_compliance.superadmin_settings_update(integer, text) to authenticated;
