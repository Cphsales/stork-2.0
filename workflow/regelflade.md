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

**S3 — worklog/ledger + drift-gate ✅ bygget:** `workflow/worklog.json` (state) · skema `workflow/worklog.schema.json` · checker `scripts/workflow/worklog-check.mjs` · bevis `scripts/workflow/worklog-check.selftest.mjs`. Worklog er den **pålidelige state-kilde** (j)'s `currentFromState` binder mod (Codex' afhængighed): det mekaniske felt `kravHash` gen-beregnes fra krav-dokket — hand-edit der lyver → **DRIFT BLOKERET**. **Gate-state (`kravOK`/`planOK`/`buildOK`) lever her**, ikke i den hash-bundne krav-body — løser UDKAST-linje-problemet strukturelt. **Drift-gaten fanger løgn i begge** (Codex' checkliste): `kravHash` gen-beregnes fra krav-dok (hård); `planSha`-format hårdt + git-eksistens **best-effort** (et cross-branch plan-SHA er ikke i en lavvandet CI-checkout → note, ikke fejl; de hårde checks bærer integriteten); gate-state konsistens-tjekkes (planOK uden kravOK/planSha, buildOK uden planOK → DRIFT). Net: worklog er **kilde-verificeret** (kan ikke blive en lyvende manuel sandhed ved siden af git/artefakter — point 1/4), ikke bare hand-skrevet. (Fuld auto-generering af gate-state fra committede gate-records = forward, Pakke 2.) Real-worklog-drift køres som CI-step (`workflow:selftest`).

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

## Klausul (i) — repo-hygiejne / klassifikation (krav 8) ✅ bygget

Autoritativ: `workflow/repo-hygiejne-kontrakt.json` · checker: `scripts/workflow/repo-hygiejne-check.mjs` · bevis: `scripts/workflow/repo-hygiejne-check.selftest.mjs`. Validerer en repo-sandheds-inventory: gyldig status/handling pr. doc; hver **levende doc** (aktiv-sandhed/workflow-funktion) har formål + ejer-funktion + test/gate; **én aktiv sandhed pr. emne** (flere → `konkurrerendeSandhed` BLOKER). Grundlaget S15(-light) kører over hele `docs/`.

## Klausul (h) — recon-dybde-kontrakt ✅ bygget

Autoritativ: `workflow/recon-dybde-kontrakt.json` · checker: `scripts/workflow/recon-dybde-check.mjs` · bevis: `scripts/workflow/recon-dybde-check.selftest.mjs`. Full-scope first-pass: recon viser sin **dækningsflade**, er **dedupliceret**, og i runde 2+ er et fund i allerede-dækket flade en **recon-miss**. Kanariefugle: manglende dækningsflade / dublet / recon-miss → afvist.

## Klausul (f) — krav-troskab-metode (krav 2) ✅ bygget

Autoritativ: `workflow/krav-troskab-kontrakt.json` · checker: `scripts/workflow/krav-troskab-check.mjs` · bevis: `scripts/workflow/krav-troskab-check.selftest.mjs`. **Komponerer** matrix (b/`validateSpec`) + dual-hash-binding (j/`validateBinding`) — ingen parallel logik — + menings-gate (rolle PASS/FEEDBACK registreret) + kumulativ kæde-troskab (krav⊨vision). Kanariefugle: fejl i hvert led (matrix/binding/menings/kæde) fanges.

**Alle 13 klausuler (a–m) er bygget.**

## S2 — seks rolle-instrukser ✅ bygget

Autoritativ: `workflow/roller.json` · checker: `scripts/workflow/roller-check.mjs` · bevis: `scripts/workflow/roller-check.selftest.mjs`. Code/Codex/Claude.ai × {workflow, almindelig}. **Struktur:** alle workflow-roller importerer (c)/(d)/(e)/(h); review-rollerne (Codex-workflow, Claude.ai-workflow) også (k); Claude.ai-workflow også (f)/(l); almindelig = fri dialog. **Adfærds-tråd (Codex' krav):** kontrakten styrer rollens output i en realistisk opgave — Claude.ai-workflow importerer (c), så et krav-oplæg med kode på Mathias' bord **afvises**, et rent "hvad"-output accepteres. Kanariefugle: rolle uden krævet import / almindelig-rolle med imports → FAIL.

## S15-light — seed repo-sandheds-inventory ✅ bygget

Autoritativ: `workflow/doc-inventory.json` · checker: `scripts/workflow/s15-light-check.mjs` · bevis: `scripts/workflow/s15-light-check.selftest.mjs`. Kører (i) repo-hygiejne over inventory'et + verificerer at hver levende workflow-doc er inventoriseret (uinventeret doc / konkurrerende sandhed → afvist). Giver det **doc-grundlag S6 forventer** (én aktiv sandhed pr. emne). LIGHT scope = `workflow/`; **fuld `docs/`-tree-klassifikation = Leverance 4** (fuld S15-gate, Plan-2-precondition). Real-run i CI (`workflow:selftest`).

**Leverance 1 (substrat) er hermed komplet:** alle 13 kontrakter (a–m) + S2 (roller) + S3 (worklog/drift) + S13 (CI-suite) + S15-light. Klar til formel Codex full-scope review.

Hver klausul bygges som tekst-der-ER-funktionen med en fejlende test (kanariefugl), gerne eksekverbar (primitiv-først). Codex' bindende fortolkninger fra gate-passet bæres ind: S5-routing letter **bredde/scope**, aldrig S6's fulde recon-dybde af berørt scope.
