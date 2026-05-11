# D1.5 — Klassifikations-defaults for 76 keys

**Status:** Defaults bygget af Claude med Mathias' afgørelser indarbejdet
(session 2). Hver række er UI-redigerbar via lag F's superadmin-side
(roadmap, ikke implementeret endnu). D1.5 seeder rimelige startværdier
— ingen af dem er låste valg. Forkert default → ret i UI (eller via
`data_field_definition_upsert()` indtil UI lander).

**Workflow:**

1. Claude (denne fil) leverer defaults + migration-fil.
2. Mathias reviewer; retter direkte i denne fil hvis nogen default skal
   være anderledes ved seed-tidspunkt.
3. Claude opdaterer migration ud fra final-doc og venter på eksplicit
   go-ahead før apply.

---

## Konventioner

- **category** (enum, låst): `operationel` / `konfiguration` / `master_data` /
  `audit` / `raw_payload`
- **pii_level** (enum, låst): `none` / `indirect` / `direct`
- **retention_type** (enum, eller NULL): `time_based` / `event_based` /
  `legal` / `manual`. NULL = "retention ikke besluttet". D1's CHECK
  kræver `retention_value` NULL iff `retention_type` NULL.
- **match_role**: NULL for alle 76 rækker — lag E definerer
  match-strategier (phone-match, opp-match, member_number_match,
  mbb_composite_match m.fl.).
- **purpose**: NOT NULL fri-tekst. Audit-kontekst.

**Gruppe-definitioner:**

- **Gruppe 1 — Trivielle defaults** (58 rækker): klassifikation
  er åbenlys (id, timestamps, status-enums, schema-metadata). Spot-check.
- **Gruppe 2 — Gennemtænkte defaults** (11 rækker): klassifikation
  kræver semantisk tolkning men har én rimelig default. Mathias retter
  i UI hvis uenig efter at have set systemet i drift.
- **Gruppe 3 — Afgjorte spørgsmål** (7 rækker): kolonner Claude
  flaggede som tvivlsomme; Mathias har afgjort defaults eksplicit i
  session 2. Begrundelser logget per række.

**Retention** er en politik pr. tabel (8 stk) i sidste sektion — ikke 76
kolonne-beslutninger.

**Antal:** 58 + 11 + 7 = 76 ✓

---

## Gruppe 1 — Trivielle defaults (58 rækker)

### `public.audit_log` (12 af 15)

| column          | category | pii_level | purpose                                                   |
| --------------- | -------- | --------- | --------------------------------------------------------- |
| id              | audit    | none      | Audit-rækkens uuid PK; uændret efter INSERT               |
| occurred_at     | audit    | none      | Tidsstempel for hændelsen; trigger-genereret              |
| table_schema    | audit    | none      | Audit-target schema (typisk 'public')                     |
| table_name      | audit    | none      | Audit-target tabel-navn                                   |
| record_id       | audit    | indirect  | Audit-target row's PK; peger til mulig PII-bærende række  |
| operation       | audit    | none      | INSERT/UPDATE/DELETE                                      |
| actor_user_id   | audit    | indirect  | auth.uid() for handlingens udfører                        |
| actor_role      | audit    | none      | Postgres-rolle (authenticated/service_role/...) — generic |
| source_type     | audit    | none      | manual/cron/webhook/trigger_cascade/service_role/unknown  |
| schema_version  | audit    | none      | App schema-version-streng for replay-stabilitet           |
| changed_columns | audit    | none      | text[] med kolonne-navne — schema-metadata, ikke værdier  |
| trigger_depth   | audit    | none      | pg_trigger_depth() ved capture; cascade-detektion         |

### `public.cron_heartbeats` (10 af 11)

| column           | category    | pii_level | purpose                                              |
| ---------------- | ----------- | --------- | ---------------------------------------------------- |
| job_name         | operationel | none      | Cron-job's logiske navn (unique)                     |
| schedule         | operationel | none      | cron-expression (fx '0 1 \* \* \*')                  |
| is_enabled       | operationel | none      | Toggle for jobbet                                    |
| last_run_at      | operationel | none      | Tidspunkt for seneste eksekvering                    |
| last_status      | operationel | none      | ok/failure                                           |
| last_duration_ms | operationel | none      | Performance-telemetri                                |
| run_count        | operationel | none      | Lifetime kør-antal                                   |
| failure_count    | operationel | none      | Lifetime fejl-antal                                  |
| created_at       | operationel | none      | INSERT-tid for heartbeat-rækken                      |
| updated_at       | operationel | none      | Sidste mutation; opdateres ved hver heartbeat-record |

