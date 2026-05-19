qwerr — Lag1 slut-rapport forretnings-review runde 1

**Pakke:** Lag1
**Plan-version:** runde 1
**Phase:** Step 6 (slut-rapport-review)
**Forfatter:** Code (Claude Code)

## Læs via Filesystem-MCP

1. `/home/mathias/stork-2.0/docs/coordination/rapport-historik/2026-05-20-Lag1.md` — slut-rapport at reviewe
2. `/home/mathias/stork-2.0/docs/strategi/vision-og-principper.md` — autoritativ vision + 9 principper
3. `/home/mathias/stork-2.0/docs/strategi/stork-2-0-master-plan.md` — autoritativ master-plan
4. `/home/mathias/stork-2.0/docs/coordination/mathias-afgoerelser.md` — Mathias' afgørelser
5. `/home/mathias/stork-2.0/docs/coordination/Lag1-krav-og-data.md` (hvis findes — ellers udledt af plan-fil)
6. `/home/mathias/stork-2.0/docs/coordination/overvaagning/claude-ai-overvaagning.md` — din rolle-definition

Hvis Filesystem-MCP ikke virker, bed Mathias paste relevante uddrag.

## Specifikke review-spørgsmål

### Fire-dokument-verifikation (slut-rapport)

Verificér at slut-rapporten's "Fire-dokument-verifikation"-tabel reelt afspejler det leverede:

- "Status: overholdt" kræver at plan-refererede paragraffer faktisk er leveret i kode, ikke kun nævnt
- "Status: afveget" kræver konkret reference til Plan-afvigelser-sektionen + Mathias-godkendelse
- Hvis ny ramme-niveau-beslutning: entry i mathias-afgoerelser.md skal være med i pakkens commits

### Forretnings-leverance-tjek

1. Byggede vi det vi lovede mod vision/master-plan/krav-dok?
2. Plan-afvigelser: er de ærligt dokumenteret eller skjult?
3. Vision-tjek-sektion: er konklusion (forsvarligt/kompromis/drift) konsistent med leverancerne?

## Output-format

```markdown
# Lag1 — Claude.ai forretnings-review runde 1

**Reviewer:** Claude.ai (forretnings-dokument-konsistens)
**Plan-version:** runde 1
**Dato:** YYYY-MM-DD
**Phase:** Step 6 slut-rapport-review
**Resultat:** APPROVAL eller AFVIS

## Sammenfatning

[1-3 sætninger]

## Fire-dokument-tjek

| Dokument                 | Match | Begrundelse |
| ------------------------ | ----- | ----------- |
| vision-og-principper.md  | ✓/✗   | ...         |
| stork-2-0-master-plan.md | ✓/✗   | ...         |
| mathias-afgoerelser.md   | ✓/✗   | ...         |
| Krav-dok                 | ✓/✗   | ...         |

## Fund (hvis nogen)

- [KRITISK/MELLEM/LAV] <fund> — <begrundelse>

## Konklusion

[APPROVAL eller AFVIS-med-krævet-ændring + næste skridt]
```

## Disciplin-regler

- Kode-fund: marker "OUT OF SCOPE — Codex' bord" og fortsæt
- Funktions-spørgsmål: marker "OUT OF SCOPE — kræver Mathias-runde" og fortsæt
- Marker fund med klasse (KRITISK / MELLEM / LAV)

Begynd review.
