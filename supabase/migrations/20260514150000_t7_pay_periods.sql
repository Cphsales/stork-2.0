-- Trin 7 / §4 trin 7: Periode-skabelon — pay_period_settings + pay_periods.
--
-- Master-plan §1.6 (periode-skabelon) + rettelse 16 (recommended_lock_date_rule,
-- auto_lock_enabled, period_recommended_lock_date helper).
--
-- Genopbygger fase 0's c4_pay_periods_template i core_money med rettelse 16's
-- lock-konfig og forberedt-aggregat-felter. Selve lock-pipeline + RPC'er
-- ligger i t7_lock_pipeline.sql. Trigger der blokerer mutationer på låst
-- periode er her, men on_period_lock-stub fjernes — pipeline kører via RPC.

-- ─── pay_period_settings (singleton config) ───────────────────────────────
-- no-dedup-key: singleton-config-tabel; én row med id=1.
create table core_money.pay_period_settings (
  id smallint primary key check (id = 1),
  start_day_of_month integer not null default 15 check (start_day_of_month between 1 and 28),
  recommended_lock_date_rule text not null default 'month_last_calendar_day'
    check (recommended_lock_date_rule in ('month_last_calendar_day', 'period_end_date', 'period_end_plus_7')),
  auto_lock_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table core_money.pay_period_settings is
  'Master-plan §1.6 + rettelse 16: singleton config for pay_period beregning og auto-lock. start_day_of_month=15 → 15→14-periode. recommended_lock_date_rule bestemmer hvornår period anses for klar-til-lock.';

select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason', 'legacy_import_t0: t7 pay_period_settings singleton bootstrap', false);

insert into core_money.pay_period_settings (id, start_day_of_month, recommended_lock_date_rule, auto_lock_enabled)
values (1, 15, 'month_last_calendar_day', true);

alter table core_money.pay_period_settings enable row level security;
alter table core_money.pay_period_settings force row level security;

revoke all on table core_money.pay_period_settings from public, anon, service_role;
grant select on table core_money.pay_period_settings to authenticated;

create policy pay_period_settings_select on core_money.pay_period_settings
  for select to authenticated using (true);

create policy pay_period_settings_update on core_money.pay_period_settings
  for update to authenticated
  using (current_setting('stork.allow_pay_period_settings_write', true) = 'true')
  with check (current_setting('stork.allow_pay_period_settings_write', true) = 'true');

grant update on table core_money.pay_period_settings to authenticated;

create trigger pay_period_settings_set_updated_at
  before update on core_money.pay_period_settings
  for each row execute function core_compliance.set_updated_at();

create trigger pay_period_settings_audit
  after update on core_money.pay_period_settings
  for each row execute function core_compliance.stork_audit();

-- ─── pay_period_settings_update RPC ──────────────────────────────────────
create or replace function core_money.pay_period_settings_update(
  p_start_day_of_month integer,
  p_recommended_lock_date_rule text,
  p_auto_lock_enabled boolean,
  p_change_reason text
)
returns core_money.pay_period_settings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row core_money.pay_period_settings;
begin
  if not core_identity.is_admin() then
    raise exception 'pay_period_settings_update kraever admin-permission' using errcode = '42501';
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
$$;

revoke all on function core_money.pay_period_settings_update(integer, text, boolean, text) from public;
grant execute on function core_money.pay_period_settings_update(integer, text, boolean, text) to authenticated;

-- ─── pay_period_for_date(): periode-grænser for given dato ───────────────
create or replace function core_money.pay_period_for_date(p_date date)
returns table (start_date date, end_date date)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_start_day integer;
  v_year integer;
  v_month integer;
  v_anchor date;
begin
  select s.start_day_of_month into v_start_day
  from core_money.pay_period_settings s where s.id = 1;

  if extract(day from p_date)::integer >= v_start_day then
    v_year := extract(year from p_date)::integer;
    v_month := extract(month from p_date)::integer;
  else
    v_anchor := (p_date - interval '1 month')::date;
    v_year := extract(year from v_anchor)::integer;
    v_month := extract(month from v_anchor)::integer;
  end if;

  start_date := make_date(v_year, v_month, v_start_day);
  end_date := (start_date + interval '1 month' - interval '1 day')::date;
  return next;
end;
$$;

comment on function core_money.pay_period_for_date(date) is
  'Returnerer (start_date, end_date) for den pay_period der dækker given dato. Baseret på pay_period_settings.start_day_of_month.';

revoke all on function core_money.pay_period_for_date(date) from public;
grant execute on function core_money.pay_period_for_date(date) to authenticated;

-- ─── pay_periods (open/locked livscyklus) ─────────────────────────────────
-- no-dedup-key: master-tabel; daterange er natural key (EXCLUDE-constraint).
create table core_money.pay_periods (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date date not null,
  status text not null default 'open' check (status in ('open', 'locked')),
  locked_at timestamptz,
  locked_by uuid,
  auto_lock_enabled boolean not null default true,
  consecutive_lock_failures integer not null default 0,
  last_lock_attempt_at timestamptz,
  last_lock_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pay_periods_dates_check check (start_date <= end_date),
  constraint pay_periods_no_overlap
    exclude using gist (daterange(start_date, end_date, '[]') with &&),
  constraint pay_periods_locked_consistency check (
    (status = 'locked' and locked_at is not null and locked_by is not null)
    or (status = 'open' and locked_at is null and locked_by is null)
  )
);

comment on table core_money.pay_periods is
  'Master-plan §1.6 lønperioder med open/locked livscyklus. Overlap forhindret af exclusion-constraint. DELETE altid blokeret. auto_lock_enabled pr. periode (overrider settings ved behov). consecutive_lock_failures tracker auto-lock-fejl for alert-3-i-træk-logikken.';

create index pay_periods_status_idx on core_money.pay_periods (status);
create index pay_periods_end_date_idx on core_money.pay_periods (end_date);
create index pay_periods_auto_lock_idx on core_money.pay_periods (end_date)
  where status = 'open' and auto_lock_enabled = true;

-- ─── pay_periods immutability + lock-trigger ─────────────────────────────
create or replace function core_money.pay_periods_lock_and_delete_check()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'pay_periods[%]: DELETE altid blokeret', old.id
      using errcode = 'P0001';
  end if;

  if old.status = 'locked' then
    -- I låst periode: kun consecutive_lock_failures + last_lock_* må ændres
    -- (auto-lock-cron logger fejl) eller via break-glass-unlock som sætter
    -- session-var allow_pay_period_unlock_break_glass='true'.
    if current_setting('stork.allow_pay_period_unlock_break_glass', true) = 'true' then
      -- Break-glass unlock: status='open', clearer locked_at/locked_by tilladt.
      if new.status = 'open' and new.locked_at is null and new.locked_by is null then
        return new;
      end if;
    end if;

    -- Tillad opdatering af drift-felter (consecutive_lock_failures, last_lock_*)
    -- så længe alle andre felter er uændret.
    if old.start_date is distinct from new.start_date
       or old.end_date is distinct from new.end_date
       or old.status is distinct from new.status
       or old.locked_at is distinct from new.locked_at
       or old.locked_by is distinct from new.locked_by
       or old.auto_lock_enabled is distinct from new.auto_lock_enabled
       or old.created_at is distinct from new.created_at then
      raise exception 'pay_periods[%]: locked periode kan ikke ændres (kun drift-felter via cron eller break-glass-unlock)', old.id
        using errcode = 'P0001';
    end if;
    return new;
  end if;

  -- Open → locked: sæt locked_at + locked_by automatisk.
  if new.status = 'locked' and old.status = 'open' then
    new.locked_at := coalesce(new.locked_at, now());
    new.locked_by := coalesce(new.locked_by, auth.uid());
  end if;

  return new;
end;
$$;

create trigger pay_periods_lock_and_delete_check
  before update or delete on core_money.pay_periods
  for each row execute function core_money.pay_periods_lock_and_delete_check();

create trigger pay_periods_set_updated_at
  before update on core_money.pay_periods
  for each row execute function core_compliance.set_updated_at();

create trigger pay_periods_audit
  after insert or update or delete on core_money.pay_periods
  for each row execute function core_compliance.stork_audit();

alter table core_money.pay_periods enable row level security;
alter table core_money.pay_periods force row level security;

create policy pay_periods_select on core_money.pay_periods
  for select to authenticated using (true);

create policy pay_periods_insert on core_money.pay_periods
  for insert to authenticated
  with check (current_setting('stork.allow_pay_periods_write', true) = 'true');

create policy pay_periods_update on core_money.pay_periods
  for update to authenticated
  using (current_setting('stork.allow_pay_periods_write', true) = 'true')
  with check (current_setting('stork.allow_pay_periods_write', true) = 'true');

revoke all on table core_money.pay_periods from public, anon, service_role;
grant select on table core_money.pay_periods to authenticated;
grant insert, update on table core_money.pay_periods to authenticated;

-- ─── period_recommended_lock_date(period_id): helper ─────────────────────
create or replace function core_money.period_recommended_lock_date(p_period_id uuid)
returns date
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_period record;
  v_rule text;
begin
  select pp.start_date, pp.end_date into v_period
    from core_money.pay_periods pp where pp.id = p_period_id;
  if v_period.end_date is null then
    raise exception 'pay_period ikke fundet: %', p_period_id using errcode = 'P0002';
  end if;

  select recommended_lock_date_rule into v_rule
    from core_money.pay_period_settings where id = 1;

  return case v_rule
    when 'month_last_calendar_day' then (date_trunc('month', v_period.end_date) + interval '1 month - 1 day')::date
    when 'period_end_date' then v_period.end_date
    when 'period_end_plus_7' then v_period.end_date + 7
    else v_period.end_date
  end;
end;
$$;

comment on function core_money.period_recommended_lock_date(uuid) is
  'Master-plan §1.6 + rettelse 16: returnerer dato hvor period anses for klar-til-lock baseret på pay_period_settings.recommended_lock_date_rule. Bruges af auto-lock-cron + UI.';

revoke all on function core_money.period_recommended_lock_date(uuid) from public;
grant execute on function core_money.period_recommended_lock_date(uuid) to authenticated;

-- ─── Bootstrap første pay_period ──────────────────────────────────────────
do $bootstrap$
declare
  v_today date := (now() at time zone 'Europe/Copenhagen')::date;
  v_period record;
begin
  perform set_config('stork.source_type', 'migration', true);
  perform set_config('stork.change_reason', 'legacy_import_t0: t7 bootstrap first pay_period i core_money', true);
  perform set_config('stork.allow_pay_periods_write', 'true', true);

  select * into v_period from core_money.pay_period_for_date(v_today);
  if not exists (select 1 from core_money.pay_periods p where p.start_date = v_period.start_date) then
    insert into core_money.pay_periods (start_date, end_date)
    values (v_period.start_date, v_period.end_date);
  end if;
end;
$bootstrap$;
