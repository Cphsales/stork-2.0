-- Trin 9 / §4 trin 9 Step 6: Permission-elementer (areas/pages/tabs) + direkte CRUD.
--
-- Plan V6 Beslutning 4 + Valg 5: tre separate tabeller med FK-kæde.
-- Direkte CRUD (ikke pending — krav-dok 4.5 specificerer ikke gældende dato).

-- ─── permission_areas (top-niveau) ───────────────────────────────────────
-- no-dedup-key: konfig-tabel; name er natural key (UNIQUE).
create table core_identity.permission_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table core_identity.permission_areas is
  'T9 Step 6 Beslutning 4: top-niveau permission-element. Krav-dok 4.5 + 5.2.';

alter table core_identity.permission_areas enable row level security;
alter table core_identity.permission_areas force row level security;
revoke all on table core_identity.permission_areas from public, anon, service_role;
grant select on table core_identity.permission_areas to authenticated;
create policy permission_areas_select on core_identity.permission_areas
  for select to authenticated using (true);
create trigger permission_areas_audit
  after insert or update or delete on core_identity.permission_areas
  for each row execute function core_compliance.stork_audit();

-- ─── permission_pages (FK areas) ─────────────────────────────────────────
-- no-dedup-key: konfig-tabel; (area_id, name) er natural key (UNIQUE).
create table core_identity.permission_pages (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references core_identity.permission_areas(id) on delete restrict,
  name text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (area_id, name)
);

comment on table core_identity.permission_pages is
  'T9 Step 6: page-niveau under area. FK-kæde til area; (area_id, name) unique.';

alter table core_identity.permission_pages enable row level security;
alter table core_identity.permission_pages force row level security;
revoke all on table core_identity.permission_pages from public, anon, service_role;
grant select on table core_identity.permission_pages to authenticated;
create policy permission_pages_select on core_identity.permission_pages
  for select to authenticated using (true);
create trigger permission_pages_audit
  after insert or update or delete on core_identity.permission_pages
  for each row execute function core_compliance.stork_audit();

-- ─── permission_tabs (FK pages) ──────────────────────────────────────────
-- no-dedup-key: konfig-tabel; (page_id, name) er natural key (UNIQUE).
create table core_identity.permission_tabs (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references core_identity.permission_pages(id) on delete restrict,
  name text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_id, name)
);

comment on table core_identity.permission_tabs is
  'T9 Step 6: tab-niveau under page. FK-kæde til page; (page_id, name) unique.';

alter table core_identity.permission_tabs enable row level security;
alter table core_identity.permission_tabs force row level security;
revoke all on table core_identity.permission_tabs from public, anon, service_role;
grant select on table core_identity.permission_tabs to authenticated;
create policy permission_tabs_select on core_identity.permission_tabs
  for select to authenticated using (true);
create trigger permission_tabs_audit
  after insert or update or delete on core_identity.permission_tabs
  for each row execute function core_compliance.stork_audit();

-- ─── CRUD-RPC'er for permission_areas ───────────────────────────────────
create or replace function core_identity.permission_area_upsert(
  p_id uuid,
  p_name text,
  p_is_active boolean default true,
  p_sort_order integer default 0
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied: permissions/manage/can_edit'
      using errcode = '42501';
  end if;

  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'permission_area_upsert', true);

  if p_id is null then
    insert into core_identity.permission_areas (name, is_active, sort_order)
    values (p_name, p_is_active, p_sort_order)
    returning id into v_id;
  else
    insert into core_identity.permission_areas (id, name, is_active, sort_order)
    values (p_id, p_name, p_is_active, p_sort_order)
    on conflict (id) do update
    set name = excluded.name,
        is_active = excluded.is_active,
        sort_order = excluded.sort_order,
        updated_at = now()
    returning id into v_id;
  end if;

  return v_id;
end;
$$;
revoke execute on function core_identity.permission_area_upsert(uuid, text, boolean, integer) from public, anon;

create or replace function core_identity.permission_area_deactivate(p_area_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'permission_area_deactivate', true);
  update core_identity.permission_areas set is_active = false, updated_at = now() where id = p_area_id;
end; $$;
revoke execute on function core_identity.permission_area_deactivate(uuid) from public, anon;

-- ─── CRUD-RPC'er for permission_pages ──────────────────────────────────
create or replace function core_identity.permission_page_upsert(
  p_id uuid, p_area_id uuid, p_name text,
  p_is_active boolean default true, p_sort_order integer default 0
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_id uuid;
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'permission_page_upsert', true);

  if p_id is null then
    insert into core_identity.permission_pages (area_id, name, is_active, sort_order)
    values (p_area_id, p_name, p_is_active, p_sort_order) returning id into v_id;
  else
    insert into core_identity.permission_pages (id, area_id, name, is_active, sort_order)
    values (p_id, p_area_id, p_name, p_is_active, p_sort_order)
    on conflict (id) do update
    set area_id = excluded.area_id, name = excluded.name,
        is_active = excluded.is_active, sort_order = excluded.sort_order,
        updated_at = now()
    returning id into v_id;
  end if;
  return v_id;
end; $$;
revoke execute on function core_identity.permission_page_upsert(uuid, uuid, text, boolean, integer) from public, anon;

create or replace function core_identity.permission_page_deactivate(p_page_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'permission_page_deactivate', true);
  update core_identity.permission_pages set is_active = false, updated_at = now() where id = p_page_id;
end; $$;
revoke execute on function core_identity.permission_page_deactivate(uuid) from public, anon;

-- ─── CRUD-RPC'er for permission_tabs ───────────────────────────────────
create or replace function core_identity.permission_tab_upsert(
  p_id uuid, p_page_id uuid, p_name text,
  p_is_active boolean default true, p_sort_order integer default 0
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_id uuid;
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'permission_tab_upsert', true);

  if p_id is null then
    insert into core_identity.permission_tabs (page_id, name, is_active, sort_order)
    values (p_page_id, p_name, p_is_active, p_sort_order) returning id into v_id;
  else
    insert into core_identity.permission_tabs (id, page_id, name, is_active, sort_order)
    values (p_id, p_page_id, p_name, p_is_active, p_sort_order)
    on conflict (id) do update
    set page_id = excluded.page_id, name = excluded.name,
        is_active = excluded.is_active, sort_order = excluded.sort_order,
        updated_at = now()
    returning id into v_id;
  end if;
  return v_id;
end; $$;
revoke execute on function core_identity.permission_tab_upsert(uuid, uuid, text, boolean, integer) from public, anon;

create or replace function core_identity.permission_tab_deactivate(p_tab_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'permission_tab_deactivate', true);
  update core_identity.permission_tabs set is_active = false, updated_at = now() where id = p_tab_id;
end; $$;
revoke execute on function core_identity.permission_tab_deactivate(uuid) from public, anon;
