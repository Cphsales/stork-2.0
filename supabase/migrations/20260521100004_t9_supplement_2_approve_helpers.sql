-- T9-supplement-2 M4: Approve-helpers + pending_changes.action_id
--
-- Tilføjer pending_changes.action_id-kolonne (nullable for legacy pendings),
-- helper acl_higher_level_employees (ancestor-medarbejdere via org_node_closure),
-- og has_permission_action (additivt tjek: tab-can_access + action-grant +
-- can_write UNDTAGEN hvis bypass_tab_write=true).
--
-- Reference: docs/coordination/t9-supplement-2-plan.md M4 + krav-dok §3.3.

-- ─── Tilføj pending_changes.action_id ────────────────────────────────────
-- Nullable for legacy pendings før denne pakke; ON DELETE RESTRICT for at
-- forhindre at action slettes mens pendings refererer den.
alter table core_identity.pending_changes
  add column action_id uuid references core_identity.permission_actions(id) on delete restrict;

-- ─── Helper: acl_higher_level_employees ─────────────────────────────────
-- Returnerer employees placeret på en strengt højere knude (ancestor) end
-- requester via org_node_closure (depth > 0). Bruges af pending_change_approve
-- og UI til at vise eligible approvers.
create or replace function core_identity.acl_higher_level_employees(p_requester_employee_id uuid)
returns uuid[] language sql stable security invoker set search_path = '' as $$
  select coalesce(array_agg(distinct emp.employee_id), '{}'::uuid[])
  from core_identity.employee_node_placements req
  join core_identity.org_node_closure c
    on c.descendant_id = req.node_id
    and c.depth > 0  -- strengt højere
  join core_identity.employee_node_placements emp
    on emp.node_id = c.ancestor_id
    and emp.effective_from <= current_date
    and (emp.effective_to is null or emp.effective_to > current_date)
  where req.employee_id = p_requester_employee_id
    and req.effective_from <= current_date
    and (req.effective_to is null or req.effective_to > current_date)
    and emp.employee_id <> p_requester_employee_id;
$$;

comment on function core_identity.acl_higher_level_employees(uuid) is
  'T9-supplement-2: employees placeret på en strengt højere knude end requester (depth > 0 via org_node_closure). Bruges af pending_change_approve til "above"-type-validering og af UI til eligible-approvers-lookup.';

revoke all on function core_identity.acl_higher_level_employees(uuid) from public;
grant execute on function core_identity.acl_higher_level_employees(uuid) to authenticated;

-- ─── has_permission_action: kombineret action-permission-tjek ───────────
-- V2 (Codex V1-2 fix): direkte action-grant lookup UDEN fallback til tab/page/area.
-- Returnerer true KUN hvis bruger har (a) can_access på tab + (b) EKSPLICIT
-- action-grant + (c) can_write på tab — UNDTAGEN hvis bypass_tab_write=true.
create or replace function core_identity.has_permission_action(
  p_action_id uuid
) returns boolean
language plpgsql stable security invoker set search_path = '' as $$
declare
  v_employee_id uuid;
  v_role_id uuid;
  v_action record;
  v_tab_grant record;
  v_action_grant_can_access boolean;
begin
  v_employee_id := core_identity.current_employee_id();
  if v_employee_id is null then return false; end if;
  select role_id into v_role_id from core_identity.employees where id = v_employee_id;
  if v_role_id is null then return false; end if;

  -- Hent action-config
  select tab_id, bypass_tab_write into v_action
    from core_identity.permission_actions where id = p_action_id and is_active = true;
  if not found then return false; end if;

  -- (a) Tab-can_access tjek (via permission_resolve — fallback OK for tab→page→area)
  select * into v_tab_grant from core_identity.permission_resolve(v_role_id, 'tab', v_action.tab_id);
  if not v_tab_grant.can_access then return false; end if;

  -- (b) Action-grant tjek — DIREKTE lookup, INGEN fallback (additive-model)
  select can_access into v_action_grant_can_access from core_identity.role_permission_grants
    where role_id = v_role_id and action_id = p_action_id limit 1;
  if not found or not v_action_grant_can_access then return false; end if;

  -- (c) Tab-can_write tjek — undtagen hvis bypass_tab_write
  if not v_action.bypass_tab_write then
    if not v_tab_grant.can_write then return false; end if;
  end if;

  return true;
end; $$;

comment on function core_identity.has_permission_action(uuid) is
  'T9-supplement-2 krav-dok §2.6: kombineret tjek for konfigureret action — kræver can_access på tab + action-grant + (can_write på tab UNDTAGEN hvis bypass_tab_write=true). Option Y additive-model.';

revoke all on function core_identity.has_permission_action(uuid) from public;
grant execute on function core_identity.has_permission_action(uuid) to authenticated;

-- ─── Klassifikation: pending_changes.action_id ──────────────────────────
select set_config('stork.allow_data_field_definitions_write', 'true', false);
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason', 'T9-supplement-2 M4: classify pending_changes.action_id', false);

insert into core_compliance.data_field_definitions
  (table_schema, table_name, column_name, category, pii_level, retention_type, retention_value, match_role, purpose) values
  ('core_identity', 'pending_changes', 'action_id', 'audit', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'FK til permission_actions; bruges af pending_change_approve til at evaluere approve-disciplin pr. handling')
on conflict (table_schema, table_name, column_name) do nothing;
