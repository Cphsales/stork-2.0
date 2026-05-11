-- C3: Cron-skabelon — pg_cron + pg_net + btree_gist + cron_heartbeats.
--
-- Mathias' princip: "pg_cron til DB-interne, scheduled edge functions til
-- eksterne. Hybrid hvis cron-jobs skal kalde eksterne API'er (pg_cron
-- tickrer, edge function gør arbejdet)."
--
-- cron_heartbeats sporer hver job's seneste kørsel + status. Failure-rows
-- auditeres automatisk via stork_audit() med WHEN-filter (kun failures,
-- ikke hver enkelt success — ellers ville audit_log eksplodere).
--
-- btree_gist aktiveres her som forberedelse til C4's pay_periods
-- exclusion-constraint mod overlap.
-- pg_net aktiveres til hybrid pg_cron → edge function-mønstret.

-- ─────────────────────────────────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ─────────────────────────────────────────────────────────────────────────
-- cron_heartbeats: tracker hver cron-jobs seneste kørsel
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE public.cron_heartbeats (
  job_name text PRIMARY KEY,
  schedule text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  last_run_at timestamptz,
  last_status text CHECK (last_status IN ('ok', 'failure')),
  last_error text,
  last_duration_ms integer,
  run_count bigint NOT NULL DEFAULT 0,
  failure_count bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.cron_heartbeats IS
  'C3: heartbeat-tracker for cron-jobs. Skrives via public.cron_heartbeat_record(). Læses via public.cron_heartbeats_read(). Failure-rows auditeres automatisk via WHEN-trigger.';

-- skip-force-rls: cron_heartbeats opdateres af pg_cron-jobs (postgres-context)
--                 og af public.cron_heartbeat_record() (SECURITY DEFINER, postgres-owner).
--                 FORCE ville blokere postgres' egne writes. Direkte adgang fra
--                 authenticated/service_role/anon afvises via REVOKE ALL +
--                 0 policies = default deny. Læsning sker via
--                 cron_heartbeats_read() RPC med is_admin()-check.
ALTER TABLE public.cron_heartbeats ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.cron_heartbeats FROM PUBLIC, anon, authenticated, service_role;

-- Audit-trigger: kun failures (ellers spam-audit ved hver success-heartbeat)
CREATE TRIGGER cron_heartbeats_audit_failures
  AFTER INSERT OR UPDATE ON public.cron_heartbeats
  FOR EACH ROW
  WHEN (NEW.last_status = 'failure')
  EXECUTE FUNCTION public.stork_audit();

-- ─────────────────────────────────────────────────────────────────────────
-- cron_heartbeat_record(): registrer kørsel
-- ─────────────────────────────────────────────────────────────────────────
-- Cron-jobs og edge functions kalder denne ved hver kørsel.
-- Sætter session-var stork.source_type='cron' så audit-triggeren på
-- failure-rows får korrekt source_type.

CREATE OR REPLACE FUNCTION public.cron_heartbeat_record(
  p_job_name text,
  p_schedule text,
  p_status text,
  p_error text DEFAULT NULL,
  p_duration_ms integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_status NOT IN ('ok', 'failure') THEN
    RAISE EXCEPTION 'cron_heartbeat_record: ugyldigt status %, må være ok eller failure', p_status;
  END IF;

  PERFORM set_config('stork.source_type', 'cron', true);

  INSERT INTO public.cron_heartbeats AS h (
    job_name, schedule, last_run_at, last_status, last_error, last_duration_ms,
    run_count, failure_count
  )
  VALUES (
    p_job_name, p_schedule, now(), p_status, p_error, p_duration_ms,
    1, CASE WHEN p_status = 'failure' THEN 1 ELSE 0 END
  )
  ON CONFLICT (job_name) DO UPDATE
  SET schedule = EXCLUDED.schedule,
      last_run_at = EXCLUDED.last_run_at,
      last_status = EXCLUDED.last_status,
      last_error = EXCLUDED.last_error,
      last_duration_ms = EXCLUDED.last_duration_ms,
      run_count = h.run_count + 1,
      failure_count = h.failure_count + CASE WHEN EXCLUDED.last_status = 'failure' THEN 1 ELSE 0 END,
      updated_at = now();
END;
$$;

COMMENT ON FUNCTION public.cron_heartbeat_record(text, text, text, text, integer) IS
  'C3: cron-job heartbeat. Sætter source_type=cron så failure-rows auditeres med korrekt context. Upsert på (job_name).';

REVOKE ALL ON FUNCTION public.cron_heartbeat_record(text, text, text, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cron_heartbeat_record(text, text, text, text, integer) TO authenticated, service_role;

-- ─────────────────────────────────────────────────────────────────────────
-- cron_heartbeats_read(): SECURITY DEFINER RPC for admin-read
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.cron_heartbeats_read()
RETURNS SETOF public.cron_heartbeats
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'cron_heartbeats_read: insufficient permissions'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT * FROM public.cron_heartbeats
    ORDER BY last_run_at DESC NULLS LAST, job_name;
END;
$$;

COMMENT ON FUNCTION public.cron_heartbeats_read() IS
  'C3: SECURITY DEFINER read-RPC for cron_heartbeats. Permission via public.is_admin(). C1 stub afviser alle indtil lag D låser op.';

REVOKE ALL ON FUNCTION public.cron_heartbeats_read() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cron_heartbeats_read() TO authenticated;
