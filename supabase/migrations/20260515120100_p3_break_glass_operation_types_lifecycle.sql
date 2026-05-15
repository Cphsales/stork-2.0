-- P3: UI-RPC for break_glass_operation_types + activate-lifecycle.
--
-- BAGGRUND (plan-leverance P3):
-- break_glass_operation_types definerer hvilke RPC'er der kan kaldes via
-- break-glass-flowet (med dual-approver). Pre-P3 var status implicit via
-- is_active. P3 indfører eksplicit lifecycle (samme pattern som P1a+P2).
--
-- RPCs:
-- - break_glass_operation_type_upsert: create/update (status='draft' ved create)
-- - break_glass_operation_type_approve: tested -> approved (skipper test_run
--   da BG-operations testes manuelt via existing two-actor approve-flow)
-- - break_glass_operation_type_activate: approved -> active
--
-- DELETE-policy: kun draft (Fund 13-pattern).
--
-- regprocedure-validation paa internal_rpc: skal eksistere som (uuid, text)
-- returns ... — samme constraint som break_glass_execute bruger (C006-fix).
--
-- Backfill: 2 eksisterende rows (pay_period_unlock, gdpr_retroactive_remove)
-- flyttes til status='approved' (pay_period_unlock kan UI-aktiveres pre-cutover;
-- gdpr-row beholder is_active=false indtil lag-E-funktion eksisterer).

-- ─── Tilføj status + activated-kolonner ───────────────────────────────────
alter table core_compliance.break_glass_operation_types
  add column status text not null default 'draft'
    check (status in ('draft', 'tested', 'approved', 'active')),
  add column activated_at timestamptz,
  add column activated_by uuid references core_identity.employees(id),
  add constraint break_glass_operation_types_active_consistency
    check (status <> 'active' or (activated_at is not null and activated_by is not null));

-- Backfill: eksisterende rows -> approved
select set_config('stork.source_type', 'migration', false);
select set_config('stork.allow_break_glass_operation_types_write', 'true', false);
select set_config('stork.change_reason',
  'P3: backfill status=approved for eksisterende operation_types', false);

update core_compliance.break_glass_operation_types
   set status = 'approved'
 where status = 'draft';

-- ─── Validation-trigger: internal_rpc skal eksistere ─────────────────────
create or replace function core_compliance.validate_break_glass_operation_type()
returns trigger language plpgsql set search_path = '' as $func$
declare v_proc regprocedure;
begin
  -- regprocedure-cast: validér at internal_rpc eksisterer som (uuid, text)
  -- C006-pattern: samme signatur som break_glass_execute kalder
  begin
    v_proc := (new.internal_rpc || '(uuid, text)')::regprocedure;
  exception when undefined_function then
    raise exception 'internal_rpc "%(uuid, text)" findes ikke', new.internal_rpc
      using errcode = 'P0002';
  end;
  return new;
end;
$func$;

create trigger break_glass_operation_types_validate
  before insert or update on core_compliance.break_glass_operation_types
  for each row execute function core_compliance.validate_break_glass_operation_type();

-- ─── Lifecycle-trigger (samme pattern som P1a/P2) ────────────────────────
create or replace function core_compliance.enforce_break_glass_op_type_lifecycle()
returns trigger language plpgsql set search_path = '' as $func$
begin
  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'approved') then
      raise exception 'INSERT med status=% er ikke tilladt', new.status using errcode = 'P0001';
    end if;
    if new.status = 'approved' and coalesce(current_setting('stork.source_type', true), '') <> 'migration' then
      raise exception 'INSERT med status=approved kun tilladt under migration' using errcode = 'P0001';
    end if;
    return new;
  end if;
  if old.status = new.status then return new; end if;
  if new.status = 'active' then
    if coalesce(current_setting('stork.allow_op_type_activate', true), '') <> 'true' then
      raise exception 'status=active kraever aktivering via break_glass_operation_type_activate-RPC' using errcode = '42501';
    end if;
    new.activated_at := now();
    new.activated_by := core_identity.current_employee_id();
  end if;
  if old.status = 'active' and new.status <> 'active' then
    raise exception 'kan ikke deaktivere active-operation_type via direkte UPDATE' using errcode = '42501';
  end if;
  if ((old.status = 'tested' and new.status = 'draft')
      or (old.status = 'approved' and new.status in ('draft', 'tested'))) then
    raise exception 'lifecycle-regression % -> %', old.status, new.status using errcode = 'P0001';
  end if;
  return new;
end;
$func$;

create trigger break_glass_operation_types_lifecycle
  before insert or update on core_compliance.break_glass_operation_types
  for each row execute function core_compliance.enforce_break_glass_op_type_lifecycle();

-- ─── DELETE-trigger: kun draft ────────────────────────────────────────────
create or replace function core_compliance.enforce_break_glass_op_type_delete()
returns trigger language plpgsql set search_path = '' as $func$
begin
  if old.status <> 'draft' then
    raise exception 'kan kun slette draft-operation_types (denne har status=%)', old.status using errcode = 'P0001';
  end if;
  return old;
end;
$func$;

create trigger break_glass_operation_types_delete_check
  before delete on core_compliance.break_glass_operation_types
  for each row execute function core_compliance.enforce_break_glass_op_type_delete();

-- ─── Klassifikation af nye kolonner ───────────────────────────────────────
select set_config('stork.allow_data_field_definitions_write', 'true', false);
select set_config('stork.change_reason',
  'P3: klassifikation af break_glass_operation_types.status + activated_*', false);

