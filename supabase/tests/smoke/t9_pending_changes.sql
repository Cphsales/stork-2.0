-- T9 Step 1 smoke: pending_changes-infrastruktur.
--
-- Krav-dok 6.1+6.2 + Plan V6 Beslutning 7+11+15.
--
-- T1: pending_change_request er INTERN (V3 Beslutning 12) — revoke from authenticated.
-- T2: pending_change_apply afviser unknown_change_type.
-- T3: pending_change_apply afviser not_yet_due hvis undo_deadline > now() (V6 central gate).
-- T4: pending_change_apply afviser not_yet_due hvis effective_from > current_date (V6 central gate).
-- T5: undo_settings INSERT'er + UPDATE'r konfig.
-- T6: Status-livscyklus-invariants — direct INSERT med invalid status → CHECK fail.
-- T7: pending_change_undo afviser hvis status != approved.
-- T8: pending_change_undo afviser hvis undo_deadline expired.
--
-- HERMETIC FIXTURE (G053 refactor 2026-05-19):
-- Testen opretter egne throwaway-rolle, employees og bruger uuid-suffixed
-- change_type for undo_settings. Ingen brug af mg@/km@ eller andre
-- seed-fixtures. Ingen DELETE/UPDATE af eksisterende seed-state.

begin;

do $test$
declare
  v_caught text;
  v_change_id uuid;
  v_role_id uuid;
  v_emp_a_id uuid;
  v_emp_b_id uuid;
  v_uuid_suffix text;
  v_test_change_type text;
