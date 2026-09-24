# Stork 2.0 — Teknisk gæld

<!-- governance-owns: kode-gaeld -->

**Formål:** Liste af kendt teknisk gæld der svækker visionen (én sandhed, styr på data, eksplicit sammenkobling, stamme=database, beregning over databasen, rettigheder der virker, anonymisering bevarer audit, alt drift styres i UI). Vedligeholdes efter hvert trin. Ny gæld tilføjes ved introduktion; løst gæld flyttes til arkiv.

**Severitet:**

- **Høj** — direkte brud på vision-princip
- **Mellem** — kompromis med dokumenteret plan
- **Lav** — kosmetisk/strukturel, ufuldstændig på en acceptabel måde

**Sidste opdatering:** 2026-09-24 (oprydningen efter workflow-planen: G018/G029/G036/G037/G038/G041/G046/G058 lukket, G063 lukkes sammen med governance-tjekket, G006 afgrænset, døde henvisninger rettet, G067-G082 rejst)

---

## Åben gæld

### [G082] LAV — migration-gate ser ikke dynamisk DDL; audit-filteret gennemgår ikke jsonb generelt

- **Beskrivelse:** (1) `scripts/migration-gate.mjs` finder kolonner i `CREATE TABLE`/`ALTER TABLE ADD COLUMN`-tekst; DDL bygget med `EXECUTE format(...)` ses ikke. (2) `core_compliance.audit_filter_values` har kun specialtilfældet `core_identity.clients.fields` for jsonb (`20260521000004_t10_audit_filter_values.sql`, kommentaren l.129); andre jsonb-kolonner med PII gennemgås ikke.
- **Vision-svækkelse:** Princip 2 (styr på data).
- **Introduceret:** Fundamentet. Synliggjort i recon (pakke 1).
- **Skal løses:** (1) forbud mod eller tjek af dynamisk DDL i migrationer; (2) generisk jsonb-gennemgang, når næste jsonb-felt med PII kommer.
- **Risiko hvis glemt:** Lav.
- **Løses-i:** den pakke der indfører næste jsonb-felt med PII eller dynamisk DDL.

### [G081] LAV — stille ikke-afvisninger i anonymiserings- og retention-vejen

- **Beskrivelse:** Retention-jobbet springer uden fejl over tabeller uden `event_based`-klassifikation og mappings der ikke er `status='active' AND is_active=true` (`20260515130000_r7a_regprocedure_callable_fix.sql` l.331-339, 247-249).
- **Vision-svækkelse:** Princip 2 (styr på data) — et fravalg ser ud som et vellykket job.
- **Introduceret:** R7a/fundamentet. Synliggjort i recon.md:152, 279 (pakke 1).
- **Skal løses:** Jobbet rapporterer oversprungne tabeller/mappings (heartbeat/audit), så det kan ses i drift.
- **Risiko hvis glemt:** Lav før rigtige retention-regler er aktiveret.
- **Løses-i:** før cutover (sammen med G069).

### [G080] LAV — ingen lint for hardkodede satser (`disciplin.md` §7 invariant 4)

- **Beskrivelse:** Invariant 4 "Ingen hardkodede satser/lønarter" håndhæves af Codex- og Claude-tjek; "lint bygges i senere spor" (`disciplin.md` l.232). Der fandtes ingen G-post (grep i dette register: 0).
- **Vision-svækkelse:** Princip 3 (forretningslogik som data).
- **Introduceret:** disciplin §7.
- **Skal løses:** Lint/fitness-tjek for hardkodede satser i kode.
- **Risiko hvis glemt:** Lav før formel-systemet findes.
- **Løses-i:** senest ved trin 13 (formel-system).

### [G079] MELLEM — destruktive drops (`disciplin.md` §3.9) håndhæves ikke mekanisk

- **Beskrivelse:** §3.9 kræver tom-check, reference-check, audit-spor og rollback-plan for `DROP TABLE/COLUMN`, `TRUNCATE`, `DELETE` uden WHERE, og siger "Post-cutover: alle fire er CI-blocker". Der findes intet mekanisk tjek (`scripts/migration-gate.mjs`: 0 træf på DROP/TRUNCATE); i dag bærer reviewet det.
- **Vision-svækkelse:** "Stork rører løndata" — den dyreste fejl-klasse.
- **Introduceret:** §3.9 (genindført); løftet om CI-blocker står kun i disciplin.
- **Skal løses:** CI-tjek for de fire krav.
- **Risiko hvis glemt:** Mellem før cutover, høj efter.
- **Løses-i:** før cutover.

### [G078] MELLEM — »Schema drift check« i CI tjekker intet

- **Beskrivelse:** `supabase/schema.sql` er stadig en pladsholder (3 linjer, `-- PLACEHOLDER`), og `scripts/schema-check.sh` l.11-14 slutter med 0 på markøren. Trinnet i `ci.yml` (l.143-145) er derfor grønt uden at tjekke noget. Desuden dumper scriptet kun `--schema public` (l.19), mens alle rigtige tabeller ligger i core_* (dem dækker kun `types:check`).
- **Vision-svækkelse:** Én sandhed — et grønt trin der intet tjekker.
- **Introduceret:** Fase 0 (pladsholderen blev aldrig erstattet).
- **Skal løses:** Gøres reelt (pull + core_*-schemas) eller fjernes.
- **Risiko hvis glemt:** Mellem. Falsk tryghed om skema-drift.
- **Løses-i:** pakke 1, trin 2 (workflow-planen §3).

### [G077] MELLEM — testbiblioteket: race-tests kaster altid, HTTP-svar tabes, OpenAPI-tjekket rammer driftsprojektet

- **Beskrivelse:** (1) LIB-RACE: `lib.race` kræver `{ok:boolean}` (`scripts/v5/test-runner.mjs` l.58, 87), men `pg-runner`s `race()` returnerer `{protocolOk,…}` (`pg-runner.mjs` l.211-239), så alle race-tests kaster. (2) LIB-HTTP: et HTTP-svar der ikke er et array, tabes (`rows` kun hvis `Array.isArray`, `pg-runner.mjs` l.125), og headers ignoreres. (3) Kontraktbehov #10: `postgrest-t9-schema-exposure` spørger det eksterne driftsprojekt (`scripts/fitness.mjs` l.1015), ikke test-databasen. (4) 15 datoforløb er ikke testet, fordi den styrede klokke mangler (HALT-FA3-listen i Codex' pas 1). (5) Det er ikke verificeret at en manglende database aldrig giver exit 0 i de beholdte runnere (O-9).
- **Vision-svækkelse:** Én sandhed — test-grønt kan skyldes et bibliotek der ikke måler.
- **Introduceret:** Fase 4 (2026-09-21). Står i dag kun i `provenance/angrebs-tests-pas1.leverance.md`, `angrebs-kontraktbehov.leverance.md` og fund-log (fjernes).
- **Skal løses:** (1)-(2) rettes i test-biblioteket; (3) OpenAPI-tjekket flyttes til test-databasen; (4) styret klokke — også for API- og login-tokens' tid; (5) manglende database = rødt.
- **Risiko hvis glemt:** Mellem. »Codex færdiggør testene« kan ikke lykkes.
- **Løses-i:** pakke 1, trin 2 (workflow-planen §3).

### [G076] LAV — accepteret restrisiko: godkendelsesordet kommer fra en kanal producenten kan skrive i

- **Beskrivelse:** Mathias' `krav ok`/`plan ok`/`slut ok` falder i chatten og skrives i ledgeren af en AI-session (approval-filerne fjernes, §8.2). Kæden beviser tekst og rækkefølge, ikke hvem der skrev ordet (R-CI-APPROVER-FLOW / R-CI-AUTENTICITET, implementeringsplanen @ 87a877b l.338, 340).
- **Vision-svækkelse:** Ingen direkte — det er en accepteret risiko.
- **Introduceret:** C4 (2026-09-15).
- **Skal løses:** Ingen aktiv handling. Accepteret i workflow-planen §2 (accepterede risici): ordet bindes til teksten og står i ledgeren.
- **Risiko hvis glemt:** Lav.
- **Løses-i:** ingen handling (accepteret risiko; genovervejes kun hvis godkendelseskanalen ændres).

### [G075] MELLEM — `prover.json` ligger i produkt-zonen, og dens kommando køres uden zone-tjek (R6-2)

- **Beskrivelse:** `plan-build/<pakke>/prover.json` angiver kommandoen CI kører (`ci-build-dom.mjs` l.131-141). Filen ligger hvor byggeren kan skrive, så byggeren kan pege kommandoen om og ændre hvad der måles.
- **Vision-svækkelse:** Én sandhed — den der bygger, kan påvirke målingen.
- **Introduceret:** C4b. Rejst i planreview (plan-slutlaesning-r6 R6-2; verdikt-code-reviewer-plan-r4 neg[6]).
- **Skal løses:** `prover.json` og `prover-run.mjs` med i låsen på testene (workflow-planen §2 trin 3: »testene + filen der vælger hvilke tests der køres« låses ved grøn dækningsdom). Dækningsdommen binder hele kørselsfladen med blob-OID'er (testene, manifestet, testindekset, `prover.json`), og byggetjekkets tjek 3-4 kontrollerer dem. Hooken klassificerer manifest, testindeks og `prover.json` som Codex' målelag (Codex før låsen, byggeren aldrig; `skill-og-roller.md` D).
- **Risiko hvis glemt:** Mellem.
- **Løses-i:** pakke 1 (låsen i trin 3).

