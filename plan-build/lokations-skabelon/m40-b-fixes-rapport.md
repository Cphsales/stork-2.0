# RAPPORT-B — M-40 B-punkter (6 selvtest-reparationer)

Bygger-arm, 2026-09-08. Kilder: OVERTEST-claude.md (O-2, O-10) + OVERTEST-codex.md (O-9, O-10, O-12, O-13).
Intet committet. Ingen pinnede moduler rørt (build-harness.mjs er byte-identisk med HEAD, blob `ccee1a8e…` = HEAD-blob; haerdet-register\* urørt).

## Slutverifikation

`npm run v5:selftest`: **517 ✓, 0 ✗ i alle 16 moduler — eneste røde er haerdet-register-checket** (`verdikt.mjs` ÆNDRET siden Codex-pas, registreret `01dc90…` ≠ nuværende `4b6576…`) — kendt/forventet, afventer Codex-pas hos driveren. Hver redigeret fils selvtest kørt grønt enkeltvis efter ændringen.

---

## B2 — build-harness.selftest.mjs: positiveOk-klausulen udøves nu (Claude O-2)

**Ændret:** Nyt fixture `posBreakNegAllowed()` (efter `posBreak`, ~linje 48) hvor POS **fejler** OG NEG **tillades** under mutanten, + ny case efter den gamle positiv-break-case:
`"POS fejler + NEG TILLADES under mutant → IKKE dræbt (positiveOk-klausulen bærer alene, O-2)"` → forventer `killed=false`.
Pointen: i `posBreak` forbliver NEG afvist, så `killed=false` uanset klausulen (`negAllowed=false` bærer alene). I det nye fixture er `negAllowed=true` og `protocolOk=true` — kun `positiveOk === true`-klausulen i `build-harness.mjs:169-170` kan gøre `killed=false`.

**Mutations-bevis (udført, fortrudt):**
1. Fjernede midlertidigt `underMutant.positiveOk === true &&` fra `build-harness.mjs:169-170`.
2. Kørte selvtesten: **præcis 1 case fejlede — den nye** (`fik true, forventede false`). Ingen andre cases fejlede — hvilket samtidig bekræfter O-2's fund: den gamle suite kunne IKKE fange fjernelse af klausulen (mutant M10 overlevede).
3. Fortrød mutationen; verificerede `git hash-object` = HEAD-blob (byte-identisk) og selvtest grøn igen.

## B3 — build-harness.integration.mjs: manglende DB fail-lukker (Codex O-9)

**Ændret (~linje 26-39):** Manglende container giver nu **exit 1** som default med fejlmelding `"fail-closed: manglende DB ≠ grønt bevis"` + start-instruktion. Nyt eksplicit flag `--skip-db` (kun lokal udvikling) exiter 0 med utvetydig melding: `"⚠ SKIPPED (ikke et bevis): … integrations-beviset blev IKKE ført (0 prøver kørt; --skip-db er kun til lokal udvikling)."` Kommentarblok opdateret tilsvarende.

**Verifikation:** Kørt uden container: `node scripts/v5/build-harness.integration.mjs` → exit **1** med fejlmelding; `--skip-db` → exit **0** med SKIPPED-melding. (Selve bevis-logikken mod Postgres er urørt; container-kørsel ville kræve image-pull = net, som var forbudt.) Filen er ikke del af `v5:selftest` (CI container-fri), så suiten er upåvirket.

## B4 — coverage.selftest.mjs: git-show-fail-closed-casen rammer nu den tilsigtede sti (Codex O-10)

