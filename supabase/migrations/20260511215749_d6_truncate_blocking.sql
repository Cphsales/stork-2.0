-- D6: BEFORE TRUNCATE-trigger på immutable tabeller.
--
-- audit_log, commission_snapshots, salary_corrections og cancellations
-- har alle BEFORE UPDATE/DELETE-immutability-triggers fra C2/C4/C4.1.
-- TRUNCATE bypassser row-level triggers (det er en table-level op),
-- så DELETE-blokeringen alene er ikke nok. Vi blokerer TRUNCATE
-- eksplicit på statement-niveau.
--
-- Compliance-fasens GDPR retroaktiv-RPC får exception-vej via samme
-- session-var-pattern som audit_log_immutability_check (roadmap pkt 2).
-- Indtil mekanismen lander er TRUNCATE 100% blokeret.

CREATE OR REPLACE FUNCTION public.block_truncate_immutable()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'TRUNCATE blokeret paa %.% - tabellen er immutable (kun INSERT eller compliance-RPC kan modificere)',
    TG_TABLE_SCHEMA, TG_TABLE_NAME
    USING ERRCODE = '0A000';
END;
$$;

COMMENT ON FUNCTION public.block_truncate_immutable() IS
  'D6: BEFORE TRUNCATE-trigger der blokerer TRUNCATE paa immutable tabeller (audit_log, commission_snapshots, salary_corrections, cancellations). Compliance-RPC i fremtidig fase faar exception-vej via session-var (roadmap-post-fase-0 pkt 2).';

REVOKE ALL ON FUNCTION public.block_truncate_immutable() FROM PUBLIC, anon;

CREATE TRIGGER audit_log_block_truncate
  BEFORE TRUNCATE ON public.audit_log
  EXECUTE FUNCTION public.block_truncate_immutable();

CREATE TRIGGER commission_snapshots_block_truncate
  BEFORE TRUNCATE ON public.commission_snapshots
  EXECUTE FUNCTION public.block_truncate_immutable();

CREATE TRIGGER salary_corrections_block_truncate
  BEFORE TRUNCATE ON public.salary_corrections
  EXECUTE FUNCTION public.block_truncate_immutable();

CREATE TRIGGER cancellations_block_truncate
  BEFORE TRUNCATE ON public.cancellations
  EXECUTE FUNCTION public.block_truncate_immutable();
