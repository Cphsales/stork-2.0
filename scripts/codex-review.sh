#!/usr/bin/env bash
# scripts/codex-review.sh
# Wrapper for Codex CLI review-runder (V5.3 marker-protocol).
#
# Brug:
#   scripts/codex-review.sh <plan-fil> <runde-N> [--xhigh|--quick] [--phase=plan|build|slut-rapport]
#
# Defaults: xhigh + fast_mode + timeout 480s + file-reference prompt + tail-monitor.
# --quick: medium reasoning + timeout 120s + max 150 ord output (til intermediate batch-tjek).
# --xhigh: explicit (default — flag for klarhed når der er valg).
#
# Output: docs/coordination/codex-reviews/<dato>-<pakke>-runde-<N>.md
#         (med header om command + plan-SHA + raw codex-output)
# Stdout: echoes outputtet samt parser markers per V5.3 marker-protokol

set -euo pipefail

# ============================================================
# Argument-parsing
# ============================================================

if [ $# -lt 2 ]; then
  cat <<EOF
Usage: $0 <plan-fil> <runde-N> [--xhigh|--quick] [--phase=plan|build|slut-rapport]

Eksempel:
  $0 docs/coordination/Lag1-plan.md 1
  $0 docs/coordination/Lag1-plan.md 2 --quick
  $0 docs/coordination/rapport-historik/2026-05-20-Lag1.md 1 --phase=slut-rapport

V5.3 marker-protokol: scriptet parser output for halt-markers + log-markers + positive markers.
Exit-koder:
  0  = clean eller G-NUMMER-KANDIDAT (fortsæt)
  1  = STOP-FOR-CLARIFICATION (info-mangel)
  2  = BRUD-PAA-KRAV / TEKNISK-BLOKERING / PLAN-AFVIGELSE / KRITISK-SIKKERHEDSHUL (halt)
  3  = WORKAROUND-INTRODUCERET (Mathias-gate)
  4  = ESCALATE-konsensus eller iter > 3 auto-eskalation
  124 = codex timeout
EOF
  exit 64
fi

PLAN_FILE="$1"
ROUND_N="$2"
shift 2

REASONING="xhigh"
TIMEOUT_SEC="${CODEX_TIMEOUT:-480}"
PHASE="plan"
MAX_WORDS="350"

while [ $# -gt 0 ]; do
  case "$1" in
    --xhigh) REASONING="xhigh"; shift ;;
    --quick) REASONING="medium"; TIMEOUT_SEC="${CODEX_QUICK_TIMEOUT:-120}"; MAX_WORDS="150"; shift ;;
    --phase=*) PHASE="${1#--phase=}"; shift ;;
    *) echo "Ukendt flag: $1" >&2; exit 64 ;;
  esac
done

# ============================================================
# Pre-flight verifikation
# ============================================================

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$REPO_ROOT" ]; then
  echo "❌ scripts/codex-review.sh skal køres inde i et git-repo." >&2
  exit 64
fi
cd "$REPO_ROOT"

if [ ! -f "$PLAN_FILE" ]; then
  echo "❌ Plan-fil findes ikke: $PLAN_FILE" >&2
  exit 64
fi

PREFIX_FILE="docs/skabeloner/codex-review-prompt.md"
if [ ! -f "$PREFIX_FILE" ]; then
  echo "❌ Niveau 1-prefix-fil findes ikke: $PREFIX_FILE" >&2
  exit 64
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "❌ codex CLI ikke fundet i PATH. Kør 'codex doctor' for diagnose." >&2
  exit 64
fi

# ============================================================
# Build prompt — file-reference > embedded content
# (V5.3 workflow-skabelon tooling-disciplin #3)
# ============================================================

PAKKE_NAME="$(basename "$PLAN_FILE" | sed -E 's/-plan\.md$//; s/\.md$//')"
DATE="$(date +%Y-%m-%d)"

case "$PHASE" in
  plan)         OUTPUT_DIR="docs/coordination/codex-reviews" ;;
  build)        OUTPUT_DIR="docs/coordination/codex-reviews" ;;
  slut-rapport) OUTPUT_DIR="docs/coordination/codex-reviews" ;;
  *) echo "❌ Ukendt --phase: $PHASE (forventet: plan|build|slut-rapport)" >&2; exit 64 ;;
esac

mkdir -p "$OUTPUT_DIR"
OUTPUT_FILE="${OUTPUT_DIR}/${DATE}-${PAKKE_NAME}-runde-${ROUND_N}.md"

PLAN_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo 'uncommitted')"

PROMPT=$(cat <<EOF
Læs disse filer:
1. $PREFIX_FILE (niveau 1-prefix — anvend ordret)
2. $PLAN_FILE ($PHASE-fasen for pakke $PAKKE_NAME)

RUNDE-NUMMER: $ROUND_N
FASE: $PHASE
FORMÅL: udledes af "## Formål"-sektionen i $PLAN_FILE.

Følg niveau 1-prefixens scope-krav + marker-protokol + dialog-regler.

Max $MAX_WORDS ord output. Brug marker-format fra niveau 1-prefix (KRITISK/MELLEM/LAV/HUL/OPTIMERING-FORSLAG/G-NUMMER-KANDIDAT etc.). Hvis du ikke har fund: skriv "APPROVAL — Runde $ROUND_N".
EOF
)

