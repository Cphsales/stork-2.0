Alle syv input er læst i fuld længde (plan v2 796 linjer, krav 427, ledger M-1..M-41, ordbog, P-8, runde-1-audit, fold-ind-rapport). Her er auditen.

---

# Antag-aldrig-audit · plan v2 · lokations-skabelon · runde 2

**Rest-status: 6 fund** (2 medium · 4 mindre). Heraf 2 ægte spørgsmål, 2 bekræftelser, 1 omklassificering af en eksisterende linje, 1 synlig default. Fold-ind-rapportens »KRÆVER MATHIAS = 0« holder ikke: to spørgsmål består bord-testen og er materielle nu.

**Binding-forbehold først:** Bash er afvist i denne session, så jeg kunne IKKE køre `git hash-object`. Alle blobs nedenfor er læst ved sti i workdir'en; OID'erne er opgavens og planens egne påstande, ikke min verifikation. Se afsnit »Binding«.

## Positivt først · hvad der bæres

- **Formål** plan:5 er byte-identisk med krav K:7.
- **Krav-linjeankre** plan:104/117/131/144/160/173/191/203/216 (K:17-31 … K:163-177) rammer kravets faktiske afsnit; alle 53 acceptkriterier er afbildet (5+6+6+9+5+10+4+5+3), og de fem aliasser (plan:18) parrer identisk krav-tekst: K:29=K:171-kontekst, K:100=K:171, K:120=K:63, K:121=K:65, K:125=K:85. Intet krav-indhold tabes i aliasserne.
- **Plan-fase-afgørelser inden for kravets delegation K:181:** V3 type valgfri (kravets default) · V4 fravalg/frakobling på nedlagt afvises (kravets default) · V5 én entitet, ordbog:30 · V6 mindst én stand, K:46/K:48 · V7 gruppe-arv afledt · V8 ret afledes · V9 én model-ting, K:103 · V10 direkte-vs-godkendelse pr. handlings-type · V11 valuta/tom pris · V12 seeding · V13 gruppe ud af brug, K:64 + M-36 »sletning af en gruppe der har lokationer« umuligt.
- **M-citater efterprøvet ordret mod ledgeren:** M-12 (V13 »frakobling virker altid«), M-13, M-14 (DDL-kommentar plan:414), M-17 »en gruppe oprettes med navn« (V3), M-18 (S-1), M-19, M-21 »antal hvile dage« (V9, hviledage-kolonnen), M-25.1, M-27b (stop-før-tid = W12 'aktiv'), M-28, M-29.5 korrekt mærket som kravets afledning (V10), M-36 (K-3/ac-4 »senere lokationer«). Ingen parafrase i anførselstegn.
- **Kravets to godkendte afledninger** bæres videre uændret: K-1 »lokation uden klienter« (K:31) → P-8 T:214 + plan C2 »ingen krav om mindst én klient«; K-5 ac 3 straks-virkning (K:99) → W8 uden pending (plan:286). Begge er Mathias-sanktionerede via krav ok M-38.
- **Ordbog:** de seks plan-fase-entries findes committet ordbog:29-34; planens systemnavne i §5 matcher dem 1:1 (stande, grupper, 'aktiv'/'dvale'/'nedlagt', gruppens type-værdier, gruppe_kontakter, klient_id).
- **P-8 optaget loyalt:** T:24-matrixkravet → §1-kolonner C/N; alle T:26-planparametre har ét udfald (V1, V5, V6, V8/B-2, V9, V10, V11, S-3/S-4, S-20); T:150 eksplicit afvisning → K-2/ac-1 neg-1..4; T:163-165 overdragelser → §9; T:189 navnekollision → K-3/ac-3; T:191 clock-driver → FA-3; orakel T:196-203 = plan:96.
- **Kravets negativer er i matrixen** med pinnet afvisningsklasse: K-1 ac1/2 · K-2 ac1/5/6 · K-3 ac1/2/3/5 · K-4 ac1/2/3/4/8 · K-5 ac2/3/5 · K-6 ac1/2/4/6/10 · K-7 ac1/S · K-8 ac1-4 · K-9 ac2/3.
- **IKKE-i-scope respekteret:** §9's overdragelser svarer til K:411-418 (booking pr. stand, kampagne-trigger, bookings ved frakobling, prisforbrug, lag F, migration).
- **HALT-flag INGEN** (plan:738): jeg finder heller ingen modsigelse mod kravet i forretnings-forstand; K-6 ac 3 (ingen slutdato), K-4 ac 6 (dvale rører ikke koblinger) og K-2 ac 4 (overdragelse) er alle holdt.

