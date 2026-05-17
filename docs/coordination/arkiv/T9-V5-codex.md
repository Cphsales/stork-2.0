# Codex feedback — T9 plan V5

Review-type: Plan-review
Pakke: T9 — Identitet del 2
Plan-fil: `docs/coordination/T9-plan.md`
Krav-dok: `docs/coordination/T9-krav-og-data.md`
Branch: `claude/T9-plan`
Resultat: FEEDBACK
Runde: 3+

## Oprydnings-sektion-tjek

OK. Planen indeholder konkret sektion `Oprydnings- og opdaterings-strategi` med arkivering, dokumentopdateringer, grep-tjek og ansvar.

## Fund

### [KRITISK] Future-dated changes kan stadig apply'es for tidligt via `pending_change_apply`

Konkret afvigelse: V5's V4-arkitektur afhænger af, at apply først sker når både `undo_deadline <= now()` og `effective_from <= current_date` er sandt. Planen siger det korrekt i Beslutning 13/15 (`docs/coordination/T9-plan.md:196`, `docs/coordination/T9-plan.md:200`, `docs/coordination/T9-plan.md:204`, `docs/coordination/T9-plan.md:222`, `docs/coordination/T9-plan.md:224`).

Men selve apply-grænsen er stadig ikke entydigt placeret i den funktionelle kontrakt:

- Beslutning 7 beskriver cron som `status='approved' AND undo_deadline <= now()` uden `effective_from <= current_date` (`docs/coordination/T9-plan.md:132`).
- Valg 8's cron-kontrakt gentager samme filter uden `effective_from <= current_date` (`docs/coordination/T9-plan.md:434`).
- `pending_change_apply(p_change_id)` beskrives som en manuel/admin apply-vej der "flytter approved→applied; kalder intern handler", uden krav om at funktionen selv afviser future-dated rows (`docs/coordination/T9-plan.md:346`).
- Planen siger eksplicit, at mutation sker via cron eller manuel `pending_change_apply` (`docs/coordination/T9-plan.md:315`, `docs/coordination/T9-plan.md:160`), og Step 8-testen bruger direkte `pending_change_apply` for at undgå cron-ventetid (`docs/coordination/T9-plan.md:727`).

Det betyder, at selv hvis cron-jobbet implementeres med korrekt filter, kan den manuelle/admin apply-vej stadig materialisere future-dated org-versioner/placements før deres gældende dato, medmindre `pending_change_apply` selv håndhæver samme due-check. Det genskaber præcis den temporal production-risk V3/V4 skulle lukke: current reads kan se fremtidig organisationsstruktur eller placering, fordi apply-handlerne allerede har skrevet version/placement rows.

Anbefalet handling: V6-rettelse. Flyt invariantet ind i `pending_change_apply` som central gate, og lad cron kun vælge kandidater:

- `pending_change_apply` må kun apply'e rows hvor `status='approved' AND undo_deadline <= now() AND effective_from <= current_date`; ellers skal den returnere kontrolleret fejl/no-op uden state-mutation.
- Opdatér Beslutning 7, Valg 8 og Step 1, så alle apply-kontrakter bruger samme due-definition.
- Tilføj smoke-test for direkte manuel/admin `pending_change_apply` på future-dated pending_change: status forbliver `approved`, `applied_at` forbliver NULL, og ingen org_node_versions/placements ændres.
- Behold cron-filteret som performance/selection-filter, men dokumentér at det ikke er eneste sikkerhedsgrænse.
