# T9-supplement — Plan V4

## V4 åbnings-sektion — Codex V3 approval + 2 OPGRADERING-forslag

V3 modtog **APPROVAL** fra Codex med 2 OPGRADERING-forslag + 1 kosmetisk note. Begge OPGRADERING ACCEPTERET; kosmetisk note løst.

### OPGRADERING 1 — Eksplicit funktionslokal session-var i alle entrypoints

**ACCEPTERET.** Codex' bekymring valid: `set_config(..., true)` er transaction-local, ikke function-local. En tidligere `_at`-kald i samme transaction kan efterlade `stork.t9_read_at_date` der påvirker efterfølgende current-read.

**V4-fix:** Alle 9 read-RPC entrypoints sætter session-var eksplicit:

- `_at`-RPCs sætter `set_config('stork.t9_read_at_date', p_date::text, true)` FØR SELECT
- **Current-wrappers sætter også eksplicit:** `set_config('stork.t9_read_at_date', current_date::text, true)` FØR SELECT (ikke bare passthrough til `_at(current_date)`)
- Deterministisk adfærd uafhængigt af tidligere transactions-state

Plan-konsekvens: Step 3c udvidet; alle 9 read-RPCs er plpgsql med eksplicit session-var-set i body.

### OPGRADERING 2 — Deklarativ has_function_privilege + korrekt fixture-role i runtime-test

**ACCEPTERET.** Codex' bekymring valid: `42501` kan komme fra både function-EXECUTE-grant missing og intern `_require_read_permission` raise — tvetydigt.

**V4-fix:** Tre-lags test i `t9_read_gates.sql`:

1. **Deklarativ EXECUTE-grant assertion** for alle 9 read-RPCs:

   ```sql
   assert has_function_privilege('authenticated', 'core_identity.org_tree_read()'::regprocedure, 'EXECUTE'),
     'EXECUTE-grant mangler for authenticated';
   ```

   Gentages for alle 9 RPCs. Fail = klar besked om hvilken grant der mangler.

2. **Runtime-call uden permission** (skal raise 42501 fra intern `_require_read_permission` for admin-only-RPCs; eller returnere empty for visibility-RPCs)

3. **Runtime-call med korrekt fixture-role** (throwaway-role med permission seedet → admin-only ikke raiser; visibility returnerer fixture-rows)

Plan-konsekvens: Test-konsekvens for `t9_read_gates.sql` udvidet med eksplicit `has_function_privilege`-sektion + tydelig adskillelse mellem permission-test (uden grants/permission) og callability-test (med grants + relevant permission).

### Kosmetisk fix

Dubleret linje om `employee_node_placements_select` fjernet (linje 214/216).

---

## V3 åbnings-sektion — Codex V2 fund-håndtering

V2 modtog 2 KRITISK + 1 MELLEM fund. Alle adresseret konkret:

