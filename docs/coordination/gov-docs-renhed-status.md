# gov-docs-renhed — Pakke-status

**Sidste handling:** Plan V3 skrevet — alle 4 runde 2-fund ADRESSERET (1 KRITISK: bracket-tolerant marker-parsing + --parse-test; 3 MELLEM rettet i V3 frem for G-numre); Codex runde 3 dispatched (2026-06-10).
**Næste forventet:** Codex runde 3: APPROVAL + INGEN NYE FUND → Mathias læser → `qwerg`. Ellers V4 (runde 3: kun KRITISK stopper) + §3.4 Mathias-alert ved runde 4.
**Konvergens-counter:** 3
**Aktuel blocker:** ingen.

Noter:

- Krav OK givet af Mathias 2026-06-10.
- 0 migrations — ren docs+scripts-pakke; §3.2 DB-dump N/A (repo-state-dump i plan).
- §8.1-gate aktiv: pakken berører begge stamme-docs + master-planens
  hierarki-afsnit (A.14, fund R2-4) → Codex' §8.1-SVAR kræves; vision-ændring
  håndhæves af Mathias-CODEOWNERS ved merge.
- Reviews: codex-reviews/2026-06-10-gov-docs-renhed-runde-1.md (2 KRITISK +
  3 MELLEM → V2) · runde-2.md (1 KRITISK + 3 MELLEM → V3).
- Driftsnote: `codex exec` uden TTY kræver `< /dev/null` (ellers stdin-hænger) —
  i codex-review.sh-repair (appendix B.1).
