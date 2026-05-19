# T9-supplement — Slut-rapport

## Header

- **Pakke:** T9-supplement — lukke 6 åbne T9-fund (team-retype-overlap-invariant, schema-exposure-verifikation, backdated traversal i 7 apply-handlers, date-aware read-gates, Step 12 robusthed, type-codegen status)
- **Commit-hash:** `729e0e4` (squash-merge på main; build-range `f0b843b^..729e0e4`)
- **Plan-fil:** `claude/T9-supplement-plan` branch commit `c851ad7` (Plan V4, godkendt af Codex V3 + Claude.ai V4)
- **Krav-dok:** `docs/coordination/T9-supplement-krav-og-data.md` (Mathias-godkendt 6 afgørelser + 5 krav-formuleringer)
- **Build-PR:** [#44](https://github.com/Cphsales/stork-2.0/pull/44) (MERGED 2026-05-19 13:14 UTC)
- **Dato:** 2026-05-19 (build-start + Codex 3 runder + merge + slut-rapport — én dag)

---

## Lag-boundary-rapport

```
PAKKE T9-supplement — commit 729e0e4
Migration-gate: 1 ny migration (20260520000000_t9_supplement.sql, 1021 linjer)
Fitness: 19/19 grøn (lokalt + CI)
Scope: clean — leveret per krav-dok 6 afgørelser + Plan V4
Nye smoke-tests: 2 (t9_backdated_historical_traversal, t9_read_gates)
Udvidet smoke-test: 1 (t9_org_nodes — T11 team-retype overlap-invariant)
Nye fitness-checks: 0 (postgrest-t9-schema-exposure refactoreret til OpenAPI-introspection)
Slet stubs: 2 (scripts/migration/t9-org-tree-discovery.mjs + upload.mjs)
Branch ahead: 0 (PR #44 merget til main)
Plan-afvigelser: 0 KRITISK / 0 MELLEM efter 3 Codex-runder
G-numre tilføjet: G054 (type-codegen blokeret på Dashboard-eksponering — løses som follow-up)
G-numre løst: G053 (T9-test-fixture-hardening — verificeret i T9-test-suite)
Codex-review-runder: 3 (runde 1 = 2 KRITISK + 4 MELLEM, runde 2 = APPROVAL, runde 3 = APPROVAL)
Næste pakke: T9 cleanup eller Lag E (afventer Mathias)
```

---

## Leverancer

### Build (PR #44 — 1 migration + 2 nye smoke-tests + 1 udvidet smoke-test + fitness-check + dok)

| Leverance                                                              | Status  | Verifikation                                                                                                                                                                                                                                         |
| ---------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Section A — Team-no-children-trigger med to-vejs daterange-overlap     | leveret | `_org_node_team_no_children_check` bruger `daterange(..., '[)') && v_new_range` for både Invariant a (parent) og b (team). T11 i t9_org_nodes asserterer Invariant b.                                                                                |
| Section B — Backdated traversal i 7 apply-handlers (split-at-boundary) | leveret | 7 apply-handlers (`_apply_employee_place/_remove`, `_apply_client_place/_close`, `_apply_org_node_upsert/_deactivate`, `_apply_team_close`) implementerer split-at-boundary. t9_backdated_historical_traversal asserter T1-T12 direkte mod tabeller. |
| Section C1 — Date-aware ACL-helpers                                    | leveret | `acl_subtree_org_nodes_at(uuid, date)` + `acl_subtree_employees_at(uuid, date)` over `org_node_versions` + placements. Current-helpers refaktoreret som `_at(current_date)`-wrappers.                                                                |
| Section C2 — Udvidet SELECT-policy på `client_node_placements`         | leveret | Drop+create policy bruger session-var `stork.t9_read_at_date` (default `current_date`) som date-parameter til `acl_subtree_org_nodes_at`.                                                                                                            |
| Section C3 — 9 read-RPCs med session-var + `_require_read_permission`  | leveret | Alle 9 RPCs er plpgsql med eksplicit `set_config('stork.t9_read_at_date', ::text, true)` FØR SELECT (V4 OPGRADERING 1). Step 9 `RETURNS TABLE`-signaturer bevaret (Codex runde 1 KRITISK 1).                                                         |
| Section D — Step 12 robusthed DO-block                                 | leveret | Idempotent DO-block verificerer superadmin findes + opdaterer mg@/km@ role_id `is distinct from superadmin`.                                                                                                                                         |
| Refactor: `postgrest-t9-schema-exposure` til OpenAPI-introspection     | leveret | Service_role har ikke tabel-grants på `core_identity` (design-bevidst RLS-bypass); RPC-call ville fejle med 42501. OpenAPI-spec via `Accept-Profile: core_identity` verificerer schema + cache uden data-access.                                     |
| Slet import-stubs                                                      | leveret | `t9-org-tree-discovery.mjs` + `t9-org-tree-upload.mjs` slettet per Krav-dok afgørelse #3 (HR-driver).                                                                                                                                                |
| T9-supplement plan-arkiv                                               | leveret | Codex-reviews + plan-feedback committet i build-PR (`docs/coordination/codex-reviews/2026-05-19-t9-supplement-runde-{1,2,3}.md`).                                                                                                                    |

---

## Codex-review-runder

| Runde | Head      | Fund                                                        | Resultat                                          |
| ----- | --------- | ----------------------------------------------------------- | ------------------------------------------------- |
| 1     | `70fd47b` | 2 KRITISK + 4 MELLEM                                        | FEEDBACK — fixes leveret i `3cf5013`              |
| 2     | `3cf5013` | 0 KRITISK + 0 MELLEM (CI fitness blocker: PGRST202)         | APPROVAL — Dashboard-exposure blocker for fitness |
| 3     | `cc29472` | 0 KRITISK + 0 MELLEM (version-drift dokumenteret som watch) | APPROVAL — alle gates grønne                      |

### Runde 1 fund-håndtering

| Fund                                                                              | Klasse  | Fix-commit                                                                 |
| --------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------- |
| `CREATE OR REPLACE FUNCTION` ændrer Step 9 `RETURNS TABLE`-signaturer             | KRITISK | `3cf5013` — Step 9 signaturer bevaret; gate kun i body                     |
| `t9_backdated_historical_traversal` bruger auth-gated read-RPC som oracle         | KRITISK | `3cf5013` — refaktoreret til direkte `employee_node_placements`-assertions |
| Smoke coverage mangler `_apply_org_node_upsert`, `_apply_team_close`, team-retype | MELLEM  | `3cf5013` — BLOCK 5+6 i backdated-test + T11 i t9_org_nodes                |
| `t9_read_gates` tester ikke no-permission/granted lag                             | MELLEM  | `3cf5013` — Lag 2 fake JWT-claim → 42501 / empty; Lag 3 superadmin         |
| Type-codegen + placeholder-guard ikke leveret                                     | MELLEM  | `3cf5013` — G054 dokumenteret (blokeret på Dashboard-eksponering)          |
| Fitness schema-exposure soft-fail på alle error paths                             | MELLEM  | `3cf5013` — `soft: true` fjernet fra 5 error-paths                         |

### Runde 2 → 3 fund-håndtering

| Fund                                                                            | Klasse   | Fix-commit                                                                         |
| ------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| PGRST202 fra `postgrest-t9-schema-exposure` — service_role mangler tabel-grants | DIAGNOSE | `956c256` — refactor til OpenAPI-introspection via `Accept-Profile: core_identity` |
| `legacy-is-active-readers` false-positive på `_apply_client_place`              | DIAGNOSE | `cc29472` — allowlist (`org_node_versions` har ikke `status`-kolonne)              |

---

## Plan-afvigelser

**Ingen afvigelser fra Plan V4.** Alle 4 sektioner (A, B, C1+C2+C3, D) leveret som planlagt. 3 OPGRADERING-forslag fra Codex (V3) accepteret og indarbejdet i V4. Codex runde 1 fund løst i runde 2 review. Diagnose-arbejde (PGRST202 + legacy-is-active false-positive) er inden-for-implementations-vej-domæne — ikke plan-afvigelser.

**Drift-disciplin overholdt (Mathias-rule 2026-05-19):**

1. Supplement-migration applied til remote (via MCP `apply_migration`) FØR re-run af CI.
2. Applied commit SHA: `956c256` (head efter OpenAPI-fix).
3. `pnpm fitness` + `pnpm db:test` (32/32) grøn mod remote.
4. Eneste ændring efter apply: `cc29472` (kun fitness-allowlist — ingen SQL-ændringer; ingen re-apply nødvendig).

---

## Vision-tjek

- **Bygger vi den rigtige løsning, eller en workaround?**
  - **Date-aware ACL-helpers:** rigtig løsning. Closure-baserede helpers var current-state-only — supplementet bygger nye `_at(p_date)`-helpers over `org_node_versions` + placements. Current-helpers refaktoreret som wrappers, ingen drift.
  - **Split-at-boundary i 7 apply-handlers:** rigtig løsning. Tidligere `effective_to = current_date`-mønster skabte invalid state ved backdated effective_from (Codex V1 KRITISK 4). Nu håndteres pre-history INSERT / exact-start UPDATE/DELETE / split — alle 5 edge-cases.
  - **Schema-exposure-verifikation via OpenAPI:** rigtig løsning. RPC-call-canary kunne ikke skelne schema-exposure-fejl fra service_role data-access-fejl. OpenAPI-introspection tester præcis det vi vil verificere uden at læne sig på data-grants.
  - **Type-codegen:** workaround (G054). Dashboard-eksponering kræves men kunne ikke verificeres ved hjælp af PostgREST før denne pakke. Tracker-event etableret: når fitness-check er grøn på CI, kør type-gen.

- **Hvis workaround: dokumenteret plan?** Ja — G054 i `docs/teknisk/teknisk-gaeld.md` med konkret 3-trins-løsning + tracker-event.

- **Vision-styrkelser denne pakke:**
  - "Rettigheder der virker" forstærket: date-aware ACL betyder historiske reads ikke længere falder gennem current-state-only-policies (Codex V2 KRITISK 1 lukket).
  - "Append-only" disciplin overholdt: supplementet er ny migration, ingen edit af eksisterende.
  - "Drift-disciplin" forstærket: pre-merge apply etableret som mønster med eksplicit drift-regler.
  - Fitness-værn udvidet: OpenAPI-introspection er mere robust end RPC-canary (verificerer det rigtige uden falske antagelser om data-access).

- **Vision-svækkelser denne pakke:**
  - **Version-drift:** Remote har `20260519125710_t9_supplement` (auto-genereret MCP-version), repo-fil hedder `20260520000000_t9_supplement.sql`. Codex runde 3 vurdering: re-apply post-deploy bør lykkes (alle top-level statements er idempotente; eneste DML er Step 12 DO-block der opdaterer kun ved `is distinct from`). Deployment-watch, ikke vision-svækkelse.
  - **Type-codegen blokeret (G054):** type-safety i frontend forsinket indtil næste deploy-runde med eksponering. Mellem-niveau, kompromis-acceptable.

- **Teknisk gæld akkumuleret:** G054 (type-codegen).

- **Konklusion:** **forsvarligt.** Pakken lukker 6 åbne T9-fund som planlagt + introducerer drift-disciplin-mønster der er reusable for fremtidige migration-driven smoke-tests.

---

## Fire-dokument-verifikation

| Dokument                                          | Plan-konsultation                                                                                                     | Post-build status | Afvigelse |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------- | --------- |
| `docs/strategi/vision-og-principper.md`           | Princip 6 (Rettigheder der virker) + Princip 1 (Én sandhed) + Princip 3 (Eksplicit sammenkobling)                     | overholdt         | nej       |
| `docs/strategi/stork-2-0-master-plan.md`          | §1.7 (Identitet del 2) + §1.1 (SECURITY INVOKER + session-var) + §4 trin 9                                            | overholdt         | nej       |
| `docs/coordination/mathias-afgoerelser.md`        | 2026-05-18 (master-plan §1.7-opdatering) + 2026-05-19 (compliance-ansvarlige) + alle T9-supplement Mathias-afgørelser | overholdt         | nej       |
| `docs/coordination/T9-supplement-krav-og-data.md` | 6 Mathias-afgørelser + 5 krav-formuleringer (HR-driver, plan-arkivering, fitness-disciplin, etc.)                     | overholdt         | nej       |

---

## G-numre / H-numre

- **Tilføjet:**
  - **[G054] MELLEM** — T9 type-codegen blokeret på `core_identity`-eksponering i Dashboard. Reference: `docs/teknisk/teknisk-gaeld.md`. 3-trins-løsning: kør `pnpm types:generate` → commit `packages/types/src/database.ts` → fjern placeholder-skip i `scripts/types-check.sh:11-13`. Tracker-event: `postgrest-t9-schema-exposure` grøn på CI.

- **Løst:**
  - **[G053]** — T9-test-fixture-hardening fra PR #43 verificeret: alle 7 T9-tests (inkl. 2 nye fra denne pakke) består hermetisk-fixture-kontrakten + 3 nye fitness-værn (`db-test-no-disabled-sql`, `db-test-no-t9-seed-user-fixtures`, `db-test-no-t9-skip-guards`) håndhæver kontrakten i CI.

- **Opdateret status:** Ingen.

---

## Oprydning + opdatering udført

**Filer flyttet til arkiv:** Ingen (plan-fil er på plan-branch, ikke main).

**Filer slettet:**

- `scripts/migration/t9-org-tree-discovery.mjs` (commit `70fd47b`, build-PR) — per krav-dok afgørelse #3 (HR-driver direkte til T9-API).
- `scripts/migration/t9-org-tree-upload.mjs` (commit `70fd47b`, build-PR) — samme begrundelse.

**Dokumenter opdateret:**

- `docs/teknisk/teknisk-gaeld.md`: G053 markeret LØST + G054 tilføjet (commit `3cf5013`).
- `docs/coordination/codex-reviews/`: 3 nye review-filer arkiveret (runde 1/2/3).
- `docs/coordination/seneste-rapport.md`: peger nu på denne fil (denne commit).

**Reference-konsekvenser håndteret:**

- Frontend-callere af `core_identity.permission_elements_read()` / `role_permissions_read(uuid)` / `pending_changes_read()`: ingen — Step 9-signaturer bevaret per Codex KRITISK 1 fix. Ingen breaking changes.
- Eksisterende T9-tests: alle 6 fra PR #43 passer mod nye supplement-migration uden ændringer (de bruger throwaway-fixtures, ikke seed-state).

**Verifikation:** alle smoke-tests (32/32) + fitness (19/19) grøn på remote post-apply.

---

## Næste skridt

- **Næste pakke:** Mathias' valg — kandidat-emner:
  - **T9 cleanup:** lukke G054 (type-codegen) når fitness-check passerer i CI; arkivér T9-supplement plan-branch + plan-feedback til `docs/coordination/arkiv/`.
  - **Lag E (beregningsmotor + tidsregistrering):** næste store byggetrin per master-plan; krav-dokumenter eksisterer (`docs/teknisk/lag-e-*.md`).
  - **Supabase Branching infrastruktur:** langsigtet løsning på pre-merge-apply-mønstret (Codex's note efter PR #44 diagnose).

- **Forudsætninger inden næste start:**
  - **Version-drift watch:** næste gang `supabase db push` kører post-merge, verificér at `20260520000000_t9_supplement.sql` apply'es uden fejl (idempotent vurdering: bør succede). Hvis fejl, stop og rapportér.
  - **Dashboard type-gen:** ingen automatik etableret; manuel `pnpm types:generate` + commit er næste skridt for G054.

---

## Codex-review-trigger

Efter denne rapport committes + `docs/coordination/seneste-rapport.md` opdateres til at pege på denne fil, posterer Codex-notify-action en comment til tracker-issue #12. Codex-review-runde 1 for slut-rapport følger derefter via `docs/skabeloner/codex-review-prompt.md` niveau 1-prefix.
