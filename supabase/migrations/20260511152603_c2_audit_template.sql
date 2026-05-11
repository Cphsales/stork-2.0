-- C2: Audit-trigger-template — immutable audit_log + reusable stork_audit() trigger.
--
-- Erstatter 1.0's amo_audit_log-mønster. Forbedringer fra round-3-critique:
--   - source_type 6-værdi-enum (manual/cron/webhook/trigger_cascade/service_role/unknown)
--   - change_reason (session-var-styret)
--   - schema_version (session-var-styret, replay-stabilitet)
--   - changed_columns text[] (UPDATE-diff)
--   - trigger_depth (debug)
--   - PII-filter-hook (audit_filter_values, stub i C2, lag D omdefinerer)
--   - audit_log_read() SECURITY DEFINER RPC med is_admin()-check
--   - Strikt access: REVOKE ALL fra alle non-owner-roller, ingen policies
--
-- Audit-failure-policy: hvis stork_audit() RAISE, bobler det op til main
-- transaction → main rulles tilbage. Ingen "audit failover". Compliance
-- kræver vores adgangslog (M5 fra session-doc).

-- ─────────────────────────────────────────────────────────────────────────
-- audit_log: append-only system-tabel
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE public.audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  table_schema text NOT NULL,
  table_name text NOT NULL,
  record_id text NOT NULL,
  operation text NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  actor_user_id uuid,
  actor_role text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('manual', 'cron', 'webhook', 'trigger_cascade', 'service_role', 'unknown')),
  change_reason text,
  schema_version text,
  changed_columns text[],
  old_values jsonb,
  new_values jsonb,
  trigger_depth smallint NOT NULL
);

COMMENT ON TABLE public.audit_log IS
  'C2: append-only audit-log. Skrives kun af public.stork_audit() trigger. Læses via public.audit_log_read(). Authenticated + service_role + anon har 0 direkte adgang.';

CREATE INDEX audit_log_record_idx
  ON public.audit_log (table_schema, table_name, record_id, occurred_at DESC);

CREATE INDEX audit_log_occurred_at_idx
  ON public.audit_log (occurred_at DESC);

CREATE INDEX audit_log_actor_idx
  ON public.audit_log (actor_user_id, occurred_at DESC)
  WHERE actor_user_id IS NOT NULL;

-- skip-force-rls: audit_log skrives KUN af stork_audit() (SECURITY DEFINER, postgres-owner).
--                 FORCE RLS ville blokere også den legitime trigger-INSERT fordi postgres
--                 ejer både function og table. ENABLE + 0 policies + REVOKE ALL fra alle
--                 non-owner-roller giver samme effektiv beskyttelse: ingen direkte adgang
--                 fra authenticated/service_role/anon, kun postgres-owned SECURITY DEFINER
--                 kan skrive (via trigger) eller læse (via audit_log_read RPC).
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.audit_log FROM PUBLIC, anon, authenticated, service_role;

-- ─────────────────────────────────────────────────────────────────────────
-- audit_filter_values: PII-filter-hook (C2 stub, lag D omdefinerer)
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.audit_filter_values(
  p_table_schema text,
  p_table_name text,
  p_values jsonb
)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  -- Stub: returnerer values uændret. Lag D omdefinerer til at:
  --   1) læse data_field_definitions for (schema, table)
  --   2) hashe kolonner med pii_level='direct' via sha256
  --   3) anonymisere indirect-PII baseret på retention-policy
  SELECT p_values;
$$;

COMMENT ON FUNCTION public.audit_filter_values(text, text, jsonb) IS
  'C2 stub. Lag D omdefinerer til at hashe pii_level=direct kolonner inden de gemmes i audit_log.';

REVOKE ALL ON FUNCTION public.audit_filter_values(text, text, jsonb) FROM PUBLIC, anon;

-- ─────────────────────────────────────────────────────────────────────────
-- stork_audit(): reusable trigger function
-- ─────────────────────────────────────────────────────────────────────────
-- Attach til feature-tabeller via:
--   CREATE TRIGGER <name> AFTER INSERT OR UPDATE OR DELETE ON <table>
--     FOR EACH ROW EXECUTE FUNCTION public.stork_audit();
--
-- Source-type-detection (i prioriteret rækkefølge):
--   1. Session-var `stork.source_type` (eksplicit override fra caller)
--   2. pg_trigger_depth() > 1 → trigger_cascade
--   3. current_user in (service_role, supabase_admin) → service_role
--   4. auth.uid() IS NOT NULL → manual
--   5. fallback → unknown
--
-- Callere kan også sætte session-vars `stork.change_reason` og
-- `stork.schema_version` via SET LOCAL inden de mutater.

