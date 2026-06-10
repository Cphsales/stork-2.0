# Codex review — gov-5-automation runde 13

**Pakke:** gov-5-automation
**Fase:** build
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** a8cbce6
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 13 --xhigh --phase=build` (re-run via samme args inkl. flags)

---

FEEDBACK — Runde 13

[KRITISK] Fund-gate pauser stadig ikke sporet  
Konkret afvigelse: `FUND-GATE` oprettes, men `decide()` fortsætter til andre leverancer/events ([dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:77), [dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:119)). `udfoer()` logger kun handlingen uden pause/stop eller Mathias-dispatch ([dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:224)). Det bryder krav 2/4 og planens “fund-gate + spor-pause”.  
Anbefalet handling: V14-rettelse.

[KRITISK] Tracked leverance-bærer kan stadig dispatches uden transport-commit  
Konkret afvigelse: `laesTilstand()` markerer kun `??` som transportkrævende ([tilstand.mjs](/home/mathias/stork-2.0/scripts/kaede/tilstand.mjs:188)), men status-filen er tracked leverance-bærer. En modified tracked status-fil læses fra worktree, får gammel `filSha`, og kan dispatches med forkert frossen version ([tilstand.mjs](/home/mathias/stork-2.0/scripts/kaede/tilstand.mjs:232)).  
Anbefalet handling: V14-rettelse.

[KRITISK] `dirigent.mjs` er blevet binær i git-diff  
Konkret afvigelse: filen indeholder literal NUL som separator i kørende-nøglen ([dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:171), [dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:195)); `git diff --numstat main...HEAD -- scripts/kaede/dirigent.mjs` viser `- -`, og diffen er “Binary files differ”. Det bryder patch-først/reviewbarhed for en central værn-fil.  
Anbefalet handling: V14-rettelse.

§8.1-SVAR: INGEN-MODSIGELSE
