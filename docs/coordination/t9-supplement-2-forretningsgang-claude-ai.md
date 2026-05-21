---
status: forretningsgang-rapport (Step 1.0)
pakke: T9-supplement-2 (G057 + G059)
aktør: Claude.ai
kilder: vision + master-plan + mathias-afgoerelser + chat-projekt
---

# T9-supplement-2 — Forretningsgang-rapport (Claude.ai)

## Resume

Pakken adresserer to selvstændige inkonsekvenser der opstod fordi trin 10
(T10.7b) løste én forretningspolitisk og én teknisk problemstilling for
klient-RPC'erne, men ikke for de øvrige T9-write-veje. Begge handler om hvad
der sker når en authenticated bruger eller superadmin udfører en
T9-forretningshandling (struktur-ændring, team-lukning, medarbejder-placering)
via det UI vi senere skal bygge.

G059 er rent teknisk: 5 wrapper-RPC'er kan ikke gennemføre den forretningsgang
de er bygget til, fordi de aldrig sætter det session-flag som RLS-policyen
forventer. Forretningsgangen er entydigt defineret andetsteds; her er det kun
spørgsmål om at vejen virker. G057 er forretningspolitisk: T10.7b etablerede
et bypass-mønster for klient-invarianter der hviler på en "superadmin må alt"-
ramme, men den eksplicitte ramme-afgørelse er ikke verificeret i
mathias-afgoerelser.md som en distinkt entry. Inden T9's tilsvarende
invarianter bypasses, skal rækkevidden afgøres af Mathias.

## Forretningsgange/logikker

### G059 — Almindelig bruger opretter pending change for organisations-struktur

**Hvad ved vi?**

- Pending-change-mekanismen er ramme-låst forretningsgang. Mathias-afgørelse
  2026-05-17 punkt 13: "Alle ændringer med gældende dato følger fortrydelses-
  mekanisme: gældende dato → godkendelse → fortrydelses-periode → ændring kan
  rulles tilbage i UI indtil periodens udløb → derefter permanent. Gælder
  struktur-ændringer, medarbejder-placeringer, klient-flytninger."
- Hvem der må starte forretningsgangen styres i UI, ikke i kode.
  Mathias-afgørelse 2026-05-17 punkt 12: "Hvem der må oprette/ændre/lukke
  knuder styres via rettigheder i UI. Ingen særlig ledelses-handling-kategori;
  struktur-adgang er almindelig rettighed."
- Vision-princip 2: "Rettigheder i UI" — alle ikke-superadmin-handlinger må
  kunne udføres af brugere der har fået rettigheden i UI'et.
- G059 (teknisk-gaeld.md) konstaterer at 5 wrapper-RPC'er i dag ikke kan
  gennemføre denne forretningsgang fordi de aldrig sætter
  `stork.t9_write_authorized`. Manifesterer sig først når frontend bygges.

### G059 — Almindelig bruger placerer eller fjerner medarbejder fra team

**Hvad ved vi?**

- Forretningsgangen er en "ændring med gældende dato" jf. mathias-afgørelse
  2026-05-17 punkt 13 — skal gå gennem pending-change-mekanismen.
- Forretnings-fundament for placerings-modellen er låst:
  - Mathias-afgørelse 2026-05-17 punkt 7: "Knude-løs medarbejder er gyldig
    tilstand."
  - Mathias-afgørelse 2026-05-16 punkt 7: "Én medarbejder kan kun være i ét
    team ad gangen. Det gælder også stab — ingen stab-undtagelse i 2.0."
- Forretningsgangen er ikke specifik for klient — det er fundament for
  identitets-driften. Vej skal virke for almindelig HR/team-lead-bruger der
  har rettighed.

### G059 — Almindelig bruger lukker team eller deaktiverer afdeling

**Hvad ved vi?**

- Forretningsgangen er ramme-låst. Mathias-afgørelse 2026-05-16 punkt 3:
  "Team kan ophøre som ledelses-handling. Når et team ophører, forbliver
  medarbejderne ansatte uden team-tilknytning (ikke fyret, bare team-løse)."
- Mathias-afgørelse 2026-05-16 punkt 6: "Synlighed af gamle teams og
  afdelinger: Når et team eller en afdeling ikke længere skal bruges, sættes
  det til ikke-aktivt. Det forhindrer at det vælges når nye medarbejdere eller
  klienter tilknyttes, men det bliver stående i systemet så gamle rapporter
  stadig kan slå op i det."
- Vejen via T9-wrapperne er den ramme der eksisterer i dag for at gennemføre
  denne forretningsgang. G059 forhindrer den i at virke for authenticated
  bruger.

### G057 — Superadmin lukker et allerede-inaktivt team

**Hvad ved vi?**

- Forretningssituation: superadmin trykker "luk team" i UI på et team der
  allerede er inaktivt (idempotency-case, eller dobbeltklik, eller rettelse
  efter forvirring).
- Den almindelige forretningsregel afviser: et team kan ikke lukkes hvis det
  allerede er inaktivt. Det er rimeligt for almindelig bruger.
- Forventningen om superadmin er ikke entydigt låst. Vision-princip 2 siger
  "Superadmin er eneste hardkodede rolle" — det er om hvor permission-konfig
  lever, ikke om bypass af forretnings-invarianter. Mathias-afgørelse
  2026-05-17 punkt 10: "Superadmin = synlighed=Alt på alle elementer" — om
  synligheds-aksen, ikke om bypass af forretnings-checks.
