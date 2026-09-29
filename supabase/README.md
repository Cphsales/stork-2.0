# Supabase — Stork 2.0

Backend lever på et selvstændigt Supabase B-projekt
(`imtxvrymaqbgcvsarlib`, Region: West EU (Ireland)).
PostgreSQL 17. Skemaet bygges af migrationerne i `supabase/migrations/`
(masterplanens trin 1-10) og er i drift. Tabeller og funktioner ligger i
`core_identity`, `core_compliance` og `core_money`; `public` holdes tom
(fitness `schema-ownership`, trin 1 `20260514120000_t1_drop_public.sql`).

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
| `pnpm exec supabase gen types typescript --linked` | Generér TS-typer fra remote schema                                                                             |

## RLS-template

Hver feature-tabel skal have RLS aktiveret OG forced. Default deny —
ingen rolle har implicit adgang, heller ikke owner eller service_role.

**Standard-mønster for ny tabel:**

```sql
CREATE TABLE core_<domæne>.example (...);
ALTER TABLE core_<domæne>.example ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_<domæne>.example FORCE ROW LEVEL SECURITY;
-- Tilføj policies efter behov for authenticated.
```

**Opt-out fra FORCE** (kun hvis tabellen designet til at have
service-role-skrivere som integration-engine eller webhook-forwarder
der ikke kan gå gennem SECURITY DEFINER):

```sql
-- skip-force-rls: <eksplicit begrundelse>
ALTER TABLE core_<domæne>.example ENABLE ROW LEVEL SECURITY;
```

**Privilegerede operationer** (cron-jobs, webhook-ingest, snapshot-
trigger, m.fl.) går gennem `SECURITY DEFINER`-funktioner med
`SET search_path = ''` + eksplicitte schema-qualified referencer.
Ikke via direkte service-role-API-kald.

### Helper-funktioner

| Funktion                                                          | Returner  |
| ----------------------------------------------------------------- | --------- |
| `core_identity.current_employee_id()`                             | `uuid`    |
| `core_identity.is_admin()`                                        | `boolean` |
| `core_identity.has_permission(p_page_key, p_tab_key, p_can_edit)` | `boolean` |
| `core_identity.has_permission_action(p_action_id)`                | `boolean` |

En tabel med RLS og 0 policies (default-deny) skal have markøren
`-- skip-force-rls: <begrundelse>` eller `-- default-deny: <begrundelse>`
(fitness `db-rls-policies`). App-roller har ingen direkte skrive-grants
på core\_\* — skrivning går via SECURITY DEFINER-RPC'er (fitness
`app-write-revoke-discipline`, G065).

## Audit-template

Alle feature-tabeller får audit via `core_compliance.stork_audit()`-trigger
(fitness `audit-trigger-coverage`; undtagelser i `AUDIT_EXEMPT_SNAPSHOT_TABLES`).
Audit-log er append-only, immutable, og kun læselig via SECURITY
DEFINER RPC med permission-check.

**Attach trigger til ny tabel:**

