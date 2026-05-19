#!/usr/bin/env bash
# scripts/claude-ai-prompt.sh
# Genererer paste-pakke til Claude.ai-web (forretnings-review).
#
# Claude.ai forbliver manuel paste på web (har egen Filesystem-MCP).
# Dette script eliminerer manuel prompt-byggetid ved at samle:
#   - Rolle-prefix fra claude-ai-overvaagning.md
#   - Pakke-kontekst + læs-instruktioner (file-references)
#   - Specifikke review-spørgsmål per fase
#   - Output-format
#
# Brug:
#   scripts/claude-ai-prompt.sh <plan-fil> <round-N> [--phase=plan|slut-rapport]
#
# Output: paste-klar markdown til stdout. Pipe til xclip eller fil.

set -euo pipefail

if [ $# -lt 2 ]; then
  cat <<EOF >&2
Usage: $0 <plan-fil> <round-N> [--phase=plan|slut-rapport]

Eksempel:
  $0 docs/coordination/Lag1-plan.md 1
  $0 docs/coordination/Lag1-plan.md 2 --phase=plan
  $0 docs/coordination/rapport-historik/2026-05-20-Lag1.md 1 --phase=slut-rapport

Pipe output til clipboard: $0 ... | xclip -selection clipboard
Eller fil: $0 ... > /tmp/claude-ai-prompt.md
EOF
  exit 64
fi

PLAN_FILE="$1"
ROUND_N="$2"
shift 2

PHASE="plan"
while [ $# -gt 0 ]; do
  case "$1" in
    --phase=*) PHASE="${1#--phase=}"; shift ;;
    *) echo "Ukendt flag: $1" >&2; exit 64 ;;
  esac
done

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$REPO_ROOT" ]; then
  echo "❌ Skal køres inde i git-repo." >&2
  exit 64
fi
cd "$REPO_ROOT"

if [ ! -f "$PLAN_FILE" ]; then
  echo "❌ Fil findes ikke: $PLAN_FILE" >&2
  exit 64
fi

PAKKE_NAME="$(basename "$PLAN_FILE" | sed -E 's/-plan\.md$//; s/\.md$//')"
ABSPATH_PLAN="$(realpath "$PLAN_FILE")"

case "$PHASE" in
  plan)         PHASE_TRIGGER="qwerr — $PAKKE_NAME forretnings-approval runde $ROUND_N" ;;
  slut-rapport) PHASE_TRIGGER="qwerr — $PAKKE_NAME slut-rapport forretnings-review runde $ROUND_N" ;;
  *) echo "❌ Ukendt --phase: $PHASE" >&2; exit 64 ;;
esac

# ============================================================
# Generér paste-pakke
# ============================================================

cat <<EOF
$PHASE_TRIGGER

**Pakke:** $PAKKE_NAME
**Plan-version:** runde $ROUND_N
**Phase:** Step $([ "$PHASE" = "plan" ] && echo "4 (forretnings-approval)" || echo "6 (slut-rapport-review)")
**Forfatter:** Code (Claude Code)

## Læs via Filesystem-MCP

1. \`$ABSPATH_PLAN\` — $([ "$PHASE" = "plan" ] && echo "plan-fil" || echo "slut-rapport") at reviewe
2. \`$REPO_ROOT/docs/strategi/vision-og-principper.md\` — autoritativ vision + 9 principper
3. \`$REPO_ROOT/docs/strategi/stork-2-0-master-plan.md\` — autoritativ master-plan
4. \`$REPO_ROOT/docs/coordination/mathias-afgoerelser.md\` — Mathias' afgørelser
5. \`$REPO_ROOT/docs/coordination/$PAKKE_NAME-krav-og-data.md\` (hvis findes — ellers udledt af plan-fil)
6. \`$REPO_ROOT/docs/coordination/overvaagning/claude-ai-overvaagning.md\` — din rolle-definition

Hvis Filesystem-MCP ikke virker, bed Mathias paste relevante uddrag.

## Specifikke review-spørgsmål

EOF

if [ "$PHASE" = "plan" ]; then
  cat <<'EOF'
### Fire-dokument-konsultations-tjek

Verificér at plan-filen indeholder "Fire-dokument-konsultation"-sektionen med korrekt udfyldt firekolonne-tabel:

| Dokument | Konsulteret | Relevante referencer | Konflikt med plan? |

- "Konsulteret = nej" på nogen række → KRITISK
- Referencer skal være konkrete (paragraf-numre, princip-numre, datoer) — ikke "hele filen"
- "Konflikt = ja" kræver håndtering i Strukturel beslutning-sektionen

### Forretnings-konsistens

1. **Vision-konsistens:** Bryder planen nogen af de 9 vision-principper? Særligt princip 5 (livscyklus), princip 6 (audit), princip 7 (lock-after-period).
2. **Master-plan-konsistens:** Matcher §X-paragraffer planen refererer? Konflikt med rettelser i Appendix C?
3. **Mathias-afgoerelser:** Konflikt med eksisterende ramme-niveau-afgørelser?
4. **Krav-dok-dækning:** Dækker plan-leverancerne alle krav-spec-punkterne?
EOF
else
  cat <<'EOF'
### Fire-dokument-verifikation (slut-rapport)

Verificér at slut-rapporten's "Fire-dokument-verifikation"-tabel reelt afspejler det leverede:

- "Status: overholdt" kræver at plan-refererede paragraffer faktisk er leveret i kode, ikke kun nævnt
- "Status: afveget" kræver konkret reference til Plan-afvigelser-sektionen + Mathias-godkendelse
- Hvis ny ramme-niveau-beslutning: entry i mathias-afgoerelser.md skal være med i pakkens commits

### Forretnings-leverance-tjek

1. Byggede vi det vi lovede mod vision/master-plan/krav-dok?
2. Plan-afvigelser: er de ærligt dokumenteret eller skjult?
3. Vision-tjek-sektion: er konklusion (forsvarligt/kompromis/drift) konsistent med leverancerne?
EOF
fi

cat <<EOF

## Output-format

\`\`\`markdown
# $PAKKE_NAME — Claude.ai forretnings-review runde $ROUND_N

**Reviewer:** Claude.ai (forretnings-dokument-konsistens)
**Plan-version:** runde $ROUND_N
**Dato:** YYYY-MM-DD
**Phase:** Step $([ "$PHASE" = "plan" ] && echo "4 forretnings-approval" || echo "6 slut-rapport-review")
**Resultat:** APPROVAL eller AFVIS

## Sammenfatning
[1-3 sætninger]

## Fire-dokument-tjek

| Dokument | Match | Begrundelse |
|---|---|---|
| vision-og-principper.md | ✓/✗ | ... |
| stork-2-0-master-plan.md | ✓/✗ | ... |
| mathias-afgoerelser.md | ✓/✗ | ... |
| Krav-dok | ✓/✗ | ... |

## Fund (hvis nogen)

- [KRITISK/MELLEM/LAV] <fund> — <begrundelse>

## Konklusion

[APPROVAL eller AFVIS-med-krævet-ændring + næste skridt]
\`\`\`

## Disciplin-regler

- Kode-fund: marker "OUT OF SCOPE — Codex' bord" og fortsæt
- Funktions-spørgsmål: marker "OUT OF SCOPE — kræver Mathias-runde" og fortsæt
- Marker fund med klasse (KRITISK / MELLEM / LAV)

Begynd review.
EOF
