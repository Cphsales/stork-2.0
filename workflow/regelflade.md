# workflow/-regelflade (Pakke 1)

**Aktør-flade** (teknisk; Mathias læser den ikke — jf. flade-arkitektur). Bygges efter den godkendte plan `workflow-faerdiggoerelse-pakke1-plan @ 94c70eb` (krav-hash `c964826…b79`). ÉN regel-flade, ikke parallelle docs (doc-vægt). Eksekverbare klausuler er autoritative; denne fil dokumenterer.

## Klausul (a) — gate-ord + dispositions-vokabular ✅ bygget

Autoritativ kilde: `workflow/gate-def.json` · checker: `scripts/workflow/gate-check.mjs` · bevis: `scripts/workflow/gate-check.selftest.mjs` (kanariefugl: ukendt gate-ord/disposition → afvist).

- **Gate-ord (eksterne):** `krav OK` · `plan OK` · `build OK` → interne states (`krav-laast` / `plan-laast` / `build-laast`), jf. S12.
- **Dispositions-vokabular:** `BLOCKER` · `FIX-NOW` · `FOLLOW-UP` · `FALSE-POSITIVE-WITH-EVIDENCE` · `MATHIAS-GATE`.

## Klausul (b) — spec-skema (krav-ID + acceptkriterie + matrix-gate) ✅ bygget

Autoritativ kilde: `workflow/spec-skema.json` · checker: `scripts/workflow/spec-check.mjs` · bevis: `scripts/workflow/spec-check.selftest.mjs` (kanariefugle: krav uden step/test/acceptkriterie, ugyldigt krav-ID, plan-step uden krav, Pakke-2 uden begrundelse → alle afvist).

- **Krav-ID-format:** `K-<n>`. **Påkrævet pr. krav:** id · acceptkriterie · step · test.
- **Matrix-gate (S7):** hvert krav → plan-step + test; hver plan-step → et krav (omvendt dækning); Pakke-2-krav → begrundelse.

## Klausul (c) — Mathias-kommunikationskontrakt (krav 6) ✅ bygget

