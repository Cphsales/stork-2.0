-- P1b: anonymize_generic_apply — generisk anonymization der bruger
-- anonymization_strategies-registry (P1a).
--
-- BAGGRUND (Codex Fund 8+9+19+24 + master-plan rettelse 30):
-- Den eksisterende _anonymize_employee_apply var employee-specifik og hardkodede
-- strategi-håndtering. P1b giver en generisk apply der virker for enhver
-- entity_type (matchende en aktiv anonymization_mappings-row).
--
-- INTEGRATION AF CODEX-FUND:
-- - Fund 9: iter over PII-allowlist (data_field_definitions WHERE pii_level=direct)
--   NOT over field_strategies-keys. Coverage-fejl raises hvis PII-kolonne mangler
--   strategi.
-- - Fund 8: join mod information_schema.columns for stale-detection. Verificér
--   både at hver field_strategies-key eksisterer i tabellen + at hver PII-kolonne
--   har en mapping (begge retninger).
-- - Fund 19: EXECUTE USING $1, $2 (parameter-binding for entity_id). Strategy-
--   funktion-OIDs valideres via regprocedure-cast først; derefter inlineres som
--   identifiers i dynamic SQL.
-- - Fund 24: NOT FOUND efter UPDATE → P0002 (employee findes ikke eller allerede
--   anonymized). Sender konsistent fejlsignal opad.
--
-- RETUR: jsonb-objekt med entity_type/entity_id/columns_anonymized/snapshot.

create or replace function core_compliance.anonymize_generic_apply(
  p_entity_type text,
  p_entity_id uuid,
  p_change_reason text
) returns jsonb
language plpgsql security definer set search_path = ''
as $func$
declare
  v_mapping core_compliance.anonymization_mappings;
  v_pii_col record;
  v_strategy core_compliance.anonymization_strategies;
  v_strategy_name text;
  v_proc regprocedure;
  v_sql text;
  v_set_clauses text[] := array[]::text[];
  v_field_snapshot jsonb := '{}'::jsonb;
  v_strategy_key text;
  v_returned_id uuid;
  v_stale_keys text[];
  v_pii_count integer := 0;
