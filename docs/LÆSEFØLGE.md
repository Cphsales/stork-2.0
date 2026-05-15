# Læsefølge

Skal læses ved hver af følgende triggere:

- Ny session/chat starter
- Ny plan-runde starter (planlægning)
- Codex-review-runde starter
- Implementation starter (efter Mathias-godkendelse)
- Slut-rapport skrives

Begrundelse: andre aktører kan have committet siden sidst.
Stale repo-state = fabrikation af kontekst.

Procedure:

0. `git pull origin main`
   Verificér at lokal arbejds-kopi matcher repo HEAD. Stop hvis
   `git status` viser uventede uncommitted changes. Stop hvis pull
   viser commits der ikke var forventede — rapportér til Mathias.

1. `docs/strategi/vision-og-principper.md`
   Hvad vi bygger og hvorfor (formål-niveau).

2. `docs/strategi/stork-2-0-master-plan.md`
   Autoritativ teknisk plan.

3. `docs/strategi/arbejds-disciplin.md`
   Hvordan vi arbejder (disciplin-pakke, formåls-immutabilitet,
   Codex-scope, git-sync-disciplin).

4. `docs/coordination/mathias-afgoerelser.md`
   Låste afgørelser. Overskygger fortolkning af 1-3 ved konflikt.

5. `docs/coordination/aktiv-plan.md`
   Peger på nuværende plan-arbejde.

6. `docs/coordination/seneste-rapport.md`
   Sidste leverance-state.

Stop ved tvivl. Spørg Mathias hvis 1-6 modsiger hinanden.
