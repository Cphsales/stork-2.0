# G043+G044 — Afdækningsdata (Code, 2026-05-16)

**Branch:** `claude/g043-g044-afdaekning-code`
**Type:** Pure afdækning. Ingen plan, ingen anbefaling, ingen patches.

## Opsummering — fund pr. sektion

| #   | Spørgsmål                               | Fund                                                                                                                                                                                   |
| --- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Tabeller med immutability/lock-trigger  | 6 unik-tabeller (+ 4 audit_log-partitioner) + 3 lifecycle-DELETE-begrænsede                                                                                                            |
| 2   | DB-tests der INSERT'er i disse tabeller | 7 tests (6 direkte + 1 via RPC)                                                                                                                                                        |
| 3   | Tests i transaktion (BEGIN/ROLLBACK)    | 5/7 tx-wrappede, 2/7 IKKE wrappede                                                                                                                                                     |
| 4   | Test-artefakter i prod-DB lige nu       | 31 pay_periods + 286 commission_snapshots + 28 candidate_runs + 1 salary_correction + 1 anonymization_state + 39 anonymization_strategies + 1 anonymized employee + 162 audit_log-rows |
| 5   | H022.1 random-offset scope              | 1 fil ændret: `supabase/tests/smoke/r3_commission_snapshots_immutability.sql`                                                                                                          |
| 6   | Rollback-feasibility pr. test           | Alle 7 tests: trivielt rollback-bart (ingen barrierer)                                                                                                                                 |
| 7   | Fitness-check mulighed                  | 3 detektionsmønstre identificeret (A regex, B AST, C live-recon)                                                                                                                       |

---

## Spørgsmål 1 — Komplet liste over tabeller med immutability-trigger

Kilde: `pg_trigger + pg_proc`, filter BEFORE UPDATE/DELETE, function-body indeholder `RAISE EXCEPTION` ubetinget eller lock-and-delete-mønster.

### Strict immutability (RAISE'r ubetinget)

| schema.tabel                          | trigger                            | blokerer        | exception-vej                                              |
| ------------------------------------- | ---------------------------------- | --------------- | ---------------------------------------------------------- |
| `core_compliance.anonymization_state` | `anonymization_state_immutability` | UPDATE + DELETE | Ingen — `RAISE` uden betingelse                            |
| `core_compliance.audit_log`           | `audit_log_immutability`           | UPDATE + DELETE | `current_setting('stork.gdpr_retroactive', true) = 'true'` |
| `core_compliance.audit_log_2026_05`   | `audit_log_immutability`           | UPDATE + DELETE | Som ovenfor (samme function)                               |
| `core_compliance.audit_log_2026_06`   | `audit_log_immutability`           | UPDATE + DELETE | Som ovenfor                                                |
| `core_compliance.audit_log_2026_07`   | `audit_log_immutability`           | UPDATE + DELETE | Som ovenfor                                                |
| `core_compliance.audit_log_default`   | `audit_log_immutability`           | UPDATE + DELETE | Som ovenfor                                                |
| `core_money.cancellations`            | `cancellations_immutability`       | UPDATE + DELETE | Ingen — `RAISE` uden betingelse                            |
| `core_money.salary_corrections`       | `salary_corrections_immutability`  | UPDATE + DELETE | Ingen — `RAISE` uden betingelse                            |

### Lock-and-delete-mønster (conditional immutability)

| schema.tabel                      | trigger                             | blokerer                                                                                | exception-vej                                                                                                       |
| --------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `core_money.commission_snapshots` | `commission_snapshots_immutability` | DELETE for `is_candidate=false`; UPDATE for andet end `is_candidate`/`candidate_run_id` | `is_candidate=true` rows kan DELETE'es; flag-kolonner kan UPDATE'es                                                 |
| `core_money.pay_periods`          | `pay_periods_lock_and_delete_check` | DELETE altid; UPDATE af locked-state                                                    | `stork.allow_pay_period_unlock_break_glass='true'` tillader open-overgang; ikke-locked rækker kan UPDATE'es normalt |

### Lifecycle-trigger (DELETE-begrænset til status='draft')

Disse er IKKE pure immutability men begrænser DELETE strukturelt. Inkluderet fordi de blokerer test-cleanup på samme måde.

