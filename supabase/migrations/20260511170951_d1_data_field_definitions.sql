-- D1: data_field_definitions — klassifikations-tabel for kolonner pr. kilde.
--
-- Per Mathias' U3 (kategorier låst som enum i kode):
--   category: operationel / konfiguration / master_data / audit / raw_payload
--
-- Per typesystemet:
--   pii_level: none / indirect / direct (LÅST 3-niveauer)
--
-- Per Mathias' H4 (retention-types):
--   retention_type: time_based / event_based / legal / manual (LÅST 4-niveauer)
--   retention_value jsonb struktur valideret pr. type via trigger:
--     time_based:  {max_days: integer}
--     event_based: {event: text, days_after: integer}
--     legal:       {max_days: integer}  (lovgivning er fast MAKS, kan ikke forlænges)
--     manual:      {max_days: integer} eller {event: text}
--
-- Kolonne-pr-kilde: UNIQUE(schema, table, column). Eesy.customer_id og
-- TDC.customer_id har hver deres række (forskellige retention-aftaler).
--
-- match_role: per kolonne-per-kilde. Frit text-felt nu — konkrete strategies
-- (phone-match, opp-match, composite for MBB osv.) defineres i lag E.
--
-- purpose: fri tekst, NOT NULL — påkrævet kontekst for audit.
--
-- D1 opretter KUN tabel + RPCs. classification.json fortsætter at være
-- single source of truth for migration-gate indtil D6 migrer fil → tabel.

CREATE TABLE public.data_field_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_schema text NOT NULL,
  table_name text NOT NULL,
  column_name text NOT NULL,
  category text NOT NULL
    CHECK (category IN ('operationel', 'konfiguration', 'master_data', 'audit', 'raw_payload')),
  pii_level text NOT NULL
    CHECK (pii_level IN ('none', 'indirect', 'direct')),
  retention_type text
    CHECK (retention_type IN ('time_based', 'event_based', 'legal', 'manual')),
  retention_value jsonb,
  match_role text,
  purpose text NOT NULL CHECK (length(trim(purpose)) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT data_field_definitions_unique UNIQUE (table_schema, table_name, column_name),
  CONSTRAINT data_field_definitions_retention_consistency CHECK (
    (retention_type IS NULL AND retention_value IS NULL) OR
    (retention_type IS NOT NULL AND retention_value IS NOT NULL)
  )
);

COMMENT ON TABLE public.data_field_definitions IS
  'D1: klassifikations-registry pr. kolonne pr. kilde. Erstattes ikke; lag D6 importerer eksisterende classification.json hertil og flipper migration-gate til Phase 2 (strict).';

CREATE INDEX data_field_definitions_pii_idx
  ON public.data_field_definitions (pii_level)
  WHERE pii_level <> 'none';

CREATE INDEX data_field_definitions_category_idx
  ON public.data_field_definitions (category);

-- ─────────────────────────────────────────────────────────────────────────
-- retention_value-struktur validation pr. retention_type
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.data_field_definitions_validate_retention()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.retention_type IS NULL THEN
    RETURN NEW;
  END IF;

  CASE NEW.retention_type
    WHEN 'time_based' THEN
      IF NOT (NEW.retention_value ? 'max_days'
              AND jsonb_typeof(NEW.retention_value->'max_days') = 'number'
              AND (NEW.retention_value->>'max_days')::integer > 0) THEN
        RAISE EXCEPTION 'data_field_definitions: retention_type=time_based kræver retention_value med {"max_days": positive integer}';
      END IF;
    WHEN 'event_based' THEN
      IF NOT (NEW.retention_value ? 'event'
              AND jsonb_typeof(NEW.retention_value->'event') = 'string'
              AND length(NEW.retention_value->>'event') > 0
              AND NEW.retention_value ? 'days_after'
              AND jsonb_typeof(NEW.retention_value->'days_after') = 'number'
              AND (NEW.retention_value->>'days_after')::integer >= 0) THEN
        RAISE EXCEPTION 'data_field_definitions: retention_type=event_based kræver {"event": non-empty string, "days_after": non-negative integer}';
      END IF;
    WHEN 'legal' THEN
      IF NOT (NEW.retention_value ? 'max_days'
              AND jsonb_typeof(NEW.retention_value->'max_days') = 'number'
              AND (NEW.retention_value->>'max_days')::integer > 0) THEN
        RAISE EXCEPTION 'data_field_definitions: retention_type=legal kræver {"max_days": positive integer} (lovgivning er fast MAKS)';
      END IF;
    WHEN 'manual' THEN
      IF NOT (
        (NEW.retention_value ? 'max_days'
         AND jsonb_typeof(NEW.retention_value->'max_days') = 'number'
         AND (NEW.retention_value->>'max_days')::integer > 0)
        OR
        (NEW.retention_value ? 'event'
         AND jsonb_typeof(NEW.retention_value->'event') = 'string'
         AND length(NEW.retention_value->>'event') > 0)
      ) THEN
        RAISE EXCEPTION 'data_field_definitions: retention_type=manual kræver enten {"max_days": positive integer} eller {"event": non-empty string}';
      END IF;
  END CASE;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.data_field_definitions_validate_retention() IS
  'D1: BEFORE INSERT/UPDATE-trigger der validerer retention_value-struktur mod retention_type per Mathias H4-skema.';

