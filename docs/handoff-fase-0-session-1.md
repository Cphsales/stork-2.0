# Stork 2.0 fase 0 — handoff fra session 1

Dette dokument er **selvstændig opsamling** af alt bygget og besluttet i
første Claude Code-session for Stork 2.0's fase 0. En ny session skal
kunne fortsætte uden chat-historik ved at læse:

1. **Dette dokument** (handoff)
2. Projektets fastlagte dokumenter: bibel, dokument-1, storks-logikker,
   `code-loesning-runde-2`, samt repo's `CLAUDE.md` (hvis sat)
3. Repo state (`git log`, `supabase/migrations/`, `classification.json`)

Ny session bringer **ingen** chat-historik med. Alt vigtigt fra session 1
er destilleret her.

---

## 0. Hurtig orientering

- **Repo:** `copenhagensales/stork-2.0` (private, GitHub Pro)
- **Supabase:** `imtxvrymaqbgcvsarlib` (West EU/Ireland, Postgres 17)
- **Arbejds-branch:** `claude/review-phase-zero-plan-oW5Cg`
- **PR:** #1 (draft) på GitHub
- **Stack:** pnpm workspaces + Turborepo + Vite/React 18/TS + Supabase
- **Node 22 LTS / pnpm 10.33.0** pinnet via `engines` + `.nvmrc` + `.tool-versions`

`pnpm install` virker, alle CI-checks grønne, branch-protection aktiv på main.

---

## 1. Mathias' arbejdsmåde — LÆS DETTE FØRST

Disse regler er ikke-forhandlerbare. Tre gange i session 1 har jeg fejlet
ved at tage uautoriserede skridt. Det skal ikke ske igen.

### Beslutnings-arbejdsdeling

- **Forretnings-beslutninger:** Mathias. Klassifikation, retention-policies,
  prioriteringer, hvilke kasser data hører i, hvilke principper der gælder.
- **Tekniske beslutninger:** Claude. SQL-syntaks, trigger-pattern,
  index-valg, performance-overvejelser.
- **Mødet:** Argumentér teknisk imod hvis Mathias' forslag har huller.
  **Bøj dig ikke for autoritet.** Det vigtigste er at Mathias' tanker
  fungerer i kode. Stop ham hvis det ikke gør.

### Approval-mønster

**Lag-skifte kræver eksplicit "godkendt, gå videre"-bekræftelse fra Mathias.**

- Inden for et lag kan steps flyde — chain A1→A10, B1→B4, C1→C4, etc.
- Mellem lag (A→B, B→C, C→D, ...) STOP og rapportér samlet.
- Vent på "godkendt" før næste lag startes. **Aldrig** fortolk grønne
  tests, ren stop-hook eller andre signaler som implicit godkendelse.

Mathias har sagt direkte: _"Handlinger der ændrer shared state
(apply_migration, push, merge) kræver eksplicit 'godkendt, gå videre'.
Rydning af working tree, grønne tests, ren stop-hook — INGEN af disse
er implicit godkendelse."_

### Pause ved tvivl

Bedre at stoppe og diskutere én gang mere end at bygge noget der skal
omskrives. Hvis du opdager teknisk uholdbart, en bedre løsning eller en
beslutning der mangler — **flag det FØR du bygger**, ikke bagefter.

### Mine tre konkrete fejl (læringer)

1. **Tidlig C1-pre-apply:** kaldte `apply_migration` mens jeg sagde at jeg
   ventede på input. Rollback udført.
2. **Lag A→B autoritet:** fortolkede "tests grønne" som approval. Mathias
   korrigerede mig.
3. **C4-design over-anbefaling:** anbefalede tekniske valg uden argumenter,
   blot "jeg foreslår". Mathias forlangte tekniske argumenter pr. punkt.

Konsekvent læring: **argumentér teknisk eller hold mund.**

---

## 2. Nuværende status

| Lag                          | Status                                    |
| ---------------------------- | ----------------------------------------- |
| Lag A (Infra)                | ✅ Godkendt af Mathias                    |
| Lag B (Disciplin-mekanismer) | ✅ Godkendt af Mathias                    |
| Lag C (DB-fundament)         | ✅ Godkendt af Mathias                    |
| Lag D (Domæne-fundament)     | 🚧 D1 færdig, D1.5 venter på seed-arbejde |
| Lag E (Engine + integration) | ⏳ Ikke startet                           |

**Aktuel migration count på remote:** 6 applied
(`c1_rls_helpers_stub`, `c2_audit_template`, `c3_cron_skabelon`,
`c4_pay_periods_template`, `c4_1_audit_log_immutability`,
`d1_data_field_definitions`)

