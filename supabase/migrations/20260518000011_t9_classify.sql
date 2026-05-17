-- Trin 9 / §4 trin 9 Step 13: Klassifikation af alle nye T9-kolonner.
--
-- Plan V6 Beslutning 9 + krav-dok pkt 10 (teams/afdelinger anonymiseres ikke):
-- pii_level='none' for alle org-knude-relaterede felter. retention_type='time_based'.
-- Kategori varierer: operationel (placeringer, pending_changes), master_data (knuder),
-- configuration (permission-elementer, undo_settings).
--
-- Genereres programmatisk fra information_schema.columns for at undgå håndholdt liste.

do $classify$
declare
  v_col record;
  v_category text;
  v_retention text;
  v_default_value jsonb;
begin
  for v_col in
    select c.table_schema, c.table_name, c.column_name
    from information_schema.columns c
    where c.table_schema = 'core_identity'
      and c.table_name in (
        'org_nodes', 'org_node_versions', 'org_node_closure',
        'employee_node_placements', 'client_node_placements',
        'permission_areas', 'permission_pages', 'permission_tabs',
        'role_permission_grants',
        'pending_changes', 'undo_settings'
      )
      and not exists (
        select 1 from core_compliance.data_field_definitions d
        where d.table_schema = c.table_schema
          and d.table_name = c.table_name
          and d.column_name = c.column_name
      )
  loop
    -- Kategori-mapping (master-plan §1.2 værdier).
    v_category := case v_col.table_name
      when 'org_nodes' then 'master_data'
      when 'org_node_versions' then 'master_data'
      when 'org_node_closure' then 'operationel'
      when 'employee_node_placements' then 'operationel'
      when 'client_node_placements' then 'operationel'
      when 'permission_areas' then 'konfiguration'
      when 'permission_pages' then 'konfiguration'
      when 'permission_tabs' then 'konfiguration'
      when 'role_permission_grants' then 'konfiguration'
      when 'pending_changes' then 'audit'
      when 'undo_settings' then 'konfiguration'
    end;

    -- Retention-mapping (time_based default; 7 år).
    v_retention := 'time_based';
    v_default_value := jsonb_build_object('days', 365 * 7);

    insert into core_compliance.data_field_definitions
      (table_schema, table_name, column_name, category, pii_level, retention_type, retention_value, match_role, purpose)
    values
      (v_col.table_schema, v_col.table_name, v_col.column_name, v_category, 'none', v_retention, v_default_value, null, 'T9 auto-classify');
  end loop;
end;
$classify$;

-- ─── Note: G-numre + fitness-checks dokumenteres i docs/teknisk/teknisk-gaeld.md ─
-- som del af build (separat docs-commit) per Plan V6 Step 13 oprydnings-strategi.
-- - G-nummer for dispatcher-extension-pattern (per Mathias 2026-05-17 build-afgørelse)
-- - G-nummer-kandidat for rettelse 23-kategori-udvidelse (closure som derived-table)
-- - G-nummer-kandidat for CI-blocker 19-allowlist-kategori-udvidelse (client_id intern FK)
-- - G-nummer for role_page_permissions-drop i senere pakke
-- - G-nummer for fuld undo-mekanisme hvis applied-undo udskydes
-- - G-nummer for org_nodes_no_mutable_columns_in_sql fitness-check (følger up)
