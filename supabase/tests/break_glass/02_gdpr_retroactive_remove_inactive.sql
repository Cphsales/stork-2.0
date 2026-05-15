-- Master-plan §1.13 (juridisk ramme post-fase-E).
-- C006: gdpr_retroactive_remove er INAKTIV indtil RPC bygges post-fase-E.

do $test$
declare v_active boolean;
begin
  select is_active into v_active from core_compliance.break_glass_operation_types
   where operation_type = 'gdpr_retroactive_remove';
  if v_active is null then
    raise exception 'TEST FAILED: gdpr_retroactive_remove operation_type findes ikke';
  end if;
  if v_active then
    raise exception 'TEST FAILED: gdpr_retroactive_remove er aktiv men RPC findes ikke (post-fase-E)';
  end if;
end;
$test$;
