-- D1c: validate_permanent_classification — BEFORE INSERT/UPDATE-trigger
-- på core_compliance.data_field_definitions der håndhæver
-- is_permanent_allowed-allowlist for retention_type='permanent'.
--
-- BAGGRUND (master-plan rettelse 29):
-- 'permanent' retention er fundamental-niveau-garanti (bevares evigt).
-- Må kun gælde system-meta-kolonner. Trigger blokerer ved-runtime forsøg
-- på at sætte 'permanent' på kolonner uden for is_permanent_allowed-listen.
--
-- ALLOWLIST-AENDRINGER: kræver kode-commit + review (ændring af
-- is_permanent_allowed-funktionens VALUES-blok i ny migration).
-- Ingen UI-konfig for denne — det er fundament-niveau-disciplin.

create or replace function core_compliance.validate_permanent_classification()
returns trigger
language plpgsql security definer set search_path = ''
as $func$
begin
  if new.retention_type = 'permanent' then
    if not core_compliance.is_permanent_allowed(new.table_schema, new.table_name, new.column_name) then
      raise exception 'retention_type=permanent ikke tilladt for %.%.% (uden for is_permanent_allowed-allowlist)',
        new.table_schema, new.table_name, new.column_name
        using errcode = 'P0001',
              hint = 'Tilfoej (schema, table[, column]) til is_permanent_allowed via ny migration + kode-review.';
    end if;
  end if;
  return new;
end;
$func$;

comment on function core_compliance.validate_permanent_classification() is
  'D1c: BEFORE INSERT/UPDATE-trigger paa data_field_definitions. Blokerer retention_type=permanent paa kolonner uden for is_permanent_allowed-allowlist.';

create trigger validate_permanent_classification_trg
  before insert or update on core_compliance.data_field_definitions
  for each row execute function core_compliance.validate_permanent_classification();
