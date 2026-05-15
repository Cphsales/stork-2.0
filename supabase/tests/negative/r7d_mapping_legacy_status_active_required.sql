-- R7d regression-test: anonymize_employee_internal må ikke acceptere mapping
-- i ulovlig state (status='approved', is_active=true).
--
-- R7h v2.1 Test 6. Anti-placebo: tester FAKTISK R7d-affected path
-- (anonymize_employee_internal, ikke anonymize_employee → anonymize_generic_apply
-- der har P2-status-check fra før R7d).
--
-- Pre-R7d state:
--   where entity_type = 'employee' and is_active = true;
-- Pre-R7d: mapping i ulovlig state matcher (kun is_active=true checked) → fortsætter.
--
-- Post-R7d state:
--   where entity_type = 'employee' and status = 'active' and is_active = true;
-- Post-R7d: ulovlig state matcher ikke → P0002.

begin;
do $test$
declare
  v_test_employee_id uuid;
  v_mg_role_id uuid;
  v_rows integer;
  v_caught text := null;
begin
  -- 1. Konstruér ulovlig mapping-state: status='approved' + is_active=true
  perform set_config('stork.allow_anonymization_mappings_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'r7h test 6 setup', true);

  update core_compliance.anonymization_mappings
     set is_active = true
   where entity_type = 'employee';
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'R7d Test 6 SETUP FAIL: forventet 1 mapping-row opdateret, fik %', v_rows;
  end if;

  -- 2. Opret test-employee
  select role_id into v_mg_role_id from core_identity.employees where email = 'mg@copenhagensales.dk';
  perform set_config('stork.allow_employees_write', 'true', true);
  insert into core_identity.employees (first_name, last_name, email, role_id)
  values ('r7h_t6', 'r7h_t6', 'r7h_t6_' || gen_random_uuid() || '@test.invalid', v_mg_role_id)
  returning id into v_test_employee_id;

  -- 3. Call anonymize_employee_internal (R7d-affected path).
  --    Forvent P0002 fordi mapping har status='approved' (ikke 'active').
  begin
    perform core_identity.anonymize_employee_internal(v_test_employee_id, 'r7h test 6');
  exception when sqlstate 'P0002' then v_caught := 'ok';
  end;

  if v_caught is null then
    raise exception 'R7d Test 6 FAIL: anonymize_employee_internal skulle have raised P0002 (mapping status=approved + is_active=true)';
  end if;
end;
$test$;
rollback;