## FUND2 · ubekræftede afledninger i v2

### FUND2-1 (medium) · V1 gruppens feltliste FAST går mod kravets default og M-23
- **Citat:** plan:566 »V1 · Gruppens feltliste: FAST (rigtige kolonner) — navn, type, kontaktpersoner i egen tabel … Afviger fra kravets analogi-default … CVR m.v. medtages IKKE (intet Mathias-ord; ny kolonne = én migration).«
- **Hvorfor kilden ikke bærer:** K:181 sætter default »som for klienter« (UI-udvidelig); K:57 lister »øvrige felter« som UI-værdi; M-23 »alt skal kunne styres i ui« afleder i ét skridt til UI-udvidelig. Planen vælger det modsatte og gør nye gruppe-felter til udviklerarbejde. Afvigelsen er deklareret teknisk (U09) men står ingen steder i Mathias' sprog: Blok A plan:698-699 nævner navn/type/kontaktpersoner uden at sige at listen er lukket. Kravet har forrang; en M-23-afledning kan ikke gøres til bekræftelse af det modsatte valg.
- **Forslag:** ægte spørgsmål, liste S-1.

### FUND2-2 (mindre) · fravalg af klient uden gældende kobling afvises
- **Citat:** plan:138 »neg-2: lokation_klient_fravaelg(L1, C3) → AK-IKKE-I-GRUPPEN (fravalg af outsider er meningsløst — afvises samme sted)«; plan:293 W15-vagt »IKKE-I-GRUPPEN (dækkende åben/fremtidig kobling … på p_gaeldende_fra)«.
- **Hvorfor kilden ikke bærer:** K:65, K:121, M-17 og M-36 siger positivt »kan fravælge en klient gruppen har«; intet sted står negativet »fravalg af en klient uden kobling AFVISES«. »Meningsløst« er planens dom. Forretningskant: Alka skal ind i Coop men holdes ude af Bilka Hundige fra første dag. Med planens regel kan fravalget først bedes om når koblingen er effektueret; bedes koblingen om »fra i dag«, har Alka ret i Bilka Hundige mindst én dag (fortrydelsesfrist + S-17) før fravalget kan gælde. Dateres begge frem, opstår ingen åbning.
- **Forslag:** bekræftelse, ét skridt fra M-17/M-36 »klienter som gruppen har«, med konsekvensen synlig. Liste B-4.

### FUND2-3 (medium) · »persondata« indsnævret til »direct« (S-24/B-3)
- **Citat:** plan:617 »Læsning deklareret: »persondata-felt« i K-7 ac 4's dæknings-forstand = pii_level='direct'«; plan:743 B-3 »Vælger I »indirekte« registreres det, men der sker ingen anonymisering«.
- **Hvorfor kilden ikke bærer:** K:143 »ingen persondata-felt uden anonymiserings-vej (intet tavst GDPR-hul)« bruger ét ord; fundamentet har to persondata-niveauer. Planen indsnævrer til direct. Det er deklareret og fremlagt som B-3, men B-3 er ingen ét-skridts-afledning af et M-ord (K:145 »intet Mathias-ord nødvendigt«, K:134 »intet Mathias-ord klassificerer lokationens felter«) og er derfor ikke en bekræftelse i M-33's forstand. Kravet har forrang (opgavens regel). Delen »adresse = none ved levering« bæres af K:142 og er immateriel nu: none og indirect opfører sig ens i fundamentet, og UI kan ændre uden udvikler. Den materielle rest er hvad der skal ske når en bruger vælger »indirekte«: svaret »altid anonymisérbar« ændrer Bid 1/5 (værn eller vej), svaret »registrering ok« lader planen stå.
- **Forslag:** ægte spørgsmål i forretningsform, liste S-2, anbefaling »registrering ok« (fundament-præcedens: klienters felter). B-3 i sin nuværende form (tre beslutninger, systemord) udgår. Dømmer driveren det nedstrøms, går det på nedstrøms-listen med B-3's stilling som default.

