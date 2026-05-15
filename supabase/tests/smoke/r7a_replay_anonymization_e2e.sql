-- R7a e2e: replay_anonymization via faktisk dispatcher-execute.
--
-- R7h v2.1 Test 2 (Strategi A: seed legacy flat-shape).
-- Verificerer R7a regprocedure-fix på replay_anonymization. Pre-R7a's
-- execute format('select %s($1, $2, $3)', v_proc::text) fejler med
-- SYNTAX_ERROR fordi v_proc::text inkluderer (uuid, jsonb, text)-signatur.
--
-- Strategi A: seed anonymization_state DIREKTE med legacy flat-shape
-- (matcher _anonymize_employee_apply's forventning). Isolerer R7a-regression
-- fra G042 (replay-shape-mismatch fra P1b nested-snapshots).

begin;
do $test$
declare
  v_mg_auth_id uuid; v_mg_role_id uuid; v_mg_employee_id uuid;
  v_test_email text; v_test_employee_id uuid;
  v_result jsonb;
  v_replayed integer; v_errors integer;
  v_after_first_name text; v_after_email text;
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
  perform set_config('stork.change_reason', 'r7h test 2 setup', true);

  update core_compliance.anonymization_strategies
     set status = 'active'
   where strategy_name in ('blank', 'hash_email');
  update core_compliance.anonymization_mappings
     set status = 'active', is_active = true
   where entity_type = 'employee';

  -- Opret test-employee (NOT anonymized — replay vil sætte anonymized_at)
  v_test_email := 'r7h_t2_' || gen_random_uuid() || '@test.invalid';
  perform set_config('stork.allow_employees_write', 'true', true);
  insert into core_identity.employees (first_name, last_name, email, role_id)
  values ('r7h_t2_first', 'r7h_t2_last', v_test_email, v_mg_role_id)
  returning id into v_test_employee_id;

  -- Strategi A: seed anonymization_state med LEGACY FLAT-shape.
  -- table_schema + table_name er NOT NULL (Codex v3-fang).
  perform set_config('stork.allow_anonymization_state_write', 'true', true);
  insert into core_compliance.anonymization_state (
    entity_type, table_schema, table_name, entity_id, anonymization_reason,
    field_mapping_snapshot, jsonb_field_mapping_snapshot,
    strategy_version, created_by
  ) values (
    'employee', 'core_identity', 'employees', v_test_employee_id, 'r7h test 2 seed',
    '{"first_name":"blank","last_name":"blank","email":"hash_email"}'::jsonb,
    '{"first_name":"blank","last_name":"blank","email":"hash_email"}'::jsonb,
    1, v_mg_employee_id
  );

  -- Call replay
  v_result := core_compliance.replay_anonymization('employee', false);
  v_replayed := (v_result->>'replayed')::integer;
  v_errors := (v_result->>'errors')::integer;

  if v_replayed < 1 then
    raise exception 'Test 2 FAIL: replayed=% (forventet >=1). errors=%, details=%',
      v_replayed, v_errors, v_result->'error_details';
  end if;
  if v_errors > 0 then
    raise exception 'Test 2 FAIL: errors=%, details=%', v_errors, v_result->'error_details';
  end if;

  -- Verificér PII overskrevet
  select first_name, email into v_after_first_name, v_after_email
    from core_identity.employees where id = v_test_employee_id;
  if v_after_first_name = 'r7h_t2_first' then
    raise exception 'Test 2 FAIL: first_name ikke overskrevet (replay ramte ikke)';
  end if;
  if v_after_email = v_test_email then
    raise exception 'Test 2 FAIL: email ikke overskrevet';
  end if;
end;
$test$;
rollback;
