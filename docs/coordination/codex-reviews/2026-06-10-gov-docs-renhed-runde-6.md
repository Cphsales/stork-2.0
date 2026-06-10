# Codex review — gov-docs-renhed runde 6

**Pakke:** gov-docs-renhed
**Fase:** build
**Plan-fil:** docs/coordination/gov-docs-renhed-plan.md
**Plan-SHA:** 821e1b3
**Dato:** 2026-06-10
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-docs-renhed-plan.md 6 --xhigh --phase=build` (re-run via samme args inkl. flags)

---

Reading additional input from stdin...
OpenAI Codex v0.137.0
--------
workdir: /home/mathias/stork-2.0
model: gpt-5.5
provider: openai
approval: never
sandbox: workspace-write [workdir, /tmp, $TMPDIR] (network access enabled)
reasoning effort: xhigh
reasoning summaries: none
session id: 019eb18a-3837-7830-b0e5-7518a37bed49
--------
user
Du er Codex i Stork 2.0 — uafhængig kode-reviewer, read-only (disciplin §9.3).

Læs FØR review:
- docs/strategi/vision-og-principper.md
- docs/strategi/forretningsforstaaelse.md (LÅST stamme-doc, D4)
- docs/strategi/disciplin.md §9.3 (din rolle) + §5 (severities) + §8.1
- docs/coordination/gov-docs-renhed-krav-og-data.md (pakke-kontrakt — hvis den findes)
- docs/coordination/gov-docs-renhed-plan.md (build-fasen for pakke gov-docs-renhed)
- docs/coordination/gov-docs-renhed-status.md (kontekst + konvergens-counter — hvis den findes)

RUNDE-NUMMER: 6
FASE: build
FORMÅL: udledes af "## Formål"-sektionen i docs/coordination/gov-docs-renhed-plan.md.

Review-fokus (§9.3): patch-først (§3.1) · end-to-end-spor (§3.3) ·
state-dump matcher faktisk state (§3.2) · krav-dok-konsistens uden
scope-creep · vision/forretningsforstaaelse-modsigelse ·
MANGLENDE-EKSISTERENDE-BEVARELSE.

Format pr. fund:
[SEVERITY] Kort beskrivelse
Konkret afvigelse: ...
Anbefalet handling: [V<n+1>-rettelse / G-nummer / kosmetisk note]

Berører ændringen en governance-doc: afslut med
"§8.1-SVAR: INGEN-MODSIGELSE" eller "§8.1-SVAR: MODSIGELSE — <hvad>".

Max 350 ord. Hvis ingen fund: skriv "APPROVAL — Runde 6".
codex
Jeg læser de påkrævede governance- og koordinationsdokumenter først og holder reviewet read-only, som §9.3 kræver. Derefter sammenholder jeg den aktuelle diff med formål, status og krav.
exec
/bin/bash -lc "sed -n '1,220p' docs/strategi/vision-og-principper.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
# Stork 2.0 — Vision og principper

<!-- governance-owns: vision, principper -->

> **LÅST DOKUMENT.** Dette er grundstenen i Stork 2.0. Ændringer kræver eksplicit godkendelse fra Mathias via PR. CODEOWNERS håndhæver at kun Mathias kan approve ændringer. Dokumentet er autoritativ kilde for vision og principper — ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette. Undtagelse (D4): `forretningsforstaaelse.md` er med-stamme-doc — en modsigelse mellem de to er et hul der STOPPER arbejdet og lukkes af Mathias, ikke en konflikt dette dokument vinder.

## Vision

Stork 2.0 bygges til at holde. Vi tager ikke nemme løsninger, hardkodede
shortcuts, eller midlertidige fixes der bliver permanente. Hvert valg
vurderes mod hvad der står om 5 år, ikke hvad der virker i dag.

Systemet er fundamentet for Copenhagen Sales' drift. Det skal kunne tåle
ny lovgivning, nye klienter, nye datatyper, og nye krav uden at blive
bygget om. Det betyder data, rettigheder og forretningslogik styres i
UI — ikke i kode. Algoritmer lever i kode, alt andet i data. Du har
kontrollen, ikke en hardkodet regel.

Vi bygger greenfield. 1.0's anti-mønstre kopieres ikke, selv hvis det
går hurtigere. Workarounds uden plan er drift. Vi accepterer ikke
teknisk gæld uden eksplicit beslutning om hvornår den løses.

Audit, rettigheder, anonymisering og retention er ikke add-ons. Det er
fundament. De skal være på plads før systemet går i produktion, og de
skal kunne ændres i UI når nye regler kommer.

## Tre bærende principper

De tre essentielle principper hele systemet bygges på. Alt andet leder tilbage til disse.

1. **Én sandhed** — én autoritativ kilde pr. fakta. Database er sandheden; alt andet (frontend-state, edge-cache, beregningsresultater) er views af samme sandhed. Konflikt mellem to kilder er en fejl, ikke en feature.

2. **Styr på data** — hver kolonne har eksplicit semantik: klassifikation, PII-niveau, retention. GDPR-compliance er indbygget, ikke add-on.

3. **Sammenkobling eksplicit i modellen** — relations som data, ikke implicit i kode. FK-constraints er obligatoriske mellem relaterede entiteter.

De ni operationelle principper nedenfor er konkretiseringer af disse tre.

## Ni operationelle principper

### 1. Data-kontrol i UI

Al data — uanset kilde (UI, API, uploads) — klassificeres i UI for PII,
retention og anonymisering.

### 2. Rettigheder i UI

Team-træ styrer hvilken data der vises. Page/tabs styrer hvilke dele
af systemet der ses. Superadmin er eneste hardkodede rolle.

### 3. Forretningslogik som data

KPI'er, lønarter, formler, klassifikationer, regler — alt er data i UI.
Algoritmer er kode, værdier er data.

### 4. Default = intet

Ingen PII, ingen retention, ingen anonymisering, ingen audit-opgradering
medmindre det aktivt vælges i UI.

### 5. Lifecycle for konfiguration

Alt der påvirker data-håndtering gennemgår draft → tested → approved →
active. Aktivering er bevidst handling, ikke automatik.

### 6. Audit på alt der ændrer data

Per-row audit som default. Snapshot-tabeller har aggregat-audit som
undtagelse.

### 7. Anonymisering bevarer audit

Anonymisering er UPDATE der erstatter PII med placeholder. Row forbliver,
audit-spor bevares.

### 8. Identitet eksisterer én gang

Personer findes som én entitet. Systemer kobles via identity-mapping,
ikke parallelle person-tabeller.

### 9. Status-modeller bevarer historik

Forretningshandlinger ændrer aldrig oprindelig data. Statusændringer
sker via separate tabeller eller status-felter, aldrig ved overskrivning.

---

> **Aktører, roller og arbejdsmetode er flyttet til `docs/strategi/disciplin.md`.**
> Dette dokument handler om systemet Stork — ikke om hvordan vi arbejder.
> Ét hjem pr. begreb: proces bor i disciplin, ikke her.

exec
/bin/bash -lc "sed -n '1,260p' docs/strategi/forretningsforstaaelse.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
# Stork 2.0 — Forretningsforståelse

<!-- governance-owns: forretnings-intention -->

> **LÅST DOKUMENT (stamme-doc med vision-og-principper.md).** Ændringer kræver eksplicit godkendelse fra Mathias via PR; CODEOWNERS håndhæver. Opdateres når Mathias' tanker udvikler sig — men de to stamme-docs må aldrig være indbyrdes uenige: en modsigelse er et hul der STOPPER og lukkes af Mathias (D4). Mekanisk håndhævelse (required code-owner-review) lander i gov-4 — dette er doc-niveau-løftet.

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

exec
/bin/bash -lc "sed -n '1,260p' docs/strategi/disciplin.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
# Stork 2.0 — Arbejds-disciplin (V5)

<!-- governance-owns: aktoerer-roller, workflow, gates, severities, vagter, skabeloner, bevarings-politik -->

Ét hjem for hvordan vi arbejder sammen: aktører, roller, flow, gates, severities, disciplin. Mathias styrer tanker, funktioner, logik og vision; AI'erne (Claude.ai, Code, Codex) bygger. Vi bygger ovenpå eksisterende kode, ikke nyt hver gang.

> **Dette er det eneste rolle- og proces-hjem.** Vision-og-principper.md definerer ikke længere aktører eller roller — det er proces, og det bor her. Ved konflikt om systemets vision vinder vision-dokumentet; ved spørgsmål om hvordan vi arbejder vinder denne fil.

> **V5-ændringer fra V4 (afgørelser, kan omgøres):** Genindført fire discipliner V4 tabte uden beslutning, fordi de er bærende — formåls-immutabilitet (§3.0), differentieret modsigelses-håndtering (§8), destructive-drops-preflight (§3.9), glid-detector (§9). Ikke genindført det V4 bevidst droppede (footer): 3-AI forretningsgang-triangulering og fire-dok-konsultations-tabel — substansen ligger i §9.1 proaktiv recon og §9.3 Codex-review-fokus, og V4 havde ret i at skære ceremonien. Automation skrevet ærligt som notify-only (§2, §6.2).

---

## §1 Aktører og roller

| Aktør         | Rolle                                                                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Mathias**   | Tanker, funktioner, logik, vision. Eneste beslutningstager. Dikterer krav-dok pr. pakke. Godkender plan + slut-rapport                    |
| **Claude.ai** | Krav-dok-typist (skriver Mathias' tanker ned). Slut-rapport-reviewer. Strategisk sparring. **Docs-lag — kigger ikke på kode/DB-tilstand** |
| **Code**      | Builder. Migrations, RPC'er, tests. Eneste med skrive-adgang til repo                                                                     |
| **Codex**     | Uafhængig kode-reviewer. Read-only. Bugs, RLS-huller, SQL-fejl, manglende-eksisterende-bevarelse                                          |

**Ingen AI må:** træffe forretnings-beslutninger på Mathias' vegne · skrive "afgørelser"/"ramme-låsninger" som AI · fortolke retning som specifikation uden bekræftelse · designe datamodel uden Mathias-input (Claude.ai) · skrive kode (Codex) · påstå repo-/DB-tilstand uden at have verificeret den (alle).

---

## §2 Workflow — 5-step flow

Alle pakker kører fuld disciplin. Ingen skala-distinktion.

```
0. Pakke-åbning (Mathias)
   ↓
1. Krav-dok (Mathias → Claude.ai-typist, proaktiv recon; Mathias validerer)   ← gate: "krav OK"
   ↓
2. Plan (Code + Codex parallel; skitse → størrelses-tjek → fuld plan eller split)
   ↓
3. qwerg approval (Mathias)                                                    ← gate: "qwerg"
   ↓
4. Build (Code batches; Codex per-batch; end-to-end-konsistens per batch)
   ↓
5. Slut-rapport (Code skriver; Claude.ai-review FØR merge)                     ← gate: "slut OK"
```

Tre gates kræver Mathias: `krav OK`, `qwerg`, `slut OK`. Trin 2 og 4 er hvor det meste arbejde sker.

> **Automation-tilstand (Codes kortlægning, juni 2026 — Codes bord):** `codex-notify` poster kun tracker-comment. Der er **ingen Codex-runner og ingen auto-merge-workflow endnu**, og plan-branchen er ikke dækket af triggeren (bygges i gov-5-automation). Indtil det bygges: Mathias merger PR'er, og Codex-review relæes manuelt. Flowet ovenfor er mål-tilstanden — gates der hviler på auto-merge er ikke aktive endnu. Denne fil påstår ikke en automation der ikke kører.

### Step 0 — Pakke-åbning

Mathias melder ny pakke ud i chat.

### Step 1 — Krav-dok

Claude.ai skriver `docs/coordination/<pakke>-krav-og-data.md` fra Mathias' chat-input; Mathias validerer i samme chat.

- Mathias' tanker om hvad pakken skal levere (forretning + funktion + logik)
- Ingen tabel-navne/kolonner/RPC-signaturer (Code's bord i plan-fasen)
- Hver påstand peges på Mathias-ord — ingen kilde: spørg, skriv ikke. Ingen fabrikation.

### Step 2 — Plan (med skitse-tjek)

**2.0 skitse + størrelse:** 1-5 migrations → fuld V1. 6+ → STOP, split-forslag (krav-dok forbliver ÉT dok, implementation splittes over pakker).
**2.1 fuld plan (Code+Codex parallel fra V1):** Code skriver V<n>; Codex laver parallel kode-research. Code håndterer hvert KODE-FUND eksplicit i V<n+1> (ADRESSERET / AFVIST fordi Y). Stop: Codex APPROVAL + "INGEN NYE FUND".

### Step 3 — qwerg

Mathias paster `qwerg` når Codex har approved OG Mathias selv har læst igennem.

**Forudsætning — fundament-validering (grøn før qwerg):** planen skal stå på mål med vision + forretningsforstaaelse. Almindelig plan bekræfter "ingen forretnings-intentions-ændring" (Doc-currency A, §10.2). Plan der ændrer intention: fundament-doc'en reconciles først gennem §8.1-gaten + Mathias' CODEOWNERS — FØR qwerg. Modsigelses-konsekvens per §8 (vision LÅST = STOP). En plan godkendes ikke stående på fundament den modsiger.

### Step 4 — Build

Batches på 3-5 migrations. Patch-først (§3.1). End-to-end-konsistens per batch. Smoke-fejl → STOP-gate (§3.7).

### Step 5 — Slut-rapport

Code skriver `rapport-historik/<dato>-<pakke>.md`. Claude.ai reviewer FØR merge.

---

## §3 Bygge-disciplin

### 3.0 Formåls-immutabilitet (genindført)

Hver pakke har ét FORMÅL (krav-dok §Formål). Når Mathias har godkendt det, er det **låst**. Code må ændre den tekniske implementations-vej undervejs (Code's domæne — flag i slut-rapport under Plan-afvigelser), men **ikke** formålet. Afslører implementation at formålet ikke kan leveres: STOP, eskalér. Codex-fund kan føre til bug-fix, implementations-ændring, G-nummer eller STOP+eskalation — **aldrig** til at Code ændrer formål, tilføjer features eller omtolker hvad pakken skal levere.

### 3.1 Patch-først (byg ovenpå, ikke nyt)

For HVER eksisterende funktion/policy/tabel der ændres: plan inkluderer NUVÆRENDE body 1:1 med file:linje + markerer DIFF eksplicit (hvad fjernes/tilføjes, hvilke gates/kommentarer/kolonner/audit-spor bevares) + migration starter med diff-summary. Tab af gate/kommentar/kolonne uden begrundelse = `MANGLENDE-EKSISTERENDE-BEVARELSE` (KRITISK).

### 3.2 DB-state-dump som plan-pre-condition

Code må ikke skrive plan før konkret DB-state er dumpet via Supabase MCP (RPC-bodies via `pg_get_functiondef`, kolonner+constraints, policies, grants) og lagt i plan under "Verificerede DB-objekter" som råt output. Ingen gæt, ingen cached state.

### 3.3 End-to-end-spor pr. write-vej

For hver write-RPC der ændres/tilføjes: (1) GRANT + policy + session-var som tre-pak, (2) SELECT-policy bred nok til alle legitime læsere, (3) apply-dispatcher-extension, (4) én eksempel-row gennem fuldt flow (UI → handler → RPC → DB → læsning), (5) krydscheck mod fundament-tjek. Manglende ét = KRITISK i plan-review.

### 3.4 Konvergens-counter med auto-STOP

Counter i pakke-status, incrementerer pr. V<n>. Runde 1-3 normalt · 4 Mathias-alert ("er krav-dok præcist nok?") · 5 auto-pause · 6+ auto-STOP (krav-dok genåbnes eller pakken splittes). Konvergerer vi ikke i 3-4 runder er problemet rammen, ikke "prøv igen".

### 3.5 Pakke-status.md — kontekst mellem sessioner

Hver aktiv pakke har én lille fil: sidste handling · næste forventet · konvergens-counter · aktuel blocker. AI'er læser den FØRST.

### 3.6 End-to-end-test er leverings-kriterium

Hver pakke leverer mindst ÉN test gennem ÉT konkret flow (UI/RPC → DB-write → RLS → læsning). Schema-only ("kolonner findes") accepteres ikke.

### 3.7 STOP-FOR-CLARIFICATION-gate

Build-afvigelse fra krav-dok kræver eksplicit Mathias-godkendelse via gate-fil — ikke Code-selvbeslutning. STOP build → `mathias-gate/<pakke>-<type>-<N>.md` (Status: AFVENTER MATHIAS + afvigelse + begrundelse) → Mathias: GODKENDT/AFVIST → genoptag/alternativ. FORBUDT: "det er midlertidigt", "min fortolkning".

### 3.8 Pakke-størrelses-grænse

Skitse > 5 migrations → STOP, foreslå split.

### 3.9 Destructive drops kræver preflight (genindført — højeste indsats; Stork rører løndata)

`DROP TABLE/COLUMN`, `TRUNCATE`, `DELETE` uden WHERE o.l. kræver:

- **Tom-check:** `count(*) = 0`, eller eksplicit kvittering for antal rows der tabes
- **Reference-check:** ingen FK refererer det droppede (ikke kun CASCADE-fix)
- **Audit-spor:** session-vars `source_type` + `change_reason` sat før operation
- **Rollback-plan:** hvordan operationen rulles tilbage

Pre-cutover (ingen rigtige data): tom-check + audit-spor er minimum. Post-cutover: alle fire er CI-blocker; manglende preflight = review-rejection. Dette er den dyreste fejl-klasse i systemet.

---

## §4 Bevarelses-disciplin — hvad gemmes, hvad slettes

**Princip:** kun krav-dok + godkendt plan (slut-version) + slut-rapport overlever pakken. Resten lever i git-history.

**Bevares på main:** krav-dok → `arkiv/<pakke>-krav-og-data.md` · plan → `arkiv/<pakke>-plan.md` · slut-rapport → `rapport-historik/<dato>-<pakke>.md` · in-place-opdateringer til vision, forretningsforstaaelse, master-plan (overblik), teknisk-gaeld.

**Slettes ved pakke-luk:** `<pakke>-status.md` · alle `plan-feedback/<pakke>-V<n>-*` · alle `codex-reviews/<pakke>-runde-*` · afgjorte `mathias-gate/<pakke>-*` · plan-versioner V1..Vn (git-history bevarer sporet).

**Én bevarings-politik.** Arkivet er ikke en voksende kirkegård; iterations-, recon- og review-filer lever i git-history, ikke som filer på main.

---

## §5 Severities + FLAG/LØS-dialog

| Severity                             | Konsekvens                                                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **KRITISK**                          | Stopper plan/build i alle runder. Code SKAL adressere næste runde                                                                                |
| **MANGLENDE-EKSISTERENDE-BEVARELSE** | KRITISK-undertype: mister gate/kommentar/kolonne fra eksisterende body uden begrundelse                                                          |
| **MELLEM**                           | Stopper i runde 1. G-nummer i runde 2+                                                                                                           |
| **KOSMETISK**                        | Stopper IKKE. G-nummer-kandidat                                                                                                                  |
| **OPGRADERING**                      | Stopper IKKE. Code afviser eller implementerer eksplicit i V<n+1>. Codex må give APPROVAL + OPGRADERING samtidig                                 |
| **NEEDS-MATHIAS**                    | Stopper i alle runder. Code kan ikke lave V<n+1> før Mathias afgør. Reviewer skriver eksplicit spørgsmål. Max 2 pr. review — flugtvej hvis flere |
| **FULDSTYRKE-MANGEL**                | Kun Mathias-rejst. AI scrapper output, gentager samme V-nummer                                                                                   |

Hver severity bærer funktion — de kollapses ikke. (MANGLENDE-EKSISTERENDE-BEVARELSE binder patch-først; OPGRADERING muliggør approval+forslag samtidig.)

**Runde-trapper:** runde 1 alle fund vurderes · runde 2 kun KRITISK stopper, MELLEM → G-numre · runde 3 kun KRITISK, resten → G-numre · runde 4+ se §3.4.

**FLAG → LØS (Code's svar pr. Codex-fund):** ACCEPT / PUSHBACK (argumentér; Codex: AGREE/REFINE) / PROPOSE-ALTERNATIVE. Max 3 LØS-iterationer pr. fund; > 3 → auto-eskalation via `mathias-gate/`.

**Positive markers:** OPTIMERING-FORSLAG (Codex) → Code: ADOPT/DEFER/DISMISS · SPARRING-OENSKE (Code) → Codex: CONFIRM/TIMING/AVOID.

---

## §6 Build-markers + automation

### 6.1 Halt-markers

`BRUD-PAA-KRAV` → Step 1 · `TEKNISK-BLOKERING` → Step 2 / Mathias · `PLAN-AFVIGELSE` → Step 2 / Mathias · `KRITISK-SIKKERHEDSHUL` → fix samme batch / Mathias · `WORKAROUND-INTRODUCERET` → mathias-gate · `STOP-FOR-CLARIFICATION` → gate-fil.

### 6.2 Automation (Codes bord — tilstand: notify-only)

`codex-notify.yml` poster tracker-comments på push til aktiv-plan/seneste-rapport/build-branch og på slut-rapport-PR. **Den kører ikke Codex, og der er ingen auto-merge.** Mål-tilstand (skal bygges, Codes bord — samlet i gov-5-automation): plan-branch-trigger, Codex-runner, auto-merge ved grøn CI + godkendelse. `migrations-deploy.yml` deployer til live + regenererer types ved push til migrations — verificér mod Codes kortlægning før den antages aktiv.

### 6.3 Mathias-gate to-fil-flow

For WORKAROUND-INTRODUCERET, STOP-FOR-CLARIFICATION, dobbelt-ESCALATE og iter > 3: build pauser → Code skriver gate-fil (Status: AFVENTER MATHIAS + begrundelse + G-nummer + deadline) → Mathias: GODKENDT/AFVIST → genoptag/alternativ → slettes ved pakke-luk.

---

## §7 Stork-invariant-tjek pr. pakke (verificeres i slut-rapport)

| #   | Invariant                    | Test                                                                                  |
| --- | ---------------------------- | ------------------------------------------------------------------------------------- |
| 1   | Vision-overholdelse          | Vision-tjek-sektion (ja/nej + evidens pr. princip)                                    |
| 2   | Permission-matrix-konsistens | RPC→tab/page-mapping opdateret + RLS dækker alle write-veje                           |
| 3   | Audit-trigger-dækning        | Alle nye tabeller har audit-trigger (fitness)                                         |
| 4   | Konfiguration-i-data         | Ingen hardkodede satser/lønarter (Codex + Claude.ai-tjek — lint bygges i senere spor) |
| 5   | End-to-end-flow virker       | Smoke-test passerer (ikke schema-only)                                                |
| 6   | Anonymisering-bevaring       | UPDATE, ikke DELETE; FK'er intakt                                                     |

Tabel med ja/nej + evidens. Manglende eller "nej" uden begrundelse → KRITISK fra Claude.ai-reviewer.

---

## §8 Modsigelses-disciplin (genindført — differentieret efter dokument-status)

Hvad en modsigelse udløser afhænger af hvilket dokument den rammer. Det forhindrer at arbejdet stopper på master-plan (som er overblik, ikke kontrakt).

| Dokument                                | Status              | Modsigelse udløser                                                                                                                                                                   |
| --------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `vision-og-principper.md`               | **LÅST**            | STOP. KRITISK. Vinder over alt undtagen forretningsforstaaelse (D4: indbyrdes stamme-doc-modsigelse = hul → STOP → Mathias lukker). Dokumentér i blokker-fil, argumentér ikke videre |
| `forretningsforstaaelse.md`             | **LÅST**            | STOP. KRITISK. Stamme-doc med vision (D4): modsigelse mellem de to er et hul Mathias lukker — ingen trumf                                                                            |
| `stork-2-0-master-plan.md` + afgørelser | **RETNINGSGIVENDE** | Rapport til Mathias — IKKE auto-blokering. Han afgør: er rammen forældet (rettes) eller skal pakken justeres? Arbejdet stopper ikke, det venter på afgørelse                         |
| krav-dok + plan (efter approval)        | **PAKKE-KONTRAKT**  | STOP. KRITISK indtil Mathias afgør re-godkendelse eller justering                                                                                                                    |

Pointe: kun vision og pakke-kontrakten stopper automatisk. Master-plan-modsigelse er en trigger for en afgørelse, ikke en blokering.

### §8.1 Governance-vagt (gov-2 — mekanisk lag-1 + Codex-mandat)

Spærhagen der fanger governance-drift, så disciplinen ikke kun hviler på selv-tjek.

**Mekanisk (lag 1 — `scripts/governance-check.mjs`, `pnpm governance:check`, CI-step):** døde doc-stier (docs + scripts), junk/lock-filer, brudte LÆSEFØLGE-/pointer-mål, **owns-unikhed** (ét begreb, ét hjem), nummer-hjem-unikhed (G/H kanonisk entry ét sted), H-ref-integritet (hver H-ref → åben entry eller historisk-kode i `huskeliste.md`). Princip: **owner = definitionshjem, ikke mention-hjem.** Hver governance-doc deklarerer sit ejerskab via en `<!-- governance-owns: … -->`-markør; scanneren fejler ved dobbelt-ejerskab. **Ærlig grænse:** fanger _deklareret_ dobbelt-ejerskab + nummer-dubletter mekanisk; _udeklareret prosa-overlap_ fanges ikke mekanisk → lag 2.

**Codex-mandat (lag 2 — semantisk):** ved enhver ændring til en governance-doc (vision / disciplin / master-plan / forretningsforstaaelse / owns:-register) SKAL Codex eksplicit svare: **"modsiger dette prosa-mæssigt et begreb som en anden doc ejer?"** før merge. Det dækker den klasse scanneren ikke kan.

**Stamme-doc-konsistens (D4):** ændres én af de to stamme-docs (vision / forretningsforstaaelse) SKAL ændringen eksplicit konsistens-tjekkes mod den anden. Modsigelse = hul → STOP → Mathias lukker. Ingen af de to trumfer den anden.

**Fast markør:** Codex' svar gives som linjen `§8.1-SVAR: INGEN-MODSIGELSE` eller `§8.1-SVAR: MODSIGELSE — <begreb> ejes af <doc>` i reviewet, og gentages i slut-rapporten (§10.3) når pakken har berørt governance-docs — så svaret kan tjekkes i PR/rapport, ikke kun huskes i chat.

**Governance-ændringer er review-artefakter:** en ændring til vision/disciplin/master-plan går gennem samme gate som kode — `governance:check` grøn + Codex' prosa-modsigelses-svar. Fraværet af netop dette gav V5's rolle-modsigelse (vision↔disciplin); §8.1 lukker den klasse.

---

## §9 Rolle-disciplin pr. AI

Når Mathias paster `qwers` læser AI'en sin sektion + bekræfter rolle.

**Glid-detector (genindført — svageste lag).** Selv-tjek fanger ikke pålideligt; det bærende værn er mekanisk tjek + Codex + Mathias. Men hver aktør spotter selv:

- **Code:** "jeg har implicit forenklet" / "ikke fået svar 2 gange" / "afviger fra plan uden flag" → STOP, flag
- **Claude.ai:** "jeg gætter på kilde" / "jeg fabrikerer detalje" / "jeg pakker forslag som afgjort" / "jeg påstår repo-tilstand uden at have set den" → flag [gæt] eller verificér/spørg
- **Codex:** "jeg holder nok-OK tilbage" / "jeg eskalerer for at undgå at afgøre" → flag

### §9.1 Claude.ai

**Rolle:** krav-dok-typist (Step 1) + slut-rapport-reviewer (Step 5) + sparring. Docs-lag.
**MÅ:** skrive krav-dok fra Mathias' input · spørge Mathias direkte i krav-dok-fasen · reviewe slut-rapport mod krav-dok + vision + forretningsforstaaelse · levere FEEDBACK eller APPROVAL (aldrig begge).
**MÅ IKKE:** tekniske beslutninger · krav-dok-påstande uden Mathias-kilde · kode-vurdering (Codex' bord) · datamodel-design (Code's bord) · skrive "afgørelser" · påstå at noget ER bygget når et dokument kun siger det SKAL bygges (→ "ikke verificeret, Codes bord").
**Triggers:** `qwers` → bekræft rolle · `qwers <pakke>` → bekræft + proaktiv kontekst-recon STRENGT i forretnings-sprog (læs forretningsforstaaelse + evt. vision + søg rapport-historik; output: "det vi har" + targeted spørgsmål + scope-forslag; FORBUDT: tabel/kolonne/RPC-navne) · `qwerr` → slut-rapport-review.

### §9.2 Code

**Rolle:** builder.
**MÅ:** vælge tekniske løsninger inden for godkendt plan · PUSHBACK med teknisk grund · stoppe ved blokering og lave gate-fil.
**MÅ IKKE:** forretnings-afgørelser · udvide scope uden plan-revurdering · afvige fra krav-dok-leverance uden gate · genfortolke eksisterende funktioner uden patch-først (§3.1) · ændre formål (§3.0).
**Triggers:** `qwers` → bekræft · `qwerr` → læs pakke-status + udfør næste · `qwerg` → byg.
**Plan-disciplin:** DB-state-dump (§3.2) · patch-først (§3.1) · end-to-end-spor (§3.3) · pre-push-tjekliste (formål matcher krav-dok, alle leverancer dækket, body-sektioner udfyldt).

### §9.3 Codex

**Rolle:** uafhængig kode-reviewer, read-only.
**MÅ:** flage alt tvivlsomt på kode-niveau · foreslå OPGRADERING · bestride "kompromis" som mulig drift.
**MÅ IKKE:** skrive kode · beslutte · holde "nok OK" tilbage · acceptere "kendt gæld" uden G-nummer · eskalere alt til NEEDS-MATHIAS som flugt.
**Plan-review-fokus (dækker den gamle fire-dok-konsultations substans):** patch-først korrekt? · end-to-end-spor alle 5? · DB-state-dump matcher faktisk state? · krav-dok-konsistens uden scope-creep? · vision + forretningsforstaaelse-modsigelse? **Approval:** APPROVAL eller FEEDBACK (undtagelse: APPROVAL + OPGRADERING). Kun Codex-approval kræves for plan.

---

## §10 Skabeloner (inline)

exec
/bin/bash -lc "test -f docs/coordination/gov-docs-renhed-krav-og-data.md && sed -n '1,260p' docs/coordination/gov-docs-renhed-krav-og-data.md || true" in /home/mathias/stork-2.0
 succeeded in 0ms:
# gov-docs-renhed — Krav-og-data

**Type:** Kontrakt for gov-docs-renhed-pakken (docs-renhed + selvvedligeholdende værn)
**Dato:** 2026-06-08

> **Ærlig note om dokumentets natur + bord.** §10.1 lægger krav-dok-typist-rollen
> hos Claude.ai, og Mathias dikterer. Denne er Code-draftet, fordi indholdet er
> Mathias' dikterede afgørelser (D1–D6 + renheds-princippet + løftet af
> forretningsforståelse) sammen med Code- og Codex-verificerede fund — ikke
> forretnings-tanker der kræver en typist. **Ingen forretnings-afgørelse er
> truffet af Code.** Hver påstand sources nedenfor. Vil Mathias hellere have
> Claude.ai til at type den for cadence-konsistens, omdirigeres den — flag rejst,
> ikke afgjort.

## Formål

> Denne pakke leverer: et docs-repo hvor ingen doc eller script modsiger
> virkeligheden — plus de mekaniske værn der holder det rent — så fælles
> forståelse og workflow ikke kan brydes af drift.

_Kilde: Mathias 2026-06-08 ("urent docs = brudt fælles forståelse = brudt
workflow; hold det rent ER workflowet, ikke oprydning ved siden af");
Code-analyse H-1…H-8; Codex-analyse C-1…C-8 (branch-protection-fund
API-verificeret)._

## Hvad pakken skal sikre (workflow-/renheds-niveau, ikke Stork-forretning)

Pakken bygger ikke løn, salg eller klienter. Den retter **måden** repoet bærer
fælles forståelse på, så en aktør aldrig fejlledes af en doc/script der lyver.

- Et docs-repo eksisterer for at skabe fælles forståelse og sikre workflowet. En
  doc der modsiger virkeligheden, en død reference eller en pointer der peger
  forkert undergraver præcis det repoet er til for. Renhed **er** workflowet.
  _(Mathias 2026-06-08.)_
- Kun filer der tjener et reelt formål overlever i repoet. Alt andet ud — doc
  eller script, V5.3-rest eller ej. _(Mathias D3.)_
- De to stamme-docs — `vision-og-principper.md` og `forretningsforstaaelse.md` —
  er begge LÅST-AUTORITATIVE og **må aldrig være indbyrdes uenige**. En
  modsigelse mellem dem er et hul der skal lukkes, ikke en præcedens hvor den ene
  trumfer den anden. _(Mathias D4 + afgørelse: forretningsforståelse hæves til
  samme beskyttelse som vision.)_
- Et script der ligner fungerende automation men er brudt er værre end intet
  script — det fejlleder aktøren. _(Codex C-3; Code H-1.)_
- Renheden må ikke hvile på menneske-hukommelse: det der kan fanges mekanisk skal
  fanges mekanisk; resten falder til Codex + Mathias. _(v5-bud §1; arvet fra
  gov-2.)_

## I scope

Code afgør faktisk bygge-rækkefølge, batch-split og repair-vs-slet-verdikt pr.
script i plan-fasen (hans bord, jf. D1). Krav-dok'en fastlåser ikke det tekniske
hvordan — kun hvad der skal være sandt til sidst.

### A. Reconcile — docs og scripts der modsiger virkeligheden i dag

1. **Aktiverings-scripts bringes til at virke under V5 ELLER fjernes** — verdikt
   pr. script, styret af "tjener et reelt formål" (D3): `codex-review.sh` (dør på
   `exit 64`; kræver slettet `docs/skabeloner/codex-review-prompt.md`),
   `claude-ai-prompt.sh` (peger på slettede `mathias-afgoerelser.md` +
   `overvaagning/claude-ai-overvaagning.md`; indlejrer fjernet fire-dok-ramme),
   `data-grundlag.sh` (V5.3 "Step 0"), `krav-afklar.sh` (V5.3 "Step 2"). _(D1+D3;
   H-1/H-2; C-3/C-4.)_
2. **`disciplin.md` doc-currency** — "Forudsætninger"- og "Gjort"-sektionerne
   (`§ Forudsætninger`) lister gov-3b-2 #10/#18 som udestående; de er merged
   (PR #101/#103/#105). Bringes i sync med faktisk gov-state. _(C-8.)_
3. **Forretningsforståelse løftes til LÅST-AUTORITATIV (doc-niveau)** — (a)
   LÅST-banner i header som `vision-og-principper.md`; (b) `LÆSEFØLGE.md` pkt. 2
   "TANKE-DATA — ikke kontrakt" → låst-status; (c) ny række i `disciplin.md §8`
   som **LÅST → STOP**; (d) `§8.1` udvides så ændring af én stamme-doc tvinger et
   konsistens-tjek mod den anden (modsigelse = hul → STOP → Mathias lukker).
   CODEOWNERS dækker den allerede. _Mekanisk håndhævelse (code-owner-review
   required) lander i gov-4 — her er det doc-niveau-løftet._ \_(Mathias-afgørelse
   - D4; C-2/H-5.)\_
4. **Git-reglen rettes** — "git pull origin main" ved hver trigger er forkert når
   arbejdet sker på plan/build/mergehash-branches. Erstattes med branch-bevidst
   "fetch + verificér branch/base/remote + pull relevant branch; uventede commits
   → STOP". I `LÆSEFØLGE.md` pkt. 0, `disciplin.md §13`, `CLAUDE.md`. _(C-7.)_
5. **Døde reference-rester repointes** — `rapport-historik/README.md` peger på
   slettet `rapport-skabelon.md`; `disciplin.md §2/§6.2` peger på H020-tombstone
   i stedet for det levende gov-5-arbejde. _(H-3/H-7.)_
6. **`disciplin.md §7` invariant #4 gøres ærlig** — mærket "(lint)", men ingen
   sats/lønart-lint findes. Relabel til Codex/Claude.ai-tjek (lint bygges først i
   et senere spor). _(H-5.)_
7. **Claude.ai-aktivering: én kanonisk kilde i repoet** — repoets
   `docs/claude-ai/SKILL.md` gøres til den autoritative skill; platform-skill'en
   peger på / genereres fra den, så aktiveringen er versioneret og synlig for
   alle aktører. Forudsætter at `claude-ai-prompt.sh`-konflikten (pkt. 1) er
   lukket, så der ikke er to borde. _(Mathias-afgørelse: skill ud af platform,
   ind i repo; H-2.)_
8. **`fundament-samlet.md` slettet** — utracked working-tree-fil, fjernet som
   oprydning (ikke en tracked commit). _(Mathias D5. Allerede udført
   2026-06-08.)_

### B. Mekaniske værn — så renheden holder sig selv

9. **Governance-check-allowlisten splittes i to klasser** — prosa-docs _må_ nævne
   slettede stier (historisk-provenance); aktive scripts _må ikke_ pege på
   slettede stier, medmindre scriptet selv er markeret `deprecated`.
   Allowlisten har allerede et `klasse`-felt — checken bruger det bare ikke til
   at skelne doc vs. script. **Dette er fixet der automatisk ville have fanget
   pkt. 1.** _(H-3/C-5.)_
10. **Strukturel kæde-tjek** — for en aktiv pakke: krav-dok + plan + status +
    slut-rapport eksisterer og krydspeger konsistent, og `## Formål`-strengen er
    identisk på tværs af krav-dok/plan/rapport (formåls-immutabilitet §3.0
    mekanisk). **Strukturel, ikke semantisk** — existence + string-match, ingen
    betydnings-vurdering. _(H-4/C-6; Codex' eksplicitte råd "start strukturelt".)_
11. **§8.1 Codex-svar som fast review-marker** — den lovede "modsiger dette
    prosa-mæssigt et begreb en anden doc ejer?"-gate er i dag kun en instruktion;
    intet kræver at svaret blev givet. Gøres til en fast marker der kan tjekkes i
    PR/rapport, ikke kun huskes i chat. _(Codex-forbedring.)_

## IKKE i scope

- **gov-4 (branch protection)** — `required_status_checks` + `require_code_owner_reviews`
  - `required_approving_review_count ≥ 1`. Selvvedligeholds-checkene fra denne
    pakke (pkt. 9–10) gøres _required_ DÉR, ikke her. _(D2; sekvens.)_
- **gov-5 (automation)** — Codex-runner + auto-merge + plan-branch-trigger (H020).
  _(D6: bevidst udskudt hertil.)_
- **gov-6 (arkiv-fold)** — arkiv → git-history + `v4-slettede-docs/` (untracked) +
  G063-allowlist-fjernelse. _(disciplin §4; G063.)_
- **P3-spor** — Code-rolle-binding i `CLAUDE.md`, decision-packet-format ved
  gates, sats/lønart-lint. Følger efter; tages kun med her hvis plan-fasen finder
  dem billige. _(Code H-6; Codex-forbedring.)_
- **Semantisk modsigelses-detektion mellem stamme-docs som lag-1-check** — kan
  ikke gøres mekanisk; det er §8.1 Codex (lag 2). Pkt. 3(d) leverer _udløseren_
  (ændring → tjek-krav), ikke en prosa-modsigelses-scanner. Ærlig grænse. _(D4.)_
- **Stork-forretningsfeatures.**

## End-to-end-test-design

Mønster fra gov-2: `governance:selftest` — baseline grøn + plantede overtrædelser
fanges. Mindst tre nye negativ-cases i `scripts/governance-check.selftest.mjs`:

1. Et aktivt script der peger på en slettet sti (uden `deprecated`-markør) →
   allowlist-split-checken fejler (rød). _(beviser pkt. 9.)_
2. En aktiv pakke uden plan, eller med `## Formål`-streng-mismatch mellem
   krav-dok og plan → kæde-tjekket fejler (rød). _(beviser pkt. 10.)_
3. Baseline (alt rent) → grøn.

Skema-only ("checken findes") accepteres ikke (§3.6).

## Afgjort (Mathias D1–D6 + afgørelser, 2026-06-08)

- **D1:** Scripts repareres hvis de kan virke under V5 og tjener et formål; ellers
  slettes. Repair-vs-slet-verdikt pr. script = Code+Codex' bord i plan.
- **D2:** gov-4 kræver **både** CI-status **og** code-owner-review (næste pakke).
- **D3:** Kun filer der tjener et reelt formål overlever.
- **D4:** Vision + forretningsforståelse holdes konsistente; modsigelse = hul der
  lukkes, ikke afgøres.
- **D5:** `fundament-samlet.md` slettet.
- **D6:** Plan-branch-trigger/runner udskudt til gov-5.
- **Afgørelse:** Forretningsforståelse hæves til samme beskyttelse som vision.
- **Afgørelse:** Claude.ai-skill ud af platform-miljøet, ind i repoet (kanonisk +
  versioneret + synlig for alle aktører).

## Åbne spørgsmål

- _(Code+Codex i plan — ikke Mathias)_ Hvilke af de fire scripts tjener et reelt
  formål under V5 (repair) vs. er V5.3-rester (slet)? Foreløbig læsning:
  `data-grundlag.sh` + `krav-afklar.sh` er V5.3-step-rester hvis substans nu
  ligger i §9.1 proaktiv recon (V5 §0 footer) → slet-kandidater; `codex-review.sh`
  har værdi (severity-exit-routing) hvis V5-rettet; `claude-ai-prompt.sh` kan være
  overflødig efter SKILL.md + MCP + skill-i-repo-afgørelsen.
- _(Code+Codex i plan)_ Skal kæde-tjekket (pkt. 10) køre i CI så det bider efter
  gov-4, eller kun on-demand? Foreløbig: CI, så det faktisk blokerer.

## Oprydnings- og opdaterings-strategi

Ved pakke-luk: denne krav-dok → `arkiv/gov-docs-renhed-krav-og-data.md`;
plan/status/feedback i git-history (§4). Pakken redigerer governance-docs
(`disciplin.md`, `LÆSEFØLGE.md`, `forretningsforstaaelse.md`, evt. owns-register),
så den går gennem §8.1-gaten: `governance:check` grøn + Codex' eksplicitte
prosa-modsigelses-svar før merge.

exec
/bin/bash -lc "sed -n '1,260p' docs/coordination/gov-docs-renhed-plan.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
# gov-docs-renhed — Plan V4

**Branch:** claude/gov-docs-renhed-plan
**Krav-dok:** docs/coordination/gov-docs-renhed-krav-og-data.md
**Dato:** 2026-06-10
**Status-fil:** docs/coordination/gov-docs-renhed-status.md (konvergens-counter: 4 — §3.4-alert rejst, se status-fil)

## Formål

> Denne pakke leverer: et docs-repo hvor ingen doc eller script modsiger
> virkeligheden — plus de mekaniske værn der holder det rent — så fælles
> forståelse og workflow ikke kan brydes af drift.

## V1 → V2: Codex-fund runde 1 (alle ADRESSERET)

| #   | Fund                                                                            | Severity | Code-svar                                                                                                                                                                                                                         |
| --- | ------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Vision-banner i modstrid med D4 (§8.1-MODSIGELSE)                               | KRITISK  | **ACCEPT.** Vision-banneret patches (appendix A.1) — minimal D4-undtagelse, kilde er Mathias' egen D4-afgørelse i krav-dok. Vision er LÅST: ændringen håndhæves af Mathias' CODEOWNERS-approval ved merge; flagges eksplicit i PR |
| 2   | Patch-først ikke opfyldt (ingen body 1:1)                                       | KRITISK  | **ACCEPT.** Appendix A (docs) + B (scripts/checks) giver nuværende tekst 1:1 + ny tekst 1:1 pr. ændring                                                                                                                           |
| 3   | Repo-state-dump matcher ikke faktisk state                                      | MELLEM   | **ACCEPT.** Dump erstattet med pr.-tree-verificerede tal (git archive + scanner-kørsel pr. hash, se nedenfor)                                                                                                                     |
| 4   | Kæde-tjek/selftest dækker ikke fase:rapport + krydspegning                      | MELLEM   | **ACCEPT.** Check udvidet med plan→krav-dok-krydspeg + rapport-eksistens/Formål ved fase:rapport; 3 nye selftest-cases (i alt 7 nye)                                                                                              |
| 5   | §10.4 bliver stale kanonisk prompt                                              | MELLEM   | **ACCEPT.** §10.4 patches med i batch 2 (appendix A.7)                                                                                                                                                                            |
| 6   | _(Code-eget fund under runde 1-dispatch)_ `codex exec` hænger på stdin uden TTY | —        | Repair-diffen for codex-review.sh udvidet med `< /dev/null` på exec-linjen (appendix B.1) — fanget live: runde 1 hang på "Reading additional input from stdin..."                                                                 |

## V2 → V3: Codex-fund runde 2 (alle ADRESSERET)

| #    | Fund                                                                                                    | Severity | Code-svar                                                                                                                                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R2-1 | Parser matcher ikke `[KRITISK]`-bracketformat fra det nye §10.4-prompt — stopfund kan give exit 0       | KRITISK  | **ACCEPT.** Alle marker-greps gøres bracket-tolerante + ny `--parse-test`-selvtest i scriptet (appendix B.1, fund R2-1-blok)                                                                                                                              |
| R2-2 | State-dump stale pr. V2-commit (28e0010 = 22 docs, tabel siger 21)                                      | MELLEM   | **ACCEPT** (rettet nu frem for G-nummer — billigere end gælden). Dump omdefineret: baseline (main) er det autoritative måle-punkt planen patcher mod; branch-tallet drifter pr. plan-commit by construction og re-verificeres i build batch 3, ikke pr. V |
| R2-3 | Kæde-tjek: ingen status-krydspeg; fase:rapport fejler ikke når rapport mangler Formål-blok              | MELLEM   | **ACCEPT** (rettet nu). B.3: rapport uden Formål-blok = violation; plan→status-sti-krydspeg + status→pakkenavn-krydspeg; B.4: +2 cases (i alt 9)                                                                                                          |
| R2-4 | Master-plan kalder stadig forretningsforståelse "tanke-data" + vision-vinder-hierarki (§8.1-MODSIGELSE) | MELLEM   | **ACCEPT** (rettet nu). Ny A.14 patcher master-planens hierarki-afsnit. §8-rationale: master-plan er RETNINGSGIVENDE — Mathias har allerede afgjort løftet i krav-dok, så master-plan tilrettes (præcis som master-planen selv foreskriver)               |

## V3 → V4: Codex-fund runde 3 (alle ADRESSERET)

| #    | Fund                                                                                                 | Severity          | Code-svar                                                                                                                                              |
| ---- | ---------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R3-1 | A.6 efterlod §8-tabellens vision-række som "Vinder over alt" — to modsatrettede regler i samme tabel | KRITISK           | **ACCEPT.** A.6 udvidet: vision-rækken patches med D4-undtagelsen (nuværende 1:1 + ny 1:1 i A.6). Lukker §8.1-modsigelsen samlet med A.1/A.2/A.10/A.14 |
| R3-2 | parse-test mangler routing-dækning for WORKAROUND/ESCALATE/halt-marker                               | G-NUMMER-KANDIDAT | **ADOPT** (rettet nu frem for G-nummer). +3 fixtures i B.1 — alle fem exit-koder 0/1/2/3/4 beviste                                                     |

## Step 2.0 — Skitse + størrelses-tjek

**0 migrations.** 3 scripts slettes, 1 script repareres, 2 `.mjs`-filer udvides
(scanner + selftest), 11 docs patches (inkl. vision-banner, fund 1, +
master-plan-hierarki, fund R2-4). Under §3.8-grænsen → fuld plan, intet split.

## Verificerede repo-objekter (state-dump, fund 3-rettet)

§3.2 DB-state-dump er **N/A** — pakken rører ingen DB-objekter. Erstattet af
repo-state-dump. Metode: `git archive <hash> | tar -x` til temp-dir +
`node scripts/governance-check.mjs` i den — altså committed tree, ikke working
tree. Verificeret 2026-06-10:

| Tree                                                                   | Resultat                                      |
| ---------------------------------------------------------------------- | --------------------------------------------- |
| `main @ 1278e92`                                                       | alle 7 checks grønne — **18 docs, 6 scripts** |
| `claude/gov-docs-renhed-plan @ df4105d` (V1: + krav-dok, plan, status) | alle 7 checks grønne — **21 docs, 6 scripts** |

(V1 angav "19 docs" — det var en working-tree-kørsel med untracked krav-dok.
Præcis den fabrikations-flade selftesten's git-archive-fixture eksisterer for.)

**Måle-punkt-disciplin (fund R2-2):** baseline-rækken (main) er det autoritative
dump planen patcher mod. Branch-rækken drifter pr. plan-commit by construction
(hver V-commit tilføjer/ændrer docs — fx er V2-committen selv 22 docs) og
fastfryses derfor ikke pr. V; den re-verificeres som build-evidens i batch 3.

- **Scripts (`.sh`, scannet):** codex-review.sh (286 l) · claude-ai-prompt.sh
  (192 l) · data-grundlag.sh (173 l) · krav-afklar.sh (135 l) · schema-check.sh ·
  types-gen.sh
- **CI:** `governance:check` = `.github/workflows/ci.yml:67`,
  `governance:selftest` = `ci.yml:70`; package.json:27-28.
- **Allowlist:** `scripts/governance-check.mjs:42-99` — 12 entries med
  `klasse`-felt; `deadDocPaths()` (linje 129-142) bruger kun `ALLOWED`-settet
  (linje 100) og skelner IKKE på klasse eller fil-type. **Hullet:**
  `codex-review.sh:78` peger på slettet `docs/skabeloner/codex-review-prompt.md`
  og går grønt fordi entry'en findes som historisk-provenance.
- **H020:** historisk kode i `docs/teknisk/huskeliste.md:54` med tombstone-række
  linje 62. Refereres levende fra `disciplin.md:46` (§2) og `disciplin.md:174` (§6.2).
- **Allowlist-stiers referenter** (grep i scannerens scope — uden arkiv,
  v4-slettede-docs og rapport-historik):

  | Allowlist-sti                          | Refereres fra                                                                                              |
  | -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
  | skabeloner/codex-review-prompt.md      | codex-review.sh + krav-dok (prosa)                                                                         |
  | coordination/mathias-afgoerelser.md    | claude-ai-prompt.sh + data-grundlag.sh (kun scripts)                                                       |
  | overvaagning/claude-ai-overvaagning.md | claude-ai-prompt.sh (kun script)                                                                           |
  | overvaagning/codex-overvaagning.md     | gov-2-vagt-plan.md + teknisk-gaeld.md (prosa)                                                              |
  | strategi/bygge-status.md               | data-grundlag.sh + gov-2-vagt-plan.md + teknisk-gaeld.md                                                   |
  | skabeloner/plan-skabelon.md            | gov-2-vagt-plan.md + teknisk-gaeld.md (prosa)                                                              |
  | skabeloner/rapport-skabelon.md         | ingen i scannet scope (kun rapport-historik/README.md — scope-ekskluderet, derfor overlevede den døde ref) |
  | strategi/arbejds-disciplin.md          | gov-2-vagt-plan.md + teknisk-gaeld.md (prosa)                                                              |
  | coordination/plan-feedback             | claude-ai-prompt.sh + disciplin §4 (kortform uden mappe-prefix)                                            |
  | coordination/codex-reviews             | codex-review.sh                                                                                            |

## Repair-vs-slet-verdikt pr. script (krav-dok §Åbne spørgsmål, D1+D3)

| Script                | Verdikt    | Begrundelse                                                                                                                                                                                                                        |
| --------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `codex-review.sh`     | **REPAIR** | Severity-exit-routing (G055-arbejdet), timeout-håndtering og review-fil-med-header er reel værdi nu (manuel dispatch) og genbruges i gov-5-runneren. Bruddet er V5.3-skallen: prefix-fil + fire-dok-formål + stdin-hænger (fund 6) |
| `claude-ai-prompt.sh` | **SLET**   | Indlejrer fjernet fire-dok-ramme + V5.3-step-numre; peger på slettede mathias-afgoerelser.md + claude-ai-overvaagning.md. Substansen overhalet af SKILL.md-i-repo + Filesystem-MCP                                                 |
| `data-grundlag.sh`    | **SLET**   | V5.3 "Step 0"; læser slettet bygge-status.md. Substansen lever i §9.1 proaktiv recon (`qwers <pakke>`)                                                                                                                             |
| `krav-afklar.sh`      | **SLET**   | V5.3 "Step 2" + V5.3-routing. Substansen lever i V5 Step 1 + Step 2.1 Codex-parallel. Rækken i scripts/README.md fjernes med                                                                                                       |

Alle tre sletninger er `git rm` — fuld body bevares i git-history (§4).

## Mekaniske værn — design

### Værn 1: allowlist-split (krav pkt 9)

`deadDocPaths()` skelner fil-type: docs må bruge alle allowlist-klasser
(uændret); scripts må IKKE bruge `historisk-provenance`-entries, medmindre
scriptet har standalone-linje `# governance: deprecated`. Klasserne
`runtime-ephemeral` / `future-required` / `scope-excluded-local` gælder fortsat
begge fil-typer (scripts laver legitimt `mkdir -p` på runtime-stier). Kode 1:1 i
appendix B.2. Allowlist-vedligehold i samme commit: prune
`mathias-afgoerelser.md`, `claude-ai-overvaagning.md`, `rapport-skabelon.md`
(referenter væk efter sletninger + README-repoint — verificeres med
`GOV_VERBOSE=1`); resten beholdes (levende prosa-referenter).

### Værn 2: strukturelt kæde-tjek (krav pkt 10, fund 4-udvidet)

Ny check `structural-chain` (kode 1:1 i appendix B.3):

- **Markør** (standalone linje i aktiv-plan.md):
  `<!-- aktiv-pakke: <navn> fase: plan|build|rapport -->` eller
  `<!-- aktiv-pakke: ingen -->`. Manglende markør = violation (tilstand skal
  være eksplicit). `ingen` → pass.
- Ellers: `<navn>-krav-og-data.md` + `<navn>-plan.md` + `<navn>-status.md`
  skal eksistere i docs/coordination/.
- **Krydspeg (fund 4 + R2-3):** plan-filen skal indeholde stierne til BÅDE
  krav-dok og status-fil; status-filen skal nævne pakkenavnet.
- **Formåls-immutabilitet mekanisk (§3.0):** blockquoten der starter med
  `> Denne pakke leverer:` normaliseres (fortløbende `>`-linjer, prefix
  strippet, joinet, whitespace collapsed) — identisk i krav-dok og plan.
- **fase: rapport (fund 4 + R2-3):** mindst én
  `rapport-historik/*-<navn>.md` skal eksistere, HAVE en Formål-blok (mangler
  blokken er det en violation, ikke et skip) og matche den normaliserede
  Formål-streng.
- Strukturel + string-match, ingen semantik (ærlig grænse per krav-dok).

aktiv-plan.md får markøren i denne pakke (`fase: build` ved build-start;
`ingen` i merge-commit ved pakke-luk — doc-currency B).

### Værn 3: §8.1-SVAR som fast markør (krav pkt 11)

Markør-format: `§8.1-SVAR: INGEN-MODSIGELSE` eller
`§8.1-SVAR: MODSIGELSE — <begreb> ejes af <doc>`. Obligatorisk linje i
Codex-review når governance-doc er berørt; felt i slut-rapport-skabelonen
(§10.3) så den kan tjekkes i rapport/PR, ikke kun chat. Doc-patches i appendix
A.5/A.6/A.7. (Runde 1 af denne pakke brugte den allerede — og fangede fund 1.)

## End-to-end-spor (§3.3)

N/A i DB-forstand — ingen write-RPC'er. Det leverede spor er check-sporet:
planted overtrædelse → scanner rød → CI rød (ci.yml:67/70) → fix → grøn.
Beviset er selftest-casene (§3.6 opfyldt, ikke schema-only).

## End-to-end-test-design (fund 4-udvidet)

`governance-check.selftest.mjs` udvides med 9 cases (kode 1:1 i appendix B.4):

1. `script-dead-path`: script peger på historisk-provenance-sti → rød
   (ville have fanget krav-dok pkt 1)
2. `script-dead-path-deprecated`: samme + `# governance: deprecated` → grøn
   (flugtvejen er bevidst, ikke et hul)
3. `chain-missing-files`: markør sat, filer mangler → rød
4. `chain-formaal-mismatch`: krav↔plan Formål-streng afviger → rød
5. `chain-missing-krydspeg`: plan uden krav-dok-sti → rød
6. `chain-missing-status-krydspeg`: plan uden status-sti → rød (fund R2-3)
7. `chain-rapport-missing`: fase:rapport uden rapport-fil → rød
8. `chain-rapport-formaal-mismatch`: rapport-Formål afviger → rød
9. `chain-rapport-no-formaal`: rapport uden Formål-blok → rød (fund R2-3)

Baseline-case (ren git-archive-kopi → grøn) består uændret. Dertil
`codex-review.sh --parse-test` (appendix B.1, fund R2-1) som batch 1-evidens.

## Implementations-rækkefølge (3 batches)

| Batch                | Hvad                                                                                           | Afhængighed | Risiko                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| 1 — script-reconcile | git rm 3 scripts · repair codex-review.sh (appendix B.1) · scripts/README.md                   | ingen       | Lav. Governance-check grøn efter                                                          |
| 2 — doc-reconcile    | alle doc-patches (appendix A.1–A.14)                                                           | ingen       | Lav. §8.1-gate: Codex' §8.1-SVAR kræves; vision-patch kræver Mathias-CODEOWNERS ved merge |
| 3 — mekaniske værn   | allowlist-split + prune · kæde-tjek · aktiv-pakke-markør · 7 selftest-cases (appendix B.2–B.4) | batch 1+2   | Mellem. Selftest beviser begge retninger                                                  |

Rækkefølgen er bevidst: værnene lander mod et rent repo; selftest case 1
beviser at de ville have fanget batch 1-tilstanden.

## Doc-currency

**A. Fundament-validering (FØR qwerg):** Pakken ændrer BEGGE stamme-docs'
status-tekst: forretningsforstaaelse løftes til LÅST (Mathias' afgørelse i
krav-dok) og vision-banneret får D4-undtagelsen (fund 1 — implementerer Mathias'
D4, ingen ny Code-intention). Begge går gennem §8.1-gaten i dette review +
Mathias' CODEOWNERS-approval ved merge — valideret FØR qwerg via Codex'
§8.1-SVAR i godkendelses-runden. Øvrig plan: ingen forretnings-intentions-
ændring. Verificeret current pr. main @ `1278e92`.

**B. Status-opdatering (committes med merge):**

| Doc                        | Berørt? | Opdatering                                                                      |
| -------------------------- | ------- | ------------------------------------------------------------------------------- |
| aktiv-plan.md              | ja      | pakke-status + aktiv-pakke-markør (→ `ingen` ved pakke-luk)                     |
| seneste-rapport.md         | ja      | ny rapport-sti + commit ved Step 5                                              |
| master-plan §4.1           | delvist | §4.1-trinstatus uberørt (gov-spor); hierarki-afsnittet patches dog (A.14, R2-4) |
| teknisk-gaeld.md (G)       | nej     | G063 forbliver åben (gov-6); ingen G rejst/løst — medmindre build finder noget  |
| huskeliste.md (H)          | nej     | H020 forbliver historisk; refs repointes kun                                    |
| disciplin "Forudsætninger" | ja      | CI-blocker-linje + Gjort-listen à jour (§8.1-gate)                              |

## IKKE i denne plan

gov-4 branch protection (værnene gøres required DÉR) · gov-5 automation ·
gov-6 arkiv-fold (G063 + v4-slettede-docs) · P3-spor · semantisk
prosa-modsigelses-scanner (§8.1 lag 2 er Codex).

**Observation uden handling (gov-6-kandidat):** gov-1/gov-2/gov-3a-plan-filer
ligger stadig i docs/coordination/ trods §4. Noteres til gov-6.

## Åbne krav-dok-spørgsmål → afgjort

1. Script-verdikter: 1 repair, 3 slet (tabel ovenfor).
2. Kæde-tjek i CI eller on-demand: **CI** (kører via governance:check-steppet;
   required først i gov-4 per D2).

---

## Appendix A — Patch-først: docs (nuværende 1:1 → ny 1:1)

### A.1 `docs/strategi/vision-og-principper.md:5` (fund 1)

Nuværende:

> **LÅST DOKUMENT.** Dette er grundstenen i Stork 2.0. Ændringer kræver eksplicit godkendelse fra Mathias via PR. CODEOWNERS håndhæver at kun Mathias kan approve ændringer. Dokumentet er autoritativ kilde for vision og principper — ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette.

Ny (kun sidste sætning udvidet — resten bevares ordret):

> **LÅST DOKUMENT.** Dette er grundstenen i Stork 2.0. Ændringer kræver eksplicit godkendelse fra Mathias via PR. CODEOWNERS håndhæver at kun Mathias kan approve ændringer. Dokumentet er autoritativ kilde for vision og principper — ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette. Undtagelse (D4): `forretningsforstaaelse.md` er med-stamme-doc — en modsigelse mellem de to er et hul der STOPPER arbejdet og lukkes af Mathias, ikke en konflikt dette dokument vinder.

### A.2 `docs/strategi/forretningsforstaaelse.md` — LÅST-banner

Nuværende linje 1-5 (banner findes ikke):

```
# Stork 2.0 — Forretningsforståelse

<!-- governance-owns: forretnings-intention -->

Dette dokument forklarer hvordan Stork-forretningen hænger sammen. [...]
```

Ny: banner indsættes mellem owns-markøren og intro-afsnittet:

> **LÅST DOKUMENT (stamme-doc med vision-og-principper.md).** Ændringer kræver eksplicit godkendelse fra Mathias via PR; CODEOWNERS håndhæver. Opdateres når Mathias' tanker udvikler sig — men de to stamme-docs må aldrig være indbyrdes uenige: en modsigelse er et hul der STOPPER og lukkes af Mathias (D4). Mekanisk håndhævelse (required code-owner-review) lander i gov-4 — dette er doc-niveau-løftet.

### A.3 `disciplin.md:46` (§2 automation-note)

Nuværende (uddrag — kun den fede del ændres):

> [...] og plan-branchen er ikke dækket af triggeren **(H020)**. Indtil det bygges: [...]

Ny: `(H020)` → `(bygges i gov-5-automation)`. Resten af noten ordret bevaret.

exec
/bin/bash -lc "test -f docs/coordination/gov-docs-renhed-status.md && sed -n '1,260p' docs/coordination/gov-docs-renhed-status.md || true" in /home/mathias/stork-2.0
 succeeded in 0ms:
# gov-docs-renhed — Pakke-status

**Sidste handling:** Build batch 4 (fix-batch): Codex build-review runde 5 gav 3 KRITISK — alle rettet (v4-slettede-docs untracked igen + .gitignore-værn; denne status-fil synkroniseret; MANGLENDE-EKSISTERENDE-BEVARELSE routet til exit 2 + fixture). 2026-06-10.
**Næste forventet:** Codex verifikations-review (runde 6) af batch 4 → grøn → Code skriver slut-rapport → Claude.ai-review FØR merge (Step 5) → Mathias "slut OK" + merge.
**Konvergens-counter:** 4 (plan-fase, afsluttet ved runde 4-APPROVAL). Build-reviews: runde 5 (3 KRITISK → batch 4), runde 6 afventes.
**Aktuel blocker:** ingen.

Build-state (qwerg 2026-06-10):

- Batch 1 ✓ (`ddc72db`): 3 V5.3-scripts slettet, codex-review.sh repareret.
  Evidens: --parse-test grøn, governance:check grøn.
- Batch 2 ✓ (`42bfb55`): doc-reconcile A.1–A.14. Evidens: governance:check grøn.
  (Fejl-committede også 17 v4-slettede-docs-filer — fanget af Codex runde 5,
  rettet i batch 4.)
- Batch 3 ✓ (`00c1ebd`): allowlist-split + structural-chain + sti-regex-fix +
  9 selftest-cases + aktiv-pakke-markør. Evidens: selftest fuldt grøn
  (baseline + 13 plantede + deprecated-positiv), fitness grøn.
- Batch 4 ✓: runde 5-fund-fixes (denne commit).

Plan-afvigelser (til slut-rapport):

1. rapport-skabelon-allowlist-entry beholdt (plan sagde prune) — planens egen
   A.12-tekst er levende prosa-referent; prune ved pakke-luk/gov-6.
2. v4-slettede-docs/ kortvarigt tracked i batch 2 (Code-fejl, `git add -A`) —
   untracked igen + .gitignore-værn i batch 4. Aldrig på main.
3. MANGLENDE-EKSISTERENDE-BEVARELSE-routing tilføjet parseren (runde 5-fund) —
   udvidelse af B.1 inden for §5-semantikken.
4. codex-reviews/ tilføjet scannerens DOC_EXCLUDE (batch 4b) — review-filer er
   ephemeral rå-output (§4) der bevidst citerer døde stier; first-time-fund da
   reviews aldrig før var committet som filer.

Noter:

- Krav OK 2026-06-10 · qwerg 2026-06-10. 0 migrations — ren docs+scripts-pakke.
- Reviews: codex-reviews/2026-06-10-gov-docs-renhed-runde-{1..4}.md (plan:
  2K+3M → 1K+3M → 1K+1G → APPROVAL) · runde-5.md (build: 3 KRITISK → batch 4).
- Driftsnote: `codex exec` uden TTY kræver `< /dev/null` — indbygget i repareret
  codex-review.sh.

codex
Plan og status siger, at runde 6 skal verificere batch 4-fixes efter tre kritiske fund i runde 5. Jeg tjekker nu faktisk git-state og diffen mod main, så reviewet ikke baserer sig på statusfilens påstande alene.
exec
/bin/bash -lc 'git status --short --branch' in /home/mathias/stork-2.0
 succeeded in 0ms:
## claude/gov-docs-renhed-build...origin/claude/gov-docs-renhed-build

exec
/bin/bash -lc 'git merge-base HEAD main' in /home/mathias/stork-2.0
 succeeded in 0ms:
20fa13a2c283cee2638a9621f44119ea9cd1b352

exec
/bin/bash -lc 'git log --oneline --decorate --max-count=12 --all' in /home/mathias/stork-2.0
 succeeded in 0ms:
821e1b3 (HEAD -> claude/gov-docs-renhed-build, origin/claude/gov-docs-renhed-build) gov-docs-renhed build batch 4b: codex-reviews/ scope-ekskluderet i scanner — committede review-filer er ephemeral rå-output (§4) der bevidst citerer døde stier
1b87753 gov-docs-renhed build batch 4: runde 5-fixes — v4-slettede-docs untracked + .gitignore-værn (KRITISK 1), status-fil synkroniseret (KRITISK 2), MANGLENDE-EKSISTERENDE-BEVARELSE → exit 2 + fixture (KRITISK 3), runde 5-review-fil committet
00c1ebd gov-docs-renhed build batch 3: allowlist-split (klasse-skel + deprecated-flugtvej) + structural-chain (markør, krydspeg, Formål-immutabilitet mekanisk, fase:rapport) + danske bogstaver i sti-regex + 9 selftest-cases + aktiv-pakke-markør
42bfb55 gov-docs-renhed build batch 2: doc-reconcile A.1–A.14 — D4-konsistens i begge stamme-docs + §8-tabel + LÆSEFØLGE + master-plan, §8.1-SVAR-markør, branch-bevidst git-regel, §7 #4 ærlig label, Forudsætninger-sync, README-repoint, SKILL kanonisk
ddc72db gov-docs-renhed build batch 1: slet 3 V5.3-scripts + repair codex-review.sh (V5-prompt fra §10.4, bracket-tolerant parsing, --parse-test, stdin-fix) + README-række
4fe5164 (origin/claude/gov-docs-renhed-plan, claude/gov-docs-renhed-plan) gov-docs-renhed: Codex runde 4 APPROVAL + INGEN NYE FUND — plan-fase lukket, afventer qwerg
fd26f84 gov-docs-renhed Plan V4: R3-1 KRITISK — §8-vision-række D4-patches også; R3-2 ADOPT — parse-test fuld routing-dækning. Counter 4: §3.4-alert rejst i status (klar til Codex runde 4)
9c1dcff gov-docs-renhed Plan V3: runde 2-fund adresseret — bracket-tolerant marker-parsing + parse-test (KRITISK), kæde-tjek status-krydspeg + rapport-Formål-krav, master-plan-hierarki D4-patch, måle-punkt-disciplin (klar til Codex runde 3)
28e0010 gov-docs-renhed Plan V2: runde 1-fund adresseret — vision-banner D4, patch-først-appendix, præcis state-dump, kæde-tjek udvidet, §10.4-patch (klar til Codex runde 2)
df4105d gov-docs-renhed Plan V1: script-verdikter + doc-reconciles + allowlist-split + kæde-tjek (klar til Codex)
0a0cb97 (origin/dependabot/npm_and_yarn/npm_and_yarn-5737324458) build(deps-dev): bump vitest
1278e92 (origin/main, origin/HEAD) gov-3b-3b: udfyld merge-hash (7be6511) i rapport + pointers

exec
/bin/bash -lc 'git ls-files v4-slettede-docs docs/coordination/codex-reviews .gitignore' in /home/mathias/stork-2.0
 succeeded in 0ms:
.gitignore
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-1.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-2.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-3.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-4.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md

exec
/bin/bash -lc 'git diff --stat main...HEAD' in /home/mathias/stork-2.0
 succeeded in 0ms:
 .gitignore                                         |    3 +
 CLAUDE.md                                          |    2 +-
 "docs/L\303\206SEF\303\230LGE.md"                  |   16 +-
 docs/claude-ai/SKILL.md                            |    7 +
 docs/coordination/aktiv-plan.md                    |    4 +-
 .../2026-06-10-gov-docs-renhed-runde-1.md          |   33 +
 .../2026-06-10-gov-docs-renhed-runde-2.md          |   29 +
 .../2026-06-10-gov-docs-renhed-runde-3.md          |   19 +
 .../2026-06-10-gov-docs-renhed-runde-4.md          |   17 +
 .../2026-06-10-gov-docs-renhed-runde-5.md          | 3890 ++++++++++++++++++++
 docs/coordination/gov-docs-renhed-krav-og-data.md  |  173 +
 docs/coordination/gov-docs-renhed-plan.md          |  842 +++++
 docs/coordination/gov-docs-renhed-status.md        |   38 +
 .../rapport-historik/2026-06-05-gov-3b-2.md        |   80 +
 .../rapport-historik/2026-06-07-gov-3b-3a.md       |  104 +
 .../rapport-historik/2026-06-07-gov-3b-3b.md       |   87 +
 docs/coordination/rapport-historik/README.md       |    2 +-
 docs/coordination/seneste-rapport.md               |    2 +-
 docs/strategi/disciplin.md                         |   71 +-
 docs/strategi/forretningsforstaaelse.md            |    2 +
 docs/strategi/stork-2-0-master-plan.md             |    4 +-
 docs/strategi/vision-og-principper.md              |    2 +-
 docs/teknisk/teknisk-gaeld.md                      |    8 +
 packages/types/src/database.ts                     |   28 +-
 scripts/README.md                                  |    1 -
 scripts/claude-ai-prompt.sh                        |  192 -
 scripts/codex-review.sh                            |  280 +-
 scripts/data-grundlag.sh                           |  173 -
 scripts/fitness.mjs                                |  220 ++
 scripts/fitness.selftest.mjs                       |   67 +-
 scripts/governance-check.mjs                       |  106 +-
 scripts/governance-check.selftest.mjs              |   75 +
 scripts/krav-afklar.sh                             |  135 -
 ...0001_core_identity_secdef_permission_action.sql |   74 +
 ...100002_core_identity_secdef_permission_area.sql |   56 +
 ...100003_core_identity_secdef_permission_page.sql |   49 +
 ...7100004_core_identity_secdef_permission_tab.sql |   49 +
 ...7110001_core_identity_secdef_pending_change.sql |  183 +
 ..._core_identity_secdef_role_permission_grant.sql |   75 +
 ...607110003_core_identity_secdef_undo_setting.sql |   39 +
 ...e_identity_revoke_authenticated_core_writes.sql |   12 +
 .../tests/smoke/gov_3b_3a_permission_secdef.sql    |   75 +
 supabase/tests/smoke/gov_3b_3b_secdef_revoke.sql   |   58 +
 43 files changed, 6698 insertions(+), 684 deletions(-)

exec
/bin/bash -lc 'git diff --name-status main...HEAD' in /home/mathias/stork-2.0
 succeeded in 0ms:
M	.gitignore
M	CLAUDE.md
M	"docs/L\303\206SEF\303\230LGE.md"
M	docs/claude-ai/SKILL.md
M	docs/coordination/aktiv-plan.md
A	docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-1.md
A	docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-2.md
A	docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-3.md
A	docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-4.md
A	docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md
A	docs/coordination/gov-docs-renhed-krav-og-data.md
A	docs/coordination/gov-docs-renhed-plan.md
A	docs/coordination/gov-docs-renhed-status.md
A	docs/coordination/rapport-historik/2026-06-05-gov-3b-2.md
A	docs/coordination/rapport-historik/2026-06-07-gov-3b-3a.md
A	docs/coordination/rapport-historik/2026-06-07-gov-3b-3b.md
M	docs/coordination/rapport-historik/README.md
M	docs/coordination/seneste-rapport.md
M	docs/strategi/disciplin.md
M	docs/strategi/forretningsforstaaelse.md
M	docs/strategi/stork-2-0-master-plan.md
M	docs/strategi/vision-og-principper.md
M	docs/teknisk/teknisk-gaeld.md
M	packages/types/src/database.ts
M	scripts/README.md
D	scripts/claude-ai-prompt.sh
M	scripts/codex-review.sh
D	scripts/data-grundlag.sh
M	scripts/fitness.mjs
M	scripts/fitness.selftest.mjs
M	scripts/governance-check.mjs
M	scripts/governance-check.selftest.mjs
D	scripts/krav-afklar.sh
A	supabase/migrations/20260607100001_core_identity_secdef_permission_action.sql
A	supabase/migrations/20260607100002_core_identity_secdef_permission_area.sql
A	supabase/migrations/20260607100003_core_identity_secdef_permission_page.sql
A	supabase/migrations/20260607100004_core_identity_secdef_permission_tab.sql
A	supabase/migrations/20260607110001_core_identity_secdef_pending_change.sql
A	supabase/migrations/20260607110002_core_identity_secdef_role_permission_grant.sql
A	supabase/migrations/20260607110003_core_identity_secdef_undo_setting.sql
A	supabase/migrations/20260607110004_core_identity_revoke_authenticated_core_writes.sql
A	supabase/tests/smoke/gov_3b_3a_permission_secdef.sql
A	supabase/tests/smoke/gov_3b_3b_secdef_revoke.sql

codex
Den første diff mod lokal `main` inkluderer ældre gov-3b filer, hvilket tyder på at lokal `main` ikke er samme base som `origin/main`. Jeg skifter review-basis til `origin/main`, fordi plan/status selv angiver `main @ 1278e92` som målepunktet.
exec
/bin/bash -lc 'git merge-base HEAD origin/main' in /home/mathias/stork-2.0
 succeeded in 0ms:
1278e92376928829c99038192e2ca533f911cae7

exec
/bin/bash -lc 'git diff --name-status origin/main...HEAD' in /home/mathias/stork-2.0
 succeeded in 0ms:
M	.gitignore
M	CLAUDE.md
M	"docs/L\303\206SEF\303\230LGE.md"
M	docs/claude-ai/SKILL.md
M	docs/coordination/aktiv-plan.md
A	docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-1.md
A	docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-2.md
A	docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-3.md
A	docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-4.md
A	docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md
A	docs/coordination/gov-docs-renhed-krav-og-data.md
A	docs/coordination/gov-docs-renhed-plan.md
A	docs/coordination/gov-docs-renhed-status.md
M	docs/coordination/rapport-historik/README.md
M	docs/strategi/disciplin.md
M	docs/strategi/forretningsforstaaelse.md
M	docs/strategi/stork-2-0-master-plan.md
M	docs/strategi/vision-og-principper.md
M	scripts/README.md
D	scripts/claude-ai-prompt.sh
M	scripts/codex-review.sh
D	scripts/data-grundlag.sh
M	scripts/governance-check.mjs
M	scripts/governance-check.selftest.mjs
D	scripts/krav-afklar.sh

exec
/bin/bash -lc 'git diff --stat origin/main...HEAD' in /home/mathias/stork-2.0
 succeeded in 0ms:
 .gitignore                                         |    3 +
 CLAUDE.md                                          |    2 +-
 "docs/L\303\206SEF\303\230LGE.md"                  |   16 +-
 docs/claude-ai/SKILL.md                            |    7 +
 docs/coordination/aktiv-plan.md                    |    4 +-
 .../2026-06-10-gov-docs-renhed-runde-1.md          |   33 +
 .../2026-06-10-gov-docs-renhed-runde-2.md          |   29 +
 .../2026-06-10-gov-docs-renhed-runde-3.md          |   19 +
 .../2026-06-10-gov-docs-renhed-runde-4.md          |   17 +
 .../2026-06-10-gov-docs-renhed-runde-5.md          | 3890 ++++++++++++++++++++
 docs/coordination/gov-docs-renhed-krav-og-data.md  |  173 +
 docs/coordination/gov-docs-renhed-plan.md          |  842 +++++
 docs/coordination/gov-docs-renhed-status.md        |   38 +
 docs/coordination/rapport-historik/README.md       |    2 +-
 docs/strategi/disciplin.md                         |   49 +-
 docs/strategi/forretningsforstaaelse.md            |    2 +
 docs/strategi/stork-2-0-master-plan.md             |    2 +-
 docs/strategi/vision-og-principper.md              |    2 +-
 scripts/README.md                                  |    1 -
 scripts/claude-ai-prompt.sh                        |  192 -
 scripts/codex-review.sh                            |  280 +-
 scripts/data-grundlag.sh                           |  173 -
 scripts/governance-check.mjs                       |  106 +-
 scripts/governance-check.selftest.mjs              |   75 +
 scripts/krav-afklar.sh                             |  135 -
 25 files changed, 5440 insertions(+), 652 deletions(-)

exec
/bin/bash -lc 'git diff origin/main...HEAD -- .gitignore scripts/governance-check.mjs scripts/governance-check.selftest.mjs scripts/codex-review.sh scripts/fitness.mjs scripts/fitness.selftest.mjs' in /home/mathias/stork-2.0
 succeeded in 0ms:
diff --git a/.gitignore b/.gitignore
index 6ca0875..9a70015 100644
--- a/.gitignore
+++ b/.gitignore
@@ -46,3 +46,6 @@ supabase/.branches/
 
 # MS Office lock-filer (utilsigtet åbnet i Word/Excel)
 ~$*
+
+# Lokale V4-gennemgangs-kopier — aldrig committet; foldes/fjernes i gov-6 (G063)
+docs/coordination/v4-slettede-docs/
diff --git a/scripts/codex-review.sh b/scripts/codex-review.sh
index 8d54cc4..1dd88d2 100755
--- a/scripts/codex-review.sh
+++ b/scripts/codex-review.sh
@@ -1,20 +1,154 @@
 #!/usr/bin/env bash
 # scripts/codex-review.sh
-# Wrapper for Codex CLI review-runder (V5.3 marker-protocol).
+# Wrapper for Codex CLI review-runder — V5 (disciplin.md §5 severities + §6.1 halt-markers).
 #
 # Brug:
 #   scripts/codex-review.sh <plan-fil> <runde-N> [--xhigh|--quick] [--phase=plan|build|slut-rapport]
+#   scripts/codex-review.sh --parse-test
 #
-# Defaults: xhigh + fast_mode + timeout 480s + file-reference prompt + tail-monitor.
+# Defaults: xhigh + fast_mode + timeout 480s + file-reference prompt.
 # --quick: medium reasoning + timeout 120s + max 150 ord output (til intermediate batch-tjek).
 # --xhigh: explicit (default — flag for klarhed når der er valg).
+# --parse-test: kør canned fixtures gennem marker-parseren og assertér exit-routing.
+#
+# Prompt genereres fra disciplin.md V5 §10.4 (inline — ingen prefix-fil).
 #
 # Output: docs/coordination/codex-reviews/<dato>-<pakke>-runde-<N>.md
 #         (med header om command + plan-SHA + raw codex-output)
-# Stdout: echoes outputtet samt parser markers per V5.3 marker-protokol
+# Stdout: echoes outputtet samt parser markers per V5 §5/§6.1
+#
+# Exit-koder:
+#   0  = clean eller G-NUMMER-KANDIDAT (fortsæt)
+#   1  = STOP-FOR-CLARIFICATION (info-mangel)
+#   2  = halt-marker (BRUD-PAA-KRAV / TEKNISK-BLOKERING / PLAN-AFVIGELSE / KRITISK-SIKKERHEDSHUL)
+#        ELLER severity-prefix (KRITISK — stopper plan i alle runder per §5)
+#   3  = WORKAROUND-INTRODUCERET (Mathias-gate)
+#   4  = ESCALATE / AUTO-ESKALATION / NEEDS-MATHIAS (Mathias-judgment kræves før V<n+1>)
+#   124 = codex timeout
 
 set -euo pipefail
 
+# ============================================================
+# Marker-parsing (V5 §5 severities + §6.1 halt-markers)
+# Bracket-tolerant: §10.4-formatet er "[SEVERITY] beskrivelse"; nøgne
+# "SEVERITY:"-prefixes accepteres også (gov-docs-renhed R2-1).
+# ============================================================
+
+parse_markers() {
+  local f="$1"
+  local clarification_hit=0 halt_hit=0 severity_hit=0
+  local workaround_hit=0 escalate_hit=0 needs_mathias_hit=0
+
+  if grep -qE '^\[?STOP-FOR-CLARIFICATION\]?(\b|:)' "$f"; then
+    clarification_hit=1
+    echo "  ⏸  STOP-FOR-CLARIFICATION rejst — info-mangel" >&2
+  fi
+
+  if grep -qE '^\[?(BRUD-PAA-KRAV|TEKNISK-BLOKERING|PLAN-AFVIGELSE|KRITISK-SIKKERHEDSHUL)\]?(\b|:)' "$f"; then
+    halt_hit=1
+    echo "  🛑 Halt-marker rejst — kræver LØS-dialog eller eskalation" >&2
+  fi
+
+  # Severity-prefix detection (G055-fix, bracket-tolerant per R2-1)
+  # KRITISK uden halt-marker er stadig blocker per §5
+  # ("KRITISK — stopper plan/build i alle runder").
+  # \b efter KRITISK så "KRITISKE" ikke triggers false positive.
+  if grep -qE '^\[?KRITISK\]?\b' "$f"; then
+    severity_hit=1
+    echo "  🛑 KRITISK-severity rejst — stopper plan i alle runder" >&2
+  fi
+
+  # MANGLENDE-EKSISTERENDE-BEVARELSE er KRITISK-undertype (§5) — samme routing
+  if grep -qE '^\[?MANGLENDE-EKSISTERENDE-BEVARELSE\]?\b' "$f"; then
+    severity_hit=1
+    echo "  🛑 MANGLENDE-EKSISTERENDE-BEVARELSE rejst (KRITISK-undertype) — stopper" >&2
+  fi
+
+  # NEEDS-MATHIAS — stopper plan og kræver Mathias-afgørelse før V<n+1>
+  if grep -qE '^\[?NEEDS-MATHIAS\]?\b' "$f"; then
+    needs_mathias_hit=1
+    echo "  🚦 NEEDS-MATHIAS rejst — Code må ikke lave V<n+1> før Mathias har afgjort" >&2
+  fi
+
+  if grep -qE '^\[?WORKAROUND-INTRODUCERET\]?(\b|:)' "$f"; then
+    workaround_hit=1
+    echo "  ⚠️  WORKAROUND-INTRODUCERET — Mathias-gate kræves" >&2
+  fi
+
+  if grep -qE '^\[?(ESCALATE|AUTO-ESKALATION)\]?(\b|:)' "$f"; then
+    escalate_hit=1
+    echo "  🚨 ESCALATE/AUTO-ESKALATION — Mathias-judgment via gate-fil" >&2
+  fi
+
+  if grep -qE '^\[?OPTIMERING-FORSLAG\]?(\b|:)' "$f"; then
+    echo "  💡 OPTIMERING-FORSLAG fundet — Code's valg (ADOPT/DEFER/DISMISS)" >&2
+  fi
+
+  if grep -qE '^\[?SPARRING-OENSKE\]?(\b|:)' "$f"; then
+    echo "  💬 SPARRING-OENSKE fundet" >&2
+  fi
+
+  if grep -qE '^\[?G-NUMMER-KANDIDAT\]?(\b|:)' "$f"; then
+    echo "  📝 G-NUMMER-KANDIDAT(er) — log til teknisk-gaeld.md (fortsæt)" >&2
+  fi
+
+  if grep -qE '^\[?APPROVAL\]?\b' "$f"; then
+    echo "  ✅ APPROVAL" >&2
+  fi
+
+  # Exit-koder per routing-tabel (uændret prioritet):
+  if [ "$clarification_hit" -eq 1 ]; then return 1; fi
+  if [ "$workaround_hit" -eq 1 ]; then return 3; fi
+  if [ "$escalate_hit" -eq 1 ]; then return 4; fi
+  if [ "$needs_mathias_hit" -eq 1 ]; then return 4; fi
+  if [ "$halt_hit" -eq 1 ] || [ "$severity_hit" -eq 1 ]; then return 2; fi
+  return 0
+}
+
+# ============================================================
+# --parse-test: canned fixtures gennem parseren, assertér routing
+# (gov-docs-renhed R2-1/R3-2 — fuld dækning af exit-koder 0/1/2/3/4)
+# ============================================================
+
+if [ "${1:-}" = "--parse-test" ]; then
+  declare -a FIXTURES=(
+    "APPROVAL — Runde 1|0"
+    "[KRITISK] fund|2"
+    "KRITISK: fund|2"
+    "KRITISKE detaljer|0"
+    "[NEEDS-MATHIAS] spørgsmål|4"
+    "STOP-FOR-CLARIFICATION: mangler X|1"
+    "[PLAN-AFVIGELSE] afviger fra plan|2"
+    "WORKAROUND-INTRODUCERET: hack|3"
+    "[ESCALATE] iter > 3|4"
+    "[MANGLENDE-EKSISTERENDE-BEVARELSE] gate tabt|2"
+  )
+  FAILED=0
+  TMP="$(mktemp -t parse-test.XXXXXX)"
+  trap 'rm -f "$TMP"' EXIT
+  for fixture in "${FIXTURES[@]}"; do
+    CONTENT="${fixture%|*}"
+    WANT="${fixture##*|}"
+    printf '%s\n' "$CONTENT" > "$TMP"
+    set +e
+    parse_markers "$TMP" 2>/dev/null
+    GOT=$?
+    set -e
+    if [ "$GOT" = "$WANT" ]; then
+      echo "  ✓ '$CONTENT' -> exit $GOT"
+    else
+      echo "  ✗ '$CONTENT' -> exit $GOT (forventede $WANT)" >&2
+      FAILED=1
+    fi
+  done
+  if [ "$FAILED" -eq 1 ]; then
+    echo "parse-test FEJLEDE" >&2
+    exit 1
+  fi
+  echo "parse-test: alle fixtures passed"
+  exit 0
+fi
+
 # ============================================================
 # Argument-parsing
 # ============================================================
@@ -22,20 +156,20 @@ set -euo pipefail
 if [ $# -lt 2 ]; then
   cat <<EOF
 Usage: $0 <plan-fil> <runde-N> [--xhigh|--quick] [--phase=plan|build|slut-rapport]
+       $0 --parse-test
 
 Eksempel:
   $0 docs/coordination/<pakke>-plan.md 1
   $0 docs/coordination/<pakke>-plan.md 2 --quick
   $0 docs/coordination/rapport-historik/<dato>-<pakke>.md 1 --phase=slut-rapport
 
-V5.3 marker-protokol: scriptet parser output for halt-markers + severity-prefixes + log-markers + positive markers.
+V5 marker-routing: scriptet parser output for halt-markers + severity-prefixes + positive markers (disciplin §5/§6.1).
 Exit-koder:
   0  = clean eller G-NUMMER-KANDIDAT (fortsæt)
   1  = STOP-FOR-CLARIFICATION (info-mangel)
-  2  = halt-marker (BRUD-PAA-KRAV / TEKNISK-BLOKERING / PLAN-AFVIGELSE / KRITISK-SIKKERHEDSHUL)
-       ELLER severity-prefix (^KRITISK\b — stopper plan i alle runder per overvaagning)
+  2  = halt-marker ELLER KRITISK-severity
   3  = WORKAROUND-INTRODUCERET (Mathias-gate)
-  4  = ESCALATE / AUTO-ESKALATION / NEEDS-MATHIAS (Mathias-judgment kræves før V<n+1>)
+  4  = ESCALATE / AUTO-ESKALATION / NEEDS-MATHIAS
   124 = codex timeout
 EOF
   exit 64
@@ -75,20 +209,13 @@ if [ ! -f "$PLAN_FILE" ]; then
   exit 64
 fi
 
-PREFIX_FILE="docs/skabeloner/codex-review-prompt.md"
-if [ ! -f "$PREFIX_FILE" ]; then
-  echo "❌ Niveau 1-prefix-fil findes ikke: $PREFIX_FILE" >&2
-  exit 64
-fi
-
 if ! command -v codex >/dev/null 2>&1; then
   echo "❌ codex CLI ikke fundet i PATH. Kør 'codex doctor' for diagnose." >&2
   exit 64
 fi
 
 # ============================================================
-# Build prompt — file-reference > embedded content
-# (V5.3 workflow-skabelon tooling-disciplin #3)
+# Build prompt — genereret fra disciplin.md V5 §10.4 (inline)
 # ============================================================
 
 PAKKE_NAME="$(basename "$PLAN_FILE" | sed -E 's/-plan\.md$//; s/\.md$//; s/^[0-9]{4}-[0-9]{2}-[0-9]{2}-//')"
@@ -106,32 +233,54 @@ OUTPUT_FILE="${OUTPUT_DIR}/${DATE}-${PAKKE_NAME}-runde-${ROUND_N}.md"
 
 PLAN_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo 'uncommitted')"
 
+STATUS_FILE="docs/coordination/${PAKKE_NAME}-status.md"
+KRAV_FILE="docs/coordination/${PAKKE_NAME}-krav-og-data.md"
+
 case "$PHASE" in
   plan|build)
     FORMAAL_LINE='FORMÅL: udledes af "## Formål"-sektionen i '"$PLAN_FILE"'.'
     ;;
   slut-rapport)
-    FORMAAL_LINE='FORMÅL (slut-rapport-fase): Verificér at slut-rapporten reflekterer faktisk leverance, plan-afvigelser ærligt, og fire-dokument-tjek korrekt. Underliggende pakke-formål kan slås op i rapport-headerens "Plan-fil"-felt hvis nødvendigt.'
+    FORMAAL_LINE='FORMÅL (slut-rapport-fase): Verificér at slut-rapporten reflekterer faktisk leverance, plan-afvigelser ærligt, og leverance-tabel mod krav-dok + Stork-invariant-tjek (disciplin §10.3) korrekt.'
     ;;
 esac
 
 PROMPT=$(cat <<EOF
-Læs disse filer:
-1. $PREFIX_FILE (niveau 1-prefix — anvend ordret)
-2. $PLAN_FILE ($PHASE-fasen for pakke $PAKKE_NAME)
+Du er Codex i Stork 2.0 — uafhængig kode-reviewer, read-only (disciplin §9.3).
+
+Læs FØR review:
+- docs/strategi/vision-og-principper.md
+- docs/strategi/forretningsforstaaelse.md (LÅST stamme-doc, D4)
+- docs/strategi/disciplin.md §9.3 (din rolle) + §5 (severities) + §8.1
+- $KRAV_FILE (pakke-kontrakt — hvis den findes)
+- $PLAN_FILE ($PHASE-fasen for pakke $PAKKE_NAME)
+- $STATUS_FILE (kontekst + konvergens-counter — hvis den findes)
 
 RUNDE-NUMMER: $ROUND_N
 FASE: $PHASE
 $FORMAAL_LINE
 
-Følg niveau 1-prefixens scope-krav + marker-protokol + dialog-regler.
+Review-fokus (§9.3): patch-først (§3.1) · end-to-end-spor (§3.3) ·
+state-dump matcher faktisk state (§3.2) · krav-dok-konsistens uden
+scope-creep · vision/forretningsforstaaelse-modsigelse ·
+MANGLENDE-EKSISTERENDE-BEVARELSE.
 
-Max $MAX_WORDS ord output. Brug marker-format fra niveau 1-prefix (KRITISK/MELLEM/LAV/HUL/OPTIMERING-FORSLAG/G-NUMMER-KANDIDAT etc.). Hvis du ikke har fund: skriv "APPROVAL — Runde $ROUND_N".
+Format pr. fund:
+[SEVERITY] Kort beskrivelse
+Konkret afvigelse: ...
+Anbefalet handling: [V<n+1>-rettelse / G-nummer / kosmetisk note]
+
+Berører ændringen en governance-doc: afslut med
+"§8.1-SVAR: INGEN-MODSIGELSE" eller "§8.1-SVAR: MODSIGELSE — <hvad>".
+
+Max $MAX_WORDS ord. Hvis ingen fund: skriv "APPROVAL — Runde $ROUND_N".
 EOF
 )
 
 # ============================================================
 # Eksekvér med hard timeout + non-json (live tail-friendly)
+# stdin lukkes — codex exec uden TTY hænger ellers på
+# "Reading additional input from stdin..." (gov-docs-renhed fund 6)
 # ============================================================
 
 RAW_OUTPUT="$(mktemp -t codex-review-raw.XXXXXX)"
@@ -146,7 +295,7 @@ set +e
 timeout --signal=KILL "$TIMEOUT_SEC" codex exec --skip-git-repo-check \
   -c "model_reasoning_effort=\"$REASONING\"" \
   --enable fast_mode \
-  "$PROMPT" > "$RAW_OUTPUT" 2>&1
+  "$PROMPT" > "$RAW_OUTPUT" 2>&1 < /dev/null
 CODEX_EXIT=$?
 set -e
 
@@ -193,94 +342,19 @@ EOF
 cat "$RAW_OUTPUT" >> "$OUTPUT_FILE"
 
 # ============================================================
-# Marker-parsing (V5.3 marker-protokol)
+# Marker-parsing + echo output + exit per routing
 # ============================================================
 
 echo "" >&2
 echo "▶ Marker-parsing:" >&2
 
-HALT_HIT=0
-SEVERITY_HIT=0
-WORKAROUND_HIT=0
-CLARIFICATION_HIT=0
-ESCALATE_HIT=0
-NEEDS_MATHIAS_HIT=0
-
-if grep -qE '^(STOP-FOR-CLARIFICATION):' "$RAW_OUTPUT"; then
-  CLARIFICATION_HIT=1
-  echo "  ⏸  STOP-FOR-CLARIFICATION rejst — info-mangel" >&2
-fi
-
-if grep -qE '^(BRUD-PAA-KRAV|TEKNISK-BLOKERING|PLAN-AFVIGELSE|KRITISK-SIKKERHEDSHUL):' "$RAW_OUTPUT"; then
-  HALT_HIT=1
-  echo "  🛑 Halt-marker rejst — kræver LØS-dialog eller eskalation" >&2
-fi
-
-# Severity-prefix detection (NY 2026-05-20 — G055-fix)
-# KRITISK uden halt-marker er stadig blocker per overvaagning-disciplin
-# ("KRITISK — STOPPER plan i alle runder"). Halt-markeren kan være
-# eksplicit ("KRITISK — PLAN-AFVIGELSE:") eller alene ("KRITISK: <fund>").
-# Matcher ord-grænse efter KRITISK så "KRITISKE" ikke triggers false positive.
-if grep -qE '^KRITISK\b' "$RAW_OUTPUT"; then
-  SEVERITY_HIT=1
-  echo "  🛑 KRITISK-severity rejst — stopper plan i alle runder" >&2
-fi
-
-# NEEDS-MATHIAS — stopper plan og kræver Mathias-afgørelse før V<n+1>
-if grep -qE '^(\[NEEDS-MATHIAS\]|NEEDS-MATHIAS)\b' "$RAW_OUTPUT"; then
-  NEEDS_MATHIAS_HIT=1
-  echo "  🚦 NEEDS-MATHIAS rejst — Code må ikke lave V<n+1> før Mathias har afgjort" >&2
-fi
-
-if grep -qE '^(WORKAROUND-INTRODUCERET):' "$RAW_OUTPUT"; then
-  WORKAROUND_HIT=1
-  echo "  ⚠️  WORKAROUND-INTRODUCERET — Mathias-gate kræves" >&2
-fi
-
-if grep -qE '^(ESCALATE|AUTO-ESKALATION):' "$RAW_OUTPUT"; then
-  ESCALATE_HIT=1
-  echo "  🚨 ESCALATE/AUTO-ESKALATION — Mathias-judgment via gate-fil" >&2
-fi
-
-if grep -qE '^(OPTIMERING-FORSLAG):' "$RAW_OUTPUT"; then
-  echo "  💡 OPTIMERING-FORSLAG fundet — Code's valg (ADOPT/DEFER/DISMISS)" >&2
-fi
-
-if grep -qE '^(SPARRING-OENSKE):' "$RAW_OUTPUT"; then
-  echo "  💬 SPARRING-OENSKE fundet" >&2
-fi
-
-if grep -qE '^(G-NUMMER-KANDIDAT):' "$RAW_OUTPUT"; then
-  echo "  📝 G-NUMMER-KANDIDAT(er) — log til teknisk-gaeld.md (fortsæt)" >&2
-fi
-
-if grep -qE '^APPROVAL\b' "$RAW_OUTPUT"; then
-  echo "  ✅ APPROVAL" >&2
-fi
-
-# ============================================================
-# Echo output + exit per marker-priority
-# ============================================================
+set +e
+parse_markers "$RAW_OUTPUT"
+ROUTING_EXIT=$?
+set -e
 
 echo "" >&2
 echo "▶ Output:" >&2
 cat "$RAW_OUTPUT"
 
-# Exit-koder per V5.3 routing-tabel:
-if [ "$CLARIFICATION_HIT" -eq 1 ]; then
-  exit 1
-fi
-if [ "$WORKAROUND_HIT" -eq 1 ]; then
-  exit 3
-fi
-if [ "$ESCALATE_HIT" -eq 1 ]; then
-  exit 4
-fi
-if [ "$NEEDS_MATHIAS_HIT" -eq 1 ]; then
-  exit 4
-fi
-if [ "$HALT_HIT" -eq 1 ] || [ "$SEVERITY_HIT" -eq 1 ]; then
-  exit 2
-fi
-
-exit 0
+exit $ROUTING_EXIT
diff --git a/scripts/governance-check.mjs b/scripts/governance-check.mjs
index ca9d634..d10c2ae 100644
--- a/scripts/governance-check.mjs
+++ b/scripts/governance-check.mjs
@@ -5,7 +5,12 @@
 // ikke mention-hjem. Semantisk/prosa-modsigelse er Codex-mandatets bord (ikke her).
 //
 // Checks: dead-doc-paths · junk-files · laesefoelge-targets · pointer-validity ·
-//         owns-uniqueness · number-home-uniqueness · H-ref-integrity
+//         owns-uniqueness · number-home-uniqueness · H-ref-integrity ·
+//         structural-chain (gov-docs-renhed)
+//
+// Allowlist-split (gov-docs-renhed pkt 9): prosa-docs MÅ referere slettede
+// stier (historisk-provenance); aktive scripts MÅ IKKE — medmindre scriptet
+// bærer standalone-linjen "# governance: deprecated".
 //
 // Build-krav (Codex): fenced code blocks strippes FØR alle heading/ref-checks,
 // så skabelon-eksempler (fx ### [Hxxx] i ```-blok) ikke tæller som kanoniske.
@@ -23,6 +28,9 @@ const DOC_EXCLUDE = [
   "docs/coordination/arkiv",
   "docs/coordination/v4-slettede-docs",
   "docs/coordination/rapport-historik",
+  // Rå reviewer-output (ephemeral, slettes ved pakke-luk per §4) — citerer
+  // bevidst døde/historiske stier og skal ikke holdes path-rene.
+  "docs/coordination/codex-reviews",
 ];
 function walk(dir, acc = []) {
   for (const e of readdirSync(dir, { withFileTypes: true })) {
@@ -46,11 +54,6 @@ const MISSING_PATH_ALLOWLIST = [
     klasse: "historisk-provenance",
     grund: "V4-slettet doc, refereret som provenance",
   },
-  {
-    path: "docs/coordination/overvaagning/claude-ai-overvaagning.md",
-    klasse: "historisk-provenance",
-    grund: "V4-slettet doc, refereret som provenance",
-  },
   {
     path: "docs/strategi/arbejds-disciplin.md",
     klasse: "historisk-provenance",
@@ -66,20 +69,15 @@ const MISSING_PATH_ALLOWLIST = [
     klasse: "historisk-provenance",
     grund: "V4-slettet (inline i disciplin §10.2)",
   },
-  {
-    path: "docs/skabeloner/codex-review-prompt.md",
-    klasse: "historisk-provenance",
-    grund: "V4-slettet (inline i disciplin §10.4)",
-  },
   {
     path: "docs/skabeloner/rapport-skabelon.md",
     klasse: "historisk-provenance",
-    grund: "V4-slettet (inline i disciplin §10.3)",
+    grund: "V4-slettet (inline i disciplin §10.3); refereres som provenance i gov-docs-renhed-plan A.12 — prune ved pakke-luk (gov-6)",
   },
   {
-    path: "docs/coordination/mathias-afgoerelser.md",
+    path: "docs/skabeloner/codex-review-prompt.md",
     klasse: "historisk-provenance",
-    grund: "V4-slettet (arkiv/mathias-afgoerelser-historik.md)",
+    grund: "V4-slettet (inline i disciplin §10.4)",
   },
   {
     path: "docs/coordination/plan-feedback",
@@ -108,9 +106,11 @@ function stripFenced(text) {
   return text.replace(/```[\s\S]*?```/g, "").replace(/~~~[\s\S]*?~~~/g, "");
 }
 // doc-path-refs i en tekst (efter fenced-strip). Skip templates (< >).
+// Charclass inkluderer danske bogstaver (gov-docs-renhed: docs/LÆSEFØLGE.md
+// ville ellers matche afskåret og give falsk violation).
 function docRefs(text) {
   const out = new Set();
-  const re = /docs\/[A-Za-z0-9_./<>-]+/g;
+  const re = /docs\/[A-Za-z0-9_./<>ÆØÅæøå-]+/g;
   let m;
   while ((m = re.exec(text))) {
     let p = m[0].replace(/[.)\]:,/]+$/, ""); // strip trailing punktuation + slash
@@ -125,14 +125,31 @@ function pathExists(p) {
   return existsSync(clean);
 }
 
-// ---------- check: dead-doc-paths (docs + scripts) ----------
+// ---------- check: dead-doc-paths (docs + scripts, klasse-split) ----------
+const ALLOW_BY_PATH = new Map(MISSING_PATH_ALLOWLIST.map((a) => [a.path, a]));
+const SCRIPT_SET = new Set(SCRIPT_FILES);
+function isDeprecated(file) {
+  return read(file)
+    .split("\n")
+    .some((l) => l.trim().startsWith("# governance: deprecated"));
+}
 function deadDocPaths() {
   const scan = [...DOC_FILES, ...SCRIPT_FILES];
   for (const f of scan) {
     const refs = docRefs(stripFenced(read(f)));
     for (const r of refs) {
       if (pathExists(r)) continue;
-      if (ALLOWED.has(r)) {
+      const entry = ALLOW_BY_PATH.get(r);
+      if (entry) {
+        // Split (gov-docs-renhed): prosa må bære historisk-provenance;
+        // aktive scripts må ikke — medmindre scriptet selv er deprecated.
+        if (SCRIPT_SET.has(f) && entry.klasse === "historisk-provenance" && !isDeprecated(f)) {
+          v(
+            "dead-doc-paths",
+            `${f}: aktivt script peger på slettet ${r} (historisk-provenance er kun for prosa — markér scriptet '# governance: deprecated' eller fjern referencen)`,
+          );
+          continue;
+        }
         notes.push(`dead-doc-paths: tilladt manglende ${r} (${f})`);
         continue;
       }
@@ -252,6 +269,60 @@ function hRefIntegrity() {
   }
 }
 
+// ---------- check: structural-chain (gov-docs-renhed pkt 10) ----------
+// Strukturelt + string-match — ingen semantik. Formåls-immutabilitet (§3.0) mekanisk.
+function normFormaal(text) {
+  const lines = text.split("\n");
+  const i = lines.findIndex((l) => l.trim().startsWith("> Denne pakke leverer:"));
+  if (i === -1) return null;
+  const out = [];
+  for (let j = i; j < lines.length && lines[j].trim().startsWith(">"); j++) {
+    out.push(lines[j].replace(/^\s*>\s?/, ""));
+  }
+  return out.join(" ").replace(/\s+/g, " ").trim();
+}
+function structuralChain() {
+  const ap = read("docs/coordination/aktiv-plan.md");
+  let marker = null;
+  for (const line of ap.split("\n")) {
+    const m = line.trim().match(/^<!--\s*aktiv-pakke:\s*(\S+)(?:\s+fase:\s*(plan|build|rapport))?\s*-->$/);
+    if (m) marker = { pakke: m[1], fase: m[2] ?? "plan" };
+  }
+  if (!marker)
+    return v(
+      "structural-chain",
+      "aktiv-plan.md mangler standalone-markør <!-- aktiv-pakke: <navn|ingen> [fase: plan|build|rapport] -->",
+    );
+  if (marker.pakke === "ingen") return;
+  const base = "docs/coordination";
+  const krav = `${base}/${marker.pakke}-krav-og-data.md`;
+  const plan = `${base}/${marker.pakke}-plan.md`;
+  const status = `${base}/${marker.pakke}-status.md`;
+  for (const f of [krav, plan, status]) {
+    if (!existsSync(f)) v("structural-chain", `aktiv pakke '${marker.pakke}': mangler ${f}`);
+  }
+  if (!existsSync(krav) || !existsSync(plan)) return;
+  if (!read(plan).includes(krav)) v("structural-chain", `${plan}: krydspeger ikke ${krav}`);
+  if (!read(plan).includes(status)) v("structural-chain", `${plan}: krydspeger ikke ${status}`);
+  if (existsSync(status) && !read(status).includes(marker.pakke))
+    v("structural-chain", `${status}: nævner ikke pakken '${marker.pakke}'`);
+  const fk = normFormaal(read(krav));
+  const fp = normFormaal(stripFenced(read(plan)));
+  if (!fk) v("structural-chain", `${krav}: ingen "> Denne pakke leverer:"-blok`);
+  if (!fp) v("structural-chain", `${plan}: ingen "> Denne pakke leverer:"-blok`);
+  if (fk && fp && fk !== fp) v("structural-chain", `Formål-streng afviger mellem ${krav} og ${plan} (§3.0)`);
+  if (marker.fase === "rapport") {
+    const dir = "docs/coordination/rapport-historik";
+    const rapporter = existsSync(dir) ? readdirSync(dir).filter((x) => x.endsWith(`-${marker.pakke}.md`)) : [];
+    if (!rapporter.length)
+      return v("structural-chain", `fase: rapport men ingen rapport-historik/*-${marker.pakke}.md`);
+    const nyeste = rapporter.sort().at(-1);
+    const fr = normFormaal(read(join(dir, nyeste)));
+    if (!fr) v("structural-chain", `${dir}/${nyeste}: ingen "> Denne pakke leverer:"-blok`);
+    else if (fk && fk !== fr) v("structural-chain", `Formål-streng afviger mellem ${krav} og ${dir}/${nyeste} (§3.0)`);
+  }
+}
+
 // ---------- run ----------
 const CHECKS = [
   ["dead-doc-paths", deadDocPaths],
@@ -261,6 +332,7 @@ const CHECKS = [
   ["owns-uniqueness", ownsUniqueness],
   ["number-home-uniqueness", numberHomeUniqueness],
   ["H-ref-integrity", hRefIntegrity],
+  ["structural-chain", structuralChain],
 ];
 for (const [name, fn] of CHECKS) {
   const before = violations.length;
diff --git a/scripts/governance-check.selftest.mjs b/scripts/governance-check.selftest.mjs
index 4c421e7..0a0989d 100644
--- a/scripts/governance-check.selftest.mjs
+++ b/scripts/governance-check.selftest.mjs
@@ -53,6 +53,73 @@ const cases = [
   ],
   ["H-ref-integrity", (d) => appendFileSync(join(d, "docs/strategi/disciplin.md"), "\nSe H999 et sted.\n")],
 ];
+
+// gov-docs-renhed: allowlist-split + structural-chain cases.
+// chainFiles producerer en FULDT konsistent kæde — hver case planter ÉN defekt.
+const FORMAAL = "> Denne pakke leverer: testleverance.\n";
+const PLAN_OK = `# t\n\ndocs/coordination/testpakke-krav-og-data.md\ndocs/coordination/testpakke-status.md\n\n## Formål\n\n${FORMAAL}`;
+const chainFiles = (d, { plan = PLAN_OK, kravFormaal = FORMAAL } = {}) => {
+  writeFileSync(join(d, "docs/coordination/testpakke-krav-og-data.md"), `# t\n\n## Formål\n\n${kravFormaal}`);
+  writeFileSync(join(d, "docs/coordination/testpakke-plan.md"), plan);
+  writeFileSync(join(d, "docs/coordination/testpakke-status.md"), "# testpakke status\n");
+};
+const setMarker = (d, fase) =>
+  appendFileSync(join(d, "docs/coordination/aktiv-plan.md"), `\n<!-- aktiv-pakke: testpakke fase: ${fase} -->\n`);
+cases.push(
+  [
+    "script-dead-path",
+    (d) => appendFileSync(join(d, "scripts/types-gen.sh"), "\ncat docs/skabeloner/plan-skabelon.md\n"),
+  ],
+  ["chain-missing-files", (d) => setMarker(d, "plan")],
+  [
+    "chain-formaal-mismatch",
+    (d) => {
+      chainFiles(d, { kravFormaal: "> Denne pakke leverer: noget ANDET.\n" });
+      setMarker(d, "plan");
+    },
+  ],
+  [
+    "chain-missing-krydspeg",
+    (d) => {
+      chainFiles(d, { plan: `# t\n\ndocs/coordination/testpakke-status.md\n\n## Formål\n\n${FORMAAL}` });
+      setMarker(d, "plan");
+    },
+  ],
+  [
+    "chain-missing-status-krydspeg",
+    (d) => {
+      chainFiles(d, { plan: `# t\n\ndocs/coordination/testpakke-krav-og-data.md\n\n## Formål\n\n${FORMAAL}` });
+      setMarker(d, "plan");
+    },
+  ],
+  [
+    "chain-rapport-missing",
+    (d) => {
+      chainFiles(d);
+      setMarker(d, "rapport");
+    },
+  ],
+  [
+    "chain-rapport-formaal-mismatch",
+    (d) => {
+      chainFiles(d);
+      writeFileSync(
+        join(d, "docs/coordination/rapport-historik/2099-01-01-testpakke.md"),
+        "# t\n\n## Formål\n\n> Denne pakke leverer: noget TREDJE.\n",
+      );
+      setMarker(d, "rapport");
+    },
+  ],
+  [
+    "chain-rapport-no-formaal",
+    (d) => {
+      chainFiles(d);
+      writeFileSync(join(d, "docs/coordination/rapport-historik/2099-01-01-testpakke.md"), "# t\n\nIngen blok.\n");
+      setMarker(d, "rapport");
+    },
+  ],
+);
+
 for (const [name, plant] of cases) {
   const d = fixture();
   plant(d);
@@ -60,6 +127,14 @@ for (const [name, plant] of cases) {
   rmSync(d, { recursive: true, force: true });
 }
 
+// positiv-case: deprecated script får lov at bære historisk-provenance-ref
+{
+  const d = fixture();
+  appendFileSync(join(d, "scripts/types-gen.sh"), "\n# governance: deprecated\ncat docs/skabeloner/plan-skabelon.md\n");
+  run(d) === 0 ? ok("script-dead-path-deprecated -> exit 0") : bad("script-dead-path-deprecated", "deprecated script burde gå grøn");
+  rmSync(d, { recursive: true, force: true });
+}
+
 if (failed) {
   console.error(`\nSelftest FEJLEDE (${failed})`);
   process.exit(1);

exec
/bin/bash -lc 'git diff origin/main...HEAD -- docs/strategi/disciplin.md docs/strategi/vision-og-principper.md docs/strategi/forretningsforstaaelse.md docs/strategi/stork-2-0-master-plan.md docs/coordination/aktiv-plan.md docs/coordination/gov-docs-renhed-status.md docs/coordination/rapport-historik/README.md docs/coordination/seneste-rapport.md docs/LÆSEFØLGE.md CLAUDE.md docs/claude-ai/SKILL.md scripts/README.md docs/teknisk/teknisk-gaeld.md' in /home/mathias/stork-2.0
 succeeded in 0ms:
diff --git a/CLAUDE.md b/CLAUDE.md
index 1d40383..70c7e6d 100644
--- a/CLAUDE.md
+++ b/CLAUDE.md
@@ -1,7 +1,7 @@
 # Stork 2.0
 
 Læs `docs/LÆSEFØLGE.md` ved hver af de fem triggere defineret deri.
-Git pull før hver trigger.
+Branch-bevidst git-sync før hver trigger (disciplin §13).
 
 ## Kig ikke i (medmindre eksplicit autoriseret af Mathias)
 
diff --git "a/docs/L\303\206SEF\303\230LGE.md" "b/docs/L\303\206SEF\303\230LGE.md"
index 840fd9a..b870975 100644
--- "a/docs/L\303\206SEF\303\230LGE.md"
+++ "b/docs/L\303\206SEF\303\230LGE.md"
@@ -15,18 +15,18 @@ Stale repo-state = fabrikation af kontekst.
 
 Procedure:
 
-0. `git pull origin main`
-   Verificér at lokal arbejds-kopi matcher repo HEAD. Stop hvis
-   `git status` viser uventede uncommitted changes. Stop hvis pull
-   viser commits der ikke var forventede — rapportér til Mathias.
+0. Branch-bevidst git-sync (disciplin §13): `git fetch` + verificér
+   branch/base/remote + pull den branch arbejdet sker på.
+   Stop hvis `git status` viser uventede uncommitted changes. Stop hvis
+   sync viser commits der ikke var forventede — rapportér til Mathias.
 
 1. `docs/strategi/vision-og-principper.md`
    Vision og 9 principper. **LÅST-AUTORITATIV** — vinder over alt andet ved konflikt.
 
 2. `docs/strategi/forretningsforstaaelse.md`
    Mathias' tanker om hvad systemet skal kunne på forretnings-niveau.
-   **TANKE-DATA** — kontekst-grundlag for krav-dok, ikke kontrakt.
-   Kan opdateres når Mathias' tanker udvikler sig.
+   **LÅST-AUTORITATIV** — stamme-doc med vision (D4). Opdateres når
+   Mathias' tanker udvikler sig, via PR + CODEOWNERS.
 
 3. `docs/strategi/disciplin.md`
    Hvordan vi arbejder sammen (V5): aktører + roller + workflow + gates +
@@ -43,4 +43,6 @@ Procedure:
    Sidste leverance-state.
 
 Stop ved tvivl. Spørg Mathias hvis 1-6 modsiger hinanden.
-Ved konflikt mellem dokumenter: vision (1) vinder over alle andre.
+Ved konflikt mellem dokumenter: vision (1) vinder over alle andre — undtagen
+forretningsforstaaelse (2): modsigelse mellem de to stamme-docs er et hul →
+STOP → Mathias lukker (D4).
diff --git a/docs/claude-ai/SKILL.md b/docs/claude-ai/SKILL.md
index 57598e5..06d4ba4 100644
--- a/docs/claude-ai/SKILL.md
+++ b/docs/claude-ai/SKILL.md
@@ -37,3 +37,10 @@ Hele rolle-definitionen lever i `docs/strategi/disciplin.md` §9.1 (versioneret
 - Ændringer til rolle/cadence/protokol skal kun laves ét sted (filen)
 - Skill'en arver automatisk forbedringer fra fremtidige pakker
 - Du behøver ikke re-opdatere skill'en når workflow-spec udvikler sig
+
+## Kanonisk kilde
+
+Denne fil er DEN kanoniske skill. Platform-skill'en i claude.ai er en kopi
+af denne fil — ved drift vinder repo-versionen. Sync: Mathias kopierer
+fil-indholdet til platform-skill'en når denne fil ændres (flagges i
+slut-rapport som Mathias-handling).
diff --git a/docs/coordination/aktiv-plan.md b/docs/coordination/aktiv-plan.md
index a18a1c0..5743170 100644
--- a/docs/coordination/aktiv-plan.md
+++ b/docs/coordination/aktiv-plan.md
@@ -2,7 +2,9 @@
 
 Peger på den plan-fil der aktuelt er under arbejde (skrives → reviewes → bygges).
 
-**Aktuel:** ingen pakke under arbejde — næste i rest-sekvens: gov-4-branch-protection (gov-3 CI-blockers fuldt færdig). **Merged:** gov-1 (paritet, 2026-06-04) · gov-2 (vagt, PR #93) · gov-docs-housekeeping (krav-dok-familie, PR #94) · **gov-3a** (4 §3-checks #4/#7/#16/#17 + zone-§3-fjernelse, PR #95, main @ c32097c; ikke-required indtil gov-4) · **gov-3b-1** (#19 FK-dækning + #6 indeks-pr-policy, PR #96, main @ a88d217; 23→25 fitness-checks; 0 SQL-/indeks-migrations; 3 sale-FK'er `FK_PENDING` → Trin 14 [H025]) · **gov-3b-2** (#10 SECDEF-markør-disciplin, PR #101, main @ `165833c`; 25→26 fitness-checks; 0 migrations; #18 udskilt → gov-3b-3 + [G065]) · **gov-3b-3a** (#18 del 1: §1.1:160-reconcile + 9 `permission_*` INVOKER→SECDEF, PR #103, main @ `c846105`; 4 migrations live-applikeret; G065 stadig åben → 3b) · **gov-3b-3b** (#18 del 2: sidste 5 INVOKER→SECDEF + REVOKE authenticated-write + #18-check, PR #105, main @ `7be6511`; 4 migrations live; **[G065] LØST**; gov-3 CI-blockers fuldt færdig). Rest-sekvens: gov-4-branch-protection → gov-5-automation → gov-6-arkiv-fold. Åbne G-numre: G061 (comment-parity, før gov-4), G062 (recurring types-drift), G063 (v4-slettede-docs-allowlist → gov-6). (G065 LØST i gov-3b-3b.) Åbne H: [H025] (Trin 14: sale-FK'er + orphan-cleanup). Krav-dok (ét dok over de 6): `docs/coordination/governance-vagt-krav-og-data.md` ✓.
+<!-- aktiv-pakke: gov-docs-renhed fase: build -->
+
+**Aktuel:** **gov-docs-renhed** under build — plan: `docs/coordination/gov-docs-renhed-plan.md` (V4, Codex-approved runde 4 m. §8.1-SVAR: INGEN-MODSIGELSE; qwerg 2026-06-10). Derefter i rest-sekvens: gov-4-branch-protection (gov-3 CI-blockers fuldt færdig). **Merged:** gov-1 (paritet, 2026-06-04) · gov-2 (vagt, PR #93) · gov-docs-housekeeping (krav-dok-familie, PR #94) · **gov-3a** (4 §3-checks #4/#7/#16/#17 + zone-§3-fjernelse, PR #95, main @ c32097c; ikke-required indtil gov-4) · **gov-3b-1** (#19 FK-dækning + #6 indeks-pr-policy, PR #96, main @ a88d217; 23→25 fitness-checks; 0 SQL-/indeks-migrations; 3 sale-FK'er `FK_PENDING` → Trin 14 [H025]) · **gov-3b-2** (#10 SECDEF-markør-disciplin, PR #101, main @ `165833c`; 25→26 fitness-checks; 0 migrations; #18 udskilt → gov-3b-3 + [G065]) · **gov-3b-3a** (#18 del 1: §1.1:160-reconcile + 9 `permission_*` INVOKER→SECDEF, PR #103, main @ `c846105`; 4 migrations live-applikeret; G065 stadig åben → 3b) · **gov-3b-3b** (#18 del 2: sidste 5 INVOKER→SECDEF + REVOKE authenticated-write + #18-check, PR #105, main @ `7be6511`; 4 migrations live; **[G065] LØST**; gov-3 CI-blockers fuldt færdig). Rest-sekvens: gov-4-branch-protection → gov-5-automation → gov-6-arkiv-fold. Åbne G-numre: G061 (comment-parity, før gov-4), G062 (recurring types-drift), G063 (v4-slettede-docs-allowlist → gov-6). (G065 LØST i gov-3b-3b.) Åbne H: [H025] (Trin 14: sale-FK'er + orphan-cleanup). Krav-dok (ét dok over de 6): `docs/coordination/governance-vagt-krav-og-data.md` ✓.
 
 Når ny pakke startes følges V5-flowet i `docs/strategi/disciplin.md` §2:
 
diff --git a/docs/coordination/gov-docs-renhed-status.md b/docs/coordination/gov-docs-renhed-status.md
new file mode 100644
index 0000000..125a1ad
--- /dev/null
+++ b/docs/coordination/gov-docs-renhed-status.md
@@ -0,0 +1,38 @@
+# gov-docs-renhed — Pakke-status
+
+**Sidste handling:** Build batch 4 (fix-batch): Codex build-review runde 5 gav 3 KRITISK — alle rettet (v4-slettede-docs untracked igen + .gitignore-værn; denne status-fil synkroniseret; MANGLENDE-EKSISTERENDE-BEVARELSE routet til exit 2 + fixture). 2026-06-10.
+**Næste forventet:** Codex verifikations-review (runde 6) af batch 4 → grøn → Code skriver slut-rapport → Claude.ai-review FØR merge (Step 5) → Mathias "slut OK" + merge.
+**Konvergens-counter:** 4 (plan-fase, afsluttet ved runde 4-APPROVAL). Build-reviews: runde 5 (3 KRITISK → batch 4), runde 6 afventes.
+**Aktuel blocker:** ingen.
+
+Build-state (qwerg 2026-06-10):
+
+- Batch 1 ✓ (`ddc72db`): 3 V5.3-scripts slettet, codex-review.sh repareret.
+  Evidens: --parse-test grøn, governance:check grøn.
+- Batch 2 ✓ (`42bfb55`): doc-reconcile A.1–A.14. Evidens: governance:check grøn.
+  (Fejl-committede også 17 v4-slettede-docs-filer — fanget af Codex runde 5,
+  rettet i batch 4.)
+- Batch 3 ✓ (`00c1ebd`): allowlist-split + structural-chain + sti-regex-fix +
+  9 selftest-cases + aktiv-pakke-markør. Evidens: selftest fuldt grøn
+  (baseline + 13 plantede + deprecated-positiv), fitness grøn.
+- Batch 4 ✓: runde 5-fund-fixes (denne commit).
+
+Plan-afvigelser (til slut-rapport):
+
+1. rapport-skabelon-allowlist-entry beholdt (plan sagde prune) — planens egen
+   A.12-tekst er levende prosa-referent; prune ved pakke-luk/gov-6.
+2. v4-slettede-docs/ kortvarigt tracked i batch 2 (Code-fejl, `git add -A`) —
+   untracked igen + .gitignore-værn i batch 4. Aldrig på main.
+3. MANGLENDE-EKSISTERENDE-BEVARELSE-routing tilføjet parseren (runde 5-fund) —
+   udvidelse af B.1 inden for §5-semantikken.
+4. codex-reviews/ tilføjet scannerens DOC_EXCLUDE (batch 4b) — review-filer er
+   ephemeral rå-output (§4) der bevidst citerer døde stier; first-time-fund da
+   reviews aldrig før var committet som filer.
+
+Noter:
+
+- Krav OK 2026-06-10 · qwerg 2026-06-10. 0 migrations — ren docs+scripts-pakke.
+- Reviews: codex-reviews/2026-06-10-gov-docs-renhed-runde-{1..4}.md (plan:
+  2K+3M → 1K+3M → 1K+1G → APPROVAL) · runde-5.md (build: 3 KRITISK → batch 4).
+- Driftsnote: `codex exec` uden TTY kræver `< /dev/null` — indbygget i repareret
+  codex-review.sh.
diff --git a/docs/coordination/rapport-historik/README.md b/docs/coordination/rapport-historik/README.md
index bd06c3e..2ba0155 100644
--- a/docs/coordination/rapport-historik/README.md
+++ b/docs/coordination/rapport-historik/README.md
@@ -2,7 +2,7 @@
 
 Alle slut-rapporter fra Code til Mathias. Én fil pr. afsluttet pakke, navngivet `<dato>-<pakke-kode>.md`.
 
-Hver rapport følger `docs/skabeloner/rapport-skabelon.md`.
+Hver rapport følger skabelonen i `docs/strategi/disciplin.md` §10.3.
 
 Den senest leverede rapport peges der på fra `docs/coordination/seneste-rapport.md`. Ændring i `seneste-rapport.md` trigger Codex-notify GitHub Action.
 
diff --git a/docs/strategi/disciplin.md b/docs/strategi/disciplin.md
index 0eea85d..06e62a8 100644
--- a/docs/strategi/disciplin.md
+++ b/docs/strategi/disciplin.md
@@ -43,7 +43,7 @@ Alle pakker kører fuld disciplin. Ingen skala-distinktion.
 
 Tre gates kræver Mathias: `krav OK`, `qwerg`, `slut OK`. Trin 2 og 4 er hvor det meste arbejde sker.
 
-> **Automation-tilstand (Codes kortlægning, juni 2026 — Codes bord):** `codex-notify` poster kun tracker-comment. Der er **ingen Codex-runner og ingen auto-merge-workflow endnu**, og plan-branchen er ikke dækket af triggeren (H020). Indtil det bygges: Mathias merger PR'er, og Codex-review relæes manuelt. Flowet ovenfor er mål-tilstanden — gates der hviler på auto-merge er ikke aktive endnu. Denne fil påstår ikke en automation der ikke kører.
+> **Automation-tilstand (Codes kortlægning, juni 2026 — Codes bord):** `codex-notify` poster kun tracker-comment. Der er **ingen Codex-runner og ingen auto-merge-workflow endnu**, og plan-branchen er ikke dækket af triggeren (bygges i gov-5-automation). Indtil det bygges: Mathias merger PR'er, og Codex-review relæes manuelt. Flowet ovenfor er mål-tilstanden — gates der hviler på auto-merge er ikke aktive endnu. Denne fil påstår ikke en automation der ikke kører.
 
 ### Step 0 — Pakke-åbning
 
@@ -171,7 +171,7 @@ Hver severity bærer funktion — de kollapses ikke. (MANGLENDE-EKSISTERENDE-BEV
 
 ### 6.2 Automation (Codes bord — tilstand: notify-only)
 
-`codex-notify.yml` poster tracker-comments på push til aktiv-plan/seneste-rapport/build-branch og på slut-rapport-PR. **Den kører ikke Codex, og der er ingen auto-merge.** Mål-tilstand (skal bygges, Codes bord): plan-branch-trigger (H020), Codex-runner, auto-merge ved grøn CI + godkendelse. `migrations-deploy.yml` deployer til live + regenererer types ved push til migrations — verificér mod Codes kortlægning før den antages aktiv.
+`codex-notify.yml` poster tracker-comments på push til aktiv-plan/seneste-rapport/build-branch og på slut-rapport-PR. **Den kører ikke Codex, og der er ingen auto-merge.** Mål-tilstand (skal bygges, Codes bord — samlet i gov-5-automation): plan-branch-trigger, Codex-runner, auto-merge ved grøn CI + godkendelse. `migrations-deploy.yml` deployer til live + regenererer types ved push til migrations — verificér mod Codes kortlægning før den antages aktiv.
 
 ### 6.3 Mathias-gate to-fil-flow
 
@@ -181,14 +181,14 @@ For WORKAROUND-INTRODUCERET, STOP-FOR-CLARIFICATION, dobbelt-ESCALATE og iter >
 
 ## §7 Stork-invariant-tjek pr. pakke (verificeres i slut-rapport)
 
-| #   | Invariant                    | Test                                                        |
-| --- | ---------------------------- | ----------------------------------------------------------- |
-| 1   | Vision-overholdelse          | Vision-tjek-sektion (ja/nej + evidens pr. princip)          |
-| 2   | Permission-matrix-konsistens | RPC→tab/page-mapping opdateret + RLS dækker alle write-veje |
-| 3   | Audit-trigger-dækning        | Alle nye tabeller har audit-trigger (fitness)               |
-| 4   | Konfiguration-i-data         | Ingen hardkodede satser/lønarter (lint)                     |
-| 5   | End-to-end-flow virker       | Smoke-test passerer (ikke schema-only)                      |
-| 6   | Anonymisering-bevaring       | UPDATE, ikke DELETE; FK'er intakt                           |
+| #   | Invariant                    | Test                                                                                  |
+| --- | ---------------------------- | ------------------------------------------------------------------------------------- |
+| 1   | Vision-overholdelse          | Vision-tjek-sektion (ja/nej + evidens pr. princip)                                    |
+| 2   | Permission-matrix-konsistens | RPC→tab/page-mapping opdateret + RLS dækker alle write-veje                           |
+| 3   | Audit-trigger-dækning        | Alle nye tabeller har audit-trigger (fitness)                                         |
+| 4   | Konfiguration-i-data         | Ingen hardkodede satser/lønarter (Codex + Claude.ai-tjek — lint bygges i senere spor) |
+| 5   | End-to-end-flow virker       | Smoke-test passerer (ikke schema-only)                                                |
+| 6   | Anonymisering-bevaring       | UPDATE, ikke DELETE; FK'er intakt                                                     |
 
 Tabel med ja/nej + evidens. Manglende eller "nej" uden begrundelse → KRITISK fra Claude.ai-reviewer.
 
@@ -198,11 +198,12 @@ Tabel med ja/nej + evidens. Manglende eller "nej" uden begrundelse → KRITISK f
 
 Hvad en modsigelse udløser afhænger af hvilket dokument den rammer. Det forhindrer at arbejdet stopper på master-plan (som er overblik, ikke kontrakt).
 
-| Dokument                                | Status              | Modsigelse udløser                                                                                                                                           |
-| --------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
-| `vision-og-principper.md`               | **LÅST**            | STOP. KRITISK. Vinder over alt. Dokumentér i blokker-fil, argumentér ikke videre                                                                             |
-| `stork-2-0-master-plan.md` + afgørelser | **RETNINGSGIVENDE** | Rapport til Mathias — IKKE auto-blokering. Han afgør: er rammen forældet (rettes) eller skal pakken justeres? Arbejdet stopper ikke, det venter på afgørelse |
-| krav-dok + plan (efter approval)        | **PAKKE-KONTRAKT**  | STOP. KRITISK indtil Mathias afgør re-godkendelse eller justering                                                                                            |
+| Dokument                                | Status              | Modsigelse udløser                                                                                                                                                                   |
+| --------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
+| `vision-og-principper.md`               | **LÅST**            | STOP. KRITISK. Vinder over alt undtagen forretningsforstaaelse (D4: indbyrdes stamme-doc-modsigelse = hul → STOP → Mathias lukker). Dokumentér i blokker-fil, argumentér ikke videre |
+| `forretningsforstaaelse.md`             | **LÅST**            | STOP. KRITISK. Stamme-doc med vision (D4): modsigelse mellem de to er et hul Mathias lukker — ingen trumf                                                                            |
+| `stork-2-0-master-plan.md` + afgørelser | **RETNINGSGIVENDE** | Rapport til Mathias — IKKE auto-blokering. Han afgør: er rammen forældet (rettes) eller skal pakken justeres? Arbejdet stopper ikke, det venter på afgørelse                         |
+| krav-dok + plan (efter approval)        | **PAKKE-KONTRAKT**  | STOP. KRITISK indtil Mathias afgør re-godkendelse eller justering                                                                                                                    |
 
 Pointe: kun vision og pakke-kontrakten stopper automatisk. Master-plan-modsigelse er en trigger for en afgørelse, ikke en blokering.
 
@@ -214,6 +215,10 @@ Spærhagen der fanger governance-drift, så disciplinen ikke kun hviler på selv
 
 **Codex-mandat (lag 2 — semantisk):** ved enhver ændring til en governance-doc (vision / disciplin / master-plan / forretningsforstaaelse / owns:-register) SKAL Codex eksplicit svare: **"modsiger dette prosa-mæssigt et begreb som en anden doc ejer?"** før merge. Det dækker den klasse scanneren ikke kan.
 
+**Stamme-doc-konsistens (D4):** ændres én af de to stamme-docs (vision / forretningsforstaaelse) SKAL ændringen eksplicit konsistens-tjekkes mod den anden. Modsigelse = hul → STOP → Mathias lukker. Ingen af de to trumfer den anden.
+
+**Fast markør:** Codex' svar gives som linjen `§8.1-SVAR: INGEN-MODSIGELSE` eller `§8.1-SVAR: MODSIGELSE — <begreb> ejes af <doc>` i reviewet, og gentages i slut-rapporten (§10.3) når pakken har berørt governance-docs — så svaret kan tjekkes i PR/rapport, ikke kun huskes i chat.
+
 **Governance-ændringer er review-artefakter:** en ændring til vision/disciplin/master-plan går gennem samme gate som kode — `governance:check` grøn + Codex' prosa-modsigelses-svar. Fraværet af netop dette gav V5's rolle-modsigelse (vision↔disciplin); §8.1 lukker den klasse.
 
 ---
@@ -375,6 +380,8 @@ Eksplicit verdikt pr. række — ingen tom:
 
 [Reference til teknisk-gaeld.md]
 
+## §8.1-svar (hvis governance-docs berørt)
+
 ## Konvergens-historie
 
 | V<n> | Codex-fund | Code-svar | Outcome |
@@ -394,7 +401,7 @@ Du er Codex i Stork 2.0 — uafhængig kode-reviewer.
 Læs FØR review:
 
 - docs/strategi/vision-og-principper.md
-- docs/strategi/forretningsforstaaelse.md (tanke-data, ikke kontrakt)
+- docs/strategi/forretningsforstaaelse.md (LÅST stamme-doc, D4)
 - docs/strategi/disciplin.md §9.3 (din rolle)
 - docs/coordination/<pakke>-krav-og-data.md (pakke-kontrakt)
 - docs/coordination/<pakke>-plan.md (det du reviewer)
@@ -413,6 +420,10 @@ Format pr. fund:
 [SEVERITY] Kort beskrivelse
 Konkret afvigelse: ...
 Anbefalet handling: [V<n+1>-rettelse / G-nummer / kosmetisk note]
+
+Berører ændringen en governance-doc (vision / disciplin / master-plan /
+forretningsforstaaelse / owns-register): afslut med
+`§8.1-SVAR: INGEN-MODSIGELSE` eller `§8.1-SVAR: MODSIGELSE — <hvad>`.
 ```
 
 ### §10.5 Pakke-status-skabelon
@@ -437,7 +448,7 @@ Master-plan-konflikt (men master-plan er overblik — se §8) · vision-modsigel
 
 ## §13 Git-sync-disciplin
 
-`git pull origin main` før enhver session-start/review-runde. Påstande baseret på cached/forældet kopi = fabrikation. Code: pull ved hver trigger. Codex (auto): frisk på commit-trigger. Codex (manuel): pull før review. Claude.ai: kan ikke pulle — beder Mathias om commit-hash/fil-indhold ved tvivl, antager ikke fra hukommelse. Uventede commits ved pull → STOP, rapportér.
+Branch-bevidst sync før enhver session-start/review-runde: `git fetch` + verificér aktuel branch/base/remote + pull den branch arbejdet faktisk sker på (plan/build/main). `git pull origin main` er kun korrekt når arbejdet ER på main. Påstande baseret på cached/forældet kopi = fabrikation. Code: sync ved hver trigger. Codex (auto): frisk på commit-trigger. Codex (manuel): sync før review. Claude.ai: kan ikke pulle — beder Mathias om commit-hash/fil-indhold ved tvivl, antager ikke fra hukommelse. Uventede commits ved sync → STOP, rapportér.
 
 ---
 
@@ -447,9 +458,9 @@ Adoption af denne fil er første skridt, ikke hele V5. Udestår:
 
 - **Docs-oprydning (Claude.ai's bord):** fold arkivet til git-history (gov-6).
 - **Master-plan (Claude.ai's bord):** afklar om Appendix C's rettelses-historik hører i planen eller i historik.
-- **Fundament + spærhager (Codes bord):** resterende CI-blocker (gov-3b-2: #10 SECDEF + #18 app-write) · branch protection (gov-4) · Codex-runner + auto-merge + plan-branch-trigger (gov-5).
+- **Fundament + spærhager (Codes bord):** branch protection (gov-4) · Codex-runner + auto-merge + plan-branch-trigger (gov-5). (gov-3 CI-blockers fuldt færdig — G065 lukket i gov-3b-3b.)
 
-Gjort i V5-adoptionen: disciplin.md = V5 · vision renset for roller · seneste-rapport-pointer rettet · skill flyttet til docs/claude-ai/ (tombstone `git rm`'et) · Appendix A 4-dim markeret superseded · LÆSEFØLGE opdateret · `codex-notify.yml` handoff-refs rettet til §9.1/§9.3. · **gov-1 (repo↔DB-paritet, PR #92 merged)** · **gov-2 (mekanisk spærhage + owns-register + §8.1 Codex-mandat + H-hjem `huskeliste.md`, PR #93 merged)** · **gov-docs-housekeeping (krav-dok-familie, PR #94 merged)** · **gov-3a (4 §3-checks #4/#7/#16/#17 + zone-§3-fjernelse, PR #95 merged)** · **gov-3b-1 (#19 FK-dækning + #6 indeks-pr-policy, PR #96 merged)**.
+Gjort i V5-adoptionen: disciplin.md = V5 · vision renset for roller · seneste-rapport-pointer rettet · skill flyttet til docs/claude-ai/ (tombstone `git rm`'et) · Appendix A 4-dim markeret superseded · LÆSEFØLGE opdateret · `codex-notify.yml` handoff-refs rettet til §9.1/§9.3. · **gov-1 (repo↔DB-paritet, PR #92 merged)** · **gov-2 (mekanisk spærhage + owns-register + §8.1 Codex-mandat + H-hjem `huskeliste.md`, PR #93 merged)** · **gov-docs-housekeeping (krav-dok-familie, PR #94 merged)** · **gov-3a (4 §3-checks #4/#7/#16/#17 + zone-§3-fjernelse, PR #95 merged)** · **gov-3b-1 (#19 FK-dækning + #6 indeks-pr-policy, PR #96 merged)** · **gov-3b-2 (#10 SECDEF-markør-disciplin, PR #101 merged)** · **gov-3b-3a (#18 del 1: 9 INVOKER→SECDEF, PR #103 merged)** · **gov-3b-3b (#18 del 2 + REVOKE + G065 LØST, PR #105 merged)**.
 
 V5 virker kun hvis erstatning faktisk sker — denne fil afløser V4, lægges ikke ved siden af.
 
diff --git a/docs/strategi/forretningsforstaaelse.md b/docs/strategi/forretningsforstaaelse.md
index 9b1c149..75cb42a 100644
--- a/docs/strategi/forretningsforstaaelse.md
+++ b/docs/strategi/forretningsforstaaelse.md
@@ -2,6 +2,8 @@
 
 <!-- governance-owns: forretnings-intention -->
 
+> **LÅST DOKUMENT (stamme-doc med vision-og-principper.md).** Ændringer kræver eksplicit godkendelse fra Mathias via PR; CODEOWNERS håndhæver. Opdateres når Mathias' tanker udvikler sig — men de to stamme-docs må aldrig være indbyrdes uenige: en modsigelse er et hul der STOPPER og lukkes af Mathias (D4). Mekanisk håndhævelse (required code-owner-review) lander i gov-4 — dette er doc-niveau-løftet.
+
 Dette dokument forklarer hvordan Stork-forretningen hænger sammen. Hvert punkt beskriver hvad systemet skal kunne på forretnings-niveau, efterfulgt af en kort opsummering af hvorfor det er sådan.
 
 Dokumentet er målrettet roller der hjælper med plan-arbejde, krav-dok og review. Det erstatter ikke vision-dokumentet, master-planen eller Mathias-afgørelser — det er baggrunden der gør de dokumenter forståelige.
diff --git a/docs/strategi/stork-2-0-master-plan.md b/docs/strategi/stork-2-0-master-plan.md
index 6b5f0b9..e6c9a71 100644
--- a/docs/strategi/stork-2-0-master-plan.md
+++ b/docs/strategi/stork-2-0-master-plan.md
@@ -37,7 +37,7 @@ Vision, tre bærende principper og ni operationelle principper er defineret i `d
 
 ### Strategiske retning-skift
 
-Mathias' tanker pr. pakke lever i `docs/coordination/<pakke>-krav-og-data.md` (pakke-kontrakt). Tanker der ændrer ramme på tværs af pakker går ind i `docs/strategi/forretningsforstaaelse.md` (tanke-data) eller `docs/strategi/vision-og-principper.md` (LÅST evig, ved princip-niveau). Master-planen reflekterer arkitektur-konsekvensen som Appendix C-rettelser. Ved konflikt vinder vision (LÅST) → forretningsforstaaelse + krav-dok → master-plan tilrettes.
+Mathias' tanker pr. pakke lever i `docs/coordination/<pakke>-krav-og-data.md` (pakke-kontrakt). Tanker der ændrer ramme på tværs af pakker går ind i `docs/strategi/forretningsforstaaelse.md` (LÅST stamme-doc) eller `docs/strategi/vision-og-principper.md` (LÅST evig, ved princip-niveau). Master-planen reflekterer arkitektur-konsekvensen som Appendix C-rettelser. Ved konflikt vinder stamme-docs (vision + forretningsforstaaelse — indbyrdes modsigelse mellem de to er et hul → STOP → Mathias lukker, D4) → krav-dok → master-plan tilrettes.
 
 Historiske ramme-niveau-beslutninger fra V3 og tidligere lever i `docs/coordination/arkiv/mathias-afgoerelser-historik.md` som læsbar reference (ikke aktiv kilde).
 
diff --git a/docs/strategi/vision-og-principper.md b/docs/strategi/vision-og-principper.md
index d92b82f..37cf974 100644
--- a/docs/strategi/vision-og-principper.md
+++ b/docs/strategi/vision-og-principper.md
@@ -2,7 +2,7 @@
 
 <!-- governance-owns: vision, principper -->
 
-> **LÅST DOKUMENT.** Dette er grundstenen i Stork 2.0. Ændringer kræver eksplicit godkendelse fra Mathias via PR. CODEOWNERS håndhæver at kun Mathias kan approve ændringer. Dokumentet er autoritativ kilde for vision og principper — ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette.
+> **LÅST DOKUMENT.** Dette er grundstenen i Stork 2.0. Ændringer kræver eksplicit godkendelse fra Mathias via PR. CODEOWNERS håndhæver at kun Mathias kan approve ændringer. Dokumentet er autoritativ kilde for vision og principper — ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette. Undtagelse (D4): `forretningsforstaaelse.md` er med-stamme-doc — en modsigelse mellem de to er et hul der STOPPER arbejdet og lukkes af Mathias, ikke en konflikt dette dokument vinder.
 
 ## Vision
 
diff --git a/scripts/README.md b/scripts/README.md
index 2049129..987ef2b 100644
--- a/scripts/README.md
+++ b/scripts/README.md
@@ -8,7 +8,6 @@ Disciplin-mekanismer der køres lokalt og i CI.
 | `schema-check.sh`    | Drift-detection: remote schema vs `supabase/schema.sql`. Skipper på `-- PLACEHOLDER`-marker.                                                                                                                                         | `pnpm schema:check`                                        |
 | `migration-gate.mjs` | Phase 1: warner på uklassificerede kolonner. Phase 2 (`MIGRATION_GATE_STRICT=true`): blokerer.                                                                                                                                       | `pnpm migration:check`                                     |
 | `fitness.mjs`        | Arkitektoniske invarianter på tværs af repo. Hver check er en function.                                                                                                                                                              | `pnpm fitness`                                             |
-| `krav-afklar.sh`     | Codex-dispatcher med "stil spørgsmål, ingen plan"-mode for krav-afklaring. Output: `<pakke>-krav-afklaring.md`.                                                                                                                      | `scripts/krav-afklar.sh <krav-dok-fil>`                    |
 
 ## Fitness checks
 

exec
/bin/bash -lc "git diff --name-only origin/main...HEAD | rg '"'^(v4-slettede-docs|docs/coordination/codex-reviews|supabase/|packages/types)'"' || true" in /home/mathias/stork-2.0
 succeeded in 0ms:
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-1.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-2.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-3.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-4.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md

codex
Diffen mod `origin/main` er nu afgrænset til gov-docs-renhed. Jeg fokuserer især på de nye mekaniske værn og batch 4-fixene: om review-filer/v4-kopier faktisk er håndteret, om parseren ruter severities korrekt, og om statusdumpet matcher den faktiske branch.
exec
/bin/bash -lc "sed -n '1,240p' scripts/governance-check.selftest.mjs" in /home/mathias/stork-2.0
 succeeded in 0ms:
#!/usr/bin/env node
// Selftest for governance-check.mjs (§3.6 leverings-kriterium).
// Beviser scanneren: (a) går grøn på en gyldig kopi af repoet, (b) fejler korrekt
// på planted overtrædelser pr. check-klasse. Kører scanneren via cwd=temp-fixture.

import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync, appendFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SCANNER = join(process.cwd(), "scripts", "governance-check.mjs");
let failed = 0;
const ok = (n) => console.log(`  ✓ ${n}`);
const bad = (n, d) => {
  console.error(`  ✗ ${n} — ${d}`);
  failed++;
};

function run(root) {
  try {
    execSync(`node ${SCANNER}`, { cwd: root, stdio: "pipe" });
    return 0;
  } catch (e) {
    return e.status ?? 1;
  }
}
function fixture() {
  // git archive HEAD = committed tree (uden untracked strays) — afspejler hvad CI ser,
  // så untracked-fil-falsk-grøn fanges. Working-tree-kopi ville skjule den klasse.
  const d = mkdtempSync(join(tmpdir(), "govtest-"));
  execSync(`git archive HEAD | tar -x -C "${d}"`, { stdio: "pipe" });
  return d;
}

// (a) baseline: ren kopi -> grøn
{
  const d = fixture();
  run(d) === 0 ? ok("baseline ren kopi -> exit 0") : bad("baseline", "forventede exit 0");
  rmSync(d, { recursive: true, force: true });
}

// (b) planted overtrædelser pr. klasse -> exit != 0
const cases = [
  ["dead-doc-paths", (d) => appendFileSync(join(d, "docs/strategi/disciplin.md"), "\nSe docs/findes-ikke-xyz.md\n")],
  ["junk-files", (d) => writeFileSync(join(d, "docs/~$junk.md"), "x")],
  [
    "owns-uniqueness",
    (d) => appendFileSync(join(d, "docs/strategi/vision-og-principper.md"), "\n<!-- governance-owns: kode-gaeld -->\n"),
  ],
  [
    "number-home-uniqueness",
    (d) => appendFileSync(join(d, "docs/strategi/disciplin.md"), "\n### [H001] dublet-entry\n"),
  ],
  ["H-ref-integrity", (d) => appendFileSync(join(d, "docs/strategi/disciplin.md"), "\nSe H999 et sted.\n")],
];

// gov-docs-renhed: allowlist-split + structural-chain cases.
// chainFiles producerer en FULDT konsistent kæde — hver case planter ÉN defekt.
const FORMAAL = "> Denne pakke leverer: testleverance.\n";
const PLAN_OK = `# t\n\ndocs/coordination/testpakke-krav-og-data.md\ndocs/coordination/testpakke-status.md\n\n## Formål\n\n${FORMAAL}`;
const chainFiles = (d, { plan = PLAN_OK, kravFormaal = FORMAAL } = {}) => {
  writeFileSync(join(d, "docs/coordination/testpakke-krav-og-data.md"), `# t\n\n## Formål\n\n${kravFormaal}`);
  writeFileSync(join(d, "docs/coordination/testpakke-plan.md"), plan);
  writeFileSync(join(d, "docs/coordination/testpakke-status.md"), "# testpakke status\n");
};
const setMarker = (d, fase) =>
  appendFileSync(join(d, "docs/coordination/aktiv-plan.md"), `\n<!-- aktiv-pakke: testpakke fase: ${fase} -->\n`);
cases.push(
  [
    "script-dead-path",
    (d) => appendFileSync(join(d, "scripts/types-gen.sh"), "\ncat docs/skabeloner/plan-skabelon.md\n"),
  ],
  ["chain-missing-files", (d) => setMarker(d, "plan")],
  [
    "chain-formaal-mismatch",
    (d) => {
      chainFiles(d, { kravFormaal: "> Denne pakke leverer: noget ANDET.\n" });
      setMarker(d, "plan");
    },
  ],
  [
    "chain-missing-krydspeg",
    (d) => {
      chainFiles(d, { plan: `# t\n\ndocs/coordination/testpakke-status.md\n\n## Formål\n\n${FORMAAL}` });
      setMarker(d, "plan");
    },
  ],
  [
    "chain-missing-status-krydspeg",
    (d) => {
      chainFiles(d, { plan: `# t\n\ndocs/coordination/testpakke-krav-og-data.md\n\n## Formål\n\n${FORMAAL}` });
      setMarker(d, "plan");
    },
  ],
  [
    "chain-rapport-missing",
    (d) => {
      chainFiles(d);
      setMarker(d, "rapport");
    },
  ],
  [
    "chain-rapport-formaal-mismatch",
    (d) => {
      chainFiles(d);
      writeFileSync(
        join(d, "docs/coordination/rapport-historik/2099-01-01-testpakke.md"),
        "# t\n\n## Formål\n\n> Denne pakke leverer: noget TREDJE.\n",
      );
      setMarker(d, "rapport");
    },
  ],
  [
    "chain-rapport-no-formaal",
    (d) => {
      chainFiles(d);
      writeFileSync(join(d, "docs/coordination/rapport-historik/2099-01-01-testpakke.md"), "# t\n\nIngen blok.\n");
      setMarker(d, "rapport");
    },
  ],
);

for (const [name, plant] of cases) {
  const d = fixture();
  plant(d);
  run(d) !== 0 ? ok(`planted ${name} -> exit != 0`) : bad(name, "scanner gik grøn trods overtrædelse");
  rmSync(d, { recursive: true, force: true });
}

// positiv-case: deprecated script får lov at bære historisk-provenance-ref
{
  const d = fixture();
  appendFileSync(join(d, "scripts/types-gen.sh"), "\n# governance: deprecated\ncat docs/skabeloner/plan-skabelon.md\n");
  run(d) === 0 ? ok("script-dead-path-deprecated -> exit 0") : bad("script-dead-path-deprecated", "deprecated script burde gå grøn");
  rmSync(d, { recursive: true, force: true });
}

if (failed) {
  console.error(`\nSelftest FEJLEDE (${failed})`);
  process.exit(1);
}
console.log("\nGovernance selftest: alle cases passed");

exec
/bin/bash -lc "sed -n '1,380p' scripts/governance-check.mjs" in /home/mathias/stork-2.0
 succeeded in 0ms:
#!/usr/bin/env node
// governance-check.mjs — mekanisk lag-1 governance-scanner (gov-2-vagt).
//
// Fanger governance-drift mekanisk. Princip (Codex): owner = DEFINITIONShjem,
// ikke mention-hjem. Semantisk/prosa-modsigelse er Codex-mandatets bord (ikke her).
//
// Checks: dead-doc-paths · junk-files · laesefoelge-targets · pointer-validity ·
//         owns-uniqueness · number-home-uniqueness · H-ref-integrity ·
//         structural-chain (gov-docs-renhed)
//
// Allowlist-split (gov-docs-renhed pkt 9): prosa-docs MÅ referere slettede
// stier (historisk-provenance); aktive scripts MÅ IKKE — medmindre scriptet
// bærer standalone-linjen "# governance: deprecated".
//
// Build-krav (Codex): fenced code blocks strippes FØR alle heading/ref-checks,
// så skabelon-eksempler (fx ### [Hxxx] i ```-blok) ikke tæller som kanoniske.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SELFTEST = process.argv.includes("--selftest");
const violations = [];
const notes = [];
const v = (check, msg) => violations.push(`[${check}] ${msg}`);

// ---------- scope ----------
const DOC_EXCLUDE = [
  "docs/coordination/arkiv",
  "docs/coordination/v4-slettede-docs",
  "docs/coordination/rapport-historik",
  // Rå reviewer-output (ephemeral, slettes ved pakke-luk per §4) — citerer
  // bevidst døde/historiske stier og skal ikke holdes path-rene.
  "docs/coordination/codex-reviews",
];
function walk(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (!DOC_EXCLUDE.some((x) => p === x || p.startsWith(x + "/"))) walk(p, acc);
    } else acc.push(p);
  }
  return acc;
}
const DOC_FILES = walk("docs").filter((f) => f.endsWith(".md"));
const SCRIPT_FILES = readdirSync("scripts")
  .filter((f) => f.endsWith(".sh"))
  .map((f) => join("scripts", f));

// ---------- allowlist for manglende doc-paths {path, klasse, grund} ----------
const MISSING_PATH_ALLOWLIST = [
  { path: "docs/gdpr-compliance.md", klasse: "future-required", grund: "fremtidig leverance, ej bygget endnu" },
  {
    path: "docs/coordination/overvaagning/codex-overvaagning.md",
    klasse: "historisk-provenance",
    grund: "V4-slettet doc, refereret som provenance",
  },
  {
    path: "docs/strategi/arbejds-disciplin.md",
    klasse: "historisk-provenance",
    grund: "V4-slettet (konsolideret til disciplin.md)",
  },
  {
    path: "docs/strategi/bygge-status.md",
    klasse: "historisk-provenance",
    grund: "V4-slettet (foldet til master-plan §4.1)",
  },
  {
    path: "docs/skabeloner/plan-skabelon.md",
    klasse: "historisk-provenance",
    grund: "V4-slettet (inline i disciplin §10.2)",
  },
  {
    path: "docs/skabeloner/rapport-skabelon.md",
    klasse: "historisk-provenance",
    grund: "V4-slettet (inline i disciplin §10.3); refereres som provenance i gov-docs-renhed-plan A.12 — prune ved pakke-luk (gov-6)",
  },
  {
    path: "docs/skabeloner/codex-review-prompt.md",
    klasse: "historisk-provenance",
    grund: "V4-slettet (inline i disciplin §10.4)",
  },
  {
    path: "docs/coordination/plan-feedback",
    klasse: "runtime-ephemeral",
    grund: "mkdir -p ved pakke-kørsel; slettes ved pakke-luk (disciplin §4)",
  },
  {
    path: "docs/coordination/codex-reviews",
    klasse: "runtime-ephemeral",
    grund: "output-dir ved pakke-kørsel; slettes ved pakke-luk (disciplin §4)",
  },
  {
    path: "docs/coordination/v4-slettede-docs",
    klasse: "scope-excluded-local",
    grund: "lokale midlertidige V4-gennemgangs-kopier; aldrig committet; scope-ekskluderet; foldes/fjernes i gov-6",
  },
];
const ALLOWED = new Set(MISSING_PATH_ALLOWLIST.map((a) => a.path));

// ---------- helpers ----------
function read(f) {
  return existsSync(f) ? readFileSync(f, "utf8") : "";
}
// fjern ```...``` fenced blocks (build-krav) + ~~~-varianten
function stripFenced(text) {
  return text.replace(/```[\s\S]*?```/g, "").replace(/~~~[\s\S]*?~~~/g, "");
}
// doc-path-refs i en tekst (efter fenced-strip). Skip templates (< >).
// Charclass inkluderer danske bogstaver (gov-docs-renhed: docs/LÆSEFØLGE.md
// ville ellers matche afskåret og give falsk violation).
function docRefs(text) {
  const out = new Set();
  const re = /docs\/[A-Za-z0-9_./<>ÆØÅæøå-]+/g;
  let m;
  while ((m = re.exec(text))) {
    let p = m[0].replace(/[.)\]:,/]+$/, ""); // strip trailing punktuation + slash
    if (p.includes("<") || p.includes(">")) continue; // template
    out.add(p);
  }
  return [...out];
}
function pathExists(p) {
  // accepterer både fil og mappe; mappe-ref kan ende på /
  const clean = p.replace(/\/$/, "");
  return existsSync(clean);
}

// ---------- check: dead-doc-paths (docs + scripts, klasse-split) ----------
const ALLOW_BY_PATH = new Map(MISSING_PATH_ALLOWLIST.map((a) => [a.path, a]));
const SCRIPT_SET = new Set(SCRIPT_FILES);
function isDeprecated(file) {
  return read(file)
    .split("\n")
    .some((l) => l.trim().startsWith("# governance: deprecated"));
}
function deadDocPaths() {
  const scan = [...DOC_FILES, ...SCRIPT_FILES];
  for (const f of scan) {
    const refs = docRefs(stripFenced(read(f)));
    for (const r of refs) {
      if (pathExists(r)) continue;
      const entry = ALLOW_BY_PATH.get(r);
      if (entry) {
        // Split (gov-docs-renhed): prosa må bære historisk-provenance;
        // aktive scripts må ikke — medmindre scriptet selv er deprecated.
        if (SCRIPT_SET.has(f) && entry.klasse === "historisk-provenance" && !isDeprecated(f)) {
          v(
            "dead-doc-paths",
            `${f}: aktivt script peger på slettet ${r} (historisk-provenance er kun for prosa — markér scriptet '# governance: deprecated' eller fjern referencen)`,
          );
          continue;
        }
        notes.push(`dead-doc-paths: tilladt manglende ${r} (${f})`);
        continue;
      }
      v("dead-doc-paths", `${f}: peger på ikke-eksisterende ${r} (ikke i allowlist)`);
    }
  }
}

// ---------- check: junk-files ----------
function junkFiles() {
  for (const f of DOC_FILES.concat(walk("docs").filter((x) => /(^|\/)~\$|(^|\/)\.~|~\$[^/]*$/.test(x)))) {
    if (/(^|\/)~\$/.test(f) || /\.tmp$/.test(f)) v("junk-files", `junk/lock-fil i docs/: ${f}`);
  }
}

// ---------- check: laesefoelge-targets ----------
function laesefoelgeTargets() {
  const lf = "docs/LÆSEFØLGE.md";
  if (!existsSync(lf)) return v("laesefoelge-targets", "LÆSEFØLGE.md mangler");
  for (const r of docRefs(stripFenced(read(lf)))) {
    if (!pathExists(r) && !ALLOWED.has(r)) v("laesefoelge-targets", `LÆSEFØLGE-mål mangler: ${r}`);
  }
}

// ---------- check: pointer-validity ----------
function pointerValidity() {
  for (const pf of ["docs/coordination/aktiv-plan.md", "docs/coordination/seneste-rapport.md"]) {
    if (!existsSync(pf)) {
      v("pointer-validity", `pointer-fil mangler: ${pf}`);
      continue;
    }
    for (const r of docRefs(stripFenced(read(pf)))) {
      if (!pathExists(r) && !ALLOWED.has(r)) v("pointer-validity", `${pf}: pointer-mål mangler: ${r}`);
    }
  }
}

// ---------- check: owns-uniqueness ----------
// kun standalone-linjer: ^<!-- governance-owns: ... -->$  (robust mod inline-eksempler)
function parseOwns(text) {
  const concepts = [];
  for (const line of text.split("\n")) {
    const m = line.trim().match(/^<!--\s*governance-owns:\s*(.+?)\s*-->$/);
    if (m)
      concepts.push(
        ...m[1]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
  }
  return concepts;
}
function ownsUniqueness() {
  const byConcept = new Map();
  for (const f of DOC_FILES) {
    for (const c of parseOwns(stripFenced(read(f)))) {
      if (!byConcept.has(c)) byConcept.set(c, []);
      byConcept.get(c).push(f);
    }
  }
  for (const [c, files] of byConcept) {
    if (files.length > 1) v("owns-uniqueness", `begreb "${c}" ejet af ${files.length} docs: ${files.join(", ")}`);
  }
}

// ---------- check: number-home-uniqueness (kun ### [Xxxx]-entries) ----------
function numberHomeUniqueness() {
  const byNum = new Map();
  for (const f of DOC_FILES) {
    const text = stripFenced(read(f));
    const re = /^###\s*\[([GH]\d{3})\]/gm;
    let m;
    while ((m = re.exec(text))) {
      if (!byNum.has(m[1])) byNum.set(m[1], new Set());
      byNum.get(m[1]).add(f);
    }
  }
  for (const [num, files] of byNum) {
    if (files.size > 1)
      v("number-home-uniqueness", `${num} har kanonisk entry i ${files.size} docs: ${[...files].join(", ")}`);
  }
}

// ---------- check: H-ref-integrity ----------
function hRefIntegrity() {
  const husk = "docs/teknisk/huskeliste.md";
  const text = stripFenced(read(husk));
  const open = new Set();
  let m;
  const reOpen = /^###\s*\[(H\d{3})\]/gm;
  while ((m = reOpen.exec(text))) open.add(m[1]);
  // historisk-marker (standalone-linje, source of truth)
  const hist = new Set();
  for (const line of text.split("\n")) {
    const hm = line.trim().match(/^<!--\s*gov-historical-codes:\s*(.+?)\s*-->$/);
    if (hm)
      hm[1]
        .split(",")
        .map((s) => s.trim())
        .forEach((c) => /^H\d{3}$/.test(c) && hist.add(c));
  }
  const known = new Set([...open, ...hist]);
  if (known.size === 0) v("H-ref-integrity", "ingen H-entries/historiske koder fundet i huskeliste.md");
  // scan alle docs + scripts for H-refs (efter fenced-strip), suffix -> parent
  for (const f of [...DOC_FILES, ...SCRIPT_FILES]) {
    const t = stripFenced(read(f));
    const re = /\bH(\d{3})\b/g;
    let mm;
    const seen = new Set();
    while ((mm = re.exec(t))) {
      const parent = "H" + mm[1];
      if (known.has(parent) || seen.has(parent)) continue;
      seen.add(parent);
      v("H-ref-integrity", `${f}: H-ref ${parent} har hverken åben entry eller historisk-kode i huskeliste.md`);
    }
  }
}

// ---------- check: structural-chain (gov-docs-renhed pkt 10) ----------
// Strukturelt + string-match — ingen semantik. Formåls-immutabilitet (§3.0) mekanisk.
function normFormaal(text) {
  const lines = text.split("\n");
  const i = lines.findIndex((l) => l.trim().startsWith("> Denne pakke leverer:"));
  if (i === -1) return null;
  const out = [];
  for (let j = i; j < lines.length && lines[j].trim().startsWith(">"); j++) {
    out.push(lines[j].replace(/^\s*>\s?/, ""));
  }
  return out.join(" ").replace(/\s+/g, " ").trim();
}
function structuralChain() {
  const ap = read("docs/coordination/aktiv-plan.md");
  let marker = null;
  for (const line of ap.split("\n")) {
    const m = line.trim().match(/^<!--\s*aktiv-pakke:\s*(\S+)(?:\s+fase:\s*(plan|build|rapport))?\s*-->$/);
    if (m) marker = { pakke: m[1], fase: m[2] ?? "plan" };
  }
  if (!marker)
    return v(
      "structural-chain",
      "aktiv-plan.md mangler standalone-markør <!-- aktiv-pakke: <navn|ingen> [fase: plan|build|rapport] -->",
    );
  if (marker.pakke === "ingen") return;
  const base = "docs/coordination";
  const krav = `${base}/${marker.pakke}-krav-og-data.md`;
  const plan = `${base}/${marker.pakke}-plan.md`;
  const status = `${base}/${marker.pakke}-status.md`;
  for (const f of [krav, plan, status]) {
    if (!existsSync(f)) v("structural-chain", `aktiv pakke '${marker.pakke}': mangler ${f}`);
  }
  if (!existsSync(krav) || !existsSync(plan)) return;
  if (!read(plan).includes(krav)) v("structural-chain", `${plan}: krydspeger ikke ${krav}`);
  if (!read(plan).includes(status)) v("structural-chain", `${plan}: krydspeger ikke ${status}`);
  if (existsSync(status) && !read(status).includes(marker.pakke))
    v("structural-chain", `${status}: nævner ikke pakken '${marker.pakke}'`);
  const fk = normFormaal(read(krav));
  const fp = normFormaal(stripFenced(read(plan)));
  if (!fk) v("structural-chain", `${krav}: ingen "> Denne pakke leverer:"-blok`);
  if (!fp) v("structural-chain", `${plan}: ingen "> Denne pakke leverer:"-blok`);
  if (fk && fp && fk !== fp) v("structural-chain", `Formål-streng afviger mellem ${krav} og ${plan} (§3.0)`);
  if (marker.fase === "rapport") {
    const dir = "docs/coordination/rapport-historik";
    const rapporter = existsSync(dir) ? readdirSync(dir).filter((x) => x.endsWith(`-${marker.pakke}.md`)) : [];
    if (!rapporter.length)
      return v("structural-chain", `fase: rapport men ingen rapport-historik/*-${marker.pakke}.md`);
    const nyeste = rapporter.sort().at(-1);
    const fr = normFormaal(read(join(dir, nyeste)));
    if (!fr) v("structural-chain", `${dir}/${nyeste}: ingen "> Denne pakke leverer:"-blok`);
    else if (fk && fk !== fr) v("structural-chain", `Formål-streng afviger mellem ${krav} og ${dir}/${nyeste} (§3.0)`);
  }
}

// ---------- run ----------
const CHECKS = [
  ["dead-doc-paths", deadDocPaths],
  ["junk-files", junkFiles],
  ["laesefoelge-targets", laesefoelgeTargets],
  ["pointer-validity", pointerValidity],
  ["owns-uniqueness", ownsUniqueness],
  ["number-home-uniqueness", numberHomeUniqueness],
  ["H-ref-integrity", hRefIntegrity],
  ["structural-chain", structuralChain],
];
for (const [name, fn] of CHECKS) {
  const before = violations.length;
  try {
    fn();
  } catch (e) {
    v(name, `scanner-fejl: ${e.message}`);
  }
  if (violations.length === before) console.log(`✓ ${name}`);
  else console.log(`✗ ${name}`);
}

if (violations.length) {
  console.error("\nGovernance-check FEJLEDE:");
  for (const x of violations) console.error("  " + x);
  process.exit(1);
}
console.log(`\nGovernance-check: alle checks passed (${DOC_FILES.length} docs, ${SCRIPT_FILES.length} scripts)`);
if (notes.length && process.env.GOV_VERBOSE) notes.forEach((n) => console.log("  · " + n));

exec
/bin/bash -lc "sed -n '1,420p' scripts/codex-review.sh" in /home/mathias/stork-2.0
 succeeded in 0ms:
#!/usr/bin/env bash
# scripts/codex-review.sh
# Wrapper for Codex CLI review-runder — V5 (disciplin.md §5 severities + §6.1 halt-markers).
#
# Brug:
#   scripts/codex-review.sh <plan-fil> <runde-N> [--xhigh|--quick] [--phase=plan|build|slut-rapport]
#   scripts/codex-review.sh --parse-test
#
# Defaults: xhigh + fast_mode + timeout 480s + file-reference prompt.
# --quick: medium reasoning + timeout 120s + max 150 ord output (til intermediate batch-tjek).
# --xhigh: explicit (default — flag for klarhed når der er valg).
# --parse-test: kør canned fixtures gennem marker-parseren og assertér exit-routing.
#
# Prompt genereres fra disciplin.md V5 §10.4 (inline — ingen prefix-fil).
#
# Output: docs/coordination/codex-reviews/<dato>-<pakke>-runde-<N>.md
#         (med header om command + plan-SHA + raw codex-output)
# Stdout: echoes outputtet samt parser markers per V5 §5/§6.1
#
# Exit-koder:
#   0  = clean eller G-NUMMER-KANDIDAT (fortsæt)
#   1  = STOP-FOR-CLARIFICATION (info-mangel)
#   2  = halt-marker (BRUD-PAA-KRAV / TEKNISK-BLOKERING / PLAN-AFVIGELSE / KRITISK-SIKKERHEDSHUL)
#        ELLER severity-prefix (KRITISK — stopper plan i alle runder per §5)
#   3  = WORKAROUND-INTRODUCERET (Mathias-gate)
#   4  = ESCALATE / AUTO-ESKALATION / NEEDS-MATHIAS (Mathias-judgment kræves før V<n+1>)
#   124 = codex timeout

set -euo pipefail

# ============================================================
# Marker-parsing (V5 §5 severities + §6.1 halt-markers)
# Bracket-tolerant: §10.4-formatet er "[SEVERITY] beskrivelse"; nøgne
# "SEVERITY:"-prefixes accepteres også (gov-docs-renhed R2-1).
# ============================================================

parse_markers() {
  local f="$1"
  local clarification_hit=0 halt_hit=0 severity_hit=0
  local workaround_hit=0 escalate_hit=0 needs_mathias_hit=0

  if grep -qE '^\[?STOP-FOR-CLARIFICATION\]?(\b|:)' "$f"; then
    clarification_hit=1
    echo "  ⏸  STOP-FOR-CLARIFICATION rejst — info-mangel" >&2
  fi

  if grep -qE '^\[?(BRUD-PAA-KRAV|TEKNISK-BLOKERING|PLAN-AFVIGELSE|KRITISK-SIKKERHEDSHUL)\]?(\b|:)' "$f"; then
    halt_hit=1
    echo "  🛑 Halt-marker rejst — kræver LØS-dialog eller eskalation" >&2
  fi

  # Severity-prefix detection (G055-fix, bracket-tolerant per R2-1)
  # KRITISK uden halt-marker er stadig blocker per §5
  # ("KRITISK — stopper plan/build i alle runder").
  # \b efter KRITISK så "KRITISKE" ikke triggers false positive.
  if grep -qE '^\[?KRITISK\]?\b' "$f"; then
    severity_hit=1
    echo "  🛑 KRITISK-severity rejst — stopper plan i alle runder" >&2
  fi

  # MANGLENDE-EKSISTERENDE-BEVARELSE er KRITISK-undertype (§5) — samme routing
  if grep -qE '^\[?MANGLENDE-EKSISTERENDE-BEVARELSE\]?\b' "$f"; then
    severity_hit=1
    echo "  🛑 MANGLENDE-EKSISTERENDE-BEVARELSE rejst (KRITISK-undertype) — stopper" >&2
  fi

  # NEEDS-MATHIAS — stopper plan og kræver Mathias-afgørelse før V<n+1>
  if grep -qE '^\[?NEEDS-MATHIAS\]?\b' "$f"; then
    needs_mathias_hit=1
    echo "  🚦 NEEDS-MATHIAS rejst — Code må ikke lave V<n+1> før Mathias har afgjort" >&2
  fi

  if grep -qE '^\[?WORKAROUND-INTRODUCERET\]?(\b|:)' "$f"; then
    workaround_hit=1
    echo "  ⚠️  WORKAROUND-INTRODUCERET — Mathias-gate kræves" >&2
  fi

  if grep -qE '^\[?(ESCALATE|AUTO-ESKALATION)\]?(\b|:)' "$f"; then
    escalate_hit=1
    echo "  🚨 ESCALATE/AUTO-ESKALATION — Mathias-judgment via gate-fil" >&2
  fi

  if grep -qE '^\[?OPTIMERING-FORSLAG\]?(\b|:)' "$f"; then
    echo "  💡 OPTIMERING-FORSLAG fundet — Code's valg (ADOPT/DEFER/DISMISS)" >&2
  fi

  if grep -qE '^\[?SPARRING-OENSKE\]?(\b|:)' "$f"; then
    echo "  💬 SPARRING-OENSKE fundet" >&2
  fi

  if grep -qE '^\[?G-NUMMER-KANDIDAT\]?(\b|:)' "$f"; then
    echo "  📝 G-NUMMER-KANDIDAT(er) — log til teknisk-gaeld.md (fortsæt)" >&2
  fi

  if grep -qE '^\[?APPROVAL\]?\b' "$f"; then
    echo "  ✅ APPROVAL" >&2
  fi

  # Exit-koder per routing-tabel (uændret prioritet):
  if [ "$clarification_hit" -eq 1 ]; then return 1; fi
  if [ "$workaround_hit" -eq 1 ]; then return 3; fi
  if [ "$escalate_hit" -eq 1 ]; then return 4; fi
  if [ "$needs_mathias_hit" -eq 1 ]; then return 4; fi
  if [ "$halt_hit" -eq 1 ] || [ "$severity_hit" -eq 1 ]; then return 2; fi
  return 0
}

# ============================================================
# --parse-test: canned fixtures gennem parseren, assertér routing
# (gov-docs-renhed R2-1/R3-2 — fuld dækning af exit-koder 0/1/2/3/4)
# ============================================================

if [ "${1:-}" = "--parse-test" ]; then
  declare -a FIXTURES=(
    "APPROVAL — Runde 1|0"
    "[KRITISK] fund|2"
    "KRITISK: fund|2"
    "KRITISKE detaljer|0"
    "[NEEDS-MATHIAS] spørgsmål|4"
    "STOP-FOR-CLARIFICATION: mangler X|1"
    "[PLAN-AFVIGELSE] afviger fra plan|2"
    "WORKAROUND-INTRODUCERET: hack|3"
    "[ESCALATE] iter > 3|4"
    "[MANGLENDE-EKSISTERENDE-BEVARELSE] gate tabt|2"
  )
  FAILED=0
  TMP="$(mktemp -t parse-test.XXXXXX)"
  trap 'rm -f "$TMP"' EXIT
  for fixture in "${FIXTURES[@]}"; do
    CONTENT="${fixture%|*}"
    WANT="${fixture##*|}"
    printf '%s\n' "$CONTENT" > "$TMP"
    set +e
    parse_markers "$TMP" 2>/dev/null
    GOT=$?
    set -e
    if [ "$GOT" = "$WANT" ]; then
      echo "  ✓ '$CONTENT' -> exit $GOT"
    else
      echo "  ✗ '$CONTENT' -> exit $GOT (forventede $WANT)" >&2
      FAILED=1
    fi
  done
  if [ "$FAILED" -eq 1 ]; then
    echo "parse-test FEJLEDE" >&2
    exit 1
  fi
  echo "parse-test: alle fixtures passed"
  exit 0
fi

# ============================================================
# Argument-parsing
# ============================================================

if [ $# -lt 2 ]; then
  cat <<EOF
Usage: $0 <plan-fil> <runde-N> [--xhigh|--quick] [--phase=plan|build|slut-rapport]
       $0 --parse-test

Eksempel:
  $0 docs/coordination/<pakke>-plan.md 1
  $0 docs/coordination/<pakke>-plan.md 2 --quick
  $0 docs/coordination/rapport-historik/<dato>-<pakke>.md 1 --phase=slut-rapport

V5 marker-routing: scriptet parser output for halt-markers + severity-prefixes + positive markers (disciplin §5/§6.1).
Exit-koder:
  0  = clean eller G-NUMMER-KANDIDAT (fortsæt)
  1  = STOP-FOR-CLARIFICATION (info-mangel)
  2  = halt-marker ELLER KRITISK-severity
  3  = WORKAROUND-INTRODUCERET (Mathias-gate)
  4  = ESCALATE / AUTO-ESKALATION / NEEDS-MATHIAS
  124 = codex timeout
EOF
  exit 64
fi

PLAN_FILE="$1"
ROUND_N="$2"
shift 2

REASONING="xhigh"
TIMEOUT_SEC="${CODEX_TIMEOUT:-480}"
PHASE="plan"
MAX_WORDS="350"

while [ $# -gt 0 ]; do
  case "$1" in
    --xhigh) REASONING="xhigh"; shift ;;
    --quick) REASONING="medium"; TIMEOUT_SEC="${CODEX_QUICK_TIMEOUT:-120}"; MAX_WORDS="150"; shift ;;
    --phase=*) PHASE="${1#--phase=}"; shift ;;
    *) echo "Ukendt flag: $1" >&2; exit 64 ;;
  esac
done

# ============================================================
# Pre-flight verifikation
# ============================================================

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$REPO_ROOT" ]; then
  echo "❌ scripts/codex-review.sh skal køres inde i et git-repo." >&2
  exit 64
fi
cd "$REPO_ROOT"

if [ ! -f "$PLAN_FILE" ]; then
  echo "❌ Plan-fil findes ikke: $PLAN_FILE" >&2
  exit 64
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "❌ codex CLI ikke fundet i PATH. Kør 'codex doctor' for diagnose." >&2
  exit 64
fi

# ============================================================
# Build prompt — genereret fra disciplin.md V5 §10.4 (inline)
# ============================================================

PAKKE_NAME="$(basename "$PLAN_FILE" | sed -E 's/-plan\.md$//; s/\.md$//; s/^[0-9]{4}-[0-9]{2}-[0-9]{2}-//')"
DATE="$(date +%Y-%m-%d)"

case "$PHASE" in
  plan)         OUTPUT_DIR="docs/coordination/codex-reviews" ;;
  build)        OUTPUT_DIR="docs/coordination/codex-reviews" ;;
  slut-rapport) OUTPUT_DIR="docs/coordination/codex-reviews" ;;
  *) echo "❌ Ukendt --phase: $PHASE (forventet: plan|build|slut-rapport)" >&2; exit 64 ;;
esac

mkdir -p "$OUTPUT_DIR"
OUTPUT_FILE="${OUTPUT_DIR}/${DATE}-${PAKKE_NAME}-runde-${ROUND_N}.md"

PLAN_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo 'uncommitted')"

STATUS_FILE="docs/coordination/${PAKKE_NAME}-status.md"
KRAV_FILE="docs/coordination/${PAKKE_NAME}-krav-og-data.md"

case "$PHASE" in
  plan|build)
    FORMAAL_LINE='FORMÅL: udledes af "## Formål"-sektionen i '"$PLAN_FILE"'.'
    ;;
  slut-rapport)
    FORMAAL_LINE='FORMÅL (slut-rapport-fase): Verificér at slut-rapporten reflekterer faktisk leverance, plan-afvigelser ærligt, og leverance-tabel mod krav-dok + Stork-invariant-tjek (disciplin §10.3) korrekt.'
    ;;
esac

PROMPT=$(cat <<EOF
Du er Codex i Stork 2.0 — uafhængig kode-reviewer, read-only (disciplin §9.3).

Læs FØR review:
- docs/strategi/vision-og-principper.md
- docs/strategi/forretningsforstaaelse.md (LÅST stamme-doc, D4)
- docs/strategi/disciplin.md §9.3 (din rolle) + §5 (severities) + §8.1
- $KRAV_FILE (pakke-kontrakt — hvis den findes)
- $PLAN_FILE ($PHASE-fasen for pakke $PAKKE_NAME)
- $STATUS_FILE (kontekst + konvergens-counter — hvis den findes)

RUNDE-NUMMER: $ROUND_N
FASE: $PHASE
$FORMAAL_LINE

Review-fokus (§9.3): patch-først (§3.1) · end-to-end-spor (§3.3) ·
state-dump matcher faktisk state (§3.2) · krav-dok-konsistens uden
scope-creep · vision/forretningsforstaaelse-modsigelse ·
MANGLENDE-EKSISTERENDE-BEVARELSE.

Format pr. fund:
[SEVERITY] Kort beskrivelse
Konkret afvigelse: ...
Anbefalet handling: [V<n+1>-rettelse / G-nummer / kosmetisk note]

Berører ændringen en governance-doc: afslut med
"§8.1-SVAR: INGEN-MODSIGELSE" eller "§8.1-SVAR: MODSIGELSE — <hvad>".

Max $MAX_WORDS ord. Hvis ingen fund: skriv "APPROVAL — Runde $ROUND_N".
EOF
)

# ============================================================
# Eksekvér med hard timeout + non-json (live tail-friendly)
# stdin lukkes — codex exec uden TTY hænger ellers på
# "Reading additional input from stdin..." (gov-docs-renhed fund 6)
# ============================================================

RAW_OUTPUT="$(mktemp -t codex-review-raw.XXXXXX)"
trap 'rm -f "$RAW_OUTPUT"' EXIT

echo "▶ codex review (runde $ROUND_N, reasoning=$REASONING, timeout=${TIMEOUT_SEC}s)" >&2
echo "  Plan: $PLAN_FILE" >&2
echo "  Output: $OUTPUT_FILE" >&2
echo "" >&2

set +e
timeout --signal=KILL "$TIMEOUT_SEC" codex exec --skip-git-repo-check \
  -c "model_reasoning_effort=\"$REASONING\"" \
  --enable fast_mode \
  "$PROMPT" > "$RAW_OUTPUT" 2>&1 < /dev/null
CODEX_EXIT=$?
set -e

if [ $CODEX_EXIT -eq 124 ] || [ $CODEX_EXIT -eq 137 ]; then
  echo "❌ codex timed out efter ${TIMEOUT_SEC}s." >&2
  echo "  Sidste output gemt i $RAW_OUTPUT (kopier til $OUTPUT_FILE manuelt hvis nyttig)." >&2
  cp "$RAW_OUTPUT" "$OUTPUT_FILE"
  exit 124
fi

if [ $CODEX_EXIT -ne 0 ]; then
  echo "❌ codex fejlede (exit $CODEX_EXIT)." >&2
  echo "  Output:" >&2
  tail -10 "$RAW_OUTPUT" >&2
  exit $CODEX_EXIT
fi

# ============================================================
# Skriv output-fil med header
# ============================================================

case "$REASONING" in
  xhigh)  REASONING_FLAG="--xhigh" ;;
  medium) REASONING_FLAG="--quick" ;;
  *)      REASONING_FLAG="" ;;
esac
RERUN_CMD="$0 $PLAN_FILE $ROUND_N $REASONING_FLAG --phase=$PHASE"

cat > "$OUTPUT_FILE" <<EOF
# Codex review — $PAKKE_NAME runde $ROUND_N

**Pakke:** $PAKKE_NAME
**Fase:** $PHASE
**Plan-fil:** $PLAN_FILE
**Plan-SHA:** $PLAN_SHA
**Dato:** $DATE
**Reasoning:** $REASONING
**Max ord:** $MAX_WORDS
**Command:** \`$RERUN_CMD\` (re-run via samme args inkl. flags)

---

EOF
cat "$RAW_OUTPUT" >> "$OUTPUT_FILE"

# ============================================================
# Marker-parsing + echo output + exit per routing
# ============================================================

echo "" >&2
echo "▶ Marker-parsing:" >&2

set +e
parse_markers "$RAW_OUTPUT"
ROUTING_EXIT=$?
set -e

echo "" >&2
echo "▶ Output:" >&2
cat "$RAW_OUTPUT"

exit $ROUTING_EXIT

exec
/bin/bash -lc "sed -n '1,260p' docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
# Codex review — gov-docs-renhed runde 5

**Pakke:** gov-docs-renhed
**Fase:** build
**Plan-fil:** docs/coordination/gov-docs-renhed-plan.md
**Plan-SHA:** 00c1ebd
**Dato:** 2026-06-10
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-docs-renhed-plan.md 5 --xhigh --phase=build` (re-run via samme args inkl. flags)

---

Reading additional input from stdin...
OpenAI Codex v0.137.0
--------
workdir: /home/mathias/stork-2.0
model: gpt-5.5
provider: openai
approval: never
sandbox: workspace-write [workdir, /tmp, $TMPDIR] (network access enabled)
reasoning effort: xhigh
reasoning summaries: none
session id: 019eb184-5116-7d23-8693-b058fc799c71
--------
user
Du er Codex i Stork 2.0 — uafhængig kode-reviewer, read-only (disciplin §9.3).

Læs FØR review:
- docs/strategi/vision-og-principper.md
- docs/strategi/forretningsforstaaelse.md (LÅST stamme-doc, D4)
- docs/strategi/disciplin.md §9.3 (din rolle) + §5 (severities) + §8.1
- docs/coordination/gov-docs-renhed-krav-og-data.md (pakke-kontrakt — hvis den findes)
- docs/coordination/gov-docs-renhed-plan.md (build-fasen for pakke gov-docs-renhed)
- docs/coordination/gov-docs-renhed-status.md (kontekst + konvergens-counter — hvis den findes)

RUNDE-NUMMER: 5
FASE: build
FORMÅL: udledes af "## Formål"-sektionen i docs/coordination/gov-docs-renhed-plan.md.

Review-fokus (§9.3): patch-først (§3.1) · end-to-end-spor (§3.3) ·
state-dump matcher faktisk state (§3.2) · krav-dok-konsistens uden
scope-creep · vision/forretningsforstaaelse-modsigelse ·
MANGLENDE-EKSISTERENDE-BEVARELSE.

Format pr. fund:
[SEVERITY] Kort beskrivelse
Konkret afvigelse: ...
Anbefalet handling: [V<n+1>-rettelse / G-nummer / kosmetisk note]

Berører ændringen en governance-doc: afslut med
"§8.1-SVAR: INGEN-MODSIGELSE" eller "§8.1-SVAR: MODSIGELSE — <hvad>".

Max 350 ord. Hvis ingen fund: skriv "APPROVAL — Runde 5".
codex
Jeg læser de angivne styringsdokumenter og den aktuelle patch først, så reviewet kan holdes til §9.3-rollen og den konkrete build-fase.
exec
/bin/bash -lc "sed -n '1,260p' docs/strategi/forretningsforstaaelse.md" in /home/mathias/stork-2.0
exec
/bin/bash -lc "sed -n '1,260p' docs/strategi/disciplin.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
# Stork 2.0 — Arbejds-disciplin (V5)

<!-- governance-owns: aktoerer-roller, workflow, gates, severities, vagter, skabeloner, bevarings-politik -->

Ét hjem for hvordan vi arbejder sammen: aktører, roller, flow, gates, severities, disciplin. Mathias styrer tanker, funktioner, logik og vision; AI'erne (Claude.ai, Code, Codex) bygger. Vi bygger ovenpå eksisterende kode, ikke nyt hver gang.

> **Dette er det eneste rolle- og proces-hjem.** Vision-og-principper.md definerer ikke længere aktører eller roller — det er proces, og det bor her. Ved konflikt om systemets vision vinder vision-dokumentet; ved spørgsmål om hvordan vi arbejder vinder denne fil.

> **V5-ændringer fra V4 (afgørelser, kan omgøres):** Genindført fire discipliner V4 tabte uden beslutning, fordi de er bærende — formåls-immutabilitet (§3.0), differentieret modsigelses-håndtering (§8), destructive-drops-preflight (§3.9), glid-detector (§9). Ikke genindført det V4 bevidst droppede (footer): 3-AI forretningsgang-triangulering og fire-dok-konsultations-tabel — substansen ligger i §9.1 proaktiv recon og §9.3 Codex-review-fokus, og V4 havde ret i at skære ceremonien. Automation skrevet ærligt som notify-only (§2, §6.2).

---

## §1 Aktører og roller

| Aktør         | Rolle                                                                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Mathias**   | Tanker, funktioner, logik, vision. Eneste beslutningstager. Dikterer krav-dok pr. pakke. Godkender plan + slut-rapport                    |
| **Claude.ai** | Krav-dok-typist (skriver Mathias' tanker ned). Slut-rapport-reviewer. Strategisk sparring. **Docs-lag — kigger ikke på kode/DB-tilstand** |
| **Code**      | Builder. Migrations, RPC'er, tests. Eneste med skrive-adgang til repo                                                                     |
| **Codex**     | Uafhængig kode-reviewer. Read-only. Bugs, RLS-huller, SQL-fejl, manglende-eksisterende-bevarelse                                          |

**Ingen AI må:** træffe forretnings-beslutninger på Mathias' vegne · skrive "afgørelser"/"ramme-låsninger" som AI · fortolke retning som specifikation uden bekræftelse · designe datamodel uden Mathias-input (Claude.ai) · skrive kode (Codex) · påstå repo-/DB-tilstand uden at have verificeret den (alle).

---

## §2 Workflow — 5-step flow

Alle pakker kører fuld disciplin. Ingen skala-distinktion.

```
0. Pakke-åbning (Mathias)
   ↓
1. Krav-dok (Mathias → Claude.ai-typist, proaktiv recon; Mathias validerer)   ← gate: "krav OK"
   ↓
2. Plan (Code + Codex parallel; skitse → størrelses-tjek → fuld plan eller split)
   ↓
3. qwerg approval (Mathias)                                                    ← gate: "qwerg"
   ↓
4. Build (Code batches; Codex per-batch; end-to-end-konsistens per batch)
   ↓
5. Slut-rapport (Code skriver; Claude.ai-review FØR merge)                     ← gate: "slut OK"
```

Tre gates kræver Mathias: `krav OK`, `qwerg`, `slut OK`. Trin 2 og 4 er hvor det meste arbejde sker.

> **Automation-tilstand (Codes kortlægning, juni 2026 — Codes bord):** `codex-notify` poster kun tracker-comment. Der er **ingen Codex-runner og ingen auto-merge-workflow endnu**, og plan-branchen er ikke dækket af triggeren (bygges i gov-5-automation). Indtil det bygges: Mathias merger PR'er, og Codex-review relæes manuelt. Flowet ovenfor er mål-tilstanden — gates der hviler på auto-merge er ikke aktive endnu. Denne fil påstår ikke en automation der ikke kører.

### Step 0 — Pakke-åbning

Mathias melder ny pakke ud i chat.

### Step 1 — Krav-dok

Claude.ai skriver `docs/coordination/<pakke>-krav-og-data.md` fra Mathias' chat-input; Mathias validerer i samme chat.

- Mathias' tanker om hvad pakken skal levere (forretning + funktion + logik)
- Ingen tabel-navne/kolonner/RPC-signaturer (Code's bord i plan-fasen)
- Hver påstand peges på Mathias-ord — ingen kilde: spørg, skriv ikke. Ingen fabrikation.

### Step 2 — Plan (med skitse-tjek)

**2.0 skitse + størrelse:** 1-5 migrations → fuld V1. 6+ → STOP, split-forslag (krav-dok forbliver ÉT dok, implementation splittes over pakker).
**2.1 fuld plan (Code+Codex parallel fra V1):** Code skriver V<n>; Codex laver parallel kode-research. Code håndterer hvert KODE-FUND eksplicit i V<n+1> (ADRESSERET / AFVIST fordi Y). Stop: Codex APPROVAL + "INGEN NYE FUND".

### Step 3 — qwerg

Mathias paster `qwerg` når Codex har approved OG Mathias selv har læst igennem.

**Forudsætning — fundament-validering (grøn før qwerg):** planen skal stå på mål med vision + forretningsforstaaelse. Almindelig plan bekræfter "ingen forretnings-intentions-ændring" (Doc-currency A, §10.2). Plan der ændrer intention: fundament-doc'en reconciles først gennem §8.1-gaten + Mathias' CODEOWNERS — FØR qwerg. Modsigelses-konsekvens per §8 (vision LÅST = STOP). En plan godkendes ikke stående på fundament den modsiger.

### Step 4 — Build

Batches på 3-5 migrations. Patch-først (§3.1). End-to-end-konsistens per batch. Smoke-fejl → STOP-gate (§3.7).

### Step 5 — Slut-rapport

Code skriver `rapport-historik/<dato>-<pakke>.md`. Claude.ai reviewer FØR merge.

---

## §3 Bygge-disciplin

### 3.0 Formåls-immutabilitet (genindført)

Hver pakke har ét FORMÅL (krav-dok §Formål). Når Mathias har godkendt det, er det **låst**. Code må ændre den tekniske implementations-vej undervejs (Code's domæne — flag i slut-rapport under Plan-afvigelser), men **ikke** formålet. Afslører implementation at formålet ikke kan leveres: STOP, eskalér. Codex-fund kan føre til bug-fix, implementations-ændring, G-nummer eller STOP+eskalation — **aldrig** til at Code ændrer formål, tilføjer features eller omtolker hvad pakken skal levere.

### 3.1 Patch-først (byg ovenpå, ikke nyt)

For HVER eksisterende funktion/policy/tabel der ændres: plan inkluderer NUVÆRENDE body 1:1 med file:linje + markerer DIFF eksplicit (hvad fjernes/tilføjes, hvilke gates/kommentarer/kolonner/audit-spor bevares) + migration starter med diff-summary. Tab af gate/kommentar/kolonne uden begrundelse = `MANGLENDE-EKSISTERENDE-BEVARELSE` (KRITISK).

### 3.2 DB-state-dump som plan-pre-condition

Code må ikke skrive plan før konkret DB-state er dumpet via Supabase MCP (RPC-bodies via `pg_get_functiondef`, kolonner+constraints, policies, grants) og lagt i plan under "Verificerede DB-objekter" som råt output. Ingen gæt, ingen cached state.

### 3.3 End-to-end-spor pr. write-vej

For hver write-RPC der ændres/tilføjes: (1) GRANT + policy + session-var som tre-pak, (2) SELECT-policy bred nok til alle legitime læsere, (3) apply-dispatcher-extension, (4) én eksempel-row gennem fuldt flow (UI → handler → RPC → DB → læsning), (5) krydscheck mod fundament-tjek. Manglende ét = KRITISK i plan-review.

### 3.4 Konvergens-counter med auto-STOP

Counter i pakke-status, incrementerer pr. V<n>. Runde 1-3 normalt · 4 Mathias-alert ("er krav-dok præcist nok?") · 5 auto-pause · 6+ auto-STOP (krav-dok genåbnes eller pakken splittes). Konvergerer vi ikke i 3-4 runder er problemet rammen, ikke "prøv igen".

### 3.5 Pakke-status.md — kontekst mellem sessioner

Hver aktiv pakke har én lille fil: sidste handling · næste forventet · konvergens-counter · aktuel blocker. AI'er læser den FØRST.

### 3.6 End-to-end-test er leverings-kriterium

Hver pakke leverer mindst ÉN test gennem ÉT konkret flow (UI/RPC → DB-write → RLS → læsning). Schema-only ("kolonner findes") accepteres ikke.

### 3.7 STOP-FOR-CLARIFICATION-gate

Build-afvigelse fra krav-dok kræver eksplicit Mathias-godkendelse via gate-fil — ikke Code-selvbeslutning. STOP build → `mathias-gate/<pakke>-<type>-<N>.md` (Status: AFVENTER MATHIAS + afvigelse + begrundelse) → Mathias: GODKENDT/AFVIST → genoptag/alternativ. FORBUDT: "det er midlertidigt", "min fortolkning".

### 3.8 Pakke-størrelses-grænse

Skitse > 5 migrations → STOP, foreslå split.

### 3.9 Destructive drops kræver preflight (genindført — højeste indsats; Stork rører løndata)

`DROP TABLE/COLUMN`, `TRUNCATE`, `DELETE` uden WHERE o.l. kræver:

- **Tom-check:** `count(*) = 0`, eller eksplicit kvittering for antal rows der tabes
- **Reference-check:** ingen FK refererer det droppede (ikke kun CASCADE-fix)
- **Audit-spor:** session-vars `source_type` + `change_reason` sat før operation
- **Rollback-plan:** hvordan operationen rulles tilbage

Pre-cutover (ingen rigtige data): tom-check + audit-spor er minimum. Post-cutover: alle fire er CI-blocker; manglende preflight = review-rejection. Dette er den dyreste fejl-klasse i systemet.

---

## §4 Bevarelses-disciplin — hvad gemmes, hvad slettes

**Princip:** kun krav-dok + godkendt plan (slut-version) + slut-rapport overlever pakken. Resten lever i git-history.

**Bevares på main:** krav-dok → `arkiv/<pakke>-krav-og-data.md` · plan → `arkiv/<pakke>-plan.md` · slut-rapport → `rapport-historik/<dato>-<pakke>.md` · in-place-opdateringer til vision, forretningsforstaaelse, master-plan (overblik), teknisk-gaeld.

**Slettes ved pakke-luk:** `<pakke>-status.md` · alle `plan-feedback/<pakke>-V<n>-*` · alle `codex-reviews/<pakke>-runde-*` · afgjorte `mathias-gate/<pakke>-*` · plan-versioner V1..Vn (git-history bevarer sporet).

**Én bevarings-politik.** Arkivet er ikke en voksende kirkegård; iterations-, recon- og review-filer lever i git-history, ikke som filer på main.

---

## §5 Severities + FLAG/LØS-dialog

| Severity                             | Konsekvens                                                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **KRITISK**                          | Stopper plan/build i alle runder. Code SKAL adressere næste runde                                                                                |
| **MANGLENDE-EKSISTERENDE-BEVARELSE** | KRITISK-undertype: mister gate/kommentar/kolonne fra eksisterende body uden begrundelse                                                          |
| **MELLEM**                           | Stopper i runde 1. G-nummer i runde 2+                                                                                                           |
| **KOSMETISK**                        | Stopper IKKE. G-nummer-kandidat                                                                                                                  |
| **OPGRADERING**                      | Stopper IKKE. Code afviser eller implementerer eksplicit i V<n+1>. Codex må give APPROVAL + OPGRADERING samtidig                                 |
| **NEEDS-MATHIAS**                    | Stopper i alle runder. Code kan ikke lave V<n+1> før Mathias afgør. Reviewer skriver eksplicit spørgsmål. Max 2 pr. review — flugtvej hvis flere |
| **FULDSTYRKE-MANGEL**                | Kun Mathias-rejst. AI scrapper output, gentager samme V-nummer                                                                                   |

Hver severity bærer funktion — de kollapses ikke. (MANGLENDE-EKSISTERENDE-BEVARELSE binder patch-først; OPGRADERING muliggør approval+forslag samtidig.)

**Runde-trapper:** runde 1 alle fund vurderes · runde 2 kun KRITISK stopper, MELLEM → G-numre · runde 3 kun KRITISK, resten → G-numre · runde 4+ se §3.4.

**FLAG → LØS (Code's svar pr. Codex-fund):** ACCEPT / PUSHBACK (argumentér; Codex: AGREE/REFINE) / PROPOSE-ALTERNATIVE. Max 3 LØS-iterationer pr. fund; > 3 → auto-eskalation via `mathias-gate/`.

**Positive markers:** OPTIMERING-FORSLAG (Codex) → Code: ADOPT/DEFER/DISMISS · SPARRING-OENSKE (Code) → Codex: CONFIRM/TIMING/AVOID.

---

## §6 Build-markers + automation

### 6.1 Halt-markers

`BRUD-PAA-KRAV` → Step 1 · `TEKNISK-BLOKERING` → Step 2 / Mathias · `PLAN-AFVIGELSE` → Step 2 / Mathias · `KRITISK-SIKKERHEDSHUL` → fix samme batch / Mathias · `WORKAROUND-INTRODUCERET` → mathias-gate · `STOP-FOR-CLARIFICATION` → gate-fil.

### 6.2 Automation (Codes bord — tilstand: notify-only)

`codex-notify.yml` poster tracker-comments på push til aktiv-plan/seneste-rapport/build-branch og på slut-rapport-PR. **Den kører ikke Codex, og der er ingen auto-merge.** Mål-tilstand (skal bygges, Codes bord — samlet i gov-5-automation): plan-branch-trigger, Codex-runner, auto-merge ved grøn CI + godkendelse. `migrations-deploy.yml` deployer til live + regenererer types ved push til migrations — verificér mod Codes kortlægning før den antages aktiv.

### 6.3 Mathias-gate to-fil-flow

For WORKAROUND-INTRODUCERET, STOP-FOR-CLARIFICATION, dobbelt-ESCALATE og iter > 3: build pauser → Code skriver gate-fil (Status: AFVENTER MATHIAS + begrundelse + G-nummer + deadline) → Mathias: GODKENDT/AFVIST → genoptag/alternativ → slettes ved pakke-luk.

---

## §7 Stork-invariant-tjek pr. pakke (verificeres i slut-rapport)

| #   | Invariant                    | Test                                                                                  |
| --- | ---------------------------- | ------------------------------------------------------------------------------------- |
| 1   | Vision-overholdelse          | Vision-tjek-sektion (ja/nej + evidens pr. princip)                                    |
| 2   | Permission-matrix-konsistens | RPC→tab/page-mapping opdateret + RLS dækker alle write-veje                           |
| 3   | Audit-trigger-dækning        | Alle nye tabeller har audit-trigger (fitness)                                         |
| 4   | Konfiguration-i-data         | Ingen hardkodede satser/lønarter (Codex + Claude.ai-tjek — lint bygges i senere spor) |
| 5   | End-to-end-flow virker       | Smoke-test passerer (ikke schema-only)                                                |
| 6   | Anonymisering-bevaring       | UPDATE, ikke DELETE; FK'er intakt                                                     |

Tabel med ja/nej + evidens. Manglende eller "nej" uden begrundelse → KRITISK fra Claude.ai-reviewer.

---

## §8 Modsigelses-disciplin (genindført — differentieret efter dokument-status)

Hvad en modsigelse udløser afhænger af hvilket dokument den rammer. Det forhindrer at arbejdet stopper på master-plan (som er overblik, ikke kontrakt).

exec
/bin/bash -lc 'find docs/coordination/v4-slettede-docs -maxdepth 2 -type f 2>/dev/null | sort | head -50; git status --ignored --short docs/coordination/v4-slettede-docs .gitignore' in /home/mathias/stork-2.0
 succeeded in 0ms:
docs/coordination/v4-slettede-docs/INDEX.md
docs/coordination/v4-slettede-docs/T9-supplement-skitse.md
docs/coordination/v4-slettede-docs/afdaekning--g043-g044-data-code-2026-05-16.md
docs/coordination/v4-slettede-docs/afdaekning--g043-g044-data-codex-2026-05-16.md
docs/coordination/v4-slettede-docs/arbejds-disciplin.md
docs/coordination/v4-slettede-docs/arbejdsmetode-og-repo-struktur.md
docs/coordination/v4-slettede-docs/bygge-status.md
docs/coordination/v4-slettede-docs/lag-e-beregningsmotor-krav.md
docs/coordination/v4-slettede-docs/lag-e-tidsregistrering-krav.md
docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md
docs/coordination/v4-slettede-docs/overvaagning--claude-ai-overvaagning.md
docs/coordination/v4-slettede-docs/overvaagning--code-overvaagning.md
docs/coordination/v4-slettede-docs/overvaagning--codex-overvaagning.md
docs/coordination/v4-slettede-docs/skabelon--codex-review-prompt.md
docs/coordination/v4-slettede-docs/skabelon--plan-skabelon.md
docs/coordination/v4-slettede-docs/skabelon--rapport-skabelon.md
docs/coordination/v4-slettede-docs/skabelon--workflow-skabelon.md
!! docs/coordination/v4-slettede-docs/

exec
/bin/bash -lc 'rg -n "v4-slettede-docs|codex-reviews|MANGLENDE-EKSISTERENDE-BEVARELSE|rapport-skabelon|claude-ai-overvaagning|mathias-afgoerelser|aktiv-pakke" docs scripts .gitignore' in /home/mathias/stork-2.0
 succeeded in 0ms:
.gitignore:51:docs/coordination/v4-slettede-docs/
scripts/governance-check.mjs:29:  "docs/coordination/v4-slettede-docs",
scripts/governance-check.mjs:33:  "docs/coordination/codex-reviews",
scripts/governance-check.mjs:73:    path: "docs/skabeloner/rapport-skabelon.md",
scripts/governance-check.mjs:88:    path: "docs/coordination/codex-reviews",
scripts/governance-check.mjs:93:    path: "docs/coordination/v4-slettede-docs",
scripts/governance-check.mjs:288:    const m = line.trim().match(/^<!--\s*aktiv-pakke:\s*(\S+)(?:\s+fase:\s*(plan|build|rapport))?\s*-->$/);
scripts/governance-check.mjs:294:      "aktiv-plan.md mangler standalone-markør <!-- aktiv-pakke: <navn|ingen> [fase: plan|build|rapport] -->",
scripts/governance-check.selftest.mjs:67:  appendFileSync(join(d, "docs/coordination/aktiv-plan.md"), `\n<!-- aktiv-pakke: testpakke fase: ${fase} -->\n`);
scripts/codex-review.sh:16:# Output: docs/coordination/codex-reviews/<dato>-<pakke>-runde-<N>.md
scripts/codex-review.sh:61:  # MANGLENDE-EKSISTERENDE-BEVARELSE er KRITISK-undertype (§5) — samme routing
scripts/codex-review.sh:62:  if grep -qE '^\[?MANGLENDE-EKSISTERENDE-BEVARELSE\]?\b' "$f"; then
scripts/codex-review.sh:64:    echo "  🛑 MANGLENDE-EKSISTERENDE-BEVARELSE rejst (KRITISK-undertype) — stopper" >&2
scripts/codex-review.sh:124:    "[MANGLENDE-EKSISTERENDE-BEVARELSE] gate tabt|2"
scripts/codex-review.sh:225:  plan)         OUTPUT_DIR="docs/coordination/codex-reviews" ;;
scripts/codex-review.sh:226:  build)        OUTPUT_DIR="docs/coordination/codex-reviews" ;;
scripts/codex-review.sh:227:  slut-rapport) OUTPUT_DIR="docs/coordination/codex-reviews" ;;
scripts/codex-review.sh:266:MANGLENDE-EKSISTERENDE-BEVARELSE.
docs/coordination/gov-docs-renhed-plan.md:80:  v4-slettede-docs og rapport-historik):
docs/coordination/gov-docs-renhed-plan.md:85:  | coordination/mathias-afgoerelser.md    | claude-ai-prompt.sh + data-grundlag.sh (kun scripts)                                                       |
docs/coordination/gov-docs-renhed-plan.md:86:  | overvaagning/claude-ai-overvaagning.md | claude-ai-prompt.sh (kun script)                                                                           |
docs/coordination/gov-docs-renhed-plan.md:90:  | skabeloner/rapport-skabelon.md         | ingen i scannet scope (kun rapport-historik/README.md — scope-ekskluderet, derfor overlevede den døde ref) |
docs/coordination/gov-docs-renhed-plan.md:93:  | coordination/codex-reviews             | codex-review.sh                                                                                            |
docs/coordination/gov-docs-renhed-plan.md:100:| `claude-ai-prompt.sh` | **SLET**   | Indlejrer fjernet fire-dok-ramme + V5.3-step-numre; peger på slettede mathias-afgoerelser.md + claude-ai-overvaagning.md. Substansen overhalet af SKILL.md-i-repo + Filesystem-MCP                                                 |
docs/coordination/gov-docs-renhed-plan.md:116:`mathias-afgoerelser.md`, `claude-ai-overvaagning.md`, `rapport-skabelon.md`
docs/coordination/gov-docs-renhed-plan.md:125:  `<!-- aktiv-pakke: <navn> fase: plan|build|rapport -->` eller
docs/coordination/gov-docs-renhed-plan.md:126:  `<!-- aktiv-pakke: ingen -->`. Manglende markør = violation (tilstand skal
docs/coordination/gov-docs-renhed-plan.md:148:Codex-review når governance-doc er berørt; felt i slut-rapport-skabelonen
docs/coordination/gov-docs-renhed-plan.md:183:| 3 — mekaniske værn   | allowlist-split + prune · kæde-tjek · aktiv-pakke-markør · 7 selftest-cases (appendix B.2–B.4) | batch 1+2   | Mellem. Selftest beviser begge retninger                                                  |
docs/coordination/gov-docs-renhed-plan.md:202:| aktiv-plan.md              | ja      | pakke-status + aktiv-pakke-markør (→ `ingen` ved pakke-luk)                     |
docs/coordination/gov-docs-renhed-plan.md:212:gov-6 arkiv-fold (G063 + v4-slettede-docs) · P3-spor · semantisk
docs/coordination/gov-docs-renhed-plan.md:410:README:5 nuværende: `Hver rapport følger \`docs/skabeloner/rapport-skabelon.md\`.`Ny:`Hver rapport følger skabelonen i \`docs/strategi/disciplin.md\` §10.3.`
docs/coordination/gov-docs-renhed-plan.md:520:MANGLENDE-EKSISTERENDE-BEVARELSE.
docs/coordination/gov-docs-renhed-plan.md:601:**Bevares 1:1 (MANGLENDE-EKSISTERENDE-BEVARELSE-tjek):** argument-parsing
docs/coordination/gov-docs-renhed-plan.md:675:`mathias-afgoerelser.md`, `overvaagning/claude-ai-overvaagning.md`,
docs/coordination/gov-docs-renhed-plan.md:676:`skabeloner/rapport-skabelon.md`, jf. referent-tabellen). Øvrige 9 entries
docs/coordination/gov-docs-renhed-plan.md:714:    const m = line.trim().match(/^<!--\s*aktiv-pakke:\s*(\S+)(?:\s+fase:\s*(plan|build|rapport))?\s*-->$/);
docs/coordination/gov-docs-renhed-plan.md:720:      "aktiv-plan.md mangler standalone-markør <!-- aktiv-pakke: <navn|ingen> [fase: plan|build|rapport] -->",
docs/coordination/gov-docs-renhed-plan.md:757:`<!-- aktiv-pakke: gov-docs-renhed fase: build -->`.
docs/coordination/gov-docs-renhed-plan.md:774:  appendFileSync(join(d, "docs/coordination/aktiv-plan.md"), `\n<!-- aktiv-pakke: testpakke fase: ${fase} -->\n`);
docs/coordination/gov-docs-renhed-status.md:3:**Sidste handling:** Build batch 4 (fix-batch): Codex build-review runde 5 gav 3 KRITISK — alle rettet (v4-slettede-docs untracked igen + .gitignore-værn; denne status-fil synkroniseret; MANGLENDE-EKSISTERENDE-BEVARELSE routet til exit 2 + fixture). 2026-06-10.
docs/coordination/gov-docs-renhed-status.md:13:  (Fejl-committede også 17 v4-slettede-docs-filer — fanget af Codex runde 5,
docs/coordination/gov-docs-renhed-status.md:16:  9 selftest-cases + aktiv-pakke-markør. Evidens: selftest fuldt grøn
docs/coordination/gov-docs-renhed-status.md:22:1. rapport-skabelon-allowlist-entry beholdt (plan sagde prune) — planens egen
docs/coordination/gov-docs-renhed-status.md:24:2. v4-slettede-docs/ kortvarigt tracked i batch 2 (Code-fejl, `git add -A`) —
docs/coordination/gov-docs-renhed-status.md:26:3. MANGLENDE-EKSISTERENDE-BEVARELSE-routing tilføjet parseren (runde 5-fund) —
docs/coordination/gov-docs-renhed-status.md:28:4. codex-reviews/ tilføjet scannerens DOC_EXCLUDE (batch 4b) — review-filer er
docs/coordination/gov-docs-renhed-status.md:35:- Reviews: codex-reviews/2026-06-10-gov-docs-renhed-runde-{1..4}.md (plan:
docs/coordination/governance-vagt-krav-og-data.md:54:   (§4). Inkl. `v4-slettede-docs/` der stadig ligger untracked. _(disciplin §4)_
docs/coordination/arkiv/I001-krav-og-data.md:95:Code argumenterer for det rette disciplin-niveau givet at slut-rapport-skabelonen allerede har struktureret vision-tjek.
docs/strategi/stork-2-0-master-plan.md:42:Historiske ramme-niveau-beslutninger fra V3 og tidligere lever i `docs/coordination/arkiv/mathias-afgoerelser-historik.md` som læsbar reference (ikke aktiv kilde).
docs/strategi/stork-2-0-master-plan.md:353:Reflekterer T9-omstart-rammen fra 2026-05-17 (mathias-afgoerelser, 15 punkter). Rettelse 35 (2026-05-18) erstatter pre-omsadlings-tekst der modsagde rammen.
docs/strategi/stork-2-0-master-plan.md:484:- Én klient-entitet med fælles kolonner (id, navn, is_active, logo (bytea+content_type+filename), timestamps). Klient-specifikke værdier i jsonb felt-bag. Klient anonymiseres ikke (mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme")
docs/strategi/stork-2-0-master-plan.md:488:- Match-mekanik udskudt til data-indgang-pakke (mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering: migration og match-rolle ud")
docs/strategi/stork-2-0-master-plan.md:1519:| 10   | Klient-skabelon (core_identity.clients + client_field_definitions + logo (bytea) + is_active + FK fra client_node_placements + has_permission-RPCs + employee-id-baseret superadmin-bypass i apply-context). Migration udskudt (mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering")                                                                                                                                            | core_identity                                                                 |
docs/strategi/stork-2-0-master-plan.md:2004:| 33  | Master-plan sandheds-audit (Claude.ai 2026-05-16): §5 udvidet med to bullets ("Sammenkobling eksplicit i datamodellen" + "Konfiguration har livscyklus") for at reflektere vision-meta-princip 3 og vision-operationel-princip 5. §3 udvidet med CI-blocker 19 (FK-coverage) for at håndhæve sammenkoblings-princippet teknisk. §0 fik ny "Strategiske retning-skift"-sektion der peger på mathias-afgoerelser som kilde. Konsekvens: master-plan reflekterer nu alle 3 meta-principper + alle 9 operationelle principper fra vision-dokumentet.                                                                                                                                                                                                                                                                                                                 |
docs/strategi/stork-2-0-master-plan.md:2006:| 35  | T9-fundament-supplement (2026-05-18): §1.7 omskrevet til at matche T9-omstart-rammen (mathias-afgoerelser 2026-05-17, 15 punkter). Pre-omsadlings-tekst om 4-dim permission, scope=team, stab-rolle, `org_unit_closure`-navn og `is_compliance_officer()` fjernet som forkert fundament. Tre-niveau permission-model (Område → Page → Tab) + to akser ((kan_tilgå/kan_skrive) × visibility (Sig selv/Hiraki/Alt)) erstatter 4-dim. ÉT træ-anker, knude-løs medarbejder gyldig, klient-til-team-only-binding, fortrydelses-mekanisme. §1.1's session-var-pattern implementeret i T9-write-veje (migration `20260518100000_t9_fundament_supplement.sql`): INSERT/UPDATE-policies med `stork.t9_write_authorized`-check på 6 write-tabeller; 11 write-RPCs sætter session-var efter has_permission-check. H011's §1.7-modsigelse (identificeret 2026-05-15) lukkes. |
docs/strategi/stork-2-0-master-plan.md:2007:| 36  | Trin 10 (2026-05-21): §1.8 omskrevet til at matche faktisk klient-skabelon-implementation. Pre-fundament-tekst om `anonymized_at`-kolonne, match-rolle-koncept + crm_match_id-rolle, pr-klient felt-definitions-registry, dispatching i `audit_filter_values`-special-case fjernet som scope-justeret. Klient lever i `core_identity.clients` (T1 droppede D5's `public.clients`); is_active erstatter anonymized_at (krav-dok §2.5.1: ikke-anonymiseret); logo (bytea+content_type+filename) med PII-hashing i audit; client_field_definitions globalt registry; aktiv-check i client_node_place wrapper + \_apply_client_place med employee-id-baseret superadmin-bypass for cron-context. §4 trin 10-række rettet: migration + crm_match_id fjernet (mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering"). G057 + G058 registreret som teknisk gæld.   |
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V1-approved-claude-ai.md:47:### Mathias-afgørelser (`docs/coordination/mathias-afgoerelser.md`)
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V1-approved-claude-ai.md:81:Den korrekte kilde for én-medarbejder-ét-team-reglen er mathias-afgoerelser 2026-05-16 punkt 7 (allerede refereret i samme række — fint at have begge, men princip 8 er ikke materiel kilde).
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V1-approved-claude-ai.md:83:**Anbefalet handling:** Kosmetisk note. Hvis pakken får runde V2 af andre grunde: fjern princip 8-reference fra vision-rækken; behold mathias-afgoerelser pkt 7-reference. Ellers G-nummer-kandidat: "Plan-skabelon-vejledning: præcisering af vision-princip-referencer i Fire-dokument-konsultations-tabel."
docs/strategi/disciplin.md:89:For HVER eksisterende funktion/policy/tabel der ændres: plan inkluderer NUVÆRENDE body 1:1 med file:linje + markerer DIFF eksplicit (hvad fjernes/tilføjes, hvilke gates/kommentarer/kolonner/audit-spor bevares) + migration starter med diff-summary. Tab af gate/kommentar/kolonne uden begrundelse = `MANGLENDE-EKSISTERENDE-BEVARELSE` (KRITISK).
docs/strategi/disciplin.md:138:**Slettes ved pakke-luk:** `<pakke>-status.md` · alle `plan-feedback/<pakke>-V<n>-*` · alle `codex-reviews/<pakke>-runde-*` · afgjorte `mathias-gate/<pakke>-*` · plan-versioner V1..Vn (git-history bevarer sporet).
docs/strategi/disciplin.md:149:| **MANGLENDE-EKSISTERENDE-BEVARELSE** | KRITISK-undertype: mister gate/kommentar/kolonne fra eksisterende body uden begrundelse                                                          |
docs/strategi/disciplin.md:156:Hver severity bærer funktion — de kollapses ikke. (MANGLENDE-EKSISTERENDE-BEVARELSE binder patch-først; OPGRADERING muliggør approval+forslag samtidig.)
docs/strategi/disciplin.md:352:### §10.3 Slut-rapport-skabelon
docs/strategi/disciplin.md:417:- MANGLENDE-EKSISTERENDE-BEVARELSE (KRITISK-undertype)
docs/coordination/arkiv/T9-foraeldet-2026-05-17/README.md:10:  employee_team_assignments-tabellen. Det modsagde mathias-afgoerelser
docs/coordination/arkiv/T9-foraeldet-2026-05-17/README.md:36:`docs/coordination/T9-krav-og-data.md` (nyt) + mathias-afgoerelser-entry
docs/coordination/rapport-historik/2026-05-22-t9-supplement-2.md:105:| `docs/coordination/mathias-afgoerelser.md`                | 2026-05-21 (PR #67) + 2026-05-21 (PR #71)      | overholdt         | —         |
docs/coordination/rapport-historik/2026-05-22-t9-supplement-2.md:138:| `docs/coordination/mathias-afgoerelser.md` | nej            | ingen ændring (jf. plan — 2026-05-21-entries var allerede committed i PR #67 + PR #71)                             |
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V3-claude-ai-FEEDBACK.md:8:**Status:** Trækker tidligere `T9-V3-approved-claude-ai.md` tilbage. Min approval modsagde §5's låste fundament + mathias-afgoerelser pkt 7. Denne fil erstatter approvalen.
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V3-claude-ai-FEEDBACK.md:151:- mathias-afgoerelser 2026-05-16 pkt 7: cross-team-adgang via scope, ikke uden om
docs/coordination/rapport-historik/2026-05-18-t9.md:83:| Master-plan §1.13 "Konsekvens for permissions" omskrevet                                                                                                    | mathias-afgoerelser 2026-05-19               |
docs/coordination/rapport-historik/2026-05-18-t9.md:98:Codex' rå output ligger i Mathias' Codex CLI; Code's modtagelses-summary + Mathias' afgørelser pr. fund er dokumenteret i `docs/coordination/codex-reviews/2026-05-17-t9-runde-*.md` (placeholder-filer — Mathias paster rå output ved lejlighed).
docs/coordination/rapport-historik/2026-05-18-t9.md:114:T9 første forsøg (V1-V3) blev trukket tilbage 2026-05-17 efter afdæknings-session afslørede fundamentale misforståelser. Krav-dok + V4-V6-planer er på den nye T9-omstart-ramme (15 punkter, mathias-afgoerelser 2026-05-17). V4-V6 nævnte ikke RLS write-policy-strategi konkret — fix'et retroaktivt i T9-fundament-supplement. Se G050.
docs/coordination/rapport-historik/2026-05-18-t9.md:124:- **mathias-afgoerelser:**
docs/coordination/rapport-historik/2026-05-18-t9.md:131:- **Codex-reviews:** Placeholder-filer for 4 runder oprettet i `docs/coordination/codex-reviews/2026-05-17-t9-runde-1.md` etc.
docs/coordination/rapport-historik/2026-05-18-t9.md:140:3. Eventuel paste af rå Codex-output til placeholder-filer i `docs/coordination/codex-reviews/`
docs/coordination/rapport-historik/2026-06-05-gov-3a-ci-blockers.md:49:**G063** (rejst ved merge, Step 5-note): sporer den midlertidige `v4-slettede-docs`-allowlist i `governance-check.mjs` → fjernes når gov-6 folder dir'en. (Note: §-sektions-ref-validering uden for governance-check-scope — uændret fra gov-2.)
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-plan-V3.md:23:- **Claude.ai kosmetisk 1 — Princip 8-reference upræcis:** Fjernet fra Fire-dokument-konsultations-tabel (princip 8 handler om person-entitets-unikhed, ikke team-tilknytnings-unikhed). Krav-dok pkt 7 + mathias-afgoerelser pkt 7 er den korrekte kilde.
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-plan-V3.md:70:Per mathias-afgoerelser 2026-05-16 punkt 6 — samme mønster som roller fra trin 5. Sletning bryder reference-integritet og historik; is_active=false signalerer "ikke i brug, må ikke vælges til nye tilknytninger" mens row + audit-spor bevares. Triggers håndhæver at nye tilknytninger ikke kan pege på is_active=false.
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-plan-V3.md:114:- **Ejerskabs-kæde Cph Sales → afdelinger → teams → relationer (mathias-afgoerelser pkt 1) →** `org_units` parent_id-hierarki + `teams.org_unit_id` FK
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-plan-V3.md:179:Inkrementel trigger sparer rows-omtræk på UPDATE, men kompleksiteten er asymmetrisk: at finde "kun de berørte (ancestor, descendant)-relationer" kræver to lookups (gammel-subtree og ny-subtree) og diff-logik. Org-mutationer er sjældne (mathias-afgoerelser pkt 2; master-plan §1.7 "Org-mutationer er sjældne; trigger-omkostning irrelevant"). Kompleksitet uden gevinst.
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-plan-V3.md:221:Krav-dok ekspliciterer client-team-ejerskab som T9-leverance. Udskydning brydet krav-dok-kontrakten. Også: T9 inkluderer mathias-afgoerelser pkt 4 (klient kan aldrig dræbe team) og pkt 5 (klient ejer data) — disse skal være modelleret strukturelt i T9 selvom de først tages aktivt i brug fra trin 10+.
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-plan-V3.md:407:- **Hvad:** Tabel `core_identity.teams(id, name, org_unit_id, is_active, created_at, updated_at)` med FK til org_units (ON DELETE RESTRICT — mathias-afgoerelser pkt 4 implicit); FORCE RLS; SELECT `using (true)`; INSERT/UPDATE/DELETE via RPC; audit-trigger; trigger der blokerer INSERT/UPDATE hvis org_unit.is_active=false; RPC `team_upsert` (manage). **NB:** `team_deactivate` flyttet til Step 5 fordi den skal lukke åbne `employee_team_assignments` der først eksisterer fra Step 4 (jf. V2-re-ordering — Codex KRITISK fund 2)
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-plan-V3.md:573:- `docs/coordination/mathias-afgoerelser.md` → ingen ny entry forventet (T9 implementerer eksisterende rammebeslutninger). Hvis benchmark-SLA viser sig at kræve justering: ny entry "T9-benchmark-SLA justeret pga CI-runner-varians" med G-nummer som plan-reference
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-plan-V3.md:596:| `docs/strategi/vision-og-principper.md`    | ja          | Princip 2 (rettigheder i UI — scope-helpers og role_page_permissions.scope-feltet aktiveres med subtree); Princip 3 (sammenkobling eksplicit — FK på parent_id, org_unit_id, team_id, employee_id; client_id på allowlist med plan til trin 10); Princip 6 (audit på alt der ændrer data — alle T9-tabeller har audit-trigger; closure exempt via udvidet rettelse-23-mønster — kategori-udvidelse flagget under Valg 3); Princip 9 (status-modeller bevarer historik — is_active-flag erstatter sletning; versioneret tilknytning med from_date/to_date bevarer historik). **Note V2:** "én medarbejder i ét team ad gangen" (krav-dok pkt 7) er IKKE afledt af vision-princip 8 — princip 8 handler om person-entitets-unikhed på tværs af eksterne systemer (identitets-master i §1.7), ikke om team-tilknytnings-unikhed. Korrekt kilde: mathias-afgoerelser pkt 7. Reference rettet per Claude.ai V1 finding 1                                                                                                                                               | nej                                                                                                                                      |
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-plan-V3.md:598:| `docs/coordination/mathias-afgoerelser.md` | ja          | 2026-05-16 Forretningssandhed (alle 9 punkter mappet til konkrete plan-elementer — se Mathias' afgørelser-sektion ovenfor); 2026-05-15 §4 trin 9 pauset (forudsætninger opfyldt iht. krav-dok status-sektion); 2026-05-16 Tx-rollback default mønster (T9-tests + benchmark bruger BEGIN/ROLLBACK); 2026-05-16 Oprydnings-disciplin (denne plan har eksplicit Oprydnings-strategi-sektion); 2026-05-16 Fire-dokument-disciplin (denne plan har Fire-dokument-konsultation-sektion); 2026-05-15 Plan-leverance er kontrakt (alle 10 tekniske valg adresseret med konkret anbefaling + begrundelse); 2026-05-16 Master-plan sandheds-audit (klassifikations-tal-inkonsistens lukkes i Step 10; FK-coverage CI-blocker 19 håndhæves)                                                                                                                                                                                                                                                                                                                                 | nej                                                                                                                                      |
docs/claude-ai/SKILL.md:27:- `docs/strategi/disciplin.md` — V5-disciplin (din rolle i §9.1, krav-dok-skabelon i §10.1, slut-rapport-skabelon i §10.3)
docs/coordination/rapport-historik/2026-05-21-trin-10.md:61:| KRITISK        | Build-runde 1+2 fund (RLS-policy + permission-seed) | 1-2  | LØS-konsensus                           | `docs/coordination/codex-reviews/...-runde-1/2.md`              |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:62:| WORKAROUND     | T10.13b legacy-seed (post-build M1-test compat)     | 3    | Mathias-gate → refactor til grant-model | `docs/coordination/codex-reviews/2026-05-21-trin-10-runde-3.md` |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:116:| `docs/coordination/mathias-afgoerelser.md`        | 5 afgørelser 2026-05-20      | overholdt         | nej (2026-05-21 build-godkendelser dokumenteret i review-/slut-rapport, ikke løftet til ramme-entries) |
docs/coordination/rapport-historik/2026-05-21-trin-10.md:148:| `docs/coordination/mathias-afgoerelser.md` | nej            | ingen ændring; relevante ramme-beslutninger lå allerede i 2026-05-20-entries; 2026-05-21 build-godkendelser dokumenteret i review-/slut-rapport |
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V2-approved-claude-ai.md:28:Code har fjernet princip 8-reference fra vision-rækken i Fire-dokument-konsultations-tabellen. V2 tilføjer eksplicit note: "én medarbejder i ét team ad gangen (krav-dok pkt 7) er IKKE afledt af vision-princip 8 — princip 8 handler om person-entitets-unikhed på tværs af eksterne systemer (identitets-master i §1.7), ikke om team-tilknytnings-unikhed. Korrekt kilde: mathias-afgoerelser pkt 7. Reference rettet per Claude.ai V1 finding 1".
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V2-approved-claude-ai.md:76:**Mathias-afgoerelser pkt 3 konsistens:** team_deactivate er den dedikerede RPC der "lukker alle åbne employee_team_assignments via dedikeret UPDATE" — det matcher mathias-afgoerelser pkt 3 ordret: "Når team ophører, forbliver medarbejderne ansatte uden team-tilknytning (ikke fyret, bare team-løse)". RPC implementerer denne forretnings-regel teknisk.
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V2-approved-claude-ai.md:90:**Princip 2 + mathias-afgoerelser pkt 7 konsistens:** Employee-data tilgås via subtree (FM-chef ser alle employees i sin afdeling); assignment-data tilgås via subtree (FM-chef ser alle assignments). Konsistent forretnings-model: "cross-team-adgang via rolle-scope, ikke via flere tilknytninger" (mathias-afgoerelser pkt 7).
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V2-approved-claude-ai.md:100:Alle 19 afgørelser fra krav-dok stadig honoreret 1:1. Alle 9 forretningssandheder fra mathias-afgoerelser 2026-05-16 entry stadig mappet til konkrete plan-elementer. V2's helper-split og step-re-ordering ændrer ikke noget materielt i forretnings-mapping — kun teknisk implementation.
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V2-approved-claude-ai.md:110:- **Claude.ai V1 KOSMETISK 1** (princip 8-reference) — fjernet og rettet til mathias-afgoerelser pkt 7.
docs/teknisk/teknisk-gaeld.md:27:### [G063] LAV — midlertidig governance-check-allowlist for v4-slettede-docs
docs/teknisk/teknisk-gaeld.md:29:- **Beskrivelse:** `scripts/governance-check.mjs` `MISSING_PATH_ALLOWLIST` har en entry for `docs/coordination/v4-slettede-docs` (klasse `scope-excluded-local`). Tilføjet i gov-docs-housekeeping så clean-checkout `governance:check` er grøn, mens dir'en stadig ligger untracked og afventer fold i gov-6.
docs/teknisk/teknisk-gaeld.md:32:- **Skal løses:** Når **gov-6** folder `docs/coordination/v4-slettede-docs/` til git-history → **fjern allowlist-entryen igen**. Ejer: Code (i gov-6). Gov-6-krav-dok §6 dækker selve foldningen; denne G sporer allowlist-oprydningen.
docs/coordination/gov-2-vagt-plan.md:29:**Fil-scope (eksplicit):** `docs/**/*.md` MINUS `docs/coordination/arkiv/**`, `docs/coordination/v4-slettede-docs/**`, `docs/coordination/rapport-historik/**`. Plus `.github/workflows/*.yml` for §-ref-checks (codex-notify).
docs/coordination/rapport-historik/2026-05-19-t9-supplement.md:49:| T9-supplement plan-arkiv                                               | leveret | Codex-reviews + plan-feedback committet i build-PR (`docs/coordination/codex-reviews/2026-05-19-t9-supplement-runde-{1,2,3}.md`).                                                                                                                    |
docs/coordination/rapport-historik/2026-05-19-t9-supplement.md:126:| `docs/coordination/mathias-afgoerelser.md`        | 2026-05-18 (master-plan §1.7-opdatering) + 2026-05-19 (compliance-ansvarlige) + alle T9-supplement Mathias-afgørelser | overholdt         | nej       |
docs/coordination/rapport-historik/2026-05-19-t9-supplement.md:155:- `docs/coordination/codex-reviews/`: 3 nye review-filer arkiveret (runde 1/2/3).
docs/coordination/arkiv/t9-supplement-2-forretningsgang-konsolideret.md:16:eksplicitte ramme-entry ikke findes i `mathias-afgoerelser.md` — det er ÅBENT
docs/coordination/arkiv/t9-supplement-2-forretningsgang-konsolideret.md:45:- `mathias-afgoerelser.md` 2026-05-17 pkt 10 siger: "Superadmin = synlighed=Alt
docs/coordination/arkiv/t9-supplement-2-forretningsgang-konsolideret.md:47:- Ingen entry på 2026-05-21 i `mathias-afgoerelser.md` etablerer "superadmin
docs/coordination/arkiv/t9-supplement-2-forretningsgang-konsolideret.md:58:- Hvis ramme-afgørelse: skal den registreres som entry i `mathias-afgoerelser.md`
docs/coordination/arkiv/t9-supplement-2-forretningsgang-konsolideret.md:79:låste i mathias-afgoerelser 2026-05-17 + 2026-05-16. ÅBENT 1 og ÅBENT 2 er
docs/coordination/arkiv/t9-supplement-2-forretningsgang-konsolideret.md:84:`mathias-afgoerelser.md` bør oprettes som kilde før plan-fasen starter — så
docs/coordination/arkiv/t9-supplement-2-plan.md:168:Codex V1-review (`docs/coordination/codex-reviews/2026-05-21-t9-supplement-2-runde-1.md`) leverede 4 KRITISK + 1 MELLEM + 1 G-nummer-kandidat. Håndtering pr. fund:
docs/coordination/arkiv/t9-supplement-2-plan.md:1347:| `docs/coordination/mathias-afgoerelser.md` | nej         | Tre relevante entries er allerede committed (PR #67 + PR #71). Pakken anvender dem.                                                                       |
docs/coordination/arkiv/t9-supplement-2-plan.md:1371:| `docs/coordination/mathias-afgoerelser.md`          | ja          | RETNINGSGIVENDE  | 2026-05-21 superadmin-bypass-ramme + idempotency (PR #67); 2026-05-21 approve-disciplin pr. handling (PR #71); 2026-05-21 handlings-granularitet (PR #71); 2026-05-17 punkt 6 (strukturelle invarianter); 2026-05-17 punkt 12-13 (UI-rettigheder + pending-flow) | nej                |
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V3-approved-claude-ai.md:74:**Anbefalet handling:** G-nummer-kandidat: "Mathias formaliserer visibility-model for `employee_team_assignments` i mathias-afgoerelser efter T9-merge". Mathias har to veje:
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V3-approved-claude-ai.md:76:1. **Acceptere V3-valg:** entry i mathias-afgoerelser der formaliserer "team-medlemskab er strukturel metadata; visibility = using (true)". Princip-præcedens for fremtidige struktur-tabeller. Pre-cutover ingen produktions-konsekvens.
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V3-approved-claude-ai.md:98:4. Forretnings-dokument-konsistens på materielt niveau holdt: §1.1 (SECURITY INVOKER) bevaret, §1.7 (closure + helpers + versioneret tilknytning) implementeret 1:1, alle 9 mathias-afgoerelser-punkter stadig mappet, alle krav-dok-leverancer adresseret
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V3-approved-claude-ai.md:124:**Vigtigt for Mathias' qwerg-overvejelse:** approval gives med eksplicit G-nummer-eskalering. Hvis Mathias accepterer V3-visibility-valget, bør entry tilføjes til mathias-afgoerelser som del af T9-merge eller umiddelbart efter. Hvis Mathias ønsker stricter visibility, kan T9 bygges som V3 nu og denormaliseret cache indføres som separat pakke senere (ingen T9-rollback nødvendig).
docs/coordination/v4-slettede-docs/bygge-status.md:62:- ⏸ PAUSET — byggetrin pauset af Mathias (se mathias-afgoerelser)
docs/coordination/v4-slettede-docs/bygge-status.md:265:- §1.13 "Konsekvens for permissions": compliance-ansvarlige er konkrete medarbejdere valgt i UI — ikke rolle/permission (mathias-afgoerelser 2026-05-19)
docs/coordination/v4-slettede-docs/bygge-status.md:285:- Runde 2 (verifikation): T9-omstart-rammen (mathias-afgoerelser 2026-05-17) etableret som korrekt fundament
docs/coordination/arkiv/T9-krav-og-data.md:346:| 1   | Copenhagen Sales → afdelinger → teams → relationer (ejerskabs-kæde)                                               | mathias-afgoerelser 2026-05-16 pkt 1                                 |
docs/coordination/arkiv/T9-krav-og-data.md:347:| 2   | Afdelinger ændres sjældent; historik bevares                                                                      | mathias-afgoerelser 2026-05-16 pkt 2                                 |
docs/coordination/arkiv/T9-krav-og-data.md:348:| 3   | Team kan ophøre; medarbejdere bliver knude-løse                                                                   | mathias-afgoerelser 2026-05-16 pkt 3 + afdæknings-session 2026-05-17 |
docs/coordination/arkiv/T9-krav-og-data.md:349:| 4   | Klient kan aldrig dræbe et team                                                                                   | mathias-afgoerelser 2026-05-16 pkt 4                                 |
docs/coordination/arkiv/T9-krav-og-data.md:350:| 5   | Klient ejer sin egen data; følger klienten ved team-skift; team bevarer historik                                  | mathias-afgoerelser 2026-05-16 pkt 5                                 |
docs/coordination/arkiv/T9-krav-og-data.md:351:| 6   | Aktiv/inaktiv-flag på knuder for synlighed                                                                        | mathias-afgoerelser 2026-05-16 pkt 6                                 |
docs/coordination/arkiv/T9-krav-og-data.md:352:| 7   | Én medarbejder på én knude ad gangen; også stab                                                                   | mathias-afgoerelser 2026-05-16 pkt 7                                 |
docs/coordination/arkiv/T9-krav-og-data.md:353:| 8   | Cross-team-adgang løses via rolle med synlighed, ikke via flere placeringer                                       | mathias-afgoerelser 2026-05-16 pkt 7 (anden del)                     |
docs/coordination/arkiv/T9-krav-og-data.md:354:| 9   | Ingen hardkodet horizon for migration; manuel eksekvering                                                         | mathias-afgoerelser 2026-05-16 pkt 8                                 |
docs/coordination/arkiv/T9-krav-og-data.md:355:| 10  | Teams/afdelinger anonymiseres ikke                                                                                | mathias-afgoerelser 2026-05-16 pkt 9                                 |
docs/coordination/arkiv/T9-krav-og-data.md:362:| 17  | Superadmin = synlighed=Alt på alt; eneste hardkodede rolle                                                        | mathias-afgoerelser 2026-05-11 + afdæknings-session 2026-05-17       |
docs/coordination/arkiv/T9-krav-og-data.md:374:| 29  | Tx-rollback default mønster for DB-tests                                                                          | mathias-afgoerelser 2026-05-16                                       |
docs/coordination/arkiv/T9-krav-og-data.md:375:| 30  | Plan-leverance er kontrakt                                                                                        | mathias-afgoerelser 2026-05-15                                       |
docs/coordination/arkiv/T9-krav-og-data.md:376:| 31  | Fire-dokument-disciplin obligatorisk i plan                                                                       | mathias-afgoerelser 2026-05-16                                       |
docs/coordination/arkiv/T9-krav-og-data.md:377:| 32  | Oprydnings-strategi obligatorisk i plan                                                                           | mathias-afgoerelser 2026-05-16                                       |
docs/coordination/arkiv/T9-krav-og-data.md:387:| `docs/coordination/mathias-afgoerelser.md` | 2026-05-11 (vision + superadmin + PageKey som data); 2026-05-15 (plan-leverance som kontrakt); 2026-05-16 (9-punkts forretningssandhed + fire-dokument-disciplin + oprydnings-disciplin); 2026-05-17 afdæknings-session (skal tilføjes som ny entry samtidig med dette krav-dok)                                                          |
docs/coordination/arkiv/T9-krav-og-data.md:409:- `docs/coordination/mathias-afgoerelser.md` — afdæknings-session 2026-05-17 entry tilføjes (Mathias-handling)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:44:MANGLENDE-EKSISTERENDE-BEVARELSE.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:150:For HVER eksisterende funktion/policy/tabel der ændres: plan inkluderer NUVÆRENDE body 1:1 med file:linje + markerer DIFF eksplicit (hvad fjernes/tilføjes, hvilke gates/kommentarer/kolonner/audit-spor bevares) + migration starter med diff-summary. Tab af gate/kommentar/kolonne uden begrundelse = `MANGLENDE-EKSISTERENDE-BEVARELSE` (KRITISK).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:199:**Slettes ved pakke-luk:** `<pakke>-status.md` · alle `plan-feedback/<pakke>-V<n>-*` · alle `codex-reviews/<pakke>-runde-*` · afgjorte `mathias-gate/<pakke>-*` · plan-versioner V1..Vn (git-history bevarer sporet).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:210:| **MANGLENDE-EKSISTERENDE-BEVARELSE** | KRITISK-undertype: mister gate/kommentar/kolonne fra eksisterende body uden begrundelse                                                          |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:217:Hver severity bærer funktion — de kollapses ikke. (MANGLENDE-EKSISTERENDE-BEVARELSE binder patch-først; OPGRADERING muliggør approval+forslag samtidig.)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:708:- Reviews: codex-reviews/2026-06-10-gov-docs-renhed-runde-{1,2,3,4}.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:793:  v4-slettede-docs og rapport-historik):
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:798:  | coordination/mathias-afgoerelser.md    | claude-ai-prompt.sh + data-grundlag.sh (kun scripts)                                                       |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:799:  | overvaagning/claude-ai-overvaagning.md | claude-ai-prompt.sh (kun script)                                                                           |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:803:  | skabeloner/rapport-skabelon.md         | ingen i scannet scope (kun rapport-historik/README.md — scope-ekskluderet, derfor overlevede den døde ref) |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:806:  | coordination/codex-reviews             | codex-review.sh                                                                                            |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:813:| `claude-ai-prompt.sh` | **SLET**   | Indlejrer fjernet fire-dok-ramme + V5.3-step-numre; peger på slettede mathias-afgoerelser.md + claude-ai-overvaagning.md. Substansen overhalet af SKILL.md-i-repo + Filesystem-MCP                                                 |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:829:`mathias-afgoerelser.md`, `claude-ai-overvaagning.md`, `rapport-skabelon.md`
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:838:  `<!-- aktiv-pakke: <navn> fase: plan|build|rapport -->` eller
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:839:  `<!-- aktiv-pakke: ingen -->`. Manglende markør = violation (tilstand skal
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:861:Codex-review når governance-doc er berørt; felt i slut-rapport-skabelonen
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:896:| 3 — mekaniske værn   | allowlist-split + prune · kæde-tjek · aktiv-pakke-markør · 7 selftest-cases (appendix B.2–B.4) | batch 1+2   | Mellem. Selftest beviser begge retninger                                                  |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:915:| aktiv-plan.md              | ja      | pakke-status + aktiv-pakke-markør (→ `ingen` ved pakke-luk)                     |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:925:gov-6 arkiv-fold (G063 + v4-slettede-docs) · P3-spor · semantisk
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1034:   `claude-ai-prompt.sh` (peger på slettede `mathias-afgoerelser.md` +
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1035:   `overvaagning/claude-ai-overvaagning.md`; indlejrer fjernet fire-dok-ramme),
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1054:   slettet `rapport-skabelon.md`; `disciplin.md §2/§6.2` peger på H020-tombstone
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1094:- **gov-6 (arkiv-fold)** — arkiv → git-history + `v4-slettede-docs/` (untracked) +
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1174:00c1ebd (HEAD -> claude/gov-docs-renhed-build, origin/claude/gov-docs-renhed-build) gov-docs-renhed build batch 3: allowlist-split (klasse-skel + deprecated-flugtvej) + structural-chain (markør, krydspeg, Formål-immutabilitet mekanisk, fase:rapport) + danske bogstaver i sti-regex + 9 selftest-cases + aktiv-pakke-markør
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1193: docs/coordination/v4-slettede-docs/INDEX.md        |  47 ++
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1194: .../v4-slettede-docs/T9-supplement-skitse.md       |  82 +++
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1197: .../v4-slettede-docs/arbejds-disciplin.md          | 784 +++++++++++++++++++++
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1199: docs/coordination/v4-slettede-docs/bygge-status.md | 365 ++++++++++
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1200: .../v4-slettede-docs/lag-e-beregningsmotor-krav.md |  79 +++
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1202: .../mathias-afgoerelser--slettet-version.md        | 655 +++++++++++++++++
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1203: .../overvaagning--claude-ai-overvaagning.md        | 282 ++++++++
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1207: .../v4-slettede-docs/skabelon--plan-skabelon.md    | 217 ++++++
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1208: .../v4-slettede-docs/skabelon--rapport-skabelon.md | 172 +++++
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1226:00c1ebd gov-docs-renhed build batch 3: allowlist-split (klasse-skel + deprecated-flugtvej) + structural-chain (markør, krydspeg, Formål-immutabilitet mekanisk, fase:rapport) + danske bogstaver i sti-regex + 9 selftest-cases + aktiv-pakke-markør
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1258:-    path: "docs/coordination/overvaagning/claude-ai-overvaagning.md",
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1275:     path: "docs/skabeloner/rapport-skabelon.md",
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1281:-    path: "docs/coordination/mathias-afgoerelser.md",
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1284:-    grund: "V4-slettet (arkiv/mathias-afgoerelser-historik.md)",
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1356:+    const m = line.trim().match(/^<!--\s*aktiv-pakke:\s*(\S+)(?:\s+fase:\s*(plan|build|rapport))?\s*-->$/);
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1362:+      "aktiv-plan.md mangler standalone-markør <!-- aktiv-pakke: <navn|ingen> [fase: plan|build|rapport] -->",
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1424:+  appendFileSync(join(d, "docs/coordination/aktiv-plan.md"), `\n<!-- aktiv-pakke: testpakke fase: ${fase} -->\n`);
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1512:A	docs/coordination/v4-slettede-docs/INDEX.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1513:A	docs/coordination/v4-slettede-docs/T9-supplement-skitse.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1514:A	docs/coordination/v4-slettede-docs/afdaekning--g043-g044-data-code-2026-05-16.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1515:A	docs/coordination/v4-slettede-docs/afdaekning--g043-g044-data-codex-2026-05-16.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1516:A	docs/coordination/v4-slettede-docs/arbejds-disciplin.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1517:A	docs/coordination/v4-slettede-docs/arbejdsmetode-og-repo-struktur.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1518:A	docs/coordination/v4-slettede-docs/bygge-status.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1519:A	docs/coordination/v4-slettede-docs/lag-e-beregningsmotor-krav.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1520:A	docs/coordination/v4-slettede-docs/lag-e-tidsregistrering-krav.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1521:A	docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1522:A	docs/coordination/v4-slettede-docs/overvaagning--claude-ai-overvaagning.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1523:A	docs/coordination/v4-slettede-docs/overvaagning--code-overvaagning.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1524:A	docs/coordination/v4-slettede-docs/overvaagning--codex-overvaagning.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1525:A	docs/coordination/v4-slettede-docs/skabelon--codex-review-prompt.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1526:A	docs/coordination/v4-slettede-docs/skabelon--plan-skabelon.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1527:A	docs/coordination/v4-slettede-docs/skabelon--rapport-skabelon.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1528:A	docs/coordination/v4-slettede-docs/skabelon--workflow-skabelon.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1576: # Output: docs/coordination/codex-reviews/<dato>-<pakke>-runde-<N>.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1795:+MANGLENDE-EKSISTERENDE-BEVARELSE.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1929:Der er et klart diff-signal: builden tilføjer `docs/coordination/v4-slettede-docs/` med mange filer, selv om Plan V4 eksplicit placerede gov-6 arkiv-fold uden for scope. Jeg verificerer linjerne og kører de relevante checks, så severity ikke bygger på stat alene.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1943:   183	| 3 — mekaniske værn   | allowlist-split + prune · kæde-tjek · aktiv-pakke-markør · 7 selftest-cases (appendix B.2–B.4) | batch 1+2   | Mellem. Selftest beviser begge retninger                                                  |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1962:   202	| aktiv-plan.md              | ja      | pakke-status + aktiv-pakke-markør (→ `ingen` ved pakke-luk)                     |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1972:   212	gov-6 arkiv-fold (G063 + v4-slettede-docs) · P3-spor · semantisk
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2109:   119	- **gov-6 (arkiv-fold)** — arkiv → git-history + `v4-slettede-docs/` (untracked) +
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2123:/bin/bash -lc 'git diff --name-only 4fe5164..HEAD -- docs/coordination/v4-slettede-docs' in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2147:    23	- Reviews: codex-reviews/2026-06-10-gov-docs-renhed-runde-{1,2,3,4}.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2153:docs/coordination/v4-slettede-docs/INDEX.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2154:docs/coordination/v4-slettede-docs/T9-supplement-skitse.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2155:docs/coordination/v4-slettede-docs/afdaekning--g043-g044-data-code-2026-05-16.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2156:docs/coordination/v4-slettede-docs/afdaekning--g043-g044-data-codex-2026-05-16.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2157:docs/coordination/v4-slettede-docs/arbejds-disciplin.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2158:docs/coordination/v4-slettede-docs/arbejdsmetode-og-repo-struktur.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2159:docs/coordination/v4-slettede-docs/bygge-status.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2160:docs/coordination/v4-slettede-docs/lag-e-beregningsmotor-krav.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2161:docs/coordination/v4-slettede-docs/lag-e-tidsregistrering-krav.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2162:docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2163:docs/coordination/v4-slettede-docs/overvaagning--claude-ai-overvaagning.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2164:docs/coordination/v4-slettede-docs/overvaagning--code-overvaagning.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2165:docs/coordination/v4-slettede-docs/overvaagning--codex-overvaagning.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2166:docs/coordination/v4-slettede-docs/skabelon--codex-review-prompt.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2167:docs/coordination/v4-slettede-docs/skabelon--plan-skabelon.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2168:docs/coordination/v4-slettede-docs/skabelon--rapport-skabelon.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2169:docs/coordination/v4-slettede-docs/skabelon--workflow-skabelon.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2172:/bin/bash -lc 'find docs/coordination/v4-slettede-docs -maxdepth 1 -type f | sort' in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2174:docs/coordination/v4-slettede-docs/INDEX.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2175:docs/coordination/v4-slettede-docs/T9-supplement-skitse.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2176:docs/coordination/v4-slettede-docs/afdaekning--g043-g044-data-code-2026-05-16.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2177:docs/coordination/v4-slettede-docs/afdaekning--g043-g044-data-codex-2026-05-16.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2178:docs/coordination/v4-slettede-docs/arbejds-disciplin.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2179:docs/coordination/v4-slettede-docs/arbejdsmetode-og-repo-struktur.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2180:docs/coordination/v4-slettede-docs/bygge-status.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2181:docs/coordination/v4-slettede-docs/lag-e-beregningsmotor-krav.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2182:docs/coordination/v4-slettede-docs/lag-e-tidsregistrering-krav.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2183:docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2184:docs/coordination/v4-slettede-docs/overvaagning--claude-ai-overvaagning.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2185:docs/coordination/v4-slettede-docs/overvaagning--code-overvaagning.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2186:docs/coordination/v4-slettede-docs/overvaagning--codex-overvaagning.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2187:docs/coordination/v4-slettede-docs/skabelon--codex-review-prompt.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2188:docs/coordination/v4-slettede-docs/skabelon--plan-skabelon.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2189:docs/coordination/v4-slettede-docs/skabelon--rapport-skabelon.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2190:docs/coordination/v4-slettede-docs/skabelon--workflow-skabelon.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2193:Plan-afvigelsen er bekræftet på linjeniveau: krav-dok og plan siger `v4-slettede-docs/` er gov-6/out-of-scope, mens builden tilføjer den nu. Jeg kører nu `governance:check`, selftest og scriptets parser-test for at se om der er yderligere blokeringer i selve værnene.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2274:-**Aktuel:** ingen pakke under arbejde — næste i rest-sekvens: gov-4-branch-protection (gov-3 CI-blockers fuldt færdig). **Merged:** gov-1 (paritet, 2026-06-04) · gov-2 (vagt, PR #93) · gov-docs-housekeeping (krav-dok-familie, PR #94) · **gov-3a** (4 §3-checks #4/#7/#16/#17 + zone-§3-fjernelse, PR #95, main @ c32097c; ikke-required indtil gov-4) · **gov-3b-1** (#19 FK-dækning + #6 indeks-pr-policy, PR #96, main @ a88d217; 23→25 fitness-checks; 0 SQL-/indeks-migrations; 3 sale-FK'er `FK_PENDING` → Trin 14 [H025]) · **gov-3b-2** (#10 SECDEF-markør-disciplin, PR #101, main @ `165833c`; 25→26 fitness-checks; 0 migrations; #18 udskilt → gov-3b-3 + [G065]) · **gov-3b-3a** (#18 del 1: §1.1:160-reconcile + 9 `permission_*` INVOKER→SECDEF, PR #103, main @ `c846105`; 4 migrations live-applikeret; G065 stadig åben → 3b) · **gov-3b-3b** (#18 del 2: sidste 5 INVOKER→SECDEF + REVOKE authenticated-write + #18-check, PR #105, main @ `7be6511`; 4 migrations live; **[G065] LØST**; gov-3 CI-blockers fuldt færdig). Rest-sekvens: gov-4-branch-protection → gov-5-automation → gov-6-arkiv-fold. Åbne G-numre: G061 (comment-parity, før gov-4), G062 (recurring types-drift), G063 (v4-slettede-docs-allowlist → gov-6). (G065 LØST i gov-3b-3b.) Åbne H: [H025] (Trin 14: sale-FK'er + orphan-cleanup). Krav-dok (ét dok over de 6): `docs/coordination/governance-vagt-krav-og-data.md` ✓.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2275:+<!-- aktiv-pakke: gov-docs-renhed fase: build -->
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2277:+**Aktuel:** **gov-docs-renhed** under build — plan: `docs/coordination/gov-docs-renhed-plan.md` (V4, Codex-approved runde 4 m. §8.1-SVAR: INGEN-MODSIGELSE; qwerg 2026-06-10). Derefter i rest-sekvens: gov-4-branch-protection (gov-3 CI-blockers fuldt færdig). **Merged:** gov-1 (paritet, 2026-06-04) · gov-2 (vagt, PR #93) · gov-docs-housekeeping (krav-dok-familie, PR #94) · **gov-3a** (4 §3-checks #4/#7/#16/#17 + zone-§3-fjernelse, PR #95, main @ c32097c; ikke-required indtil gov-4) · **gov-3b-1** (#19 FK-dækning + #6 indeks-pr-policy, PR #96, main @ a88d217; 23→25 fitness-checks; 0 SQL-/indeks-migrations; 3 sale-FK'er `FK_PENDING` → Trin 14 [H025]) · **gov-3b-2** (#10 SECDEF-markør-disciplin, PR #101, main @ `165833c`; 25→26 fitness-checks; 0 migrations; #18 udskilt → gov-3b-3 + [G065]) · **gov-3b-3a** (#18 del 1: §1.1:160-reconcile + 9 `permission_*` INVOKER→SECDEF, PR #103, main @ `c846105`; 4 migrations live-applikeret; G065 stadig åben → 3b) · **gov-3b-3b** (#18 del 2: sidste 5 INVOKER→SECDEF + REVOKE authenticated-write + #18-check, PR #105, main @ `7be6511`; 4 migrations live; **[G065] LØST**; gov-3 CI-blockers fuldt færdig). Rest-sekvens: gov-4-branch-protection → gov-5-automation → gov-6-arkiv-fold. Åbne G-numre: G061 (comment-parity, før gov-4), G062 (recurring types-drift), G063 (v4-slettede-docs-allowlist → gov-6). (G065 LØST i gov-3b-3b.) Åbne H: [H025] (Trin 14: sale-FK'er + orphan-cleanup). Krav-dok (ét dok over de 6): `docs/coordination/governance-vagt-krav-og-data.md` ✓.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2289:-Hver rapport følger `docs/skabeloner/rapport-skabelon.md`.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2429: Historiske ramme-niveau-beslutninger fra V3 og tidligere lever i `docs/coordination/arkiv/mathias-afgoerelser-historik.md` som læsbar reference (ikke aktiv kilde).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2518:  "docs/coordination/v4-slettede-docs",
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2559:    path: "docs/skabeloner/rapport-skabelon.md",
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2574:    path: "docs/coordination/codex-reviews",
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2579:    path: "docs/coordination/v4-slettede-docs",
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2779:    const m = line.trim().match(/^<!--\s*aktiv-pakke:\s*(\S+)(?:\s+fase:\s*(plan|build|rapport))?\s*-->$/);
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2785:      "aktiv-plan.md mangler standalone-markør <!-- aktiv-pakke: <navn|ingen> [fase: plan|build|rapport] -->",
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2916:  appendFileSync(join(d, "docs/coordination/aktiv-plan.md"), `\n<!-- aktiv-pakke: testpakke fase: ${fase} -->\n`);
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3069:/bin/bash -lc 'rg -n "claude-ai-prompt|data-grundlag|krav-afklar|codex-review-prompt|mathias-afgoerelser|claude-ai-overvaagning|v4-slettede-docs|rapport-skabelon" docs scripts CLAUDE.md package.json .github || true' in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3071:docs/strategi/stork-2-0-master-plan.md:42:Historiske ramme-niveau-beslutninger fra V3 og tidligere lever i `docs/coordination/arkiv/mathias-afgoerelser-historik.md` som læsbar reference (ikke aktiv kilde).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3072:docs/strategi/stork-2-0-master-plan.md:353:Reflekterer T9-omstart-rammen fra 2026-05-17 (mathias-afgoerelser, 15 punkter). Rettelse 35 (2026-05-18) erstatter pre-omsadlings-tekst der modsagde rammen.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3073:docs/strategi/stork-2-0-master-plan.md:484:- Én klient-entitet med fælles kolonner (id, navn, is_active, logo (bytea+content_type+filename), timestamps). Klient-specifikke værdier i jsonb felt-bag. Klient anonymiseres ikke (mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme")
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3074:docs/strategi/stork-2-0-master-plan.md:488:- Match-mekanik udskudt til data-indgang-pakke (mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering: migration og match-rolle ud")
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3075:docs/strategi/stork-2-0-master-plan.md:1519:| 10   | Klient-skabelon (core_identity.clients + client_field_definitions + logo (bytea) + is_active + FK fra client_node_placements + has_permission-RPCs + employee-id-baseret superadmin-bypass i apply-context). Migration udskudt (mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering")                                                                                                                                            | core_identity                                                                 |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3076:docs/strategi/stork-2-0-master-plan.md:2004:| 33  | Master-plan sandheds-audit (Claude.ai 2026-05-16): §5 udvidet med to bullets ("Sammenkobling eksplicit i datamodellen" + "Konfiguration har livscyklus") for at reflektere vision-meta-princip 3 og vision-operationel-princip 5. §3 udvidet med CI-blocker 19 (FK-coverage) for at håndhæve sammenkoblings-princippet teknisk. §0 fik ny "Strategiske retning-skift"-sektion der peger på mathias-afgoerelser som kilde. Konsekvens: master-plan reflekterer nu alle 3 meta-principper + alle 9 operationelle principper fra vision-dokumentet.                                                                                                                                                                                                                                                                                                                 |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3077:docs/strategi/stork-2-0-master-plan.md:2006:| 35  | T9-fundament-supplement (2026-05-18): §1.7 omskrevet til at matche T9-omstart-rammen (mathias-afgoerelser 2026-05-17, 15 punkter). Pre-omsadlings-tekst om 4-dim permission, scope=team, stab-rolle, `org_unit_closure`-navn og `is_compliance_officer()` fjernet som forkert fundament. Tre-niveau permission-model (Område → Page → Tab) + to akser ((kan_tilgå/kan_skrive) × visibility (Sig selv/Hiraki/Alt)) erstatter 4-dim. ÉT træ-anker, knude-løs medarbejder gyldig, klient-til-team-only-binding, fortrydelses-mekanisme. §1.1's session-var-pattern implementeret i T9-write-veje (migration `20260518100000_t9_fundament_supplement.sql`): INSERT/UPDATE-policies med `stork.t9_write_authorized`-check på 6 write-tabeller; 11 write-RPCs sætter session-var efter has_permission-check. H011's §1.7-modsigelse (identificeret 2026-05-15) lukkes. |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3078:docs/strategi/stork-2-0-master-plan.md:2007:| 36  | Trin 10 (2026-05-21): §1.8 omskrevet til at matche faktisk klient-skabelon-implementation. Pre-fundament-tekst om `anonymized_at`-kolonne, match-rolle-koncept + crm_match_id-rolle, pr-klient felt-definitions-registry, dispatching i `audit_filter_values`-special-case fjernet som scope-justeret. Klient lever i `core_identity.clients` (T1 droppede D5's `public.clients`); is_active erstatter anonymized_at (krav-dok §2.5.1: ikke-anonymiseret); logo (bytea+content_type+filename) med PII-hashing i audit; client_field_definitions globalt registry; aktiv-check i client_node_place wrapper + \_apply_client_place med employee-id-baseret superadmin-bypass for cron-context. §4 trin 10-række rettet: migration + crm_match_id fjernet (mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering"). G057 + G058 registreret som teknisk gæld.   |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3079:docs/strategi/disciplin.md:352:### §10.3 Slut-rapport-skabelon
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3080:docs/claude-ai/SKILL.md:27:- `docs/strategi/disciplin.md` — V5-disciplin (din rolle i §9.1, krav-dok-skabelon i §10.1, slut-rapport-skabelon i §10.3)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3081:docs/teknisk/teknisk-gaeld.md:27:### [G063] LAV — midlertidig governance-check-allowlist for v4-slettede-docs
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3082:docs/teknisk/teknisk-gaeld.md:29:- **Beskrivelse:** `scripts/governance-check.mjs` `MISSING_PATH_ALLOWLIST` har en entry for `docs/coordination/v4-slettede-docs` (klasse `scope-excluded-local`). Tilføjet i gov-docs-housekeeping så clean-checkout `governance:check` er grøn, mens dir'en stadig ligger untracked og afventer fold i gov-6.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3083:docs/teknisk/teknisk-gaeld.md:32:- **Skal løses:** Når **gov-6** folder `docs/coordination/v4-slettede-docs/` til git-history → **fjern allowlist-entryen igen**. Ejer: Code (i gov-6). Gov-6-krav-dok §6 dækker selve foldningen; denne G sporer allowlist-oprydningen.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3087:docs/coordination/gov-docs-renhed-plan.md:80:  v4-slettede-docs og rapport-historik):
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3089:docs/coordination/gov-docs-renhed-plan.md:85:  | coordination/mathias-afgoerelser.md    | claude-ai-prompt.sh + data-grundlag.sh (kun scripts)                                                       |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3090:docs/coordination/gov-docs-renhed-plan.md:86:  | overvaagning/claude-ai-overvaagning.md | claude-ai-prompt.sh (kun script)                                                                           |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3092:docs/coordination/gov-docs-renhed-plan.md:90:  | skabeloner/rapport-skabelon.md         | ingen i scannet scope (kun rapport-historik/README.md — scope-ekskluderet, derfor overlevede den døde ref) |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3094:docs/coordination/gov-docs-renhed-plan.md:100:| `claude-ai-prompt.sh` | **SLET**   | Indlejrer fjernet fire-dok-ramme + V5.3-step-numre; peger på slettede mathias-afgoerelser.md + claude-ai-overvaagning.md. Substansen overhalet af SKILL.md-i-repo + Filesystem-MCP                                                 |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3097:docs/coordination/gov-docs-renhed-plan.md:116:`mathias-afgoerelser.md`, `claude-ai-overvaagning.md`, `rapport-skabelon.md`
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3098:docs/coordination/gov-docs-renhed-plan.md:148:Codex-review når governance-doc er berørt; felt i slut-rapport-skabelonen
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3099:docs/coordination/gov-docs-renhed-plan.md:212:gov-6 arkiv-fold (G063 + v4-slettede-docs) · P3-spor · semantisk
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3100:docs/coordination/gov-docs-renhed-plan.md:410:README:5 nuværende: `Hver rapport følger \`docs/skabeloner/rapport-skabelon.md\`.`Ny:`Hver rapport følger skabelonen i \`docs/strategi/disciplin.md\` §10.3.`
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3103:docs/coordination/gov-docs-renhed-plan.md:675:`mathias-afgoerelser.md`, `overvaagning/claude-ai-overvaagning.md`,
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3104:docs/coordination/gov-docs-renhed-plan.md:676:`skabeloner/rapport-skabelon.md`, jf. referent-tabellen). Øvrige 9 entries
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3105:scripts/governance-check.mjs:29:  "docs/coordination/v4-slettede-docs",
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3106:scripts/governance-check.mjs:70:    path: "docs/skabeloner/rapport-skabelon.md",
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3108:scripts/governance-check.mjs:90:    path: "docs/coordination/v4-slettede-docs",
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3110:docs/coordination/arkiv/I001-krav-og-data.md:95:Code argumenterer for det rette disciplin-niveau givet at slut-rapport-skabelonen allerede har struktureret vision-tjek.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3113:docs/coordination/arkiv/forretningsspoergsmaal-skabelon-UDGAAET-V2.md:1:> **UDGÅET 2026-05-20 ved V2-workflow.** Forretningsspørgsmål håndteres nu direkte i krav-dok-fasens chat mellem Claude.ai-forfatter og Mathias. Separat `<pakke>-forretningsspoergsmaal.md`-fil er ikke længere del af flowet. Bevaret som arkiv for historisk reference (jf. `mathias-afgoerelser.md` 2026-05-20 "Workflow-justering V2", punkt 2).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3114:docs/coordination/arkiv/forretningsspoergsmaal-skabelon-UDGAAET-V2.md:20:- **Pakker hvor forretnings-konteksten allerede er låst** i `docs/coordination/mathias-afgoerelser.md` med præcis nok detalje til at krav-dok kan skrives uden ekstra spørgsmål
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3115:docs/coordination/arkiv/forretningsspoergsmaal-skabelon-UDGAAET-V2.md:77:- Eksisterende `mathias-afgoerelser.md`-reference med konkret dato, ELLER
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3116:docs/coordination/arkiv/forretningsspoergsmaal-skabelon-UDGAAET-V2.md:109:- Identificere uklarhed mellem `mathias-afgoerelser.md` og pakke-scope
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3117:docs/coordination/arkiv/H024-V2-approved-claude-ai.md:45:Det er disciplin-læring, ikke plan-fejl: afdæknings-rapporter bør i fremtidige pakker krydstjekke FK-grafer mellem clean-target tabeller for at fange cluster-konsistens. Forslag til G-nummer-kandidat: "Afdæknings-rapport-skabelon udvides med FK-graf-tjek". Ikke H024-scope.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3118:docs/coordination/arkiv/rapport-historik-meta/2026-05-15-h010.md:36:| H010.3 plan-skabelon + rapport-skabelon                 | leveret            | `docs/skabeloner/{plan,rapport}-skabelon.md` — Formål-blockquote + lag-boundary-rapport-format ordret fra scope-dokumentet |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3119:docs/coordination/arkiv/rapport-historik-meta/2026-05-15-h010.md:38:| H010.5 mathias-afgoerelser.md                           | leveret            | 33 entries, 2 flagget [ikke verificeret] / ingen-commit-hash                                                               |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3122:docs/coordination/arkiv/rapport-historik-meta/2026-05-15-h010.md:75:5. **mathias-afgoerelser.md Entry "Problem 1-4"**
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3123:docs/coordination/arkiv/rapport-historik-meta/2026-05-15-h010.md:81:6. **mathias-afgoerelser.md Entry "Huskelisten ligger ikke i repo"**
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3124:docs/coordination/arkiv/rapport-historik-meta/2026-05-15-h010.md:98:  - **Én sandhed:** `mathias-afgoerelser.md` etablerer ÉN autoritativ kilde for låste afgørelser.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3125:docs/coordination/arkiv/rapport-historik-meta/2026-05-15-h010.md:134:  - Append-commit med "H010 committed"-entry i `mathias-afgoerelser.md` (følger denne rapport).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3128:docs/coordination/gov-2-vagt-plan.md:29:**Fil-scope (eksplicit):** `docs/**/*.md` MINUS `docs/coordination/arkiv/**`, `docs/coordination/v4-slettede-docs/**`, `docs/coordination/rapport-historik/**`. Plus `.github/workflows/*.yml` for §-ref-checks (codex-notify).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3129:docs/coordination/governance-vagt-krav-og-data.md:54:   (§4). Inkl. `v4-slettede-docs/` der stadig ligger untracked. _(disciplin §4)_
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3130:docs/coordination/arkiv/t9-supplement-2-forretningsgang-konsolideret.md:16:eksplicitte ramme-entry ikke findes i `mathias-afgoerelser.md` — det er ÅBENT
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3131:docs/coordination/arkiv/t9-supplement-2-forretningsgang-konsolideret.md:45:- `mathias-afgoerelser.md` 2026-05-17 pkt 10 siger: "Superadmin = synlighed=Alt
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3132:docs/coordination/arkiv/t9-supplement-2-forretningsgang-konsolideret.md:47:- Ingen entry på 2026-05-21 i `mathias-afgoerelser.md` etablerer "superadmin
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3133:docs/coordination/arkiv/t9-supplement-2-forretningsgang-konsolideret.md:58:- Hvis ramme-afgørelse: skal den registreres som entry i `mathias-afgoerelser.md`
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3134:docs/coordination/arkiv/t9-supplement-2-forretningsgang-konsolideret.md:79:låste i mathias-afgoerelser 2026-05-17 + 2026-05-16. ÅBENT 1 og ÅBENT 2 er
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3135:docs/coordination/arkiv/t9-supplement-2-forretningsgang-konsolideret.md:84:`mathias-afgoerelser.md` bør oprettes som kilde før plan-fasen starter — så
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3136:docs/coordination/arkiv/T9-V5-claude-ai.md:101:| `docs/coordination/mathias-afgoerelser.md` | **Indirekte konflikt.** 2026-05-17 pkt 13 (alle gældende-dato-ændringer følger fortrydelses-mekanisme) brudt fordi bypass kan materialisere change før gælder-dato. |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3137:docs/coordination/arkiv/mathias-afgoerelser-historik.md:147:- **Plan-reference:** Denne commit (clean-up af mathias-afgoerelser.md).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3138:docs/coordination/arkiv/mathias-afgoerelser-historik.md:151:- **Begrundelse:** Coordination-mappen vokser ukontrolleret med arbejds-artefakter fra afsluttede pakker; relaterede dokumenter glider ud af synkron uden eksplicit ansvar. Løsning: hver plan skal indeholde "Oprydnings- og opdaterings-strategi"-sektion (obligatorisk; manglende sektion = KRITISK feedback fra reviewers). Code udfører oprydning som DEL af build, ikke separat trin. Slut-rapport verificerer udførelse i ny "Oprydning + opdatering udført"-sektion. Ankret 4 steder: plan-skabelon, rapport-skabelon, Code's overvågnings-prompt (qwerg-fasen), arbejdsmetode-dokument.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3139:docs/coordination/arkiv/mathias-afgoerelser-historik.md:156:- **Begrundelse:** Audit af master-plan mod vision-dokumentet afslørede to gaps: (a) Vision-meta-princip 3 "Sammenkobling eksplicit" havde ingen CI-håndhævelse — FK-disciplin var konvention, ikke teknisk regel. (b) Vision-princip 5 "Lifecycle for konfiguration" var implementeret via rettelse 27 men ikke reflekteret i §5 "Det vi står inde for". Løsning: §5 udvidet med to bullets, §3 udvidet med CI-blocker 19 (FK-coverage med allowlist for eksterne reference-ID'er), §0 fik reference til mathias-afgoerelser som kilde for strategiske retning-skift. Konsekvens: master-plan reflekterer nu alle 3 meta-principper + 9 operationelle principper. CI-blocker 19 implementeres som fitness-script-udvidelse i kommende byggetrin.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3140:docs/coordination/arkiv/mathias-afgoerelser-historik.md:157:- **Plan-reference:** Denne commit. Master-plan rettelse 33 i Appendix C. Bygge-status trin 9 markeret PAUSET (jf. mathias-afgoerelser 2026-05-15).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3141:docs/coordination/arkiv/mathias-afgoerelser-historik.md:182:- **Beslutning:** Fire dokumenter har ligeværdig autoritativ rolle for at sikre retningen holder: `vision-og-principper.md`, `stork-2-0-master-plan.md`, `mathias-afgoerelser.md`, og pakkens `<pakke>-krav-og-data.md`. Hver plan og slut-rapport skal eksplicit verificere mod alle fire via obligatorisk "Fire-dokument-konsultation"-sektion (samme tier som "Oprydnings- og opdaterings-strategi" — manglende sektion = KRITISK feedback).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3142:docs/coordination/arkiv/mathias-afgoerelser-historik.md:188:- **Plan-reference:** Denne commit. Otte fil-ændringer: `arbejds-disciplin.md` (AI-arbejdsdeling renses), `plan-skabelon.md` (ny Fire-dokument-konsultation-sektion), `rapport-skabelon.md` (Vision-tjek udvides), `codex-overvaagning.md` (plan-review-fokus renes til kode), `codex-review-prompt.md` (niveau 1-prefix renes), `code-overvaagning.md` (plan-arbejde forpligtes til at udfylde tabel), `claude-ai-overvaagning.md` (NY — formel Claude.ai-rolle i overvågnings-flow), denne entry.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3143:docs/coordination/arkiv/mathias-afgoerelser-historik.md:348:  2. **Codex end-to-end-tjek** — Codex' Plan-review udvides med 7 obligatoriske end-to-end-tjek per write-vej: GRANT+policy+session-var-tre-pak, SELECT-bredde, backdated guards, apply-dispatcher-extension specificeret per RPC, jsonb-format konsistens, eksempel-row gennem flow, krydsetjek mod plan's egen Fundament-tjek-sektion. Niveau 1-prefix i codex-review-prompt-skabelon udvides parallelt.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3144:docs/coordination/arkiv/mathias-afgoerelser-historik.md:350:  3. **Krav-dok-skrivnings-disciplin** — claude-ai-overvaagning får ny sektion: hver påstand i krav-dok kan peges på Mathias-kilde (direkte ord, mathias-afgoerelser-entry, vision-princip, master-plan-paragraf). Mangler kilde: spørg, skriv ikke. `conversation_search` obligatorisk før reference til tidligere afgørelse. Krav-dok indeholder kun tanker — ingen datamodel, ingen kode-skitser.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3145:docs/coordination/arkiv/mathias-afgoerelser-historik.md:352:  4. **Datamodel-grænse** — arbejds-disciplin.md AI-arbejdsdeling: Claude.ai MÅ IKKE designe datamodel (tabeller, kolonner, RPC-signaturer, granularitets-valg, helper-RPC-forslag, kode-skitser, "Model A/B/C") — det er Code's bord i plan-fasen. Datamodel-STOP-regel tilføjet til Claude.ai's disciplin-regler i claude-ai-overvaagning.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3146:docs/coordination/arkiv/mathias-afgoerelser-historik.md:358:  - `docs/coordination/overvaagning/claude-ai-overvaagning.md` — ny "Krav-dok-skrivnings-disciplin"-sektion (kilde-disciplin + rene tanker, med T9-eksempel) + blokker-punkt 5 (Fundament-tjek-passeret-sektion) + datamodel-STOP i disciplin-regler
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3147:docs/coordination/arkiv/mathias-afgoerelser-historik.md:361:  - `docs/skabeloner/codex-review-prompt.md` — niveau 1-prefix udvidet med samme end-to-end-tjek-liste
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3148:docs/coordination/arkiv/mathias-afgoerelser-historik.md:380:- **Ærligheds-flag:** Et femte forslag (slut-rapport-honesty-tjek med plan-afvigelser-sektion) blev oprindeligt foreslået af Claude.ai, men recon afslørede at det allerede eksisterer i rapport-skabelonen — fabrikation, ikke nyt fund. Fjernet fra pakken inden implementation. Flaget her for at dokumentere at fabrikation skete på dette niveau af samtalen og at recon fangede det inden commit.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3149:docs/coordination/arkiv/mathias-afgoerelser-historik.md:385:  - `docs/coordination/overvaagning/claude-ai-overvaagning.md` (forretningsspørgsmål-fase-sektion + krav-dok-review-rolle-sektion + NEEDS-MATHIAS i severity + anti-glid-regel)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3150:docs/coordination/arkiv/mathias-afgoerelser-historik.md:396:  1. **V5.3 workflow-spec** (PR #48 `708ab8d`): 7-step flow, marker-protokol (halt/log/positive markers), dialog-protokol (FLAG → LØS → STOP), `scripts/codex-review.sh`, `scripts/claude-ai-prompt.sh`, Cadence (Claude.ai trigger-baseret review-frekvens)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3151:docs/coordination/arkiv/mathias-afgoerelser-historik.md:435:  1. **Dokument-hierarki differentieres.** Kun `vision-og-principper.md` er LÅST-AUTORITATIV. `stork-2-0-master-plan.md` og `mathias-afgoerelser.md` er RETNINGSGIVENDE (kan rettes løbende). `<pakke>-krav-og-data.md` og `<pakke>-plan.md` er PAKKE-KONTRAKT efter approval (låst inden for pakken). Modsigelses-håndtering differentieres efter status: vision-modsigelse = automatisk blokering; master-plan/mathias-afgørelser-modsigelse = trigger for opdatering (Mathias afgør); krav-dok/plan-modsigelse efter approval = KRITISK.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3152:docs/coordination/arkiv/mathias-afgoerelser-historik.md:454:  - `docs/coordination/overvaagning/claude-ai-overvaagning.md` — simplificeret 5-step krav-dok-fase + sparring-på-tværs + 1.0-bibel-reference præciseret
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3153:docs/coordination/arkiv/mathias-afgoerelser-historik.md:508:  - **Claude.ai:** vision + master-plan + mathias-afgoerelser + interne chat-projekt
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3154:docs/coordination/arkiv/mathias-afgoerelser-historik.md:559:- **FULDSTYRKE-MANGEL gælder alle tre AI'er** (ikke kun Code+Codex): Claude.ai's forretningsgang-rapport skal også have konkrete kilde-referencer (mathias-afgoerelser-dato, vision-princip, master-plan-§, chat-citat) — ikke generiske formuleringer.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3155:docs/coordination/arkiv/mathias-afgoerelser-historik.md:580:  - `docs/coordination/overvaagning/claude-ai-overvaagning.md` — ny Step 1.0 + konsoliderings-rolle (inkl. Mathias-afgørelses-kolonne) + præcisering af Step 1.2 (Step 1.0 sker for alle pakker)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3156:docs/coordination/arkiv/H020-plan.md:77:| 5   | `docs/coordination/mathias-afgoerelser.md`                  | M3 + M4 (memory-datoer, Q-pakke 22 RPC'er)                                                    | `git log --diff-filter=A` for hver memory-fil verificerer datoer; "22" matcher TaskList #33                                                                                                                            |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3157:docs/coordination/arkiv/H020-plan.md:87:| 15  | `docs/skabeloner/rapport-skabelon.md`                       | KS4 (vision-tjek-lokation)                                                                    | reference peger på `docs/strategi/arbejds-disciplin.md` "Vision-tjek-skabelon"-sektionen                                                                                                                               |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3158:docs/coordination/arkiv/Lag1-plan.md:41:| 5        | Mathias-gate ikke operationelt defineret                                             | Konkret protokol via `mathias-afgoerelser.md` entry-format                | **Erstattet i V5.2** — to-fil-flow med ny `mathias-gate/`-mappe; mathias-afgoerelser.md forbliver append-only log  |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3159:docs/coordination/arkiv/Lag1-plan.md:54:| WORKAROUND-gate omdefinerer mathias-afgoerelser.md fra append-only til hybrid | KRITISK | ACCEPT                 | Ny mappe `docs/coordination/mathias-gate/` for AFVENTER-entries. mathias-afgoerelser.md forbliver append-only log af trufne afgørelser.    |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3164:docs/coordination/arkiv/Lag1-plan.md:81:| I   | `docs/skabeloner/rapport-skabelon.md`                      | Halt-eskaleringer + optimeringer                                               | Tilføj plan-afvigelser-koppling til markers                                                                                           |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3165:docs/coordination/arkiv/Lag1-plan.md:84:| I   | `docs/coordination/overvaagning/claude-ai-overvaagning.md` | Cadence-ændring                                                                | Som V3                                                                                                                                |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3166:docs/coordination/arkiv/Lag1-plan.md:195:**Bevarer `mathias-afgoerelser.md` som append-only log over trufne afgørelser** (Claude.ai's korrekte indvending). Ny mappe `docs/coordination/mathias-gate/` introduceres for afventende entries.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3167:docs/coordination/arkiv/Lag1-plan.md:215:     a. Tilføj append-only entry i `mathias-afgoerelser.md` med samme dato + reference til gate-fil + sammenfatning af trufne afgørelse
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3168:docs/coordination/arkiv/Lag1-plan.md:219:     a. Tilføj append-only entry i `mathias-afgoerelser.md` om afvisning + alternativ retning
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3169:docs/coordination/arkiv/Lag1-plan.md:226:- `mathias-afgoerelser.md` = append-only log over trufne afgørelser
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3170:docs/coordination/arkiv/Lag1-plan.md:273: → Code tilføjer append-only entry til mathias-afgoerelser.md (trufne afgørelse)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3172:docs/coordination/arkiv/Lag1-plan.md:327:   - `plan-skabelon.md` + `rapport-skabelon.md` opdatering
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3173:docs/coordination/arkiv/Lag1-plan.md:414:| `docs/coordination/mathias-afgoerelser.md` | Trufne afgørelser logges her (append-only); AFVENTER-entries lever i `mathias-gate/` per to-fil-flow                                                                             | ✓ overholdt |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3175:docs/coordination/arkiv/rapport-historik-meta/2026-05-16-h024.md:113:- `docs/coordination/mathias-afgoerelser.md`: ny entry "Tx-rollback er default mønster for DB-tests; fitness-check håndhæver"
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3176:docs/coordination/arkiv/t9-supplement-2-forretningsgang-claude-ai.md:5:kilder: vision + master-plan + mathias-afgoerelser + chat-projekt
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3177:docs/coordination/arkiv/t9-supplement-2-forretningsgang-claude-ai.md:25:mathias-afgoerelser.md som en distinkt entry. Inden T9's tilsvarende
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3178:docs/coordination/arkiv/t9-supplement-2-forretningsgang-claude-ai.md:97:  mathias-afgoerelser.md. **Åbent spørgsmål** — se afsnit nedenfor.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3179:docs/coordination/arkiv/t9-supplement-2-forretningsgang-claude-ai.md:140:ramme-entry findes ikke i mathias-afgoerelser.md (verificeret via læsning).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3180:docs/coordination/arkiv/t9-supplement-2-forretningsgang-claude-ai.md:150:  mathias-afgoerelser.md før denne pakke bruger den som kilde? (jf. krav-dok-
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3181:docs/coordination/arkiv/t9-supplement-2-forretningsgang-claude-ai.md:180:fix; forretningsgangene er låste i mathias-afgoerelser 2026-05-17 + 2026-05-16.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3182:docs/coordination/arkiv/i001-arbejde/audit/audit-code-2026-05-15.md:81:**Bevis:** H001-H003+H006 nævnes som cutover-blockers (`docs/coordination/cutover-checklist.md:22-25`), H010+H012+H016+H018 nævnes i mathias-afgoerelser, men ingen har formel hjemme.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3183:docs/coordination/arkiv/i001-arbejde/audit/audit-code-2026-05-15.md:86:**Lokation:** `docs/coordination/mathias-afgoerelser.md:19-22`
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3184:docs/coordination/arkiv/i001-arbejde/audit/audit-code-2026-05-15.md:94:**Lokation:** `docs/coordination/mathias-afgoerelser.md:94-97`
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3185:docs/coordination/arkiv/i001-arbejde/audit/audit-code-2026-05-15.md:111:**Påstand (citat):** Mappetræ angiver `strategi/` indeholder 4 filer (vision-og-principper, master-plan, arbejds-disciplin, bygge-status); `skabeloner/` indeholder 2 (plan-skabelon, rapport-skabelon); `coordination/` indeholder 6 entries.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3187:docs/coordination/arkiv/i001-arbejde/audit/audit-code-2026-05-15.md:266:| `docs/coordination/mathias-afgoerelser.md`              | delvist (L1-100 + L175-200)                                          | 200+ linjer; entries 1-15 og sidste 5 fuldt                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3189:docs/coordination/arkiv/i001-arbejde/audit/audit-code-2026-05-15.md:277:| `docs/skabeloner/rapport-skabelon.md`                   | ikke læst i denne runde                                              | spot-check via H010-rapport                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3190:docs/coordination/arkiv/T9-V4-claude-ai.md:69:**Per Modsigelses-disciplin (mathias-afgoerelser 2026-05-17):** "Modsigelse mod krav-dokumentet eller fire-dokument-rammen er plan-blokerende. Modsigelse er ikke kandidat til G-nummer." V4's nye design honorerer krav-dok 6.1 — men kun hvis planen er internt konsistent. Den interne inkonsistens betyder at planen ikke entydigt leverer det krav-dok forlanger.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3191:docs/coordination/arkiv/T9-V4-claude-ai.md:92:| `docs/coordination/mathias-afgoerelser.md` | **Indirekte konflikt.** 2026-05-16 pkt 2 ("Afdelinger ændres sjældent; historik bevares") + 2026-05-17 pkt 13 (alle gældende-dato-ændringer følger fortrydelses-mekanisme) brudt af inkonsistens.                                       |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3192:docs/coordination/v4-slettede-docs/overvaagning--claude-ai-overvaagning.md:9:- **`qwers`** — Mathias paster denne som første besked i chat'en. Du læser `docs/coordination/overvaagning/claude-ai-overvaagning.md` via Filesystem-MCP og bekræfter rollen kort: "Rolle bekræftet som Claude.ai. Klar til qwerr eller pakke-kontekst."
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3193:docs/coordination/v4-slettede-docs/overvaagning--claude-ai-overvaagning.md:49:| **Claude.ai** | `<pakke>-forretningsgang-claude-ai.md` (din rapport) | vision + master-plan + mathias-afgoerelser + interne chat-projekt |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3194:docs/coordination/v4-slettede-docs/overvaagning--claude-ai-overvaagning.md:131:**Vigtigt:** Beslutninger der opstår via sparring skal stabiliseres i repo-kilde (mathias-afgoerelser-entry, krav-dok, eller plan) FØR de bruges som kontrakt. Chat-citater er ikke verifificerbar kilde for Code/Codex senere.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3195:docs/coordination/v4-slettede-docs/overvaagning--claude-ai-overvaagning.md:144:- Entry i `docs/coordination/mathias-afgoerelser.md` (citeret med dato)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3196:docs/coordination/v4-slettede-docs/overvaagning--claude-ai-overvaagning.md:202:3. Pakken introducerer ny ramme-niveau-beslutning (typisk strategisk retning-skift), men der er ingen entry i `docs/coordination/mathias-afgoerelser.md` som del af pakkens commits
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3197:docs/coordination/v4-slettede-docs/overvaagning--claude-ai-overvaagning.md:223:- **KRITISK** — slut-rapport hævder at noget er leveret men det er ikke i koden, ELLER fire-dokument-verifikations-sektionen mangler eller er forkert udfyldt, ELLER pakken introducerede strategisk retning-skift uden mathias-afgoerelser-entry. STOPPER slut-rapport i alle runder.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3198:docs/coordination/v4-slettede-docs/INDEX.md:16:| `overvaagning--claude-ai-overvaagning.md`        | docs/coordination/overvaagning/claude-ai-overvaagning.md        | `4e65fa80a9`  | 2026-05-22 | V4 doc #3: konsolidér disciplin → ÉN fil                                                |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3199:docs/coordination/v4-slettede-docs/INDEX.md:19:| `skabelon--codex-review-prompt.md`               | docs/skabeloner/codex-review-prompt.md                          | `4e65fa80a9`  | 2026-05-22 | V4 doc #3: konsolidér disciplin → ÉN fil                                                |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3200:docs/coordination/v4-slettede-docs/INDEX.md:21:| `skabelon--rapport-skabelon.md`                  | docs/skabeloner/rapport-skabelon.md                             | `4e65fa80a9`  | 2026-05-22 | V4 doc #3: konsolidér disciplin → ÉN fil                                                |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3201:docs/coordination/v4-slettede-docs/INDEX.md:26:| `mathias-afgoerelser--slettet-version.md`        | docs/coordination/mathias-afgoerelser.md                        | `56c017a967`  | 2026-05-22 | V4 doc #5: arkivér forældede filer + slet rod                                           |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3202:docs/coordination/v4-slettede-docs/INDEX.md:28:**NB om `mathias-afgoerelser`:** den slettede version (`docs/coordination/mathias-afgoerelser.md`) er gengivet her. En arkiveret variant lever desuden i `docs/coordination/arkiv/mathias-afgoerelser-historik.md` (kan læses direkte) — de to er ikke verificeret identiske.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3203:docs/coordination/v4-slettede-docs/skabelon--rapport-skabelon.md:108:| `docs/coordination/mathias-afgoerelser.md`  | [ref. fra plan]   | overholdt / afveget | [link hvis afveget]                               |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3204:docs/coordination/v4-slettede-docs/skabelon--rapport-skabelon.md:115:- Hvis pakken introducerer ny rammeniveau-beslutning (typisk strategisk retning-skift): entry i `docs/coordination/mathias-afgoerelser.md` skal være del af pakkens commits, og det dokumenteres her
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3205:docs/coordination/v4-slettede-docs/skabelon--rapport-skabelon.md:147:| `docs/coordination/mathias-afgoerelser.md` | ja / nej       | [commit-hash + entry-dato ELLER "ingen ændring (jf. plan)"]          |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3206:docs/coordination/v4-slettede-docs/skabelon--rapport-skabelon.md:172:Efter denne rapport committes + `docs/coordination/seneste-rapport.md` opdateres til at pege på denne fil, posterer Codex-notify-action en comment til tracker-issuet "Codex review queue". Codex-review-runde N følger derefter via `docs/skabeloner/codex-review-prompt.md` niveau 1-prefix.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3207:docs/coordination/v4-slettede-docs/overvaagning--code-overvaagning.md:73:     - Ny entry i `docs/coordination/mathias-afgoerelser.md` (committet til main), ELLER
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3208:docs/coordination/v4-slettede-docs/overvaagning--code-overvaagning.md:136:| `docs/coordination/mathias-afgoerelser.md`  | ja          | [konkrete datoer + emner]             | ja/nej             |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3209:docs/coordination/v4-slettede-docs/overvaagning--code-overvaagning.md:257:   - Opdater de dokumenter planen lister (aktiv-plan, mathias-afgoerelser, bygge-status, teknisk-gaeld, etc.)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3210:docs/coordination/v4-slettede-docs/skabelon--workflow-skabelon.md:11:V3 udvider V2 baseret på trin 10-erfaring (`mathias-afgoerelser.md` 2026-05-21 "Workflow-justering V3"). To tilføjelser inden for eksisterende 5-step-struktur: (1) Step 1.0 — pre-krav-dok forretningsgang-recon med 3 AI'er parallelt; (2) Step 2 — Code + Codex arbejder parallelt fra V1 (ikke ping-pong-sekvens), Codex udvidet med proaktiv kode-research.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3211:docs/coordination/v4-slettede-docs/skabelon--workflow-skabelon.md:85:| 4    | Code bygger, Codex validerer                                                | PR + commits + codex-review-filer                                                                | [`codex-review-prompt.md`](codex-review-prompt.md) |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3212:docs/coordination/v4-slettede-docs/skabelon--workflow-skabelon.md:86:| 5    | Code skriver, Claude.ai-reviewer (separat chat) verificerer                 | `rapport-historik/<dato>-<pakke>.md`                                                             | [`rapport-skabelon.md`](rapport-skabelon.md)       |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3213:docs/coordination/v4-slettede-docs/skabelon--workflow-skabelon.md:195:`mathias-afgoerelser.md` forbliver append-only log af **trufne** afgørelser. Afventende beslutninger lever i ny mappe `docs/coordination/mathias-gate/`.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3214:docs/coordination/v4-slettede-docs/skabelon--workflow-skabelon.md:200:4. Code: ved GODKENDT → tilføj append-only entry til `mathias-afgoerelser.md` (trufne afgørelse) + arkivér gate-fil + genoptag build
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3215:docs/coordination/v4-slettede-docs/skabelon--workflow-skabelon.md:246:| `docs/coordination/mathias-afgoerelser.md` | Pakken indeholder strategisk retning-skift eller låser ramme på tværs af pakker         | Ny append-only entry med dato + begrundelse + plan-reference        |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3216:docs/coordination/v4-slettede-docs/skabelon--workflow-skabelon.md:253:**Hvorfor:** uden eksplicit disciplin vokser drift mellem autoritative dokumenter og koden. Master-plan beskriver intentionen; bygge-status reflekterer faktisk fremgang; mathias-afgoerelser fanger rammer; teknisk-gæld viser akkumuleret hjørner. Når én ændres, skal de andre tjekkes samme runde — ikke "senere".
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3217:docs/coordination/v4-slettede-docs/skabelon--workflow-skabelon.md:359:**Sidste opdatering:** 2026-05-20 — Workflow V2 finalize (jf. `mathias-afgoerelser.md` "Workflow-justering V2" 2026-05-20). Flow simplificeret til 5-step. Krav-dok-fase reduceret til direkte chat mellem Claude.ai-forfatter og Mathias; separat reviewer-rolle + forretningsspoergsmaal-fil + krav-dok-feedback-mappe udgået. Pakke-skala-vurdering nu eksplicit step 0. Recon-først obligatorisk i plan-fasen. Konsekvens-opdaterings-disciplin tilføjet for autoritative dokumenter (master-plan, bygge-status, mathias-afgoerelser, teknisk-gaeld).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3218:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V1-approved-claude-ai.md:47:### Mathias-afgørelser (`docs/coordination/mathias-afgoerelser.md`)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3219:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V1-approved-claude-ai.md:81:Den korrekte kilde for én-medarbejder-ét-team-reglen er mathias-afgoerelser 2026-05-16 punkt 7 (allerede refereret i samme række — fint at have begge, men princip 8 er ikke materiel kilde).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3220:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V1-approved-claude-ai.md:83:**Anbefalet handling:** Kosmetisk note. Hvis pakken får runde V2 af andre grunde: fjern princip 8-reference fra vision-rækken; behold mathias-afgoerelser pkt 7-reference. Ellers G-nummer-kandidat: "Plan-skabelon-vejledning: præcisering af vision-princip-referencer i Fire-dokument-konsultations-tabel."
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3221:docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:147:- **Plan-reference:** Denne commit (clean-up af mathias-afgoerelser.md).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3222:docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:151:- **Begrundelse:** Coordination-mappen vokser ukontrolleret med arbejds-artefakter fra afsluttede pakker; relaterede dokumenter glider ud af synkron uden eksplicit ansvar. Løsning: hver plan skal indeholde "Oprydnings- og opdaterings-strategi"-sektion (obligatorisk; manglende sektion = KRITISK feedback fra reviewers). Code udfører oprydning som DEL af build, ikke separat trin. Slut-rapport verificerer udførelse i ny "Oprydning + opdatering udført"-sektion. Ankret 4 steder: plan-skabelon, rapport-skabelon, Code's overvågnings-prompt (qwerg-fasen), arbejdsmetode-dokument.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3223:docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:156:- **Begrundelse:** Audit af master-plan mod vision-dokumentet afslørede to gaps: (a) Vision-meta-princip 3 "Sammenkobling eksplicit" havde ingen CI-håndhævelse — FK-disciplin var konvention, ikke teknisk regel. (b) Vision-princip 5 "Lifecycle for konfiguration" var implementeret via rettelse 27 men ikke reflekteret i §5 "Det vi står inde for". Løsning: §5 udvidet med to bullets, §3 udvidet med CI-blocker 19 (FK-coverage med allowlist for eksterne reference-ID'er), §0 fik reference til mathias-afgoerelser som kilde for strategiske retning-skift. Konsekvens: master-plan reflekterer nu alle 3 meta-principper + 9 operationelle principper. CI-blocker 19 implementeres som fitness-script-udvidelse i kommende byggetrin.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3224:docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:157:- **Plan-reference:** Denne commit. Master-plan rettelse 33 i Appendix C. Bygge-status trin 9 markeret PAUSET (jf. mathias-afgoerelser 2026-05-15).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3225:docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:182:- **Beslutning:** Fire dokumenter har ligeværdig autoritativ rolle for at sikre retningen holder: `vision-og-principper.md`, `stork-2-0-master-plan.md`, `mathias-afgoerelser.md`, og pakkens `<pakke>-krav-og-data.md`. Hver plan og slut-rapport skal eksplicit verificere mod alle fire via obligatorisk "Fire-dokument-konsultation"-sektion (samme tier som "Oprydnings- og opdaterings-strategi" — manglende sektion = KRITISK feedback).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3226:docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:188:- **Plan-reference:** Denne commit. Otte fil-ændringer: `arbejds-disciplin.md` (AI-arbejdsdeling renses), `plan-skabelon.md` (ny Fire-dokument-konsultation-sektion), `rapport-skabelon.md` (Vision-tjek udvides), `codex-overvaagning.md` (plan-review-fokus renes til kode), `codex-review-prompt.md` (niveau 1-prefix renes), `code-overvaagning.md` (plan-arbejde forpligtes til at udfylde tabel), `claude-ai-overvaagning.md` (NY — formel Claude.ai-rolle i overvågnings-flow), denne entry.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3227:docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:348:  2. **Codex end-to-end-tjek** — Codex' Plan-review udvides med 7 obligatoriske end-to-end-tjek per write-vej: GRANT+policy+session-var-tre-pak, SELECT-bredde, backdated guards, apply-dispatcher-extension specificeret per RPC, jsonb-format konsistens, eksempel-row gennem flow, krydsetjek mod plan's egen Fundament-tjek-sektion. Niveau 1-prefix i codex-review-prompt-skabelon udvides parallelt.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3228:docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:350:  3. **Krav-dok-skrivnings-disciplin** — claude-ai-overvaagning får ny sektion: hver påstand i krav-dok kan peges på Mathias-kilde (direkte ord, mathias-afgoerelser-entry, vision-princip, master-plan-paragraf). Mangler kilde: spørg, skriv ikke. `conversation_search` obligatorisk før reference til tidligere afgørelse. Krav-dok indeholder kun tanker — ingen datamodel, ingen kode-skitser.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3229:docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:352:  4. **Datamodel-grænse** — arbejds-disciplin.md AI-arbejdsdeling: Claude.ai MÅ IKKE designe datamodel (tabeller, kolonner, RPC-signaturer, granularitets-valg, helper-RPC-forslag, kode-skitser, "Model A/B/C") — det er Code's bord i plan-fasen. Datamodel-STOP-regel tilføjet til Claude.ai's disciplin-regler i claude-ai-overvaagning.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3230:docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:358:  - `docs/coordination/overvaagning/claude-ai-overvaagning.md` — ny "Krav-dok-skrivnings-disciplin"-sektion (kilde-disciplin + rene tanker, med T9-eksempel) + blokker-punkt 5 (Fundament-tjek-passeret-sektion) + datamodel-STOP i disciplin-regler
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3231:docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:361:  - `docs/skabeloner/codex-review-prompt.md` — niveau 1-prefix udvidet med samme end-to-end-tjek-liste
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3232:docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:380:- **Ærligheds-flag:** Et femte forslag (slut-rapport-honesty-tjek med plan-afvigelser-sektion) blev oprindeligt foreslået af Claude.ai, men recon afslørede at det allerede eksisterer i rapport-skabelonen — fabrikation, ikke nyt fund. Fjernet fra pakken inden implementation. Flaget her for at dokumentere at fabrikation skete på dette niveau af samtalen og at recon fangede det inden commit.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3233:docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:385:  - `docs/coordination/overvaagning/claude-ai-overvaagning.md` (forretningsspørgsmål-fase-sektion + krav-dok-review-rolle-sektion + NEEDS-MATHIAS i severity + anti-glid-regel)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3234:docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:396:  1. **V5.3 workflow-spec** (PR #48 `708ab8d`): 7-step flow, marker-protokol (halt/log/positive markers), dialog-protokol (FLAG → LØS → STOP), `scripts/codex-review.sh`, `scripts/claude-ai-prompt.sh`, Cadence (Claude.ai trigger-baseret review-frekvens)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3235:docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:435:  1. **Dokument-hierarki differentieres.** Kun `vision-og-principper.md` er LÅST-AUTORITATIV. `stork-2-0-master-plan.md` og `mathias-afgoerelser.md` er RETNINGSGIVENDE (kan rettes løbende). `<pakke>-krav-og-data.md` og `<pakke>-plan.md` er PAKKE-KONTRAKT efter approval (låst inden for pakken). Modsigelses-håndtering differentieres efter status: vision-modsigelse = automatisk blokering; master-plan/mathias-afgørelser-modsigelse = trigger for opdatering (Mathias afgør); krav-dok/plan-modsigelse efter approval = KRITISK.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3236:docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:454:  - `docs/coordination/overvaagning/claude-ai-overvaagning.md` — simplificeret 5-step krav-dok-fase + sparring-på-tværs + 1.0-bibel-reference præciseret
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3237:docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:508:  - **Claude.ai:** vision + master-plan + mathias-afgoerelser + interne chat-projekt
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3238:docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:559:- **FULDSTYRKE-MANGEL gælder alle tre AI'er** (ikke kun Code+Codex): Claude.ai's forretningsgang-rapport skal også have konkrete kilde-referencer (mathias-afgoerelser-dato, vision-princip, master-plan-§, chat-citat) — ikke generiske formuleringer.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3239:docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:580:  - `docs/coordination/overvaagning/claude-ai-overvaagning.md` — ny Step 1.0 + konsoliderings-rolle (inkl. Mathias-afgørelses-kolonne) + præcisering af Step 1.2 (Step 1.0 sker for alle pakker)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3240:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V2-approved-claude-ai.md:28:Code har fjernet princip 8-reference fra vision-rækken i Fire-dokument-konsultations-tabellen. V2 tilføjer eksplicit note: "én medarbejder i ét team ad gangen (krav-dok pkt 7) er IKKE afledt af vision-princip 8 — princip 8 handler om person-entitets-unikhed på tværs af eksterne systemer (identitets-master i §1.7), ikke om team-tilknytnings-unikhed. Korrekt kilde: mathias-afgoerelser pkt 7. Reference rettet per Claude.ai V1 finding 1".
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3241:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V2-approved-claude-ai.md:76:**Mathias-afgoerelser pkt 3 konsistens:** team_deactivate er den dedikerede RPC der "lukker alle åbne employee_team_assignments via dedikeret UPDATE" — det matcher mathias-afgoerelser pkt 3 ordret: "Når team ophører, forbliver medarbejderne ansatte uden team-tilknytning (ikke fyret, bare team-løse)". RPC implementerer denne forretnings-regel teknisk.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3242:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V2-approved-claude-ai.md:90:**Princip 2 + mathias-afgoerelser pkt 7 konsistens:** Employee-data tilgås via subtree (FM-chef ser alle employees i sin afdeling); assignment-data tilgås via subtree (FM-chef ser alle assignments). Konsistent forretnings-model: "cross-team-adgang via rolle-scope, ikke via flere tilknytninger" (mathias-afgoerelser pkt 7).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3243:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V2-approved-claude-ai.md:100:Alle 19 afgørelser fra krav-dok stadig honoreret 1:1. Alle 9 forretningssandheder fra mathias-afgoerelser 2026-05-16 entry stadig mappet til konkrete plan-elementer. V2's helper-split og step-re-ordering ændrer ikke noget materielt i forretnings-mapping — kun teknisk implementation.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3244:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V2-approved-claude-ai.md:110:- **Claude.ai V1 KOSMETISK 1** (princip 8-reference) — fjernet og rettet til mathias-afgoerelser pkt 7.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3245:docs/coordination/v4-slettede-docs/arbejdsmetode-og-repo-struktur.md:34:│   ├── mathias-afgoerelser.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3246:docs/coordination/v4-slettede-docs/arbejdsmetode-og-repo-struktur.md:49:    ├── rapport-skabelon.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3247:docs/coordination/v4-slettede-docs/arbejdsmetode-og-repo-struktur.md:50:    └── codex-review-prompt.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3248:docs/coordination/v4-slettede-docs/arbejdsmetode-og-repo-struktur.md:137:Append-only fil: `docs/coordination/mathias-afgoerelser.md`.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3249:docs/coordination/v4-slettede-docs/arbejdsmetode-og-repo-struktur.md:156:2. **Code opretter `coordination/`-undermappe** med tomme skabeloner + initial `mathias-afgoerelser.md` med alle låste afgørelser fra hidtidige sessions (vision-commit, Problem 1-4, Q-pakke-korrektion, lock-mønster udskudt, etc.).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3250:docs/coordination/v4-slettede-docs/arbejdsmetode-og-repo-struktur.md:182:- `claude-ai-overvaagning.md`
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3251:docs/coordination/v4-slettede-docs/arbejdsmetode-og-repo-struktur.md:263:- Dokumenter der skal opdateres som konsekvens (aktiv-plan, seneste-rapport, mathias-afgoerelser, bygge-status, master-plan, teknisk-gaeld)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3252:docs/coordination/v4-slettede-docs/arbejdsmetode-og-repo-struktur.md:284:**V2-note:** Claude.ai-plan-reviewer-rolle udgået i V2 (jf. `mathias-afgoerelser.md` 2026-05-20). Plan-fase er Code + Codex; `<pakke>-V<n>-claude-ai.md` og `<pakke>-V<n>-approved-claude-ai.md` fra V5.3 produceres ikke længere. Eventuelle eksisterende sådanne filer på historiske pakke-branches arkiveres ved pakke-lukning som hidtil.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3253:docs/coordination/v4-slettede-docs/skabelon--plan-skabelon.md:158:| `docs/coordination/mathias-afgoerelser.md` | ja / nej    | [hvis ja: entry-dato + emne; ellers "nej, kun pakke-leverance"]  |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3254:docs/coordination/v4-slettede-docs/skabelon--plan-skabelon.md:193:V2 dokument-hierarki (jf. `mathias-afgoerelser.md` 2026-05-20 "Workflow-justering V2"):
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3255:docs/coordination/v4-slettede-docs/skabelon--plan-skabelon.md:196:- `stork-2-0-master-plan.md` + `mathias-afgoerelser.md` = **RETNINGSGIVENDE** (kan rettes løbende). Konflikt → trigger-for-opdatering, Mathias afgør om plan ændres eller dokumentet opdateres. Ikke automatisk blokering.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3256:docs/coordination/v4-slettede-docs/skabelon--plan-skabelon.md:203:| `docs/coordination/mathias-afgoerelser.md`  | ja / nej    | RETNINGSGIVENDE  | [konkrete datoer + emner, fx "2026-05-16 (forretningssandhed), 2026-05-15 (T9 pause)"] | ja / nej — ja = trigger-for-opdatering (Mathias afgør)         |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3257:docs/coordination/v4-slettede-docs/bygge-status.md:62:- ⏸ PAUSET — byggetrin pauset af Mathias (se mathias-afgoerelser)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3258:docs/coordination/v4-slettede-docs/bygge-status.md:265:- §1.13 "Konsekvens for permissions": compliance-ansvarlige er konkrete medarbejdere valgt i UI — ikke rolle/permission (mathias-afgoerelser 2026-05-19)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3259:docs/coordination/v4-slettede-docs/bygge-status.md:285:- Runde 2 (verifikation): T9-omstart-rammen (mathias-afgoerelser 2026-05-17) etableret som korrekt fundament
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3260:docs/coordination/v4-slettede-docs/overvaagning--codex-overvaagning.md:179:- Argumentere fra mathias-afgoerelser eller chat-historik (du har ikke adgang; det er Claude.ai's særegne kilde)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3261:docs/coordination/v4-slettede-docs/arbejds-disciplin.md:165:| **Claude.ai** | vision + master-plan + mathias-afgoerelser + interne chat-projekt |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3262:docs/coordination/v4-slettede-docs/arbejds-disciplin.md:235:- **Claude.ai (Step 1.0 forretningsgang-rapport):** Hver "Hvad ved vi?" har konkret kilde-reference (mathias-afgoerelser-dato, vision-princip-nr, master-plan-§, chat-citat). Ikke generiske "vi ved at klienter er vigtige". Hvis ingen data: lad feltet stå tomt (ærligt).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3263:docs/coordination/v4-slettede-docs/arbejds-disciplin.md:339:| `docs/coordination/mathias-afgoerelser.md`  | RETNINGSGIVENDE      | Modsigelse = trigger for ny entry eller opdateret entry. Ikke automatisk blokering. Mathias afgør. Entries kan blive forældede.            |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3264:docs/coordination/v4-slettede-docs/arbejds-disciplin.md:567:  `mathias-afgoerelser.md` og ikke kan udledes af eksisterende forretnings-
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3265:docs/coordination/v4-slettede-docs/arbejds-disciplin.md:590:3. **Mathias afgør** — enten ved ny entry i `mathias-afgoerelser.md`, ny krav-dok-
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3266:docs/coordination/v4-slettede-docs/arbejds-disciplin.md:605:Hvor Mathias-svaret dokumenteres: [ny entry i mathias-afgoerelser.md med dato / ny krav-dok-version / direkte instruks til Code]
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3267:docs/coordination/v4-slettede-docs/arbejds-disciplin.md:660:Mathias afgør. Hvis ramme rettes: ny master-plan-rettelse (Appendix C) eller ny mathias-afgoerelser-entry. Hvis pakke justeres: krav-dok eller plan opdateres.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3268:docs/coordination/arkiv/trin-10-krav-og-data.md:133:Kilde: mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering: migration og match-rolle ud".
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3269:docs/coordination/arkiv/trin-10-krav-og-data.md:149:Kilde: mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering: migration og match-rolle ud".
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3270:docs/coordination/arkiv/trin-10-krav-og-data.md:178:De konkrete tekstrettelser er Code's bord at finde og udføre. Begge rettelser har sporbar kilde i mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering: migration og match-rolle ud".
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3271:docs/coordination/arkiv/trin-10-krav-og-data.md:186:| 1   | Klient ejer rå data                                            | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 1    |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3272:docs/coordination/arkiv/trin-10-krav-og-data.md:187:| 2   | Dato afgør sandheden — historiske bindinger er faste           | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 2    |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3273:docs/coordination/arkiv/trin-10-krav-og-data.md:188:| 3   | Klient anonymiseres ikke                                       | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 3    |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3274:docs/coordination/arkiv/trin-10-krav-og-data.md:189:| 4   | Klient-livscyklus = aktiv/inaktiv                              | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 4    |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3275:docs/coordination/arkiv/trin-10-krav-og-data.md:190:| 5   | Klient kan have logo                                           | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 5    |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3276:docs/coordination/arkiv/trin-10-krav-og-data.md:191:| 6   | Rettigheder til klient-handlinger styres i UI                  | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 6    |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3277:docs/coordination/arkiv/trin-10-krav-og-data.md:192:| 7   | Lønarter der refererer klient sættes op via formler i UI       | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 7    |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3278:docs/coordination/arkiv/trin-10-krav-og-data.md:193:| 8   | Klient kun til team-knuder                                     | mathias-afgoerelser 2026-05-17 punkt 6                                |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3279:docs/coordination/arkiv/trin-10-krav-og-data.md:194:| 9   | En klient = maks ét team ad gangen                             | mathias-afgoerelser 2026-05-20 chat-validering ifm. krav-dok-arbejdet |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3280:docs/coordination/arkiv/trin-10-krav-og-data.md:195:| 10  | Klient kan ikke dræbe et team                                  | mathias-afgoerelser 2026-05-16 punkt 4                                |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3281:docs/coordination/arkiv/trin-10-krav-og-data.md:196:| 11  | Alle ændringer med gældende dato følger fortrydelses-mekanisme | mathias-afgoerelser 2026-05-17 punkt 13                               |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3282:docs/coordination/arkiv/trin-10-krav-og-data.md:197:| 12  | Klient-data-migration udskydes fra trin 10                     | mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering" punkt 1    |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3283:docs/coordination/arkiv/trin-10-krav-og-data.md:198:| 13  | Match-rolle-konceptet udskydes fra trin 10                     | mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering" punkt 2    |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3284:docs/coordination/arkiv/trin-10-krav-og-data.md:208:| `docs/coordination/mathias-afgoerelser.md` | 2026-05-16, 2026-05-17, 2026-05-20-entries (jf. afgørelses-tabel i sektion 8)                                                                                                              |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3286:docs/coordination/gov-docs-renhed-krav-og-data.md:59:   `claude-ai-prompt.sh` (peger på slettede `mathias-afgoerelser.md` +
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3287:docs/coordination/gov-docs-renhed-krav-og-data.md:60:   `overvaagning/claude-ai-overvaagning.md`; indlejrer fjernet fire-dok-ramme),
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3289:docs/coordination/gov-docs-renhed-krav-og-data.md:79:   slettet `rapport-skabelon.md`; `disciplin.md §2/§6.2` peger på H020-tombstone
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3291:docs/coordination/gov-docs-renhed-krav-og-data.md:119:- **gov-6 (arkiv-fold)** — arkiv → git-history + `v4-slettede-docs/` (untracked) +
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3294:docs/coordination/aktiv-plan.md:7:**Aktuel:** **gov-docs-renhed** under build — plan: `docs/coordination/gov-docs-renhed-plan.md` (V4, Codex-approved runde 4 m. §8.1-SVAR: INGEN-MODSIGELSE; qwerg 2026-06-10). Derefter i rest-sekvens: gov-4-branch-protection (gov-3 CI-blockers fuldt færdig). **Merged:** gov-1 (paritet, 2026-06-04) · gov-2 (vagt, PR #93) · gov-docs-housekeeping (krav-dok-familie, PR #94) · **gov-3a** (4 §3-checks #4/#7/#16/#17 + zone-§3-fjernelse, PR #95, main @ c32097c; ikke-required indtil gov-4) · **gov-3b-1** (#19 FK-dækning + #6 indeks-pr-policy, PR #96, main @ a88d217; 23→25 fitness-checks; 0 SQL-/indeks-migrations; 3 sale-FK'er `FK_PENDING` → Trin 14 [H025]) · **gov-3b-2** (#10 SECDEF-markør-disciplin, PR #101, main @ `165833c`; 25→26 fitness-checks; 0 migrations; #18 udskilt → gov-3b-3 + [G065]) · **gov-3b-3a** (#18 del 1: §1.1:160-reconcile + 9 `permission_*` INVOKER→SECDEF, PR #103, main @ `c846105`; 4 migrations live-applikeret; G065 stadig åben → 3b) · **gov-3b-3b** (#18 del 2: sidste 5 INVOKER→SECDEF + REVOKE authenticated-write + #18-check, PR #105, main @ `7be6511`; 4 migrations live; **[G065] LØST**; gov-3 CI-blockers fuldt færdig). Rest-sekvens: gov-4-branch-protection → gov-5-automation → gov-6-arkiv-fold. Åbne G-numre: G061 (comment-parity, før gov-4), G062 (recurring types-drift), G063 (v4-slettede-docs-allowlist → gov-6). (G065 LØST i gov-3b-3b.) Åbne H: [H025] (Trin 14: sale-FK'er + orphan-cleanup). Krav-dok (ét dok over de 6): `docs/coordination/governance-vagt-krav-og-data.md` ✓.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3295:docs/coordination/arkiv/T9-foraeldet-2026-05-17/README.md:10:  employee_team_assignments-tabellen. Det modsagde mathias-afgoerelser
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3296:docs/coordination/arkiv/T9-foraeldet-2026-05-17/README.md:36:`docs/coordination/T9-krav-og-data.md` (nyt) + mathias-afgoerelser-entry
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3297:docs/coordination/arkiv/trin-10-plan.md:301:- **Afgørelse 3:** Trin 10 scope-præcisering (mathias-afgoerelser 2026-05-20).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3298:docs/coordination/arkiv/trin-10-plan.md:305:- **Afgørelse 4:** Trin 10 forretnings-ramme (mathias-afgoerelser 2026-05-20).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3299:docs/coordination/arkiv/trin-10-plan.md:1525:  - Appendix C: tilføj rettelse-entry 2026-05-20 med kort beskrivelse + reference til mathias-afgoerelser "Trin 10 scope-præcisering" og denne plan.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3300:docs/coordination/arkiv/trin-10-plan.md:1672:| `docs/coordination/mathias-afgoerelser.md` | nej         | Alle scope-/forretnings-beslutninger ligger allerede i 2026-05-20-entries                                                                                                 |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3301:docs/coordination/arkiv/trin-10-plan.md:1695:| `docs/coordination/mathias-afgoerelser.md`  | ja          | RETNINGSGIVENDE  | 2026-05-20 "Trin 10 forretnings-ramme" (7 sandheder), 2026-05-20 "Trin 10 scope-præcisering" (migration + match-rolle ud), 2026-05-20 "Workflow-justering V2". 2026-05-17 (klient kun til team; en klient = maks ét team). 2026-05-16 (klient-data følger klient ved team-skift). 2026-05-15 (plan-leverance er kontrakt). 2026-05-14 (E-conomic udelades; legal → time_based). 2026-05-11 (vision låst; superadmin eneste hardkodede rolle). | nej                                                                                                                                                                                  |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3302:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V3-approved-claude-ai.md:74:**Anbefalet handling:** G-nummer-kandidat: "Mathias formaliserer visibility-model for `employee_team_assignments` i mathias-afgoerelser efter T9-merge". Mathias har to veje:
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3303:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V3-approved-claude-ai.md:76:1. **Acceptere V3-valg:** entry i mathias-afgoerelser der formaliserer "team-medlemskab er strukturel metadata; visibility = using (true)". Princip-præcedens for fremtidige struktur-tabeller. Pre-cutover ingen produktions-konsekvens.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3304:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V3-approved-claude-ai.md:98:4. Forretnings-dokument-konsistens på materielt niveau holdt: §1.1 (SECURITY INVOKER) bevaret, §1.7 (closure + helpers + versioneret tilknytning) implementeret 1:1, alle 9 mathias-afgoerelser-punkter stadig mappet, alle krav-dok-leverancer adresseret
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3305:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V3-approved-claude-ai.md:124:**Vigtigt for Mathias' qwerg-overvejelse:** approval gives med eksplicit G-nummer-eskalering. Hvis Mathias accepterer V3-visibility-valget, bør entry tilføjes til mathias-afgoerelser som del af T9-merge eller umiddelbart efter. Hvis Mathias ønsker stricter visibility, kan T9 bygges som V3 nu og denormaliseret cache indføres som separat pakke senere (ingen T9-rollback nødvendig).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3308:docs/coordination/arkiv/H024-plan.md:604:- `docs/coordination/mathias-afgoerelser.md` → ny entry om at "tx-rollback er default for DB-tests + fitness-check håndhæver" som strategisk retning-skift
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3311:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V3-claude-ai-FEEDBACK.md:8:**Status:** Trækker tidligere `T9-V3-approved-claude-ai.md` tilbage. Min approval modsagde §5's låste fundament + mathias-afgoerelser pkt 7. Denne fil erstatter approvalen.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3312:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V3-claude-ai-FEEDBACK.md:151:- mathias-afgoerelser 2026-05-16 pkt 7: cross-team-adgang via scope, ikke uden om
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3314:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1.md:23:Doc-opdateringer: 8 filer (workflow-skabelon, codex-review-prompt, 3 overvaagning-docs, plan-skabelon, rapport-skabelon, scripts/README, 2 strategi-references)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3318:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1.md:46:| I — Doc-opdateringer                           | leveret | 7 filer: workflow-skabelon (+102 linjer V5.3-synk), 3 overvaagning-docs (svar-typer + cadence), plan/rapport-skabelon (V5.3-sektioner), scripts/README, 2 strategi-references |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3320:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1.md:93:  - **Mathias-gate to-fil-flow:** rigtig løsning. Bevarer `mathias-afgoerelser.md`'s append-only-natur (Claude.ai's KRITISK 2 fund). Adskillelsen gate-fil (afventende) vs append-only log (trufne) er ren kontrakt.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3321:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1.md:108:  - **G-nummer-kandidat 2:** CODE-ESCALATE evaluering — V5.3 droppede mekanismen. Hvis behov for tredje Code-svar-type opstår i fremtidige pakker: Mathias-runde for rolle-udvidelse + entry i `mathias-afgoerelser.md`.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3322:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1.md:121:| `docs/coordination/mathias-afgoerelser.md` | 2026-05-15 (modsigelses-disciplin), 2026-05-16 (fire-dokument-disciplin), 2026-05-17 (OPGRADERING-severity bevaret) | overholdt              | nej                      |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3327:docs/coordination/rapport-historik/2026-05-22-t9-supplement-2.md:105:| `docs/coordination/mathias-afgoerelser.md`                | 2026-05-21 (PR #67) + 2026-05-21 (PR #71)      | overholdt         | —         |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3328:docs/coordination/rapport-historik/2026-05-22-t9-supplement-2.md:138:| `docs/coordination/mathias-afgoerelser.md` | nej            | ingen ændring (jf. plan — 2026-05-21-entries var allerede committed i PR #67 + PR #71)                             |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3329:docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md:35:**Bevis:** `rg --files | rg '(^|/)code-forstaaelse-samlet\.md$'` returnerede tomt. `rg -n "R7h|R-runde-2|H010|2026-05-15" docs/coordination README.md` viser aktive 2026-05-15 entries i `docs/coordination/mathias-afgoerelser.md`.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3330:docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md:42:**Faktisk tilstand:** Dokumentet er aktivt etableret: `CLAUDE.md` peger på det som kilde, H010-rapporten markerer arbejdsmetode + repo-struktur som leveret, og `mathias-afgoerelser.md` siger at H010 blev committed/merged.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3331:docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md:43:**Bevis:** `CLAUDE.md:46`, `docs/coordination/rapport-historik/2026-05-15-h010.md:35-45`, `docs/coordination/mathias-afgoerelser.md:189-197`.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3332:docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md:120:**Lokation:** docs/skabeloner/rapport-skabelon.md:59
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3333:docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md:123:**Bevis:** `rg -n "^## Vision-tjek$|^### Vision-tjek$|vision-tjek-skabelon" CLAUDE.md docs/strategi/arbejds-disciplin.md docs/skabeloner/rapport-skabelon.md` viser `docs/strategi/arbejds-disciplin.md:345` som skabelon og `CLAUDE.md:45` som reference-liste.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3334:docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md:147:**Bevis:** `git merge-base --is-ancestor a0ccdf1 HEAD; echo $?` returnerede `1`. `git show -s --oneline a0ccdf1 70487e0 3c6bc0b 27ac90b` viste `a0ccdf1 H010...`, `70487e0 H010...`, `3c6bc0b H010 committed...`, `27ac90b H010 follow-up...`. `docs/coordination/mathias-afgoerelser.md:192-197` dokumenterer rebase/merge.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3335:docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md:162:**Faktisk tilstand:** H010 commit-/merge-info er allerede skrevet i `mathias-afgoerelser.md` og `seneste-rapport.md`, men `aktiv-plan.md` er stadig i "skrives ind her efter samle-commit"-tilstand.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3336:docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md:163:**Bevis:** `docs/coordination/mathias-afgoerelser.md:189-197`; `docs/coordination/seneste-rapport.md:5`; `docs/coordination/aktiv-plan.md:5`.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3337:docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md:207:| docs/coordination/mathias-afgoerelser.md                                               | fuldt     | -                                                               |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3338:docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md:217:| docs/skabeloner/rapport-skabelon.md                                                    | fuldt     | -                                                               |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3340:docs/coordination/arkiv/H020-krav-og-data.md:124:Erstat med: tekst der kun nævner G-numre (H-numre er sporbar i mathias-afgoerelser.md + cutover-checklist.md, ikke i teknisk-gaeld.md)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3341:docs/coordination/arkiv/H020-krav-og-data.md:128:Fil: `docs/coordination/mathias-afgoerelser.md`
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3342:docs/coordination/arkiv/H020-krav-og-data.md:134:Fil: `docs/coordination/mathias-afgoerelser.md`
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3344:docs/coordination/arkiv/H020-krav-og-data.md:262:Fil: `docs/skabeloner/rapport-skabelon.md`
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3345:docs/coordination/arkiv/t9-supplement-2-plan.md:1347:| `docs/coordination/mathias-afgoerelser.md` | nej         | Tre relevante entries er allerede committed (PR #67 + PR #71). Pakken anvender dem.                                                                       |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3346:docs/coordination/arkiv/t9-supplement-2-plan.md:1371:| `docs/coordination/mathias-afgoerelser.md`          | ja          | RETNINGSGIVENDE  | 2026-05-21 superadmin-bypass-ramme + idempotency (PR #67); 2026-05-21 approve-disciplin pr. handling (PR #71); 2026-05-21 handlings-granularitet (PR #71); 2026-05-17 punkt 6 (strukturelle invarianter); 2026-05-17 punkt 12-13 (UI-rettigheder + pending-flow) | nej                |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3347:docs/coordination/rapport-historik/2026-05-18-t9.md:83:| Master-plan §1.13 "Konsekvens for permissions" omskrevet                                                                                                    | mathias-afgoerelser 2026-05-19               |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3348:docs/coordination/rapport-historik/2026-05-18-t9.md:114:T9 første forsøg (V1-V3) blev trukket tilbage 2026-05-17 efter afdæknings-session afslørede fundamentale misforståelser. Krav-dok + V4-V6-planer er på den nye T9-omstart-ramme (15 punkter, mathias-afgoerelser 2026-05-17). V4-V6 nævnte ikke RLS write-policy-strategi konkret — fix'et retroaktivt i T9-fundament-supplement. Se G050.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3349:docs/coordination/rapport-historik/2026-05-18-t9.md:124:- **mathias-afgoerelser:**
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3350:docs/coordination/rapport-historik/2026-05-19-t9-supplement.md:126:| `docs/coordination/mathias-afgoerelser.md`        | 2026-05-18 (master-plan §1.7-opdatering) + 2026-05-19 (compliance-ansvarlige) + alle T9-supplement Mathias-afgørelser | overholdt         | nej       |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3352:docs/coordination/arkiv/T9-V1-claude-ai.md:161:Per Modsigelses-disciplin (mathias-afgoerelser 2026-05-17 + arbejds-disciplin.md): planen er reviewet for modsigelse mod fire-dokument-rammen.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3353:docs/coordination/arkiv/T9-V1-claude-ai.md:167:| `docs/coordination/mathias-afgoerelser.md` | Mindre intern modsigelse mellem 2026-05-17-entry pkt 10 (Ejere-navn) og pkt 11 (ingen konkrete navne) — flagget som KOSMETISK Fund 3. Ikke plan-blokerende.                              |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3354:docs/coordination/arkiv/PR42-disciplin-fundament-merge.md:74:| 2   | `docs/coordination/mathias-afgoerelser.md`                 | Append 2 entries fra `2cab851` (2026-05-18)                                                                                                                                                    | Trivial (append-only) |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3356:docs/coordination/arkiv/PR42-disciplin-fundament-merge.md:82:| 10  | `docs/coordination/overvaagning/claude-ai-overvaagning.md` | **STØRSTE merge:** PR #42's 3 nye sektioner (forretningsspm + krav-disciplin + krav-review) + qwers-self-read + Lag 1's Cadence-sektion. **SKIP "Tre Claude.ai-roller"-sektion** per `4a9f329` | Stor                  |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3357:docs/coordination/arkiv/PR42-disciplin-fundament-merge.md:98:   - `mathias-afgoerelser.md` (append entries fra `git show 2cab851:docs/coordination/mathias-afgoerelser.md`)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3359:docs/coordination/arkiv/PR42-disciplin-fundament-merge.md:112:   - `claude-ai-overvaagning.md`
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3360:docs/coordination/arkiv/PR42-disciplin-fundament-merge.md:130:git show 2cab851 -- docs/coordination/overvaagning/claude-ai-overvaagning.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3361:docs/coordination/arkiv/PR42-disciplin-fundament-merge.md:141:1. **SKIP "Tre Claude.ai-roller"-sektion** (i `2cab851` claude-ai-overvaagning + arbejdsmetode-og-repo-struktur). Mathias fortrød via `4a9f329` 24 min senere. Roller er IMPLICIT per chat.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3364:docs/coordination/rapport-historik/2026-05-21-trin-10.md:116:| `docs/coordination/mathias-afgoerelser.md`        | 5 afgørelser 2026-05-20      | overholdt         | nej (2026-05-21 build-godkendelser dokumenteret i review-/slut-rapport, ikke løftet til ramme-entries) |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3365:docs/coordination/rapport-historik/2026-05-21-trin-10.md:148:| `docs/coordination/mathias-afgoerelser.md` | nej            | ingen ændring; relevante ramme-beslutninger lå allerede i 2026-05-20-entries; 2026-05-21 build-godkendelser dokumenteret i review-/slut-rapport |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3366:docs/coordination/rapport-historik/2026-06-05-gov-3a-ci-blockers.md:49:**G063** (rejst ved merge, Step 5-note): sporer den midlertidige `v4-slettede-docs`-allowlist i `governance-check.mjs` → fjernes når gov-6 folder dir'en. (Note: §-sektions-ref-validering uden for governance-check-scope — uændret fra gov-2.)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3367:docs/coordination/arkiv/T9-V2-claude-ai.md:30:Per Modsigelses-disciplin (mathias-afgoerelser 2026-05-17 + arbejds-disciplin.md): "Modsigelse mod krav-dokumentet eller fire-dokument-rammen er plan-blokerende. Modsigelse er ikke kandidat til G-nummer."
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3368:docs/coordination/arkiv/T9-V2-claude-ai.md:107:| `docs/coordination/mathias-afgoerelser.md` | **Ja.** 2026-05-16 pkt 2 ("Afdelinger ændres sjældent; historik bevares") og 2026-05-17 pkt 13 ("Alle ændringer med gældende dato følger fortrydelses-mekanisme") brudt af current-state-only-model + `effective_to IS NULL`-pattern.         |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3369:docs/coordination/arkiv/T9-plan.md:400:**Anbefaling (V5):** Genberegn berørt subtree ved AFTER INSERT/UPDATE/DELETE på **`org_node_versions`** når en row med `effective_from <= current_date AND (effective_to IS NULL OR effective_to > current_date)` ændres. Org-mutationer er sjældne (krav-dok mathias-afgoerelser pkt 2 + master-plan §1.7); trigger-omkostning irrelevant. Tilføj `org_node_closure` til `AUDIT_EXEMPT_SNAPSHOT_TABLES`-allowlist i `scripts/fitness.mjs`.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3370:docs/coordination/arkiv/T9-plan.md:916:- `docs/coordination/mathias-afgoerelser.md` → ingen ny entry forventet (T9 implementerer eksisterende rammebeslutninger). Hvis benchmark-fund eller andet kræver ny afgørelse: ny entry med G-nummer som plan-reference
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3371:docs/coordination/arkiv/T9-plan.md:944:| `docs/coordination/mathias-afgoerelser.md` | ja          | 2026-05-11 (vision-låsning + superadmin); 2026-05-15 (plan-leverance som kontrakt; trin 9 pause — forudsætninger nu opfyldt); 2026-05-16 (9-punkts forretningssandhed — alle mappet til konkrete plan-elementer; tx-rollback default; oprydnings-disciplin; fire-dokument-disciplin; CLI-automation-niveau); **2026-05-17 (afdæknings-session med 15 nye ramme-afgørelser — ét træ, permission-elementer i 3 niveauer som DATA, synlighed 3 værdier, Hiraki udledt af placering, knude-løs som gyldig tilstand, ingen stabs-team, cross-team via rolle, superadmin=Alt, fortrydelses-mekanisme, klient-til-team-import udskudt til trin 10)**; 2026-05-17 (flow-ændringer: Modsigelses-disciplin + Codex-opgraderings-rolle — denne plan respekterer begge) | nej                |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3372:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-plan-V3.md:23:- **Claude.ai kosmetisk 1 — Princip 8-reference upræcis:** Fjernet fra Fire-dokument-konsultations-tabel (princip 8 handler om person-entitets-unikhed, ikke team-tilknytnings-unikhed). Krav-dok pkt 7 + mathias-afgoerelser pkt 7 er den korrekte kilde.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3373:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-plan-V3.md:70:Per mathias-afgoerelser 2026-05-16 punkt 6 — samme mønster som roller fra trin 5. Sletning bryder reference-integritet og historik; is_active=false signalerer "ikke i brug, må ikke vælges til nye tilknytninger" mens row + audit-spor bevares. Triggers håndhæver at nye tilknytninger ikke kan pege på is_active=false.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3374:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-plan-V3.md:114:- **Ejerskabs-kæde Cph Sales → afdelinger → teams → relationer (mathias-afgoerelser pkt 1) →** `org_units` parent_id-hierarki + `teams.org_unit_id` FK
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3375:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-plan-V3.md:179:Inkrementel trigger sparer rows-omtræk på UPDATE, men kompleksiteten er asymmetrisk: at finde "kun de berørte (ancestor, descendant)-relationer" kræver to lookups (gammel-subtree og ny-subtree) og diff-logik. Org-mutationer er sjældne (mathias-afgoerelser pkt 2; master-plan §1.7 "Org-mutationer er sjældne; trigger-omkostning irrelevant"). Kompleksitet uden gevinst.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3376:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-plan-V3.md:221:Krav-dok ekspliciterer client-team-ejerskab som T9-leverance. Udskydning brydet krav-dok-kontrakten. Også: T9 inkluderer mathias-afgoerelser pkt 4 (klient kan aldrig dræbe team) og pkt 5 (klient ejer data) — disse skal være modelleret strukturelt i T9 selvom de først tages aktivt i brug fra trin 10+.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3377:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-plan-V3.md:407:- **Hvad:** Tabel `core_identity.teams(id, name, org_unit_id, is_active, created_at, updated_at)` med FK til org_units (ON DELETE RESTRICT — mathias-afgoerelser pkt 4 implicit); FORCE RLS; SELECT `using (true)`; INSERT/UPDATE/DELETE via RPC; audit-trigger; trigger der blokerer INSERT/UPDATE hvis org_unit.is_active=false; RPC `team_upsert` (manage). **NB:** `team_deactivate` flyttet til Step 5 fordi den skal lukke åbne `employee_team_assignments` der først eksisterer fra Step 4 (jf. V2-re-ordering — Codex KRITISK fund 2)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3378:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-plan-V3.md:573:- `docs/coordination/mathias-afgoerelser.md` → ingen ny entry forventet (T9 implementerer eksisterende rammebeslutninger). Hvis benchmark-SLA viser sig at kræve justering: ny entry "T9-benchmark-SLA justeret pga CI-runner-varians" med G-nummer som plan-reference
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3379:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-plan-V3.md:596:| `docs/strategi/vision-og-principper.md`    | ja          | Princip 2 (rettigheder i UI — scope-helpers og role_page_permissions.scope-feltet aktiveres med subtree); Princip 3 (sammenkobling eksplicit — FK på parent_id, org_unit_id, team_id, employee_id; client_id på allowlist med plan til trin 10); Princip 6 (audit på alt der ændrer data — alle T9-tabeller har audit-trigger; closure exempt via udvidet rettelse-23-mønster — kategori-udvidelse flagget under Valg 3); Princip 9 (status-modeller bevarer historik — is_active-flag erstatter sletning; versioneret tilknytning med from_date/to_date bevarer historik). **Note V2:** "én medarbejder i ét team ad gangen" (krav-dok pkt 7) er IKKE afledt af vision-princip 8 — princip 8 handler om person-entitets-unikhed på tværs af eksterne systemer (identitets-master i §1.7), ikke om team-tilknytnings-unikhed. Korrekt kilde: mathias-afgoerelser pkt 7. Reference rettet per Claude.ai V1 finding 1                                                                                                                                               | nej                                                                                                                                      |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3380:docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-plan-V3.md:598:| `docs/coordination/mathias-afgoerelser.md` | ja          | 2026-05-16 Forretningssandhed (alle 9 punkter mappet til konkrete plan-elementer — se Mathias' afgørelser-sektion ovenfor); 2026-05-15 §4 trin 9 pauset (forudsætninger opfyldt iht. krav-dok status-sektion); 2026-05-16 Tx-rollback default mønster (T9-tests + benchmark bruger BEGIN/ROLLBACK); 2026-05-16 Oprydnings-disciplin (denne plan har eksplicit Oprydnings-strategi-sektion); 2026-05-16 Fire-dokument-disciplin (denne plan har Fire-dokument-konsultation-sektion); 2026-05-15 Plan-leverance er kontrakt (alle 10 tekniske valg adresseret med konkret anbefaling + begrundelse); 2026-05-16 Master-plan sandheds-audit (klassifikations-tal-inkonsistens lukkes i Step 10; FK-coverage CI-blocker 19 håndhæves)                                                                                                                                                                                                                                                                                                                                 | nej                                                                                                                                      |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3381:docs/coordination/arkiv/rapport-historik-meta/2026-05-16-h020.md:40:| FC5: M3+M4 (mathias-afgoerelser)                     | leveret | `9c05895` — memory-datoer pr. fil (mtime + originSessionId); "22" matcher Q-pakke-historik                                                                                                |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3382:docs/coordination/arkiv/rapport-historik-meta/2026-05-16-h020.md:50:| FC15: KS4 rapport-skabelon vision-tjek-lokation      | leveret | `b6d5400` — reference peger på `docs/strategi/arbejds-disciplin.md` Vision-tjek-skabelon-sektionen (linje 381+)                                                                           |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3384:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:11:**Filer at ændre:** `docs/codex/SKILL.md` + `docs/coordination/overvaagning/claude-ai-overvaagning.md`
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3385:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:27:**Filer at ændre:** `docs/coordination/overvaagning/claude-ai-overvaagning.md` (disciplin-regler-sektion)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3386:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:42:**Filer at ændre:** `docs/skabeloner/forretningsspoergsmaal-skabelon.md` + `docs/coordination/overvaagning/claude-ai-overvaagning.md` (forfatter-sektion)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3387:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:68:**Filer at ændre:** `claude-ai-overvaagning.md` (forfatter-rolle disciplin-regler)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3388:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:74:**Forslag:** Dokumentér recon-først-pattern i `claude-ai-overvaagning.md` forfatter-sektion som obligatorisk: "Før første S-spørgsmål: lever recon-overblik med (a) ramme-låste sandheder per kilde, (b) identificerede uklarheder, (c) validerings-anmodning til Mathias. Først efter Mathias' validering: formulér S-spørgsmål ét ad gangen."
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3389:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:149:**Hvad sker:** Code skrev i krav-dok-udkast: "Hver brand er egen klient" med kilde "mathias-afgoerelser 2026-05-16 + tidligere afdæknings-session". Claude.ai verificerede mathias-afgoerelser 2026-05-16-entry og fandt at den IKKE nævner brand-konceptet. Code har overført påstanden fra Claude.ai's egen recon (Fund 6 — Claude.ai's fabrikation af "dokument-1") uden at verificere kilden selv.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3390:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:165:**Forslag:** Krav-dok-skrivnings-disciplin udvides: chat-citater fra samme dag som krav-dok skrives SKAL stabiliseres FØR krav-dok committes — enten via ny mathias-afgoerelser-entry eller via forretningsspoergsmaal-fil med S-numre. Ellers kan plan-fasen ikke validere kilde.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3391:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:205:**Hvad sker:** Code's prompt bad Claude.ai stille spørgsmål til Mathias som inkluderede "stabilisering af kilder" (mathias-afgoerelser-entry). Claude.ai påpegede: "Det er ikke et spørgsmål — det er en handling vi skal foretage. Vi kan ikke skrive krav-dok først og så stabilisere kilden bagefter. Det er den rækkefølge T9 fejlede på."
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3392:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:207:**Forslag:** Krav-dok-skrivnings-disciplin må eksplicit kræve: mathias-afgoerelser-entry SKAL være committed FØR krav-dok skrives, så krav-dok kan pege på sporbar kilde. Ikke omvendt.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3393:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:213:**Hvad sker:** Code's prompt bad Claude.ai låse "brand-afgørelsen" i ny mathias-afgoerelser-entry. Claude.ai påpegede: "Brand findes ikke i 2.0 står allerede som låst afgørelse i master-plan Appendix A. At gentage den i ny entry ville være duplikat-bogføring."
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3394:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:219:**Hvad sker:** Mathias erkendte "jeg misforstod - alt omkring migration tager vi til den tid og ikke nu". Det fjernede et helt scope-område fra trin 10. Claude.ai opdaterede mathias-afgoerelser-entry-udkastet til at fjerne migration-punkterne.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3395:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:237:5. Krav-dok-review krævede mathias-afgoerelser-entry FØRST → ekstra dokument-runde
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3396:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:240:**Sandsynlig root cause:** Trin 10 blev kørt som "Stor"-pakke per arbejdsmetode-disciplin (fuld forretningsspoergsmaal + krav-dok + krav-dok-review + mathias-afgoerelser-entry). Men trin 10 er reelt en MELLEM-pakke: master-plan §1.8 + §1.11 + tidligere mathias-afgoerelser låser allerede det meste. De reelle uklarheder var få (dato afgør sandheden, match-rolle to behov, klient-livscyklus, logo).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3397:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:246:- Hvor meget af pakke-scope er allerede låst i master-plan + mathias-afgoerelser?
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3398:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:271:**Hvad sker:** `claude-ai-overvaagning.md` instruerer Claude.ai til at læse "evt. relateret 1.0-bibel-sektion" som del af forretnings-dokumenter (linje ~41 + 138, både forfatter-rolle og krav-dok-reviewer-rolle). Men der findes ingen "bibel"-fil i repo'et. Under trin 10-review fandt Claude.ai en fil ved navn `stork-2-0.md` i sit Project (extern, uploaded af Mathias) der reelt er 1.0-bibel — naming-kollision med repo'ets `stork-2-0-master-plan.md`.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3399:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:276:2. Hvis 1.0-bibel forbliver i Project-files, skal claude-ai-overvaagning fjerne reference — eller eksplicit markere den som "Project-ekstern, ikke obligatorisk".
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3400:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:293:**Hvad sker:** Hele "fire-dokument-disciplinen" (etableret 2026-05-16) behandler vision + master-plan + mathias-afgoerelser + krav-dok som **låste autoritative kontrakter**. Disciplin-fundamentet kræver kilde-binding til alle fire og blokerer ved "modsigelse mod rammen".
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3401:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:299:- `mathias-afgoerelser` kan være **forældet** på nogle punkter — punktvise beslutninger, ikke uforanderlige sandheder
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3402:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:317:- **Fund 1 (Claude.ai-reviewer's "Hver brand er egen klient"-kilde-fejl):** Vi behandlede det som "krav-dok refererer forkert kilde". Faktisk: brand-afgørelsen er bare ikke i mathias-afgoerelser endnu (kun i 1.0-bibel/Project). Hvis vi vil låse den som ramme, skal mathias-afgoerelser opdateres. Hvis ikke, er det ikke "kilde-fejl" — det er bare uskreven afgørelse.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3403:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:329:| `mathias-afgoerelser.md`   | RETNINGSGIVENDE  | Modsigelse = TRIGGER for ny entry eller opdatering af tidligere entry. Ikke automatisk blokering. Mathias afgør.                       |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3404:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:336:3. `claude-ai-overvaagning.md` review-fokus: differentier "vision-modsigelse" (KRITISK) fra "master-plan/mathias-afgørelser-uoverensstemmelse" (rapport til Mathias, lader ham afgøre)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3405:docs/coordination/arkiv/T9-approved-claude-ai.md:66:| `docs/coordination/mathias-afgoerelser.md` | Nej. 2026-05-17 pkt 13 (alle gældende-dato-ændringer følger fortrydelses-mekanisme) håndhævet via central apply-gate.                             |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3406:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1-disciplin-fundament.md:35:| NEEDS-MATHIAS-severity (5. niveau)                                                                                        | leveret | Dokumenteret i `arbejds-disciplin.md` + `codex-overvaagning.md` + `claude-ai-overvaagning.md` |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3407:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1-disciplin-fundament.md:36:| Forretningsspørgsmål-fase (forfatter-rolle)                                                                               | leveret | Sektion i `claude-ai-overvaagning.md` + ny step 1.1 i workflow-skabelon                       |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3408:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1-disciplin-fundament.md:37:| Krav-dok-review-rolle (Claude.ai reviewer-rolle)                                                                          | leveret | Sektion i `claude-ai-overvaagning.md` + workflow-skabelon step 1.3                            |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3410:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1-disciplin-fundament.md:40:| Datamodel-STOP for Claude.ai                                                                                              | leveret | `arbejds-disciplin.md` Claude.ai MÅ IKKE + `claude-ai-overvaagning.md`                        |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3411:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1-disciplin-fundament.md:99:| `docs/coordination/mathias-afgoerelser.md`        | 2 entries fra 2026-05-18 (PR #42's append-only-log) inkluderet verbatim + kontekst-note om 4a9f329-fortrydelse | overholdt         | ingen                          |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3412:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1-disciplin-fundament.md:102:Ny mathias-afgørelse-entry leveret som del af denne pakkes commits (se `docs/coordination/mathias-afgoerelser.md` 2026-05-20-entry "Lag 1 disciplin-fundament komplet").
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3413:docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1-disciplin-fundament.md:128:- `docs/coordination/mathias-afgoerelser.md`: ny entry 2026-05-20 "Lag 1 disciplin-fundament komplet" (denne pakke)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3414:docs/coordination/arkiv/Lag1-V5.1-claude-ai.md:18:- **KRITISK 2** — WORKAROUND-gate via mathias-afgoerelser.md omdefinerer filens append-only-natur til hybrid (trufne + afventende)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3415:docs/coordination/arkiv/T9-krav-og-data.md:346:| 1   | Copenhagen Sales → afdelinger → teams → relationer (ejerskabs-kæde)                                               | mathias-afgoerelser 2026-05-16 pkt 1                                 |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3416:docs/coordination/arkiv/T9-krav-og-data.md:347:| 2   | Afdelinger ændres sjældent; historik bevares                                                                      | mathias-afgoerelser 2026-05-16 pkt 2                                 |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3417:docs/coordination/arkiv/T9-krav-og-data.md:348:| 3   | Team kan ophøre; medarbejdere bliver knude-løse                                                                   | mathias-afgoerelser 2026-05-16 pkt 3 + afdæknings-session 2026-05-17 |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3418:docs/coordination/arkiv/T9-krav-og-data.md:349:| 4   | Klient kan aldrig dræbe et team                                                                                   | mathias-afgoerelser 2026-05-16 pkt 4                                 |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3419:docs/coordination/arkiv/T9-krav-og-data.md:350:| 5   | Klient ejer sin egen data; følger klienten ved team-skift; team bevarer historik                                  | mathias-afgoerelser 2026-05-16 pkt 5                                 |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3420:docs/coordination/arkiv/T9-krav-og-data.md:351:| 6   | Aktiv/inaktiv-flag på knuder for synlighed                                                                        | mathias-afgoerelser 2026-05-16 pkt 6                                 |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3421:docs/coordination/arkiv/T9-krav-og-data.md:352:| 7   | Én medarbejder på én knude ad gangen; også stab                                                                   | mathias-afgoerelser 2026-05-16 pkt 7                                 |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3422:docs/coordination/arkiv/T9-krav-og-data.md:353:| 8   | Cross-team-adgang løses via rolle med synlighed, ikke via flere placeringer                                       | mathias-afgoerelser 2026-05-16 pkt 7 (anden del)                     |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3423:docs/coordination/arkiv/T9-krav-og-data.md:354:| 9   | Ingen hardkodet horizon for migration; manuel eksekvering                                                         | mathias-afgoerelser 2026-05-16 pkt 8                                 |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3424:docs/coordination/arkiv/T9-krav-og-data.md:355:| 10  | Teams/afdelinger anonymiseres ikke                                                                                | mathias-afgoerelser 2026-05-16 pkt 9                                 |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3425:docs/coordination/arkiv/T9-krav-og-data.md:362:| 17  | Superadmin = synlighed=Alt på alt; eneste hardkodede rolle                                                        | mathias-afgoerelser 2026-05-11 + afdæknings-session 2026-05-17       |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3426:docs/coordination/arkiv/T9-krav-og-data.md:374:| 29  | Tx-rollback default mønster for DB-tests                                                                          | mathias-afgoerelser 2026-05-16                                       |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3427:docs/coordination/arkiv/T9-krav-og-data.md:375:| 30  | Plan-leverance er kontrakt                                                                                        | mathias-afgoerelser 2026-05-15                                       |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3428:docs/coordination/arkiv/T9-krav-og-data.md:376:| 31  | Fire-dokument-disciplin obligatorisk i plan                                                                       | mathias-afgoerelser 2026-05-16                                       |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3429:docs/coordination/arkiv/T9-krav-og-data.md:377:| 32  | Oprydnings-strategi obligatorisk i plan                                                                           | mathias-afgoerelser 2026-05-16                                       |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3430:docs/coordination/arkiv/T9-krav-og-data.md:387:| `docs/coordination/mathias-afgoerelser.md` | 2026-05-11 (vision + superadmin + PageKey som data); 2026-05-15 (plan-leverance som kontrakt); 2026-05-16 (9-punkts forretningssandhed + fire-dokument-disciplin + oprydnings-disciplin); 2026-05-17 afdæknings-session (skal tilføjes som ny entry samtidig med dette krav-dok)                                                          |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3431:docs/coordination/arkiv/T9-krav-og-data.md:409:- `docs/coordination/mathias-afgoerelser.md` — afdæknings-session 2026-05-17 entry tilføjes (Mathias-handling)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3432:docs/coordination/arkiv/t9-supplement-2-krav-og-data.md:33:- **Kilde:** Mathias chat 2026-05-21; mathias-afgoerelser 2026-05-17 (T9-omstart-ramme punkt 3 — to akser: kan_tilgå/kan_skrive).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3433:docs/coordination/arkiv/t9-supplement-2-krav-og-data.md:39:- **Kilde:** vision-princip 2; mathias-afgoerelser 2026-05-17 punkt 10; mathias-afgoerelser 2026-05-21 (bypass-ramme).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3434:docs/coordination/arkiv/t9-supplement-2-krav-og-data.md:47:- **Kilde:** mathias-afgoerelser 2026-05-17 punkt 13.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3435:docs/coordination/arkiv/t9-supplement-2-krav-og-data.md:53:- **Kilde:** mathias-afgoerelser 2026-05-17 punkt 6.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3436:docs/coordination/arkiv/t9-supplement-2-krav-og-data.md:108:Begrundelse: superadmin må alt, jf. mathias-afgoerelser 2026-05-21 (bypass-ramme).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3437:docs/coordination/arkiv/t9-supplement-2-krav-og-data.md:110:- **Kilde:** mathias-afgoerelser 2026-05-21 (ny approve-disciplin — committes som separat entry FØR plan-fase).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3438:docs/coordination/arkiv/t9-supplement-2-krav-og-data.md:137:- **Kilde:** mathias-afgoerelser 2026-05-21 (ny handlings-granularitet — committes som separat entry).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3439:docs/coordination/arkiv/t9-supplement-2-krav-og-data.md:166:- **Kilde:** mathias-afgoerelser 2026-05-21 (bypass-ramme + idempotency-model).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3440:docs/coordination/arkiv/t9-supplement-2-krav-og-data.md:215:To nye afgørelser skal committes som separate entries i `mathias-afgoerelser.md` så plan har stabil committed kilde:
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3452:    27	### [G063] LAV — midlertidig governance-check-allowlist for v4-slettede-docs
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3454:    29	- **Beskrivelse:** `scripts/governance-check.mjs` `MISSING_PATH_ALLOWLIST` har en entry for `docs/coordination/v4-slettede-docs` (klasse `scope-excluded-local`). Tilføjet i gov-docs-housekeeping så clean-checkout `governance:check` er grøn, mens dir'en stadig ligger untracked og afventer fold i gov-6.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3457:    32	- **Skal løses:** Når **gov-6** folder `docs/coordination/v4-slettede-docs/` til git-history → **fjern allowlist-entryen igen**. Ejer: Code (i gov-6). Gov-6-krav-dok §6 dækker selve foldningen; denne G sporer allowlist-oprydningen.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3466:/bin/bash -lc 'git ls-tree -r --name-only HEAD docs/coordination/v4-slettede-docs | wc -l' in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3483:/bin/bash -lc 'git ls-tree -r --name-only 4fe5164 docs/coordination/v4-slettede-docs | wc -l' in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3488:Jeg har nok til fund nu. Jeg tjekker kun kort, om de nye `v4-slettede-docs` er markeret som arkiv/ikke-aktivt på en måde der kunne ændre severity; hovedafvigelsen er dog stadig, at selve foldningen var placeret i gov-6.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3490:/bin/bash -lc "sed -n '1,120p' docs/coordination/v4-slettede-docs/INDEX.md" in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3507:| `overvaagning--claude-ai-overvaagning.md`        | docs/coordination/overvaagning/claude-ai-overvaagning.md        | `4e65fa80a9`  | 2026-05-22 | V4 doc #3: konsolidér disciplin → ÉN fil                                                |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3512:| `skabelon--rapport-skabelon.md`                  | docs/skabeloner/rapport-skabelon.md                             | `4e65fa80a9`  | 2026-05-22 | V4 doc #3: konsolidér disciplin → ÉN fil                                                |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3517:| `mathias-afgoerelser--slettet-version.md`        | docs/coordination/mathias-afgoerelser.md                        | `56c017a967`  | 2026-05-22 | V4 doc #5: arkivér forældede filer + slet rod                                           |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3519:**NB om `mathias-afgoerelser`:** den slettede version (`docs/coordination/mathias-afgoerelser.md`) er gengivet her. En arkiveret variant lever desuden i `docs/coordination/arkiv/mathias-afgoerelser-historik.md` (kan læses direkte) — de to er ikke verificeret identiske.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3534:Commit `2ae1a37962` "V4 doc #6: slet iterations-mapper indhold (bevarelse-disciplin §4)" slettede ~40 filer under `docs/coordination/codex-reviews/` (review-runder for h020/h024/t9/t9-supplement/Lag1/trin-10/workflow-skabelon) + `docs/coordination/plan-feedback/` (Lag1-feedback/-prompt/-slut-rapport-filer) + de to mappers `README.md`. Disse er per-runde proces-artefakter; ikke genskrevet her. Sig til hvis de også skal materialiseres.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3547:     5	<!-- aktiv-pakke: gov-docs-renhed fase: build -->
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3549:     7	**Aktuel:** **gov-docs-renhed** under build — plan: `docs/coordination/gov-docs-renhed-plan.md` (V4, Codex-approved runde 4 m. §8.1-SVAR: INGEN-MODSIGELSE; qwerg 2026-06-10). Derefter i rest-sekvens: gov-4-branch-protection (gov-3 CI-blockers fuldt færdig). **Merged:** gov-1 (paritet, 2026-06-04) · gov-2 (vagt, PR #93) · gov-docs-housekeeping (krav-dok-familie, PR #94) · **gov-3a** (4 §3-checks #4/#7/#16/#17 + zone-§3-fjernelse, PR #95, main @ c32097c; ikke-required indtil gov-4) · **gov-3b-1** (#19 FK-dækning + #6 indeks-pr-policy, PR #96, main @ a88d217; 23→25 fitness-checks; 0 SQL-/indeks-migrations; 3 sale-FK'er `FK_PENDING` → Trin 14 [H025]) · **gov-3b-2** (#10 SECDEF-markør-disciplin, PR #101, main @ `165833c`; 25→26 fitness-checks; 0 migrations; #18 udskilt → gov-3b-3 + [G065]) · **gov-3b-3a** (#18 del 1: §1.1:160-reconcile + 9 `permission_*` INVOKER→SECDEF, PR #103, main @ `c846105`; 4 migrations live-applikeret; G065 stadig åben → 3b) · **gov-3b-3b** (#18 del 2: sidste 5 INVOKER→SECDEF + REVOKE authenticated-write + #18-check, PR #105, main @ `7be6511`; 4 migrations live; **[G065] LØST**; gov-3 CI-blockers fuldt færdig). Rest-sekvens: gov-4-branch-protection → gov-5-automation → gov-6-arkiv-fold. Åbne G-numre: G061 (comment-parity, før gov-4), G062 (recurring types-drift), G063 (v4-slettede-docs-allowlist → gov-6). (G065 LØST i gov-3b-3b.) Åbne H: [H025] (Trin 14: sale-FK'er + orphan-cleanup). Krav-dok (ét dok over de 6): `docs/coordination/governance-vagt-krav-og-data.md` ✓.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3564:/bin/bash -lc 'rg -n "v4-slettede-docs|gov-6|scope-excluded-local|untracked|aldrig committet" docs/coordination/v4-slettede-docs/INDEX.md docs/teknisk/teknisk-gaeld.md scripts/governance-check.mjs docs/coordination/gov-docs-renhed-plan.md docs/coordination/gov-docs-renhed-krav-og-data.md' in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3566:docs/coordination/gov-docs-renhed-krav-og-data.md:119:- **gov-6 (arkiv-fold)** — arkiv → git-history + `v4-slettede-docs/` (untracked) +
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3568:docs/coordination/gov-docs-renhed-plan.md:80:  v4-slettede-docs og rapport-historik):
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3571:docs/coordination/gov-docs-renhed-plan.md:212:gov-6 arkiv-fold (G063 + v4-slettede-docs) · P3-spor · semantisk
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3574:scripts/governance-check.mjs:29:  "docs/coordination/v4-slettede-docs",
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3576:scripts/governance-check.mjs:90:    path: "docs/coordination/v4-slettede-docs",
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3579:docs/teknisk/teknisk-gaeld.md:27:### [G063] LAV — midlertidig governance-check-allowlist for v4-slettede-docs
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3580:docs/teknisk/teknisk-gaeld.md:29:- **Beskrivelse:** `scripts/governance-check.mjs` `MISSING_PATH_ALLOWLIST` har en entry for `docs/coordination/v4-slettede-docs` (klasse `scope-excluded-local`). Tilføjet i gov-docs-housekeeping så clean-checkout `governance:check` er grøn, mens dir'en stadig ligger untracked og afventer fold i gov-6.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3581:docs/teknisk/teknisk-gaeld.md:32:- **Skal løses:** Når **gov-6** folder `docs/coordination/v4-slettede-docs/` til git-history → **fjern allowlist-entryen igen**. Ejer: Code (i gov-6). Gov-6-krav-dok §6 dækker selve foldningen; denne G sporer allowlist-oprydningen.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3585:/bin/bash -lc "git show --name-status --oneline 42bfb55 -- docs/coordination/v4-slettede-docs | sed -n '1,80p'" in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3588:A	docs/coordination/v4-slettede-docs/INDEX.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3589:A	docs/coordination/v4-slettede-docs/T9-supplement-skitse.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3590:A	docs/coordination/v4-slettede-docs/afdaekning--g043-g044-data-code-2026-05-16.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3591:A	docs/coordination/v4-slettede-docs/afdaekning--g043-g044-data-codex-2026-05-16.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3592:A	docs/coordination/v4-slettede-docs/arbejds-disciplin.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3593:A	docs/coordination/v4-slettede-docs/arbejdsmetode-og-repo-struktur.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3594:A	docs/coordination/v4-slettede-docs/bygge-status.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3595:A	docs/coordination/v4-slettede-docs/lag-e-beregningsmotor-krav.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3596:A	docs/coordination/v4-slettede-docs/lag-e-tidsregistrering-krav.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3597:A	docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3598:A	docs/coordination/v4-slettede-docs/overvaagning--claude-ai-overvaagning.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3599:A	docs/coordination/v4-slettede-docs/overvaagning--code-overvaagning.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3600:A	docs/coordination/v4-slettede-docs/overvaagning--codex-overvaagning.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3601:A	docs/coordination/v4-slettede-docs/skabelon--codex-review-prompt.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3602:A	docs/coordination/v4-slettede-docs/skabelon--plan-skabelon.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3603:A	docs/coordination/v4-slettede-docs/skabelon--rapport-skabelon.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3604:A	docs/coordination/v4-slettede-docs/skabelon--workflow-skabelon.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3607:Jeg fandt en egentlig routing-fejl ved siden af scope/status: `codex-review.sh` siger V5 severity-routing, men parseren blokerer kun `KRITISK`, ikke den kritiske subtype `MANGLENDE-EKSISTERENDE-BEVARELSE`. Det er relevant for netop review-fokus i denne runde.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3628:    16	# Output: docs/coordination/codex-reviews/<dato>-<pakke>-runde-<N>.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3763:   138	**Slettes ved pakke-luk:** `<pakke>-status.md` · alle `plan-feedback/<pakke>-V<n>-*` · alle `codex-reviews/<pakke>-runde-*` · afgjorte `mathias-gate/<pakke>-*` · plan-versioner V1..Vn (git-history bevarer sporet).
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3774:   149	| **MANGLENDE-EKSISTERENDE-BEVARELSE** | KRITISK-undertype: mister gate/kommentar/kolonne fra eksisterende body uden begrundelse                                                          |
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3799:   417	- MANGLENDE-EKSISTERENDE-BEVARELSE (KRITISK-undertype)
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3810:/bin/bash -lc 'rg -n "MANGLENDE-EKSISTERENDE-BEVARELSE|KRITISK|MELLEM|NEEDS-MATHIAS" scripts/codex-review.sh scripts/governance-check.selftest.mjs docs/coordination/gov-docs-renhed-plan.md' in /home/mathias/stork-2.0
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3826:docs/coordination/gov-docs-renhed-plan.md:520:MANGLENDE-EKSISTERENDE-BEVARELSE.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3837:docs/coordination/gov-docs-renhed-plan.md:601:**Bevares 1:1 (MANGLENDE-EKSISTERENDE-BEVARELSE-tjek):** argument-parsing
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3856:scripts/codex-review.sh:259:MANGLENDE-EKSISTERENDE-BEVARELSE.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3860:Konkret afvigelse: Krav-dok og Plan V4 siger eksplicit at `v4-slettede-docs/`/arkiv-fold hører til gov-6, ikke denne pakke. Builden tilføjer alligevel 17 tracked filer under `docs/coordination/v4-slettede-docs/` i batch 2.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3868:Konkret afvigelse: Disciplin §5 definerer `MANGLENDE-EKSISTERENDE-BEVARELSE` som KRITISK-undertype, og §10.4 beder Codex flage den. Parseren stopper kun på `KRITISK`, ikke på denne subtype; `--parse-test` har heller ingen fixture for den.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3869:Anbefalet handling: V6-rettelse — route `[MANGLENDE-EKSISTERENDE-BEVARELSE]` til exit 2 og tilføj parse-test-case.
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3877:Konkret afvigelse: Krav-dok og Plan V4 siger eksplicit at `v4-slettede-docs/`/arkiv-fold hører til gov-6, ikke denne pakke. Builden tilføjer alligevel 17 tracked filer under `docs/coordination/v4-slettede-docs/` i batch 2.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3885:Konkret afvigelse: Disciplin §5 definerer `MANGLENDE-EKSISTERENDE-BEVARELSE` som KRITISK-undertype, og §10.4 beder Codex flage den. Parseren stopper kun på `KRITISK`, ikke på denne subtype; `--parse-test` har heller ingen fixture for den.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3886:Anbefalet handling: V6-rettelse — route `[MANGLENDE-EKSISTERENDE-BEVARELSE]` til exit 2 og tilføj parse-test-case.
docs/coordination/arkiv/H020-krav-og-data.md:124:Erstat med: tekst der kun nævner G-numre (H-numre er sporbar i mathias-afgoerelser.md + cutover-checklist.md, ikke i teknisk-gaeld.md)
docs/coordination/arkiv/H020-krav-og-data.md:128:Fil: `docs/coordination/mathias-afgoerelser.md`
docs/coordination/arkiv/H020-krav-og-data.md:134:Fil: `docs/coordination/mathias-afgoerelser.md`
docs/coordination/arkiv/H020-krav-og-data.md:262:Fil: `docs/skabeloner/rapport-skabelon.md`
docs/coordination/arkiv/T9-approved-claude-ai.md:66:| `docs/coordination/mathias-afgoerelser.md` | Nej. 2026-05-17 pkt 13 (alle gældende-dato-ændringer følger fortrydelses-mekanisme) håndhævet via central apply-gate.                             |
docs/coordination/v4-slettede-docs/overvaagning--codex-overvaagning.md:68:   - Slut-rapport-review: `docs/coordination/codex-reviews/<dato>-<pakke>-runde-<n>.md`
docs/coordination/v4-slettede-docs/overvaagning--codex-overvaagning.md:80:3. Fund flagges som **BUILD-KODE-FUND N**.M (batch-nummer + fund-nummer i batch) i `docs/coordination/codex-reviews/<dato>-<pakke>-build-batch-<N>.md`
docs/coordination/v4-slettede-docs/overvaagning--codex-overvaagning.md:179:- Argumentere fra mathias-afgoerelser eller chat-historik (du har ikke adgang; det er Claude.ai's særegne kilde)
docs/coordination/v4-slettede-docs/overvaagning--codex-overvaagning.md:328:- GitHub App 403 på review-handling → workaround: commit feedback som fil i `docs/coordination/codex-reviews/`
docs/coordination/arkiv/i001-arbejde/audit/audit-code-2026-05-15.md:81:**Bevis:** H001-H003+H006 nævnes som cutover-blockers (`docs/coordination/cutover-checklist.md:22-25`), H010+H012+H016+H018 nævnes i mathias-afgoerelser, men ingen har formel hjemme.
docs/coordination/arkiv/i001-arbejde/audit/audit-code-2026-05-15.md:86:**Lokation:** `docs/coordination/mathias-afgoerelser.md:19-22`
docs/coordination/arkiv/i001-arbejde/audit/audit-code-2026-05-15.md:94:**Lokation:** `docs/coordination/mathias-afgoerelser.md:94-97`
docs/coordination/arkiv/i001-arbejde/audit/audit-code-2026-05-15.md:111:**Påstand (citat):** Mappetræ angiver `strategi/` indeholder 4 filer (vision-og-principper, master-plan, arbejds-disciplin, bygge-status); `skabeloner/` indeholder 2 (plan-skabelon, rapport-skabelon); `coordination/` indeholder 6 entries.
docs/coordination/arkiv/i001-arbejde/audit/audit-code-2026-05-15.md:227:**Påstand (citat):** "Automatiseret Codex-trigger ... GitHub Action der trigger på commits til `docs/coordination/seneste-rapport.md`. Action kører Codex CLI mod rapport + diff'et siden sidste validering. Output committes som `docs/coordination/codex-reviews/<timestamp>.md`. Ingen auto-block, ingen auto-merge — Mathias ser begge rapporter og afgør."
docs/coordination/arkiv/i001-arbejde/audit/audit-code-2026-05-15.md:266:| `docs/coordination/mathias-afgoerelser.md`              | delvist (L1-100 + L175-200)                                          | 200+ linjer; entries 1-15 og sidste 5 fuldt                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
docs/coordination/arkiv/i001-arbejde/audit/audit-code-2026-05-15.md:270:| `docs/coordination/codex-reviews/README.md`             | fuldt                                                                | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
docs/coordination/arkiv/i001-arbejde/audit/audit-code-2026-05-15.md:277:| `docs/skabeloner/rapport-skabelon.md`                   | ikke læst i denne runde                                              | spot-check via H010-rapport                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
docs/coordination/arkiv/rapport-historik-meta/2026-05-15-h010.md:36:| H010.3 plan-skabelon + rapport-skabelon                 | leveret            | `docs/skabeloner/{plan,rapport}-skabelon.md` — Formål-blockquote + lag-boundary-rapport-format ordret fra scope-dokumentet |
docs/coordination/arkiv/rapport-historik-meta/2026-05-15-h010.md:38:| H010.5 mathias-afgoerelser.md                           | leveret            | 33 entries, 2 flagget [ikke verificeret] / ingen-commit-hash                                                               |
docs/coordination/arkiv/rapport-historik-meta/2026-05-15-h010.md:75:5. **mathias-afgoerelser.md Entry "Problem 1-4"**
docs/coordination/arkiv/rapport-historik-meta/2026-05-15-h010.md:81:6. **mathias-afgoerelser.md Entry "Huskelisten ligger ikke i repo"**
docs/coordination/arkiv/rapport-historik-meta/2026-05-15-h010.md:98:  - **Én sandhed:** `mathias-afgoerelser.md` etablerer ÉN autoritativ kilde for låste afgørelser.
docs/coordination/arkiv/rapport-historik-meta/2026-05-15-h010.md:134:  - Append-commit med "H010 committed"-entry i `mathias-afgoerelser.md` (følger denne rapport).
docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md:35:**Bevis:** `rg --files | rg '(^|/)code-forstaaelse-samlet\.md$'` returnerede tomt. `rg -n "R7h|R-runde-2|H010|2026-05-15" docs/coordination README.md` viser aktive 2026-05-15 entries i `docs/coordination/mathias-afgoerelser.md`.
docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md:42:**Faktisk tilstand:** Dokumentet er aktivt etableret: `CLAUDE.md` peger på det som kilde, H010-rapporten markerer arbejdsmetode + repo-struktur som leveret, og `mathias-afgoerelser.md` siger at H010 blev committed/merged.
docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md:43:**Bevis:** `CLAUDE.md:46`, `docs/coordination/rapport-historik/2026-05-15-h010.md:35-45`, `docs/coordination/mathias-afgoerelser.md:189-197`.
docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md:120:**Lokation:** docs/skabeloner/rapport-skabelon.md:59
docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md:123:**Bevis:** `rg -n "^## Vision-tjek$|^### Vision-tjek$|vision-tjek-skabelon" CLAUDE.md docs/strategi/arbejds-disciplin.md docs/skabeloner/rapport-skabelon.md` viser `docs/strategi/arbejds-disciplin.md:345` som skabelon og `CLAUDE.md:45` som reference-liste.
docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md:147:**Bevis:** `git merge-base --is-ancestor a0ccdf1 HEAD; echo $?` returnerede `1`. `git show -s --oneline a0ccdf1 70487e0 3c6bc0b 27ac90b` viste `a0ccdf1 H010...`, `70487e0 H010...`, `3c6bc0b H010 committed...`, `27ac90b H010 follow-up...`. `docs/coordination/mathias-afgoerelser.md:192-197` dokumenterer rebase/merge.
docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md:162:**Faktisk tilstand:** H010 commit-/merge-info er allerede skrevet i `mathias-afgoerelser.md` og `seneste-rapport.md`, men `aktiv-plan.md` er stadig i "skrives ind her efter samle-commit"-tilstand.
docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md:163:**Bevis:** `docs/coordination/mathias-afgoerelser.md:189-197`; `docs/coordination/seneste-rapport.md:5`; `docs/coordination/aktiv-plan.md:5`.
docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md:207:| docs/coordination/mathias-afgoerelser.md                                               | fuldt     | -                                                               |
docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md:211:| docs/coordination/codex-reviews/README.md                                              | fuldt     | -                                                               |
docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md:217:| docs/skabeloner/rapport-skabelon.md                                                    | fuldt     | -                                                               |
docs/coordination/arkiv/rapport-historik-meta/2026-05-16-h024.md:12:- **Revision:** denne fil blev opdateret 2026-05-16 efter Codex-review runde 1 (`docs/coordination/codex-reviews/2026-05-16-h024-runde-2.md`, commit `8018cb2`) og Claude.ai-review runde 2 (`docs/coordination/codex-reviews/2026-05-16-h024-runde-2-claude-ai.md`, commit `f979e1a`) — build-range rettet til `8f46615^..30fbdf4` (var: `8f46615..30fbdf4`, ekskluderede cluster 1); migration-gate-tal rettet til 78/364 (var: 75/347); cleanup-leverance + G017-status nuanceret til "kode-leveret/kode-løst; live-effekt afventer push"; grep-påstand om `r4_salary_corrections_cleanup` re-scoped til aktiv-state-tjek.
docs/coordination/arkiv/rapport-historik-meta/2026-05-16-h024.md:104:- `docs/coordination/codex-reviews/2026-05-16-h024-runde-1.md` — anden konvention end plan-feedback (per V2-plan)
docs/coordination/arkiv/rapport-historik-meta/2026-05-16-h024.md:113:- `docs/coordination/mathias-afgoerelser.md`: ny entry "Tx-rollback er default mønster for DB-tests; fitness-check håndhæver"
docs/coordination/arkiv/rapport-historik-meta/2026-05-16-h024.md:124:- `grep -r "H024-krav-og-data\|H024-plan" docs/` returnerer kun referencer i `docs/coordination/arkiv/`, `docs/strategi/`, `docs/coordination/codex-reviews/`, og `rapport-historik/`. Ingen referencer fra arbejds-state-filer.
docs/coordination/arkiv/rapport-historik-meta/2026-05-16-h024.md:125:- G044's `Berørte tests`-liste i `docs/teknisk/teknisk-gaeld.md` indeholder ikke længere `r4_salary_corrections_cleanup` som test-reference; kun en historisk note om at fejl-referencen blev rettet (cluster 4). Strengen forekommer fortsat som historisk reference i `docs/coordination/arkiv/H024-*`, afdæknings-rapporter, codex-reviews og denne rapport selv — alle bevidste historiske spor.
docs/coordination/arkiv/rapport-historik-meta/2026-05-16-h024.md:127:**Verifikation:** alle plan-grep-tjek der fjerner aktive arbejds-state-referencer returnerer 0 hits (jf. linjen ovenfor); historiske referencer i arkiv/afdaekning/codex-reviews er forventet.
docs/coordination/v4-slettede-docs/overvaagning--claude-ai-overvaagning.md:9:- **`qwers`** — Mathias paster denne som første besked i chat'en. Du læser `docs/coordination/overvaagning/claude-ai-overvaagning.md` via Filesystem-MCP og bekræfter rollen kort: "Rolle bekræftet som Claude.ai. Klar til qwerr eller pakke-kontekst."
docs/coordination/v4-slettede-docs/overvaagning--claude-ai-overvaagning.md:49:| **Claude.ai** | `<pakke>-forretningsgang-claude-ai.md` (din rapport) | vision + master-plan + mathias-afgoerelser + interne chat-projekt |
docs/coordination/v4-slettede-docs/overvaagning--claude-ai-overvaagning.md:131:**Vigtigt:** Beslutninger der opstår via sparring skal stabiliseres i repo-kilde (mathias-afgoerelser-entry, krav-dok, eller plan) FØR de bruges som kontrakt. Chat-citater er ikke verifificerbar kilde for Code/Codex senere.
docs/coordination/v4-slettede-docs/overvaagning--claude-ai-overvaagning.md:144:- Entry i `docs/coordination/mathias-afgoerelser.md` (citeret med dato)
docs/coordination/v4-slettede-docs/overvaagning--claude-ai-overvaagning.md:185:   - Slut-rapport-review: `docs/coordination/codex-reviews/<dato>-<pakke>-runde-<n>-claude-ai.md` (samme mappe som Codex' for at holde dem samlet)
docs/coordination/v4-slettede-docs/overvaagning--claude-ai-overvaagning.md:202:3. Pakken introducerer ny ramme-niveau-beslutning (typisk strategisk retning-skift), men der er ingen entry i `docs/coordination/mathias-afgoerelser.md` som del af pakkens commits
docs/coordination/v4-slettede-docs/overvaagning--claude-ai-overvaagning.md:223:- **KRITISK** — slut-rapport hævder at noget er leveret men det er ikke i koden, ELLER fire-dokument-verifikations-sektionen mangler eller er forkert udfyldt, ELLER pakken introducerede strategisk retning-skift uden mathias-afgoerelser-entry. STOPPER slut-rapport i alle runder.
docs/coordination/arkiv/PR42-disciplin-fundament-merge.md:57:| `8a2a830` | T9 post-merge doc-updates (bygge-status, teknisk-gaeld, aktiv-plan, slut-rapport, codex-reviews-arkiv) | ✅ Merged via PR #41 (f1c6043) |
docs/coordination/arkiv/PR42-disciplin-fundament-merge.md:74:| 2   | `docs/coordination/mathias-afgoerelser.md`                 | Append 2 entries fra `2cab851` (2026-05-18)                                                                                                                                                    | Trivial (append-only) |
docs/coordination/arkiv/PR42-disciplin-fundament-merge.md:82:| 10  | `docs/coordination/overvaagning/claude-ai-overvaagning.md` | **STØRSTE merge:** PR #42's 3 nye sektioner (forretningsspm + krav-disciplin + krav-review) + qwers-self-read + Lag 1's Cadence-sektion. **SKIP "Tre Claude.ai-roller"-sektion** per `4a9f329` | Stor                  |
docs/coordination/arkiv/PR42-disciplin-fundament-merge.md:98:   - `mathias-afgoerelser.md` (append entries fra `git show 2cab851:docs/coordination/mathias-afgoerelser.md`)
docs/coordination/arkiv/PR42-disciplin-fundament-merge.md:112:   - `claude-ai-overvaagning.md`
docs/coordination/arkiv/PR42-disciplin-fundament-merge.md:130:git show 2cab851 -- docs/coordination/overvaagning/claude-ai-overvaagning.md
docs/coordination/arkiv/PR42-disciplin-fundament-merge.md:141:1. **SKIP "Tre Claude.ai-roller"-sektion** (i `2cab851` claude-ai-overvaagning + arbejdsmetode-og-repo-struktur). Mathias fortrød via `4a9f329` 24 min senere. Roller er IMPLICIT per chat.
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1.md:23:Doc-opdateringer: 8 filer (workflow-skabelon, codex-review-prompt, 3 overvaagning-docs, plan-skabelon, rapport-skabelon, scripts/README, 2 strategi-references)
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1.md:46:| I — Doc-opdateringer                           | leveret | 7 filer: workflow-skabelon (+102 linjer V5.3-synk), 3 overvaagning-docs (svar-typer + cadence), plan/rapport-skabelon (V5.3-sektioner), scripts/README, 2 strategi-references |
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1.md:93:  - **Mathias-gate to-fil-flow:** rigtig løsning. Bevarer `mathias-afgoerelser.md`'s append-only-natur (Claude.ai's KRITISK 2 fund). Adskillelsen gate-fil (afventende) vs append-only log (trufne) er ren kontrakt.
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1.md:108:  - **G-nummer-kandidat 2:** CODE-ESCALATE evaluering — V5.3 droppede mekanismen. Hvis behov for tredje Code-svar-type opstår i fremtidige pakker: Mathias-runde for rolle-udvidelse + entry i `mathias-afgoerelser.md`.
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1.md:121:| `docs/coordination/mathias-afgoerelser.md` | 2026-05-15 (modsigelses-disciplin), 2026-05-16 (fire-dokument-disciplin), 2026-05-17 (OPGRADERING-severity bevaret) | overholdt              | nej                      |
docs/coordination/arkiv/T9-V2-claude-ai.md:30:Per Modsigelses-disciplin (mathias-afgoerelser 2026-05-17 + arbejds-disciplin.md): "Modsigelse mod krav-dokumentet eller fire-dokument-rammen er plan-blokerende. Modsigelse er ikke kandidat til G-nummer."
docs/coordination/arkiv/T9-V2-claude-ai.md:107:| `docs/coordination/mathias-afgoerelser.md` | **Ja.** 2026-05-16 pkt 2 ("Afdelinger ændres sjældent; historik bevares") og 2026-05-17 pkt 13 ("Alle ændringer med gældende dato følger fortrydelses-mekanisme") brudt af current-state-only-model + `effective_to IS NULL`-pattern.         |
docs/coordination/arkiv/Lag1-V5.1-claude-ai.md:18:- **KRITISK 2** — WORKAROUND-gate via mathias-afgoerelser.md omdefinerer filens append-only-natur til hybrid (trufne + afventende)
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:11:**Filer at ændre:** `docs/codex/SKILL.md` + `docs/coordination/overvaagning/claude-ai-overvaagning.md`
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:27:**Filer at ændre:** `docs/coordination/overvaagning/claude-ai-overvaagning.md` (disciplin-regler-sektion)
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:42:**Filer at ændre:** `docs/skabeloner/forretningsspoergsmaal-skabelon.md` + `docs/coordination/overvaagning/claude-ai-overvaagning.md` (forfatter-sektion)
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:68:**Filer at ændre:** `claude-ai-overvaagning.md` (forfatter-rolle disciplin-regler)
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:74:**Forslag:** Dokumentér recon-først-pattern i `claude-ai-overvaagning.md` forfatter-sektion som obligatorisk: "Før første S-spørgsmål: lever recon-overblik med (a) ramme-låste sandheder per kilde, (b) identificerede uklarheder, (c) validerings-anmodning til Mathias. Først efter Mathias' validering: formulér S-spørgsmål ét ad gangen."
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:149:**Hvad sker:** Code skrev i krav-dok-udkast: "Hver brand er egen klient" med kilde "mathias-afgoerelser 2026-05-16 + tidligere afdæknings-session". Claude.ai verificerede mathias-afgoerelser 2026-05-16-entry og fandt at den IKKE nævner brand-konceptet. Code har overført påstanden fra Claude.ai's egen recon (Fund 6 — Claude.ai's fabrikation af "dokument-1") uden at verificere kilden selv.
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:165:**Forslag:** Krav-dok-skrivnings-disciplin udvides: chat-citater fra samme dag som krav-dok skrives SKAL stabiliseres FØR krav-dok committes — enten via ny mathias-afgoerelser-entry eller via forretningsspoergsmaal-fil med S-numre. Ellers kan plan-fasen ikke validere kilde.
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:205:**Hvad sker:** Code's prompt bad Claude.ai stille spørgsmål til Mathias som inkluderede "stabilisering af kilder" (mathias-afgoerelser-entry). Claude.ai påpegede: "Det er ikke et spørgsmål — det er en handling vi skal foretage. Vi kan ikke skrive krav-dok først og så stabilisere kilden bagefter. Det er den rækkefølge T9 fejlede på."
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:207:**Forslag:** Krav-dok-skrivnings-disciplin må eksplicit kræve: mathias-afgoerelser-entry SKAL være committed FØR krav-dok skrives, så krav-dok kan pege på sporbar kilde. Ikke omvendt.
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:213:**Hvad sker:** Code's prompt bad Claude.ai låse "brand-afgørelsen" i ny mathias-afgoerelser-entry. Claude.ai påpegede: "Brand findes ikke i 2.0 står allerede som låst afgørelse i master-plan Appendix A. At gentage den i ny entry ville være duplikat-bogføring."
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:219:**Hvad sker:** Mathias erkendte "jeg misforstod - alt omkring migration tager vi til den tid og ikke nu". Det fjernede et helt scope-område fra trin 10. Claude.ai opdaterede mathias-afgoerelser-entry-udkastet til at fjerne migration-punkterne.
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:237:5. Krav-dok-review krævede mathias-afgoerelser-entry FØRST → ekstra dokument-runde
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:240:**Sandsynlig root cause:** Trin 10 blev kørt som "Stor"-pakke per arbejdsmetode-disciplin (fuld forretningsspoergsmaal + krav-dok + krav-dok-review + mathias-afgoerelser-entry). Men trin 10 er reelt en MELLEM-pakke: master-plan §1.8 + §1.11 + tidligere mathias-afgoerelser låser allerede det meste. De reelle uklarheder var få (dato afgør sandheden, match-rolle to behov, klient-livscyklus, logo).
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:246:- Hvor meget af pakke-scope er allerede låst i master-plan + mathias-afgoerelser?
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:271:**Hvad sker:** `claude-ai-overvaagning.md` instruerer Claude.ai til at læse "evt. relateret 1.0-bibel-sektion" som del af forretnings-dokumenter (linje ~41 + 138, både forfatter-rolle og krav-dok-reviewer-rolle). Men der findes ingen "bibel"-fil i repo'et. Under trin 10-review fandt Claude.ai en fil ved navn `stork-2-0.md` i sit Project (extern, uploaded af Mathias) der reelt er 1.0-bibel — naming-kollision med repo'ets `stork-2-0-master-plan.md`.
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:276:2. Hvis 1.0-bibel forbliver i Project-files, skal claude-ai-overvaagning fjerne reference — eller eksplicit markere den som "Project-ekstern, ikke obligatorisk".
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:293:**Hvad sker:** Hele "fire-dokument-disciplinen" (etableret 2026-05-16) behandler vision + master-plan + mathias-afgoerelser + krav-dok som **låste autoritative kontrakter**. Disciplin-fundamentet kræver kilde-binding til alle fire og blokerer ved "modsigelse mod rammen".
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:299:- `mathias-afgoerelser` kan være **forældet** på nogle punkter — punktvise beslutninger, ikke uforanderlige sandheder
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:317:- **Fund 1 (Claude.ai-reviewer's "Hver brand er egen klient"-kilde-fejl):** Vi behandlede det som "krav-dok refererer forkert kilde". Faktisk: brand-afgørelsen er bare ikke i mathias-afgoerelser endnu (kun i 1.0-bibel/Project). Hvis vi vil låse den som ramme, skal mathias-afgoerelser opdateres. Hvis ikke, er det ikke "kilde-fejl" — det er bare uskreven afgørelse.
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:329:| `mathias-afgoerelser.md`   | RETNINGSGIVENDE  | Modsigelse = TRIGGER for ny entry eller opdatering af tidligere entry. Ikke automatisk blokering. Mathias afgør.                       |
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md:336:3. `claude-ai-overvaagning.md` review-fokus: differentier "vision-modsigelse" (KRITISK) fra "master-plan/mathias-afgørelser-uoverensstemmelse" (rapport til Mathias, lader ham afgøre)
docs/coordination/arkiv/Lag1-plan.md:41:| 5        | Mathias-gate ikke operationelt defineret                                             | Konkret protokol via `mathias-afgoerelser.md` entry-format                | **Erstattet i V5.2** — to-fil-flow med ny `mathias-gate/`-mappe; mathias-afgoerelser.md forbliver append-only log  |
docs/coordination/arkiv/Lag1-plan.md:54:| WORKAROUND-gate omdefinerer mathias-afgoerelser.md fra append-only til hybrid | KRITISK | ACCEPT                 | Ny mappe `docs/coordination/mathias-gate/` for AFVENTER-entries. mathias-afgoerelser.md forbliver append-only log af trufne afgørelser.    |
docs/coordination/arkiv/Lag1-plan.md:81:| I   | `docs/skabeloner/rapport-skabelon.md`                      | Halt-eskaleringer + optimeringer                                               | Tilføj plan-afvigelser-koppling til markers                                                                                           |
docs/coordination/arkiv/Lag1-plan.md:84:| I   | `docs/coordination/overvaagning/claude-ai-overvaagning.md` | Cadence-ændring                                                                | Som V3                                                                                                                                |
docs/coordination/arkiv/Lag1-plan.md:195:**Bevarer `mathias-afgoerelser.md` som append-only log over trufne afgørelser** (Claude.ai's korrekte indvending). Ny mappe `docs/coordination/mathias-gate/` introduceres for afventende entries.
docs/coordination/arkiv/Lag1-plan.md:215:     a. Tilføj append-only entry i `mathias-afgoerelser.md` med samme dato + reference til gate-fil + sammenfatning af trufne afgørelse
docs/coordination/arkiv/Lag1-plan.md:219:     a. Tilføj append-only entry i `mathias-afgoerelser.md` om afvisning + alternativ retning
docs/coordination/arkiv/Lag1-plan.md:226:- `mathias-afgoerelser.md` = append-only log over trufne afgørelser
docs/coordination/arkiv/Lag1-plan.md:273: → Code tilføjer append-only entry til mathias-afgoerelser.md (trufne afgørelse)
docs/coordination/arkiv/Lag1-plan.md:327:   - `plan-skabelon.md` + `rapport-skabelon.md` opdatering
docs/coordination/arkiv/Lag1-plan.md:414:| `docs/coordination/mathias-afgoerelser.md` | Trufne afgørelser logges her (append-only); AFVENTER-entries lever i `mathias-gate/` per to-fil-flow                                                                             | ✓ overholdt |
docs/coordination/v4-slettede-docs/INDEX.md:16:| `overvaagning--claude-ai-overvaagning.md`        | docs/coordination/overvaagning/claude-ai-overvaagning.md        | `4e65fa80a9`  | 2026-05-22 | V4 doc #3: konsolidér disciplin → ÉN fil                                                |
docs/coordination/v4-slettede-docs/INDEX.md:21:| `skabelon--rapport-skabelon.md`                  | docs/skabeloner/rapport-skabelon.md                             | `4e65fa80a9`  | 2026-05-22 | V4 doc #3: konsolidér disciplin → ÉN fil                                                |
docs/coordination/v4-slettede-docs/INDEX.md:26:| `mathias-afgoerelser--slettet-version.md`        | docs/coordination/mathias-afgoerelser.md                        | `56c017a967`  | 2026-05-22 | V4 doc #5: arkivér forældede filer + slet rod                                           |
docs/coordination/v4-slettede-docs/INDEX.md:28:**NB om `mathias-afgoerelser`:** den slettede version (`docs/coordination/mathias-afgoerelser.md`) er gengivet her. En arkiveret variant lever desuden i `docs/coordination/arkiv/mathias-afgoerelser-historik.md` (kan læses direkte) — de to er ikke verificeret identiske.
docs/coordination/v4-slettede-docs/INDEX.md:43:Commit `2ae1a37962` "V4 doc #6: slet iterations-mapper indhold (bevarelse-disciplin §4)" slettede ~40 filer under `docs/coordination/codex-reviews/` (review-runder for h020/h024/t9/t9-supplement/Lag1/trin-10/workflow-skabelon) + `docs/coordination/plan-feedback/` (Lag1-feedback/-prompt/-slut-rapport-filer) + de to mappers `README.md`. Disse er per-runde proces-artefakter; ikke genskrevet her. Sig til hvis de også skal materialiseres.
docs/coordination/v4-slettede-docs/arbejds-disciplin.md:165:| **Claude.ai** | vision + master-plan + mathias-afgoerelser + interne chat-projekt |
docs/coordination/v4-slettede-docs/arbejds-disciplin.md:235:- **Claude.ai (Step 1.0 forretningsgang-rapport):** Hver "Hvad ved vi?" har konkret kilde-reference (mathias-afgoerelser-dato, vision-princip-nr, master-plan-§, chat-citat). Ikke generiske "vi ved at klienter er vigtige". Hvis ingen data: lad feltet stå tomt (ærligt).
docs/coordination/v4-slettede-docs/arbejds-disciplin.md:339:| `docs/coordination/mathias-afgoerelser.md`  | RETNINGSGIVENDE      | Modsigelse = trigger for ny entry eller opdateret entry. Ikke automatisk blokering. Mathias afgør. Entries kan blive forældede.            |
docs/coordination/v4-slettede-docs/arbejds-disciplin.md:567:  `mathias-afgoerelser.md` og ikke kan udledes af eksisterende forretnings-
docs/coordination/v4-slettede-docs/arbejds-disciplin.md:590:3. **Mathias afgør** — enten ved ny entry i `mathias-afgoerelser.md`, ny krav-dok-
docs/coordination/v4-slettede-docs/arbejds-disciplin.md:605:Hvor Mathias-svaret dokumenteres: [ny entry i mathias-afgoerelser.md med dato / ny krav-dok-version / direkte instruks til Code]
docs/coordination/v4-slettede-docs/arbejds-disciplin.md:660:Mathias afgør. Hvis ramme rettes: ny master-plan-rettelse (Appendix C) eller ny mathias-afgoerelser-entry. Hvis pakke justeres: krav-dok eller plan opdateres.
docs/coordination/arkiv/T9-V1-claude-ai.md:161:Per Modsigelses-disciplin (mathias-afgoerelser 2026-05-17 + arbejds-disciplin.md): planen er reviewet for modsigelse mod fire-dokument-rammen.
docs/coordination/arkiv/T9-V1-claude-ai.md:167:| `docs/coordination/mathias-afgoerelser.md` | Mindre intern modsigelse mellem 2026-05-17-entry pkt 10 (Ejere-navn) og pkt 11 (ingen konkrete navne) — flagget som KOSMETISK Fund 3. Ikke plan-blokerende.                              |
docs/coordination/gov-docs-renhed-krav-og-data.md:59:   `claude-ai-prompt.sh` (peger på slettede `mathias-afgoerelser.md` +
docs/coordination/gov-docs-renhed-krav-og-data.md:60:   `overvaagning/claude-ai-overvaagning.md`; indlejrer fjernet fire-dok-ramme),
docs/coordination/gov-docs-renhed-krav-og-data.md:79:   slettet `rapport-skabelon.md`; `disciplin.md §2/§6.2` peger på H020-tombstone
docs/coordination/gov-docs-renhed-krav-og-data.md:119:- **gov-6 (arkiv-fold)** — arkiv → git-history + `v4-slettede-docs/` (untracked) +
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1-disciplin-fundament.md:35:| NEEDS-MATHIAS-severity (5. niveau)                                                                                        | leveret | Dokumenteret i `arbejds-disciplin.md` + `codex-overvaagning.md` + `claude-ai-overvaagning.md` |
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1-disciplin-fundament.md:36:| Forretningsspørgsmål-fase (forfatter-rolle)                                                                               | leveret | Sektion i `claude-ai-overvaagning.md` + ny step 1.1 i workflow-skabelon                       |
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1-disciplin-fundament.md:37:| Krav-dok-review-rolle (Claude.ai reviewer-rolle)                                                                          | leveret | Sektion i `claude-ai-overvaagning.md` + workflow-skabelon step 1.3                            |
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1-disciplin-fundament.md:40:| Datamodel-STOP for Claude.ai                                                                                              | leveret | `arbejds-disciplin.md` Claude.ai MÅ IKKE + `claude-ai-overvaagning.md`                        |
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1-disciplin-fundament.md:99:| `docs/coordination/mathias-afgoerelser.md`        | 2 entries fra 2026-05-18 (PR #42's append-only-log) inkluderet verbatim + kontekst-note om 4a9f329-fortrydelse | overholdt         | ingen                          |
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1-disciplin-fundament.md:102:Ny mathias-afgørelse-entry leveret som del af denne pakkes commits (se `docs/coordination/mathias-afgoerelser.md` 2026-05-20-entry "Lag 1 disciplin-fundament komplet").
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1-disciplin-fundament.md:122:- Untracked `docs/coordination/codex-reviews/2026-05-20-PR42-disciplin-fundament-merge-runde-1.md` (intermediate-artefakt; review-evidens bevaret som PR-comments på #52)
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1-disciplin-fundament.md:128:- `docs/coordination/mathias-afgoerelser.md`: ny entry 2026-05-20 "Lag 1 disciplin-fundament komplet" (denne pakke)
docs/coordination/arkiv/forretningsspoergsmaal-skabelon-UDGAAET-V2.md:1:> **UDGÅET 2026-05-20 ved V2-workflow.** Forretningsspørgsmål håndteres nu direkte i krav-dok-fasens chat mellem Claude.ai-forfatter og Mathias. Separat `<pakke>-forretningsspoergsmaal.md`-fil er ikke længere del af flowet. Bevaret som arkiv for historisk reference (jf. `mathias-afgoerelser.md` 2026-05-20 "Workflow-justering V2", punkt 2).
docs/coordination/arkiv/forretningsspoergsmaal-skabelon-UDGAAET-V2.md:20:- **Pakker hvor forretnings-konteksten allerede er låst** i `docs/coordination/mathias-afgoerelser.md` med præcis nok detalje til at krav-dok kan skrives uden ekstra spørgsmål
docs/coordination/arkiv/forretningsspoergsmaal-skabelon-UDGAAET-V2.md:77:- Eksisterende `mathias-afgoerelser.md`-reference med konkret dato, ELLER
docs/coordination/arkiv/forretningsspoergsmaal-skabelon-UDGAAET-V2.md:109:- Identificere uklarhed mellem `mathias-afgoerelser.md` og pakke-scope
docs/coordination/arkiv/H020-plan.md:77:| 5   | `docs/coordination/mathias-afgoerelser.md`                  | M3 + M4 (memory-datoer, Q-pakke 22 RPC'er)                                                    | `git log --diff-filter=A` for hver memory-fil verificerer datoer; "22" matcher TaskList #33                                                                                                                            |
docs/coordination/arkiv/H020-plan.md:87:| 15  | `docs/skabeloner/rapport-skabelon.md`                       | KS4 (vision-tjek-lokation)                                                                    | reference peger på `docs/strategi/arbejds-disciplin.md` "Vision-tjek-skabelon"-sektionen                                                                                                                               |
docs/coordination/arkiv/rapport-historik-meta/2026-05-16-h020.md:10:- **Revision:** denne fil blev opdateret 2026-05-16 efter Codex-review runde 1 (`docs/coordination/codex-reviews/2026-05-16-h020-runde-1.md`, commit `dd9d5b7`) — flow-trin 11/12 markeret done med commit-referencer; plan-fil-pegepind opdateret til arkiv-sti.
docs/coordination/arkiv/rapport-historik-meta/2026-05-16-h020.md:40:| FC5: M3+M4 (mathias-afgoerelser)                     | leveret | `9c05895` — memory-datoer pr. fil (mtime + originSessionId); "22" matcher Q-pakke-historik                                                                                                |
docs/coordination/arkiv/rapport-historik-meta/2026-05-16-h020.md:50:| FC15: KS4 rapport-skabelon vision-tjek-lokation      | leveret | `b6d5400` — reference peger på `docs/strategi/arbejds-disciplin.md` Vision-tjek-skabelon-sektionen (linje 381+)                                                                           |
docs/coordination/arkiv/H024-V2-approved-claude-ai.md:45:Det er disciplin-læring, ikke plan-fejl: afdæknings-rapporter bør i fremtidige pakker krydstjekke FK-grafer mellem clean-target tabeller for at fange cluster-konsistens. Forslag til G-nummer-kandidat: "Afdæknings-rapport-skabelon udvides med FK-graf-tjek". Ikke H024-scope.
docs/coordination/aktiv-plan.md:5:<!-- aktiv-pakke: gov-docs-renhed fase: build -->
docs/coordination/aktiv-plan.md:7:**Aktuel:** **gov-docs-renhed** under build — plan: `docs/coordination/gov-docs-renhed-plan.md` (V4, Codex-approved runde 4 m. §8.1-SVAR: INGEN-MODSIGELSE; qwerg 2026-06-10). Derefter i rest-sekvens: gov-4-branch-protection (gov-3 CI-blockers fuldt færdig). **Merged:** gov-1 (paritet, 2026-06-04) · gov-2 (vagt, PR #93) · gov-docs-housekeeping (krav-dok-familie, PR #94) · **gov-3a** (4 §3-checks #4/#7/#16/#17 + zone-§3-fjernelse, PR #95, main @ c32097c; ikke-required indtil gov-4) · **gov-3b-1** (#19 FK-dækning + #6 indeks-pr-policy, PR #96, main @ a88d217; 23→25 fitness-checks; 0 SQL-/indeks-migrations; 3 sale-FK'er `FK_PENDING` → Trin 14 [H025]) · **gov-3b-2** (#10 SECDEF-markør-disciplin, PR #101, main @ `165833c`; 25→26 fitness-checks; 0 migrations; #18 udskilt → gov-3b-3 + [G065]) · **gov-3b-3a** (#18 del 1: §1.1:160-reconcile + 9 `permission_*` INVOKER→SECDEF, PR #103, main @ `c846105`; 4 migrations live-applikeret; G065 stadig åben → 3b) · **gov-3b-3b** (#18 del 2: sidste 5 INVOKER→SECDEF + REVOKE authenticated-write + #18-check, PR #105, main @ `7be6511`; 4 migrations live; **[G065] LØST**; gov-3 CI-blockers fuldt færdig). Rest-sekvens: gov-4-branch-protection → gov-5-automation → gov-6-arkiv-fold. Åbne G-numre: G061 (comment-parity, før gov-4), G062 (recurring types-drift), G063 (v4-slettede-docs-allowlist → gov-6). (G065 LØST i gov-3b-3b.) Åbne H: [H025] (Trin 14: sale-FK'er + orphan-cleanup). Krav-dok (ét dok over de 6): `docs/coordination/governance-vagt-krav-og-data.md` ✓.
docs/coordination/arkiv/T9-V5-claude-ai.md:101:| `docs/coordination/mathias-afgoerelser.md` | **Indirekte konflikt.** 2026-05-17 pkt 13 (alle gældende-dato-ændringer følger fortrydelses-mekanisme) brudt fordi bypass kan materialisere change før gælder-dato. |
docs/coordination/arkiv/trin-10-plan.md:136:Codex runde 4 (review-fil: `docs/coordination/codex-reviews/2026-05-21-trin-10-runde-4.md`) leverede 1 fund.
docs/coordination/arkiv/trin-10-plan.md:146:Codex runde 3 (review-fil: `docs/coordination/codex-reviews/2026-05-20-trin-10-runde-3.md` på `claude/trin-10-plan-v3`) leverede 1 fund.
docs/coordination/arkiv/trin-10-plan.md:156:Codex runde 2 (review-fil: `docs/coordination/codex-reviews/2026-05-20-trin-10-runde-2.md` på `claude/trin-10-plan-v3`) leverede 2 fund.
docs/coordination/arkiv/trin-10-plan.md:167:Codex runde 1 (review-fil: `docs/coordination/codex-reviews/2026-05-20-trin-10-runde-1.md` på `claude/trin-10-plan-v3`) leverede 4 fund.
docs/coordination/arkiv/trin-10-plan.md:301:- **Afgørelse 3:** Trin 10 scope-præcisering (mathias-afgoerelser 2026-05-20).
docs/coordination/arkiv/trin-10-plan.md:305:- **Afgørelse 4:** Trin 10 forretnings-ramme (mathias-afgoerelser 2026-05-20).
docs/coordination/arkiv/trin-10-plan.md:1525:  - Appendix C: tilføj rettelse-entry 2026-05-20 med kort beskrivelse + reference til mathias-afgoerelser "Trin 10 scope-præcisering" og denne plan.
docs/coordination/arkiv/trin-10-plan.md:1662:- `docs/coordination/codex-reviews/2026-05-20-trin-10-runde-*.md` bevares i mappen (audit-trail)
docs/coordination/arkiv/trin-10-plan.md:1672:| `docs/coordination/mathias-afgoerelser.md` | nej         | Alle scope-/forretnings-beslutninger ligger allerede i 2026-05-20-entries                                                                                                 |
docs/coordination/arkiv/trin-10-plan.md:1695:| `docs/coordination/mathias-afgoerelser.md`  | ja          | RETNINGSGIVENDE  | 2026-05-20 "Trin 10 forretnings-ramme" (7 sandheder), 2026-05-20 "Trin 10 scope-præcisering" (migration + match-rolle ud), 2026-05-20 "Workflow-justering V2". 2026-05-17 (klient kun til team; en klient = maks ét team). 2026-05-16 (klient-data følger klient ved team-skift). 2026-05-15 (plan-leverance er kontrakt). 2026-05-14 (E-conomic udelades; legal → time_based). 2026-05-11 (vision låst; superadmin eneste hardkodede rolle). | nej                                                                                                                                                                                  |
docs/coordination/v4-slettede-docs/skabelon--rapport-skabelon.md:108:| `docs/coordination/mathias-afgoerelser.md`  | [ref. fra plan]   | overholdt / afveget | [link hvis afveget]                               |
docs/coordination/v4-slettede-docs/skabelon--rapport-skabelon.md:115:- Hvis pakken introducerer ny rammeniveau-beslutning (typisk strategisk retning-skift): entry i `docs/coordination/mathias-afgoerelser.md` skal være del af pakkens commits, og det dokumenteres her
docs/coordination/v4-slettede-docs/skabelon--rapport-skabelon.md:147:| `docs/coordination/mathias-afgoerelser.md` | ja / nej       | [commit-hash + entry-dato ELLER "ingen ændring (jf. plan)"]          |
docs/coordination/arkiv/t9-supplement-2-forretningsgang-claude-ai.md:5:kilder: vision + master-plan + mathias-afgoerelser + chat-projekt
docs/coordination/arkiv/t9-supplement-2-forretningsgang-claude-ai.md:25:mathias-afgoerelser.md som en distinkt entry. Inden T9's tilsvarende
docs/coordination/arkiv/t9-supplement-2-forretningsgang-claude-ai.md:97:  mathias-afgoerelser.md. **Åbent spørgsmål** — se afsnit nedenfor.
docs/coordination/arkiv/t9-supplement-2-forretningsgang-claude-ai.md:140:ramme-entry findes ikke i mathias-afgoerelser.md (verificeret via læsning).
docs/coordination/arkiv/t9-supplement-2-forretningsgang-claude-ai.md:150:  mathias-afgoerelser.md før denne pakke bruger den som kilde? (jf. krav-dok-
docs/coordination/arkiv/t9-supplement-2-forretningsgang-claude-ai.md:180:fix; forretningsgangene er låste i mathias-afgoerelser 2026-05-17 + 2026-05-16.
docs/coordination/arkiv/trin-10-krav-og-data.md:133:Kilde: mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering: migration og match-rolle ud".
docs/coordination/arkiv/trin-10-krav-og-data.md:149:Kilde: mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering: migration og match-rolle ud".
docs/coordination/arkiv/trin-10-krav-og-data.md:178:De konkrete tekstrettelser er Code's bord at finde og udføre. Begge rettelser har sporbar kilde i mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering: migration og match-rolle ud".
docs/coordination/arkiv/trin-10-krav-og-data.md:186:| 1   | Klient ejer rå data                                            | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 1    |
docs/coordination/arkiv/trin-10-krav-og-data.md:187:| 2   | Dato afgør sandheden — historiske bindinger er faste           | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 2    |
docs/coordination/arkiv/trin-10-krav-og-data.md:188:| 3   | Klient anonymiseres ikke                                       | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 3    |
docs/coordination/arkiv/trin-10-krav-og-data.md:189:| 4   | Klient-livscyklus = aktiv/inaktiv                              | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 4    |
docs/coordination/arkiv/trin-10-krav-og-data.md:190:| 5   | Klient kan have logo                                           | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 5    |
docs/coordination/arkiv/trin-10-krav-og-data.md:191:| 6   | Rettigheder til klient-handlinger styres i UI                  | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 6    |
docs/coordination/arkiv/trin-10-krav-og-data.md:192:| 7   | Lønarter der refererer klient sættes op via formler i UI       | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 7    |
docs/coordination/arkiv/trin-10-krav-og-data.md:193:| 8   | Klient kun til team-knuder                                     | mathias-afgoerelser 2026-05-17 punkt 6                                |
docs/coordination/arkiv/trin-10-krav-og-data.md:194:| 9   | En klient = maks ét team ad gangen                             | mathias-afgoerelser 2026-05-20 chat-validering ifm. krav-dok-arbejdet |
docs/coordination/arkiv/trin-10-krav-og-data.md:195:| 10  | Klient kan ikke dræbe et team                                  | mathias-afgoerelser 2026-05-16 punkt 4                                |
docs/coordination/arkiv/trin-10-krav-og-data.md:196:| 11  | Alle ændringer med gældende dato følger fortrydelses-mekanisme | mathias-afgoerelser 2026-05-17 punkt 13                               |
docs/coordination/arkiv/trin-10-krav-og-data.md:197:| 12  | Klient-data-migration udskydes fra trin 10                     | mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering" punkt 1    |
docs/coordination/arkiv/trin-10-krav-og-data.md:198:| 13  | Match-rolle-konceptet udskydes fra trin 10                     | mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering" punkt 2    |
docs/coordination/arkiv/trin-10-krav-og-data.md:208:| `docs/coordination/mathias-afgoerelser.md` | 2026-05-16, 2026-05-17, 2026-05-20-entries (jf. afgørelses-tabel i sektion 8)                                                                                                              |
docs/coordination/arkiv/T9-V4-claude-ai.md:69:**Per Modsigelses-disciplin (mathias-afgoerelser 2026-05-17):** "Modsigelse mod krav-dokumentet eller fire-dokument-rammen er plan-blokerende. Modsigelse er ikke kandidat til G-nummer." V4's nye design honorerer krav-dok 6.1 — men kun hvis planen er internt konsistent. Den interne inkonsistens betyder at planen ikke entydigt leverer det krav-dok forlanger.
docs/coordination/arkiv/T9-V4-claude-ai.md:92:| `docs/coordination/mathias-afgoerelser.md` | **Indirekte konflikt.** 2026-05-16 pkt 2 ("Afdelinger ændres sjældent; historik bevares") + 2026-05-17 pkt 13 (alle gældende-dato-ændringer følger fortrydelses-mekanisme) brudt af inkonsistens.                                       |
docs/coordination/v4-slettede-docs/skabelon--plan-skabelon.md:158:| `docs/coordination/mathias-afgoerelser.md` | ja / nej    | [hvis ja: entry-dato + emne; ellers "nej, kun pakke-leverance"]  |
docs/coordination/v4-slettede-docs/skabelon--plan-skabelon.md:193:V2 dokument-hierarki (jf. `mathias-afgoerelser.md` 2026-05-20 "Workflow-justering V2"):
docs/coordination/v4-slettede-docs/skabelon--plan-skabelon.md:196:- `stork-2-0-master-plan.md` + `mathias-afgoerelser.md` = **RETNINGSGIVENDE** (kan rettes løbende). Konflikt → trigger-for-opdatering, Mathias afgør om plan ændres eller dokumentet opdateres. Ikke automatisk blokering.
docs/coordination/v4-slettede-docs/skabelon--plan-skabelon.md:203:| `docs/coordination/mathias-afgoerelser.md`  | ja / nej    | RETNINGSGIVENDE  | [konkrete datoer + emner, fx "2026-05-16 (forretningssandhed), 2026-05-15 (T9 pause)"] | ja / nej — ja = trigger-for-opdatering (Mathias afgør)         |
docs/coordination/arkiv/t9-supplement-2-krav-og-data.md:33:- **Kilde:** Mathias chat 2026-05-21; mathias-afgoerelser 2026-05-17 (T9-omstart-ramme punkt 3 — to akser: kan_tilgå/kan_skrive).
docs/coordination/arkiv/t9-supplement-2-krav-og-data.md:39:- **Kilde:** vision-princip 2; mathias-afgoerelser 2026-05-17 punkt 10; mathias-afgoerelser 2026-05-21 (bypass-ramme).
docs/coordination/arkiv/t9-supplement-2-krav-og-data.md:47:- **Kilde:** mathias-afgoerelser 2026-05-17 punkt 13.
docs/coordination/arkiv/t9-supplement-2-krav-og-data.md:53:- **Kilde:** mathias-afgoerelser 2026-05-17 punkt 6.
docs/coordination/arkiv/t9-supplement-2-krav-og-data.md:108:Begrundelse: superadmin må alt, jf. mathias-afgoerelser 2026-05-21 (bypass-ramme).
docs/coordination/arkiv/t9-supplement-2-krav-og-data.md:110:- **Kilde:** mathias-afgoerelser 2026-05-21 (ny approve-disciplin — committes som separat entry FØR plan-fase).
docs/coordination/arkiv/t9-supplement-2-krav-og-data.md:137:- **Kilde:** mathias-afgoerelser 2026-05-21 (ny handlings-granularitet — committes som separat entry).
docs/coordination/arkiv/t9-supplement-2-krav-og-data.md:166:- **Kilde:** mathias-afgoerelser 2026-05-21 (bypass-ramme + idempotency-model).
docs/coordination/arkiv/t9-supplement-2-krav-og-data.md:215:To nye afgørelser skal committes som separate entries i `mathias-afgoerelser.md` så plan har stabil committed kilde:
docs/coordination/arkiv/T9-plan.md:400:**Anbefaling (V5):** Genberegn berørt subtree ved AFTER INSERT/UPDATE/DELETE på **`org_node_versions`** når en row med `effective_from <= current_date AND (effective_to IS NULL OR effective_to > current_date)` ændres. Org-mutationer er sjældne (krav-dok mathias-afgoerelser pkt 2 + master-plan §1.7); trigger-omkostning irrelevant. Tilføj `org_node_closure` til `AUDIT_EXEMPT_SNAPSHOT_TABLES`-allowlist i `scripts/fitness.mjs`.
docs/coordination/arkiv/T9-plan.md:916:- `docs/coordination/mathias-afgoerelser.md` → ingen ny entry forventet (T9 implementerer eksisterende rammebeslutninger). Hvis benchmark-fund eller andet kræver ny afgørelse: ny entry med G-nummer som plan-reference
docs/coordination/arkiv/T9-plan.md:944:| `docs/coordination/mathias-afgoerelser.md` | ja          | 2026-05-11 (vision-låsning + superadmin); 2026-05-15 (plan-leverance som kontrakt; trin 9 pause — forudsætninger nu opfyldt); 2026-05-16 (9-punkts forretningssandhed — alle mappet til konkrete plan-elementer; tx-rollback default; oprydnings-disciplin; fire-dokument-disciplin; CLI-automation-niveau); **2026-05-17 (afdæknings-session med 15 nye ramme-afgørelser — ét træ, permission-elementer i 3 niveauer som DATA, synlighed 3 værdier, Hiraki udledt af placering, knude-løs som gyldig tilstand, ingen stabs-team, cross-team via rolle, superadmin=Alt, fortrydelses-mekanisme, klient-til-team-import udskudt til trin 10)**; 2026-05-17 (flow-ændringer: Modsigelses-disciplin + Codex-opgraderings-rolle — denne plan respekterer begge) | nej                |
docs/coordination/arkiv/mathias-afgoerelser-historik.md:147:- **Plan-reference:** Denne commit (clean-up af mathias-afgoerelser.md).
docs/coordination/arkiv/mathias-afgoerelser-historik.md:151:- **Begrundelse:** Coordination-mappen vokser ukontrolleret med arbejds-artefakter fra afsluttede pakker; relaterede dokumenter glider ud af synkron uden eksplicit ansvar. Løsning: hver plan skal indeholde "Oprydnings- og opdaterings-strategi"-sektion (obligatorisk; manglende sektion = KRITISK feedback fra reviewers). Code udfører oprydning som DEL af build, ikke separat trin. Slut-rapport verificerer udførelse i ny "Oprydning + opdatering udført"-sektion. Ankret 4 steder: plan-skabelon, rapport-skabelon, Code's overvågnings-prompt (qwerg-fasen), arbejdsmetode-dokument.
docs/coordination/arkiv/mathias-afgoerelser-historik.md:156:- **Begrundelse:** Audit af master-plan mod vision-dokumentet afslørede to gaps: (a) Vision-meta-princip 3 "Sammenkobling eksplicit" havde ingen CI-håndhævelse — FK-disciplin var konvention, ikke teknisk regel. (b) Vision-princip 5 "Lifecycle for konfiguration" var implementeret via rettelse 27 men ikke reflekteret i §5 "Det vi står inde for". Løsning: §5 udvidet med to bullets, §3 udvidet med CI-blocker 19 (FK-coverage med allowlist for eksterne reference-ID'er), §0 fik reference til mathias-afgoerelser som kilde for strategiske retning-skift. Konsekvens: master-plan reflekterer nu alle 3 meta-principper + 9 operationelle principper. CI-blocker 19 implementeres som fitness-script-udvidelse i kommende byggetrin.
docs/coordination/arkiv/mathias-afgoerelser-historik.md:157:- **Plan-reference:** Denne commit. Master-plan rettelse 33 i Appendix C. Bygge-status trin 9 markeret PAUSET (jf. mathias-afgoerelser 2026-05-15).
docs/coordination/arkiv/mathias-afgoerelser-historik.md:182:- **Beslutning:** Fire dokumenter har ligeværdig autoritativ rolle for at sikre retningen holder: `vision-og-principper.md`, `stork-2-0-master-plan.md`, `mathias-afgoerelser.md`, og pakkens `<pakke>-krav-og-data.md`. Hver plan og slut-rapport skal eksplicit verificere mod alle fire via obligatorisk "Fire-dokument-konsultation"-sektion (samme tier som "Oprydnings- og opdaterings-strategi" — manglende sektion = KRITISK feedback).
docs/coordination/arkiv/mathias-afgoerelser-historik.md:188:- **Plan-reference:** Denne commit. Otte fil-ændringer: `arbejds-disciplin.md` (AI-arbejdsdeling renses), `plan-skabelon.md` (ny Fire-dokument-konsultation-sektion), `rapport-skabelon.md` (Vision-tjek udvides), `codex-overvaagning.md` (plan-review-fokus renes til kode), `codex-review-prompt.md` (niveau 1-prefix renes), `code-overvaagning.md` (plan-arbejde forpligtes til at udfylde tabel), `claude-ai-overvaagning.md` (NY — formel Claude.ai-rolle i overvågnings-flow), denne entry.
docs/coordination/arkiv/mathias-afgoerelser-historik.md:350:  3. **Krav-dok-skrivnings-disciplin** — claude-ai-overvaagning får ny sektion: hver påstand i krav-dok kan peges på Mathias-kilde (direkte ord, mathias-afgoerelser-entry, vision-princip, master-plan-paragraf). Mangler kilde: spørg, skriv ikke. `conversation_search` obligatorisk før reference til tidligere afgørelse. Krav-dok indeholder kun tanker — ingen datamodel, ingen kode-skitser.
docs/coordination/arkiv/mathias-afgoerelser-historik.md:352:  4. **Datamodel-grænse** — arbejds-disciplin.md AI-arbejdsdeling: Claude.ai MÅ IKKE designe datamodel (tabeller, kolonner, RPC-signaturer, granularitets-valg, helper-RPC-forslag, kode-skitser, "Model A/B/C") — det er Code's bord i plan-fasen. Datamodel-STOP-regel tilføjet til Claude.ai's disciplin-regler i claude-ai-overvaagning.
docs/coordination/arkiv/mathias-afgoerelser-historik.md:358:  - `docs/coordination/overvaagning/claude-ai-overvaagning.md` — ny "Krav-dok-skrivnings-disciplin"-sektion (kilde-disciplin + rene tanker, med T9-eksempel) + blokker-punkt 5 (Fundament-tjek-passeret-sektion) + datamodel-STOP i disciplin-regler
docs/coordination/arkiv/mathias-afgoerelser-historik.md:380:- **Ærligheds-flag:** Et femte forslag (slut-rapport-honesty-tjek med plan-afvigelser-sektion) blev oprindeligt foreslået af Claude.ai, men recon afslørede at det allerede eksisterer i rapport-skabelonen — fabrikation, ikke nyt fund. Fjernet fra pakken inden implementation. Flaget her for at dokumentere at fabrikation skete på dette niveau af samtalen og at recon fangede det inden commit.
docs/coordination/arkiv/mathias-afgoerelser-historik.md:385:  - `docs/coordination/overvaagning/claude-ai-overvaagning.md` (forretningsspørgsmål-fase-sektion + krav-dok-review-rolle-sektion + NEEDS-MATHIAS i severity + anti-glid-regel)
docs/coordination/arkiv/mathias-afgoerelser-historik.md:435:  1. **Dokument-hierarki differentieres.** Kun `vision-og-principper.md` er LÅST-AUTORITATIV. `stork-2-0-master-plan.md` og `mathias-afgoerelser.md` er RETNINGSGIVENDE (kan rettes løbende). `<pakke>-krav-og-data.md` og `<pakke>-plan.md` er PAKKE-KONTRAKT efter approval (låst inden for pakken). Modsigelses-håndtering differentieres efter status: vision-modsigelse = automatisk blokering; master-plan/mathias-afgørelser-modsigelse = trigger for opdatering (Mathias afgør); krav-dok/plan-modsigelse efter approval = KRITISK.
docs/coordination/arkiv/mathias-afgoerelser-historik.md:454:  - `docs/coordination/overvaagning/claude-ai-overvaagning.md` — simplificeret 5-step krav-dok-fase + sparring-på-tværs + 1.0-bibel-reference præciseret
docs/coordination/arkiv/mathias-afgoerelser-historik.md:508:  - **Claude.ai:** vision + master-plan + mathias-afgoerelser + interne chat-projekt
docs/coordination/arkiv/mathias-afgoerelser-historik.md:559:- **FULDSTYRKE-MANGEL gælder alle tre AI'er** (ikke kun Code+Codex): Claude.ai's forretningsgang-rapport skal også have konkrete kilde-referencer (mathias-afgoerelser-dato, vision-princip, master-plan-§, chat-citat) — ikke generiske formuleringer.
docs/coordination/arkiv/mathias-afgoerelser-historik.md:580:  - `docs/coordination/overvaagning/claude-ai-overvaagning.md` — ny Step 1.0 + konsoliderings-rolle (inkl. Mathias-afgørelses-kolonne) + præcisering af Step 1.2 (Step 1.0 sker for alle pakker)
docs/coordination/v4-slettede-docs/overvaagning--code-overvaagning.md:73:     - Ny entry i `docs/coordination/mathias-afgoerelser.md` (committet til main), ELLER
docs/coordination/v4-slettede-docs/overvaagning--code-overvaagning.md:88:   - Codex har leveret feedback på slut-rapport (kommenter eller fil i `docs/coordination/codex-reviews/`) → opdatér slut-rapport, push
docs/coordination/v4-slettede-docs/overvaagning--code-overvaagning.md:136:| `docs/coordination/mathias-afgoerelser.md`  | ja          | [konkrete datoer + emner]             | ja/nej             |
docs/coordination/v4-slettede-docs/overvaagning--code-overvaagning.md:257:   - Opdater de dokumenter planen lister (aktiv-plan, mathias-afgoerelser, bygge-status, teknisk-gaeld, etc.)
docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:147:- **Plan-reference:** Denne commit (clean-up af mathias-afgoerelser.md).
docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:151:- **Begrundelse:** Coordination-mappen vokser ukontrolleret med arbejds-artefakter fra afsluttede pakker; relaterede dokumenter glider ud af synkron uden eksplicit ansvar. Løsning: hver plan skal indeholde "Oprydnings- og opdaterings-strategi"-sektion (obligatorisk; manglende sektion = KRITISK feedback fra reviewers). Code udfører oprydning som DEL af build, ikke separat trin. Slut-rapport verificerer udførelse i ny "Oprydning + opdatering udført"-sektion. Ankret 4 steder: plan-skabelon, rapport-skabelon, Code's overvågnings-prompt (qwerg-fasen), arbejdsmetode-dokument.
docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:156:- **Begrundelse:** Audit af master-plan mod vision-dokumentet afslørede to gaps: (a) Vision-meta-princip 3 "Sammenkobling eksplicit" havde ingen CI-håndhævelse — FK-disciplin var konvention, ikke teknisk regel. (b) Vision-princip 5 "Lifecycle for konfiguration" var implementeret via rettelse 27 men ikke reflekteret i §5 "Det vi står inde for". Løsning: §5 udvidet med to bullets, §3 udvidet med CI-blocker 19 (FK-coverage med allowlist for eksterne reference-ID'er), §0 fik reference til mathias-afgoerelser som kilde for strategiske retning-skift. Konsekvens: master-plan reflekterer nu alle 3 meta-principper + 9 operationelle principper. CI-blocker 19 implementeres som fitness-script-udvidelse i kommende byggetrin.
docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:157:- **Plan-reference:** Denne commit. Master-plan rettelse 33 i Appendix C. Bygge-status trin 9 markeret PAUSET (jf. mathias-afgoerelser 2026-05-15).
docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:182:- **Beslutning:** Fire dokumenter har ligeværdig autoritativ rolle for at sikre retningen holder: `vision-og-principper.md`, `stork-2-0-master-plan.md`, `mathias-afgoerelser.md`, og pakkens `<pakke>-krav-og-data.md`. Hver plan og slut-rapport skal eksplicit verificere mod alle fire via obligatorisk "Fire-dokument-konsultation"-sektion (samme tier som "Oprydnings- og opdaterings-strategi" — manglende sektion = KRITISK feedback).
docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:188:- **Plan-reference:** Denne commit. Otte fil-ændringer: `arbejds-disciplin.md` (AI-arbejdsdeling renses), `plan-skabelon.md` (ny Fire-dokument-konsultation-sektion), `rapport-skabelon.md` (Vision-tjek udvides), `codex-overvaagning.md` (plan-review-fokus renes til kode), `codex-review-prompt.md` (niveau 1-prefix renes), `code-overvaagning.md` (plan-arbejde forpligtes til at udfylde tabel), `claude-ai-overvaagning.md` (NY — formel Claude.ai-rolle i overvågnings-flow), denne entry.
docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:350:  3. **Krav-dok-skrivnings-disciplin** — claude-ai-overvaagning får ny sektion: hver påstand i krav-dok kan peges på Mathias-kilde (direkte ord, mathias-afgoerelser-entry, vision-princip, master-plan-paragraf). Mangler kilde: spørg, skriv ikke. `conversation_search` obligatorisk før reference til tidligere afgørelse. Krav-dok indeholder kun tanker — ingen datamodel, ingen kode-skitser.
docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:352:  4. **Datamodel-grænse** — arbejds-disciplin.md AI-arbejdsdeling: Claude.ai MÅ IKKE designe datamodel (tabeller, kolonner, RPC-signaturer, granularitets-valg, helper-RPC-forslag, kode-skitser, "Model A/B/C") — det er Code's bord i plan-fasen. Datamodel-STOP-regel tilføjet til Claude.ai's disciplin-regler i claude-ai-overvaagning.
docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:358:  - `docs/coordination/overvaagning/claude-ai-overvaagning.md` — ny "Krav-dok-skrivnings-disciplin"-sektion (kilde-disciplin + rene tanker, med T9-eksempel) + blokker-punkt 5 (Fundament-tjek-passeret-sektion) + datamodel-STOP i disciplin-regler
docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:380:- **Ærligheds-flag:** Et femte forslag (slut-rapport-honesty-tjek med plan-afvigelser-sektion) blev oprindeligt foreslået af Claude.ai, men recon afslørede at det allerede eksisterer i rapport-skabelonen — fabrikation, ikke nyt fund. Fjernet fra pakken inden implementation. Flaget her for at dokumentere at fabrikation skete på dette niveau af samtalen og at recon fangede det inden commit.
docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:385:  - `docs/coordination/overvaagning/claude-ai-overvaagning.md` (forretningsspørgsmål-fase-sektion + krav-dok-review-rolle-sektion + NEEDS-MATHIAS i severity + anti-glid-regel)
docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:435:  1. **Dokument-hierarki differentieres.** Kun `vision-og-principper.md` er LÅST-AUTORITATIV. `stork-2-0-master-plan.md` og `mathias-afgoerelser.md` er RETNINGSGIVENDE (kan rettes løbende). `<pakke>-krav-og-data.md` og `<pakke>-plan.md` er PAKKE-KONTRAKT efter approval (låst inden for pakken). Modsigelses-håndtering differentieres efter status: vision-modsigelse = automatisk blokering; master-plan/mathias-afgørelser-modsigelse = trigger for opdatering (Mathias afgør); krav-dok/plan-modsigelse efter approval = KRITISK.
docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:454:  - `docs/coordination/overvaagning/claude-ai-overvaagning.md` — simplificeret 5-step krav-dok-fase + sparring-på-tværs + 1.0-bibel-reference præciseret
docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:508:  - **Claude.ai:** vision + master-plan + mathias-afgoerelser + interne chat-projekt
docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:559:- **FULDSTYRKE-MANGEL gælder alle tre AI'er** (ikke kun Code+Codex): Claude.ai's forretningsgang-rapport skal også have konkrete kilde-referencer (mathias-afgoerelser-dato, vision-princip, master-plan-§, chat-citat) — ikke generiske formuleringer.
docs/coordination/v4-slettede-docs/mathias-afgoerelser--slettet-version.md:580:  - `docs/coordination/overvaagning/claude-ai-overvaagning.md` — ny Step 1.0 + konsoliderings-rolle (inkl. Mathias-afgørelses-kolonne) + præcisering af Step 1.2 (Step 1.0 sker for alle pakker)
docs/coordination/v4-slettede-docs/skabelon--workflow-skabelon.md:11:V3 udvider V2 baseret på trin 10-erfaring (`mathias-afgoerelser.md` 2026-05-21 "Workflow-justering V3"). To tilføjelser inden for eksisterende 5-step-struktur: (1) Step 1.0 — pre-krav-dok forretningsgang-recon med 3 AI'er parallelt; (2) Step 2 — Code + Codex arbejder parallelt fra V1 (ikke ping-pong-sekvens), Codex udvidet med proaktiv kode-research.
docs/coordination/v4-slettede-docs/skabelon--workflow-skabelon.md:86:| 5    | Code skriver, Claude.ai-reviewer (separat chat) verificerer                 | `rapport-historik/<dato>-<pakke>.md`                                                             | [`rapport-skabelon.md`](rapport-skabelon.md)       |
docs/coordination/v4-slettede-docs/skabelon--workflow-skabelon.md:195:`mathias-afgoerelser.md` forbliver append-only log af **trufne** afgørelser. Afventende beslutninger lever i ny mappe `docs/coordination/mathias-gate/`.
docs/coordination/v4-slettede-docs/skabelon--workflow-skabelon.md:200:4. Code: ved GODKENDT → tilføj append-only entry til `mathias-afgoerelser.md` (trufne afgørelse) + arkivér gate-fil + genoptag build
docs/coordination/v4-slettede-docs/skabelon--workflow-skabelon.md:229:| `docs/coordination/codex-reviews/<dato>-<pakke>-runde-<N>.md` | 4    | Auto via `codex-review.sh`                                                   |
docs/coordination/v4-slettede-docs/skabelon--workflow-skabelon.md:246:| `docs/coordination/mathias-afgoerelser.md` | Pakken indeholder strategisk retning-skift eller låser ramme på tværs af pakker         | Ny append-only entry med dato + begrundelse + plan-reference        |
docs/coordination/v4-slettede-docs/skabelon--workflow-skabelon.md:253:**Hvorfor:** uden eksplicit disciplin vokser drift mellem autoritative dokumenter og koden. Master-plan beskriver intentionen; bygge-status reflekterer faktisk fremgang; mathias-afgoerelser fanger rammer; teknisk-gæld viser akkumuleret hjørner. Når én ændres, skal de andre tjekkes samme runde — ikke "senere".
docs/coordination/v4-slettede-docs/skabelon--workflow-skabelon.md:359:**Sidste opdatering:** 2026-05-20 — Workflow V2 finalize (jf. `mathias-afgoerelser.md` "Workflow-justering V2" 2026-05-20). Flow simplificeret til 5-step. Krav-dok-fase reduceret til direkte chat mellem Claude.ai-forfatter og Mathias; separat reviewer-rolle + forretningsspoergsmaal-fil + krav-dok-feedback-mappe udgået. Pakke-skala-vurdering nu eksplicit step 0. Recon-først obligatorisk i plan-fasen. Konsekvens-opdaterings-disciplin tilføjet for autoritative dokumenter (master-plan, bygge-status, mathias-afgoerelser, teknisk-gaeld).
docs/coordination/v4-slettede-docs/arbejdsmetode-og-repo-struktur.md:34:│   ├── mathias-afgoerelser.md
docs/coordination/v4-slettede-docs/arbejdsmetode-og-repo-struktur.md:36:│   ├── codex-reviews/
docs/coordination/v4-slettede-docs/arbejdsmetode-og-repo-struktur.md:49:    ├── rapport-skabelon.md
docs/coordination/v4-slettede-docs/arbejdsmetode-og-repo-struktur.md:137:Append-only fil: `docs/coordination/mathias-afgoerelser.md`.
docs/coordination/v4-slettede-docs/arbejdsmetode-og-repo-struktur.md:156:2. **Code opretter `coordination/`-undermappe** med tomme skabeloner + initial `mathias-afgoerelser.md` med alle låste afgørelser fra hidtidige sessions (vision-commit, Problem 1-4, Q-pakke-korrektion, lock-mønster udskudt, etc.).
docs/coordination/v4-slettede-docs/arbejdsmetode-og-repo-struktur.md:182:- `claude-ai-overvaagning.md`
docs/coordination/v4-slettede-docs/arbejdsmetode-og-repo-struktur.md:263:- Dokumenter der skal opdateres som konsekvens (aktiv-plan, seneste-rapport, mathias-afgoerelser, bygge-status, master-plan, teknisk-gaeld)
docs/coordination/v4-slettede-docs/arbejdsmetode-og-repo-struktur.md:284:**V2-note:** Claude.ai-plan-reviewer-rolle udgået i V2 (jf. `mathias-afgoerelser.md` 2026-05-20). Plan-fase er Code + Codex; `<pakke>-V<n>-claude-ai.md` og `<pakke>-V<n>-approved-claude-ai.md` fra V5.3 produceres ikke længere. Eventuelle eksisterende sådanne filer på historiske pakke-branches arkiveres ved pakke-lukning som hidtil.
docs/coordination/arkiv/H024-plan.md:590:- `docs/coordination/codex-reviews/2026-05-16-h024-runde-1.md` → bevares i `codex-reviews/`-mappen (anden konvention end plan-feedback)
docs/coordination/arkiv/H024-plan.md:604:- `docs/coordination/mathias-afgoerelser.md` → ny entry om at "tx-rollback er default for DB-tests + fitness-check håndhæver" som strategisk retning-skift

codex
Batch 4-fixene ser umiddelbart ud til at ramme de tre runde 5-punkter: v4-kopier er ikke tracked, statusfilen er opdateret, og parseren har en fixture for MANGLENDE-EKSISTERENDE-BEVARELSE. Jeg kører de relevante mekaniske checks nu for at se, om branchens egen evidens holder.
exec
/bin/bash -lc 'git ls-files docs/coordination/v4-slettede-docs | wc -l && git ls-files docs/coordination/codex-reviews | wc -l && git status --short --ignored docs/coordination/v4-slettede-docs docs/coordination/codex-reviews .gitignore' in /home/mathias/stork-2.0
 succeeded in 0ms:
0
5
!! docs/coordination/v4-slettede-docs/

exec
/bin/bash -lc 'node scripts/governance-check.mjs' in /home/mathias/stork-2.0
 succeeded in 0ms:
✓ dead-doc-paths
✓ junk-files
✓ laesefoelge-targets
✓ pointer-validity
✓ owns-uniqueness
✓ number-home-uniqueness
✓ H-ref-integrity
✓ structural-chain

Governance-check: alle checks passed (21 docs, 3 scripts)

exec
/bin/bash -lc 'git diff --check origin/main...HEAD' in /home/mathias/stork-2.0
 exited 2 in 0ms:
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-1.md:13: trailing whitespace.
+[KRITISK] Vision-banner efterlades i modstrid med D4  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-1.md:14: trailing whitespace.
+Konkret afvigelse: Planen siger “vision uberørt”, men `vision-og-principper.md` siger stadig at vision vinder over “andre dokumenter”. Samtidig vil V2 gøre forretningsforståelse LÅST og “ingen trumf” ved vision↔forretningsforståelse-konflikt.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-1.md:17: trailing whitespace.
+[KRITISK] Patch-først er ikke opfyldt  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-1.md:18: trailing whitespace.
+Konkret afvigelse: Planen giver snippets/tabel-diff, men ikke eksisterende body 1:1 pr. ændret script/doc. Det gør bevarelse af gates/kommentarer ikke reviewbar, især for `codex-review.sh`, `governance-check.mjs`, selftest og doc-skabeloner.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-1.md:21: trailing whitespace.
+[MELLEM] Repo-state-dump matcher ikke faktisk state  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-1.md:22: trailing whitespace.
+Konkret afvigelse: Planen siger `main @ 1278e92` og `19 docs`; verificeret `origin/main @ 1278e92` giver 18 docs, planbranch HEAD er `df4105d` og working tree-check giver 21 docs.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-1.md:25: trailing whitespace.
+[MELLEM] Kæde-tjek/selftests beviser ikke hele krav pkt. 10  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-1.md:26: trailing whitespace.
+Konkret afvigelse: Cases dækker manglende plan og formåls-mismatch krav↔plan, men ikke `fase: rapport`, manglende/mismatchende slut-rapport eller status-krydspegning.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-1.md:29: trailing whitespace.
+[MELLEM] `disciplin.md §10.4` bliver stale kanonisk prompt  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-1.md:30: trailing whitespace.
+Konkret afvigelse: `codex-review.sh` skal generere prompt fra §10.4, men planen patcher ikke §10.4, som stadig kalder forretningsforståelse “tanke-data, ikke kontrakt” og bruger gamle marker-termer.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-2.md:13: trailing whitespace.
+[KRITISK] `codex-review.sh` kan overse KRITISK efter nyt §10.4-format  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-2.md:14: trailing whitespace.
+Konkret afvigelse: V2-prompten kræver `[SEVERITY]` (`gov-docs-renhed-plan.md:469`), men B.1 bevarer parseren der kun matcher `^KRITISK\b` (`scripts/codex-review.sh:224`). `[KRITISK] test` matcher ikke, så et stopfund kan ende med exit 0.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-2.md:17: trailing whitespace.
+[MELLEM] State-dump er stadig stale for V2-committen  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-2.md:18: trailing whitespace.
+Konkret afvigelse: Planen verificerer `main @ 1278e92` og V1 `df4105d`, men aktuel V2 er `28e0010`; `git archive 28e0010` giver governance-check grøn med **22 docs, 6 scripts**, ikke tabellens 21 docs.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-2.md:21: trailing whitespace.
+[MELLEM] Kæde-tjek dækker stadig ikke hele pkt. 10  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-2.md:22: trailing whitespace.
+Konkret afvigelse: B.3 kræver status-filens eksistens, men ingen status-krydspegning. I `fase:rapport` fejler den ikke hvis rapporten mangler `> Denne pakke leverer:`-Formål-blokken, fordi den kun sammenligner når `fr` findes. B.4 mangler negative cases for begge.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-2.md:25: trailing whitespace.
+[MELLEM] D4-løftet efterlader master-plan-modsigelse  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-2.md:26: trailing whitespace.
+Konkret afvigelse: A.1 lukker den direkte vision-banner-modsigelse reelt, men `docs/strategi/stork-2-0-master-plan.md:40` kalder stadig forretningsforståelse “tanke-data” og siger at vision vinder over den.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-3.md:13: trailing whitespace.
+[KRITISK] A.6 efterlader D4-modsigelse i disciplin §8  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-3.md:14: trailing whitespace.
+Konkret afvigelse: V3 retter master-planen i A.14, men A.6 indsætter kun en ny `forretningsforstaaelse.md`-række efter den eksisterende vision-række. Vision-rækken bevares som “Vinder over alt”, mens den nye række siger “ingen trumf”. Planen efterlader derfor to modsatrettede regler i samme §8. A.14 lukker master-plan-teksten, men §8.1-modsigelsen er ikke lukket samlet.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1305: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1339: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1486: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1551: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1553: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1589: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1591: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1714: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1719: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1737: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1748: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1754: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1757: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1759: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1772: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1786: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1790: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1796: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1809: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1815: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1825: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1828: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1833: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1836: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1903: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1907: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1936: trailing whitespace.
+   176	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1938: trailing whitespace.
+   178	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1944: trailing whitespace.
+   184	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1947: trailing whitespace.
+   187	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1949: trailing whitespace.
+   189	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1957: trailing whitespace.
+   197	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1959: trailing whitespace.
+   199	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1968: trailing whitespace.
+   208	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1970: trailing whitespace.
+   210	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1974: trailing whitespace.
+   214	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1977: trailing whitespace.
+   217	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1979: trailing whitespace.
+   219	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1983: trailing whitespace.
+   223	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1985: trailing whitespace.
+   225	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1987: trailing whitespace.
+   227	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1989: trailing whitespace.
+   229	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1991: trailing whitespace.
+   231	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1993: trailing whitespace.
+   233	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1995: trailing whitespace.
+   235	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1997: trailing whitespace.
+   237	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1999: trailing whitespace.
+   239	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2001: trailing whitespace.
+   241	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2004: trailing whitespace.
+   244	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2009: trailing whitespace.
+   271	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2011: trailing whitespace.
+   273	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2014: trailing whitespace.
+   276	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2016: trailing whitespace.
+   278	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2019: trailing whitespace.
+   281	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2023: trailing whitespace.
+   285	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2025: trailing whitespace.
+   287	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2029: trailing whitespace.
+   291	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2031: trailing whitespace.
+   293	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2035: trailing whitespace.
+   297	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2037: trailing whitespace.
+   299	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2046: trailing whitespace.
+   308	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2048: trailing whitespace.
+   310	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2052: trailing whitespace.
+   314	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2054: trailing whitespace.
+   316	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2056: trailing whitespace.
+   318	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2060: trailing whitespace.
+   322	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2062: trailing whitespace.
+   324	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2064: trailing whitespace.
+   326	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2083: trailing whitespace.
+    93	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2085: trailing whitespace.
+    95	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2101: trailing whitespace.
+   111	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2103: trailing whitespace.
+   113	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2118: trailing whitespace.
+   128	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2120: trailing whitespace.
+   130	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2126: trailing whitespace.
+     2	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2131: trailing whitespace.
+     7	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2133: trailing whitespace.
+     9	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2143: trailing whitespace.
+    19	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2145: trailing whitespace.
+    21	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2207: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2211: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2213: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2219: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2221: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2230: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2233: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2240: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2245: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2271: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2273: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2278: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2280: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2286: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2288: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2291: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2293: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2299: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2301: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2304: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2306: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2308: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2310: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2313: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2315: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2317: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2319: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2336: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2338: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2340: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2342: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2354: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2356: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2358: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2360: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2366: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2369: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2371: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2375: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2379: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2395: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2398: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2400: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2403: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2405: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2407: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2412: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2415: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2417: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2423: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2425: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2428: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2430: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3445: trailing whitespace.
+    20	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3451: trailing whitespace.
+    26	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3453: trailing whitespace.
+    28	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3459: trailing whitespace.
+    34	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3461: trailing whitespace.
+    36	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3544: trailing whitespace.
+     2	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3546: trailing whitespace.
+     4	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3548: trailing whitespace.
+     6	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3550: trailing whitespace.
+     8	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3552: trailing whitespace.
+    10	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3559: trailing whitespace.
+    17	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3640: trailing whitespace.
+    28	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3642: trailing whitespace.
+    30	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3648: trailing whitespace.
+    36	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3653: trailing whitespace.
+    41	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3658: trailing whitespace.
+    46	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3663: trailing whitespace.
+    51	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3672: trailing whitespace.
+    60	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3678: trailing whitespace.
+    66	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3683: trailing whitespace.
+    71	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3688: trailing whitespace.
+    76	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3692: trailing whitespace.
+    80	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3696: trailing whitespace.
+    84	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3700: trailing whitespace.
+    88	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3704: trailing whitespace.
+    92	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3713: trailing whitespace.
+   101	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3718: trailing whitespace.
+   106	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3752: trailing whitespace.
+   127	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3754: trailing whitespace.
+   129	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3756: trailing whitespace.
+   131	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3758: trailing whitespace.
+   133	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3760: trailing whitespace.
+   135	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3762: trailing whitespace.
+   137	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3764: trailing whitespace.
+   139	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3766: trailing whitespace.
+   141	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3768: trailing whitespace.
+   143	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3770: trailing whitespace.
+   145	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3782: trailing whitespace.
+   400	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3784: trailing whitespace.
+   402	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3791: trailing whitespace.
+   409	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3793: trailing whitespace.
+   411	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3800: trailing whitespace.
+   418	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3805: trailing whitespace.
+   423	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3859: trailing whitespace.
+[KRITISK] Gov-6-arbejde er bygget i forkert pakke  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3860: trailing whitespace.
+Konkret afvigelse: Krav-dok og Plan V4 siger eksplicit at `v4-slettede-docs/`/arkiv-fold hører til gov-6, ikke denne pakke. Builden tilføjer alligevel 17 tracked filer under `docs/coordination/v4-slettede-docs/` i batch 2.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3863: trailing whitespace.
+[KRITISK] Pakke-status matcher ikke faktisk build-state  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3864: trailing whitespace.
+Konkret afvigelse: `gov-docs-renhed-status.md` siger stadig “INTET bygges før qwerg” og “afventer Mathias”, mens branch HEAD har batch 1-3 bygget, og `aktiv-plan.md` markerer `fase: build`. Det bryder formålet: docs må ikke modsige virkeligheden.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3867: trailing whitespace.
+[KRITISK] `codex-review.sh` lader kritisk subtype passere som exit 0  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3868: trailing whitespace.
+Konkret afvigelse: Disciplin §5 definerer `MANGLENDE-EKSISTERENDE-BEVARELSE` som KRITISK-undertype, og §10.4 beder Codex flage den. Parseren stopper kun på `KRITISK`, ikke på denne subtype; `--parse-test` har heller ingen fixture for den.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3876: trailing whitespace.
+[KRITISK] Gov-6-arbejde er bygget i forkert pakke  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3877: trailing whitespace.
+Konkret afvigelse: Krav-dok og Plan V4 siger eksplicit at `v4-slettede-docs/`/arkiv-fold hører til gov-6, ikke denne pakke. Builden tilføjer alligevel 17 tracked filer under `docs/coordination/v4-slettede-docs/` i batch 2.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3880: trailing whitespace.
+[KRITISK] Pakke-status matcher ikke faktisk build-state  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3881: trailing whitespace.
+Konkret afvigelse: `gov-docs-renhed-status.md` siger stadig “INTET bygges før qwerg” og “afventer Mathias”, mens branch HEAD har batch 1-3 bygget, og `aktiv-plan.md` markerer `fase: build`. Det bryder formålet: docs må ikke modsige virkeligheden.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3884: trailing whitespace.
+[KRITISK] `codex-review.sh` lader kritisk subtype passere som exit 0  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3885: trailing whitespace.
+Konkret afvigelse: Disciplin §5 definerer `MANGLENDE-EKSISTERENDE-BEVARELSE` som KRITISK-undertype, og §10.4 beder Codex flage den. Parseren stopper kun på `KRITISK`, ikke på denne subtype; `--parse-test` har heller ingen fixture for den.  

exec
/bin/bash -lc 'pnpm governance:check' in /home/mathias/stork-2.0
exec
/bin/bash -lc 'pnpm governance:selftest' in /home/mathias/stork-2.0
exec
/bin/bash -lc 'scripts/codex-review.sh --parse-test' in /home/mathias/stork-2.0
 succeeded in 115ms:
  ✓ '[ESCALATE] iter > 3' -> exit 4
  ✓ '[MANGLENDE-EKSISTERENDE-BEVARELSE] gate tabt' -> exit 2
parse-test: alle fixtures passed

 succeeded in 349ms:

> stork-2.0@0.0.0 governance:check /home/mathias/stork-2.0
> node scripts/governance-check.mjs

✓ dead-doc-paths
✓ junk-files
✓ laesefoelge-targets
✓ pointer-validity
✓ owns-uniqueness
✓ number-home-uniqueness
✓ H-ref-integrity
✓ structural-chain

Governance-check: alle checks passed (21 docs, 3 scripts)

 succeeded in 1560ms:

> stork-2.0@0.0.0 governance:selftest /home/mathias/stork-2.0
> node scripts/governance-check.selftest.mjs

  ✓ baseline ren kopi -> exit 0
  ✓ planted dead-doc-paths -> exit != 0
  ✓ planted junk-files -> exit != 0
  ✓ planted owns-uniqueness -> exit != 0
  ✓ planted number-home-uniqueness -> exit != 0
  ✓ planted H-ref-integrity -> exit != 0
  ✓ planted script-dead-path -> exit != 0
  ✓ planted chain-missing-files -> exit != 0
  ✓ planted chain-formaal-mismatch -> exit != 0
  ✓ planted chain-missing-krydspeg -> exit != 0
  ✓ planted chain-missing-status-krydspeg -> exit != 0
  ✓ planted chain-rapport-missing -> exit != 0
  ✓ planted chain-rapport-formaal-mismatch -> exit != 0
  ✓ planted chain-rapport-no-formaal -> exit != 0
  ✓ script-dead-path-deprecated -> exit 0

Governance selftest: alle cases passed

codex
De aftalte checks er grønne, og `--parse-test` beviser den nye severity-routing. Et ekstra whitespace-tjek fejler kun på committede rå Codex-review-filer; jeg vurderer nu om det er et egentlig build-fund eller en kosmetisk note, fordi de filer er markeret som ephemeral og slettes ved pakke-luk.
exec
/bin/bash -lc 'git status --short --branch' in /home/mathias/stork-2.0
exec
/bin/bash -lc 'rg -n "diff --check|whitespace|trailing|governance:check|governance:selftest" .github package.json pnpm-workspace.yaml scripts docs/strategi/disciplin.md' in /home/mathias/stork-2.0
 succeeded in 0ms:
## claude/gov-docs-renhed-build...origin/claude/gov-docs-renhed-build

 succeeded in 0ms:
docs/strategi/disciplin.md:214:**Mekanisk (lag 1 — `scripts/governance-check.mjs`, `pnpm governance:check`, CI-step):** døde doc-stier (docs + scripts), junk/lock-filer, brudte LÆSEFØLGE-/pointer-mål, **owns-unikhed** (ét begreb, ét hjem), nummer-hjem-unikhed (G/H kanonisk entry ét sted), H-ref-integritet (hver H-ref → åben entry eller historisk-kode i `huskeliste.md`). Princip: **owner = definitionshjem, ikke mention-hjem.** Hver governance-doc deklarerer sit ejerskab via en `<!-- governance-owns: … -->`-markør; scanneren fejler ved dobbelt-ejerskab. **Ærlig grænse:** fanger _deklareret_ dobbelt-ejerskab + nummer-dubletter mekanisk; _udeklareret prosa-overlap_ fanges ikke mekanisk → lag 2.
docs/strategi/disciplin.md:222:**Governance-ændringer er review-artefakter:** en ændring til vision/disciplin/master-plan går gennem samme gate som kode — `governance:check` grøn + Codex' prosa-modsigelses-svar. Fraværet af netop dette gav V5's rolle-modsigelse (vision↔disciplin); §8.1 lukker den klasse.
package.json:27:    "governance:check": "node scripts/governance-check.mjs",
package.json:28:    "governance:selftest": "node scripts/governance-check.selftest.mjs",
scripts/migration/employees/1_discovery.sql:27:\echo '── 2. Email-format-anomalier (forventet: alle lowercase, ingen whitespace) ──'
scripts/migration/employees/1_discovery.sql:31:         when email <> trim(email)  then 'whitespace'
scripts/governance-check.mjs:116:    let p = m[0].replace(/[.)\]:,/]+$/, ""); // strip trailing punktuation + slash
scripts/fitness.mjs:281:        // Strip (function body / cron body / data-literal): erstat med whitespace
.github/workflows/ci.yml:67:        run: pnpm governance:check
.github/workflows/ci.yml:70:        run: pnpm governance:selftest

exec
/bin/bash -lc "sed -n '1,140p' .github/workflows/ci.yml && sed -n '1,80p' package.json" in /home/mathias/stork-2.0
 succeeded in 0ms:
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}

jobs:
  ci:
    name: Lint, typecheck, test, build
    runs-on: ubuntu-latest
    timeout-minutes: 15
    env:
      HUSKY: "0"
      TURBO_TELEMETRY_DISABLED: "1"
      SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

    steps:
      - uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10.33.0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Prettier check
        run: pnpm format:check

      - name: ESLint
        run: pnpm lint

      - name: TypeScript
        run: pnpm typecheck

      - name: Vitest
        run: pnpm test

      - name: Build
        run: pnpm build

      - name: Migration-gate (Phase 2 strict)
        env:
          MIGRATION_GATE_STRICT: "true"
        run: pnpm migration:check

      - name: Fitness functions
        run: pnpm fitness

      - name: Fitness selftest (§3-checks negativ-test)
        run: pnpm fitness:selftest

      - name: Governance check (lag-1 spærhage)
        run: pnpm governance:check

      - name: Governance selftest
        run: pnpm governance:selftest

      - name: Supabase link
        if: env.SUPABASE_ACCESS_TOKEN != ''
        run: pnpm supabase:link

      - name: Types drift check
        if: env.SUPABASE_ACCESS_TOKEN != ''
        run: pnpm types:check

      - name: Schema drift check
        if: env.SUPABASE_ACCESS_TOKEN != ''
        run: pnpm schema:check

      - name: DB tests
        if: env.SUPABASE_ACCESS_TOKEN != ''
        run: pnpm db:test
{
  "name": "stork-2.0",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "engines": {
    "node": ">=24.0.0 <25",
    "pnpm": ">=10.0.0 <11"
  },
  "packageManager": "pnpm@10.33.0",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "supabase:link": "supabase link --project-ref imtxvrymaqbgcvsarlib",
    "types:generate": "bash scripts/types-gen.sh --write",
    "types:check": "bash scripts/types-gen.sh --check",
    "schema:pull": "supabase db dump --linked --schema public --file supabase/schema.sql",
    "schema:check": "bash scripts/schema-check.sh",
    "migration:check": "node scripts/migration-gate.mjs",
    "fitness": "node scripts/fitness.mjs",
    "fitness:selftest": "node scripts/fitness.selftest.mjs",
    "governance:check": "node scripts/governance-check.mjs",
    "governance:selftest": "node scripts/governance-check.selftest.mjs",
    "db:test": "node scripts/run-db-tests.mjs",
    "scope:check": "bash -c 'patterns=$(paste -sd\"|\" scripts/scope-cleanup-patterns.txt); hits=$(git grep -iE \"$patterns\" -- docs/ supabase/ scripts/ \":(exclude)scripts/scope-cleanup-patterns.txt\"); if [ -n \"$hits\" ]; then echo \"$hits\"; exit 1; else exit 0; fi'",
    "prepare": "husky"
  },
  "devDependencies": {
    "husky": "^9.1.7",
    "lint-staged": "^15.5.2",
    "prettier": "^3.4.2",
    "supabase": "^2.98.2",
    "turbo": "^2.9.14",
    "typescript": "^5.8.3"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx,json,md,yml,yaml,css,html}": [
      "prettier --write"
    ],
    "apps/web/**/*.{ts,tsx}": [
      "eslint --fix"
    ]
  },
  "pnpm": {
    "onlyBuiltDependencies": [
      "@swc/core",
      "esbuild",
      "supabase"
    ]
  }
}

exec
/bin/bash -lc "git diff --check origin/main...HEAD -- ':"'!docs/coordination/codex-reviews/**'"'" in /home/mathias/stork-2.0
 succeeded in 0ms:
exec
/bin/bash -lc 'git diff --name-only origin/main...HEAD -- docs/coordination/codex-reviews docs/coordination/v4-slettede-docs docs/coordination/gov-docs-renhed-status.md docs/coordination/gov-docs-renhed-plan.md docs/coordination/gov-docs-renhed-krav-og-data.md' in /home/mathias/stork-2.0
 succeeded in 0ms:
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-1.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-2.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-3.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-4.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md
docs/coordination/gov-docs-renhed-krav-og-data.md
docs/coordination/gov-docs-renhed-plan.md
docs/coordination/gov-docs-renhed-status.md

exec
/bin/bash -lc "rg -n \"§8\\.1-SVAR|MODSIGELSE|forretningsforstaaelse|vision\" docs/coordination/gov-docs-renhed-plan.md docs/coordination/gov-docs-renhed-status.md docs/strategi/disciplin.md docs/strategi/vision-og-principper.md docs/strategi/forretningsforstaaelse.md docs/strategi/stork-2-0-master-plan.md docs/LÆSEFØLGE.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
docs/LÆSEFØLGE.md:23:1. `docs/strategi/vision-og-principper.md`
docs/LÆSEFØLGE.md:26:2. `docs/strategi/forretningsforstaaelse.md`
docs/LÆSEFØLGE.md:28:   **LÅST-AUTORITATIV** — stamme-doc med vision (D4). Opdateres når
docs/LÆSEFØLGE.md:46:Ved konflikt mellem dokumenter: vision (1) vinder over alle andre — undtagen
docs/LÆSEFØLGE.md:47:forretningsforstaaelse (2): modsigelse mellem de to stamme-docs er et hul →
docs/strategi/stork-2-0-master-plan.md:36:Vision, tre bærende principper og ni operationelle principper er defineret i `docs/strategi/vision-og-principper.md`. Master-planen forudsatter dem og bygger arkitekturen ovenpå. Konflikt mellem master-plan og vision-dokument løses ved at master-planen tilrettes — vision-dokumentet er autoritativ kilde.
docs/strategi/stork-2-0-master-plan.md:40:Mathias' tanker pr. pakke lever i `docs/coordination/<pakke>-krav-og-data.md` (pakke-kontrakt). Tanker der ændrer ramme på tværs af pakker går ind i `docs/strategi/forretningsforstaaelse.md` (LÅST stamme-doc) eller `docs/strategi/vision-og-principper.md` (LÅST evig, ved princip-niveau). Master-planen reflekterer arkitektur-konsekvensen som Appendix C-rettelser. Ved konflikt vinder stamme-docs (vision + forretningsforstaaelse — indbyrdes modsigelse mellem de to er et hul → STOP → Mathias lukker, D4) → krav-dok → master-plan tilrettes.
docs/strategi/stork-2-0-master-plan.md:392:**Superadmin (T9-omstart-rammen punkt 10 + vision-princip 2):**
docs/strategi/stork-2-0-master-plan.md:573:**Pricing er IKKE et output_type** — det er en beregning hvis resultat bliver input til lønart (provision).
docs/strategi/stork-2-0-master-plan.md:849:| Status       | Betydning                                                               | Provision tæller |
docs/strategi/stork-2-0-master-plan.md:945:**Provision-aggregering:** Helper-RPC summerer commission for status der tæller, minus salary-corrections hvor target-periode = aktuel periode. Aggregat re-evalueres ved mutation i åben periode. Fryses ved lock.
docs/strategi/stork-2-0-master-plan.md:1214:- Sælger-løn (provision + tillæg − fradrag)
docs/strategi/stork-2-0-master-plan.md:1222:- Leder-provision
docs/strategi/stork-2-0-master-plan.md:1252:- Provision-pr-time
docs/strategi/stork-2-0-master-plan.md:1262:**Klient-tid-betaling (CPO + provision pr. klient):**
docs/strategi/stork-2-0-master-plan.md:1281:- Sælger-løn-formel: provision + timeløn + diæt + oplæring + tillæg − annulleringer + feriepenge-tillæg
docs/strategi/stork-2-0-master-plan.md:1282:- Teamleder-løn: grundløn + leder-provision (KPI) + tillæg − fradrag
docs/strategi/stork-2-0-master-plan.md:1296:FM hænger på samme stamme som resten. FM-salg er kanonisk salg — ingen særmodel. Samme sales-tabel, samme pricing, samme provision, samme status, samme attribution, samme annullering. Eneste forskel: ingest-vejen (manuel UI vs adapter) og kilde-feltet.
docs/strategi/stork-2-0-master-plan.md:1717:### Pricing + provision
docs/strategi/stork-2-0-master-plan.md:1724:| Provision =        | Sum(pending + godkendt) − Cancellations         |
docs/strategi/stork-2-0-master-plan.md:1997:| 26  | Eksplicitte hardkodnings-undtagelser fra "alt drift i UI"-princippet: (a) audit-hash-algoritme `sha256` (audit-integritet kræver konsistens); (b) `superadmin`-rolle og `is_admin()`/`is_superadmin()`-helper (fundament for permission-systemet; eneste hardkodede rolle pr. vision-princip 2).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
docs/strategi/stork-2-0-master-plan.md:1998:| 27  | Lifecycle for konfigurerbare data-håndtering-objekter (vision-princip 5): tabeller med klassifikations-styring får status-felt `draft → tested → approved → active` med separate permissions pr. overgang. INSERT/UPDATE-til-active uden gennem activate-RPC blokeres af DB-trigger. Bootstrap-strategier får status `approved` ved seed; aktivering via UI som pre-cutover-step.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
docs/strategi/stork-2-0-master-plan.md:2004:| 33  | Master-plan sandheds-audit (Claude.ai 2026-05-16): §5 udvidet med to bullets ("Sammenkobling eksplicit i datamodellen" + "Konfiguration har livscyklus") for at reflektere vision-meta-princip 3 og vision-operationel-princip 5. §3 udvidet med CI-blocker 19 (FK-coverage) for at håndhæve sammenkoblings-princippet teknisk. §0 fik ny "Strategiske retning-skift"-sektion der peger på mathias-afgoerelser som kilde. Konsekvens: master-plan reflekterer nu alle 3 meta-principper + alle 9 operationelle principper fra vision-dokumentet.                                                                                                                                                                                                                                                                                                                 |
docs/strategi/vision-og-principper.md:3:<!-- governance-owns: vision, principper -->
docs/strategi/vision-og-principper.md:5:> **LÅST DOKUMENT.** Dette er grundstenen i Stork 2.0. Ændringer kræver eksplicit godkendelse fra Mathias via PR. CODEOWNERS håndhæver at kun Mathias kan approve ændringer. Dokumentet er autoritativ kilde for vision og principper — ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette. Undtagelse (D4): `forretningsforstaaelse.md` er med-stamme-doc — en modsigelse mellem de to er et hul der STOPPER arbejdet og lukkes af Mathias, ikke en konflikt dette dokument vinder.
docs/strategi/disciplin.md:5:Ét hjem for hvordan vi arbejder sammen: aktører, roller, flow, gates, severities, disciplin. Mathias styrer tanker, funktioner, logik og vision; AI'erne (Claude.ai, Code, Codex) bygger. Vi bygger ovenpå eksisterende kode, ikke nyt hver gang.
docs/strategi/disciplin.md:7:> **Dette er det eneste rolle- og proces-hjem.** Vision-og-principper.md definerer ikke længere aktører eller roller — det er proces, og det bor her. Ved konflikt om systemets vision vinder vision-dokumentet; ved spørgsmål om hvordan vi arbejder vinder denne fil.
docs/strategi/disciplin.md:17:| **Mathias**   | Tanker, funktioner, logik, vision. Eneste beslutningstager. Dikterer krav-dok pr. pakke. Godkender plan + slut-rapport                    |
docs/strategi/disciplin.md:69:**Forudsætning — fundament-validering (grøn før qwerg):** planen skal stå på mål med vision + forretningsforstaaelse. Almindelig plan bekræfter "ingen forretnings-intentions-ændring" (Doc-currency A, §10.2). Plan der ændrer intention: fundament-doc'en reconciles først gennem §8.1-gaten + Mathias' CODEOWNERS — FØR qwerg. Modsigelses-konsekvens per §8 (vision LÅST = STOP). En plan godkendes ikke stående på fundament den modsiger.
docs/strategi/disciplin.md:136:**Bevares på main:** krav-dok → `arkiv/<pakke>-krav-og-data.md` · plan → `arkiv/<pakke>-plan.md` · slut-rapport → `rapport-historik/<dato>-<pakke>.md` · in-place-opdateringer til vision, forretningsforstaaelse, master-plan (overblik), teknisk-gaeld.
docs/strategi/disciplin.md:203:| `vision-og-principper.md`               | **LÅST**            | STOP. KRITISK. Vinder over alt undtagen forretningsforstaaelse (D4: indbyrdes stamme-doc-modsigelse = hul → STOP → Mathias lukker). Dokumentér i blokker-fil, argumentér ikke videre |
docs/strategi/disciplin.md:204:| `forretningsforstaaelse.md`             | **LÅST**            | STOP. KRITISK. Stamme-doc med vision (D4): modsigelse mellem de to er et hul Mathias lukker — ingen trumf                                                                            |
docs/strategi/disciplin.md:208:Pointe: kun vision og pakke-kontrakten stopper automatisk. Master-plan-modsigelse er en trigger for en afgørelse, ikke en blokering.
docs/strategi/disciplin.md:216:**Codex-mandat (lag 2 — semantisk):** ved enhver ændring til en governance-doc (vision / disciplin / master-plan / forretningsforstaaelse / owns:-register) SKAL Codex eksplicit svare: **"modsiger dette prosa-mæssigt et begreb som en anden doc ejer?"** før merge. Det dækker den klasse scanneren ikke kan.
docs/strategi/disciplin.md:218:**Stamme-doc-konsistens (D4):** ændres én af de to stamme-docs (vision / forretningsforstaaelse) SKAL ændringen eksplicit konsistens-tjekkes mod den anden. Modsigelse = hul → STOP → Mathias lukker. Ingen af de to trumfer den anden.
docs/strategi/disciplin.md:220:**Fast markør:** Codex' svar gives som linjen `§8.1-SVAR: INGEN-MODSIGELSE` eller `§8.1-SVAR: MODSIGELSE — <begreb> ejes af <doc>` i reviewet, og gentages i slut-rapporten (§10.3) når pakken har berørt governance-docs — så svaret kan tjekkes i PR/rapport, ikke kun huskes i chat.
docs/strategi/disciplin.md:222:**Governance-ændringer er review-artefakter:** en ændring til vision/disciplin/master-plan går gennem samme gate som kode — `governance:check` grøn + Codex' prosa-modsigelses-svar. Fraværet af netop dette gav V5's rolle-modsigelse (vision↔disciplin); §8.1 lukker den klasse.
docs/strategi/disciplin.md:239:**MÅ:** skrive krav-dok fra Mathias' input · spørge Mathias direkte i krav-dok-fasen · reviewe slut-rapport mod krav-dok + vision + forretningsforstaaelse · levere FEEDBACK eller APPROVAL (aldrig begge).
docs/strategi/disciplin.md:241:**Triggers:** `qwers` → bekræft rolle · `qwers <pakke>` → bekræft + proaktiv kontekst-recon STRENGT i forretnings-sprog (læs forretningsforstaaelse + evt. vision + søg rapport-historik; output: "det vi har" + targeted spørgsmål + scope-forslag; FORBUDT: tabel/kolonne/RPC-navne) · `qwerr` → slut-rapport-review.
docs/strategi/disciplin.md:256:**Plan-review-fokus (dækker den gamle fire-dok-konsultations substans):** patch-først korrekt? · end-to-end-spor alle 5? · DB-state-dump matcher faktisk state? · krav-dok-konsistens uden scope-creep? · vision + forretningsforstaaelse-modsigelse? **Approval:** APPROVAL eller FEEDBACK (undtagelse: APPROVAL + OPGRADERING). Kun Codex-approval kræves for plan.
docs/strategi/disciplin.md:334:Står planen på mål med vision + forretningsforstaaelse?
docs/strategi/disciplin.md:403:- docs/strategi/vision-og-principper.md
docs/strategi/disciplin.md:404:- docs/strategi/forretningsforstaaelse.md (LÅST stamme-doc, D4)
docs/strategi/disciplin.md:416:- Vision + forretningsforstaaelse-modsigelse
docs/strategi/disciplin.md:424:Berører ændringen en governance-doc (vision / disciplin / master-plan /
docs/strategi/disciplin.md:425:forretningsforstaaelse / owns-register): afslut med
docs/strategi/disciplin.md:426:`§8.1-SVAR: INGEN-MODSIGELSE` eller `§8.1-SVAR: MODSIGELSE — <hvad>`.
docs/strategi/disciplin.md:437:1. Hvilket vision-element understøtter dette? 2. Hvilket kunne det svække? 3. Findes en simplere løsning uden vision-kompromis? 4. Hvis kompromis: dokumenteret med G-nummer + deadline? 5. Skal en halt-marker rejses (§6.1)? 6. Patch-først overholdt (§3.1)? 7. End-to-end-spor dokumenteret (§3.3)? 8. Hvis destructive drop: preflight kørt (§3.9)?
docs/strategi/disciplin.md:445:Master-plan-konflikt (men master-plan er overblik — se §8) · vision-modsigelse (LÅST) · designvalg ikke afgjort · data-tab-risiko ud over allerede afgjort · konvergens-counter rammer 5 · destructive drop uden preflight (§3.9) · inline-fix kræver ændring af fundament-infrastruktur.
docs/strategi/disciplin.md:463:Gjort i V5-adoptionen: disciplin.md = V5 · vision renset for roller · seneste-rapport-pointer rettet · skill flyttet til docs/claude-ai/ (tombstone `git rm`'et) · Appendix A 4-dim markeret superseded · LÆSEFØLGE opdateret · `codex-notify.yml` handoff-refs rettet til §9.1/§9.3. · **gov-1 (repo↔DB-paritet, PR #92 merged)** · **gov-2 (mekanisk spærhage + owns-register + §8.1 Codex-mandat + H-hjem `huskeliste.md`, PR #93 merged)** · **gov-docs-housekeeping (krav-dok-familie, PR #94 merged)** · **gov-3a (4 §3-checks #4/#7/#16/#17 + zone-§3-fjernelse, PR #95 merged)** · **gov-3b-1 (#19 FK-dækning + #6 indeks-pr-policy, PR #96 merged)** · **gov-3b-2 (#10 SECDEF-markør-disciplin, PR #101 merged)** · **gov-3b-3a (#18 del 1: 9 INVOKER→SECDEF, PR #103 merged)** · **gov-3b-3b (#18 del 2 + REVOKE + G065 LØST, PR #105 merged)**.
docs/strategi/forretningsforstaaelse.md:5:> **LÅST DOKUMENT (stamme-doc med vision-og-principper.md).** Ændringer kræver eksplicit godkendelse fra Mathias via PR; CODEOWNERS håndhæver. Opdateres når Mathias' tanker udvikler sig — men de to stamme-docs må aldrig være indbyrdes uenige: en modsigelse er et hul der STOPPER og lukkes af Mathias (D4). Mekanisk håndhævelse (required code-owner-review) lander i gov-4 — dette er doc-niveau-løftet.
docs/strategi/forretningsforstaaelse.md:9:Dokumentet er målrettet roller der hjælper med plan-arbejde, krav-dok og review. Det erstatter ikke vision-dokumentet, master-planen eller Mathias-afgørelser — det er baggrunden der gør de dokumenter forståelige.
docs/strategi/forretningsforstaaelse.md:40:- Stork skal kunne bruge klient-dimensionen til at afgøre pris og provisions-sats
docs/strategi/forretningsforstaaelse.md:43:Tre dimensioner, tre konsekvenser. Sælgeren får sin provision. Klienten bestemmer prisen og satserne. Teamet får DB-løn til sin leder. De tre er adskilte, og særligt vigtigt: team kommer via klienten, ikke direkte fra sælgeren. Det forhindrer at sælger-skift midt i en periode ødelægger tidligere attribution.
docs/strategi/forretningsforstaaelse.md:49:- Stork skal kunne registrere et salg med en eller flere produktlinjer, hver med egen pris og provision
docs/strategi/forretningsforstaaelse.md:50:- Stork skal kunne aggregere provision og omsætning pr. salg som summen af linjerne
docs/strategi/forretningsforstaaelse.md:55:- Stork skal kunne lade berigelses-felter påvirke prissætningen og udløse opdateret provision
docs/strategi/forretningsforstaaelse.md:66:- Stork skal kunne genberegne salg når pricing ændres — kun før provision er udbetalt
docs/strategi/forretningsforstaaelse.md:68:Salget er bygget op af linjer. Prisen kommer ikke fra produktet alene — den kommer fra en regel der ser på flere felter samtidig. Salget kan ændre værdi efter registrering hvis det beriges med nye felter (eksempel: straksbetaling). Hele forretningens prissætning kører gennem samme regel-mekanisme, så sælger-provision og leder-DB altid bygger på samme tal.
docs/strategi/forretningsforstaaelse.md:80:- Stork skal kunne beregne CPO og time-provision pr. klient via samme regel-mekanisme som salgs-pricing
docs/strategi/forretningsforstaaelse.md:112:Vagten er fundamentet for sælgerens dag. Den planlægges, den betales. Stempeluret dokumenterer hvad der faktisk skete, og klient-tid-fordelingen siger hvilken klient sælgeren brugte tiden på. Klient-tid kan give CPO og provision — beregnet gennem samme mekanisme som salgs-pricing, så de to systemer aldrig afviger.
docs/strategi/forretningsforstaaelse.md:128:## 7. Provision-mekanikken — sælger, leder, assistent/stab
docs/strategi/forretningsforstaaelse.md:130:- Stork skal kunne beregne sælger-provision pr. salg baseret på klientens provisions-aftale
docs/strategi/forretningsforstaaelse.md:148:Tre niveauer der ikke fungerer ens. Sælgeren får direkte provision pr. salg. Lederen får DB-løn bundet til klient-ejerskab. Assistent og stab har faste lønarter uden salgs-afhængighed. Det fælles træk: alle satser og lønarter konfigureres i UI gennem formel-systemet, så forretningen kan reagere uden at gå gennem en udvikler.
docs/strategi/forretningsforstaaelse.md:176:Algoritmen er kode, værdien er data. Hvordan en provision beregnes ligger fast i kode; hvad satsen er, ligger som data i UI. Det betyder forretningen kan reagere hurtigt på ændringer uden teknisk arbejde. Livscyklus-disciplinen forhindrer at "data i UI" bliver anarki — ændringer går gennem flere kontrol-skridt før de er live.
docs/strategi/forretningsforstaaelse.md:239:FM er ikke et separat univers. Det er samme stamme set fra en anden vinkel: i stedet for at sidde og ringe står sælgeren fysisk på en messe eller i en butik. Klienten er stadig dimensionen, lederen får stadig DB, provisionen beregnes stadig på samme måde. Lokationen og bookingen er FM's egne entiteter, men de spiller ind i samme system som resten af forretningen — ingen parallel løn, ingen parallel attribution.
docs/strategi/forretningsforstaaelse.md:248:- Stork 2.0 skal kunne afgøre design ud fra vision og principper, ikke ud fra "hvordan gør 1.0 det?"
docs/strategi/forretningsforstaaelse.md:264:Det er ét sammenhængende system, ikke flere isolerede dele. Klienten er fundamentet; dato-snapshot fryser bindinger; salg får sin pris fra regler; vagter giver løn-timer; klient-tid kan give yderligere provision via samme regel-mekanisme; annulleringer rejser tilbage via snapshot; lønperioden låser det hele; modposter laves i åbne perioder. Rettigheder bestemmer hvem der må gøre hvad. Persondata adskilles fra forretningsdata. Hele værdi-laget — satser, lønarter, regler — er konfigurerbar data, ikke kode. Det er den helhed der adskiller godt 2.0-arbejde fra dårligt: godt arbejde ser kæden, dårligt arbejde løser ét isoleret problem og bryder noget tre led henne.
docs/coordination/gov-docs-renhed-plan.md:18:| 1   | Vision-banner i modstrid med D4 (§8.1-MODSIGELSE)                               | KRITISK  | **ACCEPT.** Vision-banneret patches (appendix A.1) — minimal D4-undtagelse, kilde er Mathias' egen D4-afgørelse i krav-dok. Vision er LÅST: ændringen håndhæves af Mathias' CODEOWNERS-approval ved merge; flagges eksplicit i PR |
docs/coordination/gov-docs-renhed-plan.md:32:| R2-4 | Master-plan kalder stadig forretningsforståelse "tanke-data" + vision-vinder-hierarki (§8.1-MODSIGELSE) | MELLEM   | **ACCEPT** (rettet nu). Ny A.14 patcher master-planens hierarki-afsnit. §8-rationale: master-plan er RETNINGSGIVENDE — Mathias har allerede afgjort løftet i krav-dok, så master-plan tilrettes (præcis som master-planen selv foreskriver)               |
docs/coordination/gov-docs-renhed-plan.md:38:| R3-1 | A.6 efterlod §8-tabellens vision-række som "Vinder over alt" — to modsatrettede regler i samme tabel | KRITISK           | **ACCEPT.** A.6 udvidet: vision-rækken patches med D4-undtagelsen (nuværende 1:1 + ny 1:1 i A.6). Lukker §8.1-modsigelsen samlet med A.1/A.2/A.10/A.14 |
docs/coordination/gov-docs-renhed-plan.md:44:(scanner + selftest), 11 docs patches (inkl. vision-banner, fund 1, +
docs/coordination/gov-docs-renhed-plan.md:144:### Værn 3: §8.1-SVAR som fast markør (krav pkt 11)
docs/coordination/gov-docs-renhed-plan.md:146:Markør-format: `§8.1-SVAR: INGEN-MODSIGELSE` eller
docs/coordination/gov-docs-renhed-plan.md:147:`§8.1-SVAR: MODSIGELSE — <begreb> ejes af <doc>`. Obligatorisk linje i
docs/coordination/gov-docs-renhed-plan.md:182:| 2 — doc-reconcile    | alle doc-patches (appendix A.1–A.14)                                                           | ingen       | Lav. §8.1-gate: Codex' §8.1-SVAR kræves; vision-patch kræver Mathias-CODEOWNERS ved merge |
docs/coordination/gov-docs-renhed-plan.md:191:status-tekst: forretningsforstaaelse løftes til LÅST (Mathias' afgørelse i
docs/coordination/gov-docs-renhed-plan.md:192:krav-dok) og vision-banneret får D4-undtagelsen (fund 1 — implementerer Mathias'
docs/coordination/gov-docs-renhed-plan.md:195:§8.1-SVAR i godkendelses-runden. Øvrig plan: ingen forretnings-intentions-
docs/coordination/gov-docs-renhed-plan.md:228:### A.1 `docs/strategi/vision-og-principper.md:5` (fund 1)
docs/coordination/gov-docs-renhed-plan.md:232:> **LÅST DOKUMENT.** Dette er grundstenen i Stork 2.0. Ændringer kræver eksplicit godkendelse fra Mathias via PR. CODEOWNERS håndhæver at kun Mathias kan approve ændringer. Dokumentet er autoritativ kilde for vision og principper — ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette.
docs/coordination/gov-docs-renhed-plan.md:236:> **LÅST DOKUMENT.** Dette er grundstenen i Stork 2.0. Ændringer kræver eksplicit godkendelse fra Mathias via PR. CODEOWNERS håndhæver at kun Mathias kan approve ændringer. Dokumentet er autoritativ kilde for vision og principper — ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette. Undtagelse (D4): `forretningsforstaaelse.md` er med-stamme-doc — en modsigelse mellem de to er et hul der STOPPER arbejdet og lukkes af Mathias, ikke en konflikt dette dokument vinder.
docs/coordination/gov-docs-renhed-plan.md:238:### A.2 `docs/strategi/forretningsforstaaelse.md` — LÅST-banner
docs/coordination/gov-docs-renhed-plan.md:252:> **LÅST DOKUMENT (stamme-doc med vision-og-principper.md).** Ændringer kræver eksplicit godkendelse fra Mathias via PR; CODEOWNERS håndhæver. Opdateres når Mathias' tanker udvikler sig — men de to stamme-docs må aldrig være indbyrdes uenige: en modsigelse er et hul der STOPPER og lukkes af Mathias (D4). Mekanisk håndhævelse (required code-owner-review) lander i gov-4 — dette er doc-niveau-løftet.
docs/coordination/gov-docs-renhed-plan.md:279:§8-tabellens vision-række (linje 203) patches OGSÅ (fund R3-1 — uden dette
docs/coordination/gov-docs-renhed-plan.md:283:| `vision-og-principper.md`               | **LÅST**            | STOP. KRITISK. Vinder over alt. Dokumentér i blokker-fil, argumentér ikke videre                                                                             |
docs/coordination/gov-docs-renhed-plan.md:289:| `vision-og-principper.md`               | **LÅST**            | STOP. KRITISK. Vinder over alt undtagen forretningsforstaaelse (D4: indbyrdes stamme-doc-modsigelse = hul → STOP → Mathias lukker). Dokumentér i blokker-fil, argumentér ikke videre |
docs/coordination/gov-docs-renhed-plan.md:292:Dernæst (uændret fra V2): ny række indsættes efter vision-rækken:
docs/coordination/gov-docs-renhed-plan.md:295:| `forretningsforstaaelse.md` | **LÅST** | STOP. KRITISK. Stamme-doc med vision (D4): modsigelse mellem de to er et hul Mathias lukker — ingen trumf |
docs/coordination/gov-docs-renhed-plan.md:300:> **Stamme-doc-konsistens (D4):** ændres én af de to stamme-docs (vision /
docs/coordination/gov-docs-renhed-plan.md:301:> forretningsforstaaelse) SKAL ændringen eksplicit konsistens-tjekkes mod den
docs/coordination/gov-docs-renhed-plan.md:304:> **Fast markør:** Codex' svar gives som linjen `§8.1-SVAR: INGEN-MODSIGELSE`
docs/coordination/gov-docs-renhed-plan.md:305:> eller `§8.1-SVAR: MODSIGELSE — <begreb> ejes af <doc>` i reviewet, og gentages
docs/coordination/gov-docs-renhed-plan.md:320:- docs/strategi/forretningsforstaaelse.md (tanke-data, ikke kontrakt)
docs/coordination/gov-docs-renhed-plan.md:328:Berører ændringen en governance-doc (vision / disciplin / master-plan /
docs/coordination/gov-docs-renhed-plan.md:329:forretningsforstaaelse / owns-register): afslut med
docs/coordination/gov-docs-renhed-plan.md:330:`§8.1-SVAR: INGEN-MODSIGELSE` eller `§8.1-SVAR: MODSIGELSE — <hvad>`.
docs/coordination/gov-docs-renhed-plan.md:380:2. `docs/strategi/forretningsforstaaelse.md`
docs/coordination/gov-docs-renhed-plan.md:389:2. `docs/strategi/forretningsforstaaelse.md`
docs/coordination/gov-docs-renhed-plan.md:391:   **LÅST-AUTORITATIV** — stamme-doc med vision (D4). Opdateres når
docs/coordination/gov-docs-renhed-plan.md:397:> Ved konflikt mellem dokumenter: vision (1) vinder over alle andre.
docs/coordination/gov-docs-renhed-plan.md:401:> Ved konflikt mellem dokumenter: vision (1) vinder over alle andre — undtagen forretningsforstaaelse (2): modsigelse mellem de to stamme-docs er et hul → STOP → Mathias lukker (D4).
docs/coordination/gov-docs-renhed-plan.md:432:> Mathias' tanker pr. pakke lever i `docs/coordination/<pakke>-krav-og-data.md` (pakke-kontrakt). Tanker der ændrer ramme på tværs af pakker går ind i `docs/strategi/forretningsforstaaelse.md` (tanke-data) eller `docs/strategi/vision-og-principper.md` (LÅST evig, ved princip-niveau). Master-planen reflekterer arkitektur-konsekvensen som Appendix C-rettelser. Ved konflikt vinder vision (LÅST) → forretningsforstaaelse + krav-dok → master-plan tilrettes.
docs/coordination/gov-docs-renhed-plan.md:436:> Mathias' tanker pr. pakke lever i `docs/coordination/<pakke>-krav-og-data.md` (pakke-kontrakt). Tanker der ændrer ramme på tværs af pakker går ind i `docs/strategi/forretningsforstaaelse.md` (LÅST stamme-doc) eller `docs/strategi/vision-og-principper.md` (LÅST evig, ved princip-niveau). Master-planen reflekterer arkitektur-konsekvensen som Appendix C-rettelser. Ved konflikt vinder stamme-docs (vision + forretningsforstaaelse — indbyrdes modsigelse mellem de to er et hul → STOP → Mathias lukker, D4) → krav-dok → master-plan tilrettes.
docs/coordination/gov-docs-renhed-plan.md:506:- docs/strategi/vision-og-principper.md
docs/coordination/gov-docs-renhed-plan.md:507:- docs/strategi/forretningsforstaaelse.md (LÅST stamme-doc, D4)
docs/coordination/gov-docs-renhed-plan.md:519:scope-creep · vision/forretningsforstaaelse-modsigelse ·
docs/coordination/gov-docs-renhed-plan.md:528:"§8.1-SVAR: INGEN-MODSIGELSE" eller "§8.1-SVAR: MODSIGELSE — <hvad>".

exec
/bin/bash -lc "sed -n '480,640p' docs/coordination/gov-docs-renhed-plan.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
Følg niveau 1-prefixens scope-krav + marker-protokol + dialog-regler.

Max $MAX_WORDS ord output. Brug marker-format fra niveau 1-prefix (KRITISK/MELLEM/LAV/HUL/OPTIMERING-FORSLAG/G-NUMMER-KANDIDAT etc.). Hvis du ikke har fund: skriv "APPROVAL — Runde $ROUND_N".
EOF
)
```

— med (ny 1:1):

```bash
STATUS_FILE="docs/coordination/${PAKKE_NAME}-status.md"
KRAV_FILE="docs/coordination/${PAKKE_NAME}-krav-og-data.md"

case "$PHASE" in
  plan|build)
    FORMAAL_LINE='FORMÅL: udledes af "## Formål"-sektionen i '"$PLAN_FILE"'.'
    ;;
  slut-rapport)
    FORMAAL_LINE='FORMÅL (slut-rapport-fase): Verificér at slut-rapporten reflekterer faktisk leverance, plan-afvigelser ærligt, og leverance-tabel mod krav-dok + Stork-invariant-tjek (disciplin §10.3) korrekt.'
    ;;
esac

PROMPT=$(cat <<EOF
Du er Codex i Stork 2.0 — uafhængig kode-reviewer, read-only (disciplin §9.3).

Læs FØR review:
- docs/strategi/vision-og-principper.md
- docs/strategi/forretningsforstaaelse.md (LÅST stamme-doc, D4)
- docs/strategi/disciplin.md §9.3 (din rolle) + §5 (severities) + §8.1
- $KRAV_FILE (pakke-kontrakt — hvis den findes)
- $PLAN_FILE ($PHASE-fasen for pakke $PAKKE_NAME)
- $STATUS_FILE (kontekst + konvergens-counter — hvis den findes)

RUNDE-NUMMER: $ROUND_N
FASE: $PHASE
$FORMAAL_LINE

Review-fokus (§9.3): patch-først (§3.1) · end-to-end-spor (§3.3) ·
state-dump matcher faktisk state (§3.2) · krav-dok-konsistens uden
scope-creep · vision/forretningsforstaaelse-modsigelse ·
MANGLENDE-EKSISTERENDE-BEVARELSE.

Format pr. fund:
[SEVERITY] Kort beskrivelse
Konkret afvigelse: ...
Anbefalet handling: [V<n+1>-rettelse / G-nummer / kosmetisk note]

Berører ændringen en governance-doc: afslut med
"§8.1-SVAR: INGEN-MODSIGELSE" eller "§8.1-SVAR: MODSIGELSE — <hvad>".

Max $MAX_WORDS ord. Hvis ingen fund: skriv "APPROVAL — Runde $ROUND_N".
EOF
)
```

**Exec-linjen** (linje 146-149, nuværende 1:1):

```bash
timeout --signal=KILL "$TIMEOUT_SEC" codex exec --skip-git-repo-check \
  -c "model_reasoning_effort=\"$REASONING\"" \
  --enable fast_mode \
  "$PROMPT" > "$RAW_OUTPUT" 2>&1
```

Ny (fund 6 — stdin-hænger uden TTY, fanget live i runde 1):

```bash
timeout --signal=KILL "$TIMEOUT_SEC" codex exec --skip-git-repo-check \
  -c "model_reasoning_effort=\"$REASONING\"" \
  --enable fast_mode \
  "$PROMPT" > "$RAW_OUTPUT" 2>&1 < /dev/null
```

**Marker-parsing gøres bracket-tolerant (fund R2-1, KRITISK):** §10.4-formatet
er `[SEVERITY] Kort beskrivelse`, men parseren matcher kun nøgne prefixes — et
`[KRITISK]`-fund ville give exit 0. Hver marker-grep ændres fra nøgent mønster
til bracket-tolerant. Nuværende 1:1 → ny 1:1:

```
^(STOP-FOR-CLARIFICATION):                                      → ^\[?STOP-FOR-CLARIFICATION\]?(\b|:)
^(BRUD-PAA-KRAV|TEKNISK-BLOKERING|PLAN-AFVIGELSE|KRITISK-SIKKERHEDSHUL): → ^\[?(BRUD-PAA-KRAV|TEKNISK-BLOKERING|PLAN-AFVIGELSE|KRITISK-SIKKERHEDSHUL)\]?(\b|:)
^KRITISK\b                                                      → ^\[?KRITISK\]?\b
^(\[NEEDS-MATHIAS\]|NEEDS-MATHIAS)\b                            → ^\[?NEEDS-MATHIAS\]?\b
^(WORKAROUND-INTRODUCERET):                                     → ^\[?WORKAROUND-INTRODUCERET\]?(\b|:)
^(ESCALATE|AUTO-ESKALATION):                                    → ^\[?(ESCALATE|AUTO-ESKALATION)\]?(\b|:)
^(OPTIMERING-FORSLAG):                                          → ^\[?OPTIMERING-FORSLAG\]?(\b|:)
^(SPARRING-OENSKE):                                             → ^\[?SPARRING-OENSKE\]?(\b|:)
^(G-NUMMER-KANDIDAT):                                           → ^\[?G-NUMMER-KANDIDAT\]?(\b|:)
^APPROVAL\b                                                     → ^\[?APPROVAL\]?\b
```

NB: `^\[?KRITISK\]?\b` bevarer G055-egenskaben (ordgrænse — "KRITISKE" matcher
ikke). Eksisterende routing-prioritet og exit-koder uændret.

**Ny `--parse-test`-mode (bevis for R2-1-fixet):** marker-parsing + exit-routing
refaktoreres til funktionen `parse_markers <fil>` (samme logik, samme output);
`scripts/codex-review.sh --parse-test` kører canned fixtures gennem den og
asserter routing:

| Fixture-indhold                     | Forventet exit |
| ----------------------------------- | -------------- |
| `APPROVAL — Runde 1`                | 0              |
| `[KRITISK] fund`                    | 2              |
| `KRITISK: fund`                     | 2              |
| `KRITISKE detaljer` (negativ-case)  | 0              |
| `[NEEDS-MATHIAS] spørgsmål`         | 4              |
| `STOP-FOR-CLARIFICATION: mangler X` | 1              |
| `[PLAN-AFVIGELSE] afviger fra plan` | 2              |
| `WORKAROUND-INTRODUCERET: hack`     | 3              |
| `[ESCALATE] iter > 3`               | 4              |

(De tre sidste fixtures tilføjet i V4 efter Codex' runde 3-kandidat — fuld
routing-table-dækning: alle fem exit-koder 0/1/2/3/4 er nu beviste, frem for
G-nummer.)

Køres lokalt som build-evidens i batch 1; CI-wiring noteres til gov-5
(runner-pakken, hvor scriptet får sin automation-rolle).

**Kosmetisk i samme repair:** header linje 3 + usage linje 31: "V5.3
marker-protocol/-protokol" → "V5 (disciplin §5 severities + §6.1 halt-markers)".

**Bevares 1:1 (MANGLENDE-EKSISTERENDE-BEVARELSE-tjek):** argument-parsing
(22-60) · pre-flight minus prefix-blok (66-76, 84-87) · PAKKE_NAME/DATE/
OUTPUT_DIR/OUTPUT_FILE/PLAN_SHA (94-107) · timeout-/fejl-håndtering (137-165) ·
output-fil-header m. re-run-command (167-193) · marker-parsing-sektionen
(199-259) strukturelt bevaret — eneste ændring er de bracket-tolerante mønstre
(R2-1-tabellen ovenfor) + flytning ind i `parse_markers`-funktion ·
exit-kode-routing (261-286) uændret. Ingen gates/markers/exit-koder tabes.

### B.2 `scripts/governance-check.mjs` — allowlist-split

Nuværende `deadDocPaths()` (linje 129-142, 1:1):

```js
function deadDocPaths() {
  const scan = [...DOC_FILES, ...SCRIPT_FILES];
  for (const f of scan) {
    const refs = docRefs(stripFenced(read(f)));
    for (const r of refs) {
      if (pathExists(r)) continue;
      if (ALLOWED.has(r)) {
        notes.push(`dead-doc-paths: tilladt manglende ${r} (${f})`);
        continue;
      }
      v("dead-doc-paths", `${f}: peger på ikke-eksisterende ${r} (ikke i allowlist)`);
    }
  }
}
```

Ny (1:1):

```js
const ALLOW_BY_PATH = new Map(MISSING_PATH_ALLOWLIST.map((a) => [a.path, a]));
const SCRIPT_SET = new Set(SCRIPT_FILES);
function isDeprecated(file) {
  return read(file)
    .split("\n")
    .some((l) => l.trim().startsWith("# governance: deprecated"));
}
function deadDocPaths() {

exec
/bin/bash -lc 'rg -n "MELLEM|KOSMETISK|OPGRADERING|FULDSTYRKE|Runde-trapper|Exit-koder|parse" docs/coordination/gov-docs-renhed-plan.md scripts/codex-review.sh docs/strategi/disciplin.md' in /home/mathias/stork-2.0
 succeeded in 0ms:
scripts/codex-review.sh:7:#   scripts/codex-review.sh --parse-test
scripts/codex-review.sh:12:# --parse-test: kør canned fixtures gennem marker-parseren og assertér exit-routing.
scripts/codex-review.sh:18:# Stdout: echoes outputtet samt parser markers per V5 §5/§6.1
scripts/codex-review.sh:20:# Exit-koder:
scripts/codex-review.sh:37:parse_markers() {
scripts/codex-review.sh:99:  # Exit-koder per routing-tabel (uændret prioritet):
scripts/codex-review.sh:109:# --parse-test: canned fixtures gennem parseren, assertér routing
scripts/codex-review.sh:113:if [ "${1:-}" = "--parse-test" ]; then
scripts/codex-review.sh:127:  TMP="$(mktemp -t parse-test.XXXXXX)"
scripts/codex-review.sh:134:    parse_markers "$TMP" 2>/dev/null
scripts/codex-review.sh:145:    echo "parse-test FEJLEDE" >&2
scripts/codex-review.sh:148:  echo "parse-test: alle fixtures passed"
scripts/codex-review.sh:159:       $0 --parse-test
scripts/codex-review.sh:166:V5 marker-routing: scriptet parser output for halt-markers + severity-prefixes + positive markers (disciplin §5/§6.1).
scripts/codex-review.sh:167:Exit-koder:
scripts/codex-review.sh:200:REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
scripts/codex-review.sh:234:PLAN_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo 'uncommitted')"
scripts/codex-review.sh:352:parse_markers "$RAW_OUTPUT"
docs/strategi/disciplin.md:150:| **MELLEM**                           | Stopper i runde 1. G-nummer i runde 2+                                                                                                           |
docs/strategi/disciplin.md:151:| **KOSMETISK**                        | Stopper IKKE. G-nummer-kandidat                                                                                                                  |
docs/strategi/disciplin.md:152:| **OPGRADERING**                      | Stopper IKKE. Code afviser eller implementerer eksplicit i V<n+1>. Codex må give APPROVAL + OPGRADERING samtidig                                 |
docs/strategi/disciplin.md:154:| **FULDSTYRKE-MANGEL**                | Kun Mathias-rejst. AI scrapper output, gentager samme V-nummer                                                                                   |
docs/strategi/disciplin.md:156:Hver severity bærer funktion — de kollapses ikke. (MANGLENDE-EKSISTERENDE-BEVARELSE binder patch-først; OPGRADERING muliggør approval+forslag samtidig.)
docs/strategi/disciplin.md:158:**Runde-trapper:** runde 1 alle fund vurderes · runde 2 kun KRITISK stopper, MELLEM → G-numre · runde 3 kun KRITISK, resten → G-numre · runde 4+ se §3.4.
docs/strategi/disciplin.md:254:**MÅ:** flage alt tvivlsomt på kode-niveau · foreslå OPGRADERING · bestride "kompromis" som mulig drift.
docs/strategi/disciplin.md:256:**Plan-review-fokus (dækker den gamle fire-dok-konsultations substans):** patch-først korrekt? · end-to-end-spor alle 5? · DB-state-dump matcher faktisk state? · krav-dok-konsistens uden scope-creep? · vision + forretningsforstaaelse-modsigelse? **Approval:** APPROVAL eller FEEDBACK (undtagelse: APPROVAL + OPGRADERING). Kun Codex-approval kræves for plan.
docs/coordination/gov-docs-renhed-plan.md:20:| 3   | Repo-state-dump matcher ikke faktisk state                                      | MELLEM   | **ACCEPT.** Dump erstattet med pr.-tree-verificerede tal (git archive + scanner-kørsel pr. hash, se nedenfor)                                                                                                                     |
docs/coordination/gov-docs-renhed-plan.md:21:| 4   | Kæde-tjek/selftest dækker ikke fase:rapport + krydspegning                      | MELLEM   | **ACCEPT.** Check udvidet med plan→krav-dok-krydspeg + rapport-eksistens/Formål ved fase:rapport; 3 nye selftest-cases (i alt 7 nye)                                                                                              |
docs/coordination/gov-docs-renhed-plan.md:22:| 5   | §10.4 bliver stale kanonisk prompt                                              | MELLEM   | **ACCEPT.** §10.4 patches med i batch 2 (appendix A.7)                                                                                                                                                                            |
docs/coordination/gov-docs-renhed-plan.md:29:| R2-1 | Parser matcher ikke `[KRITISK]`-bracketformat fra det nye §10.4-prompt — stopfund kan give exit 0       | KRITISK  | **ACCEPT.** Alle marker-greps gøres bracket-tolerante + ny `--parse-test`-selvtest i scriptet (appendix B.1, fund R2-1-blok)                                                                                                                              |
docs/coordination/gov-docs-renhed-plan.md:30:| R2-2 | State-dump stale pr. V2-commit (28e0010 = 22 docs, tabel siger 21)                                      | MELLEM   | **ACCEPT** (rettet nu frem for G-nummer — billigere end gælden). Dump omdefineret: baseline (main) er det autoritative måle-punkt planen patcher mod; branch-tallet drifter pr. plan-commit by construction og re-verificeres i build batch 3, ikke pr. V |
docs/coordination/gov-docs-renhed-plan.md:31:| R2-3 | Kæde-tjek: ingen status-krydspeg; fase:rapport fejler ikke når rapport mangler Formål-blok              | MELLEM   | **ACCEPT** (rettet nu). B.3: rapport uden Formål-blok = violation; plan→status-sti-krydspeg + status→pakkenavn-krydspeg; B.4: +2 cases (i alt 9)                                                                                                          |
docs/coordination/gov-docs-renhed-plan.md:32:| R2-4 | Master-plan kalder stadig forretningsforståelse "tanke-data" + vision-vinder-hierarki (§8.1-MODSIGELSE) | MELLEM   | **ACCEPT** (rettet nu). Ny A.14 patcher master-planens hierarki-afsnit. §8-rationale: master-plan er RETNINGSGIVENDE — Mathias har allerede afgjort løftet i krav-dok, så master-plan tilrettes (præcis som master-planen selv foreskriver)               |
docs/coordination/gov-docs-renhed-plan.md:39:| R3-2 | parse-test mangler routing-dækning for WORKAROUND/ESCALATE/halt-marker                               | G-NUMMER-KANDIDAT | **ADOPT** (rettet nu frem for G-nummer). +3 fixtures i B.1 — alle fem exit-koder 0/1/2/3/4 beviste                                                     |
docs/coordination/gov-docs-renhed-plan.md:175:`codex-review.sh --parse-test` (appendix B.1, fund R2-1) som batch 1-evidens.
docs/coordination/gov-docs-renhed-plan.md:482:Max $MAX_WORDS ord output. Brug marker-format fra niveau 1-prefix (KRITISK/MELLEM/LAV/HUL/OPTIMERING-FORSLAG/G-NUMMER-KANDIDAT etc.). Hvis du ikke har fund: skriv "APPROVAL — Runde $ROUND_N".
docs/coordination/gov-docs-renhed-plan.md:554:er `[SEVERITY] Kort beskrivelse`, men parseren matcher kun nøgne prefixes — et
docs/coordination/gov-docs-renhed-plan.md:574:**Ny `--parse-test`-mode (bevis for R2-1-fixet):** marker-parsing + exit-routing
docs/coordination/gov-docs-renhed-plan.md:575:refaktoreres til funktionen `parse_markers <fil>` (samme logik, samme output);
docs/coordination/gov-docs-renhed-plan.md:576:`scripts/codex-review.sh --parse-test` kører canned fixtures gennem den og
docs/coordination/gov-docs-renhed-plan.md:606:(R2-1-tabellen ovenfor) + flytning ind i `parse_markers`-funktion ·
docs/coordination/gov-docs-renhed-plan.md:668:**Scanner-præcisions-fix (Code-fund under V2-skrivning, OPGRADERING):**

codex
Jeg fandt én reel kant i `codex-review.sh`: parseren er nu god til KRITISK/NEEDS/WORKAROUND, men den modellerer stadig ikke §5’s runde-1-regel for MELLEM. Jeg tjekker om planen bevidst afgrænsede det, eller om det er et bevarelsestab i den reparerede V5-wrapper.
exec
/bin/bash -lc "git show origin/main:scripts/codex-review.sh | sed -n '1,320p'" in /home/mathias/stork-2.0
 succeeded in 0ms:
#!/usr/bin/env bash
# scripts/codex-review.sh
# Wrapper for Codex CLI review-runder (V5.3 marker-protocol).
#
# Brug:
#   scripts/codex-review.sh <plan-fil> <runde-N> [--xhigh|--quick] [--phase=plan|build|slut-rapport]
#
# Defaults: xhigh + fast_mode + timeout 480s + file-reference prompt + tail-monitor.
# --quick: medium reasoning + timeout 120s + max 150 ord output (til intermediate batch-tjek).
# --xhigh: explicit (default — flag for klarhed når der er valg).
#
# Output: docs/coordination/codex-reviews/<dato>-<pakke>-runde-<N>.md
#         (med header om command + plan-SHA + raw codex-output)
# Stdout: echoes outputtet samt parser markers per V5.3 marker-protokol

set -euo pipefail

# ============================================================
# Argument-parsing
# ============================================================

if [ $# -lt 2 ]; then
  cat <<EOF
Usage: $0 <plan-fil> <runde-N> [--xhigh|--quick] [--phase=plan|build|slut-rapport]

Eksempel:
  $0 docs/coordination/<pakke>-plan.md 1
  $0 docs/coordination/<pakke>-plan.md 2 --quick
  $0 docs/coordination/rapport-historik/<dato>-<pakke>.md 1 --phase=slut-rapport

V5.3 marker-protokol: scriptet parser output for halt-markers + severity-prefixes + log-markers + positive markers.
Exit-koder:
  0  = clean eller G-NUMMER-KANDIDAT (fortsæt)
  1  = STOP-FOR-CLARIFICATION (info-mangel)
  2  = halt-marker (BRUD-PAA-KRAV / TEKNISK-BLOKERING / PLAN-AFVIGELSE / KRITISK-SIKKERHEDSHUL)
       ELLER severity-prefix (^KRITISK\b — stopper plan i alle runder per overvaagning)
  3  = WORKAROUND-INTRODUCERET (Mathias-gate)
  4  = ESCALATE / AUTO-ESKALATION / NEEDS-MATHIAS (Mathias-judgment kræves før V<n+1>)
  124 = codex timeout
EOF
  exit 64
fi

PLAN_FILE="$1"
ROUND_N="$2"
shift 2

REASONING="xhigh"
TIMEOUT_SEC="${CODEX_TIMEOUT:-480}"
PHASE="plan"
MAX_WORDS="350"

while [ $# -gt 0 ]; do
  case "$1" in
    --xhigh) REASONING="xhigh"; shift ;;
    --quick) REASONING="medium"; TIMEOUT_SEC="${CODEX_QUICK_TIMEOUT:-120}"; MAX_WORDS="150"; shift ;;
    --phase=*) PHASE="${1#--phase=}"; shift ;;
    *) echo "Ukendt flag: $1" >&2; exit 64 ;;
  esac
done

# ============================================================
# Pre-flight verifikation
# ============================================================

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$REPO_ROOT" ]; then
  echo "❌ scripts/codex-review.sh skal køres inde i et git-repo." >&2
  exit 64
fi
cd "$REPO_ROOT"

if [ ! -f "$PLAN_FILE" ]; then
  echo "❌ Plan-fil findes ikke: $PLAN_FILE" >&2
  exit 64
fi

PREFIX_FILE="docs/skabeloner/codex-review-prompt.md"
if [ ! -f "$PREFIX_FILE" ]; then
  echo "❌ Niveau 1-prefix-fil findes ikke: $PREFIX_FILE" >&2
  exit 64
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "❌ codex CLI ikke fundet i PATH. Kør 'codex doctor' for diagnose." >&2
  exit 64
fi

# ============================================================
# Build prompt — file-reference > embedded content
# (V5.3 workflow-skabelon tooling-disciplin #3)
# ============================================================

PAKKE_NAME="$(basename "$PLAN_FILE" | sed -E 's/-plan\.md$//; s/\.md$//; s/^[0-9]{4}-[0-9]{2}-[0-9]{2}-//')"
DATE="$(date +%Y-%m-%d)"

case "$PHASE" in
  plan)         OUTPUT_DIR="docs/coordination/codex-reviews" ;;
  build)        OUTPUT_DIR="docs/coordination/codex-reviews" ;;
  slut-rapport) OUTPUT_DIR="docs/coordination/codex-reviews" ;;
  *) echo "❌ Ukendt --phase: $PHASE (forventet: plan|build|slut-rapport)" >&2; exit 64 ;;
esac

mkdir -p "$OUTPUT_DIR"
OUTPUT_FILE="${OUTPUT_DIR}/${DATE}-${PAKKE_NAME}-runde-${ROUND_N}.md"

PLAN_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo 'uncommitted')"

case "$PHASE" in
  plan|build)
    FORMAAL_LINE='FORMÅL: udledes af "## Formål"-sektionen i '"$PLAN_FILE"'.'
    ;;
  slut-rapport)
    FORMAAL_LINE='FORMÅL (slut-rapport-fase): Verificér at slut-rapporten reflekterer faktisk leverance, plan-afvigelser ærligt, og fire-dokument-tjek korrekt. Underliggende pakke-formål kan slås op i rapport-headerens "Plan-fil"-felt hvis nødvendigt.'
    ;;
esac

PROMPT=$(cat <<EOF
Læs disse filer:
1. $PREFIX_FILE (niveau 1-prefix — anvend ordret)
2. $PLAN_FILE ($PHASE-fasen for pakke $PAKKE_NAME)

RUNDE-NUMMER: $ROUND_N
FASE: $PHASE
$FORMAAL_LINE

Følg niveau 1-prefixens scope-krav + marker-protokol + dialog-regler.

Max $MAX_WORDS ord output. Brug marker-format fra niveau 1-prefix (KRITISK/MELLEM/LAV/HUL/OPTIMERING-FORSLAG/G-NUMMER-KANDIDAT etc.). Hvis du ikke har fund: skriv "APPROVAL — Runde $ROUND_N".
EOF
)

# ============================================================
# Eksekvér med hard timeout + non-json (live tail-friendly)
# ============================================================

RAW_OUTPUT="$(mktemp -t codex-review-raw.XXXXXX)"
trap 'rm -f "$RAW_OUTPUT"' EXIT

echo "▶ codex review (runde $ROUND_N, reasoning=$REASONING, timeout=${TIMEOUT_SEC}s)" >&2
echo "  Plan: $PLAN_FILE" >&2
echo "  Output: $OUTPUT_FILE" >&2
echo "" >&2

set +e
timeout --signal=KILL "$TIMEOUT_SEC" codex exec --skip-git-repo-check \
  -c "model_reasoning_effort=\"$REASONING\"" \
  --enable fast_mode \
  "$PROMPT" > "$RAW_OUTPUT" 2>&1
CODEX_EXIT=$?
set -e

if [ $CODEX_EXIT -eq 124 ] || [ $CODEX_EXIT -eq 137 ]; then
  echo "❌ codex timed out efter ${TIMEOUT_SEC}s." >&2
  echo "  Sidste output gemt i $RAW_OUTPUT (kopier til $OUTPUT_FILE manuelt hvis nyttig)." >&2
  cp "$RAW_OUTPUT" "$OUTPUT_FILE"
  exit 124
fi

if [ $CODEX_EXIT -ne 0 ]; then
  echo "❌ codex fejlede (exit $CODEX_EXIT)." >&2
  echo "  Output:" >&2
  tail -10 "$RAW_OUTPUT" >&2
  exit $CODEX_EXIT
fi

# ============================================================
# Skriv output-fil med header
# ============================================================

case "$REASONING" in
  xhigh)  REASONING_FLAG="--xhigh" ;;
  medium) REASONING_FLAG="--quick" ;;
  *)      REASONING_FLAG="" ;;
esac
RERUN_CMD="$0 $PLAN_FILE $ROUND_N $REASONING_FLAG --phase=$PHASE"

cat > "$OUTPUT_FILE" <<EOF
# Codex review — $PAKKE_NAME runde $ROUND_N

**Pakke:** $PAKKE_NAME
**Fase:** $PHASE
**Plan-fil:** $PLAN_FILE
**Plan-SHA:** $PLAN_SHA
**Dato:** $DATE
**Reasoning:** $REASONING
**Max ord:** $MAX_WORDS
**Command:** \`$RERUN_CMD\` (re-run via samme args inkl. flags)

---

EOF
cat "$RAW_OUTPUT" >> "$OUTPUT_FILE"

# ============================================================
# Marker-parsing (V5.3 marker-protokol)
# ============================================================

echo "" >&2
echo "▶ Marker-parsing:" >&2

HALT_HIT=0
SEVERITY_HIT=0
WORKAROUND_HIT=0
CLARIFICATION_HIT=0
ESCALATE_HIT=0
NEEDS_MATHIAS_HIT=0

if grep -qE '^(STOP-FOR-CLARIFICATION):' "$RAW_OUTPUT"; then
  CLARIFICATION_HIT=1
  echo "  ⏸  STOP-FOR-CLARIFICATION rejst — info-mangel" >&2
fi

if grep -qE '^(BRUD-PAA-KRAV|TEKNISK-BLOKERING|PLAN-AFVIGELSE|KRITISK-SIKKERHEDSHUL):' "$RAW_OUTPUT"; then
  HALT_HIT=1
  echo "  🛑 Halt-marker rejst — kræver LØS-dialog eller eskalation" >&2
fi

# Severity-prefix detection (NY 2026-05-20 — G055-fix)
# KRITISK uden halt-marker er stadig blocker per overvaagning-disciplin
# ("KRITISK — STOPPER plan i alle runder"). Halt-markeren kan være
# eksplicit ("KRITISK — PLAN-AFVIGELSE:") eller alene ("KRITISK: <fund>").
# Matcher ord-grænse efter KRITISK så "KRITISKE" ikke triggers false positive.
if grep -qE '^KRITISK\b' "$RAW_OUTPUT"; then
  SEVERITY_HIT=1
  echo "  🛑 KRITISK-severity rejst — stopper plan i alle runder" >&2
fi

# NEEDS-MATHIAS — stopper plan og kræver Mathias-afgørelse før V<n+1>
if grep -qE '^(\[NEEDS-MATHIAS\]|NEEDS-MATHIAS)\b' "$RAW_OUTPUT"; then
  NEEDS_MATHIAS_HIT=1
  echo "  🚦 NEEDS-MATHIAS rejst — Code må ikke lave V<n+1> før Mathias har afgjort" >&2
fi

if grep -qE '^(WORKAROUND-INTRODUCERET):' "$RAW_OUTPUT"; then
  WORKAROUND_HIT=1
  echo "  ⚠️  WORKAROUND-INTRODUCERET — Mathias-gate kræves" >&2
fi

if grep -qE '^(ESCALATE|AUTO-ESKALATION):' "$RAW_OUTPUT"; then
  ESCALATE_HIT=1
  echo "  🚨 ESCALATE/AUTO-ESKALATION — Mathias-judgment via gate-fil" >&2
fi

if grep -qE '^(OPTIMERING-FORSLAG):' "$RAW_OUTPUT"; then
  echo "  💡 OPTIMERING-FORSLAG fundet — Code's valg (ADOPT/DEFER/DISMISS)" >&2
fi

if grep -qE '^(SPARRING-OENSKE):' "$RAW_OUTPUT"; then
  echo "  💬 SPARRING-OENSKE fundet" >&2
fi

if grep -qE '^(G-NUMMER-KANDIDAT):' "$RAW_OUTPUT"; then
  echo "  📝 G-NUMMER-KANDIDAT(er) — log til teknisk-gaeld.md (fortsæt)" >&2
fi

if grep -qE '^APPROVAL\b' "$RAW_OUTPUT"; then
  echo "  ✅ APPROVAL" >&2
fi

# ============================================================
# Echo output + exit per marker-priority
# ============================================================

echo "" >&2
echo "▶ Output:" >&2
cat "$RAW_OUTPUT"

# Exit-koder per V5.3 routing-tabel:
if [ "$CLARIFICATION_HIT" -eq 1 ]; then
  exit 1
fi
if [ "$WORKAROUND_HIT" -eq 1 ]; then
  exit 3
fi
if [ "$ESCALATE_HIT" -eq 1 ]; then
  exit 4
fi
if [ "$NEEDS_MATHIAS_HIT" -eq 1 ]; then
  exit 4
fi
if [ "$HALT_HIT" -eq 1 ] || [ "$SEVERITY_HIT" -eq 1 ]; then
  exit 2
fi

exit 0

exec
/bin/bash -lc "git show origin/main:docs/strategi/disciplin.md | sed -n '130,175p'" in /home/mathias/stork-2.0
 succeeded in 0ms:
---

## §4 Bevarelses-disciplin — hvad gemmes, hvad slettes

**Princip:** kun krav-dok + godkendt plan (slut-version) + slut-rapport overlever pakken. Resten lever i git-history.

**Bevares på main:** krav-dok → `arkiv/<pakke>-krav-og-data.md` · plan → `arkiv/<pakke>-plan.md` · slut-rapport → `rapport-historik/<dato>-<pakke>.md` · in-place-opdateringer til vision, forretningsforstaaelse, master-plan (overblik), teknisk-gaeld.

**Slettes ved pakke-luk:** `<pakke>-status.md` · alle `plan-feedback/<pakke>-V<n>-*` · alle `codex-reviews/<pakke>-runde-*` · afgjorte `mathias-gate/<pakke>-*` · plan-versioner V1..Vn (git-history bevarer sporet).

**Én bevarings-politik.** Arkivet er ikke en voksende kirkegård; iterations-, recon- og review-filer lever i git-history, ikke som filer på main.

---

## §5 Severities + FLAG/LØS-dialog

| Severity                             | Konsekvens                                                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **KRITISK**                          | Stopper plan/build i alle runder. Code SKAL adressere næste runde                                                                                |
| **MANGLENDE-EKSISTERENDE-BEVARELSE** | KRITISK-undertype: mister gate/kommentar/kolonne fra eksisterende body uden begrundelse                                                          |
| **MELLEM**                           | Stopper i runde 1. G-nummer i runde 2+                                                                                                           |
| **KOSMETISK**                        | Stopper IKKE. G-nummer-kandidat                                                                                                                  |
| **OPGRADERING**                      | Stopper IKKE. Code afviser eller implementerer eksplicit i V<n+1>. Codex må give APPROVAL + OPGRADERING samtidig                                 |
| **NEEDS-MATHIAS**                    | Stopper i alle runder. Code kan ikke lave V<n+1> før Mathias afgør. Reviewer skriver eksplicit spørgsmål. Max 2 pr. review — flugtvej hvis flere |
| **FULDSTYRKE-MANGEL**                | Kun Mathias-rejst. AI scrapper output, gentager samme V-nummer                                                                                   |

Hver severity bærer funktion — de kollapses ikke. (MANGLENDE-EKSISTERENDE-BEVARELSE binder patch-først; OPGRADERING muliggør approval+forslag samtidig.)

**Runde-trapper:** runde 1 alle fund vurderes · runde 2 kun KRITISK stopper, MELLEM → G-numre · runde 3 kun KRITISK, resten → G-numre · runde 4+ se §3.4.

**FLAG → LØS (Code's svar pr. Codex-fund):** ACCEPT / PUSHBACK (argumentér; Codex: AGREE/REFINE) / PROPOSE-ALTERNATIVE. Max 3 LØS-iterationer pr. fund; > 3 → auto-eskalation via `mathias-gate/`.

**Positive markers:** OPTIMERING-FORSLAG (Codex) → Code: ADOPT/DEFER/DISMISS · SPARRING-OENSKE (Code) → Codex: CONFIRM/TIMING/AVOID.

---

## §6 Build-markers + automation

### 6.1 Halt-markers

`BRUD-PAA-KRAV` → Step 1 · `TEKNISK-BLOKERING` → Step 2 / Mathias · `PLAN-AFVIGELSE` → Step 2 / Mathias · `KRITISK-SIKKERHEDSHUL` → fix samme batch / Mathias · `WORKAROUND-INTRODUCERET` → mathias-gate · `STOP-FOR-CLARIFICATION` → gate-fil.

### 6.2 Automation (Codes bord — tilstand: notify-only)

`codex-notify.yml` poster tracker-comments på push til aktiv-plan/seneste-rapport/build-branch og på slut-rapport-PR. **Den kører ikke Codex, og der er ingen auto-merge.** Mål-tilstand (skal bygges, Codes bord): plan-branch-trigger (H020), Codex-runner, auto-merge ved grøn CI + godkendelse. `migrations-deploy.yml` deployer til live + regenererer types ved push til migrations — verificér mod Codes kortlægning før den antages aktiv.


exec
/bin/bash -lc 'rg -n "MELLEM|Runde-trapper|Exit-koder|exit 0|marker-routing|marker-protokol|V5 §5" docs/coordination/gov-docs-renhed-krav-og-data.md docs/coordination/gov-docs-renhed-plan.md scripts/codex-review.sh docs/strategi/disciplin.md' in /home/mathias/stork-2.0
 succeeded in 0ms:
docs/strategi/disciplin.md:150:| **MELLEM**                           | Stopper i runde 1. G-nummer i runde 2+                                                                                                           |
docs/strategi/disciplin.md:158:**Runde-trapper:** runde 1 alle fund vurderes · runde 2 kun KRITISK stopper, MELLEM → G-numre · runde 3 kun KRITISK, resten → G-numre · runde 4+ se §3.4.
scripts/codex-review.sh:18:# Stdout: echoes outputtet samt parser markers per V5 §5/§6.1
scripts/codex-review.sh:20:# Exit-koder:
scripts/codex-review.sh:32:# Marker-parsing (V5 §5 severities + §6.1 halt-markers)
scripts/codex-review.sh:99:  # Exit-koder per routing-tabel (uændret prioritet):
scripts/codex-review.sh:149:  exit 0
scripts/codex-review.sh:166:V5 marker-routing: scriptet parser output for halt-markers + severity-prefixes + positive markers (disciplin §5/§6.1).
scripts/codex-review.sh:167:Exit-koder:
docs/coordination/gov-docs-renhed-plan.md:20:| 3   | Repo-state-dump matcher ikke faktisk state                                      | MELLEM   | **ACCEPT.** Dump erstattet med pr.-tree-verificerede tal (git archive + scanner-kørsel pr. hash, se nedenfor)                                                                                                                     |
docs/coordination/gov-docs-renhed-plan.md:21:| 4   | Kæde-tjek/selftest dækker ikke fase:rapport + krydspegning                      | MELLEM   | **ACCEPT.** Check udvidet med plan→krav-dok-krydspeg + rapport-eksistens/Formål ved fase:rapport; 3 nye selftest-cases (i alt 7 nye)                                                                                              |
docs/coordination/gov-docs-renhed-plan.md:22:| 5   | §10.4 bliver stale kanonisk prompt                                              | MELLEM   | **ACCEPT.** §10.4 patches med i batch 2 (appendix A.7)                                                                                                                                                                            |
docs/coordination/gov-docs-renhed-plan.md:29:| R2-1 | Parser matcher ikke `[KRITISK]`-bracketformat fra det nye §10.4-prompt — stopfund kan give exit 0       | KRITISK  | **ACCEPT.** Alle marker-greps gøres bracket-tolerante + ny `--parse-test`-selvtest i scriptet (appendix B.1, fund R2-1-blok)                                                                                                                              |
docs/coordination/gov-docs-renhed-plan.md:30:| R2-2 | State-dump stale pr. V2-commit (28e0010 = 22 docs, tabel siger 21)                                      | MELLEM   | **ACCEPT** (rettet nu frem for G-nummer — billigere end gælden). Dump omdefineret: baseline (main) er det autoritative måle-punkt planen patcher mod; branch-tallet drifter pr. plan-commit by construction og re-verificeres i build batch 3, ikke pr. V |
docs/coordination/gov-docs-renhed-plan.md:31:| R2-3 | Kæde-tjek: ingen status-krydspeg; fase:rapport fejler ikke når rapport mangler Formål-blok              | MELLEM   | **ACCEPT** (rettet nu). B.3: rapport uden Formål-blok = violation; plan→status-sti-krydspeg + status→pakkenavn-krydspeg; B.4: +2 cases (i alt 9)                                                                                                          |
docs/coordination/gov-docs-renhed-plan.md:32:| R2-4 | Master-plan kalder stadig forretningsforståelse "tanke-data" + vision-vinder-hierarki (§8.1-MODSIGELSE) | MELLEM   | **ACCEPT** (rettet nu). Ny A.14 patcher master-planens hierarki-afsnit. §8-rationale: master-plan er RETNINGSGIVENDE — Mathias har allerede afgjort løftet i krav-dok, så master-plan tilrettes (præcis som master-planen selv foreskriver)               |
docs/coordination/gov-docs-renhed-plan.md:480:Følg niveau 1-prefixens scope-krav + marker-protokol + dialog-regler.
docs/coordination/gov-docs-renhed-plan.md:482:Max $MAX_WORDS ord output. Brug marker-format fra niveau 1-prefix (KRITISK/MELLEM/LAV/HUL/OPTIMERING-FORSLAG/G-NUMMER-KANDIDAT etc.). Hvis du ikke har fund: skriv "APPROVAL — Runde $ROUND_N".
docs/coordination/gov-docs-renhed-plan.md:555:`[KRITISK]`-fund ville give exit 0. Hver marker-grep ændres fra nøgent mønster
docs/coordination/gov-docs-renhed-plan.md:834:    ? ok("script-dead-path-deprecated -> exit 0")

exec
/bin/bash -lc 'tmp=$(mktemp); printf '"'[MELLEM] test\\n' > \""'$tmp"; bash -c '"'source scripts/codex-review.sh --parse-test >/dev/null 2>&1' 2>/dev/null; rm -f \""'$tmp"' in /home/mathias/stork-2.0
 succeeded in 137ms:
codex
Der er også et CI-relevant spørgsmål: review-filerne med rå output har trailing whitespace, og CI kører Prettier på hele repoet. Jeg kører format-check, fordi et faktisk CI-brud er mere end kosmetik.
exec
/bin/bash -lc 'pnpm format:check' in /home/mathias/stork-2.0
exec
/bin/bash -lc 'pnpm lint' in /home/mathias/stork-2.0
exec
/bin/bash -lc 'pnpm typecheck' in /home/mathias/stork-2.0
 succeeded in 447ms:

> stork-2.0@0.0.0 lint /home/mathias/stork-2.0
> turbo run lint

• turbo 2.9.12

   • Packages in scope: @stork/core, @stork/eslint-config, @stork/types, @stork/utils, @stork/web
   • Running lint in 5 packages
   • Remote caching disabled

@stork/web:lint: cache hit, replaying logs 09e7a0d0ebd62113
@stork/web:lint: 
@stork/web:lint: > @stork/web@0.0.0 lint /home/mathias/stork-2.0/apps/web
@stork/web:lint: > eslint .
@stork/web:lint: 

 Tasks:    1 successful, 1 total
Cached:    1 cached, 1 total
  Time:    59ms >>> FULL TURBO


 succeeded in 1363ms:

> stork-2.0@0.0.0 typecheck /home/mathias/stork-2.0
> turbo run typecheck

• turbo 2.9.12

   • Packages in scope: @stork/core, @stork/eslint-config, @stork/types, @stork/utils, @stork/web
   • Running typecheck in 5 packages
   • Remote caching disabled

@stork/types:typecheck: cache miss, executing 5203d3678fbd427e
@stork/web:typecheck: cache hit, replaying logs a0d80a74b032d7b9
@stork/web:typecheck: 
@stork/web:typecheck: > @stork/web@0.0.0 typecheck /home/mathias/stork-2.0/apps/web
@stork/web:typecheck: > tsc --noEmit -p tsconfig.app.json && tsc --noEmit -p tsconfig.node.json
@stork/web:typecheck: 
@stork/types:typecheck: 
@stork/types:typecheck: > @stork/types@0.0.0 typecheck /home/mathias/stork-2.0/packages/types
@stork/types:typecheck: > tsc --noEmit
@stork/types:typecheck: 

 Tasks:    2 successful, 2 total
Cached:    1 cached, 2 total
  Time:    987ms 


 exited 1 in 5003ms:

> stork-2.0@0.0.0 format:check /home/mathias/stork-2.0
> prettier --check .

Checking formatting...
[warn] scripts/governance-check.mjs
[warn] scripts/governance-check.selftest.mjs
[warn] Code style issues found in 2 files. Run Prettier with --write to fix.
 ELIFECYCLE  Command failed with exit code 1.

codex
`pnpm format:check` fejler på de to ændrede governance-scripts, som er en required CI-step. Jeg samler nu kun den konkrete blokker og undgår at blande ikke-blokerende whitespace i rå review-output ind, fordi CI-fejlen alene er nok til runde 6 feedback.
exec
/bin/bash -lc 'pnpm fitness' in /home/mathias/stork-2.0
exec
/bin/bash -lc 'pnpm fitness:selftest' in /home/mathias/stork-2.0
exec
/bin/bash -lc 'pnpm test' in /home/mathias/stork-2.0
exec
/bin/bash -lc 'pnpm exec prettier --check scripts/governance-check.mjs scripts/governance-check.selftest.mjs' in /home/mathias/stork-2.0
exec
/bin/bash -lc "pnpm exec prettier scripts/governance-check.mjs | diff -u scripts/governance-check.mjs - | sed -n '1,220p'" in /home/mathias/stork-2.0
exec
/bin/bash -lc "pnpm exec prettier scripts/governance-check.selftest.mjs | diff -u scripts/governance-check.selftest.mjs - | sed -n '1,220p'" in /home/mathias/stork-2.0
 succeeded in 474ms:

> stork-2.0@0.0.0 test /home/mathias/stork-2.0
> turbo run test

• turbo 2.9.12

   • Packages in scope: @stork/core, @stork/eslint-config, @stork/types, @stork/utils, @stork/web
   • Running test in 5 packages
   • Remote caching disabled

@stork/web:test: cache hit, replaying logs af209448f52f8b45
@stork/web:test: 
@stork/web:test: > @stork/web@0.0.0 test /home/mathias/stork-2.0/apps/web
@stork/web:test: > vitest run
@stork/web:test: 
@stork/web:test: 
@stork/web:test:  RUN  v3.2.4 /home/mathias/stork-2.0/apps/web
@stork/web:test: 
@stork/web:test:  ✓ src/test/example.test.ts (1 test) 6ms
@stork/web:test: 
@stork/web:test:  Test Files  1 passed (1)
@stork/web:test:       Tests  1 passed (1)
@stork/web:test:    Start at  17:35:25
@stork/web:test:    Duration  3.05s (transform 143ms, setup 312ms, collect 24ms, tests 6ms, environment 1.38s, prepare 907ms)
@stork/web:test: 

 Tasks:    1 successful, 1 total
Cached:    1 cached, 1 total
  Time:    62ms >>> FULL TURBO


 exited 1 in 577ms:
Checking formatting...
[warn] scripts/governance-check.mjs
[warn] scripts/governance-check.selftest.mjs
[warn] Code style issues found in 2 files. Run Prettier with --write to fix.

 succeeded in 595ms:
--- scripts/governance-check.mjs	2026-06-10 14:37:12.315861866 +0200
+++ -	2026-06-10 14:41:29.628069792 +0200
@@ -72,7 +72,8 @@
   {
     path: "docs/skabeloner/rapport-skabelon.md",
     klasse: "historisk-provenance",
-    grund: "V4-slettet (inline i disciplin §10.3); refereres som provenance i gov-docs-renhed-plan A.12 — prune ved pakke-luk (gov-6)",
+    grund:
+      "V4-slettet (inline i disciplin §10.3); refereres som provenance i gov-docs-renhed-plan A.12 — prune ved pakke-luk (gov-6)",
   },
   {
     path: "docs/skabeloner/codex-review-prompt.md",

 succeeded in 550ms:
--- scripts/governance-check.selftest.mjs	2026-06-10 14:29:51.809520717 +0200
+++ -	2026-06-10 14:41:29.842638453 +0200
@@ -131,7 +131,9 @@
 {
   const d = fixture();
   appendFileSync(join(d, "scripts/types-gen.sh"), "\n# governance: deprecated\ncat docs/skabeloner/plan-skabelon.md\n");
-  run(d) === 0 ? ok("script-dead-path-deprecated -> exit 0") : bad("script-dead-path-deprecated", "deprecated script burde gå grøn");
+  run(d) === 0
+    ? ok("script-dead-path-deprecated -> exit 0")
+    : bad("script-dead-path-deprecated", "deprecated script burde gå grøn");
   rmSync(d, { recursive: true, force: true });
 }
 

 succeeded in 5041ms:

> stork-2.0@0.0.0 fitness:selftest /home/mathias/stork-2.0
> node scripts/fitness.selftest.mjs

  ✓ baseline (static checks) -> exit 0
  ✓ fail-closed: live-check uden token i CI -> violation
  ✓ #4 update-only trigger -> fanges (delete ikke dækket)
  ✓ #4 delete-only trigger -> fanges (update ikke dækket)
  ✓ #4 drop-after-create -> fanges (trigger final-state)
  ✓ #4 guard delete-only m. set_updated_at intakt -> fanges (ikke union)
  ✓ #7 guard mangler mutable-flag -> fanges
  ✓ #7 guard undtager ekstra felt -> fanges
  ✓ #4 same-file drop+recreate table uden trigger -> fanges
  ✓ #7 old/new-sammenligning fjernet -> fanges
  ✓ #6 session-var-gate -> ingen prædikat-kolonne
  ✓ #6 reel kolonne auth_user_id (ikke auth.uid)
  ✓ #6 Codex-negativ: act.id -> {action_id}, ikke {id}
  ✓ #6 schema-kvalificeret fremmed ref -> {action_id}, ikke {id}
  ✓ #6 eksplicit current-table-kvalificering tælles
  ✓ #6 setting-streng m. tabel-navn -> ingen falsk kolonne
  ✓ #6 non-btree leading index tæller ikke som dækning
  ✓ #19 PK -> null
  ✓ #19 hasFK -> null
  ✓ #19 exemption -> null
  ✓ #19 FK_PENDING m. target fraværende -> null
  ✓ #19 FK_PENDING selv-udløb: target findes uden FK -> violation
  ✓ #19 ukendt *_id uden FK -> violation
  ✓ #10 baseline (trigger + sanctioned) -> 0 violations
  ✓ #10 trigger uden allowlist-entry -> OK
  ✓ #10 ukendt SECDEF uden markør -> violation
  ✓ #10 stale allowlist-entry -> violation
  ✓ #18 ingen app-write -> 0 violations
  ✓ #18 authenticated INSERT på core_* -> violation
  ✓ #18 exemption -> skippes

fitness selftest: alle cases passed

 succeeded in 7512ms:

> stork-2.0@0.0.0 fitness /home/mathias/stork-2.0
> node scripts/fitness.mjs

✓ no-ts-ignore
✓ eslint-disable-justified
✓ migration-naming
✓ workspace-boundaries
✓ no-hardcoded-supabase-urls
✓ migration-set-config-discipline
✓ dedup-key-or-opt-out
✓ truncate-blocked-on-immutable
✓ cron-change-reason
✓ audit-trigger-coverage
✓ migration-on-conflict-discipline
✓ db-rls-policies
✓ write-policy-session-var-consistency
✓ legacy-is-active-readers
✓ db-test-tx-wrap-on-immutable-insert
✓ db-test-no-disabled-sql
✓ db-test-no-t9-seed-user-fixtures
✓ db-test-no-t9-skip-guards
✓ postgrest-t9-schema-exposure
✓ immutability-trigger-coverage
✓ snapshot-field-protection
✓ schema-ownership
✓ cross-schema-fk-discipline
✓ fk-coverage
✓ index-per-policy
✓ secdef-marker-discipline
✓ app-write-revoke-discipline

Fitness: all checks passed

exec
/bin/bash -lc 'tmp=$(mktemp); parsefile=$(mktemp); sed -n '"'37,106p' scripts/codex-review.sh > \""'$parsefile"; printf '"'[MELLEM] stopper i runde 1\\n' > \""'$tmp"; bash -c "source '"'"'$parsefile'"'; parse_markers '"'$tmp'"' >/dev/null 2>&1\"; code="'$?; rm -f "$tmp" "$parsefile"; echo "$code"' in /home/mathias/stork-2.0
 succeeded in 0ms:
0

codex
[KRITISK] Required CI-format fejler  
Konkret afvigelse: `pnpm format:check` fejler på `scripts/governance-check.mjs` og `scripts/governance-check.selftest.mjs`. CI kører samme check før governance-checks, så build-state er ikke faktisk grøn.  
Anbefalet handling: V7-rettelse — Prettier-formatér de to filer og rerun `pnpm format:check`.

[KRITISK] `codex-review.sh` ruter ikke `[MELLEM]` efter §5  
Konkret afvigelse: §5 siger MELLEM stopper i runde 1, men parseren returnerer exit 0 for `[MELLEM] ...`; `--parse-test` har heller ingen MELLEM-fixture. Det kollapser en severity-funktion i V5-wrapperen.  
Anbefalet handling: V7-rettelse — gør routing round-aware: MELLEM exit 2 i runde 1, ikke-blokerende/G-spor i runde 2+.

§8.1-SVAR: INGEN-MODSIGELSE
tokens used
168,134
[KRITISK] Required CI-format fejler  
Konkret afvigelse: `pnpm format:check` fejler på `scripts/governance-check.mjs` og `scripts/governance-check.selftest.mjs`. CI kører samme check før governance-checks, så build-state er ikke faktisk grøn.  
Anbefalet handling: V7-rettelse — Prettier-formatér de to filer og rerun `pnpm format:check`.

[KRITISK] `codex-review.sh` ruter ikke `[MELLEM]` efter §5  
Konkret afvigelse: §5 siger MELLEM stopper i runde 1, men parseren returnerer exit 0 for `[MELLEM] ...`; `--parse-test` har heller ingen MELLEM-fixture. Det kollapser en severity-funktion i V5-wrapperen.  
Anbefalet handling: V7-rettelse — gør routing round-aware: MELLEM exit 2 i runde 1, ikke-blokerende/G-spor i runde 2+.

§8.1-SVAR: INGEN-MODSIGELSE
