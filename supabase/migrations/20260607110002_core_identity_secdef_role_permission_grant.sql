-- gov-3b-3b (#18 retning A): konvertér role_permission_grant_set + _remove INVOKER → SECURITY DEFINER.
-- DIFF-summary: KUN `security invoker` → `security definer`. Bodies 1:1 fra kanonisk 20260521100007:10-53 + 143-167
-- (parity-body-audit: live matchede kanonisk, ingen drift). Behavior-preserving (postgres/bypassrls; has_permission via JWT).
-- Idempotent (create or replace).

create or replace function core_identity.role_permission_grant_set(
  p_role_id uuid,
  p_element_type text,
  p_element_id uuid,
  p_can_access boolean,
  p_can_write boolean,
  p_visibility text
) returns uuid language plpgsql security definer set search_path = '' as $$
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

create or replace function core_identity.role_permission_grant_remove(
  p_role_id uuid,
  p_element_type text,
  p_element_id uuid
) returns void language plpgsql security definer set search_path = '' as $$
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
