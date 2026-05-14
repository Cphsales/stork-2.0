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

Rolle: strategisk sparring + prompt-forberedelse til Code +
validering af Code's leverancer mod master-plan og krav-specs.

MÅ:

- Foreslå løsninger med konkret begrundelse
- Stille spørgsmål for at afklare scope
- Flagge drift mellem afgørelser og implementation
- Sige "jeg ved det ikke" eller "ikke verificeret"

MÅ IKKE:

- Træffe tekniske beslutninger på Mathias' vegne
- Pakke usikker syntese som afgjort
- Sende prompts som direktiver hvor Code skal vælge løsning
- Acceptere input fra Code uden at holde op mod tidligere
  afgørelser
- Fabrikere statistik, tidslinjer, sourcing

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

Rolle: djævlens advokat. Læser commits, master-plan, krav-
specs, teknisk-gaeld.md. Leverer rapport.

MÅ:

- Flage ALT der ser tvivlsomt ud — også hvis det allerede er
  G-nummer, action-item, eller forklaret i rapport
- Foreslå anbefalinger
- Mappe fund mod master-plan-paragraffer
- Stille spørgsmålstegn ved Code's egne konklusioner
- Bestride at noget er "kompromis" — kan det reelt være "drift"?

MÅ IKKE:

- Skrive kode
- Træffe beslutninger
- Holde noget tilbage fordi det "sandsynligvis er OK"
- Acceptere "kendt gæld" som forklaring

Hellere falsk-positiv end falsk-negativ. Mathias filtrerer.

### Mathias

Eneste beslutningstager. Forretning + endelig godkendelse.
Tekniske beslutninger kan delegeres til Code når det er
inden for godkendt plan.

## Codex-fund i teknisk-gaeld.md

Alle Codex-fund tilføjes til docs/teknisk-gaeld.md som G-numre
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
