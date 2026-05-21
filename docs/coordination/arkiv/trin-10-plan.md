# Trin 10 — Plan V14

**Pakke:** §4 trin 10 — Klient-skabelon + felt-definitioner
**Krav-dok:** `docs/coordination/trin-10-krav-og-data.md` (PR #63, commit `8c3c7b9`)
**Branch:** `claude/trin-10-plan-v3`
**Status:** V14 — Codex APPROVED V13 (runde 13); V14 lukker proaktivt fund fra Code walk-through
**Dato:** 2026-05-21

---

## Codex runde 13 + Code walk-through (LØS — V5.3 svar-typer)

Codex runde 13 leverede **APPROVAL** på V13. Code's parallel grundige walk-through (Mathias-instruks "vi skal vel løse de huller") fandt 1 yderligere hul som Codex missede.

| #   | Severity            | V13-step                   | Fund                                                                                                                                                                                                                                                                                                                                                                     | V14-svar                                                                                                                                                                                                                             | Hvor i V14      |
| --- | ------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| 1   | KRITISK/FUNKTIONELT | T10.7b `client_node_close` | Wrapper mangler klient-eksistens-check. Bryder krav-dok §3.4 "valideres at klienten faktisk findes" ved BÅDE oprettelse OG ændring. Close er en ændring. Uden check: pending oprettes på ikke-eksisterende client_id → `_apply_client_close` UPDATE'er 0 rows → silent no-op. `client_node_place` har check siden V7; `client_node_close` blev tilføjet i V9 uden check. | **ACCEPT.** Tilføj `if not exists (select 1 from core_identity.clients where id = p_client_id) then raise P0002` i `client_node_close` wrapper FØR session-var + pending_change_request. Konsistent med client_node_place's mønster. | T10.7b + T10.15 |

**Code walk-through-disciplin lockes:** Codex' fokus var aktiv-check + audit-PII + test-setup. Eksistens-check på close-vejen var ikke i Codex' scan-pattern. Walk-through skal proaktivt verificere KRAV-DOK § for § mod hver wrapper/apply-handler, ikke kun "hvad Codex har set."

---

## Codex runde 12 (LØS — V5.3 svar-typer)

| #   | Severity          | V12-step                             | Fund                                                                                                                                                                                                                                                          | V13-svar                                                                                                                                                                                                                                                                                               | Hvor i V13 |
| --- | ----------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| 1   | TEKNISK-BLOKERING | T10.15 `t10_client_active_check.sql` | T9 seed (`20260518000004:228-229`) sætter `undo_settings.undo_period_seconds = 24*3600` for `client_place`/`client_close`. `pending_change_apply` stopper med `not_yet_due` før dispatch til `_apply_client_place`. Test rammer due-gate, ikke aktiv-checken. | **ACCEPT.** T10.15 udvidet med setup-disciplin: BEGIN-blokken sætter `set_config('stork.t9_write_authorized', 'true', true)` + UPDATE `undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place', 'client_close')` transaction-local. ROLLBACK ved test-slut sikrer ingen lækage. | T10.15     |

---

## Codex runde 11 (LØS — V5.3 svar-typer)

| #   | Severity              | V11-step | Fund                                                                                                                                                                                                                                                    | V12-svar                                                                                                                                                                                                                                                                                                   | Hvor i V12     |
| --- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 1   | KRITISK-SIKKERHEDSHUL | T10.4    | `clients.logo_filename` klassificeret som `pii_level='none'` → brugerleveret filnavn lander i klartekst i audit_log. Inkonsistent med `clients.name='direct'` (forsigtigheds-pattern). Filnavne kan realistisk indeholde klient-/personidentifikatorer. | **ACCEPT + proaktiv udvidelse.** `logo_filename` → `pii_level='direct'`. **Plus:** `logo_bytes` → `'direct'` (binær billed-data kan vise stifter/medarbejdere — samme forsigtigheds-pattern). `logo_content_type` forbliver `'none'` (kun MIME-type). T10.15's logo-test udvides med audit-hash-assertion. | T10.4 + T10.15 |

---

## Codex runde 10 (LØS — V5.3 svar-typer)

| #   | Severity          | V10-step                     | Fund                                                                                                                                                                                                                                      | V11-svar                                                                                                                                                                                                                        | Hvor i V11 |
| --- | ----------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | KRITISK           | Fundament-tjek               | Tabellen nævner kun T10.8/T10.9/T10.10/T10.11 + T10.13. V10 tilføjer/ændrer write-veje i T10.7b (`client_node_place`, `client_node_close`, `_apply_client_place`) + T10.10a (`client_field_definition_set_active`) — manglende krydstjek. | **ACCEPT.** Fundament-tjek-tabel udvidet med T10.7b (GRANT/policy/session-var + apply-dispatch + jsonb payload producer/consumer) og T10.10a. Eksempel-row-tjek udvidet med immutable-key + pii-downgrade-block + active-check. |
| 2   | G-NUMMER-KANDIDAT | T10.16 / Oprydnings-strategi | T10.16 nævner FK-coverage som G-nummer-kandidat, men oprydnings-strategi siger "Ingen G-numre forventet". Inkonsistent.                                                                                                                   | **ACCEPT.** **G058** registreret i `docs/teknisk/teknisk-gaeld.md` (FK-coverage-fitness-check ikke implementeret per master-plan §3.19). Oprydnings-strategi opdateret til at angive G057 + G058 som del af trin 10.            |

Plus V10-amendment (`923543c` efter V10's hoved-commit): helper grants matcher is_admin's pattern (authenticated + anon + service_role).

---

## Codex runde 9 (LØS — V5.3 svar-typer)

Codex runde 9 fandt 1 TEKNISK-BLOKERING: `_apply_client_place` bruger `is_admin()` til superadmin-bypass, men `auth.uid()` er NULL i cron-apply-context. Superadmin's pending kan fejle ved cron-apply hvis klient deaktiveres mellem pending og apply.

| #   | Severity          | V9-step              | Fund                                                                                                                                                                                                     | V10-svar                                                                                                                                                                                                                                                                                                                                                             | Hvor i V10                      |
| --- | ----------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 1   | TEKNISK-BLOKERING | T10.7b apply-handler | `is_admin()` returnerer false i cron-context (ingen `auth.uid()`). Wrapper-bypass evalueres mod current user, apply-bypass mod cron-rolle → inkonsistent. Superadmin's pending kan fejle ved cron-apply. | **ACCEPT (option A).** Tilføj ny helper `core_identity.is_admin_by_employee_id(p_employee_id uuid) returns boolean` der tjekker employee-rolle direkte (ikke `auth.uid()`). Apply-handler henter `requested_by` + `approved_by` fra pending_changes-rækken og kalder helperen. Bypass hvis EITHER er superadmin. Wrapper beholder `is_admin()` (altid auth-context). | T10.7b udvidet + T10.15 udvidet |

**Design-begrundelse:** Wrapper kører altid med auth-context (direct user-call) → `is_admin()` virker. Apply-handler kører i to contexts: direct admin-call OG cron-call (ingen auth). For konsistens skal apply-bypass være baseret på pending-rækkens employee-historie. "Bypass hvis EITHER requester eller approver er superadmin" matcher "superadmin må alt"-reglen — superadmin's involvering på enten oprettelses- eller godkendelses-side legitimerer apply.

---

## Codex runde 8 (LØS — V5.3 svar-typer)

Codex runde 8 fandt 1 TEKNISK-BLOKERING + 1 G-nummer-kandidat. Code's parallel walk-through fandt ingen yderligere fund.

| #   | Severity                  | V8-step                    | Fund                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | V9-svar                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Hvor i V9      |
| --- | ------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 1   | TEKNISK-BLOKERING         | T10.7b + client_node_close | `client_node_place` kalder `pending_change_request` som INSERT'er i `core_identity.pending_changes`. Tabellen har INSERT-policy (T9-fundament-supplement `20260518100000:49-51`) der kræver `current_setting('stork.t9_write_authorized', true) = 'true'`. T10.7b's CREATE OR REPLACE sætter ikke session-var → INSERT vil fejle for authenticated-bruger med FORCE RLS. Samme latente T9-bug findes i `client_node_close` (uændret af V8) og de øvrige 5 T9-pending-wrappers (org*node_upsert, etc.) — men trin 10's scope er kun client-RPC'erne. **Code walk-through missede dette** fordi T9-tests bruger `\_apply*\*`-handlers direkte, aldrig fuld wrapper-vej. | **ACCEPT.** T10.7b udvides: `client_node_place` sætter `set_config('stork.t9_write_authorized', 'true', true)` efter aktiv-check, før `pending_change_request`. Plus ny CREATE OR REPLACE af `client_node_close` med samme session-var (uden aktiv-check — `client_node_close` skal kunne lukke placement på inaktiv klient). Default-privileges på `core_identity` schema (`grant execute on functions to authenticated`, T1) dækker GRANT-kravet — explicit GRANT er ikke nødvendigt. | T10.7b udvidet |
| 2   | G-NUMMER-KANDIDAT → ADOPT | T10.13                     | Tab/grant-INSERT-queries filtrerer på `p.name in ('clients', 'client_field_definitions')` uden at scope til `org_structure`-area. Hvis nogen senere tilføjer page med samme navn i andet area (usandsynligt, men ikke robust).                                                                                                                                                                                                                                                                                                                                                                                                                                        | **ADOPT.** Trivielt fix: scope queries til `org_structure`-area via JOIN på area_id.                                                                                                                                                                                                                                                                                                                                                                                                    | T10.13         |

**T9-public-wrapper-bug (Code-observation):** Codex' fund afslører at T9's 7 public-wrappers (`org_node_upsert`, `org_node_deactivate`, `team_close`, `employee_place`, `employee_remove_from_node`, `client_node_place`, `client_node_close`) alle mangler `t9_write_authorized`-session-var. Trin 10's scope er kun de to client-RPC'er; de øvrige 5 er T9-arbejde der skal adresseres som G-nummer/separat pakke (T9 ville fungere i tests fordi `_apply_*`-handlers er SECURITY DEFINER og kan kaldes direkte, men authenticated-bruger via wrapper-vej er broken).

**Walk-through-disciplin V9:** "Fuldt gear" skal omfatte sporing af hver RPC's komplette write-vej til alle berørte RLS-tabeller, ikke kun den direkte tabel. Hver write-RPC's call-chain skal verificeres mod alle policies på destination-tabeller.

---

## Codex runde 7 + Code grundig walk-through (LØS — V5.3 svar-typer)

Codex-runde 7 fandt 1 KRITISK. Code's parallel grundige walk-through (Mathias-instruks "fuldt gear") fandt 3 yderligere fund (2 KRITISK + 1 MELLEM) som Codex missede.

| #   | Severity | V7-step                | Fund                                                                                                                                                                                                                                                                                        | Kilde             | V8-svar                                                                                                                                                                                                                                                                          |
| --- | -------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | KRITISK  | T10.6                  | `clients_validate_fields()` trigger-funktion har `cfd.is_active = true` filter. Rammer fitness-check `legacy-is-active-readers` (`scripts/fitness.mjs:830-892`). T10.16 allowlister kun `client_field_definitions_list`.                                                                    | Codex runde 7     | **ACCEPT.** Udvid T10.16 med `core_identity.clients_validate_fields`. Forretningsmæssigt korrekt at filtrere på aktive felt-definitioner i validate-trigger (LENIENT: ukendte/inaktive keys → warning) — det er ikke R7d-pattern (employees-dual-column), bare lifecycle-signal. |
| 2   | KRITISK  | T10.8                  | `client_upsert` UPDATE-branch sætter `is_active = p_is_active` (default `true`). En admin der opdaterer navn på en inaktiv klient uden eksplicit at sende p_is_active=false **reaktiverer klienten utilsigtet**. Bryder krav-dok §3.1's distinction af "Ændr klient" vs "Deaktivér klient". | Code walk-through | **ACCEPT.** Drop `is_active` fra T10.8's UPDATE-SET-klausul. p_is_active gælder kun INSERT-branch. Aktiv-toggle sker via `client_set_active` (T10.9). Matcher logo-pattern (rør'es ikke i client_upsert).                                                                        |
| 3   | KRITISK  | T10.10                 | `client_field_definition_upsert` UPDATE-branch har **samme bug** med `p_is_active` default true → opdatering af inaktiv felt-definition reaktiverer den utilsigtet.                                                                                                                         | Code walk-through | **ACCEPT.** Drop `is_active` fra T10.10's UPDATE-SET-klausul. + ny T10.10a (se #4).                                                                                                                                                                                              |
| 4   | MELLEM   | T10.10 / krav-dok §3.2 | Krav-dok §3.2 specificerer "Deaktivér felt-definition" som distinct funktion, men V7 har kun samlet `client_field_definition_upsert`. Ingen direct toggle-RPC.                                                                                                                              | Code walk-through | **ACCEPT.** Ny step **T10.10a**: `client_field_definition_set_active(p_field_id, p_is_active, p_change_reason)`. Matcher `client_set_active`-mønstret + krav-dok §3.2.                                                                                                           |

**Superadmin-bypass-konsistens (Mathias-bekræftet 2026-05-21):** T10.7b's aktiv-check har superadmin-bypass (forretnings-invariant), men T10.10's `key`+`pii_level direct→non-direct` har **IKKE** bypass — det er **sikkerheds-invariant** (audit-PII-datalæk i klartekst), ikke forretnings-regel. Sikkerheds-invariants står over "superadmin må alt". Konsistent disciplin.

**Code walk-through-pass verificeret (positivt):**

- Alle 14 fitness-checks gennemgået; kun R7d ramt (T10.6 + T10.12 → T10.16-allowlist dækker begge)
- migration-set-config-discipline: T10.4 + T10.13 sætter source_type + change_reason korrekt
- pii_level escalation (none→indirect→direct) sikker — eksisterende klartekst-værdier i historisk audit_log er retro-acceptable (de blev IKKE hash'et da pii_level var none ved INSERT-tidspunktet)
- audit_filter_values STABLE + mutable-tabel-læsning matcher T1-mønster
- postgrest-sentinel-list rammer kun T9-RPCs, ikke T10

---

## Mathias-terminal-review V6 (LØS — V5.3 svar-typer)

V6's grundlæggende design er bekræftet OK i terminal-review (no-dedup-markers, ON CONFLICT, tab-aware read-paths, T10.16-retning, begin/rollback for FK-test). Men review fandt 4 yderligere fund hvor V6 stadig ikke matchede krav-dok eller havde stale tekst.

| #   | Severity | V6-step            | Fund                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | V7-svar                                                                                                                                                                                                                                                                                                                                                                                                            | Hvor i V7                     |
| --- | -------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| 1   | KRITISK  | T10.7 (FK)         | FK sikrer KUN eksistens, ikke at klient er aktiv. Krav-dok §2.5.2: "Inaktiv klient bliver stående for historik, men kan ikke vælges som ny team-tilknytning." T9-wrapper `client_node_place` (`20260518000007:140-170`) validerer permission + team-only, men ikke aktiv klient. T9-supplement `_apply_client_place` (`20260520000000:285-352`) validerer team-only + team-aktiv, men ikke klient-aktiv. Krav-dok §3.4 siger "valideres at klienten faktisk findes" — sammen med §2.5.2 betyder det: findes + aktiv. Plus: pending kan oprettes mens klient aktiv og applies efter deaktivering → apply-pathen SKAL også tjekke. | **ACCEPT.** Ny step T10.7b: CREATE OR REPLACE begge RPC'er med aktiv-check **og superadmin-bypass** (Mathias 2026-05-21: "superadmin må alt"). Wrapper-rækkefølge: has_permission → team-check → klient-eksistens (P0002) → klient-aktiv (22023 hvis ikke superadmin). Apply-handler: tilføj klient-eksistens (P0002) + klient-aktiv (P0001 hvis ikke superadmin) FØR INSERT/UPDATE. `client_node_close` rør IKKE. | T10.7b (ny) + T10.15          |
| 2   | MELLEM   | Plan-tekst         | To stale referencer til "fjern client_id fra FK_COVERAGE_EXEMPTIONS" på linje 113 (Verificerede afhængigheder-tabel) + linje 142 (Scope-bullet). En implementeringsagent kan følge den forkerte del og lede efter ikke-eksisterende allowlist.                                                                                                                                                                                                                                                                                                                                                                                   | **ACCEPT.** Omformulér begge linjer til at matche T10.16's korrekte V6-retning (R7d-allowlist, ikke FK-allowlist).                                                                                                                                                                                                                                                                                                 | Linje 113 + 142               |
| 3   | MELLEM   | T10.15             | Smoke-test dækker FK-eksistens + ON DELETE RESTRICT, men ikke det vigtigste forretningskrav (krav-dok §2.5.2: inaktiv klient kan ikke vælges).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | **ACCEPT.** Ny separat smoke-test `t10_client_active_check.sql` med 4 scenarier: aktiv place success, inaktiv place rejection (22023), pending-mens-aktiv + deaktiver + apply rejection (P0001), close virker på inaktiv klient.                                                                                                                                                                                   | T10.15 + ny test-fil          |
| 4   | LAV      | T10.4 + Konklusion | "alle 9 kolonner" + "(9 kolonner)" på `client_field_definitions` — SQL har 10 rækker (id, key, display_name, field_type, required, pii_level, display_order, is_active, created_at, updated_at). Plus konklusion-historik siger T10.4 ON CONFLICT er "DEFER", men V6 gjorde det obligatorisk. Codex V1-fund-tabel siger stadig "DEFER → G-nummer".                                                                                                                                                                                                                                                                               | **ACCEPT.** Tekstrettelser: 9→10 på `client_field_definitions`; opdatér V1-fund-tabel (linje 68) og Konklusion-historik (linje 1335) til at reflektere V6's ACCEPT.                                                                                                                                                                                                                                                | T10.4 + linje 68 + linje 1335 |

**Rettigheds-grænse (Mathias-bekræftet 2026-05-21):** Trin 10 introducerer ingen nye permission-koncepter ift. T9. Permission-modellen (`has_permission` resolver + areas/pages/tabs/grants) er etableret i T9; trin 10 udvider den med 2 nye pages under `org_structure`-area. Ingen klient-baseret adgangs-scope (det ville være senere pakke hvis besluttet). Aktiv-check (T10.7b) er en forretnings-**invariant**, ikke en permission-check — den håndhæves uafhængigt af caller-identitet.

**Stamme/rådata-disciplin (Mathias-bekræftet 2026-05-21):** Krav-dok §2.5.1 + §2.1.1: klient-rækker (stammen) bevares evigt; rå data (salg/calls) følger klienten med dato-binding. Min plan respekterer dette: ingen DELETE-policy på `core_identity.clients`, ingen anonymisering, immutable `key`/`pii_level` på felt-definitioner, audit-trigger på alle write-veje. Lovlige UPDATE'er (name, fields, is_active, logo) bevarer audit-spor i `audit_log`.

---

## Mathias-terminal-review V5 + Code grundig validering (LØS — V5.3 svar-typer)

V5 fik Codex-automation APPROVAL i runde 5, men Mathias' selvstændige terminal-review afslørede 3 KRITISK-fund som automation-runden missede. Mathias bad om grundig validering før V6 — Code har genlæst hele planen op mod nuværende kode (fitness-script, T1-T9-migrations) og fundet 3 yderligere problemer som automation-runden også missede.

| #   | Severity            | V5-step                                         | Fund                                                                                                                                                                                                                                                                                                                                                   | Kilde            | V6-svar                                                                                                                                                                                                                                                                                                                                                                                                |
| --- | ------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | KRITISK             | T10.1 + T10.2                                   | Tabellerne mangler `-- no-dedup-key: <reason>` marker. Fitness-check `dedup-key-or-opt-out` (`scripts/fitness.mjs:422-450`) blokerer alle nye CREATE TABLE uden dedup_key-kolonne eller eksplicit opt-out-marker.                                                                                                                                      | Mathias-terminal | **ACCEPT.** Tilføj T9-stil marker over begge CREATE TABLE-statements.                                                                                                                                                                                                                                                                                                                                  |
| 2   | KRITISK             | T10.4                                           | INSERT i `core_compliance.data_field_definitions` mangler `ON CONFLICT do nothing`. `core_compliance.data_field_definitions` er på `BOOTSTRAP_CONFIG_TABLES` (`scripts/fitness.mjs:162-172`); `migration-on-conflict-discipline` (`:675-737`) håndhæver det. V5's DEFER til G-nummer var forkert — fitness brækker.                                    | Mathias-terminal | **ACCEPT.** Tilføj `on conflict (table_schema, table_name, column_name) do nothing`. Fjern G-nummer-kandidat-tekst fra Optimerings-hypoteser (det er ikke en optimering, det er krav).                                                                                                                                                                                                                 |
| 3   | KRITISK/FUNKTIONELT | T10.1 + T10.2 + T10.8 + T10.9 + T10.11 + T10.12 | `has_permission(p_page, NULL, false)` med `p_tab_key=NULL` springer tab-resolver over (`20260518000010_t9_seed_owners.sql:35`) og prøver kun page/area-grants. T10.13 seeder kun TAB-grants → read-paths matcher INGEN grant og returnerer false → SELECT-policy + read-RPC'er tilbageholder data for legitime brugere med kun `clients/manage`-grant. | Mathias-terminal | **ACCEPT.** Skift alle read-paths til tab-aware: `has_permission('clients', 'manage', false)` og `has_permission('client_field_definitions', 'manage', false)`. Berører SELECT-policies (T10.1 + T10.2), client_get/client_list/client_field_definitions_list (T10.12), client_logo_get (T10.11). Write-paths bruger allerede 'manage' tab — konsistent.                                               |
| 4   | KRITISK-FABRIKATION | T10.16                                          | Plan refererer `FK_COVERAGE_EXEMPTIONS`-allowlist i scripts/fitness.mjs, men den findes IKKE. Master-plan §3 punkt 19 specificerer fitness-checken men den er ikke implementeret. T9-migration-kommentar (`20260518000004_t9_client_node_placements.sql:5`) er forhåndsdokumentation, ikke nuværende fitness-check.                                    | Code-validering  | **ACCEPT.** Omformulér T10.16: i stedet for "fjern client_id fra allowlist", verificér at FK-coverage-checken er implementeret; hvis ikke, ingen fitness-script-ændring nødvendig for FK. **Plus** tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (fund #5). G-nummer-kandidat for "FK-coverage-fitness-check ikke implementeret per master-plan §3.19". |
| 5   | KRITISK             | T10.12 client_field_definitions_list            | RPC bruger `where p_include_inactive or is_active = true` — matcher fitness-check `legacy-is-active-readers` (`scripts/fitness.mjs:830-892`) regex. client_field_definitions har KUN is_active (ingen status-kolonne), så funktionen skal allowlist'es i `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS`.                                                          | Code-validering  | **ACCEPT.** Tilføj `core_identity.client_field_definitions_list` til allowlisten via T10.16's fitness-script-ændring.                                                                                                                                                                                                                                                                                  |
| 6   | KRITISK             | T10.15 `t10_client_node_placements_fk.sql`      | Smoke-test INSERT'er i `core_identity.client_node_placements` som er på `TX_WRAP_REQUIRED_FOR_TEST_INSERT` (`scripts/fitness.mjs:110`). Fitness-check `db-test-tx-wrap-on-immutable-insert` (`:901-924`) kræver `begin;` + `rollback;` på linje-niveau.                                                                                                | Code-validering  | **ACCEPT.** Eksplicit `begin;` + `rollback;` wrap-pattern i T10.15's FK-test specifikation. T10.7a's fixture-INSERT i T9-tests sker indenfor eksisterende BEGIN/ROLLBACK (verificeret: `t9_placements.sql:9` + `:213`, `t9_backdated_historical_traversal.sql:9` + `:311`).                                                                                                                            |

**Falsk-positiv-rod-årsag:** Codex-automation kører `codex exec` med model-reasoning; den læser plan-fil + plan-prefix-instruktioner men ikke nødvendigvis fitness-script-kilden eller has_permission-implementering. Den fanger mønstre den allerede kender; den fanger ikke fitness-checks den ikke ved findes. Manuel walk af plan op mod kode (fitness.mjs + has_permission-body + TX_WRAP_REQUIRED) er nødvendig.

---

## Codex V4-fund-håndtering (LØS — V5.3 svar-typer)

Codex runde 4 (review-fil: `docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md`) leverede 1 fund.

| #   | Severity | V4-step       | Fund                                                                                                                                                                                                                                               | V5-svar                                                                                                                                                                                                                                                                                   | Hvor i V5     |
| --- | -------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 1   | KRITISK  | T10.1 + T10.2 | Tabellerne har kun `GRANT SELECT to authenticated`. Mangler `GRANT INSERT, UPDATE` der er nødvendigt før RLS-policy/session-var-vejen kan virke for write-RPC'erne (T10.8-T10.11). Bryder niveau 1-prefixens GRANT + policy + session-var-tre-pak. | **ACCEPT.** Tilføj `grant insert, update on table core_identity.clients to authenticated` i T10.1 og tilsvarende for `client_field_definitions` i T10.2. Ingen DELETE-grant (inaktivering via is_active, ikke DELETE). Matcher T1's mønster for `core_compliance.data_field_definitions`. | T10.1 + T10.2 |

---

## Codex V3-fund-håndtering (LØS — V5.3 svar-typer)

Codex runde 3 (review-fil: `docs/coordination/codex-reviews/2026-05-20-trin-10-runde-3.md` på `claude/trin-10-plan-v3`) leverede 1 fund.

| #   | Severity | V3-step | Fund                                                                                                                                                                                                                                                                                                                                | V4-svar                                                                                                                                 | Hvor i V4               |
| --- | -------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 1   | KRITISK  | T10.13  | T10.13 sætter `stork.source_type` + `stork.change_reason` men IKKE `stork.t9_write_authorized = 'true'` som T9-supplements INSERT-policies på `permission_pages` / `permission_tabs` / `role_permission_grants` kræver. Brudt niveau 1-prefix end-to-end-tjek for INSERT/UPDATE/DELETE-veje (GRANT + policy + session-var-tre-pak). | **ACCEPT.** Tilføj `select set_config('stork.t9_write_authorized', 'true', false);` før INSERTs i T10.13. Opdater Fundament-tjek-tabel. | T10.13 + Fundament-tjek |

---

## Codex V2-fund-håndtering (LØS — V5.3 svar-typer)

Codex runde 2 (review-fil: `docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md` på `claude/trin-10-plan-v3`) leverede 2 fund.

| #   | Severity              | V2-step        | Fund                                                                                                                                                                                                                                                                                                 | V3-svar                                                                                                                                                                                                                     | Hvor i V3                          |
| --- | --------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 1   | KRITISK-SIKKERHEDSHUL | T10.10 / T10.5 | Audit-hashing afhænger af mutable `client_field_definitions.key`/`pii_level`. Hvis felt-definitionen senere får ny `key` eller `pii_level='none'`, vil eksisterende `clients.fields`-værdier skrives i klartekst i audit. V2-fixet for `is_active=false` dækker ikke key-rename eller pii-downgrade. | **ACCEPT.** Gør `key` og `pii_level` effektivt immutable for eksisterende definitions via T10.10's RPC: blokér UPDATE af `key`; blokér `pii_level` direct → non-direct. Tilføj smoke-test der verificerer begge invariants. | T10.10 + T10.15                    |
| 2   | KRITISK               | T10.3          | Min plan baserede sig på D1b's gamle allowlist og missede P1a's tilføjelse af `('core_compliance', 'anonymization_strategies', null)`. CREATE OR REPLACE ville regressere allowlisten og kan blokere fremtidige updates af permanent-klassifikationer for den tabel.                                 | **ACCEPT.** T10.3 baseres på P1a's VALUES-blok (15 entries) + tilføjer 2 nye trin 10-entries (17 total). Recon-først udvidet med P1a's omskrivning.                                                                         | T10.3 + Verificerede afhængigheder |

---

## Codex V1-fund-håndtering (LØS — V5.3 svar-typer)

Codex runde 1 (review-fil: `docs/coordination/codex-reviews/2026-05-20-trin-10-runde-1.md` på `claude/trin-10-plan-v3`) leverede 4 fund.

| #   | Severity              | V1-step | Fund                                                                                                                                                                      | V2-svar                                                                                                                                                                                                                                                                             | Hvor i V2      |
| --- | --------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 1   | KRITISK               | T10.1   | `clients.fields` mangler `CHECK (jsonb_typeof = 'object')` — scalar/array kan lagre uden audit-PII-walking.                                                               | **ACCEPT.** Tilføj CHECK på T10.1. Smoke-test i T10.15 udvides.                                                                                                                                                                                                                     | T10.1 + T10.15 |
| 2   | KRITISK-SIKKERHEDSHUL | T10.5   | audit_filter_values clients-special-case filtrerer `is_active = true` → hvis felt deaktiveres, hashes værdier i eksisterende fields ikke længere. Datalæk i audit-flowet. | **ACCEPT.** Fjern `is_active = true`-filter fra audit_filter_values clients-special-case. Hash alle direct-PII keys uanset is_active. Validation-trigger kan stadig behandle inactive som ukendt key.                                                                               | T10.5          |
| 3   | MELLEM                | T10.15  | Smoke-tests dækker ukendt key lenient/strict, men ikke non-object `fields`.                                                                                               | **ACCEPT.** Tilføj test for CHECK-violation ved non-object.                                                                                                                                                                                                                         | T10.15         |
| 4   | G-NUMMER-KANDIDAT     | T10.4   | INSERT mangler `ON CONFLICT do nothing` (T9-classify bruger det). Ikke blocker for greenfield.                                                                            | **V2-svar: DEFER → G-nummer** (greenfield-engangsmigration). **V6 OVERSKRIVER: ACCEPT** — fitness-check `migration-on-conflict-discipline` håndhæver det på `core_compliance.data_field_definitions`. Plan har nu `ON CONFLICT (table_schema, table_name, column_name) DO NOTHING`. | T10.4          |

---

## Recon-historik

Tidligere plan-forsøg på `claude/trin-10-plan-v2`-branchen (V1-V3, commits `f8d110e`, `8b4033e`, `a2ca60c`) byggede fejlagtigt på D5's pre-T1 `public.clients`-tabel. T1's drop-migration (`20260514120000_t1_drop_public.sql:36-47`) fjerner hele D5's public-schema; ingen post-T1 migration genskaber den. Codex runde 3 fangede dette som TEKNISK-BLOKERING. Denne plan starter fra bunden med korrekt schema-grundlag: `core_identity.clients` etableres fra nul, ikke ALTER på ikke-eksisterende tabel.

---

## Verificerede afhængigheder

Recon-først per `docs/coordination/overvaagning/code-overvaagning.md`. Hver påstand om eksisterende artefakt har file:linje-reference.

| Afhængighed (RPC / tabel / kolonne / migration)                                                        | Verificeret fra (file:linje)                                                                                   | Note (signatur, struktur, invariant)                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schema-arkitektur (3 core\_\*-schemas)                                                                 | `supabase/migrations/20260514120001_t1_schemas_and_defaults.sql:11-22`                                         | `core_compliance` (audit, klassifikation, anonymization), `core_identity` (medarbejdere, identitets-master, org-træ, teams, **roller, klienter**, lokationer), `core_money` (salg, pricing, vagter, lønperiode). Master-plan §1.11 placerer klienter i core_identity.                                                                                                                                   |
| T1-drop af D5's public-schema                                                                          | `supabase/migrations/20260514120000_t1_drop_public.sql:32-92`                                                  | Dropper `public.clients`, `public.client_field_definitions`, `public.client_upsert`, `public.client_field_definition_upsert`, `public.clients_validate_fields`, `public.audit_filter_values`, `public.is_admin()`, `public.stork_audit()` etc. INGEN post-T1 migration genskaber clients.                                                                                                               |
| `core_compliance.data_field_definitions` (tabel)                                                       | `supabase/migrations/20260514120005_t1_data_field_definitions.sql:9-30`                                        | `id, table_schema, table_name, column_name, category text CHECK IN ('operationel','konfiguration','master_data','audit','raw_payload'), pii_level CHECK IN ('none','indirect','direct'), retention_type CHECK IN ('time_based','event_based','legal','manual'), retention_value jsonb, match_role text, purpose text NOT NULL, created_at, updated_at`. UNIQUE (table_schema, table_name, column_name). |
| `core_compliance.data_field_definitions` retention-types udvidet til 'permanent'                       | `supabase/migrations/20260514170003_c001_retention_not_null.sql:42-46`                                         | CHECK udvidet: `('time_based', 'event_based', 'legal', 'manual', 'permanent')`. retention_type SET NOT NULL. Permanent → retention_value NULL.                                                                                                                                                                                                                                                          |
| Retention-types efter legal-drop                                                                       | `supabase/migrations/20260514180500_d1_d2_drop_legal_convert_rows.sql:49-51`                                   | CHECK: `(retention_type is null or retention_type in ('time_based', 'event_based', 'manual', 'permanent'))`. Legal fjernet (mathias-afgoerelse 2026-05-14). retention_type drop not null.                                                                                                                                                                                                               |
| `core_compliance.is_permanent_allowed` D1b-original                                                    | `supabase/migrations/20260514180400_d1b_is_permanent_allowed.sql:14-46`                                        | IMMUTABLE-funktion med 14 entries i VALUES-blok.                                                                                                                                                                                                                                                                                                                                                        |
| `core_compliance.is_permanent_allowed` P1a-omskrivning (nuværende state på main)                       | `supabase/migrations/20260515110100_p1a_anonymization_strategies.sql:230-262`                                  | CREATE OR REPLACE med 15 entries (D1b + `('core_compliance', 'anonymization_strategies', null)`). **Trin 10 SKAL baseres på P1a's komplette VALUES**, ikke D1b's gamle baseline — ellers regression (Codex V2 KRITISK #2).                                                                                                                                                                              |
| `core_compliance.validate_permanent_classification()` trigger                                          | `supabase/migrations/20260514180600_d1c_validate_permanent_classification.sql:14-31`                           | BEFORE INSERT/UPDATE på data_field_definitions. Raiser hvis retention_type='permanent' AND ikke i allowlist.                                                                                                                                                                                                                                                                                            |
| `core_compliance.audit_filter_values(p_schema, p_table, p_values jsonb)`                               | `supabase/migrations/20260514120006_t1_audit_filter_values.sql:9-86`                                           | Walker top-level kolonner. pii_level='direct' → sha256-hash. LENIENT-default ved ukendt schema/tabel/kolonne; strict via `stork.audit_filter_strict='true'`. **Ingen clients-special-case** (D5's omskrivning blev droppet med T1). Trin 10 SKAL omskrive til at walke `clients.fields jsonb`.                                                                                                          |
| `core_compliance.stork_audit()` trigger-funktion                                                       | Refereret af alle T9-tabeller (`20260518000004_t9_client_node_placements.sql:55` etc.)                         | Generel audit-trigger der bruges `AFTER INSERT OR UPDATE OR DELETE` på alle write-tabeller. Skriver til `core_compliance.audit_log` via `audit_filter_values`.                                                                                                                                                                                                                                          |
| `core_compliance.set_updated_at()` trigger-funktion                                                    | `supabase/migrations/20260514120005_t1_data_field_definitions.sql:45-54`                                       | Standard updated_at-trigger. `before update for each row`.                                                                                                                                                                                                                                                                                                                                              |
| `core_identity.client_node_placements` (tabel)                                                         | `supabase/migrations/20260518000004_t9_client_node_placements.sql:13-24`                                       | `id, client_id uuid NOT NULL (UDEN FK — Plan V6 Valg 4: FK tilføjes i trin 10), node_id FK → org_nodes, effective_from/to date, applied_at, created_by_pending_change_id`.                                                                                                                                                                                                                              |
| T9-supplement `client_node_placements_select` policy                                                   | `supabase/migrations/20260520000000_t9_supplement.sql:665-683`                                                 | `using (is_admin() OR node_id = ANY(acl_subtree_org_nodes_at(current_employee_id(), coalesce(current_setting('stork.t9_read_at_date',true)::date, current_date))))`. **Trin 10 ændrer ikke policy** — kun tilføjer FK.                                                                                                                                                                                  |
| `core_identity._apply_client_place(p_payload jsonb, p_pending_change_id uuid)`                         | `supabase/migrations/20260518000004_t9_client_node_placements.sql:86-119`                                      | SECURITY DEFINER apply-handler. INSERT i client_node_placements.                                                                                                                                                                                                                                                                                                                                        |
| `core_identity._apply_client_close(p_payload jsonb, p_pending_change_id uuid)`                         | `supabase/migrations/20260518000004_t9_client_node_placements.sql:123-147`                                     | SECURITY DEFINER apply-handler. UPDATE effective_to.                                                                                                                                                                                                                                                                                                                                                    |
| `core_identity.client_node_place(p_client_id, p_node_id, p_effective_from)` wrapper                    | `supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:140-170`                                        | Wrapper-RPC med `has_permission('client_placements', 'manage', true)`. Pre-checker node_id = team. Opretter pending_change.                                                                                                                                                                                                                                                                             |
| `core_identity.client_node_close(p_client_id, p_effective_from)` wrapper                               | `supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:173-192`                                        | Wrapper-RPC med `has_permission('client_placements', 'manage', true)`.                                                                                                                                                                                                                                                                                                                                  |
| `core_identity.has_permission(p_page_key, p_tab_key default null, p_can_edit default false) → boolean` | `supabase/migrations/20260518000010_t9_seed_owners.sql:15-80`                                                  | Tab → page → area → legacy `role_page_permissions` fallback. STABLE SECURITY INVOKER.                                                                                                                                                                                                                                                                                                                   |
| `core_identity.is_admin()`                                                                             | Refereret af T9-supplement linje 670, T9-tabeller. Definition i T2 (`20260514130000_t2_superadmin_floor.sql`). | Hardkodet superadmin-check. T9 introducerede `has_permission` som UI-baseret erstatning; D5's `public.is_admin()` blev droppet af T1.                                                                                                                                                                                                                                                                   |
| `core_identity.permission_areas` seedede rækker                                                        | `supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:14-24`                                | identity (1), permissions (2), org_structure (3), compliance (10), audit (11), anonymization (12), break_glass (13), operations (20), system (99). `client_placements` ligger i `org_structure`.                                                                                                                                                                                                        |
| `core_identity.permission_pages` (FK area_id, UNIQUE (area_id, name))                                  | `supabase/migrations/20260518000005_t9_permission_elements.sql:32-41`                                          | Tabel for page-niveau.                                                                                                                                                                                                                                                                                                                                                                                  |
| `core_identity.permission_tabs` (FK page_id, UNIQUE (page_id, name))                                   | `supabase/migrations/20260518000005_t9_permission_elements.sql:58-67`                                          | Tabel for tab-niveau.                                                                                                                                                                                                                                                                                                                                                                                   |
| `core_identity.role_permission_grants` (role + en af area_id/page_id/tab_id)                           | `supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:94-140` + grant-tabellen i T9 Step 7  | Primær grant-tabel. has_permission læser herfra først. ON CONFLICT-key: `(role_id, coalesce(area_id::text,''), coalesce(page_id::text,''), coalesce(tab_id::text,''))`.                                                                                                                                                                                                                                 |
| `core_identity.current_employee_id()`                                                                  | Refereret af has_permission og T9-supplement policy                                                            | Returnerer current_employee_id baseret på `auth.uid()`.                                                                                                                                                                                                                                                                                                                                                 |
| T9-smoke-test `t9_placements.sql` BLOCK T5/T6/T7                                                       | `supabase/tests/smoke/t9_placements.sql:137-200`                                                               | Bruger client_id-værdier i `_apply_client_place`-payload uden tilsvarende clients-fixture. FK-aktivering brækker T5/T7.                                                                                                                                                                                                                                                                                 |
| T9-smoke-test `t9_backdated_historical_traversal.sql` BLOCK 3                                          | `supabase/tests/smoke/t9_backdated_historical_traversal.sql:165-305`                                           | Linje 167, 172, 185, 276 INSERT'er direkte i client_node_placements + kalder `_apply_client_place` med tilfældige client_id'er. Brækker ved FK.                                                                                                                                                                                                                                                         |
| T9-smoke-test `t9_public_wrapper_rpcs.sql` T2                                                          | `supabase/tests/smoke/t9_public_wrapper_rpcs.sql:83-93`                                                        | Forventer 22023 fra team-only pre-check FØR FK valideres; ikke berørt.                                                                                                                                                                                                                                                                                                                                  |
| T9-mønster for ny tabel i core_identity                                                                | `supabase/migrations/20260518000001_t9_org_nodes.sql:25-41`                                                    | `create table` + `enable rls` + `force rls` + `revoke all from public/anon/service_role` + `grant select to authenticated` + `create policy *_select` + `create trigger *_audit AFTER INSERT/UPDATE/DELETE EXECUTE FUNCTION core_compliance.stork_audit()`.                                                                                                                                             |
| T9 RPC-mønster                                                                                         | `supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:9-44`                                           | SECURITY DEFINER + `set search_path = ''` + `if not has_permission(...) then raise 42501` + `set_config('stork.source_type'/'change_reason')` + body + `revoke execute from public, anon` + `grant execute to authenticated`.                                                                                                                                                                           |
| `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` i fitness-script                                                   | `scripts/fitness.mjs:149-154`                                                                                  | Allowlist for funktioner der bruger `is_active = true` filter uden tilsvarende `status = 'active'`-check. Trin 10 tilføjer `core_identity.client_field_definitions_list` (T10.16) fordi `client_field_definitions` har kun is_active, ingen status-kolonne. **FK_COVERAGE_EXEMPTIONS findes IKKE** — master-plan §3.19 ikke implementeret (V6-fund #4).                                                 |

---

## Formål

Denne pakke leverer: trin 10 etablerer klient-skabelonen som forretnings-fundament i `core_identity`: tabel + felt-definitioner + aktiv/inaktiv-livscyklus + logo + FK fra T9's klient-til-team-tilknytning + permission-baserede write-RPC'er. Klient-tabellen findes IKKE før denne pakke (T1 droppede D5's pre-fundament); alt etableres greenfield i core_identity.

Hvis fund under review ikke bringer os tættere på dette: G-nummer, ikke blocker.

---

## Scope

**I scope:**

- Master-plan-paragraffer: §1.8 (Klient-skabelon — rettes), §4 trin 10 (rettes)
- Krav-dok-leverancer §3.1-§3.4 (klient-CRUD + felt-definitions-CRUD + felt-værdier + klient-til-team-FK)
- Etablering af `core_identity.clients`-tabel fra bunden (med is_active + logo + audit-trigger + RLS)
- Etablering af `core_identity.client_field_definitions`-tabel fra bunden (uden match_role)
- Udvidelse af `core_compliance.is_permanent_allowed`-allowlist med de to nye tabeller
- Klassifikation i `core_compliance.data_field_definitions` for nye kolonner
- Omskrivning af `core_compliance.audit_filter_values` med clients-fields-jsonb-walking (genskab D5's special-case-mønster i nyt schema)
- FK `core_identity.client_node_placements.client_id` → `core_identity.clients.id`
- Opdatering af T9-smoke-tests så de seeder clients-fixtures FØR FK aktiveres
- SECURITY DEFINER RPC'er: client_upsert (uden logo), client_set_active, client_field_definition_upsert (uden p_match_role), client_logo_set, client_logo_clear, client_logo_get, client_get, client_list, client_field_definitions_list
- `clients_validate_fields`-trigger (LENIENT-default + strict via session-var)
- Seed permissions i grant-modellen (`permission_pages` + `permission_tabs` + `role_permission_grants` under `org_structure`-area)
- Master-plan §1.8 + §4 trin 10 rettelser (krav-dok §7)
- Fitness-script-opdatering (tilføj `client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS`)
- 5 smoke-tests

**IKKE i scope:**

- Klient-data-migration fra 1.0 (krav-dok §5.1)
- Match-mekanik / match-rolle-koncept (krav-dok §5.2)
- Frontend-pages / admin-UI'er
- Lønarter med klient-formler (trin 13)
- Salg som funktionalitet (trin 14)
- Pricing pr. klient
- T6-anonymisering af clients (krav-dok §2.5.1: clients anonymiseres aldrig — opnås naturligt fordi tabellen ikke har anonymized_at-kolonne)

---

## Strukturel beslutning

### Klient-tabel i `core_identity` (matcher master-plan §1.11)

**Begrundelse:** Master-plan §1.11 placerer klienter i core_identity. T9's `client_node_placements` ligger allerede i core_identity. Konsistent skema-placering.

### Logo-lagring: bytea-kolonner på `clients`-tabellen (ikke Supabase Storage)

**Begrundelse:** Supabase Storage er ikke etableret i Stork 2.0 (ingen `storage.objects`-referencer i migrations). Klient-logoer er små (typisk 10-50 KB) og 1:1 med klient. Postgres TOAST håndterer det fint på det forventede volumen (5-20 klienter). Forward-compatible: hvis Stork senere får Storage-infrastruktur, kan logo migreres uden at ændre forretnings-flow.

### Logo-håndtering via separate RPC'er (ikke parametre på client_upsert)

**Begrundelse:** Default-null på logo-parametre i client_upsert ville utilsigtet slette logo ved almindelig UPDATE (datatab). Dedikeret `client_logo_set` + `client_logo_clear` + `client_logo_get` adskiller logo-håndtering eksplicit.

### `clients` + `client_field_definitions` får retention_type='permanent' (kræver allowlist-udvidelse)

**Begrundelse:** Krav-dok §2.5.1 + §2.5.2 siger klient-rækken bevares evigt; client_field_definitions er konfig-tabel der også bevares evigt. `permanent` matcher denne semantik bedst. D1b-allowlist skal udvides for at retention-validate-trigger ikke blokerer.

### Aktiv/inaktiv som dedikeret bool-kolonne (`is_active`)

**Begrundelse:** Krav-dok §2.5.2 "kun aktiv/inaktiv. Ingen mellem-tilstande." Matches af bool. Konsistent med T9's `permission_areas.is_active` etc.

### `client_field_definitions` er global (ikke pr-klient)

**Begrundelse:** Krav-dok §2.3 forretningsgang dækkes både af global og pr-klient. Mathias-bekræftet 2026-05-20: "ligeglad med måden listerne sættes op så længe forretningsgangen overholdes". Global er enklere arkitektur (key UNIQUE; ingen client_id-FK på definitions); pr. klient kan fields jsonb indeholde subset af definerede keys.

---

## Mathias' afgørelser (input til denne plan)

- **Afgørelse 1:** Trin 10 skal respektere nuværende kode og opsætning (chat-validering 2026-05-20).
  - **Begrundelse:** Konsistens med eksisterende T1 schema-arkitektur + T9 permission-model + T9-supplement-policy.
  - **Plan-konsekvens:** core_identity-placering; grant-model frem for legacy; T9-supplement-policy uændret; alle nye RPC'er bruger has_permission.

- **Afgørelse 2:** Felt-listerne kan sættes op teknisk frit så længe forretningsgangen overholdes (chat-validering 2026-05-20).
  - **Begrundelse:** "Ligeglad med måden listerne sættes op."
  - **Plan-konsekvens:** Global `client_field_definitions` valgt frem for pr-klient (enklere; forretningsgang opfyldes via fields jsonb pr. klient).

- **Afgørelse 3:** Trin 10 scope-præcisering (mathias-afgoerelser 2026-05-20).
  - **Begrundelse:** Migration-leverance halv uden 1.0-adgang; match-rolle for tidlig design.
  - **Plan-konsekvens:** Ingen migration-discovery-script. Ingen match_role-kolonne. Master-plan §1.8 + §4 trin 10 rettes.

- **Afgørelse 4:** Trin 10 forretnings-ramme (mathias-afgoerelser 2026-05-20).
  - **Begrundelse:** 7 forretnings-sandheder låst.
  - **Plan-konsekvens:** Hver sandhed har konkret RPC eller tabel-felt.

- **Afgørelse 5:** "Start forfra med ny" (chat-validering 2026-05-20 efter Codex V3 strukturel fabrikation-fund).
  - **Begrundelse:** Tidligere V1-V3-plan-forsøg byggede på droppede D5-tabeller; CREATE TABLE fra bunden er rigtigt.
  - **Plan-konsekvens:** Denne plan starter fra "clients-tabel eksisterer ikke" og leverer alle artefakter greenfield.

- **Afgørelse 6:** "Kør V6 men ret op på fejl og lav grundig validering" (chat-validering 2026-05-21 efter selvstændig terminal-review fandt 3 KRITISK).
  - **Begrundelse:** Codex-automation gav APPROVAL i runde 5, men manuel terminal-review afslørede fitness-script-håndhævelse (dedup-key + on-conflict) og has_permission-tab-resolver-detalje som automation missede. Code skal validere planen mod faktisk kode, ikke kun stole på Codex-automation.
  - **Plan-konsekvens:** V6 implementerer alle 3 terminal-fund + 3 yderligere fund fra Code's egen grundige validering (FK_COVERAGE-fabrikation, R7d-allowlist, FK-test TX-wrap). Recon-først-disciplin udvidet: ikke kun migrationer, men også scripts/fitness.mjs skal læses for at fange håndhævelses-regler.

- **Afgørelse 7:** Krav-dok §2.5.2 forretnings-invariant skal håndhæves i kode (chat-validering 2026-05-21 efter terminal-review fandt FK uden aktiv-check). Superadmin bypasser aktiv-check ("superadmin må alt").
  - **Begrundelse:** FK garanterer kun eksistens, ikke aktivitet. Pending-change-mekanismen tillader pending oprettet mens aktiv, applied efter deaktivering. Begge skal håndhæve aktiv-invariant. Superadmin-bypass matcher vision-princip 2 og T9-supplement's policy-mønster (`is_admin() OR ...`).
  - **Plan-konsekvens:** T10.7b CREATE OR REPLACE både `client_node_place` (wrapper) og `_apply_client_place` (apply-handler) med aktiv-check og `is_admin()`-bypass. `client_node_close` rør IKKE — lukning er legitim ved deaktivering. Eksistens-check (P0002) bypasses IKKE for superadmin (FK håndhæver alligevel).

---

## Implementations-rækkefølge

Hver step: Type, Hvad, Eksakt indhold (pseudo-SQL), Afhængigheder, Migration-fil, Risiko.

### T10.1 — CREATE TABLE `core_identity.clients`

- **Type:** migration (CREATE TABLE + RLS + audit-trigger)
- **Hvad:** Etabler clients-tabel i core_identity med is_active + logo-kolonner. FORCE RLS, audit-trigger, set_updated_at-trigger.
- **Eksakt indhold:**

  ```sql
  -- no-dedup-key: master-data; id er stable PK. Klient-rækker bevares evigt
  -- (krav-dok §2.5.1: ikke-anonymiseret), inaktivering via is_active=false.
  create table core_identity.clients (
    id uuid primary key default gen_random_uuid(),
    name text not null check (length(trim(name)) > 0),
    fields jsonb not null default '{}'::jsonb,
    is_active boolean not null default true,
    logo_bytes bytea,
    logo_content_type text,
    logo_filename text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    -- V2 (Codex V1 KRITISK #1): fields skal være jsonb object — scalar/array forhindres
    -- så audit_filter_values' clients-special-case kan walke direct-PII keys.
    constraint clients_fields_is_object check (jsonb_typeof(fields) = 'object'),
    constraint clients_logo_consistency check (
      (logo_bytes is null and logo_content_type is null and logo_filename is null)
      or
      (logo_bytes is not null and logo_content_type is not null and logo_filename is not null)
    )
  );

  comment on table core_identity.clients is
    'Trin 10: klient-master. name er identifikator; fields jsonb indeholder pr-klient værdier per client_field_definitions. is_active toggle erstatter DELETE (krav-dok §2.5.2). Logo som bytea (krav-dok §2.4). Klient anonymiseres ikke (krav-dok §2.5.1) — derfor ingen anonymized_at-kolonne.';

  create index clients_active_idx on core_identity.clients (id) where is_active = true;

  create trigger clients_set_updated_at
    before update on core_identity.clients
    for each row execute function core_compliance.set_updated_at();

  create trigger clients_audit
    after insert or update or delete on core_identity.clients
    for each row execute function core_compliance.stork_audit();

  alter table core_identity.clients enable row level security;
  alter table core_identity.clients force row level security;

  revoke all on table core_identity.clients from public, anon, service_role;
  grant select on table core_identity.clients to authenticated;
  -- V5 (Codex V4 KRITISK): DML-GRANT obligatorisk så RLS-policy + session-var
  -- kan tage over. Uden GRANT vil 'permission denied for table' ramme før policy.
  -- Ingen DELETE-grant — inaktivering via is_active=false, ikke DELETE.
  grant insert, update on table core_identity.clients to authenticated;

  -- SELECT-policy: has_permission-baseret. Read-RPC'er har deres egen permission-check.
  -- V6 (Mathias-terminal fund #3): tab-aware ('manage'). p_tab_key=null vil ramme
  -- page/area-resolver, men T10.13 seeder kun tab-grants → ingen match. 'manage' matcher.
  create policy clients_select on core_identity.clients
    for select to authenticated
    using (core_identity.has_permission('clients', 'manage', false));

  -- INSERT/UPDATE/DELETE: kun via RPC der sætter session-var.
  create policy clients_insert on core_identity.clients
    for insert to authenticated
    with check (current_setting('stork.allow_clients_write', true) = 'true');

  create policy clients_update on core_identity.clients
    for update to authenticated
    using (current_setting('stork.allow_clients_write', true) = 'true')
    with check (current_setting('stork.allow_clients_write', true) = 'true');

  -- DELETE: ingen policy = default deny. Inaktiver via is_active=false, ikke DELETE.
  ```

- **Afhængigheder:** T1 (core_identity schema), T1 (stork_audit + set_updated_at), T9 (has_permission), T10.13 (permission-seed skal være på plads så SELECT-policy ikke tilbageholder).
- **Migration-fil:** `supabase/migrations/<ts>_t10_clients_table.sql`
- **Risiko:** lav (greenfield CREATE; ingen eksisterende data). Rollback: `drop table core_identity.clients cascade`.

### T10.2 — CREATE TABLE `core_identity.client_field_definitions`

- **Type:** migration (CREATE TABLE + RLS + audit-trigger)
- **Hvad:** Etabler global felt-definitions-tabel. Ingen match_role-kolonne (krav-dok §5.2 udskyder).
- **Eksakt indhold:**

  ```sql
  -- no-dedup-key: konfig-tabel; key er natural key (UNIQUE). Inaktiveres
  -- via is_active=false, slettes ikke (krav-dok §2.3.2 udfasede felter bevares).
  create table core_identity.client_field_definitions (
    id uuid primary key default gen_random_uuid(),
    key text not null unique check (length(trim(key)) > 0),
    display_name text not null check (length(trim(display_name)) > 0),
    field_type text not null check (length(trim(field_type)) > 0),
    required boolean not null default false,
    pii_level text not null check (pii_level in ('none', 'indirect', 'direct')),
    display_order integer not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  comment on table core_identity.client_field_definitions is
    'Trin 10: global registry af klient-felt-definitioner. key er jsonb-property-name i clients.fields; UNIQUE globalt. field_type er fri-tekst (UI håndhæver format). pii_level styrer hash i audit_filter_values for clients.fields-jsonb-walking. Udfasede felter sættes is_active=false (ikke DELETE).';

  create index client_field_definitions_active_idx
    on core_identity.client_field_definitions (key, display_order)
    where is_active = true;

  create index client_field_definitions_direct_pii_idx
    on core_identity.client_field_definitions (key)
    where pii_level = 'direct' and is_active = true;

  create trigger client_field_definitions_set_updated_at
    before update on core_identity.client_field_definitions
    for each row execute function core_compliance.set_updated_at();

  create trigger client_field_definitions_audit
    after insert or update or delete on core_identity.client_field_definitions
    for each row execute function core_compliance.stork_audit();

  alter table core_identity.client_field_definitions enable row level security;
  alter table core_identity.client_field_definitions force row level security;

  revoke all on table core_identity.client_field_definitions from public, anon, service_role;
  grant select on table core_identity.client_field_definitions to authenticated;
  -- V5 (Codex V4 KRITISK): DML-GRANT obligatorisk for write-RPC-veje.
  grant insert, update on table core_identity.client_field_definitions to authenticated;

  -- V6 (Mathias-terminal fund #3): tab-aware ('manage') frem for null tab.
  create policy client_field_definitions_select on core_identity.client_field_definitions
    for select to authenticated
    using (core_identity.has_permission('client_field_definitions', 'manage', false));

  create policy client_field_definitions_insert on core_identity.client_field_definitions
    for insert to authenticated
    with check (current_setting('stork.allow_client_field_definitions_write', true) = 'true');

  create policy client_field_definitions_update on core_identity.client_field_definitions
    for update to authenticated
    using (current_setting('stork.allow_client_field_definitions_write', true) = 'true')
    with check (current_setting('stork.allow_client_field_definitions_write', true) = 'true');

  -- DELETE: ingen policy = default deny. Inaktiver via is_active=false.
  ```

- **Afhængigheder:** T1 (core_identity), T1 (triggers), T9 (has_permission), T10.13
- **Migration-fil:** `supabase/migrations/<ts>_t10_client_field_definitions_table.sql`
- **Risiko:** lav. Rollback: drop table.

### T10.3 — Udvid `core_compliance.is_permanent_allowed`-allowlist

- **Type:** migration (CREATE OR REPLACE FUNCTION)
- **Hvad:** Tilføj `core_identity.clients` + `core_identity.client_field_definitions` til allowlist så de kan klassificeres som `permanent` retention.
- **Eksakt indhold:**

  ```sql
  create or replace function core_compliance.is_permanent_allowed(
    p_table_schema text,
    p_table_name text,
    p_column_name text
  ) returns boolean
  language sql immutable parallel safe set search_path = ''
  as $$
    select exists (
      select 1
      from (values
        -- P1a-baseline (15 entries fra 20260515110100_p1a_anonymization_strategies.sql:230-258)
        ('core_compliance', 'audit_log',                   null::text),
        ('core_compliance', 'anonymization_mappings',      null::text),
        ('core_compliance', 'anonymization_state',         null::text),
        ('core_compliance', 'anonymization_strategies',    null::text),
        ('core_compliance', 'break_glass_operation_types', null::text),
        ('core_compliance', 'data_field_definitions',      null::text),
        ('core_compliance', 'superadmin_settings',         null::text),
        ('core_identity',   'roles',                       null::text),
        ('core_identity',   'role_page_permissions',       null::text),
        ('core_identity',   'employee_active_config',      null::text),
        ('core_identity',   'employees',                   'id'),
        ('core_identity',   'employees',                   'role_id'),
        ('core_identity',   'employees',                   'created_at'),
        ('core_identity',   'employees',                   'updated_at'),
        ('core_money',      'pay_period_settings',         null::text),
        -- Trin 10 (2 nye)
        ('core_identity',   'clients',                     null::text),
        ('core_identity',   'client_field_definitions',    null::text)
      ) as allowlist(t_schema, t_name, t_column)
      where allowlist.t_schema = p_table_schema
        and allowlist.t_name = p_table_name
        and (allowlist.t_column is null or allowlist.t_column = p_column_name)
    );
  $$;
  ```

  **V3 (Codex V2 KRITISK #2):** baseret på P1a's komplette VALUES-blok (15 entries inkl. `anonymization_strategies`), ikke D1b's gamle baseline. Plus 2 trin 10-entries = 17 total. CREATE OR REPLACE bevarer signatur. Allowlist-ændring er kode-commit + review per master-plan rettelse 29.

- **Afhængigheder:** D1b (eksisterende allowlist)
- **Migration-fil:** `supabase/migrations/<ts>_t10_is_permanent_allowed_extend.sql`
- **Risiko:** lav. Rollback: re-create D1b's signatur.

### T10.4 — Klassifikation i `core_compliance.data_field_definitions`

- **Type:** migration (INSERT i data_field_definitions)
- **Hvad:** Tilføj klassifikation for alle 9 kolonner på `core_identity.clients` + alle 10 kolonner på `core_identity.client_field_definitions`.
- **Eksakt indhold:**

  ```sql
  select set_config('stork.source_type', 'migration', false);
  select set_config('stork.change_reason',
    'T10.4: klassifikation for core_identity.clients + client_field_definitions', false);
  select set_config('stork.allow_data_field_definitions_write', 'true', false);

  insert into core_compliance.data_field_definitions
    (table_schema, table_name, column_name, category, pii_level,
     retention_type, retention_value, match_role, purpose)
  values
    -- core_identity.clients (9 kolonner)
    ('core_identity', 'clients', 'id',                'master_data', 'none',
      'permanent', null, null, 'Klient PK; bevares evigt for FK-integritet'),
    ('core_identity', 'clients', 'name',              'master_data', 'direct',
      'permanent', null, null, 'Klient-navn (UI-required). hashes i audit via direct-PII'),
    ('core_identity', 'clients', 'fields',            'master_data', 'indirect',
      'permanent', null, null, 'jsonb med klient-felt-værdier; direct-keys i fields hashes pr. client_field_definitions via audit_filter_values clients-special-case'),
    ('core_identity', 'clients', 'is_active',         'master_data', 'none',
      'permanent', null, null, 'Aktiv-flag; false = inaktiv (historik bevares)'),
    ('core_identity', 'clients', 'logo_bytes',        'master_data', 'direct',
      'permanent', null, null, 'Klient-logo binær (bytea). V12 (Codex runde 11): direct fordi binær billed-data kan vise stifter/medarbejdere — hashes i audit via T1''s direct-PII-logik'),
    ('core_identity', 'clients', 'logo_content_type', 'master_data', 'none',
      'permanent', null, null, 'MIME-type for logo (image/png, image/svg+xml osv.) — ingen PII'),
    ('core_identity', 'clients', 'logo_filename',     'master_data', 'direct',
      'permanent', null, null, 'Original filnavn ved upload. V12 (Codex runde 11 KRITISK-SIKKERHEDSHUL): direct fordi filnavne kan indeholde klient-/person-identifikatorer; hashes i audit'),
    ('core_identity', 'clients', 'created_at',        'master_data', 'none',
      'permanent', null, null, 'INSERT-tid'),
    ('core_identity', 'clients', 'updated_at',        'master_data', 'none',
      'permanent', null, null, 'Sidste mutation'),
    -- core_identity.client_field_definitions (10 kolonner)
    ('core_identity', 'client_field_definitions', 'id',            'konfiguration', 'none',
      'permanent', null, null, 'Field-definition PK'),
    ('core_identity', 'client_field_definitions', 'key',           'konfiguration', 'none',
      'permanent', null, null, 'jsonb-property-name i clients.fields; UNIQUE globalt'),
    ('core_identity', 'client_field_definitions', 'display_name',  'konfiguration', 'none',
      'permanent', null, null, 'UI-label for feltet'),
    ('core_identity', 'client_field_definitions', 'field_type',    'konfiguration', 'none',
      'permanent', null, null, 'Fri-tekst type-identifier (text/email/phone/url/...); UI håndhæver format'),
    ('core_identity', 'client_field_definitions', 'required',      'konfiguration', 'none',
      'permanent', null, null, 'Om feltet skal være sat ved INSERT (UI-validering)'),
    ('core_identity', 'client_field_definitions', 'pii_level',     'konfiguration', 'none',
      'permanent', null, null, 'PII-niveau for jsonb-key. direct hashes i audit_filter_values'),
    ('core_identity', 'client_field_definitions', 'display_order', 'konfiguration', 'none',
      'permanent', null, null, 'UI-sortering'),
    ('core_identity', 'client_field_definitions', 'is_active',     'konfiguration', 'none',
      'permanent', null, null, 'Aktiv-flag; false = udfaset'),
    ('core_identity', 'client_field_definitions', 'created_at',    'konfiguration', 'none',
      'permanent', null, null, 'INSERT-tid'),
    ('core_identity', 'client_field_definitions', 'updated_at',    'konfiguration', 'none',
      'permanent', null, null, 'Sidste mutation')
  on conflict (table_schema, table_name, column_name) do nothing;
  ```

  **V6 (Mathias-terminal fund #2):** `on conflict do nothing` er obligatorisk per fitness-check `migration-on-conflict-discipline` (`core_compliance.data_field_definitions` er på `BOOTSTRAP_CONFIG_TABLES`). UNIQUE-constraint på (table_schema, table_name, column_name) gør conflict-targetet entydigt.

- **Afhængigheder:** T10.1, T10.2 (tabeller skal eksistere), T10.3 (allowlist skal være udvidet)
- **Migration-fil:** `supabase/migrations/<ts>_t10_classify.sql`
- **Risiko:** lav (data_field_definitions har INSERT-policy via session-var). Rollback: DELETE matching rows.

### T10.5 — Omskrive `core_compliance.audit_filter_values` med clients-fields-jsonb-walking

- **Type:** migration (CREATE OR REPLACE FUNCTION)
- **Hvad:** Genskab D5's clients-special-case-mønster: walker `clients.fields` jsonb og hashes hver key der har `pii_level='direct'` i `client_field_definitions`. **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** ingen `is_active = true`-filter på direct-PII keys — ellers ville deaktivering af et felt skabe datalæk for værdier i eksisterende fields jsonb. Validation-trigger T10.6 behandler stadig inactive som ukendt-key (LENIENT warning), men audit-hashing rammer alle direct-PII definitioner. Resten af T1-logikken bevares uændret.
- **Eksakt indhold:**

  ```sql
  create or replace function core_compliance.audit_filter_values(
    p_schema text,
    p_table text,
    p_values jsonb
  )
  returns jsonb
  language plpgsql stable security definer set search_path = ''
  as $$
  declare
    v_result jsonb := p_values;
    v_def record;
    v_strict boolean := current_setting('stork.audit_filter_strict', true) = 'true';
    v_has_defs boolean;
    v_key text;
    v_fields jsonb;
    v_field_key text;
    v_field_value jsonb;
  begin
    if p_values is null then
      return null;
    end if;

    -- Tjek om tabellen har klassificering.
    select exists (
      select 1 from core_compliance.data_field_definitions
      where table_schema = p_schema and table_name = p_table
    ) into v_has_defs;

    if not v_has_defs then
      if v_strict then
        raise exception 'audit_filter_values: ingen klassificering for %.%', p_schema, p_table
          using errcode = 'P0001';
      else
        raise warning 'audit_filter_values: ingen klassificering for %.% — værdier bevaret uændret', p_schema, p_table;
        return p_values;
      end if;
    end if;

    -- Walker top-level kolonner og hashes direct-PII (uændret T1-logik).
    for v_def in
      select column_name, pii_level
      from core_compliance.data_field_definitions
      where table_schema = p_schema and table_name = p_table
    loop
      if p_values ? v_def.column_name then
        if v_def.pii_level = 'direct' then
          v_result := jsonb_set(
            v_result,
            array[v_def.column_name],
            to_jsonb(
              'sha256:' ||
              encode(extensions.digest((p_values->>v_def.column_name)::text, 'sha256'), 'hex')
            )
          );
        end if;
      end if;
    end loop;

    -- Trin 10 clients-special-case: walker clients.fields jsonb og hashes direct-PII keys
    -- pr. client_field_definitions. V2 (Codex V1 KRITISK-SIKKERHEDSHUL #2): hashes
    -- ALLE direct-PII definitioner, uafhængigt af is_active — ellers ville deaktivering
    -- af et felt skabe datalæk for værdier der allerede ligger i eksisterende fields.
    -- T10.1's clients_fields_is_object-CHECK garanterer at fields er object her.
    if p_schema = 'core_identity'
       and p_table = 'clients'
       and v_result ? 'fields'
       and jsonb_typeof(v_result -> 'fields') = 'object' then
      v_fields := v_result -> 'fields';
      for v_field_key in
        select key from core_identity.client_field_definitions
        where pii_level = 'direct'
      loop
        if v_fields ? v_field_key then
          v_field_value := v_fields -> v_field_key;
          if jsonb_typeof(v_field_value) is distinct from 'null' then
            v_fields := jsonb_set(
              v_fields,
              array[v_field_key],
              to_jsonb('sha256:' || encode(extensions.digest(v_field_value::text, 'sha256'), 'hex'))
            );
          end if;
        end if;
      end loop;
      v_result := jsonb_set(v_result, array['fields'], v_fields);
    end if;

    -- Tjek for ukendte kolonner (uændret T1-logik).
    for v_key in select jsonb_object_keys(p_values) loop
      if not exists (
        select 1 from core_compliance.data_field_definitions d
        where d.table_schema = p_schema
          and d.table_name = p_table
          and d.column_name = v_key
      ) then
        if v_strict then
          raise exception 'audit_filter_values: ukendt kolonne %.%.% i input', p_schema, p_table, v_key
            using errcode = 'P0001';
        else
          raise warning 'audit_filter_values: ukendt kolonne %.%.% — værdi bevaret uændret', p_schema, p_table, v_key;
        end if;
      end if;
    end loop;

    return v_result;
  end;
  $$;

  comment on function core_compliance.audit_filter_values(text, text, jsonb) is
    'Trin 10: T1-logik + core_identity.clients-special-case (jsonb-walking af fields for direct-PII keys pr. client_field_definitions). LENIENT-default; strict via stork.audit_filter_strict.';
  ```

- **Afhængigheder:** T10.2 (client_field_definitions skal eksistere så funktionen kan referere den), T10.4 (klassifikation seedet)
- **Migration-fil:** `supabase/migrations/<ts>_t10_audit_filter_values.sql`
- **Risiko:** mellem (omskriver eksisterende funktion brugt af alle audit-triggers). Rollback: re-create T1's signatur.

### T10.6 — `clients_validate_fields`-trigger (LENIENT default)

- **Type:** migration (CREATE FUNCTION + trigger)
- **Hvad:** BEFORE INSERT/UPDATE-trigger på `core_identity.clients`. WARNING ved ukendte keys i fields jsonb. Strict via session-var.
- **Eksakt indhold:**

  ```sql
  create or replace function core_identity.clients_validate_fields()
  returns trigger
  language plpgsql stable security definer set search_path = ''
  as $$
  declare
    v_strict boolean;
    v_unknown_keys text[];
  begin
    if new.fields is null or jsonb_typeof(new.fields) <> 'object' then
      return new;
    end if;

    v_strict := coalesce(
      nullif(current_setting('stork.clients_fields_strict', true), ''),
      'false'
    ) = 'true';

    select array_agg(n.key order by n.key)
      into v_unknown_keys
      from jsonb_each(new.fields) as n(key, value)
      where not exists (
        select 1 from core_identity.client_field_definitions cfd
        where cfd.key = n.key and cfd.is_active = true
      );

    if v_unknown_keys is not null and array_length(v_unknown_keys, 1) > 0 then
      if v_strict then
        raise exception 'clients_validate_fields: ukendte/inaktive keys i fields: % (stork.clients_fields_strict=true)',
          v_unknown_keys using errcode = '23514';
      else
        raise warning 'clients_validate_fields: ukendte/inaktive keys i fields (LENIENT - INSERT/UPDATE accepteret): %',
          v_unknown_keys;
      end if;
    end if;

    return new;
  end;
  $$;

  comment on function core_identity.clients_validate_fields() is
    'Trin 10: BEFORE INSERT/UPDATE-trigger på core_identity.clients. LENIENT-default WARNING ved ukendte/inaktive keys i fields. Strict via stork.clients_fields_strict=true.';

  create trigger clients_validate_fields
    before insert or update on core_identity.clients
    for each row execute function core_identity.clients_validate_fields();
  ```

- **Afhængigheder:** T10.1 (clients-tabel), T10.2 (client_field_definitions)
- **Migration-fil:** samme som T10.5 eller separat
- **Risiko:** lav (trigger blokerer ikke i LENIENT-default). Rollback: drop trigger + function.

### T10.7 — FK fra `client_node_placements.client_id` til `clients.id`

- **Type:** migration (ALTER TABLE ADD CONSTRAINT)
- **Hvad:** Tilføj FK efter T10.7a-test-fixes er gennemført.
- **Eksakt indhold:**

  ```sql
  alter table core_identity.client_node_placements
    add constraint client_node_placements_client_id_fkey
      foreign key (client_id) references core_identity.clients(id)
      on delete restrict;
  ```

- **Afhængigheder:** T10.1, **T10.7a** (T9-smoke-tests skal være opdateret FØR FK aktiveres)
- **Migration-fil:** `supabase/migrations/<ts>_t10_client_node_placements_fk.sql`
- **Risiko:** lav efter T10.7a. Rollback: drop constraint.

### T10.7a — Opdater T9-smoke-tests med clients-fixture

- **Type:** test-fil-ændring (ikke migration)
- **Hvad:** Tre T9-smoke-tests INSERT'er `client_id`-værdier uden clients-fixture. Når T10.7 aktiveres, brækker testene. T10.7a seeder en `core_identity.clients`-fixture FØR hver berørt INSERT/\_apply_client_place-kald.
- **Konkrete ændringer:**

  **`supabase/tests/smoke/t9_placements.sql`** (T5, T6, T7, T9-blokke ca. linje 137-200):
  - FØR T5's `_apply_client_place`-kald (linje 138): seed clients-fixture med `v_client_id`.
  - T6 bruger `gen_random_uuid()` direkte — skift til separat seedet `v_client_id_for_dept_test` med fixture FØR.

  **`supabase/tests/smoke/t9_backdated_historical_traversal.sql`** (BLOCK 3 ca. linje 165-305):
  - Seed clients-fixture med `v_client_id` FØR linje 167's INSERT.

  **`supabase/tests/smoke/t9_public_wrapper_rpcs.sql`**: ingen ændring (T2 fejler i team-only pre-check FØR FK).

  Pattern (én blok per test, FØR første client_node_placements-write):

  ```sql
  -- Trin 10-forberedelse: seed client-fixture så FK accepterer placement-INSERTs
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'test fixture for client_node_placements', true);
  perform set_config('stork.allow_clients_write', 'true', true);
  insert into core_identity.clients (id, name) values (v_client_id, 'Test Klient T9-smoke')
    on conflict (id) do nothing;
  ```

- **Afhængigheder:** T10.1 (clients-tabel skal eksistere)
- **Migration-fil:** N/A (test-fil-ændring)
- **Risiko:** lav.

### T10.7b — CREATE OR REPLACE `client_node_place` + `_apply_client_place` med klient-aktiv-check (V7 — Mathias-terminal-V6 #1)

- **Type:** migration (CREATE OR REPLACE FUNCTION × 2)
- **Hvad:** Krav-dok §2.5.2 punkt 2 ("Inaktiv klient bliver stående for historik, men kan ikke vælges som ny team-tilknytning") + §3.4 ("valideres at klienten faktisk findes") håndhæves via wrapper og apply-handler. FK fra T10.7 garanterer eksistens, men kun aktiv-check garanterer at deaktiverede klienter ikke kan placeres. Apply-pathen tjekker også fordi pending kan oprettes mens klienten er aktiv og applies efter deaktivering.
- **Designvalg:**
  - **Wrapper-rækkefølge:** `has_permission` → team-only pre-check → klient-eksistens (P0002) → klient-aktiv (22023, **superadmin-bypass via `is_admin()`**) → `pending_change_request`. Eksisterende-check kommer FØR aktiv-check så fejl-meddelelsen er informativ. Team-check kommer FØR klient-check så T9-test T2's `gen_random_uuid` fejler i team-check (uændret 22023-semantik).
  - **Apply-handler-rækkefølge:** payload-validation → team-aktiv-check (uændret fra T9-supplement) → klient-eksistens (P0002) → **employee-baseret admin-tjek** (via `is_admin_by_employee_id(requested_by)` OR `is_admin_by_employee_id(approved_by)`) → klient-aktiv (P0001, bypass hvis admin involveret) → INSERT/UPDATE. **V10 (Codex runde 9):** apply bruger employee-id-baseret check (ikke `auth.uid()`) for at fungere konsistent i cron-context.
  - **Superadmin-bypass-design:** Wrapper kører altid med auth-context → `is_admin()` virker. Apply kører i to contexts: direct admin-call OG cron-apply (`pending_changes_apply_due` job uden auth). For konsistens er apply-bypass baseret på pending-rækkens employee-historie (requested_by + approved_by). "Bypass hvis EITHER er superadmin" matcher "superadmin må alt"-reglen (Mathias 2026-05-21) på tværs af execution-contexts. Eksistens-check (P0002) bypasses IKKE — FK håndhæver alligevel.
  - **`client_node_close` rør IKKE:** Lukning af placement ved klient-deaktivering er legitim forretnings-flow. Aktiv-check her ville blokere det.
- **Eksakt indhold:**

  ```sql
  -- V10 (Codex runde 9 TEKNISK-BLOKERING): ny helper der tjekker admin-status
  -- via employee_id direkte (ikke auth.uid()). Apply-handler bruger den for
  -- konsistens i cron-apply-context hvor auth.uid() er NULL.
  create or replace function core_identity.is_admin_by_employee_id(p_employee_id uuid)
  returns boolean
  language sql stable security invoker set search_path = ''
  as $$
    select exists (
      select 1
      from core_identity.employees e
      join core_identity.role_page_permissions p on p.role_id = e.role_id
      where e.id = p_employee_id
        and core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
        and p.page_key = 'system'
        and p.tab_key = 'manage'
        and p.scope = 'all'
        and p.can_edit = true
    );
  $$;
  comment on function core_identity.is_admin_by_employee_id(uuid) is
    'V10/Trin 10: admin-tjek via employee_id (ikke auth.uid). Anvendes af apply-handlers der kører i cron-context uden auth.';
  -- Grant-pattern matcher is_admin() (T1-helpers-stubs:50): authenticated + anon + service_role.
  -- Service_role-grant er for cron-vejen (pending_changes_apply_due-job uden auth-context).
  revoke all on function core_identity.is_admin_by_employee_id(uuid) from public;
  grant execute on function core_identity.is_admin_by_employee_id(uuid) to authenticated, anon, service_role;

  -- Wrapper: tilføj klient-aktiv-check efter team-check
  create or replace function core_identity.client_node_place(
    p_client_id uuid,
    p_node_id uuid,
    p_effective_from date
  ) returns uuid language plpgsql security definer set search_path = ''
  as $$
  declare
    v_request_id uuid;
    v_client_active boolean;
  begin
    if not core_identity.has_permission('client_placements', 'manage', true) then
      raise exception 'permission_denied' using errcode = '42501';
    end if;
    -- Pre-check: node_id skal være team (uændret fra T9).
    if not exists (
      select 1 from core_identity.org_node_versions
      where node_id = p_node_id and node_type = 'team' and is_active = true
        and effective_from <= current_date
        and (effective_to is null or effective_to > current_date)
    ) then
      raise exception 'client_placement_node_not_team_or_inactive: %', p_node_id using errcode = '22023';
    end if;
    -- V7/Trin 10 (krav-dok §3.4 + §2.5.2): klient skal findes og være aktiv.
    select is_active into v_client_active
      from core_identity.clients where id = p_client_id;
    if not found then
      raise exception 'client_not_found: %', p_client_id using errcode = 'P0002';
    end if;
    if v_client_active = false and not core_identity.is_admin() then
      raise exception 'client_inactive: % er sat is_active=false (krav-dok §2.5.2: inaktiv klient kan ikke vælges som ny team-tilknytning)', p_client_id
        using errcode = '22023';
    end if;
    -- V9 (Codex runde 8 TEKNISK-BLOKERING): pending_changes-INSERT-policy
    -- (T9-fundament-supplement) kræver session-var. T9-public-wrapper sætter
    -- den ikke (latent bug); trin 10 lukker for client-RPC'erne.
    perform set_config('stork.t9_write_authorized', 'true', true);
    v_request_id := core_identity.pending_change_request(
      'client_place', p_client_id,
      jsonb_build_object(
        'client_id', p_client_id::text,
        'node_id', p_node_id::text,
        'effective_from', p_effective_from::text
      ),
      p_effective_from
    );
    return v_request_id;
  end; $$;

  revoke execute on function core_identity.client_node_place(uuid, uuid, date) from public, anon;

  -- V9 (Codex runde 8 TEKNISK-BLOKERING): client_node_close får også t9_write_authorized.
  -- V14 (Code walk-through): klient-eksistens-check tilføjet — krav-dok §3.4 kræver
  -- "valideres at klienten faktisk findes" ved BÅDE oprettelse OG ændring. Close er ændring.
  -- INGEN aktiv-check (krav-dok §2.5.2 gælder ikke for lukning; deaktivering skal kunne
  -- lukke placement).
  create or replace function core_identity.client_node_close(
    p_client_id uuid,
    p_effective_from date
  ) returns uuid language plpgsql security definer set search_path = ''
  as $$
  declare v_request_id uuid;
  begin
    if not core_identity.has_permission('client_placements', 'manage', true) then
      raise exception 'permission_denied' using errcode = '42501';
    end if;
    -- V14: klient-eksistens-check (krav-dok §3.4). Forhindrer silent no-op ved
    -- ikke-eksisterende client_id (uden check ville pending oprettes + apply
    -- UPDATE'e 0 rows uden fejl).
    if not exists (select 1 from core_identity.clients where id = p_client_id) then
      raise exception 'client_not_found: %', p_client_id using errcode = 'P0002';
    end if;
    -- V9: pending_changes-INSERT-policy kræver session-var.
    perform set_config('stork.t9_write_authorized', 'true', true);
    v_request_id := core_identity.pending_change_request(
      'client_close', p_client_id,
      jsonb_build_object(
        'client_id', p_client_id::text,
        'effective_from', p_effective_from::text
      ),
      p_effective_from
    );
    return v_request_id;
  end; $$;

  revoke execute on function core_identity.client_node_close(uuid, date) from public, anon;

  -- Apply-handler: tilføj klient-eksistens + aktiv-check FØR INSERT/UPDATE
  create or replace function core_identity._apply_client_place(
    p_payload jsonb,
    p_pending_change_id uuid
  ) returns void
  language plpgsql security definer set search_path = ''
  as $$
  declare
    v_client_id uuid;
    v_node_id uuid;
    v_effective_from date;
    v_client_active boolean;
    v_active record;
    v_requested_by uuid;
    v_approved_by uuid;
    v_admin_involved boolean;
  begin
    v_client_id := (p_payload->>'client_id')::uuid;
    v_node_id := (p_payload->>'node_id')::uuid;
    v_effective_from := (p_payload->>'effective_from')::date;
    if v_client_id is null or v_node_id is null or v_effective_from is null then
      raise exception 'invalid_payload: client_id + node_id + effective_from required'
        using errcode = '22023';
    end if;

    -- Team-aktiv-check (uændret fra T9-supplement).
    if not exists (
      select 1 from core_identity.org_node_versions
      where node_id = v_node_id and node_type = 'team' and is_active = true
        and effective_from <= v_effective_from
        and (effective_to is null or effective_to > v_effective_from)
    ) then
      raise exception 'client_placement_requires_active_team: %', v_node_id
        using errcode = 'P0001';
    end if;

    -- V7/Trin 10 (krav-dok §3.4 + §2.5.2): klient skal findes og være aktiv.
    -- Fanger pending oprettet mens aktiv, applied efter deaktivering.
    select is_active into v_client_active
      from core_identity.clients where id = v_client_id;
    if not found then
      raise exception 'apply_client_place: client_not_found: %', v_client_id using errcode = 'P0002';
    end if;

    -- V10 (Codex runde 9 TEKNISK-BLOKERING): bypass kan IKKE bruge is_admin()
    -- fordi auth.uid() er NULL i cron-apply-context. Hent requester+approver fra
    -- pending-rækken og tjek via employee-id-baseret helper.
    v_admin_involved := false;
    if p_pending_change_id is not null then
      select requested_by, approved_by into v_requested_by, v_approved_by
        from core_identity.pending_changes where id = p_pending_change_id;
      v_admin_involved :=
        core_identity.is_admin_by_employee_id(v_requested_by) or
        (v_approved_by is not null and core_identity.is_admin_by_employee_id(v_approved_by));
    end if;

    if v_client_active = false and not v_admin_involved then
      raise exception 'apply_client_place: client_inactive: % (krav-dok §2.5.2)', v_client_id
        using errcode = 'P0001';
    end if;

    -- Resten af apply-handler-logikken er uændret fra T9-supplement
    -- (20260520000000_t9_supplement.sql:321-350): find aktiv placement,
    -- enten INSERT ny, UPDATE eksisterende eller split placement-række.
    select * into v_active
    from core_identity.client_node_placements
    where client_id = v_client_id
      and effective_from <= v_effective_from
      and (effective_to is null or effective_to > v_effective_from)
    limit 1;

    if not found then
      insert into core_identity.client_node_placements
        (client_id, node_id, effective_from, effective_to, created_by_pending_change_id)
      select v_client_id, v_node_id, v_effective_from,
        (select min(effective_from) from core_identity.client_node_placements
         where client_id = v_client_id and effective_from > v_effective_from),
        p_pending_change_id;
    elsif v_active.effective_from = v_effective_from then
      update core_identity.client_node_placements
      set node_id = v_node_id,
          created_by_pending_change_id = coalesce(p_pending_change_id, created_by_pending_change_id),
          updated_at = now()
      where id = v_active.id;
    else
      update core_identity.client_node_placements
      set effective_to = v_effective_from, updated_at = now()
      where id = v_active.id;
      insert into core_identity.client_node_placements
        (client_id, node_id, effective_from, effective_to, created_by_pending_change_id)
      values
        (v_client_id, v_node_id, v_effective_from, v_active.effective_to, p_pending_change_id);
    end if;
  end; $$;

  revoke execute on function core_identity._apply_client_place(jsonb, uuid) from public, anon, authenticated;
  ```

- **Impact-analyse for eksisterende T9-tests:**
  - `t9_placements.sql` T5 + T7 + T9 (med fixture-seedede klienter fra T10.7a, default `is_active=true`): aktiv-check passerer. ✓
  - `t9_placements.sql` T6 (`_apply_client_place` på department + `gen_random_uuid`-klient): team-check fejler først → uændret semantik.
  - `t9_backdated_historical_traversal.sql` BLOCK 3: fixture-klienter er aktive. ✓
  - `t9_public_wrapper_rpcs.sql` T2 (`gen_random_uuid` + department): team-check fejler først → uændret 22023. ✓
- **Afhængigheder:** T10.1 (clients-tabel + is_active-kolonne), T10.7 (FK)
- **Migration-fil:** `supabase/migrations/<ts>_t10_client_active_check.sql`
- **Risiko:** lav. Rollback: CREATE OR REPLACE med T9-supplements oprindelige definitioner.

### T10.8 — `client_upsert` RPC (uden logo-parametre)

- **Type:** migration (CREATE FUNCTION)
- **Hvad:** SECURITY DEFINER write-RPC for clients. has_permission-baseret. Logo-felter rør'es IKKE her (separate RPC'er i T10.11 forhindrer datatab).
- **Eksakt indhold:**

  ```sql
  create or replace function core_identity.client_upsert(
    p_name text,
    p_fields jsonb,
    p_change_reason text,
    p_is_active boolean default true,
    p_client_id uuid default null
  ) returns uuid
  language plpgsql security definer set search_path = ''
  as $$
  declare
    v_id uuid;
  begin
    if not core_identity.has_permission('clients', 'manage', true) then
      raise exception 'client_upsert: permission_denied' using errcode = '42501';
    end if;
    if p_change_reason is null or length(trim(p_change_reason)) = 0 then
      raise exception 'client_upsert: change_reason er paakraevet' using errcode = '22023';
    end if;
    if p_name is null or length(trim(p_name)) = 0 then
      raise exception 'client_upsert: name er paakraevet' using errcode = '22023';
    end if;

    perform set_config('stork.source_type', 'manual', true);
    perform set_config('stork.change_reason', p_change_reason, true);
    perform set_config('stork.allow_clients_write', 'true', true);

    if p_client_id is null then
      -- INSERT: p_is_active anvendes (default true for nye klienter)
      insert into core_identity.clients (name, fields, is_active)
      values (p_name, coalesce(p_fields, '{}'::jsonb), p_is_active)
      returning id into v_id;
    else
      -- V8 (Code walk-through #2): UPDATE rør IKKE is_active (default true ville reaktivere
      -- inaktiv klient utilsigtet ved ren navne-ændring). Brug client_set_active for toggle.
      -- Matcher logo-pattern (rør'es heller ikke i client_upsert).
      update core_identity.clients
        set name = p_name,
            fields = coalesce(p_fields, '{}'::jsonb)
            -- is_active rør IKKE (brug client_set_active)
            -- logo-felter rør IKKE (brug client_logo_set/clear)
       where id = p_client_id
       returning id into v_id;
      if v_id is null then
        raise exception 'client_upsert: client % findes ikke', p_client_id using errcode = 'P0002';
      end if;
    end if;

    return v_id;
  end;
  $$;

  revoke all on function core_identity.client_upsert(text, jsonb, text, boolean, uuid) from public, anon;
  grant execute on function core_identity.client_upsert(text, jsonb, text, boolean, uuid) to authenticated;
  ```

- **Afhængigheder:** T10.1, T10.13 (permission-row seeded)
- **Migration-fil:** `supabase/migrations/<ts>_t10_client_upsert_rpc.sql`
- **Risiko:** lav.

### T10.9 — `client_set_active` RPC

- **Type:** migration (CREATE FUNCTION)
- **Hvad:** Toggler is_active uden at røre øvrige felter. Adskilt RPC fordi UI-flowet er distinkt fra "redigér".
- **Eksakt indhold:**

  ```sql
  create or replace function core_identity.client_set_active(
    p_client_id uuid,
    p_is_active boolean,
    p_change_reason text
  ) returns void
  language plpgsql security definer set search_path = ''
  as $$
  begin
    if not core_identity.has_permission('clients', 'manage', true) then
      raise exception 'client_set_active: permission_denied' using errcode = '42501';
    end if;
    if p_change_reason is null or length(trim(p_change_reason)) = 0 then
      raise exception 'client_set_active: change_reason er paakraevet' using errcode = '22023';
    end if;

    perform set_config('stork.source_type', 'manual', true);
    perform set_config('stork.change_reason', p_change_reason, true);
    perform set_config('stork.allow_clients_write', 'true', true);

    update core_identity.clients
      set is_active = p_is_active
     where id = p_client_id;
    if not found then
      raise exception 'client_set_active: client % findes ikke', p_client_id using errcode = 'P0002';
    end if;
  end;
  $$;

  revoke all on function core_identity.client_set_active(uuid, boolean, text) from public, anon;
  grant execute on function core_identity.client_set_active(uuid, boolean, text) to authenticated;
  ```

- **Afhængigheder:** T10.1, T10.13
- **Migration-fil:** samme som T10.8
- **Risiko:** lav.

### T10.10 — `client_field_definition_upsert` RPC (uden p_match_role; V3: immutable key + pii_level-downgrade-block)

- **Type:** migration (CREATE FUNCTION)
- **Hvad:** SECURITY DEFINER write-RPC for client_field_definitions. has_permission('client_field_definitions', 'manage', true). **V3 (Codex V2 KRITISK-SIKKERHEDSHUL):** UPDATE forbyder ændring af `key` (audit-PII-hash i clients.fields ville miste reference); UPDATE forbyder pii_level direct → non-direct (eksisterende værdier ville pludselig skrives i klartekst i audit). For at ændre `key`: marker den gamle definition `is_active=false` og INSERT en ny. For at sænke pii-niveau: behandl som ny definition.
- **Eksakt indhold:**

  ```sql
  create or replace function core_identity.client_field_definition_upsert(
    p_key text,
    p_display_name text,
    p_field_type text,
    p_pii_level text,
    p_change_reason text,
    p_required boolean default false,
    p_display_order integer default 0,
    p_is_active boolean default true,
    p_field_id uuid default null
  ) returns uuid
  language plpgsql security definer set search_path = ''
  as $$
  declare
    v_id uuid;
    v_existing_key text;
    v_existing_pii text;
  begin
    if not core_identity.has_permission('client_field_definitions', 'manage', true) then
      raise exception 'client_field_definition_upsert: permission_denied' using errcode = '42501';
    end if;
    if p_change_reason is null or length(trim(p_change_reason)) = 0 then
      raise exception 'client_field_definition_upsert: change_reason er paakraevet' using errcode = '22023';
    end if;
    if p_pii_level not in ('none', 'indirect', 'direct') then
      raise exception 'client_field_definition_upsert: pii_level skal vaere none/indirect/direct' using errcode = '22023';
    end if;

    perform set_config('stork.source_type', 'manual', true);
    perform set_config('stork.change_reason', p_change_reason, true);
    perform set_config('stork.allow_client_field_definitions_write', 'true', true);

    if p_field_id is null then
      insert into core_identity.client_field_definitions
        (key, display_name, field_type, required, pii_level, display_order, is_active)
      values
        (p_key, p_display_name, p_field_type, p_required, p_pii_level, p_display_order, p_is_active)
      returning id into v_id;
    else
      -- V3 (Codex V2 KRITISK-SIKKERHEDSHUL): forbyd key-rename og direct → non-direct
      -- for eksisterende definitions. Audit-PII-hashing i clients.fields stoler på at
      -- key+pii_level er stabile for værdier der allerede ligger i jsonb.
      select key, pii_level into v_existing_key, v_existing_pii
        from core_identity.client_field_definitions
       where id = p_field_id;
      if not found then
        raise exception 'client_field_definition_upsert: field % findes ikke', p_field_id using errcode = 'P0002';
      end if;
      if v_existing_key is distinct from p_key then
        raise exception 'client_field_definition_upsert: key er immutable (% -> %). For at omdøbe: marker eksisterende felt is_active=false og INSERT et nyt.', v_existing_key, p_key
          using errcode = '22023', hint = 'Audit-PII-hash i clients.fields binder til key.';
      end if;
      if v_existing_pii = 'direct' and p_pii_level <> 'direct' then
        raise exception 'client_field_definition_upsert: pii_level direct -> % afvist. Eksisterende vaerdier i clients.fields ville pludselig skrives i klartekst i audit-log.', p_pii_level
          using errcode = '22023', hint = 'For at saenke pii-niveau: INSERT ny definition med ny key.';
      end if;

      -- V8 (Code walk-through #3): UPDATE rør IKKE is_active (default true ville reaktivere
      -- inaktiv felt-definition utilsigtet ved ren navne-ændring). Brug client_field_definition_set_active.
      update core_identity.client_field_definitions
        set display_name = p_display_name,
            field_type = p_field_type,
            required = p_required,
            pii_level = p_pii_level,
            display_order = p_display_order
            -- key rør'es ikke (verificeret immutable ovenfor)
            -- is_active rør IKKE (brug client_field_definition_set_active)
       where id = p_field_id
       returning id into v_id;
    end if;

    return v_id;
  end;
  $$;

  revoke all on function core_identity.client_field_definition_upsert(text, text, text, text, text, boolean, integer, boolean, uuid) from public, anon;
  grant execute on function core_identity.client_field_definition_upsert(text, text, text, text, text, boolean, integer, boolean, uuid) to authenticated;
  ```

  **Semantik (V3):** `key` er funktionelt immutable efter INSERT — audit-PII-hash i `clients.fields` binder til key. `pii_level` kan eskaleres (none → indirect → direct) men ikke downgrades fra direct (eksisterende klartekst-værdier ville opstå i audit). For at ændre key eller sænke pii-niveau: deaktiver eksisterende definition + INSERT ny.

- **Afhængigheder:** T10.2, T10.13
- **Migration-fil:** `supabase/migrations/<ts>_t10_client_field_definition_upsert_rpc.sql`
- **Risiko:** lav.

### T10.10a — `client_field_definition_set_active` RPC (V8 — Code walk-through #4; krav-dok §3.2)

- **Type:** migration (CREATE FUNCTION)
- **Hvad:** Toggler `is_active` på felt-definition uden at røre øvrige felter. Matcher `client_set_active`-mønstret (T10.9) + krav-dok §3.2's "Deaktivér felt-definition" som distinct funktion. Adskilt RPC fordi UI-flowet er distinkt (knap "deaktiver felt" vs. "redigér felt").
- **Eksakt indhold:**

  ```sql
  create or replace function core_identity.client_field_definition_set_active(
    p_field_id uuid,
    p_is_active boolean,
    p_change_reason text
  ) returns void
  language plpgsql security definer set search_path = ''
  as $$
  begin
    if not core_identity.has_permission('client_field_definitions', 'manage', true) then
      raise exception 'client_field_definition_set_active: permission_denied' using errcode = '42501';
    end if;
    if p_change_reason is null or length(trim(p_change_reason)) = 0 then
      raise exception 'client_field_definition_set_active: change_reason er paakraevet' using errcode = '22023';
    end if;

    perform set_config('stork.source_type', 'manual', true);
    perform set_config('stork.change_reason', p_change_reason, true);
    perform set_config('stork.allow_client_field_definitions_write', 'true', true);

    update core_identity.client_field_definitions
      set is_active = p_is_active
     where id = p_field_id;
    if not found then
      raise exception 'client_field_definition_set_active: field % findes ikke', p_field_id using errcode = 'P0002';
    end if;
  end;
  $$;

  revoke all on function core_identity.client_field_definition_set_active(uuid, boolean, text) from public, anon;
  grant execute on function core_identity.client_field_definition_set_active(uuid, boolean, text) to authenticated;
  ```

- **Afhængigheder:** T10.2, T10.13
- **Migration-fil:** samme som T10.10 eller separat
- **Risiko:** lav.

### T10.11 — Logo-RPC'er (`client_logo_set` + `client_logo_clear` + `client_logo_get`)

- **Type:** migration (CREATE FUNCTION × 3)
- **Hvad:** Dedikerede RPC'er for logo. Set kræver alle tre felter ikke-NULL (matcher T10.1's consistency-CHECK). Clear nulstiller alle tre atomisk. Get returnerer bytea + metadata.
- **Eksakt indhold:**

  ```sql
  create or replace function core_identity.client_logo_set(
    p_client_id uuid,
    p_logo_bytes bytea,
    p_logo_content_type text,
    p_logo_filename text,
    p_change_reason text
  ) returns void
  language plpgsql security definer set search_path = ''
  as $$
  begin
    if not core_identity.has_permission('clients', 'manage', true) then
      raise exception 'client_logo_set: permission_denied' using errcode = '42501';
    end if;
    if p_change_reason is null or length(trim(p_change_reason)) = 0 then
      raise exception 'client_logo_set: change_reason er paakraevet' using errcode = '22023';
    end if;
    if p_logo_bytes is null or p_logo_content_type is null or p_logo_filename is null then
      raise exception 'client_logo_set: alle tre logo-felter er paakraevede (brug client_logo_clear for at fjerne)' using errcode = '22023';
    end if;

    perform set_config('stork.source_type', 'manual', true);
    perform set_config('stork.change_reason', p_change_reason, true);
    perform set_config('stork.allow_clients_write', 'true', true);

    update core_identity.clients
      set logo_bytes = p_logo_bytes,
          logo_content_type = p_logo_content_type,
          logo_filename = p_logo_filename
     where id = p_client_id;
    if not found then
      raise exception 'client_logo_set: client % findes ikke', p_client_id using errcode = 'P0002';
    end if;
  end;
  $$;

  create or replace function core_identity.client_logo_clear(
    p_client_id uuid,
    p_change_reason text
  ) returns void
  language plpgsql security definer set search_path = ''
  as $$
  begin
    if not core_identity.has_permission('clients', 'manage', true) then
      raise exception 'client_logo_clear: permission_denied' using errcode = '42501';
    end if;
    if p_change_reason is null or length(trim(p_change_reason)) = 0 then
      raise exception 'client_logo_clear: change_reason er paakraevet' using errcode = '22023';
    end if;

    perform set_config('stork.source_type', 'manual', true);
    perform set_config('stork.change_reason', p_change_reason, true);
    perform set_config('stork.allow_clients_write', 'true', true);

    update core_identity.clients
      set logo_bytes = null,
          logo_content_type = null,
          logo_filename = null
     where id = p_client_id;
    if not found then
      raise exception 'client_logo_clear: client % findes ikke', p_client_id using errcode = 'P0002';
    end if;
  end;
  $$;

  create or replace function core_identity.client_logo_get(p_client_id uuid)
  returns table (logo_bytes bytea, logo_content_type text, logo_filename text)
  language plpgsql stable security invoker set search_path = ''
  as $$
  begin
    if not core_identity.has_permission('clients', 'manage', false) then
      raise exception 'client_logo_get: permission_denied' using errcode = '42501';
    end if;
    return query
      select c.logo_bytes, c.logo_content_type, c.logo_filename
        from core_identity.clients c
       where c.id = p_client_id and c.logo_bytes is not null;
  end; $$;

  revoke all on function core_identity.client_logo_set(uuid, bytea, text, text, text) from public, anon;
  revoke all on function core_identity.client_logo_clear(uuid, text) from public, anon;
  revoke all on function core_identity.client_logo_get(uuid) from public, anon;
  grant execute on function core_identity.client_logo_set(uuid, bytea, text, text, text) to authenticated;
  grant execute on function core_identity.client_logo_clear(uuid, text) to authenticated;
  grant execute on function core_identity.client_logo_get(uuid) to authenticated;
  ```

- **Afhængigheder:** T10.1 (logo-kolonner + consistency-CHECK), T10.13
- **Migration-fil:** `supabase/migrations/<ts>_t10_client_logo_rpcs.sql`
- **Risiko:** lav.

### T10.12 — Read-RPC'er (`client_get`, `client_list`, `client_field_definitions_list`)

- **Type:** migration (CREATE FUNCTION × 3)
- **Hvad:** SECURITY INVOKER read-RPC'er bag has_permission. Returnerer non-logo-felter (logo via dedikeret get).
- **Eksakt indhold:**

  ```sql
  create or replace function core_identity.client_get(p_client_id uuid)
  returns table (
    id uuid,
    name text,
    fields jsonb,
    is_active boolean,
    logo_content_type text,
    logo_filename text,
    has_logo boolean,
    created_at timestamptz,
    updated_at timestamptz
  ) language plpgsql stable security invoker set search_path = ''
  as $$
  begin
    if not core_identity.has_permission('clients', 'manage', false) then
      raise exception 'client_get: permission_denied' using errcode = '42501';
    end if;
    return query
      select c.id, c.name, c.fields, c.is_active,
             c.logo_content_type, c.logo_filename,
             c.logo_bytes is not null,
             c.created_at, c.updated_at
        from core_identity.clients c
       where c.id = p_client_id;
  end; $$;

  create or replace function core_identity.client_list()
  returns table (
    id uuid, name text, is_active boolean,
    has_logo boolean, created_at timestamptz, updated_at timestamptz
  ) language plpgsql stable security invoker set search_path = ''
  as $$
  begin
    if not core_identity.has_permission('clients', 'manage', false) then
      raise exception 'client_list: permission_denied' using errcode = '42501';
    end if;
    return query
      select c.id, c.name, c.is_active, c.logo_bytes is not null,
             c.created_at, c.updated_at
        from core_identity.clients c
       order by c.name asc;
  end; $$;

  create or replace function core_identity.client_field_definitions_list(p_include_inactive boolean default false)
  returns setof core_identity.client_field_definitions
  language plpgsql stable security invoker set search_path = ''
  as $$
  begin
    if not core_identity.has_permission('client_field_definitions', 'manage', false) then
      raise exception 'client_field_definitions_list: permission_denied' using errcode = '42501';
    end if;
    return query
      select * from core_identity.client_field_definitions
       where p_include_inactive or is_active = true
       order by display_order, key;
  end; $$;

  revoke all on function core_identity.client_get(uuid) from public, anon;
  revoke all on function core_identity.client_list() from public, anon;
  revoke all on function core_identity.client_field_definitions_list(boolean) from public, anon;
  grant execute on function core_identity.client_get(uuid) to authenticated;
  grant execute on function core_identity.client_list() to authenticated;
  grant execute on function core_identity.client_field_definitions_list(boolean) to authenticated;
  ```

- **Afhængigheder:** T10.1, T10.2, T10.13
- **Migration-fil:** `supabase/migrations/<ts>_t10_client_read_rpcs.sql`
- **Risiko:** lav.

### T10.13 — Seed permissions i grant-modellen

- **Type:** migration (INSERT i permission_pages + permission_tabs + role_permission_grants)
- **Hvad:** Tilføj `clients` + `client_field_definitions` pages under `org_structure`-area; manage-tab pr. page; superadmin grants.
- **Eksakt indhold:**

  ```sql
  select set_config('stork.source_type', 'migration', false);
  select set_config('stork.change_reason',
    'T10.13: seed permissions for trin 10 RPCs i grant-modellen', false);
  -- V4 (Codex V3 KRITISK): T9-supplement's INSERT-policies på permission_pages
  -- / permission_tabs / role_permission_grants kræver stork.t9_write_authorized.
  select set_config('stork.t9_write_authorized', 'true', false);

  -- 1. Pages under org_structure-area
  with org_area as (
    select id from core_identity.permission_areas where name = 'org_structure'
  )
  insert into core_identity.permission_pages (area_id, name)
  select org_area.id, page_name
  from org_area, (values ('clients'), ('client_field_definitions')) as p(page_name)
  on conflict (area_id, name) do nothing;

  -- 2. Tabs: 'manage' for hver ny page (V9: scope til org_structure-area for robusthed)
  insert into core_identity.permission_tabs (page_id, name)
  select p.id, 'manage'
  from core_identity.permission_pages p
  join core_identity.permission_areas a on a.id = p.area_id
  where p.name in ('clients', 'client_field_definitions')
    and a.name = 'org_structure'
  on conflict (page_id, name) do nothing;

  -- 3. Superadmin grants på tab-niveau (V9: scope til org_structure-area for robusthed)
  insert into core_identity.role_permission_grants
    (role_id, area_id, page_id, tab_id, can_access, can_write, visibility)
  select
    (select id from core_identity.roles where name = 'superadmin'),
    null, null, t.id,
    true, true, 'all'
  from core_identity.permission_tabs t
  join core_identity.permission_pages p on p.id = t.page_id
  join core_identity.permission_areas a on a.id = p.area_id
  where p.name in ('clients', 'client_field_definitions')
    and a.name = 'org_structure'
    and t.name = 'manage'
  on conflict (role_id, coalesce(area_id::text, ''),
              coalesce(page_id::text, ''), coalesce(tab_id::text, ''))
  do nothing;
  ```

- **Afhængigheder:** T9 migration 9 (grant-modellen + `org_structure`-area), T9 (`superadmin`-rolle)
- **Migration-fil:** `supabase/migrations/<ts>_t10_seed_permissions.sql`
- **Risiko:** lav (idempotent ON CONFLICT). Rollback: DELETE i omvendt rækkefølge.

### T10.14 — Master-plan-rettelser (jf. krav-dok §7)

- **Type:** docs-ændring (i samme PR som migrations)
- **Hvad:** Ret §1.8 + §4 trin 10 så match-rolle / crm_match_id / migration-leverance fjernes. Tilføj is_active + logo. Tilføj rettelse-entry i Appendix C.
- **Konkrete tekst-ændringer (skitse):**
  - §1.8 erstattes med: "Klient er driftens grundenhed. Stor variation i felter pr. klient — derfor felt-bag, ikke felt-eksplosion. Klient lever i core_identity.clients (id, name, fields jsonb, is_active, logo). Klient-felt-definitions-registry globalt: key, display-navn, type, required, pii-niveau, display-rækkefølge, is_active. Validerings-trigger advarer ved ukendte jsonb-keys (LENIENT-default; strict-mode via session-var). Audit-PII-filter har special-case for jsonb felt-bag: walker keys og hasher hver med pii_level='direct'. Klient anonymiseres ikke; livscyklus = aktiv/inaktiv. Match-mekanik udskudt til data-indgang-pakke."
  - §4 trin 10-række: erstat hele cellen med: "Klient-skabelon (core_identity.clients + client_field_definitions + logo + is_active + FK fra client_node_placements + has_permission-RPCs)". Migration-tekst og crm_match_id-tekst fjernes.
  - Appendix C: tilføj rettelse-entry 2026-05-20 med kort beskrivelse + reference til mathias-afgoerelser "Trin 10 scope-præcisering" og denne plan.
- **Afhængigheder:** ingen — committes parallelt med migrations
- **Migration-fil:** N/A (docs)
- **Risiko:** lav. Rollback: git revert.

### T10.15 — Smoke-tests (6 stk i V7)

- **Type:** test-filer
- **Hvad:** Seks smoke-tests dækker centrale flows. V7 tilføjer `t10_client_active_check.sql` for T10.7b-leverancen.
- **Test-filer:**

  | Test-fil                                                                                    | Hvad verificeres                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
  | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `supabase/tests/smoke/t10_client_lifecycle.sql`                                             | client_upsert (INSERT + UPDATE), client_set_active toggle, client_get returnerer korrekt is_active. has_permission-spærring uden permission-row. is_active toggle bevarer øvrige felter. **V8 (Code walk-through #2):** assert client_upsert UPDATE rør IKKE is_active (set inaktiv → upsert med ny name → read is_active stadig false).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
  | `supabase/tests/smoke/t10_client_field_definitions.sql`                                     | client_field_definition_upsert (INSERT + UPDATE), is_active toggle, client_field_definitions_list respekterer p_include_inactive. **Audit-PII-hashing:** insert med pii_level='direct' key i fields → audit_log har sha256-hash. **V3 (Codex V2 KRITISK-SIKKERHEDSHUL):** UPDATE af `key` afvises (errcode 22023). UPDATE af pii_level direct → none afvises (errcode 22023). pii_level none → indirect → direct accepteres. **V8 (Code walk-through #3+#4):** assert client_field_definition_upsert UPDATE rør IKKE is_active. client_field_definition_set_active toggles is_active uafhængigt.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
  | `supabase/tests/smoke/t10_client_logo.sql`                                                  | client_logo_set + client_logo_get + client_logo_clear. **Assert client_upsert UPDATE af name/fields bevarer logo_bytes uændret** (read før+efter; sammenlign). consistency-CHECK blokerer partiel logo. client_logo_set fejler hvis ét felt er NULL. **V12 (Codex runde 11 KRITISK-SIKKERHEDSHUL):** assert at `audit_log.new_values` har `logo_filename` + `logo_bytes` SHA256-hashed (ikke klartekst) efter `client_logo_set`-kald. `logo_content_type` forbliver i klartekst i audit (pii_level='none').                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
  | `supabase/tests/smoke/t10_client_node_placements_fk.sql`                                    | FK virker: INSERT med ikke-eksisterende client_id fejler. DELETE af klient med åbne placements fejler RESTRICT. **V6 (Code-validering fund #6):** Test SKAL være `begin;` + `rollback;`-wrapped (linje-niveau) — `core_identity.client_node_placements` er på `TX_WRAP_REQUIRED_FOR_TEST_INSERT` (`scripts/fitness.mjs:110`). Fitness-check `db-test-tx-wrap-on-immutable-insert` blokerer ellers.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
  | `supabase/tests/smoke/t10_clients_validate_fields.sql`                                      | LENIENT-default: unknown key i fields → warning, INSERT accepteret. Strict-mode (`stork.clients_fields_strict='true'`): unknown key → exception. **V2 (Codex V1 MELLEM):** assert at non-object fields (`'"scalar"'::jsonb`, `'[1,2]'::jsonb`) afvises af `clients_fields_is_object`-CHECK (errcode 23514). **V2 (Codex V1 KRITISK-SIKKERHEDSHUL):** assert audit-PII-hashing rammer direct-PII keys i fields selv efter felt-definitionen er sat is_active=false.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
  | `supabase/tests/smoke/t10_client_active_check.sql` (V7 + V10 cron-context + V13 undo-setup) | **V13-SETUP (Codex runde 12):** efter `begin;` skal testen sætte `stork.t9_write_authorized='true'` og UPDATE `core_identity.undo_settings SET undo_period_seconds = 0 WHERE change_type IN ('client_place','client_close')` for at omgå T9's 24-timers default-undo-periode. ROLLBACK ved test-slut isolerer ændringen. Uden dette rammer apply-vej `not_yet_due` før aktiv-check. **Tests:** T1: opret aktiv klient → `client_node_place` succeeds → pending oprettes → approve+apply succeeds → placement findes. T2: `client_set_active(client_id, false)` → ny `client_node_place` på samme klient + nyt team → forvent **22023 `client_inactive`**. T3 (apply-path-scenarie): non-admin opretter pending mens klient aktiv → non-admin approver → deaktiver klient → apply → forvent **P0001 `apply_client_place: client_inactive`**. T4: `client_node_close` på inaktiv klient → success (ingen aktiv-check her). **T4a (V14):** `client_node_close` på ikke-eksisterende client_id → forvent **P0002 `client_not_found`** (eksistens-check tilføjet i V14). **T5 superadmin-bypass wrapper (Mathias 2026-05-21):** med superadmin-auth, place på inaktiv klient → success. **T6 (V10 cron-context):** superadmin opretter pending mens klient aktiv → deaktiver klient → simulér cron-apply (kør apply uden auth-context via `reset role` + direct `_apply_client_place`-call eller `pending_change_apply` som service_role) → success (bypass via `is_admin_by_employee_id(requested_by)`). **T7 (V10):** non-admin opretter pending → superadmin approver → klient deaktiveres → cron-apply → success (bypass via approved_by). **T8 (V10):** non-admin opretter pending → non-admin approver → klient deaktiveres → cron-apply → P0001 (ingen admin involveret). Test SKAL være `begin;` + `rollback;`-wrapped. |

- **Afhængigheder:** alle migrations i T10.1-T10.13 + T10.7b for active_check-test
- **Migration-fil:** test-filer
- **Risiko:** lav.

### T10.16 — Fitness-script-opdatering (V6 omformuleret)

- **Type:** script-ændring (`scripts/fitness.mjs`)
- **Hvad (V6 — Code-validering fund #4 + #5):**
  1. **FK-coverage-allowlist:** `FK_COVERAGE_EXEMPTIONS`-allowlist findes IKKE i nuværende `scripts/fitness.mjs` — master-plan §3 punkt 19 er ikke implementeret endnu. Hvis check tilføjes senere, vil `client_node_placements.client_id` ikke længere være en exemption-kandidat (FK eksisterer efter T10.7). **Ingen fitness-script-ændring nødvendig for FK i V6.**
  2. **R7d-allowlist (KRÆVET):** Tilføj `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (`scripts/fitness.mjs:149-154`). RPC'en bruger `where p_include_inactive or is_active = true` for at filtrere aktive felt-definitioner. `client_field_definitions` har KUN is_active (ingen status-kolonne) — matcher allowliste-kommentaren: "T9-tabellerne har is_active som lifecycle-signal alene; ingen status-kolonne. Disse er allowlist'et nedenfor."
- **Eksakt indhold (V6):**

  ```javascript
  // I LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS-Set (~linje 149-154):
  const LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS = new Set([
    "core_identity._apply_employee_place",
    "core_identity._apply_client_place",
    "core_identity.client_node_place",
    "core_identity.permission_elements_read",
    "core_identity.client_field_definitions_list", // V6 — T10.12 RPC; client_field_definitions har kun is_active, ingen status
    "core_identity.clients_validate_fields", // V8 (Codex runde 7) — T10.6 trigger-funktion; filtrerer på aktive felt-definitioner som lifecycle-signal
  ]);
  ```

- **G-nummer-kandidat:** FK-coverage-fitness-check ikke implementeret per master-plan §3 punkt 19. Registreres som teknisk gæld for senere pakke der implementerer check'en. T9-migration `20260518000004:5` har forhåndsdokumentation der ikke matcher nuværende fitness-script-tilstand.
- **Afhængigheder:** T10.12 (`client_field_definitions_list`-RPC skal eksistere så allowlist-entry refererer reel funktion)
- **Risiko:** lav.

---

## Fundament-tjek-passeret

| Tjek                                                           | Status | Reference                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hver write-RPC har GRANT + INSERT/UPDATE-policy + session-var  | ja     | T10.8/T10.9/T10.10/T10.10a/T10.11 — `stork.allow_clients_write` / `allow_client_field_definitions_write` + `revoke/grant execute` + has_permission('manage', true). **T10.7b** (`client_node_place` + `client_node_close` + `_apply_client_place`) — `stork.t9_write_authorized = 'true'` før `pending_change_request` (V9-fix); apply-handler tjekker eksistens (P0002) + aktiv (P0001) med employee-id-baseret admin-bypass (V10-fix); pending_change_apply-dispatcher (T9-supplement) cases `client_place` + `client_close` ramt automatisk. **T10.13** (permission-seed) — `stork.t9_write_authorized` (V4-fix) som krævet af T9-supplement's INSERT-policies på permission_pages/tabs/role_permission_grants. Default-privileges på `core_identity` schema (T1: `grant execute on functions to authenticated`) dækker GRANT for alle T10-RPC'er. |
| Hver SELECT-policy bred nok til legitime læsere                | ja     | T10.1, T10.2 — has_permission('clients'/'client_field_definitions', 'manage', false) **tab-aware (V6-fix)**. T10.13 seeder kun tab-grants → null-tab matcher ikke; 'manage' matcher. T9-supplement's ACL-scoped policy på client_node_placements bevares uændret.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Eksempel-row verificeret gennem flow                           | ja     | T10.15 smoke-tests dækker INSERT + UPDATE + read-RPC + permission-spærring + audit-PII-hashing + logo-preserve + FK + LENIENT/strict + immutable-key + pii-downgrade-block + active-check (wrapper + apply-path + cron-context). **T10.7b apply-dispatch:** pending_change_apply (T9-fundament-supplement) dispatcher cases `client_place` + `client_close` rammer modificeret `_apply_client_place` + uændret `_apply_client_close`. **jsonb payload producer/consumer:** wrapper bygger payload via `jsonb_build_object(...)` (producer), apply-handler læser via `(p_payload->>'client_id')::uuid` etc. (consumer) — pattern matcher T9-supplement linje 88-102 + 295-301.                                                                                                                                                                         |
| Plan-detaljer eksplicit (ingen TBD / Code afgør / overladelse) | ja     | Alle 16 steps har eksakt SQL/pseudo-SQL. Ingen "kan tilføjes senere"-noter.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

---

## Test-konsekvens

| Test-fil                            | Hvad verificeres                                                                                                      | Forventet status |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `t10_client_lifecycle.sql`          | client_upsert + client_set_active + client_get + has_permission-spærring + is_active bevarer øvrige felter            | grøn             |
| `t10_client_field_definitions.sql`  | client_field_definition_upsert (uden p_match_role) + list-RPC + audit-PII-hashing for fields-keys                     | grøn             |
| `t10_client_logo.sql`               | logo set/clear/get + assert client_upsert bevarer logo + consistency-CHECK + set fejler ved NULL i ét felt            | grøn             |
| `t10_client_node_placements_fk.sql` | FK afviser ikke-eksisterende client_id; ON DELETE RESTRICT                                                            | grøn             |
| `t10_clients_validate_fields.sql`   | LENIENT-default WARN; strict-mode raise                                                                               | grøn             |
| `t10_client_active_check.sql` (V7)  | Aktiv place success + inaktiv place 22023 + pending+deaktiver+apply P0001 + close inaktiv success + superadmin-bypass | grøn             |

Eksisterende tests opdateret i T10.7a:

- `t9_placements.sql` — seedet clients-fixture FØR T5/T7/T9-blokke
- `t9_backdated_historical_traversal.sql` — seedet clients-fixture FØR BLOCK 3
- `t9_public_wrapper_rpcs.sql` — ingen ændring (T2 fejler i pre-check FØR FK)

---

## Build-fase halt-håndtering

- **Forventede WORKAROUND-kandidater:** ingen forventet.
- **Forventede PLAN-AFVIGELSE-scenarier:**
  - Hvis T1-audit_filter_values' STABLE-modifier blokerer mig fra at læse client_field_definitions (immutability-issue), kan jeg ende med at skifte til VOLATILE — PLAN-AFVIGELSE med G-nummer-forslag.
  - Hvis et T9-test bruger client_id i et flow jeg ikke har spottet i recon → PLAN-AFVIGELSE med STOP og recon-først-gentag.
  - Hvis pnpm fitness rammer andre exemption-entries der ikke findes i recon → markeres som PLAN-AFVIGELSE.
- **Kritiske invarianter der ikke må brydes:**
  - FORCE ROW LEVEL SECURITY bevares på alle nye tabeller
  - audit-trigger-dækning på alle write-tabeller
  - clients_validate_fields-trigger med LENIENT-default + strict-via-session-var
  - audit_filter_values' clients-special-case (jsonb-walking for direct-PII keys)
  - change_reason-disciplin (`stork.change_reason` påkrævet ved alle writes)
  - has_permission-checks ER write-gate (ikke kun policy-fallback)
  - T9-supplement's `client_node_placements_select` policy uændret

---

## Optimerings-hypoteser (V5.3 — valgfri)

- **Hypotese 1:** Logo-MIME-validering kunne håndhæves som CHECK constraint på `logo_content_type` (`IN ('image/png', 'image/jpeg', 'image/svg+xml')`) frem for app-niveau. Codex kan rejse som OPTIMERING-FORSLAG.
- **Hypotese 2:** `client_list` kunne tilbyde valgfri filter på is_active (p_include_inactive default false). Codex kan rejse som ADOPT i build.
- **Hypotese 3:** `core_compliance.audit_filter_values`'s clients-special-case kan ekstraheres til en generel "jsonb-walking via field-definition-tabel"-mekanik for fremtidige jsonb-felter. Ikke implementeret nu (premature abstraction).
- **Hypotese 4 (V6 erstatter Codex V1 #4):** T10.4 har nu `on conflict do nothing` (V6 — Mathias-terminal fund #2). Tidligere DEFER-til-G-nummer var forkert: fitness-check `migration-on-conflict-discipline` håndhæver det, ikke optional.
- **G-nummer-kandidat (Code-validering fund #4):** FK-coverage-fitness-check ikke implementeret per master-plan §3 punkt 19. T9-migration har forhåndsdokumentation der ikke matcher nuværende fitness-script.

---

## Risiko + kompensation

| Migration                               | Værste-case                                                         | Sandsynlighed                                                                          | Rollback                    |
| --------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------- |
| T10.1 (CREATE clients-tabel)            | Audit-trigger fejler pga. manglende klassifikation                  | lav (T10.4 seedede klassifikation i samme PR; audit_filter_values har LENIENT-default) | drop table cascade          |
| T10.2 (CREATE client_field_definitions) | Samme som T10.1                                                     | lav                                                                                    | drop table cascade          |
| T10.3 (allowlist-udvidelse)             | Allowlist-format ændret af senere migration                         | lav (D1b-format stabilt)                                                               | re-create D1b's signatur    |
| T10.4 (klassifikation INSERT)           | validate_permanent_classification fejler hvis T10.3 ikke kørt først | lav (afhængighed eksplicit)                                                            | DELETE matching rows        |
| T10.5 (omskriv audit_filter_values)     | Eksisterende audit-flow brækker                                     | mellem (omskriver kerne-funktion)                                                      | re-create T1's signatur     |
| T10.6 (clients_validate_fields trigger) | Trigger blokerer legitime writes                                    | lav (LENIENT-default)                                                                  | drop trigger + function     |
| T10.7 (FK)                              | T9-tests brækker                                                    | lav efter T10.7a                                                                       | drop constraint             |
| T10.7a (test-fixture-seed)              | Side-effekt i andre T9-tests                                        | lav (kun ekstra INSERT)                                                                | git revert                  |
| T10.8-T10.12 (RPC'er)                   | Signatur-konflikt med tidligere version                             | lav (greenfield; ingen tidligere RPC i core_identity-schema)                           | drop function               |
| T10.13 (permission-seed)                | INSERT fejler pga. manglende area/role                              | lav (T9-migration 9 har seedede); ON CONFLICT idempotent                               | DELETE i omvendt rækkefølge |
| T10.14 (master-plan-rettelser)          | Tekst-rettelse rammer Appendix C-tabel forkert                      | lav                                                                                    | git revert                  |
| T10.15 (smoke-tests)                    | Test rammer flow jeg ikke har spottet                               | lav (recon-først dækkede T9-test-mønster)                                              | revert test-fil             |
| T10.16 (fitness-script)                 | Allowlist-entry-formatet er ikke som forventet                      | lav (verificeres ved build; STOP hvis afvigelse)                                       | revert script-ændring       |

**Kompensation generelt:** Hver migration er separat fil. Rækkefølge: tabeller (T10.1, T10.2) → klassifikation-grundlag (T10.3, T10.4) → audit/validate (T10.5, T10.6) → FK med test-fix (T10.7a → T10.7) → RPC'er (T10.8-T10.12) → permission-seed (T10.13) → docs + tests + fitness (T10.14-T10.16). Hver checkpoint kan testes isoleret.

---

## Oprydnings- og opdaterings-strategi

**Filer der skal flyttes til arkiv** (efter pakken er merget):

- `docs/coordination/trin-10-krav-og-data.md` → `docs/coordination/arkiv/`
- `docs/coordination/trin-10-plan.md` → `docs/coordination/arkiv/`
- Alle `docs/coordination/plan-feedback/trin-10-*.md` → `docs/coordination/arkiv/`
- `docs/coordination/codex-reviews/2026-05-20-trin-10-runde-*.md` bevares i mappen (audit-trail)

**Filer der skal slettes:** ingen.

**Konsekvens-opdateringer for autoritative dokumenter:**

| Dokument                                   | Konsekvens? | Opdatering der laves i denne pakke                                                                                                                                        |
| ------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/strategi/stork-2-0-master-plan.md`   | ja          | §1.8 + §4 trin 10 (T10.14) + rettelse-entry i Appendix C                                                                                                                  |
| `docs/strategi/bygge-status.md`            | ja          | Trin 10 markeres som godkendt efter merge                                                                                                                                 |
| `docs/coordination/mathias-afgoerelser.md` | nej         | Alle scope-/forretnings-beslutninger ligger allerede i 2026-05-20-entries                                                                                                 |
| `docs/teknisk/teknisk-gaeld.md`            | ja          | G057 (T9 forretnings-invariants uden superadmin-bypass) + G058 (FK-coverage-fitness-check ikke implementeret per master-plan §3.19) registreret i forbindelse med trin 10 |

**Standard-opdateringer:**

- `docs/coordination/aktiv-plan.md` → ryd til "ingen aktiv plan"; trin 10 tilføjes til Historisk
- `docs/coordination/seneste-rapport.md` → peger på `docs/coordination/rapport-historik/2026-05-2X-trin-10.md`

**Reference-konsekvenser:**

- `grep -rn "trin-10-krav-og-data\|trin-10-plan" docs/` returnerer kun arkiv + rapport-historik + slut-rapport
- `grep -n "match-rolle\|crm_match_id\|migration: discovery-script for klienter" docs/strategi/stork-2-0-master-plan.md` returnerer 0 hits

**Ansvar:** Code udfører oprydning + opdatering som del af build-PR (T10.14 + standard-opdateringer). Slut-rapport verificerer udførelse.

---

## Fire-dokument-konsultation

| Dokument                                    | Konsulteret | Status           | Relevante referencer                                                                                                                                                                                                                                                                                                                                                                                                                          | Konflikt med plan?                                                                                                                                                                   |
| ------------------------------------------- | ----------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `docs/strategi/vision-og-principper.md`     | ja          | LÅST-AUTORITATIV | Princip 1 (data-kontrol i UI), Princip 2 (rettigheder i UI — has_permission frem for hardkodet), Princip 3 (forretningslogik som data — client_field_definitions UI-konfigurerbar), Princip 5 (greenfield-disciplin — CREATE TABLE fra bunden), Princip 6 (audit på alt der ændrer data — audit-trigger på alle write-tabeller), Princip 9 (status-modeller bevarer historik — is_active erstatter DELETE)                                    | nej                                                                                                                                                                                  |
| `docs/strategi/stork-2-0-master-plan.md`    | ja          | RETNINGSGIVENDE  | §1.8 (Klient-skabelon — rettes via T10.14), §1.11 (3-schema-arkitektur — clients i core_identity), §1.2 (klassifikations-registry — T10.4), §1.3 (PII-filter — T10.5 udvider med clients-special-case), §3 (CI-blockers — T10.16 fjerner allowlist), §4 trin 10 (rettes via T10.14)                                                                                                                                                           | ja — krav-dok §7 specificerer at §1.8 + §4 trin 10 rettes som del af trin 10-arbejdet; T10.14 leverer rettelserne. Konflikt løses ved at rette master-plan (trigger-for-opdatering). |
| `docs/coordination/mathias-afgoerelser.md`  | ja          | RETNINGSGIVENDE  | 2026-05-20 "Trin 10 forretnings-ramme" (7 sandheder), 2026-05-20 "Trin 10 scope-præcisering" (migration + match-rolle ud), 2026-05-20 "Workflow-justering V2". 2026-05-17 (klient kun til team; en klient = maks ét team). 2026-05-16 (klient-data følger klient ved team-skift). 2026-05-15 (plan-leverance er kontrakt). 2026-05-14 (E-conomic udelades; legal → time_based). 2026-05-11 (vision låst; superadmin eneste hardkodede rolle). | nej                                                                                                                                                                                  |
| `docs/coordination/trin-10-krav-og-data.md` | ja          | PAKKE-KONTRAKT   | §2 (forretnings-sandheder), §3.1-§3.4 (funktioner), §5 (scope-grænse), §7 (master-plan-rettelser), §8 (afgørelses-tabel), §10 (oprydnings-strategi)                                                                                                                                                                                                                                                                                           | nej (forudsat tolkning af §2.3.1 "egne felter" = "egne værdier i fields jsonb", Mathias-bekræftet 2026-05-20).                                                                       |

---

## Konklusion

V14 bringer trin 10 i mål: klient-skabelonen etableres greenfield i `core_identity` med fuld krav-dok-konformitet på alle write-veje. Plan har gennemgået 13 Codex-runder + 13 Code walk-through-passes. 16 steps + 3 sub-steps skaber alle artefakter fra bunden.

19 leverancer, alle med eksakt SQL/pseudo-SQL. Risiko lav-mellem på alle migrations, hver rollbar individuelt.

V14-ændring ift. V13 (Code walk-through efter Codex APPROVAL):

- T10.7b `client_node_close`: tilføjet klient-eksistens-check (P0002) FØR session-var + pending_change_request. Krav-dok §3.4-konformitet: "valideres at klienten faktisk findes" ved BÅDE oprettelse OG ændring. V13 havde checken kun på client_node_place; close-vejen var silent no-op ved ikke-eksisterende client_id.
- T10.15 smoke-test T4a tilføjet: `client_node_close` med non-existent client_id → P0002.

V13-ændringer ift. V12 (Codex runde 12):

- T10.15 `t10_client_active_check.sql`: setup-disciplin tilføjet — UPDATE `undo_settings.undo_period_seconds = 0` for `client_place`/`client_close` transaction-local. Omgår T9's 24-timers default-undo-periode der ellers ville få apply til at fejle med `not_yet_due` før aktiv-check rammes. ROLLBACK isolerer.

V12-ændringer ift. V11 (Codex runde 11):

- T10.4: `clients.logo_filename` + `clients.logo_bytes` skiftet til `pii_level='direct'` (audit hasher). `logo_content_type` forbliver `'none'`. Codex KRITISK-SIKKERHEDSHUL: brugerleveret filnavn kunne lande i klartekst i audit_log.
- T10.15 logo-test: assert at `audit_log.new_values.logo_filename` + `logo_bytes` er SHA256-hashed efter `client_logo_set`.

V11-ændringer ift. V10 (Codex runde 10):

- Fundament-tjek-tabel udvidet med T10.7b's komplette write-vej (`client_node_place` + `client_node_close` + `_apply_client_place` + apply-dispatch + jsonb producer/consumer) + T10.10a (`client_field_definition_set_active`).
- G058 registreret i teknisk-gaeld.md (FK-coverage-fitness-check ikke implementeret per master-plan §3.19). Oprydnings-strategi-tabel opdateret til "ja" på teknisk-gaeld med G057 + G058.

V10-ændringer ift. V9 (Codex runde 9):

- T10.7b udvidet med ny helper `core_identity.is_admin_by_employee_id(p_employee_id uuid)` — admin-tjek via employee-id (ikke `auth.uid()`).
- `_apply_client_place` henter `requested_by` + `approved_by` fra pending-rækken og bypasser aktiv-check hvis EITHER er superadmin (Codex runde 9 TEKNISK-BLOKERING).
- Wrapper `client_node_place` beholder `is_admin()` (auth-context er garanteret).
- T10.15 smoke-test udvidet med 3 nye cron-context-scenarier (T6 + T7 + T8) der dækker requester-bypass, approver-bypass og no-admin-failure.

V9-ændringer ift. V8 (Codex runde 8):

- T10.7b udvidet: `client_node_place` + ny CREATE OR REPLACE af `client_node_close` sætter `stork.t9_write_authorized = 'true'` før `pending_change_request`. T9-fundament-supplement's `pending_changes_insert`-policy kræver session-var (Codex runde 8 TEKNISK-BLOKERING).
- T10.13 robusthed: tab/grant-INSERT-queries scope'es til `org_structure`-area via JOIN på area_id (Codex G-NUMMER → ADOPT).
- Walk-through-disciplin V9: hver T10-RPC's write-vej spores til ALLE berørte RLS-tabeller, ikke kun direkte tabel.

V8-ændringer ift. V7 (Codex runde 7 + Code grundig walk-through "fuldt gear"):

- T10.16 udvidet: `core_identity.clients_validate_fields` tilføjet til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (Codex runde 7 KRITISK).
- T10.8 `client_upsert` UPDATE: `is_active` fjernet fra SET-klausul. p_is_active anvendes kun ved INSERT. Toggle via client_set_active. Forhindrer utilsigtet reaktivering (Code walk-through #2).
- T10.10 `client_field_definition_upsert` UPDATE: `is_active` fjernet fra SET-klausul (Code walk-through #3).
- **Ny T10.10a:** `client_field_definition_set_active(p_field_id, p_is_active, p_change_reason)` RPC matcher krav-dok §3.2 "Deaktivér felt-definition" + client_set_active-mønstret (Code walk-through #4).
- T10.15 udvidet: lifecycle-test assert client_upsert UPDATE bevarer is_active; field-defs-test assert UPDATE bevarer is_active + set_active toggler uafhængigt.
- Superadmin-bypass: bevares på T10.7b (forretnings-invariant). **IKKE** udvidet til T10.10's key/pii_level-immutable (sikkerheds-invariant, Mathias-bekræftet).

V7-ændringer ift. V6 (Mathias-terminal-review V6 + 2026-05-21 superadmin-rettelse):

- **Ny T10.7b:** CREATE OR REPLACE `client_node_place` + `_apply_client_place` med klient-aktiv-check og **superadmin-bypass**. Krav-dok §2.5.2 håndhæves i både wrapper og apply-path (apply fanger pending oprettet mens aktiv, applied efter deaktivering).
- T10.15: ny smoke-test `t10_client_active_check.sql` (5 scenarier inkl. superadmin-bypass).
- Stale-fixes: linje 113 (Verificerede afhængigheder) + linje 142 (Scope) opdateret til at matche T10.16's R7d-allowlist-retning. Linje 68 (V1-fund-tabel) + linje 1335 (Konklusion-historik) markeret som "V6 OVERSKRIVER".
- T10.4 + Konklusion: "9 kolonner" på `client_field_definitions` rettet til "10 kolonner" (SQL var korrekt; tekst-fejl).

V6-ændringer ift. V5 (Mathias-terminal-review + Code grundig validering):

- T10.1 + T10.2: tilføjet `-- no-dedup-key: <reason>` markers — fitness-check `dedup-key-or-opt-out` blokerer ellers (Mathias #1).
- T10.4: tilføjet `on conflict (table_schema, table_name, column_name) do nothing` — `core_compliance.data_field_definitions` er på `BOOTSTRAP_CONFIG_TABLES`; tidligere DEFER-til-G-nummer var forkert (Mathias #2).
- T10.1 + T10.2 SELECT-policies + T10.11 client_logo_get + T10.12 read-RPC'er: alle skiftet fra `has_permission(p, null, false)` til `has_permission(p, 'manage', false)` — tab-aware. T10.13 seeder kun tab-grants så null-tab matcher ikke (Mathias #3).
- T10.15 `t10_client_node_placements_fk.sql`: eksplicit `begin;` + `rollback;` wrap — `client_node_placements` på `TX_WRAP_REQUIRED_FOR_TEST_INSERT` (Code-validering #6).
- T10.16 omformuleret: `FK_COVERAGE_EXEMPTIONS` findes ikke i nuværende fitness-script (master-plan §3.19 ikke implementeret); plan tilføjer i stedet `core_identity.client_field_definitions_list` til `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (Code-validering #4 + #5). G-nummer for FK-coverage-check.

V5-ændring ift. V4 (Codex runde 4 ACCEPT):

- T10.1 + T10.2: tilføjet `grant insert, update on table ... to authenticated` — RLS-policy + session-var kan ikke virke før DML-GRANT er på plads. Ingen DELETE-grant (inaktivering via is_active).

V4-ændring ift. V3 (Codex runde 3 ACCEPT):

- T10.13: tilføjet `set_config('stork.t9_write_authorized', 'true', false)` før INSERTs — krævet af T9-supplement's INSERT-policies på permission_pages/tabs/role_permission_grants (Codex V3 KRITISK).
- Fundament-tjek-tabel udvidet med T10.13's session-var-disciplin.

V3-ændringer ift. V2 (Codex runde 2 ACCEPT på begge fund):

- T10.3: baseret på P1a's komplette VALUES-blok (15 entries inkl. `anonymization_strategies`) + 2 trin 10-entries = 17 total. V2's D1b-baseline var regression (Codex V2 KRITISK #2).
- T10.10: `key` er funktionelt immutable for eksisterende definitions (UPDATE blokeres). `pii_level` direct → non-direct afvises. Forhindrer audit-PII-datalæk via key-rename eller pii-downgrade (Codex V2 KRITISK-SIKKERHEDSHUL #1).
- T10.15 smoke-test udvidet med immutable-key + pii-downgrade-block assertions.

V2-ændringer ift. V1 (Codex runde 1 ACCEPT på 3 fund + DEFER på 1):

- T10.1: tilføjet `CHECK (jsonb_typeof(fields) = 'object')` — forhindrer scalar/array i fields-kolonnen (Codex KRITISK #1)
- T10.5: fjernet `is_active = true`-filter fra audit_filter_values clients-special-case — alle direct-PII keys hashes uanset is_active for at undgå datalæk ved felt-deaktivering (Codex KRITISK-SIKKERHEDSHUL #2)
- T10.15: smoke-test for non-object fields-reject + audit-PII-hashing efter is_active=false (Codex MELLEM #3 + V2-supplement til #2)
- T10.4 ON CONFLICT: DEFER → G-nummer (greenfield-engangsmigration). **V6 OVERSKRIVER: ACCEPT** — fitness håndhæver, ON CONFLICT er nu obligatorisk i T10.4.

Hovedlinjer ift. tidligere fabrikerede V1-V3 (`claude/trin-10-plan-v2`-branchen):

- Plan baseret på CREATE TABLE fra bunden (ikke ALTER på droppet D5)
- Klienter i `core_identity` (ikke `public`)
- Klassifikation i `core_compliance.data_field_definitions` (ikke `public`)
- audit_filter_values omskrives med clients-special-case (jsonb-walking, alle direct-PII keys)
- is_permanent_allowed udvides med de to nye tabeller
- Logo-håndtering i separate RPC'er (forhindrer datatab via client_upsert)
- T9-supplement-policy uændret
- Grant-modellen seedes (ikke legacy role_page_permissions)
- T9-smoke-tests opdateres med clients-fixture FØR FK aktiveres

Klar til Codex plan-review-runde 14.
