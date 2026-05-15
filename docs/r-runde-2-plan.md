# R-runde-2 plan — Codex-fund-respons efter DEL 8

**Formål:** Plan for fix-runden der adresserer Codex-tekniske review af `claude/trin-1-fundament` (commits `bc57ae0..8b03d5a`, 24 commits = DEL 8 + C-fund-fixes + disciplin-tilføjelser).

**Status:** PLAN — ingen kode-ændringer eller fix-commits før Codex har valideret planen + Mathias har godkendt valideret plan.

**Forfattet:** 2026-05-15 efter Codex-review.

---

## Sektion 1: Mathias' beslutninger (9 stk)

### Beslutninger på Codex' HØJ/MELLEM-fund (oprindelige 5)

| #   | Beslutning                                                   | Konsekvens                                                                                                                                                                                                                                                                         |
| --- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Fund #4 (unlock duplikater) → **slå unlock fra**             | `pay_period_unlock` operation_type sættes til `status='approved', is_active=false` (ikke aktiverbar pre-cutover; Option C — minimum invasiv). R7e udgår fra fix-runden. Lock-mønster-arkitektur deferred til separat plan-runde post-DEL-8. Nyt G-nr **G032** opretes som tracker. |
| 2   | Fund #11 (R6 destructive) → **kun CLAUDE.md disciplin-note** | Tilføj ny disciplin-regel: "Destructive drops kræver preflight (assert tom + checksum) eller break-glass-godkendelse". Ingen retroaktiv ændring til R6.                                                                                                                            |
| 3   | Fund #14 (set_config exposure) → **V1 verifikation FØRST**   | Hvis IKKE-eksponeret: AFVIS fund + dokumentér antagelse i CLAUDE.md. Hvis eksponeret eller potentielt: STOP, fundament-genovervejelse kræves. Kan blokere hele R-runden.                                                                                                           |
| 4   | Fund #18 (D3 hash-grandfather) → **AFVIS + linje-kommentar** | Tilføj `-- d3-grandfather: pre-discipline file; do not modify` i hver af de 9 grandfather-filer.                                                                                                                                                                                   |
| 5   | Fund #5 (untracked tests) → **selektiv cleanup**             | Inventér 13 untracked tests (1 mindre end Codex' tal). Per-test beslutning: slet / opdatér / commit.                                                                                                                                                                               |

### Beslutninger på implementations-sub-spørgsmål (4 nye)

| #   | Beslutning                                                         | Konsekvens                                                                                                                                                                          |
| --- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6   | unlock_pay_period deaktivering → **Option C**                      | Behold `status='approved'`, sæt `is_active=false`. Ingen lifecycle-trigger-konflikt. Runtime-tjek (efter R7d) kræver `status='active' AND is_active=true` → unlock kan ikke kaldes. |
| 7   | D4 fitness-check → **live-query med skip-when-no-token**           | Samme pattern som `db-rls-policies`. Kører kun når `SUPABASE_ACCESS_TOKEN` er sat (CI). Lokalt: skipped.                                                                            |
| 8   | T1 untracked tests → **cleanup EFTER R7a-d**                       | Tests skal reflektere fixed state, ikke pre-fix-state. Test-commit afhænger af R7-migrations.                                                                                       |
| 9   | M1 permission matrix → **separat fil** `docs/permission-matrix.md` | Reference-dokument hører i docs/, ikke i bygge-status. Auto-genererbar fra Q-SEED + smoke-test.                                                                                     |

---

## Sektion 2: Migrations-rækkefølge (opdateret)

Strikt rækkefølge — hver afhænger af forrige er anvendt + grøn.

