#!/usr/bin/env bash
# scripts/codex-review.sh
# Wrapper for Codex CLI review-runder — V5 (disciplin.md §5 severities + §6.1 halt-markers).
#
# Brug:
#   scripts/codex-review.sh <plan-fil> <runde-N> [--xhigh|--quick] [--phase=plan|build|slut-rapport]
#   scripts/codex-review.sh --parse-test
#
# Defaults: xhigh + fast_mode + timeout 480s + file-reference prompt.
# --quick: medium reasoning + timeout 120s + max 150 ord output (til intermediate batch-tjek).
# --xhigh: explicit (default — flag for klarhed når der er valg).
# --parse-test: kør canned fixtures gennem marker-parseren og assertér exit-routing.
#
# Prompt genereres fra disciplin.md V5 §10.4 (inline — ingen prefix-fil).
#
# Output: docs/coordination/codex-reviews/<dato>-<pakke>-runde-<N>.md
#         (med header om command + plan-SHA + raw codex-output)
# Stdout: echoes outputtet samt parser markers per V5 §5/§6.1
#
# Exit-koder:
#   0  = clean eller G-NUMMER-KANDIDAT (fortsæt)
#   1  = STOP-FOR-CLARIFICATION (info-mangel)
#   2  = halt-marker (BRUD-PAA-KRAV / TEKNISK-BLOKERING / PLAN-AFVIGELSE / KRITISK-SIKKERHEDSHUL)
#        ELLER severity-prefix (KRITISK — stopper plan i alle runder per §5)
#   3  = WORKAROUND-INTRODUCERET (Mathias-gate)
#   4  = ESCALATE / AUTO-ESKALATION / NEEDS-MATHIAS (Mathias-judgment kræves før V<n+1>)
#   124 = codex timeout

set -euo pipefail

# ============================================================
# Marker-parsing (V5 §5 severities + §6.1 halt-markers)
# Bracket-tolerant: §10.4-formatet er "[SEVERITY] beskrivelse"; nøgne
# "SEVERITY:"-prefixes accepteres også (gov-docs-renhed R2-1).
# ============================================================

parse_markers() {
  local f="$1"
  local round="${2:-1}"
  local clarification_hit=0 halt_hit=0 severity_hit=0
  local workaround_hit=0 escalate_hit=0 needs_mathias_hit=0

  if grep -qE '^\[?STOP-FOR-CLARIFICATION\]?(\b|:)' "$f"; then
    clarification_hit=1
    echo "  ⏸  STOP-FOR-CLARIFICATION rejst — info-mangel" >&2
  fi

  if grep -qE '^\[?(BRUD-PAA-KRAV|TEKNISK-BLOKERING|PLAN-AFVIGELSE|KRITISK-SIKKERHEDSHUL)\]?(\b|:)' "$f"; then
    halt_hit=1
    echo "  🛑 Halt-marker rejst — kræver LØS-dialog eller eskalation" >&2
  fi

  # Severity-prefix detection (G055-fix, bracket-tolerant per R2-1)
  # KRITISK uden halt-marker er stadig blocker per §5
  # ("KRITISK — stopper plan/build i alle runder").
  # \b efter KRITISK så "KRITISKE" ikke triggers false positive.
  if grep -qE '^\[?KRITISK\]?\b' "$f"; then
    severity_hit=1
    echo "  🛑 KRITISK-severity rejst — stopper plan i alle runder" >&2
  fi

  # MANGLENDE-EKSISTERENDE-BEVARELSE er KRITISK-undertype (§5) — samme routing
  if grep -qE '^\[?MANGLENDE-EKSISTERENDE-BEVARELSE\]?\b' "$f"; then
    severity_hit=1
    echo "  🛑 MANGLENDE-EKSISTERENDE-BEVARELSE rejst (KRITISK-undertype) — stopper" >&2
  fi

  # MELLEM er runde-afhængig (§5 runde-trapper): stopper i runde 1, G-spor i runde 2+
  if grep -qE '^\[?MELLEM\]?\b' "$f"; then
    if [ "$round" = "1" ]; then
      severity_hit=1
      echo "  🛑 MELLEM-severity i runde 1 — stopper (§5 runde-trapper)" >&2
    else
      echo "  📝 MELLEM-severity (runde $round) — G-nummer-spor, fortsæt (§5)" >&2
    fi
  fi

  # NEEDS-MATHIAS — stopper plan og kræver Mathias-afgørelse før V<n+1>
  if grep -qE '^\[?NEEDS-MATHIAS\]?\b' "$f"; then
    needs_mathias_hit=1
    echo "  🚦 NEEDS-MATHIAS rejst — Code må ikke lave V<n+1> før Mathias har afgjort" >&2
  fi

  if grep -qE '^\[?WORKAROUND-INTRODUCERET\]?(\b|:)' "$f"; then
    workaround_hit=1
    echo "  ⚠️  WORKAROUND-INTRODUCERET — Mathias-gate kræves" >&2
  fi

  if grep -qE '^\[?(ESCALATE|AUTO-ESKALATION)\]?(\b|:)' "$f"; then
    escalate_hit=1
    echo "  🚨 ESCALATE/AUTO-ESKALATION — Mathias-judgment via gate-fil" >&2
  fi

  if grep -qE '^\[?OPTIMERING-FORSLAG\]?(\b|:)' "$f"; then
    echo "  💡 OPTIMERING-FORSLAG fundet — Code's valg (ADOPT/DEFER/DISMISS)" >&2
  fi

  if grep -qE '^\[?SPARRING-OENSKE\]?(\b|:)' "$f"; then
    echo "  💬 SPARRING-OENSKE fundet" >&2
  fi

  if grep -qE '^\[?G-NUMMER-KANDIDAT\]?(\b|:)' "$f"; then
    echo "  📝 G-NUMMER-KANDIDAT(er) — log til teknisk-gaeld.md (fortsæt)" >&2
  fi

  if grep -qE '^\[?APPROVAL\]?\b' "$f"; then
    echo "  ✅ APPROVAL" >&2
  fi

  # Exit-koder per routing-tabel (uændret prioritet):
  if [ "$clarification_hit" -eq 1 ]; then return 1; fi
  if [ "$workaround_hit" -eq 1 ]; then return 3; fi
  if [ "$escalate_hit" -eq 1 ]; then return 4; fi
  if [ "$needs_mathias_hit" -eq 1 ]; then return 4; fi
  if [ "$halt_hit" -eq 1 ] || [ "$severity_hit" -eq 1 ]; then return 2; fi
  return 0
}

