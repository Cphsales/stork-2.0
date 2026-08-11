# gov-6 — Forslag og udskudte punkter (katalog)

**Status-ramme (Mathias-beslutning 2026-06-11 — det ENESTE låste):** gov-6 er
UDSKUDT, ikke droppet. Åbnes igen når Mathias afgør det. Form: fuld gennemgang af
V5 + implementering af mangler + rettelse af fejl. Alt i dette katalog er
FORSLAG/ÅBENT og afgøres af Mathias i pakkens krav-dok-dialog — intet låses før.
Kataloget sikrer at intet kun lever i chat eller hukommelse. Code fører kataloget
på Mathias-ord; punkter forlader det når de afgøres (ind i krav-dok/plan) eller
bevidst slettes.

**Læse-regler (Mathias-ord 2026-06-12 — gælder HELE kataloget):**

- Kataloget rammer BREDT OG ÅBENT: punkterne er kandidater, fund og ideer —
  ikke en dagsorden og ikke designs. Krav-dialogen må forkaste, omforme eller
  overhale alt her.
- Et forslag bliver ALDRIG automatisk en løsning — heller ikke når det er
  detaljeret formuleret. Detaljegrad er ikke autoritet; kun Mathias' afgørelse
  i dialogen flytter status.
- Én-sandhed gælder repoets SANDHEDER — ikke søgningen. Ideer uden
  sandhedsstatus er legitime og lever her mærket [IDÉ]; at lede efter det, der
  ikke er sandhed endnu, er en del af formålet, ikke et brud på princippet.
- Mærkning: [FORSLAG] = kandidat til afgørelse · [IDÉ] = retning/spørgsmål
  uden løsningsform · [ÅBENT]/[FUND] = observation uden hjem/afgørelse ·
  [Mathias-retning/-ord] = hans input til dialogen (heller ikke låst før den).

## 1 · Forslag til pakkens form (afgøres i krav-dok-dialogen)

- [Mathias-retning 2026-06-11 — repo-renhed, gennemgangens målestok pr.
  dokument] Repoet holdes RENT: hvert dokument skal altid have et formål ·
  aldrig dublet tekst · holdes konstant opdateret · én sandhed · trimmet til
  kun relevant info. Ingen ligegyldig fylde — fylde ender som afgørende
  glid-kilde for AI-aktørerne (evidens samme aften: lag-blandet/stale
  disciplin-tekst gav aktør-glid i drift).

- [FORSLAG] Emne-lags-form: ét krav-dok m. mål-tegning som ramme, bidder under,
  hver bid = fuldt kæde-gennemløb (krav 8 bevises gentagne gange). Tidligere
  drøftet 12/6 som omdefinering — nu kun forslag.
- [FORSLAG] Scope-kandidat: dokument-sandhed/-fornyelse — docs-fundene i afsnit 4
  som recon-forspring til dialogen.
- [FORSLAG] Pakkenavn afgøres i dialogen (åbningen 2026-06-11 brugte `gov-6`;
  ældre plan-tekst sagde `gov-6-arkiv-fold` — divergensen lukkes ved navnevalget).
