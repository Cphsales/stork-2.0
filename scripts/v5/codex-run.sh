#!/usr/bin/env bash
# codex-run.sh — fabrikkens codex-transport v4 (M-39 · M-41 Trin A · Codex P2 runde 1 FAIL(9) → v3 · runde 2 FAIL(9) → v4, 2026-09-09).
#
# ROLLEN BESTEMMER KALDET (princip 7): model/effort/rolletekst fra den PINNEDE lås
# (`git show <HEAD-commit>:scripts/v5/actors.lock.json`, --no-replace-objects). Rolleteksten
# læses som blob, HASH-VERIFICERES mod skill_oid (P2 F-13: `git replace` kan ellers bytte
# indhold bag samme OID) og sendes som første del af prompten (F-5); prompt_sha256 i kvittering.
# FABRIK-FRYS (princip 8): skill_oid == <commit>:<skill_path>, arbejdstræ-lås == pinned; egen sti
# via realpath, git-miljø renset (F-4).
# BINÆRER: systemværktøjer (git/timeout/sha256sum/realpath/flock/mktemp/stat/date) resolves fra
# FAST system-PATH (/usr/bin:/bin:/usr/local/bin), aldrig kalderens (F-3: falsk `timeout` på PATH);
# codex + node fra renset kalder-PATH men KUN under kendte prefixer (nvm/usr), og codex' entry-fil
# skal matche `binaries.lock.json` (version + sha256) fra den pinnede commit. Fuld integritet
# (signeret binær, betroet runner) = DEKLARERET RESIDUAL (DEL I: lokal = candidate, CI = autoritet).
# SANDBOX EFTER AKTIVITET (V-8): dom → read-only · produktion → workspace-write.
# LÅS FØRST (F-7): flock på $OUT.lock tages FØR nogen fælles fil rørs; taber → kun stderr, ingen
# skriv. Privat kørselsmappe (mktemp -d) til forsøgs-output; publicering med mv til $OUT, der
# hverken må være mappe eller symlink og ikke ligge i workdir.
# KVITTERING ($OUT.receipt.json, struktureret, overskrives): status · run_id · rolle · aktivitet ·
# model/effort/sandbox · regel_commit · lock_mode · lock_blob · skill_oid · prompt_sha256 ·
# gate_input (F-10: hvilken gate/commit/artefakt dommen gælder — fra STORK_V5_GATE_INPUT) ·
# selftest (F-11: ENHVER selvtest-lempelse mærker kørslen uegnet som gate-evidens) · binaries ·
# attempts[{rc, output_sha256, output_bytes, model/effort/sandbox}]. .done + exit 0 KUN efter
# publiceret leverance OG skrevet kvittering (F-12).
# Uændret: timeout + PRÆCIS ét genforsøg (samme model/effort/sandbox) · stdin LUKKET · PID-fil ·
# separat stderr-log · timeout ≥ 1.
#
# Brug: codex-run.sh <rolle> <dom|produktion> <workdir> <timeout-sek≥1> <output-fil> <prompt-fil>
# Env: STORK_V5_GATE_INPUT="<gate_id>:<gated-commit-oid>:<artifact_path>" (kræves af verdikt-byg for gate-domme)
#      STORK_V5_SELFTEST=1 (+ evt. STORK_V5_LOCK/STORK_V5_REPO): lempelser KUN i selvtest; kvittering.selftest=true
set -u
umask 077
unset GIT_DIR GIT_WORK_TREE GIT_COMMON_DIR GIT_INDEX_FILE GIT_OBJECT_DIRECTORY \
  GIT_ALTERNATE_OBJECT_DIRECTORIES GIT_NAMESPACE GIT_CEILING_DIRECTORIES GIT_REPLACE_REF_BASE \
  GIT_NO_REPLACE_OBJECTS GIT_DISCOVERY_ACROSS_FILESYSTEM GIT_CONFIG_PARAMETERS GIT_EXTERNAL_DIFF \
  GIT_PAGER BASH_ENV ENV CDPATH
IFS=$' \t\n'
export GIT_TERMINAL_PROMPT=0

if [ $# -ne 6 ]; then
  echo "brug: codex-run.sh <rolle> <dom|produktion> <workdir> <timeout-sek> <output-fil> <prompt-fil>" >&2
  exit 2
fi
ROLLE="$1"; AKT="$2"; WORKDIR="$3"; TIMEOUT_S="$4"; OUT="$5"; PROMPTFIL="$6"
PROV="$OUT.provenance"; RECEIPT="$OUT.receipt.json"; PIDFIL="$OUT.pid"; ERRLOG="$OUT.stderr.log"; LOCKF="$OUT.lock"
SELFTEST=0; [ "${STORK_V5_SELFTEST:-}" = "1" ] && SELFTEST=1
HAS_LOCK=0; RUNDIR=""; RUN_CODEX_HOME=""; NODE_PINNED=0; AUTH_SRC=""; AUTH_SHA0=""
STATUS="blokeret"; ATTEMPTS_JSON="[]"
MODEL=""; EFFORT=""; SANDBOX=""; SKILL_PATH=""; SKILL_OID=""; REGEL_COMMIT=""; LOCK_BLOB=""; LOCK_MODE=""; PROMPT_SHA=""
CODEX_VER=""; BIN_JSON="{}"; GATE_JSON="null"

# --- systemværktøjer fra FAST system-PATH (F-3) ---
SYSPATH="/usr/bin:/bin:/usr/local/bin"
sysbin() { local p; p=$(PATH="$SYSPATH" command -v -- "$1" 2>/dev/null) || return 1; PATH="$SYSPATH" realpath -e -- "$p"; }
for b in git timeout sha256sum realpath flock mktemp stat date env; do
  v=$(sysbin "$b") || { echo "BLOKER: systemværktøj '$b' ikke fundet i $SYSPATH" >&2; exit 1; }
  case "$b" in git) GIT=$v;; timeout) TIMEOUT=$v;; sha256sum) SHASUM=$v;; realpath) REALPATH=$v;; flock) FLOCK=$v;; mktemp) MKTEMP=$v;; stat) STAT=$v;; date) DATE=$v;; env) ENVB=$v;; esac
