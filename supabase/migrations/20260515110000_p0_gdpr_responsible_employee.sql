-- P0: gdpr_responsible_employee_id på superadmin_settings.
--
-- BAGGRUND (Codex Fund 26 + master-plan §1.4):
-- GDPR kræver en navngiven dataansvarlig. For at gøre den til en stamme-
-- entitet i databasen (vision-princip 1) tilføjes felt på superadmin_settings
-- (singleton). Anonymization-RPCs (P1b) skal kunne referere til den.
--
-- PREFLIGHT (Fund 26):
-- 1. Verificér at superadmin_settings har præcis 1 row (id=1)
-- 2. Verificér at mindst én aktiv superadmin-employee findes (kan udnævnes)
-- 3. Backfill: udnævn den ældste aktive superadmin (deterministic)
-- 4. SET NOT NULL — efter backfill garanterer non-null værdi
--
-- UI-RPC: gdpr_responsible_set(p_employee_id, p_change_reason)
-- Permission: has_permission('gdpr_responsible', 'manage', true)
-- Kandidat: enhver aktiv employee (verificeret via is_active_employee_state)
-- (Skift af GDPR-ansvarlig kræver kode-commit-niveau-disciplin via UI-RPC.)

-- ─── Preflight ─────────────────────────────────────────────────────────────
do $preflight$
declare
  v_settings_count integer;
  v_admin_count integer;
begin
  select count(*) into v_settings_count from core_compliance.superadmin_settings;
  if v_settings_count <> 1 then
    raise exception 'P0 PREFLIGHT FAIL: superadmin_settings skal have praecis 1 row (har %)', v_settings_count
      using errcode = 'P0001';
  end if;

  select count(*) into v_admin_count
    from core_identity.employees e
    join core_identity.role_page_permissions p on p.role_id = e.role_id
   where core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
     and p.page_key = 'system'
     and p.tab_key = 'manage'
     and p.scope = 'all'
     and p.can_edit = true;
  if v_admin_count < 1 then
    raise exception 'P0 PREFLIGHT FAIL: mindst 1 aktiv superadmin kraeves (har %)', v_admin_count
      using errcode = 'P0001';
  end if;
end;
$preflight$;

-- ─── Tilføj kolonne (NULLABLE midlertidigt) ────────────────────────────────
alter table core_compliance.superadmin_settings
  add column gdpr_responsible_employee_id uuid references core_identity.employees(id);

comment on column core_compliance.superadmin_settings.gdpr_responsible_employee_id is
  'P0: GDPR-dataansvarlig employee. Refereret af anonymization-RPCs. Sættes via gdpr_responsible_set-RPC.';

-- ─── Backfill: ældste aktive superadmin ────────────────────────────────────
select set_config('stork.source_type', 'migration', false);
select set_config('stork.allow_superadmin_settings_write', 'true', false);
select set_config('stork.change_reason',
  'P0: bootstrap gdpr_responsible_employee_id = aeldste aktive superadmin', false);

update core_compliance.superadmin_settings
   set gdpr_responsible_employee_id = (
     select e.id
       from core_identity.employees e
       join core_identity.role_page_permissions p on p.role_id = e.role_id
      where core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
        and p.page_key = 'system'
        and p.tab_key = 'manage'
        and p.scope = 'all'
        and p.can_edit = true
      order by e.created_at asc
      limit 1
   )
 where id = 1;

-- ─── SET NOT NULL (efter backfill) ─────────────────────────────────────────
alter table core_compliance.superadmin_settings
  alter column gdpr_responsible_employee_id set not null;

-- ─── Klassifikation ───────────────────────────────────────────────────────
-- superadmin_settings er i is_permanent_allowed-allowlist → permanent tilladt
select set_config('stork.allow_data_field_definitions_write', 'true', false);
select set_config('stork.change_reason',
  'P0: klassifikation af gdpr_responsible_employee_id', false);

insert into core_compliance.data_field_definitions
  (table_schema, table_name, column_name, category, pii_level, retention_type, retention_value, match_role, purpose) values
  ('core_compliance', 'superadmin_settings', 'gdpr_responsible_employee_id', 'konfiguration', 'none', 'permanent', null, null,
    'P0: GDPR-dataansvarlig employee_id; UI-redigerbar via gdpr_responsible_set-RPC')
on conflict (table_schema, table_name, column_name) do nothing;

-- ─── UI-RPC: gdpr_responsible_set ──────────────────────────────────────────
create or replace function core_compliance.gdpr_responsible_set(
  p_employee_id uuid,
  p_change_reason text
)
returns core_compliance.superadmin_settings
language plpgsql security definer set search_path = ''
as $func$
declare
  v_employee core_identity.employees;
  v_row core_compliance.superadmin_settings;
begin
  if not core_identity.has_permission('gdpr_responsible', 'manage', true) then
    raise exception 'gdpr_responsible_set kraever permission gdpr_responsible.manage.can_edit'
      using errcode = '42501';
  end if;
  if p_employee_id is null then
    raise exception 'employee_id er paakraevet' using errcode = '22023';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;

  -- Kandidat skal være aktiv employee (ikke anonymized, ikke termineret)
  select * into v_employee from core_identity.employees where id = p_employee_id;
  if v_employee.id is null then
    raise exception 'employee % findes ikke', p_employee_id using errcode = 'P0002';
  end if;
  if not core_identity.is_active_employee_state(v_employee.anonymized_at, v_employee.termination_date) then
    raise exception 'employee % er ikke aktiv (anonymized/termineret)', p_employee_id
      using errcode = 'P0001';
  end if;

  perform set_config('stork.allow_superadmin_settings_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);

  update core_compliance.superadmin_settings
     set gdpr_responsible_employee_id = p_employee_id
   where id = 1
   returning * into v_row;

  return v_row;
end;
$func$;

comment on function core_compliance.gdpr_responsible_set(uuid, text) is
  'P0: udnaevn GDPR-dataansvarlig employee. Kraever has_permission(gdpr_responsible,manage,true).';

revoke all on function core_compliance.gdpr_responsible_set(uuid, text) from public;
grant execute on function core_compliance.gdpr_responsible_set(uuid, text) to authenticated;

-- ─── Bootstrap-permission til superadmin ───────────────────────────────────
select set_config('stork.allow_role_page_permissions_write', 'true', false);
select set_config('stork.change_reason',
  'P0: bootstrap gdpr_responsible.manage-permission til superadmin', false);

insert into core_identity.role_page_permissions (role_id, page_key, tab_key, can_view, can_edit, scope)
select (select id from core_identity.roles where name = 'superadmin'),
       'gdpr_responsible', 'manage', true, true, 'all'
on conflict (role_id, page_key, coalesce(tab_key, '')) do nothing;
