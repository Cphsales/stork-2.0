# T9 — Plan V1

**Pakke:** §4 trin 9 — Identitet del 2 (organisations-træet + permission-fundament + fortrydelses-mekanisme + import fra 1.0)
**Krav-dok:** `docs/coordination/T9-krav-og-data.md` (merged 2026-05-17 i kommit `15ff4ee`)
**Plan-version:** V1
**Dato:** 2026-05-17
**Disciplin-baseline:** Modsigelses-disciplin + Codex-opgraderings-rolle aktiv fra commit `09d3afb` (2026-05-17).

---

## Formål

> Denne pakke leverer fundamentet for rettighedsstyring i Stork 2.0: organisations-træet (afdelinger + teams + medarbejder-placeringer), permission-elementerne (område → page → tab som data), rettighederne (rolle × element med kan_se/tilgå + kan_skrive + synlighed Sig selv/Hiraki/Alt), fortrydelses-mekanismen for alle ændringer med gældende dato, og import-flow fra 1.0 for træ + placeringer.
>
> Hvis fundet under review ikke bringer os tættere på dette: G-nummer, ikke blocker.

---

## Scope

**I scope:**

- Master-plan-paragraffer: §0.5 (migration-grundprincip), §1.7 (identitet og rettigheder), §1.11 (core_identity-schema), §3 CI-blockers (FK-coverage + tx-wrap)
- Krav-dok-funktioner (alle 9 funktions-grupper i krav-dok sektion 4): træ-operationer, medarbejder-placering, klient-til-team-tilknytning, rolle-tildeling, permission-element-CRUD, rettigheds-CRUD, fortrydelses-mekanisme, import-funktioner, synligheds-evaluering
- Krav-dok-mathias-afgørelser 1-32 (alle honoreret 1:1)
- Migration af eksisterende `core_identity.role_page_permissions` (trin 5) til ny tre-niveau-struktur
- Synligheds-helper-funktioner (Sig selv / Hiraki / Alt) bygget som genericc helpers — IKKE aktiveret på eksisterende forretningsdata-tabeller i T9 (forretningsdata-policies aktiveres pr. tabel når relevante trin 10+ bygger)
- Discovery + extract + upload-scripts for 1.0-import af organisations-træ + medarbejder-placeringer

**IKKE i scope:**

- Frontend-pages og admin-UI (lag F — krav-dok sektion 8)
- Klient-skabelon med felter (trin 10 — krav-dok sektion 8)
- Klient-til-team-import fra 1.0 (trin 10 — krav-dok pkt 25; T9 bygger kun strukturen `client_node_placements` uden client-FK)
- Lokations-skabelon (trin 10b)
- Sælger-attribution + identitets-master (trin 15)
- Subtree-RLS-policy-aktivering på forretningsdata-tabeller (kommer pr. tabel når trin 14+ bygger sales/calls/payroll)
- Microsoft Entra ID auth-implementation (orthogonalt; auth_user_id-kolonne eksisterer)
- Benchmark-test for subtree-policy med 1M sales (master-plan §3 — udskydes til trin 14)

---

## Strukturel beslutning

**Beslutning 1: Ét organisations-træ med node_type-felt (afdeling/team).**

Per krav-dok sektion 2 + pkt 28 (ét træ, ikke to). Tabellen `org_nodes` har self-refererende `parent_id` + `node_type ENUM ('department', 'team')`. Constraint: team-knuder kan ikke have børn (teams er løv-knuder for ejerskab; afdelinger kan have afdelinger + teams under). Vilkårligt antal niveauer (pkt 2 + krav-dok 3.1.2).

**Beslutning 2: Materialiseret closure-table for subtree-evaluering.**

Per master-plan rettelse 19 C1 + §1.7's princip "ingen rekursive CTE'er i RLS-policy-prædikater". Tabel `org_node_closure(ancestor_id, descendant_id, depth)` vedligeholdes af AFTER-trigger på `org_nodes`. Helpers læser closure direkte for Hiraki-evaluering.

**Beslutning 3: Versioneret placering (medarbejder + klient).**

Per krav-dok sektion 3.6 + master-plan §1.7. Tabeller `employee_node_placements` og `client_node_placements` med `effective_from` + `effective_to`. Partial UNIQUE `(<entity>_id) WHERE effective_to IS NULL` for "ét aktivt ad gangen". Knude-løs medarbejder = ingen åben placement-row (krav-dok 3.2.2 — gyldig tilstand). Skifte-RPC lukker gammel + åbner ny i én transaktion.

**Beslutning 4: Permission-elementer som tre separate tabeller med FK-kæde.**

Per krav-dok sektion 5.2 — tre niveauer (Område → Page → Tab). Tabellerne `permission_areas`, `permission_pages` (FK areas), `permission_tabs` (FK pages). Hvert niveau er CRUD-styret i UI uden deploy (krav-dok pkt 11 + 12). Page-implementation (React-komponent) er kode i lag F; registret er data. Three-tabel-tilgang foretrækkes over unified-hierarki-tabel fordi semantik er fast (tre niveauer, ikke vilkårligt antal) og FK-konstraints gør strukturen håndhævet på DB-niveau.

**Beslutning 5: Rettigheder samlet i én grants-tabel med element-niveau-diskriminering.**

