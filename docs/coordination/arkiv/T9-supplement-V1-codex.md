# T9-supplement V1 — Codex feedback

**Review-type:** Plan V1  
**Rolle:** Codex kode-review, teknisk gennemførlighed  
**Resultat:** FEEDBACK  
**Oprydnings- og opdaterings-strategi:** OK — sektionen findes og er konkret (`docs/coordination/T9-supplement-plan.md:254`).

## Fund

### [KRITISK] Historiske read-gates bruger current-state ACL

Konkret afvigelse: Planen foreslår at `org_tree_read[_at]`, `employee_placement_read[_at]` og `client_placement_read[_at]` scopes med `acl_subtree_org_nodes(current_employee_id())` / `acl_subtree_employees(...)` (`docs/coordination/T9-supplement-plan.md:117`-`119`). De helpers er current-date helpers: `acl_subtree_org_nodes` filtrerer placements med `current_date` (`supabase/migrations/20260518000006_t9_grants_and_helpers.sql:51`-`59`), `acl_subtree_employees` kalder samme current helper og filtrerer igen på `current_date` (`supabase/migrations/20260518000006_t9_grants_and_helpers.sql:64`-`70`), og closure-tabellen er eksplicit current-state-only (`supabase/migrations/20260518000002_t9_org_node_closure.sql:3`-`11`).

Det bryder `_at(p_date)`-semantikken: en bruger der spørger på historisk dato bliver autoriseret efter sin nuværende placering og nuværende org-tree, ikke den historiske placering/tree. Resultatet kan både skjule historiske rows der burde være synlige og vise rows i et current subtree der ikke var brugerens subtree på `p_date`.

Anbefalet handling: V2 skal planlægge date-aware ACL for historiske reads, fx `acl_subtree_org_nodes_at(p_employee_id, p_date)` og `acl_subtree_employees_at(p_employee_id, p_date)`, bygget direkte over `org_node_versions` + placement-tabeller effective på `p_date` (ikke `org_node_closure`). Brug `_at`-helpers i `_at`-RPCs og lad current wrappers kalde med `current_date`. Tilføj smoke-test hvor caller/target/tree ændrer sig over tid, så current-date ACL ville give forkert resultat.

### [KRITISK] `client_placement_read[_at]` kan ikke virke for non-admin under nuværende RLS

Konkret afvigelse: Planen siger at `client_placement_read[_at]` skal være visibility/scoped og returnere forventede rows for en throwaway-role med relevant permission/placement (`docs/coordination/T9-supplement-plan.md:119`, `docs/coordination/T9-supplement-plan.md:225`-`230`). Den eksisterende read-RPC er `SECURITY INVOKER` og læser direkte fra `core_identity.client_node_placements` (`supabase/migrations/20260518000008_t9_read_rpcs.sql:50`-`65`). Tabellen har kun SELECT-policy for `core_identity.is_admin()` (`supabase/migrations/20260518000004_t9_client_node_placements.sql:49`-`51`).

Konsekvens: en non-admin caller med subtree/visibility-rettighed får stadig tomt resultat eller RLS-blokering, fordi RLS filtrerer tabellen før RPC'ens planlagte `node_id`-filter kan hjælpe. Planens testforventning om non-admin expected rows kan derfor ikke bygges som beskrevet.

Anbefalet handling: V2 skal vælge en konkret mekanik for client-read. Enten udvid SELECT-policy'en på `client_node_placements` med en sikker scoped policy, eller lav `client_placement_read[_at]` som en kontrolleret read-helper/RPC der kan læse tabellen og selv håndhæver date-aware scope. Bevar direct-table default-deny for uautoriserede brugere i tests.

### [KRITISK] Schema-exposure fitness-check tester anon/skipper CI, ikke authenticated PostgREST access

Konkret afvigelse: Krav-dok kræver end-to-end test "som authenticated bruger" mod en T9-RPC i `core_identity` (`docs/coordination/T9-supplement-krav-og-data.md:77`-`84`). Planens fitness-check bruger kun `SUPABASE_ANON_KEY`, kalder `POST /rest/v1/rpc/org_tree_read`, forventer HTTP 200 og skipper hvis env-var mangler (`docs/coordination/T9-supplement-plan.md:127`-`134`). CI eksponerer kun `SUPABASE_ACCESS_TOKEN` i workflowet (`.github/workflows/ci.yml:18`-`21`), og `pnpm fitness` kører uden `SUPABASE_ANON_KEY` (`.github/workflows/ci.yml:60`-`61`).

Der er to tekniske fejl her:

