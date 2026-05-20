# Trin 10 — Codex-approval konsolideret

**Reviewer:** Codex (kode-niveau + fire-dokument-konsistens)
**Pakke:** Trin 10 — Klient-skabelon + felt-definitioner
**Branch:** `claude/trin-10-plan-v3`
**Final approval-runde:** 5 (på V5)
**Dato for final approval:** 2026-05-21
**Plan-fil:** `docs/coordination/trin-10-plan.md` (commit `7ef684f` + prettier)

## Konsolideret historik

| Runde | Plan-version | Fund                                                                 | Resultat                           |
| ----- | ------------ | -------------------------------------------------------------------- | ---------------------------------- |
| 1     | V1           | 1 KRITISK + 1 KRITISK-SIKKERHEDSHUL + 1 MELLEM + 1 G-NUMMER-KANDIDAT | FEEDBACK — alle 3 ACCEPT + 1 DEFER |
| 2     | V2           | 1 KRITISK + 1 KRITISK-SIKKERHEDSHUL                                  | FEEDBACK — begge ACCEPT            |
| 3     | V3           | 1 KRITISK                                                            | FEEDBACK — ACCEPT                  |
| 4     | V4           | 1 KRITISK                                                            | FEEDBACK — ACCEPT                  |
| 5     | V5           | —                                                                    | **APPROVAL**                       |

## Final approval-tekst (V5, runde 5)

> APPROVAL — Runde 5

## V5-state for ramme-tjek

Plan-fil-headeren angiver: "V5 — klar til Codex plan-review-runde 5".

V5 ACCEPT-fix indeholder:

- **T10.1 + T10.2:** `grant insert, update on table ... to authenticated` — DML-GRANT obligatorisk så RLS-policy + session-var-vejen kan virke for write-RPC'erne (Codex V4 KRITISK).
- **T10.13:** `set_config('stork.t9_write_authorized', 'true', false)` før INSERTs i T9-permission-tabeller (Codex V3 KRITISK).
- **T10.10:** `key` immutable + `pii_level` direct→non-direct afvist på UPDATE — forhindrer audit-PII-datalæk (Codex V2 KRITISK-SIKKERHEDSHUL).
- **T10.3:** baseret på P1a's komplette allowlist-VALUES (15 entries inkl. `anonymization_strategies`) + 2 trin 10-entries = 17 total (Codex V2 KRITISK).
- **T10.1:** `clients_fields_is_object check (jsonb_typeof(fields) = 'object')` — forhindrer scalar/array (Codex V1 KRITISK).
- **T10.5 audit_filter_values:** ingen `is_active = true`-filter på direct-PII keys — hashes alle direct-PII keys uanset is_active (Codex V1 KRITISK-SIKKERHEDSHUL).
- **T10.15 smoke-test:** non-object reject + audit-PII-hashing efter is_active=false + immutable-key + pii-downgrade-block (Codex V1 MELLEM + V2 + V3-tilføj).

Deferred G-nummer-kandidat: T10.4 INSERT mangler `ON CONFLICT do nothing` (Codex V1 #4 — DEFER, greenfield-engangsmigration).

## Note om tidligere afbrudt plan-forsøg

Tidligere plan-forsøg på `claude/trin-10-plan-v2`-branchen (V1-V3, commits `f8d110e`, `8b4033e`, `a2ca60c`) byggede fejlagtigt på D5's pre-T1 `public.clients`-tabel og blev forkastet efter Codex runde 3 fandt strukturel fabrikation (T1's drop-migration). Den nuværende V5 starter fra bunden med `core_identity.clients` greenfield.

## Næste skridt

Plan klar til Mathias-godkendelse. Mathias paster `qwerg` for at starte build-fasen.
