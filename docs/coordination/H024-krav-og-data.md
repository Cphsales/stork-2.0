# H024 — Krav-og-data-grundlag

**Type:** Input fra Claude.ai til Code's plan-arbejde
**Anvendelse:** Code bruger dette dokument som grundlag for at lave `docs/coordination/H024-plan.md` per `docs/skabeloner/plan-skabelon.md`
**Plan-niveau:** Krav, formål, data — IKKE implementations-plan. Tekniske valg om HVORDAN er Code's plan-arbejde.
**Pakke-skala:** Stor H-pakke (fuld plan-runde-proces: krav-dok → plan → review → build → slut-rapport)
**Dato:** 2026-05-16

---

## Formål

> Denne pakke leverer: alle DB-tests er idempotente (tx-wrappet eller fitness-blokeret), eksisterende test-artefakter ryddet hvor muligt uden GDPR-vej, og Node-runtime opgraderet til 24 LTS.
>
> Hvis fundet under review ikke bringer os tættere på dette: G-nummer, ikke blocker.

---

## Data-grundlag

Autoritative input til implementation. Code arbejder fra disse, ikke fra dette dokuments fortolkninger:

- **`docs/coordination/afdaekning/g043-g044-data-code-2026-05-16.md`** — Code's afdækning (7 spørgsmål + Node-sektion + 5 sidefund). Bruger live DB-introspection. Konkrete tal.
- **`docs/coordination/afdaekning/g043-g044-data-codex-2026-05-16.md`** — Codex's afdækning (samme 8 spørgsmål, repo-/migrations-baseret pga. sandbox-fetch-fejl mod Supabase API). Sammenfald med Code på alle strukturelle punkter.
- **`docs/teknisk/teknisk-gaeld.md`** — G017, G043, G044 entries (med H022 + H022.1 noter)
- **`docs/strategi/vision-og-principper.md`** — princip 5 (lifecycle for konfiguration), princip 6+7 (audit), princip 9 (status-modeller bevarer historik) — fundamentale begrundelser for DELETE-blokeringer
- **`docs/strategi/stork-2-0-master-plan.md`** — autoritativ over krav-dokumenter ved konflikt

**Afdæknings-sammenfald (begge fandt):**

- 6 strict immutability-tabeller (audit_log + 4 partitioner, anonymization_state, cancellations, salary_corrections + 2 conditional: pay_periods, commission_snapshots)
- 3 lifecycle-tabeller med DELETE-blokering for status≠draft (anonymization_strategies, anonymization_mappings, break_glass_operation_types)
- R3 (`r3_commission_snapshots_immutability.sql`) er eneste test uden tx-wrap blandt direkte INSERT-tests
- p1a (`p1a_anonymization_strategies.sql`) er også uden tx-wrap — skaber permanent drift via lifecycle-trigger
- Transaction-rollback er trivielt feasibility på alle berørte tests (ingen cron-triggers, deferred constraints, eller commit-afhængige assertions)
- H022.1 random-offset rammer kun R3-testen
- Node 22 → Node 24: ingen dependency-blockers; 6-8 filer skal ændres

