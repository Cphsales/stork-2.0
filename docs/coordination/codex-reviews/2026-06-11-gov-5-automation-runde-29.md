# Codex review — gov-5-automation runde 29

**Pakke:** gov-5-automation
**Fase:** plan
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** 80d9225
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 29 --xhigh --phase=plan` (re-run via samme args inkl. flags)

---

[KRITISK] `krav-dok-udkast` routes ikke efter transport-commit  
Konkret afvigelse: `gov-5-automation-plan.md:769` gør krav-dok-udkastet til leverance-bærer “kun untracked”, men `decide()`-flowet er untracked → `TRANSPORT-COMMIT`, og routing sker først næste cyklus på committed leverancer. Dermed forsvinder filen fra `leveranceStier` præcis før `hash-post` skal dispatches. End-to-end-leddet “dialog-fil → transport-commit → hash-post → krav OK <hash>” er derfor ikke mekanisk lukket.  
Anbefalet handling: V21-rettelse: behold krav-dok-udkastet i leverance-listen efter commit indtil behandlet, med type-inferens + selftest: untracked krav-dok → transport-commit → næste cyklus `DISPATCH mathias/hash-post`.

[KRITISK] Qwers-spor bruges kun i dispatch-kontekst, ikke i lås/VENT  
Konkret afvigelse: P7(e) ændrer event-dispatch-kontekst til `spor: ev.pakke ?? spor`, men låsechecket i event-loopet bruger stadig `spor` fra marker-state. Ved åbning er marker `ingen`; en gentaget poll mens recon kører vil derfor ikke se låsen på det qwers-bårne pakkenavn og kan starte dublet-dispatch for samme aktør/spor.  
Anbefalet handling: V21-rettelse: udled `eventSpor = ev.pakke ?? spor` før betingelser/lås/dispatch og brug den konsekvent. Tilføj selftest: marker=`ingen`, qwers-event med pakke, eksisterende lås på pakken → `VENT`, ikke ny dispatch.

§8.1-SVAR: INGEN-MODSIGELSE
