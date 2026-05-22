# Stork 2.0 — Forretningsforståelse

Dette dokument forklarer hvordan Stork-forretningen hænger sammen. Hvert punkt beskriver hvad systemet skal kunne på forretnings-niveau, efterfulgt af en kort opsummering af hvorfor det er sådan.

Dokumentet er målrettet roller der hjælper med plan-arbejde, krav-dok og review. Det erstatter ikke vision-dokumentet, master-planen eller Mathias-afgørelser — det er baggrunden der gør de dokumenter forståelige.

---

## 1. Klient som omdrejningspunkt

- Stork skal kunne knytte alt forretningsmæssigt indhold (salg, calls, vagter, løn, rapporter) til den klient det vedrører
- Stork skal kunne svare på "hvilken klient er dette for?" for enhver forretnings-handling
- Stork skal kunne håndtere at klienter ejes af teams — én klient ad gangen
- Stork skal kunne forhindre at et salg lever uden klient-kobling

Klienten er Storks driftsmotor. Stork sælger for andre firmaer (Tryg, Eesy, TDC, Finansforbundet), og det er klient-bindingen der bestemmer hvem der har ansvaret for hvad. Hvis et salg ikke kan kobles til en klient, kan det ikke faktureres, lønberegnes eller rapporteres.

---

## 2. Dato-snapshot-princippet

- Stork skal kunne fryse klient-team-bindingen ind på salget når det laves
- Stork skal kunne slå op hvilket team der ejede en klient på en hvilken som helst historisk dato
- Stork skal kunne sikre at senere klient-team-skift ikke ændrer historiske salg
- Stork skal kunne håndtere at klient-team-bindinger ændrer sig løbende uden at fortid forandres

Fortid skrives ikke om. Når et salg laves på en dato, så er klient-team-bindingen den dag dét der tæller — også når annulleringer eller korrektioner kommer ind måneder senere. Det er den eneste måde at sikre at konsekvenser rammer det rigtige team selvom verden har ændret sig siden.

---

## 3. Attribution-trekanten: sælger, team, klient

- Stork skal kunne attribuere hvert salg til en sælger (den der lavede det), en klient (det firma salget er for) og et team (det der ejede klienten den dag)
- Stork skal kunne afgøre team-attribution via klienten, ikke via sælgerens nuværende team
- Stork skal kunne håndtere at en sælger over tid skifter team uden at fortidens salg påvirkes
- Stork skal kunne bruge klient-dimensionen til at afgøre pris og provisions-sats
- Stork skal kunne koble salg til den rigtige medarbejder uanset hvordan sælger-identiteten kommer fra ekstern API

Tre dimensioner, tre konsekvenser. Sælgeren får sin provision. Klienten bestemmer prisen og satserne. Teamet får DB-løn til sin leder. De tre er adskilte, og særligt vigtigt: team kommer via klienten, ikke direkte fra sælgeren. Det forhindrer at sælger-skift midt i en periode ødelægger tidligere attribution.

---

## 4. Salget — flere linjer, regel-baseret pris, berigelse undervejs

- Stork skal kunne registrere et salg med en eller flere produktlinjer, hver med egen pris og provision
- Stork skal kunne aggregere provision og omsætning pr. salg som summen af linjerne
- Stork skal kunne finde prisen via en regel der matcher produkt + kampagne + felt-værdier
- Stork skal kunne vælge deterministisk mellem flere regler der matcher
- Stork skal kunne flage og rette salg hvor ingen regel matcher (i stedet for at skjule det bag en standardværdi)
- Stork skal kunne berige et salg med ekstra felter via UI efter registrering
- Stork skal kunne lade berigelses-felter påvirke prissætningen og udløse opdateret provision
- Stork skal kunne logge alle berigelser
- Stork skal kunne merge to produkter til ét
- Stork skal kunne gruppere produkter til rapportering og aggregering
- Stork skal kunne sammenligne felt-værdier på flere måder i pricing-regler (præcis match, intervaller, ranges)
- Stork skal kunne tidsbegrænse pricing-reglers gyldighed
- Stork skal kunne bære flere pricing-formler pr. produkt til forskellige situationer
- Stork skal kunne vise salgs-linjer med navn der adskiller sig fra produktnavnet (fx kampagne-specifikt navn)
- Stork skal kunne håndtere særlige betalings-tilfælde (fx straksbetaling) som data, ikke separat mekanik
- Stork skal kunne styre salgs-livscyklus med kontrollerede status-overgange (ikke automatiske)
- Stork skal kunne udelukke salg i bestemte status'er fra commission-aggregat
- Stork skal kunne genberegne salg når pricing ændres — kun før provision er udbetalt

