# Aktiv plan

Peger på den plan-fil der aktuelt er under arbejde (skrives → reviewes → bygges).

**Aktuel:** governance-vagt (2/6 merged). **gov-1 (paritet) merged 2026-06-04. gov-2-vagt merged (PR #93, main @ e1273c9)** — mekanisk governance-scanner + owns:-register + Codex-mandat §8.1 + huskeliste.md; `governance:check` live i CI (ikke-required indtil gov-4). Næste: gov-3-ci-blockers (split: gov-3a lav-brud-flade + gov-3b høj). Rest-sekvens: gov-3 → gov-4-branch-protection → gov-5-automation → gov-6-arkiv-fold. Åbne G-numre: G061 (comment-parity, før gov-4), G062 (recurring types-drift). Krav-dok (ét dok over de 6): `docs/coordination/governance-vagt-krav-og-data.md` ✓.

Når ny pakke startes følges V5-flowet i `docs/strategi/disciplin.md` §2:

1. **Step 0** — Pakke-åbning (Mathias melder ud)
2. **Step 1** — Krav-dok (Claude.ai-typist + Mathias-validator i chat)
3. **Step 2** — Plan (Code + Codex parallel; skitse-størrelses-tjek; fuld plan eller split)
4. **Step 3** — `qwerg` approval (Mathias)
5. **Step 4** — Build (Code batches; Codex per-batch auto)
6. **Step 5** — Slut-rapport (Code skriver; Claude.ai-review FØR merge)

For tidligere pakke-historik: se `docs/coordination/rapport-historik/`.
For status pr. byggetrin: se `docs/strategi/stork-2-0-master-plan.md` §4.1.