### FUND2-4 (mindre) · ny stand på nedlagt lokation afvises (S-8/W9)
- **Citat:** plan:601 »S-8 Stamdata på nedlagt lokation: W6/W7/W8/W10/W11 TILLADT; W9 (stand_opret) afvist (ny kapacitet på ude-af-drift)«; plan:287.
- **Hvorfor kilden ikke bærer:** K:71 definerer nedlagt som »kan ikke bookes; alle klienter kobles automatisk fra, standene består; kan genåbnes«. K:181 delegerer kun fravalg/frakobling på nedlagt (default afvises), ikke stand-oprettelse. M-30.2 »den skal væres åben« svarede på Q-R5-2 om klient-aftaler. Analogi, ikke samme sag. Ikke synlig for Mathias (Blok A tavs). Asymmetrien (omdøbe, prissætte og tage stande ud af brug samt skifte gruppe er tilladt på nedlagt) er permissiv og kræver ingen linje, men driveren bør kende den.
- **Forslag:** bekræftelse via analogi M-30.2 + K-4 ac 8, batchet. Liste B-5.

### FUND2-5 (mindre) · ny lokation fødes »aktiv«
- **Citat:** plan:595 »S-2 … Ny lokation fødes aktiv (init-event i W5) — valgt her: den oprettes for at bruges (K-4 »kan bookes«); ikke en nødvendighed (U09)«.
- **Hvorfor kilden ikke bærer:** K-4 kræver præcis én tilstand men siger ikke hvilken en ny lokation starter i; K:181 delegerer det ikke; intet M-ord. Effekt: en nyoprettet butik er bookbar straks (trin 24) medmindre den sættes i dvale manuelt. Ikke i Blok A.
- **Forslag:** synlig default, intet spørgsmål (M-33: lav materialitet, omvej findes). Liste D-1.

### FUND2-6 (mindre) · B-2 tilskrives M-13 + M-19
- **Citat:** plan:742 »B-2 … Afledt af M-13 (historik) + M-19 (genåbning arver gruppen)«.
- **Hvorfor kilden ikke bærer:** M-13 siger at fravalgs-rækken bevares, ikke at fravalget stadig gælder; M-19 (»ja« til automatisk tilbage for gruppens klienter) tager ikke stilling til fravalg. K:181 delegerer netop dette til plan-fasen (»om en lokations fravalg består gennem nedlæggelse og genåbning«). Linjen er rigtig at fremlægge; etiketten »afledt af M-ord« er falsk autoritet.
- **Forslag:** relabel til »plan-valg inden for kravets ramme (K:181)«; behold linjen med navngivet scenarie og ja/nej. Liste B-2.

### Synlighedsmangler · ikke fund
Bæres af kravets eller P-8's delegation, men står ikke i Mathias' sprog nogen steder. Hører på »flyttet til plan-fasen«-listen (liste D-2..D-8):
- S-18 »dag« = UTC: P-8 T:78 delegerer tidsgranularitet; Blok A:675 »UTC-datostempel« er systemord. Et skift kl. 00.30 dansk tid dateres dagen før.
- V12 rettigheds-område `org_structure`: K:181 seeding. Area-adgang arver ned på grupper/lokationer (plan:22 has_permission-kæden).
- V10/W7 gruppe-skift direkte uden godkendelse: K:181 direkte-vs-godkendelse. Effekten er alle Coop-klienters ret på butikken samme dag.
- V6c stand-deaktivering + »sidste aktive stand«: K:46/K:48; Blok A:673 har det, fremlæggelsen mangler det i hans ord.
- AK-DATO-FOER-START »også samme dag« plan:81 + CHECK plan:504: en kobling varer mindst én dag. Model-valg uden kilde, lav materialitet.
- S-4 ophørsdag aktiv: P-8 T:230 accepterer halvåbent; siden er planens. Nedstrøms UI-tekst (lag F).
- S-16 type krævet, adresse valgfri: Blok A:672 har det; »andet« gør det harmløst.

