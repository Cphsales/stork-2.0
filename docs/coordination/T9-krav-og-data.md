# T9 — Krav og data

**Pakke:** §4 trin 9 — Identitet del 2 (organisations-træet + permission-fundament)
**Status:** Klar til plan-arbejde
**Dato:** 2026-05-17
**Erstatter:** Tidligere T9-krav-og-data.md (omstart efter afdæknings-session 2026-05-17)

---

## 1. Pakkens formål

T9 leverer fundamentet for rettighedsstyring i Stork 2.0. Pakken bygger:

- **Organisations-træet** — Copenhagen Sales med afdelinger, teams og medarbejder-placeringer
- **Permission-fundamentet** — kobler rolle til medarbejder til knude med kan_se/tilgå + kan_skrive + synlighed
- **Permission-elementerne** — område, page, tab som data i DB (det hvor rettigheder gælder)
- **Fortrydelses-mekanisme** — alle ændringer med gældende dato kan fortrydes i en konfigurerbar periode
- **Import-mulighed fra 1.0** — for organisations-træet og medarbejder-placeringer

Pakken leverer ikke frontend-pages og ikke UI til admin-flader. Den leverer rygraden der gør det muligt at bygge dem senere.

---

## 2. Rygsøjlen — ét træ, én kæde

Der er ÉT træ i T9: organisations-træet.

```
Copenhagen Sales
└── afdelinger
    └── (under-afdelinger, vilkårligt antal niveauer)
        └── teams
            └── medarbejdere
```

Permission-kæden hænger sammen sådan:

```
Rolle ←→ Medarbejder ←→ Knude (i organisations-træet)
```

- Rolle sættes på medarbejderen
- Medarbejderen er placeret på en knude
- Synlighed på data evalueres ud fra medarbejderens placering: Hiraki betyder knuden + alt under

Område, page og tab er permission-elementer — steder hvor rettigheder gælder. De er nestede i tre niveauer (område indeholder pages, page indeholder tabs), men de er ikke et "træ" i samme forstand som organisations-træet. De er bare data i DB der definerer hvor en rettighed har effekt.

---

## 3. Forretningsmæssige sandheder (LÅSTE)

Disse er ramme for T9. De er afgjort af Mathias og kan ikke ændres af Code eller Codex.

### 3.1 Organisations-træet

1. **Ejerskabs-kæde:** Copenhagen Sales ejer afdelinger. Afdelinger ejer teams. Teams ejer relationer til medarbejdere og klienter.
2. **Vilkårligt antal niveauer.** Træet kan udvides med nye niveauer (regions, under-afdelinger, mellem-niveauer) uden ramme-ændring.
3. **Hver knude har en type:** afdeling eller team. Typen sættes i UI.
4. **Knude-type bestemmer hvad knuden kan eje:** kun team-knuder kan eje klienter.
5. **Alle navne på afdelinger og teams oprettes i UI** når 2.0 går i drift. Krav-dokumentet specificerer ingen konkrete navne.
6. **Ingen stabs-team i 2.0.** Stabs-konceptet fra 1.0 udgår. Stab-medarbejdere placeres på den passende knude i træet ligesom alle andre.

### 3.2 Medarbejder-placering

1. **En medarbejder er placeret på én knude i træet ad gangen.** Det gælder også stab — ingen stab-undtagelse.
2. **En medarbejder kan være knude-løs.** Indtil placering vælges i UI, har medarbejderen ingen knude. Det er en gyldig tilstand.
3. **Cross-team-adgang løses via rolle og synlighed — ikke via flere placeringer.** Hvis en FM-chef skal se data på tværs af FM-teams, sker det via rolle-permissions med synlighed=Hiraki (når placeret på FM-afdelingen). Det sker ikke ved at give medarbejderen flere placeringer.

### 3.3 Rollen

