# H024 — Plan V1

**Pakke:** H024 — test-idempotens + artefakt-cleanup + Node 24
**Krav-dokument:** `docs/coordination/H024-krav-og-data.md` (merged i `a15caff`)
**Branch:** `claude/H024-plan` (denne fil), build: `claude/H024-build`
**Plan-version:** V1

---

## Formål

> Denne pakke leverer: alle DB-tests er idempotente (tx-wrappet eller fitness-blokeret), eksisterende test-artefakter ryddet hvor muligt uden GDPR-vej, og Node-runtime opgraderet til 24 LTS.
>
> Hvis fundet under review ikke bringer os tættere på dette: G-nummer, ikke blocker.

---

## Scope

**I scope** (fra krav-dok):

1. Tx-wrap af `r3_commission_snapshots_immutability.sql` (G043 grundårsag)
2. Tx-wrap af `p1a_anonymization_strategies.sql` (samme rod-årsag)
3. Audit af alle øvrige tests mod immutability- og lifecycle-tabeller
4. Rul H022.1 random-offset tilbage til fixed-dato når tx-rollback er på plads
5. Cleanup af eksisterende test-artefakter (~387 rows excl. audit_log)
6. Fitness-check der detekterer non-idempotente tests
7. Node 22 → Node 24 opgradering
8. Ret G044's fejl-reference til ikke-eksisterende `r4_salary_corrections_cleanup`

**IKKE i scope** (fra krav-dok):

- GDPR-retroactive cleanup-vej (`stork.gdpr_retroactive='true'`) — separat post-fase-E
- 162 test-markerede audit_log-rows — afhænger af GDPR-vejen ovenfor
- Test-arkitektur for Lag E — separat arbejde
- Automatisk cleanup-cron — eksplicit afvist (Mathias afgørelse 6)
- Lag E-arbejde, nye features, arkitektur-ændringer

**Master-plan-paragraffer berørt:**

