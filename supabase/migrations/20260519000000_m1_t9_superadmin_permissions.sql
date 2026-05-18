-- M1-fix: seed manglende superadmin permission-rows for T9-RPC'er.
--
-- BAGGRUND:
-- T9-pakken (PR #34-40) introducerede nye write-RPCs der kalder
-- `has_permission('<page>', '<tab>', true)` på fem nye (page, tab)-
-- kombinationer. Q-SEED (20260514190000_q_seed_permissions.sql)
-- seedede kun de 20 pre-T9-permissions. M1-smoke-test
-- (`supabase/tests/smoke/m1_permission_matrix.sql`) blokerer derfor
-- CI på main.
--
-- SCOPE (eksplicit Mathias-bekræftet):
-- Kun manglende permission-rows for superadmin-rollen. Ingen
-- ændringer i has_permission-logik, andre roller, eller Q-SEED.
--
-- MAPPING change_type → (page, tab) matcher
-- T9-fundament-supplement (PR #39) pending_change_approve/undo
-- dispatcher-mappingen:
--   page=org_nodes           — org_node_upsert/deactivate, team_close
--   page=employee_placements — employee_place, employee_remove_from_node
--   page=client_placements   — client_node_place, client_node_close
--   page=permissions         — permission_*_upsert/deactivate, role_permission_grant_*
--   page=pending_changes     — undo_setting_update
--
-- Alle 5 er write-RPCs der kalder has_permission(..., true) → can_edit=true.
-- scope='all' matcher superadmin's eksisterende pattern (alle eksisterende
-- 30 rows har scope='all').

select set_config('stork.source_type', 'migration', false);
select set_config('stork.allow_role_page_permissions_write', 'true', false);
select set_config('stork.change_reason',
  'M1-fix: seed superadmin permission-rows for T9 write-RPCs', false);

insert into core_identity.role_page_permissions
  (role_id, page_key, tab_key, can_view, can_edit, scope)
select (select id from core_identity.roles where name = 'superadmin'),
       page_key, tab_key, can_view, can_edit, 'all'
from (values
  -- T9 struktur-RPCs (org_node_upsert/deactivate, team_close)
  ('org_nodes',           'manage',   true, true),
  -- T9 employee-placement-RPCs (employee_place, employee_remove_from_node)
  ('employee_placements', 'manage',   true, true),
  -- T9 client-placement-RPCs (client_node_place, client_node_close)
  ('client_placements',   'manage',   true, true),
  -- T9 permission-element-CRUDs + grant-RPCs
  ('permissions',         'manage',   true, true),
  -- T9 undo-settings-konfig (undo_setting_update)
  ('pending_changes',     'settings', true, true)
) as perms(page_key, tab_key, can_view, can_edit)
on conflict (role_id, page_key, coalesce(tab_key, '')) do nothing;
