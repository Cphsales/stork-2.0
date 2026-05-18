# Stork 2.0 — Bygge-status

**Formål:** Sporing af §4 byggerækkefølge fra master-planen. Opdateres efter hvert trin.

**Scope:** Kun §4 byggetrin. H-pakker (H010, H016, H020, H020.1, H021, H022, H022.1, dokument-roller-pakken, master-plan sandheds-audit m.fl.) er disciplin/dokument-pakker uden for §4 og spores via commit-history + slut-rapporter i `docs/coordination/rapport-historik/`. Tekniske G-numre (gæld) spores i `docs/teknisk/teknisk-gaeld.md`.

**Sidste opdatering:** 18. maj 2026 (T9 — Identitet del 2 — komplet leveret: build + fundament-supplement + classify-format-fix)

---

## Status-oversigt

| §4 trin | Beskrivelse                                                    | Status               | Vores trin | Commit  | Dato    |
| ------- | -------------------------------------------------------------- | -------------------- | ---------- | ------- | ------- |
| 1       | Adgangs-mekanik                                                | ✓ Godkendt           | Trin 1     | ce8c609 | 13. maj |
| 2       | Audit-mønster (partitioneret)                                  | ✓ Godkendt           | Trin 1     | ce8c609 | 13. maj |
| 3       | Drift-skabelon (heartbeats)                                    | ✓ Godkendt           | Trin 1     | ce8c609 | 13. maj |
| 4       | Klassifikations-registry + migration-gate Phase 1              | ✓ Godkendt           | Trin 1     | ce8c609 | 13. maj |
| 5       | Identitet del 1 (medarbejdere, roller, permissions)            | ✓ Godkendt           | Trin 2     | 14dd814 | 14. maj |
| 6       | Anonymisering (anonymization_state + replay)                   | ✓ Godkendt           | Trin 3     | fd2ba48 | 14. maj |
| 7       | Periode-skabelon + lock-pipeline (skeleton-benchmark)          | ✓ Godkendt           | Trin 4     | bc57ae0 | 14. maj |
| 7b      | Auto-lock-cron + candidate-pre-compute-cron                    | ✓ Godkendt           | Trin 4     | bc57ae0 | 14. maj |
| 7c      | break_glass_requests + RPC-skabelon                            | ✓ Godkendt           | Trin 4     | bc57ae0 | 14. maj |
| 8       | Migration-gate Phase 2 strict                                  | ✓ Aktiveret i trin 1 | Trin 1     | ce8c609 | 13. maj |
| 9       | Identitet del 2 (org-træ + permission-fundament + fortrydelse) | ✓ Godkendt           | Trin 5     | d73d929 | 18. maj |
| 10      | Klient-skabelon + felt-definitions                             | ⌛ Udestående        | —          | —       | —       |
| 10b     | Lokations-skabelon                                             | ⌛ Udestående        | —          | —       | —       |
| 11      | UDGÅR (schema-grænser fra trin 1)                              | —                    | —          | —       | —       |
| 12      | @stork/core skeleton                                           | ⌛ Udestående        | —          | —       | —       |
| 13      | Formel-system                                                  | ⌛ Udestående        | —          | —       | —       |
| 14      | Salgs-stamme + legacy_snapshots                                | ⌛ Udestående        | —          | —       | —       |
| 15      | Pricing + identitets-master + sælger-attribution               | ⌛ Udestående        | —          | —       | —       |
| 16      | Annulleringer + corrections + reversal                         | ⌛ Udestående        | —          | —       | —       |
| 16b     | rejections + basket_corrections + fuld dispatcher              | ⌛ Udestående        | —          | —       | —       |
| 17      | Vagter + skabeloner + pauser                                   | ⌛ Udestående        | —          | —       | —       |
| 18      | Stempelur + corrections                                        | ⌛ Udestående        | —          | —       | —       |
| 19      | UDSKUDT (flyttet til 21b)                                      | —                    | —          | —       | —       |
| 20a     | Fire fravær-tabeller                                           | ⌛ Udestående        | —          | —       | —       |
| 20b     | Vagt-status enum udvidelse                                     | ⌛ Udestående        | —          | —       | —       |
| 20c     | Klient-tilhør-snapshot (relations-tabel)                       | ⌛ Udestående        | —          | —       | —       |
| 20d     | Fraværs-triggers                                               | ⌛ Udestående        | —          | —       | —       |
| 20e     | Overtid                                                        | ⌛ Udestående        | —          | —       | —       |
| 20f     | Sygeløn-formel + ferie-løn-formel                              | ⌛ Udestående        | —          | —       | —       |
| 21      | Ingest-tabeller + Adversus sync-job + call_records             | ⌛ Udestående        | —          | —       | —       |
| 21b     | Klient-fordeling-segmenter                                     | ⌛ Udestående        | —          | —       | —       |
| 22      | Medarbejder-aggregater + payroll-linjer + KPI-snapshots        | ⌛ Udestående        | —          | —       | —       |
| 23      | Dashboards + aggregat-tabeller                                 | ⌛ Udestående        | —          | —       | —       |
| 24      | FM booking-stamme                                              | ⌛ Udestående        | —          | —       | —       |
| 25      | FM booking-assignments + auto-vagt-generering                  | ⌛ Udestående        | —          | —       | —       |
| 26      | FM hotel-booking                                               | ⌛ Udestående        | —          | —       | —       |
| 27      | FM køretøj og mileage                                          | ⌛ Udestående        | —          | —       | —       |
| 28      | FM diæt og oplæringsbonus                                      | ⌛ Udestående        | —          | —       | —       |
| 29      | FM leverandør-fakturering                                      | ⌛ Udestående        | —          | —       | —       |
| 30      | FM checkliste-system                                           | ⌛ Udestående        | —          | —       | —       |
| 31      | Cutover-leverancer                                             | ⌛ Udestående        | —          | —       | —       |

