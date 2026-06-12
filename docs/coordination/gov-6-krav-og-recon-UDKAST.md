# gov-6 — Krav-dok + recon-plan (UDKAST under dialog)

**Type:** Arbejdsdokument — Mathias' ord fra dialogen 2026-06-13, struktureret af Code
**Status:** UDKAST — intet er låst. Dialogen fortsætter; krav OK er ikke givet.
Dokumentet er ucommittet arbejdsfil indtil Mathias siger andet.
**Kilde:** Hvert punkt peger på Mathias-ord fra dialogen 2026-06-13 (og 2026-06-12
hvor markeret). Codes egne tolkninger er eksplicit markeret [ANTAGELSE] eller [ÅBENT].

---

## Del 1 — Krav-dok (opdateret)

### Pakkens formål

> Denne pakke leverer: hele workflowet set med nye briller, fordi ny info er kommet.

Fremgangsmåde (Mathias-ord): fuld analyse af workflowets muligheder. Egenskabs-
dokumentet (`docs/teknisk/claude-code-egenskaber.md`) er lavet, men må IKKE være
eneste info-grundlag — der skal søges på nettet og kigges i egne
indstillingsmuligheder. Vigtigt: alle relevante egenskaber der kan hjælpe med at
åbne workflowets formål, skal kortlægges.

### V5-dommen og fejl-læringen (Mathias-ord 2026-06-13)

**Dommen:** Hele V5 er åbnet op og lukket som mislykket — V5 har ikke overholdt
visions-dok-rammen. Vi har fejlet undervejs, og nu er det vigtigste at vi lærer
af fejlene. Nu skal V6 bygges korrekt.

**Hvad "korrekt" betyder (visionens ord anvendt):** bygget på kortlagt grundlag,
efter hensigten — ikke den første løsning der virker. Beviset for at V5 ikke
blev bygget korrekt er opdagelsens timing: relevante egenskaber blev fundet i
SIDSTE step, efter build. Havde kortlægningen ligget først, var de ankommet som
input til designet — ikke som åbenbaring efter bygningen.

**Skærpelsen (Mathias-rettelse):** V5 var bygget og i drift da egenskaberne blev
fundet — og alt blev fundet på Claudes egen hjemmeside. Løsningerne var
aktørernes EGNE EGENDELE. Aktørerne kendte ikke deres eget udstyr, og Mathias
(uden teknisk baggrund) endte med at drive opdagelsen af aktørernes egenskaber.
Den fejlklasse er aktørernes, ikke holdets fælles.

**Grundlag for dommen (Code-verificeret 2026-06-13):**

- Én sandhed brudt: workflowets formål var ikke nedskrevet noget sted; fire
  halv-formål levede i fire dokumenter uden at noget var autoritativt
- V-historikkens mønster: hver version (V2→V3→V4→V5) var reparation af
  forgængerens drift — "konsolidering forgrener i stedet for at erstatte"
- Drift-fund i drift: lag-blandet disciplin-tekst (målt aktør-glid),
  begrebs-skævheder, to-hjem-rester
- Den røde tråd hviler fortsat på hukommelse/selv-disciplin i friske sessioner
  (middelmådigheds-fundet)
- Workflowet var aldrig formelt under visions-rammen: visionen gælder systemet;
  workflowet fik aldrig et låst formål eller principper

**To historisk beviste faldgruber for V6-byggeriet (læringsdata — den dyreste
kendte fejlklasse i netop denne operation):**

1. At tabe ar-båret substans i omskrivningen — V4 tabte fire bærende
   discipliner uden beslutning; hver V5-regel er knyttet til en konkret fejl
   der faktisk skete. Fejlene selv er læringsdata og må ikke ryge ud med formen.
2. Parallelle sandheder — en ny version AFLØSER, den lægges aldrig ved siden af.

### Workflowets formål (ankeret alt måles mod)

> Byg et workflow som sikrer at vi bygger Stork korrekt og efter hensigten.
> Ingen hurtige beslutninger og ingen nemme løsninger.

### Krav for selve workflowet

- Vision- og forretnings-dok = krav = plan = build = PR = luk
  _(luk tilføjet af Mathias 2026-06-13: kæden lukker, beviset bor i lukket)_
- Masterplan er retning og som udgangspunkt korrekt, men kan ændres
  (Mathias-godkendelse kræves)
- Nuværende kode tages seriøst og respekteres — nuværende logikker skal hænge
  sammen med det byggede
- Holdet spiller hinanden bedre. Vores fornemmeste opgave er at sikre at vi
  bygger Stork 2.0 med udgangspunkt i Mathias' visions-dok, og vi skal hjælpe
  hinanden med at bygge rigtigt og ikke nemt
- Workflowet er fundamentet til at opnå vores mål — det er byggerammen

### Holdet

