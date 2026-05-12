-- C4: Period-lock-template — første instans med løn-domæne.
--
-- Etablerer 4-dele-template:
--   1. {domain}_settings (single-row config)
--   2. {domain}_periods (open/locked livscyklus)
--   3. {domain}_snapshots (immutable frosne tal ved lock)
--   4. {domain}_corrections (immutable kompenserings-modposter)
-- Plus domæne-specifik begivenheds-tabel (cancellations) der hænger sammen
-- via correction.source_cancellation_id, men er ikke selv del af templaten.
--
-- Mathias-afgørelser implementeret:
--   - FORCE RLS Variant B (session-var-baserede policies for skrivning)
--   - SELECT-policy åben for authenticated (placeholder; lag D konsulterer
--     permission-system)
--   - pay_periods DELETE altid blokeret (RPC-pattern dokumenteret til lag D/E)
--   - UNIQUE(period_id, sale_id, employee_id) på commission_snapshots
--     (provision-split mellem flere medarbejdere understøttes)
--   - numeric(12,2) på alle beløb; reason-baserede sign-CHECK på salary_corrections
--   - on_period_lock no-op stub (BEFORE UPDATE WHEN open→locked)
--   - FK i begge retninger mellem salary_corrections ↔ cancellations
--   - Status-engangs-pattern KUN dokumenteret (ingen helper — rule of three)
--   - cron-job sætter source_type, change_reason, allow_*_write per-job

-- ─────────────────────────────────────────────────────────────────────────
-- Helper: set_updated_at() — genbrugelig BEFORE UPDATE trigger
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at() IS
  'C4: genbrugelig BEFORE UPDATE-trigger der sætter NEW.updated_at = now().';