Salget er bygget op af linjer. Prisen kommer ikke fra produktet alene — den kommer fra en regel der ser på flere felter samtidig. Salget kan ændre værdi efter registrering hvis det beriges med nye felter (eksempel: straksbetaling). Hele forretningens prissætning kører gennem samme regel-mekanisme, så sælger-provision og leder-DB altid bygger på samme tal.

---

## 5. Vagter, stempelur og klient-tid

- Stork skal kunne planlægge vagter pr. medarbejder med start og slut
- Stork skal kunne bruge vagten som autoritativ kilde til løn-timer (uafhængigt af stempelur)
- Stork skal kunne registrere stempelur som dokumentation for fremmøde
- Stork skal kunne håndtere at stempelur kan bruges til at fordele tid mellem klienter uden at det ændrer løn-timerne
- Stork skal kunne kræve at en sælger-vagt fordeles 100% på klienter
- Stork skal kunne acceptere flere kilder til klient-fordeling samtidig (stempelur, dialer-events, fast klient på vagten)
- Stork skal kunne beregne CPO og time-provision pr. klient via samme regel-mekanisme som salgs-pricing
- Stork skal kunne håndtere salg der kommer ind uden tilhørende vagt (flag + retroaktiv vagt-oprettelse + automatisk klient-fordeling ved retroaktiv oprettelse)
- Stork skal kunne håndtere tre vagt-typer med egne regler pr. type: stab (stempelur som dokumentation), teamledelse (stempelur som dokumentation), sælger (klient-tid dækker 100% af total arbejdstid)
- Stork skal kunne bestemme total arbejdstid ud fra vagten; pauser indgår ikke
- Stork skal kunne udløse revalidering af klient-fordeling når total arbejdstid ændres
- Stork skal kunne validere at sum af klient-segmenter ikke overstiger total arbejdstid
- Stork skal kunne lade UI prioritere når flere klient-fordelings-kilder er aktive samtidig
- Stork skal kunne mødes to API-events fra forskellige klienter i tids-midtpunktet
- Stork skal kunne udvide første API-events klient bagud til arbejdstidens start
- Stork skal kunne udvide sidste API-events klient fremad til arbejdstidens slut
- Stork skal kunne lade kampagner under en klient have egne klient-tid-betalings-regler der afviger fra klient-default
- Stork skal kunne udløse klient-tid-betaling kun på sælger-vagter
- Stork skal kunne planlægge vagter fremadrettet
- Stork skal kunne ændre vagter pr. dag uden at ændre andre vagter
- Stork skal kunne replikere vagt-mønster på tværs af mange medarbejdere uden manuel taste
- Stork skal kunne følge medarbejderens start- og slut-dato (ingen vagter udenfor; auto-afslut hvis medarbejder stopper midt i periode)
- Stork skal kunne tildele vagter status (no-show som mulig status)
- Stork skal kunne behandle manglende vagt som ingen arbejdstid (ikke automatisk default fra ugedag)
- Stork skal kunne nægte vagtbytte mellem medarbejdere
- Stork skal kunne nægte vagt-overlap i tid for samme medarbejder
- Stork skal kunne følge danske helligdage
- Stork skal kunne oprette vagter på helligdage
- Stork skal kunne forhindre ændring af stempel-tidspunkter efter de er sat
- Stork skal kunne logge stempel-rettelser
- Stork skal kunne håndtere vagter der går på tværs af midnat
- Stork skal kunne anvende én konsistent pause-model på tværs af systemet
- Stork skal kunne definere pauser på flere niveauer (skabelon, medarbejder, klient) som data i UI
- Stork skal kunne registrere fraværs-typer som data (minimum: ferie, sygdom — udvideligt)
- Stork skal kunne håndtere fravær som hel dag eller del af dag
- Stork skal kunne kræve approval på ferie men ikke på sygefravær
- Stork skal kunne logge fraværs-status-overgange

