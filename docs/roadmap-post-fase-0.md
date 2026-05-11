# Stork 2.0 — roadmap post-fase-0

Skitser af arbejdspakker der ligger **efter** fase 0 (lag A-D6).
Indeholder placering, omfang og forudsætninger — ikke implementation.
Hvert punkt er bevidst kortfattet; fuld design-runde sker når punktet
nås på roadmap'et.

Filen er fremtidig planlægning. Session-state for det aktuelle arbejde
ligger i `handoff-fase-0-session-N.md`.

---

## 1. UI-editor for `data_field_definitions`

**Hvorfor punktet eksisterer:** D1's `data_field_definitions`-tabel og
D1.5's seed gør klassifikation til konfiguration. Men så længe værdier
kun kan ændres via SQL eller `data_field_definition_upsert()`-RPC, er
"UI-konfigurerbar" en ambition, ikke en realitet. Mathias' bærende
princip ("alt skal styres i UI, også når ny lovgivning kommer") kræver
en faktisk superadmin-side.

**Placering:** Lag F (frontend-omskrivning) eller dedikeret
post-lag-F "admin tools"-fase.

**Forudsætninger:**

- D4 lander: `is_admin()` redefineres til at læse `role_page_permissions`.
  Indtil da returnerer den false og blokerer alle write-RPCs.
- D5 lander: lag E's PII-bærende tabeller er på plads og klassificeret,
  så list-viewet faktisk har noget at vise.
- D6 lander: Phase 2 (strict) håndhæver at hver kolonne er klassificeret;
  uden den kan UI-editor vise huller men ikke forhindre dem.

**Omfang (skitse):**

- Route: `/admin/data-classification` (page-permission gated via
  `role_page_permissions`)
- List view: alle rækker fra `data_field_definitions`, filtrering på
  `table_schema`/`table_name`/`category`/`pii_level`/`retention_type`,
  søgning på `column_name` og `purpose`
- Inline edit: `pii_level`, `category`, `retention_type`,
  `retention_value`, `purpose`, `match_role`
- Submit → `data_field_definition_upsert()`-RPC (eksisterer fra D1)
- `change_reason`-felt påkrævet i UI (matcher RPC's krav om non-empty
  change_reason for audit-berigelse)
- Client-side validering af `retention_value`-struktur pr.
  `retention_type` — speilet på server (D1's
  `data_field_definitions_validate_retention()`-trigger validerer
  uanset)
- Audit-trail auto via `stork_audit()`-trigger (allerede attached på
  `data_field_definitions` i D1)
- Read-only fields: `id`, `table_schema`, `table_name`, `column_name`,
  `created_at`, `updated_at` (kan ikke ændres via UI)
- Bulk-edit (optional, lav prioritet): vælg flere rækker → sæt fælles
  `retention_type` eller `pii_level`

**Ikke i scope:**

- Tilføj nye rækker (kun via migration, fanget af migration-gate)
- Slet rækker (kun via migration når en kolonne droppes;
  `data_field_definition_delete()`-RPC eksisterer men skal kaldes med
  forsigtighed)

---

## 2. GDPR retroaktiv-mekanisme

**Hvorfor punktet eksisterer:** UI-klassifikations-ændringer gælder
fremad-kun (eksisterende `audit_log`-rækker bevares uændret af C4.1's
immutability-trigger). Når ny lovgivning eller GDPR-anmodning kræver
**historisk** sletning eller hashing af data, skal det være en
EKSPLICIT operation — ikke en sideeffekt af UI-ændring. Den eneste vej
til at modificere `audit_log`'s historik er via en dedikeret
mekanisme med streng adgangskontrol og kompleta logging.

**Placering:** Efter D6 (kræver fuld klassifikation på plads), før
eller som del af lag F's compliance-arbejde. Ikke et D-lag-anliggende.

**Forudsætninger:**

- D1.5 + D6 lander: klassifikation er komplet og strict.
- Roller for "compliance officer" defineret i `role_page_permissions`.
  Stærkere end almindelig `is_admin()` — handlingen er irreversibel.

**Komponenter (skitse):**

### 2.1 Tabel `gdpr_retroactive_operations`

Immutable INSERT-only register af alle udførte operationer.

```
id                        uuid PK
triggered_at              timestamptz
triggered_by              uuid (auth.uid())
legal_basis               text NOT NULL  -- fx 'GDPR Art. 17 sletning'
reason                    text NOT NULL  -- fri-tekst kontekst
target_filter             jsonb          -- hvad blev ramt
mode                      text CHECK IN ('HASH', 'REDACT', 'DELETE_ROWS')
rows_affected             integer
audit_log_rows_affected   integer
```

Standard pattern: FORCE-RLS + REVOKE + audit-trigger + immutability-trigger.

