# Workflow — implementeringsplan (v5) · SAMLET

**Status:** ÉN samlet plan (2026-08-11). Design godkendt af Mathias 2026-06-25; herefter foldet ind: Codex-endcheck (9 fund, 2026-06-26) · gate-kerne v4 · dybde-resolution (effect-harness + config-mutant-kill). **Erstatter v1/v2/v3 — denne fil er eneste sandhed.** **Design-grøn ≠ skudsikker:** en designet-men-utestet mekanisme er selv doc-grøn (KERNEN gælder også planen); skudsikker = DEL VI bestået.

> **OVERLEVERING til frisk session (2026-08-12) — hvor vi er:**
> **Rolleteksterne (`scripts/v5/roller/*.md`) er AAA-godkendt af Mathias.** Hele det **pakke-agnostiske fabrik-fundament er BYGGET + Codex-cross-vendor-hærdet til AAA + pushet + v5-CI grøn** (branch `claude/workflow-implementeringsplan`; `npm run v5:selftest` = 446 grønne). Bygget i `scripts/v5/`: gate-kerne · verdikt · git · prover · coverage · proofs · **build-proof-verifier** · **build-harness/mutation-framework** (bevist mod rigtig Postgres; integration i `build-harness.integration.mjs`, IKKE i CI) · hooks (+`buildWriteDecision`) · driver · roller · **actors-lock** · gate-eval · **checkrun** + selftests.
> **Ærlig grænse (dokumenteret i modulerne):** Proxy + global built-in-prototype-mutation = runtime-integritets-antagelser (ikke nåelige af fabrik-DATA); de er bevidst IKKE lukket.
> **NÆSTE = FØRSTE PAKKE gennem fabrikken** — låser de sidste pakke-afhængige residualer op: angrebs-spec-legitimitet end-to-end (plan-deklareret forventet-OID) · chain-proof held-out reel data · fase-mikro-orkestrering + actor-runner + CI-som-dommer der emitterer check-runs pr. gate. **Valg af masterplan-trin = Mathias' bord** (mindst muligt trin først, for at bevise flowet ende-til-ende). **Byg intet i pakke-fasen før Mathias' ord.**

---

# DEL I — FUNDAMENT (globalt · gælder alle faser)

## Context
Byg-workflowet er **fabrikken, ikke varen** — det sikrer at hvert Stork-masterplan-trin bygges **korrekt og efter hensigten**, fri af falsk-grøn (ser færdig ud uden at virke). **Vi bygger SELVE WORKFLOWET — den pakke-agnostiske fabrik for HVER fremtidig pakke — ikke en Stork 2.0-pakke.** Bygges friskt fra designet; sund plumbing genbruges, falsk-grøn-mekanikken bygges på ny (*Genbrug — vejet*, DEL IV).

> **IKKE i scope:** Stork-produktfeatures (løn · salg · vagter · provision · RLS-domæne) hører til de pakker workflowet KØRER på — bages aldrig ind i fabrikken.

## Rygraden — én ubrudt kæde af troskab
```
vision/forretning  ⊨  krav  ⊨  plan  ⊨(1:1)  build  ⊨  sandhed (slut)
```
**⊨** = *"tro mod efter hensigten"*: hvert led skal være en sand følge af det forrige. Hvert **⊨** har **ét bevis + én dommer**. En falsk-grøn er et **⊨** der påstås uden at bevises.
- **Menneske-led** (vision→krav→plan): semantisk troskab → **Mathias + Claude.ai dømmer** ved gates.
- **plan→build:** mekanisk **1:1** → bijektion + reel slut-effekt-kør dømmer. **1:1 = al kode-skrivning står i planen; build = ren mekanisk udførelse (intet nyt besluttes) → planen er workflowets tungeste led.**
- **build→sandhed:** reel-data fuld-kæde dømmer (P5).

## Principper
P1 u-forfalskelig · P2 forskellige blinde vinkler · P3 non-LLM/menneske = dommer, LLM = input · P4 fanget falsk-grøn → regressions-test · P5 kode = sandhed ved fuld dybde.

## KERNEN — forståelse af funktionen > ord
En test/validering fanger kun sandheden hvis den bygger på **forståelse af hvad funktionen skal kunne, hvad den skal afvise, og hvordan logikken/opsætningen virker**. *"Rettigheder: ja, de er der"* er grønt på ord og misser sandheden (er `WITH CHECK` korrekt, afvises cross-org reelt). **Mekanismen er vognen; forståelsen er brændstoffet** — en test uden genuin funktions-forståelse er ord-teater (doc-grøn ≠ dybde). Forståelsen fanges i **krav-acceptkriteriet (inkl. negativer)** · **Codex' angrebs-spec** · **dybde-dommen ved plan-gaten**, og bæres ind i slut-effekt-testen. Derfor: **CI's deterministiske checks = struktur/komplethed** (dækket · mappet · til stede · ikke-fabrikeret), **IKKE sandhed**; sandheden — virker logikken/opsætningen — afgøres af **proverens reelle kør ved fuld dybde + effect-harness + mutant-kill (2.C)**, aldrig ord-tilstedeværelse.

**"Sat korrekt op" vs. "findes":** man kan aldrig mekanisk påstå *"konfig er korrekt"* — men man kan bevise **"testen går RØD hvis konfig brydes"**: effect-harness (reel handling gennem rigtig indgang mod rigtig store/ikke-bypass-rolle, observér hård slut-effekt) **+ config-mutant-kill** (mutér `WITH CHECK`/rolle/predikat → testen SKAL gå rød; en "findes"-test overlever mutanten → falsk-grøn afsløret).

