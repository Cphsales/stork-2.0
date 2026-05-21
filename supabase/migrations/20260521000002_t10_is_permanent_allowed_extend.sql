-- Trin 10 T10.3: udvid core_compliance.is_permanent_allowed-allowlist
--
-- Baseret på P1a's komplette VALUES-blok (20260515110100:230-262, 15 entries
-- inkl. anonymization_strategies) + 2 nye trin 10-entries = 17 total.
--
-- core_identity.clients + core_identity.client_field_definitions klassificeres
-- som permanent (bevares evigt per krav-dok §2.5.1 og fundament-niveau-disciplin).
-- Allowlist-ændringer kræver kode-commit + review per master-plan rettelse 29.

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
      -- P1a-baseline (15 entries fra 20260515110100_p1a_anonymization_strategies.sql:230-262)
      ('core_compliance', 'audit_log',                   null::text),
      ('core_compliance', 'anonymization_mappings',      null::text),
      ('core_compliance', 'anonymization_state',         null::text),
      ('core_compliance', 'anonymization_strategies',    null::text),
      ('core_compliance', 'break_glass_operation_types', null::text),
      ('core_compliance', 'data_field_definitions',      null::text),
      ('core_compliance', 'superadmin_settings',         null::text),
      ('core_identity',   'roles',                       null::text),
      ('core_identity',   'role_page_permissions',       null::text),
      ('core_identity',   'employee_active_config',      null::text),
      ('core_identity',   'employees',                   'id'),
      ('core_identity',   'employees',                   'role_id'),
      ('core_identity',   'employees',                   'created_at'),
      ('core_identity',   'employees',                   'updated_at'),
      ('core_money',      'pay_period_settings',         null::text),
      -- Trin 10 (2 nye)
      ('core_identity',   'clients',                     null::text),
      ('core_identity',   'client_field_definitions',    null::text)
    ) as allowlist(t_schema, t_name, t_column)
    where allowlist.t_schema = p_table_schema
      and allowlist.t_name = p_table_name
      and (allowlist.t_column is null or allowlist.t_column = p_column_name)
  );
$$;

comment on function core_compliance.is_permanent_allowed(text, text, text) is
  'T10.3 (Codex V2 KRITISK #2): baseret på P1a komplette VALUES (15 entries inkl. anonymization_strategies) + 2 trin 10-entries (clients + client_field_definitions). IMMUTABLE-allowlist for retention_type=permanent. Allowlist-aendringer kraever kode-commit + review (master-plan rettelse 29).';
