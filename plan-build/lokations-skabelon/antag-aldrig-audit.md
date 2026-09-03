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

---

## Re-audit v2 (blob 44badbdf)

Auditeret: `krav-udkast-v2.md` (fuld diff mod v1 gennemgået linje for linje; alle nye kilde-henvisninger efterprøvet mod ledgeren og de to verificerbare låste docs). Én ting FØRST, fordi den falsificerer en præmis i re-audit-bestillingen:

**LEDGER-DISKREPANS (skal handles på):** Bestillingen siger at mathias-ord.md "er opdateret (nu inkl. Q1-Q5-referenterne til M-29)". Det er IKKE tilfældet i mit dir: filen er indholds-identisk med den jeg auditerede (samme 8837 bytes; M-29's kontekst-kolonne glosser stadig kun gruppe-ejerskab + maks 1 klient pr. stand; ingen Q1-Q5-sektion findes). V2-udkastet er selv internt konsistent med en UÆNDRET ledger — dets header pinner stadig "M-1..M-30 @ fb8184c, blob 3aad84d1", præcis som v1. Konsekvens: FUND-2's efterprøvningshul (hvad spørgsmål 5 bag M-29 faktisk spurgte om) er IKKE lukket ad ledger-vejen — det er lukket ad markerings-vejen (se FUND-2 nedenfor). Enten skal Q1-Q5-referenterne faktisk appendes (af den session der stillede dem), eller også skal påstanden om at de er leveret trækkes tilbage. En "opdatering" der annonceres men ikke findes, er præcis den slags autoritativt udseende falsk-grøn denne audit findes for.

### Pr. fund: LUKKET / IKKE-LUKKET

- **FUND-1 (pris "informativ") — LUKKET.** Ac 3 er trimmet til det princip-bårne: "En ændring af dagsprisen ændrer ALDRIG fortiden … (princip 9; forretningsforståelse §2 dato-snapshot)" — begge kilder bærer det (princip 9: "Forretningshandlinger ændrer aldrig oprindelig data"; §2: "Fortid skrives ikke om"). "Informativ" er fjernet; hvad prisen bruges til er flyttet eksplicit ud af scope (nyt IKKE-i-scope-punkt, trin 24/29), og dispositions-rækken for `intet-data:pris-semantik` er rettet tilsvarende (ikke længere cirkulær).
- **FUND-2 (straks-virkning / "ingen godkendelses-livscyklus") — LUKKET, ad markerings-vejen.** Ac 3 er nu en deklareret afledning: "*Afledt af M-29.5 … **[bekræftes af Mathias]** (stilles i fremlæggelsen)*" med BEGGE udfald specificeret (bekræftet → princip-5-læsningen; afkræftet → fortrydelses-mekanismen K-6 ac 10). "Holdt mod låste docs" retter princip 5-noten fra falsk Mathias-attribution til "afledt af M-29.5, bekræftes af Mathias i fremlæggelsen". Det opfylder dæknings-regel (c). MEN jf. diskrepans-noten: markeringen bærer lukningen alene — emne-bindingen af M-29.5 er fortsat uverificerbar i ledgeren, og lukningen er BETINGET af at spørgsmålet faktisk stilles og svaret appendes før upload.
- **FUND-3 (type-krav på gruppen) — LUKKET.** "Gruppe uden navn AFVISES (M-17)" — type-delen fjernet fra ac 3 og fra struktur-listen; "om typen er krævet ved oprettelse afgøres sammen med gruppe/leverandør-identifikationen i plan-fasen" står nu i K-3 HVAD og i plan-fase-listen. Residual (ikke fund): formuleringen "den bærer §1.12's type-felt" asserterer stadig at GRUPPEN bærer feltet — hvis identifikationen ender med to entiteter, kan feltet høre hjemme på leverandøren; læses som del af samme plan-fase-afgørelse.
- **FUND-4 (mindst én stand) — LUKKET som disposition; se særskilt dom nedenfor.**
- **FUND-5 (slutdato-overførslen) — LUKKET.** Påstanden er om-funderet: "Koblingen er til/fra uden slutdato (M-12 … M-17 …)" — til/fra-modellen bærer den permissive ac ("AFVISES IKKE"), og M-30.4 bruges nu kun til det den faktisk siger ("hvad menes der med aftaler?" → dateret aftale-objekt er ikke hans model) med eksplicit disclaimer: "hans ord om slutdato dér gælder lokationer, ikke koblingen". Overrækket er væk.
- **FUND-6 (enhed=dage vs M-7) — LUKKET.** Supersessionen er nu eksplicit: "M-7 er den tidligere parafrase af M-25.2 og afløses af de ordrette ord". Identifikationen M-7=parafrase-af-M-25 er efterprøvet og holder ledger-internt: M-7's tre registrerede svar (status · cooldown · migration, 2/9, relæ fra mathias-78, markeret DELVIS PARAFRASE) mapper 1:1 til M-25's punkter 1, 2 og 4 (samme dag, samme kanal, verbatim). Ordret ord vinder over parafrase — korrekt lukning.
- **FUND-7 (under-stande) — LUKKET.** V2 vælger mit forslags mulighed 1: "standen er kædens blad — under-stande findes ikke (kræver nyt Mathias-ord)" (M-18), struktur-listen forbyder under-stande, plan-fase-mulighed fjernet. Stadig en læsning af M-18 — men restriktiv (leverer mindre, ikke mere; udvidelse kræver nyt Mathias-ord = sikker fejl-retning), kilde-markeret og præcis den lukning audit-fundet anviste. Ikke nyt fund.
- **FUND-8 (deaktiveres/udfases) — LUKKET.** Ac 5 beholder det princip-bårne sletnings-forbud (princip 9 + §11) og flytter "hvordan en gruppe tages ud af brug" eksplicit til plan-fase (også tilføjet plan-fase-listen).
- **FC-1 ("aftaler laves pr. lokation") — LUKKET.** Frasen er væk begge steder; Grundlag er omskrevet til ordrette citater med M-id (alle 14 citater dér er efterprøvet mod ledgeren — de matcher, elisioner markeret med "…"); K-3 citerer nu M-27c ordret; slut-sektionen erstattet med "Ingen parafrase i anførselstegn". Hygiejne-noten er også lukket med: brødtekst-citaterne står nu ordret med bevarede stavefejl ("lokaitoner beholder…", "den skal væres åben", "vi bevære den historikse data").
- **FC-2 ("(Mathias 2026-09-03)" på afledt sætning) — LUKKET.** K-4 ac 9 / K-6 ac 9 deklarerer nu afledningen: "(afledt: følger af M-14 — frakoblingen sker fra lokationen — og M-19 — genåbning arver, hvilket forudsætter intakt gruppe-kobling)". Slutningen er logisk tæt nok til deklareret-afledning frem for bekræftelses-markering.

### Dom over FUND-4-dispositionen (mindst én stand — ikke løftet til spørgsmål)

**Forsvarligt — jeg fastholder IKKE fundet som blokerende.** Efter bogstaven er dæknings-reglen opfyldt: kravet bæres nu af M-17's ordrette ord ("en lokation har minimum 1 stand"), og M-18's forklaring vises ved siden af i selve krav-teksten ("M-18 forklarer ordet som ejerkæden") — læseren, inkl. Mathias ved fremlæggelsen, ser begge ord side om side; håndhævelses-mekanikken er i plan-fase. Det er ikke længere en skjult afledning.

Men jeg giver en anbefaling med (ikke-blokerende): risikoen er nu INVERTERET — ikke falsk-grøn, men en hardkodet invariant Mathias måske ikke mente (M-18 omlæste netop den frase, og pr. K-9 kan et strukturelt forbud ikke slås fra i UI bagefter). Fremlæggelsen bærer allerede 2 bekræftelses-spørgsmål; et tredje ja/nej koster nul: "Skal det være umuligt at oprette en lokation uden mindst én stand? ja/nej". Tag det med.

### Nye ubekræftede afledninger introduceret af rettelserne

**Ingen.** Tværtimod flytter v2 to kilder IND i det verificerbare: K-1's attribution-påstand hviler nu på forretningsforstaaelse §3 + §14 (citatet "ingen parallel attribution" findes ordret i §14) i stedet for alene §2.7.1, og K-2 ac 4's dags-granularitet ("på samme dag") er erstattet med M-29's eget ord ("samtidig") — det lukker også to punkter fra runde 1's verifikations-hul-liste.

**Verifikations-grænsen (uændret, jagtes ikke herfra):** forfatteren angiver at masterplan-citaterne uden for §1.12-uddraget er holdt mod fuld masterplan; det kan ikke efterprøves i dette dir. V2 TILFØJER tre henvisninger inden for samme grænse — K-5's "§2.7.1 (cooldown-trigger ved booking)", K-6 ac 10's citat af masterplan "Fortrydelses-mekanisme, T9-omstart-rammen pkt. 13-14", og K-8's "fundamentets audit-trigger (recon bøtte 1)" (recon.md ligger heller ikke i dit/mit dir). Alle tre er nu i det mindste KONKRET citerede i stedet for bare paragraf-numre — men de hører til samme fold-ind-verifikation.

### Konklusion re-audit: REN — betinget

Alle 10 fund er reelt lukket i v2 (10/10 LUKKET, 0 nye fund). REN er betinget af tre udeståender, som alle allerede er synlige i udkastet eller denne audit:
1. De to **[bekræftes af Mathias]**-markeringer (K-1 M-24 "client" · K-5 ac 3 straks-virkning) SKAL stilles i fremlæggelsen og svarene appendes til ledgeren FØR upload — markeringerne opfylder regel (c), men kravet er først Mathias-sandt når svarene ligger der. Anbefalet tredje spørgsmål: mindst-én-stand (se FUND-4-dommen).
2. Ledger-diskrepansen: Q1-Q5-referenterne til M-29 er annonceret men findes ikke i mathias-ord.md i dette dir — leveres eller trækkes tilbage.
3. Verifikations-grænsen mod fuld masterplan/recon står uændret og hører til fold-ind-runden.

**Tillæg (efter ledger-udskiftning til blob dba23366, driver-fejlen erkendt — stagede fra commit før Q1-Q5-appendet):**
Q1-Q5-referenterne står nu i filen (ny sektion, korrekt mærket "IKKE Mathias-ord"), og semantikken matcher M-29's fem svar-punkter 1:1: Q1 (flere klienters tilladelse samtidig) ↔ M-29.1 (flere klienter pr. lokation, maks 1 pr. stand) · Q2 (tilladelse på nedlagt) ↔ M-29.2 "forstår ikke" → omformuleret → M-30.2 · Q3 (butik vs. stand-plads) ↔ M-29.3 "se svar 1" · Q4 (slutdato) ↔ M-29.4 "forstår ikke" → omformuleret → M-30.4 · **Q5 (hvileperiode-ændring: "godkendelse / direkte") ↔ M-29.5 "styres i retigheder" — emne-bindingen er hermed LUKKET ad ledger-vejen; betingelse 2 bortfalder.** Nuance der består: Q5 stillede et binært valg, og "styres i retigheder" vælger ikke ordret en gren — så [bekræftes af Mathias]-markeringen for straks-virkning i K-5 ac 3 forbliver korrekt og skal stadig stilles (betingelse 1 består); Q5's kontekst styrker dog læsningen væsentligt (Mathias fik at vide at udkastet krævede godkendelses-livscyklus og svarede med rettigheder i stedet). To rest-noter: (a) v2-udkastet pinner stadig ledgeren @ 3aad84d1 — re-pin til dba23366 hører til den endelige version ved fold-ind af de 2 spørgsmålssvar; (b) lille hygiejne-flag: referent-sektionens slutlinje påstår at M-30's referenter "står verbatim i M-30-rækkens kontekst-kolonne", men kolonnen indeholder kun emne-glosser ("omformuleret 2 (registrering på nedlagt lokation) + 4 (slutdato)") — enten leveres de omformulerede spørgsmål ordret, eller ordet "verbatim" rettes. **Konklusion uændret: REN — nu betinget af betingelse 1 (de to markerede spørgsmål stilles og appendes før upload) og 3 (verifikations-grænsen), plus re-pin af ledger-blob i den endelige version.**
