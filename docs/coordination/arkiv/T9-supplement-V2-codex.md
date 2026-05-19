# T9-supplement V2 — Codex feedback

**Review-type:** Plan V2  
**Rolle:** Codex kode-review, teknisk gennemførlighed  
**Resultat:** FEEDBACK  
**Oprydnings- og opdaterings-strategi:** OK — sektionen findes og er konkret (`docs/coordination/T9-supplement-plan.md:393`).

## Fund

### [KRITISK] `client_placement_read_at` bliver stadig current-scope ∩ historical-scope

Konkret afvigelse: V2 indfører date-aware ACL for `_at(p_date)`-RPCs (`docs/coordination/T9-supplement-plan.md:158`-`167`) og siger at visibility-RPCs autoriseres efter historisk placering på `p_date`, ikke nuværende (`docs/coordination/T9-supplement-plan.md:211`-`215`). Men `client_node_placements`-policy'en planlægges udvidet med current-date ACL (`docs/coordination/T9-supplement-plan.md:173`-`185`), og den eksisterende `client_placement_read_at` er `SECURITY INVOKER` og læser tabellen direkte (`supabase/migrations/20260518000008_t9_read_rpcs.sql:50`-`65`).

Det betyder at RLS filtrerer client rows med `acl_subtree_org_nodes(current_employee_id())` før RPC'ens `acl_subtree_org_nodes_at(..., p_date)` kan gøre historisk scope. Resultatet bliver ikke "historisk scope"; det bliver intersection mellem nuværende scope og historisk scope. Konkret scenarie: caller var placeret over team A på `2026-06-01`, men er i dag flyttet væk. `client_placement_read_at(client_i_team_A, '2026-06-01')` skal ifølge date-aware V2 returnere row, men RLS current-policy filtrerer den væk før RPC-filteret.

Anbefalet handling: V3 skal vælge én teknisk model og gøre den konsistent:

- Hvis client-historik skal følge historisk scope: planlæg `client_placement_read[_at]` som kontrolleret read-RPC/helper der kan læse `client_node_placements` og håndhæver date-aware ACL selv, eller brug en session-var/policy-mekanisme der får `p_date` ind i RLS uden direct-table leak.
- Hvis client-historik bevidst kræver nuværende visibility: skriv det som særregel i RPC-tabellen og testplanen, og fjern påstanden/testen om at alle visibility-RPCs følger historisk placering på `p_date`.

### [KRITISK] Team-no-children trigger skal validere interval-overlap, ikke kun effective_from

Konkret afvigelse: V2 fastholder team-retype som trigger-fix (`docs/coordination/T9-supplement-plan.md:274`-`279`) og backdated traversal som version-split (`docs/coordination/T9-supplement-plan.md:281`-`286`), men planen specificerer kun "parent ER ikke team + retype kan ikke laves hvis node har children". Den eksisterende trigger validerer parent-team kun ved `NEW.effective_from` (`supabase/migrations/20260518000001_t9_org_nodes.sql:156`-`180`). Med backdated/future intervals er det ikke nok.

Eksempel: afdeling D har ingen child på `2026-03-01`, men child C med `parent_id = D` starter `2026-06-01`. En backdated retype af D til team fra `2026-03-01` kan passere en `effective_from`-only check, men skaber team med child fra `2026-06-01`. Den inverse fejl findes også: en child-version kan indsættes/backdates med parent D på en dato hvor D ikke er team ved startdatoen, men hvor parentens team-version overlapper senere i child-versionens interval.

Anbefalet handling: V3 skal specificere `_org_node_team_no_children_check()` som interval-overlap-invariant:

- Når `NEW.parent_id` sættes, må child-versionens `[NEW.effective_from, NEW.effective_to)` ikke overlappe nogen parent-version hvor `node_type = 'team'`.
- Når `NEW.node_type = 'team'`, må team-versionens interval ikke overlappe nogen child-version hvor `parent_id = NEW.node_id`.
- Brug `daterange(effective_from, coalesce(effective_to, 'infinity'::date), '[)') && ...` eller tilsvarende overlap-predikat.
- Udvid `t9_org_nodes.sql` med en backdated/future-child case, ikke kun "department med children nu".

### [MELLEM] Service-role exposure-check fanger ikke authenticated PostgREST path

Konkret afvigelse: V2's Management API-kald til `/api-keys` er teknisk plausibelt; endpointet svarer `200` fra denne session. Service-role PostgREST-kaldet er også et godt deterministisk schema-exposure signal (`docs/coordination/T9-supplement-plan.md:217`-`252`). Men det beviser ikke at en almindelig `authenticated` bruger kan kalde T9-RPC'er via PostgREST. Tidligere T9-fejl har netop ligget i grants/callability, og service-role kan maskere den klasse fejl.

Anbefalet handling: Behold service-role checken som schema-exposure canary, men tilføj en separat authenticated PostgREST-smoke med rigtig user JWT eller en eksplicit grant/callability-verifikation der fejler hvis `authenticated` ikke kan kalde mindst én T9 read-RPC. Hvis JWT-flowet er for tungt i CI, dokumentér det som G-nummer, men service-role-checken bør ikke beskrives som fuld authenticated E2E-verifikation.
