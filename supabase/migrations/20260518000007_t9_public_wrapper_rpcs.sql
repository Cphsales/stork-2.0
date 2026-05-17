-- Trin 9 / §4 trin 9 Step 8: Public pending-wrapper RPCs + employee_role-wrappers.
--
-- Plan V6 Beslutning 11+12 + Valg 1+14:
-- - 7 pending-pligtige public RPC'er (tynde wrappers omkring pending_change_request)
-- - 2 direkte role-RPC'er (employee_role_assign/remove; ikke pending)
-- Alle SECURITY DEFINER med has_permission-check.

-- ─── org_node_upsert (pending) ──────────────────────────────────────────
create or replace function core_identity.org_node_upsert(
  p_id uuid,
  p_name text,
  p_parent_id uuid,
  p_node_type text,
  p_is_active boolean,
  p_effective_from date
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_request_id uuid;
begin
  if not core_identity.has_permission('org_nodes', 'manage', true) then
    raise exception 'permission_denied: org_nodes/manage/can_edit' using errcode = '42501';
  end if;
  if p_name is null or p_node_type is null or p_effective_from is null then
    raise exception 'invalid_input: name, node_type, effective_from required' using errcode = '22023';
  end if;
  if p_node_type not in ('department', 'team') then
    raise exception 'invalid_node_type: %', p_node_type using errcode = '22023';
  end if;

  v_request_id := core_identity.pending_change_request(
    'org_node_upsert',
    p_id,
    jsonb_build_object(
      'id', coalesce(p_id::text, ''),
      'name', p_name,
      'parent_id', coalesce(p_parent_id::text, ''),
      'node_type', p_node_type,
      'is_active', p_is_active,
      'effective_from', p_effective_from::text
    ),
    p_effective_from
  );
  return v_request_id;
end; $$;
revoke execute on function core_identity.org_node_upsert(uuid, text, uuid, text, boolean, date) from public, anon;

-- ─── org_node_deactivate (pending) ──────────────────────────────────────
create or replace function core_identity.org_node_deactivate(
  p_node_id uuid,
  p_effective_from date
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_request_id uuid;
begin
  if not core_identity.has_permission('org_nodes', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  v_request_id := core_identity.pending_change_request(
    'org_node_deactivate', p_node_id,
    jsonb_build_object('node_id', p_node_id::text, 'effective_from', p_effective_from::text),
    p_effective_from
  );
  return v_request_id;
end; $$;
revoke execute on function core_identity.org_node_deactivate(uuid, date) from public, anon;

-- ─── team_close (pending) ───────────────────────────────────────────────
create or replace function core_identity.team_close(
  p_node_id uuid,
  p_effective_from date
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_request_id uuid;
begin
  if not core_identity.has_permission('org_nodes', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  -- Pre-check: verificér at det er team-knude (apply-handler re-validerer).
  if not exists (
    select 1 from core_identity.org_node_versions
    where node_id = p_node_id and node_type = 'team'
      and effective_from <= current_date
      and (effective_to is null or effective_to > current_date)
  ) then
    raise exception 'node_not_team_or_inactive: %', p_node_id using errcode = '22023';
  end if;
  v_request_id := core_identity.pending_change_request(
    'team_close', p_node_id,
    jsonb_build_object('node_id', p_node_id::text, 'effective_from', p_effective_from::text),
    p_effective_from
  );
  return v_request_id;
end; $$;
revoke execute on function core_identity.team_close(uuid, date) from public, anon;

-- ─── employee_place (pending) ───────────────────────────────────────────
create or replace function core_identity.employee_place(
  p_employee_id uuid,
  p_node_id uuid,
  p_effective_from date
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_request_id uuid;
begin
  if not core_identity.has_permission('employee_placements', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  v_request_id := core_identity.pending_change_request(
    'employee_place', p_employee_id,
    jsonb_build_object(
      'employee_id', p_employee_id::text,
      'node_id', p_node_id::text,
      'effective_from', p_effective_from::text
    ),
    p_effective_from
  );
  return v_request_id;
end; $$;
revoke execute on function core_identity.employee_place(uuid, uuid, date) from public, anon;

-- ─── employee_remove_from_node (pending) ────────────────────────────────
create or replace function core_identity.employee_remove_from_node(
  p_employee_id uuid,
  p_effective_from date
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_request_id uuid;
begin
  if not core_identity.has_permission('employee_placements', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  v_request_id := core_identity.pending_change_request(
    'employee_remove', p_employee_id,
    jsonb_build_object(
      'employee_id', p_employee_id::text,
      'effective_from', p_effective_from::text
    ),
    p_effective_from
  );
  return v_request_id;
end; $$;
revoke execute on function core_identity.employee_remove_from_node(uuid, date) from public, anon;

-- ─── client_node_place (pending) ────────────────────────────────────────
create or replace function core_identity.client_node_place(
  p_client_id uuid,
  p_node_id uuid,
  p_effective_from date
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_request_id uuid;
begin
  if not core_identity.has_permission('client_placements', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  -- Pre-check: node_id skal være team.
  if not exists (
    select 1 from core_identity.org_node_versions
    where node_id = p_node_id and node_type = 'team' and is_active = true
      and effective_from <= current_date
      and (effective_to is null or effective_to > current_date)
  ) then
    raise exception 'client_placement_node_not_team_or_inactive: %', p_node_id using errcode = '22023';
  end if;
  v_request_id := core_identity.pending_change_request(
    'client_place', p_client_id,
    jsonb_build_object(
      'client_id', p_client_id::text,
      'node_id', p_node_id::text,
      'effective_from', p_effective_from::text
    ),
    p_effective_from
  );
  return v_request_id;
end; $$;
revoke execute on function core_identity.client_node_place(uuid, uuid, date) from public, anon;

-- ─── client_node_close (pending) ────────────────────────────────────────
create or replace function core_identity.client_node_close(
  p_client_id uuid,
  p_effective_from date
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_request_id uuid;
begin
  if not core_identity.has_permission('client_placements', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  v_request_id := core_identity.pending_change_request(
    'client_close', p_client_id,
    jsonb_build_object(
      'client_id', p_client_id::text,
      'effective_from', p_effective_from::text
    ),
    p_effective_from
  );
  return v_request_id;
end; $$;
revoke execute on function core_identity.client_node_close(uuid, date) from public, anon;

-- ─── employee_role_assign (direkte; ikke pending) ──────────────────────
-- V2 Valg 14: krav-dok 4.4 specificerer ikke gældende dato. Tynd wrapper omkring
-- trin 5's employee_upsert (sætter role_id).
create or replace function core_identity.employee_role_assign(
  p_employee_id uuid,
  p_role_id uuid
) returns void language plpgsql security invoker set search_path = '' as $$
declare v_emp record;
begin
  if not core_identity.has_permission('employees', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  -- Hent eksisterende employee-data (fra trin 1+5 schema).
  select auth_user_id, first_name, last_name, email, hire_date, termination_date
  into v_emp from core_identity.employees where id = p_employee_id;
  if not found then
    raise exception 'employee_not_found: %', p_employee_id using errcode = 'P0002';
  end if;
  perform core_identity.employee_upsert(
    p_employee_id, v_emp.auth_user_id, v_emp.first_name, v_emp.last_name, v_emp.email,
    v_emp.hire_date, v_emp.termination_date, p_role_id, 'employee_role_assign'
  );
end; $$;
revoke execute on function core_identity.employee_role_assign(uuid, uuid) from public, anon;

create or replace function core_identity.employee_role_remove(p_employee_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare v_emp record;
begin
  if not core_identity.has_permission('employees', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  select auth_user_id, first_name, last_name, email, hire_date, termination_date
  into v_emp from core_identity.employees where id = p_employee_id;
  if not found then
    raise exception 'employee_not_found: %', p_employee_id using errcode = 'P0002';
  end if;
  perform core_identity.employee_upsert(
    p_employee_id, v_emp.auth_user_id, v_emp.first_name, v_emp.last_name, v_emp.email,
    v_emp.hire_date, v_emp.termination_date, null, 'employee_role_remove'
  );
end; $$;
revoke execute on function core_identity.employee_role_remove(uuid) from public, anon;