**Branch-protection aktiv på main:** verificeret via 4 smoke-tests
(direkte push, force-push, deletion, API-GET alle som forventet).

**Open question blokkering D2:** Mathias har bekræftet D1 godkendt og
flag'et at D5 ikke kan lande med tom klassifikations-tabel. Vi har aftalt
at indføre **D1.5 (seed-step)** før D2. Mathias venter på tre
bekræftelser fra mig (se §8 nedenfor).

---

## 3. Bygget steps med commits

### Lag A — Infra

| Step | Commit                | Leverance                                                                                                                                                                  |
| ---- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1   | `032efef`             | Monorepo restruktur til pnpm + Turborepo. Lovable's `src/` flyttet til `apps/web/`. Pakker oprettet: `@stork/core`, `@stork/types`, `@stork/utils`, `@stork/eslint-config` |
| A2   | `429424b`             | `tsconfig.base.json` med fuld strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`. 10 shadcn-fejl fixed                                                     |
| A3   | `c1a03a6`             | `@stork/eslint-config` (base + react preset). `no-console: error`, `no-explicit-any: error`, strict `no-unused-vars` med `^_` undtagelse                                   |
| A4   | `3c1c976` + `8a9a8e0` | Prettier (printWidth 120) + `.editorconfig` + `eslint-config-prettier` integration                                                                                         |
| A5   | `6e6f4c0`             | Vitest workspace config med `mergeConfig`                                                                                                                                  |
| A6   | `51f9972`             | Husky + lint-staged pre-commit (Prettier + ESLint på staged files)                                                                                                         |
| A7   | `79f3198`             | GitHub Actions CI: format-check + lint + typecheck + test + build                                                                                                          |
| A8   | `cf692de` + `84902f6` | Branch-protection docs. Aktiveret på remote af Mathias (GitHub Pro)                                                                                                        |
| A9   | `e6711a1`             | Supabase CLI som workspace devDep. Build-allow via `pnpm.onlyBuiltDependencies`                                                                                            |
| A10  | `f84894d`             | Toolchain-lock: `.npmrc` `engine-strict=true`, `.tool-versions` (nodejs 22.11.0, pnpm 10.33.0)                                                                             |

**Lag A-resultat:** Strict toolchain, monorepo, CI, branch-protection alle håndhævet teknisk.

### Lag B — Disciplin-mekanismer

| Step   | Commit    | Leverance                                                                                                                                                      |
| ------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1     | `6b2aead` | `@stork/types` med `Database`-type placeholder. `pnpm types:generate` + `types:check`. CI-step Types drift check                                               |
| B2     | `88381ac` | `supabase/schema.sql` placeholder + `pnpm schema:pull`/`schema:check`. Plus fix til B1's broken `if:` condition (env i step-niveau)                            |
| B2-fix | `8507496` | `types:check` skip på `// PLACEHOLDER`-marker. Forhindrer drift-fejl på tom DB                                                                                 |
| B3     | `e996672` | `scripts/migration-gate.mjs` Phase 1 — warn på uklassificerede kolonner. `classification.json` registry                                                        |
| B4     | `18e107e` | `scripts/fitness.mjs` framework + 5 starter-checks: no-ts-ignore, eslint-disable-justified, migration-naming, workspace-boundaries, no-hardcoded-supabase-urls |

**Lag B-resultat:** CI gating på drift, klassifikation, fitness — alle scripts kører ubetinget eller med `SUPABASE_ACCESS_TOKEN`-secret.

### Lag C — DB-fundament

| Step | Commit    | Leverance                                                                                                                                                              |
| ---- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1   | `c93e244` | `current_employee_id()` + `is_admin()` stub-funktioner. RLS-template-doc med skip-force-rls opt-out-syntax                                                             |
| C2   | `89847b8` | `audit_log`-tabel + `stork_audit()` trigger function + `audit_log_read()` RPC. 6-værdi `source_type`-enum. PII-filter-hook `audit_filter_values()` stub                |
| C3   | `594f152` | Aktivér pg_cron + btree_gist + pg_net. `cron_heartbeats`-tabel + `cron_heartbeat_record()` RPC. WHEN-trigger der kun auditerer failures                                |
| C4   | `ca7bf44` | Period-lock-template (5 tabeller: pay_period_settings, pay_periods, commission_snapshots, salary_corrections, cancellations) + helpers + cron-job `ensure_pay_periods` |
| C4.1 | `edb74ea` | audit_log immutability-trigger (fix til finding i C-rapport). UPDATE+DELETE smoke-test PASS                                                                            |

