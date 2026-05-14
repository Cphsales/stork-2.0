-- Trin 6 / §4 trin 6: Anonymisering-RPC'er.
--
-- Master-plan §1.4 + §1.13 (juridisk ramme).
--
-- RPC-familie:
--   apply_field_strategy(strategy, value) — pure helper
--   anonymize_employee(employee_id, reason) — entity-specifik RPC
--   anonymization_state_read(...)         — admin-læsning af log
--   replay_anonymization()                — post-restore catch-up
--   verify_anonymization_consistency()    — drift-check
--
-- Senere entities (clients i trin 10, identitets-master i trin 15) får
-- egne anonymize_<entity>-RPC'er der genbruger apply_field_strategy.
--
-- BEMÆRK: anonymisering forbliver ikke break-glass-flow i trin 6.
-- Master-plan §1.15 lister anonymization-revert som break-glass-kandidat,
-- men selve anonymize-handlingen er almindelig admin-handling (medarbejder
-- stopper). Revert (hvis fejl-anonymisering) er break-glass-bundet og
-- venter til trin 7c.

-- ─── apply_field_strategy: pure helper, anvendes af alle anonymize-RPC'er ──
create or replace function core_compliance.apply_field_strategy(
  p_strategy text,
  p_value text
)
returns text
language sql
immutable
set search_path = ''
as $$
  select case p_strategy
    when 'blank' then '[anonymized]'
    when 'hash' then 'sha256:' || encode(extensions.digest(coalesce(p_value, ''), 'sha256'), 'hex')
    when 'hash_email' then 'anon-' || substr(encode(extensions.digest(coalesce(p_value, ''), 'sha256'), 'hex'), 1, 16) || '@anonymized.local'
    else null
  end;
$$;

comment on function core_compliance.apply_field_strategy(text, text) is
  'Pure helper. Strategier: blank / hash / hash_email. delete_key håndteres separat (kun jsonb).';

revoke all on function core_compliance.apply_field_strategy(text, text) from public;
grant execute on function core_compliance.apply_field_strategy(text, text) to authenticated, service_role;

-- ─── anonymize_employee ──────────────────────────────────────────────────
-- UPDATE'er PII-felter på employees med strategi-baseret erstatning.
-- INSERT'er anonymization_state-row som autoritativ kilde.
-- Audit-trigger på employees fanger UPDATE'en automatisk.

create or replace function core_identity.anonymize_employee(
  p_employee_id uuid,
  p_reason text
)
returns core_identity.employees
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_mapping core_compliance.anonymization_mappings;
  v_strategies jsonb;
  v_strategy text;
  v_field text;
  v_old_email text;
  v_new_first_name text;
  v_new_last_name text;
  v_new_email text;
  v_row core_identity.employees;
  v_state_id uuid;
