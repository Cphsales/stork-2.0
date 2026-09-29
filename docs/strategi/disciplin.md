# Stork 2.0 — Arbejds-disciplin

Ét hjem for hvordan vi arbejder sammen: aktører, roller, flow, gates, disciplin. Mathias styrer tanker, funktioner, logik og vision; AI'erne (Claude.ai, Code, Codex) bygger. Vi bygger ovenpå eksisterende kode, ikke nyt hver gang.

> **Dette er det eneste rolle- og proces-hjem.** Filen *beskriver* workflowet; CI og hooks *håndhæver* det. Rolleteksterne (`scripts/v5/roller/`) beskriver hver rolles opgave, input og output og henviser til afsnittene her; de gentager ikke reglerne. Hver regel står ét sted. Mathias' regler står ordret kun her. Ved konflikt om systemets vision vinder vision-dokumentet; ved spørgsmål om hvordan vi arbejder vinder denne fil. Rangordenen mellem Mathias' dokumenter står ét sted: §8.

**Målet (Mathias, M-54, uddrag ordret):** »Vi skal have er workflow som sikre mathias sandhed (forretningsforstaaelse, vision-og-principper og masterplan) = krav = plan = byg.«

---

## §1 Aktører og roller

| Aktør / rolle | Rolle |
| --- | --- |
| **Mathias** | Tanker, funktioner, logik, vision. Eneste beslutningstager. Giver de tre godkendelses-ord: `krav ok` · `plan ok` · `slut ok`. Vælger masterplan-trinnet der åbnes som pakke |
| **claude-ai-rollen** | Skriver kravet i dialog med Mathias, i hans sprog (trin 1). Læser slut-rapporten mod kravet og hans dokumenter og skriver fremlæggelsen for ham (trin 4). Formulerer rettelser til hans dokumenter efter §8.1. Kører i en Claude Code-session (M-5). Det er den aktør, de ældre regler i denne fil kalder »Claude.ai« |
| **Code — planner og bygger** | Én rolle i to trin: skriver den korte plan og afgør teknikken (trin 2); bygger efter planen, vælger det planen ikke afgør og skriver valgene i slut-rapporten, som den også skriver (trin 3). Låsene (`plan ok` og testlåsen) holder plan og byg adskilt |
| **Codex** | Slår op hvad Mathias' dokumenter og koden allerede siger om masterplan-trinnet, før krav-dialogen, og holder kravet op mod dokumenterne begge veje (trin 1). Læser planen og genlæser den ene rettelse (trin 2). Skriver testene og slutprøven ud fra kravet og ejer manifestet, testindekset, testvalg-filen og slutprøven (trin 3). Gennemser den samlede ændring én gang (trin 3). Afgør om et trin der ikke lukker, skyldes indhold eller teknik (§3.4). Skriver aldrig produktkode |
| **code-reviewer** | Dømmer at testene dækker hvert krav (trin 3) |
| **Fabrikken** | Den session Mathias taler med. Som orkestrator starter den de øvrige rollers sessioner, overdrager mellem dem og merger pakke-PR'en på betingelserne i §6; som orkestrator ændrer den aldrig indhold og taler aldrig på Mathias' vegne (§9.5). I trin 1 og 4 bærer den claude-ai-rollen (§1 »Sessioner«) |
| **CI** | Kører byggetjekket (§2 trin 3) og slutdommen. Afviser at pakke-kode merges uden `slut ok` i ledgeren (§6) |

**Sessioner:** Mathias taler med én session: fabrikken. Den bærer claude-ai-rollen i trin 1 og 4 (den læser rolleteksten, når trinnet begynder, og laver ingen workflow-mekanik, mens den bærer rollen) og fremlægger ½-siden i trin 2. De øvrige roller — Code — planner og bygger, Codex og code-reviewer — kører som friske sessioner uden for chatten; fabrikken starter dem med rolleteksten og bringer deres resultater videre som filer (§3.5, §9.5). Codex kaldes kun gennem `scripts/v5/codex-run.sh` (§6). Mathias starter ingen sessioner.

**Ingen AI må:** træffe forretnings-beslutninger på Mathias' vegne · skrive "afgørelser"/"ramme-låsninger" som AI · fortolke retning som specifikation uden bekræftelse · designe datamodel uden Mathias-input (Claude.ai) · skrive produktkode (Codex — Codex skriver kun testene) · påstå repo-/DB-tilstand uden at have verificeret den (alle).

At verificere er at have læst den faktiske database og kode i denne session (funktions-definitioner, kolonner og constraints, policies, grants), før man skriver noget om dem. Ingen gæt, ingen cached state.

**Spørg ved uklarhed — antag ALDRIG.** En aktør der ikke forstår en del af krav eller plan, eller finder at den skal uddybes, HALTER og spørger. Den antager aldrig. Forretningsspørgsmål går til Mathias (i den form §2 trin 1 kræver); teknisk uklarhed går til den relevante ejer. Der bygges ikke videre, før spørgsmålet er besvaret. Bygget oven på en antaget tolkning = FAIL.

**Mathias-suverænitet:** Mathias kan til enhver tid — også midt i en igangværende pakke/build — stoppe, modsige eller ændre retning. Alle workflowets låse (formåls-immutabilitet §3.0, `krav ok`- og `plan ok`-låsene, testlåsen) binder AI'erne, aldrig Mathias. Hans ord gælder straks; kravet og planen opdateres bagefter ad normal vej som konsekvens, aldrig som betingelse.

**Mathias' bord er ikke kode.** Det er udelukkende hvad systemet skal kunne — ikke hvordan/kode. Alt der er mekanik, afgøres af rollerne. Til Mathias går kun spørgsmål der består bord-testen (§2 trin 1).

---

## §2 Workflow — 4 trin

Alle pakker kører fuld disciplin. Ingen skala-distinktion.

**Pakke-åbning:** Mathias vælger masterplan-trinnet og åbner pakken i chatten. Én pakke ad gangen. Fabrikken skriver pakkens navn i `launch/launch.json`; byggetjekket og slutdommen læser den.

| Trin | Hvad sker | Hvem dømmer | Mathias |
| --- | --- | --- | --- |
| **1. Krav** | Codex slår først op, hvad Mathias' dokumenter og koden allerede siger om trinnet, så der kun spørges om det de ikke besvarer. Dialog med Mathias. Kravet skrives i hans sprog, og hver sætning peger på hans ord (ledgeren) eller hans dokumenter. Codex holder udkastet op mod forretningsforståelsen, visionen og masterplanen — begge veje. Afvigelse = spørgsmål til Mathias | Codex | **`krav ok`** |
| **2. Plan** | Kort plan. Den indeholder kun det testene og kravet bruger, de valg Mathias kan mærke i forretningen, afvigelser fra masterplanen og det han skal orienteres om (fx tidszone, persondata). Planen disponerer også den tekniske gæld (G/H) der rammer pakken. Byggeren vælger resten og skriver det i slut-rapporten | Codex (dommen i `codex-plan.md`) | ½ side → **`plan ok`** |
| **3. Byg** | Codex skriver testene ud fra kravet. Code-reviewer dømmer at testene dækker hvert krav. Planen låses ved `plan ok`. Testene, manifestet, testindekset og filen der vælger hvilke tests der køres, låses ved grøn dækningsdom (dommen binder deres blobs). CI's byggetjek kører testene og mutant-prøven og afviser byggeriet hvis noget låst er ændret. Codex gennemser den samlede ændring én gang | CI + code-reviewer + Codex | — |
| **4. Slut** | Slutprøve gennem brugernes indgange på testdatabasen med realistiske data — på driftsdata kun når pakken læser data der allerede findes (fx løn). Kort rapport i Mathias' sprog: scenarier, resultat, om visionen holder, og hvad der skal rettes i hans dokumenter. Med `slut ok` rettes de | CI + claude-ai-rollen | **`slut ok`** = det må i drift (CI kræver ordet i ledgeren før merge) |

