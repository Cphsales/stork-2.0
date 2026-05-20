# Stork 2.0 — Teknisk gæld

**Formål:** Liste af kendt teknisk gæld der svækker visionen (én sandhed, styr på data, eksplicit sammenkobling, stamme=database, beregning over databasen, rettigheder der virker, anonymisering bevarer audit, alt drift styres i UI). Vedligeholdes efter hvert trin. Ny gæld tilføjes ved introduktion; løst gæld flyttes til arkiv.

**Severitet:**

- **Høj** — direkte brud på vision-princip
- **Mellem** — kompromis med dokumenteret plan
- **Lav** — kosmetisk/strukturel, ufuldstændig på en acceptabel måde

**Sidste opdatering:** 19. maj 2026 (G054 LØST — type-codegen for alle 4 eksponerede API-schemas)

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

### [G029] MELLEM — C001-backfill bruger legal retention mod master-plan-reservation

- **Beskrivelse:** C001-fix (commit `71ab37f`) klassificerede `pay_periods`, `commission_snapshots`, `salary_corrections`, `cancellations`, `audit_log`, `break_glass_requests` som `retention_type='legal'` med 2555 dage (7 år).
- **Konflikt:** `legal` retention-type fjernes helt fra systemet pr. rettelse 24. Stork har ingen lovbestemt min-retention på forretningsdata. Løn-tabeller skal klassificeres som `time_based` (admin vælger værdi via UI) eller `NULL` (ikke valgt — migration-gate blokerer prod).
- **Vision-svækkelse:** "Styr på data" + "alt drift styres i UI" — klassifikation på fundamentet matcher ikke vision-princippet om data-kontrol i UI.
- **Introduceret:** Trin 1 (commit `71ab37f`, C001-fix).
- **Opdaget:** Master-plan status-verifikation 2026-05-14.
- **Skal løses:** Før trin 5 startes ELLER samtidig med refactor-pakke for §1.6 (audit-strategi).
- **Risiko hvis glemt:** Slette/anonym-regler får forkert default. UI-styret retention-mekanisme får 7-årig låsning på data der reelt skulle være drift-retention.
- **Plan:** Konvertér løn-tabeller fra `legal` til `time_based` med retention-værdi afgjort af Mathias. Princip: "alle slette og anonym-regler styres i UI".
- **Berørt af C001:** 71 rows klassificeret som `legal` (audit_log 15 + break_glass_requests 17 + pay_periods 11 + commission_snapshots 7 + salary_corrections 10 + cancellations 11). Beslutning om scope af konvertering (alle 71 eller kun løn-relaterede tabeller) afventer afgørelse.

### [G028] MELLEM — C002/C003-commit klassificerede ikke nye dispatcher-kolonner (LØST som disciplin-fix)

- **Beskrivelse:** C002+C003-commit (`d40922a`) udvidede `anonymization_mappings` med 4 dispatcher-felter (`internal_rpc_anonymize`, `internal_rpc_apply`, `anonymized_check_column`, `retention_event_column`) via ALTER TABLE, men glemte tilsvarende klassifikations-rows i `data_field_definitions`. Migration-gate Phase 1 (warn-only) advarede; Phase 2 strict (CI) blokerede merge.
- **Vision-svækkelse:** §0 + §1.2 (klassifikation + retention på hver kolonne).
- **Introduceret:** Commit `d40922a` (C002+C003).
- **Opdaget:** Selv-tjek under arbejds-disciplin-opgaven; strict migration-gate fangede uklassificeret kolonne. Indikerer hul i selv-tjek-proceduren (warn vs strict) — tages med næste gang arbejds-disciplinen revideres.
- **Status:** **LØST i `20260514180000_g028_classify_anonymization_dispatcher_columns.sql`** — 4 kolonner klassificeret som `konfiguration` / `pii_level='none'` / `retention_type='permanent'` (system-meta).
- **Verifikation:** Migration-gate Phase 2 strict grøn (48 migrations, 340 klassificerede kolonner).
- **Note:** Flyttes til arkiv ved næste teknisk-gaeld-revision.

### [G026] HØJ — Replay-anonymisering brugte live mapping + INSERT'ede state-row (LØST i C002/C003)

- **Beskrivelse:** `replay_anonymization` itererede `anonymization_state` og kaldte `anonymize_employee`, som forsøgte INSERT ny `anonymization_state`-row → UNIQUE-conflict på `(entity_type, entity_id)`. Brugte også LIVE `anonymization_mappings.field_strategies` istedet for `state_row.field_mapping_snapshot`. Backup-paradoks (rettelse 18 A3) var ikke løst.
- **Vision-svækkelse:** §1.4 (anonymisering bevarer audit) + rettelse 18 A3 (post-restore replay korrekt).
- **Introduceret:** Trin 3 (`20260514140001_t6_anonymization_rpcs.sql:224`)
- **Opdaget:** Codex-review 2026-05-14 (C003)
- **Status:** **LØST i `20260514170004_c002_c003_anonymization_dispatcher.sql`** — replay dispatcher:
  - Læser `state_row.field_mapping_snapshot` (snapshot, ikke live mapping)
  - Dispatcher til `mapping.internal_rpc_apply` (UPDATE-only)
  - INGEN INSERT i `anonymization_state` (idempotent)
  - Generisk for alle entity-typer via mapping-dispatcher
- **Verifikation:** Simulér restore (clear anonymized_at + PII tilbage) → kald `_anonymize_employee_apply` med snapshot → master re-anonymiseret + state-rows uændret (idempotent test bestået)
- **Note:** Flyttes til arkiv ved næste revision.

### [G025] HØJ — `retention_cleanup_daily` cron-vej kunne ikke kalde anonymize-RPC (LØST i C002/C003)

