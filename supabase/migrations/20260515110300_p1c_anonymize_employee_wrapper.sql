-- P1c: anonymize_employee refactoreret til wrapper omkring
-- anonymize_generic_apply (P1b).
--
-- BAGGRUND:
-- Pre-P1c: anonymize_employee kaldte _anonymize_employee_apply (employee-
-- specifik kode) der hardkodede strategy-håndtering.
-- Post-P1c: anonymize_employee delegerer til core_compliance.anonymize_
-- generic_apply som bruger anonymization_strategies-registret.
--
-- BAGUDKOMPATIBILITET:
-- - Signatur (p_employee_id uuid, p_reason text) returns core_identity.employees
--   bevares.
-- - Permission-check has_permission('employees', 'anonymize', true) bevares.
-- - Returneret row er employees-row efter anonymization-UPDATE.
--
-- PRE-CUTOVER REQUIREMENT:
-- Strategies skal aktiveres via anonymization_strategy_activate-RPC før
-- anonymize_employee kan kaldes. Indtil aktivering raises P0001.

create or replace function core_identity.anonymize_employee(
  p_employee_id uuid,
  p_reason text
)
returns core_identity.employees
language plpgsql security definer set search_path = ''
as $func$
declare
  v_row core_identity.employees;
begin
  if not core_identity.has_permission('employees', 'anonymize', true) then
    raise exception 'anonymize_employee kraever permission employees.anonymize.can_edit'
      using errcode = '42501';
  end if;
  if p_employee_id is null then
    raise exception 'employee_id er paakraevet' using errcode = '22023';
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'reason er paakraevet' using errcode = '22023';
  end if;

  -- Deleger til generisk apply (P1b). Returnerer jsonb-summary; vi ignorerer
  -- den her og returnerer i stedet den opdaterede employees-row.
  perform core_compliance.anonymize_generic_apply('employee', p_employee_id, p_reason);

  select * into v_row from core_identity.employees where id = p_employee_id;
  if v_row.id is null then
    -- Skulle ikke kunne ske; generic_apply raises P0002 først hvis row mangler.
    raise exception 'employee % blev anonymized men kunne ikke laeses tilbage', p_employee_id
      using errcode = 'P0001';
  end if;

  return v_row;
end;
$func$;

comment on function core_identity.anonymize_employee(uuid, text) is
  'P1c: bagudkompatibel wrapper. Delegerer til core_compliance.anonymize_generic_apply. Kraever has_permission(employees,anonymize,true) + aktiverede strategier.';
