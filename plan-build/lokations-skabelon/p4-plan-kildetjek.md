# P-4 — kildetjek af lokations-skabelon-planen før plan-lås

**Konklusion: PLANEN KAN IKKE LÅSES UÆNDRET.** Kravets navngivne planfasevalg har alle fået et udfald. Der er imidlertid modstrid mellem planen og kildegrundlaget om adgang, klassifikation/anonymisering og flere påståede kodeegenskaber. P-8 er leveret, men endnu ikke bundet ind i planen. Dette er en statisk påstand↔kilde-klassifikation, ikke en udført build-/runtime-prøve.

## Versionsbinding og metode

Kontrolleret 2026-09-08 uden web. `HEAD = ec4a3d9f1e3b4c243c46a73d10d55f1f7ec17f42`. Begge brugeroplyste blobs matcher:

```text
git rev-parse ec4a3d9:plan-build/lokations-skabelon/plan.md
423d9b20e20d52c273572473a5808c5f6ff1415e
git rev-parse ec4a3d9:docs/sandhed/krav/lokations-skabelon-krav.md
9402164d87a35fb939661058bea77c1a052493d0
```

| Alias | Versionsbundet fil @ ec4a3d9 | Blob |
| --- | --- | --- |
| P | [plan-build/lokations-skabelon/plan.md](plan-build/lokations-skabelon/plan.md) | `423d9b20e20d52c273572473a5808c5f6ff1415e` |
| K | [docs/sandhed/krav/lokations-skabelon-krav.md](docs/sandhed/krav/lokations-skabelon-krav.md) | `9402164d87a35fb939661058bea77c1a052493d0` |
| R | [plan-build/lokations-skabelon/recon2.md](plan-build/lokations-skabelon/recon2.md) | `2bdbb122158b6f8c72fc942b8de28e679742b4aa` |
| M | [plan-build/lokations-skabelon/mathias-ord.md](plan-build/lokations-skabelon/mathias-ord.md) | `b883de9358480984425064d1502d02fd63c6a3c3` |
| O | [plan-build/lokations-skabelon/ordbog.md](plan-build/lokations-skabelon/ordbog.md) | `bcab6b4ed9c9c0fe21f13c70d8e1d47a2afd9fef` |
| T | [plan-build/lokations-skabelon/p8-slutproeve-spec.md](plan-build/lokations-skabelon/p8-slutproeve-spec.md) | `4af07ef4164882ca54643e79df3554c0bf22b0e4` |
| R1 | [recon/recon.md](recon/recon.md) | `7fbd3a2f43c03ce239aa81e20483326bf438463c` |
| B | [recon/recon-2-bilag.md](recon/recon-2-bilag.md) | `6e569779353ea1d0a2bf747ce6eda6509de1aea0` |

Alle otte arbejdsfiler er byte-identiske med deres blobs ved pinnen. `P:157` betyder linje 157 i ovenstående P-blob; intervaller er inklusive. Kodehenvisninger nedenfor opløses gennem R's evidensregister eller R1/B og er kontrolleret mod committet kode. Registeret har 209 E-poster; de 63 forskellige kode-/CI-filer under `supabase/`, `scripts/` og `.github/` er OID-kontrolleret mod ec4a3d9 uden blob-drift. Dette er versionskontrol, ikke attest af samtlige udsagn i R. Der er ikke hentet live-state. R1 er brugt gennem de relevante kildepunkter og konfliktregisteret; ældre mutationsfrø får ikke forrang for senere migrationer.

Planen har **V1–V13 og S-1–S-16**, ikke bogstavelige V14–V29. Tabellen nedenfor nummererer de sidste 16 som audit-V14–V29 uden at omdøbe originalen. Alle **53 acceptkriterier**, alle 29 afgørelser, de ni tabellers DDL, RPC-/wiring-påstande, mutationsfrø og afsluttende fuldstændighedspåstande er disponeret. Gentagelser peger på samme fund; antallet af klassifikationsrækker er ikke antallet af uafhængige fejl.

Klasser:

- **DIREKTE BELÆG:** den afgrænsede påstand står i det bundne krav/ord eller fremgår af den angivne kode. Det er ikke runtime-PASS.
- **DEKLARERET AFLEDNING:** et synligt planvalg eller en konkretisering inden for mandatet. En ny RPC's navn/SQLSTATE behøver ikke at findes i forvejen; det skal fremgå, at det vælges her.
- **MODSTRID:** en kilde eller planens egen konkrete definition modsiger påstanden. Korrekt kopiering af en forældet recon-påstand kan stadig være MODSTRID mod den gældende ramme.
- **MANGLER KILDE:** påstået dækning, nødvendighed eller fuldstændighed savner belæg/konkret disposition. Dette bruges også om en manglende bærende kontrakt, der efterlader valget til byggeren.

For blandede afgørelser klassificerer hovedrækken selve valget; problematiske begrundelser er udskilt som selvstændige rækker/fund. Fx er kolonnebaseret anonymisering et legitimt valg, selv om begrundelsen »0 ny kode« er forkert.

## 1. Eksplicit MODSTRID-liste

| Fund | Påstand og plansted | Kilde/modbevis | Betydning før lås |
| --- | --- | --- | --- |
| F01 | P:157,191,283,395 kræver nye INSERT/UPDATE-grants til authenticated, samtidig med at P:124,460,527 lover revoke-båret lukket skrivevej. | K:149–158; R:232,366–387; B:135–136; juni-revoke `408a96ff:11–12`; fitness `d1b4d601:1709–1743`. Maj-grantet `359c0b23:65` er historisk og kan ikke kopieres efter juni-revoken. | Fjern genindførte app-DML-grants. Selvvalgt allow-write-var må ikke åbne DML. Den gamle revoke ændrer ikke rettigheder på fremtidige tabeller; default-deny ophæves af et senere eksplicit grant. Dette underminerer også min-stand, dedikeret statusvej og adgangsnegativer. |
| F02 | P:292 vælger klassifikationskategori `historik` til tre logs. | R1:63–75; `fb805b56:14–16`: kun `operationel`, `konfiguration`, `master_data`, `audit`, `raw_payload`. Ingen senere udvidelse til `historik` fundet. | Den beskrevne klassifikations-INSERT rammer CHECK/23514. Vælg en eksisterende kategori og skriv den konkret. |
| F03 | P:115–116,292,490,541 vælger adresse=`indirect`, men beholder lokationsanonymisering som inaktiv struktur med begrundelsen »ingen direct-felter«. | K:134–143 siger aktivering, hvis et lokationsfelt aktivt klassificeres som **persondata**, ikke kun direct. R:346,410,666 siger udtrykkeligt, at indirect ikke behandles af generic-/mappingløkken. T:113–137,221 kræver faktisk feltværdi-erstatning efter aktive valg. | Det aktive indirect-valg har ingen anonymiserings-/replayvej i planen. Fravær af verify-cron-alarm er ikke dækningsbevis. Planen skal disponere hele den valgte feltvej. |
| F04 | P:440,587–589 lover hele klassifikationsfladen og ufravigelige strukturforbud ved blot at genbruge de fælles indgange. | K:136 forbyder direct→lavere. R:354/E116–117 og T:155 kræver også delete/recreate-værn. `b9f976338:38–82` opdaterer frit `pii_level` og kan slette definitionen; T10-værnet gælder client-field-registry, ikke disse fysiske kolonner. | Et krævet forbud er udeladt fra både ændringsplan og matrix. Tilføj fysisk klassifikationsværn og negativ for downgrade/delete/recreate, også som superadmin. |
| F05 | P:283,480 begrunder fravalg af FORCE med, at FORCE blokerer trigger-INSERT »i invoker-kontekst«; B:153 angives som præcedens. | R:232 advarer specifikt mod denne slutning: postgres/BYPASSRLS-SECDEF beskyttes ikke af FORCE. `a7ec4884:93–97` erklærer `stork_audit` **SECURITY DEFINER**. | Audit_log er et eksisterende mønster, men den angivne sikkerhedskontekst og universelle årsag er forkert. Fastlæg ejer/SECDEF/ACL for de nye historiktriggere; begrund FORCE-valget på den faktiske eksekveringsvej. |
| F06 | P:334,466,481 hævder, at `skiftet_kl::date` er UTC-dato; P:309 bruger samme form for pris. | R:669 efterlader tidsgranularitet til planen og beviser ingen UTC-konvertering. Et timestamptz→date-cast følger sessionens TimeZone. Ingen UTC-binding er angivet i de nye funktioner; kodebasen bruger fx eksplicit `AT TIME ZONE 'UTC'` i `a7ec4884:50,257`. | UTC er et muligt deklareret valg, men den valgte SQL realiserer det ikke uafhængigt af sessionen. Bind konvertering og `current_date`-semantik ensartet. Daglig »sidste event«-semantik er i sig selv et tilladt, deklareret valg. |
| F07 | P:105,425 lover generelt self-approve-forbud, men P:412 kopierer seneste approve og ændrer kun type→page. | `ae336ee6:55–61` forbyder selv-godkendelse **kun for non-admin** ved action_id NULL. Planen vælger netop NULL-actions i P:414,468. | Beskriv admin-undtagelsen eller vælg og specificér et strammere værn. K:126 kræver approval/undo, men er ikke i sig selv belæg for et universelt selv-godkendelsesforbud. |
| F08 | P:450 kalder kolonnevejen »0 ny anonymiserings-kode« og P:452 beskriver ren data. | P:433–438 definerer to nye interne funktioner, en offentlig wrapper og en ACL-ændring. R:410 siger udtrykkeligt wrapper, replayformat og fælles klassifikationsværn også ved kolonner. R-Code:167 er for kategorisk. | Valget kan beholdes; begrundelsen skal skelne genbrug af generic_apply fra det nødvendige nye kodearbejde. |
| F09 | P:435 kalder `c5b47ec5:78–131` forbillede for registry/regprocedure-kald. | Det span bruger `apply_field_strategy` og COALESCE; det har ingen regprocedure-dispatch. R:E109 peger på `6f0e1db3:239–300`; generic_apply's callable-opslag findes i `6083fecd:84–91`. | Ret kildehenvisningen og angiv det konkrete callable-mønster. Den ønskede nested-snapshot-parser er et nyt valg, ikke noget det citerede span leverer. |
| F10 | P:464 tilskriver `17930649:151–222` exact-start-DELETE. | Det gamle span lukker rækker med UPDATE, ingen DELETE. R:288,332 henviser til senere supplement/handlers; E088 er `7e490d5f:357–398` for client_close. Senere team_close findes i supplement-/bypasskæden. | Kritik af exact-start-sletning er relevant, men blob/span/funktionsattribution er forkert. |
| F11 | P:90b lover, at fjernelse af hviledage-CHECK gør 0-negativet rødt; P:130a lover permission-denied ved fjernet DML-grant; P:118b lover rødt ved udeladt mapping-check-kolonne. | P:300,303 afviser allerede <1 ved public RPC; fjernet CHECK ændrer derfor ikke den angivne public 0-prøve. R:232,366–387 viser, at det krævede SECDEF-flow ikke afhænger af authenticated-DML-grants. `c5b47ec5:40` giver anonymized_check_column default `anonymized_at`, netop den værdi planen bruger. T:169,183 kræver en nåbar effektassertion. | Disse er ikke dokumenterede runtime-kills. Udeladelse af seedværdien ændrer ikke mappingen, når kolonnens default er identisk. Vælg mutanter og observationer, der faktisk ændrer den autoriserede sti. |
| F12 | P:319,527,602 tillader kodeinspektions-kill/residual i stedet for to-sessioners-bevis, hvis harness mangler. | R:258–260,668 kræver særskilt concurrency-bevis. T:169 udelukker artefaktfejl som kill; T:231,238–242 kræver to sessions og observerbar effekt. | Synlig residual er ærlig rapportering, men kan ikke opfylde den krævede prøve eller krediteres grøn. Bind harness eller behold beviset som blokerende. |
| F13 | P:488 siger, at anonymiseret kontakt-række er låst: »UPDATE → 22023«. | P:199 blokerer kun kontakt-upsert. P:200 giver `gruppe_kontakt_saet_aktiv` en ubetinget UPDATE af is_active; ingen anonymiseret-guard. | Skeln mellem forbud mod nye personværdier og total UPDATE-lås. PII-genbrugsvalget er legitimt; den ubetingede låsepåstand matcher ikke RPC-tabellen. |
| F14 | P:528 siger, at snapshot-konflationen »aldrig« er på pakkens sti, fordi jsonb_field_strategies=NULL. | `6083fecd:112–118` skriver v_field_snapshot i **begge** snapshotfelter ubetinget, også ved fysisk kolonnemapping. | JSONB-personfelter fravælges korrekt; den forkerte jsonb-snapshotværdi produceres stadig. Beskriv konsekvensen og at den valgte replayvej læser field_mapping_snapshot. |
| F15 | P:15 hævder generelt `path:linjer @ blob12`; P:139 citerer `70d52135:13–53`; P:509 tilskriver ordbogsflag E015; P:604 tæller fem nye entries. P:36 giver money-FK-mutanten kilden B:142. | Mange henvisninger er kun blob8; types-filen er 52 linjer; R:E015 er ledger M-36..38, mens gammel ordbog er E014; P:504–516/O:29–34 har **seks** entries. P:128 peger på ikke-eksisterende step 1.4 (seed er 1.3); K er 426 fysiske linjer, ikke 427 som P:12. B:142 er audit-exemption, ikke money-FK. | Redaktionelle kilde-/sporbarhedsfejl, ikke selvstændige forretningskrav. Ret før lås; de seks ordbogsopdateringer er allerede committet ved pinnen. |
| F16 | P:157 tilskriver forbilledet, at alle domænevalideringer sker før session-vars. | `bb9ee808:29–41` har permission/årsag/navn før vars, men ukendt-id-checket kommer efter UPDATE i :56–58. | Det strengere nye kontrolflow kan beholdes som deklareret afledning. Det er ikke 1:1 kopieret fra den angivne body. |

