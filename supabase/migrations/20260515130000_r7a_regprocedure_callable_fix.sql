-- R7a: regprocedure callable fix.
--
-- BAGGRUND (Codex v1 Fund #1):
-- `v_proc::text` på regprocedure returnerer signaturen
-- "schema.fn(text, text)". Brugt i dynamic SQL bliver det
-- "schema.fn(text, text)($1, $2)" — ugyldig syntax. EXECUTE fejler.
--
-- FIX (Codex v2 Fund #2 — pg_proc-lookup, ikke manuel split):
-- Bevar regprocedure-cast som validering (eksistens + signatur).
-- Slå callable identifier op via pg_proc/pg_namespace via OID.
-- Brug v_callable i format(), ikke v_proc::text.
--
-- AFFECTED (fra V2.1-recon 2026-05-15):
-- 1. core_compliance.anonymize_generic_apply (pg_proc)
-- 2. core_compliance.break_glass_execute (pg_proc)
-- 3. core_compliance.replay_anonymization (pg_proc)
-- 4. cron.job 'retention_cleanup_daily' (jobid=10)
--
-- G036 Option A: cron-body's BÅDE regprocedure-fix OG R7d's status='active'-
-- fix kombineres i denne migration (én cron.unschedule + cron.schedule).
-- R7d rører ikke cron'en. Forhindrer race-window mellem R7a og R7d.
--
-- G038: cron.unschedule via jobid-lookup, ikke navn.

-- ─── 1. anonymize_generic_apply ────────────────────────────────────────────
create or replace function core_compliance.anonymize_generic_apply(
  p_entity_type text, p_entity_id uuid, p_change_reason text
) returns jsonb
language plpgsql security definer set search_path = ''
as $func$
declare
  v_mapping core_compliance.anonymization_mappings;
  v_pii_col record;
  v_strategy core_compliance.anonymization_strategies;
  v_strategy_name text;
  v_proc regprocedure;
  v_callable text;
  v_sql text;
  v_set_clauses text[] := array[]::text[];
  v_field_snapshot jsonb := '{}'::jsonb;
  v_returned_id uuid;
  v_stale_keys text[];
  v_pii_count integer := 0;
begin
  if p_entity_type is null or length(trim(p_entity_type)) = 0 then
    raise exception 'entity_type er paakraevet' using errcode = '22023';
  end if;
  if p_entity_id is null then raise exception 'entity_id er paakraevet' using errcode = '22023'; end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;

  select * into v_mapping from core_compliance.anonymization_mappings
   where entity_type = p_entity_type and status = 'active' and is_active = true;
  if v_mapping.id is null then
    raise exception 'ingen aktiveret anonymization_mapping for entity_type=% (aktiver via anonymization_mapping_activate-RPC)', p_entity_type
      using errcode = 'P0002';
  end if;

  select array_agg(key) into v_stale_keys
    from jsonb_object_keys(v_mapping.field_strategies) as keys(key)
   where not exists (
     select 1 from information_schema.columns c
     join core_compliance.data_field_definitions df
       on df.table_schema = c.table_schema and df.table_name = c.table_name and df.column_name = c.column_name
      where c.table_schema = v_mapping.table_schema and c.table_name = v_mapping.table_name
        and c.column_name = keys.key and df.pii_level = 'direct'
   );
  if v_stale_keys is not null and array_length(v_stale_keys, 1) > 0 then
    raise exception 'stale field_strategies-keys: %', v_stale_keys using errcode = 'P0001';
  end if;

  for v_pii_col in
    select c.column_name from information_schema.columns c
    join core_compliance.data_field_definitions df
      on df.table_schema = c.table_schema and df.table_name = c.table_name and df.column_name = c.column_name
     where c.table_schema = v_mapping.table_schema and c.table_name = v_mapping.table_name and df.pii_level = 'direct'
     order by c.column_name
  loop
    v_pii_count := v_pii_count + 1;
    v_strategy_name := v_mapping.field_strategies->>v_pii_col.column_name;
    if v_strategy_name is null then
      raise exception 'PII-coverage-fejl: kolonne %.%.% mangler strategi',
        v_mapping.table_schema, v_mapping.table_name, v_pii_col.column_name using errcode = 'P0001';
    end if;
    select * into v_strategy from core_compliance.anonymization_strategies
     where strategy_name = v_strategy_name and status = 'active';
    if v_strategy.id is null then
      raise exception 'strategy "%" er ikke active', v_strategy_name using errcode = 'P0001';
    end if;
    -- R7a: regprocedure-cast som validering
    v_proc := (v_strategy.function_schema || '.' || v_strategy.function_name || '(text, text)')::regprocedure;
    -- R7a: callable identifier via pg_proc-lookup (Codex v2 Fund #2)
    select quote_ident(n.nspname) || '.' || quote_ident(p.proname)
      into v_callable
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where p.oid = v_proc;
    v_set_clauses := v_set_clauses || (format('%I = %s(%I, $1)', v_pii_col.column_name, v_callable, v_pii_col.column_name));
    v_field_snapshot := v_field_snapshot || jsonb_build_object(
      v_pii_col.column_name, jsonb_build_object('strategy', v_strategy_name, 'strategy_id', v_strategy.id));
  end loop;

  if v_pii_count = 0 then
    raise exception 'ingen pii_level=direct kolonner fundet for %.%', v_mapping.table_schema, v_mapping.table_name
      using errcode = 'P0001';
  end if;

  v_sql := format('update %I.%I set %s, %I = now() where id = $2 and %I is null returning id',
    v_mapping.table_schema, v_mapping.table_name,
    array_to_string(v_set_clauses, ', '),
    v_mapping.anonymized_check_column, v_mapping.anonymized_check_column);

  perform set_config(format('stork.allow_%s_write', v_mapping.table_name), 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'anonymization: ' || p_change_reason, true);

  execute v_sql using p_entity_id::text, p_entity_id into v_returned_id;

  if v_returned_id is null then
    raise exception 'entity % af type % findes ikke eller er allerede anonymized', p_entity_id, p_entity_type using errcode = 'P0002';
  end if;

  perform set_config('stork.allow_anonymization_state_write', 'true', true);
  insert into core_compliance.anonymization_state (
    entity_type, entity_id, anonymization_reason,
    field_mapping_snapshot, jsonb_field_mapping_snapshot,
    strategy_version, created_by
  ) values (
    p_entity_type, p_entity_id, p_change_reason,
    v_field_snapshot, v_field_snapshot,
    v_mapping.strategy_version, core_identity.current_employee_id()
  );

  return jsonb_build_object(
    'entity_type', p_entity_type, 'entity_id', p_entity_id,
    'columns_anonymized', v_pii_count, 'field_snapshot', v_field_snapshot,
    'mapping_id', v_mapping.id, 'strategy_version', v_mapping.strategy_version
  );
end;
$func$;

-- ─── 2. break_glass_execute ────────────────────────────────────────────────
create or replace function core_compliance.break_glass_execute(p_request_id uuid)
returns core_compliance.break_glass_requests
language plpgsql security definer set search_path = ''
as $func$
declare
  v_request core_compliance.break_glass_requests;
  v_operation core_compliance.break_glass_operation_types;
  v_actor_id uuid;
  v_row core_compliance.break_glass_requests;
  v_proc regprocedure;
  v_callable text;
begin
  if not core_identity.has_permission('break_glass', 'execute', true) then
    raise exception 'break_glass_execute kraever permission break_glass.execute.can_edit'
      using errcode = '42501';
  end if;
  v_actor_id := core_identity.current_employee_id();
  if v_actor_id is null then
    raise exception 'kan ikke identificere executor' using errcode = '42501';
  end if;

  select * into v_request from core_compliance.break_glass_requests where id = p_request_id for update;
  if v_request.id is null then
    raise exception 'break_glass_request ikke fundet: %', p_request_id using errcode = 'P0002';
  end if;
  if v_request.status <> 'approved' then
    raise exception 'break_glass_request er ikke approved (status=%)', v_request.status using errcode = 'P0001';
  end if;
  if v_request.expires_at < now() then
    raise exception 'break_glass_request er udløbet (expires_at=%)', v_request.expires_at using errcode = 'P0001';
  end if;
  if v_actor_id <> v_request.requested_by and v_actor_id <> v_request.approved_by then
    raise exception 'kun requester eller approver kan execute (actor=%)', v_actor_id using errcode = '42501';
  end if;

  -- R7d: kraev status='active' (ikke kun is_active=true)
  select * into v_operation from core_compliance.break_glass_operation_types
   where operation_type = v_request.operation_type and status = 'active' and is_active = true;
  if v_operation.id is null then
    raise exception 'operation_type % ikke længere aktiv (kraever status=active AND is_active=true)', v_request.operation_type
      using errcode = 'P0001';
  end if;

  begin
    v_proc := (v_operation.internal_rpc || '(uuid, text)')::regprocedure;
  exception when undefined_function then
    raise exception 'break_glass operation_type % har ugyldig internal_rpc=%: funktion eksisterer ikke eller forkert signatur',
      v_request.operation_type, v_operation.internal_rpc
      using errcode = 'P0001';
  end;

  -- R7a: callable via pg_proc-lookup
  select quote_ident(n.nspname) || '.' || quote_ident(p.proname)
    into v_callable
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where p.oid = v_proc;

  perform set_config('stork.break_glass_dispatch', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason',
    'break_glass_execute: ' || v_request.operation_type || ' request_id=' || p_request_id, true);

  execute format('select %s($1, $2)', v_callable)
    using v_request.target_id, 'break_glass request_id=' || p_request_id;

  perform set_config('stork.allow_break_glass_requests_write', 'true', true);
  update core_compliance.break_glass_requests
     set status = 'executed', executed_at = now(), executed_by = v_actor_id
   where id = p_request_id returning * into v_row;

  return v_row;
end;
$func$;

-- ─── 3. replay_anonymization ───────────────────────────────────────────────
create or replace function core_compliance.replay_anonymization(
  p_entity_type text default null,
  p_dry_run boolean default false
)
returns jsonb
language plpgsql security definer set search_path = ''
as $function$
declare
  v_state record; v_mapping core_compliance.anonymization_mappings;
  v_total integer := 0; v_replayed integer := 0;
  v_skipped integer := 0; v_errors integer := 0;
  v_error_details jsonb := '[]'::jsonb;
  v_master_anonymized boolean;
  v_proc regprocedure;
  v_callable text;
  v_check_sql text;
begin
  if not core_identity.has_permission('anonymization', 'replay', true) then
    raise exception 'replay_anonymization kraever permission anonymization.replay.can_edit'
      using errcode = '42501';
  end if;
  for v_state in
    select * from core_compliance.anonymization_state
     where (p_entity_type is null or entity_type = p_entity_type)
     order by anonymized_at asc
  loop
    v_total := v_total + 1;
    -- R7d: kraev status='active' (ikke kun is_active=true)
    select * into v_mapping from core_compliance.anonymization_mappings
     where entity_type = v_state.entity_type and status = 'active' and is_active = true;
    if v_mapping.id is null then
      v_skipped := v_skipped + 1; continue;
    end if;
    v_check_sql := format('select %I is not null from %I.%I where id = $1',
      v_mapping.anonymized_check_column, v_mapping.table_schema, v_mapping.table_name);
    begin
      execute v_check_sql using v_state.entity_id into v_master_anonymized;
    exception when others then
      v_errors := v_errors + 1;
      v_error_details := v_error_details || jsonb_build_object(
        'entity_id', v_state.entity_id, 'reason', 'master-check fejlede: ' || sqlerrm);
      continue;
    end;
    if v_master_anonymized is null then
      v_errors := v_errors + 1;
      v_error_details := v_error_details || jsonb_build_object(
        'entity_id', v_state.entity_id, 'reason', 'master-row mangler');
      continue;
    end if;
    if v_master_anonymized then
      v_skipped := v_skipped + 1; continue;
    end if;
    if not p_dry_run then
      begin
        v_proc := (v_mapping.internal_rpc_apply || '(uuid, jsonb, text)')::regprocedure;
      exception when undefined_function then
        v_errors := v_errors + 1;
        v_error_details := v_error_details || jsonb_build_object(
          'entity_id', v_state.entity_id,
          'reason', 'internal_rpc_apply ' || v_mapping.internal_rpc_apply || ' findes ikke');
        continue;
      end;
      -- R7a: callable via pg_proc-lookup
      select quote_ident(n.nspname) || '.' || quote_ident(p.proname)
        into v_callable
        from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where p.oid = v_proc;
      begin
        execute format('select %s($1, $2, $3)', v_callable)
          using v_state.entity_id, v_state.field_mapping_snapshot,
                'replay: ' || v_state.anonymization_reason;
        v_replayed := v_replayed + 1;
      exception when others then
        v_errors := v_errors + 1;
        v_error_details := v_error_details || jsonb_build_object(
          'entity_id', v_state.entity_id, 'reason', 'apply fejlede: ' || sqlerrm);
      end;
    else
      v_replayed := v_replayed + 1;
    end if;
  end loop;
  return jsonb_build_object('total', v_total, 'replayed', v_replayed, 'skipped', v_skipped,
    'errors', v_errors, 'error_details', v_error_details, 'dry_run', p_dry_run, 'executed_at', now());
end;
$function$;

-- ─── 4. retention_cleanup_daily cron-body (G036 Option A: kombineret fix) ──
-- R7a (regprocedure) + R7d (is_active + status='active'-check) i én cron-body.
-- G038: cron.unschedule via jobid-lookup.

do $$
declare v_id bigint;
begin
  select jobid into v_id from cron.job where jobname = 'retention_cleanup_daily' limit 1;
  if v_id is not null then perform cron.unschedule(v_id); end if;
end $$;

select cron.schedule(
  'retention_cleanup_daily',
  '30 2 * * *',
  $cron$
do $do$
declare
  v_started timestamptz := clock_timestamp();
  v_mapping record; v_max_days_after integer; v_cutoff_date date;
  v_candidate record; v_processed integer := 0; v_anonymized integer := 0;
  v_errors integer := 0; v_error_details text := ''; v_error text;
  v_proc regprocedure; v_callable text; v_sql text;
begin
  perform set_config('stork.source_type', 'cron', true);
  perform set_config('stork.change_reason', 'cron: generisk retention-cleanup (R7a+R7d fix)', true);
  for v_mapping in
    select * from core_compliance.anonymization_mappings
     where status = 'active' and is_active = true and retention_event_column is not null
  loop
    select max(((retention_value->>'days_after')::integer))
      into v_max_days_after
      from core_compliance.data_field_definitions
     where table_schema = v_mapping.table_schema
       and table_name = v_mapping.table_name
       and retention_type = 'event_based';
    if v_max_days_after is null then continue; end if;
    v_cutoff_date := (current_date - (v_max_days_after || ' days')::interval)::date;
    begin
      v_proc := (v_mapping.internal_rpc_anonymize || '(uuid, text)')::regprocedure;
    exception when undefined_function then
      v_errors := v_errors + 1;
      v_error_details := v_error_details || ' [mapping=' || v_mapping.entity_type
        || ' internal_rpc=' || v_mapping.internal_rpc_anonymize || ' findes ikke]';
      continue;
    end;
    -- R7a: callable via pg_proc-lookup
    select quote_ident(n.nspname) || '.' || quote_ident(p.proname)
      into v_callable
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where p.oid = v_proc;
    v_sql := format('select id from %I.%I where %I is null and %I <= $1',
      v_mapping.table_schema, v_mapping.table_name,
      v_mapping.anonymized_check_column, v_mapping.retention_event_column);
    for v_candidate in execute v_sql using v_cutoff_date loop
      v_processed := v_processed + 1;
      begin
        execute format('select %s($1, $2)', v_callable)
          using v_candidate.id,
                'retention: ' || v_max_days_after || ' dage efter '
                || v_mapping.retention_event_column;
        v_anonymized := v_anonymized + 1;
      exception when others then
        v_errors := v_errors + 1;
        v_error_details := v_error_details || ' [' || v_candidate.id || ': ' || sqlerrm || ']';
      end;
    end loop;
  end loop;
  perform core_compliance.cron_heartbeat_record(
    'retention_cleanup_daily', '30 2 * * *',
    case when v_errors = 0 then 'ok' when v_anonymized > 0 then 'partial_failure' else 'failure' end,
    case when v_errors = 0 and v_anonymized = 0 then null
         when v_errors = 0 then 'anonymized ' || v_anonymized || ' entities'
         else 'processed=' || v_processed || ' anonymized=' || v_anonymized
              || ' errors=' || v_errors || v_error_details end,
    (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer);
exception when others then
  v_error := sqlerrm;
  perform core_compliance.cron_heartbeat_record(
    'retention_cleanup_daily', '30 2 * * *', 'failure', v_error,
    (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer);
  raise;
end;
$do$;
  $cron$
);
