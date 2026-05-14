-- H1 negative: has_permission uden auth.uid() returnerer false.
-- Bevis: ingen JWT, ingen auth-mapping, ingen permission-match.

do $test$
begin
  if core_identity.has_permission('system', 'manage', true) then
    raise exception 'TEST FAILED: has_permission returnerede true uden auth.uid()';
  end if;
  if core_identity.has_permission('any_page', 'any_tab', false) then
    raise exception 'TEST FAILED: has_permission returnerede true uden auth.uid() (any-page)';
  end if;
  if core_identity.has_permission('system', null, false) then
    raise exception 'TEST FAILED: has_permission returnerede true uden auth.uid() (no tab)';
  end if;
end;
$test$;
