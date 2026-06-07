-- gov-3b-3a (#18 retning A): konvertér permission_action-RPC'er INVOKER → SECURITY DEFINER.
-- DIFF-summary: tilføjer KUN `SECURITY DEFINER` til 3 eksisterende funktioner. Body 1:1 bevaret
-- (has_permission-gate, session-vars, write-logik uændret). Behavior-preserving: kører nu som
-- postgres (bypassrls); has_permission() gater fortsat via JWT. Forbereder REVOKE i gov-3b-3b ([G065]).
-- Idempotent (CREATE OR REPLACE).

CREATE OR REPLACE FUNCTION core_identity.permission_action_upsert(p_id uuid, p_tab_id uuid, p_name text, p_is_active boolean DEFAULT true, p_sort_order integer DEFAULT 0)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
    on conflict (id) do update set tab_id = excluded.tab_id, name = excluded.name, is_active = excluded.is_active, sort_order = excluded.sort_order, updated_at = now()
    returning id into v_id;
  end if;
  return v_id;
end; $function$;

CREATE OR REPLACE FUNCTION core_identity.permission_action_deactivate(p_action_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'permission_action_deactivate', true);
  update core_identity.permission_actions set is_active = false, updated_at = now() where id = p_action_id;
end; $function$;

CREATE OR REPLACE FUNCTION core_identity.permission_action_set_approver_type(p_action_id uuid, p_type text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_requires boolean;
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  if p_type not in ('above', 'superadmin') then
    raise exception 'invalid_approver_type: %', p_type using errcode = '22023';
  end if;
  select requires_second_approver into v_requires from core_identity.permission_actions where id = p_action_id;
  if not found then
    raise exception 'permission_action_not_found: %', p_action_id using errcode = 'P0002';
  end if;
  if not v_requires then
    raise exception 'cannot_set_approver_type_when_not_required: action % har requires_second_approver=false', p_action_id using errcode = '22023';
  end if;
  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'permission_action_set_approver_type', true);
  update core_identity.permission_actions set second_approver_type = p_type, updated_at = now() where id = p_action_id;
end; $function$;