- **Beskrivelse:** Cron kaldte `core_identity.anonymize_employee`, som krævede `is_admin()`. Cron har ingen `auth.uid()` → `is_admin()` returnerede false → fejl ved første kandidat. Hele retention-vejen var død i drift.
- **Vision-svækkelse:** §1.4 + §1.5 (driftsikkert).
- **Introduceret:** Trin 3 (`20260514140002_t6_anonymization_crons.sql:88`)
- **Opdaget:** Codex-review 2026-05-14 (C002)
- **Status:** **LØST i `20260514170004_c002_c003_anonymization_dispatcher.sql`** — split-pattern:
  - `_anonymize_employee_apply(uuid, jsonb, text)` — pure UPDATE, service_role only
  - `_anonymize_employee_log_state(uuid, text, jsonb, integer)` — state-INSERT, service_role only
  - `anonymize_employee(uuid, text)` — admin-vej, strict is_admin, kalder apply + log_state
  - `anonymize_employee_internal(uuid, text)` — cron-vej, service_role only via REVOKE/GRANT, kalder apply + log_state
  - Generisk dispatcher-cron læser `anonymization_mappings` + `data_field_definitions`
- **Verifikation:** Indsat termineret synth employee (6 år siden) → `anonymize_employee_internal` kald → anonymized_at sat + first_name='[anonymized]' ✓
- **Note:** Flyttes til arkiv ved næste revision.

### [G011] MELLEM — `verify_anonymization_consistency` kun har employee-branch (LØST i C002/C003)

Generaliseret via dispatcher samme commit som G025/G026. Verify læser nu `anonymization_mappings.anonymized_check_column` og dispatcher dynamic SQL pr. entity_type.

### [G010] MELLEM — `replay_anonymization` kun har employee-branch (LØST i C002/C003)

Generaliseret via dispatcher samme commit som G025/G026. Replay læser nu `anonymization_mappings.internal_rpc_apply` og dispatcher pr. entity_type. Forward-kompat for clients (trin 10) + identity-master (trin 15).

### [G009] HØJ — `retention_cleanup_daily` HARDKODER 1825 dage for employees (LØST i C002/C003)

Generisk evaluator implementeret samme commit som G025/G026. retention-cron læser nu `data_field_definitions.retention_value->>'days_after'` pr. tabel (max over alle event_based-kolonner). Hardkodning fjernet — "alt drift styres i UI" overholdt.

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

### [G017] LAV — Test-artefakter i prod-DB (LØST i H024)

- **Beskrivelse:** 1 syntetisk locked pay_period (2020-01-15→2020-02-14) + 260 commission_snapshots (immutable) + 1 salary_correction (description='smoke test', amount=-100, i 2026-04-15→2026-05-14) + udvidet under afdækning: 1 anonymization_state (C002 test) + 1 anonymized test-employee.
- **Vision-svækkelse:** "Stamme = database" — prod-DB indeholder ikke-prod-data uden klar separation.
- **Introduceret:** Trin 4 (verifikations-test) + C002 (anonymisering-verifikation).
- **Status:** **LØST i H024 build-PR** — engangs cleanup-migration `20260516200000_h024_test_artifact_cleanup.sql` rydder G017-cluster atomically (1 pay_period + 1 candidate_run + 260 snapshots + 1 salary_correction + 1 anonymization_state + 1 anonymized employee) via marker-based DELETE + DISABLE/ENABLE TRIGGER pattern. Mathias-godkendt one-shot pre-cutover-mekanisme (qwerg 2026-05-16). G017-cluster tolkning (b) bekræftet: hele G017-clusteret er test-artefakt, krav-dok's "2 reelle candidate_runs" var faktuelt forkert (kun 1 reel — e8070819 paired med f4c86616).
- **Verifikation:** Migration har pre/post-precondition-assertions; runtime RAISE EXCEPTION hvis count afviger fra forventet eller hvis reelle rows utilsigtet rammes.
- **Note:** Flyttes til arkiv ved næste teknisk-gaeld-revision.

### [G018] LAV — Bygge-status klassifikations-tal er forkerte

- **Beskrivelse:** `docs/strategi/bygge-status.md` siger "207/211/233 klassificerede kolonner" efter trin 1/2/3. Aktuelt i DB: 90 før trin 7, 193 efter. Tallene stammer fra migration-gate's union-count over alle migration-file-INSERTs inkl. fase 0-filer der blev DROP CASCADE'd.
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

### [G031] MELLEM — Lock-pipeline-benchmark mangler (R8b post-lag-E)

- **Beskrivelse:** Master-plan §1.14 + Codex Fund 18 kræver benchmark der måler lock_pipeline SLA &lt;10s gennem fuld pipeline. R8 deferred fordi sales-tabel ikke eksisterer pre-lag-E; compute på 0 rows er ikke et meningsfuldt benchmark.
- **Vision-svækkelse:** §1.14 (driftstabilitet). SLA er udokumenteret indtil real-volume benchmark eksisterer.
- **Introduceret:** DEL 8 R8 deferral 2026-05-15
- **Opdaget:** Codex Fund 18 + R5b/G030-context
- **Skal løses:** R8b — efter sales-tabel + realistic data-volume (lag E / trin 9+, ideelt før cutover-blocker-listen)
- **Risiko hvis glemt:** Mellem. CI-blocker (§3) kan ikke håndhæves uden benchmark-test. Real-volume kan afsløre uventede flaskehalse.
- **Plan (R8b):**
  1. Bygg `core_money.sales`-tabel + realistic seed (~5000 rows/periode)
  2. R8b-test: kør `pay_period_compute_candidate` + `pay_period_lock` på simuleret data
  3. Mål: total varighed &lt;10s (master-plan §1.14 SLA)
  4. Hvis SLA overskrides: profilér + indekser/optimisér før cutover
  5. Tilføj som CI-blocker pr. master-plan §3 (kør på hver PR der ændrer lock-pipeline-kode)

### [G030] MELLEM — `commission_snapshots.sale_id` er `gen_random_uuid()`-placeholder (R5b post-lag-E)

