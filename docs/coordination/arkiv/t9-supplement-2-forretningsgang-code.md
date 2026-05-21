# T9-supplement-2 — forretningsgang-rapport (Code)

**Pakke:** T9-supplement-2 (G057 + G059)
**Aktør:** Code
**Kilder:** kode + master-plan + vision
**Dato:** 2026-05-21

## Resume

T9-supplement-2 lukker to T9-fundament-mangler der blev observeret under trin 10's build: (1) superadmin kan ikke bypasse to T9 forretnings-invariants (placering på inaktivt team + lukning af allerede-inaktivt team), selvom princip 2 siger "superadmin må alt"; (2) fem T9 public-wrapper-RPC'er kan ikke kaldes fra authenticated bruger via UI fordi de mangler `stork.t9_write_authorized`-session-var FØR `pending_change_request`. Pakken er konsistens-fix mod eksisterende T9-disciplin og trin 10's etablerede bypass-mønster.

## Forretningsgange/logikker

### Superadmin kan placere klient på lige-lukket team (nød-operation)

**Hvad ved vi?** T9's `_apply_client_place` raiser `client_placement_requires_active_team` med errcode P0001 hvis target-team ikke er aktivt på effective_from-datoen (`supabase/migrations/20260520000000_t9_supplement.sql:317`). Trin 10's `_apply_client_place` (T10.7b, `supabase/migrations/20260521000008_t10_client_active_check.sql`) tilføjede `is_admin_by_employee_id`-bypass på klient-aktiv-check, men ikke på team-aktiv-check. Vision-princip 2: superadmin må alt (1. princip). Forretnings-implikation: superadmin kan ikke flytte klient til team i exact-moment efter team er lukket, selvom det er legitim nød-operation.

### Superadmin kan lukke allerede-inaktivt team (idempotens-bypass)

**Hvad ved vi?** T9's `_apply_team_close` raiser `team_close_already_inactive` med errcode 22023 hvis target-team allerede er inaktivt (`supabase/migrations/20260520000000_t9_supplement.sql:599`). Forretnings-invariant matcher V2-disciplin men ikke vision-princip 2's bypass-mønster. Strukturelle invariants (`team_close_not_team`) bevares uden bypass — data-model holder kun ved team-niveau-binding. Forretnings-implikation: superadmin kan ikke rydde op i historisk pending der opretter close mod allerede-inaktivt team.

### Authenticated bruger kan oprette org-træ-ændringer via UI

**Hvad ved vi?** Master-plan §1.7 (T9-omstart-ramme punkt 12): "Hvem der må oprette/ændre/lukke knuder styres via rettigheder i UI." Implicerer at authenticated bruger med relevant permission kan kalde wrappers. T9-supplement RLS-policy på `core_identity.pending_changes` (`supabase/migrations/20260518100000_t9_fundament_supplement.sql:49-51`) kræver `current_setting('stork.t9_write_authorized', true) = 'true'` for INSERT. Trin 10's `client_node_place` + `client_node_close` sætter session-var FØR `pending_change_request` (T10.7b-mønster). De fem org/employee-wrappers (`org_node_upsert`, `org_node_deactivate`, `team_close`, `employee_place`, `employee_remove_from_node` i `20260518000007_t9_public_wrapper_rpcs.sql`) mangler den sætning — INSERT fejler for authenticated bruger med FORCE RLS. Forretnings-implikation: hvis frontend bygges nu (lag F), kan administrator ikke oprette/lukke teams eller placere medarbejdere via UI.

### T9-smoke-tests verificerer ikke wrapper-vejen

**Hvad ved vi?** T9-smoke-tests (`supabase/tests/smoke/t9_*.sql`) kalder `_apply_*`-handlers direkte (SECURITY DEFINER) i stedet for at gå via wrappers. Det er hvorfor G059 ikke blev opdaget i T9-build (smoke-grøn ≠ wrapper-funktionel). Trin 10 etablerede mønstret med `t10_client_active_check.sql` der bruger rolle-swap til at teste wrapper-vejen som authenticated non-admin (`supabase/tests/smoke/t10_client_active_check.sql`). Forretnings-implikation: T9-tests skal udvides med wrapper-flow før vi kan stole på at frontend-integration virker.

### Migration-deploy-rækkefølge: G059 før G057

**Hvad ved vi?** G059 (session-var-fix) er forudsætning for at smoke-teste de berørte wrappers. G057 (superadmin-bypass) er tilføjelse af is_admin-check i apply-handlers. Hvis G057 implementeres uden G059, kan vi ikke verificere bypass-vejen via wrapper-flow (apply triggers fra pending kalder ind via `pending_change_apply`, ikke fra wrapper direkte — men test-fixture skal stadig oprette pending via wrapper). Forretnings-implikation: bygge-rækkefølge betyder noget; G059 først så G057 kan testes fuldt.

### Cutover-relevans: ingen direkte påvirkning

**Hvad ved vi?** G057 + G059 er teknisk gæld der ikke blokerer cutover (jf. teknisk-gaeld.md). Frontend-integration (lag F) afhænger af G059 fix; G057 er polish for nød-operationer. Cutover-checklist (`docs/coordination/cutover-checklist.md`) lister ikke G057/G059 som blockere. Forretnings-implikation: pakke kan udsættes uden cutover-risiko, men låser frontend-roadmap hvis udsat for længe.
