# T9 — Krav-og-data-grundlag

**Type:** Input fra Claude.ai til Code's plan-arbejde
**Anvendelse:** Code bruger dette dokument som grundlag for at lave `docs/coordination/T9-plan.md` per `docs/skabeloner/plan-skabelon.md`
**Plan-niveau:** Krav, formål, data — IKKE implementations-plan
**Pakke-skala:** Stor byggetrin-pakke (§4 trin 9 — Identitet del 2)
**Genoptager:** PAUSET §4 trin 9 (pauset 2026-05-15)
**Dato:** 2026-05-16

---

## Status — forudsætninger opfyldt

Trin 9 var pauset pr. Mathias-afgørelse 2026-05-15 indtil disciplin-fundament var på plads. Forudsætningerne er nu opfyldt:

- H010 leveret (commit `3c6bc0b`)
- Overvågnings-system + plan-automation-flow etableret (testet via H020 + H024)
- Dokument-roller skarpe (H020)
- Master-plan sandheds-audit gennemført (H020 + H024)

---

## Formål

Denne pakke leverer fundamentet for subtree-baseret rettighedsevaluering: org-træ, materialiseret closure-table med vedligeholdelses-trigger, `acl_subtree`-helper, teams, versionerede tilknytninger (medarbejder-team og klient-team), scope-helpers, subtree-RLS benchmark som CI-blocker, og migrations-scripts for 1.0-import.

---

## Data-grundlag (autoritative kilder)

Code arbejder fra disse, ikke fra dette dokuments fortolkninger:

- **`docs/strategi/stork-2-0-master-plan.md` §1.7** — autoritativ beskrivelse af org-træ, closure-table, acl_subtree, teams, versionerede tilknytninger, scope-helpers
- **`docs/strategi/stork-2-0-master-plan.md` §4 trin 9** — scope-definition + schema-tildeling
- **`docs/strategi/stork-2-0-master-plan.md` rettelse 19 C1** — valg af closure-table over STABLE-funktion med rekursiv CTE
- **`docs/strategi/stork-2-0-master-plan.md` §3** — subtree-RLS benchmark-krav som CI-blocker
- **`docs/strategi/stork-2-0-master-plan.md` §0.5** — migration-grundprincip
- **`docs/coordination/mathias-afgoerelser.md` 2026-05-16 entry "Forretningssandhed: org-struktur, teams, klienter, dataejerskab"** — autoritativ over forretningsspørgsmål der ikke er dækket i master-plan
- **`docs/strategi/bygge-status.md`** — forudsætnings-state + klassifikations-tal-inkonsistens
- **`docs/strategi/vision-og-principper.md`** — autoritativ ved konflikt
- **`docs/teknisk/permission-matrix.md`** — eksisterende permission-system fra trin 5

---

## Verificeret scope (fra kilder)

### Org-træ — fra §1.7

- Tabel i `core_identity` med selv-refererende `parent_id`
- Vilkårligt antal niveauer (data, ikke schema)
- Cycle-detection-trigger via rekursiv CTE (kun ved INSERT/UPDATE; ikke i policy-prædikat)
- Cycle-detection-trigger og closure-vedligeholdelses-trigger fyrer i samme transaktion; begge skal lykkes
- `is_active`-flag for at signalere "ikke i brug længere" (mathias-afgoerelser 2026-05-16 punkt 6 — samme mønster som roller fra trin 5). Forhindrer nye tilknytninger; historik bevares fordi tabellen står

### Closure-table — fra §1.7

- Tabel `org_unit_closure` i `core_identity`
- Pr. (ancestor_id, descendant_id, depth) — én row pr. relation inkl. self-reference (depth=0)
- PRIMARY KEY (ancestor_id, descendant_id)
- Index på descendant_id for revers-lookup
- AFTER INSERT/UPDATE/DELETE-trigger på `org_units` vedligeholder tabellen

### Helper acl_subtree — fra §1.7 + §1.1

- `acl_subtree(employee_id)` returnerer descendant-array via indexed closure-lookup
- STABLE, SECURITY INVOKER, deterministisk search_path
- Ingen rekursion ved query-tid

### Generelt princip — fra §1.7

- Ingen rekursive CTE'er i RLS-policy-prædikater
- Princippet gælder også fremadrettet for andre senere hierarki-strukturer

### Teams — fra §1.7 + mathias-afgoerelser 2026-05-16

- Hører under præcis én org-enhed
- Ejer relationer til klienter
- Bærer medarbejdere
- Eksisterer uafhængigt af om klienter stopper (mathias-afgoerelser punkt 4)
- Kan ophøre som ledelses-handling; medarbejdere bliver team-løse, ikke fyret (mathias-afgoerelser punkt 3)
- `is_active`-flag for at signalere ophør (mathias-afgoerelser punkt 6)

### Medarbejder-team-tilknytning — fra §1.7 + mathias-afgoerelser punkt 7