- T10.7b etablerede bypass-mønstret for klient-aktiv-check med reference til
  "Mathias-afgørelse 2026-05-21 'superadmin må alt'" (teknisk-gaeld.md G057).
  Den eksplicitte ramme-entry "superadmin må alt" kan jeg ikke verificere i
  mathias-afgoerelser.md. **Åbent spørgsmål** — se afsnit nedenfor.

### G057 — Superadmin placerer klient på team der er lukket på effective_from

**Hvad ved vi?**

- Forretningssituation: superadmin skal fx korrigere en historisk fejl eller
  håndtere en nødsituation hvor en klient skal være tilknyttet et team der i
  mellemtiden er blevet lukket.
- Den almindelige forretningsregel afviser: klient kan kun placeres på et
  aktivt team. Det er rimeligt for almindelig bruger.
- Forretnings-sandhed om klient-til-team-binding er låst.
  Mathias-afgørelse 2026-05-17 punkt 6: "Klienter tilknyttes kun knuder af
  type team. Aldrig afdelings-knuder." Dette er strukturel invariant og
  bypasses ikke (G057 noterer dette korrekt).
- Aktiv-checken på team er forretnings-invariant, ikke strukturel.
  G057 noterer afgrænsningen mellem de to typer korrekt.
- Hvad rækkevidden af superadmin-bypass på forretnings-invarianter er:
  **åbent spørgsmål** — se afsnit nedenfor.

### G057 — Strukturelle invarianter bypasses aldrig

**Hvad ved vi?**

- G057 ekskluderer eksplicit tre strukturelle invarianter fra bypass-rammen:
  `client_placement_node_not_team`, `team_close_not_team`,
  `node_not_team_or_inactive`. Begrundelse i G057: "data-model holder kun ved
  team-niveau-binding; bypass ville korrumpere."
- Forretnings-grundlaget er mathias-afgørelse 2026-05-17 punkt 6 ("Klienter
  tilknyttes kun knuder af type team. Aldrig afdelings-knuder") — det er
  strukturel sandhed om hvad en klient overhovedet KAN være, ikke en
  forretnings-tilstand der ændres i tid.
- Vision-princip 8: "Identitet eksisterer én gang. Personer findes som én
  entitet. Systemer kobles via identity-mapping, ikke parallelle person-
  tabeller." Analog logik for org-struktur: koblings-typer er strukturelle,
  ikke valgfrie.

## Åbne spørgsmål til Mathias

### ÅBENT 1 — Eksplicit ramme-afgørelse: rækkevidden af "superadmin må alt"

T10.7b etablerede et bypass-mønster på klient-RPC'erne der refereres til som
"Mathias-afgørelse 2026-05-21 'superadmin må alt'". Den eksplicitte
ramme-entry findes ikke i mathias-afgoerelser.md (verificeret via læsning).
Vision-princip 2 og 2026-05-17 punkt 10 dækker permission/synlighed-aksen,
ikke bypass af forretnings-invarianter.

**Mathias bør afgøre eksplicit:**

- Skal superadmin kunne bypasse forretnings-invarianter (aktiv-check, allerede-
  inaktivt-check) som almindelig praksis for nød-operationer? Eller var T10.7b
  en pakke-specifik beslutning der ikke har bredere ramme-status?
- Hvis ramme-status: skal afgørelsen registreres som entry i
  mathias-afgoerelser.md før denne pakke bruger den som kilde? (jf. krav-dok-
  disciplin om kilde-traversering)
- Hvis pakke-specifik: skal T9's invarianter forblive uden bypass, og
  klient-bypasset i T10.7b revurderes som inkonsekvens den anden vej?

### ÅBENT 2 — Idempotency vs. eksplicit bypass-rolle

Hvis superadmin skal kunne lukke allerede-inaktivt team, er der to forretnings-
modeller at vælge mellem:

- **Idempotency-model:** "luk team" er idempotent for superadmin — allerede-
  inaktivt resulterer i no-op. Almindelig bruger får fortsat fejl.
- **Eksplicit bypass-rolle:** check stopper alle (også superadmin); superadmin
  går via separat sti (fx break-glass eller dedikeret RPC) når nødvendigt.

Mathias afgør hvilken model der matcher forretnings-intentionen. T10.7b's
klient-bypass følger en variant af model 1.

## Forretningsgange der IKKE er i spil

- Mathias-afgørelse 2026-05-17 punkt 6 (klienter tilknyttes kun teams) er
  strukturel og bypasses ikke, jf. G057's eksplicitte afgrænsning.
- Pending-change-flowet selv (mathias-afgørelse 2026-05-17 punkt 13) ændres
  ikke — fortrydelses-mekanisme + gælder-dato bevares.
- Vision-princip 9 (status-modeller bevarer historik) ændres ikke — bypass
  ændrer hvem der kan udføre handlingen, ikke historik-modellen.

## Pakke-skala-vurdering (foreløbig, kan ændres)

Min vurdering: **Lille pakke** (0-2 åbne spørgsmål). G059 er entydigt teknisk
fix; forretningsgangene er låste i mathias-afgoerelser 2026-05-17 + 2026-05-16.
G057 har én forretningspolitisk afgørelse (rækkevidden af superadmin-bypass)
som Mathias kan svare på i chat uden krav-dok-fase. Mathias afgør om vurderingen
holder efter konsolidering med Code's og Codex's rapporter.