begin
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'T9 step 1 smoke hermetic fixture', true);

  v_uuid_suffix := replace(gen_random_uuid()::text, '-', '');
  v_test_change_type := 't9_smoke_unregistered_' || v_uuid_suffix;

  -- ─── Throwaway-rolle + employees ─────────────────────────────────────
  perform set_config('stork.allow_roles_write', 'true', true);
  insert into core_identity.roles (name, description)
  values ('t9_smoke_role_' || v_uuid_suffix, 'T9 pending_changes smoke role')
  returning id into v_role_id;

  perform set_config('stork.allow_employees_write', 'true', true);
  insert into core_identity.employees (first_name, last_name, email, role_id)
  values ('T9', 'EmpA', 't9_empa_' || v_uuid_suffix || '@test.invalid', v_role_id)
  returning id into v_emp_a_id;

  insert into core_identity.employees (first_name, last_name, email, role_id)
  values ('T9', 'EmpB', 't9_empb_' || v_uuid_suffix || '@test.invalid', v_role_id)
  returning id into v_emp_b_id;

  -- ─── T1: pending_change_request er INTERN ─────────────────────────────
  begin
    v_caught := null;
    set local role authenticated;
    perform core_identity.pending_change_request(
      v_test_change_type, null, '{}'::jsonb, current_date
    );
    reset role;
  exception when sqlstate '42501' then
    v_caught := 'ok';
    reset role;
  end;
  if v_caught is null then
    raise exception 'T1 FAIL: pending_change_request skal afvises ved authenticated kald (V3 Beslutning 12)';
  end if;

  -- ─── T2: pending_change_apply afviser unknown_change_type ─────────────
  insert into core_identity.pending_changes
    (change_type, target_id, payload, effective_from, requested_by, status, approved_by, approved_at, undo_deadline)
  values
    (v_test_change_type, null, '{}'::jsonb, current_date - 1, v_emp_a_id, 'approved', v_emp_b_id, now() - interval '1 hour', now() - interval '30 minutes')
  returning id into v_change_id;

  begin
    v_caught := null;
    perform core_identity.pending_change_apply(v_change_id);
  exception when sqlstate '42883' then
    v_caught := 'ok';
  end;
  if v_caught is null then
    raise exception 'T2 FAIL: apply skal afvise unknown_change_type med 42883';
  end if;

  -- ─── T3: pending_change_apply afviser not_yet_due (undo_deadline > now()) ─
  insert into core_identity.pending_changes
    (change_type, target_id, payload, effective_from, requested_by, status, approved_by, approved_at, undo_deadline)
  values
    (v_test_change_type, null, '{}'::jsonb, current_date - 1, v_emp_a_id, 'approved', v_emp_b_id, now(), now() + interval '1 hour')
  returning id into v_change_id;

  begin
    v_caught := null;
    perform core_identity.pending_change_apply(v_change_id);
  exception when sqlstate '22023' then
    v_caught := 'ok';
  end;
  if v_caught is null then
    raise exception 'T3 FAIL: apply skal afvise not_yet_due hvis undo_deadline > now() (V6 central gate)';
  end if;

  -- ─── T4: pending_change_apply afviser not_yet_due (effective_from > current_date) ─
  insert into core_identity.pending_changes
    (change_type, target_id, payload, effective_from, requested_by, status, approved_by, approved_at, undo_deadline)
  values
    (v_test_change_type, null, '{}'::jsonb, current_date + 30, v_emp_a_id, 'approved', v_emp_b_id, now() - interval '2 hour', now() - interval '1 hour')
  returning id into v_change_id;

  begin
    v_caught := null;
    perform core_identity.pending_change_apply(v_change_id);
  exception when sqlstate '22023' then
    v_caught := 'ok';
  end;
  if v_caught is null then
    raise exception 'T4 FAIL: apply skal afvise not_yet_due hvis effective_from > current_date (V6 central gate)';
  end if;

  -- ─── T5: undo_settings INSERT + UPDATE med uuid-suffixed change_type ──
  insert into core_identity.undo_settings (change_type, undo_period_seconds)
  values (v_test_change_type, 86400)
  on conflict (change_type) do update
  set undo_period_seconds = excluded.undo_period_seconds;

  if not exists (
    select 1 from core_identity.undo_settings
    where change_type = v_test_change_type and undo_period_seconds = 86400
  ) then
    raise exception 'T5 FAIL: undo_settings INSERT virkede ikke';
  end if;

  -- ─── T6: Status-CHECK håndhæver invalid status ─────────────────────────
  begin
    v_caught := null;
    insert into core_identity.pending_changes
      (change_type, target_id, payload, effective_from, requested_by, status)
    values
      (v_test_change_type, null, '{}'::jsonb, current_date, v_emp_a_id, 'invalid_status');
  exception when sqlstate '23514' then
    v_caught := 'ok';
  end;
  if v_caught is null then
    raise exception 'T6 FAIL: status-CHECK skal afvise invalid status med 23514';
  end if;

  -- ─── T7: pending_change_undo afviser hvis status != approved ───────────
  insert into core_identity.pending_changes
    (change_type, target_id, payload, effective_from, requested_by, status)
  values
    (v_test_change_type, null, '{}'::jsonb, current_date, v_emp_a_id, 'pending')
  returning id into v_change_id;

  begin
    v_caught := null;
    perform core_identity.pending_change_undo(v_change_id);
  exception when sqlstate '22023' then
    v_caught := 'ok';
  end;
  if v_caught is null then
    raise exception 'T7 FAIL: undo skal afvise hvis status != approved';
  end if;

  -- ─── T8: pending_change_undo afviser hvis undo_deadline expired ────────
  insert into core_identity.pending_changes
    (change_type, target_id, payload, effective_from, requested_by, status, approved_by, approved_at, undo_deadline)
  values
    (v_test_change_type, null, '{}'::jsonb, current_date - 1, v_emp_a_id, 'approved', v_emp_b_id, now() - interval '2 hour', now() - interval '1 hour')
  returning id into v_change_id;

  begin
    v_caught := null;
    perform core_identity.pending_change_undo(v_change_id);
  exception when sqlstate '22023' then
    v_caught := 'ok';
  end;
  if v_caught is null then
    raise exception 'T8 FAIL: undo skal afvise efter deadline-expiry';
  end if;

  raise notice 'T9 Step 1 smoke: ALL TESTS PASSED (T1-T8)';
end;
$test$;

rollback;
