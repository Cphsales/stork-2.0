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
  # isolation pr. forsøg (batch-pas-fund): fjern gammel output FØR kørsel, så et
  # rc=0 uden NY levering aldrig godkender forrige kørsels/forsøgs fil
  rm -f "$OUT" || { echo "attempt=$attempt OPRYDNING FEJLEDE (rm $OUT) → BLOKER" >> "$PROV"; exit 1; }
  [ -e "$OUT" ] && { echo "attempt=$attempt gammel output KUNNE IKKE fjernes → BLOKER" >> "$PROV"; exit 1; }
  : > "$OUT.attempt$attempt.started"
  t0=$(date +%s)
  timeout --signal=KILL "${TIMEOUT_S}s" \
    codex exec --skip-git-repo-check --sandbox workspace-write \
      -m "$MODEL" -c model_reasoning_effort="$EFFORT" \
      --cd "$WORKDIR" -o "$OUT" "$(cat "$PROMPTFIL")" < /dev/null >> "$OUT.log" 2>&1
  rc=$?
  t1=$(date +%s)
  {
    echo "attempt=$attempt model=$MODEL effort=$EFFORT timeout_s=$TIMEOUT_S rc=$rc varighed_s=$((t1 - t0)) slut=$(date -Is)"
  } >> "$PROV"
  # succes = rc 0 OG reel leverance (ikke-tom output-fil) — et dræbt/afbrudt
  # codex kan exite 0 uden at have skrevet last-message (observeret 2026-09-08:
  # pkill → rc=0, ingen fil = fail-open-fælde)
  if [ $rc -eq 0 ] && [ -s "$OUT" ]; then : > "$OUT.attempt$attempt.done"; return 0; fi
  [ $rc -eq 0 ] && echo "attempt=$attempt rc=0 men TOM/MANGLENDE output-fil → tælles som FEJL (fail-closed)" >> "$PROV"
  return 1
}

# ryd stale markører fra tidligere kørsler (gamle .done må ikke overleve en ny fejlet kørsel)
rm -f "$OUT".attempt*.done "$OUT".attempt*.started || { echo "markør-oprydning fejlede → BLOKER" >> "$PROV"; exit 1; }
ls "$OUT".attempt*.done >/dev/null 2>&1 && { echo "stale .done kunne ikke fjernes → BLOKER" >> "$PROV"; exit 1; }
echo "start=$(date -Is) workdir=$WORKDIR" >> "$PROV"
if run_once 1; then exit 0; fi
echo "attempt=1 FEJLEDE/TIMEOUT → ét genforsøg (samme model+effort — aldrig tavs sænkning)" >> "$PROV"
if run_once 2; then exit 0; fi
echo "attempt=2 FEJLEDE → MANGLENDE RESULTAT = BLOKER (fail-closed)" >> "$PROV"
exit 1
