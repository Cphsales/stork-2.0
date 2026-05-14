-- Migration-leverance for trin 2 (§4 trin 5).
-- Køres MOD STORK 2.0 (denne database). Loader CSV fra 2_extract.sql
-- til en staging-temp-tabel og upserter til core_identity.employees.
--
-- Master-plan §0.5: udtræk + upload. Audit-spor source_type='migration',
-- change_reason='legacy_import_t0'.
--
-- BRUGES SÅDAN:
--   1) Kopiér CSV fra 1.0-miljø til /tmp/stork_1_employees.csv i 2.0-miljø
--   2) Eksekver dette script som postgres/admin
--   3) Verificér rad-tælling og dublet-tjek output
--
-- ROLLE-MAPPING:
--   Default tildeling: ny rolle 'sælger' for alle medarbejdere uden eksplicit
--   admin/leder-rolle. Admin-roller mapped manuelt af Mathias før upload.
--   (Rolle-mappings udvides når kravs-rolle-katalog er klart.)

begin;

-- Temp-tabel matcher CSV-struktur 1:1.
create temp table tmp_legacy_employees (
  legacy_employee_id text,
  auth_user_id text,
  first_name text,
  last_name text,
  email text,
  hire_date date,
  termination_date date,
  anonymized_at_legacy timestamptz,
  legacy_role_name text
) on commit drop;

\copy tmp_legacy_employees from '/tmp/stork_1_employees.csv' with csv header

\echo ''
\echo '── 1. Indlæst fra CSV ──'
select count(*) as csv_rows from tmp_legacy_employees;

\echo ''
\echo '── 2. Dublet-tjek (email) ──'
select email, count(*) from tmp_legacy_employees
 group by email having count(*) > 1;

\echo ''
\echo '── 3. Tjek for kollision med eksisterende 2.0-employees ──'
select t.email, t.first_name, t.last_name, e.id as existing_2_0_id
  from tmp_legacy_employees t
  join core_identity.employees e on lower(e.email) = lower(t.email);

-- Sæt audit-session-vars for upload.
select set_config('stork.allow_employees_write', 'true', false);
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason', 'legacy_import_t0: employees fra Stork 1.0', false);

-- Sikre default-rolle 'sælger' eksisterer (oprettes hvis ikke).
select set_config('stork.allow_roles_write', 'true', false);
insert into core_identity.roles (name, description)
  values ('sælger', 'Default-rolle for migrerede medarbejdere. Permissions sættes ved rolle-konfig.')
  on conflict (name) do nothing;

-- Upsert medarbejdere. mg@ + km@ filtreres fra (de er allerede admin via bootstrap).
insert into core_identity.employees
  (auth_user_id, first_name, last_name, email, hire_date, termination_date, anonymized_at, role_id)
select
  -- auth_user_id NULL hvis 1.0-værdi ikke matcher en auth.users-row (Entra mapping kommer i lag F)
  case when exists (select 1 from auth.users u where u.id::text = t.auth_user_id) then t.auth_user_id::uuid else null end,
  t.first_name,
  t.last_name,
  lower(trim(t.email)),
  t.hire_date,
  t.termination_date,
  t.anonymized_at_legacy,
  (select id from core_identity.roles where name = 'sælger')
from tmp_legacy_employees t
where lower(trim(t.email)) not in ('mg@copenhagensales.dk', 'km@copenhagensales.dk')
on conflict (email) do nothing;

\echo ''
\echo '── 4. Upload-resultat ──'
select count(*) as total_employees_after_upload from core_identity.employees;

select count(*) filter (where r.name = 'admin') as admins,
       count(*) filter (where r.name = 'sælger') as saelgere,
       count(*) filter (where e.anonymized_at is not null) as anonymized,
       count(*) filter (where e.termination_date is not null) as terminated
  from core_identity.employees e
  left join core_identity.roles r on r.id = e.role_id;

commit;

\echo ''
\echo '═══ Upload færdig. Verificér via core_identity.employees-tabel. ═══'
