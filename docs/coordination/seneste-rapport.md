# Seneste rapport

Peger på sidste leverede slut-rapport (Code → Mathias).

**Aktuel:** opdateres efter H010-commit med sti til H010-slut-rapport (forventet placering: `docs/coordination/rapport-historik/<dato>-h010.md`).

Når ny rapport leveres:

1. Rapport-fil oprettes direkte i `docs/coordination/rapport-historik/` med navnet `<dato>-<pakke-kode>.md`.
2. Sti + commit-hash opdateres her.

Denne fil er trigger for Codex-notify GitHub Action (jf. `.github/workflows/codex-notify.yml`). Ændring her poster comment til tracker-issue "Codex review queue".
