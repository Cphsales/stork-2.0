#!/usr/bin/env bash
# Kæde-preflight (gov-5 B4, plan V21 step 10) — verificér-før-tillid.
# Køres af systemd (ExecStartPre) og manuelt. Exit ≠ 0 = hosting-krav ikke
# opfyldt → kæden starter IKKE (fail-closed; manuelt flow består, krav 7).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
# Node afledt af .nvmrc (rette-til punkt 5) — samme opløsning som unit'ens
# ExecStart; preflighten BEVISER bagefter at node matcher .nvmrc.
# shellcheck source=/dev/null
source scripts/kaede/node-env.sh
FEJL=0
tjek() { if eval "$2" > /dev/null 2>&1; then echo "  ✓ $1"; else echo "  ✗ $1"; FEJL=1; fi; }

# Persistent KAEDE-STOP (rette-til punkt 11a, rodårsag #147): preflight nægter
# at køre forbi stop-filen — ellers genopliver Restart=on-failure en stoppet
# kæde hvert 30s (nat 11→12/6: preflight var grøn hver gang og forhindrede
# intet). Genåbning er Mathias' handling: håndtér årsagen og fjern filen
# (aktiverings-tjekliste). Exit 78 matcher RestartPreventExitStatus i unit'en.
if [ -f scripts/kaede/.kaede-stop ]; then
  echo "✗ Persistent KAEDE-STOP aktiv: $(cat scripts/kaede/.kaede-stop)"
  echo "Kæden starter IKKE. Genåbning: håndtér årsagen og fjern scripts/kaede/.kaede-stop (Mathias-handling)."
  exit 78
fi

echo "Kæde-preflight (step 10):"
tjek "git findes"            "command -v git"
tjek "gh findes + auth"      "gh auth status"
tjek "gh-konto er bot"       "gh auth status 2>&1 | grep -q 'Active account: true' && gh auth status 2>&1 | grep -B2 'Active account: true' | grep -q stork-code-bot"
tjek "claude CLI findes"     "command -v claude"
tjek "codex CLI findes"      "command -v codex"
tjek "node ≥ 20"             "[ \"\$(node -e 'console.log(parseInt(process.versions.node))')\" -ge 20 ]"
tjek "node matcher .nvmrc (punkt 5: afledning bevist)" "[ \"\$(node -p 'process.versions.node.split(\".\")[0]')\" = \"\$(tr -d 'v[:space:]' < .nvmrc)\" ]"
tjek "kaede_issue sat (åbningsflade)" "node -e 'const r=require(\"./scripts/kaede/kaede-regler.json\"); process.exit(r.kaede_issue ? 0 : 1)'"
tjek "linger aktiv (services overlever session-luk)" "loginctl show-user \$USER -p Linger | grep -q 'Linger=yes'"

# Issue-write-probe (rette-til punkt 9b, fund 2026-06-11 aften: bot-PAT fik 403
# på issue-kommentar — kædens notifikations-led ville fejle ved recon-klar).
# Verificér-før-tillid: reaction add+delete på kæde-issuet beviser issues:write
# UDEN at røre kommentarer/gate-ord (ingen mobil-notifikation). Fail-closed:
# 403/fejl → preflight rød. Token-scope-fixet selv er Mathias' admin-flade.
KAEDE_ISSUE="$(node -p 'require("./scripts/kaede/kaede-regler.json").kaede_issue ?? ""')"
probe_issue_write() {
  local rid
  rid="$(gh api -X POST "repos/{owner}/{repo}/issues/${KAEDE_ISSUE}/reactions" -f content=eyes --jq .id 2> /dev/null)" || return 1
  gh api -X DELETE "repos/{owner}/{repo}/issues/${KAEDE_ISSUE}/reactions/${rid}" > /dev/null 2>&1 || true
  return 0
}
tjek "issue-write-adgang (probe: reaction add/delete på #${KAEDE_ISSUE})" "probe_issue_write"

# Værts-krav SKAL være grønne FØR baseline (Codex runde 39: baseline-loggen er
# live-guardens trust anchor — den må aldrig seedes på en fejlet vært).
if [ "$FEJL" -ne 0 ]; then
  echo "Preflight FEJLEDE før baseline — kæden starter ikke (fail-closed). Ret ✗-punkterne."
  echo "Linger aktiveres med: loginctl enable-linger \$USER (kan kræve sudo på WSL2)."
  exit 1
fi

# Baseline (runde 32-værnet): uden dispatch-log nægter dirigenten live-kørsel.
# Fejler seeding, fjernes den delvise log — ingen delvist betroet state.
if [ ! -f scripts/kaede/.dispatch-log.jsonl ]; then
  echo "  ▶ ingen dispatch-log — kører --baseline (seeder historikken som behandlet)"
  if ! node scripts/kaede/dirigent.mjs --baseline; then
    rm -f scripts/kaede/.dispatch-log.jsonl
    echo "Preflight FEJLEDE: baseline-seeding fejlede — delvis log fjernet (fail-closed)."
    exit 1
  fi
fi
tjek "dispatch-log findes (baseline)" "[ -f scripts/kaede/.dispatch-log.jsonl ]"

if [ "$FEJL" -ne 0 ]; then
  echo "Preflight FEJLEDE — kæden starter ikke (fail-closed)."
  exit 1
fi
echo "Preflight OK — kæden kan hostes."
echo ""
echo "MANUELT TJEK (rette-til punkt 9a — mobil-MODTAGE-siden, Mathias bekræfter; mekanisk utestbart):"
echo "  ☐ GitHub Mobile installeret + logget ind som mgrubak"
echo "  ☐ Push-notifikationer TIL for Cphsales/stork-2.0 (issues + review-requests)"
echo "    Kædens gate-ord-anmodninger og review-requests SKAL kunne MODTAGES på mobilen — ellers venter kæden i stilhed."
