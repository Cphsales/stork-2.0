# Bud (Code) — workflow-færdiggørelse (endeligt)

**Type:** Code's endelige bud · **Dato:** 2026-06-16 · **Forfatter:** Code (`stork-code-bot`) · **Status:** BUD til Mathias-afgørelse
**Grundlag:** kontrakt `workflow-faerdiggoerelse-krav-og-data.md` + begge recons (`7f2dfae`/`f423d6b`) + 8-kilde felt-syntese (§10) + sparring med Codex' bud.
**Formål-ramme:** dette er FUNDAMENTET hver fremtidig Stork 2.0-build kører igennem. Målestok: bærer KOMBINATIONEN build efter build uden at knække? Kæden er ikke stærkere end sit svageste led — og **kompleksitet er en bærende risiko lige så meget som tynde overgange.**
**Codex-afgrænsning:** modpartens eget udstyr reciteres ikke; kun rolle-niveau. **Belæg:** hvert BRUGT/DÆKKET peger på et sted i buddet; §8 er terminal-testet i vores setup (rå output), uafhængigt af kæde-selftesten.

## Kernetese — fem skift, og én bevidst akse-placering

1. **Eksekverbar spec** — krav-ID + accept; _dækning_ mekanisk fail-closed (§8E), _mening_ dømmekraft.
2. **Verifikation er den knappe ressource OG det led der knækker** — en tragt med billig adversariel filtrering før dyre verifikatorer; verifikation er **spec-forankret** (review mod krav-ID), **evidens-gated** (§8G), og kører som et **bundet cross-model review-loop** med **review-pakke** og **dispositioner** (§4).
3. **Git er den immutable sandhed; worklog er en genereret projektion** — mekaniske felter udledes af git og **drift-tjekkes** (§8M), så den samlende flade ikke kan blive stale.
4. **Mathias ser kun what-forks** — destillation som system-invariant; loopet resolver det mekaniske.
5. **Scale er en livscyklus** (provisional → recon-signal → plan-lock, §8N) der ruter **dybde**; sikkerheds-gulvet er ufravigeligt (§8K).

**Akse-placering (bevidst):** hærd de overgange feltet beviser knækker — men med **lette, GENEREREDE/tjekkede kontrakter** (worklog fra git, review-pakke fra krav-ID+test+diff, plan-SHA-check, scale fra scope-tælling). En generet/tjekket kontrakt hærder overgangen **uden selv at blive en hånd-vedligeholdt schema-byrde der kan drifte.** Hold kernen lean: krav-ID som eneste semantiske tråd, ét worklog (ikke en multi-schema-register), ingen kontrakt der kun er forsikring. Det er svaret på "hver binding er et led der kan drifte" OG "overgange er hvor det knækker": hærd hvor det knækker, generér hærdningen, lean overalt ellers.

---

## 1) STRUKTUR — én kæde, rutet efter størrelse, hårde overgange, ufravigeligt gulv

