-- Trin 6 / §4 trin 6: Anonymisering — daglig cron + retention-skelet.
--
-- Master-plan §1.4 (hybrid eksekvering: UI-handling + retention-cron).
-- Master-plan §1.5 (drift-skabelon: heartbeat pr. cron-job).
--
-- Cron-jobs:
--   verify_anonymization_daily  — kører verify, alert ved inkonsistens
--   retention_cleanup_daily     — skelet (per-entity-cleanup tilføjes
--                                 når entities har retention-deadlines)
--
-- cron-change-reason: t6 — anonymisering daglig drift.

select cron.schedule(
  'verify_anonymization_daily',
  '15 2 * * *',
  $cron$
  do $do$
  declare
    v_started timestamptz := clock_timestamp();
    v_result jsonb;
    v_is_consistent boolean;
    v_error text;
  begin
    perform set_config('stork.source_type', 'cron', true);
    perform set_config('stork.change_reason', 'cron: verify-anonymization-consistency', true);

    v_result := core_compliance.verify_anonymization_consistency();
    v_is_consistent := (v_result->>'is_consistent')::boolean;

    perform core_compliance.cron_heartbeat_record(
      'verify_anonymization_daily',
      '15 2 * * *',
      case when v_is_consistent then 'ok' else 'failure' end,
      case when v_is_consistent then null
           else 'anonymization inconsistency: ' || (v_result->>'inconsistent_count') || ' rows' end,
      (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer
    );
  exception when others then
    v_error := sqlerrm;
    perform core_compliance.cron_heartbeat_record(
      'verify_anonymization_daily',
      '15 2 * * *',
      'failure',
      v_error,
      (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer
    );
    raise;
  end;
  $do$;
  $cron$
);

-- ─── retention_cleanup_daily — skelet ────────────────────────────────────
-- Pr. master-plan §1.4: retention-cron evaluerer data_field_definitions
-- og kalder anonymize_<entity>(...) for rows der har overskredet retention.
--
-- Skelet i trin 6 — fuld evaluerings-logik tilføjes når retention-deadlines
-- pr. entity er konkret defineret. employees har retention_type='event_based'
-- {event=termination, days_after=1825} = 5 år efter termination.

select cron.schedule(
  'retention_cleanup_daily',
  '30 2 * * *',
  $cron$
  do $do$
  declare
    v_started timestamptz := clock_timestamp();
    v_processed integer := 0;
    v_anonymized integer := 0;
    v_error text;
    v_emp record;
    v_cutoff_date date;
  begin
    perform set_config('stork.source_type', 'cron', true);
    perform set_config('stork.change_reason', 'cron: retention-cleanup', true);

    -- Employees: event_based {termination, 1825 dage}
    -- Kandidater: terminated >= 1825 dage siden, ikke allerede anonymized.
    v_cutoff_date := (current_date - interval '1825 days')::date;
    for v_emp in
      select id, email, termination_date
        from core_identity.employees
       where anonymized_at is null
         and termination_date is not null
         and termination_date <= v_cutoff_date
    loop
      v_processed := v_processed + 1;
      perform core_identity.anonymize_employee(
        v_emp.id,
        'retention: 5 år efter termination (' || v_emp.termination_date::text || ')'
      );
      v_anonymized := v_anonymized + 1;
    end loop;

    perform core_compliance.cron_heartbeat_record(
      'retention_cleanup_daily',
      '30 2 * * *',
      'ok',
      case when v_anonymized > 0 then 'anonymized ' || v_anonymized || ' employees' else null end,
      (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer
    );
  exception when others then
    v_error := sqlerrm;
    perform core_compliance.cron_heartbeat_record(
      'retention_cleanup_daily',
      '30 2 * * *',
      'failure',
      v_error,
      (extract(epoch from (clock_timestamp() - v_started)) * 1000)::integer
    );
    raise;
  end;
  $do$;
  $cron$
);
