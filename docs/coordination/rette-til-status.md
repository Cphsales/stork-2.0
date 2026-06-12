# rette-til — pakke-status (§3.5)

**Pakke:** rette-til (kæde-fix før gov-6) — bestilling: `/home/mathias/byg-bestilling-kaede-fix.md` (Mathias-go 2026-06-11, Option A)
**Branch:** claude/rette-til-kaede-fix (fra origin/main @ 155a819)
**Dato:** 2026-06-12

## Sidste handling

**Batch 3 (punkt 4+11) FÆRDIG** @ `d5d31fd` — punkt 4: laesTilstand
returnerer pakke-feltet (qwers-ankeret), decide() bruger det før
markør-fallback (rodårsagen til spor "ingen"-attributionen). Punkt 11:
(a) persistent KAEDE-STOP via stop-fil på alle seks stop-veje; dirigent +
preflight nægter (exit 78, --dry-run tilladt som diagnostik); unit:
RestartPreventExitStatus=2 64 78 + StartLimit 5/10min — restart-loop-
rodårsagen (#147) er død; (b) spor-'ingen'-dispatch-værn (BLOKERET) på
transport-/leverance-/fund-gate-/event-vej, stale-flod-replay i selftest +
verificeret i offline dry-run; (c) git/gh-timeout 120s + KAEDE-START-
instans-spor (log↔journal-paritet var reelt OK — KOPI'en var snapshottet
før aften-kørslerne); (d) behandlet qwers-ord genfyrer ALDRIG efter genstart
— bevist mekanisk i selftest; nyt kommentar-id åbner stadig.

Batch 1+2: Codex-APPROVAL runde 5. Batch 1: CODEOWNERS-PR #150 (afventer
Mathias-klik) + transport→PR-vej m. BEVIST PR-tilstand; batch 2: afsender-
exit-0-binding + atomisk codex-skrivning. Punkt 10 UDGÅET (Mathias-ord
2026-06-12) — batch 4 er punkt 5+6+9. Gate-transport-klassen (runde 3+4-
KRITISK) lukket: GATE-AFGJORT dispatcher aldrig i samme cyklus; lokal
gate-fil bevarer AFVENTER MATHIAS indtil merge+ff-synk.

**Disciplin-justering (runde 6-KRITISK, ACCEPT — klassen ramt to gange):**
status-filen opdateres som DEL af hvert batch-luk, FØR Codex-review kaldes —
ikke bagefter. Denne opdatering er første anvendelse.

Codex-runder: 1 (2× KRITISK) · 2 (1× KRITISK) · 3 (1× KRITISK + 1× MELLEM) ·
4 (2× KRITISK: gentaget gate-fund + status-usandhed) · 5 (APPROVAL — gate-
klassen bekræftet lukket) · 6 (1× KRITISK: status-fil bagud → denne synk).
Alle fund ACCEPT + fixet. §8.1-SVAR runde 2-6: INGEN-MODSIGELSE.

## Næste forventet

Re-review (runde 7) bekræfter batch 3 + status-synk, derefter batch 4
(punkt 5+6+9): systemd-PATH/.nvmrc · dispatch-varighed · preflight-udvidelse
(mobil-MODTAGE-tjekliste + issue-write-probe).

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

6 — substans-runder: 1 (2 KRITISK, transport-idempotens + CODEOWNERS-state) ·
2-4 (gate-transport-klassen, lukket og APPROVAL-bekræftet i runde 5) · 6
(status-synk-klassen, anden gang → disciplin-justering ovenfor). §3.4-alert
blev vurderet ved 4: fundene konvergerede (én klasse ad gangen, hver lukket
før næste batch); runde 5-APPROVAL bekræftede vurderingen. Mekanik/substans-
skel (§3.4): runde 6's fund er bogførings-synk — klassificeret konservativt
som substans, men rammen (bestillingen) er uændret præcis.

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
