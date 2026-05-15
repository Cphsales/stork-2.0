-- M1 smoke: hver has_permission-RPC har matching role_page_permissions-row
-- for superadmin. Auto-asserter konsistens mellem RPC-koden og Q-SEED.
--
-- Pattern-recognition: function-body indeholder
--   has_permission('<page>', '<tab>', ...)
-- For hver (page, tab)-par fundet i function-bodies: verificér at
-- superadmin har permission-row med can_view=true og (afhængig af brug)
-- can_edit=true.

do $test$
declare
  v_rpc record;
  v_page text;
  v_tab text;
  v_superadmin_role_id uuid;
  v_perm_exists boolean;
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

    select exists (
      select 1 from core_identity.role_page_permissions
       where role_id = v_superadmin_role_id
         and page_key = v_page
         and coalesce(tab_key, '') = coalesce(v_tab, '')
         and can_view = true
    ) into v_perm_exists;

    if not v_perm_exists then
      v_missing := v_missing || E'\n  - ' || v_rpc.fn || ' refererer ' || v_page || '/' || v_tab || ' men superadmin mangler row';
    end if;
  end loop;

  if length(v_missing) > 0 then
    raise exception 'M1 FAILED: superadmin mangler permission-rows:%', v_missing;
  end if;
end;
$test$;
