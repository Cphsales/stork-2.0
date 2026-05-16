# H016 dybde-audit — Codex

**Dato:** 2026-05-15
**Version:** 1.0
**Scope:** Sandheds-konsistens mellem dokumenter, kode, SQL, setup og live-state. Bugs, logiske fejl og sikkerhedshuller er kun medtaget når de viser en dokument-/kode-/setup-uoverensstemmelse.

## Sammendrag

**Verificerede fund:** 19

| Kategori                                 | Antal |
| ---------------------------------------- | ----: |
| A — dokument modsiger dokument           |     5 |
| B — dokument modsiger kode/test          |     1 |
| C — kode-kommentar modsiger SQL          |     1 |
| D — død path/reference                   |     5 |
| E — statusfelt/commit/live-state forkert |     6 |
| F — setup-claim modsiger setup           |     1 |

| Konsekvens | Antal |
| ---------- | ----: |
| kritisk    |     0 |
| mellem     |    14 |
| kosmetisk  |     5 |

**Live checks udført:** GitHub branch protection, Supabase Management API SQL for G028, pay_periods triggers, lifecycle-state og pay_period_settings, samt `nvm use 22 && pnpm fitness` (all checks passed).

## Verificerede fund

### FN-001 [Kategori D] [Konfidens: verificeret] [Konsekvens: mellem]

**Lokation:** README.md:74
**Påstand (citat):** "Fase 0 — fundament. Se forrige sessions `code-forstaaelse-samlet.md` for kontekst og A1-A10-plan."
**Faktisk tilstand:** Repoet er langt forbi Fase 0: coordination-docs har H010, R-runde-2, R7h og 2026-05-15 beslutninger. Den refererede fil findes ikke i repoet.
**Bevis:** `rg --files | rg '(^|/)code-forstaaelse-samlet\.md$'` returnerede tomt. `rg -n "R7h|R-runde-2|H010|2026-05-15" docs/coordination README.md` viser aktive 2026-05-15 entries i `docs/coordination/mathias-afgoerelser.md`.
**Konsekvens:** README sender nye læsere til en død historisk kontekst og et gammelt fasebillede, før de når de autoritative coordination-dokumenter.

### FN-002 [Kategori E] [Konfidens: verificeret] [Konsekvens: mellem]

**Lokation:** docs/strategi/arbejdsmetode-og-repo-struktur.md:3
**Påstand (citat):** "**Status:** Plan, ikke aktiveret. Etableres efter R-runde-2 er færdig."
**Faktisk tilstand:** Dokumentet er aktivt etableret: `CLAUDE.md` peger på det som kilde, H010-rapporten markerer arbejdsmetode + repo-struktur som leveret, og `mathias-afgoerelser.md` siger at H010 blev committed/merged.
**Bevis:** `CLAUDE.md:46`, `docs/coordination/rapport-historik/2026-05-15-h010.md:35-45`, `docs/coordination/mathias-afgoerelser.md:189-197`.
**Konsekvens:** Et aktivt styringsdokument præsenterer sig selv som ikke aktiveret, hvilket gør statusdisciplinen upålidelig.

### FN-003 [Kategori E] [Konfidens: verificeret] [Konsekvens: mellem]

**Lokation:** docs/strategi/stork-2-0-master-plan.md:3
**Påstand (citat):** "**Status:** Komplet med 17 rettelser indlejret"
**Faktisk tilstand:** Samme dokument har Appendix C med rettelser ud over 17, op til mindst 28 i de viste linjer og videre i filen; indholdsfortegnelsen siger også "31 trin".
**Bevis:** `docs/strategi/stork-2-0-master-plan.md:20` siger "31 trin"; `docs/strategi/stork-2-0-master-plan.md:1824-1865` viser rettelser 1-28 og duplikerede 18/19-numre efter 29.
**Konsekvens:** Master-planens statusfelt undervurderer ændringshistorikken og gør det uklart hvilke rettelser der faktisk er indlejret.

### FN-004 [Kategori D] [Konfidens: verificeret] [Konsekvens: kosmetisk]

