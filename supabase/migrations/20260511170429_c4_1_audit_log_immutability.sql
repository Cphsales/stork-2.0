-- C4.1: Audit_log immutability — fix til finding i lag C-rapport.
--
-- C2 etablerede audit_log med ENABLE RLS + 0 policies + REVOKE FROM
-- non-owner-roller. Det blokerer authenticated/service_role/anon fra
-- direkte adgang. Men postgres (owner) kunne teknisk UPDATE/DELETE
-- audit-rows fordi ingen BEFORE UPDATE/DELETE-trigger nægtede det.
--
-- Det brød "audit immutable"-princippet: rådata = bevis, må ikke
-- kunne ødelægges, heller ikke via bagdøre (SECURITY DEFINER-funktioner
-- der utilsigtet matter audit_log).
--
-- C4.1 håndhæver immutability teknisk via BEFORE UPDATE/DELETE-trigger
-- der RAISE'r altid. Audit_log er nu ÆGTE append-only.
--
-- TRUNCATE-blokering udskydes til separat migration hvis behov opstår.
-- Scope her er KUN UPDATE+DELETE per finding.

CREATE OR REPLACE FUNCTION public.audit_log_immutability_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'audit_log[%]: er immutable — append-only, ingen UPDATE/DELETE tilladt (heller ikke for owner)', OLD.id;
END;
$$;

COMMENT ON FUNCTION public.audit_log_immutability_check() IS
  'C4.1: BEFORE UPDATE/DELETE-trigger der nægter alle mutationer på audit_log. Håndhæver "audit immutable"-princippet teknisk, ikke kun via REVOKE.';

CREATE TRIGGER audit_log_immutability
  BEFORE UPDATE OR DELETE ON public.audit_log
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_immutability_check();
