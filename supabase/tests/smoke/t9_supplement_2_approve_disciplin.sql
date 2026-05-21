-- T9-supplement-2 T3: Approve-disciplin smoke-tests
--
-- Verificér schema + helpers fra M3, M4, M3b, M5.

begin;

select set_config('stork.source_type', 'manual', true);
select set_config('stork.change_reason', 'T9-supplement-2 T3 smoke', true);
select set_config('stork.t9_write_authorized', 'true', true);

do $test$
begin
  -- pending_changes.action_id kolonne (M4)
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'core_identity'
      and table_name = 'pending_changes'
      and column_name = 'action_id'
  ) then
    raise exception 'T3 fejl: pending_changes.action_id kolonne ikke fundet (M4 ikke anvendt)';
  end if;

  -- acl_higher_level_employees (M4)
  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'core_identity' and p.proname = 'acl_higher_level_employees'
  ) then
    raise exception 'T3 fejl: acl_higher_level_employees ikke fundet';
  end if;

  -- has_permission_action (M4)
  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'core_identity' and p.proname = 'has_permission_action'
  ) then
    raise exception 'T3 fejl: has_permission_action ikke fundet';
  end if;

  -- pending_changes_select policy (M3b)
  if not exists (select 1 from pg_policy where polname = 'pending_changes_select') then
    raise exception 'T3 fejl: pending_changes_select policy ikke fundet';
  end if;

  raise notice 'T3 OK: approve-disciplin schema verificeret';
end;
$test$;

rollback;
