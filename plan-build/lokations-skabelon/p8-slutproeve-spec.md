# P-8 (M-35) — slutprøve-spec før plan-lås: lokations-skabelon

Dato: 2026-09-08 · rolle: Codex/P-8 · repo-pin: `ae73d833b0c18d6474c93292d1c6a63e44aac1cf`.

**Leverance:** en angribelig kontrakt for Fase 5's dataudvælgelse og slutprøve. Dette er ikke en udført slutprøve, build-godkendelse eller plan-lås. Ingen live-data er hentet, og web er ikke brugt. Regler, generatorer, forventninger og planvalg skal bindes før build; konkrete kilderækker, værdier og kørselsrækkefølge fastlægges af CI efter det godkendte build. [W §2.C, Fase 3 pkt. 3a2, Fase 5]

## 0. Kildebinding og læseregel

Alle nedenstående blobs er verificeret som filindhold ved repo-pinnen. `9402164d` er et **blob-OID**, ikke et commit. Henvisningen `[K K-6/ac9]` betyder præcis det afsnit i K-blobbens bytes; tilsvarende gælder R, B, W, T og V. Links er læsehjælp; OID og afsnit er den bindende reference. K har forrang for recon-forslag og mutationsfrø.

| Ref. | Fil | Fuld blob-OID | Brug |
| --- | --- | --- | --- |
| K | [krav](docs/sandhed/krav/lokations-skabelon-krav.md) | `9402164d87a35fb939661058bea77c1a052493d0` | K-1..K-9, acceptkriterier, scope og planmandat |
| R | [recon2](plan-build/lokations-skabelon/recon2.md) | `2bdbb122158b6f8c72fc942b8de28e679742b4aa` | Begge aktørers testveje; især recon-Codex R2-K1..R2-K9, R2-PLAN/P01..P14 og R2-TEST |
| B | [mutationsbilag](recon/recon-2-bilag.md) | `6e569779353ea1d0a2bf747ce6eda6509de1aea0` | Frø identificeret nedenfor ved fil-/policy-nøgle; bilaget er ikke krav-føde |
| W | [workflow-plan](docs/workflow-faerdiggoerelse/workflow-implementeringsplan.md) | `268977c7bc48c6f8f00b56ed3cba6de55fc25d88` | §2.C og Fase 3/5: anti-tailoring, P-8, alle K, reel effekt |
| T | [SQL-runner](scripts/run-db-tests.mjs) | `e767efb8b392a98102f88dd9008d6d6ad6dfb05f` | `runQuery`, `main`: én SQL-query pr. fil, fail-fast, nul-filer-gren |
| V | [proof-router](scripts/v5/proofs.mjs) | `c847557e26d2b0045a4fd394372c4e32c1fe006f` | `makeProofVerifier`, `case "chain-proof"`: endnu ikke implementeret, afviser |

De normative detaljer nedenfor er **P-8's foreslåede prøvekrav**, hvor de ikke allerede følger af K/W. De er ikke påstande om eksisterende mekanik. R's aktører er bl.a. uenige om, hvor tæt gamle mønstre kan kopieres. Slutprøven kræver derfor observerbar effekt: audit alene beviser ikke historisk prisopslag, gamle app-DML-grants må ikke kopieres, og eksisterende generic-anonymisering beviser ikke JSONB-/replay-dækning. [R recon-Code K-1/K-7; recon-Codex R2-K1/K7/K8]

### Det planen skal binde før lås

Planen skal optage denne fils **committede blob-OID** samt en konkret matrix `K/ac → bid-ID → chain-step → offentlig signatur → observation → negativ → mutant`. Pakkens bids/signaturer findes ikke i dette input; navnene i §4 er derfor forretningshandlinger, ikke opdigtede RPC'er. Bid-ID'er og signaturer skal være udfyldt før plan-lås, og intet K/ac må mangle.

Følgende planparametre skal have ét forventet udfald før build: gruppe/leverandør-identitet og typer; prisformat/enhed og NULL/0; mindste-stand-mekanik; dateret ejer-/pris-/statusmodel og intervalkanter; hviledagenes grænser og stop/udløb; fravalgs overlevelse ved genåbning; lokale fravalg på nedlagt; fast/udvidelig feltliste, lagring og anonymiserings-/replayvej; række-synlighedens faktiske kobling til org-data; action-/approval-/undo-wiring og perioder. Ingen af disse udfald må vælges ud fra, hvad buildet tilfældigvis gør. [K »Plan-fase-afgørelser«; R R2-PLAN/P01..P14]

## 1. DATA-UDVÆLGELSE

### 1.1 Hvad »reel« betyder her

Der er ingen eksisterende lokationsdata i den greenfield-pakke, brugeren har beskrevet. Slutprøvens datagrundlag er derfor:

1. Eksisterende klienter, org-data og employees med deres faktiske koblinger, historik og rettighedskonfiguration, hentet fra den før plan-lås udpegede driftskilde **efter build**. Kildens systemidentitet og scope bindes nu; tidspunkt, rækker og digest bindes af CI senere.
2. Grupper, lokationer, stande, klienttilladelser, status-/pris-historik, pending-rækker og audit, som **det byggede produkt selv skaber** gennem sine offentlige indgange under denne slutprøve mod en virkelig database. IDs fra step N bruges i step N+1.
3. Genererede ugyldige input og kontrollerede konfigurations-/kodemutanter, eksplicit mærket `canary`/`mutant`. De tæller aldrig som eksisterende reel kildedata.

En gammel smoke-fixture, seed-kopi eller forudfyldt sluttilstand må ikke substituere punkt 1 eller 2. SQL-fixtureformen i recon er et teknisk forbillede; W's slutkrav tillader ikke at omdøbe fixtures til held-out data. [W §2.C, Fase 5; R R2-TEST]

### 1.2 Kildepopulation og fuldstændighed

CI's særskilte udtrækker læser et transaktionskonsistent snapshot fra den bundne kilde med læserettigheder, der ikke afhænger af pakkens SELECT/RPC-filtre. Udtrækket går til et isoleret CI-miljø; slutprøven ændrer ikke driftskilden eller dens brugere. Alle nedenstående rækker tælles før anonymisering. Store populationer deles i deterministiske shards; der er ingen top-N-grænse eller lydløs timeout-afkortning.

»Bundet scope« er hele den eksisterende datakilde, pakkens klient-/org-/employee-koblinger faktisk skal bruge. Kun en allerede eksisterende, dokumenteret system-/tenantgrænse kan afgrænse den; en sådan grænse må ikke opfindes her. Ad hoc udvalg af bestemte klienter, teams, navne, datoer eller »testvenlige« afdelinger er forbudt, også når filteret foreslås før build. En kilde med flere relevante systemgrænser skal afstemmes mod dem alle, så selve kildevalget ikke bliver et skjult rækkefilter.

