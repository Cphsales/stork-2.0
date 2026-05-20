# Stork 2.0 — Arbejds-disciplin

Disciplin mellem Mathias, Claude.ai, Code og Codex.
Gælder fra trin 5 og fremover.

## Trin-cyklus

Et trin valideres tre gange: før byg, ved blokerende
udfordring undervejs, og efter byg. Codex reviewer altid før
Mathias.

### Sekvens pr. trin

1. Nyt trin udmeldt
2. Code leverer plan-rapport (scope + master-plan-paragraffer
   - leverancer + tests der planlægges)
3. Codex review → Mathias review:
   - Godkendt → punkt 4
   - Afvist → Code reviderer plan → tilbage til punkt 3
4. Code bygger
5. Hvis blokerende udfordring under byg:
   - Tærskel: master-plan-konflikt, teknisk umulighed, eller
     behov for scope-ændring. Småspørgsmål håndteres uden stop.
   - STOP byg
   - Code leverer udfordrings-rapport
   - Codex review → Mathias review:
     - Godkendt → tilbage til punkt 4
     - Afvist → Code reviderer plan → tilbage til punkt 3
6. Byg færdig
7. Code leverer afsluttende trin-rapport (vision-tjek +
   master-plan-tabel + tests grønne)
8. Codex review → Mathias review:
   - Godkendt → trin afsluttet, næste trin kan starte
   - Afvist → Code retter (én commit pr. fund) → tilbage til
     punkt 7

Fix-commits inden for et trin følger samme cyklus.
Reviewes ikke isoleret.

## Trin-scope (i plan-rapport ved punkt 2)

Plan-rapport pr. trin SKAL starte med eksplicit scope:

### I scope

- Master-plan-paragraffer (§X.Y, §X.Z)
- Krav-specs (navn + paragraf)
- Tilstødende G-numre der skal håndteres
- Rettelser fra master-plan (rettelse N) der gælder

### IKKE i scope

- Hvad ligner det, men hører til senere trin?
- Hvilke G-numre venter på senere trin?

Hvis et leveret element under byg ikke peger på noget i
"i scope": scope-creep. STOP og lever udfordrings-rapport.

## Selv-tjek pr. trin (før "klar til godkendelse")

Fitness grøn + migration-gate 0 violations er NØDVENDIGT, ikke
TILSTRÆKKELIGT.

Før du melder klar:

1. For hvert leveret element (tabel, RPC, trigger, cron):
   identificér konkret master-plan-paragraf det opfylder
2. For hvert master-plan-krav: skriv test der demonstrerer
   kravet er opfyldt — ikke kun at koden kører
3. Hvis fitness er grøn men master-plan-kravet ikke er
   testbart-opfyldt: STOP, ikke godkend-klar
4. Lever pr. trin en tabel: leveret element → master-plan-
   paragraf → test der demonstrerer kravet → status

Hvis et leveret element ikke peger på en master-plan-paragraf:
hvorfor er det bygget?

## AI-arbejdsdeling

Tre AI-instanser arbejder på Stork 2.0. Mathias er eneste
beslutningstager.

### Claude.ai

Rolle: strategisk sparring + krav-dok-forfatter + krav-dok-reviewer (NY 2026-05-18) + **forretnings-dokument-reviewer i plan-flowet**.

MÅ:

- Foreslå løsninger med konkret begrundelse
- Stille spørgsmål for at afklare scope
- Køre forretningsspørgsmål-fase (`docs/coordination/<pakke>-forretningsspoergsmaal.md`) før krav-dok-skrivning
- Skrive krav-dokumenter (`<pakke>-krav-og-data.md`) baseret på Mathias' afgørelser
- **Reviewe krav-dok** før Mathias-commit, mod fire forretnings-dokumenter + forretningsspørgsmål-fil. Levere approval eller feedback til `docs/coordination/krav-dok-feedback/`.
- **Reviewe plan-filer og slut-rapporter mod fire forretnings-dokumenter** (vision, master-plan, mathias-afgørelser, krav-dok). Levere approval eller feedback.
- Flagge drift mellem afgørelser og implementation
- Sige "jeg ved det ikke" eller "ikke verificeret"

