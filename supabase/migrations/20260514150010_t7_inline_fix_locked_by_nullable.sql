-- Trin 7 inline-fix: pay_periods.locked_by skal kunne være NULL for cron/
-- service-role-locks. auth.uid() returnerer NULL når lock kaldes fra
-- pay_period_auto_lock-cron eller via service-role. CHECK-constraint
-- blokerede det.
--
-- Relaxer constraint så:
--   locked: locked_at NOT NULL, locked_by NULLABLE (cron-locks tilladt)
--   open: begge NULL
--
-- Semantik: locked_by NULL = system/auto-lock; locked_by NOT NULL =
-- manuel lock af user. Bevarer audit-spor via audit_log.actor_user_id
-- (NULL for cron) + audit_log.source_type='cron'.

alter table core_money.pay_periods
  drop constraint pay_periods_locked_consistency;

alter table core_money.pay_periods
  add constraint pay_periods_locked_consistency check (
    (status = 'locked' and locked_at is not null)
    or (status = 'open' and locked_at is null and locked_by is null)
  );

comment on constraint pay_periods_locked_consistency on core_money.pay_periods is
  'Trin 7 inline-fix: locked_by nullable for cron/service-role-locks (auth.uid()=NULL). UI/manuel lock-RPC sætter locked_by til faktisk user_id.';
