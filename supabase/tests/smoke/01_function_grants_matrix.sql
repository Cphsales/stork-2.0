-- Master-plan §1.1 (default deny via REVOKE/GRANT).
-- C004: verificér declarative permissions er korrekt sat for pay_period RPCs.

do $test$
declare
  v_failed text := '';
begin
  -- Admin-RPC'er: kun authenticated har EXECUTE
  if has_function_privilege('service_role', 'core_money.pay_period_lock(uuid, text)', 'EXECUTE') then
    v_failed := v_failed || ' [service_role kan kalde pay_period_lock; forventede ikke]';
  end if;
  if not has_function_privilege('authenticated', 'core_money.pay_period_lock(uuid, text)', 'EXECUTE') then
    v_failed := v_failed || ' [authenticated kan IKKE kalde pay_period_lock; forventede ja]';
  end if;

  -- Cron-RPC'er: kun service_role har EXECUTE
  if has_function_privilege('authenticated', 'core_money.pay_period_lock_via_cron(uuid)', 'EXECUTE') then
    v_failed := v_failed || ' [authenticated kan kalde pay_period_lock_via_cron]';
  end if;
  if not has_function_privilege('service_role', 'core_money.pay_period_lock_via_cron(uuid)', 'EXECUTE') then
    v_failed := v_failed || ' [service_role kan IKKE kalde pay_period_lock_via_cron]';
  end if;

  -- pay_period_lock_attempt: service_role only
  if has_function_privilege('authenticated', 'core_money.pay_period_lock_attempt(uuid)', 'EXECUTE') then
    v_failed := v_failed || ' [authenticated kan kalde pay_period_lock_attempt]';
  end if;

  -- _internal helpers: service_role only
  if has_function_privilege('authenticated', 'core_money._pay_period_lock_internal(uuid, text)', 'EXECUTE') then
    v_failed := v_failed || ' [authenticated kan kalde _pay_period_lock_internal]';
  end if;

  -- anonymize_employee: admin-vej, authenticated
  if not has_function_privilege('authenticated', 'core_identity.anonymize_employee(uuid, text)', 'EXECUTE') then
    v_failed := v_failed || ' [authenticated kan IKKE kalde anonymize_employee]';
  end if;
  if has_function_privilege('service_role', 'core_identity.anonymize_employee(uuid, text)', 'EXECUTE') then
    v_failed := v_failed || ' [service_role kan kalde anonymize_employee]';
  end if;

  -- anonymize_employee_internal: service_role only
  if has_function_privilege('authenticated', 'core_identity.anonymize_employee_internal(uuid, text)', 'EXECUTE') then
    v_failed := v_failed || ' [authenticated kan kalde anonymize_employee_internal]';
  end if;
  if not has_function_privilege('service_role', 'core_identity.anonymize_employee_internal(uuid, text)', 'EXECUTE') then
    v_failed := v_failed || ' [service_role kan IKKE kalde anonymize_employee_internal]';
  end if;

  if length(v_failed) > 0 then
    raise exception 'TEST FAILED: permission-matrix afvigelser:%', v_failed;
  end if;
end;
$test$;
