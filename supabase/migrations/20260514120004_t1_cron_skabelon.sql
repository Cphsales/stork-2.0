-- Trin 1 / fundament — cron-skabelon med heartbeats + healthcheck.
--
-- Master-plan §1.5 drift-skabelon + §1.14 (eksternt monitoring integration-punkter).
--
-- Heartbeats-tabel: én row pr. cron-job. Hver eksekvering opdaterer last_run_at,
-- last_status, last_error, last_duration_ms.
--
-- ENABLE RLS (ikke FORCE — §1.1 undtagelse). 0 SELECT-policies. Læsning via RPC.
--
-- Audit-trigger med WHEN-filter: kun failure-status auditeres (ellers støj).
--
-- cron-change-reason: t1 fundament — cron-skabelon.

-- ─── Extensions ──────────────────────────────────────────────────────────
create extension if not exists pg_cron;
create extension if not exists btree_gist;
create extension if not exists pg_net;

-- ─── cron_heartbeats ─────────────────────────────────────────────────────
create table core_compliance.cron_heartbeats (
  job_name text primary key,
  schedule text not null,
  is_enabled boolean not null default true,
  last_run_at timestamptz,
  last_status text check (last_status in ('ok', 'failure', 'skipped', 'partial_failure')),
  last_error text,
  last_duration_ms integer,
  last_successful_run_at timestamptz,
  run_count integer not null default 0,
  failure_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table core_compliance.cron_heartbeats is
  'Master-plan §1.5: én row pr. cron-job. Hver eksekvering opdaterer status. ENABLE RLS, 0 policies — læs via cron_heartbeats_read() RPC, eksport via cron_heartbeats_export() RPC.';

alter table core_compliance.cron_heartbeats enable row level security;
-- Ikke FORCE — §1.1 undtagelse.

revoke all on table core_compliance.cron_heartbeats from public, authenticated, anon, service_role;

-- ─── cron_heartbeat_record() — kaldes fra cron-bodies ────────────────────
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
    last_successful_run_at, run_count, failure_count
  ) values (
    p_job_name, p_schedule, now(), p_status, p_error, p_duration_ms,
    case when p_status = 'ok' then now() else null end,
    1,
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
    updated_at = now();
end;
$$;

revoke all on function core_compliance.cron_heartbeat_record(text, text, text, text, integer) from public;
grant execute on function core_compliance.cron_heartbeat_record(text, text, text, text, integer) to service_role;

-- ─── cron_heartbeats_read() — UI-overblik ─────────────────────────────────
create or replace function core_compliance.cron_heartbeats_read()
returns setof core_compliance.cron_heartbeats
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not core_identity.is_admin() then
    raise exception 'cron_heartbeats_read kræver admin-permission' using errcode = '42501';
  end if;
  return query select * from core_compliance.cron_heartbeats order by job_name;
end;
$$;

revoke all on function core_compliance.cron_heartbeats_read() from public;
grant execute on function core_compliance.cron_heartbeats_read() to authenticated;

-- ─── healthcheck() — generelt status-overblik ────────────────────────────
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
begin
  select count(*) into v_failures
  from core_compliance.cron_heartbeats
  where last_status = 'failure';

  select count(*) into v_stale
  from core_compliance.cron_heartbeats
  where is_enabled = true
    and (last_successful_run_at is null
         or last_successful_run_at < now() - interval '1 day');

  v_result := jsonb_build_object(
    'timestamp', now(),
    'database_version', current_setting('server_version'),
    'cron_jobs_total', (select count(*) from core_compliance.cron_heartbeats),
    'cron_jobs_failing', v_failures,
    'cron_jobs_stale', v_stale,
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

revoke all on function core_compliance.healthcheck() from public;
grant execute on function core_compliance.healthcheck() to authenticated;

-- ─── cron_heartbeats_export() — Prometheus-kompatibel ────────────────────
-- Returnerer flat key-value-array klar til Prometheus/Grafana-format.
-- Master-plan §1.14: integration-punkter forberedes i lag E.

create or replace function core_compliance.cron_heartbeats_export()
returns table(metric text, label_job_name text, label_status text, value double precision)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not core_identity.is_admin() then
    raise exception 'cron_heartbeats_export kræver admin-permission' using errcode = '42501';
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
$$;

revoke all on function core_compliance.cron_heartbeats_export() from public;
grant execute on function core_compliance.cron_heartbeats_export() to authenticated;

-- ─── Audit-trigger med WHEN-filter (kun failure auditeres) ───────────────
create trigger cron_heartbeats_audit
  after insert or update on core_compliance.cron_heartbeats
  for each row
  when (new.last_status = 'failure')
  execute function core_compliance.stork_audit();

-- ─── Cron-job: ensure_audit_partition ────────────────────────────────────
-- Kører dagligt kl. 02:00 UTC. Sikrer at audit-partitioner findes 2 mdr frem.
-- cron-change-reason: t1 fundament — daglig partition-buffer for audit_log.

select cron.schedule(
  'ensure_audit_partition',
  '0 2 * * *',
  $cron$
  do $do$
  declare
    v_started timestamptz := clock_timestamp();
    v_created integer;
    v_error text;
  begin
    perform set_config('stork.source_type', 'cron', true);
    perform set_config('stork.change_reason', 'cron: ensure-audit-partition', true);

    v_created := core_compliance.ensure_audit_partition(2);

    perform core_compliance.cron_heartbeat_record(
      'ensure_audit_partition', '0 2 * * *', 'ok',
      case when v_created > 0 then 'created ' || v_created || ' partitions' else null end,
      (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer
    );
  exception when others then
    v_error := sqlerrm;
    perform core_compliance.cron_heartbeat_record(
      'ensure_audit_partition', '0 2 * * *', 'failure', v_error,
      (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer
    );
    raise;
  end;
  $do$;
  $cron$
);
