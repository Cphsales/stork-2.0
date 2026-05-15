-- P1b negative: anonymize_generic_apply raiser hvis pre-cutover-state.
--
-- Pre-cutover: bootstrap-state har (mapping: approved, is_active=false)
-- og (strategier: approved). anonymize_generic_apply tjekker FIRST
-- mapping (raises P0002 hvis ikke aktiv), DEREFTER strategi (raises P0001
-- hvis ikke active).
--
-- Pre-R7d (T1-era): mapping havde (approved, is_active=true) → strategy-
-- check ramt → P0001.
-- Post-R7d: mapping har (approved, is_active=false) → mapping-check ramt
-- → P0002.
--
-- Testen accepterer begge — formålet er at verificere at runtime BLOKERES
-- uden UI-aktivering, uanset hvilken check der rammes først.

do $test$
declare
  v_emp_id uuid;
  v_caught text := null;
begin
  select id into v_emp_id from core_identity.employees limit 1;
  if v_emp_id is null then
    raise exception 'P1b NEGATIVE FORUDSAETNING FEJLET: ingen employees i DB';
  end if;

  begin
    perform core_compliance.anonymize_generic_apply('employee', v_emp_id, 'p1b negative test');
  exception
    when sqlstate 'P0001' then v_caught := 'p0001';
    when sqlstate 'P0002' then v_caught := 'p0002';
  end;

  if v_caught is null then
    raise exception 'P1b NEGATIVE FAIL: anonymize_generic_apply skulle have raised P0001 (strategy ikke active) eller P0002 (mapping ikke aktiv)';
  end if;
end;
$test$;
