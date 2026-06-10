# Codex review — gov-4-branch-protection runde 1

**Pakke:** gov-4-branch-protection
**Fase:** plan
**Plan-fil:** docs/coordination/gov-4-branch-protection-plan.md
**Plan-SHA:** beab277
**Dato:** 2026-06-10
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-4-branch-protection-plan.md 1 --xhigh --phase=plan` (re-run via samme args inkl. flags)

---

[KRITISK] Bot-planen kan ikke udføre branch-protection API-kaldene  
Konkret afvigelse: Planen giver botten kun `write` + contents/pull-requests PAT, men step 3-4 PATCH’er branch protection. Det kræver admin/administration-write.  
Anbefalet handling: V2-rettelse: Mathias udfører API/UI-step selv, eller bot får eksplicit tidsbegrænset repo-admin + Administration write.

[KRITISK] Required CodeQL-context er ikke bevist korrekt  
Konkret afvigelse: Planen kræver `CodeQL`, men aktuelle PR-checks viser analyse-jobs som `Analyze (actions)` og `Analyze (javascript-typescript)`, mens `CodeQL` er separat/neutral aggregate. Forkert context kan give hul eller brick.  
Anbefalet handling: V2-rettelse: kræv de konkrete analyse-checks, eller dokumentér råt at `CodeQL`-aggregatet fejler ved analyse-fejl.

[MELLEM] G061 “før gov-4” ignoreres  
Konkret afvigelse: `teknisk-gaeld.md` siger G061 skal løses før gov-4, men planen siger 0 migrations og `teknisk-gaeld.md: nej`.  
Anbefalet handling: V2-rettelse / G061: luk G061 før aktivering, eller rebaseline deadline eksplicit.

[MELLEM] Eksisterende branch-protection-doc efterlades stale  
Konkret afvigelse: `.github/BRANCH_PROTECTION.md` beskriver reviews=0, code-owner-review=false og kun én required check. Planen ændrer netop dette, men doc’en er ikke i patch-/doc-listen.  
Anbefalet handling: V2-rettelse: opdater eller deprecér filen patch-først.

§8.1-SVAR: INGEN-MODSIGELSE