1. **Hver medarbejder har én rolle ad gangen.** Rolle sættes på medarbejderen i UI.
2. **Rollen bestemmer hvilke rettigheder medarbejderen har** på permission-elementerne (område/page/tab).
3. **Superadmin er den eneste hardkodede rolle.** Alle andre roller bygges i UI med kombination af kan_se/tilgå + kan_skrive + synlighed pr. permission-element.
4. **Mathias og Kasper har superadmin-rollen** og er placeret på en "Ejere"-afdeling i træet.

### 3.4 Klienter

1. **En klient er tilknyttet ét team ad gangen.**
2. **Klient-data følger klienten ved team-skift.** Salg, calls, anden klient-relateret data tilhører klienten — ikke teamet.
3. **Team bevarer historikken om at have ejet klienten i en periode.**
4. **Klient kan ikke dræbe et team.** Et team eksisterer uafhængigt af om dets klienter stopper.

### 3.5 Team-lukning

1. **Team-lukning er en UI-handling** udført af en bruger med tilstrækkelige rettigheder.
2. **Når et team lukkes, bliver dets medarbejdere knude-løse.** De forbliver ansatte. De kan tildeles ny placering i UI.
3. **Klient-tilknytninger på et lukket team skal håndteres** i samme flow.
4. **Knuder anonymiseres ikke.** Afdelings- og team-navne er forretningsdata, ikke persondata.

### 3.6 Historik og fortrydelse

1. **Gammel sandhed ændres ikke af ny sandhed.**
2. **Alle ændringer med gældende dato kan fortrydes i en periode.** Det gælder strukturændringer, medarbejder-flytninger, klient-flytninger.
3. **Fortrydelses-flowet:** bruger laver ændring med gældende dato → ændring godkendes → fortrydelses-periode starter → ændring kan rulles tilbage i UI indtil periodens udløb → derefter er ændringen permanent.
4. **Fortrydelses-periodens længde konfigureres i UI.** Ingen hardkodet værdi.

### 3.7 Import fra 1.0

1. **Import skal være muligt fra dag ét** for organisations-træet, afdelinger, teams og medarbejder-placeringer.
2. **Klient-til-team-import udskydes til trin 10** — kræver klient-skabelon der bygges der.
3. **Ingen fast tidshorisont.** Brugeren afgør hvor langt tilbage data hentes.
4. **Import-flow er manuelt:** discovery-rapport → bruger retter i 1.0 eller markerer hvad der håndteres ved import → manuel eksekvering.

### 3.8 Rettigheds-styring

1. **Hvem der må gøre hvad styres via rettigheder i UI.** Det gælder også oprettelse, ændring og lukning af knuder i træet og permission-elementer.
2. **Ingen særlig "ledelses-handling"-kategori.** Adgangen til strukturen er en almindelig rettighed.

---

## 4. Funktioner T9 skal levere

Dette afsnit beskriver HVAD systemet skal kunne gøre. Det er det centrale — krav-dokumentet er en kontrakt på funktioner, ikke på datastruktur.

### 4.1 Funktioner på organisations-træet

| Funktion           | Beskrivelse                                                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Opret knude        | Bruger med tilstrækkelige rettigheder kan oprette en ny knude (afdeling eller team) i træet med navn, type og forælder-knude                                                         |
| Ændr knude         | Bruger kan ændre navn på knude, flytte den til ny forælder, deaktivere den                                                                                                           |
| Deaktivér knude    | Bruger kan sætte en knude inaktiv. Den bliver stående i træet for historik, men kan ikke vælges som ny placering                                                                     |
| Luk team           | Bruger lukker et team. Alle aktive medarbejder-placeringer på teamet bliver lukket samtidig (medarbejderne bliver knude-løse). Klient-tilknytninger på teamet håndteres i samme flow |
| Hent træet         | Bruger kan se hele træet med alle aktive knuder                                                                                                                                      |
| Hent historisk træ | Bruger kan se hvordan træet så ud på en given dato i fortiden                                                                                                                        |

