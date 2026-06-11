# Codex review — selvtjek-docs.mjs runde 15

**Pakke:** selvtjek-docs.mjs
**Fase:** build
**Plan-fil:** scripts/selvtjek-docs.mjs
**Plan-SHA:** ffe82f7
**Dato:** 2026-06-11
**Reasoning:** medium
**Max ord:** 150
**Command:** `scripts/codex-review.sh scripts/selvtjek-docs.mjs 15 --quick --phase=build` (re-run via samme args inkl. flags)

---

[KRITISK] Selvtjekket er ikke koblet før Codex-dispatch

Konkret afvigelse: `scripts/selvtjek-docs.mjs`’ formål er “Mekanisk konsistens-grep FØR Codex-dispatch på docs-ændringer”, men diffen tilføjer kun standalone-scriptet. `scripts/codex-review.sh` kalder det ikke før prompt/dispatch, `kaede-regler.json` har ingen `selvtjek-docs`/fakta-token-tjek i leverance-typerne, og `package.json` eksponerer ingen script-gate. Dermed er leverancen ikke end-to-end realiseret: den kan køres manuelt, men fanger intet “FØR Codex-dispatch” i faktisk flow.

Anbefalet handling: V16-rettelse: kobl scriptet ind i Codex-dispatch-vejen for docs-ændringer eller afgræns formålet eksplicit til manuelt advisory-værktøj.
