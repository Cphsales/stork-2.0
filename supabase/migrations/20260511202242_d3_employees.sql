-- D3: employees-tabel + auth.uid()→employee_id mapping
--
-- Master-tabel for medarbejdere. Mapper Supabase auth.users til
-- forretnings-identitet via auth_user_id UNIQUE FK. Bevares evigt for
-- FK-integritet i audit_log + commission_snapshots + salary_corrections.
--
-- Anonymisering = UPDATE af PII-felter til placeholder (aldrig DELETE).
-- Anonymiserings-RPC bygges i compliance-fase (roadmap pkt 3); D3
-- forbereder kun schema (anonymized_at-flag).
--
-- Schema-valg fra Mathias' D3-review:
--   - first_name + last_name separate (ikke kombineret display_name)
--   - email NOT NULL UNIQUE (HR-disciplin; placeholder generes per row
--     ved fremtidig anonymisering for at undgå UNIQUE-konflikt)
--   - hire_date NOT NULL; termination_date NULL = aktiv
--   - team_id ikke i D3 — venter på lag E

CREATE TABLE public.employees (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id     uuid UNIQUE REFERENCES auth.users(id) ON DELETE RESTRICT,
  first_name       text NOT NULL,
  last_name        text NOT NULL,
  email            text NOT NULL UNIQUE,
  hire_date        date NOT NULL,
  termination_date date,
  anonymized_at    timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.employees IS
  'D3: master-tabel for medarbejdere. auth_user_id mapper Supabase-bruger til forretnings-identitet. Aldrig DELETE — anonymisering = UPDATE af PII-felter via compliance-RPC (roadmap-post-fase-0 pkt 3). termination_date markerer ophør; rækken bevares for FK-integritet.';

CREATE INDEX employees_auth_user_id_active_idx
  ON public.employees (auth_user_id)
  WHERE anonymized_at IS NULL;

CREATE INDEX employees_active_idx
  ON public.employees (termination_date)
  WHERE anonymized_at IS NULL AND termination_date IS NULL;

CREATE TRIGGER employees_set_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER employees_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.stork_audit();

-- ─────────────────────────────────────────────────────────────────────────
-- RLS: FORCE Variant B
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees FORCE ROW LEVEL SECURITY;

-- SELECT: egen row (via auth_user_id-match) ELLER admin
CREATE POLICY employees_select ON public.employees
  FOR SELECT TO authenticated
  USING (
    auth_user_id = (SELECT auth.uid())
    OR public.is_admin()
  );

CREATE POLICY employees_insert ON public.employees
  FOR INSERT
  WITH CHECK (current_setting('stork.allow_employees_write', true) = 'true');

CREATE POLICY employees_update ON public.employees
  FOR UPDATE
  USING (current_setting('stork.allow_employees_write', true) = 'true')
  WITH CHECK (current_setting('stork.allow_employees_write', true) = 'true');

-- DELETE: ingen policy = default deny. Anonymisering er UPDATE.

REVOKE ALL ON TABLE public.employees FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.employees TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- current_employee_id() — redefineret fra C1-stub
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.current_employee_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id
  FROM public.employees
  WHERE auth_user_id = (SELECT auth.uid())
    AND anonymized_at IS NULL
    AND (termination_date IS NULL OR termination_date > current_date);
$$;

COMMENT ON FUNCTION public.current_employee_id() IS
  'D3: returnerer employee.id for current auth.uid(). NULL hvis bruger ikke mappet, er anonymiseret, eller termineret (termination_date <= today). Future-dated termination tæller stadig som aktiv indtil datoen rammes.';

-- ─────────────────────────────────────────────────────────────────────────
-- employee_upsert(...) RPC
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.employee_upsert(
  p_auth_user_id uuid,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_hire_date date,
  p_change_reason text,
  p_employee_id uuid DEFAULT NULL,
  p_termination_date date DEFAULT NULL
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
    RAISE EXCEPTION 'employee_upsert: insufficient permissions'
      USING ERRCODE = '42501';
  END IF;
  IF p_change_reason IS NULL OR length(trim(p_change_reason)) = 0 THEN
    RAISE EXCEPTION 'employee_upsert: change_reason er påkrævet';
  END IF;

  PERFORM set_config('stork.source_type', 'manual', true);
  PERFORM set_config('stork.change_reason', p_change_reason, true);
  PERFORM set_config('stork.allow_employees_write', 'true', true);

  IF p_employee_id IS NULL THEN
    INSERT INTO public.employees (
      auth_user_id, first_name, last_name, email, hire_date, termination_date
    )
    VALUES (
      p_auth_user_id, p_first_name, p_last_name, p_email, p_hire_date, p_termination_date
    )
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.employees
    SET auth_user_id = p_auth_user_id,
        first_name = p_first_name,
        last_name = p_last_name,
        email = p_email,
        hire_date = p_hire_date,
        termination_date = p_termination_date
    WHERE id = p_employee_id
      AND anonymized_at IS NULL
    RETURNING id INTO v_id;

    IF v_id IS NULL THEN
      RAISE EXCEPTION 'employee_upsert: employee % findes ikke eller er anonymiseret', p_employee_id;
    END IF;
  END IF;

  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION public.employee_upsert(uuid, text, text, text, date, text, uuid, date) IS
  'D3: SECURITY DEFINER upsert. p_employee_id NULL = INSERT, ellers UPDATE. UPDATE blokeret hvis anonymized_at IS NOT NULL. is_admin()-stub afviser indtil D4. Gen-aktivering = UPDATE med p_termination_date=NULL.';

REVOKE ALL ON FUNCTION public.employee_upsert(uuid, text, text, text, date, text, uuid, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.employee_upsert(uuid, text, text, text, date, text, uuid, date) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- employee_terminate(...) RPC
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.employee_terminate(
  p_employee_id uuid,
  p_termination_date date,
  p_change_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'employee_terminate: insufficient permissions'
      USING ERRCODE = '42501';
  END IF;
  IF p_change_reason IS NULL OR length(trim(p_change_reason)) = 0 THEN
    RAISE EXCEPTION 'employee_terminate: change_reason er påkrævet';
  END IF;
  IF p_termination_date IS NULL THEN
    RAISE EXCEPTION 'employee_terminate: p_termination_date er påkrævet (NULL = gen-aktivering, brug employee_upsert)';
  END IF;

  PERFORM set_config('stork.source_type', 'manual', true);
  PERFORM set_config('stork.change_reason', 'terminate: ' || p_change_reason, true);
  PERFORM set_config('stork.allow_employees_write', 'true', true);

  UPDATE public.employees
  SET termination_date = p_termination_date
  WHERE id = p_employee_id
    AND anonymized_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'employee_terminate: employee % findes ikke eller er anonymiseret', p_employee_id;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.employee_terminate(uuid, date, text) IS
  'D3: dedikeret terminate-RPC. Sætter termination_date. change_reason auto-præfikset med "terminate:" i audit-trail. Gen-aktivering kræver employee_upsert (eksplicit intentions-skel).';

REVOKE ALL ON FUNCTION public.employee_terminate(uuid, date, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.employee_terminate(uuid, date, text) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- Klassifikation: 10 nye rækker i data_field_definitions for employees
-- ─────────────────────────────────────────────────────────────────────────

SELECT set_config('stork.source_type', 'manual', true);
SELECT set_config('stork.change_reason',
  'D3: seed klassifikation for public.employees (10 kolonner)', true);
SELECT set_config('stork.allow_data_field_definitions_write', 'true', true);

INSERT INTO public.data_field_definitions
  (table_schema, table_name, column_name, category, pii_level,
   retention_type, retention_value, match_role, purpose)
VALUES
  ('public', 'employees', 'id',
    'master_data', 'none',
    'manual', '{"event": "row_anonymized"}'::jsonb, NULL,
    'Medarbejder-rækkens uuid PK; bevares evigt for FK-integritet'),
  ('public', 'employees', 'auth_user_id',
    'master_data', 'indirect',
    'manual', '{"event": "row_anonymized"}'::jsonb, NULL,
    'FK til auth.users.id; mapper Supabase-bruger til medarbejder'),
  ('public', 'employees', 'first_name',
    'master_data', 'direct',
    'manual', '{"event": "row_anonymized"}'::jsonb, NULL,
    'Medarbejderens fornavn; PII direct (hashes i audit_log via D2)'),
  ('public', 'employees', 'last_name',
    'master_data', 'direct',
    'manual', '{"event": "row_anonymized"}'::jsonb, NULL,
    'Medarbejderens efternavn; PII direct (hashes i audit_log via D2)'),
  ('public', 'employees', 'email',
    'master_data', 'direct',
    'manual', '{"event": "row_anonymized"}'::jsonb, NULL,
    'Medarbejderens email; PII direct + UNIQUE-constraint'),
  ('public', 'employees', 'hire_date',
    'master_data', 'none',
    'manual', '{"event": "row_anonymized"}'::jsonb, NULL,
    'Ansættelsesdato'),
  ('public', 'employees', 'termination_date',
    'master_data', 'none',
    'manual', '{"event": "row_anonymized"}'::jsonb, NULL,
    'Ophørsdato; NULL = aktiv. termination_date > current_date = future-dated'),
  ('public', 'employees', 'anonymized_at',
    'master_data', 'none',
    'manual', '{"event": "row_anonymized"}'::jsonb, NULL,
    'Tidsstempel for hvornår rækken blev anonymiseret; NULL = ikke endnu'),
  ('public', 'employees', 'created_at',
    'master_data', 'none',
    'manual', '{"event": "row_anonymized"}'::jsonb, NULL,
    'INSERT-tid'),
  ('public', 'employees', 'updated_at',
    'master_data', 'none',
    'manual', '{"event": "row_anonymized"}'::jsonb, NULL,
    'Sidste mutation; opdateres af set_updated_at()-trigger');
