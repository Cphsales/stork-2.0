# supabase/tests/

DB-level tests der køres som CI-blocker via `pnpm db:test`.

## Format

Hver test er en `.sql`-fil. Konvention:

```sql
-- Beskrivelse + master-plan-paragraf
begin;
do $test$
declare
  ...
begin
  -- 1) setup synthetic data
  -- 2) call rpc / verify
  -- 3) raise exception ved assertion-failure; raise notice ved success
end;
$test$;
rollback;
```

`BEGIN ... ROLLBACK` sikrer at side-effekter (employees, audit-rows, etc.) ikke persisterer i prod-DB. Hvis testen RAISE EXCEPTION'er → runner ser fejl → CI fejler.

Tests uden side-effekter (rene queries / regprocedure-cast) behøver ikke explicit BEGIN/ROLLBACK.

## Mapper

- `smoke/` — happy-path admin-vej-tests
- `negative/` — RLS/permission blokering (verificer at uberettigede caller fejler)
- `cron/` — service-role-paths (retention, replay, auto-lock-cron)
- `break_glass/` — request/approve/execute flow + regprocedure-allowlist
- `classification/` — retention NOT NULL + permanent + admin-floor
- `benchmark/` — performance SLA-tests (lock-pipeline)

## Runner

`scripts/run-db-tests.mjs` itererer alle `.sql`-filer i `supabase/tests/`, sender hver til Supabase Management API, fail-fast ved første test-fejl.

```bash
pnpm db:test                    # kør alle tests
pnpm db:test -- --dir benchmark # kun benchmark-tests
```

Kræver `SUPABASE_ACCESS_TOKEN` env-var (samme som fitness `db-rls-policies`-check). I CI: secret i workflow.

## Master-plan-reference

Hver test header skal inkludere master-plan-paragraf den verificerer. Fitness-grøn er nødvendigt men ikke tilstrækkeligt — master-plan-kravet skal være direkte testet.

## T9-fixture-regel (G053, 2026-05-19)

T9-smoke-tests (`smoke/t9_*.sql`) skal følge **hermetisk-fixture-kontrakten**:

- **Mutable fixtures skal være transaction-local throwaway data.** Brug `gen_random_uuid()` til IDs + uuid-suffix til alle navne/emails/change*types (`t9_smoke_role*<uuid>`, `t9*empa*<uuid>@test.invalid`, `TestDept\_<uuid>`, osv.)
- **Seed-users (mg@/km@) må KUN bruges read-only** som auth-caller for at nå authorized wrapper-paths (eksempel: `t9_public_wrapper_rpcs.sql`'s superadmin-lookup + `set_config('request.jwt.claim.sub', ...)`)
- **Aldrig** `DELETE`/`UPDATE`/`INSERT` på seed-employees, seed-placements eller seed-grants
- **Assertions filtrerer på fixture-IDs**, ikke global DB-state (ingen "count(\*)" uden WHERE-clause på fixture)
- **Ingen `information_schema.tables`-skip-guards** — T9 er deployed; manglende schema skal være rød test

Tre fitness-værn håndhæver kontrakten i CI:

- `db-test-no-disabled-sql` — `.sql.disabled` må ikke merges
- `db-test-no-t9-seed-user-fixtures` — `t9_*.sql` må ikke indeholde `mg@copenhagensales.dk` / `km@copenhagensales.dk` (allowlist via `-- allow-bootstrap-seed-user-test: <reason>` for read-only auth/bootstrap-verifikation)
- `db-test-no-t9-skip-guards` — `t9_*.sql` må ikke indeholde `information_schema.tables`-lookup eller `pre-migration state ... skipping`-mønstre

Plus: T9 mutable state-tabeller er tilføjet til `TX_WRAP_REQUIRED_FOR_TEST_INSERT`-listen i `scripts/fitness.mjs`.
