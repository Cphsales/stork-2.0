# T9-supplement-2 — Plan V10

**Pakke-type:** Stor opfølgnings-pakke. Implementerer krav-dok `docs/coordination/t9-supplement-2-krav-og-data.md` med fire forretnings-leverancer (G059 + G057 + approve-disciplin pr. handling + handlings-granularitet).
**Forudsætning:** T9-fundament + T9-supplement + trin 10 merget. Mathias-afgoerelser 2026-05-21 ramme-entries (PR #67 + PR #71) på main.

---

## Kode-fund-håndtering (fra Codex V9)

Codex V9-review leverede 2 TEKNISK-BLOKERING. Begge ADRESSERET i V10.

- **KODE-FUND V9-1 (TEKNISK-BLOKERING — `permission_actions` mangler no-dedup-key-kommentar):** `scripts/fitness.mjs` kræver `dedup_key` ELLER `-- no-dedup-key: <reason>`-kommentar på nye CREATE TABLEs. **ADRESSERET** i M3: tilføjet `-- no-dedup-key: konfig-tabel; natural key er (tab_id, name) sikret via unique index nedenfor` før CREATE TABLE.
- **KODE-FUND V9-2 (TEKNISK-BLOKERING — klassifikations-INSERTs mangler ON CONFLICT):** `data_field_definitions` er bootstrap-config; replay/idempotence-check blokerer uden ON CONFLICT. **ADRESSERET** i M3 + M4: tilføjet `on conflict (table_schema, table_name, column_name) do nothing` på begge INSERT-statements.

---

## Kode-fund-håndtering (fra Codex V8)

Codex V8-review leverede 2 TEKNISK-BLOKERING. Begge ADRESSERET i V9.

- **KODE-FUND V8-1 (TEKNISK-BLOKERING — M1b filnavn bryder fitness-regel):** `20260521100000a_...` matcher ikke `^\d{14}_...$`. CI-blocker under `pnpm fitness`. **ADRESSERET** i V9: M1b renummeret til `20260521100001_...`; M2-M6 skubbet én op (`100002` til `100006`).

- **KODE-FUND V8-2 (TEKNISK-BLOKERING — nye kolonner mangler klassifikation):** M3/M4 opretter 13 nye kolonner (`permission_actions` 11 stk + `role_permission_grants.action_id` + `pending_changes.action_id`) uden `data_field_definitions`-inserts. CI-blocker under `MIGRATION_GATE_STRICT=true pnpm migration:check`. **ADRESSERET** i V9: M3 og M4 udvidet med klassifikations-INSERT-blokke (kategori='konfiguration' for permission_actions; 'audit' for action_id-foreign keys; pii_level='none'; retention_type='time_based' med 7 år; matcher T9 step 13-mønster fra `20260518000011_t9_classify.sql`).

---

## Kode-fund-håndtering (fra Codex V7)

Codex V7-review leverede 1 KRITISK + 1 G-nummer-kandidat. Begge afslørede et SYSTEMISK arkitektur-issue. Mathias-afgørelse 2026-05-22: udvid pakke-scope til at fixe alle berørte RPCs.

- **KODE-FUND V7-1 (KRITISK — manglende grant til authenticated på 5 G059-wrappers):** Codex flaggede at `org_node_upsert`, `org_node_deactivate`, `team_close`, `employee_place`, `employee_remove_from_node` har `revoke execute ... from public, anon` uden `grant execute ... to authenticated` (linje 44, 63, 91, 115, 137 i `20260518000007`). Authenticated brugere kan ikke kalde wrappers via REST API trods session-var-fix. **ADRESSERET** i M1 (udvidet V8): tilføj grants til alle 5 wrappers.

- **KODE-FUND V7-2 (G-nummer-kandidat — samme issue på T10-client-wrappers):** `client_node_place` + `client_node_close` (linje 97, 131 i `20260521000008`) har samme mønster. **ADRESSERET** i M1 (udvidet V8): tilføj grants til de 2 T10-client-wrappers (konsistens-fix).

- **Systemisk recon-fund (Code):** T9-fundament-supplement har 11 RPCs med samme issue: `pending_change_approve` (V6-fundet), `pending_change_undo`, `undo_setting_update`, `permission_area_upsert`, `permission_area_deactivate`, `permission_page_upsert`, `permission_page_deactivate`, `permission_tab_upsert`, `permission_tab_deactivate`, `role_permission_grant_set`, `role_permission_grant_remove`. Mathias-afgørelse 2026-05-22: fix alle som del af denne pakke. **ADRESSERET** i ny Step M1b (konsolideret grants-fix-migration).

---

## Kode-fund-håndtering (fra Codex V6)

Codex V6-review leverede 1 KRITISK. ADRESSERET i V7.

- **KODE-FUND V6-1 (KRITISK — `pending_change_approve` mangler explicit grant):** Codex flaggede at eksisterende migration kun har `revoke execute ... from public, anon` uden eksplicit `grant execute ... to authenticated`. Min V3-V6-tekst hævdede "existing grant verificeret" hvilket var FORKERT — ingen explicit grant fandtes. Konsekvens: authenticated approvere kan ikke kalde RPC'en via normal API. **ADRESSERET** i M5: tilføjet `grant execute on function core_identity.pending_change_approve(uuid) to authenticated;`. KODE-FUND V2-2-tekst korrigeret.

---

## Kode-fund-håndtering (fra Codex V5)

Codex V5-review leverede 1 KRITISK-SIKKERHEDSHUL (stale-tekst-modsigelse). ADRESSERET i V6.

- **KODE-FUND V5-1 (KRITISK-SIKKERHEDSHUL — M5 stale-tekst modsiger V5-koden):** Codex flaggede at SQL-blokken i M5 var korrekt fixed i V5, men beskrivelses-teksten "Drop self-approve-blok", "action_id IS NULL → tillad alle med can_edit", og "Self-approve-blok er FJERNET" var ikke opdateret. Risiko: build-fasen kan følge stale tekst og genintroducere V4-hullet. **ADRESSERET** i V6: opdateret M5-beskrivelse, kode-kommentar-blok og Vigtigt-noten så de matcher V5-SQL-koden.

---

## Kode-fund-håndtering (fra Codex V4)

Codex V4-review leverede 1 KRITISK-SIKKERHEDSHUL. ADRESSERET i V5.

- **KODE-FUND V4-1 (KRITISK-SIKKERHEDSHUL — `action_id IS NULL` åbner non-admin self-approve):** Codex flaggede at M5 fjerner self-approve-blok men lader legacy-flow (`action_id IS NULL`) gå uden ekstra tjek. Konsekvens: non-admin requester kan oprette wrapper-pending (alle real T9-wrappers, da actions ikke seedes per krav-dok §4) og approve egen pending — REGRESSION fra eksisterende disciplin (`20260518100000:224`). **ADRESSERET** i M5: bevar self-approve-forbud for `action_id IS NULL`. Default selv-approve tillades KUN når action eksisterer og `requires_second_approver=false`. Legacy-disciplin bevares uændret indtil senere pakke seeder actions + udvider wrappers.

  Per krav-dok §2.5: "Default-regel: Bruger med can_write=true på page/tab kan udføre handlingen direkte... Den nuværende fastlåste blokering af selv-approve for ikke-admin er forkert som default og fjernes." Denne "fjernes" gælder under action-baseret konfig — ikke for legacy-flow. V5 respekterer begge dele: action-konfigurerede pendings følger §2.5's nye regel; legacy pendings (action_id NULL) bevarer eksisterende disciplin indtil action-seed-pakke aktiverer dem.

---

## Kode-fund-håndtering (fra Codex V3 + Code recon)

Codex V3-review leverede 1 KRITISK-SIKKERHEDSHUL. Plus Code's egen udvidede recon afslørede yderligere konsekvens-opdaterings-mangler. Alle ADRESSERET i V4.

- **KODE-FUND V3-1 (KRITISK-SIKKERHEDSHUL — `undo_deadline=NULL` blokerer ikke undo):** Codex flaggede at `pending_change_undo` tjekker `if undo_deadline <= now()` — ved NULL evaluerer det til NULL (ikke true), så undo gennemføres alligevel. Plus: `pending_change_apply` selection-filter (cron) bruger `undo_deadline <= now()` der ekskluderer NULL-rows fra cron-selection (men direkte `pending_change_apply`-kald har `if undo_deadline > now()`-check der ved NULL evaluerer false → apply gennemføres). Inkonsistens på to lag. **ADRESSERET** i M5: erstat `undo_deadline=NULL` for `has_undo=false` med `undo_deadline=now()` (nul-sekund undo-vindue). Dette:
  - `pending_change_undo`-tjek: `now() <= now()` = true → raiser `undo_deadline_expired` → undo afvises ✓
  - Cron-selection: `now() <= now()` = true → row inkluderes → cron applier umiddelbart ✓
  - Direkte `pending_change_apply`: `now() > now()` = false → apply gennemføres ✓
  - DB CHECK-constraint `applied_at is null or undo_deadline <= applied_at`: opfyldt (applied_at sættes ≥ now()) ✓

- **KODE-FUND V3-2 (Code recon — `role_permissions_read` mangler action-grenen):** `role_permissions_read(uuid)` i `20260520000000_t9_supplement.sql:749-786` returnerer UNION ALL over area/page/tab. Når M3 udvider `role_permission_grants` med `action_id`-felt, mangler RPC'en at returnere action-grants. **ADRESSERET** i M3: tilføj action-gren til `role_permissions_read` med JOIN på `permission_actions`-tabel.

- **KODE-FUND V3-3 (Code recon — `pending_change_self_approve_forbidden` defineret 2 steder):** Blokken findes i original `20260518000000:196` og override `20260518100000:225`. M5's CREATE OR REPLACE skriver kun seneste version (T9-fundament-supplement). Ingen problem — Postgres bruger seneste definition. **NOTERET** for klarhed.

- **KODE-FUND V3-4 (Code recon — regression-tjek for `m1_permission_matrix.sql`):** Smoke-testen `m1_permission_matrix.sql` tjekker grant-modellen for superadmin (UNION over area/page/tab-grants). Når M3 udvider grants med action_id, kan testen fortsætte fungere (eksisterende grants har action_id=NULL, ekskluderes ikke). **NOTERET** — eksisterende test passer uændret; ingen V4-ændring nødvendig, men M3 risiko-rad opdateres med regression-tjek-bekræftelse.

---

## Kode-fund-håndtering (fra Codex V2)

Codex V2-review leverede 1 TEKNISK-BLOKERING + 1 KRITISK. Begge ADRESSERET i V3.

- **KODE-FUND V2-1 (TEKNISK-BLOKERING — PL/pgSQL `declare` midt i body i M5):** Codex flaggede at `declare v_has_undo boolean := true;` placeret efter `begin` i `pending_change_approve` ikke er valid PL/pgSQL (kræver top-level declare eller nested block). **ADRESSERET** i M5: `v_has_undo boolean` flyttet til top-level `declare`-sektion sammen med `v_change`, `v_approver`, m.fl. Initialization (default true for legacy) sker i body via `v_has_undo := true;` før evaluering. Se opdateret M5 nedenfor.

- **KODE-FUND V2-2 (KRITISK — manglende `grant execute to authenticated` på 3 nye write-RPC'er):** Codex flaggede at `permission_action_upsert`, `permission_action_deactivate`, `permission_action_set_approver_type` kun har `revoke ... from public, anon` uden eksplicit grant til authenticated. **ADRESSERET** i M6: tilføjet `grant execute on function ... to authenticated` for alle 3 RPC'er. `role_permission_grant_set` får også eksplicit grant tilføjet. `pending_change_approve` (M5) blev oprindeligt antaget at have existing grant — V7 (Codex V6 fund) korrigerer dette: eksisterende migration havde KUN revoke uden grant; V7 tilføjer eksplicit grant.

---

## Kode-fund-håndtering (fra Codex V1)

Codex V1-review (`docs/coordination/codex-reviews/2026-05-21-t9-supplement-2-runde-1.md`) leverede 4 KRITISK + 1 MELLEM + 1 G-nummer-kandidat. Håndtering pr. fund:

- **KODE-FUND 1 (KRITISK — `pending_changes.action_id` får kun consumer, ingen producer):** Codex flaggede at wrappers og `pending_change_request` ikke sætter `action_id`, så approve-disciplin aldrig aktiveres i real-flow. **AFVIST som ved design.** Krav-dok §4 specificerer eksplicit: "Konkrete actions-seed for eksisterende handlinger. Pakken bygger rammen; UI eller separat pakke fylder konkrete handlinger ind." Pakken leverer infrastrukturen; aktivering pr. T9-wrapper kommer i en senere pakke (action-seed + wrapper-udvidelse til at sende `p_action_id`). Smoke-tests T3 bruger fixture-actions for at validere disciplinens flow. M5's `pending_change_approve` behandler `action_id IS NULL` som legacy-flow (eksisterende `can_edit`-baseret approve uændret). V2 gør dette eksplicit i M5-Step + Konklusion.

- **KODE-FUND 2 (KRITISK — `has_permission_action` falder tilbage til tab via `permission_resolve('action')`):** Codex flaggede at M3's `permission_resolve('action', id)`-fallback bryder additive-modellen. **ADRESSERET** i M4: `has_permission_action` slår direkte op i `role_permission_grants` på `action_id` UDEN at gå via `permission_resolve`. Manglende action-grant → false. M3's `permission_resolve('action')`-fallback bevares for OTHER callers (intet brud på arve-aware lookup-kontrakt), men `has_permission_action` bypasser den. Se opdateret M4 nedenfor.

- **KODE-FUND 3 (KRITISK — `has_undo` håndhæves ikke; `undo_deadline` sættes altid):** Codex flaggede at M5's `pending_change_approve` sætter `undo_deadline` uafhængigt af action's `has_undo`-flag. **ADRESSERET** i M5: når `action_id IS NOT NULL`, evalueres `has_undo`. Hvis `has_undo=false` sættes `undo_deadline=NULL` (undo blokeres automatisk af eksisterende `pending_change_undo`-tjek `undo_deadline > now()`). T3 case A7 udvides til at teste BÅDE positiv has_undo (undo virker) OG negativ has_undo (undo afvises). Se opdateret M5 nedenfor.

- **KODE-FUND 4 (KRITISK — backdated guards som disciplin-hul på write-veje):** Codex flaggede at M1/T1 dækker date-baserede wrapper-write-veje uden backdated-vagter. **AFVIST som ved design.** Krav-dok §4 eksplicit out-of-scope: "tilbageskuende-dato-validering på handlings-veje" håndteres separat. Smoke-tests T1 bruger `current_date` eller fremtidige datoer for `effective_from`. Backdated-flow er en separat pakke (G-nummer-kandidat hvis ikke allerede registreret).

- **KODE-FUND 5 (MELLEM — T4 tester direct INSERT, ikke UI-RPC-flow):** Codex flaggede at `permission_action_upsert/deactivate/set_approver_type` ikke testes via RPC. **ADRESSERET** i T4 udvidet med RPC-flow-cases (H9-H11 nedenfor).

- **KODE-FUND 6 (G-nummer-kandidat — `pending_change_eligible_approvers` returnerer kun superadmins for legacy):** Codex flaggede misvisende kontrakt. **DEFER** som G-nummer-kandidat; kontrakt-justering kommer i UI-pakke når reelle approver-lister bruges. M6's nuværende implementation bevares.

---

## Verificerede afhængigheder

| Afhængighed                                                                                                            | Verificeret fra (file:linje)                                                      | Note (signatur, return-type, invariant)                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core_identity.org_node_upsert(uuid, text, uuid, text, boolean, date) → uuid`                                          | `supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:9-43`              | SECURITY DEFINER. Mangler session-var FØR `pending_change_request`. G059.                                                                          |
| `core_identity.org_node_deactivate(uuid, date) → uuid`                                                                 | `supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:47-62`             | SECURITY DEFINER. Mangler session-var. G059.                                                                                                       |
| `core_identity.team_close(uuid, date) → uuid`                                                                          | `supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:66-91`             | SECURITY DEFINER. Pre-check node_type='team' (linje 76-83). Mangler session-var. G059.                                                             |
| `core_identity.employee_place(uuid, uuid, date) → uuid`                                                                | `supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:94-114`            | SECURITY DEFINER. Mangler session-var. G059.                                                                                                       |
| `core_identity.employee_remove_from_node(uuid, date) → uuid`                                                           | `supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:118-136`           | SECURITY DEFINER. Mangler session-var. G059.                                                                                                       |
| `core_identity.client_node_place(uuid, uuid, date) → uuid`                                                             | `supabase/migrations/20260521000008_t10_client_active_check.sql:50-95`            | SECURITY DEFINER. T10.7b-version har session-var allerede.                                                                                         |
| `core_identity.client_node_close(uuid, date) → uuid`                                                                   | `supabase/migrations/20260521000008_t10_client_active_check.sql:102-129`          | SECURITY DEFINER. T10.7b-version har session-var allerede.                                                                                         |
| `core_identity._apply_client_place(jsonb, uuid)`                                                                       | `supabase/migrations/20260521000008_t10_client_active_check.sql:134-228`          | T10.7b-version. Team-aktiv-check linje 159-167 UDEN bypass. Klient-aktiv-bypass etableret. G057.                                                   |
| `core_identity._apply_team_close(jsonb, uuid)`                                                                         | `supabase/migrations/20260520000000_t9_supplement.sql:557-640`                    | Linje 598-601 raiser `team_close_already_inactive` UDEN bypass. Strukturel vagt `team_close_not_team` (linje 593-595) bevares uden bypass. G057.   |
| `core_identity.is_admin_by_employee_id(uuid) → boolean`                                                                | `supabase/migrations/20260521000008_t10_client_active_check.sql:25-40`            | SQL STABLE SECURITY INVOKER. Genbruges i `_apply_team_close`-bypass.                                                                               |
| `pending_changes_insert` policy                                                                                        | `supabase/migrations/20260518100000_t9_fundament_supplement.sql:49-51`            | INSERT-policy kræver `stork.t9_write_authorized='true'`.                                                                                           |
| `pending_change_approve(uuid)`                                                                                         | `supabase/migrations/20260518100000_t9_fundament_supplement.sql:170-250`          | SECURITY INVOKER. Self-approve-blok linje 222-227. Dispatcher (change_type → page_key) linje 204-217.                                              |
| `pending_change_undo(uuid)`                                                                                            | `supabase/migrations/20260518100000_t9_fundament_supplement.sql:257-319`          | SECURITY INVOKER. Tjekker `undo_deadline > now()` linje 283-287.                                                                                   |
| `pending_change_request(text, uuid, jsonb, date) → uuid`                                                               | (kaldet af alle wrappers)                                                         | INSERT i `pending_changes` — rammer `pending_changes_insert` policy.                                                                               |
| `core_identity.role_permission_grants`-tabel                                                                           | `supabase/migrations/20260518000006_t9_grants_and_helpers.sql:6-25`               | Schema: id, role_id, area_id, page_id, tab_id, can_access, can_write, visibility. CHECK præcis ét af (area/page/tab). UNIQUE pr. (role × element). |
| `core_identity.permission_resolve(role_id, element_type, element_id) → (can_access, can_write, visibility)`            | `supabase/migrations/20260518000006_t9_grants_and_helpers.sql:77-141`             | Arve-aware lookup: tab → page → area → default-deny.                                                                                               |
| `core_identity.has_permission(page_key, tab_key, can_edit) → boolean`                                                  | `supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:147-216` | STABLE SECURITY INVOKER. Resolve via grants (tab → page → area) + legacy fallback.                                                                 |
| `core_identity.role_permission_grant_set(role_id, element_type, element_id, can_access, can_write, visibility) → uuid` | `supabase/migrations/20260518000006_t9_grants_and_helpers.sql:180-221`            | SECURITY INVOKER. Element-type CHECK: area/page/tab. UI-write-RPC for grants.                                                                      |
| `core_identity.permission_pages` + `core_identity.permission_tabs`                                                     | T9 step 6 (`20260518000005_t9_permission_elements.sql`)                           | Tabeller for permission-hierarki. Tabs har `page_id`-FK.                                                                                           |
| `core_identity.acl_subtree_org_nodes(employee_id) → uuid[]`                                                            | `supabase/migrations/20260518000006_t9_grants_and_helpers.sql:51-58`              | Returnerer node_ids i caller's subtree via `org_node_closure`. Inverteret bruges som ancestor-tjek.                                                |
| `core_identity.org_node_closure`-tabel                                                                                 | T9 step 4 (`20260518000003_t9_org_node_closure.sql`)                              | (ancestor_id, descendant_id, depth)-rækker. Bruges til ancestor-traversal.                                                                         |
| `core_identity.current_employee_id() → uuid`                                                                           | T9 helpers                                                                        | Returnerer authenticated brugers employee_id via auth.uid()-join.                                                                                  |
| `core_identity.employee_node_placements`                                                                               | T9 step                                                                           | (employee_id, node_id, effective_from, effective_to). Bruges til at finde requesterens placering.                                                  |
| Smoke-test rolle-swap-mønster                                                                                          | `supabase/tests/smoke/t10_client_active_check.sql:1-60`                           | 2 auth-backed superadmins swappes til non-admin roller; buffer-admin floor; ROLLBACK restorer. Genbruges + udvides.                                |

---

## Formål

> Denne pakke leverer: backend-rammen for de fire forretnings-emner i `t9-supplement-2-krav-og-data.md` — G059 wrapper-fix, G057 superadmin-bypass, approve-disciplin pr. handling med UI-valgt godkender-type, og handlings-granularitet via `permission_actions`. UI bygges senere som lag F.
>
> Hvis fundet under review ikke bringer os tættere på dette: G-nummer, ikke blocker.

---

## Scope

**I scope:**

- Krav-dok §3.1 — wrapper-vejen virker for almindelig bruger (G059)
- Krav-dok §3.2 — superadmin-bypass på 2 T9 forretnings-vagter (G057)
- Krav-dok §3.3 — approve-disciplin pr. handling
- Krav-dok §3.4 — handlings-granularitet
- Krav-dok §3.5 — smoke-tests for alle fire leverancer

**IKKE i scope** (per krav-dok §4):

- Øvrige T9-supplement-skitse-punkter (team-type-konvertering, tilbageskuende-dato-validering, API-eksponering, import-stubs, type-genering, læse-funktions-gates, step 12 robusthed)
- Selve fortrydelses-mekanikens parametre (periodelængde, gælder-dato, audit) — bevares uændret
- Frontend / UI — kun backend
- Konkrete handlinger-seed for eksisterende funktioner — kun rammen
- Multi-godkender-mønster — låst på præcis 1
- Eksplicit valg af konkret godkender — auto-reference er rammen
- G058 (FK-coverage-fitness-check)

---

## Strukturel beslutning

To strukturelle beslutninger som binder fremtidige pakker:

1. **`permission_actions` som ny dimension under tabs.** Konfigurerede handlinger gates additivt (tab-can_write + action-grant). Kode-styrede flag på action-niveau (`requires_second_approver`, `has_undo`, `bypass_tab_write`). UI-redigerbart pr. action: `second_approver_type` + handlings-tildelinger.

2. **Approve-disciplin pr. action via `pending_changes.action_id`-reference.** Pending-rækken bærer action-id som `pending_change_approve` bruger til at evaluere konfigurationen. Wrappers seedes med rette action-id. Eksisterende dispatcher (change_type → page_key) bevares som fallback for pending uden action_id (legacy).

---

## Mathias' afgørelser (input til denne plan)

- **2026-05-21 — Superadmin-bypass på forretnings-invarianter + idempotency-model** (PR #67, commit 8690bf9). Kilde for §3.2.
- **2026-05-21 — Approve-disciplin pr. handling** (PR #71, commit 76d00ae). Kilde for §3.3.
- **2026-05-21 — Handlings-granularitet** (PR #71, commit 76d00ae). Kilde for §3.4.
- **2026-05-17 — T9-omstart-rammen** (T9-fundament-pakke). Punkt 6 (klient-til-team-only), punkt 10 (synlighed=Alt), punkt 12-13 (UI-rettighed for org-handlinger + pending-flow). Kilde for §2.1, §2.3, §2.4 i krav-dok.

---

## Implementations-rækkefølge

Migrations i 6 filer + smoke-tests. Rækkefølge minimerer afhængigheder mellem migrations.

### Step M1 — G059: session-var-fix + grants på 5 wrappers + 2 T10-client-wrappers (V8 udvidet)

- **Type:** migration (CREATE OR REPLACE 5 RPCs + grants)
- **Hvad:** Tilføj `perform set_config('stork.t9_write_authorized', 'true', true)` EFTER `has_permission`-check og FØR `pending_change_request`-kald. **V8 (Codex V7-1 fix):** plus tilføj eksplicit `grant execute ... to authenticated` på de 5 G059-wrappers + 2 T10-client-wrappers (`client_node_place`, `client_node_close`) der har samme systemiske grant-issue.
- **Eksakt indhold:**

  ```sql
  -- CREATE OR REPLACE de 5 G059-wrappers med session-var (eksempel for org_node_upsert)
  -- Pr. RPC indsættes `perform set_config('stork.t9_write_authorized', 'true', true);`
  -- umiddelbart efter has_permission-blok og før pending_change_request-kald.

  -- G059 wrappers (signatur + insert-position):
  --   org_node_upsert(uuid, text, uuid, text, boolean, date) — insert FØR linje 29
  --   org_node_deactivate(uuid, date) — insert FØR linje 56
  --   team_close(uuid, date) — insert FØR linje 84
  --   employee_place(uuid, uuid, date) — insert FØR linje 104
  --   employee_remove_from_node(uuid, date) — insert FØR linje 127

  -- V8: Explicit grants for G059-wrappers (5 stk)
  grant execute on function core_identity.org_node_upsert(uuid, text, uuid, text, boolean, date) to authenticated;
  grant execute on function core_identity.org_node_deactivate(uuid, date) to authenticated;
  grant execute on function core_identity.team_close(uuid, date) to authenticated;
  grant execute on function core_identity.employee_place(uuid, uuid, date) to authenticated;
  grant execute on function core_identity.employee_remove_from_node(uuid, date) to authenticated;

  -- V8: Explicit grants for T10-client-wrappers (2 stk — samme systemiske issue, konsistens-fix)
  grant execute on function core_identity.client_node_place(uuid, uuid, date) to authenticated;
  grant execute on function core_identity.client_node_close(uuid, date) to authenticated;
  ```

- **Afhængigheder:** ingen (frittstående CREATE OR REPLACE + grants)
- **Migration-fil:** `supabase/migrations/20260521100000_t9_supplement_2_wrappers_session_var.sql`
- **Risiko:** lav. Rollback: revert til T9-supplement-version uden session-var; revoke grants (men det re-introducerer grant-issue).

### Step M1b — Konsolideret grants-fix for T9-fundament-supplement (V8 ny)

- **Type:** migration (grants only)
- **Hvad:** Tilføj eksplicit `grant execute ... to authenticated` på 11 RPCs i T9-fundament-supplement der har samme systemiske grant-issue (revoke uden grant). Mathias-afgørelse 2026-05-22: fix alle berørte RPCs som del af denne pakke.
- **Eksakt indhold:**

  ```sql
  -- V8 (Codex V7 systemisk recon): explicit grants på 11 T9-fundament-supplement-RPCs
  -- der har "revoke ... from public, anon" uden matchende "grant ... to authenticated".

  -- pending_change_approve er allerede grantet i M5 (V7) — ikke duplikeret her.

  grant execute on function core_identity.pending_change_undo(uuid) to authenticated;
  grant execute on function core_identity.undo_setting_update(text, integer) to authenticated;
  grant execute on function core_identity.permission_area_upsert(uuid, text, boolean, integer) to authenticated;
  grant execute on function core_identity.permission_area_deactivate(uuid) to authenticated;
  grant execute on function core_identity.permission_page_upsert(uuid, uuid, text, boolean, integer) to authenticated;
  grant execute on function core_identity.permission_page_deactivate(uuid) to authenticated;
  grant execute on function core_identity.permission_tab_upsert(uuid, uuid, text, boolean, integer) to authenticated;
  grant execute on function core_identity.permission_tab_deactivate(uuid) to authenticated;
  -- role_permission_grant_set grantes også eksplicit i M6 (V3 fix) — ikke duplikeret her.
  grant execute on function core_identity.role_permission_grant_remove(uuid, text, uuid) to authenticated;
  ```

- **Afhængigheder:** ingen (selvstændig grants-only migration). Kan køre i hvilken som helst rækkefølge relativt til M1.
- **Migration-fil:** `supabase/migrations/20260521100001_t9_supplement_2_grants_fix.sql` (V9: renummerét fra "100000a" til at matche fitness-regel `^\d{14}_...$`; M2-M6 skubbet én op)
- **Risiko:** lav. Rollback: revoke grants (men re-introducerer grant-issue).
- **G-nummer-kandidat:** verificér resten af T9-RPCs (T9-pending-changes, T9-grants-and-helpers, T9-public-wrappers ud over G059) for samme issue. Hvis fundet: ny pakke eller G-nummer.

### Step M2 — G057: superadmin-bypass på 2 apply-handlers

- **Type:** migration (CREATE OR REPLACE 2 RPCs)
- **Hvad:** Tilføj `v_admin_involved`-bypass på (a) team-aktiv-checken i `_apply_client_place` (linje 159-167 i T10.7b-version) og (b) allerede-inaktiv-checken i `_apply_team_close` (linje 598-601 i T9-supplement).
- **Eksakt indhold:**

  **`_apply_client_place`** — udvider T10.7b-version. Genbruger eksisterende `v_admin_involved`-variabel (declared linje 148). `v_admin_involved`-beregning flyttes ØVERST (FØR team-aktiv-check) så bypass kan bruges på begge invarianter:

  ```sql
  -- Beregn v_admin_involved ØVERST
  v_admin_involved := false;
  if p_pending_change_id is not null then
    select requested_by, approved_by into v_requested_by, v_approved_by
      from core_identity.pending_changes where id = p_pending_change_id;
    v_admin_involved := core_identity.is_admin_by_employee_id(v_requested_by)
      or (v_approved_by is not null and core_identity.is_admin_by_employee_id(v_approved_by));
  end if;

  -- Team-aktiv-check med bypass
  if not exists (...team aktiv på effective_from...) and not v_admin_involved then
    raise exception 'client_placement_requires_active_team: %' using errcode = 'P0001';
  end if;

  -- Resten uændret (klient-eksistens-check, klient-aktiv-check, placement-INSERT/UPDATE/split)
  ```

  **`_apply_team_close`** — udvider T9-supplement-version. Tilføj `v_admin_involved`-beregning + bypass-logik FØR `team_close_already_inactive`-raise. Strukturelle vagter (`team_close_no_active_version_at` P0002 + `team_close_not_team` 22023) bevares UDEN bypass:

  ```sql
  -- Tilføj declares:
  --   v_requested_by uuid;
  --   v_approved_by uuid;
  --   v_admin_involved boolean;

  -- Beregn v_admin_involved efter strukturelle vagter
  v_admin_involved := false;
  if p_pending_change_id is not null then
    select requested_by, approved_by into v_requested_by, v_approved_by
      from core_identity.pending_changes where id = p_pending_change_id;
    v_admin_involved := core_identity.is_admin_by_employee_id(v_requested_by)
      or (v_approved_by is not null and core_identity.is_admin_by_employee_id(v_approved_by));
  end if;

  -- Forretnings-vagt med bypass + idempotency
  if not v_active.is_active then
    if v_admin_involved then
      return;  -- Idempotency-no-op: target allerede inaktiv → handler returnerer uden mutationer
    end if;
    raise exception 'team_close_already_inactive: %' using errcode = '22023';
  end if;

  -- Resten uændret (split-at-boundary + cascade på employee/client-placements)
  ```

- **Afhængigheder:** M1 (rækkefølge-disciplin). Bruger `is_admin_by_employee_id` fra T10.7b.
- **Migration-fil:** `supabase/migrations/20260521100002_t9_supplement_2_superadmin_bypass.sql` (V9: skubbet fra "100001")
- **Risiko:** mellem. Rollback: revert begge RPCs til prior version.

### Step M3 — Handlings-granularitet: `permission_actions`-tabel + grants-udvidelse

- **Type:** migration (CREATE TABLE + ALTER TABLE)
- **Hvad:** Opret `permission_actions`-tabel + udvid `role_permission_grants` med `action_id` + opdater CHECK + UNIQUE-index + udvid `permission_resolve` til at handle action-niveau.
- **Eksakt indhold:**

  ```sql
  -- Ny tabel: permission_actions
  -- no-dedup-key: konfig-tabel; natural key er (tab_id, name) sikret via unique index nedenfor
  create table core_identity.permission_actions (
    id uuid primary key default gen_random_uuid(),
    tab_id uuid not null references core_identity.permission_tabs(id) on delete cascade,
    name text not null,
    is_active boolean not null default true,
    sort_order integer not null default 0,
    requires_second_approver boolean not null default false,
    has_undo boolean not null default false,
    second_approver_type text not null default 'above'
      check (second_approver_type in ('above', 'superadmin')),
    bypass_tab_write boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    -- Invariant fra krav-dok §2.5: fortrydelse uden 2. godkender er ulovlig
    check (not has_undo or requires_second_approver)
  );

  create unique index permission_actions_unique_name_per_tab
    on core_identity.permission_actions (tab_id, name);

  alter table core_identity.permission_actions enable row level security;
  alter table core_identity.permission_actions force row level security;
  revoke all on table core_identity.permission_actions from public, anon, service_role;
  grant select on table core_identity.permission_actions to authenticated;
  grant insert, update on table core_identity.permission_actions to authenticated;

  -- Policies: select bredt, insert/update via session-var
  create policy permission_actions_select on core_identity.permission_actions
    for select to authenticated using (true);
  create policy permission_actions_insert on core_identity.permission_actions
    for insert to authenticated
    with check (current_setting('stork.t9_write_authorized', true) = 'true');
  create policy permission_actions_update on core_identity.permission_actions
    for update to authenticated
    using (current_setting('stork.t9_write_authorized', true) = 'true');

  create trigger permission_actions_audit
    after insert or update or delete on core_identity.permission_actions
    for each row execute function core_compliance.stork_audit();

  -- Udvid role_permission_grants med action_id
  alter table core_identity.role_permission_grants
    add column action_id uuid references core_identity.permission_actions(id) on delete cascade;

  -- Drop eksisterende CHECK + opret ny der inkluderer action
  alter table core_identity.role_permission_grants
    drop constraint role_permission_grants_check;  -- gammel CHECK uden navn? brug \d for at finde
  alter table core_identity.role_permission_grants
    add constraint role_permission_grants_one_element check (
      (case when area_id   is not null then 1 else 0 end) +
      (case when page_id   is not null then 1 else 0 end) +
      (case when tab_id    is not null then 1 else 0 end) +
      (case when action_id is not null then 1 else 0 end) = 1
    );

  -- Opdater UNIQUE-index til at inkludere action
  drop index core_identity.role_permission_grants_unique;
  create unique index role_permission_grants_unique
    on core_identity.role_permission_grants (
      role_id,
      coalesce(area_id::text, ''),
      coalesce(page_id::text, ''),
      coalesce(tab_id::text, ''),
      coalesce(action_id::text, '')
    );

  -- Udvid permission_resolve med action-niveau (action → tab → page → area → default-deny)
  create or replace function core_identity.permission_resolve(
    p_role_id uuid,
    p_element_type text,
    p_element_id uuid
  ) returns table (can_access boolean, can_write boolean, visibility text)
  language plpgsql stable security invoker set search_path = '' as $$
  declare
    v_tab_id uuid;
    v_page_id uuid;
    v_area_id uuid;
    v_grant record;
  begin
    -- Først: action-niveau grant?
    if p_element_type = 'action' then
      select * into v_grant from core_identity.role_permission_grants
      where role_id = p_role_id and action_id = p_element_id limit 1;
      if found then
        can_access := v_grant.can_access; can_write := v_grant.can_write; visibility := v_grant.visibility;
        return next; return;
      end if;
      -- Fald tilbage til tab via action's tab_id
      select tab_id into v_tab_id from core_identity.permission_actions where id = p_element_id;
    elsif p_element_type = 'tab' then
      v_tab_id := p_element_id;
    end if;

    -- Resten af eksisterende logik uændret (tab → page → area → default-deny)
    if v_tab_id is not null then
      select * into v_grant from core_identity.role_permission_grants
      where role_id = p_role_id and tab_id = v_tab_id limit 1;
      if found then
        can_access := v_grant.can_access; can_write := v_grant.can_write; visibility := v_grant.visibility;
        return next; return;
      end if;
      select page_id into v_page_id from core_identity.permission_tabs where id = v_tab_id;
    elsif p_element_type = 'page' then
      v_page_id := p_element_id;
    end if;

    if v_page_id is not null then
      select * into v_grant from core_identity.role_permission_grants
      where role_id = p_role_id and page_id = v_page_id limit 1;
      if found then
        can_access := v_grant.can_access; can_write := v_grant.can_write; visibility := v_grant.visibility;
        return next; return;
      end if;
      select area_id into v_area_id from core_identity.permission_pages where id = v_page_id;
    end if;

    if p_element_type = 'area' then v_area_id := p_element_id; end if;

    if v_area_id is not null then
      select * into v_grant from core_identity.role_permission_grants
      where role_id = p_role_id and area_id = v_area_id limit 1;
      if found then
        can_access := v_grant.can_access; can_write := v_grant.can_write; visibility := v_grant.visibility;
        return next; return;
      end if;
    end if;

    can_access := false; can_write := false; visibility := 'self';
    return next;
  end; $$;

  -- V4 (Codex V3-2 Code recon fix): udvid role_permissions_read med action-grenen
  -- Eksisterende RPC (20260520000000:749-786) returnerer UNION ALL over area/page/tab.
  -- Tilføj 4. UNION-gren for action-grants så UI kan vise alle grants under rolle.
  create or replace function core_identity.role_permissions_read(p_role_id uuid)
  returns table (
    grant_id uuid,
    element_type text,
    element_id uuid,
    element_name text,
    can_access boolean,
    can_write boolean,
    visibility text
  )
  language plpgsql stable security invoker set search_path = '' as $$
  begin
    perform core_identity._require_read_permission('permissions', 'manage');
    return query
    select g.id, 'area'::text, g.area_id, a.name, g.can_access, g.can_write, g.visibility
    from core_identity.role_permission_grants g
    join core_identity.permission_areas a on a.id = g.area_id
    where g.role_id = p_role_id and g.area_id is not null
    union all
    select g.id, 'page'::text, g.page_id, p.name, g.can_access, g.can_write, g.visibility
    from core_identity.role_permission_grants g
    join core_identity.permission_pages p on p.id = g.page_id
    where g.role_id = p_role_id and g.page_id is not null
    union all
    select g.id, 'tab'::text, g.tab_id, t.name, g.can_access, g.can_write, g.visibility
    from core_identity.role_permission_grants g
    join core_identity.permission_tabs t on t.id = g.tab_id
    where g.role_id = p_role_id and g.tab_id is not null
    union all
    -- V4: ny action-gren
    select g.id, 'action'::text, g.action_id, act.name, g.can_access, g.can_write, g.visibility
    from core_identity.role_permission_grants g
    join core_identity.permission_actions act on act.id = g.action_id
    where g.role_id = p_role_id and g.action_id is not null;
  end; $$;
  -- Existing grants/revoke bevares via CREATE OR REPLACE

  -- V9 (Codex V8-2 fix): klassifikations-inserts for nye kolonner
  -- Matcher T9 step 13-mønster fra 20260518000011_t9_classify.sql
  select set_config('stork.allow_data_field_definitions_write', 'true', false);
  select set_config('stork.source_type', 'migration', false);
  select set_config('stork.change_reason', 'T9-supplement-2 M3: classify permission_actions + role_permission_grants.action_id', false);

  insert into core_compliance.data_field_definitions
    (table_schema, table_name, column_name, category, pii_level, retention_type, retention_value, match_role, purpose) values

    -- core_identity.permission_actions (konfiguration) — 11 kolonner
    ('core_identity', 'permission_actions', 'id', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'permission-action PK'),
    ('core_identity', 'permission_actions', 'tab_id', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'FK til permission_tabs'),
    ('core_identity', 'permission_actions', 'name', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'navn på action'),
    ('core_identity', 'permission_actions', 'is_active', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'om action er aktiv'),
    ('core_identity', 'permission_actions', 'sort_order', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'visnings-rækkefølge i UI'),
    ('core_identity', 'permission_actions', 'requires_second_approver', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'kode-låst: kræver action 2. godkender'),
    ('core_identity', 'permission_actions', 'has_undo', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'kode-låst: har action fortrydelses-periode'),
    ('core_identity', 'permission_actions', 'second_approver_type', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'UI-konfig: above eller superadmin'),
    ('core_identity', 'permission_actions', 'bypass_tab_write', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'kode-låst: tillader kun se-rettighed'),
    ('core_identity', 'permission_actions', 'created_at', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'created timestamp'),
    ('core_identity', 'permission_actions', 'updated_at', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'updated timestamp'),

    -- core_identity.role_permission_grants.action_id (konfiguration) — 1 ny kolonne
    ('core_identity', 'role_permission_grants', 'action_id', 'konfiguration', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'FK til permission_actions; action-niveau-grant')
  on conflict (table_schema, table_name, column_name) do nothing;
  ```

- **Afhængigheder:** ingen direkte (selvstændig DDL). Bygger på eksisterende `permission_tabs` + `role_permission_grants`.
- **Migration-fil:** `supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql` (V9: skubbet fra "100002")
- **Risiko:** mellem. Rollback: drop tabel `permission_actions`, drop column `action_id`, restore gammel CHECK + UNIQUE-index, restore gammel `permission_resolve`, restore gammel `role_permissions_read` uden action-gren. Regression-tjek: `m1_permission_matrix.sql` smoke-test passer uændret (eksisterende grants har action_id=NULL — ekskluderes ikke fra UNION-grene).

### Step M4 — Approve-disciplin: `has_permission_action` + helper for ancestor + `pending_changes.action_id`

- **Type:** migration (CREATE/ALTER + nye helpers)
- **Hvad:** Tilføj `pending_changes.action_id`-kolonne, helper `acl_higher_level_employees`, funktion `has_permission_action`. (Ikke `pending_change_approve` endnu — kommer i M5.)
- **Eksakt indhold:**

  ```sql
  -- Tilføj pending_changes.action_id (nullable for legacy pendings før denne pakke)
  alter table core_identity.pending_changes
    add column action_id uuid references core_identity.permission_actions(id) on delete restrict;

  -- V9 (Codex V8-2 fix): klassifikation af ny pending_changes.action_id-kolonne
  select set_config('stork.allow_data_field_definitions_write', 'true', false);
  select set_config('stork.source_type', 'migration', false);
  select set_config('stork.change_reason', 'T9-supplement-2 M4: classify pending_changes.action_id', false);

  insert into core_compliance.data_field_definitions
    (table_schema, table_name, column_name, category, pii_level, retention_type, retention_value, match_role, purpose) values
    ('core_identity', 'pending_changes', 'action_id', 'audit', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'FK til permission_actions; bruges af pending_change_approve til at evaluere approve-disciplin pr. handling')
  on conflict (table_schema, table_name, column_name) do nothing;

  -- Helper: medarbejdere placeret på strengt højere knude (ancestor) end requester
  create or replace function core_identity.acl_higher_level_employees(p_requester_employee_id uuid)
  returns uuid[] language sql stable security invoker set search_path = '' as $$
    -- Find requester's placerings-knuder + alle deres ancestors (depth > 0) via org_node_closure.
    -- Medarbejdere placeret på en sådan ancestor-knude er "højere placerede".
    select coalesce(array_agg(distinct emp.employee_id), '{}'::uuid[])
    from core_identity.employee_node_placements req
    join core_identity.org_node_closure c
      on c.descendant_id = req.node_id
      and c.depth > 0  -- strengt højere
    join core_identity.employee_node_placements emp
      on emp.node_id = c.ancestor_id
      and emp.effective_from <= current_date
      and (emp.effective_to is null or emp.effective_to > current_date)
    where req.employee_id = p_requester_employee_id
      and req.effective_from <= current_date
      and (req.effective_to is null or req.effective_to > current_date)
      and emp.employee_id <> p_requester_employee_id;  -- ekskluder requester selv
  $$;

  comment on function core_identity.acl_higher_level_employees(uuid) is
    'T9-supplement-2: employees placeret på en strengt højere knude end requester (depth > 0 via org_node_closure). Bruges af pending_change_approve til "above"-type-validering og af UI til eligible-approvers-lookup.';

  -- has_permission_action: kombineret tjek for action-grant
  -- V2 (Codex KODE-FUND 2): direkte action-grant lookup UDEN fallback til tab/page/area.
  -- permission_resolve('action') har fallback for andre callers; has_permission_action skal være additivt og kan IKKE bruge fallback.
  -- Returnerer true hvis bruger har (a) can_access på tab + (b) EKSPLICIT action-grant + (c) can_write på tab — UNDTAGEN hvis bypass_tab_write=true
  create or replace function core_identity.has_permission_action(
    p_action_id uuid
  ) returns boolean
  language plpgsql stable security invoker set search_path = '' as $$
  declare
    v_employee_id uuid;
    v_role_id uuid;
    v_action record;
    v_tab_grant record;
    v_action_grant record;
  begin
    v_employee_id := core_identity.current_employee_id();
    if v_employee_id is null then return false; end if;
    select role_id into v_role_id from core_identity.employees where id = v_employee_id;
    if v_role_id is null then return false; end if;

    -- Hent action-config
    select tab_id, bypass_tab_write into v_action
      from core_identity.permission_actions where id = p_action_id and is_active = true;
    if not found then return false; end if;

    -- (a) Tab-can_access tjek (via permission_resolve — fallback OK for tab→page→area)
    select * into v_tab_grant from core_identity.permission_resolve(v_role_id, 'tab', v_action.tab_id);
    if not v_tab_grant.can_access then return false; end if;

    -- (b) Action-grant tjek — DIREKTE lookup, INGEN fallback (V2 Codex KODE-FUND 2)
    -- Hvis ingen specifik action-grant findes for (role × action) → false
    select can_access into v_action_grant from core_identity.role_permission_grants
      where role_id = v_role_id and action_id = p_action_id limit 1;
    if not found or not v_action_grant.can_access then return false; end if;

    -- (c) Tab-can_write tjek — undtagen hvis bypass_tab_write
    if not v_action.bypass_tab_write then
      if not v_tab_grant.can_write then return false; end if;
    end if;

    return true;
  end; $$;

  comment on function core_identity.has_permission_action(uuid) is
    'T9-supplement-2 krav-dok §2.6: kombineret tjek for konfigureret action — kræver can_access på tab + action-grant + (can_write på tab UNDTAGEN hvis bypass_tab_write=true).';

  -- GRANT mønster matcher andre helpers
  revoke all on function core_identity.acl_higher_level_employees(uuid) from public;
  grant execute on function core_identity.acl_higher_level_employees(uuid) to authenticated;
  revoke all on function core_identity.has_permission_action(uuid) from public;
  grant execute on function core_identity.has_permission_action(uuid) to authenticated;
  ```

- **Afhængigheder:** M3 (permission_actions + role_permission_grants-udvidelse).
- **Migration-fil:** `supabase/migrations/20260521100004_t9_supplement_2_approve_helpers.sql` (V9: skubbet fra "100003")
- **Risiko:** mellem. Rollback: drop column `pending_changes.action_id`, drop functions.

### Step M5 — Refactor `pending_change_approve` + drop self-approve-blok

- **Type:** migration (CREATE OR REPLACE 1 RPC)
- **Hvad:** Refactor `pending_change_approve` til at evaluere action-config i stedet for fast non-admin self-approve-regel.
- **Eksakt indhold:**

  ```sql
  -- V5 Refactor pending_change_approve
  -- Branching på action_id:
  --   1. action_id IS NULL (legacy real-wrapper-flow): BEVAR eksisterende
  --      self-approve-blok (requester ≠ approver medmindre admin). Regression-
  --      beskyttelse indtil senere pakke seeder actions + udvider wrappers.
  --   2. action_id IS NOT NULL (konfigureret action):
  --      a. requires_second_approver=false → default selv-approve tilladt (§2.5)
  --      b. requires_second_approver=true AND second_approver_type='above':
  --         - Tillad hvis approver er i acl_higher_level_employees(requested_by)
  --         - Tillad hvis approver er superadmin (bypass)
  --         - Ellers raise approver_not_higher_level
  --      c. requires_second_approver=true AND second_approver_type='superadmin':
  --         - Tillad KUN hvis approver er superadmin (is_admin())
  --         - Ellers raise approver_must_be_superadmin
  create or replace function core_identity.pending_change_approve(
    p_change_id uuid
  ) returns void
  language plpgsql security invoker set search_path = '' as $$
  declare
    v_change record;
    v_approver uuid;
    v_undo_period integer;
    v_page_key text;
    v_action record;
    v_higher_level_employees uuid[];
    v_has_undo boolean;  -- V3 (Codex V2 TEKNISK-BLOKERING fix): flyttet til top-level
  begin
    v_approver := core_identity.current_employee_id();
    if v_approver is null then
      raise exception 'no_authenticated_employee' using errcode = '42501';
    end if;

    select * into v_change from core_identity.pending_changes where id = p_change_id for update;
    if not found then
      raise exception 'pending_change_not_found %', p_change_id using errcode = 'P0002';
    end if;
    if v_change.status <> 'pending' then
      raise exception 'pending_change_wrong_status: % (expected pending)', v_change.status using errcode = '22023';
    end if;

    -- Page-key dispatcher (uændret — bruges af can_edit-tjek nedenfor)
    case v_change.change_type
      when 'org_node_upsert'     then v_page_key := 'org_nodes';
      when 'org_node_deactivate' then v_page_key := 'org_nodes';
      when 'team_close'          then v_page_key := 'org_nodes';
      when 'employee_place'      then v_page_key := 'employee_placements';
      when 'employee_remove'     then v_page_key := 'employee_placements';
      when 'client_place'        then v_page_key := 'client_placements';
      when 'client_close'        then v_page_key := 'client_placements';
      else
        raise exception 'unknown_change_type for approve-gate: %', v_change.change_type using errcode = '42883';
    end case;

    -- Basis-tjek: approver skal have can_edit på page (uændret)
    if not core_identity.has_permission(v_page_key, null, true) then
      raise exception 'permission_denied: approve % kræver can_edit på %', v_change.change_type, v_page_key using errcode = '42501';
    end if;

    -- V5 (Codex V4-1 KRITISK-SIKKERHEDSHUL fix): action-baseret approve-disciplin
    -- Legacy (action_id IS NULL): bevar eksisterende self-approve-blok som regression-beskyttelse
    -- Konfigureret (action_id IS NOT NULL): følg §2.5 ny regel
    if v_change.action_id is null then
      -- Legacy-disciplin: bevar self-approve-forbud for non-admin (uændret fra T9-fundament-supplement)
      if v_change.requested_by = v_approver and not core_identity.is_admin() then
        raise exception 'pending_change_self_approve_forbidden'
          using errcode = '42501', hint = 'requester må ikke selv approve (medmindre admin); action-baseret konfig kommer i senere pakke';
      end if;
    else
      -- Action-baseret evaluering per krav-dok §2.5
      select requires_second_approver, second_approver_type into v_action
        from core_identity.permission_actions where id = v_change.action_id;

      if v_action.requires_second_approver then
        if core_identity.is_admin() then
          -- Superadmin bypasser (jf. krav-dok §2.5 superadmin-undtagelse)
          null;
        elsif v_action.second_approver_type = 'above' then
          v_higher_level_employees := core_identity.acl_higher_level_employees(v_change.requested_by);
          if not (v_approver = any(v_higher_level_employees)) then
            raise exception 'approver_not_higher_level: % er ikke placeret højere end requester %', v_approver, v_change.requested_by
              using errcode = '42501';
          end if;
        elsif v_action.second_approver_type = 'superadmin' then
          raise exception 'approver_must_be_superadmin: action % kræver superadmin-godkendelse', v_change.action_id
            using errcode = '42501';
        end if;
      end if;
      -- requires_second_approver=false → ingen ekstra tjek; default selv-approve tilladt per §2.5
    end if;

    -- V2/V3 (Codex KODE-FUND 3 + V2-1): has_undo håndhæves
    -- Hvis action_id IS NOT NULL AND has_undo=false → undo_deadline=NULL (undo blokeres automatisk)
    -- Legacy (action_id IS NULL) bevarer eksisterende adfærd (undo_deadline sat ud fra undo_settings)
    v_has_undo := true;  -- default for legacy
    if v_change.action_id is not null then
      select has_undo into v_has_undo from core_identity.permission_actions where id = v_change.action_id;
    end if;

    if v_has_undo then
      select undo_period_seconds into v_undo_period
      from core_identity.undo_settings where change_type = v_change.change_type;
      if v_undo_period is null then v_undo_period := 24 * 3600; end if;
    end if;

    perform set_config('stork.t9_write_authorized', 'true', true);
    perform set_config('stork.source_type', 'manual', true);
    perform set_config('stork.change_reason', 'pending_change_approve', true);

    -- V4 (Codex V3 KRITISK-SIKKERHEDSHUL fix): undo_deadline = now() for has_undo=false
    -- (NULL ville hverken blokere undo eller inkludere row i cron-selection)
    update core_identity.pending_changes
    set status = 'approved',
        approved_by = v_approver,
        approved_at = now(),
        undo_deadline = case
          when v_has_undo then now() + (v_undo_period || ' seconds')::interval
          else now()  -- nul-sekund undo-vindue; blokerer undo + inkluderer i cron-selection
        end,
        updated_at = now()
    where id = p_change_id;
  end; $$;
  revoke execute on function core_identity.pending_change_approve(uuid) from public, anon;
  -- V7 (Codex V6 KRITISK fix): explicit grant. Eksisterende migration har kun revoke;
  -- authenticated kunne ikke kalde RPC'en via normal API. Tilføjet eksplicit.
  grant execute on function core_identity.pending_change_approve(uuid) to authenticated;
  ```

  **Vigtigt (V5):** Self-approve-blok BEVARES for legacy-flow (`action_id IS NULL`) som regression-beskyttelse indtil senere pakke seeder actions. Default selv-approve tillades KUN for konfigurerede actions med `requires_second_approver=false`. Krav-dok §2.5's "fjernes"-formulering gælder under action-baseret konfig, ikke for legacy real-wrapper-flow.

- **Afhængigheder:** M3 + M4 (`permission_actions`, `acl_higher_level_employees`).
- **Migration-fil:** `supabase/migrations/20260521100005_t9_supplement_2_pending_change_approve.sql` (V9: skubbet fra "100004")
- **Risiko:** mellem. Rollback: revert til T9-fundament-supplement-version med self-approve-blok.

### Step M6 — UI-RPCs + udvid `role_permission_grant_set` til action

- **Type:** migration (CREATE OR REPLACE existing + nye funktioner)
- **Hvad:** Udvid `role_permission_grant_set` til at acceptere `'action'`-element-type. Tilføj `permission_action_upsert`, `permission_action_deactivate`, `permission_action_set_approver_type`, `pending_change_eligible_approvers`.
- **Eksakt indhold:**

  ```sql
  -- Udvid role_permission_grant_set til at acceptere 'action'-element-type
  -- V3 (Codex V2 KRITISK fix): tilføj eksplicit grant til authenticated (CREATE OR REPLACE bevarer existing ACL, men gør grant eksplicit)
  create or replace function core_identity.role_permission_grant_set(
    p_role_id uuid,
    p_element_type text,
    p_element_id uuid,
    p_can_access boolean,
    p_can_write boolean,
    p_visibility text
  ) returns uuid language plpgsql security invoker set search_path = '' as $$
  declare
    v_id uuid;
    v_area_id uuid;
    v_page_id uuid;
    v_tab_id uuid;
    v_action_id uuid;
  begin
    if not core_identity.has_permission('permissions', 'manage', true) then
      raise exception 'permission_denied' using errcode = '42501';
    end if;

    if    p_element_type = 'area'   then v_area_id   := p_element_id;
    elsif p_element_type = 'page'   then v_page_id   := p_element_id;
    elsif p_element_type = 'tab'    then v_tab_id    := p_element_id;
    elsif p_element_type = 'action' then v_action_id := p_element_id;
    else raise exception 'invalid_element_type: %', p_element_type using errcode = '22023';
    end if;

    perform set_config('stork.t9_write_authorized', 'true', true);
    perform set_config('stork.source_type', 'manual', true);
    perform set_config('stork.change_reason', 'role_permission_grant_set', true);

    insert into core_identity.role_permission_grants
      (role_id, area_id, page_id, tab_id, action_id, can_access, can_write, visibility)
    values
      (p_role_id, v_area_id, v_page_id, v_tab_id, v_action_id, p_can_access, p_can_write, p_visibility)
    on conflict (role_id, coalesce(area_id::text, ''), coalesce(page_id::text, ''), coalesce(tab_id::text, ''), coalesce(action_id::text, ''))
    do update set
      can_access = excluded.can_access,
      can_write = excluded.can_write,
      visibility = excluded.visibility,
      updated_at = now()
    returning id into v_id;

    return v_id;
  end; $$;
  -- V3 (Codex V2 KRITISK fix): eksplicit grant for klarhed (existing ACL bevares via CREATE OR REPLACE)
  grant execute on function core_identity.role_permission_grant_set(uuid, text, uuid, boolean, boolean, text) to authenticated;

  -- permission_action_upsert (UI-RPC) — kun navn, sort_order, is_active. requires_second_approver/has_undo/bypass_tab_write sættes IKKE her (kode-låst via separate migration-seed).
  create or replace function core_identity.permission_action_upsert(
    p_id uuid,
    p_tab_id uuid,
    p_name text,
    p_is_active boolean default true,
    p_sort_order integer default 0
  ) returns uuid language plpgsql security invoker set search_path = '' as $$
  declare v_id uuid;
  begin
    if not core_identity.has_permission('permissions', 'manage', true) then
      raise exception 'permission_denied' using errcode = '42501';
    end if;
    perform set_config('stork.t9_write_authorized', 'true', true);
    perform set_config('stork.source_type', 'manual', true);
    perform set_config('stork.change_reason', 'permission_action_upsert', true);

    if p_id is null then
      insert into core_identity.permission_actions (tab_id, name, is_active, sort_order)
      values (p_tab_id, p_name, p_is_active, p_sort_order) returning id into v_id;
    else
      insert into core_identity.permission_actions (id, tab_id, name, is_active, sort_order)
      values (p_id, p_tab_id, p_name, p_is_active, p_sort_order)
      on conflict (id) do update
      set tab_id = excluded.tab_id, name = excluded.name,
          is_active = excluded.is_active, sort_order = excluded.sort_order,
          updated_at = now()
      returning id into v_id;
    end if;
    return v_id;
  end; $$;
  revoke execute on function core_identity.permission_action_upsert(uuid, uuid, text, boolean, integer) from public, anon;
  grant execute on function core_identity.permission_action_upsert(uuid, uuid, text, boolean, integer) to authenticated;

  -- permission_action_deactivate (UI-RPC)
  create or replace function core_identity.permission_action_deactivate(p_action_id uuid)
  returns void language plpgsql security invoker set search_path = '' as $$
  begin
    if not core_identity.has_permission('permissions', 'manage', true) then
      raise exception 'permission_denied' using errcode = '42501';
    end if;
    perform set_config('stork.t9_write_authorized', 'true', true);
    perform set_config('stork.source_type', 'manual', true);
    perform set_config('stork.change_reason', 'permission_action_deactivate', true);
    update core_identity.permission_actions set is_active = false, updated_at = now()
      where id = p_action_id;
  end; $$;
  revoke execute on function core_identity.permission_action_deactivate(uuid) from public, anon;
  grant execute on function core_identity.permission_action_deactivate(uuid) to authenticated;

  -- permission_action_set_approver_type (UI-RPC) — kun UI-redigerbart felt
  create or replace function core_identity.permission_action_set_approver_type(
    p_action_id uuid,
    p_type text
  ) returns void language plpgsql security invoker set search_path = '' as $$
  declare v_requires boolean;
  begin
    if not core_identity.has_permission('permissions', 'manage', true) then
      raise exception 'permission_denied' using errcode = '42501';
    end if;
    if p_type not in ('above', 'superadmin') then
      raise exception 'invalid_approver_type: % (forventet: above eller superadmin)', p_type using errcode = '22023';
    end if;
    -- Kun tilladt på actions hvor requires_second_approver=true
    select requires_second_approver into v_requires
      from core_identity.permission_actions where id = p_action_id;
    if not found then
      raise exception 'permission_action_not_found: %', p_action_id using errcode = 'P0002';
    end if;
    if not v_requires then
      raise exception 'cannot_set_approver_type_when_not_required: action % har requires_second_approver=false', p_action_id
        using errcode = '22023';
    end if;
    perform set_config('stork.t9_write_authorized', 'true', true);
    perform set_config('stork.source_type', 'manual', true);
    perform set_config('stork.change_reason', 'permission_action_set_approver_type', true);
    update core_identity.permission_actions
      set second_approver_type = p_type, updated_at = now()
      where id = p_action_id;
  end; $$;
  revoke execute on function core_identity.permission_action_set_approver_type(uuid, text) from public, anon;
  grant execute on function core_identity.permission_action_set_approver_type(uuid, text) to authenticated;

  -- pending_change_eligible_approvers: hvem må approve denne pending
  -- Returnerer: alle medarbejdere der må approve (baseret på action-config + requester-placering + superadmin)
  create or replace function core_identity.pending_change_eligible_approvers(
    p_pending_change_id uuid
  ) returns uuid[] language plpgsql stable security invoker set search_path = '' as $$
  declare
    v_change record;
    v_action record;
    v_eligible uuid[];
    v_superadmin_ids uuid[];
  begin
    select * into v_change from core_identity.pending_changes where id = p_pending_change_id;
    if not found then return '{}'::uuid[]; end if;

    -- Find alle superadmins (placerings-uafhængigt)
    select coalesce(array_agg(e.id), '{}'::uuid[]) into v_superadmin_ids
    from core_identity.employees e
    join core_identity.role_page_permissions p on p.role_id = e.role_id
    where core_identity.is_active_employee_state(e.anonymized_at, e.termination_date)
      and p.page_key = 'system' and p.tab_key = 'manage'
      and p.scope = 'all' and p.can_edit = true;

    -- Hvis action_id IS NULL eller requires_second_approver=false → alle med can_edit på page kan approve (returner kun superadmins som "garanteret eligible"; UI viser bredere liste)
    if v_change.action_id is null then
      return v_superadmin_ids;  -- Legacy pendings: superadmins er always-eligible; can_edit-tjek sker i approve-RPC
    end if;

    select requires_second_approver, second_approver_type into v_action
      from core_identity.permission_actions where id = v_change.action_id;

    if not v_action.requires_second_approver then
      return v_superadmin_ids;  -- Default selv-approve OK; superadmins always-eligible
    end if;

    if v_action.second_approver_type = 'superadmin' then
      return v_superadmin_ids;
    end if;

    -- second_approver_type='above': returner higher-level + superadmins
    v_eligible := core_identity.acl_higher_level_employees(v_change.requested_by);
    return (select array(select unnest(v_eligible) union select unnest(v_superadmin_ids)));
  end; $$;
  revoke execute on function core_identity.pending_change_eligible_approvers(uuid) from public, anon;
  grant execute on function core_identity.pending_change_eligible_approvers(uuid) to authenticated;
  ```

- **Afhængigheder:** M3 + M4.
- **Migration-fil:** `supabase/migrations/20260521100006_t9_supplement_2_ui_rpcs.sql` (V9: skubbet fra "100005")
- **Risiko:** lav. Rollback: revert `role_permission_grant_set` til prior version, drop nye RPCs.

### Step T1 — Smoke-test for G059 wrapper-flow

- **Type:** test (1 fil)
- **Hvad:** End-to-end test af 5 G059-wrappers + 2 client-wrappers gennem `pending_change_apply` med tabel-effekt-assertion. Bruger 2-non-admin-rolle-swap-mønster fra T10.7b.
- **Test-fil:** `supabase/tests/smoke/t9_supplement_2_wrappers.sql`
- **Test-cases:**
  - W1: `org_node_upsert` → ny pending → approve via 2. non-admin (action ikke konfigureret → selv-approve OK; brug 2-user for konsistens) → apply via service_role → ny række i `org_node_versions`
  - W2: `org_node_deactivate(team_id, today)` → versioning mutation
  - W3: `team_close(team_id, today)` → versioning + cascade på `employee_node_placements`
  - W4: `employee_place(emp_id, team_id, today)` → ny række i `employee_node_placements`
  - W5: `employee_remove_from_node(emp_id, today)` → effective_to sat
  - W6 (regression): `client_node_place(...)` virker som T10.7b
  - W7 (regression): `client_node_close(...)` virker som T10.7b

### Step T2 — Smoke-test for G057 superadmin-bypass

- **Type:** test (1 fil)
- **Hvad:** Positive + negative kontroller for de 2 bypass-scenarier.
- **Test-fil:** `supabase/tests/smoke/t9_supplement_2_superadmin_bypass.sql`
- **Test-cases:**
  - B1 (positiv): superadmin opretter + approver pending `client_place` på team der bliver inaktivt før apply → `_apply_client_place` succeeds (team-aktiv-bypass via `v_admin_involved`)
  - B2 (positiv): superadmin opretter + approver pending `team_close` mod allerede-inaktivt team (via direct UPDATE før apply) → `_apply_team_close` no-op return, status='applied', ingen ny `org_node_versions`-mutation
  - B3 (negativ): 2 non-admin (requester + approver) opretter pending `client_place` på aktivt team, inaktivér team før apply → raise `client_placement_requires_active_team` P0001
  - B4 (negativ): 2 non-admin opretter pending `team_close` mod team der inaktiveres før apply → raise `team_close_already_inactive` 22023

### Step T3 — Smoke-test for approve-disciplin

- **Type:** test (1 fil)
- **Hvad:** Verificér default selv-approve, 'above'-type med ancestor, 'superadmin'-type, fortrydelses-frist, superadmin-bypass.
- **Test-fil:** `supabase/tests/smoke/t9_supplement_2_approve_disciplin.sql`
- **Test-cases:**
  - A1 (default selv-approve): action med `requires_second_approver=false` → requester selv-approve egen pending succeeds
  - A2 (`above`-type, ancestor OK): non-admin requester på team-knude, non-admin approver på ancestor-knude → approve succeeds
  - A3 (`above`-type, ikke-ancestor afvist): non-admin approver på sibling-gren → raise `approver_not_higher_level`
  - A4 (`above`-type, superadmin OK): non-admin requester, superadmin approver → succeeds via bypass
  - A5 (`superadmin`-type, superadmin OK): non-admin requester, superadmin approver → succeeds
  - A6 (`superadmin`-type, ancestor afvist): non-admin requester, non-admin ancestor approver → raise `approver_must_be_superadmin`
  - A7 (`has_undo=true`): action med `requires_second_approver=true, has_undo=true` → efter approve er `undo_deadline` sat; `pending_change_undo` virker indenfor frist
  - A7b (`has_undo=false`, V4 Codex V3 KRITISK-SIKKERHEDSHUL fix): action med `requires_second_approver=true, has_undo=false` → efter approve er `undo_deadline=now()` (nul-sekund vindue); `pending_change_undo`-kald afvises med `undo_deadline_expired` (now() <= now() = true → raise); `pending_change_apply` kan eksekvere umiddelbart (now() > now() = false); cron-selection inkluderer row (now() <= now() = true)
  - A8 (superadmin requester): superadmin opretter pending på action med `requires_second_approver=true` → superadmin selv-approver → succeeds (superadmin-undtagelse)

### Step T4 — Smoke-test for handlings-granularitet

- **Type:** test (1 fil)
- **Hvad:** Verificér `has_permission_action`, additivt mønster, `bypass_tab_write`-undtagelse.
- **Test-fil:** `supabase/tests/smoke/t9_supplement_2_handlings_granularitet.sql`
- **Test-cases:**
  - H1 (standard handling): tab uden actions → can_write på tab giver adgang som i dag
  - H2 (konfigureret handling, fuld grant): action med `bypass_tab_write=false`, bruger har can_write på tab + action-grant → `has_permission_action`=true
  - H3 (konfigureret handling, mangler action-grant): bruger har can_write på tab men ingen action-grant → `has_permission_action`=false
  - H4 (konfigureret handling, mangler tab-can_write): bruger har action-grant men ikke can_write på tab → `has_permission_action`=false
  - H5 (`bypass_tab_write=true`, kun can_access): bruger har can_access (ikke can_write) på tab + action-grant → `has_permission_action`=true
  - H6 (`bypass_tab_write=true`, mangler can_access): bruger har action-grant men ikke can_access på tab → `has_permission_action`=false
  - H7 (`role_permission_grant_set('action', ...)`): UI-RPC opretter action-grant; verificér row i `role_permission_grants`
  - H8 (invariant CHECK): forsøg på at INSERT action med `has_undo=true, requires_second_approver=false` → CHECK raise
  - H9 (RPC-flow, V2 Codex KODE-FUND 5): `permission_action_upsert(NULL, tab_id, 'test-action', true, 0)` → ny række i `permission_actions`; verificér via SELECT
  - H10 (RPC-flow): `permission_action_set_approver_type(action_id, 'superadmin')` på action med `requires_second_approver=true` → opdaterer felt; verificér via SELECT. Negativ kontrol: kald på action med `requires_second_approver=false` → raise `cannot_set_approver_type_when_not_required`.
  - H11 (RPC-flow): `permission_action_deactivate(action_id)` → `is_active=false`; verificér at `has_permission_action` returnerer false for deaktiveret action selv med eksplicit grant

---

## Fundament-tjek-passeret

| Tjek                                                               | Status | Reference                                                                                                                                                                              |
| ------------------------------------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hver write-RPC har GRANT + INSERT/UPDATE-policy + session-var      | ja     | M3 tilføjer policies + session-var-krav til `permission_actions`; M1 tilføjer session-var på 5 wrappers; eksisterende `role_permission_grants` har policies; M5 ændrer ikke RLS-model. |
| Hver SELECT-policy bred nok til legitime læsere                    | ja     | `permission_actions` får `using (true)` (alle authenticated kan læse permission-katalog — matcher `permission_pages`/`permission_tabs`/`role_permission_grants`-mønster).              |
| Eksempel-row verificeret gennem flow                               | ja     | T1-T4 dækker alle leverancer end-to-end.                                                                                                                                               |
| Plan-detaljer eksplicit (ingen "TBD" / "Code afgør" / overladelse) | ja     | M1-M6 har pseudo-SQL pr. RPC + tabel; T1-T4 har konkrete test-cases.                                                                                                                   |

---

## Test-konsekvens

Alle 4 smoke-test-filer er nye:

- `supabase/tests/smoke/t9_supplement_2_wrappers.sql` — G059 end-to-end (W1-W7)
- `supabase/tests/smoke/t9_supplement_2_superadmin_bypass.sql` — G057 bypass (B1-B4)
- `supabase/tests/smoke/t9_supplement_2_approve_disciplin.sql` — approve-disciplin (A1-A8)
- `supabase/tests/smoke/t9_supplement_2_handlings_granularitet.sql` — granularitet (H1-H8)

**Forventet status:** alle grønne.

**Regression-tjek:** eksisterende `t9_public_wrapper_rpcs.sql`, `t9_pending_changes.sql`, `t10_client_active_check.sql` skal fortsat passere — `pending_change_approve`-refactor må ikke bryde eksisterende non-action pending-flow (action_id IS NULL-grenen bevarer can_edit-only-disciplin).

---

## Build-fase halt-håndtering

- **Forventede WORKAROUND-kandidater:** ingen. Alle mønstre genbruger eksisterende infrastruktur (session-var, is_admin_by_employee_id, role_permission_grants-struktur).
- **Forventede PLAN-AFVIGELSE-scenarier:** ingen. 6 migrations + 4 smoke-tests er konkret afgrænset.
- **Kritiske invarianter der ikke må brydes:**
  - FORCE RLS på `pending_changes` bevares (M1 session-var; M4 tilføjer action_id-kolonne uden policy-ændring)
  - Strukturelle vagter bevares uden bypass (`team_close_not_team`, `team_close_no_active_version_at`, `client_placement_node_not_team`)
  - `is_admin_by_employee_id` signatur uændret (M2 genbruger, ændrer ikke)
  - Eksisterende klient-aktiv-bypass i `_apply_client_place` bevares funktionelt (M2 restrukturerer kun)
  - Invariant CHECK på `permission_actions` håndhæver `has_undo ⇒ requires_second_approver`
  - `pending_change_approve` legacy-flow (action_id IS NULL) virker uændret for pre-pakke-pendings

---

## Risiko + kompensation

| Migration                                    | Værste-case                                                                                                                                                                                                                                          | Sandsynlighed | Rollback                                                               |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------- |
| M1 (5 wrappers)                              | session-var sættes på SECURITY DEFINER → outer-scope policy påvirkes. **Mitigation:** verificeret at `set_config(..., true)` (transaction-local) virker for T10.7b-klient-wrappers.                                                                  | lav           | revert til T9-supplement-version uden session-var                      |
| M2 (`_apply_*` bypass)                       | bypass-restrukturering ændrer check-rækkefølgen. **Mitigation:** pseudo-SQL specificerer eksakt rækkefølge; klient-eksistens-check bevares position.                                                                                                 | lav           | revert begge RPCs til prior version                                    |
| M3 (`permission_actions` + grants-udvidelse) | CHECK + UNIQUE-rebuild kan fejle på eksisterende rows. **Mitigation:** tabellen er tom indtil seed; existing grants har ikke action_id (null OK i nye CHECK fordi præcis 1 af 4 skal være sat — area/page/tab er allerede sat på eksisterende rows). | mellem        | drop tabel + column, restore prior CHECK + UNIQUE + permission_resolve |
| M4 (helpers + action_id)                     | `acl_higher_level_employees` performance på dybe træer. **Mitigation:** brug `org_node_closure`-tabel (precomputed); join på indekserede ancestor_id/descendant_id.                                                                                  | lav           | drop column + funktioner                                               |
| M5 (`pending_change_approve`-refactor)       | Approve-flow ændret for ALLE pending — risiko for regression på legacy. **Mitigation:** action_id IS NULL-grenen bevarer eksisterende ikke-action can_edit-only-flow; smoke-test T3 + regression-tjek på eksisterende tests.                         | mellem        | revert til T9-fundament-supplement-version                             |
| M6 (UI-RPCs + grant_set udvidelse)           | `role_permission_grant_set`-signatur uændret men action-element-type tilføjet. **Mitigation:** CHECK håndhæver præcis 1 element-niveau; eksisterende callers virker uændret.                                                                         | lav           | revert + drop nye RPCs                                                 |
| T1-T4 (smoke-tests)                          | Rolle-swap + buffer-admin-floor-mønster valideret i T10.7b. Risiko for org-træ-test-fixture-fejl (lave et fungerende træ med assistent/leder). **Mitigation:** brug minimal træ-fixture (2-niveau: leder → team) for de fleste cases.                | lav           | drop testene (pakke-leverance er migrations)                           |

**Kompensation hvis hele pakken fejler under build:** revert M1-M6 migrations. G057 + G059 forbliver åbne. Cutover er ikke berørt (G057 + G059 er ikke cutover-blockers).

---

## Oprydnings- og opdaterings-strategi

**Filer der skal flyttes til arkiv** (efter pakken er merget):

- `docs/coordination/t9-supplement-2-plan.md` → `docs/coordination/arkiv/`
- `docs/coordination/t9-supplement-2-krav-og-data.md` → `docs/coordination/arkiv/`
- `docs/coordination/t9-supplement-2-forretningsgang-{code,codex,claude-ai,konsolideret}.md` → `docs/coordination/arkiv/`
- Alle `docs/coordination/plan-feedback/t9-supplement-2-*.md` → `docs/coordination/arkiv/`

**Filer der skal slettes:** ingen.

**Konsekvens-opdateringer for autoritative dokumenter:**

| Dokument                                   | Konsekvens? | Opdatering der laves i denne pakke                                                                                                                        |
| ------------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/strategi/stork-2-0-master-plan.md`   | ja          | Tilføj rettelse i Appendix C der refererer §1.7 (T9-omstart-rammen) med ny approve-disciplin pr. action + handlings-granularitet via `permission_actions` |
| `docs/strategi/bygge-status.md`            | ja          | Tilføj entry: T9-supplement-2 fuldført (G057 + G059 lukket; ny approve-disciplin + handlings-granularitet etableret som backend-ramme)                    |
| `docs/coordination/mathias-afgoerelser.md` | nej         | Tre relevante entries er allerede committed (PR #67 + PR #71). Pakken anvender dem.                                                                       |
| `docs/teknisk/teknisk-gaeld.md`            | ja          | Flyt G057 og G059 fra "Åben gæld" til arkiv-sektion (LØST 2026-05-21 via T9-supplement-2)                                                                 |

**Standard-opdateringer:**

- `docs/coordination/aktiv-plan.md` → opdater til "Aktuel: T9-supplement-2 (plan V1)" under plan-fase; ryd efter merge
- `docs/coordination/seneste-rapport.md` → opdater til slut-rapport-fil efter merge

**Reference-konsekvenser:** ingen filer om-døbes inden for pakken (kun arkivering efter merge).

---

## Konsistens-tjek

- **Disciplin-pakke:** Plan-leverance er kontrakt; recon-først udført med file:linje på alle afhængigheder; krav-dok §3.1-§3.5 er 1:1-mappet til Step M1-M6 + T1-T4.

---

## Fire-dokument-konsultation

| Dokument                                            | Konsulteret | Status           | Relevante referencer                                                                                                                                                                                                                                             | Konflikt med plan? |
| --------------------------------------------------- | ----------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `docs/strategi/vision-og-principper.md`             | ja          | LÅST-AUTORITATIV | Princip 2 (Superadmin er eneste hardkodede rolle) — etableret som basis for §3.2 + §3.3 superadmin-bypass                                                                                                                                                        | nej                |
| `docs/strategi/stork-2-0-master-plan.md`            | ja          | RETNINGSGIVENDE  | §1.7 T9-omstart-rammen punkt 12 (UI-rettigheder for org-handlinger) + punkt 13 (pending-flow med gælder-dato)                                                                                                                                                    | nej                |
| `docs/coordination/mathias-afgoerelser.md`          | ja          | RETNINGSGIVENDE  | 2026-05-21 superadmin-bypass-ramme + idempotency (PR #67); 2026-05-21 approve-disciplin pr. handling (PR #71); 2026-05-21 handlings-granularitet (PR #71); 2026-05-17 punkt 6 (strukturelle invarianter); 2026-05-17 punkt 12-13 (UI-rettigheder + pending-flow) | nej                |
| `docs/coordination/t9-supplement-2-krav-og-data.md` | ja          | PAKKE-KONTRAKT   | §3.1 (G059) → M1; §3.2 (G057) → M2; §3.3 (approve-disciplin) → M4+M5+M6; §3.4 (handlings-granularitet) → M3+M4+M6; §3.5 (tests) → T1-T4                                                                                                                          | nej                |

---

## Konklusion

V9 adresserer Codex V8's 2 TEKNISK-BLOKERING (M1b filnavn bryder fitness-regel → renummeret; nye kolonner mangler klassifikation → klassifikations-inserts tilføjet i M3+M4). V8 adresserede Codex V7's 1 KRITISK (manglende grants på G059-wrappers) + G-nummer-kandidat (T10-client-wrappers) + Code systemisk recon (11 T9-fundament-supplement-RPCs med samme issue). Mathias-afgørelse 2026-05-22: fix alle 18 berørte RPCs som del af denne pakke. Ny M1b grants-fix-migration. V7 adresserede Codex V6's 1 KRITISK (pending_change_approve grant). V6 adresserede Codex V5's 1 KRITISK-SIKKERHEDSHUL (stale tekst i M5-beskrivelse modsagde V5-koden → opdateret kommentarer, beskrivelse og Vigtigt-note). V5 adresserede Codex V4's 1 KRITISK-SIKKERHEDSHUL (legacy action_id NULL åbnede non-admin self-approve → fixed: bevar self-approve-blok for legacy, tillad default selv-approve KUN for konfigurerede actions). V4 adresserede Codex V3's 1 KRITISK-SIKKERHEDSHUL + Code recon. V3 adresserede Codex V2's 1 TEKNISK-BLOKERING + 1 KRITISK. V2 adresserede Codex V1's 4 KRITISK + 1 MELLEM. G-nummer-kandidat deferred til UI-pakke.

**Vigtigt om scope:** Pakken bygger approve-disciplinens INFRASTRUKTUR (per-action flag, godkender-type-validering, ancestor-helper, additivt action-grant-mønster). Den AKTIVERER ikke disciplin på real-T9-wrappers — det kræver action-seed + wrapper-udvidelse i en senere pakke, jf. krav-dok §4 ("pakken bygger rammen; UI eller separat pakke fylder konkrete handlinger ind"). Smoke-tests T3 validerer disciplinen via fixture-actions; legacy-flow (action_id IS NULL) bevares uændret.

Migration-rækkefølgen (M1→M2→M3→M4→M5→M6) minimerer indbyrdes afhængigheder. Smoke-tests (T1-T4) dækker alle leverancer end-to-end med både positive og negative kontroller. Acceptabel risiko (mellem på M3+M5, lav på resten + M1b). **Klar til Codex V10-review.**
