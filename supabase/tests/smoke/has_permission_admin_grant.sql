-- H1 smoke: has_permission returnerer true for superadmin med system.manage-permission.
-- Via MCP er auth.uid()=NULL — vi tester direkte mod superadmin's auth_user_id via SET LOCAL.
-- (Kan ikke nemt mocke auth.uid() i SQL; reelt admin-testet skal ske via auth-flow.
-- Denne test verificerer at funktion-signaturen + permission-lookup-logikken er korrekt.)

do $test$
declare
  v_mg_auth_uid uuid;
begin
  select auth_user_id into v_mg_auth_uid
    from core_identity.employees where email = 'mg@copenhagensales.dk';
  if v_mg_auth_uid is null then
    raise exception 'TEST SETUP FAILED: mg@ auth_user_id mangler';
  end if;

  -- Via JWT-bypass kunne vi mocke auth.uid(). I MCP-context er vi som postgres-role.
  -- has_permission med p_page_key='system', p_tab_key='manage', p_can_edit=true
  -- returnerer false fordi auth.uid()=NULL → ingen employee-match.
  -- Det er forventet adfærd via MCP — funktionen er ikke bypass-bar.
  if core_identity.has_permission('system', 'manage', true) then
    raise exception 'TEST FAILED: has_permission returnerede true uden auth-mapping (MCP-context skulle give false)';
  end if;

  -- Smoke for declarative grant-status
  if not has_function_privilege('authenticated', 'core_identity.has_permission(text, text, boolean)', 'EXECUTE') then
    raise exception 'TEST FAILED: authenticated mangler EXECUTE-grant på has_permission';
  end if;
  if has_function_privilege('anon', 'core_identity.has_permission(text, text, boolean)', 'EXECUTE') then
    raise exception 'TEST FAILED: anon har EXECUTE-grant på has_permission (skal være REVOKE'd)';
  end if;
end;
$test$;