- En anon-key er ikke en authenticated user-JWT. Med de eksisterende grants (`grant select ... to authenticated`, fx `org_node_versions` i `supabase/migrations/20260518000001_t9_org_nodes.sql:97`-`101`) kan anon-kald få `42501` selvom schema exposure er korrekt.
- Checket bliver ikke CI-blocker hvis `SUPABASE_ANON_KEY` ikke føjes til workflow/secrets. Planen kalder det CI-blocker (`docs/coordination/T9-supplement-plan.md:142`), men den beskrevne env-model gør det til et silent skip.

Anbefalet handling: V2 skal gøre schema-exposure testen deterministisk. Brug en rigtig authenticated JWT for en seed/test-bruger (`Authorization: Bearer <user-jwt>` + `apikey`) eller dokumentér et andet HTTP-signal der skelner "function exposed" fra "permission denied" uden at påstå authenticated success. Tilføj nødvendige CI env-vars eksplicit, og fail i CI hvis de mangler for denne check. SQL-only `set_config('request.jwt.claim.sub', ...)` er ikke nok til at bevise PostgREST schema exposure.

### [KRITISK] Close/remove-handlernes exact-start branch kan stadig skabe zero-length intervals

Konkret afvigelse: Planens generelle split-mønster håndterer exact-start ved at opdatere aktiv row (`docs/coordination/T9-supplement-plan.md:88`-`93`), men for lukke-operationer reduceres algoritmen til "Find aktivt interval; UPDATE effective_to = p_effective_from" (`docs/coordination/T9-supplement-plan.md:98`-`101`). Det reproducerer den samme zero-length-fejl for close/remove, hvis det aktive interval starter præcis på `p_effective_from`. Placement-tabellerne og org versions har `check (effective_to is null or effective_from < effective_to)` (`supabase/migrations/20260518000003_t9_employee_node_placements.sql:23`-`25`, `supabase/migrations/20260518000004_t9_client_node_placements.sql:21`-`23`, `supabase/migrations/20260518000001_t9_org_nodes.sql:52`-`58`).

Eksempel: `employee_node_placements(employee=A, effective_from='2026-06-01', effective_to=null)`, kald `_apply_employee_remove(... effective_from='2026-06-01')`. Planens close-algoritme sætter `effective_to='2026-06-01'`, og CHECK fejler. Samme mønster rammer `client_close`, `team_close` placement-cascade og `org_node_deactivate`/team version-lukning, medmindre de får særskilte exact-start branches.

Anbefalet handling: V2 skal specificere close/remove branch per tabeltype:

- no active interval at D: no-op
- active.effective_from = D på placement-close: fjern/neutraliser intervallet uden zero-length row
- active.effective_from = D på org-node deactivate/team_close: update samme version til inactive i stedet for close+insert
- active.effective_from < D: split/close ved D
- active.effective_to = D: no-op / boundary behandles eksplicit

Tilføj smoke-tests for exact-start på `_apply_employee_remove`, `_apply_client_close`, `_apply_team_close` og `_apply_org_node_deactivate`, ikke kun place-handlers.

### [MELLEM] Plan-branch mangler committed krav-dok

Konkret afvigelse: `docs/coordination/aktiv-plan.md:7` og planen selv (`docs/coordination/T9-supplement-plan.md:16`) peger på `docs/coordination/T9-supplement-krav-og-data.md`, men filen er ikke tracked på branchens commit (`git ls-files` viser kun plan + aktiv-plan; filen står som untracked lokalt). Det gør plan-reviewet ikke reproducerbart fra branch/remote, og en ny reviewer/CI checkout mangler det kravgrundlag planen bygger på.

Anbefalet handling: Commit krav-dokumentet på samme plan-branch i V2, eller flyt planen til den branch hvor krav-dokumentet allerede er committed. Claude.ai's untracked approval-fil skal ikke bruges som kilde til plan-state.

### [MELLEM] Testplanen dækker ikke alle handler-typer den påstår at afdække

Konkret afvigelse: Planen siger at smoke-test skal verificere alle 5 edge-cases "per handler-type" for Step 2 (`docs/coordination/T9-supplement-plan.md:176`), men test-konsekvensen nævner kun alle 5 edge-cases for `_apply_employee_place` og `_apply_client_place`, plus historisk remove/close (`docs/coordination/T9-supplement-plan.md:217`-`219`). De mest risikable exact-start/pre-history cases for `_apply_org_node_upsert`, `_apply_org_node_deactivate` og `_apply_team_close` er ikke eksplicit dækket.

Anbefalet handling: Udvid V2 testplanen med mindst exact-start + split + future-preserve for org-node upsert/deactivate og team_close. Hvis fuld matrix bliver for stor, dokumentér bevidst hvilke handler-typer der deler helper og test helperen direkte.
