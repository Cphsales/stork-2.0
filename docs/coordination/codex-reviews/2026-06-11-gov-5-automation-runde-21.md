# Codex review — gov-5-automation runde 21

**Pakke:** gov-5-automation
**Fase:** plan
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** 0132a44
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 21 --xhigh --phase=plan` (re-run via samme args inkl. flags)

---

[KRITISK] `qwers`-åbning er stadig ikke et faktisk end-to-end startpunkt

Konkret afvigelse: Planen siger at kæden starter ved `qwers` fra åbning, men eksisterende state-reader blokerer det stadig: `kaede_issue` er `null` i `scripts/kaede/kaede-regler.json`, så `gateOrd` læses ikke; og `laesTilstand()` kalder kun `afledEvents()` når aktiv pakke ikke er `ingen`. Derudover returnerer `afledEvents()` straks ved `pakke === "ingen"`. P7(b) patcher ikke disse guards og selftesten bevarer endda “ingen aktiv pakke → ingen events”. Resultat: en ny pakke kan ikke starte automatisk “fra åbning”, som krav 1/formålet kræver.

Anbefalet handling: V13-rettelse. Patch-først for `kaede-regler.json`, `laesTilstand()` og `afledEvents()` omkring `kaede_issue`, aktiv-pakke-guard og `qwers`-parsing. Definér den stående åbningsflade eksplicit, og tilføj selftest for `aktiv-pakke: ingen` + author-verificeret `qwers <pakke>` → recon-dispatches.

§8.1-SVAR: INGEN-MODSIGELSE
