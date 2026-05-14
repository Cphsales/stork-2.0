-- Trin 6 / §4 trin 6: klassificér nye kolonner.

select set_config('stork.allow_data_field_definitions_write', 'true', false);
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason', 'legacy_import_t0: t6 anonymisering — klassifikation', false);

insert into core_compliance.data_field_definitions
  (table_schema, table_name, column_name, category, pii_level, retention_type, retention_value, match_role, purpose) values
  -- anonymization_mappings (konfig)
  ('core_compliance', 'anonymization_mappings', 'id', 'konfiguration', 'none', null, null, null, 'primær nøgle'),
  ('core_compliance', 'anonymization_mappings', 'entity_type', 'konfiguration', 'none', null, null, null, 'employee/client/identity/etc.'),
  ('core_compliance', 'anonymization_mappings', 'table_schema', 'konfiguration', 'none', null, null, null, 'target-schema'),
  ('core_compliance', 'anonymization_mappings', 'table_name', 'konfiguration', 'none', null, null, null, 'target-tabel'),
  ('core_compliance', 'anonymization_mappings', 'field_strategies', 'konfiguration', 'none', null, null, null, 'jsonb {field_name: strategy}'),
  ('core_compliance', 'anonymization_mappings', 'jsonb_field_strategies', 'konfiguration', 'none', null, null, null, 'jsonb-walking-strategier for felt-bag-tabeller'),
  ('core_compliance', 'anonymization_mappings', 'strategy_version', 'konfiguration', 'none', null, null, null, 'version bumpes ved mapping-ændring'),
  ('core_compliance', 'anonymization_mappings', 'is_active', 'konfiguration', 'none', null, null, null, 'mapping aktiv'),
  ('core_compliance', 'anonymization_mappings', 'created_at', 'konfiguration', 'none', null, null, null, 'oprettelse'),
  ('core_compliance', 'anonymization_mappings', 'updated_at', 'konfiguration', 'none', null, null, null, 'sidste opdatering'),

  -- anonymization_state (audit/log)
  ('core_compliance', 'anonymization_state', 'id', 'audit', 'none', null, null, null, 'primær nøgle'),
  ('core_compliance', 'anonymization_state', 'entity_type', 'audit', 'none', null, null, null, 'anonymiseret entity-type'),
  ('core_compliance', 'anonymization_state', 'table_schema', 'audit', 'none', null, null, null, 'target-schema'),
  ('core_compliance', 'anonymization_state', 'table_name', 'audit', 'none', null, null, null, 'target-tabel'),
  ('core_compliance', 'anonymization_state', 'entity_id', 'audit', 'indirect', null, null, null, 'master-row-id'),
  ('core_compliance', 'anonymization_state', 'anonymized_at', 'audit', 'none', null, null, null, 'tidsstempel for anonymisering'),
  ('core_compliance', 'anonymization_state', 'anonymization_reason', 'audit', 'none', null, null, null, 'fri-tekst-årsag'),
  ('core_compliance', 'anonymization_state', 'strategy_version', 'audit', 'none', null, null, null, 'snapshot af mapping-version'),
  ('core_compliance', 'anonymization_state', 'field_mapping_snapshot', 'audit', 'none', null, null, null, 'snapshot af field_strategies ved anonymisering'),
  ('core_compliance', 'anonymization_state', 'jsonb_field_mapping_snapshot', 'audit', 'none', null, null, null, 'snapshot af jsonb-strategier'),
  ('core_compliance', 'anonymization_state', 'audit_reference', 'audit', 'none', null, null, null, 'FK til audit_log-row'),
  ('core_compliance', 'anonymization_state', 'created_by', 'audit', 'indirect', null, null, null, 'auth.uid() ved anonymisering');
