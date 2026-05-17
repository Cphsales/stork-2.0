-- Trin 9 / §4 trin 9 Step 1: pending_changes-infrastruktur (fortrydelses-mekanisme).
--
-- Krav-dok 6.1+6.2: Alle ændringer med gældende dato kan fortrydes i en periode.
-- Plan V6 Beslutning 7+11+15: pending_changes er eneste skrivevej for tids-baserede
-- ændringer. Central apply-gate i pending_change_apply (V6 Beslutning 15) håndhæver
-- due-check; cron er selection-filter.
--
-- Schema:
--   pending_changes:   audit-log af ændringer fra request → approve → applied | undone
--   undo_settings:     pr. change_type undo-periode (UI-redigerbar konfig)
--
-- RPC'er:
--   pending_change_request(change_type, target_id, payload, effective_from)
--     INTERN (revoke from authenticated) — kaldes kun af public wrappers (Step 8)
--   pending_change_approve(change_id)
--     Public — admin/manager approver; starter undo-deadline
--   pending_change_undo(change_id)
--     Public — ruller tilbage før undo_deadline
--   pending_change_apply(change_id)
--     CENTRAL APPLY-GATE (V6): verificerer due-check OG dispatcher til intern handler
--     Eksekveres af cron eller manuelt af admin; ALLE paths gennem samme gate
--   undo_setting_update(change_type, undo_period_seconds)
--     Direkte (ikke pending) — krav-dok 4.7 ikke gældende dato
--
-- Cron pending_changes_apply_due (kører hver minut):
--   Selection-filter: WHERE status='approved' AND undo_deadline <= now()
--                       AND effective_from <= current_date
--   For hver: kalder pending_change_apply (som re-verificerer due-check)

-- ─── pending_changes (central audit + state-machine) ─────────────────────
-- no-dedup-key: append-only audit-tabel; id er PK.
create table core_identity.pending_changes (
  id uuid primary key default gen_random_uuid(),
  change_type text not null,
  target_id uuid,
  payload jsonb not null,
  effective_from date not null,
  requested_by uuid references core_identity.employees(id) on delete restrict,
  requested_at timestamptz not null default now(),
  approved_by uuid references core_identity.employees(id) on delete restrict,
  approved_at timestamptz,
  undo_deadline timestamptz,
  applied_at timestamptz,
  undone_at timestamptz,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'applied', 'undone')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- change_type valideres ved RPC-niveau (pending_change_request kræver registered handler).
  -- Apply-dispatcher (pending_change_apply) er CREATE OR REPLACE'et i Steps 2+4+5
  -- til at understøtte nye change_types. Dispatcher raiser unknown_change_type
  -- hvis ikke registreret.
  -- Plan V6 Valg 8 change-type-matrix.
  -- Status-livscyklus-invariants.
  check (approved_at is null or approved_by is not null),
  check (undo_deadline is null or approved_at is not null),
  check (applied_at is null or undo_deadline <= applied_at),
  check (undone_at is null or applied_at is null),
  check (status = 'pending'  or approved_at is not null),
  check (status = 'applied'  or applied_at is null),
  check (status = 'undone'   or undone_at is null)
);

comment on table core_identity.pending_changes is
  'T9 Step 1: central fortrydelses-mekanisme-tabel. Krav-dok 6.1+6.2. Eneste skrivevej for tids-baserede strukturændringer, medarbejder/klient-placeringer (krav-dok 3.6.2). Status-livscyklus: pending → approved → applied | undone.';

comment on column core_identity.pending_changes.payload is
  'Type-specifik payload (jsonb). Apply-dispatcher dispatcher på change_type til intern handler der læser payload.';

comment on column core_identity.pending_changes.effective_from is
  'Forretningsmæssig gældende dato. Apply venter på effective_from <= current_date (V6 Beslutning 15).';

comment on column core_identity.pending_changes.undo_deadline is
  'Tidspunkt hvor fortrydelses-periode udløber. = approved_at + undo_settings.undo_period_seconds. Apply venter på undo_deadline <= now().';

create index pending_changes_status_due on core_identity.pending_changes (status, undo_deadline, effective_from)
  where status = 'approved';

create index pending_changes_requested_by on core_identity.pending_changes (requested_by);

alter table core_identity.pending_changes enable row level security;
alter table core_identity.pending_changes force row level security;

revoke all on table core_identity.pending_changes from public, anon, service_role;
grant select on table core_identity.pending_changes to authenticated;

-- Read-policy: admin ser alt; medarbejder ser kun egne requests.
create policy pending_changes_select on core_identity.pending_changes
  for select to authenticated
  using (
    requested_by = core_identity.current_employee_id()
    or core_identity.is_admin()
  );

-- ─── undo_settings (UI-redigerbar konfig pr. change_type) ────────────────
-- no-dedup-key: change_type er PK.
create table core_identity.undo_settings (
  change_type text primary key,
  undo_period_seconds integer not null
    check (undo_period_seconds >= 0 and undo_period_seconds <= 30 * 24 * 3600),
  updated_at timestamptz not null default now(),
  updated_by uuid references core_identity.employees(id) on delete restrict
);