- [FORSLAG — Mathias-ord 2026-06-12] Mappestruktur efter indholdstype og
  sandhedsstatus: pakke · workflow · forretning · gæld · ideer (ingen sandhed)
  — sidstnævnte som strukturelt hjem for alt ikke-sandhed (forslag-kataloget,
  1.0-reference-arkivet). I dag er workflow-stof spredt (strategi/,
  coordination/, scripts/, codex/) og ikke-sandhed har intet mærket hjem.
  Afgøres i gov-6's krav-dok-dialog. PRÆMIS-NOTE (samme ord): arkiv-prunen
  2026-06-12 (PR #146) foregriber ikke strukturen — alt slettet er
  git-history-klasse uanset strukturvalg, og flyt-bunken landede i
  rapport-historik, som er historik-hjemmet i enhver struktur. Strid mod det:
  STOP og rejs.
- [ÅBENT] Krav-kandidat (Mathias): LØBENDE led-status til telefonen + TO-VEJS bred
  indgang mellem gates (spørgsmål/observation mid-spor). Hvad det konkret betyder,
  mærkes i gennemløbene.

## 1b · Idé-tråde fra 2026-06-11/12-samtalen (mål-tegnings-input — alt er [IDÉ], intet er løsning)

- [IDÉ] **Rammen som produkt:** vision/forretning = krav = plan = slut. Hver
  krav-sætning sporbar ned gennem plan → leverance → bevis; dækning kan tjekkes
  mekanisk (forældreløse plan-punkter = scope-creep), MENINGEN i hvert led
  dømmes (sætning-for-sætning-metoden). Slut-rapportens leverance-tabel er den
  manuelle kim.
- [IDÉ] **Evidens bor i GitHub:** bogføring (merge-states, hashes, verdikter)
  genereres fra eller opslås i GitHub — afskrives aldrig i hånden; håndafskrift
  af GitHub-state var rette-til-dagens største målte fejlkilde. Rest der IKKE
  bor der: dømmekrafts-ræsonnementer, udløbende logs, tvær-PR-fortælling.
- [IDÉ] **Form følger læser:** Mathias ejer tre prosa-dokumenter (krav, vision,
  forretning) og læser i øvrigt kun BESKEDER; alle andre dokumenter er
  AI-interne og kan kodificeres (regelbogs-mønstret: deklarativ data + kode +
  selftest). Prosa på AI-flader har ingen læser.
- [IDÉ] **Én-bevægelses-migration (Mathias-indsigt):** hvert dokument dømmes ÉN
  gang og lander direkte i sin slutform (væk · genereret · kodificeret ·
  instruks · Mathias-prosa) — aldrig "opdatér til sandhed, byg så ny sandhed";
  dobbeltarbejde er forbudt som metode.
- [IDÉ] **Tråd-til-vision som målestok for ALT** — også systemets egne tests og
  mekanismer: hvad kræver dig, og hvad beviser løbende at det stadig gør?
  Fangst-rate som trådens bevis; kanariefugle (plantede kendte fejl) som test
  af testene; ingen tråd → væk.
- [IDÉ] **Tænke-flader i flowet:** eksplicit skel mellem hurtig-klasse og
  tænke-klasse i opgaver; verifikation-før-konklusion som regel; leverancer må
  ende i et spørgsmål eller "her er hvad vi ikke ved endnu" (modtræk til
  svar-refleksen — selve samarbejdsformen er runde-stof, de strukturelle
  flader er gov-6-stof).
- [FUND] **Lag-blanding i disciplinen:** manuel-flow og kæde-flow står flettet
  som ligeværdige tekster (aktør-glid målt samme aften); trigger-ord har
  aktør-afhængige dobbeltbetydninger (qwerr); dagens "mandat-arbejdsform"
  (oplæg→go m. enkelt-værn) er udokumenteret. Hertil BEGREBS-HYGIEJNE
  (Mathias-fund + hegn 2026-06-12): interne termer med skæve metaforer er
  glid-kilder i et system, hvor aktører handler på ord — fx "bogførings-
  mønstre" (regnskabs-metafor, aldrig brugt af Mathias selv) for stier, der må
  merge uden klik, fordi de ligger INDEN FOR en allerede godkendt ramme.
  HEGN: klasse-navne hentes fra Mathias' eget sprog — "ramme" er det korrekte
  ord her (ramme-stier: godkendt ramme → intet klik · beslutnings-stier:
  rammen røres → Mathias' ord). Ved kodificeringen navngives klasserne efter,
  hvad de ER, med hans ord. Alle fire fund er V5-gennemgangs-stof.
- [FUND] **Adapter-asymmetri:** app-adapteren er slanket til ren glue;
  kæde-instruksen bærer fortsat metode-indhold som rolle-hjemmet også
  beskriver (to-hjem-rest).

## 2 · Cowork som kandidat-mekanisme til to-vejs-kanalen [FORSLAG]

Desktop-appens Cowork: fil-adgang (postkasse-mønster), mobil→desktop-opgaver,
scheduled tasks til led-status. Codes hegn (2026-06-11):

- Postkassen er INFORMATIONS-kanal (fakta/spørgsmål/observationer) — ALDRIG
  gate-flade: author-verifikation kan ikke flyttes til en lokal fil; gates bliver
  på GitHub.
- Test-spørgsmålet er Cowork-SANDBOXENS adgang til `\\wsl.localhost\Ubuntu\...`
  (ikke Windows→WSL generelt; kæden poller, så inotify-grænsen er irrelevant).
  10-minutters-test: Cowork-opgave skriver én fil i gitignored postkasse-mappe →
  WSL læser → samme vej tilbage.
- Baseline-kandidat der skal slås: GitHub-fladen — issue-kommentarer mid-spor
  (ny leverance-type i regelbogen) + kurér-postet led-status; ingen ny aktør,
  ingen ny trust-flade, kører på GitHub Mobile som preflight alligevel kræver.

Hjem: behovet → krav-dok-dialogen; mekanik-evalueringen → partnerskabs-runden
(sammen med Claude-app-gennemgangen).

## 3 · Udskudte tekniske punkter (VENT — kun bogført, ikke implementeret)

- [FORSLAG] 2a model-/effort-tiering pr. KAEDE_OPGAVE (+ claude-ai-adapteren i
  samme matrix). Betingelse: selvtjek-værn bevist i kæde-gennemløb + 0a-tal.
  Hegn: Codex-gaten urørt · konservativ klassifikation · nedgradering aldrig før
  værnene står.
- [FORSLAG] 3a timeout-konstanter fra adapters → kaede-regler.json
  (konfiguration-i-data-invarianten).
- [FORSLAG] Codex-gate-genbesøg (omfang på rene pointer-synk-reviews): beslutning
  på EVIDENS efter 1a-selvtjek-greppet har kørt en hel pakke.
- [FORSLAG] Fold-politik for codex-reviews/ (mappen vokser hurtigt; §4-rydningen
  sker ved gov-5-pakke-luk — politikken for fremtidige pakker afklares her).

## 4 · Docs-fund (kassens afsnit 7 — recon-forspring til dialogen)

- [ÅBENT] permission-matrix dateret 2026-05-15 = FØR gov-3b's SECDEF-konverteringer
  (regenerering uverificeret).
- [ÅBENT] aktiv-plan.md er vokset til log — sanering.
- [ÅBENT] plan-feedback/ er tom — afklaring.
- [FORSLAG] 1.0-reference-arkiv (mærket HISTORISK, aldrig krav): samler både
  1.0-repo-materiale OG projekt-fladens fakta-dokumenter (storks-logikker,
  frontend-sider-oversigt, code-løsninger) ét sted i repoet, så kædens recon
  når dem; destillering pr. emne når emnet åbner. Afløste forståelses-udkast
  (dokument-1-forstaaelse, gammel CLAUDE.md) arkiveres IKKE — de er git-history;
  to versioner af forståelsen i repoet er præcis den drift én-sandhed forbyder.
  Afgøres i gov-6's krav-dok-dialog. _(Mathias-ord 2026-06-11.)_

## 5 · Punkter med hjem i partnerskabs-runden (pointer — substansen bor i kassen)

Kryds-validerings-modellen (måles i gov-6 + forretnings-trin først) · plan-fasens
bidde-struktur (monolit-fundet) · glid-fangst-resthullet (tvillinge-hukommelse,
mønstre på tværs) · dyb-kontekst-deklarationen (handlings-bias) ·
overgangs-spørgsmålet (headless gate før bevis) · Claude-app-gennemgangen
(Scheduled Tasks, Routines, plugins, Cowork-mekanikken) · samarbejdsformen
(ping/pong mid-fase, "validering ≠ greatness").

## 6 · Mathias' åbne flade-punkter [ÅBENT — hans klik/ord]

5d interaktiv permission-model (bud: prompts interaktivt, skip i kæden) ·
app-project-filer (5 stale fra 1.0-æraen slettes) · instructions-tekstens stale
referencer · strøm-/sleep-opsætning på værten (krævet før natlig kædedrift) ·
telefon-push/GitHub Mobile-modtagesiden (preflight-punktet i rette-til-pakken
verificerer opsætningen) · ÉN-versions-reglen i app-projektet · skill-klik
(venter til repo-SKILL.md er løst).

## 7 · Claude Code-egenskabs-katalog [Mathias-ord 2026-06-12]

- Fuld gennemgang af Claude Code-egenskaber ift. Stork 2.0 er ført som dokument:
  `docs/teknisk/claude-code-egenskaber.md` (tre kolonner: egenskab — hvad det er ·
  fordel — hvad det gør · udbytte — hvad vi får ud af det; grundlag: officiel
  docs-gennemgang v2.1.157, fire artikler, Codex-plugin-repoet). Indgår som
  recon-forspring til krav-dok-dialogen — supplerer afsnit 2 (Cowork) og
  Claude-app-gennemgangen i afsnit 5.
- Code laver INGEN recon i koden før pakkens krav-dok — kataloget er læsestof
  til dialogen, ikke startskud for kode-arbejde.
