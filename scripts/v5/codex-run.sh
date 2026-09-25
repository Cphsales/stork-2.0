#!/usr/bin/env bash
# codex-run.sh — den eneste vej til Codex (disciplin.md §6).
#
# Isolation: Codex får et privat Codex-hjem med kun en kopi af login (auth.json) og ingen
# config.toml, så den lokale opsætning aldrig arves. Miljøet er en allowlist. Netværk er slået
# fra; /tmp og $TMPDIR er ikke skrivbare. Domme kører kun-læse; test-produktion må skrive i workdir.
# Rolleteksten (scripts/v5/roller/<rolle>.md) sendes forrest i prompten. Timeout og ét genforsøg.
#
# Brug: codex-run.sh <rolle> <dom|produktion> <workdir> <timeout-sek> <output-fil> <prompt-fil>
# Env:  STORK_V5_CODEX_MODEL (standard gpt-6-astra) · STORK_V5_CODEX_EFFORT (standard xhigh)
set -u
umask 077
[ $# -eq 6 ] || { echo "brug: codex-run.sh <rolle> <dom|produktion> <workdir> <timeout-sek> <output-fil> <prompt-fil>" >&2; exit 2; }
ROLLE="$1"; AKT="$2"; WORKDIR="$3"; TIMEOUT_S="$4"; OUT="$5"; PROMPTFIL="$6"
MODEL="${STORK_V5_CODEX_MODEL:-gpt-6-astra}"; EFFORT="${STORK_V5_CODEX_EFFORT:-xhigh}"
fejl() { echo "codex-run: $*" >&2; exit 1; }

case "$AKT" in dom) SANDBOX=read-only ;; produktion) SANDBOX=workspace-write ;; *) fejl "aktivitet skal være dom eller produktion" ;; esac
case "$ROLLE" in *[!a-z0-9-]*|"") fejl "ugyldigt rollenavn" ;; esac
[[ "$TIMEOUT_S" =~ ^[1-9][0-9]*$ ]] || fejl "timeout skal være et positivt heltal"
REPO=$(cd -- "$(dirname -- "$0")/../.." && pwd -P) || fejl "repoet findes ikke"
ROLLETEKST="$REPO/scripts/v5/roller/$ROLLE.md"
[ -f "$ROLLETEKST" ] || fejl "rolleteksten findes ikke: $ROLLETEKST"
[ -d "$WORKDIR" ] || fejl "workdir findes ikke: $WORKDIR"
[ -f "$PROMPTFIL" ] || fejl "promptfilen findes ikke: $PROMPTFIL"
CODEX=$(command -v codex) || fejl "codex findes ikke på PATH"
AUTH_SRC="$HOME/.codex/auth.json"
[ -f "$AUTH_SRC" ] && [ ! -L "$AUTH_SRC" ] || fejl "log ind med 'codex login' først ($AUTH_SRC mangler)"

RUNDIR=$(mktemp -d) || fejl "kan ikke oprette kørselsmappe"
trap 'rm -rf -- "$RUNDIR"' EXIT
mkdir -m 700 "$RUNDIR/codex-home"
cp -- "$AUTH_SRC" "$RUNDIR/codex-home/auth.json" && chmod 600 "$RUNDIR/codex-home/auth.json"
auth_tilbage() { cmp -s "$RUNDIR/codex-home/auth.json" "$AUTH_SRC" || cp -- "$RUNDIR/codex-home/auth.json" "$AUTH_SRC"; }

PROMPT="$(cat -- "$ROLLETEKST")

---

$(cat -- "$PROMPTFIL")"

kald() {
  env -i PATH="$(dirname -- "$CODEX"):/usr/bin:/bin" HOME="$RUNDIR" CODEX_HOME="$RUNDIR/codex-home" LANG=C.UTF-8 \
    timeout --signal=KILL "${TIMEOUT_S}s" "$CODEX" exec --skip-git-repo-check --sandbox "$SANDBOX" \
      -c sandbox_workspace_write.network_access=false \
      -c sandbox_workspace_write.exclude_slash_tmp=true \
      -c sandbox_workspace_write.exclude_tmpdir_env_var=true \
      -m "$MODEL" -c model_reasoning_effort="$EFFORT" \
      --cd "$WORKDIR" -o "$RUNDIR/svar" "$PROMPT" < /dev/null >> "$OUT.log" 2>&1
}

for forsoeg in 1 2; do
  rm -f -- "$RUNDIR/svar"
  kald; rc=$?
  auth_tilbage
  if [ "$rc" -eq 0 ] && [ -s "$RUNDIR/svar" ] && [ ! -L "$RUNDIR/svar" ]; then
    mv -f -- "$RUNDIR/svar" "$OUT" || fejl "kan ikke skrive $OUT"
    echo "codex-run: rolle=$ROLLE aktivitet=$AKT model=$MODEL effort=$EFFORT sandbox=$SANDBOX forsøg=$forsoeg ok" >> "$OUT.log"
    exit 0
  fi
  echo "codex-run: forsøg $forsoeg uden svar (rc=$rc)" >> "$OUT.log"
done
fejl "to forsøg uden svar — se $OUT.log"