-- ─────────────────────────────────────────────────────────────────────────
-- pay_period_settings: single-row config
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE public.pay_period_settings (
  id smallint PRIMARY KEY CHECK (id = 1),
  start_day_of_month integer NOT NULL DEFAULT 15 CHECK (start_day_of_month BETWEEN 1 AND 28),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.pay_period_settings IS
  'C4: single-row config for pay_period beregning. start_day_of_month 15 betyder 15→14-periode. Max 28 så feb ikke fejler.';

CREATE TRIGGER pay_period_settings_set_updated_at
  BEFORE UPDATE ON public.pay_period_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER pay_period_settings_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.pay_period_settings
  FOR EACH ROW EXECUTE FUNCTION public.stork_audit();

INSERT INTO public.pay_period_settings (id, start_day_of_month) VALUES (1, 15);

ALTER TABLE public.pay_period_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pay_period_settings FORCE ROW LEVEL SECURITY;

CREATE POLICY pay_period_settings_select ON public.pay_period_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY pay_period_settings_update ON public.pay_period_settings
  FOR UPDATE
  USING (current_setting('stork.allow_pay_period_settings_write', true) = 'true')
  WITH CHECK (current_setting('stork.allow_pay_period_settings_write', true) = 'true');

REVOKE ALL ON TABLE public.pay_period_settings FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.pay_period_settings TO authenticated;

-- pay_period_settings_update RPC
CREATE OR REPLACE FUNCTION public.pay_period_settings_update(
  p_start_day_of_month integer,
  p_change_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'pay_period_settings_update: insufficient permissions'
      USING ERRCODE = '42501';
  END IF;
  IF p_start_day_of_month < 1 OR p_start_day_of_month > 28 THEN
    RAISE EXCEPTION 'pay_period_settings_update: start_day_of_month skal være 1-28, fik %', p_start_day_of_month;
  END IF;
  IF p_change_reason IS NULL OR length(trim(p_change_reason)) = 0 THEN
    RAISE EXCEPTION 'pay_period_settings_update: change_reason er påkrævet';
  END IF;

  PERFORM set_config('stork.source_type', 'manual', true);
  PERFORM set_config('stork.change_reason', p_change_reason, true);
  PERFORM set_config('stork.allow_pay_period_settings_write', 'true', true);

  UPDATE public.pay_period_settings
  SET start_day_of_month = p_start_day_of_month
  WHERE id = 1;
END;
$$;

COMMENT ON FUNCTION public.pay_period_settings_update(integer, text) IS
  'C4: SECURITY DEFINER RPC til at opdatere pay_period_settings. Kræver is_admin() (C1 stub afviser indtil lag D). change_reason påkrævet for audit-trail.';

REVOKE ALL ON FUNCTION public.pay_period_settings_update(integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pay_period_settings_update(integer, text) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- pay_period_for_date(): hjælper til at beregne periode for given dato
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.pay_period_for_date(p_date date)
RETURNS TABLE (start_date date, end_date date)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_start_day integer;
  v_year integer;
  v_month integer;
  v_anchor date;
BEGIN
  SELECT s.start_day_of_month INTO v_start_day
  FROM public.pay_period_settings s WHERE s.id = 1;

  IF EXTRACT(DAY FROM p_date)::integer >= v_start_day THEN
    v_year := EXTRACT(YEAR FROM p_date)::integer;
    v_month := EXTRACT(MONTH FROM p_date)::integer;
  ELSE
    v_anchor := (p_date - interval '1 month')::date;
    v_year := EXTRACT(YEAR FROM v_anchor)::integer;
    v_month := EXTRACT(MONTH FROM v_anchor)::integer;
  END IF;

  start_date := make_date(v_year, v_month, v_start_day);
  end_date := (start_date + interval '1 month' - interval '1 day')::date;
  RETURN NEXT;
END;
$$;

COMMENT ON FUNCTION public.pay_period_for_date(date) IS
  'C4: returnerer (start_date, end_date) for den pay_period der dækker given dato. Baseret på pay_period_settings.start_day_of_month.';

REVOKE ALL ON FUNCTION public.pay_period_for_date(date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pay_period_for_date(date) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- pay_periods: template-instans #1 — periode-tabel
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE public.pay_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'locked')),
  locked_at timestamptz,
  locked_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pay_periods_dates_check CHECK (start_date <= end_date),
  CONSTRAINT pay_periods_no_overlap
    EXCLUDE USING gist (daterange(start_date, end_date, '[]') WITH &&)
);

COMMENT ON TABLE public.pay_periods IS
  'C4: lønperioder med open/locked livscyklus. Overlap forhindret af exclusion-constraint. DELETE altid blokeret (correct_pay_period_delete RPC dokumenteret til lag D/E).';

-- Lock + delete check
CREATE OR REPLACE FUNCTION public.pay_periods_lock_and_delete_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'pay_periods[%]: DELETE altid blokeret. Brug correct_pay_period_delete()-RPC (bygges i lag D/E ved behov).', OLD.id;
  END IF;
  IF OLD.status = 'locked' THEN
    RAISE EXCEPTION 'pay_periods[%]: locked periode kan ikke ændres', OLD.id;
  END IF;
  IF NEW.status = 'locked' AND OLD.status = 'open' THEN
    NEW.locked_at := now();
    NEW.locked_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER pay_periods_lock_and_delete_check
  BEFORE UPDATE OR DELETE ON public.pay_periods
  FOR EACH ROW EXECUTE FUNCTION public.pay_periods_lock_and_delete_check();

-- on_period_lock stub
CREATE OR REPLACE FUNCTION public.on_period_lock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- C4 no-op stub. Lag D udvider til:
  --   - materialiser kpi_snapshots for perioden (læser kpi_definitions)
  -- Lag E udvider yderligere til:
  --   - materialiser commission_snapshots for hver completed/pending sale i perioden
  -- Husk: når disse INSERTer i FORCE-RLS-tabeller, skal session-var sættes
  --   PERFORM set_config('stork.allow_<table>_write', 'true', true);
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.on_period_lock() IS
  'C4 no-op stub. Lag D/E udvider til at materialisere kpi_snapshots og commission_snapshots ved open→locked transition.';

CREATE TRIGGER pay_periods_on_lock
  BEFORE UPDATE ON public.pay_periods
  FOR EACH ROW
  WHEN (OLD.status = 'open' AND NEW.status = 'locked')
  EXECUTE FUNCTION public.on_period_lock();

CREATE TRIGGER pay_periods_set_updated_at
  BEFORE UPDATE ON public.pay_periods
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER pay_periods_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.pay_periods
  FOR EACH ROW EXECUTE FUNCTION public.stork_audit();

ALTER TABLE public.pay_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pay_periods FORCE ROW LEVEL SECURITY;

CREATE POLICY pay_periods_select ON public.pay_periods
  FOR SELECT TO authenticated USING (true);

CREATE POLICY pay_periods_insert ON public.pay_periods
  FOR INSERT
  WITH CHECK (current_setting('stork.allow_pay_periods_write', true) = 'true');

CREATE POLICY pay_periods_update ON public.pay_periods
  FOR UPDATE
  USING (current_setting('stork.allow_pay_periods_write', true) = 'true')
  WITH CHECK (current_setting('stork.allow_pay_periods_write', true) = 'true');

REVOKE ALL ON TABLE public.pay_periods FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.pay_periods TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- commission_snapshots: template-instans #1 — frozen tal
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE public.commission_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id uuid NOT NULL REFERENCES public.pay_periods(id),
  employee_id uuid NOT NULL,
  sale_id uuid NOT NULL,
  amount numeric(12, 2) NOT NULL,
  status_at_lock text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT commission_snapshots_unique UNIQUE (period_id, sale_id, employee_id)
);