CREATE TRIGGER data_field_definitions_validate_retention
  BEFORE INSERT OR UPDATE ON public.data_field_definitions
  FOR EACH ROW EXECUTE FUNCTION public.data_field_definitions_validate_retention();

CREATE TRIGGER data_field_definitions_set_updated_at
  BEFORE UPDATE ON public.data_field_definitions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER data_field_definitions_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.data_field_definitions
  FOR EACH ROW EXECUTE FUNCTION public.stork_audit();

-- ─────────────────────────────────────────────────────────────────────────
-- RLS: FORCE Variant B
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE public.data_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_field_definitions FORCE ROW LEVEL SECURITY;

-- SELECT åben for authenticated (metadata, ikke selv PII)
CREATE POLICY data_field_definitions_select ON public.data_field_definitions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY data_field_definitions_insert ON public.data_field_definitions
  FOR INSERT
  WITH CHECK (current_setting('stork.allow_data_field_definitions_write', true) = 'true');

CREATE POLICY data_field_definitions_update ON public.data_field_definitions
  FOR UPDATE
  USING (current_setting('stork.allow_data_field_definitions_write', true) = 'true')
  WITH CHECK (current_setting('stork.allow_data_field_definitions_write', true) = 'true');

CREATE POLICY data_field_definitions_delete ON public.data_field_definitions
  FOR DELETE
  USING (current_setting('stork.allow_data_field_definitions_write', true) = 'true');

REVOKE ALL ON TABLE public.data_field_definitions FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.data_field_definitions TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- Write RPCs (admin-only via is_admin() — C1-stub returnerer false indtil D4)
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.data_field_definition_upsert(
  p_table_schema text,
  p_table_name text,
  p_column_name text,
  p_category text,
  p_pii_level text,
  p_purpose text,
  p_retention_type text DEFAULT NULL,
  p_retention_value jsonb DEFAULT NULL,
  p_match_role text DEFAULT NULL,
  p_change_reason text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'data_field_definition_upsert: insufficient permissions'
      USING ERRCODE = '42501';
  END IF;
  IF p_change_reason IS NULL OR length(trim(p_change_reason)) = 0 THEN
    RAISE EXCEPTION 'data_field_definition_upsert: change_reason er påkrævet';
  END IF;

  PERFORM set_config('stork.source_type', 'manual', true);
  PERFORM set_config('stork.change_reason', p_change_reason, true);
  PERFORM set_config('stork.allow_data_field_definitions_write', 'true', true);

  INSERT INTO public.data_field_definitions (
    table_schema, table_name, column_name,
    category, pii_level, retention_type, retention_value, match_role, purpose
  )
  VALUES (
    p_table_schema, p_table_name, p_column_name,
    p_category, p_pii_level, p_retention_type, p_retention_value, p_match_role, p_purpose
  )
  ON CONFLICT (table_schema, table_name, column_name) DO UPDATE
  SET category = EXCLUDED.category,
      pii_level = EXCLUDED.pii_level,
      retention_type = EXCLUDED.retention_type,
      retention_value = EXCLUDED.retention_value,
      match_role = EXCLUDED.match_role,
      purpose = EXCLUDED.purpose
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION public.data_field_definition_upsert(text, text, text, text, text, text, text, jsonb, text, text) IS
  'D1: SECURITY DEFINER upsert. Kræver is_admin() (C1-stub afviser indtil D4). change_reason påkrævet for audit.';

REVOKE ALL ON FUNCTION public.data_field_definition_upsert(text, text, text, text, text, text, text, jsonb, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.data_field_definition_upsert(text, text, text, text, text, text, text, jsonb, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.data_field_definition_delete(
  p_table_schema text,
  p_table_name text,
  p_column_name text,
  p_change_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'data_field_definition_delete: insufficient permissions'
      USING ERRCODE = '42501';
  END IF;
  IF p_change_reason IS NULL OR length(trim(p_change_reason)) = 0 THEN
    RAISE EXCEPTION 'data_field_definition_delete: change_reason er påkrævet';
  END IF;

  PERFORM set_config('stork.source_type', 'manual', true);
  PERFORM set_config('stork.change_reason', p_change_reason, true);
  PERFORM set_config('stork.allow_data_field_definitions_write', 'true', true);

  DELETE FROM public.data_field_definitions
  WHERE table_schema = p_table_schema
    AND table_name = p_table_name
    AND column_name = p_column_name;
END;
$$;

COMMENT ON FUNCTION public.data_field_definition_delete(text, text, text, text) IS
  'D1: SECURITY DEFINER delete. Kræver is_admin() + change_reason.';

REVOKE ALL ON FUNCTION public.data_field_definition_delete(text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.data_field_definition_delete(text, text, text, text) TO authenticated;
