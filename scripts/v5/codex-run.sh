#!/usr/bin/env bash
# codex-run.sh — driverens codex-transport (M-39 pkt. 1, 2026-09-08).
#
# Regler: timeout + PRÆCIS ét automatisk genforsøg (ny kørsel, egen provenance,
# SAMME model+effort — en retry må ALDRIG tavst sænke niveauet) · output via -o
# (fil, aldrig kun pipe) · .started/.done-markører · kø-/kørselstid logges ·
# timeout/fejl efter retry = MANGLENDE VERDIKT = exit ≠ 0 (fail-closed BLOKER,
# aldrig fail-open). Model+effort SKAL angives eksplicit (provenance fra
# actors.lock — aldrig implicit lokal config).
#
# Brug: codex-run.sh <workdir> <model> <effort> <timeout-sek> <output-fil> <prompt-fil>
set -u
WORKDIR="$1"; MODEL="$2"; EFFORT="$3"; TIMEOUT_S="$4"; OUT="$5"; PROMPTFIL="$6"
PROV="$OUT.provenance"

run_once() {
  local attempt="$1" t0 t1 rc
  : > "$OUT.attempt$attempt.started"
  t0=$(date +%s)
  timeout --signal=KILL "${TIMEOUT_S}s" \
    codex exec --skip-git-repo-check --sandbox workspace-write \
      -m "$MODEL" -c model_reasoning_effort="$EFFORT" \
      --cd "$WORKDIR" -o "$OUT" "$(cat "$PROMPTFIL")" >> "$OUT.log" 2>&1
  rc=$?
  t1=$(date +%s)
  {
    echo "attempt=$attempt model=$MODEL effort=$EFFORT timeout_s=$TIMEOUT_S rc=$rc varighed_s=$((t1 - t0)) slut=$(date -Is)"
  } >> "$PROV"
  [ $rc -eq 0 ] && : > "$OUT.attempt$attempt.done"
  return $rc
}

echo "start=$(date -Is) workdir=$WORKDIR" >> "$PROV"
if run_once 1; then exit 0; fi
echo "attempt=1 FEJLEDE/TIMEOUT → ét genforsøg (samme model+effort — aldrig tavs sænkning)" >> "$PROV"
if run_once 2; then exit 0; fi
echo "attempt=2 FEJLEDE → MANGLENDE RESULTAT = BLOKER (fail-closed)" >> "$PROV"
exit 1