- **Beskrivelse:** R5 (Fund 6) implementerede `FOR UPDATE`-locking i compute_candidate, men **deferred** Fund 5 (deterministic sale_id). `_pay_period_compute_candidate_internal` INSERT'er commission_snapshots-rows med `sale_id := gen_random_uuid()` som placeholder. Reel sale_id er FK til `core_money.sales` (eksisterer ikke før lag E / trin 9+).
- **Vision-svækkelse:** §0 (én sandhed) + §1.6 (snapshot = frosset state). Placeholder sale_id giver illusorisk dependency-tracking — rekompute med samme period_id+employee_id+amount producerer FORSKELLIGE sale_id'er hver gang.
- **Introduceret:** Trin 4 (`20260514150005_t7_lock_pipeline.sql`) + bevaret i R3/R5
- **Opdaget:** Codex Fund 5 (DEL 8 R5 forberedelse)
- **Skal løses:** R5b — efter sales-tabel eksisterer (lag E, ~trin 9+)
- **Risiko hvis glemt:** Mellem. Snapshot mister dependency-link til underliggende sale. Recompute kan ikke verificere "samme input → samme output" på sale-niveau.
- **Plan (R5b):**
  1. Bygg `core_money.sales`-tabel i lag E (trin 9 eller senere)
  2. R5b-migration: refactor `_pay_period_compute_candidate_internal` til at iterere over `core_money.sales` for perioden og bruge `sales.id` direkte
  3. ALTER TABLE commission_snapshots ADD FOREIGN KEY sale_id → core_money.sales(id)
  4. Backfill: hvis pre-cutover skal locked snapshots bevares, kortlæg placeholder→real sale_id; pre-cutover er det fint at slette test-rows og rekomputere
  5. Fitness-check: forbyde `gen_random_uuid()` i compute-internal-funktioner

### [G033] MELLEM — Varig fitness-check for regprocedure-callable-regressioner mangler

- **Beskrivelse:** R7a fixer regprocedure::text-bug i 3 pg_proc-funktioner + 1 cron-body. Ingen aktuel fitness-check fanger fremtidige regressioner. D5 dækker is_active-readers, IKKE regprocedure-pattern. R-runde-2-plan v2 indeholdt false claim om at D5 fanger dette — rettet 2026-05-15.
- **Vision-svækkelse:** Drift-disciplin (§3). Anti-pattern kan re-introduceres uden CI-block.
- **Introduceret:** R-runde-2 planlægning 2026-05-15
- **Opdaget:** Codex v2-validering Fund #5 HØJ
- **Skal løses:** Efter R-runde-2 er færdig (R7a-T1 anvendt)
- **Risiko hvis glemt:** Mellem. Fremtidig RPC med regprocedure::text-bug slipper igennem CI.
- **Plan (G033):**
  1. Ny fitness-check `regprocedure-callable-pattern` i `scripts/fitness.mjs`
  2. Live `pg_get_functiondef` + `cron.job.command`-introspection (samme pattern som D5)
  3. Detect: `::regprocedure` efterfulgt af `::text` i samme function/cron-body uden mellemliggende `pg_proc`-lookup
  4. Skip-when-no-token (CI-only, samme pattern som db-rls-policies + D4 + D5)

### [G034] LAV — V2-recon-scanner matcher kun literal `is_active = true`

- **Beskrivelse:** V2.2-recon-query bruger regex `is_active\s*=\s*true`. Misser semantisk ækvivalente former: `is_active IS TRUE`, `coalesce(is_active, false) = true`, alias-baseret `m.is_active = true`. Hvis fremtidig RPC bruger anden syntaks, slipper den igennem V2 + D5 fitness-check.
- **Vision-svækkelse:** Drift-disciplin (§3). Scanner-præcision.
- **Introduceret:** R-runde-2 planlægning 2026-05-15
- **Opdaget:** Codex v2-validering Fund #1 MELLEM
- **Skal løses:** Vurder når relevant; ikke kritisk for R-runde-2 (live recon dækker aktuel state). Hvis fremtidig RPC bruger non-literal pattern: opdatér scanner.
- **Plan (G034):** Udvid V2.2-pattern + D5-pattern til at også matche `IS TRUE`, `coalesce(_, ...) = true`, eller migrér til AST-baseret PG-parser hvis kompleksitet stiger.

### [G035] LAV — D5 checker globalt pr. function-body, ikke pr. occurrence

- **Beskrivelse:** D5-pattern: `pg_get_functiondef(...) ~* 'is_active.*true' AND !~* 'status.*active'`. False-negative hvis én funktion har ÉN compliant reader (`status='active' AND is_active=true`) og ÉN non-compliant reader (kun `is_active=true`). Function-body som helhed matcher begge mønstre → check passerer.
- **Vision-svækkelse:** Drift-disciplin (§3). Granulariteten af checken.
- **Introduceret:** R-runde-2 planlægning 2026-05-15
- **Opdaget:** Codex v2-validering Fund #5 MELLEM
- **Skal løses:** Vurder når relevant; aktuelt har vi ingen funktion med mixed pattern (R7d normaliserer alle readers).
- **Plan (G035):** Per-occurrence-detection via AST eller regex split af SELECT/WHERE-blokke. Eller: kør D5 + dokumentér antagelsen om at funktioner enten har alle compliant eller ingen.

### [G036] MELLEM — R7a+R7d cron-reschedule race-window

- **Beskrivelse:** R7a opdaterer `retention_cleanup_daily` cron-body (regprocedure fix). R7d opdaterer samme cron-body igen (is_active+status). Hvis cron fyrer i mellem to migrations, kan den ramme partial state. Sandsynlighed lav (cron kører kl. 02:30, migrations anvendes typisk udenfor cron-window) men ikke nul.
- **Vision-svækkelse:** Driftstabilitet (§1.14).
- **Introduceret:** R-runde-2 planlægning 2026-05-15
- **Opdaget:** Codex v2-validering Fund #2 MELLEM
- **Skal løses:** Vurder i implementation. Option A: kombinér cron-body-ændringer i én migration (én cron.unschedule + cron.schedule). Option B: cron.unschedule jobid=10 først; reschedule til sidst.
- **Plan (G036):** Implementér Option A — kombinér R7a's cron-body-fix + R7d's reader-fix i ét cron.unschedule + cron.schedule kald. Eller flag som G036-deferred hvis implementation viser at to separate migrations er nødvendige af andre grunde.

### [G037] MELLEM — R7d backfill mangler session-vars for audit-spor