| schema.tabel                                  | trigger                                    | blokerer                       | exception-vej                                                     |
| --------------------------------------------- | ------------------------------------------ | ------------------------------ | ----------------------------------------------------------------- |
| `core_compliance.anonymization_mappings`      | `anonymization_mappings_delete_check`      | DELETE for `status <> 'draft'` | Skift status til draft (men status='active' kan ikke deaktiveres) |
| `core_compliance.anonymization_strategies`    | `anonymization_strategies_delete_check`    | DELETE for `status <> 'draft'` | Som ovenfor                                                       |
| `core_compliance.break_glass_operation_types` | `break_glass_operation_types_delete_check` | DELETE for `status <> 'draft'` | Som ovenfor                                                       |

---

## Spørgsmål 2 — DB-tests der INSERT'er i tabeller fra liste #1

Scan: `grep -rEi 'insert\s+into\s+(core_money|core_compliance)' supabase/tests/`. Scripts/-mappe scannet — ingen INSERTs udenfor migrations.

| fil-sti                                                         | mål-tabel                                                                                      | insert-mønster                                                               | sidst ændret af                       |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------- |
| `supabase/tests/smoke/r3_commission_snapshots_immutability.sql` | `core_money.pay_periods` (l.40)                                                                | random-offset (`current_date + 10y + random*3650d`)                          | H022.1 (commit `5a57d33`)             |
| `supabase/tests/smoke/r3_commission_snapshots_immutability.sql` | `core_money.commission_snapshots` (l.50, l.79)                                                 | afhænger af pay_periods-INSERT ovenfor                                       | H022.1                                |
| `supabase/tests/smoke/r3_commission_snapshots_immutability.sql` | `core_money.pay_period_candidate_runs` (l.45)                                                  | afhænger af pay_periods-INSERT                                               | H022.1                                |
| `supabase/tests/smoke/r7a_break_glass_execute_e2e.sql`          | `core_money.pay_periods` (l.51)                                                                | random-offset (`current_date + 200 + random*9000`) m. retry-loop ved overlap | R7h (commit `04482b9` / `9088610`)    |
| `supabase/tests/smoke/r7a_replay_anonymization_e2e.sql`         | `core_compliance.anonymization_state` (l.50) direkte + `core_identity.employees` indirekte     | `gen_random_uuid()`-baseret email                                            | R7h                                   |
| `supabase/tests/smoke/p1a_anonymization_strategies.sql`         | `core_compliance.anonymization_strategies` (l.18, 25, 32, 39, 44)                              | fixed strategy_names + `extract(epoch)`-suffix for T5                        | P0+P1a (commit `945ac58` / `7601e19`) |
| `supabase/tests/smoke/r7a_anonymize_generic_apply_e2e.sql`      | `core_compliance.anonymization_state` **indirekte** via `core_identity.anonymize_employee` RPC | RPC genererer state-row                                                      | R7h                                   |
| `supabase/tests/smoke/r7a_retention_cleanup_cron_e2e.sql`       | `core_compliance.anonymization_state` **indirekte** via cron-body execute                      | cron-body INSERT'er state-row efter anonymize                                | R7h + T1                              |

Note: `supabase/tests/classification/02_retention_value_consistency.sql` INSERT'er i `core_compliance.data_field_definitions` — IKKE en tabel fra liste #1 (ingen immutability-trigger). Inkluderes ikke i pakke-scope, men nævnt for fuldstændighed.

---

## Spørgsmål 3 — Pr. test: kører den i transaktion?

Konvention dokumenteret i `supabase/tests/README.md`: "Filer med side-effekter (employees, audit-rows) bruger BEGIN/ROLLBACK". `scripts/run-db-tests.mjs` sender hver fil som én query via Supabase Management API — eksplicit BEGIN/ROLLBACK i fil-indhold er bærende mekanisme.

