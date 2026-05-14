-- Migration-leverance for trin 2 (§4 trin 5).
-- Køres MOD STORK 1.0-databasen efter discovery-fase godkendt af Mathias.
-- Producerer CSV-export der matcher core_identity.employees-strukturen 1:1.
--
-- Master-plan §0.5 (rettelse 20): Udtræk + upload, ikke ETL.
-- Inkonsistens-håndtering sker inline her (lower(trim(...)), regex-clean).
--
-- BRUGES SÅDAN:
--   1) Connect til Stork 1.0-databasen
--   2) Eksekver \copy-blok nedenfor mod en CSV-fil
--   3) Verificér CSV-output før upload (3_upload.sql)
--
-- BEMÆRK: 1.0's faktiske kolonne-mapping skal verificeres mod 1.0-skema.
-- Erstat tabel-navne og kolonne-navne hvor markeret med TODO.

\echo '═══ Stork 1.0 employees-udtræk → CSV ═══'

\copy (
  select
    e.id::text                                 as legacy_employee_id,
    e.auth_user_id::text                       as auth_user_id,
    btrim(e.first_name)                        as first_name,
    btrim(e.last_name)                         as last_name,
    lower(btrim(e.email))                      as email,
    e.hire_date,
    e.termination_date,
    case
      when e.terminated_at is not null         -- TODO: 1.0's faktiske anonymisering-flag
        then e.terminated_at::timestamptz
      else null
    end                                        as anonymized_at_legacy,
    -- Rolle-mapping: 1.0 har formentlig job_title eller role-streng;
    -- normaliseres til 2.0's role_id ved upload (3_upload.sql)
    e.role_name                                as legacy_role_name
  from employee_master_data e
  -- TODO: filtrer aktive + terminerede inden for retention-vindue
 where e.created_at >= now() - interval '5 years'
   and (e.email is not null and trim(e.email) <> '')
 order by e.created_at
) to '/tmp/stork_1_employees.csv' with csv header;

\echo ''
\echo '── Eksporteret til /tmp/stork_1_employees.csv ──'
\echo 'Næste step: kopiér filen til 2.0-miljø og kør 3_upload.sql'
