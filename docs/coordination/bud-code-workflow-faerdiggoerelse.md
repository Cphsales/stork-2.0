# Bud (Code) — workflow-færdiggørelse

**Type:** Konkurrence-bud fra Code — MIT eget bud, ikke en konsensus · **Version:** v2 (forbedret via 8-kilde felt-syntese; ændrings-log §11)
**Dato:** 2026-06-16 · **Forfatter:** Code (`stork-code-bot`) · **Status:** BUD til Mathias-afgørelse
**Grundlag:** kontrakt `workflow-faerdiggoerelse-krav-og-data.md` + begge recons (`7f2dfae`/`f423d6b`) + syntese af 8 felt-kilder (§10).
**Formål-ramme:** dette er FUNDAMENTET hver fremtidig Stork 2.0-build skal køre igennem. Målestok: bærer det build efter build uden at knække? Et svagt led svækker hver fremtidig build.
**Framing:** IKKE en afpudsning af V5/kæden. Det nuværende er kun inspiration.
**Codex-afgrænsning:** Codex' eget udstyr reciteres ikke; hans side er kun på rolle-niveau.
**Belæg:** hvert "BRUGT/DÆKKET" peger på et sted i buddet; hver afgørende opsætning i §8 er terminal-testet (rå output).

## Det svageste led — og hvad v2 retter

Feltets klareste praktiker-fund: **verifikations-leddet er det der knækker** (pablonax-kommentar: _"that check step is where these workflows usually fall apart"_). Mit v1's svageste led var præcis dér: jeg havde **fravalgt cross-review-loopet** — den teknik alle fire givne artikler kalder "værdi over summen af delene" — på en fejlslutning ("blander generator og verifikator"). Loopet kører på en **committet PR i separat kontekst** = uafhængigt. v2 adopterer det og gør verifikation **evidens-gated** (§4, §8G–8H). Det er den vigtigste ændring.

## Kernetese — fem skift fra "i dag"

1. **Specen er eksekverbar, ikke prosa.** Krav får ID'er + acceptkriterier; _dækning_ er mekanisk fail-closed (§8E testet), _mening_ forbliver dømmekraft.
2. **Verifikation er den knappe ressource — og det led der knækker.** Derfor en **tragt** med billig adversariel filtrering før dyre verifikatorer, hvor selve verifikationen er **evidens-gated** og bygger på et **cross-model review-loop** (byg → uafhængig anden-model-review på committet PR → ret → iterér til grøn). Felt-bekræftet at fange prod-bugs.
3. **Git + hændelser ER tilstandsmaskinen** — ikke en bespoke daemon. Immutabelt, author-verificeret spor (§8B testet).
4. **Mathias ser kun what-forks** — destillation som system-invariant.
5. **Indsats rutes efter pakke-størrelse** (scale-determination, §8F testet) — fundamentet kører ikke tungvægts-kæden på en lille pakke.

Tværgående: konkurrence er **generator** ved forks, aldrig afgører (§8I); ankret + reglerne skrives kun af mennesker (§7); og **én regel-sandhed mirrores til begge motorers container** (§6, §8H testet).

---

## 1) STRUKTUR — step for step (verifikations-tragt, rutet efter størrelse)