MÅ IKKE:

- Træffe tekniske beslutninger på Mathias' vegne
- Pakke usikker syntese som afgjort
- Sende prompts som direktiver hvor Code skal vælge løsning
- Acceptere input fra Code uden at holde op mod tidligere
  afgørelser
- Fabrikere statistik, tidslinjer, sourcing
- **Lave kode-vurderinger** (bugs, RLS-huller, SQL-fejl, teknisk gennemførlighed) — det er Codex' bord
- **Designe datamodel** (tabeller, kolonner, RPC-signaturer, granularitets-valg, helper-RPC-forslag, kode-skitser, "Model A/B/C") — Code's bord i plan-fasen
- **Skrive påstande i krav-dok uden Mathias-kilde** — krav-dok = tanker; hver påstand citerer Mathias-ord eller låst afgørelse. Ingen kilde: spørg, skriv ikke.

### Code (Claude Code CLI)

Rolle: builder. Skriver migrations, RPC'er, tests. Repo +
Supabase MCP-adgang.

MÅ:

- Vælge tekniske løsninger inden for godkendt plan
- Argumentere imod Mathias' instrukser hvis der er teknisk
  grund
- Stoppe ved blokerende udfordring og bede om afgørelse

MÅ IKKE:

- Tage forretnings-afgørelser
- Udvide scope uden plan-revurdering
- Markere trin som "klar" hvis selv-tjek mod master-plan
  ikke er udført
- Bøje for autoritet uden teknisk argument

### Codex (CLI, read-only)

Rolle: uafhængig **kode-reviewer**. Læser commits, kode, tests, migrations. Leverer rapport på kode-niveau.

MÅ:

- Flage ALT der ser tvivlsomt ud på kode-niveau — bugs, RLS-huller, SQL-fejl, edge cases, teknisk gennemførlighed, akkumuleret gæld
- Foreslå tekniske anbefalinger
- Stille spørgsmålstegn ved Code's egne kode-konklusioner
- Bestride at noget er "kompromis" — kan det reelt være "drift" på kode-niveau?

MÅ IKKE:

- Skrive kode
- Træffe beslutninger
- Holde noget tilbage fordi det "sandsynligvis er OK"
- Acceptere "kendt gæld" som forklaring
- **Verificere plan mod forretnings-dokumenter** (vision, master-plan, mathias-afgørelser, krav-dok) — det er Claude.ai's bord. Hvis Codex spotter et forretnings-dokument-konflikt, markeres det som "OUT OF SCOPE — Claude.ai's bord" og fortsætter kode-reviewet.

Hellere falsk-positiv end falsk-negativ på kode-niveau. Mathias filtrerer.

### Mathias

Eneste beslutningstager. Forretning + endelig godkendelse.
Tekniske beslutninger kan delegeres til Code når det er
inden for godkendt plan.

## Fire forretnings-dokumenter — én låst, to retningsgivende, én pakke-kontrakt

Mathias-afgørelse 2026-05-20: kun vision-dokumentet er LÅST-autoritativ. Master-plan og mathias-afgørelser er **retningsgivende** og kan rettes løbende. Krav-dok og plan er **pakke-kontrakt** efter approval (låst inden for pakken). Plan og slut-rapport skal verificere mod alle fire, men modsigelses-håndtering differentieres efter dokument-status.

