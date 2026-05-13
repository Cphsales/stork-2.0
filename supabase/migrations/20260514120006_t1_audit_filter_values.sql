-- Trin 1 / fundament — audit_filter_values med PII-hashing.
--
-- Master-plan §1.3: pii_level='direct' hashes til sha256 før audit-skrivning.
-- Andre værdier (none/indirect) bevares i klar.
--
-- LENIENT-default: ukendt schema/table eller ukendt kolonne → WARNING, bevarer
-- værdier uændret. Strict-mode via session-var stork.audit_filter_strict='true'.

create or replace function core_compliance.audit_filter_values(
  p_schema text,
  p_table text,
  p_values jsonb
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb := p_values;
  v_def record;
  v_strict boolean := current_setting('stork.audit_filter_strict', true) = 'true';
  v_has_defs boolean;
  v_key text;
begin
  if p_values is null then
    return null;
  end if;

  -- Tjek om tabellen overhovedet har klassificering.
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

  -- Walker hver kolonne i p_values; hashes hvis pii_level='direct'.
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

  -- Tjek for ukendte kolonner i p_values (kolonner uden klassificering)
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
  'Master-plan §1.3 PII-filter. pii_level=direct hashes til sha256:<hex>. LENIENT-default — strict via stork.audit_filter_strict=true.';

revoke all on function core_compliance.audit_filter_values(text, text, jsonb) from public;
grant execute on function core_compliance.audit_filter_values(text, text, jsonb) to service_role, authenticated;
