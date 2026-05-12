# Stork 2.0

Konsolideret fundament. Single source of truth for strategiske beslutninger om Stork 2.0.

Hver beslutning står ét sted. Lukkede beslutninger er markeret **[LÅST]**. Åbne beslutninger er markeret **[ÅBEN]** med kategori for hvornår de skal afgøres. Tidligere overvejede løsninger der er erstattet, står samlet under §13.

Filen erstatter ikke kode-dokumentation eller migration-historik i repoet. Den beskriver det strategiske fundament.

---

# 1. Kontekst

**Stork** er Copenhagen Sales ApS' interne salgs- og lønsystem. Stork 1.0 kører i drift med 100+ aktive brugere; Stork 2.0 bygges greenfield ved siden af. 1.0 er reference for forståelse, ikke skabelon for kode.

**Ejere:** Mathias Dandanel Grubak (adm.dir., beslutter) og Kasper (partner). To personer. Ingen QA, intet DevOps-team.

**Klienter:** Tryg, Finansforbundet, ASE, Nuuday-brands (YouSee, TDC Erhverv, Eesy m.fl.).

**Stack:** React + TypeScript + Supabase. 2.0 lever på separat Supabase-projekt `imtxvrymaqbgcvsarlib`.

**Repo:** github.com/copenhagensales/stork-2.0, branch `claude/review-phase-zero-plan-oW5Cg`.

**Sprog:** Dansk. Altid.

## Aktører

| Aktør             | Rolle                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| Mathias           | Beslutter. Definerer retning. Reviewer specifikationer og kode. Stopper arbejdet hvis AI'erne glider. |
| Kasper            | Partner. Bagvedlæggende rolle.                                                                        |
| Claude.ai         | Strategisk sparringspartner. Ingen repo-adgang. Formulerer prompts, holder flow, mellemmand.          |
| Claude Code (CLI) | Arkitekt. Repo-adgang + Supabase MCP. Bygger fase 0-mekanismer, schemas, `@stork/core`.               |
| Codex             | Kodevalidator. Repo-adgang. Reviewer Code's arbejde.                                                  |
| Lovable           | UI-bygger. Bruges fra lag F.                                                                          |

# 2. Vision

Stork 2.0 er ét system med fælles fundament (stamme) og selvstændige applikationer (grene). Det skal kunne forstås, vedligeholdes og vokse — af to partnere med AI som arbejdsredskab.

**Princip.** Én sandhed på tværs af systemet. Logik findes ét sted. UI viser hvad systemet gør.

**Metode.** Forstå, validér, byg, verificér. Hvert skridt bekræftet før det næste. Diagnose før plan. Aldrig plan uden evidens.

**Enkelhed uden kompromis.** Det enkleste der løser problemet. Kompleksitet uden værdi er gæld. Når du rører noget, efterlad det stærkere.

# 3. Bærende principper

## 3.1 Tre principper for data

**Én sandhed.** Hver fakta findes ét sted. Database er sandheden; alt andet (frontend-state, edge-cache, beregningsresultater) er views af samme sandhed. Konflikt mellem to kilder er en fejl, ikke en feature.

**Styr på data.** Hver kolonne har eksplicit semantik. Hver tabel har klassifikation (kategori, PII-niveau, retention). GDPR-compliance er indbygget, ikke add-on.

**Sammenkobling.** Når to fakta hører sammen, er sammenkoblingen eksplicit i datamodellen — ikke implicit i kode. FK-constraints er obligatoriske mellem relaterede entiteter.

## 3.2 Forretningsprincipper

1. **Database er sandheden.** Alt andet er views.
2. **Historik bevares altid.** Med strategi for arkivering og sletning.
3. **Lønperiode låses ved udbetaling.** Formel DB-lås, ikke kode-konvention.
4. **Klient er dimensionen.** Brand findes ikke i 2.0.
5. **Provision ved registrering.** Motivation vigtigere end timing-præcision mod klienternes CRM. Afstemning sker bagud via upload/match.
6. **Single source of truth, også i koden.** Samme forretningsregel må kun eksistere ét sted.
7. **Data-adgang gennem service-lag.** Komponenter tilgår aldrig DB direkte.
8. **Ferieanmodning 5 uger før.** UI-justerbar default.

## 3.3 Systemprincipper

**UI styrer alt der er drift.** Daglig drift (medarbejdere, vagter, pricing-værdier, rettigheder, bookinger, klassifikation, retention, kampagner) styres via UI. Selve systemet (lag-arkitektur, beregningsregler, datastrukturer, fundamentale forretningsregler) bor i kode.

Skelnen: data og værdier = UI. System og beregninger = kode. Forkert default → ret i UI, ikke i ny migration.

**Status er første-klasses koncept.** Status er ikke ad-hoc booleans. Status er navngivet livscyklus med eksplicitte overgange.

**Stamme og grene.** Stammen er stærk og fælles for alle apps (auth, rettigheder, RLS, design-tokens, integration-lag, cron, GDPR, audit). Grenene er selvstændige forretningsområder. Første prioritet i 2.0 er stammen — rodet stamme = rodet grene.

**Anonymisering = UPDATE, aldrig DELETE.** Bærende princip for hele audit-arkitekturen. Master-rækker (employee_id, client_id) bevares evigt for FK-integritet. PII-felter erstattes med placeholder/hash.

**Tre datakilde-veje.** API/webhook (Adversus, Enreach, e-conomic, Twilio), UI-input, fil-upload (CSV/Excel, ZIP fra e-conomic).

## 3.4 Arbejdsprincipper

**Forståelse før handling.** Hvorfor løses opgaven? Hvilke principper påvirkes? Implementation kommer sidst.

**Zone-tvivl er rød zone.** Lønberegning, persondata og DB-skema er altid rød. Rød zone kræver eksplicit godkendelse.

**Konsolidering er ikke nok — oprydning er nødvendig.** Skygge-kode er teknisk gæld. Når du konsoliderer, foreslå sletning af det erstattede.

**Bootstrap-paradokset er reelt.** Disciplin under bygning ≠ disciplin der bygges. Fase 0 etablerer mekanismer FØR forretningslogik bygges.

# 4. Datamodel-fundament

## 4.1 Status-modellen [LÅST]

Et salg har **to dimensioner**:

**Dimension A — Registrerings-status** (på sales-rækken):

- `pending` — endnu ikke afgjort
- `completed` — salget står fast
- `afvist` — systemet eller klient afviser salget

Status er engangs-transition. Når den er sat til completed eller afvist, skifter den ikke.

**Dimension B — Annullering** (separat tabel `cancellations`):
Cancellation er en separat begivenhed der referer salget. Sales-rækken røres ALDRIG når et salg annulleres. Cancellation rammer den lønperiode `deduction_date` peger på, ikke salgsdato.

**Provision-formel:**

```
Provision = Sum(pending + completed) − Cancellations
```

Sælger får provision ved registrering (princip 5). Senere annullering → fradrag i den lønperiode hvor annulleringen lander. Oprindelig udbetaling i gammel periode bevares uændret.

Hvad der sker når pending → afvist (provision tilbageføres som status-ændring eller som cancellation-række?) er ikke endeligt afgjort. Se §11.2.

**Stammen som sandhed.** Det reelle salg er det salg der blev annulleret. Stammen (DB) bevarer fakta. Grenene (beregning, rapportering) kan beregne forskellige perspektiver, men må ikke ændre stammen.

**Kompenserings-mønster.** Når noget skal rettes i låst periode: sales-rækken UPDATEes aldrig (Dimension A er stabil efter accept). Cancellation oprettes som ny række. Salary-correction oprettes som ny række i åben periode. Hele systemet er append-only på historiske data; korrektioner via modposter.

## 4.2 Klassifikations-systemet [BYGGET]

Tabellen `public.data_field_definitions` (12 kolonner, D1) klassificerer hver kolonne i hele systemet. 118 rækker seedet pr. 12. maj 2026 (D1.5 + D3 + D4 + D5).

**Kategorier (5, CHECK-enforced):**

- `operationel` — daglig drift-data (sales, vagter)
- `konfiguration` — UI-styrede værdier
- `master_data` — kerne-entiteter (employees, clients, teams)
- `audit` — audit-trail-data
- `raw_payload` — uberørt indkomst fra integrationer

**PII-niveauer (3, CHECK-enforced):** `none` / `indirect` / `direct`

**Retention-typer (4, CHECK-enforced, med jsonb-config):**

- `time_based` — `{"max_days": <int>}`
- `event_based` — `{"event": <text>, "days_after": <int>}`
- `legal` — `{"max_days": <int>}` (reserveret til lovgivnings-bundne; ingen brugt i fase 0)
- `manual` — `{"max_days": <int>}` eller `{"event": <text>}`

Plus `match_role text` (frit, NULL i fase 0 — lag E definerer enum-værdier), `purpose text NOT NULL` (audit-kontekst).

Validering: `data_field_definitions_validate_retention()` BEFORE INSERT/UPDATE-trigger RAISE'r ved ugyldig jsonb-struktur pr. retention_type.

**RPCs (D1):** `data_field_definition_upsert(...)`, `data_field_definition_delete(...)`. Begge admin-only via `is_admin()`-check.

**UI-konfigurerbarhed [LÅST som retning, UI IKKE BYGGET].** Klassifikation er forretningsdata, ikke kode. Ændring sker via UI når lag F bygger superadmin-editor; indtil da kun via SQL eller `data_field_definition_upsert()`-RPC.

**Fremad-kun.** Når pii_level ændres, gælder ændringen kun fremad. Eksisterende audit-rækker bevarer den klassifikation de havde da de blev skrevet.

**Retroaktiv sletning = SEPARAT mekanisme [DESIGN, IKKE BYGGET].** Skitseret RPC `gdpr_retroactive_remove(...)` med legal_basis + reason + immutable log i `gdpr_retroactive_operations`-tabel. Audit_log immutability-trigger får én exception-vej via session-var. Beskrevet i `docs/roadmap-post-fase-0.md` pkt 2.

**Migration-gate Phase 2 strict [BYGGET, D6].** Hver kolonne i hver migration SKAL eksistere i `data_field_definitions` (sammenholdt med `INSERT INTO public.data_field_definitions`-rækker fra migration-filer). Phase 2 aktiveret via `MIGRATION_GATE_STRICT=true` i `.github/workflows/ci.yml`. Gate tjekker kun EXISTENCE — ikke værdier.

**Klient-specifik retention [DESIGN, IKKE BYGGET].** Eesy customer_id (4 mdr) og TDC opp_number (12 mdr) bliver separate rækker i data_field_definitions med forskellige source.table.column-værdier når lag E bygger ingest-tabellerne. Modellen understøtter mønstret; instanserne er ikke seedet.

## 4.3 RLS-arkitektur [BYGGET]

**FORCE RLS som default.** Hver feature-tabel har `ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY`. Verificeret på alle 13 public-tabeller.

**Variant B: session-var policies.** Write-RPCs sætter `set_config('stork.allow_<table>_write', 'true', true)` (transaktion-lokal). Policy: `WITH CHECK (current_setting('stork.allow_<table>_write', true) = 'true')`.

