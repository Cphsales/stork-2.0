# antag-aldrig-audit — lokations-skabelon runde 2 (udkast-blob 1761207def9c19bef4b5f8f74121a1e2ff03f485)

Auditeret mod: `mathias-ord.md` (M-1..M-30) · `vision-og-principper.md` · `forretningsforstaaelse.md` · `masterplan-1-12-uddrag.md`. Metode: hver Kilder-linje efterprøvet ordret mod ledgeren; hver påstand i Formål/K-1..K-9/dispositioner/IKKE-i-scope jagtet tilbage til (a) citeret M-ord, (b) låst doc, eller (c) markeret afledning.

Positivt først (så fundene har proportion): alle ordrette citater i Kilder-linjerne matcher ledgeren tegn-for-tegn (M-13, M-14, M-17, M-18, M-21, M-23, M-24, M-25.1/.2/.4, M-27a/b/c, M-28, M-29, M-30.2/.4 — alle verificeret). Kernen — gruppe-modellen (K-3), ejerkæden (K-2), status-trioen (K-4), koblings-/fravalgs-mekanikken (K-6) — er solidt ledger-båret. Fundene nedenfor er kanterne, hvor udkastet har lukket huller med egen dømmekraft uden kilde eller markering.

## Ubekræftede afledninger (fund)

### FUND-1 — K-1 ac 3: pris-semantikken "informativ" er opfundet forretnings-sandhed
- **Citat:** "Default-dagsprisen er informativ: en pris-ændring ændrer ALDRIG noget allerede oprettet — hvad der gjaldt hvornår kan altid ses (audit)."
- **Hvorfor kilden ikke bærer:** Intet M-ord nævner pris overhovedet. §1.12 definerer kun at feltet findes + placement-pris-arv. Halvdelen "ændrer aldrig noget allerede oprettet" kan læses ud af princip 9 — men "informativ" (at prisen ikke binder noget) er en forretnings-afgørelse som recon selv flagede som `intet-data:pris-semantik`, og dispositions-rækken lukker flaget med kravets egen påstand som kilde — cirkulært. Ingen "bekræftes af Mathias"-markering.
- **Forslag:** Markér som afledning + bekræft hos Mathias (fx: "Når du ændrer dagsprisen på en lokation — er prisen kun vejledende indtil den bruges, og skal alt allerede oprettet stå urørt? ja/nej"). Alternativt: trim ac 3 til det princip-bårne (pris-ændring ændrer aldrig fortid; audit viser hvad der gjaldt) og flyt "informativ" til plan-fase-listen.

### FUND-2 — K-5 ac 3: "ingen godkendelses-livscyklus" hviler på to ord og et spørgsmål der ikke står i ledgeren
- **Citat:** "med rettighed gælder den straks og auditeres med årsag (Mathias 2026-09-03: 'styres i rettigheder' — ingen godkendelses-livscyklus; princip 5's kladde→testet→godkendt→aktiv gælder data-håndterings-konfiguration, hvile-perioden er forretningskonfig)."
- **Hvorfor kilden ikke bærer:** To huller. (a) **Emne-bindingen:** M-29.5 er ordret kun "5 styres i retigheder". Ledgeren rummer IKKE de 5 fresh-eyes-spørgsmål, og M-29's kontekst-kolonne glosser kun gruppe-ejerskab og 1-klient-pr.-stand. At spørgsmål 5 handlede om hvileperiode-ændring kan ikke efterprøves i ledgeren — og ledgerens egen regel er "Et ord uden ledger-entry kan ikke bære et krav". (b) **Afledningen:** "styres i retigheder" siger intet om at princip 5 / forretningsforstaaelse §9's livscyklus-punkt ("Stork skal kunne tage konfigurations-ændringer gennem livscyklus: kladde → testet → godkendt → aktiv") IKKE gælder her. Læsningen "hvile-perioden er forretningskonfig, ikke data-håndterings-konfig" er udkastets egen — og i "Holdt mod låste docs" tilskrives den "— Mathias 2026-09-03", hvilket han ikke har sagt. Det er et krav der læser et låst princip ned på styrken af to ord.
- **Forslag:** (a) De 5 fresh-eyes-spørgsmål appendes verbatim til ledgeren af den session der stillede dem, så M-29's svar-numre får deres referent. (b) Markér "ingen godkendelses-livscyklus" som afledning "bekræftes af Mathias", eller spørg direkte: "Skal en ændring af antal hviledage gælde med det samme når en rettighedshaver laver den — uden godkendelses-trin først? ja/nej".

