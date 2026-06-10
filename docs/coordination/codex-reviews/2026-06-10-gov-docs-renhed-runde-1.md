# Codex review — gov-docs-renhed runde 1

**Pakke:** gov-docs-renhed
**Fase:** plan
**Plan-fil:** docs/coordination/gov-docs-renhed-plan.md
**Plan-SHA:** df4105d
**Dato:** 2026-06-10
**Reasoning:** xhigh
**Dispatch:** manuel `codex exec` (codex-review.sh er død på prefix-fil — denne pakkes pkt 1)

---

[KRITISK] Vision-banner efterlades i modstrid med D4  
Konkret afvigelse: Planen siger “vision uberørt”, men `vision-og-principper.md` siger stadig at vision vinder over “andre dokumenter”. Samtidig vil V2 gøre forretningsforståelse LÅST og “ingen trumf” ved vision↔forretningsforståelse-konflikt.  
Anbefalet handling: [V2-rettelse] Patch vision-banneret eksplicit eller stop med Mathias-afgørelse.

[KRITISK] Patch-først er ikke opfyldt  
Konkret afvigelse: Planen giver snippets/tabel-diff, men ikke eksisterende body 1:1 pr. ændret script/doc. Det gør bevarelse af gates/kommentarer ikke reviewbar, især for `codex-review.sh`, `governance-check.mjs`, selftest og doc-skabeloner.  
Anbefalet handling: [V2-rettelse] Tilføj 1:1 body/appendiks + diff pr. ændret fil/script.

[MELLEM] Repo-state-dump matcher ikke faktisk state  
Konkret afvigelse: Planen siger `main @ 1278e92` og `19 docs`; verificeret `origin/main @ 1278e92` giver 18 docs, planbranch HEAD er `df4105d` og working tree-check giver 21 docs.  
Anbefalet handling: [V2-rettelse] Erstat med præcis dump pr. branch/hash og kommando-output.

[MELLEM] Kæde-tjek/selftests beviser ikke hele krav pkt. 10  
Konkret afvigelse: Cases dækker manglende plan og formåls-mismatch krav↔plan, men ikke `fase: rapport`, manglende/mismatchende slut-rapport eller status-krydspegning.  
Anbefalet handling: [V2-rettelse] Tilføj negative cases for rapport-missing, rapport-formål-mismatch og status/aktiv-plan mismatch.

[MELLEM] `disciplin.md §10.4` bliver stale kanonisk prompt  
Konkret afvigelse: `codex-review.sh` skal generere prompt fra §10.4, men planen patcher ikke §10.4, som stadig kalder forretningsforståelse “tanke-data, ikke kontrakt” og bruger gamle marker-termer.  
Anbefalet handling: [V2-rettelse]

§8.1-SVAR: MODSIGELSE — vision-bannerets trumfregel modsiger D4/planens nye forretningsforståelse-status.
