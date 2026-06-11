# Codex review — selvtjek-docs.mjs runde 12

**Pakke:** selvtjek-docs.mjs
**Fase:** build
**Plan-fil:** scripts/selvtjek-docs.mjs
**Plan-SHA:** 31ce24d
**Dato:** 2026-06-11
**Reasoning:** medium
**Max ord:** 150
**Command:** `scripts/codex-review.sh scripts/selvtjek-docs.mjs 12 --quick --phase=build` (re-run via samme args inkl. flags)

---

[KRITISK] Same-file stale forekomster skjules

Konkret afvigelse: `scripts/selvtjek-docs.mjs:89-99` filtrerer `eksterne` via `diffBerørt(h)`, men `diffBerørt` markerer hele filer som berørt hvis de indgår i diffen. Dermed skjules uændrede forekomster i samme aktive doc som den ændrede linje. Det modsiger formålet om at vise “ALLE forekomster” af fakta-token i aktive docs og kan netop misse stale søskende i fx `aktiv-plan.md`.

Anbefalet handling: V13-rettelse: filtrér kun den konkrete diff-added/changed forekomst, ikke hele filen. Brug fx parsed diff hunks med berørte linjenumre, eller vis alle hits og marker hvilke der ligger på diff-linjer.