**Status-symboler:**

- ✓ Godkendt — bygget, verificeret, accepteret af Mathias
- 🔨 Under bygning — Code arbejder
- ⏳ Næste — klar til at starte
- ⏸ PAUSET — byggetrin pauset af Mathias (se mathias-afgoerelser)
- ⌛ Udestående — venter på tidligere trin
- — UDGÅR / UDSKUDT

---

## Action-items (ikke-blokerende)

| Punkt                            | Beskrivelse                                                                                                                                                                                                                                                                                                                                               | Skal håndteres før                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| PITR-aktivering                  | Admin-handling i Supabase dashboard                                                                                                                                                                                                                                                                                                                       | §4 trin 14 (sales-stamme)                                  |
| Backup-retention                 | Verificér Pro-default 14 dage                                                                                                                                                                                                                                                                                                                             | §4 trin 14                                                 |
| retention_cleanup_daily          | Refactoreres til generisk evaluator                                                                                                                                                                                                                                                                                                                       | Når flere entities har retention-deadlines (trin 10+)      |
| replay_anonymization             | Udvides med branches per entity                                                                                                                                                                                                                                                                                                                           | §4 trin 10 (clients) + trin 15 (identitets-master)         |
| Migration TODO-markører          | Erstattes med faktiske 1.0-skema-referencer                                                                                                                                                                                                                                                                                                               | Når Mathias kører discovery mod 1.0                        |
| Anonymization-revert break-glass | Bygges sammen med break-glass-tabel                                                                                                                                                                                                                                                                                                                       | §4 trin 7c                                                 |
| Dependabot-sårbarheder           | 4 sårbarheder på default branch (3 moderate, 1 low) pr. 2026-05-16. Skal håndteres før produktion. Liste de kritiske til Mathias når relevant.                                                                                                                                                                                                            | Før produktion                                             |
| Lock-pipeline fuld benchmark     | Trin 7's skeleton-benchmark var 61ms@130 candidate-rows. Fuld benchmark (500 medarbejdere × 100k sales × <10s SLA, master-plan §1.6/rettelse 19 C3) udskydes til trin 14 (sales) og trin 22 (aggregater) som CI-blocker                                                                                                                                   | §4 trin 22 senest                                          |
| pay_period_unlock re-lock        | Break-glass-unlock bevarer commission_snapshots (immutable). Re-lock skal håndtere overskrivning via ON CONFLICT DO NOTHING. Formaliseres når sales eksisterer                                                                                                                                                                                            | §4 trin 14                                                 |
| Benchmark-artifacts i prod-DB    | Skeleton-benchmark efterlod 1 syntetisk pay_period (2020-01-15→2020-02-14, locked), 260 commission_snapshots og 1 salary_correction (description='smoke test', amount=-100). Ufarligt men kosmetisk støj. **Note:** Cutover-blocker #6 G017-tjek dækker pre-2000-perioder, ikke 2020-artefakter (åbent G-nummer-kandidat fra master-plan sandheds-audit). | Inden produktions-go-live                                  |
| Klassifikations-tal-inkonsistens | Trin 1-3 rapporterede 202 klassificerede kolonner; trin 4 rapporterede 193. Faldet er ikke dokumenteret. Skal verificeres mod faktisk DB-state. Kan være korrekt (kolonner fjernet under trin 4) eller dokumentations-fejl.                                                                                                                               | Når trin 9+ genoptages — klassifikations-tal tjekkes på ny |
| Frontend hosting-platform        | Master-plan rettelse 32 låste managed-service som ramme. Specifik platform (Vercel vs. Cloudflare Pages) afgøres ved tilkobling i samme pakke som første frontend-side. Selv-hosting eksplicit afvist.                                                                                                                                                    | Lag F (første frontend-side)                               |

