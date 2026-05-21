-- T9-supplement-2 M3: Handlings-granularitet — permission_actions-tabel + grants-udvidelse
--
-- Opretter ny dimension `permission_actions` under tabs. Roller kan tildeles
-- action-niveau adgang via role_permission_grants.action_id. Mønstret er
-- additivt: bruger skal have BÅDE tab-can_write OG specifik action-grant
-- (undtagen for actions med bypass_tab_write=true).
--
-- Reference: docs/coordination/t9-supplement-2-plan.md M3 + krav-dok §2.6, §3.4
-- + mathias-afgoerelser 2026-05-21 (handlings-granularitet).
-- no-dedup-key: konfig-tabel; natural key er (tab_id, name) sikret via unique index

-- ─── Ny tabel: permission_actions ────────────────────────────────────────
create table core_identity.permission_actions (
  id uuid primary key default gen_random_uuid(),
  tab_id uuid not null references core_identity.permission_tabs(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  -- Kode-låste flag (sættes kun i migration-seed, ikke UI-redigerbare)
  requires_second_approver boolean not null default false,
  has_undo boolean not null default false,
  -- UI-redigerbart felt (kun relevant når requires_second_approver=true)
  second_approver_type text not null default 'above'
    check (second_approver_type in ('above', 'superadmin')),
  -- Kode-låst flag: tillader action udført med kun se-rettighed (se krav-dok §2.6)
  bypass_tab_write boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Invariant fra krav-dok §2.5: fortrydelse uden 2. godkender er ulovligt
  check (not has_undo or requires_second_approver)
);

create unique index permission_actions_unique_name_per_tab
  on core_identity.permission_actions (tab_id, name);

comment on table core_identity.permission_actions is
  'T9-supplement-2: handlings-granularitet under tabs. Konfigurerede actions kræver action-grant + tab-can_write (eller kun can_access hvis bypass_tab_write=true). requires_second_approver/has_undo/bypass_tab_write er kode-låste; second_approver_type er UI-redigerbart.';

alter table core_identity.permission_actions enable row level security;
alter table core_identity.permission_actions force row level security;
revoke all on table core_identity.permission_actions from public, anon, service_role;
grant select on table core_identity.permission_actions to authenticated;
grant insert, update on table core_identity.permission_actions to authenticated;

create policy permission_actions_select on core_identity.permission_actions
  for select to authenticated using (true);
create policy permission_actions_insert on core_identity.permission_actions
  for insert to authenticated
  with check (current_setting('stork.t9_write_authorized', true) = 'true');
create policy permission_actions_update on core_identity.permission_actions
  for update to authenticated
  using (current_setting('stork.t9_write_authorized', true) = 'true');

create trigger permission_actions_audit
  after insert or update or delete on core_identity.permission_actions
  for each row execute function core_compliance.stork_audit();

-- ─── Udvid role_permission_grants med action_id ─────────────────────────
alter table core_identity.role_permission_grants
  add column action_id uuid references core_identity.permission_actions(id) on delete cascade;

-- Find og drop den eksisterende nameless CHECK-constraint (præcis 1 af area/page/tab)
do $$
declare v_check_name text;
begin
  select conname into v_check_name
    from pg_constraint
    where conrelid = 'core_identity.role_permission_grants'::regclass
      and contype = 'c';
  if v_check_name is not null then
    execute format('alter table core_identity.role_permission_grants drop constraint %I', v_check_name);
  end if;
end $$;

-- Ny CHECK: præcis 1 af (area/page/tab/action)
alter table core_identity.role_permission_grants
  add constraint role_permission_grants_one_element check (
    (case when area_id   is not null then 1 else 0 end) +
    (case when page_id   is not null then 1 else 0 end) +
    (case when tab_id    is not null then 1 else 0 end) +
    (case when action_id is not null then 1 else 0 end) = 1
  );

-- Opdater UNIQUE-index til at inkludere action_id
drop index core_identity.role_permission_grants_unique;
create unique index role_permission_grants_unique
  on core_identity.role_permission_grants (
    role_id,
    coalesce(area_id::text, ''),
    coalesce(page_id::text, ''),
    coalesce(tab_id::text, ''),
    coalesce(action_id::text, '')
  );

-- ─── Udvid permission_resolve med action-niveau ─────────────────────────
-- Resolve-rækkefølge: action → tab → page → area → default-deny
create or replace function core_identity.permission_resolve(
  p_role_id uuid,
  p_element_type text,
  p_element_id uuid
) returns table (can_access boolean, can_write boolean, visibility text)
language plpgsql stable security invoker set search_path = '' as $$
declare
  v_tab_id uuid;
  v_page_id uuid;
  v_area_id uuid;
  v_grant record;
begin
  -- Først: action-niveau grant?
  if p_element_type = 'action' then
    select * into v_grant from core_identity.role_permission_grants
    where role_id = p_role_id and action_id = p_element_id limit 1;
    if found then
      can_access := v_grant.can_access;
      can_write := v_grant.can_write;
      visibility := v_grant.visibility;
      return next;
      return;
    end if;
    -- Fald tilbage til tab via action's tab_id
    select tab_id into v_tab_id from core_identity.permission_actions where id = p_element_id;
  elsif p_element_type = 'tab' then
    v_tab_id := p_element_id;
  end if;

  if v_tab_id is not null then
    select * into v_grant from core_identity.role_permission_grants
    where role_id = p_role_id and tab_id = v_tab_id limit 1;
    if found then
      can_access := v_grant.can_access;
      can_write := v_grant.can_write;
      visibility := v_grant.visibility;
      return next;
      return;
    end if;
    -- Fald tilbage til page-niveau.
    select page_id into v_page_id from core_identity.permission_tabs where id = v_tab_id;
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

  if p_element_type = 'area' then v_area_id := p_element_id; end if;

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

-- ─── Udvid role_permissions_read med action-grenen ──────────────────────
-- Eksisterende RPC (20260520000000:749-786) returnerer UNION ALL over
-- area/page/tab. V4 (Codex V3-2 Code recon fix): tilføj action-gren.
create or replace function core_identity.role_permissions_read(p_role_id uuid)
returns table (
  grant_id uuid,
  element_type text,
  element_id uuid,
  element_name text,
  can_access boolean,
  can_write boolean,
  visibility text
)
language plpgsql stable security invoker set search_path = '' as $$
begin
  perform core_identity._require_read_permission('permissions', 'manage');
  return query
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
  where g.role_id = p_role_id and g.tab_id is not null
  union all
  -- V4 ny action-gren
  select g.id, 'action'::text, g.action_id, act.name, g.can_access, g.can_write, g.visibility
  from core_identity.role_permission_grants g
  join core_identity.permission_actions act on act.id = g.action_id
  where g.role_id = p_role_id and g.action_id is not null;
end; $$;
-- Existing grants/revoke bevares via CREATE OR REPLACE

-- ─── Klassifikations-inserts for nye kolonner (V9 Codex V8-2 fix) ───────
select set_config('stork.allow_data_field_definitions_write', 'true', false);
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason', 'T9-supplement-2 M3: classify permission_actions + role_permission_grants.action_id', false);

insert into core_compliance.data_field_definitions
  (table_schema, table_name, column_name, category, pii_level, retention_type, retention_value, match_role, purpose) values
  -- permission_actions (konfiguration) — 11 kolonner
  ('core_identity', 'permission_actions', 'id', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'permission-action PK'),
  ('core_identity', 'permission_actions', 'tab_id', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'FK til permission_tabs'),
  ('core_identity', 'permission_actions', 'name', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'navn på action'),
  ('core_identity', 'permission_actions', 'is_active', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'om action er aktiv'),
  ('core_identity', 'permission_actions', 'sort_order', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'visnings-rækkefølge i UI'),
  ('core_identity', 'permission_actions', 'requires_second_approver', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'kode-låst: kræver action 2. godkender'),
  ('core_identity', 'permission_actions', 'has_undo', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'kode-låst: har action fortrydelses-periode'),
  ('core_identity', 'permission_actions', 'second_approver_type', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'UI-konfig: above eller superadmin'),
  ('core_identity', 'permission_actions', 'bypass_tab_write', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'kode-låst: tillader kun se-rettighed'),
  ('core_identity', 'permission_actions', 'created_at', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'created timestamp'),
  ('core_identity', 'permission_actions', 'updated_at', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'updated timestamp'),
  -- role_permission_grants.action_id (konfiguration) — 1 ny kolonne
  ('core_identity', 'role_permission_grants', 'action_id', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'FK til permission_actions; action-niveau-grant')
on conflict (table_schema, table_name, column_name) do nothing;
