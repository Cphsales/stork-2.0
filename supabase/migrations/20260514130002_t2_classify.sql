-- Trin 2 / §4 trin 5: klassificér nye kolonner.
--
-- superadmin_settings (singleton-konfig for floor-mekanik).

select set_config('stork.allow_data_field_definitions_write', 'true', false);
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason', 'legacy_import_t0: t2 identitet del 1 — klassifikation af superadmin_settings', false);

insert into core_compliance.data_field_definitions
  (table_schema, table_name, column_name, category, pii_level, retention_type, retention_value, match_role, purpose) values
  ('core_compliance', 'superadmin_settings', 'id', 'konfiguration', 'none', null, null, null, 'singleton-PK (id=1)'),
  ('core_compliance', 'superadmin_settings', 'min_admin_count', 'konfiguration', 'none', null, null, null, 'minimum antal aktive admins; default 2'),
  ('core_compliance', 'superadmin_settings', 'created_at', 'konfiguration', 'none', null, null, null, 'oprettelse'),
  ('core_compliance', 'superadmin_settings', 'updated_at', 'konfiguration', 'none', null, null, null, 'sidste opdatering');
