# RPC permission matrix

**Auto-genereret fra live DB introspection 2026-05-15** efter R-runde-2 (R7a-R7d + R7c verify_anonymization_consistency-konvertering).

**Format:** RPC → (page_key, tab_key, can_edit) → auth-type. Auto-verificeret via `supabase/tests/smoke/m1_permission_matrix.sql`.

**Total: 32 RPC'er** — 31 bruger `has_permission(page, tab, can_edit)`, 1 beholder `is_admin()` som superadmin-anker (master-plan rettelse 26 + 31).

## Distribution

| Auth-type             | Antal |
| --------------------- | ----- |
| `has_permission`      | 31    |
| `is_admin` (retained) | 1     |

## Unique page-tab kombinationer (auth-pages)

| page_key                    | tab_keys                                       |
| --------------------------- | ---------------------------------------------- |
| anonymization               | replay                                         |
| anonymization_mappings      | activate, approve, manage, test_run            |
| anonymization_strategies    | activate                                       |
| audit                       | anonymization, cron, log, verify_anonymization |
| break_glass                 | approve, execute, request, view                |
| break_glass_operation_types | activate, approve, manage                      |
| classification              | manage                                         |
| employee_active_config      | manage                                         |
| employees                   | anonymize, manage, terminate                   |
| gdpr_responsible            | manage                                         |
| pay_periods                 | compute, lock, settings                        |
| roles                       | manage, permissions                            |
| system                      | manage _(superadmin-anker — is_admin())_       |

## Komplet RPC-tabel (auto-genereret)

| RPC                                                   | page_key                    | tab_key              | can_edit | Auth-type                                                   |
| ----------------------------------------------------- | --------------------------- | -------------------- | -------- | ----------------------------------------------------------- |
| `core_compliance.anonymization_mapping_activate`      | anonymization_mappings      | activate             | true     | has_permission                                              |
| `core_compliance.anonymization_mapping_approve`       | anonymization_mappings      | approve              | true     | has_permission                                              |
| `core_compliance.anonymization_mapping_test_run`      | anonymization_mappings      | test_run             | true     | has_permission                                              |
| `core_compliance.anonymization_mapping_upsert`        | anonymization_mappings      | manage               | true     | has_permission                                              |
| `core_compliance.anonymization_state_read`            | audit                       | anonymization        | false    | has_permission                                              |
| `core_compliance.anonymization_strategy_activate`     | anonymization_strategies    | activate             | true     | has_permission                                              |
| `core_compliance.audit_log_read`                      | audit                       | log                  | false    | has_permission                                              |
| `core_compliance.break_glass_approve`                 | break_glass                 | approve              | true     | has_permission                                              |
| `core_compliance.break_glass_execute`                 | break_glass                 | execute              | true     | has_permission                                              |
| `core_compliance.break_glass_operation_type_activate` | break_glass_operation_types | activate             | true     | has_permission                                              |
| `core_compliance.break_glass_operation_type_approve`  | break_glass_operation_types | approve              | true     | has_permission                                              |
| `core_compliance.break_glass_operation_type_upsert`   | break_glass_operation_types | manage               | true     | has_permission                                              |
| `core_compliance.break_glass_reject`                  | break_glass                 | approve              | true     | has_permission                                              |
| `core_compliance.break_glass_request`                 | break_glass                 | request              | true     | has_permission                                              |
| `core_compliance.break_glass_requests_read`           | break_glass                 | view                 | false    | has_permission                                              |
| `core_compliance.cron_heartbeats_export`              | audit                       | cron                 | true     | has_permission                                              |
| `core_compliance.cron_heartbeats_read`                | audit                       | cron                 | false    | has_permission                                              |
| `core_compliance.data_field_definition_delete`        | classification              | manage               | true     | has_permission                                              |
| `core_compliance.data_field_definition_upsert`        | classification              | manage               | true     | has_permission                                              |
| `core_compliance.gdpr_responsible_set`                | gdpr_responsible            | manage               | true     | has_permission                                              |
| `core_compliance.replay_anonymization`                | anonymization               | replay               | true     | has_permission                                              |
| `core_compliance.superadmin_settings_update`          | —                           | —                    | —        | **is_admin (retained)**                                     |
| `core_compliance.verify_anonymization_consistency`    | audit                       | verify_anonymization | false    | has*permission *(R7c — cron-bypass for source*type='cron')* |
| `core_identity.anonymize_employee`                    | employees                   | anonymize            | true     | has_permission                                              |
| `core_identity.employee_active_config_update`         | employee_active_config      | manage               | true     | has_permission                                              |
| `core_identity.employee_terminate`                    | employees                   | terminate            | true     | has_permission                                              |
| `core_identity.employee_upsert`                       | employees                   | manage               | true     | has_permission                                              |
| `core_identity.role_page_permission_upsert`           | roles                       | permissions          | true     | has_permission                                              |
| `core_identity.role_upsert`                           | roles                       | manage               | true     | has_permission                                              |
| `core_money.pay_period_compute_candidate`             | pay_periods                 | compute              | true     | has_permission                                              |
| `core_money.pay_period_lock`                          | pay_periods                 | lock                 | true     | has_permission                                              |
| `core_money.pay_period_settings_update`               | pay_periods                 | settings             | true     | has_permission                                              |

## Q-SEED konsistens (verificeret PASS via m1-test)

Hver (page_key, tab_key) i tabellen ovenfor har matching row i `core_identity.role_page_permissions` for superadmin-rolle med `can_view=true`. Auto-verificeret 2026-05-15 — ingen missing-violations.

## Pre-cutover lifecycle-state

| Lifecycle-tabel               | Antal rows                                     | Status-distribution | is_active-aligned post-R7d |
| ----------------------------- | ---------------------------------------------- | ------------------- | -------------------------- |
| `anonymization_strategies`    | 3 (blank, hash, hash_email)                    | alle `approved`     | n/a (ingen is_active)      |
| `anonymization_mappings`      | 1 (employee)                                   | `approved`          | is_active=false ✓          |
| `break_glass_operation_types` | 2 (pay_period_unlock, gdpr_retroactive_remove) | begge `approved`    | is_active=false ✓          |

**Aktivering kræves pre-cutover** (Mathias Problem 4-afgørelse). Anonymization-pipeline + break-glass virker ikke før UI-aktivering. Per R7d-invariant: alle readers kræver `status='active' AND is_active=true`.

## Vedligeholdelse

Når ny RPC tilføjes:

1. Skriv RPC med `has_permission(page, tab, can_edit)`-check (eller dokumentér `is_admin()`-undtagelse i G-nummer)
2. Tilføj seed-row til `core_identity.role_page_permissions` for superadmin via ON CONFLICT DO NOTHING
3. `smoke/m1_permission_matrix.sql` fanger missing-rows på næste CI-run
4. Regenérer denne fil ved at køre query i `docs/teknisk/permission-matrix.md`-frontmatter