## 2. Eksplicit MANGLER KILDE-liste

| Fund | Påstand eller manglende bærende disposition | Kildekrav og præcis rest |
| --- | --- | --- |
| U01 | P:604 behandler P-8 som fremtidig leverance; P:591 hævder, at alle bindinger er fastlagt. | T:24 kræver egen blob-OID og `K/ac→bid→chain-step→signatur→observation→negativ→mutant`. P refererer ikke T's blob og binder ikke C0–C10/N1–N9. T:34,56,127,191,238–252 kræver desuden kildeidentitet/scope/projektion, CI-kontrakt, clock-driver, harness/adapter og verifier. Ingen konkret leverance-/ansvarsbinding herfor i P. Fabriksarbejde kan ligge hos driveren, men kan ikke forsvinde som planforudsætning. |
| U02 | P:408,433 kalder nye funktioner »interne«, men fastlægger ikke deres komplette DDL/ACL og returntyper; P:591 lover alle signaturer/grants. | R:356/E119–121 og `c6fb84d2:37–41` viser authenticated EXECUTE som default. P:438 revoker kun eksisterende generic_apply; ingen eksplicit revoke fra authenticated på de fire nye apply-handlers og de to nye interne anonymiseringsfunktioner. Ingen entydig angivelse af deres returntyper/ejer/SECDEF. Et navnepræfiks er ikke adgangsgrænse. T:156 kræver direkte interne-kald-negativer. |
| U03 | P:420–423 og fælles `has_permission` lover fuld non-admin-læsning, men ingen samlet tværside-/række-synlighedskontrakt. | R:368,399–401,670 og T:26,206 kræver faktisk adgangskobling. En lokationer-læser skal også læse gruppehistorik/koblinger og eventuelt clients; koblinger har grupper-policy, clients egen policy. P angiver ikke, hvilke kombinationer der er nødvendige, eller om manglende underliggende synlighed skal give 42501, false eller delvis liste. `has_permission` læser ikke visibility. Page-bred læsning kan vælges, men skal deklareres og prøves mod self/subtree/all; org-ejerskab må ikke opfindes. |
| U04 | P:105,408,425 lover både effekt efter alle gates og uændret historik ved daterede ændringer, men disponerer ikke forsinket apply. | K:122–126; R:314,317; T:191,224,230. Fx request med dato D1, approval/24t-vindue eller jobfejl medfører apply D2>D1. Handler bruger stadig payload-D1, og kun payload==effective_from kontrolleres. Hvis D1 bruges, ændres et allerede observeret D1-svar bagefter; hvis fortidscheck genkøres ved apply, kan det lovlige pending-flow blive permanent uanvendeligt. Vælg den præcise semantik/afvisning og test; source-mønstret afgør ikke konflikten. |
| U05 | P:591 lover ingen build-tids-valg og alle signaturer/fejl/tærskler. | Wrappers P:399–406 mangler fulde parameterlister/defaults og named errors for flere grene; intern returtype/ACL mangler (U02). Numeric(12,2) har intet valgt public afrundings-/overflow-udfald, og integer-hviledage mangler public brøk/overflow-kontrakt (R:298,416,419). P:408 nummererer mutation før allow-write-var i modstrid med fælles rækkefølge. Historiens triggerfunktions-DDL/navne og sikkerhedskontekst er heller ikke fuldstændige. Nye navne må vælges, men ikke påstås allerede fastlagt. |
| U06 | P:116,436–440 krediterer samlet K-7-dækning ved mapping-seed/lifecycle og fælles klassifikationsvalg. | R:346/E208,358–359,666; T:135,155,221 kræver også ændring af allerede aktiv mapping og nye aktive persondata-/retentionvalg. Planen vælger NULL-retention som gyldig start, men binder ikke felt→audit→anonymisering→replay→retention ved senere tilladte valg. F03/F04 er konkrete brud; resten af dækningskontrakten er uafgjort. |
| U07 | P:151,587 erklærer alle negativer dækket; P:136,440 erklærer fuldt almindeligt authenticated-forløb. | R:385,399 og T:143–145,240 kræver virkelig app-rolle, legitime non-admin-kald, positive søsterkald og rette fejlsti. P:24 baserer positiv-harness på JWT-sim/superadmin; det forbillede skifter ikke i sig selv SQL-rollen. P:71/101/126 forventer trigger-P0001 på historik, mens P:124 forventer 42501 fra app-revoke på samme operationer. De to forskellige testkontekster mangler eksplicit binding. P:137 mister desuden overlap/PII-nedgradering blandt krævede konfigurationsnegativer. |
| U08 | P:600 kalder live-eksponeringskontrol fail-closed og overlader resten til CI. | R:397,434,663: OpenAPI-canary er T9-specifik og kan skippe ved manglende token; den beviser ikke nye lokations-RPC'er. Bind nye sentinel-/API-kald og schema/build-paritet. Ingen live-eksponering er bevist her. |
| U09 | P:450,479,490,493 begrunder produktvalg som »M-24 1:1«, »eneste meningsfulde default« eller at navne er kategorisk ikke-persondata. | M-24 er eksemplet navn/client, ikke en fuld feltliste/klassifikation. K:57,137,181 giver faktisk mandat til fast feltliste; K:134 deklarerer konservativ klassifikation som egen læsning. Aktiv ved oprettelse, adresse valgfri og navne=none kan deklareres som planvalg; nødvendighed/persondatafrihed følger ikke direkte af ordene. R:665–666 forbyder opdigtet juridisk klassifikation. |
| U10 | P:33,587–589 bruger fravær af money-FK og fitness som fuldt bevis for ingen økonomi-/attributionsdimension. | K:21,28 er bredere end FK. R:248 kræver schema-/RPC-diff; T:149 kræver også JSONB/udgående RPC-data. Den viste pakke introducerer ingen udtrykkelig økonomiflade, men den ene FK-prøve beviser ikke hele den påståede grænse. |

## 3. Klassifikation af alle 29 afgørelser

Her dømmes **det valgte udfald**. Henviste F/U-fund klassificerer de særskilte begrundelser og realiseringspåstande; en tilladt afledning bliver ikke til implementerings-PASS af den grund.

