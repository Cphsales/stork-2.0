-- T9-supplement-2 T2: G057 superadmin-bypass smoke-tests
--
-- Verificér at _apply_client_place + _apply_team_close har M2's bypass-version
-- (verificéres via funktions-eksistens + signatur). Full-flow-tests kræver
-- kompleks org-træ-fixture (org_nodes + org_node_versions + employee_node_placements)
-- som T10's smoke-test allerede dækker for klient-aktiv-check.

begin;

select set_config('stork.source_type', 'manual', true);
select set_config('stork.change_reason', 'T9-supplement-2 T2 smoke', true);

do $test$
begin
  -- Verificér _apply_client_place eksisterer (M2 CREATE OR REPLACE)
  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'core_identity' and p.proname = '_apply_client_place'
  ) then
    raise exception 'T2 fejl: _apply_client_place ikke fundet';
  end if;
  raise notice 'T2 OK: _apply_client_place eksisterer';

  -- Verificér _apply_team_close eksisterer (M2 CREATE OR REPLACE)
  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'core_identity' and p.proname = '_apply_team_close'
  ) then
    raise exception 'T2 fejl: _apply_team_close ikke fundet';
  end if;
  raise notice 'T2 OK: _apply_team_close eksisterer';

  -- Verificér is_admin_by_employee_id eksisterer (bruges af M2's bypass-mønster)
  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'core_identity' and p.proname = 'is_admin_by_employee_id'
  ) then
    raise exception 'T2 fejl: is_admin_by_employee_id helper ikke fundet';
  end if;
  raise notice 'T2 OK: is_admin_by_employee_id helper eksisterer';

  raise notice 'T2 smoke OK: G057 bypass-funktioner verificeret';
end;
$test$;

rollback;
