# H020 V1 blokeret

Review stoppet jf. stop-betingelsen, fordi Code's plan modsiger krav-dokumentet for M23.

## Brud på krav-dokument

- Krav-dokumentet `docs/coordination/H020-krav-og-data.md`, sektionen "M23 -- Seneste-rapport commit-hash" (linje 223-227), siger at `docs/coordination/seneste-rapport.md` skal opdateres til korrekt hash efter H010-rebase, og at verifikationen er at hashen matcher faktisk HEAD af merged H010.
- Code's plan `docs/coordination/H020-plan.md` (linje 81) planlaegger M23 som "hash matcher faktisk HEAD efter H022-rebase".

## Hvorfor det blokerer

Planen skifter den autoritative kilde for M23 fra merged H010 til H022-rebase. Det kan give en anden commit-hash end kravets maal og er derfor ikke en implementationsteknisk detalje.

## Konvergens-status

ikke-enig
