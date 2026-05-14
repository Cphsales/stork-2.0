# Stork 2.0 — Teknisk gæld

**Formål:** Liste af kendt teknisk gæld der svækker visionen (én sandhed, styr på data, eksplicit sammenkobling, stamme=database, beregning over databasen, rettigheder der virker, anonymisering bevarer audit, alt drift styres i UI). Vedligeholdes efter hvert trin. Ny gæld tilføjes ved introduktion; løst gæld flyttes til arkiv.

**Severitet:**

- **Høj** — direkte brud på vision-princip
- **Mellem** — kompromis med dokumenteret plan
- **Lav** — kosmetisk/strukturel, ufuldstændig på en acceptabel måde

**Sidste opdatering:** 14. maj 2026 (efter retroaktiv gennemgang trin 1-4)

---

## Åben gæld

### [G001] HØJ — `audit_filter_values` LENIENT-default ved ukendt schema/table

- **Beskrivelse:** Hvis migration INSERT'er på en tabel uden klassifikation, returnerer `audit_filter_values` WARNING + lader værdier passere uændret. Strict-mode kræver eksplicit `stork.audit_filter_strict='true'` session-var.
- **Vision-svækkelse:** "Styr på data — klassifikation på hver kolonne". Ukendt tabel kan skrive PII direkte til audit-log uden hash.
- **Introduceret:** Trin 1 (`20260514120006_t1_audit_filter_values.sql`)
- **Skal løses:** Før første produktions-data
- **Risiko hvis glemt:** Høj. Ny tabel uden klassifikation → PII læk i audit-log.
- **Plan:** Migration der flipper default til strict + verificerer ingen eksisterende migration genererer warnings. Migration-gate fanger normalt det, men kun for migration-FILER — runtime-skrivninger er sårbare.

### [G002] LAV — `source_type`-enum udvidet inline med 'migration'

- **Beskrivelse:** Master-plan §1.3 listede 6 værdier; CHECK-constraint har 7 (tilføjet 'migration' pr. §0.5 / rettelse 20).
- **Vision-svækkelse:** Ingen direkte — master-plan rettelse 21 er konsistens-fixet.
- **Introduceret:** Trin 1 (`20260514120003_t1_audit_partitioned.sql:31-33`)
- **Skal løses:** Ingen aktiv handling — verificér at master-plan §1.3-tekst stadig stemmer
- **Risiko hvis glemt:** Lav
- **Plan:** Verifikations-tjek næste gang master-plan revideres

### [G003] LAV — Hardkodede `auth.users`-id'er i bootstrap

- **Beskrivelse:** mg@ + km@ UUID'er fra Supabase Auth er hardkodet i migration-fil. Hvis Auth-bruger slettes/genskabes med ny UUID, breaker bootstrap ved replay.
- **Vision-svækkelse:** "Stamme = database" — auth-mapping lever uden for DB.
- **Introduceret:** Trin 1 (`20260514120007_t1_bootstrap_admins.sql:13-15`)
- **Skal løses:** Ingen — bevidst bootstrap-pragmatik
- **Risiko hvis glemt:** Lav i drift (kun ved DB-reset). Migration er kørt én gang.
- **Plan:** Hvis nyt admin-team dukker op, flyttes auth-mapping til lag F-konfig-tabel

### [G004] STRUKTUREL — `employees_active_idx` mangler `current_date` i prædikat

- **Beskrivelse:** Index er `(id, termination_date) WHERE anonymized_at IS NULL`. Aktiv-filter `termination_date > current_date` sker ved query-tid fordi `current_date` ikke er IMMUTABLE.
- **Vision-svækkelse:** Ingen — strukturel PG-begrænsning, ikke kompromis.
- **Introduceret:** Trin 1 (`20260514120007_t1_bootstrap_admins.sql:35-36`)
- **Skal løses:** Ingen
- **Plan:** Dokumentér eksplicit i index-comment. Ikke gæld i klassisk forstand.

### [G005] LAV — Fase 0 migration-filer bevaret som "historik"

