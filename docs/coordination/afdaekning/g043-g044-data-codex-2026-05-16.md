# G043+G044 data-afdaekning - Codex - 2026-05-16

## Kort opsummering

- Kilde-status: direkte DB-introspection/live-queries kunne ikke gennemfoeres i denne sandbox (`fetch failed` mod Supabase Management API; `psql`/`supabase` CLI mangler i PATH). `supabase/schema.sql` er kun placeholder. Data her er derfor repo-/migration-/git-baseret, med live-DB-punkter markeret som ikke-verificeret.
- 1. Immutable/lock-trigger-tabeller fundet i aktuel core-state: 6.
- 2. DB-testfiler med direkte `INSERT` i disse tabeller: 3 filer / 4 tabel-hits. Derudover 1 indirekte RPC-side-effect til immutable tabel.
- 3. Transaction wrap: 2 direkte-hit filer er wrapped; `r3_commission_snapshots_immutability.sql` er ikke wrapped.
- 4. Kendte prod-testartefakter fra docs: 5 artefakt-grupper; row-id kunne ikke hentes live.
- 5. H022/H022.1 aendringer: 2 filer pr. commit; kodeaendringen er kun R3-testen. Random dato-offset findes aktuelt i 2 testfiler.
- 6. Rollback-feasibility: 3 direkte-hit filer trivielle/allerede implementeret; 1 indirekte side-effect fil allerede implementeret.
- 7. Fitness-check-muligheder: 5 detektionsmoenstre afdækket.
- 8. Node 22 -> Node 24 afdækning: 5 direkte Node 22 locks/referencer, 1 CI-indirection, 1 engine-strict enforcement og 1 type-level Node 22 pin fundet. 0 dependency engine-blockere for Node 24 i lockfile blandt de scannede kandidater; 1 type-pakke skal foelge runtime for type-accuracy.

## 1. Komplet liste over tabeller med immutability-trigger

Kilde: statisk migrations-state efter `20260514120000_t1_drop_public.sql`. Historiske `public.*` triggers fra C/D-fasen er ikke medtaget, fordi T1 dropper public-tabeller/funktioner med CASCADE.

