-- T9-supplement-2 M6: UI-RPCs for permission_actions + udvid role_permission_grant_set/remove
--
-- Udvider role_permission_grant_set + role_permission_grant_remove med 'action'-
-- element-type. Tilføjer permission_action_upsert, permission_action_deactivate,
-- permission_action_set_approver_type (UI-redigerbart felt), pending_change_eligible_approvers.
--
-- Reference: docs/coordination/t9-supplement-2-plan.md M6 + krav-dok §3.3, §3.4.

-- ─── Udvid role_permission_grant_set til at acceptere 'action' ──────────
create or replace function core_identity.role_permission_grant_set(
  p_role_id uuid,
  p_element_type text,
  p_element_id uuid,
  p_can_access boolean,
  p_can_write boolean,
  p_visibility text
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  v_id uuid;
  v_area_id uuid;
  v_page_id uuid;
  v_tab_id uuid;
  v_action_id uuid;
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;

  if    p_element_type = 'area'   then v_area_id   := p_element_id;
  elsif p_element_type = 'page'   then v_page_id   := p_element_id;
  elsif p_element_type = 'tab'    then v_tab_id    := p_element_id;
  elsif p_element_type = 'action' then v_action_id := p_element_id;
  else raise exception 'invalid_element_type: %', p_element_type using errcode = '22023';
  end if;

  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'role_permission_grant_set', true);

  insert into core_identity.role_permission_grants
    (role_id, area_id, page_id, tab_id, action_id, can_access, can_write, visibility)
  values
    (p_role_id, v_area_id, v_page_id, v_tab_id, v_action_id, p_can_access, p_can_write, p_visibility)
  on conflict (role_id, coalesce(area_id::text, ''), coalesce(page_id::text, ''), coalesce(tab_id::text, ''), coalesce(action_id::text, ''))
  do update set
    can_access = excluded.can_access,
    can_write = excluded.can_write,
    visibility = excluded.visibility,
    updated_at = now()
  returning id into v_id;

  return v_id;
end; $$;
-- V3 (Codex V2 KRITISK fix): eksplicit grant for klarhed
grant execute on function core_identity.role_permission_grant_set(uuid, text, uuid, boolean, boolean, text) to authenticated;

-- ─── permission_action_upsert (UI-RPC) ──────────────────────────────────
-- Kun navn, sort_order, is_active. requires_second_approver/has_undo/bypass_tab_write
-- er kode-låst og sættes IKKE her.
create or replace function core_identity.permission_action_upsert(
  p_id uuid,
  p_tab_id uuid,
  p_name text,
  p_is_active boolean default true,
  p_sort_order integer default 0
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_id uuid;
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'permission_action_upsert', true);

  if p_id is null then
    insert into core_identity.permission_actions (tab_id, name, is_active, sort_order)
    values (p_tab_id, p_name, p_is_active, p_sort_order) returning id into v_id;
  else
    insert into core_identity.permission_actions (id, tab_id, name, is_active, sort_order)
    values (p_id, p_tab_id, p_name, p_is_active, p_sort_order)
    on conflict (id) do update
    set tab_id = excluded.tab_id, name = excluded.name,
        is_active = excluded.is_active, sort_order = excluded.sort_order,
        updated_at = now()
    returning id into v_id;
  end if;
  return v_id;
end; $$;
revoke execute on function core_identity.permission_action_upsert(uuid, uuid, text, boolean, integer) from public, anon;
grant execute on function core_identity.permission_action_upsert(uuid, uuid, text, boolean, integer) to authenticated;

-- ─── permission_action_deactivate (UI-RPC) ──────────────────────────────
create or replace function core_identity.permission_action_deactivate(p_action_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'permission_action_deactivate', true);
  update core_identity.permission_actions set is_active = false, updated_at = now()
    where id = p_action_id;
end; $$;
revoke execute on function core_identity.permission_action_deactivate(uuid) from public, anon;
grant execute on function core_identity.permission_action_deactivate(uuid) to authenticated;

