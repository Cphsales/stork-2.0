# Workflow-plan — forenklet (version 43)

2026-09-24 · afløser undersøgelsen v31 (`undersoegelse.md`, kun baggrund) · **intet er gjort; alt nedenfor sker først når du har godkendt planen.**
Bygger på: v35 (gennemgået af Codex og Claude) + en fuld gennemgang af alle 685 dokumenter i repoet (16 agenter, hver fil læst helt). Detaljerne dokument for dokument står i `bilag-dokumenter.md`.

**Dit ord 24/9 til de anbefalede forenklinger og lukningen af hullerne:** »jeg går med dine anbefalinger« (skrives i ledgeren, når planen udføres). Ændringslisten står i `aendringer-41.md`.

Dit mål (23/9): _din sandhed (forretningsforståelse, vision-og-principper, masterplan) = krav = plan = byg._

---

## 1. Hvad der var forkert før

v31 lukkede hvert hul med ny mekanik (15 nye trin midt i pakke 1, ≈35 punkter, 14 spørgsmål, 13.100 ord). v35 var slank, men byggede på en oversigt over filerne, ikke på at de var læst; den fulde gennemgang fandt at oprydningen i v35 ville have gjort CI rød, tabt dine ord og tabt åbne sikkerhedsfund. Det er rettet her.

---

## 2. Workflowet — for alle pakker