## Vejnings-reglen
Hver mekanisme skal svare ja til *"tjener den et led, og ville en falsk-grøn slippe uden den?"* — ellers ud (over-test). Vi jagter et grundigt krav + et 1:1 build, ikke nul-residual via test-fæstning.

## Gennemgående regler (gælder alle led)
- **Spørg ved uklarhed — antag ALDRIG:** uklar krav/plan → aktøren **HALTER og spørger** (forretning→Mathias ved hans rytme · teknisk→ejer); bygget på antaget tolkning → FAIL.
- **HALT vs. terminal STOP:** modsigelse/uadresseret fund/divergens → **HALT** (fail-closed, bygger ikke videre, durabelt flag). Uløselig modsigelse mod krav/låste docs → **terminal STOP**. Broer mellem gates = ren transport; **dømmekraft kører aldrig af sig selv**. Mathias afbrydes ikke mid-stream — ser flag ved næste gate eller når han pull'er.
- **Anti-tavshed:** hvert gate har et forventet sæt positive, OID-bundne verdikter; manglende/timeout/forkert binding = fail-closed BLOKER. Tavshed ≠ ja.
- **Læsebevis:** et verdikt tæller kun hvis det er indholds-afledt (citat findbart i artefaktet ved bundet OID, eller aktøren hentede selv via egen kanal).

## Forbygning — forbyg > fang
Detektion (gates · prover · troskab) er **sidste** forsvar; forbygning er **første** — reducerer fejl-raten ved kilden. Hver rolle bærer to pligter: **(a) verificér + forstå INPUT** (forrige lags artefakt ved dets OID) · **(b) forbyg i eget OUTPUT** — indlejret i rolle-skillsene (2.G), håndhævet af hooks (2.E). Konkret pr. fase i DEL III. **Ingen nye gates** — forbygning er praksis, ikke mere detektion.

## Docs — sprog/form (bord-deling)
Interne AI-flade-docs (recon · plan · kontrakter · skills · attack-specs · verdikter) skrives i **aktørernes eget sprog/form**. Kun **Mathias-flade** (krav-doc · recon-præsentation · gates · masterplan-diff) er i hans sprog. Mathias læser ikke det interne.

## Mathias' flader (hård constraint)
**Code-terminalen er hans ENESTE flade** (Mathias 2026-09-02; tidligere app+terminal — ændret for nemmere kommunikation på tværs af sessioner). Forretning + med-forfatterskab af krav sker i en **NY, FRISK Code-terminal-session pr. gate i claude-ai-rollen** (Mathias starter den selv og giver rolle-ord + binding). Gate-ord (`qwers` · `krav upload` · `krav ok` · `plan ok` · `slut ok`) fra hans mgrubak-session i terminalen. GitHub-Actions kører automatisk/usynligt — **han rører ALDRIG GitHub-UI.** *Ærligt tab (navngivet):* app-projektets chat-historik indgår ikke længere i krav-konteksten; kontekst = repo-docs + recon @ OID + Mathias live i sessionen.

## Konventioner
Repo-rod `/home/mathias/stork-implplan`. Refs = git-OIDs (`git rev-parse <sha>:<path>` / tree-oid — intet custom hash). U-committet indhold kan aldrig åbne en gate.

---

# DEL II — SUBSTRAT (mekanismerne · pakke-agnostisk)

## 2.A Gate-kernen — autoritet + evaluering (v4)
**Autoritet = CI's friske `evaluateGate` emitteret som required GitHub check-run `v5/gate/<id>`**, sat af gate-App'en (`stork-code-bot` har ikke `checks:write`). **Ingen committet fil er autoritet** — committede filer er evidens/arbejds-artefakter; CI re-evaluerer altid.

**Gate-registry** (eneste sandhed · PURE · schema/constants genereres herfra):
```
recon: pred=null   evidens = machineProof(recon-coverage)                          bindings = {anker(launch), bundle}
krav:  pred=recon  evidens = actors(code, codex) + approver(mgrubak, SIDST)        bindings = {recon, anker}
plan:  pred=krav   evidens = actors(code-reviewer, codex, claude-ai) + approver    bindings = {krav, recon2}
build: pred=plan   evidens = machineProof(build-proof)                             bindings = {plan}
slut:  pred=build  evidens = machineProof(chain-proof) + approver(mgrubak)         bindings = {plan, krav, build-proof}
```
Evidens-typen er **eksplicit pr. gate** — krav/plan kræver ingen machine-proof (deres bevis ER aktør-verdikter + approval); build er ren maskine.

**`evaluateGate(gateId, snapshot)` — PURE · re-deriverer ALT · fail-closed-by-default. Åben ⟺ ALLE:**
1. Artefakt + hver binding findes ved pinned commit (oid + type fra rå git — `GateSnapshot`; ingen "live vs HEAD"-matematik).
2. **Typed bundet bevis:** proof-resultat skal matche `{gate_id · proof_kind · artifact_oid · bindings_oids}` — et generisk `{ok:true}` kan IKKE åbne.
3. **Re-verifikation DETTE run:** `verifyProof`/`verifyVerdict` køres mod rå input — committede `ok`/booleans trustes aldrig.
4. **approver-gates:** server-side-verificeret `mgrubak`, bundet til `scopeDigest(artefakt-OID + bindings-OIDs)` (anti-replay). Krav-gaten kræver **orderedApproval**: approval SKAL referere de forudgående aktør-verdikt-digests → beviser Mathias kom SIDST (krav 5).
5. **actors-gates:** præcis ét verdikt pr. forventet aktør, hvert bundet som #2, `conclusion === 'PASS'` eksplicit (FAIL/HALT blokerer); uventet/ekstra → fail.
6. **Kæde:** forgængerens check er `success` OG indholds-bundet (`predecessor.artifact_oid === bindings[pred]` — et `{open:true}` uden indholds-match åbner intet).

