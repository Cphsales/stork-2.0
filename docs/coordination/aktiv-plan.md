# Aktiv plan

Peger på den plan-fil der aktuelt er under arbejde (skrives → reviewes → bygges).

**Aktuel:** T9-supplement-2 (Stor pakke) — plan V1 under Codex parallel kode-research (V3 plan-fase). Plan: `docs/coordination/t9-supplement-2-plan.md`. Krav-dok: `docs/coordination/t9-supplement-2-krav-og-data.md` (PR #72, merget 2026-05-21). Ramme-kilder: PR #67 (superadmin-bypass) + PR #71 (approve-disciplin + handlings-granularitet).

Workflow-spec V2 (`mathias-afgoerelser.md` 2026-05-20 "Workflow-justering V2") er etableret som autoritativ operationel guide for kommende pakker. Detaljer i `docs/skabeloner/workflow-skabelon.md` + overvaagning-filer.

**Historisk:**

- **Trin 10** (Klient-skabelon: core_identity.clients + client_field_definitions + logo + is_active + FK fra T9 + aktiv-check med superadmin-bypass + employee-id-baseret apply-bypass for cron-context + PII-hashing for logo) afsluttet 2026-05-21 via PR #64 (squash-merged til main, commit `1831760`). Plan V14 efter 14 Codex plan-runder + 5 Codex build-review-runder (APPROVAL runde 5). 14 migrations (inkl. T10.13c reverse-legacy) + 6 smoke-tests + fitness-script-allowlist + master-plan §1.8 + §4 trin 10 rettelser. G057 + G058 + G059 registreret som teknisk gæld. Plan + krav-dok + approval-fil arkiveret i `docs/coordination/arkiv/`. Slut-rapport: `rapport-historik/2026-05-21-trin-10.md`.
- **Workflow-forenkling V2** (PR #60) afsluttet 2026-05-20. 30 disciplin-fund fra trin 10-forsøget adresseret. Krav-dok-fase simplificeret + recon-først for Code + dokument-hierarki differentieret. Trin 10 udskudt med krav-dok + mathias-afgoerelser-entry bevaret på main.
- **Lag 1 disciplin-fundament komplet** (PR #42's disciplin-indhold selektivt merget gennem Lag1-filter + G055/G056-fix + handoff-arkivering) afsluttet 2026-05-20 via PR #52 (`8898d3e`), PR #53 (`048d021`), PR #54 (`41cf359`). Tilfører Lag 1's V5.3-spec: forretningsspoergsmaal-fase, krav-dok-review-rolle, NEEDS-MATHIAS-severity, end-to-end-tjek per write-vej, Fundament-tjek-passeret, Plan-pre-push-tjekliste, datamodel-STOP. Lukker 2 latente Lag1-huller (G055 script-parser + G056 Codex rolle-grænse). Slut-rapport: `rapport-historik/2026-05-20-Lag1-disciplin-fundament.md`.
- **Lag 1** (workflow-stabilisering — 9 leverancer A-J + V5.3 marker-protokol-spec) afsluttet 2026-05-20 via PR #48 (`708ab8d`). Plan + V5.1-V5.3 plan-feedback + Codex-approval arkiveret i `docs/coordination/arkiv/` (filnavne `Lag1-*`). Slut-rapport: `rapport-historik/2026-05-20-Lag1.md`. Plan-fase: 7 plan-versioner, 5 Codex-runder med APPROVAL på V5.1, 3 Claude.ai-runder med APPROVAL på V5.3.
- **T9-supplement** (lukke 6 åbne T9-fund: team-retype-overlap-invariant, schema-exposure-verifikation, backdated traversal i 7 apply-handlers, date-aware read-gates, Step 12 robusthed, type-codegen) afsluttet 2026-05-19 via PR #44 (build), #45 (slut-rapport), #46 (G054 type-codegen). Plan + krav-og-data + V1-V4 plan-feedback eksisterer på `claude/T9-supplement-plan`-branchen per slut-rapport-disciplin. Slut-rapport: `rapport-historik/2026-05-19-t9-supplement.md`.
- **T9** (§4 trin 9 — Identitet del 2: organisations-træ + permission-fundament + fortrydelses-mekanisme + import fra 1.0) afsluttet 2026-05-18 via PR #34, #35, #36, #37, #38, #39, #40 → main. Plan + feedback (V1-V6) arkiveret i `docs/coordination/arkiv/` (filnavne `T9-*`). Build i 12 migrations + 6 smoke-tests + 2 stub migration-scripts + T9-fundament-supplement-migration (master-plan §1.7-omskrivning + §1.1 session-var-pattern). 8 push-fase-bugs fix'et via PR #35-38 + #40. Slut-rapport: `rapport-historik/2026-05-18-t9.md`.
- **H010** (etablering af arbejdsmetode + repo-struktur) afsluttet ved commit `3c6bc0b`.
- **H020** (28 åbenlyse dokument-rettelser + plan-automation-flow-test) afsluttet
  ved commit-range `7c0c83d..70d8857` (PR #20 rebase-merged 2026-05-16). Plan +
  feedback arkiveret i `docs/coordination/arkiv/` (filnavne `H020-*`).
  Slut-rapport: `rapport-historik/2026-05-16-h020.md`.
- **H024** (test-idempotens + artefakt-cleanup + Node 24) afsluttet ved commit-range
  `8f46615^..30fbdf4` (PR #26 rebase-merged 2026-05-16). Plan + feedback
  arkiveret i `docs/coordination/arkiv/` (filnavne `H024-*`). Slut-rapport:
  `rapport-historik/2026-05-16-h024.md`.
- **T9 første forsøg** (V1-V3) trukket tilbage 2026-05-17 efter afdæknings-session
  afslørede fundamentale misforståelser. Plan + feedback arkiveret i
  `docs/coordination/arkiv/T9-foraeldet-2026-05-17/`. Ny T9-runde startes med
  nyt krav-dokument.

Når ny plan starter (V2 5-step flow per `mathias-afgoerelser.md` 2026-05-20 "Workflow-justering V2"):

1. Step 0 (PAKKE-SKALA-VURDERING): Mathias afgør Lille / Mellem / Stor (antal åbne forretnings-spørgsmål)
2. Step 1 (KRAV-DOK-FASE): Claude.ai-forfatter ↔ Mathias direkte i chat — ingen separat reviewer-chat. Skippes for Lille-pakker.
3. Step 2 (PLAN-FASE): Code + Codex iterativt → V1...Vn via `scripts/codex-review.sh`. Recon-først obligatorisk; Codex KRITISK om fabrikation = STOP.
4. Step 3 (APPROVAL): Mathias paster `qwerg`
5. Step 4 (BUILD): Code bygger, Codex validerer
6. Step 5 (SLUT-RAPPORT + CLAUDE.AI-REVIEW + LUK): Claude.ai-reviewer (separat chat) verificerer mod krav-dok + plan

Detaljeret reference: `docs/skabeloner/workflow-skabelon.md`.