**Lokation:** docs/strategi/stork-2-0-master-plan.md:145
**Påstand (citat):** "Detaljeret migration-analyse i `docs/migration-strategi-analyse.md` bevares som baggrund."
**Faktisk tilstand:** Filen findes ikke i repoet.
**Bevis:** `rg --files | rg '(^|/)migration-strategi-analyse\.md$'` returnerer tomt.
**Konsekvens:** Læseren kan ikke finde den baggrundsanalyse master-planen udpeger.

### FN-005 [Kategori A] [Konfidens: verificeret] [Konsekvens: mellem]

**Lokation:** docs/strategi/stork-2-0-master-plan.md:179
**Påstand (citat):** "4 retention-typer: time_based / event_based / legal / manual"
**Faktisk tilstand:** Samme dokument siger senere at `legal` er fjernet, og at enum er `time_based`, `event_based`, `manual`, `permanent` + NULL.
**Bevis:** `docs/strategi/stork-2-0-master-plan.md:609-611` og `docs/strategi/stork-2-0-master-plan.md:1861-1862`.
**Konsekvens:** Det autoritative dokument giver to forskellige sandheder om retention-typen, som er en central DB-/GDPR-kontrakt.

### FN-006 [Kategori A] [Konfidens: verificeret] [Konsekvens: mellem]

**Lokation:** docs/teknisk/lag-e-beregningsmotor-krav.md:42
**Påstand (citat):** "Annullerings-fradrag falder i den lønperiode hvor effekt-datoen ligger (ikke salgs-dato)"
**Faktisk tilstand:** Master-planen siger det modsatte efter rettelse 2: `target_period_id` er bruger-valgt, og effekt-dato styrer ikke hvor fradrag lander.
**Bevis:** `docs/strategi/stork-2-0-master-plan.md:816-817`.
**Konsekvens:** Lag E-kravspecifikationen kan få implementering til at placere annulleringer i forkert periode i forhold til den nyere master-plan.

### FN-007 [Kategori A] [Konfidens: verificeret] [Konsekvens: mellem]

**Lokation:** docs/teknisk/lag-e-tidsregistrering-krav.md:95
**Påstand (citat):** "Fravær har approval-workflow"
**Faktisk tilstand:** Master-planen skelner: ferie har workflow, men sick_leaves er "sygdom uden workflow" med bagudrettet registrering og ingen approval.
**Bevis:** `docs/strategi/stork-2-0-master-plan.md:981-993`.
**Konsekvens:** Kravspecifikationen oversimplificerer fravær og kan føre til forkert workflow for sygdom.

### FN-008 [Kategori E] [Konfidens: verificeret] [Konsekvens: mellem]

**Lokation:** docs/teknisk/teknisk-gaeld.md:11
**Påstand (citat):** "**Sidste opdatering:** 14. maj 2026 (efter retroaktiv gennemgang trin 1-4)"
**Faktisk tilstand:** Samme fil indeholder flere 2026-05-15 entries og G031-G044-sektioner fra R-runde-2/R7h/H010.
**Bevis:** `docs/teknisk/teknisk-gaeld.md:283-312`, `docs/teknisk/teknisk-gaeld.md:315-454`.
**Konsekvens:** Teknisk-gældsfilens metadata fortæller, at den er ældre end den faktisk er, hvilket svækker status-tracking.

### FN-009 [Kategori A] [Konfidens: verificeret] [Konsekvens: mellem]

**Lokation:** docs/teknisk/teknisk-gaeld.md:292
**Påstand (citat):** "Bygg `core_sales.sales`-tabel + realistic seed"
**Faktisk tilstand:** Master-planens stack-afsnit fastlægger tre core-schemas: `core_identity`, `core_money`, `core_compliance`. Repoets migrations opretter heller ikke et `core_sales` schema.
**Bevis:** `docs/strategi/stork-2-0-master-plan.md:51-52`; `rg -n "core_sales|core_money\\.sales|sales-tabel" docs supabase README.md CLAUDE.md` viser kun `core_sales` i `docs/teknisk/teknisk-gaeld.md:292,300,307-309`, ikke i migrations.
**Konsekvens:** G030/G031 planlægger fremtidig løsning på et schema-navn der ikke matcher den autoritative tre-schema-arkitektur.

