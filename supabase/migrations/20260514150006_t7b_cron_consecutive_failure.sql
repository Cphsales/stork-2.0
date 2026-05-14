-- Trin 7b: udvid cron_heartbeats med consecutive_failure_count.
--
-- Master-plan §1.6 + §1.5: "Hvis auto-lock cron fejler 3 gange i træk → kritisk
-- alert til Mathias". Generaliseres som consecutive_failure_count på alle cron-jobs.
--
-- ALTER cron_heartbeats: tilføj consecutive_failure_count integer default 0.
-- Opdater cron_heartbeat_record(): ok → reset til 0; failure → increment.
-- Healthcheck() udvides med jobs_with_consecutive_failures-tæller.

alter table core_compliance.cron_heartbeats
  add column consecutive_failure_count integer not null default 0;

comment on column core_compliance.cron_heartbeats.consecutive_failure_count is
  'Master-plan §1.6: tæller på hinanden følgende failures siden sidste ok. Reset til 0 ved ok-status. ≥3 = kritisk alert.';

-- Opdater cron_heartbeat_record til at maintain consecutive_failure_count.
create or replace function core_compliance.cron_heartbeat_record(
  p_job_name text,
  p_schedule text,
  p_status text,
  p_error text default null,
  p_duration_ms integer default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in ('ok', 'failure', 'skipped', 'partial_failure') then
    raise exception 'invalid status %', p_status using errcode = '22023';
  end if;

  insert into core_compliance.cron_heartbeats (
    job_name, schedule, last_run_at, last_status, last_error, last_duration_ms,
    last_successful_run_at, run_count, failure_count, consecutive_failure_count
  ) values (
    p_job_name, p_schedule, now(), p_status, p_error, p_duration_ms,
    case when p_status = 'ok' then now() else null end,
    1,
    case when p_status = 'failure' then 1 else 0 end,
    case when p_status = 'failure' then 1 else 0 end
  )
  on conflict (job_name) do update set
    schedule = excluded.schedule,
    last_run_at = excluded.last_run_at,
    last_status = excluded.last_status,
    last_error = excluded.last_error,
    last_duration_ms = excluded.last_duration_ms,
    last_successful_run_at = case
      when excluded.last_status = 'ok' then excluded.last_run_at
      else core_compliance.cron_heartbeats.last_successful_run_at
    end,
    run_count = core_compliance.cron_heartbeats.run_count + 1,
    failure_count = core_compliance.cron_heartbeats.failure_count
      + case when excluded.last_status = 'failure' then 1 else 0 end,
    consecutive_failure_count = case
      when excluded.last_status = 'ok' then 0
      when excluded.last_status = 'failure' then core_compliance.cron_heartbeats.consecutive_failure_count + 1
      else core_compliance.cron_heartbeats.consecutive_failure_count
    end,
    updated_at = now();
end;
$$;

-- Healthcheck udvides
create or replace function core_compliance.healthcheck()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
  v_failures integer;
  v_stale integer;
  v_consecutive_failures integer;
begin
  select count(*) into v_failures
  from core_compliance.cron_heartbeats
  where last_status = 'failure';

  select count(*) into v_stale
  from core_compliance.cron_heartbeats
  where is_enabled = true
    and (last_successful_run_at is null
         or last_successful_run_at < now() - interval '1 day');

  select count(*) into v_consecutive_failures
  from core_compliance.cron_heartbeats
  where consecutive_failure_count >= 3;

  v_result := jsonb_build_object(
    'timestamp', now(),
    'database_version', current_setting('server_version'),
    'cron_jobs_total', (select count(*) from core_compliance.cron_heartbeats),
    'cron_jobs_failing', v_failures,
    'cron_jobs_stale', v_stale,
    'cron_jobs_consecutive_failures_critical', v_consecutive_failures,
    'audit_log_partition_count', (
      select count(*) from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'core_compliance'
        and c.relname like 'audit_log_%'
        and c.relkind = 'r'
    )
  );

  return v_result;
end;
$$;
