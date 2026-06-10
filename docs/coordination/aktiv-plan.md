# Aktiv plan

Peger på den plan-fil der aktuelt er under arbejde (skrives → reviewes → bygges).

<!-- aktiv-pakke: ingen -->

**Aktuel:** gov-5-automation — Step 1 passeret: krav OK (Mathias, 2026-06-10). Krav-dok: `docs/coordination/gov-5-automation-krav-og-data.md` ✓ · recon-grundlag: `docs/coordination/gov-5-automation-recon.md` (PR #122). Næste: Step 2-plan (Code + Codex parallel) — Code har rejst 2 krav-mod-virkelighed-punkter til Mathias FØR plan-start (krav-dok-feedback-mønster: krav-dok fornys, omgås ikke). Mathias-krav (ordret): automatikken er transport, aldrig dømmekraft · manuelt flow består som fallback. (Markøren ovenfor flipper ved Step 2, når plan/status-filerne findes — structural-chain-krav.) **Senest merged:** gov-4-branch-protection (PR #110 + step 5-PR, 2026-06-10): gates fuldt bindende — required CI-check + required code-owner-review; H026 løst (tre-konto-struktur: mgrubak = code owner, stork-code-bot = committer); CODEOWNERS-fix (5 fejl → 0); G061 LØST. Plan (slut-version): `docs/coordination/arkiv/gov-4-branch-protection-plan.md`. Før det: gov-docs-renhed (PR #108, 2026-06-10): docs-renhed + selvvedligeholdende værn — allowlist-split, structural-chain, §8.1-SVAR-markør, D4-konsistens i begge stamme-docs (forretningsforstaaelse → LÅST), codex-review.sh V5-repareret, 3 V5.3-scripts slettet. 9 Codex-runder, Claude.ai-APPROVAL på slut-rapport. Plan (slut-version): `docs/coordination/arkiv/gov-docs-renhed-plan.md`. **Merged:** gov-1 (paritet, 2026-06-04) · gov-2 (vagt, PR #93) · gov-docs-housekeeping (krav-dok-familie, PR #94) · **gov-3a** (4 §3-checks #4/#7/#16/#17 + zone-§3-fjernelse, PR #95, main @ c32097c; ikke-required indtil gov-4) · **gov-3b-1** (#19 FK-dækning + #6 indeks-pr-policy, PR #96, main @ a88d217; 23→25 fitness-checks; 0 SQL-/indeks-migrations; 3 sale-FK'er `FK_PENDING` → Trin 14 [H025]) · **gov-3b-2** (#10 SECDEF-markør-disciplin, PR #101, main @ `165833c`; 25→26 fitness-checks; 0 migrations; #18 udskilt → gov-3b-3 + [G065]) · **gov-3b-3a** (#18 del 1: §1.1:160-reconcile + 9 `permission_*` INVOKER→SECDEF, PR #103, main @ `c846105`; 4 migrations live-applikeret; G065 stadig åben → 3b) · **gov-3b-3b** (#18 del 2: sidste 5 INVOKER→SECDEF + REVOKE authenticated-write + #18-check, PR #105, main @ `7be6511`; 4 migrations live; **[G065] LØST**; gov-3 CI-blockers fuldt færdig). Rest-sekvens (Mathias-beslutning 2026-06-10 — automatikken testes på lavrisiko-arbejde før forretning): gov-5-automation → gov-6-arkiv-fold → forretnings-trin → partnerskabs-runde. Åbne G/H: se `docs/teknisk/teknisk-gaeld.md` + `docs/teknisk/huskeliste.md` — eneste sandheder (§3.2); kopi-liste her udgået efter drift (H027 stod som åben efter den var LØST 2026-06-10 via PR #114, historik i #116). Krav-dok (ét dok over de 6): `docs/coordination/governance-vagt-krav-og-data.md` ✓.

Når ny pakke startes følges V5-flowet i `docs/strategi/disciplin.md` §2:

1. **Step 0** — Pakke-åbning (Mathias melder ud)
2. **Step 1** — Krav-dok (Claude.ai-typist + Mathias-validator i chat)
3. **Step 2** — Plan (Code + Codex parallel; skitse-størrelses-tjek; fuld plan eller split)
4. **Step 3** — `qwerg` approval (Mathias)
5. **Step 4** — Build (Code batches; Codex per-batch auto)
6. **Step 5** — Slut-rapport (Code skriver; Claude.ai-review FØR merge)

For tidligere pakke-historik: se `docs/coordination/rapport-historik/`.
For status pr. byggetrin: se `docs/strategi/stork-2-0-master-plan.md` §4.1.
