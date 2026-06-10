---
status: skitse
type: opfølgnings-pakke
forudsætning: T9-fundament leveret (PR #34-40 merget, alle migrations applied)
plan-flow: krav-dok → plan → Codex review → Mathias godkendelse → build
---

# T9-supplement — scope-skitse

## Formål

T9-fundament er leveret (org-træ + permission-elementer + grants + fortrydelses-mekanisme + §1.1 session-var-pattern + master-plan §1.7-omskrivning). Denne pakke håndterer de fund som Codex runde 1+2 identificerede som "ikke i fundament-PR" og som senere blev bekræftet via PR #39's review.

## Scope (foreløbig liste — kræver krav-dok)

### KRITISK

**1. Team-retype trigger-fix**

- `core_identity._org_node_team_no_children_check()` blokerer kun ny child under team-parent. Blokerer IKKE retype af eksisterende department til `node_type='team'` når department har children
- Fix: tilføj forward-check i trigger (CREATE OR REPLACE i ny migration)
- Reference: Codex runde 2 KRITISK 1; Code's runde 2-verifikation (T9-diagnose-runde-2 §1)

**2. Backdated effective_from guards på alle 7 apply-handlers**

- Alle handlers der sætter `effective_to = brugerens_effective_from` på en eksisterende open-ended row bryder CHECK-constraint (`effective_from < effective_to`) ved backdated effective_from
- Ramte handlers: `_apply_employee_place`, `_apply_employee_remove`, `_apply_org_node_upsert`, `_apply_org_node_deactivate`, `_apply_team_close`, `_apply_client_place`, `_apply_client_close` (7 stk — alle der lukker open-ended row med ny effective_from)
- Fix: pre-update guard der afviser `effective_from <= prior_open.effective_from`
- Policy-spørgsmål: forbyd backdating helt, eller tillad med historisk traversal? Anbefaling: forbyd
- Reference: Codex runde 2 KRITISK 4 + Codex runde 1 på PR #41 (MELLEM 2 — Code's runde 1 skitse listede kun 5 handlers; manglende \_apply_employee_remove + \_apply_client_close)

**3. API/schema exposure**

- PostgREST eksponerer kun `public` + `graphql_public` (verificeret mod remote `/rest/v1/`)
- T9 RPCs i `core_identity` er ikke callable fra frontend
- Fix: Mathias tilføjer `core_identity`, `core_compliance`, `core_money` til exposed schemas i Supabase Dashboard
- Reference: Codex runde 2 KRITISK 3; Code's verifikation (T9-diagnose-runde-2 §3)
- **Bemærk:** Kræver Mathias' Dashboard-handling, ikke kode-leverance. Skal verificeres efter at Dashboard er opdateret

**4. Import-stubs scope-afklaring**

- Step 10 (build-trin) leverede `.mjs`-stubs i `scripts/migration/t9-org-tree-{discovery,upload}.mjs` der printer "TODO"-tekst
- Krav-dok 4.8 specificerer "Generér discovery-rapport" + "Eksekvér import" som T9-leverance
- Beslutning nødvendig: implementér nu (cutover-blocker) eller udskyd til ægte cutover-pakke
- Reference: Codex runde 2 KRITISK 5; Code's vurdering (delvis ret — scope-leverance-mangel, ikke kode-bug)

### MELLEM

**5. Type-codegen**

- `packages/types/src/database.ts` er placeholder. `scripts/types-check.sh` skipper drift-check ved placeholder-markør
- Fix: forudsætter KRITISK 3 lukket. Derefter `pnpm types:generate --schema=public --schema=core_identity --schema=core_compliance --schema=core_money` + commit + fjern placeholder-guard
- Reference: Codex runde 2 MELLEM 2

**6. Read-RPC gates**

- 9 read-RPCs er SECURITY INVOKER uden permission-check i body. De relier på RLS-policies på underliggende tabeller. Ikke et bug i sig selv, men inkonsistent med write-RPC-mønstret hvor has_permission-check er eksplicit
- Beslutning nødvendig: tilføj has_permission-check (defense-in-depth) eller bevar RLS-only-mønstret
- Reference: Codex runde 2 MELLEM

**7. Step 12 superadmin-robusthed**

- Step 12's else-branch (`if v_superadmin_role_id is null then ... else ... end if;`) hopper over `update employees set role_id = ...` for mg@/km@ hvis superadmin allerede findes. Fungerer for nuværende remote-state men er fragile mod alternative bootstrap-scenarier
- Fix: udvid logik til at sikre mg@/km@ altid har superadmin role_id post-seed
- Reference: Code's diagnose-rapport runde 1 §3

## Disciplin-noter

- Mathias' Dashboard-handlinger (KRITISK 3) ligger uden for Code's PR-scope men skal verificeres som del af pakke-afslutning
- KRITISK 4's policy-beslutning (forbyd vs. tillad backdating) skal afgøres af Mathias før build
- Import-stubs scope (KRITISK 5) er den eneste fund der potentielt kunne flytte til separat cutover-pakke

## Plan-flow

1. Mathias afgør KRITISK 4-policy + KRITISK 5-scope
2. Krav-dok udfærdiges (`docs/coordination/T9-supplement-krav.md`)
3. Plan-fil skrives (`docs/coordination/T9-supplement-plan.md`)
4. Codex review
5. Mathias godkendelse
6. Build i én PR (eller flere afhængigt af scope)

Aktiv-plan opdateres når krav-dok er på plads.
