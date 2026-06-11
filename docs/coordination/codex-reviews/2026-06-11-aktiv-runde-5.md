# Codex review — aktiv runde 5

**Pakke:** aktiv
**Fase:** docs
**Plan-fil:** docs/coordination/aktiv-plan.md
**Plan-SHA:** 026880f
**Dato:** 2026-06-11
**Reasoning:** medium
**Max ord:** 150
**Command:** `scripts/codex-review.sh docs/coordination/aktiv-plan.md 5 --quick --phase=docs` (re-run via samme args inkl. flags)

---

[MELLEM] Future-dateret Mathias-beslutning  
Konkret afvigelse: Diffen skriver “Mathias-beslutning 2026-06-12” / “Mathias 2026-06-12”, men review-kontekst er 2026-06-11. Det er en stale/umulig tids-påstand i docs-state.  
Anbefalet handling: V6-rettelse.

[MELLEM] Ny kilde-pointer findes ikke i repo  
Konkret afvigelse: Diffen peger på `docs/coordination/gov-6-forslag-og-udskudte.md` som forslag-katalog, men filen findes ikke i checkout.  
Anbefalet handling: V6-rettelse eller G-nummer hvis kataloget bevidst ligger udenfor denne ændring.

§8.1-SVAR: MODSIGELSE — stale/kilde-påstande i aktiv docs-state.
