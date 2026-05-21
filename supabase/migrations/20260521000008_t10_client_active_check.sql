-- Trin 10 T10.7b: klient-aktiv-check i client_node_place + _apply_client_place
--
-- Krav-dok §2.5.2: "Inaktiv klient bliver stående for historik, men kan ikke
-- vælges som ny team-tilknytning." FK (T10.7) sikrer kun eksistens.
-- Krav-dok §3.4: "valideres at klienten faktisk findes" ved BÅDE oprettelse OG
-- ændring (close er en ændring).
--
-- Superadmin-bypass på aktiv-check (Mathias 2026-05-21 "superadmin må alt").
-- Sikkerheds-invariants (immutable key/pii_level i T10.10) bypasses IKKE.
--
-- V10 (Codex runde 9 TEKNISK-BLOKERING): apply-handler bruger employee-id-baseret
-- helper (is_admin_by_employee_id) fordi auth.uid() er NULL i cron-apply-context.
-- Bypass baseret på pending-rækkens requested_by OR approved_by.
--
-- V9 (Codex runde 8 TEKNISK-BLOKERING): wrapper sætter t9_write_authorized FØR
-- pending_change_request (T9-fundament-supplement INSERT-policy kræver det).
--
-- V14 (Code walk-through): client_node_close klient-eksistens-check (P0002) —
-- krav-dok §3.4 konformitet for close-ændring.

-- ─── Ny helper: is_admin_by_employee_id (V10 Codex runde 9) ─────────────
-- Admin-tjek via employee_id direkte (ikke auth.uid). Apply-handlers der
-- kører i cron-context kan ikke bruge is_admin() — den returnerer false
-- når auth.uid() er NULL.
create or replace function core_identity.is_admin_by_employee_id(p_employee_id uuid)
returns boolean
language sql stable security invoker set search_path = ''
as $$
  select exists (
    select 1
    from core_identity.employees e
    join core_identity.role_page_permissions p on p.role_id = e.role_id
    where e.id = p_employee_id
      and core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
      and p.page_key = 'system'
      and p.tab_key = 'manage'
      and p.scope = 'all'
      and p.can_edit = true
  );
$$;

comment on function core_identity.is_admin_by_employee_id(uuid) is
  'V10/Trin 10: admin-tjek via employee_id (ikke auth.uid). Anvendes af apply-handlers der kører i cron-context uden auth.';

-- Grant-pattern matcher is_admin() (T1-helpers-stubs:50): authenticated + anon + service_role.
revoke all on function core_identity.is_admin_by_employee_id(uuid) from public;
grant execute on function core_identity.is_admin_by_employee_id(uuid) to authenticated, anon, service_role;

-- ─── client_node_place: tilføj klient-aktiv-check + session-var ─────────
create or replace function core_identity.client_node_place(
  p_client_id uuid,
  p_node_id uuid,
  p_effective_from date
) returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_request_id uuid;
  v_client_active boolean;
