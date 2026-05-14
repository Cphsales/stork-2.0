# Stork 2.0 — Bygge-status

**Formål:** Sporing af §4 byggerækkefølge fra master-planen. Opdateres efter hvert trin.

**Sidste opdatering:** 14. maj 2026

---

## Status-oversigt

| §4 trin | Beskrivelse                                             | Status               | Vores trin | Commit  | Dato    |
| ------- | ------------------------------------------------------- | -------------------- | ---------- | ------- | ------- |
| 1       | Adgangs-mekanik                                         | ✓ Godkendt           | Trin 1     | ce8c609 | 13. maj |
| 2       | Audit-mønster (partitioneret)                           | ✓ Godkendt           | Trin 1     | ce8c609 | 13. maj |
| 3       | Drift-skabelon (heartbeats)                             | ✓ Godkendt           | Trin 1     | ce8c609 | 13. maj |
| 4       | Klassifikations-registry + migration-gate Phase 1       | ✓ Godkendt           | Trin 1     | ce8c609 | 13. maj |
| 5       | Identitet del 1 (medarbejdere, roller, permissions)     | ✓ Godkendt           | Trin 2     | 14dd814 | 14. maj |
| 6       | Anonymisering (anonymization_state + replay)            | ✓ Godkendt           | Trin 3     | fd2ba48 | 14. maj |
| 7       | Periode-skabelon + lock-pipeline benchmark              | ⏳ Næste             | —          | —       | —       |
| 7b      | Auto-lock-cron + candidate-pre-compute-cron             | ⏳ Næste             | —          | —       | —       |
| 7c      | break_glass_requests + RPC-skabelon                     | ⏳ Næste             | —          | —       | —       |
| 8       | Migration-gate Phase 2 strict                           | ✓ Aktiveret i trin 1 | Trin 1     | ce8c609 | 13. maj |
| 9       | Identitet del 2 (org-træ, closure-tabel, subtree-RLS)   | ⌛ Udestående        | —          | —       | —       |
| 10      | Klient-skabelon + felt-definitions                      | ⌛ Udestående        | —          | —       | —       |
| 10b     | Lokations-skabelon                                      | ⌛ Udestående        | —          | —       | —       |
| 11      | UDGÅR (schema-grænser fra trin 1)                       | —                    | —          | —       | —       |
| 12      | @stork/core skeleton                                    | ⌛ Udestående        | —          | —       | —       |
| 13      | Formel-system                                           | ⌛ Udestående        | —          | —       | —       |
| 14      | Salgs-stamme + legacy_snapshots                         | ⌛ Udestående        | —          | —       | —       |
| 15      | Pricing + identitets-master + sælger-attribution        | ⌛ Udestående        | —          | —       | —       |
| 16      | Annulleringer + corrections + reversal                  | ⌛ Udestående        | —          | —       | —       |
| 16b     | rejections + basket_corrections + fuld dispatcher       | ⌛ Udestående        | —          | —       | —       |
| 17      | Vagter + skabeloner + pauser                            | ⌛ Udestående        | —          | —       | —       |
| 18      | Stempelur + corrections                                 | ⌛ Udestående        | —          | —       | —       |
| 19      | UDSKUDT (flyttet til 21b)                               | —                    | —          | —       | —       |
| 20a     | Fire fravær-tabeller                                    | ⌛ Udestående        | —          | —       | —       |
| 20b     | Vagt-status enum udvidelse                              | ⌛ Udestående        | —          | —       | —       |
| 20c     | Klient-tilhør-snapshot (relations-tabel)                | ⌛ Udestående        | —          | —       | —       |
| 20d     | Fraværs-triggers                                        | ⌛ Udestående        | —          | —       | —       |
| 20e     | Overtid                                                 | ⌛ Udestående        | —          | —       | —       |
| 20f     | Sygeløn-formel + ferie-løn-formel                       | ⌛ Udestående        | —          | —       | —       |
| 21      | Ingest-tabeller + Adversus sync-job + call_records      | ⌛ Udestående        | —          | —       | —       |
| 21b     | Klient-fordeling-segmenter                              | ⌛ Udestående        | —          | —       | —       |
| 22      | Medarbejder-aggregater + payroll-linjer + KPI-snapshots | ⌛ Udestående        | —          | —       | —       |
| 23      | Dashboards + aggregat-tabeller                          | ⌛ Udestående        | —          | —       | —       |
| 24      | FM booking-stamme                                       | ⌛ Udestående        | —          | —       | —       |
| 25      | FM booking-assignments + auto-vagt-generering           | ⌛ Udestående        | —          | —       | —       |
| 26      | FM hotel-booking                                        | ⌛ Udestående        | —          | —       | —       |
| 27      | FM køretøj og mileage                                   | ⌛ Udestående        | —          | —       | —       |
| 28      | FM diæt og oplæringsbonus                               | ⌛ Udestående        | —          | —       | —       |
| 29      | FM leverandør-fakturering                               | ⌛ Udestående        | —          | —       | —       |
| 30      | FM checkliste-system                                    | ⌛ Udestående        | —          | —       | —       |
| 31      | Cutover-leverancer                                      | ⌛ Udestående        | —          | —       | —       |