- **Fail-closed-by-default schema:** manglende/tomt felt = RØD, aldrig sprunget over. Digest kanonisk (sorterede nøgler).
- **oid-binding, ikke commit_sha:** bindinger = artefakt-OIDs → forgænger-gyldighed overlever nye commits når opstrøms-OID er uændret; `commit_sha` = provenance. Stale er trivielt: nyt indhold = ny OID = nedstrøms gates lukkede til gen-evaluering.
- **Irreducibel tillid (ærligt navngivet):** at gate-App'en faktisk kørte evalueringen server-side = GitHub-App/Actions-tillidsroden; org-admin (= mgrubak) er uden for workflowet.

> **Bindende lektie (2026-06-26):** gate-kernens falsk-grøn-frihed kan IKKE bevises på papir — tre uafhængige Codex-passes fandt hver gang nye huller i "færdige" versioner. Derfor bygges kernen FØRST og red-teames STRAKS (DEL VI). Flere papir-runder på kernen er stoppet.

## 2.B Verdikt-kontrakten (aktør-evidens)
`verdikt/<gate>/<aktor>.json` — schema-valid (draft-2020-12 · `required` · `additionalProperties:false` · fail-closed; CI ignorerer fri prosa uden kontrakt):
`{schema_version, gate_id, aktor, artifact_oid, bindings_oids, input_oids_read, conclusion (PASS|FAIL|HALT), negative_cases, claim_graph_refs, evidence:[{commit_sha, path, blob_oid, line_span, excerpt_sha}], run:{run_id, run_attempt, raw_output_sha256, actor_server_id}}`
- **Læsebevis REELT (path-bundet):** pr. evidens-item verificeres `git rev-parse <commit_sha>:<path> === blob_oid` FØR span-hash — blobben ligger reelt på den citerede sti i den gatede commit (stale/orphan-blob afvist); citatet findbart ved OID (`git cat-file`, ikke regex).
- **Cardinality + anti-tavshed:** præcis ét pr. forventet aktør; fuldt sæt; timeout/manglende = BLOKER.
- **Server-provenance:** CI producerer verdikterne (`actor_server_id`) — bot kan ikke fabrikere aktør-identitet.

## 2.C De tre proofs
**recon-coverage (recon-gaten):** hvert punkt i **pakke-fladen** (den `flade_filter`-filtrerede derivation, 2.D — **filter PÅKRÆVET i bundlet; fravær = rød**) gjort rede for · 3 bøtter · kode-punkter ≠ `intet_data` · **3-blind-uafhængighed bundet** (samme bundle-OID · separat workdir · læseforbuds- + web-forbuds-attest · konflikt-bevaring hård: kasseret uenighed → fail) · **omission-devil grøn på BEGGE akser** (filteret HAR en dommer): (a) `filter_angreb` — angrib `flade_filter` mod den FULDE deriverede flade: er pakke-relevante punkter udeladt? (driver-forfattet scope-krympning må aldrig stå udømt) · (b) `pakke_flade_angreb` — find misset INDEN FOR pakke-fladen; begge attesteres eksplicit i proofen (manglende akse = rød).

**build-proof (build-gaten) — MEKANISK:**
- **Bijektion:** hvert K-n → bid → test, intet rogue-trin; bundet til angrebs-spec-OID pr. bid.
- **effect-harness pr. K:** testen går gennem **public entrypoint** (API/RPC/UI-flow) mod **real backing store / ikke-bypass DB-rolle** og observerer **hård slut-effekt** (state/event/DB-row) — aldrig en intern helper-return. RLS/`WITH CHECK` er effekt-adfærd, ikke tekst.
- **Negativer:** den **faktiske afvisnings-sti** udøvet (branch/path-coverage) pr. K-negativ.
- **config-mutant-kill:** for **hvert opsætnings-/konfig-/logik-K** (fra krav-acceptkriteriet): ≥1 targeted mutant DRÆBT (kill-list-eksempler: drop `WITH CHECK` · fjern tenant-predicate · flip role-check · skip state-guard · vend operator). Overlever mutanten → gate rød — en "findes"-test kan ikke overleve dette. Kill-listen skrives af **Codex** (angrebs-spec, før byg); tilstrækkeligheden **dømmes ved plan-gaten**.
- **claim_graph (proportional):** for høj-risiko- + sikkerheds-/penge-/rettigheds-K: `K → test → runtime-trace → source-anchor (re-verificeret mod rå git) → dræbt mutant → reviewer-claim`. Reviewer-claimet produceres ved **plan**-gaten (dommen ligger dér); **build bekræfter mekanisk** at anchoret blev EKSEKVERET og mutanten DRÆBT — claim uden eksekvering+kill = ugyldigt.
- **async_reviews:** PASS-review for ALLE forudgående bids, bundet til `base_oid` — build-gaten åbner ikke mens et sent angreb på N-1 kører; sent fund → cascade-STOP invaliderer N.
- **prover grøn** (reel kør; skipped/0-tests = rød). Bred mutation/PBT/fuzz kun ved høj-risiko-bids (planens risiko-flag).

**chain-proof (slut-gaten):** CI fetcher **held-out reel data EFTER build** (seedet af run-id; raw-source-digest + anonymiseret snapshot-digest = anti-tailoring stærkere end pre-kendt datasæt) + genererede negative canaries + metamorphic-/property-checks på kritiske invarianter + full-chain grøn ved fuld dybde (P5, alle K-n).

