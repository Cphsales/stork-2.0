-- T9-supplement (2026-05-20).
--
-- Append-only supplement-migration der lukker de 6 åbne T9-fund:
--   Section A — Team-no-children trigger med to-vejs interval-overlap (Step 1)
--   Section B — Backdated traversal i 7 apply-handlers (Step 2)
--   Section C1 — Date-aware ACL-helpers (Step 3a)
--   Section C2 — Udvidet SELECT-policy på client_node_placements (Step 3b)
--   Section C3 — 9 read-RPCs med session-var + _require_read_permission (Step 3c)
--   Section D — Step 12 robusthed DO-block (Step 4)
--
-- Reference: docs/coordination/T9-supplement-plan.md (V4, godkendt af Codex + Claude.ai)
-- Reference: docs/coordination/T9-supplement-krav-og-data.md (Mathias-godkendt)

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION A — Team-no-children-trigger med to-vejs interval-overlap (Step 1)
-- ═══════════════════════════════════════════════════════════════════════════
-- Codex V2 KRITISK 2 fix. Tidligere trigger validerede kun NEW.effective_from-
-- punkt; backdated/future cases kunne snige sig forbi. Nu: daterange-overlap.
--
-- Invariant a: når NEW.parent_id sættes må child-intervallet ikke overlappe
--              nogen parent-version hvor node_type = 'team'.
-- Invariant b: når NEW.node_type = 'team' må team-intervallet ikke overlappe
--              nogen child-version hvor parent_id = NEW.node_id.

create or replace function core_identity._org_node_team_no_children_check()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_new_range daterange;
begin
  v_new_range := daterange(new.effective_from, coalesce(new.effective_to, 'infinity'::date), '[)');

  -- Invariant a: parent må ikke have team-version der overlapper NEW's interval.
  if new.parent_id is not null then
    if exists (
      select 1 from core_identity.org_node_versions p
      where p.node_id = new.parent_id
        and p.node_type = 'team'
        and daterange(p.effective_from, coalesce(p.effective_to, 'infinity'::date), '[)') && v_new_range
    ) then
      raise exception 'org_node_team_cannot_have_children: parent % har team-version der overlapper [%, %)', new.parent_id, new.effective_from, coalesce(new.effective_to::text, 'infinity')
        using errcode = 'P0001';
    end if;
  end if;

  -- Invariant b: hvis NEW er team, må ingen child-version overlappe NEW's interval.
  if new.node_type = 'team' then
    if exists (
      select 1 from core_identity.org_node_versions c
      where c.parent_id = new.node_id
        and (tg_op = 'INSERT' or c.version_id <> new.version_id)
        and daterange(c.effective_from, coalesce(c.effective_to, 'infinity'::date), '[)') && v_new_range
    ) then
      raise exception 'org_node_team_cannot_have_children: node % har child-version der overlapper [%, %)', new.node_id, new.effective_from, coalesce(new.effective_to::text, 'infinity')
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

comment on function core_identity._org_node_team_no_children_check() is
  'T9-supplement Step 1 (Codex V2 KRITISK 2): to-vejs interval-overlap-invariant. (a) child må ikke overlappe team-parent-version. (b) team-node må ikke overlappe child-version.';

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION C1 — Date-aware ACL-helpers (Step 3a)
-- ═══════════════════════════════════════════════════════════════════════════
-- Codex V2 KRITISK 1 fix. Tidligere helpers brugte current_date hardkodet —
-- _at(p_date)-RPCs fik forkert ACL. Nu: helpers tager p_date som parameter;
-- current-wrappers kalder med current_date.
--
-- IKKE baseret på org_node_closure (current-state-only). Helpers bygger over
-- org_node_versions + employee_node_placements effective på p_date.

