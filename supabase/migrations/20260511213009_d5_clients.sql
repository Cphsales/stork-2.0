-- D5: clients + client_field_definitions + audit_filter_values-udvidelse
--
-- Princip: client-felter er UI-konfigurerbare. Schema er fælles
-- (clients har fast id/name/fields/anonymized_at/audit-felter), men
-- INDHOLD af clients.fields jsonb defineres via client_field_definitions
-- og kan ændres uden migration.
--
-- name er top-level fordi det er master-identifikator (UI viser navn
-- først, indeksering, NOT NULL). Alt andet PII (email, phone, adresse,
-- CVR m.fl.) lever i fields jsonb og defineres pr. felt i UI.
--
-- D5 introducerer INGEN klient-felt-definitioner og INGEN klient-rækker.
-- Mathias opretter via UI eller direct RPC efter D5 lander.
--
-- audit_filter_values udvides med client-special-case (Option A):
--   For (public, clients) walk i fields jsonb og hash hver key der har
--   pii_level='direct' AND is_active=true i client_field_definitions.
--   Resten af D2-logikken bevares uændret.
--
-- field_type i client_field_definitions er fri-tekst (ingen CHECK):
--   UI håndhæver formatet. Tilføj 'url' eller 'multiline_text' senere
--   = INSERT-værdi, ikke migration. (Hvis vi senere får 2-3
--   lookup-tabeller, generaliseres til public.field_types-pattern.)
--
-- Validation: clients_validate_fields-trigger logger WARNING ved
-- ukendte/inaktive keys i fields jsonb (LENIENT). Strict-mode toggle
-- via session-var stork.clients_fields_strict='true' (matcher
-- audit_filter_values' strict-pattern).

-- ─────────────────────────────────────────────────────────────────────────
-- Tabel 1: public.clients
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE public.clients (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL CHECK (length(trim(name)) > 0),
  fields        jsonb NOT NULL DEFAULT '{}'::jsonb,
  anonymized_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.clients IS
  'D5: klient-master med UI-konfigurerbart schema. name er master-identifikator (NOT NULL); alt andet PII lever i fields jsonb. Felter defineres pr. key i client_field_definitions. Aldrig DELETE - anonymisering = UPDATE af fields til hashed placeholders.';

COMMENT ON COLUMN public.clients.fields IS
  'jsonb med UI-konfigurerede klient-felter. Keys valideres mod client_field_definitions (LENIENT default). Direct-PII-keys hashes i audit_log af audit_filter_values client-special-case.';

CREATE INDEX clients_active_idx
  ON public.clients (id)
  WHERE anonymized_at IS NULL;

CREATE TRIGGER clients_set_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER clients_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.stork_audit();

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients FORCE ROW LEVEL SECURITY;

CREATE POLICY clients_select ON public.clients
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY clients_insert ON public.clients
  FOR INSERT
  WITH CHECK (current_setting('stork.allow_clients_write', true) = 'true');

CREATE POLICY clients_update ON public.clients
  FOR UPDATE
  USING (current_setting('stork.allow_clients_write', true) = 'true')
  WITH CHECK (current_setting('stork.allow_clients_write', true) = 'true');

-- DELETE: ingen policy = default deny. Anonymisering = UPDATE.

REVOKE ALL ON TABLE public.clients FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.clients TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- Tabel 2: public.client_field_definitions
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE public.client_field_definitions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key           text NOT NULL UNIQUE CHECK (length(trim(key)) > 0),
  display_name  text NOT NULL CHECK (length(trim(display_name)) > 0),
  field_type    text NOT NULL CHECK (length(trim(field_type)) > 0),
  required      bool NOT NULL DEFAULT false,
  pii_level     text NOT NULL CHECK (pii_level IN ('none', 'indirect', 'direct')),
  match_role    text,
  display_order integer NOT NULL DEFAULT 0,
  is_active     bool NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.client_field_definitions IS
  'D5: UI-konfigurerbar schema for clients.fields jsonb. key er jsonb-property-name; field_type er fri-tekst (UI hndhver). pii_level styrer hash i audit_log via audit_filter_values client-special-case. Udfasede felter sttes is_active=false (ikke DELETE).';

CREATE INDEX client_field_definitions_active_idx
  ON public.client_field_definitions (key, display_order)
  WHERE is_active = true;

CREATE INDEX client_field_definitions_direct_pii_idx
  ON public.client_field_definitions (key)
  WHERE pii_level = 'direct' AND is_active = true;

CREATE TRIGGER client_field_definitions_set_updated_at
  BEFORE UPDATE ON public.client_field_definitions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER client_field_definitions_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.client_field_definitions
  FOR EACH ROW EXECUTE FUNCTION public.stork_audit();

ALTER TABLE public.client_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_field_definitions FORCE ROW LEVEL SECURITY;

CREATE POLICY client_field_definitions_select ON public.client_field_definitions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY client_field_definitions_insert ON public.client_field_definitions
  FOR INSERT
  WITH CHECK (current_setting('stork.allow_client_field_definitions_write', true) = 'true');

CREATE POLICY client_field_definitions_update ON public.client_field_definitions
  FOR UPDATE
  USING (current_setting('stork.allow_client_field_definitions_write', true) = 'true')
  WITH CHECK (current_setting('stork.allow_client_field_definitions_write', true) = 'true');

REVOKE ALL ON TABLE public.client_field_definitions FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.client_field_definitions TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- audit_filter_values() OMSKRIVNING: D2-logik + client-special-case
-- ─────────────────────────────────────────────────────────────────────────

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
  v_fields jsonb;
  v_field_key text;
  v_field_value jsonb;
BEGIN
  IF p_values IS NULL THEN
    RETURN NULL;
  END IF;

  v_strict := COALESCE(
    nullif(current_setting('stork.audit_filter_strict', true), ''),
    'false'
  ) = 'true';

  SELECT
    array_agg(column_name) FILTER (WHERE pii_level = 'direct'),
    array_agg(column_name)
  INTO v_direct_columns, v_classified_columns
  FROM public.data_field_definitions
  WHERE table_schema = p_table_schema
    AND table_name = p_table_name;

  IF v_classified_columns IS NULL THEN
    IF v_strict THEN
      RAISE EXCEPTION 'audit_filter_values: tabel %.% har ingen klassifikation (stork.audit_filter_strict=true)',
        p_table_schema, p_table_name
        USING ERRCODE = '23514';
    ELSE
      RAISE WARNING 'audit_filter_values: tabel %.% har ingen klassifikation (LENIENT - vaerdier returneres uaendret)',
        p_table_schema, p_table_name;
      RETURN p_values;
    END IF;
  END IF;

  -- D2: hash top-level direct-PII kolonner
  IF v_direct_columns IS NOT NULL THEN
    FOREACH v_col IN ARRAY v_direct_columns LOOP
      IF v_result ? v_col THEN
        v_value := v_result -> v_col;
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

  -- D5 special-case: walk i clients.fields jsonb og hash direct-keys
  -- jf. client_field_definitions (kun aktive, kun pii_level='direct').
  IF p_table_schema = 'public'
     AND p_table_name = 'clients'
     AND v_result ? 'fields'
     AND jsonb_typeof(v_result -> 'fields') = 'object' THEN
    v_fields := v_result -> 'fields';
    FOR v_field_key IN
      SELECT key FROM public.client_field_definitions
      WHERE pii_level = 'direct' AND is_active = true
    LOOP
      IF v_fields ? v_field_key THEN
        v_field_value := v_fields -> v_field_key;
        IF jsonb_typeof(v_field_value) IS DISTINCT FROM 'null' THEN
          v_fields := jsonb_set(
            v_fields,
            ARRAY[v_field_key],
            to_jsonb('sha256:' || encode(extensions.digest(v_field_value::text, 'sha256'), 'hex'))
          );
        END IF;
      END IF;
    END LOOP;
    v_result := jsonb_set(v_result, ARRAY['fields'], v_fields);
  END IF;

  -- D2: opdage top-level uklassificerede kolonner
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
      RAISE WARNING 'audit_filter_values: uklassificerede kolonner i %.% (LENIENT - vaerdier returneres uaendret): %',
        p_table_schema, p_table_name, v_unclassified;
    END IF;
  END IF;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.audit_filter_values(text, text, jsonb) IS
  'D5: D2-logik + client-special-case. Top-level direct-PII hashes via data_field_definitions. clients.fields jsonb-walking via client_field_definitions (pii_level=direct, is_active=true).';

REVOKE ALL ON FUNCTION public.audit_filter_values(text, text, jsonb) FROM PUBLIC, anon;

-- ─────────────────────────────────────────────────────────────────────────
-- Trigger: clients_validate_fields (LENIENT default)
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.clients_validate_fields()
RETURNS trigger
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_strict boolean;
  v_unknown_keys text[];
BEGIN
  IF NEW.fields IS NULL OR jsonb_typeof(NEW.fields) <> 'object' THEN
    RETURN NEW;
  END IF;

  v_strict := COALESCE(
    nullif(current_setting('stork.clients_fields_strict', true), ''),
    'false'
  ) = 'true';

  SELECT array_agg(n.key ORDER BY n.key)
    INTO v_unknown_keys
    FROM jsonb_each(NEW.fields) AS n(key, value)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.client_field_definitions cfd
      WHERE cfd.key = n.key AND cfd.is_active = true
    );

  IF v_unknown_keys IS NOT NULL AND array_length(v_unknown_keys, 1) > 0 THEN
    IF v_strict THEN
      RAISE EXCEPTION 'clients_validate_fields: ukendte/inaktive keys i fields: % (stork.clients_fields_strict=true)',
        v_unknown_keys
        USING ERRCODE = '23514';
    ELSE
      RAISE WARNING 'clients_validate_fields: ukendte/inaktive keys i fields (LENIENT - INSERT/UPDATE accepteret): %',
        v_unknown_keys;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.clients_validate_fields() IS
  'D5: BEFORE INSERT/UPDATE trigger. LENIENT default: WARNING ved ukendte/inaktive keys i fields. Strict mode via stork.clients_fields_strict=true.';

CREATE TRIGGER clients_validate_fields
  BEFORE INSERT OR UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.clients_validate_fields();

-- ─────────────────────────────────────────────────────────────────────────
-- RPC: client_upsert
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.client_upsert(
  p_name text,
  p_fields jsonb,
  p_change_reason text,
  p_client_id uuid DEFAULT NULL
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
    RAISE EXCEPTION 'client_upsert: insufficient permissions'
      USING ERRCODE = '42501';
  END IF;
  IF p_change_reason IS NULL OR length(trim(p_change_reason)) = 0 THEN
    RAISE EXCEPTION 'client_upsert: change_reason er paakraevet';
  END IF;
  IF p_name IS NULL OR length(trim(p_name)) = 0 THEN
    RAISE EXCEPTION 'client_upsert: name er paakraevet';
  END IF;

  PERFORM set_config('stork.source_type', 'manual', true);
  PERFORM set_config('stork.change_reason', p_change_reason, true);
  PERFORM set_config('stork.allow_clients_write', 'true', true);

  IF p_client_id IS NULL THEN
    INSERT INTO public.clients (name, fields)
    VALUES (p_name, COALESCE(p_fields, '{}'::jsonb))
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.clients
    SET name = p_name,
        fields = COALESCE(p_fields, '{}'::jsonb)
    WHERE id = p_client_id
      AND anonymized_at IS NULL
    RETURNING id INTO v_id;
    IF v_id IS NULL THEN
      RAISE EXCEPTION 'client_upsert: client % findes ikke eller er anonymiseret', p_client_id;
    END IF;
  END IF;

  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION public.client_upsert(text, jsonb, text, uuid) IS
  'D5: SECURITY DEFINER upsert af clients. p_client_id NULL = INSERT, ellers UPDATE. UPDATE blokeret hvis anonymized_at IS NOT NULL. is_admin()-check.';

REVOKE ALL ON FUNCTION public.client_upsert(text, jsonb, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.client_upsert(text, jsonb, text, uuid) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- RPC: client_field_definition_upsert
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.client_field_definition_upsert(
  p_key text,
  p_display_name text,
  p_field_type text,
  p_pii_level text,
  p_change_reason text,
  p_required bool DEFAULT false,
  p_match_role text DEFAULT NULL,
  p_display_order integer DEFAULT 0,
  p_is_active bool DEFAULT true,
  p_field_id uuid DEFAULT NULL
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
    RAISE EXCEPTION 'client_field_definition_upsert: insufficient permissions'
      USING ERRCODE = '42501';
  END IF;
  IF p_change_reason IS NULL OR length(trim(p_change_reason)) = 0 THEN
    RAISE EXCEPTION 'client_field_definition_upsert: change_reason er paakraevet';
  END IF;
  IF p_pii_level NOT IN ('none', 'indirect', 'direct') THEN
    RAISE EXCEPTION 'client_field_definition_upsert: pii_level skal vaere none/indirect/direct';
  END IF;

  PERFORM set_config('stork.source_type', 'manual', true);
  PERFORM set_config('stork.change_reason', p_change_reason, true);
  PERFORM set_config('stork.allow_client_field_definitions_write', 'true', true);

  IF p_field_id IS NULL THEN
    INSERT INTO public.client_field_definitions
      (key, display_name, field_type, required, pii_level, match_role, display_order, is_active)
    VALUES
      (p_key, p_display_name, p_field_type, p_required, p_pii_level, p_match_role, p_display_order, p_is_active)
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.client_field_definitions
    SET key = p_key,
        display_name = p_display_name,
        field_type = p_field_type,
        required = p_required,
        pii_level = p_pii_level,
        match_role = p_match_role,
        display_order = p_display_order,
        is_active = p_is_active
    WHERE id = p_field_id
    RETURNING id INTO v_id;
    IF v_id IS NULL THEN
      RAISE EXCEPTION 'client_field_definition_upsert: field % findes ikke', p_field_id;
    END IF;
  END IF;

  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION public.client_field_definition_upsert(text, text, text, text, text, bool, text, integer, bool, uuid) IS
  'D5: SECURITY DEFINER upsert af client_field_definitions. p_field_id NULL = INSERT, ellers UPDATE. Duplikat-key giver unique_violation (intentional). is_admin()-check.';

REVOKE ALL ON FUNCTION public.client_field_definition_upsert(text, text, text, text, text, bool, text, integer, bool, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.client_field_definition_upsert(text, text, text, text, text, bool, text, integer, bool, uuid) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- Klassifikation: 17 nye rækker i data_field_definitions
-- ─────────────────────────────────────────────────────────────────────────

SELECT set_config('stork.source_type', 'manual', true);
SELECT set_config('stork.change_reason',
  'D5: seed klassifikation for clients (6 kolonner) + client_field_definitions (11 kolonner)', true);
SELECT set_config('stork.allow_data_field_definitions_write', 'true', true);

INSERT INTO public.data_field_definitions
  (table_schema, table_name, column_name, category, pii_level,
   retention_type, retention_value, match_role, purpose)
VALUES
  -- clients (6 kolonner)
  ('public', 'clients', 'id',
    'master_data', 'none',
    'manual', '{"event": "row_anonymized"}'::jsonb, NULL,
    'Client PK; bevares evigt for FK-integritet'),
  ('public', 'clients', 'name',
    'master_data', 'direct',
    'manual', '{"event": "row_anonymized"}'::jsonb, NULL,
    'Klient-navn (UI-required); hashes i audit via D2 top-level-logik'),
  ('public', 'clients', 'fields',
    'master_data', 'indirect',
    'manual', '{"event": "row_anonymized"}'::jsonb, NULL,
    'jsonb med UI-konfigurerede klient-felter; direct-keys hashes pr. client_field_definitions i audit_filter_values client-special-case'),
  ('public', 'clients', 'anonymized_at',
    'master_data', 'none',
    'manual', '{"event": "row_anonymized"}'::jsonb, NULL,
    'Tidsstempel for anonymisering; NULL = aktiv'),
  ('public', 'clients', 'created_at',
    'master_data', 'none',
    'manual', '{"event": "row_anonymized"}'::jsonb, NULL,
    'INSERT-tid'),
  ('public', 'clients', 'updated_at',
    'master_data', 'none',
    'manual', '{"event": "row_anonymized"}'::jsonb, NULL,
    'Sidste mutation; opdateres af set_updated_at()'),

  -- client_field_definitions (11 kolonner)
  ('public', 'client_field_definitions', 'id',
    'konfiguration', 'none',
    'manual', '{"event": "field_deleted"}'::jsonb, NULL,
    'Field-definition PK'),
  ('public', 'client_field_definitions', 'key',
    'konfiguration', 'none',
    'manual', '{"event": "field_deleted"}'::jsonb, NULL,
    'jsonb-property-name i clients.fields; UNIQUE'),
  ('public', 'client_field_definitions', 'display_name',
    'konfiguration', 'none',
    'manual', '{"event": "field_deleted"}'::jsonb, NULL,
    'UI-label for feltet'),
  ('public', 'client_field_definitions', 'field_type',
    'konfiguration', 'none',
    'manual', '{"event": "field_deleted"}'::jsonb, NULL,
    'Fri-tekst type-identifier (text/email/phone/url/...); UI haandhever format'),
  ('public', 'client_field_definitions', 'required',
    'konfiguration', 'none',
    'manual', '{"event": "field_deleted"}'::jsonb, NULL,
    'Om feltet skal vaere sat ved INSERT (UI-validering)'),
  ('public', 'client_field_definitions', 'pii_level',
    'konfiguration', 'none',
    'manual', '{"event": "field_deleted"}'::jsonb, NULL,
    'PII-niveau for jsonb-key. direct hashes i audit_filter_values'),
  ('public', 'client_field_definitions', 'match_role',
    'konfiguration', 'none',
    'manual', '{"event": "field_deleted"}'::jsonb, NULL,
    'Match-strategi-key (lag E). NULL = ingen match-deltagelse'),
  ('public', 'client_field_definitions', 'display_order',
    'konfiguration', 'none',
    'manual', '{"event": "field_deleted"}'::jsonb, NULL,
    'UI-sortering'),
  ('public', 'client_field_definitions', 'is_active',
    'konfiguration', 'none',
    'manual', '{"event": "field_deleted"}'::jsonb, NULL,
    'Aktiv-flag; false = udfaset (ikke DELETE)'),
  ('public', 'client_field_definitions', 'created_at',
    'konfiguration', 'none',
    'manual', '{"event": "field_deleted"}'::jsonb, NULL,
    'INSERT-tid'),
  ('public', 'client_field_definitions', 'updated_at',
    'konfiguration', 'none',
    'manual', '{"event": "field_deleted"}'::jsonb, NULL,
    'Sidste mutation');