Vagten er fundamentet for sælgerens dag. Den planlægges, den betales. Stempeluret dokumenterer hvad der faktisk skete, og klient-tid-fordelingen siger hvilken klient sælgeren brugte tiden på. Klient-tid kan give CPO og provision — beregnet gennem samme mekanisme som salgs-pricing, så de to systemer aldrig afviger.

---

## 6. Annulleringer rejser tilbage gennem tiden

- Stork skal kunne modtage annulleringer på salg uger eller måneder efter selve salget
- Stork skal kunne sende konsekvenserne af annulleringen tilbage til det team der ejede klienten på salgs-tidspunktet
- Stork skal kunne registrere annulleringer som modposter uden at røre den oprindelige salgslinje
- Stork skal kunne håndtere annullering af et helt salg eller af én linje eller af en del af en linje
- Stork skal kunne håndtere andre feedback-typer (korrektioner, kurv-rettelser, afvisninger) gennem samme dato-baserede rute

Annulleringer rammer fortiden men retter den ikke. Det oprindelige salg står urørt, og annulleringen registreres som en ny begivenhed der peger på det. Det er det der gør at audit, historik og rapporter kan stoles på selv efter mange korrektions-runder. Team-attribution følger dato-snapshot — annulleringer rammer det historiske team, ikke det nuværende.

---

## 7. Provision-mekanikken — sælger, leder, assistent/stab

