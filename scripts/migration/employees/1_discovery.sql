-- Migration-leverance for trin 2 (§4 trin 5).
-- Køres MOD STORK 1.0-databasen i discovery-fase.
-- Producerer rapport over potentielle inkonsistenser før udtræk.
--
-- Master-plan §0.5 (rettelse 20): Direkte udtræk + upload. Discovery-fase
-- fanger format-afvigelser og dubletter før de bryder match-engine på import.
--
-- BRUGES SÅDAN:
--   1) Connect til Stork 1.0-databasen (læseadgang nok)
--   2) Eksekver dette script
--   3) Gennemgå output-rapport
--   4) Ret i 1.0 (gift-skifte-navne, format-normalisering) eller markér
--      "håndteres ved import" i normaliserings-config (2_extract.sql)
--
-- BEMÆRK: 1.0's faktiske skema er ukendt for Code. Erstat referencer til
-- `employee_master_data`, `agents`, `sales` med 1.0's faktiske tabel-navne
-- inden eksekvering. Skriptet er skabelon.

\echo '═══ Stork 1.0 → 2.0 employee-migration discovery ═══'

\echo ''
\echo '── 1. Total antal medarbejdere i 1.0 ──'
-- TODO: erstat 'employee_master_data' med faktisk tabel-navn fra 1.0
select count(*) as total_employees from employee_master_data;

\echo ''
\echo '── 2. Email-format-anomalier (forventet: alle lowercase, ingen whitespace) ──'
select email,
       case
         when email <> lower(email) then 'casing'
         when email <> trim(email)  then 'whitespace'
         when email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then 'malformed'
         else 'ok'
       end as issue
  from employee_master_data
 where email is not null
   and (email <> lower(email)
     or email <> trim(email)
     or email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$')
 order by issue, email;

\echo ''
\echo '── 3. Dublet-mistanker (samme normaliserede email) ──'
select lower(trim(email)) as normalized_email, count(*) as occurrences,
       array_agg(id) as ids
  from employee_master_data
 where email is not null
 group by lower(trim(email))
having count(*) > 1
 order by occurrences desc, normalized_email;

\echo ''
\echo '── 4. Manglende navn-felter ──'
select id, email
  from employee_master_data
 where first_name is null or last_name is null
    or trim(first_name) = '' or trim(last_name) = ''
 order by email;

\echo ''
\echo '── 5. Ansættelses-status (1.0 har formentlig egen status-model) ──'
-- TODO: tilpas til 1.0's faktiske status-/termination-kolonner
select
  case
    when termination_date is null then 'active'
    when termination_date > current_date then 'pending_termination'
    else 'terminated'
  end as status,
  count(*) as count
  from employee_master_data
 group by 1
 order by count desc;

\echo ''
\echo '── 6. Identitets-spredning på tværs af 1.0''s tre tabeller ──'
-- 1.0 har angiveligt: employee_master_data, agents, sales.agent_email.
-- TODO: bekræft tabel-navne. Discovery-spørgsmål: er der agents-rækker uden
-- matchende employee, eller sales.agent_email-værdier uden agents-row?
-- Hver afsløret afvigelse skal håndteres i identitets-master-import (trin 15).

select 'employee_master_data' as src, count(*) as rows from employee_master_data
union all
select 'agents' as src, count(*) as rows from agents
union all
select 'sales_agent_email_distinct' as src, count(distinct agent_email) from sales;

\echo ''
\echo '── 7. Auth-mapping (1.0 har formentlig auth_user_id eller equivalent) ──'
-- TODO: erstat med 1.0's faktiske auth-mapping-kolonne
select count(*) filter (where auth_user_id is null) as unmapped,
       count(*) filter (where auth_user_id is not null) as mapped,
       count(*) as total
  from employee_master_data;

\echo ''
\echo '═══ End discovery — gennemgå output før udtræk ═══'