---

## Detaljerede trin-rapporter

### Vores trin 1 — Fundament (§4 trin 1+2+3+4+8)

**Dato:** 13. maj 2026
**Commit:** ce8c609 på branch `claude/trin-1-fundament`
**Status:** ✓ Godkendt

**Bygget:**

- DROP CASCADE af 17 fase 0 public-tabeller
- Tre schemas: core_compliance, core_identity, core_money
- Helper-funktioner: current_employee_id(), is_admin(), audit_filter_values()
- audit_log som PARTITIONED BY RANGE (occurred_at) + immutability + TRUNCATE-blokering
- cron_heartbeats + record-RPC + healthcheck + Prometheus-export + audit-partition-cron
- data_field_definitions med FORCE RLS
- PII-hash-funktion (sha256 for pii_level='direct')
- Bootstrap af mg@ + km@ employees + admin-rolle + system.manage
- 64 klassifikations-rækker

**Inline-fixes:**

- source_type-enum udvidet med 'migration' (§0.5 brugte det, men §1.3 manglede)
- employees_active_idx ændret til (id, termination_date) WHERE anonymized_at IS NULL fordi current_date ikke er IMMUTABLE

**Verifikation:** 10 fitness-checks grøn, 202 klassificerede kolonner

---

### Vores trin 2 — Identitet del 1 (§4 trin 5)

**Dato:** 14. maj 2026
**Commit:** 14dd814 på branch `claude/trin-1-fundament`
**Status:** ✓ Godkendt

**Bygget:**

- superadmin_settings-singleton (min 2 admins default)
- enforce_admin_floor-trigger på employees + role_page_permissions + roles
- INSERT/UPDATE/DELETE-policies + 5 SECURITY DEFINER RPC'er
- Migration-scripts: discovery + extract + upload for 1.0→2.0 employee-import

**Inline-fixes:**

- Top-level set_config i t2_superadmin_floor for fitness-script disciplin-check

**Observationer:**

- Identitets-master udskudt til trin 15 (sælger-attribution)
- Anonymize_employee hører til trin 6
- Migration-scripts har TODO-markører for 1.0-skema

**Verifikation:** Alle CI-blockers grøn, 202 klassificerede kolonner

---

### Vores trin 3 — Anonymisering (§4 trin 6)

**Dato:** 14. maj 2026
**Commit:** fd2ba48 på branch `claude/trin-1-fundament`
**Status:** ✓ Godkendt

**Bygget:**

