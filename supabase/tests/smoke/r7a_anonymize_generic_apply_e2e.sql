-- R7a e2e: anonymize_generic_apply via anonymize_employee-wrapper.
--
-- R7h v2.1 Test 3. Verificerer R7a regprocedure callable fix på
-- anonymize_generic_apply ved at faktisk EXECUTE'e dynamic UPDATE.
--
-- Pre-R7a kerne:
--   v_set_clauses := v_set_clauses || (format('%I = %s(%I, $1)', col, v_proc::text, col));
-- v_proc::text returnerer "core_compliance._anon_strategy_blank(text, text)".
-- Genereret SQL: UPDATE ... SET first_name = core_compliance._anon_strategy_blank(text, text)(first_name, $1), ...
-- ← SYNTAX_ERROR ved EXECUTE.
--
-- Post-R7a kerne:
--   v_callable := quote_ident(nspname) || '.' || quote_ident(proname);  -- via pg_proc-lookup
-- Genereret SQL: UPDATE ... SET first_name = "core_compliance"."_anon_strategy_blank"(first_name, $1), ...
-- ← Valid SQL. PII overskrevet med strategy-output.

begin;
do $test$
declare
  v_mg_auth_id uuid;
  v_mg_role_id uuid;
  v_mg_employee_id uuid;
  v_test_employee_id uuid;
  v_test_email text;
  v_after_first_name text;
  v_after_email text;
  v_anonymized_at timestamptz;
  v_state_count integer;
begin
  -- Mock mg (kraever has_permission(employees, anonymize, true))
  select auth_user_id, role_id, id into v_mg_auth_id, v_mg_role_id, v_mg_employee_id
    from core_identity.employees where email = 'mg@copenhagensales.dk';
  perform set_config('request.jwt.claim.sub', v_mg_auth_id::text, true);

  -- Aktivér strategier + mapping (bypass lifecycle via session-var-pattern)
  perform set_config('stork.allow_strategy_write', 'true', true);
  perform set_config('stork.allow_strategy_activate', 'true', true);
  perform set_config('stork.allow_anonymization_mappings_write', 'true', true);
  perform set_config('stork.allow_mapping_activate', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'r7h test 3 setup', true);

  update core_compliance.anonymization_strategies
     set status = 'active', activated_at = now(), activated_by = v_mg_employee_id
   where strategy_name in ('blank', 'hash_email');

  update core_compliance.anonymization_mappings
     set status = 'active', is_active = true, activated_at = now(), activated_by = v_mg_employee_id
   where entity_type = 'employee';

  -- Opret test-employee (PII der kan anonymiseres)
  v_test_email := 'r7h_t3_' || gen_random_uuid() || '@test.invalid';
  perform set_config('stork.allow_employees_write', 'true', true);
  insert into core_identity.employees (first_name, last_name, email, role_id)
  values ('r7h_t3_first', 'r7h_t3_last', v_test_email, v_mg_role_id)
  returning id into v_test_employee_id;

  -- Call anonymize_employee (P1c wrapper → anonymize_generic_apply)
  perform core_identity.anonymize_employee(v_test_employee_id, 'r7h test 3');

  -- Verificér PII faktisk overskrevet (R7a callable virker)
  select first_name, email, anonymized_at into v_after_first_name, v_after_email, v_anonymized_at
    from core_identity.employees where id = v_test_employee_id;

  if v_after_first_name <> '[anonymized]' then
    raise exception 'Test 3 FAIL: first_name forventet [anonymized] men er %', v_after_first_name;
  end if;
  if v_after_email !~ '^[a-f0-9]{16}@anonymized\.invalid$' then
    raise exception 'Test 3 FAIL: email format mismatch: %', v_after_email;
  end if;
  if v_anonymized_at is null then
    raise exception 'Test 3 FAIL: anonymized_at ikke sat';
  end if;

  -- Verificér state-row INSERT'ed
  select count(*) into v_state_count from core_compliance.anonymization_state
   where entity_id = v_test_employee_id;
  if v_state_count <> 1 then
    raise exception 'Test 3 FAIL: forventet 1 anonymization_state-row, fik %', v_state_count;
  end if;
end;
$test$;
rollback;