### Noter · ikke fund
- Blok A plan:690 »genåbning arver gruppens da gældende klienter (M-19)« står stadig med M-19 alene; runde-1-noten er rettet i V8 plan:580 men ikke i Blok A.
- Arv-note plan:753: en godkendt ændring der fejler ved apply forbliver »approved« (partial_failure). Mathias vil senere se en godkendt ændring der aldrig træder i kraft og aldrig bliver »afvist«. Fundament, ikke pakke, men bør nævnes i fremlæggelsen som kendt grænse.
- B-1's konsekvens for til-kobling: en kobling »fra i dag« træder tidligst i kraft dagen efter fortrydelsesfristen. Bør stå eksplicit i B-1.
- S-24 klassificerer gruppens/lokationens navn none uden recon-flag; for enkelt_butik gælder samme logik som adressen. UI kan ændre; nedstrøms.
- plan:20 »M-40 D10/D11/D12/D13 + E20«: sub-nummereringen kan ikke efterprøves i ledgeren (workflow, ingen krav-substans).
- Planen skriver »426 fysiske linjer« om kravet; Read viser 427. K:linje-ankrene rammer korrekt, så det er formentlig slutlinje-tælling.

## Runde-1-status · FUND-1..5 + fold-ind's »kræver Mathias«

| fund | v2-tilstand | dom |
| --- | --- | --- |
| FUND-1 persondata→direct | deklareret S-24 + B-3 | ADRESSERET men FORKERT KLASSIFICERET: B-3 er ikke ét-skridts fra et M-ord → FUND2-3 |
| FUND-2 max_rows-attribution | plan:661 »recon-2's K-9-fladekontrakt … ikke kravets (FUND-2)«; K-9-matrixen nævner det ikke | LUKKET |
| FUND-3 hedge klippet i citat | plan:582 »En cron er ikke nødvendigvis nødvendig …« (R2-K5, ordret) | LUKKET |
| FUND-4 »V-A« dinglende | K-2/ac-1 plan:121 »kilde: DDL §3 Bid 2 + pg_catalog-assert«; DDL plan:398 »S-1«; ingen »V-A« i v2 | LUKKET |
| FUND-5 fem→seks | plan:20 og plan:631 »seks«; ordbog:29-34 talt = 6 | LUKKET |

Fold-ind-rapporten (§2) melder KRÆVER MATHIAS = 0 og tre bekræftelser B-1..B-3. Min dom: B-1 er en ægte bekræftelse; B-2 er et plan-valg med forkert etiket; B-3 er ikke en bekræftelse og bærer tre beslutninger. Dertil to nye spørgsmål (FUND2-1, FUND2-3) og to nye bekræftelser (FUND2-2, FUND2-4). Rapportens »0« er derfor ikke retvisende.

## Samlet Mathias-liste · til devil-passet

Ét punkt pr. linje, ordbogens ord, scenarie med navne, ét-ords-svar. Klassifikation pr. M-33.