| Audit-ID / plan-ID | Plansted og afgrænset påstand | Klasse | Kilde / vurdering |
| --- | --- | --- | --- |
| V01 / V1 | P:450: fast feltliste, kontakt i egen tabel; intet CVR | DEKLARERET AFLEDNING | K:57,137,181; R:163–167,409–410,665. Analogi-default kan fraviges. »0 kode«=F08; M-24-nødvendighed=U09. |
| V02 / V2 | P:452: fysiske kontaktkolonner frem for registry-JSONB | DEKLARERET AFLEDNING | K:141,143,181; R:124,132,410. Gyldigt valg med wrapper/replay/klassifikationsarbejde; F03/F04/F08/F14. |
| V03 / V3 | P:454: nullable gruppetype, kræves før rabatbrug i trin 29 | DIREKTE BELÆG | K:54,181; M-17 (M:38); R:169–170,411. Kravets udtrykkelige default fulgt. |
| V04 / V4 | P:456: lokale handlinger på nedlagt afvises; gruppehandlinger fortsætter | DEKLARERET AFLEDNING | K:84,181; R:412. Den lokale default og undtagelsens niveau er korrekt. |
| V05 / V5 | P:458: gruppe og leverandør er én entitet | DEKLARERET AFLEDNING | K:11,181; R:175–176,414; O:30. Ingen eksisterende entitet skal flettes. |
| V06 / V6 | P:460: atomisk første stand, ingen sletning, min. én aktiv stand ved deaktivering | DEKLARERET AFLEDNING | K:35–48; M:38–39; R:49,57,178–179,417. Aktivflag/aktiv-minimum er ekstra synligt planvalg; tætheden er ikke realiseret pga. F01, og bevisrest F12. |
| V07 / V7 | P:462: standens gruppe afledes fra lokation | DEKLARERET AFLEDNING | K:48,181; M-18; R:181–182,418. Ingen ekstra gruppekolonne: korrekt ejerkæde. |
| V08 / V8 | P:464: dateret afledt ret; lokale fravalg bevares gennem genåbning | DEKLARERET AFLEDNING | K:85,111–126,181; R:284,317,413,415. M-19 bærer automatisk aktuel arv; persistens er planvalget P05, ikke et særskilt M-19/M-36-udsagn. F10; U03/U04. |
| V09 / V9 | P:466: dvale=hvilemodel, nullable dage, stop som aktiv-skift, afledt ophør | DEKLARERET AFLEDNING | K:91–105; M:42,51,53; R:294–300,419,669. Dage/absolut stop er direkte; model/0→NULL/ophør er valgt. UTC-påstand=F06. |
| V10 / V10 | P:468: fire pending-typer, direkte stamdata/status/hviledage, 24t-seed, ingen actions | DEKLARERET AFLEDNING | K:99,126,181,407; R:190–191,308–317,422. Straks-hviledage følger kravets allerede deklarerede M-29.5-afledning. U02/U04; self-approve F07. |
| V11 / V11 | P:470: numeric(12,2), DKK/dag, toppris krævet, stand-NULL=arv, 0 gyldig | DEKLARERET AFLEDNING | K:27,42,181; R:193–194,416,664. Valuta er planvalget, ikke bevist af numeric-typen; afrundings-/grænserest U05. |
| V12 / V12 | P:472: kun superadmin seedes; page+tab under org_structure | DEKLARERET AFLEDNING | K:149,159,181; R:139–147,196–197,383,421. Page-grant til legacy-approve er rigtigt. |
| V13 / V13 | P:474: gruppe-is_active, eksisterende ret består, nye relationer guardes | DEKLARERET AFLEDNING | K:64,181; R:199–200,420. Livscyklusens konkrete virkning er valgt, ikke leveret af T10-toggle alene. |
| V14 / S-1 | P:478: to tabeller, cyklus/under-stand strukturelt ude | DEKLARERET AFLEDNING | K:35–48; R-Code:47 tillader eksplicit dette. R-Codex:256 omtaler ældre samme-tabel-skitse; K styrer og O:29 er opdateret. |
| V15 / S-2 | P:479: append-only status, init aktiv, forskellige overgange tilladt | DEKLARERET AFLEDNING | K:71–85; R:278–288,419. Init aktiv er valgt; »eneste meningsfulde« er U09. |
| V16 / S-3 | P:480: triggerlogs for pris/gruppe, audit-form uden FORCE | DEKLARERET AFLEDNING | K:27,123; R:250,415,378–379. Derived-undtagelse kan begrundes konkret. FORCE-begrundelsen er særskilt MODSTRID F05. |
| V17 / S-4 | P:481: daglig seneste-event-semantik, før oprettelse NULL/false | DEKLARERET AFLEDNING | K:81,123; R:419,669. Bevidst granularitet; den hævdede UTC-realisation er MODSTRID F06. |
| V18 / S-5 | P:482: dagens sidste pris gælder dagen | DEKLARERET AFLEDNING | K:27; R:416. Tidligere dags historik skal bevares; dette er ingen påstand om intradag-snapshot. |
| V19 / S-6 | P:483: dvale→dvale med ændret ophør | DEKLARERET AFLEDNING | K:74,94,103; M-25.2/M-27b; R:419,669. Ny event frem for overskrivning. |
| V20 / S-7 | P:484: bypass kun på aktive-forretningsvagter, aldrig struktur/nedlagt | DEKLARERET AFLEDNING | K:84,93,173; R:288,296; `b0cff39e` er analogi. M-27b vedrører hvile, ikke alle nedlagt-regler; disse bæres af K-4. |
| V21 / S-8 | P:485: stamdataændring tilladt på nedlagt; ny stand afvises | DEKLARERET AFLEDNING | K:73–85,181 giver struktur/handlingsramme, men påbyder ikke stand-opret-forbuddet. Det står som synligt nyt planvalg; må ikke kaldes ordret Mathias-krav. |
| V22 / S-9 | P:486: brugerårsag i payload og før apply-mutation | DEKLARERET AFLEDNING | K:156; R:310,332,370. Rigtigt svar på det identificerede T9-gab. Interne adgangsveje/generiske approve/undo dækkes ikke alene heraf, U02/U07. |
| V23 / S-10 | P:487: efter apply bruges ny modsat ændring, ikke undo | DEKLARERET AFLEDNING | R:117; `c3b2865c:55–61`; `ae336ee6:143–151`. Kontrakt korrekt, datorest U04. |
| V24 / S-11 | P:488: anonymiseret kontakt må ikke få nye personværdier; ny kontakt=ny række | DEKLARERET AFLEDNING | R:358; T:137; K:141–143. Total UPDATE-lås er særskilt forkert, F13. |
| V25 / S-12 | P:489: revoke af generic_apply fra authenticated | DEKLARERET AFLEDNING | R:356/E119–121. Relevant lukning; øvrige interne nye indgange mangler, U02. |
| V26 / S-13 | P:490: navngivne direct/indirect/none-valg og NULL-retention | DEKLARERET AFLEDNING | K:134–143; R:338,666. Aktivt planvalg kan være seed; ingen konflikt blot fordi kontaktfelter vælges direct. Dækning F03/F04/U06; navnenes kategoriske persondatafrihed U09. |
| V27 / S-14 | P:491: dansk domænesprog med eksplicit mapping | DIREKTE BELÆG | O:3–6,29–34; M-17/18/21/25/27/28. Mappings er faktisk til stede ved pin. |
| V28 / S-15 | P:492: migrationsfilnavne fastlagt | DEKLARERET AFLEDNING | Bygge-mekanik under K:181; de 11 konkrete navne står i P:163,193,204,212,296,317,325,340,397,416,431. Ikke kildefaktum om eksisterende filer. |
| V29 / S-16 | P:493: lokationstype required, adresse nullable | DEKLARERET AFLEDNING | K:19–26; R:246 og M-24 rammesætter, men afgør ikke alle required-felter. Udfald deklareret; nødvendighedsargument U09. |

## 4. Alle matrixrækker: 53 acceptkriterier

Klassen vedrører rækkens påståede opfyldelse/testdisposition. SQLSTATE, nye navne og bidplacering er planens mekanik. Direkte kildebelæg for HVAD er angivet selv ved en negativ dom over den beskrevne opfyldelse. K-9's sammenlagte ac1+2 er foldet ud.

