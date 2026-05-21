# T9-supplement-2 — krav og data

**Pakke-type:** Stor opfølgnings-pakke (skala-justering 2026-05-21). Lukker G057 + G059 + indfører ny approve-disciplin pr. handling + indfører handlings-granularitet under tabs.

**Forudsætning:** T9-fundament + T9-supplement merget; trin 10 merget (klient-bypass-mønstret etableret).

---

## 1. Formål

Pakken samler fire relaterede forretnings-emner om hvordan brugere udfører handlinger via permission-systemet og fortrydelses-flowet:

- **G059:** Almindelige brugere kan ikke gennemføre struktur- og placerings-handlinger via UI (oprette/ændre afdeling, lukke team, placere medarbejder). Det skal virke for brugere med skrive-rettighed på den relevante side. I dag fixet for klient-handlinger; resten skal lukkes.

- **G057:** Superadmin bliver blokeret af to forretnings-vagter (klient-placering på inaktivt team, lukning af allerede-inaktivt team). Superadmin skal kunne udføre disse handlinger som nød-operation. Mønstret er etableret for klient-aktiv-check; de to øvrige skal lukkes.

- **Ny approve-disciplin:** Den nuværende blokering af selv-approve for almindelige brugere er forkert som default. Default skal være: har du skrive-rettighed, må du udføre handlingen direkte (også selv-approve egen pending). Pr. specifik handling kan koden tænde to ekstra discipliner: "kræver 2. godkender" og "har fortrydelses-periode". Når 2. godkender er på, vælger UI hvem (en højere medarbejder i organisationen eller superadmin).

- **Ny handlings-granularitet:** Permission-modellen kan i dag ikke skelne mellem "kan skrive på siden generelt" og "må udføre den specifikke handling". Vi tilføjer handlings-niveau under tabs så enkelte handlinger kan tildeles uafhængigt — fx "godkende fortrydelses-anmodning" eller "deaktivere klient" kan kræve specifik handlings-tildeling ud over almindelig skrive-rettighed på sidens tab.

Standard se- og skrive-rettighed på område/side/tab forbliver uændret som ramme for adgang. Den nye granularitet og approve-disciplin ligger som ekstra lag ovenpå.

---

## 2. Forretningssandheder (kilde-validerede)

### 2.1 Side/tab + se/skrive er rammen for adgang

Det er selve siden/tab'en der afgør hvilke ting der kan rettes. Hvis man har adgang til en side (fx vagtplan) og man har skrive-rettigheder på den side, kan man tilføje sygdom, oprette vagter osv. Hver side/tab kan tildeles se- eller skrive-adgang.

Konsekvens: ingen separate handlings-rettigheder på tab-niveau. Skrive-adgang på tab'en = bruger kan udføre alle handlinger på tab'en som ikke har ekstra handlings-disciplin (jf. §2.6).

- **Kilde:** Mathias chat 2026-05-21; mathias-afgoerelser 2026-05-17 (T9-omstart-ramme punkt 3 — to akser: kan_tilgå/kan_skrive).

### 2.2 Superadmin har fuld se+skrive på alle sider/tabs + bypasser forretnings-vagter

Superadmin har ret til alt. Fuld se og fuld skrive overalt. Superadmin er eneste hardkodede rolle. Superadmin bypasser desuden forretnings-vagter (aktiv-checks, allerede-tilstand-checks o.l.) som praksis for nød-operationer — ramme for hele systemet, ikke pakke-specifik beslutning. Strukturelle vagter bypasses aldrig (jf. §2.4).

- **Kilde:** vision-princip 2; mathias-afgoerelser 2026-05-17 punkt 10; mathias-afgoerelser 2026-05-21 (bypass-ramme).

### 2.3 Fortrydelses-mekanismen er ramme-låst forretningsgang

Ændringer med gældende dato følger fortrydelses-mekanismen: gældende dato → godkendelse → fortrydelses-periode → ændring kan rulles tilbage i UI indtil periodens udløb → derefter permanent. Gælder struktur-ændringer, medarbejder-placeringer, klient-flytninger.

Vejen for almindelig bruger med skrive-rettighed på siden er via systemets handlings-funktioner der opretter en pending-ændring og venter på godkendelse.

- **Kilde:** mathias-afgoerelser 2026-05-17 punkt 13.

### 2.4 Strukturelle vagter bypasses aldrig

Klienter tilknyttes kun knuder af type team. Team-luk virker kun på team-knude. Dette er strukturelle sandheder om hvad data overhovedet KAN være. Bypasses ikke, heller ikke af superadmin. Bypass ville korrumpere data-modellen.