| id | type | tekst til Mathias | kilde | eksisterende svar | materialitet |
| --- | --- | --- | --- | --- | --- |
| S-1 | SPØRGSMÅL (FUND2-1) | »Coop-gruppen oprettes med navn, type og kontaktpersoner (navn, e-mail, telefon). Får I senere brug for et ekstra felt på gruppen, fx CVR-nummer: skal I så selv kunne tilføje feltet i UI, som I kan på klienter, eller er det i orden at det kræver en udvikler? Svar: selv i UI / udvikler ok.« | K:181 default »som for klienter« · K:57 · M-23 | kravets default = selv i UI; planen V1 = udvikler ok | NU: afgør Bid 1's model; kan ikke ændres via UI bagefter |
| S-2 | SPØRGSMÅL (FUND2-3) | »I markerer i UI at Bilka Hundiges adresse er persondata. Skal systemet så altid kunne anonymisere adressen (ellers afvises markeringen), eller må markeringen stå som en ren registrering uden anonymisering? Svar: altid anonymisérbar / registrering ok.« Anbefaling: registrering ok. | K:143 · K:134 »vores læsning« · K:145 intet M-ord | planen S-24/B-3 = registrering ok for »indirekte«; fundament-præcedens klienters felter = samme | NU hvis »altid anonymisérbar« (værn eller vej i Bid 1/5); ellers uændret |
| B-1 | BEKRÆFTELSE (plan, behold) | »Tryg bedes koblet fra Coop fra 1/10. Godkendelsen falder først 3/10. Så gælder frakoblingen fra 3/10, ikke 1/10: intet ændres bagud. Det samme gælder til-kobling og fravalg, og en kobling »fra i dag« gælder tidligst fra dagen efter fortrydelsesfristen er udløbet. Står medmindre du siger stop.« | K:122 (K-6 ac 6) · M-13 · P-8 T:230 | ét skridt fra K-6 ac 6 | NU: Bid 4 |
| B-2 | PLAN-VALG-LINJE (FUND2-6, relabel) | »Tryg er fravalgt i Bilka Hundige. Butikken nedlægges og genåbnes et år senere. Er Tryg stadig fravalgt ved genåbningen, indtil I ophæver fravalget? Planen siger ja. Svar: ja / nej.« | K:181 delegerer · M-19 »ja« uden stilling til fravalg | intet M-ord i ét skridt; plan-valg V8 | NU: P-8 C8 kræver valget låst før build |
| B-4 | BEKRÆFTELSE (FUND2-2) | »Alka skal kobles på Coop, men må ikke stå i Bilka Hundige. Dit ord: »lokationer kan godt fravælge klienter som gruppen har« (M-17). Planen: fravalget kan først laves når Alkas kobling til Coop gælder; dateres både kobling og fravalg frem, gælder udelukkelsen fra første dag. Står medmindre du siger stop.« | M-17 · M-36 · K:65 | ét skridt fra »klienter som gruppen har« | NU: W15-vagt Bid 4 |
| B-5 | BEKRÆFTELSE via analogi (FUND2-4) | »Bilka Hundige er nedlagt. Dit ord om klient-aftaler på en nedlagt butik: »den skal væres åben« (M-30.2). Planen bruger samme regel for nye stande: en ny stand kan først oprettes når butikken er genåbnet. Står medmindre du siger stop.« | M-30.2 (analogi) · K:84 | analogi, ikke samme sag | NU: W9-vagt Bid 2 |
| D-1 | SYNLIG DEFAULT (FUND2-5) | »En ny butik er aktiv og kan bookes fra oprettelsen. Skal den vente, sættes den i dvale straks efter.« | ingen; K-4 kræver én tilstand | plan S-2 | lav; omvej findes |
| D-2 | SYNLIG DEFAULT | »Systemets »dag« skifter kl. 01/02 dansk tid, ikke ved dansk midnat. Et skift kl. 00.30 dateres dagen før.« | P-8 T:78 delegerer | plan S-18 | lav i drift; historik-datoer |
| D-3 | SYNLIG DEFAULT | »Grupper og lokationer lægges under rettigheds-området »organisation«. Den der har adgang til hele området får dermed også adgang til grupper og lokationer.« | K:181 seeding | plan V12 | kan flyttes senere via fælles rettigheds-UI |
| D-4 | SYNLIG DEFAULT, står medmindre stop | »Skifter Bilka Hundige fra Coop til en anden gruppe, sker det straks med rettighed og årsag, som et statusskift: Coop-klienternes ret i butikken ophører fra samme dag, den nye gruppes klienter får ret. Ingen godkendelse og ingen fortrydelsesfrist.« | K:181 direkte-vs-godkendelse · analogi K-4 statusskift | plan V10/W7 | NU: Bid 2 |
| D-5 | SYNLIG DEFAULT | »En stand kan tages ud af brug uden at slettes. Den sidste stand i brug på en butik kan ikke tages ud af brug; sæt butikken i dvale eller nedlagt i stedet.« | K:37 · K:46 · K:48 · M-17 | plan V6c | NU: Bid 2 |
| D-6 | SYNLIG DEFAULT | »En kobling eller et fravalg varer mindst én dag. Frakobling eller ophævelse fra samme dag som starten afvises; fortryd inden fristen, eller vælg dagen efter.« | ingen; model-valg | plan AK-DATO-FOER-START | lav |
| D-7 | NEDSTRØMS (lag F) | »Dvale »til den 5. oktober« betyder at butikken kan bookes igen den 5. oktober.« UI-teksten i lag F skal sige det samme. | P-8 T:230 accepterer halvåbent | plan S-4 | nedstrøms; default deklareret |
| D-8 | SYNLIG DEFAULT | »Type er krævet på en lokation; »andet« kan altid vælges. Adresse er valgfri.« | K:19 feltliste · M-24 | plan S-16; Blok A:672 | lav |

