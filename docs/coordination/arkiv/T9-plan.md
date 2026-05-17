# T9 — Plan V6

**Pakke:** §4 trin 9 — Identitet del 2 (organisations-træet + permission-fundament + fortrydelses-mekanisme + import fra 1.0)
**Krav-dok:** `docs/coordination/T9-krav-og-data.md` (merged 2026-05-17 i kommit `15ff4ee`)
**Plan-version:** V6
**Dato:** 2026-05-17
**Disciplin-baseline:** Modsigelses-disciplin + Codex-opgraderings-rolle aktiv fra commit `09d3afb` (2026-05-17).

**Revision V6 (denne version):** V6 adresserer 1 KRITISK fund fra Codex V5 (`docs/coordination/plan-feedback/T9-V5-codex.md`, commit `810e424`) + 3 KOSMETISKE observationer fra Claude.ai V5-approval (`docs/coordination/plan-feedback/T9-V5-approved-claude-ai.md`, commit `246b5df` — i øvrigt approved).

- **Codex V5 KRITISK (apply-due-check kun i cron-filter):** V5's Beslutning 15 placerede effective_from-check i cron-filter (`WHERE status='approved' AND undo_deadline <= now() AND effective_from <= current_date`). Men `pending_change_apply`-RPC'en selv blev beskrevet som "flytter approved→applied; kalder intern handler" uden self-check. Manuel/admin direct call af `pending_change_apply(p_change_id)` på future-dated pending kan bypasse cron-filter og materialisere future-state. Step 8-test brugte direkte `pending_change_apply` for at undgå cron-ventetid — symptom på at apply-funktionen ikke selv håndhæver due-check. **V6-fix:** Flyt invariantet INTO `pending_change_apply`-RPC'en som central gate:
  - `pending_change_apply(p_change_id)` SKAL verificere `status='approved' AND undo_deadline <= now() AND effective_from <= current_date` før kald af intern handler. Hvis ikke opfyldt: RAISE EXCEPTION `not_yet_due` (kontrolleret fejl, ingen state-mutation)
  - Cron forbliver som selection-filter (vælger kandidater) — det er performance-mæssigt billigere end at `pending_change_apply` skanner alle approved-rows
  - Selve sikkerheds-grænsen er i `pending_change_apply`, ikke i cron
  - Beslutning 7, Valg 8's `pending_change_apply`-beskrivelse, Step 1's apply-handler-implementation, Step 8-test opdateres
  - Ny test: direct manuel `pending_change_apply` på future-dated row → exception, status forbliver `approved`, ingen state-mutation
  - Se opdateret Beslutning 15 + opdateret Valg 8

- **Claude.ai V5 KOSMETISKE (3 sekundære observationer):**
  - Mathias-mapping pkt 3 step-reference: "Step 5's team_close-RPC" → rettet til "Step 4's `_apply_team_close`-handler" (team_close-apply-handler er i Step 4, ikke Step 5)
  - Step 3 smoke-test-tekst: præciseret at trigger er på `org_node_versions`, ikke `org_nodes` direkte
  - Step 2 test-fil-navn: `t9_org_nodes.sql` præciseret til at indeholde versions-tests (navn bevares for fil-konvention)

**Codex OPGRADERING-fund i V5:** Ingen.

**Anti-glid runde 3+-status:** Vi er nu i 5. iteration (V6 er sjette version). Codex's V5 KRITISK er NY problem-klasse (apply-grænse-placering) — ikke samme effective-date-problem som V2-V4. Narrow fix, ikke arkitektur-ændring. Hvis V6 igen får KRITISK fund: STOP + rapportér til Mathias (5. KRITISK-iteration vil signalere at planen kræver fundamental re-tænkning eller scope-revision).

---

**Revision V5 (historik):** V5 var systematisk sweep af V4's nye arkitektur gennem hele planen — ingen arkitektur-ændring, ren konsistens-rettelse. Adresserer 1 KRITISK fund fra både Codex V4 (`docs/coordination/plan-feedback/T9-V4-codex.md`, commit `977c64f`) og Claude.ai V4 (`docs/coordination/plan-feedback/T9-V4-claude-ai.md`, commit `f6e22df`) — begge identificerede samme problem: V4 introducerede effective-date-modellen i Beslutning 13 men efterlod gamle SQL-kontrakter (Valg 1's tabel-liste, Beslutning 1, Valg 2's cycle-detection, Valg 12's seed, Valg 13's `org_tree_read()`, Mathias-mapping) der refererer til den gamle mutable `org_nodes`-model. Inkonsistens betyder krav-dok 6.1 + 4.1 + 4.2 ikke entydigt leveres.

**V5 sweep:**

- **Beslutning 1:** rewritten — `org_nodes` er identity-only; mutable felter (name, parent_id, node_type, is_active) lever på `org_node_versions`. Cycle-detect i versions effective at NEW.effective_from
- **Valg 1's tabel-liste:** `org_nodes` reduceret til identity-only (id, created_at, updated_at); `org_node_versions` har de mutable felter
- **Valg 2:** AFTER-trigger flyttet fra `org_nodes` til `org_node_versions` (på rows effektive at current_date); cycle-detect over versions
- **Valg 12 (seed):** opretter identity-row i `org_nodes` + initial version-row i `org_node_versions` med effective_from = '2026-05-17' (bootstrap-dato)
- **Valg 13's `org_tree_read()`:** rewritten til `org_tree_read_at(current_date)`-pattern — recursive CTE over `org_node_versions`
- **Mathias-mapping-tabel pkt 1, 2, 6, 10:** opdateret til at referere `org_node_versions` for mutable felter
- **Nyt fitness-check** `org_nodes_no_mutable_columns_in_sql`: grep-baseret CI-blocker (sweep af `supabase/migrations/`) der fejler hvis nye SQL-kontrakter refererer `org_nodes.name|parent_id|node_type|is_active`. Per Codex+Claude.ai V4-anbefaling

**Anti-glid runde 3+-status:** Vi er nu i runde 4-iteration (V5 er femte version). Per runde-3-disciplin stopper kun KRITISKE — det gjorde de igen i V4-runden, og fundet er samme problem-klasse som V2+V3. V5 er konsistens-sweep, ikke ny arkitektur. Hvis V5 stadig har inkonsistens: STOP og rapportér til Mathias.

**Codex OPGRADERING-fund i V4:** Ingen.

---

**Revision V4 (historik):** V4 addresserede 1 KRITISK fund fra Codex V3 (`docs/coordination/plan-feedback/T9-V3-codex.md`, commit `5db31cf`) + Claude.ai's V2-tilbagetrækning + KRITISK-feedback (`docs/coordination/plan-feedback/T9-V2-claude-ai.md`, commit `408ebf9`). Begge fund er samme klasse problem: temporal model skal versioneres på business effective_from, ikke på fysisk apply-tid.

