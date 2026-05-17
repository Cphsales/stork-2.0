-- Trin 9 / §4 trin 9 Step 2: org_nodes (identity-only) + org_node_versions (V4-arkitektur).
--
-- Plan V6 Beslutning 13 + Beslutning 1+2 (V5-sweep):
-- - org_nodes = identity-only (id, created_at, updated_at) — stable identitet
-- - org_node_versions = primær mutable lagring med effective_from/effective_to
-- - parent_id på versions refererer org_nodes.id (stable identity på tværs af versions)
-- - Cycle-detect + team-har-børn på versions effective at NEW.effective_from
-- - Audit-trigger på begge tabeller (versions er primær lagring, ikke derived)
--
-- Apply-handlers (interne; revoke fra authenticated):
-- - _apply_org_node_upsert: NEW node → INSERT identity + INSERT version
--                          EXISTING node UPDATE → UPDATE prior version's effective_to
--                                                  + INSERT new version
-- - _apply_org_node_deactivate: UPDATE prior version's effective_to
--                                + INSERT new version med is_active=false
--
-- CREATE OR REPLACE pending_change_apply: tilføj cases for org_node_upsert/deactivate.
-- G-nummer dokumenteret for dispatcher-extension-pattern.

-- btree_gist for EXCLUDE-constraints.
create extension if not exists btree_gist;

-- ─── org_nodes (identity-only — V4 Beslutning 13) ────────────────────────
-- no-dedup-key: identity-tabel; id er stable PK på tværs af versions.
create table core_identity.org_nodes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table core_identity.org_nodes is
  'T9 V4 Beslutning 13: identity-only tabel; alle mutable forretnings-felter (name, parent_id, node_type, is_active) lever på core_identity.org_node_versions. id er stable identitet på tværs af versions.';

alter table core_identity.org_nodes enable row level security;
alter table core_identity.org_nodes force row level security;

revoke all on table core_identity.org_nodes from public, anon, service_role;
grant select on table core_identity.org_nodes to authenticated;

create policy org_nodes_select on core_identity.org_nodes
  for select to authenticated using (true);

-- ─── org_node_versions (mutable state med effective-date — V4+V6) ────────
-- no-dedup-key: append-only version-tabel; version_id er PK.
create table core_identity.org_node_versions (
  version_id uuid primary key default gen_random_uuid(),
  node_id uuid not null references core_identity.org_nodes(id) on delete restrict,
  name text not null,
  parent_id uuid references core_identity.org_nodes(id) on delete restrict,
  node_type text not null check (node_type in ('department', 'team')),
  is_active boolean not null,
  effective_from date not null,
  effective_to date,
  applied_at timestamptz not null default now(),
  created_by_pending_change_id uuid references core_identity.pending_changes(id) on delete set null,
  created_at timestamptz not null default now(),
  -- Effective_from <= effective_to (eller NULL).
  check (effective_to is null or effective_from < effective_to),
  -- Parent kan ikke være self.
  check (parent_id is null or parent_id <> node_id)
);

comment on table core_identity.org_node_versions is
  'T9 V4+V6 Beslutning 13: primær lagring af org-node mutable state med effective_from/effective_to. Pr. node_id: én open-ended version (effective_to IS NULL); historiske versions har effective_to sat. Apply-handlers skriver version-boundary fra pending.effective_from, ikke now() (V4 Codex V3 KRITISK-fix).';

comment on column core_identity.org_node_versions.parent_id is
  'Refererer org_nodes.id (stable identity). NULL for root-knude (Copenhagen Sales).';

comment on column core_identity.org_node_versions.created_by_pending_change_id is
  'FK til pending_changes-row der skabte denne version (V4: pending-pligtig operation). NULL hvis seed eller direct admin bootstrap.';

-- Partial UNIQUE: kun én open-ended version pr. node_id.
create unique index org_node_versions_open_per_node
  on core_identity.org_node_versions (node_id)
  where effective_to is null;

-- EXCLUDE constraint: ingen overlap af versions pr. node_id.
alter table core_identity.org_node_versions
  add constraint org_node_versions_no_overlap
  exclude using gist (
    node_id with =,
    daterange(effective_from, coalesce(effective_to, 'infinity'::date), '[)') with &&
  );

-- Index for parent_id (lookup for closure-build + cycle-detect).
create index org_node_versions_parent_id
  on core_identity.org_node_versions (parent_id)
  where effective_to is null;

-- Index for effective-date-queries (read-RPCs).
create index org_node_versions_effective_date
  on core_identity.org_node_versions (effective_from, effective_to);

alter table core_identity.org_node_versions enable row level security;
alter table core_identity.org_node_versions force row level security;

revoke all on table core_identity.org_node_versions from public, anon, service_role;
grant select on table core_identity.org_node_versions to authenticated;