### [G074] MELLEM — byggetjekkets tillidsgrænser (runneren)

- **Beskrivelse:** Kendte, ikke lukkede grænser i målingen: (a) migrationer og ejer-kald kører som superuser; det tjekkes ikke at aktørrollerne mangler `BYPASSRLS`/superuser efter producentens migrationer — en test-rolle med bypass giver falsk-grønne RLS-tests; (b) `pg-runner` kører med `ON_ERROR_STOP=0` (`pg-runner.mjs` l.137), så et flersætnings-setup kan være delvist udført; (c) et renset underproces-miljø er ikke isolation: produktkode kan læse forælderens miljø via `/proc/<ppid>/environ`, og `prover.mjs` l.145 merger `process.env`; (d) `COPY TO PROGRAM`/`lo_export` kører i Postgres-servicecontaineren, hvis isolation ikke er attesteret; (e) manglende `meta` i måle-jobbet giver intet check (tavshed), ikke rødt.
- **Vision-svækkelse:** Én sandhed — målingen kan i særtilfælde bevise noget andet end det produktet gør.
- **Introduceret:** C4b (2026-09-16). Navngivet som R-RUNNER-UDFØRELSE/-ATOMARITET/-LIVSCYKLUS/-OVERLAP i implementeringsplanen (@ 87a877b, l.105, 341).
- **Skal løses:** (a) tjek af rolle-attributter efter migrationerne; (b) atomar udførelse eller eksplicit tjek; (e) samle-tjekket behandler et manglende byggetjek som rødt (workflow-planen §2). (c)/(d) dokumenteres som accepteret, hvis de ikke lukkes.
- **Risiko hvis glemt:** Mellem.
- **Løses-i:** (e) 4.1 trin 3 (samle-tjekket); (a)-(d) i Codex-gennemgangen af byggetjekket (G073).

### [G073] MELLEM — byggetjekkets moduler har intet gældende Codex-pas

- **Beskrivelse:** De moduler der bevares som byggetjek, er ændret efter Codex' sidste PASS: `scripts/v5/ci-build-dom.mjs` (i dag blob `3acea6d1`), `pg-runner.mjs` (`42531d3a`, inkl. PostgREST/JWT-stien, som aldrig er angrebet), `build-proof.mjs` (`c9a09e61`), `build-harness.mjs` og `test-runner.mjs`. `haerdet-register.json` markerer alle fem `kandidat`.
- **Vision-svækkelse:** Én sandhed — den dommer der skal spærre før drift, er ikke efterprøvet i sin nuværende form.
- **Introduceret:** Hurtigt spor 21/9 (kandidat-drift; M-47).
- **Skal løses:** Én Codex-gennemgang af byggetjekket (ci-build-dom, test-runner, pg-runner) i sin omlagte form.
- **Risiko hvis glemt:** Mellem. En fejl i dommeren giver falsk grønt for alle pakker.
- **Løses-i:** pakke 1, trin 2 (workflow-planen §3: »Én Codex-gennemgang af byggetjekket«) og efter omlægningen i 4.1 trin 3.

### [G072] LAV — `gdpr_responsible_employee_id` er erklæret, men ikke koblet; migrations-kommentaren er forkert

- **Beskrivelse:** Kolonnen `core_compliance.superadmin_settings.gdpr_responsible_employee_id` sættes (`20260515110000_p0_gdpr_responsible_employee.sql` l.48, 76), men ingen RPC læser den; aktivering af anonymiserings-strategier kræver kun rettigheden (`20260515110100_p1a_anonymization_strategies.sql` l.293). Kolonnens COMMENT (samme p0-fil l.50-51) siger "Refereret af anonymization-RPCs" — det passer ikke.
- **Vision-svækkelse:** Én sandhed — en kommentar i selve databasen påstår noget der ikke gælder.
- **Introduceret:** P0 (2026-05-15). Synliggjort i recon.md:216 (pakke 1).
- **Skal løses:** Ny `COMMENT ON COLUMN` (migrationen selv er append-only). Om den GDPR-ansvarlige skal være den eneste der kan aktivere strategier, er Mathias' spørgsmål (masterplan l.1950) og afgøres i den pakke der rører GDPR-strategierne.
- **Risiko hvis glemt:** Lav.
- **Løses-i:** den pakke der rører anonymiserings-strategierne.

### [G071] LAV — `pending_change_request` overskriver `stork.change_reason`

- **Beskrivelse:** `pending_change_request` sætter `stork.change_reason` til sin egen label før INSERT (`20260518000000_t9_pending_changes.sql` l.143). Request-audit'en bærer labelen; brugerens årsag lever i payload og på apply-rækkerne.
- **Vision-svækkelse:** Princip 6 (audit) — årsagen står ikke på request-rækken.
- **Introduceret:** T9. Synliggjort i pakke 1's plan (R2-2, arv-note plan.md:851).
- **Skal løses:** Bevar brugerens change_reason (fx label + årsag).
- **Risiko hvis glemt:** Lav.
- **Løses-i:** næste pakke der ændrer pending-fundamentet.

### [G070] LAV — due-gaten bruger `current_date` i sessionens tidszone

