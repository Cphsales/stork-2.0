# Codex review — gov-5-automation runde 11

**Pakke:** gov-5-automation
**Fase:** build
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** 60ff899
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 11 --xhigh --phase=build` (re-run via samme args inkl. flags)

---

FEEDBACK — Runde 11

[KRITISK] Fund-gate stopper stadig ikke sporet  
Konkret afvigelse: `decide()` laver `FUND-GATE`, men fortsætter derefter til andre leverancer/events ([dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:75), [dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:119)). `udfoer()` logger kun `FUND-GATE` uden pause/stop ([dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:218)). Fixture med `NEEDS-MATHIAS` + anden leverance + event gav `FUND-GATE` plus 3 `DISPATCH`.  
Anbefalet handling: V12-rettelse.

[KRITISK] Event-idempotens kan droppe én aktørs kørsel  
Konkret afvigelse: `krav-dok-merged` dispatcher både Code og Codex, men behandlet-nøglen er kun `event:<type>@<sha>` ([kaede-regler.json](/home/mathias/stork-2.0/scripts/kaede/kaede-regler.json:32), [dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:121), [dirigent.mjs](/home/mathias/stork-2.0/scripts/kaede/dirigent.mjs:235)). Hvis Code-kørslen lykkes og Codex fejler før genstart, er hele eventet markeret behandlet, så Codex research springes over.  
Anbefalet handling: V12-rettelse.

Verifikation: `pnpm kaede:selftest`, `pnpm format:check`, `pnpm lint`, `pnpm governance:check` grønne. `git diff --check` fejler på trailing whitespace i committede review-artefakter, men det er ikke det stoppende fund her.

§8.1-SVAR: INGEN-MODSIGELSE
