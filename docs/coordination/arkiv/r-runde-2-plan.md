# R-runde-2 plan — Codex-fund-respons efter DEL 8 (v2)

**Formål:** Plan for fix-runden der adresserer Codex-tekniske review af `claude/trin-1-fundament` (commits `bc57ae0..8b03d5a`, 24 commits = DEL 8 + C-fund-fixes + disciplin-tilføjelser).

**Status:** PLAN v2 — opdateret efter Codex' genvalidering af v1. v1 var håndskreven inventory-baseret; v2 baseres på live DB introspection som autoritativ kilde.

**Forfattet:** 2026-05-15 efter Codex-review (v1) → live recon + Codex-genvalidering (v2).

---

## Strukturel beslutning: live DB introspection som primær kilde

**Kerne-skifte fra v1:** Codex' gennemgående kritik var at v1 byggede på håndskrevne inventories (3 readers, 3 regprocedure-funktioner). Live recon afslørede ufuldstændighed: 6 is_active-readers + 1 cron-body med regprocedure-bug = mindst dobbelt så mange affected sites som v1 dækkede.

**v2-princip:** Hver R-runde-2-fix der berører "alle steder hvor X bruges" bruger **`pg_get_functiondef` + `cron.job.command`-introspection** som autoritativ kilde for inventory. Håndskrevne lister er pre-build recon, ikke implementations-grundlag.

**Hvor inventories bibeholdes:**

- Q-SEED-permissions (statisk seed, ikke runtime)
- AUDIT_EXEMPT_SNAPSHOT_TABLES (eksplicit kode-allowlist)
- BOOTSTRAP_CONFIG_TABLES (fitness-konstant)

**Hvor introspection erstatter:**

- R7a-affected functions/cron-bodies inventory
- R7d-affected readers inventory
- D5 fitness-check kilde
- M1 permission matrix (auto-generated from pg_proc)

---

## Sektion 1: Mathias' beslutninger (9 stk)

### Beslutninger på Codex' HØJ/MELLEM-fund (oprindelige 5)

| #   | Beslutning                                                   | Konsekvens                                                                                                                                                                                                           |
| --- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Fund #4 (unlock duplikater) → **slå unlock fra**             | `pay_period_unlock` operation_type sættes til `status='approved', is_active=false` (Option C — minimum invasiv). R7e udgår. Lock-mønster deferred til separat plan-runde. **G032** tracker.                          |
| 2   | Fund #11 (R6 destructive) → **kun CLAUDE.md disciplin-note** | Tilføj disciplin-regel om preflight ved destructive drops. Ingen retroaktiv R6-ændring.                                                                                                                              |
| 3   | Fund #14 (set_config exposure) → **V1 verifikation FØRST**   | Live recon-resultat: `has_function_privilege=true` for alle 4 roller (PG-default). PostgREST eksponerer ikke pg_catalog → attack-path lukket via REST. V1 udvidet med PostgREST-test (se 4.1) for endelig afgørelse. |
| 4   | Fund #18 (D3 hash-grandfather) → **AFVIS + linje-kommentar** | Tilføj `-- d3-grandfather: pre-discipline file; do not modify` i hver af de 9 grandfather-filer.                                                                                                                     |
| 5   | Fund #5 (untracked tests) → **selektiv cleanup**             | Inventér 13 untracked tests. Per-test beslutning.                                                                                                                                                                    |

### Beslutninger på implementations-sub-spørgsmål (4 nye)

| #   | Beslutning                                                                 | Konsekvens                                                      |
| --- | -------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 6   | unlock_pay_period deaktivering → **Option C**                              | `status='approved', is_active=false`. Ingen lifecycle-konflikt. |
| 7   | D4 fitness-check → **live-query med skip-when-no-token**                   | Samme pattern som `db-rls-policies`.                            |
| 8   | T1 untracked tests → **cleanup EFTER R7a-d**                               | Tests reflekterer fixed state.                                  |
| 9   | M1 permission matrix → **separat fil** `docs/teknisk/permission-matrix.md` | Auto-genereret fra pg_proc + role_page_permissions.             |

---

## Sektion 2: Migrations-rækkefølge (v2)

