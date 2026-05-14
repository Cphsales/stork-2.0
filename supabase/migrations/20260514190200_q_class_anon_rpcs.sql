-- Q-CLASS-ANON: konvertér 3 RPC'er fra is_admin() til has_permission().
--
-- KONVERTERINGER:
-- - data_field_definition_upsert → has_permission('classification', 'manage', true)
-- - data_field_definition_delete → has_permission('classification', 'manage', true)
-- - replay_anonymization         → has_permission('anonymization', 'replay', true)

create or replace function core_compliance.data_field_definition_upsert(
  p_table_schema text,
  p_table_name text,
  p_column_name text,
  p_category text,
  p_pii_level text,
  p_purpose text,
  p_retention_type text default null,
  p_retention_value jsonb default null,
  p_match_role text default null,
  p_change_reason text default null
)
returns core_compliance.data_field_definitions
language plpgsql security definer set search_path = ''
as $function$
declare
  v_row core_compliance.data_field_definitions;
begin
  if not core_identity.has_permission('classification', 'manage', true) then
    raise exception 'data_field_definition_upsert kraever permission classification.manage.can_edit'
      using errcode = '42501';
  end if;

  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;

  perform set_config('stork.allow_data_field_definitions_write', 'true', true);
  perform set_config('stork.change_reason', p_change_reason, true);

  insert into core_compliance.data_field_definitions (
    table_schema, table_name, column_name,
    category, pii_level, retention_type, retention_value, match_role, purpose
  ) values (
    p_table_schema, p_table_name, p_column_name,
    p_category, p_pii_level, p_retention_type, p_retention_value, p_match_role, p_purpose
  )
  on conflict (table_schema, table_name, column_name) do update set
    category = excluded.category,
    pii_level = excluded.pii_level,
    retention_type = excluded.retention_type,
    retention_value = excluded.retention_value,
    match_role = excluded.match_role,
    purpose = excluded.purpose
  returning * into v_row;

  return v_row;
end;
$function$;

create or replace function core_compliance.data_field_definition_delete(
  p_table_schema text,
  p_table_name text,
  p_column_name text,
  p_change_reason text
)
returns void
language plpgsql security definer set search_path = ''
as $function$
begin
  if not core_identity.has_permission('classification', 'manage', true) then
    raise exception 'data_field_definition_delete kraever permission classification.manage.can_edit'
      using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;

  perform set_config('stork.allow_data_field_definitions_write', 'true', true);
  perform set_config('stork.change_reason', p_change_reason, true);

  delete from core_compliance.data_field_definitions
   where table_schema = p_table_schema
     and table_name = p_table_name
     and column_name = p_column_name;
end;
$function$;

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
  v_proc regprocedure; v_check_sql text;
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
    select * into v_mapping from core_compliance.anonymization_mappings
     where entity_type = v_state.entity_type and is_active = true;
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
      begin
        execute format('select %s($1, $2, $3)', v_proc::text)
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
