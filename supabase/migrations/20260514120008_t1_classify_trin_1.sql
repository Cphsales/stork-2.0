-- Trin 1 / fundament — klassificér trin 1's egne kolonner.
--
-- Master-plan §1.2: hver kolonne i hele systemet skal have indgang i registry.
-- Migration-gate Phase 2 strict blokerer ny kolonne uden indgang.
--
-- Bootstrap-INSERT med session-vars (RPC kan ikke kaldes da is_admin() returnerer
-- false under migration — auth.uid() er NULL i migration-context).

-- Top-level set_config (ikke i DO-block) så fitness-check kan se dem
-- uden at stripDollarQuoted fjerner kaldene.
select set_config('stork.allow_data_field_definitions_write', 'true', false);
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason', 'legacy_import_t0: t1 fundament — klassifikation af trin 1-kolonner', false);

insert into core_compliance.data_field_definitions
  (table_schema, table_name, column_name, category, pii_level, retention_type, retention_value, match_role, purpose) values
  -- core_compliance.audit_log
  ('core_compliance', 'audit_log', 'id', 'audit', 'none', null, null, null, 'primær nøgle for audit-row'),
  ('core_compliance', 'audit_log', 'occurred_at', 'audit', 'none', null, null, null, 'tidsstempel for audit-event; partition-key'),
  ('core_compliance', 'audit_log', 'table_schema', 'audit', 'none', null, null, null, 'target-tabellens schema'),
  ('core_compliance', 'audit_log', 'table_name', 'audit', 'none', null, null, null, 'target-tabellens navn'),
  ('core_compliance', 'audit_log', 'record_id', 'audit', 'indirect', null, null, null, 'target-rækkens id (kan være PII-pointer)'),
  ('core_compliance', 'audit_log', 'operation', 'audit', 'none', null, null, null, 'INSERT/UPDATE/DELETE'),
  ('core_compliance', 'audit_log', 'actor_user_id', 'audit', 'indirect', null, null, null, 'auth.uid() ved event-tid'),
  ('core_compliance', 'audit_log', 'actor_role', 'audit', 'none', null, null, null, 'current_user (postgres-role)'),
  ('core_compliance', 'audit_log', 'source_type', 'audit', 'none', null, null, null, 'manual/cron/webhook/trigger_cascade/service_role/unknown'),
  ('core_compliance', 'audit_log', 'change_reason', 'audit', 'none', null, null, null, 'fri-tekst-årsag (påkrævet)'),
  ('core_compliance', 'audit_log', 'schema_version', 'audit', 'none', null, null, null, 'audit-schema-version for replay-stabilitet'),
  ('core_compliance', 'audit_log', 'changed_columns', 'audit', 'none', null, null, null, 'liste af ændrede kolonner ved UPDATE'),
  ('core_compliance', 'audit_log', 'old_values', 'audit', 'indirect', null, null, null, 'jsonb-snapshot før; PII er allerede hashed via audit_filter_values'),
  ('core_compliance', 'audit_log', 'new_values', 'audit', 'indirect', null, null, null, 'jsonb-snapshot efter; PII er allerede hashed via audit_filter_values'),
  ('core_compliance', 'audit_log', 'trigger_depth', 'audit', 'none', null, null, null, 'pg_trigger_depth() ved capture'),

  -- core_compliance.cron_heartbeats
  ('core_compliance', 'cron_heartbeats', 'job_name', 'operationel', 'none', null, null, null, 'cron-jobs navn (unik)'),
  ('core_compliance', 'cron_heartbeats', 'schedule', 'operationel', 'none', null, null, null, 'cron-schedule-string'),
  ('core_compliance', 'cron_heartbeats', 'is_enabled', 'operationel', 'none', null, null, null, 'om jobbet er aktivt'),
  ('core_compliance', 'cron_heartbeats', 'last_run_at', 'operationel', 'none', null, null, null, 'sidste eksekverings-tidspunkt'),
  ('core_compliance', 'cron_heartbeats', 'last_status', 'operationel', 'none', null, null, null, 'ok/failure/skipped/partial_failure'),
  ('core_compliance', 'cron_heartbeats', 'last_error', 'operationel', 'none', 'time_based', '{"max_days": 90}'::jsonb, null, 'fejlmeddelelse fra sidste failure'),
  ('core_compliance', 'cron_heartbeats', 'last_duration_ms', 'operationel', 'none', null, null, null, 'sidste eksekverings-varighed i ms'),
  ('core_compliance', 'cron_heartbeats', 'last_successful_run_at', 'operationel', 'none', null, null, null, 'sidste vellykkede eksekvering'),
  ('core_compliance', 'cron_heartbeats', 'run_count', 'operationel', 'none', null, null, null, 'antal eksekveringer total'),
  ('core_compliance', 'cron_heartbeats', 'failure_count', 'operationel', 'none', null, null, null, 'antal failures total'),
  ('core_compliance', 'cron_heartbeats', 'created_at', 'operationel', 'none', null, null, null, 'oprettelse'),
  ('core_compliance', 'cron_heartbeats', 'updated_at', 'operationel', 'none', null, null, null, 'sidste opdatering'),

  -- core_compliance.data_field_definitions (selv-klassificering)
  ('core_compliance', 'data_field_definitions', 'id', 'master_data', 'none', null, null, null, 'primær nøgle'),
  ('core_compliance', 'data_field_definitions', 'table_schema', 'master_data', 'none', null, null, null, 'target-schema'),
  ('core_compliance', 'data_field_definitions', 'table_name', 'master_data', 'none', null, null, null, 'target-tabel'),
  ('core_compliance', 'data_field_definitions', 'column_name', 'master_data', 'none', null, null, null, 'target-kolonne'),
  ('core_compliance', 'data_field_definitions', 'category', 'master_data', 'none', null, null, null, 'operationel/konfiguration/master_data/audit/raw_payload'),
  ('core_compliance', 'data_field_definitions', 'pii_level', 'master_data', 'none', null, null, null, 'none/indirect/direct'),
  ('core_compliance', 'data_field_definitions', 'retention_type', 'master_data', 'none', null, null, null, 'time_based/event_based/legal/manual'),
  ('core_compliance', 'data_field_definitions', 'retention_value', 'master_data', 'none', null, null, null, 'jsonb-config pr. retention_type'),
  ('core_compliance', 'data_field_definitions', 'match_role', 'master_data', 'none', null, null, null, 'rolle for ingest-match (telefon/email/cpr/crm_match_id/etc.)'),
  ('core_compliance', 'data_field_definitions', 'purpose', 'master_data', 'none', null, null, null, 'fri-tekst kontekst'),
  ('core_compliance', 'data_field_definitions', 'created_at', 'master_data', 'none', null, null, null, 'oprettelse'),
  ('core_compliance', 'data_field_definitions', 'updated_at', 'master_data', 'none', null, null, null, 'sidste opdatering'),

  -- core_identity.employees (bootstrap-struktur; udvides i trin 5)
  ('core_identity', 'employees', 'id', 'master_data', 'none', null, null, null, 'ankerentitet for menneske'),
  ('core_identity', 'employees', 'auth_user_id', 'master_data', 'indirect', null, null, null, 'mapping til Supabase Auth'),
  ('core_identity', 'employees', 'first_name', 'master_data', 'direct', 'event_based', '{"event": "termination", "days_after": 1825}'::jsonb, null, 'fornavn'),
  ('core_identity', 'employees', 'last_name', 'master_data', 'direct', 'event_based', '{"event": "termination", "days_after": 1825}'::jsonb, null, 'efternavn'),
  ('core_identity', 'employees', 'email', 'master_data', 'direct', 'event_based', '{"event": "termination", "days_after": 1825}'::jsonb, 'email', 'arbejds-email; bruges som identifikator'),
  ('core_identity', 'employees', 'hire_date', 'master_data', 'indirect', null, null, null, 'ansættelses-start'),
  ('core_identity', 'employees', 'termination_date', 'master_data', 'indirect', null, null, null, 'ansættelses-slut'),
  ('core_identity', 'employees', 'anonymized_at', 'master_data', 'none', null, null, null, 'flag for anonymisering (UPDATE-mønster, ikke DELETE)'),
  ('core_identity', 'employees', 'role_id', 'master_data', 'none', null, null, null, 'FK til core_identity.roles'),
  ('core_identity', 'employees', 'created_at', 'master_data', 'none', null, null, null, 'oprettelse'),
  ('core_identity', 'employees', 'updated_at', 'master_data', 'none', null, null, null, 'sidste opdatering'),

  -- core_identity.roles
  ('core_identity', 'roles', 'id', 'master_data', 'none', null, null, null, 'primær nøgle'),
  ('core_identity', 'roles', 'name', 'master_data', 'none', null, null, null, 'rolle-navn (unik)'),
  ('core_identity', 'roles', 'description', 'master_data', 'none', null, null, null, 'fri-tekst beskrivelse'),
  ('core_identity', 'roles', 'created_at', 'master_data', 'none', null, null, null, 'oprettelse'),
  ('core_identity', 'roles', 'updated_at', 'master_data', 'none', null, null, null, 'sidste opdatering'),

  -- core_identity.role_page_permissions
  ('core_identity', 'role_page_permissions', 'id', 'master_data', 'none', null, null, null, 'primær nøgle'),
  ('core_identity', 'role_page_permissions', 'role_id', 'master_data', 'none', null, null, null, 'FK til roles'),
  ('core_identity', 'role_page_permissions', 'page_key', 'master_data', 'none', null, null, null, 'UI-page-identifier'),
  ('core_identity', 'role_page_permissions', 'tab_key', 'master_data', 'none', null, null, null, 'UI-tab-identifier; NULL = hele page'),
  ('core_identity', 'role_page_permissions', 'can_view', 'master_data', 'none', null, null, null, 'læs-rettighed'),
  ('core_identity', 'role_page_permissions', 'can_edit', 'master_data', 'none', null, null, null, 'skriv-rettighed'),
  ('core_identity', 'role_page_permissions', 'scope', 'master_data', 'none', null, null, null, 'all/subtree/team/self'),
  ('core_identity', 'role_page_permissions', 'created_at', 'master_data', 'none', null, null, null, 'oprettelse'),
  ('core_identity', 'role_page_permissions', 'updated_at', 'master_data', 'none', null, null, null, 'sidste opdatering');
