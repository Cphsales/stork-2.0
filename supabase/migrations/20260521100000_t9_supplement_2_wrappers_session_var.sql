-- T9-supplement-2 M1: G059 session-var-fix på 5 wrappers + grants på 5+2 wrappers
--
-- G059: 5 T9 wrapper-RPC'er (org_node + employee + team-veje) manglede
-- `stork.t9_write_authorized`-session-var FØR `pending_change_request`. INSERT
-- på `pending_changes` fejlede for authenticated bruger med FORCE RLS. T10.7b
-- fixede de to klient-wrappers; de fem øvrige forblev broken.
--
-- V8 (Codex V7-1 fix): plus eksplicit grant til authenticated på 5 G059-wrappers
-- + 2 T10-client-wrappers (samme systemiske grant-issue).
--
-- Reference: docs/coordination/t9-supplement-2-plan.md M1 + krav-dok §3.1.

-- ─── org_node_upsert (V11: session-var) ─────────────────────────────────
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

  -- V11 (G059): sæt session-var FØR pending_change_request (T9-fundament-supplement INSERT-policy)
  perform set_config('stork.t9_write_authorized', 'true', true);

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
grant execute on function core_identity.org_node_upsert(uuid, text, uuid, text, boolean, date) to authenticated;

-- ─── org_node_deactivate (V11: session-var) ──────────────────────────────
create or replace function core_identity.org_node_deactivate(
  p_node_id uuid,
  p_effective_from date
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_request_id uuid;
begin
  if not core_identity.has_permission('org_nodes', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.t9_write_authorized', 'true', true);
  v_request_id := core_identity.pending_change_request(
    'org_node_deactivate', p_node_id,
    jsonb_build_object('node_id', p_node_id::text, 'effective_from', p_effective_from::text),
    p_effective_from
  );
  return v_request_id;
end; $$;
revoke execute on function core_identity.org_node_deactivate(uuid, date) from public, anon;
grant execute on function core_identity.org_node_deactivate(uuid, date) to authenticated;

-- ─── team_close (V11: session-var) ───────────────────────────────────────
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
  perform set_config('stork.t9_write_authorized', 'true', true);
  v_request_id := core_identity.pending_change_request(
    'team_close', p_node_id,
    jsonb_build_object('node_id', p_node_id::text, 'effective_from', p_effective_from::text),
    p_effective_from
  );
  return v_request_id;
end; $$;
revoke execute on function core_identity.team_close(uuid, date) from public, anon;
grant execute on function core_identity.team_close(uuid, date) to authenticated;

-- ─── employee_place (V11: session-var) ───────────────────────────────────
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
  perform set_config('stork.t9_write_authorized', 'true', true);
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
grant execute on function core_identity.employee_place(uuid, uuid, date) to authenticated;

-- ─── employee_remove_from_node (V11: session-var) ────────────────────────
create or replace function core_identity.employee_remove_from_node(
  p_employee_id uuid,
  p_effective_from date
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_request_id uuid;
begin
  if not core_identity.has_permission('employee_placements', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.t9_write_authorized', 'true', true);
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
grant execute on function core_identity.employee_remove_from_node(uuid, date) to authenticated;

-- ─── V11: Explicit grants for T10-client-wrappers (systemisk grant-issue fix) ────
-- client_node_place + client_node_close har samme issue (revoke uden grant).
-- T10.7b's CREATE OR REPLACE bevarede ACL — men der var aldrig grant til authenticated.
grant execute on function core_identity.client_node_place(uuid, uuid, date) to authenticated;
grant execute on function core_identity.client_node_close(uuid, date) to authenticated;
