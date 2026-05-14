-- C006: Break-glass dispatcher allowlisted via regprocedure + inaktivér gdpr.
--
-- BAGGRUND (Codex-fund C006):
-- 1. gdpr_retroactive_remove seedet med is_active=true, men
--    core_compliance.gdpr_retroactive_remove_via_break_glass findes ikke.
--    En requester kunne anmode operationen, men execute ville fejle med
--    obskur fejl (function does not exist) sent i flow'et.
-- 2. break_glass_execute bygger SQL med format('select %s($1,$2)', internal_rpc)
--    fra fri-tekst-konfig-værdi. Skadeligt indhold i operation_types.internal_rpc
--    ville eksekvere som SECURITY DEFINER med fuld postgres-privilegier.
--
-- MASTER-PLAN-PARAGRAF:
-- §1.15 (break-glass-flow generisk + UI-redigerbar operation_types).
-- §1.1 (sikkerheds-disciplin: default deny, eksplicit grants).
--
-- VALGT LØSNING:
-- 1. Sæt gdpr_retroactive_remove.is_active=false. Re-aktiveres når RPC bygges
--    (post-fase-E pr. master-plan §1.13). break_glass_request afviser allerede
--    inaktive operation_types — request kan ikke oprettes.
-- 2. Dispatcher validerer internal_rpc via regprocedure-cast FØR EXECUTE.
--    Hvis funktionen ikke findes ELLER signaturen ikke matcher (uuid, text),
--    kastes exception 42883 før noget eksekveres. PG's eget type-system bliver
--    allowlisten.
--
-- VISION-TJEK:
-- - §1.15 opfyldt? JA — dispatcher håndhæver eksistens-tjek; ingen "stille fejl".
-- - §1.1 opfyldt? JA — regprocedure er PG-native validation, ikke fri tekst.
-- - Symptom vs. krav: PG's regprocedure-type er den canoniske allowlist-mekanisme.
--   Ikke et symptom-fix.
-- - Konklusion: FORSVARLIGT.

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Inaktivér gdpr_retroactive_remove
-- ─────────────────────────────────────────────────────────────────────────

select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason',
  'C006: inaktivér gdpr_retroactive_remove indtil RPC implementeres post-fase-E',
  false);
select set_config('stork.allow_break_glass_operation_types_write', 'true', false);

update core_compliance.break_glass_operation_types
   set is_active = false,
       description = 'INAKTIV — gdpr_retroactive_remove_via_break_glass RPC findes ikke endnu (bygges post-fase-E pr. master-plan §1.13). Re-aktiveres når RPC eksisterer.'
 where operation_type = 'gdpr_retroactive_remove';

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Refactor break_glass_execute med regprocedure-validation
-- ─────────────────────────────────────────────────────────────────────────

create or replace function core_compliance.break_glass_execute(p_request_id uuid)
returns core_compliance.break_glass_requests
language plpgsql
security definer
set search_path = ''
as $func$
declare
  v_request core_compliance.break_glass_requests;
  v_operation core_compliance.break_glass_operation_types;
  v_actor_id uuid;
  v_row core_compliance.break_glass_requests;
  v_proc regprocedure;
begin
  if not core_identity.is_admin() then
    raise exception 'break_glass_execute kraever admin-permission' using errcode = '42501';
  end if;

  v_actor_id := core_identity.current_employee_id();
  if v_actor_id is null then
    raise exception 'kan ikke identificere executor' using errcode = '42501';
  end if;

  select * into v_request from core_compliance.break_glass_requests where id = p_request_id for update;
  if v_request.id is null then
    raise exception 'break_glass_request ikke fundet: %', p_request_id using errcode = 'P0002';
  end if;
  if v_request.status <> 'approved' then
    raise exception 'break_glass_request er ikke approved (status=%)', v_request.status using errcode = 'P0001';
  end if;
  if v_request.expires_at < now() then
    raise exception 'break_glass_request er udløbet (expires_at=%)', v_request.expires_at using errcode = 'P0001';
  end if;
  if v_actor_id <> v_request.requested_by and v_actor_id <> v_request.approved_by then
    raise exception 'kun requester eller approver kan execute (actor=%)', v_actor_id using errcode = '42501';
  end if;

  select * into v_operation
    from core_compliance.break_glass_operation_types
   where operation_type = v_request.operation_type
     and is_active = true;
  if v_operation.id is null then
    raise exception 'operation_type % ikke længere aktiv', v_request.operation_type using errcode = 'P0001';
  end if;

  -- C006-fix: validér internal_rpc via regprocedure FØR EXECUTE.
  -- Cast fejler med 42883 hvis funktionen ikke findes ELLER signaturen
  -- ikke matcher (uuid, text). PG's eget type-system bliver allowlisten;
  -- fri-tekst-injection forhindres.
  begin
    v_proc := (v_operation.internal_rpc || '(uuid, text)')::regprocedure;
  exception when undefined_function then
    raise exception 'break_glass operation_type % har ugyldig internal_rpc=%: funktion eksisterer ikke eller har forkert signatur (forventer (uuid, text))',
      v_request.operation_type, v_operation.internal_rpc
      using errcode = 'P0001';
  end;

  -- Aktiver dispatch-vinduet
  perform set_config('stork.break_glass_dispatch', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason',
    'break_glass_execute: ' || v_request.operation_type || ' request_id=' || p_request_id,
    true);

  -- Dispatch via regprocedure::text. Værdien er nu PG-valideret (cast'et fra
  -- regprocedure-OID), så injection er udelukket.
  execute format('select %s($1, $2)', v_proc::text)
    using v_request.target_id, 'break_glass request_id=' || p_request_id;

  -- UPDATE request → executed
  perform set_config('stork.allow_break_glass_requests_write', 'true', true);
  update core_compliance.break_glass_requests
     set status = 'executed',
         executed_at = now(),
         executed_by = v_actor_id
   where id = p_request_id
   returning * into v_row;

  return v_row;
end;
$func$;

comment on function core_compliance.break_glass_execute(uuid) is
  'Master-plan §1.15 + C006-fix: dispatcher validerer internal_rpc via regprocedure-cast før EXECUTE. PG-native allowlist. Forhindrer fri-tekst-injection.';
