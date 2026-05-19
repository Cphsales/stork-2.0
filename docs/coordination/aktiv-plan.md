# Aktiv plan

Peger på den plan-fil der aktuelt er under arbejde (skrives → reviewes → bygges).

**Aktuel:** ingen aktiv pakke — venter på næste pakke-valg fra Mathias.

Kandidat-emner per T9-supplement slut-rapport: T9-cleanup (G054-follow-up er allerede løst i PR #46), Lag E (beregningsmotor + tidsregistrering), Supabase Branching-infrastruktur.

**Historisk:**

- T9-supplement (lukke 6 åbne T9-fund: team-retype-overlap-invariant, schema-exposure-verifikation, backdated traversal i 7 apply-handlers, date-aware read-gates, Step 12 robusthed, type-codegen) afsluttet 2026-05-19 via PR #44 (build), #45 (slut-rapport), #46 (G054 type-codegen). Plan + krav-og-data + V1-V4 plan-feedback (claude-ai + codex) + skitse arkiveret i `docs/coordination/arkiv/` (filnavne `T9-supplement-*`, 11 filer). Slut-rapport: `rapport-historik/2026-05-19-t9-supplement.md`.
- T9 (§4 trin 9 — Identitet del 2: organisations-træ + permission-fundament + fortrydelses-mekanisme + import fra 1.0) afsluttet 2026-05-18 via PR #34, #35, #36, #37, #38, #39, #40 → main. Plan + feedback (V1-V6) arkiveret i `docs/coordination/arkiv/` (filnavne `T9-*`). Build i 12 migrations + 6 smoke-tests + 2 stub migration-scripts + T9-fundament-supplement-migration (master-plan §1.7-omskrivning + §1.1 session-var-pattern). 8 push-fase-bugs fix'et via PR #35-38 + #40. Slut-rapport: `rapport-historik/2026-05-18-t9.md`.
- H010 (etablering af arbejdsmetode + repo-struktur) afsluttet ved commit `3c6bc0b`.
- H020 (28 åbenlyse dokument-rettelser + plan-automation-flow-test) afsluttet
  ved commit-range `7c0c83d..70d8857` (PR #20 rebase-merged 2026-05-16). Plan +
  feedback arkiveret i `docs/coordination/arkiv/` (filnavne `H020-*`).
  Slut-rapport: `rapport-historik/2026-05-16-h020.md`.
- H024 (test-idempotens + artefakt-cleanup + Node 24) afsluttet ved commit-range
  `8f46615^..30fbdf4` (PR #26 rebase-merged 2026-05-16). Plan + feedback
  arkiveret i `docs/coordination/arkiv/` (filnavne `H024-*`). Slut-rapport:
  `rapport-historik/2026-05-16-h024.md`.
- T9 første forsøg (V1-V3) trukket tilbage 2026-05-17 efter afdæknings-session
  afslørede fundamentale misforståelser. Plan + feedback arkiveret i
  `docs/coordination/arkiv/T9-foraeldet-2026-05-17/`. Ny T9-runde startes med
  nyt krav-dokument.

Når ny plan starter:

1. Plan-fil oprettes under `docs/coordination/` (typisk navn: `<pakke-kode>-plan.md`).
2. Sti + kort beskrivelse opdateres her.
3. Når pakken er afsluttet og merget: plan-filen flyttes til `docs/coordination/arkiv/`.

Formålet er at give andre aktører (Mathias, Claude.ai, Codex) ét sted at finde
det igangværende arbejde uden at scanne hele coordination-mappen.