**Ét proces-dokument:** din `disciplin.md`, rettet til dette. Den _beskriver_ workflowet; CI og hooks _håndhæver_ det, og rolleteksterne peger på den (det forener dit ord 20/6 om skills og hooks — gengivet af en bot på PR #175 — med ét sted at læse reglerne).

| Trin        | Hvad sker                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Hvem dømmer                                     | Dig                                                                   |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------- |
| **1. Krav** | Codex slår først op hvad dine dokumenter og koden allerede siger om trinnet, så spørgsmål kun stilles om det de ikke besvarer. Dialog med dig; kravet i dit sprog; hver sætning peger på dit ord (ledgeren) eller dine dokumenter. Codex holder udkastet op mod forretningsforståelsen, visionen og masterplanen — begge veje: hver kravsætning har en kilde, og hvert punkt i masterplan-trinnet står i kravet eller under »ikke i scope«. Afvigelse = spørgsmål til dig. | Codex                                           | **`krav ok`**                                                         |
| **2. Plan** | Kort plan: kun det testene og kravet bruger + de valg du kan mærke i forretningen + afvigelser fra masterplanen + det du skal orienteres om (fx tidszone, persondata). Planen disponerer også den tekniske gæld (G/H) der rammer pakken. Byggeren vælger resten og skriver det i slut-rapporten.                                                                                                                                                                           | Codex, én gang; én rettelse, som Codex genlæser | ½ side → **`plan ok`**                                                |
| **3. Byg**  | Codex skriver testene ud fra kravet. Code-reviewer dømmer at testene dækker hvert krav. Så låses planen (ved dit `plan ok`) og testene + filen der vælger hvilke tests der køres (ved grøn dækningsdom). CI kører testene og mutant-prøven og afviser byggeriet hvis noget låst er ændret. Codex gennemser den samlede ændring én gang.                                                                                                                                    | CI + code-reviewer + Codex                      | —                                                                     |
| **4. Slut** | Slutprøve gennem brugernes indgange på testdatabasen med realistiske data — på driftsdata kun når pakken læser data der allerede findes (fx løn). Kort rapport i dit sprog: scenarier, resultat, om visionen holder, hvad der skal rettes i dine dokumenter; med dit `slut ok` rettes de.                                                                                                                                                                                  | CI + claude-ai-rollen                           | **`slut ok`** = det må i drift (CI kræver ordet i ledgeren før merge) |

**To regler:**

1. **Tekniske fejl rettes af bygger og reviewer — du spørges kun om indhold:** når kravet er uklart, modstrider dine dokumenter, eller pakken er for stor. Lukker et trin ikke efter to rettelser, afgør Codex om årsagen er en af de tre; så får du dit spørgsmål fra `disciplin.md` §3.4. I din tjekliste før migrationer (§11) går kun pkt. 4 (kompromis med visionen) til dig; tekniske nej løses af bygger og reviewer.
2. **Workflowet ændres kun mellem pakker.** Pakke 1 er den ene undtagelse: den står mellem plan og byg, intet er bygget.

**Værn der skal være på plads (ellers er kæden kun på papiret):**

- **Spærring før drift:** byg- og slutdommen indgår i det krævede samle-tjek i hoved-CI (`Lint, typecheck, test, build`, som GitHub håndhæver for alle — verificeret). Et manglende eller oversprunget tjek tæller som rødt. Dommer-scripts køres fra main's version — derfor skal den omlagte dommer først ligge på main, før den gøres obligatorisk. En pakke-PR må ikke samtidig ændre `.github/` eller dommerne; samle-tjekket afviser det, og Codex' samlede gennemgang tjekker det. **Restrisiko (ærligt):** selve samle-jobbet er defineret i `ci.yml`, som en PR i princippet kan ændre. Indtil videre dækker merge-betingelsen i §4.1 trin 3 (Codex-dom uden for PR'en). Det lukkes helt først, når GitHub-reglen sættes til kun at godtage tjekket fra main — det kræver admin-rettighed, som botten ikke har via sit token (huskeliste H030).
- **Codex kaldes fortsat gennem indpakningen**, men forenklet: det der bevares er isolationen (eget Codex-hjem, så din lokale opsætning — som har netværk slået til — aldrig arves), netværksforbuddet og kun-læse ved domme. Pins, ptrace-sporing og kvitteringer i den fjernes.
- **Dine tre ord bindes:** ledgeren gemmer hvert ord med en reference til præcis den fil du så; fremlæggelsen i chatten er filens tekst ordret. Byggetjekket kræver `plan ok` for planen og testene der bygges, og samle-tjekket kræver `slut ok` for slut-rapporten og den kodeversion slutprøven og Codex kørte på, før en pakke kan merges og deployes; ændres koden bagefter, gælder ordet ikke længere.
- **Én ledger og én ordbog for hele Stork** (`docs/sandhed/mathias-ord.md`, `docs/sandhed/ordbog.md`), så dine ord og navne overlever pakke-luk.
- **Fabrikken har sin egen rolletekst** med hvad den ikke må (fx merge uden grønt samle-tjek, Codex' merge-dom og dit ord).

**Det der bevares:** ledgeren · Codex' uafhængige tests og mutant-prøven · slutprøven gennem brugernes indgange · intet i drift uden grønne tests og dit `slut ok`.

**Accepterede risici (ærligt):**

- Dit `ok` i chatten kan i princippet skrives af en AI; det bindes til teksten og står i ledgeren.
- Repoet er offentligt (kendt siden 11/8); planen ændrer ikke det.
- **Du rører ikke GitHub** (dit ord i implementeringsplanen) — derfor er CI-spærringen værnet før drift, ikke et klik. I dag kræver main i praksis ingen godkendelse (PR #172 gik igennem uden), og botten har admin-rolle (`CLAUDE.md` siger »aldrig admin« — rettes). Nedgradering af botten kræver admin-login; det står på huskelisten.

### 2.1 Ramme for fremtidige krav-dokumenter

Et krav-dokument er **dine forretningsgange** for én masterplan-pakke — ikke teknik (»plan er kode og krav er forretningsgange«, dit ord 15/9). Rammen bygger på dine egne regler (`disciplin.md` Step 1 og §10.1, bord-testen 2/9 og M-33, afled-før-spørg M-32) og på formen fra pakke 1's krav, som du godkendte 8/9.

**Indhold (skabelon, erstatter `disciplin.md` §10.1):**

1. **Formål** — én sætning: hvad pakken leverer til forretningen. Anker: masterplan-trin + afsnit.
2. **Krav K-1…K-n**, hvert med:
   - _Hvad_ — i dit sprog; dit ord først, systemets ord i parentes ved første brug.
   - _Struktur (umuligt)_ — det der altid er låst · _Værdi (UI)_ — det der styres i UI.
   - _Acceptkriterier som slut-effekter_ — noget AFVISES eller kan IKKE ske; aldrig »bør valideres«.
   - _Mindst ét forløb der lykkes_ — i dit sprog: handling → forventet resultat (fx »Coop opretter Bilka Hundige med to stande → Tryg kan kobles på stand 1«). Hvordan det testes, afgør planen.
   - _Kilder_ — hver sætning peger på dit ord i ledgeren (ordret, med nummer) eller et afsnit i dine dokumenter. Ingen kilde = ikke med.
3. **Ikke i scope** — det der ligner, men hører til et andet trin (med trin-nummer).
4. **Holdt mod dine dokumenter** — hvilke afsnit i vision, forretningsforståelse og masterplan kravet er tjekket mod; afvigelser står som spørgsmål til dig eller som rettelse til masterplanen, du godkender.
5. **Flyttet til planen** — de ting kravet bevidst ikke afgør (teknik, kant-regler, defaults); planen afgør dem, og dit `plan ok` dækker dem. De forsvinder aldrig tavst.

**Sådan laves det:**

- Afled først: det der følger **direkte (ét skridt)** af et citeret ord eller afsnit, står som _bekræftelses-linje_ (»dit ord M-12 siger X → kravet siger Y — står medmindre du siger stop«). Analogier og fortolkninger over flere skridt er forslag og fremlægges som sådan — en kildehenvisning gør dem ikke til din beslutning.
- Kun spørgsmål der består **bord-testen**: (a) kun du kan svare, (b) du kan svare uden teknik, (c) svaret ændrer hvad der bygges i dette trin og skal afgøres nu. Teknik afgøres af planen (dit `plan ok` dækker). Forretningsvalg der først bliver afgørende i et senere trin, går på »afgøres ved trin X«-listen med en default. Værdier (satser, antal, perioder) styres i UI og er ikke spørgsmål.
- Form: én beslutning pr. spørgsmål, en konkret situation fra din forretning, svarbart med ét ord, anbefaling med.
- Dine svar skrives ordret i ledgeren med nummer; kravet citerer nummeret.
- Codex holder kravet op mod dine dokumenter (trin 1 i tabellen); så fremlægges det i chatten i dit sprog → **`krav ok`**, bundet til præcis den tekst du så.
- Efter `krav ok` lægger krav-rollen kravet i `docs/sandhed/krav/<pakke>-krav.md` præcis som du så det; hooken tjekker at filen er den tekst ledgeren binder (den gamle fresh-eyes-betingelse i hooken fjernes). Slut-rapporten ligger i `plan-build/<pakke>/slut-rapport.md` og overlever pakke-luk sammen med krav og plan.
- Kravet ændres kun med et nyt `krav ok`. Opdager byggeriet at kravet er forkert, går det tilbage til dig — det rettes aldrig tavst.

---

## 3. Pakke 1 (lokations-skabelonen)

Kravet er godkendt (8/9). Planen er v3.7; dit `plan ok` gælder v3.5. Intet er bygget. Planens henvisninger til koden holder (≈45 tjekket), og de fem afvigelser fra masterplanen er verificeret.

**Anbefalet vej (B): gør den færdig på det nye workflow, flettet med oprydningen i rækkefølgen i §4.1.** (Vej A — de gamle skinner — kræver ≈15 trin mekanik der bagefter rives ned.)

**Trin 1 — plan v3.8 (ét samlet tillæg, ikke kun G001):**

- G001: audit-sporet strengt før rigtige data (migration + negativ test + tjek af gamle migrationer) — også i manifestet, ellers fanger byggetjekket det ikke.
- Byggetrinene tilpasses byggetjekket (i dag 5 bid i planen mod 13 trin i koden) og den ene samlede Codex-gennemgang.
- Planens henvisninger til ledger og ordbog peger på den nye fælles sti i `docs/sandhed/`. Slutprøve-punktet S-3 i ½-siden bortfalder (slutprøven kører på testdatabasen).
- Blok C ud (mit forslag, dækket af dit `ok`: den gamle henvisning den retter, erstattes allerede af Blok A). Forudsætningstabellen opdateres (M-46/M-47). Tre tekstrester rettes (l. 520, 672, 1050 — l. 1050 kalder en AI-sætning »M-40 ordret«).
- Slutprøve-specifikationen (P-8) skrives om **før** `plan ok`, da planen er bundet til den: slutprøven kører på testdatabasen med realistiske data gennem brugernes indgange (der findes ingen lokationsdata i drift). Hemmelig nøgle, HMAC, signering, udtræk fra drift og kildekontrakten udgår; afvisningsforsøgene, kæden og facit bliver.
- Testindekset (`angrebs-spec.json`) bindes til v3.8 (i dag v3.5). Henvisninger til filer der fjernes, peger på git-historikken.
- Planen skæres ned: ændringslog og sporings-mekanik ud (skøn: ≈410 KB → ≈150 KB). Dine allerede godkendte forretningsvalg (planens §10) og afvisningskataloget bliver.
- Læses én gang af Codex → ½ side til dig: de fem afvigelser + orienteringerne (fx at systemets dag følger UTC og skifter kl. 01/02 dansk tid — dine dokumenter peger på dansk kalenderdag) → **`plan ok`**.

**Trin 2 — det der skal til for at testene er ærlige:**

- Test-database (G047), resten af G006 (API-/netværksfejl og manglende token må ikke give grønt — de egentlige fund er allerede hårde), test-opstart på tom database (G003 — afprøvet; mine to lokale commits genbruges).
- Styret klokke — også for API- og login-tokens' tid, ikke kun databasen.
- To fejl i testbiblioteket rettes (race-tests fejler altid; HTTP-svar tabes). OpenAPI-tjekket flyttes til test-databasen.
- De af integrationssuitens tests der dækker database-runneren (ikke hele suiten på 94, som også tester DSL-motoren) flyttes til en egen test, før DSL-motoren fjernes (4.1).
- **Én Codex-gennemgang af byggetjekket** — tre af dets filer er ændret siden sidste godkendelse.
- Slutprøvens dommer bygges på testdatabasen (ingen adgang til drift).
- Schema-drift-tjekket i CI tjekker i dag intet (filen er en pladsholder — verificeret): gøres reelt eller fjernes.

**Trin 3:** Codex færdiggør testene (37 negativer mangler i dag) → dækningsdom → byg → CI → slutprøve → rapport → **`slut ok`** → dine dokumenter rettes (masterplan §1.12 m.fl.).

---

## 4. Oprydning (først når du har godkendt planen)

Princip: **det der ikke bruges af workflowet i §2 eller af pakke 1, fjernes.** Git-historikken bevarer alt.

### 4.1 Rækkefølge (ellers bliver CI rød, viden tabes eller kæden brydes)

1. **Flyt viden og dine ord** ind i filer der bliver (bilaget §2-3): dine regler der kun står i implementeringsplanen og rolleteksterne (»antag aldrig«, »kode = din sandhed«, afled-før-spørg, bord-testen, D10/D12 for testene), G001-specifikationen, G/H-dispositionen, Codex' arbejdsliste til testene, klokke-opskriften, byggetjekkets begrundelse. Den nye `disciplin.md` lægges ind (teksten i `tekster/disciplin-ny.md`); implementeringsplanen mærkes »afløst«.
2. **Pakke 1's plan v3.8 → dit `plan ok`** (§3 trin 1), bundet i ledgeren til planens tekst.
3. **Byggetjekket lægges om og forenkles** til ét CI-job med fire tjek (testene grønne · mutanterne dræbt · intet låst ændret · planen og testene er dem dit `plan ok` og dækningsdommen bandt i ledgeren) i stedet for den gamle plan-port og bevismaskinen; `v5-gate-dom.yml` og de gamle porte fjernes **i samme ændring**; den relevante del af integrationstestene flyttes først. Ændringen merges til main og gennemgås af Codex; **derefter** gøres byggedommen obligatorisk i samle-tjekket for ændringer i en pakkes kode (migrationer, app). Slutdommen gøres obligatorisk, når dens dommer er bygget (§3 trin 2) — før noget kan få `slut ok`. Forberedende ændringer af fabrikken selv dømmes af dens egne selvtests. `launch.json`'s author-felt og de fejlagtige login-felter rettes først her, fordi den gamle port binder dem. **Merge-betingelse fra nu af:** fabrikken merger kun en pakke-PR, når Codex' samlede gennemgang — der kører uden for PR'en og derfor ikke kan ændres af den — har bekræftet at PR'en hverken rører `.github/` eller dommerne.
4. **Så fjernes** provenance, verdikter, kvitteringer, gamle runder og DSL-motoren.
5. CI-trin og de filer de læser fjernes i samme ændring (fx `workflow/` + dit juni-krav i `docs/coordination/` — det er afløst af denne plan, jf. §5).
6. Resten af §4 (døde dokumenter, rettelser) i vilkårlig rækkefølge; så §3 trin 2-3.

### 4.2 Det der bliver i pakke 1's mappe (skrevet ud)

Krav (i `docs/sandhed/krav/`; det byte-identiske udkast i pakkemappen fjernes i 4.1 trin 3) · `plan.md` · manifest · `forventningsliste-udkast.md` (kun indtil byggetjekket er lagt om i 4.1 trin 3) · testindeks (`angrebs-spec.json`) · `prover.json` · P-8 (omskrevet) · kill-listen · `recon2.md`. Ledgeren og ordbogen flyttes til `docs/sandhed/`. `plan-approval.json`/`krav-approval.json`, kildekontrakten, de fire kildefiler og `p8-kilde-scope.sql` fjernes, når byggetjekket er lagt om. Plus `recon/recon-2-bilag.md` (planen peger på bestemte linjer i den). Alt dette bliver **til pakke 1 er lukket**; så gælder din regel: kun krav, plan og slut-rapport overlever — **plus ledgeren**, som altid bliver. Byggetjekkets input (manifest, testindeks, godkendelser, `prover.json`, forventningslisten) fjernes først, når ingen kontrol længere læser dem.

### 4.3 Fejlagtige »sandheder« der rettes

| Hvor                                                                                                                                                               | Hvad er forkert                                                                                                                                                                                                                                                                                                                                                         | Handling                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `disciplin.md` (dit)                                                                                                                                               | beskriver juni-kæden; ≥12 døde stier; Codex må ikke skrive kode (gør det allerede, M-46); »kun Codex-approval for plan« (du godkender, M-45); modsiger sig selv om hvem der godkender planen                                                                                                                                                                            | erstattes af `tekster/disciplin-ny.md`                                                                                     |
| masterplanen (dit)                                                                                                                                                 | ≥16 påstande om det byggede passer ikke (commits der ikke er i main — verificeret; skrive-funktioner kører med forhøjede rettigheder siden 7/6, ikke brugerens; forkert tabelnavn; fjernede retention-værdier; benchmark-tests der ikke findes; døde stier; dobbelt nummerering i Appendix C) + to modsigelser mod forretningsforståelsen                               | rettes efter `tekster/masterplan-rettelser.md`: fejlene nu, lokations-delen ved pakke 1's `slut ok`                        |
| hovedet i vision og forretningsforståelse (dit)                                                                                                                    | »godkendelse via PR«, »CODEOWNERS håndhæver« / »mekanisk håndhævelse er aktiv« — du rører ikke GitHub, og PR #172 gik igennem uden review                                                                                                                                                                                                                               | rettes efter `tekster/stammedok-hoveder.md` (kun den linje)                                                                |
| `CLAUDE.md`                                                                                                                                                        | »stork-code-bot (write, aldrig admin)« — botten har admin (verificeret)                                                                                                                                                                                                                                                                                                 | rettes                                                                                                                     |
| `teknisk-gaeld.md`                                                                                                                                                 | 6 poster er løst men står åbne; G006 er kun delvist løst og afgrænses; G046 og G018 er overhalet og lukkes; flere bygger på filer der ikke findes; **mangler 5 åbne huller i fundamentet** (bl.a. at enhver indlogget bruger kan gennemføre en godkendt, forfalden ændring — verificeret) + et GDPR-ansvarlig-felt ingen funktion bruger + byggetjekkets kendte grænser | opdateres (nye poster G067-G082)                                                                                           |
| `huskeliste.md`                                                                                                                                                    | H006 peger forkert; H028/H029 overflødige                                                                                                                                                                                                                                                                                                                               | opdateres (nye: H030 nedgradér botten + aflæs branch-beskyttelsen med admin-login, H031-H032)                              |
| `permission-matrix.md`, `README.md`, `supabase/README.md`, `supabase/tests/README.md`, `scripts/README.md`, `.github/BRANCH_PROTECTION.md`, `cutover-checklist.md` | forældede (fx »1 godkendelse kræves«, men PR #172 gik igennem med 0 — verificeret)                                                                                                                                                                                                                                                                                      | opdateres                                                                                                                  |
| `CODEOWNERS`                                                                                                                                                       | 12 mønstre for `docs/coordination`; ét fjerner din godkendelse af en fil der findes                                                                                                                                                                                                                                                                                     | ryddes                                                                                                                     |
| ledgeren (dit)                                                                                                                                                     | forældet statusblok; regel-hovedet henviser til implementeringsplan og driver; to citater (M-46, M-53) har anden ordlyd andre steder                                                                                                                                                                                                                                    | statusblok og hoved rettes; de to citater markeres »ordlyd uafklaret« med begge kilder (se `tekster/oevrige-rettelser.md`) |
| pakke 1-kravet (dit)                                                                                                                                               | kalder sig »UDKAST«, henviser til `recon/`                                                                                                                                                                                                                                                                                                                              | kan kun rettes med nyt `krav ok` → tages ved pakke 1's slut                                                                |
| `plan-approval.json`, `krav-approval.json`                                                                                                                         | påstår server-verificeret login (`mgrubak`), som filerne selv kalder deklareret; registrerer det samme som ledgeren                                                                                                                                                                                                                                                     | fjernes i 4.1 trin 3 (ledgeren er eneste kilde)                                                                            |
| `launch.json`                                                                                                                                                      | »author: mgrubak« er skrevet af botten, ikke af dig                                                                                                                                                                                                                                                                                                                     | rettes i 4.1 trin 3, når den gamle port der binder filen er fjernet                                                        |
| rolletekster (`scripts/v5/roller/`)                                                                                                                                | 12 modsigelser mod `disciplin.md` og §2                                                                                                                                                                                                                                                                                                                                 | erstattes af `tekster/skill-og-roller.md` (efter 4.1 trin 1)                                                               |
| din claude.ai-skill (forretnings-revieweren)                                                                                                                       | læser `disciplin.md`-afsnit og døde stier                                                                                                                                                                                                                                                                                                                               | fjernes fra din konto (ikke brugt siden 3/9)                                                                               |

### 4.4 Løse dokumenter og filer

| Område                            | Nu                                  | Efter | Handling                                                                                                                                                                                                                                                                                                          |
| --------------------------------- | ----------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/foraeldet-workflow/`        | 25 filer                            | 0     | fjernes — men masterplanen citerer en fil herfra som kilde til dine beslutninger. Repoets `CLAUDE.md` siger »læs ikke«; dit `ok` til planen giver lov til at læse mappen **kun** for at redde dit indhold, før den fjernes                                                                                        |
| `docs/workflow-faerdiggoerelse/`  | 200                                 | 0     | fjernes efter 4.1 trin 1; implementeringsplanen mærkes »afløst« straks når `disciplin.md` er omskrevet                                                                                                                                                                                                            |
| `docs/teknisk/`                   | 9                                   | 7     | engangs-audit og Claude Code-notat fjernes; Lag E-noterne bliver liggende, hvor de er: det kan ikke dokumenteres, hvilke sætninger der er dine egne (commits er medforfattet af Claude), og din forfatterregel forbyder Code at formulere tekst i forretningsforståelsen; org-udkastet bliver liggende som udkast |
| `plan-build/lokations-skabelon/`  | 365                                 | ≈40   | kun 4.2-listen bliver                                                                                                                                                                                                                                                                                             |
| `recon/`                          | 8                                   | 1 → 0 | `recon-2-bilag.md` til pakke 1 er lukket; resten fjernes efter 4.1 trin 3                                                                                                                                                                                                                                         |
| `workflow/` + `scripts/workflow/` | 83                                  | 0     | sammen med CI-trinnet                                                                                                                                                                                                                                                                                             |
| `plugins/stork-sync-test/`        | 3                                   | 0     | fjernes                                                                                                                                                                                                                                                                                                           |
| mine filer uden for repoet        | 8 + ≈250 kladder                    | 0     | klokke-opskrift, G001-specifikation, G/H-disposition flyttes ind; resten slettes                                                                                                                                                                                                                                  |
| uden for repoet i øvrigt          | kædens systemd-tjeneste, issue #126 | —     | fjernes/lukkes                                                                                                                                                                                                                                                                                                    |

### 4.5 Død kode og komplicerede regler

| Hvad                                                                                                                                                                                                                                                          | Handling                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `scripts/kaede/`, `scripts/codex-review.sh`, hærdet-registeret, `driver.mjs`/`preflight.mjs`, DSL-motoren (to hjælpefunktioner flyttes først), 3-blind recon, claim_graph, omission-devil, kvitterings-/devil-maskineriet, `v5-gate-dom.yml` + de gamle porte | fjernes (i rækkefølgen i 4.1)                                                                                                                                                                          |
| transport-hærdningen (pin, ptrace-sporing, kvitteringer)                                                                                                                                                                                                      | fjernes — **undtagen** den lille Codex-indpakning i §2                                                                                                                                                 |
| `actors.lock.json` (model-pins, dit M-31/M-33)                                                                                                                                                                                                                | fjernes med koblingen i hooks og indpakning — pins bortfalder (§5)                                                                                                                                     |
| governance-jobbet i hoved-CI                                                                                                                                                                                                                                  | governance-tjek, kæde- og juni-selftests ud; lint, typecheck, test, build, migrations-tjek, fitness og db-test bliver; jobnavnet bevares                                                               |
| `package.json`-scripts, `.husky/pre-commit`                                                                                                                                                                                                                   | scripts for fjernede filer og v4-påmindelsen ud                                                                                                                                                        |
| byggetjekket (`ci-build-dom`, `build-proof`)                                                                                                                                                                                                                  | **forenkles** til ét CI-job med fire tjek (4.1 trin 3); test-runner, database-runner, manifest og testindeks bliver; commit-låsen bliver                                                               |
| manifestets detaljerede bid-graf (D12)                                                                                                                                                                                                                        | bruges for pakke 1 som den er; fra pakke 2 dækker testene kravet direkte (D10 bliver)                                                                                                                  |
| `forventningsliste-udkast.md`                                                                                                                                                                                                                                 | dublet af manifestet — fjernes når byggetjekket er lagt om                                                                                                                                             |
| 9 rolletekster (≈1.000 linjer)                                                                                                                                                                                                                                | erstattes af de nye i `tekster/skill-og-roller.md` (inkl. fabrikkens) — i samme commit som `actors.lock.json`, dens kobling og `roller.mjs` fjernes (ellers blokerer pre-commit og Codex-indpakningen) |

**Resultat (skøn):** ≈1.100 → ≈460 filer (migrationer, app og pakker røres ikke); to proces-sandheder → én.

---

## 5. Dit bord

Dit bord er forretning og dine godkendelses-ord (bord-testen, dit ord 2/9 og M-33). Alt i planen der er mekanik, har jeg afgjort og skrevet ind. Der er derfor **ét ord til dig**:

**`ok` til planen** — workflowet (§2), rammen for krav-dokumenter (§2.1), pakke 1 efter vej (B) (§3) og oprydningen (§4).

Med dit `ok` gælder disse **bekræftelses-linjer** — de står, medmindre du siger stop ved en af dem:

- Din sandhed er dine dokumenter (M-50/M-54): masterplanen er sandhed for det en pakke rører; en afvigelse er altid dit valg. `disciplin.md` §8 (»retningsgivende«) og masterplanens §0 rettes, så de siger det samme.
- Du rører ikke GitHub (dit ord i implementeringsplanen) — CI-spærringen er værnet før drift.

Med samme `ok` godkender du disse **foreslåede ændringer** af dine tidligere beslutninger (de er mit forslag, ikke afledt af dine ord — derfor står de her, så du ser dem):

- Bortfalder, fordi workflowet bliver enklere: recon før krav og plan (M-2/M-3/M-4) · altid nyeste Codex (M-8) og model-pins (M-31/M-33) · M-35 · »rollen bestemmer kaldet« (M-41) · anker-regel, retrospektiv og proces-canaries (L1-L3) · alle fire aktører godkender + build-OK-porten (dit juni-krav) · at vi retter workflowet mens vi bygger · pligt-djævlen · at planen bestemmer alt på forhånd · kvitteringskæden · dit valg af GitHub-connector til claude.ai-appen (11/6), da appen ikke bruges. Dine regler for testene (D10/D12), »antag aldrig« og »kode = din sandhed« **bevares**.
- Ændret med dit ord 24/9 (»jeg går med dine anbefalinger«): D12 (bid-grafen) gælder kun pakke 1 og bortfalder fra pakke 2 · slutprøven kører på testdatabasen, driftsdata kun når pakken læser eksisterende data · én plan-læser · planner og bygger er én rolle.
- Nye roller: Codex skriver testene og tjekker kravet mod dine dokumenter; code-reviewer dømmer testdækningen; kravet skrives i dialog med dig i en Code-terminal i krav-rollen; fabrikken starter og overdrager sessionerne, ikke dig.

**De færdige tekster er en del af planen** (mappen `tekster/`) — dit `ok` dækker dem, og de lægges ind præcis som de står:

- `disciplin-ny.md` — den nye `disciplin.md` i fuld tekst + liste over hvad der er ændret.
- `masterplan-rettelser.md` — hver rettelse som nuværende → ny tekst: A) fejl om det der er bygget + rangorden (nu), B) lokations-delen (træder i kraft med pakke 1's `slut ok`), C) steder der kræver din forretningsbeslutning i et senere trin (rettes ikke nu).
- `oevrige-rettelser.md` — teknisk gæld, huskeliste, `CLAUDE.md`, README'er, `CODEOWNERS`, ledgerens hoved, og hvad der flyttes før noget fjernes.
- `skill-og-roller.md` — de nye rolletekster.
- `stammedok-hoveder.md` — én linje i hovedet på vision og forretningsforståelse (»godkendelse via PR« og en usand påstand om mekanisk håndhævelse rettes til din godkendelse med ord). Formuleret af krav-rollen efter din forfatterregel; Code indsætter ordret.
- Din claude.ai-skill `stork-2-0-forretnings-reviewer` (fra juni: `qwers`/`qwerr`, peger på døde stier) er ikke brugt siden 3/9, hvor krav-arbejdet flyttede til Code-terminalen. Den bør fjernes fra din konto, fordi den peger på døde stier; det kan kun du, men workflowet afhænger ikke af det.

**Spørgsmål der hører til senere trin** (stilles, når de består bord-testen dér — `bilag-dokumenter.md` §6):

- _Pakke 1's ½ side til `plan ok`:_ systemets dag følger i planen UTC, men dine dokumenter peger på dansk kalenderdag — en afvigelse fra dine dokumenter, som du vælger. (Om gruppe og leverandør er én eller to ting, har dit krav allerede lagt i planen, l. 181.)
- _De trin i masterplanen de hører til:_ løn-adgang 3 eller 4 niveauer (trin 5/14-22) · dashboard-adgang (trin 23) · migration fra 1.0 (trin 12+) · »én klient ad gangen« · hvem der aktiverer GDPR-strategier.

Siger du `ok`: oprydning i rækkefølgen i 4.1 (med pakke 1's `plan ok` som trin 2) → pakke 1 efter §3.
