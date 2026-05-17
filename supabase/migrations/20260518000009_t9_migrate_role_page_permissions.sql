-- Trin 9 / §4 trin 9 Step 11: Migration af eksisterende role_page_permissions til ny model.
--
-- Plan V6 Valg 11 + Beslutning 10: seed areas + pages + tabs + grants fra
-- eksisterende role_page_permissions. Eksisterende tabel bevares som read-only
-- fallback. has_permission()-helper opdateres med fallback-pattern.
--
-- Scope-mapping: 'all'→'all', 'self'→'self', 'subtree'→'subtree', 'team'→'subtree'
-- (team-scope udgår per V5 mathias-afgoerelser pkt 14 + krav-dok 3.2.3).

-- ─── Seed areas (page_key prefix-grupperinger + nye T9-areas) ───────────
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason', 'T9 Step 11: seed permission-elementer + grants migration', false);

insert into core_identity.permission_areas (name, sort_order) values
  ('identity', 1),
  ('permissions', 2),
  ('org_structure', 3),
  ('compliance', 10),
  ('audit', 11),
  ('anonymization', 12),
  ('break_glass', 13),
  ('operations', 20),
  ('system', 99)
on conflict (name) do nothing;

-- ─── Seed pages fra eksisterende page_keys + nye T9-pages ───────────────
do $seed$
declare
  v_page_record record;
  v_area_id uuid;
  v_area_name text;
  v_page_id uuid;
begin
  -- Map page_key → area_name.
  for v_page_record in
    select distinct page_key from core_identity.role_page_permissions
    union
    -- T9 nye pages.
    select unnest(array[
      'org_nodes', 'employee_placements', 'client_placements', 'permissions',
      'pending_changes'
    ])
  loop
    -- Mapping.
    v_area_name := case
      when v_page_record.page_key like 'anonymization%' then 'anonymization'
      when v_page_record.page_key = 'audit' then 'audit'
      when v_page_record.page_key like 'break_glass%' then 'break_glass'
      when v_page_record.page_key = 'classification' then 'compliance'
      when v_page_record.page_key = 'employee_active_config' then 'identity'
      when v_page_record.page_key = 'employees' then 'identity'
      when v_page_record.page_key = 'roles' then 'identity'
      when v_page_record.page_key = 'gdpr_responsible' then 'compliance'
      when v_page_record.page_key = 'pay_periods' then 'operations'
      when v_page_record.page_key = 'system' then 'system'
      when v_page_record.page_key = 'org_nodes' then 'org_structure'
      when v_page_record.page_key = 'employee_placements' then 'org_structure'
      when v_page_record.page_key = 'client_placements' then 'org_structure'
      when v_page_record.page_key = 'permissions' then 'permissions'
      when v_page_record.page_key = 'pending_changes' then 'operations'
      else 'system'  -- fallback
    end;

    select id into v_area_id from core_identity.permission_areas where name = v_area_name;

    insert into core_identity.permission_pages (area_id, name)
    values (v_area_id, v_page_record.page_key)
    on conflict (area_id, name) do nothing;
  end loop;
end;
$seed$;

-- ─── Seed tabs fra eksisterende (page_key, tab_key)-pairs ───────────────
do $seed$
declare
  v_tab_record record;
  v_page_id uuid;
begin
  for v_tab_record in
    select distinct page_key, tab_key
    from core_identity.role_page_permissions
    where tab_key is not null
  loop
    select id into v_page_id from core_identity.permission_pages
    where name = v_tab_record.page_key;

    insert into core_identity.permission_tabs (page_id, name)
    values (v_page_id, v_tab_record.tab_key)
    on conflict (page_id, name) do nothing;
  end loop;
end;
$seed$;

-- ─── Migrér eksisterende role_page_permissions til role_permission_grants ─
do $seed$
declare
  v_row record;
  v_area_id uuid;
  v_page_id uuid;
  v_tab_id uuid;
  v_visibility text;