- **Codex V3 KRITISK (effective_from vs updated_at):** V3's `org_node_history`-trigger skrev `version_started/version_ended` baseret på `NEW.updated_at` (fysisk mutation-tid). Det er forkert for future-dated changes (apply-tid ≠ effective_from-tid). V4 restrukturerer:
  - **`org_nodes`** bliver identity-only (id, created_at, updated_at) — uden mutable forretnings-felter
  - **`org_node_versions`** (renamed fra V3's `org_node_history`) bliver primær lagring af mutable state med `effective_from`/`effective_to` (samme pattern som placements) — IKKE version_started/version_ended baseret på fysisk apply-tid
  - **Apply-handler** skriver version-boundary fra `pending_changes.effective_from`, ikke fra `now()`
  - **Cron-filter** anvender `effective_from <= current_date` (i tillæg til `undo_deadline <= now()`) — apply venter på begge
  - **`org_node_closure`** rebuilds når versions effektive på current_date ændres — closure repræsenterer aldrig future-dated structure
  - **`org_tree_read()`** og **`org_tree_read_at(p_date)`** bruger samme effective-date filter (samme pattern som placements) — symmetrisk current/historisk
  - Se opdateret Beslutning 13 + ny Beslutning 15

- **Claude.ai V2-tilbagetrækning + KRITISK (samme problem-klasse):** Claude.ai har erkendt at hendes V2-MELLEM-finding (intern inkonsistens mellem Valg 13 og Valg 8) er KRITISK-klasse, ikke MELLEM, fordi den bryder krav-dok 6.1, 4.1, 4.2, 3.6.1 + vision-princip 1 og 9 + mathias-afgørelser 2026-05-16 pkt 2 + 2026-05-17 pkt 13. Per Modsigelses-disciplin: modsigelse mod krav-dok = plan-blokerende, ikke G-nummer-kandidat. V4's effective-date-restructure adresserer hendes KRITISK-finding fuldstændigt (samme fix som Codex V3 KRITISK).

**Codex OPGRADERING-fund i V3:** Ingen.

**Anti-glid runde 3-status:** Begge reviewers leverede KRITISK i V3-runden. Per runde-3-disciplin stopper kun KRITISKE fund planen — det gør de. V4 forventes.

---

**Revision V3 (historik):** V3 addresserede 2 KRITISKE fund fra Codex V2 (`docs/coordination/plan-feedback/T9-V2-codex.md`, commit `2a57ca4`) + 1 MELLEM-finding fra Claude.ai V2 (`docs/coordination/plan-feedback/T9-V2-approved-claude-ai.md`, commit `40871ba` — oprindelig approval; senere trukket tilbage som KRITISK pba. samme problem som Codex V3).

- **Codex KRITISK 1 (pending_change_request bypass-vej):** V2's public `pending_change_request` lod authenticated caller potentielt springe wrapper-valideringer over og oprette pending-row med forged payload. V3 gør `pending_change_request` INTERN (`revoke execute from authenticated`). Public wrappers (Step 8) er SECURITY DEFINER og er ENESTE indgang. Se Beslutning 12 + opdateret Valg 8.
- **Codex KRITISK 2a (aktiv-placement-definition):** V2 brugte `effective_to IS NULL` som "aktiv placement"-definition. Det er forkert ved future-dated changes (ny row med `effective_from > current_date` returneres som aktuel). V3 skifter overalt til `effective_from <= current_date AND (effective_to IS NULL OR effective_to > current_date)`. Gælder helpers (acl*subtree*\*), read-RPCs (current-state filters), partial UNIQUE constraints, EXCLUDE constraints, og pending-apply-handlers.
- **Codex KRITISK 2b + Claude.ai V2 Finding 1 (org_nodes versionering):** V2's `org_nodes` havde kun current-state-kolonner; `org_tree_read_at(p_date)` antog "immutable bortset fra is_active" — men `org_node_upsert` UPDATE-mode i Valg 8's matrix kunne ændre name/parent_id. Intern inkonsistens spotted også af Claude.ai V2 Finding 1. V3 introducerer `core_identity.org_node_history(...)` som append-only-snapshot-tabel, plus AFTER UPDATE-trigger på `org_nodes` der gemmer pre-mutation-state. `org_tree_read_at(p_date)` rekonstruerer state via join mellem history + current. Eliminerer V2's inkonsistens og opfylder krav-dok 6.1 ("gammel sandhed ændres ikke af ny sandhed"). Se ny Beslutning 13 + opdateret Valg 1 + opdateret Valg 13.

**Codex OPGRADERING-fund i V2:** Ingen. Codex' rolle-prompt er udvidet 2026-05-17 til opgraderings-forslag, men ingen blev leveret i V2-runde.

**Claude.ai V2-approval:** Gælder IKKE V3 fordi org_nodes-versioneringen er materielt arkitektur-ændring. Ny approval kræves.

---

**Revision V2 (historik):** V2 addresserede 3 fund fra Codex V1 (`docs/coordination/plan-feedback/T9-V1-codex.md`, commit `3027e2b`) + 2 MELLEM-fund fra Claude.ai V1 (`docs/coordination/plan-feedback/T9-V1-claude-ai.md`, commit `8e43b22`).

- **Codex KRITISK 1 (muterende RPC'er bypassede pending_changes):** Pending_changes er nu **eneste skrivevej** for tids-baserede ændringer (struktur/placering/klient). Public RPC'er er tynde wrappers der kalder `pending_change_request`. Apply-handlere er interne (ingen authenticated EXECUTE). Permission-elementer + grants + konfig er IKKE pending-pligtige fordi krav-dok 3.6.2 begrænser "fortrydelses-mekanisme" til "ændringer med gældende dato" (strukturændringer, medarbejder-flytninger, klient-flytninger). Se ny Beslutning 11 + RPC-skrivevej-matrix.
- **Codex KRITISK 2 (change_type-enum ikke komplet):** Komplet change-type-matrix indført med præcis én række pr. muterende RPC der er pending-pligtig: public request-funktion, intern apply-handler, payload-schema, valideringer, idempotency-regel, undo-adfærd, testnavn. Operationer uden for pending (permission-element-CRUD, grants, undo_settings) er eksplicit listet og begrundet.
- **Codex MELLEM (can_user_see-signatur):** Helper splittet: `acl_visibility_check(p_employee_id, p_target_id, p_target_kind, p_visibility) returns boolean` (kun visibility mod org-træ) + `permission_resolve` (eksisterende) som forretnings-RPC composer separat. Smoke-test verificerer samme target synligt/usynligt afhængigt af forskellig page/tab-grant.
- **Claude.ai MELLEM 1 (Hent-funktioner ikke eksplicit dækket):** Tilføjet dedikerede read-RPCs for alle hent-funktioner fra krav-dok sektion 4, særligt historiske (`org_tree_at`, `employee_placement_at`, `client_placement_at` osv.). Se nyt Valg 13.
- **Claude.ai MELLEM 2 (rolle-til-medarbejder):** Eksplicit verificeret mod trin 5: `core_identity.employee_upsert` håndterer Tildel (sæt role_id) + Skift (ændre role_id) + Fjern (sæt role_id=NULL). T9 tilføjer tynde wrappers `employee_role_assign` / `employee_role_remove` for ækvivalent navngivning + audit-clarity, men de delegerer til trin 5's RPC. Rolle-tildeling er IKKE pending-pligtig (krav-dok 4.4 specificerer ikke "gældende dato"; sker umiddelbart). Se Valg 1 + Valg 14.
- **Claude.ai KOSMETISK 3 (krav-dok intern modsigelse 18 vs 25):** Plan-Valg 12 håndterer pragmatisk (bootstrap "Ejere" + andre via UI). G-nummer-kandidat dokumenteret for Mathias-præcisering af krav-dok-tekst.
- **Claude.ai KOSMETISK 4 (engelske ENUM-værdier):** Bevidst valg dokumenteret i Valg 1 (kode-konsistens; UI-mapping i lag F). G-nummer ikke nødvendig — kosmetisk note.

**Codex OPGRADERING-fund i V1:** Ingen. Codex' rolle-prompt er udvidet 2026-05-17 til også at omfatte opgraderings-forslag, men ingen blev leveret i V1-runde.

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

**Beslutning 1: Ét organisations-træ med node_type-felt (afdeling/team) — identity + versions-split (V4+V5).**

Per krav-dok sektion 2 + pkt 28 (ét træ, ikke to). **V4-arkitektur (Beslutning 13):** `org_nodes` er identity-only-tabel (id, created_at, updated_at); mutable forretnings-felter (`name`, `parent_id`, `node_type`, `is_active`) lever på `org_node_versions`. parent_id på versions er self-refererende til `org_nodes.id` (identity stable på tværs af versions). Constraint: team-knuder kan ikke have børn — checked via versions effective at NEW.effective_from. Vilkårligt antal niveauer (pkt 2 + krav-dok 3.1.2). node_type-værdier `('department', 'team')` på versions, ikke på identity-row.

**Beslutning 2: Materialiseret closure-table for subtree-evaluering (V4+V5).**

Per master-plan rettelse 19 C1 + §1.7's princip "ingen rekursive CTE'er i RLS-policy-prædikater". Tabel `org_node_closure(ancestor_id FK org_nodes, descendant_id FK org_nodes, depth)` vedligeholdes af AFTER-trigger på **`org_node_versions`** (ikke org_nodes direkte — V5-sweep). Closure rebuilds når versions effektive på current_date ændres; repræsenterer aldrig future-dated structure. Helpers læser closure direkte for Hiraki-evaluering (current-state path); historiske queries bygger via recursive CTE over versions for given dato (acceptabelt — sjældent, ingen perf-budget for historisk).

**Beslutning 3: Versioneret placering (medarbejder + klient).**

Per krav-dok sektion 3.6 + master-plan §1.7. Tabeller `employee_node_placements` og `client_node_placements` med `effective_from` + `effective_to`. Partial UNIQUE `(<entity>_id) WHERE effective_to IS NULL` for "ét aktivt ad gangen". Knude-løs medarbejder = ingen åben placement-row (krav-dok 3.2.2 — gyldig tilstand). Skifte-RPC lukker gammel + åbner ny i én transaktion.

**Beslutning 4: Permission-elementer som tre separate tabeller med FK-kæde.**

Per krav-dok sektion 5.2 — tre niveauer (Område → Page → Tab). Tabellerne `permission_areas`, `permission_pages` (FK areas), `permission_tabs` (FK pages). Hvert niveau er CRUD-styret i UI uden deploy (krav-dok pkt 11 + 12). Page-implementation (React-komponent) er kode i lag F; registret er data. Three-tabel-tilgang foretrækkes over unified-hierarki-tabel fordi semantik er fast (tre niveauer, ikke vilkårligt antal) og FK-konstraints gør strukturen håndhævet på DB-niveau.

**Beslutning 5: Rettigheder samlet i én grants-tabel med element-niveau-diskriminering.**

`role_permission_grants(role_id, area_id, page_id, tab_id, can_access, can_write, visibility)` med CHECK at præcis én af `area_id` / `page_id` / `tab_id` er sat (NOT NULL). Visibility ENUM: `'self' | 'subtree' | 'all'` (mapper til krav-dok's Sig selv / Hiraki / Alt). Én tabel giver ensartet lookup-query for alle tre niveauer + simpler resolve-logik.

**Beslutning 6: Arve-logik via resolve-helper, ikke via materialiseret cache.**

Per krav-dok 5.2: "Hvis et niveau ikke er sat eksplicit, arves værdien fra niveauet over." Helper `permission_resolve(role_id, target_type, target_id) returns (can_access boolean, can_write boolean, visibility text)` walker fra mest specifikke (tab) til mindst specifikke (area). Materialiseret cache afvist fordi mængden er lille (få områder × få pages × få tabs × få roller) og resolve er trivielt billig — ingen behov for invalidering-kompleksitet.

**Beslutning 7: Fortrydelses-mekanisme via central `pending_changes`-tabel.**

Per krav-dok sektion 6. Tabel `pending_changes(id, change_type, target_id, payload jsonb, effective_from, requested_by, approved_at, approved_by, undo_deadline, applied_at, undone_at, status)`. Status-livscyklus: `pending → approved → applied | undone`. **V6 — central apply-gate i `pending_change_apply`:** RPC'en `pending_change_apply(p_change_id)` verificerer SELV `status='approved' AND undo_deadline <= now() AND effective_from <= current_date` før kald af intern handler. Hvis ikke opfyldt: RAISE EXCEPTION `not_yet_due` (kontrolleret fejl, ingen state-mutation). Cron `pending_changes_apply_due` bruger samme filter for SELECTION af kandidater (performance), men sikkerheds-grænsen sidder i apply-RPC'en. Manuel/admin direkte kald til `pending_change_apply` afvises hvis ikke due. Bruger kan kalde undo-RPC indtil `undo_deadline` overskredet. Generisk pattern dækker struktur-ændringer + medarbejder-flytninger + klient-flytninger uden type-specifik kode pr. ændringstype (handler-funktion er typedefineret pr. `change_type`, men container-tabellen er én).

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

**Beslutning 11 (V2 — Codex KRITISK 1+2): Pending_changes er eneste skrivevej for tids-baserede ændringer.**

Per krav-dok 3.6.2 ("Alle ændringer med gældende dato kan fortrydes... Det gælder strukturændringer, medarbejder-flytninger, klient-flytninger") + krav-dok 6 (fortrydelses-flow). V1 byggede direkte muterende public RPC'er der bypassede pending_changes — to skriveveje i konflikt. V2 etablerer:

- **Pending-pligtige operationer** (krav-dok 3.6.2-listen): alle struktur-, placering- og klient-mutationer går KUN gennem `pending_change_request` → approve → undo-vindue → `pending_change_apply` (intern). Public request-funktioner er tynde wrappers; apply-handlere er `security definer revoke from authenticated`. Ingen direkte authenticated mutation muligt
- **Direkte operationer** (uden gældende dato): permission-element-CRUD (område/page/tab), rettighedsgrants, undo_settings, rolle-tildeling (krav-dok 4.4 specificerer ikke gældende dato) — disse muteres direkte via deres dedikerede RPC'er med `has_permission`-check. Audit-trigger fanger ændringen
- **Komplet change_type-matrix** (Valg 8 udvidet) lister hver pending-pligtig RPC med: request-funktion, change_type-værdi, apply-handler, payload-schema, validering, idempotency-regel, undo-adfærd, testnavn
- **Tests verificerer ENDS-paths:** authenticated kald til intern apply-handler afvises (permission denied); request opretter pending-row uden state-mutation; apply muterer state (kun via cron eller manuel `pending_change_apply`); undo før deadline efterlader state uændret; apply er idempotent

**Beslutning 12 (V3 — Codex V2 KRITISK 1): `pending_change_request` er INTERN; public wrappers er eneste indgang.**

Per Codex V2-fund: V2 lod `pending_change_request` være public — det skabte ny bypass-vej hvor authenticated caller kunne springe wrapper-valideringer over og oprette pending-row med forged payload. V3 lukker den vej:

- `pending_change_request` får `revoke execute from authenticated` (kun service_role + admin har EXECUTE)
- Public wrappers fra Step 8 er `security definer` og er ENESTE indgang til pending-skrivevej for authenticated caller
- Wrappers udfører ALLE valideringer (permission, payload-schema, business-invariants) før de internt kalder `pending_change_request`
- Test (V3): forged authenticated kald til `pending_change_request` for hver kendt change_type → `permission denied`. Test for hvert change_type at wrapper-valideringerne effektivt blokerer forged payload

**Beslutning 13 (V4 — Codex V3 KRITISK + Claude.ai V2-KRITISK: effective_from-baseret org-versionering): `org_nodes` er identity-only; `org_node_versions` er primær mutable state.**

Per Codex V3-fund: V3's `org_node_history`-trigger skrev `version_started/version_ended` baseret på `NEW.updated_at` — fysisk mutation-tid, ikke business effective_from. Det er samme klasse fejl som V2's placement-problem, bare for org-strukturen. V4 restrukturerer arkitekturen til at være effective-date-baseret end-to-end:

**Schema-ændring (V4):**

- `core_identity.org_nodes(id PK uuid, created_at timestamptz, updated_at timestamptz)` — identity-only; ingen mutable forretnings-felter direkte. id er stable identitet for en knude på tværs af versions
- `core_identity.org_node_versions(version_id PK uuid, node_id FK org_nodes, name text, parent_id FK org_nodes NULL, node_type text, is_active boolean, effective_from date NOT NULL, effective_to date NULL, applied_at timestamptz NOT NULL DEFAULT now(), created_by_pending_change_id FK pending_changes NULL, created_at timestamptz)` — primær lagring; én version pr. (node_id, effective_period)
- Partial UNIQUE `(node_id) WHERE effective_to IS NULL` — kun én "open-ended" version pr. knude
- EXCLUDE-constraint `(node_id WITH =, daterange(effective_from, coalesce(effective_to, 'infinity'::date)) WITH &&)` — ingen overlap af versioner pr. knude
- FORCE RLS + `using (true)` for begge tabeller
- `node_type` CHECK `IN ('department', 'team')` på versions
- BEFORE INSERT/UPDATE-trigger på versions for cycle-detection (rekursiv CTE) + team-har-børn-blokering

**Apply-handler (V4):**

- `_apply_org_node_upsert(payload jsonb)` med payload `{id?, name, parent_id?, node_type, is_active, effective_from}`:
  - Hvis NY knude (id NULL eller ikke i org_nodes): INSERT org_nodes (id, created_at, updated_at); INSERT org_node_versions (node_id=new id, ..., effective_from, effective_to=NULL)
  - Hvis EKSISTERENDE knude UPDATE: UPDATE prior open-ended version SET effective_to = NEW.effective_from; INSERT new version med effective_from = NEW.effective_from, effective_to = NULL; UPDATE org_nodes.updated_at = now()
  - Version-boundary stammer fra `pending.effective_from`, ikke fra `now()`
- `_apply_org_node_deactivate(payload jsonb)` med payload `{node_id, effective_from}`:
  - UPDATE prior open-ended version SET effective_to = effective_from
  - INSERT new version med is_active=false + effective_from + effective_to=NULL
- `_apply_team_close(payload jsonb)` — analog: opdaterer version-row for team (is_active=false) + lukker åbne placements på samme effective_from

**Cron-filter (V4 — Beslutning 15):**

Apply venter på BÅDE undo-deadline OG effective-date:

```sql
SELECT * FROM pending_changes
WHERE status='approved'
  AND undo_deadline <= now()
  AND effective_from <= current_date
```

Future-dated changes hænger i 'approved'-status efter undo-deadline indtil effective_from-dato kommer. Backdated changes apply'es umiddelbart efter undo-deadline (effective_from < current_date er allerede passeret).

**Closure-tabel (V4):**

`org_node_closure(ancestor_id, descendant_id, depth)` er current-state-derived. Trigger på `org_node_versions` rebuilds closure når versions effektive på current_date ændres. Closure repræsenterer ALDRIG future-dated structure — kun current state. Historisk-tree-queries (`org_tree_read_at(p_date)`) bygger via recursive CTE over versions for given dato (acceptabelt — historisk-queries er sjældne; perf-budget gælder kun current state).

**Read-RPCs (V4 — symmetrisk current/historisk):**

- `org_tree_read()` = `org_tree_read_at(current_date)`. Samme SQL-pattern; current_date som default-argument
- `org_tree_read_at(p_date)`: recursive CTE over `org_node_versions WHERE effective_from <= p_date AND (effective_to IS NULL OR effective_to > p_date)` — returnerer tree-state på p_date

**Alternativ afvist:** Bevare V3's `org_node_history` med rettet apply-handler (effective_from i stedet for updated_at) men beholde `org_nodes` som current-state-tabel. Det fungerer ikke for future-dated changes — current `org_nodes` ville materialisere fremtidige tilstande før effective_from. Cron-filtreret approach kunne fungere, men tilføjer kompleksitet ift. timing-disciplin og er mere fragilt. Versions-as-primary-lagring er den robuste arkitektur.

**Alternativ afvist 2:** Materialiseret current-state `org_nodes` med trigger der opdateres når versions skal "aktiveres". Kræver ekstra cron der scanner versions for "transitions" (versions hvor effective_from netop er kommet til current_date). Tilføjer kompleksitet uden gevinst.

**Beslutning 15 (V4+V6 — Codex V3+V5 KRITISK): Central apply-gate i `pending_change_apply`; cron er selection-filter.**

V4-version (sagde: "Cron-filter venter på MAX(undo_deadline, effective_from)") fokuserede på cron. **V6-revision (Codex V5 KRITISK):** Sikkerheds-grænsen for "ikke materialiser future-dated" sidder i `pending_change_apply`-RPC'en, ikke kun i cron-filter.

Konkret:

- **`pending_change_apply(p_change_id)`** er central apply-gate. RPC'en verificerer SELV `status='approved' AND undo_deadline <= now() AND effective_from <= current_date` før kald af intern handler. Hvis ikke opfyldt: `RAISE EXCEPTION 'not_yet_due'` (kontrolleret fejl, ingen state-mutation)
- **Cron `pending_changes_apply_due`** bruger samme filter for SELECTION af kandidater (performance — undgår at `pending_change_apply` skanner alle approved-rows). Cron er IKKE eneste sikkerheds-grænse
- **Direct/manuel admin-kald** til `pending_change_apply(future_pending_id)` afvises via samme gate — uanset hvordan apply'en kommer ind (cron, manuel admin, test): samme due-check kører

Future-dated change: pending står som 'approved' med undo_deadline + effective_from i fremtiden. Cron selecterer ikke; men hvis nogen alligevel kalder `pending_change_apply` på den, returnerer den `not_yet_due`-exception. Ingen state-mutation. Først når BÅDE undo_deadline OG effective_from er passeret, apply'er handleren faktisk.

Test-konsekvens (V6): tests for future-dated, backdated, og same-day apply via BÅDE cron OG manuel `pending_change_apply`-kald. Verificér:

- Future-dated + manuel apply → `not_yet_due` exception; status='approved' bevaret; ingen versions/placements ændret
- Backdated + manuel apply → state ændret (effective_from < current_date er allerede passeret; alle invariants opfyldt)
- Same-day apply → state ændret
- Future-dated + cron-iteration → cron skipper rowen (matcher ikke filter); ingen apply

**Beslutning 14 (V3 — Codex V2 KRITISK 2a): "Aktiv placement"-definition har eksplicit current-date-check.**

Per Codex V2-fund: V2 brugte `effective_to IS NULL` overalt som "aktuel placement"-definition. Det er forkert ved future-dated changes (apply-handler kan opdatere effective_to på gammel row + indsætte ny row med `effective_from > current_date AND effective_to IS NULL` for fremtidig flytning). Den fremtidige row matcher V2's filter men er ikke aktuelt aktiv.

V3 etablerer entydig "aktiv placement"-definition:

```
effective_from <= current_date AND (effective_to IS NULL OR effective_to > current_date)
```

Gælder ALLE places der spørger "current placement":

- Helpers `acl_subtree_org_nodes`, `acl_subtree_employees` (læs current placement)
- Read-RPCs `employee_placement_read`, `client_placement_read` (current view)
- Partial UNIQUE constraint på placements ændres til at omfatte både current og future-effective rows? Eller bevares som `(employee_id) WHERE effective_to IS NULL` med tillæg af BEFORE INSERT-trigger der blokerer future-effective row hvis nuværende placement endnu ikke er lukket via effective_to. Sidste pattern er enklere
- EXCLUDE-constraint på daterange bevares — den dækker også future-dated overlaps
- Apply-handlers (`_apply_employee_place` etc.): sætter `effective_to = least(<eksisterende åbne>'s effective_to, NEW.effective_from)` så fremtidig flytning korrekt lukker eksisterende placement på flyttedatoen

---

## Mathias' afgørelser (input til denne plan)

Alle 32 afgørelser fra krav-dok sektion 10 honoreres 1:1. Konkret mapping af de centrale:

| Krav-dok # | Afgørelse                                                               | Plan-element                                                                                                                                                                                                                         |
| ---------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ---------------------------------------------- |
| 1          | Ejerskabs-kæde Cph Sales → afdelinger → teams → relationer              | `org_node_versions.node_type` + `org_node_versions.parent_id`-hierarki (V5-sweep — mutable felter på versions, ikke org_nodes). CHECK: team kan ikke have børn — over current versions                                               |
| 2          | Afdelinger ændres sjældent; historik bevares                            | `org_node_versions` (V4-arkitektur — Beslutning 13) bevarer hele historikken via effective_from/effective_to; audit-trigger på versions ved alle INSERT/UPDATE/DELETE                                                                |
| 3          | Team kan ophøre; medarbejdere bliver knude-løse                         | Step 4's `_apply_team_close`-handler (V4+V5+V6) lukker alle åbne placements på teamet + opretter ny org_node_versions-row med is_active=false; medarbejder-rows urørte; public wrapper `team_close` i Step 8 går via pending_changes |
| 4          | Klient kan aldrig dræbe et team                                         | Ingen CASCADE fra clients til org_nodes; client_node_placements har ON DELETE RESTRICT mod node                                                                                                                                      |
| 5          | Klient ejer sin egen data; følger klienten ved team-skift               | Konsekvens for trin 14+ (sales attribution via client_id, ikke team_id). Dokumenteres i bygge-status                                                                                                                                 |
| 6          | is_active-flag på knuder                                                | `org_node_versions.is_active` (V5-sweep — på versions, ikke org_nodes); trigger på `employee_node_placements` + `client_node_placements` blokerer nye placements hvor target nodes current version har is_active=false               |
| 7          | Én medarbejder på én knude ad gangen; også stab                         | Partial UNIQUE på `employee_node_placements (employee_id) WHERE effective_to IS NULL`; ingen stab-undtagelse                                                                                                                         |
| 8          | Cross-team-adgang via rolle/synlighed                                   | Beslutning 8 — synlighed evalueres i RPC-laget via `permission_resolve` + `acl_subtree_employees`; ingen flerdoblede placements understøttes                                                                                         |
| 9          | Ingen hardkodet horizon for migration                                   | Step 8 upload-script har `--from-date <date>` parameter; default = alt                                                                                                                                                               |
| 10         | Teams/afdelinger anonymiseres ikke                                      | Klassifikations-registry-rækker for alle `org_nodes` + `org_node_versions`-kolonner: `pii_level='none'` (V5-sweep — versions-tabel inkluderet)                                                                                       |
| 11+12      | Permission-elementer er data i DB i tre niveauer                        | Beslutning 4 — tre tabeller (`permission_areas`/`pages`/`tabs`) med CRUD-RPC'er                                                                                                                                                      |
| 13         | To akser pr. (rolle × element): kan_se/tilgå + kan_skrive, og synlighed | Beslutning 5 — `role_permission_grants` med `can_access`/`can_write`/`visibility` kolonner                                                                                                                                           |
| 14         | Tre synligheds-værdier (Sig selv / Hiraki / Alt)                        | Visibility ENUM (`'self'                                                                                                                                                                                                             | 'subtree' | 'all'`); migration mapper `'team' → 'subtree'` |
| 15         | Hiraki udledt af placering                                              | Helper `acl_subtree_employees(employee_id)` joiner placement → node → closure → descendants. Knude-løs + synlighed=subtree returnerer tom array (krav-dok 4.9 sidste afsnit)                                                         |
| 16         | Synlighed pr. (rolle × element) — kan variere                           | grants-tabellen har en row pr. (rolle × niveau-id); samme rolle kan have forskellig visibility på forskellige elementer                                                                                                              |
| 17+18      | Superadmin = synlighed=Alt på alt; Mathias + Kasper                     | Seed-migration sætter superadmin-rolle med `visibility='all'` på alle areas+pages+tabs. Eksisterende admin-rolle fra trin 5 omdøbes til superadmin-rolle hvis ikke allerede gjort                                                    |
| 19         | Klienter kun på team-knuder                                             | Trigger på `client_node_placements` BEFORE INSERT/UPDATE: verificér node_type='team'                                                                                                                                                 |
| 20         | Knude-løs er gyldig tilstand                                            | Ingen NOT NULL-constraint der kræver placement; ingen trigger der forhindrer "fjern placement"                                                                                                                                       |
| 21         | Ingen stabs-team i 2.0                                                  | Ingen særlig node_type for stab; placeres på passende afdeling eller team                                                                                                                                                            |
| 22+23      | Fortrydelses-mekanisme + konfigurerbar periode                          | Beslutning 7 — `pending_changes`-tabel + `undo_settings(change_type, undo_period)` UI-redigerbar konfig                                                                                                                              |
| 24         | Import af træ + placeringer fra 1.0                                     | Step 8 — discovery + extract + upload-scripts                                                                                                                                                                                        |
| 25         | Klient-til-team-import udskydes til trin 10                             | T9 bygger kun `client_node_placements`-strukturen uden client-FK + uden import-script                                                                                                                                                |
| 26         | Alle navne på afdelinger/teams oprettes i UI                            | Migration seed kun root-knuden "Copenhagen Sales" + "Ejere"-afdelingen (for Mathias + Kasper, jf. pkt 18); andre knuder oprettes i UI                                                                                                |
| 27         | Knude/element-styring via almindelig rettighed                          | RPC'er beskyttes af `has_permission('organisations-træ', 'manage', can_write=true)` osv. — ingen særlig admin-bypass                                                                                                                 |
| 28         | Ét træ; permission-elementer ikke et træ                                | Permission-elementer er tre separate tabeller med simple FK-kæder; ingen closure-table eller subtree-mekanik på dem                                                                                                                  |
| 29         | Tx-rollback default for DB-tests                                        | Alle DB-tests bruger `BEGIN; ... ROLLBACK;` per CI-blocker 20; fitness-check håndhæver                                                                                                                                               |
| 30         | Plan-leverance er kontrakt                                              | Alle 9 funktions-grupper fra krav-dok sektion 4 leveres 1:1                                                                                                                                                                          |
| 31         | Fire-dokument-disciplin obligatorisk                                    | Sektion "Fire-dokument-konsultation" nederst i denne plan                                                                                                                                                                            |
| 32         | Oprydnings-strategi obligatorisk                                        | Sektion "Oprydnings- og opdaterings-strategi" nederst i denne plan                                                                                                                                                                   |

---

## Tekniske valg overladt til Code — argumentation

### Valg 1 — Konkrete tabel- og kolonne-navne

**Anbefaling:** Følg eksisterende konvention fra trin 1-7 (snake_case, plural for entity-tabeller, `_id` suffix for FKs, `is_active`-felt eksplicit, `effective_from`/`effective_to` for versionering konsistent med master-plan §1.7's `from_date`/`to_date`-pattern men semantisk klarere for fortrydelses-domænet).

**Tabeller (alle i `core_identity`-schema, jf. master-plan §1.11):**

- `org_nodes(id, created_at, updated_at)` (V4+V5 — identity-only; alle mutable felter på `org_node_versions`)
- `org_node_closure(ancestor_id, descendant_id, depth)`
- `org_node_versions(version_id, node_id, name, parent_id, node_type, is_active, effective_from, effective_to, applied_at, created_by_pending_change_id, created_at)` (V4 — Beslutning 13; renamed fra V3's `org_node_history` med ny effective-date-baseret model)
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
- `acl_visibility_check(p_employee_id uuid, p_target_id uuid, p_target_kind text, p_visibility text) returns boolean` — V2: pure visibility-check mod org-træ givet en konkret visibility-værdi. Kalder IKKE permission_resolve. Forretnings-RPC composer: først `permission_resolve(role, element)` → får visibility-værdi; derefter `acl_visibility_check(employee, target, kind, visibility)` → får ja/nej. Split adresserer Codex V1 MELLEM-fund om manglende input i V1's `can_user_see`-signatur

**RPC'er — pending-pligtige (tids-baserede ændringer; eneste skrivevej via pending_changes; jf. Beslutning 11):**

Hver pending-pligtig public RPC er tynd wrapper der validerer + opretter `pending_changes`-row med `status='pending'`. Faktiske mutation sker i intern apply-handler kaldt af cron eller manuel `pending_change_apply`. Apply-handlere er `security definer revoke from authenticated`.

- `org_node_upsert(p_id uuid, p_name text, p_parent_id uuid, p_node_type text, p_is_active boolean, p_effective_from date) returns uuid` — opretter pending-row med `change_type='org_node_upsert'`; intern handler `_apply_org_node_upsert(payload jsonb)`
- `org_node_deactivate(p_node_id uuid, p_effective_from date) returns uuid` — `change_type='org_node_deactivate'`; intern `_apply_org_node_deactivate(payload jsonb)`
- `team_close(p_node_id uuid, p_effective_from date) returns uuid` — `change_type='team_close'`; intern `_apply_team_close(payload jsonb)` (atomisk: is_active=false + luk alle åbne placements på team)
- `employee_place(p_employee_id uuid, p_node_id uuid, p_effective_from date) returns uuid` — `change_type='employee_place'`; intern `_apply_employee_place(payload jsonb)` (luk eventuel åben + åbn ny)
- `employee_remove_from_node(p_employee_id uuid, p_effective_from date) returns uuid` — `change_type='employee_remove'`; intern `_apply_employee_remove(payload jsonb)`
- `client_node_place(p_client_id uuid, p_node_id uuid, p_effective_from date) returns uuid` — `change_type='client_place'`; intern `_apply_client_place(payload jsonb)` (validerer node_type='team')
- `client_node_close(p_client_id uuid, p_effective_from date) returns uuid` — `change_type='client_close'`; intern `_apply_client_close(payload jsonb)`

**RPC'er — direkte muterende (uden gældende dato; ikke pending-pligtige; jf. krav-dok 3.6.2 + Beslutning 11):**

Disse opererer på konfiguration/struktur uden tidsdimension. Audit-trigger fanger mutationen umiddelbart. Krav-dok 4.5 + 4.6 + 4.7 specificerer ikke "gældende dato" på disse.

- `permission_area_upsert(p_id uuid, p_name text, p_is_active boolean, p_sort_order integer) returns uuid`
- `permission_area_deactivate(p_area_id uuid) returns void`
- `permission_page_upsert(p_id uuid, p_area_id uuid, p_name text, p_is_active boolean, p_sort_order integer) returns uuid`
- `permission_page_deactivate(p_page_id uuid) returns void`
- `permission_tab_upsert(p_id uuid, p_page_id uuid, p_name text, p_is_active boolean, p_sort_order integer) returns uuid`
- `permission_tab_deactivate(p_tab_id uuid) returns void`
- `role_permission_grant_set(p_role_id uuid, p_element_type text, p_element_id uuid, p_can_access boolean, p_can_write boolean, p_visibility text) returns uuid`
- `role_permission_grant_remove(p_role_id uuid, p_element_type text, p_element_id uuid) returns void`
- `undo_setting_update(p_change_type text, p_undo_period_seconds integer) returns void`
- `employee_role_assign(p_employee_id uuid, p_role_id uuid) returns void` — V2: tynd wrapper omkring trin 5's `employee_upsert` for ækvivalent navngivning + audit-clarity (jf. Valg 14)
- `employee_role_remove(p_employee_id uuid) returns void` — V2: tynd wrapper; sætter `role_id=NULL` via trin 5's `employee_upsert`

**RPC'er — fortrydelses-mekanisme:**

- `pending_change_request(p_change_type text, p_target_id uuid, p_payload jsonb, p_effective_from date) returns uuid` — **V3: INTERN** (`revoke execute from authenticated`). Public wrappers er ENESTE indgang. Kun service_role + admin har EXECUTE. Tests verificerer forged authenticated kald → permission denied. Se Beslutning 12
- `pending_change_approve(p_change_id uuid) returns void` — godkender; sætter `undo_deadline = now() + undo_period`
- `pending_change_undo(p_change_id uuid) returns void` — ruller tilbage før `undo_deadline`
- `pending_change_apply(p_change_id uuid) returns void` — **V6 central apply-gate:** verificerer `status='approved' AND undo_deadline <= now() AND effective_from <= current_date` før kald af intern handler. RAISE EXCEPTION `not_yet_due` hvis ikke opfyldt (kontrolleret fejl, ingen state-mutation). Sikkerheds-grænsen for "ikke materialiser future-dated" sidder her, ikke i cron. Eksekveres af cron eller manuelt af admin; begge gennem samme gate

**RPC'er — read (V2; jf. Valg 13):**

For at gøre frontend-konsumeringen konsistent på tværs af aktuelle og historiske queries:

- `org_tree_read() returns table(...)` — aktuel træ-struktur (kun aktive knuder)
- `org_tree_read_at(p_date date) returns table(...)` — træ på specifik dato
- `employee_placement_read(p_employee_id uuid) returns table(...)` — aktuel placement
- `employee_placement_read_at(p_employee_id uuid, p_date date) returns table(...)` — placement på dato
- `client_placement_read(p_client_id uuid) returns table(...)` — aktuel klient-team-tilknytning
- `client_placement_read_at(p_client_id uuid, p_date date) returns table(...)`
- `permission_elements_read() returns table(...)` — alle aktive areas+pages+tabs
- `role_permissions_read(p_role_id uuid) returns table(...)` — alle grants for rolle
- `pending_changes_read() returns table(...)` — ventende changes for caller (eller alle for admin)

**Eksisterende RPC'er fra trin 5 bevares uændret**: `employee_upsert` (håndterer rolle-tildeling via role_id-felt — jf. Claude.ai V1 MELLEM 2 + Valg 14), `role_upsert`, `role_page_permission_upsert` (sidstnævnte deprecated til fordel for `role_permission_grant_set`; T9 bevarer for backward-compat).

### Valg 2 — Closure-table-vedligeholdelse på `org_node_versions` (V5-sweep)

**Anbefaling (V5):** Genberegn berørt subtree ved AFTER INSERT/UPDATE/DELETE på **`org_node_versions`** når en row med `effective_from <= current_date AND (effective_to IS NULL OR effective_to > current_date)` ændres. Org-mutationer er sjældne (krav-dok mathias-afgoerelser pkt 2 + master-plan §1.7); trigger-omkostning irrelevant. Tilføj `org_node_closure` til `AUDIT_EXEMPT_SNAPSHOT_TABLES`-allowlist i `scripts/fitness.mjs`.

**Cycle-detection (V5):** BEFORE INSERT/UPDATE-trigger på `org_node_versions` (på parent_id-felt der ligger på versions, ikke på org_nodes direkte). Rekursiv CTE traverserer versions effektive at NEW.effective_from. Begge triggers (cycle + closure) fyrer i samme transaktion per master-plan §1.7.

**V5-fix:** V4's Valg 2-tekst sagde "AFTER-trigger på org_nodes" + "cycle-detection på org_nodes.parent_id" — det er gammel-model-tekst der ikke matcher V4's identity-only org_nodes. V5 retter at trigger sidder på `org_node_versions` (hvor mutable parent_id rent faktisk lever).

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

### Valg 8 — Pending_changes som central tabel med komplet change_type-matrix (V2)

**Anbefaling:** Beslutning 7 + 11. En tabel `pending_changes` er **eneste skrivevej** for tids-baserede ændringer (struktur, placement, klient). `change_type` ENUM diskriminerer; `payload` jsonb bærer typespecifikke detaljer. Apply-handler-dispatcher kalder type-specifik intern handler. Permission-element-CRUD + grants + konfig går UDENOM pending_changes (krav-dok 3.6.2 begrænser fortrydelse til tids-baserede ændringer).

**Komplet change-type-matrix (V2 — Codex KRITISK 2-fix):**

Hver pending-pligtig RPC har præcis én række. Public request-funktion + intern apply-handler + payload-schema + valideringer + idempotency + undo-adfærd + testnavn.

| change_type           | Public request-RPC          | Intern apply-handler         | Payload-schema (jsonb)                          | Valideringer                                                                                                 | Idempotency                                                             | Undo-adfærd                                                                                   | Testnavn                             |
| --------------------- | --------------------------- | ---------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------ |
| `org_node_upsert`     | `org_node_upsert`           | `_apply_org_node_upsert`     | `{id?, name, parent_id?, node_type, is_active}` | parent_id er ikke et team-knude (CHECK via lookup); cycle-detect; name ikke tom                              | Same payload + same effective_from → no double-apply (PK på pending_id) | Hvis prior_state var INSERT: undo sletter row. Hvis UPDATE: undo restorer prior payload       | `t9_pending_org_node_upsert.sql`     |
| `org_node_deactivate` | `org_node_deactivate`       | `_apply_org_node_deactivate` | `{node_id, effective_from}`                     | Node eksisterer + is_active=true; team-knude må ikke have åbne placements (eller redirect til team_close)    | Re-apply til same state = no-op                                         | Undo restorer is_active=true                                                                  | `t9_pending_org_node_deactivate.sql` |
| `team_close`          | `team_close`                | `_apply_team_close`          | `{node_id, effective_from}`                     | Node er team-type + is_active=true                                                                           | Atomisk: is_active=false + luk alle åbne employee + client placements   | Undo restorer is_active=true + genåbn placements (sætter effective_to=NULL hvis undone match) | `t9_pending_team_close.sql`          |
| `employee_place`      | `employee_place`            | `_apply_employee_place`      | `{employee_id, node_id, effective_from}`        | Employee eksisterer + ikke anonymized; node er ikke deaktiveret; ny placement starter på/efter eventuel åben | Same employee+node+effective_from: no-op                                | Undo lukker den nye placement + genåbner forrige                                              | `t9_pending_employee_place.sql`      |
| `employee_remove`     | `employee_remove_from_node` | `_apply_employee_remove`     | `{employee_id, effective_from}`                 | Aktiv placement eksisterer for employee                                                                      | Re-apply til same state = no-op                                         | Undo genåbner den lukkede placement                                                           | `t9_pending_employee_remove.sql`     |
| `client_place`        | `client_node_place`         | `_apply_client_place`        | `{client_id, node_id, effective_from}`          | Node er team-type + is_active=true                                                                           | Same client+node+effective_from: no-op                                  | Undo lukker den nye placement + genåbner forrige                                              | `t9_pending_client_place.sql`        |
| `client_close`        | `client_node_close`         | `_apply_client_close`        | `{client_id, effective_from}`                   | Aktiv placement eksisterer for client                                                                        | Re-apply til same state = no-op                                         | Undo genåbner den lukkede placement                                                           | `t9_pending_client_close.sql`        |

**Operationer UDEN for pending_changes (jf. krav-dok 3.6.2 + Beslutning 11):**

| RPC                                                          | Begrundelse for undtagelse                                                                              |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `permission_area_upsert` / `permission_area_deactivate`      | Permission-element-konfiguration; krav-dok 4.5 specificerer ikke "gældende dato"; ændring er umiddelbar |
| `permission_page_upsert` / `permission_page_deactivate`      | Samme                                                                                                   |
| `permission_tab_upsert` / `permission_tab_deactivate`        | Samme                                                                                                   |
| `role_permission_grant_set` / `role_permission_grant_remove` | Rettigheds-tildeling; krav-dok 4.6 ikke "gældende dato"; effekt umiddelbar                              |
| `undo_setting_update`                                        | Meta-konfiguration                                                                                      |
| `employee_role_assign` / `employee_role_remove`              | Rolle-tildeling; krav-dok 4.4 ikke "gældende dato" (jf. Claude.ai V1 MELLEM 2 + Valg 14)                |
| Trin 5's `employee_upsert`, `role_upsert`                    | Eksisterende RPC'er; rolle/employee-CRUD; ikke i T9-scope at re-arkitektur                              |
| `pending_change_request/approve/undo/apply`                  | Meta-mekanisme; selve operationen kan ikke være pending                                                 |

**Cron-eksekvering (V6 — selection-filter, ikke sikkerheds-grænse):** ny cron `pending_changes_apply_due` (kører hver minut via pg_cron) som SELECTERER kandidater hvor `status='approved' AND undo_deadline <= now() AND effective_from <= current_date`, og kalder `pending_change_apply` for hver. Selve sikkerheds-grænsen for "ikke materialiser future-dated" sidder i `pending_change_apply`-RPC'en (jf. ovenfor); cron-filteret er performance/effektivitet — det undgår at `pending_change_apply` skanner alle approved-rows. Cron-failhåndtering via `cron_heartbeats` (etableret pattern fra trin 3).

**Apply-handler-tilgang:** dispatcher er switch-statement på `change_type`. Hver intern handler er `security definer` med `revoke execute from authenticated` for at forhindre direkte kald uden om `pending_change_apply`. Tests verificerer at authenticated rolle får `permission denied` ved direkte kald til `_apply_*`-handlers.

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

**Anbefaling (V5-sweep):** Migration `t9_seed_owners.sql` opretter for hver knude BÅDE identity-row og initial version-row (per V4-arkitektur):

- **Root-knude (Copenhagen Sales):**
  - INSERT `org_nodes(id=<root-uuid>, created_at=now(), updated_at=now())`
  - INSERT `org_node_versions(node_id=<root-uuid>, name='Copenhagen Sales', parent_id=NULL, node_type='department', is_active=true, effective_from='2026-05-17', effective_to=NULL, applied_at=now(), created_by_pending_change_id=NULL)` (NULL fordi bootstrap er ikke pending-baseret)
- **Ejere-afdeling:**
  - INSERT `org_nodes(id=<ejere-uuid>, ...)` + INSERT `org_node_versions(node_id=<ejere-uuid>, name='Ejere', parent_id=<root-uuid>, node_type='department', is_active=true, effective_from='2026-05-17', ...)`
- `employee_node_placements` for mg@ og km@ (eksisterer fra trin 1 bootstrap) på Ejere-afdelingen med effective_from='2026-05-17'
- Superadmin-rolle: hvis admin-rolle eksisterer (fra trin 1), omdøb til `superadmin`. Ellers opret ny.
- `role_permission_grants` for superadmin med `visibility='all'` på alle areas + pages + tabs (seedede fra migration af role_page_permissions)

Andre knuder (afdelinger, teams) oprettes i UI per krav-dok pkt 26 — via `org_node_upsert`-wrapper, der opretter pending_changes-row med change_type='org_node_upsert' og effective_from valgt af brugeren.

**V5-fix:** V4's Valg 12-tekst sagde `org_nodes(name=..., node_type=..., parent_id=...)` som gammel-model-seed. V5 retter til identity+version-split-seed.

### Valg 13 — Hent-funktioner som dedikerede read-RPCs (V2)

**Anbefaling (V2 — adresserer Claude.ai V1 MELLEM 1):** Tilføj dedikerede read-RPCs for alle Hent-funktioner fra krav-dok sektion 4. Hybrid-tilgang: aktuel-RPCs er tynde wrappers over SELECT på `using (true)`-tabeller; historiske-RPCs anvender konsistent versionsfilter-pattern.

**RPC'er (V2):**

| Krav-dok funktion              | Read-RPC                                             | Implementations-pattern                                                                                                                                                                                                                                                                                                                              |
| ------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 Hent træet                 | `org_tree_read()`                                    | **V5-sweep:** = `org_tree_read_at(current_date)`. Recursive CTE over `org_node_versions WHERE effective_from <= current_date AND (effective_to IS NULL OR effective_to > current_date)` joined med `org_nodes` for identity. Optionalt path via `org_node_closure` for performance. Returnerer table(id, name, parent_id, node_type, is_active, ...) |
| 4.1 Hent historisk træ         | `org_tree_read_at(p_date date)`                      | **V4-implementation (Beslutning 13):** Recursive CTE over `org_node_versions` med effective-date-filter `effective_from <= p_date AND (effective_to IS NULL OR effective_to > p_date)`. For p_date = current_date kan optionalt bruges `org_node_closure` for hurtig path. Symmetrisk current/historisk via samme SQL-pattern                        |
| 4.2 Hent placering             | `employee_placement_read(p_emp_id)`                  | **V3 (Beslutning 14):** `SELECT * FROM employee_node_placements WHERE employee_id=p_emp_id AND effective_from <= current_date AND (effective_to IS NULL OR effective_to > current_date)` — håndterer future-dated changes korrekt                                                                                                                    |
| 4.2 Hent historisk placering   | `employee_placement_read_at(p_emp_id, p_date date)`  | `SELECT * WHERE employee_id=p_emp_id AND effective_from <= p_date AND (effective_to IS NULL OR effective_to > p_date)`                                                                                                                                                                                                                               |
| 4.3 Hent klients team          | `client_placement_read(p_client_id)`                 | Samme pattern som 4.2 mod client_node_placements                                                                                                                                                                                                                                                                                                     |
| 4.3 Hent historisk tilknytning | `client_placement_read_at(p_client_id, p_date date)` | Samme                                                                                                                                                                                                                                                                                                                                                |
| 4.5 Hent struktur              | `permission_elements_read()`                         | Returnerer alle aktive areas/pages/tabs i strukturret form                                                                                                                                                                                                                                                                                           |
| 4.6 Hent rolles rettigheder    | `role_permissions_read(p_role_id)`                   | Returnerer alle grants for rolle, joined med element-navne                                                                                                                                                                                                                                                                                           |
| 4.7 Hent ventende ændringer    | `pending_changes_read()`                             | Returnerer pending+approved changes for caller; admin ser alle                                                                                                                                                                                                                                                                                       |

**Begrundelse:**

- **Hvorfor dedikerede historiske RPC'er:** Frontend kan ikke konsistent konstruere versions-filter-queries pr. side. Dedikeret RPC giver én tested implementation pr. krav-dok-funktion + reducerer fejl-overflade
- **Hvorfor aktuel-RPCs:** Konsistens med historisk-pattern; én contract pr. funktion. Implementation er trivial (SELECT med simpelt filter), så ingen overhead
- **Permission-tjek på read-RPCs:** Read-RPCs er `security invoker`; `has_permission(<area>, <page>, can_view=true)` på indgang. Synlighed (Sig selv / Hiraki / Alt) anvendes som FILTER på returnerede rows (ikke som adgangs-spærring)

**Alternativ afvist:** Pure SELECT mod `using (true)`-tabeller fra frontend uden RPC-lag. Det dækker aktuel-tilfælde men:

- Frontend skal selv konstruere versions-filter-SQL for historisk (ikke trivielt)
- Ingen permission-tjek-konsistens (PostgREST eksponerer hele tabel uden `has_permission`)
- Krav-dok sektion 4 specificerer Hent som funktioner T9 leverer; ren PostgREST-eksponering opfylder ikke kontrakten 1:1

### Valg 14 — Rolle-til-medarbejder via trin 5's employee_upsert (V2)

**Anbefaling (V2 — adresserer Claude.ai V1 MELLEM 2):** Verificeret mod trin 5: `core_identity.employee_upsert(p_id uuid, p_first_name text, p_last_name text, p_email text, p_role_id uuid, ...)` dækker alle tre krav-dok 4.4-funktioner via `role_id`-parameter:

- **Tildel rolle:** kald `employee_upsert(...)` med konkret `p_role_id`
- **Skift rolle:** kald `employee_upsert(...)` med ny `p_role_id`
- **Fjern rolle:** kald `employee_upsert(...)` med `p_role_id=NULL`. Krav-dok 4.4 specificerer "medarbejderen mister adgang udover personlige basale funktioner"; det opfyldes ved NULL-rolle (helpers og `permission_resolve` returnerer default-deny for caller uden role_id)

**T9 tilføjer tynde wrappers** for ækvivalent navngivning med krav-dok-funktions-tekst og for tydligt audit-spor:

- `employee_role_assign(p_employee_id uuid, p_role_id uuid)`: kalder `employee_upsert` med eksisterende employee-data + nye p_role_id; audit-trigger fanger som UPDATE
- `employee_role_remove(p_employee_id uuid)`: kalder `employee_upsert` med p_role_id=NULL

**Pending-pligtighed:** rolle-tildeling er IKKE pending-pligtig fordi krav-dok 4.4 ikke specificerer "gældende dato" som de øvrige pending-pligtige operationer gør. Rolle-ændring sker umiddelbart; audit-trigger fanger ændringen. Det matcher krav-dok 3.6's afgrænsning til "alle ændringer med gældende dato".

**G-nummer-kandidat (lav):** hvis senere brug viser at rolle-tildelinger også bør være pending-pligtige (fx for at undgå utilsigtet ophæving af FM-chefs adgang), kan en separat pakke konvertere `employee_role_assign` til pending-wrapper. Dokumenteres som åben option, ikke V2-scope.

---

## Implementations-rækkefølge

**V2-re-ordering rationale (Codex KRITISK 1+2):** V1's rækkefølge byggede direkte muterende public RPC'er i Steps 1-6 og introducerede pending_changes først i Step 7. Resultat: to skriveveje (direkte + pending) i konflikt. V2 etablerer pending_changes-infrastruktur tidligt (nu Step 1) og bygger derefter datatabeller med kun interne apply-handlers; public pending-wrappers samles i nyt Step 7 hvor alle change_types er kendt. Direkte mutatorer (permission-elementer, grants, konfig) forbliver i de respektive steps fordi de IKKE er pending-pligtige (jf. krav-dok 3.6.2 + Beslutning 11).

**Dependency-chain (lineær, V2):**

- Step 1 (`pending_changes`-infrastruktur + cron + undo_settings + apply-dispatcher) → bygger på trin 3's cron-skabelon
- Step 2 (`org_nodes` + cycle-detect + internal `_apply_org_node_*`-handlers) → deps Step 1
- Step 3 (`org_node_closure` + maintain-trigger) → deps Step 2
- Step 4 (`employee_node_placements` + internal `_apply_employee_*` + `_apply_team_close`-handlers) → deps Step 2 + eksisterende `employees`
- Step 5 (`client_node_placements` UDEN client-FK + internal `_apply_client_*`-handlers) → deps Step 2
- Step 6 (permission-elementer: areas/pages/tabs + direkte CRUD-RPCs; ikke pending-pligtige) → ingen deps på tidligere T9-tabeller
- Step 7 (`role_permission_grants` + helpers `acl_subtree_*`/`permission_resolve`/`acl_visibility_check` + direkte CRUD-RPCs) → deps Steps 3 (closure) + 4 (placements) + 6 (elements)
- Step 8 (public pending-wrapper RPCs `org_node_upsert/deactivate`, `team_close`, `employee_place/remove`, `client_place/close` + `employee_role_assign/remove` direkte) → deps Steps 1+2+4+5
- Step 9 (read-RPCs: `org_tree_read[_at]`, `employee_placement_read[_at]`, `client_placement_read[_at]`, `permission_elements_read`, `role_permissions_read`, `pending_changes_read`) → deps alle DB-steps + Step 7's helpers
- Step 10 (migration discovery + extract + upload-scripts for 1.0) → uafhængig af DB-state
- Step 11 (migration af eksisterende `role_page_permissions` → ny model) → deps Steps 6+7
- Step 12 (seed Mathias+Kasper + Cph Sales + Ejere + superadmin-grants) → deps Steps 2+4+6+7+11
- Step 13 (klassifikation + fitness-checks + dokumentations-opdateringer + cleanup) → sidste step; deps alle

### Step 1 — pending_changes-infrastruktur + cron + undo_settings + apply-dispatcher (V2)

- **Migration-fil:** `20260518000000_t9_pending_changes.sql`
- **Hvad:**
  - Tabel `core_identity.pending_changes(id, change_type text, target_id uuid, payload jsonb, effective_from date, requested_by uuid, requested_at timestamptz, approved_at timestamptz, approved_by uuid, undo_deadline timestamptz, applied_at timestamptz, undone_at timestamptz, status text, ...)`; status-CHECK (`'pending' | 'approved' | 'applied' | 'undone'`); change_type-CHECK initial allowlist (skal udvides i Steps 2+4+5 når handlers oprettes); FORCE RLS; SELECT `using (is_admin() OR requested_by = current_employee_id())`; audit-trigger
  - Tabel `core_identity.undo_settings(change_type text PK, undo_period_seconds integer, updated_at, updated_by)`; default-rows seeded med 86400 (24h) for hver change_type efter Steps 2+4+5 har deklareret dem
  - RPC'er `pending_change_request`, `pending_change_approve`, `pending_change_undo`, `pending_change_apply` med dispatcher (switch-statement på change_type); dispatcher er tom indtil Steps 2+4+5 registrerer handlers
  - Cron `pending_changes_apply_due` (kører hver minut via pg_cron) + heartbeat-integration per trin 3
  - RPC `undo_setting_update(p_change_type, p_undo_period_seconds)` (direkte, ikke pending)
- **Hvorfor først (V2):** alle senere muterende RPC'er er pending-wrappers (Step 8) eller har interne handlers (Steps 2+4+5) der registrerer i dispatcheren; pending-tabel + cron skal eksistere før handlers kan registreres
- **Risiko:** mellem — dispatcher-mekanikken er central. Mitigation: tests af tom dispatcher + senere af hver registreret handler
- **Rollback:** revert migration; pause cron
- **Tests (`supabase/tests/smoke/t9_pending_changes.sql`):**
  - Smoke: `pending_change_request` med fake change_type fejler validation (ingen handler registreret)
  - Lifecycle: request → approve → vent → cron-apply (efter handlers registreret i Steps 2+4+5 udvides denne test)
  - Undo: request → approve → undo før deadline; verificér status='undone'
  - Konfig: `undo_setting_update` ændrer undo_period; nye changes bruger ny periode

### Step 2 — org_nodes (identity) + org_node_versions (effective-date) + cycle-detection + internal apply-handlers (V4)

- **Migration-fil:** `20260518000001_t9_org_nodes.sql`
- **Hvad:**
  - **V4: Tabel `core_identity.org_nodes(id PK uuid, created_at timestamptz, updated_at timestamptz)`** — identity-only; ingen mutable forretnings-felter direkte. FORCE RLS; SELECT `using (true)`; audit-trigger på opret/slet (sjælden)
  - \*\*V4: Tabel `core_identity.org_node_versions(version_id PK uuid, node_id FK org_nodes, name text NOT NULL, parent_id FK org_nodes NULL, node_type text NOT NULL CHECK IN ('department', 'team'), is_active boolean NOT NULL, effective_from date NOT NULL, effective_to date NULL, applied_at timestamptz NOT NULL DEFAULT now(), created_by_pending_change_id uuid NULL FK pending_changes, created_at timestamptz)`; partial UNIQUE `(node_id) WHERE effective_to IS NULL`; EXCLUDE `(node_id WITH =, daterange(effective_from, coalesce(effective_to, 'infinity'::date)) WITH &&)`; FORCE RLS; SELECT `using (true)`; audit-trigger
  - BEFORE INSERT/UPDATE-trigger på `org_node_versions` for cycle-detection (rekursiv CTE over versions effective at NEW.effective_from) + team-har-børn-blokering (check current versions for at se om denne node_id har børn af type team)
  - Tilføj `org_node_versions` til `AUDIT_EXEMPT_SNAPSHOT_TABLES`-allowlist? **Nej** — versions ER den primære lagring (ikke derived). Bør have audit-trigger som normalt
  - Interne apply-handlers `_apply_org_node_upsert(payload jsonb)` + `_apply_org_node_deactivate(payload jsonb)` — `security definer`, `revoke execute from authenticated`. Logik:
    - `_apply_org_node_upsert(payload)`: hvis NEW knude (id NULL eller findes ikke): INSERT org_nodes(id, created_at, updated_at); INSERT org_node_versions med effective_from = payload.effective_from. Hvis EKSISTERENDE: UPDATE prior open-ended version SET effective_to = payload.effective_from; INSERT ny version med effective_from = payload.effective_from, effective_to = NULL; UPDATE org_nodes.updated_at = now()
    - `_apply_org_node_deactivate(payload)`: samme luk+åbn-pattern; ny version har is_active=false
  - Udvid `pending_changes.change_type`-allowlist med `'org_node_upsert'`, `'org_node_deactivate'`
  - Registrér handlers i dispatcheren (Step 1)
  - Seed `undo_settings`-rows for nye change_types
  - **NB:** ingen public RPC for muterende; den kommer i Step 8 som tynd wrapper
- **Hvorfor:** kræver Step 1 (pending_changes-infrastruktur); alle senere T9-tabeller har FK eller relation til org_nodes
- **Risiko:** mellem (V4 — apply-handler-effective_from-logik kritisk for korrekt versionering). Mitigation: dedikeret test verificerer version-rows korrekte for future-dated, backdated, og same-day apply
- **Rollback:** revert migration; pre-cutover ingen rows
- **Tests (`supabase/tests/smoke/t9_org_nodes.sql`, alle via direct INSERT i tx-rollback med fake pending_changes):**
  - Smoke: opret root + afdeling + team (insertér org_nodes + org_node_versions) + verificér aktuel tree-struktur via SELECT med effective-date-filter
  - Cycle-detect: forsøg INSERT version med parent_id der ville lave cycle → blokeret
  - Team-har-børn-blokering: opret team, forsøg INSERT child version → blokeret
  - is_active=false-blokering: nye versions med parent_id pegende på inactive node → blokeret (current-date-baseret)
  - Audit-trigger fyrer på org_node_versions INSERT/UPDATE/DELETE
  - Interne handlers afvises ved authenticated-kald: `set local role authenticated; SELECT _apply_org_node_upsert('{...}'::jsonb)` → permission denied
  - **V4-test (effective_from-versionering):** UPDATE name via apply-handler med effective_from = '2026-06-01' → ny version med effective_from=2026-06-01, effective_to=NULL; gammel version sat effective_to=2026-06-01. Verificér version_started/version_ended fra payload, IKKE fra now()
  - **V4-test (future-dated):** apply med effective_from = '2026-07-01' (fremtidig); cron skal IKKE apply'e før den dato (verificeres via Step 1's cron-filter). Test: kør cron manuelt → pending forbliver 'approved', ingen org_node_versions-row oprettet
  - **V4-test (backdated):** apply med effective_from = '2026-01-15' (fortid); apply'es umiddelbart efter undo-deadline. Verificér version-row med effective_from=2026-01-15

### Step 3 — org_node_closure + maintain-trigger + audit-exempt-allowlist

- **Migration-fil:** `20260518000001_t9_org_node_closure.sql`
- **Hvad:** Tabel `core_identity.org_node_closure(ancestor_id, descendant_id, depth)` PK(ancestor_id, descendant_id) + INDEX(descendant_id); AFTER-trigger der genberegner berørt subtree (Valg 2); FORCE RLS + `using (true)`; tilføj closure til `AUDIT_EXEMPT_SNAPSHOT_TABLES` i `scripts/fitness.mjs`
- **Hvorfor:** kræver Step 2 (org_nodes)
- **Risiko:** mellem — trigger-korrekthed kritisk. Mitigation: dedikeret consistency-check (Step 13) + tests
- **Rollback:** revert migration + fitness.mjs ændring
- **Tests:**
  - Smoke: bygge 3-niveau-træ; verificér closure har korrekt rows (sum inkl. self)
  - Mutations-konsistens: INSERT/UPDATE/DELETE org_nodes → closure-rebuild korrekt
  - **NB:** helper-tests (`acl_subtree_*`) ligger i Step 7 hvor de oprettes

### Step 4 — employee_node_placements + internal apply-handlers (V2)

- **Migration-fil:** `20260518000002_t9_employee_node_placements.sql`
- **Hvad:**
  - Tabel `core_identity.employee_node_placements(id, employee_id, node_id, effective_from, effective_to, created_at, updated_at)`; FK til employees + org_nodes; partial UNIQUE `(employee_id) WHERE effective_to IS NULL`; EXCLUDE constraint `(employee_id WITH =, daterange(effective_from, coalesce(effective_to, 'infinity'::date)) WITH &&)` (kræver btree_gist); FORCE RLS; SELECT `using (true)`; audit-trigger
  - Interne apply-handlers `_apply_employee_place(payload jsonb)` + `_apply_employee_remove(payload jsonb)` + `_apply_team_close(payload jsonb)` (atomisk: team is_active=false + luk alle åbne employee+client placements); alle `security definer revoke from authenticated`
  - Udvid `pending_changes.change_type`-allowlist med `'employee_place'`, `'employee_remove'`, `'team_close'`; registrér handlers i dispatcher; seed `undo_settings`-rows
- **Hvorfor:** kræver Step 2 (org_nodes) + eksisterende `employees`. Team_close-handler placeres her fordi det rører employee_placements primært
- **Risiko:** mellem — EXCLUDE-constraint via btree_gist; team_close-atomicity
- **Rollback:** revert migration (pre-cutover ingen rows)
- **Tests:**
  - Smoke: placér; flyt; verificér gammel lukket + ny åben (via direct INSERT i tx-rollback)
  - Overlap-blokering: forsøg overlappende placements → blokeret af EXCLUDE
  - Knude-løs gyldig: tom placement-state er gyldig
  - Audit-trigger fyrer ved INSERT/UPDATE/DELETE
  - Interne handlers afvises ved authenticated-kald
  - team_close-handler: atomisk close + luk; rollback ved failure midt i transaction

### Step 5 — client_node_placements (uden client-FK) + internal apply-handlers (V2)

- **Migration-fil:** `20260518000003_t9_client_node_placements.sql`
- **Hvad:**
  - Tabel `core_identity.client_node_placements(id, client_id, node_id, effective_from, effective_to, created_at, updated_at)`; `client_id uuid not null` UDEN FK (jf. Valg 4); FK til org_nodes; partial UNIQUE + EXCLUDE som Step 4; trigger validerer `node_type='team'` på node_id; FORCE RLS; SELECT `using (is_admin())` pre-cutover; audit-trigger
  - Interne apply-handlers `_apply_client_place(payload jsonb)` + `_apply_client_close(payload jsonb)` (begge `security definer revoke from authenticated`)
  - Udvid `pending_changes.change_type`-allowlist med `'client_place'`, `'client_close'`; registrér handlers; seed `undo_settings`-rows
  - client_id på `FK_COVERAGE_EXEMPTIONS` allowlist i `scripts/fitness.mjs`
- **Hvorfor:** kræver Step 2 (org_nodes)
- **Risiko:** lav (ingen client-FK; pre-cutover ingen rows)
- **Rollback:** revert migration + fitness.mjs ændring
- **Tests:** smoke med syntetisk client_id-uuid; overlap-blokering; node_type='team'-check (insert mod afdeling → blokeret); interne handlers afvises ved authenticated-kald

### Step 6 — Permission-elementer (areas/pages/tabs) + direkte CRUD-RPCs

- **Migration-fil:** `20260518000004_t9_permission_elements.sql`
- **Hvad:** Tre tabeller `permission_areas` / `permission_pages` (FK areas) / `permission_tabs` (FK pages); FORCE RLS; SELECT `using (true)`; INSERT/UPDATE/DELETE via direkte RPC'er (ikke pending — krav-dok 4.5 specificerer ikke gældende dato); audit-trigger; RPC'er `permission_area_upsert`, `permission_area_deactivate`, `permission_page_upsert`, `permission_page_deactivate`, `permission_tab_upsert`, `permission_tab_deactivate` (alle med `has_permission`-check)
- **Hvorfor:** uafhængig af tidligere T9-tabeller; placeres her for at gøre Step 7 muligt
- **Risiko:** lav
- **Rollback:** revert migration
- **Tests:**
  - Smoke: opret område → page → tab → verificér FK-kæde
  - is_active=false-blokering: tab kan ikke pege på inactive page (trigger)
  - Audit-spor

### Step 7 — role_permission_grants + helpers + direkte CRUD-RPCs (V2)

- **Migration-fil:** `20260518000005_t9_grants_and_helpers.sql`
- **Hvad:**
  - Tabel `core_identity.role_permission_grants(id, role_id, area_id, page_id, tab_id, can_access, can_write, visibility, ...)`; CHECK at præcis én af area_id/page_id/tab_id er sat; FK til roles + area/page/tab; FORCE RLS; SELECT `using (true)`; audit-trigger
  - Helpers (alle `language sql stable security invoker set search_path = ''`): `acl_subtree_org_nodes(p_employee_id)`, `acl_subtree_employees(p_employee_id)`, `permission_resolve(p_role_id, p_element_type, p_element_id)`, `acl_visibility_check(p_employee_id, p_target_id, p_target_kind, p_visibility)` (V2 — split fra V1's `can_user_see` per Codex MELLEM-fund)
  - Direkte CRUD-RPC'er `role_permission_grant_set` + `role_permission_grant_remove` (ikke pending — krav-dok 4.6 ikke gældende dato)
  - **NB (V2):** `team_close` er flyttet til Step 4's interne handler `_apply_team_close` fordi det er pending-pligtig operation
- **Hvorfor:** kræver Step 3 (closure) + Step 4 (placements) + Step 6 (elements); helpers samles her for at sikre alle source-tabeller eksisterer
- **Risiko:** mellem — helper-korrekthed kritisk for senere forretnings-RPC'er
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
  - `permission_resolve(fm_chef, 'page', operations_page_id)`: arve-aware lookup (tab → page → area → default-deny)
  - Arve-test: tab uden grant arver fra page; page uden grant arver fra area
  - **V2-test:** `acl_visibility_check` returnerer korrekt baseret på visibility-værdi: visibility='self' → kun self; visibility='subtree' → caller's subtree; visibility='all' → altid true
  - **V2-test (composition):** simulering af forretnings-RPC composition — `permission_resolve` finder visibility på (rolle, page); `acl_visibility_check` bruger den visibility-værdi til at filtrere target. Verificér samme target synligt/usynligt afhængigt af forskellig page/tab-grant (Codex V1 MELLEM-test)
  - Visibility-mapping: gammel scope='team' migration → grants-row med visibility='subtree' (verificeret i Step 11)

### Step 8 — Public pending-wrapper RPCs + employee_role-wrappers (V2)

- **Migration-fil:** `20260518000006_t9_public_wrapper_rpcs.sql`
- **Hvad:**
  - **Public pending-wrapper RPCs** (tynde wrappers omkring `pending_change_request`; jf. Beslutning 11 + change-type-matrix i Valg 8):
    - `org_node_upsert(p_id, p_name, p_parent_id, p_node_type, p_is_active, p_effective_from) returns uuid` — opretter pending med change_type='org_node_upsert'; returnerer pending_change.id
    - `org_node_deactivate(p_node_id, p_effective_from)` — change_type='org_node_deactivate'
    - `team_close(p_node_id, p_effective_from)` — change_type='team_close'
    - `employee_place(p_employee_id, p_node_id, p_effective_from)` — change_type='employee_place'
    - `employee_remove_from_node(p_employee_id, p_effective_from)` — change_type='employee_remove'
    - `client_node_place(p_client_id, p_node_id, p_effective_from)` — change_type='client_place'
    - `client_node_close(p_client_id, p_effective_from)` — change_type='client_close'
  - **Employee-role-wrappers** (direkte, ikke pending — jf. Valg 14):
    - `employee_role_assign(p_employee_id, p_role_id)` — kalder trin 5's `employee_upsert` med eksisterende data + ny p_role_id
    - `employee_role_remove(p_employee_id)` — kalder `employee_upsert` med p_role_id=NULL
  - Alle wrapper-RPCs udfører validering før pending-request (fx node_type='team' for client_place, cycle-check for org_node_upsert) og returnerer pending_change.id (eller void for employee_role)
- **Hvorfor:** kræver Step 1 (pending_changes-infrastruktur) + Steps 2+4+5 (interne apply-handlers registreret) + Step 7 (helpers tilgængelige for validering)
- **Risiko:** mellem — wrappers er sikkerheds-grænsen mod authenticated; alle valideringer SKAL ske her, ikke i apply-handlers
- **Rollback:** revert migration
- **Tests (`supabase/tests/smoke/t9_public_wrapper_rpcs.sql`, tx-rollback):**
  - Smoke for hver wrapper: authenticated caller med has_permission → wrapper opretter pending_changes-row; tabel-state ikke muteret før approve+apply
  - Validering: `client_node_place` mod afdelings-knude → fejler i wrapper (før pending)
  - End-to-end: wrapper → request → approve → set effective_from <= current_date → cron apply (eller manuel `pending_change_apply`) → state ændret. **V6:** test verificerer at `pending_change_apply` på due row apply'er; på future-dated row RAISE `not_yet_due` med status='approved' bevaret, ingen state-mutation
  - **V6-test (central apply-gate):** direct manuel `pending_change_apply(future_pending_id)` → exception `not_yet_due`; status forbliver `approved`, `applied_at` forbliver NULL, ingen org_node_versions/placements ændringer. Verificerer at sikkerheds-grænsen for future-dated bor i apply-RPC'en, ikke kun i cron-filter
  - Undo: wrapper → request → approve → undo før deadline → state uændret
  - employee_role_assign/remove: direkte UPDATE af role_id; audit fanger; ingen pending_changes-row oprettet
  - **Auth-verifikation:** authenticated kald til interne `_apply_*`-handlers fejler med permission denied

### Step 9 — Read-RPCs for Hent-funktioner (V2)

- **Migration-fil:** `20260518000007_t9_read_rpcs.sql`
- **Hvad:** Per Valg 13. Dedikerede read-RPCs for alle krav-dok sektion 4 Hent-funktioner:
  - Træ: `org_tree_read()`, `org_tree_read_at(p_date)`
  - Placering: `employee_placement_read(p_emp_id)`, `employee_placement_read_at(p_emp_id, p_date)`
  - Klient: `client_placement_read(p_client_id)`, `client_placement_read_at(p_client_id, p_date)`
  - Permission-elementer: `permission_elements_read()` (hierarkisk struktur)
  - Rettigheder: `role_permissions_read(p_role_id)`
  - Fortrydelse: `pending_changes_read()`
- **Hvorfor:** kræver alle DB-steps + helpers fra Step 7; bygger 1:1-mapping til krav-dok sektion 4
- **Risiko:** lav (read-only)
- **Rollback:** revert migration
- **Tests (`supabase/tests/smoke/t9_read_rpcs.sql`, tx-rollback):**
  - **Aktuel (V3, Beslutning 14):** read-RPC returnerer rows hvor `effective_from <= current_date AND (effective_to IS NULL OR effective_to > current_date)` — undgår future-dated bug
  - Historisk: read_at(p_date) returnerer rows hvor effective_from <= p_date AND (effective_to IS NULL OR effective_to > p_date)
  - **V3-test (Beslutning 14):** future-dated employee_place → current placement-read viser OLD placement indtil effective_from-dato; efter dato viser NEW placement
  - **V3-test (Beslutning 13):** rename + flyt org_node; `org_tree_read_at(før-rename-dato)` returnerer gammelt navn + gammel parent_id via history-row
  - `org_tree_read_at` på dato før Cph Sales blev oprettet → tom array
  - Permission-check: read-RPC afvises hvis `has_permission(<area>, <page>, can_view=true)` returnerer false (ingen leak af struktur uden adgang)

### Step 10 — Migration discovery + extract + upload-scripts for 1.0

- **Filer:** `scripts/migration/t9-org-tree-discovery.{mjs,sql}`, `scripts/migration/t9-org-tree-extract.sql`, `scripts/migration/t9-org-tree-upload.mjs`
- **Hvad:** Per Valg 9. Discovery genererer markdown-rapport. Extract laver CSV/SQL-dump. Upload INSERT'er i 2.0 med `source_type='migration'`
- **Hvorfor:** uafhængig af DB-state; placeres her for at samle alle DB-tabeller før migration-scripts skrives
- **Risiko:** lav (manuel eksekvering)
- **Rollback:** slet scripts
- **Tests:** scripts har `--dry-run` mode; Mathias eksekverer manuelt mod 1.0 når relevant

### Step 11 — Migration af eksisterende role_page_permissions

- **Migration-fil:** `20260518000008_t9_migrate_role_page_permissions.sql`
- **Hvad:** Per Valg 11. Seed areas + pages + tabs + grants baseret på eksisterende `role_page_permissions`-rows. Eksisterende tabel bevares som read-only (FORCE RLS, ingen INSERT/UPDATE-policies). `has_permission()`-helper opdateres til at læse fra `role_permission_grants` med fallback til `role_page_permissions`
- **Hvorfor:** kræver Step 6 (elements) + Step 7 (grants)
- **Risiko:** mellem — kan bryde eksisterende permission-tjek hvis migration er ufuldstændig. Mitigation: `m1_permission_matrix.sql`-smoke-test udvides til at verificere alle eksisterende RPC'er stadig kan permissions-checke via ny helper
- **Rollback:** revert migration; fallback-pattern i `has_permission()` ruller læsning tilbage til gammel tabel
- **Tests:**
  - Migration-idempotens: re-run uden duplikater
  - Mapping: alle 33 eksisterende role_page_permissions-rows er mappet til grants
  - `has_permission()` returnerer identisk resultat for alle eksisterende (role, page, tab)-kombinationer

### Step 12 — Seed Cph Sales + Ejere + Mathias/Kasper + superadmin-grants

- **Migration-fil:** `20260518000009_t9_seed_owners.sql`
- **Hvad:** Per Valg 12. Bootstrap-INSERT'er for root-knude, Ejere-afdeling, placement af mg@ + km@ på Ejere, superadmin-rolle (omdøb fra admin hvis eksisterer), grants med `visibility='all'` på alle areas+pages+tabs. **NB:** Seed kører som migration direkte (ikke gennem pending_changes — bootstrap er ikke "brugerdrevet ændring med gældende dato")
- **Hvorfor:** kræver alle tidligere DB-steps + Step 11 (grants-migrationen)
- **Risiko:** lav (seed; pre-cutover)
- **Rollback:** revert migration
- **Tests:** smoke verificerer Mathias kan querie alt data via superadmin-rolle

### Step 13 — Klassifikation + fitness-checks + dokumentations-opdateringer + cleanup

- **Migration-fil:** `20260518000010_t9_classify.sql`
- **Filer:**
  - `scripts/fitness.mjs` (udvidet)
  - `docs/strategi/bygge-status.md`, `docs/teknisk/permission-matrix.md`, `docs/teknisk/teknisk-gaeld.md`, `docs/coordination/aktiv-plan.md`, `docs/coordination/seneste-rapport.md`
- **Hvad:**
  - INSERT'er i `core_compliance.data_field_definitions` for alle nye T9-kolonner; kategori='operationel' eller 'master_data'; pii_level='none' (jf. krav-dok pkt 10)
  - Nye fitness-checks: `org_node_closure_consistency`, `permission_grant_integrity`, `pending_changes_invariants`, `pending_changes_no_direct_writes` (verificerer at authenticated rolle ikke kan EXECUTE `_apply_*`-handlers), **`org_nodes_no_mutable_columns_in_sql` (V5 — Codex+Claude.ai V4-anbefaling): grep-baseret CI-blocker der scanner `supabase/migrations/**/\*.sql`for referencer til`org_nodes.name`, `org_nodes.parent_id`, `org_nodes.node_type`, `org_nodes.is_active`— fejler hvis fundet. Forhindrer regression til pre-V4 gammel mutable model. Allowlist: migration der dropper`org_nodes`-kolonner (hvis vi havde haft sådan)\*\*
  - bygge-status: trin 9 → ✓ Godkendt; PAUSET-status fjernes; 1M-sales-benchmark-action-item tilføjet (deadline trin 14)
  - permission-matrix: omskrives til den nye tre-niveau-model; auto-generated-marker opdateret
  - teknisk-gaeld: G-numre fra Codex-runder + G-nummer-kandidater for rettelse 23 + CI-blocker 19 kategori-udvidelser + krav-dok-modsigelse 18 vs 25 (Claude.ai V1 KOSMETISK 3) + ENUM-sprog-note (Claude.ai V1 KOSMETISK 4)
  - aktiv-plan: ryd til "ingen aktiv plan" + tilføj T9 til Historisk
  - seneste-rapport: peg på T9-slut-rapport
  - Arkivér krav-dok + plan + plan-feedback til `docs/coordination/arkiv/`
- **Hvorfor:** sidste step; per disciplin-pakke 2026-05-16
- **Risiko:** lav (dokumenter)
- **Rollback:** revert commits

---

## Test-konsekvens

Nye eller ændrede tests:

- `supabase/tests/smoke/t9_pending_changes.sql` (ny, Step 1) — pending_changes-infrastruktur: lifecycle, cron-apply, undo. Udvides løbende når Steps 2+4+5 registrerer handlers. Tx-rollback. Grøn
- `supabase/tests/smoke/t9_org_nodes.sql` — cycle-detect, team-har-børn-blokering, is_active-blokering, audit, interne handlers afvises ved authenticated-kald. Grøn
- `supabase/tests/smoke/t9_org_node_closure.sql` — closure-konsistens efter mutations. Tx-rollback. Grøn
- `supabase/tests/smoke/t9_employee_node_placements.sql` — placering, flyt, knude-løs, EXCLUDE-overlap, audit, team_close-atomicity, authenticated-rolle-afvisning. Tx-rollback. Grøn
- `supabase/tests/smoke/t9_client_node_placements.sql` — uden client FK; node_type='team'-check; overlap; authenticated-afvisning. Tx-rollback. Grøn
- `supabase/tests/smoke/t9_permission_elements.sql` — areas/pages/tabs CRUD; FK-kæde; is_active-blokering. Grøn
- `supabase/tests/smoke/t9_grants_and_helpers.sql` (V2) — alle helpers + `acl_visibility_check` + `permission_resolve` arve-logik; composition-test (samme target synligt/usynligt afhængigt af page/tab-grant — Codex MELLEM-test). Tx-rollback. Grøn
- `supabase/tests/smoke/t9_public_wrapper_rpcs.sql` (V2, ny — Step 8) — alle pending-wrappers: validering før pending; pending-row oprettet uden state-mutation; end-to-end request→approve→apply; undo før deadline; interne `_apply_*`-handlers afvises ved authenticated. Tx-rollback. Grøn
- `supabase/tests/smoke/t9_read_rpcs.sql` (V2, ny — Step 9) — alle Hent-RPCs: aktuel + historisk; permission-check afviser uden has_permission. Tx-rollback. Grøn
- `supabase/tests/smoke/t9_migration_role_page_permissions.sql` (ny, Step 11) — migration mapper alle eksisterende rows; `has_permission()` returnerer identisk resultat før/efter
- `supabase/tests/smoke/m1_permission_matrix.sql` (eksisterende, opdateres i Step 11) — verificerer alle 33 eksisterende RPC'er stadig permissions-checker korrekt via ny model

Fitness-checks:

- `org_node_closure_consistency` (ny) — closure matcher tree
- `permission_grant_integrity` (ny) — grants peger på existerende + ikke-deaktiverede elementer
- `pending_changes_invariants` (ny) — status-livscyklus konsistent (approved før applied; applied har applied_at; undone har undone_at; undo_deadline > approved_at)
- `pending_changes_no_direct_writes` (ny V2; udvidet V3 til pending*change_request) — verificerer at authenticated rolle ikke har EXECUTE-grant på `\_apply*\*`-handlers eller `pending_change_request`; CI-blocker fanger hvis grant utilsigtet tilføjes
- `org_nodes_no_mutable_columns_in_sql` (ny V5) — grep-baseret CI-blocker; scanner `supabase/migrations/**/*.sql` for `org_nodes.name`, `org_nodes.parent_id`, `org_nodes.node_type`, `org_nodes.is_active`. Fejler hvis nogen findes uden for migration der dropper kolonnen. Forhindrer regression til pre-V4 gammel mutable model. Per Codex V4 + Claude.ai V4 anbefaling
- `db-test-tx-wrap-on-immutable-insert` (eksisterende) — verificeret for nye tests
- `audit-trigger-coverage` (eksisterende) — verificerer closure på allowlist; alle andre T9-tabeller har trigger
- `fk-coverage` (eksisterende, CI-blocker 19) — verificerer `client_id` på allowlist med begrundelse

---

## Risiko + kompensation

| Migration / Step               | Værste-case                                                                                                          | Sandsynlighed       | Rollback                                                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Step 1 pending_changes (V2)    | Apply-dispatcher buggy; ændringer hænger i 'approved' eller applies forkert                                          | mellem              | hver handler test'es separat ved registrering; apply er idempotent; pause cron                                     |
| Step 1 cron                    | Cron pauser eller fejler; ændringer hænger i 'approved'                                                              | lav                 | manuel apply-RPC; heartbeat-fitness fanger cron-failure                                                            |
| Step 2 org_nodes               | Cycle-detect-trigger har bug; producerer falsk-negativ                                                               | lav                 | revert migration; pre-cutover ingen rows                                                                           |
| Step 3 closure                 | Maintain-trigger rebuild forkert; helpers får forkert data                                                           | mellem              | revert + fitness-consistency-check fanger inden cutover                                                            |
| Step 4 placements + team_close | EXCLUDE-constraint accepterer overlap; team_close-handler ikke atomisk                                               | mellem              | revert; SQL-tests bekræfter rollback ved failure i tx-wrap                                                         |
| Step 5 client_placements       | client_id uden FK accepterer invalid uuid                                                                            | lav                 | trin 10 FK-add fanger ved ALTER; pre-cutover ingen rows                                                            |
| Step 6 elements                | FK-kæde brudt; tabs uden valid page                                                                                  | lav                 | revert; pre-cutover ingen seedet data                                                                              |
| Step 7 grants + helpers        | acl_subtree_employees / acl_visibility_check returnerer forkert sæt                                                  | mellem              | revert; authenticated-rolle-fixture-tests fanger inden cutover                                                     |
| Step 8 wrappers (V2)           | Wrapper springer validering over; pending-row med invalid payload                                                    | mellem              | apply-handler re-validerer; idempotency catch                                                                      |
| Step 8 auth-grænse (V2+V3)     | Authenticated rolle kan kalde intern `_apply_*`-handler eller `pending_change_request` direkte                       | KRITISK hvis muligt | `pending_changes_no_direct_writes`-fitness-check fanger (V3 udvidet til pending_change_request); CI-blocker        |
| Step 2 versions-apply (V4)     | Apply-handler skriver forkert effective_from til version (fx now() i stedet for payload.effective_from)              | mellem              | dedikeret test pr. timing-type (future/backdated/same-day); fitness-check `org_node_versions_effective_from_match` |
| Step 1 cron-filter (V4)        | Cron-filter mangler `effective_from <= current_date`-clause; future-dated changes apply'es for tidligt               | mellem              | fitness-check verificerer apply kun sker når begge clauses er sande                                                |
| Step 9 read-RPCs current (V3)  | "Aktiv placement"-filter mangler `effective_from <= current_date`-clause → future-dated rows returneres som aktuelle | mellem              | grep-fitness-check sikrer alle current-state-reads bruger den fulde clause                                         |
| Step 9 read-RPCs (V2)          | Read-RPC eksponerer rows uden permission-check                                                                       | lav                 | revert; `has_permission`-check ved RPC-indgang                                                                     |
| Step 11 migration              | Eksisterende permission-tjek brudt efter migration                                                                   | mellem              | fallback i `has_permission()` til gammel tabel; m1-smoke-test fanger inden CI                                      |
| Step 12 seed                   | Eksisterende admin-rolle ikke korrekt omdøbt; floor-trigger bryder                                                   | mellem              | revert seed; trin-1-bootstrap er uberørt                                                                           |
| Step 13 classify               | Migration-gate fejler på manglende kolonner                                                                          | lav                 | tilføj manglende entries i samme commit                                                                            |

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
- `docs/teknisk/teknisk-gaeld.md` → tilføj G-nummer-kandidater fra Valg 3 (rettelse 23-udvidelse) + Valg 4 (allowlist-kategori) + Claude.ai V1 KOSMETISK 3 (krav-dok-modsigelse afgørelse 18 vs 25 — Mathias-præcisering af tekst) + Claude.ai V1 KOSMETISK 4 (ENUM-sprog: engelsk i kode, dansk i UI — dokumenteret som bevidst valg) + Valg 14 (rolle-tildeling som potentielt pending-pligtig i senere pakke); tilføj G-nummer for `role_page_permissions`-drop i senere pakke; tilføj G-nummer for full undo-mekanisme (hvis applied-undo afvises i T9-scope)
- `docs/coordination/mathias-afgoerelser.md` → ingen ny entry forventet (T9 implementerer eksisterende rammebeslutninger). Hvis benchmark-fund eller andet kræver ny afgørelse: ny entry med G-nummer som plan-reference

**Reference-konsekvenser** (ingen omdøbninger/flytninger i T9):

- Ingen filer omdøbes eller flyttes (ud over arkivering af arbejds-artefakter)
- Grep-tjek post-pakke:
  - `grep -r "T9-krav-og-data\|T9-plan" docs/` returnerer kun arkiv + rapport-historik + slut-rapporten selv
  - `grep -r "PAUSET" docs/strategi/bygge-status.md` returnerer 0 hits
  - `grep -r "role_page_permissions" supabase/` returnerer kun (a) fallback-reference i `has_permission()`, (b) m1-smoke-test, (c) migration-fil. Nye konsumenter bruger `role_permission_grants`

**Ansvar:** Code udfører oprydning + opdatering som del af build-PR (Step 13 i implementations-rækkefølgen, V2-numbering), ikke som separat trin. Slut-rapporten verificerer udførelse i "Oprydning + opdatering udført"-sektion. Manglende udførelse = KRITISK feedback fra reviewere (per krav-dok 12.3).

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

V6-planen er **narrow apply-gate-fix** af V5's Beslutning 15 efter Codex V5 KRITISK. Sikkerheds-grænsen for "ikke materialiser future-dated" sidder nu i `pending_change_apply`-RPC'en (central gate), ikke kun i cron-filter (selection). Manuel/admin direct call afvises via samme gate. Beslutning 7 + Beslutning 15 + Valg 8 + Step 8-test opdateret konsistent. Claude.ai V5's 3 KOSMETISKE observationer (step-reference, test-tekst-præcision, test-fil-navn) håndteret eller dokumenteret som accepteret.

V6 bevarer V5's konsistens-sweep og V4's effective-date-arkitektur uændret. Anti-glid runde 3+-status: 5. iteration; narrow fix, ikke arkitektur-ændring. Hvis V6 igen får KRITISK fund: STOP + rapportér til Mathias.

V5-planen var **systematisk sweep** af V4's nye arkitektur gennem hele planen (historik):

V5-sweep:

- **Beslutning 1, 2:** opdateret til identity+versions-split med trigger på versions
- **Valg 1's tabel-liste:** `org_nodes` reduceret til (id, created_at, updated_at)
- **Valg 2:** trigger og cycle-detect flyttet fra org_nodes til `org_node_versions`
- **Valg 12 (seed):** opretter både identity-row og version-row med effective_from
- **Valg 13's `org_tree_read()`:** rewritten som `org_tree_read_at(current_date)`-pattern via recursive CTE
- **Mathias-mapping pkt 1, 2, 6, 10:** refererer nu `org_node_versions` for mutable felter
- **Nyt fitness-check `org_nodes_no_mutable_columns_in_sql`:** grep-baseret CI-blocker mod regression

V5 bevarer V4's centrale arkitektur (Beslutning 13 + 14 + 15 uændrede) — kun sweep af inkonsistens.

V4-planen adresserede Codex V3's 1 KRITISKE fund + Claude.ai's V2-tilbagetrækning til KRITISK (samme problem-klasse: temporal model skal versioneres på business effective_from, ikke fysisk apply-tid). V4-ændringer (historik):

- **Codex V3 KRITISK + Claude.ai V2-KRITISK (effective-date-versionering):** `org_nodes` bliver identity-only; `org_node_versions` er primær mutable lagring med `effective_from`/`effective_to` (renamed fra V3's history). Apply-handler skriver version-boundary fra `pending.effective_from`, ikke `now()`. Cron-filter: apply venter på BÅDE `undo_deadline <= now()` AND `effective_from <= current_date`. Closure-tabel rebuilds når versions effektive på current_date ændres — repræsenterer aldrig future-dated structure. `org_tree_read()` og `org_tree_read_at(p_date)` bruger samme effective-date filter symmetrisk. Beslutning 13 (opdateret) + ny Beslutning 15

V4 bevarer V3's solide lukninger:

V3-planen adresserede Codex V2's 2 KRITISKE fund + Claude.ai V2's MELLEM-finding (intern V2-inkonsistens). V3-ændringer (historik):

- **Codex V2 KRITISK 1 (pending_change_request bypass):** Beslutning 12 gør `pending_change_request` INTERN; `revoke execute from authenticated`. Public wrappers er SECURITY DEFINER og er ENESTE indgang
- **Codex V2 KRITISK 2a (aktiv-placement-definition):** Beslutning 14 etablerer entydig definition `effective_from <= current_date AND (effective_to IS NULL OR effective_to > current_date)` overalt — håndterer future-dated changes korrekt
- **Codex V2 KRITISK 2b + Claude.ai V2 Finding 1 (org_nodes versionering):** Beslutning 13 introducerer `org_node_history`-tabel + AFTER UPDATE-trigger. `org_tree_read_at(p_date)` rekonstruerer historisk-træ korrekt via join mellem history + current. Eliminerer V2's inkonsistens mellem Valg 8 og Valg 13

V3 bevarer V2's solide elementer:

V2-planen adresserede V1's 5 fund (Codex 2 KRITISKE + 1 MELLEM; Claude.ai 2 MELLEM) og dokumenterede 2 kosmetiske G-nummer-kandidater. V2-ændringer (historik):

- **Codex KRITISK 1+2 (skrivevej-konflikt + change_type-matrix):** Beslutning 11 etablerer pending_changes som eneste skrivevej for tids-baserede ændringer. Komplet change-type-matrix i Valg 8 lister alle 7 pending-pligtige operationer. Step-rækkefølge re-orderet: pending_changes-infrastruktur til Step 1; interne apply-handlers i Steps 2+4+5; public pending-wrappers samlet i Step 8
- **Codex MELLEM (can_user_see-signatur):** Helper splittet i `acl_visibility_check` (visibility-only) + `permission_resolve` (permission-only); forretnings-RPC composer separat
- **Claude.ai MELLEM 1 (Hent-funktioner):** Nyt Step 9 + Valg 13 leverer dedikerede read-RPCs for alle 9 Hent-funktioner fra krav-dok sektion 4, særligt historiske
- **Claude.ai MELLEM 2 (rolle-til-medarbejder):** Valg 14 verificerer trin 5's `employee_upsert` dækker Tildel/Skift/Fjern; tynde wrappers `employee_role_assign/remove` tilføjet for klarhed
- **Claude.ai KOSMETISK 3+4:** Dokumenteret som G-nummer-kandidater i oprydnings-strategi; ikke plan-blokerende

V2 bevarer V1's solide elementer:

- Alle 9 funktions-grupper fra krav-dok sektion 4 dækket med konkret implementations-vej (Steps 1-13 — udvidet fra 12)
- Alle 14 tekniske valg har eksplicit anbefaling + begrundelse + alternativ-argumentation (udvidet med Valg 13+14)
- Alle 32 Mathias-afgørelser fra krav-dok sektion 10 mappet til konkrete plan-elementer
- Alle fire forretnings-dokumenter konsulteret med konkrete referencer
- RLS-rekursion undgået via beslutning 8 (synlighed i RPC-lag) — lærdom fra arkiveret V1-V3-runde
- Modsigelses-disciplin respekteret: ingen modsigelser identificeret
- Codex-opgraderings-rolle anerkendt: OPGRADERING-forslag håndteres i V<n+1>'s "Opgraderings-håndtering"-sektion. Codex leverede INGEN OPGRADERING-fund i V1

**Codex' V1+V2+V3+V4+V5-fund alle adresseret. Claude.ai's V1 + V2-tilbagetrækning + V4 alle adresseret; V5-approval bevares (KOSMETISKE er addresseret som notater). Plan klar til V6-review.** V5-feedback (Codex KRITISK + Claude.ai KOSMETISKE) gælder IKKE V6 fordi V6 har narrow apply-gate-fix; ny review kræves. Anti-glid runde 3+-disciplin: kun KRITISKE fund stopper. Hvis V6 stadig får KRITISK fund: STOP og rapportér til Mathias (5. KRITISK-iteration vil signalere at planen kræver fundamental re-tænkning eller scope-revision).

- Oprydnings-strategi er obligatorisk og dokumenteret som DEL af build

Klar til Codex-review V1 (kode-validering + opgraderings-forslag) + Claude.ai-review V1 (forretnings-dokument-konsistens) parallelt.
