# Codex review — gov-5-automation runde 22

**Pakke:** gov-5-automation
**Fase:** plan
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** f5fcd94
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 22 --xhigh --phase=plan` (re-run via samme args inkl. flags)

---

[MANGLENDE-EKSISTERENDE-BEVARELSE] P7(b) ændrer `laesTilstand` uden patch-først  
Konkret afvigelse: Planen giver 1:1 body for `afledEvents`, men V13-tilføjelsen ændrer også `laesTilstand`-guarding og introducerer pr.-pakke `Kæde-issue:` fra statusfilen (`gov-5-automation-plan.md:348`). Den nuværende `laesTilstand`-body/gateOrd/event-blok er ikke citeret 1:1, og BEVARES-listen dækker ikke den eksisterende event-/gateOrd-semantik.  
Anbefalet handling: V14-rettelse.

[MELLEM] Pakke-status er stale mod faktisk reviewrunde  
Konkret afvigelse: `gov-5-automation-status.md:3` siger runde 22 dispatchet, men `:4` siger stadig “Næste forventet: Codex runde 20”. Samtidig siger plan-header `Branch: claude/gov-5-automation-plan`, mens faktisk branch er `claude/gov-5-automation-build`. Statusfilen er §3.5-kontekst og bør ikke pege to runder bagud.  
Anbefalet handling: V14-rettelse.

§8.1-SVAR: INGEN-MODSIGELSE
