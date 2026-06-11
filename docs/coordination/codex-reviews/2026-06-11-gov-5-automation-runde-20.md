# Codex review — gov-5-automation runde 20

**Pakke:** gov-5-automation
**Fase:** plan
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** 7c50ded
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 20 --xhigh --phase=plan` (re-run via samme args inkl. flags)

---

[MANGLENDE-EKSISTERENDE-BEVARELSE] `decide()`-ændringen mangler patch-først  
Konkret afvigelse: V11 kræver regelbogs-håndhævelse hvor `decide()` returnerer `BLOKERET` ved manglende betingelser for build-start, krav-dok-merge, slut-merge og recon-flow ([gov-5-automation-plan.md](/home/mathias/stork-2.0/docs/coordination/gov-5-automation-plan.md:189)). Men patch-først dækker kun `kaede-regler.json`, `afledEvents`, selftests og `BOGFOERING_RES` ([gov-5-automation-plan.md](/home/mathias/stork-2.0/docs/coordination/gov-5-automation-plan.md:291)); den eksisterende `scripts/kaede/dirigent.mjs:37-199` body er ikke gengivet 1:1 med diff. Enten implementeres betingelser uden §3.1-spor, eller også står krav-dok-/arkiv-unowning på tekst-pligt frem for mekanisk gate.  
Anbefalet handling: V12-rettelse — tilføj P7(e) for `scripts/kaede/dirigent.mjs:37-199` med nuværende body 1:1, eksplicit diff for `betingelser`/`BLOKERET`, og BEVARES-liste for gate-deadlock, event-idempotens, låse, halvskrevet-værn, fund-gates og ARV-IGNORERET.

§8.1-SVAR: INGEN-MODSIGELSE