### 2.2 RPC `gdpr_retroactive_remove(...)`

SECURITY DEFINER funktion. Eneste vej til at modificere `audit_log`
historisk.

Parametre:

- `target_filter jsonb` — fx `{"table_name": "clients", "column_name": "email"}`
  eller `{"actor_user_id": "...", "occurred_at_before": "..."}`. Bestemmer
  hvilke rækker / kolonner / værdier rammes.
- `legal_basis text` — krævet
- `reason text` — krævet
- `mode text` — `HASH` / `REDACT` / `DELETE_ROWS`

Permission-check: `is_compliance_officer()` (ny helper, stærkere end
`is_admin()` — kræver dedikeret rolle).

Implementering:

1. INSERT i `gdpr_retroactive_operations` med pre-tælling = 0
   (opdateres til sidst).
2. Sæt session-vars:
   - `stork.gdpr_retroactive = 'true'` (eneste vej til at bypasse
     C4.1's immutability-trigger)
   - `stork.source_type = 'manual'`
   - `stork.change_reason = legal_basis || ': ' || reason`
3. Eksekver mode:
   - **HASH:** UPDATE matched columns i jsonb-felter til
     `sha256(value::text)::text` (eller pgcrypto-equivalent)
   - **REDACT:** UPDATE matched columns til fast streng `'[REDACTED]'`
   - **DELETE_ROWS:** DELETE matched audit_log-rækker (sjælden; kun ved
     retsbeslutning)
4. UPDATE `gdpr_retroactive_operations`-rækken med faktiske antal
   ramte rækker.

### 2.3 Modificering af `audit_log_immutability_check()` (C4.1's trigger)

Migration der tilføjer én exception-vej:

```sql
IF current_setting('stork.gdpr_retroactive', true) = 'true' THEN
  -- tillad mutation; logger sker via gdpr_retroactive_operations
  RETURN ...;
END IF;
-- Standard immutability-block fortsætter
```

Session-var sættes KUN af `gdpr_retroactive_remove()`. Ingen andre veje
til at sætte den (`SET LOCAL` i andre RPCs blokeres via konvention og
fitness-check der scanner for unauthorized brug).

### 2.4 Backup-paradox

GDPR-anmodninger gælder også backups. Mulige håndteringer:

- **Backup-retention ≤ lovgivnings-frist:** Hvis Supabase backup-retention
  er fx 7 dage, og GDPR-sletning sker, vil backup'en aldrig overstige
  fristen før den selv-roteres ud. Default-anbefaling.
- **Manuelt backup-gennemgang:** Ved GDPR-anmodning gennemgås
  tilgængelige backups manuelt og opdateres. Komplekst men nogle gange
  uundgåeligt.

**Beslutning:** Skal afklares når mekanismen bygges. Påvirker
backup-konfiguration i Supabase.

### 2.5 Idempotens

Re-kørsel af samme `target_filter` med `HASH`-mode skal være sikker —
hashede værdier matcher ikke originale filtre længere, så 0 rækker
opdateres. Test-coverage skal verificere dette eksplicit.

### 2.6 Audit-trail af selve operationen

Hver kørsel skriver ét row til `gdpr_retroactive_operations` (immutable
audit). `gdpr_retroactive_operations` selv er auditeret via
`stork_audit()` trigger som alle andre tabeller. Resultat: dobbel
audit-trail af GDPR-handlinger.

### Ikke i scope (endnu)

- Automatisk GDPR-portal til klient self-service. Det er en
  brugerflade oven på `gdpr_retroactive_remove()` — separat punkt.
- Anonymisering af `employees`-master (UPDATE af PII-felter, ikke
  audit-historik) er en separat RPC i lag D3 / lag F.

---

## 3. Anonymiserings-RPC for master-tabeller

**Hvorfor punktet eksisterer:** Anonymisering = UPDATE af master-rækken
(ikke DELETE). Det er bærende princip per Mathias' låste afgørelse.
PII-felter erstattes med placeholder eller hash; master-rækken bevares
evigt med samme id; audit-FK'er forbliver gyldige.

**Placering:** Lag F (frontend) — eller dedikeret compliance-fase
sammen med GDPR retroaktiv-mekanisme.

**Forudsætninger:**

- D3 lander: `employees`-tabel med PII-felter (navn, email,
  CPR/billing-data m.fl.) klassificeret som `pii_level='direct'`.
- D5 lander: klient-master-tabeller (`clients` eller hvad lag E
  bestemmer) klassificeret.

**Omfang (skitse):**

- RPC `anonymize_employee(p_employee_id uuid, p_legal_basis text, p_reason text)`
- RPC `anonymize_client(p_client_id uuid, p_legal_basis text, p_reason text)`
- Begge SECURITY DEFINER med `is_compliance_officer()`-permission
- UPDATE PII-felter til `'[anonymized]'` eller sha256-hash
- audit_log fanger ændringen automatisk via stork_audit()-trigger
- audit_log's `actor_user_id` og lignende FK'er BEVARES uændret —
  pointer til den nu-anonymiserede master-række er stadig gyldig

**Bemærk skel fra GDPR retroaktiv:**

- **Anonymisering** = fremadrettet beskyttelse af master-data; audit-historik
  bevares uændret. Almindelig drift-handling (medarbejder stopper, klient
  ophører).
- **GDPR retroaktiv** = historisk modificering af audit-data; eksplicit
  handling ved lovgivnings-anmodning.

De to er separate mekanismer der ikke deler kode-veje.

---

## 4. `is_compliance_officer()` helper-funktion

Forudsætning for både GDPR retroaktiv og anonymiserings-RPCs.

**Placering:** Sammen med GDPR retroaktiv-arbejdet.

**Omfang:**

- `public.is_compliance_officer()` returnerer boolean
- Læser fra `role_page_permissions` (samme tabel som `is_admin()`
  bruger efter D4) — speciel page eller permission der markerer
  compliance-rolle
- Strictere end `is_admin()`: compliance officer-rolle skal aktiveres
  eksplicit, ikke arves fra admin-rolle

---

## 5. Backup-konfiguration review

Påvirket af GDPR retroaktiv-mekanismens valg.

**Placering:** Sammen med GDPR retroaktiv-arbejdet.

**Omfang:**

- Verificer Supabase backup-retention-indstillinger
- Beslut: backup-retention ≤ kortest forventede GDPR-respons-frist (fx
  7 dage), ELLER manuelt backup-håndterings-procedure
- Dokumentér valget i `supabase/README.md`

---

## 6. Performance-overvejelser for `audit_filter_values()` (sen-fase)

Når D2 implementerer faktisk hashing af `pii_level='direct'`-kolonner,
kalder triggeren `data_field_definitions`-lookup pr. INSERT/UPDATE i
hver auditeret tabel.

**Aktuel risiko:** Lav. 76 klassifikations-rækker, lav audit-volumen i
fase 0.

**Sen-fase risiko:** Med 500-1000 klassifikations-rækker og højvolumen
audit-writes kan lookup blive en hot-path.

**Mitigerings-optioner (vurderes når aktuel):**

- LISTEN/NOTIFY-baseret invalidering af session-lokal cache
- Materialiseret view over `data_field_definitions` med skemavi+navn
  som key, refreshed ved ændring
- Index-only-scan optimisering

**Placering:** Ikke besluttet — tages op hvis performance-data viser
behov. Ingen handling i fase 0.

---

## 7. UI-editor for `pay_period_settings` og lignende konfig-tabeller

Når UI-editor for `data_field_definitions` er etableret som mønster,
giver det mening at gentage for andre singleton-config-tabeller:

- `pay_period_settings` (eksisterer)
- Fremtidige config-tabeller (notifikationer, integration-keys,
  retention-overrides m.fl.)

**Placering:** Lag F, efter `data_field_definitions`-UI.

**Omfang:**

- Generisk konfig-editor-komponent (én CRUD-side pr. tabel)
- Eller dedikerede sider pr. konfig-tabel hvis felter har specifik
  validation

---

## 8. Migration-gate Phase 2 flip og DB-backed klassifikation (D6)

**Status:** D6 er sidste step i fase 0, ikke post-fase. Inkluderet her
som reminder om at den blokerer flere post-fase-punkter.

**D6's specifikke krav:**

- `MIGRATION_GATE_STRICT=true` i CI environment
- Switch fra fil-baseret `classification.json` til DB-baseret
  `data_field_definitions`
- Migration-gate tjekker KUN existence af kolonne-row, IKKE
  specifikke værdier af `pii_level`/`category`/`retention_type` etc.
  (kritisk princip — værdier er UI-konfiguration, må ikke kræve
  kode-deploy at ændre)
- 5 fitness-checks fra lag C-rapport (se handoff §7)

**Forudsætninger:** D1.5 seedet + D5 leveret med klassifikations-rækker
pr. tabel.

---

## 9. `clients` SELECT-policy — rolle-baseret read-adgang

**Hvorfor punktet eksisterer:** D5's `clients_select`-policy er
`USING (public.is_admin())` — pragmatisk start. Det betyder kun admins
kan se klient-data via direkte PostgREST-SELECT. Sælgere skal også
kunne se klienter (med scope-filtrering), men det er ikke implementeret.

**Placering:** Lag F, sammen med `role_page_permissions`-UI.

**Omfang (skitse):**

- Definer page_key `clients` i `role_page_permissions` (UI tilføjer)
- Erstat `clients_select`-policy med en helper-funktion fx
  `is_authorized_for_clients()` der konsulterer
  `role_page_permissions.page_key='clients'` + scope:
  - scope `all` → adgang til alle clients
  - scope `team` → adgang til clients tilknyttet eget team (kræver
    teams-mapping fra lag E)
  - scope `self` → adgang til clients tilknyttet egen `employee_id`
    (kræver sales/opportunities-mapping fra lag E)
- Policy: `is_admin() OR is_authorized_for_clients()`
- Helper kan også bruges af RPC'er der returnerer filtreret data

**Afhængigheder:** lag E (teams + sales/opportunities-mapping) skal
være tilstrækkeligt langt til at understøtte scope='team' og 'self'.

---

## 10. `clients.fields` jsonb — filtreret read for ikke-admins

**Hvorfor punktet eksisterer:** D5's `audit_filter_values()`
client-special-case hasher `pii_level='direct'`-keys ved skrivning til
`audit_log`. Men SELECT på `public.clients` returnerer `fields` i klar
til den læser. Det er OK for admins (som er adgangskontrolleret via
SELECT-policy), men når sælgere får read-adgang i pkt 9, skal direct-
PII filtreres FØR jsonb returneres til dem.

**Placering:** Lag F, sammen med pkt 9.

**Omfang (skitse):**

- Byg dedikeret read-RPC fx `clients_read(p_client_id uuid)` eller
  `clients_list(p_filter jsonb)` der:
  - Konsulterer current employee's permission (`is_admin()` eller
    `is_authorized_for_clients()`)
  - For ikke-admins: kald en parallel-funktion til
    `audit_filter_values()` der hasher eller redacter
    `pii_level='direct'`-keys i fields-jsonb baseret på
    `client_field_definitions`
  - Returnerer filtreret jsonb
