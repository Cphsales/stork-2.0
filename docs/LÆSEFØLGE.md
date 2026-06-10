# Læsefølge

<!-- governance-owns: laeseflade-nav -->

Skal læses ved hver af følgende triggere:

- Ny session/chat starter
- Ny plan-runde starter (planlægning)
- Codex-review-runde starter
- Implementation starter (efter Mathias-godkendelse)
- Slut-rapport skrives

Begrundelse: andre aktører kan have committet siden sidst.
Stale repo-state = fabrikation af kontekst.

Procedure:

0. Branch-bevidst git-sync (disciplin §13): `git fetch` + verificér
   branch/base/remote + pull den branch arbejdet sker på.
   Stop hvis `git status` viser uventede uncommitted changes. Stop hvis
   sync viser commits der ikke var forventede — rapportér til Mathias.

1. `docs/strategi/vision-og-principper.md`
   Vision og 9 principper. **LÅST-AUTORITATIV** — vinder over alt andet ved konflikt.

2. `docs/strategi/forretningsforstaaelse.md`
   Mathias' tanker om hvad systemet skal kunne på forretnings-niveau.
   **LÅST-AUTORITATIV** — stamme-doc med vision (D4). Opdateres når
   Mathias' tanker udvikler sig, via PR + CODEOWNERS.

3. `docs/strategi/disciplin.md`
   Hvordan vi arbejder sammen (V5): aktører + roller + workflow + gates +
   disciplin + skabeloner. **Eneste rolle-hjem** — læs §9.X for din egen rolle.

4. `docs/strategi/stork-2-0-master-plan.md`
   **OVERBLIK** — autoritativ teknisk plan + status pr. trin (§4.1) + action-items (§4.2).
   Rettes til sidst i hver pakke. Konsulteres for kontekst, men er ikke kilde i pakke-arbejde.

5. `docs/coordination/aktiv-plan.md`
   Peger på nuværende plan-arbejde + pakke-status.

6. `docs/coordination/seneste-rapport.md`
   Sidste leverance-state.

Stop ved tvivl. Spørg Mathias hvis 1-6 modsiger hinanden.
Ved konflikt mellem dokumenter: vision (1) vinder over alle andre — undtagen
forretningsforstaaelse (2): modsigelse mellem de to stamme-docs er et hul →
STOP → Mathias lukker (D4).
