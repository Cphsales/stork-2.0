# Buildability-analyse — lokations-skabelon (Fase 2 pkt. 4, aktør: code)

Run: fase2-buildability-code-2026-09-03
Gated commit: 727ba0bbd31ee9f38a7862f9d14abf30dc32e350 (verificeret med `git rev-parse HEAD`)
Krav-doc: docs/sandhed/krav/lokations-skabelon-krav.md @ blob b01d85fd12f1865352e6c082ebbe1fdb336ce46d (verificeret)
Recon: recon/recon.md @ blob 7fbd3a2f43c03ce239aa81e20483326bf438463c (verificeret)
Bilag: recon/recon-2-bilag.md @ blob 6e569779353ea1d0a2bf747ce6eda6509de1aea0 (læst)
Anker: launch/launch.json @ blob 7096d2ecbebce37426899dce29ba1984f3225293 (læst)

Aksen jeg dømmer: KAN kravene kodes mod den eksisterende kodebase/skabeloner — er der
huller, modsigelser, udefinerede begreber, manglende forudsætninger eller acceptkriterier
der ikke kan verificeres mekanisk? Jeg dømmer IKKE forretnings-merit og retter ingen krav.

Ud over krav-doc og recon (begge læst i fuld længde) har jeg linje-læst de bærende
skabelon-filer i koden: 20260518000001_t9_org_nodes.sql (cycle-check + versionering),
20260518000004_t9_client_node_placements.sql (versioneret placement + partial UNIQUE +
EXCLUDE + apply-handlers + pending-dispatcher), 20260521000009_t10_client_rpcs.sql
(upsert/set_active-adskillelsen), 20260514120003_t1_audit_partitioned.sql:180-284
(immutability + audit_log_read), 20260607110004 (den hårde write-revoke).

## Konklusion: PASS

Alle 9 K-krav er byggelige mod eksisterende, verificerede skabeloner i repoet, og alle
acceptkriterier er formuleret som testbare slut-effekter (positivt udfald + navngiven
afvisning) der kan effect-harnesses via DB-tests (run-db-tests-mønstret) og/eller
mekaniske gates (migration-gate, fitness, m1-permission-matrix). Ingen modsigelser mod
kendte constraints fundet. UMULIGT/KONFIGURERBART-skellet er konsistent hele vejen.
Tre ikke-blokerende afklaringsspørgsmål til Mathias er noteret nederst.

## Pr. K-krav

### K-1 Lokation som central master-data — BYGGELIG

