# T9-supplement — Krav-og-data-grundlag

**Type:** Input fra Claude.ai til Code's plan-arbejde
**Anvendelse:** Code bruger dette dokument som grundlag for at lave `docs/coordination/T9-supplement-plan.md` per `docs/skabeloner/plan-skabelon.md`
**Plan-niveau:** Krav, formål, data — IKKE implementations-plan. Tekniske valg om HVORDAN er Code's plan-arbejde.
**Dato:** 2026-05-18

---

## Formål

> Denne pakke lukker de åbne T9-fund identificeret af Codex runde 1+2 og verificeret af Code's runde 2-gennemgang, så T9-fundamentet er fuldt funktionelt og fremtidige pakker kan bygge oven på det uden at genåbne fundament-arbejde.
>
> Pakken er append-only. T9 bygges ikke forfra. Scope-anker er de åbne fund — ikke §1.1/forretningsrammen fra PR #39, og ikke import.

---

## Data-grundlag

Autoritative input til implementation. Code arbejder fra disse, ikke fra dette dokuments fortolkninger:

- **`docs/coordination/T9-supplement-skitse.md`** — scope-skitse med præcis lokation af hvert fund, referencer til Codex runde 1+2 og Code's runde 2-verifikation
- **PR #39 (T9-fundament-supplement)** — etableret session-var-mønster og dispatcher-mapping (`change_type → page_key`) som T9-supplement bygger oven på
- **`docs/teknisk/teknisk-gaeld.md`** — G053 (T9-test-fixture-hardening) er lukket; seed-users må kun bruges som mutable fixtures i tests der eksplicit validerer bootstrap/superadmin-seed
- **`docs/strategi/vision-og-principper.md`** — princip 9 (statusmodeller bevarer historik) er grundlag for backdated-policy

---

## Faktisk state (relevant for planlægning)

Plan-arbejdet skal være konsistent med følgende faktiske state pr. 2026-05-18:

- **Remote Supabase Dashboard:** 5 of 5 schemas eksponeret (`public`, `graphql_public`, `core_identity`, `core_compliance`, `core_money`). Mathias har manuelt tilføjet de tre core-schemas under T9-merge.
- **Automatically expose new tables:** slået FRA på remote (matcher vision-princip 4 — default = intet).
- **Lokal `supabase/config.toml`:** ikke verificeret om den matcher remote. Plan skal afdække og rette drift hvis den findes.

---

## Scope

**I scope (åbne T9-fund):**

1. Team-retype trigger-fix (KRITISK 1)
2. Verifikation + drift-fix af schema-exposure mellem lokal og remote (KRITISK 3 — se ændret natur nedenfor)
3. Backdated effective_from-handling på alle 7 apply-handlers (KRITISK 4)
4. Type-codegen (MELLEM — forudsætter remote exposure verificeret)
5. Read-RPC gates (MELLEM)
6. Step 12 robusthed (MELLEM)

**IKKE i scope:**

