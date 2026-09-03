# mathias-ord — lokations-skabelon (append-only ledger)

Regler (plan DEL IV + 2.F): append-only · tidsstemplet · VERBATIM (stavefejl
bevares — `[sic]` markeres ikke; parafrase deklareres eksplicit) · committes af
driveren ved hvert ord · krav/plan CITERER ord-id (K-n → M-n). Et ord uden
ledger-entry kan ikke bære et krav.

| id | tid (ca.) | kanal | ord | kontekst |
|---|---|---|---|---|
| M-1 | 2026-08-13 | driver-session (denne) | »qwers trin 10b« | Fase 0-åbning af pakken (verbatim, hans terminal) |
| M-2 | 2026-08-13 | relæ fra review-session | »Der skal kun laves recon på alt hvad der har med den åbnede pakke (trin 10b) at gøre.« | → flade_filter/pakke-scope som struktur (7c08e4c) |
| M-3 | 2026-08-13 | relæ fra review-session | »Vi skal have en hel klar struktur i selve workflowet.« | → scope-regler i plan-tekst, ikke disciplin (7c08e4c) |
| M-4 | 2026-09-02 | relæ fra review-session | »Recon skal laves for at kunne udforme et krav-dok (hvad skal pakken kunne: mit bord) og derefter plan-dok (hvordan skal pakken kodes).« | → aftager-kæden (recon-1→krav, recon-2→plan) (7c08e4c) |
| M-5 | 2026-09-02 | relæ (PARAFRASE — beslutning, ikke ordret) | Fase 2 (krav) køres i NY Claude Code-terminal-session i stedet for Claude.ai-appen — begrundelse: nemmere kommunikation på tværs af sessioner. | → terminal-kanal + udkast/upload-mekanik (a9403eb) |
| M-6 | 2026-09-02 | relæ fra review-session | »Det er vigtigt at jeg bliver præsenteret for krav-doc'en inden ok, og at den står overskueligt og i mit sprog.« | → fremlæggelses-pligt (7f07068) |
| M-7 | 2026-09-02 | relæ fra mathias-78 (DELVIS PARAFRASE) | Dom: de 4 forretnings-spørgsmål var »stadig ikke helt skarpe«. Registrerede svar: status = aktiv·dvale·nedlagt, kun aktiv bookbar · cooldown-enhed = UI-konfig · migration = udskudt. | → form-krav til spørgsmål (1415b26) |
| M-8 | 2026-09-03 | relæ fra mathias-78 | »Jeg ved også at Codex har fået nyere versioner. Sikr at vi altid bruger den nyeste.« | → pre-flight altid-nyeste (b7534fc) |
| M-9 | 2026-09-03 | relæ fra mathias-78 | »Vi retter workflowet mens vi bygger denne pakke.« | → A/B/L-forankringsprogrammet (denne serie commits) |
| M-10 | 2026-09-03 | relæ fra mathias-78 | »Du skal ikke bruge krav-vinduet til at lave rettelserne.« | → rolle-sessioner implementerer aldrig mekanik (L-regel, 2.G) |
| M-11 | 2026-09-03 før 18:01 | mathias-df (direkte, verbatim) | »workflow-rolle: claude-ai — krav-fasen for pakken lokations-skabelon (FORTSÆTTELSE). Læs og følg scripts/v5/roller/claude-ai.md. Binding: branch claude/workflow-implementeringsplan · recon @ afcf4080a6c3619462eb9e53df10f49495e19abf (recon/recon.md) · krav-udkast @ blob cae458321e9faa36a19cfa530a9f6672155065d4 (plan-build/lokations-skabelon/krav-udkast.md — committet, fremlagt, alle mine svar indarbejdet) Status: fremlæggelsen er leveret; mit næste ord er rettelser eller `krav upload`.« | sessions-åbning af krav-fortsættelsen |
| M-12 | 2026-09-03 18:01-18:08 | mathias-df (direkte, verbatim) | »altså klienter skal altid kunne kobles på og fra på de enkelte lokaitoner« | svar på afledt punkt om nedlæggelse/genåbning |
| M-13 | 2026-09-03 18:01-18:08 | mathias-df (direkte, verbatim) | »nej - men det er vigtigt vi bevære den historikse data« | svar på: »Bilka Hundige er nedlagt. Må I koble Tryg på butikken mens den er nedlagt? ja/nej« |
| M-14 | 2026-09-03 18:08-18:12 | mathias-df (direkte, verbatim) | »altså klienter kobles automatisk fra lokationer når den nedlægges men lokaitoner beholder de oprettede stande« | korrektion af læsningen »ingen automatik ved nedlæggelse« |
| M-15 | 2026-09-03 18:12-18:16 | mathias-df (direkte, verbatim) | »krav upload« | upload-ordet → commit 727ba0b (krav-blob b01d85fd) |
| M-16 | 2026-09-03 efter 18:16 | mathias-df (direkte, verbatim) | »præsenter krav for mig« | → fremlæggelse-1 (687a99f) |

