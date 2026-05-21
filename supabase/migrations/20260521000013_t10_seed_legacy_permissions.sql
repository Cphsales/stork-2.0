-- Trin 10 T10.13b: seed legacy role_page_permissions for M1-test compatibility
--
-- T10.13 seeder kun grant-modellen (permission_pages + permission_tabs +
-- role_permission_grants). M1-permission-matrix-test scanner alle RPCs der
-- kalder has_permission(...) og verificerer at superadmin har row i legacy
-- role_page_permissions-tabel. Uden legacy-row fejler M1-test.
--
-- Legacy-pattern bevares til M1-test passes; senere kan legacy-rows fjernes
-- når M1-test refactores til at læse grant-modellen direkte (G-nummer-kandidat).

select set_config('stork.source_type', 'migration', false);
select set_config('stork.allow_role_page_permissions_write', 'true', false);
select set_config('stork.change_reason',
  'T10.13b: seed legacy role_page_permissions for clients + client_field_definitions (M1-test compat)', false);

insert into core_identity.role_page_permissions
  (role_id, page_key, tab_key, can_view, can_edit, scope)
select (select id from core_identity.roles where name = 'superadmin'),
       page_key, tab_key, can_view, can_edit, 'all'
from (values
  ('clients',                  'manage', true, true),
  ('client_field_definitions', 'manage', true, true)
) as perms(page_key, tab_key, can_view, can_edit)
on conflict (role_id, page_key, coalesce(tab_key, '')) do nothing;
