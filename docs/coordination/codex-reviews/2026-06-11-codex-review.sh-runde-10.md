# Codex review — codex-review.sh runde 10

**Pakke:** codex-review.sh
**Fase:** build
**Plan-fil:** scripts/codex-review.sh
**Plan-SHA:** adc5be4
**Dato:** 2026-06-11
**Reasoning:** medium
**Model:** gpt-5.5
**Varighed:** 100s
**Max ord:** 150
**Command:** `scripts/codex-review.sh scripts/codex-review.sh 10 --quick --phase=build` (re-run via samme args inkl. flags)

---

[KRITISK] Plan-SHA er ikke bundet til det reviewede indhold  
Konkret afvigelse: `scripts/codex-review.sh` sætter `PLAN_SHA` med `git rev-parse --short HEAD`, men tjekker ikke om `$PLAN_FILE` er dirty/unstaged, og hasher ikke filindholdet. Review-output kan derfor se SHA-bundet ud, mens Codex faktisk har læst en anden, uncommitted version af planen/filen. Det bryder disciplinens SHA-bundne rolle-godkendelse.  
Anbefalet handling: [V11-rettelse] Fail ved dirty `$PLAN_FILE`, eller skriv en egentlig content-hash for den reviewede fil og brug den som binding.
