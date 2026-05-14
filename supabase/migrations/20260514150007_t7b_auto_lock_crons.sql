-- Trin 7b: cron-jobs for auto-lock og candidate-pre-compute.
--
-- Master-plan §1.5 + §1.6 + rettelse 16.
--
-- pay_period_auto_lock_daily — kører dagligt 02:45 UTC. For hver pay_period
-- hvor period_recommended_lock_date <= current_date OG status='open' OG
-- auto_lock_enabled=true: kald pay_period_lock_attempt.
-- Heartbeat: 'ok' hvis alle succeede, 'partial_failure' hvis nogen fejlede,
-- 'failure' hvis alle fejlede.
--
-- pay_period_candidate_precompute_daily — kører dagligt 01:30 UTC.
-- For hver pay_period hvor period_recommended_lock_date BETWEEN today og
-- today + 2 dage AND status='open': pre-compute candidate.
--
-- cron-change-reason: t7b — pay_period auto-lock + candidate pre-compute.

-- ─── pay_period_auto_lock_daily ──────────────────────────────────────────
select cron.schedule(
  'pay_period_auto_lock_daily',
  '45 2 * * *',
  $cron$
  do $do$
  declare
    v_started timestamptz := clock_timestamp();
    v_period record;
    v_lock_result jsonb;
    v_settings_enabled boolean;
    v_attempted integer := 0;
    v_succeeded integer := 0;
    v_failed integer := 0;
    v_status text;
    v_error_summary text;
    v_error text;
  begin
    perform set_config('stork.source_type', 'cron', true);
    perform set_config('stork.change_reason', 'cron: pay_period auto-lock daglig', true);

    select auto_lock_enabled into v_settings_enabled
      from core_money.pay_period_settings where id = 1;

    if not v_settings_enabled then
      perform core_compliance.cron_heartbeat_record(
        'pay_period_auto_lock_daily', '45 2 * * *', 'skipped',
        'auto_lock_enabled=false i settings',
        (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer
      );
      return;
    end if;

    for v_period in
      select pp.id
        from core_money.pay_periods pp
       where pp.status = 'open'
         and pp.auto_lock_enabled = true
         and core_money.period_recommended_lock_date(pp.id) <= current_date
    loop
      v_attempted := v_attempted + 1;
      v_lock_result := core_money.pay_period_lock_attempt(v_period.id);
      if (v_lock_result->>'ok')::boolean then
        v_succeeded := v_succeeded + 1;
      else
        v_failed := v_failed + 1;
      end if;
    end loop;

    if v_attempted = 0 then
      v_status := 'ok';
      v_error_summary := null;
    elsif v_failed = 0 then
      v_status := 'ok';
      v_error_summary := 'locked ' || v_succeeded || ' periods';
    elsif v_succeeded = 0 then
      v_status := 'failure';
      v_error_summary := 'all ' || v_failed || ' attempts failed';
    else
      v_status := 'partial_failure';
      v_error_summary := v_succeeded || ' locked, ' || v_failed || ' failed';
    end if;

    perform core_compliance.cron_heartbeat_record(
      'pay_period_auto_lock_daily', '45 2 * * *', v_status, v_error_summary,
      (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer
    );
  exception when others then
    v_error := sqlerrm;
    perform core_compliance.cron_heartbeat_record(
      'pay_period_auto_lock_daily', '45 2 * * *', 'failure', v_error,
      (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer
    );
    raise;
  end;
  $do$;
  $cron$
);

-- ─── pay_period_candidate_precompute_daily ───────────────────────────────
-- Pre-computer candidate for perioder hvor recommended_lock_date er i de
-- næste 2 dage. Master-plan §1.6: "30 min før recommended_lock_date" tolkes
-- som "vel før" — vi pre-computer 1-2 dage i forvejen.
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
    perform set_config('stork.change_reason', 'cron: candidate pre-compute (rettelse 16, master-plan §1.6)', true);

    for v_period in
      select pp.id
        from core_money.pay_periods pp
       where pp.status = 'open'
         and core_money.period_recommended_lock_date(pp.id) between current_date and current_date + interval '2 days'
    loop
      begin
        perform core_money.pay_period_compute_candidate(
          v_period.id,
          'pre_compute_daily'
        );
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

-- ─── ensure_pay_periods_daily ─────────────────────────────────────────────
-- Sikrer at fremtidige pay_periods altid eksisterer (master-plan §1.6).
-- Identisk med fase 0's pattern men i core_money.
select cron.schedule(
  'ensure_pay_periods_daily',
  '0 1 * * *',
  $cron$
  do $do$
  declare
    v_today date := (now() at time zone 'Europe/Copenhagen')::date;
    v_period_today record;
    v_period_next record;
    v_started timestamptz := clock_timestamp();
    v_error text;
  begin
    perform set_config('stork.source_type', 'cron', true);
    perform set_config('stork.change_reason', 'cron: ensure pay_periods buffer (master-plan §1.6)', true);
    perform set_config('stork.allow_pay_periods_write', 'true', true);

    select * into v_period_today from core_money.pay_period_for_date(v_today);
    if not exists (select 1 from core_money.pay_periods p where p.start_date = v_period_today.start_date) then
      insert into core_money.pay_periods (start_date, end_date)
      values (v_period_today.start_date, v_period_today.end_date);
    end if;

    select * into v_period_next from core_money.pay_period_for_date((v_today + interval '1 month')::date);
    if not exists (select 1 from core_money.pay_periods p where p.start_date = v_period_next.start_date) then
      insert into core_money.pay_periods (start_date, end_date)
      values (v_period_next.start_date, v_period_next.end_date);
    end if;

    perform core_compliance.cron_heartbeat_record(
      'ensure_pay_periods_daily', '0 1 * * *', 'ok', null,
      (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer
    );
  exception when others then
    v_error := sqlerrm;
    perform core_compliance.cron_heartbeat_record(
      'ensure_pay_periods_daily', '0 1 * * *', 'failure', v_error,
      (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer
    );
    raise;
  end;
  $do$;
  $cron$
);