create or replace function core_identity.acl_subtree_org_nodes_at(
  p_employee_id uuid,
  p_date date
) returns uuid[]
language sql
stable
security invoker
set search_path = ''
as $$
  with recursive
  placement_node as (
    -- Hvor er employee placeret på p_date?
    select p.node_id
    from core_identity.employee_node_placements p
    where p.employee_id = p_employee_id
      and p.effective_from <= p_date
      and (p.effective_to is null or p.effective_to > p_date)
    limit 1
  ),
  subtree as (
    -- Start fra placement-node.
    select pn.node_id, 0 as depth
    from placement_node pn
    union all
    -- Walk children via version effective på p_date.
    select v.node_id, s.depth + 1
    from subtree s
    join core_identity.org_node_versions v on v.parent_id = s.node_id
    where v.effective_from <= p_date
      and (v.effective_to is null or v.effective_to > p_date)
      and s.depth < 100
  )
  select coalesce(array_agg(distinct node_id), '{}'::uuid[]) from subtree;
$$;

comment on function core_identity.acl_subtree_org_nodes_at(uuid, date) is
  'T9-supplement Step 3a (Codex V2 KRITISK 1): date-aware subtree-resolution baseret på org_node_versions + placements effective på p_date.';

create or replace function core_identity.acl_subtree_employees_at(
  p_employee_id uuid,
  p_date date
) returns uuid[]
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(array_agg(distinct p.employee_id), '{}'::uuid[])
  from core_identity.employee_node_placements p
  where p.node_id = any(core_identity.acl_subtree_org_nodes_at(p_employee_id, p_date))
    and p.effective_from <= p_date
    and (p.effective_to is null or p.effective_to > p_date);
$$;

comment on function core_identity.acl_subtree_employees_at(uuid, date) is
  'T9-supplement Step 3a: date-aware employees-i-subtree via acl_subtree_org_nodes_at.';

-- Wrapperne (current-helpers) refaktoreres til at kalde _at-version.
create or replace function core_identity.acl_subtree_org_nodes(p_employee_id uuid)
returns uuid[] language sql stable security invoker set search_path = '' as $$
  select core_identity.acl_subtree_org_nodes_at(p_employee_id, current_date);
$$;

create or replace function core_identity.acl_subtree_employees(p_employee_id uuid)
returns uuid[] language sql stable security invoker set search_path = '' as $$
  select core_identity.acl_subtree_employees_at(p_employee_id, current_date);
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION B — Backdated traversal i 7 apply-handlers (Step 2)
-- ═══════════════════════════════════════════════════════════════════════════
-- Codex V1 KRITISK 4 + V2 KRITISK 4. Split-at-boundary-mønster:
--   - no active interval at p_date → pre-history INSERT
--   - active.effective_from = p_date → UPDATE existing (exact-start; undgår
--     zero-length)
--   - active dækker p_date indre → split (UPDATE active.effective_to + INSERT
--     ny [p_date, gamle effective_to))
-- For close/remove: per-tabel branches:
--   - Placements: exact-start → DELETE (undgår zero-length)
--   - org_node_versions: exact-start → UPDATE is_active=false in-place

-- ─── _apply_employee_place (place-handler) ────────────────────────────────
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
  v_active record;
begin
  v_employee_id := (p_payload->>'employee_id')::uuid;
  v_node_id := (p_payload->>'node_id')::uuid;
  v_effective_from := (p_payload->>'effective_from')::date;

  if v_employee_id is null or v_node_id is null or v_effective_from is null then
    raise exception 'invalid_payload: employee_id + node_id + effective_from required'
      using errcode = '22023';
  end if;

  -- Verificér at node_id er IS_ACTIVE knude på v_effective_from.
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

  -- Find aktivt interval på v_effective_from for denne employee.
  select * into v_active
  from core_identity.employee_node_placements
  where employee_id = v_employee_id
    and effective_from <= v_effective_from
    and (effective_to is null or effective_to > v_effective_from)
  limit 1;

  if not found then
    -- Pre-history: INSERT ny med effective_to = tidligst efterfølgende interval (eller null).
    insert into core_identity.employee_node_placements
      (employee_id, node_id, effective_from, effective_to, created_by_pending_change_id)
    select v_employee_id, v_node_id, v_effective_from,
      (select min(effective_from) from core_identity.employee_node_placements
       where employee_id = v_employee_id and effective_from > v_effective_from),
      p_pending_change_id;
  elsif v_active.effective_from = v_effective_from then
    -- Exact-start: UPDATE existing (undgår zero-length).
    update core_identity.employee_node_placements
    set node_id = v_node_id,
        created_by_pending_change_id = coalesce(p_pending_change_id, created_by_pending_change_id),
        updated_at = now()
    where id = v_active.id;
  else
    -- Split: luk active, INSERT ny [v_effective_from, active.effective_to).
    update core_identity.employee_node_placements
    set effective_to = v_effective_from, updated_at = now()
    where id = v_active.id;

    insert into core_identity.employee_node_placements
      (employee_id, node_id, effective_from, effective_to, created_by_pending_change_id)
    values
      (v_employee_id, v_node_id, v_effective_from, v_active.effective_to, p_pending_change_id);
  end if;