| ID | P-linje / påstand | Klasse | Kilde og konkret dom |
| --- | --- | --- | --- |
| A-K1.1 | 30: navn required, public 22023 og CHECK-bagstopper | DEKLARERET AFLEDNING | K:25; R:242,248; `bb9ee808:29–37`. Public negativ har belæg; global skrivevej F01. |
| A-K1.2 | 31: præcis fem typer, ukendt 22023 | DEKLARERET AFLEDNING | K:19,26; M-25 er statusliste, ikke typeliste. Typekilden er K/R:246. |
| A-K1.3 | 32: pris P1/D1 bevares efter P2/D2, også arv | DEKLARERET AFLEDNING | K:27; R:248–250,262. Triggerlog er eget gyldigt valg; dato/fejlsti F06/U07. |
| A-K1.4 | 33: ingen money-FK + fitness beviser attributionsforbud | MANGLER KILDE | K:21,28; R:248; T:149. FK-del direkte belagt, fuld konklusion U10. |
| A-K1.5 | 34: alle lokationshandlinger gennem almindelig RPC-flade | MANGLER KILDE | K:29,171–175; R:399; T:240. Målet rigtigt; fuld rolle/transportbinding U07. |
| A-K2.1 | 42: cyklus ude gennem to-tabelform | DEKLARERET AFLEDNING | K:41,46; R:47. Gyldigt strukturelt design; negativ kræver konkrete urepræsenterbare input jf. T:150. |
| A-K2.2 | 43: egen pris vinder, NULL/reset arver | DEKLARERET AFLEDNING | K:42; R:51,262. 0 bevares som valgt pris; før-stand-oprettelse er ikke specificeret, se DDL/oracle-tabellen. |
| A-K2.3 | 44: stand under dvale/nedlagt ikke bookbar | DIREKTE BELÆG | K:43; R:262,286. Afvisning af faktisk booking er korrekt overdraget til trin 24. |
| A-K2.4 | 45: stabil standidentitet nu, maks én klient håndhæves i trin 24 | DIREKTE BELÆG | K:44,416; M:55; R:262; T:163–165. Ingen tavs udskydelse: dette er kravets egen scopegrænse. |
| A-K2.5 | 46: samme stand-ID'er efter nedlæg/genåbn, ingen sletning | DIREKTE BELÆG | K:45; M:23; R:262. DELETE-forbud valgt konsekvent; aktive/kapacitetsflag er særskilt mekanik. |
| A-K2.6 | 47: min. én stand/ejerkæde kan aldrig brydes | MODSTRID | K:46; M:38–39; R:258–260. FK/atomisk RPC er passende, men app-INSERT med selvvalgt var fra P:157 kan skabe lokation uden første stand: F01. |
| A-K3.1 | 55: lokation uden gruppe 22023, ukendt P0002 | DEKLARERET AFLEDNING | K:60; R:274. DDL NOT NULL/FK understøtter; P:300 skal følge matrixens eksplicitte NULL-gren. |
| A-K3.2 | 56: eksisterende UUID-reference, ingen fri gruppekolonne | DIREKTE BELÆG | K:61; M:85; R:270–274. Fritekst i uuid-transport er ikke nødvendigvis P0002; offentligt typefejl-udfald skal bindes, U05. |
| A-K3.3 | 57: navngiven gruppe, blank 22023 | DEKLARERET AFLEDNING | K:62; M:38; T10-navnemønster R:242,270. |
| A-K3.4 | 58: arv også til senere L3, outsider kan ikke tilvælges | DIREKTE BELÆG | K:63; M:38,85; R:274. Rækkens effekt afhænger af tværside-læsning, U03. |
| A-K3.5 | 59: udfasning bevarer; ny lokation på inaktiv gruppe afvises, admin-bypass | DEKLARERET AFLEDNING | K:64,181; R:420. Forbud mod sletning direkte; aktiv-guard/bypass er planvalgt. |
| A-K3.6 | 60: fravalg kun L1, ophævelse genskaber | DIREKTE BELÆG | K:65; M:38,85; R:274,326. Dobbelt-fravalg 22023 er konkret planvalgt fejl. |
| A-K4.1 | 68: tre statusværdier, ukendt afvises | DEKLARERET AFLEDNING | K:77; M:51; R:284–286. CHECK/22023 konkretisering. |
| A-K4.2 | 69: angivet årsag og audit for skift | DEKLARERET AFLEDNING | K:78; R:77,370. RPC 22023 er primær gate; manual audit P0001 er bagstopper, ikke universel årsagsgaranti. |
| A-K4.3 | 70: kun dedikeret statusvej; direkte INSERT 42501 | MODSTRID | K:79; R:282–286,366. P:283 tildeler netop authenticated statuslog-INSERT; allow-var kan sættes. F01. Init-event via opret er deklareret initialisering, ikke i sig selv modstrid. |
| A-K4.4 | 71: alle historik-UPDATE/DELETE/TRUNCATE giver P0001 | MANGLER KILDE | K:80; R:370,385. Append-only opfyldelse mulig; app uden tabelgrant rammer 42501 før trigger. Bind privilegeret guardprobe særskilt, U07. |
| A-K4.5 | 72: entydigt historisk aktiv-/statusopslag | DEKLARERET AFLEDNING | K:81; R:286. Dateret eventlog gyldig; faktisk UTC-bindingsfejl F06. |
| A-K4.6 | 73: til-/fravalg i dvale gennemføres | DIREKTE BELÆG | K:82; M:53; R:284,317. Guard mod nedlagt frem for ikke-aktiv er korrekt. |
| A-K4.7 | 74: genåbning via samme dedikerede handling | DIREKTE BELÆG | K:83; M:54; R:284. Nedlagt er ikke endestation. |
| A-K4.8 | 75: lokalt tilvalg på nedlagt 22023 uden admin-bypass | DEKLARERET AFLEDNING | K:84; M:22,56; R:288. Ufravigelig afvisning korrekt konkretiseret. |
| A-K4.9 | 76: nedlagt giver tom effektiv klientmængde, historik/stande består, aktuel genarv | DEKLARERET AFLEDNING | K:85; M:22–23,40; R:284,317,413. Afledt frakobling tilladt; »alle læseflader« må betyde effektive rettigheder, ikke at historiske/raw fravalg skal slettes. U03/U04. |
| A-K5.1 | 84: klientuafhængigt bookbar=false, ingen override | DIREKTE BELÆG | K:91–97; M:53; R:296–300. Signaturfravær alene udelukker dog ikke intern ubeskyttet statusmutation, F01/U02. |
| A-K5.2 | 85: rettighedshaver kan stoppe dvale straks med årsag | DIREKTE BELÆG | K:98; M:53; R:298. Planens aktiv-skift giver den krævede oplevelse. |
| A-K5.3 | 86: hviledage straks, ingen approval, afvis uden ret/årsag | DIREKTE BELÆG | K:99 er allerede eksplicit afledning af M-29.5 (M:55,65). Planen gengiver dens status korrekt; ikke et nyt direkte citat fra M. |
| A-K5.4 | 87: hviledage kræver aldrig udvikler | DIREKTE BELÆG | K:100; M:49–50; R:298. Egen offentlig RPC angivet. |
| A-K5.5 | 88: default NULL; dage integer; <1 afvises; trigger senere i trin 24 | DEKLARERET AFLEDNING | K:101,105; M:42; R:294,419. NULL/default og nedstrømsgrænse direkte; 0→NULL er eget valg. F11 om mutant. |
| A-K6.1 | 96: manglende/ukendte relationer afvises | DEKLARERET AFLEDNING | K:117; R:325. P0002 for manglende refs er valgt wrapperkontrakt; FK alene leverer 23502/23503. |
| A-K6.2 | 97: én relation pr. klient×gruppe; dobbelte afvises | DEKLARERET AFLEDNING | K:118; R:272,306. Korrekt par-unikhed; 22023 ved races er ikke garanteret af 23505/23P01-bagstopper alene, U05. |
| A-K6.3 | 98: kobling uden slutdato er lovlig normaltilstand | DIREKTE BELÆG | K:119; M:21,38,56; R:317,325. Lukdato ved senere frakobling er historik, ikke nyt aftale-slutkrav. |
| A-K6.4 | 99: alle/senere lokationer arves, outsider tilvalg afvises | DIREKTE BELÆG | K:120; M:38,85; R:326. |
| A-K6.5 | 100: lokalt fravalg/ophævelse er lokalt | DIREKTE BELÆG | K:121; M:85; R:326. |
| A-K6.6 | 101: frakobling fra dato bevarer alle tidligere svar | MANGLER KILDE | K:122; R:327. Luk-åben-formen direkte belagt, men sen apply/dato-forløb U04 og P0001-testkontekst U07 mangler. |
| A-K6.7 | 102: alle ret-led er på samme D, historisk entydige | DEKLARERET AFLEDNING | K:123; R:317,415. Dateret ejerled er rigtig nødvendig konkretisering; U03/U04 begrænser den fulde garanti. |
| A-K6.8 | 103: to klienter må have ret på samme lokation samtidig | DIREKTE BELÆG | K:124; M:55; R:317,326. Ingen max-én på lokation eller klientens gruppemedlemskab. |
| A-K6.9 | 104: automatisk lokal frakobling og aktuel genåbningsarv | DEKLARERET AFLEDNING | K:125; M:23,40; R:328,413. Persistente fravalg er legitimt planvalg. |
| A-K6.10 | 105: pending-kæde, universelt self-approve-forbud, effekt præcis efter gates | MODSTRID | K:126; R:312–315. Selve kæden korrekt; universelt selvforbud matches ikke af kopieret body F07; timing/ACL U02/U04. |
| A-K7.1 | 113: alle kolonner klassificeres i samme fil, strict gate | MODSTRID | K:140; R:340. Samme-fil er gyldig skærpelse, men planens `historik`-tupler kan ikke indsættes, F02; parser-PASS alene er ikke katalogbevis. |
| A-K7.2 | 114: kontaktværdier erstattes, identiteter/audit/state består | DEKLARERET AFLEDNING | K:141; R:344–350; `6083fecd:99–109`. God værdiassertion og nested replayplan; interne ACL og senere feltvalg U02/U06. |
| A-K7.3 | 115: valgte direct/indirect, resten none, retention NULL | DEKLARERET AFLEDNING | K:134,142; R:338. Seedet er et aktivt erklæret planvalg, så ikke i sig selv brud på default-intet. Dækningsfølgen F03. |
| A-K7.4 | 116: kontaktmapping dækker; ingen direct på lokation betyder inaktiv struktur | MODSTRID | K:143; R:346,666; T:135. Forkert indsnævring fra persondata til direct, F03; ændringscoverage U06. |
| A-K8.1 | 124: alle app-writes afvises også med selvvalgte vars | MODSTRID | K:155; R:366–387; P:157. F01. |
| A-K8.2 | 125: hver write-indgang kræver brugerårsag/22023 | MANGLER KILDE | K:156; R:310,370. Nye wrappers kræver årsag, men interne og genbrugte pending approve/undo er ikke bundet til den samme blankettest. Disse har ikke brugerårsagsparameter. U02/U07. |
| A-K8.3 | 126: audit/historik uforanderlig med P0001 | MANGLER KILDE | K:157; R:370. Audit har en eksisterende gdpr_retroactive-undtagelse, og app-revoke giver anden fejlsti. Må afgrænses; U07, kilde C11 nedenfor. |
| A-K8.4 | 127: view-only kan læse, writer kræver ret; uden synlighed ingen data | MANGLER KILDE | K:158; R:368,385; U03. Page-gate i sig selv direkte forbillede, men komposition/visibility ikke afgjort fuldt. |
| A-K8.5 | 128: pages/tabs og superadmin page+tab seedes | DEKLARERET AFLEDNING | K:159; R:383; `ae336ee6:49–52`. Step 1.4 er skrivefejl, F15. |
| A-K9.1 | 136: alle handlinger uden udviklerindgreb | MANGLER KILDE | K:171; R:395–401; U01/U06/U07. Stamdatafladen er listet, men samlet klassifikations-/P8-kontrakt er ikke færdig. |
| A-K9.2 | 136: alle handlinger uden tekniske privilegier | MANGLER KILDE | K:172; R:385,399; T:240. JWT under postgres er ikke det krævede bevis; U03/U07/U08. |
| A-K9.3 | 137: strukturforbud kan ikke deaktiveres gennem UI | MODSTRID | K:136,173; R:354,399. Fysisk direct-klassifikation kan nedgraderes/slettes gennem planens valgte fælles indgange: F04. Signaturfravær dækker ikke det. |

**Matrixens manglende strukturregel:** K-7's direct-nedgraderingsforbud står i K:136 og er ikke et separat nummereret ac; det er stadig bindende. At alle 53 ac-numre har rækker gør derfor ikke P:151/587 sandt. T:N7 og R:E116/E117 bærer netop dette hul.

## 5. DDL, RPC-kontrakter og deres begrundelser

Tabellerne klassificerer også det, der kun står i DDL eller RPC-tabellerne. Fælles boilerplate er delt ud, så et korrekt UUID/FK-valg ikke skjuler en forkert grant- eller FORCE-begrundelse.

