# T9 — Codex approval

**Review-type:** Plan V3
**Reviewer:** Codex
**Dato:** 2026-05-17
**Resultat:** APPROVAL

## Oprydnings-sektion-tjek

OK. Planen har en konkret `Oprydnings- og opdaterings-strategi` med arkivering, dokument-opdateringer, grep-tjek og ansvar.

## Runde-3-vurdering

Runde 3 stopper kun på KRITISKE code-level fund. Jeg finder ingen KRITISKE fund i V3.

Codex V2's KRITISKE fund om RLS-selvafhængighed er teknisk lukket: `employee_team_assignments` er ikke længere en subtree-policy-konsument, men en helper-source-tabel med `using (true)`. Den endelige kæde er lineær:

`employees-policy -> acl_subtree_employees -> employee_team_assignments/teams/org_unit_closure`

Helperen læser dermed ikke en tabel hvis SELECT-policy kalder helperen tilbage.

## G-kandidater / ikke-blokerende noter

### [MELLEM] `employee_team_assignments` bliver all-authenticated metadata

Konkret afvigelse: V3 vælger bevidst `employee_team_assignments_select = using (true)` for at undgå RLS-recursion. Det er teknisk gennemførligt og løser blocker-fundet, men det betyder at alle authenticated-brugere kan se assignment UUID'er, team UUID'er og perioder.

Anbefalet handling: G-nummer. Dokumentér tradeoffet i teknisk gæld eller sikkerhedsnoter efter T9, og revurder den beskrevne cache-løsning (`employee_org_unit_memberships`) hvis Mathias/Claude.ai senere kræver strammere metadata-visibility.

### [KOSMETISK] `aktiv-plan.md` viser stadig V1

Konkret afvigelse: `docs/coordination/aktiv-plan.md` peger korrekt på `docs/coordination/T9-plan.md`, men teksten siger stadig `(V1, claude/T9-plan-branch)` selvom planen nu er V3.

Anbefalet handling: kosmetisk note. Kan rettes i næste plan/cleanup-opdatering; ikke build- eller approval-blokerende.

## Konklusion

APPROVAL fra Codex for T9 Plan V3 på code-level. Ingen KRITISKE blockers fundet.
