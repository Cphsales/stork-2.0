-- Trin 10 T10.4: klassifikation for core_identity.clients + client_field_definitions
--
-- 19 kolonner: 9 på clients + 10 på client_field_definitions.
-- Alle som retention_type='permanent' (krav-dok §2.5.1 + §2.3.2: bevares evigt).
-- Forudsætning: T10.3 har udvidet is_permanent_allowed med begge tabeller.
--
-- Logo-felter klassificeret pii_level='direct' (Codex runde 11 KRITISK-SIKKERHEDSHUL):
-- logo_filename kan indeholde klient-/person-identifikatorer; logo_bytes kan vise
-- stifter/medarbejdere. logo_content_type forbliver 'none' (kun MIME-type).
-- clients.fields klassificeret 'indirect' top-level; T10.5's audit_filter_values
-- clients-special-case walker fields-jsonb og hashes direct-PII keys individuelt.
--
-- ON CONFLICT do nothing er obligatorisk per fitness-check migration-on-conflict-discipline
-- (core_compliance.data_field_definitions er på BOOTSTRAP_CONFIG_TABLES, fitness.mjs:163).

select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason',
  'T10.4: klassifikation for core_identity.clients + client_field_definitions', false);
select set_config('stork.allow_data_field_definitions_write', 'true', false);

insert into core_compliance.data_field_definitions
  (table_schema, table_name, column_name, category, pii_level,
   retention_type, retention_value, match_role, purpose)
values
  -- core_identity.clients (9 kolonner)
  ('core_identity', 'clients', 'id',                'master_data', 'none',
    'permanent', null, null, 'Klient PK; bevares evigt for FK-integritet'),
  ('core_identity', 'clients', 'name',              'master_data', 'direct',
    'permanent', null, null, 'Klient-navn (UI-required). Hashes i audit via direct-PII'),
  ('core_identity', 'clients', 'fields',            'master_data', 'indirect',
    'permanent', null, null, 'jsonb med klient-felt-værdier; direct-keys i fields hashes pr. client_field_definitions via audit_filter_values clients-special-case (T10.5)'),
  ('core_identity', 'clients', 'is_active',         'master_data', 'none',
    'permanent', null, null, 'Aktiv-flag; false = inaktiv (historik bevares; krav-dok §2.5.2)'),
  ('core_identity', 'clients', 'logo_bytes',        'master_data', 'direct',
    'permanent', null, null, 'Klient-logo binær (bytea). V12 (Codex V11): direct fordi binær billed-data kan vise stifter/medarbejdere — hashes i audit via T1 direct-PII-logik'),
  ('core_identity', 'clients', 'logo_content_type', 'master_data', 'none',
    'permanent', null, null, 'MIME-type for logo (image/png, image/svg+xml osv.) — ingen PII'),
  ('core_identity', 'clients', 'logo_filename',     'master_data', 'direct',
    'permanent', null, null, 'Original filnavn ved upload. V12 (Codex V11 KRITISK-SIKKERHEDSHUL): direct fordi filnavne kan indeholde klient-/person-identifikatorer; hashes i audit'),
  ('core_identity', 'clients', 'created_at',        'master_data', 'none',
    'permanent', null, null, 'INSERT-tid'),
  ('core_identity', 'clients', 'updated_at',        'master_data', 'none',
    'permanent', null, null, 'Sidste mutation'),
  -- core_identity.client_field_definitions (10 kolonner)
  ('core_identity', 'client_field_definitions', 'id',            'konfiguration', 'none',
    'permanent', null, null, 'Field-definition PK'),
  ('core_identity', 'client_field_definitions', 'key',           'konfiguration', 'none',
    'permanent', null, null, 'jsonb-property-name i clients.fields; UNIQUE globalt. Immutable post-INSERT (audit-PII-hash binder til key)'),
  ('core_identity', 'client_field_definitions', 'display_name',  'konfiguration', 'none',
    'permanent', null, null, 'UI-label for feltet'),
  ('core_identity', 'client_field_definitions', 'field_type',    'konfiguration', 'none',
    'permanent', null, null, 'Fri-tekst type-identifier (text/email/phone/url/...); UI håndhæver format'),
  ('core_identity', 'client_field_definitions', 'required',      'konfiguration', 'none',
    'permanent', null, null, 'Om feltet skal være sat ved INSERT (UI-validering)'),
  ('core_identity', 'client_field_definitions', 'pii_level',     'konfiguration', 'none',
    'permanent', null, null, 'PII-niveau for jsonb-key. direct hashes i audit_filter_values; direct→non-direct blokeret post-INSERT (V3 KRITISK-SIKKERHEDSHUL)'),
  ('core_identity', 'client_field_definitions', 'display_order', 'konfiguration', 'none',
    'permanent', null, null, 'UI-sortering'),
  ('core_identity', 'client_field_definitions', 'is_active',     'konfiguration', 'none',
    'permanent', null, null, 'Aktiv-flag; false = udfaset (krav-dok §2.3.2: ikke DELETE)'),
  ('core_identity', 'client_field_definitions', 'created_at',    'konfiguration', 'none',
    'permanent', null, null, 'INSERT-tid'),
  ('core_identity', 'client_field_definitions', 'updated_at',    'konfiguration', 'none',
    'permanent', null, null, 'Sidste mutation')
on conflict (table_schema, table_name, column_name) do nothing;