- Alternativ: byg en `clients_view`-VIEW med samme filtreringslogik;
  RLS-policy på view'en bestemmer hvad ikke-admins kan SELECT
- Direct PII filtreres KUN ved SELECT for ikke-admins; ved
  audit-skrivning bevares D5's filter-logik for ALLE skrivninger

**Risici hvis ikke håndteret:** sælgere ser direct-PII på klienter de
ikke skulle se rå data om.

---

## 11. UI-validering af `clients.fields` før submit (lag F)

**Hvorfor punktet eksisterer:** D5's `clients_validate_fields`-trigger
er LENIENT default — den logger WARNING ved ukendte/inaktive keys men
accepterer INSERT/UPDATE alligevel. Strict-mode toggle via session-var
`stork.clients_fields_strict='true'` eksisterer men er ikke
default-aktiveret.

Hvis UI'en (lag F) ikke validerer felter mod
`client_field_definitions` før submit, kan en typo eller forældet UI
oprette client-rækker med felter der ikke matcher schema'et. LENIENT
trigger accepterer dem; ingen får besked.

**Placering:** Lag F, klient-edit-side.

**Omfang (skitse):**

- Hent aktive `client_field_definitions` (cached) ved page-load
- UI viser kun felter der er `is_active=true`
- Submit-validering:
  - Required-felter er sat (matcher `required=true`)
  - Field-types matcher (`email` skal være validt email,
    `phone` skal være phone-format, etc.)
  - Ingen ekstra keys ud over de aktive definitioner
