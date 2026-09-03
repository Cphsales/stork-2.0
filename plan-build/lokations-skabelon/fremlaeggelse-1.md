# lokations-skabelon — fremlæggelse 1 (før buildability)

Dato: 2026-09-03 · fremlagt i chatten i claude-ai-krav-sessionen på Mathias' ord "præsenter krav for mig" · krav-blob `b01d85fd12f1865352e6c082ebbe1fdb336ce46d` @ commit `727ba0b` (`docs/sandhed/krav/lokations-skabelon-krav.md`) · buildability: IKKE kørt endnu.

Her er hele kravet, som det ligger i sandhedsmappen ved commit 727ba0b.

**Formål.** Lokations-skabelonen gør fysiske lokationer til central master-data på linje med klienter og medarbejdere. Den dækker lokationer, stande, grupper som ejere, hvem der må stå hvor, status og hvile. Alt styres i UI og auditeres. Bookinger og resten af FM-kæden bygges ovenpå senere uden om-design.

**De ni krav**

1. **Lokation som master-data.** En lokation oprettes ét sted med navn, adresse, dagspris, gruppe, type, status og hvile-indstilling. Umuligt: lokation uden navn, type uden for listen butik, messe, marked, event, andet, og salg der attribueres via lokationen.
2. **Stande.** En lokation har flere stande. En stand kan have egen dagspris, ellers gælder lokationens. Der står én klient pr. stand ad gangen. Umuligt: to klienter på samme stand samtidig, cirkler i hierarkiet, stande der forsvinder ved nedlæggelse.
3. **Gruppe som ejer.** Hver lokation ejes af en gruppe, fx Coop, med type kæde, enkelt-butik, messe-operatør eller andet. Umuligt: lokation uden gruppe, gruppe som fritekst, én kæde-kobling der dækker alle gruppens butikker, sletning af en gruppe med lokationer.
4. **Status.** Aktiv, dvale eller nedlagt. Kun aktiv kan bookes. Skift kræver årsag og auditeres. Nedlagt kan genåbnes. Nedlæggelse kobler alle klienter af automatisk, standene og historikken består. Umuligt: booking på dvale eller nedlagt, skift uden årsag, overskrevet historik, koble en klient på en nedlagt lokation. Tilladt: koble klienter på i dvale.
5. **Hvile.** Efter en kampagne hviler lokationen på tværs af klienter, automatisk efter lokationens indstilling eller sat manuelt. En rettighedshaver kan stoppe perioden i UI med audit. Ændring af hvileperioden kræver rettighed og auditeres, ingen godkendelsesrunde. Umuligt: booking under hvile og enhver "book alligevel"-vej.
6. **Hvem må stå hvor.** Klienter kobles på og fra de enkelte lokationer af rettighedshavere. Ingen slutdato kræves. Koblingen gælder til frakobling eller nedlæggelse. Flere klienter pr. lokation er ok, grænsen er standen. Historik bevares altid. Umuligt: kobling uden klient eller lokation, samme klient koblet dobbelt, slettet historik, booking af en klient uden kobling på datoen.
7. **Persondata.** Hver ny datakolonne klassificeres aktivt, default er intet. Lokationens felter er forretningsdata og bevares. Gruppens kontaktpersoner er persondata og kan anonymiseres uden at gruppen eller lokationerne mistes. Umuligt: levering med uklassificeret kolonne, sletning som anonymisering.
8. **Adgang og audit.** Al skrivning går gennem godkendte, rettigheds-gatede indgange med årsag. Audit er urørlig. Rettigheder styres i UI, superadmin er dækket fra dag ét. Umuligt: skrivning uden om indgangene, ændring uden årsag, ændret audit.
9. **UI-styrbarhed.** Alle handlinger udføres i UI af rettighedshavere uden udvikler. Umuligt: at slå et strukturelt forbud fra i UI. Ærligt: selve siderne kommer i lag F, nu bevises den handlingsflade siderne kalder.

**Hardkodet mod UI.** Hardkodet er struktur: krævede felter, forbud, type-listerne, årsag ved skift, én klient pr. stand, urørlig historik. UI-styret er alle værdier: hvilke lokationer, stande, grupper, priser, status, hvileperioder, hvem der er koblet på, og hvem der må hvad.

**Flyttet til plan-fasen, synligt.** Om stande kan have under-stande, gruppe-arv på stande, valuta og tom pris, felt-listen for grupper, seeding ud over superadmin, fortrydelses-opsætning, om dvale og hvile er én eller to ting i modellen, og direkte kontra godkendt skrivevej pr. handling. Planlæggeren afgør inden for kravet, Codex angriber, dit plan-ok dækker.

**Ikke i scope.** Bookinger, hotel, køretøj og fakturering i trin 24 til 29. Rabattrapper i trin 29. UI-siderne i lag F. Migration af 1.0-data importeres senere på dit ord. Hvad der sker med allerede bookede dage ved frakobling, og afvisning af dobbeltbooking på en stand, hører til trin 24. Attribution via lokation er forbudt, ikke udskudt.

**Recon.** Alle 216 fund er disponeret: 213 behandlet, 2 udskudt på dit migrations-ord, 1 ikke relevant, nemlig klient-logo. Ingen modsigelse mod vision, forretningsforståelse eller masterplan. Ét vedligeholds-flag på en kildehenvisning i masterplanen, uden betydning for pakken.

**Buildability.** Ikke kørt endnu. Code og Codex skal afgive verdikt mod blob b01d85f. Finder de et hul, kommer det til dig som spørgsmål, og et nyt upload giver en ny fremlæggelse. `krav ok` kan først bedes om efter den runde.
