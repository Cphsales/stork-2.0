# lokations-skabelon — krav-og-data

Status: UDKAST (runde 2) · alle Mathias-svar 2026-09-02/03 indarbejdet · kilder pr. K citerer ledger `plan-build/lokations-skabelon/mathias-ord.md` (M-n); 2/9-ord og 7 relæ-svar afventer ledger-id (markeret) · recon_oid: 7fbd3a2f43c03ce239aa81e20483326bf438463c @ commit afcf4080a6c3619462eb9e53df10f49495e19abf · anker: masterplan §4 trin 10b / §1.12

## Formål — hvad pakken leverer

Lokations-skabelonen: fysiske lokationer med stande (placements), grupper (ejere), klient-tilladelser (hvilke klienter må stå hvor), status-livscyklus og hvile-regler som central master-data — UI-styret, auditeret og klar til at bære bookinger og resten af FM-kæden (trin 24-29) uden om-design. Fundamentet for hele FM-grenen.

**Grundlag:** recon (3-blind, gate åben) @ OID ovenfor · Mathias' krav-ord 2026-09-02: UI-styring med struktur/værdi-skel ("noget skal være hardkodet — fx at en lokation skal have et navn; men HVILKET navn styres i UI") · status `aktiv · dvale · nedlagt`, kun aktiv bookbar · nedlagt kan genåbnes · tilladelser må oprettes i dvale når den bookede dato ligger efter dvalens ophør · hvile-reglen er absolut, men perioden kan stoppes i UI · aftaler laves pr. lokation, hver lokation har en gruppe som ejer · migration: importeres senere · Mathias' krav-ord 2026-09-03 (verbatim): "alle lokationer ejes af en gruppe (eks. coop) og … i en lokation kan oprettes flere stande. derfor kan der godt være flere klienter på en lokation samtidig men der kan maks være 1 klient pr stand" · hvileperiode-ændring "styres i rettigheder" · "klienter skal altid kunne kobles på og fra på de enkelte lokationer" · kobling på nedlagt lokation: "nej - men det er vigtigt vi bevære den historikse data" · "klienter kobles automatisk fra lokationer når den nedlægges men lokaitoner beholder de oprettede stande" · efter fremlæggelse-1: "en lokation har minimum 1 stand" (præciseret: "med minimum en stand menes der at gruppe ejer lokation og lokation ejer stand") · "loaktioner ejes af en gruppe: en gruppe oprettes i ui. en gruppe oprettes med navn og der kobles klienter på gruppen. disse klienter arver lokationerne og dermed kan loaktion kun have klienter som der er i gruppen. loaktioner kan godt fravælge klienter som gruppen har".

**Sprog-note:** Mathias' ord "gruppe"/"ejer" svarer til masterplanens "leverandør" (§1.12) — om gruppe og leverandør er én eller to entiteter afgøres i plan-fasen (ordbog 04e5cfb); forretnings-kravene (ejer, type som rabat-anker, klient-kobling) gælder gruppen. Hans "stand" er masterplanens "placement" — samme entitet, to navne. Kravet skriver hans ord først og systemordet i parentes ved første brug: "gruppe (leverandør)", "stand (placement)". Klient-tilladelser skrives som forretningsforstaaelse §14's egen funktion — "hvilke klienter må stå/sælges på hvilke lokationer" — med Mathias' ord for handlingen: klienter "kobles på" gruppen og "fravælges" pr. lokation; ikke som et dateret aftale-objekt (Mathias 2026-09-03: "hvad menes der med aftaler?"); datoer og versionering er plan-mekanik. Doc-citater står uændret.

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

**Kilder:** §1.12 (lokations-entitetens felter, type-listen, status, hvile, anonymized_at) · §2.7.1 (attribution via klient, aldrig lokation) · §2.7.8 (markeder/messer uden særmodel) · forretningsforståelse §14 (lokation som master-data) · Mathias 2/9 struktur/værdi-ord ("noget skal være hardkodet — fx at en lokation skal have et navn; men HVILKET navn styres i UI") — **afventer ledger-id** (verbatim i Grundlag).

### K-2 Stande (placements) under lokation

