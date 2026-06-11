#!/usr/bin/env bash
# Codex-adapter (gov-5 B2, plan V21 step 5) — TRANSPORT-wrapper.
# Kontrakt: exit 0 = leverance LEVERET som fil (indholdet bærer selv markers);
# alt andet = kørsel fejlede (kuréren STOPPER kæden — ingen stille videre).
# Adapteren committer ALDRIG — kurérens transport-commit fryser leverancen.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

OPGAVE="${KAEDE_OPGAVE:?KAEDE_OPGAVE mangler}"
SPOR="${KAEDE_SPOR:?KAEDE_SPOR mangler}"
FIL="${KAEDE_FIL:-}"
SHA="${KAEDE_SHA:-}"
DATO="$(date +%Y-%m-%d)"

naeste_runde() {
  ls "docs/coordination/codex-reviews/" 2>/dev/null \
    | grep -oE -- "-runde-[0-9]+" | grep -oE "[0-9]+" | sort -n | tail -1 \
    | awk '{print $1 + 1}' || echo 1
}

case "$OPGAVE" in
  plan-review)
    scripts/codex-review.sh "docs/coordination/${SPOR}-plan.md" "$(naeste_runde)" --phase=plan
    ;;
  batch-review)
    scripts/codex-review.sh "docs/coordination/${SPOR}-plan.md" "$(naeste_runde)" --phase=build
    ;;
  docs-review)
    scripts/codex-review.sh "${FIL:-docs/coordination/${SPOR}-plan.md}" "$(naeste_runde)" --phase=docs --quick
    ;;
  kode-research | recon-research)
    # Uafhængig kode-recon (V8-kædestart / §2.1-parallel): producerer recon-doc,
    # IKKE et review. Output untracked → kurérens transport-commit.
    UD="docs/coordination/${SPOR}-recon-research.md"
    [ "$OPGAVE" = "kode-research" ] && UD="docs/coordination/codex-reviews/${DATO}-${SPOR}-kode-research.md"
    PROMPT="Du er Codex i Stork 2.0 — uafhængig kode-recon (read-only, disciplin §9.3).
Læs FØR arbejde: docs/LÆSEFØLGE.md's seks dokumenter + faktisk kode (migrations, RPC'er, policies).
OPGAVE: uafhængig recon af NUVÆRENDE kode for pakke '${SPOR}' — teknisk realiserbarhed,
blind-vinkler, divergens mellem master-plan-forventning og faktisk kode-state.
Hvert fund med file:linje. Ingen forretnings-tolkning (Claude.ai's bord), ingen krav-dok-indhold.
Skriv HELE leverancen som markdown til stdout — den gemmes som ${UD}."
    timeout --signal=KILL 480 codex exec --skip-git-repo-check \
      -c 'model_reasoning_effort="xhigh"' --enable fast_mode \
      "$PROMPT" > "$UD" 2>/dev/null < /dev/null
    [ -s "$UD" ] || { echo "recon-output tom" >&2; exit 1; }
    ;;
  sparring-svar | agree-refine-escalate)
    UD="docs/coordination/codex-reviews/${DATO}-${SPOR}-svar-$(naeste_runde).md"
    timeout --signal=KILL 240 codex exec --skip-git-repo-check \
      -c 'model_reasoning_effort="medium"' --enable fast_mode \
      "Du er Codex (Stork 2.0, §9.3). Besvar §5-leverancen i ${FIL} (frossen @ ${SHA}) per FLAG→LØS-disciplinen (AGREE/REFINE/ESCALATE eller CONFIRM/TIMING/AVOID). Kort, konkret, file:linje. Skriv svaret som markdown til stdout." \
      > "$UD" 2>/dev/null < /dev/null
    [ -s "$UD" ] || { echo "svar-output tom" >&2; exit 1; }
    ;;
  *)
    echo "Ukendt KAEDE_OPGAVE for codex-adapter: $OPGAVE" >&2
    exit 64
    ;;
esac