| Fund                                                                                                                 | Klasse  | V3-håndtering                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client_placement_read_at` bliver current ∩ historical scope (RLS filtrerer current før RPC kan date-aware-filtrere) | KRITISK | **ACCEPTERET.** Valg 2 omskrevet: RLS-policy bruger session-var `stork.t9_read_at_date` (default = current_date) som date-parameter til ACL. `_at`-RPC sætter session-var FØR SELECT; current-wrapper sætter ikke. Bevarer §1.1 (INVOKER, ingen DEFINER på forretningsfunktion).                                                        |
| Team-no-children trigger skal validere interval-overlap, ikke kun `effective_from`                                   | KRITISK | **ACCEPTERET.** Step 1 omskrevet: trigger bruger daterange-overlap (`&&`) — to-vejs invariant: (a) når `NEW.parent_id` sættes må child-intervallet ikke overlappe team-version af parent; (b) når `NEW.node_type='team'` må team-intervallet ikke overlappe child-version af denne node. Test udvides med backdated/future-child-cases. |
| Service-role exposure-check fanger ikke authenticated PostgREST-path                                                 | MELLEM  | **ACCEPTERET.** Valg 3 udvidet: behold service-role som schema-exposure-canary + tilføj SQL-baseret authenticated-callability-check (`set local role authenticated` + RPC-kald via DB) som anden lag. JWT-baseret PostgREST-test som G-nummer hvis SQL-niveau ikke fanger PostgREST-specifik callability.                               |

Ingen OPGRADERING-forslag i V2-feedback.

---

## V2 åbnings-sektion — Codex V1 fund-håndtering

V1 modtog 4 KRITISK + 2 MELLEM fund. Alle adresseret konkret:

| Fund                                               | Klasse  | V2-håndtering                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Historiske read-gates bruger current-state ACL     | KRITISK | **ACCEPTERET.** Valg 2 omskrevet: nye date-aware helpers `acl_subtree_org_nodes_at(employee_id, p_date)` + `acl_subtree_employees_at(employee_id, p_date)` over `org_node_versions` + placement-tabeller (ikke closure). `_at`-RPCs bruger date-aware; current-wrappers kalder med `current_date`.                                        |
| `client_placement_read[_at]` blokeret af RLS       | KRITISK | **ACCEPTERET.** Verificeret: `client_node_placements_select` policy bruger `using (core_identity.is_admin())` (Step 5, linje 49-51). V2 udvider policy til `using (is_admin() OR node_id = ANY(acl_subtree_org_nodes(current_employee_id())))`. Rettighed evalueres på current_date (forretningsregel); historisk dato-filter sker i RPC. |
| Schema-exposure fitness-check skipper CI/anon-only | KRITISK | **ACCEPTERET.** V2 ændrer fitness-check til at hente service-role-key via Supabase Management API (kun `SUPABASE_ACCESS_TOKEN` kræves, allerede i CI), kalde PostgREST med service-role → deterministisk 200 hvis exposed, PGRST202 hvis ej. Hard-fail hvis env mangler — ikke silent skip.                                               |
| Close/remove exact-start zero-length               | KRITISK | **ACCEPTERET.** Valg 1 udvidet: close/remove får eksplicit per-tabel exact-start branches (placement-tabeller: DELETE; org_node_versions deactivate/team_close: UPDATE is_active=false). Test-konsekvens udvidet til alle close/remove-handlers.                                                                                          |
| Plan-branch mangler committed krav-dok             | MELLEM  | **LØST.** Krav-dok + Claude.ai V1-approval committet på plan-branch i separat commit før V2.                                                                                                                                                                                                                                              |
| Test-plan dækker ikke alle handler-typer           | MELLEM  | **ACCEPTERET.** Test-konsekvens udvidet med exact-start + split + future-preserve for `_apply_org_node_upsert`, `_apply_org_node_deactivate`, `_apply_team_close`.                                                                                                                                                                        |

Ingen OPGRADERING-forslag i V1-feedback.

---

## Formål

> Denne pakke leverer: en append-only supplement-migration der lukker de 6 åbne T9-fund (team-retype, schema-exposure-verifikation, backdated traversal, read-gates, Step 12 robusthed, type-codegen) så T9-fundamentet er fuldt funktionelt og fremtidige pakker kan bygge oven på det uden at genåbne fundament-arbejde.
>
> Hvis fundet under review ikke bringer os tættere på dette: G-nummer, ikke blocker.

---

## Scope

**I scope:**

- Master-plan-paragraffer: §1.7 (identitet og rettigheder), §1.1 (adgangs-mekanik — vi udvider IKKE rammen, kun anvender den)
- Krav-specs: `docs/coordination/T9-supplement-krav-og-data.md` §Krav 1-5
- T9-fund: Codex KRITISK 1 (team-retype), KRITISK 3 (schema-exposure verifikation — Mathias' afgørelse #4), KRITISK 4 (backdated guards), MELLEM (read-gates), MELLEM (type-codegen), MELLEM (Step 12 robusthed)
- Rettelser fra master-plan: rettelse 35 (§1.7-omskrivning) er forudsætning, ikke ændring

**IKKE i scope:**

- Import-stubs (Step 10's `.mjs`-filer) og krav-dok 4.8 discovery+execute — udskudt jf. Mathias-afgørelse #3 (manuelt udtræk + direkte upload)
- §1.1 / §1.7 / §1.13 princip-diskussion — lukket i PR #39
- Genåbning af T9-fundament-arbejde — pakken er append-only
- core_compliance / core_money schema-exposure — Mathias har eksponeret manuelt; ingen kode-ændring nødvendig
- T9-test-fixture-refactor — leveret i PR #43, lukket via G053

---

## Strukturel beslutning

Pakken indeholder ét arkitektur-valg der binder fremtidige pakker: **read-RPC-gates introducerer eksplicit RPC-lag oven på RLS for visse RPC-kategorier**.

Begrundelse: Krav 3 specificerer at read-gates ikke må svække RLS, men skal pålideligt afvise/scope. To-lags-mønstret (RLS som lavest niveau + RPC-gates som applikations-lag) etablerer at:

- RLS er sandhedsgrænsen for tabel-adgang
- RPC-gates oversætter RLS-tom-resultat til 42501 hvor det giver brugeren mere klar fejl (admin-only-views)
- For visibility-baserede RPCs returneres tomt resultat — caller skal eksplicit håndtere "ingen rows" i UI

Fremtidige pakker (lag E sales-RPCs) skal følge samme mønster: admin-only-view → permission_denied; visibility-baseret → scoped/empty.

---

## Mathias' afgørelser (input til denne plan)

- **Afgørelse 1:** Backdated effective_from er tilladt med historisk traversal — ikke forbudt
- **Begrundelse:** Brugeren skal kunne vælge dato i UI (default i dag, kan vælges tilbage eller frem). Princippet gælder bredt — alle effective_from-handlers, ikke kun medarbejder-placements
- **Plan-konsekvens:** Alle 7 apply-handlers refaktoreres til interval-split-mønster

- **Afgørelse 2:** Read-RPC rettigheder skal være pålidelige; mekanik afgøres af Code
- **Begrundelse:** Krav er at rettigheder virker og er til at stole på
- **Plan-konsekvens:** Mixed strategi (permission_denied for admin-only-views; scoped/empty for visibility-baseret) — se Valg 2 nedenfor

- **Afgørelse 3:** Import-scope udskydes; krav-dok 4.8 er forældet (manuelt udtræk + direkte upload)
- **Begrundelse:** Ingen import-RPC'er, ingen UI, ingen ETL
- **Plan-konsekvens:** `scripts/migration/t9-org-tree-{discovery,upload}.mjs` slettes; krav-dok 4.8 markeres obsolete i T9 slut-rapport-arkiv

- **Afgørelse 4:** Alle 5 schemas er eksponeret på remote og skal forblive eksponeret; pakken verificerer, eksponerer ikke nye
- **Begrundelse:** Mathias har manuelt tilføjet core-schemas i Dashboard
- **Plan-konsekvens:** End-to-end verifikation + lokal `config.toml`-drift-fix; ingen Dashboard-handling i pakken

- **Afgørelse 5:** Step 12's hardkodning af mg@/km@ er OK
- **Begrundelse:** Bootstrap-seed ≠ test-fixture; G053 forbyder kun seed-users som mutable fixtures i tests
- **Plan-konsekvens:** Step 12 robusthed-DO-block refererer eksplicit mg@/km@ med kommentar om bootstrap-undtagelse

- **Afgørelse 6:** Default-deny på nye tabeller er låst; "Automatically expose new tables" forbliver FRA
- **Begrundelse:** Matcher vision-princip 4 (default = intet)
- **Plan-konsekvens:** Ingen pakke-ændring til Dashboard-konfig; verificeres som del af Krav 1

---

## Tekniske valg (argumentation per Krav-dok §"Tekniske valg overladt til Code")

### Valg 1 — Backdated edge-case implementation

**Anbefaling:** Implementér som "split-at-boundary"-mønster per handler. Hver handler udfører:

```
1. Find aktivt interval på p_effective_from:
     active := SELECT WHERE effective_from <= p_effective_from
                  AND (effective_to IS NULL OR effective_to > p_effective_from)