| ID | P-sted / påstand | Klasse | Kilde / disposition |
| --- | --- | --- | --- |
| D01 | 157: UUID-PK, timestamps, updated_at/audit, no-dedup-kommentar på mastertabeller | DEKLARERET AFLEDNING | R:30,38,242. Konkret T10-form; logafvigelser er særskilt deklareret. |
| D02 | 157: FORCE RLS, read-policy på page/manage, ingen delete-policy | DEKLARERET AFLEDNING | R:30,366–368. Genbrug som ekstra lag er tilladt; det erstatter ikke SECDEF-gates eller app-revoke. |
| D03 | 157: eksplicit authenticated INSERT/UPDATE nødvendigt i ny skabelon | MODSTRID | F01. Korrekt historisk citat, forkert nutidig byggekontrakt. |
| D04 | 157: permission→årsag→alle domænechecks→vars er forbilledets nøjagtige rækkefølge | MODSTRID | `bb9ee808:29–41` placerer permission/årsag/navn før vars, men ukendt-id-check først efter UPDATE i :56–58. Strengere ny rækkefølge kan vælges; »1:1« for alle domænechecks er forkert. |
| D05 | 157: INVOKER-read med eksplicit permission-gate og grants | DIREKTE BELÆG | `8bef6e71:11–41`; R:366. Tværsidekomposition og pagination U03/U01. |
| D06 | 167–174: grupper: navn/type/is_active/timestamps | DEKLARERET AFLEDNING | K:54–64; V1/V3/V13; R:270,411,420. Ingen UNIQUE på navn er korrekt: navne-entydighed er ikke krav. |
| D07 | 177–188: kontakter: FK RESTRICT, navn/email/telefon, aktiv/anonymized_at | DEKLARERET AFLEDNING | K:134–143; R:344,358; V1/V2/S-11. Ny række pr. person understøtter genanonymisering. |
| D08 | 191: physical direct kun kontaktværdier, øvrigt none/NULL, samlet klassifikations-INSERT | DEKLARERET AFLEDNING | K:134–143; R:122,338–346. Må ikke arve T10's permanent uden aktivt valg; planen vælger korrekt NULL. |
| D09 | 216–228: lokation med navn/adresse/type/pris/gruppe/hviledage/anonymized_at | DEKLARERET AFLEDNING | K:19–29,60,91–105,134; type/pris required og adresse valgfri er deklarerede valg. F03 for aktiv adresse-PII uden vej. |
| D10 | 231–240: stand har én lokation, egen nullable pris, aktivflag, ingen under-stand | DEKLARERET AFLEDNING | K:35–48; M-17/18/29; V6/V7/S-1. Aktivflag er nyt planvalg; ingen klientkolonne er korrekt booking-scope. |
| D11 | 244–254: status-events med seq, tre statusser, dvale_ophoer og ingen master-statuskolonne | DEKLARERET AFLEDNING | K:71–85; R:284,419. CHECK tillader kun ophør på dvale; RPC skærper fremtidig ophørsdato. Init-status kræver opret-atomicitet. |
| D12 | 258–268: prislog med præcis ét af lokation/stand og NULL kun for stands arv-reset | DEKLARERET AFLEDNING | K:27,42; R:248–250,262. Triggerlog er en ny veldeklareret realisering; nuværende FK'er fastholder identiteter. |
| D13 | 272–280: gruppehistorik med dateret FK-ejerskab og seq | DEKLARERET AFLEDNING | K:123; R:317,415. Dateret ejerled er nødvendigt ved flytning af lokation mellem grupper. |
| D14 | 283: statuslog INSERT-grant til app; øvrige logs uden DML | MODSTRID | F01. Andre logs' grant select kan være gyldigt; det opvejer ikke appens status-INSERT. |
| D15 | 283/480: audit_log er invoker-præcedens der kræver ingen FORCE | MODSTRID | F05. |
| D16 | 285: egne UPDATE/DELETE/TRUNCATE-guards på tre logs | DEKLARERET AFLEDNING | K:27,80,157; R:378–379; `a7ec4884:184–207` giver raise-/triggerformen. Kopi må ikke inkludere GDPR-bypass til egne logs; U05/U07. |
| D17 | 287–290: trigger-WHEN logger INSERT/ændret pris, også arv-reset; ejerændring logges | DEKLARERET AFLEDNING | K:27,123; R:250,415. Triggerform er eget valg, ikke eksisterende færdig lokationskode. |
| D18 | 292: logkategori historik er gyldig klassifikation | MODSTRID | F02. |
| D19 | 294: registrer tre logs i fitness; undtag to derived logs fra ekstra audit | DEKLARERET AFLEDNING | R:378–379; B:68,142–143. Kildemutationens audit plus triggerlog er konkret begrundelse, ingen blanket-undtagelse for masterdata. |
| D20 | 344–368: gruppe×klient dateret relation, partial UNIQUE på par, GiST EXCLUDE | DEKLARERET AFLEDNING | K:117–126; R:306,317. Korrekt afvigelse fra cnp's klient-global unikhed. btree_gist allerede til stede. |
| D21 | 370–392: lokation×klient fravalgsrelation med samme intervalform | DEKLARERET AFLEDNING | K:120–125; R:306,413. Fravalg er lokal undtagelse; det udbredes ikke til andre lokationer. |
| D22 | 351,377: pending-FK ON DELETE SET NULL | DEKLARERET AFLEDNING | T9-koblingsskelet R:106/E070; reference til request bevares ved normal flow. Ingen ny pending-sletningsvej er valgt; historikguard kan blokere SET NULL, hvilket må accepteres eller beskrives. |
| D23 | 395: UPDATE kun lukning af åben række, ellers P0001; DELETE altid P0001 | DEKLARERET AFLEDNING | K:122; R:110,332. Strammere end exact-start-former, legitimt. App-probe giver 42501 efter korrekt revoke, U07; TRUNCATE-guard på disse to relationer er ikke angivet. |
| D24 | 395: btree_gist eksisterer | DIREKTE BELÆG | `71cadac3:21`; R:53. |
| Q01 | 197–198: gruppe_upsert og gruppe_saet_aktiv, ingen statusændring ved navneopdatering | DEKLARERET AFLEDNING | K:62,64; R:270; `bb9ee808:49–55,72–97`. Alle konkrete argumenter/returtyper i disse rækker er valgte og synlige. |
| Q02 | 199–200: kontakt-upsert og aktiv-toggle | DEKLARERET AFLEDNING | K:137,141; R:358. Afvis ny PII på anonymiseret upsert er valgt. Total lås og aktiveringstoggle kolliderer, F13. |
| Q03 | 201–202: gruppe_hent/liste med kontakt- og senere klientarray | DEKLARERET AFLEDNING | K:165–175; R:395–401. jsonb-retur gør senere udvidelse uden returtypeskift mulig; rettighedskomposition U03. |
| Q04 | 204/317: seed to pages, manage-tabs, superadmin page+tab, femkolonne-conflict | DEKLARERET AFLEDNING | R:383; `fcf49401:17–56`, `5a09930f:86–93`. Korrekt opdatering af gammel seedform; ingen legacy-seed. |
| Q05 | 300: lokation_opret atomisk med første stand/status/triggerhistorik | DEKLARERET AFLEDNING | K:46; R:49,417. Ingen klient-minimum på gruppe/lokation; det følger K:31. U01 om praktisk rollback-/kædebevis. |
| Q06 | 301: lokation_rediger rører kun navn/adresse/type/pris | DEKLARERET AFLEDNING | K:79; R:282. Separate status/hviledage/ejer-handlinger er synligt valgt. |
| Q07 | 302: lokation_saet_gruppe er straks, også på nedlagt, dateret ejerlog | DEKLARERET AFLEDNING | K:181,407; R:415. Kravet overlader direkte/pending pr. type til planen. Samme-dags-semantik er valgt, ikke et krav om backdating. |
| Q08 | 303: lokation_saet_hviledage straks; NULL fjerner valg | DEKLARERET AFLEDNING | K:99–105; R:298. P:86 placerer effektprøven i bid 3, selve RPC leveres bid 2 — forklaret P:332. |
| Q09 | 304–305: stand_opret/rediger, NULL-reset og nedlagt-opret-guard | DEKLARERET AFLEDNING | K:38,42; S-8. Nedlagt-guard er valgt kapacitetsregel, ikke K-4's ordrette klient-tilvalgsregel. |
| Q10 | 306: stand_saet_aktiv låser fælles lokation før count | DEKLARERET AFLEDNING | R:258–260,417. Rigtigt parent-lås-valg; test og adgangsvej F01/F12. |
| Q11 | 307–308: lokation_hent/liste viser status/gruppe/fravalg | DEKLARERET AFLEDNING | K:165–175; R:395–401. Afhængighed til oracles leveres eksplicit i bid 2, P:312. P:146–151's »eneste forudsætning« er derfor for snævert, U05. |
| Q12 | 309: toppris på dato før oprettelse NULL, ellers seneste seq | DEKLARERET AFLEDNING | K:27; R:250,416. Gyldigt valgt oracle, F06 om UTC. |
| Q13 | 310: standpris historisk, NULL/ingen prisrække falder tilbage på top | DEKLARERET AFLEDNING | K:42; R:262. Udtrykket skelner ikke mellem »stand eksisterede, arvede« og »før standen blev oprettet«; ingen eksistens-på-D-regel er angivet. Det er en resterende oracle-kontrakt under U05, ikke belæg for en faktisk historisk booking. |
| Q14 | 313–314: status før lokationsoprettelse NULL, bookbar false; dvaleophør inklusivt aktivt | DEKLARERET AFLEDNING | K:81; R:419,669. Samme dato bruges i alle led. UTC-konvertering F06. |
| Q15 | 315: stand_er_bookbar bruger aktuelt is_active sammen med dateret lokationsstatus | DEKLARERET AFLEDNING | K:43; R:262. Stand-livscyklusens historik er ikke dateret; navnet p_dato er derfor ikke bevis for historisk stand-aktivitet. Dette må stå i kontrakten U05, især mod T:230. |
| Q16 | 329–330: status-RPC og historiklæsning, lås, årsag, ingen backdate, dvaleændring tilladt | DEKLARERET AFLEDNING | K:77–85,98; R:286,419. Bevarer rå events; statuslogadgang F01 og timezone F06. |
| Q17 | 399–406: fire daterede wrappers med request/reason/payload | DEKLARERET AFLEDNING | K:126; R:310,317,332. Fulde SQL-signaturer mangler trods P:591, U05. |
| Q18 | 408: payloaddato=effective_from og genvalidering før effekt | DEKLARERET AFLEDNING | R:314,330,332. Korrekte værn mod dato-drift og request→nedlagt→apply. Default EXECUTE/ejer og sent apply er ikke løst, U02/U04. |
| Q19 | 408: admin-bypass beregnes alene fra pending.requested_by | DEKLARERET AFLEDNING | Helperen `713960b8:25–47` er korrekt citeret. R1:593 og `b0cff39e:42–49` bruger requested_by **eller approved_by**; planen vælger eksplicit den snævrere requester-variant. Tilladt valg, ikke et kildebrud, og begge aktørkombinationer skal prøves. |
| Q20 | 410–414: fire wiringpunkter; approve/undo/latest dispatcher/select og 24t-seed | DIREKTE BELÆG | R:308–315,383; alle tre seneste definitionspinde matcher. Copy-only selvforbud F07; nye handlers U02. |
| Q21 | 420: ret = koblet∧ikke-fravalgt∧ikke-nedlagt på samme D | DEKLARERET AFLEDNING | K:111,123; R:317. Korrekt dvale=true-ret/false-bookbar. Gruppeleddet er dateret via særskilt historik. |
| Q22 | 421: lokation_klienter er oraklets mængdeform, tom under nedlagt | DEKLARERET AFLEDNING | K:125; R:328. Klientnavne via clients kan have ekstra read-gate U03. |
| Q23 | 422: pending-hent inkluderer payload under samme RLS | DEKLARERET AFLEDNING | R:315/E080–081; T:216. Relevant lukning af metadata-only-gab; pagevalget for fælles read-check mangler U03. |
| Q24 | 423: CREATE OR REPLACE af jsonb-hent uden returtypeskift | DIREKTE BELÆG | P:201,307 har uændret jsonb-signatur; R:147 advarer om DROP/regrant ved egentlige returtypeskift. |
| Q25 | 433–435: to interne anonymiseringsfunktioner og nested replayparser | DEKLARERET AFLEDNING | R:344–358. Godt formatvalg og afvis ukendt strategi; callable-citat F09, EXECUTE/returtype U02. |
| Q26 | 436: approved mapping-seed, aktivering via UI, hash/hash_email/blank | DEKLARERET AFLEDNING | `ec3d9a0b:49–57`; `d69ea57e:223–228`; `15557e93:53`. Approved-bootstrap tilladt. Strategier er seedet approved, ikke bevist aktive; hele lifecycle skal udøves jf. T:133. |
| Q27 | 437: offentlig anonymiser_gruppe_kontakt permission/årsag/generic_apply | DEKLARERET AFLEDNING | K:141; R:344; `ca921ccb:20–57`. Fysiske direct-felter dækkes, indirect ikke. |
| Q28 | 438: revoke generic_apply påvirker ikke wrapperkald som ejer | DEKLARERET AFLEDNING | R:356; eksisterende SECDEF-wrappermønster. Ejer-/ACL-forudsætning skal verificeres; ny internal-wrapper mangler kontrakt U02. B-2 er en legitim build-stopbetingelse. |
| Q29 | 440–442: fuldt K-9-gennemløb og replay med nyproduceret snapshot | MANGLER KILDE | Replaykravet er godt og belagt R:348–350; hele gennemløbet mangler P-8 indbinding, non-admin-/konfigurationsværn og transport U01/U06/U07. |

## 6. Citerer planen recon-2 og kode-linjerne korrekt?

**Delvist.** De centrale henvisninger til nyeste pending-funktioner, due-gates, grantindeks og den generiske direct-løkke er rigtige. DML-grant/FORCE/»0 kode« gentager recon-Code uden at disponere recon-Codex' udtrykkelige modbeviser. Det er netop derfor »begge læst« ikke er tilstrækkeligt.

Nedenfor er alle **40 unikke `blob:linjespænd`-henvisninger** i P, også gentagelser samlet. 47 forekomster blev opløst; én slutlinje er uden for filen. Dertil følger de øvrige path-/bilag-/evidenshenvisninger. En henvisning kan være DIREKTE BELÆG for et snævert kodefaktum, mens den afledte større planpåstand er F/U ovenfor.

