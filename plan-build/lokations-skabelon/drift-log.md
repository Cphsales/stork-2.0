# drift-log — lokations-skabelon (driver-hændelser til Fase 6-retrospektivet)

## 2026-09-08
- ~13-17: To codex-hæng viste sig at være stdin-blokering i baggrundskørsler (codex læser åben stdin som ekstra input). Rodårsag lukket i codex-run.sh (< /dev/null). Wrapper hærdet: succes kræver rc=0 OG ikke-tom output-fil (pkill-episoden viste rc=0 uden leverance = fail-open-fælde).
- 17:06: Driverens pkill -f "codex exec" var for bred — dræbte egen batch-pas/angreb/p4 OG review-sporets analyse-kørsel. Lærdom: PID-fil pr. wrapper-kørsel, aldrig brede mønstre. (Wrapper-ændring afventer at kørende instanser er færdige.)
- 17:13: **Codex-workspace løb tør for credits** (ekstern årsag — IKKE fabrikken). Batch-pas (register-hærdning) + plan-angreb døde på credits efter retry; p4-plan-kildetjek kører (startet før stoppet). KONSEKVENS: alle Codex-aktører blokeret til Mathias fylder på. Register står korrekt RØDT (verdikt.mjs + 4 nye moduler afventer pas) — INGEN push af M-39/M-40-commits før pas er kørt og suiten er grøn. GENKØRSELS-LISTE efter credits: (1) M-40 batch-pas (register) · (2) plan-ANGREB fra start · (3) p4-plan HVIS den døde. Claude-side arbejde fortsætter uhindret.
