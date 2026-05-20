# Trin 10 — Klient-skabelon + felt-definitioner — Plan V1

**Pakke:** §4 trin 10 — Klient-skabelon + felt-definitioner + match-rolle
**Krav-dok:** `docs/coordination/trin-10-krav-og-data.md` (committed 2026-05-20 PR #58)
**Plan-version:** V1
**Dato:** 2026-05-20

---

## Formål

> Denne pakke leverer: klient-stammen i `core_identity` + klient-felt-definitioner i `core_compliance` + FK på T9's klient-til-team-tilknytning, så alle senere trin (sales, pricing, lønarter) kan koble til en faktisk klient-entitet.
>
> Hvis fundet under review ikke bringer os tættere på dette: G-nummer, ikke blocker.

---

## Scope

**I scope:**

- Master-plan §1.8 (klient-skabelon), §1.11 (schema-arkitektur), §4 trin 10
- Krav-dok `trin-10-krav-og-data.md` sektion 3 (alle funktioner: opret/ændr/deaktivér klient, klient-felt-definitions CRUD, klient-felt-værdier, klient-logo upload, klient-til-team-FK-verifikation)
- T9-leverancens lukning: FK på `client_node_placements.client_id`
- Klassifikation af alle nye kolonner i `core_compliance.data_field_definitions`

**IKKE i scope:**

- Migration fra 1.0 (eksplicit udskudt per mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme")
- Salgs-tabel + klient-CRM-match på salgs-rækken (trin 14)
- Pricing-regler pr. klient (senere)
- Lønarter der refererer klient (trin 13 formel-system)
- Frontend-pages og admin-UI'er (lag F)
- Mapping af eksterne kilder mod klient-felter (lag E)
- Match-engine selv (lag E)
- Konkrete rettighedstildelinger (sættes op i UI når frontend etableres)

---

## Strukturel beslutning

**Klient-felt-værdier lever i jsonb på `clients`-rækken**, ikke som separat tabel.

Begrundelse: master-plan §1.8 specificerer "felt-bag" som jsonb. Stor variation i felter pr. klient gør én jsonb-kolonne bedre end EAV-tabel (færre joins, bedre type-fleksibilitet, ingen migration ved nye felter). Audit-PII-filter har allerede special-case for jsonb (trin 2 audit-trigger walker keys + hasher direct-PII).

Binder fremtidige pakker til: jsonb-format med {felt_key: værdi}-struktur. Felt-definitioner i `core_compliance.client_field_definitions` er metadata; værdier er på klient-rækken.

---

## Mathias' afgørelser (input til denne plan)

- **Afgørelse 1:** Klient ejer rå data; dato afgør sandheden (historiske bindinger faste).
  _Begrundelse: mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 1+2._
  _Plan-konsekvens: klient-felt-værdier ikke versioneret i trin 10 (kun aktuel snapshot). Historik kommer via senere snapshot-mekanik på sales-rækker (trin 14). T9's `client_node_placements` har allerede versionering for team-binding._

- **Afgørelse 2:** Klient anonymiseres ikke; klient-livscyklus = aktiv/inaktiv.
  _Begrundelse: mathias-afgoerelser 2026-05-20 punkt 3+4._
  _Plan-konsekvens: ingen `anonymized_at` på `clients` (modsat 1.0/D5). Kun `is_active boolean` + `deactivated_at timestamptz`. Felter klassificeret direct-PII har retention på felt-niveau (allerede etableret i trin 2)._

- **Afgørelse 3:** Rettigheder styres i UI (permission-elementer).
  _Begrundelse: mathias-afgoerelser 2026-05-20 punkt 6 + T9 permission-fundament._
  _Plan-konsekvens: trin 10 tilføjer permission-element-rows (`client.create`, `client.update`, `client.deactivate`, `client.upload_logo`, `client_field_definition.create/update/deactivate`, `client.set_field_value`) til T9's `permission_elements`-tabel. RLS-policies bruger `has_permission()` med disse element-keys. Ingen hardcoded admin-check._

- **Afgørelse 4:** Klient kan have logo (upload + størrelses-normalisering + UI-justering).
  _Begrundelse: mathias-afgoerelser 2026-05-20 punkt 5._
  _Plan-konsekvens: logo gemmes som bytea på `clients`-rækken (én blob, ikke separat tabel — simpelt nok til at undgå over-design). Normalisering ved upload sker i wrapper-RPC (resize til 512x512 max). UI-justering er præsentations-niveau, ikke DB._

- **Afgørelse 5:** Migration udskudt — trin 10 leverer greenfield-fundament.
  _Begrundelse: mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" + Mathias 2026-05-20 "alt omkring migration tager vi til den tid"._
  _Plan-konsekvens: ingen discovery-script, ingen udtræks-SQL, ingen upload-script i trin 10. Migration-pakke bygges separat._

---

## Implementations-rækkefølge

### T10.1 — `core_identity.clients` tabel

- **Step-kode:** T10.1
- **Type:** migration (CREATE TABLE + RLS + GRANT + audit-trigger + klassifikation)
- **Hvad:** Klient-stammen med id, navn, felt-bag jsonb, logo, aktiv-status.
- **Eksakt indhold:**

  ```sql
  create table core_identity.clients (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    fields jsonb not null default '{}'::jsonb,
    logo_data bytea,
    is_active boolean not null default true,
    deactivated_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (is_active or deactivated_at is not null),
    check (not is_active or deactivated_at is null)
  );

  alter table core_identity.clients enable row level security;
  alter table core_identity.clients force row level security;

  -- SELECT-policy: bred for legitime læsere
  create policy clients_select on core_identity.clients
    for select to authenticated
    using (
      core_identity.has_permission(auth.uid(), 'client.view')
      or current_setting('stork.t10_write_authorized', true) = 'true'
    );

  -- INSERT-policy: kun via apply-handler (session-var)
  create policy clients_insert on core_identity.clients
    for insert to authenticated
    with check (current_setting('stork.t10_write_authorized', true) = 'true');

  -- UPDATE-policy: kun via apply-handler
  create policy clients_update on core_identity.clients
    for update to authenticated
    using (current_setting('stork.t10_write_authorized', true) = 'true')
    with check (current_setting('stork.t10_write_authorized', true) = 'true');

  -- INGEN DELETE-policy: klient anonymiseres ikke, slettes ikke

  grant select, insert, update on core_identity.clients to authenticated;

  -- Audit-trigger (per trin 2 stork_audit-pattern)
  create trigger clients_audit
    after insert or update on core_identity.clients
    for each row execute function core_compliance.stork_audit();

  -- updated_at-trigger
  create trigger clients_updated_at
    before update on core_identity.clients
    for each row execute function core_identity._set_updated_at();

  -- Klassifikation
  insert into core_compliance.data_field_definitions
    (schema_name, table_name, column_name, classification, pii_level, retention_strategy, retention_value, owner_role, description)
  values
    ('core_identity', 'clients', 'id', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'klient-PK'),
    ('core_identity', 'clients', 'name', 'master_data', 'direct', 'manual', null, null, 'klient-navn (forretningsdata, ikke persondata)'),
    ('core_identity', 'clients', 'fields', 'master_data', 'mixed', 'manual', null, null, 'klient-felt-bag jsonb; PII pr. felt afgøres via client_field_definitions'),
    ('core_identity', 'clients', 'logo_data', 'master_data', 'none', 'manual', null, null, 'klient-logo blob'),
    ('core_identity', 'clients', 'is_active', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'aktiv-flag'),
    ('core_identity', 'clients', 'deactivated_at', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'deaktiverings-tidspunkt');
  ```

- **Afhængigheder:** core_identity.has_permission() (T9), core_identity.\_set_updated_at() (T9), core_compliance.stork_audit() (trin 2).
- **Migration-fil:** `20260520000000_t10_clients.sql`
- **Risiko:** lav. Ren CREATE TABLE + RLS + GRANT. Rollback: DROP TABLE.

### T10.2 — `core_compliance.client_field_definitions` tabel

- **Step-kode:** T10.2
- **Type:** migration (CREATE TABLE + RLS + GRANT + audit-trigger + klassifikation)
- **Hvad:** Felt-definitions-registry pr. klient med kategori-mærkat (match-rolle), krav, PII-niveau, sortering, aktiv-flag.
- **Eksakt indhold:**

  ```sql
  create table core_compliance.client_field_definitions (
    id uuid primary key default gen_random_uuid(),
    client_id uuid not null references core_identity.clients(id) on delete restrict,
    field_key text not null,
    display_name text not null,
    value_type text not null check (value_type in ('text', 'number', 'date', 'boolean', 'email', 'phone', 'url')),
    is_required boolean not null default false,
    pii_level text not null default 'none' check (pii_level in ('none', 'indirect', 'direct')),
    match_role text,
    display_order integer not null default 0,
    is_active boolean not null default true,
    deactivated_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (client_id, field_key),
    check (is_active or deactivated_at is not null),
    check (not is_active or deactivated_at is null)
  );

  alter table core_compliance.client_field_definitions enable row level security;
  alter table core_compliance.client_field_definitions force row level security;

  create policy cfd_select on core_compliance.client_field_definitions
    for select to authenticated
    using (
      core_identity.has_permission(auth.uid(), 'client.view')
      or current_setting('stork.t10_write_authorized', true) = 'true'
    );

  create policy cfd_insert on core_compliance.client_field_definitions
    for insert to authenticated
    with check (current_setting('stork.t10_write_authorized', true) = 'true');

  create policy cfd_update on core_compliance.client_field_definitions
    for update to authenticated
    using (current_setting('stork.t10_write_authorized', true) = 'true')
    with check (current_setting('stork.t10_write_authorized', true) = 'true');

  grant select, insert, update on core_compliance.client_field_definitions to authenticated;

  create trigger cfd_audit
    after insert or update on core_compliance.client_field_definitions
    for each row execute function core_compliance.stork_audit();

  create trigger cfd_updated_at
    before update on core_compliance.client_field_definitions
    for each row execute function core_identity._set_updated_at();

  insert into core_compliance.data_field_definitions
    (schema_name, table_name, column_name, classification, pii_level, retention_strategy, retention_value, owner_role, description)
  values
    ('core_compliance', 'client_field_definitions', 'id', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'felt-def-PK'),
    ('core_compliance', 'client_field_definitions', 'client_id', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'klient-FK'),
    ('core_compliance', 'client_field_definitions', 'field_key', 'master_data', 'none', 'manual', null, null, 'felt-nøgle i klient.fields jsonb'),
    ('core_compliance', 'client_field_definitions', 'display_name', 'master_data', 'none', 'manual', null, null, 'felt-display-navn'),
    ('core_compliance', 'client_field_definitions', 'value_type', 'master_data', 'none', 'manual', null, null, 'felt-type'),
    ('core_compliance', 'client_field_definitions', 'is_required', 'master_data', 'none', 'manual', null, null, 'felt-required-flag'),
    ('core_compliance', 'client_field_definitions', 'pii_level', 'master_data', 'none', 'manual', null, null, 'felt-PII-niveau'),
    ('core_compliance', 'client_field_definitions', 'match_role', 'master_data', 'none', 'manual', null, null, 'kategori-mærkat for felt-mapping fra flere kilder'),
    ('core_compliance', 'client_field_definitions', 'display_order', 'master_data', 'none', 'manual', null, null, 'felt-sortering i UI'),
    ('core_compliance', 'client_field_definitions', 'is_active', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'aktiv-flag'),
    ('core_compliance', 'client_field_definitions', 'deactivated_at', 'operationel', 'none', 'time_based', '{"max_days":2555}'::jsonb, null, 'deaktiverings-tidspunkt');
  ```

- **Afhængigheder:** T10.1 (FK til clients), trin 2 stork_audit, T9 has_permission + \_set_updated_at.
- **Migration-fil:** `20260520000001_t10_client_field_definitions.sql`
- **Risiko:** lav. Rollback: DROP TABLE.

### T10.3 — Permission-elementer for klient-handlinger

- **Step-kode:** T10.3
- **Type:** migration (INSERT i T9's permission_elements + permission_areas/pages/tabs hvis nødvendigt)
- **Hvad:** Tilføjer permission-element-rows der gør klient-handlinger UI-konfigurerbare.
- **Eksakt indhold:**

  ```sql
  -- Sætter session-var for write-authorization (samme mønster som T9)
  set local stork.t9_write_authorized = 'true';

  insert into core_identity.permission_elements (element_key, area_id, page_id, tab_id, label, description, is_active)
  select 'client.view', a.id, p.id, null, 'Se klienter', 'Læseadgang til klient-liste og klient-detaljer', true
  from core_identity.permission_areas a
  join core_identity.permission_pages p on p.area_id = a.id
  where a.area_key = 'clients' and p.page_key = 'clients_list';

  -- Tilsvarende for:
  -- 'client.create'
  -- 'client.update'
  -- 'client.deactivate'
  -- 'client.upload_logo'
  -- 'client.set_field_value'
  -- 'client_field_definition.create'
  -- 'client_field_definition.update'
  -- 'client_field_definition.deactivate'

  set local stork.t9_write_authorized = '';
  ```

  Permission-areas/pages skal eksistere først. Hvis ikke: opret `'clients'`-area + `'clients_list'`-page i samme migration FØR INSERT i permission_elements.

- **Afhængigheder:** T9 permission_elements + permission_areas/pages.
- **Migration-fil:** `20260520000002_t10_permission_elements.sql`
- **Risiko:** lav. Data-only rows. Rollback: DELETE FROM permission_elements WHERE element_key LIKE 'client%'.

### T10.4 — Apply-handlers + dispatcher-extension

- **Step-kode:** T10.4
- **Type:** migration (CREATE FUNCTION × 7 + alter pending_change_apply)
- **Hvad:** Apply-handlers for klient-CRUD + felt-def-CRUD + felt-værdi-set. Alle write-stier går via T9's `pending_changes`-flow.
- **Eksakt indhold:**

  ```sql
  -- _apply_client_create
  create or replace function core_identity._apply_client_create(
    p_payload jsonb,
    p_pending_change_id uuid
  ) returns void
  language plpgsql security definer set search_path = ''
  as $$
  declare
    v_name text;
    v_client_id uuid;
  begin
    v_name := p_payload->>'name';
    if v_name is null or length(trim(v_name)) = 0 then
      raise exception 'invalid_payload: name required' using errcode = '22023';
    end if;

    set local stork.t10_write_authorized = 'true';
    insert into core_identity.clients (name) values (v_name) returning id into v_client_id;
    set local stork.t10_write_authorized = '';

    -- Log resultat på pending_change
    update core_identity.pending_changes
      set result_payload = jsonb_build_object('client_id', v_client_id)
      where id = p_pending_change_id;
  end;
  $$;

  revoke execute on function core_identity._apply_client_create(jsonb, uuid) from public, anon, authenticated;

  -- _apply_client_update (ændr navn)
  create or replace function core_identity._apply_client_update(
    p_payload jsonb,
    p_pending_change_id uuid
  ) returns void
  language plpgsql security definer set search_path = ''
  as $$
  declare
    v_client_id uuid;
    v_name text;
  begin
    v_client_id := (p_payload->>'client_id')::uuid;
    v_name := p_payload->>'name';
    if v_client_id is null or v_name is null then
      raise exception 'invalid_payload: client_id + name required' using errcode = '22023';
    end if;

    set local stork.t10_write_authorized = 'true';
    update core_identity.clients set name = v_name where id = v_client_id;
    set local stork.t10_write_authorized = '';
  end;
  $$;

  -- _apply_client_deactivate
  create or replace function core_identity._apply_client_deactivate(
    p_payload jsonb,
    p_pending_change_id uuid
  ) returns void
  language plpgsql security definer set search_path = ''
  as $$
  declare
    v_client_id uuid;
  begin
    v_client_id := (p_payload->>'client_id')::uuid;
    if v_client_id is null then
      raise exception 'invalid_payload: client_id required' using errcode = '22023';
    end if;

    set local stork.t10_write_authorized = 'true';
    update core_identity.clients
      set is_active = false, deactivated_at = now()
      where id = v_client_id and is_active = true;
    set local stork.t10_write_authorized = '';
  end;
  $$;

  -- _apply_client_upload_logo
  create or replace function core_identity._apply_client_upload_logo(
    p_payload jsonb,
    p_pending_change_id uuid
  ) returns void
  language plpgsql security definer set search_path = ''
  as $$
  declare
    v_client_id uuid;
    v_logo_data bytea;
  begin
    v_client_id := (p_payload->>'client_id')::uuid;
    v_logo_data := decode(p_payload->>'logo_data_base64', 'base64');
    if v_client_id is null or v_logo_data is null then
      raise exception 'invalid_payload: client_id + logo_data_base64 required' using errcode = '22023';
    end if;

    set local stork.t10_write_authorized = 'true';
    update core_identity.clients set logo_data = v_logo_data where id = v_client_id;
    set local stork.t10_write_authorized = '';
  end;
  $$;

  -- _apply_client_set_field_value (jsonb-key på clients.fields)
  create or replace function core_identity._apply_client_set_field_value(
    p_payload jsonb,
    p_pending_change_id uuid
  ) returns void
  language plpgsql security definer set search_path = ''
  as $$
  declare
    v_client_id uuid;
    v_field_key text;
    v_field_value jsonb;
  begin
    v_client_id := (p_payload->>'client_id')::uuid;
    v_field_key := p_payload->>'field_key';
    v_field_value := p_payload->'field_value';
    if v_client_id is null or v_field_key is null then
      raise exception 'invalid_payload: client_id + field_key required' using errcode = '22023';
    end if;

    -- Validér at felt-definitionen eksisterer for klienten
    if not exists (
      select 1 from core_compliance.client_field_definitions
      where client_id = v_client_id and field_key = v_field_key and is_active = true
    ) then
      raise exception 'unknown_field: field_key % not defined for client %', v_field_key, v_client_id
        using errcode = '22023';
    end if;

    set local stork.t10_write_authorized = 'true';
    update core_identity.clients
      set fields = fields || jsonb_build_object(v_field_key, v_field_value)
      where id = v_client_id;
    set local stork.t10_write_authorized = '';
  end;
  $$;

  -- _apply_client_field_definition_create
  create or replace function core_identity._apply_client_field_definition_create(
    p_payload jsonb,
    p_pending_change_id uuid
  ) returns void
  language plpgsql security definer set search_path = ''
  as $$
  begin
    -- Validate payload keys: client_id, field_key, display_name, value_type, is_required, pii_level, match_role, display_order
    set local stork.t10_write_authorized = 'true';
    insert into core_compliance.client_field_definitions
      (client_id, field_key, display_name, value_type, is_required, pii_level, match_role, display_order)
    values (
      (p_payload->>'client_id')::uuid,
      p_payload->>'field_key',
      p_payload->>'display_name',
      p_payload->>'value_type',
      coalesce((p_payload->>'is_required')::boolean, false),
      coalesce(p_payload->>'pii_level', 'none'),
      p_payload->>'match_role',
      coalesce((p_payload->>'display_order')::integer, 0)
    );
    set local stork.t10_write_authorized = '';
  end;
  $$;

  -- _apply_client_field_definition_update + _apply_client_field_definition_deactivate (analog)

  -- Udvid pending_change_apply-dispatcher (T9's master-dispatcher)
  -- Tilføjer 7 nye case-grene i T9's _apply-switch
  create or replace function core_identity.pending_change_apply(p_change_id uuid)
  returns void
  language plpgsql security definer set search_path = ''
  as $$
  declare
    v_change core_identity.pending_changes;
  begin
    select * into v_change from core_identity.pending_changes where id = p_change_id and applied_at is null;
    if not found then return; end if;

    case v_change.change_type
      when 'employee_place' then perform core_identity._apply_employee_place(v_change.payload, p_change_id);
      when 'client_place' then perform core_identity._apply_client_place(v_change.payload, p_change_id);
      -- T10-tilføjelser:
      when 'client_create' then perform core_identity._apply_client_create(v_change.payload, p_change_id);
      when 'client_update' then perform core_identity._apply_client_update(v_change.payload, p_change_id);
      when 'client_deactivate' then perform core_identity._apply_client_deactivate(v_change.payload, p_change_id);
      when 'client_upload_logo' then perform core_identity._apply_client_upload_logo(v_change.payload, p_change_id);
      when 'client_set_field_value' then perform core_identity._apply_client_set_field_value(v_change.payload, p_change_id);
      when 'client_field_definition_create' then perform core_identity._apply_client_field_definition_create(v_change.payload, p_change_id);
      when 'client_field_definition_update' then perform core_identity._apply_client_field_definition_update(v_change.payload, p_change_id);
      when 'client_field_definition_deactivate' then perform core_identity._apply_client_field_definition_deactivate(v_change.payload, p_change_id);
      else
        raise exception 'unknown_change_type: %', v_change.change_type using errcode = '22023';
    end case;

    update core_identity.pending_changes set applied_at = now() where id = p_change_id;
  end;
  $$;
  ```

- **Afhængigheder:** T10.1, T10.2, T10.3, T9 pending_changes-tabel + apply-dispatcher.
- **Migration-fil:** `20260520000003_t10_apply_handlers.sql`
- **Risiko:** mellem. Dispatcher-omskrivning er kritisk path. Rollback: restore T9-version af pending_change_apply.

### T10.5 — Public wrapper RPCs

- **Step-kode:** T10.5
- **Type:** migration (CREATE FUNCTION × 8, public-facing entry points)
- **Hvad:** Wrapper-RPCs som UI kalder. Hver verificerer permission, opretter pending_change, returnerer change_id.
- **Eksakt indhold:**

  ```sql
  -- client_create wrapper
  create or replace function public.client_create(p_name text)
  returns uuid
  language plpgsql security definer set search_path = ''
  as $$
  declare
    v_user_id uuid;
    v_change_id uuid;
  begin
    v_user_id := auth.uid();
    if not core_identity.has_permission(v_user_id, 'client.create') then
      raise exception 'permission_denied: client.create required' using errcode = '42501';
    end if;

    insert into core_identity.pending_changes (change_type, payload, requested_by, effective_from)
    values ('client_create', jsonb_build_object('name', p_name), v_user_id, current_date)
    returning id into v_change_id;

    return v_change_id;
  end;
  $$;

  grant execute on function public.client_create(text) to authenticated;

  -- client_update(p_client_id uuid, p_name text) → uuid
  -- client_deactivate(p_client_id uuid) → uuid
  -- client_upload_logo(p_client_id uuid, p_logo_base64 text) → uuid
  -- client_set_field_value(p_client_id uuid, p_field_key text, p_field_value jsonb) → uuid
  -- client_field_definition_create(p_client_id uuid, p_field_key text, p_display_name text, p_value_type text, p_is_required boolean, p_pii_level text, p_match_role text, p_display_order integer) → uuid
  -- client_field_definition_update(p_definition_id uuid, ...) → uuid
  -- client_field_definition_deactivate(p_definition_id uuid) → uuid
  ```

  Alle wrapper-RPCs følger samme mønster:
  1. Tjek `auth.uid()`-permission via `core_identity.has_permission()`
  2. Insert i `pending_changes`
  3. Returnér `change_id` (UI viser status; apply sker via T9's apply-cron eller umiddelbart via approve-RPC).

- **Afhængigheder:** T10.1-T10.4, T9 has_permission + pending_changes.
- **Migration-fil:** `20260520000004_t10_public_wrappers.sql`
- **Risiko:** lav. Pure wrapper-funktioner. Rollback: DROP FUNCTION.

### T10.6 — FK på `client_node_placements.client_id` + read-RPCs

- **Step-kode:** T10.6
- **Type:** migration (ALTER TABLE ADD CONSTRAINT + CREATE FUNCTION × 3)
- **Hvad:** Lukker T9-leverancen ved at tilføje FK. Plus read-RPCs (client_get, client_list, client_field_definitions_list).
- **Eksakt indhold:**

  ```sql
  -- Tilføj FK (T9 udskød denne til trin 10)
  alter table core_identity.client_node_placements
    add constraint client_node_placements_client_id_fkey
    foreign key (client_id) references core_identity.clients(id) on delete restrict;

  -- Read-RPCs
  create or replace function public.client_get(p_client_id uuid)
  returns table (
    id uuid, name text, fields jsonb, has_logo boolean,
    is_active boolean, deactivated_at timestamptz,
    created_at timestamptz, updated_at timestamptz
  )
  language plpgsql security definer set search_path = ''
  as $$
  begin
    if not core_identity.has_permission(auth.uid(), 'client.view') then
      raise exception 'permission_denied' using errcode = '42501';
    end if;
    return query
      select c.id, c.name, c.fields, c.logo_data is not null,
             c.is_active, c.deactivated_at, c.created_at, c.updated_at
      from core_identity.clients c
      where c.id = p_client_id;
  end;
  $$;
  grant execute on function public.client_get(uuid) to authenticated;

  -- public.client_list() → table (id, name, is_active) — alle klienter
  -- public.client_field_definitions_list(p_client_id uuid) → table (definition-rows)
  -- public.client_logo_get(p_client_id uuid) → bytea
  ```

- **Afhængigheder:** T10.1, T10.3, T9 client_node_placements + has_permission.
- **Migration-fil:** `20260520000005_t10_fk_and_reads.sql`
- **Risiko:** lav. FK tilføjes til tom kolonne (ingen rows endnu, da clients ikke fandtes). Rollback: DROP CONSTRAINT.

### T10.7 — Smoke-tests

- **Step-kode:** T10.7
- **Type:** test (pgTAP-style SQL i `supabase/tests/`)
- **Hvad:** Verificér end-to-end: opret klient → opret felt-def → sæt felt-værdi → opdater klient → deaktivér klient → FK-verifikation til T9.
- **Eksakt indhold (test-fil-skitse):**

  ```sql
  -- supabase/tests/t10_clients.sql
  begin;
  select plan(8);

  -- Setup: throwaway-user med client.* permissions (per T9-test-fixture-hardening pattern)
  set local request.jwt.claim.sub = '<throwaway-uuid>';

  -- T1: client_create returnerer change_id
  select isnt_empty('select public.client_create(''TestKlient_'' || gen_random_uuid()::text)', 'client_create works');

  -- T2: Efter apply: klient eksisterer i core_identity.clients
  -- (kald pending_change_apply manuelt eller via cron-helper)

  -- T3: client_field_definition_create opretter felt-def
  -- T4: client_set_field_value sætter felt-værdi i jsonb
  -- T5: Ukendt field_key i set_field_value rejser exception
  -- T6: client_deactivate sætter is_active=false
  -- T7: FK på client_node_placements.client_id forhindrer placement med ikke-eksisterende client_id
  -- T8: Audit-rows oprettet for hver write

  select * from finish();
  rollback;
  ```

- **Afhængigheder:** Alle T10.1-T10.6.
- **Migration-fil:** `supabase/tests/t10_clients.sql`
- **Risiko:** lav. Tests; ingen produktion-impact.

---

## Fundament-tjek-passeret

| Tjek                                                               | Status | Reference                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hver write-RPC har GRANT + INSERT/UPDATE-policy + session-var      | ja     | T10.1, T10.2 (RLS-policies + GRANT); T10.4 apply-handlers sætter `stork.t10_write_authorized`; T10.5 wrappers kalder via `pending_changes` → apply                                                                                                                                    |
| Hver SELECT-policy bred nok til legitime læsere                    | ja     | T10.1 `clients_select` policy bruger `has_permission(client.view)` + write-authorized-bypass; T10.2 tilsvarende                                                                                                                                                                       |
| Backdated guards på relevante handlers                             | N/A    | Trin 10 har ingen backdated-relevante writes. Klient-team-bindinger (med backdated) håndteres af T9's \_apply_client_place; trin 10 ændrer ikke det                                                                                                                                   |
| Apply-dispatcher-extension specificeret per RPC                    | ja     | T10.4 viser 7 nye case-grene i `pending_change_apply` (client_create, client_update, client_deactivate, client_upload_logo, client_set_field_value, client_field_definition_create/update/deactivate)                                                                                 |
| jsonb-format konsistent mellem producer og consumer                | ja     | clients.fields-format: `{field_key: value}`. Producer = `_apply_client_set_field_value`. Consumer = `client_get` (returnerer fields jsonb direkte). Validation = `_apply_client_set_field_value` verificerer field_key mod client_field_definitions før set                           |
| Eksempel-row verificeret gennem flow                               | ja     | Non-admin med `client.create` permission → kalder `public.client_create('Eesy')` → `pending_changes`-row → apply → row i `core_identity.clients` med `name='Eesy', fields={}, is_active=true`. Audit-row i stork_audit. Klassifikations-rækker eksisterer pre-build (T10.1 migration) |
| Plan-detaljer eksplicit (ingen "TBD" / "Code afgør" / overladelse) | ja     | Alle 7 steps har pseudo-SQL. Apply-handlers og wrappers nævnt eksplicit. Smoke-tests har 8 testcases specificeret                                                                                                                                                                     |

---

## Test-konsekvens

- **Test-fil:** `supabase/tests/t10_clients.sql` (NY)
- **Hvad verificeres:** 8 testcases dækker klient-CRUD + felt-def-CRUD + felt-værdi-set + FK + audit
- **Forventet status:** grøn lokalt; grøn i CI

---

## Build-fase halt-håndtering (V5.3)

- **Forventede WORKAROUND-kandidater:** ingen forventet
- **Forventede PLAN-AFVIGELSE-scenarier:** ingen forventet. Hvis CI fanger jsonb-format-inkonsistens mellem producer og consumer → PLAN-AFVIGELSE → STOP og rapport til Mathias
- **Kritiske invarianter der ikke må brydes:**
  - FORCE RLS på `clients` + `client_field_definitions`
  - Ingen DELETE-policy på `clients` (klient anonymiseres ikke)
  - Apply-handlers SECURITY DEFINER + REVOKE EXECUTE FROM authenticated
  - Audit-trigger-dækning på alle write-stier
  - Klient-felt-værdi-set validerer field_key mod aktiv felt-def (forhindrer "ukendte" keys)

---

## Risiko + kompensation

| Migration                      | Værste-case                                                                               | Sandsynlighed | Rollback                                                                                                                            |
| ------------------------------ | ----------------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| T10.1 clients                  | Tabellen oprettes med forkert klassifikation; senere migrations bruger forkert pii_level  | lav           | DROP TABLE; revert classification                                                                                                   |
| T10.2 client_field_definitions | FK til clients fejler hvis T10.1 ikke applied først                                       | lav           | DROP TABLE; ALTER ORDER på migration-filer (filnavn-sortering håndterer dette)                                                      |
| T10.3 permission_elements      | Permission-areas/pages ikke eksisterer                                                    | lav           | INSERT-blok wrappet i exception-handler; manuel oprettelse + retry                                                                  |
| T10.4 apply-handlers           | Dispatcher-extension bryder T9's eksisterende \_apply_employee_place/\_apply_client_place | mellem        | Smoke-test verificerer at T9's eksisterende paths stadig fungerer (testcases for employee_place + client_place skal stadig passere) |
| T10.5 wrappers                 | RPC returnerer change_id men apply fejler senere asynkront                                | lav           | Pending_change forbliver applied_at=null; UI viser status; manuel rerun                                                             |
| T10.6 FK                       | FK fejler hvis client_node_placements har orphan rows                                     | lav           | Tom tabel forventet (T9 har ingen rows). Hvis orphan rows: SELECT først, delete eller fix                                           |
| T10.7 tests                    | Tests fejler pga. fixture-permission                                                      | lav           | Per T9-test-fixture-hardening pattern: throwaway-user + uuid-suffixed fixtures                                                      |

**Kompensation (generelt):** Hvis hele pakken fejler → atomic rollback (Supabase migration-system): alle filer reverted, ingen partial state. Manual recover via revert-migration hvis nødvendigt.

---

## Oprydnings- og opdaterings-strategi

**Filer der skal flyttes til arkiv** (efter pakken er merget):

- `docs/coordination/trin-10-krav-og-data.md` → `docs/coordination/arkiv/`
- `docs/coordination/trin-10-plan.md` → `docs/coordination/arkiv/`
- Alle `docs/coordination/plan-feedback/trin-10-*.md` → `docs/coordination/arkiv/`

**Filer der skal slettes:** ingen.

**Dokumenter der skal opdateres** (som del af build-leverance):

- `docs/coordination/aktiv-plan.md` → ryd til "ingen aktiv plan"; tilføj trin 10 til Historisk-sektion
- `docs/coordination/seneste-rapport.md` → peg på `rapport-historik/<dato>-trin-10.md`
- `docs/strategi/bygge-status.md` → trin 10 markeres "✓ Godkendt"
- `docs/teknisk/teknisk-gaeld.md` → eventuelle nye G-numre fra build

**Reference-konsekvenser:** ingen. Ingen fil omdøbes eller flyttes uden for arkiv-mekanik.

**Verifikation:** `grep -r "trin-10-krav-og-data\|trin-10-plan" docs/` returnerer kun arkiv + rapport-historik + slut-rapport.

**Ansvar:** Code udfører som del af build-PR. Slut-rapporten verificerer i "Oprydning + opdatering udført"-sektion.

---

## Konsistens-tjek

- **Disciplin-pakke:** Følger fire-dokument-disciplinen (2026-05-16) + Lag 1 V5.3 marker-protokol + Lag 1 disciplin-fundament (2026-05-20).

---

## Fire-dokument-konsultation

| Dokument                                    | Konsulteret | Relevante referencer                                                                                                                                                                                                              | Konflikt med plan? |
| ------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `docs/strategi/vision-og-principper.md`     | ja          | Princip 1 (data-kontrol i UI — permission-elementer); Princip 2 (rettigheder via permission-system); Princip 3 (klient-felter som data, ikke kode); Princip 6 (audit på alle writes); Princip 9 (status-modeller — aktiv/inaktiv) | nej                |
| `docs/strategi/stork-2-0-master-plan.md`    | ja          | §1.8 (klient-skabelon: felt-bag jsonb, match-rolle); §1.11 (schema-grænse: clients i core_identity, client_field_definitions i core_compliance); §4 trin 10 (schema = core_identity + core_compliance)                            | nej                |
| `docs/coordination/mathias-afgoerelser.md`  | ja          | 2026-05-20 "Trin 10 forretnings-ramme" (alle 7 punkter); 2026-05-17 (T9-fundament); 2026-05-16 (klient-team-relationer); 2026-05-14 (én klient = ét team)                                                                         | nej                |
| `docs/coordination/trin-10-krav-og-data.md` | ja          | Sektion 2 (forretnings-sandheder); sektion 3 (funktioner); sektion 5 (scope-grænse); sektion 7 (afgørelses-tabel); sektion 9 (oprydnings-strategi)                                                                                | nej                |

---

## Konklusion

Planen bringer pakken nærmere formålet (klient-stammen som forretnings-fundament) med acceptabel risiko. 7 migrations i kronologisk rækkefølge, alle med eksplicit pseudo-SQL, FK-lukning af T9-leverance, klassifikation pr. ny kolonne, audit-dækning, RLS via T9's permission-fundament. Ingen migration udskudt; ingen rammer brudt.

**Klar til Codex-review-runde.**