**Ændret (~linje 309):** Casen ERSTATTET. Før: mocken kastede fra `fakeGit("show")`, men modulet læser via `git.bytes("show", …)` (`coverage.mjs:217`) — den manglende `.bytes`-metode gav `TypeError`, og casen gik grøn på en ANDEN fejl. Nu: `fakeGit.bytes` kaster den tilsigtede fejl (`"simuleret læsefejl (fx > maxBuffer)"`), og der assertes **(a)** at `.bytes` faktisk blev KALDT (flag `bytesCalled`), **(b)** at kastet både bærer `fail-closed` OG den simulerede fejltekst (dvs. den tiltænkte transport-fejl blev ført videre). `bad`-grenen skelner "aldrig kaldt" fra "forkert fejl". Ingen parallel ekstra case tilføjet (Codex' anbefaling: erstat, ikke duplikér).

**Verifikation:** coverage.selftest.mjs grøn; casen logger nu `git.bytes KALDT + den tilsigtede fejl kastet fail-closed`.

## B5 — roller.selftest.mjs: friskhed som struktureret rollebinding (Codex O-13)

**Ændret (~linje 97):** `includes("≠ planner")`-tekstmatchen ERSTATTET af to strukturerede datatjek i ny sektion "friskhed som STRUKTURERET rollebinding":
1. **recon≠planner≠builder som datatjek:** `recon-code`/`planner-code`/`builder-code` findes alle som EGNE registry-nøgler, er **parvis forskellige rolle-objekter** (et alias/delt objekt ville kollapse adskillelsen — `new Set(kaede.map(id => ROLLER[id])).size === 3`), og bærer alle `aktoer === "code"` (tre adskilte roller for samme aktør = adskillelsen er strukturel).
2. **freshness-feltet refererer 'frisk':** alle tre roller matcher `/frisk|ephemeral/i` i `freshness`; fejl-grenen navngiver præcis hvilke roller der mangler deklarationen.
Kommentar noterer eksplicit at FAKTISK sessions-adskillelse efterprøves i aktør-transporten/P-1 — ingen ekstra modelrunde her (Codex' anbefaling).

## B6 — dublet-cases: verifikation pr. par + sletninger

Pr. instruks verificeret pr. par om der FAKTISK er tale om samme mutation+assertion. Resultat:

| Par | Dom | Handling |
|---|---|---|
| actors-lock.selftest.mjs :58 ≈ :101 | **ÆGTE dublet** — begge var bogstaveligt `expectGreen(…, validate(derived()))`, identisk input+assertion; :101's videns-indhold ("codex-forbedring MÅ have web") bæres allerede af web-mandat-checket på derived-låsen (`codex-forbedring beholder web`) + :58's grøn-validering af selvsamme lås | :101 slettet; forklarende kommentar bevaret |
| build-proof.selftest.mjs :119 ≈ :298 | **ÆGTE dublet** — :298's "mutation" `p.claim_graph = [p.claim_graph[0]]` er en **no-op**: `greenProof()`'s claim_graph indeholder ALLEREDE kun K-1-elementet, så input var byte-ækvivalent med grøn-stien :119 (samme `expectGreen(verify(...))`) | Casen slettet; beslutnings-viden (proportional claim_graph-dækning = plan-gate-beslutning, delmængde tilladt — og at grøn-stien allerede beviser det, da greenProof kun dækker K-1 af {K-1,K-2}) bevaret som kommentar |
| checkrun.selftest.mjs :26 ≈ :27 | **ÆGTE dublet** — :26 (`"åben gate → success"`, build) er fuldt indeholdt i loopets `g="build"`-iteration: identisk result-objekt, og loopets assertion er endda skarpere (tjekker også check-run-navnet) | :26 slettet; kommentar bevaret |
| roller.selftest.mjs :88-100 (interne) | **Delvist** — 3 af 6 fakta var mekanisk redundante: (a) `claude-ai.kode===false` håndhæves af validateRoller-invarianten på det RIGTIGE registry (grøn-checket :16) + brud-casen; (b) `codex-angreb.ejerMaalelag===true` er logisk impliceret af "ingen ejer måle-laget → fanget"-casen (den kan KUN gå grøn hvis codex-angreb er eneste ejer, og registry-grøn kræver ≥1 ejer); (c) `OUTPUT_TYPES ∋ recon-candidate` er impliceret af registry-grøn (recon-rollerne producerer typen, og validateRolle kræver producerer ⊆ OUTPUT_TYPES) | (a)+(b)+(c) slettet med forklarende kommentar. **BEHOLDT (ikke dubletter):** `codex-angreb.producerer ∋ "angrebs-spec"` — ingen invariant binder angrebs-spec til codex-angreb; `codex-forbedring.web===true && raadgivende===true` — ingen invariant kræver at codex-forbedring HAR web (validateRoller tjekker kun web→rådgivende, og kun rådgivende-halvdelen er impliceret af verdikt-brud-casen) |
| driver.selftest.mjs :33-39 | **IKKE dubletter — begge beholdt, intet ændret.** Flow-casene bygger deres states via `openUpTo()`, som selv er afledt af CHAIN — de **selv-adapterer**: en 6. gate tilføjet i registryet (human eller auto) ville passere ALLE decideNext-cases tavst, og kæde-ordenen krav<plan og build<slut pinnes ikke af nogen literal state (kun recon<krav og plan<build pinnes via inconsistency-casene :69-77). `HUMAN_GATES`-ligheden er netop krav 9's MEDLEMSKABS-påstand ("KUN krav/plan/slut afbryder") og `CHAIN`-ligheden den fulde kæde-orden — begge fanger registry-udvidelse/derivations-fejl som flow-casene ikke kan. Claude O-10's dom "dækkes af decideNext-cases" holder altså ikke fuldt for netop disse to | Ingen ændring i driver.selftest.mjs |

**Netto case-regnskab:** −4 dublet-cases (actors-lock 1, build-proof 1, checkrun 1, roller 2 — tredje roller-dublet erstattet af B5's 2 strukturerede cases i stedet for 1 tekstmatch), +1 ny B2-case.

## Ændrede filer (alle under workdir-roden)

- `scripts/v5/build-harness.selftest.mjs` (B2)
- `scripts/v5/build-harness.integration.mjs` (B3)
- `scripts/v5/coverage.selftest.mjs` (B4)
- `scripts/v5/roller.selftest.mjs` (B5 + B6)
- `scripts/v5/actors-lock.selftest.mjs` (B6)
- `scripts/v5/build-proof.selftest.mjs` (B6)
- `scripts/v5/checkrun.selftest.mjs` (B6)