| Step                                                                                  | Hvad                                                                                                         | Transport (auto)                                                                      | Dømmekraft (aktør)                                                                                                             |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **0. Åbning**                                                                         | Mathias åbner pakken (forretnings-sprog)                                                                     | Hændelse vækker recon headless                                                        | Mathias: hvad-niveau                                                                                                           |
| **0.5 Scale-determination**                                                           | Mål pakkens størrelse → rutér indsats (DIRECT 1-2 filer / WORKFLOW 3-5 / DELEGATED 6+)                       | Mekanisk fil-/scope-tælling → mode (§8F)                                              | — (mekanisk; stor pakke → split-forslag)                                                                                       |
| **1. Bred recon (parallel, isoleret)**                                                | Code+Codex+Claude.ai, hver i eget worktree                                                                   | Lås hver via commit                                                                   | Uafhængige fund — divergens er signal                                                                                          |
| **2. Spec-forfatning** ← **GATE 1 "krav OK \<hash\>"**                                | Claude.ai skriver eksekverbar spec (krav-ID+accept)                                                          | Spec-lint                                                                             | **Mathias:** kravene = hans hvad                                                                                               |
| **3. Konkurrerende planer**                                                           | Code+Codex, hver en plan-kandidat der mapper krav-ID → plan-item → test                                      | **Dæknings-gate**: umappet ID = FAIL (§8E)                                            | Hver plan bærer to modsvar pr. afgørende valg                                                                                  |
| **4. Adversariel verifikation + cross-review-loop → 4-aktør** ← **GATE 2 (betinget)** | Multi-lens refutering; **byg→anden-model-review på committet PR→ret→iterér til grøn**; evidens-gated handoff | Saml evidens-bærende verdikter; destillér til what-forks; fund-gate kun hvis Mathias' | **Codex:** uafhængig kode-review · **Claude.ai:** krav-_mening_-PASS · **Code:** forsvar/fix · **Mathias:** kun ægte what-valg |
| **5. Build (batches, isoleret)**                                                      | Code bygger; per batch: PR → uafhængig cross-review → fix → iterér til grøn                                  | Hooks(før)+selvtjek(frys)+CI(push) fail-closed; **token-budget-guardrail** (§8J)      | Codex per-batch; Code teknik                                                                                                   |
| **6. Luk** ← **GATE 3 "slut OK"**                                                     | Slut-rapport; spec-dækning grøn; repo-renhed                                                                 | Merge→main = sporet; slette-plan                                                      | Claude.ai: slut-review · **Mathias:** slut OK                                                                                  |

**Vinderen mellem konkurrerende planer afgøres af verifikation mod spec** (dæknings-gate grøn + cross-review grøn + evidens) — aldrig af hvilken plan der er mest overbevisende.

---

## 2) KOBLING — tråden + evidens gør kæden stærk

- **Krav-ID'et er tråden:** spec-ID → plan-item → test → slut-evidens; brud mekanisk synligt ved hvert led (§8E).
- **Git er samlingspunktet:** hand-off = commit/PR; forudsætning mellem led = required check (fail-closed).
- **Evidens-gated handoff (FELT):** hver leverance mellem led skal bære evidens (test grøn, commit-hash, review-verdikt); **handoff uden evidens afvises** (§8G testet) → tavse fejl stoppes ved kilden, ikke til sidst.
- **Konflikt-eksplicit (FELT):** modstridende verifikations-resultater **averages/votes ikke** — de skrives i et integrations-artefakt og flages "verifikation mangler" til afgørelse. Det er det led feltet siger knækker; her gør vi det synligt frem for at gætte.
- **Isolation + lås gør parallelt arbejde sikkert:** eget worktree pr. aktør (clobber-bevist i denne pakke, §8B); "aldrig to agenter på samme fil samtidig" (FELT).

---

## 3) AUTOMATISERING — transport vs. dømmekraft; fejl fanges undervejs

