# Supabase — Stork 2.0

Backend lever på et selvstændigt Supabase B-projekt
(`imtxvrymaqbgcvsarlib`, Region: West EU (Ireland)).
PostgreSQL 17. Tom database — migrations ankommer i lag B/C.

## Toolchain

Supabase CLI er pinned som workspace devDep i root `package.json`
og kører via `pnpm exec supabase ...` på enhver dev-maskine.

```bash
pnpm install                          # installerer CLI binær
pnpm exec supabase --version          # ≥ 2.98.2
```

Build-script-allowlist håndteres af `pnpm.onlyBuiltDependencies` i
root `package.json` (pnpm 10 kører ikke postinstall by default).

## Konfiguration

`supabase/config.toml` indeholder hele standard-skemaet
genereret af `supabase init`, med `project_id` overskrevet til
`imtxvrymaqbgcvsarlib`. Felter med deres default-værdier er
explicit committet så ændringer fremover er synlige i diff.

## Link til remote

`project_id` i `config.toml` ER linket. Når CLI-kommandoer
køres i denne mappe, kobler de til remote-projektet automatisk.

For at autorisere CLI mod remote (kræves for migrations + push):

```bash
# Engangsskridt pr. dev-maskine:
pnpm exec supabase login              # åbner browser → access token
pnpm exec supabase link --project-ref imtxvrymaqbgcvsarlib
pnpm exec supabase status             # verificerer linket
```

`supabase/.temp/` (gitignored) holder access-token-cachen.

## Almindelige kommandoer

| Kommando                                           | Effekt                                                                                                         |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `pnpm exec supabase start`                         | Starter lokal Supabase-stak (Postgres, GoTrue, Storage, Realtime, Studio) på portene defineret i `config.toml` |
| `pnpm exec supabase stop`                          | Stopper lokal stak                                                                                             |
| `pnpm exec supabase status`                        | Viser status + URLs for lokal stak + link til remote                                                           |
| `pnpm exec supabase db reset`                      | Reset lokal DB, anvender migrations + seed.sql                                                                 |
| `pnpm exec supabase migration new <name>`          | Opretter ny migration-fil i `supabase/migrations/`                                                             |
| `pnpm exec supabase db push`                       | Push migrations til remote                                                                                     |
| `pnpm exec supabase db pull`                       | Pull schema-ændringer fra remote til ny migration                                                              |
| `pnpm exec supabase functions deploy <name>`       | Deploy edge function                                                                                           |
| `pnpm exec supabase gen types typescript --linked` | Generér TS-typer fra remote schema                                                                             |

## RLS-template (lag C1)

Hver feature-tabel skal have RLS aktiveret OG forced. Default deny —
ingen rolle har implicit adgang, heller ikke owner eller service_role.

**Standard-mønster for ny tabel:**

```sql
CREATE TABLE public.example (...);
ALTER TABLE public.example ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.example FORCE ROW LEVEL SECURITY;
-- Tilføj policies efter behov for authenticated.
```

**Opt-out fra FORCE** (kun hvis tabellen designet til at have
service-role-skrivere som integration-engine eller webhook-forwarder
der ikke kan gå gennem SECURITY DEFINER):

```sql
-- skip-force-rls: <eksplicit begrundelse>
ALTER TABLE public.example ENABLE ROW LEVEL SECURITY;
```

**Privilegerede operationer** (cron-jobs, webhook-ingest, snapshot-
trigger, m.fl.) går gennem `SECURITY DEFINER`-funktioner med
`SET search_path = ''` + eksplicitte schema-qualified referencer.
Ikke via direkte service-role-API-kald.

### Helper-funktioner

| Funktion                       | Returner          | Status                                           |
| ------------------------------ | ----------------- | ------------------------------------------------ |
| `public.current_employee_id()` | `uuid` (null)     | Stub i C1. Lag D mapper `auth.uid()` → employees |
| `public.is_admin()`            | `boolean` (false) | Stub i C1. Lag D læser `role_page_permissions`   |

Stubs returnerer safe defaults så feature-tabeller i lag D kan reference
dem i policies uden circular dependency.

## Audit-template (lag C2)

Alle feature-tabeller får audit via `public.stork_audit()`-trigger.
Audit-log er append-only, immutable, og kun læselig via SECURITY
DEFINER RPC med permission-check.

**Attach trigger til ny tabel:**

```sql
CREATE TRIGGER example_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.example
  FOR EACH ROW EXECUTE FUNCTION public.stork_audit();
```

**Session-vars callere kan sætte for at berige audit-rækker:**

