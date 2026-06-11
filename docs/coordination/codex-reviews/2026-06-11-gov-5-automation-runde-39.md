# Codex review — gov-5-automation runde 39

**Pakke:** gov-5-automation
**Fase:** build
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** a9cb592
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 39 --xhigh --phase=build` (re-run via samme args inkl. flags)

---

[KRITISK] Preflight kan baseline-seede efter fejlede værtskrav  
Konkret afvigelse: `scripts/kaede/preflight.sh:11-18` kan sætte `FEJL=1`, men `scripts/kaede/preflight.sh:21-24` kører stadig `dirigent.mjs --baseline` før stop ved `:27-30`. Step 10 er “verificér-før-tillid”, og baseline-loggen er live-guardens trust anchor. Ved fx manglende `kaede_issue` kan preflight fejle, men stadig skrive en dispatch-log, som næste successfulde start derefter stoler på uden frisk baseline.  
Anbefalet handling: [V40-rettelse] Stop før baseline hvis nogen værts-tjek fejler; kør baseline først efter alle pre-baseline krav er grønne, og lad baseline-fejl tælle som preflight-fejl uden at efterlade delvist betroet state.

Verificeret: `pnpm kaede:selftest`, `scripts/codex-review.sh --parse-test`, `pnpm governance:check`, `git diff --check`, CODEOWNERS-errors tomme for branch/main; PR #125 er stadig `BLOCKED` uden reviews trods grøn CI.

§8.1-SVAR: INGEN-MODSIGELSE
