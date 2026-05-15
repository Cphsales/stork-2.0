# Aktiv plan

Peger på den plan-fil der aktuelt er under arbejde (skrives → reviewes → bygges).

**Aktuel:** `docs/coordination/H020-plan.md` — **V2** på branch `claude/h020-plan` (rebased onto main `a335f42` med M23-fix). V1 blokeret af Codex (`plan-feedback/H020-V1-blokeret.md`) for M23-brud; V2 omklassificerer M23 som flow-konsekvens. Codex-review V2 afventes.

Når ny plan starter:

1. Plan-fil oprettes under `docs/coordination/` (typisk navn: `<pakke-kode>-plan.md`).
2. Sti + kort beskrivelse opdateres her.
3. Når pakken er afsluttet og merget: plan-filen flyttes til `docs/coordination/arkiv/`.

Formålet er at give andre aktører (Mathias, Claude.ai, Codex) ét sted at finde det igangværende arbejde uden at scanne hele coordination-mappen.
