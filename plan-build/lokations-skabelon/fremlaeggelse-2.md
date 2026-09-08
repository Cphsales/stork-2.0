# lokations-skabelon — fremlæggelse 2, version 2.2 (til `krav ok`)

Dato: 2026-09-08 · kravet ligger i `docs/sandhed/krav/lokations-skabelon-krav.md` @ d5fa4be, blob `b9c5249b7ab90d8898992bde61b8cb018bc4f561` (= udkast @ 1dc4a12; uploadet automatisk efter ren audit) · Code og Codex: PASS i runde 3 mod netop denne version (krav-blob b9c5249b @ d5fa4be; verdikter @ 846a3e2, læsebevis verificeret mod rå git) · listen over dine ord (ledgeren): M-1..M-34 @ 17c69a3.

Her er hele kravet i dit sprog. Til sidst står to afledninger af dine ord, som du kan sige stop til. Dit ene ord bagefter er `krav ok`.

**Hvad pakken leverer.** Ét fast register over jeres lokationer, som alt andet bygger på: grupperne der ejer dem, standene i dem, hvilke klienter der må stå hvor, om lokationen er aktiv, i dvale eller nedlagt, og hvile efter en kampagne. Alt styres i UI, og alle ændringer logges, så man altid kan se hvem der gjorde hvad hvornår. Bookinger, hoteller, biler og afregning med butikkerne kommer i senere trin og bygger ovenpå uden at noget skal laves om.

**Ændret siden første fremlæggelse**

- Klienter kobles på gruppen, ikke på lokationen. Gruppe ejer lokation, lokation ejer stand. Det vendte mit gamle forbud mod kæde-kobling.
- Nedlæggelse kobler alle klienter af automatisk. Standene og historikken består. Ved genåbning er gruppens klienter automatisk tilbage. Hvad der sker med de fravalg butikken havde inden nedlæggelsen, afgør vi i plan-fasen.
- Automatisk hvile kun når der er valgt et antal hviledage i UI.
- Dagsprisen: kravet siger kun, at en prisændring aldrig ændrer fortiden. Hvad prisen bruges til, afgøres i trin 24 (bookinger) og trin 29 (rabatter med butikkerne).
- Gruppens type er ikke længere et krævet felt ved oprettelse. Afgøres i plan-fasen.
- Under-stande findes ikke. Standen er bunden af kæden.
- Alle dine ord er citeret ordret med nummer fra ledgeren. Ordet "aftaler pr. lokation" er væk; kravet citerer dit ord ordret: "vi booker selv de enkelte lokationer men hver lokation har en gruppe".

**De ni krav**

