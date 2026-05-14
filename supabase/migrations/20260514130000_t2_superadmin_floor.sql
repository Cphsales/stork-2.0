-- Trin 2 / §4 trin 5: Identitet del 1 — superadmin-floor.
--
-- Master-plan §1.7: "BEFORE UPDATE/DELETE-trigger på employees.role_id og på
-- role_page_permissions for admin-permission-rækker. Konfig-tabel definerer
-- minimum N (default: 2) medarbejdere der bevarer admin-permission."
--
-- Mekanik: AFTER-trigger på employees + role_page_permissions tjekker antal
-- aktive admins efter mutation. Hvis under floor → RAISE og rul transaktion
-- tilbage.
--
-- Admin defineres som medarbejder hvis rolle har permission
-- (page_key='system', tab_key='manage', scope='all', can_edit=true).

-- ─── superadmin_settings (singleton-konfig) ──────────────────────────────
-- no-dedup-key: singleton-config-tabel; én row med id=1.
create table core_compliance.superadmin_settings (
  id integer primary key check (id = 1),
  min_admin_count integer not null default 2 check (min_admin_count >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table core_compliance.superadmin_settings is
  'Master-plan §1.7 superadmin-floor-konfig. Singleton (id=1). UI-redigerbar.';

-- Top-level set_config så fitness ser session-vars uden at strippe dollar-quotes.
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason', 'legacy_import_t0: t2 superadmin_settings singleton bootstrap', false);

insert into core_compliance.superadmin_settings (id, min_admin_count) values (1, 2);

alter table core_compliance.superadmin_settings enable row level security;
alter table core_compliance.superadmin_settings force row level security;
revoke all on table core_compliance.superadmin_settings from public, anon, service_role;
grant select on table core_compliance.superadmin_settings to authenticated;

create policy superadmin_settings_select on core_compliance.superadmin_settings
  for select to authenticated using (true);

create policy superadmin_settings_update on core_compliance.superadmin_settings
  for update to authenticated
  using (current_setting('stork.allow_superadmin_settings_write', true) = 'true')
  with check (current_setting('stork.allow_superadmin_settings_write', true) = 'true');

grant update on table core_compliance.superadmin_settings to authenticated;

create trigger superadmin_settings_set_updated_at
  before update on core_compliance.superadmin_settings
  for each row execute function core_compliance.set_updated_at();

create trigger superadmin_settings_audit
  after update on core_compliance.superadmin_settings
  for each row execute function core_compliance.stork_audit();

-- ─── enforce_admin_floor() — fælles helper-funktion ──────────────────────
create or replace function core_identity.enforce_admin_floor()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_active_admins integer;
  v_min_admins integer;
begin
  select min_admin_count into v_min_admins
    from core_compliance.superadmin_settings where id = 1;

  select count(*) into v_active_admins
    from core_identity.employees e
    join core_identity.role_page_permissions p on p.role_id = e.role_id
   where e.anonymized_at is null
     and p.page_key = 'system'
     and p.tab_key = 'manage'
     and p.scope = 'all'
     and p.can_edit = true;

  if v_active_admins < v_min_admins then
    raise exception 'superadmin-floor overtrådt: % aktive admins er under minimum %', v_active_admins, v_min_admins
      using errcode = 'P0001',
            hint = 'Mindst ' || v_min_admins || ' admin-medarbejdere skal bevares. Tilføj ny admin før denne ændring.';
  end if;

  return null;  -- AFTER-trigger
end;
$$;

comment on function core_identity.enforce_admin_floor() is
  'AFTER-trigger der validerer at antal aktive admins er ≥ superadmin_settings.min_admin_count. Anvendes på employees og role_page_permissions.';

-- ─── Trigger på employees: enforce ved UPDATE af role_id eller anonymized_at, og ved DELETE ──
create trigger employees_enforce_admin_floor
  after update of role_id, anonymized_at or delete on core_identity.employees
  for each row execute function core_identity.enforce_admin_floor();

-- ─── Trigger på role_page_permissions: enforce ved ALL mutations ─────────
-- Permission-ændring kan reducere admins (eks. ændre scope fra 'all' til 'team').
create trigger role_page_permissions_enforce_admin_floor
  after update or delete on core_identity.role_page_permissions
  for each row execute function core_identity.enforce_admin_floor();

-- ─── Trigger på roles: enforce ved DELETE (kan fjerne admin-rolle helt) ──
create trigger roles_enforce_admin_floor
  after delete on core_identity.roles
  for each row execute function core_identity.enforce_admin_floor();