**HVAD:** Ejerkæden er fast: **gruppe ejer lokation, lokation ejer stand** (Mathias 2026-09-03). En lokation har mindst én stand og kan have flere stande (placements) under sig — samme entitet, ét hierarki ("i en lokation kan oprettes flere stande" · "en lokation har minimum 1 stand"); en stand hører altid til præcis én lokation. Standen er den enhed én klient ad gangen står på: flere klienter kan være på lokationen samtidig, men aldrig to klienter på samme stand samtidig — låst forretningsregel. En stand kan bære egen dagspris; ellers gælder lokationens.

- **Struktur (umuligt):** cykler (en lokation kan aldrig — direkte eller gennem led — være sin egen over-lokation) · stand uden entydig pris-opløsning · to klienter på samme stand samtidig · stand uden lokation · lokation uden stande · booking på stand under ikke-aktiv lokation (via K-4) · stande der forsvinder ved nedlæggelse.
- **Værdi (UI):** hvilke stande, navne, egne priser.

**Acceptkriterier (slut-effekter):**
1. En skrivning der skaber en cyklus i hierarkiet AFVISES.
2. Stand uden egen pris læses entydigt med lokationens pris — der findes aldrig to sandheder om samme pris.
3. En stand under en lokation i dvale eller nedlagt er IKKE bookbar (håndhæves via K-4's aktiv-opslag).
4. Én klient pr. stand ad gangen: skabelonen leverer standen som den enhed en booking binder til, så to klienter på samme stand på samme dag AFVISES i booking-leddet (trin 24 forbruger stand-identiteten). Retten til at stå på lokationen kommer fra gruppe-koblingen (K-6); hvilken stand klienten står på afgøres ved booking.
5. Nedlæggelse af lokationen sletter ingen stande — de består og er klar ved genåbning (Mathias 2026-09-03: "lokationer beholder de oprettede stande").
6. Ejerkæden kan IKKE brydes: en stand uden lokation kan ikke findes, en lokation uden gruppe kan ikke findes (K-3), og en lokation har altid mindst én stand — standen er den enhed en klient står på (Mathias 2026-09-03).

*Plan-fase:* Mathias' model er gruppe → lokation → stande; om en stand kan have under-stande er ikke forretnings-afgjort (planner afgør i rammen) · hvordan mindst én stand sikres ved oprettelse og ved sletning · gruppe-arv på stand — inden for dette kravs ramme.

**Kilder:** M-17 ("en lokation har minimum 1 stand") · M-18 ("gruppe ejer lokation og lokation ejer stand") · M-14 ("lokaitoner beholder de oprettede stande") · **M-23+ afventer** (relæ-svar "stande-model": flere stande pr. lokation, maks 1 klient pr. stand) · §1.12 (placements, pris-arv, cycle-detection).

### K-3 Gruppe (leverandør) som ejer — klienter kobles på gruppen

**HVAD:** Hver lokation tilhører en gruppe — ejeren (Brugsen → Coop; et center → Dansk Shoppingcentre); ejerkæden er gruppe → lokation → stand (K-2). Gruppen oprettes i UI med navn (Mathias 2026-09-03) og er egen master-data-entitet med type (kæde / enkelt-butik / messe-operatør / andet — §1.12; typen er opslags-anker for rabat-mekanikken der bygges i trin 29). **Klienter kobles på gruppen** og arver dermed gruppens lokationer: en lokation kan kun have klienter der er i gruppen, men kan fravælge klienter gruppen har (Mathias 2026-09-03: "der kobles klienter på gruppen. disse klienter arver lokationerne og dermed kan lokation kun have klienter som der er i gruppen. lokationer kan godt fravælge klienter som gruppen har"). Bookinger laves pr. lokation/stand. 2/9-ordet "aftaler laves pr. lokation" er hermed præciseret: koblingen ligger på gruppen, til-/fravalg pr. lokation (K-6).

- **Struktur (umuligt):** lokation uden gruppe · gruppe som fritekst på lokationen (altid reference til gruppe-entiteten — én sandhed, ingen stavevarianter) · gruppe uden navn · type-løs gruppe · klient på en lokation uden at være koblet på lokationens gruppe.
- **Værdi (UI):** hvilke grupper, navne, typer og øvrige felter (felt-registry — feltlisten er selv UI-data) · hvilke klienter er koblet på gruppen · hvilke klienter en lokation fravælger; kontaktperson-oplysninger er persondata (K-7).

**Acceptkriterier (slut-effekter):**
1. Oprettelse af lokation uden gruppe-kobling AFVISES.
2. Gruppe angives ved valg af eksisterende gruppe-entitet — et fritekst-gruppenavn på lokationen kan IKKE eksistere.
3. Gruppe uden navn eller uden type AFVISES.
4. Klienter kobles på gruppen og arver ALLE gruppens lokationer — også lokationer der kommer til senere; en klient der ikke er koblet på gruppen kan IKKE stå på nogen af dens lokationer (til-valg AFVISES).
5. En gruppe med lokationer kan IKKE slettes — kun deaktiveres/udfases (historik består).
6. En lokation kan fravælge en klient gruppen har: klienten kan så IKKE stå dér, men fortsat på gruppens øvrige lokationer; fravalget kan ophæves igen.

**Kilder:** M-17 (gruppe oprettes i UI med navn; klienter kobles på gruppen; arver lokationerne; lokation kan fravælge) · M-18 (gruppe ejer lokation) · **M-23+ afventer** (relæ-svar: "alle lokationer ejes af en gruppe (eks. coop)") · §1.12 (leverandør-entitet, type-liste, rabat-anker) · §1.8 (klient-reference-kontrast) · princip 9 (ac 5: udfases, aldrig slettes).

### K-4 Status-livscyklus: aktiv · dvale · nedlagt

**HVAD:** En lokation står altid i præcis én af tre tilstande (Mathias 2026-09-02): **aktiv** (kan bookes) · **dvale** (hviler — kan ikke bookes; kan forberedes med tilladelser) · **nedlagt** (ude af drift — kan ikke bookes; alle klienter kobles automatisk fra, standene består; kan genåbnes). Skift sker via dedikeret handling med angivet årsag, auditeres, og historikken bevares.

- **Struktur (umuligt):** booking på ikke-aktiv lokation · status uden for de tre tilstande · status-skift uden årsag · overskrevet/slettet status-historik · status-skrivning uden om den dedikerede handling.
- **Værdi (UI):** hvilken lokation står i hvilken tilstand hvornår; dvalens ophør (K-5).

**Acceptkriterier (slut-effekter):**
1. En status-værdi uden for {aktiv, dvale, nedlagt} AFVISES.
2. Status-skift uden angivet årsag AFVISES; hvert skift auditeres.
3. Status-skrivning uden om den dedikerede handling AFVISES.
4. Det er UMULIGT at overskrive status-historik — hvad der gjaldt hvornår kan altid ses.
5. Aktiv-opslaget pr. dato svarer entydigt (fladen trin 24's booking-gate forbruger): booking på dvale/nedlagt AFVISES dér.
6. Til-/fravalg af klienter (K-6) MÅ ske mens lokationen er i dvale — det AFVISES IKKE (den bookede dato skal ligge efter dvalens ophør; håndhævelsen af selve booking-datoen er trin 24).
7. Genåbning af nedlagt lokation er MULIG via samme dedikerede handling (auditeret, med årsag) — nedlagt er ikke en endestation.
8. At til-vælge en klient på en nedlagt lokation AFVISES — lokationen skal være åben først (Mathias 2026-09-03: "den skal være åben", bekræftet "nej"); genåbn (ac 7), kobl derefter.
9. Nedlæggelse kobler automatisk alle klienter fra lokationen (K-6 ac 9) og beholder lokationens stande (K-2 ac 5); koblings-historikken består; gruppens kobling og gruppens øvrige lokationer berøres ikke (Mathias 2026-09-03). Ved genåbning arver lokationen automatisk gruppens klienter igen (K-6 ac 9). Dvale kobler ingen af (ac 6).

**Kilder:** M-7 (aktiv · dvale · nedlagt, kun aktiv bookbar — delvis parafrase) · M-13 ("nej" til til-valg på nedlagt + "vigtigt vi bevære den historikse data") · M-14 (nedlæggelse kobler af, stande består) · M-19 ("ja": genåbning arver automatisk) · **M-23+ afventer** (relæ-svar "den skal væres åben") · Mathias 2/9-ord **afventer ledger-id** ("tilladelser må oprettes i dvale når den bookede dato ligger efter dvalens ophør" · "nedlagt kan genåbnes") · §1.12 status-livscyklus · Appendix B · §1.3 (årsag + audit) · princip 9.

### K-5 Hvile efter brug (cooldown)

**HVAD:** En lokation hviler efter en kampagne, hvis der i UI er valgt et antal hviledage for lokationen (Mathias 2026-09-03: "kan hvis antal hvile dage er valgt i ui"); er intet antal valgt, udløses ingen automatisk hvile. Hvile kan desuden sættes manuelt (dvale, K-4). Hvilen gælder lokationen **på tværs af klienter** ("pr. lokation, ikke pr. klient/kampagne" — låst afgørelse). Reglen er absolut: der findes ingen omgåelse (Mathias 2026-09-02: "nej") — men hvile-**perioden** kan afsluttes før tid i UI af en rettighedshaver, hvorefter lokationen er aktiv igen ("man skal kunne stoppe dvaleperioden og dermed åbne lokationen i ui").

- **Struktur (umuligt):** booking under hvile (via K-4) · en "book alligevel"-fravigelse · automatisk hvile på en lokation uden valgt antal hviledage · hvile-konfig-ændring uden rettighed eller uden audit-spor · periode-afslutning uden rettighed eller uden audit-spor.
- **Værdi (UI):** antal hviledage pr. lokation ("periode styres i ui"; intet valg = ingen automatisk hvile) · manuel dvale og afslutning før tid · hvem der må ændre (rettigheder, K-8).

**Acceptkriterier (slut-effekter):**
1. Booking på hvilende lokation AFVISES — der findes INGEN handling der tillader booking uden at hvilen først er afsluttet synligt.
2. Afslutning af hvile før tid uden rettighed AFVISES; med rettighed auditeres den med årsag, og lokationen er derefter aktiv.
3. Ændring af hvile-konfigurationen uden rettighed AFVISES; med rettighed gælder den straks og auditeres med årsag (Mathias 2026-09-03: "styres i rettigheder" — ingen godkendelses-livscyklus; princip 5's kladde→testet→godkendt→aktiv gælder data-håndterings-konfiguration, hvile-perioden er forretningskonfig).
4. Ændring af antal hviledage kræver ALDRIG udvikler.
5. Automatisk hvile udløses KUN når lokationen har et antal hviledage valgt i UI; uden valg udløses ingen hvile (Mathias 2026-09-03; default = intet, princip 4). Enheden er dage.

*Plan-fase:* om dvale-status (K-4) og hvile-mekanismen er én eller to model-ting — forretnings-sandheden er bindende: samme oplevelse, ingen omgåelse, kun styring af perioden.

**Scope-ærlighed (bevis-punkt):** udløsningen "efter en kampagne" forudsætter bookinger, som først findes i trin 24. Denne pakke leverer og beviser: antal hviledage pr. lokation (UI), hvile-tilstanden og dens afvisnings-opslag, samt stop-handlingen med rettighed og audit. Selve den automatiske udløsning ved kampagne-slut kobles på i trin 24 — noteret nedstrøms-afhængighed, ingen tavs udvanding. *Trin 24 (noteret nedstrøms-afhængighed):* annullerede bookingers hvile-effekt · evaluerings-niveau (stand vs. lokation).

**Kilder:** M-21 ("kan hvis antal hvile dage er valgt i ui") · M-7 (cooldown-enhed = UI-konfig) · **M-23+ afventer** (relæ-svar "styres i retigheder") · Mathias 2/9-ord **afventer ledger-id** (hvile-reglen absolut: "nej" til omgåelse · "man skal kunne stoppe dvaleperioden og dermed åbne lokationen i ui") · §1.12 + Appendix A (cooldown pr. lokation, ikke pr. klient) · princip 4 (default = intet).

### K-6 Hvilke klienter må stå på hvilke lokationer (klient-tilladelser)

**HVAD:** Stork styrer hvilke klienter der må stå og sælges på hvilke lokationer (forretningsforstaaelse §14) — systemet håndhæver det, aldrig en manuel konvention. Modellen er Mathias' (2026-09-03): **klienter kobles på gruppen** (K-3) og arver gruppens lokationer; **lokationen kan fravælge** klienter gruppen har, og vælge dem til igen. En klient må stå på en lokation præcis når klienten er koblet på lokationens gruppe, lokationen ikke har fravalgt klienten, og lokationen ikke er nedlagt. Ingen slutdato kræves: koblingen gælder indtil klienten kobles fra gruppen, fravælges på lokationen, eller lokationen nedlægges (Mathias 2026-09-03: "lokationer har ingen slutdato før vi deaktivere den/nedlægger den"). Historik bevares altid ("vigtigt vi bevarer den historiske data"). Til-/frakobling på gruppen og til-/fravalg på lokationen sker i UI af rettighedshavere. Dvale rører ikke koblingerne (K-4 ac 6); kun nedlæggelse kobler af. *Plan-mekanik (ikke krav-sprog):* gældende-dato, versionering, fortrydelses-mekanismen (§1.7), og om den effektive ret "klient × lokation" (§1.12's relations-tabel) afledes eller materialiseres.

- **Struktur (umuligt):** klient på en lokation uden kobling på lokationens gruppe · til-valg af klient uden for gruppen · kobling uden klient eller gruppe · dobbelt kobling af samme klient på samme gruppe (én sandhed) · til-valg på nedlagt lokation (K-4) · nedlagt lokation med aktive klienter · sletning/omskrivning af historik · booking af klient uden gældende ret til lokationen på bookingdatoen (håndhævet i skrivevejen — trin 24 forbruger opslags-fladen).
- **Værdi (UI):** hvilke klienter er koblet på hvilken gruppe, fra hvornår · hvilke klienter en lokation fravælger · frakobling · fortrydelses-periodens længde pr. ændrings-type.

**Acceptkriterier (slut-effekter):**
1. Kobling uden klient eller gruppe AFVISES.
2. Samme klient koblet dobbelt på samme gruppe AFVISES — der er én sandhed om forholdet.
3. Ingen slutdato kræves: en kobling uden slutdato AFVISES IKKE; den gælder indtil klienten kobles fra gruppen, fravælges på lokationen, eller lokationen nedlægges (Mathias 2026-09-03).
4. En klient koblet på gruppen må stå på ALLE gruppens lokationer — også lokationer oprettet senere — medmindre lokationen har fravalgt klienten. Til-valg af en klient uden for gruppen AFVISES.
5. Lokationens fravalg gør at klienten IKKE må stå dér; gruppens øvrige lokationer berøres ikke; fravalget kan ophæves igen.
6. Frakobling fra gruppen fjerner klienten fra alle gruppens lokationer fra en dato og ændrer aldrig fortiden; sletning eller omskrivning af historik AFVISES.
7. Opslaget "må klient X stå på lokation Y på dato D?" svarer entydigt — også for historiske datoer (fladen trin 24's booking-gate forbruger).
8. Flere klienter kan have ret til samme lokation samtidig — det AFVISES IKKE (Mathias 2026-09-03). Grænsen er standen: én klient pr. stand ad gangen (K-2 ac 4).
9. Nedlæggelse kobler automatisk alle klienter fra lokationen (Mathias 2026-09-03: "klienter kobles automatisk fra lokationer når den nedlægges") — som frakobling pr. dato, historikken består; en nedlagt lokation med aktive klienter kan IKKE findes; standene består (K-2 ac 5); gruppens kobling og øvrige lokationer berøres ikke. Ved genåbning arver lokationen automatisk gruppens klienter igen (Mathias 2026-09-03: "ja" til "automatisk tilbage ved genåbning"). Dvale kobler ingen af.
10. Til-/frakobling og til-/fravalg uden rettighed AFVISES; daterede ændringer får godkendelse + fortrydelses-periode før de træder i kraft.

*Trin 24 (noteret nedstrøms-afhængighed):* hvad der sker med allerede bookede dage når en klient kobles fra eller fravælges — bookingen forbruger tilladelses-opslaget pr. dato; konsekvensen for eksisterende bookinger afgøres i trin 24.

**Kilder:** M-17 (gruppe-kobling, arv, fravalg) · M-12 ("klienter skal altid kunne kobles på og fra på de enkelte lokaitoner") · M-13 (historik bevares) · M-14 (nedlæggelse kobler af) · M-19 (genåbning arver) · **M-23+ afventer** (relæ-svar "hvad menes der med aftaler? lokationer har ingen slutdato før vi deaktivere den/nedlægger den" → ingen slutdato · "stande-model": flere klienter pr. lokation, maks 1 pr. stand) · forretningsforståelse §14 (klient sælges kun hvor der er tilladelse) · §1.12 (håndhævelse pr. booking-dato) · princip 9.

### K-7 Klassifikation, persondata og anonymisering

**HVAD:** Hver ny data-kolonne i pakken klassificeres (kategori, persondata-niveau, opbevaring) — default er intet (princip 4). Lokationens egne felter er forretningsdata og bevares evigt (§11-grænsen). Gruppens kontaktperson-oplysninger er persondata med sletteregler (§11: samme grænse som kontaktperson på klienten) og skal kunne anonymiseres uden at gruppen eller dens lokationer mistes. Lokationen bærer anonymized_at som doc-låst struktur (§1.12).

- **Struktur (umuligt):** uklassificeret kolonne i leverancen · sletning som anonymiserings-mekanisme (altid UPDATE — rækken består, audit-sporet bevares) · nedgradering af persondata-niveau (direkte → lavere) · implicit persondata/retention uden aktivt valg.
- **Værdi (UI):** klassifikations-valgene pr. felt (persondata-niveau, opbevaring) · hvilke kontakt-felter gruppen har (felt-registry).

**Acceptkriterier (slut-effekter):**
1. Pakken kan IKKE leveres med en uklassificeret kolonne (gaten blokerer).
2. En gruppes kontaktperson kan anonymiseres: person-felterne erstattes, rækken består, lokations-koblinger og audit-spor bevares — sletning AFVISES.
3. Uden aktivt valg er intet felt persondata og intet felt har opbevarings-regel (default = intet).
4. Anonymiserings-dækningen for gruppens kontakt-felter er med i leverancen — ingen persondata-felt uden anonymiserings-vej (intet tavst GDPR-hul). Lokations-anonymisering aktiveres først hvis et lokations-felt aktivt klassificeres som persondata; indtil da er anonymized_at inaktiv struktur.

**Kilder:** §1.2 (klassifikations-pligt) · §1.4 (anonymisering, deklareret data) · forretningsforståelse §11 (persondata-grænsen) · princip 4 · princip 7 · §1.12 (anonymized_at). Låste docs — intet Mathias-ord nødvendigt.

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

**Kilder:** §1.1 (adgangs-mønster) · §1.3 (audit-pligt) · forretningsforståelse §12 (rettigheder) · Appendix A Adgang. Låste docs — intet Mathias-ord nødvendigt.

### K-9 UI-styrbarhed (Mathias-ord 2026-09-02)

**HVAD:** Alle pakkens forretningshandlinger — oprette/redigere lokationer, stande, grupper; koble klienter på/fra grupper; til-/fravælge klienter pr. lokation; status-skift; hvile-styring; klassifikations-valg — kan udføres i UI af rettighedshavere. Skellet er hans: **struktur er hardkodet** (required-felter, forbud — fx at en lokation skal have et navn), **værdier styres i UI** (hvilket navn, hvilken klient, hvilke perioder).

- **Struktur (umuligt):** et forbud eller required-felt der kan slås fra via UI-konfiguration · en forretningshandling der kræver udvikler.
- **Værdi (UI):** alt indhold.

**Acceptkriterier (slut-effekter):**
1. Ingen handling i pakken kræver udvikler-indgreb (migration/deploy) for at blive udført.
2. Ingen handling kræver tekniske privilegier (direkte database-/service-adgang).
3. Et strukturelt forbud (manglende navn, cyklus, overlap, manglende årsag) kan IKKE deaktiveres via UI.

**Scope-ærlighed (bevis-punkt, masterplan-fakta):** Trin 10b er et core-lag-trin; UI-siderne kommer i lag F (tilkobles ved første frontend-side — Appendix B). Acceptkriterierne bevises derfor NU gennem de offentlige indgange UI'en vil kalde 1:1 — den flade er UI'ens maskinrum og er autoritativ (§1.9). **Bevist nu:** hele handlings-fladen kaldbar med rettigheds-gating, audit og alle negativer. **Tilbage til lag F:** selve siderne/formularerne oven på præcis dén flade. Ingen tavs udvanding.

**Kilder:** Mathias 2/9-ord **afventer ledger-id** (UI-styrings-kravet · struktur/værdi-skellet) · **M-23+ afventer** (relæ-svar "styres i retigheder") · princip 3 (forretningslogik som data) · §1.9 (offentlige indgange som UI'ens maskinrum).

## Plan-fase-afgørelser (bord flyttet synligt — planner afgør i kravets ramme, Codex angriber, plan-OK dækker)

Hierarki-dybde under stand-niveau og hvordan mindst én stand sikres (K-2) · gruppe-arv på stand (K-2/K-3) · om den effektive ret klient×lokation afledes eller materialiseres, og om en lokations fravalg består gennem nedlæggelse og genåbning (K-6) · om gruppe og §1.12's leverandør er én eller to entiteter (K-3) · valuta-/enheds-repræsentation og tom-pris-gyldighed (K-1) · felt-registry-udformning for gruppens felter, CVR m.v. (K-3) · seeding-detaljer ud over superadmin (K-8) · fortrydelses-wiring: ændrings-typer og undo-defaults (K-6/K-8) · om dvale-status og hvile-mekanisme er én eller to model-ting (K-4/K-5) · direkte-vs-godkendelses-mekanik pr. handlings-type inden for UI-rammen (K-8).

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
| doc:docs/strategi/stork-2-0-master-plan.md#1.12:klient-tilladelser-form | 2 | behandlet | K-6 (relations-tabel klient×lokation = plan-mekanik; forretnings-modellen præciseret af Mathias 3/9: kobling på gruppen, fravalg pr. lokation — vedligeholds-flag, se "Holdt mod låste docs") |
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
| intet-data:cooldown-forretnings-semantik | 3 | behandlet | K-5 (Mathias-svar: på tværs af klienter, absolut, periode stoppes i UI; udløses kun hvis antal hviledage er valgt i UI, enhed = dage; annullering + niveau → trin 24) |
| intet-data:hierarki-dybde-og-placement-regler | 3 | behandlet | K-2 (Mathias 2026-09-03: gruppe ejer lokation, lokation ejer stand; mindst én og flere stande, én klient pr. stand ad gangen; dybde under stand + sikring af mindst én stand + gruppe-arv → plan-fase, synligt flyttet) |
| intet-data:klient-tilladelse-kommerciel-betydning | 3 | behandlet | K-6 (Mathias 3/9: klienter kobles på GRUPPEN og arver dens lokationer, lokationen kan fravælge — K-3 · flere klienter pr. lokation, én pr. stand · ingen slutdato · nedlæggelse kobler af, stande + historik består · til-valg på nedlagt afvises (K-4 ac 8) · genåbning: arver automatisk igen · eksisterende bookinger ved frakobling → trin 24) |
| intet-data:konfig-lifecycle-for-cooldown | 3 | behandlet | K-5 (Mathias 2026-09-03: "styres i rettigheder" — rettighed + audit, ingen godkendelses-livscyklus) |
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
- **Annullerede bookingers hvile-effekt + hvile-evalueringsniveau (stand vs. lokation):** trin 24 — noteret som nedstrøms-afhængighed i K-5.
- **Konsekvens for allerede bookede dage når en klient kobles fra + afvisning af to klienter på samme stand samme dag:** trin 24 — skabelonen leverer tilladelses-opslag pr. dato og stand-identiteten; booking-leddet håndhæver. Noteret som nedstrøms-afhængighed i K-2/K-6.
- **Attribution/økonomi via lokation:** forbudt (K-1) — ikke en udskydelse, en grænse.

## Holdt mod låste docs

Kæden vision/forretning ⊨ krav er holdt mod: **vision-og-principper.md** (vision: UI-styring, holdbarhed; bærende princip 1 én sandhed, 2 styr på data, 3 eksplicit sammenkobling/FK; operationelt princip 3 forretningslogik som data, 4 default = intet, 5 livscyklus for konfiguration [læst som data-håndterings-konfig; hvile-perioden er forretningskonfig — Mathias 2026-09-03], 6 audit på alt, 7 anonymisering bevarer audit, 9 status bevarer historik) · **forretningsforstaaelse.md** (§2 dato-snapshot, §3 attribution via klient, §9 algoritme/værdi-adskillelse, §11 persondata-grænsen entitet/felter, §12 rettigheder og adgang, §14 FM-grenen: lokation som master-data + tilladelses-kontrol, §15 greenfield/migration som separat beslutning) · **stork-2-0-master-plan.md** (§0.5 migrations-mekanik, §1.1-§1.4 adgang/klassifikation/audit/anonymisering, §1.8 klient-kontrast, §1.11 schema-placering, §1.12 lokations-skabelonen [anker], §2.7.1/§2.7.6/§2.7.8 nedstrøms-forbrugere, §4 trin 10b [anker], Appendix A FM-domænet [cooldown pr. lokation, alt-med, markeder/messer], Appendix B [lokations-status afgjort her ved trin 10b]).

**Mathias-ord i denne krav-fase (2026-09-02, alle indarbejdet):** UI-styrings-kravet · struktur/værdi-skellet · status `aktiv · dvale · nedlagt`, kun aktiv bookbar · tilladelser i dvale lovlige (booket dato efter dvalens ophør) · hvile-reglen absolut, perioden kan stoppes i UI · aftaler pr. lokation, gruppen ejer lokationen · nedlagt kan genåbnes · migration importeres senere · fremlæggelses-pligten før ok. **2026-09-03 (relæ fra parallel session, verbatim):** gruppe ejer lokation · lokation har flere stande · flere klienter på lokationen samtidig, maks 1 klient pr. stand · hvileperiode-ændring "styres i rettigheder" · nedlagt lokation: "den skal være åben" (registrering kræver åben lokation) · slutdato: "hvad menes der med aftaler? lokationer har ingen slutdato før vi deaktivere den/nedlægger den" (ingen slutdato; et dateret aftale-objekt er ikke hans model → §14's funktions-formulering) · "altså klienter skal altid kunne kobles på og fra på de enkelte lokationer" (til/fra pr. lokation, ingen slutdato) · kobling på nedlagt lokation: "nej - men det er vigtigt vi bevære den historikse data" · "altså klienter kobles automatisk fra lokationer når den nedlægges men lokaitoner beholder de oprettede stande" · efter fremlæggelse-1 (pkt. 2+3): "en lokation har minimum 1 stand" · "forstår ikke hvad der menes. loaktioner ejes af en gruppe: en gruppe oprettes i ui. en gruppe oprettes med navn og der kobles klienter på gruppen. disse klienter arver lokationerne og dermed kan loaktion kun have klienter som der er i gruppen. loaktioner kan godt fravælge klienter som gruppen har" (vender K-3's tidligere forbud mod kæde-kobling: koblingen LIGGER på gruppen) · "altså med minimum en stand menes der at gruppe ejer lokation og lokation ejer stand" · genåbning arver automatisk gruppens klienter: "ja" · hvile (fremlæggelse pkt. 5): "kan hvis antal hvile dage er valgt i ui".

**Ingen modsigelse mod låste docs i forretnings-forstand.** To vedligeholds-flag til masterplanen (ikke rettet her — Mathias retter): (a) §1.12 "Klient-tilladelser pr. lokation: separat relations-tabel klient × lokation × from_date × to_date" — Mathias' model 2026-09-03 er kobling på gruppen med fravalg pr. lokation; den effektive ret pr. lokation (som §14 kræver) består, men tabel-formen er plan-mekanik og §1.12-teksten bør præciseres; (b) §1.12's kilde-henvisning "rettelse 17" for cooldown-afgørelsen matcher ikke Appendix C's nummerering — substansen er låst i Appendix A; henvisningen bør rettes ved plan-vedligehold.
