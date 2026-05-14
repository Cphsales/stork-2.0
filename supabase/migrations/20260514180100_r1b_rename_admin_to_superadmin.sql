-- R1b: Omdøb 'admin'-rolle til 'superadmin' for at matche vision-princip 2.
--
-- VISION-PRINCIP 2: "Superadmin er eneste hardkodede rolle."
--
-- Konkret:
-- - UPDATE core_identity.roles SET name='superadmin' WHERE name='admin'
-- - Audit-spor via session-var
-- - Fremtidige permission-bootstrap-INSERTs bruger 'superadmin' som rolle-navn
-- - is_admin()-funktionen BEVARES med samme navn for nu (omdøbes til
--   is_superadmin() når Q-pakken har konverteret 22 RPC'er til has_permission;
--   indtil da: 23 kald skal opdateres samtidig hvilket er ineffektivt)
--
-- BAGUDKOMPATIBILITET:
-- - Eksisterende permission-rows på rollen (page_key='system', tab_key='manage')
--   bevares uændret — kun rollen omdøbes.
-- - employees.role_id er FK; ingen ændring til employees-rækker.
-- - is_admin()-funktionen kigger ikke på rolle-navn, kun på permission-data
--   (system.manage.can_edit=true.scope='all'), så omdøbning bryder den ikke.

select set_config('stork.allow_roles_write', 'true', false);
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason',
  'R1b: omdøb admin-rolle til superadmin pr. vision-princip 2', false);

update core_identity.roles
   set name = 'superadmin',
       description = 'System-superadmin. Eneste hardkodede rolle (vision-princip 2). Permission system.manage med scope=all.'
 where name = 'admin';

-- Verify
do $verify$
declare
  v_count integer;
begin
  select count(*) into v_count from core_identity.roles where name = 'superadmin';
  if v_count <> 1 then
    raise exception 'R1b: forventede 1 superadmin-rolle efter omdøbning, fik %', v_count;
  end if;
  select count(*) into v_count from core_identity.roles where name = 'admin';
  if v_count > 0 then
    raise exception 'R1b: % admin-rolle(r) tilbage efter omdøbning', v_count;
  end if;
end;
$verify$;
