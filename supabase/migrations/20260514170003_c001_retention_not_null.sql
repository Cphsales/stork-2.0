-- C001: Klassifikations-registry kræver retention på hver kolonne.
--
-- BAGGRUND (Codex-fund C001):
-- data_field_definitions tillod retention_type=NULL. Størstedelen af
-- klassifikations-INSERTs brugte NULL. Master-plan §0 kræver "klassifikation
-- + retention på hver kolonne". §1.2 specificerer retention-typer.
--
-- MASTER-PLAN-PARAGRAF: §0 + §1.2.
--
-- VALGT LØSNING:
-- 1. Tilføj retention_type='permanent' (semantisk: ingen sletning, eksplicit)
-- 2. Backfill alle eksisterende rows med passende retention
-- 3. ALTER COLUMN retention_type SET NOT NULL
-- 4. retention_consistency-CHECK strammet: permanent → value NULL; øvrige → value required
--
-- BACKFILL-REGLER (begrundet pr. tabel):
-- - audit_log + break_glass_requests:           legal {2555d} (7 år, sikkerheds-historik)
-- - cron_heartbeats (eks. last_error):          time_based {730d} (drift-data)
-- - data_field_definitions, *_settings, roles,
--   role_page_permissions, anonymization_*,
--   break_glass_operation_types:                permanent (system-meta)
-- - employees PII (first/last/email):           uændret event_based {termination+1825d}
-- - employees øvrige master-data:               permanent
-- - employees data koblet til termination:      event_based {termination+1825d}
-- - pay_periods + løn-tabeller:                 legal {2555d} (regnskabsdata)
-- - candidate-tabeller:                         time_based {365d}
--
-- VISION-TJEK:
-- - §0 + §1.2: hver kolonne har nu eksplicit retention. JA.
-- - 'permanent' som bevidst type fremfor NULL → mere ærligt design end "manual" eller "time_based default".
-- - Symptom vs. krav: ikke et symptom — DB-niveau strukturel garanti via NOT NULL.
-- - Konklusion: FORSVARLIGT.

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Drop gamle CHECK-constraints + udvid retention_type CHECK med 'permanent'
-- ─────────────────────────────────────────────────────────────────────────

alter table core_compliance.data_field_definitions
  drop constraint if exists retention_consistency;

alter table core_compliance.data_field_definitions
  drop constraint if exists data_field_definitions_retention_type_check;

alter table core_compliance.data_field_definitions
  add constraint data_field_definitions_retention_type_check
  check (retention_type in ('time_based', 'event_based', 'legal', 'manual', 'permanent'));

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Opdater validate_retention-trigger til at håndtere 'permanent'
-- ─────────────────────────────────────────────────────────────────────────

create or replace function core_compliance.data_field_definitions_validate_retention()
returns trigger
language plpgsql
set search_path = ''
as $func$
declare
  v jsonb := new.retention_value;
begin
  if new.retention_type is null then
    return new;  -- mid-migration tolerance; NOT NULL constraint håndhæver senere
  end if;

  case new.retention_type
    when 'permanent' then
      if v is not null then
        raise exception 'permanent retention_value skal være NULL, fik %', v
          using errcode = '22023';
      end if;
    when 'time_based' then
      if not (v ? 'max_days' and (v->>'max_days') ~ '^\d+$') then
        raise exception 'time_based retention_value kræver {"max_days": <int>}, fik %', v
          using errcode = '22023';
      end if;
    when 'event_based' then
      if not (v ? 'event' and v ? 'days_after' and (v->>'days_after') ~ '^\d+$') then
        raise exception 'event_based retention_value kræver {"event": <text>, "days_after": <int>}, fik %', v
          using errcode = '22023';
      end if;
    when 'legal' then
      if not (v ? 'max_days' and (v->>'max_days') ~ '^\d+$') then
        raise exception 'legal retention_value kræver {"max_days": <int>}, fik %', v
          using errcode = '22023';
      end if;
    when 'manual' then
      if not (v ? 'max_days' or v ? 'event') then
        raise exception 'manual retention_value kræver {"max_days": <int>} eller {"event": <text>}, fik %', v
          using errcode = '22023';
      end if;
  end case;

  return new;
end;
$func$;

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Backfill — sæt session-vars og opdatér eksisterende rows
-- ─────────────────────────────────────────────────────────────────────────

select set_config('stork.allow_data_field_definitions_write', 'true', false);
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason',
  'C001: backfill retention_type på 189 eksisterende klassificeringer',
  false);