| Step                                                          | Hvad                                                                                                                                                                                                                | Transport (auto)                                                                                 | Dømmekraft (aktør)                                                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| **0. Åbning**                                                 | Mathias åbner pakken (forretnings-sprog)                                                                                                                                                                            | Hændelse vækker recon headless; **rule-snapshot** = git-SHA af `docs/workflow/*` pakken kører på | Mathias: hvad-niveau                                                                                   |
| **0.5 Scale-provisional**                                     | Mål scope → `scale-provisional` (DIRECT 1-2 / WORKFLOW 3-5 / DELEGATED 6+); ruter **dybde**, ikke gulvet                                                                                                            | Mekanisk scope-tælling (§8F)                                                                     | — (stor pakke → split-forslag)                                                                         |
| **1. Bred recon (parallel, isoleret, frisk kontekst)**        | Code+Codex+Claude.ai, hver i eget worktree; hver recon giver **scale-signal** (passer provisional stadig?)                                                                                                          | Lås hver via commit                                                                              | Uafhængige fund — divergens er signal                                                                  |
| **2. Spec-forfatning** ← **GATE 1 "krav OK \<hash\>"**        | Claude.ai skriver eksekverbar spec (krav-ID+accept)                                                                                                                                                                 | Spec-lint; hash bindes til merged fil                                                            | **Mathias:** kravene = hans hvad                                                                       |
| **3. Plan**                                                   | Plan mapper krav-ID → plan-item → test; **`scale-lock`** (mismatch m. recon-signal → re-route før lock, §8N); definerer review-pakke + dispositioner + loop-kadence; **konkurrerende planer kun i DELEGATED** (§8I) | Dæknings-gate: umappet ID = FAIL (§8E)                                                           | Hver plan bærer to modsvar pr. afgørende valg                                                          |
| **4. Fire-aktør plan-gate** ← **GATE 2 (betinget fund-gate)** | Alle fire godkendelser **navngiver samme plan-SHA**; nyt commit invaliderer (§8O)                                                                                                                                   | Saml SHA-bundne godkendelser; destillér til what-forks; fund-gate kun hvis Mathias'              | **Codex** APPROVAL · **Claude.ai** krav-mening-PASS · **Code** build-ready · **Mathias** kun hans-fund |
| **5. Build (batches, isoleret)**                              | Per batch: PR + **genereret review-pakke** (krav-ID+plan-slice+test+diff+evidens-delta) → bundet spec-forankret cross-review → **disposition pr. fund** → fix/re-review → grøn                                      | Hooks(før)+selvtjek+evidens-gate(frys)+CI(push) fail-closed; budget-loft (§8J); loop-bound (§8L) | Codex per-batch read-only; Code fix                                                                    |
| **6. Luk** ← **GATE 3 "slut OK"**                             | Slutrapport = **genereret projektion** af det git-udledte worklog; spec-dækning grøn                                                                                                                                | Merge→main = sporet; slette-plan                                                                 | Claude.ai slut-review · **Mathias** slut OK                                                            |
| **7. Renhed**                                                 | Artefakter beholdes/genereres/arkiveres/slettes efter formål; idéer til idé-hjem                                                                                                                                    | governance-check (§8A)                                                                           | —                                                                                                      |

**Sikkerheds-gulv (ufravigeligt, uanset scale):** krav-coverage-gate + cross-review + de tre Mathias-gates. **Scope der rører løn/penge/schema/RLS tvinger fuld cross-review selv i DIRECT** (§8K). Scale skærer dybde (runder, parallelle planer, kontrakt-vægt) — aldrig krav-hash, plan-SHA eller slut-gate.

**Vinderen mellem planer** afgøres af verifikation mod spec (dæknings-gate + cross-review grøn + evidens) — aldrig af det mest overbevisende.

---

## 2) KOBLING — tråd, git-sandhed, genereret worklog

- **Krav-ID'et er den eneste semantiske tråd:** spec-ID → plan-item → test → review-disposition → slut-evidens; brud mekanisk synligt ved hvert led (§8E). Cross-reviewet (§4/§5) reviewer **mod krav-ID'erne** — verifikation og spec er ÉT.
- **Git er den immutable sandhed** (§8B): hand-off = commit/PR; forudsætning mellem led = required check (fail-closed); author + hash + SHA er beviset.
- **Worklog = ÉN genereret projektion, ikke en hånd-holdt flade:** de mekaniske felter (aktuelt led, sidste commit/PR, gate-states, konvergens-tæller, krav→commit→test→disposition-bindinger) **udledes af git** og **drift-tjekkes** (§8M: worklog-påstand ≠ git → BLOKERET). Kun dømmekrafts-felter (åbne konflikter, noter) forfattes. Det giver register-styrken (ingen manuel afskriftsfejl; slutrapport er projektion) **uden** en multi-schema-byrde.
- **Evidens-gated handoff** (§8G): ingen leverance passerer uden evidens (krav-ID→test, commit-hash, verdikt); uden = afvist.
- **Artefakt-only handoff + frisk kontekst:** hvert led læser kun foregående leds committede artefakt + evidens — ikke samtalen. Ingen kontekst-bias-arv.
- **Rule-snapshot-binding (let):** pakken kører på den git-SHA af `docs/workflow/*` der gjaldt ved åbning; midt-pakke regelændring kræver rule-change gate (ellers godkender to aktører forskellige virkeligheder).
- **Isolation:** eget worktree pr. aktør (clobber-bevist, §8B); aldrig to agenter på samme fil samtidig.

