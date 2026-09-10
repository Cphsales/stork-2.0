# Lokations-skabelon — åbne punkter efter plan-runde 2

Dette er den ene samlede liste over det, planen har brug for dit ord til, plus de regler og standardvalg planen
følger uden at spørge. Tre spørgsmål kræver ét ord hver. Fire regler står medmindre du siger stop (én af dem, B-2, er
planens eget valg — sig ja eller nej). Otte standardvalg er til orientering. Planen skrives med begge udfald for
spørgsmålene, så dit svar vælger — det udskyder intet.

## Tre spørgsmål (ét ord hver)

**S-1 — Ekstra felter på en gruppe.**
Coop-gruppen oprettes med navn, type og kontaktpersoner (navn, e-mail, telefon). Får I senere brug for et ekstra felt
på gruppen, fx CVR-nummer: skal I så selv kunne tilføje feltet i UI, som I kan på klienter, eller er det i orden at
det kræver en udvikler?
Svar: **selv i UI** / **udvikler ok**.
(Kravet siger som default »som for klienter« = selv i UI; planen har valgt »udvikler ok«. Dit ord afgør.)

**S-2 — Adresse markeret som persondata.**
I markerer i UI at Bilka Hundiges adresse er persondata. Skal systemet så altid kunne anonymisere adressen (ellers
afvises markeringen), eller må markeringen stå som en ren registrering uden anonymisering?
Svar: **altid anonymisérbar** / **registrering ok**.
(Anbefaling fra auditten: registrering ok — det er sådan klienters felter allerede virker. Vælger du »altid
anonymisérbar«, skal der bygges en ekstra vej, og det kan blive et stop-punkt.)

**S-3 — Hvor slutprøven læser rigtige data fra.**
Når pakken er bygget, skal slutprøven køre på rigtige data — ikke på testdata vi selv har lavet. Må slutprøven læse
direkte fra jeres rigtige system med en adgang der KUN kan læse og aldrig skrive, eller skal den læse fra en kopi af
systemet?
Svar: **rigtige system** / **kopi**.
(Anbefaling: rigtige system — så prøves det, der faktisk kører. Vælger du kopi, skal det først bevises at kopien er
tro mod det rigtige, og det er ekstra arbejde.)

## Fire regler planen følger — står medmindre du siger stop

**B-1 — Dato ved forsinket godkendelse.** Tryg bedes koblet fra Coop fra 1/10. Godkendelsen falder først 3/10. Så
gælder frakoblingen fra 3/10, ikke 1/10: intet ændres bagud. Det samme gælder til-kobling og fravalg, og en kobling
»fra i dag« træder tidligst i kraft dagen efter fortrydelsesfristen er udløbet.

**B-2 — Fravalg gennem nedlæggelse (planens valg — sig ja eller nej).** Tryg er fravalgt i Bilka Hundige. Butikken
nedlægges og genåbnes et år senere. Er Tryg stadig fravalgt ved genåbningen, indtil I ophæver fravalget? Planen siger
ja. Svar: **ja** / **nej**.

**B-4 — Fravalg kræver kobling.** Alka skal kobles på Coop, men må ikke stå i Bilka Hundige. Dit ord: »lokationer kan
godt fravælge klienter som gruppen har«. Planen: fravalget kan først laves når Alkas kobling til Coop gælder; dateres
både kobling og fravalg frem, gælder udelukkelsen fra første dag.

**B-5 — Ny stand på nedlagt butik.** Bilka Hundige er nedlagt. Dit ord om klient-aftaler på en nedlagt butik: »den skal
væres åben«. Planen bruger samme regel for nye stande: en ny stand kan først oprettes når butikken er genåbnet.

## Otte standardvalg — til orientering (kan ændres senere via UI eller ved at sige stop)

- **D-1** En ny butik er aktiv og kan bookes fra oprettelsen. Skal den vente, sættes den i dvale straks efter.
- **D-2** Systemets »dag« skifter kl. 01/02 dansk tid, ikke ved dansk midnat. Et skift kl. 00.30 dateres dagen før.
- **D-3** Grupper og butikker lægges under rettigheds-området »organisation«. Den der har adgang til hele området får
  dermed også adgang til grupper og butikker.
- **D-4** Skifter Bilka Hundige fra Coop til en anden gruppe, sker det straks med rettighed og årsag, som et statusskift:
  Coop-klienternes ret i butikken ophører fra samme dag, den nye gruppes klienter får ret. Ingen godkendelse og ingen
  fortrydelsesfrist.
- **D-5** En stand kan tages ud af brug uden at slettes. Den sidste stand i brug på en butik kan ikke tages ud af brug;
  sæt butikken i dvale eller nedlagt i stedet.
- **D-6** En kobling eller et fravalg varer mindst én dag. Frakobling eller ophævelse fra samme dag som starten afvises;
  fortryd inden fristen, eller vælg dagen efter.
- **D-7** Dvale »til den 5. oktober« betyder at butikken kan bookes igen den 5. oktober. Skærmteksten skal sige det samme.
- **D-8** Type er krævet på en butik; »andet« kan altid vælges. Adresse er valgfri.

## Det der ikke spørges om her

- Planen skal stadig godkendes med ét ord (»plan ok«) i en senere fremlæggelse — dette er kun de åbne punkter.
- Spørgsmålet om den lokale gate-dom (workflow-planens pkt. 36) er fabrikkens og står ikke her.