- **Kilde:** mathias-afgoerelser 2026-05-17 punkt 6.

### 2.5 Approve-disciplin: default direkte selv-approve, per-handling ekstra disciplin

**Default-regel:** Bruger med skrive-rettighed på sidens tab kan udføre handlingen direkte uden ekstra godkendelse. Selv-approve af egen pending er tilladt. Den nuværende fastlåste blokering af selv-approve for ikke-admin er forkert som default og fjernes.

**Granularitet: per HANDLING, ikke per side/tab.** Ekstra approve-disciplin sættes op pr. specifik handling — fx "godkende fortrydelses-anmodning", "låse periode", "deaktivere klient". Siden/tab'en får ikke noget approve-flag; granulariteten ligger på handlings-niveau (jf. §2.6).

**To discipliner pr. handling — sat op i koden:**

- "kræver 2. godkender" (ja/nej) — handlingen kan ikke godkendes af requester selv; en anden bruger skal godkende
- "har fortrydelses-periode" (ja/nej) — godkendt handling kan rulles tilbage indtil fortrydelses-fristen udløber

Disse to er sat op i koden (ikke UI-redigerbart). Sikkerheds-disciplinen skal ikke kunne disables ved UI-fejl.

**Invariant:** Hvis "har fortrydelses-periode" er sat, SKAL "kræver 2. godkender" også være sat. En handling kan ikke have fortrydelse uden også at have 2. godkender. Fortrydelses-mekanismen kommer altid med ekstra disciplin på den oprindelige handling.

Lovlige kombinationer:

- Hverken 2. godkender eller fortrydelse (default — almindelig handling)
- Kun 2. godkender (ingen fortrydelse)
- Begge (2. godkender + fortrydelse)
- Kun fortrydelse uden 2. godkender → ulovlig

**UI-konfig pr. handling (kun relevant når "kræver 2. godkender" er sat):** UI vælger HVEM godkenderen er — to muligheder:

- **"Højere medarbejder":** Auto-reference til organisations-træet. Godkenderen skal være en medarbejder placeret på en strengt højere knude (højere placeret medarbejder) end requesterens egen placering. Samme niveau tæller ikke. Lavere niveau tæller heller ikke.
- **"Superadmin":** Kun superadmin må godkende. Andre brugere (selv højere placeret medarbejders) kan ikke godkende.

UI redigerer dette valg pr. handling for handlinger hvor "kræver 2. godkender" er sat.

**Organisations-træet kan have N niveauer:** Auto-reference virker uafhængigt af antal lag mellem rod og requesterens knude. En gren kan være `leder → assistent → team` (3 niveauer) eller `direktør → afdelingsleder → leder → assistent → team` (5 niveauer) eller flere. Enhver højere placeret medarbejder er gyldig godkender.

**Præcis 1 godkender vinder:** Når en handling kræver 2. godkender, er ÉN godkendelse nok for at handlingen bliver gyldig. Multiple højere placeret medarbejders må gerne kvalificere, men første godkendelse vinder. Ingen kæde-godkendelse.

**Hver gren er separat — egne godkendere pr. gren:** Parallelle grene har separate højere placeret medarbejder-kæder. Eksempel:

```
              (organisation / rod)
                /          \
        leder1-gren     leder2-gren
            |                |
        ass1-gren        ass2-gren
            |                |
         team1            team2
       [medarbejdere]  [medarbejdere]
```

Når en team1-medarbejder udfører en handling der kræver 2. godkender med type "Højere medarbejder" → højere placeret medarbejders er ass1-gren, leder1-gren og organisations-roden. Medarbejdere placeret på enhver af disse kan godkende. Lederen af team2 er placeret i en anden gren og kan IKKE godkende team1's pendings.

**Superadmin er undtaget begge veje:**

- **Superadmin som requester:** Når superadmin udfører en handling — uanset om handlingen kræver 2. godkender — kræves der aldrig en anden godkender. Superadmin er sin egen godkender.
- **Superadmin som godkender:** Når en almindelig bruger udfører en handling med "kræver 2. godkender" + type "Højere medarbejder" → superadmin må også godkende (ud over højere placeret medarbejder-medarbejderne). Når type er "Superadmin" → kun superadmin må godkende.

Begrundelse: superadmin må alt, jf. mathias-afgoerelser 2026-05-21 (bypass-ramme).

- **Kilde:** mathias-afgoerelser 2026-05-21 (ny approve-disciplin — committes som separat entry FØR plan-fase).

