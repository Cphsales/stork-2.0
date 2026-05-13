-- Trin 1 / fundament — audit_log som PARTITIONED BY RANGE (occurred_at).
--
-- Master-plan §1.3 audit-mønster + §1.14 partitionering fra dag ét (rettelse 18 A2).
--
-- Mekanik:
--  - audit_log er PARTITIONED BY RANGE (occurred_at)
--  - Initial månedlige partitioner: indeværende måned + næste 2 måneder + default
--  - Cron-job opretter månedligt ny partition (sker via t1_05 cron-skabelon)
--  - Trigger på parent — Postgres 17 propagerer korrekt til partitioner
--  - ENABLE RLS, ikke FORCE (§1.1 undtagelse — SECURITY DEFINER trigger skal kunne INSERT'e)
--  - 0 SELECT-policies, læsning via audit_log_read() RPC
--  - BEFORE UPDATE/DELETE blokeret på parent
--  - BEFORE TRUNCATE blokeret separat
--
-- source_type-enum (6 værdier, §1.3): manual / cron / webhook / trigger_cascade / service_role / unknown.

-- ─── Extensions (forudsætning for digest/sha256 i audit_filter_values t1_07) ──
create extension if not exists pgcrypto;

-- ─── audit_log parent-tabel (partitioneret) ──────────────────────────────
create table core_compliance.audit_log (
  id uuid not null default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  table_schema text not null,
  table_name text not null,
  record_id uuid,
  operation text not null check (operation in ('INSERT', 'UPDATE', 'DELETE')),
  actor_user_id uuid,
  actor_role text,
  -- source_type enum: master-plan §1.3 (6 driftværdier) + §0.5 (migration-spor pr. rettelse 20).
  source_type text not null check (source_type in (
    'manual', 'cron', 'webhook', 'trigger_cascade', 'service_role', 'unknown', 'migration'
  )),
  change_reason text not null check (length(trim(change_reason)) > 0),
  schema_version integer not null default 1,
  changed_columns text[],
  old_values jsonb,
  new_values jsonb,
  trigger_depth integer not null default 1,
  primary key (id, occurred_at)
) partition by range (occurred_at);

comment on table core_compliance.audit_log is
  'Master-plan §1.3 universel audit-tabel. PARTITIONED BY RANGE (occurred_at) — månedlige partitioner. Append-only, immutable. PII hashed via audit_filter_values før skrivning. ENABLE RLS (ikke FORCE — §1.1 undtagelse).';

-- ─── Initial partitioner ──────────────────────────────────────────────────
-- Indeværende måned + næste 2 måneder + default catch-all.
do $$
declare
  v_start date := date_trunc('month', now() at time zone 'UTC')::date;
  v_part_name text;
  v_part_start date;
  v_part_end date;
begin
  for i in 0..2 loop
    v_part_start := (v_start + (i || ' months')::interval)::date;
    v_part_end := (v_part_start + interval '1 month')::date;
    v_part_name := 'audit_log_' || to_char(v_part_start, 'YYYY_MM');
    execute format(
      'create table core_compliance.%I partition of core_compliance.audit_log for values from (%L) to (%L)',
      v_part_name, v_part_start, v_part_end
    );
  end loop;
end;
$$;

-- Default-partition fanger fremtidige rows hvis cron-job ikke har oprettet partition endnu.
create table core_compliance.audit_log_default
  partition of core_compliance.audit_log default;

-- ─── ENABLE RLS (ikke FORCE — §1.1 undtagelse) ───────────────────────────
alter table core_compliance.audit_log enable row level security;
-- 0 SELECT-policies. Læsning via audit_log_read() RPC.

-- ─── REVOKE all direkte adgang ───────────────────────────────────────────
revoke all on table core_compliance.audit_log from public, authenticated, anon, service_role;

-- ─── Index på partition-key + actor for typiske queries ──────────────────
create index audit_log_actor_idx on core_compliance.audit_log (actor_user_id, occurred_at desc);
create index audit_log_target_idx on core_compliance.audit_log (table_schema, table_name, record_id, occurred_at desc);

-- ─── stork_audit() trigger-funktion ──────────────────────────────────────
-- SECURITY DEFINER fordi den skal INSERT'e i audit_log uafhængigt af caller's
-- direkte rettigheder. search_path=' ' for deterministisk lookup.
--
-- source_type-detection-prioritet (§1.3):
--  1. Session-var stork.source_type (eksplicit override)
--  2. pg_trigger_depth() > 1 → trigger_cascade
--  3. current_user IN ('service_role', 'supabase_admin') → service_role
--  4. auth.uid() IS NOT NULL → manual
--  5. fallback → unknown

create or replace function core_compliance.stork_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_source_type text;
  v_change_reason text;
  v_old jsonb;
  v_new jsonb;
  v_changed text[];
  v_record_id uuid;
  v_actor uuid := auth.uid();
begin
  -- source_type detection
  v_source_type := current_setting('stork.source_type', true);
  if v_source_type is null or v_source_type = '' then
    if pg_trigger_depth() > 1 then
      v_source_type := 'trigger_cascade';
    elsif current_user in ('service_role', 'supabase_admin') then
      v_source_type := 'service_role';
    elsif v_actor is not null then
      v_source_type := 'manual';
    else
      v_source_type := 'unknown';
    end if;
  end if;

  v_change_reason := current_setting('stork.change_reason', true);
  if v_change_reason is null or length(trim(v_change_reason)) = 0 then
    -- For cron og trigger_cascade kan change_reason mangle — kræv ellers.
    if v_source_type in ('cron', 'trigger_cascade') then
      v_change_reason := 'auto: ' || tg_op || ' on ' || tg_table_schema || '.' || tg_table_name;
    else
      raise exception 'stork.change_reason session-var er påkrævet for source_type=%', v_source_type
        using errcode = 'P0001';
    end if;
  end if;

  -- Bestem record_id (kræver id-kolonne af type uuid på target-tabel).
  if tg_op = 'DELETE' then
    v_record_id := (to_jsonb(old) ->> 'id')::uuid;
    v_old := core_compliance.audit_filter_values(tg_table_schema, tg_table_name, to_jsonb(old));
    v_new := null;
  elsif tg_op = 'INSERT' then
    v_record_id := (to_jsonb(new) ->> 'id')::uuid;
    v_old := null;
    v_new := core_compliance.audit_filter_values(tg_table_schema, tg_table_name, to_jsonb(new));
  else  -- UPDATE
    v_record_id := (to_jsonb(new) ->> 'id')::uuid;
    v_old := core_compliance.audit_filter_values(tg_table_schema, tg_table_name, to_jsonb(old));
    v_new := core_compliance.audit_filter_values(tg_table_schema, tg_table_name, to_jsonb(new));
    -- changed_columns: kolonner hvor old != new
    select array_agg(key)
    into v_changed
    from jsonb_each(to_jsonb(new)) n
    where to_jsonb(old)->>n.key is distinct from n.value::text;
  end if;

  insert into core_compliance.audit_log (
    occurred_at, table_schema, table_name, record_id, operation,
    actor_user_id, actor_role, source_type, change_reason,
    schema_version, changed_columns, old_values, new_values, trigger_depth
  ) values (
    now(), tg_table_schema, tg_table_name, v_record_id, tg_op,
    v_actor, current_user, v_source_type, v_change_reason,
    1, v_changed, v_old, v_new, pg_trigger_depth()
  );

  return null;  -- AFTER-trigger
end;
$$;

comment on function core_compliance.stork_audit() is
  'Universel audit-trigger. AFTER INSERT/UPDATE/DELETE. SECURITY DEFINER. Skriver til core_compliance.audit_log. Kalder core_compliance.audit_filter_values for PII-hash.';

-- ─── audit_log_immutability_check() ──────────────────────────────────────
-- BEFORE UPDATE/DELETE-trigger der RAISE'r altid (med fremtidig
-- exception-vej for gdpr_retroactive_remove, §1.13).

