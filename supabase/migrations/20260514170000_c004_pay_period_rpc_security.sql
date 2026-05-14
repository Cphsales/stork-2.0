-- C004: Fjern current_user-fallback fra pay_period RPC'er.
--
-- BAGGRUND (Codex-fund C004):
-- pay_period_lock + pay_period_compute_candidate + pay_period_lock_attempt
-- var SECURITY DEFINER med permission-check:
--   if not is_admin() and current_user not in ('service_role', ...) then raise
-- Inde i SECURITY DEFINER er current_user = definer-rollen (typisk postgres).
-- Authenticated user kalder → current_user inde = postgres → check passerer.
-- Det er et sikkerheds-hul: enhver authenticated user kunne låse perioder.
--
-- MASTER-PLAN-PARAGRAF:
-- §1.7 (permission-baseret, ikke titel-baseret) + §1.1 (FORCE RLS, default deny).
--
-- VALGT LØSNING — split-pattern:
--   _pay_period_*_internal(...)      — intern helper, ingen permission, faktisk arbejde
--   pay_period_*(...)                — admin-only via strict is_admin(); kalder _internal
--   pay_period_*_via_cron(...)       — service_role only via REVOKE/GRANT; kalder _internal
--   pay_period_lock_attempt(...)     — service_role only via REVOKE/GRANT (ingen current_user-check)
--
-- VISION-TJEK:
-- - §1.7 opfyldt? JA — permission via is_admin (rolle-baseret), ikke current_user.
-- - §1.1 opfyldt? JA — default deny via REVOKE; cron-path er eksplicit GRANT TO service_role.
-- - Symptom vs. krav: Permission-checks reformuleres så de faktisk håndhæver permission.
-- - Konklusion: FORSVARLIGT.

-- ─────────────────────────────────────────────────────────────────────────
-- Step 1: Interne helper-RPCs (gør faktisk arbejde, ingen permission-check)
-- ─────────────────────────────────────────────────────────────────────────

create or replace function core_money._pay_period_compute_candidate_internal(
  p_period_id uuid,
  p_change_reason text
)
returns core_money.pay_period_candidate_runs
language plpgsql
security definer
set search_path = ''
as $func$
declare
  v_period record;
  v_started timestamptz := clock_timestamp();
  v_checksum_row record;
  v_run core_money.pay_period_candidate_runs;
  v_employee record;
  v_commission_count integer := 0;
  v_correction_count integer := 0;
