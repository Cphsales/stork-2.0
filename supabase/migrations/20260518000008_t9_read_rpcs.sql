-- Trin 9 / §4 trin 9 Step 9: Read-RPCs for Hent-funktioner.
--
-- Plan V6 Valg 13: dedikerede read-RPCs for alle 9 Hent-funktioner fra
-- krav-dok sektion 4. Symmetrisk current/historisk (V5-sweep: read() = read_at(current_date)).

-- ─── 4.1 org_tree_read + org_tree_read_at ───────────────────────────────
create or replace function core_identity.org_tree_read_at(p_date date)
returns table (
  node_id uuid,
  name text,
  parent_id uuid,
  node_type text,
  is_active boolean
) language sql stable security invoker set search_path = '' as $$
  select distinct on (v.node_id) v.node_id, v.name, v.parent_id, v.node_type, v.is_active
  from core_identity.org_node_versions v
  where v.effective_from <= p_date
    and (v.effective_to is null or v.effective_to > p_date)
  order by v.node_id, v.effective_from desc;
$$;
comment on function core_identity.org_tree_read_at(date) is
  'T9 Step 9 V5-sweep Valg 13: org-tree på given dato. Symmetrisk pattern; org_tree_read() = org_tree_read_at(current_date).';

create or replace function core_identity.org_tree_read()
returns table (node_id uuid, name text, parent_id uuid, node_type text, is_active boolean)
language sql stable security invoker set search_path = '' as $$
  select * from core_identity.org_tree_read_at(current_date);
$$;

-- ─── 4.2 employee_placement_read + _at ──────────────────────────────────
create or replace function core_identity.employee_placement_read_at(
  p_employee_id uuid,
  p_date date
) returns table (placement_id uuid, node_id uuid, effective_from date, effective_to date)
language sql stable security invoker set search_path = '' as $$
  select id, node_id, effective_from, effective_to
  from core_identity.employee_node_placements
  where employee_id = p_employee_id
    and effective_from <= p_date
    and (effective_to is null or effective_to > p_date);
$$;

create or replace function core_identity.employee_placement_read(p_employee_id uuid)
returns table (placement_id uuid, node_id uuid, effective_from date, effective_to date)
language sql stable security invoker set search_path = '' as $$
  select * from core_identity.employee_placement_read_at(p_employee_id, current_date);
$$;

-- ─── 4.3 client_placement_read + _at ────────────────────────────────────
create or replace function core_identity.client_placement_read_at(
  p_client_id uuid,
  p_date date
) returns table (placement_id uuid, node_id uuid, effective_from date, effective_to date)
language sql stable security invoker set search_path = '' as $$
  select id, node_id, effective_from, effective_to
  from core_identity.client_node_placements
  where client_id = p_client_id
    and effective_from <= p_date
    and (effective_to is null or effective_to > p_date);
$$;

create or replace function core_identity.client_placement_read(p_client_id uuid)
returns table (placement_id uuid, node_id uuid, effective_from date, effective_to date)
language sql stable security invoker set search_path = '' as $$
  select * from core_identity.client_placement_read_at(p_client_id, current_date);
$$;

-- ─── 4.5 permission_elements_read ───────────────────────────────────────
create or replace function core_identity.permission_elements_read()
returns table (
  level text,
  element_id uuid,
  parent_id uuid,
  name text,
  is_active boolean,
  sort_order integer
) language sql stable security invoker set search_path = '' as $$
  select 'area'::text, id, null::uuid, name, is_active, sort_order
  from core_identity.permission_areas where is_active = true
  union all
  select 'page'::text, id, area_id, name, is_active, sort_order
  from core_identity.permission_pages where is_active = true
  union all
  select 'tab'::text, id, page_id, name, is_active, sort_order
  from core_identity.permission_tabs where is_active = true
  order by 1, 6, 4;
$$;

-- ─── 4.6 role_permissions_read ──────────────────────────────────────────
create or replace function core_identity.role_permissions_read(p_role_id uuid)
returns table (
  grant_id uuid,
  element_type text,
  element_id uuid,
  element_name text,
  can_access boolean,
  can_write boolean,
  visibility text
) language sql stable security invoker set search_path = '' as $$
  select g.id, 'area'::text, g.area_id, a.name, g.can_access, g.can_write, g.visibility
  from core_identity.role_permission_grants g
  join core_identity.permission_areas a on a.id = g.area_id
  where g.role_id = p_role_id and g.area_id is not null
  union all
  select g.id, 'page'::text, g.page_id, p.name, g.can_access, g.can_write, g.visibility
  from core_identity.role_permission_grants g
  join core_identity.permission_pages p on p.id = g.page_id
  where g.role_id = p_role_id and g.page_id is not null
  union all
  select g.id, 'tab'::text, g.tab_id, t.name, g.can_access, g.can_write, g.visibility
  from core_identity.role_permission_grants g
  join core_identity.permission_tabs t on t.id = g.tab_id
  where g.role_id = p_role_id and g.tab_id is not null;
$$;

-- ─── 4.7 pending_changes_read ───────────────────────────────────────────
create or replace function core_identity.pending_changes_read()
returns table (
  change_id uuid,
  change_type text,
  target_id uuid,
  effective_from date,
  status text,
  requested_at timestamptz,
  approved_at timestamptz,
  undo_deadline timestamptz,
  applied_at timestamptz
) language sql stable security invoker set search_path = '' as $$
  select id, change_type, target_id, effective_from, status,
         requested_at, approved_at, undo_deadline, applied_at
  from core_identity.pending_changes
  where requested_by = core_identity.current_employee_id() or core_identity.is_admin()
  order by requested_at desc;
$$;
