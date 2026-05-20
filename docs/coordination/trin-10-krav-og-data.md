# Trin 10 — Klient-skabelon og felt-definitioner

**Pakke:** §4 trin 10 — Klient-skabelon + felt-definitioner
**Status:** Klar til Mathias-godkendelse
**Dato:** 2026-05-20

---

## 1. Pakkens formål

Trin 10 etablerer klienten som forretnings-fundament i Stork 2.0. En klient er én af de firmaer Stork sælger for — eksempelvis Tryg, Eesy, TDC, Finansforbundet. Alt i forretningen hænger på klienten: salg, calls, team-tilknytning, lønarter.

Trin 10 bygger klient-stammen og felt-definitioner-mekanikken så alt andet senere kan kobles på den. Pakken leverer ikke frontend-pages og ikke admin-UI'er. Den leverer fundamentet i databasen.

Kilde: master-plan §1.8 "Klient er driftens grundenhed".

---

## 2. Forretningsmæssige sandheder

Disse er rammen for trin 10. De er afgjort af Mathias og kan ikke ændres af Code eller Codex.

### 2.1 Klient-identitet og dataejerskab

1. **Klient ejer rå dataen der kobles på klienten.** Salg, calls og andre rå data følger klienten ved team-skift. Teamet bevarer historik om at have ejet klienten i en periode, men ejer ikke dataen.

2. **Dato afgør sandheden.** Når et salg laves på dato X, og klienten på dato X var knyttet til team Y, så er den binding historisk fast. Senere ændringer i klient-team-tilknytning ændrer ikke gamle data. Annulleringer eller anden feedback der kommer senere på et salg rammer det team der ejede klienten på salgs-tidspunktet, ikke det nuværende team.

### 2.2 Klient-til-team

1. **Klient knyttes kun til team-niveau.** Aldrig til afdelinger eller Copenhagen Sales-niveauet.

2. **En klient er knyttet til maksimalt ét team ad gangen.** Historikken bevares så Stork altid kan se hvilket team der ejede klienten på et givet tidspunkt.

3. **Klient kan ikke dræbe et team.** Hvis klient stopper, fortsætter teamet. Klient-til-team-tilknytningen lukkes med en slut-dato; teamet eksisterer uafhængigt.

4. **Klient-team-skift følger fortrydelses-mekanismen.** Ændring med gældende dato → godkendelse → kan rulles tilbage i fortrydelses-periode → derefter permanent. Mekanikken er etableret i T9.

### 2.3 Klient-felter

1. **Hver klient kan have sine egne felter.** Felter defineres pr. klient. Felter tilføjes og ændres uden teknisk ændring.

2. **Pr. felt-definition registreres:** navn, type, om feltet er påkrævet, persondata-niveau, sortering, aktiv-tilstand.

### 2.4 Klient-logo

1. **Klient kan have et logo.**

### 2.5 Klient-livscyklus og persondata

1. **Klient anonymiseres ikke.** Klient-navn er forretningsdata, ikke persondata. Klient-rækken bliver stående evigt så historik og audit-spor bevares.

2. **Klient-livscyklus er kun aktiv/inaktiv.** Ingen mellem-tilstande. Samme mønster som teams og afdelinger. Inaktiv klient bliver stående for historik, men kan ikke vælges som ny team-tilknytning.

3. **Felter på klienten kan være persondata.** Hvis et felt er direkte persondata (fx en kontaktperson), har det egne sletteregler på felt-niveau, ikke klient-niveau.

### 2.6 Klient-styring

1. **Rettigheder til klient-handlinger styres i UI.** Hvem må oprette/ændre/deaktivere klienter defineres i rettigheds-systemet, ikke fastlagt i kode.

2. **Lønarter der refererer klient sættes op via formler i UI.** Formel-systemet (trin 13) leverer mekanikken; konfiguration sker i UI bagefter. Klient-skabelonen selv har ikke lønart-konfiguration på sig.

---

## 3. Funktioner trin 10 skal levere

Dette afsnit beskriver HVAD systemet skal kunne gøre. Det er det centrale — krav-dokumentet er en kontrakt på funktioner, ikke på datastruktur.

### 3.1 Funktioner på klient

| Funktion           | Beskrivelse                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| Opret klient       | Bruger opretter en ny klient med navn                                                                           |
| Ændr klient        | Bruger ændrer navn på klient                                                                                    |
| Deaktivér klient   | Bruger sætter klient inaktiv. Klienten bliver stående for historik, men kan ikke vælges som ny team-tilknytning |
| Hent klient        | Bruger kan se en klient med dens aktuelle felt-værdier                                                          |
| Hent klient-liste  | Bruger kan se alle klienter (aktive og inaktive)                                                                |
| Upload klient-logo | Bruger uploader et logo på klienten                                                                             |

### 3.2 Funktioner på klient-felter (felt-definitioner)

