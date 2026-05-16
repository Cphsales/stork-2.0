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