Alle handlinger der ændrer strukturen følger fortrydelses-mekanismen med gældende dato.

### 4.2 Funktioner på medarbejder-placering

| Funktion                 | Beskrivelse                                                                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Placér medarbejder       | Bruger placerer en medarbejder på en knude i træet med gældende dato                                                                      |
| Flyt medarbejder         | Bruger flytter en medarbejder fra én knude til en anden med gældende dato (gammel placering lukkes, ny åbnes — det sker som én operation) |
| Fjern fra knude          | Bruger fjerner medarbejder fra knude. Medarbejderen bliver knude-løs (forbliver ansat)                                                    |
| Hent placering           | Bruger kan se hvor en medarbejder er placeret aktuelt                                                                                     |
| Hent historisk placering | Bruger kan se hvor en medarbejder var placeret på en given dato i fortiden                                                                |

Alle placerings-handlinger følger fortrydelses-mekanismen.

### 4.3 Funktioner på klient-til-team-tilknytning

| Funktion                   | Beskrivelse                                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Tilknyt klient             | Bruger tilknytter en klient til et team med gældende dato. Kun team-knuder kan modtage klient-tilknytning         |
| Skift klients team         | Bruger skifter en klients team-tilknytning med gældende dato (gammel tilknytning lukkes, ny åbnes — én operation) |
| Lukk klients tilknytning   | Bruger lukker en klients tilknytning. Klienten bliver team-løs                                                    |
| Hent klients team          | Bruger kan se hvilket team en klient aktuelt er tilknyttet                                                        |
| Hent historisk tilknytning | Bruger kan se hvilket team en klient var tilknyttet på en given dato i fortiden                                   |

Alle klient-tilknytnings-handlinger følger fortrydelses-mekanismen.

### 4.4 Funktioner på rolle og medarbejder

| Funktion     | Beskrivelse                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| Tildel rolle | Bruger tildeler en rolle til en medarbejder                                                            |
| Skift rolle  | Bruger skifter en medarbejders rolle                                                                   |
| Fjern rolle  | Bruger fjerner rolle fra medarbejder (medarbejderen mister adgang udover personlige basale funktioner) |

### 4.5 Funktioner på permission-elementerne (område, page, tab)

| Funktion          | Beskrivelse                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| Opret område      | Bruger opretter et nyt område med navn                                                         |
| Opret page        | Bruger opretter en ny page under et område                                                     |
| Opret tab         | Bruger opretter en ny tab under en page                                                        |
| Ændr element      | Bruger kan ændre navn på område/page/tab, ændre rækkefølge, ændre hvilken page en tab tilhører |
| Deaktivér element | Bruger sætter et element inaktivt (bliver stående for historik)                                |
| Hent struktur     | Bruger kan se alle aktive områder/pages/tabs                                                   |

Page-implementationen (selve React-komponenten der renderer pagen) er kode og bygges i lag F. T9 leverer kun registret over hvilke områder/pages/tabs der findes som data.

### 4.6 Funktioner på rettigheder (kobler rolle til permission-element)

| Funktion                | Beskrivelse                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Sæt rettighed           | Bruger sætter for en (rolle × område/page/tab)-kombination: kan_se/tilgå (ja/nej), kan_skrive (ja/nej), synlighed (Sig selv / Hiraki / Alt) |
| Ændr rettighed          | Bruger ændrer eksisterende rettighed                                                                                                        |
| Fjern rettighed         | Bruger fjerner en rettighed (rollen mister adgang til det element)                                                                          |
| Hent rolles rettigheder | Bruger kan se alle rettigheder for en given rolle                                                                                           |

### 4.7 Funktioner på fortrydelse

