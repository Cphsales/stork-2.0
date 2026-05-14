-- D1 + D2 (atomisk): drop 'legal' fra retention_type-CHECK + konvertér 71 legal-rows.
--
-- BAGGRUND (master-plan rettelser 24 + 25):
-- - Stork har ingen bogføring/lovbestemt min-retention på forretningsdata.
-- - 'legal' retention-type fjernes; retention_type-enum bliver
--   {time_based, event_based, manual, permanent} + NULL tilladt.
-- - 71 eksisterende 'legal'-rows konverteres:
--   * audit_log.* (15) → permanent + NULL (audit-struktur; system-meta)
--   * break_glass_requests.* (17) → NULL + NULL (forretningsdata-default)
--   * cancellations.* (10) → NULL + NULL (forretningsdata)
--   * commission_snapshots.* (7) → NULL + NULL (forretningsdata)
--   * pay_periods.* (11) → NULL + NULL (forretningsdata)
--   * salary_corrections.* (10) → NULL + NULL (forretningsdata)
--
-- ATOMICITET: D2 sætter NULL retention_type — kan ikke ske mens nuværende
-- retention_consistency CHECK kører (kræver permanent→NULL eller
-- non-permanent→NOT NULL). Derfor: drop CHECKs → UPDATE rows → drop NOT NULL
-- → re-add CHECKs (uden 'legal', med NULL-branch) i samme transaktion.

-- Session-vars for audit-spor under denne migration
select set_config('stork.source_type', 'migration', false);
select set_config('stork.allow_data_field_definitions_write', 'true', false);
select set_config('stork.change_reason',
  'D1+D2: drop legal retention_type + konvertér 71 legal-rows pr. master-plan rettelse 24', false);

-- ─── Drop eksisterende CHECKs + NOT NULL (rækkefølge: alt FØR UPDATE) ──────
alter table core_compliance.data_field_definitions
  drop constraint data_field_definitions_retention_type_check,
  drop constraint retention_consistency,
  alter column retention_type drop not null;

-- ─── D2: konvertér legal-rows ──────────────────────────────────────────────

-- audit_log.* → permanent + NULL (audit-struktur)
update core_compliance.data_field_definitions
   set retention_type = 'permanent', retention_value = null
 where retention_type = 'legal'
   and table_schema = 'core_compliance'
   and table_name = 'audit_log';

-- Alle øvrige legal-rows → NULL + NULL (forretningsdata-default)
update core_compliance.data_field_definitions
   set retention_type = null, retention_value = null
 where retention_type = 'legal';

-- ─── D1: re-add CHECKs uden 'legal', med NULL tilladt ──────────────────────

alter table core_compliance.data_field_definitions
  add constraint data_field_definitions_retention_type_check
    check (retention_type is null
        or retention_type in ('time_based', 'event_based', 'manual', 'permanent'));

alter table core_compliance.data_field_definitions
  add constraint retention_consistency
    check (
      (retention_type = 'permanent' and retention_value is null)
      or (retention_type in ('time_based', 'event_based', 'manual') and retention_value is not null)
      or (retention_type is null and retention_value is null)
    );