**Dybde — ærlig ansvarsdeling:** dybden **DESIGNES + DØMMES ved plan-gaten** (planner specificerer de dybe tests · Codex' angrebs-spec definerer mutanter/negativer · code-reviewer+codex-verdikterne dømmer at testene udøver logikken). **Build UDFØRER + BEKRÆFTER mekanisk** (eksekveret + dræbt) — ingen ny dom. Effect-harness + mutant-kill **MINDSKER** falsk-grøn-rummet mekanisk; de **TVINGER ikke** fuld dybde — resten er dømmekraft (DEL VII). *(v3's "dybde TVINGES mekanisk" var overclaim — rettet.)*

## 2.D Deterministiske dommere: prover + coverage
- `prover.mjs` — model-frit; reel kør mod **committede artefakter** (ikke fixtures); skipped/0-tests = rød. ("Kan testen fejle" sikres af negative-case-kravet + red-teamet — ingen separat liveness-selvtjek.)
- `coverage.mjs` — pakke-flade udledt **uafhængigt** (anker + statisk analyse: entrypoints/routes/RLS/migrations/config); `--check`: hvert flade-punkt gjort rede for. (Derivations-komplethed vogtes af omission-devil.)
- **Pakke-flade-filter (struktur, ikke disciplin — Mathias 2026-08-13):** den deriverede repo-flade indsnævres til **KUN det pakken berører** via `flade_filter.punkt_ids` i det OID-bundne bundle — en eksplicit, committet id-liste (driver forfatter fra ankeret; reviewbar; scopet bekræftes ved krav OK). `filterSurface` håndhæver mekanisk: **filteret er PÅKRÆVET for recon-gaten — fravær = rød** (eksplicit deklaration > default; en glemt deklaration må aldrig tavst blive til fuld-flade-støj ELLER intet krav) · malformet/ukendt id = rød (typo-værn) · dæknings-kravet i recon-coverage-proofen gælder den FILTREREDE flade. Filteret kan ikke ændres uden nyt bundle-OID → aktør-attesterne brydes synligt. **Filterets dommer = omission-devil'ens `filter_angreb`-akse (2.C)** — et for snævert filter er en falsk-grøn-kanal og står aldrig udømt.

