-- Q-PAY: konvertér 3 pay-period-RPC'er fra is_admin() til has_permission().
--
-- KONVERTERINGER:
-- - pay_period_compute_candidate → has_permission('pay_periods', 'compute', true)
-- - pay_period_lock              → has_permission('pay_periods', 'lock', true)
-- - pay_period_settings_update   → has_permission('pay_periods', 'settings', true)

create or replace function core_money.pay_period_compute_candidate(
  p_period_id uuid, p_change_reason text
)
returns core_money.pay_period_candidate_runs
language plpgsql security definer set search_path = ''
set statement_timeout to '30min'
as $function$
begin
  if not core_identity.has_permission('pay_periods', 'compute', true) then
    raise exception 'pay_period_compute_candidate kraever permission pay_periods.compute.can_edit'
      using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);
  return core_money._pay_period_compute_candidate_internal(p_period_id, p_change_reason);
end;
$function$;

create or replace function core_money.pay_period_lock(
  p_period_id uuid, p_change_reason text
)
returns core_money.pay_periods
language plpgsql security definer set search_path = ''
set statement_timeout to '5min'
as $function$
begin
  if not core_identity.has_permission('pay_periods', 'lock', true) then
    raise exception 'pay_period_lock kraever permission pay_periods.lock.can_edit'
      using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);
  return core_money._pay_period_lock_internal(p_period_id, p_change_reason);
end;
$function$;

create or replace function core_money.pay_period_settings_update(
  p_start_day_of_month integer,
  p_recommended_lock_date_rule text,
  p_auto_lock_enabled boolean,
  p_change_reason text
)
returns core_money.pay_period_settings
language plpgsql security definer set search_path = ''
as $function$
declare
  v_row core_money.pay_period_settings;
begin
  if not core_identity.has_permission('pay_periods', 'settings', true) then
    raise exception 'pay_period_settings_update kraever permission pay_periods.settings.can_edit'
      using errcode = '42501';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;
  if p_start_day_of_month < 1 or p_start_day_of_month > 28 then
    raise exception 'start_day_of_month skal vaere 1-28' using errcode = '22023';
  end if;
  if p_recommended_lock_date_rule not in ('month_last_calendar_day', 'period_end_date', 'period_end_plus_7') then
    raise exception 'invalid recommended_lock_date_rule %', p_recommended_lock_date_rule using errcode = '22023';
  end if;

  perform set_config('stork.allow_pay_period_settings_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);

  update core_money.pay_period_settings
     set start_day_of_month = p_start_day_of_month,
         recommended_lock_date_rule = p_recommended_lock_date_rule,
         auto_lock_enabled = p_auto_lock_enabled
   where id = 1
   returning * into v_row;

  return v_row;
end;
$function$;
