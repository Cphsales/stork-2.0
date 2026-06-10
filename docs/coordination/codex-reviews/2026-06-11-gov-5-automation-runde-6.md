# Codex review — gov-5-automation runde 6

**Pakke:** gov-5-automation
**Fase:** plan
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** 32a24e8
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 6 --xhigh --phase=plan` (re-run via samme args inkl. flags)

---

[MANGLENDE-EKSISTERENDE-BEVARELSE] P3 mister eksisterende Mathias-gate for aktive værn-/DB-flader  
Konkret afvigelse: P3 fjerner `* @mgrubak`, men gen-ejer kun bl.a. `/supabase/migrations/` og enkelte scripts. Dermed falder fx `supabase/config.toml`, `supabase/advisor-baseline.json`, `supabase/schema.sql`, `supabase/tests/**`, `scripts/migration-gate.mjs`, `scripts/run-db-tests.mjs`, `scripts/schema-check.sh`, `scripts/types-gen.sh` og selftests uden for CODEOWNERS, selv om planen selv siger at “al kode der rører penge/data” og “alle værn” beholder hans gate. Med 13b `required_approving_review_count=0` bliver de mergebare uden Mathias ved solo-ændringer. GitHub-docs bekræfter at code-owner-review kun blokerer filer med code owners, mens review-count 0 ikke kræver almindelige reviewers: https://docs.github.com/en/rest/branches/branch-protection  
Anbefalet handling: V7-rettelse — udvid P3 til `/supabase/` og relevante `/scripts/`/rod-build-konfigs, eller lav eksplicit inventory over alle tidligere default-ejede filer der bevidst frigives. 11b skal teste mindst én tidligere-default værnfil, fx `scripts/migration-gate.mjs` eller `supabase/config.toml`.

§8.1-SVAR: INGEN-MODSIGELSE
