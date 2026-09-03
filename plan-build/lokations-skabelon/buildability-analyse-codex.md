# Buildability-analyse - lokations-skabelon

Aktør: codex
Run: fase2-buildability-codex-2026-09-03
Akse: Kun "kan det kodes, er der huller"; ingen forretnings-merit og ingen rettelse af krav.

## Verifikation og grundlag

- `git rev-parse HEAD` er verificeret til `727ba0bbd31ee9f38a7862f9d14abf30dc32e350`.
- `docs/sandhed/krav/lokations-skabelon-krav.md` er verificeret som blob `b01d85fd12f1865352e6c082ebbe1fdb336ce46d`.
- `recon/recon.md` er verificeret som blob `7fbd3a2f43c03ce239aa81e20483326bf438463c`.
- Web er ikke brugt.

Konklusion: PASS.

Begrundelsen er, at hvert K-krav kan implementeres som databasenær struktur, RPC-flade og smoke/negative tests oven på de eksisterende skabeloner i `supabase/migrations/` og `scripts/fitness.mjs`. Recon fastslår selv, at repoet endnu ikke har en lokations-tabel/RPC/policy; derfor er dommen ikke, om pakken allerede findes, men om kravene kan bygges på de eksisterende mønstre. Det kan de.

Der er ingen reelle kravhuller, der gør kodning umulig. De åbne punkter, kravdokken markerer som plan-fase, er repræsentationsvalg eller nedstrømsbeslutninger, ikke manglende acceptadfærd for denne pakke: UI-sider kommer i lag F, bookingkonflikter håndhæves i trin 24, og trin 10b skal levere autoritative lookup-/handlingsflader, som de senere trin kan teste imod.

## Skabelonbillede fra koden

- Core-placering er mulig og korrekt: `core_identity` er oprettet til identitets-masterdata inklusive "hvem og hvor", og app-roller får ingen direkte tabelrettigheder som default.
- Direkte app-writes kan lukkes strukturelt: den senere revoke-migration fjerner INSERT/UPDATE/DELETE/TRUNCATE på alle `core_*`-tabeller fra `authenticated` og `anon`.
- Audit er genbrugeligt: `stork_audit()` kræver `stork.change_reason` for manuelle/ukendte writes, skriver old/new values, og `audit_log` er immutable mod UPDATE/DELETE/TRUNCATE.
- Selv-refererende hierarki og cycle-detection findes som skabelon i `org_node_versions`: parent-id, effective intervals, partial unique open version, EXCLUDE no-overlap og trigger-baseret parent-chain traversal.
- Versionerede relationer findes som skabelon i `employee_node_placements`/`client_node_placements`: date intervals, partial unique, EXCLUDE no-overlap, FK-disciplin, RLS og audit.
- Pending/undo findes som state machine: `pending_changes` med pending -> approved -> applied/undone, `undo_settings`, central apply-gate og due-check på både undo deadline og effective date.
- Permission-modellen har page/tab/action-grants, superadmin-seeding-mønster og action-aware approve-gates.
- Klassifikation og anonymisering kan udvides: `data_field_definitions`, migration-gate, permanent-allowlist-review, anonymization mappings/state/strategies og entity-wrapper-mønster findes.
- Fitness håndhæver de fælles gates: dedup/opt-out, audit trigger coverage, FK coverage, schema ownership, SECDEF sanctionering, app-write revoke, index-per-policy, migration set_config discipline og CI-testdisciplin.

## K-1 Lokation som central master-data

Døm: PASS.

Kravet er byggeligt som en ny `core_identity.locations`-mastertabel eller identity+version-par, afhængigt af planens valgte historikrepræsentation. Required navn kan håndhæves med `text not null check (length(trim(name)) > 0)`, type-listen med CHECK/enum, gruppe med FK til leverandør/gruppetabel, og økonomi-attribution kan holdes ude ved ikke at oprette nogen `core_money`-kobling fra lokation i denne pakke.

Acceptkriterierne er testbare:

- blankt/manglende navn afvises med table CHECK og RPC-precheck;
- type uden for `{butik, messe, marked, event, andet}` afvises med CHECK;
- prisændring kan testes via audit old/new values og ved at der ikke findes nedstrøms økonomi-FK i pakken;
- oprette/ændre går via rettigheds-gatede RPC'er, ikke migration/developer flow.

Plan-fasepunktet om valuta/enhed/tom-pris påvirker implementeringsrepræsentationen, men gør ikke K-1 utestbart: kravet kræver informativ default-pris og historik, ikke en beregningsformel.

## K-2 Stande under lokation

Døm: PASS.

Kravet er byggeligt med samme lokationsentitet og selv-reference (`parent_location_id`) plus versioneret eller current-state hierarchy. Cycle-detection-skabelonen i `org_node_versions` kan kopieres: parent != self, traversal af ancestor-kæde og depth guard. Pris-arv er en read-RPC/constraint-opgave: hvis placement-pris er null, returnerer lookup lokationens pris, og der findes kun én resolved price i læsefladen.

Acceptkriterierne er testbare:

- parent-cycle afvises;
- placement uden egen pris læses med entydig resolved pris;
- status/cooldown lookup for parent gør stand under dvale/nedlagt ikke bookbar;
- stand-identitet leveres som downstream booking-key;
- nedlæggelse ændrer status og klientkoblinger, men sletter ikke child rows.

Afvisning af to klienter på samme stand samme dag ligger bevidst i trin 24. Buildability her er, at pakken leverer standens stabile identitet og aktiv/tilladelses-opslag, så booking-trinnet kan lægge en unique/exclusion test på `(stand_id, booking_date)`.

## K-3 Gruppe (leverandør) som ejer

Døm: PASS.

Kravet er byggeligt som egen `core_identity.location_suppliers`/`location_groups`-mastertabel med type CHECK og en NOT NULL FK fra lokation. Fritekst-gruppenavn på lokationen kan gøres strukturelt umuligt ved ikke at have en sådan kolonne og kun acceptere `group_id` i RPC'en.

Acceptkriterierne er testbare:

- lokation uden gruppe-FK afvises;
- ukendt gruppe-id afvises af FK;
- gruppe uden type afvises;
- kæde-tilladelse kan holdes ude ved kun at modellere tilladelser pr. `location_id`;
- sletning af gruppe med lokationer afvises med `ON DELETE RESTRICT`, mens deaktivering/udfasning kan laves som dedikeret audited action.

Leverandørens fulde feltliste er korrekt flyttet til field-registry/plan, fordi kravet kræver ejerentitet, type og historikbeskyttelse, ikke en låst kommerciel feltliste i denne gate.

## K-4 Status-livscyklus

Døm: PASS.

Kravet er byggeligt med status CHECK `{aktiv,dvale,nedlagt}`, dedikeret `location_status_change`-RPC, audit og enten status-versionstabel eller immutable status-event/history table. Direkte status-UPDATE kan blokeres med final app-write revoke, RPC-only write-policy og/eller trigger/session-var guard.

Acceptkriterierne er testbare:

- invalid status afvises;
- manglende årsag afvises af RPC-precheck og audit-trigger;
- status-skrivning uden dedikeret action afvises;
- statushistorik kan ikke overskrives, fordi history/audit er append-only/immutable;
- aktiv-opslag pr. dato returnerer én sandhed til booking-gaten;
- tilladelser i dvale afvises ikke;
- nedlagt kan genåbnes via samme RPC;
- klientkobling på nedlagt afvises;
- nedlæggelse lukker åbne klientkoblinger i samme transaktion og bevarer child placements.

Ingen kodeconstraint i de læste skabeloner modsiger genåbning fra nedlagt eller dvale uden auto-frakobling.

## K-5 Hvile efter brug

Døm: PASS.

Kravet er byggeligt som lokationsbundet cooldown-konfiguration og en manuel/automatisk dvale/hvile-handlingsflade. Den konkrete repræsentation kan være kolonner eller config-jsonb med validerede nøgler; det afgørende buildability-krav er, at værdierne er UI-data, mens forbuddet mod booking under hvile er strukturelt og ikke kan fraviges med en "book alligevel"-vej.

Acceptkriterierne er testbare:

- booking-gaten kan teste aktiv/hvile-opslag og afvise hvilende lokation;
- afslutning af hvile uden rettighed afvises, med rettighed auditeres den og sætter lokationen aktiv;
- ændring af cooldown-konfig uden rettighed afvises, med rettighed gælder den straks og auditeres;
- ændring af længde/enhed går via RPC/UI-data og kræver ikke deploy.

Nedstrømsbeslutninger om annullerede bookinger og evalueringsniveau er eksplicit uden for denne pakke. De blokerer ikke, fordi trin 10b kan levere de nødvendige lookup- og konfigflader uden at bygge bookingmotoren.

## K-6 Klient-tilladelser pr. lokation

Døm: PASS.

Kravet er byggeligt som separat versioneret relation `client_id x location_id` med `effective_from/effective_to`, FK til `clients` og `locations`, partial unique for én åben relation pr. klient/lokation og EXCLUDE no-overlap pr. klient/lokation. Den eksisterende `client_node_placements`-skabelon må ikke kopieres ukritisk, fordi den har én åben placering pr. client; lokationstilladelser skal have composite key. Det er en implementeringsdetalje, ikke et kravhul.

Acceptkriterierne er testbare:

- permission uden client/location afvises af NOT NULL/FK/RPC;
- overlappende eller anden gældende permission for samme client/location afvises;
- åben slutdato accepteres;
- frakobling lukker fra dato og bevarer historiske rows;
- `may_client_stand_on_location(client, location, date)` returnerer entydigt for både nutid og fortid;
- flere klienter på samme lokation accepteres;
- nedlæggelse lukker alle åbne permissions for lokationen og efterlader ingen "nedlagt med koblede klienter";
- til-/frakobling går gennem pending/approval/undo, når handlingstypen er dateret.

Eksisterende fremtidige bookinger ved frakobling er korrekt downstream til trin 24, fordi denne pakke kun leverer tilladelsesopslaget pr. dato.

## K-7 Klassifikation, persondata og anonymisering