### `public.pay_period_settings` (4 af 4)

| column             | category      | pii_level | purpose                                        |
| ------------------ | ------------- | --------- | ---------------------------------------------- |
| id                 | konfiguration | none      | Singleton settings-rækkens PK                  |
| start_day_of_month | konfiguration | none      | Start-dag for lønperiode (1-28)                |
| created_at         | konfiguration | none      | INSERT-tid                                     |
| updated_at         | konfiguration | none      | Sidste mutation; opdateres af set_updated_at() |

### `public.pay_periods` (8 af 8)

| column     | category    | pii_level | purpose                              |
| ---------- | ----------- | --------- | ------------------------------------ |
| id         | operationel | none      | Period-rækkens PK                    |
| start_date | operationel | none      | Period-start dato                    |
| end_date   | operationel | none      | Period-slut dato                     |
| status     | operationel | none      | open/locked livscyklus               |
| locked_at  | operationel | none      | Tidspunkt for lock; NULL indtil låst |
| locked_by  | operationel | indirect  | auth.uid() der låste perioden        |
| created_at | operationel | none      | INSERT-tid                           |
| updated_at | operationel | none      | Sidste mutation; opdateres ved lock  |

### `public.salary_corrections` (6 af 10)

| column                 | category    | pii_level | purpose                                                    |
| ---------------------- | ----------- | --------- | ---------------------------------------------------------- |
| id                     | operationel | none      | Correction PK                                              |
| target_period_id       | operationel | none      | FK til pay_periods (modposten anvendes her)                |
| source_period_id       | operationel | none      | FK til perioden korrektionen stammer fra                   |
| source_cancellation_id | operationel | none      | FK til cancellations (NULL hvis ikke cancellation-baseret) |
| created_at             | operationel | none      | INSERT-tid (immutable derefter)                            |
| created_by             | operationel | indirect  | auth.uid() der oprettede                                   |

### `public.cancellations` (6 af 9)

| column                   | category    | pii_level | purpose                                                   |
| ------------------------ | ----------- | --------- | --------------------------------------------------------- |
| id                       | operationel | none      | Cancellation PK                                           |
| cancellation_date        | operationel | none      | Dato for annullering (klient-indløbet)                    |
| matched_to_correction_id | operationel | none      | FK til salary_corrections; NULL indtil matchet efter lock |
| matched_at               | operationel | none      | Tidspunkt for matching                                    |
| created_at               | operationel | none      | INSERT-tid                                                |
| created_by               | operationel | indirect  | auth.uid() der registrerede                               |

### `public.data_field_definitions` (12 af 12)

| column          | category      | pii_level | purpose                                                             |
| --------------- | ------------- | --------- | ------------------------------------------------------------------- |
| id              | konfiguration | none      | Definition-rækkens PK                                               |
| table_schema    | konfiguration | none      | Target schema (fx 'public')                                         |
| table_name      | konfiguration | none      | Target tabel                                                        |
| column_name     | konfiguration | none      | Target kolonne                                                      |
| category        | konfiguration | none      | Klassifikations-kategori-værdi                                      |
| pii_level       | konfiguration | none      | Klassifikations-niveau-værdi                                        |
| retention_type  | konfiguration | none      | Klassifikations-retention-type-værdi                                |
| retention_value | konfiguration | none      | Klassifikations-retention-detalje (jsonb-struktur valideret)        |
| match_role      | konfiguration | none      | Per kolonne-per-kilde match-strategi (lag E definerer enum-værdier) |
| purpose         | konfiguration | none      | Audit-kontekst fri-tekst                                            |
| created_at      | konfiguration | none      | INSERT-tid                                                          |
| updated_at      | konfiguration | none      | Sidste mutation                                                     |

---

## Gruppe 2 — Gennemtænkte defaults (11 rækker)

### `public.commission_snapshots` (7 af 7)

