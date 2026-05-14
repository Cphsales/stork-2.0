-- G028: klassifikation af 4 nye kolonner på anonymization_mappings.
--
-- BAGGRUND:
-- C002+C003-commit (d40922a) udvidede anonymization_mappings med 4 dispatcher-
-- felter via ALTER TABLE. Jeg overså at tilføje tilsvarende klassifikations-
-- rows i data_field_definitions. Migration-gate Phase 2 strict fanger det.
--
-- MASTER-PLAN-PARAGRAF:
-- §0 (klassifikation + retention på hver kolonne) + §1.2.
--
-- VISION-TJEK:
-- - §0 + §1.2: klassifikations-registry kræver indgang pr. kolonne. JA.
-- - C001-disciplin: retention_type NOT NULL. Konfiguration-felter → 'permanent'.
-- - Symptom vs. krav: ren disciplin-fix der bringer registry i synk med skema.
-- - Konklusion: forsvarligt.

select set_config('stork.allow_data_field_definitions_write', 'true', false);
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason',
  'G028: klassifikation af anonymization_mappings dispatcher-felter (commit d40922a)',
  false);

insert into core_compliance.data_field_definitions
  (table_schema, table_name, column_name, category, pii_level,
   retention_type, retention_value, match_role, purpose) values
  ('core_compliance', 'anonymization_mappings', 'internal_rpc_anonymize',
   'konfiguration', 'none', 'permanent', null, null,
   'fuldt kvalificeret RPC-navn (signatur uuid, text) til normal anonymisering — bruges af retention-cron-dispatcher (C002)'),
  ('core_compliance', 'anonymization_mappings', 'internal_rpc_apply',
   'konfiguration', 'none', 'permanent', null, null,
   'fuldt kvalificeret RPC-navn (signatur uuid, jsonb, text) til pure apply — bruges af replay-dispatcher med snapshot (C003)'),
  ('core_compliance', 'anonymization_mappings', 'anonymized_check_column',
   'konfiguration', 'none', 'permanent', null, null,
   'kolonne på master-tabel der fortæller om entity er anonymiseret (typisk anonymized_at)'),
  ('core_compliance', 'anonymization_mappings', 'retention_event_column',
   'konfiguration', 'none', 'permanent', null, null,
   'kolonne på master-tabel som retention-cron bruger som event-tidspunkt (typisk termination_date); NULL = ingen event-based retention');

do $verify$
declare v_missing integer;
begin
  select count(*) into v_missing
    from (values
      ('core_compliance', 'anonymization_mappings', 'internal_rpc_anonymize'),
      ('core_compliance', 'anonymization_mappings', 'internal_rpc_apply'),
      ('core_compliance', 'anonymization_mappings', 'anonymized_check_column'),
      ('core_compliance', 'anonymization_mappings', 'retention_event_column')
    ) as expected(s, t, c)
    where not exists (
      select 1 from core_compliance.data_field_definitions d
       where d.table_schema = expected.s
         and d.table_name = expected.t
         and d.column_name = expected.c
    );
  if v_missing > 0 then
    raise exception 'G028 verify: % af 4 forventede kolonner mangler stadig klassifikation', v_missing;
  end if;
end;
$verify$;