### FN-010 [Kategori D] [Konfidens: verificeret] [Konsekvens: kosmetisk]

**Lokation:** docs/teknisk/permission-matrix.md:92
**Påstand (citat):** "Regenérer denne fil ved at køre query i `docs/teknisk/permission-matrix.md`-frontmatter"
**Faktisk tilstand:** Filen har ingen YAML-frontmatter eller query; den starter direkte med `# RPC permission matrix`.
**Bevis:** `docs/teknisk/permission-matrix.md:1-7` og `docs/teknisk/permission-matrix.md:87-92`.
**Konsekvens:** Regenereringsinstruksen peger på en ikke-eksisterende kilde, så næste opdatering bliver manuel gætning.

### FN-011 [Kategori E] [Konfidens: verificeret] [Konsekvens: mellem]

**Lokation:** docs/teknisk/permission-matrix.md:79
**Påstand (citat):** "`anonymization_strategies` | 3 (blank, hash, `hash_email`) | alle `approved`"
**Faktisk tilstand:** Live DB har 10 `anonymization_strategies`: 3 `approved` og 7 `tested` test-/smoke-strategier.
**Bevis:** Supabase Management API query `select strategy_name,status from core_compliance.anonymization_strategies order by status,strategy_name` returnerede `blank`, `hash` og `hash_email` som `approved` samt `p1a_smoke_*` og `test5` som `tested`. Den samlede lifecycle-query returnerede `{"strategies":{"tested":7,"approved":3}}`.
**Konsekvens:** Permission-matrixens "auto-genereret fra live DB" lifecycle-state er allerede stale mod live DB og undervurderer testartefakter i konfig-tabellen.

### FN-012 [Kategori D] [Konfidens: verificeret] [Konsekvens: kosmetisk]

**Lokation:** docs/skabeloner/rapport-skabelon.md:59
**Påstand (citat):** "Følger `CLAUDE.md`'s vision-tjek-skabelon:"
**Faktisk tilstand:** `CLAUDE.md` indeholder ikke selve vision-tjek-skabelonen; den peger videre til `docs/strategi/arbejds-disciplin.md`, hvor skabelonen faktisk står.
**Bevis:** `rg -n "^## Vision-tjek$|^### Vision-tjek$|vision-tjek-skabelon" CLAUDE.md docs/strategi/arbejds-disciplin.md docs/skabeloner/rapport-skabelon.md` viser `docs/strategi/arbejds-disciplin.md:345` som skabelon og `CLAUDE.md:45` som reference-liste.
**Konsekvens:** Rapportskabelonen peger på den gamle lokation efter H010-refactor.

### FN-013 [Kategori F] [Konfidens: verificeret] [Konsekvens: mellem]

**Lokation:** supabase/tests/README.md:3
**Påstand (citat):** "DB-level tests der køres som CI-blocker via `pnpm test:db`."
**Faktisk tilstand:** `package.json` definerer scriptet som `db:test`, og CI kører `pnpm db:test`. Der findes ikke et `test:db` script i root package.
**Bevis:** `package.json:26`; `.github/workflows/ci.yml:75-77`; `supabase/tests/README.md:41-43`.
**Konsekvens:** Dokumenteret testkommando fejler for udviklere og modsiger CI's faktiske setup.

### FN-014 [Kategori B] [Konfidens: verificeret] [Konsekvens: mellem]

**Lokation:** supabase/tests/README.md:24
**Påstand (citat):** "`BEGIN ... ROLLBACK` sikrer at side-effekter (employees, audit-rows, etc.) ikke persisterer i prod-DB."
**Faktisk tilstand:** `supabase/tests/smoke/r3_commission_snapshots_immutability.sql` har side-effects (`insert into core_money.pay_periods`, `pay_period_candidate_runs`, `commission_snapshots`) men ingen `begin;`/`rollback;`.
**Bevis:** `supabase/tests/smoke/r3_commission_snapshots_immutability.sql:8-72`; samme fil indsætter pay_period på `:26-28` og har ingen transaction wrapper. `docs/teknisk/teknisk-gaeld.md:441-454` dokumenterer også G043/G044 om cleanup-problemet.
**Konsekvens:** Test-dokumentationen lover read/rollback-disciplin, mens en smoke-test kan efterlade prod-DB-state.

