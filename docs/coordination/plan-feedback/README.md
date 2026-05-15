# Plan-feedback

Round-trip-feedback under plan-fasen for I-pakker (og andre pakker hvor plan-arbejde kører via commits frem for chat).

## Filnavngivning

| Filtype                       | Mønster                    | Skrevet af       | Indhold                                                                                               |
| ----------------------------- | -------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------- |
| Codex-review af plan-version  | `<pakke>-V<n>-codex.md`    | Codex            | Codex' review-fund mod plan-version `n`                                                               |
| Code's kontra-feedback / svar | `<pakke>-V<n>-code.md`     | Code             | Code's svar eller spørgsmål til Codex' `V<n>-codex.md`                                                |
| Konvergens-signal             | `<pakke>-approved.md`      | Codex            | Én linje: `Plan godkendt fra Codex' side. Klar til Mathias-validering.`                               |
| Krav-dokument-brud            | `<pakke>-V<n>-blokeret.md` | Code eller Codex | Stop-signal: forslag i `V<n>` modsiger krav-dokumentet. Detaljer + reference til krav-dokument-linje. |

Eksempler:

- `I001-V1-codex.md` — Codex' første review af I001-plan V1
- `I001-V2-code.md` — Code's svar / V2-plan-justering
- `I001-V2-codex.md` — Codex' second review
- `I001-approved.md` — Konvergens; klar til Mathias

## Flow

1. Code skriver `docs/coordination/<pakke>-plan.md` per plan-skabelon
2. Code opdaterer `docs/coordination/aktiv-plan.md` til at pege på plan-filen (trigger Codex-notify-action)
3. Codex committer `<pakke>-V1-codex.md` her
4. Code committer `<pakke>-V2-code.md` (svar) ELLER opdaterer plan-filen direkte
5. Loop indtil Codex committer `<pakke>-approved.md`
6. Mathias + Claude.ai validerer plan mod krav-dokumentet
7. Code bygger
8. Slut-rapport leveres jf. eksisterende flow
9. Plan-filen flyttes til `docs/coordination/plan-historik/`
10. Feedback-filerne bevares her som audit-spor af review-runder

## Krav-dokument-disciplin (stop-signal)

Hvis Code eller Codex bemærker at deres egne forslag ville modsige krav-dokumentet (Mathias' afgørelser, scope-afgrænsning, pakke-struktur), skal de **STOPPE** den igangværende runde og committe `<pakke>-V<n>-blokeret.md` med konkret reference til den linje i krav-dokumentet der ville blive brudt. De **argumenterer ikke** sig videre inden for runden.

Brud-typer der udløser stop:

- Forslag der modsiger Mathias' eksplicitte afgørelser i krav-dokumentet
- Scope-udvidelse udover krav-dokumentets "I scope"-liste
- Reklassificering af "IKKE i scope" til scope
- Ændring af pakke-struktur (samlet vs splittet)

Detaljer: `docs/strategi/arbejds-disciplin.md` sektion "Krav-dokument-disciplin".

## Append-only

Feedback-filer flyttes ikke væk efter plan-fasen er afsluttet. De bevares som audit-spor for hvordan plan blev modnet.