- Versioneret med `from_date` + `to_date`
- Partial unique på (medarbejder, to_date IS NULL) — én aktiv ad gangen
- Gælder alle medarbejdere uden undtagelse (ingen stab-undtagelse)
- Exclusion-constraint mod overlappende perioder
- Skifte-RPC lukker gammel og åbner ny i én transaktion

### Klient-team-ejerskab — fra §1.7

- Samme versionerings-mønster som medarbejder-team-tilknytning
- Partial unique på (klient, to_date IS NULL)
- Klient-data følger klienten ved team-skift, ikke teamet (mathias-afgoerelser punkt 5)

### Scope-helpers — fra §1.7 + mathias-afgoerelser punkt 7

- `self` — employee-match (eksisterer fra trin 5)
- `team` — snapshot på data-rækken
- `subtree` — closure-table-lookup via `acl_subtree(employee_id)` (ny i T9)
- `all` — alle rækker (eksisterer fra trin 5)
- Subtree-scope er den primære mekanisme for at give nogen adgang på tværs af flere teams (fx FM-chef der ser alt under sin afdeling) — ikke via flere team-tilknytninger

### Subtree-RLS benchmark-test (CI-blocker) — fra §3 + rettelse 19 C1

- Syntetisk org-struktur: 50 enheder × 5-niveau dybde
- 500 medarbejdere fordelt på org-strukturen
- 1M sales-rows
- Fail hvis policy-evaluering >5ms pr. row
- Fail hvis EXPLAIN viser rekursion
- Deterministisk data-generator (samme seed → samme data)

### Migration-scripts — fra §0.5 + §4 trin 9 + mathias-afgoerelser punkt 8

- Discovery-script for teams (kører mod 1.0, output rapport med inkonsistenser: dubletter, hængende relationer, manglende koblinger)
- Udtræks-SQL for klient-team-historik fra 1.0 (bevares som-det-var; ingen rekonstruktion)
- Upload-script til 2.0 med `source_type='migration'` + `change_reason='legacy_import_t0'`
- Idempotent
- Ingen hardkodet horizon — Mathias afgør konkret omfang ved manuel eksekvering
- Hele historikken kan hentes

### Klassifikations-tal-inkonsistens — fra bygge-status

- Verifikation som del af pakken: live DB-query mod `data_field_definitions` for current count
- Sammenligning mod 202 (trin 1-3) vs 193 (trin 4)
- Dokumentation af resultat i slut-rapport

### Klassifikations-registrering — fra §1.2

- Migration-gate blokerer PR ved ny kolonne uden registry-indgang
- Alle nye kolonner i T9 skal tilføjes til `core_compliance.data_field_definitions`

### Anonymisering — fra §1.4 + mathias-afgoerelser punkt 9

- Teams og org-enheder anonymiseres ikke
- Navne er forretningsdata, ikke persondata
- Struktur bevares evigt for jura, audit, historik

---

## Mathias' afgørelser (fra kilder)

| Afgørelse                                                                                                                    | Kilde                                  |
| ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Closure-table-mønster (ikke STABLE-funktion med rekursiv CTE)                                                                | rettelse 19 C1                         |
| Generelt princip: ingen rekursive CTE'er i RLS-policy-prædikater                                                             | §1.7                                   |
| Versioneret medarbejder-team-tilknytning og klient-team-ejerskab                                                             | §1.7                                   |
| Skifte-RPC der lukker gammel + åbner ny i én transaktion                                                                     | §1.7                                   |
| Subtree-RLS benchmark-test som CI-blocker (<5ms pr. row + ingen rekursion)                                                   | §3 + rettelse 19 C1                    |
| Migration via direkte udtræk + upload                                                                                        | §0.5 + rettelse 20                     |
| Klient-team-historik fra 1.0 bevares som-det-var; ingen rekonstruktion                                                       | §0.5                                   |
| acl_subtree er STABLE, SECURITY INVOKER, deterministisk search_path                                                          | §1.7 + §1.1                            |
| Closure-table indeholder self-reference (depth=0)                                                                            | §1.7                                   |
| Cycle-detection + closure-vedligeholdelse i samme transaktion                                                                | §1.7                                   |
| Schema: core_identity for alle nye tabeller                                                                                  | §1.11 + §4 trin 9                      |
| Ejerskabs-kæde: Copenhagen Sales → afdelinger → teams → relationer                                                           | mathias-afgoerelser 2026-05-16 punkt 1 |
| Afdelinger ændres sjældent; historik bevares; ny sandhed laver ikke gammel om                                                | mathias-afgoerelser 2026-05-16 punkt 2 |
| Team kan ophøre som ledelses-handling; medarbejdere bliver team-løse                                                         | mathias-afgoerelser 2026-05-16 punkt 3 |
| Klient kan aldrig dræbe et team                                                                                              | mathias-afgoerelser 2026-05-16 punkt 4 |
| Klient ejer sin egen data; data følger klienten ved team-skift                                                               | mathias-afgoerelser 2026-05-16 punkt 5 |
| is_active-flag på teams og org-enheder for synlighed; samme mønster som roller                                               | mathias-afgoerelser 2026-05-16 punkt 6 |
| Én medarbejder kan kun være i ét team ad gangen (også stab); cross-team-adgang via rolle-scope, ikke via flere tilknytninger | mathias-afgoerelser 2026-05-16 punkt 7 |
| Ingen hardkodet horizon for migration; Mathias afgør ved eksekvering                                                         | mathias-afgoerelser 2026-05-16 punkt 8 |
| Teams og afdelinger anonymiseres ikke; struktur bevares evigt                                                                | mathias-afgoerelser 2026-05-16 punkt 9 |

