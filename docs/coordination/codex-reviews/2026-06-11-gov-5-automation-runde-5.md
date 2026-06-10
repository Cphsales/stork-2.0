# Codex review — gov-5-automation runde 5

**Pakke:** gov-5-automation
**Fase:** plan
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** 1d9f258
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 5 --xhigh --phase=plan` (re-run via samme args inkl. flags)

---

[KRITISK] 13a-dump mangler før qwerg  
Konkret afvigelse: Planen kræver selv rå branch-protection JSON i planen før godkendelse, og status markerer 13a som blocker. V5 indeholder stadig ikke dump/diff/bevarelsesliste.  
Anbefalet handling: V6-rettelse.

[MANGLENDE-EKSISTERENDE-BEVARELSE] P3 fjerner Mathias-gate fra governance-owned docs  
Konkret afvigelse: Nuværende `* @mgrubak` beskytter alle filer. P3 fjerner defaulten og siger samtidig, at “governance-docs” bevarer gate, men `docs/teknisk/teknisk-gaeld.md`, `huskeliste.md`, `permission-matrix.md` og `cutover-checklist.md` har `governance-owns` og dækkes ikke af den nye CODEOWNERS-liste.  
Anbefalet handling: V6-rettelse: tilføj eksplicitte owner-linjer eller skriv en Mathias-godkendt begrundelse for at disse mister gate.

[MELLEM] Status/plan beskriver krav-prefix som manglende, men det er allerede rettet  
Konkret afvigelse: Krav-doc har nu `> Denne pakke leverer:`, mens plan og status stadig kalder det åbent/blocker. Det gør state-dump/kontekst misvisende før qwerg.  
Anbefalet handling: V6-rettelse.

§8.1-SVAR: INGEN-MODSIGELSE