### 2.6 Handlings-granularitet: tildeling pr. specifik handling

I dag kan rettigheder tildeles på område/side/tab × (se/skrive). Nogle handlinger giver kun mening at tildele uafhængigt — fx "godkende fortrydelses-anmodning" inden for en side kan være en privilegeret handling som ikke alle med skrive-rettighed på siden skal kunne udføre.

**Ny dimension:** specifikke handlinger under tabs. En handling er navngivet og hører til præcis én tab. Roller får adgang til specifikke handlinger separat fra deres skrive-rettighed på tab'en.

**Mønster — kombineret adgang:**

- **Standard-handling** (ingen ekstra handlings-tildeling defineret): bruger med skrive-rettighed på tab'en kan udføre handlingen. Modellen uændret fra i dag.
- **Konfigureret handling — default:** bruger skal have BÅDE skrive-rettighed på tab'en OG specifik handlings-tildeling for at udføre handlingen.
- **Konfigureret handling — kun se-rettighed kræves (undtagelse, kode-styret):** enkelte handlinger kan markeres så de udføres med kun se-rettighed på tab'en + handlings-tildeling. Skrive-rettighed er IKKE påkrævet. Bruges fx til en godkender der ikke har skrive-rettighed på den side hvor godkendelsen sker, men alligevel skal kunne godkende handlingen. Markeringen er kode-styret (ikke UI-redigerbart).

**Eksempel:**

- Tab "klient-administration":
  - "oprette klient" → standard-handling → kræver skrive-rettighed på tab'en
  - "deaktivere klient" → konfigureret handling med fortrydelse og 2. godkender → kræver skrive-rettighed + handlings-tildeling
  - "godkende fortrydelses-anmodning" → konfigureret handling med "kun se-rettighed kræves" → en bruger med kun læse-adgang på siden kan stadig godkende, hvis de har handlings-tildeling

**Konsekvens:**

- Når en handling tilføjes som konfigureret handling i kode (typisk fordi den skal have 2. godkender eller fortrydelse), strammes adgangen automatisk — handlingen er nu gated af handlings-tildeling ud over tab-skrive-rettighed.
- Konfigurerede handlinger har følgende kode-styrede flag (ikke UI-redigerbart): "kræver 2. godkender", "har fortrydelse", "kun se-rettighed kræves".
- UI-redigerbart pr. konfigureret handling: hvem-godkender-typen ("Højere medarbejder" eller "Superadmin"), og hvilke roller der har handlings-tildelingen.

- **Kilde:** mathias-afgoerelser 2026-05-21 (ny handlings-granularitet — committes som separat entry).

---

## 3. Pakkens leverancer

### 3.1 Wrapper-vejen virker for almindelig bruger (G059)

De fem T9 handlings-veje der i dag fejler skal kunne gennemføre fortrydelses-flowet for almindelig bruger med relevant skrive-rettighed:

- Oprette/ændre afdeling eller team
- Deaktivere organisations-knude
- Lukke team
- Placere medarbejder på knude
- Fjerne medarbejder fra knude

Smoke-tests skal verificere flowet fra start til slut — fra anmodning gennem godkendelse til effektuering — ikke kun at pending'en oprettes.

### 3.2 Superadmin-bypass på T9 forretnings-vagter (G057)

Superadmin skal kunne gennemføre:

- Placere klient på team der ikke er aktivt på gældende dato (matcher klient-aktiv-check-mønstret fra trin 10)
- Lukke team der allerede er inaktivt (idempotens-no-op for superadmin)

Bypass-formen er idempotency: vagten passerer for superadmin → handlingen kører → effektivt no-op hvis allerede i mål-tilstand. Ikke separat break-glass-sti. Almindelig bruger fastholdes af vagterne.

Strukturelle vagter (klient-til-team-only, team-luk-kun-på-team) bypasses ikke — heller ikke for superadmin (jf. §2.4).

- **Kilde:** mathias-afgoerelser 2026-05-21 (bypass-ramme + idempotency-model).

### 3.3 Approve-disciplin pr. handling (ny ramme)

Pakken etablerer approve-disciplinens infrastruktur:

- Per konfigureret handling kan koden tænde "kræver 2. godkender" og "har fortrydelse" (med regel: fortrydelse uden 2. godkender er ulovlig).
- Når "kræver 2. godkender" er sat, vælger UI om godkenderen er "Højere medarbejder" eller "Superadmin".
- Godkendelses-flowet validerer den valgte type:
  - "Højere medarbejder" → godkenderen skal være højere placeret medarbejder i organisations-træet
  - "Superadmin" → godkenderen skal være superadmin