CREATE OR REPLACE FUNCTION public.stork_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_source_type text;
  v_actor_uid uuid;
  v_change_reason text;
  v_schema_version text;
  v_record_id text;
  v_changed_columns text[];
  v_old jsonb;
  v_new jsonb;
BEGIN
  v_source_type := nullif(current_setting('stork.source_type', true), '');

  IF v_source_type IS NULL THEN
    IF pg_trigger_depth() > 1 THEN
      v_source_type := 'trigger_cascade';
    ELSIF current_user IN ('service_role', 'supabase_admin') THEN
      v_source_type := 'service_role';
    ELSIF (SELECT auth.uid()) IS NOT NULL THEN
      v_source_type := 'manual';
    ELSE
      v_source_type := 'unknown';
    END IF;
  END IF;

  v_actor_uid := (SELECT auth.uid());
  v_change_reason := nullif(current_setting('stork.change_reason', true), '');
  v_schema_version := nullif(current_setting('stork.schema_version', true), '');

  IF TG_OP = 'DELETE' THEN
    v_record_id := COALESCE(to_jsonb(OLD) ->> 'id', '<no-id>');
    v_old := public.audit_filter_values(TG_TABLE_SCHEMA, TG_TABLE_NAME, to_jsonb(OLD));
  ELSE
    v_record_id := COALESCE(to_jsonb(NEW) ->> 'id', '<no-id>');
    v_new := public.audit_filter_values(TG_TABLE_SCHEMA, TG_TABLE_NAME, to_jsonb(NEW));
    IF TG_OP = 'UPDATE' THEN
      v_old := public.audit_filter_values(TG_TABLE_SCHEMA, TG_TABLE_NAME, to_jsonb(OLD));
      SELECT array_agg(key ORDER BY key)
        INTO v_changed_columns
        FROM jsonb_each(to_jsonb(NEW)) AS n(key, value)
        WHERE (to_jsonb(OLD) -> n.key) IS DISTINCT FROM n.value;
    END IF;
  END IF;

  INSERT INTO public.audit_log (
    table_schema, table_name, record_id, operation,
    actor_user_id, actor_role,
    source_type, change_reason, schema_version,
    changed_columns, old_values, new_values, trigger_depth
  )
  VALUES (
    TG_TABLE_SCHEMA, TG_TABLE_NAME, v_record_id, TG_OP,
    v_actor_uid, current_user,
    v_source_type, v_change_reason, v_schema_version,
    v_changed_columns, v_old, v_new, pg_trigger_depth()
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.stork_audit() IS
  'C2: reusable audit-trigger. Detekterer source_type via session-var eller heuristik. Attach via CREATE TRIGGER ... EXECUTE FUNCTION public.stork_audit().';

REVOKE ALL ON FUNCTION public.stork_audit() FROM PUBLIC, anon;
-- Ingen GRANT — triggers kalder funktionen automatisk via postgres-context.

-- ─────────────────────────────────────────────────────────────────────────
-- audit_log_read(): SECURITY DEFINER RPC med permission-check
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.audit_log_read(
  p_table_schema text DEFAULT NULL,
  p_table_name text DEFAULT NULL,
  p_record_id text DEFAULT NULL,
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0
)
RETURNS SETOF public.audit_log
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Permission-check: kun is_admin() kan læse audit (C1 stub returnerer false
  -- → ingen kan læse indtil lag D låser op via role_page_permissions).
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'audit_log_read: insufficient permissions'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT *
    FROM public.audit_log
    WHERE (p_table_schema IS NULL OR table_schema = p_table_schema)
      AND (p_table_name IS NULL OR table_name = p_table_name)
      AND (p_record_id IS NULL OR record_id = p_record_id)
    ORDER BY occurred_at DESC
    LIMIT GREATEST(p_limit, 0)
    OFFSET GREATEST(p_offset, 0);
END;
$$;

COMMENT ON FUNCTION public.audit_log_read(text, text, text, integer, integer) IS
  'C2: SECURITY DEFINER read-RPC for audit_log. Permission via public.is_admin(). C1 stub afviser alle indtil lag D låser op.';

REVOKE ALL ON FUNCTION public.audit_log_read(text, text, text, integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.audit_log_read(text, text, text, integer, integer) TO authenticated;
