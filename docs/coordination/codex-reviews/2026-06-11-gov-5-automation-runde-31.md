# Codex review — gov-5-automation runde 31

**Pakke:** gov-5-automation
**Fase:** build
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** ccb22c5
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 31 --xhigh --phase=build` (re-run via samme args inkl. flags)

---

[KRITISK] Recon-leverancer transport-committes ikke  
Konkret afvigelse: Planen kræver qwers → Code/Codex recon-docs → transport-commit → Claude.ai syntese, og gov-6 skal bevise “recon-leverancer transport-committet”. Men `laesTilstand()` samler kun `codex-reviews/`, `plan-feedback/`, `rapport-historik/`, status og krav-dok som leverance-bærere; `*-recon-kode.md`, `*-recon-research.md`, `*-recon-oplaeg.md` indgår ikke. Samtidig afleder den recon-klarhed via rå `existsSync`, så untracked recon-filer kan drive næste led uden frys.  
Anbefalet handling: V22-rettelse.

[KRITISK] Pr.-pakke kæde-issue læses ikke  
Konkret afvigelse: Planen siger at stående issue bærer `qwers`, mens pr.-pakke issue fra statuslinjen `Kæde-issue: #N` bærer `krav OK`, `slut OK`, `GODKENDT/AFVIST` og stop. Koden læser kun `kaedeIssue` fra `kaede-regler.json`; der er ingen parser for statusfilens pr.-pakke issue. Dermed kan krav-OK-hash, slut OK og gate-afgørelser ikke køre end-to-end på den aftalte flade.  
Anbefalet handling: V22-rettelse.

[KRITISK] Codex-reviewfiler routes ikke  
Konkret afvigelse: `scripts/codex-review.sh` skriver reviewfil med header, `Plan-SHA` og final answer, men ingen `→NÆSTE` og ingen leverance-type. `decide()` ignorerer committed filer uden deklaration/type som `ARV-IGNORERET`. Derfor bliver `APPROVAL` runde 30 ikke til `review-approval → claude-ai-rolle/krav-troskabs-tjek`, og FEEDBACK bliver heller ikke routet til Code.  
Anbefalet handling: V22-rettelse.