Mathias · Claude.ai (Windows-app) · Code (terminal) · Codex (terminal)

### Ét workflow — to flader (Mathias-ord 2026-06-13)

Workflowet, arbejdsmetoden og holdet er ikke sideordnede rammer — de er alle
del af ÉT workflow. Det skal dække begge flader:

1. **Selve workflowet** — byggerammen: pakke-flowet hvor Stork bygges
   (vision/forretning = krav = plan = build = PR = luk).
2. **Uden om workflowet** — alt det andet arbejde: dialoger om problemer og
   udfordringer, sparring, undersøgelser, drift. Det er her vi opdager og
   beslutter.

Fælles på tværs: SAMME hold og SAMME arbejdsmetode på begge flader. Rollerne
skal fungere bredt: hver aktør har 2 roller — én pr. flade. (Konkret
rolle-definition pr. flade er V6-arbejde; fastlægges ikke her.)

V5-hullet dette lukker: V5 dækkede kun pakke-fladen. Alt uden om
(mandat-arbejdsformen, morgentjek, dialoger som dagens) var udokumenteret —
og det var netop dér middelmådighed og glid levede frit: uden metode, roller
eller værn.

### Dokumentation [ÅBENT — Mathias-retning 2026-06-13, ikke afgjort]

Mathias-ord: docs-delen fejler — vi har alt for meget ligegyldig fylde, som
fjerner fokus fra kerneopgaven. Måske skal der også en på docs-rolle/
dokumentation. Hvordan det lander, afgøres i dialogen.

### Arbejdsmetoden (gælder AL kommunikation med Mathias — ikke kun workflow)

Alle Mathias' dialoger handler om problemer, udfordringer eller build. Metodens
formål: vi hjælper hinanden frem til den RIGTIGE løsning — ikke den første,
nemme eller hurtige. Det vigtige er at de relevante vinkler kommer frem. Før
beslutning kortlægges relevant data (internt OG eksternt); efter datagrundlaget
vælges den rigtige løsning — og måden det sker på, er dialog med Mathias.

1. Aldrig svar før datagrundlag
2. Datagrundlag: søg relevant data → forstå relevant data → svar aldrig efter
   første fund → søg efter yderligere data → ved ingen fund: svar · ved fund:
   næste step → skab sammenhæng mellem data
   - [ANTAGELSE — afventer korrekt/forkert] Ingen sammenhæng → søg igen; kan
     sammenhæng stadig ikke skabes → svar ærligt med det der er, og flag hullet
3. Spørg aldrig Mathias, før du selv har forsøgt at svare på samme spørgsmål
4. Ingen antagelser — ved tvivl valideres antagelsen eksplicit: korrekt/forkert

**Grundprincip (Mathias-ord):** vi skal VÆRE gode, ikke VIRKE gode. Workflowet
sikrer at det byggede er godt (bevis, ikke påstand); metoden sikrer at
beslutningerne er gode (grundlag og vinkler, ikke første fund).

**Afviste tilføjelser (bogført så de ikke genopstår):**

- Kilde-mærkning pr. påstand: behøves ikke — fylde uden betydning
- Friskheds-regel på data: alder er ikke målestok (visionen er gammel og
  vigtigst); værnet mod forældet repo-kopi bor allerede i git-sync (disciplin §13)

### Niveau-indsigten (hypotese — testbar, ikke låst krav)

- Udgangspunktet i enhver ny session/terminal/chat er middelmådigt. Det høje
  niveau findes (set i tidligere chats), men tager timer at fremkalde og skal
  derefter vedligeholdes.
- Det der fremkalder niveauet er samtale. Samtale er tekst — og tekst kan
  sættes op. Altså KAN udgangspunktet hæves væk fra middelmådighed.
- Datapunkter fra dialogen 2026-06-13: det der løftede var evidens-tekst
  (konkrete fejl mødt med konkrete afvisninger), ikke instruks-tekst; lidt
  skarp tekst slog meget tekst (fylde og for dyb kontekst trækker ned).
- Åbent data-spørgsmål: hvad i teksten er det aktive stof — og virker det uden
  Mathias til stede i samtalen?

### Åbne punkter (afventer Mathias' ord — intet af dette er afgjort)

1. Loop-tolkningen i metoderegel 2 (se [ANTAGELSE] ovenfor): korrekt/forkert?
2. Arbejdsmetode-kandidater, ikke afgjort: divergens-reglen (fund modsiger
   bestillingen → stop og rapportér; byg ikke videre for at få det til at
   passe) · "ved ikke" som gyldigt svar (leverancen må ende i et spørgsmål
   eller "her er hvad vi ikke ved endnu")
