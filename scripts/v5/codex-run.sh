#!/usr/bin/env bash
# codex-run.sh — fabrikkens codex-transport v3 (M-39 pkt. 1 · M-41 Trin A3/A4/A5/A7 · P2-pas 2026-09-09 FAIL(9) → v3).
#
# ROLLEN BESTEMMER KALDET (princip 7): model + effort + ROLLETEKST afledes af den
# PINNEDE lås (`git show <HEAD-commit>:scripts/v5/actors.lock.json`) — aldrig af
# argumenter, prompt, arbejdstræ eller ~/.codex/config. Rolleteksten sendes FAKTISK
# til Codex (P2 F-5): prompten = rolletekst@skill_oid + opgave-tekst; dens sha256 står i
# kvitteringen. FABRIK-FRYS (princip 8): skill_oid == <commit>:<skill_path> og
# arbejdstræets lås == pinned lås, ellers BLOKER FØR kaldet. Self-sti via realpath
# (P2 F-4: symlink til wrapperen fra et fremmed repo pegede frysen forkert); git-miljø
# renses før første git-kald (GIT_DIR m.fl.).
# BINÆRER PINNES (P2 F-3): codex/git/node/timeout resolves til realpath under
# renset PATH; codex SKAL ligge under et kendt prefix (nvm/usr) medmindre selvtest;
# realpath + sha256 for alle fire står i kvitteringen. En PATH-injiceret falsk codex
# blokeres — fuld tillid (signeret kvittering fra betroet runner) er CI-actor-
# runnerens bord og en DEKLARERET RESIDUAL indtil da (plan 2.F / P-1).
# SANDBOX EFTER AKTIVITET (V-8): dom → read-only · produktion → workspace-write.
# OUTPUT PR. FORSØG, PRIVAT (P2 F-7): hvert forsøg skriver til $OUT.attemptN.out;
# publiceres til $OUT med mv KUN hvis rc=0 ∧ almindelig fil ∧ ikke symlink ∧ ikke tom;
# samme OUT serialiseres med flock; OUT må IKKE ligge i workdir (aktøren kunne
# ellers skrive den). Markører ryddes FØRST (P2 F-6), så en BLOKER aldrig efterlader
# en gammel .done.
# KVITTERING (P2 F-1/F-2): $OUT.receipt.json — STRUKTURERET, overskrives pr. kørsel
# (ikke appendet fritekst): status · run_id · rolle · model · effort · sandbox ·
# regel_commit · lock_blob · skill_oid · prompt_sha256 · binaries · attempts[{rc,
# output_sha256, output_bytes, …}]. verdikt-byg.mjs læser KUN kvitteringen og binder
# leverancens bytes (sha256) til den. $OUT.provenance er menneske-læselig log, ikke
# autoritet.
# Uændret: timeout + PRÆCIS ét genforsøg (SAMME model/effort/sandbox) · stdin LUKKET ·
# PID-fil ($OUT.pid, kill -TERM; timeout videresender) · separat stderr-log.
#
# Brug: codex-run.sh <rolle> <dom|produktion> <workdir> <timeout-sek≥1> <output-fil> <prompt-fil>
# Selvtest (KUN m. STORK_V5_SELFTEST=1): STORK_V5_LOCK=<lås> (→ lock=OVERRIDE(selftest),
# afvises af verdikt-byg) · STORK_V5_REPO=<repo> (frys mod det repo, stadig "committed").
set -u
umask 077
# git-/shell-miljø renses FØR noget kald (P2 F-4: GIT_DIR kunne pege opslag væk fra $REPO)
unset GIT_DIR GIT_WORK_TREE GIT_COMMON_DIR GIT_INDEX_FILE GIT_OBJECT_DIRECTORY \
  GIT_ALTERNATE_OBJECT_DIRECTORIES GIT_NAMESPACE GIT_CEILING_DIRECTORIES \
  GIT_DISCOVERY_ACROSS_FILESYSTEM GIT_CONFIG_PARAMETERS GIT_EXTERNAL_DIFF GIT_PAGER \
  BASH_ENV ENV CDPATH
IFS=$' \t\n'   # eksplicit standard-IFS (aldrig arv fra kalderen; unset IFS ville nulstille word-splitting)
export GIT_TERMINAL_PROMPT=0

