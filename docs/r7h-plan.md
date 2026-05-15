# R7h plan — R7b-test fix + 7 e2e-tests

**Formål:** R-runde-2 leverede 4 fixede bugs (R7a-R7d). Codex' implementations-verifikation bekræftede SQL-fixes virker korrekt, men leveret test-katalog dækker ikke regressionerne. R7h leverer reel regressions-coverage så vi kan stole på fixene ved merge.

**Status:** PLAN — ingen kode-ændringer før Mathias godkender.

**Forfattet:** 2026-05-15 efter Codex implementations-review af R7a-T1.

---

## Sammenfatning

| Problem                                                                                           | Codex-vurdering | Min vurdering                        |
| ------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------ |
| R7b-test er placebo (auth.uid()=NULL i postgres-context → has_permission returnerer false uanset) | Korrekt         | ACCEPT                               |
| 7 deferred e2e-tests er ikke teknisk nødvendigt deferred                                          | Korrekt         | ACCEPT                               |
| Strategi: mock auth.uid() via `request.jwt.claim.sub`                                             | Korrekt         | ACCEPT (live verificeret)            |
| Strategi: pg_get_functiondef/cron.job-introspection som invariant-tests                           | Korrekt         | ACCEPT (supplement, ikke erstatning) |

**Teknisk verifikation (2026-05-15):** Mock-pattern fungerer end-to-end. `auth.uid()` returnerer korrekt brugerens uuid efter `set_config('request.jwt.claim.sub', '<uuid>', true)`. `has_permission` evaluerer korrekt mod den mockede bruger.

**Disciplin-erkendelse:** T1's "deferred 7 tests"-beslutning var en plan-leverance-afvigelse jeg burde have flagget FØR T1 startede. Plan v2 Sektion 3.2 specificerede præcis disse 10 tests. R7h retter denne afvigelse.

---

## Del A — R7b-test fix

### Problem-analyse

