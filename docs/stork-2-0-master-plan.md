# Stork 2.0 — Master-plan

**Status:** Komplet med 17 rettelser indlejret
**Dato:** 13. maj 2026
**Skopus:** Fundament + Lag E (forretnings-domæner)
**Grundlag:** Behov, krav-dokumenter, FM deep dive, 17 strategiske afgørelser

---

## Læsevejledning

Dokumentet er master-plan for Stork 2.0. Det erstatter ikke princippet "vi bygger fra behov" — det realiserer princippet ved at oversætte krav og afgørelser til arkitektur.

**Struktur:**

- §0 Plan-grundlag — hvad planen bygger på
- §1 Fundament — det alle forretnings-domæner hænger på
- §2 Lag E — forretnings-domæner
- §3 Disciplin — CI-blockers og test-skabeloner
- §4 Byggerækkefølge — 31 trin med schema-tildeling
- §5 Det vi står inde for
- Appendix A: Lukkede beslutninger (kan laves om)
- Appendix B: Åbne beslutninger (afgøres ved bygning)
- Appendix C: Rettelses-historik

Konkrete tabel- og kolonne-navne afgøres ved bygning. Planen taler i koncepter.

---

## §0 Plan-grundlag

### Vision

Meget data, styr på data og slette-regler, rettigheder der virker, driftsikkert, anonymisering bevarer audit, alt drift styres i UI.

### Tre principper

1. **Én sandhed** — én autoritativ kilde pr. fakta
2. **Styr på data** — klassifikation + retention på hver kolonne
3. **Sammenkobling eksplicit i modellen** — relations som data, ikke implicit

### Filosofi

**Stamme = database.** Adgang, klassifikation, audit, lås, snapshot lever i DB.
**Beregning over databasen.** TypeScript-pakke (`@stork/core`), ikke PL/pgSQL.

### Stack

- React + TypeScript + Supabase
- Microsoft Entra ID som eneste auth-provider for medarbejdere
- Tre-schema-arkitektur (core_identity / core_money / core_compliance) fra trin 1
- Apps får eget schema (`app_<navn>`), må kun skrive til core\_\* via SECURITY DEFINER RPC'er

### Drift-kontekst

- 50-150 samtidige brugere voksende til 200-500
- Mange KPI'er
- 1M+ sales over tid

### Dashboard-model

Team-matrix + person-tildeling som union. Fri date-range bygget på dags-aggregater.

---

## §0.5 Migration fra 1.0

Stork 2.0 bygges greenfield, men data fra Stork 1.0 overføres. 130+ medarbejderes historik må ikke tabes.

### Grundprincip

**Migration sker via direkte udtræk + upload, IKKE via ETL-pipeline eller adapter-dobbelt-skriv.**

Mekanik pr. data-kategori:

1. Udtræk fra 1.0 (SQL-dump eller CSV) der matcher 2.0's tabel-struktur direkte
2. Upload via Code/psql/Supabase direkte til 2.0
3. Audit-spor: `source_type='migration'`, `change_reason='legacy_import_t0'`

**Hvad er ikke en del af migration:**

- Ingen UI-baseret import-flow
- Ingen sync-job mellem 1.0 og 2.0
- Ingen adapter-dobbelt-skriv
- Ingen migration_staging-schema (over-engineering for direkte upload)
- Ingen kompleks migration_orchestrator

Udtræk + upload er tilstrækkeligt. Inkonsistens-håndtering sker i udtræks-SQL eller pre-upload-scripts.

**Cutover kan ske gradvist** — behøver ikke vente på fuld lag E-færdighed. Cutover-tidspunktet er ikke deadline-drevet og ikke bundet til "alle 31 trin er færdige".

### De fire data-kategorier

**Kategori 1 — Historiske låste perioder** (alt før cutover-dato hvor 1.0 har låst/udbetalt løn):

