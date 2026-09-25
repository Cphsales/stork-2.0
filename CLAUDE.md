# Stork 2.0

Greenfield-rebuild. Workflowet står i `docs/strategi/disciplin.md`; hver rolle har en rolletekst i `scripts/v5/roller/`. **Bulk-læs ikke docs for at orientere dig; læs snævert, on-demand.**

## Operationelt

- Commits og PR'er forfattes som `stork-code-bot`. Botten har i dag admin-rolle (nedgradering til write kræver admin-login, huskeliste H030). Tjek konto med `gh auth status` ved tvivl.
- Sessionens rolle sættes med `STORK_V5_ROLLE` (fabrik · claude-ai · code · codex · code-reviewer); pre-commit-hooken afviser skrivning uden for rollens zoner.
- **Læs ikke:** `/home/mathias/sales-commission-hub/` (1.0, anti-mønstre) · `copenhagensales/*`-repos.