if [ $# -ne 6 ]; then
  echo "brug: codex-run.sh <rolle> <dom|produktion> <workdir> <timeout-sek> <output-fil> <prompt-fil>" >&2
  exit 2
fi
ROLLE="$1"; AKT="$2"; WORKDIR="$3"; TIMEOUT_S="$4"; OUT="$5"; PROMPTFIL="$6"
PROV="$OUT.provenance"; RECEIPT="$OUT.receipt.json"; PIDFIL="$OUT.pid"; ERRLOG="$OUT.stderr.log"; LOCKF="$OUT.lock"
SELFTEST=0; [ "${STORK_V5_SELFTEST:-}" = "1" ] && SELFTEST=1
RUN_ID="$(date +%Y%m%dT%H%M%S)-$$-$RANDOM"
STARTED="$(date -Is)"
STATUS="blokeret"; ATTEMPTS_JSON="[]"
MODEL=""; EFFORT=""; SANDBOX=""; SKILL_PATH=""; SKILL_OID=""; REGEL_COMMIT=""; LOCK_BLOB=""; LOCK_MODE=""; PROMPT_SHA=""
CODEX_VER=""; BIN_JSON="{}"

# --- markør-oprydning FØRST (P2 F-6): en BLOKER må aldrig efterlade gamle grønne markører ---
rm -f -- "$OUT".attempt*.done "$OUT".attempt*.started "$OUT".attempt*.out "$PIDFIL" "$RECEIPT" 2>/dev/null \
  || { echo "BLOKER: markør-oprydning fejlede" | tee -a "$PROV" >&2; exit 1; }
ls "$OUT".attempt*.done >/dev/null 2>&1 && { echo "BLOKER: stale .done kunne ikke fjernes" | tee -a "$PROV" >&2; exit 1; }

skriv_kvittering() {
  # struktureret, OVERSKRIVES (aldrig appendet) — node bygger JSON så escaping er korrekt
  RUN_ID="$RUN_ID" STATUS="$STATUS" REASON="${1:-}" ROLLE="$ROLLE" AKT="$AKT" MODEL="$MODEL" EFFORT="$EFFORT" \
  SANDBOX="$SANDBOX" REGEL_COMMIT="$REGEL_COMMIT" LOCK_MODE="$LOCK_MODE" LOCK_BLOB="$LOCK_BLOB" SKILL_PATH="$SKILL_PATH" \
  SKILL_OID="$SKILL_OID" PROMPT_SHA="$PROMPT_SHA" WORKDIR="$WORKDIR" OUT="$OUT" CODEX_VER="$CODEX_VER" BIN_JSON="$BIN_JSON" \
  ATTEMPTS_JSON="$ATTEMPTS_JSON" STARTED="$STARTED" ENDED="$(date -Is)" \
  "${NODE:-node}" -e '
    const e = process.env;
    const r = { schema_version: 1, status: e.STATUS, run_id: e.RUN_ID, rolle: e.ROLLE, aktivitet: e.AKT,
      model: e.MODEL, effort: e.EFFORT, sandbox: e.SANDBOX, service_tier: "default", codex_version: e.CODEX_VER,
      regel_commit: e.REGEL_COMMIT, lock_mode: e.LOCK_MODE, lock_blob: e.LOCK_BLOB, skill_path: e.SKILL_PATH,
      skill_oid: e.SKILL_OID, prompt_sha256: e.PROMPT_SHA, workdir: e.WORKDIR, out: e.OUT,
      binaries: JSON.parse(e.BIN_JSON || "{}"), attempts: JSON.parse(e.ATTEMPTS_JSON || "[]"),
      started: e.STARTED, ended: e.ENDED };
    if (e.REASON) r.reason = e.REASON;
    process.stdout.write(JSON.stringify(r, null, 1) + "\n");' > "$RECEIPT.tmp" && mv -f -- "$RECEIPT.tmp" "$RECEIPT"
}
blok() { echo "BLOKER: $*" | tee -a "$PROV" >&2; STATUS="blokeret"; skriv_kvittering "$*" 2>/dev/null; rm -f -- "$PIDFIL"; exit 1; }

# --- aktivitet / timeout / stier ---
case "$AKT" in
  dom) SANDBOX="read-only" ;;
  produktion) SANDBOX="workspace-write" ;;
  *) blok "ukendt aktivitet '$AKT' (dom|produktion)" ;;