-- ─── permission_action_set_approver_type (UI-RPC) ───────────────────────
-- Kun UI-redigerbart felt. Validerer at action har requires_second_approver=true.
create or replace function core_identity.permission_action_set_approver_type(
  p_action_id uuid,
  p_type text
) returns void language plpgsql security invoker set search_path = '' as $$
declare v_requires boolean;
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  if p_type not in ('above', 'superadmin') then
    raise exception 'invalid_approver_type: % (forventet: above eller superadmin)', p_type using errcode = '22023';
  end if;
  select requires_second_approver into v_requires
    from core_identity.permission_actions where id = p_action_id;
  if not found then
    raise exception 'permission_action_not_found: %', p_action_id using errcode = 'P0002';
  end if;
  if not v_requires then
    raise exception 'cannot_set_approver_type_when_not_required: action % har requires_second_approver=false', p_action_id
      using errcode = '22023';
  end if;
  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'permission_action_set_approver_type', true);
  update core_identity.permission_actions
    set second_approver_type = p_type, updated_at = now()
    where id = p_action_id;
end; $$;
revoke execute on function core_identity.permission_action_set_approver_type(uuid, text) from public, anon;
grant execute on function core_identity.permission_action_set_approver_type(uuid, text) to authenticated;

-- ─── V11 (Mathias-fund M1 fix): role_permission_grant_remove med 'action' ────
create or replace function core_identity.role_permission_grant_remove(
  p_role_id uuid,
  p_element_type text,
  p_element_id uuid
) returns void language plpgsql security invoker set search_path = '' as $$
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'role_permission_grant_remove', true);

  if p_element_type = 'area' then
    delete from core_identity.role_permission_grants where role_id = p_role_id and area_id = p_element_id;
  elsif p_element_type = 'page' then
    delete from core_identity.role_permission_grants where role_id = p_role_id and page_id = p_element_id;
  elsif p_element_type = 'tab' then
    delete from core_identity.role_permission_grants where role_id = p_role_id and tab_id = p_element_id;
  elsif p_element_type = 'action' then
    delete from core_identity.role_permission_grants where role_id = p_role_id and action_id = p_element_id;
  else
    raise exception 'invalid_element_type: %', p_element_type using errcode = '22023';
  end if;
end; $$;
-- Existing grants/revoke bevares via CREATE OR REPLACE; M1b har allerede grant

-- ─── pending_change_eligible_approvers ──────────────────────────────────
-- Returnerer medarbejdere der må approve baseret på action-config + requester-
-- placering + superadmin. UI bruger til "din godkendelse kræves"-notifikation.
create or replace function core_identity.pending_change_eligible_approvers(
  p_pending_change_id uuid
) returns uuid[] language plpgsql stable security invoker set search_path = '' as $$
declare
  v_change record;
  v_action record;
  v_eligible uuid[];
  v_superadmin_ids uuid[];
begin
  select * into v_change from core_identity.pending_changes where id = p_pending_change_id;
  if not found then return '{}'::uuid[]; end if;

  -- Find alle superadmins (placerings-uafhængigt)
  select coalesce(array_agg(e.id), '{}'::uuid[]) into v_superadmin_ids
  from core_identity.employees e
  join core_identity.role_page_permissions p on p.role_id = e.role_id
  where core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
    and p.page_key = 'system' and p.tab_key = 'manage'
    and p.scope = 'all' and p.can_edit = true;

  -- Legacy (action_id IS NULL) → kun superadmins som always-eligible
  if v_change.action_id is null then
    return v_superadmin_ids;
  end if;

  select requires_second_approver, second_approver_type into v_action
    from core_identity.permission_actions where id = v_change.action_id;

  if not v_action.requires_second_approver then
    return v_superadmin_ids;
  end if;

  if v_action.second_approver_type = 'superadmin' then
    return v_superadmin_ids;
  end if;

  -- second_approver_type='above': returner higher-level + superadmins
  v_eligible := core_identity.acl_higher_level_employees(v_change.requested_by);
  return (select array(select unnest(v_eligible) union select unnest(v_superadmin_ids)));
end; $$;
revoke execute on function core_identity.pending_change_eligible_approvers(uuid) from public, anon;
grant execute on function core_identity.pending_change_eligible_approvers(uuid) to authenticated;