| Automatiseres (transport + _dækning_)                  | Automatiseres ALDRIG (_mening_ + dømmekraft)     |
| ------------------------------------------------------ | ------------------------------------------------ |
| Flyt/lås artefakter (commit/PR)                        | Er kravet det rigtige? (Mathias' hvad)           |
| Spec-lint + krav-ID-dæknings-gate (§8E)                | Er kravet rigtigt _forstået_? (krav-mening)      |
| **Evidens-gate på handoffs (§8G)**                     | Kode-review-verdikt (cross-model)                |
| Hooks/CI/required checks (fail-closed)                 | Plan-design + de to modsvar                      |
| **Scale-routing (§8F) + token-budget-guardrail (§8J)** | Konflikt-afgørelse mellem modstridende verdikter |
| Væk aktører på hændelse; handoff-log                   | "Vinder"-valg = verifikation, ikke transport     |

**Grænsen:** _dækning_ (mekanisk: er hvert krav adresseret, bærer hver handoff evidens?) automatiseres; _mening_ (er det rigtigt?) forbliver aktør-dømmekraft.

**Fejl fanges i fire lag undervejs:** (1) hook FØR handling (§8A testet) · (2) selvtjek + **evidens-gate** ved frys (§8G) · (3) CI/dæknings-gate ved push (§8A+§8E) · (4) **uafhængig cross-model-review på committet PR, iterér til grøn** (§4). Fail-closed på divergens/ukendt/åben-gate/stale/**budget-overskridelse** (§8J).

**Runaway-guardrail (FELT):** hård `--max-budget-usd` (testet present) + turn/batch-loft pr. session — automatik der løber løbsk stoppes mekanisk, ikke ved manuel opmærksomhed. Felt-advarsel: dynamiske workflows koster meget mere end en normal session.

---

## 4) KONTROLPOSTER — Mathias ser kun what-forks; verifikation der ikke selv knækker

**Tre author-verificerede gates (kun mgrubak):** GATE 1 "krav OK \<hash\>" · GATE 2 betinget fund-gate · GATE 3 "slut OK".

**Verifikations-mekanikken (det svageste led, hærdet via FELT):**

- **Cross-model review-loop:** byg → en ANDEN aktør/model reviewer den **committede PR** (separat kontekst = uafhængigt) → fix → iterér til grøn. Felt-bekræftet at fange prod-bugs ("would have been brought to production if it weren't for the review").
- **Evidens-gate:** ingen verdikt/handoff uden evidens (§8G) — verifikation kan ikke "passere tomt".
- **Konflikt-eksplicit:** modstridende verdikter flages, averages ikke.

**Hvad holder Mathias ude af det mekaniske:** hvert lag destillerer til ægte hvad-valg i forretnings-sprog; aldrig hvordan-spørgsmål; gaten er ordet, ikke klikket; kan et lag ikke reducere til et hvad-valg er det en bug i tragten.

**Fire-aktør-godkendelse ved tre led:** krav (Mathias hvad + Claude.ai spec-typist + Code/Codex recon) · plan (Codex APPROVAL + Claude.ai krav-mening-PASS + Code forsvar + Mathias kun hans-fund) · slut (Code rapport + Claude.ai review + Codex + Mathias slut OK).

---

## 5) ROLLE-OPSÆTNING — generator vs. verifikator; aldrig selv-verificér; kontekst-separation

**To rolle-typer pr. AI** (skift via `--agents`/`--agent`, `--permission-mode`, skills):

| Aktør         | WORKFLOW-rolle (headless, kontrakt-output)             | ALMINDELIG rolle (interaktiv) |
| ------------- | ------------------------------------------------------ | ----------------------------- |
| **Claude.ai** | spec-typist, krav-mening-PASS, slut-review, gate-pakke | Mathias-dialog, sparring      |
| **Code**      | scriptet build/transport, struktureret status          | interaktiv fejlsøgning        |
| **Codex**     | uafhængig read-only review-verdikt (kontrakt)          | kode-recon-sparring           |

**Strukturel uafhængighed (hård invariant):** den der _genererer_, _verificerer_ aldrig selv. Builder ≠ cross-reviewer; reviewet sker på en committet PR i separat kontekst. Det er det der gør "aktørerne løfter hinanden" til en garanti.

**Model-til-rolle er konfigurerbar, ikke hardkodet (FELT-modsigelse afgjort):** kilderne er uenige om hvilken model der "udforsker" vs. "eksekverer", og det er version-afhængigt. Derfor fastlåser jeg kun FUNKTIONERNE (byg, uafhængig review) — hvilken model/aktør der bærer dem er en konfig, ikke en lås. (Respekterer Codex-afgrænsning.)

**Kontekst-separation som arkitektur (FELT):** intet led/agent akkumulerer hele konteksten — arbejdet deles i friske-kontekst-led, kun resumé+evidens returnerer. "No single agent ever hits the context ceiling." Det hærder build/verify mod kontekst-degradering.

**Kræfter hvor mest værdi:** dyr dømmekraft på kapabel model/effort; mekanik billigt. **Max 3-5 parallelle spor** — verifikation er flaskehalsen.

---

## 6) DOKUMENT-OPSÆTNING

**Én sandhed:** eksekverbar spec pr. pakke; vision+forretning er LÅST anker. Idé-docs MÅ modsige (kandidater, adskilt mappe).

**Én regel-sandhed mirrored til begge motorer (FELT, §8H testet):** reglerne skrives ÉN gang (menneske-forfattet) og mirrores til begge containere — `CLAUDE.md` ≡ `AGENTS.md` via symlink (én fil, to navne → kan ikke divergere). Det holder begge agenter på præcis samme regler **uden** en dublet at synkronisere. (Ingen modsigelse med "én sandhed": symlink er ikke en kopi.)

**Ankret + reglerne skrives kun af mennesker** (§7): AI udkaster forslag til menneske-godkendelse, aldrig auto-forfatte/-opdatere.

```
docs/
  strategi/      ← vision + forretning (LÅST anker, kun menneske-forfattet)
  workflow/      ← rolle-instrukser, regelbog, gate-defs, spec-skema (kører kæden)
  coordination/  ← eksekverbar spec + plan + status pr. aktiv pakke
    arkiv/       ← lukkede pakke-artefakter
  reference/     ← kataloger, teknik, historik, idé-docs (må modsige)
```

**Ingen dubletter:** owns-register + `governance-check` håndhæver mekanisk (§8A testet). **Slette-plan (kandidater, ved luk):** recon/bud-filer → arkiv; `claude-code-egenskaber.md` → arkiv; idé-/gov-tråde → foldes ind eller arkiv.

---

## 7) FRAVALG (velbegrundet — inkl. ét korrigeret v1-fravalg)

- **Cross-review-loop** — **TIDLIGERE FRAVALGT, NU ADOPTERET (§4).** v1-grunden ("blander generator/verifikator") holder ikke: loopet kører på en _committet PR i separat kontekst_ = netop uafhængigt. Alle fire givne kilder + felt-evidens (fanger prod-bugs) → adopteret som verifikations-kernen.
- **MCP-bridge som gate** (Codex som MCP-server kaldt in-session) — FRAVALGT: det kobler kontekster og undergraver uafhængigheden cross-review-loopet hviler på. Committet-PR-handoff foretrækkes (immutabelt + uafhængigt). (Kan bruges til _uformel_ sparring, ikke til gaten.)
- **Hardkodet model-til-rolle** — FRAVALGT: kilderne modsiger hinanden + version-afhængigt; kun funktionerne låses (§5).
- **Prosa-spec læst af et menneske** — FRAVALGT: skalerer ikke, misser udeladelser (§8E fanger dem).
- **Poll-kurér/daemon som primær drift** — FRAVALGT: e2e ubevist (gov-5/begge recons); git+hændelser enklere/immutabelt. Daemon = fallback.
- **Én reviewer pr. fund / averaging af modstridende verdikter** — FRAVALGT: multi-lens + konflikt-eksplicit fanger "plausibelt-men-forkert" (felt: check-step knækker ellers).
- **AI-forfattet/auto-opdateret anker + regler** — FRAVALGT: felt-evidens, AI-genereret kontekst kan _sænke_ succes (~3%).
- **Delt arbejdstræ som kanal** — FRAVALGT: clobber-bevist (§8B). **Cowork/desktop/cloud som gate** — FRAVALGT: author-verifikation kan ikke flyttes til lokal fil.
- **Bredt fan-out (>5)** — FRAVALGT: verifikation er flaskehalsen. **`/goal` som gate** — FRAVALGT: evaluator kan ikke kalde værktøjer.

---

## 8) MODSVAR — afgørende opsætninger, TESTEDE mod alternativer

### 8A — Enforcement: hook(før)+CI(efter) · vs. prosa · vs. CI-only

Testet: hook hård-blokerede (`exit 2`, kørte aldrig); `governance-check` 6 checks `alle passed`, exit 0. Prosa fanger intet; CI-only fanger først efter push. Lagdeling slår begge.

### 8B — Tilstand/kanal: git commit/PR · vs. delt-FS · vs. daemon

Testet: `git show 7f2dfae` → author + immutabel hash; untracked → overskrevet `v2`, ingen author (min recon blev faktisk overskrevet → PR #160-lås); `stork-kaede` → `inactive`. Kun git giver immutabelt author-spor.

### 8C — Workflow-rolle-output: custom-agent-kontrakt · vs. prosa · vs. manuel session

Testet: `--agents`-agent → `{"verdikt":"PASS"}`, `jq` parser; generalist → `Ja. 2+2=4 holder.`, `jq` parse error. Manuel session ikke headless-deterministisk.

### 8D — Drift: hændelses-drevet · vs. daemon · vs. cloud

Testet: background-task → `<task-notification>`; Monitor → 3 per-event-notifikationer. Daemon `inactive`/e2e-ubevist; cloud mister lokal working-copy.

### 8E — Eksekverbar spec: mekanisk krav-ID-dæknings-gate · vs. prosa-læsning · vs. intet krav

Testet: spec `K1/K2/K3`, plan kun `K1/K2` → `✗ K3 UMAPPET — GATE BLOKERER`; tilføj `K3` → `GATE GRØN`. Prosa-læsning misser udeladelser; intet krav = hensigt, ikke gate.

### 8F — Scale-determination: rutér indsats efter størrelse · vs. fast tungvægts-kæde · vs. ingen routing (NY)

- **Testet:** `1 fil → DIRECT (let sti)` · `4 → WORKFLOW` · `9 → DELEGATED (fuld kæde + parallel)`.
- **Modsvar 1 (fast tungvægt):** kører hele kæden på en typo → spild + unødig fejlflade. **Modsvar 2 (ingen routing):** stor pakke får for lidt struktur → knækker. FELT (shinpr, pablonax): "small tasks stay small, large tasks leave evidence". Styrker OPENING-leddet + effektivitet.

### 8G — Evidens-gate på handoffs · vs. tillid · vs. averaging (NY)

- **Testet:** handoff uden `Evidens:` → `AFVIST (tavs fejl stoppet)`; med evidens → `ACCEPT`.
- **Modsvar 1 (tillid):** handoff uden bevis propagerer en tavs fejl. **Modsvar 2 (averaging af modstridende):** skjuler konflikten. FELT (pablonax: "if a handoff has no evidence, it gets rejected"; check-step er hvor workflows knækker). Styrker VERIFIKATIONS-leddet — buddets svageste.

### 8H — Én regel-sandhed mirrored: symlink · vs. to håndholdte kopier · vs. én motor kun (NY)

- **Testet:** `ln -sf AGENTS.md CLAUDE.md` → `diff: IDENTISK` (én fil, kan ikke divergere).
- **Modsvar 1 (to kopier):** divergerer over tid → agenterne kører på forskellige regler. **Modsvar 2 (kun én motor):** taber cross-model-uafhængigheden (§4). FELT (4 kilder: "the part that actually matters didn't need a single edit"). Styrker RULES/spec-leddet + cross-review-uafhængigheden.

### 8I — Konkurrence: generator JA · afgører NEJ

Generator (Step 1+3) bryder første-løsning-svagheden (kontraktens to-modsvar + felt debate). Afgører NEJ: belønner det overbevisende. Verifikation mod spec (8A–8H) afgør.

### 8J — Runaway-guardrail: hård budget · vs. manuel opmærksomhed (NY)

- **Testet:** `claude --help` → `--max-budget-usd <amount>` findes i vores binær.
- **Modsvar (manuel):** FELT siger budget-bekræftelse er manuel og dynamiske workflows koster meget mere — manuel opmærksomhed knækker i lange autonome kørsler. Hård budget + turn/batch-loft som fail-closed-betingelse. Styrker DRIFT-leddet + friskhed.

---

## 9) Idé-listen vejet — feltet lukket (ingen tavs kandidat)

Hver kandidat fra krav-dokkets idé-liste, begge sektioner, med verificerbart anker. (Krydstjekket mod buddet; mismatch → mærket rettet, ikke buddet.)

**Claude Code-egenskaber:**

- **Hooks** — BRUGT: §3 lag (1) + §8A (testet). Metode: deterministisk spærring.
- **/goal** — FRAVALGT: evaluator kan ikke kalde værktøjer (§7).
- **.claude/rules/** — FRAVALGT (mekanik ikke adopteret): regler bæres som workflow-docs (§6) + håndhævelse (§8A) — anden metode.
- **Skills** — BRUGT: §5 rolle-skift "via … skills" (testet via `keybindings-help`).
- **Codex-plugin** — FRAVALGT som gate: in-session blanding undergraver uafhængighed (§7 MCP-bridge). NB: cross-review-_loopet_ (§4) er adopteret — men det kører på committet PR, ikke in-session plugin.
- **/loop** — DÆKKET: Monitor (§8D) bærer gate-overvågning via hændelser.
- **Statusline** — FRAVALGT: visnings-flade, ingen workflow-funktion.
- **Checkpointing (/rewind)** — FRAVALGT: git commit/PR er det delte spor (§8B).
- **--from-pr** — FRAVALGT: session-resume designet ud; kontekst re-derives fra git (§2/§8B).
- **/doctor + /context** — FRAVALGT: diagnose, ikke kæde-led. **/memory** — DÆKKET: git+workflow-docs (§2/§6) bærer delt persistens.
- **Sandboxing** — FRAVALGT som mekanik: blast-radius via handlings-gating (§8A), anden metode end OS-sandbox; `bwrap` valgfrit ekstra lag.
- **Headless** — BRUGT: §1 Step 0 + §5 + §8C/§8D (testet).
- **Agent SDK** — FRAVALGT for nu: headless+custom-agents dækker; SDK er større ombygning.
- **Agent view** — DÆKKET: headless dispatch (§1) + background/Monitor (§8D) + git (§2).
- **Agent teams** — FRAVALGT: eksperimentel, ingen resume; metode dækkes af subagenter+worktrees (§5).
- **Workflows** — DÆKKET: parallel fan-out (§1 Step4/§4/§5) via subagenter/headless. ÅBENT: orkestrator-valg i planen.
- **ultrareview** — FRAVALGT som gate: uafhængigheds-valg (§5); kan supplere cross-review på store diffs.
- **Routines** — FRAVALGT som primær drift: cloud mister working-copy (§8D). ÅBENT om plan/org har dem.
- **Worktrees** — BRUGT: §1 Step1 + §2 (ingen clobber, §8B). Metode: isolation af parallelt fil-arbejde.
- **Auto mode** — FRAVALGT: optræder ikke i kroppen; enforcement via deterministiske hooks+CI (§8A), anden metode.
- **Computer use** — FRAVALGT: desktop-Chrome (Mathias' flade), ingen kæde-anvendelse.

**Codex-opsætning** (Codex' eget udstyr — kun workflow-niveau; substans i Codex' recon. Buddet styrer kun hans ROLLE (§5) + output-gating (§4)):

- **model + reasoning_effort** — DÆKKET: §5 (model/effort pr. rolle/værdi). Konkret værdi = Codex' bord.
- **approval_policy** — FRAVALGT som workflow-lever (Codex' bord): buddet styrer kun read-only-rolle (§5) + gating (§4).
- **sandbox_mode** — FRAVALGT som workflow-lever (Codex' bord).
- **network_access** — FRAVALGT som workflow-lever (Codex' bord).
- **github-plugin** — FRAVALGT som workflow-lever (Codex' bord): substratet er git/GitHub (§2/§8B); adgangsmetode er hans.
- **trust_level pr. projekt** — FRAVALGT som workflow-lever (Codex' bord).

---

## 10) FELT-SYNTESE (8 kilder — fundamentet hviler på det mange beviser)

**De fire givne** + **fire fundet** (samme emne: ÉT fælles Codex+Claude Code-terminal-workflow til store opgaver):

- TowardsDataScience — cross-review-loopet (byg→tag anden model på PR→fix→iterér til grøn); _fanger prod-bugs_.
- shinpr/dev.to — natural-language-roller + **kontekst-separation som arkitektur**; scale (1-2/3-5/6+); artefakt-handoff; mandatory gates; identiske regelfiler (indhold ens, container differ).
- genaiunplugged — `CLAUDE.md≡AGENTS.md` + `CHANGES.log`-handoff; _"no guarantee unless backed by a hook"_; worktree pr. agent; "aldrig samme fil samtidig".
- verdent — mest sammenligning; bekræfter CLAUDE.md/AGENTS.md sameksistens, task-budgets/per-session-token-loft.
- **danielvaughan (fundet)** — fire handoff-mønstre (plan-then-execute, parallel worktrees, automated-execution-+-review, MCP-bridge); `ln -s AGENTS.md CLAUDE.md`; beslutnings-heuristik; reel fejl-case (Claude rationaliserede forkert → Codex løste på 20 min); token-kost-asymmetri.
- **engineeredintelligence (fundet)** — tre delte intermediate-filer (vision/impl/worklog); "resuming not restarting"; ærligt "don't know yet".
- **pablonax/ultracode (fundet)** — fast sekvens plan→split→run→check→integrate→verify; scale-routing (direct/workflow/delegated); **evidens-gate** ("if a handoff has no evidence, it gets rejected"); konflikt i `integration.md`, ikke voting; **"that check step is where these workflows usually fall apart"**.
- **aimaker (fundet)** — ærlig negativ-evidens: ingen færdig integration; bruger værktøjer separat pr. opgave; MCP auto-importeres ikke.

**ENIGE (stærkt signal → fundamentets bærende ben):** (1) cross-model review-loopet er værdi-multiplikatoren; (2) identisk regel-indhold, container mirrored; (3) artefakt-/fil-baseret handoff frem for delt live-state; (4) kontekst-separation; (5) scale-routing; (6) mekanisk håndhævelse — prosa er ikke nok; (7) worktree-isolation, aldrig samme fil samtidig.

**MODSIGER hinanden (afvejning taget):** (A) faste roller (1,2,6) vs. flydende (3) → jeg låser kun FUNKTIONER, ikke model-til-rolle (§5). (B) in-session MCP-bridge (6) vs. committet-PR-handoff (1,3) → committet-PR vinder for gaten (uafhængighed+immutabilitet), MCP fravalgt som gate (§7). (C) integreret system (2,8) vs. "brug separat, intet endeligt svar" (5,7) → integreret kæde, men tynd og evidens-gated (ikke over-orkestreret).

**VIRKER vs. HYPE:** virker (med evidens): cross-review fanger prod-bugs; scale-routing+artefakt-handoff grøn i én session; symlink-regler; worktree-parallelisme; token-kost-asymmetri (reelle tal). Hype/preference at diskontere: rigide model-til-rolle-låsninger (version-afhængige); velocity-løfter ("10 uger→2-3", forfatter-hedget). Ærlige unknowns: fuld integration ("don't know yet"); **check-steppet knækker** (→ derfor §4+§8G); MCP auto-migrerer ikke; model-version-drift bryder eval-kontrakter.

---

## 11) ÆNDRINGS-LOG v1→v2 (hvad feltet viste → hvilket led det styrker)

- **Cross-review-loop adopteret** (korrigerer v1-fravalg). FELT: 4 givne kilder + prod-bug-evidens. → styrker **VERIFIKATION (§4)** — buddets svageste led.
- **Evidens-gate på handoffs** (§2,§3,§8G testet). FELT: pablonax "no evidence → rejected"; check-step knækker. → styrker **VERIFIKATION + KOBLING**.
- **Scale-determination Step 0.5** (§1,§8F testet). FELT: shinpr/pablonax. → styrker **OPENING + effektivitet** (ingen tungvægt på små pakker).
- **Identisk regel-sandhed mirrored** (§6,§8H testet). FELT: 4 kilder. → styrker **RULES + cross-review-uafhængighed**.
- **Token/budget-guardrail** (§3,§8J testet). FELT: verdent task-budgets; pablonax "dynamiske workflows koster meget mere". → styrker **DRIFT + friskhed**.
- **Kontekst-separation som arkitektur** (§5). FELT: shinpr/pablonax. → styrker **BUILD/VERIFY** mod kontekst-degradering.
- **Konflikt-eksplicit, ikke averaging** (§2,§4). FELT: pablonax `integration.md`. → styrker **VERIFIKATION**.
- **Model-til-rolle konfigurerbar, ikke hardkodet** (§5,§7). FELT-modsigelse A. → styrker **ROBUSTHED** (overlever model-version-drift).
- **MCP-bridge fravalgt som gate** (§7). FELT-modsigelse B. → beskytter **uafhængigheden** cross-review hviler på.

---

## Bilag — kravsdækning (kontraktens "Workflowet skal kunne")

Vision/krav/plan/slut-sammenhæng → eksekverbar spec som tråd (§1,§2). Intet uden krav / intet lukket uden validering → dæknings-gate+evidens-gate+gates (§3,§8E,§8G). Sammenhæng med kode → kode-recon+cross-review (§1,§4). Forretnings-recon 100% → Step 1+2. Kode-recon fanger misforståelser → Step 4 + cross-review-loop. Fire-aktør-godkendelse → §4. Fang brud undervejs → fire lag (§3). Transport ikke dømmekraft → §3. Aktører løfter hinanden → strukturel uafhængighed + cross-review (§5,§4). Test hvor værdi → §3+§8. Repo-renhed → §6. Main=sporet → git (§2,§8B). Kræfter hvor mest værdi → §5 + scale-routing (§8F). Auto åbning→luk + friskhed → §3,§4 + budget-guardrail (§8J). Mathias ude af mekanik → §4. To rolle-typer → §5. Fordel roller → §5. To modsvar pr. funktion → §8 (testet).
