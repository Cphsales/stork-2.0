# Aktiv plan

Peger på den plan-fil der aktuelt er under arbejde (skrives → reviewes → bygges).

**Aktuel:** `docs/coordination/H024-plan.md` (V1) — test-idempotens + artefakt-cleanup + Node 24. Branch `claude/H024-plan`. Krav-dok merged i `a15caff`.

**Historisk:**

- H010 (etablering af arbejdsmetode + repo-struktur) afsluttet ved commit `3c6bc0b`.
- H020 (28 åbenlyse dokument-rettelser + plan-automation-flow-test) afsluttet ved commit-range `7c0c83d..70d8857` (PR #20 rebase-merged 2026-05-16). Plan + feedback arkiveret i `docs/coordination/arkiv/` (filnavne `H020-*`). Slut-rapport: `rapport-historik/2026-05-16-h020.md`.

Når ny plan starter:

1. Plan-fil oprettes under `docs/coordination/` (typisk navn: `<pakke-kode>-plan.md`).
2. Sti + kort beskrivelse opdateres her.
3. Når pakken er afsluttet og merget: plan-filen flyttes til `docs/coordination/arkiv/`.

Formålet er at give andre aktører (Mathias, Claude.ai, Codex) ét sted at finde det igangværende arbejde uden at scanne hele coordination-mappen.