## 2.E Enforcement — autoritet ved artefakt-grænsen (hooks = lokal UX)
**Platform-håndhævet (autoritet):** gate-App `checks:write`, **aldrig `contents:write`** (gate-state muterer ikke træet) · build/test-jobs `contents:read` · **måle-lag** (`scripts/v5/**` · `test/v5/**` · `.claude/**` · `.github/workflows/**`) via **rulesets/push-path-restrictions** — Code kan ikke skrive; Codex/CI ejer (*der måler ≠ der bygger*; Code må læse + køre) · required check `v5/gate/<id>` **source-locked** til gate-App'en · CODEOWNERS + branch-protection = backstop.
**Lokale hooks (friktion/UX, exit 2):** default-deny produkt-skriv før `plan-laast` · måle-lag-skriv-deny · sandhed-protect (AI skriver aldrig `docs/sandhed/` — ENESTE undtagelse: driver-flytten af krav-udkast til `docs/sandhed/krav/<pakke>-krav.md` på Mathias' `krav upload`-ord, byte-identisk, eksakt sti; Fase 2 pkt. 3) · **attack-spec-gate som state-machine:** før `plan-laast` → kun read-only tool-kald; efter → kun **driver-routede** build/prove-kald for **aktuel bid MED committet angrebs-spec**; direkte skriveveje uden om driveren → deny. Auto-fix-/"issue→PR"-makroer er ALDRIG i allowlisten (springer den gatede kæde over).

## 2.F Driver + `actors.lock` (provenance + transport)
decide/udfoer-split (genbrug `dirigent.mjs`-arkitektur, ny logik). **`actors.lock`** = låst registry `{role, provider, model, reasoning, skill_oid, allowed_tools, output_schema}` — **eksakt skill-OID, aldrig "latest"**. CI's actor-runner injicerer skill-bytes + returnerer **signeret `actor_run.json`** (faktisk model/skill/input-OIDs) → model+skill = **provenance**, ikke CLI-config. Driver pr. fase: invokér aktør → candidate → commit → trigger CI; **auto-dispatch** (kun krav/plan/slut OK afbryder — menneske); HALT → durabelt flag; lokal fejl → fix-loop (`/loop` + `/goal` turn-cap; **prover = eneste success**); uløst → `/rewind` + eskalér. Lokal = candidate; CI = autoritativ.

## 2.G Roller → verificerbare output-kontrakter
Hver rolle-skill kompilerer til en output-kontrakt (CI ignorerer fri prosa). **Alle:** forstå-før-producér · antag-aldrig → HALT · byg fra committet OID, ikke hukommelse. **Mandate-canary pr. rolle** i red-teamet (DEL VI).
- **code:** tre FRISKE sessioner — **recon-Code → planner-Code → builder-Code** (aldrig samme session to stadier). Builder: design fejlen UD (umulighed > korrekthed) · 1:1 · skriver aldrig måle-lag.
- **code-reviewer:** frisk ≠ byggeren; dybde-inspektion → `claim_graph_refs` (kun gyldig ved eksekveret + dræbt).
- **codex/ANGREB:** falsk-grøn-jagt, dybde intrinsisk (overfladisk test = falsk-grøn); ejer måle-laget; cross-vendor (gpt-5.5 xhigh); **ingen web**.
- **codex/FORBEDRING:** bedre alternativer (test/forbyg/dybde); **web TILLADT**; rådgivende — ingen gate; separat agent.
- **claude-ai:** forretnings-mening mod **låste** docs; med-forfatter af krav; ingen kode; kanal = frisk Code-terminal-session pr. gate i claude-ai-rollen (Mathias 2026-09-02; før: app).
- **recon-roller:** friske, blinde, separat workdir, **web FORBUDT**, evidens-trace pr. fund.

## 2.H `test-led`-skill (rygradens motor, anvendt pr. ⊨)
Givet led X⊨Y → producér **falsificerbar test/probe + citeret evidens**, aldrig en bar "✓". Deterministisk led → skriv/kør den eksekverbare check (**kør'en dømmer**). Semantisk led → citerede drift-fund (**Mathias/Claude.ai dømmer**). Aktøren er **input, aldrig dommer** (P3).

---

# DEL III — KÆDEN, FASE FOR FASE

## Fase 0 — Åbning
`qwers <anker>` (Mathias, terminal; author-bundet = mgrubak) → driver committer `launch/launch.json {anker, anker_sha, pakke, author}` (`PAKKE_RE=/^[a-z][a-z0-9-]*$/` — anti-traversal). **Ingen gate** — mindste tvivl om anker/scope → spørg Mathias; ellers starter Fase 1 automatisk. Ikke-bestilt anker kan ikke passere kæden (scopet bekræftes ved krav OK).

## Fase 1 — Recon → "hvad pakken berører" (føder krav)
Driveren bygger + committer **pakke-kontekst-bundlet** (anker + refererede docs + låste vision/forretning **+ `flade_filter`** = eksplicit pakke-flade-deklaration, 2.D) + udleder pakke-fladen (`coverage --derive` → `filterSurface`, 2.D). **Recon dækker KUN pakkens flade** — dæknings-kravet er den filtrerede flade, ikke hele repoet (Mathias 2026-08-13; aktør-dybden var altid pakke-scoped — det er KRAVET der er pakke-scoped som håndhævet struktur). **Tre friske, blinde aktører** (recon-Code · Codex · Claude.ai — separat workdir · læseforbud mod hinandens output · **web FORBUDT**) → hver sit candidate → `consolidate-recon` → ÉN OID-bundet `recon.md` (3 bøtter; **konflikt-bevaring HÅRD:** divergenser bevares med aktør-mærke, kun ægte dubletter dedupes, kasseret uenighed → BLOKER) → **omission-devil** (Codex, én pass; loop kun ved fund) — **to eksplicitte akser** (2.C): (a) angrib `flade_filter` mod den fulde deriverede flade (pakke-relevant punkt udeladt af filteret?) · (b) find misset inden for pakke-fladen.
**Gate `recon`** = machineProof `recon-coverage` (2.C). Doc: `recon.md` (AI-intern).
**Aftager-kæden definerer leverance-formen (struktur, ikke huskeregel — Mathias 2026-08-13):** recon-1's aftager er **krav-dokken** (HVAD pakken skal kunne — Mathias' bord via 3-bøtte-præsentationen) → `recon.md` organiseres som KRAV-føde: 3 bøtter, forretnings-oversætbart, hvert fund klar til disposition (behandlet/udskudt/ikke-relevant); GØR/AFVISER + negativer er krav-føde (→ acceptkriteriernes slut-effekt inkl. negativer). Mutation-/test-dybde-materiale er IKKE krav-føde — det gemmes som bilag/spor og konsumeres af **recon-2, hvis aftager er plan-dokken** (HVORDAN — kill-lists/angrebs-spec dømmes ved plan-gaten, Fase 3/4). Intet kasseres; det ligger blot hos sin aftager.
*Forbygning:* (a) forstå HELE bundlet ved OID; (b) kortlæg hele scope (ikke første-fund) · evidens-trace pr. fund · spørg v. uklarhed. **Fundamentet — fejl her forplanter sig nedstrøms.**

## Fase 2 — Krav (vision/forretning ⊨ krav) — Mathias godkender SIDST
1. **Handover:** Mathias starter en NY, FRISK Code-terminal-session i **claude-ai-rollen** (rolle-ord + binding: recon-commit + `recon/recon.md`). Sessionen læser recon DIREKTE ved OID fra git (stærkere læsebevis end app-sync; Mathias 2026-09-02). **Handover-HALT uændret:** binding verificeres FØR krav — stale/forkert/overfladisk → HALT (recon er committet/durabel). Sessionen **konsumerer** recon-dybden, tilføjer den ikke. Kontekst = repo-docs + recon @ OID + Mathias live (app-chat-historik indgår ikke — ærligt tab, DEL I).
2. **3-bøtte-præsentation:** nuværende kode ("x bygget sådan — korrekt?") / ikke-bygget/dokument ("dok y siger — korrekt?") / intet-data ("hvad skal x kunne?"). **Hvert berørt bord-område SKAL præsenteres** (udækket → FAIL); kun pakke-relevant (ingen støj). **Afled-før-spørg (Mathias 2026-09-02):** bøtte 3-spørgsmål forudgås af opslag i hans nedskrevne sandhed (låste docs + masterplan-afgørelser + kode) → afledte svar præsenteres til bekræftelse m. citat ("din sandhed siger X → foreslået Y — korrekt?"); kun ægte ubesvarede punkter stilles åbent. Afledt svar = forslag; hans bekræftelse = sandheden; afledningskilder inkl. mønster-analogi. Mathias dømmer forretning, ikke kode — håndhævet af **bord-testen** pr. spørgsmål: (a) kan kun Mathias svare? (b) kan han svare uden teknik-viden? Fejler ét → ikke et krav-spørgsmål; teknik-/model-forks noteres eksplicit som plan-fase-afgørelser (planner afgør i kravets ramme · Codex angriber · plan OK dækker) — flytter bord synligt, forsvinder aldrig tavst. Spørgsmål der består, stilles i **skarp form** (rolletekstens form-krav): én beslutning pr. spørgsmål (aldrig parentes-haler) · scenarie-form m. navngivne klienter/steder (aldrig meta-sprog) · svarbart med ét ord (udfald givet + anbefaling) · værdi-spørgsmål (enhed/længde/sats) = UI-konfig → bortfald; "forstår ikke" → omformulér, aldrig videre uden svar.
3. **Krav skrives:** Mathias + claude-ai-sessionen → hvert **K-n: HVAD** (forretnings-sprog, ingen kode) + **acceptkriterie = slut-effekt INKL. negativer**; bundet til recon-OID; **hvert recon-fund disponeret** (behandlet/udskudt/ikke-relevant). Sessionen skriver KUN **udkast**: `plan-build/<pakke>/krav-udkast.md` (AI-zone — sandhed-protect slækkes ALDRIG generelt). **Upload = driver-flyt på Mathias' ord** (`krav upload`, mgrubak i terminal): driveren kopierer udkastet **byte-identisk** til `docs/sandhed/krav/<pakke>-krav.md` + committer — committet krav-blob-OID SKAL == udkast-blob-OID (flyt, aldrig redigér; afvigelse → HALT). Hook-undtagelsen er PRÆCIS denne driver-rute (kun denne sti · kun med Mathias' upload-ord · kun byte-identisk). **Upload ≠ krav OK.** (Erstatter app-modellens upload-hash-transport — Mathias 2026-09-02.)
4. **Buildability:** Code + Codex afgiver verdikt (2.B) ad ÉN akse — *kan det kodes? er der huller?* — IKKE forretnings-merit. De **retter ALDRIG krav** — mangler → spørgsmål/forslag til Mathias → **nyt upload = ny runde**.
5. **krav OK = Mathias SIDST** (krav 5): `krav ok` i terminalen (mgrubak-autoritet). **Præ-betingelse på menneskesiden (Mathias 2026-09-02):** ok må kun bedes om efter FULD fremlæggelse af den komplette krav-doc i chatten, overskueligt og i hans sprog (formål · pr. K én linje HVAD + vigtigste negativ · UI-styret vs. hardkodet · ikke-i-scope · dispositioner · buildability-resultat); fil-reference ≠ fremlæggelse; nyt upload → ny fremlæggelse. orderedApproval-mekanikken uændret. **orderedApproval** binder til uændret krav-OID + refererer de forudgående verdikt-digests → rækkefølgen er bevist, ikke påstået. Krav **immutabelt** efter OK.