| Step   | Type           | Filnavn                                                                             | Sigte                                                                                                                                                     | Afhængigheder                                  |
| ------ | -------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **V1** | recon          | (ingen migration)                                                                   | `has_function_privilege` + PostgREST-eksponering-test for `set_config`                                                                                    | —                                              |
| **V2** | recon          | (ingen migration)                                                                   | **Live DB-inventory**: alle funktioner + cron-bodies med (a) `regprocedure::text`, (b) `is_active = true`-read uden `status='active'`                     | —                                              |
| R7a    | migration      | `r7a_regprocedure_callable_fix.sql`                                                 | Fix alle steder fra V2's inventory (a). Inkluderer cron.job-bodies.                                                                                       | V1 ikke-blokerende, V2                         |
| R7b    | migration      | `r7b_has_permission_can_view_required.sql`                                          | Fix has_permission: kræv `can_view=true` altid                                                                                                            | V1 ikke-blokerende                             |
| R7c    | migration      | `r7c_verify_anonymization_consistency_permission.sql`                               | Tilføj has_permission til verify_anonymization_consistency + Q-SEED                                                                                       | R7b                                            |
| R7d    | migration      | `r7d_is_active_status_alignment.sql`                                                | (a) Backfill is_active=false hvor status<>'active'; (b) Opdatér ALLE readers fra V2's inventory (b); (c) cron.unschedule+reschedule med opdaterede bodies | R7a (regprocedure-fix før reader-refactor), V2 |
| R7f    | fitness-update | `scripts/fitness.mjs`                                                               | db-rls-policies udvidet til core\_\*-schemas                                                                                                              | —                                              |
| R7g    | fitness-update | `scripts/fitness.mjs`                                                               | stripDollarQuoted differentier DO vs CREATE FUNCTION vs cron.schedule                                                                                     | —                                              |
| D4     | fitness-add    | `scripts/fitness.mjs`                                                               | Live-query: aktive mappings.table_name → matching write-policy session-var                                                                                | R7d                                            |
| D5     | fitness-add    | `scripts/fitness.mjs`                                                               | **Live `pg_get_functiondef` + cron.job-introspection** (ikke migration-grep): readers af lifecycle-tabeller skal have status='active'                     | R7d                                            |
| **T1** | tests          | `supabase/tests/**/*.sql` + `scripts/run-db-tests.mjs` + CI-kald                    | Cleanup + nye e2e-tests + test-runner wiring                                                                                                              | R7a-d                                          |
| **M1** | dokumentation  | `docs/teknisk/permission-matrix.md`, `docs/teknisk-gaeld.md` G031/G032, `CLAUDE.md` | Auto-genereret matrix fra pg_proc + G-numre + CLAUDE.md disciplin                                                                                         | R7a-d + T1                                     |

**Total:** 2 recon + 4 SQL-migrations + 4 fitness-ændringer + 1 test-pakke + 1 dok-pakke. R7e udgår.

---

## Sektion 3: Test-konsekvens (v2)

### 3.1 Inventering af 13 untracked tests

Uændret fra v1 — se v1's tabel. Stale: 1 (benchmark). Opdatér: 11. Commit som-er: 2 (README + grants_matrix verificeret + opdateret).

### 3.2 Nye tests pr. fix (v2 — udvidet)