**Status-symboler:**

- ✓ Godkendt — bygget, verificeret, accepteret af Mathias
- 🔨 Under bygning — Code arbejder
- ⏳ Næste — klar til at starte
- ⌛ Udestående — venter på tidligere trin
- — UDGÅR / UDSKUDT

---

## Action-items (ikke-blokerende)

| Punkt                            | Beskrivelse                                                                                                                                | Skal håndteres før                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| PITR-aktivering                  | Admin-handling i Supabase dashboard                                                                                                        | §4 trin 14 (sales-stamme)                             |
| Backup-retention                 | Verificér Pro-default 14 dage                                                                                                              | §4 trin 14                                            |
| retention_cleanup_daily          | Refactoreres til generisk evaluator                                                                                                        | Når flere entities har retention-deadlines (trin 10+) |
| replay_anonymization             | Udvides med branches per entity                                                                                                            | §4 trin 10 (clients) + trin 15 (identitets-master)    |
| Migration TODO-markører          | Erstattes med faktiske 1.0-skema-referencer                                                                                                | Når Mathias kører discovery mod 1.0                   |
| Anonymization-revert break-glass | Bygges sammen med break-glass-tabel                                                                                                        | §4 trin 7c                                            |
| Dependabot-sårbarheder           | 28 sårbarheder på default branch (13 high, 13 moderate, 2 low). Skal håndteres før produktion. Liste de kritiske til Mathias når relevant. | Før produktion                                        |

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

**Verifikation:** 10 fitness-checks grøn, 207 klassificerede kolonner

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

**Verifikation:** Alle CI-blockers grøn, 211 klassificerede kolonner

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

**Verifikation:** Alle CI-blockers grøn, 233 klassificerede kolonner

---

### Senere commits på branchen (efter trin 3)

| Commit  | Beskrivelse                                                  |
| ------- | ------------------------------------------------------------ |
| de362e0 | docs: oprydning — slet fase 0-spor, flyt lag-e-krav op       |
| a3fe68c | master-plan: rettelse 21 — konsistens-fix fra trin 1 bygning |
| 8adc13b | master-plan: §1.14 Pro-tier bekræftet aktiv 14. maj 2026     |

---

## Næste op

**Vores trin 4 = §4 trin 7+7b+7c:**

- 7: Periode-skabelon med lock-pipeline benchmark (SLA <60s)
- 7b: Auto-lock-cron + candidate-pre-compute-cron
- 7c: break_glass_requests + RPC-skabelon

**Vigtigt:** Trin 7 indeholder første performance-disciplin-test (rettelse 19 C3). Hvis SLA <60s ikke kan holdes, skal Code flagge og foreslå design-split.
