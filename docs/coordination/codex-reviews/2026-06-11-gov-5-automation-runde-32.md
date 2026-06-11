# Codex review — gov-5-automation runde 32

**Pakke:** gov-5-automation
**Fase:** build
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** 213b840
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 32 --xhigh --phase=build` (re-run via samme args inkl. flags)

---

[KRITISK] Build-start kan ikke se gyldig Codex-APPROVAL  
Konkret afvigelse: `nyesteLeveranceSha()` i `scripts/kaede/tilstand.mjs:412` matcher `Plan-SHA:` råt, men reviewfilerne har `**Plan-SHA:** 1d727fe`. På aktuel state giver læseren `codexApprovalSha: null`, så `build-start` blokeres selv efter runde 30 APPROVAL. Samme funktion bruger desuden usorteret `kandidater.at(-1)`, som i aktuel filorden peger på runde 7 frem for runde 30.  
Anbefalet handling: V22-rettelse.

[KRITISK] Type-inferens reaktiverer historiske review-filer  
Konkret afvigelse: `infererType()` gør alle `docs/coordination/codex-reviews/*.md` til live `review-feedback`/`review-approval` uden pakke-/baseline-filter. Uden dispatch-log producerer `decide()` DISPATCH for gamle `aktiv`, `gov-4` og gov-5 runder samt hash-post for eksisterende krav-dok. Kommentaren siger baseline-seeding kræves, men der er ingen implementeret seedning.  
Anbefalet handling: V22-rettelse.

[MELLEM] Pakke-status matcher ikke faktisk review-state  
Konkret afvigelse: `gov-5-automation-status.md:3` siger “Codex runde 32 dispatchet”, men `:4` siger “Codex runde 31-verdikt …”. Det bryder status som aktuel state-dump og gentager den stale-klasse planen selv siger skal være synket.  
Anbefalet handling: G-nummer eller V22-statusrettelse.

Verificeret: `pnpm kaede:selftest` og `pnpm governance:check` er grønne, men de dækker ikke ovenstående aktuelle-state cases.

§8.1-SVAR: INGEN-MODSIGELSE
