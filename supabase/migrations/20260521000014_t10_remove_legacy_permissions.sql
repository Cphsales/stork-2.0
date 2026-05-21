-- Trin 10 T10.13c: REVERSE af T10.13b — fjern legacy role_page_permissions-rows
--
-- T10.13b tilføjede legacy-rows som workaround for M1-test compatibility.
-- M1-test er nu refactored til at scanne grant-modellen (role_permission_grants)
-- direkte; legacy-rows er ikke længere nødvendige for testen.
--
-- Per Codex build-review runde 3: legacy-seed var "WORKAROUND-INTRODUCERET"
-- (plan V14 specificerede kun grant-model). Mathias-afgørelse 2026-05-21:
-- fix ordentligt → refactor M1-test + fjern legacy.
--
-- has_permission har stadig legacy-fallback i sin body, men det er kun fallback;
-- grant-modellen er primær. Legacy-rows for clients/cfd er ikke længere nødvendige.

select set_config('stork.source_type', 'migration', false);
select set_config('stork.allow_role_page_permissions_write', 'true', false);
select set_config('stork.change_reason',
  'T10.13c: fjern T10.13b legacy-rows (M1-test refactored til grant-modellen)', false);

delete from core_identity.role_page_permissions
where role_id = (select id from core_identity.roles where name = 'superadmin')
  and page_key in ('clients', 'client_field_definitions')
  and tab_key = 'manage';
