-- D1.5: seed klassifikations-defaults for 76 eksisterende keys i 8 tabeller
-- (audit_log, cron_heartbeats, pay_period_settings, pay_periods,
--  commission_snapshots, salary_corrections, cancellations, data_field_definitions)
--
-- Defaults per docs/d1-5-classification-proposal.md. Hver række er
-- UI-redigerbar via lag F's superadmin-side (roadmap-post-fase-0.md).
-- Forkert default → ret i UI, ikke i ny migration.
--
-- Bemærk: Stork fører ingen bogføring (e-conomic er bogføring). Derfor
-- bruger vi 'time_based', ikke 'legal', på løn-tabeller. 'legal' er
-- reserveret til felter hvor specifik lovgivning dikterer fast tidsfrist
-- uden mulighed for forlængelse.
--
-- Migrations-mekanik:
--   - Session-vars sættes inden INSERT for audit-berigelse + RLS-bypass
--   - Direkte INSERT (ikke via data_field_definition_upsert() RPC, fordi
--     is_admin() returnerer false indtil D4 lander)
--   - stork_audit()-trigger skriver 76 rækker til audit_log automatisk

SELECT set_config('stork.source_type', 'manual', true);
SELECT set_config('stork.change_reason',
  'D1.5: bulk-seed klassifikations-defaults for 76 eksisterende keys', true);
SELECT set_config('stork.allow_data_field_definitions_write', 'true', true);

INSERT INTO public.data_field_definitions
  (table_schema, table_name, column_name, category, pii_level,
   retention_type, retention_value, match_role, purpose)