| ID | Henvisning i P | Klasse | Kontrol af citatets indhold |
| --- | --- | --- | --- |
| C01 | P:18,411 `f49e7d5b:152–220` | DIREKTE BELÆG | Seneste pending_change_apply, lås/gates/dispatcher. Ingen senere definition fundet ved pin. |
| C02 | P:18,413 `4df2fca6:19–60` | DIREKTE BELÆG | Seneste SELECT-policy med requester/admin, legacy-typer og action-gren. |
| C03 | P:18 `5a09930f:84–93` | DIREKTE BELÆG | Femkolonne-UNIQUE inkl. role_id og action_id. |
| C04 | P:33 `d1b4d601:1172–1176` | DIREKTE BELÆG | Listen tillader kun employees/auth.users som cross-schema-mål; hele attributionspåstanden kræver mere, U10. |
| C05 | P:69 `a7ec4884:34,122–129` | DIREKTE BELÆG | Nonblank auditårsag, P0001 for manual uden var; cron/trigger_cascade undtaget som kilden siger. |
| C06 | P:101 `17930649:98–100` | DIREKTE BELÆG | UPDATE lukker åben employee-placement med effective_to. Lokationsbrug er analogi. |
| C07 | P:105 `f49e7d5b:172–187` | DIREKTE BELÆG | Tidlig apply afvises med 22023, ingen effekt. |
| C08 | P:114 `6083fecd:99–109` | DIREKTE BELÆG | IS NULL-guard og P0002 ved ingen ændret række. |
| C09 | P:116 `6083fecd:75–78` | DIREKTE BELÆG | Manglende strategi giver P0001; kun direct-løkkens felter, F03. |
| C10 | P:124 `a2c85a04:25–51` | DIREKTE BELÆG | SET LOCAL ROLE-negativ og privilege-assertion findes; :43–51 er privilegeret fixture-write, ikke app-flow. U07. |
| C11 | P:126,285 `a7ec4884:184–207` | DIREKTE BELÆG | Raise/trigger/TRUNCATE-formen findes. Spændet udelader :180–183's gdpr_retroactive-undtagelse; »altid« om eksisterende audit ville være forkert. |
| C12 | P:128,204,472 `ae336ee6:36–55` | DIREKTE BELÆG | Type→page og legacy page-write-check. Self-approve-reglen står først bagefter, F07. |
| C13 | P:130 `359c0b23:62–65` | MODSTRID | Gammelt DML-grant står ordret der, men den påståede nødvendighed ved nyt SECDEF-build er modbevist af juni-kæden, F01/F11. |
| C14 | P:130 `d1b4d601:1530–1546` | DIREKTE BELÆG | Signaturbaseret SECDEF_SANCTIONED-register; selve røde kontrol ligger længere fremme. |
| C15 | P:139 `70d52135:13–53` | MODSTRID | Filen slutter på linje 52. Korrekt substans og start; ret slutlinjen til 52. |
| C16 | P:157 `8bef6e71:11–41` | DIREKTE BELÆG | INVOKER client_get med eksplicit has_permission og EXECUTE. |
| C17 | P:191 `f467bafd:16–65` | DIREKTE BELÆG | Top-level config, samlet INSERT, conflict-mål. T10-værdierne direct/permanent kopieres bevidst ikke blindt. |
| C18 | P:197 `bb9ee808:49–55` | DIREKTE BELÆG | Upsert-UPDATE rører ikke is_active. |
| C19 | P:204 `fcf49401:17–56` | DIREKTE BELÆG | Area-scopet page/tab/superadminseed. Gammelt conflict-mål må suppleres som planen gør. |
| C20 | P:204 `5a09930f:86–93` | DIREKTE BELÆG | Nyt conflict-mål har action_id. |
| C21 | P:294 `d1b4d601:79–118,1160–1170` | DIREKTE BELÆG | Eksplicitte historik-/TRUNCATE-/TX-lister. |
| C22 | P:294 `d1b4d601:130–136` | DIREKTE BELÆG | Navngivne derived audit-undtagelser, ikke blanketregel. Ny optagelse er deklareret afledning. |
| C23 | P:300,460 `71cadac3:235–246` | DIREKTE BELÆG | Identitet+version indsættes i samme funktion/tx. Ikke allerede min-barn-kontrol. |
| C24 | P:319 `e767efb8:84–109` | DIREKTE BELÆG | Sekventiel SQL-runner, ingen to-sessioners-barriere. |
| C25 | P:395 `71cadac3:21` | DIREKTE BELÆG | `create extension if not exists btree_gist`. |
| C26 | P:399 `713960b8:50–97` | DIREKTE BELÆG | Client-wrapper/pre-check/request-form findes; tilføjet brugerårsag er eget korrekt valg. |
| C27 | P:408 `713960b8:25–47` | DIREKTE BELÆG | is_admin_by_employee_id-helperen findes. Requester-only kontra requester/approver er ikke fastlagt af dette span, Q19. |
| C28 | P:412 `ae336ee6:8–183` | DIREKTE BELÆG | Seneste approve+undo; inkluderer admin-self-approve-undtagelsen, som teksten overser F07. |
| C29 | P:414 `f49e7d5b:222–230` | DIREKTE BELÆG | 24t-seed og ON CONFLICT. Valg af samme default er deklareret, ikke tvunget. |
| C30 | P:433 `c5b47ec5:38–52,70–73` | MANGLER KILDE | Kolonner tilføjes her; anden NOT NULL står :70, første :69 ligger uden for spændet. Regprocedure-validering er ikke vist i dette span; R peger videre til r7a. Udvid præcis citation. |
| C31 | P:434 `ca921ccb:20–57` | MANGLER KILDE | Span er **offentlig permission-gated employee-wrapper**, ikke internal-wrapper. Delegation findes; de interne funktioners ACL/ejer/returtype kan ikke kopieres herfra, U02. |
| C32 | P:435 `6083fecd:92–119` | DIREKTE BELÆG | Nested strategy/strategy_id og dobbelt snapshot-INSERT verificeret. |
| C33 | P:436 `ec3d9a0b:49–57` | DIREKTE BELÆG | Approved INSERT tilladt ved migration source_type. |
| C34 | P:436 `d69ea57e:223–228` | DIREKTE BELÆG | blank og hash_email seedes approved. |
| C35 | P:436 `15557e93:53` | DIREKTE BELÆG | hash seedes approved. |
| C36 | P:437 `6083fecd:41–125` | DIREKTE BELÆG | Parameter-/aktiv mapping-/direct-/strategi-/NULL-checks og state. Ingen generic permission-gate; derfor relevant revoke. |
| C37 | P:452,528 `6083fecd:112–118` | DIREKTE BELÆG | Snapshot-konflationen er korrekt lokaliseret; påstanden om at den aldrig rammes er forkert F14. |
| C38 | P:464 `17930649:151–222` | MODSTRID | Intet exact-start-DELETE i dette span. F10. |
| C39 | P:470 `b0491013:17` | DIREKTE BELÆG | amount numeric(12,2), ikke valuta-/dagsprissemantik. |
| C40 | P:487 `c3b2865c:55–61` | DIREKTE BELÆG | Check-sættet forhindrer kombineret applied/undone; undo-funktionens statusgate supplerer. |
| C41 | P:7 `governance-check.mjs:273–326 @ f3012195` | DIREKTE BELÆG | R:157 beskriver dokumentkæden; selve formålsteksten P:5 og K:7 er byte-identisk. |
| C42 | P:24 `t10_client_lifecycle.sql:26–36 @ 6777522c` | MANGLER KILDE | JWT fixture til superadmin er belagt; det er ikke i sig selv SET ROLE authenticated/RLS- eller non-admin-PASS, R:385. U07. |
| C43 | P:113 `ci.yml:102 @ 4312d4b5` | DIREKTE BELÆG | STRICT migration-gate; R:122,151. Klassifikationens semantiske kategori skal stadig være lovlig F02. |
| C44 | P:157 `t10_tables.sql:24–82 @ 359c0b23` | MODSTRID | Tabelboilerplate korrekt historisk; DML-genbrug som samlet bindende nutidsform er F01. |
| C45 | P:157 `t10_client_rpcs.sql:17–63 @ bb9ee808` | MODSTRID | Permission/årsag/navn før vars korrekt; »alle domænechecks før vars« overfortolker ukendt-id-grenen D04. |
| C46 | P:435 `20260514170004:78–131 @ c5b47ec5` | MODSTRID | Legacy apply_field_strategy/COALESCE, ikke registry-regprocedure-kald F09. |
| C47 | P:464/525–530 R:E053/E057/E079/E082/E087/E088/E109/E111/E112 | DIREKTE BELÆG | Senere-L3-arv, fælles dato, exact-start-fælde, nested replay og legacy-fixture fremgår af R:276,284,314,332,348. Fejlattribution af gammel team_close er særskilt F10. |
| C48 | P:509 »E015-flaget« om nedlagt-sluttilstand | MODSTRID | Flagets substans findes R:234, men forkert evidens-ID: E015=M-ledger:85–89; gammel ordbog=E014. O:31 retter det nu. |
| C49 | P:283 B:153 | MODSTRID | Bilagsfrøet er gengivet, men R:232 advarer netop mod FORCE/BYPASSRLS-slutningen; F05. |
| C50 | P:36 »money-FK-mutant, B:142« | MODSTRID | B:142 er audit-exemption-mutant; money/FK-gate-mutant er nærmere B:143. Det rigtige FK-faktum står R:36. |
| C51 | P:36/78/107/118/130/139 øvrige navngivne B-linjer | DIREKTE BELÆG | B:12–13 årsag, 26 silent fallback, 33 check-kolonne, 64 due, 83 rækkefølge, 91 klartekst, 98 CASCADE, 100 recheck, 102 upsert-status, 114 EXECUTE, 122 SELECT, 127–130 SECDEF-gates, 140 types, 205 datoled matcher som frø. Frø er ikke udførte kills. |

## 7. Kill-list-udkast: klassifikation pr. mutantpåstand

`m`-rækken er påstanden »denne mutation skal dræbes af den nævnte effekt«. Alle DEKLARERET AFLEDNING-rækker er **forslag**, ikke executed/mutant_killed. Det forventede effektpunkt skal bindes i byggefasens faktiske source, jf. R:432 og T:169.

