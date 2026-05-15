-- P2: UI-RPCs for anonymization_mappings + lifecycle.
--
-- BAGGRUND (plan-leverance P2):
-- Mappings er konfig-data der definerer hvilke kolonner anonymiseres for
-- hver entity_type. Pre-P2 var status implicit via is_active boolean.
-- P2 indfører eksplicit lifecycle: draft -> tested -> approved -> active
-- med samme disciplin som anonymization_strategies (P1a).
--
-- RPCs:
-- - anonymization_mapping_upsert: create/update; status='draft' ved create,
--   bevarer status ved update (kun datafelter må ændres ud af 'draft')
-- - anonymization_mapping_test_run: draft -> tested
-- - anonymization_mapping_approve: tested -> approved
-- - anonymization_mapping_activate: approved -> active (session-var bypass)
--
-- DELETE-policy: kun draft (Fund 13-pattern).
--
-- Backfill: eksisterende 'employee'-mapping flyttes til status='approved'
-- (kraever UI-aktivering pre-cutover for at koeren anonymize_generic_apply).
--
-- anonymize_generic_apply opdateres til at kraeve status='active' paa
-- mappingen (ud over is_active=true; defense-in-depth indtil is_active
-- kan fjernes).

-- ─── Tilføj status-kolonne (med backfill via lifecycle-bypass) ────────────
alter table core_compliance.anonymization_mappings
  add column status text not null default 'draft'
    check (status in ('draft', 'tested', 'approved', 'active')),
  add column activated_at timestamptz,
  add column activated_by uuid references core_identity.employees(id),
  add constraint anonymization_mappings_active_consistency
    check (status <> 'active' or (activated_at is not null and activated_by is not null));

-- Backfill: eksisterende rows -> 'approved' (kraever UI-aktivering pre-cutover)
select set_config('stork.source_type', 'migration', false);
select set_config('stork.allow_anonymization_mappings_write', 'true', false);
select set_config('stork.change_reason',
  'P2: backfill status=approved for eksisterende mappings', false);

update core_compliance.anonymization_mappings
   set status = 'approved'
 where status = 'draft';  -- alle eksisterende; default var draft

-- ─── Lifecycle-trigger (samme pattern som anonymization_strategies) ───────
create or replace function core_compliance.enforce_anonymization_mapping_lifecycle()
returns trigger language plpgsql set search_path = '' as $func$
begin
  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'approved') then
      raise exception 'INSERT med status=% er ikke tilladt (kun draft eller approved/bootstrap)', new.status using errcode = 'P0001';
    end if;
    if new.status = 'approved' and coalesce(current_setting('stork.source_type', true), '') <> 'migration' then
      raise exception 'INSERT med status=approved kun tilladt under migration (source_type=%)',
        coalesce(current_setting('stork.source_type', true), 'null') using errcode = 'P0001';
    end if;
    return new;
  end if;
  if old.status = new.status then return new; end if;
  if new.status = 'active' then
    if coalesce(current_setting('stork.allow_mapping_activate', true), '') <> 'true' then
      raise exception 'status=active kraever aktivering via anonymization_mapping_activate-RPC' using errcode = '42501';
    end if;
    new.activated_at := now();
    new.activated_by := core_identity.current_employee_id();
  end if;
  if old.status = 'active' and new.status <> 'active' then
    raise exception 'kan ikke deaktivere active-mapping via direkte UPDATE' using errcode = '42501';
  end if;
  if ((old.status = 'tested' and new.status = 'draft')
      or (old.status = 'approved' and new.status in ('draft', 'tested'))) then
    raise exception 'lifecycle-regression % -> % er ikke tilladt', old.status, new.status using errcode = 'P0001';
  end if;
  return new;
end;
$func$;

create trigger anonymization_mappings_lifecycle
  before insert or update on core_compliance.anonymization_mappings
  for each row execute function core_compliance.enforce_anonymization_mapping_lifecycle();