insert into core_compliance.data_field_definitions
  (table_schema, table_name, column_name, category, pii_level, retention_type, retention_value, match_role, purpose) values
  ('core_compliance', 'break_glass_operation_types', 'status',       'konfiguration', 'none', 'permanent', null, null, 'lifecycle: draft/tested/approved/active'),
  ('core_compliance', 'break_glass_operation_types', 'activated_at', 'konfiguration', 'none', 'permanent', null, null, 'tidsstempel ved status=active'),
  ('core_compliance', 'break_glass_operation_types', 'activated_by', 'konfiguration', 'none', 'permanent', null, null, 'employee_id der aktiverede')
on conflict (table_schema, table_name, column_name) do nothing;

-- ─── UI-RPC: upsert ───────────────────────────────────────────────────────
create or replace function core_compliance.break_glass_operation_type_upsert(
  p_operation_type text,
  p_display_name text,
  p_description text,
  p_internal_rpc text,
  p_required_payload_schema jsonb,
  p_change_reason text
) returns core_compliance.break_glass_operation_types
language plpgsql security definer set search_path = '' as $func$
declare v_row core_compliance.break_glass_operation_types;
begin
  if not core_identity.has_permission('break_glass_operation_types', 'manage', true) then
    raise exception 'break_glass_operation_type_upsert kraever permission break_glass_operation_types.manage.can_edit' using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;
  if p_operation_type is null or length(trim(p_operation_type)) = 0 then
    raise exception 'operation_type er paakraevet' using errcode = '22023';
  end if;
  if p_internal_rpc is null or length(trim(p_internal_rpc)) = 0 then
    raise exception 'internal_rpc er paakraevet' using errcode = '22023';
  end if;
  perform set_config('stork.allow_break_glass_operation_types_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);
  insert into core_compliance.break_glass_operation_types (
    operation_type, display_name, description, internal_rpc, required_payload_schema, is_active, status
  ) values (
    p_operation_type, p_display_name, p_description, p_internal_rpc, p_required_payload_schema, false, 'draft'
  )
  on conflict (operation_type) do update set
    display_name = excluded.display_name,
    description = excluded.description,
    internal_rpc = excluded.internal_rpc,
    required_payload_schema = excluded.required_payload_schema
  returning * into v_row;
  return v_row;
end;
$func$;

revoke all on function core_compliance.break_glass_operation_type_upsert(text, text, text, text, jsonb, text) from public;
grant execute on function core_compliance.break_glass_operation_type_upsert(text, text, text, text, jsonb, text) to authenticated;

-- ─── UI-RPC: approve (draft → approved; ingen separat test_run) ───────────
-- BG-operationer testes manuelt via two-actor approve i selve break_glass_request-flowet.
create or replace function core_compliance.break_glass_operation_type_approve(
  p_id uuid, p_change_reason text
) returns core_compliance.break_glass_operation_types
language plpgsql security definer set search_path = '' as $func$
declare v_row core_compliance.break_glass_operation_types;
begin
  if not core_identity.has_permission('break_glass_operation_types', 'approve', true) then
    raise exception 'break_glass_operation_type_approve kraever permission break_glass_operation_types.approve.can_edit' using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;
  select * into v_row from core_compliance.break_glass_operation_types where id = p_id for update;
  if v_row.id is null then raise exception 'operation_type % findes ikke', p_id using errcode = 'P0002'; end if;
  if v_row.status not in ('draft', 'tested') then
    raise exception 'approve kraever status=draft eller tested (har %)', v_row.status using errcode = 'P0001';
  end if;
  perform set_config('stork.allow_break_glass_operation_types_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);
  update core_compliance.break_glass_operation_types set status = 'approved' where id = p_id returning * into v_row;
  return v_row;
end;
$func$;

revoke all on function core_compliance.break_glass_operation_type_approve(uuid, text) from public;
grant execute on function core_compliance.break_glass_operation_type_approve(uuid, text) to authenticated;

-- ─── UI-RPC: activate (approved → active) ─────────────────────────────────
create or replace function core_compliance.break_glass_operation_type_activate(
  p_id uuid, p_change_reason text
) returns core_compliance.break_glass_operation_types
language plpgsql security definer set search_path = '' as $func$
declare v_row core_compliance.break_glass_operation_types;
begin
  if not core_identity.has_permission('break_glass_operation_types', 'activate', true) then
    raise exception 'break_glass_operation_type_activate kraever permission break_glass_operation_types.activate.can_edit' using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;
  select * into v_row from core_compliance.break_glass_operation_types where id = p_id for update;
  if v_row.id is null then raise exception 'operation_type % findes ikke', p_id using errcode = 'P0002'; end if;
  if v_row.status <> 'approved' then
    raise exception 'activate kraever status=approved (har %)', v_row.status using errcode = 'P0001';
  end if;
  perform set_config('stork.allow_break_glass_operation_types_write', 'true', true);
  perform set_config('stork.allow_op_type_activate', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);
  update core_compliance.break_glass_operation_types set status = 'active', is_active = true where id = p_id returning * into v_row;
  return v_row;
end;
$func$;

revoke all on function core_compliance.break_glass_operation_type_activate(uuid, text) from public;
grant execute on function core_compliance.break_glass_operation_type_activate(uuid, text) to authenticated;

-- ─── Bootstrap-permissions til superadmin ─────────────────────────────────
select set_config('stork.allow_role_page_permissions_write', 'true', false);
select set_config('stork.change_reason',
  'P3: bootstrap break_glass_operation_types-permissions til superadmin', false);

insert into core_identity.role_page_permissions (role_id, page_key, tab_key, can_view, can_edit, scope)
select (select id from core_identity.roles where name = 'superadmin'),
       page_key, tab_key, true, true, 'all'
from (values
  ('break_glass_operation_types', 'manage'),
  ('break_glass_operation_types', 'approve'),
  ('break_glass_operation_types', 'activate')
) as perms(page_key, tab_key)
on conflict (role_id, page_key, coalesce(tab_key, '')) do nothing;