Tabel-niveau valg: `category = operationel`. Snapshots er en levende del
af payroll-pipelinen (refereret af lønregnskab), selv om de er immutable
INSERT-only. `audit`-kategorien er reserveret til `audit_log` selv.

| column         | category    | pii_level | purpose                                                   |
| -------------- | ----------- | --------- | --------------------------------------------------------- |
| id             | operationel | none      | Snapshot PK                                               |
| period_id      | operationel | none      | FK til pay_periods                                        |
| employee_id    | operationel | indirect  | FK til employees (lag D3) — sælgeren bag provisionen      |
| sale_id        | operationel | indirect  | FK til sale (lag E)                                       |
| status_at_lock | operationel | none      | dimension-A-status (pending/completed) ved lock-tidspunkt |
| created_at     | operationel | none      | INSERT-tid (immutable derefter)                           |
| amount         | operationel | none      | Provision-beløb (DKK) — se Gruppe 3 G3.5 for begrundelse  |

### `public.salary_corrections` (3 af 10)

| column         | category    | pii_level | purpose                                                         |
| -------------- | ----------- | --------- | --------------------------------------------------------------- |
| source_sale_id | operationel | indirect  | FK til sale (lag E) — indirect via FK til PII-bærende række     |
| reason         | operationel | none      | Kort kode-ord ('cancellation', 'cancellation_reversal' m.fl.)   |
| description    | operationel | indirect  | Fri-tekst forklaring; kan i praksis indeholde person-referencer |

### `public.cancellations` (2 af 9)

| column         | category    | pii_level | purpose                               |
| -------------- | ----------- | --------- | ------------------------------------- |
| source_sale_id | operationel | indirect  | FK til sale (lag E) — indirect via FK |
| reason         | operationel | none      | Kort kode-ord                         |

---

## Gruppe 3 — Afgjorte defaults med begrundelse (7 rækker)

Mathias har afgjort hver default i session 2. Begrundelse logget pr. række.

### G3.1 — `audit_log.change_reason`

| category | pii_level | purpose                                          |
| -------- | --------- | ------------------------------------------------ |
| audit    | none      | System-metadata; konvention håndhæves af callers |