### FUND-3 — K-3 ac 3: type-KRAVET på gruppen er lånt fra en identifikation udkastet selv kalder uafklaret
- **Citat:** "Gruppe uden navn eller uden type AFVISES." (+ struktur-listen: "type-løs gruppe" umulig)
- **Hvorfor kilden ikke bærer:** Mathias' gruppe-ord (M-17, M-27c, M-29) nævner navn og klient-kobling — aldrig type. Typen kommer fra §1.12's LEVERANDØR-entitet, men udkastet siger selv (sprog-noten + plan-fase-listen) at "om gruppe og leverandør er én eller to entiteter afgøres i plan-fasen". Og selv for leverandøren siger §1.12 kun at type-feltet findes og styrer rabataftale-lookup — ikke at en type-løs entitet AFVISES. Et hårdt AFVIS-acceptkriterie står dermed på en dobbelt afledning uden markering.
- **Forslag:** Betinget formulering ("gruppen bærer §1.12's type-felt som rabat-anker; om type er krævet ved oprettelse afgøres med leverandør-identifikationen i plan-fasen") eller bekræft hos Mathias at en gruppe skal have en type for at kunne oprettes.

### FUND-4 — K-2 struktur + ac 6: "lokation uden stande umulig" står mod Mathias' egen omlæsning af sit ord
- **Citat:** struktur-listen: "lokation uden stande" [umuligt] · ac 6: "en lokation har altid mindst én stand".
- **Hvorfor kilden ikke bærer:** M-17 siger ordret "en lokation har minimum 1 stand" — men da han blev spurgt hvad det betød, svarede Mathias (M-18): "altså med minimum en stand menes der at gruppe ejer lokation og lokation ejer stand". Hans egen forklaring peger altså på EJERKÆDEN, ikke nødvendigvis på en kardinalitets-invariant (afvis oprettelse uden stand, forbyd fjernelse af sidste stand). Udkastet beholder begge læsninger som låst struktur uden afledt-markering — kun håndhævelses-mekanikken er flyttet til plan-fase, ikke selve spørgsmålet om invariansen er hans mening.
- **Forslag:** Bekræft hos Mathias: "Skal det være umuligt at have en lokation uden mindst én stand — dvs. oprettelse uden stand afvises? ja/nej" — eller markér kardinalitets-læsningen som afledning.

### FUND-5 — K-6 HVAD + ac 3: "ingen slutdato på KOBLINGEN" er en overført læsning af et ord om LOKATIONER
- **Citat:** "Ingen slutdato kræves: koblingen gælder indtil klienten kobles fra gruppen, fravælges på lokationen, eller lokationen nedlægges (Mathias 2026-09-03: 'lokationer har ingen slutdato før vi deaktivere den/nedlægger den')."
- **Hvorfor kilden ikke bærer:** M-30.4 siger ordret at LOKATIONER ingen slutdato har — sætningen handler om lokationens levetid, ikke om klient-koblingens. Overførslen er rimelig (han afviste selve aftale-begrebet i samme åndedrag: "hvad menes der med aftaler?"), men den er en læsning — præsenteret som direkte citat-båret faktum uden markering.
- **Forslag:** Markér som afledning ("læses som: koblingen er udateret — bekræftes af Mathias") eller lad ac 3 stå på den sikre halvdel (en kobling uden slutdato AFVISES IKKE) og drop generaliseringen "gælder indtil …" som citat-båret.

### FUND-6 — K-5 ac 5: "Enheden er dage" lukker et ledger-ord uden at nævne det
- **Citat:** "Enheden er dage."
- **Hvorfor kilden ikke bærer:** M-7 (parafrase, 2026-09-02) registrerer "cooldown-enhed = UI-konfig". M-21 (senere, verbatim: "kan hvis antal hvile dage er valgt i ui") bærer dage-læsningen — men udkastet hverken citerer M-7 eller deklarerer at M-21 afløser den. To ledger-ord trækker hver sin vej, og kravet vælger tavst.
- **Forslag:** Notér supersessionen eksplicit i K-5's kilder (M-21 afløser M-7-parafrasens enheds-punkt) — eller bekræft hos Mathias hvis M-7 faktisk betød at enheden selv (dage/uger) skal kunne vælges i UI.