- **Beskrivelse:** 13 fase 0-filer i `supabase/migrations/` (`c1-c4_1`, `d1-d7`). Tabellerne droppet i trin 1. Migrationerne forbliver registreret som "applied" i `supabase_migrations.schema_migrations` men deres effekt er nuked. Migration-gate parser stadig deres INSERT-tuples (336 unique keys i union, men kun 193 i DB).
- **Vision-svækkelse:** Lav — arkæologisk støj. Migration-gate's tal er forvirrende fordi den ikke ved at fase 0-INSERTs blev rullet tilbage.
- **Introduceret:** Fase 0 + bevaret af trin 1
- **Skal løses:** Efter trin 8 strict-aktivering har virket et stykke tid
- **Risiko hvis glemt:** Lav. Filerne kan ikke køres igen (mål-tabeller eksisterer ikke).
- **Plan:** Cleanup-commit der DELETE'er fase 0-filer + sletter deres rows i `supabase_migrations.schema_migrations`

### [G006] MELLEM — `db-rls-policies` fitness-check er "soft" (warning only)

- **Beskrivelse:** Tabeller med ENABLE RLS + 0 policies (default-deny) skal have `-- skip-force-rls:` eller `-- default-deny:`-markør. Check skippes hvis fitness ikke kan kontakte Supabase Management API. Violations er markeret som warnings (soft), ikke errors.
- **Vision-svækkelse:** "Rettigheder der virker" — default-deny uden eksplicit markør kan slippe igennem.
- **Introduceret:** Trin 1 (`scripts/fitness.mjs:397-458`)
- **Skal løses:** Når Supabase-token er pålideligt sat i CI
- **Risiko hvis glemt:** Mellem. Tabel oprettes med RLS uden policies → ingen kan læse den.
- **Plan:** Flip soft → hard når CI-token er stabil

### [G007] MELLEM — Migration-scripts har TODO-markører for 1.0-skema

- **Beskrivelse:** `scripts/migration/employees/{1,2,3}.sql` er skabeloner med TODO-markører. Faktiske tabel-/kolonne-navne i Stork 1.0 ikke verificeret. Antagelser: `employee_master_data`, `agents`, `sales.agent_email`, `terminated_at`, `auth_user_id`, `role_name`.
- **Vision-svækkelse:** "Stamme = database" — migration ikke testbar mod 1.0 endnu.
- **Introduceret:** Trin 2
- **Skal løses:** Når Mathias kører discovery mod 1.0
- **Risiko hvis glemt:** Mellem. Scripts vil fejle mod faktisk 1.0-skema (discovery-fasen fanger det).
- **Plan:** Discovery-eksekvering → opdatér TODO-markører → re-test

### [G008] LAV — Default-rolle 'sælger' hardkodet i upload-script

- **Beskrivelse:** Migrerede medarbejdere får automatisk rolle='sælger'. Admin-roller skal manuelt mappes af Mathias før upload.
- **Vision-svækkelse:** Lav — manuel admin-mapping er pragmatik
- **Introduceret:** Trin 2 (`scripts/migration/employees/3_upload.sql:65-79`)
- **Skal løses:** Når rolle-katalog konfigureres i UI (lag F)
- **Risiko hvis glemt:** Lav
- **Plan:** Upload-script læser rolle-mapping fra konfig-tabel når lag F leverer rolle-konfig

### [G009] HØJ — `retention_cleanup_daily` HARDKODER 1825 dage for employees

- **Beskrivelse:** Cron beregner cutoff som `current_date - interval '1825 days'`. Værdien 1825 er parallel til `data_field_definitions` (event_based, days_after=1825), men cron læser IKKE fra definitions — den hardkoder.
- **Vision-svækkelse:** **DIREKTE BRUD på "alt drift styres i UI"**. Hvis admin ændrer retention_value i UI fra 1825 → 1095, har det INGEN effekt på cron.
- **Introduceret:** Trin 3 (`20260514140002_t6_anonymization_crons.sql:79`)
- **Skal løses:** Trin 5 (kombineret med G010 + G011 til dispatcher-mønster) eller senest trin 10 (clients tilføjer ny retention-værdi)
- **Risiko hvis glemt:** Høj. PII anonymiseres efter forkert tidsrum sammenlignet med konfig. Compliance-risiko (GDPR-rådgiver ser konfig, ikke kode).
- **Plan:** Generisk retention-evaluator der læser `data_field_definitions` pr. tabel og evaluerer event_based + time_based + legal-regler. Master-plan §1.4 specificerer designet. Kombineres med G010+G011 til dispatcher-mønster. **Planlagt løsning: trin 5.**

