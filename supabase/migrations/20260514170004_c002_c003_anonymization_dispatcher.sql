-- C002 + C003 + G009 + G010 + G011: Anonymization-dispatcher.
--
-- BAGGRUND:
-- C002 (cron-vej brudt): retention_cleanup_daily kaldte anonymize_employee
--   som krævede is_admin(); cron har ingen auth.uid() → fejl ved første kandidat.
-- C003 (replay brudt): replay_anonymization kaldte anonymize_employee som
--   forsøgte INSERT ny anonymization_state-row → UNIQUE-conflict. Brugte
--   også LIVE mapping istedet for snapshot fra state-rækken.
-- G009 (hardkodet 1825d): cron hardkodede dage; ignorerede data_field_definitions.
-- G010 (replay kun employee): ikke generisk for clients/identity-master.
-- G011 (verify kun employee): samme problem som G010.
--
-- MASTER-PLAN-PARAGRAF:
-- §1.4 (anonymisering UPDATE-mønster + replay + retention-cron evaluerer
--       data_field_definitions). §1.13 (juridisk ramme).
-- Rettelse 18 A3 (backup-paradoks løses via snapshot).
--
-- VALGT LØSNING — dispatcher-mønster:
-- 1. Udvid anonymization_mappings med dispatcher-felter
-- 2. Split anonymize_employee i 3 RPC'er + 1 intern apply-helper
-- 3. Refactor retention_cleanup_daily til generisk dispatcher
-- 4. Refactor replay_anonymization til at bruge snapshot + ikke INSERT state
-- 5. Refactor verify_anonymization_consistency til generisk check
--
-- VISION-TJEK:
-- - §1.4 opfyldt? JA — retention læser data_field_definitions (alt drift styres i UI);
--   replay bruger snapshot (backup-paradoks); dispatcher generisk forward-kompat.
-- - §1.13 opfyldt? JA — anonymisering drift-sikker uden auth.uid().
-- - §0 + §1.1 opfyldt? JA — permission via REVOKE/GRANT, ikke current_user.
-- - Symptom vs. krav: dispatcher-arkitektur er master-plan-design, ikke patch.
-- - Konklusion: FORSVARLIGT.

-- ─────────────────────────────────────────────────────────────────────────
-- Step 1: Udvid anonymization_mappings
-- ─────────────────────────────────────────────────────────────────────────

alter table core_compliance.anonymization_mappings
  add column internal_rpc_anonymize text,
  add column internal_rpc_apply text,
  add column anonymized_check_column text not null default 'anonymized_at',
  add column retention_event_column text;

comment on column core_compliance.anonymization_mappings.internal_rpc_anonymize is
  'Fuldt kvalificeret RPC-navn (signatur uuid, text) til normal anonymisering: UPDATE + INSERT state. Bruges af retention-cron-dispatcher.';
comment on column core_compliance.anonymization_mappings.internal_rpc_apply is
  'Fuldt kvalificeret RPC-navn (signatur uuid, jsonb, text) til pure apply: UPDATE only (ingen INSERT state). Bruges af replay-dispatcher med snapshot-strategies.';
comment on column core_compliance.anonymization_mappings.anonymized_check_column is
  'Kolonne på master-tabel der fortæller om entity er anonymiseret (typisk anonymized_at).';
comment on column core_compliance.anonymization_mappings.retention_event_column is
  'Kolonne på master-tabel som retention-cron bruger som event-tidspunkt (typisk termination_date). NULL = ingen event-based retention.';

-- Backfill mapping for employee
select set_config('stork.allow_anonymization_mappings_write', 'true', false);
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason',
  'C002/C003: backfill dispatcher-felter på anonymization_mappings',
  false);

update core_compliance.anonymization_mappings
   set internal_rpc_anonymize = 'core_identity.anonymize_employee_internal',
       internal_rpc_apply = 'core_identity._anonymize_employee_apply',
       anonymized_check_column = 'anonymized_at',
       retention_event_column = 'termination_date'
 where entity_type = 'employee'
   and table_schema = 'core_identity'
   and table_name = 'employees';

