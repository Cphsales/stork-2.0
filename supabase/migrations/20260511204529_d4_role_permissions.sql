-- D4: roles + role_page_permissions + redefiner is_admin()
--
-- Permission-model (Mathias' præmis-rettelse, session 4):
--   Roller er KUN samlinger af rettigheder, ikke titler. is_admin()
--   defineres som "har brugeren redigér-adgang på 'system.manage'-key,
--   scope=all" — ikke titel-baseret.
--
-- Permission-modellen er fire-dimensionel:
--   1. Hvad:           page_key + tab_key (tab_key NULL = hele page)
--   2. Adgangsniveau:  can_view + can_edit (separate boolean)
--   3. Scope:          all / team / self (1.0's visibility-enum)
--   4. Hvem:           role_id
--
-- Single role pr. employee: employees.role_id FK.
--
-- Bootstrap-seed: én "admin"-rolle med 'system.manage' can_view+can_edit
-- scope=all. Mathias mapper sig selv til admin-role manuelt efter login
-- (employees.role_id = admin-role-id). Indtil mapping eksisterer
-- returnerer is_admin() false for alle.
--
-- scope='team' forbliver inaktiv indtil lag E tilføjer team_id til
-- employees. Migration tillader scope='team'-rækker, men ingen brugere
-- vil falde inden for scope.

-- ─────────────────────────────────────────────────────────────────────────
-- roles tabel
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE public.roles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE CHECK (length(trim(name)) > 0),
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.roles IS
  'D4: roller som samlinger af rettigheder (ikke titler). Hver employee FK til én rolle. Permissions ligger i role_page_permissions. Ingen is_admin-flag på selve rollen — admin defineres som specifik permission (system.manage).';

CREATE TRIGGER roles_set_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER roles_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.stork_audit();

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles FORCE ROW LEVEL SECURITY;

CREATE POLICY roles_select ON public.roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY roles_insert ON public.roles
  FOR INSERT
  WITH CHECK (current_setting('stork.allow_roles_write', true) = 'true');

CREATE POLICY roles_update ON public.roles
  FOR UPDATE
  USING (current_setting('stork.allow_roles_write', true) = 'true')
  WITH CHECK (current_setting('stork.allow_roles_write', true) = 'true');

-- DELETE: ingen policy = default deny. Roller flyttes via UPDATE; DELETE
-- ville bryde FK-integritet til employees.

REVOKE ALL ON TABLE public.roles FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.roles TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- role_page_permissions tabel
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE public.role_page_permissions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id    uuid NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
  page_key   text NOT NULL CHECK (length(trim(page_key)) > 0),
  tab_key    text CHECK (tab_key IS NULL OR length(trim(tab_key)) > 0),
  can_view   bool NOT NULL DEFAULT false,
  can_edit   bool NOT NULL DEFAULT false,
  scope      text NOT NULL CHECK (scope IN ('all', 'team', 'self')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.role_page_permissions IS
  'D4: fire-dimensional permission-tabel. (role, page, tab, scope) bestemmer can_view + can_edit. tab_key NULL = permission gælder hele pagen. can_edit kræver typisk can_view (UI håndhæver; ikke schema-CHECK pga rule-of-three).';

-- UNIQUE constraint via partial index pga NULL-handling i standard UNIQUE
CREATE UNIQUE INDEX role_page_permissions_role_page_tab_unique
  ON public.role_page_permissions (role_id, page_key, COALESCE(tab_key, ''));

CREATE INDEX role_page_permissions_role_idx
  ON public.role_page_permissions (role_id);

CREATE TRIGGER role_page_permissions_set_updated_at
  BEFORE UPDATE ON public.role_page_permissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER role_page_permissions_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.role_page_permissions
  FOR EACH ROW EXECUTE FUNCTION public.stork_audit();

ALTER TABLE public.role_page_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_page_permissions FORCE ROW LEVEL SECURITY;

CREATE POLICY role_page_permissions_select ON public.role_page_permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY role_page_permissions_insert ON public.role_page_permissions
  FOR INSERT
  WITH CHECK (current_setting('stork.allow_role_page_permissions_write', true) = 'true');

CREATE POLICY role_page_permissions_update ON public.role_page_permissions
  FOR UPDATE
  USING (current_setting('stork.allow_role_page_permissions_write', true) = 'true')
  WITH CHECK (current_setting('stork.allow_role_page_permissions_write', true) = 'true');

CREATE POLICY role_page_permissions_delete ON public.role_page_permissions
  FOR DELETE
  USING (current_setting('stork.allow_role_page_permissions_write', true) = 'true');

REVOKE ALL ON TABLE public.role_page_permissions FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.role_page_permissions TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- ALTER employees: tilføj role_id FK
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE public.employees
  ADD COLUMN role_id uuid REFERENCES public.roles(id) ON DELETE RESTRICT;

COMMENT ON COLUMN public.employees.role_id IS
  'D4: FK til roles.id. NULL = ingen rolle (employee kan logge ind men har ingen permissions). UPDATE via employee_upsert eller direkte admin-RPC.';

CREATE INDEX employees_role_id_idx ON public.employees (role_id)
  WHERE anonymized_at IS NULL AND role_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- is_admin() redefineret fra C1-stub
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.employees e
    JOIN public.role_page_permissions rpp ON rpp.role_id = e.role_id
    WHERE e.auth_user_id = (SELECT auth.uid())
      AND e.anonymized_at IS NULL
      AND (e.termination_date IS NULL OR e.termination_date > current_date)
      AND rpp.page_key = 'system'
      AND rpp.tab_key = 'manage'
      AND rpp.can_edit = true
      AND rpp.scope = 'all'
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS
  'D4: returnerer true hvis current auth.uid() mapper til aktiv employee med en rolle der har permission (system.manage, can_edit, scope=all). Ikke titel-baseret — rent permission-baseret. NULL auth.uid() = false.';

-- ─────────────────────────────────────────────────────────────────────────
-- role_upsert(...) RPC
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.role_upsert(
  p_name text,
  p_change_reason text,
  p_role_id uuid DEFAULT NULL,
  p_description text DEFAULT NULL
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
    RAISE EXCEPTION 'role_upsert: insufficient permissions'
      USING ERRCODE = '42501';
  END IF;
  IF p_change_reason IS NULL OR length(trim(p_change_reason)) = 0 THEN
    RAISE EXCEPTION 'role_upsert: change_reason er paakraevet';
  END IF;

  PERFORM set_config('stork.source_type', 'manual', true);
  PERFORM set_config('stork.change_reason', p_change_reason, true);
  PERFORM set_config('stork.allow_roles_write', 'true', true);

  IF p_role_id IS NULL THEN
    INSERT INTO public.roles (name, description)
    VALUES (p_name, p_description)
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.roles
    SET name = p_name,
        description = p_description
    WHERE id = p_role_id
    RETURNING id INTO v_id;
    IF v_id IS NULL THEN
      RAISE EXCEPTION 'role_upsert: role % findes ikke', p_role_id;
    END IF;
  END IF;

  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION public.role_upsert(text, text, uuid, text) IS
  'D4: SECURITY DEFINER upsert af roles. p_role_id NULL = INSERT, ellers UPDATE. Kraever is_admin() (system.manage can_edit scope=all).';

REVOKE ALL ON FUNCTION public.role_upsert(text, text, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.role_upsert(text, text, uuid, text) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- role_page_permission_upsert(...) RPC
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.role_page_permission_upsert(
  p_role_id uuid,
  p_page_key text,
  p_can_view bool,
  p_can_edit bool,
  p_scope text,
  p_change_reason text,
  p_tab_key text DEFAULT NULL
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
    RAISE EXCEPTION 'role_page_permission_upsert: insufficient permissions'
      USING ERRCODE = '42501';
  END IF;
  IF p_change_reason IS NULL OR length(trim(p_change_reason)) = 0 THEN
    RAISE EXCEPTION 'role_page_permission_upsert: change_reason er paakraevet';
  END IF;
  IF p_scope NOT IN ('all', 'team', 'self') THEN
    RAISE EXCEPTION 'role_page_permission_upsert: scope skal vaere all/team/self';
  END IF;

  PERFORM set_config('stork.source_type', 'manual', true);
  PERFORM set_config('stork.change_reason', p_change_reason, true);
  PERFORM set_config('stork.allow_role_page_permissions_write', 'true', true);

  INSERT INTO public.role_page_permissions
    (role_id, page_key, tab_key, can_view, can_edit, scope)
  VALUES
    (p_role_id, p_page_key, p_tab_key, p_can_view, p_can_edit, p_scope)
  ON CONFLICT (role_id, page_key, COALESCE(tab_key, '')) DO UPDATE
  SET can_view = EXCLUDED.can_view,
      can_edit = EXCLUDED.can_edit,
      scope = EXCLUDED.scope
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION public.role_page_permission_upsert(uuid, text, bool, bool, text, text, text) IS
  'D4: SECURITY DEFINER upsert af role_page_permissions. ON CONFLICT pa (role_id, page_key, tab_key) opdaterer permission-vaerdier. Kraever is_admin().';

REVOKE ALL ON FUNCTION public.role_page_permission_upsert(uuid, text, bool, bool, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.role_page_permission_upsert(uuid, text, bool, bool, text, text, text) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- Klassifikation: 15 nye rækker (1 ny på employees + 5 roles + 9 role_page_permissions)
-- ─────────────────────────────────────────────────────────────────────────

SELECT set_config('stork.source_type', 'manual', true);
SELECT set_config('stork.change_reason',
  'D4: seed klassifikation for roles + role_page_permissions + employees.role_id', true);
SELECT set_config('stork.allow_data_field_definitions_write', 'true', true);

INSERT INTO public.data_field_definitions
  (table_schema, table_name, column_name, category, pii_level,
   retention_type, retention_value, match_role, purpose)
VALUES
  -- employees.role_id (ny kolonne)
  ('public', 'employees', 'role_id',
    'master_data', 'none',
    'manual', '{"event": "row_anonymized"}'::jsonb, NULL,
    'FK til roles.id; NULL = ingen rolle (ingen permissions)'),

  -- roles (5 kolonner)
  ('public', 'roles', 'id',
    'konfiguration', 'none',
    'manual', '{"event": "role_deleted"}'::jsonb, NULL,
    'Role PK'),
  ('public', 'roles', 'name',
    'konfiguration', 'none',
    'manual', '{"event": "role_deleted"}'::jsonb, NULL,
    'Rolle-navn (kosmetisk visning i UI); UNIQUE'),
  ('public', 'roles', 'description',
    'konfiguration', 'none',
    'manual', '{"event": "role_deleted"}'::jsonb, NULL,
    'Fri-tekst beskrivelse af rollens formaal'),
  ('public', 'roles', 'created_at',
    'konfiguration', 'none',
    'manual', '{"event": "role_deleted"}'::jsonb, NULL,
    'INSERT-tid'),
  ('public', 'roles', 'updated_at',
    'konfiguration', 'none',
    'manual', '{"event": "role_deleted"}'::jsonb, NULL,
    'Sidste mutation'),

  -- role_page_permissions (9 kolonner)
  ('public', 'role_page_permissions', 'id',
    'konfiguration', 'none',
    'manual', '{"event": "permission_removed"}'::jsonb, NULL,
    'Permission PK'),
  ('public', 'role_page_permissions', 'role_id',
    'konfiguration', 'none',
    'manual', '{"event": "permission_removed"}'::jsonb, NULL,
    'FK til roles.id'),
  ('public', 'role_page_permissions', 'page_key',
    'konfiguration', 'none',
    'manual', '{"event": "permission_removed"}'::jsonb, NULL,
    'Page-identifier (frit text-felt, UI definerer)'),
  ('public', 'role_page_permissions', 'tab_key',
    'konfiguration', 'none',
    'manual', '{"event": "permission_removed"}'::jsonb, NULL,
    'Tab-identifier; NULL = permission gaelder hele pagen'),
  ('public', 'role_page_permissions', 'can_view',
    'konfiguration', 'none',
    'manual', '{"event": "permission_removed"}'::jsonb, NULL,
    'Adgang til at se data'),
  ('public', 'role_page_permissions', 'can_edit',
    'konfiguration', 'none',
    'manual', '{"event": "permission_removed"}'::jsonb, NULL,
    'Adgang til at redigere data'),
  ('public', 'role_page_permissions', 'scope',
    'konfiguration', 'none',
    'manual', '{"event": "permission_removed"}'::jsonb, NULL,
    'Adgangsomfang: all/team/self. team-scope kraever team_id paa employees (lag E)'),
  ('public', 'role_page_permissions', 'created_at',
    'konfiguration', 'none',
    'manual', '{"event": "permission_removed"}'::jsonb, NULL,
    'INSERT-tid'),
  ('public', 'role_page_permissions', 'updated_at',
    'konfiguration', 'none',
    'manual', '{"event": "permission_removed"}'::jsonb, NULL,
    'Sidste mutation');

-- ─────────────────────────────────────────────────────────────────────────
-- Bootstrap-seed: én admin-rolle + system.manage all-edit-permission
-- ─────────────────────────────────────────────────────────────────────────

SELECT set_config('stork.source_type', 'manual', true);
SELECT set_config('stork.change_reason',
  'D4: bootstrap-seed af admin-rolle med system.manage permission (Mathias mapper sig selv manuelt post-apply)', true);
SELECT set_config('stork.allow_roles_write', 'true', true);
SELECT set_config('stork.allow_role_page_permissions_write', 'true', true);

WITH new_role AS (
  INSERT INTO public.roles (name, description)
  VALUES (
    'admin',
    'Bootstrap-rolle med system.manage permission. Givet full edit-access til alle pages via scope=all. Mathias mapper sig selv (employees.role_id) til denne rolle manuelt efter D4-apply.'
  )
  RETURNING id
)
INSERT INTO public.role_page_permissions
  (role_id, page_key, tab_key, can_view, can_edit, scope)
SELECT id, 'system', 'manage', true, true, 'all' FROM new_role;
