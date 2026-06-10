# Codex review — gov-5-automation runde 9

**Pakke:** gov-5-automation
**Fase:** build
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** 9399e21
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 9 --xhigh --phase=build` (re-run via samme args inkl. flags)

---

[KRITISK] Fund-gates pauser ikke kæden  
Konkret afvigelse: `decide()` laver `FUND-GATE` ved NEEDS-MATHIAS/ESCALATE/halt-markers, men fortsætter videre til andre leverancer/events, og `udfoer()` logger kun handlingen uden pause eller Mathias-dispatch ([dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:73), [dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:205)). Det bryder planens “fund-gate + spor-pause” og krav 2/4.  
Anbefalet handling: V10-rettelse før B2.

[KRITISK] Faktisk leverance-reader finder ikke plan/slut-rapport-fladen  
Konkret afvigelse: state-reader scanner kun `codex-reviews` og `plan-feedback` ([tilstand.mjs](/home/mathias/stork-2.0/scripts/kaede/tilstand.mjs:183)). Planen kræver routing af `plan-V<n> / build-batch / slut-rapport`, og P3-snittet omfatter `*-plan.md` + `rapport-historik`; de filer bliver ikke transporteret/routet af den faktiske læser.  
Anbefalet handling: V10-rettelse før B2.

[KRITISK] Gate-ord kan ikke læses fra issue  
Konkret afvigelse: `kaede-regler.json` har ingen `kaede_issue`, så `main()` kalder `laesTilstand` med `null`; selv hvis feltet tilføjes, er `--jq`-argumentet pakket med `JSON.stringify`, så filteret bliver en streng-literal og falder i `catch` til tom `gateOrd` ([dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:248), [tilstand.mjs](/home/mathias/stork-2.0/scripts/kaede/tilstand.mjs:205)). Dermed registreres `slut OK`/`stop` ikke end-to-end.  
Anbefalet handling: V10-rettelse før B2.

Verifikation: `pnpm kaede:selftest` grøn, men kun på syntetiske fixtures.

§8.1-SVAR: INGEN-MODSIGELSE
