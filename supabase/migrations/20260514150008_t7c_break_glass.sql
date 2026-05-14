-- Trin 7c / §4 trin 7c: break-glass-flow (to-niveau approval).
--
-- Master-plan §1.15 + rettelse 19 C4.
--
-- Generisk break_glass_requests-tabel + operation_types-konfig (UI-redigerbar).
-- Ny operation tilføjes ved at INSERT i operation_types + skrive intern RPC.
--
-- RPC'er:
--   break_glass_request(operation_type, target_id, target_payload, reason)
--     - INSERT pending; requested_by=auth.uid(); expires_at=now()+24t
--   break_glass_approve(request_id, approval_notes)
--     - UPDATE approved; håndhæver != requested_by (DB-CHECK ekstra layer)
--   break_glass_reject(request_id, rejection_reason)
--     - UPDATE rejected
--   break_glass_execute(request_id)
--     - Dispatcher: kalder intern RPC bundet til operation_type
--     - Sætter stork.break_glass_dispatch='true' så intern RPC accepterer
--     - Kan kaldes af enten requester eller approver
--     - UPDATE executed
--
-- Cron: break_glass_expire_pending kl. 02:00 UTC dagligt.
--
-- Seed operation_types: pay_period_unlock, gdpr_retroactive_remove.

-- ─── break_glass_operation_types (UI-redigerbar konfig) ──────────────────
-- no-dedup-key: konfig-tabel; operation_type er natural key (UNIQUE).
create table core_compliance.break_glass_operation_types (
  id uuid primary key default gen_random_uuid(),
  operation_type text not null unique,
  display_name text not null,
  description text,
  internal_rpc text not null,
  required_payload_schema jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table core_compliance.break_glass_operation_types is
  'Master-plan §1.15 + rettelse 19 C4: UI-redigerbar konfig der binder operation_type → intern RPC. Ny break-glass-operation tilføjes via INSERT + ny intern RPC, ingen migration kræves.';

comment on column core_compliance.break_glass_operation_types.internal_rpc is
  'Fuldt kvalificeret funktionsnavn der eksekveres ved approve, fx core_money.pay_period_unlock_via_break_glass. RPC skal acceptere (uuid, text) for (target_id, change_reason) som minimum.';

alter table core_compliance.break_glass_operation_types enable row level security;
alter table core_compliance.break_glass_operation_types force row level security;

create policy break_glass_operation_types_select on core_compliance.break_glass_operation_types
  for select to authenticated using (true);

create policy break_glass_operation_types_insert on core_compliance.break_glass_operation_types
  for insert to authenticated
  with check (current_setting('stork.allow_break_glass_operation_types_write', true) = 'true');

create policy break_glass_operation_types_update on core_compliance.break_glass_operation_types
  for update to authenticated
  using (current_setting('stork.allow_break_glass_operation_types_write', true) = 'true')
  with check (current_setting('stork.allow_break_glass_operation_types_write', true) = 'true');

revoke all on table core_compliance.break_glass_operation_types from public, anon, service_role;
grant select on table core_compliance.break_glass_operation_types to authenticated;
grant insert, update on table core_compliance.break_glass_operation_types to authenticated;

create trigger break_glass_operation_types_set_updated_at
  before update on core_compliance.break_glass_operation_types
  for each row execute function core_compliance.set_updated_at();

create trigger break_glass_operation_types_audit
  after insert or update on core_compliance.break_glass_operation_types
  for each row execute function core_compliance.stork_audit();

-- Seed
select set_config('stork.allow_break_glass_operation_types_write', 'true', false);
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason', 'legacy_import_t0: t7c — seed break_glass operation_types', false);

insert into core_compliance.break_glass_operation_types
  (operation_type, display_name, description, internal_rpc, required_payload_schema) values
  ('pay_period_unlock', 'Genåbn låst lønperiode',
   'Sætter pay_periods.status=open. Sjælden, audited. Kun for fejl opdaget umiddelbart efter lock men før udbetaling. Master-plan §1.6.',
   'core_money.pay_period_unlock_via_break_glass',
   '{"target_id": "uuid (pay_period_id)"}'::jsonb),
  ('gdpr_retroactive_remove', 'GDPR retroaktiv fjernelse fra audit',
   'Modificerer audit-historik for at fjerne PII der retroaktivt skal slettes. Post-fase-E. Master-plan §1.13.',
   'core_compliance.gdpr_retroactive_remove_via_break_glass',
   '{"target_id": "uuid (audit_log.record_id)"}'::jsonb);

-- ─── break_glass_requests ────────────────────────────────────────────────
-- no-dedup-key: feedback-tabel; (operation_type, target_id, requested_at) er natural key.
create table core_compliance.break_glass_requests (
  id uuid primary key default gen_random_uuid(),
  operation_type text not null references core_compliance.break_glass_operation_types(operation_type) on delete restrict,
  target_id uuid not null,
  target_payload jsonb,
  requested_by uuid not null references core_identity.employees(id) on delete restrict,
  requested_at timestamptz not null default now(),
  reason text not null check (length(trim(reason)) > 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'executed', 'expired')),
  approved_by uuid references core_identity.employees(id) on delete restrict,
  approved_at timestamptz,
  approval_notes text,
  rejection_reason text,
  executed_at timestamptz,
  executed_by uuid references core_identity.employees(id) on delete restrict,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint break_glass_requests_different_actors check (requested_by <> approved_by),
  constraint break_glass_requests_approved_consistency check (
    (status = 'approved' and approved_by is not null and approved_at is not null) or
    (status <> 'approved')
  ),
  constraint break_glass_requests_executed_consistency check (
    (status = 'executed' and executed_at is not null and executed_by is not null) or
    (status <> 'executed')
  ),
  constraint break_glass_requests_rejected_consistency check (
    (status = 'rejected' and rejection_reason is not null) or
    (status <> 'rejected')
  )
);

