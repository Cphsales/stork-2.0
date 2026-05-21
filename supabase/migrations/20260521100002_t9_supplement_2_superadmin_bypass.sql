-- T9-supplement-2 M2: G057 superadmin-bypass på 2 T9 forretnings-invariants
--
-- G057: To T9 forretnings-vagter blokerede superadmin:
--   - _apply_client_place team-aktiv-check (linje 159-167 i T10.7b-version)
--   - _apply_team_close allerede-inaktiv-check (linje 598-601 i T9-supplement)
--
-- T10.7b satte bypass-mønstret for klient-aktiv-check via is_admin_by_employee_id;
-- de to ovenstående forblev uden bypass. Idempotency-model: vagten passerer for
-- superadmin → handler kører → effektivt no-op hvis allerede i mål-tilstand.
--
-- Reference: docs/coordination/t9-supplement-2-plan.md M2 + krav-dok §3.2 +
-- mathias-afgoerelser 2026-05-21 (superadmin-bypass-ramme + idempotency-model).

-- ─── _apply_client_place: udvid team-aktiv-bypass ────────────────────────
-- T10.7b-version (20260521000008:134-228) har v_admin_involved-beregning MIDT i body
-- (efter klient-eksistens-check). V11: flyt beregning ØVERST så bypass kan bruges
-- på BÅDE team-aktiv-check og klient-aktiv-check.
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

  -- V11 (G057 fix): beregn v_admin_involved ØVERST så bypass kan bruges på begge invarianter
  v_admin_involved := false;
  if p_pending_change_id is not null then
    select requested_by, approved_by into v_requested_by, v_approved_by
      from core_identity.pending_changes where id = p_pending_change_id;
    v_admin_involved :=
      core_identity.is_admin_by_employee_id(v_requested_by) or
      (v_approved_by is not null and core_identity.is_admin_by_employee_id(v_approved_by));
  end if;

  -- V11 (G057): team-aktiv-check med bypass
  if not exists (
    select 1 from core_identity.org_node_versions
    where node_id = v_node_id and node_type = 'team' and is_active = true
      and effective_from <= v_effective_from
      and (effective_to is null or effective_to > v_effective_from)
  ) and not v_admin_involved then
    raise exception 'client_placement_requires_active_team: %', v_node_id
      using errcode = 'P0001';
  end if;

  -- V7/Trin 10 (krav-dok §3.4 + §2.5.2): klient skal findes og være aktiv.
  select is_active into v_client_active
    from core_identity.clients where id = v_client_id;
  if not found then
    raise exception 'apply_client_place: client_not_found: %', v_client_id using errcode = 'P0002';
  end if;

  -- Eksisterende klient-aktiv-bypass (T10.7b, uændret logik)
  if v_client_active = false and not v_admin_involved then
    raise exception 'apply_client_place: client_inactive: % (krav-dok §2.5.2)', v_client_id
      using errcode = 'P0001';
  end if;

  -- Resten af apply-handler-logikken er uændret fra T10.7b
  -- (find aktiv placement, INSERT ny, UPDATE eksisterende eller split placement-række)
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

-- ─── _apply_team_close: tilføj allerede-inaktiv-bypass ───────────────────
-- T9-supplement-version (20260520000000:557-640) har linje 598-601 der raiser
-- 'team_close_already_inactive' UDEN bypass. V11: tilføj bypass via is_admin_by_employee_id.
-- Strukturelle vagter (team_close_no_active_version_at P0002 + team_close_not_team 22023)
-- bevares UDEN bypass.
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
  v_active record;
  v_emp record;
  v_cli record;
  -- V11 (G057): bypass-felter
  v_requested_by uuid;
  v_approved_by uuid;
  v_admin_involved boolean;
begin
  v_node_id := (p_payload->>'node_id')::uuid;
  v_effective_from := (p_payload->>'effective_from')::date;

  if v_node_id is null or v_effective_from is null then
    raise exception 'invalid_payload: node_id + effective_from required'
      using errcode = '22023';
  end if;

  -- Find aktivt version på v_effective_from + verificer node_type='team'.
  select * into v_active
  from core_identity.org_node_versions
  where node_id = v_node_id
    and effective_from <= v_effective_from
    and (effective_to is null or effective_to > v_effective_from)
  limit 1;

  -- Strukturel vagt: ingen aktiv version (uændret, bypasses ikke)
  if not found then
    raise exception 'team_close_no_active_version_at: % på %', v_node_id, v_effective_from
      using errcode = 'P0002';
  end if;

  -- Strukturel vagt: node_type='team' (uændret, bypasses ikke)
  if v_active.node_type <> 'team' then
    raise exception 'team_close_not_team: % er %', v_node_id, v_active.node_type
      using errcode = '22023';
  end if;

  -- V11 (G057): beregn v_admin_involved før forretnings-vagten
  v_admin_involved := false;
  if p_pending_change_id is not null then
    select requested_by, approved_by into v_requested_by, v_approved_by
      from core_identity.pending_changes where id = p_pending_change_id;
    v_admin_involved :=
      core_identity.is_admin_by_employee_id(v_requested_by) or
      (v_approved_by is not null and core_identity.is_admin_by_employee_id(v_approved_by));
  end if;

  -- V11 (G057): forretnings-vagt med bypass + idempotency
  if not v_active.is_active then
    if v_admin_involved then
      -- Idempotency-no-op: target er allerede inaktiv → handler returnerer uden mutationer
      return;
    end if;
    raise exception 'team_close_already_inactive: %', v_node_id
      using errcode = '22023';
  end if;

  -- Deaktivér team-version via split-at-boundary (uændret).
  if v_active.effective_from = v_effective_from then
    update core_identity.org_node_versions
    set is_active = false,
        created_by_pending_change_id = coalesce(p_pending_change_id, created_by_pending_change_id)
    where version_id = v_active.version_id;
  else
    update core_identity.org_node_versions
    set effective_to = v_effective_from
    where version_id = v_active.version_id;

    insert into core_identity.org_node_versions
      (node_id, name, parent_id, node_type, is_active, effective_from, effective_to, created_by_pending_change_id)
    values
      (v_node_id, v_active.name, v_active.parent_id, 'team', false, v_effective_from, v_active.effective_to, p_pending_change_id);
  end if;

  -- Cascade: luk alle employee-placements aktive på v_effective_from for team (uændret).
  for v_emp in
    select * from core_identity.employee_node_placements
    where node_id = v_node_id
      and effective_from <= v_effective_from
      and (effective_to is null or effective_to > v_effective_from)
  loop
    if v_emp.effective_from = v_effective_from then
      delete from core_identity.employee_node_placements where id = v_emp.id;
    elsif v_emp.effective_to is null or v_emp.effective_to > v_effective_from then
      update core_identity.employee_node_placements
      set effective_to = v_effective_from, updated_at = now()
      where id = v_emp.id;
    end if;
  end loop;

  -- Cascade: luk alle client-placements aktive på v_effective_from for team (uændret).
  for v_cli in
    select * from core_identity.client_node_placements
    where node_id = v_node_id
      and effective_from <= v_effective_from
      and (effective_to is null or effective_to > v_effective_from)
  loop
    if v_cli.effective_from = v_effective_from then
      delete from core_identity.client_node_placements where id = v_cli.id;
    elsif v_cli.effective_to is null or v_cli.effective_to > v_effective_from then
      update core_identity.client_node_placements
      set effective_to = v_effective_from, updated_at = now()
      where id = v_cli.id;
    end if;
  end loop;
end; $$;

revoke execute on function core_identity._apply_team_close(jsonb, uuid) from public, anon, authenticated;