esac
case "$TIMEOUT_S" in ''|*[!0-9]*) blok "timeout skal være heltal-sekunder, fik '$TIMEOUT_S'" ;; esac
[ "$TIMEOUT_S" -ge 1 ] || blok "timeout skal være ≥ 1 s (0 = ingen grænse = fail-open)"
[ -d "$WORKDIR" ] || blok "workdir findes ikke: $WORKDIR"
WD_REAL=$(realpath -e -- "$WORKDIR") || blok "workdir kan ikke resolves"
OUT_DIR_REAL=$(realpath -m -- "$(dirname -- "$OUT")") || blok "output-mappe kan ikke resolves"
case "$OUT_DIR_REAL/" in "$WD_REAL/"*) blok "output-fil må IKKE ligge i workdir ($WD_REAL) — aktøren kunne skrive den (P2 F-7)" ;; esac
[ -d "$OUT_DIR_REAL" ] || blok "output-mappe findes ikke: $OUT_DIR_REAL"
[ -f "$PROMPTFIL" ] && [ ! -L "$PROMPTFIL" ] || blok "prompt-fil findes ikke eller er symlink: $PROMPTFIL"

# --- binærer pinnes (P2 F-3): renset PATH → realpath + sha256; codex under kendt prefix ---
CLEAN_PATH=""
IFS=: read -r -a PATH_DELE <<<"${PATH:-}"
for d in "${PATH_DELE[@]}"; do case "$d" in /*) CLEAN_PATH="${CLEAN_PATH:+$CLEAN_PATH:}$d" ;; esac; done
export PATH="$CLEAN_PATH"
resolve_bin() { local p; p=$(command -v -- "$1" 2>/dev/null) || return 1; realpath -e -- "$p"; }
GIT=$(resolve_bin git) || blok "git ikke fundet"
NODE=$(resolve_bin node) || blok "node ikke fundet"
TIMEOUT=$(resolve_bin timeout) || blok "timeout ikke fundet"
CODEX=$(resolve_bin codex) || blok "codex ikke fundet"
if [ "$SELFTEST" -ne 1 ]; then
  case "$CODEX" in
    "$HOME"/.nvm/versions/node/*/bin/*|"$HOME"/.nvm/versions/node/*/lib/node_modules/*|/usr/local/bin/*|/usr/local/lib/node_modules/*|/usr/bin/*|/usr/lib/node_modules/*) ;;
    *) blok "codex-binær uden for pinnet prefix: $CODEX (PATH-injektion? P2 F-3)" ;;
  esac
fi
sha_of() { sha256sum -- "$1" | cut -d' ' -f1; }
BIN_JSON=$(printf '{"codex":{"path":"%s","sha256":"%s"},"git":{"path":"%s","sha256":"%s"},"node":{"path":"%s","sha256":"%s"},"timeout":{"path":"%s","sha256":"%s"}}' \
  "$CODEX" "$(sha_of "$CODEX")" "$GIT" "$(sha_of "$GIT")" "$NODE" "$(sha_of "$NODE")" "$TIMEOUT" "$(sha_of "$TIMEOUT")")
CODEX_VER=$("$CODEX" --version 2>/dev/null | head -1); CODEX_VER=${CODEX_VER:-ukendt}

# --- self/repo via realpath (P2 F-4) ---
SELF=$(realpath -e -- "${BASH_SOURCE[0]}") || blok "kan ikke resolve egen sti"
REPO=$(cd -- "$(dirname -- "$SELF")/../.." && pwd -P) || blok "kan ikke resolve repo-rod"
if [ -n "${STORK_V5_REPO:-}" ]; then
  [ "$SELFTEST" -eq 1 ] || blok "STORK_V5_REPO er sat uden STORK_V5_SELFTEST=1 — override omgår fabrik-frysen"
  REPO=$(realpath -e -- "$STORK_V5_REPO") || blok "STORK_V5_REPO kan ikke resolves"
fi
REGEL_COMMIT=$("$GIT" -C "$REPO" rev-parse --verify 'HEAD^{commit}' 2>/dev/null) || blok "kan ikke læse HEAD i $REPO"

# --- lås fra PINNED commit (P2 F-4: aldrig arbejdstræ-fil som autoritet) ---
if [ -n "${STORK_V5_LOCK:-}" ]; then
  [ "$SELFTEST" -eq 1 ] || blok "STORK_V5_LOCK er sat uden STORK_V5_SELFTEST=1 — override omgår fabrik-frysen"
  LOCK_JSON=$(cat -- "$STORK_V5_LOCK") || blok "kan ikke læse STORK_V5_LOCK"
  LOCK_MODE="OVERRIDE(selftest)"
  LOCK_BLOB=$(printf '%s' "$LOCK_JSON" | "$GIT" hash-object --stdin)
else
  LOCK_MODE="committed"
  LOCK_JSON=$("$GIT" -C "$REPO" show "$REGEL_COMMIT:scripts/v5/actors.lock.json" 2>/dev/null) || blok "actors.lock.json findes ikke @ $REGEL_COMMIT"
  LOCK_BLOB=$("$GIT" -C "$REPO" rev-parse "$REGEL_COMMIT:scripts/v5/actors.lock.json")
  WT_LOCK=$("$GIT" -C "$REPO" hash-object -- scripts/v5/actors.lock.json 2>/dev/null || echo mangler)
  [ "$WT_LOCK" = "$LOCK_BLOB" ] || blok "actors.lock.json i arbejdstræet (${WT_LOCK:0:12}) ≠ pinned @ ${REGEL_COMMIT:0:7} (${LOCK_BLOB:0:12}) — commit låsen FØR aktør-kald (fabrik-frys)"
fi
# rolle → model/effort/skill fra SAMME lås-bytes (stdin til node — ingen anden læsning)
LOCKINFO=$(printf '%s' "$LOCK_JSON" | "$NODE" -e '
  const l = JSON.parse(require("fs").readFileSync(0, "utf8"));
  const k = process.argv[1];
  const r = Object.prototype.hasOwnProperty.call(l, k) ? l[k] : null;
  if (!r || typeof r !== "object") process.exit(3);
  for (const f of ["model","reasoning","skill_path","skill_oid","aktoer"]) if (typeof r[f] !== "string" || !r[f] || /\s/.test(r[f])) process.exit(4);
  console.log([r.model, r.reasoning, r.skill_path, r.skill_oid, r.aktoer].join(" "));' "$ROLLE" 2>/dev/null) \
  || blok "rolle '$ROLLE' findes ikke (eller er ufuldstændig) i låsen"
read -r MODEL EFFORT SKILL_PATH SKILL_OID AKTOER <<<"$LOCKINFO"
[ "$AKTOER" = "codex" ] || blok "rolle '$ROLLE' er ikke en codex-rolle (aktoer=$AKTOER) — forkert transport"
HEAD_SKILL=$("$GIT" -C "$REPO" rev-parse "$REGEL_COMMIT:$SKILL_PATH" 2>/dev/null) || blok "rolletekst $SKILL_PATH findes ikke @ $REGEL_COMMIT"
[ "$HEAD_SKILL" = "$SKILL_OID" ] || blok "rolletekst-drift: lock.skill_oid=${SKILL_OID:0:12} ≠ $SKILL_PATH@${REGEL_COMMIT:0:7}=${HEAD_SKILL:0:12} — regenerér actors.lock i ren commit FØR aktør-kald"

# --- prompten = rolletekst@skill_oid + opgave (P2 F-5: rollen sendes FAKTISK; `cat --` mod '--help'-filnavne) ---
ROLE_TEXT=$("$GIT" -C "$REPO" show "$SKILL_OID" 2>/dev/null) || blok "kan ikke læse rolletekst-blob $SKILL_OID"
TASK_TEXT=$(cat -- "$PROMPTFIL") || blok "kan ikke læse prompt-fil"
[ -n "$TASK_TEXT" ] || blok "prompt-fil er tom"
PROMPT="$ROLE_TEXT"$'\n\n---\n\n# Opgave (fra driveren — rolleteksten ovenfor er din rolle @ '"${SKILL_OID:0:12}"$')\n\n'"$TASK_TEXT"
[ "${#PROMPT}" -le 1000000 ] || blok "prompt for stor (${#PROMPT} tegn > 1.000.000) — argument-grænse"
PROMPT_SHA=$(printf '%s' "$PROMPT" | sha256sum | cut -d' ' -f1)

# --- serialisér publicering til samme OUT (P2 F-7) ---
exec 9>>"$LOCKF" || blok "kan ikke åbne lås-fil $LOCKF"
flock -n 9 || blok "en anden kørsel publicerer allerede til $OUT (flock)"

echo "start=$STARTED run_id=$RUN_ID rolle=$ROLLE aktivitet=$AKT model=$MODEL effort=$EFFORT sandbox=$SANDBOX service_tier=default codex=$CODEX_VER codex_bin=$CODEX regel_commit=$REGEL_COMMIT lock=$LOCK_MODE lock_blob=$LOCK_BLOB skill=$SKILL_PATH@${SKILL_OID:0:12} prompt_sha256=$PROMPT_SHA workdir=$WORKDIR" >> "$PROV"

run_once() {
  local attempt="$1" a_out s0 t0 t1 rc pid osha obytes ok started ended
  a_out="$OUT.attempt$attempt.out"
  rm -f -- "$a_out" 2>/dev/null
  [ -e "$a_out" ] && { echo "attempt=$attempt gammel forsøgs-output kunne ikke fjernes → BLOKER" >> "$PROV"; return 2; }
  : > "$OUT.attempt$attempt.started"
  started=$(date -Is); s0=$SECONDS; t0=$(date +%s)
  "$TIMEOUT" --signal=KILL "${TIMEOUT_S}s" \
    "$CODEX" exec --skip-git-repo-check --sandbox "$SANDBOX" \
      -m "$MODEL" -c model_reasoning_effort="$EFFORT" \
      --cd "$WORKDIR" -o "$a_out" "$PROMPT" < /dev/null >> "$OUT.log" 2>> "$ERRLOG" &
  pid=$!
  echo "$pid" > "$PIDFIL"
  wait "$pid"; rc=$?
  t1=$(date +%s); ended=$(date -Is)
  ok=0; osha=null; obytes=0
  # leverance = rc 0 ∧ almindelig fil ∧ ikke symlink ∧ ikke tom — kontrolleret på FORSØGETS private fil (P2 F-7)
  if [ "$rc" -eq 0 ] && [ -f "$a_out" ] && [ ! -L "$a_out" ] && [ -s "$a_out" ]; then
    osha="\"$(sha_of "$a_out")\""; obytes=$(stat -c %s -- "$a_out"); ok=1
  fi
  ATTEMPTS_JSON=$(printf '%s' "$ATTEMPTS_JSON" | A="$attempt" RC="$rc" OSHA="$osha" OBYTES="$obytes" MONO="$((SECONDS - s0))" VAEG="$((t1 - t0))" ST="$started" EN="$ended" MODEL="$MODEL" EFFORT="$EFFORT" SANDBOX="$SANDBOX" "$NODE" -e '
    const a = JSON.parse(require("fs").readFileSync(0, "utf8")); const e = process.env;
    a.push({ attempt: Number(e.A), rc: Number(e.RC), model: e.MODEL, effort: e.EFFORT, sandbox: e.SANDBOX,
      output_sha256: e.OSHA === "null" ? null : JSON.parse(e.OSHA), output_bytes: Number(e.OBYTES),
      varighed_mono_s: Number(e.MONO), varighed_vaeg_s: Number(e.VAEG), started: e.ST, ended: e.EN });
    process.stdout.write(JSON.stringify(a));') || { echo "attempt=$attempt kvitterings-opbygning fejlede → BLOKER" >> "$PROV"; return 2; }
  echo "attempt=$attempt rolle=$ROLLE model=$MODEL effort=$EFFORT sandbox=$SANDBOX timeout_s=$TIMEOUT_S rc=$rc leverance=$ok output_sha256=$osha varighed_mono_s=$((SECONDS - s0)) varighed_vaeg_s=$((t1 - t0)) slut=$ended" >> "$PROV"
  if [ "$ok" -eq 1 ]; then
    mv -f -- "$a_out" "$OUT" || { echo "attempt=$attempt publicering (mv) fejlede → BLOKER" >> "$PROV"; return 2; }
    : > "$OUT.attempt$attempt.done"; return 0
  fi
  [ "$rc" -eq 0 ] && echo "attempt=$attempt rc=0 men ingen gyldig leverance (tom/symlink/manglende) → FEJL (fail-closed)" >> "$PROV"
  rm -f -- "$a_out" 2>/dev/null
  return 1
}

if run_once 1; then STATUS="success"; skriv_kvittering; rm -f -- "$PIDFIL"; exit 0; fi
rc1=$?; [ "$rc1" -eq 2 ] && blok "intern fejl i forsøg 1"
echo "attempt=1 FEJLEDE/TIMEOUT → ét genforsøg (samme model+effort+sandbox — aldrig tavs sænkning)" >> "$PROV"
if run_once 2; then STATUS="success"; skriv_kvittering; rm -f -- "$PIDFIL"; exit 0; fi
rm -f -- "$PIDFIL"
STATUS="fejl"; skriv_kvittering "to forsøg uden gyldig leverance"
echo "attempt=2 FEJLEDE → MANGLENDE RESULTAT = BLOKER (fail-closed)" >> "$PROV"
exit 1