| Funktion                  | Beskrivelse                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| Opret felt-definition     | Bruger opretter en ny felt-definition for en klient med navn, type, krav, persondata-niveau, sortering |
| Ændr felt-definition      | Bruger ændrer en eksisterende felt-definition                                                          |
| Deaktivér felt-definition | Bruger sætter felt inaktiv (bliver stående for historik)                                               |
| Hent felt-definitioner    | Bruger kan se alle aktive felt-definitioner for en klient                                              |

### 3.3 Funktioner på klient-felt-værdier

| Funktion        | Beskrivelse                                                |
| --------------- | ---------------------------------------------------------- |
| Sæt felt-værdi  | Bruger sætter eller ændrer værdien af et felt på en klient |
| Hent felt-værdi | Bruger kan se den aktuelle værdi af et felt på en klient   |

### 3.4 Funktioner på klient-til-team-tilknytning

Klient-til-team-tilknytningen er etableret som mekanik i T9. Trin 10 leverer at den faktisk kobler til klienter:

| Funktion                         | Beskrivelse                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| Verifikation af klient-reference | Når en klient-til-team-tilknytning oprettes eller ændres, valideres at klienten faktisk findes |

---

## 4. Status og forudsætninger

### 4.1 Allerede bygget i tidligere trin

- Trin 1-7c: schemas, audit, klassifikations-registry, retention-disciplin, periode-skabelon, anonymisering
- Trin 9: organisations-træ, medarbejder-placeringer, permission-fundament, fortrydelses-mekanisme, klient-til-team-tilknytnings-mekanik (uden klient-reference)

### 4.2 Hvad trin 10 udvider på eksisterende

- Klient-til-team-tilknytningen fra T9 får sin reference til klient-stammen
- Fortrydelses-mekanismen fra T9 dækker også klient-handlinger med gældende dato

---

## 5. Ikke en del af trin 10

- **Salg som funktionalitet** — trin 14
- **Pricing-regler pr. klient** — senere trin
- **Lønarter der refererer klient** — formel-systemet, trin 13
- **Frontend-pages og admin-UI'er** — senere lag
- **Konkrete rettighedstildelinger** — sættes op i UI når frontend etableres
- **Klient-anonymiserings-mekanik** — klient anonymiseres ikke

### 5.1 Klient-data-migration fra 1.0

Migration af klient-data fra 1.0 til 2.0 er udskudt fra trin 10. Trin 10 leverer kun klient-skabelonen som greenfield-fundament. Klient-data-migration tages op senere som separat pakke når behovet konkret melder sig.

Kilde: mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering: migration og match-rolle ud".

### 5.2 Match-mekanik mellem data-indgange

Når data lander i Stork fra forskellige kilder (Eesy via API, TDC via Excel-upload, måske andre senere), skal Stork kunne sige "denne nye række er samme kunde / samme salg som den række jeg allerede har". Det kræver et felt der kan bruges som matche-nøgle — fx et telefonnummer, et kunde-id, eller et opportunity-id.

Eksempel i hverdags-sprog: TDC sender en Excel hver morgen med salg fra i går. Eesy sender salg via API. Begge har et felt "telefon". Når TDC's række kommer ind, skal Stork tjekke: "har jeg allerede sét et salg på dette telefonnummer fra Eesy de seneste 48 timer? Hvis ja → dublet, drop det." Det er match.

**Det hører ikke i trin 10.** For at kunne designe match-mekanikken skal vi vide:

- Hvordan ser data-indgang-UI'en ud? (API-konfiguration? Excel-upload-side? Begge?)
- Skal match-feltet vælges pr. data-indgang, eller arves fra klienten?
- Hvad sker når en match fejler — manuel håndtering? Stilles i kø?

Ingen af de spørgsmål er afklaret. At designe match-mekanikken nu er at gætte på en arkitektur der låser senere valg. Det udskydes til der hvor data-indgange bygges, når UI og konkrete krav er kendt.

Kilde: mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering: migration og match-rolle ud".

---

## 6. Tekniske valg overladt til Code og Codex

Krav-dokumentet specificerer kun forretningsmæssige sandheder og funktioner. Følgende er Code's og Codex' opgave:

- Hvordan klient-stammen teknisk implementeres
- Hvordan klient-felt-definitioner teknisk gemmes og opdateres
- Hvordan klient-felt-værdier teknisk håndteres
- Hvordan klient-logo teknisk håndteres (upload, lagring, størrelses-håndtering, normalisering)
- Hvordan klient-livscyklus (aktiv/inaktiv) teknisk realiseres
- Hvordan klient-FK til T9's klient-til-team-tilknytning teknisk tilføjes
- Hvordan triggers vedligeholder konsistens
- Hvilke fitness-checks og tests
- Konkrete tabel- og kolonne-navne

Hvis Code finder at en teknisk afgørelse rummer en forretningsmæssig dimension der bør være Mathias' bord, flagges det eksplicit i plan-arbejdet — ikke besluttet af Code alene.

---

## 7. Master-plan-rettelser nødvendige

Som konsekvens af afgørelserne om scope (sektion 5.1 og 5.2) skal master-plan rettes som del af trin 10-arbejdet:

- **§1.8 (Klient-skabelon):** match-rolle-konceptet (match-rolle pr. felt + crm_match_id-rolle + enum-liste over match-typer) fjernes fra felt-definitions-mønstret
- **§4 trin 10:** migration-leverancen og crm_match_id-rolle-teksten fjernes fra trin 10's række

De konkrete tekstrettelser er Code's bord at finde og udføre. Begge rettelser har sporbar kilde i mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering: migration og match-rolle ud".

---

## 8. Mathias-afgørelser (input til trin 10)

| #   | Afgørelse                                                      | Reference                                                             |
| --- | -------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | Klient ejer rå data                                            | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 1    |
| 2   | Dato afgør sandheden — historiske bindinger er faste           | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 2    |
| 3   | Klient anonymiseres ikke                                       | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 3    |
| 4   | Klient-livscyklus = aktiv/inaktiv                              | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 4    |
| 5   | Klient kan have logo                                           | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 5    |
| 6   | Rettigheder til klient-handlinger styres i UI                  | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 6    |
| 7   | Lønarter der refererer klient sættes op via formler i UI       | mathias-afgoerelser 2026-05-20 "Trin 10 forretnings-ramme" punkt 7    |
| 8   | Klient kun til team-knuder                                     | mathias-afgoerelser 2026-05-17 punkt 6                                |
| 9   | En klient = maks ét team ad gangen                             | mathias-afgoerelser 2026-05-20 chat-validering ifm. krav-dok-arbejdet |
| 10  | Klient kan ikke dræbe et team                                  | mathias-afgoerelser 2026-05-16 punkt 4                                |
| 11  | Alle ændringer med gældende dato følger fortrydelses-mekanisme | mathias-afgoerelser 2026-05-17 punkt 13                               |
| 12  | Klient-data-migration udskydes fra trin 10                     | mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering" punkt 1    |
| 13  | Match-rolle-konceptet udskydes fra trin 10                     | mathias-afgoerelser 2026-05-20 "Trin 10 scope-præcisering" punkt 2    |

---

## 9. Fire-dokument-konsultation

| Dokument                                   | Relevante referencer for trin 10                                                                                                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `docs/strategi/vision-og-principper.md`    | Princip 1 (data-kontrol i UI); Princip 2 (rettigheder i UI); Princip 3 (forretningslogik som data); Princip 6 (audit på alt der ændrer data); Princip 9 (status-modeller bevarer historik) |
| `docs/strategi/stork-2-0-master-plan.md`   | §1.8 Klient-skabelon (rettes som del af trin 10); §3 CI-blockers; §4 trin 10 (rettes som del af trin 10)                                                                                   |
| `docs/coordination/mathias-afgoerelser.md` | 2026-05-16, 2026-05-17, 2026-05-20-entries (jf. afgørelses-tabel i sektion 8)                                                                                                              |
| Dette krav-dok (`trin-10-krav-og-data.md`) | Sektion 2 (forretnings-sandheder), sektion 3 (funktioner), sektion 5 (scope-grænse), sektion 7 (master-plan-rettelser), sektion 8 (afgørelses-tabel)                                       |

Code skal i plan-arbejdet eksplicit udfylde firekolonne-tabel (dokument / konsulteret / referencer / konflikt).

---

## 10. Oprydnings- og opdaterings-strategi

### 10.1 Filer der arkiveres efter trin 10-merge

- `docs/coordination/trin-10-krav-og-data.md` → `docs/coordination/arkiv/`
- `docs/coordination/trin-10-plan.md` (når plan eksisterer) → `docs/coordination/arkiv/`
- Alle `docs/coordination/plan-feedback/trin-10-*.md` → `docs/coordination/arkiv/`

### 10.2 Dokumenter der opdateres som del af trin 10-build

- `docs/coordination/aktiv-plan.md` — ryd til "ingen aktiv plan", tilføj trin 10 til Historisk-sektion
- `docs/coordination/seneste-rapport.md` — pege på trin 10-slut-rapport
- `docs/strategi/bygge-status.md` — trin 10 markeres godkendt
- `docs/strategi/stork-2-0-master-plan.md` — §1.8 + §4 trin 10 rettes (jf. sektion 7)
- `docs/teknisk/teknisk-gaeld.md` — eventuelle G-numre registreres

### 10.3 Ansvar

- Code udfører arkivering, master-plan-rettelser og dokument-opdateringer som del af build-PR
- Slut-rapporten verificerer udførelse i "Oprydning + opdatering udført"-sektion
- Manglende udførelse = KRITISK feedback fra reviewere

### 10.4 Grep-tjek post-pakke

- `grep -r "trin-10-krav-og-data\|trin-10-plan" docs/` returnerer kun arkiv + rapport-historik + slut-rapport
- `grep -n "match-rolle\|crm_match_id\|migration: discovery-script for klienter" docs/strategi/stork-2-0-master-plan.md` returnerer ingen forekomster

---

**Krav-dok klar til Mathias-godkendelse.**