Autoritativ: `workflow/mathias-komm-kontrakt.json` · checker: `scripts/workflow/mathias-komm-check.mjs` · bevis: `scripts/workflow/mathias-komm-check.selftest.mjs`. En Mathias-bundet besked er kun **"hvad"** (beslutning/retning) — aldrig kode/hvordan. Kanariefugl: kode-hegn (```) eller impl-kommando (`git`/`pnpm`/…) på Mathias' bord → afvist. Inline fakta-referencer (fx en SHA i backticks) flagges ikke.

**Test-dybde (Codex-punkt, bygges med S2):** mekanisk kode-afvisning er kun FØRSTE lag. Den fulde adfærds-test er at kontrakten **styrer rollens output-form** til hvad/valg/spørgsmål i en realistisk opgave (ikke bare fanger ordet "kode") — bevises i S2 (§8C: workflow-rolle → kontrakt-form-output; almindelig rolle → dialog).

## Klausul (d) — recon-præsentationskontrakt + recon-output-skema (krav 6 / S1d) ✅ bygget

Autoritativ: `workflow/recon-skema.json` · checker: `scripts/workflow/recon-check.mjs` · bevis: `scripts/workflow/recon-check.selftest.mjs`. Forretnings-recon præsenteres i **3 kategorier** (nuværende-kode / ikke-bygget / intet-data); hvert fund struktureret (`{kilde, kategori, emne, evidensRef, aktør, klassifikation}`) så transport flettr parallelle aktør-recons **mekanisk**. Kanariefugl: fund uden påkrævet felt / ukendt kategori → afvist.

## Klausul (e) — grundig-recon-kontrakt (krav 4) ✅ bygget

Autoritativ: `workflow/grundig-recon-kontrakt.json` · checker: `scripts/workflow/grundig-recon-check.mjs` · bevis: `scripts/workflow/grundig-recon-check.selftest.mjs`. Hele berørte scope kortlægges; recon stopper ikke ved første fund. Kanariefugl: ukortlagt scope-emne / `stoppedEarly`-flag → afvist. (Scale letter bredde/scope-udvælgelse, ikke dybden i valgt scope — Codex' bindende fortolkning.)

## S2-byggekrav — test-tråde der følger effekten til næste led (Codex-standard, IKKE valgfrit)

Ved Leverance-1-review skal disse konkrete tråde findes (ikke "noteret men ikke testet"):

- **(c)-tråd:** Mathias-komm-kontrakt → importeret af rolle-instruks → realistisk-opgave-fixture → output holder sig til Mathias' bord (hvad/valg/spørgsmål) → kanariefugl afviser kode/hvordan.
- **(d)-tråd:** recon-format → påvirker næste led (krav-oplæg) korrekt — fixture nu, fuld e2e i Leverance 4.

**S3 — worklog/ledger + drift-gate ✅ bygget:** `workflow/worklog.json` (state) · skema `workflow/worklog.schema.json` · checker `scripts/workflow/worklog-check.mjs` · bevis `scripts/workflow/worklog-check.selftest.mjs`. Worklog er den **pålidelige state-kilde** (j)'s `currentFromState` binder mod (Codex' afhængighed): det mekaniske felt `kravHash` gen-beregnes fra krav-dokket — hand-edit der lyver → **DRIFT BLOKERET**. **Gate-state (`kravOK`/`planOK`/`buildOK`) lever her**, ikke i den hash-bundne krav-body — løser UDKAST-linje-problemet strukturelt. **Drift-gaten fanger løgn i begge** (Codex' checkliste): `kravHash` gen-beregnes fra krav-dok; `planSha` verificeres som faktisk git-commit; gate-state konsistens-tjekkes (planOK uden kravOK/planSha, buildOK uden planOK → DRIFT). Net: worklog er **kilde-verificeret** (kan ikke blive en lyvende manuel sandhed ved siden af git/artefakter — point 1/4), ikke bare hand-skrevet. (Fuld auto-generering af gate-state fra committede gate-records = forward, Pakke 2.) Real-worklog-drift køres som CI-step (`workflow:selftest`).

**S13-wiring (kører i CI, hærdet):** `scripts/workflow/selvtjek.mjs` (`pnpm workflow:selftest`) gør to ting, kørt som CI-step i governance-jobbet: **(1) dæknings-tjek** — hver `*-check.mjs` SKAL have en matchende selftest, ellers FAIL (lukker silent-skip via fejlnavn/manglende test; tvinger nye kontrakter f–m med); **(2) kørsel** — alle selftests køres, CI fejler hvis nogen fejler. `selvtjek.selftest.mjs` (meta) beviser begge fail-stier mod en temp-fixture. (Codex' tre CI-punkter: CI fejler-på-fejl ✓, ingen lydløs skip ✓, nye kontrakter tvinges med ✓.)

## Klausul (g) — review-dybde / proportionel re-validering (deterministisk) ✅ bygget

Autoritativ: `workflow/review-dybde-kontrakt.json` · checker: `scripts/workflow/review-dybde-check.mjs` · bevis: `scripts/workflow/review-dybde-check.selftest.mjs`. `decideReValidering()` afgør **deterministisk** (ikke skøn): ingen baseline → full-scope; berører en trigger (bærende kontrakt/krav-mapping/gate-semantik/rolle-instruks/recon-skema/aktør-aktivering/repo-sandhed/reviewer-miss) → full-scope; ellers diff-bundet. Kanariefugl: en trigger kan ikke gambles til diff-bundet.

## Klausul (j) — aktør-handoff / SHA-binding (krav 2/5/9) ✅ bygget

Autoritativ: `workflow/handoff-kontrakt.json` · checker: `scripts/workflow/handoff-check.mjs` · bevis: `scripts/workflow/handoff-check.selftest.mjs`. `validateBinding()` kræver at et verdikt binder til **samme plan-SHA + krav-hash** som den aktuelle artefakt; `kanalFor()` giver hver aktørs læsekanal. Kanariefugl: stale plan-SHA / forkert el. manglende krav-hash → afvist (kan ikke binde på gammel state); general mismatch (vilkårlig SHA), ikke kun kendt-gammel. `currentFromState()` henter den aktuelle SHA+hash fra **pakke-state (S3 worklog)** — ikke en hardcodet fixture. Gaterne (S8/S9) og (f) dual-hash **genbruger `validateBinding`** uden parallel logik (Codex' (j)-checkliste).

## Klausul (m) — self-validerings-kontrakt (krav 3) ✅ bygget

Autoritativ: `workflow/self-validering-kontrakt.json` · checker: `scripts/workflow/self-validering-check.mjs` · bevis: `scripts/workflow/self-validering-check.selftest.mjs`. Pr. handoff skriver aktøren en blok (docs læst · holdt op mod · drift fundet · ikke verificeret · kanariefugl); FØRSTE forsvarslag, erstatter ALDRIG uafhængig review. Kanariefugl: tom/sprunget blok (manglende indhold/felt) → afvist (papirgrøn-guard).

## Klausul (k) — djævlens-advokat-kontrakt (krav 3/5) ✅ bygget

Autoritativ: `workflow/djaevel-kontrakt.json` · checker: `scripts/workflow/djaevel-check.mjs` · bevis: `scripts/workflow/djaevel-check.selftest.mjs`. Pr. krav skal reviewer udfylde 6 felter (min/max-læsning · snydevej-til-grøn · kanariefugl-der-lukker · evne-ikke-færdig · ikke-gemt-bag-build-recon); en APPROVAL uden fuldt pass → afvist. Reviewer-rolle, ALDRIG Mathias; scope-routes via S5 — men **scope-routing kan ikke springe et BERØRT krav over** (alle berørte krav dækkes uanset scale; kanariefugl: `beroertKravIkkeDaekket` → FAIL). (Codex-hærdning.)

## Klausul (l) — Claude.ai chat-recon-kontrakt (krav 2/6) ✅ bygget

Autoritativ: `workflow/chat-recon-kontrakt.json` · checker: `scripts/workflow/chat-recon-check.mjs` · bevis: `scripts/workflow/chat-recon-check.selftest.mjs`. Fund fra chat-projektet skal cite med citat/dato/tråd + gyldig klassifikation (låst-beslutning/stærk-intention/mulig-præference/gammel-superseded/modsigelse-uklarhed); ukildet/uklassificeret → afvist (ingen usynlig sandhed). **Modsiger låste docs** (el. klassifikation `modsigelse-uklarhed`) → skal til **Mathias/FEEDBACK** (`tilMathias`), **aldrig anvendt som auto-sandhed** (`anvendtSomSandhed` → FAIL). (Codex-hærdning: Claude.ai vælger ikke selv.)

## Klausuler (f), (h), (i) — bygges gennem Leverance 1

(f) krav-troskab-metode (matrix done b · menings-gate · dual-hash via j · kæde-troskab) + recon-output-skema · (e) grundig-recon-kontrakt · (f) krav-troskab-metode (+ kumulativ kæde-troskab) · (g) review-dybde-kontrakt (to faser + proportionel re-validering) · (h) recon-dybde-kontrakt · (i) repo-hygiejne-/klassifikations-kontrakt · (j) aktør-handoff-/læsekanal-kontrakt · (k) djævlens-advokat-kontrakt · (l) Claude.ai chat-recon-kontrakt · (m) self-validerings-kontrakt.

Hver klausul bygges som tekst-der-ER-funktionen med en fejlende test (kanariefugl), gerne eksekverbar (primitiv-først). Codex' bindende fortolkninger fra gate-passet bæres ind: S5-routing letter **bredde/scope**, aldrig S6's fulde recon-dybde af berørt scope.