begin
  if p_entity_type is null or length(trim(p_entity_type)) = 0 then
    raise exception 'entity_type er paakraevet' using errcode = '22023';
  end if;
  if p_entity_id is null then
    raise exception 'entity_id er paakraevet' using errcode = '22023';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;

  -- ─── 1. Hent aktiv mapping ───────────────────────────────────────────────
  select * into v_mapping
    from core_compliance.anonymization_mappings
   where entity_type = p_entity_type and is_active = true;
  if v_mapping.id is null then
    raise exception 'ingen aktiv anonymization_mapping for entity_type=%', p_entity_type
      using errcode = 'P0002';
  end if;

  -- ─── 2. Stale-detection (Fund 8): field_strategies-keys -> kolonner ─────
  -- Hver field_strategies-key skal pege paa en eksisterende PII-kolonne
  select array_agg(key) into v_stale_keys
    from jsonb_object_keys(v_mapping.field_strategies) as keys(key)
   where not exists (
     select 1
       from information_schema.columns c
       join core_compliance.data_field_definitions df
         on df.table_schema = c.table_schema
        and df.table_name = c.table_name
        and df.column_name = c.column_name
      where c.table_schema = v_mapping.table_schema
        and c.table_name = v_mapping.table_name
        and c.column_name = keys.key
        and df.pii_level = 'direct'
   );
  if v_stale_keys is not null and array_length(v_stale_keys, 1) > 0 then
    raise exception 'stale field_strategies-keys: % (refererer ikke-eksisterende kolonner eller non-direct-PII)', v_stale_keys
      using errcode = 'P0001';
  end if;

  -- ─── 3. Iter over PII-allowlist (Fund 9) ────────────────────────────────
  -- Hver pii_level=direct kolonne skal have en mapping. Build SET-clauses.
  for v_pii_col in
    select c.column_name
      from information_schema.columns c
      join core_compliance.data_field_definitions df
        on df.table_schema = c.table_schema
       and df.table_name = c.table_name
       and df.column_name = c.column_name
     where c.table_schema = v_mapping.table_schema
       and c.table_name = v_mapping.table_name
       and df.pii_level = 'direct'
     order by c.column_name
  loop
    v_pii_count := v_pii_count + 1;
    v_strategy_name := v_mapping.field_strategies->>v_pii_col.column_name;
    if v_strategy_name is null then
      raise exception 'PII-coverage-fejl: kolonne %.%.% (pii_level=direct) mangler strategi i field_strategies',
        v_mapping.table_schema, v_mapping.table_name, v_pii_col.column_name
        using errcode = 'P0001';
    end if;

    -- 4. Strategi skal vaere active (Mathias' decision Problem 4)
    select * into v_strategy
      from core_compliance.anonymization_strategies
     where strategy_name = v_strategy_name and status = 'active';
    if v_strategy.id is null then
      raise exception 'strategy "%" er ikke active (eller findes ikke); aktiver via anonymization_strategy_activate-RPC', v_strategy_name
        using errcode = 'P0001';
    end if;

    -- Validér funktion-existence (defense-in-depth ud over P1a-validation)
    v_proc := (v_strategy.function_schema || '.' || v_strategy.function_name || '(text, text)')::regprocedure;

    -- Build SET-clause: column = strategy_fn(column, $1)
    v_set_clauses := v_set_clauses || (
      format('%I = %s(%I, $1)', v_pii_col.column_name, v_proc::text, v_pii_col.column_name)
    );

    v_field_snapshot := v_field_snapshot || jsonb_build_object(
      v_pii_col.column_name,
      jsonb_build_object('strategy', v_strategy_name, 'strategy_id', v_strategy.id)
    );
  end loop;

  if v_pii_count = 0 then
    raise exception 'ingen pii_level=direct kolonner fundet for %.%; kraever klassifikation foer anonymisering',
      v_mapping.table_schema, v_mapping.table_name
      using errcode = 'P0001';
  end if;

  -- ─── 5. Build dynamic UPDATE + EXECUTE USING (Fund 19) ──────────────────
  v_sql := format(
    'update %I.%I set %s, %I = now() where id = $2 and %I is null returning id',
    v_mapping.table_schema, v_mapping.table_name,
    array_to_string(v_set_clauses, ', '),
    v_mapping.anonymized_check_column,
    v_mapping.anonymized_check_column
  );

  perform set_config(
    format('stork.allow_%s_write', v_mapping.table_name), 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'anonymization: ' || p_change_reason, true);

  execute v_sql using p_entity_id::text, p_entity_id into v_returned_id;

  -- Fund 24: NOT FOUND → P0002
  if v_returned_id is null then
    raise exception 'entity % af type % findes ikke eller er allerede anonymized',
      p_entity_id, p_entity_type
      using errcode = 'P0002';
  end if;

  -- ─── 6. Log til anonymization_state ─────────────────────────────────────
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
    'entity_type', p_entity_type,
    'entity_id', p_entity_id,
    'columns_anonymized', v_pii_count,
    'field_snapshot', v_field_snapshot,
    'mapping_id', v_mapping.id,
    'strategy_version', v_mapping.strategy_version
  );
end;
$func$;

comment on function core_compliance.anonymize_generic_apply(text, uuid, text) is
  'P1b: generisk anonymization for enhver entity_type med aktiv mapping. Itererer over PII-allowlist (Fund 9), stale-detection (Fund 8), EXECUTE USING (Fund 19), NOT FOUND -> P0002 (Fund 24).';

revoke all on function core_compliance.anonymize_generic_apply(text, uuid, text) from public;
-- Ikke grant'et til authenticated; kaldes af RPC-wrappers (P1c) med deres egne permission-checks.
