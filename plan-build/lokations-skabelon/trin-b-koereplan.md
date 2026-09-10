# Trin B — driverens køreplan (lokations-skabelon, Fase 3 runde 2 → `plan ok`)

Driver: driver-10b (worktree `.claude/worktrees/driver-10b`, pusher ff til
`claude/workflow-implementeringsplan`; session de4474 fra 2026-09-10 — forgængeren d2883eb4 døde med
maskinen natten 09→10/9 og blev afløst via OVERDRAGELSE-driver-v2 @ 5eb3736). Kilde: GRUNDPLAN-v2 Trin B (Mathias' ok M-41) + fabrik-armens
(mathias-9b) kontrakter meldt 2026-09-09. Skrevet så en frisk driver kan overtage midt i forløbet
(lærdommen fra 09-09 10:17). Opdateres pr. trin med SHA'er. **Ingen aktør startes før mathias-9b
har meldt »Trin A færdig« + SHA** (regler/pins/roller skal være endelige — GRUNDPLAN-v2 Trin A).

## Faste kontrakter (fra fabrik-armen — endelige feltnavne følger med »Trin A færdig«)

- **Wrapper v3:** `scripts/v5/codex-run.sh <rolle> <dom|produktion> <workdir> <timeout-s> <out> <promptfil>`
  — model/effort afledes af `actors.lock[rolle]` (aldrig arg) · sandbox read-only for dom,
  workspace-write for produktion · BLOKER hvis rolletekst@HEAD ≠ lock eller lock i arbejdstræ ≠ HEAD
  · rolletekst @ skill_oid injiceres som første del af prompten (prompt-fil = kun opgaven) · `$OUT`
  uden for workdir · PID-fil `$OUT.pid` (kill -TERM, aldrig brede mønstre) · `$OUT.provenance` → 5.
  arg til `verdikt-byg.mjs` (run_attempt/effort fra kørslen).
- **Plan-gatens bindinger (B5, leveres af fabrik-armen):** krav · recon2 · `p8-slutproeve-spec.md` ·
  `ordbog.md` · `kill-list-udkast.md` — mangler én @ pinned commit → gate lukket. `orderedApproval:
true`. Verdikt-filer: `verdikt-<aktør>-plan*.json`, udvalgt via
  `plan-approval.json._provenance.verdikt_run_ids` (som krav-gaten).
- **Gate-domme (B6, aktivitet = dom) — kontrakt-ændring 1 (mathias-9b 09-09 ~14:00):** ved
  wrapper-kald for et gate-verdikt sættes `STORK_V5_GATE_INPUT="<gate_id>:<gated-commit-40hex>:<artifact_path>"`
  i miljøet, fx `plan:<pinned commit>:plan-build/lokations-skabelon/plan.md`. Transport-kvitteringen
  bærer det som `gate_input`; `verdikt-byg` + `plan-gate-run` afviser en dom hvis gate/commit/artefakt
  ikke matcher. **Produktions-kørsler (B1 kill-list, B3 planner) må IKKE have `gate_input`.**
- **Aktørens leverance indeholder dommen — kontrakt-ændring 2 (REVIDERET 09-09 ~14:40; den fenced
  ` ```json verdikt-draft``` `-blok er AFSKAFFET — Markdown-parsning blev aldrig falsk-grøn-fri,
  Codex P2 runde 4-8):** Codex' `-o`-leverance ved plan-gaten skal have som SIDSTE ikke-tomme linje
  `VERDIKT-DRAFT: <base64 af JSON-draften>` — standard base64 MED padding; JSON = draft-objektet
  `{aktor:"codex", conclusion, negative_cases, claim_graph_refs?, evidence:[{path,line_span}]}`.
  Der må findes PRÆCIS én linje i hele filen der begynder med `VERDIKT-DRAFT:` — et citeret eksempel
  tæller også, så B6-prompten SKAL sige: »skriv aldrig strengen VERDIKT-DRAFT: andre steder end på
  den afsluttende linje«. Verdikt-byg-kaldet er uændret:
  `node scripts/v5/verdikt-byg.mjs - <gate> <gated_commit> <artifact_path> <$OUT.receipt.json> <$OUT>`
  (draft-arg `-` = udtræk fra leverancen; `raw_output_sha256` beregnes, erklæres ikke). Leverancen
  arkiveres som `provenance/verdikt-<aktør>-plan.leverance.md` ved siden af `.receipt.json`.
  Claude-aktører (code-reviewer · claude-ai) kører som før — selv-erklæret, deklareret residual.
- **Transport-kvitteringer arkiveres — kontrakt-ændring 3:** hver dom-kørsels `$OUT.receipt.json`
  committes byte-identisk som `plan-build/lokations-skabelon/provenance/<navn>.receipt.json` FØR gaten
  køres; `plan-gate-run` slår verdikternes `run.receipt_sha256` op dér — ingen kvittering = rød. Ligger
  sammen med prompt + provenance (A1-mønstret).
- **Devil-dom på fremlæggelsen er JSON — kontrakt-ændring 4 (B7):** devil-filen der bindes i
  `plan-kvittering.json` skal være JSON med mindst `{ "konklusion": "PASS", "fremlaeggelse_blob": "<oid af den dømte fremlæggelses-fil>" }`
  — kernen læser dommen fra blobben, ikke fra kvitteringens dom-felt. Devil-prompten beder om netop
  disse felter. **Devil-kørslen kører UDEN `STORK_V5_GATE_INPUT`** (dom over fremlæggelses-teksten,
  ikke gate-verdikt — bekræftet af mathias-9b 09-09 ~14:20); dens `$OUT.receipt.json` arkiveres
  alligevel som `provenance/plan-devil.receipt.json` (sporbarhed, ikke gate-krav). Receipt-navne for
  gate-verdikter: `provenance/verdikt-<aktør>-plan.receipt.json` (bekræftet).
- **`scripts/v5/binaries.lock.json`:** pinner codex-CLI'ens entry (version + sha256). Opdaterer
  preflight CLI'en, SKAL låsen opdateres i en commit FØR næste kald — wrapperen blokerer ellers.
  (Låsen er fabrik-mekanik; driveren melder til fabrik-armen hvis preflight opdaterer.)
- **Husky i worktree'et:** `pnpm install --frozen-lockfile --offline --ignore-scripts` og derefter
  `pnpm exec husky` (gjort 2026-09-10; `core.hooksPath=.husky/_` gælder pr. worktree, så shims skal
  skabes i hvert nyt worktree). Fabrik-armens `.prettierignore` dækker EFTER Trin A-pushet
  `plan-build/`, `scripts/v5/`, `docs/workflow-faerdiggoerelse/` — indtil da prettier-formaterer
  lint-staged plan-build-markdown ved commit herfra: rå aktør-output committes FØRST når den commit er
  pullet (byte-identitet).
- **B7-kvittering (gate-krav for plan- og slut-gaten; krav-gaten = historisk undtagelse M-38):**
  1. `plan-build/lokations-skabelon/plan-kvittering.json` skrives og COMMITTES FØR fremlæggelsen
     sendes til Mathias: `gate_id` · `pakke` · `artifact_oid` (plan v2-blob) · `bindings_oids`
     (krav · recon2 · p8 · ordbog · killlist) · `scope_digest` · `prerequisite_digests` (de 3
     plan-verdikters digests) · `fremlaeggelse {path, blob_oid}` · `devil {path, blob_oid, dom:"PASS"}`
     · `frosset` (ISO).
  2. `plan-approval.json` i en SENERE commit med `approval.kvittering_digest` = sha256 af
     kvitterings-filens committede bytes.
  3. Kernen (`scripts/v5/kvittering.mjs` + `plan-gate-run.mjs`) kræver: digest matcher ·
     kvitteringens commit er ægte forfader til approvalens commit · kvitteringen er uændret efter
     approval · fremlæggelses- og devil-blobs er de committede @ evidens-ref. **Enhver ændring efter
     kvittering → ny kvittering + ny fremlæggelse.** Deklareret residual: signeret kvittering fra
     betroet runner (CI actor-runner) — lokal drift hviler på commit-orden + fabrik-frys.

## Trinene

| #   | hvad                                                              | input (låst)                                                                                                                                                                           | aktør · aktivitet                                                                                                                                                                                                                                            | output (committet af driveren)                                                                                                                                                                                                                                                                                                                                              | færdig når                                                                                                                   |
| --- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| B1  | Codex' BLINDE kill-list-udkast                                    | krav 9402164d · recon2 2bdbb122 · bilag 6e569779 · P-8 4af07ef4 · ledger · ordbog @ 714f9b80 (før-plan) — **uden plan.md og alt plan-afledt** (recept: `b1-killlist-prompt-udkast.md`) | codex-angreb · produktion · blind workdir · **INGEN `STORK_V5_GATE_INPUT`**                                                                                                                                                                                  | `kill-list-udkast.md` byte-identisk + `provenance/kill-list-udkast.*` (prompt · provenance · slutbesked · receipt hvis skrevet) · drift-log                                                                                                                                                                                                                                 | committet + pushet FØR planneren ser den (commit-orden = blindheds-bevis)                                                    |
| B2  | Forventningsliste låses                                           | `forventningsliste-udkast.md` (5dac500) + Codex' måle-adapter-tjek (UT/FS/MH/SA udtrykkelige som reject-klasser; K-8 nul rækker = FS)                                                  | codex (dom) på adapter-spørgsmålet · read-only                                                                                                                                                                                                               | låst version (rename til `forventningsliste.md` eller status-linje LÅST + blob i køreplanen)                                                                                                                                                                                                                                                                                | én matrix · adapter-tjek PASS · blob noteret her                                                                             |
| B3  | Fold-ind → plan v2                                                | plan v1 423d9b20 · 46 fund (fund-log) · kill-list-udkast · låst forventningsliste · instruks `fold-ind-instruks-udkast.md` m. OID'er udfyldt                                           | planner-code (Claude) · produktion                                                                                                                                                                                                                           | `plan.md` v2 + `fold-ind-rapport-r2.md`; fund-log opdateret (hver af 46 → tilstand + rettelses-OID/bevis); ordbogs-entries for nye navne                                                                                                                                                                                                                                    | rapport: åbne = 0 · fund-log 46/46 med tilstand                                                                              |
| B4  | Delta + frit pas                                                  | plan v2-blob · fold-ind-rapport · berørte K/negativer/afhængigheder                                                                                                                    | codex-angreb (dom, delta + ét frit helheds-pas) ∥ fresh-eyes (frisk instans, plan v2) → derefter code-reviewer som frisk slutlæser                                                                                                                           | `plan-angreb-r2.md` · `plan-audit-fresh-eyes-r2.md` · fund-log (nye fund)                                                                                                                                                                                                                                                                                                   | rest = ∅, eller ÉN dokumenteret ekstra runde (batch → v3)                                                                    |
| B5  | Gate-bindinger                                                    | fabrik-armens `gates.mjs` + selftest + Codex-pas                                                                                                                                       | (fabrik-arm)                                                                                                                                                                                                                                                 | — (driveren pull'er)                                                                                                                                                                                                                                                                                                                                                        | suite grøn · bindinger = de fem filer @ pinned commit                                                                        |
| B6  | Plan-gate-verdikter                                               | plan v2 @ pinned commit · citat-scope ⊆ gated input · `STORK_V5_GATE_INPUT=plan:<commit>:plan-build/lokations-skabelon/plan.md` sat for HVER dom-kørsel                                | code-reviewer · codex · claude-ai (dom, read-only). Codex-prompten kræver at leverancens SIDSTE ikke-tomme linje er `VERDIKT-DRAFT: <base64 JSON>` og at strengen ikke forekommer andre steder; verdikt-byg m. draft-arg `-` + `$OUT.receipt.json` + `$OUT`  | `verdikt-code-plan.json` · `verdikt-codex-plan.json` · `verdikt-claude-ai-plan.json` + `provenance/<navn>.{prompt.txt,provenance.txt,receipt.json,leverance.md}` — receipts committet FØR `plan-gate-run.mjs`                                                                                                                                                               | tre PASS · `plan-gate-run.mjs` lokal dom åben (deklareret: lokal gate-beregning, ikke CI-autoritet) · ingen dom uden receipt |
| B7  | Fremlæggelse → devil → frys → kvittering → afsendelse → `plan ok` | plan v2 · verdikter · P-8 · ordbog · fund-log                                                                                                                                          | spørgsmåls-devil (Codex/frisk agent, blind for forfatteren; troskabs-akse P-3 + mekanisk troskabs-liste). Devil-output = **JSON** med mindst `{"konklusion":"PASS","fremlaeggelse_blob":"<oid af fremlaeggelse-plan.md>"}` — kernen læser dommen fra blobben | `fremlaeggelse-plan.md` (durabel fil, Mathias' sprog, ordbogens ord, alle åbne punkter i ÉN liste) · `plan-devil.json` REN (committet) · `plan-kvittering.json` (commit A, m. devil{path, blob_oid, dom:"PASS"} og fremlaeggelse{path, blob_oid}) · afsendelse via driver/mathias-df · Mathias' `plan ok` → ledger M-n · `plan-approval.json` (commit B, kvittering_digest) | approval bundet mod uændret kvittering · plan-SHA låst · efter plan ok ændres planen aldrig tavst                            |

## Regler der gælder hele vejen

- Al Codex-transport gennem wrapperen; dræb kun egne PID'er; rødt i suiten attribueres pr. kilde
  før det rapporteres; ingen push med rød suite; ingen »grøn« uden selv at have kørt
  `npm run -s v5:selftest`.
- Ét delta-batch pr. runde (princip 5): alle tjek på samme blob → én fold-ind → én re-bind → først
  derefter Mathias. Der bedes ALDRIG om `plan ok` mens et tjek er åbent.
- Mathias-vendte beskeder KUN gennem devil-passet og kun via driveren eller mathias-df; én samlet
  liste over åbne punkter pr. tur (kilde · eksisterende svar · materialitet), ét ord pr. gate.
- Hvert aktør-output arkiveres byte-identisk i SAMME arbejdsgang som det læses (A1-lærdommen), med
  prompt + provenance + `receipt.json` i `provenance/` — receipts FØR gaten køres (kontrakt-ændring 3).
- Dom-kørsler har `STORK_V5_GATE_INPUT` sat; produktions-kørsler har det IKKE. Tjek miljøet før
  hvert wrapper-kald.
- Zone-tjek (`node scripts/v5/pre-commit-zone.mjs`, rolle fabrik) kører mekanisk via husky i
  driverens worktree fra 2026-09-10; kør det alligevel manuelt mod staged før commit (shims er pr.
  worktree og findes ikke i et nyt).

## Status-log (SHA pr. trin)

- 2026-09-09 13:28: A1 arkivering f7f626d · ledger M-41 + fund-log 96ba5be.
- 2026-09-09 13:44: B2-udkast + B3-instruks-udkast 5dac500.
- 2026-09-09 13:50: køreplan v1 + B1-udkast fa420ba. ~14:00: kontrakt-ændringer 1-4 fra fabrik-armen
  indarbejdet (gate_input · verdikt-draft-blok · receipt-arkivering · devil-JSON) + binaries.lock;
  Trin A stadig ikke færdig (transport v4 bygget, Codex-runde 3 kører).
- 2026-09-09 ~14:40: kontrakt-ændring 2 REVIDERET (fenced blok afskaffet → `VERDIKT-DRAFT:`-linje
  m. base64, præcis én forekomst). Trin A: 15 commits lokalt hos fabrik-armen, runde 9-pas; registret
  grønt når Codex siger PASS og Mathias har givet sit ord om den lokale residual.
- 2026-09-10 09:3x-10:1x: forrige driver (session d2883eb4) død med maskinen natten 09→10/9 @ 5eb3736
  (ingen aktør kørte, intet u-arkiveret tabt). Ny driver (session de4474) genforankret via
  OVERDRAGELSE-driver-v2, bindinger kvitteret til mathias-9b, husky aktiveret i worktree'et, B1-recept
  tørkørt @ 5eb3736 (6 blobs OK · grep = kun ledgerens OID-reference i M-41), suite grøn @ 5eb3736
  (register 12/12 pas-bundne). Trin A IKKE færdig: wrapper @ 5eb3736 = v2-signatur ·
  `binaries.lock.json` mangler · plan DEL VIII pkt. 35-36 ikke på origin. Aktør-stop holdes. SHA =
  denne commit.
- 2026-09-10 09:54: **Trin A færdig (mekanik) — fd443c4** (mathias-9b: Codex P2 runde 9 PASS · register
  14/14 grønt @ regel-commit 8a5755f · suite grøn). Aktør-stop OPHÆVET for B1-B5; **B6/B7 venter på
  Mathias' ord om residualen (DEL VIII pkt. 36)**. Driver-commit rebaset på fd443c4 → a66d1eb (suite
  grøn @ a66d1eb, kørt selv). B1-tjekliste grøn på nær preflight: codex-cli 0.153.0 installeret,
  npm nyeste 0.154.0 → »opdater før spawn« (2.F); `binaries.lock.json` pinner 0.153.0 → CLI +
  lås-commit er fabrik-armens; meldt 10:0x, B1/B2-Codex holdes til svar (opdatering eller
  deklareret afvig). SHA = denne commit.
- 2026-09-10 10:05-10:18: preflight løst (a): fabrik-armen opdaterede codex-cli → 0.154.0 + `binaries.lock`
  i 6e8ea9e (fund: shim byte-identisk på tværs af versioner → native pin fra runde 10). Recept-udvidelse
  fe24947 (analyser-mappen fjernes fra blind workdir). **B1 spawnet 10:14:53 @ PIN fe24947** (run_id
  20260910T101453-1257166-23934, produktion, workspace-write — kørte m. netværk TIL, afvig noteret) ·
  **B2 adapter-dom spawnet 10:18:27 @ PIN c843eb0** (run_id 20260910T101827-1260310-4098, dom,
  read-only, gate_input null). B5 bekræftet leveret af fabrik-armen @ fd443c4.
- 2026-09-10 10:26-10:35: **B2 dom modtaget:** »KAN IKKE — adapter-krav-liste følger« → arkiveret
  `provenance/b2-adapter-tjek.*` (leverance-blob 460a9b26), bogført som adapter-krav-liste modtaget
  (C1-input), IKKE PASS (sekvens afgjort m. mathias-9b: PASS = ny dom mod integreret adapter i Trin C).
  Frit pas: manifest m. stabile ID'er mangler (C1-kontrakt, §5 pkt. 6). **Forventningsliste LÅST —
  blob `2200b76e`** (ændringer mod dømt 090a5ed9: status-blok · K-6 ac 5 +UT · §5). SHA = denne commit.
- 2026-09-10 10:37-10:45: **B1 FÆRDIG** (success, attempt 1, 1372 s): `kill-list-udkast.md` blob
  `13b78392` (92 795 B; 82 targeted kandidater · 5 schema-kontroller · 2 to-sessions · 20 skal-leveres;
  ingen HALT; alle bindinger matcher) + `provenance/kill-list-udkast.*` + README (afvig: netværk TIL i
  produktions-sandboxen, A5). Committet + pushet FØR B3 (commit-orden = blindheds-bevis). SHA = denne
  commit. Næste: B3 planner-code via `claude -p` efter fold-ind-instruksens kørselsrecept.
- Trin A færdig (mekanik): fd443c4 (mathias-9b, 10/9 09:54) · Mathias' residual-ord (B6/B7): <afventer>.
- B1: kill-list-blob 13b78392 @ denne commit · B2 låst: 2200b76e (adapter-krav-liste 460a9b26; adapter-PASS først i Trin C) · B3: <SHA> · B4: <SHA> · B5: fd443c4 (leveret af fabrik-armen) · B6: <SHA> · B7 kvittering: <SHA> · plan ok: M-<n> · approval: <SHA>.