### FUND-7 — K-2 plan-fase: under-stande delegeres til planner trods M-18's faste kæde
- **Citat:** "om en stand kan have under-stande er ikke forretnings-afgjort (planner afgør i rammen)".
- **Hvorfor kilden ikke bærer:** M-18 giver kæden "gruppe ejer lokation og lokation ejer stand" — stand som blad — og K-2 kalder selv kæden "fast" i samme afsnit. At lade planner kunne åbne for under-stande er en forretnings-strukturel mulighed intet M-ord støtter; §1.12's generelle selv-reference er systemord, ikke Mathias-ord.
- **Forslag:** Læs M-18 som afgjort (stand = blad; under-stande kræver nyt Mathias-ord) — eller stil spørgsmålet ved fremlæggelsen.

### FUND-8 — K-3 ac 5: "deaktiveres/udfases" indfører en gruppe-livscyklus uden kilde
- **Citat:** "En gruppe med lokationer kan IKKE slettes — kun deaktiveres/udfases (historik består)."
- **Hvorfor kilden ikke bærer:** Sletnings-forbuddet er princip-båret (princip 9 + §11: forretningsdata bevares evigt) — fint. Men "deaktiveres/udfases" indfører en status-livscyklus på gruppen som hverken §1.12 (leverandøren har intet status-felt i uddraget) eller noget M-ord kender.
- **Forslag:** Behold sletnings-forbuddet; flyt deaktiverings-mekanikken eksplicit til plan-fase-listen eller markér som afledning.

### Verifikations-hul (IKKE talt som fund): masterplan-citationer uden for §1.12-uddraget
Følgende påstande citerer masterplan-afsnit som ikke findes i audit-materialet (`masterplan-1-12-uddrag.md` rummer kun §1.12) og kan derfor hverken be- eller afkræftes her. De kan udmærket være korrekt bårne af fuld masterplan — men i denne audits kilde-sæt er de udækkede og SKAL holdes mod fuld masterplan i fold-ind-runden:

- K-4 struktur / K-8 ac 2: "Enhver mutation uden angivet årsag AFVISES" — citerer §1.3. Uddraget bærer kun årsags-pligt på STATUS-skift (§1.12: "Auditeres med årsag"); vision princip 6 bærer audit på alt, men ikke årsags-pligt på alt.
- K-1: "Messer og markeder er type-værdier — samme mekanik uanset type" + forbud mod sær-mekanik — citerer §2.7.8.
- K-1 ac 4: attribution aldrig via lokation — citerer §2.7.1 (dog delvist båret af forretningsforstaaelse §1/§3: attribution via klient).
- K-5: trigger-semantikken "hviler efter en kampagne" — citerer Appendix A; intet M-ord fastlægger udløser-øjeblikket.
- K-6 ac 10: "daterede ændringer får godkendelse + fortrydelses-periode" — citerer §1.7/fundament-mønstre; intet M-ord kræver godkendelses-trin her (bemærk kontrasten til FUND-2, hvor godkendelses-trin læses VÆK på to ord — begge afgørelser står uden Mathias-kilde).
- K-9 scope-ærlighed: "Trin 10b er et core-lag-trin; UI-siderne kommer i lag F" — citerer §4/Appendix B. Udskydelsen er ærligt deklareret, men den spænder mod M-23's "skal det være muligt at oprette en lokaition i ui", og dokumentbelægget ligger uden for audit-materialet.
- K-2 ac 4: dags-granulariteten "på samme dag" — M-29 siger "samtidig"/"maks 1 klient pr stand", ikke pr. dag; granulariteten hviler på booking-stof uden for materialet.

## Fejl-citater (K-n citerer M-m men M-m siger ikke det)

### FC-1 — K-3 HVAD + Grundlag: »2/9-ordet "aftaler laves pr. lokation"« findes ikke i ledgeren
K-3 skriver: "2/9-ordet 'aftaler laves pr. lokation' er hermed præciseret", og Grundlag opregner "aftaler laves pr. lokation, hver lokation har en gruppe som ejer" blandt Mathias' krav-ord 2026-09-02. Ledgeren har intet sådant ord: M-27c siger "vi booker selv de enkelte lokationer men hver lokation har en gruppe". Værre: M-30.4 viser at Mathias IKKE genkender ordet "aftaler" ("hvad menes der med aftaler?") — udkastet citerer altså en parafrase i citat-klæder, bygget på et begreb Mathias har afvist forståelsen af.
**Forslag:** erstat begge steder med det ordrette M-27c-citat.

