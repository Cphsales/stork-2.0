-- Master-plan §0 + §1.2.
-- retention_consistency CHECK + D1c-trigger håndhæver retention-disciplin.
-- Opdateret post-D1c (R-runde-2): permanent kraever allowlist-tabel.
-- Bruger core_compliance.audit_log (er i is_permanent_allowed-allowlist).

begin;
do $test$
declare
  v_caught_tb text := null;
  v_caught_perm text := null;
begin
  perform set_config('stork.allow_data_field_definitions_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'test_consistency', true);

  -- time_based + NULL value → fejl (retention_consistency CHECK)
  begin
    insert into core_compliance.data_field_definitions
      (table_schema, table_name, column_name, category, pii_level,
       retention_type, retention_value, purpose)
    values ('core_compliance', 'audit_log', 'test_col_tb', 'audit', 'none',
            'time_based', null, 'test');
  exception when check_violation then
    v_caught_tb := 'ok';
  end;
  if v_caught_tb is null then
    raise exception 'TEST FAILED: time_based + NULL value skulle have raised check_violation';
  end if;

  -- permanent + NULL value → OK (audit_log er i is_permanent_allowed-allowlist;
  -- D1c-trigger lader passere)
  insert into core_compliance.data_field_definitions
    (table_schema, table_name, column_name, category, pii_level,
     retention_type, retention_value, purpose)
  values ('core_compliance', 'audit_log', 'test_col_perm', 'audit', 'none',
          'permanent', null, 'test');

  -- permanent + NON-NULL value → fejl (retention_consistency CHECK eller
  -- validate_retention-trigger)
  begin
    insert into core_compliance.data_field_definitions
      (table_schema, table_name, column_name, category, pii_level,
       retention_type, retention_value, purpose)
    values ('core_compliance', 'audit_log', 'test_col_perm2', 'audit', 'none',
            'permanent', '{"max_days": 100}'::jsonb, 'test');
  exception when sqlstate '22023' or sqlstate '23514' then
    v_caught_perm := 'ok';
  end;
  if v_caught_perm is null then
    raise exception 'TEST FAILED: permanent + value skulle have raised exception';
  end if;
end;
$test$;
rollback;
