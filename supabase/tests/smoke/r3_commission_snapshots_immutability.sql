-- R3 smoke: conditional immutability via jsonb-subtraktion.
-- Verificerer:
--  T1: UPDATE af flag-kolonner (is_candidate, candidate_run_id) lykkes
--  T2: UPDATE af non-flag-kolonne (amount) blokeres med P0001
--  T3: DELETE af locked row (is_candidate=false) blokeres med P0001
--  T4: DELETE af candidate row (is_candidate=true) lykkes

do $test$
declare
  v_period_id uuid;
  v_run_id uuid;
  v_snap_id uuid;
  v_emp_id uuid;
  v_caught text;
begin
  -- Hent vilkårlig employee (test forudsætter mindst én eksisterer)
  select id into v_emp_id from core_identity.employees limit 1;
  if v_emp_id is null then
    raise exception 'R3 SMOKE FORUDSAETNING FEJLET: ingen employees i DB';
  end if;

  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.allow_pay_periods_write', 'true', true);
  perform set_config('stork.change_reason', 'R3 smoke setup', true);

  insert into core_money.pay_periods (start_date, end_date, status)
  values (current_date + interval '5 years', current_date + interval '5 years 30 days', 'open')
  returning id into v_period_id;

  perform set_config('stork.allow_pay_period_candidate_runs_write', 'true', true);
  insert into core_money.pay_period_candidate_runs (period_id, data_checksum, data_checksum_inputs, is_current)
  values (v_period_id, 'r3-smoke-checksum', '{}'::jsonb, true)
  returning id into v_run_id;

  perform set_config('stork.allow_commission_snapshots_write', 'true', true);
  insert into core_money.commission_snapshots
    (period_id, employee_id, sale_id, amount, status_at_lock, is_candidate, candidate_run_id)
  values (v_period_id, v_emp_id, gen_random_uuid(), 100.00, 'test', true, v_run_id)
  returning id into v_snap_id;

  -- T1: UPDATE flag-kolonner → lykkes
  perform set_config('stork.allow_commission_snapshots_flag_update', 'true', true);
  update core_money.commission_snapshots set is_candidate = false, candidate_run_id = null
   where id = v_snap_id;

  -- T2: UPDATE amount → P0001
  begin
    v_caught := null;
    update core_money.commission_snapshots set amount = 999.99 where id = v_snap_id;
  exception when sqlstate 'P0001' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'R3 TEST T2 FAIL: UPDATE amount skulle have raised P0001';
  end if;

  -- T3: DELETE locked row → P0001
  begin
    v_caught := null;
    delete from core_money.commission_snapshots where id = v_snap_id;
  exception when sqlstate 'P0001' then v_caught := 'ok'; end;
  if v_caught is null then
    raise exception 'R3 TEST T3 FAIL: DELETE locked skulle have raised P0001';
  end if;

  -- T4: INSERT + DELETE candidate → lykkes
  insert into core_money.commission_snapshots
    (period_id, employee_id, sale_id, amount, status_at_lock, is_candidate, candidate_run_id)
  values (v_period_id, v_emp_id, gen_random_uuid(), 50.00, 'cand', true, v_run_id)
  returning id into v_snap_id;
  perform set_config('stork.allow_commission_snapshots_candidate_delete', 'true', true);
  delete from core_money.commission_snapshots where id = v_snap_id;
end;
$test$;