- Den nuværende fastlåste blokering af selv-approve fjernes; default er selv-approve OK.
- UI kan se hvilke medarbejdere der må godkende en specifik pending (baseret på handlingen og requesterens placering).

### 3.4 Handlings-granularitet (ny ramme)

Pakken etablerer handlings-granularitet:

- Specifikke handlinger kan defineres under tabs (navn, sortering, aktiv/inaktiv).
- Roller kan tildeles handlings-niveau-adgang via samme rettighedssystem som side/tab-adgang.
- Konfigurerede handlinger får kode-styrede flag: "kræver 2. godkender", "har fortrydelse", "kun se-rettighed kræves". UI redigerer ikke disse flag.
- UI redigerer: hvem-godkender-typen, handlings-tildelinger pr. rolle.
- Permission-evaluering håndterer både standard-handlinger (kun tab-skrive-rettighed kræves) og konfigurerede handlinger (additivt: tab-rettighed + handlings-tildeling, med undtagelse for "kun se-rettighed kræves"-handlinger).

### 3.5 Test-konsekvens

Pakken skal verificeres end-to-end gennem smoke-tests:

- G059 handlings-flow pr. handling (oprette pending → godkende → effektuere → verificere endelig tilstand)
- G057 superadmin-bypass + negative kontroller (almindelig bruger fastholdes af vagter)
- Approve-disciplin: selv-approve virker som default; "kræver 2. godkender" + "Højere medarbejder" tillader højere placeret medarbejder og afviser ikke-højere placeret medarbejder; "Superadmin" tillader kun superadmin; fortrydelses-frist sættes når handlingen har "har fortrydelse"; superadmin-bypass virker uanset konfiguration
- Handlings-granularitet: handlings-tildeling kræves når handlingen er konfigureret; "kun se-rettighed kræves"-handlinger kan udføres af bruger uden skrive-rettighed på tab'en hvis de har handlings-tildeling

---

## 4. Hvad pakken ikke leverer

- De øvrige T9-supplement-skitse-punkter (team-type-konvertering, tilbageskuende-dato-validering på handlings-veje, API/skema-eksponering, import-stubs, type-genering for klient-side, læse-funktions-adgangs-validering, step 12 superadmin-robusthed). Disse håndteres separat.
- Ændringer til selve fortrydelses-mekanismen (fortrydelses-periode-længde, gælder-dato-håndtering, audit-spor). Bevares uændret.
- Frontend / UI. Pakken leverer kun backend-rammen; UI bygges senere.
- Konkrete handlinger-seed for eksisterende funktioner. Pakken bygger rammen; UI eller separat pakke fylder konkrete handlinger ind.
- Multi-godkender-mønster (krav om at flere højere placeret medarbejders SKAL godkende før effektuering). Pakken låser præcis 1 godkender (første godkender vinder). Hvis behov for flere godkendere viser sig senere, separat pakke.
- Eksplicit valg af konkret godkender ved oprettelse. Auto-reference til organisations-træet er den valgte ramme — requester vælger ikke godkender.
- G058 (FK-coverage-fitness-check). Separat pakke.

---

## 5. Mathias-afgørelser der skal committes FØR plan-fase

To nye afgørelser skal committes som separate entries i `mathias-afgoerelser.md` så plan har stabil committed kilde:

- **2026-05-21 — Approve-disciplin pr. handling:** Default selv-approve OK. Pr. handling kan koden tænde "kræver 2. godkender" og "har fortrydelse". Invariant: fortrydelse uden 2. godkender er ulovlig. Når 2. godkender er sat, vælger UI typen — "Højere medarbejder" (højere placeret medarbejder i organisations-træet) eller "Superadmin". Auto-reference til højere placeret medarbejder-knuder, ikke eksplicit valg. Første godkendelse vinder. Superadmin er altid undtaget begge veje.

- **2026-05-21 — Handlings-granularitet:** Specifikke handlinger kan defineres under tabs. Standard-handlinger fungerer som i dag (kun tab-skrive-rettighed kræves). Konfigurerede handlinger kræver tab-skrive-rettighed PLUS handlings-tildeling. Kode-styret flag "kun se-rettighed kræves" tillader enkelte handlinger at fungere uden tab-skrive-rettighed. UI-redigerbart pr. handling: hvem-godkender-typen og rolle-handlings-tildelinger.

Begge entries committes via separat PR FØR krav-dok-PR.