3. Workflow-formåls-kandidater, ikke afgjort: hvem hensigten tilhører (Mathias'
   kontrolpost, eneste beslutningstager, ved tvivl er det hans) · fangsten
   kommer udefra · sandhedskrav på selve arbejdet · Mathias' friskhed
   (workflow- eller automations-niveau)
4. Pakkenavn (kataloget: afgøres i dialogen)
5. Katalogets status-ramme (`gov-6-forslag-og-udskudte.md`) bærer det gamle
   formål ("fuld gennemgang af V5 + mangler + fejl") — opdateres på Mathias-ord
   når det hele er på plads. Ingen rettelser før da.

---

## Del 2 — Recon-plan (opdateret)

### Recon'ens formål

Lægge vinklerne på bordet til dialogen: et kortlagt datagrundlag (internt og
eksternt) så den rigtige løsning kan vælges — i dialog med Mathias. Recon
informerer dialogen; den fodrer ikke krav-dok og træffer ingen valg.

### Metoden (pr. egenskab/mekanik)

| Led          | Spørgsmål                | Svarer på                                                               |
| ------------ | ------------------------ | ----------------------------------------------------------------------- |
| **FIND**     | Hvad er det?             | Egenskaben — fundet internt og eksternt                                 |
| **TEST**     | Hvad gør den?            | Fordelen — demonstreret i vores miljø, ikke reciteret fra dokumentation |
| **ANALYSÉR** | Hvad kan den bruges til? | Udbyttet — i vores setup, målt mod workflowets formål og krav           |

- **Find-kilder — selv-inventaret FØRST:** aktørernes egne egenskaber og
  indstillingsmuligheder (V5-læringen: løsningerne var vores egne egendele, og
  viden om eget udstyr er letfordærvelig — den ændrer sig pr. version og skal
  vedligeholdes, ikke antages) · egenskabs-kataloget (startpunkt — aldrig
  eneste grundlag) · officiel dokumentation på nettet · community/eksterne
  kilder · vores eget setup (kæden, adapters, instrukser)
- **Test-leddet** er være/virke-skellet bygget ind i recon'en: en fordel-påstand
  uden demonstration er virke-viden. Hvor test kræver Mathias' flade/konti,
  flages det — antages ikke.
- **Analyse-leddet** leverer vinkler og kandidater — aldrig beslutninger.
  Detaljegrad er ikke autoritet; dialogen kan forkaste alt.

### Emner kortlægningen skal dække (åbent — dialogen kan udvide/forkaste)

1. Alle relevante egenskaber der kan åbne workflowets formål — katalogets 22
   rækker som find-startpunkt, nettet og indstillingerne som resten
2. Niveau-hypotesen som testbart emne: det aktive stof i tekst; virkning uden
   Mathias i samtalen
3. Arbejdsmetodens overholdelse: egenskaber der kan bære eller fange metoden
   (udefra-fangst er ÉN kandidat-type fra dialogen — ikke et valg)

### Output

Vinkel-katalog pr. egenskab (egenskab · fordel — testet · udbytte-kandidat)
plus den ærlige rest: "her er hvad vi ikke ved endnu". Leveres til dialogen.

### Hvad recon IKKE er

Ingen beslutninger, intet design, intet byg. Tidligere gov-6-recon-leverancer
(arkiveret uden for repo, 2026-06-11) hørte til det gamle formål — reference,
ikke grundlag.

---

## Årsagen til V6's vigtighed — prisen for V5 (målt)

**Mathias-ord 2026-06-13:** Tiden er mit dyrebareste eje — den kan ikke fås
igen.

V5-æraens målte pris (2026-06-03 kl. 22:18, commit `3abe2ee` → 2026-06-12;
lokalt målbart, Code-verificeret 2026-06-13):

- **Aktiv lokal aktør-tid: ~37,6 timer** på 7 aktive dage (peak 11/6: 10,4
  timer — gov-5-lukningens 52 review-runder + nattens fejlslagne kæde-åbning).
  Målt som tid mellem aktør-events med pauser over 10 min fratrukket.
- **Tokens:** Claude Code ~13,9M output / ~2,26 mia. processeret (96%
  cache-genlæsning) over 8.456 assistent-svar i 92 sessioner · Codex ~10,9M
  (cirka-tal) over 144 sessioner.
- **IKKE målbart og dyrest af alt:** Mathias' egen tid i app-dialogerne —
  timerne brugt på at fremkalde niveau, fange glid og drive opdagelsen af
  aktørernes egne egenskaber. Ingen lokale logs; kan ikke opgøres — og kan
  ikke fås igen.

**Konsekvensen:** Når der ikke bygges korrekt, betales der to gange — først
for at bygge, så for at bygge om. Tokens kan købes igen; tiden kan ikke.
Derfor skal V6 bygges korrekt: kortlagt grundlag før beslutning, den rigtige
løsning valgt i dialog — så tiden bruges én gang, på det rigtige.
