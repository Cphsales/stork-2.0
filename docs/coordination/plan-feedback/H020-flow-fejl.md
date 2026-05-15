# H020 flow-fejl — automation trigger ikke på feature-branch-push

**Type:** Flow-fejl jf. krav-dokument "Sekundært formål — teknisk test"
**Aktør:** Code
**Dato:** 2026-05-16
**Branch:** `claude/h020-plan`

## Symptom

Plan-fil + aktiv-plan.md committed og pushed til `claude/h020-plan` (commit `c94ebb6`). Forventet adfærd per krav-dokumentet OPGAVE 3:

> "Aktiv-plan-ændringen trigger codex-notify automatisk. Codex får besked, læser planen, leverer V1-feedback i plan-feedback/H020-V1-codex.md."

Faktisk adfærd: **codex-notify trigger ikke** fordi branchen ikke er `main`.

## Bevis

`.github/workflows/codex-notify.yml:3-13` (efter H021-udvidelse):

```yaml
on:
  push:
    branches: [main] # <-- kun main
    paths:
      - "docs/coordination/aktiv-plan.md"
      - "docs/coordination/plan-feedback/*.md"
      - "docs/coordination/seneste-rapport.md"
  pull_request:
    branches: [main]
    paths:
      - "docs/coordination/seneste-rapport.md" # <-- kun seneste-rapport, ikke aktiv-plan
```

Push til `claude/h020-plan` rammer ikke `branches: [main]`-filter. PR-trigger dækker kun `seneste-rapport.md`, ikke `aktiv-plan.md` eller `plan-feedback/*.md`.

## Konflikt med Mathias' instruks

Mathias' OPGAVE 3 + 4:

- Opgave 3: "Aktiv-plan-ændringen trigger codex-notify automatisk"
- Opgave 4: "IKKE PR. IKKE merge."

For at codex-notify trigger på aktiv-plan-ændring skal filen være på `main`. Det kræver enten:

- **PR + merge** (udelukket af opgave 4)
- **Direct push til main** (blokeret af branch protection)
- **Yaml-udvidelse til at trigger på alle branches eller pull_request** (ikke i scope for H020)

## H021's design-mangel

H021 udvidede paths-filter men beholdt `branches: [main]` + smal PR-paths-filter. Plan-flowet kræver PR-trigger eller branch-uafhængig push-trigger for at virke uden merge.

H021's slut-rapport claimed: "ny plan-version (aktiv-plan ændret) → 'Code's tur er forbi. Codex skal reviewe planen som aktiv-plan peger på.'" — dette comment-type kan kun fire på main-push, som forudsætter merge. Plan-fasen kan ikke bruge mekanismen med "IKKE PR. IKKE merge."-konstraint.

## Vurdering

Dette er ikke krav-dokument-brud (planen modsiger ikke krav-dokumentet). Det er **automation-design-mangel** opdaget under første reelle test. Krav-dokumentets sekundære formål specificerer eksplicit: "Hvis flow-fejl opdages: stop pakken, dokumentér i plan-feedback/H020-flow-fejl.md, og lad Mathias afgøre."

## Forslag-retninger (Mathias afgør)

- **A.** Udvid `codex-notify.yml` pull_request-trigger til at inkludere `aktiv-plan.md` + `plan-feedback/*.md` paths. Code laver PR for plan-fil; PR-event trigger Codex-review uden merge. Plan kan iterer via flere commits til PR-branchen uden merge.
- **B.** Lav separat workflow med trigger på alle branches der matcher pattern (f.eks. `claude/*-plan`). Risiko: spammer tracker-issue.
- **C.** Ændr Mathias-instruks "IKKE PR" til "PR uden merge". Plan-PR laves og review sker via PR-events; merge sker først efter Mathias-godkendelse.
- **D.** Anden vej.

## Hvad jeg har gjort i denne fejl-detektion

- Plan-fil `docs/coordination/H020-plan.md` skrevet og committed
- aktiv-plan.md opdateret og committed
- Begge pushed til `claude/h020-plan` (commit `c94ebb6`)
- Branch findes på origin men trigger ikke automation
- Stopper indtil Mathias afgør retning

Plan-arbejdet selv har ingen mangler — strukturel beslutning, implementations-rækkefølge, og verifikations-tabel er klar til Codex-review når automation-flow er fixet.
