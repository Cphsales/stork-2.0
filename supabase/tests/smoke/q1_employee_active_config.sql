-- Q1 smoke: employee_active_config-konfig + is_active_employee_state-helper.

do $test$
declare
  v_test_active boolean;
  v_test_inactive boolean;
begin
  -- Bootstrap-row
  if not exists (select 1 from core_identity.employee_active_config where id = 1) then
    raise exception 'TEST FAILED: bootstrap-row mangler';
  end if;

  -- Helper-logik
  v_test_active := core_identity.is_active_employee_state(null::timestamptz, null::date);
  if not v_test_active then
    raise exception 'TEST FAILED: aktiv (ingen termination) skal returnere true';
  end if;

  v_test_inactive := core_identity.is_active_employee_state(null::timestamptz, (current_date - 1)::date);
  if v_test_inactive then
    raise exception 'TEST FAILED: termineret i går med default grace=0 skal være inaktiv';
  end if;

  v_test_inactive := core_identity.is_active_employee_state(now(), null::date);
  if v_test_inactive then
    raise exception 'TEST FAILED: anonymized med default treat_anonymized_as_active=false skal være inaktiv';
  end if;

  -- Termineret i fremtid → aktiv
  v_test_active := core_identity.is_active_employee_state(null::timestamptz, (current_date + 30)::date);
  if not v_test_active then
    raise exception 'TEST FAILED: termineret om 30 dage skal være aktiv';
  end if;
end;
$test$;
