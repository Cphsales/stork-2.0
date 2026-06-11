# Codex review — gov-5-automation runde 24

**Pakke:** gov-5-automation
**Fase:** plan
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** c6557d0
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 24 --xhigh --phase=plan` (re-run via samme args inkl. flags)

---

[KRITISK] `krav-dok-udkast` har ingen faktisk kæde-vej  
Konkret afvigelse: V15 siger ny leverance-type `krav-dok-udkast` = untracked `*-krav-og-data.md` → transport-commit + hash-post. Men P7 tilføjer ikke typen i `kaede-regler.json`, udvider ikke `laesTilstand`’s `leveranceStier`, og beskriver ingen filename-type-inferens eller mathias-hash-post. Den fil bliver derfor ikke observeret/routet.  
Anbefalet handling: V16-rettelse.

[KRITISK] Codex-APPROVAL → krav-troskabs-PASS deadlocker  
Konkret afvigelse: Planen kræver Claude.ai krav-troskabs-tjek efter Codex-APPROVAL før build. Men eksisterende `review-approval` ruter til `code/build-start`, og V15 beskriver kun en `build-start`-betingelse på `troskabs-pass`; ingen regel producerer PASS ved først at dispatche Claude.ai. Resultat: build-start blokeres, men PASS-leverancen vækkes aldrig.  
Anbefalet handling: V16-rettelse.

[KRITISK] Selvtjek før frys er ikke ført ind i transport-commit-reglen  
Konkret afvigelse: V15 accepterer Mathias’ forslag om `selvtjek` FØR transport-commit. P7(e) ændrer kun DISPATCH-betingelser; den aktuelle regel 3 transport-committer untracked leverancer uden type-/selvtjek-evaluering. `SELVTJEK-FEJL`-routing er heller ikke konkret patch-først beskrevet.  
Anbefalet handling: V16-rettelse.

[MELLEM] Pakke-status’ “Næste forventet” er stale  
Konkret afvigelse: status siger “Codex runde 23”, mens samme fil siger runde 24 er dispatchet på V15.  
Anbefalet handling: G-nummer eller V16-kosmetisk status-sync.

§8.1-SVAR: INGEN-MODSIGELSE
