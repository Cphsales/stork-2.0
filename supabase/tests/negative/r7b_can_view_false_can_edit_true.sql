-- R7b negative: row med can_view=false, can_edit=true skal returnere false
-- fra has_permission(_,_,true). Codex Fund #2.
-- Detekterer bug: pre-R7b returnerede true fordi can_edit-branch ignorerede can_view.

begin;
do $test$
declare
  v_role_id uuid;
  v_result_can_edit boolean;
  v_result_no_can_edit boolean;
begin
  -- Setup: opret test-rolle + permission med can_view=false, can_edit=true
  perform set_config('stork.allow_roles_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'R7b can_view-test setup', true);

  insert into core_identity.roles (name, description)
  values ('r7b_test_role', 'R7b test')
  returning id into v_role_id;

  perform set_config('stork.allow_role_page_permissions_write', 'true', true);
  insert into core_identity.role_page_permissions (role_id, page_key, tab_key, can_view, can_edit, scope)
  values (v_role_id, 'r7b_test_page', 'r7b_test_tab', false, true, 'all');

  -- Tildel test-rolle til mg@ midlertidigt
  perform set_config('stork.allow_employees_write', 'true', true);
  update core_identity.employees
     set role_id = v_role_id
   where email = 'mg@copenhagensales.dk';

  -- Test: has_permission med can_view=false → skal være false (uanset can_edit-værdi)
  v_result_can_edit := core_identity.has_permission('r7b_test_page', 'r7b_test_tab', true);
  v_result_no_can_edit := core_identity.has_permission('r7b_test_page', 'r7b_test_tab', false);

  if v_result_can_edit then
    raise exception 'R7b TEST FAILED: can_view=false, can_edit=true skulle blokere has_permission(_,_,true) — fik true';
  end if;
  if v_result_no_can_edit then
    raise exception 'R7b TEST FAILED: can_view=false skulle blokere has_permission(_,_,false) — fik true';
  end if;
end;
$test$;
rollback;
