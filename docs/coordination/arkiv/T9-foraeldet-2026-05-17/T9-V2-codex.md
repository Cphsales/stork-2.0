# T9 — Codex plan-review V2

**Review-type:** Plan V2
**Reviewer:** Codex
**Dato:** 2026-05-17
**Resultat:** FEEDBACK

## Oprydnings-sektion-tjek

OK. Planen har fortsat konkret `Oprydnings- og opdaterings-strategi` med arkivering, dokument-opdateringer, grep-tjek og ansvar.

## Runde-2-regel

Runde 2 stopper kun på KRITISKE code-level fund. Fundet her er KRITISK, fordi det rammer selve subtree-RLS-mekanismen og kan gøre policyen enten ikke-funktionel eller rekursiv under PostgreSQL RLS.

## Fund

### [KRITISK] `SECURITY INVOKER` subtree-helperen læser den samme RLS-beskyttede assignment-tabel som dens policy afhænger af

Konkret afvigelse: V2 gør helper-kontrakten entydig, men `acl_subtree_employees(p_employee_id)` skal bygges ved at reverse-joine `employee_team_assignments WHERE to_date IS NULL` (`docs/coordination/T9-plan.md:115`), og alle helpers er eksplicit `language sql stable security invoker set search_path = ''` (`docs/coordination/T9-plan.md:120` og `:401`). Samtidig er `employee_team_assignments` FORCE RLS-beskyttet og får først en midlertidig self/admin SELECT-policy i Step 4 (`docs/coordination/T9-plan.md:387`), og derefter en subtree-policy i Step 7 der selv kalder `acl_subtree_employees(current_employee_id())` (`docs/coordination/T9-plan.md:429`).

Det giver to tekniske problemer:

- Før Step 7 kan en ikke-admin caller under faktisk `authenticated` RLS kun se egne assignment-rows, så Step 5-testen hvor `acl_subtree_employees(E-root-mgr)` skal returnere `[E-root-mgr, E-A, E-B]` (`docs/coordination/T9-plan.md:410`) kan ikke være korrekt, medmindre testen utilsigtet kører som RLS-bypass-role.
- Efter Step 7 bliver `employee_team_assignments_select` selvrefererende: policyen kalder `acl_subtree_employees`, helperen læser `employee_team_assignments`, og den læsning evaluerer samme policy igen. Det er en klassisk RLS-recursion/selvafhængighed og kan enten fejle med recursion eller reducere helper-output til det policyen allerede tillader. Begge udfald bryder formålet: FM-chef/subtree-bruger får ikke pålidelig adgang til hele subtree'et.

Det rammer også `employees_select`, fordi employees-policyen afhænger af samme helper (`docs/coordination/T9-plan.md:428`), og benchmarket måler en policy-kæde der ikke er bevist eksekverbar som faktisk `authenticated` bruger (`docs/coordination/T9-plan.md:453`).

Anbefalet handling: V3-rettelse. Planen skal definere en ikke-rekursiv RLS-arkitektur for subtree-evaluering før build. Minimum:

- Beskriv præcist hvilken relation/helper der må læse assignment-mapping uden at være afhængig af en policy der kalder samme helper.
- Opdater `employee_team_assignments_select`, så den ikke kalder en helper der selv scanner `employee_team_assignments` under samme policy.
- Tilføj tests der kører som faktisk `authenticated` rolle med `request.jwt.claim.sub` sat for manager/medarbejder, ikke kun som Management API/postgres-role. Testen skal bevise både `acl_subtree_employees` og de endelige `employees`/`employee_team_assignments` SELECT-policies uden RLS-bypass.
- Hvis løsningen kræver afvigelse fra kravet om `SECURITY INVOKER`, skal det markeres som `OUT OF SCOPE — kræver Mathias-runde`; ellers skal V3 vise en implementerbar `SECURITY INVOKER`-vej uden policy-recursion.

## Konklusion

V2 lukker de to V1-fund om helper-semantik og migrationsrækkefølge, men introducerer/afdækker en ny KRITISK RLS-selvafhængighed i selve subtree-helper/policy-kæden. Planen er derfor ikke approval-klar i V2.