**Begrundelse:** `change_reason` er fri-tekst men anvendes som
operationel metadata om hvorfor en mutation skete. Konventionen
håndhæves af callers (RPC'er + cron-jobs) — ikke fri-tekst person-data.

### G3.2 — `audit_log.old_values`

| category | pii_level | purpose                                                                    |
| -------- | --------- | -------------------------------------------------------------------------- |
| audit    | indirect  | jsonb-dump af row før mutation; direct PII hashes af audit_filter_values() |

**Begrundelse:** D2's `audit_filter_values()` hasher `pii_level='direct'`
kolonner FØR det lander i `old_values`. `indirect` er højeste reelle
niveau efter filteret.

### G3.3 — `audit_log.new_values`

| category | pii_level | purpose                                                                      |
| -------- | --------- | ---------------------------------------------------------------------------- |
| audit    | indirect  | jsonb-dump af row efter mutation; direct PII hashes af audit_filter_values() |

**Begrundelse:** Samme som G3.2.

### G3.4 — `cron_heartbeats.last_error`

| category    | pii_level | purpose                                          |
| ----------- | --------- | ------------------------------------------------ |
| operationel | none      | SQLERRM-tekst ved seneste fejl; debug skal virke |

**Begrundelse:** Debug skal virke; cron-jobs kalder dedikerede RPCs som
validerer input før mutation. PII-edge-cases håndteres separat hvis de
opstår i praksis.

### G3.5 — `commission_snapshots.amount`

| category    | pii_level | purpose                                                            |
| ----------- | --------- | ------------------------------------------------------------------ |
| operationel | none      | Provision-beløb (DKK) — kobler ikke til person efter anonymisering |

**Begrundelse:** Så længe medarbejderen er aktiv, har vi gyldigt formål.
Når medarbejderen anonymiseres i master-tabel (employees), peger
`employee_id`-FK på en anonym række — beløbet står stadig, ikke koblet
til person. `indirect` ville gøre løn-historik ulæselig uden tilsvarende
gevinst.

### G3.6 — `salary_corrections.amount`

| category    | pii_level | purpose                                                             |
| ----------- | --------- | ------------------------------------------------------------------- |
| operationel | none      | Korrektion-beløb (DKK) — kobler ikke til person efter anonymisering |

**Begrundelse:** Samme som G3.5.

### G3.7 — `cancellations.amount`

| category    | pii_level | purpose                                                             |
| ----------- | --------- | ------------------------------------------------------------------- |
| operationel | none      | Annulleret beløb (DKK) — kobler ikke til klient efter anonymisering |

**Begrundelse:** Samme princip som G3.5/G3.6 anvendt på klient-master.

---

## Retention-defaults pr. tabel — 8 startværdier

Hver kolonne i en tabel arver tabellens retention. Rettelser pr. kolonne
sker via UI når og hvis der bliver behov.

**Bemærk:** Stork fører ingen bogføring (e-conomic er bogføring). Derfor
bruger vi `time_based`, ikke `legal`, på løn-tabeller. `legal`-typen er
reserveret til felter hvor specifik lovgivning dikterer fast tidsfrist
uden mulighed for forlængelse.

| Tabel                  | retention_type | retention_value                  | Begrundelse                                   |
| ---------------------- | -------------- | -------------------------------- | --------------------------------------------- |
| audit_log              | time_based     | `{"max_days": 1825}`             | Internt audit — 5 år som start                |
| cron_heartbeats        | time_based     | `{"max_days": 90}`               | Operationel telemetri                         |
| pay_period_settings    | manual         | `{"event": "config_superseded"}` | Lever indtil ny config-række oprettes         |
| pay_periods            | time_based     | `{"max_days": 1825}`             | Intern løn-historik — 5 år som start          |
| commission_snapshots   | time_based     | `{"max_days": 1825}`             | Intern løn-historik — 5 år som start          |
| salary_corrections     | time_based     | `{"max_days": 1825}`             | Intern løn-historik — 5 år som start          |
| cancellations          | time_based     | `{"max_days": 1825}`             | Salgshistorik — 5 år som start                |
| data_field_definitions | manual         | `{"event": "column_dropped"}`    | Klassifikationen lever lige så længe kolonnen |

Alle retention_value-strukturer validerer mod D1's
`data_field_definitions_validate_retention()`-trigger.

---

## Migrations-mekanik (Claude-noter)

Seed-migrationen vil:

1. Sætte session-vars:
   - `stork.source_type = 'manual'`
   - `stork.change_reason = 'D1.5: bulk-seed klassifikations-defaults for 76 eksisterende keys'`
   - `stork.allow_data_field_definitions_write = 'true'`
2. Direkte INSERT i `public.data_field_definitions` (ikke via
   `data_field_definition_upsert()`-RPC, fordi `is_admin()`-stub
   returnerer false indtil D4).
3. `stork_audit()`-trigger skriver 76 rækker til `audit_log` med
   `change_reason='D1.5: ...'` — acceptabel artefakt.
4. `data_field_definitions_validate_retention()`-trigger validerer
   retention_value-strukturen pr. retention_type.
5. Smoke-test post-apply (via execute_sql):
   - `SELECT count(*) FROM public.data_field_definitions` = 76
   - `SELECT count(*) FROM public.audit_log WHERE source_type='manual' AND change_reason LIKE 'D1.5:%'` = 76 nye rækker (oven i de eksisterende fra C/D1)
   - `SELECT category, count(*) FROM public.data_field_definitions GROUP BY category` matcher forventning
   - `SELECT pii_level, count(*) FROM public.data_field_definitions GROUP BY pii_level`

**Migration-filnavn:** `<MCP-genereret-timestamp>_d1_5_seed_classification.sql`
(MCP's `apply_migration` auto-genererer timestamp; filen committet med
samme version som remote).

---

## Til Mathias — sådan annoteres dette dokument

Skriv ét af følgende ved hver række hvor du vil ændre **seed-værdien**:

- `[CONFIRMED]` — accept som-er (kan udelades; default-position er accept)
- `[CHANGE: <ny værdi>]` — fx `[CHANGE pii_level: indirect]`
- `[QUESTION: <text>]` — Claude svarer før migration

Når review er afsluttet, kommenterer Mathias `Klar til migration` og
Claude bygger seed-migrationen. Ændringer efter seed = UI/RPC, ikke ny
migration.
