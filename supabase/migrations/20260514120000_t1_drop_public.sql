-- Trin 1 / fundament — DROP fase 0-tabeller fra public-schemaet.
--
-- Baggrund: Fase 0 (C1-D7) byggede 17 tabeller direkte i public. Master-planens
-- rettelse 17 låste schema-grænser fra trin 1. Rettelse 18-20 har ændret design
-- nok til at ALTER TABLE SET SCHEMA ikke ville være nok — strukturen skal
-- genskabes i core_*-schemas med ny model (partitionering, anonymization_state,
-- break_glass_requests, closure-table mfl.).
--
-- Mathias har godkendt drop-CASCADE (rettelse 20-eksekvering B2(a)).
--
-- Fase 0-data der mistes:
--  - audit_log (188 rows): historik fra fase 0-bygning, ikke produktion
--  - data_field_definitions (143 rows): seedes igen via classification.json
--  - employees mg@ + km@: genskabes i bootstrap-step (t1_08)
--  - pay_periods (auto-genereret af cron): genskabes ved trin 7-bygning
--  - Test-rows i clients/org_units/teams/employee_teams/client_teams: ikke produktion
--
-- Cron-jobs droppes også — genskabes med ny schema-tilhørsforhold.

-- Cron-jobs først (de refererer public-funktioner).
do $$
declare
  v_job record;
begin
  for v_job in select jobname from cron.job loop
    perform cron.unschedule(v_job.jobname);
  end loop;
end;
$$;

-- Drop tabeller med CASCADE — fjerner FK'er, triggers, indexes, policies.
drop table if exists public.client_teams cascade;
drop table if exists public.employee_teams cascade;
drop table if exists public.teams cascade;
drop table if exists public.org_units cascade;
drop table if exists public.client_field_definitions cascade;
drop table if exists public.clients cascade;
drop table if exists public.role_page_permissions cascade;
drop table if exists public.roles cascade;
drop table if exists public.employees cascade;
drop table if exists public.cancellations cascade;
drop table if exists public.salary_corrections cascade;
drop table if exists public.commission_snapshots cascade;
drop table if exists public.pay_periods cascade;
drop table if exists public.pay_period_settings cascade;
drop table if exists public.cron_heartbeats cascade;
drop table if exists public.data_field_definitions cascade;
drop table if exists public.audit_log cascade;

-- Drop standalone funktioner (trigger-funktioner blev fjernet via CASCADE).
drop function if exists public.audit_filter_values(text, text, jsonb) cascade;
drop function if exists public.audit_log_read(text, text, uuid, timestamptz, timestamptz, integer) cascade;
drop function if exists public.audit_log_immutability_check() cascade;
drop function if exists public.block_truncate_immutable() cascade;
drop function if exists public.cancellations_immutability_check() cascade;
drop function if exists public.client_assign_to_team(uuid, uuid, date, text) cascade;
drop function if exists public.client_field_definition_upsert(text, text, text, boolean, text, text, integer, boolean, text) cascade;
drop function if exists public.client_team_at(uuid, date) cascade;
drop function if exists public.client_teams_immutability_check() cascade;
drop function if exists public.client_upsert(uuid, text, jsonb, text) cascade;
drop function if exists public.clients_validate_fields() cascade;
drop function if exists public.commission_snapshots_immutability_check() cascade;
drop function if exists public.cron_heartbeat_record(text, text, text, text, integer) cascade;
drop function if exists public.cron_heartbeats_read() cascade;
drop function if exists public.current_employee_id() cascade;
drop function if exists public.current_employee_org_unit() cascade;
drop function if exists public.current_employee_subtree_teams() cascade;
drop function if exists public.current_employee_team() cascade;
drop function if exists public.data_field_definition_delete(text, text, text, text) cascade;
drop function if exists public.data_field_definition_upsert(text, text, text, text, text, text, jsonb, text, text, text) cascade;
drop function if exists public.data_field_definitions_validate_retention() cascade;
drop function if exists public.employee_assign_to_org_unit(uuid, uuid, text) cascade;
drop function if exists public.employee_assign_to_team(uuid, uuid, date, text) cascade;
drop function if exists public.employee_team_at(uuid, date) cascade;
drop function if exists public.employee_teams_immutability_check() cascade;
drop function if exists public.employee_terminate(uuid, date, text) cascade;
drop function if exists public.employee_upsert(uuid, uuid, text, text, text, date, date, uuid, text) cascade;
drop function if exists public.is_admin() cascade;
drop function if exists public.on_period_lock() cascade;
drop function if exists public.org_unit_subtree(uuid) cascade;
drop function if exists public.org_unit_upsert(uuid, text, uuid, boolean, text) cascade;
drop function if exists public.org_units_prevent_cycle() cascade;
drop function if exists public.pay_period_for_date(date) cascade;
drop function if exists public.pay_period_settings_update(integer, text) cascade;
drop function if exists public.pay_periods_lock_and_delete_check() cascade;
drop function if exists public.role_page_permission_upsert(uuid, text, text, boolean, boolean, text, text) cascade;
drop function if exists public.role_upsert(uuid, text, text, text) cascade;
drop function if exists public.salary_corrections_immutability_check() cascade;
drop function if exists public.salary_corrections_validate_target() cascade;
drop function if exists public.set_updated_at() cascade;
drop function if exists public.stork_audit() cascade;
drop function if exists public.team_upsert(uuid, text, uuid, boolean, text) cascade;