**Gate `krav`** = actors(code, codex) + approver(mgrubak, sidst). *Bevis:* test-led — Claude.ai (forretnings-mening mod låste docs; med-forfatterskabet ER pre-upload-trinnet). *Dommer:* Mathias.
**Krav-template** (`docs/sandhed/krav/<pakke>-krav.md` · Mathias-flade):
```
# <pakke> — krav-og-data   (Status: UDKAST|krav-laast · recon_oid · anker)
## Formål — hvad pakken leverer
## Krav — K-n: HVAD (forretnings-sprog, ingen kode) · Acceptkriterie (slut-effekt INKL. negativer)
## Recon-fund-dispositioner | flade_punkt | bøtte | disposition | krav-ref |
## IKKE i scope   ## Holdt mod låste docs
```
Regler: K-n uden acceptkriterie → FAIL · hvert recon-fund disponeret · kun HVAD.

## Fase 3 — Plan (krav ⊨ plan)
1. **recon-2:** frisk recon-Code + Codex mod krav-OID; genbruger recon-1 og **uddyber krav-drevet** (hvordan koden/opsætningen virker dér kravet skal bygges · mønstre · constraints · eksisterende tests). Web forbudt. Committet `recon2`-OID.
2. **planner-Code (FRISK — ≠ recon, ≠ builder)** skriver planen: **krav-ID-matrix** (bijektion) · **bid-opdeling** (afhængigheds-ordnet · prover-bevisbar størrelse · angrebs-spec-krav + risiko-flag pr. bid) · **design fejl-klasser UD** (constraints/types/RLS — umulighed > korrekthed) · repo-doc-tekst 1:1 · **de dybe tests specificeres HER** (effect-harness-form + kill-list pr. K).
3. **Codex angriber** opdelingen (ulogisk orden / hul / ikke-bevisbar / for stor) + planens dybde; iteration til angrebet er tømt. Krav-problem → retter IKKE krav → retur til Mathias (nyt krav-upload).
4. **Gate `plan`** = actors(code-reviewer, codex, claude-ai) + approver(mgrubak). **Dybde-dommen ligger HER:** aktør-verdikterne dømmer at de planlagte tests udøver den faktiske logik (build dømmer ikke igen). Krav-matrix mekanisk: K-n uden step+test → FAIL · plan-løfte uden bid → FAIL · rogue-trin → FAIL. **Plan-SHA låses.** Uløselig modsigelse mod låste docs → terminal STOP. Efter plan OK ændres planen aldrig tavst → HALT → ny plan-SHA → ny plan OK (git-historik = versionering).