| Population | Udtræksregel | Egenskaber der bevares og udøves |
| --- | --- | --- |
| `core_identity.clients` | **Alle rækker** i kildens på forhånd bundne scope, også inaktive og rækker uden org-placering. Ingen filtrering på navn, felternes gyldighed, logo, aktualitet eller tidligere testresultat. | `is_active`; tomme/udfyldte `fields`; NULL/JSON-null; ukendte og udfasede nøgler; kontaktfelter; navn-/værdi-form; eksisterende relationer. |
| `org_nodes` + `org_node_versions` | **Alle identiteter og alle versioner**, også lukkede, fremtidige og identiteter uden aktuel version eller placering. | Rod, department, team, tomme grene, søskende, dybeste gren, parent-skift, navnelighed, aktiv/inaktiv og alle intervalgrænser. |
| `client_node_placements` | **Alle historiske, aktuelle og fremtidige placeringer** for kildepopulationen; ingen `effective_to IS NULL`-begrænsning. | Klient uden placering, åben/lukket placering, skift mellem grene og datoens org-tilhør. |
| `employees` + `employee_node_placements` | **Alle employees og alle deres placeringer**, også uden `auth_user_id`, uden rolle/placering, fratrådte og anonymiserede. | Login-mappingens tilstedeværelse, aktiv-reglens faktiske input, rolle, placering og synlighed på datoen. Intet filter gennem `current_employee_id()` eller »kan logge ind«. |
| Afhængigheder | Referentiel lukning for roller, grants, permission area/page/tab/action, legacy-grants, `employee_active_config`, relevante klassifikationer/feltdefinitioner og nødvendige pending-/undo-/anonymiseringsmetadata. Alle definitioner for indlæste felter, også inaktive. | Ingen forældreløse referencer frembragt af udtrækket; ingen fjernelse af en vanskelig grant eller udfaset PII-definition. Org-closure indlæses som observeret afledning og kontrolleres mod versioner; den erstatter dem ikke. |

Tabelnavnene og forskellen mellem org-identitet/versioner, klientplacering og fysisk stand følger R. **En org-node er ikke ejergruppen; `client_node_placements` er ikke klientens standbooking.** Kildens inaktive klientregler må ikke ved analogi gøres til nye K-regler. Planen skal binde forventningen ved sådanne input; uden bundet forventning kan prøven ikke være grøn. [R R2-K2/K3/K6/K8, E018/E041/E045/E061/E070/E127..E129]

Udtrækket omfatter kun den deklarerede projektion. Auth-hemmeligheder, password-hashes, tokens, sessions og logo-binary hentes ikke; logoets tilstedeværelse/form kan registreres uden billedindhold, da billedfladen er disponeret uden for kravet. Rækken må stadig ikke udelades. Andre felter, der udelades, skal navngives med før-build-begrundelse i projektionen og tælles; »følsom« må ikke bruges til at fjerne en hel problemrække. [K »Recon-fund-dispositioner«, `20260521000011_t10_client_logo_rpcs.sql`]

### 1.3 Seed, rangering og anvendelse

CI registrerer først accepteret `build_oid`, build-artefakt-digest og `build_proof_digest`. Herefter opretter en betroet CI-jobidentitet et `run_id` og en frisk hemmelig nøgle `k_run`. Det bindes i en signeret attest, før kildeudtrækket starter:

```text
seed = HMAC-SHA256(k_run, canonical(["P8-selection-v1", run_id,
                                  build_oid, build_proof_digest, spec_blob_oid]))
rank(kind, source_pk, purpose) = HMAC-SHA256(seed,
                                  canonical([kind, source_pk, purpose]))
```

`canonical` er en versionsbundet, typebevarende encoding med entydig længde/afgrænsning. Rangering er stigende bytes, med kanonisk PK som tie-break. `k_run` opstår efter build; run-id alene er ikke uforudsigelighed. Builderen kan hverken vælge run-id, nøgle, kildeversion eller genkøre indtil et bekvemt udvalg opstår. Replay anvender samme snapshot/seed. Infrastruktur-retries bevarer populationen; et nyt snapshot er et nyt attesteret forsøg, og det tidligere røde/afbrudte forsøg forbliver synligt. Ændret kode kræver nyt build-proof og nyt held-out forsøg. [P-8 konkretisering af W §2.C]

**Rangeringen vælger roller og rækkefølge, ikke hvilke svære rækker der forsvinder:**

- Hver eksisterende klient er fokusklient i mindst ét fuldt §4-forløb. C1 er fokusklienten; C2 og C3 vælges som de første forskellige klienter efter `rank(..., chain_id)`. C1/C2 får gruppe G; C3 får H og er først uden for G. En kildeklient som efter den låste kontrakt ikke må kobles på, skal ramme netop den begrundede afvisning og data-bevaring, ikke bortfiltreres. Mindst ét fuldt positivt forløb med to reelt udtrukne, lovligt koblingsbare klienter og en tredje reel outsider er påkrævet.
- Hver org-node indgår i en kontrolleret dato-/rettighedskontekst. CI finder fra **kildens versioner** alle observerede typer, dybder og søskende-/forfaderrelationer og rangerer vidner inden for dem. Klienter og employees fra samme gren og fra en anden gren parres. Noder uden beboere bliver eksplicitte tom-kontekst-prøver; der opfindes ikke historiske placeringer for dem.
- Hver employee afprøves med den importerede identitets-/aktiv-/rolletilstand mod pakkens offentlige læse- og handlingsflade. Manglende auth-mapping får et eksplicit ingen-medarbejder-match-negativ; den må ikke få en kunstig gyldig login-mapping i den uændrede kildeprøve. Fratrædelses-/anonymiseringsgrænser udøves efter den bundne aktiv-konfiguration.
- Der køres derudover kontrollerede rettighedsprofiler på isolerede kopier: anon; authenticated uden employee; employee uden grant; kun view; tab-write uden action-grant; action uden nødvendig tab-write; legitim non-admin-handler; særskilt godkender; superadmin. Kopiernes ændringer sker gennem de fælles offentlige rettighedsindgange efter import og logges som `rights_overlay`. De erstatter ikke prøven med den reelle rolle. Transporten bruger kun CI-identiteter; ingen virkelige medarbejdercredentials.
- Hver ikke-tom risikoklasse får et separat fuldt forløb med det først rangerede vidne: inaktiv klient; ingen placering; historisk grenskift; fremtidig version; udfaset/ukendt JSONB-nøgle; NULL/tom værdi; direkte/indirekte personfelt; dybeste org-gren; søskende-scope; hver observeret grant-/aktiv-kombination. Hvor fokusrollen lovligt afvises, fortsætter den positive kæde med den i manifestet allerede fastlagte lovlige kontrolklient; afvisningen skal stadig lykkes som negativ.
- Hver af de fem lokationstyper oprettes i hvert positivt forløb og udøves med samme status-, prisarvs- og tilladelsesregler. Værdier genereres efter build fra seed inden for planens låste domæner. Dato-prøver omfatter hver indlæst versions-/placeringsgrænse `b`: `b−1 dag`, `b`, `b+1 dag`, samt current_date og slutprøvens egne skift. Endelig tidsgranularitet følger planen; der gættes ikke på intradag-semantik.

Om en kildeklient kan bære et positivt koblingsforløb beregnes fra kilderækken og **planens uafhængige forventningsregel**, aldrig ved at prøve produktet og beholde de klienter, der lykkes. C2/C3's rangbestemte forsøg skal også registreres, hvis de lovligt afvises; de første rangerede lovlige kontrolklienter fastlægges i samme manifest før kørsel. En overraskende afvisning er rød, ikke anledning til at vælge næste klient. Nye pakkeobjekter og `rights_overlay` får særskilt provenance, så §1.4's optælling vedrører den uændrede import før disse tilsigtede tilføjelser.

