-- Trin 10 T10.13: seed permissions i grant-modellen
--
-- Tilføjer 2 nye pages (clients, client_field_definitions) under eksisterende
-- org_structure-area + manage-tab pr. page + superadmin grants.
--
-- V6 fix (Code-validering #5): legacy role_page_permissions seedes IKKE.
-- Grant-modellen (permission_pages + permission_tabs + role_permission_grants)
-- er primær fra T9; legacy er kun fallback.
--
-- V4 fix (Codex V3 KRITISK): stork.t9_write_authorized SKAL sættes — T9-supplements
-- INSERT-policies på permission_pages/tabs/role_permission_grants kræver det.
--
-- V9 robusthed (Codex V8 G-nummer ADOPT): queries scope'es til org_structure-area
-- via JOIN på area_id. Forhindrer fremtidig kollision hvis samme page-navn
-- tilføjes i andet area.

select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason',
  'T10.13: seed permissions for trin 10 RPCs i grant-modellen', false);
-- T9-supplements INSERT-policies kræver session-var.
select set_config('stork.t9_write_authorized', 'true', false);

-- 1. Pages under org_structure-area
with org_area as (
  select id from core_identity.permission_areas where name = 'org_structure'
)
insert into core_identity.permission_pages (area_id, name)
select org_area.id, page_name
from org_area, (values ('clients'), ('client_field_definitions')) as p(page_name)
on conflict (area_id, name) do nothing;

-- 2. Tabs: 'manage' for hver ny page (V9: scope til org_structure-area)
insert into core_identity.permission_tabs (page_id, name)
select p.id, 'manage'
from core_identity.permission_pages p
join core_identity.permission_areas a on a.id = p.area_id
where p.name in ('clients', 'client_field_definitions')
  and a.name = 'org_structure'
on conflict (page_id, name) do nothing;

-- 3. Superadmin grants på tab-niveau (V9: scope til org_structure-area)
insert into core_identity.role_permission_grants
  (role_id, area_id, page_id, tab_id, can_access, can_write, visibility)
select
  (select id from core_identity.roles where name = 'superadmin'),
  null, null, t.id,
  true, true, 'all'
from core_identity.permission_tabs t
join core_identity.permission_pages p on p.id = t.page_id
join core_identity.permission_areas a on a.id = p.area_id
where p.name in ('clients', 'client_field_definitions')
  and a.name = 'org_structure'
  and t.name = 'manage'
on conflict (role_id, coalesce(area_id::text, ''),
            coalesce(page_id::text, ''), coalesce(tab_id::text, ''))
do nothing;
