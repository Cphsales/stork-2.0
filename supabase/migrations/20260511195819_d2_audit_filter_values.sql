-- D2: Omdefinerer audit_filter_values() fra C2-passthrough-stub til
-- faktisk PII-filter der hasher pii_level='direct'-kolonner via SHA256.
--
-- Læser klassifikation fra public.data_field_definitions (D1-tabel,
-- D1.5-seedet). Funktionen kaldes af stork_audit() før INSERT i
-- audit_log — direct PII bliver dermed aldrig skrevet i klar.
--
-- LENIENT-default (Phase 1, indtil D6):
--   - Hvis tabellen ikke har klassifikation: returnér uændret + WARNING
--   - Hvis kolonner i jsonb ikke har klassifikation: returnér uændret + WARNING
--   - Kolonner med pii_level='none' eller 'indirect': returneres uændret
--   - Kolonner med pii_level='direct': hashes til 'sha256:<hex>'
--
-- Strict-mode aktiveres ved at sætte session-var stork.audit_filter_strict='true'
-- (D6 globaliserer dette). Strict raisers EXCEPTION i stedet for WARNING ved
-- uklassificeret tabel/kolonne.
--
-- Function-attribut-skift fra C2:
--   - LANGUAGE sql → LANGUAGE plpgsql (kontrolflow nødvendigt)
--   - IMMUTABLE → STABLE (læser data_field_definitions; stabil inden for
--     transaktion, men kan ændre sig mellem transaktioner)
--
-- pgcrypto's digest() ligger i extensions schema. Med SET search_path = ''
-- fully-qualifies vi som extensions.digest().

CREATE OR REPLACE FUNCTION public.audit_filter_values(
  p_table_schema text,
  p_table_name text,
  p_values jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result jsonb := p_values;
  v_direct_columns text[];
  v_classified_columns text[];
  v_unclassified text[];
  v_strict boolean;
  v_col text;
  v_value jsonb;
BEGIN
  IF p_values IS NULL THEN
    RETURN NULL;
  END IF;

  v_strict := COALESCE(
    nullif(current_setting('stork.audit_filter_strict', true), ''),
    'false'
  ) = 'true';

  -- Hent klassifikation pr. (schema, table) i én lookup
  SELECT
    array_agg(column_name) FILTER (WHERE pii_level = 'direct'),
    array_agg(column_name)
  INTO v_direct_columns, v_classified_columns
  FROM public.data_field_definitions
  WHERE table_schema = p_table_schema
    AND table_name = p_table_name;

  -- Case 1: Tabellen har ingen klassifikation overhovedet
  IF v_classified_columns IS NULL THEN
    IF v_strict THEN
      RAISE EXCEPTION 'audit_filter_values: tabel %.% har ingen klassifikation (stork.audit_filter_strict=true)',
        p_table_schema, p_table_name
        USING ERRCODE = '23514';
    ELSE
      RAISE WARNING 'audit_filter_values: tabel %.% har ingen klassifikation (LENIENT — værdier returneres uændret)',
        p_table_schema, p_table_name;
      RETURN p_values;
    END IF;
  END IF;

  -- Case 2: Hash 'direct'-kolonner der findes i jsonb
  IF v_direct_columns IS NOT NULL THEN
    FOREACH v_col IN ARRAY v_direct_columns LOOP
      IF v_result ? v_col THEN
        v_value := v_result -> v_col;
        -- jsonb-null forbliver null; ingen mening at hashe streng 'null'
        IF jsonb_typeof(v_value) IS DISTINCT FROM 'null' THEN
          v_result := jsonb_set(
            v_result,
            ARRAY[v_col],
            to_jsonb('sha256:' || encode(extensions.digest(v_value::text, 'sha256'), 'hex'))
          );
        END IF;
      END IF;
    END LOOP;
  END IF;

  -- Case 3: Opdage kolonner i jsonb der ikke er klassificeret
  SELECT array_agg(key ORDER BY key)
    INTO v_unclassified
    FROM jsonb_each(p_values) AS n(key, value)
    WHERE NOT (n.key = ANY(v_classified_columns));

  IF v_unclassified IS NOT NULL AND array_length(v_unclassified, 1) > 0 THEN
    IF v_strict THEN
      RAISE EXCEPTION 'audit_filter_values: uklassificerede kolonner i %.%: % (stork.audit_filter_strict=true)',
        p_table_schema, p_table_name, v_unclassified
        USING ERRCODE = '23514';
    ELSE
      RAISE WARNING 'audit_filter_values: uklassificerede kolonner i %.% (LENIENT — værdier returneres uændret): %',
        p_table_schema, p_table_name, v_unclassified;
    END IF;
  END IF;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.audit_filter_values(text, text, jsonb) IS
  'D2: PII-filter for stork_audit(). Hasher pii_level=direct kolonner via SHA256 (prefix sha256:). LENIENT-default: WARNING ved uklassificeret tabel/kolonne, værdier returneres uændret. Strict: stork.audit_filter_strict=true → RAISE. D6 globaliserer strict.';

REVOKE ALL ON FUNCTION public.audit_filter_values(text, text, jsonb) FROM PUBLIC, anon;
-- Ingen GRANT — kaldes kun af stork_audit() via SECURITY DEFINER chain.