| Funktion                        | Beskrivelse                                                                                                    |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Godkend ændring                 | Bruger godkender en ændring der er lavet med gældende dato. Godkendelsen starter fortrydelses-perioden         |
| Fortryd ændring                 | Bruger ruller en ændring tilbage i fortrydelses-perioden. Tilstand føres tilbage til som den var før ændringen |
| Hent ventende ændringer         | Bruger kan se hvilke ændringer er godkendt og stadig i fortrydelses-perioden                                   |
| Konfigurér fortrydelses-periode | Bruger med tilstrækkelige rettigheder sætter længden på fortrydelses-perioden i UI                             |

### 4.8 Funktioner på import fra 1.0

| Funktion                  | Beskrivelse                                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Generér discovery-rapport | System genererer en rapport over fejl, dubletter og inkonsistenser i 1.0-data for organisations-træet og medarbejder-placeringer |
| Eksekvér import           | Bruger eksekverer importen efter at have rettet i 1.0 eller markeret hvad der håndteres                                          |

Import af klient-til-team-tilknytninger ligger ikke i T9.

### 4.9 Funktioner på synligheds-evaluering

Når en page i frontend skal vise data, evalueres synligheden ud fra:

1. Den aktuelle brugers rolle
2. Rollens rettighed på det aktuelle permission-element (kan_se/tilgå, kan_skrive, synlighed)
3. Den aktuelle brugers placering i organisations-træet (hvis synlighed=Hiraki)

Synlighedsmekanismen leverer:

- **Sig selv** → kun brugerens egne data
- **Hiraki** → data fra brugerens knude og alle knuder under
- **Alt** → alle data uanset placering

Hvis brugeren er knude-løs og synlighed=Hiraki, ser brugeren ingen data.

---

## 5. Permission-modellen

### 5.1 To akser pr. (rolle × permission-element)

For hver kombination af (rolle × område × page × tab) sættes:

**Akse 1 — Hvad man kan tilgå:**

- kan_se/tilgå: ja/nej
- kan_skrive: ja/nej

**Akse 2 — Synlighed på data:**

- Sig selv
- Hiraki
- Alt

### 5.2 Permission-elementerne har tre niveauer

Rettigheder kan sættes på:

- Område-niveau (gælder området som helhed)
- Page-niveau (gælder den specifikke page under området)
- Tab-niveau (gælder den specifikke fane på pagen)

Hvis et niveau ikke er sat eksplicit, arves værdien fra niveauet over. Krav-dokumentet specificerer ikke hvordan arve-logikken teknisk evalueres — det er Code's bord.

### 5.3 Synlighed udledes af placering

Synlighed er ikke en valgt værdi pr. medarbejder — den er en regel pr. (rolle × permission-element). Den faktiske synlighed afhænger af medarbejderens placering i organisations-træet.

Eksempler:

- TM-sælger placeret på Eesy TM-teamet, rolle har synlighed=Sig selv på vagtplan-page → ser kun egne vagter
- TM-sælger samme placering, rolle har synlighed=Hiraki på kalender-page → ser hele teamets kalender (hvis under teamet er der intet, bliver det reelt = teamets medlemmer)
- FM-chef placeret på FM-afdelingen, rolle har synlighed=Hiraki på løn-page → ser løn for hele FM-afdelingen og alle teams under
- Mathias som superadmin, rolle har synlighed=Alt på alt → ser alle data

### 5.4 Superadmin

Superadmin er den eneste hardkodede rolle. Den har synlighed=Alt på alle permission-elementer. Mathias og Kasper har superadmin-rollen.

---

## 6. Historik og fortrydelse

### 6.1 Princip

Gammel sandhed ændres ikke af ny sandhed. Historik om alle struktur-ændringer, medarbejder-placeringer og klient-tilknytninger bevares.

### 6.2 Fortrydelses-flow

For alle ændringer med gældende dato:

1. Bruger laver ændring i UI med en gældende dato
2. Ændringen godkendes (bruger med tilstrækkelige rettigheder)
3. Fortrydelses-periode starter ved godkendelse
4. I fortrydelses-perioden kan ændringen rulles tilbage i UI
5. Når fortrydelses-perioden udløber, er ændringen permanent

