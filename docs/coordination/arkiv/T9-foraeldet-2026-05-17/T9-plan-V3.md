# T9 — Plan V3

**Pakke:** §4 trin 9 — Identitet del 2 (org-træ, closure-table, teams, versionerede tilknytninger, subtree-RLS, benchmark, migration-scripts)
**Krav-dok:** `docs/coordination/T9-krav-og-data.md`
**Plan-version:** V3
**Dato:** 2026-05-17

**Revision V3 (denne version):** V3 addresserer 1 KRITISK kode-fund fra Codex's V2-review (`docs/coordination/plan-feedback/T9-V2-codex.md`, commit `47fc691`): RLS-rekursion/selvafhængighed mellem `acl_subtree_employees`-helper og `employee_team_assignments_select`-policy. Helperen scanner `employee_team_assignments`, og V2-policyen på samme tabel kaldte tilbage til helperen — klassisk RLS-selvreference der ville fejle eller gøre subtree-policy no-op for ikke-admin caller.

- **Løsning (V3):** `employee_team_assignments_select = using (true)` for SELECT — team-membership behandles som strukturel meta-data (synlig på tværs af authenticated-rolle), ikke som scope-beskyttet data. Begrundelse: assignments-rows er semantisk meta-info om "hvem er i hvilket team"; uden tilhørende `employees`-row eller forretningsdata-rows er informationen begrænset nyttig. Forretningsdata-scope (sales, calls, payroll-linjer) bevares fra trin 14+ via subtree-policies på de respektive forretnings-tabeller. INSERT/UPDATE/DELETE forbliver kun via RPC med `has_permission`-check.
- **Konsekvens:** helper kan læse assignments uden RLS-konflikt; helper læser ikke `employees` (ingen recursion via employees-policy); subtree-policy på `employees` fungerer end-to-end. SECURITY INVOKER-kravet fra master-plan §1.1 + §1.7 bevares. Ingen master-plan-deviation.
- **Authenticated-rolle-test-disciplin tilføjet** (per Codex V2 anbefaling): Step 5 og 7 tests bruger `set local role authenticated` + `set local "request.jwt.claim.sub" = '<auth_user_id>'` for at simulere faktisk bruger-kontekst, ikke postgres/service-role med RLS-bypass.
- **Tradeoff acknowledged:** Assignments-list er synlig for alle authenticated-brugere. Dette er bevidst valg konsistent med "org-struktur som data, ikke som hemmelig konfiguration". Hvis Mathias ønsker strikere visibility (fx kun subtree-niveau), er alternativ-arkitekturen en denormaliseret `employee_org_unit_memberships`-cache-tabel (beskrevet i Strukturel beslutning som åben option) — det vil være master-plan-rettelse-niveau, ikke V3-scope.

**Status efter V3:** Claude.ai's V2-approval (`docs/coordination/plan-feedback/T9-V2-approved-claude-ai.md`, commit `923584e`) gælder IKKE V3 fordi RLS-arkitekturen er materielt ændret. Ny Claude.ai-approval kræves.

---

**Revision V2 (historik):** V2 addresserer 2 KRITISKE kode-fund fra Codex's V1-review (`docs/coordination/plan-feedback/T9-V1-codex.md`, commit `02b47f5`) og 3 kosmetiske findings fra Claude.ai's V1-approval (`docs/coordination/plan-feedback/T9-V1-approved-claude-ai.md`, commit `2182a8b`):

- **Codex KRITISK 1 — `acl_subtree`-kontrakt tvetydig:** Helperen er splittet i `acl_subtree_org_units` (returnerer org_unit-IDs; matcher closure-table direkte) + `acl_subtree_employees` (returnerer employee-IDs via composition over assignments). RLS-predikater på `employees.id` bruger nu eksplicit `acl_subtree_employees`. Se Valg 1 + Strukturel beslutning.
- **Codex KRITISK 2 — Implementations-rækkefølge oprettede helpers/RPC'er før dependencies eksisterede:** Steps re-orderet til lineær dependency-chain. `acl`-helpers + `team_deactivate` flyttet til Step 5 (efter Steps 2+3+4 hvor closure + teams + assignments er på plads). Se Implementations-rækkefølge.
- **Claude.ai kosmetisk 1 — Princip 8-reference upræcis:** Fjernet fra Fire-dokument-konsultations-tabel (princip 8 handler om person-entitets-unikhed, ikke team-tilknytnings-unikhed). Krav-dok pkt 7 + mathias-afgoerelser pkt 7 er den korrekte kilde.
- **Claude.ai kosmetisk 2 — Rettelse 23-mønster udvides til derived-tables:** Valg 3 flagger eksplicit kategori-udvidelse + G-nummer-kandidat for master-plan-rettelse efter T9-merge.
- **Claude.ai kosmetisk 3 — CI-blocker 19-allowlist udvides til "intern FK der venter på cross-trin":** Valg 4 flagger eksplicit ny use-case + G-nummer-kandidat for formel pattern hvis det gentages.

---

## Formål

> Denne pakke leverer fundamentet for subtree-baseret rettighedsevaluering: org-træ med materialiseret closure-table, `acl_subtree`-helper, teams under én org-enhed, versionerede medarbejder-team- og klient-team-tilknytninger, scope-helpers (self/team/subtree/all), subtree-RLS benchmark som CI-blocker, og migrations-scripts for 1.0-import.
>
> Hvis fundet under review ikke bringer os tættere på dette: G-nummer, ikke blocker.

---

## Scope

**I scope:**

- Master-plan-paragraffer: §1.7 (org-træ + closure + helpers + teams + tilknytninger), §1.11 (core_identity-schema), §3 CI-blocker 19 (FK-coverage) + 20 (tx-wrap), §3 Performance-disciplin (subtree-RLS benchmark), §4 trin 9, §0.5 (migration-grundprincip)
- Krav-dok-elementer: alle 8 verificerede scope-underafsnit + alle 19 Mathias-afgørelser
- Rettelser fra master-plan: rettelse 19 C1 (closure over STABLE-funktion med rekursiv CTE), rettelse 20 (migration uden ETL)
- Tilstødende dokumentations-leverancer: klassifikations-tal-verificering (action-item fra bygge-status), permission-matrix-opdatering med nye scope-helpers, G-nummer-revision for løste/akkumulerede

**IKKE i scope:**

