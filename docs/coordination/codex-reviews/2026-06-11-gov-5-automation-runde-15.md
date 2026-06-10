# Codex review — gov-5-automation runde 15

**Pakke:** gov-5-automation
**Fase:** build
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** 8d2d3f6
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 15 --xhigh --phase=build` (re-run via samme args inkl. flags)

---

[KRITISK] Åben Mathias-gate deadlocker godkendelse  
Konkret afvigelse: `decide()` returnerer `SPOR-PAUSET` før gate-ord behandles ([dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:51)). En reproduktion med åben gate + `GODKENDT` fra `mgrubak` gav kun `SPOR-PAUSET`; `GODKENDT`/`AFVIST` har heller ingen event-routing ([tilstand.mjs](/home/mathias/stork-2.0/scripts/kaede/tilstand.mjs:100), [kaede-regler.json](/home/mathias/stork-2.0/scripts/kaede/kaede-regler.json:31)). Dermed kan et fund-gate-spor ikke genoptages automatisk.  
Anbefalet handling: V16-rettelse.

[KRITISK] Transport-commit kan tage uafsluttet aktør-output  
Konkret afvigelse: untracked leverancer transport-committes før låse vurderes ([dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:71), [dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:127)). Repro med aktiv `code`-lås på samme spor + untracked status-fil gav `TRANSPORT-COMMIT`, ikke `VENT`. Ved lange adapter-kørsler kan kuréren derfor committe en halvskrevet leverance, før exit 0 har bevist at aktøren er færdig.  
Anbefalet handling: V16-rettelse.

Verificeret: `pnpm kaede:selftest`, `pnpm -s format:check`, `pnpm -s governance:check` grønne.

§8.1-SVAR: INGEN-MODSIGELSE
