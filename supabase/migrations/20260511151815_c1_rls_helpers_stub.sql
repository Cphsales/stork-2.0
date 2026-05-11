-- C1: RLS-template — stub helper functions for senere RLS-policies.
--
-- Lag D omdefinerer disse til at læse fra employees + role_page_permissions.
-- Indtil da returnerer de safe defaults så RLS-policies kan reference dem
-- uden circular schema dependencies.
--
-- ─────────────────────────────────────────────────────────────────────────
-- TEMPLATE-mønster for fremtidige feature-tabeller (lag D+):
--
--   CREATE TABLE public.example (...);
--   ALTER TABLE public.example ENABLE ROW LEVEL SECURITY;
--   ALTER TABLE public.example FORCE ROW LEVEL SECURITY;  -- også for owner/service_role
--   -- Default deny: RLS enabled + ingen policies = ingen adgang for nogen.
--   -- Tilføj specifikke policies for read/write efter behov.
--
-- Opt-out af FORCE (kræver eksplicit begrundelse i kommentar over ALTER TABLE):
--   -- skip-force-rls: <reason>
--   ALTER TABLE public.example ENABLE ROW LEVEL SECURITY;
--
-- Privilegerede operationer (cron, webhook, triggers der mutater andre tabeller)
-- gennem SECURITY DEFINER-funktioner — ikke via service_role-bagdøre.
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.current_employee_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  -- Stub: null indtil lag D introducerer employees-tabel + auth.uid() → employee_id mapping.
  SELECT NULL::uuid;
$$;

COMMENT ON FUNCTION public.current_employee_id() IS
  'C1 stub. Returnerer employee_id for nuværende auth.uid() (null hvis ingen mapping). Omdefineres i lag D.';

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  -- Stub: false indtil lag D introducerer role_page_permissions.
  SELECT false;
$$;

COMMENT ON FUNCTION public.is_admin() IS
  'C1 stub. Returnerer true hvis nuværende bruger har admin-rolle. Omdefineres i lag D.';

-- Default deny på funktioner: revoke alt, grant execute kun til authenticated.
-- Mønstret matcher FORCE RLS-princippet: ingen implicit adgang for nogen rolle.
REVOKE ALL ON FUNCTION public.current_employee_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_employee_id() TO authenticated;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