- Klient-skabelon + felt-definitions (trin 10 — separat krav-dok)
- Lokations-skabelon (trin 10b)
- Identitets-master + sælger-attribution (trin 15)
- 1M-sales-benchmark på subtree-policy (trin 14, når sales-tabel eksisterer — T9 leverer 50×5×500-employees-benchmark)
- UI-flader for org/team-admin (lag F)
- Microsoft Entra ID auth-implementation (orthogonalt til T9; auth_user_id-kolonne eksisterer fra trin 1)
- G017 cleanup-migration live-applicering (kode-leveret i H024; afventer Mathias' `supabase db push`)

---

## Strukturel beslutning

**Closure-table fremfor STABLE-rekursiv-CTE-helper.**

Master-plan rettelse 19 C1 har afgjort dette teknisk; planen følger 1:1. Hierarki-evaluering sker via materialiseret tabel der vedligeholdes af AFTER-trigger på `org_units`. Policy-prædikater laver indexed lookup, aldrig rekursion ved query-tid. Princippet udvides eksplicit til alle senere hierarki-strukturer (klient-hierarkier, kampagne-træer, FM-områder), jf. §1.7's generelle princip.

**Versioneret tilknytning fremfor pointer-overskrivning.**

Medarbejder-team og klient-team modelleres med `from_date`+`to_date`, exclusion-constraint mod overlap, og partial-unique på `(entity, to_date IS NULL)` for "én aktiv ad gangen". Skifte sker via RPC der lukker gammel + åbner ny i samme transaktion. Konsistent med vision-princip 9 (status-modeller bevarer historik) og §1.7.

**is_active-flag på org_units og teams fremfor sletning.**

Per mathias-afgoerelser 2026-05-16 punkt 6 — samme mønster som roller fra trin 5. Sletning bryder reference-integritet og historik; is_active=false signalerer "ikke i brug, må ikke vælges til nye tilknytninger" mens row + audit-spor bevares. Triggers håndhæver at nye tilknytninger ikke kan pege på is_active=false.

**Helper-arkitektur: split subtree-helpers efter return-type.**

Per Codex V1 KRITISK fund 1: closure-table er over org_units, så en helper der returnerer "descendants" har to mulige semantikker (org_unit-IDs vs employee-IDs). V1 var tvetydig. V2 splitter eksplicit:

- `acl_subtree_org_units(p_employee_id)` returnerer org_unit-IDs (matcher closure-tabellens niveau direkte)
- `acl_subtree_employees(p_employee_id)` returnerer employee-IDs via composition: caller's team → org_unit → closure → descendant org_units → reverse-lookup via assignments → employees

To helpers giver eksplicit return-semantik, fleksibilitet til at bruge org_unit-niveau i `client_team_ownerships`-policy (når trin 10 aktiverer; team → org_unit-chain), og forhindrer den implicit-mismatch-fælde Codex spottede hvor `employees.id = ANY(acl_subtree(...))` kunne sammenligne employees med org_unit-IDs.

**RLS-rekursion-håndtering: helper-source-tabeller har `using (true)` SELECT-policy.**

Per Codex V2 KRITISK fund: `acl_subtree_employees` scanner `employee_team_assignments` for at finde caller's org_unit og descendants' employees. Hvis den scannede tabel ALSO har en policy der kalder samme helper, opstår RLS-rekursion: policy → helper → læs tabel → policy → helper → ... PostgreSQL undgår uendelig rekursion ved at returnere kun rows som caller allerede har adgang til via simplere policy-clauses (typisk self), hvilket reducerer helper-output til "alt jeg kan se = stort set ingenting" for ikke-admin caller. Subtree-mekanismen bliver no-op.

**Løsning: helper-source-tabeller (closure, teams, employee_team_assignments) har simple `using (true)` SELECT-policies.** Disse tabeller bærer strukturel meta-data om org-hierarki, ikke privat forretningsdata:

- `org_units` / `org_unit_closure`: ren struktur — alle authenticated-brugere ser hele org-træet (jf. master-plan §1.7's princip "team-træ styrer hvilken data der vises" — træet selv er metadata)
- `teams`: ren struktur — synlige for alle authenticated
- `employee_team_assignments`: hvem er i hvilket team — strukturel meta. Forretningsdata (sales/calls/payroll) får scope-policies fra trin 14+; assignments-rows er useless without tilhørende employees + forretningsdata

**Effekt:** Helper læser kun "structure"-tabeller (alle `using (true)`), ingen recursion. Helper kalder IKKE `employees`-tabellen (som har subtree-clause). Subtree-policy på `employees` evaluerer helper → får array af employee_ids → filtrerer egen tabel via simple `id = ANY(...)`-check. Linear chain: `employees-policy → helper → structure-tables`.

INSERT/UPDATE/DELETE på alle T9-tabeller bevares kun via RPC med `has_permission`-check; tabel-write-policies forbliver restrictive. WRITE-flow ændres ikke i V3.

**Alternativ-arkitektur (åben option for fremtidige overvejelser):** hvis Mathias senere ønsker subtree-niveau-visibility på assignments-listen (FM-chef ser kun assignments for egen subtree), kan en denormaliseret `core_identity.employee_org_unit_memberships(employee_id, org_unit_id, from_date, to_date)`-cache-tabel indføres. Cache vedligeholdes af trigger på `employee_team_assignments`, har `using (true)` SELECT-policy (struktur), og helper læser denne cache i stedet for assignments direkte. Det giver mulighed for at gøre assignments-policy stricter uden at brydet helper. Dette er master-plan-rettelse-niveau-beslutning og ikke V3-scope.

---

## Mathias' afgørelser (input til denne plan)

Alle 19 afgørelser fra krav-dokumentets afgørelses-tabel honoreres 1:1. Konkret mapping:

- **Closure-table-mønster (rettelse 19 C1) →** Implementations-rækkefølge step 2; `acl_subtree` markeret STABLE, SECURITY INVOKER, search_path låst
- **Ingen rekursive CTE'er i RLS-policy-prædikater (§1.7) →** Generelt princip kodificeres i fitness-check-kommentar; håndhæves via EXPLAIN-assertion i benchmark
- **Versioneret medarbejder/klient-team-tilknytning (§1.7) →** Steps 4+5; `from_date`+`to_date`+exclusion-constraint
- **Skifte-RPC der lukker gammel + åbner ny i én transaktion (§1.7) →** Step 4 (`employee_team_assignment_change`) + Step 6 (`client_team_ownership_change`)
- **Subtree-RLS benchmark som CI-blocker (§3 + rettelse 19 C1) →** Step 9; fitness-check `subtree-rls-benchmark`; SLA <5ms pr. row + EXPLAIN-no-recursion
- **Migration via direkte udtræk + upload (§0.5 + rettelse 20) →** Step 8; ingen ETL-pipeline, ingen staging-schema
- **Klient-team-historik fra 1.0 bevares som-det-var (§0.5) →** Upload-script sætter `from_date`/`to_date` fra 1.0-data uden rekonstruktion
- **acl-helpers er STABLE, SECURITY INVOKER, deterministisk search_path (§1.7 + §1.1) →** Step 5 (acl-helpers oprettes efter dependency-tabeller per V2-re-ordering); eksplicit attribut-deklaration i migration
- **Closure-table self-reference (depth=0) (§1.7) →** Step 2; trigger inkluderer self-row
- **Cycle-detection + closure-vedligeholdelse i samme transaktion (§1.7) →** Steps 1+2; begge triggers fyrer i samme transaktion, begge skal lykkes
- **Schema core_identity for alle nye tabeller (§1.11 + §4 trin 9) →** Alle migrations bruger `core_identity.<tabel>`
- **Ejerskabs-kæde Cph Sales → afdelinger → teams → relationer (mathias-afgoerelser pkt 1) →** `org_units` parent_id-hierarki + `teams.org_unit_id` FK
- **Afdelinger ændres sjældent; historik bevares (pkt 2) →** is_active-mønster + audit-trigger på org_units bevarer ændringsspor
- **Team kan ophøre; medarbejdere bliver team-løse (pkt 3) →** Når team is_active=false: `employee_team_assignment.to_date` sættes for relaterede medarbejdere via dedikeret RPC (`team_deactivate`), employees-row bevares uændret
- **Klient kan aldrig dræbe et team (pkt 4) →** Ingen CASCADE fra clients til teams; client_team_ownership FK on delete restrict
- **Klient ejer sin egen data; følger klienten ved team-skift (pkt 5) →** Konsekvens for trin 14+ (sales): client_id er primær ejer, ikke team_id. Dokumenteres i bygge-status-noter for kommende trin
- **is_active-flag (pkt 6) →** På `org_units` og `teams`; samme mønster som `roles.is_active` (eksisterer fra trin 5)
- **Én medarbejder i ét team ad gangen (pkt 7) →** Partial unique `(employee_id, to_date IS NULL)`; ingen stab-undtagelse
- **Ingen hardkodet horizon for migration (pkt 8) →** Discovery-script rapporterer fuld historik; upload-script accepterer Mathias-konfigureret `--from-date` parameter; default = "alt"
- **Teams/afdelinger anonymiseres ikke (pkt 9) →** Klassifikations-registry-rækker for alle org_units/teams-kolonner får `pii_level='none'`; ingen anonymization_mapping for disse tabeller

---

## Tekniske valg overladt til Code — argumentation

### Valg 1 — Konkrete tabel-, kolonne- og helper-navne

**Anbefaling:** Følg eksisterende konvention fra trin 1+5 (snake_case, plural for entity-tabeller, `_id` suffix for FK-kolonner, `is_active`-felt eksplicit).

Tabeller:

- `core_identity.org_units` (id, name, parent_id, is_active, created_at, updated_at)
- `core_identity.org_unit_closure` (ancestor_id, descendant_id, depth) — PRIMARY KEY (ancestor_id, descendant_id), INDEX på descendant_id
- `core_identity.teams` (id, name, org_unit_id, is_active, created_at, updated_at)
- `core_identity.employee_team_assignments` (id, employee_id, team_id, from_date, to_date, created_at, updated_at)
- `core_identity.client_team_ownerships` (id, client_id, team_id, from_date, to_date, created_at, updated_at)

Helpers (split i to subtree-helpers per Codex V1 KRITISK fund 1 — eksplicit return-semantik):

- `core_identity.acl_subtree_org_units(p_employee_id uuid) returns uuid[]` — org_unit-IDs i caller's subtree (employee → aktiv `employee_team_assignment` med `to_date IS NULL` → `teams.org_unit_id` → descendants via `org_unit_closure`). Returnerer tom array hvis employee er team-løs eller har ingen aktive assignments. NULL-input returnerer tom array (defensive default)
- `core_identity.acl_subtree_employees(p_employee_id uuid) returns uuid[]` — employee-IDs der har aktiv assignment til team i caller's org_unit-subtree. Konstrueres via composition: `acl_subtree_org_units(p_employee_id)` → reverse-join `teams.org_unit_id = ANY(...)` → `employee_team_assignments WHERE to_date IS NULL` → distinct `employee_id`. Brugs i `employees.id = ANY(acl_subtree_employees(...))` RLS-predikater
- `core_identity.acl_self(p_target_employee_id uuid) returns boolean` — wrapper for self-scope (eksisterer effektivt via `auth_user_id = auth.uid()` mønster; eksplicit helper for konsistens)
- `core_identity.acl_team(p_target_employee_id uuid) returns boolean` — current employee og target i samme aktive team (via employee_team_assignments-lookup)
- `core_identity.acl_all() returns boolean` — placeholder (returnerer true; eksisterer for konsistens i scope-helper-tabellen)

Alle helpers er `language sql stable security invoker set search_path = ''` (konsistent med eksisterende `core_identity.current_employee_id()` / `core_identity.has_permission()` fra trin 1+5). Returnerer tom-array/false i mangle-case, aldrig NULL — RLS-predikat-bruger får forudsigelig adfærd.

RPC'er:

- `core_identity.org_unit_upsert(p_id uuid, p_name text, p_parent_id uuid, p_is_active boolean) returns uuid` — has_permission('org_units', 'manage', can_edit=true)
- `core_identity.team_upsert(p_id uuid, p_name text, p_org_unit_id uuid, p_is_active boolean) returns uuid` — has_permission('teams', 'manage', can_edit=true)
- `core_identity.team_deactivate(p_team_id uuid, p_change_reason text) returns void` — has_permission('teams', 'manage', can_edit=true); sætter is_active=false + lukker alle åbne employee_team_assignments
- `core_identity.employee_team_assignment_change(p_employee_id uuid, p_new_team_id uuid, p_change_date date, p_change_reason text) returns uuid` — has_permission('employee_team_assignments', 'manage', can_edit=true); atomar luk+åbn
- `core_identity.client_team_ownership_change(p_client_id uuid, p_new_team_id uuid, p_change_date date, p_change_reason text) returns uuid` — has_permission('client_team_ownerships', 'manage', can_edit=true); atomar luk+åbn. **NB:** RPC bygges i T9 men kaldes ikke produktivt før clients eksisterer (trin 10)

Triggers:

- `org_units_cycle_detect_before_iu` (BEFORE INSERT OR UPDATE) — verificér ingen cycle via rekursiv CTE
- `org_unit_closure_maintain_after_iud` (AFTER INSERT OR UPDATE OR DELETE) — genberegn closure (se Valg 2)
- `employee_team_assignments_no_overlap` (EXCLUDE constraint via btree_gist) — overlap blokeres på (employee_id, daterange(from_date, coalesce(to_date, 'infinity')))
- `client_team_ownerships_no_overlap` (samme mønster)

**Begrundelse:** matcher eksisterende trin-1+5-mønstre (`employees`, `roles`, `role_page_permissions`, `employee_active_config`). Ingen ny navngivnings-konvention introduceres.

### Valg 2 — Trigger-implementation for closure-vedligeholdelse

**Anbefaling: A — Genberegn berørt subtree på hver org_units-mutation.**

Konkret algoritme i AFTER-trigger:

1. På INSERT: tilføj selv-row (X, X, 0) + rows fra X til alle X's forfædre (via parent_id chain)
2. På UPDATE (parent_id ændres): slet alle closure-rows hvor descendant_id = X eller descendant_id i X's pre-mutation org_unit-subtree (lookup direkte mod gamle closure-rows før mutation); genindsæt baseret på ny parent_id
3. På DELETE: slet alle closure-rows involverende X eller X's descendanter (org_units har ON DELETE RESTRICT via teams.org_unit_id, så DELETE er kun mulig hvis alle teams er flyttet/slettet — sjælden ledelses-handling)

**Argument mod B (inkrementel):**

Inkrementel trigger sparer rows-omtræk på UPDATE, men kompleksiteten er asymmetrisk: at finde "kun de berørte (ancestor, descendant)-relationer" kræver to lookups (gammel-subtree og ny-subtree) og diff-logik. Org-mutationer er sjældne (mathias-afgoerelser pkt 2; master-plan §1.7 "Org-mutationer er sjældne; trigger-omkostning irrelevant"). Kompleksitet uden gevinst.

**Argument mod fuld-rebuild-af-hele-closure:**

Kunne være endnu simplere (`TRUNCATE org_unit_closure; INSERT recursive CTE for alle org_units`), men ved 50-100 org_units er rebuild-cost mikrosekund-niveau alligevel; subtree-only rebuild er trivielt mere targeted og giver bedre semantik for trigger-audit-noter.

**Korrelation:** cycle-detection-trigger fyrer FØR closure-trigger i samme transaktion (master-plan §1.7 "begge skal lykkes"). Hvis cycle detekteres: ROLLBACK; closure-tabel forbliver konsistent fordi den ikke nåede at opdatere.

### Valg 3 — Closure-table audit-status

**Anbefaling: B — tilføj `core_identity.org_unit_closure` til `AUDIT_EXEMPT_SNAPSHOT_TABLES` allowlist i `scripts/fitness.mjs`.**

**Begrundelse:**

1. closure-tabel er fuldt deriveret fra org_units. Audit-rationale er at fange "hvad ændrede sig hvorfor": rationale ligger i org_units-mutationen, ikke i closure's row-effekter
2. Audit-trigger på closure ville producere N rows pr. org_units-mutation (1 mutation → mange closure-rows) — støj uden semantisk indhold
3. Eksisterende undtagelses-pattern via `AUDIT_EXEMPT_SNAPSHOT_TABLES` præcedens (commission_snapshots) er etableret i master-plan rettelse 23. Closure er semantisk i samme kategori som snapshot: derived-from-parent, atomically rebuilt
4. Alternativ til ny `AUDIT_EXEMPT_DERIVED_TABLES`-liste vil splitte allowlist-vedligeholdelse uden gevinst; én liste med kommentar pr. tabel er klarere

**Kategori-udvidelse acknowledged (Claude.ai V1 finding 2):** Rettelse 23 i master-plan formulerede `AUDIT_EXEMPT_SNAPSHOT_TABLES` specifikt for snapshot-tabeller som compute-byproducts (commission_snapshots m.fl. — én aggregat-event producerer mange rows; audit-spor er på aggregatet). Closure-table er semantisk derived-from-parent men ikke compute-byproduct af én aggregat-event — hver org_units-mutation producerer mutationer i closure. Princippet ("audit-spor findes på forudgående mutation") holder i begge tilfælde, men anvendelse på closure er en **kategori-udvidelse** af eksisterende mønster, ikke direkte anvendelse. **G-nummer-kandidat (lav):** master-plan rettelse 23 udvides eller suppleres med eksplicit derived-tables-kategori efter T9-merge. Slut-rapporten dokumenterer udvidelsen i "Plan-afvigelser"-sektion så audit-trail er klar.

**Konsekvens:** CI-blocker 3 (audit-trigger pr. mutable tabel) håndhæver via fitness.mjs. Tilføjelse af closure til allowlist kræver kode-commit (samme pattern som H024). Slut-rapport dokumenterer ændringen til `AUDIT_EXEMPT_SNAPSHOT_TABLES` eksplicit.

**Risiko:** Hvis closure-trigger bygger noget der ikke matcher org_units (bug), opdager audit_log det ikke direkte. Mitigeres via:

- Fitness-check `org_unit_closure_consistency` (Step 9 i implementations-rækkefølgen) der verificerer at closure-rækker matcher org_units-tree via recursive-CTE-sammenligning (kører i tx-rollback for at undgå mutation)
- Trigger-test der bekræfter rebuild-korrekthed efter hver mutation-type (INSERT/UPDATE/DELETE)

### Valg 4 — Client_team_ownership FK-rækkefølge

**Anbefaling: A — byg client_team_ownerships uden FK i T9; tilføj FK i trin 10.**

Konkret:

- T9-migration deklarerer `client_id uuid not null` (ingen `references`-clause)
- Migration-kommentar dokumenterer: "FK til `core_identity.clients(id)` tilføjes i trin 10 når clients-tabel eksisterer. Indtil da: NOT NULL + UUID-format-CHECK håndhæver minimum-validitet."
- T9-RPC `client_team_ownership_change` validerer at `p_client_id` er ikke-NULL og UUID-format. Ingen referential lookup endnu — RPC kaldes ikke produktivt før trin 10
- T9-tests: insert syntetisk client_id-uuid; verificér RPC-mekanik (atomic luk+åbn, overlap-check), ikke FK-håndhævelse
- Trin 10 migration tilføjer FK constraint: `ALTER TABLE client_team_ownerships ADD CONSTRAINT client_team_ownerships_client_id_fk FOREIGN KEY (client_id) REFERENCES core_identity.clients(id) ON DELETE RESTRICT` — håndhæves ved tilføjelse mod eksisterende rows (kun tom tabel pre-cutover)

**Argument mod B (udskyd hele tabellen):**

Krav-dok ekspliciterer client-team-ejerskab som T9-leverance. Udskydning brydet krav-dok-kontrakten. Også: T9 inkluderer mathias-afgoerelser pkt 4 (klient kan aldrig dræbe team) og pkt 5 (klient ejer data) — disse skal være modelleret strukturelt i T9 selvom de først tages aktivt i brug fra trin 10+.

**Argument mod C (deferred/NOT VALID FK):**

`NOT VALID FK` er en "lov ikke at bryde mig, men håndhæv intet"-konstrukt. Det skjuler hvad der faktisk er på plads. Eksplicit "FK kommer i trin 10" via kommentar er klarere.

**Konsekvens for CI-blocker 19 (FK-coverage):** `client_id` kommer på allowlist `FK_COVERAGE_EXEMPTIONS` med begrundelse "FK tilføjes i trin 10 når core_identity.clients eksisterer; pre-cutover ingen rows". Allowlist-entry fjernes når trin 10's migration adder FK.

**Kategori-udvidelse acknowledged (Claude.ai V1 finding 3):** CI-blocker 19's `FK_COVERAGE_EXEMPTIONS` blev oprettet for _eksterne_ reference-ID'er (fx `client_crm_match_id` der peger uden for Stork's schema; jf. master-plan rettelse 33). `client_team_ownerships.client_id` er en **intern FK der venter på cross-trin schema-evolution** (trin 10 tilføjer FK ved ALTER) — ny use-case for allowlist-mekanismen. Materielt ingen risiko (pre-cutover ingen rows; trin 10 fanger via ALTER), men strategisk en ny kategori. **G-nummer-kandidat (lav):** hvis mønstret gentages (andre cross-trin interne FK'er) bør mathias-afgørelse eller master-plan-rettelse formalisere etableret pattern. Indtil da: éngangs-undtagelse med dokumenteret plan til trin 10-lukning (FK tilføjes; allowlist-entry fjernes).

### Valg 5 — Hvilke tabeller får subtree-RLS-policies i trin 9

**Anbefaling: B — infrastruktur + subtree-policy aktiveret på `core_identity.employees`.**

Konkret:

- Infrastruktur (closure + acl-helpers + scope-helpers + benchmark-fitness): leveres som under Valg 1+2+6
- Employees SELECT-policy udvides fra `(auth_user_id = auth.uid() or core_identity.is_admin())` til `(auth_user_id = auth.uid() or core_identity.is_admin() or id = ANY(core_identity.acl_subtree_employees(core_identity.current_employee_id())))` — additivt; eksisterende self+admin-clauses bevares
- Nye T9-tabeller (org_units, teams, employee_team_assignments, client_team_ownerships) får policies:
  - org_units: `using (true)` for SELECT (struktur er ikke følsom; alle authenticated-rolle læser hele træet)
  - org_unit_closure: `using (true)` for SELECT (derived struktur)
  - teams: `using (true)` for SELECT (samme rationale)
  - **employee_team_assignments: `using (true)` for SELECT (V3-ændring — se Strukturel beslutning "RLS-rekursion-håndtering").** Subtree-scope på `acl_subtree_employees`-helper kan ikke aktiveres på assignments-tabellen selv uden RLS-selvreference (Codex V2 KRITISK fund). Team-membership behandles som struktur-meta; forretningsdata-scope håndteres på forretnings-tabeller i trin 14+
  - client_team_ownerships: `using (is_admin())` for SELECT pre-cutover; udvides i trin 10 med subtree-scope efter clients eksisterer (subtree-check via `acl_subtree_org_units` mod team's org_unit, hvilket undgår assignments-recursion fordi cache-mæssigt læser closure direkte)

**Argument mod A (kun infrastruktur):**

Helper uden brug = dead code. role_page_permissions har allerede `scope='subtree'` som CHECK-constraint-værdi (eksisterer fra trin 1's `role_page_permissions` definition). Aktivering på employees er den naturlige test af at mekanismen virker end-to-end. Også: benchmark-test (Step 9) skal benchmarke subtree-policy mod ægte tabel-policy, ikke kun helper-funktion isoleret.

**Argument mod C (alle core_identity-tabeller):**

Over-eager. Eksempler:

- `roles` har ingen naturlig subtree-dimension (role = global definition)
- `role_page_permissions` har ingen subtree-dimension (er definitionen af scope-mekanikken)
- `employee_active_config` er singleton-konfig

Subtree-scope-aktivering på de tre nye T9-tabeller + employees dækker det meningsfulde behov. Resten har enten `using (true)` (struktur-tabeller) eller `using (is_admin())` (konfig).

**Konsekvens for permission-matrix:** ny rækker for `org_units`/`teams`/`employee_team_assignments`/`client_team_ownerships`-page-keys; oppdatere `m1_permission_matrix.sql` smoke-test til at validere bootstrap for superadmin-rolle.

### Valg 6 — Benchmark-test-implementation

**Anbefaling: B — fitness-check (`subtree-rls-benchmark`) i `scripts/fitness.mjs` med tx-rollback-substrat.**

Konkret:

- Fitness-check fil-niveau: ny entry i `scripts/fitness.mjs` med ID `subtree-rls-benchmark`
- Eksekverer mod `process.env.SUPABASE_DB_URL` (samme DB-connection som eksisterende DB-tests)
- Wraps benchmark i `BEGIN; ... ROLLBACK;` så syntetisk data ikke persisteres
- SLA-assertion: p95 query-latency <5ms pr. row på SELECT \* FROM employees WHERE id = ANY(acl_subtree_employees(<test-employee>)) over 500 rows
- EXPLAIN-assertion: kører `EXPLAIN (FORMAT JSON) SELECT ...` og fejler hvis JSON indeholder `"Node Type": "WorkTable Scan"` (recursive CTE indicator) i policy-evaluerings-path
- Tolerance-budget: SLA-fejl kun hvis p95 > 5ms over 10 kørsler (median-based); engangs-spikes accepteres for at undgå false-positive på langsomme CI-runners
- Idempotens: hver kørsel ruller tilbage; data-generator bruger deterministisk seed (samme run-til-run for samme commit)

**Argument mod A (dedikeret CI-step i ci.yml):**

ci.yml's `Lint, typecheck, test, build`-job kører allerede fitness via `pnpm fitness`. Et separat job tilføjer pipeline-overhead uden funktionel gevinst. fitness.mjs er det etablerede sted for CI-blockers; tilføjelse her er konsistent.

**Argument mod C (smoke-test i supabase/tests/):**

supabase/tests/smoke/ kører pgtap-style assertions via psql, ikke timing-måling. Tilføjelse af perf-budget vil kræve ny tooling (timing-roundtrip via psql er upålideligt). fitness.mjs har allerede DB-connection-håndtering og kan måle timing via JS Date.now() med god granularitet.

**Falsk-positiv-mitigation:**

- 10 kørsler, p95 over median (ikke peak)
- SLA er 5ms pr. row i master-plan §3; CI-runner kan være op til 2× langsommere end lokalt. Hvis CI viser systematisk problem: dokumentér via G-nummer og juster SLA-tærskel (kræver Mathias-runde, ikke inline)
- Falsk-negativ-afgrænsning dokumenteres: benchmark-check tester ikke RPC-side-effects der INSERT'er indirekte mens policy-eval kører (samme afgrænsning som CI-blocker 20)

### Valg 7 — Syntetisk data-generator

**Anbefaling:** TypeScript-modul `scripts/perf-generators/subtree-rls.mjs` der eksponerer `generateSubtreeRLSDataset(seed: string): SQLStatements`.

Konkret:

- Sprog: TypeScript (matcher fitness.mjs's stack)
- Placering: `scripts/perf-generators/subtree-rls.mjs` — ny mappe for syntetiske generatorer (vil rumme `lock-pipeline.mjs` osv. når trin 14/22 bygger)
- Deterministic seed: SHA-256 hash af input-streng som RNG-seed. Samme commit-hash som seed → samme data
- Output: liste af SQL-statements der INSERT'er 50 org_units (5-niveau dybde, ~10 children pr. niveau) + 500 employees fordelt over træet (10 pr. team, varieret)
- Cleanup: BEGIN; <inserts>; <benchmark queries>; ROLLBACK; — ingen ON DELETE-cascades nødvendige fordi rollback erstatter dem
- Generator-modul har eksporterede konstanter for forventede tæller: `EXPECTED_ORG_UNITS = 50`, `EXPECTED_EMPLOYEES = 500`, så assertions er centraliserede

**Begrundelse:** fitness.mjs er Node/ESM; importere generator-modul er trivielt. SQL-only-generator i .sql-fil kan ikke trivielt parametriseres med seed (pgcrypto findes, men setseed() + random() er ikke determineret-på-tværs-af-pg-versioner garanteret). TypeScript-generator giver kontrol.

### Valg 8 — Benchmark-substrat når sales ikke eksisterer

**Anbefaling: C — udskyd 1M-sales-benchmark til trin 14; T9 har 500-employees-benchmark.**

Konkret T9-benchmark-dataset:

- 50 org_units i 5-niveau hierarki
- 500 employees fordelt jævnt (~10 pr. team; ~50 teams)
- Bench-target: `SELECT * FROM core_identity.employees WHERE id = ANY(acl_subtree_employees(<random_root_employee>))`
- SLA: p95 <5ms pr. row (matcher master-plan §3 specifikation for "subtree-RLS"-benchmark)

Trin 14-benchmark (i dokumentations-noter for fremtidigt trin):

- Genbruger samme generator-modul, udvider med 1M sales-rows (linket via `assigned_employee_id` til T9's 500 syntetiske employees)
- Bench-target: SELECT mod sales-tabel med subtree-policy aktiveret
- Tilføjes til samme `subtree-rls-benchmark` fitness-check som ekstra assertion-blok

**Argument mod A (employees-only uden sales):**

Krav-dok specifically mentions 1M sales i §3-reference, men kontekst-konsistent: master-plan §3 specifikation er "50 enheder × 5-niveau dybde, 500 medarbejdere, 1M sales". De tre tal er semantisk uafhængige (struktur, identitets-skala, content-skala). T9 dækker første to; trin 14 tilføjer det tredje. Dette matcher §0.5 + §4-trin-tildeling (sales i trin 14).

**Argument mod B (proxy-tabel):**

At bygge 1M-rows syntetisk proxy-tabel i T9 koster: ekstra schema, ekstra fitness-check, og introducerer "fake sales" i core_money — bryder schema-grænser og princip 1 (én sandhed). Trin 14's faktiske sales-tabel er den korrekte substrat.

**Konsekvens for action-items:** bygge-status får action-item: "subtree-RLS 1M-sales-benchmark (master-plan §3 fuld specifikation): tilføjes til `subtree-rls-benchmark` fitness-check i trin 14". Pegepind etableres i T9-slut-rapport.

### Valg 9 — Migration discovery-script implementation

**Anbefaling:**

- Sprog: SQL mod 1.0 (via psql), wrapped i TypeScript runner for output-format og parameter-håndtering
- Placering: `scripts/migration/t9-teams-discovery.mjs` (TypeScript runner) + `scripts/migration/t9-teams-discovery.sql` (SQL-query). Matcher trin 5's struktur (Migration-scripts: discovery + extract + upload — bygge-status trin 2)
- Output-format: Markdown-rapport saved til `migration-reports/t9-teams-discovery-<YYYY-MM-DD-HHmmss>.md` + console-summary; rapport-mappe `.gitignore`'d
- Inkonsistens-detektion:
  - **Dubletter:** teams med samme `(navn, parent_team_id)` i 1.0
  - **Hængende relationer:** medarbejdere med `team_id` der peger på slettet/inaktiv team i 1.0
  - **Manglende koblinger:** medarbejdere uden team_id; teams uden afdelings-tilhør
  - **Klient-team-historik-huller:** klient-team-relationer hvor `from_date > to_date` eller hvor `to_date IS NOT NULL AND to_date < from_date` (data-fejl i 1.0)
  - **Cross-team-stab:** medarbejdere med flere aktive team-assignments samtidig (1.0-mønster der bortfaler i 2.0 pr. pkt 7)
- Upload-script: `scripts/migration/t9-teams-upload.mjs` med `--from-date <YYYY-MM-DD>` parameter (default = ingen filter; alt fra 1.0 hentes)
- Idempotens: UNIQUE-constraints på 2.0-tabeller (org_units-name+parent_id, teams-name+org_unit_id) gør upload re-runnable. Audit-spor sætter `source_type='migration'` + `change_reason='legacy_import_t0'` (§0.5)

**Begrundelse:** SQL er bedst til komplekse joins mod 1.0-skema. TypeScript-runner giver output-fleksibilitet og parameter-håndtering. Hybrid-tilgangen følger trin-5-mønsteret som Mathias allerede har valideret.

**Konsekvens:** discovery-rapporter er Mathias-konsumeret artefakt, ikke kode-output. Mathias retter i 1.0 eller markerer hvad der håndteres ved import (§0.5).

### Valg 10 — Commit-struktur og implementations-rækkefølge

**Anbefaling:** 10 fil-cluster-commits i denne rækkefølge. Hver cluster har én commit-besked beskrivende hvad clusteret leverer.

(Detaljer i Implementations-rækkefølge-sektionen nedenfor.)

**Begrundelse:** Cluster-commits matcher H024+H020-mønstret. Hver cluster er semantisk afgrænset; rollback ved fejl i én cluster påvirker ikke tidligere clusters. Slut-rapport dokumenterer commit-hash pr. cluster.

---

## Implementations-rækkefølge

**V2-re-ordering rationale (Codex KRITISK fund 2):** V1's rækkefølge oprettede `acl_subtree`-helperen i Step 2 (efter closure-tabel) men før `teams` (Step 3) og `employee_team_assignments` (Step 4) — helperen kunne ikke kompilere som SQL-funktion der refererer disse tabeller. Tilsvarende lukkede `team_deactivate` i Step 3 åbne `employee_team_assignments` der endnu ikke eksisterede. V2 flytter alle helpers + `team_deactivate` til Step 5 hvor alle dependency-tabeller er etableret.

Dependency-chain (lineær):

- Step 1 (`org_units`) → ingen deps
- Step 2 (`org_unit_closure`) → deps Step 1
- Step 3 (`teams`) → deps Step 1 (FK)
- Step 4 (`employee_team_assignments`) → deps Step 3 + eksisterende `employees`
- Step 5 (acl-helpers + `team_deactivate`) → deps Steps 2+3+4
- Step 6 (`client_team_ownerships`) → deps Step 3
- Step 7 (subtree-policies på employees + assignments) → deps Step 5
- Step 8 (migration scripts) → uafhængig af DB-state
- Step 9 (benchmark) → deps Steps 5+7
- Step 10 (klassifikation + docs) → deps alle

### Step 1 — org_units + cycle-detection-trigger + RLS + audit + tests

- **Migration-fil:** `20260517100000_t9_org_units.sql`
- **Hvad:** Tabel `core_identity.org_units(id, name, parent_id, is_active, created_at, updated_at)` med selv-refererende FK, BEFORE-trigger for cycle-detection (rekursiv CTE), FORCE RLS, SELECT-policy `using (true)`, INSERT/UPDATE/DELETE-policies kun via RPC, audit-trigger
- **Hvorfor først:** alle senere T9-tabeller har FK til org_units
- **Risiko:** lav. Cycle-detection-trigger er standard pattern (eksisterer ikke andre selv-refererende tabeller i 2.0 endnu, men er veldokumenteret i §1.7); fitness-check fanger hvis trigger mangler
- **Rollback:** revert migration; ingen produktions-data (pre-cutover)
- **Tests (`supabase/tests/smoke/t9_org_units.sql`):**
  - Smoke: INSERT root org_unit (parent_id=NULL); SELECT bekræfter row
  - Cycle-detect: INSERT 3 niveauer; forsøg UPDATE der ville lave cycle → blokeret
  - is_active=false: nye INSERT'er med parent_id pegende på is_active=false → blokeret (trigger udvidet)
  - Audit: org_unit_upsert producerer audit_log-row

### Step 2 — org_unit_closure + maintain-trigger + audit-exempt-allowlist + tests

- **Migration-fil:** `20260517100001_t9_org_unit_closure.sql`
- **Hvad:** Tabel `core_identity.org_unit_closure(ancestor_id, descendant_id, depth)` PK(ancestor_id, descendant_id) + INDEX(descendant_id); AFTER-trigger på org_units der genberegner berørt subtree (Valg 2); FORCE RLS + `using (true)` SELECT-policy; tilføj closure-tabel til `AUDIT_EXEMPT_SNAPSHOT_TABLES` i `scripts/fitness.mjs` (Valg 3). **NB:** ingen helpers oprettes i denne step — de bygges i Step 5 hvor alle dependency-tabeller (teams + employee_team_assignments) findes (jf. V2-re-ordering)
- **Hvorfor:** kræver org_units fra Step 1
- **Risiko:** mellem. Trigger-korrekthed kritisk for subtree-policy. Mitigation: dedikeret consistency-fitness-check (Step 9) + tests
- **Rollback:** revert migration + fitness.mjs ændring
- **Tests:**
  - Smoke: bygge 3-niveau-træ; verificér closure har korrekt antal rows (sum over alle ancestor-descendant-relationer inkl. self)
  - INSERT/UPDATE/DELETE-rebuild: ændre parent_id, slette org_unit; verificér closure-konsistens efter
  - **Note:** helper-tests (`acl_subtree_org_units` / `acl_subtree_employees`) ligger i Step 5, ikke her — helpers er ikke oprettet endnu

### Step 3 — teams + RLS + audit + team_upsert + tests

- **Migration-fil:** `20260517100002_t9_teams.sql`
- **Hvad:** Tabel `core_identity.teams(id, name, org_unit_id, is_active, created_at, updated_at)` med FK til org_units (ON DELETE RESTRICT — mathias-afgoerelser pkt 4 implicit); FORCE RLS; SELECT `using (true)`; INSERT/UPDATE/DELETE via RPC; audit-trigger; trigger der blokerer INSERT/UPDATE hvis org_unit.is_active=false; RPC `team_upsert` (manage). **NB:** `team_deactivate` flyttet til Step 5 fordi den skal lukke åbne `employee_team_assignments` der først eksisterer fra Step 4 (jf. V2-re-ordering — Codex KRITISK fund 2)
- **Hvorfor:** kræver org_units; placeres før tilknytnings-tabeller fordi de har FK
- **Risiko:** lav
- **Rollback:** revert migration
- **Tests:** smoke (upsert + read), is_active=false blokering. **NB:** team_deactivate-test ligger i Step 5

### Step 4 — employee_team_assignments + skifte-RPC + tests

- **Migration-fil:** `20260517100003_t9_employee_team_assignments.sql`
- **Hvad:** Tabel `core_identity.employee_team_assignments(id, employee_id, team_id, from_date, to_date, created_at, updated_at)`; partial UNIQUE `(employee_id) WHERE to_date IS NULL`; EXCLUDE constraint `(employee_id WITH =, daterange(from_date, coalesce(to_date, 'infinity'::date)) WITH &&)` (kræver `CREATE EXTENSION IF NOT EXISTS btree_gist` hvis ikke allerede aktiveret); FK til employees + teams; FORCE RLS; SELECT-policy `using (true)` (V3 — team-membership som struktur-meta; jf. Strukturel beslutning "RLS-rekursion-håndtering" + Valg 5); INSERT/UPDATE via RPC kun (audit-trigger blokerer direkte writes; has_permission-check gates RPC); audit-trigger; RPC `employee_team_assignment_change` (luk åben + åbn ny i samme tx; `set local stork.source_type='manual'` + `set local stork.change_reason=p_change_reason`)
- **Hvorfor:** kræver teams + employees. SELECT-policy er final `using (true)` allerede her — ingen senere subtree-extension (V3-ændring fra V2 hvor Step 7 ville udvide policy)
- **Risiko:** mellem. EXCLUDE-constraint er ny i 2.0; verificér btree_gist-extension. Skifte-RPC's atomaritet kritisk
- **Rollback:** revert migration (assignments er pre-cutover-tom)
- **Tests:**
  - Smoke: tildel medarbejder team; skift team; verificér gammel assignment lukket + ny åbnet
  - Overlap-blokering: forsøg to assignments med overlappende daterange → blokeret af EXCLUDE
  - Stab-undtagelse: assignment for stab-medarbejder følger samme regler (krav-dok punkt 7)
  - SELECT-policy `using (true)`: alle authenticated-brugere ser alle assignments (test verificerer både self-bruger og non-self-bruger via `set local role authenticated` + `request.jwt.claim.sub`)
  - Write-protection: forsøg direkte INSERT/UPDATE som authenticated-bruger uden RPC-context → blokeret af audit-trigger eller manglende policy

### Step 5 — acl-helpers + team_deactivate-RPC + tests (NY i V2)

- **Migration-fil:** `20260517100004_t9_acl_helpers.sql`
- **Hvad:**
  - Opret 5 helpers per Valg 1: `acl_subtree_org_units(p_employee_id uuid) returns uuid[]`, `acl_subtree_employees(p_employee_id uuid) returns uuid[]`, `acl_self(p_target_employee_id uuid) returns boolean`, `acl_team(p_target_employee_id uuid) returns boolean`, `acl_all() returns boolean` — alle `language sql stable security invoker set search_path = ''`
  - Opret RPC `team_deactivate(p_team_id uuid, p_change_reason text) returns void` der sætter `teams.is_active=false` + opdaterer alle åbne `employee_team_assignments` for det team (`to_date = current_date`) i samme transaktion (`set local stork.source_type='manual'` + `set local stork.change_reason=p_change_reason`)
- **Hvorfor (V2-fix på Codex KRITISK fund 2):** alle helper-dependencies eksisterer nu — `org_unit_closure` fra Step 2, `teams` fra Step 3, `employee_team_assignments` fra Step 4. Tilsvarende kan `team_deactivate` lukke åbne assignments fordi tabellen er etableret. I V1 var disse oprettet for tidligt (helper i Step 2 før assignments i Step 4)
- **Risiko:** mellem. Helper-korrekthed verificeres via dedikeret test mod kendt fixture; subtree-policy-konsumenter (Step 7) hænger på korrekt helper-output. team_deactivate kræver atomicity (begge updates i samme tx eller ingen)
- **Rollback:** revert migration (helpers + RPC droppes; pre-cutover ingen produktions-konsumenter)
- **Tests (`supabase/tests/smoke/t9_acl_helpers.sql`, tx-rollback per CI-blocker 20):**
  - Fixture: 3 org_units (root, sub-A, sub-B med sub-A og sub-B begge under root); 3 teams (T-root under root, T-A under sub-A, T-B under sub-B); 4 employees: E-root-mgr aktiv i T-root; E-A aktiv i T-A; E-B aktiv i T-B; E-team-less ingen aktiv assignment. Auth_user_id sat for hver employee for authenticated-rolle-tests
  - **Authenticated-rolle-tests (per Codex V2 anbefaling):** Hver helper-kald køres som `set local role authenticated; set local "request.jwt.claim.sub" = '<auth_user_id>'` for at simulere faktisk bruger-kontekst (ikke postgres/service-role med RLS-bypass)
  - `acl_subtree_org_units(E-root-mgr)` kørt som E-root-mgr-authenticated → array indeholder [root, sub-A, sub-B] (E-root-mgr's team T-root peger på root-org_unit; closure giver root + descendants sub-A, sub-B). Helper læser kun structure-tabeller (closure/teams/assignments — alle `using (true)`), ingen RLS-blokering
  - `acl_subtree_org_units(E-A)` kørt som E-A-authenticated → array indeholder [sub-A] (sub-A er leaf; ingen descendants)
  - `acl_subtree_employees(E-root-mgr)` kørt som E-root-mgr-authenticated → array indeholder [E-root-mgr, E-A, E-B] (alle aktive assignments mod teams i caller's subtree — verificerer at helper kan læse assignments via `using (true)`-policy uden recursion)
  - `acl_subtree_org_units(E-team-less)` kørt som E-team-less-authenticated → tom array (team-løs; ingen aktive assignments)
  - `acl_subtree_org_units(NULL)` → tom array (defensive default; uafhængig af caller)
  - `team_deactivate(T-A, 'team-ophør')` kørt som superadmin (has_permission('teams', 'manage', can_edit=true)): efter kald T-A.is_active=false; E-A's åbne assignment har to_date=current_date; E-root-mgr's og E-B's assignments urørte; alt i én transaktion (eksplicit failure-test: simuler RAISE midt i RPC → ingen ændring committet)

### Step 6 — client_team_ownerships (uden client FK) + skifte-RPC + tests

- **Migration-fil:** `20260517100005_t9_client_team_ownerships.sql`
- **Hvad:** Tabel `core_identity.client_team_ownerships(id, client_id, team_id, from_date, to_date, created_at, updated_at)`; client_id UUID NOT NULL (ingen FK; jf. Valg 4); partial UNIQUE `(client_id) WHERE to_date IS NULL`; EXCLUDE `(client_id WITH =, daterange WITH &&)`; FK til teams; FORCE RLS; SELECT policy `using (is_admin())` (pre-cutover; udvides i trin 10 med subtree-scope efter clients eksisterer); audit-trigger; RPC `client_team_ownership_change`; client_id på `FK_COVERAGE_EXEMPTIONS` allowlist i `scripts/fitness.mjs`
- **Hvorfor:** kræver teams; uafhængig af employees-side. Placeres efter Step 5 for at samle alle policy-arbejde fra Step 7 sekventielt
- **Risiko:** lav (ingen client-FK til at bryde; pre-cutover ingen rows)
- **Rollback:** revert migration + fitness.mjs ændring
- **Tests:** smoke med syntetisk client_id-uuid; overlap-blokering; tx-atomicity af skifte

### Step 7 — subtree-policy på employees + permission-matrix-opdatering

- **Migration-fil:** `20260517100006_t9_subtree_policy_employees.sql`
- **Hvad:**
  - Drop eksisterende `employees_select`-policy; opret ny `employees_select` med udvidet predicate `(auth_user_id = auth.uid() OR core_identity.is_admin() OR id = ANY(core_identity.acl_subtree_employees(core_identity.current_employee_id())))`
  - Seed nye `role_page_permissions`-rækker for superadmin på (org_units|teams|employee_team_assignments|client_team_ownerships).manage med scope='all' ON CONFLICT DO NOTHING
- **Hvorfor (V3-ændring):** V2 udvidede også `employee_team_assignments_select` med subtree-clause, men det skabte RLS-rekursion (Codex V2 KRITISK). V3 fjerner assignments-subtree-update — assignments er allerede `using (true)` fra Step 4 (V3-arkitektur, jf. Strukturel beslutning). Step 7 fokuserer på employees-policy + permission-matrix-seed
- **Risiko:** mellem. Policy-replacement på eksisterende tabel skal ikke bryde eksisterende self-clauses. Mitigation: tests bekræfter både self-only-bruger (uden tilknytning) og admin har samme adgang som før
- **Rollback:** revert migration (DROP + recreate gammel employees-policy)
- **Tests (authenticated-rolle-disciplin per Codex V2):**
  - Selv-bruger uden team-tilknytning kørt som `set local role authenticated` + `request.jwt.claim.sub = '<E-team-less.auth_user_id>'` → ser stadig sig selv via auth.uid()-clause (subtree-clause returnerer tom array; self-clause bærer adgang)
  - Admin kørt som admin-authenticated → ser alle (is_admin()-clause)
  - FM-chef E-root-mgr (med team T-root i root-org_unit) kørt som E-root-mgr-authenticated → ser sig selv (auth.uid()-clause) + alle employees i subtree [E-A, E-B] (subtree-clause via `acl_subtree_employees`)
  - Bruger uden for nogen subtree (E-A i sub-A) kørt som E-A-authenticated → ser sig selv + tom subtree (sub-A er leaf; ingen descendants); ikke E-root-mgr eller E-B
  - Recursion-tjek: helper-evaluering under employees-policy-check skal ikke gen-trigger employees-policy. Bevises via SQL-test der måler antal policy-evals via `pg_stat_statements` (eller via EXPLAIN) for en SELECT mod employees som subtree-bruger

### Step 8 — migration discovery + extract + upload-scripts

- **Filer:** `scripts/migration/t9-teams-discovery.{mjs,sql}`, `scripts/migration/t9-teams-extract.sql`, `scripts/migration/t9-teams-upload.mjs`
- **Hvad:** Per Valg 9. Discovery genererer markdown-rapport i `migration-reports/`. Extract laver CSV/SQL-dump fra 1.0. Upload læser dump, INSERT'er i 2.0 med source_type='migration'
- **Hvorfor:** uafhængig af DB-state; kan komme parallelt med DB-steps. Placeres her for at samle alle DB-tabeller før migration-scripts skrives mod dem
- **Risiko:** lav (scripts kører kun på Mathias' manuelle invokation; ingen automatisk eksekvering i CI)
- **Rollback:** slet scripts; ingen DB-effekt
- **Tests:** scripts har self-test mode (`--dry-run`) der validerer SQL-syntaks uden eksekvering. Mathias kører manuelt mod 1.0 når relevant

### Step 9 — subtree-RLS benchmark fitness-check + generator + EXPLAIN-assertion + consistency-check

- **Filer:** `scripts/fitness.mjs` (udvidet med nye checks), `scripts/perf-generators/subtree-rls.mjs` (ny)
- **Hvad:** Per Valg 6+7+8. Fitness-check ID `subtree-rls-benchmark` der spawner 50×5×500 syntetisk data via tx-rollback; benchmarker subtree-policy-evaluering (target: `acl_subtree_employees`-baseret policy på employees); fejler hvis p95 >5ms eller EXPLAIN viser rekursion; samtidig consistency-check `org_unit_closure_consistency` der verificerer closure matcher org_units-tree
- **Hvorfor:** kræver alle DB-steps + acl-helpers (Step 5) + subtree-policy aktiv (Step 7)
- **Risiko:** mellem (false-positive-risiko fra CI-runner-varians). Mitigation per Valg 6: p95 over 10 kørsler, median-baseret
- **Rollback:** revert fitness.mjs + perf-generators-fil
- **Tests:** fitness-check kører selv som test; lokal `pnpm fitness` skal være grøn før push

### Step 10 — klassifikation + dokumentations-opdateringer + cleanup

- **Migration-fil:** `20260517100007_t9_classify.sql`
- **Filer (docs):** `docs/strategi/bygge-status.md`, `docs/teknisk/permission-matrix.md`, `docs/teknisk/teknisk-gaeld.md`, `docs/coordination/aktiv-plan.md`, `docs/coordination/seneste-rapport.md`
- **Hvad:**
  - INSERT'er i `core_compliance.data_field_definitions` for alle nye T9-kolonner (org_units/teams/closure/assignments/ownerships); kategori='operationel' eller 'master_data'; pii_level='none' (jf. krav-dok pkt 9); retention_type='time_based' default; ON CONFLICT DO NOTHING
  - Live-DB-query mod `data_field_definitions` for current count (forventning: 193 før + T9-kolonner)
  - bygge-status: trin 9 → ✓ Godkendt; klassifikations-tal-action-item lukket; 1M-sales-benchmark-action-item tilføjet (deadline trin 14)
  - permission-matrix: 4 nye page-keys + 5 nye RPC'er; auto-genereret-bemærkning opdateret til 2026-05-17-introspection
  - teknisk-gaeld: tilføj G-nummer-kandidater fra Claude.ai findings 2+3 (rettelse 23-udvidelse for derived-tables; allowlist-kategori for cross-trin interne FK'er)
  - aktiv-plan.md: ryd til "ingen aktiv plan" + tilføj T9 til Historisk
  - seneste-rapport.md: peg på T9-slut-rapport
  - Arkivér krav-dok + plan + plan-feedback til `docs/coordination/arkiv/`
- **Hvorfor:** sidste step; samler oprydning og opdatering per disciplin-pakke 2026-05-16. Combined fordi klassifikations-migration er minimal (én SQL-fil) og naturligt hører sammen med docs-opdateringer
- **Risiko:** lav (klassifikations-migration + dokumenter)
- **Rollback:** revert commits
- **Tests:** migration-gate kører i CI; fitness-check verificerer 0 unklassificerede kolonner; grep-tjek for stale referencer

---

## Test-konsekvens

Nye eller ændrede tests pr. step:

- **`supabase/tests/smoke/t9_org_units.sql`** — INSERT/SELECT, cycle-detect, is_active-blokering, audit. Forventet status: grøn
- **`supabase/tests/smoke/t9_org_unit_closure.sql`** — closure-konsistens efter INSERT/UPDATE/DELETE. Tx-rollback per CI-blocker 20. Forventet status: grøn. (Helper-output-tests ligger i t9_acl_helpers.sql, ikke her — helpers oprettes først i Step 5)
- **`supabase/tests/smoke/t9_teams.sql`** — upsert, is_active=false-blokering. Forventet status: grøn. (team_deactivate-test ligger i t9_acl_helpers.sql, ikke her — RPC oprettes først i Step 5)
- **`supabase/tests/smoke/t9_employee_team_assignments.sql`** — skifte-RPC atomicity, EXCLUDE-blokering af overlap, stab-undtagelse, `using (true)` SELECT-policy verificeret som authenticated-bruger, write-protection (direkte INSERT som authenticated-bruger uden RPC blokeret). Tx-rollback. Forventet status: grøn
- **`supabase/tests/smoke/t9_acl_helpers.sql`** (ny i V2; udvidet i V3) — `acl_subtree_org_units` + `acl_subtree_employees` mod 3-niveau-fixture, team-løs employee, NULL-input. **V3:** alle helper-kald køres som `set local role authenticated` + `request.jwt.claim.sub` for at simulere faktisk bruger-kontekst (verificerer ingen RLS-recursion); `team_deactivate` atomic close + failure-rollback. Tx-rollback. Forventet status: grøn
- **`supabase/tests/smoke/t9_client_team_ownerships.sql`** — uden client FK; skifte-RPC; overlap-blokering. Tx-rollback. Forventet status: grøn
- **`supabase/tests/smoke/t9_subtree_policy_employees.sql`** (V3 — renamed fra V2's `t9_subtree_policies.sql`) — verificerer udvidet employees-policy via authenticated-rolle: self-only-bruger, subtree-bruger (FM-chef ser sin afdeling), admin, recursion-tjek via EXPLAIN/pg_stat_statements. Tx-rollback. Forventet status: grøn
- **`supabase/tests/smoke/m1_permission_matrix.sql`** (eksisterende, opdateres) — tilføjer assertions for nye RPC'er
- **Fitness-checks:**
  - `subtree-rls-benchmark` (ny) — p95 <5ms + EXPLAIN-no-recursion
  - `org_unit_closure_consistency` (ny) — closure matcher org_units-tree
  - `db-test-tx-wrap-on-immutable-insert` (eksisterende) — udvides hvis nye tabeller havner på immutability-listen (de gør ikke; assignments + ownerships er mutable men append-only-pattern)
  - `audit-trigger-coverage` (eksisterende) — verificerer at closure-tabel er på allowlist; alle andre T9-tabeller har audit-trigger
  - `fk-coverage` (eksisterende, CI-blocker 19) — verificerer at `client_team_ownerships.client_id` er på allowlist med begrundelse

---

## Risiko + kompensation

Risiko-matrix:

| Migration / Step        | Værste-case                                                                                  | Sandsynlighed | Rollback                                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Step 1 org_units        | Cycle-detect-trigger har bug; producerer falsk-negativ                                       | lav           | revert migration; pre-cutover ingen rows                                                                                      |
| Step 2 closure          | Maintain-trigger rebuild forkert; subtree-policy får forkert data                            | mellem        | revert + fitness-consistency-check fanger inden cutover                                                                       |
| Step 4 assignments      | EXCLUDE-constraint accepterer overlap (gist-extension fejl)                                  | lav           | revert; manuel cleanup af duplikater (pre-cutover tomt)                                                                       |
| Step 5 acl-helpers      | acl_subtree_employees returnerer forkert sæt; subtree-policy lækker                          | mellem        | revert migration; authenticated-rolle-fixture-tests + benchmark fanger inden cutover                                          |
| Step 5 RLS-recursion    | Fremtidig policy-ændring genintroducerer recursion via subtree-clause på helper-source-table | lav           | structure-tabeller (closure/teams/assignments) holdes på `using (true)`; explicit migration-kommentar dokumenterer constraint |
| Step 5 team_deactivate  | Lukker assignments ikke atomisk; halv-tilstand efter failure                                 | mellem        | revert migration; SQL-tests bekræfter rollback ved failure                                                                    |
| Step 6 ownerships       | client_id uden FK accepterer invalid uuid                                                    | lav           | trin 10 FK-add fanger ved ALTER; pre-cutover ingen rows                                                                       |
| Step 7 employees-policy | Eksisterende self-clause utilsigtet droppet                                                  | mellem        | revert migration; tests fanger via auth.uid()-only-bruger                                                                     |
| Step 9 benchmark        | False-positive på langsom CI-runner blokerer PR'er                                           | mellem        | hæv SLA-tærskel via G-nummer + Mathias-runde                                                                                  |
| Step 10 classify        | Migration-gate fejler på manglende kolonner                                                  | lav           | tilføj manglende entries i samme commit                                                                                       |

**Kompensation (generelt):** hvis pakken fejler under build:

- Cluster-commits gør rollback mulig per-cluster (revert specifik commit; tidligere clusters bevares)
- Pre-cutover-state: ingen produktions-data tabes
- Build-PR mod main: hvis CI fejler → fix på branch; main berøres ikke før merge
- Worst-case: revert hele PR; T9 udskydes; trin 10 forbliver klar til at starte (afhænger ikke direkte af T9 — masterplan §1.7 er kilden)

---

## Oprydnings- og opdaterings-strategi

**Filer der skal flyttes til arkiv** (efter pakken er merget):

- `docs/coordination/T9-krav-og-data.md` → `docs/coordination/arkiv/T9-krav-og-data.md`
- `docs/coordination/T9-plan.md` → `docs/coordination/arkiv/T9-plan.md`
- Alle `docs/coordination/plan-feedback/T9-*.md` → `docs/coordination/arkiv/` (V<n>-codex.md, V<n>-claude-ai.md, V<n>-approved-\*.md, V<n>-blokeret.md hvis nogen)

**Filer der skal slettes:** ingen.

**Dokumenter der skal opdateres** (som DEL af build, ikke separat trin):

- `docs/coordination/aktiv-plan.md` → ryd til "ingen aktiv plan"; tilføj T9 til Historisk-sektion med commit-range
- `docs/coordination/seneste-rapport.md` → peg på `docs/coordination/rapport-historik/<dato>-t9.md`
- `docs/strategi/bygge-status.md` → trin 9 markeret ✓ Godkendt med commit-hash + dato; klassifikations-tal-action-item lukket; action-item om 1M-sales-benchmark tilføjet til "Næste op"-sektion (deadline: trin 14)
- `docs/teknisk/permission-matrix.md` → 4 nye page-keys (org_units, teams, employee_team_assignments, client_team_ownerships) med tilhørende tab-keys (manage primært); 5 nye RPC'er (org_unit_upsert, team_upsert, team_deactivate, employee_team_assignment_change, client_team_ownership_change); auto-genereret-bemærkning opdateret til 2026-05-17-introspection
- `docs/teknisk/teknisk-gaeld.md` → ingen nye G-numre forventet (pakke er ren §4-leverance, ikke gæld-håndtering). Hvis G017 live-applied via Mathias' `supabase db push` i mellemtiden: marker arkiveret. Klassifikations-tal-action-item fra master-plan sandheds-audit lukket
- `docs/coordination/mathias-afgoerelser.md` → ingen ny entry forventet (T9 implementerer eksisterende rammebeslutninger). Hvis benchmark-SLA viser sig at kræve justering: ny entry "T9-benchmark-SLA justeret pga CI-runner-varians" med G-nummer som plan-reference

**Reference-konsekvenser** (ingen omdøbninger/flytninger i T9):

- Ingen filer omdøbes eller flyttes (ud over arkivering af arbejds-artefakter)
- Grep-tjek post-pakke:
  - `grep -r "T9-krav-og-data\|T9-plan" docs/` returnerer kun arkiv + rapport-historik + slut-rapporten selv
  - `grep -r "PAUSET" docs/strategi/bygge-status.md` returnerer 0 hits (T9-pause-status fjernet)

**Ansvar:** Code udfører oprydning + opdatering som del af build-PR (Step 10 i implementations-rækkefølgen), ikke som separat trin. Slut-rapporten verificerer udførelse i "Oprydning + opdatering udført"-sektion.

---

## Konsistens-tjek

- **Disciplin-pakke:** Plan honorerer formåls-immutabilitet (Mathias' afgørelser fra krav-dok er låste); leverer master-plan-paragraffer 1:1 (§1.7 + §3 + §0.5); følger plan-leverance-er-kontrakt (alle 10 valg adresseret); følger destructive-drops-disciplin (ingen DROPs i T9; kun ADD); følger fire-dokument-disciplin (sektion nedenfor).

---

## Fire-dokument-konsultation

| Dokument                                   | Konsulteret | Relevante referencer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Konflikt med plan?                                                                                                                       |
| ------------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/strategi/vision-og-principper.md`    | ja          | Princip 2 (rettigheder i UI — scope-helpers og role_page_permissions.scope-feltet aktiveres med subtree); Princip 3 (sammenkobling eksplicit — FK på parent_id, org_unit_id, team_id, employee_id; client_id på allowlist med plan til trin 10); Princip 6 (audit på alt der ændrer data — alle T9-tabeller har audit-trigger; closure exempt via udvidet rettelse-23-mønster — kategori-udvidelse flagget under Valg 3); Princip 9 (status-modeller bevarer historik — is_active-flag erstatter sletning; versioneret tilknytning med from_date/to_date bevarer historik). **Note V2:** "én medarbejder i ét team ad gangen" (krav-dok pkt 7) er IKKE afledt af vision-princip 8 — princip 8 handler om person-entitets-unikhed på tværs af eksterne systemer (identitets-master i §1.7), ikke om team-tilknytnings-unikhed. Korrekt kilde: mathias-afgoerelser pkt 7. Reference rettet per Claude.ai V1 finding 1                                                                                                                                               | nej                                                                                                                                      |
| `docs/strategi/stork-2-0-master-plan.md`   | ja          | §0.5 (migration-grundprincip — discovery+extract+upload; ingen ETL/staging-schema; source_type='migration'); §1.1 (SECURITY INVOKER for helpers bevaret i V3 — ingen SECURITY DEFINER-deviation; RLS-rekursion løses via helper-source-tabeller `using (true)`); §1.7 (org-træ + closure + acl_subtree-helpers + teams + versionerede tilknytninger — implementeres 1:1; helper-split i V2 = præciserings-udvidelse af §1.7's mønster, ikke brud); §1.11 (core_identity-schema for alle T9-tabeller); §3 CI-blocker 19 (FK-coverage; client_id på allowlist), CI-blocker 20 (tx-wrap; benchmark + tests bruger BEGIN/ROLLBACK); §3 Performance-disciplin (subtree-RLS benchmark som CI-blocker, SLA <5ms, EXPLAIN-no-recursion); §4 trin 9 (alle leverancer dækket); Rettelse 19 C1 (closure-table over rekursiv CTE); Rettelse 20 (migration-strategi); Rettelse 23 (AUDIT_EXEMPT_SNAPSHOT_TABLES-allowlist mønster udvides til derived-tables for closure — kategori-udvidelse flagget under Valg 3, G-nummer-kandidat for master-plan-rettelse efter T9-merge) | nej (V3 bevarer §1.1 SECURITY INVOKER-krav via arkitektur-valg om `using (true)` på helper-source-tabeller; ingen master-plan-deviation) |
| `docs/coordination/mathias-afgoerelser.md` | ja          | 2026-05-16 Forretningssandhed (alle 9 punkter mappet til konkrete plan-elementer — se Mathias' afgørelser-sektion ovenfor); 2026-05-15 §4 trin 9 pauset (forudsætninger opfyldt iht. krav-dok status-sektion); 2026-05-16 Tx-rollback default mønster (T9-tests + benchmark bruger BEGIN/ROLLBACK); 2026-05-16 Oprydnings-disciplin (denne plan har eksplicit Oprydnings-strategi-sektion); 2026-05-16 Fire-dokument-disciplin (denne plan har Fire-dokument-konsultation-sektion); 2026-05-15 Plan-leverance er kontrakt (alle 10 tekniske valg adresseret med konkret anbefaling + begrundelse); 2026-05-16 Master-plan sandheds-audit (klassifikations-tal-inkonsistens lukkes i Step 10; FK-coverage CI-blocker 19 håndhæves)                                                                                                                                                                                                                                                                                                                                 | nej                                                                                                                                      |
| `docs/coordination/T9-krav-og-data.md`     | ja          | Formål-sektion (helt — subtree-baseret rettighedsevaluering); Verificeret scope (alle 8 underafsnit dækket: org-træ, closure, helpers, generelt princip, teams, employee/client-tilknytning, scope-helpers, benchmark, migration, klassifikation, anonymisering); Mathias' afgørelser-tabel (alle 19 rækker honoreret 1:1); 10 tekniske valg (hver behandlet i Tekniske valg-sektion med anbefaling + alternativ-argumentation); Forventet flow (V1 → V<n>-runder → qwerg → build → slut-rapport)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | nej                                                                                                                                      |

**Regel-overholdelse:**

- Ingen "nej" i konsulteret-kolonnen ✓
- Ingen "hele filen" som referencer-værdi for de tre rammeniveau-dokumenter ✓
- Ingen konflikter rapporteret ✓ — planen er konsistent med ramme + krav-dok

---

## Konklusion

V3-planen lukker Codex V2's KRITISK fund (RLS-rekursion mellem helper og assignments-policy) og bevarer V2's lukninger af V1-fund. Samlet status pr. fund-type:

**Codex V1 fund (lukket i V2, bevaret i V3):**

- KRITISK 1 (acl_subtree-kontrakt tvetydig) — helper splittet i acl_subtree_org_units + acl_subtree_employees med eksplicit return-semantik
- KRITISK 2 (implementations-rækkefølge) — lineær dependency-chain; acl-helpers + team_deactivate på Step 5 efter dependency-tabeller

**Codex V2 fund (lukket i V3):**

- KRITISK (RLS-rekursion via assignments-policy der kalder helper der scanner assignments) — løses via `employee_team_assignments_select = using (true)`. Helper-source-tabeller (closure/teams/assignments) er alle `using (true)`; helper kan læse uden RLS-konflikt. SECURITY INVOKER-kravet bevares (master-plan §1.1 + §1.7 honoreret). Authenticated-rolle-test-disciplin tilføjet (Codex anbefaling om at tests skal køre med `request.jwt.claim.sub` set)

**Claude.ai V1 findings (lukket i V2, bevaret i V3):**

- KOSMETISK 1 (princip 8-reference) — fjernet fra fire-dokument-tabel
- KOSMETISK 2 (rettelse 23-kategori-udvidelse) — eksplicit flagget i Valg 3 + G-nummer-kandidat
- KOSMETISK 3 (CI-blocker 19-kategori-udvidelse) — eksplicit flagget i Valg 4 + G-nummer-kandidat

**Tradeoff acknowledged i V3:**

`employee_team_assignments` SELECT-policy = `using (true)` betyder team-membership er synlig for alle authenticated-brugere. Det er bevidst valg konsistent med "org-struktur som data" — assignment-rows er useless without tilhørende employees + forretningsdata, som har subtree-scope. INSERT/UPDATE forbliver kun via RPC med has_permission-check. Hvis Mathias senere ønsker stricter visibility, er denormaliseret cache-tabel (`employee_org_unit_memberships`) en åben alternativ-arkitektur dokumenteret i Strukturel beslutning, men det er master-plan-rettelse-niveau-beslutning.

**Plan-fundament:**

- Alle krav-dok-leverancer adresseret med konkret implementations-vej
- Alle 10 tekniske valg har eksplicit anbefaling + begrundelse + alternativ-argumentation
- Alle fire forretnings-dokumenter konsulteret med konkrete referencer
- Risiko-matrix opdateret med V3-specifikke risici (RLS-recursion-prevention som constraint i fremtidige policy-ændringer)
- Oprydnings-strategi obligatorisk og dokumenteret som DEL af build

Klar til Codex-review V3 (kode-validering) + Claude.ai-review V3 (forretnings-dokument-konsistens) parallelt. Claude.ai's V2-approval gælder IKKE V3 fordi RLS-arkitekturen er materielt ændret; ny approval kræves.
