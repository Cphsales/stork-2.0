-- T9-supplement-2 M1b: Konsolideret grants-fix for T9-fundament-supplement RPCs
--
-- V8 (Codex V7 systemisk recon): 11 RPCs i T9-fundament-supplement har
-- "revoke ... from public, anon" uden matchende "grant ... to authenticated".
-- I Supabase er authenticated IKKE medlem af public, så uden eksplicit grant
-- kan authenticated brugere ikke kalde RPCs via REST API.
--
-- Mathias-afgørelse 2026-05-22: fix alle berørte RPCs som del af denne pakke.
--
-- Reference: docs/coordination/t9-supplement-2-plan.md M1b + Codex V7 fund.

grant execute on function core_identity.pending_change_undo(uuid) to authenticated;
grant execute on function core_identity.undo_setting_update(text, integer) to authenticated;
grant execute on function core_identity.permission_area_upsert(uuid, text, boolean, integer) to authenticated;
grant execute on function core_identity.permission_area_deactivate(uuid) to authenticated;
grant execute on function core_identity.permission_page_upsert(uuid, uuid, text, boolean, integer) to authenticated;
grant execute on function core_identity.permission_page_deactivate(uuid) to authenticated;
grant execute on function core_identity.permission_tab_upsert(uuid, uuid, text, boolean, integer) to authenticated;
grant execute on function core_identity.permission_tab_deactivate(uuid) to authenticated;
grant execute on function core_identity.role_permission_grant_remove(uuid, text, uuid) to authenticated;
-- pending_change_approve: grantes i M5 (refactor)
-- role_permission_grant_set: grantes i M6 (refactor)
