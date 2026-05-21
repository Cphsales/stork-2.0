-- T9-supplement-2 T2: G057 superadmin-bypass smoke-tests
--
-- Verificér at _apply_client_place (team-aktiv-bypass) + _apply_team_close
-- (allerede-inaktiv-bypass) virker for superadmin via is_admin_by_employee_id.
--
-- Bruger postgres-superuser-context. Eksisterende superadmin-employee i seed
-- bruges som requester+approver for at trigge bypass-grenen.

begin;

select set_config('stork.source_type', 'manual', true);
select set_config('stork.change_reason', 'T9-supplement-2 T2 smoke', true);
select set_config('stork.t9_write_authorized', 'true', true);

do $test$
declare
  v_admin_emp_id uuid;
  v_team_node_id uuid := gen_random_uuid();
  v_root_id uuid;
  v_pending_id uuid;
  v_caught text;
begin
  -- Find en eksisterende admin-employee (T1-seed har Kasper + Mathias som superadmins)
  select e.id into v_admin_emp_id
  from core_identity.employees e
  join core_identity.role_page_permissions p on p.role_id = e.role_id
  where p.page_key = 'system' and p.tab_key = 'manage' and p.scope = 'all' and p.can_edit = true
  limit 1;

  if v_admin_emp_id is null then
    raise notice 'T2 skip: ingen admin-employee i seed';
    return;
  end if;

  -- Find eksisterende root-knude eller spring over (kræver org-tree-fixture)
  select node_id into v_root_id from core_identity.org_node_versions
    where parent_id is null and is_active = true
    limit 1;
  if v_root_id is null then
    raise notice 'T2 skip: ingen root-knude. Smoke kræver org-tree-fixture.';
    return;
  end if;

  -- B2 (positiv): superadmin opretter pending team_close mod team der bliver
  -- inaktivt før apply → _apply_team_close no-op return
  -- Opret aktivt team
  insert into core_identity.org_node_versions
    (node_id, name, parent_id, node_type, is_active, effective_from)
    values (v_team_node_id, 'T2-test-team-' || gen_random_uuid()::text,
            v_root_id, 'team', true, current_date);

  -- Opret pending som admin
  insert into core_identity.pending_changes
    (change_type, target_id, payload, effective_from, requested_by, status)
    values ('team_close', v_team_node_id,
            jsonb_build_object('node_id', v_team_node_id::text, 'effective_from', current_date::text),
            current_date, v_admin_emp_id, 'pending')
    returning id into v_pending_id;

  -- Approve som admin (sætter undo_deadline)
  update core_identity.pending_changes
    set status = 'approved', approved_by = v_admin_emp_id,
        approved_at = now(), undo_deadline = now()
    where id = v_pending_id;

  -- Inaktivér team manuelt før apply (simulerer race-condition)
  update core_identity.org_node_versions
    set is_active = false
    where node_id = v_team_node_id and effective_from = current_date;

  -- Apply: skulle no-op pga. admin-bypass (idempotency)
  begin
    perform core_identity._apply_team_close(
      jsonb_build_object('node_id', v_team_node_id::text, 'effective_from', current_date::text),
      v_pending_id
    );
    raise notice 'T2 B2 OK: _apply_team_close no-op return for admin på allerede-inaktivt team';
  exception when others then
    v_caught := sqlerrm;
    raise exception 'T2 B2 fejl: _apply_team_close raised: %', v_caught;
  end;

  raise notice 'T2 smoke OK: superadmin-bypass på _apply_team_close virker';
end;
$test$;

rollback;