2. Branch på state:
   a. Hvis NO active interval (pre-history):
        Find tidligst efterfølgende interval (next_from).
        INSERT ny row (effective_from = p_effective_from,
                       effective_to = next_from eller NULL)
   b. Hvis active.effective_from = p_effective_from (exact start):
        UPDATE active SET <ny værdier> (avoid zero-length split).
   c. Hvis active dækker p_effective_from indre (split):
        UPDATE active SET effective_to = p_effective_from.
        INSERT ny row (effective_from = p_effective_from,
                       effective_to = active.<gamle effective_to>).

3. Senere fremtidige intervaller bevares uændret.
```

**Close/remove-operationer (per-tabel exact-start branches — V2 KRITISK 4 fix):**

For **placement-tabeller** (`employee_node_placements`, `client_node_placements`) i `_apply_employee_remove` / `_apply_client_close`:

```
1. Find aktivt interval på p_effective_from.
2. Branch:
   a. Hvis NO active interval: idempotent no-op (return)
   b. Hvis active.effective_from = p_effective_from (exact-start):
        DELETE active row (undgår zero-length CHECK violation)
   c. Hvis active.effective_from < p_effective_from (split-close):
        UPDATE active SET effective_to = p_effective_from
   d. Hvis active.effective_to = p_effective_from: idempotent no-op
```

For **org_node_versions** i `_apply_org_node_deactivate` + `_apply_team_close`:

```
1. Find aktivt version på p_effective_from.
2. Branch:
   a. Hvis NO active version: raise (kan ikke deaktivere ikke-eksisterende)
   b. Hvis active.effective_from = p_effective_from (exact-start):
        UPDATE active SET is_active = false (in-place; undgår zero-length)
   c. Hvis active.effective_from < p_effective_from (split-deactivate):
        UPDATE active SET effective_to = p_effective_from
        INSERT ny version (effective_from = p_effective_from, is_active = false,
                           effective_to = active.<gamle effective_to>)
   d. Hvis active.is_active = false allerede: idempotent no-op
