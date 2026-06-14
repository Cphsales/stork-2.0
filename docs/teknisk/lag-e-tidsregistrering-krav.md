# Lag E — Tidsregistrering kravspec

Huskeliste. Hvad maskinen skal kunne. Behov, ikke løsninger.

## Vagt-typer

Vagten har en type, og typen bestemmer reglerne:

- **Stab:** stempelur kan kobles på som dokumentation
- **Teamledelse:** stempelur kan kobles på som dokumentation
- **Sælger:** klient-tid skal dække 100% af total arbejdstid

## Arbejdstid

To akser, hierarkisk:

**Total arbejdstid** (fundament)

- Vagten bestemmer total arbejdstid
- Total arbejdstid = vagt minus pauser

**Klient-fordeling** (kun sælger-vagt, afhænger af total)

- Skal dække 100% af total arbejdstid
- Kan komme fra flere kilder samtidig
- Sælger-vagt skal have mindst én klient-fordelings-kilde valgt
- UI bestemmer prioritering når flere kilder er aktive
- Modellen skal være udvidelig til nye kilder
- Sum af klient-segmenter må ikke overstige total arbejdstid

## Klient-fordeling — regler

- To API-events fra forskellige klienter mødes i tids-midtpunktet (eksempel: sidste event klient A kl. 12:00, første event klient B kl. 13:00 → 12:00-12:30 = A, 12:30-13:00 = B)
- Tid før første API-event tilhører den klient første event er for (udvides bagud til arbejdstidens start)
- Tid efter sidste API-event tilhører den klient sidste event er for (udvides forlæns til arbejdstidens slut)
- Ændring af total arbejdstid skal udløse revalidering af klient-fordeling

## Klient-tid betaling

- Klient-tid kan udløse CPO og provision pr. klient
- Klient-tid-betaling skal kunne udtrykkes som regler med variabler
- Klient-tid-betaling og pricing skal bruge samme regel-mekanisme for at undgå at to systemer afviger over tid
- Reglerne for CPO/provi pr. klient kan variere
- Kampagne under en klient kan have egne regler der afviger fra klientens default
- Kun sælger-vagt har klient-tid-betaling

## Klient-aktivitet uden vagt

- Salg uden vagt skal stadig registreres (provision og omsætning)
- Manglende vagt skal flages
- Vagt skal kunne oprettes retroaktivt
- Når vagt oprettes retroaktivt skal klient-fordeling beregnes automatisk

## Vagter

- Medarbejdere har vagter
- Vagter kan planlægges fremadrettet
- Vagter kan ændres pr. dag uden at ændre andre vagter
- Når mange medarbejdere har samme vagt-mønster, må man ikke skulle taste det manuelt for hver
- Vagter skal følge medarbejderens start- og slut-dato:
  - Ingen vagter før medarbejderens start-dato
  - Ingen vagter efter medarbejderens slut-dato
  - Vagter afsluttes automatisk hvis medarbejder stopper midt i en periode
- Alle vagter skal have status (no-show er en mulig status)
- Manglende vagt = ingen arbejdstid (ikke automatisk default fra ugedag)
- Ingen vagtbytte mellem medarbejdere

## Helligdage

- Danske helligdage følges
- Vagter kan stadig oprettes på helligdage

## Stempelur

- Stempel-tidspunkter må ikke kunne ændres efter de er sat
- Stempelur påvirker ikke løn-timer (vagten bestemmer løn)
- Stempelur kan bruges til dokumentation og til klient-fordeling
- Stempel-rettelser skal logges
- Vagter der går på tværs af midnat skal håndteres

## Pauser

- Én konsistent pause-model på tværs af systemet
- Pause-regler er data, oprettes i UI
- Pauser kan defineres på flere niveauer (skabelon, medarbejder, klient)
- Pauser indgår ikke i arbejdstiden

## Vagt-validering

- Vagter må ikke kunne overlappe i tid for samme medarbejder
- Vagt-redigerings-rettigheder håndteres af rettigheds-systemet (§1.7)

## Fravær

- Fraværs-typer er data (minimum: ferie, sygdom — udvideligt)
- Fravær kan være hel dag eller del af dag
- Ferie har approval-workflow; sygefravær har ikke (per master-plan §2.2)
- Status-overgange logges

## Sygeløn

- Sygdom registreres pr. vagt
- Sygeløn beregnes via formel-systemet
- Maskinen skal levere data nok til at formler kan udregne beløbet

## Overtid

- Overtid skal kunne anmodes og godkendes
- Godkendt overtid skal automatisk indgå i lønberegning
- Godkendelse skal logges

## Lønperiode

- Lønperioder er definerede entiteter med klar afgrænsning (C4 BYGGET)
- Lønperioder har en livscyklus (åbne/lukkede)
- Lønperiode-grænser er data, ikke hardkodet
- Beregninger skal kunne tilknyttes en specifik lønperiode

## Formel-system

- Formler kan kategoriseres efter formål (lønarter, KPI'er)
- Tid skal kunne indgå som input-variabel i begge kategorier
- Lønarter beregner løn-relaterede beløb (eksempler: sygeløn = sygedage × dagssats, klient-tid-betaling = klient-timer × CPO-sats)
- KPI'er beregner præsentations- og rapporterings-tal (eksempler: omsætning/time, provision/time)

## Medarbejder-aggregater (input til formler)

Maskinen skal kunne aggregere pr. medarbejder pr. periode:

- Antal vagter (totalt)
- Antal vagter pr. status (sygevagter, fraværsvagter, ferievagter, no-show, normale, osv.)
- Antal FM-bookinger
- Antal FM-salgsregistreringer (manuelle salg)
- Anciennitet beregnet ud fra start- og slut-dato

Disse aggregater skal være tilgængelige som input-variabler i formel-systemet.

## Løn

- Vagten er autoritativ kilde for løn-timer
- Forskellige løntyper med forskellige regler:
  - Timeløn (timer × sats)
  - Månedsløn (pro-rata baseret på arbejdsdage i periode)
  - Sælger-løn (commission, separat fra timer)
- Feriepenge konfigurerbart pr. løntype

## Aggregering

- Pr. medarbejder pr. periode
- Pr. klient når relevant
- Konsistent metode på tværs af alle aggregater

## Medarbejder-data

- Medarbejderens standard arbejdstid skal kunne læses programmatisk
- Medarbejderens ansættelses-start og -slut skal være tilgængelige som data

## Konstanter

- Pause-default-værdier, lønperiode-grænser, feriepenge-satser og lignende er konfigurerbar data, ikke hardkodet

## Sporbarhed

- Det skal kunne ses hvem der registrerede tid, redigerede vagt, godkendte fravær eller overtid
- Det skal kunne ses hvornår hver ændring skete

## Mangler deep dive før Lag E starter

- Adversus API
- Enreach API
