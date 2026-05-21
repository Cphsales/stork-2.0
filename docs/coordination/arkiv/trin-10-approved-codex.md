# Trin 10 — Codex-approval konsolideret (V14)

**Reviewer:** Codex CLI (kode-niveau + fire-dokument-konsistens) + Code walk-through (krav-dok § for §)
**Pakke:** Trin 10 — Klient-skabelon + felt-definitioner
**Branch:** `claude/trin-10-plan-v3`
**Final approval-runde:** 14 (på V14)
**Dato for final approval:** 2026-05-21
**Plan-fil:** `docs/coordination/trin-10-plan.md` (commit `0dbe93d`)

## Konsolideret historik

| Runde          | Plan-version | Fund                                                        | Resultat                                                                                             |
| -------------- | ------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1              | V1           | 1 KRITISK + 1 KRITISK-SIKKERHEDSHUL + 1 MELLEM + 1 G-NUMMER | FEEDBACK — alle 3 ACCEPT + 1 DEFER                                                                   |
| 2              | V2           | 1 KRITISK + 1 KRITISK-SIKKERHEDSHUL                         | FEEDBACK — begge ACCEPT                                                                              |
| 3              | V3           | 1 KRITISK                                                   | FEEDBACK — ACCEPT                                                                                    |
| 4              | V4           | 1 KRITISK                                                   | FEEDBACK — ACCEPT                                                                                    |
| 5              | V5           | —                                                           | Codex FALSK-POSITIV APPROVAL (Mathias-terminal fandt 3 KRITISK + Code-validering fandt 3 yderligere) |
| 6              | V6           | 4 fund (Mathias-terminal)                                   | FEEDBACK — alle ACCEPT                                                                               |
| 7              | V7           | 1 KRITISK                                                   | FEEDBACK — ACCEPT                                                                                    |
| 8              | V8           | 1 KRITISK (Codex) + 3 yderligere (Code walk-through)        | FEEDBACK — alle ACCEPT                                                                               |
| 9              | V9           | 1 TEKNISK-BLOKERING + 1 G-nummer                            | FEEDBACK — ACCEPT + ADOPT                                                                            |
| 10             | V10          | 1 TEKNISK-BLOKERING                                         | FEEDBACK — ACCEPT (option A: employee-id-baseret bypass)                                             |
| 10 (amendment) | V10.1        | walk-through fund                                           | grant-pattern fix                                                                                    |
| 11             | V11          | 1 KRITISK + 1 G-nummer                                      | FEEDBACK — ACCEPT + G058 logged                                                                      |
| 12             | V12          | 1 KRITISK-SIKKERHEDSHUL                                     | FEEDBACK — ACCEPT (logo-PII direct)                                                                  |
| 13             | V13          | —                                                           | **Codex APPROVAL** (men Code walk-through fandt 1 yderligere hul)                                    |
| 14             | V14          | —                                                           | **Codex APPROVAL + Code walk-through konfirmeret krav-dok-konform**                                  |

## Final approval-tekst (V14, runde 14)

> APPROVAL — Runde 14

## V14-state for ramme-tjek

Plan-fil-headeren angiver: "V14 — Codex APPROVED V13 (runde 13); V14 lukker proaktivt fund fra Code walk-through".

V14 indeholder fix til alle fund fra runderne:

- **T10.1-T10.2:** CREATE TABLE i `core_identity` + no-dedup-key markers + DML-GRANT + tab-aware SELECT-policies + jsonb-object-CHECK + logo-consistency-CHECK
- **T10.3:** is_permanent_allowed udvidelse (P1a-baseline + 2 nye = 17 entries)
- **T10.4:** Klassifikation med ON CONFLICT + permanent retention. Logo-felter pii_level='direct' for PII-hashing i audit
- **T10.5:** audit_filter_values omskrives med clients-fields-jsonb-walking. Hashes alle direct-PII keys uanset is_active (forhindrer datalæk ved felt-deaktivering)
- **T10.6:** clients_validate_fields-trigger (LENIENT default + strict via session-var)
- **T10.7:** FK + ON DELETE RESTRICT
- **T10.7a:** T9-smoke-test-fixtures
- **T10.7b:** client_node_place + client_node_close + \_apply_client_place med klient-aktiv-check + employee-id-baseret superadmin-bypass + session-var. **V14:** client_node_close eksistens-check (P0002) — krav-dok §3.4 konformitet
- **T10.8:** client_upsert (uden logo, UPDATE rør ikke is_active)
- **T10.9:** client_set_active
- **T10.10:** client_field_definition_upsert med immutable key + pii-downgrade-block + UPDATE rør ikke is_active
- **T10.10a:** client_field_definition_set_active (matcher krav-dok §3.2)
- **T10.11:** Logo set/clear/get RPCs
- **T10.12:** Read-RPCs (tab-aware has_permission)
- **T10.13:** Permission-seed i grant-modellen + scoped til org_structure-area
- **T10.14:** Master-plan rettelser
- **T10.15:** 6 smoke-tests inkl. cron-context, undo-period-setup, eksistens-check
- **T10.16:** Fitness-script R7d-allowlist for client_field_definitions_list + clients_validate_fields

## G-numre registreret

- **G057** (MELLEM): T9 forretnings-invariants uden superadmin-bypass (client_placement_requires_active_team + team_close_already_inactive)
- **G058** (MELLEM): FK-coverage-fitness-check ikke implementeret per master-plan §3.19

## Næste skridt

Plan klar til Mathias-godkendelse. Mathias paster `qwerg` for at starte build-fasen.
