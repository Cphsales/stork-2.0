-- R7d smoke: alle lifecycle-rows har konsistent (status, is_active)-state.
-- status='active' → is_active=true; status<>'active' → is_active=false.

do $test$
declare
  v_inconsistent_mappings integer;
  v_inconsistent_op_types integer;
begin
  -- anonymization_mappings: ingen row med status<>'active' AND is_active=true
  select count(*) into v_inconsistent_mappings
    from core_compliance.anonymization_mappings
   where status <> 'active' and is_active = true;
  if v_inconsistent_mappings > 0 then
    raise exception 'R7d FAILED: % anonymization_mappings har status<>active men is_active=true', v_inconsistent_mappings;
  end if;

  -- break_glass_operation_types: samme invariant
  select count(*) into v_inconsistent_op_types
    from core_compliance.break_glass_operation_types
   where status <> 'active' and is_active = true;
  if v_inconsistent_op_types > 0 then
    raise exception 'R7d FAILED: % break_glass_operation_types har status<>active men is_active=true', v_inconsistent_op_types;
  end if;

  -- Modsat retning: status='active' → is_active=true
  select count(*) into v_inconsistent_mappings
    from core_compliance.anonymization_mappings
   where status = 'active' and is_active = false;
  if v_inconsistent_mappings > 0 then
    raise exception 'R7d FAILED: % mappings har status=active men is_active=false', v_inconsistent_mappings;
  end if;

  select count(*) into v_inconsistent_op_types
    from core_compliance.break_glass_operation_types
   where status = 'active' and is_active = false;
  if v_inconsistent_op_types > 0 then
    raise exception 'R7d FAILED: % op_types har status=active men is_active=false', v_inconsistent_op_types;
  end if;
end;
$test$;
