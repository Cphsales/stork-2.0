-- R7h Test 3 fix: anonymize_generic_apply INSERT manglede table_schema + table_name.
--
-- BAGGRUND:
-- anonymize_generic_apply (P1b) INSERT'er i anonymization_state, men
-- anonymization_state.table_schema + .table_name er NOT NULL. INSERT
-- fejlede pre-fix med 23502 (not_null_violation). Pre-R7a opdaget ikke
-- bug'en fordi regprocedure-fejl i SET-clause EXECUTE skete tidligere
-- i samme function-body.
--
-- Bug-natur: pre-eksisterende fra P1b. Codex v2 Fund #4 dækkede snapshot-
-- shape (nested vs flat) men IKKE missing-columns. R7h Test 3-runtime
-- afslørede via NOT_NULL_VIOLATION ved live e2e-test 2026-05-15.
--
-- _anonymize_employee_log_state (Q-pakke-tid) har korrekt INSERT med
-- hardkodet 'core_identity', 'employees'. Bug eksisterer KUN i
-- anonymize_generic_apply der skulle have brugt mapping.table_schema +
-- mapping.table_name (de er allerede i scope).
--
-- FIX: tilføj v_mapping.table_schema, v_mapping.table_name til INSERT.
-- Resten af function-body uændret (R7a + P2 fixes bevares).

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
    -- R7a regprocedure-cast som validering
    v_proc := (v_strategy.function_schema || '.' || v_strategy.function_name || '(text, text)')::regprocedure;
    -- R7a callable via pg_proc-lookup
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
  -- R7h Test 3-fix: table_schema + table_name tilfoejet (begge NOT NULL)
  insert into core_compliance.anonymization_state (
    entity_type, table_schema, table_name, entity_id, anonymization_reason,
    field_mapping_snapshot, jsonb_field_mapping_snapshot,
    strategy_version, created_by
  ) values (
    p_entity_type, v_mapping.table_schema, v_mapping.table_name, p_entity_id, p_change_reason,
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
