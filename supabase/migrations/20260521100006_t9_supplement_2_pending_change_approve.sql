-- T9-supplement-2 M5: Refactor pending_change_approve med action-baseret evaluering
--
-- V5 (Codex V4-1 KRITISK-SIKKERHEDSHUL): bevar self-approve-blok for legacy
-- (action_id IS NULL); følg §2.5-ny-regel for konfigurerede actions.
-- V7 (Codex V6 KRITISK): tilføj explicit grant til authenticated.
-- V11 (Mathias-fund B1): drop can_edit-pre-check for actions (bypass_tab_write virker).
-- V14 (Codex V13 KRITISK-SIKKERHEDSHUL): tilføj has_permission_action-gate i action-grenen.
-- V4 (Codex V3 KRITISK-SIKKERHEDSHUL): undo_deadline = now() for has_undo=false
-- (nul-sekund vindue → undo afvises, cron inkluderer, apply tilladt).
--
-- Reference: docs/coordination/t9-supplement-2-plan.md M5 + krav-dok §3.3.

create or replace function core_identity.pending_change_approve(
  p_change_id uuid
) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  v_change record;
  v_approver uuid;
  v_undo_period integer;
  v_page_key text;
  v_action record;
  v_higher_level_employees uuid[];
  v_has_undo boolean;
begin
  v_approver := core_identity.current_employee_id();
  if v_approver is null then
    raise exception 'no_authenticated_employee' using errcode = '42501';
  end if;

  select * into v_change from core_identity.pending_changes where id = p_change_id for update;
  if not found then
    raise exception 'pending_change_not_found %', p_change_id using errcode = 'P0002';
  end if;
  if v_change.status <> 'pending' then
    raise exception 'pending_change_wrong_status: % (expected pending)', v_change.status using errcode = '22023';
  end if;

  -- Page-key dispatcher (bruges af can_edit-tjek på legacy-flow)
  case v_change.change_type
    when 'org_node_upsert'     then v_page_key := 'org_nodes';
    when 'org_node_deactivate' then v_page_key := 'org_nodes';
    when 'team_close'          then v_page_key := 'org_nodes';
    when 'employee_place'      then v_page_key := 'employee_placements';
    when 'employee_remove'     then v_page_key := 'employee_placements';
    when 'client_place'        then v_page_key := 'client_placements';
    when 'client_close'        then v_page_key := 'client_placements';
    else
      raise exception 'unknown_change_type for approve-gate: %', v_change.change_type using errcode = '42883';
  end case;

  -- V11 (Mathias-fund B1 fix): can_edit-pre-check KUN for legacy pendings
  -- For actions: action-baseret approve-logik er suveræn (respekterer bypass_tab_write)
  if v_change.action_id is null then
    if not core_identity.has_permission(v_page_key, null, true) then
      raise exception 'permission_denied: approve % kræver can_edit på %', v_change.change_type, v_page_key using errcode = '42501';
    end if;
  end if;

  -- V5/V14: action-baseret approve-disciplin
  if v_change.action_id is null then
    -- Legacy: bevar self-approve-forbud for non-admin (regression-beskyttelse)
    if v_change.requested_by = v_approver and not core_identity.is_admin() then
      raise exception 'pending_change_self_approve_forbidden'
        using errcode = '42501', hint = 'requester må ikke selv approve (medmindre admin); action-baseret konfig kommer i senere pakke';
    end if;
  else
    -- V14 (Codex V13 fix): explicit action-permission-gate
    -- M3b's SELECT-policy er ikke nok som write-gate (requester får SELECT via requested_by-grenen)
    if not core_identity.is_admin() and not core_identity.has_permission_action(v_change.action_id) then
      raise exception 'permission_denied: approve af action % kræver action-grant + tab-rettighed (eller superadmin)', v_change.action_id
        using errcode = '42501';
    end if;

    -- Action-baseret evaluering per krav-dok §2.5
    select requires_second_approver, second_approver_type into v_action
      from core_identity.permission_actions where id = v_change.action_id;

    if v_action.requires_second_approver then
      if core_identity.is_admin() then
        -- Superadmin bypasser (jf. krav-dok §2.5 superadmin-undtagelse)
        null;
      elsif v_action.second_approver_type = 'above' then
        v_higher_level_employees := core_identity.acl_higher_level_employees(v_change.requested_by);
        if not (v_approver = any(v_higher_level_employees)) then
          raise exception 'approver_not_higher_level: % er ikke placeret højere end requester %', v_approver, v_change.requested_by
            using errcode = '42501';
        end if;
      elsif v_action.second_approver_type = 'superadmin' then
        raise exception 'approver_must_be_superadmin: action % kræver superadmin-godkendelse', v_change.action_id
          using errcode = '42501';
      end if;
    end if;
    -- requires_second_approver=false → ingen ekstra tjek; default selv-approve tilladt per §2.5
  end if;

  -- V4 (Codex V3 KRITISK-SIKKERHEDSHUL fix): has_undo håndhæves
  -- Hvis action_id IS NOT NULL AND has_undo=false → undo_deadline=now() (nul-sekund vindue
  -- blokerer undo + tillader apply). Legacy (action_id IS NULL) bevarer eksisterende adfærd.
  v_has_undo := true;  -- default for legacy
  if v_change.action_id is not null then
    select has_undo into v_has_undo from core_identity.permission_actions where id = v_change.action_id;
  end if;

  if v_has_undo then
    select undo_period_seconds into v_undo_period
    from core_identity.undo_settings where change_type = v_change.change_type;
    if v_undo_period is null then v_undo_period := 24 * 3600; end if;
  end if;

  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'pending_change_approve', true);

  update core_identity.pending_changes
  set status = 'approved',
      approved_by = v_approver,
      approved_at = now(),
      undo_deadline = case
        when v_has_undo then now() + (v_undo_period || ' seconds')::interval
        else now()  -- nul-sekund undo-vindue
      end,
      updated_at = now()
  where id = p_change_id;
end; $$;

revoke execute on function core_identity.pending_change_approve(uuid) from public, anon;
-- V7 (Codex V6 KRITISK fix): explicit grant
grant execute on function core_identity.pending_change_approve(uuid) to authenticated;