`role_permission_grants(role_id, area_id, page_id, tab_id, can_access, can_write, visibility)` med CHECK at præcis én af `area_id` / `page_id` / `tab_id` er sat (NOT NULL). Visibility ENUM: `'self' | 'subtree' | 'all'` (mapper til krav-dok's Sig selv / Hiraki / Alt). Én tabel giver ensartet lookup-query for alle tre niveauer + simpler resolve-logik.

**Beslutning 6: Arve-logik via resolve-helper, ikke via materialiseret cache.**

Per krav-dok 5.2: "Hvis et niveau ikke er sat eksplicit, arves værdien fra niveauet over." Helper `permission_resolve(role_id, target_type, target_id) returns (can_access boolean, can_write boolean, visibility text)` walker fra mest specifikke (tab) til mindst specifikke (area). Materialiseret cache afvist fordi mængden er lille (få områder × få pages × få tabs × få roller) og resolve er trivielt billig — ingen behov for invalidering-kompleksitet.

**Beslutning 7: Fortrydelses-mekanisme via central `pending_changes`-tabel.**

Per krav-dok sektion 6. Tabel `pending_changes(id, change_type, target_id, payload jsonb, effective_from, requested_by, approved_at, approved_by, undo_deadline, applied_at, undone_at, status)`. Status-livscyklus: `pending → approved → applied | undone`. Cron evaluerer rows hvor `status='approved' AND undo_deadline <= now()` → flytter til `status='applied'` og kører apply-handler. Bruger kan kalde undo-RPC indtil `undo_deadline` overskredet. Generisk pattern dækker struktur-ændringer + medarbejder-flytninger + klient-flytninger uden type-specifik kode pr. ændringstype (handler-funktion er typedefineret pr. `change_type`, men container-tabellen er én).

**Beslutning 8: Synlighed evalueres i RPC-laget, ikke i tabel-RLS.**

Per krav-dok sektion 4.9 ("Når en page i frontend skal vise data, evalueres synligheden ud fra...") — synligheds-evaluering er RPC-niveau-ansvar, ikke tabel-niveau-RLS. T9 leverer helper-funktioner (`acl_subtree_employees`, `acl_subtree_org_nodes`, `permission_resolve`) som forretnings-RPC'er fra trin 10+ kalder for at filtrere data. T9-tabeller selv har simpel `using (true)` SELECT-policy (struktur-meta), undgår RLS-rekursion (lærdom fra første T9-runde V2-V3, jf. arkiv-mappe).

**Beslutning 9: is_active-flag erstatter sletning på permission-elementer + knuder.**

Per krav-dok 3.1 + pkt 6 + funktion "Deaktivér" (sektion 4.1, 4.5). Sletning bryder reference-integritet og historik; `is_active=false` signalerer "ikke tilgængelig for nye valg" mens row + audit-spor bevares.

**Beslutning 10: Tre-niveau permission-grants migreres fra eksisterende role_page_permissions i ét step.**

Per krav-dok 7.2. Eksisterende `core_identity.role_page_permissions` (page_key + tab_key + can_view + can_edit + scope + role_id) migreres til:

- `permission_areas`: genereres ud fra page*key-grupperinger (fx `anonymization*\*`→ område`anonymization`)
- `permission_pages`: én row pr. unik page_key
- `permission_tabs`: én row pr. (page_key, tab_key) hvor tab_key er ikke-NULL
- `role_permission_grants`: én row pr. eksisterende role_page_permissions-row, mappet til mest specifikke niveau (tab_id hvis tab_key ikke-NULL, ellers page_id). `scope`-værdier mappes: `'all'→'all'`, `'self'→'self'`, `'subtree'→'subtree'`, `'team'→'subtree'` (team-scope udgår per krav-dok 3.2.3 + pkt 14)

Eksisterende `role_page_permissions`-tabel **bevares** efter migration som read-only-fallback indtil trin 10+ skifter konsumere til ny model — derefter droppes den i særskilt pakke (G-nummer).

---

## Mathias' afgørelser (input til denne plan)

Alle 32 afgørelser fra krav-dok sektion 10 honoreres 1:1. Konkret mapping af de centrale:

| Krav-dok # | Afgørelse                                                               | Plan-element                                                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------- |
| 1          | Ejerskabs-kæde Cph Sales → afdelinger → teams → relationer              | `org_nodes.node_type` + parent_id-hierarki. CHECK: team kan ikke have børn                                                                                                        |
| 2          | Afdelinger ændres sjældent; historik bevares                            | Versionerede placements + audit-trigger på org_nodes                                                                                                                              |
| 3          | Team kan ophøre; medarbejdere bliver knude-løse                         | Step 5's `team_close`-RPC lukker alle åbne placements på teamet + sætter is_active=false; medarbejder-rows urørte                                                                 |
| 4          | Klient kan aldrig dræbe et team                                         | Ingen CASCADE fra clients til org_nodes; client_node_placements har ON DELETE RESTRICT mod node                                                                                   |
| 5          | Klient ejer sin egen data; følger klienten ved team-skift               | Konsekvens for trin 14+ (sales attribution via client_id, ikke team_id). Dokumenteres i bygge-status                                                                              |
| 6          | is_active-flag på knuder                                                | `org_nodes.is_active` + trigger blokerer nye placements på inactive node                                                                                                          |
| 7          | Én medarbejder på én knude ad gangen; også stab                         | Partial UNIQUE på `employee_node_placements (employee_id) WHERE effective_to IS NULL`; ingen stab-undtagelse                                                                      |
| 8          | Cross-team-adgang via rolle/synlighed                                   | Beslutning 8 — synlighed evalueres i RPC-laget via `permission_resolve` + `acl_subtree_employees`; ingen flerdoblede placements understøttes                                      |
| 9          | Ingen hardkodet horizon for migration                                   | Step 8 upload-script har `--from-date <date>` parameter; default = alt                                                                                                            |
| 10         | Teams/afdelinger anonymiseres ikke                                      | Klassifikations-registry-rækker for alle org_nodes-kolonner: `pii_level='none'`                                                                                                   |
| 11+12      | Permission-elementer er data i DB i tre niveauer                        | Beslutning 4 — tre tabeller (`permission_areas`/`pages`/`tabs`) med CRUD-RPC'er                                                                                                   |
| 13         | To akser pr. (rolle × element): kan_se/tilgå + kan_skrive, og synlighed | Beslutning 5 — `role_permission_grants` med `can_access`/`can_write`/`visibility` kolonner                                                                                        |
| 14         | Tre synligheds-værdier (Sig selv / Hiraki / Alt)                        | Visibility ENUM (`'self'                                                                                                                                                          | 'subtree' | 'all'`); migration mapper `'team' → 'subtree'` |
| 15         | Hiraki udledt af placering                                              | Helper `acl_subtree_employees(employee_id)` joiner placement → node → closure → descendants. Knude-løs + synlighed=subtree returnerer tom array (krav-dok 4.9 sidste afsnit)      |
| 16         | Synlighed pr. (rolle × element) — kan variere                           | grants-tabellen har en row pr. (rolle × niveau-id); samme rolle kan have forskellig visibility på forskellige elementer                                                           |
| 17+18      | Superadmin = synlighed=Alt på alt; Mathias + Kasper                     | Seed-migration sætter superadmin-rolle med `visibility='all'` på alle areas+pages+tabs. Eksisterende admin-rolle fra trin 5 omdøbes til superadmin-rolle hvis ikke allerede gjort |
| 19         | Klienter kun på team-knuder                                             | Trigger på `client_node_placements` BEFORE INSERT/UPDATE: verificér node_type='team'                                                                                              |
| 20         | Knude-løs er gyldig tilstand                                            | Ingen NOT NULL-constraint der kræver placement; ingen trigger der forhindrer "fjern placement"                                                                                    |
| 21         | Ingen stabs-team i 2.0                                                  | Ingen særlig node_type for stab; placeres på passende afdeling eller team                                                                                                         |
| 22+23      | Fortrydelses-mekanisme + konfigurerbar periode                          | Beslutning 7 — `pending_changes`-tabel + `undo_settings(change_type, undo_period)` UI-redigerbar konfig                                                                           |
| 24         | Import af træ + placeringer fra 1.0                                     | Step 8 — discovery + extract + upload-scripts                                                                                                                                     |
| 25         | Klient-til-team-import udskydes til trin 10                             | T9 bygger kun `client_node_placements`-strukturen uden client-FK + uden import-script                                                                                             |
| 26         | Alle navne på afdelinger/teams oprettes i UI                            | Migration seed kun root-knuden "Copenhagen Sales" + "Ejere"-afdelingen (for Mathias + Kasper, jf. pkt 18); andre knuder oprettes i UI                                             |
| 27         | Knude/element-styring via almindelig rettighed                          | RPC'er beskyttes af `has_permission('organisations-træ', 'manage', can_write=true)` osv. — ingen særlig admin-bypass                                                              |
| 28         | Ét træ; permission-elementer ikke et træ                                | Permission-elementer er tre separate tabeller med simple FK-kæder; ingen closure-table eller subtree-mekanik på dem                                                               |
| 29         | Tx-rollback default for DB-tests                                        | Alle DB-tests bruger `BEGIN; ... ROLLBACK;` per CI-blocker 20; fitness-check håndhæver                                                                                            |
| 30         | Plan-leverance er kontrakt                                              | Alle 9 funktions-grupper fra krav-dok sektion 4 leveres 1:1                                                                                                                       |
| 31         | Fire-dokument-disciplin obligatorisk                                    | Sektion "Fire-dokument-konsultation" nederst i denne plan                                                                                                                         |
| 32         | Oprydnings-strategi obligatorisk                                        | Sektion "Oprydnings- og opdaterings-strategi" nederst i denne plan                                                                                                                |

---

## Tekniske valg overladt til Code — argumentation

### Valg 1 — Konkrete tabel- og kolonne-navne

**Anbefaling:** Følg eksisterende konvention fra trin 1-7 (snake_case, plural for entity-tabeller, `_id` suffix for FKs, `is_active`-felt eksplicit, `effective_from`/`effective_to` for versionering konsistent med master-plan §1.7's `from_date`/`to_date`-pattern men semantisk klarere for fortrydelses-domænet).

**Tabeller (alle i `core_identity`-schema, jf. master-plan §1.11):**

- `org_nodes(id, name, parent_id, node_type, is_active, created_at, updated_at)`
- `org_node_closure(ancestor_id, descendant_id, depth)`
- `employee_node_placements(id, employee_id, node_id, effective_from, effective_to, created_at, updated_at)`
- `client_node_placements(id, client_id, node_id, effective_from, effective_to, created_at, updated_at)`
- `permission_areas(id, name, is_active, sort_order, created_at, updated_at)`
- `permission_pages(id, area_id, name, is_active, sort_order, created_at, updated_at)`
- `permission_tabs(id, page_id, name, is_active, sort_order, created_at, updated_at)`
- `role_permission_grants(id, role_id, area_id, page_id, tab_id, can_access, can_write, visibility, created_at, updated_at)`
- `pending_changes(id, change_type, target_id, payload, effective_from, requested_by, requested_at, approved_at, approved_by, undo_deadline, applied_at, undone_at, status, created_at, updated_at)`
- `undo_settings(change_type, undo_period_seconds, updated_at, updated_by)` — singleton-pattern uden id, change_type er PK

**Helpers (alle `language sql stable security invoker set search_path = ''`):**

- `acl_subtree_org_nodes(p_employee_id uuid) returns uuid[]` — org_node-IDs i caller's subtree
- `acl_subtree_employees(p_employee_id uuid) returns uuid[]` — employee-IDs med aktiv placement på node i caller's subtree
- `permission_resolve(p_role_id uuid, p_element_type text, p_element_id uuid) returns (can_access boolean, can_write boolean, visibility text)` — arve-aware lookup
- `can_user_see(p_employee_id uuid, p_target_id uuid, p_target_kind text) returns boolean` — composition over `permission_resolve` + `acl_subtree_employees` for konkret synligheds-check pr. row (kan bruges af forretnings-RPC'er fra trin 10+)

**RPC'er:**

- `org_node_upsert(p_id uuid, p_name text, p_parent_id uuid, p_node_type text, p_is_active boolean, p_effective_from date) returns uuid`
- `org_node_deactivate(p_node_id uuid, p_effective_from date) returns void`
- `team_close(p_node_id uuid, p_effective_from date) returns void` — lukker alle åbne placements + sætter is_active=false atomarisk
- `employee_place(p_employee_id uuid, p_node_id uuid, p_effective_from date) returns uuid` — opretter placement (lukker eventuel åben først hvis flyt)
- `employee_remove_from_node(p_employee_id uuid, p_effective_from date) returns void` — lukker åben placement uden ny
- `client_node_place(p_client_id uuid, p_node_id uuid, p_effective_from date) returns uuid` — kun hvis node_type='team'
- `client_node_close(p_client_id uuid, p_effective_from date) returns void`
- `permission_area_upsert(...)`, `permission_page_upsert(...)`, `permission_tab_upsert(...)`, samt deaktiveringer
- `role_permission_grant_set(p_role_id uuid, p_element_type text, p_element_id uuid, p_can_access boolean, p_can_write boolean, p_visibility text) returns uuid`
- `role_permission_grant_remove(p_role_id uuid, p_element_type text, p_element_id uuid) returns void`
- `pending_change_request(p_change_type text, p_target_id uuid, p_payload jsonb, p_effective_from date) returns uuid`
- `pending_change_approve(p_change_id uuid) returns void`
- `pending_change_undo(p_change_id uuid) returns void`
- `pending_change_apply(p_change_id uuid) returns void` — kaldes af cron eller manuelt
- `undo_setting_update(p_change_type text, p_undo_period_seconds integer) returns void`

**Eksisterende RPC'er fra trin 5 bevares uændret**: `employee_upsert`, `role_upsert`, `role_page_permission_upsert` (sidstnævnte vil dog blive deprecated til fordel for `role_permission_grant_set` i en senere pakke; T9 bevarer den for backward-compat).

### Valg 2 — Closure-table-vedligeholdelse på `org_nodes`

**Anbefaling:** Genberegn berørt subtree ved AFTER INSERT/UPDATE/DELETE på `org_nodes` (samme pattern som arkiveret V1-V3-plan's Valg 2). Org-mutationer er sjældne (krav-dok mathias-afgoerelser pkt 2 + master-plan §1.7); trigger-omkostning irrelevant. Tilføj `org_node_closure` til `AUDIT_EXEMPT_SNAPSHOT_TABLES`-allowlist i `scripts/fitness.mjs`.

**Cycle-detection:** BEFORE INSERT/UPDATE-trigger på `org_nodes.parent_id`. Begge triggers (cycle + closure) fyrer i samme transaktion per master-plan §1.7.

### Valg 3 — Audit-exempt-allowlist-udvidelse

**Anbefaling:** Tilføj `core_identity.org_node_closure` til eksisterende `AUDIT_EXEMPT_SNAPSHOT_TABLES`-liste med kommentar om at det er derived-from-parent (samme præcedens som arkiverede V1-V3's Valg 3). Audit-spor lever på `org_nodes` (parent-mutation); closure er kun derivativ.

**Kategori-udvidelse acknowledged:** Master-plan rettelse 23 etablerede allowlist for snapshot-tabeller som compute-byproducts. Closure er semantisk derived, ikke compute-byproduct af én aggregat-event. Anvendelse er kategori-udvidelse. **G-nummer-kandidat (lav):** master-plan rettelse for at formalisere derived-tables-kategori efter T9-merge (samme finding som arkiveret V2's Claude.ai finding 2).

### Valg 4 — Klient-FK før trin 10

**Anbefaling:** `client_node_placements.client_id` deklareres som `uuid not null` UDEN FK. Trin 10's klient-skabelon tilføjer FK via `ALTER TABLE ... ADD CONSTRAINT ... REFERENCES core_identity.clients(id) ON DELETE RESTRICT` (CASCADE forbudt per krav-dok 3.4.4 + pkt 4). T9-RPC `client_node_place` validerer UUID-format. CI-blocker 19 (FK-coverage): `client_id` på `FK_COVERAGE_EXEMPTIONS` med begrundelse "FK tilføjes i trin 10".

**Kategori-udvidelse acknowledged:** Allowlist var oprindeligt for _eksterne_ reference-ID'er. `client_id` her er intern FK der venter på cross-trin schema-evolution. **G-nummer-kandidat (lav):** formel pattern for "intern cross-trin FK"-undtagelse (samme finding som arkiveret V2's Claude.ai finding 3).

### Valg 5 — Permission-elementer som tre tabeller med element-niveau-CHECK i grants

**Anbefaling:** Beslutning 4 + 5 (tre separate tabeller + samlet grants-tabel). Alternative tilgange afvist:

- **Unified permission-elements-tabel** (én tabel med `element_type` + `parent_id`): semantik er fast tre niveauer, ikke vilkårligt antal. Unified-tabel skjuler hvilket niveau et element er på; queries kræver konstant `WHERE element_type=...`. Tre tabeller giver bedre type-sikkerhed via FK-konstraints og klarere DB-niveau-struktur.
- **Udvid eksisterende `role_page_permissions` med area_key**: bevarer page_key + tab_key som strings (ikke FK til normaliseret tabel). Konflikt med beslutning 4 om at områder/pages/tabs skal kunne oprettes/deaktiveres i UI uden deploy — det kræver normaliserede tabeller med faste IDs, ikke string-keys. Ny model er bedre.

### Valg 6 — Resolve-helper for arve-logik

**Anbefaling:** SQL-function `permission_resolve(role_id, element_type, element_id)` der ved tab → finder tab's grant → ellers page's grant → ellers area's grant → ellers `(can_access=false, can_write=false, visibility='self')` som default-deny-fallback.

**Alternativ afvist:** materialiseret cache med pre-computed full-resolve per (role × tab). Cache er dyrere at vedligeholde end resolve-funktion er at evaluere; arve-mængde er lille. KISS-princip.

### Valg 7 — Synligheds-helpers læser kun `using (true)`-tabeller

**Anbefaling:** Per beslutning 8 + lærdom fra arkiveret V1-V3-plan's V2-V3-fund. Helpers `acl_subtree_org_nodes` og `acl_subtree_employees` læser kun `org_node_closure`, `org_nodes`, `employee_node_placements` — alle med simpel `using (true)` SELECT-policy. Helpers læser IKKE `employees`-tabellen (som har subtree-aware policy fra senere pakker).

**RLS-rekursion-håndtering:** Strukturelle tabeller (closure, nodes, placements) er meta-data, ikke privat forretningsdata. Forretningsdata-scope (sales, calls, payroll) får policies pr. tabel fra trin 14+ ved at konsumere `permission_resolve` + `acl_subtree_*` via SECURITY INVOKER. Ingen RLS-selvreference fordi helpers ikke læser deres egne policy-target-tabeller.

### Valg 8 — Pending_changes som central tabel med change_type-diskriminering

**Anbefaling:** Beslutning 7. En tabel `pending_changes` dækker alle ændringstyper (struktur, placement, klient-tilknytning, rettighed). `change_type` ENUM diskriminerer; `payload` jsonb bærer typespecifikke detaljer. Apply-handler er én RPC der dispatcher på `change_type`.

**Alternativ afvist:** separat tabel pr. ændringstype. Det giver kode-duplikation for fortrydelses-livscyklus + cron-evaluering. Generisk pattern er bedre.

**Cron-eksekvering:** ny cron `pending_changes_apply_due` (kører hver minut) som flytter approved-rows til applied når `undo_deadline <= now()`. Cron-feilhåndtering via `cron_heartbeats` (etableret pattern fra trin 3).

**Synkron apply efter undo-deadline (alternativt):** trigger på SELECT eller mid-RPC. Afvist — for kompleks og fragil. Cron er enklere.

### Valg 9 — Migration discovery + extract + upload-scripts

**Anbefaling:** Hybrid (TypeScript runner + SQL queries) — samme pattern som trin 5's migration-scripts.

- `scripts/migration/t9-org-tree-discovery.{mjs,sql}` — scanner 1.0 for: dubletter af afdelinger/teams, hængende relationer, manglende koblinger, knude-løse medarbejdere
- `scripts/migration/t9-org-tree-extract.sql` — CSV/SQL-dump fra 1.0
- `scripts/migration/t9-org-tree-upload.mjs` — INSERT'er i 2.0 med `source_type='migration'` + `change_reason='legacy_import_t0'`; idempotent via UNIQUE-constraints
- `--from-date <YYYY-MM-DD>` parameter; default = alt (krav-dok pkt 9 + 24.3)

Discovery output: markdown-rapport i `migration-reports/` (gitignored). Mathias retter i 1.0 eller markerer manuelle ved import.

**Klient-til-team-import udskydes til trin 10** per krav-dok pkt 25 — T9 inkluderer ikke client-discovery/extract/upload-scripts.

### Valg 10 — Tests + fitness-checks

**Anbefaling:**

- DB-tests: smoke-tests i `supabase/tests/smoke/` med `BEGIN; ... ROLLBACK;`-wrap per CI-blocker 20. Authenticated-rolle-tests via `set local role authenticated` + `set local "request.jwt.claim.sub" = '<auth_user_id>'`
- Fitness-checks: `org_node_closure_consistency` (closure matcher tree); `permission_grant_integrity` (grants peger på existerende elementer + ikke-deaktiverede); `pending_changes_invariants` (status-livscyklus konsistent)
- Migration-gate Phase 2 strict: alle nye kolonner klassificeres i samme commit

**Subtree-RLS benchmark udskudt:** master-plan §3 specificerer 50×5×500-employees + 1M sales benchmark. T9 bygger helpers men aktiverer ingen subtree-policy på forretningsdata-tabeller (de bygges fra trin 14+). Benchmark følger med trin 14 (sales-stamme) hvor 1M-sales er realistisk substrat. T9 leverer kun fitness-check der verificerer helpers returnerer korrekt sæt på syntetisk fixture (uden timing-budget) — det er funktionel verifikation, ikke perf-benchmark.

**G-nummer-kandidat:** 1M-sales-benchmark som CI-blocker registreres i bygge-status action-items med deadline trin 14.

### Valg 11 — Konkret migration af eksisterende `role_page_permissions`

**Anbefaling:** Beslutning 10. Migration-fil bygger seed:

1. Generér areas baseret på page_key-prefix-grupperinger. Konkret mapping (begrundelse: gruppering matcher forretnings-domæner):
   - `anonymization`, `anonymization_mappings`, `anonymization_strategies` → område `anonymization`
   - `audit` → område `audit`
   - `break_glass`, `break_glass_operation_types` → område `break_glass`
   - `classification` → område `classification`
   - `employee_active_config`, `employees`, `roles` → område `identity`
   - `gdpr_responsible` → område `compliance`
   - `pay_periods` → område `operations`
   - `system` → område `system`
2. Generér pages: én row pr. unik page_key
3. Generér tabs: én row pr. (page_key, tab_key) hvor tab_key er ikke-NULL
4. For hver eksisterende `role_page_permissions`-row: opret tilsvarende `role_permission_grants`-row med:
   - element_type/element_id baseret på tab_key (tab hvis ikke-NULL, ellers page)
   - can_access = can_view, can_write = can_edit
   - visibility = scope, mappet `'team'→'subtree'`

Eksisterende `role_page_permissions`-tabel bevares som read-only (FORCE RLS + ingen UPDATE/INSERT-policies). Drop udskydes til separat pakke (G-nummer) for at sikre at trin 5-genererede konsumenter (smoke-tests, has_permission-helper) kan migreres trinvis.

**`has_permission()`-helper:** udvides til at læse fra `role_permission_grants` med fallback til `role_page_permissions` (read-only). Fallback fjernes når sidste konsument er migreret.

### Valg 12 — Seed for Mathias + Kasper

**Anbefaling:** Migration `t9_seed_owners.sql` opretter:

- Root-knude: `org_nodes(name='Copenhagen Sales', node_type='department', parent_id=NULL)`
- Ejere-afdeling: `org_nodes(name='Ejere', node_type='department', parent_id=<Cph Sales>)`
- `employee_node_placements` for mg@ og km@ (eksisterer fra trin 1 bootstrap) på Ejere-afdelingen
- Superadmin-rolle: hvis admin-rolle eksisterer (fra trin 1), omdøb til `superadmin`. Ellers opret ny.
- `role_permission_grants` for superadmin med `visibility='all'` på alle areas + pages + tabs (seedede fra migration af role_page_permissions)

Andre knuder (afdelinger, teams) oprettes i UI per krav-dok pkt 26.

---

## Implementations-rækkefølge

**Dependency-chain (lineær):**

- Step 1 (`org_nodes` + cycle-detect) → ingen deps
- Step 2 (`org_node_closure` + maintain-trigger) → deps Step 1
- Step 3 (`employee_node_placements` + skifte-RPC) → deps Step 1 + eksisterende `employees`
- Step 4 (`client_node_placements` UDEN client-FK + RPC) → deps Step 1
- Step 5 (permission-elementer: areas/pages/tabs + CRUD-RPCs) → ingen deps på tidligere T9-tabeller
- Step 6 (`role_permission_grants` + resolve-helper + acl-helpers + team_close-RPC) → deps Steps 2+3+5
- Step 7 (`pending_changes` + apply-cron + undo-mekanisme + `undo_settings`) → ingen deps på T9-tabeller; bygger på trin 3's cron-skabelon
- Step 8 (migration discovery + extract + upload-scripts for 1.0) → uafhængig
- Step 9 (migration af eksisterende `role_page_permissions` → ny model) → deps Steps 5+6
- Step 10 (seed Mathias+Kasper + Copenhagen Sales-knude + superadmin-grants) → deps Steps 1+3+5+6+9
- Step 11 (klassifikation af T9-kolonner) → deps alle DB-steps
- Step 12 (dokumentations-opdateringer + cleanup) → sidste step

### Step 1 — org_nodes + cycle-detection + RLS + audit + tests

- **Migration-fil:** `20260518000000_t9_org_nodes.sql`
- **Hvad:** Tabel `core_identity.org_nodes(id, name, parent_id, node_type, is_active, created_at, updated_at)`; `node_type` ENUM `('department', 'team')`; selv-refererende FK; BEFORE-trigger for cycle-detection (rekursiv CTE); BEFORE-trigger der blokerer team-knude med børn; FORCE RLS; SELECT `using (true)`; INSERT/UPDATE/DELETE via RPC; audit-trigger; RPC `org_node_upsert` + `org_node_deactivate`
- **Hvorfor først:** alle senere T9-tabeller har FK eller relation til org_nodes
- **Risiko:** lav (cycle-detection er standard; team-har-børn-check er CHECK-tilsvarende)
- **Rollback:** revert migration; pre-cutover ingen rows
- **Tests (`supabase/tests/smoke/t9_org_nodes.sql`):**
  - Smoke: opret root + afdeling + team + verificér tree-struktur
  - Cycle-detect: forsøg UPDATE der ville lave cycle → blokeret
  - Team-har-børn-blokering: opret team, forsøg INSERT child → blokeret
  - is_active=false-blokering: nye INSERT'er med parent_id pegende på inactive node → blokeret
  - Audit: `org_node_upsert` producerer audit_log-row

### Step 2 — org_node_closure + maintain-trigger + audit-exempt-allowlist

- **Migration-fil:** `20260518000001_t9_org_node_closure.sql`
- **Hvad:** Tabel `core_identity.org_node_closure(ancestor_id, descendant_id, depth)` PK(ancestor_id, descendant_id) + INDEX(descendant_id); AFTER-trigger der genberegner berørt subtree (Valg 2); FORCE RLS + `using (true)`; tilføj closure til `AUDIT_EXEMPT_SNAPSHOT_TABLES` i `scripts/fitness.mjs`
- **Hvorfor:** kræver Step 1
- **Risiko:** mellem — trigger-korrekthed kritisk. Mitigation: dedikeret consistency-check (Step 11) + tests
- **Rollback:** revert migration + fitness.mjs ændring
- **Tests:**
  - Smoke: bygge 3-niveau-træ; verificér closure har korrekt rows (sum inkl. self)
  - Mutations-konsistens: INSERT/UPDATE/DELETE org_nodes → closure-rebuild korrekt
  - **NB:** helper-tests (`acl_subtree_*`) ligger i Step 6 hvor de oprettes

### Step 3 — employee_node_placements + skifte-RPC + tests

- **Migration-fil:** `20260518000002_t9_employee_node_placements.sql`
- **Hvad:** Tabel `core_identity.employee_node_placements(id, employee_id, node_id, effective_from, effective_to, created_at, updated_at)`; FK til employees + org_nodes; partial UNIQUE `(employee_id) WHERE effective_to IS NULL`; EXCLUDE constraint `(employee_id WITH =, daterange(effective_from, coalesce(effective_to, 'infinity'::date)) WITH &&)` (kræver btree_gist); FORCE RLS; SELECT `using (true)`; INSERT/UPDATE via RPC; audit-trigger; RPC'er `employee_place` (lukker eventuel åben + åbner ny i tx) + `employee_remove_from_node` (lukker uden ny)
- **Hvorfor:** kræver org_nodes + employees
- **Risiko:** mellem — EXCLUDE-constraint via btree_gist; skifte-RPC atomicity
- **Rollback:** revert migration (pre-cutover ingen rows)
- **Tests:**
  - Smoke: placér; flyt; verificér gammel lukket + ny åben
  - Overlap-blokering: forsøg overlappende placements → blokeret af EXCLUDE
  - Knude-løs gyldig: `employee_remove_from_node` lukker uden ny placement → employee_id har ingen aktiv placement (effective_to IS NULL gælder ikke for nogen row)
  - Audit-trigger fyrer ved INSERT/UPDATE/DELETE

### Step 4 — client_node_placements (uden client-FK) + skifte-RPC + tests

- **Migration-fil:** `20260518000003_t9_client_node_placements.sql`
- **Hvad:** Tabel `core_identity.client_node_placements(id, client_id, node_id, effective_from, effective_to, created_at, updated_at)`; `client_id uuid not null` UDEN FK (jf. Valg 4); FK til org_nodes; partial UNIQUE + EXCLUDE som Step 3; trigger der validerer `node_type='team'` på node_id; FORCE RLS; SELECT `using (is_admin())` pre-cutover; INSERT/UPDATE via RPC; audit-trigger; RPC'er `client_node_place` + `client_node_close`. client_id på `FK_COVERAGE_EXEMPTIONS` allowlist
- **Hvorfor:** kræver org_nodes
- **Risiko:** lav (ingen client-FK; pre-cutover ingen rows)
- **Rollback:** revert migration + fitness.mjs ændring
- **Tests:** smoke med syntetisk client_id-uuid; overlap-blokering; node_type='team'-check (insert mod afdeling → blokeret)

### Step 5 — Permission-elementer (areas/pages/tabs) + CRUD-RPCs

- **Migration-fil:** `20260518000004_t9_permission_elements.sql`
- **Hvad:** Tre tabeller `permission_areas` / `permission_pages` (FK areas) / `permission_tabs` (FK pages); FORCE RLS; SELECT `using (true)`; INSERT/UPDATE/DELETE via RPC; audit-trigger; RPC'er per Valg 1
- **Hvorfor:** uafhængig af tidligere T9-tabeller; placeres her for at gøre Step 6 muligt
- **Risiko:** lav
- **Rollback:** revert migration
- **Tests:**
  - Smoke: opret område → page → tab → verificér FK-kæde
  - is_active=false-blokering: tab kan ikke pege på inactive page (trigger)
  - Audit-spor

### Step 6 — role_permission_grants + resolve-helper + acl-helpers + team_close-RPC

- **Migration-fil:** `20260518000005_t9_grants_and_helpers.sql`
- **Hvad:**
  - Tabel `core_identity.role_permission_grants(id, role_id, area_id, page_id, tab_id, can_access, can_write, visibility, ...)`; CHECK at præcis én af area_id/page_id/tab_id er sat; FK til roles + area/page/tab; FORCE RLS; SELECT `using (true)`; INSERT/UPDATE via RPC; audit-trigger
  - Helpers `acl_subtree_org_nodes`, `acl_subtree_employees`, `permission_resolve`, `can_user_see` (alle `language sql stable security invoker set search_path = ''`)
  - RPC'er `role_permission_grant_set`, `role_permission_grant_remove`
  - RPC `team_close(p_node_id, p_effective_from)` — verificér node_type='team' + is_active=true; sætter is_active=false; lukker alle åbne `employee_node_placements` for node_id; lukker alle åbne `client_node_placements` for node_id; alt i én transaktion
- **Hvorfor:** kræver Steps 2 (closure) + 3 (placements) + 5 (elements); helpers og team_close samles her for at sikre lineær dependency-chain
- **Risiko:** mellem — helper-korrekthed kritisk; team_close atomicity
- **Rollback:** revert migration
- **Tests (`supabase/tests/smoke/t9_grants_and_helpers.sql`, tx-rollback per CI-blocker 20):**
  - Fixture (alle tests bruger `set local role authenticated` + `request.jwt.claim.sub`):
    - 3 org_nodes: root (Cph Sales), afdeling FM under root, team FM-A under FM
    - 3 employees: E-root-mgr placeret på root; E-fm-mgr på FM; E-tm på FM-A
    - 3 permission_areas: 'identity', 'operations', 'audit'
    - 2 roles: 'fm_chef' og 'tm_saelger' med grants per krav-dok eksempler
  - `acl_subtree_org_nodes(E-root-mgr)` → [root, FM, FM-A]
  - `acl_subtree_org_nodes(E-fm-mgr)` → [FM, FM-A]
  - `acl_subtree_org_nodes(E-tm)` → [FM-A]
  - `acl_subtree_employees(E-root-mgr)` → [E-root-mgr, E-fm-mgr, E-tm]
  - `acl_subtree_org_nodes(E-team-less)` → tom array (knude-løs)
  - `permission_resolve(fm_chef, 'page', operations_page_id)`: hvis grant på page-niveau → returnér page-værdier; hvis kun area-grant → returnér arvede area-værdier; ellers default-deny
  - Arve-test: tab uden grant arver fra page; page uden grant arver fra area
  - `team_close(FM-A)`: FM-A.is_active=false; E-tm's placement lukkes; verificér atomicity via failure-test
  - Visibility-mapping: gammel scope='team' migration → grants-row med visibility='subtree' (verificeret i Step 9)

### Step 7 — pending_changes + apply-cron + undo_settings

- **Migration-fil:** `20260518000006_t9_pending_changes.sql`
- **Hvad:**
  - Tabel `pending_changes` med status-CHECK + change_type ENUM (initial værdier: `'org_node_upsert'`, `'org_node_deactivate'`, `'employee_place'`, `'employee_remove'`, `'client_place'`, `'client_close'`, `'permission_grant_set'`); FORCE RLS; SELECT `using (is_admin() OR requested_by = current_employee_id())`; INSERT via RPC; audit-trigger
  - Tabel `undo_settings(change_type, undo_period_seconds, updated_at, updated_by)`; default-rows seedet med `undo_period_seconds=86400` (24h) for alle change_types
  - RPC'er `pending_change_request`, `pending_change_approve`, `pending_change_undo`, `pending_change_apply` (apply dispatcher dispatcher på change_type til konkrete handlers)
  - Cron `pending_changes_apply_due` (kører hver minut via pg_cron) som flytter approved-rows til applied når `undo_deadline <= now()`
  - Heartbeat-integration per trin 3's `cron_heartbeats`-pattern
- **Hvorfor:** Step 7 placeres her fordi apply-dispatcher SKAL kende alle ændrings-typer den dispatcher til; alle RPC'er fra Steps 1+3+4+5+6 er nu defineret
- **Risiko:** mellem — apply-dispatcher kan dispatche til buggy handler. Mitigation: hver handler er gennemtestet + apply er idempotent (re-apply af samme row er no-op)
- **Rollback:** revert migration; pause cron via SUPABASE_CRON_PAUSE_LIST manuel handling
- **Tests:**
  - Smoke: request → approve → vent til undo_deadline → cron applies; verificér state-ændring
  - Undo: request → approve → undo før deadline; verificér state ikke ændret (eller ruller tilbage hvis allerede applied — applied undo er bonus-scope, evt. G-nummer)
  - Konfig: `undo_setting_update` ændrer undo_period; nye changes bruger ny periode

### Step 8 — Migration discovery + extract + upload-scripts for 1.0

- **Filer:** `scripts/migration/t9-org-tree-discovery.{mjs,sql}`, `scripts/migration/t9-org-tree-extract.sql`, `scripts/migration/t9-org-tree-upload.mjs`
- **Hvad:** Per Valg 9. Discovery genererer markdown-rapport. Extract laver CSV/SQL-dump. Upload INSERT'er i 2.0 med `source_type='migration'`
- **Hvorfor:** uafhængig af DB-state; placeres her for at samle alle DB-tabeller før migration-scripts skrives
- **Risiko:** lav (manuel eksekvering)
- **Rollback:** slet scripts
- **Tests:** scripts har `--dry-run` mode; Mathias eksekverer manuelt mod 1.0 når relevant

### Step 9 — Migration af eksisterende role_page_permissions

- **Migration-fil:** `20260518000007_t9_migrate_role_page_permissions.sql`
- **Hvad:** Per Valg 11. Seed areas + pages + tabs + grants baseret på eksisterende `role_page_permissions`-rows. Eksisterende tabel bevares som read-only (FORCE RLS, ingen INSERT/UPDATE-policies). `has_permission()`-helper opdateres til at læse fra `role_permission_grants` med fallback til `role_page_permissions`
- **Hvorfor:** kræver Step 5 (elements) + Step 6 (grants)
- **Risiko:** mellem — kan bryde eksisterende permission-tjek hvis migration er ufuldstændig. Mitigation: `m1_permission_matrix.sql`-smoke-test udvides til at verificere alle eksisterende RPC'er stadig kan permissions-checke via ny helper
- **Rollback:** revert migration; fallback-pattern i `has_permission()` ruller læsning tilbage til gammel tabel
- **Tests:**
  - Migration-idempotens: re-run uden duplikater
  - Mapping: alle 33 eksisterende role_page_permissions-rows er mappet til grants
  - `has_permission()` returnerer identisk resultat for alle eksisterende (role, page, tab)-kombinationer

### Step 10 — Seed Cph Sales + Ejere + Mathias/Kasper + superadmin-grants

- **Migration-fil:** `20260518000008_t9_seed_owners.sql`
- **Hvad:** Per Valg 12. Bootstrap-INSERT'er for root-knude, Ejere-afdeling, placement af mg@ + km@ på Ejere, superadmin-rolle (omdøb fra admin hvis eksisterer), grants med `visibility='all'` på alle areas+pages+tabs
- **Hvorfor:** kræver alle tidligere DB-steps
- **Risiko:** lav (seed; pre-cutover)
- **Rollback:** revert migration
- **Tests:** smoke verificerer Mathias kan querie alt data via superadmin-rolle

### Step 11 — Klassifikation af T9-kolonner + fitness-checks

- **Migration-fil:** `20260518000009_t9_classify.sql`
- **Filer:** `scripts/fitness.mjs` (udvidet)
- **Hvad:**
  - INSERT'er i `core_compliance.data_field_definitions` for alle nye T9-kolonner; kategori='operationel' eller 'master_data'; pii_level='none' (jf. krav-dok pkt 10)
  - Nye fitness-checks: `org_node_closure_consistency`, `permission_grant_integrity`, `pending_changes_invariants`
- **Hvorfor:** CI-blocker 2 (klassifikations-coverage) + verifikation af invarianter
- **Risiko:** lav
- **Rollback:** revert migration + fitness.mjs ændring
- **Tests:** migration-gate kører i CI; fitness verificerer 0 unklassificerede + invariants

### Step 12 — Dokumentations-opdateringer + cleanup

- **Filer:** `docs/strategi/bygge-status.md`, `docs/teknisk/permission-matrix.md`, `docs/teknisk/teknisk-gaeld.md`, `docs/coordination/aktiv-plan.md`, `docs/coordination/seneste-rapport.md`
- **Hvad:**
  - bygge-status: trin 9 → ✓ Godkendt; PAUSET-status fjernes; 1M-sales-benchmark-action-item tilføjet (deadline trin 14)
  - permission-matrix: omskrives til den nye tre-niveau-model; auto-generated-marker opdateret
  - teknisk-gaeld: G-numre fra Codex-runder + G-nummer-kandidater for rettelse 23 + CI-blocker 19 kategori-udvidelser
  - aktiv-plan: ryd til "ingen aktiv plan" + tilføj T9 til Historisk
  - seneste-rapport: peg på T9-slut-rapport
  - Arkivér krav-dok + plan + plan-feedback til `docs/coordination/arkiv/`
- **Hvorfor:** sidste step; per disciplin-pakke 2026-05-16
- **Risiko:** lav (dokumenter)
- **Rollback:** revert commits

---

## Test-konsekvens

Nye eller ændrede tests:

- `supabase/tests/smoke/t9_org_nodes.sql` — cycle-detect, team-har-børn-blokering, is_active-blokering, audit. Grøn
- `supabase/tests/smoke/t9_org_node_closure.sql` — closure-konsistens efter mutations. Tx-rollback. Grøn
- `supabase/tests/smoke/t9_employee_node_placements.sql` — placering, flyt, knude-løs, EXCLUDE-overlap-blokering, authenticated-rolle-tests. Tx-rollback. Grøn
- `supabase/tests/smoke/t9_client_node_placements.sql` — uden client FK; node_type='team'-check; overlap. Tx-rollback. Grøn
- `supabase/tests/smoke/t9_permission_elements.sql` — areas/pages/tabs CRUD; FK-kæde; is_active-blokering. Grøn
- `supabase/tests/smoke/t9_grants_and_helpers.sql` (ny) — alle helpers + permission_resolve + arve-logik + team_close-atomicity, authenticated-rolle-tests. Tx-rollback. Grøn
- `supabase/tests/smoke/t9_pending_changes.sql` (ny) — fortrydelses-livscyklus; cron-apply; undo. Tx-rollback. Grøn
- `supabase/tests/smoke/t9_migration_role_page_permissions.sql` (ny) — migration mapper alle eksisterende rows; `has_permission()` returnerer identisk resultat før/efter
- `supabase/tests/smoke/m1_permission_matrix.sql` (eksisterende, opdateres) — verificerer alle 33 eksisterende RPC'er stadig permissions-checker korrekt via ny model

Fitness-checks:

- `org_node_closure_consistency` (ny) — closure matcher tree
- `permission_grant_integrity` (ny) — grants peger på existerende + ikke-deaktiverede elementer
- `pending_changes_invariants` (ny) — status-livscyklus konsistent (approved før applied; applied har applied_at; undone har undone_at; undo_deadline > approved_at)
- `db-test-tx-wrap-on-immutable-insert` (eksisterende) — verificeret for nye tests
- `audit-trigger-coverage` (eksisterende) — verificerer closure på allowlist; alle andre T9-tabeller har trigger
- `fk-coverage` (eksisterende, CI-blocker 19) — verificerer `client_id` på allowlist med begrundelse

---

## Risiko + kompensation

| Migration / Step         | Værste-case                                                        | Sandsynlighed | Rollback                                                                      |
| ------------------------ | ------------------------------------------------------------------ | ------------- | ----------------------------------------------------------------------------- |
| Step 1 org_nodes         | Cycle-detect-trigger har bug; producerer falsk-negativ             | lav           | revert migration; pre-cutover ingen rows                                      |
| Step 2 closure           | Maintain-trigger rebuild forkert; helpers får forkert data         | mellem        | revert + fitness-consistency-check fanger inden cutover                       |
| Step 3 placements        | EXCLUDE-constraint accepterer overlap (btree_gist-fejl)            | lav           | revert; manuel cleanup (pre-cutover tomt)                                     |
| Step 4 client_placements | client_id uden FK accepterer invalid uuid                          | lav           | trin 10 FK-add fanger ved ALTER; pre-cutover ingen rows                       |
| Step 5 elements          | FK-kæde brudt; tabs uden valid page                                | lav           | revert; pre-cutover ingen seedet data                                         |
| Step 6 grants + helpers  | acl_subtree_employees returnerer forkert sæt                       | mellem        | revert; authenticated-rolle-fixture-tests fanger inden cutover                |
| Step 6 team_close        | Lukker placements ikke atomisk; halv-tilstand                      | mellem        | revert; SQL-tests bekræfter rollback ved failure                              |
| Step 7 pending_changes   | Apply-dispatcher dispatcher til buggy handler                      | mellem        | hver handler test'es separat; apply er idempotent (re-run no-op)              |
| Step 7 cron              | Cron pauser eller fejler; ændringer hænger i 'approved'            | lav           | manuel apply-RPC; heartbeat-fitness fanger cron-failure                       |
| Step 9 migration         | Eksisterende permission-tjek brudt efter migration                 | mellem        | fallback i `has_permission()` til gammel tabel; m1-smoke-test fanger inden CI |
| Step 10 seed             | Eksisterende admin-rolle ikke korrekt omdøbt; floor-trigger bryder | mellem        | revert seed; trin-1-bootstrap er uberørt                                      |
| Step 11 classify         | Migration-gate fejler på manglende kolonner                        | lav           | tilføj manglende entries i samme commit                                       |

**Kompensation generelt:**

- Cluster-commits gør rollback mulig per-step
- Pre-cutover: ingen produktions-data tabes
- Build-PR mod main: hvis CI fejler → fix på branch; main berøres ikke før merge
- Worst-case: revert hele PR; T9 udskydes; trin 10 forbliver klar (afhænger ikke direkte af T9 — master-plan §1.7 er kilden)

---

## Oprydnings- og opdaterings-strategi

**Filer der skal flyttes til arkiv** (efter pakken er merget):

- `docs/coordination/T9-krav-og-data.md` → `docs/coordination/arkiv/T9-krav-og-data.md`
- `docs/coordination/T9-plan.md` → `docs/coordination/arkiv/T9-plan.md`
- Alle `docs/coordination/plan-feedback/T9-*.md` → `docs/coordination/arkiv/` (V<n>-codex, V<n>-claude-ai, approved-\*, blokeret hvis nogen)

**Filer der skal slettes:** ingen.

**Dokumenter der skal opdateres** (som DEL af build, ikke separat trin):

- `docs/coordination/aktiv-plan.md` → ryd til "ingen aktiv plan"; tilføj T9 til Historisk med commit-range
- `docs/coordination/seneste-rapport.md` → peg på `docs/coordination/rapport-historik/<dato>-t9.md`
- `docs/strategi/bygge-status.md` → trin 9 → ✓ Godkendt med commit-hash + dato; PAUSET-status fjernes; 1M-sales-benchmark-action-item tilføjet (deadline trin 14); klassifikations-tal opdateret efter T9-kolonner
- `docs/teknisk/permission-matrix.md` → omskrives til ny tre-niveau-model (areas/pages/tabs/grants); auto-genereret-marker opdateret til 2026-05-XX-introspection
- `docs/teknisk/teknisk-gaeld.md` → tilføj G-nummer-kandidater fra Valg 3 (rettelse 23-udvidelse) + Valg 4 (allowlist-kategori); tilføj G-nummer for `role_page_permissions`-drop i senere pakke; tilføj G-nummer for full undo-mekanisme (hvis applied-undo afvises i T9-scope)
- `docs/coordination/mathias-afgoerelser.md` → ingen ny entry forventet (T9 implementerer eksisterende rammebeslutninger). Hvis benchmark-fund eller andet kræver ny afgørelse: ny entry med G-nummer som plan-reference

**Reference-konsekvenser** (ingen omdøbninger/flytninger i T9):

- Ingen filer omdøbes eller flyttes (ud over arkivering af arbejds-artefakter)
- Grep-tjek post-pakke:
  - `grep -r "T9-krav-og-data\|T9-plan" docs/` returnerer kun arkiv + rapport-historik + slut-rapporten selv
  - `grep -r "PAUSET" docs/strategi/bygge-status.md` returnerer 0 hits
  - `grep -r "role_page_permissions" supabase/` returnerer kun (a) fallback-reference i `has_permission()`, (b) m1-smoke-test, (c) migration-fil. Nye konsumenter bruger `role_permission_grants`

**Ansvar:** Code udfører oprydning + opdatering som del af build-PR (Step 12 i implementations-rækkefølgen), ikke som separat trin. Slut-rapporten verificerer udførelse i "Oprydning + opdatering udført"-sektion. Manglende udførelse = KRITISK feedback fra reviewere (per krav-dok 12.3).

---

## Konsistens-tjek

- **Disciplin-pakke:** Plan honorerer formåls-immutabilitet (krav-dok-formålet er låst); leverer alle 9 funktions-grupper fra krav-dok sektion 4 1:1; følger plan-leverance-er-kontrakt (alle 12 valg adresseret); følger destructive-drops-disciplin (ingen DROPs i T9; gammel `role_page_permissions` bevares read-only); følger fire-dokument-disciplin (sektion nedenfor); følger modsigelses-disciplin (intern modsigelses-tjek: krav-dok-pkt 28 om "ét træ" konsistent med plan; ingen scope-creep observeret); følger Codex-opgraderings-rolle-anerkendelse (denne plan inviterer eksplicit OPGRADERING-forslag fra Codex på Valg 1-12)

---

## Fire-dokument-konsultation

**Obligatorisk sektion** per krav-dok 11 + arbejds-disciplin.md "Fire autoritative forretnings-dokumenter".

| Dokument                                   | Konsulteret | Relevante referencer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Konflikt med plan? |
| ------------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `docs/strategi/vision-og-principper.md`    | ja          | Princip 1 (data-kontrol i UI — permission-elementer + grants er data); Princip 2 (rettigheder i UI; superadmin eneste hardkodede — implementeret via seed Step 10); Princip 3 (forretningslogik som data — permission-elementer + arve-logik som data); Princip 6 (audit på alt der ændrer data — audit-trigger på alle T9-tabeller; closure exempt via allowlist); Princip 8 (identitet eksisterer én gang — employees fra trin 1 er anker; ingen parallelle person-tabeller); Princip 9 (status-modeller bevarer historik — versionerede placements + pending_changes-livscyklus; ingen sletning af knuder/elementer, kun is_active=false)                                                                                                                | nej                |
| `docs/strategi/stork-2-0-master-plan.md`   | ja          | §0.5 (migration-grundprincip — discovery+extract+upload uden ETL); §1.1 (SECURITY INVOKER for helpers; FORCE RLS pr. tabel); §1.7 (identitet og rettigheder — implementeres som krav-dok specificerer, med præcisering at synlighed evalueres i RPC-laget jf. afdæknings-session 2026-05-17); §1.11 (core_identity-schema for alle T9-tabeller); §3 CI-blocker 19 (FK-coverage; client_id på allowlist), CI-blocker 20 (tx-wrap; tests bruger BEGIN/ROLLBACK); §4 trin 9; Rettelse 19 C1 (closure-table over rekursiv CTE); Rettelse 20 (migration-strategi); Rettelse 23 (AUDIT_EXEMPT_SNAPSHOT_TABLES kategori-udvidelse for closure-table — flagget under Valg 3 + G-nummer-kandidat)                                                                    | nej                |
| `docs/coordination/mathias-afgoerelser.md` | ja          | 2026-05-11 (vision-låsning + superadmin); 2026-05-15 (plan-leverance som kontrakt; trin 9 pause — forudsætninger nu opfyldt); 2026-05-16 (9-punkts forretningssandhed — alle mappet til konkrete plan-elementer; tx-rollback default; oprydnings-disciplin; fire-dokument-disciplin; CLI-automation-niveau); **2026-05-17 (afdæknings-session med 15 nye ramme-afgørelser — ét træ, permission-elementer i 3 niveauer som DATA, synlighed 3 værdier, Hiraki udledt af placering, knude-løs som gyldig tilstand, ingen stabs-team, cross-team via rolle, superadmin=Alt, fortrydelses-mekanisme, klient-til-team-import udskudt til trin 10)**; 2026-05-17 (flow-ændringer: Modsigelses-disciplin + Codex-opgraderings-rolle — denne plan respekterer begge) | nej                |
| `docs/coordination/T9-krav-og-data.md`     | ja          | Sektion 1 (pakkens formål — leveret 1:1); sektion 2 (rygsøjlen ét træ — Beslutning 1); sektion 3 (alle 8 forretningssandheder LÅSTE — afgørelses-mapping ovenfor); sektion 4 (alle 9 funktions-grupper — leveret via Steps 1-12); sektion 5 (permission-modellen to akser + tre niveauer — Beslutning 4+5+6); sektion 6 (historik + fortrydelse — Beslutning 7 + Step 7); sektion 7.2 (eksisterende permission-tabel migreres — Beslutning 10 + Step 9); sektion 8 (IKKE i scope — alle bekræftet udeladt); sektion 9 (tekniske valg overladt — alle 12 adresseret); sektion 10 (Mathias-afgørelser 1-32 — alle mappet 1:1)                                                                                                                                 | nej                |

**Regel-overholdelse:**

- Ingen "nej" i konsulteret-kolonnen ✓
- Ingen "hele filen" som referencer-værdi for de tre rammeniveau-dokumenter ✓
- Ingen konflikter rapporteret ✓ — planen er konsistent med ramme + krav-dok
- Modsigelses-disciplin (2026-05-17): ingen intern modsigelse i krav-dok observeret; ingen modsigelse mellem plan og ramme. Hvis Codex eller Claude.ai spotter modsigelse: planen er åbnings-blokeret per ny disciplin (KRITISK feedback i runde 1)
- Codex-opgraderings-rolle (2026-05-17): planen inviterer eksplicit OPGRADERING-forslag fra Codex på Valg 1-12. Code er forpligtet til at adressere hvert OPGRADERING-forslag i V<n+1>'s "Opgraderings-håndtering"-sektion (AFVIS med teknisk begrundelse, ELLER IMPLEMENTER)

---

## Konklusion

Planen leverer T9-formålet med acceptabel risiko:

- Alle 9 funktions-grupper fra krav-dok sektion 4 dækket med konkret implementations-vej (Steps 1-12)
- Alle 12 tekniske valg har eksplicit anbefaling + begrundelse + alternativ-argumentation
- Alle 32 Mathias-afgørelser fra krav-dok sektion 10 mappet til konkrete plan-elementer
- Alle fire forretnings-dokumenter konsulteret med konkrete referencer (princip-numre, paragraf-numre, datoer, sektion-referencer)
- RLS-rekursion undgået via beslutning 8 (synlighed i RPC-lag, ikke tabel-RLS) — lærdom fra arkiveret V1-V3-runde
- Modsigelses-disciplin respekteret: ingen modsigelser identificeret; krav-dok og ramme er konsistente
- Codex-opgraderings-rolle anerkendt: OPGRADERING-forslag på Valg 1-12 håndteres i V<n+1>'s "Opgraderings-håndtering"-sektion
- Oprydnings-strategi er obligatorisk og dokumenteret som DEL af build

Klar til Codex-review V1 (kode-validering + opgraderings-forslag) + Claude.ai-review V1 (forretnings-dokument-konsistens) parallelt.
