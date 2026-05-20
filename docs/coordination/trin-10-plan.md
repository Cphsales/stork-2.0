# Trin 10 — Plan V1

**Pakke:** §4 trin 10 — Klient-skabelon + felt-definitioner
**Krav-dok:** `docs/coordination/trin-10-krav-og-data.md` (PR #63, commit `8c3c7b9`)
**Branch:** `claude/trin-10-plan-v3`
**Status:** V1 — klar til Codex plan-review-runde 1
**Dato:** 2026-05-20

---

## Recon-historik

Tidligere plan-forsøg på `claude/trin-10-plan-v2`-branchen (V1-V3, commits `f8d110e`, `8b4033e`, `a2ca60c`) byggede fejlagtigt på D5's pre-T1 `public.clients`-tabel. T1's drop-migration (`20260514120000_t1_drop_public.sql:36-47`) fjerner hele D5's public-schema; ingen post-T1 migration genskaber den. Codex runde 3 fangede dette som TEKNISK-BLOKERING. Denne plan starter fra bunden med korrekt schema-grundlag: `core_identity.clients` etableres fra nul, ikke ALTER på ikke-eksisterende tabel.

---

## Verificerede afhængigheder

Recon-først per `docs/coordination/overvaagning/code-overvaagning.md`. Hver påstand om eksisterende artefakt har file:linje-reference.

| Afhængighed (RPC / tabel / kolonne / migration)                                                        | Verificeret fra (file:linje)                                                                                   | Note (signatur, struktur, invariant)                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schema-arkitektur (3 core\_\*-schemas)                                                                 | `supabase/migrations/20260514120001_t1_schemas_and_defaults.sql:11-22`                                         | `core_compliance` (audit, klassifikation, anonymization), `core_identity` (medarbejdere, identitets-master, org-træ, teams, **roller, klienter**, lokationer), `core_money` (salg, pricing, vagter, lønperiode). Master-plan §1.11 placerer klienter i core_identity.                                                                                                                                   |
| T1-drop af D5's public-schema                                                                          | `supabase/migrations/20260514120000_t1_drop_public.sql:32-92`                                                  | Dropper `public.clients`, `public.client_field_definitions`, `public.client_upsert`, `public.client_field_definition_upsert`, `public.clients_validate_fields`, `public.audit_filter_values`, `public.is_admin()`, `public.stork_audit()` etc. INGEN post-T1 migration genskaber clients.                                                                                                               |
| `core_compliance.data_field_definitions` (tabel)                                                       | `supabase/migrations/20260514120005_t1_data_field_definitions.sql:9-30`                                        | `id, table_schema, table_name, column_name, category text CHECK IN ('operationel','konfiguration','master_data','audit','raw_payload'), pii_level CHECK IN ('none','indirect','direct'), retention_type CHECK IN ('time_based','event_based','legal','manual'), retention_value jsonb, match_role text, purpose text NOT NULL, created_at, updated_at`. UNIQUE (table_schema, table_name, column_name). |
| `core_compliance.data_field_definitions` retention-types udvidet til 'permanent'                       | `supabase/migrations/20260514170003_c001_retention_not_null.sql:42-46`                                         | CHECK udvidet: `('time_based', 'event_based', 'legal', 'manual', 'permanent')`. retention_type SET NOT NULL. Permanent → retention_value NULL.                                                                                                                                                                                                                                                          |
| Retention-types efter legal-drop                                                                       | `supabase/migrations/20260514180500_d1_d2_drop_legal_convert_rows.sql:49-51`                                   | CHECK: `(retention_type is null or retention_type in ('time_based', 'event_based', 'manual', 'permanent'))`. Legal fjernet (mathias-afgoerelse 2026-05-14). retention_type drop not null.                                                                                                                                                                                                               |
| `core_compliance.is_permanent_allowed(p_table_schema, p_table_name, p_column_name)` allowlist          | `supabase/migrations/20260514180400_d1b_is_permanent_allowed.sql:14-46`                                        | IMMUTABLE-funktion med hardkodet VALUES-blok. Trin 10 SKAL tilføje `core_identity.clients` + `core_identity.client_field_definitions` til allowlist hvis retention_type='permanent' skal bruges.                                                                                                                                                                                                        |
| `core_compliance.validate_permanent_classification()` trigger                                          | `supabase/migrations/20260514180600_d1c_validate_permanent_classification.sql:14-31`                           | BEFORE INSERT/UPDATE på data_field_definitions. Raiser hvis retention_type='permanent' AND ikke i allowlist.                                                                                                                                                                                                                                                                                            |
| `core_compliance.audit_filter_values(p_schema, p_table, p_values jsonb)`                               | `supabase/migrations/20260514120006_t1_audit_filter_values.sql:9-86`                                           | Walker top-level kolonner. pii_level='direct' → sha256-hash. LENIENT-default ved ukendt schema/tabel/kolonne; strict via `stork.audit_filter_strict='true'`. **Ingen clients-special-case** (D5's omskrivning blev droppet med T1). Trin 10 SKAL omskrive til at walke `clients.fields jsonb`.                                                                                                          |
| `core_compliance.stork_audit()` trigger-funktion                                                       | Refereret af alle T9-tabeller (`20260518000004_t9_client_node_placements.sql:55` etc.)                         | Generel audit-trigger der bruges `AFTER INSERT OR UPDATE OR DELETE` på alle write-tabeller. Skriver til `core_compliance.audit_log` via `audit_filter_values`.                                                                                                                                                                                                                                          |
| `core_compliance.set_updated_at()` trigger-funktion                                                    | `supabase/migrations/20260514120005_t1_data_field_definitions.sql:45-54`                                       | Standard updated_at-trigger. `before update for each row`.                                                                                                                                                                                                                                                                                                                                              |
| `core_identity.client_node_placements` (tabel)                                                         | `supabase/migrations/20260518000004_t9_client_node_placements.sql:13-24`                                       | `id, client_id uuid NOT NULL (UDEN FK — Plan V6 Valg 4: FK tilføjes i trin 10), node_id FK → org_nodes, effective_from/to date, applied_at, created_by_pending_change_id`.                                                                                                                                                                                                                              |
| T9-supplement `client_node_placements_select` policy                                                   | `supabase/migrations/20260520000000_t9_supplement.sql:665-683`                                                 | `using (is_admin() OR node_id = ANY(acl_subtree_org_nodes_at(current_employee_id(), coalesce(current_setting('stork.t9_read_at_date',true)::date, current_date))))`. **Trin 10 ændrer ikke policy** — kun tilføjer FK.                                                                                                                                                                                  |
| `core_identity._apply_client_place(p_payload jsonb, p_pending_change_id uuid)`                         | `supabase/migrations/20260518000004_t9_client_node_placements.sql:86-119`                                      | SECURITY DEFINER apply-handler. INSERT i client_node_placements.                                                                                                                                                                                                                                                                                                                                        |
| `core_identity._apply_client_close(p_payload jsonb, p_pending_change_id uuid)`                         | `supabase/migrations/20260518000004_t9_client_node_placements.sql:123-147`                                     | SECURITY DEFINER apply-handler. UPDATE effective_to.                                                                                                                                                                                                                                                                                                                                                    |
| `core_identity.client_node_place(p_client_id, p_node_id, p_effective_from)` wrapper                    | `supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:140-170`                                        | Wrapper-RPC med `has_permission('client_placements', 'manage', true)`. Pre-checker node_id = team. Opretter pending_change.                                                                                                                                                                                                                                                                             |
| `core_identity.client_node_close(p_client_id, p_effective_from)` wrapper                               | `supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:173-192`                                        | Wrapper-RPC med `has_permission('client_placements', 'manage', true)`.                                                                                                                                                                                                                                                                                                                                  |
| `core_identity.has_permission(p_page_key, p_tab_key default null, p_can_edit default false) → boolean` | `supabase/migrations/20260518000010_t9_seed_owners.sql:15-80`                                                  | Tab → page → area → legacy `role_page_permissions` fallback. STABLE SECURITY INVOKER.                                                                                                                                                                                                                                                                                                                   |
| `core_identity.is_admin()`                                                                             | Refereret af T9-supplement linje 670, T9-tabeller. Definition i T2 (`20260514130000_t2_superadmin_floor.sql`). | Hardkodet superadmin-check. T9 introducerede `has_permission` som UI-baseret erstatning; D5's `public.is_admin()` blev droppet af T1.                                                                                                                                                                                                                                                                   |
| `core_identity.permission_areas` seedede rækker                                                        | `supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:14-24`                                | identity (1), permissions (2), org_structure (3), compliance (10), audit (11), anonymization (12), break_glass (13), operations (20), system (99). `client_placements` ligger i `org_structure`.                                                                                                                                                                                                        |
| `core_identity.permission_pages` (FK area_id, UNIQUE (area_id, name))                                  | `supabase/migrations/20260518000005_t9_permission_elements.sql:32-41`                                          | Tabel for page-niveau.                                                                                                                                                                                                                                                                                                                                                                                  |
| `core_identity.permission_tabs` (FK page_id, UNIQUE (page_id, name))                                   | `supabase/migrations/20260518000005_t9_permission_elements.sql:58-67`                                          | Tabel for tab-niveau.                                                                                                                                                                                                                                                                                                                                                                                   |
| `core_identity.role_permission_grants` (role + en af area_id/page_id/tab_id)                           | `supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql:94-140` + grant-tabellen i T9 Step 7  | Primær grant-tabel. has_permission læser herfra først. ON CONFLICT-key: `(role_id, coalesce(area_id::text,''), coalesce(page_id::text,''), coalesce(tab_id::text,''))`.                                                                                                                                                                                                                                 |
| `core_identity.current_employee_id()`                                                                  | Refereret af has_permission og T9-supplement policy                                                            | Returnerer current_employee_id baseret på `auth.uid()`.                                                                                                                                                                                                                                                                                                                                                 |
| T9-smoke-test `t9_placements.sql` BLOCK T5/T6/T7                                                       | `supabase/tests/smoke/t9_placements.sql:137-200`                                                               | Bruger client_id-værdier i `_apply_client_place`-payload uden tilsvarende clients-fixture. FK-aktivering brækker T5/T7.                                                                                                                                                                                                                                                                                 |
| T9-smoke-test `t9_backdated_historical_traversal.sql` BLOCK 3                                          | `supabase/tests/smoke/t9_backdated_historical_traversal.sql:165-305`                                           | Linje 167, 172, 185, 276 INSERT'er direkte i client_node_placements + kalder `_apply_client_place` med tilfældige client_id'er. Brækker ved FK.                                                                                                                                                                                                                                                         |
| T9-smoke-test `t9_public_wrapper_rpcs.sql` T2                                                          | `supabase/tests/smoke/t9_public_wrapper_rpcs.sql:83-93`                                                        | Forventer 22023 fra team-only pre-check FØR FK valideres; ikke berørt.                                                                                                                                                                                                                                                                                                                                  |
| T9-mønster for ny tabel i core_identity                                                                | `supabase/migrations/20260518000001_t9_org_nodes.sql:25-41`                                                    | `create table` + `enable rls` + `force rls` + `revoke all from public/anon/service_role` + `grant select to authenticated` + `create policy *_select` + `create trigger *_audit AFTER INSERT/UPDATE/DELETE EXECUTE FUNCTION core_compliance.stork_audit()`.                                                                                                                                             |
| T9 RPC-mønster                                                                                         | `supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:9-44`                                           | SECURITY DEFINER + `set search_path = ''` + `if not has_permission(...) then raise 42501` + `set_config('stork.source_type'/'change_reason')` + body + `revoke execute from public, anon` + `grant execute to authenticated`.                                                                                                                                                                           |
| FK_COVERAGE_EXEMPTIONS i fitness-script                                                                | `scripts/fitness.mjs` (eksisterer; konkret allowlist-indhold verificeres ved build)                            | `client_id` på `client_node_placements` står i allowlist; fjernes i trin 10 efter FK tilføjet.                                                                                                                                                                                                                                                                                                          |

---

## Formål

Denne pakke leverer: trin 10 etablerer klient-skabelonen som forretnings-fundament i `core_identity`: tabel + felt-definitioner + aktiv/inaktiv-livscyklus + logo + FK fra T9's klient-til-team-tilknytning + permission-baserede write-RPC'er. Klient-tabellen findes IKKE før denne pakke (T1 droppede D5's pre-fundament); alt etableres greenfield i core_identity.

Hvis fund under review ikke bringer os tættere på dette: G-nummer, ikke blocker.

---

## Scope

**I scope:**

- Master-plan-paragraffer: §1.8 (Klient-skabelon — rettes), §4 trin 10 (rettes)
- Krav-dok-leverancer §3.1-§3.4 (klient-CRUD + felt-definitions-CRUD + felt-værdier + klient-til-team-FK)
- Etablering af `core_identity.clients`-tabel fra bunden (med is_active + logo + audit-trigger + RLS)
- Etablering af `core_identity.client_field_definitions`-tabel fra bunden (uden match_role)
- Udvidelse af `core_compliance.is_permanent_allowed`-allowlist med de to nye tabeller
- Klassifikation i `core_compliance.data_field_definitions` for nye kolonner
- Omskrivning af `core_compliance.audit_filter_values` med clients-fields-jsonb-walking (genskab D5's special-case-mønster i nyt schema)
- FK `core_identity.client_node_placements.client_id` → `core_identity.clients.id`
- Opdatering af T9-smoke-tests så de seeder clients-fixtures FØR FK aktiveres
- SECURITY DEFINER RPC'er: client_upsert (uden logo), client_set_active, client_field_definition_upsert (uden p_match_role), client_logo_set, client_logo_clear, client_logo_get, client_get, client_list, client_field_definitions_list
- `clients_validate_fields`-trigger (LENIENT-default + strict via session-var)
- Seed permissions i grant-modellen (`permission_pages` + `permission_tabs` + `role_permission_grants` under `org_structure`-area)
- Master-plan §1.8 + §4 trin 10 rettelser (krav-dok §7)
- Fitness-script-opdatering (fjern client_id fra FK_COVERAGE_EXEMPTIONS)
- 5 smoke-tests

**IKKE i scope:**

- Klient-data-migration fra 1.0 (krav-dok §5.1)
- Match-mekanik / match-rolle-koncept (krav-dok §5.2)
- Frontend-pages / admin-UI'er
- Lønarter med klient-formler (trin 13)
- Salg som funktionalitet (trin 14)
- Pricing pr. klient
- T6-anonymisering af clients (krav-dok §2.5.1: clients anonymiseres aldrig — opnås naturligt fordi tabellen ikke har anonymized_at-kolonne)

---

## Strukturel beslutning

### Klient-tabel i `core_identity` (matcher master-plan §1.11)

**Begrundelse:** Master-plan §1.11 placerer klienter i core_identity. T9's `client_node_placements` ligger allerede i core_identity. Konsistent skema-placering.

### Logo-lagring: bytea-kolonner på `clients`-tabellen (ikke Supabase Storage)

**Begrundelse:** Supabase Storage er ikke etableret i Stork 2.0 (ingen `storage.objects`-referencer i migrations). Klient-logoer er små (typisk 10-50 KB) og 1:1 med klient. Postgres TOAST håndterer det fint på det forventede volumen (5-20 klienter). Forward-compatible: hvis Stork senere får Storage-infrastruktur, kan logo migreres uden at ændre forretnings-flow.

### Logo-håndtering via separate RPC'er (ikke parametre på client_upsert)

**Begrundelse:** Default-null på logo-parametre i client_upsert ville utilsigtet slette logo ved almindelig UPDATE (datatab). Dedikeret `client_logo_set` + `client_logo_clear` + `client_logo_get` adskiller logo-håndtering eksplicit.

### `clients` + `client_field_definitions` får retention_type='permanent' (kræver allowlist-udvidelse)

**Begrundelse:** Krav-dok §2.5.1 + §2.5.2 siger klient-rækken bevares evigt; client_field_definitions er konfig-tabel der også bevares evigt. `permanent` matcher denne semantik bedst. D1b-allowlist skal udvides for at retention-validate-trigger ikke blokerer.

### Aktiv/inaktiv som dedikeret bool-kolonne (`is_active`)

**Begrundelse:** Krav-dok §2.5.2 "kun aktiv/inaktiv. Ingen mellem-tilstande." Matches af bool. Konsistent med T9's `permission_areas.is_active` etc.

### `client_field_definitions` er global (ikke pr-klient)

**Begrundelse:** Krav-dok §2.3 forretningsgang dækkes både af global og pr-klient. Mathias-bekræftet 2026-05-20: "ligeglad med måden listerne sættes op så længe forretningsgangen overholdes". Global er enklere arkitektur (key UNIQUE; ingen client_id-FK på definitions); pr. klient kan fields jsonb indeholde subset af definerede keys.

---

## Mathias' afgørelser (input til denne plan)

- **Afgørelse 1:** Trin 10 skal respektere nuværende kode og opsætning (chat-validering 2026-05-20).
  - **Begrundelse:** Konsistens med eksisterende T1 schema-arkitektur + T9 permission-model + T9-supplement-policy.
  - **Plan-konsekvens:** core_identity-placering; grant-model frem for legacy; T9-supplement-policy uændret; alle nye RPC'er bruger has_permission.

- **Afgørelse 2:** Felt-listerne kan sættes op teknisk frit så længe forretningsgangen overholdes (chat-validering 2026-05-20).
  - **Begrundelse:** "Ligeglad med måden listerne sættes op."
  - **Plan-konsekvens:** Global `client_field_definitions` valgt frem for pr-klient (enklere; forretningsgang opfyldes via fields jsonb pr. klient).

- **Afgørelse 3:** Trin 10 scope-præcisering (mathias-afgoerelser 2026-05-20).
  - **Begrundelse:** Migration-leverance halv uden 1.0-adgang; match-rolle for tidlig design.
  - **Plan-konsekvens:** Ingen migration-discovery-script. Ingen match_role-kolonne. Master-plan §1.8 + §4 trin 10 rettes.

- **Afgørelse 4:** Trin 10 forretnings-ramme (mathias-afgoerelser 2026-05-20).
  - **Begrundelse:** 7 forretnings-sandheder låst.
  - **Plan-konsekvens:** Hver sandhed har konkret RPC eller tabel-felt.

- **Afgørelse 5:** "Start forfra med ny" (chat-validering 2026-05-20 efter Codex V3 strukturel fabrikation-fund).
  - **Begrundelse:** Tidligere V1-V3-plan-forsøg byggede på droppede D5-tabeller; CREATE TABLE fra bunden er rigtigt.
  - **Plan-konsekvens:** Denne plan starter fra "clients-tabel eksisterer ikke" og leverer alle artefakter greenfield.

---

## Implementations-rækkefølge

Hver step: Type, Hvad, Eksakt indhold (pseudo-SQL), Afhængigheder, Migration-fil, Risiko.

### T10.1 — CREATE TABLE `core_identity.clients`

- **Type:** migration (CREATE TABLE + RLS + audit-trigger)
- **Hvad:** Etabler clients-tabel i core_identity med is_active + logo-kolonner. FORCE RLS, audit-trigger, set_updated_at-trigger.
- **Eksakt indhold:**

  ```sql
  create table core_identity.clients (
    id uuid primary key default gen_random_uuid(),
    name text not null check (length(trim(name)) > 0),
    fields jsonb not null default '{}'::jsonb,
    is_active boolean not null default true,
    logo_bytes bytea,
    logo_content_type text,
    logo_filename text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint clients_logo_consistency check (
      (logo_bytes is null and logo_content_type is null and logo_filename is null)
      or
      (logo_bytes is not null and logo_content_type is not null and logo_filename is not null)
    )
  );

  comment on table core_identity.clients is
    'Trin 10: klient-master. name er identifikator; fields jsonb indeholder pr-klient værdier per client_field_definitions. is_active toggle erstatter DELETE (krav-dok §2.5.2). Logo som bytea (krav-dok §2.4). Klient anonymiseres ikke (krav-dok §2.5.1) — derfor ingen anonymized_at-kolonne.';

  create index clients_active_idx on core_identity.clients (id) where is_active = true;

  create trigger clients_set_updated_at
    before update on core_identity.clients
    for each row execute function core_compliance.set_updated_at();

  create trigger clients_audit
    after insert or update or delete on core_identity.clients
    for each row execute function core_compliance.stork_audit();

  alter table core_identity.clients enable row level security;
  alter table core_identity.clients force row level security;

  revoke all on table core_identity.clients from public, anon, service_role;
  grant select on table core_identity.clients to authenticated;

  -- SELECT-policy: has_permission-baseret. Read-RPC'er har deres egen permission-check.
  create policy clients_select on core_identity.clients
    for select to authenticated
    using (core_identity.has_permission('clients', null, false));

  -- INSERT/UPDATE/DELETE: kun via RPC der sætter session-var.
  create policy clients_insert on core_identity.clients
    for insert to authenticated
    with check (current_setting('stork.allow_clients_write', true) = 'true');

  create policy clients_update on core_identity.clients
    for update to authenticated
    using (current_setting('stork.allow_clients_write', true) = 'true')
    with check (current_setting('stork.allow_clients_write', true) = 'true');

  -- DELETE: ingen policy = default deny. Inaktiver via is_active=false, ikke DELETE.
  ```

- **Afhængigheder:** T1 (core_identity schema), T1 (stork_audit + set_updated_at), T9 (has_permission), T10.13 (permission-seed skal være på plads så SELECT-policy ikke tilbageholder).
- **Migration-fil:** `supabase/migrations/<ts>_t10_clients_table.sql`
- **Risiko:** lav (greenfield CREATE; ingen eksisterende data). Rollback: `drop table core_identity.clients cascade`.

### T10.2 — CREATE TABLE `core_identity.client_field_definitions`

- **Type:** migration (CREATE TABLE + RLS + audit-trigger)
- **Hvad:** Etabler global felt-definitions-tabel. Ingen match_role-kolonne (krav-dok §5.2 udskyder).
- **Eksakt indhold:**

  ```sql
  create table core_identity.client_field_definitions (
    id uuid primary key default gen_random_uuid(),
    key text not null unique check (length(trim(key)) > 0),
    display_name text not null check (length(trim(display_name)) > 0),
    field_type text not null check (length(trim(field_type)) > 0),
    required boolean not null default false,
    pii_level text not null check (pii_level in ('none', 'indirect', 'direct')),
    display_order integer not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  comment on table core_identity.client_field_definitions is
    'Trin 10: global registry af klient-felt-definitioner. key er jsonb-property-name i clients.fields; UNIQUE globalt. field_type er fri-tekst (UI håndhæver format). pii_level styrer hash i audit_filter_values for clients.fields-jsonb-walking. Udfasede felter sættes is_active=false (ikke DELETE).';

  create index client_field_definitions_active_idx
    on core_identity.client_field_definitions (key, display_order)
    where is_active = true;

  create index client_field_definitions_direct_pii_idx
    on core_identity.client_field_definitions (key)
    where pii_level = 'direct' and is_active = true;

  create trigger client_field_definitions_set_updated_at
    before update on core_identity.client_field_definitions
    for each row execute function core_compliance.set_updated_at();

  create trigger client_field_definitions_audit
    after insert or update or delete on core_identity.client_field_definitions
    for each row execute function core_compliance.stork_audit();

  alter table core_identity.client_field_definitions enable row level security;
  alter table core_identity.client_field_definitions force row level security;

  revoke all on table core_identity.client_field_definitions from public, anon, service_role;
  grant select on table core_identity.client_field_definitions to authenticated;

  create policy client_field_definitions_select on core_identity.client_field_definitions
    for select to authenticated
    using (core_identity.has_permission('client_field_definitions', null, false));

  create policy client_field_definitions_insert on core_identity.client_field_definitions
    for insert to authenticated
    with check (current_setting('stork.allow_client_field_definitions_write', true) = 'true');

  create policy client_field_definitions_update on core_identity.client_field_definitions
    for update to authenticated
    using (current_setting('stork.allow_client_field_definitions_write', true) = 'true')
    with check (current_setting('stork.allow_client_field_definitions_write', true) = 'true');

  -- DELETE: ingen policy = default deny. Inaktiver via is_active=false.
  ```

- **Afhængigheder:** T1 (core_identity), T1 (triggers), T9 (has_permission), T10.13
- **Migration-fil:** `supabase/migrations/<ts>_t10_client_field_definitions_table.sql`
- **Risiko:** lav. Rollback: drop table.

### T10.3 — Udvid `core_compliance.is_permanent_allowed`-allowlist

- **Type:** migration (CREATE OR REPLACE FUNCTION)
- **Hvad:** Tilføj `core_identity.clients` + `core_identity.client_field_definitions` til allowlist så de kan klassificeres som `permanent` retention.
- **Eksakt indhold:**

  ```sql
  create or replace function core_compliance.is_permanent_allowed(
    p_table_schema text,
    p_table_name text,
    p_column_name text
  ) returns boolean
  language sql immutable parallel safe set search_path = ''
  as $$
    select exists (
      select 1
      from (values
        -- Eksisterende rækker bevares (jf. D1b)
        ('core_compliance', 'audit_log',                   null::text),
        ('core_compliance', 'anonymization_mappings',      null::text),
        ('core_compliance', 'anonymization_state',         null::text),
        ('core_compliance', 'break_glass_operation_types', null::text),
        ('core_compliance', 'data_field_definitions',      null::text),
        ('core_compliance', 'superadmin_settings',         null::text),
        ('core_identity',   'roles',                       null::text),
        ('core_identity',   'role_page_permissions',       null::text),
        ('core_identity',   'employee_active_config',      null::text),
        ('core_identity',   'employees',                   'id'),
        ('core_identity',   'employees',                   'role_id'),
        ('core_identity',   'employees',                   'created_at'),
        ('core_identity',   'employees',                   'updated_at'),
        ('core_money',      'pay_period_settings',         null::text),
        -- Trin 10 (nye)
        ('core_identity',   'clients',                     null::text),
        ('core_identity',   'client_field_definitions',    null::text)
      ) as allowlist(t_schema, t_name, t_column)
      where allowlist.t_schema = p_table_schema
        and allowlist.t_name = p_table_name
        and (allowlist.t_column is null or allowlist.t_column = p_column_name)
    );
  $$;
  ```

  Komplet VALUES-blok kopieret fra D1b + 2 nye rækker. CREATE OR REPLACE bevarer signatur. Allowlist-ændring er kode-commit + review per master-plan rettelse 29.

- **Afhængigheder:** D1b (eksisterende allowlist)
- **Migration-fil:** `supabase/migrations/<ts>_t10_is_permanent_allowed_extend.sql`
- **Risiko:** lav. Rollback: re-create D1b's signatur.

### T10.4 — Klassifikation i `core_compliance.data_field_definitions`

- **Type:** migration (INSERT i data_field_definitions)
- **Hvad:** Tilføj klassifikation for alle 9 kolonner på `core_identity.clients` + alle 9 kolonner på `core_identity.client_field_definitions`.
- **Eksakt indhold:**

  ```sql
  select set_config('stork.source_type', 'migration', false);
  select set_config('stork.change_reason',
    'T10.4: klassifikation for core_identity.clients + client_field_definitions', false);
  select set_config('stork.allow_data_field_definitions_write', 'true', false);

  insert into core_compliance.data_field_definitions
    (table_schema, table_name, column_name, category, pii_level,
     retention_type, retention_value, match_role, purpose)
  values
    -- core_identity.clients (9 kolonner)
    ('core_identity', 'clients', 'id',                'master_data', 'none',
      'permanent', null, null, 'Klient PK; bevares evigt for FK-integritet'),
    ('core_identity', 'clients', 'name',              'master_data', 'direct',
      'permanent', null, null, 'Klient-navn (UI-required). hashes i audit via direct-PII'),
    ('core_identity', 'clients', 'fields',            'master_data', 'indirect',
      'permanent', null, null, 'jsonb med klient-felt-værdier; direct-keys i fields hashes pr. client_field_definitions via audit_filter_values clients-special-case'),
    ('core_identity', 'clients', 'is_active',         'master_data', 'none',
      'permanent', null, null, 'Aktiv-flag; false = inaktiv (historik bevares)'),
    ('core_identity', 'clients', 'logo_bytes',        'master_data', 'none',
      'permanent', null, null, 'Klient-logo binær (bytea); ingen PII'),
    ('core_identity', 'clients', 'logo_content_type', 'master_data', 'none',
      'permanent', null, null, 'MIME-type for logo'),
    ('core_identity', 'clients', 'logo_filename',     'master_data', 'none',
      'permanent', null, null, 'Original filnavn ved upload'),
    ('core_identity', 'clients', 'created_at',        'master_data', 'none',
      'permanent', null, null, 'INSERT-tid'),
    ('core_identity', 'clients', 'updated_at',        'master_data', 'none',
      'permanent', null, null, 'Sidste mutation'),
    -- core_identity.client_field_definitions (9 kolonner)
    ('core_identity', 'client_field_definitions', 'id',            'konfiguration', 'none',
      'permanent', null, null, 'Field-definition PK'),
    ('core_identity', 'client_field_definitions', 'key',           'konfiguration', 'none',
      'permanent', null, null, 'jsonb-property-name i clients.fields; UNIQUE globalt'),
    ('core_identity', 'client_field_definitions', 'display_name',  'konfiguration', 'none',
      'permanent', null, null, 'UI-label for feltet'),
    ('core_identity', 'client_field_definitions', 'field_type',    'konfiguration', 'none',
      'permanent', null, null, 'Fri-tekst type-identifier (text/email/phone/url/...); UI håndhæver format'),
    ('core_identity', 'client_field_definitions', 'required',      'konfiguration', 'none',
      'permanent', null, null, 'Om feltet skal være sat ved INSERT (UI-validering)'),
    ('core_identity', 'client_field_definitions', 'pii_level',     'konfiguration', 'none',
      'permanent', null, null, 'PII-niveau for jsonb-key. direct hashes i audit_filter_values'),
    ('core_identity', 'client_field_definitions', 'display_order', 'konfiguration', 'none',
      'permanent', null, null, 'UI-sortering'),
    ('core_identity', 'client_field_definitions', 'is_active',     'konfiguration', 'none',
      'permanent', null, null, 'Aktiv-flag; false = udfaset'),
    ('core_identity', 'client_field_definitions', 'created_at',    'konfiguration', 'none',
      'permanent', null, null, 'INSERT-tid'),
    ('core_identity', 'client_field_definitions', 'updated_at',    'konfiguration', 'none',
      'permanent', null, null, 'Sidste mutation');
  ```

- **Afhængigheder:** T10.1, T10.2 (tabeller skal eksistere), T10.3 (allowlist skal være udvidet)
- **Migration-fil:** `supabase/migrations/<ts>_t10_classify.sql`
- **Risiko:** lav (data_field_definitions har INSERT-policy via session-var). Rollback: DELETE matching rows.

### T10.5 — Omskrive `core_compliance.audit_filter_values` med clients-fields-jsonb-walking

- **Type:** migration (CREATE OR REPLACE FUNCTION)
- **Hvad:** Genskab D5's clients-special-case-mønster: walker `clients.fields` jsonb og hashes hver key der har `pii_level='direct'` i `client_field_definitions`. Resten af T1-logikken bevares uændret.
- **Eksakt indhold:**

  ```sql
  create or replace function core_compliance.audit_filter_values(
    p_schema text,
    p_table text,
    p_values jsonb
  )
  returns jsonb
  language plpgsql stable security definer set search_path = ''
  as $$
  declare
    v_result jsonb := p_values;
    v_def record;
    v_strict boolean := current_setting('stork.audit_filter_strict', true) = 'true';
    v_has_defs boolean;
    v_key text;
    v_fields jsonb;
    v_field_key text;
    v_field_value jsonb;
  begin
    if p_values is null then
      return null;
    end if;

    -- Tjek om tabellen har klassificering.
    select exists (
      select 1 from core_compliance.data_field_definitions
      where table_schema = p_schema and table_name = p_table
    ) into v_has_defs;

    if not v_has_defs then
      if v_strict then
        raise exception 'audit_filter_values: ingen klassificering for %.%', p_schema, p_table
          using errcode = 'P0001';
      else
        raise warning 'audit_filter_values: ingen klassificering for %.% — værdier bevaret uændret', p_schema, p_table;
        return p_values;
      end if;
    end if;

    -- Walker top-level kolonner og hashes direct-PII (uændret T1-logik).
    for v_def in
      select column_name, pii_level
      from core_compliance.data_field_definitions
      where table_schema = p_schema and table_name = p_table
    loop
      if p_values ? v_def.column_name then
        if v_def.pii_level = 'direct' then
          v_result := jsonb_set(
            v_result,
            array[v_def.column_name],
            to_jsonb(
              'sha256:' ||
              encode(extensions.digest((p_values->>v_def.column_name)::text, 'sha256'), 'hex')
            )
          );
        end if;
      end if;
    end loop;

    -- Trin 10 clients-special-case: walker clients.fields jsonb og hashes direct-PII keys
    -- pr. client_field_definitions.
    if p_schema = 'core_identity'
       and p_table = 'clients'
       and v_result ? 'fields'
       and jsonb_typeof(v_result -> 'fields') = 'object' then
      v_fields := v_result -> 'fields';
      for v_field_key in
        select key from core_identity.client_field_definitions
        where pii_level = 'direct' and is_active = true
      loop
        if v_fields ? v_field_key then
          v_field_value := v_fields -> v_field_key;
          if jsonb_typeof(v_field_value) is distinct from 'null' then
            v_fields := jsonb_set(
              v_fields,
              array[v_field_key],
              to_jsonb('sha256:' || encode(extensions.digest(v_field_value::text, 'sha256'), 'hex'))
            );
          end if;
        end if;
      end loop;
      v_result := jsonb_set(v_result, array['fields'], v_fields);
    end if;

    -- Tjek for ukendte kolonner (uændret T1-logik).
    for v_key in select jsonb_object_keys(p_values) loop
      if not exists (
        select 1 from core_compliance.data_field_definitions d
        where d.table_schema = p_schema
          and d.table_name = p_table
          and d.column_name = v_key
      ) then
        if v_strict then
          raise exception 'audit_filter_values: ukendt kolonne %.%.% i input', p_schema, p_table, v_key
            using errcode = 'P0001';
        else
          raise warning 'audit_filter_values: ukendt kolonne %.%.% — værdi bevaret uændret', p_schema, p_table, v_key;
        end if;
      end if;
    end loop;

    return v_result;
  end;
  $$;

  comment on function core_compliance.audit_filter_values(text, text, jsonb) is
    'Trin 10: T1-logik + core_identity.clients-special-case (jsonb-walking af fields for direct-PII keys pr. client_field_definitions). LENIENT-default; strict via stork.audit_filter_strict.';
  ```

- **Afhængigheder:** T10.2 (client_field_definitions skal eksistere så funktionen kan referere den), T10.4 (klassifikation seedet)
- **Migration-fil:** `supabase/migrations/<ts>_t10_audit_filter_values.sql`
- **Risiko:** mellem (omskriver eksisterende funktion brugt af alle audit-triggers). Rollback: re-create T1's signatur.

### T10.6 — `clients_validate_fields`-trigger (LENIENT default)

- **Type:** migration (CREATE FUNCTION + trigger)
- **Hvad:** BEFORE INSERT/UPDATE-trigger på `core_identity.clients`. WARNING ved ukendte keys i fields jsonb. Strict via session-var.
- **Eksakt indhold:**

  ```sql
  create or replace function core_identity.clients_validate_fields()
  returns trigger
  language plpgsql stable security definer set search_path = ''
  as $$
  declare
    v_strict boolean;
    v_unknown_keys text[];
  begin
    if new.fields is null or jsonb_typeof(new.fields) <> 'object' then
      return new;
    end if;

    v_strict := coalesce(
      nullif(current_setting('stork.clients_fields_strict', true), ''),
      'false'
    ) = 'true';

    select array_agg(n.key order by n.key)
      into v_unknown_keys
      from jsonb_each(new.fields) as n(key, value)
      where not exists (
        select 1 from core_identity.client_field_definitions cfd
        where cfd.key = n.key and cfd.is_active = true
      );

    if v_unknown_keys is not null and array_length(v_unknown_keys, 1) > 0 then
      if v_strict then
        raise exception 'clients_validate_fields: ukendte/inaktive keys i fields: % (stork.clients_fields_strict=true)',
          v_unknown_keys using errcode = '23514';
      else
        raise warning 'clients_validate_fields: ukendte/inaktive keys i fields (LENIENT - INSERT/UPDATE accepteret): %',
          v_unknown_keys;
      end if;
    end if;

    return new;
  end;
  $$;

  comment on function core_identity.clients_validate_fields() is
    'Trin 10: BEFORE INSERT/UPDATE-trigger på core_identity.clients. LENIENT-default WARNING ved ukendte/inaktive keys i fields. Strict via stork.clients_fields_strict=true.';

  create trigger clients_validate_fields
    before insert or update on core_identity.clients
    for each row execute function core_identity.clients_validate_fields();
  ```

- **Afhængigheder:** T10.1 (clients-tabel), T10.2 (client_field_definitions)
- **Migration-fil:** samme som T10.5 eller separat
- **Risiko:** lav (trigger blokerer ikke i LENIENT-default). Rollback: drop trigger + function.

### T10.7 — FK fra `client_node_placements.client_id` til `clients.id`

- **Type:** migration (ALTER TABLE ADD CONSTRAINT)
- **Hvad:** Tilføj FK efter T10.7a-test-fixes er gennemført.
- **Eksakt indhold:**

  ```sql
  alter table core_identity.client_node_placements
    add constraint client_node_placements_client_id_fkey
      foreign key (client_id) references core_identity.clients(id)
      on delete restrict;
  ```

- **Afhængigheder:** T10.1, **T10.7a** (T9-smoke-tests skal være opdateret FØR FK aktiveres)
- **Migration-fil:** `supabase/migrations/<ts>_t10_client_node_placements_fk.sql`
- **Risiko:** lav efter T10.7a. Rollback: drop constraint.

### T10.7a — Opdater T9-smoke-tests med clients-fixture

- **Type:** test-fil-ændring (ikke migration)
- **Hvad:** Tre T9-smoke-tests INSERT'er `client_id`-værdier uden clients-fixture. Når T10.7 aktiveres, brækker testene. T10.7a seeder en `core_identity.clients`-fixture FØR hver berørt INSERT/\_apply_client_place-kald.
- **Konkrete ændringer:**

  **`supabase/tests/smoke/t9_placements.sql`** (T5, T6, T7, T9-blokke ca. linje 137-200):
  - FØR T5's `_apply_client_place`-kald (linje 138): seed clients-fixture med `v_client_id`.
  - T6 bruger `gen_random_uuid()` direkte — skift til separat seedet `v_client_id_for_dept_test` med fixture FØR.

  **`supabase/tests/smoke/t9_backdated_historical_traversal.sql`** (BLOCK 3 ca. linje 165-305):
  - Seed clients-fixture med `v_client_id` FØR linje 167's INSERT.

  **`supabase/tests/smoke/t9_public_wrapper_rpcs.sql`**: ingen ændring (T2 fejler i team-only pre-check FØR FK).

  Pattern (én blok per test, FØR første client_node_placements-write):

  ```sql
  -- Trin 10-forberedelse: seed client-fixture så FK accepterer placement-INSERTs
  perform set_config('stork.source_type', 'manual', true);
  perform set_config('stork.change_reason', 'test fixture for client_node_placements', true);
  perform set_config('stork.allow_clients_write', 'true', true);
  insert into core_identity.clients (id, name) values (v_client_id, 'Test Klient T9-smoke')
    on conflict (id) do nothing;
  ```

- **Afhængigheder:** T10.1 (clients-tabel skal eksistere)
- **Migration-fil:** N/A (test-fil-ændring)
- **Risiko:** lav.

### T10.8 — `client_upsert` RPC (uden logo-parametre)

- **Type:** migration (CREATE FUNCTION)
- **Hvad:** SECURITY DEFINER write-RPC for clients. has_permission-baseret. Logo-felter rør'es IKKE her (separate RPC'er i T10.11 forhindrer datatab).
- **Eksakt indhold:**

  ```sql
  create or replace function core_identity.client_upsert(
    p_name text,
    p_fields jsonb,
    p_change_reason text,
    p_is_active boolean default true,
    p_client_id uuid default null
  ) returns uuid
  language plpgsql security definer set search_path = ''
  as $$
  declare
    v_id uuid;
  begin
    if not core_identity.has_permission('clients', 'manage', true) then
      raise exception 'client_upsert: permission_denied' using errcode = '42501';
    end if;
    if p_change_reason is null or length(trim(p_change_reason)) = 0 then
      raise exception 'client_upsert: change_reason er paakraevet' using errcode = '22023';
    end if;
    if p_name is null or length(trim(p_name)) = 0 then
      raise exception 'client_upsert: name er paakraevet' using errcode = '22023';
    end if;

    perform set_config('stork.source_type', 'manual', true);
    perform set_config('stork.change_reason', p_change_reason, true);
    perform set_config('stork.allow_clients_write', 'true', true);

    if p_client_id is null then
      insert into core_identity.clients (name, fields, is_active)
      values (p_name, coalesce(p_fields, '{}'::jsonb), p_is_active)
      returning id into v_id;
    else
      update core_identity.clients
        set name = p_name,
            fields = coalesce(p_fields, '{}'::jsonb),
            is_active = p_is_active
            -- logo-felter rør IKKE — håndteres af client_logo_set/clear
       where id = p_client_id
       returning id into v_id;
      if v_id is null then
        raise exception 'client_upsert: client % findes ikke', p_client_id using errcode = 'P0002';
      end if;
    end if;

    return v_id;
  end;
  $$;

  revoke all on function core_identity.client_upsert(text, jsonb, text, boolean, uuid) from public, anon;
  grant execute on function core_identity.client_upsert(text, jsonb, text, boolean, uuid) to authenticated;
  ```

- **Afhængigheder:** T10.1, T10.13 (permission-row seeded)
- **Migration-fil:** `supabase/migrations/<ts>_t10_client_upsert_rpc.sql`
- **Risiko:** lav.

### T10.9 — `client_set_active` RPC

- **Type:** migration (CREATE FUNCTION)
- **Hvad:** Toggler is_active uden at røre øvrige felter. Adskilt RPC fordi UI-flowet er distinkt fra "redigér".
- **Eksakt indhold:**

  ```sql
  create or replace function core_identity.client_set_active(
    p_client_id uuid,
    p_is_active boolean,
    p_change_reason text
  ) returns void
  language plpgsql security definer set search_path = ''
  as $$
  begin
    if not core_identity.has_permission('clients', 'manage', true) then
      raise exception 'client_set_active: permission_denied' using errcode = '42501';
    end if;
    if p_change_reason is null or length(trim(p_change_reason)) = 0 then
      raise exception 'client_set_active: change_reason er paakraevet' using errcode = '22023';
    end if;

    perform set_config('stork.source_type', 'manual', true);
    perform set_config('stork.change_reason', p_change_reason, true);
    perform set_config('stork.allow_clients_write', 'true', true);

    update core_identity.clients
      set is_active = p_is_active
     where id = p_client_id;
    if not found then
      raise exception 'client_set_active: client % findes ikke', p_client_id using errcode = 'P0002';
    end if;
  end;
  $$;

  revoke all on function core_identity.client_set_active(uuid, boolean, text) from public, anon;
  grant execute on function core_identity.client_set_active(uuid, boolean, text) to authenticated;
  ```

- **Afhængigheder:** T10.1, T10.13
- **Migration-fil:** samme som T10.8
- **Risiko:** lav.

### T10.10 — `client_field_definition_upsert` RPC (uden p_match_role)

- **Type:** migration (CREATE FUNCTION)
- **Hvad:** SECURITY DEFINER write-RPC for client_field_definitions. has_permission('client_field_definitions', 'manage', true).
- **Eksakt indhold:**

  ```sql
  create or replace function core_identity.client_field_definition_upsert(
    p_key text,
    p_display_name text,
    p_field_type text,
    p_pii_level text,
    p_change_reason text,
    p_required boolean default false,
    p_display_order integer default 0,
    p_is_active boolean default true,
    p_field_id uuid default null
  ) returns uuid
  language plpgsql security definer set search_path = ''
  as $$
  declare
    v_id uuid;
  begin
    if not core_identity.has_permission('client_field_definitions', 'manage', true) then
      raise exception 'client_field_definition_upsert: permission_denied' using errcode = '42501';
    end if;
    if p_change_reason is null or length(trim(p_change_reason)) = 0 then
      raise exception 'client_field_definition_upsert: change_reason er paakraevet' using errcode = '22023';
    end if;
    if p_pii_level not in ('none', 'indirect', 'direct') then
      raise exception 'client_field_definition_upsert: pii_level skal vaere none/indirect/direct' using errcode = '22023';
    end if;

    perform set_config('stork.source_type', 'manual', true);
    perform set_config('stork.change_reason', p_change_reason, true);
    perform set_config('stork.allow_client_field_definitions_write', 'true', true);

    if p_field_id is null then
      insert into core_identity.client_field_definitions
        (key, display_name, field_type, required, pii_level, display_order, is_active)
      values
        (p_key, p_display_name, p_field_type, p_required, p_pii_level, p_display_order, p_is_active)
      returning id into v_id;
    else
      update core_identity.client_field_definitions
        set key = p_key,
            display_name = p_display_name,
            field_type = p_field_type,
            required = p_required,
            pii_level = p_pii_level,
            display_order = p_display_order,
            is_active = p_is_active
       where id = p_field_id
       returning id into v_id;
      if v_id is null then
        raise exception 'client_field_definition_upsert: field % findes ikke', p_field_id using errcode = 'P0002';
      end if;
    end if;

    return v_id;
  end;
  $$;

  revoke all on function core_identity.client_field_definition_upsert(text, text, text, text, text, boolean, integer, boolean, uuid) from public, anon;
  grant execute on function core_identity.client_field_definition_upsert(text, text, text, text, text, boolean, integer, boolean, uuid) to authenticated;
  ```

- **Afhængigheder:** T10.2, T10.13
- **Migration-fil:** `supabase/migrations/<ts>_t10_client_field_definition_upsert_rpc.sql`
- **Risiko:** lav.

### T10.11 — Logo-RPC'er (`client_logo_set` + `client_logo_clear` + `client_logo_get`)

- **Type:** migration (CREATE FUNCTION × 3)
- **Hvad:** Dedikerede RPC'er for logo. Set kræver alle tre felter ikke-NULL (matcher T10.1's consistency-CHECK). Clear nulstiller alle tre atomisk. Get returnerer bytea + metadata.
- **Eksakt indhold:**

  ```sql
  create or replace function core_identity.client_logo_set(
    p_client_id uuid,
    p_logo_bytes bytea,
    p_logo_content_type text,
    p_logo_filename text,
    p_change_reason text
  ) returns void
  language plpgsql security definer set search_path = ''
  as $$
  begin
    if not core_identity.has_permission('clients', 'manage', true) then
      raise exception 'client_logo_set: permission_denied' using errcode = '42501';
    end if;
    if p_change_reason is null or length(trim(p_change_reason)) = 0 then
      raise exception 'client_logo_set: change_reason er paakraevet' using errcode = '22023';
    end if;
    if p_logo_bytes is null or p_logo_content_type is null or p_logo_filename is null then
      raise exception 'client_logo_set: alle tre logo-felter er paakraevede (brug client_logo_clear for at fjerne)' using errcode = '22023';
    end if;

    perform set_config('stork.source_type', 'manual', true);
    perform set_config('stork.change_reason', p_change_reason, true);
    perform set_config('stork.allow_clients_write', 'true', true);

    update core_identity.clients
      set logo_bytes = p_logo_bytes,
          logo_content_type = p_logo_content_type,
          logo_filename = p_logo_filename
     where id = p_client_id;
    if not found then
      raise exception 'client_logo_set: client % findes ikke', p_client_id using errcode = 'P0002';
    end if;
  end;
  $$;

  create or replace function core_identity.client_logo_clear(
    p_client_id uuid,
    p_change_reason text
  ) returns void
  language plpgsql security definer set search_path = ''
  as $$
  begin
    if not core_identity.has_permission('clients', 'manage', true) then
      raise exception 'client_logo_clear: permission_denied' using errcode = '42501';
    end if;
    if p_change_reason is null or length(trim(p_change_reason)) = 0 then
      raise exception 'client_logo_clear: change_reason er paakraevet' using errcode = '22023';
    end if;

    perform set_config('stork.source_type', 'manual', true);
    perform set_config('stork.change_reason', p_change_reason, true);
    perform set_config('stork.allow_clients_write', 'true', true);

    update core_identity.clients
      set logo_bytes = null,
          logo_content_type = null,
          logo_filename = null
     where id = p_client_id;
    if not found then
      raise exception 'client_logo_clear: client % findes ikke', p_client_id using errcode = 'P0002';
    end if;
  end;
  $$;

  create or replace function core_identity.client_logo_get(p_client_id uuid)
  returns table (logo_bytes bytea, logo_content_type text, logo_filename text)
  language plpgsql stable security invoker set search_path = ''
  as $$
  begin
    if not core_identity.has_permission('clients', null, false) then
      raise exception 'client_logo_get: permission_denied' using errcode = '42501';
    end if;
    return query
      select c.logo_bytes, c.logo_content_type, c.logo_filename
        from core_identity.clients c
       where c.id = p_client_id and c.logo_bytes is not null;
  end; $$;

  revoke all on function core_identity.client_logo_set(uuid, bytea, text, text, text) from public, anon;
  revoke all on function core_identity.client_logo_clear(uuid, text) from public, anon;
  revoke all on function core_identity.client_logo_get(uuid) from public, anon;
  grant execute on function core_identity.client_logo_set(uuid, bytea, text, text, text) to authenticated;
  grant execute on function core_identity.client_logo_clear(uuid, text) to authenticated;
  grant execute on function core_identity.client_logo_get(uuid) to authenticated;
  ```

- **Afhængigheder:** T10.1 (logo-kolonner + consistency-CHECK), T10.13
- **Migration-fil:** `supabase/migrations/<ts>_t10_client_logo_rpcs.sql`
- **Risiko:** lav.

### T10.12 — Read-RPC'er (`client_get`, `client_list`, `client_field_definitions_list`)

- **Type:** migration (CREATE FUNCTION × 3)
- **Hvad:** SECURITY INVOKER read-RPC'er bag has_permission. Returnerer non-logo-felter (logo via dedikeret get).
- **Eksakt indhold:**

  ```sql
  create or replace function core_identity.client_get(p_client_id uuid)
  returns table (
    id uuid,
    name text,
    fields jsonb,
    is_active boolean,
    logo_content_type text,
    logo_filename text,
    has_logo boolean,
    created_at timestamptz,
    updated_at timestamptz
  ) language plpgsql stable security invoker set search_path = ''
  as $$
  begin
    if not core_identity.has_permission('clients', null, false) then
      raise exception 'client_get: permission_denied' using errcode = '42501';
    end if;
    return query
      select c.id, c.name, c.fields, c.is_active,
             c.logo_content_type, c.logo_filename,
             c.logo_bytes is not null,
             c.created_at, c.updated_at
        from core_identity.clients c
       where c.id = p_client_id;
  end; $$;

  create or replace function core_identity.client_list()
  returns table (
    id uuid, name text, is_active boolean,
    has_logo boolean, created_at timestamptz, updated_at timestamptz
  ) language plpgsql stable security invoker set search_path = ''
  as $$
  begin
    if not core_identity.has_permission('clients', null, false) then
      raise exception 'client_list: permission_denied' using errcode = '42501';
    end if;
    return query
      select c.id, c.name, c.is_active, c.logo_bytes is not null,
             c.created_at, c.updated_at
        from core_identity.clients c
       order by c.name asc;
  end; $$;

  create or replace function core_identity.client_field_definitions_list(p_include_inactive boolean default false)
  returns setof core_identity.client_field_definitions
  language plpgsql stable security invoker set search_path = ''
  as $$
  begin
    if not core_identity.has_permission('client_field_definitions', null, false) then
      raise exception 'client_field_definitions_list: permission_denied' using errcode = '42501';
    end if;
    return query
      select * from core_identity.client_field_definitions
       where p_include_inactive or is_active = true
       order by display_order, key;
  end; $$;

  revoke all on function core_identity.client_get(uuid) from public, anon;
  revoke all on function core_identity.client_list() from public, anon;
  revoke all on function core_identity.client_field_definitions_list(boolean) from public, anon;
  grant execute on function core_identity.client_get(uuid) to authenticated;
  grant execute on function core_identity.client_list() to authenticated;
  grant execute on function core_identity.client_field_definitions_list(boolean) to authenticated;
  ```

- **Afhængigheder:** T10.1, T10.2, T10.13
- **Migration-fil:** `supabase/migrations/<ts>_t10_client_read_rpcs.sql`
- **Risiko:** lav.

### T10.13 — Seed permissions i grant-modellen

- **Type:** migration (INSERT i permission_pages + permission_tabs + role_permission_grants)
- **Hvad:** Tilføj `clients` + `client_field_definitions` pages under `org_structure`-area; manage-tab pr. page; superadmin grants.
- **Eksakt indhold:**

  ```sql
  select set_config('stork.source_type', 'migration', false);
  select set_config('stork.change_reason',
    'T10.13: seed permissions for trin 10 RPCs i grant-modellen', false);

  -- 1. Pages under org_structure-area
  with org_area as (
    select id from core_identity.permission_areas where name = 'org_structure'
  )
  insert into core_identity.permission_pages (area_id, name)
  select org_area.id, page_name
  from org_area, (values ('clients'), ('client_field_definitions')) as p(page_name)
  on conflict (area_id, name) do nothing;

  -- 2. Tabs: 'manage' for hver ny page
  insert into core_identity.permission_tabs (page_id, name)
  select p.id, 'manage'
  from core_identity.permission_pages p
  where p.name in ('clients', 'client_field_definitions')
  on conflict (page_id, name) do nothing;

  -- 3. Superadmin grants på tab-niveau
  insert into core_identity.role_permission_grants
    (role_id, area_id, page_id, tab_id, can_access, can_write, visibility)
  select
    (select id from core_identity.roles where name = 'superadmin'),
    null, null, t.id,
    true, true, 'all'
  from core_identity.permission_tabs t
  join core_identity.permission_pages p on p.id = t.page_id
  where p.name in ('clients', 'client_field_definitions') and t.name = 'manage'
  on conflict (role_id, coalesce(area_id::text, ''),
              coalesce(page_id::text, ''), coalesce(tab_id::text, ''))
  do nothing;
  ```

- **Afhængigheder:** T9 migration 9 (grant-modellen + `org_structure`-area), T9 (`superadmin`-rolle)
- **Migration-fil:** `supabase/migrations/<ts>_t10_seed_permissions.sql`
- **Risiko:** lav (idempotent ON CONFLICT). Rollback: DELETE i omvendt rækkefølge.

### T10.14 — Master-plan-rettelser (jf. krav-dok §7)

- **Type:** docs-ændring (i samme PR som migrations)
- **Hvad:** Ret §1.8 + §4 trin 10 så match-rolle / crm_match_id / migration-leverance fjernes. Tilføj is_active + logo. Tilføj rettelse-entry i Appendix C.
- **Konkrete tekst-ændringer (skitse):**
  - §1.8 erstattes med: "Klient er driftens grundenhed. Stor variation i felter pr. klient — derfor felt-bag, ikke felt-eksplosion. Klient lever i core_identity.clients (id, name, fields jsonb, is_active, logo). Klient-felt-definitions-registry globalt: key, display-navn, type, required, pii-niveau, display-rækkefølge, is_active. Validerings-trigger advarer ved ukendte jsonb-keys (LENIENT-default; strict-mode via session-var). Audit-PII-filter har special-case for jsonb felt-bag: walker keys og hasher hver med pii_level='direct'. Klient anonymiseres ikke; livscyklus = aktiv/inaktiv. Match-mekanik udskudt til data-indgang-pakke."
  - §4 trin 10-række: erstat hele cellen med: "Klient-skabelon (core_identity.clients + client_field_definitions + logo + is_active + FK fra client_node_placements + has_permission-RPCs)". Migration-tekst og crm_match_id-tekst fjernes.
  - Appendix C: tilføj rettelse-entry 2026-05-20 med kort beskrivelse + reference til mathias-afgoerelser "Trin 10 scope-præcisering" og denne plan.
- **Afhængigheder:** ingen — committes parallelt med migrations
- **Migration-fil:** N/A (docs)
- **Risiko:** lav. Rollback: git revert.

### T10.15 — Smoke-tests (5 stk)

- **Type:** test-filer
- **Hvad:** Fem smoke-tests dækker centrale flows.
- **Test-filer:**

  | Test-fil                                                 | Hvad verificeres                                                                                                                                                                                                                                     |
  | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `supabase/tests/smoke/t10_client_lifecycle.sql`          | client_upsert (INSERT + UPDATE), client_set_active toggle, client_get returnerer korrekt is_active. has_permission-spærring uden permission-row. is_active toggle bevarer øvrige felter.                                                             |
  | `supabase/tests/smoke/t10_client_field_definitions.sql`  | client_field_definition_upsert (INSERT + UPDATE), is_active toggle, client_field_definitions_list respekterer p_include_inactive. **Audit-PII-hashing:** insert med pii_level='direct' key i fields → audit_log har sha256-hash.                     |
  | `supabase/tests/smoke/t10_client_logo.sql`               | client_logo_set + client_logo_get + client_logo_clear. **Assert client_upsert UPDATE af name/fields bevarer logo_bytes uændret** (read før+efter; sammenlign). consistency-CHECK blokerer partiel logo. client_logo_set fejler hvis ét felt er NULL. |
  | `supabase/tests/smoke/t10_client_node_placements_fk.sql` | FK virker: INSERT med ikke-eksisterende client_id fejler. DELETE af klient med åbne placements fejler RESTRICT.                                                                                                                                      |
  | `supabase/tests/smoke/t10_clients_validate_fields.sql`   | LENIENT-default: unknown key i fields → warning, INSERT accepteret. Strict-mode (`stork.clients_fields_strict='true'`): unknown key → exception.                                                                                                     |

- **Afhængigheder:** alle migrations i T10.1-T10.13
- **Migration-fil:** test-filer
- **Risiko:** lav.

### T10.16 — Fitness-script-opdatering

- **Type:** script-ændring
- **Hvad:** Fjern `client_node_placements.client_id` fra `FK_COVERAGE_EXEMPTIONS` i `scripts/fitness.mjs`. Verificér `pnpm fitness` returnerer grønt.
- **Afhængigheder:** T10.7 (FK skal være tilføjet)
- **Risiko:** lav.

---

## Fundament-tjek-passeret

| Tjek                                                           | Status | Reference                                                                                                                                                                   |
| -------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hver write-RPC har GRANT + INSERT/UPDATE-policy + session-var  | ja     | T10.8, T10.9, T10.10, T10.11 — `stork.allow_clients_write`/`allow_client_field_definitions_write` + `revoke/grant execute` + has_permission                                 |
| Hver SELECT-policy bred nok til legitime læsere                | ja     | T10.1, T10.2 — has_permission('clients'/'client_field_definitions', null, false). T9-supplement's eksisterende ACL-scoped policy på client_node_placements bevares uændret. |
| Eksempel-row verificeret gennem flow                           | ja     | T10.15 smoke-tests dækker INSERT + UPDATE + read-RPC + permission-spærring + audit-PII-hashing + logo-preserve + FK + LENIENT/strict                                        |
| Plan-detaljer eksplicit (ingen TBD / Code afgør / overladelse) | ja     | Alle 16 steps har eksakt SQL/pseudo-SQL. Ingen "kan tilføjes senere"-noter.                                                                                                 |

---

## Test-konsekvens

| Test-fil                            | Hvad verificeres                                                                                           | Forventet status |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------- |
| `t10_client_lifecycle.sql`          | client_upsert + client_set_active + client_get + has_permission-spærring + is_active bevarer øvrige felter | grøn             |
| `t10_client_field_definitions.sql`  | client_field_definition_upsert (uden p_match_role) + list-RPC + audit-PII-hashing for fields-keys          | grøn             |
| `t10_client_logo.sql`               | logo set/clear/get + assert client_upsert bevarer logo + consistency-CHECK + set fejler ved NULL i ét felt | grøn             |
| `t10_client_node_placements_fk.sql` | FK afviser ikke-eksisterende client_id; ON DELETE RESTRICT                                                 | grøn             |
| `t10_clients_validate_fields.sql`   | LENIENT-default WARN; strict-mode raise                                                                    | grøn             |

Eksisterende tests opdateret i T10.7a:

- `t9_placements.sql` — seedet clients-fixture FØR T5/T7/T9-blokke
- `t9_backdated_historical_traversal.sql` — seedet clients-fixture FØR BLOCK 3
- `t9_public_wrapper_rpcs.sql` — ingen ændring (T2 fejler i pre-check FØR FK)

---

## Build-fase halt-håndtering

- **Forventede WORKAROUND-kandidater:** ingen forventet.
- **Forventede PLAN-AFVIGELSE-scenarier:**
  - Hvis T1-audit_filter_values' STABLE-modifier blokerer mig fra at læse client_field_definitions (immutability-issue), kan jeg ende med at skifte til VOLATILE — PLAN-AFVIGELSE med G-nummer-forslag.
  - Hvis et T9-test bruger client_id i et flow jeg ikke har spottet i recon → PLAN-AFVIGELSE med STOP og recon-først-gentag.
  - Hvis pnpm fitness rammer andre exemption-entries der ikke findes i recon → markeres som PLAN-AFVIGELSE.
- **Kritiske invarianter der ikke må brydes:**
  - FORCE ROW LEVEL SECURITY bevares på alle nye tabeller
  - audit-trigger-dækning på alle write-tabeller
  - clients_validate_fields-trigger med LENIENT-default + strict-via-session-var
  - audit_filter_values' clients-special-case (jsonb-walking for direct-PII keys)
  - change_reason-disciplin (`stork.change_reason` påkrævet ved alle writes)
  - has_permission-checks ER write-gate (ikke kun policy-fallback)
  - T9-supplement's `client_node_placements_select` policy uændret

---

## Optimerings-hypoteser (V5.3 — valgfri)

- **Hypotese 1:** Logo-MIME-validering kunne håndhæves som CHECK constraint på `logo_content_type` (`IN ('image/png', 'image/jpeg', 'image/svg+xml')`) frem for app-niveau. Codex kan rejse som OPTIMERING-FORSLAG.
- **Hypotese 2:** `client_list` kunne tilbyde valgfri filter på is_active (p_include_inactive default false). Codex kan rejse som ADOPT i build.
- **Hypotese 3:** `core_compliance.audit_filter_values`'s clients-special-case kan ekstraheres til en generel "jsonb-walking via field-definition-tabel"-mekanik for fremtidige jsonb-felter. Ikke implementeret nu (premature abstraction).

---

## Risiko + kompensation

| Migration                               | Værste-case                                                         | Sandsynlighed                                                                          | Rollback                    |
| --------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------- |
| T10.1 (CREATE clients-tabel)            | Audit-trigger fejler pga. manglende klassifikation                  | lav (T10.4 seedede klassifikation i samme PR; audit_filter_values har LENIENT-default) | drop table cascade          |
| T10.2 (CREATE client_field_definitions) | Samme som T10.1                                                     | lav                                                                                    | drop table cascade          |
| T10.3 (allowlist-udvidelse)             | Allowlist-format ændret af senere migration                         | lav (D1b-format stabilt)                                                               | re-create D1b's signatur    |
| T10.4 (klassifikation INSERT)           | validate_permanent_classification fejler hvis T10.3 ikke kørt først | lav (afhængighed eksplicit)                                                            | DELETE matching rows        |
| T10.5 (omskriv audit_filter_values)     | Eksisterende audit-flow brækker                                     | mellem (omskriver kerne-funktion)                                                      | re-create T1's signatur     |
| T10.6 (clients_validate_fields trigger) | Trigger blokerer legitime writes                                    | lav (LENIENT-default)                                                                  | drop trigger + function     |
| T10.7 (FK)                              | T9-tests brækker                                                    | lav efter T10.7a                                                                       | drop constraint             |
| T10.7a (test-fixture-seed)              | Side-effekt i andre T9-tests                                        | lav (kun ekstra INSERT)                                                                | git revert                  |
| T10.8-T10.12 (RPC'er)                   | Signatur-konflikt med tidligere version                             | lav (greenfield; ingen tidligere RPC i core_identity-schema)                           | drop function               |
| T10.13 (permission-seed)                | INSERT fejler pga. manglende area/role                              | lav (T9-migration 9 har seedede); ON CONFLICT idempotent                               | DELETE i omvendt rækkefølge |
| T10.14 (master-plan-rettelser)          | Tekst-rettelse rammer Appendix C-tabel forkert                      | lav                                                                                    | git revert                  |
| T10.15 (smoke-tests)                    | Test rammer flow jeg ikke har spottet                               | lav (recon-først dækkede T9-test-mønster)                                              | revert test-fil             |
| T10.16 (fitness-script)                 | Allowlist-entry-formatet er ikke som forventet                      | lav (verificeres ved build; STOP hvis afvigelse)                                       | revert script-ændring       |

**Kompensation generelt:** Hver migration er separat fil. Rækkefølge: tabeller (T10.1, T10.2) → klassifikation-grundlag (T10.3, T10.4) → audit/validate (T10.5, T10.6) → FK med test-fix (T10.7a → T10.7) → RPC'er (T10.8-T10.12) → permission-seed (T10.13) → docs + tests + fitness (T10.14-T10.16). Hver checkpoint kan testes isoleret.

---

## Oprydnings- og opdaterings-strategi

**Filer der skal flyttes til arkiv** (efter pakken er merget):

- `docs/coordination/trin-10-krav-og-data.md` → `docs/coordination/arkiv/`
- `docs/coordination/trin-10-plan.md` → `docs/coordination/arkiv/`
- Alle `docs/coordination/plan-feedback/trin-10-*.md` → `docs/coordination/arkiv/`
- `docs/coordination/codex-reviews/2026-05-20-trin-10-runde-*.md` bevares i mappen (audit-trail)

**Filer der skal slettes:** ingen.

**Konsekvens-opdateringer for autoritative dokumenter:**

| Dokument                                   | Konsekvens? | Opdatering der laves i denne pakke                                        |
| ------------------------------------------ | ----------- | ------------------------------------------------------------------------- |
| `docs/strategi/stork-2-0-master-plan.md`   | ja          | §1.8 + §4 trin 10 (T10.14) + rettelse-entry i Appendix C                  |
| `docs/strategi/bygge-status.md`            | ja          | Trin 10 markeres som godkendt efter merge                                 |
| `docs/coordination/mathias-afgoerelser.md` | nej         | Alle scope-/forretnings-beslutninger ligger allerede i 2026-05-20-entries |
| `docs/teknisk/teknisk-gaeld.md`            | nej         | Ingen G-numre forventet i denne pakke                                     |

**Standard-opdateringer:**

- `docs/coordination/aktiv-plan.md` → ryd til "ingen aktiv plan"; trin 10 tilføjes til Historisk
- `docs/coordination/seneste-rapport.md` → peger på `docs/coordination/rapport-historik/2026-05-2X-trin-10.md`

**Reference-konsekvenser:**

- `grep -rn "trin-10-krav-og-data\|trin-10-plan" docs/` returnerer kun arkiv + rapport-historik + slut-rapport
- `grep -n "match-rolle\|crm_match_id\|migration: discovery-script for klienter" docs/strategi/stork-2-0-master-plan.md` returnerer 0 hits

**Ansvar:** Code udfører oprydning + opdatering som del af build-PR (T10.14 + standard-opdateringer). Slut-rapport verificerer udførelse.

---

## Fire-dokument-konsultation

| Dokument                                    | Konsulteret | Status           | Relevante referencer                                                                                                                                                                                                                                                                                                                                                                                                                          | Konflikt med plan?                                                                                                                                                                   |
| ------------------------------------------- | ----------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `docs/strategi/vision-og-principper.md`     | ja          | LÅST-AUTORITATIV | Princip 1 (data-kontrol i UI), Princip 2 (rettigheder i UI — has_permission frem for hardkodet), Princip 3 (forretningslogik som data — client_field_definitions UI-konfigurerbar), Princip 5 (greenfield-disciplin — CREATE TABLE fra bunden), Princip 6 (audit på alt der ændrer data — audit-trigger på alle write-tabeller), Princip 9 (status-modeller bevarer historik — is_active erstatter DELETE)                                    | nej                                                                                                                                                                                  |
| `docs/strategi/stork-2-0-master-plan.md`    | ja          | RETNINGSGIVENDE  | §1.8 (Klient-skabelon — rettes via T10.14), §1.11 (3-schema-arkitektur — clients i core_identity), §1.2 (klassifikations-registry — T10.4), §1.3 (PII-filter — T10.5 udvider med clients-special-case), §3 (CI-blockers — T10.16 fjerner allowlist), §4 trin 10 (rettes via T10.14)                                                                                                                                                           | ja — krav-dok §7 specificerer at §1.8 + §4 trin 10 rettes som del af trin 10-arbejdet; T10.14 leverer rettelserne. Konflikt løses ved at rette master-plan (trigger-for-opdatering). |
| `docs/coordination/mathias-afgoerelser.md`  | ja          | RETNINGSGIVENDE  | 2026-05-20 "Trin 10 forretnings-ramme" (7 sandheder), 2026-05-20 "Trin 10 scope-præcisering" (migration + match-rolle ud), 2026-05-20 "Workflow-justering V2". 2026-05-17 (klient kun til team; en klient = maks ét team). 2026-05-16 (klient-data følger klient ved team-skift). 2026-05-15 (plan-leverance er kontrakt). 2026-05-14 (E-conomic udelades; legal → time_based). 2026-05-11 (vision låst; superadmin eneste hardkodede rolle). | nej                                                                                                                                                                                  |
| `docs/coordination/trin-10-krav-og-data.md` | ja          | PAKKE-KONTRAKT   | §2 (forretnings-sandheder), §3.1-§3.4 (funktioner), §5 (scope-grænse), §7 (master-plan-rettelser), §8 (afgørelses-tabel), §10 (oprydnings-strategi)                                                                                                                                                                                                                                                                                           | nej (forudsat tolkning af §2.3.1 "egne felter" = "egne værdier i fields jsonb", Mathias-bekræftet 2026-05-20).                                                                       |

---

## Konklusion

V1 (genstart) bringer trin 10 i mål: klient-skabelonen etableres greenfield i `core_identity` med aktiv/inaktiv-livscyklus + logo + FK fra T9's klient-til-team-tilknytning + permission-baserede write-RPC'er. Klient-tabel eksisterer ikke på main før denne pakke (T1 droppede D5's pre-fundament); 16 steps skaber alle artefakter fra bunden.

16 steps, alle med eksakt SQL/pseudo-SQL. Risiko lav-mellem på alle migrations, hver rollbar individuelt.

Hovedlinjer ift. tidligere fabrikerede V1-V3 (`claude/trin-10-plan-v2`-branchen):

- Plan baseret på CREATE TABLE fra bunden (ikke ALTER på droppet D5)
- Klienter i `core_identity` (ikke `public`)
- Klassifikation i `core_compliance.data_field_definitions` (ikke `public`)
- audit_filter_values omskrives med clients-special-case (jsonb-walking)
- is_permanent_allowed udvides med de to nye tabeller
- Logo-håndtering i separate RPC'er (forhindrer datatab via client_upsert)
- T9-supplement-policy uændret
- Grant-modellen seedes (ikke legacy role_page_permissions)
- T9-smoke-tests opdateres med clients-fixture FØR FK aktiveres

Klar til Codex plan-review-runde 1.
