#!/usr/bin/env bash
# scripts/krav-afklar.sh
# Step 2 (KRAV-AFKLAR): Code+Codex læser krav-dok og stiller afklarende spørgsmål.
# Codex skal IKKE skrive plan — kun rejse afklarende spørgsmål eller markere umuligheder.
#
# Brug:
#   scripts/krav-afklar.sh <krav-dok-fil>
#
# Output: docs/coordination/<pakke>-krav-afklaring.md med Codex' spørgsmål +
#         pladsholder til Mathias/Claude.ai-svar + ACCEPT/AFVIS-beslutning.
#
# Per V5.3 routing-tabel: AFVIS → step 1 (revid krav). ACCEPT → step 3 (plan).

set -euo pipefail

if [ $# -lt 1 ]; then
  cat <<EOF >&2
Usage: $0 <krav-dok-fil>

Eksempel:
  $0 docs/coordination/<pakke>-krav-og-data.md

Output: docs/coordination/<pakke>-krav-afklaring.md
EOF
  exit 64
fi

KRAV_FILE="$1"

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$REPO_ROOT" ]; then
  echo "❌ Skal køres inde i git-repo." >&2
  exit 64
fi
cd "$REPO_ROOT"

if [ ! -f "$KRAV_FILE" ]; then
  echo "❌ Krav-fil findes ikke: $KRAV_FILE" >&2
  exit 64
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "❌ codex CLI ikke fundet i PATH." >&2
  exit 64
fi

PAKKE_NAME="$(basename "$KRAV_FILE" | sed -E 's/-krav-og-data\.md$//; s/\.md$//')"
OUTPUT_FILE="docs/coordination/${PAKKE_NAME}-krav-afklaring.md"
DATE="$(date +%Y-%m-%d)"

TIMEOUT_SEC="${CODEX_TIMEOUT:-300}"

echo "▶ Step 2 KRAV-AFKLAR for $PAKKE_NAME" >&2
echo "  Krav-dok: $KRAV_FILE" >&2
echo "  Output:   $OUTPUT_FILE" >&2

RAW_OUTPUT="$(mktemp -t krav-afklar.XXXXXX)"
trap 'rm -f "$RAW_OUTPUT"' EXIT

PROMPT=$(cat <<EOF
SCOPE: KRAV-AFKLAR (step 2) for pakke $PAKKE_NAME.

Læs $KRAV_FILE som teknisk reviewer.

OPGAVE: Stil ALLE afklarende spørgsmål du har som tekniker. Marker umuligheder eller modsigelser. INGEN plan-skrivning — kun spørgsmål og flags.

Format pr. spørgsmål:
- **Q1:** <spørgsmål>
  **Hvorfor relevant:** <konsekvens hvis ikke afklaret>
  **Hvem skal svare:** Mathias / Claude.ai / begge

Hvis teknisk umulighed: marker "UMULIG:" + begrundelse.
Hvis intern modsigelse i krav-dok: marker "MODSIGELSE:" + de to konfliktende punkter.

Slut med din vurdering: "BUILDABLE-AS-IS" (intet afklaring krævet) eller "AFKLARING-KRAEVET" (svar nødvendige inden plan).

Max 400 ord.
EOF
)

set +e
timeout --signal=KILL "$TIMEOUT_SEC" codex exec --skip-git-repo-check \
  -c 'model_reasoning_effort="xhigh"' \
  --enable fast_mode \
  "$PROMPT" > "$RAW_OUTPUT" 2>&1
CODEX_EXIT=$?
set -e

if [ $CODEX_EXIT -eq 124 ] || [ $CODEX_EXIT -eq 137 ]; then
  echo "❌ codex timed out efter ${TIMEOUT_SEC}s." >&2
  exit 124
fi
if [ $CODEX_EXIT -ne 0 ]; then
  echo "❌ codex fejlede (exit $CODEX_EXIT)." >&2
  tail -10 "$RAW_OUTPUT" >&2
  exit $CODEX_EXIT
fi

cat > "$OUTPUT_FILE" <<EOF
# Krav-afklaring — $PAKKE_NAME

**Pakke:** $PAKKE_NAME
**Krav-dok:** $KRAV_FILE
**Dato:** $DATE
**Step:** 2 (KRAV-AFKLAR)

---

## Codex' afklarende spørgsmål

EOF
cat "$RAW_OUTPUT" >> "$OUTPUT_FILE"

cat >> "$OUTPUT_FILE" <<EOF


---

## Mathias / Claude.ai-svar

[Udfyldes som svar på spørgsmål ovenfor. Skriv direkte under hvert Q-N.]

---

## Code's beslutning (efter svar modtaget)

- [ ] **ACCEPT** — krav er buildable, fortsætter til step 3 (PLAN-FASE)
- [ ] **AFVIS** — krav skal revideres, retur til step 1 (loop)

Begrundelse: [hvad er rationale for ACCEPT/AFVIS]
EOF

echo "" >&2
echo "✓ Krav-afklaring leveret: $OUTPUT_FILE" >&2
echo "  Næste: Mathias/Claude.ai svarer på spørgsmål, Code afgør ACCEPT/AFVIS." >&2
