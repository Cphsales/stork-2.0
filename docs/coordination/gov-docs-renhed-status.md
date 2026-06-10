# gov-docs-renhed — Pakke-status

**Sidste handling:** Build batch 5: Codex runde 6 gav 2 KRITISK — begge rettet (prettier-format på de to .mjs; MELLEM runde-aware routing + 4 nye fixtures, parse-test 14/14). 2026-06-10.
**Næste forventet:** Codex verifikations-review (runde 7) af batch 5 → grøn → Code skriver slut-rapport → Claude.ai-review FØR merge (Step 5) → Mathias "slut OK" + merge.
**Konvergens-counter:** 4 (plan-fase, afsluttet ved runde 4-APPROVAL). Build-reviews: runde 5 (3 KRITISK → batch 4/4b) · runde 6 (2 KRITISK → batch 5) · runde 7 afventes.
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
- Batch 4 ✓: runde 5-fund-fixes (denne commit).

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
