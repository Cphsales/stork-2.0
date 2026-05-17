# Aktiv plan

Peger på den plan-fil der aktuelt er under arbejde (skrives → reviewes → bygges).

**Aktuel:** Ingen plan endnu. Krav-dokument klar:
`docs/coordination/T9-krav-og-data.md` (godkendt af Mathias 2026-05-17). Pakke:
§4 trin 9 — Identitet del 2 (organisations-træet + permission-fundament +
fortrydelses-mekanisme + import fra 1.0). Afventer at Code laver T9-plan V1
på ny branch.

**Historisk:**

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