alter table core_compliance.anonymization_mappings
  alter column internal_rpc_anonymize set not null,
  alter column internal_rpc_apply set not null;

-- ─────────────────────────────────────────────────────────────────────────
-- Step 2: Split anonymize_employee i apply + admin + internal (service-role)
-- ─────────────────────────────────────────────────────────────────────────

-- _anonymize_employee_apply: pure UPDATE, ingen state-INSERT, ingen permission-check.
-- Tager strategies jsonb som parameter (live mapping eller snapshot).
create or replace function core_identity._anonymize_employee_apply(
  p_employee_id uuid,
  p_strategies jsonb,
  p_reason text
)
returns core_identity.employees
language plpgsql
security definer
set search_path = ''
as $func$
declare
  v_old_email text;
  v_new_first_name text;
  v_new_last_name text;
  v_new_email text;
  v_row core_identity.employees;
begin
  -- Ingen permission-check. Caller håndhæver via GRANT eller is_admin.
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'reason er paakraevet' using errcode = '22023';
  end if;
  if p_strategies is null then
    raise exception 'strategies er paakraevet' using errcode = '22023';
  end if;

  select email into v_old_email from core_identity.employees where id = p_employee_id;
  if v_old_email is null then
    raise exception 'employee ikke fundet: %', p_employee_id using errcode = 'P0002';
  end if;

  v_new_first_name := core_compliance.apply_field_strategy(p_strategies->>'first_name', null);
  v_new_last_name := core_compliance.apply_field_strategy(p_strategies->>'last_name', null);
  v_new_email := core_compliance.apply_field_strategy(p_strategies->>'email', v_old_email);

  perform set_config('stork.allow_employees_write', 'true', true);
  perform set_config('stork.change_reason', 'anonymization_apply: ' || p_reason, true);

  update core_identity.employees
     set first_name = coalesce(v_new_first_name, first_name),
         last_name  = coalesce(v_new_last_name, last_name),
         email      = coalesce(v_new_email, email),
         anonymized_at = now()
   where id = p_employee_id
   returning * into v_row;

  return v_row;
end;
$func$;

comment on function core_identity._anonymize_employee_apply(uuid, jsonb, text) is
  'C002/C003: pure UPDATE-helper. Ingen permission-check, ingen state-INSERT. Tager strategies (live eller snapshot). Caller håndhæver permission og INSERT state.';

revoke all on function core_identity._anonymize_employee_apply(uuid, jsonb, text) from public, anon, authenticated;
grant execute on function core_identity._anonymize_employee_apply(uuid, jsonb, text) to service_role;

-- Helper: state-INSERT (delt mellem admin og internal)
create or replace function core_identity._anonymize_employee_log_state(
  p_employee_id uuid,
  p_reason text,
  p_strategies jsonb,
  p_strategy_version integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $func$
begin
  insert into core_compliance.anonymization_state (
    entity_type, table_schema, table_name, entity_id,
    anonymization_reason, strategy_version, field_mapping_snapshot, created_by
  ) values (
    'employee', 'core_identity', 'employees', p_employee_id,
    p_reason, p_strategy_version, p_strategies, auth.uid()
  );
end;
$func$;

revoke all on function core_identity._anonymize_employee_log_state(uuid, text, jsonb, integer) from public, anon, authenticated;
grant execute on function core_identity._anonymize_employee_log_state(uuid, text, jsonb, integer) to service_role;

-- anonymize_employee: admin-vej. is_admin strict, læser live mapping, kalder apply + log_state.
create or replace function core_identity.anonymize_employee(
  p_employee_id uuid,
  p_reason text
)
returns core_identity.employees
language plpgsql
security definer
set search_path = ''
as $func$
declare
  v_mapping core_compliance.anonymization_mappings;
  v_row core_identity.employees;
begin
  if not core_identity.is_admin() then
    raise exception 'anonymize_employee kraever admin-permission' using errcode = '42501';
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'reason er paakraevet' using errcode = '22023';
  end if;

  select * into v_mapping
    from core_compliance.anonymization_mappings
   where entity_type = 'employee' and is_active = true;
  if v_mapping.id is null then
    raise exception 'ingen aktiv anonymiserings-mapping for employee' using errcode = 'P0002';
  end if;

  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'anonymization: ' || p_reason, true);

  v_row := core_identity._anonymize_employee_apply(p_employee_id, v_mapping.field_strategies, p_reason);
  perform core_identity._anonymize_employee_log_state(
    p_employee_id, p_reason, v_mapping.field_strategies, v_mapping.strategy_version
  );

  return v_row;
