# Codex review — selvtjek-docs.mjs runde 13

**Pakke:** selvtjek-docs.mjs
**Fase:** build
**Plan-fil:** scripts/selvtjek-docs.mjs
**Plan-SHA:** 48766ed
**Dato:** 2026-06-11
**Reasoning:** medium
**Max ord:** 150
**Command:** `scripts/codex-review.sh scripts/selvtjek-docs.mjs 13 --quick --phase=build` (re-run via samme args inkl. flags)

---

[KRITISK] Formålet lover runde-numre, men de udtrækkes ikke

Konkret afvigelse: `scripts/selvtjek-docs.mjs` beskriver formålet som fakta-token-grep for “runde-/PR-numre, hashes, tal-fraser”, men `KLASSER` dækker kun `PR #\d+`, kort-hash, `\d+ review-runder`, selftest-tal og pakke-ankre. En ændret linje med fx “runde 46” eller “Runde 13” giver derfor ingen søskende-søgning, selv om runde-numre er nævnt i formålet og netop er driftfølsomme i status-/rapportdocs.

Anbefalet handling: V14-rettelse: genindfør en afgrænset runde-tokenklasse, eller ret formåls/headerteksten til eksplicit at afgrænse plain runde-numre fra pakken med begrundelse.