| Dokument                                    | Status               | Modsigelses-håndtering                                                                                                                     |
| ------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `docs/strategi/vision-og-principper.md`     | **LÅST-AUTORITATIV** | KRITISK ved modsigelse — Code/Claude.ai STOPPER. Vinder over alt andet.                                                                    |
| `docs/strategi/stork-2-0-master-plan.md`    | RETNINGSGIVENDE      | Modsigelse = trigger for master-plan-rettelse (Appendix C). Ikke automatisk blokering. Mathias afgør om plan eller master-plan rettes.     |
| `docs/coordination/mathias-afgoerelser.md`  | RETNINGSGIVENDE      | Modsigelse = trigger for ny entry eller opdateret entry. Ikke automatisk blokering. Mathias afgør. Entries kan blive forældede.            |
| `docs/coordination/<pakke>-krav-og-data.md` | PAKKE-KONTRAKT       | Inden pakke-build: krav-dok er kontrakt (efter Mathias-godkendelse). Modsigelse mod krav-dok under build = KRITISK, kræver re-godkendelse. |
| `docs/coordination/<pakke>-plan.md`         | PAKKE-KONTRAKT       | Efter approval: plan er kontrakt. Code må ikke afvige under build uden Mathias-godkendelse.                                                |

**Modsigelses-disciplin (V2 2026-05-20):**

- Modsigelse mod vision: automatisk blokering, KRITISK.
- Modsigelse mod master-plan eller mathias-afgørelser: rapport til Mathias, han afgør om rammen er forældet (rettes) eller om pakke-arbejdet skal justeres. Ikke automatisk blokering.
- Modsigelse mod krav-dok eller plan inden for pakken: KRITISK indtil Mathias har afgjort retning.

## Codex-fund i teknisk-gaeld.md

Alle Codex-fund tilføjes til docs/teknisk/teknisk-gaeld.md som G-numre
med det samme — også fund der rettes umiddelbart.

Process:

1. Codex leverer rapport med C-numre (C001, C002, ...)
2. Code opretter tilsvarende G-numre i teknisk-gaeld.md med:
   - Reference til Codex-rapport
   - Severitet fra Codex
   - Master-plan-paragraf
   - Status: åben / under behandling / løst
3. Når fix er commit'et: markér LØST med commit-hash
4. Næste revision: flyt til arkiv

Begrundelse: én autoritativ liste over alt fundet. Codex-fund
forsvinder ikke i samtaler. Audit-trail for hvordan fundament
blev modnet.

## Disciplin-pakke

### 1. Plan-skabelon med formåls-sætning øverst

Hver plan starter med:

> ## Formål
>
> Denne pakke leverer: [én sætning]
>
> Hvis fundet under review ikke bringer os tættere på dette: G-nummer, ikke blocker.

Code udfylder formålet før implementation. Codex læser formålet før review. Mathias tjekker mod formålet ved godkendelse.

### 2. Fast skabelon for lag-boundary-rapport

```
PAKKE [navn] — commit [hash]
Migration-gate: X migrations, Y kolonner, Z violations
Fitness: X/Y grøn
Scope: clean/dirty
Nye tests: [liste]
Branch ahead: N commits
Plan-afvigelser: [liste eller "ingen"]
G-numre tilføjet: [liste eller "ingen"]
Næste pakke: [navn]
```

Hvis felter mangler i Code's rapport: stop og bed om dem. Ingen tolkning.

### 3. Validerings-runde-disciplin

Hver runde indledes med formåls-genfremlæggelse. Fund vurderes mod formålet:

- **Bringer fundet os tættere på formålet?** → ACCEPT
- **Er fundet uafhængigt af formålet?** → G-nummer, ikke blocker

**Runde-trapper:**

- **Runde 1:** alle fund vurderes
- **Runde 2:** kun HØJ-fund stopper implementation. MELLEM → G-numre
- **Runde 3:** kun KRITISKE fund stopper. Resten → G-numre, implementation fortsætter

**Princippet:** validerings-runder bliver dyrere pr. runde, og værdi falder. Tredje runde skal være sjælden.

### 4. Glid-detector

Tre red flags hver aktør selv skal spotte.

**Code:**

- "Jeg har implicit forenklet" → STOP, flag
- "Jeg har ikke fået svar på samme spørgsmål 2 gange" → genfremlæg, ikke fortolk
- "Jeg afviger fra plan uden flag" → afvigelser flagges FØR implementation

**Claude.ai:**