comment on table core_compliance.break_glass_requests is
  'Master-plan §1.15 + rettelse 19 C4: generisk break-glass-tabel med two-actor approval. requested_by <> approved_by håndhæves som CHECK + i RPC. Default expires_at=24t.';

create index break_glass_requests_status_idx on core_compliance.break_glass_requests (status);
create index break_glass_requests_operation_idx on core_compliance.break_glass_requests (operation_type);
create index break_glass_requests_target_idx on core_compliance.break_glass_requests (target_id);
create index break_glass_requests_pending_expires_idx on core_compliance.break_glass_requests (expires_at)
  where status = 'pending';

alter table core_compliance.break_glass_requests enable row level security;
alter table core_compliance.break_glass_requests force row level security;

create policy break_glass_requests_select on core_compliance.break_glass_requests
  for select to authenticated
  using (core_identity.is_admin());

create policy break_glass_requests_insert on core_compliance.break_glass_requests
  for insert to authenticated
  with check (current_setting('stork.allow_break_glass_requests_write', true) = 'true');

create policy break_glass_requests_update on core_compliance.break_glass_requests
  for update to authenticated
  using (current_setting('stork.allow_break_glass_requests_write', true) = 'true')
  with check (current_setting('stork.allow_break_glass_requests_write', true) = 'true');

revoke all on table core_compliance.break_glass_requests from public, anon, service_role;
grant select, insert, update on table core_compliance.break_glass_requests to authenticated;

create trigger break_glass_requests_set_updated_at
  before update on core_compliance.break_glass_requests
  for each row execute function core_compliance.set_updated_at();

create trigger break_glass_requests_audit
  after insert or update on core_compliance.break_glass_requests
  for each row execute function core_compliance.stork_audit();

-- ─── break_glass_request RPC ─────────────────────────────────────────────
create or replace function core_compliance.break_glass_request(
  p_operation_type text,
  p_target_id uuid,
  p_target_payload jsonb,
  p_reason text
)
returns core_compliance.break_glass_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_operation core_compliance.break_glass_operation_types;
  v_employee_id uuid;
  v_row core_compliance.break_glass_requests;
begin
  if not core_identity.is_admin() then
    raise exception 'break_glass_request kraever admin-permission' using errcode = '42501';
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
$$;

revoke all on function core_compliance.break_glass_request(text, uuid, jsonb, text) from public;
grant execute on function core_compliance.break_glass_request(text, uuid, jsonb, text) to authenticated;

-- ─── break_glass_approve RPC ─────────────────────────────────────────────
create or replace function core_compliance.break_glass_approve(
  p_request_id uuid,
  p_approval_notes text
)
returns core_compliance.break_glass_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request core_compliance.break_glass_requests;
  v_approver_id uuid;
  v_row core_compliance.break_glass_requests;
begin
  if not core_identity.is_admin() then
    raise exception 'break_glass_approve kraever admin-permission' using errcode = '42501';
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
$$;

revoke all on function core_compliance.break_glass_approve(uuid, text) from public;
grant execute on function core_compliance.break_glass_approve(uuid, text) to authenticated;

-- ─── break_glass_reject RPC ──────────────────────────────────────────────
create or replace function core_compliance.break_glass_reject(
  p_request_id uuid,
  p_rejection_reason text
)
returns core_compliance.break_glass_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request core_compliance.break_glass_requests;
  v_actor_id uuid;
  v_row core_compliance.break_glass_requests;