VALUES
  -- ─────────────────────────────────────────────────────────────────────
  -- public.audit_log (15 kolonner) — retention: 5 år internt audit
  -- ─────────────────────────────────────────────────────────────────────
  ('public', 'audit_log', 'id',
    'audit', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Audit-rækkens uuid PK; uændret efter INSERT'),
  ('public', 'audit_log', 'occurred_at',
    'audit', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Tidsstempel for hændelsen; trigger-genereret'),
  ('public', 'audit_log', 'table_schema',
    'audit', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Audit-target schema (typisk public)'),
  ('public', 'audit_log', 'table_name',
    'audit', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Audit-target tabel-navn'),
  ('public', 'audit_log', 'record_id',
    'audit', 'indirect',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Audit-target rows PK; peger til mulig PII-bærende række'),
  ('public', 'audit_log', 'operation',
    'audit', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'INSERT/UPDATE/DELETE'),
  ('public', 'audit_log', 'actor_user_id',
    'audit', 'indirect',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'auth.uid() for handlingens udfører'),
  ('public', 'audit_log', 'actor_role',
    'audit', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Postgres-rolle (authenticated/service_role/...) — generic'),
  ('public', 'audit_log', 'source_type',
    'audit', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'manual/cron/webhook/trigger_cascade/service_role/unknown'),
  ('public', 'audit_log', 'change_reason',
    'audit', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'System-metadata; konvention håndhæves af callers (ikke person-data)'),
  ('public', 'audit_log', 'schema_version',
    'audit', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'App schema-version-streng for replay-stabilitet'),
  ('public', 'audit_log', 'changed_columns',
    'audit', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'text[] med kolonne-navne — schema-metadata, ikke værdier'),
  ('public', 'audit_log', 'old_values',
    'audit', 'indirect',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'jsonb-dump af row før mutation; direct PII hashes af audit_filter_values()'),
  ('public', 'audit_log', 'new_values',
    'audit', 'indirect',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'jsonb-dump af row efter mutation; direct PII hashes af audit_filter_values()'),
  ('public', 'audit_log', 'trigger_depth',
    'audit', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'pg_trigger_depth() ved capture; cascade-detektion'),

  -- ─────────────────────────────────────────────────────────────────────
  -- public.cron_heartbeats (11 kolonner) — retention: 90 dage telemetri
  -- ─────────────────────────────────────────────────────────────────────
  ('public', 'cron_heartbeats', 'job_name',
    'operationel', 'none',
    'time_based', '{"max_days": 90}'::jsonb, NULL,
    'Cron-jobs logiske navn (unique)'),
  ('public', 'cron_heartbeats', 'schedule',
    'operationel', 'none',
    'time_based', '{"max_days": 90}'::jsonb, NULL,
    'cron-expression (fx 0 1 * * *)'),
  ('public', 'cron_heartbeats', 'is_enabled',
    'operationel', 'none',
    'time_based', '{"max_days": 90}'::jsonb, NULL,
    'Toggle for jobbet'),
  ('public', 'cron_heartbeats', 'last_run_at',
    'operationel', 'none',
    'time_based', '{"max_days": 90}'::jsonb, NULL,
    'Tidspunkt for seneste eksekvering'),
  ('public', 'cron_heartbeats', 'last_status',
    'operationel', 'none',
    'time_based', '{"max_days": 90}'::jsonb, NULL,
    'ok/failure'),
  ('public', 'cron_heartbeats', 'last_error',
    'operationel', 'none',
    'time_based', '{"max_days": 90}'::jsonb, NULL,
    'SQLERRM-tekst ved seneste fejl; debug skal virke'),
  ('public', 'cron_heartbeats', 'last_duration_ms',
    'operationel', 'none',
    'time_based', '{"max_days": 90}'::jsonb, NULL,
    'Performance-telemetri'),
  ('public', 'cron_heartbeats', 'run_count',
    'operationel', 'none',
    'time_based', '{"max_days": 90}'::jsonb, NULL,
    'Lifetime kør-antal'),
  ('public', 'cron_heartbeats', 'failure_count',
    'operationel', 'none',
    'time_based', '{"max_days": 90}'::jsonb, NULL,
    'Lifetime fejl-antal'),
  ('public', 'cron_heartbeats', 'created_at',
    'operationel', 'none',
    'time_based', '{"max_days": 90}'::jsonb, NULL,
    'INSERT-tid for heartbeat-rækken'),
  ('public', 'cron_heartbeats', 'updated_at',
    'operationel', 'none',
    'time_based', '{"max_days": 90}'::jsonb, NULL,
    'Sidste mutation; opdateres ved hver heartbeat-record'),

  -- ─────────────────────────────────────────────────────────────────────
  -- public.pay_period_settings (4 kolonner) — retention: manuel ved config-supersedering
  -- ─────────────────────────────────────────────────────────────────────
  ('public', 'pay_period_settings', 'id',
    'konfiguration', 'none',
    'manual', '{"event": "config_superseded"}'::jsonb, NULL,
    'Singleton settings-rækkens PK'),
  ('public', 'pay_period_settings', 'start_day_of_month',
    'konfiguration', 'none',
    'manual', '{"event": "config_superseded"}'::jsonb, NULL,
    'Start-dag for lønperiode (1-28)'),
  ('public', 'pay_period_settings', 'created_at',
    'konfiguration', 'none',
    'manual', '{"event": "config_superseded"}'::jsonb, NULL,
    'INSERT-tid'),
  ('public', 'pay_period_settings', 'updated_at',
    'konfiguration', 'none',
    'manual', '{"event": "config_superseded"}'::jsonb, NULL,
    'Sidste mutation; opdateres af set_updated_at()'),

  -- ─────────────────────────────────────────────────────────────────────
  -- public.pay_periods (8 kolonner) — retention: 5 år intern løn-historik
  -- ─────────────────────────────────────────────────────────────────────
  ('public', 'pay_periods', 'id',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Period-rækkens PK'),
  ('public', 'pay_periods', 'start_date',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Period-start dato'),
  ('public', 'pay_periods', 'end_date',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Period-slut dato'),
  ('public', 'pay_periods', 'status',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'open/locked livscyklus'),
  ('public', 'pay_periods', 'locked_at',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Tidspunkt for lock; NULL indtil låst'),
  ('public', 'pay_periods', 'locked_by',
    'operationel', 'indirect',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'auth.uid() der låste perioden'),
  ('public', 'pay_periods', 'created_at',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'INSERT-tid'),
  ('public', 'pay_periods', 'updated_at',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Sidste mutation; opdateres ved lock'),

  -- ─────────────────────────────────────────────────────────────────────
  -- public.commission_snapshots (7 kolonner) — retention: 5 år intern løn-historik
  -- ─────────────────────────────────────────────────────────────────────
  ('public', 'commission_snapshots', 'id',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Snapshot PK'),
  ('public', 'commission_snapshots', 'period_id',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'FK til pay_periods'),
  ('public', 'commission_snapshots', 'employee_id',
    'operationel', 'indirect',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'FK til employees (lag D3) — sælgeren bag provisionen'),
  ('public', 'commission_snapshots', 'sale_id',
    'operationel', 'indirect',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'FK til sale (lag E)'),
  ('public', 'commission_snapshots', 'amount',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Provision-beløb (DKK) — kobler ikke til person efter anonymisering af employee'),
  ('public', 'commission_snapshots', 'status_at_lock',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'dimension-A-status (pending/completed) ved lock-tidspunkt'),
  ('public', 'commission_snapshots', 'created_at',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'INSERT-tid (immutable derefter)'),

  -- ─────────────────────────────────────────────────────────────────────
  -- public.salary_corrections (10 kolonner) — retention: 5 år intern løn-historik
  -- ─────────────────────────────────────────────────────────────────────
  ('public', 'salary_corrections', 'id',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Correction PK'),
  ('public', 'salary_corrections', 'target_period_id',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'FK til pay_periods (modposten anvendes her)'),
  ('public', 'salary_corrections', 'source_sale_id',
    'operationel', 'indirect',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'FK til sale (lag E) — indirect via FK til PII-bærende række'),
  ('public', 'salary_corrections', 'source_period_id',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'FK til perioden korrektionen stammer fra'),
  ('public', 'salary_corrections', 'amount',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Korrektion-beløb (DKK) — kobler ikke til person efter anonymisering'),
  ('public', 'salary_corrections', 'reason',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Kort kode-ord (cancellation, cancellation_reversal m.fl.)'),
  ('public', 'salary_corrections', 'description',
    'operationel', 'indirect',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Fri-tekst forklaring; kan i praksis indeholde person-referencer'),
  ('public', 'salary_corrections', 'source_cancellation_id',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'FK til cancellations (NULL hvis ikke cancellation-baseret)'),
  ('public', 'salary_corrections', 'created_at',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'INSERT-tid (immutable derefter)'),
  ('public', 'salary_corrections', 'created_by',
    'operationel', 'indirect',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'auth.uid() der oprettede'),

  -- ─────────────────────────────────────────────────────────────────────
  -- public.cancellations (9 kolonner) — retention: 5 år salgshistorik
  -- ─────────────────────────────────────────────────────────────────────
  ('public', 'cancellations', 'id',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Cancellation PK'),
  ('public', 'cancellations', 'source_sale_id',
    'operationel', 'indirect',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'FK til sale (lag E) — indirect via FK'),
  ('public', 'cancellations', 'cancellation_date',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Dato for annullering (klient-indløbet)'),
  ('public', 'cancellations', 'amount',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Annulleret beløb (DKK) — kobler ikke til klient efter anonymisering'),
  ('public', 'cancellations', 'reason',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Kort kode-ord'),
  ('public', 'cancellations', 'matched_to_correction_id',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'FK til salary_corrections; NULL indtil matchet efter lock'),
  ('public', 'cancellations', 'matched_at',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'Tidspunkt for matching'),
  ('public', 'cancellations', 'created_at',
    'operationel', 'none',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'INSERT-tid'),
  ('public', 'cancellations', 'created_by',
    'operationel', 'indirect',
    'time_based', '{"max_days": 1825}'::jsonb, NULL,
    'auth.uid() der registrerede'),

  -- ─────────────────────────────────────────────────────────────────────
  -- public.data_field_definitions (12 kolonner) — retention: manuel ved column_dropped
  -- ─────────────────────────────────────────────────────────────────────
  ('public', 'data_field_definitions', 'id',
    'konfiguration', 'none',
    'manual', '{"event": "column_dropped"}'::jsonb, NULL,
    'Definition-rækkens PK'),
  ('public', 'data_field_definitions', 'table_schema',
    'konfiguration', 'none',
    'manual', '{"event": "column_dropped"}'::jsonb, NULL,
    'Target schema (fx public)'),
  ('public', 'data_field_definitions', 'table_name',
    'konfiguration', 'none',
    'manual', '{"event": "column_dropped"}'::jsonb, NULL,
    'Target tabel'),
  ('public', 'data_field_definitions', 'column_name',
    'konfiguration', 'none',
    'manual', '{"event": "column_dropped"}'::jsonb, NULL,
    'Target kolonne'),
  ('public', 'data_field_definitions', 'category',
    'konfiguration', 'none',
    'manual', '{"event": "column_dropped"}'::jsonb, NULL,
    'Klassifikations-kategori-værdi'),
  ('public', 'data_field_definitions', 'pii_level',
    'konfiguration', 'none',
    'manual', '{"event": "column_dropped"}'::jsonb, NULL,
    'Klassifikations-niveau-værdi'),
  ('public', 'data_field_definitions', 'retention_type',
    'konfiguration', 'none',
    'manual', '{"event": "column_dropped"}'::jsonb, NULL,
    'Klassifikations-retention-type-værdi'),
  ('public', 'data_field_definitions', 'retention_value',
    'konfiguration', 'none',
    'manual', '{"event": "column_dropped"}'::jsonb, NULL,
    'Klassifikations-retention-detalje (jsonb-struktur valideret pr. type)'),
  ('public', 'data_field_definitions', 'match_role',
    'konfiguration', 'none',
    'manual', '{"event": "column_dropped"}'::jsonb, NULL,
    'Per kolonne-per-kilde match-strategi (lag E definerer enum-værdier)'),
  ('public', 'data_field_definitions', 'purpose',
    'konfiguration', 'none',
    'manual', '{"event": "column_dropped"}'::jsonb, NULL,
    'Audit-kontekst fri-tekst'),
  ('public', 'data_field_definitions', 'created_at',
    'konfiguration', 'none',
    'manual', '{"event": "column_dropped"}'::jsonb, NULL,
    'INSERT-tid'),
  ('public', 'data_field_definitions', 'updated_at',
    'konfiguration', 'none',
    'manual', '{"event": "column_dropped"}'::jsonb, NULL,
    'Sidste mutation');

-- Smoke-tests efter apply (køres separat via execute_sql):
--   SELECT count(*) FROM public.data_field_definitions;
--     Forventet: 76
--   SELECT category, count(*) FROM public.data_field_definitions GROUP BY 1 ORDER BY 1;
--     Forventet: audit=15, konfiguration=16, master_data=0, operationel=45
--     (audit_log 15 + pay_period_settings 4 + data_field_definitions 12 +
--      cron_heartbeats 11 + pay_periods 8 + commission_snapshots 7 +
--      salary_corrections 10 + cancellations 9 = 76)
--   SELECT pii_level, count(*) FROM public.data_field_definitions GROUP BY 1 ORDER BY 1;
--     Forventet: direct=0, indirect=10, none=66
--     (indirect: record_id, actor_user_id, old_values, new_values, locked_by,
--      employee_id, sale_id, salary_corrections.source_sale_id, description,
--      created_by[salary], cancellations.source_sale_id, created_by[cancel] = 12)
--     Recount: record_id(1) + actor_user_id(2) + old_values(3) + new_values(4)
--            + locked_by(5) + employee_id(6) + sale_id(7)
--            + s.source_sale_id(8) + description(9) + s.created_by(10)
--            + c.source_sale_id(11) + c.created_by(12) = 12 indirect
--     Korrigeret: indirect=12, none=64
--   SELECT count(*) FROM public.audit_log
--     WHERE source_type = 'manual'
--       AND change_reason LIKE 'D1.5:%';
--     Forventet: 76 (én pr. seedet række)