**Lag C-resultat:** Fuld DB-fundament med RLS Variant B, audit-trail, cron-infrastruktur, period-lock-template med løn-instans live.

### Lag D — Domæne-fundament

| Step | Commit     | Leverance                                                                                                              |
| ---- | ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| D1   | `71b453f`  | `data_field_definitions`-tabel + retention-validator trigger + CRUD-RPCs. Tom. 6 smoke-tests PASS                      |
| D1.5 | — venter — | Seed-step der klassificerer eksisterende 76 keys i classification.json. Kollaborativt (Mathias retter, Claude skriver) |
| D2   | ⏳         | Omdefiner `audit_filter_values()` til at hashe pii_level=direct. LENIENT default i Phase 1                             |
| D3   | ⏳         | `employees` + auth.uid()→employee_id mapping. Opdater `current_employee_id()`                                          |
| D4   | ⏳         | `role_page_permissions` + opdater `is_admin()`                                                                         |
| D5   | ⏳         | PII-bearing tabeller (clients, sales m.fl.). Hver tabel medfølges af klassifikation i samme migration                  |
| D6   | ⏳         | Migration-gate Phase 2-flip + fitness-checks fra lag C-rapport                                                         |

---

## 4. Arkitektoniske beslutninger

### 4.1 Status-model: Dimension A på sales, Dimension B i separat tabel

**Mathias' præcisering** ændrede min oprindelige forståelse fra dokumenterne.

**Dimension A — sales.status (livscyklus på selve salget):**

- `pending` — start når sælger registrerer
- `completed` — klient validerer salget
- `afvist` — klient afviser salget

Transitions: `pending → completed` eller `pending → afvist`. **Engangs i
normal flow**, men ved menneskelig fejl kan rulles tilbage via SECURITY
DEFINER-funktion `correct_sale_status()` med permission-hook.

**Dimension B — cancellations (separat begivenheds-tabel):**

- Kan ske på sales hvor dimension A er `pending` ELLER `completed`
- Kan IKKE ske på sales hvor dimension A er `afvist`
- **Sales-rækken røres ALDRIG ved annullering**
- Cancellation = ny begivenhed, ikke status-ændring

### 4.2 Provision-formel

```
provision = pending + completed
```

Cancellations påvirker **ikke** dashboard-provision. De manifesterer
sig som fradrag i `salary_corrections` (lønregnskab). Provision ved
salgstidspunkt fryses i `commission_snapshots` ved pay_period-lock.

### 4.3 FORCE RLS Variant B

**Princippet:** Også `service_role` respekterer RLS. Rådata = bevis,
må ikke kunne ødelægges, heller ikke via bagdøre.

**Implementering:** Hver feature-tabel har `FORCE ROW LEVEL SECURITY` +
session-var-baserede policies:

```sql
CREATE POLICY example_write ON public.example
  FOR INSERT
  WITH CHECK (current_setting('stork.allow_example_write', true) = 'true');
```

Write-RPCs sætter session-var via `set_config(..., true)` inden mutation.
Caller uden RPC kan ikke skrive — `REVOKE ALL FROM PUBLIC, anon, authenticated, service_role`.

**Konsekvens for edge functions:** Webhook-ingest og scheduled functions
kan ikke længere bruge service-role-key til direkte INSERT i feature-
tabeller. Alt skal gå gennem dedikerede SECURITY DEFINER RPCs.

**Skip-force-rls opt-out:** Audit_log og cron_heartbeats har `ENABLE`
(ikke `FORCE`) RLS dokumenteret med kommentar `-- skip-force-rls: <reason>`.
Grunden: stork_audit() trigger og cron_heartbeat_record() er postgres-
owned SECURITY DEFINER der skal kunne INSERT'e. FORCE ville blokere
også deres legitime flow. Beskyttelse mod direkte adgang sker via
REVOKE-grants + 0 policies = default deny.

### 4.4 Period-lock-template (lag C4)

Generisk mønster med 4 dele pr. domæne:

1. `{domain}_periods` — open/locked livscyklus, exclusion-constraint mod overlap
2. `{domain}_snapshots` — immutable frosne tal ved lock (INSERT-only)
3. `{domain}_corrections` — append-only kompenserings-modposter
4. Cron-job + `on_{domain}_lock()`-trigger der materialiserer snapshots

**Løn er instans #1:** `pay_periods` + `commission_snapshots` +
`salary_corrections` + `ensure_pay_periods`-cron.

Lag D får `kpi_periods` + `kpi_snapshots` + `kpi_corrections`. Lag F
kunne få `accounting_*` ved senere behov. Naming-konvention: `_periods`,
`_snapshots`, `_corrections` pr. domæne.