### [G010] MELLEM — `replay_anonymization` kun har employee-branch

- **Beskrivelse:** Else-grenen `v_skipped := v_skipped + 1` for ikke-employee entity-typer. clients (trin 10) og identity-master (trin 15) replay'er ikke.
- **Vision-svækkelse:** "Anonymisering bevarer audit" — efter restore vil clients/identities falde tilbage til pre-anonymized state hvis ikke replay udvides.
- **Introduceret:** Trin 3 (`20260514140001_t6_anonymization_rpcs.sql:208-236`)
- **Skal løses:** Trin 5 (kombineret med G009 til dispatcher-mønster)
- **Risiko hvis glemt:** Mellem indtil trin 10/15. Lav nu (kun employees eksisterer).
- **Plan:** Dispatcher-mønster: registry-tabel `anonymization_dispatch` der mapper entity_type → anonymize-RPC. replay læser fra registry. **Planlagt løsning: trin 5.**

### [G011] MELLEM — `verify_anonymization_consistency` kun har employee-branch

- **Beskrivelse:** Samme som G010 — kun employee-grenen verificerer master-row vs. anonymization_state.
- **Vision-svækkelse:** Samme som G010
- **Introduceret:** Trin 3 (`20260514140001_t6_anonymization_rpcs.sql:281-298`)
- **Skal løses:** Trin 5 (sammen med G009 + G010)
- **Risiko hvis glemt:** Mellem indtil trin 10/15
- **Plan:** Samme dispatcher-mønster som G010. **Planlagt løsning: trin 5.**

### [G012] HØJ — `pay_period_compute_candidate` er SKELETON → fejl-låst prod-periode-risiko

- **Beskrivelse:** RPC'en genererer 0.00-amount placeholder commission_snapshots_candidate-rows pr. aktiv medarbejder. Kopierer kun eksisterende salary_corrections. Ingen reel aggregat-beregning. Auto-lock-cron (aktiveret i trin 7b) ville promovere tomme placeholder-rows til immutable final commission_snapshots.
- **Vision-svækkelse:** "Stamme = database, beregning over databasen" — beregningen findes ikke endnu.
- **Introduceret:** Trin 4 (`20260514150005_t7_lock_pipeline.sql:147-188`)
- **Skal løses:** Trin 14 (sales-stamme) + trin 22 (aggregater + payroll-linjer)
- **Risiko hvis glemt:** Høj. Auto-lock-cron rammer 2026-05-31 (recommended_lock_date for nuværende periode). Den låste periode ville indeholde 0.00 commission-snapshots og ingen reel udbetalingsdata.
- **Plan i denne commit:** **Safety-flip `pay_period_settings.auto_lock_enabled = false` (migration `20260514160001_t7_disable_auto_lock_until_compute_real.sql`)**. Cron tjekker global switch FØR den itererer perioder, så alle periode-locks skippes. Re-aktiveres når trin 14 + trin 22 er færdige OG G013 er løst.

### [G013] MELLEM — `pay_period_lock` re-lock efter break-glass-unlock håndterer ikke UNIQUE-conflict

- **Beskrivelse:** `pay_period_unlock_via_break_glass` bevarer eksisterende immutable `commission_snapshots`. Hvis re-lock kører med samme `(period_id, sale_id, employee_id)`-keys, fejler UNIQUE-constraint.
- **Vision-svækkelse:** "Én sandhed" — break-glass-unlock + re-lock er ikke idempotent
- **Introduceret:** Trin 4 (`20260514150005_t7_lock_pipeline.sql` — gap i unlock-RPC)
- **Skal løses:** Trin 14+ (når sales-tabel + reelle snapshot-keys eksisterer)
- **Risiko hvis glemt:** Mellem. Break-glass-unlock er sjælden.
- **Plan:** Mulige løsninger: (a) `ON CONFLICT DO NOTHING` i lock-promote, (b) versioneret snapshot med `lock_version` i UNIQUE-key, (c) eksplicit DELETE-via-break-glass-RPC der bypasser immutability. Designvalg sker trin 14.