end;
$$;

revoke execute on function core_identity._apply_employee_place(jsonb, uuid) from public, anon, authenticated;

-- ─── _apply_employee_remove (close-handler — placement-tabel) ─────────────
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
  v_active record;
begin
  v_employee_id := (p_payload->>'employee_id')::uuid;
  v_effective_from := (p_payload->>'effective_from')::date;

  if v_employee_id is null or v_effective_from is null then
    raise exception 'invalid_payload: employee_id + effective_from required'
      using errcode = '22023';
  end if;

  select * into v_active
  from core_identity.employee_node_placements
  where employee_id = v_employee_id
    and effective_from <= v_effective_from
    and (effective_to is null or effective_to > v_effective_from)
  limit 1;

  if not found then
    -- No active: idempotent no-op.
    return;
  elsif v_active.effective_from = v_effective_from then
    -- Exact-start: DELETE (undgår zero-length CHECK violation).
    delete from core_identity.employee_node_placements where id = v_active.id;
  elsif v_active.effective_to = v_effective_from then
    -- Exact-end boundary: idempotent no-op.
    return;
  else
    -- Split-close: UPDATE active.effective_to = v_effective_from.
    update core_identity.employee_node_placements
    set effective_to = v_effective_from, updated_at = now()
    where id = v_active.id;
  end if;
end;
$$;

revoke execute on function core_identity._apply_employee_remove(jsonb, uuid) from public, anon, authenticated;

-- ─── _apply_client_place (place-handler) ──────────────────────────────────
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
  v_active record;
begin
  v_client_id := (p_payload->>'client_id')::uuid;
  v_node_id := (p_payload->>'node_id')::uuid;
  v_effective_from := (p_payload->>'effective_from')::date;

  if v_client_id is null or v_node_id is null or v_effective_from is null then
    raise exception 'invalid_payload: client_id + node_id + effective_from required'
      using errcode = '22023';
  end if;

  -- Verificér node er team + aktiv på v_effective_from.
  if not exists (
    select 1 from core_identity.org_node_versions
    where node_id = v_node_id
      and node_type = 'team'
      and is_active = true
      and effective_from <= v_effective_from
      and (effective_to is null or effective_to > v_effective_from)
  ) then
    raise exception 'client_placement_requires_active_team: %', v_node_id
      using errcode = 'P0001';
  end if;

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
end;
$$;

revoke execute on function core_identity._apply_client_place(jsonb, uuid) from public, anon, authenticated;

-- ─── _apply_client_close (close-handler — placement-tabel) ────────────────
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
  v_active record;
begin
  v_client_id := (p_payload->>'client_id')::uuid;
  v_effective_from := (p_payload->>'effective_from')::date;

  if v_client_id is null or v_effective_from is null then
    raise exception 'invalid_payload: client_id + effective_from required'
      using errcode = '22023';
  end if;

  select * into v_active
  from core_identity.client_node_placements
  where client_id = v_client_id
    and effective_from <= v_effective_from
    and (effective_to is null or effective_to > v_effective_from)
  limit 1;

  if not found then
    return;
  elsif v_active.effective_from = v_effective_from then
    delete from core_identity.client_node_placements where id = v_active.id;
  elsif v_active.effective_to = v_effective_from then
    return;
  else
    update core_identity.client_node_placements
    set effective_to = v_effective_from, updated_at = now()
    where id = v_active.id;
  end if;
end;
$$;

revoke execute on function core_identity._apply_client_close(jsonb, uuid) from public, anon, authenticated;

