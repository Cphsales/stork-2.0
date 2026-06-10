# gov-docs-renhed — Pakke-status

**Sidste handling:** Codex runde 8: **APPROVAL + §8.1-SVAR: INGEN-MODSIGELSE** på batch 6. Batch 7 (Code-eget fund 6): scriptets parser scannede hele codex-transcriptet i stedet for finalt svar — false-positive exit 2 på APPROVAL; final-answer-ekstraktion tilføjet + verificeret (APPROVAL→0, KRITISK→2). 2026-06-10.
**Næste forventet:** Codex runde 9 (--quick, kun batch 7) → grøn → slut-rapport → Claude.ai-review FØR merge (Step 5) → Mathias "slut OK" + merge.
**Konvergens-counter:** 4 (plan-fase, afsluttet ved runde 4-APPROVAL). Build-reviews: runde 5 (3 KRITISK → batch 4/4b) · runde 6 (2 KRITISK → batch 5) · runde 7 (2 KRITISK → batch 6) · runde 8 (APPROVAL; transcript-støj i routing → batch 7) · runde 9 afventes.
**Aktuel blocker:** ingen.

Build-state (qwerg 2026-06-10):

- Batch 1 ✓ (`ddc72db`): 3 V5.3-scripts slettet, codex-review.sh repareret.
  Evidens: --parse-test grøn, governance:check grøn.
- Batch 2 ✓ (`42bfb55`): doc-reconcile A.1–A.14. Evidens: governance:check grøn.
  (Fejl-committede også 17 v4-slettede-docs-filer — fanget af Codex runde 5,
  rettet i batch 4.)
- Batch 3 ✓ (`00c1ebd`): allowlist-split + structural-chain + sti-regex-fix +
  9 selftest-cases + aktiv-pakke-markør. Evidens: selftest fuldt grøn
  (baseline + 13 plantede + deprecated-positiv), fitness grøn.
- Batch 4 ✓ (`1b87753`) + 4b ✓ (`821e1b3`): runde 5-fixes (v4-slettede-docs
  untracked + .gitignore; status-sync; MANGLENDE-EKSISTERENDE-BEVARELSE-routing;
  codex-reviews/ scope-ekskluderet).
- Batch 5 ✓ (`2fdc9f0`): runde 6-fixes (prettier på de to .mjs; MELLEM
  runde-aware routing, parse-test 14/14).
- Batch 6 ✓: runde 7-fixes (sidste tanke-data-rester i disciplin §8-pointen +
  SKILL.md; status-sync). Hash udfyldes i slut-rapporten (samme mønster som
  merge-hash — undgår selvreferentiel staleness).

Plan-afvigelser (til slut-rapport):

1. rapport-skabelon-allowlist-entry beholdt (plan sagde prune) — planens egen
   A.12-tekst er levende prosa-referent; prune ved pakke-luk/gov-6.
2. v4-slettede-docs/ kortvarigt tracked i batch 2 (Code-fejl, `git add -A`) —
   untracked igen + .gitignore-værn i batch 4. Aldrig på main.
3. MANGLENDE-EKSISTERENDE-BEVARELSE-routing tilføjet parseren (runde 5-fund) —
   udvidelse af B.1 inden for §5-semantikken.
4. codex-reviews/ tilføjet scannerens DOC_EXCLUDE (batch 4b) — review-filer er
   ephemeral rå-output (§4) der bevidst citerer døde stier; first-time-fund da
   reviews aldrig før var committet som filer.
5. MELLEM-routing gjort runde-aware i parseren (runde 6-fund, batch 5) —
   §5 runde-trapper: exit 2 i runde 1, G-spor i runde 2+.

Noter:

- Krav OK 2026-06-10 · qwerg 2026-06-10. 0 migrations — ren docs+scripts-pakke.
- Reviews: codex-reviews/2026-06-10-gov-docs-renhed-runde-{1..4}.md (plan:
  2K+3M → 1K+3M → 1K+1G → APPROVAL) · runde-5.md (build: 3 KRITISK → batch 4).
- Driftsnote: `codex exec` uden TTY kræver `< /dev/null` — indbygget i repareret
  codex-review.sh.