### FC-2 — K-4 ac 9 / K-6 ac 9: "(Mathias 2026-09-03)" på en afledt sætning
"gruppens kobling og gruppens øvrige lokationer berøres ikke (Mathias 2026-09-03)". Intet M-ord siger dette. Det er en god og sandsynligvis rigtig afledning — M-14 siger frakobling sker "fra lokationer" (ikke fra gruppen), og M-19's automatiske arv ved genåbning forudsætter intakt gruppe-kobling — men attributionen lader den se direkte citeret ud.
**Forslag:** skriv afledningen som afledning ("følger af M-14 + M-19") eller markér "bekræftes af Mathias".

### Note (hygiejne, ikke selvstændigt fund)
Brødtekst-citater er stave-normaliserede: "lokationer beholder de oprettede stande" (M-14: "lokaitoner …"), "vigtigt vi bevarer den historiske data" (M-13: "bevære den historikse data"), "den skal være åben" (M-30: "den skal væres åben"). Kilder-linjerne citerer korrekt, så ingen kilde-fejl — men når kravet sætter anførselstegn bør det være ordret eller deklareret parafrase; verbatim-reglen findes netop for at parafrase-drift ikke kan snige sig ind (jf. FC-1, hvor det faktisk skete).

## Dom over den markerede K-1-afledning (M-24 "client")

**Læsningen er FORSVARLIG som forslag.** Tre grunde:
1. M-24 (2/9) er ældre end gruppe-modellen (M-17, 3/9); Mathias' senere, mere gennemtænkte model lægger klient-koblingen på gruppen — læsningen følger hans egen udvikling.
2. M-14 gør en bogstavelig læsning uholdbar som invariant: ved nedlæggelse kobles ALLE klienter automatisk fra, og lokationen består — hans egen model indeholder altså lokationer med nul klienter. "Mindst én klient pr. lokation" kan derfor ikke være en hård regel over hele livscyklussen.
3. M-24's pointe var struktur/værdi-skellet ("Der er selvfølgelgi noget der skal være hardkodet. eksempelvis …") — eksempel-karakteren støtter at ordet illustrerer skellet frem for at fastsætte kardinalitet.

**MEN spørgsmålet er NØDVENDIGT** — og det af en grund udkastet ikke selv nævner: asymmetrien. Navn-halvdelen af præcis samme sætning håndhæves bogstaveligt (K-1 ac 1: blankt navn AFVISES), mens client-halvdelen læses væk. De to læsninger divergerer materielt: må en aktiv lokation stå uden nogen til-valgt klient — fx i en ny gruppe der endnu ingen klienter har, eller hvor lokationen har fravalgt alle? Svaret rammer K-1, K-3 ac 1/4 og K-6.

**Status: markeringen er korrekt sat** ("afledt læsning, bekræftes af Mathias ved fremlæggelse") — afledningen opfylder dermed betingelse (c) og tælles ikke som fund. Men bekræftelsen er endnu IKKE sket: intet ord i M-1..M-30 besvarer den, og både runde 2-fremlæggelsen (M-20) og "krav upload" (M-22) er passeret uden svar. Spørgsmålet skal stilles eksplicit i næste fremlæggelse, i hans sprog og lukket form (fx: "Må en lokation stå uden nogen klient — fx hvis gruppen ingen klienter har endnu? ja/nej"), og svaret appendes til ledgeren FØR afledningen kan regnes som dækket. "Krav upload" alene må ikke grøn-stemple den.

## Konklusion: FUND (10)

8 ubekræftede afledninger (FUND-1..8) + 2 fejl-citater (FC-1..2). Dertil to ting uden fund-status men med handlepligt: (a) K-1's markerede M-24-afledning er korrekt markeret men stadig ubesvaret — skal med i næste fremlæggelse; (b) verifikations-hullet: en række masterplan-citationer uden for §1.12-uddraget kan ikke efterprøves i audit-materialet og skal holdes mod fuld masterplan i fold-ind-runden (særligt årsags-pligten på ALLE mutationer og godkendelses+fortrydelses-mekanikken i K-6 ac 10).

Alvorligst: FUND-1 (opfundet pris-semantik uden noget kilde-anker) og FUND-2 (et låst princip læses ned på to ord, hvis spørgsmåls-kontekst ikke står i ledgeren). Ingen af fundene vælter kravets kerne — gruppe-model, ejerkæde, status-livscyklus og koblings-mekanik er solidt ledger-bårne. Fundene er præcis den type steder hvor et hul er lukket med dømmekraft der SER autoritativ ud; antag-aldrig kræver dér enten et Mathias-ord i ledgeren eller et synligt "bekræftes af Mathias".
