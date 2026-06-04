#!/usr/bin/env bash
# scripts/data-grundlag.sh
# Step 0 (DATA-GRUNDLAG): Kontekst-indsamling FØR krav-fase.
# Genererer en data-grundlag-fil med 3 sektioner (Code/Codex/Claude.ai-perspektiver).
#
# Skip-kriterier (per workflow-skabelon): mikro-pakker, hot-fix, nylig kontekst.
# Hvis nogen af de tre triggere: skip step 0 og dokumentér i krav-dok's åbnings-sektion.
#
# Brug:
#   scripts/data-grundlag.sh <pakke-topic>
#
# Eksempel:
#   scripts/data-grundlag.sh Lag1-workflow-stabilisering
#
# Output: docs/coordination/<pakke>-data-grundlag.md

set -euo pipefail

if [ $# -lt 1 ]; then
  cat <<EOF >&2
Usage: $0 <pakke-topic>

Eksempel:
  $0 Lag1-workflow-stabilisering
  $0 T10-klient-skabelon

Output: docs/coordination/<pakke>-data-grundlag.md med 3 sektioner.

Skip step 0 hvis:
- Mikro-pakke (under 100 linjer ændring)
- Hot-fix med klar rod-årsag
- Kontekst nylig etableret af forrige pakke (samme session/dag/tema)
EOF
  exit 64
fi

PAKKE_NAME="$1"

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$REPO_ROOT" ]; then
  echo "❌ Skal køres inde i git-repo." >&2
  exit 64
fi
cd "$REPO_ROOT"

OUTPUT_FILE="docs/coordination/${PAKKE_NAME}-data-grundlag.md"
DATE="$(date +%Y-%m-%d)"

if [ -f "$OUTPUT_FILE" ]; then
  echo "❌ Output-fil eksisterer allerede: $OUTPUT_FILE" >&2
  echo "  Slet den eller vælg andet pakke-navn." >&2
  exit 64
fi

echo "▶ Step 0 DATA-GRUNDLAG for $PAKKE_NAME" >&2
echo "  Indsamler kontekst fra autoritative docs..." >&2

# ============================================================
# Sektion 1: Code-perspektiv (master-plan + teknisk-gaeld + bygge-status)
# ============================================================

CODE_SECTION="$(mktemp -t code-context.XXXXXX)"
trap 'rm -f "$CODE_SECTION"' EXIT

{
  echo "### Aktive G-numre fra teknisk-gaeld.md"
  echo ""
  grep -E "^### \[G[0-9]+\]" docs/teknisk/teknisk-gaeld.md 2>/dev/null | head -10 || echo "_(ingen G-numre fundet)_"
  echo ""
  echo "### Næste op i bygge-status.md"
  echo ""
  awk '/^## Næste op/{flag=1; next} /^## /{flag=0} flag' docs/strategi/bygge-status.md 2>/dev/null | head -30 || echo "_(bygge-status sektion ikke fundet)_"
  echo ""
  echo "### Cutover-blockers"
  echo ""
  grep -E "^### \[H[0-9]+\]" docs/teknisk/huskeliste.md 2>/dev/null | head -10 || echo "_(ingen aktuelle cutover-blockers)_"
} > "$CODE_SECTION"

# ============================================================
# Sektion 2: Codex-perspektiv (current repo state via codex CLI)
# ============================================================

CODEX_SECTION="$(mktemp -t codex-context.XXXXXX)"
trap 'rm -f "$CODE_SECTION" "$CODEX_SECTION"' EXIT

if command -v codex >/dev/null 2>&1; then
  echo "  Codex-kontekst..." >&2
  PROMPT="Kort teknisk status for repo lige nu for pakke '$PAKKE_NAME': hvilken state er stork-2.0 i (seneste merged pakke, åbne PR'er, CI-state). Max 100 ord. Brug 'git log --oneline -5' og 'gh pr list --state open --limit 3'."
  set +e
  timeout --signal=KILL 60 codex exec --skip-git-repo-check \
    -c 'model_reasoning_effort="low"' \
    --enable fast_mode \
    "$PROMPT" > "$CODEX_SECTION" 2>&1
  CODEX_EXIT=$?
  set -e
  if [ $CODEX_EXIT -ne 0 ]; then
    echo "_(codex teknisk-status fejlede — exit $CODEX_EXIT)_" > "$CODEX_SECTION"
  fi
else
  echo "_(codex CLI ikke fundet — spring sektion)_" > "$CODEX_SECTION"
fi

# ============================================================
# Sektion 3: Claude.ai-perspektiv (forretnings-kontekst)
# ============================================================
# Claude.ai er manuel — vi genererer en paste-pakke som Mathias kan bruge
# hvis forretnings-kontekst er nødvendig.

CLAUDE_SECTION="$(cat <<EOF
**Claude.ai-paste-pakke** (Mathias bruger denne hvis forretnings-kontekst er kritisk for step 0):

\`\`\`
qwers

Læs via Filesystem-MCP:
- docs/strategi/vision-og-principper.md
- docs/strategi/stork-2-0-master-plan.md (§0 + §4 byggerækkefølge)
- docs/coordination/mathias-afgoerelser.md (sidste 5 entries)

Sammenfat forretnings-kontekst for pakke '$PAKKE_NAME' i 100 ord:
- Hvilke principper er relevante?
- Hvilke master-plan-paragraffer?
- Hvilke nyere Mathias-afgørelser?
\`\`\`

Hvis pakken er kontekst-let (mikro-pakke / hot-fix): denne sektion er typisk overflødig — udfyld med "_(ikke konsulteret — skip-kriterier opfyldt)_".
EOF
)"

# ============================================================
# Skriv output-fil
# ============================================================

cat > "$OUTPUT_FILE" <<EOF
# Data-grundlag — $PAKKE_NAME

**Pakke:** $PAKKE_NAME
**Step:** 0 (DATA-GRUNDLAG)
**Dato:** $DATE
**Genereret af:** scripts/data-grundlag.sh

Dette dokument samler kontekst FØR krav-fasen, så alle aktører starter på samme grundlag. Skip step 0 hvis: mikro-pakke / hot-fix / kontekst nylig etableret.

---

## Sektion 1: Code-perspektiv (repo-state)

$(cat "$CODE_SECTION")

---

## Sektion 2: Codex-perspektiv (teknisk current-state)

$(cat "$CODEX_SECTION")

---

## Sektion 3: Claude.ai-perspektiv (forretnings-kontekst)

$CLAUDE_SECTION

---

## Næste skridt

1. Mathias gennemgår dokumentet — beslutter om step 0 er tilstrækkelig grundlag, eller om mere kontekst er nødvendig
2. Hvis tilstrækkelig: step 1 (KRAV-FASE) startes
3. Hvis utilstrækkelig: bed Claude.ai om mere forretnings-kontekst via paste-pakken ovenfor
EOF

echo "" >&2
echo "✓ Data-grundlag leveret: $OUTPUT_FILE" >&2
echo "  Næste: Mathias gennemgår, beslutter om step 1 starter." >&2
