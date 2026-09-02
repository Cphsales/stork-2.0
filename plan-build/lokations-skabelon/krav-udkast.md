# lokations-skabelon — krav-og-data

Status: UDKAST · recon_oid: 7fbd3a2f43c03ce239aa81e20483326bf438463c @ commit afcf4080a6c3619462eb9e53df10f49495e19abf · anker: masterplan §4 trin 10b / §1.12

## Formål — hvad pakken leverer

Lokations-skabelonen: fysiske lokationer med placements, grupper (ejere), klient-tilladelser, status-livscyklus og hvile-regler som central master-data — UI-styret, auditeret og klar til at bære bookinger og resten af FM-kæden (trin 24-29) uden om-design. Fundamentet for hele FM-grenen.

**Grundlag:** recon (3-blind, gate åben) @ OID ovenfor · Mathias' krav-ord 2026-09-02: UI-styring med struktur/værdi-skel ("noget skal være hardkodet — fx at en lokation skal have et navn; men HVILKET navn styres i UI") · status `aktiv · dvale · nedlagt`, kun aktiv bookbar · nedlagt kan genåbnes · tilladelser må oprettes i dvale når den bookede dato ligger efter dvalens ophør · hvile-reglen er absolut, men perioden kan stoppes i UI · aftaler laves pr. lokation, hver lokation har en gruppe som ejer · migration: importeres senere.

**Sprog-note:** Mathias' ord "gruppe"/"ejer" er masterplanens "leverandør" (§1.12) — samme entitet, to navne. Kravet skriver "gruppe (leverandør)".

**Form:** Hvert krav svarer på "hvad er umuligt" (struktur — hardkodet) og "hvad er konfigurerbart" (værdi — UI). Acceptkriterier er slut-effekter: noget AFVISES eller kan IKKE ske — aldrig "bør valideres".

## Krav

### K-1 Lokation som central master-data

**HVAD:** Fysiske lokationer oprettes og vedligeholdes som selvstændig master-data i identitets-kernen — én autoritativ kilde, aldrig fritekst på noget andet. En lokation bærer: navn, adresse, default-dagspris, gruppe-tilhør (K-3), type (butik / messe / marked / event / andet), status (K-4), hvile-konfiguration (K-5) og anonymiserings-tidsstempel (K-7). Messer og markeder er type-værdier — samme mekanik uanset type.

- **Struktur (umuligt):** lokation uden navn · type uden for listen · lokations-data der opstår spredt uden for master-kilden · lokation som attributions-/økonomi-dimension (salg attribueres altid via klient) · sær-mekanik pr. lokations-type.
- **Værdi (UI):** hvilket navn, adresse, type, gruppe, pris, status, hvile-konfiguration.

**Acceptkriterier (slut-effekter):**
1. Oprettelse af lokation med blankt eller manglende navn AFVISES.
2. Type uden for {butik, messe, marked, event, andet} AFVISES.
3. Default-dagsprisen er informativ: en pris-ændring ændrer ALDRIG noget allerede oprettet — hvad der gjaldt hvornår kan altid ses (audit).
4. Lokationen kan IKKE indgå som attributions- eller provisions-dimension — der findes ingen økonomi-kobling på lokationen i denne pakke.
5. Oprettelse/ændring af en lokation kræver ALDRIG udvikler-indgreb (jf. K-9).

### K-2 Placements under lokation (hierarki)

**HVAD:** En top-lokation kan have placements (stand-positioner) under sig — samme entitet, ét hierarki. En placement kan bære egen dagspris; ellers gælder parentens.

- **Struktur (umuligt):** cykler (en lokation kan aldrig — direkte eller gennem led — være sin egen over-lokation) · placement uden entydig pris-opløsning · booking på placement under ikke-aktiv lokation (via K-4).
- **Værdi (UI):** hvilke placements, navne, egne priser.