- **Beskrivelse:** `pending_change_apply` afviser med `not_yet_due` når `effective_from > current_date` (`20260518000004_t9_client_node_placements.sql` l.183-186); `current_date` følger sessionens tidszone.
- **Vision-svækkelse:** Én sandhed — samme ændring kan være forfalden eller ej afhængigt af sessionen.
- **Introduceret:** T9. Synliggjort i pakke 1's plan (arv-note plan.md:849; pakken gør sin egen effektive dato robust, S-17/S-18).
- **Skal løses:** Fast tidszone for forfalds-afgørelsen (afhænger af beslutningen om »systemets dag«, se pakke 1's ½ side).
- **Risiko hvis glemt:** Lav.
- **Løses-i:** når »systemets dag« er afgjort (pakke 1's `plan ok`); rettelsen i fundamentet ved næste pending-pakke.

### [G069] MELLEM — retention udføres kun for `event_based`

- **Beskrivelse:** Retention-jobbet (`retention_cleanup_daily`, cron-body i `20260515130000_r7a_regprocedure_callable_fix.sql` l.331-339) læser kun `event_based`-klassifikation via `retention_event_column`. `time_based` og `manual` har ingen udførende vej.
- **Vision-svækkelse:** "Alt drift styres i UI" + princip 2 (styr på data) — et UI-valg af `time_based`/`manual` har ingen effekt.
- **Introduceret:** R7a/fundamentet. Synliggjort i pakke 1's plan (SM-4, arv-note plan.md:847).
- **Skal løses:** Executor for `time_based` og `manual`, eller UI der afviser valg uden executor.
- **Risiko hvis glemt:** Mellem. Data der skulle slettes/anonymiseres bliver liggende uden fejl.
- **Løses-i:** før cutover (retention er fundament, jf. vision »skal være på plads før systemet går i produktion«).

### [G068] MELLEM — pending-modellen har ingen »afvist«-status

- **Beskrivelse:** `pending_changes.status` tillader kun `pending/approved/applied/undone` (`20260518000000_t9_pending_changes.sql` l.45-46). En godkendt ændring hvis apply-genvalidering fejler, bliver stående som `approved` og logges af cron som `partial_failure` (samme fil l.394-435).
- **Vision-svækkelse:** Princip 9 (status-modeller bevarer historik) — en fejlet ændring kan ikke skelnes fra en ventende.
- **Introduceret:** T9. Synliggjort i pakke 1's plan (D-10, arv-note plan.md:846).
- **Skal løses:** Terminal status for fejlet apply (fx `afvist`/`failed`) + audit af årsagen.
- **Risiko hvis glemt:** Mellem. Cron forsøger samme fejlede ændring igen hver kørsel.
- **Løses-i:** næste pakke der ændrer pending-fundamentet.

### [G067] MELLEM — `pending_change_apply(uuid)` har ingen rettigheds-gate

- **Beskrivelse:** Enhver indlogget (`authenticated`) bruger kan udløse apply af en godkendt, forfalden pending-ændring. Funktionen tjekker kun status og forfaldsdato — ingen `has_permission`/`is_admin` (seneste definition `20260518000004_t9_client_node_placements.sql` l.152-220; kun `revoke … from public, anon`, l.220).
- **Vision-svækkelse:** "Rettigheder der virker" (vision operationelt princip 2).
- **Introduceret:** T9 (pending-fundamentet). Synliggjort i pakke 1's plan (NF-5, arv-note plan.md:850).
- **Skal løses:** Beslut om apply skal kræve en rettighed eller kun køre som cron/service-rolle; dokumentér det valgte som kontrakt.
- **Risiko hvis glemt:** Mellem. Ændringen er godkendt, men tidspunktet for gennemførelse kan styres af enhver bruger; alle senere pakker med pending-flow arver det.
- **Løses-i:** næste pakke der ændrer pending-fundamentet; senest før cutover.

### [G066] MELLEM — Supabase klik-flade uden versionering/baseline-værn

- **Beskrivelse:** Sandhedskilder uden for migrations (DEL 5-recon, 2026-06-10): (1) **Auth-config** er ren Dashboard-klik uden versionering eller mekanisk værn; (2) **advisor-fladen** havde 95 fund hvoraf 92 er bevidste designvalg (SECDEF-eksponering per gov-3b + RPC-only-tabeller) men accepten var udokumenteret; (3) **API-eksponerede schemas** (PostgREST-config) har listen i types-gen.sh men intet check af faktisk deployet config (G040). OBS: baselinen afslørede mulige pre-T9-legacy-dubletter i public.\* (client_upsert m.fl. i to versioner) — oprydnings-kandidat.
- **Faktisk auth-tilstand (verificeret 2026-06-10):** 2 brugere, begge `email`-provider; 0 SSO-providers; 0 MFA-factors. **Microsoft/Entra-login er bevidst UDSKUDT — intet bygget.** Email/Password-provideren ER den levende auth-flade i hele mellemperioden; **leaked password protection er slået TIL** (Mathias' Dashboard-klik 2026-06-10; advisor-advarslen verificeret væk — 95→94 fund, alle resterende baseline-dokumenteret). Togglen er det rigtige værn nu, ikke en overflødighed.
- **Vision-svækkelse:** Princip 1 (én sandhed) — klik-konfiguration kan drifte usynligt.
- **Introduceret:** Synliggjort ved DEL 5-recon 2026-06-10.
- **Delvist løst (samme dag):** `advisor-baseline`-fitness-check (live SQL-dump mod committet baseline m. begrundelser; bider begge veje; selftest-dækket) + leaked-password-toggle aktiveret.
- **Skal løses (slutbillede, master-plan-låst):** **Entra ID som eneste auth-provider, ingen backdoor** — ved auth-trinnet deaktiveres Email-provideren helt; DET er lukke-handlingen for denne G. Undervejs: API-config-check (G040) + public.\*-legacy-oprydningsverdikt i supabase-flade-vagt.
- **Risiko hvis glemt:** Mellem. Klik-drift opdages først når noget knækker.
- **Løses-i:** Lag F/auth-trinnet (lukke-handling: Entra eneste provider + Email-provider deaktiveret); delmål undervejs i supabase-flade-vagt (gov-5-nabo)

### [G063] LAV — midlertidig governance-check-allowlist for v4-slettede-docs

- **Beskrivelse:** `scripts/governance-check.mjs` `MISSING_PATH_ALLOWLIST` har en entry for `docs/coordination/v4-slettede-docs` (klasse `scope-excluded-local`). Tilføjet i gov-docs-housekeeping så clean-checkout `governance:check` er grøn, mens dir'en stadig ligger untracked og afventer fold i gov-6.
- **Vision-svækkelse:** Marginal — en "midlertidig" allowlist kan blive permanent (drift) hvis ikke sporet.
- **Introduceret:** gov-docs-housekeeping (2026-06-05).
- **Skal løses:** Når **gov-6** folder `docs/coordination/v4-slettede-docs/` til git-history → **fjern allowlist-entryen igen**. Ejer: Code (i gov-6). Gov-6-krav-dok §6 dækker selve foldningen; denne G sporer allowlist-oprydningen.
- **Risiko hvis glemt:** Lav. Entryen er eksplicit dokumenteret med grund + gov-6-trigger.
- **Løses-i:** gov-6 (UDSKUDT 2026-06-11; pakkenavn/form afgøres i krav-dok-dialog — se docs/coordination/gov-6-forslag-og-udskudte.md)

### [G062] LAV — recurring types-drift fra månedlige audit-partitioner

- **Beskrivelse:** `audit_log_<YYYY_MM>`-partitioner (partition-create-cron) genereres månedligt og kan gen-introducere `types:check`-drift hver måned (nuværende fix krævede regen pga. `audit_log_2026_08`).
- **Vision-svækkelse:** Drift-disciplin (§3) — CI kan blive rød hver måned uden kode-ændring.
- **Introduceret:** Synliggjort ved gov-1 (2026-06-04).
- **Skal løses:** Ekskludér partition-børn fra types-gen, eller auto-regen-cron. Ejer: Code. Deadline: senere gov-pakke.
- **Risiko hvis glemt:** Lav-mellem. Manuel regen lukker hver forekomst; men gentager sig.
- **Løses-i:** gov-spor (senere pakke — types-gen-ekskludering eller auto-regen-cron)

### [G001] HØJ — `audit_filter_values` LENIENT-default ved ukendt schema/table

- **Beskrivelse:** Hvis migration INSERT'er på en tabel uden klassifikation, returnerer `audit_filter_values` WARNING + lader værdier passere uændret. Strict-mode kræver eksplicit `stork.audit_filter_strict='true'` session-var.
- **Vision-svækkelse:** "Styr på data — klassifikation på hver kolonne". Ukendt tabel kan skrive PII direkte til audit-log uden hash.
- **Introduceret:** Trin 1 (`20260514120006_t1_audit_filter_values.sql`). **Gældende definition:** `20260521000004_t10_audit_filter_values.sql` l.26 og l.43-50 (`stork.audit_filter_strict` skal være `'true'`; ellers WARNING og værdierne bevares uændret; kommentaren l.129 siger selv »LENIENT-default«).
- **Skal løses:** Før første produktions-data
- **Risiko hvis glemt:** Høj. Ny tabel uden klassifikation → PII læk i audit-log.
- **Plan:** Migration der flipper default til strict + verificerer ingen eksisterende migration genererer warnings. Migration-gate fanger normalt det, men kun for migration-FILER — runtime-skrivninger er sårbare.
- **Løses-i:** pakke 1 (lokations-skabelon, trin 10b) — i plan v3.8 (workflow-planen §3 trin 1): migration der gør filteret strict som default, negativ test og tjek af de eksisterende migrationer; også i manifestet. SKAL være løst FØR trinnet åbner for første reelle data (DEL 5-præcisering).

### [G002] LAV — `source_type`-enum udvidet inline med 'migration'

- **Beskrivelse:** Master-plan §1.3 listede 6 værdier; CHECK-constraint har 7 (tilføjet 'migration' pr. §0.5 / rettelse 20).
- **Vision-svækkelse:** Ingen direkte — master-plan rettelse 21 er konsistens-fixet.
- **Introduceret:** Trin 1 (`20260514120003_t1_audit_partitioned.sql:31-33`)
- **Skal løses:** Ingen aktiv handling — verificér at master-plan §1.3-tekst stadig stemmer
- **Risiko hvis glemt:** Lav
- **Plan:** Verifikations-tjek næste gang master-plan revideres
- **Løses-i:** ingen handling (verifikation ved master-plan-revision)

### [G003] LAV — Hardkodede `auth.users`-id'er i bootstrap

- **Beskrivelse:** mg@ + km@ UUID'er fra Supabase Auth er hardkodet i migration-fil. Hvis Auth-bruger slettes/genskabes med ny UUID, breaker bootstrap ved replay.
- **Vision-svækkelse:** "Stamme = database" — auth-mapping lever uden for DB.
- **Introduceret:** Trin 1 (`20260514120007_t1_bootstrap_admins.sql:13-15`)
- **Skal løses:** Ingen — bevidst bootstrap-pragmatik
- **Risiko hvis glemt:** Lav i drift (kun ved DB-reset). Migration er kørt én gang.
- **Plan:** Hvis nyt admin-team dukker op, flyttes auth-mapping til lag F-konfig-tabel
- **Løses-i:** ingen handling (bevidst bootstrap-pragmatik)
- **Pakke 1:** test-opstart på en tom database indsætter to syntetiske `auth.users`-rækker før migrationerne (workflow-planen §3 trin 2). Selve migrationen ændres ikke (append-only), så posten forbliver åben for driften. Fabrikkens lokale afprøvning 24/9 (ikke genkørt her): uden bootstrap stopper historikken ved `20260514120007`; med bootstrap stopper den ved `20260516200000_h024_test_artifact_cleanup.sql` (precondition på live-data), og resten er grønt.

### [G004] STRUKTUREL — `employees_active_idx` mangler `current_date` i prædikat

- **Beskrivelse:** Index er `(id, termination_date) WHERE anonymized_at IS NULL`. Aktiv-filter `termination_date > current_date` sker ved query-tid fordi `current_date` ikke er IMMUTABLE.
- **Vision-svækkelse:** Ingen — strukturel PG-begrænsning, ikke kompromis.
- **Introduceret:** Trin 1 (`20260514120007_t1_bootstrap_admins.sql:35-36`)
- **Skal løses:** Ingen
- **Plan:** Dokumentér eksplicit i index-comment. Ikke gæld i klassisk forstand.
- **Løses-i:** ingen handling (strukturel note)

### [G005] LAV — Fase 0 migration-filer bevaret som "historik"

- **Beskrivelse:** 13 fase 0-filer i `supabase/migrations/` (`c1-c4_1`, `d1-d7`). Tabellerne droppet i trin 1. Migrationerne forbliver registreret som "applied" i `supabase_migrations.schema_migrations` men deres effekt er nuked. Migration-gate parser stadig deres INSERT-tuples (336 unique keys i union, men kun 193 i DB).
- **Vision-svækkelse:** Lav — arkæologisk støj. Migration-gate's tal er forvirrende fordi den ikke ved at fase 0-INSERTs blev rullet tilbage.
- **Introduceret:** Fase 0 + bevaret af trin 1
- **Skal løses:** Efter trin 8 strict-aktivering har virket et stykke tid
- **Risiko hvis glemt:** Lav. Filerne kan ikke køres igen (mål-tabeller eksisterer ikke).
- **Plan:** Cleanup-commit der DELETE'er fase 0-filer + sletter deres rows i `supabase_migrations.schema_migrations`
- **Løses-i:** Trin 8+ (efter strict-aktivering har kørt stabilt)

### [G006] MELLEM — fire ældre live-fitness-tjek kan give grønt uden at have tjekket (delvist løst)

- **Beskrivelse:** De egentlige fund er nu hårde fejl (`db-rls-policies` returnerer fund uden `soft`, `scripts/fitness.mjs` l.622). Tilbage er at fire ældre live-tjek ikke bruger `liveGuard()` (l.1249-1263, fail-closed i CI): (1) uden `SUPABASE_ACCESS_TOKEN` returnerer `db-rls-policies` (l.564-566), `write-policy-session-var-consistency` (l.760-766), `legacy-is-active-readers` (l.843-849) og `postgrest-t9-schema-exposure` (l.1022-1028) `skipped` med 0 fund — også i CI; (2) ved API- eller netværksfejl returnerer de tre første `soft: true` (l.590-599 m.fl.), og soft-fund tæller ikke (l.1859).
- **Vision-svækkelse:** "Rettigheder der virker" — et manglende token eller et API-udfald giver grønt uden at tjekket er kørt.
- **Introduceret:** Trin 1 (`db-rls-policies`); de tre andre fulgte samme mønster.
- **Delvist løst:** fund er hårde; tokenet er sat i CI (`.github/workflows/ci.yml` l.87).
- **Skal løses:** Manglende token, API-fejl og netværksfejl skal give rødt i CI for alle fire (samme adfærd som `liveGuard()`); lokal udvikler-kørsel må fortsat springe over.
- **Risiko hvis glemt:** Mellem. Et udfald ser ud som et bestået tjek.
- **Løses-i:** pakke 1 (lokations-skabelon), trin 2 — sammen med test-databasen (G047), workflow-planen §3.

### [G007] MELLEM — Migration-scripts har TODO-markører for 1.0-skema

- **Beskrivelse:** `scripts/migration/employees/{1,2,3}.sql` er skabeloner med TODO-markører. Faktiske tabel-/kolonne-navne i Stork 1.0 ikke verificeret. Antagelser: `employee_master_data`, `agents`, `sales.agent_email`, `terminated_at`, `auth_user_id`, `role_name`.
- **Vision-svækkelse:** "Stamme = database" — migration ikke testbar mod 1.0 endnu.
- **Introduceret:** Trin 2
- **Skal løses:** Når Mathias kører discovery mod 1.0
- **Risiko hvis glemt:** Mellem. Scripts vil fejle mod faktisk 1.0-skema (discovery-fasen fanger det).
- **Plan:** Discovery-eksekvering → opdatér TODO-markører → re-test
- **Løses-i:** 1.0-discovery (Mathias-trigget)

### [G008] LAV — Default-rolle 'sælger' hardkodet i upload-script

- **Beskrivelse:** Migrerede medarbejdere får automatisk rolle='sælger'. Admin-roller skal manuelt mappes af Mathias før upload.
- **Vision-svækkelse:** Lav — manuel admin-mapping er pragmatik
- **Introduceret:** Trin 2 (`scripts/migration/employees/3_upload.sql:65-79`)
- **Skal løses:** Når rolle-katalog konfigureres i UI (lag F)
- **Risiko hvis glemt:** Lav
- **Plan:** Upload-script læser rolle-mapping fra konfig-tabel når lag F leverer rolle-konfig
- **Løses-i:** Lag F (rolle-katalog i UI)

### [G012] HØJ — `pay_period_compute_candidate` er SKELETON → fejl-låst prod-periode-risiko

- **Beskrivelse:** RPC'en genererer 0.00-amount placeholder commission_snapshots_candidate-rows pr. aktiv medarbejder. Kopierer kun eksisterende salary_corrections. Ingen reel aggregat-beregning. Auto-lock-cron (aktiveret i trin 7b) ville promovere tomme placeholder-rows til immutable final commission_snapshots.
- **Vision-svækkelse:** "Stamme = database, beregning over databasen" — beregningen findes ikke endnu.
- **Introduceret:** Trin 4 (`20260514150005_t7_lock_pipeline.sql:147-188`)
- **Skal løses:** Trin 14 (sales-stamme) + trin 22 (aggregater + payroll-linjer)
- **Risiko hvis glemt:** Høj. Auto-lock-cron rammer 2026-05-31 (recommended_lock_date for nuværende periode). Den låste periode ville indeholde 0.00 commission-snapshots og ingen reel udbetalingsdata.
- **Plan i denne commit:** **Safety-flip `pay_period_settings.auto_lock_enabled = false` (migration `20260514160001_t7_disable_auto_lock_until_compute_real.sql`)**. Cron tjekker global switch FØR den itererer perioder, så alle periode-locks skippes. Re-aktiveres når trin 14 + trin 22 er færdige OG G013 er løst.
- **Løses-i:** Trin 14 (sales-stamme) + Trin 22 (aggregater/payroll-linjer)

### [G013] MELLEM — `pay_period_lock` re-lock efter break-glass-unlock håndterer ikke UNIQUE-conflict

- **Beskrivelse:** `pay_period_unlock_via_break_glass` bevarer eksisterende immutable `commission_snapshots`. Hvis re-lock kører med samme `(period_id, sale_id, employee_id)`-keys, fejler UNIQUE-constraint.
- **Vision-svækkelse:** "Én sandhed" — break-glass-unlock + re-lock er ikke idempotent
- **Introduceret:** Trin 4 (`20260514150005_t7_lock_pipeline.sql` — gap i unlock-RPC)
- **Skal løses:** Trin 14+ (når sales-tabel + reelle snapshot-keys eksisterer)
- **Risiko hvis glemt:** Mellem. Break-glass-unlock er sjælden.
- **Plan:** Mulige løsninger: (a) `ON CONFLICT DO NOTHING` i lock-promote, (b) versioneret snapshot med `lock_version` i UNIQUE-key, (c) eksplicit DELETE-via-break-glass-RPC der bypasser immutability. Designvalg sker trin 14.
- **Løses-i:** Trin 14+ (sales-tabel + reelle snapshot-keys)

### [G014] MELLEM — SELECT-policies på løn-tabeller er admin-only

- **Beskrivelse:** SELECT-policies på `commission_snapshots`, `salary_corrections`, `cancellations`, candidate-tabeller bruger `using (core_identity.is_admin())`. Master-plan §2.1.3 specificerer scope-model self/team/subtree/all — ikke implementeret.
- **Vision-svækkelse:** "Rettigheder der virker" — sælgere kan ikke se egne provisioner via direkte SELECT.
- **Introduceret:** Trin 4 (flere migrations)
- **Skal løses:** Trin 16/17 (scope-helpers i §1.1 + §1.7). Eksisterende plan, forward-kompatibelt.
- **Risiko hvis glemt:** Mellem. UI vil ikke kunne vise rolle-baseret data.
- **Plan:** Master-plan eksplicit specificerer trin 16/17 som det rigtige sted.
- **Løses-i:** Trin 16/17 (scope-helpers §1.1 + §1.7)

### [G015] LAV — `_compute_period_data_checksum` mangler sales-state

- **Beskrivelse:** Checksum kun over `salary_corrections_count`, `salary_corrections_latest`, `active_employees_count`. Sales (trin 14) tilføjes senere.
- **Vision-svækkelse:** Lav — bevidst forward-kompatibel
- **Introduceret:** Trin 4 (`20260514150005_t7_lock_pipeline.sql:7-43`)
- **Skal løses:** Trin 14 (sales-state) + trin 13 (formel-version-snapshot)
- **Risiko hvis glemt:** Lav
- **Plan:** Udvid checksum gradvist når kilde-tabeller dukker op.
- **Løses-i:** Trin 14 (sales-state) + Trin 13 (formel-version-snapshot)

### [G016] LAV — `pay_periods.locked_by` NULLABLE i locked-state (inline-fix)

- **Beskrivelse:** auth.uid() returnerer NULL for service-role/cron. CHECK-constraint relaxet så locked-state kun kræver locked_at NOT NULL, locked_by er optional.
- **Vision-svækkelse:** Lav — semantisk uklart isoleret set; audit-log bærer kilden (source_type='cron')
- **Introduceret:** Trin 4 (`20260514150010_t7_inline_fix_locked_by_nullable.sql`)
- **Skal løses:** Ikke akut
- **Risiko hvis glemt:** Lav
- **Plan:** Hvis system-employee-konvention etableres ("system" employee i core_identity der ejer cron-handlinger), kan locked_by sættes til dens UUID. Ikke akut.
- **Løses-i:** uplaceret (ikke akut)

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
- **Løses-i:** Lag E / Trin 9+ (R8b, før cutover-blocker-listen)

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
- **Løses-i:** Lag E / Trin 9+ (R5b — sales-tabel)

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
- **Løses-i:** R-runde-2-opfølgning

### [G034] LAV — V2-recon-scanner matcher kun literal `is_active = true`

- **Beskrivelse:** V2.2-recon-query bruger regex `is_active\s*=\s*true`. Misser semantisk ækvivalente former: `is_active IS TRUE`, `coalesce(is_active, false) = true`, alias-baseret `m.is_active = true`. Hvis fremtidig RPC bruger anden syntaks, slipper den igennem V2 + D5 fitness-check.
- **Vision-svækkelse:** Drift-disciplin (§3). Scanner-præcision.
- **Introduceret:** R-runde-2 planlægning 2026-05-15
- **Opdaget:** Codex v2-validering Fund #1 MELLEM
- **Skal løses:** Vurder når relevant; ikke kritisk for R-runde-2 (live recon dækker aktuel state). Hvis fremtidig RPC bruger non-literal pattern: opdatér scanner.
- **Plan (G034):** Udvid V2.2-pattern + D5-pattern til at også matche `IS TRUE`, `coalesce(_, ...) = true`, eller migrér til AST-baseret PG-parser hvis kompleksitet stiger.
- **Løses-i:** uplaceret (trigger: fremtidig RPC med non-literal pattern)

### [G035] LAV — D5 checker globalt pr. function-body, ikke pr. occurrence

- **Beskrivelse:** D5-pattern: `pg_get_functiondef(...) ~* 'is_active.*true' AND !~* 'status.*active'`. False-negative hvis én funktion har ÉN compliant reader (`status='active' AND is_active=true`) og ÉN non-compliant reader (kun `is_active=true`). Function-body som helhed matcher begge mønstre → check passerer.
- **Vision-svækkelse:** Drift-disciplin (§3). Granulariteten af checken.
- **Introduceret:** R-runde-2 planlægning 2026-05-15
- **Opdaget:** Codex v2-validering Fund #5 MELLEM
- **Skal løses:** Vurder når relevant; aktuelt har vi ingen funktion med mixed pattern (R7d normaliserer alle readers).
- **Plan (G035):** Per-occurrence-detection via AST eller regex split af SELECT/WHERE-blokke. Eller: kør D5 + dokumentér antagelsen om at funktioner enten har alle compliant eller ingen.
- **Løses-i:** uplaceret (trigger: funktion med mixed pattern)

### [G039] LAV — V1 PostgREST-test bør køres med både anon og authenticated

- **Beskrivelse:** Codex v2 anbefaler at V1 PostgREST-eksponerings-test køres både med anon-key OG authenticated JWT. Aktuelt plan-beskrivelse nævner kun anon. authenticated kan have anderledes attack-surface (RLS-context, JWT-claims).
- **Vision-svækkelse:** Sikkerheds-disciplin (§1.1).
- **Introduceret:** R-runde-2 planlægning 2026-05-15
- **Opdaget:** Codex v2-validering Fund #6 MELLEM
- **Skal løses:** Mathias kører HTTP-test efter implementation med begge auth-modes.
- **Plan (G039):** V1 curl-instruks udvides med to kald — anon + authenticated JWT — begge mod `/rest/v1/rpc/set_config`. Forventet output: 404 fra begge. Hvis ikke: stop-protokol.
- **Løses-i:** supabase-flade-vagt (gov-5-nabo, sammen m. G040/G066); H012 sporer deadline

### [G040] LAV — Option D PostgREST-schema-isolation skal verificere faktisk deployed API config

- **Beskrivelse:** Stop-protokol Option D antager PostgREST kun eksponerer `public, graphql_public` schemas. Det er repo-antagelse baseret på Supabase-defaults, ikke verificeret mod deployed API config. Hvis Supabase project-config ændrer `db-schemas` til at inkludere pg_catalog (usandsynligt men muligt), så er antagelsen ugyldig.
- **Vision-svækkelse:** Sikkerheds-disciplin (§1.1).
- **Introduceret:** R-runde-2 planlægning 2026-05-15
- **Opdaget:** Codex v2-validering Fund #7 MELLEM
- **Skal løses:** Vurder i Option D-aktivering. Verificér Supabase API-config via management API: `GET /v1/projects/<ref>/api`.
- **Plan (G040):** Hvis V1 afslører eksponering OG Option D aktiveres: tilføj fitness-check der scanner deployed API-config + alerter hvis pg_catalog tilføjes til db-schemas.
- **Løses-i:** supabase-flade-vagt (gov-5-nabo, API-config-check — sammen m. G039/G066)

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
- **Løses-i:** før første post-cutover replay-kørsel

### [G047] MELLEM — DB-tests kører mod live remote DB (ingen isoleret test-DB)

- **Beskrivelse:** `scripts/run-db-tests.mjs:15` peger på samme Supabase-project som production (`imtxvrymaqbgcvsarlib`). DB-tests kører mod live remote via Management API. Konsekvens under T9-build: 3 admin-merges med rød CI (PR #36-38) fordi DB-tests fejlede chicken-and-egg ved partial T9-deploy (M1 + r7b smoke-tests forventede T9-tabeller der først blev oprettet efter merge + push).
- **Vision-svækkelse:** Drift-disciplin (§3). CI-rød accepteres som "ventet" hvilket svækker signal-værdi.
- **Introduceret:** Trin 1 (run-db-tests-script + CI-workflow).
- **Skal løses:** Før næste større pakke der ændrer schema (T9-supplement, trin 10+).
- **Risiko hvis glemt:** Mellem. Future bugs i applied migrations manifesterer sig som DB-test-fejl på efterfølgende PRs uden mulighed for at fixe i PR'en.
- **Plan:** Provisioning af separat Supabase-project (eller Supabase branching-feature på Pro+); CI-step der applier alle migrations til test-DB før db:test; sekret SUPABASE_TEST_PROJECT_REF + SUPABASE_TEST_ACCESS_TOKEN; run-db-tests.mjs udvidet med project-ref-valg.
- **Løses-i:** pakke 1 (lokations-skabelon), trin 2 — test-database til PR-kontrollerne (workflow-planen §3). `db:test` og fitness' live-tjek rammer i dag driftsprojektet (`scripts/run-db-tests.mjs` l.15).

### [G048] LAV — Step 3's fil-as-applied indeholder buggy closure-rebuild CTE

- **Beskrivelse:** `supabase/migrations/20260518000002_t9_org_node_closure.sql:71` har `join nodes_now n on n.node_id = ac.descendant_id` (skulle have været `ac.ancestor_id`). Bug fixed via CREATE OR REPLACE i Step 12 (000010_t9_seed_owners.sql). Step 3's fil er applied til remote — append-only-disciplin forhindrer in-place fix.
- **Vision-svækkelse:** Lav — kosmetisk i historik-perspektiv; runtime-funktionalitet er korrekt fra Step 12 og frem.
- **Introduceret:** T9-build (Step 3, applied 2026-05-18).
- **Skal løses:** Ingen aktiv handling — dokumentation tilstrækkelig.
- **Risiko hvis glemt:** Lav. Developer der læser Step 3's fil ser buggy kode "as applied" uden at vide om fix-location.
- **Spor til fix-location:** G048 selv + T9 slut-rapport (git-historik) dokumenterer bug-klassen og fix-location i Step 12 (`20260518000010_t9_seed_owners.sql`). (`bygge-status.md` er slettet, `c1c1b1b`.) Inline kommentar i Step 3-filen overvejet, ikke leveret (ville kræve modifikation af applied migration-fil; rejected per append-only).
- **Løses-i:** ingen handling (dokumentation tilstrækkelig)

### [G049] MELLEM — Apply-dispatcher-extension-pattern ikke formaliseret i plan-skabelon

- **Beskrivelse:** T9 introducerede dispatcher-extension-pattern (CREATE OR REPLACE pr. step der tilføjer WHEN-klause til CASE-statement i `pending_change_apply`). Step 1's "tomme dispatcher" var invalid plpgsql (CASE uden WHEN); fanget først ved første db push. Plan V6 nævnte mønstret men formaliserede ikke "CASE-statement kræver mindst én WHEN i Postgres".
- **Vision-svækkelse:** Drift-disciplin — pattern dokumenteret bagefter, ikke før build.
- **Introduceret:** Plan V6 (T9-plan).
- **Skal løses:** Næste pakke der bruger dispatcher-extension.
- **Risiko hvis glemt:** Mellem. Samme bug-klasse kan ramme andre pakker.
- **Plan:** Plan-skabelonen i `docs/strategi/disciplin.md` (§10.2) får pattern-checklist for CREATE OR REPLACE FUNCTION: signatur-bevarelse (DEFAULTs, arg-count), CASE-statement-minimums-WHEN, record-INTO-field-restriction. (`docs/skabeloner/plan-skabelon.md` blev slettet 22/5, `4e65fa8`.)
- **Løses-i:** næste dispatcher-extension-pakke

### [G050] MELLEM — Plan V6 mangelfuldt om RLS write-policy-strategi

- **Beskrivelse:** Plan V6 specificerede SELECT-policies + FORCE RLS + SECURITY INVOKER-RPCs for T9-write-veje, men ikke INSERT/UPDATE-policies eller GRANT-statements. Konsekvens: 11 write-RPCs kunne ikke skrive fra authenticated-kontekst. Fixed retroaktivt i T9-fundament-supplement (PR #39) ved at implementere §1.1's session-var-pattern eksplicit.
- **Vision-svækkelse:** "Rettigheder der virker" — fundament-niveau lacuna i Plan V6.
- **Introduceret:** Plan V6.
- **Skal løses:** Fremadrettet — plan-skabelon skal kræve eksplicit policy-strategi pr. write-tabel.
- **Risiko hvis glemt:** Mellem. Næste pakke med write-RPCs kan have samme lacuna.
- **Plan:** Plan-skabelonen i `docs/strategi/disciplin.md` (§10.2) får en "Write-policy-checklist": for hver write-tabel skal planen specificere policies + session-var + skrivevej (i dag: SECURITY DEFINER-RPC; direkte write-grants er forbudt, jf. G065/`app-write-revoke-discipline`).
- **Løses-i:** disciplin-skabelon-revision (delvist dækket af `disciplin.md` §3.3 — verificér mod den omskrevne disciplin.md)

### [G051] LAV — Pre-T9 funktioner redefineret uden eksplicit signatur-diff

- **Beskrivelse:** T9-build redefinerede `has_permission` (Step 11) uden at læse pre-T9-signatur. Konsekvens: `cannot remove parameter defaults from existing function` (42P13). Samme klasse: `role_page_permission_upsert` revoke med 6 args mod 7-arg eksisterende signatur. Begge fanget ved push.
- **Vision-svækkelse:** Drift-disciplin.
- **Introduceret:** T9-build (Step 11).
- **Skal løses:** Næste pakke der CREATE OR REPLACE'er pre-existing functions.
- **Risiko hvis glemt:** Lav (build-time-fanget) men gentager bug-klasse.
- **Plan:** Fitness-check der scanner alle CREATE OR REPLACE FUNCTION i migration-filer; sammenligner argument-signatur (inkl. DEFAULTs) med pre-existing definition (live introspection); fejler hvis defaults fjernes eller arg-count ændres. Implementation-kompleksitet: medium.
- **Løses-i:** næste funktions-ændrende pakke (`disciplin.md` §3.1 patch-først dækker formentlig — verificér mod den omskrevne disciplin.md)

### [G052] LAV — Vej B i PR #40 skabte præcedens for "ret merged-til-main migration når ej applied"

- **Beskrivelse:** PR #40 rettede `20260518000011_t9_classify.sql` (84 rows fra `{"days":2555}` til `{"max_days":2555}`) trods filen var merged til main. Begrundelse: atomic rollback ved første push betød filen aldrig var applied til remote — ingen historisk DB-state at beskytte. Mathias-godkendt 2026-05-19 som "Vej B".
- **Vision-svækkelse:** Append-only-disciplin er nu kontekst-afhængig (merged ≠ applied).
- **Introduceret:** PR #40 (2026-05-18).
- **Skal løses:** Append-only-disciplin-dokumentation skal afspejle nuancen.
- **Risiko hvis glemt:** Lav. Vej B er sjælden (kræver atomic rollback). Men mangler regel kan friste til oversnedig brug.
- **Plan:** `docs/strategi/disciplin.md` (afløser `arbejds-disciplin.md`, slettet 22/5 i `4e65fa8`) får append-only-reglen med nuancen: "Filer merget til main MEN ikke applied til remote (atomic rollback) kan rettes direkte med eksplicit Mathias-godkendelse. Vej A (repair --status applied + ny fix-migration) er default; Vej B (ret filen) kræver eksplicit beslutning."
- **Løses-i:** append-only-disciplin-dokumentation (revision)

### [G045] LAV — Fitness-check `db-test-tx-wrap-on-immutable-insert` fanger ikke RPC-side-effects

- **Beskrivelse:** H024's nye fitness-check (CI-blocker 20) scanner direkte `INSERT INTO <immutable-tabel>` i `supabase/tests/**/*.sql`. Tests der INSERT'er indirekte via RPC-kald (fx `perform core_identity.anonymize_employee(...)` der internt INSERT'er i `anonymization_state`, eller `perform core_compliance.break_glass_execute(...)` der INSERT'er i `break_glass_requests`) bliver IKKE fanget.
- **Vision-svækkelse:** Drift-disciplin (§3). En non-idempotent test der bruger RPC-side-effects kan smutte ind uden CI-blokering. Reduceret af konvention: alle r7a-tests bruger RPC + er allerede tx-wrappede.
- **Introduceret:** H024 (kendt afgrænsning fra plan-fasen).
- **Skal løses:** Vurder når relevant. Lag E's tests vil sandsynligvis bruge RPC'er; udvidelse til Mønster D (RPC-side-effect-scan) kan blive nødvendigt.
- **Risiko hvis glemt:** Lav-mellem. Tx-rollback-konvention etableret; reviewer-disciplin fanger sandsynligvis manglende wrap i RPC-tests.
- **Plan (Mønster D):** Parse pg_proc-bodies via PG-parser eller live introspection af RPC-graf; identificér RPC'er der INSERT'er i immutable tabeller; tilføj allowlist. Implementation-kompleksitet: HØJ. Falsk-positiv-risiko: lav. Falsk-negativ-risiko: lav (med vedligeholdt allowlist).

---

- **Løses-i:** Lag E (RPC-test-mønster — udvid til Mønster D ved behov)

## Løst gæld (arkiv)

### [G029] LØST 2026-05-15 — C001-backfill bruger legal retention mod master-plan-reservation

- **Beskrivelse:** C001-fix (`71ab37f`) klassificerede løn-tabeller m.fl. som `retention_type='legal'` (2555 dage); `legal` skulle fjernes pr. rettelse 24.
- **Løst:** `20260514180500_d1_d2_drop_legal_convert_rows.sql` fjerner `legal` fra retention_type-CHECK og konverterer de 71 legal-rækker: `audit_log.*` → `permanent`, alle øvrige (bl.a. pay_periods, commission_snapshots, salary_corrections, cancellations, break_glass_requests) → NULL (ikke valgt). Løsningen blev NULL, ikke `time_based` (rettelse 24/25).
- **Konstateret lukket:** 2026-09-24 (dokumentgennemgangen).

### [G036] LØST 2026-05-15 — R7a+R7d cron-reschedule race-window

- **Beskrivelse:** R7a og R7d ændrede begge `retention_cleanup_daily`s cron-body; cron kunne fyre mellem de to migrationer.
- **Løst:** Option A — R7a kombinerer begge cron-body-rettelser i én unschedule + schedule; R7d rører ikke cron'en (`20260515130000_r7a_regprocedure_callable_fix.sql` l.19-21, 304; `20260515130300_r7d_is_active_status_alignment.sql` l.24-25).
- **Konstateret lukket:** 2026-09-24.

### [G037] LØST 2026-05-15 — R7d backfill mangler session-vars for audit-spor

- **Beskrivelse:** R7d-backfillen manglede session-var-mønstret (source_type, allow_*_write, change_reason).
- **Løst:** `20260515130300_r7d_is_active_status_alignment.sql` l.9 og l.27-31 sætter `stork.source_type`, begge `stork.allow_*_write` og `stork.change_reason` før UPDATE.
- **Konstateret lukket:** 2026-09-24.

### [G038] LØST 2026-05-15 — cron.unschedule via navn-lookup vs jobid-lookup

- **Beskrivelse:** `cron.unschedule('retention_cleanup_daily')` var navne-baseret.
- **Løst:** `20260515130000_r7a_regprocedure_callable_fix.sql` l.23 og l.306-312: jobid slås op i `cron.job`; unschedule kun hvis jobbet findes.
- **Konstateret lukket:** 2026-09-24.

### [G041] LØST 2026-05-15 — Retention cron e2e-test bør eksekvere faktisk scheduled command

- **Beskrivelse:** e2e-testen kørte kopieret helper-logik, ikke selve `cron.job.command`.
- **Løst:** `supabase/tests/smoke/r7a_retention_cleanup_cron_e2e.sql` l.3-4 og l.56-61 henter `command` fra `cron.job` og eksekverer den (commit `04482b9`).
- **Konstateret lukket:** 2026-09-24.

### [G058] LØST 2026-06-05 — FK-coverage-fitness-check ikke implementeret per master-plan §3 punkt 19

- **Beskrivelse:** Master-plan §3 punkt 19 krævede et fitness-tjek for `_id`-kolonner uden FK.
- **Løst:** gov-3b-1 (commit `58f36d4`, PR #96): `fkCoverage()` i `scripts/fitness.mjs` (l.1443) med `FK_COVERAGE_EXEMPTIONS` (l.1368) og `FK_PENDING` (l.1380); står i checks-listen (l.1832) og er fail-closed i CI.
- **Konstateret lukket:** 2026-09-24.

### [G046] LUKKET (overhalet) 2026-06-07 — Fitness-check fanger ikke manglende table grants ved policy-tilføjelse

- **Beskrivelse:** Policies på write-tabeller blev tilføjet uden matchende GRANT; fitness så det ikke.
- **Hvorfor lukket:** Præmissen er væk. gov-3b-3b (G065, PR #105) fjernede alle direkte write-grants til `authenticated` på core_* (`20260607110004_core_identity_revoke_authenticated_core_writes.sql` l.11); skrivning går udelukkende via SECURITY DEFINER-RPC'er. `app-write-revoke-discipline` (`scripts/fitness.mjs` l.1728, effektiv privilegie-test, fail-closed i CI) forbyder direkte app-write-grants. Et manglende grant kan derfor ikke længere være fejlen.
- **Konstateret lukket:** 2026-09-24 (workflow-planen §4.3). G/H-dispositionen for pakke 1 (24/9) sagde »tages med«; det er afløst af denne lukning.

### [G018] LUKKET (overhalet) 2026-05-22 — Bygge-status klassifikations-tal er forkerte

- **Beskrivelse:** `docs/strategi/bygge-status.md` havde forkerte tal for klassificerede kolonner efter trin 1-3.
- **Hvorfor lukket:** Filen blev slettet 22/5 (`c1c1b1b`, »koble bygge-status ind i master-plan §4.1 + §4.2«). Lærdommen står fortsat: brug `SELECT count(*)` mod databasen, ikke migration-gate-output. Masterplanens eget punkt om klassifikations-tal (§4.2) hører til masterplan-rettelserne.
- **Konstateret lukket:** 2026-09-24.

### [G065] LØST 2026-06-07 — `authenticated` direkte write-grant + session-var-gate = privilegie-eskaleringshul på core\_\*

- **Beskrivelse:** `authenticated` har direkte INSERT/UPDATE/DELETE-grant på 25 core*\*-tabeller, hver med FORCE RLS + en `authenticated`-write-policy gated på session-var (`stork.allow*_*write`/`stork.t9_write_authorized`). Da `authenticated`selv kan sætte session-var'en, kan rollen i princippet skrive direkte uden om de respektive RPC'ers`has_permission`-tjek. De fleste write-RPC'er er SECDEF (postgres/`bypassrls`) → der er grantet rent drift; men **14 auth-eksekverbare SECURITY INVOKER T9-fns** (`permission*_\_upsert/\_deactivate`, `permission_action_set_approver_type`, `role_permission_grant_set/remove`, `pending_change_approve/undo`, `undo_setting_update`) kører som `authenticated` og afhænger af grantet — REVOKE ville bryde dem.
- **Severity-nuance (defense-in-depth, ikke live-REST-eksploiterbart i dag):** `/rpc/set_config` er ikke PostgREST-eksponeret (404/PGRST202 i live-probe), så en normal `authenticated`-klient kan ikke sætte session-var'en via REST. Krydsref [G039] (REST-eksponerings-test). Hullet er en privilegie-flade der bør lukkes mekanisk, ikke et åbent live-exploit.
- **Vision-svækkelse:** §1.1:157 ("direkte tabel-rettigheder revokes fra alle roller") + §3 #18.
- **Introduceret:** Synliggjort 2026-06-05 (gov-3b-2 DB-state-dump for #10; #18 udskilt til egen pakke).
- **Løst** (gov-3b-3b, PR #105, 2026-06-07): konverterede de auth-eksekverbare SECURITY INVOKER-write-RPC'er til SECURITY DEFINER, derefter REVOKE alle `authenticated`-write-grants på core\_\*. Præcist inventory afgøres af gov-3b-3's egen friske dump (klassen er stabil: auth-eksekverbar INVOKER-write-vej afhængig af direkte grant). Ejer: Code. Resultat: alle 14 T9-RPC'er SECDEF + 0 app-rolle write-grants på core\_\* (håndhævet af `app-write-revoke-discipline` #18).

### [G064] LØST 2026-06-10 — types:check holdt CI rød på main (historisk; entry flyttet fra PR #99-tracking)

- **Beskrivelse:** `pnpm types:check` fejler på main på hver nylig run. Committed `packages/types/src/database.ts` lister `gov1_registry_backup` under `public.Tables`, men tabellen ligger faktisk i `supabase_migrations`-schemaet (gov-1-backup, ikke i types-gen's schema-liste `public,core_identity,core_compliance,core_money`) → frisk gen udelader den → drift. Dertil G062's månedlige audit-partition-drift. Fitness (inkl. live-checks #6/#19/fk-coverage/index-per-policy), supabase-link og governance er GRØNNE i CI — det er alene `types:check` der er rød.
- **Vision-svækkelse:** Drift-disciplin (§3) + gov-4. CI har været rød på hver nylig main-run uden at blokere, fordi checks ikke er required endnu. gov-4 kan ikke gøre checks required mens CI er pålideligt rød.
- **Introduceret:** Synliggjort 2026-06-05 (Supabase-credential-kortlægning før gov-4; præmissen "credential-gab" holdt ikke — fundamentet er sat op, det er types-drift der er hullet).
- **Skal løses:** (1) Engangs: regen typer (`pnpm types:generate`) rydder `gov1_registry_backup`-driften — sker i samme token-fix-tråd. (2) Durabelt: G062's månedlige partition-drift (ekskludér partition-børn fra types-gen eller auto-regen-cron). Begge skal være på plads så CI er grøn mod ren tilstand FØR gov-4. Ejer: Code.
- **Risiko hvis glemt:** Mellem. Blokerer gov-4 (en evigt-rød check kan ikke gøres required) og maskerer fremtidige reelle drift-fund i støjen.
- **LØST (konstateret 2026-06-10):** `pnpm types:check` er grøn — "Types in sync with remote schema". Driften blev ryddet af types-regen via migrations-deploy i gov-3b-3b-forløbet; gov-4 leveret uden types:check som required (bevidst: kun ci-jobbet er required). Recurring partition-drift spores fortsat i [G062]. Entry cherry-picket fra branch `claude/g064-types-drift-ci-red` (PR #99 lukket — tracking hører her, ikke i åbne PR'er).

### [G061] LØST i gov-4 — comment-parity-residual efter gov-1 registry-reconciliation

- **Beskrivelse:** 2 `comment on`-labels fra PR-polish nåede aldrig live (deploy fyrede ikke, H020): `client_node_placements_client_id_fkey`-constraint + `permission_actions`-tabel. Repo-filerne definerer dem; live mangler dem.
- **Vision-svækkelse:** Marginal — princip 1 (repo↔live 100% paritet) ikke helt opfyldt på comment-niveau. Ingen skema-/CI-/data-effekt.
- **Introduceret:** Synliggjort ved gov-1-paritet-groen (2026-06-04). Selve glippet er fra t10/t9_supplement_2-PR-polish.
- **Skal løses:** Opsamlings-migration (§E default) der `comment on` de 2 mål. Ejer: Code. **Deadline: før gov-4 (branch protection)** — så paritet er 100% når den håndhæves.
- **Risiko hvis glemt:** Lav. Rent kosmetisk; fremtidig rebuild fra repo ville have dem.
- **LØST:** gov-4 batch 1 (2026-06-10) — migration `20260610190000_gov4_g061_comment_paritet.sql` genudfører begge statements 1:1 (live-dump bekræftede `null` på begge før). Live ved merge-deploy (migrations-deploy.yml).

### [G060] LØST 2026-05-22 — T9-supplement-2 mangler full-flow smoke-tests

- **Hvad:** Build-tidspunktet's smoke-tests (T1-T4) blev forenklet til schema-tjek + funktion-eksistens-tjek pga. CI-superuser-context. Krav-dok §3.1 + §3.5 specificerer "fra anmodning gennem godkendelse til effektuering" — det blev IKKE leveret i build.
- **Klassificerings-rettelse:** Slut-rapportens oprindelige klassificering ("implementations-vej-domæne") var forkert. Krav-dok §3.5 er eksplicit krav, ikke implementations-detalje. Korrekt: STOP-FOR-CLARIFICATION (Claude.ai's slut-rapport-review-fund).
- **Løsning:** Opfølgnings-pakke (`claude/t9-supplement-2-followup`). Ny smoke-fil `supabase/tests/smoke/t9_supplement_2_full_flow.sql` etablerer rolle-swap-fixture (auth-backed superadmins → swap til non-admin → buffer-admin floor → ROLLBACK) per `t10_client_active_check.sql`-mønstret. Verificerer end-to-end:
  - T1 (G059): non-admin opretter pending via `org_node_upsert`-wrapper → admin approver → service_role apply → status='applied'
  - T2 (Approve-disciplin "above"): non-ancestor approver afvises med `approver_not_higher_level`; admin-bypass approver succeeds (superadmin-undtagelse)
  - T3 (Handlings-granularitet): `has_permission_action`-additive-model — action uden grant returnerer false
- **Reference:** t9-supplement-2 slut-rapport (git-historik), Plan-afvigelse 1 (rettet). Mathias-afgørelse 2026-05-22: lever full-flow-smoke FØR pakke-lukning (krav-dok §3.5).

### [G059] LØST 2026-05-22 — T9 public wrappers mangler `stork.t9_write_authorized` session-var

- **Løsning:** T9-supplement-2 M1 (PR #74). 5 T9 wrapper-RPC'er fik `perform set_config('stork.t9_write_authorized', 'true', true)` FØR `pending_change_request`. Plus eksplicit `grant execute ... to authenticated` på 5 G059-wrappers + 2 T10-client-wrappers (Codex V7 systemisk recon).
- **Migration:** `supabase/migrations/20260521100000_t9_supplement_2_wrappers_session_var.sql`

### [G057] LØST 2026-05-22 — T9 forretnings-invariants uden superadmin-bypass

- **Løsning:** T9-supplement-2 M2 (PR #74). `_apply_client_place` (team-aktiv-check linje 159-167) + `_apply_team_close` (allerede-inaktiv-check linje 598-601) fik superadmin-bypass via `is_admin_by_employee_id`-mønster fra T10.7b. Idempotency-model: no-op return for admin på allerede-inaktivt target. Strukturelle vagter bevares uden bypass.
- **Migration:** `supabase/migrations/20260521100002_t9_supplement_2_superadmin_bypass.sql`

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

### [G017] LAV — Test-artefakter i prod-DB (LØST i H024)

- **Beskrivelse:** 1 syntetisk locked pay_period (2020-01-15→2020-02-14) + 260 commission_snapshots (immutable) + 1 salary_correction (description='smoke test', amount=-100, i 2026-04-15→2026-05-14) + udvidet under afdækning: 1 anonymization_state (C002 test) + 1 anonymized test-employee.
- **Vision-svækkelse:** "Stamme = database" — prod-DB indeholder ikke-prod-data uden klar separation.
- **Introduceret:** Trin 4 (verifikations-test) + C002 (anonymisering-verifikation).
- **Status:** **LØST i H024 build-PR** — engangs cleanup-migration `20260516200000_h024_test_artifact_cleanup.sql` rydder G017-cluster atomically (1 pay_period + 1 candidate_run + 260 snapshots + 1 salary_correction + 1 anonymization_state + 1 anonymized employee) via marker-based DELETE + DISABLE/ENABLE TRIGGER pattern. Mathias-godkendt one-shot pre-cutover-mekanisme (qwerg 2026-05-16). G017-cluster tolkning (b) bekræftet: hele G017-clusteret er test-artefakt, krav-dok's "2 reelle candidate_runs" var faktuelt forkert (kun 1 reel — e8070819 paired med f4c86616).
- **Verifikation:** Migration har pre/post-precondition-assertions; runtime RAISE EXCEPTION hvis count afviger fra forventet eller hvis reelle rows utilsigtet rammes.
- **Note:** Flyttes til arkiv ved næste teknisk-gaeld-revision.

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

### [G056] LØST i PR claude/lag1-disciplin-G055-G056 — `codex-overvaagning.md` rolle-grænse præciseret

- **Beskrivelse:** `docs/coordination/overvaagning/codex-overvaagning.md:24,76,104` siger eksplicit at forretnings-dokument-konflikter (vision-princip, master-plan, mathias-afgørelser, krav-dok) er "OUT OF SCOPE — Claude.ai's bord", og Codex skal markere + fortsætte uden at blokere. Men `:136-140` lod severity-listen KRITISK dække "...ELLER modsiger forretnings-dokument-rammen (vision, master-plan, mathias-afgørelser, krav-dok). STOPPER plan i alle runder." og NEEDS-MATHIAS dække "modsigelse mellem to forretnings-dokumenter".
- **Vision-svækkelse:** Rolle-disciplin (Codex = kode, Claude.ai = forretning). Hvis Codex kunne markere forretnings-konflikter som KRITISK/NEEDS-MATHIAS, så var rollen ikke ren — det fjernede pointen med dobbelt-port-review.
- **Introduceret:** Lag 1 build (PR #48) + PR #52 (NEEDS-MATHIAS-tilføjelse). Spotted af Codex selv 2026-05-20 i meta-review af PR #52.
- **Løsning:** `codex-overvaagning.md:136` KRITISK-definitionen omformuleret til kun kode-niveau-blokere (teknisk umulighed, produktion-risiko, teknisk-invariant-brud) + eksplicit note: "Forretnings-dokument-modsigelse er IKKE KRITISK for Codex — det er Claude.ai's bord. Hvis du spotter en konflikt: marker som 'OUT OF SCOPE — Claude.ai's bord' (se linje 24, 76, 104) og fortsæt." NEEDS-MATHIAS-definitionen tilsvarende præciseret til teknisk niveau + eksplicit note: "Modsigelse mellem to forretnings-dokumenter er Claude.ai's bord (se OUT OF SCOPE-håndtering ovenfor)". Codex-rollen er nu intern konsistent: alle forretnings-konflikter går via OUT OF SCOPE-vejen, KRITISK + NEEDS-MATHIAS er kun for kode-niveau-fund.

### [G055] LØST i PR claude/lag1-disciplin-G055-G056 — `scripts/codex-review.sh` parser udvidet med severity-prefix + NEEDS-MATHIAS

- **Beskrivelse:** `scripts/codex-review.sh` halt-marker-parseren tjekkede for V5.3 halt-markers (`BRUD-PAA-KRAV`, `TEKNISK-BLOKERING`, `PLAN-AFVIGELSE`, `KRITISK-SIKKERHEDSHUL`, `WORKAROUND-INTRODUCERET`, `STOP-FOR-CLARIFICATION`, `ESCALATE`, `AUTO-ESKALATION`) som exit-2-trigger. Severity-prefix `KRITISK:` alene blev ikke parset selvstændigt. En ren `KRITISK: <fund>`-linje uden halt-marker gav exit 0, selvom `docs/coordination/overvaagning/codex-overvaagning.md` siger "KRITISK ... STOPPER plan i alle runder". Samme problem for NEEDS-MATHIAS.
- **Vision-svækkelse:** Disciplin-håndhævelse. Driftsikkerhed: hvis Codex leverede et reelt KRITISK eller NEEDS-MATHIAS-fund uden at kombinere med halt-marker, så så scriptet det ikke som blokerende — Code kunne eksekvere videre på forkerte præmisser.
- **Introduceret:** Lag 1 build (PR #48 V5.3 marker-protokol). Spotted af Codex selv 2026-05-20 i meta-review af PR #52.
- **Løsning:** Parser udvidet med to nye detection-blokke: (a) `^KRITISK\b` → `SEVERITY_HIT=1` → exit 2 (sammen med halt-markers), (b) `^(\[NEEDS-MATHIAS\]|NEEDS-MATHIAS)\b` → `NEEDS_MATHIAS_HIT=1` → exit 4 (Mathias-judgment-kategori parallelt til ESCALATE). Ord-grænse `\b` forhindrer false positive på "KRITISKE" osv. Help-blok opdateret med nye exit-koder. Begge nye exit-conditions stopper Code automatisk — disciplinen er nu håndhævet på script-niveau, ikke på Codex' egen huskemekanisme.

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

### [G019] LAV — `stork_audit` antog uuid PK; singletons med smallint/integer PK var ikke testet

- **Beskrivelse:** Audit-trigger castede `to_jsonb(new)->>'id'` til uuid uden type-tjek. `pay_period_settings.id` (smallint) og `superadmin_settings.id` (integer) var bootstrappet før audit-trigger blev attached, så bug'en blev ikke opdaget før første UPDATE.
- **Vision-svækkelse:** "Anonymisering bevarer audit" + "Én sandhed" — singletons kunne ikke opdateres uden audit-bypass.
- **Introduceret:** Trin 1 (`20260514120003_t1_audit_partitioned.sql:143`)
- **Opdaget:** 2026-05-14 ved G012-mitigation (UPDATE på pay_period_settings)
- **Løst:** `20260514160000_t1_inline_fix_audit_non_uuid_id.sql` — TRY/CATCH omkring uuid-cast. record_id=NULL ved non-uuid PK; id-værdien bevares i old/new_values jsonb. Audit-trail intakt.
- **Arkiveret:** 2026-05-16 (H020 M12).