1. **Lokationen.** En lokation oprettes ét sted med navn, adresse, dagspris, gruppe, type, status og hvile-indstilling. En prisændring ændrer aldrig fortiden. Umuligt: lokation uden navn, type uden for listen butik, messe, marked, event, andet, særregler for én lokations-type (messer og markeder følger samme regler som butikker), og at et salg tælles på lokationen. Et salg hører altid til klienten.
2. **Ejerkæde og stande.** Gruppe ejer lokation, lokation ejer stand. En lokation har mindst én stand og kan have flere. Standen er bunden af kæden. En stand kan have egen dagspris, ellers gælder lokationens. Der står én klient pr. stand ad gangen. Umuligt: stand uden lokation, stande under stande, to klienter på samme stand samtidig, en kæde der går i ring, stande der forsvinder ved nedlæggelse.
3. **Gruppen ejer, klienter kobles på gruppen.** Gruppen oprettes i UI med navn. Klienter kobles på gruppen og arver alle dens lokationer, også dem der kommer til senere. En lokation kan fravælge en klient gruppen har, og ophæve fravalget igen. Umuligt: lokation uden gruppe, gruppe skrevet som fri tekst på lokationen, gruppe uden navn, klient på en lokation uden at være i gruppen, sletning af en gruppe der har lokationer.
4. **Status.** Aktiv, dvale eller nedlagt. Kun aktiv kan bookes. Skift kræver en årsag og logges. Nedlagt kan genåbnes. Nedlæggelse kobler alle klienter af lokationen, standene og historikken består, gruppen og dens andre lokationer berøres ikke. Ved genåbning er gruppens klienter automatisk tilbage; hvad der sker med tidligere fravalg, afgør vi i plan-fasen. Umuligt: booking på dvale eller nedlagt, skift uden årsag, at slette eller ændre historikken, at til-vælge en klient på en nedlagt lokation. Tilladt: til- og fravalg i dvale.
5. **Hvile.** Lokationen hviler efter en kampagne, hvis der i UI er valgt et antal hviledage for den. Intet valg, ingen automatisk hvile. Hvilen gælder for alle klienter, ikke kun den der lige har stået der. Den der har rettigheden kan stoppe perioden i UI, og det logges. Ændring af antal hviledage kræver rettighed og logges. Umuligt: booking under hvile og enhver "book alligevel"-vej. Ærligt: selve udløsningen efter en kampagne kobles på i trin 24, hvor bookinger findes. Denne pakke leverer antal hviledage, hvile-tilstanden, stop-handlingen og afvisningen. Åbent til trin 24: om en annulleret booking udløser hvile, og om hvilen vurderes pr. stand eller pr. lokation.
6. **Hvem må stå hvor.** En klient må stå på en lokation, når klienten er koblet på lokationens gruppe, lokationen ikke har fravalgt klienten, og lokationen ikke er nedlagt. Koblingen er til eller fra, uden slutdato. Ændringer med en gældende dato træder først i kraft efter godkendelse og en fortrydelsesfrist. Kobles en klient fra gruppen, forsvinder den fra alle gruppens lokationer fra den dag. Flere klienter pr. lokation er ok, grænsen er standen. Historikken bevares altid. Umuligt: klient på en lokation uden for gruppen, samme klient koblet på gruppen to gange, slettet historik, booking af en klient der ikke må stå der den dag.
7. **Persondata.** For hver ny oplysning I gemmer, skal nogen aktivt tage stilling til, om det er persondata, og hvor længe den må gemmes. Er der ikke taget stilling, gælder ingen særregler, og pakken kan ikke leveres. Lokationens egne oplysninger er forretningsdata og bevares. Gruppens kontaktpersoner er persondata og kan anonymiseres, uden at gruppen eller lokationerne mistes. Lokationer anonymiseres kun, hvis nogen aktivt gør en af deres oplysninger til persondata; indtil da er det slået fra. Umuligt: at levere med en oplysning ingen har taget stilling til, at sætte en oplysnings persondata-niveau ned, og at slette i stedet for at anonymisere.
8. **Adgang og log.** Alle ændringer går gennem de godkendte indgange, kræver en årsag og logges. Loggen kan ikke ændres eller slettes. Rettigheder styres i UI. Retten til at se noget er adskilt fra retten til at gøre noget; uden ret til at se, får man ingen data. Ændringer med en gældende dato træder først i kraft efter godkendelse og en fortrydelsesfrist. Superadmin kan alt fra dag ét. Umuligt: at skrive uden om indgangene, at ændre uden årsag, at røre loggen.
9. **Alt styres i UI.** Alle handlinger udføres i UI af den der har rettigheden, uden udvikler: lokationer, stande, grupper, kobling af klienter på grupper, til- og fravalg pr. lokation, status, hvile. Umuligt: at slå et af forbuddene ovenfor fra i UI. Ærligt: selve skærmbillederne kommer først med systemets første side; nu bygges og bevises alt det skærmbillederne skal kalde.

**Hardkodet mod UI.** Hardkodet er strukturen: ejerkæden, de krævede felter, forbuddene, lokationens type-liste, årsag ved skift, én klient pr. stand, urørlig historik. UI-styret er alle værdier: hvilke grupper, lokationer og stande, priser, status, antal hviledage, hvilke klienter er på gruppen, hvilke en lokation fravælger, og hvem der må hvad.

**Flyttet til plan-fasen, synligt.** Det her er tekniske valg, vi træffer i plan-fasen inden for det du har sagt. Hvor vi har et udgangspunkt, står det som vores forslag i planen, ikke som dit ord. Codex angriber dem, og dit plan-ok dækker dem.

