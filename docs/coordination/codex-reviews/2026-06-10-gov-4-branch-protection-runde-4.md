# Codex review — gov-4-branch-protection runde 4

**Pakke:** gov-4-branch-protection
**Fase:** plan
**Plan-fil:** docs/coordination/gov-4-branch-protection-plan.md
**Plan-SHA:** d13b123
**Dato:** 2026-06-10
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-4-branch-protection-plan.md 4 --xhigh --phase=plan` (re-run via samme args inkl. flags)

---

[KRITISK] ADMIN-HANDLE kan stadig resolve til bot efter auth-skift

Konkret afvigelse: V4 definerer CODEOWNERS-owner som output af `gh api user --jq .login` på Codes maskine, men implementationsrækkefølgen skifter først `gh auth` til bot og laver derefter CODEOWNERS-fix. `codeowners/errors == []` beviser kun at owner er gyldig, ikke at owner er Mathias. Hvis handle evalueres efter auth-skift, kan CODEOWNERS pege på botten, og step 4 kan aktivere required code-owner-review mens H026 stadig er uløst/bricker approvals.

Anbefalet handling: V5-rettelse. Fang `ADMIN_HANDLE` under nuværende Mathias-admin-auth før bot-login; fang `BOT_LOGIN` efter bot-login; assert `ADMIN_HANDLE != BOT_LOGIN`; CODEOWNERS skal bruge `ADMIN_HANDLE`; tilføj gate efter merge: aktive CODEOWNERS-linjer indeholder `ADMIN_HANDLE` + `codeowners/errors == []` før `require_code_owner_reviews=true`.

§8.1-SVAR: INGEN-MODSIGELSE