**Defense-in-depth:** `REVOKE ALL ... FROM PUBLIC, anon` på alle feature-tabeller. `service_role` har ingen direkte INSERT/UPDATE-policy — skal gå via RPC.

**Read vs write.** SELECT-policies varierer:

- `data_field_definitions`, `roles`, `role_page_permissions`, `client_field_definitions`: åbne for `authenticated` (metadata, ikke selv PII)
- `employees`: `auth_user_id = auth.uid() OR is_admin()` (egen-row + admin)
- `clients`: `is_admin()` (D5; udvides i lag F til scope-baseret — roadmap pkt 9)
- `pay_periods`, `pay_period_settings`: åbne for `authenticated` (operationelt synlige)
- `commission_snapshots`, `salary_corrections`, `cancellations`: ingen SELECT-policy listet i denne sektion (verificér ved lag E hvis ikke allerede afklaret)

**audit_log undtagelse.** `ENABLE` men IKKE `FORCE` RLS (skip-force-rls marker i C2). 0 SELECT-policies. Læsning kun via `audit_log_read()` SECURITY DEFINER RPC med `is_admin()`-check. UPDATE/DELETE blokeret af `audit_log_immutability_check()` trigger (C4.1) — kun fremtidig `gdpr_retroactive_remove`-RPC kan undtage.

**cron_heartbeats undtagelse.** Samme mønster: `ENABLE` ikke `FORCE`, 0 policies. Læsning via `cron_heartbeats_read()` RPC. Tabellen er IKKE immutable — `last_run_at`, `last_status`, `run_count` opdateres ved hver heartbeat via `cron_heartbeat_record()`.

## 4.4 Audit-systemet [BYGGET]

`public.stork_audit()` trigger (C2) attached AFTER INSERT/UPDATE/DELETE på alle audited feature-tabeller. Skriver til `public.audit_log` (15 kolonner):

| Kolonne                                                | Indhold                                                                  |
| ------------------------------------------------------ | ------------------------------------------------------------------------ |
| `id`, `occurred_at`                                    | PK + tidsstempel                                                         |
| `table_schema`, `table_name`, `record_id`, `operation` | target                                                                   |
| `actor_user_id`, `actor_role`                          | auth.uid() + current_user                                                |
| `source_type`                                          | enum: manual / cron / webhook / trigger_cascade / service_role / unknown |
| `change_reason`                                        | påkrævet via session-var                                                 |
| `schema_version`                                       | replay-stabilitet                                                        |
| `changed_columns`                                      | text[] for UPDATE                                                        |
| `old_values`, `new_values`                             | jsonb, filtreret af `audit_filter_values()`                              |
| `trigger_depth`                                        | `pg_trigger_depth()` ved capture                                         |

**`source_type` detection-prioritet** (i `stork_audit()`):

1. Session-var `stork.source_type` (eksplicit override)
2. `pg_trigger_depth() > 1` → `trigger_cascade`
3. `current_user IN ('service_role', 'supabase_admin')` → `service_role`
4. `auth.uid() IS NOT NULL` → `manual`
5. Fallback → `unknown`

**PII-filter (D2 + D5):** `audit_filter_values(schema, table, jsonb)` slår op i `data_field_definitions`:

- Kolonner med `pii_level='direct'` → værdi erstattet med `'sha256:' || encode(extensions.digest(value::text, 'sha256'), 'hex')`
- Andre værdier (none/indirect): bevares
- For `(public, clients)` specifikt: D5 walker også i `clients.fields` jsonb og hasher hver key med `pii_level='direct' AND is_active=true` i `client_field_definitions`
- LENIENT-default: ukendt schema/table eller ukendt kolonne → WARNING, værdier returneres uændret
- Strict-mode via session-var `stork.audit_filter_strict='true'` → RAISE i stedet for WARNING

**Audit-immutability (C4.1):** `audit_log_immutability_check()` BEFORE UPDATE/DELETE-trigger RAISE'r altid. Eneste fremtidige undtagelse: GDPR retroaktiv-RPC (DESIGN, ikke bygget).

**TRUNCATE-blokering (D6):** `block_truncate_immutable()`-trigger attached BEFORE TRUNCATE på audit_log, commission_snapshots, salary_corrections, cancellations.

**Audit-omfang per kategori (princip, håndhævet via trigger-attachment-disciplin, ikke automatisk):**

| Kategori      | Audit                               |
| ------------- | ----------------------------------- |
| operationel   | JA                                  |
| konfiguration | JA                                  |
| master_data   | JA                                  |
| audit         | NEJ (audit auditerer ikke sig selv) |
| raw_payload   | NEJ (typisk allerede immutable)     |

## 4.5 Immutability-håndhævelse

**Tabeller med immutability-trigger [BYGGET]:**

- `audit_log` — `audit_log_immutability_check()` BEFORE UPDATE/DELETE (C4.1)
- `commission_snapshots` — `commission_snapshots_immutability_check()` (C4)
- `salary_corrections` — `salary_corrections_immutability_check()` (C4)
- `cancellations` — `cancellations_immutability_check()` (C4, undtagen `matched_to_correction_id` + `matched_at` der er opdaterbare)

**Tabeller med BEFORE TRUNCATE-blokering [BYGGET, D6]:** samme 4 tabeller via `block_truncate_immutable()`.

**`cron_heartbeats` er IKKE immutable** — modtager UPDATE'er ved hver heartbeat. Tidligere doc-claim var fejl.

**Fremtidige immutable tabeller [DESIGN, IKKE BYGGET]:** `economic_invoices` (5-års lovgivnings-trigger), `integration_events` (raw_payload).

**Korrektion via modposter [LÅST som princip].** Ingen UPDATE/DELETE på frosset data. Rettelser sker via nye rækker: `cancellation_reversal`, `salary_correction`, `salary_correction` med `reason='kurv_correction'`. `salary_corrections.salary_corrections_validate_target()`-trigger validerer at modposter peger på åbne perioder.

## 4.6 Tre låste schemas [LÅST som retning, IKKE BYGGET]

Alle eksisterende tabeller bor i `public`-schemaet i fase 0. Den arkitektoniske retning er at flytte til tre dedikerede schemas i lag E/F:

**`core_identity`** [DESIGN] — `persons`, `person_identities`, `employees`, `teams`, `team_clients`, `system_roles`, `role_permissions`, `employee_roles`, `system_superadmins` (med trigger der forhindrer count < 2).

**`core_money`** [DESIGN] — `sales`, `sale_items`, `commission_snapshots` (eller `commission_transactions` — naming åbent, §11.2), `cancellations`, `pay_periods`, `period_locks`, `pricing_rules`. RLS-trigger nægter mutationer i låst periode.

**`core_compliance`** [DESIGN] — `audit_log`, `data_field_definitions`, `consent_log`, `gdpr_cleanup_log`, `sensitive_data_access_log`, `ai_instruction_log`, `economic_invoices` (5-års DB-trigger), `amo_audit_log`. Hver persondata-tabel i andre schemas har FK til retention-config.

Apps får egne tabeller i schema `app_<navn>` og må kun skrive til `core_*` via SECURITY DEFINER RPCs ejet af respektive core-schema.

**Status i fase 0:** Princippet er låst som målarkitektur. Implementeringen — schema-flytning af eksisterende tabeller plus build-out af de manglende tabeller — er lag E-arbejde.

## 4.7 `@stork/core` delt beregningspakke [LÅST som design, IKKE BYGGET]

TypeScript-pakke der eksisterer som workspace (`packages/core/`) men er **tom**: `packages/core/src/index.ts` indeholder kun `export {};`. Designet beskriver hvad pakken SKAL indeholde.

Importeret identisk af edge functions (Deno) og frontend (Vite/React). Pure functions, ingen DB-adgang, ingen IO:

- `pricing.match(input)` — autoritativ pricing-funktion
- `salary.compute(input)` — løn-aggregation pr. medarbejder pr. periode
- `identity.resolve(identities_snapshot, input)` — én resolver. Tager `person_identities`-snapshot som argument (purity bevares; gateway fetcher snapshot fra DB og passer ind). Returnerer eksplicit `Unresolved` hvis input ikke kan resolves
- `period.from(date)`, `period.status(periodId)` — periode-helpers
- `attribution.team(saleInput, team_clients_snapshot)` — bevarer `team_clients`-vejen; snapshot passes ind
- `permissions.has(userContext, key)` — permission-resolution som ren funktion (userContext indeholder pre-fetched permissions)

**Snapshot-mønstret er afgørende** for at bevare purity: alle lookup-data fetches af gateway/edge-function/komponent FØR `@stork/core`-kald, og passes som argumenter. Det løser modsigelsen mellem "pure" og "skal kunne resolve identities/teams". Beskrevet eksplicit her efter intern modstrid blev identificeret i v1.2.

Værdier (lønperiode start_day, feriepenge-sats, oplæringsbonus, ferie-frist, ASE-satser m.fl.) lever i UI-konfigurations-tabeller og slås op ved kørsel. `@stork/core` indeholder algoritmer — ikke værdier.

Synkron RPC primært. Ingen `domain_events`-tabel som infrastruktur i dag. Hvis pipelines vokser sig komplekse, kan domain_events tilføjes som fase 4 uden at bryde modellen.

## 4.8 Gateway-lag [LÅST som retning, IKKE BYGGET]

`apps/web/src/services/<domain>/` på frontend, `supabase/functions/_gateway/<domain>/` på edge. Det eneste sted der må importere `@/integrations/supabase/client` eller skrive til `core_*`.

**Status i fase 0:** Hverken `apps/web/src/services/` eller `supabase/functions/`-mappen eksisterer. Lag E bygger første gateway-implementationer.

Hver gateway-metode har navngivet, versioneret kontrakt. Kontrakter committed i `docs/contracts.md` og snapshot'es i CI. Ændring kræver migration + version-bump.

## 4.9 Integration-bælte [LÅST som retning, IKKE BYGGET]

Hver kilde (Adversus, Enreach, e-conomic, Twilio) har én adapter under `supabase/functions/_adapters/<kilde>/`. Pure function fra rå payload til kanonisk DTO + synkront kald til navngivet RPC i `core_*`. Ingen forretningslogik. Råpayload bevares i `integration_events` (immutable).

Pricing-rematch er navngivet RPC (`pricing.rematch_for_sale(saleId)`) kaldt synkront af adapter efter `record_sale`. Erstatter 1.0's implicitte trigger-net.

**Status i fase 0:** `supabase/functions/`-mappen eksisterer ikke. Ingen adapters bygget.

## 4.10 Microsoft Entra ID som eneste login-provider [LÅST som retning, IKKE KONFIGURERET]

- Microsoft Entra ID = eneste auth-provider for medarbejdere
- Ingen backdoor ved Microsoft-nedbrud
- Onboarding-rækkefølge: Microsoft-konto oprettes → Stork-employee oprettes → onboarding-flow
- Offentlige sider (kandidat-booking, kontrakt-signering) ikke berørt
- Kandidater logger ikke ind
- Konfiguration sker via Supabase dashboard + Entra app-registration når lag F bygges
- INTET fase 0-arbejde

