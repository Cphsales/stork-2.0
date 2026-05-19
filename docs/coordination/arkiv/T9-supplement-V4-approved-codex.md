# T9-supplement V4 — Codex approval

**Review-type:** Plan V4
**Reviewer:** Codex
**Resultat:** APPROVAL
**Branch:** `claude/T9-supplement-plan`
**Plan-commit reviewet:** `c851ad7`

## Vurdering

V4 håndterer de to OPGRADERING-forslag fra V3 på kode-niveau:

- Alle 9 read-RPC entrypoints sættes som PL/pgSQL-entrypoints med eksplicit `set_config('stork.t9_read_at_date', ..., true)` i både `_at`-RPCs og current-wrappers. Det lukker risikoen for stale transaction-local session-var efter et tidligere `_at`-kald.
- `t9_read_gates.sql` skiller EXECUTE-grant-verifikation fra runtime-permission-verifikation via `has_function_privilege(...)` før de interne 42501-tests. Det gør testfejl diagnoserbare og undgår at function-grant-mangler forveksles med `_require_read_permission`.

Den obligatoriske `Oprydnings- og opdaterings-strategi` er til stede og konkret. Ingen nye KRITISK eller MELLEM kode-niveau fund.

## Noter

Ingen nye OPGRADERING-forslag.

KOSMETISK: V3-historiksektionen beskriver stadig V3-adfærden med at current-wrapper ikke sætter session-var. V4's åbningssektion og Step 3c overstyrer dette korrekt, så det er ikke et blocker-fund.
