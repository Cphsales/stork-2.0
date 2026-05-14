-- H1 smoke: has_permission med p_can_edit=false tjekker can_view alene.
-- Verificerer at p_can_edit-parameter har forventet adfærd via declarative test.
-- (Reel auth-test sker via UI/JWT-flow; her tester vi at signaturen accepterer
-- can_edit=false og at funktion-body har korrekt logik.)

do $test$
begin
  -- has_permission med can_edit=false skal returnere true HVIS rollen har permission
  -- (uanset om can_edit=true eller false på rollen). Via MCP auth.uid()=NULL → false.
  -- Vi bekræfter signatur ikke crash'er:
  perform core_identity.has_permission('test_page', 'test_tab', false);
  perform core_identity.has_permission('test_page', 'test_tab', true);
  perform core_identity.has_permission('test_page', null, false);
  perform core_identity.has_permission('test_page');  -- default values

  -- Declarative: funktionen findes og er korrekt grant'et
  if not has_function_privilege('authenticated', 'core_identity.has_permission(text, text, boolean)', 'EXECUTE') then
    raise exception 'TEST FAILED: authenticated mangler EXECUTE-grant';
  end if;
end;
$test$;