begin
  if not core_identity.has_permission('client_placements', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  -- Pre-check: node_id skal være team (uændret fra T9).
  if not exists (
    select 1 from core_identity.org_node_versions
    where node_id = p_node_id and node_type = 'team' and is_active = true
      and effective_from <= current_date
      and (effective_to is null or effective_to > current_date)
  ) then
    raise exception 'client_placement_node_not_team_or_inactive: %', p_node_id using errcode = '22023';
  end if;
  -- V7/Trin 10 (krav-dok §3.4 + §2.5.2): klient skal findes og være aktiv.
  select is_active into v_client_active
    from core_identity.clients where id = p_client_id;
  if not found then
    raise exception 'client_not_found: %', p_client_id using errcode = 'P0002';
  end if;
  if v_client_active = false and not core_identity.is_admin() then
    raise exception 'client_inactive: % er sat is_active=false (krav-dok §2.5.2: inaktiv klient kan ikke vælges som ny team-tilknytning)', p_client_id
      using errcode = '22023';
  end if;
  -- V9 (Codex runde 8 TEKNISK-BLOKERING): pending_changes-INSERT-policy
  -- (T9-fundament-supplement) kræver session-var.
  perform set_config('stork.t9_write_authorized', 'true', true);
  v_request_id := core_identity.pending_change_request(
    'client_place', p_client_id,
    jsonb_build_object(
      'client_id', p_client_id::text,
      'node_id', p_node_id::text,
      'effective_from', p_effective_from::text
    ),
    p_effective_from
  );
  return v_request_id;
end; $$;

revoke execute on function core_identity.client_node_place(uuid, uuid, date) from public, anon;

-- ─── client_node_close: tilføj eksistens-check + session-var ────────────
-- INGEN aktiv-check (krav-dok §2.5.2 gælder ikke for lukning).
-- V14: eksistens-check tilføjet (krav-dok §3.4 dækker BÅDE oprettelse OG ændring).
create or replace function core_identity.client_node_close(
  p_client_id uuid,
  p_effective_from date
) returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_request_id uuid;
begin
  if not core_identity.has_permission('client_placements', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  -- V14 (Code walk-through): klient-eksistens-check (krav-dok §3.4 — "valideres
  -- at klienten faktisk findes" ved BÅDE oprettelse OG ændring). Close er ændring.
  -- Forhindrer silent no-op på ikke-eksisterende client_id.
  if not exists (select 1 from core_identity.clients where id = p_client_id) then
    raise exception 'client_not_found: %', p_client_id using errcode = 'P0002';
  end if;
  -- V9: pending_changes-INSERT-policy kræver session-var.
  perform set_config('stork.t9_write_authorized', 'true', true);
  v_request_id := core_identity.pending_change_request(
    'client_close', p_client_id,
    jsonb_build_object(
      'client_id', p_client_id::text,
      'effective_from', p_effective_from::text
    ),
    p_effective_from
  );
  return v_request_id;
end; $$;

revoke execute on function core_identity.client_node_close(uuid, date) from public, anon;

-- ─── _apply_client_place: tilføj klient-eksistens + aktiv-check FØR INSERT/UPDATE
create or replace function core_identity._apply_client_place(
  p_payload jsonb,
  p_pending_change_id uuid
) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_client_id uuid;
  v_node_id uuid;
  v_effective_from date;
  v_client_active boolean;
  v_active record;
  v_requested_by uuid;
  v_approved_by uuid;
  v_admin_involved boolean;
begin
  v_client_id := (p_payload->>'client_id')::uuid;
  v_node_id := (p_payload->>'node_id')::uuid;
  v_effective_from := (p_payload->>'effective_from')::date;
  if v_client_id is null or v_node_id is null or v_effective_from is null then
    raise exception 'invalid_payload: client_id + node_id + effective_from required'
      using errcode = '22023';
  end if;

  -- Team-aktiv-check (uændret fra T9-supplement).
  if not exists (
    select 1 from core_identity.org_node_versions
    where node_id = v_node_id and node_type = 'team' and is_active = true
      and effective_from <= v_effective_from
      and (effective_to is null or effective_to > v_effective_from)
  ) then
    raise exception 'client_placement_requires_active_team: %', v_node_id
      using errcode = 'P0001';
  end if;

  -- V7/Trin 10 (krav-dok §3.4 + §2.5.2): klient skal findes og være aktiv.
  -- Fanger pending oprettet mens aktiv, applied efter deaktivering.
  select is_active into v_client_active
    from core_identity.clients where id = v_client_id;
  if not found then
    raise exception 'apply_client_place: client_not_found: %', v_client_id using errcode = 'P0002';
  end if;

  -- V10 (Codex runde 9 TEKNISK-BLOKERING): bypass kan IKKE bruge is_admin()
  -- fordi auth.uid() er NULL i cron-apply-context. Hent requester+approver fra
  -- pending-rækken og tjek via employee-id-baseret helper.
  v_admin_involved := false;
  if p_pending_change_id is not null then
    select requested_by, approved_by into v_requested_by, v_approved_by
      from core_identity.pending_changes where id = p_pending_change_id;
    v_admin_involved :=
      core_identity.is_admin_by_employee_id(v_requested_by) or
      (v_approved_by is not null and core_identity.is_admin_by_employee_id(v_approved_by));
  end if;

  if v_client_active = false and not v_admin_involved then
    raise exception 'apply_client_place: client_inactive: % (krav-dok §2.5.2)', v_client_id
      using errcode = 'P0001';
  end if;

  -- Resten af apply-handler-logikken er uændret fra T9-supplement
  -- (20260520000000_t9_supplement.sql:321-350): find aktiv placement,
  -- enten INSERT ny, UPDATE eksisterende eller split placement-række.
  select * into v_active
  from core_identity.client_node_placements
  where client_id = v_client_id
    and effective_from <= v_effective_from
    and (effective_to is null or effective_to > v_effective_from)
  limit 1;

  if not found then
    insert into core_identity.client_node_placements
      (client_id, node_id, effective_from, effective_to, created_by_pending_change_id)
    select v_client_id, v_node_id, v_effective_from,
      (select min(effective_from) from core_identity.client_node_placements
       where client_id = v_client_id and effective_from > v_effective_from),
      p_pending_change_id;
  elsif v_active.effective_from = v_effective_from then
    update core_identity.client_node_placements
    set node_id = v_node_id,
        created_by_pending_change_id = coalesce(p_pending_change_id, created_by_pending_change_id),
        updated_at = now()
    where id = v_active.id;
  else
    update core_identity.client_node_placements
    set effective_to = v_effective_from, updated_at = now()
    where id = v_active.id;
    insert into core_identity.client_node_placements
      (client_id, node_id, effective_from, effective_to, created_by_pending_change_id)
    values
      (v_client_id, v_node_id, v_effective_from, v_active.effective_to, p_pending_change_id);
  end if;
end; $$;

revoke execute on function core_identity._apply_client_place(jsonb, uuid) from public, anon, authenticated;