### FN-015 [Kategori E] [Konfidens: verificeret] [Konsekvens: mellem]

**Lokation:** docs/coordination/seneste-rapport.md:5
**Påstand (citat):** "`docs/coordination/rapport-historik/2026-05-15-h010.md` (commit `a0ccdf1`)"
**Faktisk tilstand:** `a0ccdf1` findes lokalt, men er ikke ancestor til aktuel `HEAD`; H010 blev rebased til `70487e0`, merge-commit er `3c6bc0b`, og aktuel `origin/main`/`HEAD` er `27ac90b`. H010-rapporten selv gentager `a0ccdf1`.
**Bevis:** `git merge-base --is-ancestor a0ccdf1 HEAD; echo $?` returnerede `1`. `git show -s --oneline a0ccdf1 70487e0 3c6bc0b 27ac90b` viste `a0ccdf1 H010...`, `70487e0 H010...`, `3c6bc0b H010 committed...`, `27ac90b H010 follow-up...`. `docs/coordination/mathias-afgoerelser.md:192-197` dokumenterer rebase/merge.
**Konsekvens:** Seneste-rapport-pegepinden og H010-rapporten peger på en lokal/pre-rebase commit frem for den commit-historik der faktisk ligger på main.

### FN-016 [Kategori C] [Konfidens: verificeret] [Konsekvens: mellem]

**Lokation:** supabase/migrations/20260514150005_t7_lock_pipeline.sql:341
**Påstand (citat):** "re-lock skal håndtere overskrivning via ON CONFLICT DO NOTHING"
**Faktisk tilstand:** Senere R3/R4-migration ændrede lock-mønstret fra INSERT-kopi til flag-UPDATE. Den aktuelle `_pay_period_lock_internal` opdaterer `is_candidate=false` og `candidate_run_id=null`; der er ingen `ON CONFLICT DO NOTHING` i den aktuelle lock-SQL.
**Bevis:** `supabase/migrations/20260515090000_r3_r4_commission_snapshots_update_flag.sql:207-276`, især `:250-259`.
**Konsekvens:** En migrations-kommentar beskriver en re-lock-mekanisme der ikke længere er den aktuelle SQL-model.

### FN-017 [Kategori E] [Konfidens: verificeret] [Konsekvens: kosmetisk]

**Lokation:** docs/coordination/aktiv-plan.md:5
**Påstand (citat):** "H010 ... afsluttet ved commit-hash der skrives ind her efter samle-commit."
**Faktisk tilstand:** H010 commit-/merge-info er allerede skrevet i `mathias-afgoerelser.md` og `seneste-rapport.md`, men `aktiv-plan.md` er stadig i "skrives ind her efter samle-commit"-tilstand.
**Bevis:** `docs/coordination/mathias-afgoerelser.md:189-197`; `docs/coordination/seneste-rapport.md:5`; `docs/coordination/aktiv-plan.md:5`.
**Konsekvens:** Den officielle aktive-plan-pegepind fremstår ikke afsluttet/opdateret efter den commit den selv venter på.

### FN-018 [Kategori A] [Konfidens: verificeret] [Konsekvens: mellem]

**Lokation:** docs/strategi/arbejds-disciplin.md:342
**Påstand (citat):** "Hver trin-rapport i `docs/strategi/bygge-status.md` skal indeholde en eksplicit `### Vision-tjek`-sektion"
**Faktisk tilstand:** `docs/strategi/bygge-status.md` har ikke en `### Vision-tjek`-sektion. H010-rapporten har vision-tjek i rapport-historik, men den konkrete disciplinregel nævner bygge-status.
**Bevis:** `rg -n "Vision-tjek" docs/strategi/bygge-status.md` returnerer tomt; `docs/strategi/arbejds-disciplin.md:340-345` indeholder reglen.
**Konsekvens:** En papirregel for rapportdisciplin håndhæves ikke i det dokument den specifikt nævner.

