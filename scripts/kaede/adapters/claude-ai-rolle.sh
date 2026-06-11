#!/usr/bin/env bash
# Claude.ai-rolle-adapter (gov-5 B2, plan V21 step 7) — headless rolle-kørsel.
# Kontrakt: exit 0 = leverance skrevet UNTRACKED (kuréren fryser via transport-
# commit). Rollen committer aldrig; instruksen bærer §9.1-grænser + TILLÆG 1.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

OPGAVE="${KAEDE_OPGAVE:?KAEDE_OPGAVE mangler}"
SPOR="${KAEDE_SPOR:?KAEDE_SPOR mangler}"
FIL="${KAEDE_FIL:-}"
SHA="${KAEDE_SHA:-}"
INSTRUKS="$(cat scripts/kaede/claude-ai-rolle-instruks.md)"

case "$OPGAVE" in
  krav-troskabs-tjek) DETALJE="Udfør krav-troskabs-tjek: krav-dok docs/coordination/${SPOR}-krav-og-data.md SÆTNING FOR SÆTNING mod den frosne plan (${FIL} @ ${SHA} — angiv 'Plan-SHA: ${SHA}' i header)." ;;
  recon-syntese)      DETALJE="Udfør recon-syntese for '${SPOR}': læs forretningsforstaaelse + ${SPOR}-recon-kode.md + ${SPOR}-recon-research.md → recon-oplaeg til Mathias." ;;
  slut-rapport-review) DETALJE="Review slut-rapporten (${FIL} @ ${SHA}) mod krav-dok + formål + faktisk repo-state." ;;
  gate-anmodning)     DETALJE="Skriv fund-gate-pakke for fundet i ${FIL} @ ${SHA} (forretningssprog, konklusion først)." ;;
  *) echo "Ukendt KAEDE_OPGAVE for claude-ai-rolle-adapter: $OPGAVE" >&2; exit 64 ;;
esac

PROMPT="${INSTRUKS}

AKTUEL OPGAVE (pakke '${SPOR}'): ${DETALJE}
Skriv leverancen som UNTRACKED fil per formatet ovenfor. Commit INTET."

timeout --signal=KILL 1800 claude -p --dangerously-skip-permissions "$PROMPT" < /dev/null