```sql
CREATE TRIGGER example_audit
  AFTER INSERT OR UPDATE OR DELETE ON core_<domæne>.example
  FOR EACH ROW EXECUTE FUNCTION core_compliance.stork_audit();
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
7 mulige værdier: `manual / cron / webhook / trigger_cascade /
service_role / unknown / migration`.

**Læs audit:**

```sql
SELECT * FROM core_compliance.audit_log_read(
  p_table_schema => 'core_money',
  p_table_name => 'pay_periods',
  p_record_id => '<id>',
  p_limit => 50
);
```

Kalder skal have rettigheden `audit.log` (`has_permission('audit', 'log', false)`).

**PII-filter-hook:** `core_compliance.audit_filter_values(schema, table, jsonb)`
hasher kolonner med `pii_level=direct` før de gemmes. Ukendt tabel eller
kolonne: WARNING og værdien bevares uændret, medmindre
`stork.audit_filter_strict='true'` (LENIENT-default = G001).

**Audit-failure-policy:** hvis `stork_audit()` RAISE'r, bobler det op
til main transaction → main rulles tilbage. Compliance kræver vores
adgangslog, så "audit failure = transaction failure" er bevidst.

## Cron-skabelon

**Princip:** `pg_cron` til DB-interne jobs. Der findes ingen edge
functions endnu; eksterne kald afgøres når de første integrationer
bygges (masterplan trin 21).

**Extensions aktiveret:** `pg_cron`, `btree_gist` (til C4),
`pg_net` (til hybrid pg_cron → edge function).

### Heartbeat-pattern

Hver cron-job rapporterer status til `core_compliance.cron_heartbeats`
via `core_compliance.cron_heartbeat_record()` (status `ok / failure / skipped / partial_failure`). Cron-bodies skal sætte `stork.change_reason` (fitness `cron-change-reason`). Failure-rows auditeres
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
    DELETE FROM core_<domæne>.example_tokens WHERE expires_at < now();

    PERFORM core_compliance.cron_heartbeat_record(
      'cleanup_expired_tokens',
      '0 * * * *',
      'ok',
      NULL,
      (EXTRACT(EPOCH FROM (clock_timestamp() - v_started)) * 1000)::integer
    );
  EXCEPTION WHEN OTHERS THEN
    v_error := SQLERRM;
    PERFORM core_compliance.cron_heartbeat_record(
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

### Notifikation ved failure

**TODO:** email/Slack-notifikation når `cron_heartbeats.last_status='failure'`
eller når en job ikke har kørt i for lang tid. Separat beslutning
når email-provider er valgt. Indtil da: failures synlige i
`audit_log` (filter source_type='cron') og via
`core_compliance.cron_heartbeats_read()` RPC (rettighed `audit.cron`).

## Period-lock-template

Generic mønster for "tal låses, data må ikke" der bruges på tværs af
domæner (løn implementeret nu; KPI senere).

**Fire dele pr. domæne:**

1. `{domain}_periods` — periode-tabel med open/locked livscyklus
2. `{domain}_snapshots` — immutable frosne tal ved lock
3. `{domain}_corrections` — immutable kompenserings-modposter
4. Cron-job + `on_period_lock()`-trigger der materialiserer snapshots

Instans (trin 4, `core_money`): `pay_periods` + `commission_snapshots` + `salary_corrections`

- `ensure_pay_periods`-cron. Beregningen er stadig et skelet (G012);
  den reelle materialisering kommer med trin 14 + 22.

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

### Status-engangs-transitionspattern (sales kommer i trin 14)

For tabeller hvor en kolonne flytter sig én vej (sales.status: pending →
completed/afvist), bygges BEFORE UPDATE-trigger der nægter transitioner
udenfor normal-pathen. Rollback ved menneskelig fejl sker via
`correct_<table>_status()` SECURITY DEFINER RPC der sætter
`stork.allow_<table>_status_correction = 'true'`-session-var som triggeren
genkender og lader transition igennem.

Eksempel-template dokumenteres her, bygges ved sales-tabellen.
Generic helper-funktion bygges først ved 3+ brugere (rule of three).

## Klassifikations-systemet

`core_compliance.data_field_definitions` er registry over hvad hver kolonne pr. kilde
er klassificeret som. Migration-gate kører Phase 2 (strict) i CI; tabellen i
databasen er sandheden.

### Skema

| Felt                                          | Type               | Beskrivelse                                                               |
| --------------------------------------------- | ------------------ | ------------------------------------------------------------------------- |
| `id`                                          | uuid PK            |                                                                           |
| `table_schema` + `table_name` + `column_name` | UNIQUE             | Kolonne-pr-kilde                                                          |
| `category`                                    | enum (CHECK)       | `operationel` / `konfiguration` / `master_data` / `audit` / `raw_payload` |
| `pii_level`                                   | enum (CHECK)       | `none` / `indirect` / `direct`                                            |
| `retention_type`                              | enum (CHECK, NULL) | `time_based` / `event_based` / `manual` / `permanent` (NULL = ikke valgt) |
| `retention_value`                             | jsonb (NULL)       | Struktur valideret pr. type, se nedenfor                                  |
| `match_role`                                  | text (NULL)        | Per kolonne-per-kilde — fri tekst nu, strammere i lag E                   |
| `purpose`                                     | text NOT NULL      | Fri tekst, audit-kontekst                                                 |

### retention_value-strukturer

Valideret via BEFORE INSERT/UPDATE-trigger:

| retention_type | retention_value                                                      |
| -------------- | -------------------------------------------------------------------- |
| `time_based`   | `{"max_days": positive integer}`                                     |
| `event_based`  | `{"event": non-empty string, "days_after": non-negative integer}`    |
| `permanent`    | NULL — ingen sletning (fx audit-struktur)                            |
| `manual`       | `{"max_days": positive integer}` ELLER `{"event": non-empty string}` |

### Mathias-principper håndhævet

- **Kolonne-pr-kilde** via UNIQUE(schema, table, column). Eesy.customer_id og TDC.customer_id har hver deres række (forskellige retention-aftaler)
- **`legal` er fjernet** (masterplan rettelse 24); tidligere legal-rækker er NULL eller `permanent` (`20260514180500_d1_d2_drop_legal_convert_rows.sql`)
- **Formål påkrævet** via NOT NULL + length(trim) > 0 CHECK
- **Kategorier låst** som CHECK enum (Mathias' U3-afgørelse)

### RPCs

- `core_compliance.data_field_definition_upsert(...)` — kræver rettigheden `classification.manage`
- `data_field_definition_delete(schema, table, column, change_reason)` — admin-only

Begge kræver `change_reason` for audit-trail.

### Read-adgang

Authenticated kan SELECT direkte via policy (metadata, ikke selv PII).

## Migration-disciplin

Migrations lever i `supabase/migrations/`. Filnavnskonvention:
`<timestamp>_<beskrivelse>.sql`.

### Migration-gate

`scripts/migration-gate.mjs` parser hver migration, finder kolonner
fra `CREATE TABLE` og `ALTER TABLE ADD COLUMN`, og tjekker at hver har
en klassifikations-række (`INSERT INTO … data_field_definitions` i
migrationerne). Gaten tjekker kun at rækken findes, ikke værdierne —
værdierne styres i UI.

**Phase 2 (strict) kører i CI** (`MIGRATION_GATE_STRICT=true`, `ci.yml`):
en uklassificeret kolonne fejler CI. Lokalt uden variablen: kun warning.

```bash
pnpm migration:check                            # lokalt: warning
MIGRATION_GATE_STRICT=true pnpm migration:check # som i CI
```

Gaten ser ikke DDL der bygges dynamisk med `EXECUTE format(...)` (G082).

### Klassifikations-registry

`supabase/classification.json` er en tom overgangsfil (`"columns": {}`).
Sandheden er `core_compliance.data_field_definitions` i databasen.

## Database-typer

```bash
pnpm types:generate   # regenerér packages/types/src/database.ts fra det linkede projekt
```

`packages/types/src/database.ts` dækker `public`, `core_identity`,
`core_compliance` og `core_money` (`scripts/types-gen.sh`). En PR med nye
migrationer tjekkes i CI mod testdatabasen med pakkens migrationer
(jobbet »Byggetjek og slutdom«), fordi driften først får migrationerne efter merge.
Generér typerne mod en lokal database med migrationerne, eller efter deploy.

## Ny tabel eller RPC i fundamentet — tjekliste

CI håndhæver det meste, men det står kun her samlet:

- `dedup_key`-kolonne eller `-- no-dedup-key: <grund>` (fitness `dedup-key-or-opt-out`)
- audit-trigger eller post i `AUDIT_EXEMPT_SNAPSHOT_TABLES` (fitness `audit-trigger-coverage`)
- klassifikation af hver kolonne i samme migration (migration-gate, strict)
- SECURITY DEFINER-funktion: post i `SECDEF_SANCTIONED` (fitness `secdef-marker-discipline`) og `supabase/advisor-baseline.json` med begrundelse (fitness `advisor-baseline`)
- Postgres giver EXECUTE til PUBLIC som default: `revoke execute … from public, anon` og derefter eksplicit `grant execute` til den rolle der skal kalde
- nyt permission-area/page/tab: seed grant til superadmin eksplicit — seedet i `20260518000010_t9_seed_owners.sql` dækkede kun de areas der fandtes dengang
- ny `change_type` i pending-flowet: udvid `pending_changes_select`, ellers kan godkendere ikke se den
- regenerér typer (`pnpm types:generate`)
- skrivning kun via SECURITY DEFINER-RPC (ingen direkte grants, fitness `app-write-revoke-discipline`)

Der findes ingen edge functions i repoet.
