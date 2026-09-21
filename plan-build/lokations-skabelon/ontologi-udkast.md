# Storks ontologi — lokations-skabelon (UDKAST, ½ side)

**Status: UDKAST fra driveren (2026-09-21, M-49 »workflowet skal vel bygges omkring storks ontologi«).** Afledt alene af kravet K-1..K-9 (`docs/sandhed/krav/lokations-skabelon-krav.md` @ `9402164d`) og ordbogen (@ `bcab6b4e`). Bliver et sandhedsdokument (`docs/sandhed/ontologi/lokations-skabelon.md`, kædens top) først når Mathias siger ok — indtil da binder kravene begreberne, og intet i planen ændres af dette dokument.

## Begreber (Mathias' ord)

- **Gruppe** — ejeren. Har navn, en type (kæde · enkelt butik · messe-operatør · andet) og kontaktpersoner (navn, e-mail, telefon = persondata). Coop, Dansk Shoppingcentre. En gruppe kan tages ud af brug, ikke slettes når den har butikker.
- **Butik (lokation)** — butik, messe, marked, event eller andet, samme regler for alle. Har navn, adresse, dagspris, type, gruppe, status og evt. et antal hviledage. Bilka Hundige.
- **Stand** — den plads én klient står på ad gangen. Har egen pris eller følger butikkens. En butik har altid mindst én stand i brug; en stand ligger aldrig under en anden stand.
- **Klient** — det eksisterende klient-begreb (Tryg, Alka). Ændres ikke af pakken.
- **Kobling** — klient ↔ gruppe, fra en dato, evt. til en dato. Retten til at stå i gruppens butikker kommer herfra.
- **Fravalg** — en butik fravælger en klient gruppen har, fra en dato; kan ophæves igen.
- **Status** — aktiv (kan bookes) · dvale (hviler, kan ikke bookes) · nedlagt (ude af drift, kan genåbnes). Præcis én ad gangen; skift med årsag.
- **Hvile** — dvale efter en kampagne, kun hvis butikken har valgte hviledage; kan stoppes før tid. Manuel dvale findes altid.
- **Anmodning → godkendelse → fortrydelsesfrist → gennemførelse** — vejen for kobling, frakobling, fravalg og ophævelse. Anmoderen godkender ikke sig selv.
- **Persondata-markering og anonymisering** — kontaktpersoners felter er persondata fra start; butiksfelter (navn, adresse) kan markeres i UI og kan da altid anonymiseres. Typer, tal og datoer kan ikke.
- **Rettighed · årsag · spor** — enhver ændring kræver rettighed og årsag og efterlader et spor der ikke kan ændres.

## Relationer og regler der aldrig brydes

- **Ejerkæden:** gruppe ejer butik, butik ejer stand. Hver butik har præcis én gruppe.
- **Retten:** en klient må stå i en butik når klienten er koblet på butikkens gruppe på den dato, butikken ikke har fravalgt klienten, og butikken ikke er nedlagt. Spørgsmålet »må Tryg stå i Bilka Hundige den 5. oktober« har altid ét svar, også bagud i tid.
- **Fortiden ændres aldrig:** koblinger, fravalg, priser og statusskift har datoer; historikken består og kan altid læses.
- **Umuligt, også for superadmin:** butik uden navn eller uden gruppe · gruppe som fri tekst · stand under stand · sidste stand i brug tages ud af brug · til-valg eller fravalg på en nedlagt butik · handling uden årsag · persondata-markering fjernes igen · salg eller provision henført til butikken (det hører til klienten).

## Livscyklus

Oprettelse (aktiv, med første stand) → dvale ↔ aktiv → nedlagt → genåbning (arver gruppens da gældende klienter; bestående fravalg består). Stande overlever nedlæggelse. Kontaktpersoner kan anonymiseres uden at gruppen eller butikkerne mistes.

## Uden for denne ontologi (kommer i senere trin)

Booking og dobbeltbooking pr. stand (trin 24) · hvad dagsprisen bruges til økonomisk (trin 29) · skærmbilleder (lag F) · import af 1.0-data (»dette importeres senere«, M-25).