**Acceptkriterier (slut-effekter):**
1. En skrivning der skaber en cyklus i hierarkiet AFVISES.
2. Placement uden egen pris læses entydigt med parentens pris — der findes aldrig to sandheder om samme pris.
3. En placement under en lokation i dvale eller nedlagt er IKKE bookbar (håndhæves via K-4's aktiv-opslag).

*Plan-fase:* dybde-håndhævelse (to niveauer vs. fri) og gruppe-arv på placement — inden for dette kravs ramme.

### K-3 Gruppe (leverandør) som ejer

**HVAD:** Hver lokation tilhører en gruppe — ejeren (Brugsen → Coop; et center → Dansk Shoppingcentre). Gruppen er egen master-data-entitet med type (kæde / enkelt-butik / messe-operatør / andet); typen er opslags-anker for rabat-mekanikken der bygges i trin 29. Aftaler og bookinger laves pr. lokation — gruppen ejer, men aftalen er lokal (Mathias 2026-09-02).

- **Struktur (umuligt):** lokation uden gruppe · gruppe som fritekst på lokationen (altid reference til gruppe-entiteten — én sandhed, ingen stavevarianter) · type-løs gruppe · kæde-tilladelse der automatisk dækker gruppens lokationer.
- **Værdi (UI):** hvilke grupper, navne, typer og øvrige felter (felt-registry — feltlisten er selv UI-data); kontaktperson-oplysninger er persondata (K-7).

**Acceptkriterier (slut-effekter):**
1. Oprettelse af lokation uden gruppe-kobling AFVISES.
2. Gruppe angives ved valg af eksisterende gruppe-entitet — et fritekst-gruppenavn på lokationen kan IKKE eksistere.
3. Gruppe uden type AFVISES.
4. Der findes INGEN kæde-tilladelse: en tilladelse (K-6) peger altid på én lokation.
5. En gruppe med lokationer kan IKKE slettes — kun deaktiveres/udfases (historik består).

### K-4 Status-livscyklus: aktiv · dvale · nedlagt

**HVAD:** En lokation står altid i præcis én af tre tilstande (Mathias 2026-09-02): **aktiv** (kan bookes) · **dvale** (hviler — kan ikke bookes; kan forberedes med tilladelser) · **nedlagt** (ude af drift — kan ikke bookes; kan genåbnes). Skift sker via dedikeret handling med angivet årsag, auditeres, og historikken bevares.

- **Struktur (umuligt):** booking på ikke-aktiv lokation · status uden for de tre tilstande · status-skift uden årsag · overskrevet/slettet status-historik · status-skrivning uden om den dedikerede handling.
- **Værdi (UI):** hvilken lokation står i hvilken tilstand hvornår; dvalens ophør (K-5).

**Acceptkriterier (slut-effekter):**
1. En status-værdi uden for {aktiv, dvale, nedlagt} AFVISES.
2. Status-skift uden angivet årsag AFVISES; hvert skift auditeres.
3. Status-skrivning uden om den dedikerede handling AFVISES.
4. Det er UMULIGT at overskrive status-historik — hvad der gjaldt hvornår kan altid ses.
5. Aktiv-opslaget pr. dato svarer entydigt (fladen trin 24's booking-gate forbruger): booking på dvale/nedlagt AFVISES dér.
6. Klient-tilladelser MÅ oprettes/forlænges mens lokationen er i dvale — det AFVISES IKKE (den bookede dato skal ligge efter dvalens ophør; håndhævelsen af selve booking-datoen er trin 24).
7. Genåbning af nedlagt lokation er MULIG via samme dedikerede handling (auditeret, med årsag) — nedlagt er ikke en endestation.

### K-5 Hvile efter brug (cooldown)

**HVAD:** En lokation hviler efter en kampagne — automatisk pr. lokationens hvile-konfiguration eller sat manuelt. Hvilen gælder lokationen **på tværs af klienter** ("pr. lokation, ikke pr. klient/kampagne" — låst afgørelse). Reglen er absolut: der findes ingen omgåelse (Mathias 2026-09-02: "nej") — men hvile-**perioden** kan afsluttes før tid i UI af en rettighedshaver, hvorefter lokationen er aktiv igen ("man skal kunne stoppe dvaleperioden og dermed åbne lokationen i ui").

- **Struktur (umuligt):** booking under hvile (via K-4) · en "book alligevel"-fravigelse · hvile-konfig-ændring der træder i kraft uden bevidst aktivering (livscyklus kladde→testet→godkendt→aktiv, princip 5) · periode-afslutning uden rettighed eller uden audit-spor.
- **Værdi (UI):** hvile-periodens længde/enhed pr. lokation ("periode styres i ui") · manuel dvale og afslutning før tid.

**Acceptkriterier (slut-effekter):**
1. Booking på hvilende lokation AFVISES — der findes INGEN handling der tillader booking uden at hvilen først er afsluttet synligt.
2. Afslutning af hvile før tid uden rettighed AFVISES; med rettighed auditeres den med årsag, og lokationen er derefter aktiv.
3. En ændring af hvile-konfigurationen kan IKKE være gældende uden at have gennemgået kladde→testet→godkendt→aktiv.
4. Ændring af hvile-værdier (længde/enhed) kræver ALDRIG udvikler.

*Plan-fase:* om dvale-status (K-4) og hvile-mekanismen er én eller to model-ting — forretnings-sandheden er bindende: samme oplevelse, ingen omgåelse, kun styring af perioden. *Trin 24 (noteret nedstrøms-afhængighed):* annullerede bookingers hvile-effekt · evaluerings-niveau (placement vs. top-lokation).

### K-6 Klient-tilladelser pr. lokation

**HVAD:** At en klient må stå på en lokation er en dato-afgrænset, versioneret kendsgerning (klient × lokation × fra-dato × til-dato) som systemet håndhæver — aldrig en manuel konvention. Aftaler indgås pr. lokation (K-3). Tilladelser oprettes, forlænges og tilbagetrækkes i UI; som daterede ændringer følger de fortrydelses-mekanismen (gældende dato → godkendelse → fortrydelses-periode — §1.7).

- **Struktur (umuligt):** tilladelse uden klient, lokation eller fra-dato · overlappende perioder for samme klient×lokation · destruktiv redigering af historiske perioder · booking af klient uden gyldig tilladelse på datoen (håndhævet i skrivevejen — trin 24 forbruger opslags-fladen).
- **Værdi (UI):** hvilken klient, hvilken lokation, hvilke datoer, forlængelse, tilbagetrækning; fortrydelses-periodens længde pr. ændrings-type.

**Acceptkriterier (slut-effekter):**
1. Tilladelse uden klient, lokation eller fra-dato AFVISES.
2. Overlappende tilladelses-perioder for samme klient×lokation AFVISES.
3. Destruktiv redigering af en historisk periode AFVISES — enhver ændring versioneres; en tilbagetrækning lukker fra en dato og ændrer aldrig fortiden.
4. Opslaget "må klient X stå på lokation Y på dato D?" svarer entydigt — også for historiske datoer.
5. Åben til-dato (indtil videre) er LOVLIG; flere klienter kan have tilladelse på samme lokation samtidig — det AFVISES IKKE.
6. Tilladelses-ændring uden rettighed AFVISES; daterede ændringer får godkendelse + fortrydelses-periode før de træder i kraft.

### K-7 Klassifikation, persondata og anonymisering

**HVAD:** Hver ny data-kolonne i pakken klassificeres (kategori, persondata-niveau, opbevaring) — default er intet (princip 4). Lokationens egne felter er forretningsdata og bevares evigt (§11-grænsen). Gruppens kontaktperson-oplysninger er persondata med sletteregler (§11: samme grænse som kontaktperson på klienten) og skal kunne anonymiseres uden at gruppen eller dens lokationer mistes. Lokationen bærer anonymized_at som doc-låst struktur (§1.12).

- **Struktur (umuligt):** uklassificeret kolonne i leverancen · sletning som anonymiserings-mekanisme (altid UPDATE — rækken består, audit-sporet bevares) · nedgradering af persondata-niveau (direkte → lavere) · implicit persondata/retention uden aktivt valg.
- **Værdi (UI):** klassifikations-valgene pr. felt (persondata-niveau, opbevaring) · hvilke kontakt-felter gruppen har (felt-registry).

**Acceptkriterier (slut-effekter):**
1. Pakken kan IKKE leveres med en uklassificeret kolonne (gaten blokerer).
2. En gruppes kontaktperson kan anonymiseres: person-felterne erstattes, rækken består, lokations-koblinger og audit-spor bevares — sletning AFVISES.
3. Uden aktivt valg er intet felt persondata og intet felt har opbevarings-regel (default = intet).
4. Anonymiserings-dækningen for gruppens kontakt-felter er med i leverancen — ingen persondata-felt uden anonymiserings-vej (intet tavst GDPR-hul). Lokations-anonymisering aktiveres først hvis et lokations-felt aktivt klassificeres som persondata; indtil da er anonymized_at inaktiv struktur.

### K-8 Adgang, audit og fortrydelse (arve-rammen)

**HVAD:** Pakken fødes under fabrikkens regler: al skrivning gennem godkendte, rettigheds-gatede indgange (§1.1) · alle mutationer auditeres med årsag, og audit er urørlig (§1.3) · rettigheder styres i UI via den fælles model — synlighed adskilt fra handling, superadmin eneste hardkodede rolle (§12) · pakken opretter sine sider/faner i rettigheds-træet og sikrer superadmin-dækning i samme leverance; alle øvrige tildelinger er UI-drift.

- **Struktur (umuligt):** direkte tabel-skrivning uden om indgangene · mutation uden årsag · ændret/slettet audit-spor · lokations-særskilt rettigheds-mekanisme uden om den fælles model.
- **Værdi (UI):** hvem har hvilke rettigheder · fortrydelses-perioder pr. ændrings-type.

**Acceptkriterier (slut-effekter):**
1. Enhver skrivning uden om de godkendte indgange AFVISES — uanset brugerens rettigheder.
2. Enhver mutation uden angivet årsag AFVISES.
3. Ændring eller sletning af audit-spor AFVISES.
4. Handling uden fornøden rettighed AFVISES; læsning uden synligheds-rettighed giver ingen data (synlighed ≠ handling).
5. Pakkens sider/handlinger er tildelbare i UI fra dag ét; superadmin er dækket i leverancen.

### K-9 UI-styrbarhed (Mathias-ord 2026-09-02)

**HVAD:** Alle pakkens forretningshandlinger — oprette/redigere lokationer, placements, grupper, tilladelser; status-skift; hvile-styring; klassifikations-valg — kan udføres i UI af rettighedshavere. Skellet er hans: **struktur er hardkodet** (required-felter, forbud — fx at en lokation skal have et navn), **værdier styres i UI** (hvilket navn, hvilken klient, hvilke perioder).

- **Struktur (umuligt):** et forbud eller required-felt der kan slås fra via UI-konfiguration · en forretningshandling der kræver udvikler.
- **Værdi (UI):** alt indhold.

**Acceptkriterier (slut-effekter):**
1. Ingen handling i pakken kræver udvikler-indgreb (migration/deploy) for at blive udført.
2. Ingen handling kræver tekniske privilegier (direkte database-/service-adgang).
3. Et strukturelt forbud (manglende navn, cyklus, overlap, manglende årsag) kan IKKE deaktiveres via UI.

**Scope-ærlighed (bevis-punkt, masterplan-fakta):** Trin 10b er et core-lag-trin; UI-siderne kommer i lag F (tilkobles ved første frontend-side — Appendix B). Acceptkriterierne bevises derfor NU gennem de offentlige indgange UI'en vil kalde 1:1 — den flade er UI'ens maskinrum og er autoritativ (§1.9). **Bevist nu:** hele handlings-fladen kaldbar med rettigheds-gating, audit og alle negativer. **Tilbage til lag F:** selve siderne/formularerne oven på præcis dén flade. Ingen tavs udvanding.

## Plan-fase-afgørelser (bord flyttet synligt — planner afgør i kravets ramme, Codex angriber, plan-OK dækker)

Hierarki-dybde-håndhævelse (K-2) · gruppe-arv på placement (K-2/K-3) · valuta-/enheds-repræsentation og tom-pris-gyldighed (K-1) · felt-registry-udformning for gruppens felter, CVR m.v. (K-3) · seeding-detaljer ud over superadmin (K-8) · fortrydelses-wiring: ændrings-typer og undo-defaults (K-6/K-8) · om dvale-status og hvile-mekanisme er én eller to model-ting (K-4/K-5) · direkte-vs-godkendelses-mekanik pr. handlings-type inden for UI-rammen (K-8).

## Recon-fund-dispositioner

Hvert recon-fund disponeret (behandlet / udskudt / ikke-relevant). Bøtte 1-punkter er fabrikkens og fundamentets eksisterende regler — disposition "behandlet" betyder: kravet føjer sig efter reglen, og punktets AFVISER-adfærd indgår i rammen for acceptkriterierne. "ramme" = bindende bygge-ramme håndhævet af CI/fabrikken (intet selvstændigt K nødvendigt).

| flade_punkt | bøtte | disposition | krav-ref |
| --- | --- | --- | --- |
| config:supabase/config.toml | 1 | behandlet | K-9 (ramme) |
| migration:supabase/migrations/20260514120000_t1_drop_public.sql | 1 | behandlet | K-1 (ramme: placering i identitets-kernen) |
| migration:supabase/migrations/20260514120001_t1_schemas_and_defaults.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260514120002_t1_helpers_stubs.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260514120003_t1_audit_partitioned.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260514120004_t1_cron_skabelon.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260514120005_t1_data_field_definitions.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260514120006_t1_audit_filter_values.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260514120007_t1_bootstrap_admins.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260514120008_t1_classify_trin_1.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260514130000_t2_superadmin_floor.sql | 1 | behandlet | K-5/K-8 |
| migration:supabase/migrations/20260514130001_t2_identity_rpcs.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260514130002_t2_classify.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260514140000_t6_anonymization_tables.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260514140001_t6_anonymization_rpcs.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260514140002_t6_anonymization_crons.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260514140003_t6_classify.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260514150006_t7b_cron_consecutive_failure.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260514160000_t1_inline_fix_audit_non_uuid_id.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260514170003_c001_retention_not_null.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260514170004_c002_c003_anonymization_dispatcher.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260514180000_g028_classify_anonymization_dispatcher_columns.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260514180100_r1b_rename_admin_to_superadmin.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260514180200_h1_has_permission_helper.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260514180300_q1_employee_active_config.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260514180400_d1b_is_permanent_allowed.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260514180500_d1_d2_drop_legal_convert_rows.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260514180600_d1c_validate_permanent_classification.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260514190000_q_seed_permissions.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260514190100_q_audit_rpcs.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260514190200_q_class_anon_rpcs.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260515110000_p0_gdpr_responsible_employee.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260515110100_p1a_anonymization_strategies.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260515110150_p1a_fix_lifecycle_coalesce.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260515110200_p1b_anonymize_generic_apply.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260515110300_p1c_anonymize_employee_wrapper.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260515110350_p1a_fix_strategy_completeness.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260515120000_p2_anonymization_mapping_lifecycle.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260515130000_r7a_regprocedure_callable_fix.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260515130100_r7b_has_permission_can_view_required.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260515130200_r7c_verify_anonymization_consistency_permission.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260515130300_r7d_is_active_status_alignment.sql | 1 | behandlet | K-4 |
| migration:supabase/migrations/20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260518000000_t9_pending_changes.sql | 1 | behandlet | K-6/K-8 |
| migration:supabase/migrations/20260518000001_t9_org_nodes.sql | 1 | behandlet | K-2 |
| migration:supabase/migrations/20260518000002_t9_org_node_closure.sql | 1 | behandlet | K-2 |
| migration:supabase/migrations/20260518000003_t9_employee_node_placements.sql | 1 | behandlet | K-6 (versionerings-mønster) |
| migration:supabase/migrations/20260518000004_t9_client_node_placements.sql | 1 | behandlet | K-6 |
| migration:supabase/migrations/20260518000005_t9_permission_elements.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260518000006_t9_grants_and_helpers.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260518000007_t9_public_wrapper_rpcs.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260518000008_t9_read_rpcs.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260518000009_t9_migrate_role_page_permissions.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260518000010_t9_seed_owners.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260518000011_t9_classify.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260518100000_t9_fundament_supplement.sql | 1 | behandlet | K-6/K-8 |
| migration:supabase/migrations/20260519000000_m1_t9_superadmin_permissions.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260520000000_t9_supplement.sql | 1 | behandlet | K-6/K-8 |
| migration:supabase/migrations/20260521000001_t10_tables.sql | 1 | behandlet | K-1/K-3 |
| migration:supabase/migrations/20260521000002_t10_is_permanent_allowed_extend.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260521000003_t10_classify.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260521000004_t10_audit_filter_values.sql | 1 | behandlet | K-7 |
| migration:supabase/migrations/20260521000005_t10_clients_validate_fields.sql | 1 | behandlet | K-1/K-3 |
| migration:supabase/migrations/20260521000006_t10_seed_permissions.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260521000007_t10_client_node_placements_fk.sql | 1 | behandlet | K-6 |
| migration:supabase/migrations/20260521000008_t10_client_active_check.sql | 1 | behandlet | K-6 |
| migration:supabase/migrations/20260521000009_t10_client_rpcs.sql | 1 | behandlet | K-1/K-3 |
| migration:supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql | 1 | behandlet | K-1/K-3 |
| migration:supabase/migrations/20260521000011_t10_client_logo_rpcs.sql | 1 | ikke-relevant | — ingen billed-flade i kravet (recon-uenighed fastholdt; genåbnes kun ved nyt Mathias-krav) |
| migration:supabase/migrations/20260521000012_t10_client_read_rpcs.sql | 1 | behandlet | K-1/K-3 |
| migration:supabase/migrations/20260521000013_t10_seed_legacy_permissions.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260521000014_t10_remove_legacy_permissions.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260521100000_t9_supplement_2_wrappers_session_var.sql | 1 | behandlet | K-6/K-8 |
| migration:supabase/migrations/20260521100001_t9_supplement_2_grants_fix.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260521100002_t9_supplement_2_superadmin_bypass.sql | 1 | behandlet | K-6/K-8 |
| migration:supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260521100004_t9_supplement_2_approve_helpers.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260521100005_t9_supplement_2_pending_changes_select_policy.sql | 1 | behandlet | K-6/K-8 |
| migration:supabase/migrations/20260521100006_t9_supplement_2_pending_change_approve.sql | 1 | behandlet | K-6/K-8 |
| migration:supabase/migrations/20260521100007_t9_supplement_2_ui_rpcs.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260521100008_t9_supplement_2_read_rpcs_action.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260607100001_core_identity_secdef_permission_action.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260607100002_core_identity_secdef_permission_area.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260607100003_core_identity_secdef_permission_page.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260607100004_core_identity_secdef_permission_tab.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260607110001_core_identity_secdef_pending_change.sql | 1 | behandlet | K-6/K-8 |
| migration:supabase/migrations/20260607110002_core_identity_secdef_role_permission_grant.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260607110003_core_identity_secdef_undo_setting.sql | 1 | behandlet | K-6/K-8 |
| migration:supabase/migrations/20260607110004_core_identity_revoke_authenticated_core_writes.sql | 1 | behandlet | K-8 |
| migration:supabase/migrations/20260610190000_gov4_g061_comment_paritet.sql | 1 | behandlet | K-8 |
| oid:021357f80b6e770bafe9dc63b91d841a0bf636bc:supabase/classification.json | 1 | behandlet | K-7 (ramme) |
| oid:4312d4b59493cd35cad092c17fd9921190747be5:.github/workflows/ci.yml | 1 | behandlet | ramme (K-8/K-9) |
| oid:70d52135782e35327a8392e7e5922f322750279c:scripts/types-gen.sh | 1 | behandlet | ramme (K-8/K-9) |
| oid:b09f79cf83b27b83d00e1575768e90600de83f18:supabase/advisor-baseline.json | 1 | behandlet | ramme (K-8/K-9) |
| oid:d1b4d601ef273e62dbaba42261cc20ba051882c5:scripts/fitness.mjs | 1 | behandlet | ramme (K-8/K-9) |
| oid:e767efb8b392a98102f88dd9008d6d6ad6dfb05f:scripts/run-db-tests.mjs | 1 | behandlet | ramme (K-8/K-9) |
| oid:e79ce6eb985c5994cd320398cb9c23f101db8135:scripts/migration-gate.mjs | 1 | behandlet | K-7 (ramme) |
| oid:ecc23f9767347a90cf0bdee677bebec84c36efbf:scripts/schema-check.sh | 1 | behandlet | ramme (K-8/K-9) |
| oid:f3012195132643a4f6740884b0723e3487fb07a0:scripts/governance-check.mjs | 1 | behandlet | ramme (K-8/K-9) |
| rls_enabled:core_compliance.anonymization_mappings | 1 | behandlet | K-7 |
| rls_enabled:core_compliance.anonymization_state | 1 | behandlet | K-7 |
| rls_enabled:core_compliance.anonymization_strategies | 1 | behandlet | K-7 |
| rls_enabled:core_compliance.audit_log | 1 | behandlet | K-8 |
| rls_enabled:core_compliance.cron_heartbeats | 1 | behandlet | K-8 |
| rls_enabled:core_compliance.data_field_definitions | 1 | behandlet | K-7 |
| rls_enabled:core_compliance.superadmin_settings | 1 | behandlet | K-5/K-8 |
| rls_enabled:core_identity.client_field_definitions | 1 | behandlet | K-1/K-3 |
| rls_enabled:core_identity.client_node_placements | 1 | behandlet | K-6 |
| rls_enabled:core_identity.clients | 1 | behandlet | K-1/K-3 |
| rls_enabled:core_identity.employee_active_config | 1 | behandlet | K-8 |
| rls_enabled:core_identity.employee_node_placements | 1 | behandlet | K-6 (versionerings-mønster) |
| rls_enabled:core_identity.employees | 1 | behandlet | K-8 |
| rls_enabled:core_identity.org_node_closure | 1 | behandlet | K-2 |
| rls_enabled:core_identity.org_node_versions | 1 | behandlet | K-2 |
| rls_enabled:core_identity.org_nodes | 1 | behandlet | K-2 |
| rls_enabled:core_identity.pending_changes | 1 | behandlet | K-6/K-8 |
| rls_enabled:core_identity.permission_actions | 1 | behandlet | K-8 |
| rls_enabled:core_identity.permission_areas | 1 | behandlet | K-8 |
| rls_enabled:core_identity.permission_pages | 1 | behandlet | K-8 |
| rls_enabled:core_identity.permission_tabs | 1 | behandlet | K-8 |
| rls_enabled:core_identity.role_page_permissions | 1 | behandlet | K-8 |
| rls_enabled:core_identity.role_permission_grants | 1 | behandlet | K-8 |
| rls_enabled:core_identity.roles | 1 | behandlet | K-8 |
| rls_enabled:core_identity.undo_settings | 1 | behandlet | K-6/K-8 |
| rls_policy:core_compliance.anonymization_mappings:anonymization_mappings_insert | 1 | behandlet | K-7 |
| rls_policy:core_compliance.anonymization_mappings:anonymization_mappings_select | 1 | behandlet | K-7 |
| rls_policy:core_compliance.anonymization_mappings:anonymization_mappings_update | 1 | behandlet | K-7 |
| rls_policy:core_compliance.anonymization_strategies:strategies_delete | 1 | behandlet | K-7 |
| rls_policy:core_compliance.anonymization_strategies:strategies_insert | 1 | behandlet | K-7 |
| rls_policy:core_compliance.anonymization_strategies:strategies_select | 1 | behandlet | K-7 |
| rls_policy:core_compliance.anonymization_strategies:strategies_update | 1 | behandlet | K-7 |
| rls_policy:core_compliance.data_field_definitions:data_field_definitions_delete | 1 | behandlet | K-7 |
| rls_policy:core_compliance.data_field_definitions:data_field_definitions_insert | 1 | behandlet | K-7 |
| rls_policy:core_compliance.data_field_definitions:data_field_definitions_select | 1 | behandlet | K-7 |
| rls_policy:core_compliance.data_field_definitions:data_field_definitions_update | 1 | behandlet | K-7 |
| rls_policy:core_compliance.superadmin_settings:superadmin_settings_select | 1 | behandlet | K-5/K-8 |
| rls_policy:core_compliance.superadmin_settings:superadmin_settings_update | 1 | behandlet | K-5/K-8 |
| rls_policy:core_identity.client_field_definitions:client_field_definitions_insert | 1 | behandlet | K-1/K-3 |
| rls_policy:core_identity.client_field_definitions:client_field_definitions_select | 1 | behandlet | K-1/K-3 |
| rls_policy:core_identity.client_field_definitions:client_field_definitions_update | 1 | behandlet | K-1/K-3 |
| rls_policy:core_identity.client_node_placements:client_node_placements_select | 1 | behandlet | K-6 |
| rls_policy:core_identity.clients:clients_insert | 1 | behandlet | K-1/K-3 |
| rls_policy:core_identity.clients:clients_select | 1 | behandlet | K-1/K-3 |
| rls_policy:core_identity.clients:clients_update | 1 | behandlet | K-1/K-3 |
| rls_policy:core_identity.employee_active_config:employee_active_config_select | 1 | behandlet | K-8 |
| rls_policy:core_identity.employee_active_config:employee_active_config_update | 1 | behandlet | K-8 |
| rls_policy:core_identity.employee_node_placements:employee_node_placements_select | 1 | behandlet | K-6 (versionerings-mønster) |
| rls_policy:core_identity.employees:employees_insert | 1 | behandlet | K-8 |
| rls_policy:core_identity.employees:employees_select | 1 | behandlet | K-8 |
| rls_policy:core_identity.employees:employees_update | 1 | behandlet | K-8 |
| rls_policy:core_identity.org_node_closure:org_node_closure_select | 1 | behandlet | K-2 |
| rls_policy:core_identity.org_node_versions:org_node_versions_select | 1 | behandlet | K-2 |
| rls_policy:core_identity.org_nodes:org_nodes_select | 1 | behandlet | K-2 |
| rls_policy:core_identity.pending_changes:pending_changes_insert | 1 | behandlet | K-6/K-8 |
| rls_policy:core_identity.pending_changes:pending_changes_select | 1 | behandlet | K-6/K-8 |
| rls_policy:core_identity.pending_changes:pending_changes_update | 1 | behandlet | K-6/K-8 |
| rls_policy:core_identity.permission_actions:permission_actions_insert | 1 | behandlet | K-8 |
| rls_policy:core_identity.permission_actions:permission_actions_select | 1 | behandlet | K-8 |
| rls_policy:core_identity.permission_actions:permission_actions_update | 1 | behandlet | K-8 |
| rls_policy:core_identity.permission_areas:permission_areas_insert | 1 | behandlet | K-8 |
| rls_policy:core_identity.permission_areas:permission_areas_select | 1 | behandlet | K-8 |
| rls_policy:core_identity.permission_areas:permission_areas_update | 1 | behandlet | K-8 |
| rls_policy:core_identity.permission_pages:permission_pages_insert | 1 | behandlet | K-8 |
| rls_policy:core_identity.permission_pages:permission_pages_select | 1 | behandlet | K-8 |
| rls_policy:core_identity.permission_pages:permission_pages_update | 1 | behandlet | K-8 |
| rls_policy:core_identity.permission_tabs:permission_tabs_insert | 1 | behandlet | K-8 |
| rls_policy:core_identity.permission_tabs:permission_tabs_select | 1 | behandlet | K-8 |
| rls_policy:core_identity.permission_tabs:permission_tabs_update | 1 | behandlet | K-8 |
| rls_policy:core_identity.role_page_permissions:role_page_permissions_delete | 1 | behandlet | K-8 |
| rls_policy:core_identity.role_page_permissions:role_page_permissions_insert | 1 | behandlet | K-8 |
| rls_policy:core_identity.role_page_permissions:role_page_permissions_select | 1 | behandlet | K-8 |
| rls_policy:core_identity.role_page_permissions:role_page_permissions_update | 1 | behandlet | K-8 |
| rls_policy:core_identity.role_permission_grants:role_permission_grants_delete | 1 | behandlet | K-8 |
| rls_policy:core_identity.role_permission_grants:role_permission_grants_insert | 1 | behandlet | K-8 |
| rls_policy:core_identity.role_permission_grants:role_permission_grants_select | 1 | behandlet | K-8 |
| rls_policy:core_identity.role_permission_grants:role_permission_grants_update | 1 | behandlet | K-8 |
| rls_policy:core_identity.roles:roles_delete | 1 | behandlet | K-8 |
| rls_policy:core_identity.roles:roles_insert | 1 | behandlet | K-8 |
| rls_policy:core_identity.roles:roles_select | 1 | behandlet | K-8 |
| rls_policy:core_identity.roles:roles_update | 1 | behandlet | K-8 |
| rls_policy:core_identity.undo_settings:undo_settings_insert | 1 | behandlet | K-6/K-8 |
| rls_policy:core_identity.undo_settings:undo_settings_select | 1 | behandlet | K-6/K-8 |
| rls_policy:core_identity.undo_settings:undo_settings_update | 1 | behandlet | K-6/K-8 |
| doc:docs/strategi/forretningsforstaaelse.md#12:rettigheder-form | 2 | behandlet | K-8 |
| doc:docs/strategi/forretningsforstaaelse.md#14-fm-grenen:klient-tilladelses-kontrol | 2 | behandlet | K-6 |
| doc:docs/strategi/forretningsforstaaelse.md#14-fm-grenen:lokation-som-master-data | 2 | behandlet | K-1 |
| doc:docs/strategi/forretningsforstaaelse.md#15+master-plan-0.5:migration | 2 | udskudt | — Mathias 2026-09-02: "dette importeres senere" (se IKKE i scope) |
| doc:docs/strategi/stork-2-0-master-plan.md#1.12+appendix-a-fm:cooldown-pr-lokation | 2 | behandlet | K-5 |
| doc:docs/strategi/stork-2-0-master-plan.md#1.12:klient-tilladelser-form | 2 | behandlet | K-6 |
| doc:docs/strategi/stork-2-0-master-plan.md#1.12:leverandoerer | 2 | behandlet | K-3 |
| doc:docs/strategi/stork-2-0-master-plan.md#1.12:lokations-entitet-felter | 2 | behandlet | K-1 |
| doc:docs/strategi/stork-2-0-master-plan.md#1.12:placement-hierarki-og-pris-arv | 2 | behandlet | K-2 |
| doc:docs/strategi/stork-2-0-master-plan.md#1.12:status-livscyklus | 2 | behandlet | K-4 |
| doc:docs/strategi/stork-2-0-master-plan.md#1.1:adgangs-moenster | 2 | behandlet | K-8 |
| doc:docs/strategi/stork-2-0-master-plan.md#1.2:klassifikations-pligt | 2 | behandlet | K-7 |
| doc:docs/strategi/stork-2-0-master-plan.md#1.3:audit-pligt | 2 | behandlet | K-8 |
| doc:docs/strategi/stork-2-0-master-plan.md#1.4:anonymisering-af-lokation | 2 | behandlet | K-7 |
| doc:docs/strategi/stork-2-0-master-plan.md#1.8:klient-reference-kontrast | 2 | behandlet | K-3/K-6 |
| doc:docs/strategi/stork-2-0-master-plan.md#2.7.1:attribution-ikke-via-lokation | 2 | behandlet | K-1 |
| doc:docs/strategi/stork-2-0-master-plan.md#2.7.8:markeder-messer-ingen-saermodel | 2 | behandlet | K-1 |
| doc:docs/strategi/stork-2-0-master-plan.md#2.7:nedstroems-baereevne | 2 | behandlet | K-1/K-3/K-4/K-5/K-6 (bæreevne) |
| doc:docs/strategi/stork-2-0-master-plan.md#4-trin-10b:scope-og-schema | 2 | behandlet | K-1 + IKKE i scope |
| doc:docs/strategi/stork-2-0-master-plan.md#appendix-a-fm:alt-med | 2 | behandlet | alle K (fuldt 10b-scope leveret; kun migration udskudt på Mathias-ord) |
| doc:docs/strategi/vision-og-principper.md#princip-3:forretningslogik-som-data | 2 | behandlet | K-9 |
| doc:docs/strategi/vision-og-principper.md#princip-9:status-bevarer-historik | 2 | behandlet | K-4/K-6 |
| intet-data:anonymiserings-infrastruktur-udvidelse | 3 | behandlet | K-7 (gruppe-kontakt dækket i leverancen; lokations-anonymisering aktiveres først ved aktivt PII-valg) |
| intet-data:cooldown-forretnings-semantik | 3 | behandlet | K-5 (Mathias-svar; annullering + niveau → trin 24) |
| intet-data:hierarki-dybde-og-placement-regler | 3 | behandlet | K-2 (dybde/arv → plan-fase, synligt flyttet) |
| intet-data:klient-tilladelse-kommerciel-betydning | 3 | behandlet | K-6 (Mathias-svar: pr. lokation; gruppe ejer — K-3) |
| intet-data:konfig-lifecycle-for-cooldown | 3 | behandlet | K-5 (princip 5: livscyklus gælder konfigurationen) |
| intet-data:leverandoer-entitetens-fulde-indhold | 3 | behandlet | K-3 (felter = UI-felt-registry; rabataftale → trin 29) |
| intet-data:lokations-pii-og-retention | 3 | behandlet | K-7 (§11-grænsen: lokations-felter = forretningsdata; gruppe-kontakt = persondata) |
| intet-data:lokations-status-enum-og-semantik | 3 | behandlet | K-4 (Mathias-svar: aktiv·dvale·nedlagt; genåbning mulig) |
| intet-data:migration-relevans-lokationer | 3 | udskudt | — Mathias 2026-09-02: "dette importeres senere" |
| intet-data:permissions-konkrete-tildelinger | 3 | behandlet | K-8 (sider + superadmin i leverancen; tildelinger = UI-drift) |
| intet-data:pris-semantik | 3 | behandlet | K-1 (informativ, frys-ved-brug nedstrøms; valuta/tom-pris → plan-fase) |


**Usikkerheds-dispositioner (recon'ens HALT-flag):** config-fladens live-eksponering → bygge-ramme, verificeres live af fabrikken (ingen krav-konsekvens) · pending-vs-direkte skrivevej → afgjort som ramme i K-6/K-8 (daterede ændringer = fortrydelses-mekanisme; stamdata = direkte m. audit); mekanik pr. handlings-type → plan-fase-listen · apply-handler-dybden i t9_supplement → recon-2's bord (plan-føde, ikke krav) · break-glass-fladens under-scope → lukket: Mathias afviste fravigelse (K-5 — reglen er absolut; flade_filterets break-glass-udelukkelse er konsistent) · public-æra-punkter → død historik (droppet i fundamentet) · CI-token → fail-closed, aldrig falsk-grøn (ramme) · re-bind-provenance (2 stk.) → registreret; alle evidens-OID'er gyldige · logo-punkt-uenighed → disponeret ikke-relevant i tabellen · Codex' filter-scope-noter → registreret (fitness/migration-gate disponeret som ramme) · rettelse-17-nummereringen i Appendix C → flag til plan-vedligehold, ingen pakke-handling · claude-ai's 12 intet-data-flag → alle disponeret via bøtte 3-rækkerne ovenfor · "aktiv lokation"-flertydigheden → lukket af Mathias' status-svar (kun tilstanden aktiv er bookbar) · leverandør-status-spørgsmålet → K-3 acceptkriterie 5 (livscyklus, aldrig sletning).

## IKKE i scope

- **Bookinger, assignments, hotel, køretøj, leverandør-fakturering (trin 24-29):** skabelonen BÆRER dem — leverer aktiv-pr.-dato-opslag, tilladelses-opslag pr. dato, hvile-konfig og gruppe-type som forbrugsflader — men bygger dem ikke.
- **Rabataftale-trapper + undtagelses-tabel (trin 29):** gruppens type-felt leveres som opslags-anker; mekanikken bygges i trin 29.
- **UI-sider/formularer (lag F):** se K-9's bevis-punkt — handlings-fladen bevises nu, siderne kommer ved første frontend-side.
- **Migration af 1.0-data:** UDSKUDT på Mathias' ord 2026-09-02 ("dette importeres senere"). Det idempotente import-mønster gør senere import mulig uden om-design; ingen udtræks-leverance i denne pakke.
- **Annullerede bookingers hvile-effekt + hvile-evalueringsniveau (placement vs. top-lokation):** trin 24 — noteret som nedstrøms-afhængighed i K-5.
- **Attribution/økonomi via lokation:** forbudt (K-1) — ikke en udskydelse, en grænse.

## Holdt mod låste docs

Kæden vision/forretning ⊨ krav er holdt mod: **vision-og-principper.md** (vision: UI-styring, holdbarhed; bærende princip 1 én sandhed, 2 styr på data, 3 eksplicit sammenkobling/FK; operationelt princip 3 forretningslogik som data, 4 default = intet, 5 livscyklus for konfiguration, 6 audit på alt, 7 anonymisering bevarer audit, 9 status bevarer historik) · **forretningsforstaaelse.md** (§2 dato-snapshot, §3 attribution via klient, §9 algoritme/værdi-adskillelse, §11 persondata-grænsen entitet/felter, §12 rettigheder og adgang, §14 FM-grenen: lokation som master-data + tilladelses-kontrol, §15 greenfield/migration som separat beslutning) · **stork-2-0-master-plan.md** (§0.5 migrations-mekanik, §1.1-§1.4 adgang/klassifikation/audit/anonymisering, §1.8 klient-kontrast, §1.11 schema-placering, §1.12 lokations-skabelonen [anker], §2.7.1/§2.7.6/§2.7.8 nedstrøms-forbrugere, §4 trin 10b [anker], Appendix A FM-domænet [cooldown pr. lokation, alt-med, markeder/messer], Appendix B [lokations-status afgjort her ved trin 10b]).

**Mathias-ord i denne krav-fase (2026-09-02, alle indarbejdet):** UI-styrings-kravet · struktur/værdi-skellet · status `aktiv · dvale · nedlagt`, kun aktiv bookbar · tilladelser i dvale lovlige (booket dato efter dvalens ophør) · hvile-reglen absolut, perioden kan stoppes i UI · aftaler pr. lokation, gruppen ejer lokationen · nedlagt kan genåbnes · migration importeres senere · fremlæggelses-pligten før ok.

**Ingen modsigelse mod låste docs fundet.** Ét vedligeholds-flag (ikke pakke-relevant): §1.12's kilde-henvisning "rettelse 17" for cooldown-afgørelsen matcher ikke Appendix C's nummerering — substansen er låst i Appendix A; henvisningen bør rettes ved plan-vedligehold.
