# Codex review — gov-5-automation runde 34

**Pakke:** gov-5-automation
**Fase:** build
**Plan-fil:** docs/coordination/gov-5-automation-plan.md
**Plan-SHA:** f93d538
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-5-automation-plan.md 34 --xhigh --phase=build` (re-run via samme args inkl. flags)

---

[KRITISK] Mathias-adapteren kan ikke køres af dirigenten  
Konkret afvigelse: `scripts/kaede/dirigent.mjs:411` starter alle adaptere med `bash`, men `scripts/kaede/adapters/mathias.mjs` er Node/ESM. Direkte bash-kørsel fejler med syntax error, så `hash-post`, `notifikation`, `gate-anmodning` og `review-request` ender som `KAEDE-STOP`.  
Anbefalet handling: [V35-rettelse] Kør adapteren via shebang/node eller gør Mathias-adapteren til shell-wrapper; tilføj selftest for reel Mathias-dispatch.

[KRITISK] Codex-fund bliver runtime-fejl i stedet for review-leverance  
Konkret afvigelse: `scripts/kaede/adapters/codex.sh:22-29` kalder `scripts/codex-review.sh` under `set -e`. `codex-review.sh:384-393` returnerer non-zero for legitime review-resultater som KRITISK/NEEDS-MATHIAS, mens `dirigent.mjs:423-431` tolker enhver non-zero adapterexit som `KAEDE-STOP`. Dermed stoppes normal feedback-routing før transport-commit.  
Anbefalet handling: [V35-rettelse] Lad codex-adapteren skelne mellem “review leveret med fund” og runtime-fejl; gyldige reviewoutputs skal efterlade filen til transport og exitte 0.

[KRITISK] Qwers-recon kan falde ud af bærerlisten ved ny pakke  
Konkret afvigelse: qwers-dispatchen bruger eventets pakkenavn (`dirigent.mjs:245-268`), og B2-adapterne skriver `docs/coordination/<spor>-recon-*.md` (`code.sh:17`, `codex.sh:34`). Men `tilstand.mjs:253-275` scanner kun disse rodfiler for `aktivPakke !== "ingen"`, og recon-fakta udledes også kun fra markørpakken (`tilstand.mjs:362-376`). Planen siger, at åbning netop kan ske fra `aktiv-pakke: ingen`; så recon-filerne bliver ikke transport-committet, og `recon-klar` fyrer ikke.  
Anbefalet handling: [V35-rettelse] Forankr qwers-pakken i læserens bærerflade/status, eller scan recon-filer via qwers-sporet; tilføj end-to-end-test qwers → recon-docs → transport → recon-syntese.

Kørt: `node scripts/kaede/dirigent.selftest.mjs` og `scripts/codex-review.sh --parse-test` grønne, men de dækker ikke ovenstående integrationsfejl.

§8.1-SVAR: INGEN-MODSIGELSE