Døm: PASS.

Kravet er byggeligt med eksisterende `data_field_definitions`, migration-gate og anonymization registry. Nye lokations-/leverandørkolonner kan klassificeres i migrationen, og senere UI-ændringer kan gå via klassifikations-RPC. Forretningsdata kan have default no-retention (`retention_type null`) eller eksplicit permanent kun hvis allowlisten udvides med review.

Acceptkriterierne er testbare:

- uklassificeret kolonne gør migration-gate rød i strict mode;
- anonymisering af gruppekontakt kan implementeres som UPDATE via entity-wrapper, ikke DELETE;
- lokations-/gruppekoblinger og audit består;
- default uden aktivt valg er `pii_level='none'`/ingen retention på felt-registry-niveau;
- direct PII uden strategi/mapping afvises af anonymization test/apply flow.

Vigtig implementeringsnote, men ikke blocker: eksisterende generisk anonymisering håndterer top-level direct-kolonner. Hvis gruppekontaktfelter lever i dynamisk jsonb-registry, skal lokationspakken kopiere T10's entity-special-case-mønster for audit/anonymisering i stedet for at antage, at `jsonb_field_strategies` alene er fuldt generisk. Det er kodbart og testbart.

## K-8 Adgang, audit og fortrydelse

Døm: PASS.

Kravet matcher fundamentet direkte: write-RPC'er med `has_permission`, `change_reason`, session-vars, audit-trigger, immutable audit, pending/action/undo og final revoke af direkte core-writes. Superadmin-dækning kan seedes via grant-modellen, og alle øvrige tildelinger er UI-data.

Acceptkriterierne er testbare:

- direkte table INSERT/UPDATE/DELETE som app-rolle afvises;
- mutation uden reason afvises;
- audit UPDATE/DELETE/TRUNCATE afvises;
- action uden grant afvises, og read uden view giver 42501 eller 0 rows afhængigt af flade;
- permission pages/tabs/actions og superadmin grants kan verificeres med permission-matrix-smoke.

Ingen kravspecifik rettighedsmekanisme er nødvendig eller tilladt.

## K-9 UI-styrbarhed

Døm: PASS.

Kravet er byggeligt i trin 10b ved at levere de offentlige RPC-/read-flader, som lag F UI'et senere kalder 1:1. Det er konsistent med kravdokkens scope-ærlighed: selve sider/formularer kommer senere, men handlingsfladen skal være komplet, permission-gated og testet nu.

Acceptkriterierne er testbare:

- hver forretningshandling har en RPC/read-RPC og kræver ikke migration efter deploy;
- ingen handling kræver teknisk DB/service-adgang;
- strukturelle forbud ligger i CHECK/FK/trigger/RPC-precheck og kan ikke deaktiveres via UI-konfig;
- types-generation og permission seed tests kan sikre, at fladen er kaldbar fra frontend-laget.

## Negative cases efterprøvet for buildability

- Lokation med blankt eller manglende navn afvises.
- Lokationstype uden for `{butik, messe, marked, event, andet}` afvises.
- Direkte app-write til en lokations-/gruppe-/tilladelsestabel uden godkendt RPC afvises.
- Hierarkiændring der skaber parent-cycle afvises.
- Placement uden egen pris må kun have én resolved pris via lokationens pris.
- Lokation uden gruppe-FK afvises.
- Gruppe uden type afvises.
- Gruppe med lokationer kan ikke slettes; kun deaktiveres/udfases via audited action.
- Status uden for `{aktiv,dvale,nedlagt}` afvises.
- Statusskift uden årsag eller uden dedikeret action afvises.
- Booking-opslag for dvale/nedlagt/hvilende lokation returnerer ikke-bookbar; bookingafvisningen ligger i trin 24.
- Hvile/cooldown-konfig eller tidlig afslutning uden rettighed afvises.
- Klientkobling på nedlagt lokation afvises.
- Tilladelse uden klient eller lokation afvises.
- Overlappende/gældende dobbelt-tilladelse for samme klient x lokation afvises.
- Åben permission uden slutdato accepteres og er ikke en negativ.
- Flere klienter på samme lokation accepteres; konflikter håndhæves pr. stand i booking.
- Nedlæggelse lukker alle åbne klientkoblinger og bevarer koblingshistorik og stande.
- Uklassificeret ny kolonne blokerer migration-gate.
- Direct PII-nedklassificering af feltdefinition afvises.
- Anonymisering sker via UPDATE og state/audit; DELETE som anonymiseringsvej afvises.
- Audit-log update/delete/truncate afvises.
- Ny SECURITY DEFINER-lokations-RPC uden sanctionering bliver fitness-rød.
- Ny `_id`-kolonne uden FK/exemption bliver fitness-rød.
- Ny lokationstabel uden audit-trigger eller eksplicit reviewet exemption bliver fitness-rød.

## Samlet dom

PASS: Alle K-krav er kodbare og kan omsættes til mekaniske accepttests mod de eksisterende Supabase-/fitness-skabeloner. Der er ingen buildability-huller, og ingen uafgørlig usikkerhed der kræver HALT.
