# rette-til — pakke-status (§3.5)

**Pakke:** rette-til (kæde-fix før gov-6) — bestilling: `/home/mathias/byg-bestilling-kaede-fix.md` (Mathias-go 2026-06-11, Option A)
**Branch:** claude/rette-til-kaede-fix (fra origin/main @ 155a819)
**Dato:** 2026-06-12

## Sidste handling

**LEVERANCEN ER FÆRDIG — SLUT-BEVIS FØRT 2026-06-12:** fuld selftest GRØN
(172 cases, fra 111 ved gov-5-luk) · preflight GRØN live (11/11 inkl.
.nvmrc-afledning + issue-write-probe mod #126) · dirigenten ALDRIG genstartet
(service inactive gennem hele leverancen). Codex-APPROVAL pr. batch: runde 5
(batch 1+2) · 11 (batch 4) · 12 (batch 5; batch 3's fund lukket i runde 5-10).
Kode-PR afventer Mathias-klik (beslutnings-sti). CODEOWNERS-PR #150 MERGED.

**Batch 5 (punkt 7+8) FÆRDIG — ALLE bestillingens punkter er nu bygget**
(punkt 10 udgået på Mathias-ord). Punkt 7: code.sh-prompten differentierer
pr. opgave-klasse (mekanik → MINIMAL læseliste; build → plan SEKTIONSVIS;
konservativ default → fuld LÆSEFØLGE). Punkt 8: RECON-FORM-reglen (KUN
findings + forretnings-spørgsmål, ALDRIG løsninger) i code-adapterens
recon-prompt + claude-ai-rolle-instruksens recon-syntese. Adapter-kontrakter
selftest-håndhævet.

**Batch 4 (punkt 5+6+9) FÆRDIG** — punkt 5: node-env.sh afleder node af
.nvmrc via nvm (unit-PATH pinner ingen versions-sti; preflight beviser
match). Punkt 6: KOERSEL-SLUT bærer varighed_ms pr. dispatch. Punkt 9a:
mobil-MODTAGE-tjekliste i preflight-output (manuelt Mathias-punkt). Punkt 9b:
issue-write-probe (reaction add/delete, fail-closed). Preflight kørt LIVE:
alle 11 mekaniske punkter ✓ inkl. probe mod #126.

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

Batch 1+2: Codex-APPROVAL runde 5. Batch 1: **CODEOWNERS-PR #150 MERGED
(Mathias-klik 2026-06-12 01:10Z @ `2cc8245`) — punkt 1-forudsætningen er
PASSERET**; arbejds-branchen er rebaset på origin/main (cherry-picken
deduperet væk; selftest + format:check grønne efter rebase). Transport→PR-vej
m. BEVIST PR-tilstand; batch 2: afsender-exit-0-binding + atomisk
codex-skrivning. Punkt 10 UDGÅET (Mathias-ord 2026-06-12) — batch 4 er punkt
5+6+9. Gate-transport-klassen (runde 3+4-KRITISK) lukket: GATE-AFGJORT
dispatcher aldrig i samme cyklus; lokal gate-fil bevarer AFVENTER MATHIAS
indtil merge+ff-synk.

**Runde 7-KRITISK (ACCEPT) lukket:** qwers-ankeret var stateless — det stående
`qwers gov-6` på #126 gav stale leverancer fra ANDRE spor et gyldigt spor
efter genstart. Fix: under åbnings-anker (markør "ingen") flyder KUN pakkens
egne leverancer (`hoererTilPakke`, kendte bærer-suffikser så præfiks-pakker
ikke kolliderer: gov-6 ≠ gov-6-forslag-og-udskudte); fremmede filer →
BLOKERET ["leverance-uden-for-aabnings-pakken"], også FØR fund-gate-dispatch.
Codex' repro er selftest-case; legitimt åbnings-flow (egen recon/krav-dok)
bevist ubrudt.

**Disciplin-justering (runde 6 + 9, ACCEPT — klassen ramt tre gange, skærpet):**
status-filen synkes FØR HVER Codex-review-kald (også mekanik-runder) — review-
trigger er en LÆSEFØLGE-klasse-trigger, og §3.5 gør filen til sessionsbro.

Codex-runder: 1 (2× KRITISK) · 2 (1× KRITISK) · 3 (1× KRITISK + 1× MELLEM) ·
4 (2× KRITISK: gentaget gate-fund + status-usandhed) · 5 (APPROVAL — gate-
klassen bekræftet lukket) · 6 (1× KRITISK: status-fil bagud) · 7 (1× KRITISK:
stateless qwers-anker → hoererTilPakke-fixet) · 8 (1× KRITISK, MEKANIK:
prettier-format på de tre kæde-filer → fixet @ 7ee7316) · 9 (1× KRITISK,
MEKANIK: status-bogføring af runde 8 manglede) · 10 (1× KRITISK, MEKANIK:
#150-merge ikke bogført — ekstern state ændrede sig: Mathias mergede mens
batchen kørte; synket + rebaset) · 11 (APPROVAL — batch 4 bekræftet inkl.
systemd-analyze verify grøn) · 12 (APPROVAL — batch 5). Alle fund ACCEPT +
fixet. §8.1-SVAR runde 2-12: INGEN-MODSIGELSE.

## Næste forventet

Mathias-klik på kode-PR'en (eneste udestående gate). Efter merge: pakke-luk
(§4-bevarelse: status/plan/reviews ryddes, krav-dok arkiveres) — og gov-6-
genåbning er Mathias' ord (qwers-format på #126; gammelt stående qwers-ord
genfyrer beviseligt ikke). Dirigenten startes IKKE af denne leverance —
aktivering er Mathias' tjekliste (inkl. fjernelse af evt. stop-fil +
installation af opdateret unit-fil: cp + daemon-reload).

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

7 substans (runde 8+9 er mekanik-runder per §3.4-skellet: format + bogførings-
synk — bogført, tæller ikke mod alert/STOP). Substans-historik: 1 (2 KRITISK,
transport-idempotens + CODEOWNERS-state) · 2-4 (gate-transport-klassen, lukket
og APPROVAL-bekræftet i runde 5) · 6 (status-synk-klassen) · 7 (stateless
qwers-anker — konsekvens-opfølgning på batch 3's spor-anker-fix; lukket samme
runde). §3.4-alert blev vurderet ved 4: fundene konvergerer (én klasse ad
gangen, hver lukket før næste batch); runde 5-APPROVAL bekræftede vurderingen.
Rammen (bestillingen) er fortsat præcis — ingen krav-dok-genåbning indiceret.

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
