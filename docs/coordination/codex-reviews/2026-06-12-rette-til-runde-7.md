# Codex review — rette-til runde 7

**Pakke:** rette-til
**Fase:** build
**Plan-fil:** docs/coordination/rette-til-plan.md
**Plan-SHA:** 0daf723
**Fil-hash (reviewet indhold):** 8c8bff4aeceb6083bd5c2c3e814d7572075ddb40
**Fil-tilstand:** ren
**Dato:** 2026-06-12
**Reasoning:** xhigh
**Model:** gpt-5.5
**Varighed:** 215s
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/rette-til-plan.md 7 --xhigh --phase=build` (re-run via samme args inkl. flags)

---

[KRITISK] Behandlet `qwers` kan stadig aktivere stale leverancer  
Konkret afvigelse: `tilstand.mjs:291-298` gør seneste `qwers gov-6` til globalt `pakke`-anker, og `dirigent.mjs:69-71` bruger det som `spor` før markørens `"ingen"`. Dermed blokerer stale-værnet i `dirigent.mjs:234-260` ikke længere gamle committede review-/leverancefiler, hvis åbningsordet allerede er behandlet. Jeg reproducerede det med `behandlede` for `qwers-aabning@c1`: eventet gen-dispatches ikke, men en gammel `review-feedback` dispatches stadig som `spor: "gov-6"`. Det bryder krav 11’s “allerede-behandlet åbnings-ord genfyrer ALDRIG” i praksis.  
Anbefalet handling: [V8-rettelse] Gør qwers-ankeret stateful: et behandlet stående qwers må ikke alene give pakke-spor til øvrige leverancer. Tilføj selftest for “behandlet qwers + marker ingen + stale committed review ⇒ ingen dispatch”.

Verificeret: `pnpm kaede:selftest` grøn; `pnpm governance:check` grøn.

§8.1-SVAR: INGEN-MODSIGELSE