-- ─── _apply_org_node_upsert (org_node_versions — split-at-boundary) ──────
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
  v_active record;
begin
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
    if v_node_id is null then
      v_node_id := gen_random_uuid();
    end if;
    insert into core_identity.org_nodes (id) values (v_node_id);

    -- Pre-history-INSERT: ingen tidligere versions for ny node.
    insert into core_identity.org_node_versions
      (node_id, name, parent_id, node_type, is_active, effective_from, effective_to, created_by_pending_change_id)
    values
      (v_node_id, v_name, v_parent_id, v_node_type, v_is_active, v_effective_from, null, p_pending_change_id);
    return;
  end if;

  -- EXISTING: find aktivt version på v_effective_from.
  select * into v_active
  from core_identity.org_node_versions
  where node_id = v_node_id
    and effective_from <= v_effective_from
    and (effective_to is null or effective_to > v_effective_from)
  limit 1;

  if not found then
    -- Pre-history for eksisterende node: INSERT med effective_to = min(efterfølgende).
    insert into core_identity.org_node_versions
      (node_id, name, parent_id, node_type, is_active, effective_from, effective_to, created_by_pending_change_id)
    select v_node_id, v_name, v_parent_id, v_node_type, v_is_active, v_effective_from,
      (select min(effective_from) from core_identity.org_node_versions
       where node_id = v_node_id and effective_from > v_effective_from),
      p_pending_change_id;
  elsif v_active.effective_from = v_effective_from then
    -- Exact-start: UPDATE existing (undgår zero-length).
    update core_identity.org_node_versions
    set name = v_name,
        parent_id = v_parent_id,
        node_type = v_node_type,
        is_active = v_is_active,
        created_by_pending_change_id = coalesce(p_pending_change_id, created_by_pending_change_id)
    where version_id = v_active.version_id;
  else
    -- Split: luk active, INSERT ny [v_effective_from, active.effective_to).
    update core_identity.org_node_versions
    set effective_to = v_effective_from
    where version_id = v_active.version_id;

    insert into core_identity.org_node_versions
      (node_id, name, parent_id, node_type, is_active, effective_from, effective_to, created_by_pending_change_id)
    values
      (v_node_id, v_name, v_parent_id, v_node_type, v_is_active, v_effective_from, v_active.effective_to, p_pending_change_id);
  end if;

  update core_identity.org_nodes set updated_at = now() where id = v_node_id;
end;
$$;

revoke execute on function core_identity._apply_org_node_upsert(jsonb, uuid) from public, anon, authenticated;

-- ─── _apply_org_node_deactivate (org_node_versions — close-handler) ──────
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
  v_active record;
begin
  v_node_id := (p_payload->>'node_id')::uuid;
  v_effective_from := (p_payload->>'effective_from')::date;

  if v_node_id is null or v_effective_from is null then
    raise exception 'invalid_payload: node_id + effective_from required'
      using errcode = '22023';
  end if;

  select * into v_active
  from core_identity.org_node_versions
  where node_id = v_node_id
    and effective_from <= v_effective_from
    and (effective_to is null or effective_to > v_effective_from)
  limit 1;

  if not found then
    raise exception 'org_node_no_active_version_at: % på %', v_node_id, v_effective_from
      using errcode = 'P0002';
  end if;

  if not v_active.is_active then
    -- Allerede inactive: idempotent no-op.
    return;
  end if;

  if v_active.effective_from = v_effective_from then
    -- Exact-start: UPDATE in-place (undgår zero-length).
    update core_identity.org_node_versions
    set is_active = false,
        created_by_pending_change_id = coalesce(p_pending_change_id, created_by_pending_change_id)
    where version_id = v_active.version_id;
  else
    -- Split: luk active, INSERT ny [v_effective_from, active.effective_to) med is_active=false.
    update core_identity.org_node_versions
    set effective_to = v_effective_from
    where version_id = v_active.version_id;

    insert into core_identity.org_node_versions
      (node_id, name, parent_id, node_type, is_active, effective_from, effective_to, created_by_pending_change_id)
    values
      (v_node_id, v_active.name, v_active.parent_id, v_active.node_type, false, v_effective_from, v_active.effective_to, p_pending_change_id);
  end if;

  update core_identity.org_nodes set updated_at = now() where id = v_node_id;
