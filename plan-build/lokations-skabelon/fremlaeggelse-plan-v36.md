**Plan for lokations-skabelonen — rettelse til version 3.6. Fremlæggelse før nyt `plan ok`.**

Du godkendte version 3.5 den 21/9. Da Codex skulle skrive testene ud fra planen, fandt den to steder hvor planen og dens forventningsliste ikke sagde det samme, og ét sted hvor planens krav til tidsstyring ikke kunne bygges som skrevet. Version 3.6 retter præcis de tre steder. Intet krav ændres, intet af det du godkendte i version 3.5's oversigt (S-1 til SM-4) ændres, og der tilføjes og fjernes ingen forpligtelser, negativer eller tests.

**1. Dobbelt-dækkede afvisninger tæller ikke længere som ene-værn.** Planen sagde for tolv afvisninger (»en app-bruger må ikke skrive direkte i tabellen«), at fjernelsen af skriverettigheden var det eneste værn. For otte af dem passer det ikke: databasen afviser i forvejen selv (ingen skrivepolitik på historik-tabeller, ingen slette-politik nogen steder), og for historik står desuden en uforanderligheds-spærre. Afvisningerne består uændret; de kræver bare ikke længere hver sin mutations-test af netop det værn. Fire beholdes som ene-værn, fordi rettigheden dér faktisk er det eneste der stopper skrivningen. Det følger reglen du kender fra kill-listen: én meningsfuld dræbt mutant pr. værn der bærer alene, aldrig pr. konfigurationsknap.

**2. Persondata-reglen for butiksfelter er delt tydeligt mellem Bid 2 og Bid 5.** At et felt ikke kan markeres som persondata uden en vej til anonymisering, bevises i Bid 2 (registret afviser). At vejen faktisk anonymiserer adressen på Bilka Hundige, bevises i Bid 5 (hvor anonymiseringen bygges). Det stod sammenblandet i én sætning; nu står det som to trin med hver sit bid. Ingen ændring i hvad der bevises, kun hvornår.

**3. Klokken.** Planen sagde at måle-laget »styrer databasens OS-klokke«. Det kan ikke bygges i CI. Den nye formulering: produktet læser systemets klokke og har ingen egen tidsknap (som før); måle-laget styrer den klokke databasens proces ser, kun fremad, dag for dag. Produktkoden er uændret. Det er det der gør de daterede forløb (priser fra en dato, dvale til en dato, frist på 24 timer, anonymisering 30 dage efter) testbare.

**Hvad der ikke ændres.** Kravene, dine ord i ledgeren, de 22 valg i version 3.5's oversigt, alle tests og afvisninger. §1-§3 er ellers byte-identiske med version 3.5.

**Hvis du siger stop** til punkt 1 eller 2, bliver version 3.5 stående, og Codex skriver tests mod de tolv ene-værn og den sammenblandede sætning som de var. Til punkt 3 findes intet stop-udfald der kan bygges; alternativet (en tidsknap i produktet) ville ændre krav K-5.

**Hvad `plan ok` betyder.** Præcis denne plan, version 3.6 med SHA `807fdf93056180c766d23f93c4137ded98b78e3b`, låses som bundet i kvitteringen, og byggeriet fortsætter på den. Testene Codex allerede har skrevet, bindes til den nye version.

Skriv det ene ord: `plan ok`