-- audit_log → legal 7 år (sikkerheds-historik; konverteres senere pr. rettelse 24)
update core_compliance.data_field_definitions
   set retention_type = 'legal', retention_value = '{"max_days": 2555}'::jsonb
 where (table_schema, table_name) = ('core_compliance', 'audit_log')
   and retention_type is null;

-- cron_heartbeats → time_based 2 år (last_error har allerede 90d)
update core_compliance.data_field_definitions
   set retention_type = 'time_based', retention_value = '{"max_days": 730}'::jsonb
 where (table_schema, table_name) = ('core_compliance', 'cron_heartbeats')
   and retention_type is null;

-- System-meta tabeller → permanent (ingen sletning)
update core_compliance.data_field_definitions
   set retention_type = 'permanent', retention_value = null
 where table_schema = 'core_compliance'
   and table_name in ('data_field_definitions', 'superadmin_settings',
                       'anonymization_mappings', 'anonymization_state',
                       'break_glass_operation_types')
   and retention_type is null;

-- break_glass_requests → legal 7 år
update core_compliance.data_field_definitions
   set retention_type = 'legal', retention_value = '{"max_days": 2555}'::jsonb
 where (table_schema, table_name) = ('core_compliance', 'break_glass_requests')
   and retention_type is null;

-- employees master-data → permanent (id, role_id, timestamps)
update core_compliance.data_field_definitions
   set retention_type = 'permanent', retention_value = null
 where (table_schema, table_name) = ('core_identity', 'employees')
   and column_name in ('id', 'role_id', 'created_at', 'updated_at')
   and retention_type is null;

-- employees data koblet til termination → event_based termination+1825d
update core_compliance.data_field_definitions
   set retention_type = 'event_based',
       retention_value = '{"event": "termination", "days_after": 1825}'::jsonb
 where (table_schema, table_name) = ('core_identity', 'employees')
   and column_name in ('hire_date', 'termination_date', 'auth_user_id', 'anonymized_at')
   and retention_type is null;

-- roles + role_page_permissions → permanent (rolle-katalog evigt)
update core_compliance.data_field_definitions
   set retention_type = 'permanent', retention_value = null
 where table_schema = 'core_identity'
   and table_name in ('roles', 'role_page_permissions')
   and retention_type is null;

-- pay_period_settings → permanent (singleton config)
update core_compliance.data_field_definitions
   set retention_type = 'permanent', retention_value = null
 where (table_schema, table_name) = ('core_money', 'pay_period_settings')
   and retention_type is null;

-- Løn-stamme tabeller → legal 7 år (regnskabsdata)
update core_compliance.data_field_definitions
   set retention_type = 'legal', retention_value = '{"max_days": 2555}'::jsonb
 where table_schema = 'core_money'
   and table_name in ('pay_periods', 'commission_snapshots',
                       'salary_corrections', 'cancellations')
   and retention_type is null;

-- Candidate-tabeller → time_based 1 år (operationel, sikker at slette)
update core_compliance.data_field_definitions
   set retention_type = 'time_based', retention_value = '{"max_days": 365}'::jsonb
 where table_schema = 'core_money'
   and table_name in ('pay_period_candidate_runs',
                       'commission_snapshots_candidate',
                       'salary_corrections_candidate')
   and retention_type is null;

-- ─────────────────────────────────────────────────────────────────────────
-- 4. Verificér ingen NULL retention_type tilbage
-- ─────────────────────────────────────────────────────────────────────────

do $verify$
declare v_null_count integer;
begin
  select count(*) into v_null_count
    from core_compliance.data_field_definitions
   where retention_type is null;
  if v_null_count > 0 then
    raise exception 'C001 backfill ufuldstændig: % rows har stadig retention_type=NULL', v_null_count;
  end if;
end;
$verify$;

-- ─────────────────────────────────────────────────────────────────────────
-- 5. Tilføj strammet retention_consistency CHECK + ALTER COLUMN NOT NULL
-- ─────────────────────────────────────────────────────────────────────────

alter table core_compliance.data_field_definitions
  add constraint retention_consistency check (
    (retention_type = 'permanent' and retention_value is null)
    or (retention_type in ('time_based', 'event_based', 'legal', 'manual')
        and retention_value is not null)
  );

alter table core_compliance.data_field_definitions
  alter column retention_type set not null;

comment on column core_compliance.data_field_definitions.retention_type is
  'C001 NOT NULL: hver kolonne kræver eksplicit retention-valg. ''permanent'' for ingen sletning (system-meta); ''legal'' for lovkrav; ''time_based''/''event_based'' for drift-data; ''manual'' for operator-styret.';