end;
$$;

revoke execute on function core_identity._apply_org_node_deactivate(jsonb, uuid) from public, anon, authenticated;

-- ─── _apply_team_close (orchestrerer org-node-deactivate + placement-cascade) ─
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

  if not found then
    raise exception 'team_close_no_active_version_at: % på %', v_node_id, v_effective_from
      using errcode = 'P0002';
  end if;

  if v_active.node_type <> 'team' then
    raise exception 'team_close_not_team: % er %', v_node_id, v_active.node_type
      using errcode = '22023';
  end if;

  if not v_active.is_active then
    raise exception 'team_close_already_inactive: %', v_node_id
      using errcode = '22023';
  end if;

  -- Deaktivér team-version via split-at-boundary.
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

  -- Cascade: luk alle employee-placements aktive på v_effective_from for team.
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

  -- Cascade: luk alle client-placements aktive på v_effective_from for team.
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

  update core_identity.org_nodes set updated_at = now() where id = v_node_id;
end;
$$;

revoke execute on function core_identity._apply_team_close(jsonb, uuid) from public, anon, authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION C2 — Udvidet SELECT-policy på client_node_placements (Step 3b)
-- ═══════════════════════════════════════════════════════════════════════════
-- Codex V2 KRITISK 2 fix. Nuværende policy `using (is_admin())` blokerer
-- non-admin reads før RPC kan filtrere. V4-fix: bruger session-var
-- stork.t9_read_at_date (default current_date) som date-parameter til ACL.

drop policy if exists client_node_placements_select on core_identity.client_node_placements;

create policy client_node_placements_select on core_identity.client_node_placements
  for select to authenticated
  using (
    core_identity.is_admin()
    or node_id = ANY(
      core_identity.acl_subtree_org_nodes_at(
        core_identity.current_employee_id(),
        coalesce(
          nullif(current_setting('stork.t9_read_at_date', true), '')::date,
          current_date
        )
      )
    )
  );

comment on policy client_node_placements_select on core_identity.client_node_placements is
  'T9-supplement Step 3b: superadmin ser alt; ellers scoped via acl_subtree_org_nodes_at med session-var stork.t9_read_at_date (default current_date).';

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION C3 — 9 read-RPCs med _require_read_permission + session-var (Step 3c)
-- ═══════════════════════════════════════════════════════════════════════════
-- V3 KRITISK 1 + V4 OPGRADERING 1 fix. Alle 9 RPCs er plpgsql; alle
-- entrypoints sætter set_config('stork.t9_read_at_date', ...::text, true)
-- eksplicit FØR SELECT for deterministisk adfærd uafhængigt af tx-state.

-- Intern helper: raise 42501 hvis caller mangler relevant read-permission.
create or replace function core_identity._require_read_permission(
  p_page text,
  p_tab text
) returns void
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if not core_identity.has_permission(p_page, p_tab, false) then
    raise exception 'permission_denied: %/%/can_view', p_page, p_tab
      using errcode = '42501';
  end if;
end;
$$;

comment on function core_identity._require_read_permission(text, text) is
  'T9-supplement Step 3c: intern helper for admin-only read-RPCs. Raiser 42501 hvis has_permission(p_page, p_tab, false) returnerer false.';