-- ─── DELETE-trigger: kun draft kan slettes ────────────────────────────────
create or replace function core_compliance.enforce_anonymization_mapping_delete()
returns trigger language plpgsql set search_path = '' as $func$
begin
  if old.status <> 'draft' then
    raise exception 'kan kun slette draft-mappings (denne har status=%)', old.status using errcode = 'P0001';
  end if;
  return old;
end;
$func$;

create trigger anonymization_mappings_delete_check
  before delete on core_compliance.anonymization_mappings
  for each row execute function core_compliance.enforce_anonymization_mapping_delete();

-- ─── Klassifikation af nye kolonner ───────────────────────────────────────
select set_config('stork.allow_data_field_definitions_write', 'true', false);
select set_config('stork.change_reason',
  'P2: klassifikation af anonymization_mappings.status + activated_*', false);

insert into core_compliance.data_field_definitions
  (table_schema, table_name, column_name, category, pii_level, retention_type, retention_value, match_role, purpose) values
  ('core_compliance', 'anonymization_mappings', 'status',       'konfiguration', 'none', 'permanent', null, null, 'lifecycle: draft/tested/approved/active'),
  ('core_compliance', 'anonymization_mappings', 'activated_at', 'konfiguration', 'none', 'permanent', null, null, 'tidsstempel ved status=active'),
  ('core_compliance', 'anonymization_mappings', 'activated_by', 'konfiguration', 'none', 'permanent', null, null, 'employee_id der aktiverede')
on conflict (table_schema, table_name, column_name) do nothing;

-- ─── UI-RPC: upsert ───────────────────────────────────────────────────────
create or replace function core_compliance.anonymization_mapping_upsert(
  p_entity_type text,
  p_table_schema text,
  p_table_name text,
  p_field_strategies jsonb,
  p_anonymized_check_column text,
  p_retention_event_column text,
  p_internal_rpc_anonymize text,
  p_internal_rpc_apply text,
  p_change_reason text
) returns core_compliance.anonymization_mappings
language plpgsql security definer set search_path = ''
as $func$
declare
  v_row core_compliance.anonymization_mappings;