**Udgår:** B-3 i nuværende form (tre beslutninger; systemordene »direkte persondata«/»indirekte« står ikke i ordbogen). Del (i) adresse = forretningsdata ved levering bæres af K:142 og kræver ingen linje; del (ii) vejen er bygget er leverance, ikke beslutning; del (iii) bliver S-2.

**Form-rettelser til B-1:** udskift »effektueres/effektueringen« med »træder i kraft«; tilføj navne som ovenfor.

## Binding

Bash afvist i sessionen: `git hash-object` kunne ikke køres. Ingen blob er hash-verificeret af mig. Filerne er læst ved sti i workdir'en @ `deb8b2cfe4ff22894feccef54950c4dec9ab0536` (uden .git); OID'erne nedenfor er opgavens, og plan v2's hoved plan:13-20 samt fold-ind-rapport:3 hævder de samme værdier for krav, recon2, P-8, kill-list, forventningsliste, ordbog og ledger. Planens eget arkiv-pin `d7972a13` afviger fra min workdir, som forventet.

| input | sti | OID (opgavens) | læst |
| --- | --- | --- | --- |
| plan v2 | plan-build/lokations-skabelon/plan.md | 2069aa16e36d4b693ddad5f6166ec928ee72fa45 | 796/796 linjer |
| krav | docs/sandhed/krav/lokations-skabelon-krav.md | 9402164d87a35fb939661058bea77c1a052493d0 | 427/427 linjer; K:linje-ankre stemmer |
| ledger | plan-build/lokations-skabelon/mathias-ord.md | 14722b4c17fba1011709525ef4a06a7cabe2cfa8 | M-1..M-41 + referenter Q1-Q5, Q-R5-2/4 |
| ordbog | plan-build/lokations-skabelon/ordbog.md | bcab6b4ed9c9c0fe21f13c70d8e1d47a2afd9fef | 34 linjer; 6 plan-entries talt |
| P-8 | plan-build/lokations-skabelon/p8-slutproeve-spec.md | 4af07ef4164882ca54643e79df3554c0bf22b0e4 | 275 linjer; T:24/26/78/150/189/191/214/230/252 verificeret mod indhold |
| runde-1-audit | plan-build/lokations-skabelon/plan-audit-fresh-eyes-r1.md | cb10e231 | afsnit »Plan-audit (blob 423d9b20)« linje 193-221 |
| fold-ind-rapport | plan-build/lokations-skabelon/fold-ind-rapport-r2.md | 39936c64f96d9dc6ac97af87d7ddd8b1e20f99bb | 108 linjer |

Ikke læst, uden for opgavens kildesæt: recon2, mutationsbilag, kill-list, forventningsliste, kode. Web ikke brugt. Intet skrevet.