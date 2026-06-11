#!/usr/bin/env bash
# Kæde-preflight (gov-5 B4, plan V21 step 10) — verificér-før-tillid.
# Køres af systemd (ExecStartPre) og manuelt. Exit ≠ 0 = hosting-krav ikke
# opfyldt → kæden starter IKKE (fail-closed; manuelt flow består, krav 7).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
FEJL=0
tjek() { if eval "$2" > /dev/null 2>&1; then echo "  ✓ $1"; else echo "  ✗ $1"; FEJL=1; fi; }

echo "Kæde-preflight (step 10):"
tjek "git findes"            "command -v git"
tjek "gh findes + auth"      "gh auth status"
tjek "gh-konto er bot"       "gh auth status 2>&1 | grep -q 'Active account: true' && gh auth status 2>&1 | grep -B2 'Active account: true' | grep -q stork-code-bot"
tjek "claude CLI findes"     "command -v claude"
tjek "codex CLI findes"      "command -v codex"
tjek "node ≥ 20"             "[ \"\$(node -e 'console.log(parseInt(process.versions.node))')\" -ge 20 ]"
tjek "kaede_issue sat (åbningsflade)" "node -e 'const r=require(\"./scripts/kaede/kaede-regler.json\"); process.exit(r.kaede_issue ? 0 : 1)'"
tjek "linger aktiv (services overlever session-luk)" "loginctl show-user \$USER -p Linger | grep -q 'Linger=yes'"

# Baseline (runde 32-værnet): uden dispatch-log nægter dirigenten live-kørsel.
if [ ! -f scripts/kaede/.dispatch-log.jsonl ]; then
  echo "  ▶ ingen dispatch-log — kører --baseline (seeder historikken som behandlet)"
  node scripts/kaede/dirigent.mjs --baseline
fi
tjek "dispatch-log findes (baseline)" "[ -f scripts/kaede/.dispatch-log.jsonl ]"

if [ "$FEJL" -ne 0 ]; then
  echo "Preflight FEJLEDE — kæden starter ikke (fail-closed). Ret ✗-punkterne."
  echo "Linger aktiveres med: loginctl enable-linger \$USER (kan kræve sudo på WSL2)."
  exit 1
fi
echo "Preflight OK — kæden kan hostes."
