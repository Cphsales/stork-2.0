-- Trin 1 / fundament — opret tre core-schemas + REVOKE/GRANT-skabelon + statement-timeout-defaults.
--
-- Master-plan §1.11 (tre-schema-arkitektur, rettelse 17 fra-trin-1) +
-- §1.14 driftstabilitet (statement-timeout-disciplin).
--
-- Princip: app-roller har ingen direkte tabel-rettigheder. Adgang sker via
-- RPC'er ejet af respektive core-schema. RLS bærer adgangs-sandheden.
--
-- cron-change-reason: t1 fundament — schemas + statement-timeout-default.

-- ─── Schemas ──────────────────────────────────────────────────────────────
create schema if not exists core_compliance;
create schema if not exists core_identity;
create schema if not exists core_money;

comment on schema core_compliance is
  'Compliance og governance: audit, klassifikation, anonymization_state, heartbeats, break_glass_requests, legacy_snapshots, legacy_audit. Master-plan §1.11.';
comment on schema core_identity is
  'Aktører og master-data om "hvem og hvor": medarbejdere, identitets-master, org-træ, teams, roller, klienter, lokationer, vehicle-registry. Master-plan §1.11.';
comment on schema core_money is
  'Forretnings-transaktioner og beregnings-drivende data: salg, cancellations, pricing, vagter, klient-fordeling, lønperiode, formler, dashboards, bookings. Master-plan §1.11.';

-- ─── REVOKE-skabelon ──────────────────────────────────────────────────────
-- Default-strategi: app-roller har USAGE på schema (kan referere objekter)
-- men ingen direkte rettigheder på tabeller. Hver tabel skal eksplicit have
-- INSERT/UPDATE/DELETE via policy (med session-var) eller via SECURITY DEFINER RPC.

grant usage on schema core_compliance to authenticated, anon, service_role;
grant usage on schema core_identity   to authenticated, anon, service_role;
grant usage on schema core_money      to authenticated, anon, service_role;

-- Default-privilegier: nye tabeller får INGEN automatiske rettigheder til app-roller.
alter default privileges in schema core_compliance revoke all on tables from public, authenticated, anon, service_role;
alter default privileges in schema core_identity   revoke all on tables from public, authenticated, anon, service_role;
alter default privileges in schema core_money      revoke all on tables from public, authenticated, anon, service_role;

-- Default-privilegier for funktioner: SECURITY DEFINER RPC'er får EXECUTE til authenticated
-- (manuelt revokes hvor ikke-passende; SECURITY INVOKER helpers er typisk auth-uafhængige).
alter default privileges in schema core_compliance grant execute on functions to authenticated;
alter default privileges in schema core_identity   grant execute on functions to authenticated;
alter default privileges in schema core_money      grant execute on functions to authenticated;

-- ─── Statement-timeout-defaults ───────────────────────────────────────────
-- Master-plan §1.14: default 30s, ingest 10s, periode-lock 5 min.
-- Default sættes på authenticated-role-niveau. Specifikke RPC'er overrider
-- via ALTER FUNCTION ... SET statement_timeout = '...'.

alter role authenticated set statement_timeout = '30s';
alter role anon set statement_timeout = '10s';

-- service_role beholder ingen timeout (admin/migration-vej).
