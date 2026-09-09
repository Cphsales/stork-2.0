# Trin B — driverens køreplan (lokations-skabelon, Fase 3 runde 2 → `plan ok`)

Driver: driver-10b (worktree `.claude/worktrees/driver-10b`, pusher ff til
`claude/workflow-implementeringsplan`). Kilde: GRUNDPLAN-v2 Trin B (Mathias' ok M-41) + fabrik-armens
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
- **Aktørens leverance indeholder dommen — kontrakt-ændring 2:** Codex' `-o`-leverance ved plan-gaten
  skal indeholde PRÆCIS én fenced blok ` ```json verdikt-draft … ``` ` med draft-objektet
  `{aktor:"codex", conclusion, negative_cases, claim_graph_refs?, evidence:[{path,line_span}]}`.
  Verdikt-byg kaldes: `node scripts/v5/verdikt-byg.mjs - <gate> <gated_commit> <artifact_path> <$OUT.receipt.json> <$OUT>`
  (draft-arg `-` = udtræk fra leverancen; `raw_output_sha256` beregnes, erklæres ikke). Skrives ind i
  B6-prompten til Codex. Claude-aktører (code-reviewer · claude-ai) kører som før — selv-erklæret,
  deklareret residual.
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
- **Husky i worktree'et (efter fabrik-push):** `pnpm install --frozen-lockfile --offline --ignore-scripts`
  + `pnpm exec husky`; `.prettierignore` dækker derefter `plan-build/`, `scripts/v5/`,
  `docs/workflow-faerdiggoerelse/`.
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

| # | hvad | input (låst) | aktør · aktivitet | output (committet af driveren) | færdig når |
| --- | --- | --- | --- | --- | --- |
| B1 | Codex' BLINDE kill-list-udkast | krav 9402164d · recon2 2bdbb122 · bilag 6e569779 · P-8 4af07ef4 · ledger · ordbog @ 714f9b80 (før-plan) — **uden plan.md og alt plan-afledt** (recept: `b1-killlist-prompt-udkast.md`) | codex-angreb · produktion · blind workdir · **INGEN `STORK_V5_GATE_INPUT`** | `kill-list-udkast.md` byte-identisk + `provenance/kill-list-udkast.*` (prompt · provenance · slutbesked · receipt hvis skrevet) · drift-log | committet + pushet FØR planneren ser den (commit-orden = blindheds-bevis) |
| B2 | Forventningsliste låses | `forventningsliste-udkast.md` (5dac500) + Codex' måle-adapter-tjek (UT/FS/MH/SA udtrykkelige som reject-klasser; K-8 nul rækker = FS) | codex (dom) på adapter-spørgsmålet · read-only | låst version (rename til `forventningsliste.md` eller status-linje LÅST + blob i køreplanen) | én matrix · adapter-tjek PASS · blob noteret her |
| B3 | Fold-ind → plan v2 | plan v1 423d9b20 · 46 fund (fund-log) · kill-list-udkast · låst forventningsliste · instruks `fold-ind-instruks-udkast.md` m. OID'er udfyldt | planner-code (Claude) · produktion | `plan.md` v2 + `fold-ind-rapport-r2.md`; fund-log opdateret (hver af 46 → tilstand + rettelses-OID/bevis); ordbogs-entries for nye navne | rapport: åbne = 0 · fund-log 46/46 med tilstand |
| B4 | Delta + frit pas | plan v2-blob · fold-ind-rapport · berørte K/negativer/afhængigheder | codex-angreb (dom, delta + ét frit helheds-pas) ∥ fresh-eyes (frisk instans, plan v2) → derefter code-reviewer som frisk slutlæser | `plan-angreb-r2.md` · `plan-audit-fresh-eyes-r2.md` · fund-log (nye fund) | rest = ∅, eller ÉN dokumenteret ekstra runde (batch → v3) |
| B5 | Gate-bindinger | fabrik-armens `gates.mjs` + selftest + Codex-pas | (fabrik-arm) | — (driveren pull'er) | suite grøn · bindinger = de fem filer @ pinned commit |
| B6 | Plan-gate-verdikter | plan v2 @ pinned commit · citat-scope ⊆ gated input · `STORK_V5_GATE_INPUT=plan:<commit>:plan-build/lokations-skabelon/plan.md` sat for HVER dom-kørsel | code-reviewer · codex · claude-ai (dom, read-only). Codex-prompten kræver PRÆCIS én ` ```json verdikt-draft ``` `-blok i leverancen; verdikt-byg m. draft-arg `-` + `$OUT.receipt.json` + `$OUT` | `verdikt-code-plan.json` · `verdikt-codex-plan.json` · `verdikt-claude-ai-plan.json` + `provenance/<navn>.{prompt,provenance,receipt.json}` — receipts committet FØR `plan-gate-run.mjs` | tre PASS · `plan-gate-run.mjs` lokal dom åben (deklareret: lokal gate-beregning, ikke CI-autoritet) · ingen dom uden receipt |
| B7 | Fremlæggelse → devil → frys → kvittering → afsendelse → `plan ok` | plan v2 · verdikter · P-8 · ordbog · fund-log | spørgsmåls-devil (Codex/frisk agent, blind for forfatteren; troskabs-akse P-3 + mekanisk troskabs-liste). Devil-output = **JSON** med mindst `{"konklusion":"PASS","fremlaeggelse_blob":"<oid af fremlaeggelse-plan.md>"}` — kernen læser dommen fra blobben | `fremlaeggelse-plan.md` (durabel fil, Mathias' sprog, ordbogens ord, alle åbne punkter i ÉN liste) · `plan-devil.json` REN (committet) · `plan-kvittering.json` (commit A, m. devil{path, blob_oid, dom:"PASS"} og fremlaeggelse{path, blob_oid}) · afsendelse via driver/mathias-df · Mathias' `plan ok` → ledger M-n · `plan-approval.json` (commit B, kvittering_digest) | approval bundet mod uændret kvittering · plan-SHA låst · efter plan ok ændres planen aldrig tavst |

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
- Zone-tjek (`node scripts/v5/pre-commit-zone.mjs`, rolle fabrik) før hver commit indtil
  husky-shims kører mekanisk i worktree'et.

## Status-log (SHA pr. trin)

- 2026-09-09 13:28: A1 arkivering f7f626d · ledger M-41 + fund-log 96ba5be.
- 2026-09-09 13:44: B2-udkast + B3-instruks-udkast 5dac500.
- 2026-09-09 13:50: køreplan v1 + B1-udkast fa420ba. ~14:00: kontrakt-ændringer 1-4 fra fabrik-armen
  indarbejdet (gate_input · verdikt-draft-blok · receipt-arkivering · devil-JSON) + binaries.lock;
  Trin A stadig ikke færdig (transport v4 bygget, Codex-runde 3 kører).
- Trin A færdig: <afventer mathias-9b — SHA>.
- B1: <SHA> · B2 låst: <blob> · B3: <SHA> · B4: <SHA> · B5: <SHA> · B6: <SHA> · B7 kvittering: <SHA> · plan ok: M-<n> · approval: <SHA>.
