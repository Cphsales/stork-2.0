-- Trin 10 T10.15: client active-check smoke-test (V7 + V10 + V13 + V14)
--
-- ROLLE-SWAP-PATTERN (Codex build-review 3 LØS, Mathias-afgørelse 2026-05-21):
-- brug eksisterende auth-backed superadmins (Kasper + Mathias) som test-brugere.
-- Swap deres role_id midlertidigt til ny non-admin rolle for at simulere
-- non-admin-context i wrapper-flow. ROLLBACK restorer ved test-slut.
--
-- ADMIN-FLOOR: opret buffer-admin (employee uden auth, superadmin-rolle) FØR
-- rolle-swap så enforce_admin_floor altid har mindst 1 aktiv admin.
--
-- Tests:
--   T1: superadmin → wrapper place aktiv klient → success
--   T2: non-admin → wrapper place på inaktiv klient → 22023
--   T3: non-admin requester + non-admin approver → apply efter inaktivering → P0001
--   T4: superadmin → wrapper close inaktiv klient → success (ingen aktiv-check)
--   T4a: superadmin → wrapper close non-existent → P0002
--   T5: superadmin → wrapper place på inaktiv → success (is_admin-bypass)
--   T6: superadmin → opret pending → deaktiver klient → admin approver → apply → success (requester-bypass)
--   T7: non-admin requester + admin approver → apply efter inaktivering → success (approver-bypass)

begin;

select set_config('stork.source_type', 'manual', true);
select set_config('stork.change_reason', 'T10 active-check smoke setup', true);
select set_config('stork.t9_write_authorized', 'true', true);

-- Drop undo-period så vi kan apply direkte
update core_identity.undo_settings
  set undo_period_seconds = 0
  where change_type in ('client_place', 'client_close');

do $test$
declare
  v_superadmin_role_id uuid;
  v_admin_a_id uuid;        -- Kasper (swappes til non-admin)
  v_admin_a_auth uuid;
  v_admin_a_orig_role uuid;
  v_admin_b_id uuid;        -- Mathias (swappes/restoreres)
  v_admin_b_auth uuid;
  v_admin_b_orig_role uuid;
  v_buffer_admin_id uuid;
  v_non_admin_role_id uuid;
  v_uuid_suffix text;
  v_team_node_id uuid := gen_random_uuid();
  v_root_id uuid := gen_random_uuid();
  v_client_active_id uuid;
  v_client_inactive_id uuid;
  v_client_t3 uuid;
  v_client_t6 uuid;
  v_client_t7 uuid;
  v_pending_id uuid;
  v_caught text;