- **Beskrivelse:** R7d-backfill skitse bruger ikke fuldt session-var-mønster (stork.allow\_\*\_write, source_type, change_reason) der etableret i P2/P3. Backfill-UPDATE kører som migration med implicit context, hvilket gør audit-trail svagere end runtime-mønstret.
- **Vision-svækkelse:** Audit-bevares (§1.3).
- **Introduceret:** R-runde-2 planlægning 2026-05-15
- **Opdaget:** Codex v2-validering Fund #4 MELLEM
- **Skal løses:** I R7d-implementation. Tilføj eksplicit session-var-block før UPDATE.
- **Plan (G037):** R7d-migration starter med:
  ```sql
  select set_config('stork.source_type', 'migration', false);
  select set_config('stork.allow_anonymization_mappings_write', 'true', false);
  select set_config('stork.allow_break_glass_operation_types_write', 'true', false);
  select set_config('stork.change_reason', 'R7d: ryd is_active drift (Codex Fund #3)', false);
  -- så UPDATE'er
  ```

### [G038] LAV — cron.unschedule via navn-lookup vs jobid-lookup

- **Beskrivelse:** R7a + R7d bruger `cron.unschedule('retention_cleanup_daily')` — navn-baseret. Hvis cron-extension API ændrer eller jobname duplikerer, kan unschedule fejle eller ramme forkert job. jobid-lookup (`select jobid from cron.job where jobname = ... limit 1`) er mere robust.
- **Vision-svækkelse:** Driftstabilitet (§1.14).
- **Introduceret:** R-runde-2 planlægning 2026-05-15
- **Opdaget:** Codex v2-validering Fund #2 MELLEM (første del)
- **Skal løses:** I R7a/R7d-implementation. Brug jobid-lookup hvor muligt; håndtér missing job-case eksplicit.
- **Plan (G038):** Pattern:
  ```sql
  do $$ declare v_id bigint;
  begin
    select jobid into v_id from cron.job where jobname = 'retention_cleanup_daily' limit 1;
    if v_id is not null then perform cron.unschedule(v_id); end if;
  end $$;
  ```

### [G039] LAV — V1 PostgREST-test bør køres med både anon og authenticated

- **Beskrivelse:** Codex v2 anbefaler at V1 PostgREST-eksponerings-test køres både med anon-key OG authenticated JWT. Aktuelt plan-beskrivelse nævner kun anon. authenticated kan have anderledes attack-surface (RLS-context, JWT-claims).
- **Vision-svækkelse:** Sikkerheds-disciplin (§1.1).
- **Introduceret:** R-runde-2 planlægning 2026-05-15
- **Opdaget:** Codex v2-validering Fund #6 MELLEM
- **Skal løses:** Mathias kører HTTP-test efter implementation med begge auth-modes.
- **Plan (G039):** V1 curl-instruks udvides med to kald — anon + authenticated JWT — begge mod `/rest/v1/rpc/set_config`. Forventet output: 404 fra begge. Hvis ikke: stop-protokol.

### [G040] LAV — Option D PostgREST-schema-isolation skal verificere faktisk deployed API config

- **Beskrivelse:** Stop-protokol Option D antager PostgREST kun eksponerer `public, graphql_public` schemas. Det er repo-antagelse baseret på Supabase-defaults, ikke verificeret mod deployed API config. Hvis Supabase project-config ændrer `db-schemas` til at inkludere pg_catalog (usandsynligt men muligt), så er antagelsen ugyldig.
- **Vision-svækkelse:** Sikkerheds-disciplin (§1.1).
- **Introduceret:** R-runde-2 planlægning 2026-05-15
- **Opdaget:** Codex v2-validering Fund #7 MELLEM
- **Skal løses:** Vurder i Option D-aktivering. Verificér Supabase API-config via management API: `GET /v1/projects/<ref>/api`.
- **Plan (G040):** Hvis V1 afslører eksponering OG Option D aktiveres: tilføj fitness-check der scanner deployed API-config + alerter hvis pg_catalog tilføjes til db-schemas.

### [G042] MELLEM — Replay-shape mismatch: nested (P1b) vs flat (`_anonymize_employee_apply`)

