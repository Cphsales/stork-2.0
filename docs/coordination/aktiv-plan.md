# Aktiv plan

Peger på den plan-fil der aktuelt er under arbejde (skrives → reviewes → bygges).

**Aktuel:** ingen pakke under arbejde — næste i rest-sekvens: gov-3b-3 (#18 app-write-REVOKE, retning A). **Merged:** gov-1 (paritet, 2026-06-04) · gov-2 (vagt, PR #93) · gov-docs-housekeeping (krav-dok-familie, PR #94) · **gov-3a** (4 §3-checks #4/#7/#16/#17 + zone-§3-fjernelse, PR #95, main @ c32097c; ikke-required indtil gov-4) · **gov-3b-1** (#19 FK-dækning + #6 indeks-pr-policy, PR #96, main @ a88d217; 23→25 fitness-checks; 0 SQL-/indeks-migrations; 3 sale-FK'er FK_PENDING → Trin 14 [H025]) · **gov-3b-2** (#10 SECDEF-markør-disciplin, PR #101, main @ `<udfyldes ved merge>`; 25→26 fitness-checks; 0 migrations; #18 udskilt → gov-3b-3 + [G065]). Rest-sekvens: gov-3b-3 → gov-4-branch-protection → gov-5-automation → gov-6-arkiv-fold. Åbne G-numre: G061 (comment-parity, før gov-4), G062 (recurring types-drift), G063 (v4-slettede-docs-allowlist → gov-6), G065 (T9 privilegie-eskaleringshul → gov-3b-3). Åbne H: [H025] (Trin 14: sale-FK'er + orphan-cleanup). Krav-dok (ét dok over de 6): `docs/coordination/governance-vagt-krav-og-data.md` ✓.

Når ny pakke startes følges V5-flowet i `docs/strategi/disciplin.md` §2:

1. **Step 0** — Pakke-åbning (Mathias melder ud)
2. **Step 1** — Krav-dok (Claude.ai-typist + Mathias-validator i chat)
3. **Step 2** — Plan (Code + Codex parallel; skitse-størrelses-tjek; fuld plan eller split)
4. **Step 3** — `qwerg` approval (Mathias)
5. **Step 4** — Build (Code batches; Codex per-batch auto)
6. **Step 5** — Slut-rapport (Code skriver; Claude.ai-review FØR merge)

For tidligere pakke-historik: se `docs/coordination/rapport-historik/`.
For status pr. byggetrin: se `docs/strategi/stork-2-0-master-plan.md` §4.1.