begin
  if not core_identity.is_admin() then
    raise exception 'anonymize_employee kraever admin-permission' using errcode = '42501';
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'reason er paakraevet' using errcode = '22023';
  end if;

  select * into v_mapping
    from core_compliance.anonymization_mappings
   where entity_type = 'employee'
     and table_schema = 'core_identity'
     and table_name = 'employees'
     and is_active = true;

  if v_mapping.id is null then
    raise exception 'ingen aktiv anonymiserings-mapping for employee' using errcode = 'P0002';
  end if;

  v_strategies := v_mapping.field_strategies;

  -- Hent eksisterende værdier til strategi-anvendelse.
  select email into v_old_email
    from core_identity.employees where id = p_employee_id;

  if v_old_email is null then
    raise exception 'employee ikke fundet: %', p_employee_id using errcode = 'P0002';
  end if;

  -- Anvend strategier pr. felt (kun felter listet i mapping).
  v_new_first_name := core_compliance.apply_field_strategy(
    v_strategies->>'first_name', null
  );
  v_new_last_name := core_compliance.apply_field_strategy(
    v_strategies->>'last_name', null
  );
  v_new_email := core_compliance.apply_field_strategy(
    v_strategies->>'email', v_old_email
  );

  perform set_config('stork.allow_employees_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'anonymization: ' || p_reason, true);

  update core_identity.employees
     set first_name = coalesce(v_new_first_name, first_name),
         last_name  = coalesce(v_new_last_name, last_name),
         email      = coalesce(v_new_email, email),
         anonymized_at = now()
   where id = p_employee_id
   returning * into v_row;

  -- Log anonymisering med snapshot af strategi-version.
  insert into core_compliance.anonymization_state (
    entity_type, table_schema, table_name, entity_id,
    anonymization_reason, strategy_version, field_mapping_snapshot, created_by
  ) values (
    'employee', 'core_identity', 'employees', p_employee_id,
    p_reason, v_mapping.strategy_version, v_strategies, auth.uid()
  )
  returning id into v_state_id;

  return v_row;
end;
$$;

comment on function core_identity.anonymize_employee(uuid, text) is
  'Master-plan §1.4: UPDATE PII-felter til strategi-baseret erstatning. INSERT anonymization_state. Audit-trigger fanger UPDATE.';

revoke all on function core_identity.anonymize_employee(uuid, text) from public;
grant execute on function core_identity.anonymize_employee(uuid, text) to authenticated;

-- ─── anonymization_state_read: admin-læsning af log ──────────────────────
create or replace function core_compliance.anonymization_state_read(
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_limit integer default 100
)
returns setof core_compliance.anonymization_state
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not core_identity.is_admin() then
    raise exception 'anonymization_state_read kraever admin-permission' using errcode = '42501';
  end if;
  return query
    select * from core_compliance.anonymization_state
    where (p_entity_type is null or entity_type = p_entity_type)
      and (p_entity_id is null or entity_id = p_entity_id)
      and (p_from is null or anonymized_at >= p_from)
      and (p_to is null or anonymized_at <= p_to)
    order by anonymized_at desc
    limit greatest(p_limit, 0);
end;
$$;

revoke all on function core_compliance.anonymization_state_read(text, uuid, timestamptz, timestamptz, integer) from public;
grant execute on function core_compliance.anonymization_state_read(text, uuid, timestamptz, timestamptz, integer) to authenticated;

-- ─── replay_anonymization: post-restore catch-up ─────────────────────────
-- Idempotent. For hver anonymization_state-row: tjek om master-row stadig er
-- anonymiseret; hvis ikke, re-anvend strategi fra snapshot.
-- Bruges efter backup-restore for at sikre at PII forbliver væk (§1.4 backup-paradox).

create or replace function core_compliance.replay_anonymization(
  p_entity_type text default null,
  p_dry_run boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_state record;
  v_total integer := 0;
  v_replayed integer := 0;
  v_skipped integer := 0;
  v_errors integer := 0;
  v_error_details jsonb := '[]'::jsonb;
  v_master_anonymized boolean;
begin
  if not core_identity.is_admin() then
    raise exception 'replay_anonymization kraever admin-permission' using errcode = '42501';
  end if;

  for v_state in
    select * from core_compliance.anonymization_state
     where p_entity_type is null or entity_type = p_entity_type
     order by anonymized_at asc
  loop
    v_total := v_total + 1;

    begin
      if v_state.entity_type = 'employee' then
        -- Tjek om master-row stadig er anonymiseret (anonymized_at sat).
        select anonymized_at is not null into v_master_anonymized
          from core_identity.employees where id = v_state.entity_id;

        if v_master_anonymized is null then
          -- Master-row eksisterer ikke længere (restored DB mangler entity).
          v_errors := v_errors + 1;
          v_error_details := v_error_details || jsonb_build_object(
            'entity_id', v_state.entity_id, 'reason', 'master-row mangler i restored data'
          );
        elsif v_master_anonymized then
          -- Allerede anonymiseret — idempotent no-op.
          v_skipped := v_skipped + 1;
        else
          -- Master-row har PII tilbage efter restore — re-anvend strategi.
          if not p_dry_run then
            perform core_identity.anonymize_employee(
              v_state.entity_id,
              'replay: ' || v_state.anonymization_reason
            );
          end if;
          v_replayed := v_replayed + 1;
        end if;
      else
        -- Andre entity-typer (clients trin 10, identitets-master trin 15)
        -- bygges når relevante anonymize-RPC'er findes.
        v_skipped := v_skipped + 1;
      end if;
    exception when others then
      v_errors := v_errors + 1;
      v_error_details := v_error_details || jsonb_build_object(
        'entity_id', v_state.entity_id, 'reason', sqlerrm
      );
    end;
  end loop;

  return jsonb_build_object(
    'total', v_total,
    'replayed', v_replayed,
    'skipped', v_skipped,
    'errors', v_errors,
    'error_details', v_error_details,
    'dry_run', p_dry_run,
    'executed_at', now()
  );
end;
$$;

revoke all on function core_compliance.replay_anonymization(text, boolean) from public;
grant execute on function core_compliance.replay_anonymization(text, boolean) to authenticated;

-- ─── verify_anonymization_consistency: drift-check ───────────────────────
-- For hver anonymization_state-row: er master-row stadig anonymiseret?
-- Return: rapport. Daglig cron alerter ved inkonsistens.

create or replace function core_compliance.verify_anonymization_consistency()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inconsistent integer := 0;
  v_total integer := 0;
  v_details jsonb := '[]'::jsonb;
  v_state record;
  v_master_anonymized boolean;
begin
  for v_state in
    select * from core_compliance.anonymization_state
  loop
    v_total := v_total + 1;

    if v_state.entity_type = 'employee' then
      select anonymized_at is not null into v_master_anonymized
        from core_identity.employees where id = v_state.entity_id;

      if v_master_anonymized is not true then
        v_inconsistent := v_inconsistent + 1;
        v_details := v_details || jsonb_build_object(
          'entity_type', v_state.entity_type,
          'entity_id', v_state.entity_id,
          'anonymized_at', v_state.anonymized_at,
          'issue', case
            when v_master_anonymized is null then 'master-row mangler'
            else 'master-row har anonymized_at=NULL trods log'
          end
        );
      end if;
    end if;
  end loop;

  return jsonb_build_object(
    'checked_at', now(),
    'total_state_rows', v_total,
    'inconsistent_count', v_inconsistent,
    'is_consistent', v_inconsistent = 0,
    'details', v_details
  );
end;
$$;

revoke all on function core_compliance.verify_anonymization_consistency() from public;
grant execute on function core_compliance.verify_anonymization_consistency() to authenticated, service_role;
