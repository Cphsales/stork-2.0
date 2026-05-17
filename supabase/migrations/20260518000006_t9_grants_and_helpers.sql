-- Trin 9 / §4 trin 9 Step 7: role_permission_grants + helpers + direkte CRUD.
--
-- Plan V6 Beslutning 5+6 + Valg 6+7: én grants-tabel med element-niveau-CHECK,
-- arve-via-resolve-helper, helpers læser kun using(true)-tabeller.

-- ─── role_permission_grants ─────────────────────────────────────────────
-- no-dedup-key: konfig-tabel; unique index på (role_id, area/page/tab) er natural key.
create table core_identity.role_permission_grants (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references core_identity.roles(id) on delete cascade,
  area_id uuid references core_identity.permission_areas(id) on delete cascade,
  page_id uuid references core_identity.permission_pages(id) on delete cascade,
  tab_id uuid references core_identity.permission_tabs(id) on delete cascade,
  can_access boolean not null default false,
  can_write boolean not null default false,
  visibility text not null default 'self' check (visibility in ('self', 'subtree', 'all')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Præcis én af area_id/page_id/tab_id skal være sat.
  check (
    (case when area_id is not null then 1 else 0 end) +
    (case when page_id is not null then 1 else 0 end) +
    (case when tab_id  is not null then 1 else 0 end) = 1
  )
);

comment on table core_identity.role_permission_grants is
  'T9 Step 7 V6 Beslutning 5: rettigheds-tildeling pr. (rolle × element). Præcis ét element-niveau (area/page/tab). visibility {self, subtree, all}.';

-- UNIQUE pr. (role × element)
create unique index role_permission_grants_unique
  on core_identity.role_permission_grants (
    role_id,
    coalesce(area_id::text, ''),
    coalesce(page_id::text, ''),
    coalesce(tab_id::text, '')
  );

alter table core_identity.role_permission_grants enable row level security;
alter table core_identity.role_permission_grants force row level security;
revoke all on table core_identity.role_permission_grants from public, anon, service_role;
grant select on table core_identity.role_permission_grants to authenticated;
create policy role_permission_grants_select on core_identity.role_permission_grants
  for select to authenticated using (true);
create trigger role_permission_grants_audit
  after insert or update or delete on core_identity.role_permission_grants
  for each row execute function core_compliance.stork_audit();

-- ─── Helper: acl_subtree_org_nodes ──────────────────────────────────────
-- Returnerer node_ids i caller's subtree (caller's placement-node + descendants via closure).
create or replace function core_identity.acl_subtree_org_nodes(p_employee_id uuid)
returns uuid[] language sql stable security invoker set search_path = '' as $$
  select coalesce(array_agg(distinct c.descendant_id), '{}'::uuid[])
  from core_identity.employee_node_placements p
  join core_identity.org_node_closure c on c.ancestor_id = p.node_id
  where p.employee_id = p_employee_id
    and p.effective_from <= current_date
    and (p.effective_to is null or p.effective_to > current_date);
$$;
comment on function core_identity.acl_subtree_org_nodes(uuid) is
  'T9 Step 7: org_node-IDs i caller''s subtree. Plan V6 Valg 1+7. STABLE SECURITY INVOKER.';

-- ─── Helper: acl_subtree_employees ──────────────────────────────────────
create or replace function core_identity.acl_subtree_employees(p_employee_id uuid)
returns uuid[] language sql stable security invoker set search_path = '' as $$
  select coalesce(array_agg(distinct p.employee_id), '{}'::uuid[])
  from core_identity.employee_node_placements p
  where p.node_id = any(core_identity.acl_subtree_org_nodes(p_employee_id))
    and p.effective_from <= current_date
    and (p.effective_to is null or p.effective_to > current_date);
$$;
comment on function core_identity.acl_subtree_employees(uuid) is
  'T9 Step 7: employee-IDs i caller''s subtree (placement på node i acl_subtree_org_nodes). Plan V6 Valg 1+7.';

-- ─── Helper: permission_resolve ─────────────────────────────────────────
-- Arve-aware lookup: tab → page → area → default-deny.
create or replace function core_identity.permission_resolve(
  p_role_id uuid,
  p_element_type text,
  p_element_id uuid
) returns table (can_access boolean, can_write boolean, visibility text)
language plpgsql stable security invoker set search_path = '' as $$
declare
  v_page_id uuid;
  v_area_id uuid;
  v_grant record;
