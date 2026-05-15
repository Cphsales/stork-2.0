-- R7d regression-test: break_glass_request må ikke acceptere op_type i ulovlig
-- state (status='approved', is_active=true).
--
-- R7h v2.1 Test 7. Spejler Test 6 for break_glass_operation_types.
--
-- Pre-R7d state:
--   where operation_type = p_operation_type and is_active = true;
-- Pre-R7d: ulovlig state matcher → request INSERT'es uden fejl.
--
-- Post-R7d state:
--   where operation_type = p_operation_type and status = 'active' and is_active = true;
-- Post-R7d: ulovlig state matcher ikke → P0002.

begin;
do $test$
declare
  v_mg_auth_id uuid;
  v_mg_role_id uuid;
  v_rows integer;
  v_caught text := null;
begin
  -- 1. Mock mg (kræves for break_glass_request's has_permission-check)
  select auth_user_id, role_id into v_mg_auth_id, v_mg_role_id
    from core_identity.employees where email = 'mg@copenhagensales.dk';
  perform set_config('request.jwt.claim.sub', v_mg_auth_id::text, true);

  -- 2. Konstruér ulovlig op_type-state: status='approved' + is_active=true
  perform set_config('stork.allow_break_glass_operation_types_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'r7h test 7 setup', true);

  update core_compliance.break_glass_operation_types
     set is_active = true
   where operation_type = 'pay_period_unlock';
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'R7d Test 7 SETUP FAIL: forventet 1 op_type-row opdateret, fik %', v_rows;
  end if;

  -- 3. Call break_glass_request — forvent P0002 (op_type ikke aktiveret)
  begin
    perform core_compliance.break_glass_request(
      'pay_period_unlock', gen_random_uuid(), '{}'::jsonb, 'r7h test 7');
  exception when sqlstate 'P0002' then v_caught := 'ok';
  end;

  if v_caught is null then
    raise exception 'R7d Test 7 FAIL: break_glass_request skulle have raised P0002 (op_type status=approved + is_active=true)';
  end if;
end;
$test$;
rollback;
