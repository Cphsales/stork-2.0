-- R7a e2e: retention_cleanup_daily cron-body via faktisk cron.command-execute.
--
-- R7h v2.1 Test 4 (G041-pattern). Henter FAKTISK cron.command-string fra
-- cron.job og executer den — ikke kopieret helper-logic. Verificerer at
-- selve cron-bodyen (post-R7a regprocedure-fix + R7d status-check) virker.
--
-- Pre-R7a kerne (cron-body):
--   execute format('select %s($1, $2)', v_proc::text) ...;
-- v_proc::text inkluderer "(uuid, text)"-signatur → SYNTAX_ERROR ved EXECUTE.
-- cron-body's inner exception-handler catcher → v_errors += 1, employee
-- ikke anonymiseret. cron_heartbeat status='failure' eller 'partial_failure'.
--
-- Post-R7a: callable via pg_proc-lookup → valid SQL → employee anonymiseret.

begin;
do $test$
declare
  v_mg_auth_id uuid; v_mg_role_id uuid; v_mg_employee_id uuid;
  v_test_employee_id uuid; v_test_email text;
  v_cron_command text;
  v_after_first_name text; v_after_anonymized_at timestamptz;
  v_rows integer;
begin
  select auth_user_id, role_id, id into v_mg_auth_id, v_mg_role_id, v_mg_employee_id
    from core_identity.employees where email = 'mg@copenhagensales.dk';
  perform set_config('request.jwt.claim.sub', v_mg_auth_id::text, true);

  -- Aktivér strategier + mapping
  perform set_config('stork.allow_strategy_write', 'true', true);
  perform set_config('stork.allow_strategy_activate', 'true', true);
  perform set_config('stork.allow_anonymization_mappings_write', 'true', true);
  perform set_config('stork.allow_mapping_activate', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'r7h test 4 setup', true);

  update core_compliance.anonymization_strategies
     set status = 'active'
   where strategy_name in ('blank', 'hash_email');
  update core_compliance.anonymization_mappings
     set status = 'active', is_active = true
   where entity_type = 'employee';

  -- Pre-eksisterende config: 7 kolonner i core_identity.employees har
  -- event_based retention med days_after=1825. Cron-body bruger MAX(days_after).
  -- Test-employee skal have termination_date > 1825 dage tilbage for at matche.
  -- (Codex v3 alternativ b: "sæt termination_date langt nok tilbage til at
  -- matche eksisterende retention-værdi" — vi bruger denne tilgang.)

  -- Opret test-employee med termination_date langt tilbage
  v_test_email := 'r7h_t4_' || gen_random_uuid() || '@test.invalid';
  perform set_config('stork.allow_employees_write', 'true', true);
  insert into core_identity.employees (first_name, last_name, email, role_id, termination_date)
  values ('r7h_t4_first', 'r7h_t4_last', v_test_email, v_mg_role_id, current_date - 2000)
  returning id into v_test_employee_id;

  -- G041: hent FAKTISK cron.command + execute
  select command into v_cron_command from cron.job where jobname = 'retention_cleanup_daily';
  if v_cron_command is null then
    raise exception 'Test 4 SETUP FAIL: cron-job retention_cleanup_daily findes ikke';
  end if;
  execute v_cron_command;

  -- Verificér test-employee blev anonymiseret af cron-body
  select first_name, anonymized_at into v_after_first_name, v_after_anonymized_at
    from core_identity.employees where id = v_test_employee_id;
  if v_after_anonymized_at is null then
    raise exception 'Test 4 FAIL: test-employee anonymized_at er null efter cron-execute (cron-body fejlede)';
  end if;
  if v_after_first_name = 'r7h_t4_first' then
    raise exception 'Test 4 FAIL: first_name ikke overskrevet';
  end if;
end;
$test$;
rollback;