Der foretages en separat breddeprøve af paginerede offentlige lister: hvert forventet synligt ID skal kunne genfindes præcis én gang, også ud over API'ets sidegrænse. Udtrækkerens kildeoptælling må ikke være resultatet af samme liste-RPC, som testes. `max_rows` og SQL-kørsel med kun JWT er konkrete faldgruber i R. [R R2-K8/K9 og R2-TEST]

### 1.4 Anti-cherry-pick-invarianten

For hver krævet kildetabel/projektion, inklusive afhængighedsrækker, defineres `U` som alle rækker i det bundne kildesnapshot. CI skal maskinelt verificere:

```text
source_count(U) = extracted_count(U) = transformed_count(U) = loaded_count(U)
source_keyset(U) ↔ transformed_keyset(U)             # kontrolleret bijektion
required_witnesses(U, spec, plan) = executed_witnesses # ingen manglende witness-ID'er
source_edges(U) ↔ transformed_edges(U)               # FK/lighed/dato bevaret
unexpected_filter = 0; unaccounted_rows = 0; skipped = 0
```

Hver rod-række har et witness-ID med faktisk input, forventet udfald og observeret effekt; støtte-rækker har dependency-ID og mindst ét anvendelses-/integritetsbevis. `required_witnesses` beregnes **før** produktkørslen fra snapshot og den låste spec, ikke fra tests der tilfældigvis blev udført. Der gemmes også optællinger for de vanskelige egenskaber før/efter transformation. Filtrering af inaktive, fejlende, lange, gamle, uplacerede eller følsomme rækker bryder invarianten. En forventet afvisning tæller kun, når den konkrete årsag og uændret tilstand er observeret; »ikke brugbar« er ikke et udfald.

En tom observeret risikoklasse markeres `absent_in_source` med kildeoptælling 0, aldrig som PASS for reel dækning. Dens påkrævede negativ laves stadig generativt. Mangler minimum til en reel positiv kæde, en faktisk org-kontekst eller en reel employee til rettighedskørslen, er resultatet **DATA-UTILSTRÆKKELIG / gate kan ikke åbne**. Syntetiske data eller en ny, bekvemmere kilde må ikke gøre det grønt. Alle obligatoriske positive rettighedsprofiler skal kunne etableres og køres i CI-kopien; ellers er kæden ufuldført.

Denne invariant forhindrer række-frasortering inden for den låste population; den beviser ikke alle kombinationer af alle rækker. Den afgrænsning er synlig: hele populationen berøres, risikoklasser og dato-kanter er obligatoriske, og §4's metamorfiske/samtidige prøver angriber kombinationsfejl. En ændring af scope/projektion eller af disse regler kræver ny reviewbar spec-/planbinding før et nyt build.

## 2. ANONYMISERING OG DIGEST-KÆDE

### 2.1 Følsomhed og bevaringskrav i prøvematerialet

| Indhold | Behandling i CI-snapshot og bevis |
| --- | --- |
| Employees: navn, mail, auth-reference, ansættelses-/fratrædelsesdatoer, anonymiseringsstatus, roller og org-historik | Navne/mail/identiteter erstattes konsistent; auth-reference oversættes til isoleret testidentitet, mens NULL og manglende login-match bevares. Datoer/rolle- og org-relationer er fortsat følsomme og holdes i et lukket snapshot. Ingen tokens/passwords eksporteres. |
| Klienters og gruppers kontaktpersoner, fritekst, dynamiske `fields`, JSONB-nøgler og gamle/inaktive feltdefinitioner | Værdier gennemgås feltvis, også ukendte og udfasede keys. Fritekst behandles som potentielt følsom. Ukendt nøgle bevares som ukendt nøgle med samme relation til registry; anonymisering må ikke »reparere« data. |
| Lokations-/gruppenavne og adresser, især enkelt-butikker; org-navne; indirekte kombinationer | Erstattes i distribuerbare data. Formklasser som tomhed, længde, Unicode/whitespace, lighed og NULL bevares. Adresser behandles konservativt som potentielt personhenførbare. Dette er CI-transportbeskyttelse, ikke et implicit produktvalg af `pii_level`. |
| Audit `old_values/new_values`, pending-payloads, årsager, runtime-fejl, snapshots og replay-state | Beskyttes som de oprindelige værdier. Fejl/logs må ikke udskrive rå rækker, kontaktdata, auth-claims eller SQL-parametre. Testårsager er genererede labels. Felters faktiske beskyttelse kontrolleres inde i det lukkede miljø før logredaktion. |

K kræver aktivt klassifikationsvalg og default intet, UPDATE-anonymisering med bevarede rækker samt ingen personfelt uden udførende vej. Lokationens `anonymized_at` er inaktiv struktur indtil aktiv PII-klassifikation. Disse produktregler ændres ikke af, at CI beskytter hele transporten konservativt. [K K-7/ac1..4 og struktur; R R2-K7]

### 2.2 To digests, verificerbar transformation

1. **Rå kilde:** CI udtrækker `U` under én dokumenteret snapshot-identitet og optager kildeidentitet, scope/projektion-OID, udtrækker-OID, schemasignatur, start/slut og tællinger. Kanonisk encoding skal skelne SQL-NULL, JSON-null, manglende nøgle, tal, tekst, dato og binærværdi; JSON-objektnøgler sorteres, arrayrækkefølge bevares, og rækker sorteres efter tabel og PK. Ingen trim, NFC-normalisering, case-folding eller datoafkortning.
2. **`raw_source_digest`:** `SHA256(canonical(["P8-raw-v1", private_nonce, source_manifest, U]))`. Det er de faktisk udtrukne rå bytes **før** transformation, ikke et hash af allerede anonymiserede data eller af en selvoplyst rækkeoptælling. Nonce og råmateriale er krypteret og adgangsbegrænset i bevisdepotet; nonce offentliggøres ikke, så digest ikke bliver et offentligt gættekatalog over persondata. Digest, algoritme og depot-reference kan indgå i attesten.
3. **Snapshot:** versionsbundet transformer bruger en separat CI-nøgle til konsistente pseudonymer/UUID'er. Alle PK/FK-/auth-/audit-referencer følger samme tabeloversættelse. NULL, kardinalitet, dubletrelationer, status, intervalkanter, grenstruktur og grant-semantik bevares. Pseudonymkollision eller tab af en risikoklasse er fejl. Datoer holdes uændrede i det lukkede snapshot for at bevare current_date-/retention-kanter; der vælges ikke et tidsforskud, der flytter en vanskelig række over i normaltilstand.
4. **`anonymized_snapshot_digest`:** `SHA256(canonical(["P8-snapshot-v1", transform_oid, projection_oid, S]))`, hvor `S` er den præcise transformerede import. CI verificerer §1.4's bijektion og relations-/formegenskaber mellem U og S, og kontrollæser importen fra databasen før produktkørslen. Enhver yderligere transporttransformation får sin egen binding; importen må ikke blot attesteres fra en fil, den ikke matcher.
5. **Sammenbinding:** CI signerer begge digests, transformer-/udtrækker-/spec-/plan-OID, source snapshot-id, run-id, seed-commitment, build-proof-/artefakt-digest, databaseskema-/migrationsdigest, import-digest og den tidsordnede jobkæde. Verifieren skal validere CI-identitet og jobafhængigheder; to selvskrevne timestamps beviser ikke »efter build«.