```sql
SET LOCAL stork.source_type = 'cron';        -- override auto-detection
SET LOCAL stork.change_reason = 'GDPR-anonymisering, request #42';
SET LOCAL stork.schema_version = '20260511152603';
-- ...mutationen her
```

`source_type` auto-detekteres ellers via:
`pg_trigger_depth()` → `current_user` → `auth.uid()` → fallback.
6 mulige værdier: `manual / cron / webhook / trigger_cascade /
service_role / unknown`.

**Læs audit:**

```sql
SELECT * FROM public.audit_log_read(
  p_table_name => 'pay_periods',
  p_record_id => '<id>',
  p_limit => 50
);
```

Kalder skal være admin (per `public.is_admin()`-helper). C1-stub
returnerer false → ingen kan læse indtil lag D låser op.

**PII-filter-hook:** `public.audit_filter_values(schema, table, jsonb)`.
C2-stub returnerer values uændret. Lag D omdefinerer til at hashe
kolonner med `pii_level=direct` inden de gemmes.

**Audit-failure-policy:** hvis `stork_audit()` RAISE'r, bobler det op
til main transaction → main rulles tilbage. Compliance kræver vores
adgangslog, så "audit failure = transaction failure" er bevidst.

## Cron-skabelon (lag C3)

**Princip:** `pg_cron` til DB-interne jobs, scheduled edge functions
til eksterne. Hybrid mønster — `pg_cron` tickrer + edge function
gør arbejdet — bruges når DB-jobs skal kalde eksterne API'er.

**Extensions aktiveret:** `pg_cron`, `btree_gist` (til C4),
`pg_net` (til hybrid pg_cron → edge function).

### Heartbeat-pattern

Hver cron-job rapporterer status til `public.cron_heartbeats`
via `public.cron_heartbeat_record()`. Failure-rows auditeres
automatisk via WHEN-trigger (kun failures, ikke successes — ellers
ville audit_log eksplodere).

### Eksempel: pg_cron job med heartbeat

```sql
SELECT cron.schedule(
  'cleanup_expired_tokens',
  '0 * * * *',  -- hver time
  $$
  DO $do$
  DECLARE
    v_started timestamptz := clock_timestamp();
    v_error text;
  BEGIN
    -- Job-logik her
    DELETE FROM public.example_tokens WHERE expires_at < now();

    PERFORM public.cron_heartbeat_record(
      'cleanup_expired_tokens',
      '0 * * * *',
      'ok',
      NULL,
      (EXTRACT(EPOCH FROM (clock_timestamp() - v_started)) * 1000)::integer
    );
  EXCEPTION WHEN OTHERS THEN
    v_error := SQLERRM;
    PERFORM public.cron_heartbeat_record(
      'cleanup_expired_tokens',
      '0 * * * *',
      'failure',
      v_error,
      (EXTRACT(EPOCH FROM (clock_timestamp() - v_started)) * 1000)::integer
    );
    RAISE;  -- så pg_cron logger failure
  END;
  $do$;
  $$
);
```

### Eksempel: edge function med heartbeat (hybrid pattern)

```typescript
// supabase/functions/sync-something/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (_req) => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const start = Date.now();
  try {
    // Job-logik via SECURITY DEFINER RPCs — IKKE direkte table-INSERTs
    // (service_role respekterer FORCE RLS på feature-tabeller).
    await supabase.rpc("cron_heartbeat_record", {
      p_job_name: "sync-something",
      p_schedule: "edge-function-scheduled",
      p_status: "ok",
      p_duration_ms: Date.now() - start,
    });
    return new Response("ok");
  } catch (err) {
    await supabase.rpc("cron_heartbeat_record", {
      p_job_name: "sync-something",
      p_schedule: "edge-function-scheduled",
      p_status: "failure",
      p_error: String(err),
      p_duration_ms: Date.now() - start,
    });
    return new Response(String(err), { status: 500 });
  }
});
```

Edge function deploy: `pnpm exec supabase functions deploy sync-something`.
Schedule edge function: brug Supabase Studio → Functions → Schedule,
eller `pg_cron + pg_net.http_post()` for at trigge fra DB.

### Notifikation ved failure

**TODO:** email/Slack-notifikation når `cron_heartbeats.last_status='failure'`
eller når en job ikke har kørt i for lang tid. Separat beslutning
når email-provider er valgt. Indtil da: failures synlige i
`audit_log` (filter source_type='cron') og via
`public.cron_heartbeats_read()` RPC.

## Period-lock-template (lag C4)