- Stork skal kunne beregne sælger-provision pr. salg baseret på klientens provisions-aftale
- Stork skal kunne beregne leder-løn som procent af team-DB (teamets klient-omsætning minus sælger-løn minus annulleringer)
- Stork skal kunne beregne assistent- og stab-løn via faste lønarter (timeløn, månedsløn, tillæg) uden afhængighed af salgs-tal
- Stork skal kunne tillægge feriepenge til alle løn-niveauer
- Stork skal kunne konfigurere alle satser, lønarter og formler via UI, ikke via teknisk ændring
- Stork skal kunne ændre en sats eller tilføje en ny lønart uden at omdesigne systemet
- Stork skal kunne håndtere timeløn, månedsløn og commission som separate løntype-kategorier
- Stork skal kunne kategorisere formler efter formål (lønarter vs. KPI'er)
- Stork skal kunne lade tid indgå som input-variabel i begge formel-kategorier
- Stork skal kunne beregne sygeløn pr. vagt via formel-systemet
- Stork skal kunne anmode og godkende overtid
- Stork skal kunne medregne godkendt overtid automatisk i lønberegning
- Stork skal kunne logge overtid-godkendelser
- Stork skal kunne aggregere pr. medarbejder pr. periode: antal vagter (totalt og pr. status), antal FM-bookinger, antal FM-salgsregistreringer
- Stork skal kunne stille anciennitet til rådighed som input-variabel i formel-systemet
- Stork skal kunne stille medarbejder-aggregater til rådighed som input-variabler i formel-systemet
- Stork skal kunne stille medarbejderens standard arbejdstid til rådighed som data

Tre niveauer der ikke fungerer ens. Sælgeren får direkte provision pr. salg. Lederen får DB-løn bundet til klient-ejerskab. Assistent og stab har faste lønarter uden salgs-afhængighed. Det fælles træk: alle satser og lønarter konfigureres i UI gennem formel-systemet, så forretningen kan reagere uden at gå gennem en udvikler.

---

## 8. Lønperiode-låsning

- Stork skal kunne afgrænse drift i lønperioder (typisk månedlige) med klar start og slut
- Stork skal kunne åbne og lukke perioder kontrolleret
- Stork skal kunne forhindre enhver ændring i en låst periode
- Stork skal kunne håndtere sene annulleringer som modposter i en åben periode valgt af bruger
- Stork skal kunne pege modposter tilbage til det oprindelige salg, så sammenhængen kan ses
- Stork skal kunne attribuere modposten til det historiske team, selv om den udbetales i nuværende periode

Låsning er det der gør lønhistorik pålidelig. Når en periode er udbetalt, kan den ikke ændres — så hverken Skat eller medarbejdere kan komme i tvivl om hvad der blev udbetalt. Annulleringer der kommer sent rammer ikke fortiden; de placeres som modposter i en åben periode brugeren vælger. Forretningen styrer placeringen, og attributionen følger dato-snapshot.

---

## 9. Forretningslogik som data — ikke som kode

- Stork skal kunne lade brugere ændre satser, lønarter, klient-felter, regler og andre værdier via UI
- Stork skal kunne adskille algoritmer (hvordan noget beregnes) fra værdier (hvad satserne er)
- Stork skal kunne nægte at virke når kritisk konfiguration ikke er sat (default = intet)
- Stork skal kunne tage konfigurations-ændringer gennem livscyklus: kladde → testet → godkendt → aktiv
- Stork skal kunne kræve superadmin til at aktivere særligt følsomme ændringer (anonymiserings-strategier, retention-regler)
- Stork skal kunne logge enhver konfigurations-ændring fra hvert stadie
- Stork skal kunne vise hvilken pricing-regel der gav et salg sin pris
- Stork skal kunne logge pricing-regel-ændringer uanset hvor ændringen kommer fra

Algoritmen er kode, værdien er data. Hvordan en provision beregnes ligger fast i kode; hvad satsen er, ligger som data i UI. Det betyder forretningen kan reagere hurtigt på ændringer uden teknisk arbejde. Livscyklus-disciplinen forhindrer at "data i UI" bliver anarki — ændringer går gennem flere kontrol-skridt før de er live.

---

## 10. Identitet eksisterer én gang

- Stork skal kunne genkende en person som samme person på tværs af alle systemer
- Stork skal kunne forhindre at samme person optræder under flere navne eller flere ID'er
- Stork skal kunne markere data som "ikke matchet" når en person ikke kan identificeres entydigt
- Stork skal kunne kræve Microsoft-konto-login for medarbejdere (ingen separat Stork-login, ingen bagdør)
- Stork skal kunne behandle kandidater som ikke-identiteter indtil de bliver ansat

Én person, én identitet. Det lyder selvfølgeligt men har konsekvenser overalt — sælger-attribution, vagt-registrering, løn, audit, alt skal pege på samme entitet. Når et salg ikke kan identificere sin sælger, sendes det til manuel håndtering frem for at gætte. Det er bedre at have et salg liggende end at have det attribueret forkert.

---

## 11. Persondata vs. forretningsdata

- Stork skal kunne adskille persondata (navne, kontaktoplysninger) fra forretningsdata (klient-navn, omsætning, lønarter)
- Stork skal kunne anonymisere persondata efter retention-periode uden at slette den bærende række
- Stork skal kunne bevare hele audit-sporet selv efter anonymisering
- Stork skal kunne håndtere direkte PII (felter der i sig selv identificerer) og indirekte PII (felter der kombineret identificerer) forskelligt
- Stork skal kunne logge enhver ændring der rører data (audit per række på alt undtagen audit selv)
- Stork skal kunne bevare forretningsdata evigt (klient-rækker, historiske salg, sælger-rækker bag anonymiseret navn)

Grænsen går mellem entitet og felter. Klient-rækken bliver stående evigt; en kontaktperson på klienten har sletteregler. Anonymisering fjerner ikke rækken — den fjerner personhenførbare felter og lader resten stå. Det er det der gør at historisk lønberegning og rapporter stadig fungerer to år efter en sælger er stoppet og hans navn er anonymiseret.

---

## 12. Rettigheder og adgang

- Stork skal kunne definere rettigheder pr. side og pr. handling i UI uden teknisk ændring
- Stork skal kunne lade en rolle være en samling af rettigheder, ikke en hardkodet kategori
- Stork skal kunne håndtere én undtagelse (superadmin) som hardkodet sikkerhedsventil
- Stork skal kunne adskille synlighed (hvad ses) fra handling (hvad må ændres)
- Stork skal kunne styre synlighed via tre niveauer: sig selv, hierarki (egen knude og alt under), eller alt
- Stork skal kunne koble hierarki-synlighed til medarbejderens placering i organisations-træet
- Stork skal kunne tildele compliance-ansvar (GDPR, AI, AMO) til konkrete medarbejdere uden om rettigheds-systemet
- Stork skal kunne tillade break-glass-handlinger på låste data via to-niveau godkendelse med særlig audit

Rettigheder er driftsfunktion, ikke bi-funktion. Synlighed udledes af træet — en team-leder ser sit team automatisk. Handlinger styres pr. side og pr. tab, så samme synlighed kan kombineres med forskellige skrive-rettigheder. Compliance-ansvar er juridisk udpegning, ikke en rettigheds-rolle. Break-glass er den eksplicitte undtagelse der gør at låste data kan ændres når det er virkeligt nødvendigt — men kun gennem en sporet, godkendt handling.

---

## 13. Yderligere funktioner

- Kontrakt-mekanisme — skal kunne sende kontrakter
- Besked- og spørgeskema-funktion — skal kunne udsende beskeder enten som ren information eller som spørgeskema
- Dashboard — skal kunne vise kuraterede visninger med egen adgangsstyring
- Rapportering — skal kunne aggregere data pr. sælger, team, klient og dato

Disse fire funktioner er en del af Stork som selvstændige områder ved siden af kerne-driften. De er nævnt her så de ikke glemmes — den konkrete forretningsforståelse for hver enkelt bliver afdækket pakke for pakke når funktionen skal bygges.

---

## 14. FM-grenen — felt-marketing på samme stamme

- Stork skal kunne håndtere FM-salg via samme mekanik som TM-salg (samme klient-dimension, samme attribution, samme pricing, samme annullerings-håndtering)
- Stork skal kunne planlægge fysiske lokationer som master-data på linje med klient og medarbejder
- Stork skal kunne registrere bookinger der knytter lokation, klient og medarbejdere sammen i tid
- Stork skal kunne kontrollere at en klient kun sælges på lokationer hvor der er tilladelse
- Stork skal kunne håndtere FM-specifikke lønarter (diæt, oplæringsbonus, mileage) gennem samme formel-system som al anden løn

FM er ikke et separat univers. Det er samme stamme set fra en anden vinkel: i stedet for at sidde og ringe står sælgeren fysisk på en messe eller i en butik. Klienten er stadig dimensionen, lederen får stadig DB, provisionen beregnes stadig på samme måde. Lokationen og bookingen er FM's egne entiteter, men de spiller ind i samme system som resten af forretningen — ingen parallel løn, ingen parallel attribution.

---

## 15. Greenfield-rammen — 2.0 er ikke kopi af 1.0

- Stork 2.0 skal kunne bygges uden at arve antagelser fra 1.0
- Stork 2.0 skal kunne tage migration som separat beslutning pr. pakke, ikke som automatisk leverance
- Stork 2.0 skal kunne hente data direkte fra eksterne kilder (klient-API'er) som primær kilde frem for at gå gennem 1.0
- Stork 2.0 skal kunne afgøre design ud fra vision og principper, ikke ud fra "hvordan gør 1.0 det?"

  2.0 bygges fra bunden. 1.0 fortsætter med at køre indtil cutover, men 2.0 er ikke en migration af koden — det er et nyt system med nyt design. 1.0's anti-mønstre overføres ikke. Når data senere skal med over, afgøres det pakke for pakke når behovet konkret melder sig.

---

## 16. Hvordan det hele hænger sammen

- Stork skal kunne kæde alle forretnings-handlinger sammen via klient-dimensionen
- Stork skal kunne fryse historiske bindinger ind så fortiden ikke skrives om
- Stork skal kunne lade konsekvenser (annulleringer, korrektioner) rejse tilbage gennem tiden uden at ændre fortiden
- Stork skal kunne låse perioder uden at miste mulighed for at lave modposter senere
- Stork skal kunne håndtere ændringer i organisation, satser og regler gennem UI uden teknisk ændring
- Stork skal kunne aggregere konsistent på tværs af salgs-kilder (TM, FM, andre) så samme tal kommer frem uanset rute
- Stork skal kunne forhindre tidszone-drift mellem rapportering og pricing

Det er ét sammenhængende system, ikke flere isolerede dele. Klienten er fundamentet; dato-snapshot fryser bindinger; salg får sin pris fra regler; vagter giver løn-timer; klient-tid kan give yderligere provision via samme regel-mekanisme; annulleringer rejser tilbage via snapshot; lønperioden låser det hele; modposter laves i åbne perioder. Rettigheder bestemmer hvem der må gøre hvad. Persondata adskilles fra forretningsdata. Hele værdi-laget — satser, lønarter, regler — er konfigurerbar data, ikke kode. Det er den helhed der adskiller godt 2.0-arbejde fra dårligt: godt arbejde ser kæden, dårligt arbejde løser ét isoleret problem og bryder noget tre led henne.