```

For **`_apply_team_close`** placement-cascade: efter team-version-deactivate, kald placement-close-logik (case a-d ovenfor) på alle employee + client placements der har `node_id = team_node_id` og er aktive på `p_effective_from`.

**Begrundelse for differentieret close-branch:** Placement-rows er event-baserede (start/slut af medarbejderens tilknytning); DELETE ved exact-start er rent. Org-node-versions er state-baserede (knude eksisterer altid, men kan være aktiv/inaktiv); UPDATE is_active in-place ved exact-start bevarer historisk identity uden zero-length.

**Begrundelse for anbefaling samlet:** Mønstret er rent — udtømmende case-analyse pr. handler-type. Alternativ "merge-existing-rows" er kompleks og kan introducere subtile bugs.

### Valg 2 — Read-gates mekanik (V2 KRITISK 1 + KRITISK 2 fix)

**Anbefaling:** To-lags-mønster:

1. **Date-aware ACL-helpers** der respekterer `_at(p_date)`-semantikken
2. **RLS-policy-udvidelse** på `client_node_placements` så non-admin reads kan ramme RPC-filter

**Nye date-aware ACL-helpers (Step 3a):**

```sql
core_identity.acl_subtree_org_nodes_at(p_employee_id uuid, p_date date) returns uuid[]
core_identity.acl_subtree_employees_at(p_employee_id uuid, p_date date) returns uuid[]
```

Bygger over `org_node_versions` + placement-tabeller effective på `p_date` — IKKE `org_node_closure` (current-only). For `acl_subtree_org_nodes_at`: rekursiv CTE over `org_node_versions` (`effective_from <= p_date AND (effective_to IS NULL OR effective_to > p_date)`) startende fra caller's placement-node på `p_date`. For `acl_subtree_employees_at`: placement-rows hvor `node_id = ANY(acl_subtree_org_nodes_at(p_employee_id, p_date))` og placement er aktiv på `p_date`.

**Eksisterende current-helpers bevares** som tynde wrappers: `acl_subtree_org_nodes(p_employee_id)` ↦ `acl_subtree_org_nodes_at(p_employee_id, current_date)`. Backwards-compatible.

**RLS-policy-udvidelse på client_node_placements med session-var (Step 3b — V3 KRITISK 1 fix):**

Verificeret: nuværende `client_node_placements_select` policy bruger `using (core_identity.is_admin())` (Step 5, linje 49-51) → blokerer non-admin reads før RPC-filter kan håndtere scope.

V2's første forsøg brugte `acl_subtree_org_nodes(current_employee_id())` i policy — det skabte current ∩ historical intersection (Codex V2 KRITISK 1). V3-fix bruger session-var-mønster der lader RPC sætte hvilken dato ACL skal evalueres på:

```sql
drop policy if exists client_node_placements_select on core_identity.client_node_placements;
create policy client_node_placements_select on core_identity.client_node_placements
  for select to authenticated
  using (
    core_identity.is_admin()
    or node_id = ANY(
      core_identity.acl_subtree_org_nodes_at(
        core_identity.current_employee_id(),
        coalesce(
          nullif(current_setting('stork.t9_read_at_date', true), '')::date,
          current_date
        )
      )
    )
  );
```

**Mekanik:**

- `_at`-RPC sætter `set_config('stork.t9_read_at_date', p_date::text, true)` FØR SELECT
- Current-wrapper sætter IKKE session-var → coalesce returnerer `current_date` (default)
- RLS evaluerer ACL på samme dato som RPC-filter → ingen intersection
- Bevarer §1.1: ingen DEFINER, INVOKER + session-var-pattern (samme klasse som PR #39's `stork.t9_write_authorized`)

`employee_node_placements_select` er allerede `using (true)` — ingen policy-ændring (men `_at`-RPC sætter alligevel session-var for konsistens; ingen effekt på policy men forbereder hvis policy senere strammes).

**Intern helper for permission_denied-strategi:**

```sql
core_identity._require_read_permission(p_page text, p_tab text) returns void
```

Raiser 42501 hvis `has_permission(p_page, p_tab, false)` returnerer false. Bruges KUN i admin-only-view-RPCs.

**Detaljeret pr. RPC (V2 — date-aware):**

| RPC                                                 | Strategi          | Mekanik                                                                                                                                              |
| --------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `permission_elements_read`                          | permission_denied | `_require_read_permission('permissions', 'manage')`                                                                                                  |
| `role_permissions_read`                             | permission_denied | `_require_read_permission('permissions', 'manage')`                                                                                                  |
| `org_tree_read_at(p_date)`                          | scoped/empty      | Filter `WHERE node_id = ANY(acl_subtree_org_nodes_at(current_employee_id(), p_date))`                                                                |
| `org_tree_read()`                                   | scoped/empty      | Wrapper: kalder `org_tree_read_at(current_date)`                                                                                                     |
| `employee_placement_read_at(p_employee_id, p_date)` | scoped/empty      | Filter via `acl_subtree_employees_at(current_employee_id(), p_date)` + `OR p_employee_id = current_employee_id()` (self altid synlig på enhver dato) |
| `employee_placement_read(p_employee_id)`            | scoped/empty      | Wrapper: `_at(p_employee_id, current_date)`                                                                                                          |
| `client_placement_read_at(p_client_id, p_date)`     | scoped/empty      | Filter `WHERE node_id = ANY(acl_subtree_org_nodes_at(current_employee_id(), p_date))`                                                                |
| `client_placement_read(p_client_id)`                | scoped/empty      | Wrapper: `_at(p_client_id, current_date)`                                                                                                            |
| `pending_changes_read`                              | scoped/empty      | Filter via change_type → page_key mapping (identisk med `pending_changes_select`-policy fra PR #39)                                                  |

**Begrundelse:** Mixed strategi matcher caller-forventning + date-awareness:

- Admin-only-views: 42501 ved manglende adgang
- Visibility-baseret: scoped/empty med korrekt historisk ACL — caller autoriseres efter sin historiske placering på `p_date`, ikke nuværende
- Self altid synlig (egen placement-historik tilgængelig uanset hierarki-ændringer)

### Valg 3 — Schema-exposure end-to-end test (V2 KRITISK 3 fix)

**Anbefaling:** Ny fitness-check `postgrest-t9-schema-exposure` der bruger service-role for deterministisk signal og kræver allerede-existerende CI-env:

```
1. Verificér SUPABASE_ACCESS_TOKEN er sat — fail hvis mangler (ingen silent skip)
2. Hent service-role-key via Management API:
     GET https://api.supabase.com/v1/projects/{project_ref}/api-keys
     Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}
