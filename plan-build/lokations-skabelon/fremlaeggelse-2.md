# lokations-skabelon — fremlæggelse 2 (til `krav ok`)

Dato: 2026-09-08 · krav-udkast @ 1dc4a12, blob `b9c5249b7ab90d8898992bde61b8cb018bc4f561` (uploades automatisk til `docs/sandhed/krav/lokations-skabelon-krav.md` efter ren audit) · buildability runde 2: Code + Codex PASS mod forrige blob 43b3e0aa @ 8e1830b; re-kørsel mod b9c5249b indsættes her når driveren melder den · ledger M-1..M-34 @ 17c69a3.

Her er hele kravet i dit sprog. Til sidst står to afledninger af dine ord, som du kan sige stop til. Dit ene ord bagefter er `krav ok`.

**Formål.** Lokations-skabelonen gør fysiske lokationer til central master-data på linje med klienter og medarbejdere. Den dækker grupper som ejere, lokationer, stande, hvem der må stå hvor, status og hvile. Alt styres i UI og auditeres. Bookinger og resten af FM-kæden bygges ovenpå senere uden om-design.

**Ændret siden første fremlæggelse**

- Klienter kobles på gruppen, ikke på lokationen. Gruppe ejer lokation, lokation ejer stand. Det vendte mit gamle forbud mod kæde-kobling.
- Nedlæggelse kobler alle klienter af automatisk. Standene og historikken består. Ved genåbning er gruppens klienter automatisk tilbage.
- Automatisk hvile kun når der er valgt et antal hviledage i UI.
- Dagsprisen: kun historik-kravet står. Hvad prisen bruges til, afgøres i trin 24 og 29.
- Gruppens type er ikke længere et krævet felt ved oprettelse. Afgøres i plan-fasen.
- Under-stande findes ikke. Standen er bunden af kæden.
- Alle dine ord er citeret ordret med nummer fra ledgeren. Ordet "aftaler pr. lokation" er væk; kravet citerer dit ord ordret: "vi booker selv de enkelte lokationer men hver lokation har en gruppe".

**De ni krav**

1. **Lokation som master-data.** En lokation oprettes ét sted med navn, adresse, dagspris, gruppe, type, status og hvile-indstilling. En prisændring ændrer aldrig fortiden. Umuligt: lokation uden navn, type uden for listen butik, messe, marked, event, andet, og salg der attribueres via lokationen.
2. **Ejerkæde og stande.** Gruppe ejer lokation, lokation ejer stand. En lokation har mindst én stand og kan have flere. Standen er bunden af kæden. En stand kan have egen dagspris, ellers gælder lokationens. Der står én klient pr. stand ad gangen. Umuligt: stand uden lokation, under-stande, to klienter på samme stand samtidig, cirkler i hierarkiet, stande der forsvinder ved nedlæggelse.
3. **Gruppe som ejer, klienter kobles på gruppen.** Gruppen oprettes i UI med navn. Klienter kobles på gruppen og arver alle dens lokationer, også dem der kommer til senere. En lokation kan fravælge en klient gruppen har, og ophæve fravalget igen. Umuligt: lokation uden gruppe, gruppe som fritekst, gruppe uden navn, klient på en lokation uden at være i gruppen, sletning af en gruppe med lokationer.
4. **Status.** Aktiv, dvale eller nedlagt. Kun aktiv kan bookes. Skift kræver årsag og auditeres. Nedlagt kan genåbnes. Nedlæggelse kobler alle klienter af lokationen, standene og historikken består, gruppen og dens andre lokationer berøres ikke. Ved genåbning er gruppens klienter automatisk tilbage. Umuligt: booking på dvale eller nedlagt, skift uden årsag, overskrevet historik, at til-vælge en klient på en nedlagt lokation. Tilladt: til- og fravalg i dvale.
5. **Hvile.** Lokationen hviler efter en kampagne, hvis der i UI er valgt et antal hviledage for den. Intet valg, ingen automatisk hvile. Hvilen gælder på tværs af klienter. En rettighedshaver kan stoppe perioden i UI med audit. Ændring af antal hviledage kræver rettighed og auditeres. Umuligt: booking under hvile og enhver "book alligevel"-vej. Ærligt: selve udløsningen efter en kampagne kobles på i trin 24, hvor bookinger findes. Denne pakke leverer antal hviledage, hvile-tilstanden, stop-handlingen og afvisningen.
6. **Hvem må stå hvor.** En klient må stå på en lokation, når klienten er koblet på lokationens gruppe, lokationen ikke har fravalgt klienten, og lokationen ikke er nedlagt. Koblingen er til eller fra, uden slutdato. Frakobling fra gruppen fjerner klienten fra alle gruppens lokationer fra en dato. Flere klienter pr. lokation er ok, grænsen er standen. Historik bevares altid. Umuligt: klient på lokation uden for gruppen, samme klient koblet dobbelt, slettet historik, booking af en klient uden ret på datoen.
7. **Persondata.** Hver ny datakolonne klassificeres aktivt, default er intet. Lokationens felter er forretningsdata og bevares. Gruppens kontaktpersoner er persondata og kan anonymiseres uden at gruppen eller lokationerne mistes. Umuligt: levering med uklassificeret kolonne, sletning som anonymisering.
8. **Adgang og audit.** Al skrivning går gennem godkendte, rettigheds-gatede indgange med årsag. Audit er urørlig. Rettigheder styres i UI, superadmin er dækket fra dag ét. Umuligt: skrivning uden om indgangene, ændring uden årsag, ændret audit.
9. **UI-styrbarhed.** Alle handlinger udføres i UI af rettighedshavere uden udvikler: lokationer, stande, grupper, kobling af klienter på grupper, til- og fravalg pr. lokation, status, hvile. Umuligt: at slå et strukturelt forbud fra i UI. Ærligt: selve siderne kommer i lag F, nu bevises den handlingsflade siderne kalder.

