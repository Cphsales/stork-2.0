-- Trin 7 + 7b + 7c: klassificér alle nye kolonner.
--
-- Master-plan §1.2: hver kolonne i hele systemet skal have indgang i registry.
-- Mathias' låste UI-konfig-regel: gaten validerer kun existence, ikke værdier.

select set_config('stork.allow_data_field_definitions_write', 'true', false);
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason', 'legacy_import_t0: t7+7b+7c — klassifikation af periode + break-glass-kolonner', false);

insert into core_compliance.data_field_definitions
  (table_schema, table_name, column_name, category, pii_level, retention_type, retention_value, match_role, purpose) values

  -- core_money.pay_period_settings (singleton config)
  ('core_money', 'pay_period_settings', 'id', 'konfiguration', 'none', null, null, null, 'singleton-PK (id=1)'),
  ('core_money', 'pay_period_settings', 'start_day_of_month', 'konfiguration', 'none', null, null, null, 'periode-start dag i måneden (1-28)'),
  ('core_money', 'pay_period_settings', 'recommended_lock_date_rule', 'konfiguration', 'none', null, null, null, 'regel for hvornår periode anses for klar-til-lock'),
  ('core_money', 'pay_period_settings', 'auto_lock_enabled', 'konfiguration', 'none', null, null, null, 'global feature-flag for auto-lock-cron'),
  ('core_money', 'pay_period_settings', 'created_at', 'konfiguration', 'none', null, null, null, 'oprettelse'),
  ('core_money', 'pay_period_settings', 'updated_at', 'konfiguration', 'none', null, null, null, 'sidste opdatering'),

  -- core_money.pay_periods
  ('core_money', 'pay_periods', 'id', 'master_data', 'none', null, null, null, 'periode-PK'),
  ('core_money', 'pay_periods', 'start_date', 'master_data', 'none', null, null, null, 'periode-start (inklusiv)'),
  ('core_money', 'pay_periods', 'end_date', 'master_data', 'none', null, null, null, 'periode-slut (inklusiv)'),
  ('core_money', 'pay_periods', 'status', 'operationel', 'none', null, null, null, 'open/locked livscyklus'),
  ('core_money', 'pay_periods', 'locked_at', 'operationel', 'none', null, null, null, 'tidsstempel for lock'),
  ('core_money', 'pay_periods', 'locked_by', 'operationel', 'indirect', null, null, null, 'auth.uid() der låste'),
  ('core_money', 'pay_periods', 'auto_lock_enabled', 'konfiguration', 'none', null, null, null, 'pr.-periode override af settings.auto_lock_enabled'),
  ('core_money', 'pay_periods', 'consecutive_lock_failures', 'operationel', 'none', null, null, null, 'tæller på hinanden følgende auto-lock-fejl; alert ved >=3'),
  ('core_money', 'pay_periods', 'last_lock_attempt_at', 'operationel', 'none', null, null, null, 'sidste auto-lock-forsøg'),
  ('core_money', 'pay_periods', 'last_lock_error', 'operationel', 'none', 'time_based', '{"max_days": 90}'::jsonb, null, 'fejlmeddelelse fra sidste fejlede lock-forsøg'),
  ('core_money', 'pay_periods', 'created_at', 'master_data', 'none', null, null, null, 'oprettelse'),
  ('core_money', 'pay_periods', 'updated_at', 'master_data', 'none', null, null, null, 'sidste opdatering'),

  -- core_money.commission_snapshots (final immutable)
  ('core_money', 'commission_snapshots', 'id', 'master_data', 'none', null, null, null, 'snapshot-PK'),
  ('core_money', 'commission_snapshots', 'period_id', 'master_data', 'none', null, null, null, 'FK til pay_periods'),
  ('core_money', 'commission_snapshots', 'employee_id', 'master_data', 'indirect', null, null, null, 'FK til employees; provision-modtager'),
  ('core_money', 'commission_snapshots', 'sale_id', 'master_data', 'none', null, null, null, 'sale-pointer; FK aktiveres trin 14'),
  ('core_money', 'commission_snapshots', 'amount', 'master_data', 'none', null, null, null, 'frosset provision-beløb ved lock'),
  ('core_money', 'commission_snapshots', 'status_at_lock', 'master_data', 'none', null, null, null, 'sale-status på lock-tidspunkt'),
  ('core_money', 'commission_snapshots', 'created_at', 'master_data', 'none', null, null, null, 'snapshot-skabelse'),

  -- core_money.salary_corrections (final immutable)
  ('core_money', 'salary_corrections', 'id', 'master_data', 'none', null, null, null, 'correction-PK'),
  ('core_money', 'salary_corrections', 'target_period_id', 'master_data', 'none', null, null, null, 'periode hvor correction lander; skal være open ved INSERT'),
  ('core_money', 'salary_corrections', 'source_sale_id', 'master_data', 'none', null, null, null, 'oprindeligt salg; FK aktiveres trin 14'),
  ('core_money', 'salary_corrections', 'source_period_id', 'master_data', 'none', null, null, null, 'oprindelig periode for sale'),
  ('core_money', 'salary_corrections', 'amount', 'master_data', 'none', null, null, null, 'correction-beløb (signed; CHECK pr. reason)'),
  ('core_money', 'salary_corrections', 'reason', 'master_data', 'none', null, null, null, 'cancellation/cancellation_reversal/kurv_correction/manual_error/other'),
  ('core_money', 'salary_corrections', 'description', 'master_data', 'none', null, null, null, 'fri-tekst beskrivelse'),
  ('core_money', 'salary_corrections', 'source_cancellation_id', 'master_data', 'none', null, null, null, 'FK til cancellations hvis fra annullering'),
  ('core_money', 'salary_corrections', 'created_at', 'master_data', 'none', null, null, null, 'oprettelse'),
  ('core_money', 'salary_corrections', 'created_by', 'master_data', 'indirect', null, null, null, 'oprettende medarbejder'),

  -- core_money.cancellations (skeleton)
  ('core_money', 'cancellations', 'id', 'master_data', 'none', null, null, null, 'cancellation-PK'),
  ('core_money', 'cancellations', 'source_sale_id', 'master_data', 'none', null, null, null, 'annulleret salg; FK aktiveres trin 14'),
  ('core_money', 'cancellations', 'target_period_id', 'master_data', 'none', null, null, null, 'periode hvor cancellation-correction lander (bruger-valgt, rettelse 2)'),
  ('core_money', 'cancellations', 'effekt_dato', 'master_data', 'none', null, null, null, 'effekt-dato (metadata, styrer ikke fradrag-placering)'),
  ('core_money', 'cancellations', 'amount', 'master_data', 'none', null, null, null, 'fradrags-beløb (positivt)'),
  ('core_money', 'cancellations', 'reason', 'master_data', 'none', null, null, null, 'kunde_annullering/match_rettelse'),
  ('core_money', 'cancellations', 'source', 'master_data', 'none', null, null, null, 'oprindelse: manual/excel_upload/crm_match/unknown'),
  ('core_money', 'cancellations', 'match_id', 'master_data', 'none', null, null, 'crm_match_id', 'klient-CRM-match identifier'),
  ('core_money', 'cancellations', 'reverses_cancellation_id', 'master_data', 'none', null, null, null, 'self-FK for cancellation-reversal (master-plan §2.1.3)'),
  ('core_money', 'cancellations', 'created_at', 'master_data', 'none', null, null, null, 'oprettelse'),
  ('core_money', 'cancellations', 'created_by', 'master_data', 'indirect', null, null, null, 'oprettende medarbejder'),

  -- core_money.pay_period_candidate_runs
  ('core_money', 'pay_period_candidate_runs', 'id', 'operationel', 'none', null, null, null, 'run-PK'),
  ('core_money', 'pay_period_candidate_runs', 'period_id', 'operationel', 'none', null, null, null, 'FK til pay_periods'),
  ('core_money', 'pay_period_candidate_runs', 'generated_at', 'operationel', 'none', null, null, null, 'compute-tidsstempel'),
  ('core_money', 'pay_period_candidate_runs', 'generated_by', 'operationel', 'indirect', null, null, null, 'caller-employee_id (null for cron)'),
  ('core_money', 'pay_period_candidate_runs', 'data_checksum', 'operationel', 'none', null, null, null, 'sha256 af source-data tilstand ved compute-tid'),
  ('core_money', 'pay_period_candidate_runs', 'data_checksum_inputs', 'operationel', 'none', null, null, null, 'jsonb-snapshot af source-data-tællere (counts, max-timestamps)'),
  ('core_money', 'pay_period_candidate_runs', 'is_current', 'operationel', 'none', null, null, null, 'true for seneste run pr. periode; partial UNIQUE'),
  ('core_money', 'pay_period_candidate_runs', 'commission_row_count', 'operationel', 'none', null, null, null, 'antal candidate commission-rows beregnet'),
  ('core_money', 'pay_period_candidate_runs', 'correction_row_count', 'operationel', 'none', null, null, null, 'antal candidate correction-rows beregnet'),
  ('core_money', 'pay_period_candidate_runs', 'computation_duration_ms', 'operationel', 'none', null, null, null, 'compute-varighed i ms'),
  ('core_money', 'pay_period_candidate_runs', 'created_at', 'operationel', 'none', null, null, null, 'oprettelse'),

  -- core_money.commission_snapshots_candidate (mutable, mirror af final)
  ('core_money', 'commission_snapshots_candidate', 'id', 'operationel', 'none', null, null, null, 'candidate-PK'),
  ('core_money', 'commission_snapshots_candidate', 'candidate_run_id', 'operationel', 'none', null, null, null, 'FK til pay_period_candidate_runs'),
  ('core_money', 'commission_snapshots_candidate', 'period_id', 'operationel', 'none', null, null, null, 'FK til pay_periods'),
  ('core_money', 'commission_snapshots_candidate', 'employee_id', 'operationel', 'indirect', null, null, null, 'FK til employees'),
  ('core_money', 'commission_snapshots_candidate', 'sale_id', 'operationel', 'none', null, null, null, 'sale-pointer; FK aktiveres trin 14'),
  ('core_money', 'commission_snapshots_candidate', 'amount', 'operationel', 'none', null, null, null, 'candidate provision-beløb'),
  ('core_money', 'commission_snapshots_candidate', 'status_at_lock', 'operationel', 'none', null, null, null, 'forventet sale-status'),
  ('core_money', 'commission_snapshots_candidate', 'created_at', 'operationel', 'none', null, null, null, 'oprettelse'),

  -- core_money.salary_corrections_candidate (mutable, mirror af final)
  ('core_money', 'salary_corrections_candidate', 'id', 'operationel', 'none', null, null, null, 'candidate-PK'),
  ('core_money', 'salary_corrections_candidate', 'candidate_run_id', 'operationel', 'none', null, null, null, 'FK til pay_period_candidate_runs'),
  ('core_money', 'salary_corrections_candidate', 'target_period_id', 'operationel', 'none', null, null, null, 'mirrors salary_corrections.target_period_id'),
  ('core_money', 'salary_corrections_candidate', 'source_sale_id', 'operationel', 'none', null, null, null, 'mirrors source_sale_id'),
  ('core_money', 'salary_corrections_candidate', 'source_period_id', 'operationel', 'none', null, null, null, 'mirrors source_period_id'),
  ('core_money', 'salary_corrections_candidate', 'amount', 'operationel', 'none', null, null, null, 'candidate-beløb'),
  ('core_money', 'salary_corrections_candidate', 'reason', 'operationel', 'none', null, null, null, 'mirrors reason-enum'),
  ('core_money', 'salary_corrections_candidate', 'description', 'operationel', 'none', null, null, null, 'mirrors description'),
  ('core_money', 'salary_corrections_candidate', 'source_cancellation_id', 'operationel', 'none', null, null, null, 'mirrors source_cancellation_id'),
  ('core_money', 'salary_corrections_candidate', 'created_by', 'operationel', 'indirect', null, null, null, 'mirrors created_by'),
  ('core_money', 'salary_corrections_candidate', 'created_at', 'operationel', 'none', null, null, null, 'oprettelse'),

  -- core_compliance.cron_heartbeats — ny kolonne
  ('core_compliance', 'cron_heartbeats', 'consecutive_failure_count', 'operationel', 'none', null, null, null, 'tæller på hinanden følgende failures; reset ved ok; >=3 = kritisk'),

  -- core_compliance.break_glass_operation_types
  ('core_compliance', 'break_glass_operation_types', 'id', 'konfiguration', 'none', null, null, null, 'operation-type-PK'),
  ('core_compliance', 'break_glass_operation_types', 'operation_type', 'konfiguration', 'none', null, null, null, 'unikt operation-navn'),
  ('core_compliance', 'break_glass_operation_types', 'display_name', 'konfiguration', 'none', null, null, null, 'UI-vist navn'),
  ('core_compliance', 'break_glass_operation_types', 'description', 'konfiguration', 'none', null, null, null, 'fri-tekst beskrivelse'),
  ('core_compliance', 'break_glass_operation_types', 'internal_rpc', 'konfiguration', 'none', null, null, null, 'fuldt kvalificeret RPC-navn der eksekveres'),
  ('core_compliance', 'break_glass_operation_types', 'required_payload_schema', 'konfiguration', 'none', null, null, null, 'jsonb-schema for target_payload-validering'),
  ('core_compliance', 'break_glass_operation_types', 'is_active', 'konfiguration', 'none', null, null, null, 'aktiv operation-type'),
  ('core_compliance', 'break_glass_operation_types', 'created_at', 'konfiguration', 'none', null, null, null, 'oprettelse'),
  ('core_compliance', 'break_glass_operation_types', 'updated_at', 'konfiguration', 'none', null, null, null, 'sidste opdatering'),

  -- core_compliance.break_glass_requests
  ('core_compliance', 'break_glass_requests', 'id', 'audit', 'none', null, null, null, 'request-PK'),
  ('core_compliance', 'break_glass_requests', 'operation_type', 'audit', 'none', null, null, null, 'FK til operation_types'),
  ('core_compliance', 'break_glass_requests', 'target_id', 'audit', 'indirect', null, null, null, 'target-entity-id (pay_period_id, audit_log.id, etc.)'),
  ('core_compliance', 'break_glass_requests', 'target_payload', 'audit', 'indirect', null, null, null, 'operation-specifik input-payload'),
  ('core_compliance', 'break_glass_requests', 'requested_by', 'audit', 'indirect', null, null, null, 'requester employee_id'),
  ('core_compliance', 'break_glass_requests', 'requested_at', 'audit', 'none', null, null, null, 'request-tidsstempel'),
  ('core_compliance', 'break_glass_requests', 'reason', 'audit', 'none', null, null, null, 'fri-tekst-årsag'),
  ('core_compliance', 'break_glass_requests', 'status', 'audit', 'none', null, null, null, 'pending/approved/rejected/executed/expired'),
  ('core_compliance', 'break_glass_requests', 'approved_by', 'audit', 'indirect', null, null, null, 'approver employee_id (CHECK != requested_by)'),
  ('core_compliance', 'break_glass_requests', 'approved_at', 'audit', 'none', null, null, null, 'approve-tidsstempel'),
  ('core_compliance', 'break_glass_requests', 'approval_notes', 'audit', 'none', null, null, null, 'approval-noter'),
  ('core_compliance', 'break_glass_requests', 'rejection_reason', 'audit', 'none', null, null, null, 'reject-årsag'),
  ('core_compliance', 'break_glass_requests', 'executed_at', 'audit', 'none', null, null, null, 'execute-tidsstempel'),
  ('core_compliance', 'break_glass_requests', 'executed_by', 'audit', 'indirect', null, null, null, 'executor employee_id'),
  ('core_compliance', 'break_glass_requests', 'expires_at', 'audit', 'none', null, null, null, 'default requested_at + 24t'),
  ('core_compliance', 'break_glass_requests', 'created_at', 'audit', 'none', null, null, null, 'oprettelse'),
  ('core_compliance', 'break_glass_requests', 'updated_at', 'audit', 'none', null, null, null, 'sidste opdatering');
