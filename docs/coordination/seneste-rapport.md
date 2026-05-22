# Seneste rapport

Peger på sidste leverede slut-rapport (Code → Mathias).

**Aktuel:** `docs/coordination/rapport-historik/2026-05-22-v4-automation.md` (PR #80 rebase-merged til main 2026-05-22)

Når ny rapport leveres:

1. Rapport-fil oprettes direkte i `docs/coordination/rapport-historik/` med navnet `<dato>-<pakke-kode>.md`.
2. Sti + commit-hash opdateres her.

Denne fil er trigger for Codex-notify GitHub Action (jf. `.github/workflows/codex-notify.yml`). Ændring her poster comment til tracker-issue "Codex review queue".