Kodebærende nøgler som `superadmin`, permission-keys og enum-værdier skal bevares, hvor produktet slår dem op; de er ikke frie navne. Dynamic-field-keys og deres definitioner transformeres kun sammen og kun, hvis opslagets semantik bevares. Importadapteren må håndtere transportkolonner som logo-metadata særskilt, men den må ikke reparere klientfelter, genberegne historik eller normalisere adgangstilstand. Loaderfejl afbryder prøven; de udløser aldrig kassation af den fejlende række.

De **nyproducerede pakkerækker** har desuden egen beviskæde: efter hvert commit optages relevante data-/audit-/pending-effekter, og efter C10 læser CI hele forløbets faktisk skabte rækker og historik tilbage. `raw_result_digest` dækker denne rå resultatprojektion før logredaktion; `anonymized_result_snapshot_digest` dækker dens transformerede snapshot efter samme mønster. Begge bindes til input-digests, `chain_id`, generator/input-manifest og step-traces. Kildesnapshot før C1 har nul pakkeobjekter; et færdigt resultat indlæst som fixture kan derfor ikke erstatte deres observerede oprettelse.

Mønstret implementerer W's rå-kilde-plus-snapshot-binding. Med en bevaret nøgle og genkendelig relations-/datostruktur er »anonymiseret snapshot« i denne prøve **pseudonymiseret og fortsat fortroligt**, ikke en påstand om irreversibel anonymitet. Rådata, nøgler og oversættelsestabel skal have en konkret adgangs- og slettefrist i CI-kontrakten før aktivering, tilstrækkelig til uafhængig digest-/replaykontrol; de må ikke committes eller offentliggøres som CI-artifacts. [W §2.C; P-8 transportkontrakt]

Hvis en nødvendig værdispecifik egenskab ikke kan bevares ved pseudonymisering, køres den prøve i det adgangsbegrænsede rå miljø med det **samme** build. Dens saniterede effektbevis bindes til raw-digest; fejlen må ikke forsvinde ved at erstatte den vanskelige værdi med »Test Kunde«. En offentlig logredaktion må aldrig være den mekanisme, der får produktets PII-lækageprøve til at bestå.

### 2.3 Produktets anonymisering skal selv prøves

CI's transporttransformer er ikke den anonymisering K-7 kræver. Efter oprettelse fylder slutprøven hvert planvalgt kontaktfelt med en unik, genereret sporværdi gennem produktets offentlige flade. Klassifikation, strategi og mapping bringes gennem den krævede offentlige lifecycle; intet felt bliver bare seedet til »active« for at få den positive prøve til at virke.

Kontroller personfelterne før og efter normal anonymisering: hver værdi er erstattet, gruppe-/lokations-/stand-ID'er, forbindelser, forretningsfelter og audit består. Tidsstempel alene er utilstrækkeligt. Feltlisten omfatter direkte/indirekte felter efter aktive valg, historik og JSONB/inaktive keys hvor den valgte lagring har dem. Auditens beskyttede felter må ikke indeholde sporværdien i klartekst. Fjern én strategi eller tilføj et personfelt uden udførende vej: dækning/aktivering skal afvises før ubeskyttet brug. Prøv også ændring af en allerede aktiv mapping; dækning må ikke omgås den vej. [K K-7; R R2-K7/E100..E124/E208..E209]

Tag derefter et **nyproduceret** produkt-snapshot fra anonymiseringen, gendan præ-anonymiseringstilstanden i en isoleret restore-kopi, og lad produktets replay forbruge det urørte snapshot. Kræv igen faktisk erstatning af alle personværdier og bevarede relationer. Et håndlavet legacy-flat snapshot tæller ikke. Genindsættelse af nye kontaktværdier efter anonymisering skal enten afvises efter den låste lifecycle eller gennemgå en fungerende ny anonymiseringsvej; `anonymized_at` må ikke gøre nye persondata permanent ubehandlelige. [R R2-K7, især E108..E112]

## 3. NEGATIVE KONTROLTILFÆLDE — mindst ét pr. K

### 3.1 Hvad et afvist canary betyder

Alle canaries genereres fra **de faktiske IDs og tilstande i §4** efter build. De er kontrollerede afvigelser fra et ellers lovligt kald. Hvert domænenegativ køres med en bruger, som først har bevist adgang via et lovligt søsterkald; ellers kan generel adgangsnægtelse skjule en manglende domæneregel. Strukturelle forbud gentages også som app-superadmin, aldrig som database-superuser.

Planen binder pr. canary forventet domænefejl/SQLSTATE eller eksplicit negativt opslag, obligatorisk trace-anker og før/efter-observation. Timeout, ukendt RPC, transportfejl, tom catch-all, manglende fixture/schema eller en anden fejlkode er **ikke** bestået afvisning. Afvist mutation skal efterlade domæne-/historiktilstand uændret; et auditspor om selve det afviste forsøg kan tillades, men ikke en auditeret »succes«. `WHEN OTHERS THEN NULL` er forbudt. [W §2.C; R R2-TEST]

