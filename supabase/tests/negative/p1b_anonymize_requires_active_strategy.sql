-- P1b negative: anonymize_generic_apply raiser hvis strategy ikke er active.
-- Forudsætning: bootstrap-strategier er status='approved' (pre-cutover-state).
-- Forventet: anonymize_generic_apply('employee', <id>, '...') raises P0001
-- med besked om at strategy 'blank' eller 'hash_email' ikke er active.

do $test$
declare
  v_emp_id uuid;
  v_caught text := null;
begin
  -- Brug en eksisterende employee (pre-cutover state har 2 bootstrap-admins).
  select id into v_emp_id from core_identity.employees limit 1;
  if v_emp_id is null then
    raise exception 'P1b NEGATIVE FORUDSAETNING FEJLET: ingen employees i DB';
  end if;

  begin
    perform core_compliance.anonymize_generic_apply('employee', v_emp_id, 'p1b negative test');
  exception when sqlstate 'P0001' then v_caught := 'ok'; end;

  if v_caught is null then
    raise exception 'P1b NEGATIVE FAIL: anonymize_generic_apply skulle have raised P0001 (strategy ikke active)';
  end if;
end;
$test$;
