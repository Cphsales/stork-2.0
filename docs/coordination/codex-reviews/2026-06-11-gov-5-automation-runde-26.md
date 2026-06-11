# Codex review — gov-5-automation runde 26

**Pakke:** gov-5-automation
**Fase:** plan
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** fad8c5e
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 26 --xhigh --phase=plan` (re-run via samme args inkl. flags)

---

[KRITISK] Krav-dok-udkast bliver ikke samlet op af kæden  
Konkret afvigelse: Planen siger at `krav-dok-udkast` som untracked krav-dok transport-committes og hash-postes ([plan](/home/mathias/stork-2.0/docs/coordination/gov-5-automation-plan.md:159)), men `laesTilstand` samler kun `codex-reviews/`, `plan-feedback/`, `rapport-historik/` og aktiv statusfil op som leverancer ([tilstand.mjs](/home/mathias/stork-2.0/scripts/kaede/tilstand.mjs:218)). `docs/coordination/*-krav-og-data.md` får heller ingen planlagt type-inferens, så hash/krav OK-leddet kan ikke køre end-to-end.  
Anbefalet handling: V18-rettelse.

[MANGLENDE-EKSISTERENDE-BEVARELSE] P7(a) ændrer `leverance_typer` uden 1:1-current body  
Konkret afvigelse: V17 ændrer `review-approval`, tilføjer `troskabs-verdikt`, `krav-dok-udkast` og `afsender`, men P7(a)'s 1:1-blok citerer kun `events` ([plan](/home/mathias/stork-2.0/docs/coordination/gov-5-automation-plan.md:329)); den faktiske berørte body er `leverance_typer` ([kaede-regler.json](/home/mathias/stork-2.0/scripts/kaede/kaede-regler.json:18)).  
Anbefalet handling: V18-rettelse.

[MELLEM] Pakke-status matcher ikke runden  
Konkret afvigelse: Status siger “Codex runde 26 dispatchet”, men “Næste forventet” siger “Codex runde 25” ([status](/home/mathias/stork-2.0/docs/coordination/gov-5-automation-status.md:3)). Det er netop den stale-state klasse planen påstår at selvtjekket skal fange.  
Anbefalet handling: V18-rettelse.

§8.1-SVAR: INGEN-MODSIGELSE