COMMENT ON TABLE public.commission_snapshots IS
  'C4: immutable frosne provision-tal ved pay_period lock. UNIQUE(period, sale, employee) tillader provision-split (samme salg → flere medarbejdere). INSERT-only.';

CREATE INDEX commission_snapshots_period_idx ON public.commission_snapshots (period_id);
CREATE INDEX commission_snapshots_employee_idx ON public.commission_snapshots (employee_id);
CREATE INDEX commission_snapshots_sale_idx ON public.commission_snapshots (sale_id);

CREATE OR REPLACE FUNCTION public.commission_snapshots_immutability_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'commission_snapshots[%]: er immutable — kun INSERT tillades, ingen UPDATE/DELETE', OLD.id;
END;
$$;

CREATE TRIGGER commission_snapshots_immutability
  BEFORE UPDATE OR DELETE ON public.commission_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.commission_snapshots_immutability_check();

CREATE TRIGGER commission_snapshots_audit
  AFTER INSERT ON public.commission_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.stork_audit();

ALTER TABLE public.commission_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_snapshots FORCE ROW LEVEL SECURITY;

CREATE POLICY commission_snapshots_insert ON public.commission_snapshots
  FOR INSERT
  WITH CHECK (current_setting('stork.allow_commission_snapshots_write', true) = 'true');

REVOKE ALL ON TABLE public.commission_snapshots FROM PUBLIC, anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- salary_corrections: template-instans #1 — corrections
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE public.salary_corrections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_period_id uuid NOT NULL REFERENCES public.pay_periods(id),
  source_sale_id uuid,
  source_period_id uuid REFERENCES public.pay_periods(id),
  amount numeric(12, 2) NOT NULL,
  reason text NOT NULL,
  description text,
  source_cancellation_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  CONSTRAINT salary_corrections_reason_check
    CHECK (reason IN ('cancellation', 'cancellation_reversal', 'kurv_correction', 'manual_error', 'other')),
  CONSTRAINT salary_corrections_amount_nonzero CHECK (amount <> 0),
  CONSTRAINT salary_corrections_reason_sign_check CHECK (
    (reason = 'cancellation' AND amount < 0) OR
    (reason = 'cancellation_reversal' AND amount > 0) OR
    (reason IN ('kurv_correction', 'manual_error', 'other'))
  )
);

COMMENT ON TABLE public.salary_corrections IS
  'C4: immutable lønkorrektioner. Append-only. Rollback sker via ny correction-række (reason=cancellation_reversal). source_period_id nullable hvis original ikke har frossen snapshot endnu.';

CREATE INDEX salary_corrections_target_idx ON public.salary_corrections (target_period_id);
CREATE INDEX salary_corrections_source_sale_idx ON public.salary_corrections (source_sale_id);
CREATE INDEX salary_corrections_source_period_idx ON public.salary_corrections (source_period_id);
CREATE INDEX salary_corrections_source_cancellation_idx ON public.salary_corrections (source_cancellation_id);