**Status i fase 0:** Mg@ + km@ blev oprettet via Supabase Auth magic-link invite (bootstrap-invite edge-function, slettet efter brug). Entra-konfiguration sker først ved lag F.

# 5. Rettigheds-fundament

## 5.1 To dimensioner [ÅBEN — under afklaring]

Den nuværende retning er at adgang har to dimensioner:

- **Rolle** bestemmer hvilke dele af systemet en bruger må se (menu, sider, funktioner)
- **Team** bestemmer hvilken data inden for det der vises

Medarbejder er personen (tredje dimension, men ikke rettighed-givende).

**Permissions-akse (D4):** Hvem må noget. Hvilke pages/tabs/funktioner. **Scope-akse (D7):** Hvilken data inden for det.

Forskellen betyder noget for debugging: "Hvis Alice ikke kan se en page, er det permissions-problem. Hvis Alice kan se pagen men ingen data, er det scope-problem."

Den korrekte rettighedsopsætning er under afklaring. Se §11.1.

## 5.2 Roller [D4 BYGGET, retning ÅBEN]

D4 har bygget en konkret rolle-model. Modellens forretningsmæssige korrekthed er under afklaring som del af den samlede rettighedsopsætning (§11.1).

Den nuværende implementering: roller er KUN samlinger af rettigheder, ikke titler. Ingen hardkodede rolle-keys i kode (`if (role === 'ejer')` er forbudt).

**`is_admin()`** evaluerer mod `role_page_permissions` med specifik admin-key. Permission-baseret, ikke titel-baseret. Hvis ejer-rollen skifter navn, mister ejeren ikke alt.

**En rolle pr. medarbejder.** Ingen M2M. Hvis specifik kombination kræves, opret rolle med præcis de permissions. Enklere model — ét opslag i stedet for en JOIN.

**Permission-modellen er firedimensionel:**

1. Hvad: `page_key` + `tab_key` (tab_key NULL = hele page)
2. Adgangsniveau: `can_view` + `can_edit` (separate booleans)
3. Scope: `all` / `team` / `self`
4. Hvem: `role_id` (FK)

Tabel: `role_page_permissions`, med 234 permission-rækker pr. rolle som målform.

mg@ og km@ er oprettet som admin-employees. `is_admin() = true` verificeret.

## 5.3 Teams [DESIGN, IKKE BYGGET — D7 åben]

**Det Mathias har låst om fundamentet:**

- 1 team max pr. medarbejder ad gangen (alle, inkl. stab)
- Medarbejdere kan skifte teams med overgangsdato; historik bevares
- Klient ejes af præcis ét team ad gangen; kan skifte med overgangsdato
- Team-attribution af salg går via klient (`team_clients`), IKKE via sælgers team
- Snapshot på sales-rækken ved INSERT (team der ejede klienten på salgs-tidspunkt)
- Min. dobbelt størrelse (200-300 medarbejdere) skal kunne håndteres uden omtænkning

**Team-attribution via klient.** Et salg på en klient tilhører det team der ejede klienten på salgsdatoen — uanset sælgers eget team. Eksempel: Thorbjørn fra Relatel sælger for Eesy TM → salget tilhører Eesy TM-teamet, ikke Relatel.

