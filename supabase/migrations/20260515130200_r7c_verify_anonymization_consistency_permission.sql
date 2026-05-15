-- R7c: verify_anonymization_consistency tilfoejer has_permission-check.
--
-- BAGGRUND (Codex v1 Fund #7):
-- verify_anonymization_consistency() har NO permission check overhovedet.
-- Anyone authenticated kan kalde den og se anonymization-state.
-- Konfirmeret af V2-recon (status_check_status = "NO status-check" + NO auth).
--
-- Q-pakken konverterede ikke denne RPC. Det er den 22. RPC der missede
-- konversionen ("20 vs 22"-uoverensstemmelse).
--
-- FIX:
-- - Tilfoej has_permission('audit', 'verify_anonymization', false)
-- - Cron-bypass: hvis stork.source_type='cron' (sat af jobid=3 cron-body),
--   skip permission-check. Cron koerer som postgres-owner.
-- - R7d-tilfoej: kraev mapping.status='active' (i samme RPC for at undgaa
--   dobbelt-pass).
-- - Q-SEED: ('audit', 'verify_anonymization', true, false) til superadmin.

create or replace function core_compliance.verify_anonymization_consistency()
returns jsonb
language plpgsql security definer set search_path = ''
as $function$
declare
  v_state record; v_mapping core_compliance.anonymization_mappings;
  v_total integer := 0; v_inconsistent integer := 0;
  v_details jsonb := '[]'::jsonb; v_master_anonymized boolean; v_check_sql text;
begin
  -- R7c: permission-check (cron-bypass for source_type='cron')
  if coalesce(current_setting('stork.source_type', true), '') <> 'cron' then
    if not core_identity.has_permission('audit', 'verify_anonymization', false) then
      raise exception 'verify_anonymization_consistency kraever permission audit.verify_anonymization'
        using errcode = '42501';
    end if;
  end if;

  for v_state in select * from core_compliance.anonymization_state loop
    v_total := v_total + 1;
    -- R7d: kraev status='active' (ikke kun is_active=true)
    select * into v_mapping from core_compliance.anonymization_mappings
     where entity_type = v_state.entity_type and status = 'active' and is_active = true;
    if v_mapping.id is null then
      v_inconsistent := v_inconsistent + 1;
      v_details := v_details || jsonb_build_object(
        'entity_type', v_state.entity_type, 'entity_id', v_state.entity_id,
        'issue', 'ingen aktiveret anonymization_mapping for entity_type');
      continue;
    end if;
    v_check_sql := format('select %I is not null from %I.%I where id = $1',
      v_mapping.anonymized_check_column, v_mapping.table_schema, v_mapping.table_name);
    begin
      execute v_check_sql using v_state.entity_id into v_master_anonymized;
    exception when others then
      v_inconsistent := v_inconsistent + 1;
      v_details := v_details || jsonb_build_object(
        'entity_type', v_state.entity_type, 'entity_id', v_state.entity_id,
        'issue', 'master-check fejlede: ' || sqlerrm);
      continue;
    end;
    if v_master_anonymized is null then
      v_inconsistent := v_inconsistent + 1;
      v_details := v_details || jsonb_build_object(
        'entity_type', v_state.entity_type, 'entity_id', v_state.entity_id,
        'anonymized_at', v_state.anonymized_at, 'issue', 'master-row mangler');
    elsif not v_master_anonymized then
      v_inconsistent := v_inconsistent + 1;
      v_details := v_details || jsonb_build_object(
        'entity_type', v_state.entity_type, 'entity_id', v_state.entity_id,
        'anonymized_at', v_state.anonymized_at,
        'issue', 'master-row har ' || v_mapping.anonymized_check_column || '=NULL trods log');
    end if;
  end loop;
  return jsonb_build_object('checked_at', now(), 'total_state_rows', v_total,
    'inconsistent_count', v_inconsistent, 'is_consistent', v_inconsistent = 0, 'details', v_details);
end;
$function$;

comment on function core_compliance.verify_anonymization_consistency() is
  'R7c: tilfoejet has_permission(audit, verify_anonymization, false) + cron-bypass. R7d-tilfoej: kraever mapping.status=active.';

-- ─── Q-SEED-permission til superadmin ──────────────────────────────────────
select set_config('stork.source_type', 'migration', false);
select set_config('stork.allow_role_page_permissions_write', 'true', false);
select set_config('stork.change_reason',
  'R7c: tilfoej audit.verify_anonymization-permission til superadmin', false);

insert into core_identity.role_page_permissions (role_id, page_key, tab_key, can_view, can_edit, scope)
select (select id from core_identity.roles where name = 'superadmin'),
       'audit', 'verify_anonymization', true, false, 'all'
on conflict (role_id, page_key, coalesce(tab_key, '')) do nothing;