### 4.5 Audit-arkitektur

`stork_audit()` trigger på alle feature-tabeller. Audit_log er **ægte
immutable** (C4.1's BEFORE UPDATE/DELETE-trigger nægter altid).

**source_type 6-værdi enum** (CHECK constraint):

- `manual` — authenticated user via UI/API
- `cron` — pg_cron-job (session-var sat af cron_heartbeat_record)
- `webhook` — edge function via service-role
- `trigger_cascade` — fyret af parent trigger (`pg_trigger_depth() > 1`)
- `service_role` — direkte service-role API-kald (eller migration fra supabase_admin)
- `unknown` — fallback

Detection-prioritet i `stork_audit()`:

1. Session-var `stork.source_type` (eksplicit override)
2. `pg_trigger_depth() > 1` → `trigger_cascade`
3. `current_user IN ('service_role', 'supabase_admin')` → `service_role`
4. `auth.uid() IS NOT NULL` → `manual`
5. Fallback → `unknown`

**Berigelses-session-vars:**

- `stork.change_reason` — fri tekst for kontekst
- `stork.schema_version` — replay-stabilitet

**PII-filter-hook:** `audit_filter_values(schema, table, jsonb)` —
C2-stub returnerer values uændret. D2 omdefinerer til at hashe
`pii_level='direct'`-kolonner via SHA256.

**Audit-failure-policy:** Hvis `stork_audit()` RAISE'r, bobler det op
til main transaction → rollback. Compliance kræver vores adgangslog.

### 4.6 Permission-mønster — UI-styret, ikke kodet

Roller, hvad de må, hvilke teams de hører til — alt sammen konfiguration,
ikke kode. Permissions defineres i UI (lag D4 bygger `role_page_permissions`).

**For lag C-D's RPCs:** alle write-RPCs konsulterer `public.is_admin()`-
placeholder. C1-stub returnerer `false` indtil D4 omdefinerer den til at
læse `role_page_permissions`. Det betyder ingen RPCs virker effektivt
indtil D4 lander — by design.

**Hardkodede rolle-keys og bypass må aldrig forekomme.** Det er præcis
det 1.0's "8 ejer-bypass + 69 rolle-referencer" anti-pattern vi udfaser.

### 4.7 Key-immutable sales-tabel pattern (kommer i lag E)

Sales-tabel bygges i lag E. Dokumenteret som template-mønster i C4's README.

**Immutable felter:** `sale_id`, `employee_id`, `sale_datetime`, `source`
**Mutable felter (via SECURITY DEFINER):** `status`, `products_sold`,
`revenue`, `commission`, validation-felter

**Kurv-rettelser:** Klient retter sammensætning på pending salg →
sales-rækken ÆNDRES direkte. Audit-trail bevarer historikken via
`stork_audit()`. Efter lock håndteres forskelle som `salary_corrections`
med `reason='kurv_correction'`.

**Engangs-status-transition trigger:** Inline trigger pr. tabel
(rule of three — generic helper bygges først ved 3+ brugere).

### 4.8 Klassifikations-system (lag D1)

`data_field_definitions` registry:

| Felt                                      | Type          | Beskrivelse                                             |
| ----------------------------------------- | ------------- | ------------------------------------------------------- |
| `table_schema`+`table_name`+`column_name` | UNIQUE        | Kolonne-pr-kilde                                        |
| `category`                                | enum 5        | operationel/konfiguration/master_data/audit/raw_payload |
| `pii_level`                               | enum 3        | none/indirect/direct                                    |
| `retention_type`                          | enum 4        | time_based/event_based/legal/manual                     |
| `retention_value`                         | jsonb         | Struktur valideret pr. type                             |
| `match_role`                              | text          | Per kolonne-per-kilde (frit nu, lag E definerer)        |
| `purpose`                                 | text NOT NULL | Audit-kontekst                                          |

**retention_value-strukturer:**

- `time_based`: `{"max_days": positive integer}`
- `event_based`: `{"event": text, "days_after": non-negative integer}`
- `legal`: `{"max_days": positive integer}` (fast MAKS, ingen forlængelse)
- `manual`: `{"max_days": positive integer}` ELLER `{"event": text}`

Valideret via BEFORE INSERT/UPDATE-trigger.

---

## 5. Etablerede mønstre med eksempel

### 5.1 SECURITY DEFINER write-RPC

Standard pattern for mutationer på FORCE-RLS-tabeller:

```sql
CREATE OR REPLACE FUNCTION public.example_update(
  p_id uuid,
  p_value text,
  p_change_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'example_update: insufficient permissions'
      USING ERRCODE = '42501';
  END IF;
  IF p_change_reason IS NULL OR length(trim(p_change_reason)) = 0 THEN
    RAISE EXCEPTION 'example_update: change_reason er påkrævet';
  END IF;

  PERFORM set_config('stork.source_type', 'manual', true);
  PERFORM set_config('stork.change_reason', p_change_reason, true);
  PERFORM set_config('stork.allow_example_write', 'true', true);

  UPDATE public.example SET value = p_value WHERE id = p_id;
END;
$$;

REVOKE ALL ON FUNCTION public.example_update(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.example_update(uuid, text, text) TO authenticated;
```

**Tre regler:**

1. SECURITY DEFINER + `SET search_path = ''` + schema-qualified referencer
2. Permission-check + change_reason-validation FØR mutation
3. Tre session-vars (`source_type`, `change_reason`, tabel-specifik `allow_*_write`) FØR mutation

### 5.2 Append-only corrections med rollback via ny række

`salary_corrections` er IMMUTABLE. Rollback af correction X sker via ny
correction Z med `reason='cancellation_reversal'`, `amount = +original`.
Original X bliver der som historik.

Eksempel-flow:

- Cancellation Y indløber, amount 1000 DKK
- Salary_correction X oprettes: amount=-1000, reason='cancellation'
- Det viser sig Y var fejl
- Salary_correction Z oprettes: amount=+1000, reason='cancellation_reversal'

Net effekt: 0. Audit-trail bevarer alle tre rækker.

### 5.3 Cancellation-rollback via cancellation_reversal

Cancellations-tabellen er **kun matched_to_correction_id + matched_at
opdaterbar**. Resten blokeret af immutability-trigger.

Rollback sker IKKE ved at slette cancellation-rækken. Det sker ved at
oprette ny salary_correction med reason='cancellation_reversal'. Audit-
trail viser hele rejsen.

### 5.4 Cron-heartbeat + retry + idempotens + backfill

Standard pattern for pg_cron-jobs:

```sql
SELECT cron.schedule(
  'job_name',
  '0 1 * * *',
  $cron$
  DO $do$
  DECLARE
    v_started timestamptz := clock_timestamp();
    v_error text;
  BEGIN
    PERFORM set_config('stork.source_type', 'cron', true);
    PERFORM set_config('stork.change_reason', 'cron: <beskrivelse>', true);
    PERFORM set_config('stork.allow_<table>_write', 'true', true);

    -- Job-logik med idempotens-tjek (IF NOT EXISTS)
    -- Backfill ved at processere flere perioder (ikke kun "today")

    PERFORM public.cron_heartbeat_record(
      'job_name', '0 1 * * *', 'ok', NULL,
      (EXTRACT(EPOCH FROM (clock_timestamp() - v_started)) * 1000)::integer
    );
  EXCEPTION WHEN OTHERS THEN
    v_error := SQLERRM;
    PERFORM public.cron_heartbeat_record(
      'job_name', '0 1 * * *', 'failure', v_error,
      (EXTRACT(EPOCH FROM (clock_timestamp() - v_started)) * 1000)::integer
    );
    RAISE;  -- så pg_cron logger failure
  END;
  $do$;
  $cron$
);
```

**Heartbeat-failure-rows auditeres automatisk** via WHEN-trigger på
`cron_heartbeats` (kun failures, ikke successes — ellers audit-log
spam).

### 5.5 Session-var-konvention

Hver feature-tabel har eget skrivetilladelses-var:

| Tabel                  | Session-var                                |
| ---------------------- | ------------------------------------------ |
| pay_period_settings    | `stork.allow_pay_period_settings_write`    |
| pay_periods            | `stork.allow_pay_periods_write`            |
| commission_snapshots   | `stork.allow_commission_snapshots_write`   |
| salary_corrections     | `stork.allow_salary_corrections_write`     |
| cancellations          | `stork.allow_cancellations_write`          |
| data_field_definitions | `stork.allow_data_field_definitions_write` |

Plus globale session-vars sat af callere:

- `stork.source_type` — overrider auto-detection i `stork_audit()`
- `stork.change_reason` — beriger audit-row
- `stork.schema_version` — replay-stabilitet

---

## 6. Udskudte beslutninger

### 6.1 Dedup-detektion → lag E

**Beslutning:** Pattern dokumenteres som "dedup_key text NULL UNIQUE"
i README. Tabeller bygges i lag E pr. kilde med specifik dedup-strategi.

**Begrundelse:** 4 kilder har 4 forskellige strategier:

- Webhook-retry → `external_event_id`
- OPP-dubletter → `(opp_number, client_id)`
- Upload-dubletter → `(file_hash, row_index)`
- Manuel-registrering → ingen automatisk nøgle, manual review

Premature abstraktion ville matche 2-3 af 4. Pattern-doc + fitness-check
i lag D (scanner nye tabeller for dedup_key eller `-- no-dedup-key:
<reason>` opt-out) er bedre balance.

### 6.2 Email-provider → efter lag D

**Beslutning:** Cron-fejl skrives til audit_log + cron_heartbeats. Email/
Slack-notifikation udskydes til Mathias har valgt provider bevidst.

Indtil da: failures synlige via:

- `audit_log WHERE source_type = 'cron'`
- `public.cron_heartbeats_read()` RPC

### 6.3 Service_role_key til Vault → manuel handling

Mathias har bekræftet at service_role keys ikke kommer i kode/repo. De
forbliver i Supabase Vault og hentes via runtime-konfiguration. Pattern
detaljer falder i lag E når første edge function bygges.

### 6.4 product_campaign_overrides skæbne → lag E eller senere

Fra 1.0-undersøgelsen: pricing engine bruger product_campaign_overrides
som "reel forretningsregel, ikke rod". Lag E's pricing-engine afgør om
det integreres direkte eller normaliseres yderligere. Ikke afgjort nu.

### 6.5 Andre udskudte til-blev:

- `correct_pay_period_delete()` RPC — bygges hvis behov opstår (DELETE
  blokeret altid nu)
- TRUNCATE-blokering på immutable tabeller — overvejes ved første reel
  risiko (fitness-check kan dække)
- Workflow_events for pay_period UI-mellemstadier — lag D/E
- Generic `assert_status_engangs()` helper — bygges først ved 3+ brugere
- Sales-tabel — lag E. Pattern dokumenteret i C4's README

---

## 7. Fitness-checks der venter implementation i lag D

Disse er flagget gennem session 1 og skal lande som nye checks i
`scripts/fitness.mjs` senest i lag D6:

1. **Migrations sætter source_type + change_reason inden mutation**
   - Scan migration-filer for `INSERT INTO public\..*` uden forudgående
     `set_config('stork.source_type', ...)` og `set_config('stork.change_reason', ...)`
   - Fanger Finding 1 fra lag C-rapport fremover

2. **Dedup_key-pattern eller eksplicit opt-out**
   - Scan nye tabeller for `dedup_key text` kolonne
   - Eller `-- no-dedup-key: <reason>` kommentar i CREATE TABLE-blokken

3. **TRUNCATE-blokering på immutable tabeller**
   - Scan tabeller der har BEFORE UPDATE/DELETE-immutability-trigger
   - Skal også have BEFORE TRUNCATE-trigger der RAISE'r

4. **Cron-jobs sætter change_reason**
   - Scan `cron.job`-tabel (eller migration-files for `cron.schedule`)
   - Hver job-command skal have `set_config('stork.change_reason', ...)`

5. **DB-query RLS-fitness-check**
   - POST til Supabase Management API SQL-endpoint
   - Finder RLS-aktiverede tabeller uden policies (default deny er OK,
     men dokumentér det)
   - Kun hvis `SUPABASE_ACCESS_TOKEN` env er sat (skip ellers)
   - Bekræftet af Mathias som teknisk vej

6. **Migration-gate Phase 2-flip (D6)**
   - `MIGRATION_GATE_STRICT=true` i CI environment
   - Switch fra fil-baseret `classification.json` til DB-baseret
     `data_field_definitions`
   - Kræver D1.5's seed-step færdig + alle D5-tabeller klassificerede

---

## 8. D1.5 status — venter på Mathias' tre bekræftelser

D1 er færdig. D2 starter ikke før vi har afklaret D1.5 (seed-step).

### Mathias har spurgt om tre ting:

1. **Rækkefølge:** D1 → D1.5 → D2 → D3 → D4 → D5 → D6 (i stedet for min
   oprindelige plan med D6 som migration-gate-flip + seed kombineret).
2. **Arbejdsdeling for D1.5:** Claude producerer forslag til klassifikation
   af 76 keys (CSV/tabel format), Mathias retter, Claude skriver migration.
3. **LENIENT-default i D2's audit_filter_values():** Phase 1 (D2-D5):
   uklassificerede kolonner returneres uændret + log warning. Strict
   raise-mode aktiveres først efter D6.

### 3-gruppe-tilgang foreslået for D1.5

Når Mathias bekræfter rækkefølgen, leverer Claude en CSV med 76 keys
grupperet:

- **Gruppe 1 — Selvklare:** Kolonner hvor klassifikation er åbenlys
  (audit_log's id/occurred_at = audit/none, cron_heartbeats's job_name
  = operationel/none, m.fl.)

- **Gruppe 2 — Semantisk udledelig:** Claude foreslår klassifikation
  baseret på kolonnenavn + kontekst (actor_user_id = audit/indirect,
  created_by = \*/indirect). Mathias reviewer.

- **Gruppe 3 — Uafklaret:** Kolonner hvor PII-niveau, retention eller
  category kræver Mathias' forretningsinput (fx er `salary_corrections.
amount` indirect fordi mønster kan identificere person, eller none?
  Hvilken retention gælder for `commission_snapshots`?).

Når Mathias godkender hver gruppe, samles til ÉN migration der INSERTer
alle 76 rækker via `data_field_definition_upsert` (eller direkte INSERT
med session-var sat).

---

## 9. Reference

### 9.1 Migration-rækkefølge på remote

```
20260511151815  c1_rls_helpers_stub
20260511152603  c2_audit_template
20260511153246  c3_cron_skabelon
20260511165543  c4_pay_periods_template
20260511170429  c4_1_audit_log_immutability
20260511170951  d1_data_field_definitions
```

**Vigtig procedurel observation:** Supabase MCP's `apply_migration`
auto-genererer en timestamp uafhængigt af filnavnet. Vi UPDATE'r
`supabase_migrations.schema_migrations.version` bagefter til at matche
filnavnet. Pattern:

```sql
UPDATE supabase_migrations.schema_migrations
SET version = '<filename-timestamp>'
WHERE name = '<migration-name>'
  AND version <> '<filename-timestamp>';
```

### 9.2 Tabeller live på remote

| Tabel                    | Lag     | RLS | FORCE              | Policies                        | Triggers                                                        |
| ------------------------ | ------- | --- | ------------------ | ------------------------------- | --------------------------------------------------------------- |
| `audit_log`              | C2+C4.1 | ✓   | ✗ (skip-force-rls) | 0 (default deny)                | immutability + (audit on self)                                  |
| `cron_heartbeats`        | C3      | ✓   | ✗ (skip-force-rls) | 0 (default deny)                | WHEN-failure-audit                                              |
| `pay_period_settings`    | C4      | ✓   | ✓                  | 2 (select+update)               | set_updated_at + audit                                          |
| `pay_periods`            | C4      | ✓   | ✓                  | 3 (select+insert+update)        | lock_and_delete_check + on_period_lock + set_updated_at + audit |
| `commission_snapshots`   | C4      | ✓   | ✓                  | 1 (insert)                      | immutability + audit                                            |
| `salary_corrections`     | C4      | ✓   | ✓                  | 1 (insert)                      | validate_target + immutability + audit                          |
| `cancellations`          | C4      | ✓   | ✓                  | 2 (insert+update)               | immutability + audit                                            |
| `data_field_definitions` | D1      | ✓   | ✓                  | 4 (select+insert+update+delete) | validate_retention + set_updated_at + audit                     |

### 9.3 Functions live på remote (public schema)

| Function                                      | Lag  | Type                                    |
| --------------------------------------------- | ---- | --------------------------------------- |
| `current_employee_id()`                       | C1   | Stub returning NULL                     |
| `is_admin()`                                  | C1   | Stub returning false                    |
| `audit_filter_values(schema, table, jsonb)`   | C2   | Stub returning input uændret            |
| `audit_log_read(...)`                         | C2   | RPC med is_admin()-check                |
| `stork_audit()`                               | C2   | Trigger function (auto-attached)        |
| `audit_log_immutability_check()`              | C4.1 | Trigger function                        |
| `cron_heartbeat_record(...)`                  | C3   | RPC                                     |
| `cron_heartbeats_read()`                      | C3   | RPC med is_admin()-check                |
| `set_updated_at()`                            | C4   | Genbrugelig trigger function            |
| `pay_period_for_date(date)`                   | C4   | Helper for cron                         |
| `pay_period_settings_update(...)`             | C4   | RPC                                     |
| `pay_periods_lock_and_delete_check()`         | C4   | Trigger function                        |
| `on_period_lock()`                            | C4   | Stub trigger function (lag D/E udvider) |
| `commission_snapshots_immutability_check()`   | C4   | Trigger function                        |
| `salary_corrections_validate_target()`        | C4   | Trigger function                        |
| `salary_corrections_immutability_check()`     | C4   | Trigger function                        |
| `cancellations_immutability_check()`          | C4   | Trigger function                        |
| `data_field_definitions_validate_retention()` | D1   | Trigger function                        |
| `data_field_definition_upsert(...)`           | D1   | RPC                                     |
| `data_field_definition_delete(...)`           | D1   | RPC                                     |

### 9.4 Extensions live på remote

- `pg_cron` 1.6.4 (pg_catalog) — fra C3
- `btree_gist` 1.7 (extensions) — fra C3
- `pg_net` 0.20.0 (extensions) — fra C3
- `pgcrypto` 1.3 (extensions) — Supabase default
- `uuid-ossp` 1.1 (extensions) — Supabase default
- `pg_stat_statements` 1.11 (extensions) — Supabase default
- `supabase_vault` 0.3.1 (vault) — Supabase default

### 9.5 Repo-tabel — vigtige filer

| Sti                                          | Indhold                                                                                                              |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `supabase/migrations/*.sql`                  | 6 migrations applied til remote                                                                                      |
| `supabase/classification.json`               | 88 keys for migration-gate Phase 1                                                                                   |
| `supabase/schema.sql`                        | Placeholder — populates ved første `pnpm schema:pull`                                                                |
| `supabase/README.md`                         | RLS-, audit-, cron-, period-lock-, klassifikations-template-docs                                                     |
| `scripts/migration-gate.mjs`                 | Phase 1 parser (warn-only)                                                                                           |
| `scripts/fitness.mjs`                        | 5 starter-checks                                                                                                     |
| `scripts/types-check.sh` + `schema-check.sh` | Drift-detection med placeholder-skip                                                                                 |
| `packages/types/src/database.ts`             | Placeholder — `pnpm types:generate` overskriver                                                                      |
| `.github/workflows/ci.yml`                   | format + lint + typecheck + test + build + migration:check + fitness + (auth-conditional) types:check + schema:check |
| `.github/BRANCH_PROTECTION.md`               | Aktiveret af Mathias via gh CLI på main                                                                              |
| `tsconfig.base.json`                         | Fuld strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes                                                  |

### 9.6 Lokale udvikler-kommandoer

```bash
# Setup
pnpm install                  # Installerer alt inkl. supabase CLI
pnpm exec supabase login      # Engangs auth pr. dev-maskine
pnpm supabase:link            # Engangs link til remote

# Daglig brug
pnpm dev                      # Vite på port 8080
pnpm lint                     # Turbo: alle workspaces
pnpm typecheck                # Turbo: TS strict på alle
pnpm test                     # Turbo: vitest
pnpm build                    # Turbo: vite build
pnpm format / format:check    # Prettier
pnpm migration:check          # Phase 1 warn-mode
pnpm fitness                  # 5 starter-checks

# Supabase
pnpm types:generate           # supabase gen types → packages/types/src/database.ts
pnpm types:check              # Drift detection
pnpm schema:pull              # supabase db dump → supabase/schema.sql
pnpm schema:check             # Drift detection
```

### 9.7 CI-pipeline rækkefølge

På `pull_request` mod main:

1. Install pnpm + Node 22 + dependencies (frozen-lockfile)
2. Prettier check
3. ESLint
4. TypeScript
5. Vitest
6. Build
7. Migration-gate (Phase 1 warn-mode, ubetinget)
8. Fitness (ubetinget)
9. Supabase link (kun hvis `SUPABASE_ACCESS_TOKEN` secret)
10. Types drift check (kun hvis token)
11. Schema drift check (kun hvis token)

CI er **required status check** på main pr. branch-protection. Linear
history + no force-push + no deletion enforced.

---

## 10. Hvor session 2 fortsætter

**Næste skridt:** Mathias bekræfter (eller udfordrer) de tre punkter i §8.
Når bekræftet:

1. Claude producerer D1.5-klassifikations-forslag som markdown-tabel med
   76 keys grupperet (selvklar / semantisk udledelig / uafklaret).
2. Mathias går igennem og retter.
3. Claude skriver D1.5-migration der INSERT'er den endelige klassifikation.
4. Apply + verifikation + commit + push.
5. Stop, rapport, vent på godkendelse → D2.

**Status-snapshot for ny session at læse:**

```bash
# Verificer at du er korrekt sted
git log --oneline main..HEAD | head -5
# Forventet output (top): 71b453f D1: data_field_definitions klassifikations-tabel

# Verificer remote er i sync
git ls-remote origin claude/review-phase-zero-plan-oW5Cg

# Lokale checks alle grønne?
pnpm migration:check && pnpm fitness && pnpm format:check
```

Hvis alle tre kommandoer er grønne, er state korrekt.

---

**Slut på handoff fra session 1.** Næste session må gerne udfordre alt i
dette dokument hvis det giver mening teknisk — det er en startposition,
ikke en bibel.
