# Codex review — gov-5-automation runde 14

**Pakke:** gov-5-automation
**Fase:** build
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** 5da496d
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 14 --xhigh --phase=build` (re-run via samme args inkl. flags)

---

FEEDBACK — Runde 14

[KRITISK] Fund-gate pauser stadig ikke sporet  
Konkret afvigelse: `decide()` laver `FUND-GATE`, men fortsætter til andre leverancer og events ([dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:82), [dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:126)). Repro med `NEEDS-MATHIAS` + anden leverance + `build-pr-merged` gav `FUND-GATE` + to `DISPATCH`. `udfoer()` logger stadig kun handlingen; ingen pause/stop/Mathias-dispatch sker ([dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:235)). Det bryder krav 2/4 og planens “fund-gate + spor-pause”.  
Anbefalet handling: V15-rettelse.

[KRITISK] Transport-commit kan opsamle fremmede staged ændringer  
Konkret afvigelse: `transportCommit()` kører `git add <fil>` og derefter almindelig `git commit` ([dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:160)). Hvis index allerede indeholder staged ændringer, committes de sammen med aktør-leverancen. Det bryder planens krav om ordret transport-commit og genåbner commit-ansvarsrisikoen.  
Anbefalet handling: V15-rettelse.

§8.1-SVAR: INGEN-MODSIGELSE
