# Codex review — gov-5-automation runde 1

**Pakke:** gov-5-automation
**Fase:** plan
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** 4fe0e65
**Dato:** 2026-06-10
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 1 --xhigh --phase=plan` (re-run via samme args inkl. flags)

---

[KRITISK] CODEOWNERS-undtagelserne er ikke bevist leverbare  
Konkret afvigelse: `gov-5-automation-plan.md:112-122` bygger krav 2/3 på “ejer-løse” CODEOWNERS-linjer efter `* @mgrubak`. Planen dokumenterer ikke, at GitHub accepterer pattern-only linjer som en override; hvis de ignoreres, forbliver Mathias code-owner på bogførings-stierne, og “klik kun på beslutninger” leveres ikke.  
Anbefalet handling: V2-rettelse.

[KRITISK] Branch-protection ændres uden current-state dump og eksakt diff  
Konkret afvigelse: `gov-5-automation-plan.md:91` siger “verificeres + justeres”, men planen har ingen rå GitHub protection-state, ingen `codeowners/errors`-state for den nye branch, ingen præcis patch og ingen bevarelsesliste for required CI/code-owner-review/dismiss-stale. Det er en gate-flade, ikke almindelig opsætning.  
Anbefalet handling: V2-rettelse.

[MELLEM] Disciplinens “Forudsætninger” efterlades stale  
Konkret afvigelse: `gov-5-automation-plan.md:147` siger `Codex-runner + auto-merge + plan-branch-trigger (gov-5)` bliver gjort via P1/P2, men patch-først dækker kun disciplin §2-note og §6.2. Faktisk eksisterende tekst i `disciplin.md:476-482` bliver ikke patch’et, selv om gov-5 gør den forældet.  
Anbefalet handling: V2-rettelse.

§8.1-SVAR: INGEN-MODSIGELSE