| Tabel                                 | Trigger-navn                        | Blokerer                                                 | Exception-vej                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------- | ----------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core_compliance.audit_log`           | `audit_log_immutability`            | `UPDATE` + `DELETE`                                      | `current_setting('stork.gdpr_retroactive', true) = 'true'` returnerer `NEW/OLD`; ellers `P0001`. Kommentar kalder det fremtidig `gdpr_retroactive_remove`-vej.                                                                                                                                                                          |
| `core_compliance.anonymization_state` | `anonymization_state_immutability`  | `UPDATE` + `DELETE`                                      | Ingen. Raiser altid `P0001`.                                                                                                                                                                                                                                                                                                            |
| `core_money.pay_periods`              | `pay_periods_lock_and_delete_check` | `DELETE` altid; `UPDATE` paa locked rows med undtagelser | `DELETE` raiser altid `P0001`. `UPDATE` paa locked row tillader kun driftfelter (`consecutive_lock_failures`, `last_lock_*`) eller break-glass unlock naar `stork.allow_pay_period_unlock_break_glass='true'` og ny state er `status='open', locked_at=null, locked_by=null`. Open -> locked tillades og saetter `locked_at/locked_by`. |
| `core_money.commission_snapshots`     | `commission_snapshots_immutability` | `UPDATE` + `DELETE`, conditional                         | Efter R3: `DELETE` tillades kun for `old.is_candidate=true`; locked rows (`is_candidate=false`) raiser `P0001`. `UPDATE` tillader kun `is_candidate` + `candidate_run_id`; alle andre kolonneændringer raiser `P0001`.                                                                                                                  |
| `core_money.salary_corrections`       | `salary_corrections_immutability`   | `UPDATE` + `DELETE`                                      | Ingen. Raiser altid `P0001`.                                                                                                                                                                                                                                                                                                            |
| `core_money.cancellations`            | `cancellations_immutability`        | `UPDATE` + `DELETE`                                      | Ingen. Raiser altid `P0001`.                                                                                                                                                                                                                                                                                                            |

`BEFORE TRUNCATE`-blokering findes for `audit_log`, `anonymization_state`, `commission_snapshots`, `salary_corrections`, `cancellations` via `core_compliance.block_truncate_immutable()`. `pay_periods` er ikke i den eksisterende truncate-fitness-liste, men har `DELETE altid blokeret` i row-triggeren.

## 2. Komplet liste over DB-tests der INSERT'er i disse tabeller

Direkte `INSERT INTO` hits i `supabase/tests` og `scripts`:

| Fil-sti                                                         | Maal-tabel                            | Insert-moenter                                                                                                                                                                                                                                    | Sidst aendret af pakke                                           |
| --------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `supabase/tests/smoke/r3_commission_snapshots_immutability.sql` | `core_money.pay_periods`              | Random-offset: `v_start_date := current_date + interval '10 years' + ((random() * 3650)::int * interval '1 day')`; `end_date = v_start_date + 30`; status `open`.                                                                                 | H022.1 `5a57d33` for random-offset; oprindeligt R3/R4 `484c134`. |
| `supabase/tests/smoke/r3_commission_snapshots_immutability.sql` | `core_money.commission_snapshots`     | To inserts. Første: `sale_id=gen_random_uuid()`, `amount=100`, `status_at_lock='test'`, `is_candidate=true`, efterfulgt af UPDATE til locked (`is_candidate=false`). Anden: `amount=50`, `status_at_lock='cand'`, candidate-row slettes i testen. | R3/R4 `484c134`; seneste filændring H022.1 `5a57d33`.            |
| `supabase/tests/smoke/r7a_break_glass_execute_e2e.sql`          | `core_money.pay_periods`              | Random non-overlap loop: `current_date + (200 + (random() * 9000)::int)`, tjekker mod eksisterende `pay_periods`, indsætter locked periode med `locked_at=now()`, `locked_by=mg`.                                                                 | R7h `04482b9`.                                                   |
| `supabase/tests/smoke/r7a_replay_anonymization_e2e.sql`         | `core_compliance.anonymization_state` | Direkte seed af legacy flat-shape state: `entity_type='employee'`, `table_schema='core_identity'`, `table_name='employees'`, `anonymization_reason='r7h test 2 seed'`, snapshots med `blank/hash_email`.                                          | R7h `04482b9`.                                                   |

Indirekte immutable side-effect:

| Fil-sti                                                    | Maal-tabel                                                                        | Insert-moenter                                                                                                                             | Sidst aendret af pakke |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| `supabase/tests/smoke/r7a_anonymize_generic_apply_e2e.sql` | `core_compliance.anonymization_state` via `core_identity.anonymize_employee(...)` | RPC'en ender i `anonymize_generic_apply` og indsætter state-row; testen verifierer `count(*) = 1`. Ikke direkte `INSERT INTO` i testfilen. | R7h `04482b9`.         |

Direkte `INSERT INTO core_compliance.audit_log`: 0 hits. Audit-log kan dog blive skrevet indirekte af `stork_audit()` naar tests muterer auditede tabeller; R3-testen er relevant, fordi den ikke har transaction wrapper.

## 3. Pr. test fra #2: koerer den i transaktion?

| Test                                                            | Tx-wrap | Hvis nej: barrier                                                                                                                                                       |
| --------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/tests/smoke/r3_commission_snapshots_immutability.sql` | Nej     | Ingen teknisk barrier fundet i filen. Testen er en `DO`-block med lokale exception-handlers og ingen commit-afhaengig assertion. Mangler bare wrapper i nuvaerende fil. |
| `supabase/tests/smoke/r7a_break_glass_execute_e2e.sql`          | Ja      | `BEGIN` linje 14, `ROLLBACK` linje 89. Side-effects observeres inde i samme transaction.                                                                                |
| `supabase/tests/smoke/r7a_replay_anonymization_e2e.sql`         | Ja      | `BEGIN` linje 12, `ROLLBACK` linje 85. Direct `anonymization_state` seed og replay-verifikation sker i samme transaction.                                               |
| `supabase/tests/smoke/r7a_anonymize_generic_apply_e2e.sql`      | Ja      | Indirekte side-effect via RPC; `BEGIN` linje 17, `ROLLBACK` linje 83.                                                                                                   |