### [G014] MELLEM — SELECT-policies på løn-tabeller er admin-only

- **Beskrivelse:** SELECT-policies på `commission_snapshots`, `salary_corrections`, `cancellations`, candidate-tabeller bruger `using (core_identity.is_admin())`. Master-plan §2.1.3 specificerer scope-model self/team/subtree/all — ikke implementeret.
- **Vision-svækkelse:** "Rettigheder der virker" — sælgere kan ikke se egne provisioner via direkte SELECT.
- **Introduceret:** Trin 4 (flere migrations)
- **Skal løses:** Trin 16/17 (scope-helpers i §1.1 + §1.7). Eksisterende plan, forward-kompatibelt.
- **Risiko hvis glemt:** Mellem. UI vil ikke kunne vise rolle-baseret data.
- **Plan:** Master-plan eksplicit specificerer trin 16/17 som det rigtige sted.

### [G015] LAV — `_compute_period_data_checksum` mangler sales-state

- **Beskrivelse:** Checksum kun over `salary_corrections_count`, `salary_corrections_latest`, `active_employees_count`. Sales (trin 14) tilføjes senere.
- **Vision-svækkelse:** Lav — bevidst forward-kompatibel
- **Introduceret:** Trin 4 (`20260514150005_t7_lock_pipeline.sql:7-43`)
- **Skal løses:** Trin 14 (sales-state) + trin 13 (formel-version-snapshot)
- **Risiko hvis glemt:** Lav
- **Plan:** Udvid checksum gradvist når kilde-tabeller dukker op.

### [G016] LAV — `pay_periods.locked_by` NULLABLE i locked-state (inline-fix)

- **Beskrivelse:** auth.uid() returnerer NULL for service-role/cron. CHECK-constraint relaxet så locked-state kun kræver locked_at NOT NULL, locked_by er optional.
- **Vision-svækkelse:** Lav — semantisk uklart isoleret set; audit-log bærer kilden (source_type='cron')
- **Introduceret:** Trin 4 (`20260514150010_t7_inline_fix_locked_by_nullable.sql`)
- **Skal løses:** Ikke akut
- **Risiko hvis glemt:** Lav
- **Plan:** Hvis system-employee-konvention etableres ("system" employee i core_identity der ejer cron-handlinger), kan locked_by sættes til dens UUID. Ikke akut.

### [G017] LAV — Test-artefakter i prod-DB

- **Beskrivelse:** 1 syntetisk locked pay_period (2020-01-15→2020-02-14) + 260 commission_snapshots (immutable) + 1 salary_correction (description='smoke test', amount=-100, i 2026-04-15→2026-05-14)
- **Vision-svækkelse:** "Stamme = database" — prod-DB indeholder ikke-prod-data uden klar separation. Smoke-correction vil dukke op som -100 fradrag for en medarbejder når compute er reel.
- **Introduceret:** Trin 4 (verifikations-test)
- **Skal løses:** Før trin 14 (compute bliver reel)
- **Risiko hvis glemt:** Lav-mellem. Skævvrider beregninger fra trin 14+.
- **Plan:** Engangs-cleanup-migration før trin 14 eller break-glass-RPC der bypasser immutability for klart-markerede test-rækker.

### [G018] LAV — Bygge-status klassifikations-tal er forkerte

- **Beskrivelse:** `docs/bygge-status.md` siger "207/211/233 klassificerede kolonner" efter trin 1/2/3. Aktuelt i DB: 90 før trin 7, 193 efter. Tallene stammer fra migration-gate's union-count over alle migration-file-INSERTs inkl. fase 0-filer der blev DROP CASCADE'd.
- **Vision-svækkelse:** Lav — dokumentations-accuracy
- **Introduceret:** Trin 1-3 (rapport-skrivning)
- **Skal løses:** Ved næste bygge-status-revision
- **Risiko hvis glemt:** Lav — credibility
- **Plan:** Korrigér historiske tal eller marker dem som ukorrekte. Fremover: brug eksplicit `SELECT count(*)` mod DB i verifikation, ikke migration-gate-output.