Yderligere ændringer efter permanens kræver ny ændring med ny gældende dato.

### 6.3 Fortrydelses-periodens længde

- Konfigureres i UI
- Kan eventuelt være forskellig for forskellige ændrings-typer hvis konfigurationen tillader det

### 6.4 Hvad sker ved fortrydelse

- Tilstanden ruller tilbage til som den var før ændringen
- Audit-spor bevares — fortrydelsen er sin egen audit-begivenhed

---

## 7. Status og forudsætninger

### 7.1 Allerede bygget i tidligere trin

- Trin 1-6: schemas, audit, klassifikations-registry, retention-disciplin, migration-gate
- Trin 5: roller og rolle-permission-tabel eksisterer
- Medarbejder-tabellen eksisterer

### 7.2 Hvad T9 udvider på eksisterende

- Eksisterende permission-tabel fra trin 5 (page_key + tab_key + can_view + can_edit + scope + role_id) udvides til:
  - At inkludere område-niveau over page
  - Opdaterede synligheds-værdier (Sig selv / Hiraki / Alt)
- Eksisterende rækker migreres til den nye struktur. Krav-dokumentet specificerer ikke hvordan migrationen sker teknisk.

---

## 8. Ikke en del af T9

- **Frontend-pages og admin-UI'er** — lag F
- **Klient-skabelon med felter** — trin 10
- **Klient-til-team-import fra 1.0** — trin 10
- **Lokations-skabelon** — trin 10b
- **Sælger-attribution og identitets-master** — trin 15
- **Lønberegning** — senere trin
- **Microsoft Entra ID auth-implementation** — orthogonalt; auth-kolonner eksisterer

---

## 9. Tekniske valg overladt til Code og Codex

Krav-dokumentet specificerer kun forretningsmæssige sandheder og funktioner. Følgende er Code's og Codex' opgave:

- Hvordan organisations-træet teknisk implementeres
- Hvordan medarbejder-placering teknisk gemmes og opdateres
- Hvordan klient-til-team-tilknytning teknisk modelleres
- Hvordan permissions teknisk evalueres med tre niveauer (område/page/tab)
- Hvordan synlighed Hiraki teknisk udledes og evalueres
- Hvordan fortrydelses-mekanismen teknisk realiseres
- Hvordan historik teknisk gemmes
- Hvordan triggers vedligeholder konsistens
- Hvordan migration-scripts struktureres
- Hvilke fitness-checks og tests
- Konkrete tabel- og kolonne-navne
- Hvordan eksisterende permission-tabel fra trin 5 migreres til den nye struktur

Hvis Code finder at en teknisk afgørelse rummer en forretningsmæssig dimension der bør være Mathias' bord, flagges det eksplicit i plan-arbejdet — ikke besluttet af Code alene.

---

## 10. Mathias-afgørelser (input til T9)

