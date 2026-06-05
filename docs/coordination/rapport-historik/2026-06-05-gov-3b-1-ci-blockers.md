# gov-3b-1 — Slut-rapport

**Dato:** 2026-06-05 · **Branch:** claude/gov-3b-1-ci-blockers-build · **Merge-commit:** \<afventer merge\>

## Formål (genfremlagt fra krav-dok)

Familie-kontrakten `governance-vagt-krav-og-data.md` pkt. 3: _"gov-3 — CI-blockers · Færdiggør fitness-laget: de af master-plan §3's 20 checks der mangler. Hvilke der mangler afgøres af Codes live-dump, ikke af doc'en."_ gov-3b-1 leverer **datamodel-halvdelen** af gov-3b-splittet:

- **#19 — FK-dækning:** hver logisk reference-kolonne (`*_id`) på en core\_\*-tabel har enten en rigtig FK, er en PK, eller står på en eksplicit, begrundet undtagelses-liste.
- **#6 — indeks pr. policy-prædikat-kolonne:** hver RLS-policy hvis prædikat sammenligner en reel current-table-kolonne har et **btree**-indeks med den kolonne som ledende kolonne (ellers eksplicit undtaget).

Ingen ny krav-dok (familie-kontrakten dækker). gov-3b-2 (#10 SECDEF-markør + #18 app-write-REVOKE) leveres separat.

## Leverancer (mod familie-kontrakt pkt. 3 scope)

| Leverance                                        | Status    | Migration/RPC                | Test                                                  | Evidens                                        |
| ------------------------------------------------ | --------- | ---------------------------- | ----------------------------------------------------- | ---------------------------------------------- |
| #19 `fkCoverage` (live, fail-closed i CI)        | ✓ leveret | 0 migrations (`fitness.mjs`) | `classifyIdColumn` 6 unit-cases                       | fitness live grøn, 0 violations mod main       |
| #6 `indexPerPolicy` (live, fail-closed i CI)     | ✓ leveret | 0 migrations (`fitness.mjs`) | `predicateColumns`/`leadingBtreeColumns` 7 unit-cases | fitness live grøn, 0 violations mod main       |
| `FK_COVERAGE_EXEMPTIONS` (6 — polymorf/ekstern)  | ✓ leveret | `fitness.mjs`                | dækket af #19-cases                                   | begrundelse pr. entry; nøgler = DB-verificeret |
| `FK_PENDING` (3 sale-refs — selv-udløbende)      | ✓ leveret | `fitness.mjs`                | `#19 FK_PENDING selv-udløb`                           | bundet til [H025]/Trin 14                      |
| `POLICY_INDEX_EXEMPTIONS` (3 — lav-selektivitet) | ✓ leveret | `fitness.mjs`                | dækket af #6-cases                                    | begrundelse pr. entry                          |
| [H025] Trin-14: sale-FK'er + orphan-cleanup      | ✓ rejst   | `huskeliste.md`              | `governance:check` H-ref-integritet                   | governance:check grøn (18 docs/6 scripts)      |

**Antal fitness-checks:** 23 → **25**. **0 SQL-migrations, 0 indeks-migrations** (brud-fladen lukkes med begrundede undtagelser + udskudt Trin-14-arbejde, ikke skema-ændringer nu).

## Stork-invariant-tjek

| Invariant              | Status | Evidens                                                                                                                                          |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Vision-overholdelse    | ✓      | mekanisk håndhævelse frem for selv-disciplin (governance-vagt-formål); begge checks fail-closed i CI (`liveGuard`)                               |
| Permission-matrix      | N/A    | rører ikke permissions/RLS — #6 **læser** kun policy-prædikater                                                                                  |
| Audit-trigger          | ✓      | rører ikke audit; #19 exempter `audit_log.actor_user_id`/`record_id` korrekt (audit skal overleve aktør-sletning — FK ville bryde immutabilitet) |
| Konfiguration-i-data   | N/A    | undtagelses-lister er CI-governance-konstanter (ikke runtime-config; "alt-i-UI" gælder runtime-config-tabeller, jf. D6)                          |
| End-to-end-flow        | ✓      | §3.6: rene-helper unit-tests (DB-fri behavioral) + live-verifikation mod `imtxvrymaqbgcvsarlib`; ikke schema-only                                |
| Anonymisering-bevaring | ✓      | rører ikke data; #19 respekterer `anonymization_state.entity_id` som polymorf exemption — ingen FK der ville orphan'e ved anonymisering          |

## Plan-afvigelser

**Én afvigelse — autoriseret:**

- **0 FK-migrations vs. planens oprindelige "3 nye FK-migrations".** Årsag: §3.2-dump afslørede at `core_money.sales` (Trin 14) **ikke findes** → en FK kan ikke referere en ikke-eksisterende tabel. Formålet er **uændret** (§3.0): de 3 sale-refs (`cancellations.source_sale_id`, `commission_snapshots.sale_id`, `salary_corrections.source_sale_id`) → `sales.id` er stadig den besluttede datamodel, blot **udskudt** til target-tabellen findes. Markeret `FK_PENDING` (selv-udløbende: bliver rød når `sales` findes uden FK) + sporet i [H025]. **Mathias-gate:** afgørelse bekræftet eksplicit ("rigtige FK'er; bygges ved Trin 14; FK_PENDING + H-entry"). Dokumenteret i `gov-3b-1-plan.md` §1a.

Alt øvrigt per plan.

## G-numre rejst

Ingen G-numre. **Én H rejst:** [H025] (`huskeliste.md`) — Trin 14-bundet ekstern handling (tilføj 3 sale-FK'er + ryd 290 orphan `commission_snapshots.sale_id` + fjern de 3 `FK_PENDING`-entries). H er korrekt hjem: en planlagt fremtidig leverance bundet til en milestone, ikke kode-gæld i nuværende kode. Anti-permanens som G063: #19's selv-udløb gør fjernelsen mekanisk håndhævet.

## Konvergens-historie

| Fase     | Codex-fund                                                                                                                      | Code-svar                                                                                           | Outcome         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------- |
| Plan V1  | Step 2.1: 1 HØJ — #6 false-match (`act.id` → `pending_changes.id` via subquery-alias); bekræftede #19/partition/exemptions rent | omskrev `predicateColumns` (fremmed-alias-strip) + negativ-selftest                                 | Plan V2         |
| Plan V2  | (besvarede §9; verificeret live: sales fraværende, counts matcher)                                                              | —                                                                                                   | Step 2.1 lukket |
| Build v1 | build-review: 2 HØJ — #6 treledet `schema.tabel.id` efterlod `.id`; #6 query manglede `btree`-filter (accepterede alle am)      | fulde dotted chains `(?:\w+\.)+\w+`; `pg_am`-join + ren `leadingBtreeColumns`; 2 nye selftest-cases | Build v2        |
| Build v2 | **APPROVAL** (#19 target-expiry/exemption-keys/fail-closed bekræftet rent)                                                      | —                                                                                                   | → Step 5        |

Konvergens-counter: plan 2 runder, build 2 runder — inden for normal (§3.4: 1-3).

## Vision-tjek

- **Rigtig løsning eller workaround?** Rigtig. Begge checks er live (pg_catalog = kilde-of-truth, robust mod fragil migration-parsing) + fail-closed i CI. `FK_PENDING` er ikke en workaround men en eksplicit, selv-udløbende, sporet udsættelse bundet til en reel afhængighed (Trin 14). De 6+3+3 undtagelser er begrundede allowlist-poster med DB-verificerede nøgler, ikke skjult gæld.
- **Vision-styrkelser:** to flere af master-plan §3's CI-blockers mekanisk håndhævet (23→25); FK-dækning + indeks-pr-policy fanger fremtidig drift (især når Trin 14/sales lander). Selv-udløbs-mekanikken er i sig selv en styrkelse — midlertidigt kan ikke blive permanent ved forglemmelse.
- **Vision-svækkelser:** ingen. 0 schema-ændringer = 0 risiko for løndata (§3.9 ikke udløst).
- **Konklusion:** forsvarligt.

## Test-evidens (live, 2026-06-05)

- `pnpm fitness` (token sat → live mod `imtxvrymaqbgcvsarlib`): 25 checks, **all passed** — `fk-coverage` ✓, `index-per-policy` ✓ (0 violations).
- `pnpm fitness:selftest`: **23/23** — inkl. Codex-negativ (`act.id`), schema-kvalificeret fremmed ref, non-btree-index, #19 selv-udløb.
- `pnpm governance:check`: 7/7 (18 docs, 6 scripts) — [H025] H-ref-integritet grøn.
- `pnpm format:check` (tracked filer): rene.
