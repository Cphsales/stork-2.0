# Codex review — selvtjek-docs.mjs runde 16

**Pakke:** selvtjek-docs.mjs
**Fase:** build
**Plan-fil:** scripts/selvtjek-docs.mjs
**Plan-SHA:** 939e458
**Dato:** 2026-06-11
**Reasoning:** medium
**Max ord:** 150
**Command:** `scripts/codex-review.sh scripts/selvtjek-docs.mjs 16 --quick --phase=build` (re-run via samme args inkl. flags)

---

[KRITISK] Stale søskende med gammel værdi fanges ikke  
Konkret afvigelse: Formålet i `scripts/selvtjek-docs.mjs:8-16` er at finde stale fakta i søskende-docs. Implementationen udtrækker kun nye tokens fra diffen og søger derefter eksakt samme token (`scripts/selvtjek-docs.mjs:56-59`, `91-95`). Hvis én doc ændres fra `42 review-runder` til `43 review-runder`, mens en søskende stadig siger `42 review-runder`, søger scriptet kun efter `43 review-runder` og finder ikke den stale `42`-forekomst. Det leverer derfor ikke den drift-klasse, formålet beskriver.  
Anbefalet handling: V17-rettelse. Søg pr. token-klasse/kontekst eller sammenlign fjernede og tilføjede fakta-par, så gamle søskendeværdier også rapporteres.