create or replace function core_compliance.audit_log_immutability_check()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Fremtidig undtagelse: gdpr_retroactive_remove sætter session-var.
  if current_setting('stork.gdpr_retroactive', true) = 'true' then
    return coalesce(new, old);
  end if;
  raise exception 'audit_log er immutable (operation %, table %)', tg_op, tg_table_name
    using errcode = 'P0001';
end;
$$;

create trigger audit_log_immutability
  before update or delete on core_compliance.audit_log
  for each row execute function core_compliance.audit_log_immutability_check();

-- ─── block_truncate_immutable() — anvendes også til andre immutable tabeller senere ──
create or replace function core_compliance.block_truncate_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'TRUNCATE blokeret på immutable tabel %.%', tg_table_schema, tg_table_name
    using errcode = 'P0001';
end;
$$;

create trigger audit_log_block_truncate
  before truncate on core_compliance.audit_log
  for each statement execute function core_compliance.block_truncate_immutable();

-- ─── audit_log_read() RPC ────────────────────────────────────────────────
-- SECURITY DEFINER med is_admin()-check. Eneste vej til at læse audit_log.

create or replace function core_compliance.audit_log_read(
  p_table_schema text default null,
  p_table_name text default null,
  p_record_id uuid default null,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_limit integer default 100
)
returns setof core_compliance.audit_log
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not core_identity.is_admin() then
    raise exception 'audit_log_read kræver admin-permission'
      using errcode = '42501';
  end if;

  return query
    select *
    from core_compliance.audit_log
    where (p_table_schema is null or table_schema = p_table_schema)
      and (p_table_name is null or table_name = p_table_name)
      and (p_record_id is null or record_id = p_record_id)
      and (p_from is null or occurred_at >= p_from)
      and (p_to is null or occurred_at <= p_to)
    order by occurred_at desc
    limit greatest(p_limit, 0);
end;
$$;

revoke all on function core_compliance.audit_log_read(text, text, uuid, timestamptz, timestamptz, integer) from public;
grant execute on function core_compliance.audit_log_read(text, text, uuid, timestamptz, timestamptz, integer) to authenticated;

-- ─── ensure_audit_partition() — opret næste måneds partition ─────────────
-- Idempotent. Kaldes af cron (sat op i t1_05) og kan også kaldes manuelt.

create or replace function core_compliance.ensure_audit_partition(p_months_ahead integer default 2)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'UTC')::date;
  v_start date;
  v_end date;
  v_name text;
  v_created integer := 0;
begin
  for i in 0..p_months_ahead loop
    v_start := (date_trunc('month', v_today) + (i || ' months')::interval)::date;
    v_end := (v_start + interval '1 month')::date;
    v_name := 'audit_log_' || to_char(v_start, 'YYYY_MM');
    if not exists (
      select 1 from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'core_compliance' and c.relname = v_name
    ) then
      execute format(
        'create table core_compliance.%I partition of core_compliance.audit_log for values from (%L) to (%L)',
        v_name, v_start, v_end
      );
      v_created := v_created + 1;
    end if;
  end loop;
  return v_created;
end;
$$;

revoke all on function core_compliance.ensure_audit_partition(integer) from public;
grant execute on function core_compliance.ensure_audit_partition(integer) to service_role;