begin
  if not core_identity.has_permission('anonymization_mappings', 'manage', true) then
    raise exception 'anonymization_mapping_upsert kraever permission anonymization_mappings.manage.can_edit'
      using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;
  if p_entity_type is null or length(trim(p_entity_type)) = 0 then
    raise exception 'entity_type er paakraevet' using errcode = '22023';
  end if;
  if p_anonymized_check_column is null or length(trim(p_anonymized_check_column)) = 0 then
    raise exception 'anonymized_check_column er paakraevet' using errcode = '22023';
  end if;

  perform set_config('stork.allow_anonymization_mappings_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);

  insert into core_compliance.anonymization_mappings (
    entity_type, table_schema, table_name,
    field_strategies, anonymized_check_column, retention_event_column,
    internal_rpc_anonymize, internal_rpc_apply, is_active, status
  ) values (
    p_entity_type, p_table_schema, p_table_name,
    p_field_strategies, p_anonymized_check_column, p_retention_event_column,
    p_internal_rpc_anonymize, p_internal_rpc_apply, false, 'draft'
  )
  on conflict (entity_type, table_schema, table_name) do update set
    field_strategies = excluded.field_strategies,
    anonymized_check_column = excluded.anonymized_check_column,
    retention_event_column = excluded.retention_event_column,
    internal_rpc_anonymize = excluded.internal_rpc_anonymize,
    internal_rpc_apply = excluded.internal_rpc_apply
    -- status, activated_at, activated_by bevares ved UPDATE
  returning * into v_row;

  return v_row;
end;
$func$;

revoke all on function core_compliance.anonymization_mapping_upsert(text, text, text, jsonb, text, text, text, text, text) from public;
grant execute on function core_compliance.anonymization_mapping_upsert(text, text, text, jsonb, text, text, text, text, text) to authenticated;

-- ─── UI-RPC: test_run (draft → tested) ────────────────────────────────────
-- Test_run validerer at mapping kan eksekveres mod target-tabellen.
-- Pt. udelukker det PII-coverage-fejl + strategy-availability-fejl ved at
-- forsoege en dry-run-iteration over PII-allowlist (uden faktisk UPDATE).
create or replace function core_compliance.anonymization_mapping_test_run(
  p_mapping_id uuid, p_change_reason text
) returns core_compliance.anonymization_mappings
language plpgsql security definer set search_path = ''
as $func$
declare
  v_row core_compliance.anonymization_mappings;
  v_pii_col record;
  v_strategy_name text;
  v_strategy core_compliance.anonymization_strategies;
  v_stale_keys text[];
begin
  if not core_identity.has_permission('anonymization_mappings', 'test_run', true) then
    raise exception 'anonymization_mapping_test_run kraever permission anonymization_mappings.test_run.can_edit'
      using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;

  select * into v_row from core_compliance.anonymization_mappings where id = p_mapping_id for update;
  if v_row.id is null then raise exception 'mapping % findes ikke', p_mapping_id using errcode = 'P0002'; end if;
  if v_row.status <> 'draft' then
    raise exception 'test_run kraever status=draft (har %)', v_row.status using errcode = 'P0001';
  end if;

  -- Stale-detection: field_strategies-keys peger paa eksisterende PII-kolonner
  select array_agg(key) into v_stale_keys
    from jsonb_object_keys(v_row.field_strategies) as keys(key)
   where not exists (
     select 1 from information_schema.columns c
     join core_compliance.data_field_definitions df
       on df.table_schema = c.table_schema and df.table_name = c.table_name and df.column_name = c.column_name
      where c.table_schema = v_row.table_schema and c.table_name = v_row.table_name
        and c.column_name = keys.key and df.pii_level = 'direct'
   );
  if v_stale_keys is not null and array_length(v_stale_keys, 1) > 0 then
    raise exception 'test_run FAILED: stale field_strategies-keys: %', v_stale_keys using errcode = 'P0001';
  end if;

  -- Coverage: hver pii_level=direct kolonne i target-tabellen skal have strategy
  for v_pii_col in
    select c.column_name from information_schema.columns c
    join core_compliance.data_field_definitions df
      on df.table_schema = c.table_schema and df.table_name = c.table_name and df.column_name = c.column_name
     where c.table_schema = v_row.table_schema and c.table_name = v_row.table_name and df.pii_level = 'direct'
  loop
    v_strategy_name := v_row.field_strategies->>v_pii_col.column_name;
    if v_strategy_name is null then
      raise exception 'test_run FAILED: PII-kolonne % mangler strategy', v_pii_col.column_name using errcode = 'P0001';
    end if;
    select * into v_strategy from core_compliance.anonymization_strategies where strategy_name = v_strategy_name;
    if v_strategy.id is null then
      raise exception 'test_run FAILED: strategy "%" findes ikke', v_strategy_name using errcode = 'P0002';
    end if;
    if v_strategy.status not in ('approved', 'active') then
      raise exception 'test_run FAILED: strategy "%" har status=% (kraever approved eller active)', v_strategy_name, v_strategy.status using errcode = 'P0001';
    end if;
  end loop;

  -- Test-run bestod: flyt til tested
  perform set_config('stork.allow_anonymization_mappings_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'test_run OK: ' || p_change_reason, true);

  update core_compliance.anonymization_mappings set status = 'tested' where id = p_mapping_id returning * into v_row;
  return v_row;
end;
$func$;

revoke all on function core_compliance.anonymization_mapping_test_run(uuid, text) from public;
grant execute on function core_compliance.anonymization_mapping_test_run(uuid, text) to authenticated;

-- ─── UI-RPC: approve (tested → approved) ──────────────────────────────────
create or replace function core_compliance.anonymization_mapping_approve(
  p_mapping_id uuid, p_change_reason text
) returns core_compliance.anonymization_mappings
language plpgsql security definer set search_path = ''
as $func$
declare v_row core_compliance.anonymization_mappings;
begin
  if not core_identity.has_permission('anonymization_mappings', 'approve', true) then
    raise exception 'anonymization_mapping_approve kraever permission anonymization_mappings.approve.can_edit' using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;
  select * into v_row from core_compliance.anonymization_mappings where id = p_mapping_id for update;
  if v_row.id is null then raise exception 'mapping % findes ikke', p_mapping_id using errcode = 'P0002'; end if;
  if v_row.status <> 'tested' then
    raise exception 'approve kraever status=tested (har %)', v_row.status using errcode = 'P0001';
  end if;
  perform set_config('stork.allow_anonymization_mappings_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);
  update core_compliance.anonymization_mappings set status = 'approved' where id = p_mapping_id returning * into v_row;
  return v_row;
end;
$func$;

revoke all on function core_compliance.anonymization_mapping_approve(uuid, text) from public;
grant execute on function core_compliance.anonymization_mapping_approve(uuid, text) to authenticated;

-- ─── UI-RPC: activate (approved → active) ─────────────────────────────────
create or replace function core_compliance.anonymization_mapping_activate(
  p_mapping_id uuid, p_change_reason text
) returns core_compliance.anonymization_mappings
language plpgsql security definer set search_path = ''
as $func$
declare v_row core_compliance.anonymization_mappings;
begin
  if not core_identity.has_permission('anonymization_mappings', 'activate', true) then
    raise exception 'anonymization_mapping_activate kraever permission anonymization_mappings.activate.can_edit' using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;
  select * into v_row from core_compliance.anonymization_mappings where id = p_mapping_id for update;
  if v_row.id is null then raise exception 'mapping % findes ikke', p_mapping_id using errcode = 'P0002'; end if;
  if v_row.status <> 'approved' then
    raise exception 'activate kraever status=approved (har %)', v_row.status using errcode = 'P0001';
  end if;
  perform set_config('stork.allow_anonymization_mappings_write', 'true', true);
  perform set_config('stork.allow_mapping_activate', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);
  update core_compliance.anonymization_mappings set status = 'active', is_active = true where id = p_mapping_id returning * into v_row;
  return v_row;
end;
$func$;

revoke all on function core_compliance.anonymization_mapping_activate(uuid, text) from public;
grant execute on function core_compliance.anonymization_mapping_activate(uuid, text) to authenticated;

-- ─── Bootstrap-permissions til superadmin ─────────────────────────────────
select set_config('stork.allow_role_page_permissions_write', 'true', false);
select set_config('stork.change_reason',
  'P2: bootstrap anonymization_mappings-permissions til superadmin', false);

insert into core_identity.role_page_permissions (role_id, page_key, tab_key, can_view, can_edit, scope)
select (select id from core_identity.roles where name = 'superadmin'),
       page_key, tab_key, true, true, 'all'
from (values
  ('anonymization_mappings', 'manage'),
  ('anonymization_mappings', 'test_run'),
  ('anonymization_mappings', 'approve'),
  ('anonymization_mappings', 'activate')
) as perms(page_key, tab_key)
on conflict (role_id, page_key, coalesce(tab_key, '')) do nothing;

-- ─── Opdatér anonymize_generic_apply til at kraeve status='active' ────────
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

  -- P2-update: kraev mapping.status='active' (ikke kun is_active)
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
    raise exception 'stale field_strategies-keys: % (refererer ikke-eksisterende kolonner eller non-direct-PII)', v_stale_keys
      using errcode = 'P0001';
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
      raise exception 'PII-coverage-fejl: kolonne %.%.% (pii_level=direct) mangler strategi',
        v_mapping.table_schema, v_mapping.table_name, v_pii_col.column_name using errcode = 'P0001';
    end if;
    select * into v_strategy from core_compliance.anonymization_strategies
     where strategy_name = v_strategy_name and status = 'active';
    if v_strategy.id is null then
      raise exception 'strategy "%" er ikke active', v_strategy_name using errcode = 'P0001';
    end if;
    v_proc := (v_strategy.function_schema || '.' || v_strategy.function_name || '(text, text)')::regprocedure;
    v_set_clauses := v_set_clauses || (format('%I = %s(%I, $1)', v_pii_col.column_name, v_proc::text, v_pii_col.column_name));
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