## Afventer verbatim (må kun leveres af den session der modtog dem)

Fra mathias-78 (modtaget dér 2026-09-02/03, hidtil kun som parafrase):
de 7 svar fra spørgerunden — »stande-model«-svaret · »forstår ikke« ×2 ·
»styres i retigheder« · »den skal væres åben« · »hvad menes der med aftaler? …«
(+ fuld kontekst pr. svar). Tilføjes som M-23+ når de leveres ordret (M-17..M-22 = runde 2 nedenfor).

## Runde 2 (appendet af driveren 2026-09-03 — leveret direkte i mathias-df)

| id | tid (ca.) | kanal | ord | kontekst |
|---|---|---|---|---|
| M-17 | 2026-09-03, før 49d92e0 | mathias-df (direkte, verbatim) | »2. en lokation har minimum 1 stand 3. forstår ikke hvad der menes. loaktioner ejes af en gruppe: en gruppe oprettes i ui. en gruppe oprettes med navn og der kobles klienter på gruppen. disse klienter arver lokationerne og dermed kan loaktion kun have klienter som der er i gruppen. loaktioner kan godt fravælge klienter som gruppen har.« | svar på fremlæggelse-1 pkt. 2+3 → GRUPPE-MODELLEN (vender K-3's kæde-forbud) |
| M-18 | 2026-09-03, før 49d92e0 | mathias-df (direkte, verbatim) | »altså med minimum en stand menes der at gruppe ejer lokation og lokation ejer stand« | ejerkæden gruppe→lokation→stand |
| M-19 | 2026-09-03, før 95b2ed6 | mathias-df (direkte, verbatim) | »ja« | svar på: »Bilka Hundige nedlægges og genåbnes et år senere. Er Coop-gruppens klienter automatisk tilbage på butikken ved genåbning, eller skal de vælges til igen? Svar: automatisk / vælges til.« — læst som: automatisk tilbage |
| M-20 | 2026-09-03, efter 95b2ed6 | mathias-df (direkte, verbatim) | »præsenter krav for mig« | → fremlæggelse runde 2 (i chat; fil-reglen nåede sessionen efter) |
| M-21 | 2026-09-03, før 7fae51e | mathias-df (direkte, verbatim) | »5. kan hvis antal hvile dage er valgt i ui« | svar på fremlæggelse runde 2 pkt. 5 → auto-hvile kun ved valgt antal hviledage (UI-konfig) |
| M-22 | 2026-09-03, ca. 18:50 | mathias-df (direkte, verbatim) | »krav upload« | runde 2-upload-ord — udkast-blob 4513a0de @ 7fae51e; upload afventer fresh-eyes-audit (B1) + ledger-citater (fold-ind-runden) |

## Spørgerunden 2026-09-02/03 (appendet af driveren — leveret verbatim af mathias-78; kun rækkefølge kendt, ikke klokkeslæt)

| id | tid | kanal | ord | kontekst |
|---|---|---|---|---|
| M-23 | 2026-09-02 | mathias-78 (direkte, verbatim) | »Det står i logikker at alt skal kunne styres i ui. Dermed skal det være muligt at oprette en lokaition i ui« | uopfordret krav-input (dedupér mod krav-dokkens Mathias-ord-sektion) |
| M-24 | 2026-09-02 | mathias-78 (direkte, verbatim) | »Der er selvfølgelgi noget der skal være hardkodet. eksempelvis at en loaktion skal have et navn og en client. men hvilkvet navn og hvilken client styres i ui« | præcisering af M-23 → struktur/værdi-skellet (UMULIGT vs KONFIGURERBART) |
| M-25 | 2026-09-02 | mathias-78 (direkte, verbatim) | »tjek op på spørgsmål  1.  aktiv · dvale · nedlagt: kan kun bookes i aktiv 2. periode styres i ui 3. forstår ikke 4. dette importeres senere« | svar på de 4 forretnings-spørgsmål (status · cooldown · tilladelse · migration) |
| M-26 | 2026-09-02 | mathias-78 (direkte, verbatim) | »nej tjek op. synes stadig ikke de er helt skarpe« | WORKFLOW-DOM (ikke krav-stof) — dom over spørgsmåls-kvalitet → form-kravene (1415b26); til retrospektiv/L-log |
| M-27 | 2026-09-02 | mathias-78 (direkte, verbatim) | »a ja, så længe den bookede data er efter dvale b nej, men man skal kunne stoppe dvaleperioden og dermed åbne lokationen i ui. c vi booker selv de enkelte lokationer men hver lokation har en gruppe. eks brugsen er i gruppen coop. et center kan være under dansk shopping centrer. så gruppe ejer lokationen« | svar på omformulerede A (tilladelse under dvale + genåbning) · B (booking før hvile-slut) · C (kæde-aftale) — FØRSTE gruppe-ord |
| M-28 | 2026-09-02 | mathias-78 (direkte, verbatim) | »en nedlagt skal kunne genåbnes« | svar på rest-spørgsmålet: nedlagt = endestation? |
| M-29 | 2026-09-03 | mathias-78 (direkte, verbatim) | »1. hvis vi skal gøre det korrekt så skal det bygges op med at alle lokationer ejes af en gruppe (eks. coop) og at der en lokation kan oprettes flere stande. derfor kan deres godt være flere klienter på en lokation samtidig men der kan maks være 1 klient pr stand - 2 forstår ikke - 3 se svar 1. - 4 forstår ikke - 5 styres i retigheder« | svar på de 5 fresh-eyes-spørgsmål → gruppe-ejerskab + MAKS 1 KLIENT PR. STAND |
| M-30 | 2026-09-03 | mathias-78 (direkte, verbatim) | »2. den skal væres åben - 4 hvad menes der med aftaler? lokationer har ingen slutdato før vi deaktivere den/nedlægger den« | svar på omformuleret 2 (registrering på nedlagt lokation) + 4 (slutdato) |

## Referenter (IKKE Mathias-ord — sessions-spørgsmålene M-29 besvarede; leveret verbatim af mathias-df der stillede dem)

M-29 svarer på disse fem (relæet til Mathias via mathias-78; R4-konteksten i M-29-rækken viser formen han så):
- Q1: »Flere klienter på samme sted. Tryg har tilladelse i Bilka Hundige. Må Alka også få tilladelse dér i samme periode? Svar: ja / nej. Udkastet siger ja. Anbefaling: ja, eksklusivitet er en aftalesag, ikke en systemregel.«
- Q2: »Tilladelse på nedlagt lokation. Bilka Hundige er nedlagt. Må I oprette en tilladelse til Tryg dér? Svar: ja / nej. Udkastet er tavst, så byggeren ville vælge. Anbefaling: nej, genåbn først. Det var hale-spørgsmålet der blev tabt den 2/9.«
- Q3: »Hele butikken eller én stand-plads. Gælder Trygs tilladelse i Bilka Hundige hele butikken, eller kan den gælde én bestemt stand-plads? Svar: butikken / stand-plads. Udkastet er uklart. Anbefaling: butikken, stand-pladser arver.«
- Q4: »Aftale uden slutdato. Kan Trygs tilladelse i Bilka Hundige være "indtil videre" uden slutdato? Svar: ja / nej. Udkastet siger ja. Anbefaling: ja.«
- Q5: »Ændring af hvileperiode. Hvileperioden for Bilka Hundige ændres fra 14 til 21 dage. Skal en anden godkende først, eller må rettighedshaveren ændre direkte med audit? Svar: godkendelse / direkte. Udkastet kræver godkendelses-livscyklus. Anbefaling: direkte, det er forretningskonfig, ikke datahåndtering.«

M-30's referenter (mathias-78's omformulerede 2+4, leveret verbatim af mathias-78 sammen med R5):
- Q-R5-2: »Bilka Hundige er nedlagt. Skal I kunne registrere en aftale om at en klient skal stå der (fx klar til en genåbning) — eller skal lokationen genåbnes først, før aftalen kan laves? (må gerne / genåbn først)«
- Q-R5-4: »Kan en aftale løbe 'indtil videre' — fx Tryg i Bilka Hundige uden slutdato, indtil én af jer opsiger — eller skal enhver aftale have en slutdato? (indtil videre ok / altid slutdato)«
