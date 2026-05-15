-- R7d: is_active/status-alignment + backfill + reader-opdateringer.
--
-- BAGGRUND (Codex v1 Fund #3 + #5 + #6):
-- Lifecycle-tabeller (anonymization_mappings + break_glass_operation_types)
-- har status-kolonne fra P2/P3. Backfill efterlod is_active=true paa
-- non-active rows. 6 runtime-readers lasede kun is_active=true uden
-- status='active'-check → defense-in-depth holdt ikke.
--
-- DEL A — backfill med session-vars (G037 audit-spor):
-- Ryd is_active=true paa alle rows hvor status<>'active'. Pre-cutover state:
-- 1 anonymization_mapping (employee, status='approved') + 2 op_types
-- (pay_period_unlock + gdpr_retroactive_remove, status='approved').
-- Alle gaar fra is_active=true → is_active=false.
-- pay_period_unlock-deaktivering pr. Beslutning 6 (Option C) sker via
-- denne backfill.
--
-- DEL B — readers opdateret til status='active' AND is_active=true:
-- 2 ud af 7 readers er endnu ikke fixet i R7a/R7c:
-- - core_compliance.break_glass_request
-- - core_identity.anonymize_employee_internal
-- Resterende 5 er fixet i R7a (regprocedure-fix kombineret med status-fix)
-- + R7c (verify_anonymization_consistency).
--
-- G036 Option A: cron-body retention_cleanup_daily er fixet i R7a.
-- R7d roerer ikke cron'en.

-- ─── Del A: backfill (G037 session-vars) ──────────────────────────────────
select set_config('stork.source_type', 'migration', false);
select set_config('stork.allow_anonymization_mappings_write', 'true', false);
select set_config('stork.allow_break_glass_operation_types_write', 'true', false);
select set_config('stork.change_reason',
  'R7d: ryd is_active=true paa non-active lifecycle-rows (Codex Fund #3+#5)', false);

update core_compliance.anonymization_mappings
   set is_active = false
 where status <> 'active' and is_active = true;

update core_compliance.break_glass_operation_types
   set is_active = false
 where status <> 'active' and is_active = true;

-- ─── Del B: reader-opdateringer ───────────────────────────────────────────

-- B.1: core_compliance.break_glass_request — tilfoej status='active'-check
create or replace function core_compliance.break_glass_request(
  p_operation_type text, p_target_id uuid, p_target_payload jsonb, p_reason text
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

  -- R7d: kraev status='active' AND is_active=true (defense-in-depth)
  select * into v_operation
    from core_compliance.break_glass_operation_types
   where operation_type = p_operation_type
     and status = 'active' and is_active = true;
  if v_operation.id is null then
    raise exception 'ukendt eller ikke-aktiveret operation_type: % (kraever status=active AND is_active=true)', p_operation_type
      using errcode = 'P0002';
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

-- B.2: core_identity.anonymize_employee_internal — tilfoej status='active'-check
create or replace function core_identity.anonymize_employee_internal(
  p_employee_id uuid, p_reason text
)
returns core_identity.employees
language plpgsql security definer set search_path = ''
as $function$
declare
  v_mapping core_compliance.anonymization_mappings;
  v_row core_identity.employees;
begin
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'reason er paakraevet' using errcode = '22023';
  end if;
  -- R7d: kraev status='active' AND is_active=true
  select * into v_mapping from core_compliance.anonymization_mappings
   where entity_type = 'employee' and status = 'active' and is_active = true;
  if v_mapping.id is null then
    raise exception 'ingen aktiveret anonymiserings-mapping for employee (kraever status=active AND is_active=true)' using errcode = 'P0002';
  end if;
  perform set_config('stork.source_type', 'cron', true);
  perform set_config('stork.change_reason', 'anonymization_internal: ' || p_reason, true);
  v_row := core_identity._anonymize_employee_apply(p_employee_id, v_mapping.field_strategies, p_reason);
  perform core_identity._anonymize_employee_log_state(
    p_employee_id, p_reason, v_mapping.field_strategies, v_mapping.strategy_version
  );
  return v_row;
end;
$function$;