-- target_period must be open at INSERT time
CREATE OR REPLACE FUNCTION public.salary_corrections_validate_target()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE v_status text;
BEGIN
  SELECT status INTO v_status FROM public.pay_periods WHERE id = NEW.target_period_id;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'salary_corrections: target_period_id % ikke fundet', NEW.target_period_id;
  END IF;
  IF v_status <> 'open' THEN
    RAISE EXCEPTION 'salary_corrections: target_period_id % er ikke open (status=%)', NEW.target_period_id, v_status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER salary_corrections_validate_target
  BEFORE INSERT ON public.salary_corrections
  FOR EACH ROW EXECUTE FUNCTION public.salary_corrections_validate_target();

CREATE OR REPLACE FUNCTION public.salary_corrections_immutability_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'salary_corrections[%]: er immutable — INSERT-only', OLD.id;
END;
$$;

CREATE TRIGGER salary_corrections_immutability
  BEFORE UPDATE OR DELETE ON public.salary_corrections
  FOR EACH ROW EXECUTE FUNCTION public.salary_corrections_immutability_check();

CREATE TRIGGER salary_corrections_audit
  AFTER INSERT ON public.salary_corrections
  FOR EACH ROW EXECUTE FUNCTION public.stork_audit();

ALTER TABLE public.salary_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_corrections FORCE ROW LEVEL SECURITY;

CREATE POLICY salary_corrections_insert ON public.salary_corrections
  FOR INSERT
  WITH CHECK (current_setting('stork.allow_salary_corrections_write', true) = 'true');

REVOKE ALL ON TABLE public.salary_corrections FROM PUBLIC, anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- cancellations: begivenheds-tabel (ikke del af generic templaten)
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE public.cancellations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_sale_id uuid NOT NULL,
  cancellation_date date NOT NULL,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  reason text,
  matched_to_correction_id uuid REFERENCES public.salary_corrections(id),
  matched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

COMMENT ON TABLE public.cancellations IS
  'C4: append-only begivenhedstabel for kunde-annulleringer. Sales-rækken røres aldrig. Kun matched_to_correction_id + matched_at kan opdateres efter INSERT. DELETE altid blokeret.';

CREATE INDEX cancellations_source_sale_idx ON public.cancellations (source_sale_id);
CREATE INDEX cancellations_matched_correction_idx ON public.cancellations (matched_to_correction_id);

CREATE OR REPLACE FUNCTION public.cancellations_immutability_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'cancellations[%]: DELETE altid blokeret', OLD.id;
  END IF;
  -- UPDATE: kun matched_to_correction_id + matched_at må ændres
  IF OLD.id IS DISTINCT FROM NEW.id
     OR OLD.source_sale_id IS DISTINCT FROM NEW.source_sale_id
     OR OLD.cancellation_date IS DISTINCT FROM NEW.cancellation_date
     OR OLD.amount IS DISTINCT FROM NEW.amount
     OR OLD.reason IS DISTINCT FROM NEW.reason
     OR OLD.created_at IS DISTINCT FROM NEW.created_at
     OR OLD.created_by IS DISTINCT FROM NEW.created_by THEN
    RAISE EXCEPTION 'cancellations[%]: kun matched_to_correction_id + matched_at kan ændres', OLD.id;
  END IF;
  IF OLD.matched_to_correction_id IS NOT NULL AND NEW.matched_to_correction_id IS NULL THEN
    RAISE EXCEPTION 'cancellations[%]: matched_to_correction_id kan ikke clearas tilbage til NULL', OLD.id;
  END IF;
  IF OLD.matched_to_correction_id IS NULL AND NEW.matched_to_correction_id IS NOT NULL THEN
    NEW.matched_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER cancellations_immutability
  BEFORE UPDATE OR DELETE ON public.cancellations
  FOR EACH ROW EXECUTE FUNCTION public.cancellations_immutability_check();

