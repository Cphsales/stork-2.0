-- D1b: is_permanent_allowed IMMUTABLE-allowlist for retention_type='permanent'.
--
-- BAGGRUND (master-plan rettelse 29):
-- retention_type='permanent' må kun bruges på system-meta-kolonner:
-- PK'er, singleton-konfig, audit-struktur, system-cron-config.
-- Allowlist-ændringer kræver kode-commit + review (ingen UI-konfig).
--
-- IMMUTABLE = trigger kan referere funktionen i CHECK-lignende kontekst
-- og PostgreSQL kan inline/memoize. Allowlist er fast pr. release.
--
-- ANVENDES AF: D1c-trigger (validate_permanent_classification) på
-- core_compliance.data_field_definitions BEFORE INSERT OR UPDATE.

create or replace function core_compliance.is_permanent_allowed(
  p_table_schema text,
  p_table_name text,
  p_column_name text
) returns boolean
language sql immutable parallel safe set search_path = ''
as $$
  select exists (
    select 1
    from (values
      -- core_compliance: audit-struktur + UI-konfig-tabeller + registry selv
      ('core_compliance', 'audit_log',                   null::text),
      ('core_compliance', 'anonymization_mappings',      null::text),
      ('core_compliance', 'anonymization_state',         null::text),
      ('core_compliance', 'break_glass_operation_types', null::text),
      ('core_compliance', 'data_field_definitions',      null::text),
      ('core_compliance', 'superadmin_settings',         null::text),
      -- core_identity: rolle-/permission-system + employee-config
      ('core_identity',   'roles',                       null::text),
      ('core_identity',   'role_page_permissions',       null::text),
      ('core_identity',   'employee_active_config',      null::text),
      ('core_identity',   'employees',                   'id'),
      ('core_identity',   'employees',                   'role_id'),
      ('core_identity',   'employees',                   'created_at'),
      ('core_identity',   'employees',                   'updated_at'),
      -- core_money: system-konfig
      ('core_money',      'pay_period_settings',         null::text)
    ) as allowlist(t_schema, t_name, t_column)
    where allowlist.t_schema = p_table_schema
      and allowlist.t_name = p_table_name
      and (allowlist.t_column is null or allowlist.t_column = p_column_name)
  );
$$;

comment on function core_compliance.is_permanent_allowed(text, text, text) is
  'D1b: IMMUTABLE-allowlist for retention_type=permanent. t_column=null betyder "alle kolonner i tabellen". Allowlist-aendringer kraever kode-commit + review (master-plan rettelse 29).';

revoke all on function core_compliance.is_permanent_allowed(text, text, text) from public;
grant execute on function core_compliance.is_permanent_allowed(text, text, text) to authenticated;

-- Klassifikation af funktionen (returnerer ikke data — system-meta)
-- Ikke i data_field_definitions (det er en funktion, ikke en kolonne).
