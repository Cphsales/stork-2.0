# Codex review — gov-4-branch-protection runde 3

**Pakke:** gov-4-branch-protection
**Fase:** plan
**Plan-fil:** docs/coordination/gov-4-branch-protection-plan.md
**Plan-SHA:** 5e7460c
**Dato:** 2026-06-10
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-4-branch-protection-plan.md 3 --xhigh --phase=plan` (re-run via samme args inkl. flags)

---

[KRITISK] CODEOWNERS-fix er ikke pin’et/provet som code-owner-gate

Konkret afvigelse: Planen siger `@Cphsales` → “Mathias’ personlige bruger (den gh-auth’ede User-konto)”, men implementationsrækkefølgen skifter først `gh auth` til bot og laver derefter CODEOWNERS-fix. Den faktiske Mathias-bruger er ikke skrevet som eksakt ny CODEOWNERS-body. Verificeret nu: `gh api user` = `copenhagensales` (User/admin), og GitHubs CODEOWNERS-error endpoint viser 5 “Unknown owner” på nuværende `@Cphsales`. Planens test (PR uden approval blokeret / med Mathias approval mergeable) beviser required approval, men ikke særskilt at CODEOWNERS er gyldig og kræver Mathias som code owner.

Anbefalet handling: V4-rettelse. Pin alle 5 aktive CODEOWNERS-linjer eksplicit til det verificerede Mathias-handle, fx `@copenhagensales`, eller gør handle til et Mathias-qwerg-spørgsmål før build. Tilføj verifikation: `gh api repos/Cphsales/stork-2.0/codeowners/errors` skal returnere `errors: []` efter CODEOWNERS-PR, før `require_code_owner_reviews=true` aktiveres.

§8.1-SVAR: INGEN-MODSIGELSE