| #   | Afgørelse                                                                                                         | Reference                                                            |
| --- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | Copenhagen Sales → afdelinger → teams → relationer (ejerskabs-kæde)                                               | mathias-afgoerelser 2026-05-16 pkt 1                                 |
| 2   | Afdelinger ændres sjældent; historik bevares                                                                      | mathias-afgoerelser 2026-05-16 pkt 2                                 |
| 3   | Team kan ophøre; medarbejdere bliver knude-løse                                                                   | mathias-afgoerelser 2026-05-16 pkt 3 + afdæknings-session 2026-05-17 |
| 4   | Klient kan aldrig dræbe et team                                                                                   | mathias-afgoerelser 2026-05-16 pkt 4                                 |
| 5   | Klient ejer sin egen data; følger klienten ved team-skift; team bevarer historik                                  | mathias-afgoerelser 2026-05-16 pkt 5                                 |
| 6   | Aktiv/inaktiv-flag på knuder for synlighed                                                                        | mathias-afgoerelser 2026-05-16 pkt 6                                 |
| 7   | Én medarbejder på én knude ad gangen; også stab                                                                   | mathias-afgoerelser 2026-05-16 pkt 7                                 |
| 8   | Cross-team-adgang løses via rolle med synlighed, ikke via flere placeringer                                       | mathias-afgoerelser 2026-05-16 pkt 7 (anden del)                     |
| 9   | Ingen hardkodet horizon for migration; manuel eksekvering                                                         | mathias-afgoerelser 2026-05-16 pkt 8                                 |
| 10  | Teams/afdelinger anonymiseres ikke                                                                                | mathias-afgoerelser 2026-05-16 pkt 9                                 |
| 11  | Permission-elementer (område, page, tab) er data i DB; kan oprettes/deaktiveres i UI uden deploy                  | Mathias 2026-05-11 + afdæknings-session 2026-05-17                   |
| 12  | Permission-elementer har tre niveauer: Område → Page → Tab                                                        | Afdæknings-session 2026-05-17                                        |
| 13  | Permission-modellen har to akser: kan_se/tilgå + kan_skrive, og synlighed                                         | Stork 1.0 UI-design + afdæknings-session 2026-05-17                  |
| 14  | Synligheds-værdier: Sig selv / Hiraki / Alt (kun tre)                                                             | Afdæknings-session 2026-05-17                                        |
| 15  | Hiraki udledes af medarbejderens placering i organisations-træet                                                  | Afdæknings-session 2026-05-17                                        |
| 16  | Synlighed sættes pr. (rolle × område × page × tab) — kan være forskellig på forskellige elementer for samme rolle | Afdæknings-session 2026-05-17                                        |
| 17  | Superadmin = synlighed=Alt på alt; eneste hardkodede rolle                                                        | mathias-afgoerelser 2026-05-11 + afdæknings-session 2026-05-17       |
| 18  | Mathias og Kasper har superadmin-rollen; placeret på "Ejere"-afdeling                                             | Afdæknings-session 2026-05-17                                        |
| 19  | Klienter tilknyttes kun knuder af type team                                                                       | Afdæknings-session 2026-05-17                                        |
| 20  | En medarbejder kan være knude-løs (gyldig tilstand)                                                               | Afdæknings-session 2026-05-17                                        |
| 21  | Ingen stabs-team i 2.0                                                                                            | Afdæknings-session 2026-05-17                                        |
| 22  | Alle ændringer med gældende dato følger fortrydelses-mekanisme                                                    | Afdæknings-session 2026-05-17                                        |
| 23  | Fortrydelses-periodens længde konfigureres i UI                                                                   | Afdæknings-session 2026-05-17                                        |
| 24  | Import fra 1.0 dækker organisations-træ + medarbejder-placeringer                                                 | Afdæknings-session 2026-05-17                                        |
| 25  | Klient-til-team-import udskydes til trin 10                                                                       | Afdæknings-session 2026-05-17                                        |
| 26  | Alle navne på afdelinger og teams oprettes i UI                                                                   | Afdæknings-session 2026-05-17                                        |
| 27  | Hvem der kan oprette/ændre/lukke knuder styres via rettigheder i UI; ingen særlig ledelses-handling-kategori      | Afdæknings-session 2026-05-17                                        |
| 28  | Der er ÉT træ (organisations-træet); permission-elementer er ikke et træ                                          | Afdæknings-session 2026-05-17                                        |
| 29  | Tx-rollback default mønster for DB-tests                                                                          | mathias-afgoerelser 2026-05-16                                       |
| 30  | Plan-leverance er kontrakt                                                                                        | mathias-afgoerelser 2026-05-15                                       |
| 31  | Fire-dokument-disciplin obligatorisk i plan                                                                       | mathias-afgoerelser 2026-05-16                                       |
| 32  | Oprydnings-strategi obligatorisk i plan                                                                           | mathias-afgoerelser 2026-05-16                                       |

---

## 11. Fire-dokument-konsultation