- **Beskrivelse:** `anonymize_generic_apply` (P1b) gemmer `anonymization_state.field_mapping_snapshot` i nested shape (`{"first_name":{"strategy":"blank","strategy_id":"..."}}`). `_anonymize_employee_apply` (legacy; kaldt af replay_anonymization via `anonymization_mappings.internal_rpc_apply`) læser flat shape (`p_strategies->>'first_name'` skal returnere `'blank'`).
- **Reel impact:** Replay af anonymization der er udført via post-P1c flow (anonymize_employee → anonymize_generic_apply) vil fejle — `->>` returnerer JSON-string-værdi, ikke strategy-name → `apply_field_strategy` får forkert input. Replay af pre-P1c-state (eller test-seeded legacy shape) virker.
- **Pre-cutover-state:** Ingen produktion-data; ingen aktuelle nested-state-rows. Bug er latent.
- **Introduceret:** P1b (anonymize_generic_apply gemmer nested shape) + Q-pakke (mappings.internal_rpc_apply peger stadig på legacy `_anonymize_employee_apply`)
- **Opdaget:** R7h Test 2 plan-arbejde 2026-05-15 (Codex v2 Fund #4 om snapshot-shape)
- **Skal løses:** Før første post-cutover replay-kørsel hvor anonymization er udført via post-P1c flow.
- **Plan:** Tre options:
  1. Opdatér `_anonymize_employee_apply` til at læse begge shapes (legacy flat + nested) via shape-detection
  2. Opdatér `replay_anonymization` til at konvertere nested→flat før dispatcher-call
  3. Drop `_anonymize_employee_apply` helt og refactorér replay til at kalde `anonymize_generic_apply` direkte (kræver signatur-alignment + er ny entry-vej for nested-readable)
- **R7h-håndtering:** Test 2 bruger Strategi A (seed legacy flat-shape direkte i anonymization_state) for at isolere R7a regprocedure-fix. Replay-shape-bug testes IKKE i R7h.

### [G041] LAV — Retention cron e2e-test bør eksekvere faktisk scheduled command

- **Beskrivelse:** `smoke/r7a_retention_cleanup_cron_e2e.sql` (planlagt i T1) eksekverer kopieret helper-logic, ikke selve cron.job-command'en. Hvis cron-body afviger fra helper (fx. error-handling-block), kan test passere mens reel cron fejler.
- **Vision-svækkelse:** Test-coverage (§3 — CI-disciplin).
- **Introduceret:** R-runde-2 planlægning 2026-05-15
- **Opdaget:** Codex v2-validering Fund #8 MELLEM
- **Skal løses:** I T1-implementation. Test skal hente cron.job.command via SELECT og eksekvere den, ikke kopiere.
- **Plan (G041):** Test-pattern:
  ```sql
  do $$ declare v_command text;
  begin
    select command into v_command from cron.job where jobname = 'retention_cleanup_daily';
    execute v_command;  -- eksekver selve cron-bodyen
    -- verificér side-effects
  end $$;
  ```

### [G043] MELLEM — r3_commission_snapshots_immutability test mangler cleanup-strategi (LØST i H024)

- **Symptom:** INSERT pay_period med `current_date + interval '5 years 30 days'` konflikter med stale data ved gentagne kørsler samme dag.
- **Konsekvens:** CI bliver pålideligt rød efter første grønne kørsel hver dag på testens dato-vindue.
- **Introduceret:** Trin 3 / R3 — test-pattern arvet uden idempotens-tjek.
- **Opdaget:** 2026-05-15 i H010 PR CI-fail.
- **Status:** **LØST i H024 build-PR** — arkitektur-fix (a) valgt: r3-testen wrappet i `begin; ... rollback;`. H022.1 random-offset rullet tilbage til fixed dato `'2199-01-01'` (far-future, tx-rollback sikrer ingen persistens). Ny fitness-check `db-test-tx-wrap-on-immutable-insert` håndhæver tx-wrap-disciplin fremover (CI-blocker 20 i master-plan §3, rettelse 34). Random-offset workaround droppet — arkitektur-fix er valid.
- **Historik:** H022 fixed-shift (`'5 years'` → `'6 years 6 months'`) flyttede problem 18 måneder. H022.1 random-offset (base 10y + spread 0-3650d) reducerede kollisions-sandsynlighed til ~0.8% pr. par men var stadig workaround. Begge erstattet af H024's tx-rollback + fitness-check.
- **Note:** Flyttes til arkiv ved næste teknisk-gaeld-revision.

### [G044] MELLEM — pay_periods-INSERT-tests har ingen cleanup-mekanisme (LØST i H024)

- **Symptom:** Tests der INSERT'er i `core_money.pay_periods` kan ikke ryddes op via DELETE pga. `pay_periods_lock_and_delete_check`-trigger der raiser `P0001`. Triggeren håndhæver vision-princip 9.
- **Berørte tests (kendt):** `r3_commission_snapshots_immutability` (G017's salary_correction er prod-DB-rest, ikke fra dedikeret test). Tidligere fejl-reference til `r4_salary_corrections_cleanup` rettet.
- **Introduceret:** Trin 4 / C4.
- **Status:** **LØST i H024 build-PR** — samme rod-årsag som G043, samme løsning: tx-rollback wraps test-INSERTs så DELETE-blokering aldrig trigges. Cleanup-migration rydder eksisterende stale rows (inkl. 28 pay_periods-test-artefakter). Fitness-check fremover.
- **Også berørt af samme fix:** p1a*anonymization_strategies-test (skabte 38 stale `p1a_smoke_t5*\*`-strategier pr. CI-kørsel pga. samme manglende tx-wrap; identificeret under H024-afdækning).
- **Note:** Flyttes til arkiv ved næste teknisk-gaeld-revision.

### [G046] MELLEM — Fitness-check fanger ikke manglende table grants ved policy-tilføjelse

- **Beskrivelse:** RLS-policy og SQL table-privileges er ortogonale. T9 build tilføjede SELECT-policies på 6 write-tabeller uden tilsvarende GRANT INSERT/UPDATE — RPCs fejlede med "permission denied for table" før session-var-policy kunne evaluere. Codex runde 3 fundet (T9-fundament-supplement). Fitness-check `write-policy-session-var-consistency` validerer policy-form, men ikke at GRANT er på plads.
- **Vision-svækkelse:** Drift-disciplin (§3). Plan-vs-kode-drift kan smutte igennem CI.
- **Introduceret:** T9-build (Step 1 + Step 6 + Step 7 hver tilføjede SELECT-only grants). T9-fundament-supplement fixede ad hoc.
- **Skal løses:** Når næste pakke tilføjer policies på en ny write-tabel.
- **Risiko hvis glemt:** Mellem. Manifesterer som "permission denied for table" ved første kald — fanget ved manuel test, ikke CI.
- **Plan (Mønster):** Udvid `write-policy-session-var-consistency` eller ny check der scanner `create policy ... for insert/update/delete` og verificerer at samme tabel har matchende `grant insert/update/delete to <role>`-statement. Falsk-positiv-risiko: medium (kan kræve allowlist for tabeller med policy uden grant by design). Implementation-kompleksitet: lav.

### [G047] MELLEM — DB-tests kører mod live remote DB (ingen isoleret test-DB)

- **Beskrivelse:** `scripts/run-db-tests.mjs:15` peger på samme Supabase-project som production (`imtxvrymaqbgcvsarlib`). DB-tests kører mod live remote via Management API. Konsekvens under T9-build: 3 admin-merges med rød CI (PR #36-38) fordi DB-tests fejlede chicken-and-egg ved partial T9-deploy (M1 + r7b smoke-tests forventede T9-tabeller der først blev oprettet efter merge + push).
- **Vision-svækkelse:** Drift-disciplin (§3). CI-rød accepteres som "ventet" hvilket svækker signal-værdi.
- **Introduceret:** Trin 1 (run-db-tests-script + CI-workflow).
- **Skal løses:** Før næste større pakke der ændrer schema (T9-supplement, trin 10+).
- **Risiko hvis glemt:** Mellem. Future bugs i applied migrations manifesterer sig som DB-test-fejl på efterfølgende PRs uden mulighed for at fixe i PR'en.
- **Plan:** Provisioning af separat Supabase-project (eller Supabase branching-feature på Pro+); CI-step der applier alle migrations til test-DB før db:test; sekret SUPABASE_TEST_PROJECT_REF + SUPABASE_TEST_ACCESS_TOKEN; run-db-tests.mjs udvidet med project-ref-valg.

### [G048] LAV — Step 3's fil-as-applied indeholder buggy closure-rebuild CTE

- **Beskrivelse:** `supabase/migrations/20260518000002_t9_org_node_closure.sql:71` har `join nodes_now n on n.node_id = ac.descendant_id` (skulle have været `ac.ancestor_id`). Bug fixed via CREATE OR REPLACE i Step 12 (000010_t9_seed_owners.sql). Step 3's fil er applied til remote — append-only-disciplin forhindrer in-place fix.
- **Vision-svækkelse:** Lav — kosmetisk i historik-perspektiv; runtime-funktionalitet er korrekt fra Step 12 og frem.
- **Introduceret:** T9-build (Step 3, applied 2026-05-18).
- **Skal løses:** Ingen aktiv handling — dokumentation tilstrækkelig.
- **Risiko hvis glemt:** Lav. Developer der læser Step 3's fil ser buggy kode "as applied" uden at vide om fix-location.
- **Spor til fix-location:** G048 selv + bygge-status.md "Vores trin 5"-detalje-sektion + T9 slut-rapport (`docs/coordination/rapport-historik/2026-05-18-t9.md`) dokumenterer bug-klassen og fix-location i Step 12. Inline kommentar i Step 3-filen overvejet, ikke leveret (ville kræve modifikation af applied migration-fil; rejected per append-only).

### [G049] MELLEM — Apply-dispatcher-extension-pattern ikke formaliseret i plan-skabelon

- **Beskrivelse:** T9 introducerede dispatcher-extension-pattern (CREATE OR REPLACE pr. step der tilføjer WHEN-klause til CASE-statement i `pending_change_apply`). Step 1's "tomme dispatcher" var invalid plpgsql (CASE uden WHEN); fanget først ved første db push. Plan V6 nævnte mønstret men formaliserede ikke "CASE-statement kræver mindst én WHEN i Postgres".
- **Vision-svækkelse:** Drift-disciplin — pattern dokumenteret bagefter, ikke før build.
- **Introduceret:** Plan V6 (T9-plan).
- **Skal løses:** Næste pakke der bruger dispatcher-extension.
- **Risiko hvis glemt:** Mellem. Samme bug-klasse kan ramme andre pakker.
- **Plan:** Plan-skabelon (`docs/skabeloner/plan-skabelon.md`) opdateres med pattern-checklist for CREATE OR REPLACE FUNCTION: signatur-bevarelse (DEFAULTs, arg-count), CASE-statement-minimums-WHEN, record-INTO-field-restriction.

### [G050] MELLEM — Plan V6 mangelfuldt om RLS write-policy-strategi

- **Beskrivelse:** Plan V6 specificerede SELECT-policies + FORCE RLS + SECURITY INVOKER-RPCs for T9-write-veje, men ikke INSERT/UPDATE-policies eller GRANT-statements. Konsekvens: 11 write-RPCs kunne ikke skrive fra authenticated-kontekst. Fixed retroaktivt i T9-fundament-supplement (PR #39) ved at implementere §1.1's session-var-pattern eksplicit.
- **Vision-svækkelse:** "Rettigheder der virker" — fundament-niveau lacuna i Plan V6.
- **Introduceret:** Plan V6.
- **Skal løses:** Fremadrettet — plan-skabelon skal kræve eksplicit policy-strategi pr. write-tabel.
- **Risiko hvis glemt:** Mellem. Næste pakke med write-RPCs kan have samme lacuna.
- **Plan:** Plan-skabelon udvides med "Write-policy-checklist": for hver write-tabel skal planen specificere INSERT/UPDATE/DELETE-policies + session-var + GRANTs.

### [G051] LAV — Pre-T9 funktioner redefineret uden eksplicit signatur-diff

- **Beskrivelse:** T9-build redefinerede `has_permission` (Step 11) uden at læse pre-T9-signatur. Konsekvens: `cannot remove parameter defaults from existing function` (42P13). Samme klasse: `role_page_permission_upsert` revoke med 6 args mod 7-arg eksisterende signatur. Begge fanget ved push.
- **Vision-svækkelse:** Drift-disciplin.
- **Introduceret:** T9-build (Step 11).
- **Skal løses:** Næste pakke der CREATE OR REPLACE'er pre-existing functions.
- **Risiko hvis glemt:** Lav (build-time-fanget) men gentager bug-klasse.
- **Plan:** Fitness-check der scanner alle CREATE OR REPLACE FUNCTION i migration-filer; sammenligner argument-signatur (inkl. DEFAULTs) med pre-existing definition (live introspection); fejler hvis defaults fjernes eller arg-count ændres. Implementation-kompleksitet: medium.

### [G056] MELLEM — `codex-overvaagning.md` rolle-grænse er selv-modsigende for forretnings-dokument-modsigelser

- **Beskrivelse:** `docs/coordination/overvaagning/codex-overvaagning.md:24,76,104` siger eksplicit at forretnings-dokument-konflikter (vision-princip, master-plan, mathias-afgørelser, krav-dok) er "OUT OF SCOPE — Claude.ai's bord", og Codex skal markere + fortsætte uden at blokere. Men `:136-140` lader severity-listen KRITISK dække "...ELLER modsiger forretnings-dokument-rammen (vision, master-plan, mathias-afgørelser, krav-dok). STOPPER plan i alle runder." og NEEDS-MATHIAS dække "modsigelse mellem to forretnings-dokumenter".
- **Vision-svækkelse:** Rolle-disciplin (Codex = kode, Claude.ai = forretning). Hvis Codex kan markere forretnings-konflikter som KRITISK/NEEDS-MATHIAS, så er rollen ikke ren — det fjerner pointen med dobbelt-port-review.
- **Introduceret:** Lag 1 build (PR #48) + PR #52 (NEEDS-MATHIAS-tilføjelse). Spotted af Codex selv 2026-05-20 i meta-review af PR #52.
- **Skal løses:** Lag 2 eller mini-disciplin-pakke. Beslut autoritativt: enten (a) Codex MÅ markere forretnings-konflikter som KRITISK med tvungen "OUT OF SCOPE"-prefix (og ikke blokere), ELLER (b) fjern forretnings-modsigelse fra Codex' severity-listen helt og lad alle sådanne fund gå via OUT OF SCOPE-vejen.
- **Risiko hvis glemt:** MELLEM. Codex kan utilsigtet blokere plan på forretnings-konflikt der burde være Claude.ai's bord — det skaber friktion i parallelt review.

### [G055] MELLEM — `scripts/codex-review.sh` marker-parser fanger ikke severity-prefixes alene

- **Beskrivelse:** `scripts/codex-review.sh:206-260` tjekker for V5.3 halt-markers (`BRUD-PAA-KRAV`, `TEKNISK-BLOKERING`, `PLAN-AFVIGELSE`, `KRITISK-SIKKERHEDSHUL`, `WORKAROUND-INTRODUCERET`, `STOP-FOR-CLARIFICATION`, `ESCALATE`, `AUTO-ESKALATION`) som exit-2-trigger. Severity-prefixes (`KRITISK:`, `MELLEM:`, `LAV:`, `HUL:`) som overvaagning-filerne kræver bliver ikke parset selvstændigt. En ren `KRITISK: <fund>`-linje uden halt-marker giver exit 0, selvom `docs/coordination/overvaagning/codex-overvaagning.md:136` siger "KRITISK ... STOPPER plan i alle runder".
- **Vision-svækkelse:** Disciplin-håndhævelse. Driftsikkerhed: hvis Codex leverer et reelt KRITISK-fund uden at kombinere med halt-marker, så ser scriptet det ikke som blokerende — Code kan eksekvere videre på forkerte præmisser.
- **Introduceret:** Lag 1 build (PR #48 V5.3 marker-protokol). Spotted af Codex selv 2026-05-20 i meta-review af PR #52.
- **Skal løses:** Lag 2 eller mini-disciplin-pakke. To valgmuligheder:
  - (a) Udvid parser med `^KRITISK:` → exit 2 mapping (severity-baseret blokering parallelt til halt-marker)
  - (b) Krav-pakke til codex-overvaagning: KRITISK SKAL altid kombineres med tilsvarende halt-marker (`KRITISK — BRUD-PAA-KRAV:` osv.). Faktisk runde 1-output i PR #52 fulgte (b)-mønstret allerede ("MELLEM — PLAN-AFVIGELSE: ..."), så (b) er måske den faktisk-praktiserede disciplin der mangler dokumentation.
- **Risiko hvis glemt:** MELLEM. Latent — sandsynligvis afhænger af Codex' egen disciplin om at kombinere severity+marker. Bør ikke leve på konvention alene.

### [G052] LAV — Vej B i PR #40 skabte præcedens for "ret merged-til-main migration når ej applied"

- **Beskrivelse:** PR #40 rettede `20260518000011_t9_classify.sql` (84 rows fra `{"days":2555}` til `{"max_days":2555}`) trods filen var merged til main. Begrundelse: atomic rollback ved første push betød filen aldrig var applied til remote — ingen historisk DB-state at beskytte. Mathias-godkendt 2026-05-19 som "Vej B".
- **Vision-svækkelse:** Append-only-disciplin er nu kontekst-afhængig (merged ≠ applied).
- **Introduceret:** PR #40 (2026-05-18).
- **Skal løses:** Append-only-disciplin-dokumentation skal afspejle nuancen.
- **Risiko hvis glemt:** Lav. Vej B er sjælden (kræver atomic rollback). Men mangler regel kan friste til oversnedig brug.
- **Plan:** Append-only-sektion i `docs/strategi/arbejds-disciplin.md` udvides: "Filer merget til main MEN ikke applied til remote (atomic rollback) kan rettes direkte med eksplicit Mathias-godkendelse. Vej A (repair --status applied + ny fix-migration) er default; Vej B (ret filen) kræver eksplicit beslutning."

### [G054] LØST i PR claude/G054-type-codegen — type-codegen for alle eksponerede API-schemas

- **Beskrivelse:** T9-supplement V4 Step 6 krævede `pnpm types:generate` + fjernet placeholder-guard + committede typer. Oprindeligt diagnosticeret som blokeret af Dashboard-eksponering (PGRST202 fra `core_identity`). Efter Dashboard-eksponering 2026-05-19 viste det sig at G054 havde to-delt rod, ikke kun én: (a) `core_identity` ikke eksponeret via PostgREST, (b) `pnpm types:generate`-scriptet brugte `supabase gen types --linked` uden `--schema`-flag, hvilket defaulter til kun `public`. Konsekvens: selv efter exposure ville typer kun dække `public`, ikke `core_identity`/`core_compliance`/`core_money`.
- **Vision-svækkelse:** Type-safety på tværs af eksponerede schemas. RPC-callere uden type-checking = misuse-risiko.
- **Introduceret:** T9-build (PR #34) introducerede `core_identity` uden type-coverage; samme klasse uadresseret for `core_compliance` (T6/T7) og `core_money` (T7). Opdaget ved T9-supplement Codex review (PR #44 runde 1 MELLEM 3) som T9-symptom; rod-bredden afsløret under diagnose 2026-05-19.
- **Løsning (PR claude/G054-type-codegen):**
  1. Nyt fælles `scripts/types-gen.sh` med schema-liste som single source of truth: `public,core_identity,core_compliance,core_money` (alle 4 eksponerede API-schemas verificeret via remote `pg_namespace` + Dashboard).
  2. `pnpm types:generate` og `pnpm types:check` bruger samme script (write-mode hhv. check-mode) — schema-listen kan ikke drive fra hinanden.
  3. `packages/types/src/database.ts` regenereret med alle 4 schemas (3174 linjer).
  4. Placeholder-skip-blok fjernet (gammel `scripts/types-check.sh` slettet i samme commit).
- **Verifikation:** `pnpm types:generate`, `pnpm types:check`, `pnpm format:check`, `pnpm typecheck` alle grøn lokalt. CI grøn på PR-head.

### [G053] LØST i PR #43 / T9-test-fixture-hardening — T9-smoke-tests refaktoreret til hermetisk-fixture-kontrakt

- **Beskrivelse:** Alle 6 T9-smoke-tests havde table-existence guards (tilføjet under T9-build for at undgå fail pre-deploy). Under build skipped testene → falsk grøn. Først post-deploy (efter PR #40) prøvede testene at køre rigtigt og afslørede design-bugs. 4 lag af fail under PR #43-CI: (1) M1 superadmin manglede permission-rows for T9-RPCs, (2) `t9_grants_and_helpers` `roles where name = 'admin'` skulle være `'superadmin'` (R1B), (3) `t9_grants_and_helpers` direkte INSERT i `employee_node_placements` for mg@/km@ brød partial UNIQUE pga. Step 12 seed, (4) `t9_placements` `_apply_employee_place` på seed-employee brød CHECK-constraint pga. backdated effective_from (Codex KRITISK 4 manifesteret).
- **Vision-svækkelse:** Rettigheder der virker + drift-disciplin. Tests der ikke faktisk kører er værre end ingen tests.
- **Introduceret:** T9-build (PR #34, smoke-tests). Manifesteret post-deploy.
- **Løsning (PR #43 d7aa835, T9-test-fixture-hardening):** Hermetisk-fixture-kontrakt etableret. Mutable fixtures skal være transaction-local throwaway data; seed-users må kun bruges read-only som auth-caller for at nå authorized wrapper-paths. Konkret leveret:
  1. Alle 6 T9-tests refaktoreret + re-enabled (ingen `.sql.disabled` tilbage):
     - `t9_grants_and_helpers.sql`: throwaway-rolle + 2 throwaway-employees + uuid-suffixed permission-elements
     - `t9_placements.sql`: throwaway pending-actors + assertions filtrerer på fixture-IDs
     - `t9_org_nodes.sql`: throwaway pending-actors + uuid-suffixed node-navne
     - `t9_pending_changes.sql`: throwaway employees + uuid-suffixed change_type for `undo_settings`
     - `t9_org_node_closure.sql`: skip-guard fjernet (ingen seed-afhængighed)
     - `t9_public_wrapper_rpcs.sql`: Vej D — split test i unauthenticated (42501) + authorized superadmin context (22023) via generisk superadmin-lookup + `request.jwt.claim.sub`
  2. Alle 6 tests verificeret 2x mod live remote via MCP `execute_sql` med `BEGIN/ROLLBACK` — begge runs pass uden seed-cleanup.
  3. Tre fitness-værn håndhæver kontrakten i CI:
     - `db-test-no-disabled-sql` — `.sql.disabled` må ikke merges
     - `db-test-no-t9-seed-user-fixtures` — `t9_*.sql` må ikke bruge mg@/km@ som mutable fixture (allowlist via `-- allow-bootstrap-seed-user-test: <reason>`)
     - `db-test-no-t9-skip-guards` — `t9_*.sql` må ikke indeholde `information_schema.tables`-lookup eller `pre-migration state ... skipping`-mønstre
  4. `TX_WRAP_REQUIRED_FOR_TEST_INSERT` udvidet med 9 T9 mutable state-tabeller (`org_nodes`, `org_node_versions`, `employee_node_placements`, `client_node_placements`, `pending_changes`, `role_permission_grants`, `permission_areas/pages/tabs`) — låser BEGIN/ROLLBACK-mønstret for fremtidige tilføjelser.
  5. `supabase/tests/README.md` udvidet med T9-fixture-regel-sektion + reference til de 3 værn + TX_WRAP-listen.
  6. Negativ-tests verificeret: alle 3 nye værn fejler korrekt på syntetiske overtrædelser.

### [G045] LAV — Fitness-check `db-test-tx-wrap-on-immutable-insert` fanger ikke RPC-side-effects

- **Beskrivelse:** H024's nye fitness-check (CI-blocker 20) scanner direkte `INSERT INTO <immutable-tabel>` i `supabase/tests/**/*.sql`. Tests der INSERT'er indirekte via RPC-kald (fx `perform core_identity.anonymize_employee(...)` der internt INSERT'er i `anonymization_state`, eller `perform core_compliance.break_glass_execute(...)` der INSERT'er i `break_glass_requests`) bliver IKKE fanget.
- **Vision-svækkelse:** Drift-disciplin (§3). En non-idempotent test der bruger RPC-side-effects kan smutte ind uden CI-blokering. Reduceret af konvention: alle r7a-tests bruger RPC + er allerede tx-wrappede.
- **Introduceret:** H024 (kendt afgrænsning fra plan-fasen).
- **Skal løses:** Vurder når relevant. Lag E's tests vil sandsynligvis bruge RPC'er; udvidelse til Mønster D (RPC-side-effect-scan) kan blive nødvendigt.
- **Risiko hvis glemt:** Lav-mellem. Tx-rollback-konvention etableret; reviewer-disciplin fanger sandsynligvis manglende wrap i RPC-tests.
- **Plan (Mønster D):** Parse pg_proc-bodies via PG-parser eller live introspection af RPC-graf; identificér RPC'er der INSERT'er i immutable tabeller; tilføj allowlist. Implementation-kompleksitet: HØJ. Falsk-positiv-risiko: lav. Falsk-negativ-risiko: lav (med vedligeholdt allowlist).

---

## Løst gæld (arkiv)

### [G019] LAV — `stork_audit` antog uuid PK; singletons med smallint/integer PK var ikke testet

- **Beskrivelse:** Audit-trigger castede `to_jsonb(new)->>'id'` til uuid uden type-tjek. `pay_period_settings.id` (smallint) og `superadmin_settings.id` (integer) var bootstrappet før audit-trigger blev attached, så bug'en blev ikke opdaget før første UPDATE.
- **Vision-svækkelse:** "Anonymisering bevarer audit" + "Én sandhed" — singletons kunne ikke opdateres uden audit-bypass.
- **Introduceret:** Trin 1 (`20260514120003_t1_audit_partitioned.sql:143`)
- **Opdaget:** 2026-05-14 ved G012-mitigation (UPDATE på pay_period_settings)
- **Løst:** `20260514160000_t1_inline_fix_audit_non_uuid_id.sql` — TRY/CATCH omkring uuid-cast. record_id=NULL ved non-uuid PK; id-værdien bevares i old/new_values jsonb. Audit-trail intakt.
- **Arkiveret:** 2026-05-16 (H020 M12).
