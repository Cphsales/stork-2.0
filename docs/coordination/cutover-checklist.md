# Cutover-checklist

Pre-cutover-blockers samlet ét sted. Ingen cutover til produktion uden hver række er kvitteret. Master-plan-blockers er autoritative; tabel her er destilleret og holdt synkron med `docs/strategi/stork-2-0-master-plan.md` cutover-blocker-sektion.

**Kilde-flag (H010.6):** Den oprindelige reference "plan v1 sektion 4" kunne ikke lokaliseres som distinkt artefakt i repo'et. Indholdet nedenfor er destilleret fra (a) master-plan §X cutover-blockers, (b) `docs/teknisk/permission-matrix.md` pre-cutover lifecycle-state, og (c) G039 i `docs/teknisk/teknisk-gaeld.md`. Hvis "plan v1 sektion 4" var en anden konkret kilde: send referencen, så afstemmes indholdet ordret.

---

## Master-plan cutover-blockers (11)

Autoritativ kilde: `docs/strategi/stork-2-0-master-plan.md` (Hard cutover-blockers-sektion).

| #   | Blocker                                        | Success-kriterium                                                                                                                                                            | Status |
| --- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | Lag 3 page/tabs-audit bygget                   | `page_access_log` + RPC + min. 1 page klassificeret følsom i `page_audit_config` + smoke-test verificerer log-row                                                            | åben   |
| 2   | G001 audit_filter_values strict-flip aktiveret | `stork.audit_filter_strict='true'` som DB-default; negativ test: INSERT på syntetisk tabel uden klassifikation → exception                                                   | åben   |
| 3   | GDPR-compliance audit gennemført               | `docs/gdpr-compliance.md` signeret af `gdpr_responsible` lister Art. 15/17/18/30 + formålsbegrænsning + dataminimering + behandlingsgrundlag                                 | åben   |
| 4   | PITR aktiveret                                 | Supabase Management API verificerer `pitr_enabled=true`                                                                                                                      | åben   |
| 5   | Backup-retention verificeret                   | Antal dage dokumenteret i denne fil + Supabase Management API verificerer faktisk værdi                                                                                      | åben   |
| 6   | Test-artefakter ryddet (G017)                  | `select count(*) from core_money.pay_periods where start_date < '2000-01-01'` = 0 OG `select count(*) from core_money.salary_corrections where description='smoke test'` = 0 | åben   |
| 7   | Scope-rensning verificeret                     | `pnpm scope:check` returnerer 0 hits                                                                                                                                         | åben   |
| 8   | Dependabot-sårbarheder håndteret (H001)        | 0 høj/kritisk-sårbarheder på default branch                                                                                                                                  | åben   |
| 9   | GHAS-beslutning (H002)                         | Aktiveret eller eksplicit Mathias-godkendt undtagelse                                                                                                                        | åben   |
| 10  | CodeQL-beslutning (H003)                       | Aktiveret eller eksplicit Mathias-godkendt undtagelse                                                                                                                        | åben   |
| 11  | Migration TODO-markører løst (H006)            | 0 TODO-markører i migration-filer                                                                                                                                            | åben   |

---

## UI-aktiveringer (pre-cutover-step, ikke selv blocker)

Autoritativ kilde: `docs/teknisk/permission-matrix.md` "Pre-cutover lifecycle-state". Anonymization-pipeline + break-glass virker ikke før UI-aktivering. Per R7d-invariant kræver alle readers `status='active' AND is_active=true`.

| Lifecycle-tabel                               | Antal rows                                     | Aktivering                                             | Audit-spor                               |
| --------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------ | ---------------------------------------- |
| `core_compliance.anonymization_strategies`    | 3 (blank, hash, hash_email)                    | gdpr_responsible aktiverer via UI (`activate-RPC`)     | faktisk `auth.uid()` af gdpr_responsible |
| `core_compliance.anonymization_mappings`      | 1 (employee)                                   | UI sætter `is_active=true` via mapping-aktiverings-RPC | faktisk `auth.uid()`                     |
| `core_compliance.break_glass_operation_types` | 2 (pay_period_unlock, gdpr_retroactive_remove) | UI sætter `is_active=true` via op-type-aktiverings-RPC | faktisk `auth.uid()`                     |

Yderligere UI-konfiguration der skal være sat før første cutover-relevante drift:

- `core_identity.employee_active_config` — definition af "aktiv" (Q1-leverance)
- `core_identity.role_page_permissions` — superadmin-rows seedet via Q-pakke; andre roller skal seedes via UI
- `core_compliance.data_field_definitions` — PII/retention pr. kolonne klassificeret (default = intet — kræver aktivt valg)
- `core_compliance.gdpr_responsible` valgt via UI

---

## T2 e2e-tests (verifikation post-aktivering)

Disse tests eksisterer i CI siden R7h-merge, men deres aktive-flow-paths kan først valideres efter UI-aktiveringer ovenfor. Pre-aktivering: tests passerer enten på pre-state-checks eller på P0001/P0002-blokering (verificeret).

| Test-fil                                                             | Pre-aktivering                       | Post-aktivering                                                            |
| -------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------- |
| `supabase/tests/smoke/r7a_anonymize_generic_apply_e2e.sql`           | P0002-blok (mapping ikke aktiv)      | Skal anonymisere employee, `[anonymized]` placeholder, state-row INSERT'ed |
| `supabase/tests/smoke/r7a_replay_anonymization_e2e.sql`              | P0002-blok                           | Skal replay'e legacy-shape, `replayed>=1`, PII overskrevet                 |
| `supabase/tests/smoke/r7a_break_glass_execute_e2e.sql`               | Strategy/op-type-blok                | Skal execute med two-actor flow, locked period → open                      |
| `supabase/tests/smoke/r7a_retention_cleanup_cron_e2e.sql`            | Strategi/mapping-blok                | Skal eksekvere cron.command, `employee.anonymized_at` sat                  |
| `supabase/tests/negative/p1b_anonymize_requires_active_strategy.sql` | P0001 ELLER P0002 (begge accepteret) | P0001/P0002 må IKKE rammes længere; aktivering verificeret                 |

Procedure post-aktivering: kør `pnpm db:test` mod aktiv-state og verificér at alle tests stadig passerer (med opdateret forventning der modsvarer aktiv-state, ikke pre-state).

---

## V1 PostgREST set_config eksponerings-test (HÅRD DEADLINE før cutover)

Reference: G039 i `docs/teknisk/teknisk-gaeld.md`. H012 sporer hård deadline.

**Hvorfor:** Session-var-baseret RLS (Variant B) hviler på at `set_config` ikke kan kaldes via PostgREST. Hvis det ER eksponeret, har vi en bypass-vektor for alle RLS-policies der bruger session-vars.

**Test-kategorier:**

| Aktør             | Verifikation                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Anon-key          | `curl` mod `POST /rest/v1/rpc/set_config` (eller hvad PostgREST eksponerer) skal returnere 404 eller "function not found" |
| Authenticated JWT | Samme curl med Bearer JWT skal også returnere 404. JWT-claims må ikke åbne attack-surface der ikke ses med anon           |

**Hvis eksponering afsløres:** Stop-protokol fra `docs/coordination/arkiv/r-runde-2-plan.md` sektion 6.2. Anbefalet vej: Option D (PostgREST-schema-isolation, fitness-check at `db-schemas` ekskluderer `pg_catalog`). Fallback: Option A (REVOKE EXECUTE på `pg_catalog.set_config`).

---

## Andre afgørelser knyttet til cutover

- **Bootstrap-strategier aktivering** er pre-cutover-step (ikke selv blocker, men forudsætning) — dokumenteret i master-plan.
- **Cutover-model:** Model B modificeret — 1.0 autoritativ indtil cutover; 2.0 bygges parallelt; manuel skygge-sammenligning af Mathias; ikke deadline-drevet.
- **Legacy-import** (`legacy_snapshots`, `legacy_audit`) skal være importeret før cutover-dato; kategori 1 (historiske låste perioder) bevares uden re-evaluering.

---

## Procedure for opdatering

1. Når en blocker er løst: opdatér Status-kolonne med commit-hash + "løst YYYY-MM-DD".
2. Når UI-aktivering er gennemført: marker række + tilføj audit-spor reference (`audit_log` entry-id eller dato).
3. Når V1 HTTP-test er kørt: dokumentér resultat (ingen eksponering / Option D adopteret / Option A fallback).
4. Ingen cutover må starte før alle åbne blockers er kvitteret af Mathias.
