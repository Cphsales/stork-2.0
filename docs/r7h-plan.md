# R7h plan v2 — R7b-test fix + 6 e2e-tests

**Formål:** R-runde-2 leverede 4 fixede bugs (R7a-R7d). Codex' implementations-verifikation bekræftede SQL-fixes virker korrekt, men leveret test-katalog dækker ikke regressionerne. R7h leverer reel regressions-coverage så vi kan stole på fixene ved merge.

**Status:** PLAN v2 — opdateret efter Codex' plan-validering. v1 havde 4 reelle problemer (samme placebo-mønster som R7b første runde). v2 retter alle 4 + tilføjer pre-fix bevisførelse pr. test.

**Forfattet:** 2026-05-15 efter Codex implementations-review + plan-validering.

---

## Strukturel disciplin-tilføjelse i v2

**Pre-fix bevisførelse-disciplin:** for hver regressions-test, dokumentér eksplicit:

1. Hvilken specifik kodelinje testen verificerer
2. Hvordan testen FEJLER pre-fix (med konkret evaluering, ikke abstract)
3. Hvordan testen PASSERER post-fix

Hvis pre-fix-bevisførelse ikke kan dokumenteres, **kan testen ikke verificere det den påstår.** Dette er den nye disciplin Codex har påført — og som ikke blev fulgt i T1 + v1.

---

## Sammenfatning af Codex' v2-fund

| #      | Fund                                                                                    | Min vurdering                                                                                                                                                                                                                                                |
| ------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Test 6 | anonymize_employee → anonymize_generic_apply har allerede status-check fra P2 → placebo | **ACCEPT** — verificeret. Pre-R7d og post-R7d ville begge fejle med samme P0002 fra anonymize_generic_apply. Testen verificerer ingenting om R7d.                                                                                                            |
| Test 1 | pay_period_unlock_via_break_glass kræver locked, ikke open                              | **ACCEPT** — pg_get_functiondef bekræfter `if v_period.status <> 'locked' then raise`                                                                                                                                                                        |
| Test 4 | retention_value er på data_field_definitions, ikke mapping                              | **ACCEPT** — verificeret i R7a cron-body. Mapping har `retention_event_column='termination_date'` (allerede sat for employee-mapping). data_field_definitions skal opdateres separat.                                                                        |
| Test 2 | Snapshot-shape mismatch mellem nested (P1b) og flat (\_anonymize_employee_apply)        | **ACCEPT** — verificeret: `_anonymize_employee_apply` læser `p_strategies->>'first_name'` (flat). Replay-flow med nested snapshot ville fejle. Vælger Strategi A (seed legacy shape) — se Test 2-sektion. Pre-eksisterende bug dokumenteres som ny **G042**. |

---

## Test 6 — kritisk fix

### Pre-recon af problemet

`anonymize_employee` (wrapper) → `anonymize_generic_apply` (P1b/P2-path). Sidstnævnte's mapping-query (R7a applied, P2-tilstand):

```sql
select * into v_mapping from core_compliance.anonymization_mappings
 where entity_type = p_entity_type and status = 'active' and is_active = true;
```

Allerede `status='active'`-check fra P2 — **ikke** R7d-introduceret. R7d ændrede `replay_anonymization`, `break_glass_request`, `break_glass_execute`, `verify_anonymization_consistency`, `anonymize_employee_internal` + cron — ikke `anonymize_generic_apply`.

