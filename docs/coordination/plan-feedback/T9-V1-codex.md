# Codex feedback — T9 plan V1

Review-type: Plan-review
Pakke: T9 — Identitet del 2
Plan-fil: `docs/coordination/T9-plan.md`
Krav-dok: `docs/coordination/T9-krav-og-data.md`
Branch: `claude/T9-plan`
Resultat: FEEDBACK

## Oprydnings-sektion-tjek

OK. Planen indeholder konkret sektion `Oprydnings- og opdaterings-strategi` med berørte migrations-, test-, dokumentations- og statusfiler.

## Fund

### [KRITISK] Muterende public RPC'er bypasser den centrale fortrydelses-mekanisme

Konkret afvigelse: Krav-dok siger, at alle ændringer med gældende dato kan fortrydes i en periode, herunder strukturændringer, medarbejder-flytninger og klient-flytninger (`docs/coordination/T9-krav-og-data.md:93`, `docs/coordination/T9-krav-og-data.md:126`, `docs/coordination/T9-krav-og-data.md:138`, `docs/coordination/T9-krav-og-data.md:150`). Planens beslutning 7 siger tilsvarende, at disse ændringer dækkes af `pending_changes`, og at ændringer først apply'es via handler efter approval + undo-deadline (`docs/coordination/T9-plan.md:69`, `docs/coordination/T9-plan.md:71`). Men implementeringsrækkefølgen bygger først direkte muterende RPC'er:

- `org_node_upsert` / `org_node_deactivate` muterer `org_nodes` direkte (`docs/coordination/T9-plan.md:308`).
- `employee_place` lukker eventuel åben placement og åbner ny i samme transaktion (`docs/coordination/T9-plan.md:334`).
- `client_node_place` / `client_node_close` muterer client placements direkte (`docs/coordination/T9-plan.md:347`).
- `role_permission_grant_set` / `role_permission_grant_remove` muterer grants direkte (`docs/coordination/T9-plan.md:369`, `docs/coordination/T9-plan.md:371`).
- `team_close` sætter team inactive og lukker åbne employee/client placements direkte (`docs/coordination/T9-plan.md:372`).

`pending_changes` kommer først i Step 7 (`docs/coordination/T9-plan.md:392`, `docs/coordination/T9-plan.md:396`, `docs/coordination/T9-plan.md:398`) uden en plan for at gøre de tidligere RPC'er interne apply-handlers eller for at fjerne authenticated execute-adgang til dem. Som planen står, kan buildet ende med to skriveveje: én direkte RPC-vej og én pending-change-vej. Det bryder selve formålet teknisk, fordi ændringer med `effective_from` kan apply'es uden approval/undo-vindue.

Anbefalet handling: V2-rettelse. Gør `pending_changes` til eneste public skrivevej for ændringer, der er omfattet af fortrydelseskravet. De konkrete mutationer bør være interne apply-handler-funktioner uden direkte authenticated execute, eller også skal de eksisterende RPC'er kun oprette `pending_changes`-rows. Tilføj tests der beviser:

- direkte authenticated kald til interne mutationer afvises,
- `pending_change_request` opretter ændringen uden at mutere state,
- `pending_change_apply` er eneste vej der muterer state,
- undo før deadline efterlader state uændret,
- apply-handlerne er idempotente ved re-run.

### [KRITISK] `pending_changes.change_type` dækker ikke planens egne muterende operationer

Konkret afvigelse: Krav-dok beskriver også ændring af roller, permission-elementer og fortrydelses-konfiguration som brugerhandlinger (`docs/coordination/T9-krav-og-data.md:156`, `docs/coordination/T9-krav-og-data.md:164`, `docs/coordination/T9-krav-og-data.md:189`). Step 7 definerer initiale change types som `org_node_upsert`, `org_node_deactivate`, `employee_place`, `employee_remove`, `client_place`, `client_close`, `permission_grant_set` (`docs/coordination/T9-plan.md:396`). Planens RPC-overflade indeholder flere muterende operationer end det:

- `team_close` (`docs/coordination/T9-plan.md:162`, `docs/coordination/T9-plan.md:372`)
- `role_permission_grant_remove` (`docs/coordination/T9-plan.md:169`, `docs/coordination/T9-plan.md:371`)
- `permission_area_upsert`, `permission_page_upsert`, `permission_tab_upsert` og deaktiveringer (`docs/coordination/T9-plan.md:167`)
- `undo_setting_update` (`docs/coordination/T9-plan.md:174`)

Det er en teknisk dispatcher-kontraktfejl: hvis `pending_change_apply` dispatcher på en lukket enum, skal alle public muterende operationsformer enten have en change type + handler eller eksplicit være uden for undo-mekanismen. Planen gør ikke den afgrænsning, og flere af operationerne påvirker netop den permission-/strukturstate, som T9 skal kunne styre sikkert.

Anbefalet handling: V2-rettelse. Lav en komplet change-type-matrix i planen med én række pr. muterende RPC: public request-funktion, intern apply-handler, payload-schema, valideringer, idempotency-regel, undo-adfærd og testnavn. Hvis enkelte operationer med vilje ikke skal gennem `pending_changes`, skal planen sige det eksplicit og begrunde hvorfor det ikke bryder formålet.

### [MELLEM] `can_user_see` kan ikke teknisk kombinere permission-resolve og synlighed med den angivne signatur

Konkret afvigelse: Planen definerer `permission_resolve(p_role_id uuid, p_element_type text, p_element_id uuid)` som helperen der finder `can_access`, `can_write` og `visibility` for et permission-element (`docs/coordination/T9-plan.md:155`). Samtidig defineres `can_user_see(p_employee_id uuid, p_target_id uuid, p_target_kind text)` som en composition over `permission_resolve` + `acl_subtree_employees` (`docs/coordination/T9-plan.md:156`).

Den signatur har ikke nok input til at kalde `permission_resolve`, fordi den mangler permission element type/id. Den kan udlede brugerens rolle fra medarbejder-id, men ikke hvilken area/page/tab der skal evalueres. Resultatet er enten en helper der kun tester org-synlighed uden permission, eller en helper der må bruge implicit global/session-state, hvilket bliver skrøbeligt for senere business-RPC'er.

Anbefalet handling: V2-rettelse. Enten udvid `can_user_see` med permission element input, fx `(p_employee_id, p_target_id, p_target_kind, p_element_type, p_element_id)`, eller split den i to helpers: én der resolver permission-grant og én der kun tester visibility mod org-træet. Tilføj smoke-test hvor samme target er synligt/usynligt afhængigt af forskellig page/tab-grant.