**Plan-template** (`plan-build/<pakke>/plan.md` · AI-intern):
```
# <pakke> — plan   (krav_oid · recon2_oid · plan_sha · status)
## Krav-ID-matrix (bijektion) | K-n | bid | step(s) | test→slut-effekt inkl. negativer + kill-list |
## Bid-opdeling (afhængigheds-ordnet)
   Bid N: leverer K-n · afhænger af <—|bid> · prover-bevisbar · angrebs-spec up-front · risiko-flag
## Repo-doc-tekst 1:1 (forud-godkendte ```doc:<sti>```-blokke)
## Bro-bindinger: plan⊨krav · plan⊨vision/forretning · build⊨plan
```

## Fase 4 — Build (plan ⊨ build 1:1) — gate MEKANISK
1. **Codex skriver angrebs-spec FØR byg** (hård gate — attack-spec-state-machine, 2.E): de hårde + negative tilfælde + kill-list pr. K. Holdets fælles done-kriterier, ikke en skjult fælde.
2. **builder-Code (FRISK — konsumerer den LÅSTE plan-SHA, skrev den ikke)** bygger bid-for-bid **1:1 mod plan-teksten** — intet nyt besluttes. Læser + kører tests, skriver ALDRIG måle-lag (2.E).
3. **build-proof** (2.C): bijektion + effect-harness + afvisnings-sti-coverage + config-mutant-kill + claim_graph + async_reviews + prover grøn.
**Fejl-håndtering:** rød/modsigelse → HALT + durabelt flag · lokal fejl → fix-loop (prover = eneste success) · uløst → `/rewind` + eskalér · sent Codex-fund i N-1 → cascade-STOP (invaliderer N) · større nyopdaget scope → **teknisk gæld** (logges, løses korrekt senere — aldrig undskyldning for at gøre et rødt bid grønt); mindre → bilag. **P4:** fanget falsk-grøn lukkes kun med failing-first regressions-test.
**Gate `build` = MEKANISK** i CI (ingen Mathias-dom — HVORDAN er ikke hans bord når build er tro mod den godkendte plan).

## Fase 5 — Sandhed (build ⊨ sandhed v. fuld dybde)
CI fetcher **held-out reel data EFTER build** (anti-tailoring, 2.C) → chain-proof + full-chain prover ved fuld dybde (P5, alle K-n; ingen fixtures — omdøbt/kurateret fixture afvises).
**Gate `slut`** = machineProof(chain-proof) + approver(mgrubak — krav-rammen fuldt leveret, alle K-n).

## Fase 6 — Luk (doc-spor)
Under build kun arbejdsdoks (fokus = build). Efter build: repo-docs + masterplan **1:1 fra plan-teksten** (forud-godkendt — anvendes, fabrikeres ikke) · teknisk-gæld-diff opdateret · lukke-PR sletter arbejdsdoks (main = fulde spor, rent repo). **Masterplan-diff = Mathias-godkendelse ved luk** (doc-godkendelse, ikke en 4. kæde-gate). sandhed-protect: AI skriver aldrig `docs/sandhed/`.

---

# DEL IV — TVÆRGÅENDE

## Forløbs-troskab
Gate-rækkefølgen (registry-DAG + check-runs pr. commit) håndhæver fasernes orden + hver gates beviser; + **minimal append-only, actor-signeret worklog** (audit-spor). Separat manifest-validator droppet (redundant med gates).

## Genbrug — vejet
| Eksisterende | Dom | Hvorfor |
|---|---|---|
| CI-scaffolding (Actions · required checks · CODEOWNERS · branch-protection · husky) | Genbrug + fix | CI-som-dommer kræver CI-infra; fix skipped=green · marker-match · per-gate. |
| Adapter-transport (`code.sh`/`codex.sh`/`claude-ai-rolle.sh`/`mathias.mjs`) | Genbrug mønster + fix | Fix `--dangerously-skip-permissions` → måle-lag-isolation. |
| `dirigent.mjs` decide/udfoer + transport | Genbrug arkitektur, ny logik | Pure-decide + atomisk transport er sund plumbing. |
| `tilstand.mjs` git-state-parsers | Delvis genbrug | Git-parsing ja; marker-match-i-markdown → JSON-verdikter. |
| `fitness.mjs` + `migration-gate.mjs` | Genbrug | Deterministiske invariant-dommere. |
| Selftest-framework | Genbrug framework, nye tests | Harness genbruges. |
| `/workflow/` 24 kontrakter · roller · gate-def | Rebuild (udvind sunde sub-regler) | Encoder gammel uvalideret mekanik. |
| Marker-verdikter · per-gate-bug · skip-permissions · skipped=green | Rebuild/fix | Præcis det der gjorde flowet falsk-grønt. |

## Vejet FRA (anti-over-test)
| Mekanisme | Hvorfor ud |
|---|---|
| Multi-round recon-devil-til-tør | Én omission-pass + coverage; loop kun ved fund. |
| Separate dybde-/integrations-/fidelity-meta-canaries | Slut-effekt-test + full-chain + menneske-troskab dækker. |
| Blanket mutation/PBT/fuzz | Kun høj-risiko-bids; targeted config-mutant-kill pr. opsætnings-K er billig og bliver. |
| Liveness-selvtjek (prover · full-chain · held-out) | "Kan testen fejle" garanteres af negativ-krav + red-team. |
| Elaborate kontrol-dok + forløbs-manifest-validator | Gates kræver deres beviser; minimal worklog nok. |
| Separat model-gate | Driver pinner model+skill by construction (`actors.lock`, måle-lag-beskyttet, CI re-kører). |
| Committede gate-state-filer som autoritet | Erstattet af check-runs (2.A) — en bot-skrivbar fil kan aldrig være gate-autoritet. |

