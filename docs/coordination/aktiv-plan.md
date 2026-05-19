# Aktiv plan

Peger på den plan-fil der aktuelt er under arbejde (skrives → reviewes → bygges).

**Aktuel:** ingen aktiv pakke — venter på næste pakke-valg fra Mathias.

Workflow-spec V5.3 (`docs/skabeloner/workflow-skabelon.md`) er etableret som autoritativ operationel guide for kommende pakker.

**Historisk:**

- **Lag 1** (workflow-stabilisering — 9 leverancer A-J + V5.3 marker-protokol-spec) afsluttet 2026-05-20 via PR #48 (`708ab8d`). Plan + V5.1-V5.3 plan-feedback + Codex-approval arkiveret i `docs/coordination/arkiv/` (filnavne `Lag1-*`). Slut-rapport: `rapport-historik/2026-05-20-Lag1.md`. Plan-fase: 7 plan-versioner, 5 Codex-runder med APPROVAL på V5.1, 3 Claude.ai-runder med APPROVAL på V5.3.
- **T9-supplement** (lukke 6 åbne T9-fund: team-retype-overlap-invariant, schema-exposure-verifikation, backdated traversal i 7 apply-handlers, date-aware read-gates, Step 12 robusthed, type-codegen) afsluttet 2026-05-19 via PR #44 (build), #45 (slut-rapport), #46 (G054 type-codegen). Plan + krav-og-data + V1-V4 plan-feedback eksisterer på `claude/T9-supplement-plan`-branchen per slut-rapport-disciplin. Slut-rapport: `rapport-historik/2026-05-19-t9-supplement.md`.
- **T9** (§4 trin 9 — Identitet del 2: organisations-træ + permission-fundament + fortrydelses-mekanisme + import fra 1.0) afsluttet 2026-05-18 via PR #34, #35, #36, #37, #38, #39, #40 → main. Plan + feedback (V1-V6) arkiveret i `docs/coordination/arkiv/` (filnavne `T9-*`). Build i 12 migrations + 6 smoke-tests + 2 stub migration-scripts + T9-fundament-supplement-migration (master-plan §1.7-omskrivning + §1.1 session-var-pattern). 8 push-fase-bugs fix'et via PR #35-38 + #40. Slut-rapport: `rapport-historik/2026-05-18-t9.md`.
- **H010** (etablering af arbejdsmetode + repo-struktur) afsluttet ved commit `3c6bc0b`.
- **H020** (28 åbenlyse dokument-rettelser + plan-automation-flow-test) afsluttet
  ved commit-range `7c0c83d..70d8857` (PR #20 rebase-merged 2026-05-16). Plan +
  feedback arkiveret i `docs/coordination/arkiv/` (filnavne `H020-*`).
  Slut-rapport: `rapport-historik/2026-05-16-h020.md`.
- **H024** (test-idempotens + artefakt-cleanup + Node 24) afsluttet ved commit-range
  `8f46615^..30fbdf4` (PR #26 rebase-merged 2026-05-16). Plan + feedback
  arkiveret i `docs/coordination/arkiv/` (filnavne `H024-*`). Slut-rapport:
  `rapport-historik/2026-05-16-h024.md`.
- **T9 første forsøg** (V1-V3) trukket tilbage 2026-05-17 efter afdæknings-session
  afslørede fundamentale misforståelser. Plan + feedback arkiveret i
  `docs/coordination/arkiv/T9-foraeldet-2026-05-17/`. Ny T9-runde startes med
  nyt krav-dokument.

Når ny plan starter:

1. Step 0 (DATA-GRUNDLAG) hvis ikke-mikro: `scripts/data-grundlag.sh <pakke>`
2. Step 1 (KRAV): Mathias + Claude.ai → krav-og-data-dok
3. Step 2 (KRAV-AFKLAR): `scripts/krav-afklar.sh <krav-fil>`
4. Step 3 (PLAN): Code + Codex iterativt → V1...Vn via `scripts/codex-review.sh`
5. Step 4 (APPROVAL): Mathias + Claude.ai → via `scripts/claude-ai-prompt.sh`
6. Step 5 (BUILD): Code bygger, Codex validerer
7. Step 6 (SLUT-RAPPORT + LUK)

Detaljeret reference: `docs/skabeloner/workflow-skabelon.md`.
