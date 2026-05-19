# T9-supplement V3 — Codex approval

**Review-type:** Plan V3  
**Rolle:** Codex kode-review, teknisk gennemførlighed  
**Resultat:** APPROVAL  
**Oprydnings- og opdaterings-strategi:** OK — konkret sektion findes i `docs/coordination/T9-supplement-plan.md:462`.

## Vurdering

V3 lukker de to KRITISK-fund fra V2 på kode-niveau:

- `client_placement_read_at` current/history-intersection er adresseret med en session-var-baseret RLS-policy, hvor RPC og RLS evaluerer samme dato.
- Team-no-children er løftet fra `effective_from`-punktcheck til interval-overlap-invariant med `daterange(...) && daterange(...)`.

V2's MELLEM-fund om service-role-only exposure-check er også håndteret rimeligt: service-role forbliver et deterministisk schema-exposure-signal, og planen tilføjer SQL-baseret authenticated-callability-check for `authenticated`-rollen.

Ingen KRITISKE eller MELLEM fund der skal blokere V3.

## OPGRADERING-forslag

### [OPGRADERING] Gør read-at session-var-håndtering eksplicit funktionslokal

Code's foreslåede løsning: `_at`-RPCs sætter `set_config('stork.t9_read_at_date', p_date::text, true)` før SELECT, mens current-wrappers ikke sætter session-var.

Dit bedre alternativ: Implementer `_at`-RPCs som `plpgsql` og sæt session-var eksplicit i alle entrypoints, også current-wrappers via `_at(..., current_date)` eller direkte `current_date` set. Undgå at en tidligere `_at`-kald i samme transaction kan efterlade en transaction-local GUC som påvirker et efterfølgende current-read.

Teknisk begrundelse: `set_config(..., true)` er transaction-local, ikke function-local. PostgREST kalder typisk én RPC per transaction, men smoke-tests og interne DB-kald kan køre flere reads i samme transaction. Explicit set i alle entrypoints gør adfærden deterministisk.

Anbefalet handling: Implementer i build eller afvis med teknisk begrundelse.

### [OPGRADERING] Skil EXECUTE-grant-check fra intern permission_denied i testen

Code's foreslåede løsning: `set local role authenticated` + fixture JWT-claim + kald hver T9 read-RPC og forvent ingen 42501 fra manglende EXECUTE-grant.

Dit bedre alternativ: Kombiner runtime-kald med deklarative `has_function_privilege('authenticated', ..., 'EXECUTE')` assertions for alle 9 read-RPCs. Runtime-kald for admin-only RPCs skal bruge en fixture-role med relevant permission, ellers kan intern `_require_read_permission` give samme SQLSTATE 42501 som en manglende function-grant.

Teknisk begrundelse: Function-level permission denial og intern permission-denied bruger begge 42501. Deklarativ grant-check fjerner tvetydighed.

Anbefalet handling: Implementer i build eller afvis med teknisk begrundelse.

## Kosmetisk note

Planen gentager linjen om `employee_node_placements_select` to gange (`docs/coordination/T9-supplement-plan.md:214` og `:216`). Det er ikke en blocker.
