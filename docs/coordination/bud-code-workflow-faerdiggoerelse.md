# Bud (Code) — workflow-færdiggørelse

**Type:** Konkurrence-bud fra Code — MIT eget bud · **Version:** v2.1 (v2 + fuld kæde-niveau-gennemgang mod syntesen; kæde-log §12)
**Dato:** 2026-06-16 · **Forfatter:** Code (`stork-code-bot`) · **Status:** BUD til Mathias-afgørelse
**Grundlag:** kontrakt `workflow-faerdiggoerelse-krav-og-data.md` + begge recons (`7f2dfae`/`f423d6b`) + syntese af 8 felt-kilder (§10).
**Formål-ramme:** dette er FUNDAMENTET hver fremtidig Stork 2.0-build kører igennem. Målestok: bærer KOMBINATIONEN build efter build uden at knække? Kæden er ikke stærkere end sit svageste led.
**Codex-afgrænsning:** Codex' eget udstyr reciteres ikke; kun rolle-niveau. **Belæg:** hvert BRUGT/DÆKKET peger på et sted i buddet; §8 er terminal-testet.

## Det svageste led — og hvad v2/v2.1 retter

v1's svageste led var **verifikationen**: jeg havde fravalgt cross-review-loopet på en fejlslutning. v2 adopterede det (kører på committet PR i separat kontekst = uafhængigt). **v2.1's kæde-gennemgang fandt at loopet i sig selv kan knække kæden på tre måder** — det kan thrashe uendeligt, det kan dobbelt-belaste den knappe verifikations-ressource, og scale-routing kan utilsigtet lade en lille (men farlig) ændring omgå det. v2.1 binder disse (§12).

## Kernetese — fem skift, bundet til én kæde

1. **Eksekverbar spec, ikke prosa** — krav-ID + accept; _dækning_ mekanisk fail-closed (§8E), _mening_ dømmekraft.
2. **Verifikation er den knappe ressource OG det led der knækker** — derfor en tragt med billig adversariel filtrering før dyre verifikatorer; verifikation er **spec-forankret** (review mod krav-ID, ikke generisk), **evidens-gated**, og kører som et **bundet cross-model review-loop** (§4).
3. **Git + hændelser ER tilstandsmaskinen** — immutabelt, author-verificeret spor (§8B).
4. **Mathias ser kun what-forks** — destillation som system-invariant; loopet resolver det mekaniske, så kun ægte hvad-valg (eller non-konvergens) når ham.
5. **Indsats rutes efter pakke-størrelse** (§8F) — men kun DYBDEN; **sikkerheds-gulvet er ufravigeligt** (§8K). En typo kører ikke tungvægts-kæden — men en typo til løn-data omgår aldrig review.

Tværgående: konkurrence er **generator** ved forks (skala-gatet, §8I), aldrig afgører; ankret + reglerne er menneske-skrevne (§7); én regel-sandhed mirrored til begge motorer (§6, §8H).

---

## 1) STRUKTUR — én kæde, rutet efter størrelse, med ufravigeligt gulv