Pre-R7b bug (Codex Fund #2):

```sql
where ... and (not p_can_edit or p.can_edit = true)
-- Hvis p_can_edit=false: "not false or ..." = true → row med can_view=false slipper.
```

R7b-fix:

```sql
where ... and p.can_view = true and (not p_can_edit or p.can_edit = true)
```

Nuværende test (`negative/r7b_can_view_false_can_edit_true.sql`):

```sql
-- INSERT permission med can_view=false, can_edit=true til mg's nye rolle
-- Call has_permission(_,_,true)
-- Forvent: false
```

**Hvorfor placebo:** testen kører via run-db-tests.mjs (Management API) som postgres-rolle. `auth.uid()` returnerer NULL (ingen JWT). `has_permission`-query'en:

```sql
where e.auth_user_id = auth.uid()  -- = NULL → no match
  and ...
```

Returnerer false uanset hvad. Testen ville passere PRE-R7b også. Den verificerer ingenting.

### Fix-strategi: mock auth.uid() via set_config

`auth.uid()`-implementation (verificeret via pg_get_functiondef 2026-05-15):

```sql
create function auth.uid() returns uuid as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid;
$$;
```

Mock-pattern: `set_config('request.jwt.claim.sub', '<auth_user_id>', true)` (is_local=true → transaction-local).

Live verificeret 2026-05-15: efter mock returnerer `auth.uid()` korrekt mg's auth_user_id, og `has_permission('system','manage',true)` returnerer true (mg er superadmin).

### Omskrevet test — 3 testcases

**Fil:** `supabase/tests/negative/r7b_can_view_can_edit_matrix.sql` (omdøbt fra `r7b_can_view_false_can_edit_true.sql` til at reflektere udvidet scope)

**Setup (samme for alle tre cases):**

```sql
begin;
do $test$
declare
  v_mg_auth_id uuid;
  v_test_role_id uuid;
begin
  -- 1. Hent mg's auth_user_id (mg er superadmin pre-test)
  select auth_user_id into v_mg_auth_id
    from core_identity.employees where email = 'mg@copenhagensales.dk';

  -- 2. Mock auth.uid() til mg
  perform set_config('request.jwt.claim.sub', v_mg_auth_id::text, true);

  -- 3. Opret test-rolle (uden permissions endnu)
  perform set_config('stork.allow_roles_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'R7b matrix-test setup', true);
  insert into core_identity.roles (name, description)
    values ('r7b_matrix_test', 'test') returning id into v_test_role_id;

  -- 4. Tildel test-rolle til mg
  perform set_config('stork.allow_employees_write', 'true', true);
  update core_identity.employees set role_id = v_test_role_id
    where auth_user_id = v_mg_auth_id;

  -- ... testcases nedenfor ...
end;
$test$;
rollback;
```

**Test-case T1 (positiv control):** can*view=true, can_edit=false → has_permission(*,_,false)=true, has_permission(_,\_,true)=false

Sikrer mock-mekanikken virker (positivt udfald skal kunne nås).

```sql
-- Inde i DO-block:
perform set_config('stork.allow_role_page_permissions_write', 'true', true);
insert into core_identity.role_page_permissions
  (role_id, page_key, tab_key, can_view, can_edit, scope)
values (v_test_role_id, 'r7b_t1', 't1', true, false, 'all');

if not core_identity.has_permission('r7b_t1', 't1', false) then
  raise exception 'T1 FAIL: can_view=true skulle give has_permission(_,_,false)=true';
end if;
if core_identity.has_permission('r7b_t1', 't1', true) then
  raise exception 'T1 FAIL: can_edit=false skulle give has_permission(_,_,true)=false';
end if;
```

**Test-case T2 (kernen — fanger R7b-regressionen):** can*view=false, can_edit=true → has_permission(*,\_,true)=false

```sql
insert into core_identity.role_page_permissions
  (role_id, page_key, tab_key, can_view, can_edit, scope)
values (v_test_role_id, 'r7b_t2', 't2', false, true, 'all');

if core_identity.has_permission('r7b_t2', 't2', true) then
  raise exception 'T2 FAIL (R7b regression): can_view=false skulle blokere has_permission uanset can_edit=true';
end if;
```

**Test-case T3 (kompletter):** can*view=false, can_edit=false → has_permission(*,\_,false)=false

```sql
insert into core_identity.role_page_permissions
  (role_id, page_key, tab_key, can_view, can_edit, scope)
values (v_test_role_id, 'r7b_t3', 't3', false, false, 'all');

if core_identity.has_permission('r7b_t3', 't3', false) then
  raise exception 'T3 FAIL: can_view=false skulle blokere has_permission(_,_,false)';
end if;
```

### Bekræftelse: ville fejle pre-R7b

**T1 pre-R7b:** can*view=true,can_edit=false. has_permission(*,\_,false) =
`(not false or ...) = true` → returnerer true. Match med forventet → T1 passerer pre-R7b. **Ikke regressions-test alene.**

**T2 pre-R7b:** can*view=false,can_edit=true. has_permission(*,\_,true) =
`(not true or can_edit=true) = (false or true) = true` → returnerer true.
Forventet: false. **T2 FEJLER pre-R7b.** Regressionen fanges.

**T3 pre-R7b:** can*view=false,can_edit=false. has_permission(*,\_,false) =
`(not false or ...) = true` → returnerer true. Forventet: false. **T3 FEJLER pre-R7b.** Regressionen fanges.

Post-R7b: alle 3 cases passerer.

**Konklusion:** T2 + T3 er reelle regressions-tests for R7b. T1 er positive control der sikrer test-mekanikken virker.

---

## Del B — 7 deferred e2e-tests

### Generel strategi

Alle 7 tests bruger samme setup-pattern:

```sql
begin;
do $test$
declare
  v_mg_auth_id uuid;
  v_km_auth_id uuid;  -- til two-actor flows
begin
  -- 1. Mock auth.uid() til relevant bruger
  select auth_user_id into v_mg_auth_id
    from core_identity.employees where email = 'mg@copenhagensales.dk';
  perform set_config('request.jwt.claim.sub', v_mg_auth_id::text, true);

  -- 2. Bypass lifecycle-trigger for at aktivere strategier/mappings/op_types
  --    via session-var-pattern (samme som activate-RPC bruger)
  perform set_config('stork.allow_strategy_write', 'true', true);
  perform set_config('stork.allow_strategy_activate', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'r7h e2e setup', true);

  update core_compliance.anonymization_strategies
    set status = 'active' where strategy_name in ('blank','hash','hash_email');

  -- ... test-specific setup ...
  -- ... call RPC ...
  -- ... verify side-effect ...
end;
$test$;
rollback;
```

**BEGIN/ROLLBACK** sikrer at side-effekter (status-ændringer, INSERT'er, anonymization) ikke persisterer i prod-DB. `set_config(..., true)` er transaction-local — det rulles automatisk tilbage.

**Aktivering via session-var-bypass i transaktion** er ikke et princip-brud:

1. Lifecycle-trigger evaluerer `current_setting('stork.allow_strategy_activate', true) = 'true'` — sand i test-context
2. Resultat persisterer ikke (ROLLBACK)
3. Pattern er identisk med activate-RPC's signaling

### Test 1: `smoke/r7a_break_glass_execute_e2e.sql`

**Mål:** Verificér break_glass_execute kalder internal_rpc korrekt post-R7a regprocedure-fix.

**Pattern:** mock auth.uid + BEGIN/ROLLBACK

**Setup:**

1. Mock mg → has_permission(break_glass,request,true)=true
2. Aktivér pay_period_unlock op_type via session-var bypass (status='active', is_active=true)
3. Aktivér en eksisterende open pay_period

**Flow:**

1. `break_glass_request('pay_period_unlock', <period_id>, '{}'::jsonb, 'test')`
2. Mock auth.uid → km (approver)
3. `break_glass_approve(<request_id>, 'approve test')`
4. Mock auth.uid → mg
5. `break_glass_execute(<request_id>)`

**Verifikation:**

- request.status = 'executed'
- pay_period.status ændret (unlock virker)
- Hvis regprocedure-bug var tilbage: execute fejler med syntax error inde i format-call
- Hvis pg_proc-lookup ikke virker: format-error

**Fanger:** R7a regprocedure-fix på cron-body specifikt — break_glass_execute er pattern-spejling.

### Test 2: `smoke/r7a_replay_anonymization_e2e.sql`

**Mål:** Verificér replay_anonymization kalder internal_rpc_apply korrekt.

**Pattern:** mock auth.uid + BEGIN/ROLLBACK

**Setup:**

1. Mock mg
2. Aktivér 3 strategier + employee-mapping via session-var bypass
3. Opret test-employee + anonymize den (skaber anonymization_state-row)
4. UPDATE master-row's anonymized_at til NULL (simulerer rollback-fra-backup-scenario)

**Flow:**

1. `replay_anonymization('employee', false)` — dry_run=false

**Verifikation:**

- result.replayed >= 1
- master-row's anonymized_at sat igen
- PII-felter overskrevet ifølge strategy

**Fanger:** R7a regprocedure-fix på replay_anonymization. Pre-R7a EXECUTE-fejl.

### Test 3: `smoke/r7a_anonymize_generic_apply_e2e.sql`

**Mål:** Verificér anonymize_generic_apply via wrapper anonymize_employee.

**Pattern:** mock auth.uid + BEGIN/ROLLBACK

**Setup:**

1. Mock mg (kræver has_permission(employees,anonymize,true))
2. Aktivér 3 strategier + employee-mapping
3. Opret test-employee (auth_user_id=NULL OK — vi anonymiserer den)

**Flow:**

1. `anonymize_employee(<test_employee_id>, 'r7h test')`

**Verifikation:**

- first_name = '[anonymized]'
- last_name = '[anonymized]'
- email matches `^[a-f0-9]{16}@anonymized\.invalid$`
- anonymized_at NOT NULL
- anonymization_state-row INSERT'ed med snapshot

**Fanger:** R7a regprocedure-fix på anonymize_generic_apply. Pre-R7a fejlede med invalid SQL.

### Test 4: `smoke/r7a_retention_cleanup_cron_e2e.sql` (G041)

**Mål:** Verificér retention_cleanup_daily cron-body eksekverer korrekt — IKKE kopieret helper-logic, men selve cron.command.

**Pattern:** pg_get_functiondef-baseret invariant + execution (G041)

**Setup:**

1. Mock mg
2. Aktivér employee-mapping med retention_event_column='termination_date' og retention_value={"days_after": 1}
3. UPDATE et test-employee til termination_date = current_date - 30

**Flow:**

```sql
declare v_command text;
begin
  -- Hent FAKTISK cron-body fra cron.job (G041-pattern)
  select command into v_command from cron.job where jobname = 'retention_cleanup_daily';
  if v_command is null then
    raise exception 'cron-job retention_cleanup_daily findes ikke';
  end if;
  -- Eksekvér selve cron-bodyen, ikke en kopi
  execute v_command;
end;
```

**Verifikation:**

- Test-employee blev anonymiseret (PII overskrevet)
- cron_heartbeats viser ok-execution
- Hvis pre-R7a regprocedure-bug var tilbage: cron-body fejler

**Fanger:** R7a cron-body-fix + G041 (kopieret helper-logic-test ville miss cron-specifikke ændringer).

### Test 5: `negative/r7b_can_view_false_can_edit_false.sql`

**Mål:** Trivielt extension af Del A T3 — separat fil for klarhed.

**Pattern:** identisk med Del A T3.

Faktisk redundant med Del A's omskrevne test der allerede har T3-case. **Anbefaling: drop denne separate fil; T3 i `r7b_can_view_can_edit_matrix.sql` dækker.**

**Plan-afvigelse-flag:** plan v2 Sektion 3.2 listede `r7b_can_view_false_can_edit_false` som separat fil. Min anbefaling: konsoliderer med matrix-fil for at undgå duplicate setup-kode. Beder Mathias bekræfte.

### Test 6: `negative/r7d_mapping_legacy_status_active_required.sql`

**Mål:** Verificér at runtime-paths fejler hvis mapping er i ulovlig state (`status='approved'` + `is_active=true`).

**Pattern:** mock auth.uid + BEGIN/ROLLBACK + session-var bypass for at konstruere ulovlig state

**Setup:**

1. Mock mg
2. Opret test-mapping i ulovlig state direkte via session-var bypass:
   ```sql
   -- Lifecycle-trigger tillader IKKE direkte UPDATE til status=approved fra
   -- non-test context. Men: UPDATE der ikke ændrer status er fint.
   -- Vi konstruerer ulovlig state ved at:
   -- a) INSERT ny mapping med status='draft' (lovligt)
   -- b) UPDATE status='approved' (via approve-RPC eller direkte bypass via
   --    session-var allow_strategy_activate=false-pattern — kun status='active'
   --    blokeres direkte)
   -- c) UPDATE is_active=true (uden tilsvarende status-flytning)
   --
   -- Pre-R7d: kun is_active=true blev krævet af readers. Disse var "active"
   -- runtime selv om status<>'active'.
   ```

**Flow:**

1. Anonymize en test-employee via `anonymize_employee`

**Verifikation:**

- `anonymize_generic_apply` raises P0002 ("ingen aktiveret anonymization_mapping")
- Hvis pre-R7d state var tilbage: anonymize ville lykkes (uanset status='approved')

**Fanger:** R7d Del B reader-fix (status='active'-check krævet).

**Teknisk nuance:** vi har kun ÉN mapping (employee). Hvis vi UPDATE'r den til ulovlig state og kalder anonymize, og det fejler — OK. Men hvis vi VIRKELIG aktiverer den (status='active'), så virker anonymize. ROLLBACK rydder begge tilstande.

### Test 7: `negative/r7d_op_type_legacy_status_active_required.sql`

**Mål:** Samme pattern for break_glass_operation_types.

**Setup:**

1. Mock mg
2. Bypass lifecycle: opret test-op_type med status='approved', is_active=true (ulovlig kombination post-R7d)

**Flow:**

1. `break_glass_request('test_op_type', <target_id>, '{}'::jsonb, 'test')`

**Verifikation:**

- P0002 raises ("ukendt eller ikke-aktiveret operation_type")
- Pre-R7d: ville passere fordi is_active=true alene var nok

**Fanger:** R7d Del B reader-fix (status='active' AND is_active=true invariant).

---

## Del C — implementations-rækkefølge + verifikation

### Steps

| Step | Fil                                                                           | Type          |
| ---- | ----------------------------------------------------------------------------- | ------------- |
| 1    | `supabase/tests/negative/r7b_can_view_can_edit_matrix.sql` (replace + rename) | Test-fix      |
| 2    | `supabase/tests/smoke/r7a_break_glass_execute_e2e.sql`                        | Ny e2e        |
| 3    | `supabase/tests/smoke/r7a_replay_anonymization_e2e.sql`                       | Ny e2e        |
| 4    | `supabase/tests/smoke/r7a_anonymize_generic_apply_e2e.sql`                    | Ny e2e        |
| 5    | `supabase/tests/smoke/r7a_retention_cleanup_cron_e2e.sql`                     | Ny e2e (G041) |
| 6    | `supabase/tests/negative/r7d_mapping_legacy_status_active_required.sql`       | Ny negative   |
| 7    | `supabase/tests/negative/r7d_op_type_legacy_status_active_required.sql`       | Ny negative   |

(Test 5 fra plan v2 konsolideret med Test 1 — afventer Mathias' bekræftelse.)

**Total: 1 rewrite + 6 nye filer = 7 ændringer.**

### Verifikation pr. test

Hver test verificeres i to faser:

**Fase 1 — eksisterende state passerer:** Kør hver test mod current DB (post-R-runde-2). Forventet: alle PASSER (regressionerne er fixet).

**Fase 2 — regressions-evidens:** For hver test der hævder at fange en bug, dokumentér i test-kommentar hvilken specifik linje i pre-R7a/R7b/R7d-state ville få testen til at fejle. Det er praksissen i "Bekræftelse: ville fejle pre-R7b"-sektionen i Del A.

### CI-impact

Tests committes til `supabase/tests/{smoke,negative}/`. Runner `scripts/run-db-tests.mjs` plukker dem automatisk op. CI-step `pnpm db:test` kører dem alle.

Aktiveres kun når `SUPABASE_ACCESS_TOKEN` er sat (samme pattern som db-rls-policies).

---

## Del D — potentielle G-numre opdaget under plan-arbejde

Ingen nye G-numre. Mock-pattern bekræftet 2026-05-15 via live test. Strategi-bypass via session-var er identisk med activate-RPC-pattern (godkendt).

---

## Konklusion

R7h leverer:

- **1 omskrevet test** (R7b matrix med 3 cases — T2 + T3 er reelle regressions-tests)
- **6 nye e2e-tests** (4 r7a-specifikke + 2 r7d-specifikke)

Total: 7 ændringer i `supabase/tests/`. Ingen migrations.

**Estimat:** ~2-3 timer implementation efter Mathias-godkendelse.

**Disciplin-erkendelse:** dette skulle have været del af T1. R7h retter min plan-leverance-afvigelse fra T1.

**Klar til Codex-validering af R7h-plan** når Mathias har godkendt den strukturelt.