### [G024] HØJ — Klassifikations-registry tillod NULL retention på hver kolonne (LØST i C001)

- **Beskrivelse:** `data_field_definitions.retention_type` var NULLABLE; CHECK tillod (NULL, NULL). 189 ud af 193 eksisterende klassificeringer havde NULL retention. Master-plan §0 kræver "klassifikation + retention på hver kolonne".
- **Vision-svækkelse:** §0 (styr på data + slette-regler). "Styr på data" var symbolsk for de fleste kolonner.
- **Introduceret:** Trin 1 (`20260514120005_t1_data_field_definitions.sql:18`)
- **Opdaget:** Codex-review 2026-05-14 (C001)
- **Status:** **LØST i `20260514170003_c001_retention_not_null.sql`**:
  - Tilføjet retention_type='permanent' (semantisk: ingen sletning, eksplicit)
  - Backfill 189 rows: legal 7y for audit/regnskab, time_based 1-2y for drift, permanent for system-meta, event_based for PII koblet til termination
  - retention_consistency CHECK strammet: permanent → value NULL; øvrige → value NOT NULL
  - ALTER COLUMN retention_type SET NOT NULL
  - validate_retention-trigger udvidet med 'permanent'-branch
- **Distribution efter backfill:** 71 legal + 71 permanent + 44 time_based + 7 event_based = 193
- **Verifikation:**
  - `count(*) where retention_type IS NULL` = 0 ✓
  - Negative: INSERT med retention_type=NULL → not_null_violation ✓
  - Negative: INSERT med time_based + retention_value=NULL → check_violation ✓
  - Positive: INSERT med permanent + retention_value=NULL → accepteret ✓
- **Note:** Flyttes til arkiv ved næste teknisk-gaeld-revision.

### [G023] MELLEM — Break-glass dispatcher fri-tekst + inactive RPC-seed (LØST i C006)

- **Beskrivelse:** (1) `gdpr_retroactive_remove` seedet med `is_active=true`, men `core_compliance.gdpr_retroactive_remove_via_break_glass` findes ikke (bygges post-fase-E pr. §1.13). Requester kunne lave request, men execute fejlede sent med obskur fejl. (2) `break_glass_execute` byggede SQL via `format('select %s($1,$2)', internal_rpc)` fra fri-tekst-konfig — skadeligt indhold ville eksekvere som SECURITY DEFINER (postgres-privilegier).
- **Vision-svækkelse:** §1.15 (break-glass-flow) + §1.1 (sikkerheds-disciplin).
- **Introduceret:** Trin 4 (`20260514150008_t7c_break_glass.sql:83, 382`)
- **Opdaget:** Codex-review 2026-05-14 (C006)
- **Status:** **LØST i `20260514170002_c006_break_glass_allowlist.sql`**:
  - `gdpr_retroactive_remove.is_active=false` + opdateret description med re-aktiverings-plan
  - `break_glass_execute` validerer `internal_rpc` via `regprocedure`-cast FØR EXECUTE. PG's eget type-system bliver allowlisten; cast fejler med 42883 hvis funktionen ikke findes eller signaturen er forkert
- **Verifikation:**
  - `select operation_type, is_active from break_glass_operation_types` viser gdpr=false, pay_period_unlock=true
  - regprocedure-cast på nonexistent RPC → undefined_function (42883) ✓
  - regprocedure-cast på `core_money.pay_period_unlock_via_break_glass` → succeeds ✓
- **Note:** Flyttes til arkiv ved næste teknisk-gaeld-revision.

### [G022] HØJ — Admin-floor count + trigger inkluderede ikke termination_date (LØST i C005)

- **Beskrivelse:** `enforce_admin_floor()` count'ede admins via `anonymized_at IS NULL` alene, mens `is_admin()` også filtrerer `termination_date`. Trigger lyttede ikke på `termination_date`-UPDATE. Resultat: terminere en admin (uden anonymize) reducerede ikke floor-count → systemet kunne ende under minimum aktive admins uden at trigger fyrede.
- **Vision-svækkelse:** §1.7 (superadmin-floor). Floor var symbolsk, ikke reel for termination-path.
- **Introduceret:** Trin 2 (`20260514130000_t2_superadmin_floor.sql:69, 91`)
- **Opdaget:** Codex-review 2026-05-14 (C005)
- **Status:** **LØST i `20260514170001_c005_admin_floor_termination.sql`**:
  - Count i `enforce_admin_floor()` matcher nu `is_admin()`-semantik: `(termination_date IS NULL OR termination_date >= current_date)`
  - Trigger `employees_enforce_admin_floor` udvidet med `termination_date` i OF-liste