| Step                                                                                    | Hvad                                                                                                                        | Transport (auto)                                                                      | Dømmekraft (aktør)                                                                                                           |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **0. Åbning**                                                                           | Mathias åbner pakken (forretnings-sprog)                                                                                    | Hændelse vækker recon headless                                                        | Mathias: hvad-niveau                                                                                                         |
| **0.5 Scale-determination**                                                             | Mål størrelse → rutér **DYBDE** (DIRECT 1-2 / WORKFLOW 3-5 / DELEGATED 6+); gulvet er uændret (§8K)                         | Mekanisk scope-tælling → mode                                                         | — (stor pakke → split-forslag)                                                                                               |
| **1. Bred recon (parallel, isoleret)**                                                  | Code+Codex+Claude.ai, hver i eget worktree, frisk kontekst                                                                  | Lås hver via commit                                                                   | Uafhængige fund — divergens er signal                                                                                        |
| **2. Spec-forfatning** ← **GATE 1 "krav OK \<hash\>"**                                  | Claude.ai skriver eksekverbar spec (krav-ID+accept)                                                                         | Spec-lint                                                                             | **Mathias:** kravene = hans hvad                                                                                             |
| **3. Plan(er)**                                                                         | Plan mapper hvert krav-ID → plan-item → test. **Konkurrerende planer kun i DELEGATED** (§8I); ellers én plan + cross-review | Dæknings-gate: umappet ID = FAIL (§8E)                                                | Hver plan bærer to modsvar pr. afgørende valg                                                                                |
| **4. Verifikation: spec-forankret cross-review-loop → 4-aktør** ← **GATE 2 (betinget)** | byg→anden-model-review mod krav-ID på committet PR→ret→iterér til grøn (**bundet**, §8L); evidens-gated handoff (§8G)       | Saml evidens-bærende verdikter; destillér til what-forks; fund-gate kun hvis Mathias' | **Codex:** uafh. kode-review · **Claude.ai:** krav-_mening_-PASS · **Code:** fix · **Mathias:** kun what-valg/non-konvergens |
| **5. Build (batches, isoleret)**                                                        | Code bygger; per batch: PR→bundet cross-review→fix→grøn                                                                     | Hooks(før)+selvtjek(frys)+CI(push) fail-closed; budget-loft (§8J)                     | Codex per-batch; Code teknik                                                                                                 |
| **6. Luk** ← **GATE 3 "slut OK"**                                                       | Slut-rapport; spec-dækning grøn; repo-renhed                                                                                | Merge→main = sporet; slette-plan                                                      | Claude.ai: slut-review · **Mathias:** slut OK                                                                                |

**Sikkerheds-gulv (ufravigeligt, uanset størrelse):** krav-coverage-gate + cross-review + de tre Mathias-gates. Scale-routing skruer kun på DYBDE (parallel/konkurrence); **scope der rører løn/penge/schema/RLS tvinger cross-review selv i DIRECT** (§8K testet). Det lukker hullet hvor en lille ændring kunne snige sig uden om verifikation.

**Vinderen mellem planer** afgøres af verifikation mod spec (dæknings-gate + cross-review grøn + evidens) — aldrig af hvad der er mest overbevisende.

---

## 2) KOBLING — tråd, evidens og artefakt-handoff binder kæden

- **Krav-ID'et er tråden:** spec-ID → plan-item → test → slut-evidens; brud mekanisk synligt ved hvert led (§8E). Cross-reviewet (§4) reviewer **mod krav-ID'erne**, ikke generisk — så verifikation og spec er ÉT, ikke to.
- **Artefakt-only handoff + frisk kontekst (FELT):** hvert led starter frisk og læser kun det foregående leds **committede artefakt + evidens** — ikke den forrige samtale. Det forhindrer kontekst-bias-arv og gør at intet led akkumulerer hele konteksten (§5). Kæde-egenskab, ikke kun en §5-påstand.
- **Evidens-gated handoff (FELT):** ingen leverance passerer uden evidens (krav-ID→test, commit-hash, verdikt); **uden evidens = afvist** (§8G testet). Tavse fejl stoppes ved kilden.
- **Konflikt-eksplicit (FELT):** modstridende verdikter averages ikke — skrives i pakkens worklog (nedenfor) og flages "verifikation mangler".
- **Pakke-worklog (ÉN artefakt, git-tracked):** aktuelt led + sidste evidens-bærende handoff + åbne konflikter + konvergens-tæller. Det binder Step 0→6 så enhver session **genoptager, ikke genstarter** (FELT). Bevidst ÉN fil — ikke en suite (vision/impl/worklog) — for at undgå ny vedligeholdes-fejlflade.
- **Isolation:** eget worktree pr. aktør (clobber-bevist, §8B); aldrig to agenter på samme fil samtidig (FELT).