| Canary-ID / kravdækning | Konkret genereret ugyldigt forsøg | Påkrævet afvisning/slut-effekt og positiv kontrol |
| --- | --- | --- |
| **N1 — K-1/ac1..5** | Opret lokation med NULL, tomt og whitespace-navn; gentag med en seedet type uden for de fem. Efter pris P1 på D1 og P2 på D2 forsøg at omskrive D1; injicér lokation som attributions-/provisionsreference i en særskilt build-kopi. | Navn/type/historieomskrivning afvises og efterlader ingen halv lokation/stand. D1-pris forbliver P1; ingen introduceret økonomi-/attributionsflade kan passere schema-/RPC-/datakontrakt-kontrollen. Lovlig opret/rediger og alle fem typer virker med app-rettigheder. Økonomiforbuddet undersøges også for JSONB/udgående RPC-data, ikke kun FK-navne. |
| **N2 — K-2/ac1..3,5..6; ac4 nedenfor** | Sæt selv-parent; skab længere cyklus; læg stand under stand; giv manglende/ukendt lokation; opret uden første stand; fjern/flyt sidste stand. Hvis planmodellen tillader fjern/flyt: to sessions fjerner hver sin af to stande samtidig. | Hver ugyldig struktur afvises på den relevante offentlige flade/commit-grænse; mindst én stand består, ingen delvis oprettelse. Ingen to samtidige commits kan efterlade nul stande. Efter nedlæg/genåbn består samme stand-ID'er. Egen pris og NULL-arv læses på samme dato; 0 må ikke blive til NULL. Strukturelt urepræsenterbare parent-input skal eksplicit afvises, ikke tælles som »testes ikke«. |
| **N3 — K-3/ac1..6** | Lokation uden gruppe, med ukendt gruppe eller fritekst-gruppe; blankt gruppenavn; tilvælg C3 fra H på G's L1; slet G med L1/L2, også når L1 er nedlagt. | Ingen ejerløs lokation eller ny fritekst-ejer opstår. Cross-gruppe-tilvalg og sletning af G afvises; G/L/stande/historik består. Kontrol: C1/C2 på G arver en senere L3; fravalg på L1 ændrer ikke L2, og ophævelse virker. |
| **N4 — K-4/ac1..9** | Ukendt status, status uden årsag, status via almindelig stamdata-upsert, status-/audit-historik UPDATE/DELETE; bookbarhedsforespørgsel under dvale/nedlagt; lokalt tilvalg på nedlagt. | Forkert skrivevej/status/årsag/tilvalg/historieændring afvises. Aktiv-opslaget på den relevante dato afviser bookbarhed for **alle stande** under lokationen. Dvale bevarer ret og tillader klienthandling; nedlagt giver ingen effektiv ret; genåbning virker med årsag/audit og aktuelle gruppeklienter. Kontrollen skelner bevidst mellem ret=true i dvale og bookbar=false. |
| **N5 — K-5/ac1..5** | E2 uden stop-ret forsøger stop før tid; uden konfig-ret ændres hviledage. C2 forsøger samme hvilende lokation som C1; gentag som superadmin og med hver eksponeret override-/force-parameter. På L2 uden valgte hviledage forsøg at få »default hvile« accepteret som lovlig konfigurationstilstand. | Uautoriserede ændringer afvises, periode/konfig uændret. Hvilende opslag afviser begge klienter; ingen bypass virker. Tilladt stop gør faktisk lokationen aktiv med årsag/audit. Tilladt konfig-ændring ses straks; uden valg findes ingen implicit auto-hvile-konfiguration. Slet ikke en manuel dvale for at opnå dette positiv. Kampagne-trigger afgrænses nedenfor. |
| **N6 — K-6/ac1..10** | Manglende klient/gruppe; dobbelt C1×G; outsider-tilvalg; gruppefrakobling/historik-DELETE uden ret; apply før approval, før undo-frist, eller før dato. Opret tilvalgsrequest, nedlæg L1/frakobl C1 fra G, lad så requesten nå apply. | Ugyldige koblinger og for tidlig/nu-ulovlig effektuering afvises uden delvis rettighed. Samtidige dubletrequests kan ikke give dobbelt aktiv relation. Kontrol: åben kobling uden slutdato og C1/C2 på samme lokation accepteres; C1 må også være på H. Frakobling rammer alle G-lokationer fra D, ikke fortiden eller H. Undo inden frist virker; godkendt, due ændring anvendes præcis én gang. |
| **N7 — K-7/ac1..4 + nedgraderingsforbud** | Nedgrader et aktivt valgt direkte personfelt til indirect/none, også som superadmin; prøv delete/recreate som none. Fjern én fysisk kolonnes klassifikation i en mutantkopi; udelad strategi for ét kontaktfelt, inkl. en udfaset JSONB-key hvis relevant. Prøv DELETE som anonymisering. | Nedgradering, omgåelse og sletning af bevaringspligtige rækker afvises. Leverancegaten afviser uklassificeret faktisk katalogkolonne; feltvis dækningsgate afviser manglende anonymiseringsvej. Lovlig anonymisering/replay skal erstatte hver sporværdi og bevare rækker/relationer/audit. Ny uvalgt feltklassifikation er none/retention NULL; lokationsanonymisering aktiveres ikke tavst. |
| **N8 — K-8/ac1..5** | Direkte INSERT/UPDATE/DELETE/TRUNCATE mod hver ny tabel og EXECUTE mod interne handlers som anon/authenticated, også med selvvalgt write-var; blank årsag på **hver** mutation; tab-write uden krævet action; læs/handling uden synlighed/ret; skriv/slet audit. | Alle uberettigede indgange og ændringer afvises. Usynlig læsning giver ingen fremmede data/pending-payloads. DB-app-rollen har ingen bypass eller ejerskab. Positiv kontrol: almindelig legitim handler, separat approver og seeded app-superadmin kan hver deres tilladte handlinger; alle nye actions er tildelbare via fælles model. Kør alle mutationer både med usatte og forsøgsvist satte interne vars. |
| **N9 — K-9/ac1..3** | Brug hver eksponeret konfigurationsindgang til at forsøge at slå required navn, ejer-/blad-/overlap-/årsagsværn fra eller ændre kode-låste action-flags; send derefter N1/N2/N6 igen. Fjern EXECUTE eller API-eksponering for én krævet handling i en mutantkopi. | Konfigurationsomgåelsen afvises eller ændrer ikke forbuddet; det efterfølgende ugyldige domænekald afvises fortsat. Hele §4-handlingsfladen virker som almindelig rettighedshaver uden SQL-editor, service-token eller deploy. Mutanten giver rød kæde på det konkrete manglende kald; en 404 må ikke omklassificeres til en bestået negativ. |

Tabellens kravhenvisninger er alle til K's bundne K-afsnit. N1's klassifikations-/økonomimutant og N7's leverancegate er **negative kontroller af leverancen**, ikke opdigtede brugerhandlinger. Derudover har begge krav reelle offentlige inputnegativer, så deres dækning ikke kan bestå på statiske kontroller alene.

### 3.2 Booking-grænsen skal være ærlig

**N2-B (K-2/ac4):** C1 har booking på stand S1 i interval I; C2 forsøger samme S1 med overlappende I → booking-skrivevejen skal afvise, højst én klient er booket. C2 på S2 samme I og C2 på S1 i et tilstødende ikke-overlappende interval er positive kontroller. Kør også samtidig indsættelse. **N4-B/N5-B/N6-B:** booking på dato i dvale/nedlagt/hvile eller uden gældende klientret skal afvises i booking-skrivevejen, også med superadmin.

Disse konkrete canaries er **obligatoriske overdragelser til trin 24**, hvor booking-leddet findes. I denne pakke er de udøvelige K-2-beviser stabil/entydig standidentitet og ejerkæde, og K-4/K-5/K-6-beviserne de faktiske offentlige datoopslag over produktets data. Slutprøven må ikke kalde et testskrevet booking-stub og erklære dobbeltbooking, kampagne-slut-trigger, eksisterende bookingers frakoblingskonsekvens eller prisens økonomiske forbrug bevist. Disse punkter får `downstream_dependency: trin-24` (prisforbrug også trin 29), **aldrig runtime-PASS**. Alle nu-scope-assertions skal være udført; deklareret nedstrøms-scope er ikke en skjult skipped test. Sider/formularer har tilsvarende eksplicit lag-F-overdragelse. [K K-1/ac3, K-2/ac4, K-4/ac5..6, K-5 »Scope-ærlighed«, K-6 »Trin 24«, K-9 »Scope-ærlighed«]

### 3.3 Mutationsfrø og liveness