Generic mønster for "tal låses, data må ikke" der bruges på tværs af
domæner (løn implementeret nu; KPI senere).

**Fire dele pr. domæne:**

1. `{domain}_periods` — periode-tabel med open/locked livscyklus
2. `{domain}_snapshots` — immutable frosne tal ved lock
3. `{domain}_corrections` — immutable kompenserings-modposter
4. Cron-job + `on_period_lock()`-trigger der materialiserer snapshots

Lag C4 instans: `pay_periods` + `commission_snapshots` + `salary_corrections`

- `ensure_pay_periods`-cron. Lag D får `kpi_snapshots`/`kpi_corrections`.
  Lag E udvider med faktisk materialisering i `on_period_lock()`.

### pay_periods — periode-livscyklus

- `status` flippes via UPDATE: open → locked (engangs)
- Exclusion-constraint på `daterange(start_date, end_date, '[]')` forhindrer overlap
- DELETE altid blokeret. Senere lag bygger `correct_pay_period_delete()` RPC ved behov
- Auto-genererer fremtidige perioder via daglig cron-job (`ensure_pay_periods`)

### Snapshots — immutable frosne tal

`commission_snapshots` INSERT-only via `on_period_lock()`-trigger ved
lock-transition. UNIQUE(period, sale, employee) understøtter
provision-split mellem flere medarbejdere.

### Corrections — append-only modposter

`salary_corrections` med 5 reasons: cancellation / cancellation_reversal /
kurv_correction / manual_error / other. Reason-baseret sign-CHECK:
cancellation → amount<0, cancellation_reversal → amount>0, øvrige fri.
`amount <> 0` håndhævet.

Rollback af correction sker via ny correction-række (cancellation_reversal).
Original røres aldrig. Audit-trail bevarer historikken.

### Cancellations — domæne-specifik begivenheds-tabel

`cancellations` (IKKE del af generic templaten) sporer kunde-fortrydelser.
Sales-rækken røres aldrig — annullering = ny begivenhed.

Kun `matched_to_correction_id` + `matched_at` kan UPDATE'es efter INSERT.
DELETE altid blokeret. matched_at sættes automatisk når matched_to_correction_id
går NULL → NOT NULL.

`amount > 0` håndhævet (positivt fradragsbeløb). Tilhørende
salary_correction får `amount = -cancellation.amount`.

### Session-var-konvention

Hver feature-tabel med FORCE RLS Variant B har eget skrivetilladelses-var:

| Tabel                | Session-var                              |
| -------------------- | ---------------------------------------- |
| pay_period_settings  | `stork.allow_pay_period_settings_write`  |
| pay_periods          | `stork.allow_pay_periods_write`          |
| commission_snapshots | `stork.allow_commission_snapshots_write` |
| salary_corrections   | `stork.allow_salary_corrections_write`   |
| cancellations        | `stork.allow_cancellations_write`        |

Skriv-RPCs sætter dem via `SET LOCAL` / `set_config(..., true)` inden mutation.
Policy `WITH CHECK (current_setting('stork.allow_X_write', true) = 'true')`
matcher kun når session-var er sat.

### Status-engangs-transitionspattern (sales kommer i lag E)

For tabeller hvor en kolonne flytter sig én vej (sales.status: pending →
completed/afvist), bygges BEFORE UPDATE-trigger der nægter transitioner
udenfor normal-pathen. Rollback ved menneskelig fejl sker via
`correct_<table>_status()` SECURITY DEFINER RPC der sætter
`stork.allow_<table>_status_correction = 'true'`-session-var som triggeren
genkender og lader transition igennem.

Eksempel-template dokumenteres her, bygges ved sales-tabel i lag E.
Generic helper-funktion bygges først ved 3+ brugere (rule of three).

## Klassifikations-systemet (lag D1)

`public.data_field_definitions` er registry over hvad hver kolonne pr. kilde
er klassificeret som. Lag D6 importerer eksisterende `classification.json`
hertil og flipper migration-gate til Phase 2 (strict).

### Skema

| Felt                                          | Type               | Beskrivelse                                                               |
| --------------------------------------------- | ------------------ | ------------------------------------------------------------------------- |
| `id`                                          | uuid PK            |                                                                           |
| `table_schema` + `table_name` + `column_name` | UNIQUE             | Kolonne-pr-kilde                                                          |
| `category`                                    | enum (CHECK)       | `operationel` / `konfiguration` / `master_data` / `audit` / `raw_payload` |
| `pii_level`                                   | enum (CHECK)       | `none` / `indirect` / `direct`                                            |
| `retention_type`                              | enum (CHECK, NULL) | `time_based` / `event_based` / `legal` / `manual`                         |
| `retention_value`                             | jsonb (NULL)       | Struktur valideret pr. type, se nedenfor                                  |
| `match_role`                                  | text (NULL)        | Per kolonne-per-kilde — fri tekst nu, strammere i lag E                   |
| `purpose`                                     | text NOT NULL      | Fri tekst, audit-kontekst                                                 |

