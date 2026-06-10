# Codex review — gov-5-automation runde 12

**Pakke:** gov-5-automation
**Fase:** build
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** 535b7f3
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 12 --xhigh --phase=build` (re-run via samme args inkl. flags)

---

FEEDBACK — Runde 12

[KRITISK] Fund-gate pauser stadig ikke sporet  
Konkret afvigelse: `FUND-GATE` oprettes, men `decide()` fortsætter til andre leverancer/events ([dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:75), [dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:119)). `udfoer()` logger kun handlingen og stopper ikke ([dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:216)). Repro gav `FUND-GATE` plus 3 `DISPATCH`.  
Anbefalet handling: V13-rettelse.

[KRITISK] Tracked leverance-bærer kan dispatches uden transport-commit  
Konkret afvigelse: `laesTilstand()` markerer kun `??` som transportkrævende ([tilstand.mjs](/home/mathias/stork-2.0/scripts/kaede/tilstand.mjs:186)), men status-filen er eksplicit leverance-bærer og er normalt tracked ([tilstand.mjs](/home/mathias/stork-2.0/scripts/kaede/tilstand.mjs:193)). En modified tracked status-fil læses fra worktree, får gammel `filSha`, og dispatches uden ordret commit/frossen artefakt-SHA.  
Anbefalet handling: V13-rettelse.

[KRITISK] “Parallel” dispatch eksekveres serielt  
Konkret afvigelse: planen kræver multi-kørsel med lås pr. aktør/spor og Code+Codex parallelt ved `krav-dok-merged`, men `udfoer()` bruger blocking `spawnSync` pr. `DISPATCH` ([dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:181)). Hvis Code kører længe eller stopper, starter Codex ikke parallelt. Selftesten dækker kun at to handlinger besluttes, ikke at de køres parallelt.  
Anbefalet handling: V13-rettelse.

Verifikation: `pnpm kaede:selftest`, `pnpm format:check`, `pnpm lint`, `pnpm governance:check` grønne.

§8.1-SVAR: INGEN-MODSIGELSE