---

# DEL V — FORUDSÆTNINGS-FIX (røde i dag — før workflowet kan håndhæve)
1. `gate_ord`↔`gate-def`-afstemning (`plan OK`/`build OK` i motoren) + divergens-vogter.
2. CI mod **reelle committede artefakter** (ikke selftests/fixtures).
3. `workflow:selftest`-rød på `main` fikset.
4. **GitHub-rettighedsmodel:** gate-App `checks:write` (aldrig `contents:write`) · jobs `contents:read` · rulesets på måle-lags-stier · required check source-locked · app-adgang ved privat repo (Actions-minutter + re-grant).
5. **Mappe-migration:** krav-doc fra `docs/coordination/*` → `docs/sandhed/krav/` + reference-rewrite + CODEOWNERS på både gamle og nye stier indtil cutover — **ÉN bevægelse**, FØR enforcement (2.E) kan påstås live.

---

# DEL VI — BYGGERÆKKEFØLGE + RED-TEAM (accept-kriteriet)

**Rækkefølge (når Mathias siger byg):**
1. Forudsætnings-fix (DEL V).
2. **Gate-kernen (2.A+2.B) + dens per-mekanisme-red-team STRAKS** — kernen bevises kun på maskine (bindende lektie, 2.A).
3. Resten af substratet (proofs · prover · coverage · enforcement · driver · rolle-skills) + selftests.
4. Fase 0–2-wiring. 5. Fase 3. 6. Fase 4. 7. Fase 5–6.
8. **Fuldt red-team end-to-end** — først her er workflowet skudsikkert (workflowets eget slut OK; P5 på sig selv).

**(a) Per-mekanisme-bevis** — hver load-bearing mekanisme demonstreres at gøre sit job:
`evaluateGate` nægter uden bundet bevis · generisk `{ok:true}` afvist (forkert gate/artifact-oid) · tomt/manglende felt = rød (fail-closed-schema-test) · check-run fra forkert app afvist (source-lock) · ruleset blokerer Code-skriv til måle-lag · **mutation-survival fanger en "findes"-test** (plantet mutant overlever → rød) · claim uden eksekvering+kill afvist · anti-tavshed blokerer manglende/forfalsket verdikt · path-binding afviser orphan-blob-citat · handover-HALT blokerer krav på stale recon · coverage flagger sprunget flade-punkt · prover rød på plantet dyb fejl.

**(b) Falsk-grøn red-team end-to-end + mandate-canary pr. rolle** — plant bevidst, SKAL blokeres ved rette gate:
shallow test der består men misser negativen (→ mutant-kill) · forfalsket verdikt/approval (→ server-provenance/orderedApproval) · stale recon-OID (→ handover-HALT) · Code ændrer måle-lag (→ ruleset) · reviewer citerer ikke-eksekveret kode (→ claim_graph) · recon taber et berørt område (→ scope-coverage) · byg uden committet angrebs-spec (→ attack-spec-gate) · krav OK før aktør-verdikter (→ orderedApproval).
Hver canary = seeded negativ fixture; gaten SKAL gå rød. Alle bestået → **skudsikker**. Testene er selv forståelses-baserede (udøver mekanismens faktiske logik, ikke dens beskrivelse).

---

# DEL VII — ÆRLIGE RESIDUALER (ikke fake-fixet)
- **Semantisk forretnings-troskab** (krav⊨vision korrekt, ikke kun citeret) — Mathias + Claude.ai.
- **Ukendt-ukendt recon-komplethed** — omission-devil + Mathias krymper; residual.
- **Dybde-fuldstændighed** — effect-harness + mutant-kill mindsker mekanisk; fuld sti-dækning er ikke deterministisk; rest = plan-gatens dom + prover.
- **Internt-komplet vs. eksternt-forkert bijektion** (krav forkert splittet/udvandet) — Mathias + Claude.ai.
- **Claude-terminal-session som menneske-led** (før: app; Mathias 2026-09-02) + **GitHub-App/Actions som root-of-trust** — enforcement-selftest verificerer at config er live; org-admin (mgrubak) uden for workflowet, navngivet.
- **Aktør-dommens korrekthed** — kernen verificerer PASS + reelle citater, IKKE at dommen er rigtig (P3-residual; derfor cross-vendor + menneske-gates).

---

# DEL VIII — AFGJORT (beslutningslog)
1. **Genbrug vejet** (sund plumbing genbruges · falsk-grøn-mekanik bygges på ny).
2. **Recon i terminal** (`claude -p`/`codex exec`); **krav i NY frisk Code-terminal-session i claude-ai-rollen** (Mathias 2026-09-02 — før: Claude.ai-appen; ændret for cross-session-kommunikation. Udkast i AI-zone, upload = driver-flyt på Mathias' ord, byte-identisk).
3. **CI = autoritativ dommer**; lokal = candidate-only.
4. **test-led-skill** pr. ⊨; aktør = input, dommer = deterministisk/menneske.
5. Trace = committede OID-bundne artefakter.
6. **Gate-autoritet = check-runs fra gate-App'en** — aldrig committede filer (v4-kernen).
7. **Krav-rækkefølge: Mathias godkender SIDST** (krav 5) — upload ≠ krav OK; orderedApproval beviser rækkefølgen.
8. **build OK = mekanisk**, ikke Mathias-gate.
9. **Mathias rører aldrig GitHub-UI**; hans flade = Code-terminalen (app udgået 2026-09-02, se pkt. 2).
10. **Papir-runder på gate-kernen er stoppet** — dens bevis er byg + red-team (DEL VI pkt. 2).
