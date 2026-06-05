# gov-3a-ci-blockers — Plan V1

**Branch:** claude/gov-3a-ci-blockers-plan
**Krav-dok:** `docs/coordination/governance-vagt-krav-og-data.md` (familie; gov-3 = manglende §3-checks)
**Forfatter:** Code · **Dato:** 2026-06-05 · **Type:** fitness-udvidelse + doc-fix (0 migrations)

## Formål

Lav-brud-flade halvdel af gov-3: byg de §3-fitness-blockers der mangler og forventes at passere rent mod main — #4 immutability-trigger · #7 snapshot-disciplin · #16 schema-ownership · #17 cross-schema-FK. Plus doc-fix: fjern stale zone-§3-paragraf fra master-plan (gennem §8.1-gaten). gov-3b (#6, #10, #18, #19 — høj-brud-flade) er separat.

## §3.1/§3.2/§3.9

- **Patch-først (§3.1):** `fitness.mjs` udvides — nuværende `const checks`-array + relevante const-lister vises 1:1 + diff (4 nye funktioner tilføjes til array; ingen eksisterende check ændres).
- **§3.2 DB-state-dump:** kørt (nedenfor) — checks valideret mod faktisk main-state.
- **§3.9:** ingen destructive drops (scanner + doc-fix; ingen DB-mutation).

## §3.2 Verificerede DB-objekter (rå live-dump 2026-06-05)

**Schema-fordeling (#16):** core_compliance 13 · core_identity 18 · core_money 6 · **public: 0 stork-tabeller**.

**Strict-immutable tabeller + BEFORE UPDATE/DELETE-trigger (#4):**

- `audit_log` → `audit_log_immutability` ✓ · `anonymization_state` → `anonymization_state_immutability` ✓ · `cancellations` → `cancellations_immutability` ✓ · `commission_snapshots` → `commission_snapshots_immutability` ✓ · `salary_corrections` → `salary_corrections_immutability` ✓
- `pay_periods` → **`pay_periods_lock_and_delete_check`** (conditional immutability, ikke `*_immutability` — by design: mutabel indtil lås).

**Cross-schema-FK (#17) — 12, ét mønster:** 11× `core_{money,compliance}.* → core_identity.employees` (actor-refs: `*_by`, `employee_id`, `gdpr_responsible_employee_id`) + 1× `core_identity.employees → auth.users`.

## Per-check design + forventet resultat mod main

| Check                       | Design                                                                                                                                                                                                                                                          | Forventet mod main                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **#4 immutability-trigger** | For hver tabel i `STRICT_IMMUTABLE`-liste: kræv BEFORE UPDATE/DELETE-trigger der RAISE'r. For `CONDITIONAL_IMMUTABLE` (pay_periods): kræv lock-and-delete-trigger. Static-parse af migrations (mønster fra `truncateBlockedOnImmutable`) ELLER live pg_trigger. | **GRØN** — alle 6 har trigger (5 strict + pay_periods conditional)   |
| **#7 snapshot-disciplin**   | Tabeller med snapshot-felter (commission_snapshots m.fl.) har BEFORE UPDATE-trigger der blokerer snapshot-felt-ændring. Genbruger immutability-/snapshot-lister.                                                                                                | **GRØN** (commission_snapshots immutable; snapshot-felter beskyttet) |
| **#16 schema-ownership**    | Ingen stork-domæne-tabel uden for `core_identity/core_money/core_compliance` (live pg_class, eller migration CREATE TABLE-schema-præfiks).                                                                                                                      | **GRØN** — 0 tabeller i public                                       |
| **#17 cross-schema-FK**     | Cross-schema-FK tilladt hvis (a) migration-kommentar dokumenterer den, ELLER (b) matcher allowlist-mønster `CROSS_SCHEMA_FK_ALLOWED` (de 12 actor-refs → core_identity.employees + → auth.users).                                                               | **GRØN** via allowlist-mønster for de 12 verificerede                |

**Ingen reel brud-flade** — alle 4 passerer mod main med korrekt design. #17's allowlist (12 actor-FKs) er triage, ikke fix.

## Doc-fix — fjern zone-§3 (gennem §8.1-gaten)

master-plan §3 "Zone-disciplin" (linje ~1500-1502: _"Pre-commit-hook kræver 'ZONE: red'-prefix…"_) fjernes. Zone er 1.0-arv, aldrig godkendt til 2.0 (krav-dok IKKE-i-scope; Mathias 2026-06-05). §8.1-gate: `governance:check` grøn + Codex prosa-modsigelses-svar (master-plan ejer teknisk-plan; fjernelse modsiger intet ejet begreb).

## Implementations-rækkefølge

1. Patch-først: vis `fitness.mjs` nuværende `const checks` + immutable-lister 1:1 + diff.
2. Tilføj `STRICT_IMMUTABLE` / `CONDITIONAL_IMMUTABLE` / `CROSS_SCHEMA_FK_ALLOWED`-lister + 4 check-funktioner.
3. Registrér de 4 i `const checks`-array.
4. Fjern zone-§3-paragraf fra master-plan.
5. Kør `pnpm fitness` → alle (19+4) grønne mod main. Kør `governance:check` grøn (master-plan-ændring).
6. Udvid negativ-test-dækning (selftest-mønster fra gov-2 / fitness' egne).

## End-to-end-test (§3.6)

Hver ny check: negativ-test (planted overtrædelse → fitness exit≠0) + positiv (main → grøn). Mønster: fitness' eksisterende checks + gov-2's selftest-tilgang.

## Risici + åbne spørgsmål til Codex

1. **#4/#7 static-parse vs live-introspektion:** `truncateBlockedOnImmutable` er static migration-parse. Skal #4/#7 også være static (konsistent, ingen token-afhængighed) eller live pg_trigger (robust mod drift)? Min hældning: static (matcher #5's mønster, kører uden token).
2. **#17 allowlist vs kommentar-krav:** er `CROSS_SCHEMA_FK_ALLOWED`-mønster (core\_\*→employees actor-refs) acceptabelt, eller skal hver cross-schema-FK have eksplicit migration-kommentar (tungere, men mere eksplicit)?
3. **#16 scope:** kun core*\*-schemas, eller skal app*\*-schemas (når de bygges) også dækkes? (Ingen app-schemas endnu.)
4. **pay_periods conditional immutability:** er `lock_and_delete_check` den korrekte klassifikation, eller skal pay_periods ud af immutability-listen helt?
