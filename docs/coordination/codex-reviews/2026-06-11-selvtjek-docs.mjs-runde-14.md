# Codex review — selvtjek-docs.mjs runde 14

**Pakke:** selvtjek-docs.mjs
**Fase:** build
**Plan-fil:** scripts/selvtjek-docs.mjs
**Plan-SHA:** 385483c
**Dato:** 2026-06-11
**Reasoning:** medium
**Max ord:** 150
**Command:** `scripts/codex-review.sh scripts/selvtjek-docs.mjs 14 --quick --phase=build` (re-run via samme args inkl. flags)

---

[KOSMETISK] Slutbesked overdriver fund uden for diff

Konkret afvigelse: `scripts/selvtjek-docs.mjs` tæller `hits.length > 0` som “forekomster UDEN FOR diffen”, selv når token kun findes i den ændrede diff-fil. Repro: en ny linje med `PR #123` i `docs/a.md` giver “1 token(s) har forekomster UDEN FOR diffen”, selv om eneste hit er `docs/a.md:2 (fil er i diffen)`.

Anbefalet handling: kosmetisk note / evt. G-nummer: ret tælling/tekst til “forekomster i aktive docs” eller beregn faktisk uden-for-diff-hit før den afsluttende advarsel.
