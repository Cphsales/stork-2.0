-- Q1 negative: employee_active_config_update kræver permission.

do $test$
declare v_caught text := null;
begin
  begin
    perform core_identity.employee_active_config_update(0, false, 'test');
  exception when sqlstate '42501' then
    v_caught := 'ok';
  end;
  if v_caught is null then
    raise exception 'TEST FAILED: employee_active_config_update skulle have raised 42501';
  end if;
end;
$test$;
