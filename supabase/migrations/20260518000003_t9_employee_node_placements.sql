-- Trin 9 / §4 trin 9 Step 4: employee_node_placements + apply-handlers.
--
-- Plan V6 Beslutning 3+14: versionerede placeringer med
-- effective_from/effective_to. Aktiv placement =
-- effective_from <= current_date AND (effective_to IS NULL OR effective_to > current_date).
-- Partial UNIQUE + EXCLUDE for "én aktiv ad gangen" / "ingen overlap".
--
-- Apply-handlers:
-- - _apply_employee_place: åbn ny placement; luk prior open hvis flyt
-- - _apply_employee_remove: luk åbent uden ny
-- - _apply_team_close: ny org_node_version med is_active=false + luk alle åbne placements
--   (V5 KOSMETISK: handler er i Step 4 fordi den rører primært employee_placements)

-- no-dedup-key: versioneret placement-tabel; partial UNIQUE (employee_id) WHERE effective_to IS NULL er natural dedup.
create table core_identity.employee_node_placements (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references core_identity.employees(id) on delete restrict,
  node_id uuid not null references core_identity.org_nodes(id) on delete restrict,
  effective_from date not null,
  effective_to date,
  applied_at timestamptz not null default now(),
  created_by_pending_change_id uuid references core_identity.pending_changes(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_to is null or effective_from < effective_to)
);

comment on table core_identity.employee_node_placements is
  'T9 Step 4 V6 Beslutning 3+14: versioneret medarbejder-knude-placering. Aktiv placement = effective_from <= current_date AND (effective_to IS NULL OR effective_to > current_date). Knude-løs medarbejder = ingen open-ended row.';

-- Partial UNIQUE: kun én open-ended placement pr. employee.
create unique index employee_node_placements_open_per_employee
  on core_identity.employee_node_placements (employee_id)
  where effective_to is null;

-- EXCLUDE constraint: ingen overlap af placements pr. employee.
alter table core_identity.employee_node_placements
  add constraint employee_node_placements_no_overlap
  exclude using gist (
    employee_id with =,
    daterange(effective_from, coalesce(effective_to, 'infinity'::date), '[)') with &&
  );

create index employee_node_placements_node_id on core_identity.employee_node_placements (node_id);
create index employee_node_placements_effective on core_identity.employee_node_placements (effective_from, effective_to);

alter table core_identity.employee_node_placements enable row level security;
alter table core_identity.employee_node_placements force row level security;

revoke all on table core_identity.employee_node_placements from public, anon, service_role;
grant select on table core_identity.employee_node_placements to authenticated;

-- SELECT-policy: using (true) per V3-V5-arkitektur (struktur-meta).
-- Forretningsdata-scope håndteres på forretnings-tabeller (trin 14+).
create policy employee_node_placements_select on core_identity.employee_node_placements
  for select to authenticated using (true);

create trigger employee_node_placements_audit
  after insert or update or delete on core_identity.employee_node_placements
  for each row execute function core_compliance.stork_audit();