begin
  -- BEMÆRK: ingen permission-check. Caller (pay_period_compute_candidate eller
  -- pay_period_compute_candidate_via_cron) håndhæver permission via is_admin
  -- eller REVOKE/GRANT-disciplin.

  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;

  select pp.id, pp.status, pp.start_date, pp.end_date
    into v_period
    from core_money.pay_periods pp where pp.id = p_period_id;
  if v_period.id is null then
    raise exception 'pay_period ikke fundet: %', p_period_id using errcode = 'P0002';
  end if;
  if v_period.status <> 'open' then
    raise exception 'pay_period % er ikke open (status=%)', p_period_id, v_period.status
      using errcode = 'P0001';
  end if;

  select * into v_checksum_row from core_money._compute_period_data_checksum(p_period_id);

  perform set_config('stork.allow_pay_period_candidate_runs_write', 'true', true);
  update core_money.pay_period_candidate_runs
     set is_current = false
   where period_id = p_period_id
     and is_current = true;

  insert into core_money.pay_period_candidate_runs (
    period_id, generated_by, data_checksum, data_checksum_inputs,
    is_current, commission_row_count, correction_row_count
  ) values (
    p_period_id, auth.uid(), v_checksum_row.checksum, v_checksum_row.inputs,
    true, 0, 0
  )
  returning * into v_run;

  perform set_config('stork.allow_commission_snapshots_candidate_write', 'true', true);
  for v_employee in
    select e.id
      from core_identity.employees e
     where e.anonymized_at is null
       and (e.termination_date is null or e.termination_date >= v_period.start_date)
  loop
    insert into core_money.commission_snapshots_candidate (
      candidate_run_id, period_id, employee_id, sale_id,
      amount, status_at_lock
    ) values (
      v_run.id, p_period_id, v_employee.id, gen_random_uuid(),
      0.00, 'skeleton_placeholder'
    );
    v_commission_count := v_commission_count + 1;
  end loop;

  perform set_config('stork.allow_salary_corrections_candidate_write', 'true', true);
  insert into core_money.salary_corrections_candidate (
    candidate_run_id, target_period_id, source_sale_id, source_period_id,
    amount, reason, description, source_cancellation_id, created_by, created_at
  )
  select v_run.id, target_period_id, source_sale_id, source_period_id,
         amount, reason, description, source_cancellation_id, created_by, created_at
    from core_money.salary_corrections
   where target_period_id = p_period_id;

  get diagnostics v_correction_count = row_count;

  update core_money.pay_period_candidate_runs
     set commission_row_count = v_commission_count,
         correction_row_count = v_correction_count,
         computation_duration_ms = (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer
   where id = v_run.id
   returning * into v_run;

  return v_run;
end;
$func$;

comment on function core_money._pay_period_compute_candidate_internal(uuid, text) is
  'Intern helper. Ingen permission-check. Kaldes af pay_period_compute_candidate (admin) eller pay_period_compute_candidate_via_cron (service-role).';

alter function core_money._pay_period_compute_candidate_internal(uuid, text) set statement_timeout = '30min';

revoke all on function core_money._pay_period_compute_candidate_internal(uuid, text) from public, anon, authenticated;
grant execute on function core_money._pay_period_compute_candidate_internal(uuid, text) to service_role;

-- ─────────────────────────────────────────────────────────────────────────

create or replace function core_money._pay_period_lock_internal(
  p_period_id uuid,
  p_change_reason text
)
returns core_money.pay_periods
language plpgsql
security definer
set search_path = ''
as $func$
declare
  v_period record;
  v_run core_money.pay_period_candidate_runs;
  v_live_checksum_row record;
  v_result core_money.pay_periods;
begin
  -- BEMÆRK: ingen permission-check. Caller håndhæver.

  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;

  select * into v_period from core_money.pay_periods where id = p_period_id for update;
  if v_period.id is null then
    raise exception 'pay_period ikke fundet: %', p_period_id using errcode = 'P0002';
  end if;
  if v_period.status <> 'open' then
    raise exception 'pay_period % er ikke open (status=%)', p_period_id, v_period.status
      using errcode = 'P0001';
  end if;

  select * into v_run from core_money.pay_period_candidate_runs
   where period_id = p_period_id and is_current = true;

  select * into v_live_checksum_row from core_money._compute_period_data_checksum(p_period_id);

  if v_run.id is null then
    v_run := core_money._pay_period_compute_candidate_internal(
      p_period_id,
      'inline_compute_at_lock: ' || p_change_reason
    );
  elsif v_run.data_checksum <> v_live_checksum_row.checksum then
    v_run := core_money._pay_period_compute_candidate_internal(
      p_period_id,
      'stale_recompute_at_lock: ' || p_change_reason
    );
  end if;

  perform set_config('stork.allow_commission_snapshots_write', 'true', true);
  insert into core_money.commission_snapshots (
    period_id, employee_id, sale_id, amount, status_at_lock, created_at
  )
  select period_id, employee_id, sale_id, amount, status_at_lock, created_at
    from core_money.commission_snapshots_candidate
   where candidate_run_id = v_run.id;

  perform set_config('stork.allow_pay_periods_write', 'true', true);
  update core_money.pay_periods
     set status = 'locked',
         consecutive_lock_failures = 0,
         last_lock_attempt_at = now(),
         last_lock_error = null
   where id = p_period_id
   returning * into v_result;

  return v_result;
end;
$func$;

comment on function core_money._pay_period_lock_internal(uuid, text) is
  'Intern helper. Ingen permission-check. Atomar promovering candidate → final + status=locked. Statement_timeout 5 min. Kaldes af pay_period_lock (admin), pay_period_lock_via_cron (service-role), eller pay_period_lock_attempt (cron-wrapper).';

alter function core_money._pay_period_lock_internal(uuid, text) set statement_timeout = '5min';

revoke all on function core_money._pay_period_lock_internal(uuid, text) from public, anon, authenticated;
grant execute on function core_money._pay_period_lock_internal(uuid, text) to service_role;

-- ─────────────────────────────────────────────────────────────────────────
-- Step 2: Public admin-RPCs (STRICT is_admin, ingen current_user-fallback)
-- ─────────────────────────────────────────────────────────────────────────

create or replace function core_money.pay_period_compute_candidate(
  p_period_id uuid,
  p_change_reason text
)
returns core_money.pay_period_candidate_runs
language plpgsql
security definer
set search_path = ''
as $func$
begin
  if not core_identity.is_admin() then
    raise exception 'pay_period_compute_candidate kraever admin-permission' using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;

  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);

  return core_money._pay_period_compute_candidate_internal(p_period_id, p_change_reason);