| ID | P-linje / mutation | Klasse | Kilde / vurdering |
| --- | --- | --- | --- |
| m-K1a | 36 navn-22023 fjernes | DEKLARERET AFLEDNING | K:25; R:242; korrekt public fejlskifte til CHECK kan måles. |
| m-K1b | 36 typevalidering fjernes | DEKLARERET AFLEDNING | K:26; R:246; må kræve netop 22023, ikke blot vilkårlig afvisning. |
| m-K1c | 36 COALESCE-retning byttes | MANGLER KILDE | Ren arv uden egen pris skelner ikke retningen. Bind kontrol med både toppris og forskellig egen pris, som K-2-rækken allerede nævner; R:262. |
| m-K1d | 36 lokations-prishistoriktrigger fjernes | DEKLARERET AFLEDNING | K:27; R:250; historisk genlæsning kan dræbe manglende log. |
| m-K1e | 36 pris-immutability fjernes | DEKLARERET AFLEDNING | K:27; B:12; kræver nåbar privilegeret guardprobe særskilt fra app-42501, U07. |
| m-K1f | 36 current_date hardcodes | DEKLARERET AFLEDNING | R:250; B:205 er analogi for tabt datoparameter. |
| m-K1g | 36 money-FK tilføjes | DEKLARERET AFLEDNING | R:36; CI-kontrol legitim; B-linjen er forkert, C50. |
| m-K2a | 49 min-aktiv-count fjernes | DEKLARERET AFLEDNING | R:179,258; sidste-stand-negativ relevant. |
| m-K2b | 49 parent-FOR UPDATE fjernes | DEKLARERET AFLEDNING | R:258–260; kræver rigtig concurrency; residualalternativ F12. |
| m-K2c | 49 første stand-INSERT udelades | DEKLARERET AFLEDNING | K:46; R:417; mål er committed lokation med nul stande. |
| m-K2d | 49 delete-grant/policy indføres | DEKLARERET AFLEDNING | K:45; R:387; direkte privilegie-/DML-negativ. |
| m-K2e | 49 is_active fjernes fra stand-bookbar | DEKLARERET AFLEDNING | V6's eget aktivvalg; K:43 og R:262 er ramme, ikke belæg for allerede eksisterende aktivflag. |
| m-K2f | 49 FK bliver CASCADE | DEKLARERET AFLEDNING | R:264; B:98; schema-assert er CI-/strukturprøve, ikke runtime-cascade-bevis. |
| m-K3a | 62 unikhed alene på klient | DEKLARERET AFLEDNING | R:71,272; klient i to grupper er rigtig positiv kontrol. |
| m-K3b | 62 inaktiv-gruppe-guard fjernes | DEKLARERET AFLEDNING | V13/R:420; prøv non-admin, fordi admin-bypass er valgt. |
| m-K3c | 62 gruppenavn-guard fjernes | DEKLARERET AFLEDNING | K:62; M-17; præcis fejlsti kræves. |
| m-K3d | 62 FK CASCADE | DEKLARERET AFLEDNING | K:64; R:276; samme kontrolafgrænsning som m-K2f. |
| m-K3e | 62 arv kun ved kobling | DEKLARERET AFLEDNING | R:276/E053; L3-prøve er direkte egnet. |
| m-K4a | 78 dvaleophør fjernes/<= bliver < | DEKLARERET AFLEDNING | R:419,669; planens ophørsdag kan skelne. |
| m-K4b | 78 seq DESC bliver ASC | DEKLARERET AFLEDNING | Valgt eventmodel; mere end ét event er nødvendig fixture. |
| m-K4c | 78 nedlagt-led fjernes | DEKLARERET AFLEDNING | K:85,125; R:332. |
| m-K4d | 78 historikguard fjernes | DEKLARERET AFLEDNING | K:80; R:379; guardprobe-kontekst U07. |
| m-K4e | 78 init-status udelades | DEKLARERET AFLEDNING | S-2's aktiv-default; K:71/R:284 kræver en entydig tilstand. |
| m-K4f | 78 årsagsgren fjernes | DEKLARERET AFLEDNING | B:12–13; T:145. Kræv 22023 fra RPC, så audit-bagstopper ikke skjuler mutation. |
| m-K4g | 78 upsert skriver status | DEKLARERET AFLEDNING | B:102; R:286. |
| m-K5a | 90 NULL-usikker sessiongate | MANGLER KILDE | B:51/R:101 beskriver reel gammel fælde, men P vælger SECDEF og `= 'true'`-policies. Bind en nåbar if/trigger-gate; policy-only-mutant kan være inert, R:232/T:183. |
| m-K5b | 90 hviledage-CHECK fjernes | MODSTRID | RPC <1-check består; 0-negativet ændres ikke, F11. |
| m-K5c | 90 permission-gren fjernes | DEKLARERET AFLEDNING | K:99; R:298; non-admin uden ret er korrekt modprøve. |
| m-K5d | 90 client-param/undtagelse tilføjes | DEKLARERET AFLEDNING | R:300; signaturassert alene er strukturel, to-klient-effektprøven bør bindes. |
| m-K6a | 107 kardinalitetsmutant | DEKLARERET AFLEDNING | Som m-K3a/R:272. |
| m-K6b | 107 gruppeled fjernes | DEKLARERET AFLEDNING | R:332; outsider skal fortsat afvises. |
| m-K6c | 107 fravalgsled fjernes | DEKLARERET AFLEDNING | K:121; R:326. |
| m-K6d | 107 current_date i ét led | DEKLARERET AFLEDNING | R:332; B:205 dato-analogi. |
| m-K6e | 107 undo-deadline-gate fjernes | DEKLARERET AFLEDNING | R:314,332; B:64; due-negativ må ikke allerede blokeres af anden dato-gate. |
| m-K6f | 107 pending SELECT-gren udelades | DEKLARERET AFLEDNING | B:122; R:315; separat non-admin-godkender, ikke requester/admin der allerede har adgang. |
| m-K6g | 107 dispatcher-gren udelades | DEKLARERET AFLEDNING | R:314; positiv apply bliver 42883. |
| m-K6h | 107 apply-genvalidering fjernes | DEKLARERET AFLEDNING | B:100; R:288,330. |
| m-K6i | 107 payload/effective-date-assert fjernes | MANGLER KILDE | R:314/E079 viser fælden, men wrappers konstruerer samme dato. Hvordan en inkonsistent payload når handleren under en autoriseret prøve er ikke bundet; en yderligere kontrolmutation/probe skal deklareres. |
| m-K6j | 107 historikguard fjernes | DEKLARERET AFLEDNING | K:122; R:332; testkontekst U07. |
| m-K6k | 107 brugerårsag-propagering fjernes | DEKLARERET AFLEDNING | R:332,370; assert den indsendte årsag frem for bare nonblank audit. |
| m-K7a | 118 email→none | DEKLARERET AFLEDNING | B:91; R:354. Kræver også public downgrade/delete/recreate-negativ, som er udeladt F04. |
| m-K7b | 118 mapping uden check-column | MODSTRID | `c5b47ec5:40` har default `anonymized_at`; udeladelse af netop samme seedværdi ændrer ikke mappingen. B:33 foreslår en **forkert** check-kolonne, hvilket er en anden mutation. F11. |
| m-K7c | 118 ukendt strategi→original værdi ved replay | DEKLARERET AFLEDNING | R:348/E109; nyproduceret snapshot med kontrolafvigelse skal faktisk nå replay. |
| m-K7d | 118 generic_apply EXECUTE genindføres | DEKLARERET AFLEDNING | R:356; direkte authenticated-kald relevant, men øvrige interne kanter U02 består. |
| m-K7e | 118 telefon-strategi udelades | DEKLARERET AFLEDNING | `6083fecd:75–78`; R:350. |
| m-K7f | 118 silent NULL-strategifallback | DEKLARERET AFLEDNING | B:26; R:132,348; værdiassertion er rigtig. |
| m-K8a | 130 DML-grant glemmes | MODSTRID | F01/F11; i målarkitekturen skal app-grant netop mangle. |
| m-K8b | 130 sessionvar sættes før permission | MANGLER KILDE | B:83 er frø, ikke bevis for efterladt autorisation. Fejl-subtransaktion ruller ændringer tilbage; med app-revoke skal sessionvar heller ikke autorisere DML. Bind faktisk nåbar effekt i test, jf. R:232/T:183. |
| m-K8c | 130 EXECUTE fjernes fra offentlig RPC | DEKLARERET AFLEDNING | B:114; R:401; legitim positiv søsterhandling skal fejle. |
| m-K8d | 130 page-grant udelades | MANGLER KILDE | Page-check findes, men superadmin har eksisterende area-grant og has_permission har area-fallback, R:137,147,368. Seedrækkefravær er ikke i sig selv bevist approve-afvisning; bind en rolle uden anden arv. |
| m-K8e | 130 has_permission fjernes fra SECDEF | DEKLARERET AFLEDNING | B:127–130; R:387; direkte sikkerhedsgrænse. |
| m-K8f | 130 SECDEF_SANCTIONED-entry mangler | DEKLARERET AFLEDNING | R:376; legitim CI-kontrol, ikke domæne-runtime-kill. |
| m-K9a | 139 offentlig EXECUTE fjernes | DEKLARERET AFLEDNING | R:401; T:181. |
| m-K9b | 139 p_spring_validering_over tilføjes | DEKLARERET AFLEDNING | K:173; R:155; signaturtest er strukturel; faktisk bypass skal desuden ramme negativet hvis det implementeres. |
| m-K9c | 139 types:generate udelades | DEKLARERET AFLEDNING | R:151; types:check mod samme deployed schema kræves. |
| m-K9d | 139 core_identity fjernes fra types-listen | DEKLARERET AFLEDNING | B:140; R:397. CI-schema-/typekontrakt, ikke funktionelt domænekill. |

## 8. Kravets planfaseliste: intet navngivet emne efterladt

K:181 er en sammensat liste; R-Code har 13 V-punkter, R-Codex 14 P-punkter. Tabellen splitter underemner, så fx fravalgets overlevelse ikke forsvinder under ordet »rettigheder«.

| Emne i K:181 (og K:48/103/137) | Planens udfald | Dom over afgørelsens tilstedeværelse |
| --- | --- | --- |
| Mindst én stand ved opret/slet | V6/S-1: atomisk første stand; ingen delete; aktiv-minimum | Afgjort; realisering F01/F12 |
| Gruppe-arv på stand | V7: via lokation, ingen ekstra gruppekolonne | Afgjort |
| Effektiv ret afledt/materialiseret | V8: dateret afledning inkl. ejerhistorik | Afgjort; komposition/timing U03/U04 |
| Fravalg gennem nedlæg/genåbn | V8: bevares | Afgjort; ikke krævet nulstilling af M-19 |
| Lokale fravalgs-/frakoblingshandlinger på nedlagt | V4: afvis lokalt, tillad gruppehandling | Afgjort |
| Gruppe og leverandør én/to | V5: én | Afgjort; ordbog committet |
| Gruppetypes required-tidspunkt | V3: valgfri nu, krævet før rabat trin 29 | Afgjort |
| Gruppe ud af brug | V13: is_active, eksisterende relationer består | Afgjort |
| Kontakt-anonymisering kolonner/registry-JSONB | V1/V2/S-11/S-12: kolonner og nye kontakter efter anonymisering | Afgjort; dækning/ACL F03/F04/U02/U06 |
| Valuta/enhed/tom-pris | V11: DKK/dag numeric(12,2), top required, stand NULL-arv | Afgjort; grænser U05 |
| Fast/UI-udvidelig feltliste og CVR | V1: fast; kontakt i særskilt tabel; CVR ikke med | Afgjort; kravets analogi er ikke et must |
| Seeds ud over superadmin | V12: ingen; øvrige tildelinger via UI | Afgjort |
| Ændringstyper og undo-defaults | V10: fire typer; 24t, 0..30 døgn UI | Afgjort |
| Dvale og hvile én/to modelting | V9: én statusmodel, separat antal-konfiguration | Afgjort |
| Direkte/pending pr. handlingstype | V10/S-8/S-9: stamdata/status/hviledage direkte; klientrelationer pending | Afgjort; genbrugte interne/generiske indgange og sent apply mangler kontrakt |

**Svar på (c): JA til emnekomplette udfald; NEJ til påstanden »byggeren træffer ingen beslutning«.** De resterende F/U-punkter er implementerings-/bevis-/rammehuller, ikke fravær af fx V5 eller V11. Kravet behøver ikke genåbnes for at rette forældede grants, invalid kategori, kildehenvisninger eller manglende konkretiseringer.

## 9. De særligt efterspurgte M-bindinger