create policy org_node_versions_select on core_identity.org_node_versions
  for select to authenticated using (true);

-- ─── Cycle-detection-trigger på org_node_versions ────────────────────────
-- BEFORE INSERT/UPDATE: traverserer parent-kæden over versions effective at NEW.effective_from.
create or replace function core_identity._org_node_cycle_check()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_current uuid := new.parent_id;
  v_visited uuid[] := array[new.node_id];
  v_depth integer := 0;
begin
  if v_current is null then
    return new;
  end if;

  -- Traverse parent-chain; hvis vi når new.node_id, er der cycle.
  while v_current is not null and v_depth < 100 loop
    if v_current = any(v_visited) then
      raise exception 'org_node_cycle_detected: % er allerede i ancestor-kæden', v_current
        using errcode = 'P0001';
    end if;
    v_visited := v_visited || v_current;
    v_depth := v_depth + 1;

    -- Find parent_id i version effective at NEW.effective_from.
    select parent_id into v_current
    from core_identity.org_node_versions
    where node_id = v_current
      and effective_from <= new.effective_from
      and (effective_to is null or effective_to > new.effective_from)
    limit 1;
  end loop;

  if v_depth >= 100 then
    raise exception 'org_node_cycle_check: depth >= 100, suspekt rekursion'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

comment on function core_identity._org_node_cycle_check() is
  'T9 Step 2: BEFORE INSERT/UPDATE trigger på org_node_versions. Verificér ingen cycle i parent-kæde over versions effective at NEW.effective_from.';

create trigger org_node_versions_cycle_check
  before insert or update on core_identity.org_node_versions
  for each row execute function core_identity._org_node_cycle_check();

-- ─── Team-har-børn-blokering ──────────────────────────────────────────────
-- Team-knuder kan ikke have børn (krav-dok 3.1 + plan Beslutning 1).
create or replace function core_identity._org_node_team_no_children_check()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.parent_id is null then
    return new;
  end if;

  -- Verificér at parent ikke er team i version effective at NEW.effective_from.
  if exists (
    select 1 from core_identity.org_node_versions
    where node_id = new.parent_id
      and node_type = 'team'
      and effective_from <= new.effective_from
      and (effective_to is null or effective_to > new.effective_from)
  ) then
    raise exception 'org_node_team_cannot_have_children: parent % er team-knude på effective_from %', new.parent_id, new.effective_from
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

comment on function core_identity._org_node_team_no_children_check() is
  'T9 Step 2: BEFORE INSERT/UPDATE trigger på org_node_versions. Verificér at parent ikke er team-knude (krav-dok 3.1).';

create trigger org_node_versions_team_no_children
  before insert or update on core_identity.org_node_versions
  for each row execute function core_identity._org_node_team_no_children_check();

-- ─── Audit-triggers ──────────────────────────────────────────────────────
create trigger org_nodes_audit
  after insert or update or delete on core_identity.org_nodes
  for each row execute function core_compliance.stork_audit();

create trigger org_node_versions_audit
  after insert or update or delete on core_identity.org_node_versions
  for each row execute function core_compliance.stork_audit();

-- ─── Interne apply-handlers (security definer; revoke fra authenticated) ─