---

## 3) AUTOMATISERING — transport vs. dømmekraft; hærdninger er genererede (lav vedligehold)

| Automatiseres (transport + _dækning_)                                            | Automatiseres ALDRIG (_mening_ + dømmekraft)        |
| -------------------------------------------------------------------------------- | --------------------------------------------------- |
| Flyt/lås artefakter (commit/PR)                                                  | Er kravet det rigtige? (Mathias' hvad)              |
| Spec-lint + krav-ID-dæknings-gate (§8E)                                          | Er kravet rigtigt _forstået_? (krav-mening)         |
| Generér worklog fra git + drift-gate (§8M)                                       | Kode-review-verdikt (cross-model)                   |
| Generér review-pakke fra krav-ID+test+diff                                       | Disposition af et reelt fund (blocker vs follow-up) |
| Scale-routing (§8F/§8N) + plan-SHA-check (§8O) + budget (§8J) + loop-bound (§8L) | Plan-design + de to modsvar · "vinder"-valg         |
| Hooks/CI/required checks; evidens-gate (§8G)                                     | Risiko-/scope-/workaround-accept                    |

**Akse i praksis:** hver hærdnings-kontrakt ovenfor er **genereret eller en check** (worklog fra git, review-pakke fra krav-ID, SHA-check, scope-tælling) — ikke en hånd-skrevet schema-fil. Derfor hærder de overgangene uden at tilføje ny hånd-vedligeholdt drift-flade. Det er bevidst: en kontrakt der skal vedligeholdes manuelt er selv et svagt led; en der genereres/tjekkes er ikke.

**Fejl fanges i fire lag undervejs:** (1) hook FØR handling (§8A) · (2) selvtjek + evidens-gate ved frys (§8G) · (3) CI/dæknings-gate + worklog-drift-gate ved push (§8E/§8M) · (4) bundet spec-forankret cross-review på committet PR (§4/§5). Fail-closed på divergens/ukendt/åben-gate/stale/budget/loop-non-konvergens/rule-drift.

---

## 4) KONTROLPOSTER — verifikation der ikke selv knækker

**Tre author-verificerede gates (kun mgrubak):** GATE 1 "krav OK \<hash\>" · GATE 2 betinget fund-gate · GATE 3 "slut OK".

**Plan-gate-kontrakt (§8O testet):** planen fryses som plan-SHA; hver af de fire godkendelser (Mathias hvad-gate når påkrævet, Claude.ai krav-mening-PASS, Codex APPROVAL, Code build-ready) **navngiver den plan-SHA den godkender**; build-start kræver alle fire på SAMME aktuelle SHA; ethvert nyt commit til planen invaliderer tidligere godkendelser (stale → BLOKERET).

**Cross-review-mekanikken (hærdet):**

- **Spec-forankret loop:** byg → anden aktør/model reviewer den committede PR **mod krav-ID'erne** i frisk kontekst → fix → iterér til grøn. Felt-bekræftet at fange prod-bugs.
- **Review-pakke (genereret):** revieweren får krav-ID'er, plan-slice, test-output, diff og evidens-delta — ikke kun en rå diff (ellers støj-review).
- **Dispositioner (§8P testet):** hvert fund lukkes som `BLOCKER` / `FIX-NOW` / `FOLLOW-UP` (sporet gæld, blokerer ikke) / `FALSE-POSITIVE-WITH-EVIDENCE` (gendrevet m. belæg) / `MATHIAS-GATE`. Et fund der hverken er klar blocker eller klart forkert lukkes som FOLLOW-UP — uden tavs ignorering og uden uendeligt loop.
- **Bundet loop (§8L):** max N runder (scale-bestemt) / samme fejlklasse to gange → auto-eskalér (what-fork/STOP) + budget-loft.

**Hvad holder Mathias ude:** loopet + dispositionerne resolver det mekaniske/korrektheds-mæssige uden ham; kun ægte what-valg, non-konvergens eller `MATHIAS-GATE`-fund når frem, i forretnings-sprog. Gaten er ordet, ikke klikket.

**Fire-aktør-godkendelse:** krav (Mathias + Claude.ai + Code/Codex recon) · plan (de fire SHA-bundne, §8O) · slut (Code rapport + Claude.ai + Codex + Mathias).

---

## 5) ROLLE-OPSÆTNING — generator vs. verifikator; aldrig selv-verificér; scale-proportionel vægt

**To rolle-typer pr. AI** (skift via `--agents`/`--agent`, `--permission-mode`, skills):

| Aktør         | WORKFLOW-rolle (headless, kontrakt-output)                                    | ALMINDELIG rolle (interaktiv)          |
| ------------- | ----------------------------------------------------------------------------- | -------------------------------------- |
| **Claude.ai** | spec-typist, krav-mening-PASS, slut-review, gate-pakke                        | Mathias-dialog, sparring               |
| **Code**      | builder, teknisk planforfatter, state-/transport-ejer, slutrapport-generering | interaktiv fejlsøgning, Stork-features |
| **Codex**     | uafhængig read-only reviewer på committede PR'er, adversarial modspil         | kode-recon-sparring                    |

**Strukturel uafhængighed (hård invariant):** den der _genererer_, _verificerer_ aldrig selv; cross-review på committet PR i separat kontekst.
**Kontekst-separation som arkitektur:** hvert led læser kun foregående artefakt + evidens (§2); intet led akkumulerer hele konteksten.
**Model-til-rolle konfigurerbar, ikke hardkodet:** kilderne er uenige + version-afhængigt; kun funktionerne (byg, uafh. review) låses.
**Scale-proportionel kontrakt-vægt:** for **Small non-sensitive** er overgangs-kontrakterne lette — én let preflight pr. pakke (ikke fuld kontrakt før hvert led), genereret PR-template frem for separat review-pakke-fil, disposition kun når der faktisk er fund, worklog auto-udfyldt fra git. Sensitive scope beholder fuld gulv-kontrol. Det skærer kontrakt-tæthed, ikke kun runde-antal — så lette pakker ikke drukner i proces (kontrakt-krav §31/§37: test hvor det skaber værdi, beskyt friskhed).
**Kræfter hvor mest værdi:** dyr dømmekraft på kapabel model/effort; mekanik billigt. Max 3-5 parallelle — verifikation er flaskehalsen.

---

## 6) DOKUMENT-OPSÆTNING

**Én sandhed:** eksekverbar spec pr. pakke; vision+forretning er LÅST anker (kun menneske-forfattet). Idé-docs MÅ modsige (adskilt mappe).
**Worklog/ledger = ÉN genereret projektion** (mekaniske felter fra git, §8M) — IKKE en multi-schema-register. Det er den bevidste lean-placering: register-styrken uden tre schema-filer der hver skal versioneres/ejes.
**Én regel-sandhed mirrored:** `docs/workflow/*` er sandhed; `CLAUDE.md` ≡ `AGENTS.md` genereres derfra med samme checksum (§8H); drift blokerer. Reglerne er menneske-forfattede; mirroren er mekanisk.

```
docs/
  strategi/      ← vision + forretning (LÅST anker, kun menneske-forfattet)
  workflow/      ← rolle-instrukser, regelbog, gate-defs, spec-skema (kører kæden; rule-snapshot-kilde)
  coordination/  ← eksekverbar spec + plan + genereret pakke-worklog pr. aktiv pakke
    arkiv/       ← lukkede pakke-artefakter
  reference/     ← kataloger, teknik, historik, idé-docs (må modsige)
```

**Ingen dubletter:** owns-register + `governance-check` (§8A). **Slette-plan (ved luk):** recon/bud-filer → arkiv; `claude-code-egenskaber.md` → arkiv; gov-5/rette-til/gov-6-tråde → foldes ind i `workflow/` eller arkiv; håndskrevne `CLAUDE.md`/`AGENTS.md` med selvstændige regler → erstattes af genererede projektioner.

---

## 7) FRAVALG (bundet til krav eller bevist brud — ikke præference)

- **Multi-schema evidens-register (tre schema-filer)** — FRAVALGT til fordel for ÉN git-genereret worklog (§2/§8M): hver schema er et led der skal ejes/versioneres build efter build; sparringen bekræftede lean-indvendingen. Register-styrken (ingen afskriftsfejl) opnås via generering fra git, ikke via schema-vægt.
- **Fuld overgangs-kontrakt for hver Small-pakke** — FRAVALGT: kontrakt-tæthed skal være scale-proportionel (§5), ellers drukner lette pakker (krav §31/§37).
- **Ubundet cross-review-loop** — FRAVALGT: kan thrashe → bundet + dispositioner (§8L/§8P).
- **Cross-review uden review-pakke** — FRAVALGT: rå diff giver støj-review; revieweren skal se krav-ID+test+evidens (§4).
- **Scale-routing der dropper gates** — FRAVALGT: scale ruter dybde; gulvet ufravigeligt (§8K).
- **MCP-bridge som gate** — FRAVALGT: kobler kontekster, undergraver cross-review-uafhængigheden. **Hardkodet model-til-rolle** — FRAVALGT: version-afhængigt.
- **Konkurrence i hver pakke** — FRAVALGT: dobbelt-belaster verifikation; skala-gatet til DELEGATED (§8I). **Stående "bedste bud vinder"** — FRAVALGT: belønner det overbevisende.
- **AI-forfattet/auto-opdateret anker + regler** — FRAVALGT: felt-evidens, AI-genereret kontekst kan sænke succes (~3%). **Slutrapport som primær sandhed** — FRAVALGT: git-genereret worklog er sandheden, rapport er projektion.
- **Delt arbejdstræ som kanal** — FRAVALGT: clobber-bevist (§8B). **Cowork/desktop/cloud som gate** — FRAVALGT: author-verifikation kan ikke flyttes til lokal fil. **Poll-daemon primær** — FRAVALGT: e2e ubevist. **`/goal` som gate** — FRAVALGT: evaluator kan ikke kalde værktøjer. **Bredt fan-out (>5)** — FRAVALGT: flaskehals.

---

## 8) MODSVAR — afgørende opsætninger, TESTEDE i vores setup (rå output)

Alle nedenstående er **reelt eksekveret denne session i vores setup** — native primitiver + scratch-prober, **uafhængigt af kæde-selftesten** (svar på cirkularitets-indvendingen + kontrakt l.12). Den integrerede **e2e-acceptance-dry-run** (krav→plan→build-PR→review→slut på en syntetisk pakke) er **endnu IKKE kørt** — den er det udestående accept-bevis før workflowet kan kaldes e2e-bevist (markeret ærligt, ikke påstået).

| #      | Opsætning                                      | Modsvar mod (to alternativer)         | Testet resultat                                                                     |
| ------ | ---------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------- |
| 8A     | Enforcement: hook(før)+CI(efter)               | prosa / CI-only                       | hook `exit 2` blokerede; `governance-check` 6 checks `alle passed`                  |
| 8B     | Git commit/PR som tilstand                     | delt-FS / daemon                      | `7f2dfae` author+immutabel; untracked overskrevet u. author; `stork-kaede inactive` |
| 8C     | Workflow-rolle-kontrakt-output                 | prosa / manuel                        | `{"verdikt":"PASS"}` jq-parsbar; prosa → jq parse error                             |
| 8D     | Hændelses-drevet drift                         | daemon / cloud                        | background→notification; Monitor→3 per-event                                        |
| 8E     | Krav-ID-dæknings-gate                          | prosa-læsning / intet krav            | umappet `K3` → GATE BLOKERER; tilføjet → GRØN                                       |
| 8F     | Scale-routing (dybde)                          | fast tungvægt / ingen                 | 1→DIRECT, 4→WORKFLOW, 9→DELEGATED                                                   |
| 8G     | Evidens-gate på handoff                        | tillid / averaging                    | uden `Evidens:` → AFVIST; med → ACCEPT                                              |
| 8H     | Én regel-sandhed (symlink)                     | to kopier / én motor                  | `ln -sf` → diff IDENTISK                                                            |
| 8I     | Konkurrence generator (skala-gatet)            | ingen / permanent                     | argument; isolation testet (§8B worktrees)                                          |
| 8J     | Hård budget-guardrail                          | manuel                                | `--max-budget-usd` findes i binæren                                                 |
| 8K     | Scale ruter dybde; gulv ufravigeligt           | scale dropper gates / fast for alle   | sensitive=yes i DIRECT → cross-review TVUNGET                                       |
| 8L     | Bundet cross-review-loop                       | ubundet / ingen loop                  | runde 3 u. grøn → AUTO-ESKALÉR + budget                                             |
| **8M** | **Worklog genereret fra git + drift-gate**     | hånd-holdt worklog / ingen drift-tjek | worklog≠git → DRIFT BLOKERET; =git → OK                                             |
| **8N** | **Scale-livscyklus (provisional→signal→lock)** | ét-skuds scale / ingen                | recon=7 ≠ provisional DIRECT → RE-ROUTE før lock                                    |
| **8O** | **Plan-SHA fire-aktør-binding**                | løs godkendelse / stale-SHA           | stale godkendelse `def456≠abc123` → BLOKERET                                        |
| **8P** | **Review-disposition-gate**                    | auto-blocker / tavs ignorering        | FOLLOW-UP → LUKKET; udisponeret/false-pos-u-evidens → BLOKERET                      |

---

## 9) Idé-listen vejet — feltet lukket (ingen tavs kandidat)

**Claude Code-egenskaber:** Hooks BRUGT (§3/§8A) · /goal FRAVALGT (evaluator kan ikke kalde værktøjer) · .claude/rules/ FRAVALGT (regler som genererede workflow-docs §6) · Skills BRUGT (§5) · Codex-plugin FRAVALGT som gate (cross-review-_loopet_ §4 er adopteret — committet PR, ikke plugin) · /loop DÆKKET (Monitor §8D) · Statusline DÆKKET (genereret worklog §2) · /rewind FRAVALGT (git §8B) · --from-pr FRAVALGT (re-derives fra git §2) · /doctor+/context FRAVALGT; /memory DÆKKET (git+docs §2/§6) · Sandboxing FRAVALGT som mekanik (handlings-gating §8A) · Headless BRUGT (§1/§5/§8C) · Agent SDK FRAVALGT for nu · Agent view DÆKKET (§1/§8D/§2) · Agent teams FRAVALGT (eksperimentel; dækkes af subagenter+worktrees §5) · Workflows DÆKKET (fan-out §1/§4/§5) · ultrareview FRAVALGT som gate (kan supplere) · Routines FRAVALGT som primær drift · Worktrees BRUGT (§1/§2/§8B) · Auto mode FRAVALGT (deterministiske hooks+CI §8A) · Computer use FRAVALGT (desktop-Chrome, Mathias' flade).

**Codex-opsætning** (Codex' bord — kun workflow-niveau; buddet styrer kun hans rolle §5 + output-gating §4): model+reasoning_effort DÆKKET (§5 model/effort pr. rolle/værdi) · approval_policy / sandbox_mode / network_access / github-plugin / trust_level pr. projekt — alle FRAVALGT som workflow-lever (Codex' interne config; substratet er git/GitHub §2/§8B).

---

## 10) FELT-SYNTESE (8 kilder)

**Givne:** TowardsDataScience (cross-review fanger prod-bugs) · shinpr (roller+kontekst-separation+scale+artefakt-handoff+identiske regelfiler) · genaiunplugged (CLAUDE.md≡AGENTS.md+CHANGES.log; "no guarantee unless backed by a hook"; worktree) · verdent (task-budgets/token-loft). **Fundet:** danielvaughan (handoff-mønstre + `ln -s` + reel fejl-case) · engineeredintelligence ("resuming not restarting") · pablonax (scale-modes; evidens-gate; **"check step is where these workflows usually fall apart"**) · aimaker (ærlig: ingen færdig integration; MCP auto-importeres ikke).

**Enige (bærende ben):** cross-review-loop · identisk regel-indhold mirrored · artefakt-handoff frem for delt state · kontekst-separation · scale-routing · mekanisk håndhævelse · worktree-isolation. **Modsiger (afvejet):** faste vs. flydende roller → kun funktioner låses; in-session MCP vs. committet-PR → PR vinder; integreret vs. separat → tynd, evidens-gatet kæde. **Virker vs. hype:** virker — cross-review, scale+artefakt-handoff, symlink-regler, worktree, token-asymmetri; hype — rigide model-rolle-låsninger, velocity-løfter; ærlige unknowns — fuld integration, **check-steppet knækker** (→ §4/§8L/§8P), model-version-drift.

---

## Ændrings-log (v2.1 → endelig, drevet af sparringen)

- **Worklog gjort til en git-genereret projektion + drift-gate (§2, §8M).** Drevet af Codex' spørgsmål: mit lette worklog kunne blive stale uden opdagelse. Hans register-som-projektion-princip lånt — men via generering fra git, ikke en multi-schema-register. Styrker den samlende flade (mit svageste led i v2.1).
- **Scale gjort til livscyklus (§1, §8N).** Drevet af Codex' spørgsmål: et ét-skuds scale under-scoper en pakke recon afslører er større (uden at være sensitive). Provisional→signal→lock med re-route lånt.
- **Plan-SHA fire-aktør-binding gjort eksplicit + testet (§4, §8O).** Drevet af Codex' spørgsmål: v2.1 havde git-immutabilitet men ikke den præcise fire-til-én-SHA-kontrakt.
- **Review-pakke + dispositioner tilføjet til cross-review (§4, §5, §8P).** Drevet af Codex' spørgsmål: et ikke-blocker-fund manglede en ren lukning; rå-diff-review giver støj. FOLLOW-UP/FALSE-POSITIVE-WITH-EVIDENCE lånt (let udgave).
- **Let rule-snapshot tilføjet (§1, §2).** Drevet af felt + Codex: regel-drift midt i pakke lader aktører godkende forskellige virkeligheder.
- **Multi-schema-register FRAVALGT, scale-proportionel kontrakt-vægt indført (§5, §7).** Drevet af MIN indvending, som Codex selv erkendte: tre schema-filer + fuld kontrakt pr. Small-pakke er vedligeholdes-drift. Hærdninger gøres genererede/tjekkede, ikke hånd-skrevne — akse-placeringen.
- **§8 mærket uafhængigt af kæde-selftesten + e2e-dry-run mærket som udestående.** Drevet af cirkularitets-indvendingen (begge bud): testene er native/scratch i vores setup; det integrerede e2e-accept-bevis er ærligt ikke kørt endnu.