comment on table core_identity.undo_settings is
  'T9 Step 1: UI-redigerbar konfig — undo-periode pr. change_type. Krav-dok 6.3 (fortrydelses-periodens længde konfigureres i UI).';

alter table core_identity.undo_settings enable row level security;
alter table core_identity.undo_settings force row level security;

revoke all on table core_identity.undo_settings from public, anon, service_role;
grant select on table core_identity.undo_settings to authenticated;

create policy undo_settings_select on core_identity.undo_settings
  for select to authenticated
  using (true);

-- ─── RPC: pending_change_request (INTERN; kaldes kun af public wrappers) ──
-- V3 Beslutning 12: pending_change_request er INTERN. Public wrappers (Step 8)
-- er SECURITY DEFINER og er ENESTE indgang. Direct authenticated-kald afvises.
create or replace function core_identity.pending_change_request(
  p_change_type text,
  p_target_id uuid,
  p_payload jsonb,
  p_effective_from date
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_request_id uuid;
  v_requested_by uuid;
begin
  v_requested_by := core_identity.current_employee_id();
  if v_requested_by is null then
    raise exception 'no_authenticated_employee'
      using errcode = '42501', hint = 'pending_change_request kræver authenticated employee';
  end if;

  -- INSERT med eksplicit session-vars (audit-trigger fanger).
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'pending_change_request', true);

  insert into core_identity.pending_changes
    (change_type, target_id, payload, effective_from, requested_by, status)
  values
    (p_change_type, p_target_id, p_payload, p_effective_from, v_requested_by, 'pending')
  returning id into v_request_id;

  return v_request_id;
end;
$$;

comment on function core_identity.pending_change_request(text, uuid, jsonb, date) is
  'T9 Step 1: INTERN RPC. V3 Beslutning 12: revoke from authenticated. Public wrappers (Step 8) er ENESTE indgang.';

-- INTERN: revoke från authenticated. Public wrappers (Step 8) er SECURITY DEFINER.
revoke execute on function core_identity.pending_change_request(text, uuid, jsonb, date) from public, anon, authenticated;

-- ─── RPC: pending_change_approve ─────────────────────────────────────────
create or replace function core_identity.pending_change_approve(
  p_change_id uuid
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_change record;
  v_approver uuid;
  v_undo_period integer;
begin
  v_approver := core_identity.current_employee_id();
  if v_approver is null then
    raise exception 'no_authenticated_employee'
      using errcode = '42501';
  end if;

  select * into v_change
  from core_identity.pending_changes
  where id = p_change_id
  for update;

  if not found then
    raise exception 'pending_change_not_found %', p_change_id
      using errcode = 'P0002';
  end if;

  if v_change.status <> 'pending' then
    raise exception 'pending_change_wrong_status: % (expected pending)', v_change.status
      using errcode = '22023';
  end if;

  if v_change.requested_by = v_approver and not core_identity.is_admin() then
    raise exception 'pending_change_self_approve_forbidden'
      using errcode = '42501', hint = 'requester må ikke selv approve (medmindre admin)';
  end if;

  -- Hent undo-periode fra konfig.
  select undo_period_seconds into v_undo_period
  from core_identity.undo_settings
  where change_type = v_change.change_type;

  if v_undo_period is null then
    -- Default 24t hvis ingen konfig (defensiv).
    v_undo_period := 24 * 3600;
  end if;

  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'pending_change_approve', true);

  update core_identity.pending_changes
  set status = 'approved',
      approved_by = v_approver,
      approved_at = now(),
      undo_deadline = now() + (v_undo_period || ' seconds')::interval,
      updated_at = now()
  where id = p_change_id;
end;
$$;

comment on function core_identity.pending_change_approve(uuid) is
  'T9 Step 1: godkender pending; sætter undo_deadline = now() + undo_settings.undo_period_seconds.';

revoke execute on function core_identity.pending_change_approve(uuid) from public, anon;

-- ─── RPC: pending_change_undo ────────────────────────────────────────────
create or replace function core_identity.pending_change_undo(
  p_change_id uuid
) returns void
language plpgsql
security invoker
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
    raise exception 'pending_change_wrong_status: % (expected approved)', v_change.status
      using errcode = '22023';
  end if;

  if v_change.undo_deadline <= now() then
    raise exception 'undo_deadline_expired'
      using errcode = '22023',
            hint = format('deadline var %s', v_change.undo_deadline);
  end if;

  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'pending_change_undo', true);

  update core_identity.pending_changes
  set status = 'undone',
      undone_at = now(),
      updated_at = now()
  where id = p_change_id;
end;
$$;

comment on function core_identity.pending_change_undo(uuid) is
  'T9 Step 1: ruller approved-row tilbage før undo_deadline. Efter deadline: exception.';