| Step   | Type           | Filnavn (foreslået)                                               | Sigte                                                                                                                                                             | Hard-afhængigheder                           | Konsekvens hvis fejler                                                         |
| ------ | -------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------ |
| **V1** | recon          | (ingen migration)                                                 | Verificér om `authenticated` kan kalde `pg_catalog.set_config` udenfor SECURITY DEFINER                                                                           | —                                            | Hvis eksponeret: hele R-runden stopper. Fundament-redesign påkrævet.           |
| R7a    | migration      | `r7a_regprocedure_callable_fix.sql`                               | Refactor 3 RPC'er fra `v_proc::text` til manuel callable-bygning                                                                                                  | V1 grøn                                      | Anonymization, replay, break-glass virker overhovedet ikke før dette fix       |
| R7b    | migration      | `r7b_has_permission_can_view_required.sql`                        | Fix has_permission: kræv `can_view=true` altid                                                                                                                    | V1 grøn                                      | Sikkerhedshul: row med can_view=false/can_edit=false passerer reads            |
| R7c    | migration      | `r7c_verify_anonymization_consistency_permission.sql`             | Tilføj has_permission til verify_anonymization_consistency + Q-SEED-permission                                                                                    | R7b (bruger fixed has_permission)            | RPC kaldbar af alle authenticated uden adgangskontrol                          |
| R7d    | migration      | `r7d_is_active_status_alignment.sql`                              | (a) Backfill: `is_active=false` hvor `status<>'active'`; (b) Opdatér 3 readers til at også tjekke `status='active'`; (c) unlock_pay_period eksplicit deaktivering | R7a (fixed regprocedure før replay refactor) | Anonymization/break-glass virker pre-cutover som om alt er active              |
| R7f    | fitness-update | `scripts/fitness.mjs` redigeres                                   | Udvid `db-rls-policies` til at scanne core_compliance + core_identity + core_money + core_time                                                                    | —                                            | RLS-coverage usynlig for core\_\*-schemas                                      |
| R7g    | fitness-update | `scripts/fitness.mjs` redigeres                                   | Differentier `stripDollarQuoted` så DO-blocks scannes for migration-discipline                                                                                    | —                                            | Migration-bootstrap inde i DO-blocks slipper igennem fitness                   |
| D4     | fitness-add    | `scripts/fitness.mjs` redigeres                                   | Ny check (live-query, skip-when-no-token): aktive mappings.table*name skal have RLS-policy der refererer `stork.allow*<table>\_write`                             | R7d                                          | Fremtidige entity_types tilføjet uden matching write-policy giver runtime-fejl |
| D5     | fitness-add    | `scripts/fitness.mjs` redigeres                                   | Ny check: detection af legacy is_active-readers uden status-check                                                                                                 | R7d                                          | Future drift hvor en ny RPC læser kun is_active                                |
| **T1** | tests          | `supabase/tests/**/*.sql`                                         | Cleanup 13 untracked + 7 nye e2e + permission-matrix smoke                                                                                                        | R7a-d anvendt                                | Tests refererer ikke-eksisterende state                                        |
| **M1** | dokumentation  | `docs/permission-matrix.md`, `docs/teknisk-gaeld.md`, `CLAUDE.md` | Separate permission-matrix-fil + G031/G032 + CLAUDE.md disciplin                                                                                                  | R7a-d + T1                                   | Sluttilstand ikke dokumenteret                                                 |

**Total: 1 recon + 4 SQL-migrations + 4 fitness-ændringer + 1 test-pakke + 1 dok-pakke.**

R7e (unlock purge) udgår. R8b (benchmark) forbliver deferred → G031.

---

## Sektion 3: Test-konsekvens

### 3.1 Inventering af 13 untracked tests (selektiv cleanup, T1)

