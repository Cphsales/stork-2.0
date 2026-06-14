# Org- og rettigheds-model (UDKAST)

Status: UDKAST — aftalt i dialog med Mathias. Ikke skrevet ind i forretningsforståelse/vision; afventer Mathias' umisforståelige godkend.

```
                            ┌─────────────────────┐
                            │  COPENHAGEN SALES   │ ★
                            └──────────┬──────────┘
        ┌──────────────┬───────────────┴───┬────────────────────┐
   ┌────┴────┐   ┌──────┴─────┐      ┌──────┴─────┐      ┌────────┴─────┐
   │ Min PA  │   │  TM-salg   │      │  FM-salg   │      │  HR & Drift  │
   └─────────┘   └──────┬─────┘      └──────┬─────┘      └───────┬──────┘
              ┌─────────┴────┐         ┌────┴─────┐         ┌─────┴──────┐
        ┌─────┴─────┐  ┌──────┴────┐ ┌─┴──────┐┌──┴─────┐┌──┴─────┐┌─────┴──┐
        │ Teamled.  │  │ Teamled.  │ │Salgst. ││Salgst. ││Rekrut. ││Lønteam │
        │  Nord     │  │  Syd      │ │Finans ◆││Norlys ◆││ team   ││        │
        └─────┬─────┘  └─────┬─────┘ └────────┘└────────┘└───┬────┘└────────┘
        ┌─────┴────┐         │                               ┊ tvær-link
   ┌────┴───┐ ┌────┴───┐ ┌───┴────┐                          ┊ (samme lag/under,
   │Salgst. │ │Salgst. │ │Salgst. │◀┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘  aldrig opad)
   │Tryg  ◆ │ │Eesy  ◆ │ │TDC   ◆ │
   └────────┘ └────────┘ └────────┘

  ★ superadmin (kun på toppen)   ◆ salgsknude (ejer klient)   øvrige = alm. knude
```

## Funktioner

### Knude-typer — afgøres af rollen

- Superadmin — kun på toppen.
- Salgsknude — ejer klient(er), sælgere, klient-tidsreg.
- Alm. knude — alt andet (ledelse, PA, support …).

### Struktur

- Top-ned, Copenhagen Sales i toppen. Superadmin kun her.
- Alt under toppen — navne, dybde, antal lag, roller — bygges i UI.

### Rettigheder & synlighed = knudens rettigheder

- En knudes rettigheder = se/skriv + datasynlighed (alt / knude+under / egen).
- Begge styres af knudens rolle; opsætningen sker i UI (pr. page/tab).
- Medarbejder placeres på knuden → arver knudens rettigheder. Knude-løs = ingen adgang.

### Tvær-link

- En knude kan pege på enkelte knuder udenfor egen gren — kun samme lag/under, aldrig opad. Undtagelse.

### Klient, attribution & økonomi

- Salgsknude ejer klient(er); ét team pr. klient.
- Thorbjørn: en sælger kan sælge en klient ejet af et andet team → salget attribueres til klientens team, ikke sælgerens.
- Team-økonomi (oms.+omk.) bliver i klientens knude.
- Medarbejder-løn aggregerer provision på tværs af knuder — i beregningen, ikke synligheden.