begin
  if not core_identity.is_admin() then
    raise exception 'break_glass_reject kraever admin-permission' using errcode = '42501';
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
$$;

revoke all on function core_compliance.break_glass_reject(uuid, text) from public;
grant execute on function core_compliance.break_glass_reject(uuid, text) to authenticated;

-- ─── break_glass_execute RPC (dispatcher) ────────────────────────────────
create or replace function core_compliance.break_glass_execute(p_request_id uuid)
returns core_compliance.break_glass_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request core_compliance.break_glass_requests;
  v_operation core_compliance.break_glass_operation_types;
  v_actor_id uuid;
  v_row core_compliance.break_glass_requests;
  v_dispatch_sql text;
begin
  if not core_identity.is_admin() then
    raise exception 'break_glass_execute kraever admin-permission' using errcode = '42501';
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
  -- Master-plan §1.15: "samme RPC kan kaldes af enten requester eller approver"
  if v_actor_id <> v_request.requested_by and v_actor_id <> v_request.approved_by then
    raise exception 'kun requester eller approver kan execute (actor=%)', v_actor_id using errcode = '42501';
  end if;

  select * into v_operation
    from core_compliance.break_glass_operation_types
   where operation_type = v_request.operation_type
     and is_active = true;
  if v_operation.id is null then
    raise exception 'operation_type % ikke længere aktiv', v_request.operation_type using errcode = 'P0001';
  end if;

  -- Aktiver dispatch-vinduet
  perform set_config('stork.break_glass_dispatch', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason',
    'break_glass_execute: ' || v_request.operation_type || ' request_id=' || p_request_id,
    true);

  -- Dispatch til intern RPC. Internal RPC validerer stork.break_glass_dispatch='true'.
  -- Signatur (uuid, text) → (target_id, change_reason).
  v_dispatch_sql := format(
    'select %s($1, $2)',
    v_operation.internal_rpc
  );
  execute v_dispatch_sql using v_request.target_id, 'break_glass request_id=' || p_request_id;

  -- UPDATE request → executed
  perform set_config('stork.allow_break_glass_requests_write', 'true', true);
  update core_compliance.break_glass_requests
     set status = 'executed',
         executed_at = now(),
         executed_by = v_actor_id
   where id = p_request_id
   returning * into v_row;

  return v_row;
end;
$$;

revoke all on function core_compliance.break_glass_execute(uuid) from public;
grant execute on function core_compliance.break_glass_execute(uuid) to authenticated;

-- ─── Cron: expire pending requests efter 24t ─────────────────────────────
select cron.schedule(
  'break_glass_expire_pending',
  '0 2 * * *',
  $cron$
  do $do$
  declare
    v_started timestamptz := clock_timestamp();
    v_expired integer;
    v_error text;
  begin
    perform set_config('stork.source_type', 'cron', true);
    perform set_config('stork.change_reason', 'cron: break_glass expire pending efter 24t (master-plan §1.15)', true);
    perform set_config('stork.allow_break_glass_requests_write', 'true', true);

    with expired as (
      update core_compliance.break_glass_requests
         set status = 'expired'
       where status = 'pending'
         and expires_at < now()
       returning id
    )
    select count(*) into v_expired from expired;

    perform core_compliance.cron_heartbeat_record(
      'break_glass_expire_pending', '0 2 * * *', 'ok',
      case when v_expired > 0 then 'expired ' || v_expired || ' pending requests' else null end,
      (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer
    );
  exception when others then
    v_error := sqlerrm;
    perform core_compliance.cron_heartbeat_record(
      'break_glass_expire_pending', '0 2 * * *', 'failure', v_error,
      (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer
    );
    raise;
  end;
  $do$;
  $cron$
);

-- ─── break_glass_requests_read RPC ────────────────────────────────────────
create or replace function core_compliance.break_glass_requests_read(
  p_status text default null,
  p_operation_type text default null,
  p_limit integer default 100
)
returns setof core_compliance.break_glass_requests
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not core_identity.is_admin() then
    raise exception 'break_glass_requests_read kraever admin-permission' using errcode = '42501';
  end if;
  return query
    select * from core_compliance.break_glass_requests
    where (p_status is null or status = p_status)
      and (p_operation_type is null or operation_type = p_operation_type)
    order by requested_at desc
    limit greatest(p_limit, 0);
end;
$$;

revoke all on function core_compliance.break_glass_requests_read(text, text, integer) from public;
grant execute on function core_compliance.break_glass_requests_read(text, text, integer) to authenticated;