- Importeres som immutable legacy-data i `core_compliance`-schema (se §1.11)
- To-tabel-tilgang: `legacy_snapshots` (data) + `legacy_audit` (1.0's audit-historik)
- Aldrig gen-evalueres gennem 2.0's formel-engine
- Tallene er udbetalt — ikke til debat

**Kategori 2 — Cutover-model B (modificeret implementation):**

- 1.0 fortsætter som autoritativ indtil cutover
- 2.0 bygges og master-data importeres tidligt (når trin 5-10 er klar)
- Skygge-validering: Mathias sammenligner 2.0's data mod 1.0 manuelt (ikke automatisk skygge-beregning, ingen adapter-dobbelt-skriv)
- Cutover sker når Mathias er overbevist — 1.0 går read-only, adapters re-pointes til 2.0
- Tidspunkt: ikke deadline-drevet

**Kategori 3 — Master-data** (medarbejdere, klienter, teams, identitets-master, produkter):

- **Discovery-fase før udtræk:** Code leverer discovery-scripts der kan køres mod 1.0; output er rapport med inkonsistenser (telefon-formater, e-mail casing, dubletter, klient-navne mv.)
- Mathias retter i 1.0 eller markerer som "håndteres ved import"
- Direkte upload til `core_identity` uden staging-schema
- Identitets-master: 1.0's parallelle strukturer (employee_master_data, agents, sales.agent_email) konsolideres ved udtræk; hver identitets-row markeres med 1.0-kilde

**Kategori 4 — Rådata** (sales, call_records, vagter, stempel-events):

- **Omfang styres ved import** — ingen hardkodet horisont
- Mathias afgør pr. kategori hvor langt tilbage data importeres (standard-anbefaling: 12 måneder)
- Idempotent via UNIQUE(source, external_id) — kan importere mere bagudrettet senere
- **Tallene bevares:** sales importeres med `commission_snapshot` fra 1.0 direkte; INGEN re-evaluering gennem 2.0's pricing-engine
- 2.0's pricing-engine bruges fra cutover og fremad
- Source-felt: `source='legacy_adversus'` eller `'legacy_enreach'` afhængigt af oprindelse
- Klient-team-snapshot importeres som-det-var i 1.0; ingen rekonstruktion

### Migration-leverancer pr. trin

Migration-trin er ikke separate trin — de integreres i eksisterende byggetrin (se §4). Pr. relevant trin leverer Code:

1. Udtræks-SQL-skabelon der kører mod 1.0
2. Upload-script der kører mod 2.0
3. Discovery-script hvor relevant (master-data-trin)

Mathias eksekverer manuelt når han er klar.

### Audit af migration

- Hver migration-handling auditeres med `source_type='migration'` + `change_reason='legacy_import_t0'`
- `audit_log` (2.0's universelle) fanger upload-handlingerne
- 1.0's audit-historik importeres separat til `legacy_audit` — ikke blandes med 2.0's audit_log
- Cutover-handling auditeres som operationel handling med detaljeret reason

### Reference

Detaljeret migration-analyse i `docs/migration-strategi-analyse.md` bevares som baggrund. **Master-planen er autoritativ; analyse-dokumentet er kun reference.** Ved konflikt: master-planen overrules.

---

## §1 Fundament

Fundamentet er hvad alle forretnings-domæner hænger på. Det skal stå rigtigt før noget af lag E bygges.

### §1.1 Adgangs-mekanik

Stack-konsekvens af Supabase + PostgREST: FORCE RLS som default pr. tabel. Default deny. Adgangs-sandheden lever i databasen, ikke i appen.

- Hver mutation-RPC sætter session-variabel der signalerer "denne RPC har autoriseret skrivning"; INSERT/UPDATE-policies kræver variablen sat
- Direkte tabel-rettigheder revokes fra alle roller. Adgang sker udelukkende via policies + RPC'er
- Policy-prædikater er simple lookups (session-var, indexed kolonne, helper-funktion). Ingen tunge joins
- Helper-funktioner: pure, STABLE, SECURITY INVOKER, deterministisk search_path
- SECURITY DEFINER tillades kun for trigger-funktioner (audit, immutability, cycle-detection) og for sjældne læse-RPC'er på tabeller uden FORCE RLS. Aldrig for forretningsfunktioner
- Pr. rolle pr. tabel: smoke-test som CI-blocker
- Hver policy-prædikat-kolonne har et index

**Undtagelser fra FORCE RLS:**

- `audit_log` og `cron_heartbeats` har `ENABLE RLS` (ikke FORCE) fordi SECURITY DEFINER trigger og write-RPC skal kunne INSERT'e
- Læsning sker via SECURITY DEFINER RPC med eksplicit permission-check
- CI-blocker #1 har eksplicit hvidliste eller skip-marker-pattern for disse undtagelser
- Implementations-detaljer (hvidliste vs marker) er Code's valg; pattern dokumenteres entydigt

### §1.2 Klassifikations-registry

Vision "styr på data" kræver at hver kolonne i hele systemet har eksplicit semantik.

- Én registry-tabel pr. (schema, table, column)
- 5 kategorier: operationel / konfiguration / master_data / audit / raw_payload
- 3 PII-niveauer: none / indirect / direct
- 4 retention-typer: time_based / event_based / legal / manual (med tilhørende jsonb-værdi)
- Match-rolle pr. felt (relevant for ingest, inkl. `crm_match_id`-værdi)
- Default retention-type: time_based. `legal` reserveres til lovgivnings-bundne entiteter
- Registry er UI-redigerbar (lag F). Ændringer auditeres
- Migration-gate blokerer PR ved ny kolonne uden registry-indgang

### §1.3 Audit-mønster

Sammenkobling eksplicit + rettigheder der virker = man kan altid se hvem gjorde hvad hvornår.

- Én universel audit-tabel — append-only, immutable
- BEFORE UPDATE/DELETE/TRUNCATE blokeret af triggers
- Pr. row: target, actor, source-type (manual / cron / webhook / trigger_cascade / service_role / unknown / migration), change_reason, schema_version, changed_columns, old_values, new_values
- Universel audit-trigger attaches pr. mutable tabel
- PII-filter: pii_level='direct' hashes til sha256 før audit
- jsonb-walker for klient-felt-bag (rekursiv hash pr. key efter felt-definitions)
- Audit auditerer ikke sig selv. raw_payload-kategori auditeres ikke

### §1.4 Anonymisering

**Princip:** Anonymisering = UPDATE, ikke DELETE. Audit-FK'er må aldrig orphan'e.

- Master-row pr. entitet med PII bevares evigt
- PII-felter UPDATE'es til hash eller placeholder
- `anonymized_at` sættes
- Hybrid eksekverings-vej:
  - UI-handling for konkrete personer (medarbejder anonymiseres efter stop + retention, GDPR-anmodning, klient lukkes)
  - Retention-cron for tidsbestemt anonymisering
  - Begge veje kalder samme `anonymize_<entity>(...)` RPC

**Erstatnings-strategier (gælder overalt):**

- `blank` — erstattes med `[anonymized]`
- `hash` — deterministisk sha256 (bevarer unique-constraints og statistik-unikhed)
- `delete_key` — for jsonb-keys

Felt-listen pr. entitet er deklareret data (anonymisering-mapping konfig-tabel), ikke hardkodet i kode.

**Backup-paradox — `anonymization_state` som autoritativ kilde:**

GDPR formålsbegrænsning kræver at PII forbliver væk efter anonymisering, også ved restore fra backup. Mekanisme: `anonymization_state`-tabel i `core_compliance` er autoritativ kilde til "hvad er anonymiseret" og kan replayes mod restored data.

`anonymization_state` (core_compliance):

- `id uuid` PK
- `entity_type text`, `entity_id uuid` (FK til master-row)
- `anonymized_at timestamptz`, `anonymization_reason text`
- `strategy_version int` (snapshot af anonymiserings-strategi-version)
- `field_mapping_snapshot jsonb` (hvilke felter, hvilken strategi pr. felt)
- `audit_reference uuid` (FK til audit_log-row)
- `created_at`, `created_by`
- Immutable. Evig retention (compliance-data).

**Mekanik ved anonymisering (atomar transaktion):**

1. Master-row UPDATE'es (PII → hash/blank/delete_key)
2. `anonymization_state`-row INSERTes med strategi-snapshot + audit-reference
3. Audit-trigger fanger begge handlinger

**Mekanik ved restore fra backup:**

1. Supabase restorer hele databasen
2. Post-restore RPC `replay_anonymization()` kører (automatisk hvis muligt, ellers procedure-baseret)
3. For hver `anonymization_state`-row: kald `anonymize_<entity>(id)` med strategi-snapshot fra log
4. Verifikations-RPC `verify_anonymization_consistency()` checker konsistens

**Sikrings-mekanismer:**

- `verify_anonymization_consistency()` kan altid køres on-demand
- Daglig sundheds-check i cron registreret i heartbeats
- Alert ved inkonsistens (anonymization_state-row uden tilsvarende anonymized master-data)

**Konsekvens:** Backup-retention kan være længere (14-30 dage) uden GDPR-risiko fordi restored PII automatisk re-anonymiseres.

### §1.5 Drift-skabelon

Vision "driftsikkert" + krav om mange KPI'er = cron er en stamme, ikke ad-hoc.

- `pg_cron` til jobs der berører databasen direkte
- Edge-functions til jobs der kalder eksterne API'er
- Heartbeats-tabel: én row pr. cron-job
- Hver job-eksekvering opdaterer heartbeat ved start og slut
- Failure auditeres (audit-trigger med WHEN-filter på status='failure')
- Cron-mutationer i migrations kræver `change_reason` — CI håndhæver
- Healthcheck-RPC eksponerer status til drift-overblik i UI
- Ingen skygge-cron

**Specifik cron-job:** `pay_period_auto_lock` — månedens sidste dag. Heartbeat-row pr. periode-type. Partial_failure-håndtering ved fejl på én periode.

**Eksternt monitoring — integration-punkter:**

- Integration-punkter forberedes i lag E; selve monitoring-system (Grafana / Datadog / Better Stack) tilkobles i 2.1+
- Heartbeats-data eksponeres via standardiseret RPC `cron_heartbeats_export()` (Prometheus-kompatibelt format)
- Healthcheck-RPC udvides med flere metrics (DB-størrelse pr. partition, ingest-volumen pr. kilde, unresolved-kø-størrelser, periode-låsnings-status)
- Dokumenteret skema for hvad eksternt system kan polle (label-konvention, type-konvention, retention-konvention)
- Format-konvention: gauge-værdier for current-state, counter-værdier for monotone tællinger, histogram-værdier for tids-aggregater

### §1.6 Periode-skabelon (lønperiode som første instans)

Periode-grænser er data, ikke hardkodet.

- Periode-entitet: type, start_date, end_date, status (open / locked), locked_at, locked_by
- Exclusion-constraint mod overlap pr. periode-type
- BEFORE UPDATE-trigger blokerer mutationer på låst periode
- Tabeller koblet til periode via `target_period_id` har RLS-policy der nægter mutation når target er låst
- Periode-mønster (start-dag, antal dage) er konfig-data — UI bestemmer. Default 15→14
- Cron sikrer fremtidige perioder altid eksisterer

**Lock-konfig (nyt fra rettelse 16):**

- `recommended_lock_date_rule` — default `month_last_calendar_day`
- `auto_lock_enabled boolean` — default true
- Helper-funktion `period_recommended_lock_date(period_id)` bruges af både cron og UI

**To låse-veje, samme RPC:**

- Manuel UI: administrator klikker "godkend lønperiode" → `pay_period_lock(period_id, change_reason)`
- Auto: cron månedens sidste dag → samme RPC med `change_reason='auto_lock_default'`

**Atomar lock-pipeline — forberedt-aggregat-mønster (to-fase):**

Lock-pipeline garanteres at være hurtig uafhængigt af data-volumen via candidate-snapshot-mønster:

**Fase 1 — Candidate-beregning (asynkron, før lock):**

- Cron-job kører fx 30 minutter før `recommended_lock_date`
- Beregner alle aggregater, formel-evalueringer, KPI-snapshots til **candidate-tabeller** parallelt med live drift
- Candidate-tabeller er identiske med final-tabeller men med `is_candidate=true`-flag (eller separat suffix `_candidate`)
- Audit fanger candidate-beregning som operationel handling
- Kan re-genereres ubegrænset uden at påvirke live data eller seneste authoritative snapshot

**Fase 2 — Promovering (atomar, ved lock):**

1. `pay_period_lock(period_id, change_reason)` validerer at candidate findes og er current (sammenligner candidate's underliggende data-checksums med live data)
2. Hvis candidate er stale (data er ændret siden candidate-beregning) → re-generér candidate inline, derefter promovér
3. Promovér candidate-rows til final immutable resultat-tabeller (UPDATE flag eller MOVE-mellem-tabeller)
4. Lønperiode-rækken UPDATE'es med status=locked
5. Hele promoveringen kører i én transaktion — rolles tilbage hvis nogen del fejler

**Lock-pipeline SLA:**

- **<10 sekunder** for største periode-type ved Stork's forventede skala (130-500 medarbejdere, 1M+ sales)
- Garanteret af candidate-mønstret — promoveringen er kun UPDATE af pre-beregnede rows + status-skifte
- Hvis candidate-beregningen i fase 1 tager længere (5-30 min) er det acceptabelt fordi det sker asynkront uden lock-contention

**Benchmark-test i CI:**

- Performance-test som CI-blocker i trin 7 (periode-skabelon) med syntetisk data svarende til 500 medarbejdere × 4 ugers data × 100k sales
- Fail hvis lock-pipeline overskrider 10s SLA

**Fail-mode:**

- Hvis promovering fejler → rolles tilbage, periode forbliver `open`, audit registrerer forsøget, alert udløses
- Hvis candidate-beregning i fase 1 fejler → cron heartbeat markerer failure, alert udløses, lock-RPC kan stadig kaldes (vil re-generere candidate inline med højere tid)
- Hvis auto-lock cron fejler 3 gange i træk → kritisk alert til Mathias
- Manuel `pay_period_lock`-kald er altid muligt som fallback

**Genåbning:** `pay_period_unlock(period_id, change_reason)` — sjælden, audited, kun for fejl opdaget umiddelbart efter lock men før udbetaling. Kræver break-glass-flow (se §1.15).

### §1.7 Identitet og rettigheder

**Personer:**

- Medarbejder-entitet er ankerentitet for et menneske. Én row pr. menneske, evig
- Auth-mapping via separat kolonne (auth kan udskiftes uden tab af historik)
- Microsoft Entra ID som eneste auth-provider for medarbejdere
- Hire_date + termination_date som data. Anonymized_at som flag

**Identitet-master:**

- Separat entitet fra medarbejder. Mange identiteter kan pege på samme medarbejder
- Identitet bærer: kilde (Adversus / Enreach / FM-manuel / TM-andet) + ekstern identifier + valid_from / valid_to
- Resolver returnerer eksplicit "ikke resolvable" — aldrig gæt der kan give samme person to navne
- Ikke-resolvable rækker lander i eksplicit kø der kræver manuel mapping
- FM-manuelle navne behandles som identitets-kilde blandt andre

**Roller og permissions:**

- Rolle = samling af rettigheder. UI-redigerbar. Ingen titler i kode
- Én rolle pr. medarbejder via FK
- 4-dimensionel permission-model: (page_key + tab_key) × (can_view + can_edit) × scope (all / subtree / team / self) × rolle-FK
- `is_admin()` evaluerer mod permission-rækker, ikke mod rolle-navn
- Stab, FM-leder, teamleder er roller i samme tabel — ingen FM-isoleret rolle-mekanisme

**Superadmin-floor (forhindrer alle-superadmins-slettet-tilstand):**

- BEFORE UPDATE/DELETE-trigger på `employees.role_id` og på role_page_permissions for admin-permission-rækker
- Konfig-tabel definerer minimum N (default: 2) medarbejdere der bevarer admin-permission
- Hvis mutation ville reducere admin-antal under N → RAISE med klar besked
- Sletning af medarbejder med admin-rolle udløser samme tjek
- N er UI-redigerbart i konfig-tabel

**Org-træ:**

- Selv-refererende `parent_id`. Cycle-detection-trigger via rekursiv CTE
- Vilkårligt antal niveauer. Mellem-niveauer tilføjes som data, aldrig som schema-ændring

**Closure-table for subtree-evaluering** (`core_identity.org_unit_closure`):

- Materialiseret hjælpe-tabel der erstatter rekursiv CTE i policy-prædikater
- Pr. (ancestor_id, descendant_id, depth) — én row pr. relation inkl. self-reference (depth=0)
- PRIMARY KEY (ancestor_id, descendant_id). Index på descendant_id for revers-lookup
- Vedligeholdes af AFTER INSERT/UPDATE/DELETE-trigger på org_units. Org-mutationer er sjældne; trigger-omkostning irrelevant
- Cycle-detection-trigger på `parent_id` og closure-vedligeholdelses-trigger fyrer i samme transaktion — begge skal lykkes
- Helper `acl_subtree(employee_id)` returnerer descendant-array via indexed lookup, ingen rekursion ved query-tid
- `acl_subtree` markeret STABLE, SECURITY INVOKER, deterministisk search_path

**Generelt princip for policy-prædikater:**

- Ingen rekursive CTE'er i RLS-policy-prædikater
- Hvor en hierarki-evaluering ville kræve rekursion, materialiseres closure-tabel der vedligeholdes af triggers
- Mønstret gælder også for andre senere hierarki-strukturer (klient-hierarkier, kampagne-træer, etc.)

**Teams:**

- Hører under præcis én org-enhed
- Ejer klienter; bærer medarbejdere

**Medarbejder-team-tilknytning:**

- Versioneret med `from_date` + `to_date`
- Partial unique på (medarbejder, to_date IS NULL) — én aktiv ad gangen
- Exclusion-constraint mod overlappende perioder
- Skifte-RPC lukker gammel og åbner ny i én transaktion

**Klient-team-ejerskab:**

- Samme versionerings-mønster. Partial unique på (klient, to_date IS NULL) — én klient = ét team ad gangen
- Klient-team-skift har overgangsdato; historik bevares

**Helper-funktioner pr. scope:**

- `self` — employee-match
- `team` — snapshot på data-rækken
- `subtree` — closure-table-lookup via `acl_subtree(employee_id)` (ingen rekursion ved query-tid)
- `all` — alle rækker

### §1.8 Klient-skabelon

Klient er driftens grundenhed. Stor variation i felter pr. klient — derfor felt-bag, ikke felt-eksplosion.

- Én klient-entitet med fælles kolonner (id, navn, anonymized_at). Klient-specifikke værdier i jsonb felt-bag
- Klient-felt-definitions-registry pr. klient: key, display-navn, type, required, pii-niveau, match-rolle, display-rækkefølge, is_active
- Match-rolle pr. felt: telefon / e-mail / kunde-id / opportunity-id / **crm_match_id** / andet
- `crm_match_id` rolle: klient-CRM-ID til reconciliation (Eesy customer_id, TDC opp_number, Tryg eget format, etc.)
- Validerings-trigger advarer ved ukendte jsonb-keys (LENIENT-default; strict-mode via session-var)
- Audit-PII-filter har special-case for jsonb felt-bag: walker keys og hasher hver med pii_level='direct'

### §1.9 Beregnings-runtime (TypeScript-pakke)

Filosofi: beregning over databasen. Én delt pakke importeres identisk af edge-functions (Deno) og frontend (Vite/React).

**Pakke-ansvarsområder:**

- `pricing.match` — autoritativ pris-match som ren funktion
- `salary.compute` — lønaggregering pr. medarbejder pr. periode
- `identity.resolve` — én resolver fra integration-payload til identitets-master + medarbejder
- `attribution.team` — team-tilknytning af salg via klient-team-mapping ved salgs-tidspunkt
- `klient_fordeling.compute` — fra vagt + events + manuel-input til segmenter
- `periode.from(timestamptz)` — periode-lookup, status-tjek
- `permissions.has` — permission-resolution som ren funktion
- `formula.evaluate` — formel-engine (DSL/AST) til alle beregninger
- `hotel.compute_cost` — pure funktion, tager værelser-snapshot som argument
- `supplier.compute_discount` — pure funktion, tager trappe-snapshot som argument
- `employee.compute_standard_hours(employee_id, period)` — udleder standard ugentlig/månedlig arbejdstid fra planlagte vagter (ingen dedikeret felt på medarbejder; vagten er én sandhed for både faktisk og forventet arbejdstid)

**Snapshot-mønster:** alle lookup-data fetches FØR pakke-kald og passes som rene argumenter. Bevarer purity.

**Værdier i UI-konfig-tabeller, ikke i koden:** lønperiode start-dag, feriepenge-sats, oplæringsbonus-størrelse, ASE-satser, formel-versioner.

Synkron RPC primært. Ingen domain-events som infrastruktur i fase 0.

**Deployment-synkronisering — frontend som kosmetisk preview:**

`@stork/core` deles mellem edge functions (Deno) og frontend (Vite/React). Ved deploy kan edge køre version N mens browser har cachet version N-1. Princip der gør dette uskadeligt:

- Frontend-beregning er **kosmetisk preview, ikke autoritativ**
- Live UI-respons (input-validering, foreløbig beregning mens bruger taster) bruger `@stork/core` lokalt med pre-fetched snapshot
- Ved save sender frontend **kun input-data**, aldrig beregnet resultat
- RPC udfører **altid** autoritativ beregning over den DB-state der findes ved save-tidspunkt
- RPC-resultat overskriver frontend-værdi i UI-response — bruger ser altid lagret værdi efter save
- Snapshot-mønstret garanterer at frontend og RPC arbejder på samme data ved samme tidspunkt; eneste forskel kan være `@stork/core`-versionen, og siden RPC er sandheden, kan deployment-version-mismatch ikke give forkert lagret data
- Mellem fetch og save kan formel-version i DB have ændret sig (sjælden i åben periode, umuligt i låst periode) — resultat er "korrekt for save-tidspunktet" som er forretnings-acceptabelt

Konsekvens: ingen version-tjek mellem frontend og RPC nødvendig. Ingen service worker-cache-invalidering. Princippet "RPC autoritativ" bærer alt.

### §1.10 Formel-system (tre-lags model)

Formel-systemet bygger på tre lag:

```
Rådata → Beregning → Output
```

**Lag 1 — Rådata** (ingen transformation, gemmes som-er):

- Klient-tid-segmenter
- Vagter
- Salg
- Stempel-events
- Bookings og booking-assignments
- Call_records

**Lag 2 — Beregning** (transformation via formel-engine):

- Pricing er en beregning (rådata salg → commission)
- Klient-tid-betaling er en beregning (rådata klient-tid × CPO/provi-regler → beløb)
- Aggregering er en beregning (rådata × dimensioner × periode → tal)
- Trappe-evaluering (leverandør-rabat) er en beregning
- Alle beregninger via `@stork/core/formula.evaluate(formula, inputs)` — én engine

**Lag 3 — Output** (kun to typer):

- **KPI** — rapportering, dashboards, ledelsesinformation. Skrives til `kpi_snapshots`
- **Lønart** — lønberegning, ender i payroll-linjer

**Formel-entiteten:**

- id, navn, version (monotont stigende pr. navn)
- `output_type enum('kpi', 'lønart')`
- valid_from, valid_to
- expression jsonb (AST)
- input_variables jsonb
- permission_level (gælder KPI'er)

**Pricing er IKKE et output_type** — det er en beregning hvis resultat bliver input til lønart (provision).
**Klient-tid-betaling er IKKE et output_type** — det er en beregning hvis resultat kan blive både KPI- og lønart-input.

**Versionering:** UNIQUE(navn, version). Ny ændring = ny række. Gamle versioner bevares immutable. Versioner fryses pr. lønperiode-låsning.

**Formel-grupperinger (UI-redigerbare):**

- Pr. gruppe: id, navn, beskrivelse, is_active
- Relations-tabel: formel × gruppe (M2M)
- Eksempler: "FM KPI", "Eesy KPI", "TM lønarter", "Mileage-relateret"
- Rapport-RPC'er og dashboard-konfig kan filtrere/gruppere på formel-gruppe

**Permission-niveau pr. KPI:**

- Kun ejer
- Ejer + den klients teamleder
- Ejer + teamets leder
- Ejer + sælgerens teamleder + sælgeren selv
- Sælger selv

### §1.11 Tre-schema-arkitektur (fra trin 1)

Schema-grænse håndhævet af Postgres er stærkere end fil-niveau-disciplin.

**Schemas:**

- **core_identity** — "hvem og hvor": medarbejdere, identitets-master, org-træ, teams, klient-team, roller, permissions, klienter, lokationer, vehicle-registry
- **core_money** — "hvad sker der og hvad koster det": salg, salgs-linjer, pricing-regler, annulleringer, rejections, basket_corrections, salary-corrections, commission-snapshots, payroll-linjer, KPI-snapshots, periode-låsning, formel-versioner, vagter, fravær, bookings, hotel, mileage, leverandør-fakturering
- **core_compliance** — "vi holder styr på det hele": audit-log, klassifikations-registry, klient-felt-definitions, anonymisering-mappings + anonymization_state, heartbeats, AI-instruction-log, break_glass_requests + break_glass_operation_types, `legacy_snapshots` + `legacy_audit` (immutable migration-data fra 1.0)

**Apps får eget schema** `app_<navn>` og må kun skrive til core\_\* via SECURITY DEFINER RPC'er ejet af respektive core-schema. GRANT/REVOKE-grænse er fysisk fra trin 1.

`@stork/core` er ortogonal: schemas isolerer ejerskab, TypeScript-pakken isolerer logik.

### §1.12 Lokations-skabelon (fundament)

Lokationer er master-data på linje med klienter og medarbejdere. Bookinger, hotel-tildelinger, køretøjs-tildelinger og leverandør-fakturering hænger på lokationen.

**Lokations-entitet:**

- Pr. lokation: navn, adresse, default-dagspris, leverandør-FK, type (butik / messe / marked / event / andet), status (livscyklus), cooldown-konfiguration jsonb, anonymized_at
- Selv-refererende `parent_location_id` — top-niveau lokation kan have placements (stand-positioner) under sig. Samme tabel håndterer både lokation og placement
- Placement-niveau bærer egen pris hvis sat (ellers arves fra parent-lokation)
- Cycle-detection-trigger via rekursiv CTE

**Lokations-status som første-klasses livscyklus:**

- Konkrete enum-værdier afgøres ved bygning (åben beslutning, se Appendix B)
- Overgange via dedikeret RPC. Auditeres med årsag
- Bookings kan kun oprettes på aktiv lokation

**Klient-tilladelser pr. lokation:**

- Separat relations-tabel: klient × lokation × from_date × to_date. Versioneret
- Booking-RPC validerer at klient er tilladt på lokation på booking-dato

**Cooldown pr. lokation** (ikke pr. klient eller kampagne — afgørelse fra rettelse 17). Konfig-tabel, UI-redigerbar.

**Leverandører:**

- Egen master-data-entitet (separat fra lokation). Lokation har leverandør-FK
- Leverandør-type-felt kategoriserer (kæde / enkelt-butik / messe-operatør / andet) — styrer rabataftale-lookup

### §1.13 Juridisk ramme

Stork 2.0's egen juridiske ramme:

- **GDPR** — persondata-håndtering, samtykke-dokumentation, retten til sletning, `sensitive_data_access_log` for læs-spor af direct-PII
- **EU AI Act** — AI-instruktioner logges i `ai_instruction_log`. Ansvarlige roller (AI-ansvarlig) defineret i permission-systemet
- **Arbejdsmiljøloven** — AMO-dokumentation bevares med audit-trail. AMO-relaterede tabeller får dedikeret audit-trigger

**Compliance-entiteter i `core_compliance`:**

- `audit_log` (universel, §1.3)
- `data_field_definitions` (klassifikations-registry, §1.2)
- `sensitive_data_access_log` — pr. læsning af `pii_level='direct'`-felter (lag F eller når audit-belastning kræver)
- `ai_instruction_log` — pr. AI-handling der berører forretningsdata
- `consent_log` — pr. samtykke givet/trukket tilbage
- `gdpr_cleanup_log` — pr. retroaktiv sletnings-operation (forudsætter `gdpr_retroactive_remove`-RPC, post-lag-E)
- `amo_audit_log` — AMO-specifik audit-trail (når AMO-tabeller bygges)

**Afgrænsning — Stork har INGEN bogføringspligt:**

- Bogføringsloven gælder e-conomic, ikke Stork
- E-conomic-fakturaer (når integration tilføjes i 2.1+) har 5-års lovgivnings-trigger pålagt af e-conomic-systemet, ikke af Stork selv
- Stork's eget data (sales, payroll, etc.) har ikke lovbestemt min-retention. Retention styres af forretnings-behov og GDPR-formål

**Konsekvens for klassifikation:**

- Default retention-type: `time_based` (forretnings-styret)
- `legal` retention-type reserveret til lovgivnings-bundne entiteter (e-conomic-fakturaer i 2.1+, evt. AMO-dokumentation)

**Konsekvens for permissions:**

- `is_compliance_officer()` helper-funktion (stærkere end `is_admin()`) — krævet for retroaktiv sletning, AI-instruktions-ændringer, AMO-rettelser. Implementeres når relevant RPC bygges; design-spor klar fra fundamentet

### §1.14 Driftstabilitet

**Tier-strategi:**

- Stork 2.0 kører på Supabase **Pro-tier fra start**
- 130+ medarbejdere kræver headroom: ~240 direkte forbindelser, ~800 via pgbouncer
- PITR-mulighed tilgængelig som tilkøb på Pro-tier (aktiveres i lag F)
- Konfiguration sker i lag F; design-spor klar fra fundamentet

**Partitionering fra dag ét:**
Tre højvækst-tabeller oprettes som `PARTITIONED TABLES` fra første migration:

| Tabel             | Strategi | Partition-key                            |
| ----------------- | -------- | ---------------------------------------- |
| `audit_log`       | RANGE    | `occurred_at` (månedlige partitioner)    |
| `call_records`    | RANGE    | `call_timestamp` (månedlige partitioner) |
| `external_events` | RANGE    | `received_at` (månedlige partitioner)    |

**Mekanik:**

- `CREATE TABLE ... PARTITION BY RANGE` fra første migration
- Initial månedlig partition + default-partition (catch-all)
- pg_cron-job opretter næste måneds partition automatisk + buffer-partition 2 måneder frem
- Migration-skabelon "ny månedlig partition pr. tabel" er del af cron-skabelonen (§1.5)
- Indexes på partition-niveau (Postgres 17 håndterer automatisk fra parent)
- RLS-policies på parent-niveau arver til alle partitioner
- Audit-trigger attached på parent — fanger INSERT'er i partitioner

**Statement-timeout-disciplin:**

- Default RPC-timeout: 30 sekunder
- Ingest-RPC'er: 10 sekunder (skal være hurtige; lange batches flyttes til cron)
- Dashboard-refresh-RPC: kører i background, ikke synkron
- Periode-lock-RPC: 5 minutter (sikker margin; SLA er <10s pr. §1.6)

### §1.15 Break-glass-procedure

Irreversible eller stort-konsekvens-operationer kræver to-niveau approval. Generisk tabel-mønster for alle break-glass-operationer.

**Hvilke operationer kræver break-glass:**

- `pay_period_unlock` — genåbner låst lønperiode
- `gdpr_retroactive_remove` — modificerer audit-historik (post-fase-E)
- AI-instruktions-modifikation (compliance-spor ændres)
- AMO-audit-rettelse
- Master-data-merge der ændrer historisk attribution
- Anonymization-revert (hvor master-data var fejl-anonymiseret)

**Tabel-design** (`core_compliance.break_glass_requests`):

```
id uuid PK
operation_type text                    -- enum-værdi pr. operation
target_id uuid                         -- periode_id, entity_id, etc.
target_payload jsonb                   -- operation-specifik input
requested_by uuid (FK employees)
requested_at timestamptz
reason text NOT NULL
status enum (pending, approved, rejected, executed, expired)
approved_by uuid (nullable, FK employees)
approved_at timestamptz (nullable)
approval_notes text (nullable)
rejection_reason text (nullable)
executed_at timestamptz (nullable)
executed_by uuid (nullable, FK employees)
expires_at timestamptz                 -- default requested_at + 24h
CHECK (requested_by != approved_by)
CHECK (executed_by IS NULL OR status = 'executed')
```

Operation_type er data-tabel (`break_glass_operation_types`) UI-redigerbar — ny operation tilføjes uden migration. Tabel binder operation_type til RPC-navn der eksekveres ved approve.

**RPC-grænseflader:**

- `break_glass_request(operation_type, target_id, target_payload, reason)` — initierer; status=pending; auditeres
- `break_glass_approve(request_id, approval_notes)` — anden superadmin godkender; CHECK håndhæver != requested_by
- `break_glass_reject(request_id, rejection_reason)` — afviser
- `break_glass_execute(request_id)` — eksekverer godkendt operation; dispatcher pr. operation_type til intern RPC; samme RPC kan kaldes af enten requester eller approver
- Cron-job markerer pending-requests som expired efter 24t

**Audit-disciplin:**

- Hver state-overgang auditeres med change_reason
- Audit-trail bevarer hele kæden (request → approve → execute) via FK-reference
- Standard `audit_log`-trigger fanger alle mutationer på `break_glass_requests`

**Forretnings-konsekvens:**

- Superadmin-floor (§1.7) sikrer at min 2 admins altid eksisterer → break-glass-flow er altid muligt
- Two-actor-approval forhindrer single-point-of-failure ved menneskelige fejl
- 24t expires forhindrer pending-requests fra at hænge i evighed

---

## §2 Lag E — Forretnings-domæner

### §2.1 Sales (beregningsmotor)

**Salgs-stamme:**

Pr. salg én row. Snapshot-felter sat eksplicit i RPC ved INSERT (ikke trigger — triggers er anti-mønster for forretningslogik).

**Snapshot-felter:**

- Autoritativt tidsstempel (timestamptz, lagret UTC)
- Sælger-identitet (FK til identitets-master)
- Resolved medarbejder (FK; bevares ved anonymisering)
- Klient (FK)
- Klient-team på salgs-tidspunkt (kerne-snapshot — bærer team-attribution)
- Pricing-regel + regel-version
- Commission-beløb + revenue-beløb ved INSERT
- Lønperiode (resolved fra tidsstempel)
- Kilde (Adversus / Enreach / FM-manuel / TM-andet) + ekstern-id
- **client_crm_match_id text** — dedikeret kolonne (ikke felt i berigelse-jsonb). Kan sættes ved INSERT eller post-INSERT. Index'eret for reconciliation-queries. Hyppigt forespurgt; jsonb-walk er performance-tab
- Rå payload (jsonb, raw_payload-kategori)
- Berigelse-felter (jsonb; udfyldes post-INSERT)

**Salgs-linjer** i separat tabel: pr. produktlinje snapshot af produkt-identitet, kampagne-kontekst, pricing-regel, antal, unit-commission, display-navn.

**BEFORE UPDATE-trigger på sales:**

- Blokerer ændring af snapshot-felter (kerne-snapshot: tidsstempel, sælger-identitet, klient, klient-team-snapshot, pricing-regel-snapshot, commission-snapshot, revenue-snapshot, lønperiode-snapshot, kilde, ekstern-id, raw_payload)
- Undtager felter der efter design skal kunne mutere post-INSERT:
  - `enriched_fields` (berigelse via UI)
  - `client_crm_match_id` (kan sættes senere)
  - `status` (kun via dedikeret status-RPC der sætter session-var)
  - Eventuelle øvrige felter identificeret som design-relevante ved bygning
- Trigger-logikken dokumenteres eksplicit i migration-kommentar med begrundelse pr. undtagelse
- Implementations-mekanik (kolonne-hvidliste eller kolonne-sortliste) er Code's valg

**Display-navn på sale_items:**

- Klient-/kampagne-specifikt navn der kan adskille sig fra produktnavn
- Eksempel: samme produkt vises som "Eesy Mobil Premium" hos Eesy-klienten, "Mobile Plus" hos en anden klient
- Mekanisme: konfig-tabel mapper (produkt × klient × kampagne) til display-navn
- Ved sale_item INSERT slås display-navn op via klient + kampagne + produkt
- Hvis ingen klient-/kampagne-specifik mapping findes, bruges produktets standard-navn
- Display-navn er snapshot på sale_item ved INSERT — ændringer i konfig påvirker ikke eksisterende sale_items

**Produkter:**

- Pr. produkt: id, navn, status (aktiv / udfaset / merged), `merged_into_product_id` (FK, nullable), created_at, anonymized_at
- **Produkt-merge:** RPC `product_merge(source_id, destination_id, reason)`. Source får status=merged. Eksisterende sale_items med snapshot urørt. Helper `product_resolve_canonical(product_id)` følger merge-kæden
- **Produkt-grupper:** separat entitet, M2M relations-tabel. Ét produkt kan tilhøre flere grupper. Grupperinger oprettes i UI

**Pricing-regler:**

- Pr. regel: produkt-id, kampagne-kontekst jsonb, gyldighedsperiode, prioritet, match-prædikater jsonb, reference til formel-version
- Match-prædikater understøtter: exact-match, in-list, range, substring. Udvidelig via formel-engine
- UNIQUE på (produkt-id, kampagne-kontekst, prioritet, valid_from)
- Regel-historik immutable

**Salg uden pricing-match — `pricing_pending` kø-tabel** (core_money):

- `id uuid` PK, `sale_id uuid` FK, `reason text`
- `created_at timestamptz`, `resolved_at timestamptz` (nullable), `resolved_by uuid` (nullable)
- `resolution_type enum('rule_added', 'manual_pricing', 'product_mapped', 'manual_override', 'other')` (nullable indtil resolved)
- Partial index på `created_at WHERE resolved_at IS NULL` (hot subset af unresolved)

**Mekanik:**

- Sale med manglende pricing-match → trigger INSERTer row i `pricing_pending`
- UI-rapport viser unresolved kø-størrelse + ældste pending
- Når pricing løses (regel tilføjet, manuel pricing sat, etc.) → `resolved_at` sættes, `sales.commission_snapshot` og `revenue_snapshot` opdateres via genberegnings-RPC, audit-trail bevarer hele kæden
- Separat tabel valgt over boolean-flag fordi drifts-overblik ("hvor mange afventer resolve lige nu?") og prioritering på alder kræver det

**Berigelse:**

- Felter tilføjes via UI på salget post-INSERT. RPC opdaterer kun berigelse-felt-bag
- Hvert berigelse-felt klassificeret i registry. Pr. felt registreres om det er pricing-input
- Hvis pricing-input ændres: pricing kan re-køres (kun for salg i åbne perioder). Forskel logges som commission-justering

**Status-livscyklus (Dimension A):**

| Status       | Betydning                                                               | Provision tæller |
| ------------ | ----------------------------------------------------------------------- | ---------------- |
| `afventer`   | Endnu ikke afgjort. Registreret men endelig vurdering venter            | Ja               |
| `godkendt`   | CRM/klient har accepteret                                               | Ja               |
| `annulleret` | Salget eksisterede, kunden fortryder. Fra `afventer` eller `godkendt`   | Nej              |
| `afvist`     | CRM afviser som ugyldigt; salget eksisterede aldrig. Kun fra `afventer` | Nej              |

**Status-overgange:**

- `afventer → godkendt` — CRM/klient accepterer
- `afventer → annulleret` — kunde fortryder før godkendelse
- `afventer → afvist` — CRM afviser som ugyldigt
- `godkendt → annulleret` — kunde fortryder efter godkendelse

Alle overgange er engangs efter slut-status. Overgange sker via dedikeret RPC, ikke direkte UPDATE. Auditeres med årsag.

**Tre parallelle feedback-tabeller:**

**cancellations:**

- Salget eksisterede, blev annulleret
- Sales-status: godkendt eller afventer → annulleret
- Fradrag = hele commission
- Reason-enum: `kunde_annullering`, `match_rettelse` (operationel rettelse til matching-resultat). `kurv_rettelse` UDGÅR (flyttet til basket_corrections)
- Felter: source_sale_id, target_period_id (valgfri åben periode), effekt_dato, beløb, reason, source, match_id, created_by, immutable
- Target_period_id er bruger-valgt (rettelse 2). Effekt-dato er metadata, styrer ikke hvor fradrag lander

**rejections:**

- Salget eksisterede aldrig som gyldigt salg
- Sales-status: afventer → afvist
- Fradrag = hele commission (hvis salget i afventer indgik i låst periode)
- Felter: sale_id, reason, target_period_id (nullable), source, match_id, created_at, created_by, immutable
- Trigger ved INSERT: hvis target_period_id sat, opret salary-correction-row

**basket_corrections:**

- Salget eksisterer, men kurven var unøjagtig ved registrering ELLER kunden annullerer del af salget
- Sales-status: forbliver godkendt (ændres ikke; delen er stadig et gyldigt salg)
- Fradrag eller tillæg = commission_difference (positiv eller negativ)
- Felter: sale_id, products_before, products_after, commission_before, commission_after, commission_difference, target_period_id, source, match_id, created_at, created_by, immutable
- Trigger ved INSERT: pricing re-køres på products_after, salary-correction-row oprettes med beløb = commission_difference

**Anvendelse — partiel salgs-annullering:**

- Krav-spec: "Hele eller del af et salg skal kunne annulleres"
- Mekanisme: products_after-array fjerner de annullerede linjer (eller sætter antal=0 på dem)
- commission_difference = commission_after − commission_before (typisk negativ ved partiel annullering)
- Sales-status forbliver `godkendt` (delen er stadig gyldig)
- Hvis ALLE linjer annulleres → ikke partiel; brug cancellation i stedet (sales-status → annulleret)

Alle tre tabeller har FORCE RLS. Adgang via det generelle permission-system.

**SELECT-policy for løn-relaterede tabeller** (`cancellations`, `rejections`, `basket_corrections`, `commission_snapshots`, `salary_corrections`):

Samme scope-model som sales:

- `self` → egne rækker (via medarbejder-FK på source_sale eller direkte medarbejder-FK på row)
- `team` → eget team (via klient-team-snapshot på source_sale)
- `subtree` → subtree-helper fra §1.1
- `all` → admin

Policy bruger eksisterende scope-helpers fra §1.1 — ingen ad-hoc helpers pr. løn-tabel.

**Cancellation-reversal:**

- Reversal modelleres som ny cancellations-row med `reason='match_rettelse'` (eksisterende enum-værdi). En reversal ER ontologisk en rettelse til matching-resultatet
- Ingen ny enum-værdi nødvendig
- Felter: positivt beløb (modposterer original negativt), `reverses_cancellation_id` separat FK-felt der peger på original cancellation-row, target_period_id (valgfri åben periode, bruger vælger)
- Original cancellation immutable
- Audit-trail bevarer hele kæden via FK-reference

**Klient-CRM-match-flow:**

Klient-CRM-feedback har fire udfald, alle via match_id:

| Udfald                   | Status-overgang                                   | Tabel-handling     | Modpost                             |
| ------------------------ | ------------------------------------------------- | ------------------ | ----------------------------------- |
| Godkendt (kurv stemte)   | afventer → godkendt                               | Ingen ekstra row   | Ingen                               |
| Godkendt med rettet kurv | afventer → godkendt                               | basket_corrections | salary-correction                   |
| Afvist                   | afventer → afvist                                 | rejections         | salary-correction (hvis nødvendigt) |
| Annulleret               | afventer → annulleret eller godkendt → annulleret | cancellations      | salary-correction                   |

Status-overgang sker via dedikeret RPC `sale_apply_feedback(sale_id, match_id, outcome, ...)`. RPC validerer match_id mod `sales.client_crm_match_id`, orchestrerer relevant feedback-tabel-INSERT, sætter status, auditerer.

**Ingest-veje for klient-CRM-feedback:**

1. Excel-upload (udvides til alle fire feedback-typer)
2. Manuel UI-registrering (gyldig sideordnet vej)

Begge kalder samme RPC. Adgang styres af det generelle permission-system.

**Afstemnings-RPC:** `client_crm_reconciliation(client_id, period_start, period_end)` sammenligner Stork-salg vs. modtaget klient-CRM-feedback. Forskelle flagges.

**Genberegning:** RPC kører salg gennem pricing igen. Kun for salg i åbne perioder. Opdaterer commission + revenue snapshot, auditeres.

**Provision-aggregering:** Helper-RPC summerer commission for status der tæller, minus salary-corrections hvor target-periode = aktuel periode. Aggregat re-evalueres ved mutation i åben periode. Fryses ved lock.

### §2.2 Tidsregistrering

**Vagter:**

- Pr. vagt: medarbejder, dato, type (stab / teamledelse / sælger), planlagt start/slut, faktisk start/slut, status, noter, `source_booking_assignment_id` (nullable, FK aktiveres trin 25), `client_attribution_snapshot` jsonb
- Exclusion-constraint mod overlap pr. medarbejder
- Trigger validerer at vagt-dato er mellem hire og termination
- Vagt-typen styrer hvilke regler der valideres (sælger-vagt kræver 100% klient-fordeling)
- Sælger-typen dækker både TM og FM (ingen separat FM-vagt-type)

**Vagt-status enum (6 værdier):**

| Status       | Betydning                           | Total-arbejdstid  | Klient-fordeling                      | Løn                              |
| ------------ | ----------------------------------- | ----------------- | ------------------------------------- | -------------------------------- |
| `planlagt`   | Vagt oprettet, endnu ikke afsluttet | Potentiel         | Påkrævet ved afslutning (sælger-vagt) | Beregnes ved gennemførelse       |
| `gennemført` | Vagt overstået med arbejde          | Vagt minus pauser | 100% obligatorisk (sælger-vagt)       | Lønbare timer = total arbejdstid |
| `sygdom`     | Vagt erstattet af sygefravær        | 0 reelle timer    | Ingen                                 | Sygeløn-formel evaluerer         |
| `udblevet`   | Vagt der ikke blev mødt op til      | 0 timer           | Ingen                                 | Ingen løn                        |
| `fridag`     | Planlagt fri uden løn               | 0 timer           | Ingen                                 | Ingen løn                        |
| `ferie`      | Godkendt ferie                      | 0 reelle timer    | Ingen                                 | Ferie-løn-formel evaluerer       |

**Status-overgange i åben periode:**

- `planlagt ↔ gennemført` — UI-godkendelse, kan ændres tilbage
- `planlagt → sygdom/udblevet/fridag/ferie` — via respektive fraværs-tabel-triggers
- `gennemført → andet status` — leder-rettelse via UI med audit

**Status-overgange i låst periode:** Ingen mutationer tilladt. BEFORE UPDATE-trigger blokerer. Korrektion via `salary_corrections` (samme mekanik som annullering).

**Klient-tilhør-snapshot på alle vagter (også fraværs-vagter):**

Hver vagt bærer snapshot af medarbejderens klient-tilhør på vagtens dato. Kritisk for KPI'er og forecast.

Snapshot udledes via:

1. Medarbejder-team-tilknytning på datoen
2. Klient-team-ejerskab på datoen
3. Resultat: array af client_id'er medarbejderen tilhørte

**Implementeres som separat relations-tabel** (ikke jsonb-felt). KPI'er som "sygefravær-rate pr. klient" kræver effektive joins til klient-aggregater; jsonb-array forhindrer dem.

`shift_client_attribution` (core_money):

- `shift_id uuid` FK
- `client_id uuid` FK
- `attribution_weight numeric` (default 1.0; mulighed for fraktioner ved senere udvidelse)
- `computed_at timestamptz`
- PRIMARY KEY (shift_id, client_id)
- Index på (client_id, shift_id) for revers-lookup

**Mekanik:**

- Trigger ved vagt-INSERT beregner og inserter rows via `compute_employee_client_attribution(employee_id, date)`-helper
- Tabel frosset ved INSERT (BEFORE UPDATE-trigger blokerer mutation)
- Senere ændringer til medarbejder-team eller klient-team for vagtens dato påvirker ikke eksisterende snapshot

**Hvorfor på fraværs-vagter:** Uden snapshot kan KPI'er som "sygefravær-rate pr. klient" ikke beregnes konsistent når team-tilknytning ændres over tid.

**Vagt-skabeloner:**

- Skabelon definerer ugentligt mønster + default-type
- Tildeling kobler skabelon til medarbejder med gyldighedsperiode
- Cron-RPC instansierer skabelon-rækker som konkrete vagt-rows for kommende horizon

**Pauser:**

- Pauser som data i separat tabel med niveau (skabelon / medarbejder / klient / vagt-instans)
- Prioritets-rækkefølge: vagt-instans > klient > medarbejder > skabelon
- Pause-evaluering i `@stork/core`: total-arbejdstid = vagt-længde minus aktive pauser

**Stempelur:**

- Stempel-events immutable (BEFORE UPDATE/DELETE blokeret)
- Rettelser via separat correction-tabel der referer original event. Original urørt
- Stempel påvirker ikke løn-timer (vagten er autoritativ). Stempel bruges som dokumentation og som kilde til klient-fordeling
- Tidsstempel som timestamptz håndterer midnat-crossing automatisk

**Klient-fordeling (sælger-vagter):**

- Segmenter pr. vagt: vagt-FK, klient-FK, start, slut, kilde-enum (`api_event` / `clock_event` / `manual` / `default_extension`), prioritet, `source_call_record_ids uuid[]`
- `@stork/core/klient_fordeling.compute(vagt, calls, manuel)` regenererer segmenter ved hver mutation
- Midtpunkts-regel: mellem to call_records med forskellig client_id placeres segment-grænsen på midtpunkts-timestamp
- Udvidelse bagud (første event), udvidelse fremad (sidste event)
- UI bestemmer prioritering ved flere samtidige kilder via konfig-tabel (inkluderer `booking_assignment` fra trin 17)
- Validering: sum(segmenter) = total-arbejdstid for sælger-vagt (100%)
- GIN-index på `source_call_record_ids` for revers-query

**Fravær — fire separate koncepter:**

**A. vacation_requests** (ferie med workflow):

- Statusser: `anmodet / godkendt / afvist / trukket_tilbage`
- Felter: medarbejder, fra_dato, til_dato, `partial_day_hours numeric` (nullable), status, anmodet_at, behandlet_at, behandlet_af, begrundelse
- Workflow: anmod → leder godkender/afviser. Medarbejder kan trække tilbage før behandling
- Trigger ved godkendelse for **hel dag** (partial_day_hours IS NULL): genererer vagt-rækker med status=ferie
- Trigger ved godkendelse for **del af dag** (partial_day_hours sat): vagten beholder status `planlagt`/`gennemført`; lønbare timer justeres via input til ferie-løn-formel; klient-fordeling på vagten reduceres tilsvarende
- Frist-regel (5 uger default) som UI-validering + RPC-check

**B. sick_leaves** (sygdom uden workflow):

- Felter: medarbejder, fra_dato, til_dato, `partial_day_hours numeric` (nullable), registreret_at, registreret_af, noter, lægeerklæring_url (optional)
- Bagudrettet registrering, ingen approval
- Trigger ved INSERT for **hel dag** (partial_day_hours IS NULL): opdaterer vagt-rækker til status=sygdom
- Trigger ved INSERT for **del af dag** (partial_day_hours sat): vagten beholder status `planlagt`/`gennemført`; lønbare timer justeres via input til sygeløn-formel; klient-fordeling reduceres tilsvarende

**Del-af-dag-mekanik (gælder begge):**

- NULL i `partial_day_hours` = hel dag fravær
- Værdi sat = antal timer fravær den dag
- Klient-fordelings-validering: sum(segmenter) = total_arbejdstid − partial_absence_hours

**C. no_shows** (udeblivelse — leder registrerer):

- Felter: medarbejder, dato, shift_id (FK), registreret_at, registreret_af (CHECK: ikke medarbejderen selv), noter
- Trigger: opdaterer vagt-status til udblevet
- Kun leder kan oprette

**D. days_off** (planlagt fridag — ikke ferie):

- Felter: medarbejder, dato, type (omsorgsdag / afspadsering / arbejdsfri / andet — konfig-tabel), registreret_at, noter
- Trigger ved INSERT: opdaterer vagt til status=fridag (eller opretter vagt)

**Overtid:**

- Pr. anmodning: medarbejder, vagt, timer, årsag, status, approver, decided_at
- Separat anmodnings-flow (lignende vacation_requests)
- Godkendt overtid indgår i lønberegning

**Sygeløn:** Vagt-status='sygdom' tæller i medarbejder-aggregat. Sygeløn-formel (output_type=lønart) evaluerer med syge-dage som input. Sats fra konfig-tabel.

**Medarbejder-aggregater:**

- Pr. medarbejder pr. periode: total-vagter, vagter-pr-status (counts), FM-bookinger, FM-manuel-salg, anciennitet
- Fraværs-aggregater pr. status pr. klient-dimension (via klient-tilhør-snapshot)
- Cron refresher aktive perioder, fryses ved lock

**Helligdage:** Danske helligdage som data-tabel. Vagter må oprettes på helligdage.

### §2.3 Ingest

**Eksterne events:**

- Råpayload pr. modtaget event lagres immutable: kilde, ekstern-id, modtaget-tidspunkt, payload jsonb, behandlings-status
- UNIQUE(kilde, ekstern-id) — idempotens
- Tidszone: lagring UTC, render Europe/Copenhagen

**Ingest-scope for Stork 2.0:**

Fire veje (resten udskudt til 2.1+):

1. **Adversus (webhook + sync-job)** — TM-salg + opkald
2. **Enreach (polling)** — TM-salg + opkald
3. **Manuel UI-registrering** — FM-salg + andre ikke-dialer-salg
4. **Excel-upload** — klient-CRM-feedback (alle fire feedback-typer)

Drop fra fase 0: e-conomic, Twilio, Microsoft 365 (uden for auth-provider). Adapter-arkitekturen skal kunne udvides uden refactor når 2.1 tilføjer dem.

**Adversus sync-job (ekstra sikkerhedslag mod data-tab):**

- Periodisk sync henter manglende events fra Adversus API som backup til webhook
- Tre nat-kørsler som udgangspunkt (spredt for at undgå rate-limit-spidser)
- Idempotent via UNIQUE(kilde, ekstern-id) på external_events — samme event gennem webhook og sync registreres ikke dobbelt
- Konkret cron-skema, pagination-strategi og rate-limit-håndtering designes baseret på Adversus API-karakteristika ved trin 21-bygning

**Krav til sync-job:**

- Heartbeat pr. kørsel med `last_successful_sync timestamp`
- Failure-tolerant: partial_failure tilladt, næste kørsel laver catch-up
- Alert ved tre på hinanden følgende fejl
- Pagination ved store batches
- Rate-limit-aware med eksponentiel backoff

Webhook-buffer (edge-function lokal buffer ved DB-udfald) udskydes til 2.1+. Kombinationen sync-job + webhook + Excel-upload er tilstrækkelig dækning mod data-tab.

**Adapters:**

- Pr. kilde én edge-function-adapter
- Adapter er pure: rå payload → kanonisk DTO → synkron RPC-kald
- Rate-limit-aware retry fra første implementering: eksponentiel backoff, jitter, max retries
- Ingen forretningslogik i adapter

**Dispatch-logik:** Adversus og Enreach leverer både sales-events og call-events. Adapter splitter:

- Sales-event → `sale_record(...)` RPC
- Call-event → `call_record(...)` RPC
- Andre event-typer → ekstension-punkter

**Match-engine:**

- Eneste reelt klient-specifikke kode. Pr. (kilde × klient) en strategy-implementation
- Data-drevet via klient-felt-definitions' match-rolle og identitets-master'ens kilde-typer
- Returnerer success / requires_mapping / conflict. Pending+conflict lander i UI-kø; blokerer ikke ingest

**Call_records-tabellen:**

Én tabel uanset kilde. Både Adversus og Enreach leverer opkalds-events; data merges til kanonisk format ved ingest.

**Kanoniske felter:**

- id, employee_id (FK identitets-master), client_id, campaign_id, call_timestamp
- outcome (FK til `call_outcome_definitions.key`)
- ringe_tid_seconds, samtale_tid_seconds
- customer_phone text (PII direct, hashes i audit)
- additional_metrics jsonb (udvides ved API-implementation)
- kilde enum (adversus / enreach), external_id
- raw_payload jsonb
- match_status enum (success / requires_mapping / conflict)
- received_at, processed_at

UNIQUE(kilde, external_id) — idempotens.

**Outcome-enum som konfigurerbar data** (`call_outcome_definitions`):

- key, display_name, `counts_as_conversation`, `counts_as_reached_customer`, is_active, display_order
- Eksempler (Code's foreløbige): salg, nej_tak, ugyldig, ikke_truffet, linje_optaget, genringning, frafald_under_samtale
- UI bestemmer hvilke outcomes der tæller hvilket sted

**Retroaktiv vagt:** Salg uden eksisterende vagt for (sælger, dato) oprettes alligevel og flagges. Vagt kan oprettes retroaktivt via RPC. Klient-fordeling regenereres automatisk. Grænse: mål-periode skal være åben.

### §2.4 Dashboards og KPI'er

**Adgangs-model (union):**

Dashboard-tilgang er dimension udover rolle-page-scope:

- Team-matrix pr. dashboard pr. team: niveau-enum (ingen / tl / ledelse / alle)
- Person-tildeling pr. dashboard pr. medarbejder: direkte tildeling, versioneret

Adgang evalueres som union: bruger ser dashboard hvis team-tildeling giver adgang ELLER person-tildeling giver adgang.

**Niveau-enum styrer hvilke rows brugeren ser:**

- `tl` → kun egne team-rows
- `ledelse` → egne + subtree
- `alle` → alle rows

**Team-skift:** Bruger mister team-baseret adgang automatisk. Person-tildeling er urørt.

**Adgangs-funktion** `has_dashboard_access(dashboard, employee)`. Second-level row-filter `dashboard_row_filter(dashboard, employee, row)` baseret på niveau.

**Aggregater (fri date-range med dags-aggregat):**

- Pr. dashboard én aggregat-tabel med dimensioner pr. dashboard
- Granularitet: én row pr. dag pr. dimension
- Fri date-range bygges i UI ved at SUMere dags-rows
- Faste shortcuts er UI-presets — samme aggregat-tabel, anden range
- FORCE RLS. Policy bruger `has_dashboard_access` + `dashboard_row_filter`
- BTREE-indexes på (dato, dimension)

**Call-baserede aggregater:**

- Metrics: call_count, conversation_count, samtaletid_seconds_sum, ringe_tid_seconds_sum, reached_count, outcomes_jsonb (counts pr. outcome)
- Samme princip som salgs-aggregater

**Refresh:**

- Dags-rows for afsluttede dage låses (BEFORE UPDATE-trigger blokerer)
- Dagens row UPDATEes af cron med hyppigt interval (15 min)
- Ved lønperiode-lock: én final refresh, derefter immutable
- Cron-job pr. dashboard registreret i heartbeats-systemet

### §2.5 Formel-anvendelse

**Lønarter (output_type=lønart):**

- Timeløn (timer × sats)
- Månedsløn (pro-rata baseret på arbejdsdage, jf. standard arbejdstid)
- Sælger-løn (provision + tillæg − fradrag)
- Sygeløn-formel
- Ferie-løn-formel
- Oplæringsbonus
- Diæt
- Mileage-tillæg (km × sats)
- ASE-bonus
- Dagsbonus
- Leder-provision

Input fra medarbejder-aggregater + vagter + klient-segmenter + status-tællinger. Satser fra konfig-tabeller.

`salary.compute(medarbejder, periode, formel-set, inputs)` returnerer payroll-linjer. Immutable ved periode-lock.

**Standard arbejdstid pr. medarbejder:**

- Ingen dedikeret felt på medarbejder-tabellen
- Standard arbejdstid udledes fra planlagte vagter via `@stork/core/employee.compute_standard_hours(employee_id, period)`
- Bruges af månedsløn-formel (pro-rata-beregning ved del-periode-ansættelse) og af forecast-KPI'er
- Princip: vagten er én sandhed for arbejdstid, både faktisk og forventet. Ingen parallel datamodel

Feriepenge konfigurerbart pr. løntype.

**Lønart-permission-niveau (RLS på payroll_lines):**

- `self` → medarbejderen ser egne payroll-linjer
- `team` → leder med scope=team ser team-medlemmers payroll
- `subtree` → leder med scope=subtree ser subtree
- `all` → admin/løn-ansvarlig ser alle

Ikke pr. lønart-formel; pr. payroll-line. Samme scope-model som sales og løn-relaterede modposter.

**KPI'er (output_type=kpi):**

- Omsætning pr. klient
- Omsætning pr. sælger
- Team-DB (med aktiv-status-filter — teamleder-DB-beskyttelse som KPI-konfig, ikke hardkodet regel)
- CPO-udvikling
- Provision-pr-time
- Konverterings-rate (salg/opkald)
- Samtaletid pr. medarbejder pr. periode
- Sygefravær-rate pr. klient
- Udeblivelse-rate pr. team
- Ferie-belastning pr. klient (forecast)
- Fridag-frekvens

Input fra dashboard-aggregater + medarbejder-aggregater + formel-snapshots. Resultat i KPI-snapshot-tabel med dimensioner + value + formel-version.

**Klient-tid-betaling (CPO + provision pr. klient):**

- Beregnings-byggesten (ikke et output_type)
- Input fra klient-tid-segmenter × klient-specifikke CPO/provi-regler
- Regler kan variere pr. klient; kampagne under klient kan have egne regler
- Resultat indgår som payroll-linje (sælger-løn-komponent)

**Pricing:**

- Beregnings-byggesten (ikke et output_type)
- Input fra salgs-payload × pricing-regler
- Bruger samme `formula.evaluate`-engine

Alle beregninger deler én engine. Ingen drift mellem systemer.

### §2.6 Løn

- Vagten er autoritativ kilde for løn-timer. Stempelur dokumenterer
- Løntyper som data: timeløn, månedsløn, sælger-løn. Pr. medarbejder vælges løntype
- Sælger-løn-formel: provision + timeløn + diæt + oplæring + tillæg − annulleringer + feriepenge-tillæg
- Teamleder-løn: grundløn + leder-provision (KPI) + tillæg − fradrag
- Lønperioden låses ved udbetaling. Formel DB-lås, ikke kode-konvention
- Rettelser efter lock sker udelukkende via salary-corrections (modposter) i åbne perioder. Original-perioden urørt

**Lønunderskud forbliver underskud:**

- Ingen rollover
- Ingen afskrivning ved medarbejder-stop
- Beløbet står på medarbejderen som dokumenteret gæld
- Negativ teamleder-løn er gyldig konsekvens
- Eventuel inddrivelse eller afskrivning er manuel forretnings-handling

### §2.7 FM-domæne

FM hænger på samme stamme som resten. FM-salg er kanonisk salg — ingen særmodel. Samme sales-tabel, samme pricing, samme provision, samme status, samme attribution, samme annullering. Eneste forskel: ingest-vejen (manuel UI vs adapter) og kilde-feltet.

#### §2.7.1 Booking-stamme

**Booking-entitet:**

- Pr. booking: uge_start_date, lokation_id, klient_id, kampagne (FK eller jsonb-snapshot — afgøres ved bygning), status (livscyklus), oprettet_af, oprettet_at, anmærkninger
- Klient-tilladelse pr. lokation valideres
- Cooldown-trigger tjekker at samme lokation ikke overlapper med tidligere booking inden for konfigureret cooldown (pr. lokation)

**Dags-opløsning:**

- Hver dag i en booking er en planlægnings-enhed. Konkret modellering (én row pr. dag vs. dato-array) afgøres ved bygning
- Antal placements pr. dag kan variere
- Booking-livscyklus enum afgøres ved bygning (åben beslutning)

**Booking-attribution:**

- Salg fra booking attribueres via klientens team på salgs-tidspunktet — samme regel som al anden salgs-attribution
- Konsistent med "klient er dimensionen"

#### §2.7.2 Booking-assignment

**Assignment-entitet:**

- Pr. assignment: booking_day_id (eller booking_id + dato), medarbejder_id, start_tid, slut_tid, status, partner_assignment_id (selv-reference)
- Exclusion-constraint mod overlap pr. medarbejder × dato
- Status-enum afgøres ved bygning

**Vagt opstår fra assignment:**

- Ved assignment INSERT med status=bekræftet opretter trigger en vagt-row med type=sælger
- Vagt har start/slut fra assignment, employee fra assignment, dato fra booking_day
- Vagten har `source_booking_assignment_id` FK (aktiveret i trin 25)
- FM-sælger-vagt har samme regler som TM-sælger-vagt: 100% klient-fordeling, klient-tid-betaling

**Partner-mapping:**

- Ny sælger arbejder med erfaren mentor. Hver har egen assignment; partner-FK kobler dem
- Oplæringsbonus-formel kan bruge partner-flag som input

#### §2.7.3 Hotel-booking

**Hotel-registry:**

- Pr. hotel: navn, adresse, kontakt-info, default pris_pr_nat (informativ), status

**To-niveau hotel-model:**

`booking_hotel` (én row pr. hotel-booking):

- booking_id, hotel_id, status, notes, created_by

`booking_hotel_room` (én row pr. værelse):

- booking_hotel_id FK
- check_in_date, check_out_date (kan variere mellem værelser i samme booking)
- pris_pr_nat (kan variere mellem værelser)
- gæst-identifikation: employee_id (FK) eller guest_name_free_text
- notes

**Pris-beregning:**

- Total pr. værelse = pris_pr_nat × nætter
- Total pr. booking = SUM(værelser)
- `@stork/core/hotel.compute_cost(rooms_snapshot)` — pure funktion

**Snapshot:** Pris pr. værelse ved oprettelse er snapshot. Hotel-default-pris kan ændres senere uden at påvirke eksisterende værelser.

**Constraints:**

- Exclusion-constraint mod overlap pr. employee_id × dato
- CHECK check_out > check_in

#### §2.7.4 Køretøj og mileage

**Vehicle-registry** (master-data i core_identity):

- Pr. køretøj: kendetegn, type (bil / varevogn / andet), kapacitet, ejer (intern/lejet), status

**Vehicle-assignment:**

- Pr. tildeling: vehicle_id, dato, booking_id, hovedchauffør_employee_id
- Constraint: én bil pr. dato pr. booking (exclusion-constraint)

**Mileage:**

- Pr. assignment: start_km, end_km (RPC kalkulerer distance)
- Mileage-aggregat pr. medarbejder pr. periode
- Indgår som input til mileage-tillæg-formel (lønart)

**Køretøjs-aflevering:**

- Aflevering-entitet: vehicle_assignment_id, afleveret_af_employee_id, afleveret_at, kondition, notes, foto_urls text[]
- Foto-upload via Supabase Storage
- Aflevering-RPC kræver kondition + foto (eller eksplicit årsag)
- Notifikation 2.1+ (M365/Twilio). Placeholder-trigger eksisterer. Selve registreringen 2.0

#### §2.7.5 Diæt og oplæringsbonus som lønarter

Som formler i formel-systemet (§1.10):

- **Diæt-formel** (output_type=lønart): input-variabler inkluderer (klient_id, dato, er_rejsedag, antal_timer)
- **Oplæringsbonus-formel** (output_type=lønart): input-variabler inkluderer (partner_assignment_present, antal_oplæringer)

**Dimensioner:** Klient + dato. Sats pr. klient pr. dato kan variere (konfig-tabel).

**Rejsedag = 0 kr som håndhævet regel:**

- `er_rejsedag` flag udledes deterministisk fra assignment-data
- Formel-evaluering: IF er_rejsedag THEN 0 ELSE <sats-lookup>
- Reglen er i formel-AST'en, ikke i kode der kan glide
- Ændring til "rejsedag = halv sats" er formel-version-bump, ikke kode-ændring

#### §2.7.6 Leverandør-fakturering

**Rabataftaler pr. leverandør:**

- Leverandør-entitet bærer rabataftale jsonb: procent-trapper
- Trappe-struktur: array af `{threshold, dimension (placements / omsætning), discount_pct}`
- Trappe-evaluering i `@stork/core/supplier.compute_discount` — pure funktion

**Per-lokation undtagelser:**

- Relations-tabel: lokation × leverandør × max_discount × excluded × from_date × to_date
- `max_discount` kapper trappens beregnede rabat
- `excluded=true`: lokation tæller i trappens dimension men giver ingen rabat på sig selv

**Fakturarapport pr. leverandør pr. periode:**

- Rapport-entitet: leverandør_id, periode, generated_at, generated_by, status (udkast / godkendt / sendt), total_brutto, total_rabat, total_netto
- Rapport-linjer pr. lokation pr. periode
- **Snapshot-bevarelse:** ved generering fryses rapporten. Linje-beløb, rabat-procenter, undtagelser pr. periode lagres som-de-var. Senere ændringer rammer ikke historiske rapporter
- Godkendte rapporter immutable

#### §2.7.7 FM-checkliste

**Skabeloner:**

- Pr. skabelon: navn, type (daglig / ugentlig / one_time), items jsonb, gyldighedsperiode
- Items pr. skabelon: navn, beskrivelse, kræver_input, kategori

**Daglige instanser:**

- Pr. dag pr. ansvarlig: instans af skabelon med items-status (ikke_påbegyndt / gennemført / afvist / udskudt)
- Cron-job opretter dagens instanser kl. 06:00
- One-time-opgaver oprettes ad hoc

**Resumé-email:**

- Data-modellen klar i 2.0. Aggregat-RPC samler dagens status
- Selve email-afsendelsen via 2.1+ notifikations-vej. Indtil da tilgængelig som rapport i UI

#### §2.7.8 Markeder/messer

Ikke en særmodel. Type-felt på lokation: messe eller marked blandt mulige værdier. UI filtrerer på type. Booking-flow er identisk uanset lokations-type.

---

## §3 Disciplin

### CI-blockers

1. **RLS-coverage** pr. tabel (FORCE RLS + mindst én policy)
2. **Klassifikations-coverage** pr. kolonne (existence i registry)
3. **Audit-trigger** pr. mutable tabel (operationel/konfiguration/master_data)
4. **Immutability-trigger** pr. append-only tabel (audit, stempel-events, annulleringer, snapshots)
5. **TRUNCATE-blokering** pr. immutable tabel
6. **Index** pr. policy-prædikat-kolonne
7. **Snapshot-disciplin** (tabeller med snapshot-felter har BEFORE UPDATE-trigger)
8. **Cron-change-reason** ved cron-mutationer i migrations
9. **Set-config-discipline** (feature-table mutations kræver source_type + change_reason)
10. **SECURITY DEFINER** kun for trigger-funktioner eller med eksplicit markør og review-flag
11. **Workspace-grænser** (packages må ikke importere fra apps)
12. **No-ts-ignore** (kun ts-expect-error)
13. **Migration-naming** med schema-præfiks: `<14digits>_<schema>_<snake_case>.sql`
14. **Policy-test-suite** kører grønt pr. rolle pr. tabel
15. **No-hardcoded-Supabase-URLs** i app-kode
16. **Schema-ownership** (hver tabel i sit definerede schema)
17. **Cross-schema-FK-disciplin** (tilladt med eksplicit dokumentation i migration-kommentar)
18. **App-schema-write-disciplin** (ingen direkte INSERT/UPDATE/DELETE fra app-roles mod core\_\*)

### Test-skabelon pr. migration

- Audit-trigger fyrer
- RLS giver korrekt scope pr. rolle
- Index'er findes for policy-prædikater
- Cycle/overlap-constraints har happy-path og blokering-test
- Immutability blokerer hvor relevant

### Performance-disciplin (rettelse 19)

**Generelt princip:** Ingen rekursive CTE'er i RLS-policy-prædikater. Hierarki-evaluering sker via materialiseret closure-table (se §1.7).

**Benchmark-test som CI-blockers:**

- **Subtree-RLS:** queries mod tabeller med subtree-scope-policy benchmarkes mod syntetisk org-struktur (50 enheder × 5-niveau dybde, 500 medarbejdere, 1M sales). Fail hvis policy-evaluering >5ms pr. row eller hvis EXPLAIN viser rekursion.
- **Lock-pipeline SLA:** `pay_period_lock`-pipeline benchmarkes med syntetisk data (500 medarbejdere × 4 ugers data × 100k sales). Fail hvis pipeline >10 sekunder.
- **Dashboard-aggregat-refresh:** RPC benchmarkes for største dashboard. Fail hvis refresh >30 sekunder for dagens row.

**Syntetisk data-generator:** Pre-bygget mod realistisk skala-profil. Genereres deterministisk (samme seed → samme data) så benchmark-resultater er sammenlignelige over commits.

### Zone-disciplin

Pre-commit-hook kræver "ZONE: red"-prefix for ændringer i `core_*`-schemas, `@stork/core`, pricing-/permissions-/lønberegnings-filer.

---

## §4 Byggerækkefølge

**31 trin med schema-tildeling fra trin 1.**

| Trin | Indhold                                                                                                                                                                                                                                                                                                                                                                                                                                | Schema                                                                        |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1    | Adgangs-mekanik (RLS-helpers, FORCE-RLS-skabelon, REVOKE-disciplin, smoke-test-framework)                                                                                                                                                                                                                                                                                                                                              | core_compliance (skabeloner) + core_identity (auth-relaterede helpers)        |
| 2    | Audit-mønster (universel audit-tabel som PARTITIONED BY RANGE (occurred_at), månedlige partitioner + default-partition, trigger på parent, immutability, PII-filter, partition-create-cron)                                                                                                                                                                                                                                            | core_compliance                                                               |
| 3    | Drift-skabelon (heartbeats, record-RPC, healthcheck)                                                                                                                                                                                                                                                                                                                                                                                   | core_compliance                                                               |
| 4    | Klassifikations-registry + migration-gate Phase 1                                                                                                                                                                                                                                                                                                                                                                                      | core_compliance                                                               |
| 5    | Identitet del 1 (medarbejdere + auth + roller + permissions + is_admin) **+ migration: discovery-script for 1.0-medarbejdere + udtræks-SQL-skabelon + upload-script til core_identity.employees**                                                                                                                                                                                                                                      | core_identity                                                                 |
| 6    | Anonymisering (anonymization_state-tabel + RPC'er pr. core-schema + replay_anonymization + verify_anonymization_consistency + retention-cron-skeleton)                                                                                                                                                                                                                                                                                 | anonymization_state i core_compliance; RPC'er pr. core_identity og core_money |
| 7    | Periode-skabelon (lønperioder + lock-trigger + commission-snapshots + salary-corrections + cancellations-skabelon + **candidate-snapshot-tabeller** for forberedt-aggregat-mønster + **lock-pipeline benchmark-test** med SLA <10s)                                                                                                                                                                                                    | core_money                                                                    |
| 7b   | Pay-period-auto-lock-cron + **candidate-pre-compute-cron** (30 min før recommended_lock_date)                                                                                                                                                                                                                                                                                                                                          | Cron i core_compliance kalder RPC i core_money                                |
| 7c   | **break_glass_requests-tabel** + RPC-skabelon (`break_glass_request`/`approve`/`reject`/`execute`) + `break_glass_operation_types`-konfig-tabel + expires-cron                                                                                                                                                                                                                                                                         | core_compliance                                                               |
| 8    | Migration-gate Phase 2 strict aktivering                                                                                                                                                                                                                                                                                                                                                                                               | CI                                                                            |
| 9    | Identitet del 2 (org-træ + teams + klient-team + helpers + subtree-scope + **org_unit_closure-tabel + vedligeholdelses-trigger + acl_subtree-helper** + subtree-RLS benchmark-test) **+ migration: discovery-script for teams + udtræks-SQL for klient-team-historik + upload-script**                                                                                                                                                 | core_identity                                                                 |
| 10   | Klient-skabelon (klienter + felt-definitions + crm_match_id-rolle) **+ migration: discovery-script for klienter + klient-felt-mapping fra 1.0 til client_field_definitions + upload-script**                                                                                                                                                                                                                                           | core_identity                                                                 |
| 10b  | Lokations-skabelon (lokationer + placements + leverandører + klient-tilladelser + status + cooldown) **+ migration: udtræks-SQL for lokations-historik hvis relevant**                                                                                                                                                                                                                                                                 | core_identity                                                                 |
| 11   | UDGÅR (schema-grænser fra trin 1)                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                             |
| 12   | @stork/core skeleton (pure funktioner, snapshot-pattern, RPC-stubs pr. core-schema, **eksplicit dokumentation om at frontend-beregning er kosmetisk preview**)                                                                                                                                                                                                                                                                         | TypeScript-pakke                                                              |
| 13   | Formel-system (output_type enum, versionering, snapshot, formel-grupperinger)                                                                                                                                                                                                                                                                                                                                                          | core_money                                                                    |
| 14   | Salgs-stamme (sales med client_crm_match_id, sale_items, status-enum, sale_record-RPC, sale_apply_feedback-stub) — stub-versionen håndterer kun `afventer → godkendt` uden basket_correction. Display-navn-konfig-tabel inkluderet **+ migration: legacy_snapshots-tabel i core_compliance + udtræks-SQL for historiske sales + upload-script (bevarer 1.0's commission_snapshot direkte, source='legacy_adversus'/'legacy_enreach')** | core_money + legacy_snapshots i core_compliance                               |
| 15   | Pricing + identitets-master + sælger-attribution-resolver + produkter + product_merge + produkt-grupper                                                                                                                                                                                                                                                                                                                                | Pricing + produkter i core_money; identitets-master i core_identity           |
| 16   | Annulleringer + corrections + reversal (reversal som reason='match_rettelse' med reverses_cancellation_id FK)                                                                                                                                                                                                                                                                                                                          | core_money                                                                    |
| 16b  | rejections + basket_corrections + sale_apply_feedback **fuld dispatcher** (alle fire udfald: godkendt med/uden kurvrettelse, afvist, annulleret) + client_crm_reconciliation                                                                                                                                                                                                                                                           | core_money                                                                    |
| 17   | Vagter + skabeloner + pauser (med source_booking_assignment_id nullable, klient-fordelings-kilde-konfig inkl. booking_assignment)                                                                                                                                                                                                                                                                                                      | core_money                                                                    |
| 18   | Stempelur + corrections                                                                                                                                                                                                                                                                                                                                                                                                                | core_money                                                                    |
| 19   | UDSKUDT (klient-fordeling flyttet til 21b)                                                                                                                                                                                                                                                                                                                                                                                             | —                                                                             |
| 20a  | Fire fravær-tabeller (vacation_requests, sick_leaves, no_shows, days_off + day_off_types-konfig)                                                                                                                                                                                                                                                                                                                                       | core_money                                                                    |
| 20b  | Vagt-status enum udvidelse (6 værdier) + status-overgangs-RPC'er                                                                                                                                                                                                                                                                                                                                                                       | core_money                                                                    |
| 20c  | Klient-tilhør-snapshot på vagter                                                                                                                                                                                                                                                                                                                                                                                                       | core_money                                                                    |
| 20d  | Fraværs-triggers (vagt-status-update, respekt for periode-lås)                                                                                                                                                                                                                                                                                                                                                                         | core_money                                                                    |
| 20e  | Overtid (separat anmodnings-flow)                                                                                                                                                                                                                                                                                                                                                                                                      | core_money                                                                    |
| 20f  | Sygeløn-formel + ferie-løn-formel (output_type=lønart)                                                                                                                                                                                                                                                                                                                                                                                 | core_money (formel-instanser)                                                 |
| 21   | Ingest-tabeller (external_events PARTITIONED BY RANGE (received_at)) + adapters + match-engine + call_outcome_definitions + call_records (PARTITIONED BY RANGE (call_timestamp)) + call_record-RPC + Adversus sync-job (tre nat-kørsler) **+ migration: udtræks-SQL for historiske call_records + upload-script (idempotent via UNIQUE(source, external_id))**                                                                         | core_money                                                                    |
| 21b  | Klient-fordeling-segmenter + compute-RPC + GIN-index på source_call_record_ids                                                                                                                                                                                                                                                                                                                                                         | core_money                                                                    |
| 22   | Medarbejder-aggregater + fraværs-aggregater + payroll-linjer + KPI-snapshots                                                                                                                                                                                                                                                                                                                                                           | core_money                                                                    |
| 23   | Dashboards + adgangs-model + aggregat-tabeller (sales- og call-baserede) + refresh-cron                                                                                                                                                                                                                                                                                                                                                | Adgangs-tabeller i core_identity; aggregater i core_money                     |
| 24   | FM booking-stamme (dags-opløsning, cooldown-trigger, status-livscyklus)                                                                                                                                                                                                                                                                                                                                                                | core_money                                                                    |
| 25   | FM booking-assignments + partner-mapping + auto-vagt-generering. Aktiverer FK på vagt.source_booking_assignment_id                                                                                                                                                                                                                                                                                                                     | core_money                                                                    |
| 26   | FM hotel-booking (booking_hotel + booking_hotel_room med individuelle priser)                                                                                                                                                                                                                                                                                                                                                          | core_money                                                                    |
| 27   | FM køretøj og mileage (registry i core_identity; resten i core_money)                                                                                                                                                                                                                                                                                                                                                                  | core_identity + core_money                                                    |
| 28   | FM diæt og oplæringsbonus som lønarter (formel-instanser med rejsedag-regel)                                                                                                                                                                                                                                                                                                                                                           | core_money (formel-instanser)                                                 |
| 29   | FM leverandør-fakturering (rabataftaler + undtagelser + snapshot-rapporter)                                                                                                                                                                                                                                                                                                                                                            | core_money                                                                    |
| 30   | FM checkliste-system (skabeloner + instanser + resumé-aggregat)                                                                                                                                                                                                                                                                                                                                                                        | core_money                                                                    |
| 31   | **Cutover-leverancer: legacy_audit-tabel + audit-import-script + cutover-checklist + adapter-re-pointing-procedure**. Eksekveres når Mathias er overbevist efter manuel sammenligning af 2.0's data mod 1.0                                                                                                                                                                                                                            | core_compliance                                                               |

---

## §5 Det vi står inde for

Hvis planen følges:

- **Stamme = database.** Adgang, klassifikation, audit, periode-lås, anonymisering, snapshot-mønster lever alle i DB. Forretningslogik lever i `@stork/core`. Klar adskillelse, ingen drift mellem systemer.

- **Én sandhed pr. fakta.** Salgs-rækken er stammen for et salg. Cancellations + corrections + rejections + basket_corrections er modposter, ikke mutationer. Klient-team-historik er versioneret. Formel-versioner fryses pr. lønperiode. Identitets-master adskilt fra medarbejder med eksplicit "ikke resolvable"-fallback.

- **Fail-closed.** FORCE RLS overalt, default deny. Smoke-tests pr. rolle pr. tabel. Migration-gate blokerer ny ukendt kolonne. SECURITY DEFINER er undtagelse, ikke regel.

- **Beregning over databasen.** TypeScript-pakke (ren funktion) bærer pricing, salary, formler, klient-fordeling, hotel-cost, supplier-discount. Snapshot-mønstret holder funktionerne pure. PL/pgSQL bruges kun til triggers.

- **Tre-lags formel-model.** Rådata → Beregning → Output. Ét output_type-felt. Pricing er ikke et "system" der konkurrerer med lønberegning; det er en byggesten.

- **Klient-CRM-match er central.** Stork-salg trackbare gennem hele livscyklen via match_id. Afstemning bygget ind. Tre feedback-typer (cancellations, rejections, basket_corrections) har separate veje gennem systemet med fælles match-mekanisme.

- **Modellen holder ved vækst.** Pre-aggregerede dashboard-tabeller bærer RLS-byrden — ikke 1M+ sales-rows. Edge-functions skalerer horisontalt. Audit kan partitioneres når størrelse kræver det. Hierarki-graduering tilføjes som data i org-træet.

- **Anonymisering bryder ikke audit-trail.** UPDATE-mønstret bevarer FK'er. Audit-værdier hashes ved skrivning, så audit-tabellen kan gennemgås uden at lække PII.

- **Driftsovervågning bygget ind.** Hver cron-job har heartbeat-row. Hver mutation auditeres. Skygge-funktionalitet umulig.

- **Klient-konfiguration er data, ikke kode.** Felt-definitions pr. klient + UI redigerer. Match-engine er eneste klient-specifikke kode-del.

- **UI styrer alt drift.** Klassifikation, retention, pricing-værdier, kampagne-mappings, satser, perioder, roller, rettigheder, dashboards-konfig, KPI-aktivering — alt er data der ejes af UI.

- **FM hænger på samme stamme.** Klient er stadig dimensionen. Salg attribueres via klient-team-snapshot uanset om kilden er Adversus, Enreach, Excel-upload eller FM-manuel. Permissions kommer fra én tabel.

- **Booking-træet er rent.** Lokation → booking → booking-dag → assignment → vagt → klient-fordeling → salg. Hvert led har klart formål og én sandhed.

- **Vagter låses med deres lønperiode.** Én sandhed for "kan dette ændres" — periode-status. To låse-veje, ét RPC. Auto-lock er konfigurerbart, ikke hardcoded.

- **Schema-grænser fra trin 1.** Modellen er rigtig fra første migration. Ingen retroaktiv refactor. GRANT/REVOKE-disciplinen er fysisk fra dag ét.

- **Microsoft Entra ID er låst.** Eneste auth-provider for medarbejdere. Ingen backdoor. Onboarding-rækkefølge: Microsoft først, derefter Stork-employee.

---

## Appendix A: Lukkede beslutninger

**Lukkede beslutninger kan laves om hvis behovet opstår.** Listen er ikke immutable — den er nuværende afgørelser. Re-åbning kræver ny diskussion og dokumentation.

### Fundament

| Område                | Afgørelse                                                             |
| --------------------- | --------------------------------------------------------------------- |
| Database-princip      | Stamme = database. Beregning = over databasen                         |
| Tre principper        | Én sandhed, styr på data, sammenkobling eksplicit                     |
| Stack                 | React + TypeScript + Supabase                                         |
| Auth                  | Microsoft Entra ID som eneste login for medarbejdere. Ingen backdoor  |
| Schema-arkitektur     | core_identity / core_money / core_compliance fra trin 1               |
| Forretningslogik      | TypeScript-pakke @stork/core. Ikke PL/pgSQL                           |
| Apps                  | Eget schema app*<navn>. Kun via SECURITY DEFINER RPC'er til core*\*   |
| Juridisk ramme        | GDPR + EU AI Act + Arbejdsmiljøloven. Stork har INGEN bogføringspligt |
| FORCE RLS undtagelser | audit_log + cron_heartbeats. Læsning via RPC                          |

### Adgang

| Område                      | Afgørelse                                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| RLS                         | FORCE RLS overalt, default deny                                                                                                             |
| Permission-model            | 4-dimensionel (page+tab × view+edit × scope × rolle)                                                                                        |
| Roller                      | Én rolle pr. medarbejder. Ingen M2M                                                                                                         |
| Superadmin                  | Min N (default 2), defineret via permissions. Floor-trigger blokerer mutationer der reducerer admin-antal under N                           |
| Stab/FM-leder               | Roller i samme permission-tabel. Ingen FM-isoleret rolle-mekanisme                                                                          |
| Dashboard-adgang            | Team-matrix + person-tildeling som union                                                                                                    |
| Løn-tabel SELECT-policy     | Samme scope-model som sales (self/team/subtree/all) for cancellations/rejections/basket_corrections/commission_snapshots/salary_corrections |
| Payroll_lines SELECT-policy | Pr. payroll-line med samme scope-model. Ikke pr. lønart-formel                                                                              |

### Datamodel

| Område                     | Afgørelse                                                                                           |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| Sales-status               | afventer / godkendt / annulleret / afvist (4 statusser, alle på sales-rækken)                       |
| Snapshot via               | RPC (eksplicit), ikke trigger                                                                       |
| Anonymisering              | UPDATE, aldrig DELETE                                                                               |
| Korrektion på frosne data  | Modposter (cancellations / rejections / basket_corrections / salary_corrections)                    |
| Sales bevarer              | Snapshot af klient-team på salgs-tidspunktet                                                        |
| Sales BEFORE UPDATE        | Blokerer snapshot-felter; undtager enriched_fields, client_crm_match_id, status (via dedikeret RPC) |
| Klient-CRM-match           | Central mekanisme via match_id. Fire feedback-typer                                                 |
| Kurvrettelse               | Separat tabel (basket_corrections), ikke reason-værdi i cancellations                               |
| Partiel salgs-annullering  | Via basket_corrections (products_after fjerner linjer). Hele = cancellation                         |
| Afvisning                  | Separat tabel (rejections), kun fra afventer                                                        |
| Reversal i låst periode    | Valgfri åben periode                                                                                |
| Cancellation-reversal      | reason='match_rettelse' + reverses_cancellation_id FK. Ingen ny enum-værdi                          |
| Display-navn på sale_items | Klient-/kampagne-specifikt navn snapshot'et fra konfig-tabel ved INSERT                             |

### Pricing + provision

| Område             | Afgørelse                                       |
| ------------------ | ----------------------------------------------- |
| Pricing-motor      | Én funktion. TM og FM samme                     |
| Pricing-regler     | Flere formler pr. produkt mulige                |
| Salg uden match    | Flagges, blokerer ikke ingest                   |
| Provision =        | Sum(pending + godkendt) − Cancellations         |
| Sælger-attribution | Én resolver. Eksplicit fejl ved manglende match |
| Berigelse          | Via UI kan påvirke pricing                      |
| Genberegning       | Kun for åbne lønperioder                        |
| Produkter          | Kan merges (bevarer historisk integritet)       |
| Produkt-grupper    | M2M relations. Oprettes i UI                    |

### Tidsregistrering

| Område                 | Afgørelse                                                              |
| ---------------------- | ---------------------------------------------------------------------- |
| Vagt-typer             | Stab / teamledelse / sælger (sælger dækker TM+FM)                      |
| Arbejdstid             | Vagten bestemmer, ikke stempelur                                       |
| Klient-fordeling       | 100% obligatorisk for sælger-vagt                                      |
| Stempelur påvirker     | Ikke løn. Bruges som dokumentation + klient-fordelings-kilde           |
| Manglende vagt         | = Ingen arbejdstid. Ingen fallback                                     |
| Vagtbytte              | Ikke understøttet                                                      |
| Vagt-status            | 6 værdier (planlagt / gennemført / sygdom / udblevet / fridag / ferie) |
| Vagt-låsning           | Følger periode-låsning                                                 |
| Klient-tilhør-snapshot | På alle vagter (også fraværs-vagter)                                   |

### Fravær

| Område              | Afgørelse                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| Fravær              | Fire separate koncepter: vacation_requests, sick_leaves, no_shows, days_off                                  |
| Ferie               | Approval-workflow (anmodet / godkendt / afvist / trukket_tilbage)                                            |
| Sygdom              | Bagudrettet registrering uden workflow                                                                       |
| Udblevet            | Kun leder kan registrere                                                                                     |
| Fridag              | Type fra konfig-tabel (omsorgsdag / afspadsering / etc.)                                                     |
| Del-af-dag fravær   | partial_day_hours på sick_leaves + vacation_requests. Vagt-status uændret; lønbare timer justeres via formel |
| Standard arbejdstid | Udledes fra vagter via employee.compute_standard_hours. Ingen dedikeret felt på medarbejder                  |
| FM-fravær           | Ingen særmodel. Samme som TM                                                                                 |

### Periode + løn

| Område                  | Afgørelse                                              |
| ----------------------- | ------------------------------------------------------ |
| Lønperiode-status       | open / locked (2 stadier)                              |
| Periode-låsning         | Manuel UI ELLER auto-cron månedens sidste dag          |
| Tal låses, data må ikke | Princip. Tal kan ikke ændres efter lock                |
| Lønunderskud            | Forbliver underskud. Ingen rollover. Ingen afskrivning |
| Negativ teamleder-løn   | Gyldig konsekvens                                      |
| Udbetaling              | Eksternt. Stork låser tallene                          |

### Team + klient

| Område                   | Afgørelse                                                  |
| ------------------------ | ---------------------------------------------------------- |
| Team pr. medarbejder     | Max 1 ad gangen. Skift med overgangsdato                   |
| Klient pr. team          | Max 1 ad gangen. Skift med overgangsdato                   |
| Brand                    | Findes ikke i 2.0                                          |
| Team-attribution af salg | Via klient, IKKE via sælgers team                          |
| Klient-specifikke felter | jsonb felt-bag i clients-tabellen                          |
| Match-engine             | Klient-specifik (strategy pattern). Alt andet fælles motor |

### Ingest

| Område        | Afgørelse                                                     |
| ------------- | ------------------------------------------------------------- |
| Scope 2.0     | Adversus webhook + Enreach polling + Manuel UI + Excel-upload |
| Drop til 2.1+ | e-conomic, Twilio, M365 (uden for auth)                       |
| Salg          | ASAP (1. prioritet). Berigelse 2. prioritet                   |
| Drøm          | Salg <3 min, data <15 min                                     |
| Opkalds-data  | call_records-tabel. Alle outcomes registreres                 |

### Formel-system

| Område              | Afgørelse                                  |
| ------------------- | ------------------------------------------ |
| Tre lag             | Rådata → Beregning → Output                |
| Output-typer        | KPI og lønart (kun to)                     |
| Pricing             | Beregning, ikke output_type                |
| Klient-tid-betaling | Beregning, ikke output_type                |
| Formel-grupperinger | UI-redigerbar M2M (FM KPI, Eesy KPI, etc.) |
| Versionering        | Fryses ved periode-låsning                 |

### FM-domæne

| Område                | Afgørelse                               |
| --------------------- | --------------------------------------- |
| FM i Stork 2.0        | Alt med (ingen udskydelser)             |
| FM-salg               | Kanonisk salg. Samme stamme som TM      |
| FM-vagt-type          | Sælger (samme som TM)                   |
| FM-vagt opstår fra    | Booking-assignment (auto-genereret)     |
| Hotel-værelser        | Individuelle priser pr. værelse         |
| Diæt + oplæringsbonus | Lønarter i formel-systemet              |
| Rejsedag = 0 kr       | I formel-AST, ikke prosa                |
| Cooldown              | Pr. lokation (ikke pr. klient/kampagne) |
| Markeder/messer       | Type-felt på lokation, ikke særmodel    |

### Drift

| Område                 | Afgørelse                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Cron                   | pg_cron + edge-functions split                                                                                      |
| Heartbeats             | Pr. cron-job                                                                                                        |
| Auto-lock              | Månedens sidste dag, kalender-sidste                                                                                |
| Outbound integrationer | 2.1+                                                                                                                |
| Supabase-tier          | Pro fra start. ~240 direkte forbindelser, ~800 via pgbouncer + PITR-mulighed                                        |
| Partitionering         | audit_log, call_records, external_events som PARTITIONED BY RANGE, månedlige + default-partition + auto-create-cron |
| Statement-timeout      | Default 30s. Ingest 10s. Periode-lock 5 min                                                                         |
| Adversus ingest        | Webhook + sync-job (tre nat-kørsler). Webhook-buffer udskudt til 2.1+                                               |
| Eksternt monitoring    | Integration-punkter forberedes i lag E (Prometheus-kompatibelt format). System tilkobles 2.1+                       |

### GDPR + retention

| Område                    | Afgørelse                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| PII                       | Slettes når formålet er opfyldt. Tal og struktur bevares                                   |
| Klient-specifik retention | Pr. felt (Eesy 4 mdr, TDC 12 mdr, etc.)                                                    |
| Klassifikations-ændring   | Fremad-kun                                                                                 |
| Retroaktiv sletning       | Separat mekanisme med audit                                                                |
| Anonymiserings-strategier | blank / hash / delete_key (samme overalt)                                                  |
| Backup-paradox            | anonymization_state-tabel som autoritativ kilde + replay_anonymization() RPC efter restore |

### Performance og struktur (lukket ved rettelse 18)

| Område                 | Afgørelse                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Klient-tilhør-snapshot | Separat relations-tabel `shift_client_attribution` (ikke jsonb-felt). PK (shift_id, client_id) + attribution_weight |
| Pricing-fail           | Separat kø-tabel `pricing_pending` (ikke boolean). Drifts-overblik kræver det                                       |
| client_crm_match_id    | Dedikeret kolonne på sales (ikke jsonb-felt). Index'eret for reconciliation                                         |

### Performance og resilience (lukket ved rettelse 19)

| Område                 | Afgørelse                                                                                                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Subtree-RLS            | Materialiseret `org_unit_closure`-tabel + trigger. Helper `acl_subtree(employee_id)` via indexed lookup. Ingen rekursive CTE'er i policy-prædikater (generelt princip)                                     |
| @stork/core deployment | Frontend-beregning er kosmetisk preview. RPC altid autoritativ. Ingen versions-tjek mellem frontend og RPC nødvendig                                                                                       |
| Lock-pipeline          | Forberedt-aggregat-mønster (to-fase): candidate beregnes asynkront før lock; promovering ved lock er atomar UPDATE. SLA <10s                                                                               |
| Break-glass            | Generisk `break_glass_requests`-tabel med two-actor approval. Dækker pay_period_unlock, gdpr_retroactive_remove, AI-instruktions-modifikation, AMO-audit-rettelse, master-data-merge, anonymization-revert |

### Migration fra 1.0 (lukket ved rettelse 20)

| Område                | Afgørelse                                                                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Migration-mekanik     | Direkte udtræk + upload. Ingen ETL, ingen adapter-dobbelt-skriv, ingen sync-job, ingen UI-flow, ingen migration_staging-schema, ingen migration_orchestrator      |
| Cutover-model         | Model B (modificeret): 1.0 autoritativ indtil cutover; 2.0 bygges parallelt; manuel skygge-sammenligning af Mathias; cutover når overbevist. Ikke deadline-drevet |
| Rådata-omfang         | Styres ved import pr. kategori. Ingen hardkodet horisont. Standard-anbefaling: 12 måneder                                                                         |
| Tallene bevares       | 1.0's commission-værdier importeres direkte. INGEN re-evaluering gennem 2.0's pricing-engine for historiske salg                                                  |
| Master-data           | Discovery-fase før udtræk (scripts mod 1.0, rapport, Mathias retter eller markerer)                                                                               |
| Legacy-data placering | `legacy_snapshots` (data) + `legacy_audit` (1.0's audit-historik) i core_compliance, separat fra 2.0's universelle audit_log                                      |
| Migration-trin        | Integreret i eksisterende byggetrin (trin 5, 9, 10, 10b, 14, 21, 31). Ikke separate trin                                                                          |
| Cutover-tidspunkt     | Kan ske gradvist når relevante trin er bygget. Ingen krav om at "alle 31 trin er færdige"                                                                         |
| Audit-spor            | `source_type='migration'` + `change_reason='legacy_import_t0'`                                                                                                    |
| Source-felt på sales  | `legacy_adversus` / `legacy_enreach` for historiske importerede sales                                                                                             |

---

## Appendix B: Åbne beslutninger

**Åbne beslutninger afgøres ved bygning eller når behovet opstår.** Ikke nødvendigvis krav om afgørelse før bygning starter — afgøres når relevant trin nås.

### Strukturelle (afgøres ved bygning)

| Område                      | Spørgsmål                                  |
| --------------------------- | ------------------------------------------ |
| Kampagne i booking (§2.7.1) | FK eller jsonb-snapshot                    |
| Booking dags-opløsning      | én row pr. dag eller dato-array på booking |
| Day_off types               | konkrete type-værdier i konfig-tabel       |

### Enum-værdier (afgøres ved bygning)

| Område               | Status                                 |
| -------------------- | -------------------------------------- |
| Lokations-status     | Afgøres ved trin 10b                   |
| Booking-livscyklus   | Afgøres ved trin 24                    |
| Assignment-status    | Afgøres ved trin 25                    |
| Hotel-booking-status | Afgøres ved trin 26                    |
| Vehicle-status       | Afgøres ved trin 27                    |
| Aflevering-kondition | Afgøres ved trin 27                    |
| Call outcomes        | Afgøres når API-implementation er klar |

### Konkrete værdier (afgøres når API/lovgivning er klar)

| Område                          | Status                                             |
| ------------------------------- | -------------------------------------------------- |
| Konkrete pricing-DSL syntaks    | Afgøres ved trin 13                                |
| Felt-navn for berigelse-jsonb   | Afgøres ved trin 14                                |
| Produkt-identitet               | Interne ID'er + mapping fra eksterne kilder        |
| Retroaktiv salgs-grænse         | Hvor langt tilbage                                 |
| Subsidy-håndtering              | Manglende subsidy-data fra dialer                  |
| additional_metrics jsonb-felter | Afgøres når Adversus/Enreach API er fuldt afdækket |

### Lag F (afventer senere)

| Område                                     | Status              |
| ------------------------------------------ | ------------------- |
| Apps-listen                                | Workshop med Kasper |
| Email-provider for cron-notifikationer     | 2.1+                |
| Page-permission evaluering i frontend      | Lag F               |
| Microsoft Entra ID konfigurations-detaljer | Lag F               |
| Custom domæner                             | Lag F               |

### Drift (afgøres ved bygning)

| Område                                               | Status              |
| ---------------------------------------------------- | ------------------- |
| Time-attribution til klient (vej 1-4)                | 2.1+                |
| Multi-superadmin-godkendelse for kritiske handlinger | Afgøres ved trin 5  |
| Real-time vs polling cross-session pattern           | Afgøres ved trin 21 |

---

## Appendix C: Rettelses-historik

Rettelser anvendt på master-planen i kronologisk rækkefølge:

| Nr  | Indhold                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Sales status-enum: afventer / godkendt / annulleret / afvist (4 værdier). Drop pricing_failed                                                                                                                                                                                                                                                                                                                              |
| 2   | Annullering-fradrag: VALGFRI åben lønperiode (bruger vælger, ikke effekt-dato)                                                                                                                                                                                                                                                                                                                                             |
| 3   | Lønunderskud forbliver underskud. Ingen rollover, ingen afskrivning                                                                                                                                                                                                                                                                                                                                                        |
| 4   | Ingest scope: Adversus + Enreach + Excel + manuel UI. Drop e-conomic/Twilio/M365 til 2.1+                                                                                                                                                                                                                                                                                                                                  |
| 5   | FM og TM deler salgs-logik fuldt ud. FM-salg er kanonisk salg                                                                                                                                                                                                                                                                                                                                                              |
| 6   | Gateway-lag ikke obligatorisk. RLS + schemas giver sikkerheden                                                                                                                                                                                                                                                                                                                                                             |
| 7   | Annulleret vs afvist ontologisk forskellige. Separate veje                                                                                                                                                                                                                                                                                                                                                                 |
| 8   | Status-enum semantik klargjort                                                                                                                                                                                                                                                                                                                                                                                             |
| 9   | FM-domænet fuldt indlejret (§1.12 lokations-skabelon + §2.7 FM-domæne)                                                                                                                                                                                                                                                                                                                                                     |
| 10  | Klient-CRM-match som central mekanisme. Tre parallelle tabeller (cancellations, rejections, basket_corrections)                                                                                                                                                                                                                                                                                                            |
| 11  | Produkt-merge og produkt-gruppering tilføjet                                                                                                                                                                                                                                                                                                                                                                               |
| 12  | Formel-system korrigeret til tre-lags model (rådata → beregning → output)                                                                                                                                                                                                                                                                                                                                                  |
| 13  | Hotel med individuelle værelses-priser (booking_hotel + booking_hotel_room)                                                                                                                                                                                                                                                                                                                                                |
| 14  | Opkalds-data som rådata. call_records-tabel. Klient-fordeling baseret på call_records                                                                                                                                                                                                                                                                                                                                      |
| 15  | Fravær som fire separate koncepter (vacation_requests, sick_leaves, no_shows, days_off)                                                                                                                                                                                                                                                                                                                                    |
| 16  | Vagt-låsning følger periode-låsning. Auto-lock-cron månedens sidste dag                                                                                                                                                                                                                                                                                                                                                    |
| 17  | Schema-grænser fra trin 1. Vagt-tabel inkluderer FM-koblingen fra trin 17                                                                                                                                                                                                                                                                                                                                                  |
| 18  | Partiel salgs-annullering via basket_corrections (products_after fjerner linjer)                                                                                                                                                                                                                                                                                                                                           |
| 19  | Del-af-dag fravær via partial_day_hours på sick_leaves + vacation_requests                                                                                                                                                                                                                                                                                                                                                 |
| 20  | Standard arbejdstid udledt fra vagter via employee.compute_standard_hours. Ingen dedikeret felt                                                                                                                                                                                                                                                                                                                            |
| 21  | Cancellation-reversal modelleres som reason='match_rettelse' + reverses_cancellation_id FK. Ingen ny enum-værdi                                                                                                                                                                                                                                                                                                            |
| 22  | FORCE RLS-undtagelser dokumenteret eksplicit (audit_log + cron_heartbeats)                                                                                                                                                                                                                                                                                                                                                 |
| 23  | Sales BEFORE UPDATE undtagelses-liste eksplicit (enriched_fields, client_crm_match_id, status via dedikeret RPC)                                                                                                                                                                                                                                                                                                           |
| 24  | sale_apply_feedback etableringspunkt: stub i trin 14, fuld dispatcher i trin 16b                                                                                                                                                                                                                                                                                                                                           |
| 25  | SELECT-policy for løn-relaterede tabeller: samme scope-model som sales                                                                                                                                                                                                                                                                                                                                                     |
| 26  | Lønart-permission-niveau pr. payroll-line med samme scope-model som sales                                                                                                                                                                                                                                                                                                                                                  |
| 27  | Superadmin-floor: BEFORE UPDATE/DELETE-trigger sikrer min N admin-medarbejdere                                                                                                                                                                                                                                                                                                                                             |
| 28  | Juridisk ramme (§1.13): GDPR + EU AI Act + Arbejdsmiljøloven. Ingen bogføringspligt. Compliance-entiteter listed                                                                                                                                                                                                                                                                                                           |
| 29  | Display-navn på sale_items uddybet: konfig-tabel pr. (produkt × klient × kampagne) + snapshot ved INSERT                                                                                                                                                                                                                                                                                                                   |
| 18  | Driftstabilitets-afgørelser samlet: Pro-tier fra start, partitionering fra dag ét (audit_log + call_records + external_events), anonymization_state-tabel for backup-paradox, Adversus sync-job, eksternt monitoring-integration-punkter. Plus lukninger: shift_client_attribution som relations-tabel, pricing_pending som kø-tabel, client_crm_match_id som dedikeret kolonne                                            |
| 19  | Performance og resilience: org_unit_closure-tabel for subtree-RLS (erstatter rekursiv CTE; generelt princip), frontend som kosmetisk preview (@stork/core deployment-sync), forberedt-aggregat-mønster for lock-pipeline med SLA <10s, generisk break_glass_requests-tabel med two-actor approval (ny §1.15). Benchmark-test som CI-blockers i §3                                                                          |
| 20  | Migration-strategi indlejret: ny §0.5 med grundprincip (udtræk + upload, ikke ETL), Model B modificeret implementation (manuel skygge-sammenligning, ingen adapter-dobbelt-skriv), legacy_snapshots + legacy_audit i core_compliance, migration-leverancer integreret i eksisterende byggetrin (trin 5, 9, 10, 10b, 14, 21) + nyt trin 31 (cutover). Rådata-omfang styres ved import. 1.0's tal bevares uden re-evaluering |
| 21  | Konsistens-fix fra trin 1 bygning: (a) §1.3 audit-`source_type`-enum udvidet med `migration`-værdi (§0.5/rettelse 20 specificerede værdien men §1.3's liste i rettelse 18 manglede den). (b) `employees_active_idx` defineret som `(id, termination_date) WHERE anonymized_at IS NULL` — `current_date` kan ikke indgå i index-prædikat (skal være IMMUTABLE), så termination-filter sker ved query-tid.                   |

---

## Rettelse 19 — Begrundelser

Hvert C-område havde 2-4 forslag i `performance-resilience-undersoegelse.md`. Hvert valg dokumenteret her med 5-års-perspektivet som kriterium.

### C1 — Subtree-RLS: Forslag B (closure-table)

**Valgt:** Materialiseret `org_unit_closure`-tabel + trigger. Helper `acl_subtree` returnerer descendants via indexed lookup.

**Afvist:** Forslag A (STABLE-funktion med rekursiv CTE) og Forslag C (hybrid med benchmark).

**Begrundelse:**

- C-rapportens default-anbefaling var A (STABLE-funktion). **Det valg ændres her.** Reason: 5-års-kriteriet vægter skala-headroom over kortsigtet enkelhed.
- Ved 500 brugere × org-træ-dybde 5-7 × subtree-størrelse 50-100 nodes kan STABLE-funktion blive flaskehals selvom Stork's træ er fladt i dag. Org-strukturen vokser sandsynligvis over 5 år.
- Closure-table giver garanteret O(log n) opslag uafhængigt af Postgres' planlæggers beslutninger.
- Vedligeholdelses-omkostning er minimal — org-mutationer er sjældne; trigger-omkostning irrelevant.
- Princippet om ingen rekursive CTE'er i policy-prædikater gøres til generelt mønster der gælder fremadrettet (klient-hierarkier, kampagne-træer, hvad end).
- Trade-off: én ekstra tabel + én trigger. Pris værd for permanent skala-løsning.

### C2 — @stork/core deployment: Forslag A (kosmetisk preview)

**Valgt:** Frontend-beregning som kosmetisk preview + eksplicit dokumentation i §1.9. RPC altid autoritativ.

**Afvist:** Forslag B (version-tjek på RPC-niveau) og Forslag C (service worker-cache-invalidering).

**Begrundelse:**

- Forslag A er konsistent med principperne "stamme = database" og "RPC autoritativ". Det er ikke kortsigtet pragmatik — det er strukturel beslutning der bærer evigt.
- Forslag B (version-tjek) tilføjer kompleksitet i hver RPC-kald og giver hård tvungen frontend-reload ved hver deploy — dårlig UX.
- Forslag C (service worker) er ekstra deployment-overflade. Race-conditions mulige.
- 5-års-perspektiv: Princippet "frontend er UI, RPC er sandhed" holder lige godt om 5 år som i dag. Ingen forventede skala-effekter ændrer det.

### C3 — Lock-pipeline: Forslag B (forberedt-aggregat-mønster)

**Valgt:** Two-fase candidate-snapshot-mønster. Asynkron candidate-beregning før lock; atomar promovering ved lock. SLA <10s.

**Afvist:** Forslag A (SLA + benchmark uden candidate) og Forslag C (stegvis ikke-atomar lock).

**Begrundelse:**

- C-rapportens default-anbefaling var A med SLA <60s. **Det valg ændres her.** Reason: 5-års-kriteriet kræver at lock-pipeline skalerer til 500+ medarbejdere uden refactor.
- Ved 500 medarbejdere × 10M sales pr. periode kan SLA <60s være urealistisk uden forberedt aggregat — selv med god indeksering.
- Candidate-mønstret garanterer lock-pipeline-tid uafhængigt af volumen — promoveringen er kun UPDATE af pre-beregnede rows + status-skifte.
- SLA strammes fra <60s til <10s fordi forberedt-aggregat gør det opnåeligt.
- Forslag C (stegvis) bryder atomicitet — uacceptabelt fordi periode kunne være halv-låst ved fejl.
- Trade-off: ekstra candidate-tabeller + pre-compute-cron. Pris værd for forudsigelig lock-tid uafhængigt af skala.

### C4 — Break-glass: Forslag A (generisk break_glass_requests)

**Valgt:** Generisk tabel-mønster med two-actor approval. Operation_type som data-tabel.

**Afvist:** Forslag B (operation-specifik tabel pr. operation), Forslag C (single-actor + time-lock + notification), Forslag D (hybrid).

**Begrundelse:**

- Konsistent mønster reducerer kognitiv belastning for to-personers team — ét mønster at lære, ikke N.
- Operation_type som data-tabel: ny break-glass-operation tilføjes uden migration. Konsistent med princippet "alt drift styres i UI".
- Two-actor approval er reel governance — single-actor (Forslag C) er for svag for stor-konsekvens-operationer.
- Audit-trail er ensartet på tværs af alle break-glass-operationer.
- UI-overblik over alle pending requests fra ét sted — én page, ikke N.
- 5-års-perspektiv: Nye break-glass-operationer dukker op (GDPR-modifikation, ny lovgivning, master-data-merges). Generisk mønster absorberer dem uden refactor.

### Sammenfatning

To valg ændrede sig fra C-rapportens default-anbefalinger:

- **C1:** A → B (closure-table)
- **C3:** A → B (forberedt aggregat)

Begge ændringer drevet af **skala-headroom-kriteriet**. Stork skal holde ved 500+ brugere og 10M+ sales uden ombygning; STABLE-funktion og <60s SLA er ikke garanterede løsninger ved den skala.

C2 og C4 blev valgt som anbefalet i C-rapporten fordi de er strukturelt korrekte, ikke pragmatiske kompromiser.

---

**Slut på master-plan.**

Klar til bygning. Trin 1 starter ved adgangs-mekanik i core_compliance + core_identity.
