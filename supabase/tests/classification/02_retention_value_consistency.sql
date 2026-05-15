-- Master-plan §0 + §1.2.
-- C001: retention_consistency CHECK håndhæver value-required pr. type.

begin;
do $test$
declare
  v_caught_tb text := null;
  v_caught_perm text := null;
begin
  perform set_config('stork.allow_data_field_definitions_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'test_consistency', true);

  -- time_based + NULL value → fejl
  begin
    insert into core_compliance.data_field_definitions
      (table_schema, table_name, column_name, category, pii_level,
       retention_type, retention_value, purpose)
    values ('test', 'test', 'col_tb', 'master_data', 'none', 'time_based', null, 'test');
  exception when check_violation then
    v_caught_tb := 'ok';
  end;
  if v_caught_tb is null then
    raise exception 'TEST FAILED: time_based + NULL value skulle have raised check_violation';
  end if;

  -- permanent + NULL value → OK
  insert into core_compliance.data_field_definitions
    (table_schema, table_name, column_name, category, pii_level,
     retention_type, retention_value, purpose)
  values ('test_perm', 'test', 'col_perm', 'master_data', 'none', 'permanent', null, 'test');

  -- permanent + NON-NULL value → fejl (validate_retention-trigger)
  begin
    insert into core_compliance.data_field_definitions
      (table_schema, table_name, column_name, category, pii_level,
       retention_type, retention_value, purpose)
    values ('test_perm', 'test', 'col_perm2', 'master_data', 'none',
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