Planens Codex-kill-list skal binde konkrete source-ankre og effektmål for mindst én relevant mutant pr. K. Slutprøven skal efter normal grøn kørsel gøre kontrolkopier røde på **samme** held-out snapshot; den normale databaseskema-digest og hvert mutantaftryk holdes adskilt. Kontrolkørslen attesterer den præcise tilsigtede mutation og kræver fejl i den navngivne effektassertion. Afvisning alene fordi mutantens schema/artefakt afviger fra normal-buildet er ikke et kill. Et mutant-build der slet ikke kan startes beviser heller ikke, at domænecanariet virker.

| K / canary | Targeted mutation som slutprøven skal opdage | OID-bundet frø |
| --- | --- | --- |
| K-1/N1 | Brug nutidens parent-pris i historisk standopslag. | [R R2-K1, E026..E027] |
| K-2/N2 | Fjern blad-/minimum-guard eller overlapværn i den valgte struktur. | [R R2-K2]; [B `20260518000001_t9_org_nodes.sql`, `20260518000003_t9_employee_node_placements.sql`] |
| K-3/N3 | Materialisér kun arv ved klientkobling; lad senere L3 mangle C1/C2. | [R R2-K3] |
| K-4/N4 | Lad upsert skrive status eller spring nedlagt-/apply-guard over. | [B `20260521000009_t10_client_rpcs.sql`, `20260521000008_t10_client_active_check.sql`]; [R R2-K4] |
| K-5/N5 | Gør hvile klientafhængig eller åbn stop/konfig uden rettighed. | [R R2-K5]; [B `rls_policy:core_identity.employee_active_config:employee_active_config_update`] |
| K-6/N6 | Fjern gruppeled, ét datoled eller én due-gate. | [R R2-K6]; [B `rls_policy:core_identity.client_node_placements:client_node_placements_select`] |
| K-7/N7 | Tillad direct-nedgradering; filtrér inaktive PII-keys væk; replay kun timestamp. | [B `20260521000010_t10_client_field_definition_rpcs.sql`, `20260521000004_t10_audit_filter_values.sql`]; [R R2-K7] |
| K-8/N8 | Fjern præcis permission-/WITH CHECK-prædikatet på en nåbar write-vej, eller tilføj effektivt app-DML-grant; action må ikke arve tab-write. | [B `20260514130001_t2_identity_rpcs.sql`, `20260521100003_t9_supplement_2_permission_actions.sql`, `rls_policy:core_identity.role_permission_grants:role_permission_grants_insert`] |
| K-9/N9 | Fjern EXECUTE/API-eksponering; gør kode-låst strukturfelt UI-redigerbart. | [B `20260521100001_t9_supplement_2_grants_fix.sql`, `20260521100007_t9_supplement_2_ui_rpcs.sql`, `config:supabase/config.toml` (Code)] |

