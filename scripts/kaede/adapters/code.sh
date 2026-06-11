#!/usr/bin/env bash
# Code-adapter (gov-5 B2, plan V21 step 6) — headless Code-kørsel.
# Kontrakt: exit 0 = leverance leveret + committet (Code committer EGNE
# leverancer, §1) + pakke-status opdateret m. →NÆSTE-deklaration som sidste
# linje. STOP-betingelser (§9.2) → gate-fil i mathias-gate/ + exit 3.
# Verificér-før-tillid (plan: step 9-dry-run beviser auth + format før tillid).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

OPGAVE="${KAEDE_OPGAVE:?KAEDE_OPGAVE mangler}"
SPOR="${KAEDE_SPOR:?KAEDE_SPOR mangler}"
FIL="${KAEDE_FIL:-}"
SHA="${KAEDE_SHA:-}"

# Opgave-instruks (rollen bærer dømmekraften — adapteren bærer kun rammen)
case "$OPGAVE" in
  recon-kode)        DETALJE="Recon af NUVÆRENDE kodes FORRETNINGSSIDE for pakke '${SPOR}' (V8-kædestart): hvordan rettigheder, PII-klassifikation og lifecycle REELT fungerer i koden — præcis den info krav-dokket skal stå på. Skriv docs/coordination/${SPOR}-recon-kode.md (untracked — kuréren fryser; du committer den IKKE). Forretningssprog m. file:linje-belæg." ;;
  plan-start)        DETALJE="Start plan-fasen for '${SPOR}': DB-state-dump (§3.2), G/H-opslag, plan-V1 per §10.2 på docs/coordination/${SPOR}-plan.md + opret ${SPOR}-status.md (§3.5). Commit+push dine leverancer." ;;
  naeste-version)    DETALJE="Reviewet i ${FIL} (frossen @ ${SHA}) kræver næste plan-version: håndtér hvert fund eksplicit (ACCEPT/PUSHBACK/PROPOSE-ALTERNATIVE), skriv V<n+1>, commit+push." ;;
  build-start)       DETALJE="Plan for '${SPOR}' er rolle-godkendt (Codex-APPROVAL + troskabs-PASS — betingelser mekanisk verificeret). Byg per implementations-rækkefølgen i batches m. selvtjek; commit+push pr. batch." ;;
  fund-haandtering)  DETALJE="KODE-FUND delt i ${FIL} (frossen @ ${SHA}): håndtér per §5 (ACCEPT/PUSHBACK/PROPOSE-ALTERNATIVE), levér svar/rettelse, commit+push." ;;
  adopt-defer-dismiss) DETALJE="OPTIMERING-FORSLAG i ${FIL}: svar ADOPT/DEFER/DISMISS m. begrundelse (§5), commit+push." ;;
  fortsaet)          DETALJE="Sparring-svar modtaget i ${FIL}: fortsæt det igangværende arbejde med svaret indarbejdet." ;;
  slut-rapport)      DETALJE="Build-PR for '${SPOR}' er merged: skriv slut-rapporten per §10.3 i docs/coordination/rapport-historik/ + opdater seneste-rapport.md, commit+push." ;;
  krav-dok-merge)    DETALJE="krav OK-hash er registreret og hash-match-betingelsen er mekanisk verificeret: merge krav-dokket for '${SPOR}' til main (PR + auto-merge på grøn CI — bogførings-sti). Du merger ALDRIG hvis hash-betingelsen ikke allerede var opfyldt (kuréren håndhæver)." ;;
  slut-merge)        DETALJE="slut OK er registreret (author-verificeret) + Claude.ai-APPROVAL foreligger: merge slut-rapport-PR'en for '${SPOR}' (ordet er gaten — klikket er bogføring)." ;;
  gate-afgjort-fortsaet) DETALJE="Mathias har GODKENDT gaten (kæde-issue ${SHA}): genoptag arbejdet for '${SPOR}' i lyset af afgørelsen (gate-filen bærer den ordret)." ;;
  gate-afvist-alternativ) DETALJE="Mathias har AFVIST gaten (kæde-issue ${SHA}): lever alternativet/justeringen per afgørelsen i gate-filen." ;;
  selvtjek-fejl-rettelse) DETALJE="Din leverance ${FIL} fejlede selvtjek FØR frys (se scripts/kaede/.dispatch-log.jsonl for tjek-detaljer): ret leverancen — den fryses først når selvtjekket består." ;;
  *) echo "Ukendt KAEDE_OPGAVE for code-adapter: $OPGAVE" >&2; exit 64 ;;
esac

PROMPT="qwers ${SPOR} — du er Code i Stork 2.0 (headless kæde-kørsel, disciplin §9.2).
Følg docs/LÆSEFØLGE.md (branch-bevidst sync FØRST). Pakke-status er kontekst (§3.5).
OPGAVE: ${DETALJE}
ALTID til sidst: opdater docs/coordination/${SPOR}-status.md (sidste handling /
næste forventet / konvergens-counter / blocker) og afslut filen med præcis én
deklarations-linje '→NÆSTE: <aktør> [<leverance-type>]' (vækningsretten er din).
STOP-betingelser (§9.2/§12): skriv mathias-gate-fil (Status: AFVENTER MATHIAS) og
afslut med exit-kode 3 — byg ALDRIG videre forbi et STOP."

timeout --signal=KILL 3600 claude -p --dangerously-skip-permissions "$PROMPT" < /dev/null