done
g() { "$GIT" --no-replace-objects "$@"; }   # F-13: refs/replace må aldrig ændre hvad en OID betyder
# T-F3 (runde 3): codex/node findes i kalderens RENSEDE PATH (nvm); ALT andet (cat, cut, mv, rm, ls, dirname,
# head, tee, wc …) skal komme fra system-PATH — en falsk `cat` på kalderens PATH kunne ellers bytte rolleteksten
# EFTER hash-kontrollen. Kalder-PATH gemmes renset, og PATH sættes til system-PATH for resten af scriptet.
CALLER_PATH=""
IFS=: read -r -a PATH_DELE <<<"${PATH:-}"
for d in "${PATH_DELE[@]}"; do case "$d" in /*) CALLER_PATH="${CALLER_PATH:+$CALLER_PATH:}$d" ;; esac; done
export PATH="$SYSPATH"
# F-3e: wrapperens EGNE node-kald (lås-parsing, kvittering) må ikke kunne påvirkes af kalderens NODE_*-variabler
# (NODE_OPTIONS --require, NODE_PATH, NODE_V8_COVERAGE …) — alle NODE_* fjernes fra wrapperens miljø her.
while IFS= read -r v; do unset -v "$v"; done < <(compgen -e | grep -E '^NODE_' || true)
sha_of() { "$SHASUM" -- "$1" | cut -d' ' -f1; }
RUN_ID="$("$DATE" +%Y%m%dT%H%M%S)-$$-$RANDOM"
STARTED="$("$DATE" -Is)"

skriv_kvittering() {
  if [ "$NODE_PINNED" -ne 1 ]; then   # F-3d: node er endnu ikke pinnet → INGEN node-start; minimal kvittering uden node
    local r; r=$(printf '%s' "${1:-}" | tr -d '"\\\r\n' | cut -c1-300)
    printf '{"schema_version":2,"status":"%s","reason":"%s (før node-pin)","selftest":%s,"node_pinned":false}\n' "$STATUS" "$r" "$([ "$SELFTEST" -eq 1 ] && echo true || echo false)" > "$RECEIPT.tmp" && mv -f -- "$RECEIPT.tmp" "$RECEIPT"
    return
  fi
  RUN_ID="$RUN_ID" STATUS="$STATUS" REASON="${1:-}" ROLLE="$ROLLE" AKT="$AKT" MODEL="$MODEL" EFFORT="$EFFORT" \
  SANDBOX="$SANDBOX" REGEL_COMMIT="$REGEL_COMMIT" LOCK_MODE="$LOCK_MODE" LOCK_BLOB="$LOCK_BLOB" SKILL_PATH="$SKILL_PATH" \
  SKILL_OID="$SKILL_OID" PROMPT_SHA="$PROMPT_SHA" WORKDIR="$WORKDIR" OUT="$OUT" CODEX_VER="$CODEX_VER" BIN_JSON="$BIN_JSON" RUN_CODEX_HOME="$RUN_CODEX_HOME" AUTH_SRC="$AUTH_SRC" \
  ATTEMPTS_JSON="$ATTEMPTS_JSON" STARTED="$STARTED" ENDED="$("$DATE" -Is)" SELFTEST="$SELFTEST" GATE_JSON="$GATE_JSON" \
  "${NODE:-node}" -e '
    const e = process.env;
    const r = { schema_version: 2, status: e.STATUS, run_id: e.RUN_ID, rolle: e.ROLLE, aktivitet: e.AKT,
      model: e.MODEL, effort: e.EFFORT, sandbox: e.SANDBOX, sandbox_policy: { network_access: false, exclude_slash_tmp: true, exclude_tmpdir_env_var: true }, service_tier: "default", codex_version: e.CODEX_VER,
      regel_commit: e.REGEL_COMMIT, lock_mode: e.LOCK_MODE, lock_blob: e.LOCK_BLOB, skill_path: e.SKILL_PATH,
      skill_oid: e.SKILL_OID, prompt_sha256: e.PROMPT_SHA, gate_input: JSON.parse(e.GATE_JSON || "null"),
      selftest: e.SELFTEST === "1", workdir: e.WORKDIR, out: e.OUT, codex_home: e.RUN_CODEX_HOME, codex_home_mode: "privat-uden-config", auth_source: e.AUTH_SRC, env_mode: "allowlist(HOME,PATH,LANG,CODEX_HOME,CODEX_MANAGED_PACKAGE_ROOT,CODEX_MANAGED_BY_NPM)",
      binaries: JSON.parse(e.BIN_JSON || "{}"), attempts: JSON.parse(e.ATTEMPTS_JSON || "[]"),
      started: e.STARTED, ended: e.ENDED };
    if (e.REASON) r.reason = e.REASON;
    process.stdout.write(JSON.stringify(r, null, 1) + "\n");' > "$RECEIPT.tmp" && mv -f -- "$RECEIPT.tmp" "$RECEIPT"
}
auth_tilbage() {   # F-3c: CLI'en kørte mod en KOPI af auth.json i privat CODEX_HOME; et token-refresh skrives tilbage til kilden
  [ -n "$RUN_CODEX_HOME" ] && [ -f "$RUN_CODEX_HOME/auth.json" ] && [ -n "$AUTH_SRC" ] || return 0
  [ "$(sha_of "$RUN_CODEX_HOME/auth.json")" != "$AUTH_SHA0" ] || return 0
  cp -- "$RUN_CODEX_HOME/auth.json" "$AUTH_SRC.tmp.$$" && chmod 600 "$AUTH_SRC.tmp.$$" && mv -f -- "$AUTH_SRC.tmp.$$" "$AUTH_SRC" \
    && { [ "$HAS_LOCK" -eq 1 ] && echo "auth.json opdateret fra kørslen (token-refresh) → $AUTH_SRC" >> "$PROV" || true; } \
    || echo "ADVARSEL: auth.json kunne ikke skrives tilbage til $AUTH_SRC" >&2
}
cleanup() { auth_tilbage; [ -n "$RUNDIR" ] && rm -rf -- "$RUNDIR"; }
trap cleanup EXIT
blok() {
  echo "BLOKER: $*" >&2
  if [ "$HAS_LOCK" -eq 1 ]; then echo "BLOKER: $*" >> "$PROV"; STATUS="blokeret"; skriv_kvittering "$*" 2>/dev/null; rm -f -- "$PIDFIL"; fi
  exit 1
}

# --- aktivitet / timeout / stier (ingen fælles fil rørs endnu) ---
case "$AKT" in dom) SANDBOX="read-only" ;; produktion) SANDBOX="workspace-write" ;; *) blok "ukendt aktivitet '$AKT' (dom|produktion)" ;; esac
case "$TIMEOUT_S" in ''|*[!0-9]*) blok "timeout skal være heltal-sekunder, fik '$TIMEOUT_S'" ;; esac
[ "$TIMEOUT_S" -ge 1 ] || blok "timeout skal være ≥ 1 s (0 = ingen grænse = fail-open)"
[ -d "$WORKDIR" ] || blok "workdir findes ikke: $WORKDIR"
WD_REAL=$("$REALPATH" -e -- "$WORKDIR") || blok "workdir kan ikke resolves"
OUT_DIR_REAL=$("$REALPATH" -m -- "$(dirname -- "$OUT")") || blok "output-mappe kan ikke resolves"
case "$OUT_DIR_REAL/" in "$WD_REAL/"*) blok "output-fil må IKKE ligge i workdir ($WD_REAL) — aktøren kunne skrive den (F-7)" ;; esac
[ -d "$OUT_DIR_REAL" ] || blok "output-mappe findes ikke: $OUT_DIR_REAL"
case "$(basename -- "$OUT")" in
  .run-*|*.lock|*.receipt.json|*.provenance|*.pid|*.stderr.log|*.log|*.attempt*|*.tmp) blok "output-filnavn bruger et reserveret suffix/prefix (lock/receipt/provenance/pid/log/attempt/tmp/.run-) — kollision med en anden kørsels sidefiler (T-F7)" ;;
esac
[ -d "$OUT" ] && blok "output-fil er en MAPPE: $OUT (mv ville flytte leverancen ind i den, F-12)"
[ -L "$OUT" ] && blok "output-fil er et symlink: $OUT"
[ -f "$PROMPTFIL" ] && [ ! -L "$PROMPTFIL" ] || blok "prompt-fil findes ikke eller er symlink: $PROMPTFIL"

# --- LÅS FØRST (F-7): kun én kørsel ad gangen pr. OUT; taberen rører intet ---
exec 9>>"$LOCKF" || blok "kan ikke åbne lås-fil $LOCKF"
"$FLOCK" -n 9 || blok "en anden kørsel holder låsen for $OUT — intet rørt"
HAS_LOCK=1
rm -f -- "$OUT".attempt*.done "$OUT".attempt*.started "$OUT".attempt*.out "$PIDFIL" "$RECEIPT" 2>/dev/null \
  || blok "markør-oprydning fejlede"
ls "$OUT".attempt*.done >/dev/null 2>&1 && blok "stale .done kunne ikke fjernes"
RUNDIR=$("$MKTEMP" -d "$OUT_DIR_REAL/.run-XXXXXXXX") || blok "kan ikke oprette privat kørselsmappe"

# --- self/repo via realpath (F-4) ---
SELF=$("$REALPATH" -e -- "${BASH_SOURCE[0]}") || blok "kan ikke resolve egen sti"
REPO=$(cd -- "$(dirname -- "$SELF")/../.." && pwd -P) || blok "kan ikke resolve repo-rod"
if [ -n "${STORK_V5_REPO:-}" ]; then
  [ "$SELFTEST" -eq 1 ] || blok "STORK_V5_REPO er sat uden STORK_V5_SELFTEST=1 — override omgår fabrik-frysen"
  REPO=$("$REALPATH" -e -- "$STORK_V5_REPO") || blok "STORK_V5_REPO kan ikke resolves"
fi
REGEL_COMMIT=$(g -C "$REPO" rev-parse --verify 'HEAD^{commit}' 2>/dev/null) || blok "kan ikke læse HEAD i $REPO"


# --- codex + node fra RENSET kalder-PATH, kun kendte prefixer; codex pinnet mod binaries.lock (F-3) ---
resolve_bin() { local p; p=$(PATH="$CALLER_PATH" command -v -- "$1" 2>/dev/null) || return 1; "$REALPATH" -e -- "$p"; }
NODE=$(resolve_bin node) || blok "node ikke fundet"
CODEX=$(resolve_bin codex) || blok "codex ikke fundet"
kendt_prefix() { case "$1" in "$HOME"/.nvm/versions/node/*/bin/*|"$HOME"/.nvm/versions/node/*/lib/node_modules/*|/usr/local/bin/*|/usr/local/lib/node_modules/*|/usr/bin/*|/usr/lib/node_modules/*) return 0;; *) return 1;; esac; }
if [ "$SELFTEST" -ne 1 ]; then
  kendt_prefix "$CODEX" || blok "codex-binær uden for pinnet prefix: $CODEX (PATH-injektion? F-3)"
  kendt_prefix "$NODE" || blok "node-binær uden for pinnet prefix: $NODE"
fi

# --- F-3d (runde 10c): node autoriseres FØR første node-start gennem ÉN allerede betroet mekanisme: pin-filen
# scripts/v5/node.pin @ regel_commit (git + grep fra system-PATH). Streng grammatik: indholdet efter bash' $(…)-normalisering
# (afsluttende LF'er/NUL fjernes — præcis det, Codex runde 10d målte) er præcis én linje `sha256=<64 lowercase hex>`; alt andet BLOKER. Ingen tekst-medlemskab i låsen (runde 10c: en fremmed nodes sha i et uvedkommende felt
# gav start før den præcise sammenligning). Selvtest uden FORCE_BINCHECK: lempelse, kvittering selftest=true.
# F-3f (runde 10d): om binær-kontrollen KØRES afgøres af den eksplicitte selvtest-tilstand — ALDRIG af låsens indhold
# (en tom lås-blob gav ellers selvtest-grenen i produktion). BINCHECK=1 = produktion eller FORCE_BINCHECK.
BINCHECK=0; if [ "$SELFTEST" -ne 1 ] || [ "${STORK_V5_SELFTEST_FORCE_BINCHECK:-}" = "1" ]; then BINCHECK=1; fi
BINLOCK=""
if [ "$BINCHECK" -eq 1 ]; then
  NODE_PIN_TXT=$(g -C "$REPO" show "$REGEL_COMMIT:scripts/v5/node.pin" 2>/dev/null) || blok "node.pin findes ikke @ $REGEL_COMMIT — node startes ikke (F-3d)"
  [ "${#NODE_PIN_TXT}" -eq 71 ] && [ "$(printf '%s' "$NODE_PIN_TXT" | grep -cE '^sha256=[0-9a-f]{64}$')" = "1" ] \
    || blok "node.pin har ikke grammatikken 'sha256=<64 hex>' som eneste linje — node startes ikke (F-3d)"
  NODE_PIN_SHA=${NODE_PIN_TXT#sha256=}
  NODE_SHA=$(sha_of "$NODE")
  [ "$NODE_SHA" = "$NODE_PIN_SHA" ] || blok "node ($NODE, sha ${NODE_SHA:0:12}) matcher ikke node.pin (${NODE_PIN_SHA:0:12}) @ $REGEL_COMMIT — node startes ikke (F-3d)"
  BINLOCK=$(g -C "$REPO" show "$REGEL_COMMIT:scripts/v5/binaries.lock.json" 2>/dev/null) || blok "binaries.lock.json findes ikke @ $REGEL_COMMIT"
  [ -n "$(printf '%s' "$BINLOCK" | tr -d '[:space:]')" ] || blok "binaries.lock.json er tom @ $REGEL_COMMIT — ingen pins, intet codex-kald (F-3f)"
fi
NODE_PINNED=1
# --- F-3c: PRIVAT Codex-hjem. CLI'en læser ALDRIG brugerens ~/.codex/config.toml (den kunne omdirigere udbyder/profil/sandbox
# via gyldig TOML som intet regex fanger). Wrapperen giver CLI'en en wrapper-ejet CODEX_HOME i den private kørselsmappe med
# KUN en kopi af auth.json (login) og INGEN config.toml — alle indstillinger kommer fra kaldet (-m, -c …). Token-refresh
# skrives tilbage til kilden ved afslutning (auth_tilbage). Miljøet til CLI'en er en ALLOWLIST (env -i): ingen proxy-/CA-/
# base-url-variabler kan nå den.
AUTH_SRC="$HOME/.codex/auth.json"
if [ -n "${STORK_V5_AUTH_SRC:-}" ]; then
  [ "$SELFTEST" -eq 1 ] || blok "STORK_V5_AUTH_SRC er sat uden STORK_V5_SELFTEST=1 — override omgår login-kilden (F-3c)"
  case "$STORK_V5_AUTH_SRC" in /*) AUTH_SRC="$STORK_V5_AUTH_SRC" ;; *) blok "STORK_V5_AUTH_SRC skal være en absolut sti" ;; esac
fi
[ -f "$AUTH_SRC" ] && [ ! -L "$AUTH_SRC" ] || blok "auth.json findes ikke eller er symlink: $AUTH_SRC — log ind (codex login) før kørsel (F-3c)"
RUN_CODEX_HOME="$RUNDIR/codex-home"
mkdir -m 700 -- "$RUN_CODEX_HOME" || blok "kan ikke oprette privat CODEX_HOME"
cp -- "$AUTH_SRC" "$RUN_CODEX_HOME/auth.json" && chmod 600 -- "$RUN_CODEX_HOME/auth.json" || blok "kan ikke kopiere auth.json til privat CODEX_HOME"
AUTH_SHA0=$(sha_of "$RUN_CODEX_HOME/auth.json")
# codex-shim'en er `#!/usr/bin/env node` → den SKAL kunne finde node; vi giver PRÆCIS den verificerede node-mappe + system-PATH
CODEX_PATH="$(dirname -- "$NODE"):$SYSPATH"
CODEX_PKG_ROOT=$("$REALPATH" -e -- "$(dirname -- "$CODEX")/..") || blok "codex-pakkerod kan ikke resolves (F-3b)"
# F-3b (runde 10/10b/10c): RÆKKEFØLGE = node.pin (før node) → lås → shim-sha → native-sha → FØRST DEREFTER første start
# (--version) → exec. Intet u-pinnet program startes. Eksekveringen BINDES til den hashede fil: vi kører den native binær
# direkte (shim'en vælger sin native via require.resolve/package-exports og kan pege et andet sted hen end det vi hashede).
CODEX_NATIVE=""; CODEX_EXEC=""
if [ "$BINCHECK" -eq 1 ]; then
  PIN=$(printf '%s' "$BINLOCK" | "$NODE" -e '
    const l = JSON.parse(require("fs").readFileSync(0, "utf8"));
    const hex64 = (s) => typeof s === "string" && /^[0-9a-f]{64}$/.test(s);
    const str = (s) => typeof s === "string" && s.length > 0 && !/[\r\n]/.test(s);
    if (!l || typeof l !== "object" || !l.codex || !hex64(l.codex.sha256) || !str(l.codex.version)) process.exit(3);
    const n = l.codex_native;
    if (!n || !hex64(n.sha256) || !str(n.path_from_pkg_root) || !n.path_from_pkg_root.startsWith("/") || /(^|\/)\.\.(\/|$)/.test(n.path_from_pkg_root)) process.exit(4);
    process.stdout.write([l.codex.sha256, l.codex.version, n.sha256, n.path_from_pkg_root].join("\n"));
  ') || blok "binaries.lock.json er ugyldig eller mangler codex.version / codex_native{sha256,path_from_pkg_root} (F-3b)"
  PIN_SHA=$(printf '%s\n' "$PIN" | sed -n 1p); PIN_VER=$(printf '%s\n' "$PIN" | sed -n 2p)
  PIN_NATIVE_SHA=$(printf '%s\n' "$PIN" | sed -n 3p); PIN_NATIVE_REL=$(printf '%s\n' "$PIN" | sed -n 4p)
  [ "$(sha_of "$CODEX")" = "$PIN_SHA" ] || blok "codex-entry ($CODEX) matcher ikke binaries.lock.json (${PIN_SHA:0:12}) — CLI'en er ændret/opdateret uden bevidst lås-opdatering (F-3)"
  CODEX_NATIVE=$("$REALPATH" -e -- "$CODEX_PKG_ROOT$PIN_NATIVE_REL" 2>/dev/null) || blok "native codex-binær findes ikke: $CODEX_PKG_ROOT$PIN_NATIVE_REL (F-3b)"
  [ -f "$CODEX_NATIVE" ] && [ -x "$CODEX_NATIVE" ] || blok "native codex-binær er ikke en eksekverbar almindelig fil: $CODEX_NATIVE (F-3b)"
  if [ "$SELFTEST" -ne 1 ]; then kendt_prefix "$CODEX_NATIVE" || blok "native codex-binær uden for pinnet prefix: $CODEX_NATIVE (F-3b)"; fi
  [ "$(sha_of "$CODEX_NATIVE")" = "$PIN_NATIVE_SHA" ] || blok "native codex-binær ($CODEX_NATIVE) matcher ikke binaries.lock.json (${PIN_NATIVE_SHA:0:12}) — binæren er ændret/udskiftet uden bevidst lås-opdatering (F-3b)"
  CODEX_EXEC="$CODEX_NATIVE"
else
  [ "$SELFTEST" -eq 1 ] || blok "intern fejl: binær-kontrol sprunget over uden selvtest (F-3f)"   # kan ikke nås; dobbelt-sikring
  CODEX_EXEC="$CODEX"   # KUN selvtest uden FORCE_BINCHECK: den falske shim spiller selv native (kvitteringen er mærket selftest=true)
fi
# ALLOWLIST-miljø til CLI'en (env -i): HOME (nvm/cache), PATH (verificeret node-mappe + system), LANG, privat CODEX_HOME,
# og de to variabler shim'en selv sætter. Alt andet (OPENAI_BASE_URL, *_PROXY, SSL_CERT_FILE, CODEX_CA_CERTIFICATE,
# NODE_EXTRA_CA_CERTS, NODE_OPTIONS …) når ALDRIG CLI'en.
codex_env() { "$ENVB" -i HOME="$HOME" PATH="$CODEX_PATH" LANG="${LANG:-C.UTF-8}" CODEX_HOME="$RUN_CODEX_HOME" CODEX_MANAGED_PACKAGE_ROOT="$CODEX_PKG_ROOT" CODEX_MANAGED_BY_NPM=1 "$@"; }
# første start af codex sker HER — efter alle byte-kontroller: præcis én linje, rc 0, lig låsens version
CODEX_VER=$(codex_env "$CODEX_EXEC" --version 2>/dev/null); vrc=$?   # scriptet kører set -u (ikke -e): substitution fejler ikke hårdt
[ "$vrc" -eq 0 ] || blok "codex --version fejlede (rc=$vrc) for $CODEX_EXEC (F-3b)"
case "$CODEX_VER" in *$'\n'*|*$'\r'*) blok "codex --version gav flere linjer/CR — forventede præcis én linje (F-3b)";; '') blok "codex --version gav intet output (F-3b)";; esac
if [ -n "$CODEX_NATIVE" ]; then [ "$CODEX_VER" = "$PIN_VER" ] || blok "codex --version »$CODEX_VER« ≠ låsens »$PIN_VER« — CLI'en er ændret/opdateret uden bevidst lås-opdatering (F-3b)"; fi
BIN_JSON=$(printf '{"codex":{"path":"%s","sha256":"%s"},"codex_exec":{"path":"%s","sha256":"%s"},"node":{"path":"%s","sha256":"%s"},"git":{"path":"%s","sha256":"%s"},"timeout":{"path":"%s","sha256":"%s"},"flock":{"path":"%s","sha256":"%s"}' \
  "$CODEX" "$(sha_of "$CODEX")" "$CODEX_EXEC" "$(sha_of "$CODEX_EXEC")" "$NODE" "$(sha_of "$NODE")" "$GIT" "$(sha_of "$GIT")" "$TIMEOUT" "$(sha_of "$TIMEOUT")" "$FLOCK" "$(sha_of "$FLOCK")")
if [ -n "$CODEX_NATIVE" ]; then BIN_JSON="$BIN_JSON,$(printf '"codex_native":{"path":"%s","sha256":"%s"}' "$CODEX_NATIVE" "$(sha_of "$CODEX_NATIVE")")"; fi
BIN_JSON="$BIN_JSON}"

# --- gate-input (F-10): hvilken gate/commit/artefakt dommen gælder — bindes i kvitteringen ---
if [ -n "${STORK_V5_GATE_INPUT:-}" ]; then
  IFS=: read -r GI_GATE GI_COMMIT GI_PATH <<<"$STORK_V5_GATE_INPUT"
  case "$GI_GATE" in recon|krav|plan|build|slut) ;; *) blok "STORK_V5_GATE_INPUT: ukendt gate '$GI_GATE'" ;; esac
  case "$GI_COMMIT" in [0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]) ;; *) blok "STORK_V5_GATE_INPUT: gated commit skal være 40-hex OID" ;; esac
  case "$GI_PATH" in ''|/*|*..*|*:*) blok "STORK_V5_GATE_INPUT: ugyldig artefakt-sti" ;; esac
  [ "$AKT" = "dom" ] || blok "gate-input kræver aktivitet=dom (en gate-dom skrives aldrig af en produktions-kørsel)"
  GATE_JSON=$(GI_GATE="$GI_GATE" GI_COMMIT="$GI_COMMIT" GI_PATH="$GI_PATH" "$NODE" -e 'const e=process.env; process.stdout.write(JSON.stringify({gate_id:e.GI_GATE,gated_commit:e.GI_COMMIT,artifact_path:e.GI_PATH}))')
fi

# --- lås fra PINNED commit (F-4); override kun selftest (mærket) ---
if [ -n "${STORK_V5_LOCK:-}" ]; then
  [ "$SELFTEST" -eq 1 ] || blok "STORK_V5_LOCK er sat uden STORK_V5_SELFTEST=1 — override omgår fabrik-frysen"
  LOCK_JSON=$(cat -- "$STORK_V5_LOCK") || blok "kan ikke læse STORK_V5_LOCK"
  LOCK_MODE="OVERRIDE(selftest)"
  LOCK_BLOB=$(printf '%s' "$LOCK_JSON" | g hash-object --stdin)
else
  LOCK_MODE="committed"
  LOCK_JSON=$(g -C "$REPO" show "$REGEL_COMMIT:scripts/v5/actors.lock.json" 2>/dev/null) || blok "actors.lock.json findes ikke @ $REGEL_COMMIT"
  LOCK_BLOB=$(g -C "$REPO" rev-parse "$REGEL_COMMIT:scripts/v5/actors.lock.json")
  WT_LOCK=$(g -C "$REPO" hash-object -- scripts/v5/actors.lock.json 2>/dev/null || echo mangler)
  [ "$WT_LOCK" = "$LOCK_BLOB" ] || blok "actors.lock.json i arbejdstræet (${WT_LOCK:0:12}) ≠ pinned @ ${REGEL_COMMIT:0:7} (${LOCK_BLOB:0:12}) — commit låsen FØR aktør-kald (fabrik-frys)"
fi
LOCKINFO=$(printf '%s' "$LOCK_JSON" | "$NODE" -e '
  const l = JSON.parse(require("fs").readFileSync(0, "utf8")); const k = process.argv[1];
  const r = Object.prototype.hasOwnProperty.call(l, k) ? l[k] : null;
  if (!r || typeof r !== "object") process.exit(3);
  for (const f of ["model","reasoning","skill_path","skill_oid","aktoer"]) if (typeof r[f] !== "string" || !r[f] || /\s/.test(r[f])) process.exit(4);
  console.log([r.model, r.reasoning, r.skill_path, r.skill_oid, r.aktoer].join(" "));' "$ROLLE" 2>/dev/null) \
  || blok "rolle '$ROLLE' findes ikke (eller er ufuldstændig) i låsen"
read -r MODEL EFFORT SKILL_PATH SKILL_OID AKTOER <<<"$LOCKINFO"
[ "$AKTOER" = "codex" ] || blok "rolle '$ROLLE' er ikke en codex-rolle (aktoer=$AKTOER) — forkert transport"
HEAD_SKILL=$(g -C "$REPO" rev-parse "$REGEL_COMMIT:$SKILL_PATH" 2>/dev/null) || blok "rolletekst $SKILL_PATH findes ikke @ $REGEL_COMMIT"
[ "$HEAD_SKILL" = "$SKILL_OID" ] || blok "rolletekst-drift: lock.skill_oid=${SKILL_OID:0:12} ≠ $SKILL_PATH@${REGEL_COMMIT:0:7}=${HEAD_SKILL:0:12} — regenerér actors.lock i ren commit FØR aktør-kald"

# --- rolletekst som blob, HASH-VERIFICERET (F-13), + opgave → prompt (F-5) ---
g -C "$REPO" cat-file blob "$SKILL_OID" > "$RUNDIR/role.md" 2>/dev/null || blok "kan ikke læse rolletekst-blob $SKILL_OID"
[ "$(g hash-object -- "$RUNDIR/role.md")" = "$SKILL_OID" ] || blok "rolletekst-bytes hasher ikke til skill_oid (objekt-substitution? F-13)"
ROLE_TEXT=$(cat -- "$RUNDIR/role.md")
TASK_TEXT=$(cat -- "$PROMPTFIL") || blok "kan ikke læse prompt-fil"
[ -n "$TASK_TEXT" ] || blok "prompt-fil er tom"
PROMPT="$ROLE_TEXT"$'\n\n---\n\n# Opgave (fra driveren — rolleteksten ovenfor er din rolle @ '"${SKILL_OID:0:12}"$')\n\n'"$TASK_TEXT"
[ "${#PROMPT}" -le 1000000 ] || blok "prompt for stor (${#PROMPT} tegn > 1.000.000) — argument-grænse"
PROMPT_SHA=$(printf '%s' "$PROMPT" | "$SHASUM" | cut -d' ' -f1)

echo "start=$STARTED run_id=$RUN_ID rolle=$ROLLE aktivitet=$AKT model=$MODEL effort=$EFFORT sandbox=$SANDBOX selftest=$SELFTEST codex=$CODEX_VER codex_bin=$CODEX codex_exec=$CODEX_EXEC codex_home=$RUN_CODEX_HOME(privat,uden config) auth_source=$AUTH_SRC env=allowlist regel_commit=$REGEL_COMMIT lock=$LOCK_MODE lock_blob=$LOCK_BLOB skill=$SKILL_PATH@${SKILL_OID:0:12} prompt_sha256=$PROMPT_SHA gate_input=$GATE_JSON workdir=$WORKDIR" >> "$PROV"

run_once() {
  local attempt="$1" a_out s0 t0 t1 rc pid osha obytes ok started ended
  a_out="$RUNDIR/attempt$attempt.out"
  : > "$OUT.attempt$attempt.started"
  started=$("$DATE" -Is); s0=$SECONDS; t0=$("$DATE" +%s)
  # A5 (driver-fund 2026-09-10): sandbox-POLITIKKEN sættes eksplicit pr. kald og arves ALDRIG fra ~/.codex/config
  # (lokal config havde network_access=true → produktions-kørsler havde netværk trods »Web forbudt«). Netværk fra,
  # /tmp og $TMPDIR ikke skrivbare — kun workdir. Læse-adgang uden for workdir kan sandboxen ikke begrænse (residual).
  codex_env "$TIMEOUT" --signal=KILL "${TIMEOUT_S}s" \
    "$CODEX_EXEC" exec --skip-git-repo-check --sandbox "$SANDBOX" \
      -c sandbox_workspace_write.network_access=false -c sandbox_workspace_write.exclude_slash_tmp=true -c sandbox_workspace_write.exclude_tmpdir_env_var=true \
      -m "$MODEL" -c model_reasoning_effort="$EFFORT" \
      --cd "$WORKDIR" -o "$a_out" "$PROMPT" < /dev/null >> "$OUT.log" 2>> "$ERRLOG" &
  pid=$!
  echo "$pid" > "$PIDFIL"
  wait "$pid"; rc=$?
  t1=$("$DATE" +%s); ended=$("$DATE" -Is)
  ok=0; osha=null; obytes=0
  # leverance = rc 0 ∧ almindelig fil ∧ ikke symlink ∧ ikke tom — på den PRIVATE forsøgsfil
  if [ "$rc" -eq 0 ] && [ -f "$a_out" ] && [ ! -L "$a_out" ] && [ -s "$a_out" ]; then
    osha="\"$(sha_of "$a_out")\""; obytes=$("$STAT" -c %s -- "$a_out"); ok=1
  fi
  ATTEMPTS_JSON=$(printf '%s' "$ATTEMPTS_JSON" | A="$attempt" RC="$rc" OSHA="$osha" OBYTES="$obytes" MONO="$((SECONDS - s0))" VAEG="$((t1 - t0))" ST="$started" EN="$ended" MODEL="$MODEL" EFFORT="$EFFORT" SANDBOX="$SANDBOX" "$NODE" -e '
    const a = JSON.parse(require("fs").readFileSync(0, "utf8")); const e = process.env;
    a.push({ attempt: Number(e.A), rc: Number(e.RC), model: e.MODEL, effort: e.EFFORT, sandbox: e.SANDBOX,
      output_sha256: e.OSHA === "null" ? null : JSON.parse(e.OSHA), output_bytes: Number(e.OBYTES),
      varighed_mono_s: Number(e.MONO), varighed_vaeg_s: Number(e.VAEG), started: e.ST, ended: e.EN });
    process.stdout.write(JSON.stringify(a));') || { echo "attempt=$attempt kvitterings-opbygning fejlede → BLOKER" >> "$PROV"; return 2; }
  echo "attempt=$attempt rolle=$ROLLE model=$MODEL effort=$EFFORT sandbox=$SANDBOX timeout_s=$TIMEOUT_S rc=$rc leverance=$ok output_sha256=$osha varighed_mono_s=$((SECONDS - s0)) varighed_vaeg_s=$((t1 - t0)) slut=$ended" >> "$PROV"
  if [ "$ok" -eq 1 ]; then
    # publicér: OUT må ikke være blevet mappe/symlink i mellemtiden
    [ -d "$OUT" ] && { echo "attempt=$attempt OUT blev en mappe → BLOKER" >> "$PROV"; return 2; }
    [ -L "$OUT" ] && rm -f -- "$OUT"
    mv -f -- "$a_out" "$OUT" || { echo "attempt=$attempt publicering (mv) fejlede → BLOKER" >> "$PROV"; return 2; }
    [ -f "$OUT" ] && [ ! -L "$OUT" ] || { echo "attempt=$attempt publiceret fil er ikke en almindelig fil → BLOKER" >> "$PROV"; return 2; }
    return 0
  fi
  [ "$rc" -eq 0 ] && echo "attempt=$attempt rc=0 men ingen gyldig leverance (tom/symlink/manglende) → FEJL (fail-closed)" >> "$PROV"
  return 1
}

afslut_succes() {
  local attempt="$1"
  STATUS="success"
  skriv_kvittering || { echo "kvittering kunne ikke skrives → BLOKER (leverance trækkes tilbage)" >> "$PROV"; rm -f -- "$OUT" "$PIDFIL"; exit 1; }
  : > "$OUT.attempt$attempt.done"   # F-12: .done KUN efter publiceret leverance OG skrevet kvittering
  rm -f -- "$PIDFIL"; exit 0
}
run_once 1; rc1=$?
[ "$rc1" -eq 0 ] && afslut_succes 1
[ "$rc1" -eq 2 ] && blok "intern fejl i forsøg 1"
echo "attempt=1 FEJLEDE/TIMEOUT → ét genforsøg (samme model+effort+sandbox — aldrig tavs sænkning)" >> "$PROV"
run_once 2; rc2=$?
[ "$rc2" -eq 0 ] && afslut_succes 2
[ "$rc2" -eq 2 ] && blok "intern fejl i forsøg 2"
rm -f -- "$PIDFIL"
STATUS="fejl"; skriv_kvittering "to forsøg uden gyldig leverance"
echo "attempt=2 FEJLEDE → MANGLENDE RESULTAT = BLOKER (fail-closed)" >> "$PROV"
exit 1