create or replace function core_identity._apply_org_node_upsert(
  p_payload jsonb,
  p_pending_change_id uuid
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_node_id uuid;
  v_name text;
  v_parent_id uuid;
  v_node_type text;
  v_is_active boolean;
  v_effective_from date;
  v_is_new boolean;
begin
  -- Parse payload.
  v_node_id := nullif(p_payload->>'id', '')::uuid;
  v_name := p_payload->>'name';
  v_parent_id := nullif(p_payload->>'parent_id', '')::uuid;
  v_node_type := p_payload->>'node_type';
  v_is_active := coalesce((p_payload->>'is_active')::boolean, true);
  v_effective_from := (p_payload->>'effective_from')::date;

  if v_name is null or v_node_type is null or v_effective_from is null then
    raise exception 'invalid_payload: name + node_type + effective_from required'
      using errcode = '22023';
  end if;

  v_is_new := v_node_id is null or not exists (
    select 1 from core_identity.org_nodes where id = v_node_id
  );

  if v_is_new then
    -- INSERT identity.
    if v_node_id is null then
      v_node_id := gen_random_uuid();
    end if;
    insert into core_identity.org_nodes (id) values (v_node_id);

    -- INSERT initial version.
    insert into core_identity.org_node_versions
      (node_id, name, parent_id, node_type, is_active, effective_from, effective_to, created_by_pending_change_id)
    values
      (v_node_id, v_name, v_parent_id, v_node_type, v_is_active, v_effective_from, null, p_pending_change_id);
  else
    -- UPDATE: luk prior version + insert ny.
    update core_identity.org_node_versions
    set effective_to = v_effective_from
    where node_id = v_node_id and effective_to is null;

    insert into core_identity.org_node_versions
      (node_id, name, parent_id, node_type, is_active, effective_from, effective_to, created_by_pending_change_id)
    values
      (v_node_id, v_name, v_parent_id, v_node_type, v_is_active, v_effective_from, null, p_pending_change_id);

    update core_identity.org_nodes set updated_at = now() where id = v_node_id;
  end if;
end;
$$;

comment on function core_identity._apply_org_node_upsert(jsonb, uuid) is
  'T9 Step 2 V4 Beslutning 13: intern apply-handler for org_node_upsert change_type. Payload {id?, name, parent_id?, node_type, is_active, effective_from}. SECURITY DEFINER; revoke from authenticated.';

revoke execute on function core_identity._apply_org_node_upsert(jsonb, uuid) from public, anon, authenticated;

create or replace function core_identity._apply_org_node_deactivate(
  p_payload jsonb,
  p_pending_change_id uuid
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_node_id uuid;
  v_effective_from date;
  v_current_version record;
begin
  v_node_id := (p_payload->>'node_id')::uuid;
  v_effective_from := (p_payload->>'effective_from')::date;

  if v_node_id is null or v_effective_from is null then
    raise exception 'invalid_payload: node_id + effective_from required'
      using errcode = '22023';
  end if;

  -- Find aktuel open-ended version.
  select * into v_current_version
  from core_identity.org_node_versions
  where node_id = v_node_id and effective_to is null
  limit 1;

  if not found then
    raise exception 'org_node_no_open_version: node_id %', v_node_id
      using errcode = 'P0002';
  end if;

  if not v_current_version.is_active then
    -- Allerede deaktiveret; idempotent.
    return;
  end if;

  -- Luk prior version.
  update core_identity.org_node_versions
  set effective_to = v_effective_from
  where version_id = v_current_version.version_id;

  -- INSERT ny version med is_active=false (alle andre felter kopieret).
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from, effective_to, created_by_pending_change_id)
  values
    (v_node_id, v_current_version.name, v_current_version.parent_id, v_current_version.node_type,
     false, v_effective_from, null, p_pending_change_id);

  update core_identity.org_nodes set updated_at = now() where id = v_node_id;
end;
$$;

comment on function core_identity._apply_org_node_deactivate(jsonb, uuid) is
  'T9 Step 2 V4 Beslutning 13: intern apply-handler for org_node_deactivate change_type. Lukker prior version + INSERT ny version med is_active=false. SECURITY DEFINER; revoke from authenticated.';

revoke execute on function core_identity._apply_org_node_deactivate(jsonb, uuid) from public, anon, authenticated;

-- ─── CREATE OR REPLACE pending_change_apply: tilføj cases ─────────────────
-- G-nummer-kandidat: dispatcher-extension-pattern (CREATE OR REPLACE per step)
-- skal formaliseres i plan-skabelon. Per Mathias afgørelse 2026-05-17 under build:
-- håndteres som G-nummer, ikke V7-revision.
create or replace function core_identity.pending_change_apply(
  p_change_id uuid
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_change record;
begin
  select * into v_change
  from core_identity.pending_changes
  where id = p_change_id
  for update;

  if not found then
    raise exception 'pending_change_not_found %', p_change_id
      using errcode = 'P0002';
  end if;

  if v_change.status <> 'approved' then
    raise exception 'pending_change_not_approved: status=%', v_change.status
      using errcode = '22023';
  end if;

  if v_change.undo_deadline > now() then
    raise exception 'not_yet_due'
      using errcode = '22023',
            hint = format('undo_deadline=%s, now=%s', v_change.undo_deadline, now());
  end if;

  if v_change.effective_from > current_date then
    raise exception 'not_yet_due'
      using errcode = '22023',
            hint = format('effective_from=%s, current_date=%s', v_change.effective_from, current_date);
  end if;

  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'pending_change_apply', true);

  case v_change.change_type
    when 'org_node_upsert' then
      perform core_identity._apply_org_node_upsert(v_change.payload, p_change_id);
    when 'org_node_deactivate' then
      perform core_identity._apply_org_node_deactivate(v_change.payload, p_change_id);
    else
      raise exception 'unknown_change_type: %', v_change.change_type
        using errcode = '42883';
  end case;

  update core_identity.pending_changes
  set status = 'applied',
      applied_at = now(),
      updated_at = now()
  where id = p_change_id;
end;
$$;

revoke execute on function core_identity.pending_change_apply(uuid) from public, anon;

-- ─── Seed undo_settings for nye change_types ─────────────────────────────
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason', 'T9 Step 2: seed undo_settings for org_node_*', false);

insert into core_identity.undo_settings (change_type, undo_period_seconds)
values
  ('org_node_upsert', 24 * 3600),
  ('org_node_deactivate', 24 * 3600)
on conflict (change_type) do nothing;
