# gov-3a-ci-blockers — Slut-rapport

**Dato:** 2026-06-05 · **Pakke:** gov-3a (3a/6 i governance-vagt) · **Type:** fitness-udvidelse + doc-fix (0 migrations)
**Plan:** `docs/coordination/gov-3a-ci-blockers-plan.md` (V2, Codex APPROVAL — ingen nye fund)
**Build:** 4 manglende §3-fitness-blockers + zone-§3-fjernelse

## Formål (genfremlagt)

Lav-brud-flade halvdel af gov-3: byg de §3-fitness-blockers der mangler og passerer rent mod main, så lag 1 er mere komplet før gov-4. Plus fjern stale zone-§3-paragraf.

## Leverancer (mod plan)

| Leverance               | Status | Evidens                                                                                                                                                                        |
| ----------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| #4 immutability-trigger | ✓      | `immutabilityTriggerCoverage` (static) — kræver surviving BEFORE-trigger der dækker **BÅDE update OG delete**; trigger create/drop/recreate final-state-tracked. Grøn mod main |
| #7 snapshot-disciplin   | ✓      | `snapshotFieldProtection` (static, sidste guard-def) — kræver **RAISE** + **PRÆCIS** undtagelses-sæt; commission_snapshots undtager netop {is_candidate, candidate_run_id}     |
| #16 schema-ownership    | ✓      | `schemaOwnership` (live pg_class, **fail-closed i CI**) — grøn; 0 stork-tabeller i public                                                                                      |
| #17 cross-schema-FK     | ✓      | `crossSchemaFkDiscipline` (live pg_constraint, **fail-closed i CI**) — grøn; 12 FKs alle → allowlist-mål (employees/auth.users)                                                |
| zone-§3-fjernelse       | ✓      | master-plan §3 "Zone-disciplin"-paragraf fjernet (§8.1-gate: governance:check grøn)                                                                                            |
| Negativ-test (§3.6)     | ✓      | `fitness:selftest` — baseline + 6 negativ-cases (fail-closed, #4 update-only/delete-only/drop-after-create, #7 manglende/ekstra flag) — alle fanges (se build-review-sektion)  |

**Alle 23 fitness-checks grønne mod main** (19 eksisterende + 4 nye). governance:check grøn (master-plan-ændring). Ingen reel brud-flade — som planlagt.

## Implementerings-valg (Codex-krav indarbejdet)

- **#4/#7 static + final-state-aware** (Codex): `survivingQualifiedTables` (CREATE minus DROP) → droppede tabeller ignoreres; `survivingTriggers` (CREATE minus DROP TRIGGER) → #4 tracker trigger-final-state; #7 bruger `lastFunctionBody` → sidste guard-def vinder.
- **STRICT/CONDITIONAL-split:** STRICT (audit_log, anonymization_state, cancellations, salary_corrections) = blanket-blok. CONDITIONAL: pay_periods (lock-and-delete, ingen felt-guard), commission_snapshots (kun is_candidate/candidate_run_id mutérbar — live-verificeret).
- **#7 mutable-flag-allowlist** (Codex): commission_snapshots-guard skal undtage netop is_candidate + candidate_run_id; snapshot-felt-mutation fejler.
- **#17 allowlist m. grund pr. entry** (Codex): employees (actor-refs) + auth.users; nye cross-schema-mål → flag (review).

## Stork-invariant-tjek (§7)

| Invariant                    | Status | Evidens                                                                  |
| ---------------------------- | ------ | ------------------------------------------------------------------------ |
| Vision-overholdelse          | ✓      | Styrker §3's mekaniske gulv (princip: drift fanges mekanisk, ikke håbet) |
| Permission-matrix-konsistens | N/A    | Ingen RPC/RLS-ændring                                                    |
| Audit-trigger-dækning        | N/A    | Ingen nye tabeller                                                       |
| Konfiguration-i-data         | N/A    | Ingen satser/lønarter                                                    |
| End-to-end-flow virker       | ✓      | `fitness:selftest` (baseline + 2 planted fanges)                         |
| Anonymisering-bevaring       | N/A    | Ingen data rørt                                                          |

## Plan-afvigelser

1. **#16/#17 implementeret LIVE** (pg_class/pg_constraint), ikke static som plan V2 hældede. Begrundelse: static FK-source-schema-parsing (#17) er fragil/FP-tilbøjelig; live-introspektion er den robuste final-state-kilde. #4/#7 forblev static (Codex-krav). **Fail-closed i CI** (manglende token/API-fejl = violation, jf. `liveGuard`); skip kun lokalt for udvikler-flow. Teknisk implementerings-valg inden for plan-intentionen.
2. **Negativ-test dækker static-checks (#4/#7).** Live-checks (#16/#17) er verificeret grønne mod faktisk DB; en live-negativ-test ville kræve prod-mutation. Logikken er allowlist-inspektérbar.

## G-numre rejst

Ingen nye. (Note: §-sektions-ref-validering uden for governance-check-scope — uændret fra gov-2.)

## Codex build-review (runde 1) — 4 KRITISK rettet (falsk-grøn-klasse)

| Fund                                                              | Rettelse                                                                                | Negativ-test                                           |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| #1 required live-checks skippede-til-grøn uden token/ved API-fejl | `liveGuard`: fail-closed i CI (manglende token / API-fejl = violation); skip kun lokalt | `fail-closed: live-check uden token i CI -> violation` |
| #2 #4 brugte update **ELLER** delete                              | Kræver nu **BÅDE** update OG delete (union af surviving-triggeres events)               | `update-only` + `delete-only` fanges                   |
| #3 #4 ikke reelt trigger-final-state                              | `survivingTriggers`: CREATE minus DROP TRIGGER pr. tabel; senere drop fanges            | `drop-after-create` fanges                             |
| #4 #7 tjekkede ikke eksakt undtagelses-sæt / RAISE                | Kræver RAISE + **præcis** flag-sæt (jsonb-`- '<felt>'`); ekstra mutérbart felt fejler   | `guard undtager ekstra felt` fanges                    |

Rapport-påstanden om final-state-aware (Codex #3) er rettet til at matche koden: #4 tracker nu trigger create/drop/recreate, ikke kun tabel-existence.

## Konvergens-historie

| V             | Codex-fund                                                                         | Code-svar                       | Outcome       |
| ------------- | ---------------------------------------------------------------------------------- | ------------------------------- | ------------- |
| V1            | scope/split-spørgsmål                                                              | scope-split godkendt            | V1-grundlag   |
| V2 (Step 2.1) | fund 2 (STRICT/CONDITIONAL-split) + fund 3 (commission_snapshots reklassificering) | begge ACCEPT (live-verificeret) | V2            |
| V2 (runde 2)  | APPROVAL — ingen nye fund                                                          | —                               | qwerg → build |

Normalt leje (§3.4).

## Vision-tjek

- Rigtig løsning eller workaround? **Rigtig.** §3's mekaniske gulv udvidet med 4 reelle checks der fanger drift, ikke håbet fanget.
- Vision-styrkelser: flere §3-blockers håndhævet mekanisk; zone-arv (1.0) fjernet fra master-plan (doc-konsistens).
- Vision-svækkelser: ingen. Ærlige grænser (live-checks token-gated; #7 static-heuristik på guard-felter) dokumenteret.
- Konklusion: **forsvarligt.**

## Status efter gov-3a

Fitness-laget: 23 checks. Resterende §3-blockers (gov-3b): #6 index-per-policy · #10 SECURITY DEFINER · #18 app-schema-write · #19 FK-coverage (G058, 20 `_id`-uden-FK at triagere). Sekvens: gov-3a ✓ → gov-3b → gov-4 (gør checks required).