Runner-konventionen i `supabase/tests/README.md` siger at side-effect tests bruger `BEGIN ... ROLLBACK`; `scripts/run-db-tests.mjs` sender hver SQL-fil som én query.

## 4. Test-artefakter i prod-DB lige nu

Live query kunne ikke koeres fra denne sandbox. Foelgende er derfor kendte dokumenterede fund, ikke live-bekraeftede row-udtraek.

| Tabel                             | Row-id                        | Mistaenkelig markoer                                                                                      | Oprindelse hvis kendt                         | Beroert af lock/immutability                                                   |
| --------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------ |
| `core_money.pay_periods`          | Ukendt                        | Syntetisk locked periode `2020-01-15 -> 2020-02-14`                                                       | G017 / Trin 4 skeleton-benchmark-verifikation | Ja. `DELETE` altid blokeret; locked `UPDATE` restriktioner.                    |
| `core_money.commission_snapshots` | Ukendt, 260 rows dokumenteret | Snapshot-rows knyttet til syntetisk 2020-periode                                                          | G017 / Trin 4 skeleton-benchmark              | Ja. Locked rows immutable; efter R3 kun candidate delete/flag update undtaget. |
| `core_money.salary_corrections`   | Ukendt                        | `description='smoke test'`, `amount=-100`, periode `2026-04-15 -> 2026-05-14`                             | G017 / Trin 4 verifikation                    | Ja. `UPDATE/DELETE` altid blokeret.                                            |
| `core_money.pay_periods`          | Ukendt                        | Stale R3/H010-range `2031-05-15 -> 2031-06-14` dokumenteret som `pay_periods_no_overlap` kollisionsaarsag | G043, pre-H022 CI-run                         | Ja. Selvom status forventeligt er `open`, `DELETE` er altid blokeret.          |
| `core_money.pay_periods`          | Ukendt                        | Stale H022 fixed-shift-range `2032-11-15` start dokumenteret som H022.1-aarsag                            | H022 CI-run                                   | Ja. `DELETE` altid blokeret.                                                   |

Ikke live-verificeret i denne afdækning: 2036-2046 random-offset rows fra H022.1-runs, test-employees med `@test.invalid`, `r7h_t*` markoerer, og eventuelle audit_log rows fra non-wrapped tests.

## 5. H022.1 random-offset - scope og aendringer

Aktuelt random dato-offset i repo:

| Fil:linje                                                          | Moenster                                                                                           | Commit    |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | --------- |
| `supabase/tests/smoke/r3_commission_snapshots_immutability.sql:38` | H022.1 random-offset: base 10 aar + `random() * 3650`, bruges til `pay_periods` insert.            | `5a57d33` |
| `supabase/tests/smoke/r7a_break_glass_execute_e2e.sql:39`          | R7h random non-overlap: `current_date + (200 + (random() * 9000)::int)` med max 20 overlap-forsog. | `04482b9` |

H022/H022.1 aendringsscope:

| Fil:linje                                                             | Foer-vaerdi                                                                        | Efter-vaerdi                                                                                                                                        | Commit-hash      |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `supabase/tests/smoke/r3_commission_snapshots_immutability.sql`       | `current_date + interval '5 years'` og `current_date + interval '5 years 30 days'` | `current_date + interval '6 years 6 months'` og `current_date + interval '6 years 6 months 30 days'`                                                | H022 `3ff21f8`   |
| `docs/teknisk/teknisk-gaeld.md:447`                                   | Ingen H022-note i G043-entry                                                       | Note om fixed-shift og at cleanup-problemet bestaar                                                                                                 | H022 `3ff21f8`   |
| `supabase/tests/smoke/r3_commission_snapshots_immutability.sql:38-41` | Fixed-shift `6 years 6 months`                                                     | `v_start_date := current_date + interval '10 years' + ((random() * 3650)::int * interval '1 day')`; values bruger `v_start_date, v_start_date + 30` | H022.1 `5a57d33` |
| `docs/teknisk/teknisk-gaeld.md:448`                                   | Kun H022 fixed-shift-note                                                          | H022.1 note om at fixed-shift levede én CI-koersel og random-offset erstattede den                                                                  | H022.1 `5a57d33` |

Svar paa "kun r3, eller bredt": H022/H022.1 aendrede kun R3-testen plus teknisk-gaeld-dokumentet. Random-date-moenter findes dog ogsaa i R7h break-glass-testen, men den aendring er ikke fra H022/H022.1 og er transaction-wrapped.