# ============================================================
# --parse-test: canned fixtures gennem parseren, assertér routing
# (gov-docs-renhed R2-1/R3-2 — fuld dækning af exit-koder 0/1/2/3/4)
# ============================================================

if [ "${1:-}" = "--parse-test" ]; then
  # Format: indhold|runde|forventet-exit
  declare -a FIXTURES=(
    "APPROVAL — Runde 1|1|0"
    "[KRITISK] fund|1|2"
    "KRITISK: fund|1|2"
    "[KRITISK] fund|3|2"
    "KRITISKE detaljer|1|0"
    "[NEEDS-MATHIAS] spørgsmål|1|4"
    "STOP-FOR-CLARIFICATION: mangler X|1|1"
    "[PLAN-AFVIGELSE] afviger fra plan|1|2"
    "WORKAROUND-INTRODUCERET: hack|1|3"
    "[ESCALATE] iter > 3|1|4"
    "[MANGLENDE-EKSISTERENDE-BEVARELSE] gate tabt|2|2"
    "[MELLEM] fund i runde 1|1|2"
    "[MELLEM] fund i runde 2|2|0"
    "MELLEM: fund i runde 3|3|0"
  )
  FAILED=0
  TMP="$(mktemp -t parse-test.XXXXXX)"
  trap 'rm -f "$TMP"' EXIT
  for fixture in "${FIXTURES[@]}"; do
    CONTENT="${fixture%%|*}"
    REST="${fixture#*|}"
    ROUND="${REST%%|*}"
    WANT="${REST##*|}"
    printf '%s\n' "$CONTENT" > "$TMP"
    set +e
    parse_markers "$TMP" "$ROUND" 2>/dev/null
    GOT=$?
    set -e
    if [ "$GOT" = "$WANT" ]; then
      echo "  ✓ '$CONTENT' (runde $ROUND) -> exit $GOT"
    else
      echo "  ✗ '$CONTENT' (runde $ROUND) -> exit $GOT (forventede $WANT)" >&2
      FAILED=1
    fi
  done
  if [ "$FAILED" -eq 1 ]; then
    echo "parse-test FEJLEDE" >&2
    exit 1
  fi
  echo "parse-test: alle fixtures passed"
  exit 0
fi

# ============================================================
# Argument-parsing
# ============================================================

if [ $# -lt 2 ]; then
  cat <<EOF
Usage: $0 <plan-fil> <runde-N> [--xhigh|--quick] [--phase=plan|build|slut-rapport]
       $0 --parse-test

Eksempel:
  $0 docs/coordination/<pakke>-plan.md 1
  $0 docs/coordination/<pakke>-plan.md 2 --quick
  $0 docs/coordination/rapport-historik/<dato>-<pakke>.md 1 --phase=slut-rapport

V5 marker-routing: scriptet parser output for halt-markers + severity-prefixes + positive markers (disciplin §5/§6.1).
Exit-koder:
  0  = clean eller G-NUMMER-KANDIDAT (fortsæt)
  1  = STOP-FOR-CLARIFICATION (info-mangel)
  2  = halt-marker ELLER KRITISK-severity
  3  = WORKAROUND-INTRODUCERET (Mathias-gate)
  4  = ESCALATE / AUTO-ESKALATION / NEEDS-MATHIAS
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

if ! command -v codex >/dev/null 2>&1; then
  echo "❌ codex CLI ikke fundet i PATH. Kør 'codex doctor' for diagnose." >&2
  exit 64
fi

# ============================================================
# Build prompt — genereret fra disciplin.md V5 §10.4 (inline)
# ============================================================

PAKKE_NAME="$(basename "$PLAN_FILE" | sed -E 's/-plan\.md$//; s/\.md$//; s/^[0-9]{4}-[0-9]{2}-[0-9]{2}-//')"
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

STATUS_FILE="docs/coordination/${PAKKE_NAME}-status.md"
KRAV_FILE="docs/coordination/${PAKKE_NAME}-krav-og-data.md"

case "$PHASE" in
  plan|build)
    FORMAAL_LINE='FORMÅL: udledes af "## Formål"-sektionen i '"$PLAN_FILE"'.'
    ;;
  slut-rapport)
    FORMAAL_LINE='FORMÅL (slut-rapport-fase): Verificér at slut-rapporten reflekterer faktisk leverance, plan-afvigelser ærligt, og leverance-tabel mod krav-dok + Stork-invariant-tjek (disciplin §10.3) korrekt.'
    ;;
