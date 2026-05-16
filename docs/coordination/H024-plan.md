# H024 — Plan V2

**Pakke:** H024 — test-idempotens + artefakt-cleanup + Node 24
**Krav-dokument:** `docs/coordination/H024-krav-og-data.md` (merged i `a15caff`)
**Branch:** `claude/H024-plan` (denne fil), build: `claude/H024-build`
**Plan-version:** V2 (afløser V1)

---

## V1 → V2 changelog

V2 adresserer alle fund fra runde 1 (`docs/coordination/plan-feedback/H024-V1-codex.md` + `H024-V1-claude-ai.md`).

| Fund                                                                                                                                 | Reviewer                     | Severity  | V2-handling                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Cleanup-migration mangler test-only guard                                                                                            | Codex                        | KRITISK   | Step 1 omskrevet: marker-based DELETE pr. row-kategori, pre/post-precondition-assertions, eksplicit ekskludering af 5 reelle rows. |
| Audit-spor-antagelse for commission_snapshots forkert (audit-exempt post-R3)                                                         | Codex                        | MELLEM    | Valg 2-tekst + risiko-tabel rettet. Audit-spor for snapshots = migration-fil + commit-hash + NOTICE-counts, ikke trigger-output.   |
| Valg 2 klassificeret "A" men implementerer faktisk "D (andet)"                                                                       | Claude.ai                    | MELLEM    | Valg 2 omdøbt til "D (andet, DISABLE TRIGGER-variant)". Eksplicit Mathias-godkendelse-forudsætning tilføjet.                       |
| pay_periods → IMMUTABLE_TABLES_REQUIRE_TRUNCATE_BLOCK er scope-glid                                                                  | Claude.ai                    | KOSMETISK | Markeret som "scope-rydning bonus", bevares i pakke.                                                                               |
| Afdæknings-filer på main = scope-rydning                                                                                             | Claude.ai                    | KOSMETISK | Markeret som "scope-rydning bonus", bevares i pakke.                                                                               |
| Krav-dok-kategoriserings-konflikt: G017 candidate_run (`724c73cb`) labeled "reelle" men FK-linked til G017 pay_period (clean-target) | Code (selv-opdaget under V2) | MELLEM    | Flag som åben afklaring til Mathias. V2-plans cleanup-vej for G017 håndterer cluster atomically.                                   |

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
5. Cleanup af eksisterende test-artefakter (~382 rows excl. audit_log + excl. 5 reelle rows der bevares)
6. Fitness-check der detekterer non-idempotente tests
7. Node 22 → Node 24 opgradering
8. Ret G044's fejl-reference til ikke-eksisterende `r4_salary_corrections_cleanup`

**Scope-bonus** (uden for krav-dok, men acceptable per Claude.ai V1-review):

- Tilføj `core_money.pay_periods` til eksisterende `IMMUTABLE_TABLES_REQUIRE_TRUNCATE_BLOCK`-fitness-check-liste (Codex sidefund #3).
- Bring afdæknings-filer (`g043-g044-data-code-2026-05-16.md`, `g043-g044-data-codex-2026-05-16.md`) på main som krav-dok refererer dem som data-grundlag.

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
| 2   | Lev med 162 audit_log-rows; ryd resten                                      | Cleanup-migration omfatter ~382 rows, ekskluderer audit_log og 5 reelle rows                       |
| 3   | Ret G044's fejl-reference som del af pakken                                 | Doc-fix-commit i samme PR                                                                          |
| 4   | H022.1 random-offset rulles tilbage når tx-rollback er på plads             | Pkt. 4 i implementations-rækkefølge                                                                |
| 5   | Node 22 → Node 24 inkluderet pga. fælles rod-årsag (CI-friktion)            | Pkt. 6 i implementations-rækkefølge                                                                |
| 6   | Automatisk cleanup-cron AFVIST                                              | Ingen cron-infrastruktur tilføjes. Tx-rollback ER cleanup-mekanismen                               |

---

## Åben afklaring til Mathias (krav-dok-kategoriserings-konflikt — opdaget under V2)

Krav-dok-tabellen (`H024-krav-og-data.md:43-45`) lister:

- `core_money.pay_periods`: **1 G017** + 1 tidlig + **3 reelle** + 26 R3-smoke (= 31 total)
- `core_money.pay_period_candidate_runs`: 25 r3-smoke + 1 test-checksum + **2 reelle** (= 28 total)

Code's afdækning identificerede candidate_runs til pay_period-mapping:

| candidate_run_id   | period_id        | data_checksum        | period-kategori per krav-dok                           |
| ------------------ | ---------------- | -------------------- | ------------------------------------------------------ |
| `724c73cb-f949...` | `8e2740b3`       | `aa4cca23...` (hash) | G017 pay_period (**clean-target** per krav-dok)        |
| `e8070819-c31a...` | `f4c86616`       | `23597fae...` (hash) | Reelle pay_period (**bevares** per krav-dok)           |
| `c6b590ef-4603...` | `c563d76e`       | `test-checksum`      | Tidlig test pay_period (**clean-target** per krav-dok) |
| 25 × r3-smoke      | (25 forskellige) | `r3-smoke-checksum`  | R3-smoke pay_periods (**clean-target** per krav-dok)   |

**Konflikt:** Krav-dok kalder "2 reelle" candidate_runs. Hvis det er `724c73cb` + `e8070819`: så er G017-cluster's candidate_run "reelle" mens dens pay_period er "clean-target". FK-constraint (`pay_period_candidate_runs.period_id` → `pay_periods.id`) gør det umuligt at slette G017 pay_period uden enten først at slette G017's candidate_run ELLER bevare G017 pay_period.

**Mulige tolkninger:**

a) Krav-dok's "2 reelle" candidate_runs = `e8070819` + en anden (men kun 2 hash-baserede candidate_runs eksisterer: `724c73cb` og `e8070819`). Hvis krav-dok mener kun e8070819 er reelle: kun 1 reelle candidate_run, 27 til at slette. Mathias-bekræftelse nødvendig.