**Foreslået model (Code's Hybrid Option C):**

- `org_units` (træ-struktur med `parent_org_unit_id`) = management-hierarki
- `teams` (operationelle enheder der ejer klienter) — med `team.owner_org_unit_id` bridge
- `employees` har både `org_unit_id` og `team_id` (uafhængige dimensioner — matrix-organisationer understøttes)
- `clients.team_id` (single ownership, kan skifte med historik)
- scope-enum udvides med `subtree` for management-chefer
- Helper-funktioner: `employee_org_unit_at(employee_id, date)`, `org_unit_subtree(org_unit_id)`, `team_clients_at(team_id, date)`

Foreslået af Code, ikke endeligt godkendt af Mathias. Se §11.

## 5.4 Pages-arkitektur [LÅST]

ÉN page per funktion. Scope-filtrering på rækker:

- Sælger med scope=self → ser kun sit
- Teamleder med scope=team → ser sit teams
- CEO/admin med scope=all → ser alle

ÉN vagtplan-page (ikke 7 pages for 7 teams). ÉN sales-page. ÉN team-økonomi-page.

Bevis fra 1.0: vagtplanen. Én side, 111 medarbejdere på tværs af alle teams. Rettigheder filtrerer rækker. Fungerer.

**FM-spejl.** FM har spejl af fælles vagtplan med ekstra info (lokationer, hoteller). Read-only udvidelse på samme data. Ingen drift, ingen kopi.

## 5.5 Dashboards har ikke eget rettighedssystem [LÅST]

Hvert dashboard er en page med to flag:

- "Se page" (adgang til dashboardet)
- "Se alt" (om brugeren ser alle data eller filtreret af scope)

Passer ind i samme model som resten. Ingen særstruktur.

TV-link er spejl af moder-dashboard (samme data, anden visning). Pseudonymiseret session-token der peger på samme dashboard-row. Ingen separat kopi.

## 5.6 UI-disciplin [PRINCIP for lag F]

UI håndhæver:

- Hvis rolle har scope='team' → team SKAL vælges ved oprettelse af medarbejder
- Hvis rolle har scope='all' → team kan være tom
- Forhindrer 0-data-admins (admin med team_id=NULL og kun scope='team'-permissions)
- Roller indeholder IKKE team-information i navnet

# 6. Forretningslogik

## 6.1 Pricing [LÅST som retning, IKKE BYGGET]

**Én autoritativ funktion:** `@stork/core` `pricing.match()`. Pure function importeret identisk af edge og frontend. Drift fysisk umulig.

**Regel-struktur:** `product_pricing_rules`-tabel (DESIGN) med priority + campaign-match. UNIQUE-constraint på `(product_id, priority, campaign_match_mode, campaign_mapping_ids)` forhindrer duplikater. Livscyklus: draft → active → retired. Historik via `pricing_rules_history` (immutable).

**Tie-breaker.** UNIQUE-constraint gør duplikater fysisk umulige. Tie-breaker er irrelevant.

**TM-pricing.** Match `sale_items.product_id` mod regler med priority + kampagne-kontekst. Fallback til `products.commission_dkk` hvis ingen regel matcher.

**FM-pricing.** Pris slås op pr. produkt-navn (case-insensitiv) + kampagne. FM og TM bruger SAMME pricing-motor i `@stork/core` — ikke to implementationer.

**Status i fase 0:** Hverken `product_pricing_rules`, `pricing_rules_history`, `products` eller `pricing.match()` eksisterer. Bygges i lag E sammen med sales-tabellen.

## 6.2 Provision [LÅST som retning, IKKE BYGGET]

**Formel:** `Provision = Sum(sale_items.mapped_commission for pending + completed) − Cancellations`

Aggregering via navngivne RPCs (fx `commission_for_period(employee_id, period_id)`). Ingen drift mellem hooks og edge functions.

**Sælger-attribution:**

- Én resolver: `@stork/core` `identity.resolve(identities_snapshot, input)` modtager `person_identities`-snapshot (UNIQUE på `(provider, external_id)`) fra gateway og resolver til person → employees. Snapshot-mønster bevarer `@stork/core`'s purity (se §4.7)
- Hvis input ikke kan resolves: returnerer eksplicit `Unresolved` og landes i `needs_mapping`-kø — ikke fallback der kan give samme person to navne
- FM `seller_name` registreres som identitet med provider='fm_manual' i `person_identities` på linje med dialer-emails — ingen separat fallback-vej

**Status i fase 0:** Hverken `persons`, `person_identities`, `sale_items`, `commission_for_period()` eller `needs_mapping` eksisterer. `@stork/core` er tom. Bygges i lag E.

## 6.3 Løn [LÅST som logik]

**Sælger-løn:**

```
Sælger-løn = Provision + Timeløn + Diæt + Oplæring + Tillæg − Annulleringer
```

Plus feriepenge-tillæg på løn-grundlag.

**Værdier (UI-konfigurerbart):**

- Lønperiode start_day (default 15 → 14 i næste måned)
- Feriepenge-sats (default 12,5 %)
- Oplæringsbonus pr. registrering (default 750 kr)
- ASE provision-satser (default 400/1000 kr)
- Minimumsfrist ferieanmodning (default 5 uger / 35 dage)

Algoritmer (perioden går fra start_day i én måned til start_day−1 i næste; feriepenge beregnes som sats × løn-grundlag osv.) lever i `@stork/core`. Værdierne lever i UI.

**Teamleder-løn.** Provisionsstyret af team-DB. Selve team-DB-beregningen er en KPI, ikke en hardkodet løn-formel — se §6.10. Teamleder-løn = grundløn + leder-provision (fra KPI) + tillæg − fradrag.

**Lønunderskud rollover (åben — se §11.2).** 1.0-mønstret er rollover med afskrivning ved medarbejder-stop. Modellen er ikke endeligt låst for 2.0.

**Stab er rolle, ikke job_title.** Defineret af samlede permissions.

## 6.4 Cancellation [LÅST som logik]

**Separat tabel.** Cancellations er egen tabel, ikke status på sales. Sales-rækken UPDATEes ALDRIG.

**Match-flow:** upload → matching → pending → godkendelse → approved → fradrag i løn.

**Tre upload-types (skal bevares fra 1.0):**

- `cancellation` — kunde fortryder, fradrag i løn
- `basket_difference` — kurv-rettelse fra klient, commission-forskel
- `correct_match` — rettelse til matching, ekskluderes fra modregning

Skal modelleres eksplicit, ikke kollapses til ét koncept.

**`deduction_date` styrer lønperiode.** Cancellation rammer den lønperiode `deduction_date` peger på, ikke salgsdato.

**Cancellation-reversal.** Hvis cancellation skal rulles tilbage: original cancellation røres ikke; ny række med `reason='cancellation_reversal'`, positivt beløb.

**Eesy TM/FM cancellation-matching:** specialiseret matching-vej med 8 telefon-felter + opp_group. Egen vej i lag E.

## 6.5 Attribution [LÅST som princip, IKKE BYGGET]

**Sales attribueres via klientens team.** `team_clients` er autoritativ (klient → team), IKKE via sælgers team.

**Klient-attribution:** `sales.client_campaign_id` → `client_campaigns.client_id` → `clients`.

**Team-attribution (via klient):** `client_campaigns.client_id` → `team_clients.team_id` → `teams`. Med snapshot på sales-rækken ved INSERT.

**Snapshot-pattern.** Sales-rækken får team_id_snapshot ved INSERT. Hvis sælger eller klient senere skifter team, ændres salget IKKE. Salget husker stadig "team X" — det team klienten var ejet af da salget skete.

**Status i fase 0:** Princip låst. `sales`, `sale_items`, `client_campaigns`, `teams`, `team_clients` eksisterer ikke. Bygges i lag E (sales + sale_items) og D7 (teams + team_clients).

## 6.6 Klient som driftens grundenhed [LÅST som princip]

Klient er ikke et filter på dashboards. Klient er driftens grundenhed.

**Lønarter kan være klient-specifikke.** Dagsbonus i 1.0 (eks. 500 kr i 9 dage for Eesy TM-sælgere) er en lønart bundet til klient + team. Andre klienter har andre satser eller ingen dagsbonus. I 2.0: lønarter er UI-konfigurerbare med klient + team som dimensioner.

**Tid skal kunne fordeles mellem klienter pr. medarbejder.** En medarbejder kan arbejde for flere klienter samme dag. Tid-til-klient-attribution er fundament for omsætning pr. klient og leder-DB-KPI. Mekanismen er åben (se §11.4).

**Omsætning beregnes pr. klient.** Omsætningsformel pr. klient kombinerer tid + CPO (Cost Per Order) + provision. Formel er UI-konfigurerbar pr. klient via KPI-systemet (§6.10).

**Konsekvens for 2.0.** Klient-dimensionen er attribution + lønberegning + tid-allokering + omsætning. Ikke kun rettigheds-filter. D7's team_clients er den ene halvdel; medarbejder-til-klient-relationer er den anden halvdel og bygges i lag E/F når time-attribution-vej er afgjort.

## 6.7 Tidsenheder [LÅST som princip]

- `sale_datetime` (timestamptz) = primær tidsstempel
- Storage UTC, render Europe/Copenhagen
- Sommertid (CET ↔ CEST) kan give off-by-one ved UTC-grænser
- Central tidszone-helper i `@stork/core`, ikke per-hook konvertering
- CI fitness-check håndhæver Europe/Copenhagen-konvention
- Periode-låsning [BYGGET]: `pay_periods.status` (CHECK in 'open','locked') + `pay_periods.locked_at` timestamptz + `pay_periods_lock_and_delete_check()`-trigger (C4). Ikke kun kode-konvention. RLS-policies på `commission_snapshots`, `salary_corrections`, `cancellations` nægter mutationer baseret på target-periodens status (C4)
- CI fitness-check for Europe/Copenhagen-konvention er endnu IKKE bygget (aspiration)

## 6.8 Integration [LÅST som retning, IKKE BYGGET]

**Adversus + Enreach (dialere).** Forskellige auth-modeller, forskellige rate-limit-strategier. Hver én adapter. Synkron pipeline: webhook → record_sale → rematch_pricing → recalculate_commission → notify_seller.

**Rate-limit-fix.** 1.0 har akut rate-limit-problem i Adversus-webhook. 2.0's adapter designes med rate-limit-aware retry fra start.

**e-conomic.** Månedlig afstemning via Revenue Match + Sales Validation. Konto 1010 = revenue. Balance-konti (>=5000) ekskluderes fra P&L. Tre indgange: webhook + sync + manual ZIP. 5-års lovgivnings-trigger på `economic_invoices`.

**Twilio.** Softphone voice + SMS-notifikationer.

**Stork har ingen bogføringspligt.** e-conomic har det. Storks løn-data er INPUT til bogføringen. Default retention: `time_based`, ikke `legal`. `legal` reserveret til e-conomic_invoices og evt. AMO.

**Status i fase 0:** Ingen adapters bygget. `supabase/functions/`-mappen eksisterer ikke. Princip og pattern låst som retning; implementering venter til lag E.

## 6.9 Klient-konfiguration [BYGGET, D5]

`public.clients` (6 kolonner) + `public.client_field_definitions` (11 kolonner). UI-konfigurerbar felt-struktur pr. klient via `clients.fields jsonb`. `client_field_definitions` bestemmer hvilke felter en client kan have (key, display_name, field_type fri-tekst, required, pii_level, match_role, display_order, is_active).

**RPCs (D5):** `client_upsert(...)`, `client_field_definition_upsert(...)`. Begge admin-only.

**Validation:** `clients_validate_fields()` BEFORE INSERT/UPDATE-trigger LENIENT-default — WARNING ved ukendte/inaktive keys, accepterer alligevel. Strict-mode via session-var `stork.clients_fields_strict='true'`.

**audit_filter_values special-case for clients.fields (D5):** walker i jsonb og hasher hver key med `pii_level='direct' AND is_active=true` i `client_field_definitions`. Bevarer non-direct keys i klar.

**Klient-specifik retention IKKE seedet i fase 0.** `client_field_definitions` har 0 rækker — Mathias seeder felt-listen via UI/RPC. Eesy customer_id 4 mdr + TDC opp_number 12 mdr er mønster-eksempler, ikke seedede data.

**Klient-specifik kode er undtagelse.** Match-engine er klient-specifik (strategy pattern). Pricing/validation/cancellations er fælles motor med data-drevet konfiguration. KUN match-engine afviger pr. klient. [LÅST som princip, IKKE BYGGET].

## 6.10 KPI-system [LÅST som retning, IKKE BYGGET]

**Plecto-inspireret model.** Formler som tekst-strenge (DSL). Datakilder defineret pr. KPI. Live-evaluering mod periode + scope. Komposition.

KPI = formel + widget + tidsperiode + scope + hvem-må-se. Versioneret pr. udbetaling/snapshot. Formel-version aktiv ved låsning refereres permanent.

Engine i `@stork/core` så frontend + edge bruger samme. Klassifikation pr. datakilde-kolonne. Permission-lag pr. formel/KPI.

**Permission-eksempel:**

| Formel              | Hvem kan se                                |
| ------------------- | ------------------------------------------ |
| omsætning_total     | Kun ejer                                   |
| omsætning_pr_klient | Ejer + den klients teamleder               |
| omsætning_pr_team   | Ejer + den team's leder                    |
| omsætning_pr_sælger | Ejer + sælgerens teamleder + sælgeren selv |
| eget_salg           | Sælgeren selv                              |

Klassifikation handler ikke kun om datafelter, men også om FORMLERNE der bygger på dataen.

**Eksempel: Teamleder-DB som KPI.**

```
Team-DB = SUM(omsætning på team-klienter)
        − SUM(sælgerløn for aktive sælgere på teamet)
        − SUM(annulleringer fra aktive sælgere)
```

Filtrering på `is_active = true` er en KPI-konfigurations-mulighed (annulleringer fra stoppede medarbejdere tæller så ikke i teamleders DB). Implementations-vej er åben — se §11.2. KPI versioneres pr. lønperiode — beregningen ved låsning fastfryses.

Teamleder-provision = Team-DB × sats (sats konfigureres pr. teamleder eller pr. rolle, UI-styret).

## 6.11 Compliance og audit [LÅST]

**GDPR.** Persondata kan slettes. Samtykke kan dokumenteres. Sensitive data access logges (CPR, bank, kontrakter, adresser). Anonymisering følger §3.3-princippet (UPDATE, ikke DELETE).

**Bogføringsloven.** e-conomic invoices kan ikke slettes før 5 år. DB-trigger håndhæver.

**EU AI Act.** AI-governance dokumenteres. AI-instruktioner logges (`ai_instruction_log`). Ansvarlige roller defineret.

**Arbejdsmiljøloven (AMO).** AMO-dokumentation bevares. Audit-trail på ændringer. AMO-audit fanger alle ændringer på alle amo\_\*-tabeller via trigger.

## 6.12 Vagtplan [LÅST som princip]

Vagtplanen er ÉN datakilde præsenteret filtreret + beriget i flere visninger:

- Personlig (sælger, scope=self)
- Team (teamleder, scope=team)
- Admin (CEO, scope=all)
- FM-spejl (med lokationer, hoteller — read-only udvidelse)

ÉN vagtplan-page. ÉN tabel. Ingen FM-specifik vagtplan-tabel i lag-lag.

# 7. Stork i tal

**1.0 (kontekst, ikke specifikation):**

- 267 tabeller, 120 RPC'er, 662 migrations
- 408 komponenter, 179 sider, 111 hooks
- 109 edge functions
- 100+ aktive brugere dagligt

**2.0 fase 0 (12. maj 2026):**

- Supabase: `imtxvrymaqbgcvsarlib` (West EU/Ireland, Nano tier)
- 12 migrations applied på remote (C1, C2, C3, C4, C4.1, D1, D1.5, D2, D3, D4, D5, D6)
- 13 public-tabeller
- 28 public-funktioner (RPCs + trigger-funktioner)
- 118 klassifikations-rækker seedet (`data_field_definitions`)
- 10 fitness-checks i `scripts/fitness.mjs` (9 aktive + 1 conditional på `SUPABASE_ACCESS_TOKEN`)
- Phase 2 strict gate aktiv i CI (`MIGRATION_GATE_STRICT=true` i `.github/workflows/ci.yml`)
- D6 commit: `7157579e78426ad07c56e5df5d14a0821ed83a5a` (origin HEAD)

# 8. Bygget i fase 0

Hver step beskrives mod faktisk migration-fil og DB-state. Status-skala:

- **[BYGGET]** — eksisterer i remote DB + repo, empirisk verificeret
- **[DESIGN]** — beskrevet som retning men ikke implementeret

## 8.1 Lag A — Infra [BYGGET]

10 steps (A1-A10). Repo-struktur som pnpm workspaces. Faktisk struktur i repo:

- `apps/web/` (Vite + React-app; `src/services/` IKKE oprettet i fase 0)
- `packages/core/` (workspace eksisterer; `src/index.ts` indeholder kun `export {};` — tom)
- `packages/eslint-config/` (`base.js` + `react.js`)
- `packages/types/` (placeholder for `supabase gen types`-output)
- `packages/utils/`

Ikke oprettet i fase 0: `supabase/functions/`, `apps/web/src/services/`, `apps/web/src/integrations/`. Disse bygges når lag E/F starter.

**Konfiguration:** ESLint (`@stork/eslint-config`), Prettier (printWidth 120), Vitest workspace, Husky pre-commit (lint-staged), CI pipeline (`.github/workflows/ci.yml`), branch-protection aktiv på main, Node `22` (via `.nvmrc`), pnpm `10.33.0` (via `packageManager`), Supabase CLI som workspace devDep.

## 8.2 Lag B — Disciplin [BYGGET]

4 steps (B1-B4).

**B1: Type-codegen.** `pnpm types:generate` (`supabase gen types`) + `types:check` drift-detection. CI step kører ubetinget men skipper på `// PLACEHOLDER`-marker.

**B2: Schema-snapshot.** `pnpm schema:pull` + `schema:check` drift-detection.

**B3: Migration-gate Phase 1.** `scripts/migration-gate.mjs` warner ved uklassificerede kolonner. LENIENT-mode i fase 0; flippet til Phase 2 strict i D6.

**B4: Fitness-functions framework.** `scripts/fitness.mjs` med 5 starter-checks:

- `no-ts-ignore` — forbyder `@ts-ignore` (kræv `@ts-expect-error`)
- `eslint-disable-justified` — `eslint-disable` skal have begrundelse
- `migration-naming` — migration-filnavne skal matche `<14digits>_<snake_case>.sql`
- `workspace-boundaries` — `packages/` må ikke importere fra `@stork/web`
- `no-hardcoded-supabase-urls` — `https://*.supabase.co` URL'er forbudt i `apps/web/src/`

**Bemærk:** Doc-versioner før v1.3 hævdede "no raw SQL i TS-kode" som starter-check. Den findes ikke. `workspace-boundaries` mangler i tidligere doc-version.

## 8.3 Lag C — DB-fundament [BYGGET]

5 migrations.

**C1: `c1_rls_helpers_stub` (20260511151815).** Stub-helper-funktioner til senere RLS-policies:

- `public.current_employee_id() RETURNS uuid` — stub returnerer NULL indtil D3 redefinerer
- `public.is_admin() RETURNS boolean` — stub returnerer false indtil D4 redefinerer

Plus RLS-template-doc med skip-force-rls opt-out-syntax. INGEN tabeller oprettet i C1.

**C2: `c2_audit_template` (20260511152603).** `audit_log`-tabel + audit-infrastruktur:

- `public.audit_log` (15 kolonner). ENABLE RLS (ikke FORCE — skip-force-rls marker fordi `stork_audit()` postgres-owned SECURITY DEFINER skal kunne INSERT'e). 0 SELECT-policies. `REVOKE ALL FROM PUBLIC, anon, authenticated, service_role`.
- `public.stork_audit()` trigger-funktion (SECURITY DEFINER) med 5-prioritets source_type-detection. Påkrævet session-var `stork.change_reason`.
- `public.audit_log_read(...)` SECURITY DEFINER RPC med `is_admin()`-check.
- `public.audit_filter_values(schema, table, jsonb)` stub i C2 (returnerer values uændret). Omdefineres i D2.
- 6-værdi source_type CHECK-constraint: manual/cron/webhook/trigger_cascade/service_role/unknown.

**C3: `c3_cron_skabelon` (20260511153246).** Cron-infrastruktur:

- Extensions: `pg_cron`, `btree_gist`, `pg_net` aktiveret.
- `public.cron_heartbeats` (11 kolonner). ENABLE RLS, 0 policies. Læsning via `cron_heartbeats_read()` RPC.
- `public.cron_heartbeat_record(...)` RPC til at registrere kør-status.
- `stork_audit()` attached med WHEN-filter: kun failures auditeres.

**C4: `c4_pay_periods_template` (20260511165543).** Period-lock-template med løn som første instans. 4-dels mønster:

1. `public.pay_period_settings` (4 kolonner, singleton config). Default-row INSERT'et (`id=1, start_day_of_month=15`).
2. `public.pay_periods` (8 kolonner). **Status-enum 2 værdier: `open` / `locked`** via CHECK-constraint. `locked_at timestamptz`, `locked_by uuid`. Exclusion-constraint via btree_gist forhindrer overlap.
3. `public.commission_snapshots` (7 kolonner, immutable INSERT-only via `commission_snapshots_immutability_check()`).
4. `public.salary_corrections` (10 kolonner, append-only modposter; `salary_corrections_validate_target()`-trigger validerer target-periode er åben).

Plus `public.cancellations` (9 kolonner) som domæne-specifik begivenheds-tabel; immutable via `cancellations_immutability_check()` undtagen `matched_to_correction_id` + `matched_at`.

**RPCs:** `pay_period_settings_update()`, `pay_period_for_date()` (helper), `pay_periods_lock_and_delete_check()` (trigger), `on_period_lock()` (trigger).

**Cron-job:** `ensure_pay_periods` (pg_cron) opretter pay_periods automatisk.

FORCE RLS på alle 5 tabeller. Session-var-baserede INSERT/UPDATE-policies.

**C4.1: `c4_1_audit_log_immutability` (20260511170429).** `audit_log_immutability_check()` BEFORE UPDATE/DELETE-trigger på `audit_log` RAISE'r altid. Eneste fremtidige undtagelse: dedikeret `gdpr_retroactive_remove`-RPC (DESIGN, ikke bygget).

## 8.4 Lag D — Domæne-fundament

**D1: `d1_data_field_definitions` (20260511170951) [BYGGET].**

- `public.data_field_definitions` (12 kolonner): id, table_schema, table_name, column_name, category, pii_level, retention_type, retention_value (jsonb), match_role, purpose, created_at, updated_at. UNIQUE på (table_schema, table_name, column_name).
- 5 CHECK-constraints: category-enum, pii_level-enum, retention_type-enum, retention-consistency (retention_type NULL iff retention_value NULL), purpose non-empty.
- 4 indekser (PK + UNIQUE + pii partial + category btree). 3 triggers (`data_field_definitions_validate_retention` + `set_updated_at` + `stork_audit`). 4 policies (select+insert+update+delete). 2 RPCs: `data_field_definition_upsert(...)`, `data_field_definition_delete(...)`.

**D1.5: `d1_5_seed_classification` (20260511194701) [BYGGET].** 76 klassifikations-rækker INSERTet via direct INSERT med session-vars (RPC kunne ikke kaldes da `is_admin()` returnerede false før D4).

Fordeling: 58 trivielle defaults + 11 gennemtænkte defaults + 7 afgjorte (Mathias' specifikke beslutninger i session 2). Retention-politikker pr. tabel: `audit_log`/`pay_periods`/`commission_snapshots`/`salary_corrections`/`cancellations` time_based 1825 dage; `cron_heartbeats` time_based 90 dage; `pay_period_settings` manual + config_superseded; `data_field_definitions` manual + column_dropped.

Mathias' G3-defaults: `change_reason=none`, `old_values`/`new_values=indirect` (direct allerede hashed af D2), `cron_heartbeats.last_error=none`, `commission_snapshots/salary_corrections/cancellations.amount=none`.

**D2: `d2_audit_filter_values` (20260511195819) [BYGGET].** `audit_filter_values()` omdefineret fra C2's passthrough-stub:

- LANGUAGE skiftet fra `sql` IMMUTABLE til `plpgsql` STABLE
- Slår op i `data_field_definitions` for (schema, table). Hashes pii_level=direct til `sha256:<hex>`
- LENIENT-default: ukendt tabel eller ukendt kolonne → WARNING, værdier returneres uændret
- Strict-mode toggle via session-var `stork.audit_filter_strict='true'` → RAISE i stedet for WARNING

**D3: `d3_employees` (20260511202242) [BYGGET].**

- `public.employees` (10 kolonner i D3 + 1 tilføjet i D4 = 11): id, auth_user_id, first_name, last_name, email, hire_date, termination_date, anonymized_at, created_at, updated_at, (role_id tilføjet i D4)
- `email NOT NULL UNIQUE`. `auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE RESTRICT`
- 2 partial indexes hot-path WHERE anonymized_at IS NULL
- FORCE RLS. SELECT-policy: egen row (auth_user_id-match) OR `is_admin()`. INSERT/UPDATE via session-var. DELETE: ingen policy (anonymisering = UPDATE)
- `current_employee_id()` redefineret fra C1-stub: læser `employees` filtreret på aktiv (anonymized_at IS NULL + termination_date NULL eller fremtidig)
- **RPCs: `employee_upsert(...)` og `employee_terminate(...)`. Ingen `employee_anonymize`** — anonymisering er roadmap-pkt 3 (DESIGN, ikke bygget)
- mg@copenhagensales.dk og km@copenhagensales.dk oprettet i auth.users via engangs-edge-function `bootstrap-invite` (slettet efter brug), mappet til employees med admin-rolle i D4

**D4: `d4_role_permissions` (20260511204529) [BYGGET].**

- `public.roles` (5 kolonner): id, name (UNIQUE), description, created_at, updated_at. **Ingen `is_active`-kolonne** — tidligere doc-version hævdede fejlagtigt
- `public.role_page_permissions` (9 kolonner): id, role_id FK, page_key, tab_key (NULL = hele page), can_view, can_edit, scope, created_at, updated_at. Scope CHECK enum: `('all', 'team', 'self')`. Partial unique index på `(role_id, page_key, COALESCE(tab_key, ''))`
- ALTER `employees` ADD COLUMN `role_id uuid REFERENCES roles(id) ON DELETE RESTRICT`
- `is_admin()` redefineret: returnerer true hvis current employee har permission `page_key='system' AND tab_key='manage' AND can_edit=true AND scope='all'`. Ikke titel-baseret
- RPCs: `role_upsert(...)`, `role_page_permission_upsert(...)`
- Bootstrap-seed: én rolle `'admin'` med `system.manage can_view+can_edit scope=all`. mg@ + km@ mappet til admin-rollen via direct INSERT i employees post-apply

**D5: `d5_clients` (20260511213009) [BYGGET].**

- `public.clients` (6 kolonner): id, name, fields jsonb (UI-konfigurerbar), anonymized_at, created_at, updated_at. **Ingen `team_id`** — udskudt til D7
- `public.client_field_definitions` (11 kolonner): id, key (UNIQUE), display_name, field_type (fri-tekst — bevidst ingen CHECK-enum), required, pii_level, match_role, display_order, is_active, created_at, updated_at
- `audit_filter_values()` udvidet med client-special-case: walker i `clients.fields` jsonb og hasher hver key med `pii_level='direct' AND is_active=true` i `client_field_definitions`
- `clients_validate_fields()` BEFORE INSERT/UPDATE-trigger på clients: LENIENT default WARNING ved ukendte/inaktive jsonb-keys; strict via `stork.clients_fields_strict='true'`
- RPCs: `client_upsert(...)`, `client_field_definition_upsert(...)`
- `clients_select` RLS-policy: `USING (public.is_admin())` (D7 udvider med scope-baseret, roadmap pkt 9)
- INGEN seed af clients eller client_field_definitions — Mathias seeder via UI/RPC

**D6: `d6_truncate_blocking` (20260511215749) [BYGGET].**

- `public.block_truncate_immutable()` trigger-funktion
- 4 BEFORE TRUNCATE-triggers attached: `audit_log_block_truncate`, `commission_snapshots_block_truncate`, `salary_corrections_block_truncate`, `cancellations_block_truncate`
- Migration-gate Phase 2 strict aktiveret via CI env `MIGRATION_GATE_STRICT=true`
- Migration-gate refactor: parser nu også `INSERT INTO public.data_field_definitions VALUES(...)` fra migration-filer (union med `classification.json`). Quote-aware tuple-parser.
- 5 nye fitness-checks tilføjet til de 5 starter-checks fra B4:
  - `migration-set-config-discipline` (kræver source_type + change_reason ved feature-table mutations; strip dollar-quoted function-bodies)
  - `dedup-key-or-opt-out` (nye CREATE TABLE skal have dedup_key eller `-- no-dedup-key:`-marker; 13 grandfathered tabeller)
  - `truncate-blocked-on-immutable` (immutable tabeller skal have BEFORE TRUNCATE-trigger)
  - `cron-change-reason` (cron.schedule()-bodies skal sætte stork.change_reason)
  - `db-rls-policies` (Management API-query for RLS-aktiverede tabeller uden policies; conditional på `SUPABASE_ACCESS_TOKEN`)
- Total: 10 fitness-checks i `scripts/fitness.mjs` (9 aktive + 1 conditional)

## 8.5 D7 — Under design [IKKE BYGGET]

Team- og org-modellen omtænkt efter pages-eksplosion-diskussion og biblen v3.1's "to dimensioner". Code's anbefaling: Hybrid Option C (separat `teams` for operationel klient-ejerskab + `org_units` træ for management-hierarki, koblet via `team.owner_org_unit_id`). Ikke endeligt godkendt af Mathias.

Designet skitseret (kan ændres):

- `public.org_units` med parent FK + cycle-prevention trigger (management-træ)
- `public.teams` med `owner_org_unit_id` FK (operationel enhed der ejer klienter)
- `employee_org_unit_history` + `employee_team_history` + `client_team_history` (audit-spor med exclusion-constraint mod overlap)
- ALTER `employees` ADD COLUMN `org_unit_id` + `team_id`
- ALTER `clients` ADD COLUMN `team_id`
- Helper-funktioner: `current_employee_org_unit()`, `current_employee_team()`, `org_unit_subtree(...)`, `is_in_subtree(...)`
- 4-5 RPCs: `team_upsert`, `employee_assign_to_team`, `client_assign_to_team`, evt. `employee_org_unit_history_read`
- Scope-enum udvides med `'subtree'` (mgmt-chefs ser teams hvor owner_org_unit_id ∈ subtree)
- ~25-30 nye klassifikations-rækker

Lag E venter på D7-godkendelse.

## 8.6 Slettede / droppede komponenter

- `bootstrap-invite` edge-function: slettet via Studio efter brug (var midlertidig vej til mg@ + km@). `list_edge_functions` returnerer nu 0
- M365 som integration: droppet i 2.0
- Brand som dimension: erstattet med klient (greenfield)

# 9. UI og apps

## 9.1 Apps-prioritering (når lag F starter)

Foreløbig liste (kræver workshop med Mathias + Kasper for endelig afgrænsning):

1. Salg & rapportering — kerne, alt bygger på det
2. Løn & provision — anden kerne, bygger på salg
3. Dashboards — basis-version uden alle 13 dashboards
4. FM-booking (vagt-flow) — efter salg er stabilt
5. Rekruttering — selvstændig, kan bygges parallelt
6. AMO + GDPR-compliance — har ramme i fase 0 (audit, klassifikation); UI bygges sidst
7. e-conomic
8. Gamification (League + Head-to-Head + Powerdag + Car Quiz + Extra Work)
9. Kontrakter
10. Pulse Survey + Code of Conduct

App-isolation håndhæves af ESLint: app må ikke importere fra anden app. Hvis to apps deler kode, skal det op i `services/` eller `@stork/core`.

## 9.2 Sider fra 1.0 (kontekst, ikke specifikation)

160 routede + 17 ikke-routede. 2.0 bygger sider ud fra forretningsbehov, ikke ved at kopiere 1.0.

Offentlige (uden login, 11): auth, reset-password, onboarding, contract/sign, book (kandidat-booking), unsubscribe, refer, korte links, survey, tdc-public. I 2.0 flyttes login til Microsoft Entra ID; offentlige sider ikke berørt.

Personlige (alle medarbejdere, 16): hjem, profil, vagtplan, mål, beskeder, gamification, karriere-ønsker, kontrakter, immediate payment ASE.

Plus: salg & rapporter (12), dashboards (14), Field Marketing (14), rekruttering (12), onboarding (4), AMO (11), GDPR/Compliance (14), e-conomic (8), løn (3), admin/system (16), TV-boards (5), Powerdag (3).

## 9.3 UI styrer alt der er drift [LÅST]

**Styres i UI:** pricing-værdier (regler, kampagne-mappings, priority), kampagne-overrides, klient-konfiguration (felter, retention pr. felt), medarbejdere (oprettelse, deaktivering, anonymisering), vagter, rettigheder (roller, permissions, scope), bookinger, dashboards-konfiguration, KPI-aktivering, klassifikation (når UI-editor bygges), retention-politikker.

**Styres i kode:** pricing-motoren selv (algoritme i `@stork/core`), beregningsformler (commission, salary, period), datastrukturer, lag-arkitektur, fundamentale forretningsregler, page-felter (hvilke kolonner en page viser).

**UI-editor for klassifikation [UDSKUDT til lag F+].** Pt. kan værdier i `data_field_definitions` kun ændres via SQL eller `data_field_definition_upsert()` RPC. Roadmap-mål: superadmin-side med inline-redigering. Bygges når D4 er klar.

# 10. Zone-tænkning [LÅST som princip]

```
RØD ZONE  → STOP. Eksplicit godkendelse + plan før ændring.
GUL ZONE  → Plan. Bekræft. Test før deploy.
GRØN ZONE → Standard kvalitetstjek.
```

Triggere der altid gør rødt:

- Lønberegning
- Persondata
- DB-skema (altid migration + RLS-tjek)
- Ved tvivl: RØD

**Rød zone i 2.0:**

- Tre låste schemas (`core_identity`, `core_money`, `core_compliance`) — schema-grænse håndhævet af Postgres
- `@stork/core` (salary.compute, pricing.match)
- Immutable tabeller (audit_log, commission_transactions, economic_invoices, amo_audit_log)
- Auth/RLS-fundament
- GDPR retroactive-mekanismer
- Integrations-adapter-kode

**Forskel fra 1.0.** 1.0 brugte zoner som fil-niveau-disciplin (top 10 filer). 2.0 bruger zoner som schema-grænse håndhævet af Postgres + ESLint + CI. Pre-commit-hook kræver "ZONE: red"-prefix i commit-message for ændringer i `core_*`-schemas eller pricing/permissions/lønberegnings-filer.

# 11. Åbne beslutninger

## 11.1 Fase 0 — skal afgøres nu

### Rettigheds-model fundament

Den samlede rettighedsopsætning er under afklaring. §5.1 (to dimensioner), §5.2 (D4-rolle-model), D7-teams og pages-arkitekturen hænger sammen — beslutninger truffet på ét sted påvirker de andre.

Konkrete åbne punkter:

1. Holder to-dimensions-modellen (rolle × team) eller er der behov for flere akser?
2. Er den firedimensionelle permission-model (page_key/tab_key + can_view/can_edit + scope + role_id) den rigtige form?
3. En rolle pr. medarbejder eller M2M?
4. Hvordan håndteres rolle-typer (TM-medarbejder vs. stab vs. leder) — som scope-konfiguration eller som separat dimension?

Blokerer Lag E sales-tabel og Lag F UI-bygning.

### Pages-arkitektur: hardkodet vs. data-drevet

§5.4 beskriver retningen "hardkodede pages, scope-filtrering på rækker" med vagtplan-1.0 som bevis. Argumentet imod data-drevne pages (CMS som Strapi/Sanity): 3-6 måneders investering for to-personers projekt. Argumentet for: fleksibilitet hvis felter pr. rolle reelt varierer meget.

Skal afgøres som del af rettigheds-modellen — pages-arkitektur og permission-modellen er sammenflettede.

### D7 rettigheds-model

Status: Code har foreslået Hybrid Option C. Venter på Mathias' godkendelse.

1. Accepteres Hybrid Option C som retning?
2. scope='subtree' tilføjes nu eller udskydes til 2.1+?
3. Klient-overdragelse: hård cut-over eller overlap-mulighed?

Blokerer lag E (sales-tabel design afhænger af team-modellen).

## 11.2 Lag E — skal afgøres før Engine + Integration

### Lønunderskud rollover

1.0-mønstret: lønunderskud ruller over til næste periode (ingen negativ løn-udbetaling), afskrives ved medarbejder-stop. Skal modellen bevares uændret i 2.0, eller skal mekanismen revurderes? Praktiske spørgsmål: hvor præcist gemmes rollover (egen tabel vs. felt på periode vs. salary-correction-række), og hvad er afskrivnings-flow ved stop (manuel godkendelse eller automatisk)?

### Teamleder-DB-KPI — uinddrivelige beløb

1.0-princippet: annulleringer fra stoppede medarbejdere må ikke ramme teamleders DB. Skal det implementeres som KPI-konfiguration (filtrering på `is_active = true` i formel-engine), eller som hardkodet løn-regel? KPI-vej giver fleksibilitet (Mathias kan justere uden kodeændring); hardkodet-vej er mere robust mod fejlkonfiguration.

### Provision-split

Understøtter Stork 2.0 at samme salg attribueres til flere employees (FM-leder + sælger, referral-bonus)?

- Ja → UNIQUE(period_id, sale_id, employee_id) på commission-tabel
- Nej → UNIQUE(period_id, sale_id)
- Code's anbefaling: tilføj employee_id for fleksibilitet, koster intet

### Håndtering af pending → afvist

§4.1 siger provision = Sum(pending + completed) − Cancellations, og at status er engangs-transition efter completed/afvist. Når et `pending` salg afvises (af system eller klient), hvordan tilbageføres provisionen?

- Mulighed A: status opdateres på sales-rækken; provision falder ud af summen automatisk. Kun gyldigt før periodelåsning.
- Mulighed B: afvisning behandles som cancellation-række uanset timing — sales-rækken er altid append-only på status.
- Konsekvens: A er enklere; B er konsistent med "stammen som sandhed" og kompenserings-mønstret i §4.1.

### Naming: `commission_transactions` vs `commission_snapshots`

Begge navne bruges i forskellige kilder. 1.0 og runde 2 bruger `commission_transactions`. Fase 0-diskussion brugte `commission_snapshots`. Skal afgøres før lag E.

### Sales-tabel snapshot-felter

Hvilke felter snapshot'es ved sales INSERT? Trigger eller eksplicit i RPC?

- sales.team_id_snapshot
- sales.commission_dkk_snapshot
- sales.revenue_dkk_snapshot
- sales.employee_id

### `employee_client_assignments` semantik fra 1.0

Bruges til attribution af salg eller kun adgang? 1.0 USIKKER. Tidligere antagelse: kun adgang. Skal verificeres i 1.0 før lag E bygger sales-attribution.

### Subsidy-håndtering

Manglende subsidy-data fra dialer (kampagne-fallback kan vælge regel vilkårligt). Code's antagelse: subsidy bortfalder som pricing-input. Bekræftes med Mathias.

### Webhook-rate-limit i Adversus

1.0 har akut rate-limit-problem. 2.0's adapter designes med rate-limit-aware retry. Skal designes konkret når Adversus-adapter bygges.

### Domain events: tilføjes eller ej

Code's stand: synkron RPC primært, ingen `domain_events`-tabel som infrastruktur. Hvis pipelines vokser sig komplekse, kan tilføjes som fase 4 uden at bryde modellen. Døren står åben.

## 11.3 Lag F — skal afgøres før UI + Apps

### Page-permission evaluering i frontend

- Hvilken page-key matcher hvilken React-component
- Hvordan checkes scope (all/team/self) i komponenten
- Hvordan håndteres conditional rendering af tabs

### Microsoft Entra ID-konfiguration

- Supabase provider-konfiguration
- Entra app-registration (claims, scopes, redirect URLs)
- Mapping fra Entra-claim til employees-record
- Group-baseret rolle-tildeling eller manuel?
- Hvad sker hvis Entra-konto deaktiveres?

### clients_select RLS-policy

D5 implementerede `USING (public.is_admin())`. Skal udvides i lag F til at konsultere `role_page_permissions` for `page_key='clients'`.

### UI-editor for data_field_definitions

Superadmin-side med inline-redigering. Bygges når D4 er klar.

### KPI/formel-editor UI

Drag-and-drop visual builder, live-test mod rigtige data, permission-toggle pr. formel.

### Andre UI-spørgsmål

- Rolle-oprettelse (clone fra eksisterende?)
- Team-oprettelse
- Notifikations-channels (email, in-app, SMS via Twilio)
- Sidebar/navigation-struktur

## 11.4 2.1+ — bygges senere

### Hierarki-graduering (FM-chef, TM-chef niveauer)

I dag (100 medarbejdere) er det fladt: ejer → teamleder → sælger. Bygges når Stork vokser til mellem-niveauer. D7's Hybrid Option C er klar til at understøtte uden migration.

### Multi-team-medlemsskab

Cross-funktionelle teams, AMO-udvalget, strike-teams. Tilføj `employee_team_memberships` M2M hvis behov, uden at bryde primary employees.team_id.

### Team-historik når team selv flytter

FM-team Nord flyttes til Salgsafdeling. Ikke prioriteret.

### Time-attribution til klient

Hvilken klient tilhører en medarbejders arbejdstid? Fire mulige veje:

1. API-baseret — Adversus/Enreach call-logs udleder klient pr. samtale
2. Vagtplan-baseret — medarbejderens plan siger hvilken klient
3. Manuel registrering — stempelur eller anden eksplicit indtastning
4. Hybrid — kombination (fx vagtplan + API til fordeling)

Forretningsregler uafhængigt af vej:

- 1 klient den dag → al tid dertil
- Flere klienter → fordelings-mekanisme
- Max 4 klienter pr. dag pr. medarbejder
- Max 1 klient ad gangen, kan skifte i løbet af dag

I 1.0 var stempelur Mathias' bud (tre typer: Overskrivende, Dokumentation, Omsætning/time). Reference, ikke specifikation. Beslutning udskydes til time-attribution faktisk bygges.

### `correct_pay_period_delete()` RPC

DELETE blokeret som default. Hvis behov: bygges som dedikeret RPC.

### GDPR retroaktiv sletning UI

Mekanisme skitseret (§4.2). Bygges når lovgivning kræver det eller GDPR-request kommer.

### Migration-strategi for 1.0 → 2.0

2.0 bygges greenfield, ikke som migration. Parallel drift først, derefter cutover.

### Real-time vs polling cross-session

1.0 har `mg-test-sync`-broadcast. 2.0 bevarer mønstret, formaliserer med typed keys.

### Backup-paradox

Hvis vi sletter PII fra audit_log og restorer fra backup taget før, kommer PII tilbage. Backup-strategi for compliance skal designes.

## 11.5 Spørgsmål der venter på data eller revisor

- Backup/restore RTO/RPO for løn-systemet
- Lovgivnings-krav for løn-data — bekræftes med revisor
- Skalerbarhed mod 200+ ansatte (data-volumen, ikke arkitektur)
- Multi-superadmin-godkendelse for kritiske handlinger (system_superadmins forhindrer count < 2; multi-godkendelse for specifikke handlinger er åbent)
- Kandidat-sletning efter konfigureret periode (ikke fuldt automatiseret i 1.0; skal med i 2.0's GDPR-pipeline)
- Email-provider for cron-notifikationer
- Dedikerede AMO-ansvarlig / GDPR-ansvarlig / økonomi-ansvarlig roller (EU AI Act + compliance)

# 12. Forbudte mønstre

Anti-mønstre fra 1.0 der ikke må gentages.

**1. Dobbelt sandhed for identitet.** 1.0 har 3 identiteter parallelt (employee_master_data, agents, sales.agent_email) uden FK-constraint. 2.0: `persons` + `person_identities` med UNIQUE, én resolver i `@stork/core`.

**2. Hardkodede rolle-bypasses.** `if (roleKey === 'ejer') return generateOwnerPermissions()`. 2.0: `is_admin()` permission-baseret. Ingen `if (role === '...')` nogensinde.

**3. Sammenblanding af rolle og team.** `fm_medarbejder_` blander team ind i rolle. 2.0: rolle = samling af rettigheder, team = operationel enhed. UI håndhæver adskillelsen.

**4. Roller uden reel rangordning.** 1.0 har 6 roller med priority=100. 2.0: roller har klare permissions, ingen priority-felt nødvendigt.

**5. Pricing tie-breaker mangler.** 1.0 har `ORDER BY priority DESC` uden sekundær nøgle. 2.0-løsning: §6.1.

**6. `product_campaign_overrides` halv-død.** 1.0 har 76 aktive rækker der ikke læses af pricing-motoren. 2.0: dropper tabellen; overrides via priority i `product_pricing_rules`.

**7. Hardkodede konstanter i helpers.** Lønperiode 15→14, 12,5 %, 750 kr osv. hardkodet i `hours.ts`. 2.0: alle værdier i UI fra start. Algoritmer i `@stork/core` (pure functions), værdier i UI-konfigurations-tabeller. Ingen `system_constants`-mekanisme.

**8. Trigger-spaghetti.** `enrich_fm_sale`, `create_fm_sale_items`, `validate_sales_email` osv. gør tunge ting uden synlighed. 2.0: navngivne RPCs kaldt eksplicit fra pipelines. Triggers kun for audit, immutability og constraint-validering.

**9. Skygge-funktionalitet.** Cron-jobs ikke synlige i UI, healers, realtime broadcasts ikke centralt registreret, 17 ikke-routede sider. 2.0: `cron_heartbeats` synlig, audit-trail på cron, ingen healers (fix root cause), realtime broadcasts registreret centralt.

**10. Ingen testdækning på kerne.** 1.0 har 3 testfiler. 2.0: `@stork/core` har golden-case-tests for hver pure function; CI fitness kræver minimum-test-coverage.

**11. Manuel registrering af query keys.** 1.0 har `QUERY_KEYS_TO_INVALIDATE` + manuel sync. 2.0: typed query keys (TypeScript), service-lag inkapsulerer cache-invalidation, cross-session sync med typed events.

**12. Direct Supabase-kald fra komponenter.** 146 komponenter i 1.0. 2.0: ESLint-regel blokerer; komponenter kalder service-lag hooks.

**13. Sammenblanding af UI og forretningslogik.** "Stab" som job_title med logik i hook. 2.0-løsning: §6.3 (stab er rolle).

**14. Backdoors i auth.** Custom password-reset, hardkodet rolle-keys, `verify_jwt = false` på interne flows. 2.0: Microsoft Entra ID eneste provider for medarbejdere, ingen backdoor ved Microsoft-nedbrud. Webhooks bruger separate auth (signed payloads, IP-allowlist).

**15. Healers og enrichment efter indkomst.** `enrichment-healer`, `heal_fm_missing_sale_items`. 2.0: salg valideres ved INSERT; hvis adapter ikke kan resolve, lander det i `needs_processing`-kø. Ingen baggrund-healers.

**16. Manglende immutability-håndhævelse.** 1.0 har "ærlig disciplin" uden DB-trigger. 2.0: BEFORE UPDATE/DELETE-trigger på alle immutable tabeller, TRUNCATE-blokering, korrektion via modposter.

**17. Hardkodede konstanter i edge functions uden frontend-mirror.** 1.0 har `_shared/pricing-service.ts` og `pricingRuleMatching.ts` 1:1 manuelt. 2.0-løsning: §4.7 (`@stork/core`).

**18. UI-only validering.** 1.0's vagt-overlap valideres kun i UI. 2.0: eksklusion-constraint via btree_gist (installeret i lag C).

**19. Feature flags der ikke ryddes op.** 2.0: feature flags kun for konkrete, korte rollouts. Hver flag har ejer og lukke-dato.

(Tidligere punkt 20 om data-drevne pages er ikke et anti-mønster fra 1.0 men et valgt arkitektur-mønster for 2.0. Flyttet til §5.4 / §13.)

# 13. Lukkede beslutninger og hvad de erstatter

Disse må ikke re-åbnes. Tidligere overvejede løsninger der er erstattet, er listet for kontekst — ikke som alternativ.

| Spørgsmål                                      | Beslutning                                                                                            | Erstatter                                                                                               |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Brand i 2.0?                                   | Nej, klient er dimensionen                                                                            | CLAUDE.md princip 4 "udfases gradvist"                                                                  |
| Lønperiode-låsning                             | Bygget i C4 med 2-stage status-enum (open/locked) + RLS-trigger                                       | CLAUDE.md princip 3 "åben beslutning"; tidligere doc-version hævdede 5-stage livscyklus, fjernet i v1.3 |
| Ferieanmodning                                 | 5 uger default, UI-justerbar                                                                          | CLAUDE.md princip 10 "5 uger" (fast)                                                                    |
| Rolle-type (team/stab/begge) som flag          | Nej, per-page scope dækker                                                                            | Mathias' originale tanke                                                                                |
| Stillings-koncept som separat dimension        | Nej, ikke nødvendigt                                                                                  | Mathias' originale tre-dimensions-model                                                                 |
| Dashboards eget rettighedssystem               | Nej, pages med "se page" + "se alt"-flag                                                              | dokument-1 §3.1                                                                                         |
| Data-drevne pages                              | Nej, hardkodede pages med permission-toggles                                                          | Tidligere overvejelse                                                                                   |
| M365 som integration                           | Droppet i 2.0                                                                                         | 1.0's SharePoint-synk for kontrakter                                                                    |
| `fm_medarbejder_`-konsolidering                | Bygges fra bunden i 2.0                                                                               | 1.0's konsoliderings-arbejde                                                                            |
| 6 priority=100 roller                          | Bygges fra bunden i 2.0                                                                               | 1.0's rangordnings-overvejelse                                                                          |
| Microsoft Entra ID som eneste provider         | Ja                                                                                                    | Email/password fra Supabase Auth                                                                        |
| Backdoor ved Microsoft-nedbrud                 | Nej                                                                                                   | Email/password som fallback                                                                             |
| Pages-mønster                                  | Hardkodede pages, permission-baseret række-filtrering                                                 | Separate pages pr. team                                                                                 |
| Bogføring i Stork                              | Nej, e-conomic har det                                                                                | Antagelse om at Stork havde bogføringspligt                                                             |
| Snapshot vs lookup for sales-historik          | Snapshot på sales-rækken ved INSERT                                                                   | Pure lookup-model                                                                                       |
| History UI-synlig (team-historik)              | Udsæt til lag F                                                                                       | Inkluder i fase 0                                                                                       |
| clients scope-policy                           | Udsæt til lag F                                                                                       | Inkluder i D5                                                                                           |
| Beregninger i PL/pgSQL-RPCs (alternativ A)     | Nej, TypeScript-pakke `@stork/core`                                                                   | A's argumentation om "Postgres som ét sted"                                                             |
| Bred stamme (alternativ A's 8 lag)             | Nej, smal stamme (3 schemas + delt pakke)                                                             | "For mange ting kaldt stamme = intet er stamme"                                                         |
| Domain events som infrastruktur (alternativ D) | Nej, synkron RPC primært                                                                              | "Ekspansion, ikke konsolidering"                                                                        |
| `product_campaign_overrides` udfasning         | Drop helt i 2.0 (greenfield)                                                                          | (a) konsolider til product_pricing_rules / (b) behold som override-mekanisme                            |
| retention_policies som separat tabel med FK    | Nej, retention pr. kolonne i `data_field_definitions`                                                 | Code's oprindelige plan                                                                                 |
| Audit-omfang                                   | Klassifikations-styret: ja på operationel/konfiguration/master_data; nej på audit selv og raw_payload | Per-tabel opt-in alene                                                                                  |
| Cron-mekanisme                                 | Hybrid: pg_cron tickrer, edge functions arbejder                                                      | Pure pg_cron eller pure edge                                                                            |

# 14. Tvivl der ikke er afklaret i mig

Jeg har ikke selv set følgende beslutninger blive truffet — jeg ved dem fra transcripts. Du bør verificere med din egen erindring:

1. **D7 Hybrid Option C status.** Foreslået af Code, ikke endeligt godkendt af dig.
2. **Provision-split.** Markeret som åbent; har du eventuelt afgjort det undervejs?
3. **Klassifikations-defaults (change_reason=none, amount-felter=none, old_values/new_values=indirect).** Var de endeligt accepterede, eller stadig under iteration?
4. **`commission_transactions` vs `commission_snapshots` naming.** Begge navne bruges i kilderne.
5. **KPI-permission-modellen** (eks. omsætning_total kun for ejer). Endeligt designet eller stadig iteration?
6. **Apps-listen.** Foreløbig, kræver workshop.
7. **Microsoft Entra ID detaljer** (claims-mapping, deaktivering, auto-provisioning). Skal afklares før lag F.
8. **Anonymisering-mekanik.** Hvilke felter præcist anonymiseres (CPR, bank, adresse, telefon, navn)? Bevares first_name+last_name som hash eller blankes?
9. **Sales-tabel snapshot-felter.** Markeret som [LÅST som retning] i kildemateriale, men detaljer er åbne.
10. **Lønperiode 15→14.** Algoritme er kode, start_day-værdi er konfiguration. Bekræft denne fortolkning.

# 15. Samarbejds-principper

## Roller

**Mathias** beslutter. Reviewer specifikationer før kode skrives. Stopper arbejdet hvis AI'erne glider mod kompromis.

**Claude.ai** formulerer prompts til Code, holder flow i samtalen, fungerer som mellemmand. Strategisk analyse og refleksion. Spotter glid hos sig selv og Mathias. Bevarer kontekst på tværs af sessions. Har ingen repo-adgang.

**Code (CLI)** bygger fase 0-mekanismer, schemas, `@stork/core`. Empirisk verifikation via repo-adgang + Supabase MCP. Argumenterer mod Mathias' tanker hvis han er uenig. Lag-skifte kræver eksplicit godkendelse. Pause ved tvivl.

**Codex** reviewer Code's arbejde. Finder huller. Krydslæser logikker mod implementation.

**Lovable** bygger UI fra lag F.

## Kommunikation

Dansk. Konklusion først. Konkrete A/B/C-valg. Ærlig — også når det er ubehageligt. Ingen pakning, ingen salgssprog, ingen selvros. Tone konstant uanset modparts tone.

Brug: "Ja, det giver mening." "Nej, det er ikke rigtigt." "Jeg ved ikke." "Fair." "Det var upræcist af mig." "Jeg er uenig." "Det rammer."

Undgå: "Det er et rigtig godt perspektiv!", "Skarpt set", "Godt fanget", "Lad os dykke ned i...".

## Disciplin på lag-skifte

Lag A → B → C → D → E → F. Mathias godkender eksplicit mellem hvert lag. Steps inden for et lag kan flyde uden mellem-godkendelse.

Hvert lag har anden type beslutninger:

- A→B: disciplin-mekanismer tændes
- B→C: første DB-templates landes
- C→D: klassifikation, permissions, status-model materialiseres
- D→E: engine + webhook-forwarder; PII begynder at lande
- E→F: UI bygges, brugerne ser noget

## Hvad har fungeret

- Code laver proposal, Mathias godkender retning, Code bygger detaljeret proposal, Mathias godkender, Code bygger
- Iteration på fundament-beslutninger: Code's første proposal forenkler for meget; Mathias udfordrer; Code revurderer ærligt; anden eller tredje iteration er bedre
- Flag tvivl undervejs, fortsæt ikke i blinde

## Hvad har ikke fungeret

- Code har 2 gange brudt mønstret om eksplicit godkendelse (lag A→B uden at vente; `apply_migration` på live-db uden Mathias' svar på 5 spørgsmål). Begge gange fangede Code sig selv og rullede tilbage. Mønster: "grønne tests" eller "ryddet repo" tolket som implicit godkendelse → forkert.
- Claude.ai har overrullet Mathias' beslutninger: brugte vagtplan-bevis (pages-arkitektur) til at understøtte rolle-model-beslutning. Accepterede Code's afvisning af rolle-type-flag uden at bevare Mathias' originale tanke. Behandlede "hurtige tanker" som forslag og designede rundt om dem.
- Code's forenklingsdrang: første D7-proposal droppede teams som koncept. Mathias måtte korrigere.

## Når noget glider

Mathias' principper:

- "Vi vokser. Modellen skal HOLDE."
- "Hierarki-graduering tilføjes når behovet er konkret."
- "Vi bygger 2.0, ikke kopierer 1.0."
- "Fundament over alt. Vi kan ikke bare skubbe ting til i morgen."
- "Det er vigtigt vi ikke bare antager og tager den hurtige nemme løsning."

Når Claude.ai mærker glid: stop. Sig hvad der skete. Bed om korrektion.

Når Code mærker glid: stop. Indrøm. Rul tilbage hvis nødvendigt. Vent.

# 16. Hvordan dette dokument bruges

**Ved start af session.** Læs §1-3 (kontekst + principper). Skim resten. Læs relevante sektioner dybt for opgaven. Tjek §11 (åbne) og §13 (lukkede) før du foreslår en retning.

**Når noget besluttes.** Markér med [LÅST] / [ÅBEN] / [UDSKUDT]. Opdatér relevant sektion. Flyt fra åben til lukket i §11/§13 hvis relevant. Hvis ny beslutning erstatter gammel: skriv den nye i hovedteksten; tilføj én linje under §13 om hvad der blev erstattet.

**Ved konflikt mellem dette dokument og kode:** kode er sandhed, men uenigheden rapporteres så dokumentet kan opdateres.

**Ved konflikt mellem dette dokument og biblen v3.1:** biblen vinder, men flag uenigheden.

---

_Version 1.3 · 12. maj 2026 · Refactor af §4-§8 empirisk verificeret mod imtxvrymaqbgcvsarlib + repo claude/review-phase-zero-plan-oW5Cg @ 7157579e7. Status-skala indført: [BYGGET] / [DESIGN, IKKE BYGGET] / [LÅST som retning, IKKE BYGGET] / [ÅBEN]. v1.3-ændringer:_

- _§4.2 BYGGET-claim verificeret + tilføjet RPC-navne, trigger-navne, faktisk antal kolonner/rækker. Klient-specifik retention re-klassificeret til DESIGN (ikke seedet)._
- _§4.3 RLS-arkitektur præciseret pr-tabel. cron_heartbeats korrigeret til "ENABLE ikke FORCE" (skip-force-rls marker)._
- _§4.4 audit-systemet udvidet med faktisk source_type-detection-prioritet + LENIENT/strict-mode + D5 jsonb-special-case._
- _§4.5 cron_heartbeats fjernet fra immutable-listen (ikke immutable). 4 immutable tabeller verificeret: audit_log + commission_snapshots + salary_corrections + cancellations._
- _§4.6 tre schemas re-klassificeret fra "LÅST som arkitektur" til "LÅST som retning, IKKE BYGGET" (alt i public i fase 0). Status-bemærkning tilføjet._
- _§4.7 modsigelse løst: identity.resolve tager snapshot som argument fra gateway. Status: pakken eksisterer men tom._
- _§4.8 + §4.9 re-klassificeret til "LÅST som retning, IKKE BYGGET" (mapper findes ikke i repo)._
- _§4.10 status-bemærkning tilføjet (mg@/km@ via Supabase Auth magic-link, ikke Entra endnu)._
- _§6.1, §6.2, §6.5, §6.8 re-klassificeret til "LÅST som retning, IKKE BYGGET" (tabeller eksisterer ikke)._
- _§6.7 periode-låsnings-bemærkning korrigeret (status-enum 2 værdier, ikke 5)._
- _§6.9 markeret BYGGET, D5. Faktiske RPCs + trigger + tabel-detaljer tilføjet. Klient-specifik retention IKKE seedet i fase 0._
- _§7 tal præciseret: 13 public-tabeller, 28 public-funktioner, 10 fitness-checks (9+1 conditional), 12 migrations._
- _§8.1 Lag A korrigeret: services/\_gateway/\_adapters-mapper findes ikke, @stork/core er tom (export {};). Faktisk struktur dokumenteret._
- _§8.2 Lag B: "no raw SQL i TS-kode" fjernet (eksisterer ikke). workspace-boundaries tilføjet (manglede)._
- _§8.3 Lag C komplet omskrevet pr-migration mod faktiske SQL-filer. C1 = RLS-helpers stub (ikke pay_periods). C4 = pay_periods + 5 tabeller (ikke kun cron+RLS). Pay_periods livscyklus = 2 værdier (open/locked), ikke 5 stadier._
- _§8.4 Lag D komplet omskrevet pr-migration. D3 RPC-liste rettet (employee_anonymize findes IKKE — anonymisering er roadmap). D4 roles-kolonner rettet (ingen is_active). D5 + D6 udvidet med faktiske detaljer._
- _§8.5 D7 — Hybrid Option C-beskrivelse udvidet: teams separat fra org_units, koblet via owner_org_unit_id._
- _§11.1 pay_periods-afklarings-punkt FJERNET (verificeret 2-stage; ikke længere åbent)._
- _§12 punkt 20 (data-drevne pages som anti-mønster) FJERNET — det er et valgt arkitektur-mønster, ikke 1.0-anti-mønster. Reference tilføjet til §5.4/§13._
- _§13 lønperiode-låsning-række opdateret til 2-stage + C4 (ikke C1)._

_v1.2: §3.2 punkt 6+7 flyttet til §11.2; §3.3 "hardkodede pages" flyttet til §11.1; §5.1 LÅST→ÅBEN; §5.2 LÅST og BYGGET→D4 BYGGET. v1.1: §6.2 attribution opdateret, pay_periods-stadier flyttet til §11, dubletter fjernet._