end;
$func$;

comment on function core_money.pay_period_compute_candidate(uuid, text) is
  'Public admin-RPC. Strict is_admin()-check; ingen current_user-fallback (C004-fix). Kalder _pay_period_compute_candidate_internal.';

alter function core_money.pay_period_compute_candidate(uuid, text) set statement_timeout = '30min';

revoke all on function core_money.pay_period_compute_candidate(uuid, text) from public, anon, service_role;
grant execute on function core_money.pay_period_compute_candidate(uuid, text) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────

create or replace function core_money.pay_period_lock(
  p_period_id uuid,
  p_change_reason text
)
returns core_money.pay_periods
language plpgsql
security definer
set search_path = ''
as $func$
begin
  if not core_identity.is_admin() then
    raise exception 'pay_period_lock kraever admin-permission' using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;

  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);

  return core_money._pay_period_lock_internal(p_period_id, p_change_reason);
end;
$func$;

comment on function core_money.pay_period_lock(uuid, text) is
  'Public admin-RPC. Strict is_admin()-check; ingen current_user-fallback (C004-fix). Kalder _pay_period_lock_internal.';

alter function core_money.pay_period_lock(uuid, text) set statement_timeout = '5min';

revoke all on function core_money.pay_period_lock(uuid, text) from public, anon, service_role;
grant execute on function core_money.pay_period_lock(uuid, text) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- Step 3: Cron-RPCs (service_role-ONLY via REVOKE+GRANT)
-- ─────────────────────────────────────────────────────────────────────────

create or replace function core_money.pay_period_compute_candidate_via_cron(
  p_period_id uuid
)
returns core_money.pay_period_candidate_runs
language plpgsql
security definer
set search_path = ''
as $func$
begin
  -- Permission håndhæves via REVOKE/GRANT (kun service_role har EXECUTE).
  -- Ingen current_user-check (C004-fix: current_user kan ikke betroet inde i
  -- SECURITY DEFINER fordi den altid er definer-rollen).
  perform set_config('stork.source_type', 'cron', true);
  perform set_config('stork.change_reason', 'cron: candidate pre-compute', true);

  return core_money._pay_period_compute_candidate_internal(p_period_id, 'pre_compute_daily');
end;
$func$;

comment on function core_money.pay_period_compute_candidate_via_cron(uuid) is
  'Cron-RPC. Permission via REVOKE+GRANT (service_role only); ingen current_user-fallback (C004). Kalder _pay_period_compute_candidate_internal.';

alter function core_money.pay_period_compute_candidate_via_cron(uuid) set statement_timeout = '30min';

revoke all on function core_money.pay_period_compute_candidate_via_cron(uuid) from public, anon, authenticated;
grant execute on function core_money.pay_period_compute_candidate_via_cron(uuid) to service_role;

-- ─────────────────────────────────────────────────────────────────────────

create or replace function core_money.pay_period_lock_via_cron(
  p_period_id uuid
)
returns core_money.pay_periods
language plpgsql
security definer
set search_path = ''
as $func$
begin
  perform set_config('stork.source_type', 'cron', true);
  perform set_config('stork.change_reason', 'auto_lock_default', true);

  return core_money._pay_period_lock_internal(p_period_id, 'auto_lock_default');
end;
$func$;

comment on function core_money.pay_period_lock_via_cron(uuid) is
  'Cron-RPC. Permission via REVOKE+GRANT (service_role only); ingen current_user-fallback (C004). Kalder _pay_period_lock_internal.';

alter function core_money.pay_period_lock_via_cron(uuid) set statement_timeout = '5min';