- DB-trigger forbliver LENIENT som sikkerhedsnet; UI er primær gate
- Når UI-validering er stabil, kan stork.clients_fields_strict'true'
  aktiveres globalt (D6-pattern) for at fange edge-cases

**Afhængigheder:** lag F's clients-side bygges.

---

## Roadmap-opsummering — afhængigheds-rækkefølge

```
D1.5 (seed) → D2 → D3 → D4 → D5 → D6 → lag E → lag F
                                              │
                                              ├─ UI-editor data_field_definitions  (pkt 1)
                                              ├─ UI-editor pay_period_settings     (pkt 7)
                                              ├─ clients SELECT-policy udvidelse   (pkt 9)
                                              ├─ clients.fields filtreret read     (pkt 10)
                                              ├─ UI-validering af clients.fields   (pkt 11)
                                              │
                                              └─ Compliance-fase
                                                  ├─ is_compliance_officer()       (pkt 4)
                                                  ├─ Anonymiserings-RPCs           (pkt 3)
                                                  ├─ GDPR retroaktiv-mekanisme     (pkt 2)
                                                  └─ Backup-konfiguration          (pkt 5)

(pkt 6: performance — på tværs, tages op ved behov)
```

Rækkefølgen er ikke endelig. Lag F (frontend) kan med fordel starte
parallelt med dele af compliance-fasen hvis ressourcer tillader det.
