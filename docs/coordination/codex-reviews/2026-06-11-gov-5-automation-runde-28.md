# Codex review — gov-5-automation runde 28

**Pakke:** gov-5-automation
**Fase:** plan
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** a4700ca
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 28 --xhigh --phase=plan` (re-run via samme args inkl. flags)

---

[KRITISK] `qwers <pakke>` taber stadig pakke-identiteten  
Konkret afvigelse: Åbning sker netop når `aktiv-pakke: ingen`, men P7(e) bevarer `spor = tilstand.marker?.pakke ?? "ingen"` og event-dispatch-kontekst uden `ev.pakke`. P7(b) parser pakken fra `qwers`, men planen kræver ikke at `gov-6-arkiv-fold` føres videre til adapters/status/pr.-pakke issue. Recon kan derfor starte på `spor=ingen`, og senere `<aktivPakke>-krav-og-data`-watcheren mangler anker.  
Anbefalet handling: V20-rettelse

[KRITISK] `krav-dok-udkast` har hash-post som prosa, ikke regelbogsvej  
Konkret afvigelse: V19 tilføjer pickup/type-inferens i P7(f), men P7(a)’s `leverance_typer`-diff navngiver kun `krav-dok-udkast`; den angiver ikke eksplicit `{modtager: "mathias", opgave: "hash-post"}` eller selftest-case. `decide()` router committed leverancer via `regler.leverance_typer[type]`, så hash-post-leddet er ikke patch-først/end-to-end lukket.  
Anbefalet handling: V20-rettelse

§8.1-SVAR: INGEN-MODSIGELSE