### retention_value-strukturer

Valideret via BEFORE INSERT/UPDATE-trigger:

| retention_type | retention_value                                                      |
| -------------- | -------------------------------------------------------------------- |
| `time_based`   | `{"max_days": positive integer}`                                     |
| `event_based`  | `{"event": non-empty string, "days_after": non-negative integer}`    |
| `legal`        | `{"max_days": positive integer}` — lovgivning er fast MAKS           |
| `manual`       | `{"max_days": positive integer}` ELLER `{"event": non-empty string}` |

### Mathias-principper håndhævet

- **Kolonne-pr-kilde** via UNIQUE(schema, table, column). Eesy.customer_id og TDC.customer_id har hver deres række (forskellige retention-aftaler)
- **Lovgivning er fast MAKS** — `retention_type='legal'` valideres som positive integer max_days, ingen forlængelse-mekanisme i skema
- **Formål påkrævet** via NOT NULL + length(trim) > 0 CHECK
- **Kategorier låst** som CHECK enum (Mathias' U3-afgørelse)

### RPCs

- `data_field_definition_upsert(...)` — admin-only via `is_admin()` (C1-stub afviser indtil D4)
- `data_field_definition_delete(schema, table, column, change_reason)` — admin-only

Begge kræver `change_reason` for audit-trail.

### Read-adgang

Authenticated kan SELECT direkte via policy (metadata, ikke selv PII).
Lag D opdaterer policy til at konsultere permission-system når det lander.

## Migration-disciplin

Migrations lever i `supabase/migrations/`. Filnavnskonvention:
`<timestamp>_<beskrivelse>.sql`.

### Migration-gate

`scripts/migration-gate.mjs` parser hver migration, finder kolonner
fra `CREATE TABLE` og `ALTER TABLE ADD COLUMN`, og tjekker dem mod
`supabase/classification.json`.

**Phase 1 (lag B-D, default):** uklassificerede kolonner giver
`::warning::` i CI men blokerer ikke merge.

**Phase 2 (efter lag D):** samme tjek, men som `::error::` der
fejler CI. Aktiveres via `MIGRATION_GATE_STRICT=true` env var i CI.

```bash
pnpm migration:check                           # Phase 1
MIGRATION_GATE_STRICT=true pnpm migration:check # Phase 2 simulation
```

### Klassifikations-registry

`supabase/classification.json` er Phase 1's enkle registry:

```json
{
  "columns": {
    "public.tablename.columnname": {}
  }
}
```

I Phase 1 tæller eksistens af nøglen som "klassificeret".
Lag D introducerer skemaet (pii_level, retention_type osv.) som
hver indgang skal opfylde, og flytter registryet til en DB-tabel.

## Database-typer + schema-snapshot

Begge bygger på `supabase --linked`. Engangs-setup per dev-maskine:

```bash
pnpm exec supabase login          # browser-auth, gemmer access token
pnpm supabase:link                # link til imtxvrymaqbgcvsarlib via config.toml
```

CI har `SUPABASE_ACCESS_TOKEN`-secret sat på repo'et — link sker
automatisk i workflow før drift-checks kører.

### Types — packages/types/src/database.ts

```bash
pnpm types:generate   # regenerér fra remote schema → packages/types/src/database.ts
pnpm types:check      # CI-check: drift → exit 1
```

Placeholder-Database-typen blev pre-genereret i B1. Når første
migration lander, kør `pnpm types:generate` lokalt og commit.

### Schema-snapshot — supabase/schema.sql

```bash
pnpm schema:pull      # supabase db dump --linked --schema public → supabase/schema.sql
pnpm schema:check     # CI-check: drift → exit 1
```

Snapshot er strukturel ground truth (DDL, ingen data). Når
migrations lander på remote, kør `pnpm schema:pull` lokalt og commit.

Indtil første pull er filen en placeholder med marker — CI's
schema drift check springer over til filen er populated. Det betyder
første migration's PR SKAL include en opdateret schema.sql.

## Edge functions

Edge functions lever i `supabase/functions/<name>/index.ts`. Lag B
introducerer skabelon + disciplin (Deno-runtime, error-handling,
audit-integration).