CREATE TRIGGER cancellations_audit
  AFTER INSERT OR UPDATE ON public.cancellations
  FOR EACH ROW EXECUTE FUNCTION public.stork_audit();

ALTER TABLE public.cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellations FORCE ROW LEVEL SECURITY;

CREATE POLICY cancellations_insert ON public.cancellations
  FOR INSERT
  WITH CHECK (current_setting('stork.allow_cancellations_write', true) = 'true');

CREATE POLICY cancellations_update ON public.cancellations
  FOR UPDATE
  USING (current_setting('stork.allow_cancellations_write', true) = 'true')
  WITH CHECK (current_setting('stork.allow_cancellations_write', true) = 'true');

REVOKE ALL ON TABLE public.cancellations FROM PUBLIC, anon, authenticated;

-- Cross-FK: salary_corrections.source_cancellation_id → cancellations.id
ALTER TABLE public.salary_corrections
  ADD CONSTRAINT salary_corrections_source_cancellation_fkey
  FOREIGN KEY (source_cancellation_id) REFERENCES public.cancellations(id);

-- ─────────────────────────────────────────────────────────────────────────
-- Ensure første pay_period eksisterer (i samme migration)
-- ─────────────────────────────────────────────────────────────────────────

DO $bootstrap$
DECLARE
  v_today date := (now() AT TIME ZONE 'Europe/Copenhagen')::date;
  v_period record;
BEGIN
  PERFORM set_config('stork.source_type', 'cron', true);
  PERFORM set_config('stork.change_reason', 'migration: bootstrap first pay_period', true);
  PERFORM set_config('stork.allow_pay_periods_write', 'true', true);

  SELECT * INTO v_period FROM public.pay_period_for_date(v_today);
  IF NOT EXISTS (SELECT 1 FROM public.pay_periods p WHERE p.start_date = v_period.start_date) THEN
    INSERT INTO public.pay_periods (start_date, end_date)
    VALUES (v_period.start_date, v_period.end_date);
  END IF;
END;
$bootstrap$;

-- ─────────────────────────────────────────────────────────────────────────
-- Cron-job: ensure_pay_periods (daglig, idempotent)
-- ─────────────────────────────────────────────────────────────────────────

SELECT cron.schedule(
  'ensure_pay_periods',
  '0 1 * * *',
  $cron$
  DO $do$
  DECLARE
    v_today date := (now() AT TIME ZONE 'Europe/Copenhagen')::date;
    v_period_today record;
    v_period_next record;
    v_started timestamptz := clock_timestamp();
    v_error text;
  BEGIN
    PERFORM set_config('stork.source_type', 'cron', true);
    PERFORM set_config('stork.change_reason', 'cron: ensure-next-pay-period', true);
    PERFORM set_config('stork.allow_pay_periods_write', 'true', true);

    SELECT * INTO v_period_today FROM public.pay_period_for_date(v_today);
    IF NOT EXISTS (SELECT 1 FROM public.pay_periods p WHERE p.start_date = v_period_today.start_date) THEN
      INSERT INTO public.pay_periods (start_date, end_date)
      VALUES (v_period_today.start_date, v_period_today.end_date);
    END IF;

    SELECT * INTO v_period_next FROM public.pay_period_for_date((v_today + interval '1 month')::date);
    IF NOT EXISTS (SELECT 1 FROM public.pay_periods p WHERE p.start_date = v_period_next.start_date) THEN
      INSERT INTO public.pay_periods (start_date, end_date)
      VALUES (v_period_next.start_date, v_period_next.end_date);
    END IF;

    PERFORM public.cron_heartbeat_record(
      'ensure_pay_periods', '0 1 * * *', 'ok', NULL,
      (EXTRACT(EPOCH FROM (clock_timestamp() - v_started)) * 1000)::integer
    );
  EXCEPTION WHEN OTHERS THEN
    v_error := SQLERRM;
    PERFORM public.cron_heartbeat_record(
      'ensure_pay_periods', '0 1 * * *', 'failure', v_error,
      (EXTRACT(EPOCH FROM (clock_timestamp() - v_started)) * 1000)::integer
    );
    RAISE;
  END;
  $do$;
  $cron$
);