begin
  for v_row in select * from core_identity.role_page_permissions
  loop
    -- Map scope → visibility (team → subtree).
    v_visibility := case v_row.scope
      when 'all' then 'all'
      when 'self' then 'self'
      when 'subtree' then 'subtree'
      when 'team' then 'subtree'  -- V5 mathias-afgoerelser pkt 14: team udgår
      else 'self'
    end;

    -- Find element-niveau (tab hvis ikke-NULL, ellers page).
    if v_row.tab_key is not null then
      select t.id into v_tab_id
      from core_identity.permission_tabs t
      join core_identity.permission_pages p on p.id = t.page_id
      where p.name = v_row.page_key and t.name = v_row.tab_key;

      insert into core_identity.role_permission_grants
        (role_id, area_id, page_id, tab_id, can_access, can_write, visibility)
      values
        (v_row.role_id, null, null, v_tab_id, v_row.can_view, v_row.can_edit, v_visibility)
      on conflict (role_id, coalesce(area_id::text, ''), coalesce(page_id::text, ''), coalesce(tab_id::text, ''))
      do nothing;
    else
      select id into v_page_id from core_identity.permission_pages
      where name = v_row.page_key;

      insert into core_identity.role_permission_grants
        (role_id, area_id, page_id, tab_id, can_access, can_write, visibility)
      values
        (v_row.role_id, null, v_page_id, null, v_row.can_view, v_row.can_edit, v_visibility)
      on conflict (role_id, coalesce(area_id::text, ''), coalesce(page_id::text, ''), coalesce(tab_id::text, ''))
      do nothing;
    end if;
  end loop;
end;
$seed$;

-- ─── has_permission() opdateres med ny model + fallback ─────────────────
-- Plan V6 Valg 11: helpers læser fra role_permission_grants med fallback til
-- role_page_permissions (legacy read-only). Fallback fjernes når sidste
-- konsument er migreret (G-nummer i Step 13).

create or replace function core_identity.has_permission(
  p_page_key text,
  p_tab_key text default null,
  p_can_edit boolean default false
) returns boolean
language plpgsql stable security invoker set search_path = ''
as $$
declare
  v_employee_id uuid;
  v_role_id uuid;
  v_grant record;
begin
  v_employee_id := core_identity.current_employee_id();
  if v_employee_id is null then return false; end if;

  select role_id into v_role_id from core_identity.employees where id = v_employee_id;
  if v_role_id is null then return false; end if;

  -- Ny model: resolve via grants (tab → page → area).
  if p_tab_key is not null then
    select g.can_access, g.can_write into v_grant.can_access, v_grant.can_write
    from core_identity.role_permission_grants g
    join core_identity.permission_tabs t on t.id = g.tab_id
    join core_identity.permission_pages p on p.id = t.page_id
    where g.role_id = v_role_id
      and p.name = p_page_key
      and t.name = p_tab_key
    limit 1;
    if found then
      return v_grant.can_access and (not p_can_edit or v_grant.can_write);
    end if;
  end if;

  -- Fald tilbage til page-niveau.
  select g.can_access, g.can_write into v_grant.can_access, v_grant.can_write
  from core_identity.role_permission_grants g
  join core_identity.permission_pages p on p.id = g.page_id
  where g.role_id = v_role_id and p.name = p_page_key
  limit 1;
  if found then
    return v_grant.can_access and (not p_can_edit or v_grant.can_write);
  end if;

  -- Fald tilbage til area-niveau (via page-name → area).
  select g.can_access, g.can_write into v_grant.can_access, v_grant.can_write
  from core_identity.role_permission_grants g
  join core_identity.permission_areas a on a.id = g.area_id
  join core_identity.permission_pages p on p.area_id = a.id
  where g.role_id = v_role_id and p.name = p_page_key
  limit 1;
  if found then
    return v_grant.can_access and (not p_can_edit or v_grant.can_write);
  end if;

  -- Fallback til legacy role_page_permissions (G-nummer for senere pakke-drop).
  select can_view, can_edit into v_grant.can_access, v_grant.can_write
  from core_identity.role_page_permissions
  where role_id = v_role_id
    and page_key = p_page_key
    and (p_tab_key is null or tab_key = p_tab_key or tab_key is null)
  order by case when tab_key = p_tab_key then 1 else 2 end
  limit 1;

  if found then
    return v_grant.can_access and (not p_can_edit or v_grant.can_write);
  end if;

  return false;
end;
$$;

comment on function core_identity.has_permission(text, text, boolean) is
  'T9 Step 11 V6 Valg 11: opdateret med role_permission_grants som primær + fallback til legacy role_page_permissions. Fallback fjernes når alle konsumenter er migreret (G-nummer for senere pakke).';

-- ─── Gør legacy role_page_permissions read-only ─────────────────────────
-- Drop INSERT/UPDATE-policies; SELECT-policy bevares.
-- (Tabellen har FORCE RLS; uden INSERT/UPDATE-policy er den read-only.)
-- Bemærk: Direkte adgang via direct table-INSERT er allerede revoke'd fra
-- authenticated; kun trin-5's role_page_permission_upsert-RPC kan skrive.
-- For V6: revoke EXECUTE fra role_page_permission_upsert (deprecated).

revoke execute on function core_identity.role_page_permission_upsert(uuid, text, text, boolean, boolean, text, text)
from public, anon, authenticated;
