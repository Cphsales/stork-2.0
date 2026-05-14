-- Q-AUDIT: konvertér 4 audit-RPC'er fra is_admin() til has_permission().
--
-- BAGGRUND (master-plan rettelse 31):
-- Permissions er UI-baserede via role_page_permissions, ikke is_admin().
-- Kun superadmin_settings_update beholder is_admin() (superadmin-anker).
--
-- KONVERTERINGER:
-- - audit_log_read           → has_permission('audit', 'log', false)
-- - anonymization_state_read → has_permission('audit', 'anonymization', false)
-- - cron_heartbeats_read     → has_permission('audit', 'cron', false)
-- - cron_heartbeats_export   → has_permission('audit', 'cron', true)

create or replace function core_compliance.audit_log_read(
  p_table_schema text default null,
  p_table_name text default null,
  p_record_id uuid default null,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_limit integer default 100
)
returns setof core_compliance.audit_log
language plpgsql security definer set search_path = ''
as $function$
begin
  if not core_identity.has_permission('audit', 'log', false) then
    raise exception 'audit_log_read kraever permission audit.log'
      using errcode = '42501';
  end if;

  return query
    select *
    from core_compliance.audit_log
    where (p_table_schema is null or table_schema = p_table_schema)
      and (p_table_name is null or table_name = p_table_name)
      and (p_record_id is null or record_id = p_record_id)
      and (p_from is null or occurred_at >= p_from)
      and (p_to is null or occurred_at <= p_to)
    order by occurred_at desc
    limit greatest(p_limit, 0);
end;
$function$;

create or replace function core_compliance.anonymization_state_read(
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_limit integer default 100
)
returns setof core_compliance.anonymization_state
language plpgsql security definer set search_path = ''
as $function$
begin
  if not core_identity.has_permission('audit', 'anonymization', false) then
    raise exception 'anonymization_state_read kraever permission audit.anonymization'
      using errcode = '42501';
  end if;
  return query
    select * from core_compliance.anonymization_state
    where (p_entity_type is null or entity_type = p_entity_type)
      and (p_entity_id is null or entity_id = p_entity_id)
      and (p_from is null or anonymized_at >= p_from)
      and (p_to is null or anonymized_at <= p_to)
    order by anonymized_at desc
    limit greatest(p_limit, 0);
end;
$function$;

create or replace function core_compliance.cron_heartbeats_read()
returns setof core_compliance.cron_heartbeats
language plpgsql security definer set search_path = ''
as $function$
begin
  if not core_identity.has_permission('audit', 'cron', false) then
    raise exception 'cron_heartbeats_read kraever permission audit.cron'
      using errcode = '42501';
  end if;
  return query select * from core_compliance.cron_heartbeats order by job_name;
end;
$function$;

create or replace function core_compliance.cron_heartbeats_export()
returns table(metric text, label_job_name text, label_status text, value double precision)
language plpgsql security definer set search_path = ''
as $function$
begin
  if not core_identity.has_permission('audit', 'cron', true) then
    raise exception 'cron_heartbeats_export kraever permission audit.cron.can_edit'
      using errcode = '42501';
  end if;

  return query
    select 'stork_cron_run_count_total'::text, h.job_name, h.last_status,
           h.run_count::double precision
    from core_compliance.cron_heartbeats h
    union all
    select 'stork_cron_failure_count_total'::text, h.job_name, h.last_status,
           h.failure_count::double precision
    from core_compliance.cron_heartbeats h
    union all
    select 'stork_cron_last_duration_ms'::text, h.job_name, h.last_status,
           coalesce(h.last_duration_ms, 0)::double precision
    from core_compliance.cron_heartbeats h
    union all
    select 'stork_cron_seconds_since_success'::text, h.job_name, h.last_status,
           coalesce(extract(epoch from (now() - h.last_successful_run_at)), -1)::double precision
    from core_compliance.cron_heartbeats h;
end;
$function$;