- Hvordan systemet sikrer, at en ny lokation altid får sin første stand, og at den sidste ikke kan fjernes.
- Om standen arver gruppen fra lokationen, eller det står på begge.
- Hvordan prisen gemmes, og om en lokation må stå uden pris.
- Hvordan gruppens felt-liste sættes op teknisk, og hvordan kontaktpersonens oplysninger gemmes, så de kan anonymiseres. Hvilke felter der findes, styres i UI; det er fastlagt.
- Om gruppens type skal udfyldes ved oprettelse. Vores udgangspunkt: valgfri ved oprettelse, men skal være der, før rabatter regnes i trin 29.
- Hvordan en gruppe tages ud af brug, når den ikke må slettes.
- Om din gruppe og masterplanens leverandør bliver ét og samme kort i systemet.
- Hvilke rettigheder der ligger klar fra start ud over superadmin.
- Hvilke ændringer der regnes som daterede, og hvilke fortrydelsesfrister der ligger klar fra start. Selve rammen er fastlagt: daterede ændringer godkendes og har en fortrydelsesfrist, og fristens længde pr. type styres i UI.
- Om dvale og hvile bygges som én eller to ting. For dig opleves de som beskrevet.
- Hvilke ændringer slår igennem straks, og hvilke venter på godkendelse og fortrydelsesfrist, inden for det du har sagt.
- Hvordan systemet regner ud, hvem der må stå hvor.
- Om en lokations fravalg består gennem nedlæggelse og genåbning, og om man kan fravælge eller frakoble på en nedlagt lokation. Vores udgangspunkt: nej, som ved til-valg.

**Ikke i scope.** Bookinger, hoteller, biler og afregning med butikkerne: trin 24 til 29. Rabattrapper: trin 29. Skærmbillederne: systemets første side. Overførsel af data fra det gamle system: senere, på dit ord. Hvad dagsprisen bruges til: trin 24 og 29. Hvad der sker med allerede bookede dage, når en klient kobles fra, og afvisning af dobbeltbooking på en stand: trin 24. Om en annulleret booking udløser hvile, og om hvilen vurderes pr. stand eller pr. lokation: åbent, afgøres i trin 24. At et salg tælles på lokationen: forbudt, ikke udskudt.

**To afledninger, der står medmindre du siger stop**

1. Du sagde, at klienter altid skal kunne kobles på og fra de enkelte lokationer, og at nedlæggelse kobler alle af. I gruppe-modellen hedder det fravalg: fravælger butikken den sidste klient, står en aktiv lokation uden klienter. Kravet siger: en aktiv lokation uden klienter er tilladt.
2. Du sagde, at ændring af hvileperioden styres i rettigheder. Kravet siger: den der har rettigheden ændrer antal hviledage direkte, det gælder straks og logges. Ingen godkendelse først. Det gælder kun tallet for hviledage; ændringer med en gældende dato følger stadig godkendelse og fortrydelsesfrist. Selve den automatiske hvile kobles på i trin 24.

**Recon og de låste dokumenter.** Alle 216 fund fra gennemgangen er disponeret: 213 behandlet, 2 udskudt på dit ord om overførsel af gamle data, 1 ikke relevant, nemlig klient-logo. Ingen modsigelse mod vision, forretningsforståelse eller masterplan i forretnings-forstand. To flag til dig om masterplanens tekst: den beskriver klient-tilladelser som en liste pr. lokation, hvor din model er kobling på gruppen med fravalg pr. lokation, og en kildehenvisning om hvile passer ikke. Ingen af dem er rettet af mig. En frisk gennemgang fandt 10 steder, hvor jeg havde lukket huller uden dit ord; alle er rettet, og gen-gennemgangen var ren.

**Kan det bygges.** Code og Codex har begge sagt ja til netop denne version: alle ni krav kan bygges på det, der allerede er bygget for klienter og medarbejdere, og hvert forbud kan testes. Ingen huller. Deres fire noter er alle med på plan-fase-listen ovenfor. Ingen spørgsmål til dig.

**Dit ene ord er `krav ok`.**
