# Codex review — gov-docs-renhed runde 2

**Pakke:** gov-docs-renhed
**Fase:** plan
**Plan-fil:** docs/coordination/gov-docs-renhed-plan.md
**Plan-SHA:** 28e0010 (V2)
**Dato:** 2026-06-10
**Reasoning:** xhigh
**Dispatch:** manuel `codex exec < /dev/null`

---

[KRITISK] `codex-review.sh` kan overse KRITISK efter nyt §10.4-format  
Konkret afvigelse: V2-prompten kræver `[SEVERITY]` (`gov-docs-renhed-plan.md:469`), men B.1 bevarer parseren der kun matcher `^KRITISK\b` (`scripts/codex-review.sh:224`). `[KRITISK] test` matcher ikke, så et stopfund kan ende med exit 0.  
Anbefalet handling: [V3-rettelse] Parser + selftest skal acceptere `^\[KRITISK\]` og øvrige bracketede stopmarkører.

[MELLEM] State-dump er stadig stale for V2-committen  
Konkret afvigelse: Planen verificerer `main @ 1278e92` og V1 `df4105d`, men aktuel V2 er `28e0010`; `git archive 28e0010` giver governance-check grøn med **22 docs, 6 scripts**, ikke tabellens 21 docs.  
Anbefalet handling: [G-nummer]

[MELLEM] Kæde-tjek dækker stadig ikke hele pkt. 10  
Konkret afvigelse: B.3 kræver status-filens eksistens, men ingen status-krydspegning. I `fase:rapport` fejler den ikke hvis rapporten mangler `> Denne pakke leverer:`-Formål-blokken, fordi den kun sammenligner når `fr` findes. B.4 mangler negative cases for begge.  
Anbefalet handling: [G-nummer]

[MELLEM] D4-løftet efterlader master-plan-modsigelse  
Konkret afvigelse: A.1 lukker den direkte vision-banner-modsigelse reelt, men `docs/strategi/stork-2-0-master-plan.md:40` kalder stadig forretningsforståelse “tanke-data” og siger at vision vinder over den.  
Anbefalet handling: [G-nummer]

§8.1-SVAR: MODSIGELSE — master-planens dokumenthierarki modsiger D4/forretningsforståelse som LÅST stamme-doc.