| Test-fil                                                     | Type     | Scope                                                                                                                                                                    |
| ------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `smoke/r7a_break_glass_execute_e2e.sql`                      | smoke    | Aktivér op_type → request → approve → execute → verificér internal_rpc kaldt (Fund #1+#9)                                                                                |
| `smoke/r7a_replay_anonymization_e2e.sql`                     | smoke    | Aktivér strategier+mapping → INSERT anonymization_state → replay → verificér dispatcher eksekverede                                                                      |
| `smoke/r7a_anonymize_generic_apply_e2e.sql`                  | smoke    | Aktivér strategier+mapping → opret test-employee → anonymize_employee → verificér PII ændret + state-row skrevet                                                         |
| **`smoke/r7a_retention_cleanup_cron_e2e.sql`**               | smoke    | **NY (Fund #6)**: Simuler retention_cleanup_daily eksekvering — aktiv mapping + retention_event_column-baseret cleanup. Verificér dispatcher faktisk eksekverer post-R7a |
| `negative/r7b_can_view_false_can_edit_true.sql`              | negative | **NY (Fund #10)**: Row med can*view=false, can_edit=true → has_permission(*,\_,true) skal returnere false                                                                |
| `negative/r7b_can_view_false_can_edit_false.sql`             | negative | Row med can*view=false, can_edit=false → has_permission(*,\_,false) skal returnere false                                                                                 |
| `smoke/r7d_is_active_status_consistency.sql`                 | smoke    | Alle mappings + op_types: status<>'active' → is_active=false; status='active' → is_active=true                                                                           |
| **`negative/r7d_mapping_legacy_status_active_required.sql`** | negative | **SPLIT (Fund #11)**: Mock anonymization_mapping med status='approved', is_active=true → anonymize_generic_apply skal fejle                                              |
| **`negative/r7d_op_type_legacy_status_active_required.sql`** | negative | **SPLIT (Fund #11)**: Mock break_glass_operation_type med status='approved', is_active=true → break_glass_request skal fejle                                             |
| `smoke/m1_permission_matrix.sql`                             | smoke    | Auto-asserter: hver function med has_permission-pattern har matching role_page_permissions-row                                                                           |

**Total: 12 opdaterede + 10 nye = 22 ændringer i supabase/tests/.**

### 3.3 Test-runner wiring (Fund #12)

`scripts/run-db-tests.mjs` (untracked pt.) — verificeres + commit + kobles i CI via `.github/workflows/`. Pre-T1: test-katalog katalogiseret men ikke automatisk kørt. Post-T1: tests kører i CI på hver PR.

### 3.4 Final-state RPC permission matrix (M1)

Leveres som **auto-genereret** fil. SQL-template:

```sql
-- docs/teknisk/permission-matrix.md genereres via:
copy (
  select n.nspname || '.' || p.proname as rpc,
         /* parse pg_get_functiondef for has_permission(...,...,...) */
         /* join mod role_page_permissions for current state */
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('core_compliance','core_identity','core_money','core_time')
) to '...'
```

`smoke/m1_permission_matrix.sql` auto-asserter at hver has_permission-RPC har matching seed-row for superadmin.

---

## Sektion 4: SQL-skitser pr. fix (v2)

### 4.1 V1 — recon (udvidet med PostgREST-test, Fund #8)

**Live recon-resultat (allerede kørt 2026-05-15):**

| Role          | has_function_privilege på set_config(text, text, boolean) |
| ------------- | --------------------------------------------------------- |
| authenticated | **true** (PG-default)                                     |
| public        | true                                                      |
| anon          | true                                                      |
| service_role  | true                                                      |

**Konklusion DB-privilege-niveau:** Alle 4 roller har EXECUTE. Det er PG-default — set_config er en built-in pg_catalog-funktion. **Privilege i sig selv lukker IKKE eksposure-spørgsmålet.**

**Udvidet V1 — PostgREST-test (Codex Fund #8):**

PostgREST eksponerer kun funktioner i schemas der er listet i `db-schemas`-config (default: `public, graphql_public`). `pg_catalog.set_config` er IKKE i public schema → ikke eksponeret som REST-RPC.

**Verifikations-step (kræver Mathias HTTP-test eller curl):**

```bash
# Skal returnere 404 eller "function not found":
curl -X POST "https://<project>.supabase.co/rest/v1/rpc/set_config" \
  -H "apikey: <anon_key>" \
  -H "Content-Type: application/json" \
  -d '{"setting_name": "stork.allow_employees_write", "new_value": "true", "is_local": false}'
```

**Beslutnings-matrix:**

| PostgREST-test resultat                 | Handling                                                                                                                                                                                                                                              |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 404/function not found                  | **AFVIS Fund #14**. Dokumentér: "set_config ikke eksponeret via PostgREST. Attack-surface kræver direkte SQL-access (kun postgres + service_role). authenticated kan ikke bypasse write-policies." Update CLAUDE.md disciplin med præcis formulering. |
| Function callable / unexpected response | **STOP R-runden**. Fundament-redesign. R7a-d kan ikke meningsfuldt anvendes.                                                                                                                                                                          |

**Stop-protokol Option A (REVOKE EXECUTE) advarsel (Fund #16):**

- REVOKE EXECUTE FROM PUBLIC, anon, authenticated på `pg_catalog.set_config(...)`
- **Risiko:** Påvirker alle PG-roller. Hvis intern PG-funktionalitet afhænger af set_config (fx via PL/pgSQL `SET LOCAL`), kan dette bryde basale operationer.
- **Bedre alternativ Option D (ny):** Skift write-policies til at bruge `current_setting()` på custom GUC der KUN sættes inde i SECURITY DEFINER-RPCs via `perform set_config(...)`. SECURITY DEFINER kører som funktion-owner (postgres) — eventuelle REVOKE på authenticated påvirker ikke definer. Sikkerheden afhænger af at klient ikke kan kalde set_config direkte via REST (PostgREST-isolation).

---

### 4.2 V2 — recon (NY i v2): live DB-inventory

**Mål:** Producér autoritative inventories for R7a + R7d.

**V2.1: regprocedure::text-inventory:**

```sql
-- Pg_proc-funktioner med ::regprocedure efterfulgt af ::text-brug
select n.nspname, p.proname, pg_get_function_arguments(p.oid) as args
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('core_identity','core_compliance','core_money','core_time')
  and p.prokind = 'f'
  and pg_get_functiondef(p.oid) ~* '::regprocedure.*::text|regprocedure.*::text|v_proc::text';

-- Cron-bodies med samme pattern
select jobid, jobname, command from cron.job
where command ~* '::regprocedure|regprocedure.*::text';
```

**Forventet output (allerede observeret 2026-05-15):**

- `core_compliance.anonymize_generic_apply`
- `core_compliance.break_glass_execute`
- `core_compliance.replay_anonymization`
- **`cron.job` jobid=10 `retention_cleanup_daily`** ← Codex Fund #1+#4

**V2.2: is_active=true-reader-inventory:**

```sql
-- Funktioner med is_active = true SQL pattern
select n.nspname, p.proname, pg_get_function_arguments(p.oid) as args,
       (regexp_matches(pg_get_functiondef(p.oid), '(where|and)\s+[\w\.]*is_active\s*=\s*true', 'g'))[1] as snippet
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('core_identity','core_compliance','core_money')
  and pg_get_functiondef(p.oid) ~* 'is_active\s*=\s*true';

-- Cron-bodies
select jobid, jobname from cron.job where command ~* 'is_active\s*=\s*true';
```

**Forventet output (allerede observeret 2026-05-15):**

- `core_compliance.anonymize_generic_apply` (already has status='active' check from P2)
- `core_compliance.break_glass_execute`
- `core_compliance.break_glass_request`
- `core_compliance.replay_anonymization`
- **`core_compliance.verify_anonymization_consistency`** ← Codex Fund #3
- **`core_identity.anonymize_employee_internal`** ← Codex Fund #3
- **`cron.job` jobid=10 `retention_cleanup_daily`** ← Codex Fund #3+#4

**V2-output bestemmer R7a + R7d's omfang.**

**Bemærk om fremtidig drift-detection:** D5 (fitness-check, se 4.10) fanger _is_active-reader_-regressioner, IKKE regprocedure::text-regressioner. Hvis senere migrations introducerer ny RPC med regprocedure::text-bug, fanger ingen fitness-check det aktuelt. **G033** sporer behovet for en varig fitness-check der scanner pg_proc + cron.job.command for regprocedure-callable-anti-patterns; bygges som separat check efter R-runde-2 er færdig.

---

### 4.3 R7a — regprocedure callable fix (v2 — alle steder fra V2.1)

**Berørte steder (fra V2.1):** 3 pg_proc-funktioner + 1 cron-body. Total 4.

**Callable-pattern (Codex Fund #2 — opgraderet):**

```sql
-- FØR (buggy):
v_proc := (<schema_text> || '.' || <name_text> || '(text, text)')::regprocedure;
v_callable := v_proc::text;  -- ← INCLUDES SIGNATURE: "schema.fn(text, text)"

-- EFTER (fixed med pg_proc-lookup, ikke manuel split):
v_proc := (<schema_text> || '.' || <name_text> || '(text, text)')::regprocedure;
-- Lookup callable identifier via pg_proc → robust mod schema-changes/renaming
select quote_ident(n.nspname) || '.' || quote_ident(p.proname)
  into v_callable
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where p.oid = v_proc;
-- Brug v_callable i format-strings, ikke v_proc::text
```

**Hvorfor pg_proc-lookup, ikke manuel `format('%I.%I', schema_text, name_text)`:** Hvis `internal_rpc`-feltet i mapping er lagret som `'core_compliance._anon_strategy_blank'` (allerede schema-qualified), så `format('%I.%I', schema, name)` ville quote-wrappere det forkert. pg_proc-lookup deler altid OID til nspname + proname korrekt, uanset hvordan det blev stored.

**Anvendt på 4 steder:**

1. `core_compliance.anonymize_generic_apply` (P1b)
2. `core_compliance.replay_anonymization` (Q-pakke)
3. `core_compliance.break_glass_execute` (Q-pakke + C006)
4. **`cron.job` `retention_cleanup_daily` (cron-body)** ← V2.1 finder denne (NY i v2)

**Cron-body fix-pattern (Fund #4):**

```sql
-- I R7a-migration efter pg_proc-funktioner er fixet:
select cron.unschedule('retention_cleanup_daily');
select cron.schedule(
  'retention_cleanup_daily',
  '30 2 * * *',
  $cron$
  do $do$
    /* ... opdateret body med pg_proc-lookup callable, ikke v_proc::text ... */
  $do$;
  $cron$
);
```

**Test (Fund #6):** `smoke/r7a_retention_cleanup_cron_e2e.sql` — kalder cron-bodyens core-logik (eller cron.run_job hvis tilgængelig) og verificerer dispatcher faktisk eksekverede.

**Defense-in-depth bevaret:**

1. regprocedure-cast: validerer eksistens + signatur (fejler tidligt)
2. pg_proc-lookup: robust callable-string fra autoritativ kilde
3. format med %I: SQL-injection-safe quoting

---

### 4.4 R7b — has_permission can_view fix

Uændret fra v1, med tilføjet test for `can_edit=true, can_view=false` (Fund #10).

### 4.5 R7c — verify_anonymization_consistency permission

**Bekræftet via V2.2 + 4.1-recon:**

- Funktion eksisterer i `core_compliance.verify_anonymization_consistency()`
- Args: tomme
- NO permission check (Codex Fund #7 + #15)
- Er kaldt fra cron.job jobid=3 `verify_anonymization_daily`

**Skitse:**

```sql
create or replace function core_compliance.verify_anonymization_consistency()
returns jsonb  -- (bevares; return-type verificeret via pg_get_function_result_type)
language plpgsql security definer set search_path = ''
as $func$
begin
  -- NY: permission-check tilføjet
  -- Cron-bodyen sætter source_type='cron'; tilladelse via cron-context bypass:
  if coalesce(current_setting('stork.source_type', true), '') = 'cron' then
    -- OK; cron eksekverer som postgres-owner
    null;
  elsif not core_identity.has_permission('audit', 'verify_anonymization', false) then
    raise exception 'verify_anonymization_consistency kraever permission audit.verify_anonymization'
      using errcode = '42501';
  end if;
  -- ... eksisterende body bevares ...
end;
$func$;
```

**Cron-bypass:** Funktionen kaldes via cron-body. cron-bodies sætter `stork.source_type='cron'`. has_permission tjekker bypasses i den kontekst (postgres-owner kører). Alternativet er at lade cron stoppe efter R7c. Bevar cron-funktionalitet → tilføj cron-bypass.

Plus Q-SEED: `('audit', 'verify_anonymization', true, false)`.

### 4.6 R7d — is_active/status alignment (v2 — udvidet med V2.2-inventory)

**Berørte readers (fra V2.2):**

1. `replay_anonymization` (allerede i v1)
2. `break_glass_request` (allerede i v1)
3. `break_glass_execute` (allerede i v1)
4. **`verify_anonymization_consistency`** ← NY i v2 (Codex Fund #3)
5. **`anonymize_employee_internal`** ← NY i v2 (Codex Fund #3)
6. `anonymize_generic_apply` — allerede opdateret i P2 (verificeret via V2.2)
7. **`cron.job` `retention_cleanup_daily`** ← NY i v2 (Codex Fund #3+#4)

**Del A — Backfill (uændret fra v1):**

```sql
update core_compliance.anonymization_mappings set is_active=false where status<>'active' and is_active=true;
update core_compliance.break_glass_operation_types set is_active=false where status<>'active' and is_active=true;
```

**Del B — Reader-fix (alle 5 funktioner + cron-body):**

For hver function fra V2.2: tilføj `and status = 'active'` i WHERE-clause hvor `is_active = true` står.

For cron-body `retention_cleanup_daily`: cron.unschedule + cron.schedule med opdateret body.

**Del C — unlock deaktivering (Beslutning 6 — Option C):**
Inkluderet automatisk via Del A (pay_period_unlock har status='approved' efter P3-backfill).

**Del D — Defense-in-depth (Codex Fund #5):**
Alle readers fra V2.2 OG fremtidige skal læse BÅDE `status='active' AND is_active=true`. D5 (fitness-check, live introspection) håndhæver dette fremadrettet.

### 4.7 R7f — db-rls-policies fitness udvidet

Uændret fra v1.

### 4.8 R7g — stripDollarQuoted differentier (v2 — cron.schedule-aware, Fund #13)

**Berørt fil:** `scripts/fitness.mjs`

**Skitse (udvidet med cron.schedule-handling):**

```javascript
function stripFunctionBodiesOnly(sql) {
  // Iterér over $...$ blocks. For hver:
  //   - find preceding context (last ~200 chars before block start)
  //   - hvis matcher CREATE (OR REPLACE) FUNCTION/PROCEDURE → strip (function body, runtime)
  //   - hvis matcher DO → keep (migration-time, men ikke runtime)
  //   - hvis matcher cron.schedule\s*\( → strip (cron-body, runtime; ikke migration-mutation)
  //   - else → keep
}

// Brug i begge migrations-discipline-checks (set-config + on-conflict)
```

**Konsekvens:** Cron-body-SQL strippes fra migration-fil-scan. cron-bodies SQL behandles som runtime — de er ikke migration-mutationer, men runtime-actions. Fitness fanger ikke false positives.

**For D3 specifikt:** INSERT INTO inde i cron-body bør stadig kunne fanges som "runtime-INSERT der bør have ON CONFLICT" — men det er IKKE migration-discipline-territorie. Skal håndteres af ny D6-check (deferred). For nu: cron-bodies eksempterer fra D3.

### 4.9 D4 — write-policy session-var consistency (v2 — polcmd-fix, Fund #14)

**Berørt fil:** `scripts/fitness.mjs`

**Skitse (opgraderet polcmd-håndtering):**

```sql
select c.relname, c.relnamespace::regnamespace as schema,
       array_agg(distinct p.polname) as policies,
       array_agg(distinct (regexp_match(
         coalesce(pg_get_expr(p.polqual, p.polrelid), '') || ' ' ||
         coalesce(pg_get_expr(p.polwithcheck, p.polrelid), ''),
         'stork\.allow_(\w+)_write'))[1]) FILTER (
           WHERE p.polcmd IN ('a', 'w', 'd', '*')  -- INSERT/UPDATE/DELETE/ALL
         ) AS write_vars
from pg_policy p
join pg_class c on c.oid = p.polrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = $1 and c.relname = $2  -- ← schema-afgrænsning før relname-join (Fund #14)
group by c.relname, c.relnamespace;
```

For hver aktive mapping: query target-tabellens write-policies (INSERT + UPDATE + DELETE + ALL — polcmd='\*'). Verificér expected_var matcher.

### 4.10 D5 — legacy is_active-readers (v2 — live introspection, Fund #7+#9)

**Berørt fil:** `scripts/fitness.mjs`

**Skift fra migration-grep til live DB introspection:**

```javascript
async function legacyIsActiveReaders() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    return { name: "legacy-is-active-readers", violations: [], skipped: "SUPABASE_ACCESS_TOKEN ikke sat" };
  }

  // Live DB-query via Management API:
  const query = `
    select n.nspname || '.' || p.proname as fn,
           pg_get_function_arguments(p.oid) as args
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('core_identity','core_compliance','core_money')
      and p.prokind = 'f'
      and pg_get_functiondef(p.oid) ~* 'is_active\\s*=\\s*true'
      and pg_get_functiondef(p.oid) !~* 'status\\s*=\\s*''active'''
    union all
    select 'cron.' || jobname, ''
    from cron.job
    where command ~* 'is_active\\s*=\\s*true'
      and command !~* 'status\\s*=\\s*''active''';
  `;
  // Hvis output ikke-tomt: violations
}
```

**Hvorfor live introspection (ikke migration-grep) — Codex Fund #7 har ret:**

1. Migration-historik viser CREATE OR REPLACE-trail; gamle versioner produces false positives
2. Function-body-stripping (stripFunctionBodiesOnly) gør netop det check ikke kan se — fjerner function bodies hvor readers lever
3. Final DB state er det check skal validere — migration-fil-scan er proxy, live er autoritativ

**D5 kører kun i CI med SUPABASE_ACCESS_TOKEN (samme pattern som db-rls-policies + D4).**

**Codex Fund #9 (rækkefølge): D5 bør køre FØR R7d som recon-step.**

- v2-fix: V2.2 (recon-step) erstatter dette behov. D5 (fitness-check) er fremtidig drift-detection efter R7d har fixet aktuel state.

---

## Sektion 5: Lock-mønster udskudt — G032

Uændret fra v1.

---

## Sektion 6: Risiko + kompensation (v2)

### 6.1 Risiko-matrix (v2)

| Migration | Værste-case                                                      | Sandsynlighed                                                                                                                         | Rollback                                                                       |
| --------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| V1        | PostgREST eksponerer set_config → stop hele R-runden             | Lav (PostgREST eksponerer kun public schema; pg_catalog er ikke der). DB-privilege findes men attack-surface er sandsynligvis lukket. | N/A (recon)                                                                    |
| V2        | Recon afslører flere affected sites end forventet (mere arbejde) | Mellem (vi har set 6 readers + 1 cron, kan være flere ved finere scan)                                                                | N/A (recon)                                                                    |
| R7a       | Cron-body-update fejler (cron.unschedule/schedule-race)          | Mellem                                                                                                                                | Revert cron.schedule til pre-R7a-body                                          |
| R7b       | can_view-fix bryder ukendt path                                  | Lav                                                                                                                                   | Revert; alle 17 seedede rows har can_view=true                                 |
| R7c       | verify_anonymization bryder cron-call (jobid=3)                  | Mellem                                                                                                                                | Cron-bypass-pattern i 4.5 håndterer; rollback hvis stadig issue                |
| R7d       | Mange paths broken samtidigt (5 funktioner + cron)               | Høj (det er designet — UI-aktivering kræves)                                                                                          | Revert hver reader-ændring uafhængigt; backfill kan UPDATE is_active=true igen |
| R7g       | cron.schedule-aware stripper fanger ikke fremtidige patterns     | Mellem                                                                                                                                | Grandfather som fil-baseret                                                    |

### 6.2 Hvis V1 PostgREST-test afslører eksponering

**Stop-protokol opgraderet (Fund #16):**

| Option                                 | Beskrivelse                                                                                           | Risiko                                                                                                                            |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| A: REVOKE EXECUTE                      | REVOKE FROM PUBLIC, anon, authenticated på `pg_catalog.set_config(...)`                               | Påvirker alle PG-roller. Kan bryde intern PL/pgSQL-funktionalitet hvis PG bruger set_config internt. **Ikke verificeret sikker.** |
| B: Signed claims                       | Skift fra session-var-policies til `auth.jwt()`-claims                                                | Fundament-redesign. Berører 15+ migrations.                                                                                       |
| C: SECURITY DEFINER-only writes        | Drop write-policies, alle writes via RPCs                                                             | Bryder generic apply pattern.                                                                                                     |
| **D (NY)**: PostgREST-schema-isolation | Bekræft `db-schemas` config ekskluderer pg_catalog. Tilføj fitness-check der scanner Supabase-config. | Minimal disruption. Forudsætter PostgREST-isolation er stabil.                                                                    |

**Anbefaling:** Option D hvis bekræftet via V1; Option A som fallback hvis ikke. Option B+C er fundament-redesign.

### 6.3 Generel kompensation

Uændret fra v1.

---

## Sektion 7: Konsistens-tjek (v2)

### 7.1-7.3 Vision/master-plan/Problem 1-4

Uændret fra v1 (R-runde-2 styrker konsistens, ikke svækker).

### 7.4 Nye tekniske problemer opdaget undervejs (CLAUDE.md disciplin)

**Tre eksplicit-flag'ede problemer fra v1:**

1. ✓ R7d Del A backfill konflikter potentielt med lifecycle-trigger — løst via Beslutning 6 (Option C).
2. ✓ R7a + R7d rækkefølge-kritisk — håndteres i Sektion 2.
3. ✓ D4 live-query vs file-parsing — løst via Beslutning 7 (live-query).

**Fem nye eksplicit-flag'ede problemer i v2:**

4. **Codex Fund #1+#4:** `retention_cleanup_daily` cron-body har samme regprocedure-bug som pg_proc-funktionerne. Live recon (V2.1) bekræftet. **Løst via R7a udvidet til at inkludere cron-body.**

5. **Codex Fund #3+#5:** v1's reader-inventory var ufuldstændig (3 vs faktisk 6 funktioner + 1 cron-body). Live recon (V2.2) afslørede mismatch. **Løst via R7d udvidet til alle readers fra V2.2.**

6. **Codex Fund #7+#9:** v1's D5 brugte migration-grep + stripFunctionBodiesOnly — netop det der skjuler hovedproblemet. **Løst via D5 omskrevet til live DB introspection (pg_get_functiondef + cron.job).**

7. **Codex Fund #8:** v1's V1 testede kun DB-privilege, ikke PostgREST-eksponering. **Løst via V1 udvidet med PostgREST-test som klar verifikations-step. Konklusion lokalt: privilege findes men attack-surface lukket via PostgREST-schema-isolation; live REST-test bekræfter.**

8. **Codex Fund #13:** v1's stripFunctionBodiesOnly differentierede CREATE FUNCTION vs DO, men ikke `cron.schedule($cron$...$cron$)`. cron-bodies behandles som migration-mutation → false positives i D3. **Løst via R7g udvidet til at også strippe cron.schedule-blocks.**

### 7.5 Codex' strukturelle observation — bekræftet og adopteret

**v1's gennemgående svaghed:** Håndskrevne inventories (3 readers, 3 regprocedure-funktioner) var ufuldstændige. Live recon afslørede dobbelt så mange affected sites.

**v2's strukturelle skift:** Live DB introspection (`pg_get_functiondef`, `cron.job.command`, `pg_proc`) er primær kilde for ALLE "alle steder hvor X bruges"-typer af inventory. Håndskrevne inventories bevares kun til kode-niveau konstanter (Q-SEED, AUDIT_EXEMPT_SNAPSHOT_TABLES, BOOTSTRAP_CONFIG_TABLES).

**Hvordan komplethed garanteres uden inventories:**

- Recon-steps (V1, V2.1, V2.2) er obligatoriske før migration-skriving
- Fitness-checks (D4, D5) køres post-migration mod live DB
- Tests (T1) er e2e (faktisk eksekverer, ikke bare cast-validation)

---

## Konklusion (v2)

Denne plan adresserer:

- **8 HØJ-fund** fra Codex genvalidering: 7 ACCEPT + 1 delvist (Fund #8 — PostgREST-test som verifikations-step; lokalt afgørelse afventer Mathias-test)
- **5 MELLEM-fund**: alle ACCEPT
- **6 scope-mangler**: alle ACCEPT (test-runner wiring, cron-test, live introspection i D5, V1 REST-test)

Plus de oprindelige 17 fund fra Codex v1-review.

**Strukturelt skift:** Live DB introspection er nu primær inventory-kilde. Håndskrevne lister bibeholdes kun til statiske kode-konstanter.

**Migrations-rækkefølge:** V1 → V2 (NY) → R7a → R7b → R7c → R7d → R7f → R7g → D4 → D5 → T1 → M1.

**Stop-risiko:** V1 kan stadig blokere hele runden hvis PostgREST-test afslører eksponering. v2-recon viser det er usandsynligt (PostgREST-schema-isolation) men ikke 100% bekræftet.

Klar til Codex-genvalidering af v2.
