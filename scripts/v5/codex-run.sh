#!/usr/bin/env bash
# codex-run.sh — fabrikkens codex-transport v2 (M-39 pkt. 1 · M-41 Trin A3/A4/A5/A7, 2026-09-09).
#
# ROLLEN BESTEMMER KALDET (GRUNDPLAN-v2 princip 7 / validering V-F2): model + effort
# afledes af actors.lock.json[rolle] — ALDRIG af argumenter, prompt eller lokal
# ~/.codex/config. Det faktisk kørte logges i provenance.
# FABRIK-FRYS (princip 8): rolleteksten @ HEAD SKAL matche lock.skill_oid, ellers
# BLOKER FØR kaldet — et aktør-kald må ikke starte på en rolle der ikke er endelig.
# SANDBOX EFTER AKTIVITET (V-8): dom → read-only · produktion → workspace-write.
# Uændret fra v1: timeout + PRÆCIS ét genforsøg (SAMME model+effort — en retry må
# ALDRIG tavst sænke niveauet) · output via -o (fil) · stdin LUKKET (</dev/null —
# rodårsagen til alle hæng 2026-09-08) · succes = rc 0 OG ikke-tom output-fil ·
# .started/.done-markører · fejl efter retry = MANGLENDE RESULTAT = exit ≠ 0.
# Nyt: PID-fil ($OUT.pid → `kill -TERM $(cat pid)`; timeout videresender TERM —
# ALDRIG brede pkill-mønstre) · separat stderr-log ($OUT.stderr.log) · provenance
# m. rolle/model/effort/sandbox/service_tier/codex-version/regel-commit/lock-blob/
# skill-oid/attempt/rc/varighed (monotont SECONDS + vægur — WSL2-anomali 2026-09-08).
#
# Brug: codex-run.sh <rolle> <dom|produktion> <workdir> <timeout-sek> <output-fil> <prompt-fil>
# Env: STORK_V5_LOCK / STORK_V5_REPO overrider KUN under STORK_V5_SELFTEST=1 — en
# fremmed lås eller et fremmed repo ville ellers omgå fabrik-frysen (peg på en lås
# med lavere effort / et repo hvor HEAD matcher hvad som helst). Under selftest
# skrives lock=OVERRIDE(selftest) i provenance, og verdikt-byg.mjs AFVISER en
# sådan provenance som gate-evidens (fail-closed begge veje).
set -u
if [ $# -ne 6 ]; then
  echo "brug: codex-run.sh <rolle> <dom|produktion> <workdir> <timeout-sek> <output-fil> <prompt-fil>" >&2
  exit 2
fi
ROLLE="$1"; AKT="$2"; WORKDIR="$3"; TIMEOUT_S="$4"; OUT="$5"; PROMPTFIL="$6"
PROV="$OUT.provenance"; PIDFIL="$OUT.pid"; ERRLOG="$OUT.stderr.log"
REPO_STD="$(cd "$(dirname "$0")/../.." && pwd)"
REPO="$REPO_STD"; LOCK="$REPO_STD/scripts/v5/actors.lock.json"; LOCK_MODE="committed"

blok() { echo "BLOKER: $*" | tee -a "$PROV" >&2; exit 1; }

if [ -n "${STORK_V5_LOCK:-}" ] || [ -n "${STORK_V5_REPO:-}" ]; then
  [ "${STORK_V5_SELFTEST:-}" = "1" ] || blok "STORK_V5_LOCK/STORK_V5_REPO er sat uden STORK_V5_SELFTEST=1 — override af lås/repo omgår fabrik-frysen og er kun tilladt i selvtest"
  REPO="${STORK_V5_REPO:-$REPO_STD}"; LOCK="${STORK_V5_LOCK:-$REPO/scripts/v5/actors.lock.json}"; LOCK_MODE="OVERRIDE(selftest)"
fi

case "$AKT" in
  dom) SANDBOX="read-only" ;;
  produktion) SANDBOX="workspace-write" ;;
  *) blok "ukendt aktivitet '$AKT' (dom|produktion)" ;;
esac
case "$TIMEOUT_S" in ''|*[!0-9]*) blok "timeout skal være heltal-sekunder, fik '$TIMEOUT_S'" ;; esac
[ -f "$PROMPTFIL" ] || blok "prompt-fil findes ikke: $PROMPTFIL"
[ -d "$WORKDIR" ] || blok "workdir findes ikke: $WORKDIR"
[ -f "$LOCK" ] || blok "actors.lock mangler: $LOCK"