end;
$func$;

comment on function core_identity.anonymize_employee(uuid, text) is
  'C002/C003: admin-vej. Strict is_admin(). Læser live mapping; kalder apply + log_state.';

revoke all on function core_identity.anonymize_employee(uuid, text) from public, anon, service_role;
grant execute on function core_identity.anonymize_employee(uuid, text) to authenticated;

-- anonymize_employee_internal: cron-vej. service_role only. Læser live mapping, kalder apply + log_state.
create or replace function core_identity.anonymize_employee_internal(
  p_employee_id uuid,
  p_reason text
)
returns core_identity.employees
language plpgsql
security definer
set search_path = ''
as $func$
declare
  v_mapping core_compliance.anonymization_mappings;
  v_row core_identity.employees;
begin
  -- Ingen is_admin-check; service_role-only via REVOKE/GRANT.
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'reason er paakraevet' using errcode = '22023';
  end if;

  select * into v_mapping
    from core_compliance.anonymization_mappings
   where entity_type = 'employee' and is_active = true;
  if v_mapping.id is null then
    raise exception 'ingen aktiv anonymiserings-mapping for employee' using errcode = 'P0002';
  end if;

  perform set_config('stork.source_type', 'cron', true);
  perform set_config('stork.change_reason', 'anonymization_internal: ' || p_reason, true);

  v_row := core_identity._anonymize_employee_apply(p_employee_id, v_mapping.field_strategies, p_reason);
  perform core_identity._anonymize_employee_log_state(
    p_employee_id, p_reason, v_mapping.field_strategies, v_mapping.strategy_version
  );

  return v_row;
end;
$func$;

comment on function core_identity.anonymize_employee_internal(uuid, text) is
  'C002: cron-vej. service_role only via REVOKE/GRANT. Læser live mapping; kalder apply + log_state.';

revoke all on function core_identity.anonymize_employee_internal(uuid, text) from public, anon, authenticated;
grant execute on function core_identity.anonymize_employee_internal(uuid, text) to service_role;

-- ─────────────────────────────────────────────────────────────────────────
-- Step 3: Generisk retention_cleanup_daily — læser data_field_definitions
-- ─────────────────────────────────────────────────────────────────────────

-- Unschedule gammel
do $unsched$
declare v_job_id bigint;
begin
  select jobid into v_job_id from cron.job where jobname = 'retention_cleanup_daily';
  if v_job_id is not null then
    perform cron.unschedule(v_job_id);
  end if;
end;
$unsched$;

