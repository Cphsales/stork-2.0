-- Trin 10 T10.5: omskrive core_compliance.audit_filter_values med clients-fields-jsonb-walking
--
-- T1's audit_filter_values (20260514120006:9-86) walker kun top-level kolonner og
-- hashes pii_level='direct'. Trin 10 udvider med special-case for core_identity.clients:
-- walker fields-jsonb-keys og hashes hver key der har pii_level='direct' i
-- client_field_definitions.
--
-- V2-fix (Codex V1 KRITISK-SIKKERHEDSHUL): INGEN is_active-filter på direct-PII keys.
-- Hashes alle direct-PII definitioner uanset is_active for at undgå datalæk når
-- felt deaktiveres med eksisterende værdier stadig i clients.fields.
--
-- STABLE SECURITY DEFINER + set search_path = '' (matcher T1-pattern).
-- Resten af T1-logik bevares uændret (top-level walking + unclassified-check).

create or replace function core_compliance.audit_filter_values(
  p_schema text,
  p_table text,
  p_values jsonb
)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_result jsonb := p_values;
  v_def record;
  v_strict boolean := current_setting('stork.audit_filter_strict', true) = 'true';
  v_has_defs boolean;
  v_key text;
  v_fields jsonb;
  v_field_key text;
  v_field_value jsonb;
begin
  if p_values is null then
    return null;
  end if;

  -- Tjek om tabellen har klassificering.
  select exists (
    select 1 from core_compliance.data_field_definitions
    where table_schema = p_schema and table_name = p_table
  ) into v_has_defs;

  if not v_has_defs then
    if v_strict then
      raise exception 'audit_filter_values: ingen klassificering for %.%', p_schema, p_table
        using errcode = 'P0001';
    else
      raise warning 'audit_filter_values: ingen klassificering for %.% — værdier bevaret uændret', p_schema, p_table;
      return p_values;
    end if;
  end if;

  -- Walker top-level kolonner og hashes direct-PII (uændret T1-logik).
  for v_def in
    select column_name, pii_level
    from core_compliance.data_field_definitions
    where table_schema = p_schema and table_name = p_table
  loop
    if p_values ? v_def.column_name then
      if v_def.pii_level = 'direct' then
        v_result := jsonb_set(
          v_result,
          array[v_def.column_name],
          to_jsonb(
            'sha256:' ||
            encode(extensions.digest((p_values->>v_def.column_name)::text, 'sha256'), 'hex')
          )
        );
      end if;
    end if;
  end loop;

  -- Trin 10 clients-special-case: walker clients.fields jsonb og hashes direct-PII keys
  -- pr. client_field_definitions. V2 (Codex V1 KRITISK-SIKKERHEDSHUL): hashes
  -- ALLE direct-PII definitioner, uafhængigt af is_active — ellers ville deaktivering
  -- af et felt skabe datalæk for værdier der allerede ligger i eksisterende fields.
  -- T10.1's clients_fields_is_object-CHECK garanterer at fields er object her,
  -- men defensiv jsonb_typeof-tjek bevares.
  if p_schema = 'core_identity'
     and p_table = 'clients'
     and v_result ? 'fields'
     and jsonb_typeof(v_result -> 'fields') = 'object' then
    v_fields := v_result -> 'fields';
    for v_field_key in
      select key from core_identity.client_field_definitions
      where pii_level = 'direct'
    loop
      if v_fields ? v_field_key then
        v_field_value := v_fields -> v_field_key;
        if jsonb_typeof(v_field_value) is distinct from 'null' then
          v_fields := jsonb_set(
            v_fields,
            array[v_field_key],
            to_jsonb('sha256:' || encode(extensions.digest(v_field_value::text, 'sha256'), 'hex'))
          );
        end if;
      end if;
    end loop;
    v_result := jsonb_set(v_result, array['fields'], v_fields);
  end if;

  -- Tjek for ukendte kolonner (uændret T1-logik).
  for v_key in select jsonb_object_keys(p_values) loop
    if not exists (
      select 1 from core_compliance.data_field_definitions d
      where d.table_schema = p_schema
        and d.table_name = p_table
        and d.column_name = v_key
    ) then
      if v_strict then
        raise exception 'audit_filter_values: ukendt kolonne %.%.% i input', p_schema, p_table, v_key
          using errcode = 'P0001';
      else
        raise warning 'audit_filter_values: ukendt kolonne %.%.% — værdi bevaret uændret', p_schema, p_table, v_key;
      end if;
    end if;
  end loop;

  return v_result;
end;
$$;

comment on function core_compliance.audit_filter_values(text, text, jsonb) is
  'T10.5 (V2 Codex V1 KRITISK-SIKKERHEDSHUL): T1-logik + core_identity.clients-special-case (jsonb-walking af fields for direct-PII keys pr. client_field_definitions; INGEN is_active-filter for at undgå datalæk ved felt-deaktivering). LENIENT-default; strict via stork.audit_filter_strict.';