- **Verifikation:**
  - Negative test: forsøg `UPDATE termination_date = current_date - 1` på mg@ (én af to admins, min=2) → P0001 superadmin-floor + state intakt (termination_date forblev NULL)
  - Positive test: `UPDATE termination_date = current_date + 30` på mg@ (stadig admin idag) → lykkedes
  - Declarative: `pg_trigger.tgname` viser nu `UPDATE OF role_id, anonymized_at, termination_date OR DELETE`
- **Note:** Flyttes til arkiv ved næste teknisk-gaeld-revision.

### [G021] HØJ — `pay_period` SECURITY DEFINER current_user-fallback (LØST i C004)

- **Beskrivelse:** `pay_period_lock`, `pay_period_compute_candidate`, `pay_period_lock_attempt` brugte `if not is_admin() and current_user not in ('service_role', ...)`-fallback. Inde i SECURITY DEFINER er current_user = definer = postgres → authenticated user kalder → check passerer. Enhver authenticated user kunne dermed låse perioder.
- **Vision-svækkelse:** §1.7 (permission-baseret rolle-check) + §1.1 (default deny).
- **Introduceret:** Trin 4 (`20260514150005_t7_lock_pipeline.sql:108, 224`)
- **Opdaget:** Codex-review 2026-05-14 (C004)
- **Status:** **LØST i `20260514170000_c004_pay_period_rpc_security.sql`** — split-pattern:
  - `_pay_period_*_internal(...)` — intern helper uden permission-check; GRANT TO service_role only
  - `pay_period_*(...)` — public admin-RPC med strict `is_admin()`; GRANT TO authenticated
  - `pay_period_*_via_cron(...)` — service_role only via REVOKE/GRANT; ingen current_user-check
  - `pay_period_lock_attempt(...)` — service_role only; kalder `pay_period_lock_via_cron`
  - Cron-body for `pay_period_candidate_precompute_daily` rescheduled til at kalde `_via_cron`-variant
- **Verifikation:**
  - 10 declarative permission-checks via `has_function_privilege` (authenticated kan ikke kalde via_cron/attempt/internal; service_role kan ikke kalde admin-RPC'er)
  - Runtime negative test: `pay_period_lock` raises 42501 fra non-admin context
  - Runtime negative test: `pay_period_compute_candidate` samme
  - Runtime positive test: `pay_period_compute_candidate_via_cron` udført som service_role → succeeded
- **Note:** Flyttes til arkiv ved næste teknisk-gaeld-revision.

### [G019] LAV — `stork_audit` antog uuid PK; singletons med smallint/integer PK var ikke testet

- **Beskrivelse:** Audit-trigger castede `to_jsonb(new)->>'id'` til uuid uden type-tjek. `pay_period_settings.id` (smallint) og `superadmin_settings.id` (integer) var bootstrappet før audit-trigger blev attached, så bug'en blev ikke opdaget før første UPDATE.
- **Vision-svækkelse:** "Anonymisering bevarer audit" + "Én sandhed" — singletons kunne ikke opdateres uden audit-bypass.
- **Introduceret:** Trin 1 (`20260514120003_t1_audit_partitioned.sql:143`)
- **Opdaget:** 2026-05-14 ved G012-mitigation (UPDATE på pay_period_settings)
- **Status i denne commit:** **LØST i `20260514160000_t1_inline_fix_audit_non_uuid_id.sql`** — TRY/CATCH omkring uuid-cast. record_id=NULL ved non-uuid PK; id-værdien bevares i old/new_values jsonb. Audit-trail intakt.
- **Note:** Flyttes til arkiv ved næste teknisk-gaeld-revision (efter Mathias-godkendelse af denne commit).

---

## Løst gæld (arkiv)

_Ingen endnu. G019 flyttes hertil ved næste revision._