esac

PROMPT=$(cat <<EOF
Du er Codex i Stork 2.0 — uafhængig kode-reviewer, read-only (disciplin §9.3).

Læs FØR review:
- docs/strategi/vision-og-principper.md
- docs/strategi/forretningsforstaaelse.md (LÅST stamme-doc, D4)
- docs/strategi/disciplin.md §9.3 (din rolle) + §5 (severities) + §8.1
- $KRAV_FILE (pakke-kontrakt — hvis den findes)
- $PLAN_FILE ($PHASE-fasen for pakke $PAKKE_NAME)
- $STATUS_FILE (kontekst + konvergens-counter — hvis den findes)

RUNDE-NUMMER: $ROUND_N
FASE: $PHASE
$FORMAAL_LINE

Review-fokus (§9.3): patch-først (§3.1) · end-to-end-spor (§3.3) ·
state-dump matcher faktisk state (§3.2) · krav-dok-konsistens uden
scope-creep · vision/forretningsforstaaelse-modsigelse ·
MANGLENDE-EKSISTERENDE-BEVARELSE.

Format pr. fund:
[SEVERITY] Kort beskrivelse
Konkret afvigelse: ...
Anbefalet handling: [V<n+1>-rettelse / G-nummer / kosmetisk note]

Berører ændringen en governance-doc: afslut med
"§8.1-SVAR: INGEN-MODSIGELSE" eller "§8.1-SVAR: MODSIGELSE — <hvad>".

Max $MAX_WORDS ord. Hvis ingen fund: skriv "APPROVAL — Runde $ROUND_N".
EOF
)

# ============================================================
# Eksekvér med hard timeout + non-json (live tail-friendly)
# stdin lukkes — codex exec uden TTY hænger ellers på
# "Reading additional input from stdin..." (gov-docs-renhed fund 6)
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
  "$PROMPT" > "$RAW_OUTPUT" 2>&1 < /dev/null
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
# Ekstrahér finalt svar fra codex-transcript
# Transcriptet echo'er læste filer/tool-trace — markers dér er citater, ikke
# fund (fx tidligere reviews' "[KRITISK]"-linjer). Final answer er sidste
# "codex"-blok før "tokens used". Fallback: hele output (format-skift).
# ============================================================

FINAL_OUTPUT="$(mktemp -t codex-review-final.XXXXXX)"
trap 'rm -f "$RAW_OUTPUT" "$FINAL_OUTPUT"' EXIT
awk '/^codex$/{n=NR} {l[NR]=$0} /^tokens used/{t=NR} END{if(n&&t&&t>n){for(i=n+1;i<t;i++) print l[i]}}' "$RAW_OUTPUT" > "$FINAL_OUTPUT"
if [ ! -s "$FINAL_OUTPUT" ]; then
  echo "⚠️  Kunne ikke isolere finalt codex-svar (format-skift?) — parser hele transcriptet." >&2
  cp "$RAW_OUTPUT" "$FINAL_OUTPUT"
fi

# ============================================================
# Skriv output-fil med header
# ============================================================

case "$REASONING" in
  xhigh)  REASONING_FLAG="--xhigh" ;;
  medium) REASONING_FLAG="--quick" ;;
  *)      REASONING_FLAG="" ;;
esac
RERUN_CMD="$0 $PLAN_FILE $ROUND_N $REASONING_FLAG --phase=$PHASE"

cat > "$OUTPUT_FILE" <<EOF
# Codex review — $PAKKE_NAME runde $ROUND_N

**Pakke:** $PAKKE_NAME
**Fase:** $PHASE
**Plan-fil:** $PLAN_FILE
**Plan-SHA:** $PLAN_SHA
**Dato:** $DATE
**Reasoning:** $REASONING
**Max ord:** $MAX_WORDS
**Command:** \`$RERUN_CMD\` (re-run via samme args inkl. flags)

---

EOF
cat "$FINAL_OUTPUT" >> "$OUTPUT_FILE"

# ============================================================
# Marker-parsing (på finalt svar) + echo output + exit per routing
# ============================================================

echo "" >&2
echo "▶ Marker-parsing:" >&2

set +e
parse_markers "$FINAL_OUTPUT" "$ROUND_N"
ROUTING_EXIT=$?
set -e

echo "" >&2
echo "▶ Output:" >&2
cat "$FINAL_OUTPUT"

exit $ROUTING_EXIT
