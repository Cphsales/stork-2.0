# Codex review — gov-5-automation runde 19

**Pakke:** gov-5-automation
**Fase:** plan
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** 1f29e45
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 19 --xhigh --phase=plan` (re-run via samme args inkl. flags)

---

[KRITISK] P3-bogføringssnittet er ikke ført gennem beslutningssti-helperen  
Konkret afvigelse: Planen un-owner `docs/coordination/*-krav-og-data.md` og `/docs/coordination/arkiv/` som bogføring, men `scripts/kaede/tilstand.mjs:114-125` mangler begge mønstre, og selftesten forventer stadig at krav-dok/arkiv IKKE er bogføring (`dirigent.selftest.mjs:541-548`). Da `laesBuildPr` bruger `!erBogfoeringsSti` til `beslutningsSti`, vil rene krav-dok-merge/arkiv-PR’er stadig udløse Mathias review-request. Det modsiger krav 2/3 og planens “0 bogførings-klik”.  
Anbefalet handling: V11-rettelse: P7 skal patch-først inkludere `BOGFOERING_RES` + selftest-sektion 19 + 11b-cases for mindst `*-krav-og-data.md` og `arkiv/`.

§8.1-SVAR: INGEN-MODSIGELSE
