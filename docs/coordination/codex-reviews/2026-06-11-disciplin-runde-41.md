# Codex review — disciplin runde 41

**Pakke:** disciplin
**Fase:** docs
**Plan-fil:** docs/strategi/disciplin.md
**Plan-SHA:** fc32331
**Dato:** 2026-06-11
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/strategi/disciplin.md 41 --xhigh --phase=docs` (re-run via samme args inkl. flags)

---

[MELLEM] Automation-status er internt stale/selvmodsigende  
Konkret afvigelse: `docs/strategi/disciplin.md:57` siger “Kæden kører via scripts/kaede/”, men samme doc siger stadig “Automation skrevet ærligt som notify-only” i både topnoten og footeren. Samtidig siger `docs/coordination/gov-5-automation-status.md:4`, at build-PR-approval, 11b-bevis-cases og systemd-aktivering stadig ligger i morgen-tjeklisten.  
Anbefalet handling: [V42-rettelse] Skeln præcist mellem “bygget/committet”, “klar til aktivering”, “systemd aktiv” og “bevist i gov-6”, og fjern/ret de resterende notify-only-linjer.

§8.1-SVAR: MODSIGELSE — automation-tilstand i `disciplin.md` er internt stale/selvmodsigende.