- Import-stubs (Step 10's `.mjs`-filer) og krav-dok 4.8 discovery+execute — udskudt jf. Mathias-afgørelse #3 nedenfor
- §1.1 / §1.7 / §1.13 princip-diskussion — lukket i PR #39
- Genåbning af T9-fundament-arbejde — pakken er append-only

---

## Mathias' afgørelser (input til Code's plan)

Følgende er afgjort før plan-arbejde starter. Code's plan skal være konsistent med disse — argumentation mod dem hører til ny runde, ikke til T9-supplements plan-fase.

| #   | Beslutning                                                                            | Begrundelse                                                                                                                                                                                                                                                |
| --- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Backdated effective_from er tilladt med historisk traversal — ikke forbudt            | Brugeren skal kunne vælge dato i UI (default i dag, kan vælges tilbage eller frem). Princippet gælder bredt — alle effective_from-handlers, ikke kun medarbejder-placements. I denne pakke omfatter det også klient-placements.                            |
| 2   | Read-RPC rettigheder skal være pålidelige                                             | Mekanik afgøres af Code i samråd med Codex. Krav er at rettigheder virker og er til at stole på.                                                                                                                                                           |
| 3   | Import-scope udskydes                                                                 | Krav-dok 4.8 om "discovery + execute som T9-leverance" er forældet. Migration fra 1.0 sker ved manuelt udtræk + direkte upload. Ingen import-RPC'er, ingen UI, ingen ETL. Step 10's `.mjs`-stubs kan slettes eller markeres obsolete.                      |
| 4   | Alle 5 schemas er eksponeret på remote og skal forblive eksponeret                    | Mathias har manuelt tilføjet `core_identity`, `core_compliance`, `core_money` til Supabase Dashboard's exposed schemas. Pakken skal ikke tilføje nye schemas; den skal verificere at exposure virker og fixe drift mellem lokal og remote hvis den findes. |
| 5   | Step 12's hardkodning af `mg@copenhagensales.dk` og `km@copenhagensales.dk` er OK her | Step 12 er produktets bootstrap-seed, ikke en test-fixture. Ikke i konflikt med G053, som kun forbyder seed-users som mutable fixtures i DB-tests. Migrationen skal kommentere forskellen.                                                                 |
| 6   | Default-deny på nye tabeller er låst                                                  | "Automatically expose new tables" er FRA på remote. Skal forblive FRA. Nye tabeller eksponeres bevidst pr. tabel når relevant.                                                                                                                             |

---

## Krav-formuleringer

### Krav 1 — Schema-exposure verifikation

T9-supplementet skal verificere at remote schema-exposure virker for T9-RPC'erne i `core_identity`. Mathias har allerede eksponeret alle 5 schemas på remote Supabase Dashboard, men det er ikke verificeret end-to-end at en authenticated kald mod T9-RPC'er i `core_identity` faktisk returnerer forventet response.

Pakken skal:

- Verificere at lokal `supabase/config.toml` matcher remote state (5 schemas eksponeret, automatically-expose FRA)
- Hvis lokal-remote drift findes: rette lokal til at matche remote
- Køre en end-to-end test mod en T9-RPC i `core_identity` som authenticated bruger og bekræfte forventet response
- Dokumentere resultatet i pakkens slut-rapport

### Krav 2 — Backdated edge-cases

Backdated ændringer er tilladt og skal behandles som historiske intervalændringer, ikke afvises. Implementationen skal håndtere:

- Ny effective_from før første eksisterende interval: opret ny historisk start uden overlap
- Ny effective_from lig eksisterende intervals effective_from: update/replace interval-startens row i stedet for at skabe zero-length interval
- Ny effective_from inde i eksisterende interval: split intervallet
- Ny effective_from på eksisterende effective_to boundary: indsæt/erstat uden overlap
- Senere fremtidige intervaller skal bevares

Alle branches skal bevises i smoke-test for både employee- og client-placement.

### Krav 3 — Read-gates strategi

Read-RPC'er skal gates efter datakategori:

- `permission_elements_read` og `role_permissions_read`: kræver relevant permission og skal afvise med permission-denied-fejl ved manglende adgang
- `org_tree_read(_at)`, `employee_placement_read(_at)` og `client_placement_read(_at)`: skal bruge visibility/scoped filtering. Bruger uden synlige rows får tomt resultat, ikke global data
- `pending_changes_read`: skal filtrere efter samme `change_type → page_key` mapping som PR #39's `pending_changes_select` policy og approve/undo-dispatchere. Bruger uden relevant scope får tomt resultat

Read-gates må ikke svække RLS; de er et eksplicit RPC-lag oven på eksisterende RLS/ACL.

### Krav 4 — Step 12 hardcoded mg@/km@

Step 12 robusthed må fortsat referere eksplicit til `mg@copenhagensales.dk` og `km@copenhagensales.dk`, fordi de er produktets bootstrap-seed, ikke test-fixtures. Dette er ikke i konflikt med G053, som kun forbyder seed-users som mutable fixtures i DB-tests. Migrationen skal kommentere denne forskel.

### Krav 5 — Drift-håndtering mellem lokal og remote schema-config

Remote er sandheden for schema-exposure (5 schemas eksponeret, default-deny på nye tabeller). Lokal `supabase/config.toml` skal matche remote. Hvis lokal afviger: pakken retter lokal, ikke remote.

Stop kun hvis ny beslutning kræves ud over "ret lokal til at matche remote", fx hvis remote selv er forkert konfigureret, eller hvis verifikationen afslører at T9-RPC'er reelt ikke er callable trods exposure. I så fald: stop og rapportér til Mathias.

---

## Tekniske valg overladt til Code

Disse valg er IKKE afgjort. Code argumenterer teknisk i sin plan-fil og foreslår valg. Codex reviewer. Mathias godkender den samlede plan.

**Valg 1 — Backdated edge-case implementation**

Krav 2 specificerer hvilke edge-cases der skal håndteres, men ikke hvordan. Code afgør implementationen og dokumenterer valg i implementation-kommentar. Smoke-tests skal dække alle branches.

**Valg 2 — Read-gates mekanik**

Krav 3 specificerer strategi per RPC-kategori, men ikke mekanik (defense-in-depth, RLS-only med stærkere policy-tests, eller andet). Code afgør mekanik i samråd med Codex. Krav er at rettigheder virker og er til at stole på.

**Valg 3 — Schema-exposure end-to-end test**

Krav 1 specificerer at exposure skal verificeres end-to-end mod en T9-RPC. Code afgør hvilken RPC der bruges som test-anker og hvordan testen integreres (smoke-test, fitness-check, eller andet).

**Valg 4 — Commit-struktur og implementations-rækkefølge**

Pakken dækker flere fund. Code afgør commit-struktur (fil-cluster, koncept-cluster) og rækkefølge.

---

## Plan-flow

1. Krav-dok merget til main (denne fil)
2. Code skriver `docs/coordination/T9-supplement-plan.md`
3. Code argumenterer for de 4 tekniske valg i planen
4. Codex review
5. Claude.ai review (krav-match)
6. Mathias godkendelse → build
7. Slut-rapport inkluderer resultat af schema-exposure end-to-end verifikation
