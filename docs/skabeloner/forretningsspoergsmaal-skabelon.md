# Forretningsspørgsmål-skabelon

Skabelon for forretningsspørgsmål-fase. Denne fase køres FØR Claude.ai skriver krav-og-data-dokument for en pakke. Output er kilde-grundlag der binder krav-dokumentet til konkrete Mathias-svar med dato.

## Formål

Forhindre fabrikation ved indgangen til pakke-arbejde. Krav-dok-skrivnings-disciplin (`docs/strategi/arbejds-disciplin.md` — Claude.ai MÅ IKKE: "Skrive påstande i krav-dok uden Mathias-kilde") forudsætter at kildegrundlaget eksisterer. Denne fase skaber kildegrundlaget eksplicit i stedet for at lade det leve i chat-hukommelse.

## Hvornår fasen køres

Mellem "pakke-idé opstår" og "Claude.ai begynder krav-dok-skrivning". Konkret trigger: Mathias signalerer ny pakke ("lad os lave en pakke om X" eller tilsvarende åbnings-signal).

## Hvornår fasen SKIPPES

- **Mikro-pakker** (PR direkte uden plan-runde, jf. `docs/strategi/arbejdsmetode-og-repo-struktur.md` "Pakke-skala-disciplin → Lille")
- **Pakker hvor forretnings-konteksten allerede er låst** i `docs/coordination/mathias-afgoerelser.md` med præcis nok detalje til at krav-dok kan skrives uden ekstra spørgsmål
- **Tekniske infrastruktur-pakker uden forretnings-impact** (CI-fixes, dependency-opgraderinger, refactors uden adfærds-ændring)

Claude.ai vurderer om fasen er nødvendig. Hvis i tvivl: kør fasen. Beslutningen om at skippe dokumenteres kort i krav-dok's åbnings-sektion ("Forretningsspørgsmål-fase skippet fordi: ...").

## Output-fil

`docs/coordination/<pakke>-forretningsspoergsmaal.md`

Filen skrives af Claude.ai via Filesystem-MCP til working tree (samme mønster som krav-dok-flow). Mathias committer filen til main inden krav-dok-skrivning starter. Krav-dok refererer til den som primær kilde.

Filen arkiveres sammen med krav-dok og plan-filer som del af pakkens oprydning (jf. "Oprydnings- og opdaterings-strategi" i plan-skabelon).

## Skabelon-struktur

```markdown
# <pakke> — Forretningsspørgsmål

**Pakke:** <kort beskrivelse>
**Dato:** YYYY-MM-DD
**Fase-trigger:** <citat af Mathias' åbnings-signal>

---

## Pakke-kontekst

[1-2 sætninger om hvad pakken handler om — Claude.ai's tolkning af åbnings-signal. Ikke krav-dok-detalje, kun rammen.]

---

## Spørgsmål og svar

### S1: [konkret forretnings-spørgsmål]

**Mathias' svar:** [ordret citat eller paraphraseret med klar markering om hvilket]

**Konsekvens for krav-dok:** [hvordan svaret rammer krav-dok-indhold]

---

### S2: [næste spørgsmål]

[samme struktur]

---

[Fortsæt for hvert spørgsmål — typisk 5-15 spørgsmål]

---

## Kilde-grundlag for krav-dok

Disse svar er nu låst kildegrundlag. Krav-dok (`<pakke>-krav-og-data.md`) refererer til dette dokument under "Forretnings-kilder"-sektion.

Påstande i krav-dok der ikke kan spores til en S<n> her, kræver enten:

- Ny spørgsmåls-runde med Mathias (committet som tillæg til denne fil), ELLER
- Eksisterende `mathias-afgoerelser.md`-reference med konkret dato, ELLER
- Eksisterende `vision-og-principper.md` eller `stork-2-0-master-plan.md`-reference

Påstande uden kilde er fabrikation.
```

## Spørgsmåls-typer Claude.ai stiller

Forretnings-spørgsmål, ikke tekniske. Eksempler:

- **Aktør-spørgsmål:** "Hvem skal kunne X? Én rolle, flere personer, eller noget tredje?"
- **Tids-spørgsmål:** "Skal Y kunne ændres uden deploy?"
- **Relations-spørgsmål:** "Er Z knyttet til person, rolle, eller pakke-niveau?"
- **Frekvens-spørgsmål:** "Hvor ofte sker W i praksis? Dagligt, månedligt, ad hoc?"
- **Konsekvens-spørgsmål:** "Hvad sker når et X slettes — kaskade eller blok?"
- **Eksisterende-system-spørgsmål:** "Hvordan håndteres dette i Stork 1.0 i dag?"
- **Scope-grænse-spørgsmål:** "Skal denne pakke også håndtere W, eller er det senere?"

## Spørgsmål Claude.ai IKKE stiller i denne fase

- **Tekniske implementation-spørgsmål** ("skal vi bruge JSONB eller separat tabel?")
- **Datamodel-spørgsmål** ("hvad skal kolonne-navne være?")
- **Code's domæne** ("skal vi bruge RPC eller view?")
- **Ledende spørgsmål** ("er du enig i at...?")

Dem hører i krav-dok-fase eller plan-fase, ikke før.

## Disciplin

**Claude.ai MÅ:**

- Stille spørgsmål baseret på pakke-konteksten + fire forretnings-dokumenter
- Identificere uklarhed mellem `mathias-afgoerelser.md` og pakke-scope
- Bede Mathias præcisere før krav-dok skrives
- Sætte spørgsmål i grupper og bede Mathias svare i samme rækkefølge

**Claude.ai MÅ IKKE:**

- Komme med tekniske forslag i fasen (Code's bord, senere)
- Pakke spørgsmål som ledende ("er du enig i at...?")
- Skrive svar Mathias ikke har sagt
- Spørge om noget der allerede står klart i de fire forretnings-dokumenter (hvis i tvivl: læs dokumenterne først, så spørg)
- Bruge fasen til at debattere — fasen er kun til at indhente Mathias' svar, ikke til at argumentere imod dem

**Mathias MÅ:**

- Svare kort
- Sige "ved ikke, vi finder ud af det i plan-fasen" — det er gyldigt svar
- Sige "det står i X-dokument, læs det først" — pause-signal
- Afbryde fasen hvis spørgsmålene driver væk fra pakke-scope

## Stop-betingelser

- Hvis fasen producerer >20 spørgsmål: Claude.ai stopper og foreslår at pakken splittes
- Hvis Mathias svarer "vi ved det ikke endnu" på fundamentalt spørgsmål: pakken pauses, ikke fortsætter
- Hvis Mathias gentager "det står i X-dokument" 3 gange: Claude.ai har ikke læst rammen ordentligt → recon før fortsættelse
- Hvis Mathias paster "stop" → STOP øjeblikkeligt

## Eksempel — T9-pakken (hypotetisk)

Hvis T9-pakken havde haft forretningsspørgsmål-fase, kunne den have indeholdt:

- **S3:** "GDPR/AMO/AI-ansvarlig — er det en rolle eller en konkret medarbejder?"
- **Mathias' svar:** "Konkret medarbejder, valgt i UI. Ikke rolle." (jf. afgørelse 2026-05-14, Korrektion C)
- **Konsekvens for krav-dok:** Krav-dok beskriver det som "konkret medarbejder-tildeling per ansvar-type", ikke "rolle-baseret".

Fabrikationen "UI-rolle-tildelinger via role_permission_grants" havde haft kilden S3 at modsige sig mod. Krav-dok kunne ikke have indeholdt påstanden uden at kollidere med kilden.
