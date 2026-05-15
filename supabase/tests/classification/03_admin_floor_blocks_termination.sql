-- Master-plan §1.7 (superadmin-floor).
-- C005: termination under floor skal blokeres + trigger lytter på termination_date.

begin;
do $test$
declare
  v_mg_id uuid;
  v_caught text := null;
  v_termination_after date;
begin
  select id into v_mg_id from core_identity.employees where email = 'mg@copenhagensales.dk';
  if v_mg_id is null then
    raise exception 'TEST SETUP FAILED: mg@ ikke fundet';
  end if;

  perform set_config('stork.allow_employees_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'test_admin_floor', true);

  begin
    update core_identity.employees
       set termination_date = current_date - 1
     where id = v_mg_id;
  exception when sqlstate 'P0001' then
    v_caught := 'ok';
  end;
  if v_caught is null then
    raise exception 'TEST FAILED: terminere admin under floor skulle have raised P0001';
  end if;

  -- Bekræft state intakt (rollback har ikke været muligt da exception kom fra trigger)
  select termination_date into v_termination_after
    from core_identity.employees where id = v_mg_id;
  if v_termination_after is not null then
    raise exception 'TEST FAILED: mg@ termination_date = % efter exception, forventede null',
      v_termination_after;
  end if;
end;
$test$;
rollback;
