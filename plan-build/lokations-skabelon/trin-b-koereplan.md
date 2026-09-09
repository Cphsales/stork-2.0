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
| B1 | Codex' BLINDE kill-list-udkast | krav 9402164d · recon2 2bdbb122 · bilag 6e569779 · P-8 4af07ef4 · ledger · ordbog @ 714f9b80 (før-plan) — **uden plan.md og alt plan-afledt** (recept: `b1-killlist-prompt-udkast.md`) | codex-angreb · produktion · blind workdir | `kill-list-udkast.md` byte-identisk + `provenance/kill-list-udkast.*` · drift-log | committet + pushet FØR planneren ser den (commit-orden = blindheds-bevis) |
| B2 | Forventningsliste låses | `forventningsliste-udkast.md` (5dac500) + Codex' måle-adapter-tjek (UT/FS/MH/SA udtrykkelige som reject-klasser; K-8 nul rækker = FS) | codex (dom) på adapter-spørgsmålet · read-only | låst version (rename til `forventningsliste.md` eller status-linje LÅST + blob i køreplanen) | én matrix · adapter-tjek PASS · blob noteret her |
| B3 | Fold-ind → plan v2 | plan v1 423d9b20 · 46 fund (fund-log) · kill-list-udkast · låst forventningsliste · instruks `fold-ind-instruks-udkast.md` m. OID'er udfyldt | planner-code (Claude) · produktion | `plan.md` v2 + `fold-ind-rapport-r2.md`; fund-log opdateret (hver af 46 → tilstand + rettelses-OID/bevis); ordbogs-entries for nye navne | rapport: åbne = 0 · fund-log 46/46 med tilstand |
| B4 | Delta + frit pas | plan v2-blob · fold-ind-rapport · berørte K/negativer/afhængigheder | codex-angreb (dom, delta + ét frit helheds-pas) ∥ fresh-eyes (frisk instans, plan v2) → derefter code-reviewer som frisk slutlæser | `plan-angreb-r2.md` · `plan-audit-fresh-eyes-r2.md` · fund-log (nye fund) | rest = ∅, eller ÉN dokumenteret ekstra runde (batch → v3) |
| B5 | Gate-bindinger | fabrik-armens `gates.mjs` + selftest + Codex-pas | (fabrik-arm) | — (driveren pull'er) | suite grøn · bindinger = de fem filer @ pinned commit |
| B6 | Plan-gate-verdikter | plan v2 @ pinned commit · `verdikt-byg.mjs` auto-pakning · citat-scope ⊆ gated input | code-reviewer · codex · claude-ai (dom, read-only) | `verdikt-code-plan.json` · `verdikt-codex-plan.json` · `verdikt-claude-ai-plan.json` (+ provenance) | tre PASS · `plan-gate-run.mjs` lokal dom åben (deklareret: lokal gate-beregning, ikke CI-autoritet) |
| B7 | Fremlæggelse → devil → frys → kvittering → afsendelse → `plan ok` | plan v2 · verdikter · P-8 · ordbog · fund-log | spørgsmåls-devil (Codex/frisk agent, blind for forfatteren; troskabs-akse P-3 + mekanisk troskabs-liste) | `fremlaeggelse-plan.md` (durabel fil, Mathias' sprog, ordbogens ord, alle åbne punkter i ÉN liste) · devil-output REN · `plan-kvittering.json` (commit A) · afsendelse via driver/mathias-df · Mathias' `plan ok` → ledger M-n · `plan-approval.json` (commit B, kvittering_digest) | approval bundet mod uændret kvittering · plan-SHA låst · efter plan ok ændres planen aldrig tavst |

## Regler der gælder hele vejen

- Al Codex-transport gennem wrapperen; dræb kun egne PID'er; rødt i suiten attribueres pr. kilde
  før det rapporteres; ingen push med rød suite; ingen »grøn« uden selv at have kørt
  `npm run -s v5:selftest`.
- Ét delta-batch pr. runde (princip 5): alle tjek på samme blob → én fold-ind → én re-bind → først
  derefter Mathias. Der bedes ALDRIG om `plan ok` mens et tjek er åbent.
- Mathias-vendte beskeder KUN gennem devil-passet og kun via driveren eller mathias-df; én samlet
  liste over åbne punkter pr. tur (kilde · eksisterende svar · materialitet), ét ord pr. gate.
- Hvert aktør-output arkiveres byte-identisk i SAMME arbejdsgang som det læses (A1-lærdommen), med
  prompt + provenance i `provenance/`.
- Zone-tjek (`node scripts/v5/pre-commit-zone.mjs`, rolle fabrik) før hver commit indtil
  husky-shims kører mekanisk i worktree'et.

## Status-log (SHA pr. trin)

- 2026-09-09 13:28: A1 arkivering f7f626d · ledger M-41 + fund-log 96ba5be.
- 2026-09-09 13:44: B2-udkast + B3-instruks-udkast 5dac500.
- Trin A færdig: <afventer mathias-9b — SHA>.
- B1: <SHA> · B2 låst: <blob> · B3: <SHA> · B4: <SHA> · B5: <SHA> · B6: <SHA> · B7 kvittering: <SHA> · plan ok: M-<n> · approval: <SHA>.
