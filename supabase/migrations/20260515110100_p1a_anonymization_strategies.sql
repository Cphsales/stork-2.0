-- P1a: anonymization_strategies-registry med streng validation + lifecycle.
--
-- BAGGRUND (master-plan rettelser 22+27+30):
-- PII-strategi-implementeringer skal være data i registry, ikke hardkodet
-- i SQL. P1a indfører anonymization_strategies-tabellen med:
-- - DB-trigger-validation (Fund 7+12): kun funktioner i core_compliance med
--   prefix _anon_strategy_, signatur (text, text) returns text, IMMUTABLE/STABLE.
-- - Lifecycle-trigger (Fund 12): status='active' kun via activate-RPC
--   (session-var); ingen direkte UPDATE.
-- - DELETE-trigger (Fund 13): kun draft-strategier kan slettes.
-- - Bootstrap-rows seedes med status='approved' (IKKE 'active') pr. Mathias-
--   afgørelse Problem 4 — aktivering via UI som pre-cutover-step.
--
-- STRATEGI-FUNKTIONER (initial):
-- - _anon_strategy_blank(value, entity_id) returns text (= '')
-- - _anon_strategy_hash_email(value, entity_id) returns text (sha256 + suffix)
--
-- Anonymization_mappings.field_strategies refererer disse via strategy_name.

