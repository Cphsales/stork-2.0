-- Q-BREAK: konvertér 5 break-glass-RPC'er fra is_admin() til has_permission().
--
-- KONVERTERINGER:
-- - break_glass_request       → has_permission('break_glass', 'request', true)
-- - break_glass_approve       → has_permission('break_glass', 'approve', true)
-- - break_glass_reject        → has_permission('break_glass', 'approve', true)
-- - break_glass_execute       → has_permission('break_glass', 'execute', true)
-- - break_glass_requests_read → has_permission('break_glass', 'view', false)

create or replace function core_compliance.break_glass_request(
  p_operation_type text,
  p_target_id uuid,
  p_target_payload jsonb,
  p_reason text
)
returns core_compliance.break_glass_requests
language plpgsql security definer set search_path = ''
as $function$
declare
  v_operation core_compliance.break_glass_operation_types;
  v_employee_id uuid;
  v_row core_compliance.break_glass_requests;
begin
  if not core_identity.has_permission('break_glass', 'request', true) then
    raise exception 'break_glass_request kraever permission break_glass.request.can_edit'
      using errcode = '42501';
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'reason er paakraevet' using errcode = '22023';
  end if;
  if p_target_id is null then
    raise exception 'target_id er paakraevet' using errcode = '22023';
  end if;

  select * into v_operation
    from core_compliance.break_glass_operation_types
   where operation_type = p_operation_type
     and is_active = true;
  if v_operation.id is null then
    raise exception 'ukendt eller inaktiv operation_type: %', p_operation_type using errcode = 'P0002';
  end if;

  v_employee_id := core_identity.current_employee_id();
  if v_employee_id is null then
    raise exception 'kan ikke identificere requester (current_employee_id=NULL)' using errcode = '42501';
  end if;

  perform set_config('stork.allow_break_glass_requests_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'break_glass_request: ' || p_operation_type || ' — ' || p_reason, true);

  insert into core_compliance.break_glass_requests (
    operation_type, target_id, target_payload, requested_by,
    reason, status, expires_at
  ) values (
    p_operation_type, p_target_id, p_target_payload, v_employee_id,
    p_reason, 'pending', now() + interval '24 hours'
  )
  returning * into v_row;

  return v_row;
end;
$function$;

create or replace function core_compliance.break_glass_approve(
  p_request_id uuid, p_approval_notes text
)
returns core_compliance.break_glass_requests
language plpgsql security definer set search_path = ''
as $function$
declare
  v_request core_compliance.break_glass_requests;
  v_approver_id uuid;
  v_row core_compliance.break_glass_requests;
begin
  if not core_identity.has_permission('break_glass', 'approve', true) then
    raise exception 'break_glass_approve kraever permission break_glass.approve.can_edit'
      using errcode = '42501';
  end if;

  v_approver_id := core_identity.current_employee_id();
  if v_approver_id is null then
    raise exception 'kan ikke identificere approver' using errcode = '42501';
  end if;

  select * into v_request from core_compliance.break_glass_requests where id = p_request_id for update;
  if v_request.id is null then
    raise exception 'break_glass_request ikke fundet: %', p_request_id using errcode = 'P0002';
  end if;
  if v_request.status <> 'pending' then
    raise exception 'break_glass_request er ikke pending (status=%)', v_request.status using errcode = 'P0001';
  end if;
  if v_request.expires_at < now() then
    raise exception 'break_glass_request er udløbet (expires_at=%)', v_request.expires_at using errcode = 'P0001';
  end if;
  if v_request.requested_by = v_approver_id then
    raise exception 'requester (%) kan ikke selv godkende eget request', v_approver_id using errcode = '42501';
  end if;

  perform set_config('stork.allow_break_glass_requests_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'break_glass_approve: ' || v_request.operation_type || ' — ' || coalesce(p_approval_notes, '(no notes)'), true);

  update core_compliance.break_glass_requests
     set status = 'approved',
         approved_by = v_approver_id,
         approved_at = now(),
         approval_notes = p_approval_notes
   where id = p_request_id
   returning * into v_row;

  return v_row;
end;
$function$;

create or replace function core_compliance.break_glass_reject(
  p_request_id uuid, p_rejection_reason text
)
returns core_compliance.break_glass_requests
language plpgsql security definer set search_path = ''
as $function$
declare
  v_request core_compliance.break_glass_requests;
  v_actor_id uuid;
  v_row core_compliance.break_glass_requests;
begin
  if not core_identity.has_permission('break_glass', 'approve', true) then
    raise exception 'break_glass_reject kraever permission break_glass.approve.can_edit'
      using errcode = '42501';
  end if;
  if p_rejection_reason is null or length(trim(p_rejection_reason)) = 0 then
    raise exception 'rejection_reason er paakraevet' using errcode = '22023';
  end if;

  v_actor_id := core_identity.current_employee_id();
  select * into v_request from core_compliance.break_glass_requests where id = p_request_id for update;
  if v_request.id is null then
    raise exception 'break_glass_request ikke fundet: %', p_request_id using errcode = 'P0002';
  end if;
  if v_request.status <> 'pending' then
    raise exception 'break_glass_request er ikke pending (status=%)', v_request.status using errcode = 'P0001';
  end if;
  if v_request.requested_by = v_actor_id then
    raise exception 'requester kan ikke selv reject eget request' using errcode = '42501';
  end if;

  perform set_config('stork.allow_break_glass_requests_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'break_glass_reject: ' || v_request.operation_type || ' — ' || p_rejection_reason, true);

  update core_compliance.break_glass_requests
     set status = 'rejected',
         rejection_reason = p_rejection_reason
   where id = p_request_id
   returning * into v_row;

  return v_row;
end;
$function$;

create or replace function core_compliance.break_glass_execute(p_request_id uuid)
returns core_compliance.break_glass_requests
language plpgsql security definer set search_path = ''
as $function$
declare
  v_request core_compliance.break_glass_requests;
  v_operation core_compliance.break_glass_operation_types;
  v_actor_id uuid;
  v_row core_compliance.break_glass_requests;
  v_proc regprocedure;
begin
  if not core_identity.has_permission('break_glass', 'execute', true) then
    raise exception 'break_glass_execute kraever permission break_glass.execute.can_edit'
      using errcode = '42501';
  end if;
  v_actor_id := core_identity.current_employee_id();
  if v_actor_id is null then
    raise exception 'kan ikke identificere executor' using errcode = '42501';
  end if;

  select * into v_request from core_compliance.break_glass_requests where id = p_request_id for update;
  if v_request.id is null then
    raise exception 'break_glass_request ikke fundet: %', p_request_id using errcode = 'P0002';
  end if;
  if v_request.status <> 'approved' then
    raise exception 'break_glass_request er ikke approved (status=%)', v_request.status using errcode = 'P0001';
  end if;
  if v_request.expires_at < now() then
    raise exception 'break_glass_request er udløbet (expires_at=%)', v_request.expires_at using errcode = 'P0001';
  end if;
  if v_actor_id <> v_request.requested_by and v_actor_id <> v_request.approved_by then
    raise exception 'kun requester eller approver kan execute (actor=%)', v_actor_id using errcode = '42501';
  end if;

  select * into v_operation from core_compliance.break_glass_operation_types
   where operation_type = v_request.operation_type and is_active = true;
  if v_operation.id is null then
    raise exception 'operation_type % ikke længere aktiv', v_request.operation_type using errcode = 'P0001';
  end if;

  -- C006-fix: regprocedure-validation før EXECUTE
  begin
    v_proc := (v_operation.internal_rpc || '(uuid, text)')::regprocedure;
  exception when undefined_function then
    raise exception 'break_glass operation_type % har ugyldig internal_rpc=%: funktion eksisterer ikke eller forkert signatur',
      v_request.operation_type, v_operation.internal_rpc
      using errcode = 'P0001';
  end;

  perform set_config('stork.break_glass_dispatch', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason',
    'break_glass_execute: ' || v_request.operation_type || ' request_id=' || p_request_id, true);

  execute format('select %s($1, $2)', v_proc::text)
    using v_request.target_id, 'break_glass request_id=' || p_request_id;

  perform set_config('stork.allow_break_glass_requests_write', 'true', true);
  update core_compliance.break_glass_requests
     set status = 'executed', executed_at = now(), executed_by = v_actor_id
   where id = p_request_id returning * into v_row;

  return v_row;
end;
$function$;

create or replace function core_compliance.break_glass_requests_read(
  p_status text default null,
  p_operation_type text default null,
  p_limit integer default 100
)
returns setof core_compliance.break_glass_requests
language plpgsql security definer set search_path = ''
as $function$
begin
  if not core_identity.has_permission('break_glass', 'view', false) then
    raise exception 'break_glass_requests_read kraever permission break_glass.view'
      using errcode = '42501';
  end if;
  return query
    select * from core_compliance.break_glass_requests
    where (p_status is null or status = p_status)
      and (p_operation_type is null or operation_type = p_operation_type)
    order by requested_at desc
    limit greatest(p_limit, 0);
end;
$function$;