---

## 3) AUTOMATISERING — transport vs. dømmekraft; fejl fanges undervejs

| Automatiseres (transport + _dækning_)                      | Automatiseres ALDRIG (_mening_ + dømmekraft)     |
| ---------------------------------------------------------- | ------------------------------------------------ |
| Flyt/lås artefakter (commit/PR)                            | Er kravet det rigtige? (Mathias' hvad)           |
| Spec-lint + krav-ID-dæknings-gate (§8E)                    | Er kravet rigtigt _forstået_? (krav-mening)      |
| Evidens-gate på handoffs (§8G)                             | Kode-review-verdikt (cross-model)                |
| Hooks/CI/required checks (fail-closed)                     | Plan-design + de to modsvar                      |
| Scale-routing (§8F) + budget-loft (§8J) + loop-bound (§8L) | Konflikt-afgørelse mellem modstridende verdikter |
| Væk aktører på hændelse; worklog-opdatering                | "Vinder"-valg = verifikation, ikke transport     |

**Fire lag fanger fejl undervejs:** (1) hook FØR handling (§8A) · (2) selvtjek + evidens-gate ved frys (§8G) · (3) CI/dæknings-gate ved push (§8A+§8E) · (4) bundet cross-model-review mod krav-ID på committet PR (§4). Fail-closed på divergens/ukendt/åben-gate/stale/budget-overskridelse/loop-non-konvergens.

---

## 4) KONTROLPOSTER — verifikation der ikke selv knækker

**Tre author-verificerede gates (kun mgrubak):** GATE 1 "krav OK \<hash\>" · GATE 2 betinget fund-gate · GATE 3 "slut OK".

**Verifikations-mekanikken (hærdet på kæde-niveau):**

- **Spec-forankret cross-review-loop:** byg → en ANDEN aktør/model reviewer den committede PR **mod krav-ID'erne** (separat kontekst = uafhængigt) → fix → iterér til grøn. Felt-bekræftet at fange prod-bugs.
- **Bundet loop (§8L testet):** max N runder uden grøn → **auto-eskalér** (what-fork til Mathias / STOP) + budget-loft (§8J). Loopet kan ikke thrashe — det er både værdi-multiplikatoren OG hæng-risikoen, så det skal bindes.
- **Evidens-gate (§8G):** ingen verdikt uden evidens. **Konflikt-eksplicit:** modstridende verdikter flages, averages ikke.

**Hvad holder Mathias ude:** loopet resolver det mekaniske/korrektheds-mæssige uden ham; kun ægte what-valg eller non-konvergens når frem, i forretnings-sprog. Gaten er ordet, ikke klikket.

**Fire-aktør-godkendelse:** krav (Mathias + Claude.ai + Code/Codex) · plan (Codex APPROVAL + Claude.ai krav-mening-PASS + Code + Mathias kun hans-fund) · slut (Code + Claude.ai + Codex + Mathias).

---

## 5) ROLLE-OPSÆTNING — generator vs. verifikator; aldrig selv-verificér; kontekst-separation

**To rolle-typer pr. AI** (skift via `--agents`/`--agent`, `--permission-mode`, skills):

| Aktør         | WORKFLOW-rolle (headless, kontrakt-output)             | ALMINDELIG rolle (interaktiv) |
| ------------- | ------------------------------------------------------ | ----------------------------- |
| **Claude.ai** | spec-typist, krav-mening-PASS, slut-review, gate-pakke | Mathias-dialog, sparring      |
| **Code**      | scriptet build/transport, struktureret status          | interaktiv fejlsøgning        |
| **Codex**     | uafhængig read-only review-verdikt (kontrakt)          | kode-recon-sparring           |

**Strukturel uafhængighed (hård invariant):** den der _genererer_, _verificerer_ aldrig selv; cross-review sker på committet PR i separat kontekst.
**Kontekst-separation som arkitektur (FELT):** hvert led/agent læser kun foregående artefakt+evidens (§2), akkumulerer ikke hele konteksten → "no single agent hits the context ceiling". Hærder build/verify mod kontekst-degradering.
**Model-til-rolle konfigurerbar, ikke hardkodet (FELT-modsigelse):** kilderne er uenige + version-afhængigt; kun funktionerne (byg, uafh. review) låses.
**Kræfter hvor mest værdi:** dyr dømmekraft på kapabel model/effort; mekanik billigt. Max 3-5 parallelle — verifikation er flaskehalsen.

---

## 6) DOKUMENT-OPSÆTNING

**Én sandhed:** eksekverbar spec pr. pakke; vision+forretning er LÅST anker (kun menneske-forfattet, §7). Idé-docs MÅ modsige (adskilt mappe).
**Én regel-sandhed mirrored til begge motorer (FELT, §8H):** reglerne skrives ÉN gang (menneske) og mirrores — `CLAUDE.md` ≡ `AGENTS.md` via symlink (én fil, kan ikke divergere; ingen dublet at synke).

```
docs/
  strategi/      ← vision + forretning (LÅST anker, kun menneske-forfattet)
  workflow/      ← rolle-instrukser, regelbog, gate-defs, spec-skema (kører kæden)
  coordination/  ← eksekverbar spec + plan + pakke-worklog (§2) pr. aktiv pakke
    arkiv/       ← lukkede pakke-artefakter
  reference/     ← kataloger, teknik, historik, idé-docs (må modsige)
```

**Ingen dubletter:** owns-register + `governance-check` (§8A). **Slette-plan (ved luk):** recon/bud-filer → arkiv; `claude-code-egenskaber.md` → arkiv; idé-/gov-tråde → foldes ind eller arkiv.

---

## 7) FRAVALG (velbegrundet)

- **Cross-review-loop** — TIDLIGERE FRAVALGT, NU ADOPTERET (§4): kører på committet PR i separat kontekst = uafhængigt. v1-grunden holdt ikke.
- **MCP-bridge som gate** — FRAVALGT: kobler kontekster, undergraver den uafhængighed loopet hviler på. Committet-PR-handoff vinder.
- **Konkurrence i hver pakke** — FRAVALGT: dobbelt-belaster den knappe verifikations-ressource; **skala-gatet til DELEGATED** (§8I).
- **Hardkodet model-til-rolle** — FRAVALGT: version-afhængigt; kun funktioner låses.
- **Ubundet cross-review-loop** — FRAVALGT: kan thrashe og hænge kæden; bundet (§8L).
- **Scale-routing der dropper gates** — FRAVALGT: scale rutér kun dybde; gulvet er ufravigeligt (§8K).
- **Prosa-spec / én reviewer / averaging af konflikter** — FRAVALGT: misser udeladelser / "plausibelt-men-forkert" / skjuler konflikt.
- **AI-forfattet anker+regler** — FRAVALGT: felt-evidens, AI-genereret kontekst kan sænke succes (~3%).
- **Poll-daemon primær / delt arbejdstræ som kanal / Cowork som gate / bredt fan-out (>5) / `/goal` som gate** — FRAVALGT (e2e ubevist / clobber-bevist / author-verifikation kan ikke flyttes / flaskehals / evaluator kan ikke kalde værktøjer).
- **Artefakt-suite (vision+impl+worklog separat)** — FRAVALGT: ÉN pakke-worklog (§2) dækker uden ny vedligeholdes-fejlflade.

---

## 8) MODSVAR — afgørende opsætninger, TESTEDE

### 8A — Enforcement: hook(før)+CI(efter) · vs. prosa · vs. CI-only

Testet: hook hård-blokerede (`exit 2`); `governance-check` 6 checks `alle passed`, exit 0. Prosa fanger intet; CI-only fanger først efter push.

### 8B — Tilstand/kanal: git commit/PR · vs. delt-FS · vs. daemon

Testet: `git show 7f2dfae` → author + immutabel; untracked → overskrevet, ingen author (min recon blev faktisk overskrevet); `stork-kaede` → `inactive`.

### 8C — Workflow-rolle-output: kontrakt · vs. prosa · vs. manuel

Testet: `--agents` → `{"verdikt":"PASS"}` (jq parser); generalist → prosa (jq parse error).

### 8D — Drift: hændelses-drevet · vs. daemon · vs. cloud

Testet: background-task → notification; Monitor → 3 per-event. Daemon `inactive`; cloud mister working-copy.

### 8E — Eksekverbar spec: krav-ID-dæknings-gate · vs. prosa-læsning · vs. intet krav

Testet: plan mangler `K3` → `GATE BLOKERER`; tilføj `K3` → `GRØN`.

### 8F — Scale-determination: rutér dybde · vs. fast tungvægt · vs. ingen routing

Testet: `1→DIRECT · 4→WORKFLOW · 9→DELEGATED`. Fast tungvægt = spild på typo; ingen routing = stor pakke knækker.

### 8G — Evidens-gate: afvis handoff uden evidens · vs. tillid · vs. averaging

Testet: uden `Evidens:` → `AFVIST`; med → `ACCEPT`.

### 8H — Én regel-sandhed: symlink · vs. to kopier · vs. én motor

Testet: `ln -sf AGENTS.md CLAUDE.md` → `diff: IDENTISK`. To kopier divergerer; én motor taber cross-review-uafhængighed.

### 8I — Konkurrence: generator (skala-gatet) JA · afgører NEJ

Generator kun i DELEGATED (§8F) så den ikke dobbelt-belaster verifikation; afgører NEJ (belønner det overbevisende). Verifikation mod spec afgør.

### 8J — Runaway-guardrail: hård budget · vs. manuel

Testet: `claude --help` → `--max-budget-usd` findes. Manuel opmærksomhed knækker i lange kørsler.

### 8K — Scale rutér DYBDE; sikkerheds-gulvet er ufravigeligt (KÆDE) · vs. scale dropper gates · vs. fast for alle

- **Testet:** `1 fil sensitive=no → DIRECT | én plan | gulv` · `1 fil sensitive=yes → DIRECT | én plan | cross-review TVUNGET` · `9 → DELEGATED | konkurrerende | gulv`.
- **Modsvar 1 (scale dropper gates):** lille ændring til løn-data omgår review → fundament-hul (Stork rører løndata). **Modsvar 2 (fast for alle):** spild + flaskehals. → dybde varierer, gulv (coverage+cross-review+gates) gør aldrig. Kilde: pablonax "small tasks stay small" (= drop overhead, ikke sikkerhed). Styrker HELHEDEN: scale + verifikation spiller sammen uden hul.

### 8L — Cross-review-loopet er BUNDET (KÆDE) · vs. ubundet · vs. ingen loop

- **Testet:** `runde 1-3 fund→fix; runde 3 uden grøn → AUTO-ESKALÉR (what-fork/STOP) + budget-loft`.
- **Modsvar 1 (ubundet):** thrasher uendeligt → kæden hænger, verifikations-ressourcen brænder. **Modsvar 2 (ingen loop):** mister værdi-multiplikatoren (prod-bugs slipper). → loopet er både værdi OG risiko; bindingen gør det bæredygtigt build efter build. Kilde: pablonax "check step falls apart" + model-version-drift. Styrker HELHEDEN: §4-loop + §8J-budget + konvergens spiller sammen.

---

## 9) Idé-listen vejet — feltet lukket (ingen tavs kandidat)

**Claude Code-egenskaber:** Hooks BRUGT (§3/§8A) · /goal FRAVALGT (evaluator kan ikke kalde værktøjer) · .claude/rules/ FRAVALGT (mekanik ikke adopteret; regler som workflow-docs §6) · Skills BRUGT (§5) · Codex-plugin FRAVALGT som gate (in-session blanding; men cross-review-_loopet_ §4 er adopteret — committet PR, ikke plugin) · /loop DÆKKET (Monitor §8D) · Statusline FRAVALGT · /rewind FRAVALGT (git §8B) · --from-pr FRAVALGT (re-derives fra git §2) · /doctor+/context FRAVALGT; /memory DÆKKET (git+docs §2/§6) · Sandboxing FRAVALGT som mekanik (handlings-gating §8A, anden metode) · Headless BRUGT (§1/§5/§8C/§8D) · Agent SDK FRAVALGT for nu · Agent view DÆKKET (§1/§8D/§2) · Agent teams FRAVALGT (eksperimentel; dækkes af subagenter+worktrees §5) · Workflows DÆKKET (fan-out §1/§4/§5; orkestrator-valg ÅBENT) · ultrareview FRAVALGT som gate (kan supplere cross-review) · Routines FRAVALGT som primær drift · Worktrees BRUGT (§1/§2/§8B) · Auto mode FRAVALGT (ikke i kroppen; deterministiske hooks+CI §8A) · Computer use FRAVALGT (desktop-Chrome, Mathias' flade).

**Codex-opsætning** (Codex' bord — kun workflow-niveau; buddet styrer kun hans rolle §5 + output-gating §4): model+reasoning_effort DÆKKET (§5) · approval_policy / sandbox_mode / network_access / github-plugin / trust_level pr. projekt — alle FRAVALGT som workflow-lever (Codex' interne config, ikke min lever; substratet er git/GitHub §2/§8B).

---

## 10) FELT-SYNTESE (8 kilder)

**Givne:** TowardsDataScience (cross-review-loop fanger prod-bugs) · shinpr/dev.to (natural-language-roller + kontekst-separation + scale 1-2/3-5/6+ + artefakt-handoff + identiske regelfiler) · genaiunplugged (CLAUDE.md≡AGENTS.md + CHANGES.log; "no guarantee unless backed by a hook"; worktree pr. agent) · verdent (sammenligning; task-budgets/token-loft).
**Fundet:** danielvaughan (fire handoff-mønstre + `ln -s` + reel fejl-case) · engineeredintelligence (tre delte filer; "resuming not restarting") · pablonax/ultracode (plan→split→run→check→integrate→verify; scale-modes; **evidens-gate**; **"check step is where these workflows usually fall apart"**) · aimaker (ærlig: ingen færdig integration; MCP auto-importeres ikke).

**ENIGE (bærende ben):** cross-review-loop · identisk regel-indhold mirrored · artefakt-/fil-handoff frem for delt live-state · kontekst-separation · scale-routing · mekanisk håndhævelse · worktree-isolation.
**MODSIGER (afvejet):** faste vs. flydende roller → kun funktioner låses (§5); in-session MCP vs. committet-PR → PR vinder (§7); integreret vs. separat → tynd, evidens-gatet kæde.
**VIRKER vs. HYPE:** virker (evidens): cross-review fanger prod-bugs, scale+artefakt-handoff grøn i én session, symlink-regler, worktree-parallelisme, token-kost-asymmetri. Hype at diskontere: rigide model-rolle-låsninger, velocity-løfter. Ærlige unknowns: fuld integration, **check-steppet knækker** (→ §4+§8G+§8L), MCP auto-migrerer ikke, model-version-drift.

---

## 11) ÆNDRINGS-LOG v1→v2 (felt → led)

Cross-review-loop adopteret (→ VERIFIKATION) · evidens-gate (→ VERIFIKATION+KOBLING) · scale-determination (→ OPENING+effektivitet) · identiske regelfiler (→ RULES+uafhængighed) · budget-guardrail (→ DRIFT+friskhed) · kontekst-separation (→ BUILD/VERIFY) · konflikt-eksplicit (→ VERIFIKATION) · model-rolle konfigurerbar (→ ROBUSTHED) · MCP-bridge fravalgt (→ uafhængighed).

## 12) KÆDE-LOG v2→v2.1 (helheds-gennemgang — samspil, ikke isolerede led)

**Hvor SAMMENHÆNGEN blev tættere:**

- **Cross-review forankret i krav-ID** (§2,§4). Kilde: pablonax (evidens-gate) + shinpr (artefakt-handoff). Binder spec (§8E), evidens-gate (§8G) og review (§4) til ÉN verifikations-spine i stedet for tre parallelle mekanismer → kæden har én tråd hele vejen.
- **Artefakt-only handoff + frisk kontekst som kæde-egenskab** (§2,§5). Kilde: shinpr (kontekst-separation, "reads without inheriting bias"). Kobler §5-kontekst-separation til selve flowet → hvert led-overgang er ren, ingen bias-arv.
- **ÉN pakke-worklog binder Step 0→6** (§2,§6). Kilde: engineeredintelligence + genaiunplugged + pablonax. "Resuming not restarting" på tværs af sessioner — konsolideret til én fil for ikke at tilføje fejlflade.

**Hvor helheden havde et SVAGT LED (knækker under rigtig build):**

- **Ubundet cross-review-loop** → bundet med auto-eskalering + budget (§4,§8L testet). Loopet er værdi-multiplikatoren OG hæng-risikoen; ubundet hænger kæden. Kilde: pablonax "check step falls apart" + model-version-drift.
- **Scale-routing kunne lade en lille farlig ændring omgå verifikation** → sikkerheds-gulv ufravigeligt; sensitive scope tvinger cross-review selv i DIRECT (§1,§8K testet). Kilde: pablonax "small tasks stay small" (drop overhead, ikke sikkerhed) + Stork rører løndata.

**Hvor en ændring ville koste et andet led (afvist/bundet):**

- **Konkurrence i hver pakke** ville dobbelt-belaste den knappe verifikations-ressource → skala-gatet til DELEGATED (§8I). Kilde: "3-5 sweet spot / bottleneck is verification".
- **Artefakt-suite** (vision+impl+worklog) ville tilføje vedligeholdes-fejlflade → ÉN worklog (§2).

**Bekræftet-holder (urørt, fordi feltet bekræfter helheden dér):** git-som-tilstandsmaskine (§3 — shinpr artefakt-handoff + immutabilitet) · worktree-isolation (§5 — genaiunplugged/danielvaughan "worktree per agent, never same file") · eksekverbar spec/coverage-gate (§8E — shinpr scale + SDD) · menneske-skrevet anker (§7 — AI-kontekst-sænker-succes) · hooks/CI-håndhævelse (§8A — genaiunplugged "no guarantee unless backed by a hook").

---

## Bilag — kravsdækning

Vision/krav/plan/slut-sammenhæng → spec som tråd + cross-review forankret i krav-ID (§2,§4). Intet uden krav / intet lukket uden validering → dæknings-gate+evidens-gate+gulv (§3,§8E,§8G,§8K). Sammenhæng med kode → cross-review-loop (§4). Forretnings-recon 100% → Step 1+2. Kode-recon → Step 4. Fire-aktør → §4. Fang brud undervejs → fire lag (§3). Transport ikke dømmekraft → §3. Aktører løfter hinanden → strukturel uafhængighed + cross-review (§5,§4). Test hvor værdi → §3+§8. Repo-renhed → §6. Main=sporet → git (§2,§8B). Kræfter hvor mest værdi → §5 + scale (§8F,§8K). Auto åbning→luk + friskhed → §3,§4 + budget+loop-bound (§8J,§8L). Mathias ude af mekanik → §4. To rolle-typer → §5. Fordel roller → §5. To modsvar pr. funktion → §8 (testet).
