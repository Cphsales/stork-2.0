# gov-3a-ci-blockers — Plan V2

**Branch:** claude/gov-3a-ci-blockers-plan
**Krav-dok:** `docs/coordination/governance-vagt-krav-og-data.md` (familie; gov-3 = manglende §3-checks)
**Forfatter:** Code · **Dato:** 2026-06-05 · **Type:** fitness-udvidelse + doc-fix (0 migrations)

## V2 — håndtering af Codex-fund (Step 2.1)

| Fund                                                                      | Svar                          | Hvordan adresseret                                                                                                                                                                 |
| ------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fund 2 — STRICT/CONDITIONAL ikke splittet (V1 lumpede immutable-tabeller) | **ACCEPT**                    | §3.2 + design: eksplicit `STRICT_IMMUTABLE` (blanket-blok) vs `CONDITIONAL_IMMUTABLE` (kontrolleret mutation). #4 kræver det rette mønster pr. klasse                              |
| Fund 3 — commission_snapshots fejl-klassificeret som strict               | **ACCEPT**                    | Verificeret live: triggeren tillader kun `is_candidate`/`candidate_run_id` (snapshot-felter låst) → **CONDITIONAL**. #7 validerer **snapshot-felt-beskyttelse, ikke blanket-blok** |
| Proces — rebase på merged housekeeping                                    | **ACCEPT (sekvens-afhængig)** | Housekeeping afventer Codex prosa-svar + merge; gov-3a rebases på main når housekeeping er merged. V2-indhold er uafhængigt reviewbart                                             |

## Formål

Lav-brud-flade halvdel af gov-3: #4 immutability-trigger · #7 snapshot-disciplin · #16 schema-ownership · #17 cross-schema-FK + fjern stale zone-§3-paragraf (master-plan, gennem §8.1-gaten). gov-3b (#6, #10, #18, #19) separat.

## §3.1/§3.2/§3.9

Patch-først ved fitness-udvidelse (§3.1; eksisterende `const checks` + lister 1:1 + diff). §3.2-dump kørt (nedenfor). Ingen destructive drops (§3.9).

## §3.2 Verificerede DB-objekter (rå live-dump 2026-06-05)

**Schema-fordeling (#16):** core_compliance 13 · core_identity 18 · core_money 6 · **public: 0 stork-tabeller**.

**Immutabilitets-klassificering (#4 + #7) — verificeret pr. trigger:**

| Tabel                                                                | Klasse          | Trigger / mekanisme (live-verificeret)                                                                                                                                                                               |
| -------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| audit_log · anonymization_state · cancellations · salary_corrections | **STRICT**      | `*_immutability` — blanket-blok UPDATE+DELETE                                                                                                                                                                        |
| pay_periods                                                          | **CONDITIONAL** | `pay_periods_lock_and_delete_check` — mutabel indtil lås                                                                                                                                                             |
| commission_snapshots                                                 | **CONDITIONAL** | `commission_snapshots_immutability_check`: kun `is_candidate`/`candidate_run_id` muteres; øvrige (snapshot-)felter immutable; DELETE kun hvis `is_candidate` (verificeret body: _"Fund 3 conditional immutability"_) |

**Cross-schema-FK (#17) — 12, ét mønster:** 11× `core_{money,compliance}.* → core_identity.employees` (actor-refs: `*_by`, `employee_id`, `gdpr_responsible_employee_id`) + 1× `core_identity.employees → auth.users`.

## Per-check design + forventet resultat mod main

| Check                       | Design                                                                                                                                                                                                                                                      | Forventet                                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **#4 immutability-trigger** | `STRICT_IMMUTABLE`-liste → kræv blanket-blok BEFORE UPDATE/DELETE-trigger. `CONDITIONAL_IMMUTABLE`-liste → kræv den klassens guard-trigger (lock-and-delete / felt-guard) findes. Static-parse af migrations (mønster fra #5 `truncateBlockedOnImmutable`). | **GRØN** — 4 strict + 2 conditional alle har deres trigger        |
| **#7 snapshot-disciplin**   | Snapshot-felt-tabeller (commission_snapshots m.fl.) har BEFORE UPDATE-trigger der **blokerer snapshot-felt-ændring** (ikke blanket — kontrollerede flag-felter som `is_candidate` må muteres). Validerer felt-beskyttelse, ikke blanket-blok.               | **GRØN** — commission_snapshots-trigger beskytter snapshot-felter |
| **#16 schema-ownership**    | Ingen stork-domæne-tabel uden for core_identity/core_money/core_compliance.                                                                                                                                                                                 | **GRØN** — 0 i public                                             |
| **#17 cross-schema-FK**     | Tilladt hvis migration-kommentar dokumenterer ELLER matcher `CROSS_SCHEMA_FK_ALLOWED` (actor-refs → employees + → auth.users).                                                                                                                              | **GRØN** via allowlist-mønster for de 12                          |

**Ingen reel brud-flade** — alle 4 passerer mod main med korrekt design + klassificering.

## Doc-fix — fjern zone-§3 (gennem §8.1-gaten)

master-plan §3 "Zone-disciplin" (linje ~1500-1502, _"ZONE: red"-prefix_) fjernes. Zone = 1.0-arv, aldrig godkendt til 2.0 (krav-dok IKKE-i-scope; Mathias 2026-06-05). §8.1: governance:check grøn + Codex prosa-svar.

## Implementations-rækkefølge

1. (Når housekeeping merged) rebase gov-3a på main.
2. Patch-først: vis `fitness.mjs` nuværende `const checks` + immutable-lister 1:1 + diff.
3. Tilføj `STRICT_IMMUTABLE` / `CONDITIONAL_IMMUTABLE` / `CROSS_SCHEMA_FK_ALLOWED`-lister + 4 check-funktioner; registrér i `const checks`.
4. Fjern zone-§3-paragraf fra master-plan.
5. `pnpm fitness` (19+4) grøn mod main · `governance:check` grøn (master-plan-ændring).
6. Negativ-tests pr. ny check (planted overtrædelse → exit≠0).

## End-to-end-test (§3.6)

Pr. ny check: negativ-test (plant overtrædelse → fitness exit≠0) + positiv (main → grøn). Inkl. CONDITIONAL-specifik negativ: forsøg UPDATE af snapshot-felt på commission_snapshots → fanges; UPDATE af `is_candidate` → tilladt (ikke falsk-positiv).

## Risici + åbne spørgsmål til Codex (runde 2)

1. **#4/#7 static-parse:** static migration-parse (matcher #5, kører uden token) — enig, eller foretrækkes live pg_trigger-introspektion for robusthed mod drift mellem migration-tekst og faktisk DB?
2. **#7 felt-liste:** skal "snapshot-felter" udledes pr. tabel (alt undtagen en allowlist af mutable flag-felter som `is_candidate`/`candidate_run_id`), eller eksplicit snapshot-felt-liste pr. tabel? Min hældning: mutable-flag-allowlist pr. CONDITIONAL-tabel (matcher trigger-logikken).
3. **#17 allowlist vs kommentar-krav** (uændret fra V1).
