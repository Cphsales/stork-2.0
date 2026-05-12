-- D7: org-træ + operationelle teams + medarbejder/klient-team-relationer
--
-- 4 nye tabeller:
--   org_units      — selv-refererende træ (vilkårligt antal niveauer)
--   teams          — operationelle enheder der ejer klienter
--   employee_teams — medarbejder-til-team med historik
--   client_teams   — klient-til-team-ejerskab med historik
--
-- ALTER:
--   employees ADD COLUMN current_org_unit_id
--   role_page_permissions scope CHECK udvides med 'subtree'
--
-- Hard constraints fra §5.3:
--   - UNIQUE aktiv klient-id i client_teams (én klient = ét team)
--   - UNIQUE aktiv medarbejder-id i employee_teams (én tilknytning ad gangen)
--   - Cycle-trigger på org_units
--   - Historik bevares immutable
--   - Sales-snapshot håndteres i lag E (ikke her)
--
-- Per §3.4 greenfield-princip: navne afgjort her efter Mathias' review.
-- Per §5.3: UI-disciplin (ikke schema) håndhæver matrix-konsistens
-- mellem employees.current_org_unit_id og employee-teams. Schema tillader
-- bevidst divergens (Thorbjørn-mønstret).

-- ─────────────────────────────────────────────────────────────────────────
-- Tabel 1: public.org_units (selv-refererende træ)
-- ─────────────────────────────────────────────────────────────────────────

-- no-dedup-key: org_units er strukturel konfiguration, ikke ingest-data
CREATE TABLE public.org_units (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE CHECK (length(trim(name)) > 0),
  parent_id   uuid REFERENCES public.org_units(id) ON DELETE RESTRICT,
  is_active   bool NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT org_units_no_self_cycle CHECK (id <> parent_id)
);

COMMENT ON TABLE public.org_units IS
  'D7: selv-refererende org-trae. Vilkaarligt antal niveauer. Teams haenger som blade. Medarbejdere kan tilknyttes direkte (stab) eller indirekte via team. Cycle-trigger forhindrer A->B->A.';

CREATE INDEX org_units_parent_active_idx
  ON public.org_units (parent_id)
  WHERE is_active = true;

-- Cycle-detection: walk ancestor-chain via recursive CTE, RAISE hvis NEW.id ses
CREATE OR REPLACE FUNCTION public.org_units_prevent_cycle()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ancestor_id uuid;
BEGIN
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.parent_id = NEW.id THEN
    RAISE EXCEPTION 'org_units: cycle detected (self-reference)'
      USING ERRCODE = '23514';
  END IF;
  -- Walk parent-chain. Hvis vi rammer NEW.id, er der en cykel.
  WITH RECURSIVE ancestors AS (
    SELECT id, parent_id FROM public.org_units WHERE id = NEW.parent_id
    UNION ALL
    SELECT o.id, o.parent_id
    FROM public.org_units o
    JOIN ancestors a ON o.id = a.parent_id
  )
  SELECT id INTO v_ancestor_id FROM ancestors WHERE id = NEW.id LIMIT 1;

  IF v_ancestor_id IS NOT NULL THEN
    RAISE EXCEPTION 'org_units: cycle detected (id % er allerede ancestor af parent_id %)',
      NEW.id, NEW.parent_id
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER org_units_prevent_cycle
  BEFORE INSERT OR UPDATE OF parent_id ON public.org_units
  FOR EACH ROW EXECUTE FUNCTION public.org_units_prevent_cycle();

CREATE TRIGGER org_units_set_updated_at
  BEFORE UPDATE ON public.org_units
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER org_units_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.org_units
  FOR EACH ROW EXECUTE FUNCTION public.stork_audit();

ALTER TABLE public.org_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_units FORCE ROW LEVEL SECURITY;

CREATE POLICY org_units_select ON public.org_units
  FOR SELECT TO authenticated USING (true);

CREATE POLICY org_units_insert ON public.org_units
  FOR INSERT
  WITH CHECK (current_setting('stork.allow_org_units_write', true) = 'true');

