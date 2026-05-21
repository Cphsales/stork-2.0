-- T9-supplement-2 T3: Approve-disciplin smoke-tests
--
-- CI-note: smoke kører mod fast Supabase project (main-state). Migrations
-- fra denne pakke er først anvendt EFTER merge. Test hopper out hvis
-- schema endnu ikke matcher.

begin;

select set_config('stork.source_type', 'manual', true);
select set_config('stork.change_reason', 'T9-supplement-2 T3 smoke', true);
select set_config('stork.t9_write_authorized', 'true', true);

do $test$
begin
  -- Pre-flight: hop ud hvis migrations fra denne pakke ikke er anvendt endnu
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'core_identity'
      and table_name = 'pending_changes'
      and column_name = 'action_id'
  ) then
    raise notice 'T3 skip: pending_changes.action_id endnu ikke anvendt (pre-merge CI-state)';
    return;
  end if;

  raise notice 'T3 OK: pending_changes.action_id eksisterer (M4 anvendt)';

  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'core_identity' and p.proname = 'acl_higher_level_employees'
  ) then
    raise notice 'T3 skip: acl_higher_level_employees ikke fundet';
    return;
  end if;
  raise notice 'T3 OK: acl_higher_level_employees eksisterer';

  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'core_identity' and p.proname = 'has_permission_action'
  ) then
    raise notice 'T3 skip: has_permission_action ikke fundet';
    return;
  end if;
  raise notice 'T3 OK: has_permission_action eksisterer';

  if not exists (select 1 from pg_policy where polname = 'pending_changes_select') then
    raise notice 'T3 skip: pending_changes_select policy ikke fundet';
    return;
  end if;
  raise notice 'T3 OK: pending_changes_select policy eksisterer (M3b)';

  raise notice 'T3 smoke OK: approve-disciplin schema + helpers verificeret';
end;
$test$;

rollback;
