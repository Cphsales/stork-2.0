# Codex review — T9-supplement PR #44 runde 1

**Review-type:** PR code review
**PR:** #44
**Branch:** `claude/T9-supplement-build`
**Head reviewet:** `70fd47b`
**Resultat:** FEEDBACK

## Fund

### [KRITISK] Migrationen ændrer eksisterende RETURNS TABLE-kontrakter med CREATE OR REPLACE

**Fil/linje:** `supabase/migrations/20260520000000_t9_supplement.sql:714`, `:752`, `:947`

**Problem:** De tre eksisterende RPCs `permission_elements_read()`, `role_permissions_read(uuid)` og `pending_changes_read()` oprettes i Step 9 med andre `RETURNS TABLE`-kolonner end supplement-migrationen nu forsøger at erstatte. PostgreSQL accepterer ikke `CREATE OR REPLACE FUNCTION` når return type ændres; migrationen vil fejle med "cannot change return type of existing function" og stoppe `db push`.

**Konkret afvigelse:** Step 9 definerer blandt andet `permission_elements_read()` som flat `(level, element_id, parent_id, ...)`, mens supplementet ændrer den til `(area_id, area_name, ..., page_id, ..., tab_id, ...)`. Samme mønster gælder `role_permissions_read(uuid)` og `pending_changes_read()`.

**Anbefalet handling:** Bevar de eksisterende return signatures og læg gates/session-var rundt om samme kontrakt. Hvis API-kontrakten bevidst skal ændres, skal migrationen først `DROP FUNCTION ...` for de berørte RPCs og samtidig opdatere tests, type-codegen og alle callers. For denne pakke er det sikreste fix at bevare Step 9-kontrakten.

### [KRITISK] `t9_backdated_historical_traversal.sql` kan ikke passere efter read-gates

**Fil/linje:** `supabase/tests/smoke/t9_backdated_historical_traversal.sql:69`, `:74`, `:79`

**Problem:** Testen validerer `_apply_employee_place` via `employee_placement_read_at(...)`. Efter supplement-migrationen filtrerer `employee_placement_read_at` på `core_identity.current_employee_id()`/ACL i `supabase/migrations/20260520000000_t9_supplement.sql:862-866`. Testen sætter ingen `request.jwt.claim.sub`, så `current_employee_id()` bliver `NULL`, og read-RPC'en returnerer tomt resultat. T1 vil derfor fejle selv hvis handleren skrev korrekt state.

**Konkret afvigelse:** Testen er en handler-state-test, men bruger et auth-gated read-RPC som oracle uden auth-context.

**Anbefalet handling:** Valider handler-output direkte mod `core_identity.employee_node_placements` i denne smoke-test, eller sæt en reel auth-context med fixture-employee før read-RPC-kald. Da testen handler om backdated traversal og ikke read-gates, er direkte tabelassertions mest robust.

### [MELLEM] Backdated/team-retype smoke coverage matcher ikke V4-planens dækningskrav

**Fil/linje:** `supabase/tests/smoke/t9_backdated_historical_traversal.sql:52-207`

**Problem:** V4-planen kræver alle 5 edge-cases for alle 7 apply-handlers og udvidelse af `t9_org_nodes.sql` med team-retype overlap-cases. PR'en tilføjer kun en delmængde: `_apply_org_node_upsert` og `_apply_team_close` kaldes ikke i den nye test, client place/close dækker ikke alle edge-cases, og `t9_org_nodes.sql` er ikke ændret i PR-diffet.

**Konkret afvigelse:** Planen siger at `_apply_org_node_upsert`, `_apply_team_close`, exact-end/future-preserve og team-retype inverse/backdated-cases skal bevises; PR'en tester dem ikke.

**Anbefalet handling:** Udvid smoke-tests før merge: dæk alle 7 handlers og de specificerede edge-cases, samt opdater eksisterende `t9_org_nodes.sql` for team-retype interval-overlap-invarianten.

### [MELLEM] `t9_read_gates.sql` tester ikke de read-gates den beskriver

**Fil/linje:** `supabase/tests/smoke/t9_read_gates.sql:47-99`

**Problem:** Kommentarerne beskriver tre lag: no-permission runtime, fixture-role med permission, date-aware auth og superadmin. Implementationen opretter en throwaway role/employee uden auth mapping, men bruger derefter kun en seed-superadmin auth-context. Den tester ikke at admin-only RPCs raiser 42501 for en non-admin, ikke at fixture-permission giver adgang, og ikke at visibility-RPCs returnerer empty/scoped for en almindelig bruger.

**Konkret afvigelse:** Testen kan passere selv om `_require_read_permission` eller visibility-scope er forkert for non-admin brugere.

**Anbefalet handling:** Opret en hermetisk auth-context for fixture-employee eller brug eksisterende testmønster for `request.jwt.claim.sub`; test både no-permission, granted fixture-role og superadmin. Tilføj den planlagte date-aware case hvor caller har placement på `p_date_1` men ikke `p_date_2`.

### [MELLEM] Type-codegen og placeholder-guard er ikke leveret

**Fil/linje:** `packages/types/src/database.ts:1`, `scripts/types-check.sh:11-13`

**Problem:** T9-supplement V4 Step 6 kræver `pnpm types:generate`, fjernet placeholder-guard og committede typer. PR-diffet ændrer hverken `packages/types/src/database.ts` eller `scripts/types-check.sh`; `database.ts` er stadig placeholder, og drift-check skipper stadig.

**Konkret afvigelse:** PR-titlen/body inkluderer type-codegen i pakken, men kodeleverancen leverer ikke type-codegen.

**Anbefalet handling:** Kør type generation når schema-exposure/migration-state er klar, commit `packages/types/src/database.ts`, og fjern placeholder-skip i `scripts/types-check.sh`. Hvis dette bevidst flyttes ud, skal PR-scope og slutrapport sige det eksplicit.

### [MELLEM] Schema-exposure fitness-check er service-role/soft-fail, ikke authenticated/hard-fail

**Fil/linje:** `scripts/fitness.mjs:1002-1081`

**Problem:** Krav 1 kræver end-to-end verifikation som authenticated bruger. Checken kalder PostgREST med service-role key, og flere fejlveje (`/api-keys` non-OK, missing service key, unexpected PostgREST status, netværksfejl) markeres `soft: true`, så fitness kan ende grøn selvom verifikationen ikke reelt er udført.

**Konkret afvigelse:** Checken fanger aktuelt PGRST202 og fejler korrekt, men den beviser ikke authenticated-callability, og den er ikke hard-fail for alle verifikationsfejl.

**Anbefalet handling:** Gør CI-missing `SUPABASE_ACCESS_TOKEN` og Management API-/PostgREST-verifikationsfejl hard-fail i CI. Supplér service-role schema-canary med authenticated callability-test, eller flyt authenticated-delen til smoke-test med tydelig fail.

## Verifikation

- `pnpm fitness` kørt: fejler på `postgrest-t9-schema-exposure` med PGRST202 for `org_tree_read`, som PR-body forventer.
- Ingen kodeændringer udført.
