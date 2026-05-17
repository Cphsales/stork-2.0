-- Trin 9 / §4 trin 9 Step 13: Klassifikation af alle T9-kolonner.
--
-- Plan V6 Beslutning 9 + krav-dok pkt 10: teams/afdelinger anonymiseres ikke.
-- pii_level='none' for alle T9-felter. retention_type='time_based' (7 år).
-- Kategori: master_data (knuder), operationel (placeringer/closure),
-- konfiguration (permission-elementer/grants/undo_settings), audit (pending_changes).
--
-- Migration-gate parser VALUES-statements; eksplicit listet pr. kolonne.

select set_config('stork.allow_data_field_definitions_write', 'true', false);
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason', 'T9 Step 13: classify alle T9-kolonner', false);

insert into core_compliance.data_field_definitions
  (table_schema, table_name, column_name, category, pii_level, retention_type, retention_value, match_role, purpose) values

  -- core_identity.pending_changes (audit)
  ('core_identity', 'pending_changes', 'id', 'audit', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'pending-change PK'),
  ('core_identity', 'pending_changes', 'change_type', 'audit', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'change-type-diskriminator'),
  ('core_identity', 'pending_changes', 'target_id', 'audit', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'target-id af ændring'),
  ('core_identity', 'pending_changes', 'payload', 'audit', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'jsonb payload til intern handler'),
  ('core_identity', 'pending_changes', 'effective_from', 'audit', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'forretnings-effective-dato'),
  ('core_identity', 'pending_changes', 'requested_by', 'audit', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'employee_id der requested'),
  ('core_identity', 'pending_changes', 'requested_at', 'audit', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'request-timestamp'),
  ('core_identity', 'pending_changes', 'approved_by', 'audit', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'employee_id der approvede'),
  ('core_identity', 'pending_changes', 'approved_at', 'audit', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'approval-timestamp'),
  ('core_identity', 'pending_changes', 'undo_deadline', 'audit', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'undo-deadline'),
  ('core_identity', 'pending_changes', 'applied_at', 'audit', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'apply-timestamp'),
  ('core_identity', 'pending_changes', 'undone_at', 'audit', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'undo-timestamp'),
  ('core_identity', 'pending_changes', 'status', 'audit', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'status-livscyklus'),
  ('core_identity', 'pending_changes', 'created_at', 'audit', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'row-created'),
  ('core_identity', 'pending_changes', 'updated_at', 'audit', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'row-updated'),

  -- core_identity.undo_settings (konfiguration)
  ('core_identity', 'undo_settings', 'change_type', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'config-PK'),
  ('core_identity', 'undo_settings', 'undo_period_seconds', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'undo-periode længde'),
  ('core_identity', 'undo_settings', 'updated_at', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'sidst opdateret'),
  ('core_identity', 'undo_settings', 'updated_by', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'opdateret af'),

  -- core_identity.org_nodes (master_data, identity-only)
  ('core_identity', 'org_nodes', 'id', 'master_data', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'identity PK'),
  ('core_identity', 'org_nodes', 'created_at', 'master_data', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'created-timestamp'),
  ('core_identity', 'org_nodes', 'updated_at', 'master_data', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'updated-timestamp'),

  -- core_identity.org_node_versions (master_data)
  ('core_identity', 'org_node_versions', 'version_id', 'master_data', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'version PK'),
  ('core_identity', 'org_node_versions', 'node_id', 'master_data', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'FK identity'),
  ('core_identity', 'org_node_versions', 'name', 'master_data', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'knude-navn'),
  ('core_identity', 'org_node_versions', 'parent_id', 'master_data', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'parent-FK til identity'),
  ('core_identity', 'org_node_versions', 'node_type', 'master_data', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'department eller team'),
  ('core_identity', 'org_node_versions', 'is_active', 'master_data', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'aktiv-flag'),
  ('core_identity', 'org_node_versions', 'effective_from', 'master_data', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'version-start-dato'),
  ('core_identity', 'org_node_versions', 'effective_to', 'master_data', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'version-slut-dato'),
  ('core_identity', 'org_node_versions', 'applied_at', 'master_data', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'apply-timestamp'),
  ('core_identity', 'org_node_versions', 'created_by_pending_change_id', 'master_data', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'FK pending_changes'),
  ('core_identity', 'org_node_versions', 'created_at', 'master_data', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'created-timestamp'),

  -- core_identity.org_node_closure (operationel; derived)
  ('core_identity', 'org_node_closure', 'ancestor_id', 'operationel', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'ancestor-FK'),
  ('core_identity', 'org_node_closure', 'descendant_id', 'operationel', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'descendant-FK'),
  ('core_identity', 'org_node_closure', 'depth', 'operationel', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'tree-depth'),

  -- core_identity.employee_node_placements (operationel)
  ('core_identity', 'employee_node_placements', 'id', 'operationel', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'placement-PK'),
  ('core_identity', 'employee_node_placements', 'employee_id', 'operationel', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'FK employees'),
  ('core_identity', 'employee_node_placements', 'node_id', 'operationel', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'FK org_nodes'),
  ('core_identity', 'employee_node_placements', 'effective_from', 'operationel', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'placement-start'),
  ('core_identity', 'employee_node_placements', 'effective_to', 'operationel', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'placement-slut'),
  ('core_identity', 'employee_node_placements', 'applied_at', 'operationel', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'apply-timestamp'),
  ('core_identity', 'employee_node_placements', 'created_by_pending_change_id', 'operationel', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'FK pending'),
  ('core_identity', 'employee_node_placements', 'created_at', 'operationel', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'created'),
  ('core_identity', 'employee_node_placements', 'updated_at', 'operationel', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'updated'),

  -- core_identity.client_node_placements (operationel)
  ('core_identity', 'client_node_placements', 'id', 'operationel', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'placement-PK'),
  ('core_identity', 'client_node_placements', 'client_id', 'operationel', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'klient-id (FK i trin 10)'),
  ('core_identity', 'client_node_placements', 'node_id', 'operationel', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'FK org_nodes (team)'),
  ('core_identity', 'client_node_placements', 'effective_from', 'operationel', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'placement-start'),
  ('core_identity', 'client_node_placements', 'effective_to', 'operationel', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'placement-slut'),
  ('core_identity', 'client_node_placements', 'applied_at', 'operationel', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'apply'),
  ('core_identity', 'client_node_placements', 'created_by_pending_change_id', 'operationel', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'FK pending'),
  ('core_identity', 'client_node_placements', 'created_at', 'operationel', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'created'),
  ('core_identity', 'client_node_placements', 'updated_at', 'operationel', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'updated'),

  -- core_identity.permission_areas (konfiguration)
  ('core_identity', 'permission_areas', 'id', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'area-PK'),
  ('core_identity', 'permission_areas', 'name', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'area-navn'),
  ('core_identity', 'permission_areas', 'is_active', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'aktiv-flag'),
  ('core_identity', 'permission_areas', 'sort_order', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'rækkefølge'),
  ('core_identity', 'permission_areas', 'created_at', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'created'),
  ('core_identity', 'permission_areas', 'updated_at', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'updated'),

  -- core_identity.permission_pages (konfiguration)
  ('core_identity', 'permission_pages', 'id', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'page-PK'),
  ('core_identity', 'permission_pages', 'area_id', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'FK area'),
  ('core_identity', 'permission_pages', 'name', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'page-navn'),
  ('core_identity', 'permission_pages', 'is_active', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'aktiv'),
  ('core_identity', 'permission_pages', 'sort_order', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'rækkefølge'),
  ('core_identity', 'permission_pages', 'created_at', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'created'),
  ('core_identity', 'permission_pages', 'updated_at', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'updated'),

  -- core_identity.permission_tabs (konfiguration)
  ('core_identity', 'permission_tabs', 'id', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'tab-PK'),
  ('core_identity', 'permission_tabs', 'page_id', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'FK page'),
  ('core_identity', 'permission_tabs', 'name', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'tab-navn'),
  ('core_identity', 'permission_tabs', 'is_active', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'aktiv'),
  ('core_identity', 'permission_tabs', 'sort_order', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'rækkefølge'),
  ('core_identity', 'permission_tabs', 'created_at', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'created'),
  ('core_identity', 'permission_tabs', 'updated_at', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'updated'),

  -- core_identity.role_permission_grants (konfiguration)
  ('core_identity', 'role_permission_grants', 'id', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'grant-PK'),
  ('core_identity', 'role_permission_grants', 'role_id', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'FK roles'),
  ('core_identity', 'role_permission_grants', 'area_id', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'FK area (én af 3)'),
  ('core_identity', 'role_permission_grants', 'page_id', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'FK page (én af 3)'),
  ('core_identity', 'role_permission_grants', 'tab_id', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'FK tab (én af 3)'),
  ('core_identity', 'role_permission_grants', 'can_access', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'kan_se/tilgå'),
  ('core_identity', 'role_permission_grants', 'can_write', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'kan_skrive'),
  ('core_identity', 'role_permission_grants', 'visibility', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'self/subtree/all'),
  ('core_identity', 'role_permission_grants', 'created_at', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'created'),
  ('core_identity', 'role_permission_grants', 'updated_at', 'konfiguration', 'none', 'time_based', '{"days":2555}'::jsonb, null, 'updated')

on conflict (table_schema, table_name, column_name) do nothing;

-- Note: G-numre + fitness-checks tilføjes i docs/teknisk/teknisk-gaeld.md
-- som follow-up commit per Plan V6 oprydnings-strategi.