**Konkrete tal (fra Code's live-query, ikke verificerbart af Codex pga. sandbox-begrænsning):**

| Tabel                                      | Test-artefakter                                       | Cleanup-vej                                                                              |
| ------------------------------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `core_money.pay_periods`                   | 31 (1 G017 + 1 tidlig + 3 reelle + 26 R3-smoke stale) | Kræver break-glass-vej (`stork.allow_pay_period_unlock_break_glass`) eller dedikeret RPC |
| `core_money.commission_snapshots`          | 286 locked rows                                       | Immutable — kræver dedikeret cleanup-RPC eller migration                                 |
| `core_money.pay_period_candidate_runs`     | 28 (25 r3-smoke + 1 test-checksum + 2 reelle)         | Ingen immutability-trigger — kan DELETE'es direkte (parent-FK undtaget)                  |
| `core_money.salary_corrections`            | 1 (G017 smoke test)                                   | Kræver dedikeret cleanup-RPC eller migration                                             |
| `core_compliance.anonymization_state`      | 1 (G017 udvidet — C002 test row)                      | Strict immutable — kræver dedikeret cleanup-RPC eller migration                          |
| `core_compliance.anonymization_strategies` | 39 (1 test5 + 38 p1a*smoke_t5*\*)                     | Lifecycle-trigger — kræver status-rollback til draft eller dedikeret RPC                 |
| `core_identity.employees`                  | 1 anonymized test-employee                            | Ingen trigger — DELETE muligt, men FK fra anonymization_state                            |
| `core_compliance.audit_log`                | 162 test-markerede rows                               | **GDPR-vej (uden for scope)**                                                            |
| `core_money.cancellations`                 | 0                                                     | —                                                                                        |

Total uden audit_log: ~387 artefakter. Med audit_log: 549+.

---

## Scope

**I scope:**

1. **Tx-wrap af `r3_commission_snapshots_immutability.sql`** (G043 grundårsag)
2. **Tx-wrap af `p1a_anonymization_strategies.sql`** (samme rod-årsag, fundet i afdækning)
3. **Audit af alle øvrige tests** mod alle immutability- og lifecycle-tabeller. Hvis flere ikke-tx-wrappede tests findes: tx-wrap dem i samme pakke.
4. **Rul tilbage H022.1 random-offset** når tx-rollback er på plads. Random-offset er minimal-patch, ikke arkitektur-fix.
5. **Cleanup af eksisterende test-artefakter** hvor muligt uden GDPR-vej:
   - 31 pay_periods (inkl. G017's 2020-row)
   - 286 commission_snapshots
   - 28 pay_period_candidate_runs
   - 1 salary_correction (G017)
   - 1 anonymization_state (G017 udvidet)
   - 39 anonymization*strategies (1 test5 + 38 p1a_smoke_t5*\*)
   - 1 anonymized test-employee
6. **Fitness-check der detekterer non-idempotente tests** (forhindrer regression når Lag E genererer nye tests)
7. **Node 22 → Node 24 opgradering**:
   - `package.json` engines.node: `">=22.11.0 <23"` → `">=24.0.0 <25"`
   - `.nvmrc`: `22` → `24`
   - `.tool-versions`: `nodejs 22.11.0` → `nodejs 24.x`
   - `README.md`: to forekomster af "22" → "24"
   - `apps/web/package.json`: `@types/node` bumpes til `^24.x`
8. **Ret G044's fejl-reference** i `docs/teknisk/teknisk-gaeld.md` — `r4_salary_corrections_cleanup` eksisterer ikke som test-fil. Code afgør hvad korrekt note skal sige.

**IKKE i scope:**

- **GDPR-retroactive cleanup-vej** (`stork.gdpr_retroactive='true'`). Mekanisme er skitseret i master-plan §1.4, ikke bygget. Hører til separat pakke post-fase-E.
- **162 test-markerede audit_log-rows.** Kræver GDPR-vejen ovenfor. Bliver kosmetisk drift indtil den vej bygges.
- **Test-arkitektur for Lag E.** Denne pakke dækker eksisterende huller + forhindrer regression. Lag E's egne test-mønstre er separat arbejde.
- **Automatisk cleanup-cron.** Afvist eksplicit (Mathias-afgørelse 6): tx-rollback ER cleanup-mekanismen; cron oven på det er redundant og bryder princip 9.
- **Andre dokumentations-fix** der ikke er direkte konsekvens af pakkens leverancer.
- **Lag E-arbejde, nye features, arkitektur-ændringer.**

---

## Mathias' afgørelser (input til Code's plan)

Følgende er afgjort før plan-arbejde starter. Code's plan skal være konsistent med disse — argumentation mod dem hører til ny krav-dokument-runde, ikke til H024's plan-fase.

| #   | Beslutning                                                                                                     | Begrundelse                                                                                                                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Scope udvidet fra "kun r3 + r4" til "alle tests mod alle DELETE-blokerede tabeller (immutability + lifecycle)" | Empirisk grundlag fra Code's afdækning: p1a er også non-idempotent med samme rod-årsag. At fixe kun r3 efterlader p1a som tilsvarende drift-kilde.                                                                                |
| 2   | Cleanup-omfang: ryd de obviousoute, lev med 162 audit_log-rows                                                 | GDPR-retroactive-vej er separat projekt. At trække den ind nu er scope-creep. Audit-rows er kosmetisk drift, ikke funktionel.                                                                                                     |
| 3   | G044's fejl-reference til `r4_salary_corrections_cleanup` rettes som del af pakken                             | 1-linje-fix, separat pakke er overhead uden gevinst.                                                                                                                                                                              |
| 4   | H022.1 random-offset rulles tilbage når tx-rollback er på plads                                                | Minimal-patch er ikke arkitektur-fix. Belt-and-suspenders akkumulerer død kode.                                                                                                                                                   |
| 5   | Node 22 → Node 24 inkluderet i pakken pga. fælles rod-årsag (CI-friktion)                                      | Fitness-check bygges én gang og skal scanne på fremtids-Node. Bedre med begge ændringer i ét round-trip. Dependency-blockers: ingen.                                                                                              |
| 6   | Automatisk cleanup-cron AFVIST                                                                                 | Tx-rollback ER cleanup-mekanismen — cron er redundant. Bryder princip 9 (status-modeller bevarer historik) og er anti-pattern (symptom-fix over rod-årsag). Fitness-check forhindrer problemet i at opstå; cron rydder kun efter. |

---

## Tekniske valg overladt til Code

Disse valg er IKKE afgjort. Code argumenterer teknisk i sin plan-fil og foreslår valg. Codex reviewer. Mathias godkender den samlede plan.

**Valg 1 — Tilgang til test-cleanup**

G044's plan-retning markerer transaction-rollback som "foretrukken hvis testene allerede kører i tx, behøver intet ekstra; ellers wrap i begin ... rollback". Code's afdækning bekræfter trivielt rollback-feasibility for alle berørte tests. Alternativer:

- A. Transaction-rollback (`BEGIN ... ROLLBACK` wrap i fil-indhold; ingen schema-ændring)
- B. Break-glass `test_cleanup`-op-type (whitelist-RPC + audit-spor + 2-actor flow)
- C. Hybrid (tx-rollback for nye tests, break-glass for eksisterende artefakt-cleanup hvor tx ikke kan rulle prod-state tilbage)

Code argumenterer teknisk for valget. Defensiv minimal-diff over teknisk korrekthed er anti-pattern (jf. H022.1 selvkritik).

**Valg 2 — Cleanup-vej for eksisterende artefakter**

De 387 eksisterende artefakter (excl. audit_log) kan ikke ryddes via tx-rollback fordi de allerede er committet. Code afgør om cleanup gøres via:

- A. Engangs-migration der bypasser immutability-trigger med eksplicit reason-marker (`stork.allow_*_cleanup='true'` pattern)
- B. Break-glass RPC der DELETE'er klart-markerede test-rækker
- C. Manuel SQL-script kørt udenfor migrations-flowet
- D. Andet

Code argumenterer for det rette niveau af audit-spor og bypass-disciplin.

**Valg 3 — Fitness-check-implementation**

Begge afdæknings-rapporter foreslår mønstre. Code's: Regex (A, lav-kompleksitet), AST (B, høj-kompleksitet), Live-recon (C, mellem-kompleksitet). Codex's: 5 varianter med varierende false-positive/negative-risiko.

Code vælger ét eller en kombination og argumenterer for trade-offs (false-positive/negative + implementation-omkostning).

**Valg 4 — Node 24 minor-version-pin**

- A. Major-pin: `.nvmrc` = `24`, `package.json` engines = `">=24.0.0 <25"`
- B. Exact-pin: `.nvmrc` = `24.x.y` (specifik), engines = `">=24.x.y <25"`

Code afgør baseret på dependency-stabilitet og CI-cache-overvejelser.

**Valg 5 — `@types/node`-bump og implementations-rækkefølge**

- Skal `@types/node` bumpes i samme commit som engines/nvmrc, eller separat?
- Skal pakkens leverancer struktureres som ét stort commit, fil-cluster-commits, eller fund-cluster-commits?

Code afgør plan-skabelonens "Implementations-rækkefølge"-sektion baseret på risiko-isolation.

**Valg 6 — Audit af "øvrige tests"**

Code's afdækning fandt 4 tests der ALLEREDE er tx-wrappet (r7a-serien + 02_retention_value_consistency). Skal disse re-verificeres som del af pakken (forsikring mod regression i wrap-mønstret), eller er audit-leverancen kun for tests uden wrap?

Code afgør scope-grænsen.

---

## Strukturel observation (kontekst, ikke krav)

Pakken etablerer test-cleanup-disciplin som mønster, ikke kun som fix. Fitness-check er det mekaniske håndhævelse. Tx-rollback er det defaulte mønster. Cleanup-RPC eller break-glass for eksisterende artefakter er undtagelsen, ikke reglen.

Dette mønster vil binde Lag E's test-arkitektur. Når Lag E genererer tests mod nye immutable tabeller (sales, lønberegning, dashboards), skal de tests følge tx-rollback-mønstret. Fitness-check fanger afvigelser.

H022.1 selvkritik gælder her: defensiv "minimal diff er bedre" over teknisk korrekthed er anti-pattern. Hvis Code vurderer at den teknisk reneste vej er større end minimal-diff: vælg det reneste, begrund teknisk.
