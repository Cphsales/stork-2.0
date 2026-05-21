-- M1 smoke: hver has_permission-RPC har matching grant for superadmin i grant-modellen.
-- Auto-asserter konsistens mellem RPC-koden og permission-seeds.
--
-- T10.13b refactor 2026-05-21: tjekker grant-modellen (role_permission_grants)
-- i stedet for legacy role_page_permissions. has_permission falder tilbage til
-- legacy hvis grant-model ikke matcher, men M1's hovedformål er at verificere
-- at den nye grant-model er fuld dækket — ikke at legacy holder.
--
-- Pattern-recognition: function-body indeholder
--   has_permission('<page>', '<tab>', ...)
-- For hver (page, tab)-par: verificér at superadmin har enten tab-grant,
-- page-grant eller area-grant med can_access=true.

do $test$
declare
  v_rpc record;
  v_page text;
  v_tab text;
  v_superadmin_role_id uuid;
  v_grant_exists boolean;
  v_missing text := '';
begin
  select id into v_superadmin_role_id from core_identity.roles where name = 'superadmin';
  if v_superadmin_role_id is null then
    raise exception 'M1 SETUP FAILED: superadmin-rolle findes ikke';
  end if;

  for v_rpc in
    select n.nspname || '.' || p.proname as fn,
           (regexp_matches(pg_get_functiondef(p.oid),
            'has_permission\(\s*''([^'']+)''\s*,\s*''([^'']+)''', 'g'))[1] as page_key,
           (regexp_matches(pg_get_functiondef(p.oid),
            'has_permission\(\s*''([^'']+)''\s*,\s*''([^'']+)''', 'g'))[2] as tab_key
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('core_identity','core_compliance','core_money')
      and p.prokind = 'f'
      and pg_get_functiondef(p.oid) ~ 'has_permission\('
  loop
    v_page := v_rpc.page_key;
    v_tab := v_rpc.tab_key;

    -- Grant-model tjek: enten tab-grant, page-grant eller area-grant skal dække
    -- (page, tab)-kombinationen med can_access=true.
    select exists (
      -- Tab-grant: matcher page+tab eksakt
      select 1
      from core_identity.role_permission_grants g
      join core_identity.permission_tabs t on t.id = g.tab_id
      join core_identity.permission_pages p on p.id = t.page_id
      where g.role_id = v_superadmin_role_id
        and g.can_access = true
        and p.name = v_page
        and t.name = v_tab
      union all
      -- Page-grant: matcher page (dækker alle tabs under page)
      select 1
      from core_identity.role_permission_grants g
      join core_identity.permission_pages p on p.id = g.page_id
      where g.role_id = v_superadmin_role_id
        and g.can_access = true
        and p.name = v_page
      union all
      -- Area-grant: matcher area der har page (dækker alle pages+tabs under area)
      select 1
      from core_identity.role_permission_grants g
      join core_identity.permission_areas a on a.id = g.area_id
      join core_identity.permission_pages p on p.area_id = a.id
      where g.role_id = v_superadmin_role_id
        and g.can_access = true
        and p.name = v_page
    ) into v_grant_exists;

    if not v_grant_exists then
      v_missing := v_missing || E'\n  - ' || v_rpc.fn || ' refererer ' || v_page || '/' || v_tab || ' men superadmin mangler grant';
    end if;
  end loop;

  if length(v_missing) > 0 then
    raise exception 'M1 FAILED: superadmin mangler grant-model rows:%', v_missing;
  end if;
end;
$test$;