-- ─── Tabel ─────────────────────────────────────────────────────────────────
-- no-dedup-key: registry-tabel; strategy_name er natural key + unique.
create table core_compliance.anonymization_strategies (
  id uuid primary key default gen_random_uuid(),
  strategy_name text unique not null,
  function_schema text not null default 'core_compliance',
  function_name text not null,
  status text not null default 'draft'
    check (status in ('draft', 'tested', 'approved', 'active')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  activated_at timestamptz,
  activated_by uuid references core_identity.employees(id),
  check (status <> 'active' or (activated_at is not null and activated_by is not null))
);

comment on table core_compliance.anonymization_strategies is
  'P1a: registry over PII-anonymization-strategier. Funktioner valideres via DB-trigger (schema+prefix+signatur+volatility). Lifecycle: draft -> tested -> approved -> active (activate kraever RPC).';

alter table core_compliance.anonymization_strategies enable row level security;
alter table core_compliance.anonymization_strategies force row level security;

revoke all on table core_compliance.anonymization_strategies from public, anon, service_role;
grant select on table core_compliance.anonymization_strategies to authenticated;
grant insert, update, delete on table core_compliance.anonymization_strategies to authenticated;

create policy strategies_select on core_compliance.anonymization_strategies
  for select to authenticated using (true);
create policy strategies_insert on core_compliance.anonymization_strategies
  for insert to authenticated
  with check (current_setting('stork.allow_strategy_write', true) = 'true');
create policy strategies_update on core_compliance.anonymization_strategies
  for update to authenticated
  using (current_setting('stork.allow_strategy_write', true) = 'true')
  with check (current_setting('stork.allow_strategy_write', true) = 'true');
create policy strategies_delete on core_compliance.anonymization_strategies
  for delete to authenticated
  using (current_setting('stork.allow_strategy_write', true) = 'true');

-- ─── Validation-trigger: metadata + funktion-eksistens ────────────────────
create or replace function core_compliance.validate_anonymization_strategy()
returns trigger
language plpgsql
set search_path = ''
as $func$
declare
  v_proc regprocedure;
  v_volatility "char";
  v_rettype oid;
begin
  if new.function_schema <> 'core_compliance' then
    raise exception 'function_schema skal vaere core_compliance (har %)', new.function_schema
      using errcode = 'P0001';
  end if;
  if new.function_name !~ '^_anon_strategy_' then
    raise exception 'function_name skal starte med _anon_strategy_ (har %)', new.function_name
      using errcode = 'P0001';
  end if;
  begin
    v_proc := (new.function_schema || '.' || new.function_name || '(text, text)')::regprocedure;
  exception when undefined_function then
    raise exception 'funktion %.%(text, text) findes ikke', new.function_schema, new.function_name
      using errcode = 'P0002';
  end;
  select prorettype, provolatile into v_rettype, v_volatility
    from pg_proc where oid = v_proc;
  if v_rettype <> 'text'::regtype then
    raise exception 'funktion % skal returnere text (returnerer %)', v_proc, v_rettype::regtype
      using errcode = 'P0001';
  end if;
  if v_volatility not in ('i', 's') then
    raise exception 'funktion % skal vaere IMMUTABLE eller STABLE (er volatility=%)', v_proc, v_volatility
      using errcode = 'P0001';
  end if;
  return new;
end;
$func$;

create trigger anonymization_strategies_validate
  before insert or update on core_compliance.anonymization_strategies
  for each row execute function core_compliance.validate_anonymization_strategy();

-- ─── Lifecycle-trigger: status='active' kun via activate-RPC ──────────────
create or replace function core_compliance.enforce_anonymization_strategy_lifecycle()
returns trigger
language plpgsql
set search_path = ''
as $func$
begin
  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'approved') then
      raise exception 'INSERT med status=% er ikke tilladt (kun draft eller approved/bootstrap)', new.status
        using errcode = 'P0001';
    end if;
    -- Bootstrap (approved direkte ved INSERT) kraever migration-context
    if new.status = 'approved' and current_setting('stork.source_type', true) <> 'migration' then
      raise exception 'INSERT med status=approved kun tilladt under migration (source_type=%)',
        coalesce(current_setting('stork.source_type', true), 'null')
        using errcode = 'P0001';
    end if;
    return new;
  end if;

  -- TG_OP = UPDATE
  if old.status = new.status then
    return new;
  end if;

  -- Status -> active kun via session-var (sat af activate-RPC)
  if new.status = 'active' then
    if current_setting('stork.allow_strategy_activate', true) <> 'true' then
      raise exception 'status=active kraever aktivering via anonymization_strategy_activate-RPC'
        using errcode = '42501';
    end if;
    new.activated_at := now();
    new.activated_by := core_identity.current_employee_id();
  end if;

  -- Active er terminal: ingen overgang ud af active via direkte UPDATE
  if old.status = 'active' and new.status <> 'active' then
    raise exception 'kan ikke deaktivere active-strategy via direkte UPDATE'
      using errcode = '42501';
  end if;

  -- Progression kun fremad i lifecycle (draft<tested<approved<active)
  if (
    (old.status = 'tested' and new.status = 'draft')
    or (old.status = 'approved' and new.status in ('draft', 'tested'))
  ) then
    raise exception 'lifecycle-regression % -> % er ikke tilladt', old.status, new.status
      using errcode = 'P0001';
  end if;

  return new;
end;
$func$;

create trigger anonymization_strategies_lifecycle
  before insert or update on core_compliance.anonymization_strategies
  for each row execute function core_compliance.enforce_anonymization_strategy_lifecycle();

-- ─── DELETE-trigger: kun draft kan slettes (Fund 13) ──────────────────────
create or replace function core_compliance.enforce_anonymization_strategy_delete()
returns trigger
language plpgsql
set search_path = ''
as $func$
begin
  if old.status <> 'draft' then
    raise exception 'kan kun slette draft-strategier (denne har status=%)', old.status
      using errcode = 'P0001';
  end if;
  return old;
end;
$func$;

create trigger anonymization_strategies_delete_check
  before delete on core_compliance.anonymization_strategies
  for each row execute function core_compliance.enforce_anonymization_strategy_delete();

-- ─── Audit + updated_at triggers ──────────────────────────────────────────
create trigger anonymization_strategies_set_updated_at
  before update on core_compliance.anonymization_strategies
  for each row execute function core_compliance.set_updated_at();

create trigger anonymization_strategies_audit
  after insert or update or delete on core_compliance.anonymization_strategies
  for each row execute function core_compliance.stork_audit();