- "Jeg gætter på masterplan" → tjek kilden
- "Jeg fabrikerer detalje" → flag som [syntese] eller fjern
- "Jeg pakker forslag som afgjort" → omformuler

## Formåls-immutabilitet (ikke implementations-immutabilitet)

Hver plan har et FORMÅL — hvad systemet skal kunne, hvilken
funktionalitet leveres, hvilke krav opfyldes. Når Mathias har
godkendt formålet, er det låst.

Code må ændre den tekniske implementations-plan under arbejdet
hvis bedre vej viser sig. Det er Code's domæne. Ændringer i
implementations-vej kræver IKKE ny Mathias-runde, men skal flagges
i slut-rapporten under "Plan-afvigelser".

Code må IKKE ændre formålet. Hvis implementation afslører at
formålet ikke kan leveres som beskrevet, eller at formålet bør
revideres: STOP, eskalér til Mathias, ny planlægnings-runde.

Codex-fund kan resultere i:

- Bug-fix inden for formålet (acceptabelt — Code fikser)
- Implementations-ændring inden for formålet (acceptabelt — Code
  vurderer og rapporterer)
- G-nummer for senere arbejde (acceptabelt)
- STOP + Mathias-eskalation hvis fundet rammer formålet

Codex-fund kan IKKE resultere i: Code ændrer formål, tilføjer
features, omtolker hvad systemet skal kunne.

## Codex-runder = kode-validering, ikke funktions-beslutning

Codex svarer på:

- Leverer koden formålet?
- Er der bugs, sikkerhedshuller, RLS-huller, SQL-fejl?
- Er der edge cases der bryder formålet?
- Følger koden disciplin-pakken?

Codex svarer IKKE på:

- Skulle formålet have været anderledes?
- Mangler der features systemet burde have?
- Er denne funktionalitet den rigtige?
- Er der bedre måder at løse forretnings-problemet på?

Funktions-beslutninger hører hos Mathias.

Hvis Codex' output indeholder funktions-forslag: marker dem som
"OUT OF SCOPE — kræver Mathias-runde". Håndhævelse sker via
Codex-review-prompt-skabelon (leveres i prompt 3) plus
post-processing-scan i Code's review-modtagelse.

## Codex-opgraderings-rolle (udvidet fra ren fejl-jagt)

Codex' rolle er udvidet fra "find fejl" til "find fejl + foreslå opgraderinger"
(2026-05-17-afgørelse).

### Hvad Codex må foreslå

Hvis Codex under plan-review har en bedre kodemetode end den Code har planlagt:
han må foreslå opgraderingen i sit review med severity **OPGRADERING** (ny
severity-type, separat fra KRITISK / MELLEM / KOSMETISK).

Eksempler på opgraderings-forslag:

- Bedre teknisk approach til samme leverance (fx generic helper i stedet for
  dedikerede per-table-helpers)
- Renere implementations-mønster (fx single migration der dækker tre cases
  i stedet for tre separate)
- Bedre test-strategi (fx property-based test i stedet for fem hardcoded
  cases)
- Bedre performance-mønster (fx materialized view i stedet for recursive CTE)

### Format

```
[OPGRADERING] Kort beskrivelse
Code's foreslåede løsning: ...
Codex' bedre alternativ: ...
Teknisk begrundelse: ...
Anbefalet handling: [implementer i V<n+1>, eller afvis med teknisk begrundelse]
```

### Code's håndtering

Code skal i sin V<n+1>-runde forholde sig til hvert OPGRADERING-forslag:

- **AFVIS** med konkret teknisk begrundelse (fx "din løsning løser ikke
  X-edge-case" eller "din løsning er ikke kompatibel med Y-eksisterende-
  mekanisme"). Afvisning dokumenteres i V<n+1>'s åbnings-sektion under
  "Opgraderings-håndtering".
- **IMPLEMENTER** opgraderingen og lever V<n+1> baseret på den.
  Implementering dokumenteres i V<n+1>'s åbnings-sektion under
  "Opgraderings-håndtering".

Code må ikke ignorere et OPGRADERING-forslag stiltiende.

### OPGRADERING vs andre severities

| Severity      | Konsekvens                                                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| KRITISK       | Stopper plan i alle runder. Code SKAL adressere i V<n+1>                                                                                       |
| MELLEM        | Stopper plan i runde 1. Bliver G-nummer i runde 2+                                                                                             |
| KOSMETISK     | Stopper IKKE plan. G-nummer-kandidat                                                                                                           |
| OPGRADERING   | Stopper IKKE plan i sig selv. Code skal eksplicit afvise eller implementere i V<n+1>. Codex må levere APPROVAL og samtidig OPGRADERING-forslag |
| NEEDS-MATHIAS | Stopper plan i alle runder. Code kan IKKE lave V<n+1> før Mathias har afgjort. Reviewer dokumenterer eksplicit spørgsmål til Mathias.          |

OPGRADERING er ikke i konflikt med APPROVAL. Codex kan levere kode-approval
af planen og samtidig foreslå opgradering. Code afgør om opgraderingen tages
med før build.

NEEDS-MATHIAS er ikke kode- eller forretnings-modsigelse. Det er fund hvor
reviewer reelt ikke kan afgøre uden Mathias-input. Se egen sektion "NEEDS-MATHIAS-severity" nedenfor for detaljer.

### Grænse for opgraderings-forslag

Codex' opgraderings-forslag må ALDRIG indebære:

- Ændring af formålet eller scope
- Ændring af leverancer (det Mathias har specificeret)
- Tilføjelse af features

Hvis Codex' "bedre løsning" reelt ændrer hvad planen leverer: det er ikke
en opgradering, det er en funktions-beslutning, og det hører hos Mathias.
Marker i så fald som "OUT OF SCOPE — kræver Mathias-runde".

## NEEDS-MATHIAS-severity (ny 2026-05-18)

Femte severity-niveau, parallel til KRITISK / MELLEM / KOSMETISK / OPGRADERING.
Indført for at fange fund hvor reviewer reelt ikke kan afgøre uden Mathias-input.

### Hvad NEEDS-MATHIAS fanger

Fund der ikke er kode-fejl eller forretnings-modsigelse, men hvor afgørelse er
Mathias' bord:

- **To gyldige tekniske valg uden klar vinder.** Reviewer ser to alternative
  approaches og kan ikke teknisk skille dem ad — valget er forretnings- eller
  retning-baseret.
- **Ny ramme-niveau-beslutning.** Planen introducerer noget der ikke står i
  `mathias-afgoerelser.md` og ikke kan udledes af eksisterende forretnings-
  dokumenter. F.eks. ny disciplin, ny standard-håndtering, ny terminologi.
- **Modsigelse mellem to forretnings-dokumenter.** Reviewer opdager at to af
  de fire forretnings-dokumenter siger modsat — Mathias afgør hvilken der vinder.
- **Scope-grænse-tvivl.** Planen er på grænsen mellem "i scope" og "ikke i scope"
  fra krav-dok, og reviewer kan ikke afgøre uden Mathias.

### Hvad NEEDS-MATHIAS IKKE er

- **KRITISK fund med konkret kilde.** Hvis planen modsiger vision-princip med
  konkret citat: det er KRITISK, ikke NEEDS-MATHIAS. Reviewer håndhæver rammen,
  eskalerer ikke.
- **Kode-bug eller RLS-hul.** Det er KRITISK (kode-niveau), Codex' bord, ikke
  Mathias-eskalering.
- **OPGRADERING.** Reviewer har bedre alternativ — forslå det, lad Code afgøre.

Reviewer skal modstå at bruge NEEDS-MATHIAS som bekvem flugt-vej fra teknisk
afgørelse. Hvis du kan argumentere teknisk: gem ikke til Mathias.

### Konsekvens af NEEDS-MATHIAS-fund

1. **Reviewer leverer FEEDBACK** med fund markeret som NEEDS-MATHIAS
2. **Code ser feedback'en** — men kan IKKE lave V<n+1> baseret på den
3. **Mathias afgør** — enten ved ny entry i `mathias-afgoerelser.md`, ny krav-dok-
   version, eller direkte besked til Code om hvilken vej der tages
4. **Code laver V<n+1>** efter Mathias' afgørelse er dokumenteret

Det er strengere end KRITISK, fordi KRITISK kan adresseres af Code via teknisk
omformulering. NEEDS-MATHIAS kan KUN adresseres af Mathias.

### Format for NEEDS-MATHIAS-fund

```
[NEEDS-MATHIAS] Kort beskrivelse
Spørgsmål til Mathias: [eksplicit, enkelt spørgsmål]
Kontekst: [hvorfor reviewer ikke kan afgøre selv]
Mulige svar: [option A: ... / option B: ... / option C hvis relevant]
Reviewers tentative præference: [hvis nogen, ellers "ingen"]
Hvor Mathias-svaret dokumenteres: [ny entry i mathias-afgoerelser.md med dato / ny krav-dok-version / direkte instruks til Code]
```

Tentative præference er valgfri — reviewer må godt mene noget, men afgørelsen
binder hverken Mathias eller Code.

### Reviewer-disciplin omkring NEEDS-MATHIAS

- **Modstå fristelsen til at eskalere alt.** Hvis du har konkret kilde:
  KRITISK med kildecitat, ikke NEEDS-MATHIAS.
- **Maks 2 NEEDS-MATHIAS-fund per review.** Hvis du har 3+, er du sandsynligvis
  i drift — måske krav-dok skulle have været præcise fra start. Stop og
  rapportér til Mathias at krav-dok-runde måske er nødvendig før plan-runden
  fortsætter.
- **NEEDS-MATHIAS kan IKKE kombineres med APPROVAL.** Hvis du har ét NEEDS-MATHIAS-
  fund og ellers ingen kritiske: lever FEEDBACK med kun det fund — ikke APPROVAL.
  Plan stoppes indtil Mathias har svaret.

## Git-sync-disciplin

Før enhver af de fem triggere defineret i `docs/LÆSEFØLGE.md`:
`git pull origin main`. Påstande baseret på cached/forældet
arbejds-kopi er fabrikation.

Konkret:

- **Code:** pull ved hver af de fem triggere. Ved tvivl: pull først,
  spørg ikke om state først.
- **Codex (automatiseret action):** kører naturligt på commit-trigger,
  har frisk state.
- **Codex (manuel review-runde):** pull før reviewet starter.
  Verificér at HEAD-commit matcher den der reviewes.
- **Claude.ai:** kan ikke pulle direkte. Beder Mathias om commit-hash
  eller seneste fil-indhold ved tvivl. Antager ikke ud fra
  session-hukommelse.

Hvis pull viser uventede commits: STOP, rapportér til Mathias før
arbejdet fortsætter.

## Modsigelses-disciplin (V2 2026-05-20)

Differentieret efter dokument-status (se "Fire forretnings-dokumenter"-sektion ovenfor).

### Modsigelse mod vision (LÅST-AUTORITATIV)

Automatisk blokering. Code/Codex/Claude.ai STOPPER. Commit `docs/coordination/plan-feedback/<pakke>-V<n>-blokeret.md` med konkret reference. Modsigelse er KRITISK og ikke kandidat til G-nummer.

### Modsigelse mod master-plan eller mathias-afgørelser (RETNINGSGIVENDE)

Ikke automatisk blokering. Rapport til Mathias med:

- Konkret citat fra dokumentet der modsiges
- Hvad i pakke-arbejdet der modsiger det
- Forslag: er rammen forældet (skal rettes) eller skal pakke-arbejdet justeres?

Mathias afgør. Hvis ramme rettes: ny master-plan-rettelse (Appendix C) eller ny mathias-afgoerelser-entry. Hvis pakke justeres: krav-dok eller plan opdateres.

### Modsigelse mod krav-dok eller plan inden for pakken (PAKKE-KONTRAKT)

Efter Mathias-godkendelse er krav-dok + plan låst inden for pakken. Modsigelse under build = KRITISK. Code committer `docs/coordination/plan-feedback/<pakke>-V<n>-blokeret.md` og venter på Mathias-afgørelse om re-godkendelse eller pakke-justering.

### Codex' rolle ved modsigelses-fund

- Vision-modsigelse: KRITISK feedback, blokerer plan
- Master-plan/mathias-afgørelser-modsigelse: rapport, ikke blokering — markeret som "TRIGGER: ramme kan være forældet"
- Krav-dok-modsigelse inden for pakke: KRITISK feedback, blokerer plan

### Modsigelses-typer der udløser stop

- Forslag der modsiger Mathias' eksplicitte afgørelser i krav-dokumentet
  eller mathias-afgørelser.md
- Forslag der modsiger vision-princip eller master-plan-paragraf
- Scope-udvidelse udover krav-dokumentets "I scope"-liste
- Reklassificering af "IKKE i scope" til scope
- Ændring af pakke-struktur (samlet vs splittet)
- Intern modsigelse i krav-dokumentet (Mathias afgør om den skal præciseres)

### Forskel fra "Plan-leverance er kontrakt"

"Plan-leverance er kontrakt" (se sektion længere nede) handler om at
Code/Codex skal følge en konkret plan-leverance fra Mathias. Modsigelses-
disciplin handler om at plan-fasen ikke må ændre selve ramme-niveauet —
de fire dokumenter kan kun ændres af Mathias eller via eksplicit ny
Claude.ai-runde.

Plan-leverance er kontrakt nedad (Code respekterer Mathias' specifikation).
Modsigelses-disciplin er kontrakt opad (plan-fasen ændrer ikke rammen).
De gælder samtidig.

## Disciplin-tjekliste — før hver migration skrives

Besvar disse fire spørgsmål eksplicit, inden migration-fil oprettes:

1. **Hvilket vision-element understøtter dette?**
2. **Hvilket vision-element kunne det svække?**
3. **Er der en simplere løsning der bygger samme funktionalitet uden vision-kompromis?**
4. **Hvis kompromis: er det dokumenteret med plan (G-nummer i `docs/teknisk/teknisk-gaeld.md` + deadline)?**
5. **(V5.3) Skal nogen halt-marker rejses?** Tjek mod `docs/skabeloner/workflow-skabelon.md` build-fase marker-protokol — særligt `WORKAROUND-INTRODUCERET` (bevidst kvalitets-sænkning kræver Mathias-gate via `docs/coordination/mathias-gate/`).

**Hvis svaret på spørgsmål 4 er "nej": STOP og spørg Mathias.**
**Hvis spørgsmål 5 rejser en halt-marker: følg V5.3 routing (mathias-gate to-fil-flow).**

Migration-kommentar bør indeholde svaret på 1+2 i kort form (ikke alle fire — det er disciplin-tjek, ikke dokumentationskrav). Større designvalg dokumenteres i vision-tjek-sektion i trin-rapporten.

### Plan-leverance er kontrakt

Hvis Mathias har leveret en eksplicit plan-leverance med konkrete elementer (antal strategier, navne, return-værdier, signaturer, kolonner), er den **kontrakt**, ikke oplæg. Hver afvigelse — selv "harmløs forenkling" — skal flagges og godkendes **før** implementation, ikke efter.

- Hvis planen siger 3 strategier og du kun ser brug for 2, **spørg først**. "Den tredje virker overflødig" er ikke implementations-autoritet.
- Hvis planen siger en konkret værdi (`'[anonymized]'`, sha256, P0002), brug den værdi. Hvis en anden virker bedre, spørg først.
- Forskellen mellem løse tanker og plan-leverance: løse tanker har ord som "vi skal have", "jeg tænker". Plan-leverancer har **lister, tabelnavne, signatur-specs, konkrete return-types**. Den signal er kontrakt.
- Modsat retning: hvis Mathias siger noget retning-givende uden konkrete elementer, behandl det som retning — ikke specifikation. Spørg før der bygges ovenpå.

### Destructive drops kræver preflight

`DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, sletning af rows via DELETE uden WHERE-clause, og lignende destructive operations kræver eksplicit preflight-check eller break-glass-godkendelse. Konkret minimum:

- **Tom-check:** `select count(*) from <tabel>` skal returnere 0, eller eksplicit kvittering for hvor mange rows der tabes
- **Reference-check:** verificér ingen FK refererer den droppede tabel/kolonne (ikke kun CASCADE-fix)
- **Audit-spor:** session-vars `stork.source_type='migration'` + `stork.change_reason='<konkret begrundelse>'` sættes før operation
- **Rollback-plan:** dokumentér hvordan operation kan rulles tilbage hvis nødvendigt (snapshot, backup, eller breaking-change-accepteret)

Pre-cutover (ingen rigtige data): tom-check + audit-spor er minimum.
Post-cutover: alle 4 punkter er CI-blocker; manglende preflight i migration → review-rejection.

R6 (commission_snapshots_candidate + salary_corrections_candidate drops) blev anvendt uden preflight pre-cutover; pragmatisk acceptabelt fordi 132+1 rows var test-data, men patternet markeres her som ikke-skalerbart.

## Vision-tjek-skabelon — i hver trin-rapport

Hver trin-rapport i `docs/strategi/bygge-status.md` skal indeholde en eksplicit `### Vision-tjek`-sektion med følgende punkter:

```markdown
### Vision-tjek

- **Bygger vi den rigtige løsning, eller en workaround?**
  [Konkret svar pr. central design-beslutning i trinnet]

- **Hvis workaround: dokumenteret plan?**
  [G-nummer i docs/teknisk/teknisk-gaeld.md + deadline-trin]

- **Vision-styrkelser denne trin:**
  [Liste — hvilke vision-elementer blev styrket]

- **Vision-svækkelser denne trin:**
  [Liste — hvilke vision-elementer blev svækket, hvis nogen]

- **Teknisk gæld akkumuleret denne trin:**
  [Antal nye G-numre + reference til docs/teknisk/teknisk-gaeld.md]

- **Konklusion:**
  [forsvarligt / kompromis / drift]
```

### Konklusions-betydning

- **forsvarligt** — rigtig løsning bygget, vision styrket eller uændret
- **kompromis** — workaround taget, MEN konkret plan + deadline dokumenteret i `docs/teknisk/teknisk-gaeld.md`
- **drift** — workaround uden plan ELLER vision-svækkelse uden bevidst valg

**Hvis konklusion er `kompromis` ELLER `drift`: STOP og spørg Mathias før commit.** Forklar konkret hvad kompromiset er og hvorfor det blev nødvendigt.

## Hvornår skal jeg stoppe og spørge?

Ud over de fire disciplin-spørgsmål, STOP altid ved:

- Lock-pipeline benchmark fejler SLA
- Master-plan-konflikt (instruktion vs. master-plan-tekst)
- Designvalg ikke afgjort
- Data-tab risiko ud over allerede afgjort
- Vision-tjek-konklusion = `kompromis` eller `drift`
- Inline-fix-autoritet kræver migration der ændrer trin 1-infrastruktur (audit-trigger, RLS-helpers, classification-registry)

Inline-fix-autoritet gælder for tekniske constraints-fixes (CHECK-relaxering, type-cast-håndtering osv.) men SKAL flagges i rapport som inline-fix med G-nummer.

## Kommandolinje-disciplin

- Migration-gate Phase 2 strict er aktiv i CI (`MIGRATION_GATE_STRICT=true`). Alle nye kolonner SKAL klassificeres samme commit.
- Fitness-checks er CI-blockers. Kør lokalt før commit: `node scripts/fitness.mjs`.
- Pre-commit-hook kører `prettier --write` på markdown/json. Reformatér tabeller forventes.
- Husky kræver `pnpm` på PATH (`corepack enable pnpm` hvis ikke installeret).
