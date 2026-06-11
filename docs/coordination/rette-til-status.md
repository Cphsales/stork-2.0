# rette-til — pakke-status (§3.5)

**Pakke:** rette-til (kæde-fix før gov-6) — bestilling: `/home/mathias/byg-bestilling-kaede-fix.md` (Mathias-go 2026-06-11, Option A)
**Branch:** claude/rette-til-kaede-fix (fra origin/main @ 155a819)
**Dato:** 2026-06-12

## Sidste handling

Setup: branch oprettet, status-fil oprettet. LÆSEFØLGE fulgt (alle 6 docs).
Nattens stale-artefakter (8× ingen-troskab + 5× mathias-gate) arkiveret til
evidens-mappen af disciplin-vagt-terminalen — træet var rent ved branch-punktet.
Verificeret: stork-kaede.service inactive/disabled, ingen dirigent-proces
(dirigenten genstartes IKKE — ramme).

## Næste forventet

Batch 1 (punkt 1): CODEOWNERS-PR (tre recon-mønstre → P3-blok, Mathias-klik er
gaten) + transport→PR-vej i dirigent.mjs (selftest udvides FØR fixet).

## Rodårsags-noter (verificeret mod kode + dispatch-log + journal)

- **Punkt 4 (spor):** `laesTilstand()` beregner qwers-åbnings-ankeret
  (`aktivPakke`, tilstand.mjs:291) men returnerer det IKKE i tilstands-objektet —
  `decide()` falder tilbage til `tilstand.marker?.pakke` = "ingen"
  (dirigent.mjs:68). Deraf spor "ingen" på transport-commit OG at
  (aktør, spor)-låsen aldrig matchede transport-vejens VENT-værn (= racen i
  punkt 2 fik lov at løbe).
- **Punkt 11c (log):** time-for-time-sammenligning log↔journal viser at
  live-loggen ER komplet for 11-12/6 (log er UTC, journal lokal CEST —
  KOPI'en i evidens-mappen er et snapshot fra 20:46 lokal og mangler derfor
  aften-kørslerne). Fixet gøres alligevel beviseligt: alle STOP-veje logger
  før exit + selftest på at hver DISPATCH producerer log-entry.
- **Punkt 9b (probe):** bot-PAT'en KAN nu skrive på #126 (reaction-probe
  add+delete testet 2026-06-12 — token-scope tilsyneladende fikset). Proben
  implementeres som reaction add/remove (rører ALDRIG kommentarer/gate-ord).

## Konvergens-counter

0 (ingen review-runder kørt endnu)

## Blocker

Ingen.

## Batch-plan (bestillingens 11 punkter)

| Batch | Punkter  | Indhold                                                                    |
| ----- | -------- | -------------------------------------------------------------------------- |
| 1     | 1        | CODEOWNERS-PR (forudsætning, separat PR) + transport→PR-vej                |
| 2     | 2+3      | transport bundet til adapter-exit 0 · atomisk codex-skrivning              |
| 3     | 4+11     | spor-attribution · stale-dispatch-værn · persistent KAEDE-STOP             |
| 4     | 5+6+9+10 | systemd-PATH/.nvmrc · dispatch-varighed · preflight-udvidelse · 1a-kobling |
| 5     | 7+8      | plan-diæt + læselister · recon-FORM-reglen                                 |

Codex-review pr. batch. Selftest udvides FØR hvert fix. Kode-/CODEOWNERS-PR'er
kræver Mathias-klik; slut-bevis = preflight grøn + selftest grøn (ingen
dirigent-genstart).
