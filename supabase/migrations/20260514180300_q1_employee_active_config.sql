-- Q1: employee_active_config — UI-styret definition af "aktiv employee".
--
-- BAGGRUND (Codex-fund 11 / DEL 1B Fund #11):
-- current_employee_id() definerer i kode hvad "aktiv" betyder:
--   - anonymized_at IS NULL
--   - termination_date IS NULL OR termination_date >= current_date
-- Det er forretnings-konvention der bør være UI-konfigurerbar pr.
-- vision-princip 1+2+4. Mathias' afgørelse: fjern undtagelsen.
--
-- VALGT LØSNING (Code-afgørelse 1, Option A):
-- - Konfig-tabel `core_identity.employee_active_config` (singleton)
-- - Felter:
--   - post_termination_grace_days (default 0; dage efter termination hvor
--     employee stadig anses aktiv)
--   - treat_anonymized_as_active (default false; om anonymized employees
--     anses aktive)
-- - Helper `is_active_employee_state(anonymized_at, termination_date)`
--   returnerer boolean baseret på konfig
-- - current_employee_id, has_permission, is_admin, enforce_admin_floor
--   refactoreres til at bruge helper
-- - UI-RPC `employee_active_config_update` kræver has_permission
--   ('employee_active_config', 'manage', true)
--
-- AUTH-MAPPING (auth_user_id = auth.uid()) BEVARES som kode-fundament —
-- det er strukturel mapping, ikke forretnings-regel.
--
-- INDEX: konfig-tabel har 1 row (singleton); ingen index nødvendig.

-- ─── Tabel ─────────────────────────────────────────────────────────────────
-- no-dedup-key: singleton-config-tabel; én row med id=1.
create table core_identity.employee_active_config (
  id smallint primary key check (id = 1),
  post_termination_grace_days integer not null default 0 check (post_termination_grace_days >= 0),
  treat_anonymized_as_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table core_identity.employee_active_config is
  'Q1: singleton-konfig for "aktiv employee"-definition. UI-redigerbar via employee_active_config_update-RPC. Bruges af is_active_employee_state-helper.';

-- Bootstrap: id=1, default 0 grace, anonymized = ikke aktiv
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason', 'Q1: bootstrap employee_active_config singleton', false);

insert into core_identity.employee_active_config (id) values (1)
  on conflict (id) do nothing;

alter table core_identity.employee_active_config enable row level security;
alter table core_identity.employee_active_config force row level security;

revoke all on table core_identity.employee_active_config from public, anon, service_role;
grant select on table core_identity.employee_active_config to authenticated;

create policy employee_active_config_select on core_identity.employee_active_config
  for select to authenticated using (true);

create policy employee_active_config_update on core_identity.employee_active_config
  for update to authenticated
  using (current_setting('stork.allow_employee_active_config_write', true) = 'true')
  with check (current_setting('stork.allow_employee_active_config_write', true) = 'true');

grant update on table core_identity.employee_active_config to authenticated;

create trigger employee_active_config_set_updated_at
  before update on core_identity.employee_active_config
  for each row execute function core_compliance.set_updated_at();

create trigger employee_active_config_audit
  after update on core_identity.employee_active_config
  for each row execute function core_compliance.stork_audit();

-- ─── is_active_employee_state-helper ───────────────────────────────────────
create or replace function core_identity.is_active_employee_state(
  p_anonymized_at timestamptz,
  p_termination_date date
) returns boolean
language sql stable security invoker set search_path = ''
as $$
  select (cfg.treat_anonymized_as_active or p_anonymized_at is null)
     and (p_termination_date is null
          or p_termination_date + (cfg.post_termination_grace_days || ' days')::interval >= current_date)
  from core_identity.employee_active_config cfg
  where cfg.id = 1;
$$;

comment on function core_identity.is_active_employee_state(timestamptz, date) is
  'Q1: returnerer true hvis employee-state matcher current employee_active_config (UI-konfigurerbar). Erstatter hardkodet aktiv-filter i current_employee_id/has_permission/is_admin/enforce_admin_floor.';

revoke all on function core_identity.is_active_employee_state(timestamptz, date) from public;
grant execute on function core_identity.is_active_employee_state(timestamptz, date) to authenticated;

-- ─── Refactor current_employee_id() ────────────────────────────────────────
create or replace function core_identity.current_employee_id()
returns uuid
language sql stable security invoker set search_path = ''
as $$
  select e.id
    from core_identity.employees e
   where e.auth_user_id = auth.uid()
     and core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
   limit 1;
$$;

comment on function core_identity.current_employee_id() is
  'Q1: refactoreret til at bruge is_active_employee_state-helper (UI-konfigurerbar aktiv-definition).';

-- ─── Refactor has_permission() ─────────────────────────────────────────────
create or replace function core_identity.has_permission(
  p_page_key text,
  p_tab_key text default null,
  p_can_edit boolean default false
)
returns boolean
language sql stable security invoker set search_path = ''
as $$
  select exists (
    select 1
    from core_identity.employees e
    join core_identity.role_page_permissions p on p.role_id = e.role_id
    where e.auth_user_id = auth.uid()
      and core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
      and p.page_key = p_page_key
      and coalesce(p.tab_key, '') = coalesce(p_tab_key, '')
      and p.scope = 'all'
      and (not p_can_edit or p.can_edit = true)
  );
$$;

-- ─── Refactor is_admin() ───────────────────────────────────────────────────
create or replace function core_identity.is_admin()
returns boolean
language sql stable security invoker set search_path = ''
as $$
  select exists (
    select 1
    from core_identity.employees e
    join core_identity.role_page_permissions p on p.role_id = e.role_id
    where e.auth_user_id = auth.uid()
      and core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
      and p.page_key = 'system'
      and p.tab_key = 'manage'
      and p.scope = 'all'
      and p.can_edit = true
  );
$$;

-- ─── Refactor enforce_admin_floor() ────────────────────────────────────────
create or replace function core_identity.enforce_admin_floor()
returns trigger
language plpgsql security definer set search_path = ''
as $func$
declare
  v_active_admins integer;
  v_min_admins integer;
begin
  select min_admin_count into v_min_admins
    from core_compliance.superadmin_settings where id = 1;

  select count(*) into v_active_admins
    from core_identity.employees e
    join core_identity.role_page_permissions p on p.role_id = e.role_id
   where core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
     and p.page_key = 'system'
     and p.tab_key = 'manage'
     and p.scope = 'all'
     and p.can_edit = true;

  if v_active_admins < v_min_admins then
    raise exception 'superadmin-floor overtrådt: % aktive admins er under minimum %', v_active_admins, v_min_admins
      using errcode = 'P0001',
            hint = 'Mindst ' || v_min_admins || ' admin-medarbejdere skal bevares.';
  end if;

  return null;
end;
$func$;

-- ─── UI-RPC: employee_active_config_update ─────────────────────────────────
create or replace function core_identity.employee_active_config_update(
  p_post_termination_grace_days integer,
  p_treat_anonymized_as_active boolean,
  p_change_reason text
)
returns core_identity.employee_active_config
language plpgsql security definer set search_path = ''
as $func$
declare
  v_row core_identity.employee_active_config;
begin
  if not core_identity.has_permission('employee_active_config', 'manage', true) then
    raise exception 'employee_active_config_update kraever permission employee_active_config.manage.can_edit'
      using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;
  if p_post_termination_grace_days < 0 then
    raise exception 'post_termination_grace_days skal vaere >= 0' using errcode = '22023';
  end if;

  perform set_config('stork.allow_employee_active_config_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);

  update core_identity.employee_active_config
     set post_termination_grace_days = p_post_termination_grace_days,
         treat_anonymized_as_active = p_treat_anonymized_as_active
   where id = 1
   returning * into v_row;

  return v_row;
end;
$func$;

revoke all on function core_identity.employee_active_config_update(integer, boolean, text) from public;
grant execute on function core_identity.employee_active_config_update(integer, boolean, text) to authenticated;

-- ─── Bootstrap-permission til superadmin-rolle ─────────────────────────────
select set_config('stork.allow_role_page_permissions_write', 'true', false);
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason', 'Q1: bootstrap employee_active_config.manage permission til superadmin', false);

insert into core_identity.role_page_permissions (role_id, page_key, tab_key, can_view, can_edit, scope)
select (select id from core_identity.roles where name = 'superadmin'),
       'employee_active_config', 'manage', true, true, 'all'
on conflict (role_id, page_key, coalesce(tab_key, '')) do nothing;

-- ─── Klassifikationer ──────────────────────────────────────────────────────
select set_config('stork.allow_data_field_definitions_write', 'true', false);
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason', 'Q1: klassifikation af employee_active_config kolonner', false);

insert into core_compliance.data_field_definitions
  (table_schema, table_name, column_name, category, pii_level, retention_type, retention_value, match_role, purpose) values
  ('core_identity', 'employee_active_config', 'id', 'konfiguration', 'none', 'permanent', null, null, 'singleton-PK'),
  ('core_identity', 'employee_active_config', 'post_termination_grace_days', 'konfiguration', 'none', 'permanent', null, null, 'dage efter termination_date hvor employee stadig anses aktiv'),
  ('core_identity', 'employee_active_config', 'treat_anonymized_as_active', 'konfiguration', 'none', 'permanent', null, null, 'om anonymized employees regnes som aktive'),
  ('core_identity', 'employee_active_config', 'created_at', 'konfiguration', 'none', 'permanent', null, null, 'oprettelse'),
  ('core_identity', 'employee_active_config', 'updated_at', 'konfiguration', 'none', 'permanent', null, null, 'sidste opdatering')
on conflict (table_schema, table_name, column_name) do nothing;