| Dokument                                   | Relevante referencer for T9                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/strategi/vision-og-principper.md`    | Princip 1 (data-kontrol i UI); Princip 2 (rettigheder i UI med rolle og synlighed, superadmin eneste hardkodede); Princip 3 (forretningslogik som data); Princip 6 (audit på alt der ændrer data); Princip 8 (identitet eksisterer én gang — medarbejder er anker); Princip 9 (status-modeller bevarer historik — fortrydelses-mekanisme) |
| `docs/strategi/stork-2-0-master-plan.md`   | §0.5 migration-grundprincip; §1.7 identitet og rettigheder; §1.11 core_identity-schema; §3 CI-blockers; §4 trin 9                                                                                                                                                                                                                         |
| `docs/coordination/mathias-afgoerelser.md` | 2026-05-11 (vision + superadmin + PageKey som data); 2026-05-15 (plan-leverance som kontrakt); 2026-05-16 (9-punkts forretningssandhed + fire-dokument-disciplin + oprydnings-disciplin); 2026-05-17 afdæknings-session (skal tilføjes som ny entry samtidig med dette krav-dok)                                                          |
| Dette krav-dok (`T9-krav-og-data.md`)      | Sektion 2 (rygsøjlen), sektion 3 (forretningssandheder), sektion 4 (funktioner), sektion 5 (permission-modellen), sektion 6 (historik og fortrydelse), sektion 9 (tekniske valg overladt), sektion 10 (Mathias-afgørelser-tabel)                                                                                                          |

Code skal i plan-arbejdet eksplicit udfylde firekolonne-tabel (dokument / konsulteret / referencer / konflikt).

---

## 12. Oprydnings- og opdaterings-strategi

### 12.1 Filer der arkiveres efter T9-merge

- `docs/coordination/T9-krav-og-data.md` → `docs/coordination/arkiv/`
- `docs/coordination/T9-plan.md` (når plan eksisterer) → `docs/coordination/arkiv/`
- Alle `docs/coordination/plan-feedback/T9-*.md` → `docs/coordination/arkiv/`

### 12.2 Dokumenter der opdateres som del af T9-build

- `docs/coordination/aktiv-plan.md` — ryd til "ingen aktiv plan", tilføj T9 til Historisk-sektion
- `docs/coordination/seneste-rapport.md` — pege på T9-slut-rapport
- `docs/strategi/bygge-status.md` — trin 9 markeres godkendt; PAUSET-status fjernes
- `docs/teknisk/permission-matrix.md` — opdateres med nye område/page/tab-niveauer og synligheds-værdier
- `docs/teknisk/teknisk-gaeld.md` — eventuelle G-numre registreres
- `docs/coordination/mathias-afgoerelser.md` — afdæknings-session 2026-05-17 entry tilføjes (Mathias-handling)

### 12.3 Ansvar

- Code udfører arkivering og dokument-opdateringer som del af build-PR
- Slut-rapporten verificerer udførelse i "Oprydning + opdatering udført"-sektion
- Manglende udførelse = KRITISK feedback fra reviewere

### 12.4 Grep-tjek post-pakke

- `grep -r "T9-krav-og-data\|T9-plan" docs/` returnerer kun arkiv + rapport-historik + slut-rapport
- `grep -r "PAUSET" docs/strategi/bygge-status.md` returnerer 0 hits

---

## 13. Forventet flow

1. Mathias godkender dette krav-dok
2. Krav-dok committes til main
3. Mathias-afgørelser-entry for afdæknings-session 2026-05-17 committes samtidig
4. Code paster qwerr → laver T9-plan V1
5. Codex og Claude.ai reviewer V1 parallelt
6. V1 → V2 → ... indtil begge approver
7. Mathias paster qwerg → build starter
8. Slut-rapport leveres med oprydning udført
9. Slut-rapport reviewes
10. Pakke merget; arkivering udført

---

**Krav-dok klar til Mathias-godkendelse.**
