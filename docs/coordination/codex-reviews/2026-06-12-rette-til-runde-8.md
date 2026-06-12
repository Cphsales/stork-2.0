# Codex review — rette-til runde 8

**Pakke:** rette-til
**Fase:** build
**Plan-fil:** docs/coordination/rette-til-plan.md
**Plan-SHA:** fc7411e
**Fil-hash (reviewet indhold):** 8c8bff4aeceb6083bd5c2c3e814d7572075ddb40
**Fil-tilstand:** ren
**Dato:** 2026-06-12
**Reasoning:** xhigh
**Model:** gpt-5.5
**Varighed:** 200s
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/rette-til-plan.md 8 --xhigh --phase=build` (re-run via samme args inkl. flags)

---

[KRITISK] Required CI fejler på formattering  
Konkret afvigelse: CI’s governance-job kører `pnpm format:check` (`.github/workflows/ci.yml:98-99`). Lokalt fejler samme kommando på `scripts/kaede/dirigent.mjs`, `scripts/kaede/dirigent.selftest.mjs` og `scripts/kaede/tilstand.mjs`. Dermed kan batchen ikke nå grøn required CI, selv om `pnpm kaede:selftest` og `pnpm governance:check` er grønne.  
Anbefalet handling: [V9-rettelse] Kør Prettier på de tre ændrede kæde-filer og verificér `pnpm format:check` før næste review.

§8.1-SVAR: INGEN-MODSIGELSE