revoke execute on function core_identity.pending_change_undo(uuid) from public, anon;

-- ─── RPC: pending_change_apply (CENTRAL APPLY-GATE — V6 Beslutning 15) ────
-- V6 Codex KRITISK-fix: sikkerheds-grænsen for "ikke materialiser future-dated"
-- sidder HER, ikke kun i cron-filter. ALLE apply-paths (cron, manuel admin, test)
-- går gennem samme gate.
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

  -- V6 central apply-gate: due-check.
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

  -- Dispatcher: switch på change_type til intern handler.
  -- Steps 2+4+5 udvider via CREATE OR REPLACE af denne funktion med rigtige
  -- CASE WHEN-handlers. I Step 1 er der ingen handlers, så vi raiser direkte.
  raise exception 'unknown_change_type: %', v_change.change_type
    using errcode = '42883',
          hint = 'Step 1 dispatcher har ingen handlers; Steps 2+4+5 udvider via CREATE OR REPLACE';

  -- Når Steps 2+4+5 udvider CASE: mark applied her efter handler returnerer.
  update core_identity.pending_changes
  set status = 'applied',
      applied_at = now(),
      updated_at = now()
  where id = p_change_id;
end;
$$;

comment on function core_identity.pending_change_apply(uuid) is
  'T9 Step 1: CENTRAL APPLY-GATE. V6 Beslutning 15. Verificerer due-check (status=approved AND undo_deadline <= now() AND effective_from <= current_date). Hvis ikke: RAISE not_yet_due. Dispatcher til intern handler. Eksekveres af cron eller manuelt af admin; ALLE paths gennem samme gate.';

revoke execute on function core_identity.pending_change_apply(uuid) from public, anon;

-- ─── RPC: undo_setting_update (direkte; ikke pending) ────────────────────
create or replace function core_identity.undo_setting_update(
  p_change_type text,
  p_undo_period_seconds integer
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_updater uuid;
begin
  v_updater := core_identity.current_employee_id();
  if v_updater is null then
    raise exception 'no_authenticated_employee'
      using errcode = '42501';
  end if;

  if not core_identity.has_permission('pending_changes', 'settings', true) then
    raise exception 'permission_denied: pending_changes/settings/can_edit'
      using errcode = '42501';
  end if;

  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'undo_setting_update', true);

  insert into core_identity.undo_settings (change_type, undo_period_seconds, updated_at, updated_by)
  values (p_change_type, p_undo_period_seconds, now(), v_updater)
  on conflict (change_type) do update
  set undo_period_seconds = excluded.undo_period_seconds,
      updated_at = excluded.updated_at,
      updated_by = excluded.updated_by;
end;
$$;

comment on function core_identity.undo_setting_update(text, integer) is
  'T9 Step 1: UI-redigerbar konfig af undo-periode pr. change_type. Direkte (ikke pending) — krav-dok 4.7 specificerer ikke gældende dato.';

revoke execute on function core_identity.undo_setting_update(text, integer) from public, anon;

-- ─── Audit-trigger på pending_changes ────────────────────────────────────
create trigger pending_changes_audit
  after insert or update or delete on core_identity.pending_changes
  for each row
  execute function core_compliance.stork_audit();

create trigger undo_settings_audit
  after insert or update or delete on core_identity.undo_settings
  for each row
  execute function core_compliance.stork_audit();

-- ─── Cron: pending_changes_apply_due ────────────────────────────────────
-- Selection-filter: status='approved' AND undo_deadline <= now() AND effective_from <= current_date.
-- For hver: kald pending_change_apply (som re-verificerer due-check — V6).
select cron.schedule(
  'pending_changes_apply_due',
  '* * * * *',  -- hver minut
  $cron$
    do $cron_body$
    declare
      v_change_id uuid;
      v_success integer := 0;
      v_failure integer := 0;
      v_started timestamptz := clock_timestamp();
    begin
      perform set_config('stork.source_type', 'cron', true);
      perform set_config('stork.change_reason', 'pending_changes_apply_due cron', true);
      for v_change_id in
        select id from core_identity.pending_changes
        where status = 'approved'
          and undo_deadline <= now()
          and effective_from <= current_date
        order by approved_at
        limit 100
      loop
        begin
          perform core_identity.pending_change_apply(v_change_id);
          v_success := v_success + 1;
        exception when others then
          v_failure := v_failure + 1;
        end;
      end loop;

      perform core_compliance.cron_heartbeat_record(
        'pending_changes_apply_due',
        '* * * * *',
        case when v_failure = 0 then 'ok' else 'partial_failure' end,
        case when v_failure > 0 then format('failed=%s applied=%s', v_failure, v_success) else null end,
        cast(extract(milliseconds from clock_timestamp() - v_started) as integer)
      );
    end;
    $cron_body$;
  $cron$
);

-- undo_settings-rows for change_types seedes i Steps 2+4+5 når handlers
-- registreres. Step 1 har ingen seed (placeholder undgået).