---

## Tekniske valg overladt til Code

Disse valg er IKKE afgjort i kilderne. Code argumenterer i sin plan; Codex reviewer; Mathias godkender.

**1. Konkrete tabel-, kolonne- og helper-navne**

Master-plan §0.0: "Konkrete tabel- og kolonne-navne afgøres ved bygning." Code foreslår navne baseret på eksisterende konventioner fra trin 1-7.

**2. Trigger-implementation for closure-vedligeholdelse**

Master-plan §1.7 specificerer AFTER INSERT/UPDATE/DELETE på org_units. Mekanik er åben:

- A. Én trigger der genberegner hele closure-table for berørte subtree
- B. Inkrementel trigger der kun opdaterer berørte (ancestor, descendant)-relationer
- C. Hybrid

Code argumenterer. Org-mutationer er sjældne (mathias-afgoerelser punkt 2); benchmark-test må ikke fejle.

**3. Closure-table audit-status**

Closure-table er mutable (trigger vedligeholder den). CI-blocker 3 (audit-trigger pr. mutable tabel) vil ramme den.

- A. Audit-trigger på closure (redundant — org_units bærer audit for hierarki-ændringer)
- B. Tilføj til `AUDIT_EXEMPT_*`-allowlist (precedent fra commission_snapshots)
- C. Andet mønster

Code argumenterer.

**4. Client_team_ownership FK-rækkefølge**

`core_identity.clients` bygges først i trin 10.

- A. Byg client_team_ownership uden FK i trin 9; tilføj FK i trin 10
- B. Udskyd hele client_team_ownership til trin 10
- C. Byg med deferred eller NOT VALID FK i trin 9

Code argumenterer.

**5. Hvilke tabeller får subtree-RLS-policies i trin 9**

Master-plan §1.7 introducerer scope-helpers; spørgsmålet er hvad der konkret aktiveres i trin 9 vs senere:

- A. Kun infrastruktur (helper + closure + vedligeholdelses-trigger); policies aktiveres pr. tabel når relevante forretnings-tabeller bygges
- B. Subtree-policy aktiveres på employees i trin 9
- C. Subtree-policy på alle core_identity-tabeller med naturlig subtree-dimension

Code argumenterer.

**6. Benchmark-test-implementation**

Master-plan §3 specificerer kriterier men ikke implementation. Code afgør:

- A. Dedikeret CI-step i `.github/workflows/ci.yml`
- B. Fitness-check der spawner test-data i transaktion
- C. Smoke-test i `supabase/tests/`
- D. Andet

Code argumenterer ift. CI-køretid, idempotens, false-positive-risiko.

**7. Syntetisk data-generator**

Master-plan §3: deterministisk generator. Code afgør sprog, placering, og hvordan data ryddes efter benchmark (tx-rollback per CI-blocker 20 fra H024).

**8. Benchmark-substrat når sales ikke eksisterer**

Master-plan §3 nævner 1M sales; sales bygges først trin 14.

- A. Benchmark bruger employees-tabel som substrat
- B. Proxy-tabel der simulerer sales-volumen
- C. Udskyd 1M-sales-benchmark til trin 14; trin 9 har mindre benchmark
- D. Andet

Code argumenterer.

**9. Migration discovery-script implementation**

Master-plan §0.5: discovery-script scanner 1.0 for inkonsistenser. Code afgør:

- Sprog (SQL mod 1.0, eller TypeScript der queryer 1.0)
- Output-format
- Hvilke inkonsistenser detekteres (dubletter, hængende relationer, etc.)
- Placering i repoet

**10. Commit-struktur og implementations-rækkefølge**

Pakken er stor. Code afgør commit-struktur og rækkefølge.

---

## Forventet flow

1. Mathias godkender T9-krav-dok
2. Code paster qwerr → ser krav-dok som untracked → krav-dok-PR-flow → merge
3. Code laver `docs/coordination/T9-plan.md`
4. Code argumenterer for de 10 tekniske valg
5. Codex + Claude.ai reviewer
6. Runder indtil approved af begge
7. Mathias godkender → qwerg → build
8. Slut-rapport
