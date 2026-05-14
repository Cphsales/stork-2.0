-- C005: Admin-floor count matcher is_admin(); trigger inkluderer termination_date.
--
-- BAGGRUND (Codex-fund C005):
-- enforce_admin_floor() count'er kun via anonymized_at IS NULL, men is_admin()
-- filtrerer også termination_date. employee_terminate ændrer kun
-- termination_date, og floor-triggeren lytter ikke på den kolonne. Systemet
-- kan dermed ende under minimum aktive admins.
--
-- MASTER-PLAN-PARAGRAF:
-- §1.7 superadmin-floor: "min N medarbejdere bevarer admin-permission".
-- "Aktiv" defineres af is_admin() (anonymized_at IS NULL + termination_date
-- IS NULL eller > today).
--
-- VALGT LØSNING:
-- 1. Opdater enforce_admin_floor()-count med samme termination_date-filter
-- 2. Udvid employees-trigger OF-liste med termination_date
--
-- VISION-TJEK:
-- - §1.7 opfyldt? JA — floor håndhæves nu for alle tre veje (rolle, anonymize, terminate)
-- - Symptom vs. krav: count matcher nu is_admin()-semantik. Strukturelt fix, ikke patch.
-- - Konklusion: FORSVARLIGT.

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Opdater enforce_admin_floor()-funktion: tilføj termination_date-filter
-- ─────────────────────────────────────────────────────────────────────────

create or replace function core_identity.enforce_admin_floor()
returns trigger
language plpgsql
security definer
set search_path = ''
as $func$
declare
  v_active_admins integer;
  v_min_admins integer;
begin
  select min_admin_count into v_min_admins
    from core_compliance.superadmin_settings where id = 1;

  -- Count matcher is_admin()-semantik: anonymized_at IS NULL OG
  -- (termination_date IS NULL eller fremtidig). C005-fix tilføjer
  -- termination_date-betingelsen så terminerede admins ikke tæller.
  select count(*) into v_active_admins
    from core_identity.employees e
    join core_identity.role_page_permissions p on p.role_id = e.role_id
   where e.anonymized_at is null
     and (e.termination_date is null or e.termination_date >= current_date)
     and p.page_key = 'system'
     and p.tab_key = 'manage'
     and p.scope = 'all'
     and p.can_edit = true;

  if v_active_admins < v_min_admins then
    raise exception 'superadmin-floor overtrådt: % aktive admins er under minimum %', v_active_admins, v_min_admins
      using errcode = 'P0001',
            hint = 'Mindst ' || v_min_admins || ' admin-medarbejdere skal bevares. Tilføj ny admin før denne ændring.';
  end if;

  return null;  -- AFTER-trigger
end;
$func$;

comment on function core_identity.enforce_admin_floor() is
  'AFTER-trigger der validerer at antal aktive admins er ≥ superadmin_settings.min_admin_count. C005-fix: count matcher is_admin()-semantik (termination_date-filter inkluderet).';

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Udvid employees-trigger OF-liste med termination_date
-- ─────────────────────────────────────────────────────────────────────────

drop trigger if exists employees_enforce_admin_floor on core_identity.employees;

create trigger employees_enforce_admin_floor
  after update of role_id, anonymized_at, termination_date or delete on core_identity.employees
  for each row execute function core_identity.enforce_admin_floor();
