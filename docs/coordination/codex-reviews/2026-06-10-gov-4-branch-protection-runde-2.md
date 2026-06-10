# Codex review — gov-4-branch-protection runde 2

**Pakke:** gov-4-branch-protection
**Fase:** plan
**Plan-fil:** docs/coordination/gov-4-branch-protection-plan.md
**Plan-SHA:** c57228e
**Dato:** 2026-06-10
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-4-branch-protection-plan.md 2 --xhigh --phase=plan` (re-run via samme args inkl. flags)

---

[KRITISK] DB-state-dump er forkert markeret N/A  
Konkret afvigelse: Planen har 1 G061-migration med `comment on constraint/table`, men siger §3.2 DB-dump N/A “ingen DB-objekter”. Det er en DB-mutation og kræver frisk rå dump af de to live-mål + nuværende comments.  
Anbefalet handling: V3-rettelse

[KRITISK] Required status-check API-kald sender boolean som string  
Konkret afvigelse: Planens `gh api ... required_status_checks` bruger `-f strict=true`; `gh api -f` er raw string, mens GitHub forventer boolean. Step 3 kan dermed fejle og ikke levere required CI-gaten.  
Anbefalet handling: V3-rettelse: brug `-F strict=true` eller JSON `--input`.

§8.1-SVAR: INGEN-MODSIGELSE