## 6. Transaction-rollback feasibility pr. test

| Test                                                            | Rollback-feasibility                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/tests/smoke/r3_commission_snapshots_immutability.sql` | Trivielt for fremtidige artefakter: en ydre `BEGIN ... ROLLBACK` ville rulle `pay_periods`, `pay_period_candidate_runs`, `commission_snapshots` og audit side-effects tilbage. Ingen fundne commit-afhaengige assertions, cron-afhaengighed eller deferred constraint der kraever commit. Eksisterende stale rows fjernes ikke af wrapperen. |
| `supabase/tests/smoke/r7a_break_glass_execute_e2e.sql`          | Allerede implementeret. Side-effects (`pay_periods`, break-glass request/approve/execute, op_type-aktivering) observeres foer rollback og kraever ikke commit.                                                                                                                                                                               |
| `supabase/tests/smoke/r7a_replay_anonymization_e2e.sql`         | Allerede implementeret. Direct `anonymization_state` seed og employee-anonymisering verifieres inden rollback; ingen commit-barriere fundet.                                                                                                                                                                                                 |
| `supabase/tests/smoke/r7a_anonymize_generic_apply_e2e.sql`      | Allerede implementeret for indirekte immutable side-effect. RPC insert i `anonymization_state` og employee update verifieres inden rollback; ingen commit-barriere fundet.                                                                                                                                                                   |

Tekniske barrierer specifikt ikke fundet i #2-filerne: cron-trigger der fyrer ved `INSERT`, `DEFERRED` constraint der kraever commit, assertion der kun kan observere post-commit state, eller pgTAP-mekanisme der kraever commit.

## 7. Fitness-check mulighed

| Detektions-moenter                                                                                                                                                                        | Falsk-positiv-risiko                                                                                                                    | Falsk-negativ-risiko                                                                               | Implementations-kompleksitet |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------- |
| Scan `supabase/tests/**/*.sql` for direkte `INSERT INTO` i immutable/lock-tabeller fra #1 uden fil-level `BEGIN` og `ROLLBACK`.                                                           | Lav-mellem: rene negative tests kan indeholde INSERT der altid raiser og ikke persisterer. Kan reduceres ved statement/context parsing. | Mellem: fanger ikke RPC-side-effects og fanger ikke audit-trigger side-effects.                    | Lav.                         |
| Scan for `INSERT INTO core_money.pay_periods` uden `BEGIN/ROLLBACK` uanset immutable-liste.                                                                                               | Lav: pay_periods er kendt problemfelt.                                                                                                  | Lav for G043/G044; fanger ikke andre immutable tabeller.                                           | Lav.                         |
| Scan immutable-table inserts for fixed datoer (`current_date + interval`, konkrete aarstal `20xx`, manglende `random()`/non-overlap check) uden rollback.                                 | Mellem: fixed dato kan vaere okay inde i rollback.                                                                                      | Mellem: random uden rollback er stadig non-idempotent over tid.                                    | Mellem.                      |
| Scan side-effect tests for `perform core_identity.anonymize_employee`, `anonymize_generic_apply`, `break_glass_execute`, `pay_period_lock`, `pay_period_compute_candidate` uden rollback. | Mellem: negative tests kan forvente precondition failure foer mutation.                                                                 | Mellem-hoej: RPC-side-effects kraever vedligeholdt allowlist/kaldgraf.                             | Mellem.                      |
| Scan alle DB-tests med DML (`INSERT/UPDATE/DELETE`) uden rollback, og kraev eksplicit allowlist-kommentar som `-- no-transaction-needed: <reason>`.                                       | Mellem-hoej: mange assertion-tests laver failed DML som ikke persisterer.                                                               | Lavere end de smalle checks, fordi audit_log side-effects og config-testartefakter bliver synlige. | Mellem.                      |

Eksisterende `scripts/fitness.mjs` har allerede immutable truncate-block-check og audit-trigger-coverage, men ingen test-idempotens-check for DB-tests.

## 8. Node 22 -> Node 24 opgradering - konkret omfang

### 8a. Komplet liste over steder Node-version er laast

Repo-scan: `.github/workflows/*.yml`, `package.json`, workspace `package.json`, `.nvmrc`, `.tool-versions`, `.node-version`, `.npmrc`, Docker/Vercel/Netlify-konfig, `supabase/**/deno.json`, `README.md`, `docs/**`. `docs/coordination/afdaekning/**` er udeladt fra denne scan, fordi det er afdæknings-output.

| Fil:linje                     | Nuvaerende vaerdi                                                                                             | Boor aendres til                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `package.json:7`              | `"node": ">=22.11.0 <23"`                                                                                     | Node 24 major-window i samme form: `">=24.0.0 <25"`.                                                                  |
| `.nvmrc:1`                    | `22`                                                                                                          | `24`.                                                                                                                 |
| `.tool-versions:1`            | `nodejs 22.11.0`                                                                                              | `nodejs 24.x.y` hvis exact asdf/mise pin bevares; ellers `nodejs 24` hvis major-pin accepteres.                       |
| `README.md:26`                | Toolchain-tabel angiver Node som `22 LTS` med pinning via `.nvmrc`, `.tool-versions`, `package.json#engines`. | Samme row med `24 LTS`.                                                                                               |
| `README.md:38`                | `nvm install # laeser .nvmrc -> 22`                                                                           | `-> 24`.                                                                                                              |
| `.github/workflows/ci.yml:34` | `node-version-file: .nvmrc`                                                                                   | Ingen hardkodet Node-vaerdi; foelger `.nvmrc`.                                                                        |
| `.npmrc:1`                    | `engine-strict=true`                                                                                          | Ingen Node-vaerdi; enforcement betyder at `package.json#engines.node` bliver praktisk blokerende ved forkert runtime. |
| `apps/web/package.json:73`    | `"@types/node": "^22.16.5"`                                                                                   | Type-level pin til Node 24: `^24.x`. Ikke runtime-lock, men Node API-typer foelger ellers ikke runtime.               |

Steder eksplicit kontrolleret uden Node 22-lock:

| Sted                                                                                                                              | Fund                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/codex-notify.yml`                                                                                              | Ingen `setup-node` eller hardkodet Node-version.                                                                                                                                               |
| `apps/web/package.json`                                                                                                           | Intet `engines`-felt; kun `@types/node` ovenfor.                                                                                                                                               |
| `packages/core/package.json`, `packages/types/package.json`, `packages/utils/package.json`, `packages/eslint-config/package.json` | Ingen `engines`-felter.                                                                                                                                                                        |
| `docs/strategi/stork-2-0-master-plan.md`                                                                                          | Ingen forekomst af `Node 22`, `Node 24`, `22.11`, `.nvmrc` eller `node-version` i aktuel fil. Den foreloebige Claude.ai-kortlaegning af en `Node 22.11`-linje er ikke reproducerbar i repo'et. |
| Docker/Vercel/Netlify/asdf/mise alternativer                                                                                      | Ingen `Dockerfile`, `docker-compose.yml`, `vercel.json`, `netlify.toml`, `.node-version` eller `mise.toml` fundet.                                                                             |
| `supabase/functions/**`                                                                                                           | Ingen `supabase/functions`-directory fundet; ingen `deno.json` under `supabase/`.                                                                                                              |
| `pnpm-lock.yaml`                                                                                                                  | Indeholder dependency `engines`-metadata, men ingen repo-Node lock.                                                                                                                            |

### 8b. Dependency-kompatibilitet med Node 24

Kilde: `package.json`, `apps/web/package.json`, `pnpm-lock.yaml`. Direkte workspace-deps og konkrete kandidater er medtaget; transitive kandidater er markeret.

| Pakke                      | Nuvaerende version                                          | Node-support                                                                                    | Risiko                                                               |
| -------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------- | --- | ---------- | ----------- |
| `turbo`                    | Declared `^2.3.3`, locked `2.9.12`                          | Ingen `engines.node` i lockfile-entry; optional platform binaries findes i lock.                | Kompatibel ift. lockfile metadata.                                   |
| `supabase`                 | Declared/locked `2.98.2`                                    | Lockfile: `engines: {npm: '>=8'}`; officiel Supabase CLI-doc siger Node.js 20+ ved `npx`/`npm`. | Kompatibel.                                                          |
| `vitest`                   | Declared/locked `3.2.4`                                     | `^18.0.0                                                                                        |                                                                      | ^20.0.0                               |     | >=22.0.0`. | Kompatibel. |
| `prettier`                 | Declared `^3.4.2`, locked `3.8.3`                           | `>=14`.                                                                                         | Kompatibel.                                                          |
| `husky`                    | Declared/locked `9.1.7`                                     | `>=18`.                                                                                         | Kompatibel.                                                          |
| `lint-staged`              | Declared/locked `15.5.2`                                    | `>=18.12.0`.                                                                                    | Kompatibel.                                                          |
| `typescript`               | Declared `^5.8.3`, locked `5.9.3`                           | `>=14.17`.                                                                                      | Kompatibel.                                                          |
| `esbuild`                  | Transitive, locked `0.21.5`                                 | `>=12`.                                                                                         | Kompatibel ift. engine range; native binary package.                 |
| `@swc/core`                | Transitive via `@vitejs/plugin-react-swc`, locked `1.15.33` | Core-entry og platform packages i lock udelukker ikke Node 24; platform packages har `>=10`.    | Kompatibel ift. engine range; native binary package.                 |
| `vite`                     | Declared `^5.4.19`, locked `5.4.21`                         | `^18.0.0                                                                                        |                                                                      | >=20.0.0`; peer `@types/node: ^18.0.0 |     | >=20.0.0`. | Kompatibel. |
| `@vitejs/plugin-react-swc` | Declared/locked `3.11.0`                                    | Ingen selvstaendig Node-engine i lock; afhænger af `@swc/core` og `vite`.                       | Kompatibel ift. lockfile metadata.                                   |
| `@types/node`              | Declared `^22.16.5`, locked `22.19.18`                      | Type-pakke, ikke runtime-engine.                                                                | Kraever-opgradering for Node 24 type-accuracy; ikke runtime-blokker. |

Samlet dependency-fund: ingen scannet dependency har `engines.node`, der eksplicit udelukker Node 24. Ingen kandidat-pakke med kendt latest-inkompatibilitet blev paavist i de brugte kilder. Repoets eneste eksplicitte Node 24-blokker er root `package.json#engines.node` sammen med `.npmrc` `engine-strict=true`.

### 8c. Supabase Edge Functions Node-lock

Repo-status:

| Kontrol                             | Fund                                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `find supabase -maxdepth 3 -type f` | Ingen `supabase/functions/*` og ingen function `deno.json`.                                                                    |
| Supabase Edge Functions runtime     | Officiel Supabase-doc beskriver Edge Functions som Deno-compatible runtime med TypeScript-first execution.                     |
| Supabase CLI i repo                 | Node-versionen paavirker kun den lokale/CI CLI-wrapper (`supabase` npm devDependency), ikke deploy-runtime for Edge Functions. |

Konklusion for denne afdækning: Node 22 -> 24 i repoet paavirker ikke en eksisterende Edge Functions deploy-flade, fordi repoet ikke har Edge Functions. Hvis der senere tilfoejes Edge Functions, er runtime-lock Deno/Supabase Edge Runtime-konfiguration, ikke `.nvmrc`.

### 8d. CI-cache-invalidation ved Node-skift

| Punkt                          | Faktisk fund                                                                                                                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Lokal CI-konfiguration         | `.github/workflows/ci.yml:31-35` bruger `actions/setup-node@v4` med `node-version-file: .nvmrc` og `cache: pnpm`.                                                                                                        |
| Dependency cache               | `actions/setup-node@v4` docs siger at package cache er global cache, ikke `node_modules`, og kan genbruges mellem forskellige Node-versioner. Docs for lockfiles siger cache-feature bygger sin unique key paa lockfile. |
| `.nvmrc`-skift alene           | Ikke bekraeftet som pnpm dependency-cache invalidation. Kilderne peger paa at `pnpm-lock.yaml`/cache-dependency-path er cache-key-driveren, mens `.nvmrc` styrer Node runtime resolution.                                |
| Forventet foerste-run friktion | Node 24 kan give setup-node tool-cache miss/download, hvis runneren ikke allerede har den efterspurgte Node 24-version. Pnpm dependency cache forventes kun at misse hvis lockfile/cache key aendres.                    |

### 8e. Breaking changes Node 22 -> Node 24 relevante for repo

Kilder scannet mod repo: 74 JS/TS/TSX/MJS/CJS-filer uden `node_modules`, `.git` og afdæknings-output. Kendte Node 24 semver-major/deprecation-punkter er krydstjekket mod source-moenstre.

| Node 24-aendring                                                                               | Repo-forekomst                                                                                                                                                                      | Konkret betydning for denne kodebase                                                                                                                               |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| V8 13.6 og native/V8 API-aendringer                                                            | Ingen native addon source, ingen C++/N-API kode i repo. Native/binary deps i lock: `@swc/core`, `esbuild`, `turbo`, `supabase`.                                                     | Ingen repo-kode rammes direkte; kompatibilitet ligger hos prebuilt/native dependency packages. Lockfile engines udelukker ikke Node 24.                            |
| Bundled npm 11 i Node 24                                                                       | CI bruger `pnpm/action-setup@v4` version `10.33.0`, root `packageManager` er `pnpm@10.33.0`.                                                                                        | Ingen direkte npm-baseret install path i CI. Supabase CLI npm wrapper har Node 20+ doc-krav og lockfile `npm >=8`.                                                 |
| Runtime deprecation af `url.parse()`                                                           | Ingen `url.parse`-forekomst i `apps/`, `packages/`, `scripts/`, `supabase/`.                                                                                                        | Ikke relevant i repo-kode.                                                                                                                                         |
| Removal/deprecation omkring `tls.createSecurePair`, `SlowBuffer`, zlib constructors uden `new` | Ingen forekomster.                                                                                                                                                                  | Ikke relevant i repo-kode.                                                                                                                                         |
| Deprecation for `child_process.spawn/execFile` args-pattern                                    | Ingen `child_process`, `spawn(` eller `execFile(` forekomster i repo-source.                                                                                                        | Ikke relevant i repo-kode.                                                                                                                                         |
| Node test runner subtest-wait ændring                                                          | Ingen `node:test`-brug. Teststack er Vitest + SQL-runner.                                                                                                                           | Ikke relevant i repo-kode.                                                                                                                                         |
| ESM/CJS-grænser og ambiguous modules                                                           | Root og workspace packages bruger `"type": "module"`; scripts er `.mjs`; ingen `require(` eller `module.exports` i source. Én `__dirname`-forekomst i `apps/web/vite.config.ts:17`. | `__dirname`-forekomsten ligger i Vite TS config-load, ikke som kendt Node 24 removal/deprecation. Ingen CJS-mønstre fundet.                                        |
| `fs.promises`/WHATWG fetch-adfaerd                                                             | Scripts bruger `node:fs/promises`, `node:path` og global `fetch`.                                                                                                                   | Ingen Node 24 breaking-change fundet i disse API-brug. Sandboxens `fetch failed` mod Supabase Management API er netvaerks-/miljoeafhaengig, ikke Node 24 API-fejl. |

Kilder brugt til Node-afdækningen:

- Node.js 24.0.0 release notes: `https://nodejs.org/en/blog/release/v24.0.0`
- `actions/setup-node@v4` advanced usage: `https://github.com/actions/setup-node/blob/v4/docs/advanced-usage.md`
- Supabase CLI docs: `https://supabase.com/docs/guides/local-development/cli/getting-started`
- Supabase Edge Functions docs: `https://supabase.com/docs/guides/functions`

## Sidefund

- `supabase/tests/smoke/p1a_anonymization_strategies.sql` har DML uden `BEGIN/ROLLBACK` og opretter en valid strategy med navn `p1a_smoke_t5_<epoch>`; den ligger uden for #1-tabellerne, men er en non-idempotent prod-artefakt-kandidat.
- `scripts/run-db-tests.mjs` kommenterer at side-effect tests bruger `BEGIN/ROLLBACK`, men runneren haandhaever det ikke.
- `scripts/fitness.mjs`'s `IMMUTABLE_TABLES_REQUIRE_TRUNCATE_BLOCK` indeholder ikke `core_money.pay_periods`, selvom `pay_periods` har `DELETE altid blokeret`.
- `docs/teknisk/teknisk-gaeld.md` G044 naevner kendt berørt test `r4_salary_corrections_cleanup`, men ingen fil med det navn findes i aktuelt `supabase/tests`.