-- ─── Strategi-funktioner ──────────────────────────────────────────────────
-- _anon_strategy_blank: tomt-værdi (for first_name/last_name/etc)
create or replace function core_compliance._anon_strategy_blank(
  p_value text, p_entity_id text
) returns text
language sql immutable parallel safe set search_path = ''
as $$ select ''::text $$;

comment on function core_compliance._anon_strategy_blank(text, text) is
  'P1a: anonymisering-strategi der returnerer tom streng. Bruges til navne/fri-tekst-PII.';

-- _anon_strategy_hash_email: sha256-prefix + invalid-domain
create or replace function core_compliance._anon_strategy_hash_email(
  p_value text, p_entity_id text
) returns text
language sql immutable parallel safe set search_path = ''
as $$
  select substring(
    encode(extensions.digest(coalesce(p_value, '') || ':' || coalesce(p_entity_id, ''), 'sha256'), 'hex'),
    1, 16
  ) || '@anonymized.invalid';
$$;

comment on function core_compliance._anon_strategy_hash_email(text, text) is
  'P1a: anonymisering-strategi for email. Returnerer sha256-prefix + @anonymized.invalid. Entity_id deltager i hash for unique-bevarelse.';

-- ─── Bootstrap-rows (status='approved' pr. Problem 4) ─────────────────────
select set_config('stork.source_type', 'migration', false);
select set_config('stork.allow_strategy_write', 'true', false);
select set_config('stork.change_reason',
  'P1a: bootstrap anonymization_strategies med status=approved', false);

insert into core_compliance.anonymization_strategies
  (strategy_name, function_schema, function_name, status, description) values
  ('blank',      'core_compliance', '_anon_strategy_blank',      'approved',
    'P1a: tom streng. For navn/fri-tekst-PII der maa fjernes uden hash.'),
  ('hash_email', 'core_compliance', '_anon_strategy_hash_email', 'approved',
    'P1a: sha256-prefix + @anonymized.invalid. Bevarer unique-property paa email-feltet.')
on conflict (strategy_name) do nothing;

-- ─── is_permanent_allowed udvides FØR klassifikation (D1c-trigger fanger) ─
create or replace function core_compliance.is_permanent_allowed(
  p_table_schema text,
  p_table_name text,
  p_column_name text
) returns boolean
language sql immutable parallel safe set search_path = ''
as $$
  select exists (
    select 1
    from (values
      ('core_compliance', 'audit_log',                   null::text),
      ('core_compliance', 'anonymization_mappings',      null::text),
      ('core_compliance', 'anonymization_state',         null::text),
      ('core_compliance', 'anonymization_strategies',    null::text),
      ('core_compliance', 'break_glass_operation_types', null::text),
      ('core_compliance', 'data_field_definitions',      null::text),
      ('core_compliance', 'superadmin_settings',         null::text),
      ('core_identity',   'roles',                       null::text),
      ('core_identity',   'role_page_permissions',       null::text),
      ('core_identity',   'employee_active_config',      null::text),
      ('core_identity',   'employees',                   'id'),
      ('core_identity',   'employees',                   'role_id'),
      ('core_identity',   'employees',                   'created_at'),
      ('core_identity',   'employees',                   'updated_at'),
      ('core_money',      'pay_period_settings',         null::text)
    ) as allowlist(t_schema, t_name, t_column)
    where allowlist.t_schema = p_table_schema
      and allowlist.t_name = p_table_name
      and (allowlist.t_column is null or allowlist.t_column = p_column_name)
  );
$$;

-- ─── Klassifikation ───────────────────────────────────────────────────────
select set_config('stork.allow_data_field_definitions_write', 'true', false);
select set_config('stork.change_reason',
  'P1a: klassifikation af anonymization_strategies kolonner', false);