b) G017-cluster (1 pay_period + 1 candidate_run + 260 commission_snapshots) behandles atomically som "clean-target" — krav-dok's "2 reelle" candidate_runs er forkert; korrekt antal er 1 (kun e8070819).

c) G017 pay_period bevares som reelle (krav-dok's "1 G017" er forkert; G017-cluster er reelle).

**V2-plans antagelse (afventer Mathias-bekræftelse):** Tolkning (b). G017 er test-artefakt (G017-entry i `docs/teknisk/teknisk-gaeld.md` siger eksplicit "test-artefakter i prod-DB", `description='smoke test'` for tilknyttet salary_correction underbygger). G017-cluster (1 pay_period + 1 candidate_run + 260 snapshots) ryddes atomically. Krav-dok's "2 reelle" candidate_runs ændres effektivt til "1 reelle" (kun e8070819).

**Hvis Mathias vælger (a) eller (c):** plan justeres i V3. (b) er Code's anbefaling pga. teknisk-gaeld-G017-definition.

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

### Valg 2 — Cleanup-vej for eksisterende artefakter: **D (andet, DISABLE TRIGGER-variant)**

**Klassifikations-rettelse (Claude.ai V1-feedback):** Krav-dok specificerer option A som "engangs-migration der bypasser immutability-trigger med eksplicit reason-marker (`stork.allow_*_cleanup='true'` pattern)". Code afviser session-var-pattern (V1's "A1") og vælger DISABLE TRIGGER-pattern. Det er funktionelt option **D ("andet")**, ikke A — V2 omdøber for ærlighed.

**Argument D over A, B, C:**

- A (session-var-pattern): tilføjer permanent session-var-exception til immutability-triggers for one-shot cleanup. Permanent mekanisme for engangs-job — bygger fundament-pattern-vej der kan misbruges post-cutover. Afvist.
- B (break-glass test_cleanup-RPC): bygger 2-actor-flow-infrastruktur for engangs-job. Permanent infrastruktur for ad-hoc cleanup post-cutover — fitness-check sikrer nye non-idempotente tests aldrig kommer ind, så permanent break-glass-vej er overkill. Afvist.
- C (manuel SQL uden migration): ingen `schema_migrations`-spor. Afvist — pre-cutover-cleanup skal være sporbar via migration-fil.
- D (DISABLE TRIGGER): atomisk one-shot pattern. Trigger disables midlertidigt INDEN i transaktionen, narrow DELETE udføres, trigger enables igen FØR commit. Hvis enable fejler: transaktion rolles tilbage, trigger-state intakt. Ingen permanent ny mekanisme tilføjes.

**FORUDSÆTNING FOR BUILD (kræver eksplicit Mathias-godkendelse):**

DISABLE TRIGGER på immutability-triggers etablerer pattern — selv som one-shot. Master-plan §1.4 skitserer GDPR-retroactive-vej som _eneste_ exception-vej til audit_log-immutability, med audit-spor garanteret via dedikeret RPC. DISABLE TRIGGER pattern omgår denne arkitektur. For one-shot pre-cutover-cleanup er det pragmatisk, men det er reel afvigelse fra hvordan immutability-undtagelser er designet i master-plan.

**Mathias-godkendelse bekræfter:** "DISABLE TRIGGER er acceptabel one-shot-mekanisme pre-cutover for test-artefakt-cleanup. Det etableres IKKE som vedvarende pattern; fremtidige cleanup-behov post-cutover kræver GDPR-retroactive-vej eller dedikeret RPC."

Hvis ikke godkendt: Code skifter til A (session-var-pattern) eller B (break-glass-RPC) i V3.

**Migration-skitse (rettet for audit-virkelighed):**

```sql
-- Migration: 20260516XXXXXX_h024_test_artifact_cleanup.sql
begin;
set local stork.source_type = 'migration';
set local stork.change_reason = 'H024: pre-cutover test-artefakt cleanup';

-- For hver tabel: precondition (count matches expected), disable BEFORE-trigger,
-- narrow marker-based DELETE, re-enable trigger, post-condition (rows gone).
-- Bemærk: commission_snapshots ER audit-exempt post-R3 (audit-trigger droppet
-- i 20260515090000_r3_r4_*) — ingen row-level audit_log skrives ved DELETE.
-- Audit-spor for snapshots-cleanup = denne migration-fil + commit-hash +
-- NOTICE-counts logget undervejs.

-- (se Step 1 nedenfor for konkret marker-based-mønster pr. tabel)

commit;
```

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

Liste over tabeller checken dækker (9 stk.):

- Strict immutability: `core_compliance.audit_log`, `core_compliance.anonymization_state`, `core_money.cancellations`, `core_money.salary_corrections`
- Conditional immutability: `core_money.commission_snapshots`, `core_money.pay_periods`
- Lifecycle-DELETE-restricted: `core_compliance.anonymization_strategies`, `core_compliance.anonymization_mappings`, `core_compliance.break_glass_operation_types`

**Argument:**

- Lav implementations-kompleksitet (~40 linjer JS). Matcher pattern fra eksisterende `truncate-blocked-on-immutable`-check.
- Falsk-positiv-risiko: lav. Allowlist-kommentar dækker bevidste edge-cases.
- Falsk-negativ-risiko: mellem. Fanger ikke RPC-side-effects (kald af `anonymize_employee`, `break_glass_execute` etc. der INSERT'er indirekte). Codex's Mønster D (RPC-call-graf-scan) er for kompleks for v1. **G-nummer for senere udvidelse** (se Risiko-sektion).
- Mønster B (AST/PG-parser): høj kompleksitet, ny dependency. Afvist for v1.
- Mønster C (live-recon, post-test-suite snapshot diff): kræver baseline-snapshot-mekanisme + DB-state-håndtering i CI. Afvist for v1.

**Scope-bonus (markeret i scope ovenfor):** Tilføj `core_money.pay_periods` til eksisterende `IMMUTABLE_TABLES_REQUIRE_TRUNCATE_BLOCK`-liste. Trivielt 1-entry-tilføjelse til eksisterende mekanisme. Codex sidefund #3. Ikke krav-dok-leverance, men beslægtet med formålet.

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

### Step 1 — Cleanup-migration (DB-side foundation, marker-based DELETE)

- **Hvad:** Migration `20260516XXXXXX_h024_test_artifact_cleanup.sql` der DELETE'er 382 stale test-rows via marker-based WHERE-clauses, DISABLE/ENABLE TRIGGER pattern, pre/post-precondition-assertions.
- **Hvorfor først:** Følgende steps modificerer tests der konflikter med disse rows ved fixed-dato.
- **Migration-fil:** `supabase/migrations/20260516XXXXXX_h024_test_artifact_cleanup.sql` (timestamp ved build-tid)
- **Risiko:** Lav-mellem (reduceret fra V1's "mellem"). Marker-based WHERE-clauses sikrer kun test-rows ramt. Pre/post-asserts raiser hvis count afviger.

**Marker-pattern pr. tabel (alle tx-wrapped, sekvensielt FK-rækkefølge):**

#### 1. `core_money.commission_snapshots` (286 rows clean-target)

**Audit-virkelighed:** commission_snapshots er **audit-exempt post-R3** (`commission_snapshots_audit`-trigger droppet i `20260515090000_r3_r4_commission_snapshots_update_flag.sql:45-47`). Cleanup vil IKKE skrive row-level audit_log. Audit-spor = denne migration-fil + commit-hash + RAISE NOTICE row-counts.

```sql
-- Pre-precondition: 286 snapshots associated med G017-cluster eller r3-smoke pay_periods
do $$ declare v_expected_count int; v_actual_count int; begin
  select count(*) into v_actual_count from core_money.commission_snapshots
  where period_id in (
    select id from core_money.pay_periods
    where (start_date = '2020-01-15' and end_date = '2020-02-14' and status = 'locked')  -- G017
       or id in (select period_id from core_money.pay_period_candidate_runs
                 where data_checksum in ('r3-smoke-checksum', 'test-checksum'))  -- R3 + tidlig
  );
  v_expected_count := 286;
  -- Tillad >= forventet pga. CI-runs der har tilføjet snapshots mellem plan og migration
  if v_actual_count < v_expected_count then
    raise exception 'H024 cleanup precondition fejlet: commission_snapshots clean-target count = % (forventet >= %)',
      v_actual_count, v_expected_count;
  end if;
  raise notice 'H024: commission_snapshots clean-target count = % (forventet >= 286)', v_actual_count;
end $$;

alter table core_money.commission_snapshots disable trigger commission_snapshots_immutability;
delete from core_money.commission_snapshots
where period_id in (
  select id from core_money.pay_periods
  where (start_date = '2020-01-15' and end_date = '2020-02-14' and status = 'locked')
     or id in (select period_id from core_money.pay_period_candidate_runs
               where data_checksum in ('r3-smoke-checksum', 'test-checksum'))
);
alter table core_money.commission_snapshots enable trigger commission_snapshots_immutability;

-- Post-precondition: 0 snapshots remaining med marker-match
do $$ declare v_remaining int; begin
  select count(*) into v_remaining from core_money.commission_snapshots
  where period_id in (
    select id from core_money.pay_periods
    where (start_date = '2020-01-15' and end_date = '2020-02-14' and status = 'locked')
       or id in (select period_id from core_money.pay_period_candidate_runs
                 where data_checksum in ('r3-smoke-checksum', 'test-checksum'))
  );
  if v_remaining <> 0 then
    raise exception 'H024 cleanup post-precondition fejlet: % commission_snapshots remaining', v_remaining;
  end if;
end $$;
```

#### 2. `core_money.pay_period_candidate_runs` (26 rows clean-target — 25 r3-smoke + 1 test-checksum + G017's candidate_run via cluster-tolkning)

**Bevarede rows:** `e8070819-c31a-43a0-8511-72887e7442b1` (FK til f4c86616 reelle pay_period).

```sql
-- Pre-precondition
do $$ declare v_marker_count int; begin
  select count(*) into v_marker_count from core_money.pay_period_candidate_runs
  where data_checksum in ('r3-smoke-checksum', 'test-checksum')
     or period_id in (select id from core_money.pay_periods
                      where start_date = '2020-01-15' and end_date = '2020-02-14');
  if v_marker_count < 27 then  -- 25 r3-smoke + 1 test-checksum + 1 G017-cluster
    raise exception 'H024 cleanup precondition fejlet: candidate_runs clean-target = % (forventet >= 27)', v_marker_count;
  end if;
  raise notice 'H024: candidate_runs clean-target count = % (forventet >= 27)', v_marker_count;
end $$;

-- Ingen immutability-trigger på pay_period_candidate_runs (ikke i liste #1) — DELETE direkte
delete from core_money.pay_period_candidate_runs
where data_checksum in ('r3-smoke-checksum', 'test-checksum')
   or period_id in (select id from core_money.pay_periods
                    where start_date = '2020-01-15' and end_date = '2020-02-14');

-- Post-precondition: 1 candidate_run remaining (e8070819 paired with f4c86616 reelle)
do $$ declare v_remaining int; begin
  select count(*) into v_remaining from core_money.pay_period_candidate_runs;
  if v_remaining < 1 then
    raise exception 'H024 cleanup post-precondition fejlet: alle candidate_runs slettet (reelle skulle bevares)';
  end if;
  raise notice 'H024: candidate_runs remaining = %', v_remaining;
end $$;
```

#### 3. `core_money.salary_corrections` (1 row clean-target: G017 smoke test)

**Audit-virkelighed:** `salary_corrections_audit`-trigger fyrer kun AFTER INSERT (ikke DELETE). Audit-spor for DELETE = migration-fil + commit-hash + NOTICE.

```sql
do $$ declare v_count int; begin
  select count(*) into v_count from core_money.salary_corrections
  where description = 'smoke test' and amount = -100.00 and reason = 'cancellation';
  if v_count <> 1 then
    raise exception 'H024 cleanup precondition fejlet: salary_corrections smoke-marker count = % (forventet 1)', v_count;
  end if;
end $$;

alter table core_money.salary_corrections disable trigger salary_corrections_immutability;
delete from core_money.salary_corrections
where description = 'smoke test' and amount = -100.00 and reason = 'cancellation';
alter table core_money.salary_corrections enable trigger salary_corrections_immutability;

do $$ declare v_count int; begin
  select count(*) into v_count from core_money.salary_corrections
  where description = 'smoke test' and amount = -100.00;
  if v_count <> 0 then
    raise exception 'H024 cleanup post-precondition fejlet: % salary_corrections remaining', v_count;
  end if;
  raise notice 'H024: salary_corrections cleanup complete';
end $$;
```

#### 4. `core_money.pay_periods` (27 rows clean-target — 1 G017 + 1 tidlig + 25 R3-smoke per Code's tælling; krav-dok siger 26 R3-smoke. Pre-assert tillader >= 27)

**Bevarede rows:** 3 reelle (2026-04-15 → 2026-07-14 dato-range).

**Audit-virkelighed:** `pay_periods_audit`-trigger fyrer på AFTER INSERT/UPDATE/DELETE — DELETE genererer row-level audit_log ✓.

```sql
do $$ declare v_marker_count int; v_preserved_count int; begin
  -- Count clean-targets
  select count(*) into v_marker_count from core_money.pay_periods
  where (start_date = '2020-01-15' and end_date = '2020-02-14' and status = 'locked')  -- G017
     or id in (select period_id from core_money.pay_period_candidate_runs
               where data_checksum in ('r3-smoke-checksum', 'test-checksum'));  -- R3+tidlig (efter candidate_runs DELETE — bemærk rækkefølge!)
  -- Bemærk: pay_period_candidate_runs ER slettet før dette step, så ovenstående subquery
  -- vil returnere tom. Vi bruger derfor direkte ID-baseret marker som backup:
  -- Eksplicit pay_period_id-liste er nødvendig fordi candidate_runs-marker er væk.
  --
  -- Korrekt approach: byt rækkefølge → slet pay_periods FØR candidate_runs?
  -- Nej: candidate_runs har FK til pay_periods. Skal slettes FØR pay_periods.
  --
  -- Reel approach: capture pay_period-IDs i temp-table FØR candidate_runs slettes.

  -- (Se næste sub-step nedenfor for korrigeret approach)
  null;
end $$;
```

**KORRIGERET APPROACH (single transaction, capture pay_period-IDs first):**

```sql
-- Capture clean-target pay_period-IDs til temp-table FØR vi sletter candidate_runs
create temp table h024_pay_period_clean_targets as
select p.id, p.start_date, p.end_date, p.status
from core_money.pay_periods p
where (p.start_date = '2020-01-15' and p.end_date = '2020-02-14' and p.status = 'locked')  -- G017
   or p.id in (select period_id from core_money.pay_period_candidate_runs
               where data_checksum in ('r3-smoke-checksum', 'test-checksum'));  -- R3 + tidlig

do $$ declare v_count int; begin
  select count(*) into v_count from h024_pay_period_clean_targets;
  if v_count < 27 then  -- 1 G017 + 1 tidlig + >=25 R3-smoke
    raise exception 'H024 cleanup precondition fejlet: pay_period clean-targets = % (forventet >= 27)', v_count;
  end if;
  raise notice 'H024: pay_period clean-target count = % (forventet >= 27)', v_count;

  -- Bekræft reelle bevares
  select count(*) into v_count from core_money.pay_periods
  where status = 'open' and start_date between '2026-04-15' and '2026-06-15'
    and id not in (select id from h024_pay_period_clean_targets);
  if v_count <> 3 then
    raise exception 'H024 cleanup precondition fejlet: reelle pay_periods count = % (forventet 3)', v_count;
  end if;
  raise notice 'H024: reelle pay_periods preserved count = % (forventet 3)', v_count;
end $$;

-- Bemærk: rækkefølge i migration:
-- 1. Capture pay_period IDs (ovenfor)
-- 2. DELETE commission_snapshots WHERE period_id IN temp-table
-- 3. DELETE candidate_runs WHERE period_id IN temp-table OR data_checksum-marker
-- 4. DELETE salary_corrections (markered)
-- 5. DELETE pay_periods WHERE id IN temp-table

alter table core_money.pay_periods disable trigger pay_periods_lock_and_delete_check;
delete from core_money.pay_periods where id in (select id from h024_pay_period_clean_targets);
alter table core_money.pay_periods enable trigger pay_periods_lock_and_delete_check;

do $$ declare v_remaining int; begin
  select count(*) into v_remaining from core_money.pay_periods
  where (start_date = '2020-01-15' and end_date = '2020-02-14' and status = 'locked');
  if v_remaining <> 0 then
    raise exception 'H024 cleanup post-precondition fejlet: G017 pay_period remaining';
  end if;

  -- Reelle skal stadig være der
  select count(*) into v_remaining from core_money.pay_periods
  where status = 'open' and start_date between '2026-04-15' and '2026-06-15';
  if v_remaining <> 3 then
    raise exception 'H024 cleanup post-precondition fejlet: reelle count = % (forventet 3)', v_remaining;
  end if;
  raise notice 'H024: pay_periods cleanup complete, reelle preserved = %', v_remaining;
end $$;
```

#### 5. `core_compliance.anonymization_state` (1 row clean-target)

```sql
do $$ declare v_count int; begin
  select count(*) into v_count from core_compliance.anonymization_state
  where anonymization_reason = 'C002 test: retention via cron';
  if v_count <> 1 then
    raise exception 'H024 cleanup precondition fejlet: anonymization_state C002-test count = % (forventet 1)', v_count;
  end if;
end $$;

alter table core_compliance.anonymization_state disable trigger anonymization_state_immutability;
delete from core_compliance.anonymization_state
where anonymization_reason = 'C002 test: retention via cron';
alter table core_compliance.anonymization_state enable trigger anonymization_state_immutability;
```

#### 6. `core_compliance.anonymization_strategies` (39 rows clean-target)

**Lifecycle-trigger:** DELETE blokeret for `status <> 'draft'`. Strategi: midlertidig disable + narrow DELETE + enable. Alternativ (status-rollback til draft) er mere kompleks pga. lifecycle-regression-blokering.

```sql
do $$ declare v_count int; begin
  select count(*) into v_count from core_compliance.anonymization_strategies
  where strategy_name = 'test5' or strategy_name like 'p1a_smoke_t5_%';
  if v_count < 39 then  -- 1 test5 + 38 p1a; tillad >= for nye p1a-runs mellem plan og migration
    raise exception 'H024 cleanup precondition fejlet: anonymization_strategies test-marker count = % (forventet >= 39)', v_count;
  end if;
end $$;

alter table core_compliance.anonymization_strategies disable trigger anonymization_strategies_delete_check;
delete from core_compliance.anonymization_strategies
where strategy_name = 'test5' or strategy_name like 'p1a_smoke_t5_%';
alter table core_compliance.anonymization_strategies enable trigger anonymization_strategies_delete_check;
```

#### 7. `core_identity.employees` (1 row clean-target: G017-test-employee)

```sql
do $$ declare v_count int; begin
  select count(*) into v_count from core_identity.employees
  where first_name = '[anonymized]' and last_name = '[anonymized]'
    and email like 'anon-%@anonymized.local'
    and termination_date = '2020-05-14';
  if v_count <> 1 then
    raise exception 'H024 cleanup precondition fejlet: G017 test-employee count = % (forventet 1)', v_count;
  end if;
end $$;

-- Ingen immutability-trigger på employees; lifecycle-trigger blokerer kun specific updates.
-- DELETE er tilladt for non-anonymized; for anonymized: tjek constraints.
delete from core_identity.employees
where first_name = '[anonymized]' and last_name = '[anonymized]'
  and email like 'anon-%@anonymized.local'
  and termination_date = '2020-05-14';
```

#### Migration-afslutning

```sql
-- Final summary NOTICE
do $$ begin
  raise notice 'H024 cleanup complete: ~382 rows DELETE''d på tværs af 7 tabeller. Reelle bevared: 3 pay_periods + 1 candidate_run + 0 cancellations.';
end $$;

commit;
```

### Step 2 — R3 + P1A tx-wrap + H022.1 rollback

- **Hvad:**
  - `supabase/tests/smoke/r3_commission_snapshots_immutability.sql`: wrap i `begin;` ... `rollback;`. Rul H022.1 random-offset tilbage til fixed dato `'2199-01-01'::date` (far-future, intet realistic konflikt; tx-rollback sikrer alligevel ingen persistens).
  - `supabase/tests/smoke/p1a_anonymization_strategies.sql`: wrap i `begin;` ... `rollback;`. T5-strategy-INSERT bevarer `extract(epoch)`-suffix (rollback gør det irrelevant, men ingen grund til kode-ændring).
- **Hvorfor:** Default mønster fra nu af. Tx-rollback sikrer at hver kørsel ikke efterlader artefakter.
- **Risiko:** Lav. Begge tests' assertions er lokale (raise på fejl) — observerbare inden rollback.
- **Hvorfor fixed `'2199-01-01'` og ikke pre-H022's `current_date + '5 years'`:** Pre-H022-værdien (~2031) konflikter med de stale rows der eksisterer indtil migration fra Step 1 applies til live DB. PR's egen CI-kørsel ville ramme konflikt før Mathias applies migration. Far-future fixed-dato kombineret med tx-rollback er stabilt og uden kollision uanset migration-state.

### Step 3 — Fitness-check `db-test-tx-wrap-on-immutable-insert`

- **Hvad:** Ny check i `scripts/fitness.mjs`. Liste over 9 immutability + lifecycle-DELETE-restricted tabeller (se Valg 3). Scope-bonus: `core_money.pay_periods` tilføjes til eksisterende `IMMUTABLE_TABLES_REQUIRE_TRUNCATE_BLOCK` (Codex sidefund #3).
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

### Step 6 — Dokumentations-opdateringer

- **Hvad:**
  - `docs/teknisk/teknisk-gaeld.md`: G017 markeret LØST i denne pakke (med commit-hash). G043 + G044 markeret LØST. G018 (bygge-status klassifikations-tal forkerte) IKKE i scope. Ny G-nummer for fitness-check Mønster D-udvidelse (RPC-side-effect-scan).
  - `docs/strategi/bygge-status.md`: H024-entry tilføjet med vision-tjek.
  - `docs/strategi/stork-2-0-master-plan.md`: rettelse-entry hvis fitness-check eller cleanup-pattern påvirker §3 CI-blocker-listen.

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

**Ingen ny smoke-test bygges.** Cleanup-migration verificerer sin egen effekt inline (pre/post-precondition-assertions med RAISE EXCEPTION + RAISE NOTICE row-counts). Fitness-check er det selv-testende lag for tx-wrap-disciplin.

---

## Risiko + kompensation

| Step                  | Værste-case                                                                    | Sandsynlighed                            | Rollback                                                                                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 (cleanup-migration) | Marker-pattern rammer ikke-test-row                                            | Lav (reduceret fra V1 "Mellem")          | Pre-precondition raiser hvis count afviger fra forventet; transaction-rollback rulles tilbage. Eksplicit marker-pattern + count-asserts er primær mitigation.                                                                         |
| 1 (cleanup-migration) | DISABLE TRIGGER glemmer at re-ENABLE                                           | Lav                                      | Migration kører i én transaktion; alt rolles tilbage hvis enable fejler.                                                                                                                                                              |
| 1 (cleanup-migration) | Krav-dok-kategoriserings-konflikt for G017 candidate_run ikke afklaret         | Mellem (afventer Mathias-bekræftelse)    | V2 dokumenterer åbent + foreslår tolkning (b). Hvis Mathias vælger alternativ tolkning: V3-justering.                                                                                                                                 |
| 2 (r3 tx-wrap)        | Fixed dato `'2199-01-01'` konflikter med fremtidig pay_periods                 | Negligibel                               | Tx-rollback gør INSERT non-persistent; konflikt ville kræve committed row med samme dato — ingen realistic scenario                                                                                                                   |
| 2 (p1a tx-wrap)       | T6-DELETE-forsøg på tested-strategy kunne ramme uventet rollback-state         | Negligibel                               | T6 catcher P0001 i `exception when` blok; rollback påvirker ikke flow                                                                                                                                                                 |
| 3 (fitness-check)     | Falsk-positiv blokerer eksisterende compliant test                             | Lav                                      | Allowlist-kommentar; check-eksklusion ved violation-fix                                                                                                                                                                               |
| 3 (fitness-check)     | Falsk-negativ — RPC-side-effect-test slipper igennem                           | Mellem (kendt afgrænsning)               | **Ny G-nummer:** fitness-check-Mønster D (RPC-side-effect-scan). Tx-rollback-disciplin gælder ALLE side-effect-tests; Mønster A fanger ikke alle. Konsekvens: Lag E-test-skrivnings-disciplin skal eksplicit guide RPC-test-mønstret. |
| 4 (G044-doc-fix)      | Doc-edit-konflikt                                                              | Negligibel                               | Fil-revert                                                                                                                                                                                                                            |
| 5 (Node 24)           | Subtil runtime-regression i scripts/fitness.mjs eller scripts/run-db-tests.mjs | Lav (afdækning fandt 0 breaking changes) | Revert Node-bump-commit; CI på 22 indtil dependency reflag'es                                                                                                                                                                         |
| 5 (Node 24)           | pnpm 10 + Node 24 install-friktion                                             | Lav                                      | Bumping pnpm hvis kompatibilitet kræver det; ikke planlagt nu                                                                                                                                                                         |
| 6 (doc-opdateringer)  | Inkonsistens mellem teknisk-gaeld + master-plan                                | Lav                                      | Doc-revert; grep-tjek listed i Oprydnings-strategi                                                                                                                                                                                    |

**Kompensation (samlet):** Hvis hele pakken fejler under build: tilbageroll PR. Cleanup-migration's effekt PÅ live DB (efter Mathias applies) kan ikke rolles tilbage uden specifik recovery — men det er pre-cutover og test-data, så praktisk konsekvens er nul. **Audit-spor for snapshots-cleanup er begrænset til migration-fil + commit-hash + NOTICE-counts** (commission_snapshots er audit-exempt post-R3); forensics-mulighed for snapshots-cleanup er derfor migration-level, ikke row-level audit_log.

---

## Oprydnings- og opdaterings-strategi

**Filer der skal flyttes til arkiv** (efter pakken er merget):

- `docs/coordination/H024-krav-og-data.md` → `docs/coordination/arkiv/`
- `docs/coordination/H024-plan.md` → `docs/coordination/arkiv/`
- Alle `docs/coordination/plan-feedback/H024-*.md` → `docs/coordination/arkiv/`
- `docs/coordination/codex-reviews/2026-05-16-h024-runde-1.md` → bevares i `codex-reviews/`-mappen (anden konvention end plan-feedback)
- `docs/coordination/afdaekning/g043-g044-data-code-2026-05-16.md` — bringes på main som del af build-PR, arkiveres som del af pakken
- `docs/coordination/afdaekning/g043-g044-data-codex-2026-05-16.md` — som ovenfor

**Note om afdæknings-filer (scope-bonus):** Disse er aktuelt ikke-merged til main (Code's er på lokal afdæknings-branch; Codex's er untracked). Plan-fasen-konsekvens: build-PR'en bringer dem på main som referenced data-grundlag i samme commit som krav-dok arkiveres. Begrundelse: krav-dok refererer dem som autoritativt data-grundlag — de skal være tilgængelige på main for historisk auditability efter pakken er afsluttet.

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

- **Princip 6 (audit på alt der ændrer data):** Bevaret med nuance. AFTER-audit-trigger på pay_periods fyrer på DELETE — audit-spor bevares for pay_periods-cleanup. Commission_snapshots er audit-exempt post-R3 (bevidst design); cleanup af snapshots har audit-spor via migration-fil + commit-hash + NOTICE-counts. Salary_corrections, cancellations, anonymization_state har AFTER INSERT-trigger men ikke DELETE; cleanup-audit-spor er migration-baseret. Acceptabelt pre-cutover; udfordringen rammer ikke produktion-data-cleanup post-cutover (som hører GDPR-vejen).
- **Princip 9 (status-modeller bevarer historik):** Bevaret pragmatisk. DISABLE TRIGGER er one-shot pre-cutover; fitness-check sikrer fremtidig tx-rollback-disciplin. Pattern etableres IKKE som vedvarende.
- **Princip 5 (lifecycle for konfiguration):** Uændret. Lifecycle-trigger på anonymization_strategies/mappings/break_glass_operation_types bevares; cleanup respekterer status-progression eller bruger DISABLE TRIGGER-mønster.
- **"Greenfield ikke 1.0-antimønstre":** Styrket. H022.1 random-offset (workaround) rulles tilbage til arkitektur-løsning (tx-rollback + fitness-check).

**Master-plan:**

- §1.6 (snapshot-immutability): Uændret. Conditional immutability på commission_snapshots forbliver intakt; tests bypass via tx-rollback (rolls back før commit), ikke via trigger-modifikation. Cleanup-migration's DISABLE TRIGGER er one-shot pre-cutover.
- §3 (CI-blockers): Udvides med `db-test-tx-wrap-on-immutable-insert`-check. Rettelse-entry tilføjes i Appendix C.
- §1.4 (anonymisering bevarer audit): Bekræftet rolle. GDPR-retroactive-vej forbliver eneste exception-vej til audit_log-immutability. H024's DISABLE TRIGGER-pattern er one-shot for andre tabeller, ikke audit_log.

**Disciplin-pakke** (jf. `docs/strategi/arbejds-disciplin.md`):

- Formåls-immutabilitet: respekteres. Tekniske valg afgøres af Code; formålet (krav-dok §Formål) er låst.
- Plan-leverance er kontrakt: respekteres. Mathias' 6 afgørelser implementeres 1:1. Krav-dok-kategoriserings-konflikt (G017 candidate_run) flagges åbent, ikke implicit løst.
- Krav-dokument-disciplin: respekteres. Valg 2's nomenklatur rettet til "D" for ærlighed. Mathias-godkendelse-forudsætning eksplicit angivet for DISABLE TRIGGER-pattern.
- Defensiv minimal-diff over teknisk korrekthed = anti-pattern: H022.1's random-offset rulles tilbage til arkitektur-fix; far-future fixed-dato (`'2199-01-01'`) valgt frem for pre-H022's `'5 years'`-værdi der ville konflikte med stale rows pre-migration-apply.

---

## Konklusion

Planen V2 adresserer alle fund fra runde 1:

- Codex KRITISK: cleanup-migration har nu marker-based DELETE pr. tabel med pre/post-precondition-assertions. 5 reelle rows eksplicit bevares.
- Codex MELLEM: audit-spor-tekst rettet — commission_snapshots er audit-exempt post-R3; cleanup-audit-spor = migration-fil + commit-hash + NOTICE.
- Claude.ai MELLEM: Valg 2 omdøbt til "D (andet, DISABLE TRIGGER-variant)". Mathias-godkendelse-forudsætning eksplicit.
- Claude.ai KOSMETISK ×2: pay_periods TRUNCATE-tilføjelse + afdæknings-fil-import markeret som scope-rydning-bonuser (acceptable per reviewer).

Plus en åben afklaring til Mathias om krav-dok-kategoriserings-konflikt for G017 candidate_run (`724c73cb`).

Højeste risiko (kendt afgrænsning): fitness-check Mønster A's falsk-negativ for RPC-side-effects. Mitigeret via G-nummer + dokumenteret afgrænsning. Acceptabelt for v1.

**FORUDSÆTNING FOR BUILD:** Mathias-godkendelse på DISABLE TRIGGER-pattern (Valg 2 — D) som one-shot pre-cutover-mekanisme.

Klar til Codex- og Claude.ai-review-runde 2.