3. Kald PostgREST som service-role:
     POST https://{project_ref}.supabase.co/rest/v1/rpc/org_tree_read
     apikey: <service-role-key>
     Authorization: Bearer <service-role-key>
     Content-Type: application/json
     Body: {}
4. Forventet response:
   - HTTP 200 + JSON array → exposure OK
   - HTTP 404 + PGRST202 → schema NOT exposed → fail
   - Andet → fail med besked
```

**Hvorfor service-role:**

- Service-role har implicit fuld adgang → succes/fail-signal er deterministisk (200 vs PGRST202)
- Anon-key kan returnere 42501 (permission denied) selvom schema er eksponeret — det er flertydigt
- `SUPABASE_ACCESS_TOKEN` er allerede i CI workflow (`.github/workflows/ci.yml:18-21`); ingen ny secret-handling

**`org_tree_read` valgt som test-anker:**

- Eksisterer i `core_identity`
- No-arg → simpelt request
- Returnerer tabel → bekræfter schema-exposure for både function-lookup OG resultat-marshalling

**CI-failure-disciplin:** Hard-fail hvis `SUPABASE_ACCESS_TOKEN` mangler — IKKE silent skip. Skipper kun lokalt for udvikler-flow (samme mønster som `db-rls-policies`-check ift. lokal vs CI).

**Begrundelse:** Service-role giver deterministisk signal uden at blande exposure-test sammen med permission-system-test. Hard-fail i CI sikrer at drift fanges automatisk.

**V3 udvidelse — authenticated-callability-check (Codex V2 MELLEM fix):**

Service-role beviser kun schema lookup. Det fanger ikke om `authenticated`-rolle har EXECUTE-grant på funktionen. T9's tidligere CI-fail-historik viste at grants/callability har været en separat fejl-klasse fra schema-exposure.

Tilføj **SQL-baseret authenticated-callability-check** som anden lag (i ny smoke-test `t9_read_gates.sql`, ikke fitness — fitness kun for schema-exposure):

```sql
-- Inde i tx: skift til authenticated-rolle og kald T9 read-RPC
set local role authenticated;
perform set_config('request.jwt.claim.sub', <fixture_auth_uid>::text, true);
perform core_identity.org_tree_read();
-- Forventet: ingen 42501. Forventet result kan være tom (caller har ingen rows i scope) — det er OK.
-- Fejler hvis grants mangler eller funktion ikke kan kaldes som authenticated.
reset role;
```

**Hvorfor SQL-baseret + ikke JWT-baseret:**

- SQL-niveau check fanger `authenticated`-rolle's EXECUTE-grants — dækker den klasse fejl Codex bekymrer sig om
- JWT-baseret PostgREST-test ville kræve signed JWT-generation i CI (HMAC mod jwt_secret) — kompleks
- **G-nummer dokumenteres** hvis SQL-niveau viser sig at ikke fange PostgREST-specifik callability (parser-quirks, kong-routing osv.). Implementer som senere arbejde hvis nødvendigt.

**Plan-konsekvens:** Test `t9_read_gates.sql` indeholder både service-role canary OG authenticated-callability for T9-RPCs. Fitness-check forbliver service-role-only (schema lookup-canary).

### Valg 4 — Commit-struktur og implementations-rækkefølge

**Anbefaling:** Én append-only migration `20260520000000_t9_supplement.sql` der dækker Krav 1-5 i logisk rækkefølge (helpers → handlers → trigger → step12). Plus orthogonale leverancer som separate commits:

| Commit | Indhold                                                                                                       |
| ------ | ------------------------------------------------------------------------------------------------------------- |
| 1      | Migration `20260520000000_t9_supplement.sql` (alle 6 fund undtagen config.toml + types)                       |
| 2      | `supabase/config.toml`-drift-fix hvis nødvendigt                                                              |
| 3      | Type-codegen: regenerer `packages/types/src/database.ts` + fjern placeholder-guard i `scripts/types-check.sh` |
| 4      | Slet `scripts/migration/t9-org-tree-{discovery,upload}.mjs` (per Afgørelse 3)                                 |
| 5      | Ny fitness-check `postgrest-t9-schema-exposure` i `scripts/fitness.mjs`                                       |
| 6      | Smoke-test `t9_backdated_historical_traversal.sql` + udvidede gate-tests                                      |
| 7      | Slut-rapport + teknisk-gaeld G-numre opdateret                                                                |

**Begrundelse:** Adskilte commits gør review-flow lettere; én PR samler hele pakken. Hver commit kan rulles tilbage uafhængigt hvis behov.

---

## Implementations-rækkefølge

**Step 1 — Team-retype guard med interval-overlap (V3 KRITISK 2 fix)**

- **Hvad:** CREATE OR REPLACE `core_identity._org_node_team_no_children_check()` som **to-vejs interval-overlap-invariant** (daterange `&&` predikat — IKKE `effective_from`-only).
- **Invariant a (når NEW.parent_id sættes):** child-versionens `[NEW.effective_from, NEW.effective_to)` må ikke overlappe nogen parent-version af `NEW.parent_id` hvor `node_type = 'team'`
- **Invariant b (når NEW.node_type = 'team'):** team-versionens `[NEW.effective_from, NEW.effective_to)` må ikke overlappe nogen child-version hvor `parent_id = NEW.node_id`
- **Predikat:**
  ```sql
  daterange(a.effective_from, coalesce(a.effective_to, 'infinity'::date), '[)')
  && daterange(b.effective_from, coalesce(b.effective_to, 'infinity'::date), '[)')
  ```
- **Hvorfor først:** Trigger-funktion er foundational; rør ingen handlere
- **Migration-fil:** `20260520000000_t9_supplement.sql` (section A)
- **Risiko:** Lav-mellem. To-vejs invariant er strammere end nuværende; eksisterende data skal ikke bryde (verificeres som del af migration). CREATE OR REPLACE; trigger fyrer på alle INSERT/UPDATE som før

**Step 2 — Backdated traversal i 7 apply-handlers**

- **Hvad:** CREATE OR REPLACE for `_apply_org_node_upsert`, `_apply_org_node_deactivate`, `_apply_team_close`, `_apply_employee_place`, `_apply_employee_remove`, `_apply_client_place`, `_apply_client_close` med split-at-boundary-mønster
- **Hvorfor:** Den mest komplekse del; skal være atomisk pr. handler
- **Migration-fil:** Samme (section B)
- **Risiko:** Mellem. Logik-bug kan bryde CHECK/EXCLUDE. Mitigation: ny smoke-test verificerer alle 5 edge-cases per handler-type

**Step 3a — Date-aware ACL-helpers (V2 KRITISK 1 fix)**

- **Hvad:** Nye `core_identity.acl_subtree_org_nodes_at(uuid, date)` + `acl_subtree_employees_at(uuid, date)`. Bygger over `org_node_versions` + placement-tabeller effective på p_date. Eksisterende current-helpers refaktoreres til wrappers (kalder `_at` med `current_date`).
- **Hvorfor først:** Read-gates depender på date-aware helpers
- **Migration-fil:** Samme (section C1)
- **Risiko:** Lav. CREATE OR REPLACE; wrapperne bevarer backwards-compat

**Step 3b — RLS-policy-udvidelse på client_node_placements (V2 KRITISK 2 fix)**

- **Hvad:** DROP + CREATE policy `client_node_placements_select` med `using (is_admin() OR node_id = ANY(acl_subtree_org_nodes(...)))`
- **Hvorfor:** Eksisterende `using (is_admin())` blokerer non-admin reads før RPC kan filtrere
- **Migration-fil:** Samme (section C2)
- **Risiko:** Lav. Policy udvider read-adgang; ingen reduktion

**Step 3c — Read-gates på 9 RPCs (V3 KRITISK 1 fix + V4 OPGRADERING 1 — eksplicit session-var i alle entrypoints)**

- **Hvad:** Ny helper `_require_read_permission`. CREATE OR REPLACE for `permission_elements_read`, `role_permissions_read`, `org_tree_read[_at]`, `employee_placement_read[_at]`, `client_placement_read[_at]`, `pending_changes_read`.
- **Alle 9 RPCs er plpgsql** (ikke sql-language) for at sætte session-var eksplicit i body.
- **`_at`-RPCs sætter session-var FØR SELECT:**
  ```sql
  perform set_config('stork.t9_read_at_date', p_date::text, true);
  ```
- **Current-wrappers sætter OGSÅ session-var eksplicit (V4 OPGRADERING 1):**
  ```sql
  perform set_config('stork.t9_read_at_date', current_date::text, true);
  ```
  Sætter eksplicit i stedet for at lade coalesce-default håndtere det. Forhindrer en tidligere `_at`-kald i samme transaction fra at efterlade session-var med forkert dato → deterministisk adfærd uafhængigt af transactions-state.
- **Hvorfor:** Bygger på Step 3a (date-aware helpers) + Step 3b (session-var policy)
- **Migration-fil:** Samme (section C3)
- **Risiko:** Lav. Scoped filtering kan kun reducere result-set; aldrig eskalere

**Step 4 — Step 12 robusthed-DO-block**

- **Hvad:** Idempotent DO-block der verificerer superadmin + mg@/km@ role_id; raiser hvis bootstrap-emails mangler
- **Migration-fil:** Samme (section D)
- **Risiko:** Lav. Idempotent (kan re-run uden side-effekter)

**Step 5 — Config.toml + Dashboard-verifikation**

- **Hvad:** Tjek lokal `supabase/config.toml` mod remote-state. Hvis lokal mangler `core_identity`/`core_compliance`/`core_money` i `[api].schemas`: tilføj
- **Hvorfor sidst:** Migration kan running først; config-update er meta
- **Risiko:** Lav. config.toml er ikke applied; kun reference

**Step 6 — Type-codegen**

- **Hvad:** Kør `pnpm types:generate` mod live remote med core-schemas; fjern placeholder-guard i `scripts/types-check.sh`
- **Hvorfor:** Forudsætter Step 5 + verifikation
- **Risiko:** Lav. Auto-genereret kode

**Step 7 — Sletning af import-stubs**

- **Hvad:** Slet `scripts/migration/t9-org-tree-discovery.mjs` + `t9-org-tree-upload.mjs`
- **Risiko:** Lav. Per Afgørelse 3

**Step 8 — Ny fitness-check + smoke-tests**

- **Hvad:** `postgrest-t9-schema-exposure` i fitness.mjs + `t9_backdated_historical_traversal.sql` smoke-test
- **Risiko:** Lav

---

## Test-konsekvens (V2 MELLEM 6 fix — udvidet til alle handler-typer + KRITISK 1 date-aware)

- **Test-fil:** `supabase/tests/smoke/t9_backdated_historical_traversal.sql` (ny)
- **Hvad verificeres:** Alle 5 edge-cases (pre-history, exact-start-boundary, split, exact-end-boundary, fremtidige bevares) for **alle 7 apply-handlers**:
  - `_apply_employee_place`: alle 5 cases (place-handler)
  - `_apply_client_place`: alle 5 cases (place-handler)
  - `_apply_org_node_upsert`: alle 5 cases (upsert-handler — version-tabel)
  - `_apply_employee_remove`: NO-active, exact-start (DELETE-branch), split-close, exact-end (no-op)
  - `_apply_client_close`: NO-active, exact-start (DELETE-branch), split-close, exact-end (no-op)
  - `_apply_org_node_deactivate`: NO-active (raise), exact-start (UPDATE is_active), split-deactivate, allerede-inactive (no-op)
  - `_apply_team_close`: exact-start, split-deactivate + placement-cascade på fixture-employees/clients
- **Forventet status:** grøn

- **Test-fil:** `supabase/tests/smoke/t9_org_nodes.sql` (eksisterende, udvides — V3 KRITISK 2 fix)
- **Hvad verificeres:** Team-retype interval-overlap-invariant (to-vejs):
  - Department med children NU kan IKKE retypes til team (afvises)
  - Department uden children NU KAN retypes til team
  - **Backdated-case:** Department med future-child (child.effective_from > current_date) kan IKKE retypes til team med interval der overlapper child-version (Codex V2 KRITISK 2 eksempel)
  - **Inverse-case:** Child-version kan IKKE indsættes/backdates med parent_id pegende på node hvor team-version overlapper child-intervallet
  - Parent-team check virker stadig (eksisterende test bevares)
- **Forventet status:** grøn

- **Test-fil:** `supabase/tests/smoke/t9_read_gates.sql` (ny — V3 KRITISK 1 + V4 OPGRADERING 2)
- **Hvad verificeres:** Alle 9 read-RPCs med tre-lags test (V4 OPGRADERING 2):

  **Lag 1 — Deklarativ EXECUTE-grant assertion (deterministisk):**

  ```sql
  assert has_function_privilege('authenticated',
    'core_identity.org_tree_read()'::regprocedure, 'EXECUTE'),
    'EXECUTE-grant mangler for authenticated på org_tree_read';
  -- gentages for alle 9 RPCs
  ```

  Fail = klar besked om hvilken grant der mangler. Skelner function-grant-mangel fra intern `_require_read_permission`-raise.

  **Lag 2 — Runtime-call uden permission:**
  - Unauthenticated (ingen JWT claim) → tom result for visibility-RPCs, 42501 for admin-only
  - Throwaway-role uden permission → 42501 for admin-only (intern `_require_read_permission`-raise; Lag 1 har allerede bekræftet at det IKKE er grant-mangel), tom result for visibility-RPCs

  **Lag 3 — Runtime-call med korrekt fixture-role + permission:**
  - Throwaway-role med relevant `permission/manage`-seed → admin-only-RPCs returnerer rows
  - Throwaway-employee med placement-fixture → visibility-RPCs returnerer scoped rows
  - Superadmin via generisk lookup → fuld result

  **Date-aware case (V3 KRITISK 1):** caller har placement på p_date_1 men IKKE p_date_2. `_at(p_date_1)` returnerer rows; `_at(p_date_2)` returnerer empty. Bekræfter at autorisation følger historisk placering, IKKE current.

  **Session-var-isolation (V4 OPGRADERING 1):** kald `_at(p_date_1)` derefter `_current_wrapper()` i samme transaction → current-wrapper bruger `current_date`, IKKE `p_date_1` (verificerer at eksplicit session-var-set i current-wrapper neutraliserer tidligere `_at`-state).

- **Forventet status:** grøn

- **Test-fil:** `supabase/tests/smoke/t9_pending_changes.sql` (eksisterende, udvides)
- **Hvad verificeres:** `pending_changes_read` scoped via change_type-mapping
- **Forventet status:** grøn

- **Fitness-check:** `postgrest-t9-schema-exposure` (ny i `scripts/fitness.mjs`)
- **Hvad verificeres:** PostgREST eksponerer `core_identity` schema (service-role-call → HTTP 200)
- **Forventet status:** grøn lokalt + CI; hard-fail hvis `SUPABASE_ACCESS_TOKEN` mangler i CI

---

## Risiko + kompensation

| Migration-step          | Værste-case                                     | Sandsynlighed | Rollback                                                    |
| ----------------------- | ----------------------------------------------- | ------------- | ----------------------------------------------------------- |
| Step 1 (team-retype)    | Triggeren afviser legitim retype-case           | Lav           | CREATE OR REPLACE med pre-fix-version                       |
| Step 2 (backdated)      | Apply-handler bryder CHECK/EXCLUDE på edge-case | Mellem        | CREATE OR REPLACE pr. handler kan rulles tilbage uafhængigt |
| Step 3 (read-gates)     | Read-RPC returnerer for lidt data               | Lav           | CREATE OR REPLACE med pre-fix-version                       |
| Step 4 (Step 12 robust) | DO-block raiser ved tilladt state               | Lav           | Re-run kan ikke gøre skade (idempotent)                     |
| Step 5 (config.toml)    | Drift-fix bryder lokal supabase-CLI             | Lav           | git revert                                                  |
| Step 6 (type-codegen)   | Generated types matcher ikke faktisk schema     | Lav           | git revert + regenerér                                      |

**Kompensation:** Hele migrationen kan rulles tilbage ved at lave ny migration der CREATE OR REPLACE'r alle berørte funktioner til pre-supplement-state. Eftersom alle ændringer er CREATE OR REPLACE FUNCTION (ingen ALTER TABLE), er rollback ren funktion-restore.

---

## Oprydnings- og opdaterings-strategi

**Filer der skal flyttes til arkiv** (efter pakken er merget):

- `docs/coordination/T9-supplement-krav-og-data.md` → `docs/coordination/arkiv/`
- `docs/coordination/T9-supplement-plan.md` → `docs/coordination/arkiv/`
- `docs/coordination/T9-supplement-skitse.md` → `docs/coordination/arkiv/` (efterlader hak via Codex-reviews)
- Alle `docs/coordination/plan-feedback/T9-supplement-*.md` → `docs/coordination/arkiv/`

**Filer der skal slettes** (per Afgørelse 3):

- `scripts/migration/t9-org-tree-discovery.mjs`
- `scripts/migration/t9-org-tree-upload.mjs`

**Dokumenter der skal opdateres:**

- `docs/coordination/aktiv-plan.md` → ryd til "ingen aktiv plan" (T9-supplement lukket)
- `docs/coordination/seneste-rapport.md` → peg på ny `rapport-historik/2026-05-XX-t9-supplement.md`
- `docs/teknisk/teknisk-gaeld.md` → marker relevante T9 G-numre løst eller præciser rester
- `docs/strategi/bygge-status.md` → Trin 9 "✓ Godkendt" forbliver; T9-supplement noteres som append-only opfølgning under "Vores trin 5" detalje-sektion
- `docs/strategi/stork-2-0-master-plan.md` → ingen rettelse-nummer; supplement udvider ikke rammen
- `packages/types/src/database.ts` → regenereret (placeholder-markør fjernet)
- `scripts/types-check.sh` → fjern placeholder-guard

**Reference-konsekvenser:**

- `grep -r "t9-org-tree-discovery" docs/ scripts/` returnerer 0 hits efter pakken
- `grep -r "t9-org-tree-upload" docs/ scripts/` returnerer 0 hits efter pakken
- Verificér at slut-rapport refererer Mathias-afgørelse 3 om import-scope-udskydelse

**Ansvar:** Code udfører oprydning + opdatering som del af pakkens build-leverance.

---

## Konsistens-tjek

- **Disciplin-pakke:** `docs/strategi/arbejds-disciplin.md` afsnit 1-4 — Code's rolle, trin-cyklus, formålsdisciplin, plan-leverance er kontrakt

---

## Fire-dokument-konsultation

| Dokument                                          | Konsulteret | Relevante referencer                                                                                                                                                                               | Konflikt med plan? |
| ------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `docs/strategi/vision-og-principper.md`           | ja          | princip 4 (default = intet — låst i Afgørelse 6); princip 5 (konfiguration har livscyklus — pending_changes-mønster); princip 9 (statusmodeller bevarer historik — backdated traversal grundlag)   | nej                |
| `docs/strategi/stork-2-0-master-plan.md`          | ja          | §1.1 (adgangs-mekanik — Strategi B anvendes, ikke ændres); §1.7 (rettelse 35 — etableret i PR #39, ikke ændret); §4 trin 9 (færdig, supplement er append-only); rettelse 35 (referenceret i scope) | nej                |
| `docs/coordination/mathias-afgoerelser.md`        | ja          | 2026-05-17 (T9-omstart-rammen — etableret); 2026-05-18 (master-plan §1.7-opdatering); 2026-05-19 (compliance-ansvarlige)                                                                           | nej                |
| `docs/coordination/T9-supplement-krav-og-data.md` | ja          | hele filen — Krav 1-5 + Afgørelser 1-6 + Tekniske valg 1-4                                                                                                                                         | nej                |

**Regler:** Alle dokumenter konsulteret, referencer er konkrete, ingen konflikter.

---

## Konklusion

Planen leverer en fokuseret append-only supplement-migration der lukker de 6 åbne T9-fund med konkret implementering pr. fund og test-coverage for hver. Risiko er lav-mellem; rollback er ren CREATE OR REPLACE-restore. Scope er stramt mod krav-dok; ingen scope-creep. **Klar til Codex-review-runde.**