-- ─── Admin-only RPCs: permission_elements_read + role_permissions_read ────
create or replace function core_identity.permission_elements_read()
returns table (
  area_id uuid,
  area_name text,
  area_is_active boolean,
  area_sort_order integer,
  page_id uuid,
  page_name text,
  page_is_active boolean,
  page_sort_order integer,
  tab_id uuid,
  tab_name text,
  tab_is_active boolean,
  tab_sort_order integer
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  perform core_identity._require_read_permission('permissions', 'manage');

  return query
  select
    a.id, a.name, a.is_active, a.sort_order,
    p.id, p.name, p.is_active, p.sort_order,
    t.id, t.name, t.is_active, t.sort_order
  from core_identity.permission_areas a
  left join core_identity.permission_pages p on p.area_id = a.id
  left join core_identity.permission_tabs t on t.page_id = p.id
  order by a.sort_order, a.name, p.sort_order, p.name, t.sort_order, t.name;
end;
$$;

revoke execute on function core_identity.permission_elements_read() from public, anon;
grant execute on function core_identity.permission_elements_read() to authenticated;

create or replace function core_identity.role_permissions_read(p_role_id uuid)
returns table (
  grant_id uuid,
  area_id uuid,
  page_id uuid,
  tab_id uuid,
  can_access boolean,
  can_write boolean,
  visibility text
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  perform core_identity._require_read_permission('permissions', 'manage');

  return query
  select g.id, g.area_id, g.page_id, g.tab_id, g.can_access, g.can_write, g.visibility
  from core_identity.role_permission_grants g
  where g.role_id = p_role_id;
end;
$$;

revoke execute on function core_identity.role_permissions_read(uuid) from public, anon;
grant execute on function core_identity.role_permissions_read(uuid) to authenticated;

-- ─── Visibility-RPCs: org_tree_read_at + current-wrapper ─────────────────
create or replace function core_identity.org_tree_read_at(p_date date)
returns table (
  node_id uuid,
  name text,
  parent_id uuid,
  node_type text,
  is_active boolean
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  -- Eksplicit session-var-set (V4 OPGRADERING 1 — deterministisk).
  perform set_config('stork.t9_read_at_date', p_date::text, true);

  return query
  select distinct on (v.node_id)
    v.node_id, v.name, v.parent_id, v.node_type, v.is_active
  from core_identity.org_node_versions v
  where v.effective_from <= p_date
    and (v.effective_to is null or v.effective_to > p_date)
    and (
      core_identity.is_admin()
      or v.node_id = ANY(core_identity.acl_subtree_org_nodes_at(core_identity.current_employee_id(), p_date))
    )
  order by v.node_id, v.effective_from desc;
end;
$$;

revoke execute on function core_identity.org_tree_read_at(date) from public, anon;
grant execute on function core_identity.org_tree_read_at(date) to authenticated;

create or replace function core_identity.org_tree_read()
returns table (
  node_id uuid,
  name text,
  parent_id uuid,
  node_type text,
  is_active boolean
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  -- Eksplicit session-var-set i current-wrapper (V4 OPGRADERING 1).
  perform set_config('stork.t9_read_at_date', current_date::text, true);
  return query select * from core_identity.org_tree_read_at(current_date);
end;
$$;

revoke execute on function core_identity.org_tree_read() from public, anon;
grant execute on function core_identity.org_tree_read() to authenticated;

-- ─── Visibility-RPCs: employee_placement_read_at + current-wrapper ───────
create or replace function core_identity.employee_placement_read_at(
  p_employee_id uuid,
  p_date date
) returns table (
  placement_id uuid,
  node_id uuid,
  effective_from date,
  effective_to date
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  perform set_config('stork.t9_read_at_date', p_date::text, true);

  return query
  select p.id, p.node_id, p.effective_from, p.effective_to
  from core_identity.employee_node_placements p
  where p.employee_id = p_employee_id
    and p.effective_from <= p_date
    and (p.effective_to is null or p.effective_to > p_date)
    and (
      core_identity.is_admin()
      or p_employee_id = core_identity.current_employee_id()  -- self altid synlig
      or p_employee_id = ANY(core_identity.acl_subtree_employees_at(core_identity.current_employee_id(), p_date))
    );
end;
$$;

revoke execute on function core_identity.employee_placement_read_at(uuid, date) from public, anon;
grant execute on function core_identity.employee_placement_read_at(uuid, date) to authenticated;

create or replace function core_identity.employee_placement_read(p_employee_id uuid)
returns table (
  placement_id uuid,
  node_id uuid,
  effective_from date,
  effective_to date
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  perform set_config('stork.t9_read_at_date', current_date::text, true);
  return query select * from core_identity.employee_placement_read_at(p_employee_id, current_date);
end;
$$;

revoke execute on function core_identity.employee_placement_read(uuid) from public, anon;
grant execute on function core_identity.employee_placement_read(uuid) to authenticated;

-- ─── Visibility-RPCs: client_placement_read_at + current-wrapper ─────────
create or replace function core_identity.client_placement_read_at(
  p_client_id uuid,
  p_date date
) returns table (
  placement_id uuid,
  node_id uuid,
  effective_from date,
  effective_to date
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  perform set_config('stork.t9_read_at_date', p_date::text, true);

  return query
  select p.id, p.node_id, p.effective_from, p.effective_to
  from core_identity.client_node_placements p
  where p.client_id = p_client_id
    and p.effective_from <= p_date
    and (p.effective_to is null or p.effective_to > p_date);
  -- RLS-policy håndhæver scope via samme session-var.
end;
$$;

revoke execute on function core_identity.client_placement_read_at(uuid, date) from public, anon;
grant execute on function core_identity.client_placement_read_at(uuid, date) to authenticated;

create or replace function core_identity.client_placement_read(p_client_id uuid)
returns table (
  placement_id uuid,
  node_id uuid,
  effective_from date,
  effective_to date
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  perform set_config('stork.t9_read_at_date', current_date::text, true);
  return query select * from core_identity.client_placement_read_at(p_client_id, current_date);
end;
$$;

revoke execute on function core_identity.client_placement_read(uuid) from public, anon;
grant execute on function core_identity.client_placement_read(uuid) to authenticated;

-- ─── Visibility-RPC: pending_changes_read ────────────────────────────────
create or replace function core_identity.pending_changes_read()
returns table (
  id uuid,
  change_type text,
  target_id uuid,
  payload jsonb,
  effective_from date,
  requested_by uuid,
  requested_at timestamptz,
  approved_by uuid,
  approved_at timestamptz,
  undo_deadline timestamptz,
  applied_at timestamptz,
  undone_at timestamptz,
  status text
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  -- pending_changes_select-policy fra PR #39 håndhæver scope via change_type →
  -- page_key-mapping. RPC selv har ingen ekstra filter.
  perform set_config('stork.t9_read_at_date', current_date::text, true);

  return query
  select pc.id, pc.change_type, pc.target_id, pc.payload, pc.effective_from,
         pc.requested_by, pc.requested_at, pc.approved_by, pc.approved_at,
         pc.undo_deadline, pc.applied_at, pc.undone_at, pc.status
  from core_identity.pending_changes pc;
end;
$$;

revoke execute on function core_identity.pending_changes_read() from public, anon;
grant execute on function core_identity.pending_changes_read() to authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION D — Step 12 robusthed DO-block (Step 4)
-- ═══════════════════════════════════════════════════════════════════════════
-- Idempotent: sikrer superadmin findes + mg@/km@ har role_id = superadmin.
-- mg@/km@ er produktets bootstrap-seed (ikke test-fixture; G053 forbyder kun
-- seed-users som mutable fixtures i DB-tests, ikke seed-migrations).

do $robust$
declare
  v_superadmin_role_id uuid;
  v_mg_id uuid;
  v_km_id uuid;
begin
  select id into v_superadmin_role_id from core_identity.roles where name = 'superadmin';
  if v_superadmin_role_id is null then
    raise exception 'T9-supplement SETUP FAIL: superadmin-rolle findes ikke (forventet seedet via R1B)';
  end if;

  select id into v_mg_id from core_identity.employees where email = 'mg@copenhagensales.dk';
  select id into v_km_id from core_identity.employees where email = 'km@copenhagensales.dk';

  if v_mg_id is null or v_km_id is null then
    raise exception 'T9-supplement SETUP FAIL: bootstrap-employees mg@/km@ findes ikke';
  end if;

  -- Idempotent: sikrer role_id matcher superadmin. Bootstrap-seed undtagelse;
  -- ikke i konflikt med G053 (G053 forbyder seed-users som mutable fixtures
  -- i DB-tests, ikke i seed-migrations).
  perform set_config('stork.allow_employees_write', 'true', false);
  update core_identity.employees
  set role_id = v_superadmin_role_id, updated_at = now()
  where id in (v_mg_id, v_km_id) and role_id is distinct from v_superadmin_role_id;
end;
$robust$;