begin
  -- Først: tab-niveau grant?
  if p_element_type = 'tab' then
    select * into v_grant from core_identity.role_permission_grants
    where role_id = p_role_id and tab_id = p_element_id limit 1;
    if found then
      can_access := v_grant.can_access;
      can_write := v_grant.can_write;
      visibility := v_grant.visibility;
      return next;
      return;
    end if;
    -- Fald tilbage til page-niveau.
    select page_id into v_page_id from core_identity.permission_tabs where id = p_element_id;
  elsif p_element_type = 'page' then
    v_page_id := p_element_id;
  end if;

  if v_page_id is not null then
    select * into v_grant from core_identity.role_permission_grants
    where role_id = p_role_id and page_id = v_page_id limit 1;
    if found then
      can_access := v_grant.can_access;
      can_write := v_grant.can_write;
      visibility := v_grant.visibility;
      return next;
      return;
    end if;
    -- Fald tilbage til area-niveau.
    select area_id into v_area_id from core_identity.permission_pages where id = v_page_id;
  end if;

  if p_element_type = 'area' then
    v_area_id := p_element_id;
  end if;

  if v_area_id is not null then
    select * into v_grant from core_identity.role_permission_grants
    where role_id = p_role_id and area_id = v_area_id limit 1;
    if found then
      can_access := v_grant.can_access;
      can_write := v_grant.can_write;
      visibility := v_grant.visibility;
      return next;
      return;
    end if;
  end if;

  -- Default-deny.
  can_access := false;
  can_write := false;
  visibility := 'self';
  return next;
end;
$$;
comment on function core_identity.permission_resolve(uuid, text, text) is
  'T9 Step 7 Valg 6: arve-aware permission lookup (tab → page → area → default-deny). Plan V6.';

-- ─── Helper: acl_visibility_check ───────────────────────────────────────
-- V2 split (Codex V1 MELLEM): visibility-only; permission_resolve er separat.
create or replace function core_identity.acl_visibility_check(
  p_employee_id uuid,
  p_target_id uuid,
  p_target_kind text,
  p_visibility text
) returns boolean language sql stable security invoker set search_path = '' as $$
  select case p_visibility
    when 'all' then true
    when 'self' then p_target_id = p_employee_id
    when 'subtree' then
      case p_target_kind
        when 'employee' then p_target_id = any(core_identity.acl_subtree_employees(p_employee_id))
        when 'org_node' then p_target_id = any(core_identity.acl_subtree_org_nodes(p_employee_id))
        else false
      end
    else false
  end;
$$;
comment on function core_identity.acl_visibility_check(uuid, uuid, text, text) is
  'T9 Step 7 V2 Codex MELLEM-split: visibility-only check. Tager visibility-værdi som input; kalder IKKE permission_resolve. Forretnings-RPC composer separat.';

-- ─── Placeholder-helpers for konsistens i scope-helper-tabel ────────────
create or replace function core_identity.acl_self(p_target_employee_id uuid)
returns boolean language sql stable security invoker set search_path = '' as $$
  select p_target_employee_id = core_identity.current_employee_id();
$$;

create or replace function core_identity.acl_all() returns boolean
language sql immutable security invoker set search_path = '' as $$
  select true;
$$;

-- ─── CRUD-RPC'er for grants ─────────────────────────────────────────────
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
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;

  if p_element_type = 'area' then v_area_id := p_element_id;
  elsif p_element_type = 'page' then v_page_id := p_element_id;
  elsif p_element_type = 'tab' then v_tab_id := p_element_id;
  else raise exception 'invalid_element_type: %', p_element_type using errcode = '22023';
  end if;

  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'role_permission_grant_set', true);

  insert into core_identity.role_permission_grants
    (role_id, area_id, page_id, tab_id, can_access, can_write, visibility)
  values
    (p_role_id, v_area_id, v_page_id, v_tab_id, p_can_access, p_can_write, p_visibility)
  on conflict (role_id, coalesce(area_id::text, ''), coalesce(page_id::text, ''), coalesce(tab_id::text, ''))
  do update set
    can_access = excluded.can_access,
    can_write = excluded.can_write,
    visibility = excluded.visibility,
    updated_at = now()
  returning id into v_id;

  return v_id;
end; $$;
revoke execute on function core_identity.role_permission_grant_set(uuid, text, uuid, boolean, boolean, text) from public, anon;

create or replace function core_identity.role_permission_grant_remove(
  p_role_id uuid,
  p_element_type text,
  p_element_id uuid
) returns void language plpgsql security invoker set search_path = '' as $$
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'role_permission_grant_remove', true);

  if p_element_type = 'area' then
    delete from core_identity.role_permission_grants where role_id = p_role_id and area_id = p_element_id;
  elsif p_element_type = 'page' then
    delete from core_identity.role_permission_grants where role_id = p_role_id and page_id = p_element_id;
  elsif p_element_type = 'tab' then
    delete from core_identity.role_permission_grants where role_id = p_role_id and tab_id = p_element_id;
  else
    raise exception 'invalid_element_type: %', p_element_type using errcode = '22023';
  end if;
end; $$;
revoke execute on function core_identity.role_permission_grant_remove(uuid, text, uuid) from public, anon;
