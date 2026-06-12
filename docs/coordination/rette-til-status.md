# rette-til — pakke-status (§3.5)

**Pakke:** rette-til (kæde-fix før gov-6) — bestilling: `/home/mathias/byg-bestilling-kaede-fix.md` (Mathias-go 2026-06-11, Option A)
**Branch:** claude/rette-til-kaede-fix (fra origin/main @ 155a819)
**Dato:** 2026-06-12

## Sidste handling

**Batch 2 (punkt 2+3) FÆRDIG** — transport bundet til afsender-adapterens
exit 0 (VENT ved afsender-kørsel uanset spor) + atomisk codex-skrivning
(tmp+mv begge stream-veje). Batch 1 (punkt 1): CODEOWNERS-PR #150 (afventer
Mathias-klik; cherry-picket til branchen, runde 1-fund 2) + transport→PR-vej
m. BEVIST PR-tilstand (runde 1-fund 1). Punkt 10 UDGÅET (Mathias-ord
2026-06-12) — batch 4 er punkt 5+6+9.

**RETTELSE af tidligere status-påstand (runde 4-KRITISK 2, ACCEPT):** runde 3
indeholdt et KRITISK-fund (gate-afgørelse genoptog kæden før transport-PR var
merged) som denne status fejlagtigt udelod — det er nu LUKKET test-først:
GATE-AFGJORT dispatcher aldrig i samme cyklus; AFGJORT-indholdet transporteres
via PR mens lokal gate-fil bevarer AFVENTER MATHIAS indtil merge+ff-synk
(pausespor består gennem genstart); Code-dispatch ad event-vejen bagefter.
Lektion bogført: review-filer læses FULDT, aldrig i udsnit.

Codex-runder: 1 (2× KRITISK → ACCEPT+fix) · 2 (1× KRITISK → ACCEPT+fix) ·
3 (1× KRITISK + 1× MELLEM → ACCEPT+fix) · 4 (2× KRITISK = gentaget runde
3-fund + status-usandhed → begge ACCEPT+fixet her). §8.1-SVAR runde 2-4:
INGEN-MODSIGELSE.

## Næste forventet

Re-review (runde 5) der bekræfter gate-fixet, derefter batch 3 (punkt 4+11):
spor-attribution + stale-dispatch-værn + persistent KAEDE-STOP.

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

4 (alle substans: runde 1 = 2 KRITISK · runde 2 = 1 KRITISK · runde 3 =
1 KRITISK + 1 MELLEM · runde 4 = 2 KRITISK (gentaget runde 3-fund +
status-usandhed) — alle ACCEPT + fixet. §3.4-alert-tærsklen (4) ER ramt:
rammen vurderes — fundene konvergerer (alle i samme gate-transport-klasse,
ingen nye klasser i runde 4), så der fortsættes mod re-review runde 5; rammer
runde 5 et NYT KRITISK i samme klasse, pauses og Mathias spørges.)

## Blocker

Ingen.

## Batch-plan (bestillingens 11 punkter)

| Batch | Punkter | Indhold                                                                                                                                                                          |
| ----- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 1       | CODEOWNERS-PR (forudsætning, separat PR) + transport→PR-vej                                                                                                                      |
| 2     | 2+3     | transport bundet til adapter-exit 0 · atomisk codex-skrivning                                                                                                                    |
| 3     | 4+11    | spor-attribution · stale-dispatch-værn · persistent KAEDE-STOP                                                                                                                   |
| 4     | 5+6+9   | systemd-PATH/.nvmrc · dispatch-varighed · preflight-udvidelse — punkt 10 UDGÅET (Mathias-ord 2026-06-12: 1a-koblingen bygges ikke; selvtjek-docs.mjs består som manuelt værktøj) |
| 5     | 7+8     | plan-diæt + læselister · recon-FORM-reglen                                                                                                                                       |

Codex-review pr. batch. Selftest udvides FØR hvert fix. Kode-/CODEOWNERS-PR'er
kræver Mathias-klik; slut-bevis = preflight grøn + selftest grøn (ingen
dirigent-genstart).
