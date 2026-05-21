# T9-supplement-2 — Plan V1

**Pakke-type:** Lille opfølgnings-pakke (Step 1.5 krav-dok skipped per V3 Step 1.2 — recon-output + mathias-afgoerelser er rammen).
**Forudsætning:** T9 + T9-supplement + trin 10 merget. Mathias-afgoerelse 2026-05-21 (PR #67, commit 8690bf9) etablerer superadmin-bypass-rammen.

---

## Verificerede afhængigheder

| Afhængighed                                                                   | Verificeret fra (file:linje)                                             | Note (signatur, return-type, invariant)                                                                                                                                                                                           |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core_identity.org_node_upsert(uuid, text, uuid, text, boolean, date) → uuid` | `supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:9-43`     | SECURITY DEFINER. Mangler `set_config('stork.t9_write_authorized', 'true', true)` FØR `pending_change_request`-kald (linje 29-41). G059.                                                                                          |
| `core_identity.org_node_deactivate(uuid, date) → uuid`                        | `supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:47-62`    | SECURITY DEFINER. Mangler session-var. G059.                                                                                                                                                                                      |
| `core_identity.team_close(uuid, date) → uuid`                                 | `supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:66-91`    | SECURITY DEFINER. Pre-check verificerer `node_type='team'` (linje 76-83). Mangler session-var FØR `pending_change_request` (linje 84). G059.                                                                                      |
| `core_identity.employee_place(uuid, uuid, date) → uuid`                       | `supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:94-114`   | SECURITY DEFINER. Mangler session-var. G059.                                                                                                                                                                                      |
| `core_identity.employee_remove_from_node(uuid, date) → uuid`                  | `supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql:118-136`  | SECURITY DEFINER. Mangler session-var. G059.                                                                                                                                                                                      |
| `core_identity._apply_client_place(jsonb, uuid) → void`                       | `supabase/migrations/20260521000008_t10_client_active_check.sql:134-228` | SECURITY DEFINER. T10.7b-version. Team-aktiv-check linje 159-167 raiser `client_placement_requires_active_team` (errcode P0001) UDEN bypass. Klient-aktiv-bypass via `v_admin_involved` allerede etableret (linje 177-192). G057. |
| `core_identity._apply_team_close(jsonb, uuid) → void`                         | `supabase/migrations/20260520000000_t9_supplement.sql:557-640`           | SECURITY DEFINER. Linje 598-601 raiser `team_close_already_inactive` (errcode 22023) UDEN bypass. Strukturel vagt `team_close_not_team` (linje 593-595) bevares uden bypass. G057.                                                |
| `core_identity.is_admin_by_employee_id(uuid) → boolean`                       | `supabase/migrations/20260521000008_t10_client_active_check.sql:25-40`   | SQL STABLE SECURITY INVOKER. Admin-tjek via employee_id (kompenserer cron-context hvor `auth.uid()` er NULL). Genbruges i `_apply_team_close`-bypass.                                                                             |
| `pending_changes_insert` policy                                               | `supabase/migrations/20260518100000_t9_fundament_supplement.sql:49-51`   | INSERT-policy: `current_setting('stork.t9_write_authorized', true) = 'true'`. Authenticated-bruger uden session-var → INSERT fejler under FORCE RLS.                                                                              |
| `core_identity.pending_change_request(text, uuid, jsonb, date) → uuid`        | (kaldet af alle wrappers)                                                | INSERT i `pending_changes` — rammer `pending_changes_insert` policy.                                                                                                                                                              |
| Klient-bypass-mønster (kanonisk)                                              | `supabase/migrations/20260521000008_t10_client_active_check.sql:177-192` | `v_admin_involved := is_admin_by_employee_id(v_requested_by) OR (v_approved_by IS NOT NULL AND is_admin_by_employee_id(v_approved_by))`. Genbruges i `_apply_client_place` (team-aktiv) + nyt for `_apply_team_close`.            |
| Smoke-test rolle-swap-mønster                                                 | `supabase/tests/smoke/t10_client_active_check.sql:1-60`                  | Brug eksisterende auth-backed superadmins; swap deres role_id midlertidigt til non-admin via ROLLBACK-buffer. Admin-floor sikret via buffer-admin.                                                                                |

---

## Formål

> Denne pakke leverer: at T9 wrapper-vejen virker for authenticated bruger (G059) og at superadmin kan bypasse to T9 forretnings-invarianter på `_apply_*`-handlers per ramme-afgørelse 2026-05-21 (G057).
>
> Hvis fundet under review ikke bringer os tættere på dette: G-nummer, ikke blocker.

---

## Scope

**I scope:**

- Master-plan-paragraffer: §1.7 (T9-omstart-rammen punkt 12-13) — wrapper-vejen er den UI-tilgængelige sti for org-/team-/medarbejder-handlinger med pending-change-flow.
- Tilstødende G-numre: **G059** (lukkes), **G057** (lukkes).
- Rammen: `mathias-afgoerelser.md` 2026-05-21 (PR #67) — superadmin-bypass-ramme + idempotency-model.

**IKKE i scope:**

- De øvrige T9-supplement-skitse-punkter (team-retype trigger-fix, backdated guards på de fem org/employee apply-handlers, API/schema exposure, import-stubs, type-codegen, read-RPC gates, step 12 superadmin-robusthed). Disse er allerede markeret OUT OF SCOPE i recon (`t9-supplement-2-forretningsgang-code.md`) og håndteres separat.
- Strukturelle vagter (`team_close_not_team`, `node_not_team_or_inactive`, `client_placement_node_not_team`). De forbliver uden bypass per 2026-05-21-afgørelsens afgrænsning.
- Ændringer i pending-change-flowet selv (approve, undo, gælder-dato-håndtering, audit-spor).
- Frontend / UI / lag F. Denne pakke gør wrapper-vejen RLS-realiserbar — UI bygges senere.
- G058 (FK-coverage-fitness-check). Separat pakke.

---

## Strukturel beslutning

Ingen ny strukturel beslutning. Pakken anvender to eksisterende mønstre:

1. **Session-var-pattern fra T9-fundament-supplement** (`stork.t9_write_authorized`-sætning FØR INSERT på `pending_changes`) — gælder de 5 wrappers (G059).
2. **Employee-id-baseret admin-bypass-mønster fra T10.7b** (`is_admin_by_employee_id(requested_by)` ELLER `is_admin_by_employee_id(approved_by)`) — gælder team-aktiv-check i `_apply_client_place` og allerede-inaktiv-check i `_apply_team_close` (G057).

---

## Mathias' afgørelser (input til denne plan)

- **Afgørelse 2026-05-21 Del 1:** Superadmin bypasser forretnings-invarianter som ramme.
- **Begrundelse:** Vision-princip 2 + 2026-05-17 punkt 10 dækker permission/synlighed, ikke bypass. T10.7b-kodens implicitte reference manglede committed kilde — etableres her som ramme.
- **Plan-konsekvens:** `_apply_client_place` (team-aktiv-check) + `_apply_team_close` (allerede-inaktiv-check) får bypass. Strukturelle vagter er undtaget.

- **Afgørelse 2026-05-21 Del 2:** Idempotency-model for "allerede-tilstand"-vagter — vagten passerer for superadmin, handler kører som no-op hvis allerede i mål-tilstand.
- **Begrundelse:** Matcher T10.7b-mønstret. Én ensartet form på tværs af invarianter.
- **Plan-konsekvens:** `_apply_team_close`'s "allerede inaktiv"-bypass genbruger eksisterende UPDATE-logik (linje 604-608). Når `v_active.is_active = false` og superadmin: no-op return (ingen UPDATE-effekt, da target-tilstanden allerede er nået).

---

## Implementations-rækkefølge

Migrations kommer i to filer. Rækkefølge: G059 før G057 (rationale: smoke-test for G057-wrapper-flow forudsætter at wrapperen kan oprette pending uden session-var-fejl).

### Step S1 — Migration: G059 session-var-fix på 5 wrappers

- **Type:** migration (CREATE OR REPLACE på 5 RPCs)
- **Hvad:** Tilføj `perform set_config('stork.t9_write_authorized', 'true', true)` EFTER `has_permission`-check og FØR `pending_change_request`-kald i 5 T9 wrapper-RPCs. Følger T10.7b-mønstret fra `client_node_place`/`client_node_close` (linje 84, 119 i `20260521000008_t10_client_active_check.sql`).
- **Eksakt indhold:** Pr. RPC tilføjes ét stmt `perform set_config('stork.t9_write_authorized', 'true', true);` umiddelbart efter `if not has_permission(...)`-blok. Ingen øvrige ændringer i signatur eller body. Signaturer bevares uændret. Eksisterende `revoke execute ... from public, anon` bevares.
  - `org_node_upsert(uuid, text, uuid, text, boolean, date)` — insert FØR linje 29
  - `org_node_deactivate(uuid, date)` — insert FØR linje 56
  - `team_close(uuid, date)` — insert FØR linje 84 (efter node_type pre-check)
  - `employee_place(uuid, uuid, date)` — insert FØR linje 104
  - `employee_remove_from_node(uuid, date)` — insert FØR linje 127
- **Afhængigheder:** ingen (frittstående CREATE OR REPLACE)
- **Migration-fil:** `supabase/migrations/20260521100000_t9_supplement_2_wrappers_session_var.sql`
- **Risiko:** lav. Rollback: `create or replace` til T9-supplement-version uden session-var (men det re-introducerer G059 — kun gør hvis post-deploy-fejl tvinger).

### Step S2 — Migration: G057 superadmin-bypass på 2 apply-handlers

- **Type:** migration (CREATE OR REPLACE på 2 RPCs)
- **Hvad:** Tilføj `v_admin_involved`-bypass på (a) team-aktiv-checken i `_apply_client_place` (linje 159-167 i T10.7b-version) og (b) allerede-inaktiv-checken i `_apply_team_close` (linje 598-601 i T9-supplement). Bypass-mønstret er identisk med T10.7b's klient-aktiv-bypass: hent `requested_by` + `approved_by` fra pending-rækken; bypass hvis enten er superadmin via `is_admin_by_employee_id`.
- **Eksakt indhold:**

  **`_apply_client_place`** — udvider T10.7b-version (`20260521000008_t10_client_active_check.sql:134-228`). Genbruger eksisterende `v_admin_involved`-variabel (declared linje 148). Strukturen flyttes:
  - Klient-eksistens-check (P0002) bevares position (eksisterende V14-logik fra T10.7b)
  - `v_admin_involved`-beregning flyttes ØVERST (FØR team-aktiv-check) så bypass kan bruges på begge invarianter
  - Team-aktiv-check (linje 159-167) får `... and not v_admin_involved`-betingelse på exception-raise
  - Klient-aktiv-check (linje 189-192) bevarer eksisterende `not v_admin_involved`-betingelse uændret
  - Resten af handler (placement-INSERT/UPDATE/split, linje 197-225) uændret
  - Pseudo-SQL:

    ```sql
    -- Beregn v_admin_involved ØVERST (flyttet fra midt i body)
    v_admin_involved := false;
    if p_pending_change_id is not null then
      select requested_by, approved_by into v_requested_by, v_approved_by
        from core_identity.pending_changes where id = p_pending_change_id;
      v_admin_involved := is_admin_by_employee_id(v_requested_by)
        or (v_approved_by is not null and is_admin_by_employee_id(v_approved_by));
    end if;

    -- Team-aktiv-check med bypass
    if not exists (...team aktiv på effective_from...) and not v_admin_involved then
      raise exception 'client_placement_requires_active_team: %' using errcode = 'P0001';
    end if;

    -- Klient-eksistens-check (uændret)
    select is_active into v_client_active from core_identity.clients where id = v_client_id;
    if not found then raise ... 'client_not_found'; end if;

    -- Klient-aktiv-check (uændret bypass-logik)
    if v_client_active = false and not v_admin_involved then
      raise ... 'client_inactive';
    end if;

    -- Resten uændret
    ```

  **`_apply_team_close`** — udvider T9-supplement-version (`20260520000000_t9_supplement.sql:557-640`). Tilføj `v_admin_involved`-variabel og bypass-logik FØR `team_close_already_inactive`-raise (linje 598-601). Strukturelle vagter (`team_close_no_active_version_at` P0002 + `team_close_not_team` 22023) bevares UDEN bypass.
  - Pseudo-SQL:

    ```sql
    -- Tilføj declares:
    --   v_requested_by uuid;
    --   v_approved_by uuid;
    --   v_admin_involved boolean;

    -- Eksisterende vagter (uændret):
    --   1. team_close_no_active_version_at (P0002) — strukturel
    --   2. team_close_not_team (22023) — strukturel

    -- NY: bypass-beregning FØR forretnings-vagten
    v_admin_involved := false;
    if p_pending_change_id is not null then
      select requested_by, approved_by into v_requested_by, v_approved_by
        from core_identity.pending_changes where id = p_pending_change_id;
      v_admin_involved := is_admin_by_employee_id(v_requested_by)
        or (v_approved_by is not null and is_admin_by_employee_id(v_approved_by));
    end if;

    -- Forretnings-vagt med bypass + idempotency
    if not v_active.is_active then
      if v_admin_involved then
        -- Idempotency-no-op: target er allerede inaktiv → handler returnerer uden mutationer
        return;
      end if;
      raise exception 'team_close_already_inactive: %' using errcode = '22023';
    end if;

    -- Resten uændret (split-at-boundary + cascade på employee/client-placements)
    ```

- **Afhængigheder:** S1 (rækkefølge-disciplin; ikke fundamental). Begge bruger `is_admin_by_employee_id` defineret i T10.7b — verificeret eksisterer.
- **Migration-fil:** `supabase/migrations/20260521100001_t9_supplement_2_superadmin_bypass.sql`
- **Risiko:** mellem. Rollback: `create or replace` tilbage til T10.7b-version af `_apply_client_place` + T9-supplement-version af `_apply_team_close`. Idempotency-no-op for `_apply_team_close` skifter ikke data-tilstand → ingen data-rollback nødvendig. **Bemærk:** Hvis pending allerede er apply'et for et allerede-inaktivt team, vil rollback ikke gen-fejle den (status er allerede 'applied') — det er per definition idempotency-modellen.

### Step S3 — Smoke-tests

- **Type:** test (4 nye smoke-tests)
- **Hvad:** Verificér wrapper-flow end-to-end for de 5 G059-wrappers + verificér de 2 G057-bypass-scenarier.
- **Eksakt indhold (5 wrapper-flow + 2 bypass-flow):**

  **`supabase/tests/smoke/t9_supplement_2_wrappers_session_var.sql`** — én test pr. wrapper (5 stk i samme fil).

  Genbruger rolle-swap-mønstret fra `t10_client_active_check.sql:1-60`:
  - Find 2 auth-backed superadmins (Kasper + Mathias)
  - Opret buffer-admin FØR rolle-swap (admin-floor)
  - Swap én superadmin's role_id til non-admin-rolle med relevante page-permissions (`org_nodes/manage` + `employee_placements/manage`)
  - Sæt `request.jwt.claims` → simuler non-admin authenticated context
  - Kald hver wrapper → verificér `pending_changes` får ny række (UDEN at session-var er pre-set i test-context)
  - ROLLBACK restorer rolle

  Test-cases:
  - W1: `org_node_upsert` → ny pending oprettet
  - W2: `org_node_deactivate` → ny pending oprettet
  - W3: `team_close` → ny pending oprettet
  - W4: `employee_place` → ny pending oprettet
  - W5: `employee_remove_from_node` → ny pending oprettet

  **`supabase/tests/smoke/t9_supplement_2_superadmin_bypass.sql`** — én test pr. bypass-scenarie (2 stk i samme fil).

  Test-cases:
  - B1: superadmin opretter + approver pending `client_place` på team der bliver inaktivt før apply → `_apply_client_place` succeeds (team-aktiv-check bypasset via `v_admin_involved`)
  - B2: superadmin opretter + approver pending `team_close` mod allerede-inaktivt team → `_apply_team_close` succeeds som no-op (idempotency)
  - B3 (negativ kontrol): non-admin opretter + approver pending `team_close` mod allerede-inaktivt team → raise `team_close_already_inactive` (vagten holder for non-admin)
  - B4 (negativ kontrol): non-admin opretter + approver pending `client_place` på inaktivt team → raise `client_placement_requires_active_team`

- **Afhængigheder:** S1 + S2 (testene kalder de patchede RPCs)
- **Migration-fil:** N/A (testene ligger i `supabase/tests/smoke/`, ikke migrations)
- **Risiko:** lav. Rolle-swap-mønstret er allerede valideret i `t10_client_active_check.sql`.

---

## Fundament-tjek-passeret

Lille-pakke. Bevarer tabel for disciplin-konsistens (V2-reduktion: 4 tjek).

| Tjek                                                               | Status | Reference                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hver write-RPC har GRANT + INSERT/UPDATE-policy + session-var      | ja     | S1 sætter session-var på 5 wrappers; GRANT INSERT på `pending_changes` blev sat i T9-fundament-supplement (`20260518100000:34`); INSERT-policy `pending_changes_insert` blev sat i T9-fundament-supplement (linje 49-51). Ingen ny tabel introduceres. |
| Hver SELECT-policy bred nok til legitime læsere                    | N/A    | Ingen nye tabeller eller SELECT-policies introduceres. Eksisterende `pending_changes_select` (T9-fundament-supplement linje 64-83) dækker change_type → page_key-mapping for org_nodes / employee_placements / client_placements — uændret.            |
| Eksempel-row verificeret gennem flow                               | ja     | S3 smoke-test W1-W5 verificerer pending-INSERT for hver wrapper som non-admin authenticated; B1-B4 verificerer apply-flow med + uden bypass.                                                                                                           |
| Plan-detaljer eksplicit (ingen "TBD" / "Code afgør" / overladelse) | ja     | S1+S2 har pseudo-SQL pr. RPC; S3 har konkrete test-cases.                                                                                                                                                                                              |

---

## Test-konsekvens

- **Test-fil:** `supabase/tests/smoke/t9_supplement_2_wrappers_session_var.sql` (NY)
- **Hvad verificeres:** 5 wrapper-RPCs kan oprette pending-change-rækker som non-admin authenticated bruger med relevant `manage`-permission.
- **Forventet status:** grøn

- **Test-fil:** `supabase/tests/smoke/t9_supplement_2_superadmin_bypass.sql` (NY)
- **Hvad verificeres:** (B1) superadmin bypasser team-aktiv-check i `_apply_client_place`; (B2) superadmin bypasser allerede-inaktiv-check i `_apply_team_close` som idempotency-no-op; (B3+B4) negative kontroller — vagter holder for non-admin.
- **Forventet status:** grøn

- **Eksisterende tests:** `t9_public_wrapper_rpcs.sql`, `t9_pending_changes.sql`, `t10_client_active_check.sql` — verificér de fortsat passerer (regression-tjek). `_apply_client_place`-mutation rammer kun team-aktiv-vagten med ny `and not v_admin_involved`-clause; eksisterende tests sender non-admin uden allerede-bypass-trigger, så ingen ændret tilstand forventes.

---

## Build-fase halt-håndtering

- **Forventede WORKAROUND-kandidater:** ingen forventet. Pakken bruger eksisterende mønstre (session-var pattern, is_admin_by_employee_id-bypass) der er valideret i T9-fundament-supplement og T10.7b.
- **Forventede PLAN-AFVIGELSE-scenarier:** ingen forventet. To migrations + to smoke-test-filer er konkret afgrænset.
- **Kritiske invarianter der ikke må brydes:**
  - FORCE RLS på `pending_changes` bevares (INSERT-policy uændret; wrappers sætter session-var som forventet).
  - Strukturelle vagter (`team_close_not_team`, `team_close_no_active_version_at`, `client_placement_node_not_team`) bevares uden bypass per 2026-05-21-afgørelse-afgrænsning.
  - `is_admin_by_employee_id` signatur uændret (genbrugt, ikke ændret).
  - Eksisterende klient-aktiv-bypass i `_apply_client_place` (T10.7b) bevares funktionelt — re-skrivning er kun struktur-omarrangering med samme logiske resultat.

---

## Risiko + kompensation

| Migration                | Værste-case                                                                                                                                                                                                                         | Sandsynlighed | Rollback                                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------- |
| S1 (5 wrappers)          | Session-var sættes på SECURITY DEFINER-funktion → outer-scope policy-evaluering kunne påvirkes. **Mitigation:** verificeret at `set_config(..., true)` (true = local til transaktion) er den variant T10.7b-klient-wrappers bruger. | lav           | `create or replace` til T9-supplement-version uden session-var (re-introducerer G059, men fjerner risiko). |
| S2 `_apply_client_place` | Bypass-restrukturering ændrer rækkefølgen af checks. **Mitigation:** klient-eksistens-check bevares position; team-aktiv-check + klient-aktiv-check får begge `not v_admin_involved`. Pseudo-SQL specificerer eksakt rækkefølge.    | lav           | `create or replace` til T10.7b-version.                                                                    |
| S2 `_apply_team_close`   | Idempotency-no-op kunne maskere fejl-scenarier. **Mitigation:** `return` sker KUN når både `v_active.is_active = false` OG `v_admin_involved = true`. Non-admin rammer fortsat `raise exception`.                                   | lav           | `create or replace` til T9-supplement-version uden bypass.                                                 |
| S3 (smoke-tests)         | Rolle-swap-mønstret er testet i T10.15. Risiko at admin-floor brydes mellem swap og restore. **Mitigation:** buffer-admin oprettes FØR swap (samme mønster som T10.15).                                                             | lav           | Drop testene; pakke-leverancen er migrations.                                                              |

**Kompensation hvis hele pakken fejler under build:** revert S1+S2 migrations. G057 + G059 forbliver åbne i `teknisk-gaeld.md`. Cutover er ikke berørt (G057 + G059 er ikke cutover-blockers per `cutover-checklist.md`).

---

## Oprydnings- og opdaterings-strategi

**Filer der skal flyttes til arkiv** (efter pakken er merget):

- `docs/coordination/t9-supplement-2-plan.md` → `docs/coordination/arkiv/`
- `docs/coordination/t9-supplement-2-forretningsgang-code.md` → `docs/coordination/arkiv/`
- `docs/coordination/t9-supplement-2-forretningsgang-codex.md` → `docs/coordination/arkiv/`
- `docs/coordination/t9-supplement-2-forretningsgang-claude-ai.md` → `docs/coordination/arkiv/`
- `docs/coordination/t9-supplement-2-forretningsgang-konsolideret.md` → `docs/coordination/arkiv/`
- Eventuelle `docs/coordination/plan-feedback/t9-supplement-2-*.md` → `docs/coordination/arkiv/`

**Filer der skal slettes:** ingen.

**Konsekvens-opdateringer for autoritative dokumenter:**

| Dokument                                   | Konsekvens? | Opdatering der laves i denne pakke                                                                                             |
| ------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `docs/strategi/stork-2-0-master-plan.md`   | nej         | Pakken implementerer eksisterende §1.7-ramme (T9-omstart-rammen punkt 12-13). Ingen master-plan-ændring.                       |
| `docs/strategi/bygge-status.md`            | ja          | Tilføj entry: T9-supplement-2 fuldført (G057 + G059 lukket via wrappers session-var + superadmin-bypass per 2026-05-21-ramme). |
| `docs/coordination/mathias-afgoerelser.md` | nej         | 2026-05-21-entry er allerede committed (PR #67). Pakken anvender den, tilføjer ikke ny ramme.                                  |
| `docs/teknisk/teknisk-gaeld.md`            | ja          | Flyt **G057** og **G059** fra "Åben gæld" til arkiv-sektion (eller marker "LØST 2026-05-21 via T9-supplement-2").              |

**Standard-opdateringer:**

- `docs/coordination/aktiv-plan.md` → opdater "Aktuel: T9-supplement-2 (plan V1 under review)" under plan-fase; ryd til "ingen aktiv pakke" efter merge.
- `docs/coordination/seneste-rapport.md` → opdater til slut-rapport-fil efter merge.

**Reference-konsekvenser:** ingen filer om-døbes eller flyttes inden for pakken (kun arkivering efter merge).

---

## Konsistens-tjek

- **Disciplin-pakke:** Plan-leverance er kontrakt (Mathias-feedback). Recon-først udført (Verificerede afhængigheder ovenfor). Stop-og-spørg-disciplin: Lille pakke skipper krav-dok-skrivning per V3 Step 1.2; ÅBNE spørgsmål 1+2 fra konsolidering er afgjort i 2026-05-21-entry.

---

## Fire-dokument-konsultation

Lille pakke uden krav-dok (Step 1.5 skipped per V3 Step 1.2). Fjerde dokument-række anvender recon-output som pakke-kontrakt-proxy.

| Dokument                                                    | Konsulteret | Status           | Relevante referencer                                                                                                                                                                                                                                                                                                                       | Konflikt med plan? |
| ----------------------------------------------------------- | ----------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| `docs/strategi/vision-og-principper.md`                     | ja          | LÅST-AUTORITATIV | Princip 2 ("Superadmin er eneste hardkodede rolle") — etableret som permission/synligheds-akse, udvidet til bypass-akse via 2026-05-21-entry.                                                                                                                                                                                              | nej                |
| `docs/strategi/stork-2-0-master-plan.md`                    | ja          | RETNINGSGIVENDE  | §1.7 T9-omstart-rammen punkt 12 (hvem må oprette/ændre/lukke knuder styres via UI-rettigheder) + punkt 13 (alle ændringer med gældende dato følger fortrydelses-mekanisme).                                                                                                                                                                | nej                |
| `docs/coordination/mathias-afgoerelser.md`                  | ja          | RETNINGSGIVENDE  | 2026-05-21 (superadmin-bypass-ramme + idempotency-model, PR #67) — pakkens primære kilde; 2026-05-17 punkt 6 (strukturelle invarianter bypasses ikke); 2026-05-17 punkt 10 (synlighed=Alt); 2026-05-17 punkt 12+13 (ramme-låst pending-change-flow).                                                                                       | nej                |
| **Recon-output** (proxy for krav-dok pga. Lille pakke skip) | ja          | PAKKE-KONTRAKT   | `t9-supplement-2-forretningsgang-konsolideret.md` (matrix + ÅBNE spørgsmål, begge afgjort); `t9-supplement-2-forretningsgang-code.md` (file:linje-evidens for G057+G059); `t9-supplement-2-forretningsgang-codex.md` (vagts-typer + apply-handler-referencer); `t9-supplement-2-forretningsgang-claude-ai.md` (forretningsgang-fundament). | nej                |

---

## Konklusion

Pakken er Lille opfølgnings-fix der lukker to T9-fundament-mangler observeret under trin 10. Begge løses ved at genbruge eksisterende mønstre (session-var fra T9-fundament-supplement; employee-id-bypass fra T10.7b) — ingen ny strukturel beslutning, ingen master-plan-ændring, ingen ny tabel eller index. To migrations + to smoke-test-filer. Acceptabel risiko (lav på alle 4 risiko-rækker). **Klar til Codex parallel kode-research-runde V1.**
