-- Trin 9 / §4 trin 9 Step 5: client_node_placements (uden client-FK) + apply-handlers.
--
-- Plan V6 Beslutning 3 + Valg 4: client_id som uuid UDEN FK (klient-skabelon
-- bygges i trin 10; FK tilføjes der via ALTER TABLE). client_id på
-- FK_COVERAGE_EXEMPTIONS allowlist i scripts/fitness.mjs.
--
-- Plan V6 krav-dok 3.4: klient kun tilknyttet team-knuder. Trigger validerer
-- node_type='team' på node_id.
--
-- Apply-handlers: _apply_client_place + _apply_client_close.

-- no-dedup-key: versioneret placement-tabel; partial UNIQUE (client_id) WHERE effective_to IS NULL er natural dedup.
create table core_identity.client_node_placements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,  -- UDEN FK (trin 10 tilføjer)
  node_id uuid not null references core_identity.org_nodes(id) on delete restrict,
  effective_from date not null,
  effective_to date,
  applied_at timestamptz not null default now(),
  created_by_pending_change_id uuid references core_identity.pending_changes(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_to is null or effective_from < effective_to)
);

comment on table core_identity.client_node_placements is
  'T9 Step 5 V6 Valg 4: versioneret klient-team-tilknytning. client_id UDEN FK (trin 10 tilføjer). Kun team-knuder kan modtage tilknytning (BEFORE-trigger validerer).';

create unique index client_node_placements_open_per_client
  on core_identity.client_node_placements (client_id)
  where effective_to is null;

alter table core_identity.client_node_placements
  add constraint client_node_placements_no_overlap
  exclude using gist (
    client_id with =,
    daterange(effective_from, coalesce(effective_to, 'infinity'::date), '[)') with &&
  );

create index client_node_placements_node_id on core_identity.client_node_placements (node_id);
create index client_node_placements_effective on core_identity.client_node_placements (effective_from, effective_to);

alter table core_identity.client_node_placements enable row level security;
alter table core_identity.client_node_placements force row level security;

revoke all on table core_identity.client_node_placements from public, anon, service_role;
grant select on table core_identity.client_node_placements to authenticated;

-- Pre-cutover SELECT-policy: kun is_admin(). Udvides i trin 10 efter clients eksisterer.
create policy client_node_placements_select on core_identity.client_node_placements
  for select to authenticated using (core_identity.is_admin());

create trigger client_node_placements_audit
  after insert or update or delete on core_identity.client_node_placements
  for each row execute function core_compliance.stork_audit();

-- ─── Team-only validering ────────────────────────────────────────────────
create or replace function core_identity._client_placement_team_check()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Verificér at node_id refererer til team-knude (current version).
  if not exists (
    select 1 from core_identity.org_node_versions
    where node_id = new.node_id
      and node_type = 'team'
      and effective_from <= new.effective_from
      and (effective_to is null or effective_to > new.effective_from)
  ) then
    raise exception 'client_placement_node_not_team: % er ikke team-knude på effective_from %', new.node_id, new.effective_from
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger client_node_placements_team_only
  before insert or update on core_identity.client_node_placements
  for each row execute function core_identity._client_placement_team_check();

-- ─── Apply-handlers ─────────────────────────────────────────────────────
create or replace function core_identity._apply_client_place(
  p_payload jsonb,
  p_pending_change_id uuid
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_client_id uuid;
  v_node_id uuid;
  v_effective_from date;
begin
  v_client_id := (p_payload->>'client_id')::uuid;
  v_node_id := (p_payload->>'node_id')::uuid;
  v_effective_from := (p_payload->>'effective_from')::date;

  if v_client_id is null or v_node_id is null or v_effective_from is null then
    raise exception 'invalid_payload: client_id + node_id + effective_from required'
      using errcode = '22023';
  end if;

  -- Luk eventuel åben placement (flyt).
  update core_identity.client_node_placements
  set effective_to = v_effective_from, updated_at = now()
  where client_id = v_client_id and effective_to is null;

  -- Åbn ny placement (trigger validerer team-only).
  insert into core_identity.client_node_placements
    (client_id, node_id, effective_from, effective_to, created_by_pending_change_id)
  values
    (v_client_id, v_node_id, v_effective_from, null, p_pending_change_id);
end;
$$;

revoke execute on function core_identity._apply_client_place(jsonb, uuid) from public, anon, authenticated;

create or replace function core_identity._apply_client_close(
  p_payload jsonb,
  p_pending_change_id uuid
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_client_id uuid;
  v_effective_from date;
begin
  v_client_id := (p_payload->>'client_id')::uuid;
  v_effective_from := (p_payload->>'effective_from')::date;

  if v_client_id is null or v_effective_from is null then
    raise exception 'invalid_payload: client_id + effective_from required'
      using errcode = '22023';
  end if;

  update core_identity.client_node_placements
  set effective_to = v_effective_from, updated_at = now()
  where client_id = v_client_id and effective_to is null;
end;
$$;

revoke execute on function core_identity._apply_client_close(jsonb, uuid) from public, anon, authenticated;

-- ─── CREATE OR REPLACE pending_change_apply: tilføj 2 cases ─────────────
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
    when 'client_place' then
      perform core_identity._apply_client_place(v_change.payload, p_change_id);
    when 'client_close' then
      perform core_identity._apply_client_close(v_change.payload, p_change_id);
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
select set_config('stork.change_reason', 'T9 Step 5: seed undo_settings for client_place/close', false);

insert into core_identity.undo_settings (change_type, undo_period_seconds)
values
  ('client_place', 24 * 3600),
  ('client_close', 24 * 3600)
on conflict (change_type) do nothing;
