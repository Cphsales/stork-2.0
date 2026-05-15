# Aktiv plan

Peger på den plan-fil der aktuelt er under arbejde (skrives → reviewes → bygges).

**Aktuel:** `docs/coordination/H020-plan.md` — **V3** på branch `claude/h020-plan` (rebased onto main `9b288ed` med M13+M21-præcisering). V1 blokeret af Codex (`plan-feedback/H020-V1-blokeret.md`) for M23-brud; V2 omklassificerede M23 som flow-konsekvens, men Codex V2-review konvergens-status `ikke-enig` (`plan-feedback/H020-V2-codex.md`) pga. M13+M21 dato-determinisme. V3 strammer M13+M21-verifikation til commit-dato-match og tilføjer eksplicit Lukningskriterium for flow-trin 11. Codex-review V3 afventes.

Når ny plan starter:

1. Plan-fil oprettes under `docs/coordination/` (typisk navn: `<pakke-kode>-plan.md`).
2. Sti + kort beskrivelse opdateres her.
3. Når pakken er afsluttet og merget: plan-filen flyttes til `docs/coordination/arkiv/`.

Formålet er at give andre aktører (Mathias, Claude.ai, Codex) ét sted at finde det igangværende arbejde uden at scanne hele coordination-mappen.
