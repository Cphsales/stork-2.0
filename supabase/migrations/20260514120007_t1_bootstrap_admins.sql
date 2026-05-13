-- Trin 1 / fundament — bootstrap admin-mapping for mg@ + km@.
--
-- Master-plan §1.7. Etablerer minimum employees + roles + role_page_permissions
-- så vi bevarer admin-vej under trin 5 (identitet del 1).
--
-- Disse tabeller udvides med fulde felter i trin 5 (hire_date, termination_date,
-- anonymized_at, scope-subtree etc.) via ALTER TABLE. Trin 1's struktur er
-- forward-kompatibel.
--
-- mg@ + km@ auth.users-id'er (hentet fra Supabase Auth):
--   mg@copenhagensales.dk → 6d034bba-84ec-48ad-a94e-219aa5755b88
--   km@copenhagensales.dk → 735dca62-808c-4389-b038-9242313c4a20

-- ─── core_identity.employees (minimum-bootstrap) ─────────────────────────
-- no-dedup-key: master-tabel for medarbejdere; identitet er natural key (auth_user_id + email UNIQUE).
create table core_identity.employees (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete restrict,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  hire_date date,
  termination_date date,
  anonymized_at timestamptz,
  role_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table core_identity.employees is
  'Master-plan §1.7 ankerentitet for menneske. Minimum-struktur i trin 1 (bootstrap). Udvides i trin 5 med fulde felter og constraints.';

-- Partial index på aktive medarbejdere. Termination_date filtreres ved query-tid
-- (current_date er ikke IMMUTABLE og kan ikke indgå i index-prædikat).
create index employees_active_idx on core_identity.employees (id, termination_date)
  where anonymized_at is null;

alter table core_identity.employees enable row level security;
alter table core_identity.employees force row level security;

revoke all on table core_identity.employees from public, anon, service_role;
grant select on table core_identity.employees to authenticated;

create policy employees_select on core_identity.employees
  for select to authenticated
  using (auth_user_id = auth.uid() or core_identity.is_admin());

-- ─── core_identity.roles ─────────────────────────────────────────────────
-- no-dedup-key: master-tabel for roller; navn er natural key (UNIQUE).
create table core_identity.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table core_identity.roles is
  'Master-plan §5.2 / §1.7: roller som samlinger af rettigheder, ikke titler.';

alter table core_identity.roles enable row level security;
alter table core_identity.roles force row level security;

revoke all on table core_identity.roles from public, anon, service_role;
grant select on table core_identity.roles to authenticated;

create policy roles_select on core_identity.roles
  for select to authenticated
  using (true);

-- FK fra employees.role_id til roles.id (deferred efter roles eksisterer).
alter table core_identity.employees
  add constraint employees_role_id_fk
  foreign key (role_id) references core_identity.roles(id) on delete restrict;

-- ─── core_identity.role_page_permissions ─────────────────────────────────
-- no-dedup-key: master-tabel for rolle-permissions; (role, page_key, tab_key) er natural key.
create table core_identity.role_page_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references core_identity.roles(id) on delete restrict,
  page_key text not null,
  tab_key text,
  can_view boolean not null default false,
  can_edit boolean not null default false,
  scope text not null check (scope in ('all', 'subtree', 'team', 'self')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table core_identity.role_page_permissions is
  'Master-plan §5.2 firedimensional permission: (role, page+tab, view+edit, scope). tab_key NULL = hele page.';

-- Partial UNIQUE: én permission pr. (rolle, page, tab — hvor NULL tæller som tom streng).
create unique index role_page_permissions_unique
  on core_identity.role_page_permissions (role_id, page_key, coalesce(tab_key, ''));

alter table core_identity.role_page_permissions enable row level security;
alter table core_identity.role_page_permissions force row level security;

revoke all on table core_identity.role_page_permissions from public, anon, service_role;
grant select on table core_identity.role_page_permissions to authenticated;

create policy role_page_permissions_select on core_identity.role_page_permissions
  for select to authenticated
  using (true);

-- ─── Bootstrap-data: admin-rolle + mg@ + km@ ─────────────────────────────
-- migration-tids INSERT med eksplicit session-vars (audit fanger via trigger
-- når trigger er attached; vi attacher trigger efter bootstrap så vi undgår
-- cirkulær dependence på is_admin() i audit-trigger under self-bootstrap).

do $$
declare
  v_role_id uuid := gen_random_uuid();
  v_mg_id uuid := gen_random_uuid();
  v_km_id uuid := gen_random_uuid();
begin
  insert into core_identity.roles (id, name, description) values
    (v_role_id, 'admin', 'System-administrator. Permission system.manage med scope=all.');

  insert into core_identity.role_page_permissions
    (role_id, page_key, tab_key, can_view, can_edit, scope) values
    (v_role_id, 'system', 'manage', true, true, 'all');

  insert into core_identity.employees
    (id, auth_user_id, first_name, last_name, email, role_id)
  values
    (v_mg_id, '6d034bba-84ec-48ad-a94e-219aa5755b88',
     'Mathias', 'Grubak', 'mg@copenhagensales.dk', v_role_id),
    (v_km_id, '735dca62-808c-4389-b038-9242313c4a20',
     'Kasper', 'Madsen', 'km@copenhagensales.dk', v_role_id);
end;
$$;

-- ─── Redefiner current_employee_id() ─────────────────────────────────────
-- Læser fra employees med auth.uid()-mapping. Filtrerer på aktiv (ikke anonymized,
-- ikke termineret).
create or replace function core_identity.current_employee_id()
returns uuid
language sql
stable
security invoker
set search_path = ''
as $$
  select e.id
  from core_identity.employees e
  where e.auth_user_id = auth.uid()
    and e.anonymized_at is null
    and (e.termination_date is null or e.termination_date >= current_date)
  limit 1;
$$;

-- ─── Redefiner is_admin() ────────────────────────────────────────────────
-- True hvis aktuel employee har permission system.manage med scope=all + can_edit=true.
create or replace function core_identity.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from core_identity.employees e
    join core_identity.role_page_permissions p on p.role_id = e.role_id
    where e.auth_user_id = auth.uid()
      and e.anonymized_at is null
      and (e.termination_date is null or e.termination_date >= current_date)
      and p.page_key = 'system'
      and p.tab_key = 'manage'
      and p.scope = 'all'
      and p.can_edit = true
  );
$$;

-- ─── Audit-triggere på bootstrap-tabeller (attaches NU efter data er INSERT'et) ──
-- Vi atter audit på roles, role_page_permissions, employees så fremtidige
-- mutationer fanges. Bootstrap-INSERT-rækkerne er ikke auditeret (de er
-- system-creation, ikke forretnings-event).
create trigger employees_audit
  after insert or update or delete on core_identity.employees
  for each row execute function core_compliance.stork_audit();

create trigger roles_audit
  after insert or update or delete on core_identity.roles
  for each row execute function core_compliance.stork_audit();

create trigger role_page_permissions_audit
  after insert or update or delete on core_identity.role_page_permissions
  for each row execute function core_compliance.stork_audit();

-- set_updated_at triggers
create trigger employees_set_updated_at before update on core_identity.employees
  for each row execute function core_compliance.set_updated_at();
create trigger roles_set_updated_at before update on core_identity.roles
  for each row execute function core_compliance.set_updated_at();
create trigger role_page_permissions_set_updated_at before update on core_identity.role_page_permissions
  for each row execute function core_compliance.set_updated_at();
