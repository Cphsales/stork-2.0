# Lag E — Beregningsmotor kravspec

Huskeliste. Hvad maskinen skal kunne. Behov, ikke løsninger.

## Salgsstruktur

- Ét salg kan have flere produktlinjer
- Provision og omsætning er summen af linjer
- Produkter skal kunne merges (to produkter bliver til ét)
- Produkter skal kunne grupperes til rapportering og aggregering

## Prissætning

- Pris afhænger af flere variabler, ikke kun fast tal pr. produkt
- Pricing-regler vælges ud fra produkt, kampagne og felt-værdier i salgs-data
- Felt-værdier kan sammenlignes på forskellige måder (præcis match, intervaller, ranges)
- Regler kan have tidsbegrænset gyldighed
- Når flere regler kunne matche, skal valget være deterministisk
- Pris kan beregnes som formel hvor variabler fra salgs-data indgår
- Samme produkt kan have flere formler (forskellige situationer)
- Salg der ikke kan prissættes skal kunne identificeres og rettes
- Salg-linjer skal kunne vises med et navn der adskiller sig fra produktnavnet (fx kampagne-specifikt navn)

## Berigelse af salg

- Felter skal kunne tilføjes på salget via UI efter at salget er registreret
- Berigede felter skal kunne påvirke prissætningen
- Når berigede felter ændrer hvad salget er værd, skal commission opdateres
- Særlige betalings-tilfælde (fx straksbetaling) håndteres som data, ikke separat mekanik
- Alle ændringer skal logges

## Sælger-attribution

- Salg skal kunne kobles til den rigtige medarbejder uanset hvordan sælger-identiteten kommer fra API
- Salg hvor sælger ikke kan identificeres skal kunne identificeres og rettes
- Samme person må aldrig optræde under flere navne

## Annullering

- Hele eller del af et salg skal kunne annulleres
- Annulleringer må ikke ændre den oprindelige salgs-linje
- Annullerings-fradrag falder i den lønperiode hvor effekt-datoen ligger (ikke salgs-dato)

## Status og livscyklus

- Salg har en livscyklus med flere mulige stadier
- Status-overgange er kontrollerede, ikke automatiske
- Salg i bestemte status'er må ikke tælle med i commission-aggregat

## Aggregering

- Aggregater giver konsistente tal uanset salgskilde (TM, FM, andre)
- Aggregeres pr. sælger, team, klient, dato eller kombination
- Tidszone-håndtering må ikke skabe drift mellem rapportering og pricing
- Tidszone er låst i fase 0 (§6.7)

## Sporbarhed

- Det skal altid være muligt at se hvilken regel der gav et salg sin pris
- Pricing-regel-ændringer skal logges uanset hvor ændringen kommer fra
- Provision- og CPO-udvikling pr. produkt skal være målbar over tid

## Genberegning

- Salg skal kunne genberegnes hvis pricing ændres
- Genberegning må kun ske før provision er udbetalt
- Når lønperiode er låst, må salget ikke ændres

## Åbne tekniske spørgsmål (afgøres ved Lag E-bygning)

- Produkt-identitet — interne ID'er + mapping fra eksterne kilder
- Endeligt felt-navn for beriget/rå salgs-data ("salgs-data" er arbejds-navn)
- Formel-DSL — konkret syntaks
- Konkrete snapshot-felter ved sales INSERT (selve snapshot-mønstret er låst §5.3)

## Mangler deep dive før Lag E starter

- Adversus API
- Enreach API
