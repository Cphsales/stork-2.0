# Codex review — gov-5-automation runde 10

**Pakke:** gov-5-automation
**Fase:** build
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** 0c7ab7f
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 10 --xhigh --phase=build` (re-run via samme args inkl. flags)

---

[KRITISK] Fund-gates pauser stadig ikke kæden  
Konkret afvigelse: `decide()` laver `FUND-GATE`, men fortsætter derefter til andre leverancer/events ([dirigent.mjs:73](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:73), [dirigent.mjs:117](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:117)). `udfoer()` logger `FUND-GATE` uden pause eller Mathias-dispatch ([dirigent.mjs:205](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:205)). Jeg verificerede med fixture: `NEEDS-MATHIAS` gav både `FUND-GATE` og efterfølgende `DISPATCH`.  
Anbefalet handling: V11-rettelse.

[KRITISK] Frossen version kan binde statusfil i stedet for faktisk leverance  
Konkret afvigelse: state-readeren scanner ikke `docs/coordination/*-plan.md`; den bruger aktiv statusfil som Code-leverance-bærer ([tilstand.mjs:182](/home/mathias/stork-2.0/scripts/kaede/tilstand.mjs:182), [tilstand.mjs:197](/home/mathias/stork-2.0/scripts/kaede/tilstand.mjs:197)). Dispatch-konteksten bliver derfor statusfilens SHA ([dirigent.mjs:108](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:108)), ikke nødvendigvis den plan/slut-rapport Codex skal validere. Det bryder planens frossen-version-spor for plan-V/build/slut-rapport.  
Anbefalet handling: V11-rettelse.

[KRITISK] Required formatter-gate fejler  
Konkret afvigelse: `pnpm format:check` fejler på de nye kæde-filer: `scripts/kaede/dirigent.mjs`, `scripts/kaede/dirigent.selftest.mjs`, `scripts/kaede/tilstand.mjs`. CI kører samme formatter-gate før merge.  
Anbefalet handling: V11-rettelse.

Verifikation: `pnpm kaede:selftest` grøn; `pnpm lint` grøn; `pnpm format:check` fejler.

§8.1-SVAR: INGEN-MODSIGELSE
