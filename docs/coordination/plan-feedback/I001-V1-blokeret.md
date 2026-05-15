# I001 V1 — blokeret (krav-dokument-data-mangel)

**Type:** Stop-signal jf. krav-dokument-disciplin
**Aktør:** Code
**Dato:** 2026-05-15
**Branch:** `claude/i001-plan`

## Brud-type

Ingen af de 4 standard brud-typer i `docs/strategi/arbejds-disciplin.md` matcher præcist. Tættest på er "Forslag der modsiger Mathias' eksplicitte afgørelser" — men dette er **omvendt retning**: krav-dokumentet refererer data der ikke eksisterer, så plan-arbejdet kan ikke starte uden at fabrikere.

## Konkret brud

`docs/coordination/I001-krav-og-data.md` "Data-grundlag"-sektion (linje 22-24) lister tre autoritative input-filer:

1. `docs/coordination/audit/audit-konsolideret-2026-05-15.md` — "38 unikke fund (7 kritiske, 26 mellem, 5 kosmetiske). Hvert fund har lokation (fil:linje), citat af fejlagtig påstand, bevis for faktisk tilstand, og konsekvens-vurdering."
2. `docs/coordination/audit/audit-code-2026-05-15.md` — "Code's parallelle audit (24 fund)"
3. `docs/coordination/audit/audit-codex-2026-05-15.md` — "Codex' parallelle audit (19 fund)"

Verifikation mod main (post-H022-follow-up-merge):

```
$ ls -la docs/coordination/audit/
ls: cannot access 'docs/coordination/audit/': No such file or directory
```

Mappen eksisterer ikke. Hverken konsolideret rapport, Codex' rapport, eller min egen rapport findes på main.

**Faktisk tilstand pr. branch:**

- `claude/h016-audit-code` (push'et til origin men ikke merged): indeholder `docs/coordination/audit/audit-code-2026-05-15.md` (Code's egen audit, 24 fund)
- Ingen branch med `audit-codex-2026-05-15.md` eller `audit-konsolideret-2026-05-15.md`

## Hvorfor jeg ikke kan fortsætte plan-arbejdet

Krav-dokumentet's formål: "alle 38 unikke sandheds-fund fra H016-audit lukket". De 38 fund findes kun i den konsoliderede rapport — som ikke eksisterer.

For at skrive `I001-plan.md`:

- Plan-skabelonen kræver konkrete implementations-rækkefølge, test-konsekvens, risiko-matrix pr. fund.
- Hver fund i scope skal kunne adresseres med konkret action — kræver fund-lokation, fund-bevis, fund-konsekvens.
- Mine egne 24 fund kender jeg (audit-code branch). Codex' 19 fund + de samlede 38 unikke (med kategorisering 7/26/5) kender jeg IKKE.

Hvis jeg fortsætter:

- Jeg fabrikerer Codex' fund fra hukommelse (umuligt — har aldrig læst dem)
- Eller jeg destillerer "38 fund" fra mine 24 (bryder data-grundlag, fabrikerer)
- Eller jeg gætter konsolideret-tællingen 7/26/5 (fabrikerer)

Alle tre veje bryder "skab ikke for at få input til at passe"-disciplin (`feedback_dont_fabricate_to_fit.md` "Mønster 1").

## Hvad jeg har brug for

Én af følgende, før plan-arbejdet kan starte:

- **A.** Commit Codex' audit-rapport + konsolideret rapport til `docs/coordination/audit/` (Mathias har dem, jeg har ikke set dem)
- **B.** Bekræft at I001-plan kan baseres KUN på min egen audit (24 fund), og opdatér krav-dokumentet til at afspejle det
- **C.** Reduce scope-claim fra "38 unikke fund" til "Code's 24 fund" og fjern reference til konsolideret + Codex' rapport
- **D.** Anden vej Mathias specificerer

## Vurdering

Dette er ikke krav-dokument-brud-i-traditionel forstand (jeg foreslår ikke noget der modsiger Mathias' afgørelser). Det er **data-grundlag-mangel** — krav-dokumentet beder mig om at arbejde fra filer der ikke eksisterer.

Per stop-ved-divergence-disciplin + krav-dokument-disciplin: stopper plan-arbejde, dokumenterer her, afventer Mathias-afgørelse.

Jeg argumenterer ikke videre i denne fil. Krav-dokumentet ændres af Mathias, ikke af mig.