- anonymization_mappings (konfig, UI-redigerbar)
- anonymization_state (immutable log med field_mapping_snapshot + strategy_version)
- apply_field_strategy + anonymize_employee + anonymization_state_read
- replay_anonymization (post-restore catch-up, idempotent)
- verify_anonymization_consistency
- Crons: verify_anonymization_daily (02:15 UTC) + retention_cleanup_daily (02:30 UTC)
- Pro-tier bekræftet i master-plan §1.14

**Verifikation:** Alle CI-blockers grøn, 202 klassificerede kolonner

---

### Senere commits på branchen (efter trin 3)

| Commit  | Beskrivelse                                                  |
| ------- | ------------------------------------------------------------ |
| de362e0 | docs: oprydning — slet fase 0-spor, flyt lag-e-krav op       |
| a3fe68c | master-plan: rettelse 21 — konsistens-fix fra trin 1 bygning |
| 8adc13b | master-plan: §1.14 Pro-tier bekræftet aktiv 14. maj 2026     |

---

### Vores trin 4 — Periode-skabelon + auto-lock + break-glass (§4 trin 7+7b+7c)

**Dato:** 14. maj 2026
**Commit:** bc57ae0 på branch `claude/trin-1-fundament`
**Status:** ✓ Godkendt
**SLA-justering inden start:** Master-plan rettelse 19 C3 fastlåser SLA <10s (ikke <60s som i Mathias' første prompt). Skeleton-benchmark på trin 7's data-skala; fuld 500×100k benchmark som CI-blocker udskudt til trin 14/22 (action-item).

**Bygget (trin 7):**

- `pay_period_settings` (singleton; UI-redigerbar) med `recommended_lock_date_rule` + `auto_lock_enabled` (rettelse 16)
- `pay_periods` i core_money med open/locked livscyklus, EXCLUDE-constraint mod overlap, BEFORE UPDATE/DELETE-trigger der blokerer mutationer på låst periode
- `commission_snapshots` (immutable, FORCE RLS, INSERT-only) med UNIQUE(period_id, sale_id, employee_id) for provision-split
- `salary_corrections` (immutable) med reason-enum + sign-CHECK pr. reason + target_period_open-validering
- `cancellations`-skeleton (immutable, INSERT-only, reason-enum: kunde_annullering/match_rettelse, reverses_cancellation_id self-FK) — ingen RPC'er endnu, kommer trin 16
- Candidate-mønster (rettelse 19 C3): `pay_period_candidate_runs` (tracker med data_checksum), `commission_snapshots_candidate`, `salary_corrections_candidate` (mutable, CASCADE-delete)
- `pay_period_compute_candidate(period_id, change_reason)` — TRIN 7 SKELETON: genererer placeholder candidate-rows (1 per aktiv medarbejder, amount=0). Fuld compute-logik tilføjes trin 14/22 hvor sales+aggregater eksisterer
- `pay_period_lock(period_id, change_reason)` — atomar to-fase: validér candidate, re-compute hvis stale, promovér rows + UPDATE status='locked'. statement_timeout='5min'
- `pay_period_lock_attempt(period_id)` — cron-wrapper med fejl-logging til pay_periods.consecutive_lock_failures + last_lock_error
- `pay_period_unlock_via_break_glass(period_id, change_reason)` — kun callable fra break_glass_execute-dispatcher (validerer stork.break_glass_dispatch='true')
- `period_recommended_lock_date(period_id)` helper med 3 regel-værdier (month_last_calendar_day default)
- `_compute_period_data_checksum(period_id)` intern helper — udvides trin 14+ med sales-state

**Bygget (trin 7b):**

- `consecutive_failure_count` kolonne på cron_heartbeats + opdateret `cron_heartbeat_record` (reset ved 'ok', +1 ved 'failure')
- `healthcheck()` udvidet med `cron_jobs_consecutive_failures_critical` (≥3)
- Cron `pay_period_auto_lock_daily` (02:45 UTC) — låser perioder hvor recommended_lock_date ≤ today; partial_failure-status hvis blandet succes/fejl
- Cron `pay_period_candidate_precompute_daily` (01:30 UTC) — pre-computer candidate 1-2 dage før recommended_lock_date
- Cron `ensure_pay_periods_daily` (01:00 UTC) — sikrer fremtidige pay_periods buffer

**Bygget (trin 7c):**

- `break_glass_operation_types` (UI-redigerbar konfig, seedet med `pay_period_unlock` + `gdpr_retroactive_remove`)
- `break_glass_requests` (audit-tabel; CHECK requested_by≠approved_by + consistency-checks; expires_at default 24t)
- RPC'er: `break_glass_request` / `break_glass_approve` / `break_glass_reject` / `break_glass_execute` (dispatcher via `internal_rpc` + stork.break_glass_dispatch='true' session-var) / `break_glass_requests_read`
- Cron `break_glass_expire_pending` (02:00 UTC) — pending → expired efter 24t
- Audit-trigger AFTER INSERT/UPDATE på begge tabeller

**Inline-fixes:**

- `pay_periods_locked_consistency` CHECK relaxet — locked_by NULLABLE i locked-state. auth.uid() returnerer NULL for service-role/cron-locks; CHECK blokerede ellers automatiseret lock. Migration: `20260514150010_t7_inline_fix_locked_by_nullable.sql`

**Lock-pipeline skeleton-benchmark (trin 7):**

- Setup: 130 syntetiske candidate-rows for past period (2020-01-15→2020-02-14)
- **Resultat: lock-pipeline = 61 ms** vs. SLA <10000 ms — passerer med ~164× margin
- Setup (130 INSERT'er): 21 ms
- Caveat: skeleton tester KUN promotion-fase. Compute-fase (candidate-beregning) er stub fordi sales/payroll-formler ikke findes endnu
- Fuld benchmark (500 medarbejdere × 100k sales × <10s SLA) udskudt til trin 14/22 som CI-blocker (master-plan §1.6 + rettelse 19 C3)

**Smoke-tests grøn:**

- `salary_corrections` UPDATE/DELETE blokeret (immutable)
- `salary_corrections` sign-CHECK blokerer positiv amount med reason='cancellation'
- `commission_snapshots` 130 candidate-rows promoteret atomisk
- 7 crons aktive (3 nye fra trin 7b/7c)
- 2 break_glass_operation_types seedet

**Observationer:**

- Trin 7 har ingen sales/payroll-formler — candidate-compute er bevidst skeleton. Det er forventet og dokumenteret i RPC-comment.
- Break-glass end-to-end-test kræver faktisk auth (mg@ requester, km@ approver). RPC-mekanik er verificeret strukturelt; runtime-test sker via UI når lag F (auth-mapping) er klar.
- 1 smoke-test-correction (-100.00, description='smoke test') og 1 syntetisk locked 2020-periode efterladt — ufarligt, dokumenteret som action-items.

**Verifikation:** Fitness-checks grøn (9 checks). Migration-gate Phase 2 strict: alle 40 migrations grøn. 193 klassificerede kolonner (76 nye i core_money + 26 nye i core_compliance).

---

### Vores trin 5 — Identitet del 2 (§4 trin 9)

**Dato:** 17.-18. maj 2026
**Commit:** d73d929 på main (PR #34, #35, #36, #37, #38, #39, #40)
**Status:** ✓ Godkendt

**Bygget (Steps 1-13, fil-prefixes 000000-000011):**

- `pending_changes` + `undo_settings` + cron + pending_change_apply (central apply-gate, V6 Beslutning 15)
- `org_nodes` (identity-only) + `org_node_versions` (versioneret state med effective_from/\_to) + cycle-detect + team-no-children-trigger
- `org_node_closure` + maintain-trigger på versions (current-state-derived; AUDIT_EXEMPT_SNAPSHOT_TABLES udvidet)
- `employee_node_placements` + apply-handlers (place/remove/team_close)
- `client_node_placements` (uden client-FK; team-only validering)
- Permission-elementer (areas/pages/tabs) + 6 CRUD-RPCs
- `role_permission_grants` + helpers (`acl_subtree_org_nodes`, `acl_subtree_employees`, `permission_resolve`, `acl_visibility_check`)
- 7 public pending-wrapper RPCs + employee_role_assign/\_remove
- 9 read-RPCs (org_tree_read_at, employee_placement_read_at, etc.)
- Migration af role_page_permissions til ny model + has_permission med fallback
- Seed Copenhagen Sales + Ejere + mg@/km@ + superadmin-grants
- Klassifikation af alle 84 T9-kolonner (84 rows i data_field_definitions)

**T9-fundament-supplement (PR #39, fil-prefix 100000):**

- Master-plan §1.7 omskrevet (rettelse 35): 3-niveau permission (Område→Page→Tab) + 2 akser ((kan_tilgå/kan_skrive) × visibility (Sig selv/Hiraki/Alt)). Pre-omsadlings-tekst om 4-dim permission + scope=team + stab-rolle + `org_unit_closure`-navn + `is_compliance_officer()` fjernet
- §1.13 "Konsekvens for permissions": compliance-ansvarlige er konkrete medarbejdere valgt i UI — ikke rolle/permission (mathias-afgoerelser 2026-05-19)
- §1.1's session-var-pattern implementeret: INSERT/UPDATE-policies + GRANT INSERT/UPDATE på 6 write-tabeller; 11 write-RPCs sætter `stork.t9_write_authorized` efter has_permission-check
- pending_change_approve + pending_change_undo dispatcher: change_type → page_key → has_permission(can_edit=true)
- SELECT-policy på pending_changes udvidet til "potentielle approvere/undoere" (samme mapping som dispatcher)
- DELETE-policy + GRANT DELETE på role_permission_grants

**Push-fase-bugs (8 stk over PR #35-38 + Codex-runde 1+2 diagnose-tilbageblik):**

1. CASE-uden-WHEN i Step 1 dispatcher (PR #35)
2. permission_resolve signatur-mismatch (PR #36)
3. R7d fitness false positives × 3 (PR #36 + #38)
4. has_permission DEFAULT-bevarelse (PR #37)
5. role_page_permission_upsert arg-count (PR #37)
6. closure-rebuild CTE direction (PR #38)
7. has_permission record-INTO-field (PR #38)
8. classify retention_value format ({days} → {max_days}) (PR #40, ramte alle 84 rows)

**Codex review-runder:**

- Runde 1 (diagnose): 4 KRITISK + 3 MELLEM fund identificeret efter første build-PR
- Runde 2 (verifikation): T9-omstart-rammen (mathias-afgoerelser 2026-05-17) etableret som korrekt fundament
- Runde 3 (PR #39 review): 2 KRITISK fund — manglende GRANTs + SELECT-policy blokerer dispatcher
- Runde 4 (PR #39 final): APPROVAL

**Disciplin-afvigelser (alle Mathias-godkendt):**

- 3 admin-merges med rød CI (PR #36-38) — chicken-and-egg-state hvor DB-tests fejlede pga. partial T9-deploy
- Vej B i PR #40 (ret Step 13 direkte i append-only-fil): tilladt fordi filen aldrig var applied til remote (atomic rollback)

**Verifikation:** Alle fitness-checks grøn. Migration-gate Phase 2: alle 90 migrations grøn (78 pre-T9 + 12 T9 + 1 supplement). 277 klassificerede kolonner (193 pre-T9 + 84 T9). Remote DB state matcher repo state per supabase migration list.

**G-numre rejst:** Se `docs/teknisk/teknisk-gaeld.md` G046-G052 (T9-build disciplin-læringer).

---

## Næste op

**Trin 10 (klient-skabelon) er næste i master-plan-rækkefølge**, men T9-supplement-pakken bør håndteres først:

- KRITISK 1 Team-retype trigger-fix (envejs blokering på node_type-ændring)
- KRITISK 4 Backdated effective_from guards på 5 apply-handlers
- KRITISK 3 API/schema exposure (kræver Mathias' Supabase Dashboard-handling)
- Import-stubs scope-afklaring (Step 10 leverede .mjs stubs ikke discovery/upload)
- Type-codegen (database.ts er placeholder)
- Read-RPC gates (Codex MELLEM)
- Step 12 superadmin-robusthed (else-branch logik-gap)

Se `docs/coordination/aktiv-plan.md` for T9-supplement-skitse.