revoke all on function core_money.pay_period_lock_via_cron(uuid) from public, anon, authenticated;
grant execute on function core_money.pay_period_lock_via_cron(uuid) to service_role;

-- ─────────────────────────────────────────────────────────────────────────
-- Step 4: pay_period_lock_attempt — fjern current_user-check
-- ─────────────────────────────────────────────────────────────────────────

create or replace function core_money.pay_period_lock_attempt(p_period_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $func$
declare
  v_result core_money.pay_periods;
  v_error text;
begin
  -- Permission via REVOKE+GRANT (service_role only). Ingen current_user-check
  -- (C004: current_user-check inde i SECURITY DEFINER er upålidelig).

  begin
    v_result := core_money.pay_period_lock_via_cron(p_period_id);
    return jsonb_build_object('ok', true, 'period_id', p_period_id, 'status', v_result.status);
  exception when others then
    v_error := sqlerrm;
  end;

  -- Fejl-håndtering i separat statement (autonomous-style logging).
  perform set_config('stork.allow_pay_periods_write', 'true', true);
  perform set_config('stork.source_type', 'cron', true);
  perform set_config('stork.change_reason', 'auto_lock_failure_log', true);

  update core_money.pay_periods
     set consecutive_lock_failures = consecutive_lock_failures + 1,
         last_lock_attempt_at = now(),
         last_lock_error = v_error
   where id = p_period_id;

  return jsonb_build_object('ok', false, 'period_id', p_period_id, 'error', v_error);
end;
$func$;

comment on function core_money.pay_period_lock_attempt(uuid) is
  'Cron-vej. Wrapper omkring pay_period_lock_via_cron med fejl-logning. Permission via REVOKE+GRANT (service_role only); ingen current_user-fallback (C004).';

revoke all on function core_money.pay_period_lock_attempt(uuid) from public, anon, authenticated;
grant execute on function core_money.pay_period_lock_attempt(uuid) to service_role;

-- ─────────────────────────────────────────────────────────────────────────
-- Step 5: Opdater pay_period_candidate_precompute_daily cron-body
-- ─────────────────────────────────────────────────────────────────────────
-- Cron-body kaldte tidligere pay_period_compute_candidate, som nu er admin-only.
-- Skal kalde _via_cron-varianten.

do $reschedule$
declare
  v_job_id bigint;
begin
  select jobid into v_job_id from cron.job where jobname = 'pay_period_candidate_precompute_daily';
  if v_job_id is not null then
    perform cron.unschedule(v_job_id);
  end if;
end;
$reschedule$;

select cron.schedule(
  'pay_period_candidate_precompute_daily',
  '30 1 * * *',
  $cron$
  do $do$
  declare
    v_started timestamptz := clock_timestamp();
    v_period record;
    v_processed integer := 0;
    v_errors integer := 0;
    v_error_details text := '';
    v_error text;
  begin
    perform set_config('stork.source_type', 'cron', true);
    perform set_config('stork.change_reason', 'cron: candidate pre-compute (C004-fix)', true);

    for v_period in
      select pp.id
        from core_money.pay_periods pp
       where pp.status = 'open'
         and core_money.period_recommended_lock_date(pp.id) between current_date and current_date + interval '2 days'
    loop
      begin
        perform core_money.pay_period_compute_candidate_via_cron(v_period.id);
        v_processed := v_processed + 1;
      exception when others then
        v_errors := v_errors + 1;
        v_error_details := v_error_details || ' [' || v_period.id || ': ' || sqlerrm || ']';
      end;
    end loop;

    perform core_compliance.cron_heartbeat_record(
      'pay_period_candidate_precompute_daily', '30 1 * * *',
      case when v_errors = 0 then 'ok' when v_processed > 0 then 'partial_failure' else 'failure' end,
      case when v_errors = 0 then 'pre-computed ' || v_processed || ' candidates'
           else 'processed=' || v_processed || ' errors=' || v_errors || v_error_details end,
      (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer
    );
  exception when others then
    v_error := sqlerrm;
    perform core_compliance.cron_heartbeat_record(
      'pay_period_candidate_precompute_daily', '30 1 * * *', 'failure', v_error,
      (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer
    );
    raise;
  end;
  $do$;
  $cron$
);