| Binding | Klasse | Samlet kontrol |
| --- | --- | --- |
| Maks én klient pr. stand — M-29 (M:55) | DIREKTE BELÆG | P:45,103 holder flere lokationsrettigheder adskilt fra bookingkapacitet. K:44,416 og T:163–165 lægger håndhævelsen i trin 24. Ingen krav om max én klient pr. lokation/gruppe indført. |
| Minimum én stand — M-17/M-18 (M:38–39) | MODSTRID | Valget V6 respekterer ordene og tilføjer aktiv-minimum som eget valg, men P's genindførte app-INSERT ophæver garantien om, at kun atomisk opret kan skrive. F01; reelt concurrency-bevis kræves F12. |
| Genåbnings-arv — M-19 (M:40) | DEKLARERET AFLEDNING | P:76,464 arver gruppens **da gældende** klienter. Bevarede fravalg er udtrykkeligt overladt til planen i K:181/R:413. M-36 betyder, at også senere oprettede lokationer kan få lokale fravalg; det er ikke et globalt fravalg der automatisk spreder sig. P's DDL er lokal og respekterer dette. |
| Dvale-stop i UI — M-27b (M:53) | DIREKTE BELÆG | P:85,329,466 leverer stop som aktiv-skift med rettighed/årsag/audit og straks synligt bookbar-opslag. Ingen »book alligevel«-parameter. API/ACL-bevisrest er særskilt F01/U02/U07. |
| Straks-virkning — M-29.5 (M:55, referent M:65) | DIREKTE BELÆG | P:86,303,468 følger **kravets deklarerede afledning** K:99 præcist: hviledage direkte uden approval/undo. M-29.5 siger selv »styres i retigheder«, ikke ordret hele mekanikken. Ingen ny antaget bekræftelse krævet. |

M-35 står i M:83 og bærer integrationsarbejdet. Den bundne ledger slutter med M-39; **M-40 findes ikke i denne kildeversion**. Rollebetegnelsen M-40 kommer fra brugerens aktuelle instruktion og er ikke brugt som opdigtet kilde til planens domænevalg.

## 10. Øvrige planpåstande og bro-bindinger

| ID | P-sted / påstand | Klasse | Dom |
| --- | --- | --- | --- |
| Z01 | 5/7: formål byte-identisk med K | DIREKTE BELÆG | Direkte bytekontrol af P:5 mod K:7. |
| Z02 | 11–14: historisk arbejds-pin ae73d833, blobs og læst længde | DIREKTE BELÆG | P's arbejds-pin er provenance, ikke denne audits HEAD. K/R blobs matcher ved ec4a3d9. K er 426 fysiske linjer, ikke 427; en linjetællingsfejl, ikke indholdsdrift. Læsehandlingen selv kan ikke efterprøves af dokumentets udsagn. |
| Z03 | 15: alle forbilleder genlæst, fra committet kilde | MANGLER KILDE | OID'er kan verificeres; at den tidligere aktør faktisk genlæste alt kan ikke attesteres her. Fejlcitaterne F09/F10 demonstrerer, at udsagnet ikke erstatter kildekontrol. |
| Z04 | 16: intet web og ingen kravændring foreslået | DIREKTE BELÆG | Ingen ændret kravtekst i P; §8 siger ingen retur. Tidligere værktøjsadfærd er alene aktørens erklæring. Denne audit har heller ikke brugt web. |
| Z05 | 18: seneste apply/approve/undo/select/index-definitioner er de angivne | DIREKTE BELÆG | Kontrolleret definitionskæden ved pin; C01–C03/C28. |
| Z06 | 141–151: hvert bid peger på K, kun ét forudsætningselement | MANGLER KILDE | Alle fem bids peger på K, men P:312 flytter også tre oracles til bid 2; reverse-matrixen beskriver kun status-tabellen. K-7-strukturforbud og P-8-bindingsrest er udeladt U01/U07. |
| Z07 | 206/319/334/425/442: lav/høj/middel-risiko og targeted/bred mutation | DEKLARERET AFLEDNING | Synlige faglige prioriteringer, ikke kildens objektive risikoklassifikation. Intet runtime-bevis foreligger. |
| Z08 | 499–519: ordbogsarv og nødvendige tilføjelser | DIREKTE BELÆG | O:29–34 har nu alle seks tilføjelser. »Før gaten«-arbejdet er udført ved audit-pin; talfejlen står tilbage F15. |
| Z09 | 525: parunikhed undgår cnp-fælde | DIREKTE BELÆG | R:71,272; DDL matcher korrekt par. |
| Z10 | 526: current-date closure alene kan ikke bære historiske retter | DIREKTE BELÆG | R:185,415. Afledt historik er velbegrundet; ikke bevis for alle adgangskombinationer U03. |
| Z11 | 527: ingen deferrable-præcedens, revoke gør RPC-modellen tæt | MODSTRID | Ingen præcedens er belagt R:49,179; tætheden modsiges af egne grants F01 og bevisfallback F12. |
| Z12 | 528: JSONB-fravalg betyder at konflationen aldrig rammes | MODSTRID | F14; normal generic_apply producerer stadig begge snapshotfelter. |
| Z13 | 530: alle nævnte recon-faldgruber adresseret | MODSTRID | DML/FORCE/fysisk downgrade/indirect-dækning er netop ikke løst; F01/F03/F04/F05. Andre punkter som femkolonne-index/payloaddato/replay er faktisk adresseret. |
| Z14 | 536–580: forudskrevet masterplandokumentation | DEKLARERET AFLEDNING | Fremtidig tekst efter build, tydelige placeholders. Gentager planvalgene; er ikke en uafhængig sandhedskilde. F01/F03/F06 skal rettes også her; status »✓ Godkendt« er betinget af senere faktisk godkendelse. |
| Z15 | 577–580: rettelse-17-reference mismatch | DIREKTE BELÆG | K:426 har præcis vedligeholdsflaget. |
| Z16 | 587: plan⊨krav, alle negativer og hele struktur dækket | MODSTRID | F01–F04 og A-K9.3 viser konkrete modbeviser; ac-nummerdækning er ikke fuld kravdækning. |
| Z17 | 589: princip-/M-troskab og UI-flade beviselig fuldt | MANGLER KILDE | Kerne-M-valg er overvejende tro; universaliteten mangler ACL/PII-/P8-bevis U01–U08 og indeholder direkte brud F01/F04. |
| Z18 | 591: alle navne/signaturer/gates valgt, byggeren træffer ingen beslutning | MANGLER KILDE | U01–U06: konkrete mangler er identificeret, ikke blot generel usikkerhed. |
| Z19 | 591: ændret forbillede mellem pin/build → HALT/ny SHA | DEKLARERET AFLEDNING | Fornuftig udtrykkelig versionsdisciplin; den ændrer ikke den aktuelle kildekontrol. |
| Z20 | 597: ingen kravreturer, to bekræftelseslinjer fulgt | DIREKTE BELÆG | K:31,99 og M:89: kravet godkendt på denne blob; planer kan rettes inden for rammen. Udsagnet »bygbart som skrevet« er ikke belæg for planens egen korrekthed. |
| Z21 | 600: live-state kan ikke afgøres statisk; CI fail-closed beviser eksponering | MANGLER KILDE | Første del korrekt R:663; anden for bred R:397,434. U08. |
| Z22 | 601: stop ved eksisterende fladebrud efter generic_apply-revoke | DEKLARERET AFLEDNING | Relevant kompatibilitets-/build-stop; R:356. Ikke grund til at genåbne usikker adgang stiltiende. |
| Z23 | 602: manglende to-sessionersharness kan bæres som residual | MODSTRID | Som ærlig oplysning ja; som erstatning for obligatorisk prøve nej. F12. |
| Z24 | 604: kill-list finaliseres bidbundet i fase 4 | DIREKTE BELÆG | R:432; T:169 kræver faktiske sourceankre efter build. Udkastene er ikke attest. |
| Z25 | 604: P-8 leveres senere før lås; planens matrix er input | MANGLER KILDE | T eksisterer allerede ved pin og kræver binding retur til planen; U01. Ingen P-8-blob eller udfyldt chain-step-matrix i P. |

## 11. Bundlinje pr. klasse

Optalt **272 klassifikationsrækker** i tabellerne ovenfor fordelt på klasser. Gentagne påstande og kilde-/mekanikdele er separate rækker; de 16 F-fund og 10 U-fund er den samlede fejlliste, ikke yderligere rækker i optællingen.

| Klasse | Rækker |
| --- | ---: |
| DIREKTE BELÆG | 74 |
| DEKLARERET AFLEDNING | 144 |
| MODSTRID | 30 |
| MANGLER KILDE | 24 |

- **DIREKTE BELÆG:** kernekravene om grupper/ejerkæde, flere klientrettigheder pr. lokation, bookinggrænsen, tre statusser, genåbning og dvale-stop er overvejende korrekt gengivet. De bærende nyeste pending-definitioner, femkolonne-grantindekset og direct-anonymiseringens faktiske loop er korrekt lokaliseret. Dette krediterer kildebelæg, ikke kørt effektbevis.
- **DEKLARERET AFLEDNING:** alle kravets navngivne planfasevalg er disponeret. To-tabelform, én gruppe/leverandør, faste kontaktkolonner, afledt ret med vedvarende fravalg, eventlogs, DKK/dag, NULL-hviledage og 24t-undo er synlige valg inden for mandatet. Afledninger må ikke opgraderes til ordrette M-udsagn eller »eneste mulige« løsning.
- **MODSTRID:** F01–F16 er konkrete rettelser, fra adgangs-/dækningsbrud til præcise kildefejl. D04/C50 er medtaget i F16/F15. De materielle stop før lås er især app-DML-grants, ugyldig kategori, indirect-anonymiseringshul, fysisk PII-nedgradering og erstatning af nødvendigt concurrency-bevis med kodeinspektion. Interne adgangskanter er en bærende kontraktmangel U02, ikke her attesteret som et udnyttet live-hul.
- **MANGLER KILDE:** U01–U10 samt de særskilt markerede mutant-/kontraktrækker viser, hvor påstået fuldstændighed ikke er dokumenteret. P-8's version, kædematrix, datakilde og eksekveringskontrakt skal bindes før lås; manglende non-admin/synligheds-/dato-/mappingkontrakter kan ikke overlades til byggerens gæt.

## 12. Konklusion før plan-lås

**(a) Recon-2 citeres kun delvist korrekt:** mange spans er præcise, men flere påstande tager recon-Codes ældre skabelonforklaring som autoritet over recon-Codex' eksplicitte modbeviser. Der er også konkrete forkerte spans/funktionsattributioner, dokumenteret i citattabellen.

**(b) M-ordenes produktmodel er overvejende respekteret, men planen realiserer ikke alle garantier:** maks én klient pr. stand er korrekt overdraget til booking-leddet; genåbning arver aktuelt med planvalgte lokale fravalg; dvale-stop og straks-hviledage er bevaret. Minimum én stand og de øvrige »kun via RPC«-forbud undermineres af den valgte adgangs-DDL. Kravets persondata-/klassifikationsramme er heller ikke opfyldt.

**(c) Alle emner på kravets planfaseliste er afgjort; planen er stadig ikke låseklar.** Ret F-fundene og bind U-kontrakterne, navnlig P-8. Derefter skal den nye planblob kildetjekkes mod samme kravblob og de berørte kilder. Denne audit ændrer hverken krav, plan eller kode og udsteder ingen plan-OK.
