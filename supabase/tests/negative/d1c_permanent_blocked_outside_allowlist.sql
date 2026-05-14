-- D1c negative: validate_permanent_classification-trigger blokerer
-- retention_type='permanent' på kolonner uden for is_permanent_allowed.

do $test$
declare v_caught text := null;
begin
  -- Forsøg at sætte permanent på cancellations.amount (ikke i allowlist)
  begin
    perform set_config('stork.source_type', 'manual', true);
    perform set_config('stork.allow_data_field_definitions_write', 'true', true);
    perform set_config('stork.change_reason', 'TEST: forsøg permanent uden for allowlist', true);

    update core_compliance.data_field_definitions
       set retention_type = 'permanent', retention_value = null
     where table_schema = 'core_money'
       and table_name = 'cancellations'
       and column_name = 'amount';
  exception when sqlstate 'P0001' then
    v_caught := 'ok';
  end;

  if v_caught is null then
    raise exception 'TEST FAILED: validate_permanent_classification skulle have blokeret permanent for cancellations.amount';
  end if;
end;
$test$;