### FN-019 [Kategori D] [Konfidens: verificeret] [Konsekvens: kosmetisk]

**Lokation:** docs/coordination/arkiv/r-runde-2-plan.md:51
**Påstand (citat):** "Skriv `docs/permission-matrix.md`"
**Faktisk tilstand:** Den faktiske permission-matrix ligger i `docs/teknisk/permission-matrix.md`. Arkivet indeholder også gamle teknisk-gæld-stier i `r7h-plan.md`.
**Bevis:** `docs/coordination/arkiv/r-runde-2-plan.md:51,70`; `docs/coordination/arkiv/r7h-plan.md:618,658`; faktisk fil: `docs/teknisk/permission-matrix.md`; faktisk teknisk gæld: `docs/teknisk/teknisk-gaeld.md`.
**Konsekvens:** Arkiverede planer har døde/forældede path-referencer efter H010-flytningen. Kosmetisk fordi de er arkiverede, men stadig i scope.

## [uverificeret]-fund

Ingen egentlige uverificerede fund medtages. To ting blev bevidst ikke ophøjet til fund:

- Supabase Pro-tier/PITR: Management API bekræftede projekt `imtxvrymaqbgcvsarlib`, organisation `csasxnonvjrgijqohodl`, `ACTIVE_HEALTHY` og Postgres 17, men endpointet viste ikke plan/PITR-status. Derfor ingen fund.
- README's "Branch-protection: Påkrævede checks + review + linear history": live branch protection har required checks, strict, conversation resolution og linear history; `required_approving_review_count` er 0. Ordet "review" er for tvetydigt til at tælle som verificeret fund.

## Fil-dækningstabel

