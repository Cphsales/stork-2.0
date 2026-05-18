-- T9 Fundament-supplement (2026-05-18).
--
-- IMPLEMENTERER §1.1's session-var-pattern på T9-write-veje:
--   "Hver mutation-RPC sætter session-variabel der signalerer 'denne RPC har
--    autoriseret skrivning'; INSERT/UPDATE-policies kræver variablen sat"
--
-- T9 byggede write-RPCs som SECURITY INVOKER (korrekt per §1.1) men droppede
-- session-var-pattern + write-policies. Konsekvens: write-RPCs fejler under
-- FORCE RLS når authenticated kalder dem. Pre-T9 fulgte mønsteret (R1B's
-- stork.allow_roles_write, P1a's stork.bootstrap_activation, osv.).
--
-- Reference: docs/coordination/mathias-afgoerelser.md (2026-05-18 entry)
-- + master-plan §1.7 update (samme PR).
--
-- Scope (eksplicit Mathias-bekræftet):
-- - 6 write-tabeller får INSERT + UPDATE policies med t9_write_authorized-check
-- - 11 write-RPCs får perform set_config('stork.t9_write_authorized', 'true', true)
--   EFTER has_permission-check (defense-in-depth: permission FØR write-autorisation)
--
-- IKKE i denne PR (senere supplement-PR):
-- - KRITISK 1 Team-retype trigger-fix
-- - KRITISK 4 Backdated effective_from guards på 5 apply-handlers
-- - KRITISK 3 API/schema exposure (kræver Mathias Dashboard-handling)
-- - Type-codegen, Read-RPC gates, Step 12 superadmin-robusthed

-- ─── DEL 1: Policies på 6 write-tabeller ──────────────────────────────────
--
-- Pattern: INSERT-policy med WITH CHECK + UPDATE-policy med USING.
-- Begge kræver current_setting('stork.t9_write_authorized', true) = 'true'.
-- Tredje arg til current_setting('...', true) returnerer NULL hvis var ikke
-- er sat — koalescerer til false i bool-sammenligning.

-- 1.1 pending_changes
create policy pending_changes_insert on core_identity.pending_changes
  for insert to authenticated
  with check (current_setting('stork.t9_write_authorized', true) = 'true');

create policy pending_changes_update on core_identity.pending_changes
  for update to authenticated
  using (current_setting('stork.t9_write_authorized', true) = 'true');

-- 1.2 undo_settings
create policy undo_settings_insert on core_identity.undo_settings
  for insert to authenticated
  with check (current_setting('stork.t9_write_authorized', true) = 'true');

create policy undo_settings_update on core_identity.undo_settings
  for update to authenticated
  using (current_setting('stork.t9_write_authorized', true) = 'true');

-- 1.3 permission_areas
create policy permission_areas_insert on core_identity.permission_areas
  for insert to authenticated
  with check (current_setting('stork.t9_write_authorized', true) = 'true');

create policy permission_areas_update on core_identity.permission_areas
  for update to authenticated
  using (current_setting('stork.t9_write_authorized', true) = 'true');

-- 1.4 permission_pages
create policy permission_pages_insert on core_identity.permission_pages
  for insert to authenticated
  with check (current_setting('stork.t9_write_authorized', true) = 'true');

create policy permission_pages_update on core_identity.permission_pages
  for update to authenticated
  using (current_setting('stork.t9_write_authorized', true) = 'true');

-- 1.5 permission_tabs
create policy permission_tabs_insert on core_identity.permission_tabs
  for insert to authenticated
  with check (current_setting('stork.t9_write_authorized', true) = 'true');

create policy permission_tabs_update on core_identity.permission_tabs
  for update to authenticated
  using (current_setting('stork.t9_write_authorized', true) = 'true');

-- 1.6 role_permission_grants
-- NOTE: Eneste T9-tabel der får DELETE-policy. Verificeret: pending_changes /
-- undo_settings / permission_areas / permission_pages / permission_tabs har
-- ingen DELETE-veje (kun status-update + deactivate-flag-mønster). Kun
-- role_permission_grant_remove udfører faktisk DELETE under FORCE RLS fra
-- authenticated-kontekst.
create policy role_permission_grants_insert on core_identity.role_permission_grants
  for insert to authenticated
  with check (current_setting('stork.t9_write_authorized', true) = 'true');

create policy role_permission_grants_update on core_identity.role_permission_grants
  for update to authenticated
  using (current_setting('stork.t9_write_authorized', true) = 'true');

create policy role_permission_grants_delete on core_identity.role_permission_grants
  for delete to authenticated
  using (current_setting('stork.t9_write_authorized', true) = 'true');

-- ─── DEL 2: 11 write-RPCs får session-var pattern ─────────────────────────
--
-- Pattern per RPC:
--   1. has_permission-check (defense-in-depth, FØR autorisation)
--   2. perform set_config('stork.t9_write_authorized', 'true', true)
--      (true = local til transaktion; var lækker ikke)
--   3. Eksisterende set_config'er for audit (stork.source_type, stork.change_reason)
--   4. Selve INSERT/UPDATE

-- 2.1 pending_change_approve (Step 1, UPDATE pending_changes)
--
-- Mathias 2026-05-19 (T9-omstart-rammen punkt 12): Approve er ikke ny adgang.
-- Den er can_edit på den ressource som pending change rammer. Hvis bruger har
-- can_edit=true på org_træ-area, må vedkommende også approve en pending change
-- der ændrer org_træ.
--
-- Dispatcher-mapping change_type → has_permission(page_key, can_edit=true):
--   org_node_upsert     → 'org_nodes'           (struktur-ændring af knude)
--   org_node_deactivate → 'org_nodes'           (struktur-ændring af knude)
--   team_close          → 'org_nodes'           (lukker team-knude — struktur)
--   employee_place      → 'employee_placements' (medarbejder-placering)
--   employee_remove     → 'employee_placements' (medarbejder-placering)
--   client_place        → 'client_placements'   (klient-placering)
--   client_close        → 'client_placements'   (klient-placering)
--
-- Mappingen er system-mekanik (kode-logik), IKKE UI-styret data. Samme princip
-- som apply-handlers' dispatcher per change_type. Mappingen er udtømmende;
-- ukendt change_type raiser exception.
--
-- is_admin() self-approve-undtagelsen bevares: en admin kan approve sin egen
-- request (§1.1's undtagelse for bootstrap-flows).
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
  v_page_key text;
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

  -- Dispatcher: map change_type → underliggende ressource (page_key).
  -- Approve af pending change kræver can_edit på samme page som ændringen rammer.
  case v_change.change_type
    when 'org_node_upsert'     then v_page_key := 'org_nodes';
    when 'org_node_deactivate' then v_page_key := 'org_nodes';
    when 'team_close'          then v_page_key := 'org_nodes';
    when 'employee_place'      then v_page_key := 'employee_placements';
    when 'employee_remove'     then v_page_key := 'employee_placements';
    when 'client_place'        then v_page_key := 'client_placements';
    when 'client_close'        then v_page_key := 'client_placements';
    else
      raise exception 'unknown_change_type for approve-gate: %', v_change.change_type
        using errcode = '42883';
  end case;

  if not core_identity.has_permission(v_page_key, null, true) then
    raise exception 'permission_denied: approve % kræver can_edit på %', v_change.change_type, v_page_key
      using errcode = '42501';
  end if;

  if v_change.requested_by = v_approver and not core_identity.is_admin() then
    raise exception 'pending_change_self_approve_forbidden'
      using errcode = '42501', hint = 'requester må ikke selv approve (medmindre admin)';
  end if;

  select undo_period_seconds into v_undo_period
  from core_identity.undo_settings
  where change_type = v_change.change_type;

  if v_undo_period is null then
    v_undo_period := 24 * 3600;
  end if;

  perform set_config('stork.t9_write_authorized', 'true', true);
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
revoke execute on function core_identity.pending_change_approve(uuid) from public, anon;

-- 2.2 pending_change_undo (Step 1, UPDATE pending_changes)
--
-- Undo af pending change kræver samme can_edit-rettighed på underliggende
-- ressource som approve af samme change. Dispatcher-mapping identisk med
-- pending_change_approve.
create or replace function core_identity.pending_change_undo(
  p_change_id uuid
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_change record;
  v_page_key text;
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

  -- Dispatcher: samme mapping som pending_change_approve.
  case v_change.change_type
    when 'org_node_upsert'     then v_page_key := 'org_nodes';
    when 'org_node_deactivate' then v_page_key := 'org_nodes';
    when 'team_close'          then v_page_key := 'org_nodes';
    when 'employee_place'      then v_page_key := 'employee_placements';
    when 'employee_remove'     then v_page_key := 'employee_placements';
    when 'client_place'        then v_page_key := 'client_placements';
    when 'client_close'        then v_page_key := 'client_placements';
    else
      raise exception 'unknown_change_type for undo-gate: %', v_change.change_type
        using errcode = '42883';
  end case;

  if not core_identity.has_permission(v_page_key, null, true) then
    raise exception 'permission_denied: undo % kræver can_edit på %', v_change.change_type, v_page_key
      using errcode = '42501';
  end if;

  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'pending_change_undo', true);

  update core_identity.pending_changes
  set status = 'undone',
      undone_at = now(),
      updated_at = now()
  where id = p_change_id;
end;
$$;
revoke execute on function core_identity.pending_change_undo(uuid) from public, anon;

-- 2.3 undo_setting_update (Step 1, INSERT/UPDATE undo_settings)
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

  perform set_config('stork.t9_write_authorized', 'true', true);
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
revoke execute on function core_identity.undo_setting_update(text, integer) from public, anon;

-- 2.4 permission_area_upsert (Step 6, INSERT/UPDATE permission_areas)
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

  perform set_config('stork.t9_write_authorized', 'true', true);
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

-- 2.5 permission_area_deactivate (Step 6, UPDATE permission_areas)
create or replace function core_identity.permission_area_deactivate(p_area_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'permission_area_deactivate', true);
  update core_identity.permission_areas set is_active = false, updated_at = now() where id = p_area_id;
end; $$;
revoke execute on function core_identity.permission_area_deactivate(uuid) from public, anon;

-- 2.6 permission_page_upsert (Step 6)
create or replace function core_identity.permission_page_upsert(
  p_id uuid, p_area_id uuid, p_name text,
  p_is_active boolean default true, p_sort_order integer default 0
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_id uuid;
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.t9_write_authorized', 'true', true);
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

-- 2.7 permission_page_deactivate (Step 6)
create or replace function core_identity.permission_page_deactivate(p_page_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'permission_page_deactivate', true);
  update core_identity.permission_pages set is_active = false, updated_at = now() where id = p_page_id;
end; $$;
revoke execute on function core_identity.permission_page_deactivate(uuid) from public, anon;

-- 2.8 permission_tab_upsert (Step 6)
create or replace function core_identity.permission_tab_upsert(
  p_id uuid, p_page_id uuid, p_name text,
  p_is_active boolean default true, p_sort_order integer default 0
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_id uuid;
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.t9_write_authorized', 'true', true);
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

-- 2.9 permission_tab_deactivate (Step 6)
create or replace function core_identity.permission_tab_deactivate(p_tab_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'permission_tab_deactivate', true);
  update core_identity.permission_tabs set is_active = false, updated_at = now() where id = p_tab_id;
end; $$;
revoke execute on function core_identity.permission_tab_deactivate(uuid) from public, anon;

-- 2.10 role_permission_grant_set (Step 7, INSERT/UPDATE role_permission_grants)
create or replace function core_identity.role_permission_grant_set(
  p_role_id uuid,
  p_element_type text,
  p_element_id uuid,
  p_can_access boolean,
  p_can_write boolean,
  p_visibility text
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  v_id uuid;
  v_area_id uuid;
  v_page_id uuid;
  v_tab_id uuid;
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;

  if p_element_type = 'area' then v_area_id := p_element_id;
  elsif p_element_type = 'page' then v_page_id := p_element_id;
  elsif p_element_type = 'tab' then v_tab_id := p_element_id;
  else raise exception 'invalid_element_type: %', p_element_type using errcode = '22023';
  end if;

  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'role_permission_grant_set', true);

  insert into core_identity.role_permission_grants
    (role_id, area_id, page_id, tab_id, can_access, can_write, visibility)
  values
    (p_role_id, v_area_id, v_page_id, v_tab_id, p_can_access, p_can_write, p_visibility)
  on conflict (role_id, coalesce(area_id::text, ''), coalesce(page_id::text, ''), coalesce(tab_id::text, ''))
  do update set
    can_access = excluded.can_access,
    can_write = excluded.can_write,
    visibility = excluded.visibility,
    updated_at = now()
  returning id into v_id;

  return v_id;
end; $$;
revoke execute on function core_identity.role_permission_grant_set(uuid, text, uuid, boolean, boolean, text) from public, anon;

-- 2.11 role_permission_grant_remove (Step 7, DELETE role_permission_grants)
-- NOTE: DELETE-policy ikke i Mathias' scope (kun INSERT + UPDATE).
-- DELETE-operation vil fortsætte med at fungere fra superadmin/postgres
-- direkte men kan fejle fra authenticated. Hvis CI viser det: separat fix.
create or replace function core_identity.role_permission_grant_remove(
  p_role_id uuid,
  p_element_type text,
  p_element_id uuid
) returns void language plpgsql security invoker set search_path = '' as $$
begin
  if not core_identity.has_permission('permissions', 'manage', true) then
    raise exception 'permission_denied' using errcode = '42501';
  end if;
  perform set_config('stork.t9_write_authorized', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'role_permission_grant_remove', true);

  if p_element_type = 'area' then
    delete from core_identity.role_permission_grants where role_id = p_role_id and area_id = p_element_id;
  elsif p_element_type = 'page' then
    delete from core_identity.role_permission_grants where role_id = p_role_id and page_id = p_element_id;
  elsif p_element_type = 'tab' then
    delete from core_identity.role_permission_grants where role_id = p_role_id and tab_id = p_element_id;
  else
    raise exception 'invalid_element_type: %', p_element_type using errcode = '22023';
  end if;
end; $$;
revoke execute on function core_identity.role_permission_grant_remove(uuid, text, uuid) from public, anon;