begin
  v_uuid_suffix := replace(gen_random_uuid()::text, '-', '');

  -- ──────────────────────────────────────────────────────────────────────
  -- SETUP A: find 2 auth-backed superadmins
  -- ──────────────────────────────────────────────────────────────────────
  select id into v_superadmin_role_id from core_identity.roles where name = 'superadmin';

  select e.id, e.auth_user_id, e.role_id
    into v_admin_a_id, v_admin_a_auth, v_admin_a_orig_role
  from core_identity.employees e
  join core_identity.roles r on r.id = e.role_id
  where r.name = 'superadmin' and e.auth_user_id is not null
    and core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
  order by e.first_name limit 1;

  select e.id, e.auth_user_id, e.role_id
    into v_admin_b_id, v_admin_b_auth, v_admin_b_orig_role
  from core_identity.employees e
  join core_identity.roles r on r.id = e.role_id
  where r.name = 'superadmin' and e.auth_user_id is not null
    and core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
    and e.id <> v_admin_a_id
  order by e.first_name limit 1;

  if v_admin_a_id is null or v_admin_b_id is null then
    raise exception 'SETUP FAIL: kræver 2 auth-backed superadmins (fandt A=% B=%)',
      v_admin_a_id, v_admin_b_id;
  end if;

  -- ──────────────────────────────────────────────────────────────────────
  -- SETUP B: org-tree (team til wrapper-placement)
  -- ──────────────────────────────────────────────────────────────────────
  perform set_config('stork.allow_org_nodes_write', 'true', true);
  insert into core_identity.org_nodes (id) values (v_team_node_id), (v_root_id);
  perform set_config('stork.allow_org_node_versions_write', 'true', true);
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
  values (v_team_node_id, 't10-active team ' || v_uuid_suffix, v_root_id, 'team', true, current_date - 5);

  -- ──────────────────────────────────────────────────────────────────────
  -- SETUP C: 2 buffer-admins (uden auth) — sikrer admin-floor (min 2) under
  -- samtidig swap af BÅDE Kasper og Mathias i T3
  -- ──────────────────────────────────────────────────────────────────────
  perform set_config('stork.allow_employees_write', 'true', true);
  insert into core_identity.employees (first_name, last_name, email, role_id)
  values ('BufferAdmin1', 't10_' || v_uuid_suffix,
          'buffer_admin_1_' || v_uuid_suffix || '@test.invalid', v_superadmin_role_id)
  returning id into v_buffer_admin_id;

  insert into core_identity.employees (first_name, last_name, email, role_id)
  values ('BufferAdmin2', 't10_' || v_uuid_suffix,
          'buffer_admin_2_' || v_uuid_suffix || '@test.invalid', v_superadmin_role_id);

  -- ──────────────────────────────────────────────────────────────────────
  -- SETUP D: non-admin rolle med grant-model rows (clients + client_placements)
  -- ──────────────────────────────────────────────────────────────────────
  perform set_config('stork.allow_roles_write', 'true', true);
  insert into core_identity.roles (name, description)
  values ('t10_active_normal_' || v_uuid_suffix, 'T10 active-check non-admin test role')
  returning id into v_non_admin_role_id;

  -- Tab-grants for clients/manage + client_field_definitions/manage (eksisterer i grant-model).
  insert into core_identity.role_permission_grants
    (role_id, area_id, page_id, tab_id, can_access, can_write, visibility)
  select v_non_admin_role_id, null, null, t.id, true, true, 'all'
  from core_identity.permission_tabs t
  join core_identity.permission_pages p on p.id = t.page_id
  where p.name in ('clients','client_field_definitions') and t.name = 'manage';

  -- Page-grant for client_placements: har ingen tabs, så has_permission falder
  -- igennem til page-niveau (superadmin dækker via area-grant for org_structure).
  -- Vi giver eksplicit page-grant her uden at give area-grant.
  insert into core_identity.role_permission_grants
    (role_id, area_id, page_id, tab_id, can_access, can_write, visibility)
  select v_non_admin_role_id, null, p.id, null, true, true, 'all'
  from core_identity.permission_pages p
  where p.name = 'client_placements';

  -- ──────────────────────────────────────────────────────────────────────
  -- SETUP E: opret aktiv + inaktiv test-klient (som superadmin)
  -- ──────────────────────────────────────────────────────────────────────
  perform set_config('request.jwt.claim.sub', v_admin_a_auth::text, true);

  v_client_active_id := core_identity.client_upsert(
    'T10-active aktiv ' || v_uuid_suffix, '{}'::jsonb,
    'T10 setup: aktiv klient', true, null);

  v_client_inactive_id := core_identity.client_upsert(
    'T10-active inaktiv ' || v_uuid_suffix, '{}'::jsonb,
    'T10 setup: inaktiv klient', false, null);

  v_client_t3 := core_identity.client_upsert(
    'T10-active T3 ' || v_uuid_suffix, '{}'::jsonb,
    'T10 setup: T3 klient (aktiv → deaktiveres)', true, null);

  v_client_t6 := core_identity.client_upsert(
    'T10-active T6 ' || v_uuid_suffix, '{}'::jsonb,
    'T10 setup: T6 klient (aktiv → deaktiveres)', true, null);

  v_client_t7 := core_identity.client_upsert(
    'T10-active T7 ' || v_uuid_suffix, '{}'::jsonb,
    'T10 setup: T7 klient (aktiv → deaktiveres)', true, null);

  -- ══════════════════════════════════════════════════════════════════════
  -- T1: superadmin → wrapper place aktiv klient → approve → cron-apply → placement
  -- ══════════════════════════════════════════════════════════════════════
  v_pending_id := core_identity.client_node_place(
    v_client_active_id, v_team_node_id, current_date);
  if v_pending_id is null then
    raise exception 'T1 FAIL: client_node_place returnerede NULL';
  end if;
  -- Approve som anden admin (self-approve OK for admin alligevel, men bedre praksis)
  perform set_config('request.jwt.claim.sub', v_admin_b_auth::text, true);
  perform core_identity.pending_change_approve(v_pending_id);
  -- Cron-apply: rens jwt så auth.uid() = NULL (V10 fix-validerings-path)
  perform set_config('request.jwt.claim.sub', '', true);
  perform core_identity.pending_change_apply(v_pending_id);
  if not exists (
    select 1 from core_identity.client_node_placements
    where client_id = v_client_active_id and node_id = v_team_node_id
  ) then
    raise exception 'T1 FAIL: end-to-end apply skal placere klient';
  end if;

  -- ══════════════════════════════════════════════════════════════════════
  -- ROLLE-SWAP: Kasper → non-admin (1 admin tabt; buffer + Mathias = 2 admins)
  -- ══════════════════════════════════════════════════════════════════════
  perform set_config('stork.allow_employees_write', 'true', true);
  update core_identity.employees set role_id = v_non_admin_role_id where id = v_admin_a_id;

  -- ══════════════════════════════════════════════════════════════════════
  -- T2: non-admin (Kasper-swap) → wrapper place på inaktiv → 22023
  -- ══════════════════════════════════════════════════════════════════════
  perform set_config('request.jwt.claim.sub', v_admin_a_auth::text, true);
  begin
    v_caught := null;
    perform core_identity.client_node_place(v_client_inactive_id, v_team_node_id, current_date);
  exception when sqlstate '22023' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T2 FAIL: non-admin på inaktiv klient skal raise 22023 (client_inactive)';
  end if;

  -- ══════════════════════════════════════════════════════════════════════
  -- T3: non-admin requester + non-admin approver → apply på inaktiveret → P0001
  -- ══════════════════════════════════════════════════════════════════════
  -- Step 1: opret pending mens klient er ACTIVE (non-admin requester = Kasper)
  v_pending_id := core_identity.client_node_place(v_client_t3, v_team_node_id, current_date);

  -- Step 2: swap Mathias → non-admin også (begge non-admin; buffer holder admin-floor)
  perform set_config('stork.allow_employees_write', 'true', true);
  update core_identity.employees set role_id = v_non_admin_role_id where id = v_admin_b_id;

  -- Step 3: admin (buffer-admin) deaktiverer klient. Buffer-admin har ingen auth,
  --   så vi kører direct UPDATE som migration (bypasser RPC). Det matcher
  --   "admin-deaktivering"-scenarie i plan V14.
  perform set_config('stork.source_type', 'migration', true);
  perform set_config('stork.allow_clients_write', 'true', true);
  perform set_config('stork.change_reason', 'T3: admin deaktiverer T3-klient', true);
  update core_identity.clients set is_active = false, updated_at = now() where id = v_client_t3;
  perform set_config('stork.source_type', 'manual', true);

  -- Step 4: non-admin approver (Mathias-swap) godkender
  perform set_config('request.jwt.claim.sub', v_admin_b_auth::text, true);
  perform core_identity.pending_change_approve(v_pending_id);

  -- Step 5: cron-apply (rens jwt → auth.uid() = NULL).
  -- Forventer P0001: is_admin_by_employee_id(requester) = false (Kasper-swap)
  -- og is_admin_by_employee_id(approver) = false (Mathias-swap) → v_admin_involved = false
  -- og klient inaktiv → raise P0001.
  perform set_config('request.jwt.claim.sub', '', true);
  begin
    v_caught := null;
    perform core_identity.pending_change_apply(v_pending_id);
  exception when sqlstate 'P0001' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T3 FAIL: cron-apply uden admin-involvering skal raise P0001';
  end if;

  -- Step 6: restore Mathias til superadmin
  perform set_config('stork.allow_employees_write', 'true', true);
  update core_identity.employees set role_id = v_admin_b_orig_role where id = v_admin_b_id;

  -- ══════════════════════════════════════════════════════════════════════
  -- T4: superadmin → wrapper close inaktiv klient → approve → cron-apply → close
  -- ══════════════════════════════════════════════════════════════════════
  perform set_config('request.jwt.claim.sub', v_admin_b_auth::text, true);
  v_pending_id := core_identity.client_node_close(v_client_inactive_id, current_date);
  if v_pending_id is null then
    raise exception 'T4 FAIL: client_node_close på inaktiv klient skal lykkes (ingen aktiv-check)';
  end if;
  -- Approve som A (efter T3-step 6 er Mathias=admin igen; men A er stadig non-admin)
  -- Self-approve for Mathias som admin er OK.
  perform core_identity.pending_change_approve(v_pending_id);
  -- Cron-apply
  perform set_config('request.jwt.claim.sub', '', true);
  perform core_identity.pending_change_apply(v_pending_id);
  -- Verificer: ingen aktiv placement på v_client_inactive_id efter close
  -- (close-apply lukker eksisterende placements; her er der ingen at lukke,
  -- så vi nøjes med at verificere pending-status er 'applied')
  if not exists (
    select 1 from core_identity.pending_changes
    where id = v_pending_id and status = 'applied'
  ) then
    raise exception 'T4 FAIL: cron-apply af close skal sætte status=applied';
  end if;

  -- ══════════════════════════════════════════════════════════════════════
  -- T4a (V14): client_node_close på non-existent → P0002
  -- ══════════════════════════════════════════════════════════════════════
  -- Sæt auth tilbage (T4 cron-apply rensede jwt → wrapper-call kræver auth)
  perform set_config('request.jwt.claim.sub', v_admin_b_auth::text, true);
  begin
    v_caught := null;
    perform core_identity.client_node_close(gen_random_uuid(), current_date);
  exception when sqlstate 'P0002' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'T4a FAIL (V14): client_node_close på non-existent skal raise P0002';
  end if;

  -- ══════════════════════════════════════════════════════════════════════
  -- T5: superadmin → wrapper place på inaktiv → approve → cron-apply → placement
  --     (admin-requester gør cron-apply OK selv på inaktiv klient)
  -- ══════════════════════════════════════════════════════════════════════
  perform set_config('request.jwt.claim.sub', v_admin_b_auth::text, true);
  v_pending_id := core_identity.client_node_place(v_client_inactive_id, v_team_node_id, current_date);
  if v_pending_id is null then
    raise exception 'T5 FAIL: superadmin wrapper på inaktiv klient skal lykkes (is_admin-bypass)';
  end if;
  perform core_identity.pending_change_approve(v_pending_id);
  -- Cron-apply: rens jwt → auth.uid() = NULL. is_admin_by_employee_id(requester=Mathias)
  -- = true → v_admin_involved = true → apply OK selv på inaktiv klient.
  perform set_config('request.jwt.claim.sub', '', true);
  perform core_identity.pending_change_apply(v_pending_id);
  if not exists (
    select 1 from core_identity.client_node_placements
    where client_id = v_client_inactive_id and node_id = v_team_node_id
  ) then
    raise exception 'T5 FAIL: cron-apply skal placere klient (admin-requester bypass)';
  end if;

  -- ══════════════════════════════════════════════════════════════════════
  -- T6: superadmin → opret pending → deaktiver → admin approver → apply → success
  --     (requester-bypass: admin-requester gør apply OK selv på inaktiv)
  -- ══════════════════════════════════════════════════════════════════════
  -- Step 1: Mathias (admin) opretter pending mens klient er aktiv
  v_pending_id := core_identity.client_node_place(v_client_t6, v_team_node_id, current_date);

  -- Step 2: deaktiver klient
  perform set_config('stork.source_type', 'migration', true);
  perform set_config('stork.allow_clients_write', 'true', true);
  perform set_config('stork.change_reason', 'T6: deaktiver T6-klient', true);
  update core_identity.clients set is_active = false, updated_at = now() where id = v_client_t6;
  perform set_config('stork.source_type', 'manual', true);

  -- Step 3: Mathias (admin) godkender egen pending (self-approve OK for admin).
  perform core_identity.pending_change_approve(v_pending_id);

  -- Step 4: cron-apply (rens jwt → auth.uid() = NULL). V10-fix: is_admin_by_employee_id
  -- bruger employee-id (ikke auth.uid()) så requester-bypass virker i cron-context.
  perform set_config('request.jwt.claim.sub', '', true);
  perform core_identity.pending_change_apply(v_pending_id);

  if not exists (
    select 1 from core_identity.client_node_placements
    where client_id = v_client_t6 and node_id = v_team_node_id
  ) then
    raise exception 'T6 FAIL: admin-requester cron-apply skal placere klient selv om inaktiv';
  end if;

  -- ══════════════════════════════════════════════════════════════════════
  -- T7: non-admin requester (Kasper) + admin approver (Mathias) → apply → success
  -- ══════════════════════════════════════════════════════════════════════
  -- Step 1: Kasper (non-admin) opretter pending mens klient er aktiv
  perform set_config('request.jwt.claim.sub', v_admin_a_auth::text, true);
  v_pending_id := core_identity.client_node_place(v_client_t7, v_team_node_id, current_date);

  -- Step 2: deaktiver klient
  perform set_config('stork.source_type', 'migration', true);
  perform set_config('stork.allow_clients_write', 'true', true);
  perform set_config('stork.change_reason', 'T7: deaktiver T7-klient', true);
  update core_identity.clients set is_active = false, updated_at = now() where id = v_client_t7;
  perform set_config('stork.source_type', 'manual', true);

  -- Step 3: Mathias (admin) godkender Kasper-non-admin's pending
  perform set_config('request.jwt.claim.sub', v_admin_b_auth::text, true);
  perform core_identity.pending_change_approve(v_pending_id);

  -- Step 4: cron-apply (rens jwt → auth.uid() = NULL). V10-fix: approver-bypass
  -- via is_admin_by_employee_id(approved_by) virker i cron-context selv om
  -- auth.uid() ikke kan resolve nuværende role.
  perform set_config('request.jwt.claim.sub', '', true);
  perform core_identity.pending_change_apply(v_pending_id);

  if not exists (
    select 1 from core_identity.client_node_placements
    where client_id = v_client_t7 and node_id = v_team_node_id
  ) then
    raise exception 'T7 FAIL: admin-approver cron-apply skal placere klient selv om inaktiv';
  end if;

  -- ══════════════════════════════════════════════════════════════════════
  -- CLEANUP (ROLLBACK gør resten, men eksplicit role-restore for læsbarhed)
  -- ══════════════════════════════════════════════════════════════════════
  perform set_config('stork.allow_employees_write', 'true', true);
  update core_identity.employees set role_id = v_admin_a_orig_role where id = v_admin_a_id;

  raise notice 'T10 client_active_check smoke: ALL TESTS PASSED (T1-T7)';
end;
$test$;

rollback;