- §1.6 (snapshot-immutability — princip 9-fundament)
- §1.4 (anonymisering bevarer audit — påvirker DELETE-disciplin)
- §3 (CI-blockers — ny fitness-check tilføjes)
- Appendix C rettelse 27 (lifecycle-trigger for konfiguration — disciplin gælder også for tests der INSERT'er i disse tabeller)

---

## Strukturel beslutning

Pakken etablerer **tx-rollback som default test-mønster** for alle DB-tests der INSERT'er i DELETE-blokerede tabeller (immutability + lifecycle). Fitness-check er den mekaniske håndhævelse — `db-test-tx-wrap-on-immutable-insert` CI-blocker.

**Hvad det binder fremtidigt:**

- Lag E (sales, lønberegning, dashboards) introducerer flere immutable tabeller. Test-skrivnings-disciplin: hver INSERT i ny immutable tabel kræver tx-wrap eller fitness-allowlist-kommentar (`-- no-transaction-needed: <reason>`).
- Eksisterende artefakt-cleanup-migration er ENGANGS. Vi bygger ikke en vedvarende cleanup-vej (break-glass test_cleanup-op-type, ad-hoc cleanup-RPC). Pre-cutover one-shot dækker den eksisterende drift; fitness-check forhindrer fremtidig drift.

**Konsekvens for masterplan:** Princip 9 (status-modeller bevarer historik) konkretiseres yderligere — DELETE-blokering er ikke kun for produktionsdata, det er fundament. Tests må ikke bryde det; tests must rollback.

---

## Mathias' afgørelser (fra krav-dok)

| #   | Afgørelse                                                                   | Plan-konsekvens                                                                                    |
| --- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1   | Scope udvidet til alle DELETE-blokerede tabeller (immutability + lifecycle) | Audit af alle 7 tests fra Codex+Code's afdækning (4 allerede tx-wrappede + r3 + p1a + 1 indirekte) |
| 2   | Lev med 162 audit_log-rows; ryd resten                                      | Cleanup-migration omfatter ~387 rows, ekskluderer audit_log                                        |
| 3   | Ret G044's fejl-reference som del af pakken                                 | Doc-fix-commit i samme PR                                                                          |
| 4   | H022.1 random-offset rulles tilbage når tx-rollback er på plads             | Pkt. 4 i implementations-rækkefølge                                                                |
| 5   | Node 22 → Node 24 inkluderet pga. fælles rod-årsag (CI-friktion)            | Pkt. 6 i implementations-rækkefølge                                                                |
| 6   | Automatisk cleanup-cron AFVIST                                              | Ingen cron-infrastruktur tilføjes. Tx-rollback ER cleanup-mekanismen                               |

---

## Tekniske valg (Code's argumentation)

### Valg 1 — Tilgang til test-cleanup: **A (transaction-rollback)**

For NYE og EKSISTERENDE ikke-tx-wrappede tests: wrap fil-indhold i `begin; ... rollback;`.

**Argument:**

- Trivielt feasibility bekræftet af begge afdækninger på alle 7 berørte tests.
- Ingen schema-ændring; ingen ny RPC; ingen permission-overflade.
- Konsistent med eksisterende konvention dokumenteret i `supabase/tests/README.md`.
- Break-glass `test_cleanup`-op-type (Valg B) ville bygge permanent infrastruktur for ad-hoc cleanup post-cutover — overkill når fitness-check sikrer nye non-idempotente tests aldrig kommer ind.
- Hybrid (Valg C) er ikke nødvendig: tx-rollback dækker nye tests; eksisterende artefakter håndteres separat via Valg 2.

### Valg 2 — Cleanup-vej for eksisterende artefakter: **A (engangs-migration, DISABLE TRIGGER pattern)**

Migration `20260516XXXXXX_h024_test_artifact_cleanup.sql` rydder 387 stale rows i én transaktion:

```
begin;
set local stork.source_type = 'migration';
set local stork.change_reason = 'H024: pre-cutover test-artefakt cleanup';

-- Pr. tabel: midlertidig disable af immutability-trigger, narrow DELETE, re-enable
alter table core_money.commission_snapshots disable trigger commission_snapshots_immutability;
delete from core_money.commission_snapshots where period_id in (<eksplicit liste af test-perioder>);
alter table core_money.commission_snapshots enable trigger commission_snapshots_immutability;

-- Tilsvarende for pay_period_candidate_runs, pay_periods, salary_corrections,
-- anonymization_state, anonymization_strategies (lifecycle: kræver status='draft'-tweak),
-- og 1 anonymized employee i core_identity.employees
commit;
```

**Argument:**

- One-shot pre-cutover; ingen permanent bypass-infrastruktur.
- AFTER-audit-triggers fortsætter med at fyre på DELETE (kun BEFORE immutability-trigger disables), så audit-spor bevares for tabeller der har AFTER DELETE-audit (pay_periods + commission_snapshots).
- `source_type` + `change_reason` session-vars sat for tabeller hvor AFTER-audit kun fyrer på INSERT/UPDATE (salary_corrections, cancellations, anonymization_state): audit-spor er migration-filen + dens commit-hash.
- Alternativ A1 (tilføj `stork.allow_cleanup`-session-var som permanent exception til triggers): bygger permanent mekanisme for one-shot job. Afvist.
- Alternativ B (break-glass test_cleanup-RPC): bygger 2-actor-flow-infrastruktur. Afvist samme begrundelse som Valg 1.
- Alternativ C (manuel SQL uden migration): ingen `schema_migrations`-spor. Afvist — pre-cutover-cleanup skal stadig være sporbar.

**Konkret rækkefølge inden i migration** (FK-afhængigheder):

1. `commission_snapshots` (FK til pay_periods + pay_period_candidate_runs)
2. `pay_period_candidate_runs` (FK til pay_periods)
3. `salary_corrections` (FK til pay_periods)
4. `pay_periods`
5. `anonymization_state` (FK til employees)
6. `anonymization_strategies` (kræver status-rollback til draft før DELETE er tilladt af lifecycle-trigger; alternativ: disable lifecycle-trigger som ovenfor)
7. `core_identity.employees` (1 anonymiseret test-employee)

### Valg 3 — Fitness-check-implementation: **Mønster A (regex-baseret) i scripts/fitness.mjs**

Ny check `db-test-tx-wrap-on-immutable-insert`:

```javascript
// For hver fil i supabase/tests/**/*.sql:
//   1. Find alle "insert into <schema>.<table>" hvor <schema>.<table> er i
//      IMMUTABLE_OR_LIFECYCLE_DELETE_BLOCKED_TABLES
//   2. Hvis filen IKKE indeholder linje-niveau `^begin;` OG `^rollback;`:
//      Violation: "<fil>: INSERT i <tabel> uden BEGIN/ROLLBACK"
//   3. Allowlist-kommentar `-- no-transaction-needed: <reason>` undertrykker check pr. fil
```

Liste over tabeller checken dækker:

- Strict immutability: `core_compliance.audit_log`, `core_compliance.anonymization_state`, `core_money.cancellations`, `core_money.salary_corrections`
- Conditional immutability: `core_money.commission_snapshots`, `core_money.pay_periods`
- Lifecycle-DELETE-restricted: `core_compliance.anonymization_strategies`, `core_compliance.anonymization_mappings`, `core_compliance.break_glass_operation_types`

**Argument:**

- Lav implementations-kompleksitet (~40 linjer JS). Matcher pattern fra eksisterende `truncate-blocked-on-immutable`-check.
- Falsk-positiv-risiko: lav. Allowlist-kommentar dækker bevidste edge-cases.
- Falsk-negativ-risiko: mellem. Fanger ikke RPC-side-effects (kald af `anonymize_employee`, `break_glass_execute` etc. der INSERT'er indirekte). Codex's Mønster D (RPC-call-graf-scan) er for kompleks for v1. **G-nummer for senere udvidelse** (se Risiko-sektion).
- Mønster B (AST/PG-parser): høj kompleksitet, ny dependency. Afvist for v1.
- Mønster C (live-recon, post-test-suite snapshot diff): kræver baseline-snapshot-mekanisme + DB-state-håndtering i CI. Afvist for v1.
- **Bonus-tilføjelse:** Tilføj `core_money.pay_periods` til eksisterende `IMMUTABLE_TABLES_REQUIRE_TRUNCATE_BLOCK`-liste (Codex sidefund — pay_periods har `DELETE altid blokeret` men mangler TRUNCATE-blok-fitness-check).

### Valg 4 — Node 24 minor-version-pin: **Hybrid (major i .nvmrc, exact i .tool-versions, range i engines)**

Matcher pre-eksisterende pattern (`.nvmrc: 22` major, `.tool-versions: nodejs 22.11.0` exact, `engines: ">=22.11.0 <23"` range).

- `.nvmrc`: `24`
- `.tool-versions`: `nodejs 24.x.y` — Code (build-fasen) vælger seneste 24.x LTS-patch via `nvm ls-remote --lts`. Fallback: `24.0.0` hvis ikke kunne queryes.
- `package.json` engines.node: `">=24.0.0 <25"` (samme form som før).
- `apps/web/package.json` `@types/node`: `^24.x.x` bumpes til matching major.

**Argument:** asdf/mise-developere får eksakt pin; nvm-developere får major (læser `.nvmrc`); CI bruger `node-version-file: .nvmrc` (major). Konsistent med pre-eksisterende setup.

### Valg 5 — @types/node-bump + commit-struktur: **Samme PR, fil-cluster-commits**

Implementations-rækkefølge nedenfor er én PR med ~6 fil-cluster-commits. `@types/node` bump committet sammen med engines-bump (samme commit) for at undgå type/runtime-drift-vindue.

### Valg 6 — Audit af "øvrige tests": **Re-verifikation via fitness-check, ikke manuel commit-modifikation**

De 4 allerede tx-wrappede tests (`r7a_anonymize_generic_apply_e2e.sql`, `r7a_break_glass_execute_e2e.sql`, `r7a_replay_anonymization_e2e.sql`, `r7a_retention_cleanup_cron_e2e.sql`) + classification/02_retention_value_consistency.sql får ingen kode-modifikation. Den nye fitness-check verificerer at de IKKE producerer regression-violations. Hvis check rapporterer dem som compliant: audit-leverancen er opfyldt.

**Argument:** Re-verifikation via det mekaniske check er stærkere end manuel inspektion (samme check fanger fremtidig regression). Ingen kode-ændring → ingen risiko for at introducere fejl.

---

## Implementations-rækkefølge

Én build-PR på `claude/H024-build` med 6 fil-cluster-commits i denne rækkefølge:

### Step 1 — Cleanup-migration (DB-side foundation)

- **Hvad:** Migration `20260516XXXXXX_h024_test_artifact_cleanup.sql` der DELETE'er 387 stale test-rows via DISABLE/ENABLE TRIGGER pattern.
- **Hvorfor først:** Følgende steps modificerer tests der konflikter med disse rows ved fixed-dato.
- **Migration-fil:** `supabase/migrations/20260516XXXXXX_h024_test_artifact_cleanup.sql` (timestamp ved build-tid)
- **Risiko:** Mellem. DELETE af 387 rows i én transaktion. Rollback: transaktion-rollback hvis migration fejler. Idempotency: migration kører kun én gang per schema_migrations-konvention; re-run skader ikke (DELETE WHERE matchet i forvejen returnerer 0 rows).
- **Verifikation i migration:** Tæl rows før og efter, log i NOTICE; raise hvis count post-DELETE ≠ 0 for rows der matcher cleanup-prædikat.

### Step 2 — R3 + P1A tx-wrap + H022.1 rollback

- **Hvad:**
  - `supabase/tests/smoke/r3_commission_snapshots_immutability.sql`: wrap i `begin;` ... `rollback;`. Rul H022.1 random-offset tilbage til fixed dato `'2199-01-01'::date` (far-future, intet realistic konflikt; tx-rollback sikrer alligevel ingen persistens).
  - `supabase/tests/smoke/p1a_anonymization_strategies.sql`: wrap i `begin;` ... `rollback;`. T5-strategy-INSERT bevarer `extract(epoch)`-suffix (rollback gør det irrelevant, men ingen grund til kode-ændring).
- **Hvorfor:** Default mønster fra nu af. Tx-rollback sikrer at hver kørsel ikke efterlader artefakter.
- **Risiko:** Lav. Begge tests' assertions er lokale (raise på fejl) — observerbare inden rollback.
- **Verifikation:** Kør `pnpm db:test --dir smoke` lokalt. Forvent grøn.
- **Hvorfor fixed `'2199-01-01'` og ikke pre-H022's `current_date + '5 years'`:** Pre-H022-værdien (~2031) konflikter med de stale rows der eksisterer indtil migration fra Step 1 applies til live DB. PR's egen CI-kørsel ville ramme konflikt før Mathias applies migration. Far-future fixed-dato kombineret med tx-rollback er stabilt og uden kollision uanset migration-state.

### Step 3 — Fitness-check `db-test-tx-wrap-on-immutable-insert`

- **Hvad:** Ny check i `scripts/fitness.mjs`. Liste over 9 immutability + lifecycle-DELETE-restricted tabeller (se Valg 3). Bonus: `core_money.pay_periods` tilføjes til eksisterende `IMMUTABLE_TABLES_REQUIRE_TRUNCATE_BLOCK`.
- **Hvorfor før Node 24:** Fitness-checks skal grønne ved samme CI som introducerer tx-wrap'ene. Hvis Node 24 introducerede regression i fitness-runtime: ville være sværere at debugge i samme commit.
- **Risiko:** Lav. Statisk fil-scan, samme pattern som eksisterende checks. Falsk-positiv vil blokere CI — derfor allowlist-kommentar-mekanisme.

### Step 4 — G044 fejl-reference fix i teknisk-gaeld.md

- **Hvad:** Ret G044's note om `r4_salary_corrections_cleanup` der ikke eksisterer som test. Erstat med korrekt reference: R4 (commit `484c134`) var compute-cleanup af salary_corrections_candidate dead-code, ikke en test-fil. Eneste test der rører salary_corrections er G017's enkelte smoke-row.
- **Hvorfor:** Mathias afgørelse 3. Doc-fix, ingen kode-konsekvens.
- **Risiko:** Lav (doc-only).

### Step 5 — Node 22 → Node 24

- **Hvad:** 7 filer modificeres:
  - `package.json` engines.node: `">=22.11.0 <23"` → `">=24.0.0 <25"`
  - `.nvmrc`: `22` → `24`
  - `.tool-versions`: `nodejs 22.11.0` → `nodejs 24.x.y` (build-tid valg)
  - `README.md:26`: tabel-row `Node | 22 LTS` → `24 LTS`
  - `README.md:38`: kommentar `→ 22` → `→ 24`
  - `apps/web/package.json:73`: `"@types/node": "^22.16.5"` → `"@types/node": "^24.x.x"`
  - `pnpm-lock.yaml`: regenereres automatisk via `pnpm install` efter @types/node bump
- **Hvorfor sidst:** Isolerer Node-bump fra test-cleanup-changes. Hvis Node 24 introducerer subtil regression: kan isoleres pr. commit.
- **Risiko:** Mellem. Engines-strict via `.npmrc:1` betyder pnpm install fejler hvis runtime ikke matcher. Build-tid: lokal Node skal være på 24 før `pnpm install`. CI har `setup-node@v4` med `node-version-file: .nvmrc` → automatisk korrekt.
- **Verifikation:** `pnpm install` lokalt + CI-grøn.

### Step 6 — Dokumentations-opdateringer (oprydning-relateret er separat sektion nedenfor)

- **Hvad:**
  - `docs/teknisk/teknisk-gaeld.md`: G017 markeret LØST i denne pakke. G043 + G044 markeret LØST. G018 (bygge-status klassifikations-tal forkerte) IKKE i scope. Eventuel ny G-nummer for fitness-check Mønster D-udvidelse (se Risiko).
  - `docs/strategi/bygge-status.md`: H024-entry tilføjet med vision-tjek.
  - `docs/strategi/stork-2-0-master-plan.md`: rettelse-entry hvis fitness-check eller cleanup-pattern påvirker §3 CI-blocker-listen.
- **Hvorfor:** Doc-konsistens med kode-ændringer.

---

## Test-konsekvens

| Test-fil                                                                | Hvad verificeres                                                                                | Forventet status efter pakke           |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------- |
| `supabase/tests/smoke/r3_commission_snapshots_immutability.sql`         | T1-T4 commission_snapshots conditional immutability uændret. Tx-wrap rollbacks alle artefakter. | Grøn — idempotent på tværs af kørsler  |
| `supabase/tests/smoke/p1a_anonymization_strategies.sql`                 | T1-T6 strategy lifecycle uændret. Tx-wrap rollbacks T5's INSERT'ede strategi.                   | Grøn — idempotent                      |
| `supabase/tests/smoke/r7a_*` (4 tests)                                  | Uændret — allerede tx-wrappede                                                                  | Grøn — verificeret af ny fitness-check |
| `supabase/tests/classification/02_retention_value_consistency.sql`      | Uændret — allerede tx-wrappet                                                                   | Grøn — verificeret af ny fitness-check |
| **Ny:** Fitness-check `db-test-tx-wrap-on-immutable-insert` rapporterer | 0 violations på alle 24 nuværende test-filer                                                    | Grøn                                   |
| **Ny:** Migration-gate strict                                           | Cleanup-migration overholder klassifikations- og bypass-discipline                              | Grøn                                   |

**Ingen ny smoke-test bygges.** Cleanup-migration verificerer sin egen effekt inline (RAISE NOTICE med row-counts; assertion om 0 stale-rows efter DELETE). Fitness-check er det selv-testende lag for tx-wrap-disciplin.

---

## Risiko + kompensation

| Step                  | Værste-case                                                                    | Sandsynlighed                            | Rollback                                                                                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 (cleanup-migration) | DELETE rammer ikke-test-row pga. for bred WHERE-prædikat                       | Lav                                      | Tx-rollback inde i migration; eksplicit `period_id`-liste reducerer risiko. Snapshot-tabeller har audit-spor af DELETE for forensics.                                                                                                 |
| 1 (cleanup-migration) | DISABLE TRIGGER glemmer at re-ENABLE                                           | Lav                                      | Migration kører i én transaktion; alt rolles tilbage hvis enable fejler.                                                                                                                                                              |
| 2 (r3 tx-wrap)        | Fixed dato `'2199-01-01'` konflikter med fremtidig pay_periods                 | Negligibel                               | Tx-rollback gør INSERT non-persistent; konflikt ville kræve committed row med samme dato — ingen realistic scenario                                                                                                                   |
| 2 (p1a tx-wrap)       | T6-DELETE-forsøg på tested-strategy kunne ramme uventet rollback-state         | Negligibel                               | T6 catcher P0001 i `exception when` blok; rollback påvirker ikke flow                                                                                                                                                                 |
| 3 (fitness-check)     | Falsk-positiv blokerer eksisterende compliant test                             | Lav                                      | Allowlist-kommentar; check-eksklusion ved violation-fix                                                                                                                                                                               |
| 3 (fitness-check)     | Falsk-negativ — RPC-side-effect-test slipper igennem                           | Mellem (kendt afgrænsning)               | **Ny G-nummer:** fitness-check-Mønster D (RPC-side-effect-scan). Tx-rollback-disciplin gælder ALLE side-effect-tests; Mønster A fanger ikke alle. Konsekvens: Lag E-test-skrivnings-disciplin skal eksplicit guide RPC-test-mønstret. |
| 4 (G044-doc-fix)      | Doc-edit-konflikt                                                              | Negligibel                               | Fil-revert                                                                                                                                                                                                                            |
| 5 (Node 24)           | Subtil runtime-regression i scripts/fitness.mjs eller scripts/run-db-tests.mjs | Lav (afdækning fandt 0 breaking changes) | Revert Node-bump-commit; CI på 22 indtil dependency reflag'es                                                                                                                                                                         |
| 5 (Node 24)           | pnpm 10 + Node 24 install-friktion                                             | Lav                                      | Bumping pnpm hvis kompatibilitet kræver det; ikke planlagt nu                                                                                                                                                                         |
| 6 (doc-opdateringer)  | Inkonsistens mellem teknisk-gaeld + master-plan                                | Lav                                      | Doc-revert; grep-tjek listed i Oprydnings-strategi                                                                                                                                                                                    |

**Kompensation (samlet):** Hvis hele pakken fejler under build: tilbageroll PR. Cleanup-migration's effekt PÅ live DB (efter Mathias applies) kan ikke rolles tilbage uden specifik recovery — men det er pre-cutover og test-data, så praktisk konsekvens er nul.

---

## Oprydnings- og opdaterings-strategi

**Filer der skal flyttes til arkiv** (efter pakken er merget):

- `docs/coordination/H024-krav-og-data.md` → `docs/coordination/arkiv/`
- `docs/coordination/H024-plan.md` → `docs/coordination/arkiv/`
- Alle `docs/coordination/plan-feedback/H024-*.md` → `docs/coordination/arkiv/`
- `docs/coordination/afdaekning/g043-g044-data-code-2026-05-16.md` — hvis bragt på main i denne pakke (se note nedenfor) → arkiveres som del af pakken
- `docs/coordination/afdaekning/g043-g044-data-codex-2026-05-16.md` — som ovenfor

**Note om afdæknings-filer:** Disse er aktuelt ikke-merged til main (Code's er på lokal afdæknings-branch; Codex's er untracked). Plan-fasen-konsekvens: build-PR'en bringer dem på main som referenced data-grundlag i samme commit som krav-dok arkiveres. Begrundelse: krav-dok refererer dem som autoritativt data-grundlag — de skal være tilgængelige på main for historisk auditability efter pakken er afsluttet.

**Filer der skal slettes** (hvis pakken gør dem irrelevante):

- Ingen.

**Dokumenter der skal opdateres:**

- `docs/coordination/aktiv-plan.md` → ryd til "ingen aktiv plan" + tilføj H024-entry i Historisk-sektionen
- `docs/coordination/seneste-rapport.md` → peger på H024-slut-rapporten
- `docs/coordination/mathias-afgoerelser.md` → ny entry om at "tx-rollback er default for DB-tests + fitness-check håndhæver" som strategisk retning-skift
- `docs/strategi/bygge-status.md` → H024-entry med vision-tjek
- `docs/strategi/stork-2-0-master-plan.md` → rettelse-entry hvis §3 CI-blocker-liste udvides (fitness-check-tilføjelse). Vurderes ved build-tid.
- `docs/teknisk/teknisk-gaeld.md` → G017 LØST (cleanup-migration), G043 LØST (tx-wrap + fitness-check), G044 LØST (tx-wrap + fitness-check + fejl-reference-fix). Mulig ny G-nummer for fitness-check Mønster D-udvidelse.

**Reference-konsekvenser:**

- Ingen filer om-døbes eller flyttes (kun arkiv-flytninger sker EFTER merge — ikke under build).
- Verifikation: `grep -r "H024-krav-og-data\|H024-plan" docs/` returnerer kun referencer i `docs/coordination/arkiv/` + rapport-historik + bygge-status. Ingen referencer fra arbejds-state-filer (aktiv-plan, seneste-rapport).

**Ansvar:** Code udfører oprydning + opdatering som del af build, ikke separat trin. Slut-rapporten verificerer udførelse.

---

## Konsistens-tjek

**Vision:**

- **Princip 6 (audit på alt der ændrer data):** Styrket. Cleanup-migration bevarer AFTER-audit-trigger-fyring for tabeller hvor den findes; eksplicit `source_type='migration'` + `change_reason` for de øvrige.
- **Princip 9 (status-modeller bevarer historik):** Uændret. DELETE-blokering på production-data-tabeller bevares; cleanup er one-shot pre-cutover-undtagelse med audit-spor. Tests bryder ikke princippet — tx-rollback betyder INSERT'er aldrig commits.
- **Princip 5 (lifecycle for konfiguration):** Uændret. Lifecycle-trigger på anonymization_strategies/mappings/break_glass_operation_types bevares; cleanup respekterer status-progression eller bruger DISABLE TRIGGER-mønster.
- **"Greenfield ikke 1.0-antimønstre":** Styrket. H022.1 random-offset (workaround) rulles tilbage til arkitektur-løsning (tx-rollback + fitness-check).

**Master-plan:**

- §1.6 (snapshot-immutability): Uændret. Conditional immutability på commission_snapshots forbliver intakt; tests bypass via tx-rollback (rolls back før commit), ikke via trigger-modifikation.
- §3 (CI-blockers): Udvides med `db-test-tx-wrap-on-immutable-insert`-check. Rettelse-entry tilføjes i Appendix C.
- §1.4 (anonymisering bevarer audit): Uændret. Cleanup-migration's DELETE af 1 anonymization_state-row + 1 anonymized employee fjerner C002-test-spor, ikke produktion-anonymisering.

**Disciplin-pakke** (jf. `docs/strategi/arbejds-disciplin.md`):

- Formåls-immutabilitet: respekteres. Tekniske valg afgøres af Code; formålet (krav-dok §Formål) er låst.
- Plan-leverance er kontrakt: respekteres. Mathias' 6 afgørelser implementeres 1:1.
- Krav-dokument-disciplin: respekteres. Ingen scope-udvidelse eller reklassificering af "IKKE i scope".
- Defensiv minimal-diff over teknisk korrekthed = anti-pattern: H022.1's random-offset rulles tilbage til arkitektur-fix; far-future fixed-dato (`'2199-01-01'`) valgt frem for pre-H022's `'5 years'`-værdi der ville konflikte med stale rows pre-migration-apply.

---

## Konklusion

Planen bringer pakken nærmere formålet med acceptabel risiko:

- Tx-rollback + fitness-check er arkitektur-fix, ikke workaround.
- Cleanup-migration er one-shot pre-cutover-løsning; ingen permanent bypass-infrastruktur tilføjes.
- Node 24-opgradering uden dependency-blockers.
- Højeste risiko: fitness-check Mønster A's falsk-negativ for RPC-side-effects. Mitigeret via G-nummer + dokumenteret afgrænsning. Acceptabelt for v1.

Klar til Codex- og Claude.ai-review-runde.