| Fil                                                                                    | Læst      | Bemærkning                                                      |
| -------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------- | ----------------------------------------- |
| README.md                                                                              | fuldt     | -                                                               |
| CLAUDE.md                                                                              | fuldt     | -                                                               |
| docs/LÆSEFØLGE.md                                                                      | fuldt     | -                                                               |
| docs/strategi/vision-og-principper.md                                                  | fuldt     | -                                                               |
| docs/strategi/arbejdsmetode-og-repo-struktur.md                                        | fuldt     | -                                                               |
| docs/strategi/bygge-status.md                                                          | fuldt     | -                                                               |
| docs/strategi/stork-2-0-master-plan.md                                                 | fuldt     | 1950 linjer                                                     |
| docs/strategi/arbejds-disciplin.md                                                     | fuldt     | -                                                               |
| docs/teknisk/permission-matrix.md                                                      | fuldt     | -                                                               |
| docs/teknisk/lag-e-beregningsmotor-krav.md                                             | fuldt     | -                                                               |
| docs/teknisk/lag-e-tidsregistrering-krav.md                                            | fuldt     | -                                                               |
| docs/teknisk/teknisk-gaeld.md                                                          | fuldt     | -                                                               |
| docs/coordination/aktiv-plan.md                                                        | fuldt     | -                                                               |
| docs/coordination/seneste-rapport.md                                                   | fuldt     | -                                                               |
| docs/coordination/mathias-afgoerelser.md                                               | fuldt     | -                                                               |
| docs/coordination/cutover-checklist.md                                                 | fuldt     | -                                                               |
| docs/coordination/rapport-historik/README.md                                           | fuldt     | -                                                               |
| docs/coordination/rapport-historik/2026-05-15-h010.md                                  | fuldt     | -                                                               |
| docs/coordination/codex-reviews/README.md                                              | fuldt     | -                                                               |
| docs/coordination/arkiv/README.md                                                      | fuldt     | -                                                               |
| docs/coordination/arkiv/r-runde-2-recon.md                                             | fuldt     | -                                                               |
| docs/coordination/arkiv/r-runde-2-plan.md                                              | fuldt     | -                                                               |
| docs/coordination/arkiv/r7h-plan.md                                                    | fuldt     | -                                                               |
| docs/skabeloner/plan-skabelon.md                                                       | fuldt     | -                                                               |
| docs/skabeloner/rapport-skabelon.md                                                    | fuldt     | -                                                               |
| docs/skabeloner/codex-review-prompt.md                                                 | fuldt     | -                                                               |
| .github/CODEOWNERS                                                                     | fuldt     | -                                                               |
| .github/BRANCH_PROTECTION.md                                                           | fuldt     | Suppleret med live `gh api`                                     |
| .github/workflows/ci.yml                                                               | fuldt     | -                                                               |
| .github/workflows/codex-notify.yml                                                     | fuldt     | -                                                               |
| .husky/pre-commit                                                                      | fuldt     | -                                                               |
| scripts/fitness.mjs                                                                    | fuldt     | Kørte også `nvm use 22 && pnpm fitness`                         |
| scripts/migration-gate.mjs                                                             | fuldt     | -                                                               |
| scripts/run-db-tests.mjs                                                               | fuldt     | -                                                               |
| scripts/types-check.sh                                                                 | fuldt     | -                                                               |
| scripts/schema-check.sh                                                                | fuldt     | -                                                               |
| package.json                                                                           | fuldt     | -                                                               |
| pnpm-workspace.yaml                                                                    | fuldt     | -                                                               |
| turbo.json                                                                             | fuldt     | -                                                               |
| .nvmrc                                                                                 | fuldt     | -                                                               |
| .tool-versions                                                                         | fuldt     | -                                                               |
| .npmrc                                                                                 | fuldt     | -                                                               |
| supabase/schema.sql                                                                    | fuldt     | Placeholder snapshot                                            |
| supabase/classification.json                                                           | fuldt     | Transition-fil, tom JSON                                        |
| supabase/tests/README.md                                                               | fuldt     | -                                                               |
| supabase/tests/break_glass/02_gdpr_retroactive_remove_inactive.sql                     | fuldt     | -                                                               |
| supabase/tests/classification/02_retention_value_consistency.sql                       | fuldt     | -                                                               |
| supabase/tests/classification/03_admin_floor_blocks_termination.sql                    | fuldt     | -                                                               |
| supabase/tests/negative/d1c_permanent_blocked_outside_allowlist.sql                    | fuldt     | -                                                               |
| supabase/tests/negative/has_permission_unauthenticated.sql                             | fuldt     | -                                                               |
| supabase/tests/negative/p1b_anonymize_requires_active_strategy.sql                     | fuldt     | -                                                               |
| supabase/tests/negative/q1_employee_active_config_update_without_permission.sql        | fuldt     | -                                                               |
| supabase/tests/negative/r7b_can_view_can_edit_matrix.sql                               | fuldt     | -                                                               |
| supabase/tests/negative/r7d_mapping_legacy_status_active_required.sql                  | fuldt     | -                                                               |
| supabase/tests/negative/r7d_op_type_legacy_status_active_required.sql                  | fuldt     | -                                                               |
| supabase/tests/smoke/01_function_grants_matrix.sql                                     | fuldt     | -                                                               |
| supabase/tests/smoke/d1bc_is_permanent_allowed.sql                                     | fuldt     | -                                                               |
| supabase/tests/smoke/has_permission_admin_grant.sql                                    | fuldt     | -                                                               |
| supabase/tests/smoke/has_permission_can_view_only.sql                                  | fuldt     | -                                                               |
| supabase/tests/smoke/m1_permission_matrix.sql                                          | fuldt     | -                                                               |
| supabase/tests/smoke/p1a_anonymization_strategies.sql                                  | fuldt     | -                                                               |
| supabase/tests/smoke/q1_employee_active_config.sql                                     | fuldt     | -                                                               |
| supabase/tests/smoke/r3_commission_snapshots_immutability.sql                          | fuldt     | -                                                               |
| supabase/tests/smoke/r7a_anonymize_generic_apply_e2e.sql                               | fuldt     | -                                                               |
| supabase/tests/smoke/r7a_break_glass_execute_e2e.sql                                   | fuldt     | -                                                               |
| supabase/tests/smoke/r7a_replay_anonymization_e2e.sql                                  | fuldt     | -                                                               |
| supabase/tests/smoke/r7a_retention_cleanup_cron_e2e.sql                                | fuldt     | -                                                               |
| supabase/tests/smoke/r7d_is_active_status_consistency.sql                              | fuldt     | -                                                               |
| supabase/tests/smoke/superadmin_role_exists_after_rename.sql                           | fuldt     | -                                                               |
| supabase/migrations/20260514120000_t1_drop_public.sql                                  | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260514120006_t1_audit_filter_values.sql                          | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260514130000_t2_superadmin_floor.sql                             | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260514140000_t6_anonymization_tables.sql                         | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260514150001_t7_commission_snapshots.sql                         | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260514150005_t7_lock_pipeline.sql                                | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260514160001_t7_disable_auto_lock_until_compute_real.sql         | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260514170001_c005_admin_floor_termination.sql                    | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260514170002_c006_break_glass_allowlist.sql                      | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260514170003_c001_retention_not_null.sql                         | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260514170004_c002_c003_anonymization_dispatcher.sql              | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260514180000_g028_classify_anonymization_dispatcher_columns.sql  | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260514180400_d1b_is_permanent_allowed.sql                        | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260514180500_d1_d2_drop_legal_convert_rows.sql                   | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260514180600_d1c_validate_permanent_classification.sql           | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260514190000_q_seed_permissions.sql                              | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260514190100_q_audit_rpcs.sql                                    | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260514190200_q_class_anon_rpcs.sql                               | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260514190300_q_break_glass_rpcs.sql                              | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260514190400_q_hr_rpcs.sql                                       | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260514190500_q_pay_rpcs.sql                                      | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260515090000_r3_r4_commission_snapshots_update_flag.sql          | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260515100000_r5_for_update_lock_pipeline.sql                     | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260515100100_r6_drop_legacy_candidate_tables.sql                 | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260515110000_p0_gdpr_responsible_employee.sql                    | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260515110200_p1b_anonymize_generic_apply.sql                     | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260515120100_p3_break_glass_operation_types_lifecycle.sql        | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260515130100_r7b_has_permission_can_view_required.sql            | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260515130200_r7c_verify_anonymization_consistency_permission.sql | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260515130300_r7d_is_active_status_alignment.sql                  | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql    | fuldt     | Header mod SQL tjekket                                          |
| supabase/migrations/[øvrige 45 migrations]                                             | ikke læst | Repoet har 76 migrations pr. `rg --files supabase/migrations    | wc -l`; 31 fuldt læst, 45 uden for sample |
| Live GitHub branch protection                                                          | fuldt     | `gh api repos/Cphsales/stork-2.0/branches/main/protection`      |
| Live Supabase project list                                                             | fuldt     | Bekræftede project ref + org id, ikke plan/PITR                 |
| Live Supabase DB queries                                                               | fuldt     | G028, pay_period triggers, lifecycle-state, pay_period_settings |

## Refleksion

De mest friske-øjne fund lå ikke i SQL-bugs, men i statusfelter der ikke blev opdateret efter rebase/merge og dokumentflyt.
Code-blindspotten ser ud til at være "det jeg lige har bygget er nu implicit sandt", særligt permission-matrix og arbejdsmetode-status.
Live DB-introspection afslørede én stale auto-genereret sandhed: lifecycle-strategierne var ikke længere 3 rows.
H010-refactor skabte små døde referencer: vision-tjek flyttet ud af CLAUDE, men skabelonen peger stadig tilbage.
Migrationssamplet gav ét reelt kommentar-vs-SQL fund: T7-kommentaren om ON CONFLICT overlevede R3-flagmodellen.
Jeg ramte kort en untracked Code-auditfil i en bred `rg`; derefter brugte jeg kun primærfiler/kommandoer som bevis.