# rolle → model/effort/skill fra LÅSEN (node — ingen jq-afhængighed)
LOCKINFO=$(node -e '
  const l = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
  const r = Object.prototype.hasOwnProperty.call(l, process.argv[2]) ? l[process.argv[2]] : null;
  if (!r || typeof r !== "object") process.exit(3);
  for (const k of ["model","reasoning","skill_path","skill_oid","aktoer"]) if (typeof r[k] !== "string" || !r[k]) process.exit(4);
  console.log([r.model, r.reasoning, r.skill_path, r.skill_oid, r.aktoer].join(" "));' "$LOCK" "$ROLLE" 2>/dev/null) \
  || blok "rolle '$ROLLE' findes ikke (eller er ufuldstændig) i $LOCK"
read -r MODEL EFFORT SKILL_PATH SKILL_OID AKTOER <<<"$LOCKINFO"
[ "$AKTOER" = "codex" ] || blok "rolle '$ROLLE' er ikke en codex-rolle (aktoer=$AKTOER) — forkert transport"

# fabrik-frys: rolletekst @ HEAD == låsen (drift → BLOKER før kaldet)
REGEL_COMMIT=$(git -C "$REPO" rev-parse HEAD 2>/dev/null) || blok "kan ikke læse HEAD i $REPO"
HEAD_SKILL=$(git -C "$REPO" rev-parse "HEAD:$SKILL_PATH" 2>/dev/null) || blok "rolletekst $SKILL_PATH findes ikke @ HEAD ($REGEL_COMMIT)"
[ "$HEAD_SKILL" = "$SKILL_OID" ] || blok "rolletekst-drift: lock.skill_oid=${SKILL_OID:0:12} ≠ HEAD:$SKILL_PATH=${HEAD_SKILL:0:12} — regenerér actors.lock i ren commit FØR aktør-kald"
LOCK_BLOB=$(git -C "$REPO" hash-object "$LOCK" 2>/dev/null || echo "ukendt")
if [ "$LOCK_MODE" = "committed" ]; then
  HEAD_LOCK=$(git -C "$REPO" rev-parse "HEAD:scripts/v5/actors.lock.json" 2>/dev/null) || blok "actors.lock.json findes ikke @ HEAD"
  [ "$LOCK_BLOB" = "$HEAD_LOCK" ] || blok "actors.lock.json i arbejdstræet (${LOCK_BLOB:0:12}) ≠ HEAD (${HEAD_LOCK:0:12}) — commit låsen FØR aktør-kald (fabrik-frys)"
fi
CODEX_VER=$(codex --version 2>/dev/null | head -1)
CODEX_VER=${CODEX_VER:-ukendt}

run_once() {
  local attempt="$1" s0 t0 t1 rc pid
  # isolation pr. forsøg: fjern gammel output FØR kørsel, så rc=0 uden NY levering
  # aldrig godkender forrige forsøgs fil
  rm -f "$OUT" || { echo "attempt=$attempt OPRYDNING FEJLEDE (rm $OUT) → BLOKER" >> "$PROV"; exit 1; }
  [ -e "$OUT" ] && { echo "attempt=$attempt gammel output KUNNE IKKE fjernes → BLOKER" >> "$PROV"; exit 1; }
  : > "$OUT.attempt$attempt.started"
  s0=$SECONDS; t0=$(date +%s)
  timeout --signal=KILL "${TIMEOUT_S}s" \
    codex exec --skip-git-repo-check --sandbox "$SANDBOX" \
      -m "$MODEL" -c model_reasoning_effort="$EFFORT" \
      --cd "$WORKDIR" -o "$OUT" "$(cat "$PROMPTFIL")" < /dev/null >> "$OUT.log" 2>> "$ERRLOG" &
  pid=$!
  echo "$pid" > "$PIDFIL"
  wait "$pid"; rc=$?
  t1=$(date +%s)
  echo "attempt=$attempt rolle=$ROLLE model=$MODEL effort=$EFFORT sandbox=$SANDBOX timeout_s=$TIMEOUT_S rc=$rc varighed_mono_s=$((SECONDS - s0)) varighed_vaeg_s=$((t1 - t0)) slut=$(date -Is)" >> "$PROV"
  # succes = rc 0 OG reel leverance (ikke-tom output) — et dræbt/afbrudt codex kan
  # exite 0 uden at have skrevet last-message (observeret 2026-09-08)
  if [ "$rc" -eq 0 ] && [ -s "$OUT" ]; then : > "$OUT.attempt$attempt.done"; return 0; fi
  [ "$rc" -eq 0 ] && echo "attempt=$attempt rc=0 men TOM/MANGLENDE output-fil → tælles som FEJL (fail-closed)" >> "$PROV"
  return 1
}

# ryd stale markører (gamle .done må ikke overleve en ny fejlet kørsel)
rm -f "$OUT".attempt*.done "$OUT".attempt*.started "$PIDFIL" || { echo "markør-oprydning fejlede → BLOKER" >> "$PROV"; exit 1; }
ls "$OUT".attempt*.done >/dev/null 2>&1 && { echo "stale .done kunne ikke fjernes → BLOKER" >> "$PROV"; exit 1; }
echo "start=$(date -Is) rolle=$ROLLE aktivitet=$AKT model=$MODEL effort=$EFFORT sandbox=$SANDBOX service_tier=default codex=$CODEX_VER regel_commit=$REGEL_COMMIT lock=$LOCK_MODE lock_blob=$LOCK_BLOB skill=$SKILL_PATH@${SKILL_OID:0:12} workdir=$WORKDIR" >> "$PROV"
if run_once 1; then rm -f "$PIDFIL"; exit 0; fi
echo "attempt=1 FEJLEDE/TIMEOUT → ét genforsøg (samme model+effort — aldrig tavs sænkning)" >> "$PROV"
if run_once 2; then rm -f "$PIDFIL"; exit 0; fi
rm -f "$PIDFIL"
echo "attempt=2 FEJLEDE → MANGLENDE RESULTAT = BLOKER (fail-closed)" >> "$PROV"
exit 1