# ============================================================
# Eksekvér med hard timeout + non-json (live tail-friendly)
# ============================================================

RAW_OUTPUT="$(mktemp -t codex-review-raw.XXXXXX)"
trap 'rm -f "$RAW_OUTPUT"' EXIT

echo "▶ codex review (runde $ROUND_N, reasoning=$REASONING, timeout=${TIMEOUT_SEC}s)" >&2
echo "  Plan: $PLAN_FILE" >&2
echo "  Output: $OUTPUT_FILE" >&2
echo "" >&2

set +e
timeout --signal=KILL "$TIMEOUT_SEC" codex exec --skip-git-repo-check \
  -c "model_reasoning_effort=\"$REASONING\"" \
  --enable fast_mode \
  "$PROMPT" > "$RAW_OUTPUT" 2>&1
CODEX_EXIT=$?
set -e

if [ $CODEX_EXIT -eq 124 ] || [ $CODEX_EXIT -eq 137 ]; then
  echo "❌ codex timed out efter ${TIMEOUT_SEC}s." >&2
  echo "  Sidste output gemt i $RAW_OUTPUT (kopier til $OUTPUT_FILE manuelt hvis nyttig)." >&2
  cp "$RAW_OUTPUT" "$OUTPUT_FILE"
  exit 124
fi

if [ $CODEX_EXIT -ne 0 ]; then
  echo "❌ codex fejlede (exit $CODEX_EXIT)." >&2
  echo "  Output:" >&2
  tail -10 "$RAW_OUTPUT" >&2
  exit $CODEX_EXIT
fi

# ============================================================
# Skriv output-fil med header
# ============================================================

cat > "$OUTPUT_FILE" <<EOF
# Codex review — $PAKKE_NAME runde $ROUND_N

**Pakke:** $PAKKE_NAME
**Fase:** $PHASE
**Plan-fil:** $PLAN_FILE
**Plan-SHA:** $PLAN_SHA
**Dato:** $DATE
**Reasoning:** $REASONING
**Max ord:** $MAX_WORDS
**Command:** \`$0 $PLAN_FILE $ROUND_N\` (re-run via samme args)

---

EOF
cat "$RAW_OUTPUT" >> "$OUTPUT_FILE"

# ============================================================
# Marker-parsing (V5.3 marker-protokol)
# ============================================================

echo "" >&2
echo "▶ Marker-parsing:" >&2

HALT_HIT=0
WORKAROUND_HIT=0
CLARIFICATION_HIT=0
ESCALATE_HIT=0

if grep -qE '^(STOP-FOR-CLARIFICATION):' "$RAW_OUTPUT"; then
  CLARIFICATION_HIT=1
  echo "  ⏸  STOP-FOR-CLARIFICATION rejst — info-mangel" >&2
fi

if grep -qE '^(BRUD-PAA-KRAV|TEKNISK-BLOKERING|PLAN-AFVIGELSE|KRITISK-SIKKERHEDSHUL):' "$RAW_OUTPUT"; then
  HALT_HIT=1
  echo "  🛑 Halt-marker rejst — kræver LØS-dialog eller eskalation" >&2
fi

if grep -qE '^(WORKAROUND-INTRODUCERET):' "$RAW_OUTPUT"; then
  WORKAROUND_HIT=1
  echo "  ⚠️  WORKAROUND-INTRODUCERET — Mathias-gate kræves" >&2
fi

if grep -qE '^(ESCALATE|AUTO-ESKALATION):' "$RAW_OUTPUT"; then
  ESCALATE_HIT=1
  echo "  🚨 ESCALATE/AUTO-ESKALATION — Mathias-judgment via gate-fil" >&2
fi

if grep -qE '^(OPTIMERING-FORSLAG):' "$RAW_OUTPUT"; then
  echo "  💡 OPTIMERING-FORSLAG fundet — Code's valg (ADOPT/DEFER/DISMISS)" >&2
fi

if grep -qE '^(SPARRING-OENSKE):' "$RAW_OUTPUT"; then
  echo "  💬 SPARRING-OENSKE fundet" >&2
fi

if grep -qE '^(G-NUMMER-KANDIDAT):' "$RAW_OUTPUT"; then
  echo "  📝 G-NUMMER-KANDIDAT(er) — log til teknisk-gaeld.md (fortsæt)" >&2
fi

if grep -qE '^APPROVAL\b' "$RAW_OUTPUT"; then
  echo "  ✅ APPROVAL" >&2
fi

# ============================================================
# Echo output + exit per marker-priority
# ============================================================

echo "" >&2
echo "▶ Output:" >&2
cat "$RAW_OUTPUT"

# Exit-koder per V5.3 routing-tabel:
if [ "$CLARIFICATION_HIT" -eq 1 ]; then
  exit 1
fi
if [ "$WORKAROUND_HIT" -eq 1 ]; then
  exit 3
fi
if [ "$ESCALATE_HIT" -eq 1 ]; then
  exit 4
fi
if [ "$HALT_HIT" -eq 1 ]; then
  exit 2
fi

exit 0