**Hardkodet mod UI.** Hardkodet er struktur: ejerkæden, krævede felter, forbud, lokationens type-liste, årsag ved skift, én klient pr. stand, urørlig historik. UI-styret er alle værdier: hvilke grupper, lokationer og stande, priser, status, antal hviledage, hvilke klienter er på gruppen, hvilke en lokation fravælger, og hvem der må hvad.

**Flyttet til plan-fasen, synligt.** Hvordan mindst én stand sikres ved oprettelse og sletning. Gruppe-arv på stande. Valuta og tom pris. Felt-listen for grupper og anonymiserings-vejen for deres kontaktfelter. Om gruppens type er krævet ved oprettelse, med default: valgfri ved oprettelse, krævet før rabat i trin 29. Hvordan en gruppe tages ud af brug. Om gruppe og leverandør er samme ting. Seeding ud over superadmin. Fortrydelses-opsætning. Om dvale og hvile er én eller to ting i modellen. Direkte kontra godkendt skrivevej pr. handling. Om retten pr. lokation afledes eller gemmes. Om fravalg består gennem nedlæggelse og genåbning, og om fravalg og frakobling på en nedlagt lokation afvises, med default: afvises. Planlæggeren afgør inden for kravet, Codex angriber, dit plan-ok dækker.

**Ikke i scope.** Bookinger, hotel, køretøj og fakturering i trin 24 til 29. Rabattrapper i trin 29. UI-siderne i lag F. Migration af 1.0-data importeres senere på dit ord. Hvad dagsprisen bruges til: trin 24 og 29. Hvad der sker med allerede bookede dage ved frakobling, og afvisning af dobbeltbooking på en stand: trin 24. Attribution via lokation er forbudt, ikke udskudt.

**To afledninger, der står medmindre du siger stop**

1. Du sagde, at klienter altid skal kunne kobles på og fra de enkelte lokationer, og at nedlæggelse kobler alle af. Så kan den sidste kobles fra, og en lokation kan stå uden klienter. Kravet siger: en aktiv lokation uden klienter er tilladt.
2. Du sagde, at ændring af hvileperioden styres i rettigheder. Kravet siger: den der har rettigheden ændrer antal hviledage direkte, det gælder straks og auditeres. Ingen godkendelse først. Selve den automatiske hvile kobles på i trin 24.

**Recon og låste docs.** Alle 216 fund er disponeret: 213 behandlet, 2 udskudt på dit migrations-ord, 1 ikke relevant, nemlig klient-logo. Ingen modsigelse mod vision, forretningsforståelse eller masterplan i forretnings-forstand. To flag til dig om masterplanens tekst: den beskriver klient-tilladelser som en tabel pr. lokation, hvor din model er kobling på gruppen med fravalg pr. lokation, og en kildehenvisning om hvile passer ikke. Ingen af dem er rettet af mig. En frisk audit fandt 10 steder, hvor jeg havde lukket huller uden dit ord; alle er rettet, og en gen-audit var ren.

**Buildability.** Code og Codex har begge dømt PASS: alle ni krav kan bygges på fundamentets skabeloner, og alle acceptkriterier kan testes som slut-effekter. Ingen huller. Deres fire noter er plan-fase-stof og står på listen ovenfor. Ingen spørgsmål til dig.

**Dit ene ord er `krav ok`.**