- **Skabelon:** core_identity.clients-mønstret (t10_tables: name trim>0-CHECK, FORCE RLS,
  session-var-write-policy, SECDEF-RPC'er, audit-trigger) er 1:1-skabelonen for en
  locations-tabel. Schema-placering core_identity er doc-låst og recon-bekræftet
  (t1_schemas_and_defaults' schema-comment nævner eksplicit 'lokationer').
- **Acceptkriterier testbare:**
  - ac1 (blankt navn AFVISES): CHECK-constraint + RPC 22023 — client_upsert-mønstret
    (linje-læst: 20260521000009:35-37). Effect-harness: kald RPC med blankt navn → 22023.
  - ac2 (type uden for {butik, messe, marked, event, andet} AFVISES): CHECK IN-constraint —
    samme mønster som org_node_versions.node_type (20260518000001:50). Testbar.
  - ac3 (pris informativ; ændring rører aldrig noget oprettet; audit viser hvad der gjaldt):
    testbar i pakken som: pris-UPDATE muterer kun lokations-rækken + audit-row med
    old/new_values (stork_audit); audit_log_read viser historikken. Der findes intet
    nedstrøms objekt i pakken en pris-ændring KUNNE mutere — negativet er verificerbart
    over pakkens egen flade. Valuta/tom-pris er synligt flyttet til plan-fase.
  - ac4 (ingen økonomi-kobling): strukturel fraværs-garanti — testbar mekanisk (ingen
    FK/kolonne mod core_money; ingen attribution-flade). Schema-assertion i DB-test.
  - ac5 (aldrig udvikler-indgreb): via K-9's RPC-flade-bevis.
- **UMULIGT/KONFIGURERBART konsistent:** navnepligt/type-liste/master-kilde = struktur
  (CHECK/FK/schema); hvilket navn/adresse/type/pris = værdi (RPC-parametre). Ingen
  konfigurerbar ting er hardkodet i kravet.

### K-2 Stande (placements) under lokation — BYGGELIG

- **Skabelon:** §1.12's selv-refererende parent_location_id + cycle-detection har en
  direkte, linje-læst skabelon: _org_node_cycle_check (20260518000001:105-152) —
  BEFORE-trigger, besøgs-array, dybde-loft 100, P0001. Genbrug er ren kopi med
  parent_location_id.
- **Acceptkriterier testbare:**
  - ac1 (cyklus AFVISES): P0001 — effect-harness: skab A→B→A → forvent exception. Testbar.
  - ac2 (pris-opløsning entydig, aldrig to sandheder): stand.pris nullable + læse-opløsning
    (COALESCE op ad kæden) i read-RPC; negativ: ingen pris-kopi lagres. Testbar: opret
    stand uden pris → read-RPC returnerer lokationens pris; ændr lokationens pris → stand
    følger. Rekursiv opløsning er veldefineret uanset plan-fase-afgørelsen om dybde.
  - ac3 (stand under dvale/nedlagt ikke bookbar via K-4's aktiv-opslag): opslaget resolver
    stand → rod-lokation → status. Testbar: opslag(stand under dvale-lokation, dato) →
    ikke-bookbar.
  - ac4 (én klient pr. stand — stand-identiteten leveres, håndhævelsen er trin 24):
    scope-ærlig formulering; pakkens testbare del er at standen ER en selvstændig,
    bindbar enhed (PK + hierarki-opløsning). Bæreevne-claim, strukturelt testbar.
  - ac5 (nedlæggelse sletter ingen stande): status-skift rører ikke child-rækker; DELETE
    er default-deny (ingen delete-policy — clients-mønstret). Testbar: nedlæg → tæl stande.
- **Plan-fase-flyt er rene:** dybde under stand og gruppe-arv er flyttet synligt og
  blokerer ingen acceptkriterie-test (alle negativer er veldefinerede ved 2 niveauer og
  forbliver veldefinerede ved N).

### K-3 Gruppe (leverandør) som ejer — BYGGELIG

- **Skabelon:** egen master-data-entitet = clients-mønstret (tabel + upsert/set_active +
  read-RPC'er + felt-registry via client_field_definitions-mønstret for gruppens øvrige
  felter). FK lokation→gruppe er samme-schema (core_identity) — ingen konflikt med
  fitness' cross-schema-fk-discipline (kun employees/auth.users som cross-schema-mål).
- **Acceptkriterier testbare:**
  - ac1 (lokation uden gruppe AFVISES): NOT NULL FK → 23502/23503. Testbar.
  - ac2 (fritekst-gruppenavn kan IKKE eksistere): strukturelt — der findes ingen
    tekst-kolonne, kun FK. Schema-assertion. Testbar.
  - ac3 (type-løs gruppe AFVISES): NOT NULL + CHECK IN (kæde/enkelt-butik/messe-operatør/
    andet — doc-fastlagt liste §1.12). Testbar.
  - ac4 (ingen kæde-tilladelse): strukturelt fravær — tilladelses-tabellen FK'er kun
    lokation, ingen gruppe-kolonne. Schema-assertion. Testbar.
  - ac5 (gruppe med lokationer kan IKKE slettes): FK ON DELETE RESTRICT (t10.7-mønstret,
    linje-læst i recon) + ingen delete-policy; deaktivering via set_active-mønstret.
    Testbar: DELETE → FK-violation; RPC-flade har ingen delete.
- **Felt-registry som UI-data:** client_field_definitions-mønstret (global key, pii_level,
  is_active-udfasning, immutabel key, direct→lavere-nedgradering afvist) genbruges 1:1
  for gruppens felter. Udformningen er synligt flyttet til plan-fase.

### K-4 Status-livscyklus aktiv · dvale · nedlagt — BYGGELIG

- **Skabelon:** dedikeret status-RPC = client_set_active-mønstret (linje-læst:
  20260521000009:72-98 — adskilt RPC, permission, change_reason, session-var; upsert
  rører BEVIDST ikke status). Historik = audit_log (immutabel, linje-læst:
  20260514120003:180-207) og/eller versioneret status-tabel (org_node_versions-mønstret).
  r7d-disciplinen (status + is_active læses sammen; fitness legacy-is-active-readers)
  er en kendt bygge-constraint, ikke en modsigelse — en ren 3-værdi status-kolonne
  undgår dual-column-fælden helt.
- **Acceptkriterier testbare:**
  - ac1 (værdi uden for enum AFVISES): CHECK. Testbar.
  - ac2 (skift uden årsag AFVISES; auditeres): RPC 22023 + stork_audit P0001-nettet.
    Testbar begge veje.
  - ac3 (skrivning uden om handlingen AFVISES): 20260607110004-revoke (linje-læst: alle
    core_*-write-privileger revoked fra authenticated/anon) + FORCE RLS + upsert-RPC der
    ikke eksponerer status. Testbar: direkte UPDATE → permission denied; upsert → status
    uændret.
  - ac4 (historik kan ikke overskrives): audit_log immutability-trigger (P0001 på
    UPDATE/DELETE, TRUNCATE-blok) — linje-læst. Versioneret tabel giver derudover
    EXCLUDE/partial-UNIQUE-beskyttelse. Testbar.
  - ac5 (aktiv-opslag pr. dato entydigt): read_at(dato)-mønstret (t9_read_rpcs +
    date-parametriserede ACL-helpers) — historisk pr.-dato-læsning er etableret mønster.
    Kræver versioneret status-lagring (ikke kun audit) for effektiv dato-forespørgsel —
    skabelonen (org_node_versions: effective_from/to, én åben version, no-overlap)
    findes og er linje-læst. Testbar: skift status over tid → opslag pr. dato matcher.
  - ac6 (tilladelser MÅ registreres i dvale): ikke-afvisning — testbar positivt.
    Parentesen om booket dato efter dvalens ophør er eksplicit trin 24's håndhævelse.
  - ac7 (genåbning mulig): samme RPC, nedlagt→aktiv-overgang lovlig. Testbar.
  - ac8 (kobling på nedlagt AFVISES): precondition i koblings-RPC + re-check i
    apply-handler (dobbelt-verifikations-mønstret fra t10_client_active_check —
    wrapper OG apply tjekker). Testbar.
  - ac9 (nedlæggelse kobler alle fra, beholder stande, historik består): cascade-lukning
    i handler = _apply_team_close-mønstret (cascade-lukning af placements ved lukning;
    recon-verificeret i t9_supplement/supplement-2). Frakoblingen er version-lukning
    (effective_to sættes) — historik består strukturelt. Audit source_type
    trigger_cascade autogenererer change_reason (stork_audit) — cascaden kan auditeres
    uden ekstra kontekst-krav. Invarianten 'nedlagt lokation med åben kobling findes
    ikke' er testbar som DB-assertion efter handlingen.
- **Konsistens:** ac6 (dvale: kobling OK) vs. ac8 (nedlagt: kobling afvist) vs. ac9
  (dvale kobler ingen af) er indbyrdes konsistente og hver for sig testbare.

### K-5 Hvile efter brug (cooldown) — BYGGELIG

- **Skabelon:** hvile-konfig pr. lokation = kolonne/jsonb på lokations-rækken (§1.12
  doc-låst form), redigeret via SECDEF-RPC m. has_permission + change_reason
  (employee_active_config_update-mønstret er den navngivne skabelon for
  UI-konfigurerbar adfærds-konfig; t10-upsert-mønstret for felt-redigering). Manuel
  dvale/afslutning-før-tid = dedikeret handling (K-4's status-RPC-klasse).
- **Acceptkriterier testbare:**
  - ac1 (booking på hvilende lokation AFVISES; ingen omgåelses-handling): pakkens
    testbare flade er (a) aktiv-opslaget svarer ikke-bookbar under hvile og (b) der
    findes ingen RPC i pakkens flade der omgår hvilen — begge effect-harness-bare
    (opslags-assertion + flade-enumeration). Selve booking-afvisningen sker i trin 24
    (kravets egen struktur-linje ruter 'booking under hvile' via K-4) — scope-ærligt
    og konsistent med IKKE-i-scope-afsnittet. Break-glass-fravigelse er eksplicit
    afvist af Mathias — konsistent med at flade_filteret udelukker break-glass.
  - ac2 (afslutning før tid uden rettighed AFVISES; med rettighed auditeret + aktiv):
    has_permission-gate 42501 + change_reason + status-effekt. Testbar begge veje.
  - ac3 (konfig-ændring uden rettighed AFVISES; med rettighed straks + audit): direkte
    SECDEF-RPC-vej — kravet afgør eksplicit at godkendelses-livscyklus IKKE gælder
    (Mathias: 'styres i rettigheder'; princip 5 læst som data-håndterings-konfig).
    Det lukker recon'ens konfig-lifecycle-usikkerhed. Testbar.
  - ac4 (aldrig udvikler for værdi-ændring): UI-data via RPC. Testbar via K-9.
- **Én-eller-to-model-ting (dvale vs. hvile)** er synligt flyttet til plan-fase med
  bindende forretnings-sandhed — begge modeller er byggelige med samme skabeloner, og
  ingen acceptkriterie afhænger af valget. Automatisk hvile-start efter kampagne kan
  først UDLØSES i trin 24 (bookinger findes ikke endnu) — pakken leverer konfig,
  tilstand og opslag; acceptkriterierne tester præcis dét og ikke mere. Konsistent.

### K-6 Klient-tilladelser — BYGGELIG (stærkeste skabelon-match i pakken)

- **Skabelon:** client_node_placements er en 1:1-skabelon, linje-læst
  (20260518000004): klient × mål × effective_from/effective_to, partial UNIQUE på åben
  række, EXCLUDE gist no-overlap, CHECK from<to, FORCE RLS, audit-trigger,
  apply-handlers der lukker prior åben række, pending-dispatcher-udvidelse + undo_settings-
  seed. Kravets tabel er klient × lokation i stedet for klient × node — partial UNIQUE
  bliver (client_id, location_id) WHERE effective_to IS NULL (kravet tillader samme
  klient på flere lokationer og flere klienter pr. lokation — kun parret er unikt).
  Triviel afledning af mønstret.
- **Acceptkriterier testbare:**
  - ac1 (uden klient/lokation AFVISES): NOT NULL FK'er. Testbar.
  - ac2 (anden gældende tilladelse samme klient×lokation AFVISES): partial UNIQUE +
    EXCLUDE no-overlap — begge constraint-typer linje-læst i skabelonen. Testbar.
  - ac3 (ingen slutdato kræves): effective_to NULL er lovligt og bærende i mønstret
    (daterange(..., coalesce(effective_to,'infinity'))). Testbar positivt.
  - ac4 (frakobling lukker fra dato, fortid urørt; sletning/omskrivning AFVISES):
    version-lukning (_apply_client_close-mønstret: SET effective_to, aldrig DELETE) +
    ingen delete-policy + audit-immutabilitet. Testbar.
  - ac5 (opslag klient×lokation×dato entydigt, også historisk): 'aktiv' = from<=d AND
    (to IS NULL OR to>d) — recon-dokumenteret semantik + read_at-mønstret. EXCLUDE-
    constrainten GARANTERER entydighed (max én række pr. dato pr. par). Testbar.
  - ac6 (flere klienter samtidig OK): ingen tvær-klient-constraint. Testbar positivt.
  - ac7 (nedlæggelse kobler alle fra; historik består; nedlagt+koblet findes ikke):
    se K-4 ac9 — cascade-mønstret. Testbar.
  - ac8 (uden rettighed AFVISES; daterede ændringer får godkendelse + fortrydelse):
    pending_changes-maskineriet er linje-læst (pending_change_apply: status='approved'
    AND undo_deadline<=now() AND effective_from<=current_date, ellers not_yet_due;
    ukendt change_type → 42883). Nye change_types kræver dispatcher-CASE-udvidelse,
    undo_settings-seed OG pending_changes_select-policy-udvidelse (så godkendere kan
    se pending'erne) — alle tre er kendte, mekaniske udvidelsespunkter (recon +
    bilag advarer eksplicit mod at glemme policy-udvidelsen). Testbar.
- **Ramme-afgørelsen** (daterede ændringer = fortrydelses-mekanisme; stamdata = direkte
  m. audit; mekanik pr. handlings-type → plan-fase) er eksplicit i krav-doc'en og
  lukker recon'ens pending-vs-direkte-usikkerhed. Begge veje har komplette skabeloner.

### K-7 Klassifikation, persondata og anonymisering — BYGGELIG

- **Skabelon:** hele kæden findes og er recon-verificeret i dybden: migration-gate
  STRICT i CI (uklassificeret kolonne → merge blokeret — mekanisk gate for ac1);
  data_field_definitions + default=intet (NULL retention lovlig for forretningsdata
  efter d1_d2 — matcher '§11: lokations-felter er forretningsdata'; 'bevares evigt'
  kan alternativt klassificeres 'permanent' via is_permanent_allowed-udvidelse,
  t10-mønstret kopiér-alt+tilføj); anonymiserings-infrastrukturen (mappings m.
  jsonb_field_strategies, strategi-registry, generic_apply m. PII-coverage-check,
  p1c-wrapper-mønstret for en anonymize_<gruppe>-RPC).
- **Acceptkriterier testbare:**
  - ac1: migration-gate STRICT — mekanisk, kører allerede i CI. Testbar.
  - ac2 (gruppe-kontakt anonymiseres: UPDATE, række består, koblinger + audit bevares;
    sletning AFVISES): generic_apply-vejen (UPDATE m. check-column, state-INSERT,
    P0002 ved gentagelse) + FK RESTRICT forhindrer sletning. Gruppe-tabellen skal bære
    sin egen check-kolonne (anonymized_at) — mappingens anonymized_check_column er
    konfigurerbar data, og mønstret (employees) er etableret. Ligger gruppens
    kontakt-felter i en felt-registry-jsonb, findes jsonb_field_strategies til
    anonymiseringen, og audit-PII-hashing af jsonb-nøgler kræver en special-case i
    audit_filter_values ala clients.fields (recon: ingen generisk jsonb-walking) —
    kendt, afgrænset kode-udvidelse, ikke et krav-hul. Testbar.
  - ac3 (default = intet): registry-default. Testbar.
  - ac4 (ingen persondata-felt uden anonymiserings-vej; lokations-anonymisering
    aktiveres først ved aktivt PII-valg): generic_apply's coverage-check + mapping
    test_run er præcis denne verifikation — mekanisk testbar. 'anonymized_at inaktiv
    struktur indtil aktivt valg' er konsistent med dispatcher-mekanikken (ingen aktiv
    mapping → ingen retention/anonymisering — recon: SILENT skip er dokumenteret
    adfærd). Testbar.
- **d1c/d1b-constrainten** (permanent kræver allowlist-udvidelse i migration) er en
  kendt forudsætning, ikke en modsigelse — t10 gjorde det samme for clients.

### K-8 Adgang, audit og fortrydelse (arve-rammen) — BYGGELIG

- **Skabelon:** alt i K-8 ER den eksisterende fabrik: 20260607110004-revoke
  (linje-læst — ac1), stork_audit change_reason-krav + immutabilitet (linje-læst —
  ac2/ac3), has_permission grants-model m. synlighed≠handling (can_access vs.
  can_write; r7b-lektionen — ac4), permission-træ + seed-mønster (t10_seed_permissions:
  pages + manage-tabs + superadmin-grants, ON CONFLICT, t9_write_authorized — ac5).
- **Kritisk kendt fælde er adresseret af skabelonen:** superadmins area-grants blev
  seedet over dengang-eksisterende areas — et NYT lokations-area får IKKE automatisk
  superadmin-dækning (recon t9_seed_owners). t10-seed-mønstret seeder eksplicit
  superadmin-grants i samme migration, og m1-permission-matrix-DB-testen fejler CI
  hvis et has_permission-kaldested mangler dækning — ac5 er dermed mekanisk testbar.
- Alle fem acceptkriterier har eksisterende, verificerede afvisnings-mekanismer og
  er effect-harness-bare (permission denied / P0001 / 42501 / 0 rækker).

### K-9 UI-styrbarhed — BYGGELIG

- **Scope-ærligheden er eksplicit og korrekt:** trin 10b er core-lag; acceptkriterierne
  bevises via de offentlige indgange UI'en kalder 1:1 (§1.9). Det matcher kodebasens
  faktiske arkitektur (SECDEF-RPC-flade + grants til authenticated + live-eksponeret
  core_identity pr. types-gen.sh; config.toml-divergensen lokal-vs-live er
  recon-dokumenteret og fitness-verificeret live).
- **Acceptkriterier testbare:**
  - ac1/ac2 (ingen udvikler-indgreb, ingen tekniske privilegier): testbar som
    flade-enumeration — hver forretningshandling i pakken har en authenticated-kaldbar
    RPC (GRANT EXECUTE-disciplinen; G059-lektionen om grant+session-var er
    recon-dokumenteret). Effect-harness: kald hele fladen som authenticated
    rettighedshaver → alle handlinger mulige.
  - ac3 (strukturelt forbud kan ikke slås fra via UI): strukturelle vagter er
    CHECK/FK/trigger/constraint — ikke data-drevet konfiguration; der findes ingen
    RPC der kan deaktivere dem. Mønstret 'kode-låste flag kun i migration-seed'
    (permission_actions) viser disciplinen. Testbar som flade-assertion.

## Særligt blik (instruksens punkter) — alle dækket

1. **Selv-refererende hierarki + cycle-detection:** skabelon linje-læst og verificeret
   (_org_node_cycle_check). BYGGELIG.
2. **Status-livscyklus via RPC:** client_set_active + versionering + audit — BYGGELIG.
3. **Klient-tilladelser versioneret (from/to):** client_node_placements 1:1 — BYGGELIG.
4. **Cooldown-konfig:** UI-konfig-RPC-mønstret + kravets rettigheds-afgørelse — BYGGELIG.
5. **anonymized_at-mønstret:** employees + dispatcher/mapping-infrastruktur — BYGGELIG;
   kravet gør den bevidst inaktiv indtil aktivt PII-valg (konsistent med default=intet).
6. **Leverandør som egen entitet:** clients-mønstret + samme-schema-FK — BYGGELIG.
7. **Auto-afkobling ved nedlæggelse m. historik-bevarelse:** cascade-lukning
   (_apply_team_close-klassen) + version-lukning + immutabel audit — BYGGELIG.

## Spørgsmål/forslag til Mathias (ikke-blokerende — via claude-ai-rollen)

1. **Stand-egen driftsstatus:** Stande er samme entitet som lokationer (K-2), og
   status-mekanikken (K-4) findes dermed teknisk på hver række. Kravet afgør bookbarhed
   via lokationens status (K-2 ac3), men siger ikke om en ENKELT stand skal kunne tages
   ud af drift (fx 'stand 3 er under ombygning') uden at røre lokationen. Forslag:
   afklar med et ja/nej — begge svar er byggelige i rammen (planner kan afgøre, men et
   Mathias-ord sparer en plan-antagelse). Bord-test: 'Kan I finde på at lukke én stand
   midlertidigt mens resten af lokationen kører?'
2. **Tilladelse må kun pege på lokations-niveau:** K-2 ac4/K-6 siger tilladelsen gives
   pr. lokation (standen afgøres ved booking). Da lokation og stand er samme tabel,
   foreslår jeg at planen gør afvisningen eksplicit strukturel (tilladelse mod en
   stand-række AFVISES — target skal være top-niveau). Det er den naturlige læsning af
   kravet; nævnes kun så negativet ikke tabes i plan-fasen. Ingen Mathias-afgørelse
   nødvendig medmindre han faktisk VIL kunne koble en klient til én bestemt stand
   permanent — bord-test: 'Skal en klient kunne "eje" en fast stand, eller vælges
   standen altid ved booking?'
3. **Automatisk hvile-start:** K-5's automatik ('hviler efter en kampagne') kan først
   udløses når bookinger findes (trin 24). Pakken leverer konfig + manuel styring +
   opslag; det automatiske udløsningspunkt bygges i trin 24 oven på hvile-konfigen.
   Læsningen er konsistent med kravets egen trin 24-note — bekræft blot at det er
   forventningen, så trin 24-planen arver punktet eksplicit.

## Negative kanter efterprøvet for buildability

Se draft.json's negative_cases — hver linje er en afvisning/kant jeg har verificeret
har en eksisterende, testbar håndhævelses-mekanisme i kodebasen (constraint, trigger,
RLS-policy, revoke, RPC-check eller CI-gate), citeret i recon og/eller linje-læst i
migrationerne.
