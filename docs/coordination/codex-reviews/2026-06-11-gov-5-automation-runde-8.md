# Codex review — gov-5-automation runde 8

**Pakke:** gov-5-automation
**Fase:** build
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** 37469f1
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 8 --xhigh --phase=build` (re-run via samme args inkl. flags)

---

[KRITISK] Dispatch-fejl markeres som behandlet og fortsætter  
Konkret afvigelse: [dirigent.mjs:166](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:166) logger `DISPATCH` før adapteren er kørt, [dirigent.mjs:186](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:186) ignorerer nonzero exit, og [dirigent.mjs:202](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:202) tæller enhver `DISPATCH` som behandlet. En fejlet Code/Codex/Claude-kørsel kan derfor droppes permanent og kæden kan fortsætte uden reel validering.  
Anbefalet handling: V9-rettelse før B2.

[KRITISK] Faktisk state-reader leverer ikke de felter flowet tester på  
Konkret afvigelse: [tilstand.mjs:111](/home/mathias/stork-2.0/scripts/kaede/tilstand.mjs:111) scanner kun `codex-reviews`/`plan-feedback`, sætter ingen leverance-`sha`, infererer ingen `type`, og returnerer ingen `events`; [dirigent.mjs:229](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:229) kalder heller ikke med `kaedeIssue`. Selftesten beviser kun syntetiske `sha`/`events`; reelt kan plan/build/slut-rapport/gate-ord ikke bære end-to-end-sporet eller frossen-version-idempotens.  
Anbefalet handling: V9-rettelse før B2.

Verifikation: `pnpm kaede:selftest` grøn; `pnpm kaede:dry-run` kunne ikke verificeres i read-only sandbox, fordi `git fetch` skriver `.git/FETCH_HEAD`.

§8.1-SVAR: INGEN-MODSIGELSE