insert into core_compliance.data_field_definitions
  (table_schema, table_name, column_name, category, pii_level, retention_type, retention_value, match_role, purpose) values
  ('core_compliance', 'anonymization_strategies', 'id',                'konfiguration', 'none', 'permanent', null, null, 'strategy-PK'),
  ('core_compliance', 'anonymization_strategies', 'strategy_name',     'konfiguration', 'none', 'permanent', null, null, 'strategy navngivning (refereret af mappings)'),
  ('core_compliance', 'anonymization_strategies', 'function_schema',   'konfiguration', 'none', 'permanent', null, null, 'hardkodet core_compliance'),
  ('core_compliance', 'anonymization_strategies', 'function_name',     'konfiguration', 'none', 'permanent', null, null, 'PG-funktion-navn med _anon_strategy_ prefix'),
  ('core_compliance', 'anonymization_strategies', 'status',            'konfiguration', 'none', 'permanent', null, null, 'lifecycle: draft/tested/approved/active'),
  ('core_compliance', 'anonymization_strategies', 'description',       'konfiguration', 'none', 'permanent', null, null, 'fri-tekst forklaring'),
  ('core_compliance', 'anonymization_strategies', 'created_at',        'konfiguration', 'none', 'permanent', null, null, 'oprettelse'),
  ('core_compliance', 'anonymization_strategies', 'updated_at',        'konfiguration', 'none', 'permanent', null, null, 'sidste opdatering'),
  ('core_compliance', 'anonymization_strategies', 'activated_at',      'konfiguration', 'none', 'permanent', null, null, 'tidsstempel ved status=active'),
  ('core_compliance', 'anonymization_strategies', 'activated_by',      'konfiguration', 'none', 'permanent', null, null, 'employee_id der aktiverede')
on conflict (table_schema, table_name, column_name) do nothing;

-- ─── activate-RPC ──────────────────────────────────────────────────────────
create or replace function core_compliance.anonymization_strategy_activate(
  p_strategy_id uuid,
  p_change_reason text
)
returns core_compliance.anonymization_strategies
language plpgsql security definer set search_path = ''
as $func$
declare
  v_row core_compliance.anonymization_strategies;
begin
  if not core_identity.has_permission('anonymization_strategies', 'activate', true) then
    raise exception 'anonymization_strategy_activate kraever permission anonymization_strategies.activate.can_edit'
      using errcode = '42501';
  end if;
  if p_strategy_id is null then
    raise exception 'strategy_id er paakraevet' using errcode = '22023';
  end if;
  if p_change_reason is null or length(trim(p_change_reason)) = 0 then
    raise exception 'change_reason er paakraevet' using errcode = '22023';
  end if;

  select * into v_row from core_compliance.anonymization_strategies where id = p_strategy_id for update;
  if v_row.id is null then
    raise exception 'strategy % findes ikke', p_strategy_id using errcode = 'P0002';
  end if;
  if v_row.status <> 'approved' then
    raise exception 'kan kun aktivere approved-strategier (denne har status=%)', v_row.status
      using errcode = 'P0001';
  end if;

  perform set_config('stork.allow_strategy_write', 'true', true);
  perform set_config('stork.allow_strategy_activate', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', p_change_reason, true);

  update core_compliance.anonymization_strategies
     set status = 'active'
   where id = p_strategy_id
   returning * into v_row;

  return v_row;
end;
$func$;

revoke all on function core_compliance.anonymization_strategy_activate(uuid, text) from public;
grant execute on function core_compliance.anonymization_strategy_activate(uuid, text) to authenticated;

-- ─── Bootstrap-permissions til superadmin ─────────────────────────────────
select set_config('stork.allow_role_page_permissions_write', 'true', false);
select set_config('stork.change_reason',
  'P1a: bootstrap anonymization_strategies-permissions til superadmin', false);

insert into core_identity.role_page_permissions (role_id, page_key, tab_key, can_view, can_edit, scope)
select (select id from core_identity.roles where name = 'superadmin'),
       page_key, tab_key, true, true, 'all'
from (values
  ('anonymization_strategies', 'manage'),
  ('anonymization_strategies', 'activate')
) as perms(page_key, tab_key)
on conflict (role_id, page_key, coalesce(tab_key, '')) do nothing;