CREATE POLICY org_units_update ON public.org_units
  FOR UPDATE
  USING (current_setting('stork.allow_org_units_write', true) = 'true')
  WITH CHECK (current_setting('stork.allow_org_units_write', true) = 'true');

-- DELETE: ingen policy = default deny. Udfasning via is_active=false.

REVOKE ALL ON TABLE public.org_units FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.org_units TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- Tabel 2: public.teams (operationelle enheder)
-- ─────────────────────────────────────────────────────────────────────────

-- no-dedup-key: teams er strukturel konfiguration, ikke ingest-data
CREATE TABLE public.teams (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL UNIQUE CHECK (length(trim(name)) > 0),
  org_unit_id   uuid NOT NULL REFERENCES public.org_units(id) ON DELETE RESTRICT,
  is_active     bool NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.teams IS
  'D7: operationelle teams. Ejer klienter (via client_teams) og baerer medarbejdere (via employee_teams). Haenger som blade under en org_unit. team.name globalt unik.';

CREATE INDEX teams_org_unit_active_idx
  ON public.teams (org_unit_id)
  WHERE is_active = true;

CREATE TRIGGER teams_set_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER teams_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.stork_audit();

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams FORCE ROW LEVEL SECURITY;

CREATE POLICY teams_select ON public.teams
  FOR SELECT TO authenticated USING (true);

CREATE POLICY teams_insert ON public.teams
  FOR INSERT
  WITH CHECK (current_setting('stork.allow_teams_write', true) = 'true');

CREATE POLICY teams_update ON public.teams
  FOR UPDATE
  USING (current_setting('stork.allow_teams_write', true) = 'true')
  WITH CHECK (current_setting('stork.allow_teams_write', true) = 'true');

REVOKE ALL ON TABLE public.teams FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.teams TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- Tabel 3: public.employee_teams (med historik)
-- ─────────────────────────────────────────────────────────────────────────

-- no-dedup-key: medarbejder-team-tilknytning er master_data-historik, ikke ingest
CREATE TABLE public.employee_teams (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  uuid NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
  team_id      uuid NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
  from_date    date NOT NULL,
  to_date      date,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT employee_teams_date_range CHECK (to_date IS NULL OR to_date >= from_date),
  CONSTRAINT employee_teams_no_overlap
    EXCLUDE USING gist (
      employee_id WITH =,
      daterange(from_date, COALESCE(to_date + 1, 'infinity'::date)) WITH &&
    )
);

COMMENT ON TABLE public.employee_teams IS
  'D7: medarbejder-til-team-tilknytning med historik. to_date NULL = aktiv. Maks. en aktiv ad gangen (haandhaevet via partial UNIQUE + exclusion-constraint). Historik immutable.';

-- Partial UNIQUE: kun ÉN aktiv tildeling pr. medarbejder
CREATE UNIQUE INDEX employee_teams_one_active
  ON public.employee_teams (employee_id)
  WHERE to_date IS NULL;

CREATE INDEX employee_teams_employee_idx ON public.employee_teams (employee_id);
CREATE INDEX employee_teams_team_idx ON public.employee_teams (team_id);

-- Immutability: kun to_date kan ændres på aktiv-row; ingen DELETE
CREATE OR REPLACE FUNCTION public.employee_teams_immutability_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'employee_teams: DELETE blokeret (historik er immutable)'
      USING ERRCODE = '0A000';
  END IF;
  -- UPDATE: kun to_date må ændres, og kun fra NULL til en dato
  IF TG_OP = 'UPDATE' THEN
    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.employee_id IS DISTINCT FROM OLD.employee_id
       OR NEW.team_id IS DISTINCT FROM OLD.team_id
       OR NEW.from_date IS DISTINCT FROM OLD.from_date
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'employee_teams: kun to_date kan opdateres (id, employee_id, team_id, from_date, created_at er immutable)'
        USING ERRCODE = '0A000';
    END IF;
    IF OLD.to_date IS NOT NULL THEN
      RAISE EXCEPTION 'employee_teams: kan ikke aendre to_date efter den er sat (lukket row er immutable)'
        USING ERRCODE = '0A000';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER employee_teams_immutability
  BEFORE UPDATE OR DELETE ON public.employee_teams
  FOR EACH ROW EXECUTE FUNCTION public.employee_teams_immutability_check();

CREATE TRIGGER employee_teams_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.employee_teams
  FOR EACH ROW EXECUTE FUNCTION public.stork_audit();

ALTER TABLE public.employee_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_teams FORCE ROW LEVEL SECURITY;

CREATE POLICY employee_teams_select ON public.employee_teams
  FOR SELECT TO authenticated USING (true);

CREATE POLICY employee_teams_insert ON public.employee_teams
  FOR INSERT
  WITH CHECK (current_setting('stork.allow_employee_teams_write', true) = 'true');

CREATE POLICY employee_teams_update ON public.employee_teams
  FOR UPDATE
  USING (current_setting('stork.allow_employee_teams_write', true) = 'true')
  WITH CHECK (current_setting('stork.allow_employee_teams_write', true) = 'true');

REVOKE ALL ON TABLE public.employee_teams FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.employee_teams TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- Tabel 4: public.client_teams (med historik)
-- ─────────────────────────────────────────────────────────────────────────

-- no-dedup-key: klient-team-ejerskab er master_data-historik, ikke ingest
CREATE TABLE public.client_teams (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    uuid NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  team_id      uuid NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
  from_date    date NOT NULL,
  to_date      date,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT client_teams_date_range CHECK (to_date IS NULL OR to_date >= from_date),
  CONSTRAINT client_teams_no_overlap
    EXCLUDE USING gist (
      client_id WITH =,
      daterange(from_date, COALESCE(to_date + 1, 'infinity'::date)) WITH &&
    )
);

COMMENT ON TABLE public.client_teams IS
  'D7: klient-til-team-ejerskab med historik. Hard constraint per §5.3: en klient = et team aktivt ad gangen (partial UNIQUE). Klient kan skifte team med overgangsdato. Historik immutable.';

-- KRITISK partial UNIQUE: en klient kan kun have ÉT aktivt ejer-team
CREATE UNIQUE INDEX client_teams_one_active_owner
  ON public.client_teams (client_id)
  WHERE to_date IS NULL;

CREATE INDEX client_teams_client_idx ON public.client_teams (client_id);
CREATE INDEX client_teams_team_idx ON public.client_teams (team_id);

CREATE OR REPLACE FUNCTION public.client_teams_immutability_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'client_teams: DELETE blokeret (historik er immutable)'
      USING ERRCODE = '0A000';
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.client_id IS DISTINCT FROM OLD.client_id
       OR NEW.team_id IS DISTINCT FROM OLD.team_id
       OR NEW.from_date IS DISTINCT FROM OLD.from_date
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'client_teams: kun to_date kan opdateres (resten er immutable)'
        USING ERRCODE = '0A000';
    END IF;
    IF OLD.to_date IS NOT NULL THEN
      RAISE EXCEPTION 'client_teams: kan ikke aendre to_date efter den er sat'
        USING ERRCODE = '0A000';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER client_teams_immutability
  BEFORE UPDATE OR DELETE ON public.client_teams
  FOR EACH ROW EXECUTE FUNCTION public.client_teams_immutability_check();

CREATE TRIGGER client_teams_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.client_teams
  FOR EACH ROW EXECUTE FUNCTION public.stork_audit();

ALTER TABLE public.client_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_teams FORCE ROW LEVEL SECURITY;

CREATE POLICY client_teams_select ON public.client_teams
  FOR SELECT TO authenticated USING (true);

CREATE POLICY client_teams_insert ON public.client_teams
  FOR INSERT
  WITH CHECK (current_setting('stork.allow_client_teams_write', true) = 'true');

CREATE POLICY client_teams_update ON public.client_teams
  FOR UPDATE
  USING (current_setting('stork.allow_client_teams_write', true) = 'true')
  WITH CHECK (current_setting('stork.allow_client_teams_write', true) = 'true');

REVOKE ALL ON TABLE public.client_teams FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.client_teams TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- ALTER employees: tilfoej current_org_unit_id
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE public.employees
  ADD COLUMN current_org_unit_id uuid REFERENCES public.org_units(id) ON DELETE RESTRICT;

COMMENT ON COLUMN public.employees.current_org_unit_id IS
  'D7: org-position. NULL = ingen position (typisk admin). Stab uden team haenger her direkte. Saelger med team kan ogsaa have current_org_unit_id sat - matrix-organisation tilladt per §5.3. UI-disciplin haandhaever konsistens, ikke schema.';

CREATE INDEX employees_current_org_unit_idx ON public.employees (current_org_unit_id)
  WHERE anonymized_at IS NULL AND current_org_unit_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- ALTER role_page_permissions: udvid scope-enum med 'subtree'
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE public.role_page_permissions
  DROP CONSTRAINT role_page_permissions_scope_check;
ALTER TABLE public.role_page_permissions
  ADD CONSTRAINT role_page_permissions_scope_check
    CHECK (scope IN ('all', 'subtree', 'team', 'self'));

-- ─────────────────────────────────────────────────────────────────────────
-- Helper-funktioner
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.current_employee_team()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT et.team_id
  FROM public.employees e
  JOIN public.employee_teams et ON et.employee_id = e.id
  WHERE e.auth_user_id = (SELECT auth.uid())
    AND e.anonymized_at IS NULL
    AND (e.termination_date IS NULL OR e.termination_date > current_date)
    AND et.to_date IS NULL;
$$;

COMMENT ON FUNCTION public.current_employee_team() IS
  'D7: returnerer aktiv team-id for current auth.uid(). NULL hvis ingen aktiv tilknytning eller ingen mappet employee.';

CREATE OR REPLACE FUNCTION public.current_employee_org_unit()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT e.current_org_unit_id
  FROM public.employees e
  WHERE e.auth_user_id = (SELECT auth.uid())
    AND e.anonymized_at IS NULL
    AND (e.termination_date IS NULL OR e.termination_date > current_date);
$$;

COMMENT ON FUNCTION public.current_employee_org_unit() IS
  'D7: returnerer current_org_unit_id for current auth.uid(). NULL hvis ingen position.';

CREATE OR REPLACE FUNCTION public.employee_team_at(p_employee_id uuid, p_date date)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT team_id
  FROM public.employee_teams
  WHERE employee_id = p_employee_id
    AND from_date <= p_date
    AND (to_date IS NULL OR to_date >= p_date)
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.employee_team_at(uuid, date) IS
  'D7: historisk team-lookup for employee paa given dato.';

CREATE OR REPLACE FUNCTION public.client_team_at(p_client_id uuid, p_date date)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT team_id
  FROM public.client_teams
  WHERE client_id = p_client_id
    AND from_date <= p_date
    AND (to_date IS NULL OR to_date >= p_date)
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.client_team_at(uuid, date) IS
  'D7: historisk klient-team-lookup paa given dato. Bruges af lag E ved sales INSERT for at finde team-id-snapshot.';

CREATE OR REPLACE FUNCTION public.org_unit_subtree(p_root_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH RECURSIVE descendants AS (
    SELECT id FROM public.org_units WHERE id = p_root_id
    UNION ALL
    SELECT o.id
    FROM public.org_units o
    JOIN descendants d ON o.parent_id = d.id
  )
  SELECT id FROM descendants;
$$;

COMMENT ON FUNCTION public.org_unit_subtree(uuid) IS
  'D7: returnerer root + alle descendants i org-traeet. Bruges af scope=subtree RLS-policies.';

CREATE OR REPLACE FUNCTION public.current_employee_subtree_teams()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT t.id
  FROM public.teams t
  WHERE t.org_unit_id IN (
    SELECT public.org_unit_subtree(public.current_employee_org_unit())
  );
$$;

COMMENT ON FUNCTION public.current_employee_subtree_teams() IS
  'D7: returnerer alle team-ids under current employees org-position (inkl. dennes eget niveau). Bruges af scope=subtree RLS-policies paa sales-lignende tabeller i lag E.';

REVOKE ALL ON FUNCTION public.current_employee_team() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_employee_org_unit() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.employee_team_at(uuid, date) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.client_team_at(uuid, date) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.org_unit_subtree(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_employee_subtree_teams() FROM PUBLIC, anon;

-- ─────────────────────────────────────────────────────────────────────────
-- RPCs (admin-only via is_admin())
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.org_unit_upsert(
  p_name text,
  p_change_reason text,
  p_org_unit_id uuid DEFAULT NULL,
  p_parent_id uuid DEFAULT NULL,
  p_is_active bool DEFAULT true
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
    RAISE EXCEPTION 'org_unit_upsert: insufficient permissions' USING ERRCODE = '42501';
  END IF;
  IF p_change_reason IS NULL OR length(trim(p_change_reason)) = 0 THEN
    RAISE EXCEPTION 'org_unit_upsert: change_reason er paakraevet';
  END IF;

  PERFORM set_config('stork.source_type', 'manual', true);
  PERFORM set_config('stork.change_reason', p_change_reason, true);
  PERFORM set_config('stork.allow_org_units_write', 'true', true);

  IF p_org_unit_id IS NULL THEN
    INSERT INTO public.org_units (name, parent_id, is_active)
    VALUES (p_name, p_parent_id, p_is_active)
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.org_units
    SET name = p_name, parent_id = p_parent_id, is_active = p_is_active
    WHERE id = p_org_unit_id
    RETURNING id INTO v_id;
    IF v_id IS NULL THEN
      RAISE EXCEPTION 'org_unit_upsert: org_unit % findes ikke', p_org_unit_id;
    END IF;
  END IF;
  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.org_unit_upsert(text, text, uuid, uuid, bool) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.org_unit_upsert(text, text, uuid, uuid, bool) TO authenticated;

CREATE OR REPLACE FUNCTION public.team_upsert(
  p_name text,
  p_org_unit_id uuid,
  p_change_reason text,
  p_team_id uuid DEFAULT NULL,
  p_is_active bool DEFAULT true
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
    RAISE EXCEPTION 'team_upsert: insufficient permissions' USING ERRCODE = '42501';
  END IF;
  IF p_change_reason IS NULL OR length(trim(p_change_reason)) = 0 THEN
    RAISE EXCEPTION 'team_upsert: change_reason er paakraevet';
  END IF;

  PERFORM set_config('stork.source_type', 'manual', true);
  PERFORM set_config('stork.change_reason', p_change_reason, true);
  PERFORM set_config('stork.allow_teams_write', 'true', true);

  IF p_team_id IS NULL THEN
    INSERT INTO public.teams (name, org_unit_id, is_active)
    VALUES (p_name, p_org_unit_id, p_is_active)
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.teams
    SET name = p_name, org_unit_id = p_org_unit_id, is_active = p_is_active
    WHERE id = p_team_id
    RETURNING id INTO v_id;
    IF v_id IS NULL THEN
      RAISE EXCEPTION 'team_upsert: team % findes ikke', p_team_id;
    END IF;
  END IF;
  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.team_upsert(text, uuid, text, uuid, bool) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.team_upsert(text, uuid, text, uuid, bool) TO authenticated;

CREATE OR REPLACE FUNCTION public.employee_assign_to_team(
  p_employee_id uuid,
  p_team_id uuid,
  p_change_reason text,
  p_from_date date DEFAULT current_date
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_new_id uuid;
  v_close_date date;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'employee_assign_to_team: insufficient permissions' USING ERRCODE = '42501';
  END IF;
  IF p_change_reason IS NULL OR length(trim(p_change_reason)) = 0 THEN
    RAISE EXCEPTION 'employee_assign_to_team: change_reason er paakraevet';
  END IF;

  v_close_date := p_from_date - 1;

  PERFORM set_config('stork.source_type', 'manual', true);
  PERFORM set_config('stork.change_reason', p_change_reason, true);
  PERFORM set_config('stork.allow_employee_teams_write', 'true', true);

  -- Luk eventuel aktiv tildeling
  UPDATE public.employee_teams
  SET to_date = v_close_date
  WHERE employee_id = p_employee_id AND to_date IS NULL;

  -- p_team_id NULL = unassign (kun luk; ingen ny row)
  IF p_team_id IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.employee_teams (employee_id, team_id, from_date)
  VALUES (p_employee_id, p_team_id, p_from_date)
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.employee_assign_to_team(uuid, uuid, text, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.employee_assign_to_team(uuid, uuid, text, date) TO authenticated;

CREATE OR REPLACE FUNCTION public.employee_assign_to_org_unit(
  p_employee_id uuid,
  p_org_unit_id uuid,
  p_change_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'employee_assign_to_org_unit: insufficient permissions' USING ERRCODE = '42501';
  END IF;
  IF p_change_reason IS NULL OR length(trim(p_change_reason)) = 0 THEN
    RAISE EXCEPTION 'employee_assign_to_org_unit: change_reason er paakraevet';
  END IF;

  PERFORM set_config('stork.source_type', 'manual', true);
  PERFORM set_config('stork.change_reason', p_change_reason, true);
  PERFORM set_config('stork.allow_employees_write', 'true', true);

  UPDATE public.employees
  SET current_org_unit_id = p_org_unit_id
  WHERE id = p_employee_id AND anonymized_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'employee_assign_to_org_unit: employee % findes ikke eller er anonymiseret', p_employee_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.employee_assign_to_org_unit(uuid, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.employee_assign_to_org_unit(uuid, uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.client_assign_to_team(
  p_client_id uuid,
  p_team_id uuid,
  p_change_reason text,
  p_from_date date DEFAULT current_date
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_new_id uuid;
  v_close_date date;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'client_assign_to_team: insufficient permissions' USING ERRCODE = '42501';
  END IF;
  IF p_change_reason IS NULL OR length(trim(p_change_reason)) = 0 THEN
    RAISE EXCEPTION 'client_assign_to_team: change_reason er paakraevet';
  END IF;

  v_close_date := p_from_date - 1;

  PERFORM set_config('stork.source_type', 'manual', true);
  PERFORM set_config('stork.change_reason', p_change_reason, true);
  PERFORM set_config('stork.allow_client_teams_write', 'true', true);

  UPDATE public.client_teams
  SET to_date = v_close_date
  WHERE client_id = p_client_id AND to_date IS NULL;

  IF p_team_id IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.client_teams (client_id, team_id, from_date)
  VALUES (p_client_id, p_team_id, p_from_date)
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.client_assign_to_team(uuid, uuid, text, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.client_assign_to_team(uuid, uuid, text, date) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- Klassifikation: 25 nye raekker
-- ─────────────────────────────────────────────────────────────────────────

SELECT set_config('stork.source_type', 'manual', true);
SELECT set_config('stork.change_reason',
  'D7: seed klassifikation for org_units (6) + teams (6) + employee_teams (6) + client_teams (6) + employees.current_org_unit_id (1)', true);
SELECT set_config('stork.allow_data_field_definitions_write', 'true', true);

INSERT INTO public.data_field_definitions
  (table_schema, table_name, column_name, category, pii_level,
   retention_type, retention_value, match_role, purpose)
VALUES
  -- employees.current_org_unit_id (1)
  ('public', 'employees', 'current_org_unit_id', 'master_data', 'none', 'manual', '{"event": "row_anonymized"}'::jsonb, NULL, 'D7: FK til org_units; NULL = ingen org-position (typisk admin)'),

  -- org_units (6)
  ('public', 'org_units', 'id',         'konfiguration', 'none', 'manual', '{"event": "org_unit_deactivated"}'::jsonb, NULL, 'D7: org-unit PK'),
  ('public', 'org_units', 'name',       'konfiguration', 'none', 'manual', '{"event": "org_unit_deactivated"}'::jsonb, NULL, 'D7: org-unit-navn (globalt unikt)'),
  ('public', 'org_units', 'parent_id',  'konfiguration', 'none', 'manual', '{"event": "org_unit_deactivated"}'::jsonb, NULL, 'D7: FK til parent org_unit; NULL = rod-niveau'),
  ('public', 'org_units', 'is_active',  'konfiguration', 'none', 'manual', '{"event": "org_unit_deactivated"}'::jsonb, NULL, 'D7: aktiv-flag; false = udfaset'),
  ('public', 'org_units', 'created_at', 'konfiguration', 'none', 'manual', '{"event": "org_unit_deactivated"}'::jsonb, NULL, 'D7: INSERT-tid'),
  ('public', 'org_units', 'updated_at', 'konfiguration', 'none', 'manual', '{"event": "org_unit_deactivated"}'::jsonb, NULL, 'D7: sidste mutation'),

  -- teams (6)
  ('public', 'teams', 'id',           'konfiguration', 'none', 'manual', '{"event": "team_deactivated"}'::jsonb, NULL, 'D7: team PK'),
  ('public', 'teams', 'name',         'konfiguration', 'none', 'manual', '{"event": "team_deactivated"}'::jsonb, NULL, 'D7: team-navn (globalt unikt)'),
  ('public', 'teams', 'org_unit_id',  'konfiguration', 'none', 'manual', '{"event": "team_deactivated"}'::jsonb, NULL, 'D7: FK til org_unit (haenger som blad i traeet)'),
  ('public', 'teams', 'is_active',    'konfiguration', 'none', 'manual', '{"event": "team_deactivated"}'::jsonb, NULL, 'D7: aktiv-flag'),
  ('public', 'teams', 'created_at',   'konfiguration', 'none', 'manual', '{"event": "team_deactivated"}'::jsonb, NULL, 'D7: INSERT-tid'),
  ('public', 'teams', 'updated_at',   'konfiguration', 'none', 'manual', '{"event": "team_deactivated"}'::jsonb, NULL, 'D7: sidste mutation'),

  -- employee_teams (6) — historik, master_data fordi det er stamkort over tilknytninger
  ('public', 'employee_teams', 'id',          'master_data', 'none',     'manual', '{"event": "row_anonymized"}'::jsonb, NULL, 'D7: assignment PK'),
  ('public', 'employee_teams', 'employee_id', 'master_data', 'indirect', 'manual', '{"event": "row_anonymized"}'::jsonb, NULL, 'D7: FK til employees (indirect via person-ref)'),
  ('public', 'employee_teams', 'team_id',     'master_data', 'none',     'manual', '{"event": "row_anonymized"}'::jsonb, NULL, 'D7: FK til teams'),
  ('public', 'employee_teams', 'from_date',   'master_data', 'none',     'manual', '{"event": "row_anonymized"}'::jsonb, NULL, 'D7: assignment-start (inklusiv)'),
  ('public', 'employee_teams', 'to_date',     'master_data', 'none',     'manual', '{"event": "row_anonymized"}'::jsonb, NULL, 'D7: assignment-slut (inklusiv); NULL = aktiv'),
  ('public', 'employee_teams', 'created_at',  'master_data', 'none',     'manual', '{"event": "row_anonymized"}'::jsonb, NULL, 'D7: INSERT-tid'),

  -- client_teams (6) — historik
  ('public', 'client_teams', 'id',          'master_data', 'none',     'manual', '{"event": "row_anonymized"}'::jsonb, NULL, 'D7: ownership PK'),
  ('public', 'client_teams', 'client_id',   'master_data', 'indirect', 'manual', '{"event": "row_anonymized"}'::jsonb, NULL, 'D7: FK til clients'),
  ('public', 'client_teams', 'team_id',     'master_data', 'none',     'manual', '{"event": "row_anonymized"}'::jsonb, NULL, 'D7: FK til teams'),
  ('public', 'client_teams', 'from_date',   'master_data', 'none',     'manual', '{"event": "row_anonymized"}'::jsonb, NULL, 'D7: ownership-start (inklusiv)'),
  ('public', 'client_teams', 'to_date',     'master_data', 'none',     'manual', '{"event": "row_anonymized"}'::jsonb, NULL, 'D7: ownership-slut (inklusiv); NULL = aktiv'),
  ('public', 'client_teams', 'created_at',  'master_data', 'none',     'manual', '{"event": "row_anonymized"}'::jsonb, NULL, 'D7: INSERT-tid');