| fil                                        | tx-wrap                                                    | barriere hvis nej                                                       |
| ------------------------------------------ | ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| `r3_commission_snapshots_immutability.sql` | **NEJ** — pure `do $test$ ... $test$;` uden begin/rollback | Ikke teknisk barriere; aldrig bygget. Test er kronisk source af G043    |
| `p1a_anonymization_strategies.sql`         | **NEJ** — pure DO-block                                    | Aldrig bygget; producerer permanent drift på `anonymization_strategies` |
| `r7a_break_glass_execute_e2e.sql`          | JA (l.14 `begin;` + l.89 `rollback;`)                      | —                                                                       |
| `r7a_replay_anonymization_e2e.sql`         | JA (l.12 + l.85)                                           | —                                                                       |
| `r7a_anonymize_generic_apply_e2e.sql`      | JA (l.17 + l.83)                                           | —                                                                       |
| `r7a_retention_cleanup_cron_e2e.sql`       | JA (l.15 + l.74)                                           | —                                                                       |
| `02_retention_value_consistency.sql`       | JA (l.6 + l.54)                                            | —                                                                       |

Andre tests der UPDATE'er lifecycle-tabeller (ikke INSERT, men relevant for cleanup-disciplin):

- `negative/r7d_mapping_legacy_status_active_required.sql` — tx-wrap JA
- `negative/r7d_op_type_legacy_status_active_required.sql` — tx-wrap JA

---

## Spørgsmål 4 — Test-artefakter i prod-DB lige nu

Query-tidspunkt: 2026-05-16 ~15:30 UTC. Snapshot.

### `core_money.pay_periods` (31 rows total)

| markør                                        | antal | beskrivelse                                                                                                                                            |
| --------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| G017 syntetisk locked (2020-01-15→2020-02-14) | 1     | row_id `8e2740b3-...`, locked=true, locked_by=NULL — fra trin 4 verifikation                                                                           |
| Tidlig test-checksum (2025-12-01→2025-12-31)  | 1     | row_id `c563d76e-...`, status=open, paret med data_checksum='test-checksum'                                                                            |
| "Reelle" perioder (2026-04..07)               | 3     | row_ids `f4c86616/c2bebd70/d0724720` — formentlig fra cron-precompute eller første migrations-runs                                                     |
| R3-smoke stale (2031-2046)                    | 26    | start_date > 2031, alle status=open. Datafarver matcher random-offset-pattern (H022.1: range 2036-2046) og fixed-shift (H022: 2032) og pre-H022 (2031) |

Alle 31 er affected af `pay_periods_lock_and_delete_check` (DELETE altid blokeret).

### `core_money.commission_snapshots` (286 rows)

- candidate_rows = 0, locked_rows = 286
- distinct_periods = 27 (matcher 25 R3-smoke + 2 ældre)
- Alle er locked → `commission_snapshots_immutability` blokerer DELETE
- Hver R3-kørsel INSERT'er 2 snapshots og UPDATE'er ene til is_candidate=false → ~10 rows pr. kørsel × 25 = stemmer

### `core_money.pay_period_candidate_runs` (28 rows)

| markør                | antal |
| --------------------- | ----- |
| `r3-smoke-checksum`   | 25    |
| `test-checksum`       | 1     |
| Reelle hash-checksums | 2     |