| #   | Fil                                                    | Beslutning             | Begrundelse                                                                                                                        |
| --- | ------------------------------------------------------ | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `supabase/tests/README.md`                             | **COMMIT som-er**      | Docs; ingen kode-conflict                                                                                                          |
| 2   | `benchmark/01_lock_pipeline_500_emp_100k_rows.sql`     | **SLET**               | Refererer droppet `commission_snapshots_candidate`. Erstattes af G031 (R8b post-lag-E)                                             |
| 3   | `break_glass/01_regprocedure_allowlist.sql`            | **OPDATÉR + COMMIT**   | Tester C006 regprocedure-cast. Skal udvides til at ACTUALLY EXECUTE (fanger Fund #1)                                               |
| 4   | `break_glass/02_gdpr_retroactive_remove_inactive.sql`  | **VERIFICÉR + COMMIT** | Verificerer `gdpr_retroactive_remove.is_active=false` (C006-fix). Stadig relevant.                                                 |
| 5   | `classification/01_retention_not_null_enforced.sql`    | **OPDATÉR + COMMIT**   | Pre-D1: testede NOT NULL. Post-D1: NULL er tilladt, men klassifikation-existence er. Skal omskrives til "klassifikation existence" |
| 6   | `classification/02_retention_value_consistency.sql`    | **VERIFICÉR + COMMIT** | Tester `retention_consistency` CHECK. Skal opdateres til ny CHECK (3 branches inkl. NULL)                                          |
| 7   | `classification/03_admin_floor_blocks_termination.sql` | **OPDATÉR + COMMIT**   | Refererer "admin"-rolle. Skal opdateres til "superadmin" (R1b-rename)                                                              |
| 8   | `cron/01_anonymize_via_cron_end_to_end.sql`            | **OPDATÉR + COMMIT**   | E2E for anonymization via cron-path. Berøres af Fund #1+#6. Skal opdateres til ny generic apply post-R7a                           |
| 9   | `cron/02_replay_uses_snapshot_idempotent.sql`          | **OPDATÉR + COMMIT**   | Replay-test. Berøres af Fund #1 (replay_anonymization refactor). Skal opdateres post-R7a                                           |
| 10  | `negative/01_pay_period_lock_blocks_non_admin.sql`     | **OPDATÉR + COMMIT**   | Refererer "admin"-rolle + is_admin-check. Skal opdateres til has_permission-test (post-Q-PAY)                                      |
| 11  | `negative/02_pay_period_compute_blocks_non_admin.sql`  | Samme                  | Samme                                                                                                                              |
| 12  | `negative/03_anonymize_employee_blocks_non_admin.sql`  | Samme                  | Refererer admin + anonymize_employee. Opdatér til has_permission('employees','anonymize',true)                                     |
| 13  | `smoke/01_function_grants_matrix.sql`                  | **VERIFICÉR + COMMIT** | Tester GRANT-matrix for funktioner. Skal udvides med nye P0/P1a/P2/P3-RPC'er                                                       |

**Resultat efter T1:** 11 tracked (current) + 12 opdaterede/commit'ede untracked − 1 slettet = **23 tests total**.

### 3.2 Nye tests pr. fix

| Test-fil (foreslået)                                  | Type     | Scope                                                                                                                                       |
| ----------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `smoke/r7a_break_glass_execute_e2e.sql`               | smoke    | Setup: aktivér op_type. Request → approve (anden bruger) → execute. Verificér internal_rpc kaldt. (Fanger Fund #1+#9)                       |
| `smoke/r7a_replay_anonymization_e2e.sql`              | smoke    | Setup: aktivér strategier+mapping. INSERT anonymization_state row. Replay. Verificér dispatcher faktisk eksekverede.                        |
| `smoke/r7a_anonymize_generic_apply_e2e.sql`           | smoke    | Setup: aktivér strategier+mapping. Opret test-employee. anonymize_employee. Verificér PII faktisk ændret + anonymization_state-row skrevet. |
| `negative/r7b_can_view_required.sql`                  | negative | INSERT permission med can*view=false, can_edit=false. Kald has_permission(*,\_,false). Skal returnere false. (Fanger Fund #2)               |
| `smoke/r7d_is_active_status_consistency.sql`          | smoke    | Verificér: alle mappings med status<>'active' har is_active=false. Alle med status='active' har is_active=true.                             |
| `negative/r7d_legacy_paths_require_status_active.sql` | negative | Mock mapping med status='approved', is_active=true (vha. direct UPDATE bypass). break_glass_request på den → skal fejle.                    |
| `smoke/m1_permission_matrix.sql`                      | smoke    | Auto-asserter: hver function-row i pg_proc med has_permission-pattern har matching role_page_permissions-row for superadmin                 |

**T1 leverer i alt: 12 opdaterede + 7 nye = 19 ændringer i `supabase/tests/`.**

### 3.3 Final-state RPC permission matrix (M1 leverance)

Leveres som separat fil `docs/permission-matrix.md`. Tabel med alle 32 RPC'er + deres page/tab/can_edit. Inkluderer R7c-tilføjelse for `verify_anonymization_consistency`. Auto-verificeres via `smoke/m1_permission_matrix.sql`.

---

## Sektion 4: SQL-skitser pr. fix

### 4.1 V1 — recon (ingen migration)

**Mål:** Verificér om `authenticated` kan kalde `pg_catalog.set_config` direkte (uden SECURITY DEFINER-wrapper).

**Test-queries:**

```sql
-- Query 1: er set_config grant'et til authenticated?
select has_function_privilege('authenticated', 'pg_catalog.set_config(text, text, boolean)', 'EXECUTE');

-- Query 2: hvilke roller har execute?
select acl.grantee::regrole, acl.privilege_type
from information_schema.routine_privileges acl
where acl.routine_schema = 'pg_catalog' and acl.routine_name = 'set_config';

-- Query 3: kan PostgREST forwarde set_config-kald?
-- (Eksponering-test via REST: skal udføres manuelt af Mathias hvis nødvendigt)
```

**Beslutnings-matrix:**

| Resultat                                                    | Handling                                                                                                                                                       |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authenticated` har IKKE execute (default PG: kun postgres) | **AFVIS Fund #14**. Dokumentér i CLAUDE.md: "set_config kun callable fra SECURITY DEFINER context. Write-policies via session-var er sikre."                   |
| `authenticated` HAR execute                                 | **STOP R-runden.** Rapport til Mathias. Fundament-genovervejelse: alle write-policies skal redesignes. R7a-d kan ikke anvendes meningsfuldt før dette er løst. |

**Tests:** Ingen — dette er recon, ikke fix.

---

### 4.2 R7a — regprocedure callable fix

**Berørte funktioner:** 3 (verificeret via pg_get_functiondef-scan)

1. `core_compliance.anonymize_generic_apply(text, uuid, text)` — P1b
2. `core_compliance.replay_anonymization(text, boolean)` — Q-pakke
3. `core_compliance.break_glass_execute(uuid)` — Q-pakke + C006

**Skitse (pattern for alle 3):**

```sql
-- FØR (buggy):
v_proc := (v_strategy.function_schema || '.' || v_strategy.function_name || '(text, text)')::regprocedure;
-- ... senere ...
v_set_clauses := v_set_clauses || format('%I = %s(%I, $1)', col, v_proc::text, col);
-- v_proc::text = "core_compliance._anon_strategy_blank(text, text)"
-- SQL: first_name = core_compliance._anon_strategy_blank(text, text)(first_name, $1)
-- ← INVALID SYNTAX

-- EFTER (fixed):
-- Bevar regprocedure-cast som validering (eksistens + signatur)
v_proc := (v_strategy.function_schema || '.' || v_strategy.function_name || '(text, text)')::regprocedure;
-- Byg callable identifier separat
v_callable := format('%I.%I', v_strategy.function_schema, v_strategy.function_name);
v_set_clauses := v_set_clauses || format('%I = %s(%I, $1)', col, v_callable, col);
-- SQL: first_name = "core_compliance"."_anon_strategy_blank"(first_name, $1)
-- ← VALID
```

Anvendt på alle 3 funktioner. `break_glass_execute` + `replay_anonymization` bruger samme pattern med deres respektive signaturer (uuid, text) og (uuid, jsonb, text).

**Defense-in-depth bevaret:**

1. regprocedure-cast: validerer funktion eksisterer + signatur er korrekt (fejler tidligt, før EXECUTE)
2. Manuel callable-string: bygger SQL-syntaks PostgreSQL kan parse
3. format med %I: SQL-injection-safe identifier-quoting

**Tests:** 3 e2e-tests fra Sektion 3.2 (r7a\_\*) — alle ACTUALLY EXECUTE.

---

### 4.3 R7b — has_permission can_view fix

**Berørt:** `core_identity.has_permission(text, text, boolean)`

**Skitse:**

```sql
-- FØR (buggy):
where ...
  and (not p_can_edit or p.can_edit = true)
-- Med p_can_edit=false: "not false or ..." = true. Row med can_view=false slipper.

-- EFTER (fixed):
where ...
  and p.can_view = true                              -- altid kræves
  and (not p_can_edit or p.can_edit = true)          -- yderligere kun hvis can_edit krævet
```

**Konsekvens-verifikation:** Alle Q-SEED-rows og P-rows har `can_view=true` (verificeret tidligere). Ingen funktionalitet brydes.

**Tests:** `negative/r7b_can_view_required.sql`

---

### 4.4 R7c — verify_anonymization_consistency permission

**Bekræftet:** Funktion eksisterer i `core_compliance` med **NO permission check overhovedet** — verre end Codex sagde. Anyone authenticated kan kalde den og se anonymization-state.

**Skitse:**

```sql
create or replace function core_compliance.verify_anonymization_consistency()
returns ...  -- bevarer eksisterende return-type
language plpgsql security definer set search_path = ''
as $func$
begin
  -- NY: permission-check tilføjet
  if not core_identity.has_permission('audit', 'verify_anonymization', false) then
    raise exception 'verify_anonymization_consistency kraever permission audit.verify_anonymization'
      using errcode = '42501';
  end if;
  -- ... eksisterende body bevares uændret ...
end;
$func$;
```

Plus Q-SEED-tilføjelse: `('audit', 'verify_anonymization', true, false)` til superadmin.

**Tests:** Negative-test: authenticated uden permission → 42501.

---

### 4.5 R7d — is_active/status alignment + unlock-deaktivering

**Del A — Backfill (rydder op efter P2+P3):**

```sql
-- anonymization_mappings
select set_config('stork.allow_anonymization_mappings_write', 'true', false);
select set_config('stork.source_type', 'migration', false);
select set_config('stork.change_reason',
  'R7d: ryd is_active=true paa non-active mappings (Codex Fund #3)', false);

update core_compliance.anonymization_mappings
   set is_active = false
 where status <> 'active' and is_active = true;

-- break_glass_operation_types
select set_config('stork.allow_break_glass_operation_types_write', 'true', false);
select set_config('stork.change_reason',
  'R7d: ryd is_active=true paa non-active operation_types', false);

update core_compliance.break_glass_operation_types
   set is_active = false
 where status <> 'active' and is_active = true;
```

**Effekt:** Alle 1 mapping + 2 op_types går fra `(approved, is_active=true)` → `(approved, is_active=false)`. UI-aktivering kræves pre-cutover.

**Del B — Opdatér 3 is_active-readers:**

1. `replay_anonymization`:

   ```sql
   -- FØR:
   where entity_type = v_state.entity_type and is_active = true;
   -- EFTER:
   where entity_type = v_state.entity_type and status = 'active' and is_active = true;
   ```

2. `break_glass_request`:

   ```sql
   -- FØR:
   where operation_type = p_operation_type and is_active = true;
   -- EFTER:
   where operation_type = p_operation_type and status = 'active' and is_active = true;
   -- + error-msg: "ukendt eller ikke-aktiveret operation_type"
   ```

3. `break_glass_execute`:
   Samme pattern: tilføj `status = 'active'`.

**Del C — Unlock-deaktivering (Mathias beslutning 6 — Option C):**

`pay_period_unlock` operation_type har allerede status='approved' (efter P3-backfill). Del A backfill sætter `is_active=false`. Resultat: kombinationen `(approved, is_active=false)` betyder unlock kan ikke kaldes via break-glass-flow (Del B's readers tjekker `status='active'`).

Ingen yderligere migration-handling. Lifecycle-disciplin bevares (ingen direct UPDATE til status='draft').

**Defense-in-depth:** `is_active` bevares som "RPC-aktivering eksplicit" bool; `status='active'` bevares som "lifecycle-aktivering eksplicit". Begge skal være true for runtime-brug.

**Tests:** `smoke/r7d_is_active_status_consistency.sql` + `negative/r7d_legacy_paths_require_status_active.sql`.

---

### 4.6 R7f — db-rls-policies fitness udvidet

**Berørt fil:** `scripts/fitness.mjs` — funktion `dbRlsPolicies()`

**Skitse:**

```javascript
// FØR:
const query = `
  SELECT n.nspname AS schema, c.relname AS table_name, ...
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'r' AND c.relrowsecurity = true
    AND n.nspname = 'public'                          // ← kun public
  ORDER BY 1, 2;
`;

// EFTER:
const query = `
  SELECT n.nspname AS schema, c.relname AS table_name, ...
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'r' AND c.relrowsecurity = true
    AND n.nspname IN ('public', 'core_compliance', 'core_identity', 'core_money', 'core_time')
  ORDER BY 1, 2;
`;
```

**Konsekvens:** Fitness vil for første gang validere RLS-policy coverage for core\_\*-tabeller. Forventet: alle bør have policies (FORCE RLS er enabled). Hvis nogle mangler: pre-eksisterende drift, ikke introduceret af R7f. Skal håndteres efter fitness-output.

---

### 4.7 R7g — stripDollarQuoted DO-blocks differentiering

**Berørt fil:** `scripts/fitness.mjs`

**Skitse:**

```javascript
// Ny helper: stripFunctionBodiesOnly (i modsætning til stripDollarQuoted)
// Forskel: scan til vi finder CREATE FUNCTION/CREATE OR REPLACE FUNCTION/CREATE PROCEDURE
// før vi strippe dollar-quoted block. DO-blocks behandles som migration-time eksekvering.

function stripFunctionBodiesOnly(sql) {
  // ... iterate over $...$ blocks ...
  // Find preceding context (last ~100 chars before block start):
  //   - if matches CREATE (OR REPLACE) FUNCTION/PROCEDURE → strip (function body)
  //   - if matches DO → keep (migration-time DO-block)
  //   - else → keep
}

// Brug:
async function migrationSetConfigDiscipline() {
  // ...
  const cleaned = stripFunctionBodiesOnly(stripSqlComments(sql)); // ← skift
  // ... rest unchanged
}
async function migrationOnConflictDiscipline() {
  // Samme skift
}
```

**Konsekvens:** Fitness scanner nu INSERT'er inde i DO-blocks. Hvis vi har bootstrap-INSERTs i DO-blocks uden ON CONFLICT: ny violation. Skal verificeres efter implementation.

---

### 4.8 D4 — fitness for write-policy session-var consistency (live-query, Mathias beslutning 7)

**Berørt fil:** `scripts/fitness.mjs`

**Skitse:**

```javascript
async function writePolicySessionVarConsistency() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    return {
      name: "write-policy-session-var-consistency",
      violations: [],
      skipped: "SUPABASE_ACCESS_TOKEN ikke sat",
    };
  }

  // Query: for hver active mapping, hent target-tabellens write-policies
  const query = `
    SELECT m.table_schema, m.table_name,
           array_agg(distinct (regexp_match(
             coalesce(pg_get_expr(p.polqual, p.polrelid), '') ||
             coalesce(pg_get_expr(p.polwithcheck, p.polrelid), ''),
             'stork\\.allow_(\\w+)_write'))[1]) FILTER (WHERE ... ) AS write_vars
    FROM core_compliance.anonymization_mappings m
    LEFT JOIN pg_class c ON c.relname = m.table_name
    LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = m.table_schema
    LEFT JOIN pg_policy p ON p.polrelid = c.oid AND p.polcmd IN ('a','w','d')
    WHERE m.status = 'active'
    GROUP BY m.table_schema, m.table_name;
  `;

  // For hver mapping: verificér at expected_var (stork.allow_<table>_write)
  // findes i write_vars-array
  // Violation hvis mismatch
}
```

**Konsekvens:** Fitness fanger fremtidige entity_types tilføjet uden matching write-policy. Pt. kun `employees` er mapped → ingen violations forventet.

---

### 4.9 D5 — fitness for legacy is_active-readers

**Berørt fil:** `scripts/fitness.mjs`

**Skitse:**

```javascript
async function legacyIsActiveReaders() {
  // Tabeller med lifecycle-status der ALTID skal læses med status='active'-check:
  const LIFECYCLE_TABLES = new Set([
    "core_compliance.anonymization_mappings",
    "core_compliance.break_glass_operation_types",
    "core_compliance.anonymization_strategies",
  ]);

  // For hver migration-fil:
  //   strip kommentarer + function bodies (men IKKE DO-blocks)
  //   find FROM <table> WHERE ... is_active = true
  //   verificér at samme WHERE-clause også indeholder status='active'
  // Hvis ikke: violation
}
```

**Konsekvens:** Fanger ny RPC der læser kun is_active uden status-check. Hvis efter R7d alle current paths er fixed: ingen violations. Hvis fitness finder noget jeg glemte: ekstra fix-runde mini.

---

## Sektion 5: Lock-mønster udskudt — G032

**Bekræftelse:** `pay_period_unlock` operation_type holdes deaktiveret (Option C) gennem R7d. Funktionen `pay_period_unlock_via_break_glass` findes som infrastruktur men kan ikke kaldes via UI-flow (operation_type har is_active=false efter R7d-backfill).

**Nyt G-nr (M1-leverance):** `G032` tilføjes til `docs/teknisk-gaeld.md`:

```markdown
### [G032] HØJ — Lock-mønster-arkitektur ikke afgjort

- **Beskrivelse:** Unlock+recompute+re-lock af pay_period producerer
  duplikater (Codex Fund #4 + G030 — gen_random_uuid placeholder sale_id).
  Pre-cutover-fix: unlock-operation deaktiveret via R7d-backfill
  (is_active=false, status=approved). Funktionen findes som infrastruktur
  men er ikke kaldbar via break-glass-flow.
- **Vision-svækkelse:** §1.6 (snapshot = frosset state) — unlock
  undergraver invarianten hvis duplicate-pattern ikke løses.
- **Berører:** løn, gamification, database-oprydning, kampagne-afslutning,
  KPI-frysning, audit-trail.
- **Skal løses:** Separat plan-runde post-DEL-8 før lock-mønster
  aktiveres. Beslutninger:
  - unlock vs modposter (cancellations/corrections) — hvilket vinder?
  - arkivering vs slette af locked perioder?
  - genoptag/re-compute disciplin?
- **Plan (G032 resolution):**
  1. Lock-mønster-arkitektur dokument
  2. Implementér valgt strategi (unlock vs modpost vs hybrid)
  3. Aktivér pay_period_unlock operation_type via UI-flow
  4. Fjern G032 fra teknisk-gæld
- **Indtil løst:** unlock kaldbar via direkte SQL (postgres-role) som
  break-glass, men ikke som UI-flow.
```

---

## Sektion 6: Risiko + kompensation

### 6.1 Risiko-matrix pr. migration

| Migration            | Værste-case                                                | Sandsynlighed                            | Rollback                                                                                          |
| -------------------- | ---------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| V1                   | Afslører set_config-eksponering → stop hele R-runden       | Lav (PG-default er restriktiv)           | N/A (recon, ingen ændring)                                                                        |
| R7a                  | Anonymization stadig broken efter fix                      | Mellem                                   | Revert + revisér callable-bygning                                                                 |
| R7b                  | Eksisterende perm-rows pludselig ikke virker               | Lav (alle har can_view=true verificeret) | Revert; alle 17 seedede rows er checked                                                           |
| R7c                  | verify_anonymization_consistency bryder hidden caller      | Mellem (vi ved ikke hvem der kalder den) | Revert; tilføj logging først for at finde caller                                                  |
| R7d (Del A backfill) | UI-aktivering ikke kørt → anonymization broken pre-cutover | Høj (planlagt; det er designet)          | Revert backfill (UPDATE is_active=true igen) — men det modarbejder lifecycle-disciplin            |
| R7d (Del B readers)  | Replay/break-glass virker ikke før UI-aktivering           | Høj (planlagt)                           | Revert reader-ændringer; samtidig holde lifecycle                                                 |
| R7f                  | Fitness finder mange pre-eksisterende RLS-violations       | Høj (vi har aldrig scannet core\_\*)     | Ingen rollback nødvendig; fitness fail blokerer kun nye PRs. Existing state er ikke værre end før |
| R7g                  | DO-block-scan fanger gamle migrations                      | Mellem                                   | Grandfather som fil-baseret (Fund #18-pattern)                                                    |

### 6.2 Hvis V1 afslører eksponering

**Stop-protokol:**

1. STOP alle R-runde-2-migrations
2. Rapportér til Mathias med exact query-output
3. Foreslå redesign-options:
   - Option A: REVOKE EXECUTE på set_config fra authenticated; verificér intet PostgREST-flow afhænger
   - Option B: Skift fra session-var-baserede policies til signed-claims (auth.jwt() med custom claims)
   - Option C: Skift til SECURITY DEFINER-RPCs som eneste write-sti; ingen RLS write-policy

Hver option er **fundament-redesign** der berører 15+ migration-filer. Kræver Mathias-godkendt arkitektur-runde før implementation.

### 6.3 Generel kompensation

- Alle 4 R7-migrations idempotente (CREATE OR REPLACE FUNCTION / ON CONFLICT DO NOTHING)
- Hver migration kan rulle-frem uafhængigt; bagudkompatibel rollback via PG-snapshot pre-R7
- Fitness/test-ændringer er kode-only, ingen DB-state — risiko 0

---

## Sektion 7: Konsistens-tjek

### 7.1 Vision-dokumentets 9 principper

| Princip                    | Påvirkning                                                 | Konsistent? |
| -------------------------- | ---------------------------------------------------------- | ----------- |
| 1: Én sandhed              | Ingen — R-runde fjerner kun bugs, tilføjer ikke ny sandhed | ✓           |
| 2: UI-permissions          | R7b+R7c styrker (can_view-fix + verify-konvertering)       | ✓ Styrket   |
| 3: Stamme=DB               | Uændret                                                    | ✓           |
| 4: Default = intet for PII | Uændret                                                    | ✓           |
| 5: Lifecycle for konfig    | R7d styrker (cleanup of is_active drift)                   | ✓ Styrket   |
| 6: Beregning over DB       | Uændret                                                    | ✓           |
| 7: Anonymisering = UPDATE  | R7a + R7d styrker (regprocedure fix + status-gate)         | ✓ Styrket   |
| 8: Audit-bevares           | Uændret (verify-RPC under audit-permission tilfører trail) | ✓           |
| 9: Snapshot-mønster        | Lock-mønster udskudt → G032 sporer                         | ✓ med G-nr  |

### 7.2 Master-plan rettelser

| Rettelse                                           | Konflikt?                                                                        |
| -------------------------------------------------- | -------------------------------------------------------------------------------- |
| 22 (PII via registry)                              | R7a fixer regprocedure → registry virker først nu reelt                          |
| 23 (audit-undtagelse statisk allowlist)            | Uændret                                                                          |
| 26 (hardkodet undtagelse: is_admin/superadmin)     | Uændret — R7c konverterer verify til has_permission (ikke superadmin-territorie) |
| 27 (lifecycle status=draft/tested/approved/active) | R7d styrker enforcement                                                          |
| 30 (anonymization_strategies streng validation)    | R7a-fix gør strategy-execution korrekt                                           |
| 31 (UI-permissions erstatter is_admin)             | R7c afslutter (verify_anonymization_consistency var den 22.)                     |

### 7.3 Mathias' Problem 1-4 afgørelser

| Problem                                        | Konflikt?                                                                                                 |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1: is_admin på 22 RPC'er                       | R7c afslutter — nu reelt 22 (inkl. verify) konverteret, kun superadmin_settings_update beholder           |
| 2: current_employee_id Option A (konfig-tabel) | Uændret                                                                                                   |
| 3: stork.bootstrap_activation dropped          | Uændret — R7d sætter is_active=false ved backfill, IKKE active via session-var bypass                     |
| 4: status='approved' bootstrap                 | Uændret — R7d cementerer at runtime kræver status='active' (forhindrer bootstrap-rows i at virke uden UI) |

### 7.4 Nye tekniske problemer opdaget undervejs (CLAUDE.md disciplin)

**Tre eksplicit-flag'ede problemer:**

1. **R7d Del A backfill konflikter potentielt med lifecycle-trigger:** UPDATE is_active=false er fint (ingen status-ændring), MEN hvis vi senere skulle UPDATE'e status tilbage fra approved → draft for pay_period_unlock, det er en regression som lifecycle-trigger blokerer. **Løst via Mathias beslutning 6 (Option C):** behold status=approved, kun sæt is_active=false. Ingen lifecycle-konflikt.

2. **R7a + R7d rækkefølge-kritisk:** R7a fixer replay_anonymization. R7d opdaterer replay_anonymization mapping-query med status='active'. Hvis R7d applies før R7a: replay stadig broken pga regprocedure-bug. Rækkefølge i Sektion 2 håndterer dette: R7a → R7d.

3. **D4 fitness-check kræver migration-fil-parsing eller live-query:** Pt. har vi `audit-trigger-coverage`-pattern der scanner CREATE TRIGGER. D4 skal scanne CREATE POLICY-blokke eller live DB-query. **Løst via Mathias beslutning 7:** live-query med skip-when-no-token. Samme pattern som db-rls-policies.

---

## Konklusion

Denne plan adresserer:

- **9 HØJ-fund** fra Codex: 8 ACCEPT (1, 2, 3, 5, 6, 7, 8, 9) + 1 deferred (4 → G032)
- **9 MELLEM-fund** fra Codex: 7 ACCEPT (10, 14, 15, 17 direkte; 11, 12, 13, 18 som disciplin/dokumentation/defer) + 1 AFVIST (18 over-engineering, erstattet med linje-kommentar)
- **7 scope-mangler** fra Codex: 5 ACCEPT (2, 3, 4, 6, 7) + 2 DEFER (1 = C007, 5 = G031)

Migrations-rækkefølge: V1 → R7a → R7b → R7c → R7d → R7f → R7g → D4 → D5 → T1 → M1.

Risiko-håndtering: V1 kan blokere hele runden hvis exposure findes. R7d's lifecycle-stramning kan brydes hvis UI-aktivering ikke kører pre-cutover (planlagt).

Klar til Codex-validering.