Min v1-test gennem `anonymize_employee` ville fejle med P0002 pre-R7d (fra P2's check) OG post-R7d (samme check). Verificerer ingenting om R7d.

### Korrekt path: `anonymize_employee_internal` (direkte call)

Recon bekræftede: `core_identity.anonymize_employee_internal(p_employee_id, p_reason)` har R7d-fix anvendt:

```sql
select * into v_mapping from core_compliance.anonymization_mappings
 where entity_type = 'employee' and status = 'active' and is_active = true;
```

Pre-R7d: `where entity_type = 'employee' and is_active = true;` → ulovlig state (approved+is_active=true) ville match.
Post-R7d: ulovlig state matcher ikke → P0002 raised.

### Omskrevet Test 6

**Fil:** `supabase/tests/negative/r7d_mapping_legacy_status_active_required.sql`

**Setup:**

```sql
begin;
do $test$
declare
  v_mg_auth_id uuid;
  v_test_employee_id uuid;
begin
  -- Mock auth (anonymize_employee_internal er SECURITY DEFINER men
  -- _anonymize_employee_apply læser ikke auth.uid — så mock er ikke
  -- strengt nødvendig for denne test. Behold for konsistens.)
  select auth_user_id into v_mg_auth_id
    from core_identity.employees where email = 'mg@copenhagensales.dk';
  perform set_config('request.jwt.claim.sub', v_mg_auth_id::text, true);

  -- Konstruer ulovlig state: status='approved' + is_active=true.
  -- Det er den pre-R7d-tilstand som backfill ryddede op i.
  -- For at sætte den tilbage i ulovlig state: UPDATE direkte under bypass.
  perform set_config('stork.allow_anonymization_mappings_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'r7h test setup', true);

  update core_compliance.anonymization_mappings
     set is_active = true  -- status forbliver 'approved'
   where entity_type = 'employee';

  -- Setup: opret test-employee
  perform set_config('stork.allow_employees_write', 'true', true);
  insert into core_identity.employees (first_name, last_name, email, role_id)
  select 'r7h_test', 'r7h_test', 'r7h_test_' || gen_random_uuid() || '@test.invalid',
         (select role_id from core_identity.employees where email = 'mg@copenhagensales.dk')
  returning id into v_test_employee_id;

  -- Call anonymize_employee_internal direkte (R7d-affected path).
  -- Forvent P0002 ("ingen aktiveret anonymiserings-mapping for employee")
  declare v_caught text := null;
  begin
    perform core_identity.anonymize_employee_internal(v_test_employee_id, 'r7h test');
  exception when sqlstate 'P0002' then v_caught := 'ok';
  end;

  if v_caught is null then
    raise exception 'R7d Test 6 FAIL: anonymize_employee_internal skulle have raised P0002 (mapping status=approved + is_active=true)';
  end if;
end;
$test$;
rollback;
```

### Pre-fix bevisførelse (Codex-disciplin)

**Pre-R7d state for `anonymize_employee_internal`:**

```sql
where entity_type = 'employee' and is_active = true;
```

Mapping i setup-tilstand `{status='approved', is_active=true}` → match → `v_mapping.id IS NOT NULL` → fortsætter til `_anonymize_employee_apply`-call. Test fejler med "test forventede P0002 men anonymize lykkedes" eller andre fejl (måske NULL field_strategies).

**Post-R7d state:**

```sql
where entity_type = 'employee' and status = 'active' and is_active = true;
```

Mapping `{approved, true}` matcher ikke (`status<>active`) → `v_mapping.id IS NULL` → `raise exception 'ingen aktiveret ... mapping' using errcode = 'P0002'`. Test passerer.

**Konklusion:** Testen FEJLER pre-R7d (anonymize fortsætter eller fejler med andet errcode) og PASSERER post-R7d (specifikt P0002).

---

## Test 1 — setup-fejl

### Pre-recon af problemet

`pay_period_unlock_via_break_glass`:

```sql
if v_period.status <> 'locked' then
  raise exception 'pay_period % er ikke locked (status=%)', p_period_id, v_period.status
    using errcode = 'P0001';
end if;
```

Min v1-test brugte open period → unlock ville fejle med "ikke locked"-P0001 INDEN regprocedure-call → R7a-fix uverificeret.

### Korrekt setup

**Fil:** `supabase/tests/smoke/r7a_break_glass_execute_e2e.sql`

**Setup-ændring:** opret pay_period med `status='locked'`. UNLOCK er korrekt operation.

```sql
-- Setup: opret pay_period i locked state (R7d-pattern siger pay_period_unlock
-- skal aktiveres separat; her bypassser vi for test-scope)
perform set_config('stork.allow_pay_periods_write', 'true', true);
insert into core_money.pay_periods (start_date, end_date, status, locked_at, locked_by)
values (current_date + 100, current_date + 130, 'locked', now(), v_mg_auth_id)
returning id into v_test_period_id;

-- Aktivér pay_period_unlock op_type (lifecycle-bypass for test-scope)
perform set_config('stork.allow_break_glass_operation_types_write', 'true', true);
perform set_config('stork.allow_op_type_activate', 'true', true);
update core_compliance.break_glass_operation_types
   set status = 'active', is_active = true,
       activated_at = now(),
       activated_by = (select id from core_identity.employees where auth_user_id = v_mg_auth_id)
 where operation_type = 'pay_period_unlock';
```

**Two-actor flow (kræver mock-bytte):**

1. Mock mg → `break_glass_request('pay_period_unlock', v_test_period_id, '{}'::jsonb, 'test')` → returnerer request_id
2. Mock km (anden bruger; approver-flow kræver ≠ requester) → `break_glass_approve(request_id, 'approved')`
3. Mock mg → `break_glass_execute(request_id)`

**Verifikation:**

- `request.status = 'executed'`
- `pay_period.status = 'open'` (var locked, nu open)
- Hvis regprocedure-bug var tilbage: execute fejler med "syntax error at or near \"(\"" i format-call

### Pre-fix bevisførelse

**Pre-R7a `break_glass_execute` kerne:**

```sql
v_proc := (v_operation.internal_rpc || '(uuid, text)')::regprocedure;
-- v_proc::text = "core_money.pay_period_unlock_via_break_glass(uuid, text)"
execute format('select %s($1, $2)', v_proc::text) using ...;
-- Genereret SQL: select core_money.pay_period_unlock_via_break_glass(uuid, text)($1, $2)
-- ↑ SYNTAX ERROR: "uuid, text" parses som type-arguments, ikke call-arguments
```

PG-fejl: `SQLSTATE 42601 (syntax_error)` eller `42883 (undefined_function)` — testen ville fange exception, ikke fortsætte til pay_period.status-verifikation.

**Post-R7a:**

```sql
select quote_ident(n.nspname) || '.' || quote_ident(p.proname) into v_callable from pg_proc...;
-- v_callable = "core_money"."pay_period_unlock_via_break_glass"
execute format('select %s($1, $2)', v_callable) using ...;
-- Genereret SQL: select "core_money"."pay_period_unlock_via_break_glass"($1, $2)
-- ↑ Valid SQL. Function eksekveres. pay_period.status → 'open'.
```

**Konklusion:** Testen FEJLER pre-R7a (syntax/undefined error) og PASSERER post-R7a (request.status='executed' + period.status='open').

---

## Test 2 — afklaring af snapshot-shape (Codex' to strategier)

### Pre-recon

`_anonymize_employee_apply(p_employee_id uuid, p_strategies jsonb, p_reason text)` læser strategies som **flat shape**:

```sql
v_new_first_name := core_compliance.apply_field_strategy(p_strategies->>'first_name', null);
v_new_last_name := core_compliance.apply_field_strategy(p_strategies->>'last_name', null);
v_new_email := core_compliance.apply_field_strategy(p_strategies->>'email', v_old_email);
```

`p_strategies->>'first_name'` returnerer tekst-værdi af key `first_name`. Hvis snapshot er **nested**:

```json
{ "first_name": { "strategy": "blank", "strategy_id": "..." } }
```

så returnerer `->>'first_name'` JSON-string `'{"strategy":"blank","strategy_id":"..."}'` — ikke `'blank'`. `apply_field_strategy('{"strategy":...}', null)` fejler eller returnerer null.

`anonymize_generic_apply` (P1b) gemmer i `anonymization_state.field_mapping_snapshot` med **nested shape**:

```sql
v_field_snapshot := v_field_snapshot || jsonb_build_object(
  v_pii_col.column_name, jsonb_build_object('strategy', v_strategy_name, 'strategy_id', v_strategy.id));
```

Replay-flow:

1. `replay_anonymization` itererer `anonymization_state` rows
2. Kalder `internal_rpc_apply` (= `_anonymize_employee_apply`) med `v_state.field_mapping_snapshot`
3. \_apply læser flat-shape, men snapshot er nested → strategy-name extraction fejler

**Konklusion:** Pre-eksisterende bug fra P1b/P1c-tiden, ikke R7a-introduceret.

### Strategi-valg: A (seed legacy shape)

R7h's formål er at verificere R-runde-2-fixes. Strategi A isolerer R7a-regprocedure-fix ved at INSERTe legacy-flat-shape direkte i `anonymization_state`. Strategi B blander R7a-test med pre-eksisterende replay-shape-bug.

**Valgt: Strategi A.** Replay-shape-mismatch dokumenteres som ny **G042**.

### Omskrevet Test 2

**Fil:** `supabase/tests/smoke/r7a_replay_anonymization_e2e.sql`

```sql
begin;
do $test$
declare
  v_mg_auth_id uuid;
  v_test_emp_id uuid;
  v_result jsonb;
begin
  -- Mock auth
  select auth_user_id into v_mg_auth_id
    from core_identity.employees where email = 'mg@copenhagensales.dk';
  perform set_config('request.jwt.claim.sub', v_mg_auth_id::text, true);

  -- Aktivér strategier + mapping for at runtime virker
  perform set_config('stork.allow_strategy_write', 'true', true);
  perform set_config('stork.allow_strategy_activate', 'true', true);
  perform set_config('stork.allow_anonymization_mappings_write', 'true', true);
  perform set_config('stork.allow_mapping_activate', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'r7h replay test setup', true);

  update core_compliance.anonymization_strategies
     set status = 'active', activated_at = now(),
         activated_by = (select id from core_identity.employees where auth_user_id = v_mg_auth_id)
   where strategy_name in ('blank', 'hash_email');
  update core_compliance.anonymization_mappings
     set status = 'active', is_active = true, activated_at = now(),
         activated_by = (select id from core_identity.employees where auth_user_id = v_mg_auth_id)
   where entity_type = 'employee';

  -- Opret test-employee (med PII der kan anonymiseres)
  perform set_config('stork.allow_employees_write', 'true', true);
  insert into core_identity.employees (first_name, last_name, email, role_id, anonymized_at)
  select 'replay_test', 'replay_test', 'replay_' || gen_random_uuid() || '@test.invalid',
         (select role_id from core_identity.employees where email = 'mg@copenhagensales.dk'),
         null  -- NOT anonymized — replay vil sætte den
  returning id into v_test_emp_id;

  -- Strategi A: seed anonymization_state direkte med LEGACY FLAT-shape
  -- der matcher hvad _anonymize_employee_apply forventer.
  -- (Replay-shape-mismatch er G042-territorie, ikke R7h's scope.)
  --
  -- Bemærk: table_schema + table_name er NOT NULL i anonymization_state
  -- (verificeret 2026-05-15 via information_schema). Codex v3 fang.
  perform set_config('stork.allow_anonymization_state_write', 'true', true);
  insert into core_compliance.anonymization_state (
    entity_type, table_schema, table_name, entity_id, anonymization_reason,
    field_mapping_snapshot, jsonb_field_mapping_snapshot,
    strategy_version, created_by
  ) values (
    'employee', 'core_identity', 'employees', v_test_emp_id, 'r7h replay test',
    '{"first_name":"blank","last_name":"blank","email":"hash_email"}'::jsonb,
    '{"first_name":"blank","last_name":"blank","email":"hash_email"}'::jsonb,
    1, (select id from core_identity.employees where auth_user_id = v_mg_auth_id)
  );

  -- Call replay
  v_result := core_compliance.replay_anonymization('employee', false);

  -- Verificér replay eksekverede (regprocedure-fix virker)
  if (v_result->>'replayed')::integer < 1 then
    raise exception 'Test 2 FAIL: replayed=% (forventet >=1). Errors=%',
      v_result->>'replayed', v_result->>'error_details';
  end if;
  if (v_result->>'errors')::integer > 0 then
    raise exception 'Test 2 FAIL: replay rapporterede errors=%', v_result->>'error_details';
  end if;

  -- Verificér PII faktisk overskrevet
  if (select first_name from core_identity.employees where id = v_test_emp_id) <> '[anonymized]' then
    raise exception 'Test 2 FAIL: first_name ikke overskrevet';
  end if;
end;
$test$;
rollback;
```

### Pre-fix bevisførelse

**Pre-R7a `replay_anonymization`-kerne (replay path):**

```sql
v_proc := (v_mapping.internal_rpc_apply || '(uuid, jsonb, text)')::regprocedure;
-- v_proc::text = "core_identity._anonymize_employee_apply(uuid, jsonb, text)"
execute format('select %s($1, $2, $3)', v_proc::text) using ...;
-- Genereret SQL: select core_identity._anonymize_employee_apply(uuid, jsonb, text)($1, $2, $3)
-- ↑ SYNTAX_ERROR eller UNDEFINED_FUNCTION
```

Pre-R7a: error caught af replay's inner exception-handler → `v_errors += 1, v_error_details += '...'`. `v_replayed = 0`. Test assertion fejler: `replayed=0 < 1`.

**Post-R7a:** valid SQL → `_anonymize_employee_apply` eksekveres med LEGACY FLAT snapshot → PII overskrevet → `v_replayed = 1, v_errors = 0`. Test passerer.

**Konklusion:** Testen FEJLER pre-R7a (replayed=0, errors>0) og PASSERER post-R7a (replayed>=1, errors=0).

---

## Test 3 — anonymize_generic_apply via wrapper (uændret fra v1)

Pattern: mock auth + BEGIN/ROLLBACK. Setup: aktivér strategier+mapping. Call: anonymize_employee. Verify: PII overskrevet.

### Pre-fix bevisførelse

**Pre-R7a `anonymize_generic_apply`-kerne (SET-clause-bygning):**

```sql
v_set_clauses := v_set_clauses || (format('%I = %s(%I, $1)', col, v_proc::text, col));
-- v_proc::text = "core_compliance._anon_strategy_blank(text, text)"
-- Resulterende UPDATE: SET first_name = core_compliance._anon_strategy_blank(text, text)(first_name, $1), ...
-- ↑ SYNTAX_ERROR
```

EXECUTE af det dynamiske UPDATE fejler. anonymize_employee returnerer error. PII ikke overskrevet.

**Post-R7a:** valid SET-clause. PII overskrevet.

---

## Test 4 — retention cron e2e (setup-fejl rettet)

### Pre-recon

retention_cleanup_daily cron-body læser `retention_value` fra `data_field_definitions`:

```sql
select max(((retention_value->>'days_after')::integer))
  into v_max_days_after
  from core_compliance.data_field_definitions
 where table_schema = v_mapping.table_schema and table_name = v_mapping.table_name
   and retention_type = 'event_based';
```

Mapping har allerede `retention_event_column='termination_date'` (verificeret). Men ingen `event_based`-row i data_field_definitions for `core_identity.employees.termination_date` (currently `indirect`/`time_based` el. lignende).

### Korrekt setup

**Fil:** `supabase/tests/smoke/r7a_retention_cleanup_cron_e2e.sql`

```sql
begin;
do $test$
declare
  v_mg_auth_id uuid;
  v_test_emp_id uuid;
  v_cron_command text;
begin
  select auth_user_id into v_mg_auth_id
    from core_identity.employees where email = 'mg@copenhagensales.dk';
  perform set_config('request.jwt.claim.sub', v_mg_auth_id::text, true);

  -- Aktivér strategier + mapping
  -- (samme bypass-pattern som Test 2)
  perform set_config('stork.allow_strategy_write', 'true', true);
  perform set_config('stork.allow_strategy_activate', 'true', true);
  perform set_config('stork.allow_anonymization_mappings_write', 'true', true);
  perform set_config('stork.allow_mapping_activate', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'r7h retention cron test setup', true);

  update core_compliance.anonymization_strategies
     set status = 'active', activated_at = now(),
         activated_by = (select id from core_identity.employees where auth_user_id = v_mg_auth_id)
   where strategy_name in ('blank', 'hash_email');
  update core_compliance.anonymization_mappings
     set status = 'active', is_active = true, activated_at = now(),
         activated_by = (select id from core_identity.employees where auth_user_id = v_mg_auth_id)
   where entity_type = 'employee';

  -- Konfigurér event_based retention på data_field_definitions
  perform set_config('stork.allow_data_field_definitions_write', 'true', true);
  update core_compliance.data_field_definitions
     set retention_type = 'event_based', retention_value = '{"days_after": 1}'::jsonb
   where table_schema = 'core_identity' and table_name = 'employees'
     and column_name = 'termination_date';

  -- Opret test-employee med gammel termination_date (langt over 1 dag)
  perform set_config('stork.allow_employees_write', 'true', true);
  insert into core_identity.employees (first_name, last_name, email, role_id,
                                       termination_date, anonymized_at)
  select 'cron_test', 'cron_test', 'cron_' || gen_random_uuid() || '@test.invalid',
         (select role_id from core_identity.employees where email = 'mg@copenhagensales.dk'),
         current_date - 30,  -- 30 dage gammel
         null  -- NOT anonymized
  returning id into v_test_emp_id;

  -- G041-pattern: hent og eksekvér FAKTISK cron.job.command (ikke kopi)
  select command into v_cron_command
    from cron.job where jobname = 'retention_cleanup_daily';
  if v_cron_command is null then
    raise exception 'Test 4 SETUP FAIL: cron-job retention_cleanup_daily findes ikke';
  end if;

  execute v_cron_command;

  -- Verificér test-employee blev anonymiseret
  if (select anonymized_at from core_identity.employees where id = v_test_emp_id) is null then
    raise exception 'Test 4 FAIL: test-employee blev IKKE anonymiseret af cron-body';
  end if;
  if (select first_name from core_identity.employees where id = v_test_emp_id) <> '[anonymized]' then
    raise exception 'Test 4 FAIL: first_name ikke overskrevet';
  end if;
end;
$test$;
rollback;
```

### Pre-fix bevisførelse

**Pre-R7a cron-body kerne:**

```sql
execute format('select %s($1, $2)', v_proc::text) using v_candidate.id, ...;
-- v_proc::text = "core_identity.anonymize_employee_internal(uuid, text)"
-- ↑ SYNTAX_ERROR
```

cron-body har inner exception-handler der incrementer `v_errors` + appenderr til `v_error_details`. cron_heartbeat_record() kaldes med status='failure' eller 'partial_failure'. Employee ikke anonymiseret.

**Post-R7a:** valid SQL. employee anonymiseret. cron_heartbeat status='ok'.

**Konklusion:** Pre-R7a: test-employee's anonymized_at forbliver NULL → assertion fejler. Post-R7a: anonymized_at sat, first_name='[anonymized]' → passerer.

---

## Test 5 — konsolideret i matrix (Del A T3 erstatter)

Plan v1's `r7b_can_view_false_can_edit_false` er T3 i `r7b_can_view_can_edit_matrix.sql`. Ikke separat fil.

---

## Test 6 — KRITISK fix (omskrevet ovenfor)

Allerede dokumenteret i sektion "Test 6 — kritisk fix" øverst.

---

## Test 7 — op_type legacy status_active_required

### Pre-recon af problemet

`break_glass_request` (R7d-fix anvendt):

```sql
select * into v_operation from core_compliance.break_glass_operation_types
 where operation_type = p_operation_type
   and status = 'active' and is_active = true;
```

Pre-R7d: `where ... and is_active = true;`. Op_type i ulovlig state {approved, is_active=true} matcher → request INSERT'es uden fejl.

Post-R7d: kræver status='active'. Match fejler → P0002.

### Fil og setup

**Fil:** `supabase/tests/negative/r7d_op_type_legacy_status_active_required.sql`

```sql
begin;
do $test$
declare
  v_mg_auth_id uuid;
  v_caught text := null;
begin
  select auth_user_id into v_mg_auth_id
    from core_identity.employees where email = 'mg@copenhagensales.dk';
  perform set_config('request.jwt.claim.sub', v_mg_auth_id::text, true);

  -- Sæt pay_period_unlock op_type til ulovlig state (status='approved', is_active=true)
  perform set_config('stork.allow_break_glass_operation_types_write', 'true', true);
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'r7h test setup', true);

  update core_compliance.break_glass_operation_types
     set is_active = true  -- status forbliver 'approved'
   where operation_type = 'pay_period_unlock';

  -- Call break_glass_request — forvent P0002
  begin
    perform core_compliance.break_glass_request(
      'pay_period_unlock', gen_random_uuid(), '{}'::jsonb, 'r7h test');
  exception when sqlstate 'P0002' then v_caught := 'ok';
  end;

  if v_caught is null then
    raise exception 'Test 7 FAIL: break_glass_request skulle have raised P0002 (op_type status=approved + is_active=true)';
  end if;
end;
$test$;
rollback;
```

### Pre-fix bevisførelse

**Pre-R7d:** op_type matcher → request indsættes → no exception → test assertion fejler ("test forventede P0002 men request succeeded").

**Post-R7d:** op_type matcher ikke → P0002 raised → test fanger → passerer.

---

## Sammenfattende test-tabel v2

| Test       | Fil                                                      | Mock auth?        | Setup-kompleksitet                               | Verifikation                                     |
| ---------- | -------------------------------------------------------- | ----------------- | ------------------------------------------------ | ------------------------------------------------ |
| R7b matrix | `negative/r7b_can_view_can_edit_matrix.sql`              | Yes (mg)          | Lav                                              | 3 cases (T1+T2+T3) — boolean evaluation pr. case |
| Test 1     | `smoke/r7a_break_glass_execute_e2e.sql`                  | Yes (mg+km bytte) | Mellem (locked period + 2-actor)                 | execute lykkes; period→open                      |
| Test 2     | `smoke/r7a_replay_anonymization_e2e.sql`                 | Yes (mg)          | Mellem (legacy flat-shape seed)                  | replayed>=1; PII overskrevet                     |
| Test 3     | `smoke/r7a_anonymize_generic_apply_e2e.sql`              | Yes (mg)          | Mellem (strategier+mapping aktiveret)            | PII = `[anonymized]` + state-row INSERT'ed       |
| Test 4     | `smoke/r7a_retention_cleanup_cron_e2e.sql`               | Yes (mg)          | Høj (data_field_definitions + cron.command-exec) | employee.anonymized_at sat                       |
| Test 6     | `negative/r7d_mapping_legacy_status_active_required.sql` | Yes (mg)          | Lav (ulovlig state via UPDATE)                   | P0002 fra `anonymize_employee_internal`          |
| Test 7     | `negative/r7d_op_type_legacy_status_active_required.sql` | Yes (mg)          | Lav (ulovlig state via UPDATE)                   | P0002 fra `break_glass_request`                  |

**Total: 7 ændringer = 1 omskrevet + 6 nye.**

(Plan v1's Test 5 konsolideret som T3 i R7b matrix-fil per min anbefaling — Mathias bekræftede ikke eksplicit, men matrix-konsolideringen er mere robust testpraksis end split-i-to-filer. Hvis Mathias foretrækker separat fil: tilføj kopi.)

---

## Nye G-numre opdaget under plan-arbejde v2

### G042 — Replay-shape-mismatch mellem P1b nested og \_anonymize_employee_apply flat

- **Beskrivelse:** `anonymize_generic_apply` (P1b) gemmer `field_mapping_snapshot` i nested shape (`{"first_name":{"strategy":"blank","strategy_id":"..."}}`). `_anonymize_employee_apply` (legacy, kaldt af replay via mapping.internal_rpc_apply) læser flat shape (`p_strategies->>'first_name'` skal returnere `'blank'`). Hvis replay læser nested-state, returnerer `->>` JSON-string-værdi (ikke strategy-name) → strategy-lookup fejler.
- **Reel impact:** Replay af anonymization der er udført via post-P1c-flow (anonymize_employee → anonymize_generic_apply) vil fejle. Replay af pre-P1c-state virker.
- **Pre-cutover-state:** Ingen produktion-data; ingen aktuelle nested-state-rows. Bug er latent.
- **Skal løses:** Før første post-cutover replay-kørsel. Naturligt sammen med P1b-tidens refactor — kan ramme replay_anonymization for at læse field_mapping_snapshot med shape-detection (legacy vs nested) + dispatcher accordingly.
- **R7h-håndtering:** Test 2 bruger Strategi A (seed legacy shape) for at isolere R7a-regprocedure-fix. R7h tester IKKE replay-shape-bug — den dokumenteres her som separat issue.
- **Plan:** Separat migration der enten (a) opdaterer \_anonymize_employee_apply til at læse begge shapes, eller (b) opdaterer replay_anonymization til at konvertere nested→flat før call, eller (c) drop \_anonymize_employee_apply helt og refactorerer replay til at kalde anonymize_generic_apply direkte.

Tilføjes til `docs/teknisk-gaeld.md` ved næste teknisk-gæld-revision.

---

## Implementation-disciplin-noter (Codex v3-flag, ikke planændringer)

Disse er code-time-checks under implementation — flag som disciplin i selve tests.

**Test 1 (break_glass_execute):** Far-future pay_period (`current_date + 100`) kan ramme overlap-constraint hvis perioden allerede findes. Implementation skal enten:

- Bruge ON CONFLICT DO NOTHING + lookup for at finde eksisterende periode, eller
- Generere unik dato-range med fx. `current_date + (random() * 10000)::int` indenfor BEGIN/ROLLBACK

**Test 6 + 7 (R7d mapping/op_type setup):** UPDATE-statement skal eksplicit assert'e rammet row, så test ikke passerer pga "row mangler"-error i stedet for at fange R7d-invarianten. Pattern:

```sql
update core_compliance.anonymization_mappings
   set is_active = true
 where entity_type = 'employee';
get diagnostics v_rows = row_count;
if v_rows <> 1 then
  raise exception 'r7h test SETUP FAIL: forventet 1 row opdateret, fik %', v_rows;
end if;
```

Samme pattern for break_glass_operation_types UPDATE i Test 7.

---

## Implementations-rækkefølge v2

| Step | Fil                                                                           | Type                                   |
| ---- | ----------------------------------------------------------------------------- | -------------------------------------- |
| 1    | `supabase/tests/negative/r7b_can_view_can_edit_matrix.sql` (replace + rename) | Test-rewrite                           |
| 2    | `supabase/tests/smoke/r7a_break_glass_execute_e2e.sql`                        | Ny                                     |
| 3    | `supabase/tests/smoke/r7a_replay_anonymization_e2e.sql`                       | Ny (Strategi A)                        |
| 4    | `supabase/tests/smoke/r7a_anonymize_generic_apply_e2e.sql`                    | Ny                                     |
| 5    | `supabase/tests/smoke/r7a_retention_cleanup_cron_e2e.sql`                     | Ny (G041 pattern + retention data fix) |
| 6    | `supabase/tests/negative/r7d_mapping_legacy_status_active_required.sql`       | Ny (anonymize_employee_internal-path)  |
| 7    | `supabase/tests/negative/r7d_op_type_legacy_status_active_required.sql`       | Ny                                     |
| 8    | `docs/teknisk-gaeld.md`                                                       | Tilføj G042                            |

**Total: 7 test-filer + 1 dokumentations-opdatering = 8 ændringer.**

---

## Konklusion v2

Codex' v2-fund: 4/4 ACCEPT. Pre-fix bevisførelse-disciplin tilføjet for hver test (boolean-evaluering pr. case eller eksplicit pre/post-state-sammenligning).

Plan-leverance-afvigelser flagget FØR implementation:

- Plan v1's Test 5 konsolideret i matrix-fil — afventer eksplicit Mathias-bekræftelse (eller jeg laver separat duplicate-fil hvis foretrukket)
- G042 (replay-shape-mismatch) opdaget under plan-arbejde — dokumenteres som teknisk-gæld, IKKE blokerer R7h

R7h implementation venter på Mathias-godkendelse af v2-plan.
