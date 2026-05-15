-- R7a e2e: break_glass_execute via two-actor flow.
--
-- R7h v2.1 Test 1. Verificerer R7a regprocedure callable-fix på
-- break_glass_execute via faktisk EXECUTE af internal_rpc.
--
-- Pre-R7a kerne:
--   execute format('select %s($1, $2)', v_proc::text) using ...;
-- v_proc::text = "core_money.pay_period_unlock_via_break_glass(uuid, text)"
-- → SQL: select core_money.pay_period_unlock_via_break_glass(uuid, text)($1, $2)
-- ← SYNTAX_ERROR.
--
-- Post-R7a: callable via pg_proc-lookup → valid SQL → pay_period unlockes.

begin;
do $test$
declare
  v_mg_auth_id uuid;
  v_km_auth_id uuid;
  v_test_period_id uuid;
  v_test_start date;
  v_test_end date;
  v_request_id uuid;
  v_rows integer;
  v_final_status text;
  v_final_period_status text;
  v_overlap_attempt integer := 0;
begin
  select auth_user_id into v_mg_auth_id from core_identity.employees where email = 'mg@copenhagensales.dk';
  select auth_user_id into v_km_auth_id from core_identity.employees where email = 'km@copenhagensales.dk';

  -- Mock mg FØR lifecycle-UPDATEs (trigger bruger current_employee_id())
  perform set_config('request.jwt.claim.sub', v_mg_auth_id::text, true);

  -- Find ikke-overlappende dato-range
  perform set_config('stork.allow_pay_periods_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'r7h test 1 setup', true);
  loop
    v_test_start := current_date + (200 + (random() * 9000)::int);
    v_test_end := v_test_start + 30;
    if not exists (
      select 1 from core_money.pay_periods
       where start_date <= v_test_end and end_date >= v_test_start
    ) then exit; end if;
    v_overlap_attempt := v_overlap_attempt + 1;
    if v_overlap_attempt > 20 then
      raise exception 'Test 1 SETUP FAIL: ingen ikke-overlappende periode';
    end if;
  end loop;

  insert into core_money.pay_periods (start_date, end_date, status, locked_at, locked_by)
  values (v_test_start, v_test_end, 'locked', now(), v_mg_auth_id)
  returning id into v_test_period_id;

  -- Aktivér pay_period_unlock op_type (lifecycle-trigger sætter activated_by
  -- fra current_employee_id() — mg er allerede mocked)
  perform set_config('stork.allow_break_glass_operation_types_write', 'true', true);
  perform set_config('stork.allow_op_type_activate', 'true', true);
  update core_compliance.break_glass_operation_types
     set status = 'active', is_active = true
   where operation_type = 'pay_period_unlock';
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'Test 1 SETUP FAIL: forventet 1 op_type-row opdateret, fik %', v_rows;
  end if;

  -- Two-actor flow: mg request, km approve, mg execute
  v_request_id := (core_compliance.break_glass_request(
    'pay_period_unlock', v_test_period_id, '{}'::jsonb, 'r7h test 1'
  )).id;

  perform set_config('request.jwt.claim.sub', v_km_auth_id::text, true);
  perform core_compliance.break_glass_approve(v_request_id, 'approved by km');

  perform set_config('request.jwt.claim.sub', v_mg_auth_id::text, true);
  perform core_compliance.break_glass_execute(v_request_id);

  -- Verificér side-effects
  select status into v_final_status from core_compliance.break_glass_requests where id = v_request_id;
  if v_final_status <> 'executed' then
    raise exception 'Test 1 FAIL: request.status=%, forventet executed', v_final_status;
  end if;
  select status into v_final_period_status from core_money.pay_periods where id = v_test_period_id;
  if v_final_period_status <> 'open' then
    raise exception 'Test 1 FAIL: period.status=%, forventet open', v_final_period_status;
  end if;
end;
$test$;
rollback;