**Godkendelses-ordene** er de tre ord ovenfor. Den rolle der taler med Mathias, skriver ordet: claude-ai-rollen ved `krav ok`, fabrikken ved `plan ok`, claude-ai-rollen ved `slut ok`. En række i ledgeren rummer kun hans ord ordret, datoen og hvad han svarede på eller godkendte (fil og blob) — aldrig en tolkning. Hvert ord står i ledgeren (`docs/sandhed/mathias-ord.md`) med nummer og blob-OID for præcis den fil Mathias så:
- `krav ok` → krav-filen (hele filen er fremlæggelsen)
- `plan ok` → `plan.md` (afsnittet »Mathias' ½ side« er fremlæggelsen)
- `slut ok` → `slut-rapport.md` (afsnittet »Fremlæggelse for Mathias« er fremlæggelsen) og den prøvede kodeversion, som rapporten angiver (commit)

**Chat = fil:** en fremlæggelse er filens tekst gengivet ordret i chatten, læst fra filen og ikke genskrevet (§3.10). Den der beder om ordet, kontrollerer først at den gengivne tekst er filens tekst. Ændres filen, fremlægges den igen, før ordet bedes om. Ledgeren er eneste kilde til ordene: hooken, byggetjekket og samle-tjekket læser den, og der findes ingen særskilte godkendelses-filer. Mathias giver ordet i chatten og rører ikke GitHub (§6).

**To regler:**
1. **Teknik eller indhold:** reglen står i §3.4.
2. **Workflowet ændres kun mellem pakker og kun med Mathias' `ok` til en workflow-plan**, der indeholder den ordrette tekst. Vagten afviser en ændring af denne fil eller rolleteksterne, som ikke har hans ord i ledgeren med filen og den nye blob (§8.1).

### Trin 1 — Krav

Et krav-dokument er **Mathias' forretningsgange** for én masterplan-pakke — ikke teknik (»plan er kode og krav er forretningsgange«, M-42). Krav-dialogen er kontrolposten og automatiseres ALDRIG.

- Mathias' tanker om hvad pakken skal levere (forretning + funktion + logik).
- Ingen tabel-navne/kolonner/RPC-signaturer (Code's bord i plan-fasen).
- Hver påstand peges på Mathias-ord — ingen kilde: spørg, skriv ikke. Ingen fabrikation. Et ord uden ledger-entry kan ikke bære et krav.
- Kravet skrives efter skabelonen i §10.1. claude-ai-rollen skriver udkastet i `plan-build/<pakke>/krav-udkast.md`.
- **Kravet flyttes, det kopieres ikke:** efter `krav ok` flytter claude-ai-rollen udkastet med `git mv` til `docs/sandhed/krav/<pakke>-krav.md`. Hooken tjekker, at filens blob er den, ledgeren binder til `krav ok`.
- **AI i `docs/sandhed/`:** AI skriver kun tre ting dér: det flyttede krav, nye poster i ledgeren (ordret, append-only) og rækker i ordbogen (§4). Ingen anden AI-skrivning i `docs/sandhed/` er tilladt.

**For-tjek før første spørgsmål:** før claude-ai-rollen stiller Mathias sit første spørgsmål, slår Codex op på pakkens masterplan-trin, hvad forretningsforstaaelse, vision-og-principper, masterplanen, ledgeren og den eksisterende kode allerede afgør. Rollen bruger for-tjekket i afled-før-spørg. Kildetjekket af udkastet kommer bagefter (nedenfor).

De fem regler nedenfor (afled-før-spørg, bord-testen, ét-skridts-reglen, spørgsmålets form, antag aldrig) gælder **hvert spørgsmål til Mathias i alle trin**, ikke kun i krav-trinnet. De står ordret som i rolleteksten fra september; de få ord workflowet ændrer, står i Del B.3.

**Afled-før-spørg:** elicitér FØRST fra kilderne, SÅ fra Mathias. Før du stiller ham et åbent spørgsmål, SKAL du have undersøgt hans allerede-nedskrevne holdninger — de låste docs (vision-og-principper · forretningsforstaaelse) + masterplanens afgørelser + hvad eksisterende kode allerede afgør (som Codex' for-tjek melder det) — og præsentere det AFLEDTE svar til bekræftelse: _"din sandhed siger X (citat) → foreslået svar Y — korrekt?"_ Kilderne omfatter **MØNSTER-ANALOGI**, ikke kun ordret tekst: en regel han har låst ét sted overføres som forslag til det analoge sted. Kun punkter kilderne reelt IKKE besvarer må stå som åbne spørgsmål. Grænsen står fast: et afledt svar er et FORSLAG med citeret kilde — Mathias' bekræftelse er sandheden (antag-aldrig gælder uændret; et ubekræftet afledt svar må ALDRIG størkne til et acceptkriterie).

**BORD-TESTEN (kør den på HVERT spørgsmål før du stiller det):** (a) kan KUN Mathias svare — er det forretnings-sandhed/fakta kun han kender? OG (b) kan han svare UDEN teknik-viden — uden at skulle forholde sig til tabeller/felter/flows/enums som model? OG (c) **MATERIALITET (M-33):** ændrer svaret hvad der bygges i DETTE trin, og skal det afgøres NU? Svar der først bliver materielle nedstrøms → nedstrøms-liste (»afgøres ved trin X«) med eksplicit default — INGEN spørgsmål. **Fejler bare ét af de tre, er det IKKE et krav-spørgsmål.**

**ÉT-SKRIDTS-REGLEN (M-33, 2026-09-08):** følger konsekvensen af Mathias' ORDRETTE ord (ledgeren) i ét skridt, er det en **BEKRÆFTELSE** i fremlæggelsen (»dit ord siger X (M-n) → kravet siger Y — står medmindre du siger stop«, batchet, ét samlet ok) — ALDRIG et spørgsmål. Kun ægte åbne punkter (intet M-ord bærer dem i ét skridt) går videre som spørgsmål. INTET loft/takt-budget på spørgsmål (Mathias afviste værn 3) — værnet er kvalitativt, ikke et tal. Teknik-/model-forks noteres i stedet EKSPLICIT som **plan-fase-afgørelser**: planner afgør inden for kravets ramme, Codex læser planen, og Mathias' plan OK dækker dem. De forsvinder ALDRIG tavst — de flytter bord, synligt, på kravets »Flyttet til planen«-liste.

**FORM-KRAV til spørgsmål der BESTÅR bord-testen (skærpet efter M-26 »synes stadig ikke de er helt skarpe«):**
1. **ÉN beslutning pr. spørgsmål.** Del-spørgsmål må ALDRIG gemmes i en parentes/hale (de bliver svaret forbi) — de får eget nummer eller venter.
2. **SCENARIE-FORM:** stil spørgsmålet som en konkret situation fra HANS forretning med navngivne klienter/steder ("Tryg i Bilka Hundige…"), aldrig meta-sprog ("hvad repræsenterer X kommercielt?" forstår han med rette ikke).
3. **SVARBART MED ÉT ORD:** giv svarmulighederne (ja/nej eller 2-3 navngivne udfald) + evt. din anbefaling. Svarer han "forstår ikke" → spørgsmålet HALTER og omformuleres — gå ALDRIG videre uden svar.
4. **Værdi-tjek før afsendelse:** spørger du om en VÆRDI (enhed, længde, sats)? Så er svaret næsten altid "UI-konfig" — bortfald, ikke spørgsmål.

**Antag ALDRIG Mathias' intention.** Et negativ eller en regel du "udfylder på hans vegne" fordi det virker oplagt, er en forretnings-sandhed opfundet uden ejeren. Uklar eller uudtalt intention → HALT + spørg ham, aldrig et gæt der størkner til et acceptkriterie.

**Kildetjekket af udkastet:** Codex holder udkastet op mod Mathias' dokumenter (forretningsforstaaelse, vision-og-principper, masterplanen), ledgeren og koden — begge veje:
1. Hver krav-sætning har en kilde, og kilden siger det samme.
2. Hvert punkt i masterplan-trinnet står i kravet eller under »Ikke i scope«, og de negativer masterplanen sætter for trinnet, står som negativer i kravet.

Påstår kravet noget om det byggede, holdes det mod koden. Den tekniske gæld (G/H) hører til planen (trin 2). Nettet er ikke en kilde: web i recon skaber forvirring + nye forkerte sandheder.

**Fremlæggelse og `krav ok`:** Mathias' svar skrives ordret i ledgeren med nummer, og kravet citerer nummeret. Når Codex har holdt udkastet op mod dokumenterne, og resultatet står i kravets afsnit »Holdt mod dine dokumenter«, fremlægges hele kravet i chatten: krav-filens tekst gengivet ordret (»Chat = fil« ovenfor).

**Fremlæggelses-pligt (Mathias 2026-09-02, M-6):** `krav ok` må KUN bedes om EFTER at den KOMPLETTE krav-doc er fremlagt i chatten — overskueligt og i HANS sprog: formål · pr. K-n én linje HVAD + det vigtigste negativ · hvad er UI-styret vs. hardkodet · ikke-i-scope · bekræftelses-linjerne · »afgøres ved trin X«-listen · Codex' kildetjek. En fil-reference eller "udkastet er klar" er IKKE en fremlæggelse. Hver runde der ændrer dokumentet → NY fuld fremlæggelse før ok kan bedes om igen. Han skal kunne signere på det han har LÆST i chatten, ikke på tillid til en fil.

Mathias siger ét ord: `krav ok` (M-34: »godt, nu skal jeg præsenteres for krav doc og efter det kan jeg godkende det. ingen grund til først at godkende upload for derefter at skrive ok det man lige har godkendt.«). Ordet binder kun den tekst han så; siger han ok mens teksten ændres, ser han de ændrede linjer og siger ok igen (sådan skete det 8/9, M-37 → M-38). Ledgeren får ordet + blob-OID for krav-filen. Lad ALDRIG en kildetjek-drevet ændring tavst flytte forretnings-intentionen.

**Kravet ændres kun med et nyt `krav ok`.** Opdager byggeriet at kravet er forkert, går det tilbage til Mathias. Det rettes aldrig tavst.

### Trin 2 — Plan

Planen skrives efter skabelonen i §10.2 af Code — planner og bygger. Den er kort og indeholder kun det testene og kravet bruger. Det der er kode, afgøres her (»plan er kode og krav er forretningsgange«, M-42).

**Spørgereglen i plan-fasen:** Mathias får ingen tekniske spørgsmål. Et spørgsmål i ½-siden er kun et uafklaret forretningsvalg, der består bord-testen (trin 1). Det kravet har flyttet til planen (fx om to af hans begreber er én eller to ting i systemet), afgør planen; det er ikke et spørgsmål. Afviger planen fra hans dokumenter (fx at systemets dag følger UTC, mens dokumenterne peger på dansk kalenderdag), fremlægges afvigelsen i ½-siden, og han godkender den med `plan ok` eller siger stop.

- **Ordbogen arves.** Planen og dermed koden ARVER Mathias' navne fra ordbogen `docs/sandhed/ordbog.md` (én for hele Stork, §4). Tabeller, felter og RPC'er hedder hans ord, ELLER planen mapper dem eksplicit i ordbogen (Mathias-ord ↔ systemnavn). En navne-afvigelse uden ordbogs-entry er et fund i plan-læsningen.
- Punkterne på kravets liste »Flyttet til planen« afgøres her, hver med en begrundelse inden for kravets ramme. De forsvinder aldrig tavst.
- **G/H-opslag:** planen laver et opslag i `docs/teknisk/teknisk-gaeld.md` og `docs/teknisk/huskeliste.md`. Alle åbne G-/H-numre, hvis **Løses-i**/deadline rammer pakkens scope, listes, og hver post tages med eller udskydes med begrundelse. En tom liste skrives eksplicit ("ingen G/H rammer dette scope"). Gælds-listen og huskelisten er de eneste sandheder om G/H; opslaget er reference, ikke kopi.
- **Fundamentet:** planen skal stå på mål med vision og forretningsforstaaelse. Vil en plan ændre det Mathias' dokumenter siger, fremlægges det i ½-siden før `plan ok` (spørgereglen ovenfor), så han kan godkende det eller sige stop. En plan godkendes ikke stående på fundament den modsiger.
- Pakke-størrelse: §3.8.

Codex læser planen og skriver sin dom i `plan-build/<pakke>/codex-plan.md` med planens blob. Retter Code planen, vurderer Codex rettelsen og de krav den berører, og dommen opdateres (§5). Så får Mathias ½ side i sit sprog: afvigelser fra masterplanen, de valg han kan mærke og orienteringerne. ½-siden er et afsnit i `plan.md` og fremlægges ordret. Han svarer **`plan ok`**, og ledgeren binder ordet til ½-sidens tekst og planens blob. Planen ændres aldrig tavst: en rent teknisk rettelse, der ikke ændrer ½-siden, kræver en ny Codex-dom i `codex-plan.md`, ikke et nyt ord fra Mathias; ændres ½-siden, kræver det et nyt `plan ok`.

### Trin 3 — Byg

- **Testene før byg.** Codex skriver testene ud fra kravet og ejer måle-laget: testene, manifestet (`forventnings-manifest.json`), testindekset (`angrebs-spec.json`, der også vælger mutanterne) filen der vælger hvilke tests der køres (`prover.json`) og slutprøven (`slutproeve.json`: scenarier gennem brugernes indgange, facit og de realistiske testdata). Codex må skrive disse filer indtil dækningsdommen er grøn; byggeren må aldrig ændre dem (pre-commit-hooken klassificerer dem som Codex' målelag). Code-reviewer dømmer at testene dækker hvert krav. Hver skrivevej skal have mindst én test gennem hele kæden (§3.3). Den grønne dækningsdom skrives i `plan-build/<pakke>/daekningsdom.json` og binder kravets og planens blob og hele kørselsfladen med blob-OID'er: testene, manifestet, testindekset, `prover.json` og `slutproeve.json`. Dermed er de låst. Domsfilerne er beskyttet på samme måde: kun Codex skriver `codex-plan.md` og `codex-gennemgang.md`, kun code-reviewer skriver `daekningsdom.json`, og fabrikken overfører dem uændret (pre-commit-hooken håndhæver det). Er en låst test teknisk forkert, retter Codex den, og code-reviewer afgiver en ny dækningsdom; ændrer rettelsen forretningsindhold, gælder §3.7. Ændres kravet eller planen, kræves en ny dækningsdom. Byggeren kan køre testene, men ikke ændre dem.
- **Reglerne for testene:**
  - **D10 (M-40):** én meningsfuld dræbt mutant pr. afvisnings-acceptkriterie, når ét værn alene bærer negativet (deklareret med `sole_guard_ref`) — aldrig pr. "konfig-knap". Redundante værn gøres ikke isoleret nødvendige. Gulvet består: ≥1 målrettet dræbt mutant pr. opsætnings-krav.
  - **Testene dækker kravet direkte:** hver test deklarerer hvilke K, acceptkriterier og negativer den dækker (`covers`), og dækningsdommen holder det mod kravet. (D12's opdeling i forudsætnings- og effekt-trin gælder kun pakke 1, hvis manifest bruges som det er.)
  - **Hvad en test er:** offentlig indgang · rigtig database med en rolle uden bypass · hård slut-effekt (række, tilstand, fejlkode). Det gælder også når planen gør et negativ umuligt (constraint, type, RLS): umuligheden bevises gennem den rigtige indgang med en effekt-test — en constraint erstatter aldrig effekt-testen (D13, M-40). En test der kun tjekker en intern hjælpefunktions svar, tæller ikke. Mutanterne dræbes gennem samme effekt-sti.
  - En test uden forventning er tom og tæller som rød. Hvert dækket negativ skal være forsøgt og afvist netop dér.
  - **Vejnings-reglen:** _"tjener testen et led, og ville en reel falsk-grøn slippe UDEN den?"_ Nej → over-test → skriv den ikke.
- **Grøn = reel konsekvens, aldrig påstand.** Der testes ikke for at få grønt: fangsten af fejl er det der afgør om et build er korrekt. »funktioner der kun ser gode ud på papiret er ikke acceptable; de skal virke og være gode.«
- **Byggetjekket** er ét CI-job med fire tjek: (a) testene er grønne · (b) de udpegede mutanter er dræbt · (c) intet låst er ændret (planen, testene, manifestet, testindekset, `prover.json`, `slutproeve.json`) · (d) kravet er det `krav ok` bandt, ½-siden er den `plan ok` bandt, planen er den `codex-plan.md` bandt, og kørselsfladen er den `daekningsdom.json` bandt (blob for blob). Testene i (a) omfatter også alle lukkede pakkers tests, så en ny pakke ikke ødelægger en gammel.
- **Byggeren vælger det planen ikke afgør** og skriver valgene i slut-rapporten. Bygningen er mekanisk dømt af byggetjekket; der er ingen byg-godkendelse hos Mathias.
- **Build-fokus: fokus under build SKAL være build.** Opstår der ændringer under byg, er et større issue gæld (G-nummer, løses KORREKT senere, ikke hurtigt/hacket), og et mindre er et bilag til ændringen. Repo-docs røres ikke under byg; de rettes ved trin 4.
- Afvigelse fra kravet: §3.7. Patch-først: §3.1. Destruktive drops: §3.9.
- Codex gennemser den samlede ændring én gang, før slutprøven (fokus: §9.3), og skriver dommen i `plan-build/<pakke>/codex-gennemgang.md` med merge-dommen på sin egen linje (§6 »Merge«).

### Trin 4 — Slut

- **Top-til-tå: kode = Mathias' sandhed.** Den endelige dom er reel kode kørt mod hans sandhed ved fuld dybde, ikke at ordene/docs findes (doc-grøn ≠ dybde). Derfor kører CI's slutdom slutprøven (`slutproeve.json`) i fuld dybde gennem brugernes indgange: på testdatabasen med realistiske data, og på driftsdata kun når pakken læser data der allerede findes (fx løn).
- Code skriver slut-rapporten efter §10.3 i `plan-build/<pakke>/slut-rapport.md`.
- claude-ai-rollen læser rapporten mod kravet, visionen og forretningsforstaaelse efter §5 »Sådan dømmer alle dommere« og skriver rapportens afsnit »Fremlæggelse for Mathias«. Afsnittet fremlægges ordret.
- **`slut ok`** = pakken må i drift. Ledgeren binder ordet til `slut-rapport.md`'s blob **og** til den prøvede kodeversion: det commit, som slutprøven, Codex' samlede gennemgang og byggetjekket kørte på (rapportens felt »Prøvet kodeversion«). Mellem det commit og det der merges, må kun **afslutningsfilerne** ændres, og hver kontrolleres ét sted: (1) dokumentrettelserne skal have præcis den blob, som rapportens afsnit »Rettelser i Mathias' dokumenter« angiver; (2) ledgerens `slut ok`-post nævner slut-rapportens blob og hvert af Mathias' sandhedsdokumenter der ændres, med den nye blob (vagten, §8.1); (3) ledgeren skal være sit tidligere indhold uændret plus præcis den nye `slut ok`-post; (4) `codex-gennemgang.md` skal nævne det prøvede commit. Rapporten angiver ikke sin egen eller ledgerens blob. Alt andet i repoet skal være uændret. Uden den post kan pakke-PR'en ikke merges (§6). Ændres koden derefter, er slutprøven, gennemgangen, byggetjekket og `slut ok` ugyldige for den nye kode og skal gives på ny. Med samme ord rettes Mathias' dokumenter som rapporten foreslår (ordret nuværende → ny tekst), efter §8.1 — også de poster på kravets liste »Afgøres ved senere trin«, som skrives ind i masterplanen ved deres trin.
- Pakken lukkes efter §4.

---

## §3 Bygge-disciplin

*(§3.2 og §3.6 er udgået: »verificér før du påstår« står i §1, end-to-end-kravet i §3.3.)*

### 3.0 Formåls-immutabilitet

Hver pakke har ét FORMÅL (krav §Formål). Når Mathias har godkendt det, er det **låst** (låsen binder AI'erne, jf. §1 Mathias-suverænitet). Code må ændre den tekniske vej (skrives i slut-rapporten), men **ikke** formålet. Afslører implementation at formålet ikke kan leveres: STOP, eskalér. Et fund fører **aldrig** til at Code ændrer formål, tilføjer features eller omtolker hvad pakken skal levere.

### 3.1 Bevar det eksisterende (patch-først)

Vi bygger ovenpå, ikke nyt. For hver eksisterende funktion, policy eller tabel der ændres, arbejdes der ud fra den NUVÆRENDE definition i databasen. Intet eksisterende gate, kommentar, kolonne eller audit-spor må tabes uden begrundelse. Tab uden begrundelse = `MANGLENDE-EKSISTERENDE-BEVARELSE` (KRITISK). Planen nævner kort hvilke eksisterende objekter pakken ændrer, og hvad der bevares. Selve tjekket (nuværende definition mod ny, linje for linje) sker i gennemgangen af den samlede ændring (trin 3).

Eksisterende kode/build må ikke ændres uden Mathias' tydelige godkendelse — sker det, stop. Godkendelsen er hans `plan ok` til den plan der nævner ændringen. Kræver byggeriet en yderligere ændring i eksisterende kode uden ændret forretningsadfærd, skrives den ind i planen som en teknisk rettelse med Codex' dom (§2 trin 2); ændrer den forretningsadfærd, gælder §3.7.

### 3.3 End-to-end-spor pr. skrivevej

For hver skrive-RPC der ændres eller tilføjes, skal testene dække:
1. GRANT, policy og session-variabler;
2. at SELECT-policy er bred nok til alle legitime læsere;
3. dispatcher-udvidelsen;
4. én eksempel-række gennem hele flowet (UI → handler → RPC → DB → læsning).

**End-to-end-test er leverings-kriterium:** Hver pakke leverer mindst ÉN test gennem ÉT konkret flow (UI/RPC → DB-write → RLS → læsning). Schema-only ("kolonner findes") accepteres ikke.

Code-reviewer tjekker det i dækningsdommen (trin 3).

### 3.4 Når et trin ikke lukker

**Tekniske fejl rettes af bygger og reviewer — Mathias spørges kun om indhold:** når kravet er uklart, modstrider hans dokumenter, eller pakken er for stor.

Lukker et trin ikke efter to rettelser, afgør Codex, om årsagen er indhold. Er den det, får Mathias ét spørgsmål:
- **»Er krav-dok præcist nok?«** — hvis kravet er uklart. Kravet genåbnes med et nyt `krav ok`.
- **»Dit dokument siger X, kravet siger Y — hvilket gælder?«** — hvis kravet modstrider hans dokumenter (§8).
- **»Skal kravet deles i to pakker?«** — hvis kravet selv er for stort til én pakke. (At dele implementeringen i flere trin inden for samme krav er teknik og afgøres af Code, §3.8.)

Konvergerer vi ikke efter to rettelser, er problemet rammen, ikke "prøv igen". Er årsagen teknisk, retter bygger og reviewer den uden at spørge Mathias.

### 3.5 Status mellem sessioner

Status bæres af git-historikken og ledgeren. Der føres ingen særskilt statusfil. En ny session læser ledgeren og pakkens seneste commits FØRST.

Fabrikken starter sessionerne og overdrager mellem dem: den åbner hver rolles session med rolleteksten og de filer rollen skal bruge, og den bringer rollens resultat videre til næste trin som fil (§9.5). Mathias starter ingen sessioner og flytter intet mellem dem (§1 »Sessioner«).

### 3.7 STOP-FOR-CLARIFICATION

Build-afvigelse fra kravet kræver Mathias' udtrykkelige godkendelse. Code beslutter det ikke selv. Bygningen STOPPER, og spørgsmålet stilles i chatten i hans sprog (§2 trin 1's form): hvad kravet siger, hvad byggeriet vil gøre, og hvorfor. Hans svar skrives ordret i ledgeren, og så genoptages bygningen eller et alternativ vælges. FORBUDT: "det er midlertidigt", "min fortolkning".

### 3.8 Pakke-størrelses-grænse

Kræver planen mere end 5 migrationer, deler Code implementeringen i flere trin eller PR'er inden for samme krav. Det er teknik og kommer ikke til Mathias.

### 3.9 Destructive drops kræver preflight (højeste indsats; Stork rører løndata)

`DROP TABLE/COLUMN`, `TRUNCATE`, `DELETE` uden WHERE o.l. kræver:

- **Tom-check:** `count(*) = 0`, eller eksplicit kvittering for antal rows der tabes
- **Reference-check:** ingen FK refererer det droppede (ikke kun CASCADE-fix)
- **Audit-spor:** session-vars `source_type` + `change_reason` sat før operation
- **Rollback-plan:** hvordan operationen rulles tilbage

Pre-cutover (ingen rigtige data): tom-check + audit-spor er minimum. Post-cutover: alle fire er CI-blocker; manglende preflight = review-rejection. Dette er den dyreste fejl-klasse i systemet. *Status: CI-tjekket er ikke bygget endnu (G079). I dag håndhæves reglen i gennemgangen af ændringen; tjekket skal være bygget før cutover.*

### 3.10 Ressource-fordeling (IKKE et kvalitets-kompromis)

Fuld dømmekrafts-pris hvor dømmekraft kræves; mekanik hvor mekanik beviseligt dækker.

- **Akkumulering:** bogførings-/docs-rettelser samles pr. arbejdsblok i én PR — fragmenteret review ser ikke sammenhængen, og hver PR koster en fuld pipeline.
- **Session-skift slår kompression:** ved fase-nulpunkter (alt committet) afsluttes leddet, og en ny session åbnes med ledgeren og git som bro (§3.5). Det er bedre end at presse én session forbi kontekst-budgettet, for dyb kontekst giver stale tal og vane-træk.
- **Ordret-arbejde går aldrig gennem model-kontekst:** flyt/kopiér med fil-operationer (cp, git mv) — en model der "genskriver ordret" er en fejlkilde, ikke en transport.

---

## §4 Bevarelses-disciplin — hvad gemmes, hvad slettes

**Princip:** kun kravet, den godkendte plan (slut-version) og slut-rapporten overlever pakken — **plus ledgeren, som altid bliver**. Ordbogen bliver også: den er fælles for hele Stork. Resten lever i git-history.

**Bevares på main:**
- kravet: `docs/sandhed/krav/<pakke>-krav.md`
- planen: `plan-build/<pakke>/plan.md`
- slut-rapporten: `plan-build/<pakke>/slut-rapport.md`
- målelaget som regressionstest: testene, manifestet, testindekset, `prover.json` og `slutproeve.json` — byggetjekket kører dem ved hver ny pakke
- ledgeren: `docs/sandhed/mathias-ord.md` — én for hele Stork; M-numrene fortsætter på tværs af pakker
- ordbogen: `docs/sandhed/ordbog.md` — én for hele Stork; hver pakke tilføjer sine navne
- in-place-opdateringer af vision, forretningsforstaaelse, masterplan og teknisk gæld.

**Slettes ved pakke-luk:** alt andet i `plan-build/<pakke>/` (arbejdsfiler, udkast, `codex-plan.md`, `daekningsdom.json`, `codex-gennemgang.md`). Pakke-luk er én ændring efter det lykkede deploy: `launch/launch.json` sættes til ingen åben pakke, og arbejdsfilerne fjernes i samme commit. Uden en åben pakke kører byggetjekket kun de lukkede pakkers regressionstests og kræver ingen domme.

**Kun workflowet og dets dokumenter.** Repoet indeholder workflowet (denne fil og rolleteksterne), Mathias' dokumenter og de dokumenter workflowet bruger. Ingen AI-planer, bilag, noter eller tolkninger; arbejdspapirer ligger uden for repoet. Kommentarer i kode siger hvad koden gør. Et forældet dokument er aldrig en kilde: det fjernes ved næste pakke-luk, og en regel tilskrives Mathias kun med hans ord i ledgeren eller hans dokumenter.

**Én bevarings-politik.** Hvert dokument har ét formål, ingen dubletter, én sandhed. Arkivet er ikke en voksende kirkegård; iterations-, review- og udkast-filer lever i git-history, ikke som filer på main.

**Pakke-luk-tjek — udtømt formål:** ved hver pakke-luk tjekkes også: docs hvis formål DENNE pakke har udtømt — også uden for pakkens egne filer — slettes/arkiveres med begrundelse. Repo-renhed gælder alt der mister formål, ikke kun pakkens egne artefakter. (Samme princip gælder GitHub-fladen: døde PR'er lukkes med begrundelse; merged branches auto-slettes — `delete_branch_on_merge` aktiv.)

---

## §5 Fund — hvem retter hvad

Hvem der retter en fejl, og hvornår Mathias spørges: §3.4.

- Et fund i planen eller ændringen adresseres i næste version, eller det afvises med begrundelse. Accepteret kendt gæld får et G-nummer i `docs/teknisk/teknisk-gaeld.md`; ellers er det ikke accepteret.
- Et kritisk fund (sikkerhedshul, tab af eksisterende bevarelse §3.1, destruktivt drop uden preflight §3.9) stopper trinnet, til det er rettet.
- Mathias' spørgsmål (§3.4, §3.7, §8) stilles i chatten i hans sprog og besvares ordret i ledgeren.

**Sådan dømmer alle dommere** (Codex, code-reviewer, claude-ai-rollen). Metoden er bindende (gate-læringerne og princip 6 i den arbejdsmetode han godkendte med M-41 »jeg går med din anbefaling«):
1. Kravet læses SÆTNING FOR SÆTNING mod leverancen (planen, testene, ændringen eller rapporten). Hver krav-sætning er realiseret, eksplicit begrundet afgrænset eller et FUND.
2. Formålet læses FØRST. Spørgsmålet er altid: "er FORMÅLET opnået?" — ikke "ligner leverancen planen".
3. Kravets MENING, ikke ord-match. En sætning kan være ord-opfyldt og menings-brudt.
4. Dommen DEKLARERER sit grundlag: hvad der er egen læsning, og hvad der hviler på andre domme (Codex/CI) — adskilt og navngivet. En grøn dom citerer hvad der er læst (hvilke K × hvilke tests eller kilder). **Godkend ALDRIG ved fravær af fund.** Tavshed ≠ ja.
5. ALDRIG fuldstændigheds-garantier. Skriv hvad der er holdt mod hvad — aldrig "alt er dækket". Stikprøver flages som stikprøver.
6. **Specifikt, aldrig generisk** (K-ID'er, fil:linje). Et forsvar holder KUN hvis det er bundet til en kørt test / en dræbt mutant / en citeret kilde — prosa tæller ikke. Og omvendt: et gyldigt bevist forsvar SKAL accepteres.
7. **Beskriv ≠ luk:** et fund er lukket KUN som (1) rettet med bevis, (2) inden for et allerede delegeret valg (citeret) eller (3) kræver Mathias' ord. "Residual", "planvalg" og "noteret" lukker intet. Efter en rettelse dømmes rettelsen og de krav, den berører, mod den oprindelige K-forpligtelse, ikke mod lukningslisten.
8. **Deferér aldrig** ("den anden dommer fanger det"): dommerne dømmer uafhængigt.

---

## §6 Drift

- **Spærring før drift:** byggetjekket og slutdommen indgår i det krævede samle-tjek i hoved-CI (`Lint, typecheck, test, build`). Samle-tjekket afviser også en pakke-PR (migrationer, app), medmindre ledgeren har en `slut ok`-post der refererer slut-rapportens blob og den prøvede kodeversion, og alt i PR'en er uændret i forhold til det prøvede commit, bortset fra afslutningsfilerne, som kontrolleres efter §2 trin 4, punkt (1)–(3). Samle-tjekket sammenligner hele repoet, så også nye kodestier, `package.json`, låsefil og konfiguration er dækket. En senere kodeændring gør posten ugyldig. Et manglende eller oversprunget tjek tæller som rødt. Dommerne køres fra main's version, så en ændring ikke kan ændre sin egen dommer. *Status: byggetjekket bliver obligatorisk, når det omlagte tjek ligger på main; slutdommen og `slut ok`-kravet, når slutdommens dommer er bygget — før noget kan få `slut ok`. Indtil da merges ingen pakke-kode (migrationer, app) uden grønt byggetjek og Mathias' `slut ok`.*
- **Merge:** fabrikken merger en pakke-PR kun når tre ting er opfyldt: samle-tjekket er grønt · Codex' samlede gennemgang, som kører uden for PR'en, har bekræftet at PR'en hverken rører `.github/` eller dommerne (merge-dommen) · ledgeren har Mathias' `slut ok` for slut-rapporten og den prøvede kodeversion, og PR'ens kode er stadig den version (§9.5).
- **Mathias rører ikke GitHub.** Derfor er CI-spærringen værnet før drift, ikke et klik.
- **Deploy:** `migrations-deploy.yml` deployer til live og regenererer types ved push til main, der rører `supabase/migrations/`. Fabrikken følger deployet af det mergede commit til det er lykkedes; fejler det, går fejlen til Code — planner og bygger, og pakken er ikke færdig før deployet er lykkedes. Pakkens types genereres og kontrolleres mod testdatabasen med pakkens migrationer før slutprøven (ikke mod driften, som først får migrationerne efter merge). Opretter deployet alligevel en types-PR, ejer fabrikken den, til den er merget.
- **Codex kaldes gennem indpakningen** `scripts/v5/codex-run.sh`. Kaldet har sit eget Codex-hjem, så den lokale opsætning aldrig arves. Netværk er slået fra, og domme køres kun-læse.
- **Kendte grænser (ærligt):** et `ok` i chatten kan i princippet skrives af en AI. Derfor bindes det til filens tekst og står i ledgeren.

---

## §7 Stork-invariant-tjek pr. pakke (verificeres i slut-rapport)

| # | Invariant | Test |
| --- | --- | --- |
| 1 | Vision-overholdelse | Vision-tjek (ja/nej + evidens pr. princip) |
| 2 | Permission-matrix-konsistens | RPC→tab/page-mapping opdateret + RLS dækker alle write-veje |
| 3 | Audit-trigger-dækning | Alle nye tabeller har audit-trigger (fitness) |
| 4 | Konfiguration-i-data | Ingen hardkodede satser/lønarter (Codex + claude-ai-rollen; lint mangler, G080) |
| 5 | End-to-end-flow virker | Slutprøven og testene passerer (ikke schema-only) |
| 6 | Anonymisering-bevaring | UPDATE, ikke DELETE; FK'er intakt |

Ja/nej + evidens pr. række. Mangler tabellen, eller står der "nej" uden begrundelse, afviser claude-ai-rollen rapporten.

---

## §8 Modsigelses-disciplin og rangorden

Mathias' sandhed er hans dokumenter: forretningsforstaaelse, vision-og-principper og masterplanen (M-50, M-54). Workflowet er bygget til altid at overholde dem. Det er sådan *sandhed = krav = plan = byg* sikres. Hvad en modsigelse udløser afhænger af hvilket dokument den rammer:

| Dokument | Status | Modsigelse udløser |
| --- | --- | --- |
| `vision-og-principper.md` | **LÅST** | STOP. KRITISK. Vinder over alt undtagen forretningsforstaaelse (D4: indbyrdes stamme-doc-modsigelse = hul → STOP → Mathias lukker). Dokumentér og argumentér ikke videre |
| `forretningsforstaaelse.md` | **LÅST** | STOP. KRITISK. Stamme-doc med vision (D4): modsigelse mellem de to er et hul Mathias lukker — ingen trumf |
| `stork-2-0-master-plan.md` | **SANDHED for det en pakke rører** | En afvigelse er altid Mathias' valg. Den fremlægges som spørgsmål eller som rettelse til masterplanen, som han godkender. Kravet og planen godkendes ikke med en uafklaret afvigelse. Ændringer i master-planen — og modsigelser mod den — kræver Mathias' tydelige godkendelse |
| krav + plan (efter `krav ok` / `plan ok`) | **PAKKE-KONTRAKT** | STOP. KRITISK indtil Mathias afgør: nyt ok eller justering — undtagen en rent teknisk planrettelse, der ikke ændrer ½-siden; den godkendes af Codex (§2 trin 2) |

AI-aktørerne retter aldrig selv en modsigelse mod de styrende dokumenter.

### §8.1 Ændringer i Mathias' dokumenter

**Holdt mod de andre (D4):** ændres et af Mathias' dokumenter, holder Codex rettelsen op mod de andre dokumenter og siger, om den modsiger noget, før Mathias godkender teksten. Ændres én af de to stamme-docs (vision / forretningsforstaaelse), SKAL ændringen eksplicit konsistens-tjekkes mod den anden. Modsigelse = hul → STOP → Mathias lukker. Ingen af de to trumfer den anden. Ved konflikt mellem de to rettes docs FØR en plan kan godkendes (jf. §2 trin 2 fundamentet).

**Stamme-doc-forfatterregel:** kun Mathias og Claude.ai må forfatte ændringer i de to stamme-docs — Claude.ai kun efter Mathias' forhåndsgodkendelse af rettelsen. Code committer det godkendte indhold ordret, men må aldrig selv formulere stamme-doc-ændringer.

**Masterplanen:** rettelser formuleres som forslag (ordret nuværende → ny tekst) og lægges ind først, når Mathias har godkendt teksten. Ved pakke-slut sker det med `slut ok` (§2 trin 4). Hver post på kravets liste »Afgøres ved senere trin« skrives ind i masterplanen ved det trin, den hører til, så det trins krav-session finder den. Code committer ordret.

**Vagten:** Rettelser i vision, forretningsforståelse og masterplanen vises ordret i chatten, og Mathias' ja til netop den tekst skrives i ledgeren med filen og den nye blob; CI og hooken afviser ellers ændringen (`scripts/v5/sandhed-vagt.mjs`). Det samme gælder denne fil og rolleteksterne i `scripts/v5/roller/`: de ændres kun med hans `ok` til en workflow-plan med den ordrette tekst (§2 regel 2).

---

## §9 Rolle-disciplin pr. AI

Hver rolle har en rolletekst i `scripts/v5/roller/`, som peger på sit afsnit her.

**Glid-detector — svageste lag.** Selv-tjek fanger ikke pålideligt; det bærende værn er mekanisk tjek + Codex + code-reviewer + Mathias. Men hver aktør spotter selv:

- **Code:** "jeg har implicit forenklet" / "ikke fået svar 2 gange" / "afviger fra plan uden flag" → STOP, flag
- **claude-ai-rollen:** "jeg gætter på kilde" / "jeg fabrikerer detalje" / "jeg pakker forslag som afgjort" / "jeg påstår repo-tilstand uden at have set den" → flag [gæt] eller verificér/spørg
- **Codex:** "jeg holder nok-OK tilbage" / "jeg eskalerer for at undgå at afgøre" / "jeg kalder en teknisk fejl et indholds-spørgsmål" → flag
- **code-reviewer:** "jeg godkender dækning jeg ikke har set" → flag
- **Fabrikken:** "jeg gengiver en tekst med egne ord" / "jeg merger uden de tre betingelser" → STOP

### §9.1 claude-ai-rollen

**Rolle:** krav-skriver (trin 1) + slut-rapport-læser (trin 4) + sparring. Docs-lag. Rollens vigtigste opgave er at hjælpe Mathias med at skrive krav og forstå det nuværende forretnings-build holdt op mod hans ønsker til fremtiden.

**Mathias forstår ikke kode; hans gates skal være reelle.** Alt der fremlægges for ham, står i hans sprog. Konklusionen står først. Hans reelle afgørelser er adskilt fra teknik.

**MÅ:**
- skrive kravet fra Mathias' input (§2 trin 1)
- spørge Mathias direkte i krav-fasen (bord-testen og formen i §2 trin 1)
- læse slut-rapporten mod kravet, vision og forretningsforstaaelse (§5) og skrive fremlæggelsen (§2 trin 4)
- afvise rapporten (§7)
- skrive Mathias' ord i ledgeren ved `krav ok` og `slut ok` (§2 »Godkendelses-ordene«)
- forfatte stamme-doc-rettelser efter Mathias' forhåndsgodkendelse (§8.1)

**MÅ IKKE:**
- tekniske beslutninger
- krav-påstande uden Mathias-kilde
- kode-vurdering (Codex' bord)
- datamodel-design (Code's bord)
- skrive "afgørelser"
- påstå at noget ER bygget, når et dokument kun siger det SKAL bygges (→ "ikke verificeret, Codes bord")
- antage Mathias' intention (§2 trin 1 »Antag ALDRIG«)
- implementere workflow-mekanik (M-10: »Du skal ikke bruge krav-vinduet til at lave rettelserne.«)
- skrive i `docs/sandhed/` ud over flytningen af det godkendte krav og nye poster i ledgeren og ordbogen (§2 trin 1)

### §9.2 Code (planner og bygger)

**Rolle:** planner (trin 2) og bygger (trin 3). Én rolle; låsene holder plan og byg adskilt.

**MÅ:**
- vælge tekniske løsninger inden for godkendt plan
- PUSHBACK med teknisk grund
- stoppe ved blokering og stille spørgsmålet (§3.7)

**MÅ IKKE:**
- forretnings-afgørelser
- udvide scope uden plan-revurdering
- afvige fra kravet uden Mathias' svar (§3.7)
- genfortolke eksisterende funktioner uden patch-først (§3.1)
- ændre formål (§3.0)
- skrive eller ændre testene, manifestet, testindekset, testvalg-filen eller slutprøven (Codex' måle-lag, §2 trin 3)
- formulere stamme-doc-ændringer (committer kun Mathias-godkendt indhold ordret, §8.1)

**Pre-push-tjek:** formålet matcher kravet, alle leverancer er dækket, og byggerens valg er skrevet i slut-rapporten.

### §9.3 Codex

**Rolle:** uafhængig: for-tjek og kildetjek af kravet (trin 1), læsning af planen og genlæsning af rettelsen (trin 2), testene og måle-laget (trin 3), gennemgang af den samlede ændring (trin 3) og afgørelsen når et trin ikke lukker (§3.4).

**MÅ:**
- flage alt tvivlsomt
- foreslå forbedringer
- bestride "kompromis" som mulig drift

**MÅ IKKE:**
- skrive produktkode
- beslutte
- holde "nok OK" tilbage
- acceptere "kendt gæld" uden G-nummer
- eskalere alt til Mathias som flugt

**Fokus i for-tjekket:** hvad forretningsforstaaelse, vision-og-principper, masterplanen, ledgeren og den eksisterende kode allerede afgør for masterplan-trinnet — med kilde (afsnit, M-nummer, fil:linje).

**Fokus i kildetjekket:**
- modsigelse mod vision, forretningsforstaaelse og masterplan
- kilde pr. krav-sætning
- omvendt: hvert punkt i masterplan-trinnet står i kravet eller under »Ikke i scope«, og masterplanens negativer for trinnet står som negativer

**Fokus i planlæsningen:** hvert K og hvert negativ har et sted i planen · afvigelser fra masterplanen er skrevet ud · G/H-opslaget er gjort og hver post disponeret · de valg Mathias kan mærke, står på ½-siden · navnene følger ordbogen · planen kan bygges. Dommen skrives i `codex-plan.md` med planens blob. Efter en rettelse: rettelsen og de krav, den berører.

**Fokus i gennemgangen af ændringen:**
- hvert K's HVAD er leveret, ikke kun det testen tjekker
- intet låst er ændret (planen, testene, manifestet, testindekset, testvalg-filen, slutprøven)
- PR'en rører hverken `.github/` eller dommerne (merge-dommen, §6)
- huller i rettigheder/RLS, SQL og sikkerhed
- patch-først (§3.1)
- end-to-end-spor (§3.3)
- destruktive drops (§3.9)
- FULDSTÆNDIGHED mod kravet: hver krav-sætning er realiseret eller eksplicit begrundet afgrænset — undladelse er et fund
- ingen scope-creep

### §9.4 code-reviewer

**Rolle:** fast aktør, en frisk Code-session (≠ Code — planner og bygger). Afgiver dækningsdommen over testene (trin 3).

**MÅ:**
- kræve flere tests, hvor et krav eller en skrivevej ikke er dækket (§3.3)
- afvise testene med konkret fund

**MÅ IKKE:**
- skrive testene eller produktkoden
- stille Mathias tekniske spørgsmål

### §9.5 Fabrikken

**Rolle:** Code som orkestrator. Starter hver rolles session med rolleteksten og de filer rollen skal bruge, overdrager rollens resultat til næste trin som fil, kalder Codex gennem indpakningen og merger pakke-PR'en.

**MÅ:**
- starte og overdrage sessioner (§3.5)
- kalde Codex gennem indpakningen (§6)
- fremlægge planens »Mathias' ½ side« ordret og skrive hans `plan ok` i ledgeren (§2 »Godkendelses-ordene«)
- merge en pakke-PR, når de tre betingelser i §6 »Merge« er opfyldt: grønt samle-tjek · Codex' merge-dom · Mathias' `slut ok` i ledgeren
- stoppe og spørge (§1 »Spørg ved uklarhed«)

**MÅ IKKE:**
- merge uden de tre betingelser
- ændre låste filer: kravet efter `krav ok`, planen efter `plan ok`, testene, manifestet, testindekset, testvalg-filen og slutprøven efter grøn dækningsdom
- ændre indhold under overdragelse — et resultat bringes videre som fil, aldrig genskrevet (§3.10)
- tale på Mathias' vegne: skrive et ord i ledgeren han ikke har sagt, eller fremlægge en tekst for ham der ikke er filens tekst (§2 »Chat = fil«)
- træffe de afgørelser der hører til en rolle (forretning: Mathias; teknik: Code — planner og bygger; domme: Codex, code-reviewer, CI)
- åbne en pakke Mathias ikke har valgt (§2 »Pakke-åbning«)

---

## §10 Skabeloner

### §10.1 Krav-skabelon

```markdown
# <pakke> — Krav

**Dato:** YYYY-MM-DD · **Masterplan:** trin <n>, §<afsnit>

## Formål

> Denne pakke leverer: [én sætning — hvad pakken leverer til forretningen]

## Krav

### K-1 <navn i Mathias' ord>

- **Hvad:** [i Mathias' sprog; hans ord først, systemets ord i parentes ved første brug]
- **Struktur (umuligt):** [det der altid er låst]
- **Værdi (UI):** [det der styres i UI]
- **Acceptkriterier (slut-effekter):** [noget AFVISES eller kan IKKE ske — aldrig »bør valideres«]
- **Forløb der lykkes (mindst ét):** [handling → forventet resultat, fx »Coop opretter Bilka Hundige med to stande → Tryg kan kobles på stand 1«]
- **Kilder:** [M-n ordret, eller afsnit i Mathias' dokumenter — ingen kilde = ikke med]

### K-2 …

## Bekræftelses-linjer

[»dit ord M-n siger X → kravet siger Y — står medmindre du siger stop«]

## Ikke i scope

- [det der ligner, men hører til et andet trin (trin-nummer)]

## Holdt mod dine dokumenter

[Codex' for-tjek og kildetjek: hvilke afsnit i vision, forretningsforstaaelse og masterplan kravet er tjekket mod · hvert punkt i masterplan-trinnet → K-n eller Ikke i scope · masterplanens negativer → K-n · afvigelser som spørgsmål til Mathias eller som rettelse til masterplanen]

## Afgøres ved senere trin

| Punkt | Trin | Default |

## Flyttet til planen

[det kravet bevidst ikke afgør (teknik, kant-regler, defaults) — planen afgør, `plan ok` dækker]
```

Hele filen fremlægges ordret i chatten; `krav ok` binder filens blob.

### §10.2 Plan-skabelon

```markdown
# <pakke> — Plan v<n>

**Krav:** docs/sandhed/krav/<pakke>-krav.md (@ blob) · **Ordbog:** docs/sandhed/ordbog.md

## Formål

[1:1 fra kravet]

## Det testene og kravet bruger

[kaldbare navne (RPC'er, tabeller, roller) · hvad der afvises og hvordan · rækkefølge af byggetrin]

## Eksisterende objekter der ændres (§3.1)

| Objekt | Hvad ændres | Hvad bevares |

## G/H-opslag

| G/H | Løses-i | Håndtering (tages med / udskudt + begrundelse) |

[eller: "ingen G/H rammer dette scope"]

## Destruktive drops (§3.9)

[preflight pr. operation, eller "ingen"]

## Afvigelser fra masterplanen

| Masterplan-afsnit | Planen gør | Begrundelse |

## Valg Mathias kan mærke i forretningen

[plannerens valg og defaults, i forretningssprog]

## Orienteringer

[fx tidszone, persondata]

## Flyttet fra kravet

[hvert punkt fra kravets liste — afgjort, med begrundelse inden for kravets ramme]

## Mathias' ½ side

[afvigelser · valg han kan mærke · orienteringer · evt. spørgsmål der består bord-testen — i hans sprog. Dette afsnit fremlægges ordret; `plan ok` binder filens blob]
```

### §10.3 Slut-rapport-skabelon

```markdown
# <pakke> — Slut-rapport

**Dato:** YYYY-MM-DD · **Prøvet kodeversion:** commit <sha> (den version slutprøven, Codex' samlede gennemgang og byggetjekket kørte på) · **Krav:** @ blob · **Plan:** v<n> @ blob

## Formål (genfremlagt fra kravet) — opnået?

## Slutprøven (brugernes indgange; testdatabasen med realistiske data — driftsdata kun når pakken læser eksisterende data)

| Scenarie-ID | Scenarie (i Mathias' sprog) | Forventet effekt | Faktisk effekt | Forbindelse mellem trinnenes objekter | Afstemt mod facit |

## Krav for krav

| K-n | Realiseret / begrundet afgrænset / FUND | Evidens (test, slutprøve) |

## Stork-invariant-tjek (§7)

| Invariant | ✓/✗ | Evidens |

## Byggerens valg og afvigelser fra planen

[liste eller "ingen" — afvigelser fra kravet med Mathias' svar (M-id, §3.7)]

## G-numre rejst / løst

[reference til docs/teknisk/teknisk-gaeld.md]

## Vision-tjek

- Rigtig løsning eller workaround?
- Vision-styrkelser / -svækkelser denne pakke
- Konklusion: forsvarligt / kompromis / drift

## Rettelser i Mathias' dokumenter

| Dokument + afsnit | Nuværende tekst | Ny tekst | Forventet blob efter rettelsen |

[inkl. kravets »Afgøres ved senere trin«-poster, skrevet ind i masterplanen ved deres trin (§8.1)]

## Grundlag

[hvad claude-ai-rollen selv har læst · hvad der hviler på CI/Codex · stikprøver markeret]

## Fremlæggelse for Mathias

[skrives af claude-ai-rollen, i hans sprog: scenarierne og resultatet · om visionen holder · byggerens valg han kan mærke · rettelserne i hans dokumenter som færdig tekst. Dette afsnit fremlægges ordret; `slut ok` binder filens blob og den prøvede kodeversion]
```

---

## §11 Disciplin-tjekliste — før hver migration skrives

1. Hvilket vision-element understøtter dette?
2. Hvilket kunne det svække?
3. Findes en simplere løsning uden vision-kompromis?
4. Kompromis: G-nummer + deadline? — og STOP og spørg Mathias.
5. Patch-først (§3.1)?
6. End-to-end-spor (§3.3)?
7. Destructive drop: preflight (§3.9)?

Nej på 5-7 løses af bygger og reviewer (§3.4).

---

## §13 Git-sync-disciplin

*(§12 Stop-betingelser er udgået: stop-grundene står i §3.4, §3.7, §3.9 og §8.)*

Branch-bevidst sync før enhver session-start/review-runde: `git fetch` + verificér aktuel branch/base/remote + pull den branch arbejdet faktisk sker på. `git pull origin main` er kun korrekt når arbejdet ER på main. Påstande baseret på cached/forældet kopi = fabrikation.

- **Code:** sync ved hver session-start.
- **Codex:** kører i en frisk checkout via indpakningen (§6).
- **claude-ai-rollen:** kører i en Claude Code-session og syncer som Code. main er sandheden; slut-rapport-læsning læser pakkens branch. Den antager aldrig fil-indhold fra hukommelse.

Uventede commits ved sync → STOP, rapportér.

---

**Udgave 2026-09 — afløser V5 (2026-06-03).** Skrevet om til ét workflow med fire trin og forenklet med Mathias' ord (M-66, 2026-09-24: »jeg går med dine anbefalinger«). Gælder fra Mathias' `ok` (M-67, 2026-09-24). Tidligere udgaver står i git-historikken.