(IKKE i liste #1 — ingen immutability-trigger, men FK'er holder dem fast hvis parent-pay_period ikke kan slettes.)

### `core_money.salary_corrections` (1 row)

| row_id         | description  | amount  | reason       | created_at          |
| -------------- | ------------ | ------- | ------------ | ------------------- |
| `28b3d646-...` | "smoke test" | -100.00 | cancellation | 2026-05-14 13:22:52 |

Affected af `salary_corrections_immutability` (ubetinget UPDATE+DELETE block). Berørt: G017 oprindelig fund.

### `core_compliance.anonymization_state` (1 row)

| entity                                              | reason                          | anonymized_at       |
| --------------------------------------------------- | ------------------------------- | ------------------- |
| employee `99b691fa-...` i `core_identity.employees` | "C002 test: retention via cron" | 2026-05-14 15:08:43 |

Affected af `anonymization_state_immutability` (ubetinget RAISE). G017 udvidet — ikke nævnt i original G017.

### `core_compliance.anonymization_strategies` (test-artefakter)

39 stale rows, alle status='tested', alle DELETE-blokerede:

- 1 × `test5` (status=tested, fra 2026-05-14)
- 38 × `p1a_smoke_t5_<epoch>` rows fra hver p1a-kørsel (2026-05-15 og 2026-05-16)

p1a's T5-test bruger `extract(epoch)`-suffix → hver kørsel skaber unik strategy_name, men status='tested' efter T5 → DELETE blokeret af lifecycle-trigger.

### `core_identity.employees` (test-employee)

1 row markeret anonymized: `99b691fa-...`, first_name=`[anonymized]`, termination_date=2020-05-14, anonymized_at=2026-05-14. Parret med anonymization_state-rækken ovenfor.

### `core_money.cancellations`

0 rows.

### `core_compliance.audit_log` (test-markerede entries)

964 rows total, 162 (≈17%) har change_reason der lugter af test:

| change_reason                                                                                     | rows |
| ------------------------------------------------------------------------------------------------- | ---- |
| `P1a smoke`                                                                                       | 76   |
| `R3 smoke setup`                                                                                  | 52   |
| `P1a: klassifikation af anonymization_strategies kolonner`                                        | 10   |
| `smoke test: consecutive_failure_count`                                                           | 6    |
| Andre (`C001/C002/C003/C005 positive test`, `smoke test: salary_corrections immutability`, m.fl.) | 18   |

P1a smoke (76 rows) og R3 smoke (52 rows) er størst — begge fra de to ikke-tx-wrappede tests. Audit_log immutable → kan ikke DELETE'es (kun via `stork.gdpr_retroactive='true'`).

---

## Spørgsmål 5 — H022.1 random-offset scope og ændringer

H022 + H022.1 ændrer ÉN fil i repoet. Andre random-dato-patterns (fx `r7a_break_glass_execute_e2e.sql:39`) er pre-eksisterende og ikke ændret af H022/H022.1.

### Fil: `supabase/tests/smoke/r3_commission_snapshots_immutability.sql`

| commit             | linje før                                                                                             | linje efter                                                                                                                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `3ff21f8` (H022)   | l.32: `values (current_date + interval '5 years', current_date + interval '5 years 30 days', 'open')` | l.32: `values (current_date + interval '6 years 6 months', current_date + interval '6 years 6 months 30 days', 'open')`                                                                             |
| `5a57d33` (H022.1) | (efter H022's fixed-shift)                                                                            | l.35-38: `v_start_date := (current_date + interval '10 years' + ((random() * 3650)::int * interval '1 day'))::date;` + linje 40-42 omskrevet til `values (v_start_date, v_start_date + 30, 'open')` |

Konkret diff-stats: H022 = 6 indsatte / 0 slettede; H022.1 = 15 indsatte / 6 slettede.

Begge commits opdaterede også `docs/teknisk/teknisk-gaeld.md` G043-entry med noter.

### Andre filer ikke ændret af H022 / H022.1

Bekræftet via `git log --pretty -- <fil>`:

- `r7a_break_glass_execute_e2e.sql` — random-dato pattern `current_date + (200 + random()*9000)` blev introduceret i R7h (commit `04482b9`), IKKE af H022/H022.1
- Ingen andre tests ramt

---

## Spørgsmål 6 — Rollback-feasibility pr. test

Sub-spørgsmål: ville `BEGIN ... ROLLBACK` wrap virke uden andre ændringer?

Først verificeret strukturelt: ingen af mål-tabellerne har AFTER-triggers der calls `pg_notify`, `dblink`, eller anden ikke-transaktional side-effect. AFTER-INSERT-triggers er udelukkende `stork_audit` (skriver til audit_log — rolls back med tx).

Cron-triggers er pg_cron-scheduled jobs (`cron.schedule(...)`), ikke row-level triggers. INSERT i pay_periods/commission_snapshots fyrer ingen cron.

Alle tests bruger `set_config(..., true)` (tx-scope, ikke session-scope) — session-vars rolls back automatisk.

| test                                       | rollback-feasibility                                                                                                                                                         | hvad bryder                                                            |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `r3_commission_snapshots_immutability.sql` | TRIVIELT                                                                                                                                                                     | Intet. INSERT + flag-UPDATE + assertion → alle DML er transaktionelle  |
| `p1a_anonymization_strategies.sql`         | TRIVIELT                                                                                                                                                                     | Intet. Ren INSERT + UPDATE + DELETE-forsøg (caught) på lifecycle-tabel |
| `r7a_break_glass_execute_e2e.sql`          | ALLEREDE WRAP'ED                                                                                                                                                             | —                                                                      |
| `r7a_replay_anonymization_e2e.sql`         | ALLEREDE WRAP'ED                                                                                                                                                             | —                                                                      |
| `r7a_anonymize_generic_apply_e2e.sql`      | ALLEREDE WRAP'ED                                                                                                                                                             | —                                                                      |
| `r7a_retention_cleanup_cron_e2e.sql`       | ALLEREDE WRAP'ED. Note: kalder `execute v_cron_command` for at eksekvere cron-body i process. Cron-bodyen selv er service_role-RPC der INSERT'er i state — rolls back med tx | —                                                                      |
| `02_retention_value_consistency.sql`       | ALLEREDE WRAP'ED                                                                                                                                                             | —                                                                      |

Subtilitet: cron-body-eksekution (test 4) kalder RPC der internt bruger `core_compliance.anonymize_employee_internal(...)`. Den RPC er SECURITY DEFINER og INSERT'er state-row inde i den ydre tx → rolls back.

Ingen kendte barrierer på tværs af alle 7 tests.

---

## Spørgsmål 7 — Fitness-check muligheder

Fitness-suite ligger i `scripts/fitness.mjs` (15+ checks pt., bl.a. `truncate-blocked-on-immutable`, `audit-trigger-coverage`, `write-policy-session-var-consistency`, `legacy-is-active-readers`).

### Mønster A — Regex-baseret: test-fil uden tx-wrap der INSERT'er i immutable-tabel

```
For hver fil i supabase/tests/**/*.sql:
  hvis fil indeholder INSERT INTO {immutable_tables_list}:
    hvis fil IKKE indeholder ^begin; .* ^rollback;:
      violation
```

| Aspekt                       | Vurdering                                                                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Falsk-positiv-risiko         | LAV. Mønstret er specifikt. Eneste edge-case: tests der INSERT'er men intent er at lade dem persistere (bootstrap-tests) — ingen sådan i nuværende repo            |
| Falsk-negativ-risiko         | MELLEM. Fanger ikke indirekte INSERTs via RPC (`perform core_identity.anonymize_employee(...)` → state-INSERT). Skal kombineres med RPC-allowlist for fuld dækning |
| Implementations-kompleksitet | LAV. ~30 linjer JavaScript, samme stil som eksisterende `migration-set-config-discipline`-check                                                                    |

### Mønster B — AST/PG-parser-baseret: dynamisk SQL detection

Parse hver test-fil med `pg-query-emscripten` eller lign. Følg call-graph for `perform <rpc>` til pg_proc-definition.

| Aspekt                       | Vurdering                                                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Falsk-positiv-risiko         | LAV                                                                                                        |
| Falsk-negativ-risiko         | LAV                                                                                                        |
| Implementations-kompleksitet | HØJ. PG-parser-dependency + recursion gennem RPC-bodies + håndtering af `execute format(...)`-dynamisk SQL |

### Mønster C — Live recon: post-test-suite-snapshot diff

Før test-suite kører: snapshot `count(*)` for hver immutable-tabel. Efter test-suite: re-snapshot. Diff > 0 → violation.

| Aspekt                       | Vurdering                                                                                                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Falsk-positiv-risiko         | MELLEM. Reel migrations-INSERTs (fx ny audit-row pr. periode-precompute-cron) kan ramme ind hvis CI kører overlap med cron. Kan mitigeres med excluded change_reason-pattern |
| Falsk-negativ-risiko         | LAV. Fanger faktiske artefakter uanset hvordan de er skabt                                                                                                                   |
| Implementations-kompleksitet | MELLEM. Kræver baseline-snapshot mekanisme + CI-integration der kan håle DB-state pre/post                                                                                   |

### Anti-mønster — fixed-date detection (har ikke værdi)

Detektér `current_date + interval '<N> years'` med fixed N. Fanger H022 men IKKE H022.1's random-offset (som bevarer non-idempotens-problem på lang sigt). Vil generere falsk-positiv på `pay_period_settings.recommended_lock_date`-style fixed-future-konfig. Ikke anbefalet som primær check.

---

## Sidefund (maks 5)

1. **`r4_salary_corrections_cleanup` eksisterer ikke som test-fil.** G044-entry i `docs/teknisk/teknisk-gaeld.md` nævner det som "berørt test", men commit-message for R4 (`484c134`) er compute-cleanup (dead-code fjernet), ikke en test. Eneste test der rører salary_corrections er den enkelte smoke-row i prod-DB (G017).

2. **p1a-test efterlader 38 stale anonymization_strategies pr. CI-kørsel.** Hver T5-blok INSERT'er en strategy med `extract(epoch)`-suffix og avancerer den til `status='tested'`. Lifecycle-trigger blokerer DELETE for ikke-draft → permanent drift. Samme rod-årsag som G043 men på lifecycle-tabel (ikke immutability-tabel). Ikke nævnt i G043/G044.

3. **162 audit_log-rows er permanent test-drift.** Alle p1a+r3-kørsler genererer audit-entries (via AFTER INSERT/UPDATE stork_audit-trigger). Audit_log er immutable → DELETE blokeret undtagen via `stork.gdpr_retroactive='true'`. Tx-wrap af r3/p1a vil rulle disse tilbage fremover, men eksisterende 162 rows kræver bevidst cleanup-vej.

4. **`pay_period_candidate_runs` har ingen immutability-trigger, men er forankret via FK til pay_periods.** 25 stale `r3-smoke-checksum`-rows kan teknisk DELETE'es direkte, men deres parent-pay_period kan ikke. I praksis bør de DELETE'es FØR pay_periods-cleanup hvis nogen break-glass-vej etableres.

5. **`r7a_break_glass_execute_e2e.sql:39` bruger random-offset-mønster fra før H022.1.** Pattern er `current_date + (200 + random()*9000)` (~25-årig range starter i dag). Lavere kollisionsrisiko end H022.1's pattern (3650 spread), men bruger ikke samme variabel-tilgang (genererer to forskellige random()-kald implicit). Testen er tx-wrappet, så ingen umiddelbar prod-DB-skade — men inkonsistent random-offset-stil mellem tests er mindre code-smell.

---

## Spørgsmål 8 — Node 22 → Node 24 opgradering — konkret omfang

### 8a — Alle steder Node-version er låst

Repo-scan via `grep -rEni "node[\s_-]*(22|24)|engines.*node|nvm install"` + manuel verifikation af kendte konvention-filer.

| fil:linje                     | nuværende værdi                                                             | bør ændres til                                                             |
| ----------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `package.json:7`              | `"node": ">=22.11.0 <23"` (engines)                                         | `">=24.0.0 <25"` (eller relevant Node 24-range)                            |
| `apps/web/package.json:73`    | `"@types/node": "^22.16.5"`                                                 | `"@types/node": "^24.x.x"` (types bør følge runtime)                       |
| `.nvmrc:1`                    | `22`                                                                        | `24`                                                                       |
| `.tool-versions:1`            | `nodejs 22.11.0`                                                            | `nodejs 24.x.x` (asdf/mise)                                                |
| `README.md:26`                | Tabel-row: `Node \| 22 LTS \| .nvmrc, .tool-versions, package.json#engines` | `24 LTS`                                                                   |
| `README.md:38`                | Kommentar `nvm install # læser .nvmrc → 22`                                 | `→ 24`                                                                     |
| `.github/workflows/ci.yml:34` | `node-version-file: .nvmrc`                                                 | INGEN ÆNDRING — peger allerede på .nvmrc; ændring af .nvmrc forplanter sig |

**Ikke fundet i repo (afkræftede falsk-positive kandidater):**

- `.github/workflows/codex-notify.yml` — ingen Node-version, bruger kun `gh` CLI
- `apps/web/package.json` — kun `@types/node` (ovenfor); ingen særskilt engines-felt
- `packages/*/package.json` — ingen indeholder engines- eller node-felt
- `Dockerfile`, `vercel.json`, `netlify.toml` — findes ikke i repo
- `supabase/functions/` — mappe eksisterer ikke (jf. 8c)
- `supabase/config.toml` — bruger kun `deno_version = 2` (Edge runtime)
- `pnpm-lock.yaml` — engines-felter pr. dep, ikke en lock på repo-Node
- `docs/strategi/stork-2-0-master-plan.md` — ingen forekomst af `Node 22` / `22.11` (verificeret via grep)

Note om master-plan: opgaven antydede en linje om "Node 22.11" i master-plan, men grep mod `docs/` finder ingen sådan reference. Hvis Mathias har en kilde der peger på master-planen, bør den linje verificeres manuelt — denne afdækning fandt ingen.

### 8b — Dependency-kompatibilitet med Node 24

Engines-felter hentet fra `pnpm-lock.yaml` for hver kandidat-dep. Lock-version i `()` hvor den afviger fra package.json-range.

| pakke               | nuværende version (lock)                | engines.node                                  | Node 24-risiko                                      |
| ------------------- | --------------------------------------- | --------------------------------------------- | --------------------------------------------------- |
| `vite`              | 5.4.21                                  | `^18.0.0 \|\| >=20.0.0`                       | KOMPATIBEL                                          |
| `vitest`            | 3.2.4                                   | `^18.0.0 \|\| ^20.0.0 \|\| >=22.0.0`          | KOMPATIBEL                                          |
| `turbo`             | 2.9.12                                  | (ingen engines — Go binary med Node-wrapper)  | KOMPATIBEL                                          |
| `prettier`          | 3.8.3                                   | `>=14`                                        | KOMPATIBEL                                          |
| `husky`             | 9.1.7                                   | `>=18`                                        | KOMPATIBEL                                          |
| `lint-staged`       | 15.5.2                                  | `>=18.12.0`                                   | KOMPATIBEL                                          |
| `typescript`        | 5.9.3                                   | `>=14.17`                                     | KOMPATIBEL                                          |
| `eslint`            | 9.39.4                                  | `^18.18.0 \|\| ^20.9.0 \|\| >=21.1.0`         | KOMPATIBEL                                          |
| `supabase`          | 2.98.2                                  | `{npm: '>=8'}` (ingen node-engine; Go binary) | KOMPATIBEL                                          |
| `jsdom`             | 20.0.3                                  | `>=14`                                        | KOMPATIBEL (men v20 er gammel; current er 25+)      |
| `@swc/core`         | (via @vitejs/plugin-react-swc)          | prebuilt napi-binaries; supports Node 18+     | KOMPATIBEL                                          |
| `esbuild`           | (transitivt via vite)                   | platform-binaries; node-agnostic              | KOMPATIBEL                                          |
| `typescript-eslint` | 8.59.2                                  | `^18.18.0 \|\| ^20.9.0 \|\| >=21.1.0`         | KOMPATIBEL                                          |
| `@types/node`       | 22.19.18 (apps/web), 22.16.5 (declared) | (kun type-pakke)                              | KRÆVER-OPGRADERING (bump til ^24 for type-accuracy) |
| `pnpm`              | 10.33.0 (packageManager-felt)           | pnpm 10 supports Node 18+                     | KOMPATIBEL                                          |

Ingen dependency blokerer Node 24. `@types/node@22.x` bør bumpes i lockstep — ellers refererer DefinitelyTyped Node-API'er der ikke matcher faktisk runtime (cosmetic, men `dev-disciplin`-spørgsmål).

`.npmrc:1` har `engine-strict=true` → pnpm afviser install hvis package.json#engines og runtime divergerer. Det er sikkerhedsnet, men betyder at hver workspace-developer skal opgradere runtime før første install efter bump.

### 8c — Supabase Edge Functions Node-lock

Konkrete fund:

1. `supabase/functions/` — **mappen findes ikke** i repo. Ingen Edge Functions deployet eller versioneret.
2. `supabase/config.toml:369-378` — `[edge_runtime]` sektion med `deno_version = 2`. Edge Functions kører på Deno, ikke Node.
3. Repo-Node-version påvirker IKKE Edge Functions-deploy. Selv hvis der senere tilføjes funktioner, kører de i Supabase's Deno-runtime — Node-skift har ingen effekt der.

Falsk-positiv risiko afkræftet: Node-opgradering rammer ikke Edge Functions.

### 8d — CI-cache-invalidation ved Node-skift

`actions/setup-node@v4` (`.github/workflows/ci.yml:32-35`) bruger `node-version-file: .nvmrc` og `cache: pnpm`. Cache-keyen indeholder Node-major-version + pnpm-lockfile-hash.

Adfærd ved bump:

- `.nvmrc: 22` → `24` ændrer cache-keyens Node-segment → første CI-kørsel post-bump kan ikke restore tidligere pnpm-store → genaktualiserer alle deps.
- Forventet langsommere første kørsel (~1-2 minutters ekstra install-tid baseret på typiske pnpm-install-baseline for monorepos af denne størrelse).
- Efterfølgende kørsler returnerer til normal cache-restore-hastighed.
- Ingen kode-eller-konfig-tilretning kræves utover .nvmrc-bumpet. Cache-kollisioner mellem main og PR-branches på samme Node-version er upåvirket.

Bekræftet adfærd, ikke noget der kræver mitigation — men værd at flage at første post-bump-kørsel ikke er en regression hvis den varer længere.

### 8e — Node 22 → Node 24 breaking changes relevante for repo

Scan: `grep -rEn` mod `apps/`, `packages/`, `scripts/` for kendte Node 22→24-deprecation-/removal-pattern. 74 JS/TS/TSX-filer scannet.

| breaking change kategori                                         | repo-forekomst                                           |
| ---------------------------------------------------------------- | -------------------------------------------------------- |
| `url.parse()` deprecated/fjernet                                 | INGEN forekomst                                          |
| `punycode`-modul fjernet fra core                                | INGEN forekomst                                          |
| `fs.exists()` (deprecated)                                       | INGEN forekomst                                          |
| `crypto.createCipher()` (fjernet i 22, så bagudkompat)           | INGEN forekomst                                          |
| `new Buffer(N)` constructor                                      | INGEN forekomst                                          |
| `process.binding(...)` (intern)                                  | INGEN forekomst                                          |
| `domain`-modul                                                   | INGEN forekomst                                          |
| `--openssl-legacy-provider` flag-afhængighed                     | INGEN forekomst                                          |
| `--experimental-*` flag-afhængighed                              | INGEN forekomst                                          |
| CommonJS-rester (`.cjs` filer eller `require()`-syntax i source) | INGEN forekomst — alt source er ESM (`"type": "module"`) |
| `String.prototype.substr` (deprecated, ikke fjernet)             | INGEN forekomst                                          |

Scripts (`scripts/*.mjs`) bruger udelukkende:

- `import { ... } from "node:fs/promises"` — stabil API
- `import { join, relative } from "node:path"` — stabil API
- `process.cwd()`, `process.env`, `process.argv`, `process.exit()` — stabil API
- Native `fetch()` (Node 18+) — stabil
- `JSON.parse/stringify`, async/await, top-level await — stabil

V8-major-skift (12 → 13/14): TC39-features som `Promise.withResolvers()`, `Array.fromAsync()`, `Iterator.prototype` helpers bliver mere konsekvent tilgængelige, men ingen kode i repo'et afhænger af 22-specifik fravær af disse.

**Konkrete breakers fundet:** ingen. Repo-kode er Node-version-agnostisk i praksis.

### Sidefund (sektion 8, maks 5)

1. **Master-plan-reference fra opgaven ikke verificerbar.** Opgaven nævner "docs/strategi/stork-2-0-master-plan.md (line nævner Node 22.11)", men grep mod hele `docs/` finder ingen forekomst. Hvis kilde-pin findes på Claude.ai-side, er den ikke replicéret til denne repo-fil — verificér før opgradering hvis det skal med i ændringsomfanget.

2. **`@types/node` declared og resolved divergerer.** apps/web/package.json declarer `^22.16.5`, lock har 22.19.18. Hvis Node bumpes til 24 uden samtidig `@types/node`-bump til `^24`, vil TypeScript stadig type-checke mod 22's types — runtime/types-drift som ikke fanges af `tsc`.

3. **`jsdom@20.0.3` er to majors bag current.** Current jsdom er 25+. Ikke en Node 24-blocker, men hvis test-fejl rammer efter Node-bump, kan opgradering af jsdom være forventet next-step. Ikke i nuværende scope.

4. **CI-workflow har ingen explicit Node-matrix.** `ci.yml` kører kun mod `.nvmrc`'s Node-version. Ingen pre-deploy-test mod både 22 og 24 (transition-window). Hvis Mathias vil have safety-net, kunne en midlertidig matrix `node: [22, 24]` rulles i pakkens implementations-fase, men det er plan-territorium.

5. **`packageManager: "pnpm@10.33.0"`-felt aktiverer Corepack-prefetch.** Ved Node-bump bør corepack/pnpm-binær-hash valideres i CI, da `actions/setup-node` håndterer det automatisk men `.tool-versions` (asdf) ikke har samme automatik. Hvis nogen developer bruger asdf/mise, kræver opgradering manuelt `asdf install` (allerede dokumenteret i README:41).