Frø tilpasses planens faktiske mekanik. Hvis fjernet WITH CHECK ikke påvirker nogen tilladt eksekveringsvej, er det ikke et gyldigt kill; vælg en nåbar predicate-/grant-mutation og dokumentér hvorfor. Bilagets modstridende udsagn om schema-eksponering må ikke bruges til at fjerne den API-flade K-9 kræver. Beviset er et legitimt app-kald der virker, samt afvisning af direkte uautoriserede writes. [R R2-K8/K9; B's to aktørmærkede `config:supabase/config.toml`-frø]

## 4. KÆDE-FORLØB PÅ TVÆRS AF BIDS

### 4.1 Identitet, dato og ret-orakel

Hvert forløb har `chain_id`, source-witness-ID'er for C1/C2/C3 og employees/org, samt G/H, L1..L5 og stand-ID'er returneret af produktet. Efterfølgende steps læser og bruger præcis disse IDs. Ingen reset/reseed mellem bids; isolerede negative savepoints/kontrolkopier refererer samme forældretilstand. Gruppernes navne må gerne kollidere i en variant: identitet, ikke navn, afgør ejerskab.

Datoer D0 < D1 < … < D8 fastlægges deterministisk efter build inden for planens lovlige datodomæne og kombineres med §1.3's virkelige historiske grænser. En planlagt clock-/job-driver må styre CI-database og almindelig scheduler tid, men må ikke skrive pending-status, deadline eller domænerækker for at tvinge due. Historiske ændringer må kun ske gennem en udtrykkeligt lovlig offentlig vej. Kan valgt datomekanik ikke udøves, er det en manglende prøve, ikke tilladelse til direkte DML.

Det uafhængige forventningsorakel bygges fra de indsendte, godkendte og faktisk effektuerede hændelser, ikke fra produktets helper-return eller dets beregnede rettighedscache:

```text
Ret(C,L,D) = Medlem(C, Gruppe(L,D), D)
            AND NOT Fravalgt(C,L,D)
            AND Status(L,D) != nedlagt

MasterdataGate(C,S,D) = Ret(C, Lokation(S,D), D)
                       AND AktivOgIkkeHvilende(Lokation(S,D), D)

Pris(S,D) = EgenPris(S,D), hvis valgt; ellers Pris(Lokation(S,D),D)
```

`MasterdataGate` er kun de leverede nødvendige masterdatabetingelser; den beregner ingen bookingkapacitet. Beregningerne sammenlignes med offentlige opslag og varige DB-/audit-effekter. Den autentificerede læsers synlighed kontrolleres særskilt mod planens rettighedskontrakt. Org-scope må ikke opfindes som en ekstra klienttilladelsesregel. [K K-2/K-4/K-5/K-6; R R2-K6/K8]

### 4.2 Den ubrudte sti

| Step / bid-grænse, der skal bindes i planen | Handling gennem offentlig indgang | Hård observation som næste step overtager |
| --- | --- | --- |
| **C0 — deploy → kilde → adgang** | CI verificerer build/schema, udtrækker/importerer snapshot, afprøver reelle roller og etablerer kontrollerede rettigheder gennem fælles indgange. | Import matcher digest. Authenticated DB-rolle og API kan nå de krævede handlinger. Uautoriserede profiler afvises; almindelig handler og særskilt approver fungerer. K-8/K-9. |
| **C1 — gruppe → kobling** | Opret navngivne G og H; redigér navn/type/kontaktværdier. Kobl C1 og C2 på G uden slutdato; C3 på H. Kobl også C1 på H for at udfordre forkert UNIQUE(client_id). | G/H er stabile, separate ejeridentiteter. Åbne C×G-relationer findes efter approval/undo/due, når daterede; én klient kan have to grupper. Ingen tekniske privilegier kræves. K-3/K-6/K-8/K-9. |
| **C2 — kobling → lokation → stand** | Opret L1 og L2 under G, hver atomisk med første stand; tilføj anden stand på L1. Opret senere L3..L5, så alle fem typer er dækket. Opret også en kontrollokation under H og en navngiven gruppe/lokation uden klienter. | C1/C2 arver både tidlige og senere G-lokationer. C3 arver ikke G. Alle lokationer har gruppe og mindst én stand; ingen krav om mindst én klient. Klientrettighed er ikke standallokering. K-1/K-2/K-3/K-6. |
| **C3 — masterpris → standpris → historik** | Sæt P1 på L1/D1, egen pris på den ene stand og arv på den anden; redigér til P2/D2. Prøv planens NULL/0/grænser og normal navne/adresseændring. | Læs D1, D2 og kanter: samme historiske priser før/efter. Egen pris vinder, arv følger parent på D. Almindelig redigering ændrer ikke status eller økonomisk attribution. K-1/K-2/K-8/K-9. |
| **C4 — arv → fravalg → fortrydelse** | Fravælg C1 kun på L1 ved D3. Kør separat request→approve→undo inden frist og bevis ingen effekt; udfør derefter en ny godkendt/due ændring. Ophæv og gentag fravalg for grænseprøven. | C1 mister kun L1 fra D3; L2..L5 og H består. C2 beholder L1. Tidlig apply/egen eller forkert godkender afvises efter planens regler; pending-værdier er læsbare for den rette godkender. Gammel dato uændret. K-3/K-6/K-8/K-9. |
| **C5 — fravalg → dvale → stop** | Sæt antal hviledage på L1 gennem konfigfladen og kontrollér straks-virkning; L2 står uden valg. Start manuel dvale med slut ved D5; ophæv/tilføj lovlige fravalg mens i dvale. Stop ved D4 < D5, først uden ret, derefter med ret/årsag. | Dvale kobler ingen af: ret følger medlemskab/fravalg, men alle L1-standes aktiv-/hvileopslag afviser på datoer i perioden. Mens L1 stadig er i dvale skal et opslag for en dato efter ophøret tillade aktiv-betingelsen, hvis ingen anden tilstand spærrer. L2 berøres ikke. Uautoriseret stop ændrer intet; autoriseret stop afslutter faktisk perioden og åbner L1. Separat variant udøver naturligt periodeudløb. K-4/K-5/K-6/K-8. |
| **C6 — stop → nedlæg → krydsbid-race** | Etablér et lokalt C2-fravalg på L1 til genåbningsprøven. Opret et ellers lovligt lokalt tilvalgsrequest, nedlæg så L1 med årsag ved D6 før requestens apply. | Ingen observerbar committed tilstand har nedlagt L1 med effektive klientrettigheder. Alle L1-stande og historik består; G's medlemskab og L2..L5/H er intakte. Det nu ulovlige apply afvises uden delvis kaskade. K-2/K-4/K-6/K-8. |
| **C7 — nedlagt → ændret gruppe** | Mens L1 er nedlagt: frakobl C1 fra G fra D7, kobl C3 på G, forsøg lokalt tilvalg på L1, og forsøg sletning af G. | C1 mister G-lokationer fra D7, men sin H-ret og D<D7-historik består. C3 får L2..L5; L1 har stadig ingen effektiv ret. Lokalt tilvalg og gruppesletning afvises. K-3/K-4/K-6. |
| **C8 — genåbn → aktuel arv** | Genåbn L1 ved D8 med årsag. Ingen manuel genindsættelse af dens klientrettigheder. | C3 arves automatisk; C1 vender ikke tilbage til G. C2 følger **det før build låste** valg: ret ved nulstillet fravalg, ingen ret ved bevaret fravalg, derefter ophæves fravalget lovligt og C2 får ret. Samme L1/stand-ID'er/prishistorik; D6≤D<D8 giver fortsat ingen ret. K-2/K-3/K-4/K-6. |
| **C9 — arv → klassifikation → anonymisering → replay** | Udfør §2.3 på G's kontaktfelter og, når aktivt klassificeret, lokationsfelter. Kør med produktets nyproducerede state i restore/replay-kopien. | Personværdier forsvinder; gruppen, lokationerne, standene, klientrelationerne, forretningshistorikken og det beskyttede auditspor består. Gentag ret-/pris-/statusopslag efter anonymisering og replay. K-7 sammen med K-1..K-6/K-8/K-9. |
| **C10 — hel kæde → bevis** | Genlæs alle registrerede dato-/rettigheds-/prisvidner og lister, verificér negativ/mutant-resultater og bid-bindinger. | Fortiden har samme svar som ved de oprindelige checkpoints; alle krævede vidner er udført. Trace binder produceret ID/state/event ved hver overgang til næste bids input. Ingen grøn samling af uafhængige, reseedede bid-smokes. |

Et datobundet step inkluderer den faktiske request→synlig pending→rette approve→undo-vindue→due scheduler/apply→genlæs-kæde. UI-konfigurerede perioder prøves både med et reelt positivt vindue og med planens tilladte grænser; manglende undo-settings må ikke gøre en 24-timers fallback til et bevis på den aftalte konfiguration. K-5's direkte hvilekonfiguration må ikke tvinges gennem den daterede kø. [K K-5/ac3, K-6/ac10; R R2-K6 og R2-PLAN/P14]

### 4.3 Metamorfiske og samtidige krav

- **Omdøbning/permutation:** ombyt seedvalgte klienters roller, navne og indsættelsesrækkefølge i kontrolkopier; med samme relationer/datoer/permissions skal svarene være de tilsvarende ommærkede svar. Alle fem typer skal dele mekanik. Pseudonymiseringen må ikke skjule den oprindelige formklasse.
- **Lokalitet:** fravalg, hvile, nedlæg og kontaktanonymisering på L1/G må ikke ændre H eller uvedkommende kildeklienter/employees. C3 tilføjet G under nedlagt og C1 fjernet G beviser genåbning mod aktuelt medlemskab, ikke en gemt gammel liste.
- **Historie:** efter hvert step genlæses alle allerede observerede datoer; fremtidige ændringer må ikke ændre fortidens pris, status, ejer, klientret eller historisk org-synlighed. `read()` skal svare til `read_at(current_date)` under samme rolle. For planens halvåbne intervaller må grænsedagen kun ramme én version.
- **Samtidighed og atomaritet:** mindst to uafhængige DB-sessions med en dokumenteret barriere udøver dubletkobling og, hvor fjern/flyt er understøttet, sidste-stand-racet. Request før nedlæg/frakobling og apply efter udøver genvalidering. En samtidig observatør må aldrig se en committed halv nedlæggelse/kaskade. Ingen manuel reparation eller sletning af et fejlagtigt mellemresultat.
- **Replay og gentagelse:** gentagne reads ændrer ingen data; genkørsel af allerede anvendt pending-job skaber ikke en ekstra relation/historik; anonymiseringsreplay har faktisk samme beskyttende effekt med bevarede forretningsidentiteter. Dobbelte brugerrequests må følge K-6's afvisning, ikke forveksles med intern job-idempotens.

Disse er P-8's dybdekrav med grundlag i K's historie-/ejerskabs-/status-/rettighedsinvarianter og R's race-/replay-faldgruber. De erstatter ikke canaries eller de enkelte acceptkriterier. [W §2.C; R R2-K1/K2/K4/K6/K7]

### 4.4 Kørsel og afleveret chain-proof

SQL-delprøver følger `run-db-tests`-formen: SQL-fil, `BEGIN`/`ROLLBACK`, DO/assertions med specifik fejl og RAISE ved mismatch. **T's nuværende runner alene er ikke slutprøvens harness:** én query pr. fil kan ikke bevise concurrency eller overføre en rollbacket kæde til næste fil; den har succes ved nul filer og skriver ikke prover-resumé. Der må heller ikke bruges dens indbyggede project-ref-default til slutprøven. CI skal kræve eksplicit isoleret target og schema/build-paritet. [T `runQuery`/`main`; R R2-TEST]

Kædens reelle writes går gennem hele den eksponerede API/RPC-flade med non-bypass app-rolle. SQL-administrationskanalen må kun importere snapshot, styre det isolerede miljø og kontrollæse bevis; `SET LOCAL ROLE authenticated` og den faktiske rolle/`rolbypassrls`/ejerskab skal verificeres ved SQL-baserede adgangsprober. Et JWT under postgres er ikke RLS-bevis. Runtime-RPC'er der legitimt er SECURITY DEFINER skal stadig udøve deres egne gates. Transaktionslokale audit-/write-vars nulstilles mellem aktører; en fixture-global årsag må ikke få blank-årsagsnegativer til at lykkes. [R R2-K8/K9]

Hovedkæden kører i én sammenhængende isoleret database med commits, så API, scheduler og samtidige sessions kan observere de samme produktproducerede rækker. Den må ikke splittes i rollbackede bid-fixtures. Savepoints/rollback bruges til isolerbare SQL-negativer; multi-session/API-negativer bruger kontrollerede databasekopier. Cleanup sker først efter bevisopsamling ved destruktion af CI-miljøet, aldrig ved at slette forretningshistorik gennem produktet. [R R2-TEST; B `oid:e767efb8b392a98102f88dd9008d6d6ad6dfb05f:scripts/run-db-tests.mjs`; P-8 kædekontrakt]

CI skal emitere og signere følgende **fra faktiske runtime-resultater**:

- `spec_blob_oid`, `plan_oid`, `krav_blob_oid`, alle bid/base/code-OID'er, angrebs-spec-/oracle-/generator-/harness-OID'er, build-proof og build-artefakt-digest.
- Kilde-/transform-/importbindingerne i §2, komplet populations-/shard-/witness-manifest, forventet testliste og alle forsøg. En manglende shard er rød.
- `chain_id`, parent-step, input/output-referencer, actor/testprofil, offentlig signatur, DB-rolle, udført trace/source-anker, forventet/faktisk fejl eller hård state/event/row-observation, før/efter-digests. Audit med NULL `record_id` skal spores via den faktisk tilgængelige versionsidentitet i payload, ikke en opdigtet record-id. [R R2-K1/E027]
- Pr. K/ac: nu-scope-bevis, konkret canary og negativ sti; pr. targeted mutant: aftryk, faktisk eksekveret effektassertion og kill-resultat. Nedstrøms-punkterne i §3.2 er særskilte overdragelser med modtagende trin og canary-ID.
- Friskt prover-resumé `{total, passed, failed, skipped}` og witness-afstemning. `total > 0`, `passed = total`, `failed = 0`, `skipped = 0` er nødvendigt, men ikke tilstrækkeligt: tallene skal også matche den **forudberegnede komplette liste**. Et fail-fast-afbrudt forløb er rødt med resterende steps uafsluttede. [R R2-TEST]

Ved denne pin afviser V `chain-proof`, fordi verifieren endnu ikke er bygget. Planen/fabrikken skal levere den faktiske udtrækker, attestbinding, harness/adapter og verifier før Fase 5 kan godkende noget. Denne spec ændrer ikke routeren eller anden workflow-mekanik og er ikke en erstatning for den manglende kørsel. [V `makeProofVerifier`; W Fase 5]

## 5. ANGREB PÅ EGEN SPEC — tre falsk-grøn-veje

### A1. »Hele vores udvalg bestod« — men kilden eller transformationen har fjernet fejlene

**Angreb:** vælg et bekvemt CI-projekt, læs kun første API-side/aktive klienter/åbne placements, drop inaktive direct-keys, omdøb alle problemværdier til simpel ASCII eller rerun med nyt seed. Både snapshot-hash og 100 % testdækning kan være korrekte for det forkerte udvalg.

**Modtræk og kontrol:** bind kilde/scope/projektion før build; fuld separat kildeoptælling og nøglemængde; §1.4's bijektion, form-/kantbevaring og komplette witness-manifest; intet række-cap; post-build CI-nøgle og uudslettelig forsøgshistorik. I udtrækkerens kontrolprøve fjernes den rangerede inaktive/udfasede eller historiske række, og i transformerens kontrol ændres NULL/intervalkant/ukendt key: verifieren **skal afvise** count/keyset/egenskabs-/digest-afvigelsen, selv hvis alle resterende produkttests er grønne. Tomme klasser mærkes fraværende; utilstrækkelig reel kæde bliver ikke grøn ved fixture-erstatning. Restgrænse: kildens ægthed kræver troværdig CI-/kildeattest; et digest alene beviser den ikke.

### A2. »Alle negativer blev afvist« — men appen er utilgængelig, eller prøven bruger bypass

**Angreb:** kør under postgres/service-role, kald intern helper, lad alle domænenegativer dø på manglende permission/404, catch alle exceptions, eller lever et håndskrevet JSON-resumé efter nul tests. Bid-smokes kan endda bruge hver deres fixture og alligevel få navnet »full-chain«.

**Modtræk og kontrol:** apptransport og faktisk non-bypass DB-rolle; lovligt søsterkald før hvert domænenegativ; præcis fejl + udført afvisningssti + uændret backing store; sammenhængende producerede ID'er på tværs af bid-grænser; ekstern forventet witnessliste; rolle-/schema-/artefaktbinding. Fjern en nødvendig API-grant, kør en tom testmappe, byt et step-output-ID, og aflevér et tidligere runs resumé: hvert kontrolforsøg **skal gøre chain-proof rød**. App-superadmin skal afvises ved strukturforbud, mens legitim non-admin skal kunne fuldføre den positive kæde. Restgrænse: den betroede harness/CI-verifier skal selv være versionsbundet og kontrolleret; produktets egne PASS-strenge er ikke bevis.

### A3. »Kæden virker nu« — men historik, samtidighed eller replay er skueeffekt

**Angreb:** alle led bruger aktuelle rene rækker; to requests køres sekventielt; genåbning genskaber en gammel medlemsliste; permission-read bruger current org-closure; anonymisering/replay sætter kun `anonymized_at` eller bruger et håndlavet snapshot. Den aktuelle UI-visning bliver grøn, mens den reelle kæde er brudt.

**Modtræk og kontrol:** alle kildekanter plus gentaget historisk orakel; rigtig grenskift-/sibling-kontekst; G-medlemsændring mens L1 er nedlagt; vedvarende fravalg med før-build forventning; separate sessions med barriere og committed observation; request→tilstandsændring→apply; nyproduceret snapshot→restore→replay med sporværdier før logredaktion. Mutér ét datoled til current_date, fjern parent-låsen/guard, eller gør replay til timestamp-only: den tilknyttede effektprøve **skal blive rød**. Restgrænse: prøven er ikke udtømmende over alle kombinationer/schedules; den dokumenterer den konkrete population, de bundne kanter og de faktisk dræbte mutanter, og påstår ikke booking-/frontend-effekt før de nedstrøms led findes.

**Afleveringsstatus:** P-8-spec klar til planens angreb og indbinding. Planvalg, konkrete bid-/signatur-/mutantankre og CI-kontrakten skal færdiggøres før plan-lås; held-out udtræk, produktkørsel og chain-proof hører til efter build. Ingen af disse fremtidige beviser er markeret udført her.
