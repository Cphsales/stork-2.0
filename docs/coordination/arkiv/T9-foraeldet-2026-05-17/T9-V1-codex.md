# T9 — Codex plan-review V1

**Review-type:** Plan V1
**Reviewer:** Codex
**Dato:** 2026-05-17
**Resultat:** FEEDBACK

## Oprydnings-sektion-tjek

OK. Planen har en konkret `Oprydnings- og opdaterings-strategi` med arkivering, dokument-opdateringer, grep-tjek og ansvar.

## Fund

### [KRITISK] `acl_subtree` har ikke en entydig teknisk kontrakt, og RLS-predikatet kan sammenligne employee-id'er med org-unit-id'er

Konkret afvigelse: Planen definerer `core_identity.acl_subtree(p_employee_id uuid) returns uuid[]` som "descendant-array via closure-lookup" (`docs/coordination/T9-plan.md:98`). Closure-tabellen er dog `(ancestor_id, descendant_id, depth)` over org-units (`docs/coordination/T9-plan.md:91`), mens employees-policyen bruger `id = ANY(core_identity.acl_subtree(core_identity.current_employee_id()))` (`docs/coordination/T9-plan.md:187` og `:371`). Hvis helperen returnerer org-unit descendants, sammenligner policyen `employees.id` med `org_units.id` og subtree-adgang virker ikke. Hvis helperen i stedet skal returnere employee-id'er under callerens org-subtree, skal planen sige det eksplicit og beskrive join-vejen gennem aktive `employee_team_assignments -> teams -> org_unit_closure`.

Dette er ikke kun navngivning: det er RLS-korrekthed. En forkert implementeret helper kan enten give nul subtree-adgang eller blive "fikset" ad hoc senere med en anden semantik end tests/benchmark antager. Benchmark-targets gentager samme uafklarede kontrakt (`docs/coordination/T9-plan.md:219` og `:261`).

Anbefalet handling: V2-rettelse. Gør helper-kontrakten entydig før build:

- Enten: `acl_subtree(p_employee_id uuid) returns uuid[]` returnerer **employee IDs** for aktive employees i callerens org-subtree, og planen beskriver SQL-join, aktive assignment-regler, NULL/team-løs adfærd og indexes.
- Eller: split helperne, fx `acl_subtree_org_units(p_employee_id uuid)` for org-unit descendants og `acl_subtree_employees(p_employee_id uuid)` for employee IDs, og brug kun employee-helperen i employees/assignment policies.

### [KRITISK] Implementationsrækkefølgen opretter helper/RPC før de relationer de afhænger af eksisterer

Konkret afvigelse: Step 2 opretter `acl_subtree` og tester "employees -> org_unit (via team) mapping", men `teams` kommer først i Step 3 og `employee_team_assignments` først i Step 4 (`docs/coordination/T9-plan.md:325-349`). Repoets eksisterende helper-mønster er `language sql stable security invoker set search_path=''` for tilsvarende identity helpers (`core_identity.current_employee_id()` og `core_identity.has_permission()`), og SQL-funktioner med relation-referencer kan ikke oprettes før de refererede tabeller findes. Step 2-testen kan heller ikke bygges som beskrevet, fordi fixture-tabellerne endnu ikke findes.

Samme afhængighed findes i Step 3: `team_deactivate` skal "lukke alle åbne employee_team_assignments", men `employee_team_assignments` oprettes først i Step 4 (`docs/coordination/T9-plan.md:337-349`). Hvis RPC'en implementeres som SQL eller valideret PL/pgSQL med direkte relationreferencer, er migrationsordenen igen skrøbelig; hvis den først er testbar efter Step 4, bør planen afspejle det.

Anbefalet handling: V2-rettelse. Flyt oprettelsen af `acl_subtree` til efter Step 4 eller flyt `teams`/`employee_team_assignments` før helperen. Alternativt opret en snæver org-unit-only closure-helper i Step 2 og erstat/udvid med employee-facing `acl_subtree` i Step 6. Flyt `team_deactivate` til efter `employee_team_assignments`, eller del Step 3 i tabel/upsert først og deaktiverings-RPC efter Step 4. Opdater testlisten så hver step kun tester objekter der faktisk findes på det tidspunkt.

## Konklusion

Planen er ikke approval-klar i V1. Oprydningssektionen er OK, men `acl_subtree`-semantikken og migrationsrækkefølgen skal være præcise før Code kan bygge T9 uden RLS- eller migration-apply-risiko.