-- ─── _apply_employee_place ──────────────────────────────────────────────
create or replace function core_identity._apply_employee_place(
  p_payload jsonb,
  p_pending_change_id uuid
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_employee_id uuid;
  v_node_id uuid;
  v_effective_from date;
begin
  v_employee_id := (p_payload->>'employee_id')::uuid;
  v_node_id := (p_payload->>'node_id')::uuid;
  v_effective_from := (p_payload->>'effective_from')::date;

  if v_employee_id is null or v_node_id is null or v_effective_from is null then
    raise exception 'invalid_payload: employee_id + node_id + effective_from required'
      using errcode = '22023';
  end if;

  -- Verificér at node_id refererer til IS_ACTIVE knude (current version).
  if not exists (
    select 1 from core_identity.org_node_versions
    where node_id = v_node_id
      and is_active = true
      and effective_from <= v_effective_from
      and (effective_to is null or effective_to > v_effective_from)
  ) then
    raise exception 'inactive_or_missing_node: %', v_node_id
      using errcode = 'P0002';
  end if;

  -- Luk eventuel åben placement (flyt).
  update core_identity.employee_node_placements
  set effective_to = v_effective_from, updated_at = now()
  where employee_id = v_employee_id and effective_to is null;

  -- Åbn ny placement.
  insert into core_identity.employee_node_placements
    (employee_id, node_id, effective_from, effective_to, created_by_pending_change_id)
  values
    (v_employee_id, v_node_id, v_effective_from, null, p_pending_change_id);
end;
$$;

revoke execute on function core_identity._apply_employee_place(jsonb, uuid) from public, anon, authenticated;

-- ─── _apply_employee_remove ─────────────────────────────────────────────
create or replace function core_identity._apply_employee_remove(
  p_payload jsonb,
  p_pending_change_id uuid
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_employee_id uuid;
  v_effective_from date;
  v_count integer;
begin
  v_employee_id := (p_payload->>'employee_id')::uuid;
  v_effective_from := (p_payload->>'effective_from')::date;

  if v_employee_id is null or v_effective_from is null then
    raise exception 'invalid_payload: employee_id + effective_from required'
      using errcode = '22023';
  end if;

  update core_identity.employee_node_placements
  set effective_to = v_effective_from, updated_at = now()
  where employee_id = v_employee_id and effective_to is null;
  get diagnostics v_count = row_count;

  if v_count = 0 then
    -- Ingen åben placement at lukke — idempotent.
    return;
  end if;
end;
$$;

revoke execute on function core_identity._apply_employee_remove(jsonb, uuid) from public, anon, authenticated;

-- ─── _apply_team_close ──────────────────────────────────────────────────
-- V5-sweep: team_close-handler er i Step 4 (rører primært placements).
-- Atomisk: ny org_node_version med is_active=false + luk alle åbne employee+client placements.
create or replace function core_identity._apply_team_close(
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

  -- Verificér: node_id er team-knude og aktiv (current version).
  select * into v_current_version
  from core_identity.org_node_versions
  where node_id = v_node_id and effective_to is null
  limit 1;

  if not found then
    raise exception 'team_close_no_open_version: %', v_node_id
      using errcode = 'P0002';
  end if;

  if v_current_version.node_type <> 'team' then
    raise exception 'team_close_not_team: % er %', v_node_id, v_current_version.node_type
      using errcode = '22023';
  end if;

  if not v_current_version.is_active then
    raise exception 'team_close_already_inactive: %', v_node_id
      using errcode = '22023';
  end if;

  -- Atomisk: luk version + insert ny is_active=false + luk alle åbne placements.
  update core_identity.org_node_versions
  set effective_to = v_effective_from
  where version_id = v_current_version.version_id;

  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from, effective_to, created_by_pending_change_id)
  values
    (v_node_id, v_current_version.name, v_current_version.parent_id, 'team',
     false, v_effective_from, null, p_pending_change_id);

  -- Luk alle åbne employee_node_placements på team.
  update core_identity.employee_node_placements
  set effective_to = v_effective_from, updated_at = now()
  where node_id = v_node_id and effective_to is null;

  -- Luk alle åbne client_node_placements på team (Step 5 tilføjer tabellen;
  -- denne UPDATE er no-op hvis tabel ikke har rows endnu).
  -- Note: client_node_placements oprettes i Step 5 — denne UPDATE bliver
  -- effektiv når Step 5 er kørt.
  if exists (select 1 from pg_class where relname = 'client_node_placements' and relnamespace = (select oid from pg_namespace where nspname = 'core_identity')) then
    execute 'update core_identity.client_node_placements set effective_to = $1, updated_at = now() where node_id = $2 and effective_to is null'
      using v_effective_from, v_node_id;
  end if;

  update core_identity.org_nodes set updated_at = now() where id = v_node_id;
end;
$$;

revoke execute on function core_identity._apply_team_close(jsonb, uuid) from public, anon, authenticated;

-- ─── CREATE OR REPLACE pending_change_apply: tilføj 3 cases ──────────────
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
    when 'employee_place' then
      perform core_identity._apply_employee_place(v_change.payload, p_change_id);
    when 'employee_remove' then
      perform core_identity._apply_employee_remove(v_change.payload, p_change_id);
    when 'team_close' then
      perform core_identity._apply_team_close(v_change.payload, p_change_id);
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

-- ─── Seed undo_settings ─────────────────────────────────────────────────
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason', 'T9 Step 4: seed undo_settings for employee_place/remove + team_close', false);

insert into core_identity.undo_settings (change_type, undo_period_seconds)
values
  ('employee_place', 24 * 3600),
  ('employee_remove', 24 * 3600),
  ('team_close', 24 * 3600)
on conflict (change_type) do nothing;