select cron.schedule(
  'retention_cleanup_daily',
  '30 2 * * *',
  $cron$
  do $do$
  declare
    v_started timestamptz := clock_timestamp();
    v_mapping record;
    v_max_days_after integer;
    v_cutoff_date date;
    v_candidate record;
    v_processed integer := 0;
    v_anonymized integer := 0;
    v_errors integer := 0;
    v_error_details text := '';
    v_error text;
    v_proc regprocedure;
    v_sql text;
  begin
    perform set_config('stork.source_type', 'cron', true);
    perform set_config('stork.change_reason',
      'cron: generisk retention-cleanup (G009-fix: læser data_field_definitions)', true);

    -- For hver aktiv mapping med event-based retention
    for v_mapping in
      select * from core_compliance.anonymization_mappings
       where is_active = true and retention_event_column is not null
    loop
      -- Find max days_after fra data_field_definitions for denne tabel
      select max(((retention_value->>'days_after')::integer))
        into v_max_days_after
        from core_compliance.data_field_definitions
       where table_schema = v_mapping.table_schema
         and table_name = v_mapping.table_name
         and retention_type = 'event_based';

      if v_max_days_after is null then
        continue;  -- ingen event-based retention på denne tabel
      end if;

      v_cutoff_date := (current_date - (v_max_days_after || ' days')::interval)::date;

      -- Validér internal_rpc_anonymize eksisterer
      begin
        v_proc := (v_mapping.internal_rpc_anonymize || '(uuid, text)')::regprocedure;
      exception when undefined_function then
        v_errors := v_errors + 1;
        v_error_details := v_error_details || ' [mapping=' || v_mapping.entity_type
          || ' internal_rpc=' || v_mapping.internal_rpc_anonymize || ' findes ikke]';
        continue;
      end;

      -- Dynamic query for kandidater
      v_sql := format(
        'select id from %I.%I where %I is null and %I <= $1',
        v_mapping.table_schema, v_mapping.table_name,
        v_mapping.anonymized_check_column, v_mapping.retention_event_column
      );

      for v_candidate in execute v_sql using v_cutoff_date
      loop
        v_processed := v_processed + 1;
        begin
          execute format('select %s($1, $2)', v_proc::text)
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
      (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer
    );
  exception when others then
    v_error := sqlerrm;
    perform core_compliance.cron_heartbeat_record(
      'retention_cleanup_daily', '30 2 * * *', 'failure', v_error,
      (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer
    );
    raise;
  end;
  $do$;
  $cron$
);

-- ─────────────────────────────────────────────────────────────────────────
-- Step 4: Refactor replay_anonymization — generisk + snapshot + idempotent
-- ─────────────────────────────────────────────────────────────────────────

create or replace function core_compliance.replay_anonymization(
  p_entity_type text default null,
  p_dry_run boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $func$
declare
  v_state record;
  v_mapping core_compliance.anonymization_mappings;
  v_total integer := 0;
  v_replayed integer := 0;
  v_skipped integer := 0;
  v_errors integer := 0;
  v_error_details jsonb := '[]'::jsonb;
  v_master_anonymized boolean;
  v_proc regprocedure;
  v_check_sql text;
begin
  if not core_identity.is_admin() then
    raise exception 'replay_anonymization kraever admin-permission' using errcode = '42501';
  end if;

  for v_state in
    select * from core_compliance.anonymization_state
     where (p_entity_type is null or entity_type = p_entity_type)
     order by anonymized_at asc
  loop
    v_total := v_total + 1;

    select * into v_mapping
      from core_compliance.anonymization_mappings
     where entity_type = v_state.entity_type and is_active = true;

    if v_mapping.id is null then
      -- Ingen mapping for entity_type → skip (forward-kompat ved nye entity-typer)
      v_skipped := v_skipped + 1;
      continue;
    end if;

    -- Tjek om master-row stadig er anonymiseret via dynamic SQL
    v_check_sql := format(
      'select %I is not null from %I.%I where id = $1',
      v_mapping.anonymized_check_column, v_mapping.table_schema, v_mapping.table_name
    );

    begin
      execute v_check_sql using v_state.entity_id into v_master_anonymized;
    exception when others then
      v_errors := v_errors + 1;
      v_error_details := v_error_details || jsonb_build_object(
        'entity_id', v_state.entity_id, 'reason', 'master-check fejlede: ' || sqlerrm
      );
      continue;
    end;

    if v_master_anonymized is null then
      -- Master-row mangler (post-restore data tab)
      v_errors := v_errors + 1;
      v_error_details := v_error_details || jsonb_build_object(
        'entity_id', v_state.entity_id, 'reason', 'master-row mangler'
      );
      continue;
    end if;

    if v_master_anonymized then
      -- Allerede anonymiseret — idempotent no-op
      v_skipped := v_skipped + 1;
      continue;
    end if;

    -- Master-row har PII tilbage → re-apply med SNAPSHOT (ikke live mapping)
    if not p_dry_run then
      begin
        v_proc := (v_mapping.internal_rpc_apply || '(uuid, jsonb, text)')::regprocedure;
      exception when undefined_function then
        v_errors := v_errors + 1;
        v_error_details := v_error_details || jsonb_build_object(
          'entity_id', v_state.entity_id,
          'reason', 'internal_rpc_apply ' || v_mapping.internal_rpc_apply || ' findes ikke'
        );
        continue;
      end;

      begin
        execute format('select %s($1, $2, $3)', v_proc::text)
          using v_state.entity_id,
                v_state.field_mapping_snapshot,
                'replay: ' || v_state.anonymization_reason;
        v_replayed := v_replayed + 1;
        -- BEVIDST: ingen INSERT i anonymization_state. Replay er idempotent.
      exception when others then
        v_errors := v_errors + 1;
        v_error_details := v_error_details || jsonb_build_object(
          'entity_id', v_state.entity_id, 'reason', 'apply fejlede: ' || sqlerrm
        );
      end;
    else
      v_replayed := v_replayed + 1;
    end if;
  end loop;

  return jsonb_build_object(
    'total', v_total,
    'replayed', v_replayed,
    'skipped', v_skipped,
    'errors', v_errors,
    'error_details', v_error_details,
    'dry_run', p_dry_run,
    'executed_at', now()
  );
end;
$func$;

comment on function core_compliance.replay_anonymization(text, boolean) is
  'C003 + G010: idempotent replay via snapshot. Bruger anonymization_mappings-dispatcher (generisk for alle entity-typer). INGEN INSERT i anonymization_state — apply-only via internal_rpc_apply.';

-- ─────────────────────────────────────────────────────────────────────────
-- Step 5: Refactor verify_anonymization_consistency — generisk
-- ─────────────────────────────────────────────────────────────────────────

create or replace function core_compliance.verify_anonymization_consistency()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $func$
declare
  v_state record;
  v_mapping core_compliance.anonymization_mappings;
  v_total integer := 0;
  v_inconsistent integer := 0;
  v_details jsonb := '[]'::jsonb;
  v_master_anonymized boolean;
  v_check_sql text;
begin
  for v_state in select * from core_compliance.anonymization_state
  loop
    v_total := v_total + 1;

    select * into v_mapping
      from core_compliance.anonymization_mappings
     where entity_type = v_state.entity_type and is_active = true;

    if v_mapping.id is null then
      v_inconsistent := v_inconsistent + 1;
      v_details := v_details || jsonb_build_object(
        'entity_type', v_state.entity_type,
        'entity_id', v_state.entity_id,
        'issue', 'ingen aktiv anonymization_mapping for entity_type'
      );
      continue;
    end if;

    v_check_sql := format(
      'select %I is not null from %I.%I where id = $1',
      v_mapping.anonymized_check_column, v_mapping.table_schema, v_mapping.table_name
    );

    begin
      execute v_check_sql using v_state.entity_id into v_master_anonymized;
    exception when others then
      v_inconsistent := v_inconsistent + 1;
      v_details := v_details || jsonb_build_object(
        'entity_type', v_state.entity_type,
        'entity_id', v_state.entity_id,
        'issue', 'master-check fejlede: ' || sqlerrm
      );
      continue;
    end;

    if v_master_anonymized is null then
      v_inconsistent := v_inconsistent + 1;
      v_details := v_details || jsonb_build_object(
        'entity_type', v_state.entity_type,
        'entity_id', v_state.entity_id,
        'anonymized_at', v_state.anonymized_at,
        'issue', 'master-row mangler'
      );
    elsif not v_master_anonymized then
      v_inconsistent := v_inconsistent + 1;
      v_details := v_details || jsonb_build_object(
        'entity_type', v_state.entity_type,
        'entity_id', v_state.entity_id,
        'anonymized_at', v_state.anonymized_at,
        'issue', 'master-row har ' || v_mapping.anonymized_check_column || '=NULL trods log'
      );
    end if;
  end loop;

  return jsonb_build_object(
    'checked_at', now(),
    'total_state_rows', v_total,
    'inconsistent_count', v_inconsistent,
    'is_consistent', v_inconsistent = 0,
    'details', v_details
  );
end;
$func$;

comment on function core_compliance.verify_anonymization_consistency() is
  'G011: generisk drift-check via anonymization_mappings-dispatcher (alle entity-typer).';
