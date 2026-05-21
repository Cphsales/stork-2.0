-- T9-supplement-2 M3b: RLS-policy-refactor for pending_changes_select (action-aware)
--
-- V11 (Mathias-fund B2 fix): eksisterende pending_changes_select-policy
-- (20260518100000:66-83) er can_edit-baseret. En legitim godkender med
-- bypass_tab_write=true (uden tab-can_write) kan ikke SELECTe pending'en.
--
-- V15 (Codex V14 KRITISK-SIKKERHEDSHUL fix): action-grenen spejler approve-
-- eligibility for at forhindre RLS-overread. Non-admin med action-grant i
-- sibling-gren kan IKKE SELECTe above-pending payload.
--
-- V12: M3b eksekverer EFTER M4 (filnummer 100005 > 100004) selv om Step-
-- nummer er "M3b" — M4 opretter pending_changes.action_id + has_permission_action
-- som denne policy refererer.
--
-- Reference: docs/coordination/t9-supplement-2-plan.md M3b.

drop policy if exists pending_changes_select on core_identity.pending_changes;

create policy pending_changes_select on core_identity.pending_changes
  for select to authenticated
  using (
    requested_by = core_identity.current_employee_id()
    or core_identity.is_admin()
    -- Legacy can_edit-baserede grene (uændret for action_id IS NULL)
    or (
      action_id is null
      and change_type in ('org_node_upsert', 'org_node_deactivate', 'team_close')
      and core_identity.has_permission('org_nodes', null, true)
    )
    or (
      action_id is null
      and change_type in ('employee_place', 'employee_remove')
      and core_identity.has_permission('employee_placements', null, true)
    )
    or (
      action_id is null
      and change_type in ('client_place', 'client_close')
      and core_identity.has_permission('client_placements', null, true)
    )
    -- V15 (Codex V14 KRITISK-SIKKERHEDSHUL fix): action-baseret SELECT spejler approve-eligibility
    or (
      action_id is not null
      and core_identity.has_permission_action(action_id)
      and exists (
        select 1 from core_identity.permission_actions act
        where act.id = action_id
          and (
            -- Action uden 2.-approver-krav: action-grant er nok for SELECT
            act.requires_second_approver = false
            -- Action kræver 'above': læser skal være higher-level af requester
            or (
              act.requires_second_approver = true
              and act.second_approver_type = 'above'
              and core_identity.current_employee_id() = any(core_identity.acl_higher_level_employees(requested_by))
            )
            -- Action kræver 'superadmin': kun superadmin (allerede dækket af is_admin() ovenfor)
          )
      )
    )
  );
