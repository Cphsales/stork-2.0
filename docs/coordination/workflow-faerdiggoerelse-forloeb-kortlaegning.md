# Workflow-færdiggørelse — forløbs-kortlægning (Step 1)

**Type:** Step 1 — kortlægning af HELE byg-workflowet, bid-for-bid, fra `qwers` til `slut OK`.
**Status:** UDKAST — intet bygges. Til fælles grundig læsning (Mathias + Code) + løbende Codex-hole-shooting. Step 2 = hvordan hvert element sættes op.
**Grundlag:** krav-dok (de 11 krav) · vision + forretning (låste) · masterplan. Aftalt krav 5-model står som sandhed via Mathias' ord (PR #178 ikke merget — vi fortsætter uden merge).
**Acceptkriterie for step 1:** alle elementer er med, hvert lille step står konkret (hvem/hvad aktiveres · hvad det aktiverer · hvad det samler · hvad det skal kunne), og kæden hænger sammen uden huller.

## Læsenøgle (felter pr. step)

- **Aktiveres af** — hvad sætter dette step i gang
- **Hvem/hvad** — aktøren/elementet der kører
- **Aktiverer** — hvad dette step selv sætter i gang
- **Gør / samler** — hvad der sker / hvad det producerer eller konsoliderer
- **Skal kunne** — kravet (hvad elementet skal kunne — krav-reference)
- **Mekanisme** — hvad guider + håndhæver (mekanisk = deterministisk · dømmekraft = bundet til mekanisk gate)
- **Anti-snyd** — hvad gør falsk-grøn / kæde-hop umuligt her
- **→ næste** — hvad det giver videre

Aktør-noter: **Code** = lokal builder/driver i terminal · **Codex** = lokal, kørt af Code (`codex exec --ephemeral`, model_reasoning_effort=xhigh) · **Claude.ai** = `claude -p`-rolle under recon + app'en (Mathias' hånd) ved krav · **Mathias** = gates + definerer hensigt.

---

## FASE 0 — Åbning

### S0.1 — qwers
- **Aktiveres af:** Mathias.
- **Hvem/hvad:** Mathias skriver `qwers <pakke>` på kæde-issue #126.
- **Aktiverer:** GitHub-event på #126 → dirigenten.
- **Gør:** registrerer pakke-åbning.
- **Skal kunne:** starte hele workflowet med ÉN simpel prompt (krav 9).
- **Mekanisme:** GitHub issue-event (mekanisk) + author-verificering (kun `mgrubak`).
- **Anti-snyd:** forkert author → IGNORÉR (fail-closed); ingen anden kan åbne pakken.
- **→ næste:** dirigent-dispatch (S0.2).

### S0.2 — Dirigent dispatcher
- **Aktiveres af:** #126-event.
- **Hvem/hvad:** dirigent (`scripts/kaede/dirigent.mjs` + `kaede-regler.json`).
- **Aktiverer:** de tre lokale AI-aktører via adaptere.
- **Gør:** sætter aktiv pakke; loader pakke-kontekst (krav-dok som forretnings-doc for pakken); sætter read-only recon-mode.
- **Skal kunne:** aktivere ALLE tre aktører (ikke kun én) deterministisk (krav 9).
- **Mekanisme:** deklarativ event-transport, fail-closed; `gate_ord`-genkendelse.
- **Anti-snyd:** `qwers` aktiverer ikke alle tre → FAIL; transport auto-validerer (krydser ind i dømmekraft) → FAIL.
- **→ næste:** recon-fase (S1.x).

### S0.3 — Aktørerne vågner (frisk pr. bid)
- **Aktiveres af:** dirigent-dispatch.
- **Hvem/hvad:** Code · Codex (`codex exec --ephemeral` via Code) · Claude.ai (`claude -p`), hver i frisk, statsløs session.
- **Aktiverer:** hver aktør loader sin **workflow-rolle-tekst** (fra sin skill) frisk.
- **Gør:** etablerer roller + grænser før arbejde.
- **Skal kunne:** to rolle-typer pr. AI-aktør (workflow / almindelig), Mathias styrer via prompt (krav 7).
- **Mekanisme:** rolle-tekst i skill (frisk-load) + **capability-tjek ved session-start** (er skills/hooks/loop aktive? `/skills` `/doctor`) + hook der garanterer rigtig rolle/freshness.
- **Anti-snyd:** forkert-rolle-kanariefugl (forkert rolle-tekst → aktøren SKAL afvise/fejle højt); manglende capability → fejl højt, ingen tavs antagelse.
- **→ næste:** recon-indsamling.

---

## FASE 1 — Recon (forretnings-grundlag, FØR krav)

### S1.1 — Kode-recon #1 (Code)
- **Aktiveres af:** S0.3.
- **Hvem/hvad:** Code.
- **Gør / samler:** kortlægger hvad koden faktisk gør i den berørte flade; producerer recon-fund i recon-output-skema `{kilde, kategori, emne, evidens-ref, aktør, klassifikation}`.
- **Skal kunne:** fuld recon — kortlægger HELE scope, stopper ikke ved første fund (krav 4).
- **Mekanisme:** read-only mode + grundig-recon-kontrakt.
- **Anti-snyd:** recon der stopper for tidligt / mangler kilde → FAIL.
- **→ næste:** konsolidering (S1.4).

### S1.2 — Kode-recon #2 (Codex)
- **Aktiveres af:** S0.3.
- **Hvem/hvad:** Codex (lokal, `--ephemeral`). **Bemærk: 2× kode-recon (Code + Codex), ikke angreb** — fordi koden er stor og kompleks, giver to uafhængige kode-recons (cross-vendor) bedre dækning end én recon + ét angreb.
- **Gør / samler:** uafhængig kode-recon i samme skema; cross-vendor dækning.
- **Skal kunne:** uafhængig af Code's recon (egen frisk session, eget blik).
- **Mekanisme:** `codex exec --ephemeral` (frisk pr. kald, ingen state-genbrug).
- **Anti-snyd:** resumed/stale Codex-session → rød (frisk-princip brudt).
- **→ næste:** konsolidering (S1.4).

### S1.3 — Docs-/forretnings-recon (Claude.ai)
- **Aktiveres af:** S0.3.
- **Hvem/hvad:** Claude.ai via `claude -p` (recon-rolle).
- **Gør / samler:** læser styrende docs (vision, forretning, masterplan-relevante dele, krav-historik, aktive Mathias-afgørelser); forretnings-vinklen.
- **Skal kunne:** ramme "hvad Stork skal være", ikke kun "hvad koden gør" (krav 4); levere i samme skema.
- **Mekanisme:** `claude -p` frisk rolle + dokument-recon mod aktive sandheder (ikke hele historik — støjbudget).
- **Anti-snyd:** recon uden dokument-recon af styrende docs → FAIL.
- **→ næste:** konsolidering (S1.4).

### S1.4 — Konsolidering til ÉN sandhed
- **Aktiveres af:** alle tre recons færdige.
- **Hvem/hvad:** transport (mekanisk fletning).
- **Aktiverer:** angrebs-funktionen (først NU brugbar — S1.5).
- **Gør / samler:** fletter de tre aktør-recons via recon-output-skemaet → dedup + støjbudget → **ÉN committet, hash-bundet recon-sandhed**.
- **Skal kunne:** ingen pakke bygger på divergent grundlag; alle aktører binder til recon-hash'en (krav 4).
- **Mekanisme:** mekanisk fletning + hash-binding.
- **Anti-snyd:** u-konsolideret / divergent recon (ikke recon-hash-bundet) → BLOKER; aktør bundet til anden recon-version → BLOKER.
- **→ næste:** omission-angreb (S1.5).

### S1.5 — Omission-angreb (første brug af angreb)
- **Aktiveres af:** S1.4 (én sandhed eksisterer).
- **Hvem/hvad:** Codex (angriber-rolle).
- **Gør:** finder hvad reconen MISSEDE (dæknings-huller) på den konsoliderede sandhed.
- **Skal kunne:** krympe unknown-unknown; afgrænse komplethed (kan ikke bevises, kun afgrænses).
- **Mekanisme:** adversarisk review + struktureret coverage-mapping (forretningsdele × viewpoints).
- **Anti-snyd:** fund → tilbage til S1.4 (re-konsolidér); residual ukendt-ukendt navngives ærligt, ikke skjules.
- **→ næste:** Mathias-præsentation (S1.6).

### S1.6 — Recon præsenteres for Mathias (3-bøtte)
- **Aktiveres af:** konsolideret + angrebet recon.
- **Hvem/hvad:** Claude.ai oversætter; Mathias validerer.
- **Gør / samler:** fremlægger "pakken berører disse forretningsdele" i tre bøtter: **nuværende kode** ("x er bygget sådan — korrekt?") · **ikke bygget/dokument-info** ("x bygges, doc siger y — korrekt?") · **intet data** ("x berøres, intet data — hvad skal x kunne?").
- **Skal kunne:** Mathias dømmer på forretning, ikke kode (krav 6); recon i præcis tre kategorier.
- **Mekanisme:** Mathias-kommunikationskontrakt (kun "hvad") + recon-præsentationskontrakt.
- **Anti-snyd:** hvordan/kode til Mathias → FAIL; ikke-3-kategori-output → FAIL.
- **→ næste:** krav-skrivning (S2.x).

---

## FASE 2 — Krav (Mathias + Claude.ai på app'en)

### S2.1 — Claude.ai-app aktiveres frisk
- **Aktiveres af:** Mathias (efter recon-validering).
- **Hvem/hvad:** Mathias åbner Claude.ai i app'en, ny chat.
- **Aktiverer:** auto-sync fra GitHub-marketplace.
- **Gør / samler:** app'en henter docs + skills automatisk (testet 2026-06-18).
- **Skal kunne:** Claude.ai er kontekst-frisk uden manuel paste.
- **Mekanisme:** `.claude-plugin/marketplace.json` + app-sync (forudsætter app har repo-adgang — privat repo kræver re-grant).
- **Anti-snyd:** manglende sync → app fejler synligt ("manifest not found"), ikke tavs gammel kontekst.
- **→ næste:** krav-medforfatterskab (S2.2).

### S2.2 — Krav skrives (kun HVAD)
- **Aktiveres af:** S2.1.
- **Hvem/hvad:** Mathias + Claude.ai sammen.
- **Gør / samler:** skriver krav-doc: **funktioner tydeligt beskrevet ved HVAD de skal kunne** + acceptkriterie + krav-ID (`K-n`). HVORDAN (teknisk) er Code/Codex' bord — ikke i kravet.
- **Skal kunne:** Claude.ai's fornemmeste opgave — medforfatter + nuværende-build-vs-ønsker-sammenligning (krav 2); alt i forretnings-sprog (krav 6).
- **Mekanisme:** krav-medforfatter-kontrakt; krav holdt mod LÅSTE vision/forretning ved SKABELSE.
- **Anti-snyd:** krav der driver fra vision/forretning → FEEDBACK til Mathias; kode/hvordan i kravet → hører ikke hjemme; krav-ID uden acceptkriterie → FAIL.
- **→ næste:** Mathias-godkendelse pre-upload (S2.3).

### S2.3 — Mathias godkender + Claude.ai uploader
- **Aktiveres af:** færdigt krav-udkast.
- **Hvem/hvad:** Mathias + Claude.ai.
- **Gør:** Mathias og Claude.ai **godkender krav-doc sammen FØR upload** (= Mathias' godkendelse, krav 5); Claude.ai **uploader** krav-doc til GitHub.
- **Skal kunne:** Mathias' ord er overordnet og kan altid overrule (krav 5, ny model).
- **Mekanisme:** upload = committet artefakt (krav-hash); upload-event.
- **Anti-snyd:** ingen krav-doc kan gå videre uden Mathias' pre-godkendelse.
- **→ næste:** indvendings-vindue (S3.x).

---

## FASE 3 — Krav-godkendelse (indvendings-vindue)

### S3.1 — Upload trigger kode-aktørerne
- **Aktiveres af:** krav-upload-event.
- **Hvem/hvad:** GitHub Action → Code (+ Codex via Code).
- **Gør:** aktiverer Code/Codex til at læse krav-doc via egen kanal, bundet til krav-hash.
- **Skal kunne:** ekstern aktivering, kører af sig selv (krav 9).
- **Mekanisme:** GitHub event→Action (cloud, abonnement/OAuth for Claude); committet artefakt = uforfalskeligt.
- **Anti-snyd:** aktør uden egen læsekanal → gate BLOKERET (ikke bind på stale state).
- **→ næste:** djævel + indvending (S3.2).

### S3.2 — Djævel + indvendings-vindue
- **Aktiveres af:** S3.1.
- **Hvem/hvad:** Code + Codex (djævlens-advokat-rolle).
- **Gør:** djævlens-advokat-pass pr. berørt krav FØR evt. indvending (minimumslæsning · stærkeste læsning · kan planen snyde sig til grønt · hvilken canary forhindrer snyd · hvad "ikke færdig" betyder).
- **Skal kunne:** mekaniske krav-huller fanges af en anden aktør, ikke af Mathias (krav 3/5).
- **Mekanisme:** djævlens-advokat-kontrakt; **ingen-indvendinger = fuldt godkendt** (Mathias' pre-godkendelse står); indvendinger → tilbage til Mathias (+ Claude.ai retter).
- **Anti-snyd:** approval/lukning uden registreret djævel-artefakt → hook BLOKERER; hash-mismatch → BLOKER.
- **→ næste:** krav-gate lukkes (S3.3).

### S3.3 — krav OK (gate-state)
- **Aktiveres af:** ingen indvendinger (eller Mathias lukker efter rettelse).
- **Hvem/hvad:** Mathias (ord) + dirigent (registrering).
- **Gør:** gate-state sættes `krav-laast`; krav-hash er den immutable gatede identitet.
- **Skal kunne:** næste led må ikke fortsætte før ordet er registreret.
- **Mekanisme:** committet gate-state + dirigent læser `gate_ord` (**forudsætter `krav OK` i gate_ord — findes**).
- **Anti-snyd:** spring forbi gate uden registreret ord → blokeret.
- **→ næste:** plan-fasen (S4.x).

---

## FASE 4 — Plan (kode-recon FØR plan, så plan)

### S4.1 — Kode-recon #2 (før plan)
- **Aktiveres af:** `krav OK`.
- **Hvem/hvad:** Code + Codex (2× kode-recon igen, mod krav-hash).
- **Gør / samler:** kodepåvirkning + dokument-recon af krav + vision/forretning + masterplan + S15-inventory → konsolideret recon-sandhed-2 (rummer recon-1 + krav + kode-recon).
- **Skal kunne:** plan passer vision+forretning+krav, ikke kun kodebasen (krav 4).
- **Mekanisme:** samme recon-funktion + konsolidering + hash-binding.
- **Anti-snyd:** kode-recon mangler før plan (plan skrevet uden den) → FAIL.
- **→ næste:** plan-skrivning (S4.2).

### S4.2 — Plan skrives (hele kæden, 1:1 med build)
- **Aktiveres af:** S4.1.
- **Hvem/hvad:** Code skriver; Codex angriber.
- **Gør / samler:** plan-kontrakt, hele kæden gennemtænkt; **bid-opdeling af build besluttes HER (plan-udbygning)**.
- **Skal kunne:** **plan 1:1 med build** (Mathias-krav); hver tekstbåren funktion → test der følger tråden til slut-effekt, ikke artefakt-eksistens.
- **Mekanisme:** ingen-byg-før-plan-OK via **hook** (PreToolUse exit-2 — plan-mode er ikke pålidelig offentlig gate); **krav-ID-matrix** (hvert `K-n` → plan-step + test) + **løfte↔bevis-bijektion** (hvert plan-løfte → præcis én canary/prover).
- **Anti-snyd:** byg-forsøg før plan OK → hook BLOKERER; `K-n` uden step/test → FAIL; plan-løfte uden bevisende canary → rød; build-adfærd uden plan-løfte → "rogue".
- **→ næste:** Codex troskabs-angreb (S4.3).

### S4.3 — Troskabs-angreb på planen
- **Aktiveres af:** plan-udkast.
- **Hvem/hvad:** Codex (+ Claude.ai menings-troskab).
- **Gør:** finder hvor plan modsiger krav / krav modsiger vision/forretning; overclaim; teknisk-løsning-forklædt-som-kravopfyldelse.
- **Skal kunne:** **Code/Codex ejer at deres plan/kode leverer hensigten** (deres bord); Claude.ai kryds-tjekker mening; Mathias endelig.
- **Mekanisme:** troskabs-angriber-kontrakt + Claude.ai sætning-for-sætning mod låste docs; **troskabs-meta-canary** (plant modsigelse mod vision/forretning → SKAL fanges, ellers tjek selv falsk-grøn).
- **Anti-snyd:** uadresseret troskabs-fund → BLOKER.
- **→ næste:** plan-gate (S5.x).

---

## FASE 5 — Plan-gate

### S5.1 — Plan frosset + 4-aktør-binding
- **Aktiveres af:** plan klar.
- **Hvem/hvad:** Code + Codex + Claude.ai på samme plan-SHA; Mathias sidst.
- **Gør:** plan frosset som plan-SHA; tre AI-verdikter binder til plan-SHA + krav-hash via egen kanal; djævel-pass FØR hver approval.
- **Skal kunne:** kumulativ kæde-troskab — plan⊨vision+forretning+krav (krav 2).
- **Mekanisme:** plan-SHA-binding; gate-check (approval matcher aktuel SHA); stale-stop.
- **Anti-snyd:** stale-SHA → BLOKER; aktør uden egen kanal → BLOKER.
- **→ næste:** Mathias plan OK (S5.2).

### S5.2 — plan OK (gate-state)
- **Aktiveres af:** tre AI-approvals.
- **Hvem/hvad:** Mathias (sidst).
- **Gør:** Mathias `plan OK`; gate-state `plan-laast`. Modsigelse mod krav/vision/forretning → **STOP → Mathias + Claude.ai retter** før videre.
- **Skal kunne:** Mathias godkender sidst på plan (krav 5).
- **Mekanisme:** committet gate-state + dirigent (**forudsætter `plan OK` afstemt ind i `gate_ord` — mangler i dag**).
- **Anti-snyd:** AI retter aldrig selv en modsigelse mod styrende docs.
- **→ næste:** build OK (S6).

---

## FASE 6 — Build OK

### S6.1 — build OK (eksplicit, før byg)
- **Aktiveres af:** `plan OK`.
- **Hvem/hvad:** Mathias.
- **Gør:** Mathias `build OK` eksplicit, før byg; gate-state `build-laast`.
- **Skal kunne:** intet bygges/merges før dette ord (krav 9).
- **Mekanisme:** committet gate-state + **hook** (byg-tool-kald før `build OK` → exit-2 BLOKERER); **forudsætter `build OK` afstemt ind i `gate_ord` — mangler i dag** (kun i `workflow/gate-def.json`).
- **Anti-snyd:** byg-forsøg før `build OK` → hook BLOKERER; `gate_ord`↔`gate-def` divergens → BLOKER.
- **→ næste:** build-bider (S7.x).

---

## FASE 7 — Build (bid-for-bid pr. skive)

### S7.1 — Friskhed pr. bid
- **Aktiveres af:** `build OK` / forrige bid færdig.
- **Hvem/hvad:** Code (+ freshness-skill).
- **Gør:** loader tynd pakke-kontrakt frisk (ikke hele korpus).
- **Skal kunne:** kvalitet = input; ingen drift fra lange docs.
- **Mekanisme:** freshness-skill + hook der garanterer kontrakt present (mangler/stale → bid fejler højt).
- **→ næste:** angrebs-spec (S7.2).

### S7.2 — Codex skriver angrebs-spec FØR byg (test-first)
- **Aktiveres af:** S7.1.
- **Hvem/hvad:** Codex.
- **Gør:** definerer "done" op-front som de hårde canaries skiven skal overleve.
- **Skal kunne:** input, ikke review (bryder turn-skift; kører parallelt).
- **Anti-snyd:** byg uden forudgående angrebs-spec → ingen defineret "done".
- **→ næste:** byg (S7.3).

### S7.3 — Code bygger skiven
- **Aktiveres af:** angrebs-spec.
- **Hvem/hvad:** Code.
- **Gør:** bygger for at dræbe canaries; HVORDAN er Code's bord, men koden skal levere kravets HVAD efter hensigten.
- **Skal kunne:** funktioner skal VIRKE og være gode, ikke kun se gode ud (krav 1).
- **→ næste:** prover + angreb (S7.4–S7.6).

### S7.4 — Codex angriber forrige skives reelle kør (async)
- **Aktiveres af:** forrige skive committet.
- **Hvem/hvad:** Codex (lokal, `--ephemeral`), parallelt.
- **Gør:** adversarisk review + snydevej-check på den reelle kør (via #126-artefakt-bus).
- **Mekanisme:** pipeline — skive N bygges mens N-1 angribes; eneste sync = prover-verdikt + Mathias-gate.
- **→ næste:** prover (S7.5).

### S7.5 — To-sidet prover (model-frit verdikt)
- **Aktiveres af:** byg færdig.
- **Hvem/hvad:** prover (deterministisk, ingen model); Codex planter, Mathias ser rød.
- **Gør:** reel kør der **(a) går RØD på den plantede hårde (dybe) fejl OG (b) GRØN på baseline** — samme kør.
- **Skal kunne:** grøn = reel konsekvens, ikke påstand; fangsten af fejl afgør korrekthed (krav 3).
- **Mekanisme:** to-sidet bevis + **meta-canary** (plantet fejl i selve prover-mekanikken → skal fanges); Code rører aldrig egen prover; **CI kører mod RIGTIGE committede artefakter, ikke fixtures/selftests** (Build 1's synd).
- **Anti-snyd:** en prover der aldrig kan gå rød → meta-canary afslører den; syntetisk/fixture-bevis → forbudt.
- **→ næste:** dybde-tjek (S7.6).

### S7.6 — Dybde-tjek (krav bid-for-bid ned gennem hele koden)
- **Aktiveres af:** prover grøn.
- **Hvem/hvad:** Code + Codex (deres bord).
- **Gør:** tager kravet **bid for bid** og løber **ned gennem hele koden** til slut-effekt — ikke kun kodens første lag.
- **Skal kunne:** helheden af funktion/kode tjekkes mod krav, ikke artefakt-eksistens.
- **Mekanisme:** test-dybde-kontrakt; **SHA-bundet dybde-artefakt pr. krav** (hvad blev fulgt ned, hvilken slut-effekt bekræftet); **dybde-meta-canary** (fejl plantet DYBT → SKAL fanges, ellers kiggede tjekket kun på lag 1 = selv falsk-grøn).
- **Anti-snyd:** "doc-/første-lags-check grøn" beviser ikke funktion → afvises.
- **→ næste:** troskab + advance (S7.7).

### S7.7 — Kontinuerlig troskab (build ⊨ hele kæden)
- **Aktiveres af:** løbende, hver ændring.
- **Hvem/hvad:** Codex troskabs-angriber + Claude.ai menings-troskab.
- **Gør:** build⊨plan · plan⊨krav · krav⊨vision/forretning, diff-bundet ved hver ændring.
- **Skal kunne:** tro hele vejen (krav 2); modsigelse → **STOP → Mathias + Claude.ai retter** (ikke AI alene).
- **Mekanisme:** diff-bundet re-validering + troskabs-meta-canary; **always-on-floor** (SHA-binding/egen kanal/krav-ID/gate-state/stale-stop) scaler aldrig ned.
- **→ næste:** advance / fix-loop (S7.8).

### S7.8 — Loop-driver + fix-loop
- **Aktiveres af:** prover-verdikt.
- **Hvem/hvad:** `/loop` (intra-bid driver), Code.
- **Gør:** grøn+bevist → advance; fejl → afgrænset fix-loop (`/loop` driver, bound = `/goal` "stop efter ~N ture", **hård success = proveren** — ikke /loops bløde "done"); uløst → `/rewind` til sidst-beviste state, eskalér.
- **Skal kunne:** drive biderne uden at agenten selv-erklærer "færdig".
- **Mekanisme:** `/loop` (bundlet skill — capability-tjek) + `/goal` turn-cap + `Stop`-hook (hård) + prover som success.
- **Anti-snyd:** loop der stopper på egen blød "done" → forbudt; success ER proveren.
- **→ næste:** næste skive eller acceptance.

---

## FASE 8 — Acceptance / slut-gate

### S8.1 — Fuld-kæde reel kør
- **Aktiveres af:** sidste skive bevist.
- **Hvem/hvad:** Code + Codex; prover.
- **Gør:** kører hele kæden på reel committet testpakke **UDEN fixtures**; alle hårde canaries døde; **integrations-canary** (plantet brud i en håndover mellem to mekanismer — recon→krav, krav→plan, kæde↔workflow, skill↔hook, gate→advance — SKAL fanges).
- **Skal kunne:** beviser at gearene griber ind i hinanden, ikke kun at hvert gear virker isoleret.
- **Mekanisme:** reel acceptance (structural ≠ acceptance); alle F-ID med runtimeProof.
- **Anti-snyd:** syntetisk acceptance (fixtures) → forbudt (Build 1's fejl); ufanget canary → BLOKER.
- **→ næste:** slut-verdikt (S8.2).

### S8.2 — slut OK
- **Aktiveres af:** acceptance grøn.
- **Hvem/hvad:** Code + Codex + Claude.ai (slut-troskab) → Mathias sidst.
- **Gør:** slut⊨vision+forretning+krav+plan; **krav-rammen tjekkes opfyldt** (alle `K-n` leveret + bevist — det er definitionen på "v5 færdigt"); Mathias `slut OK`.
- **Skal kunne:** færdig = krav-rammen opfyldt, bevist på et reelt trin.
- **Mekanisme:** committet gate-state `slut`; promise↔proof-bijektion lukket.
- **Anti-snyd:** krav-rammen ikke fuldt opfyldt → ikke slut OK.
- **→ næste:** doks efter build (S9).

---

## FASE 9 — Doks efter build

### S9.1 — Opdater afledte docs
- **Aktiveres af:** `slut OK`.
- **Hvem/hvad:** Code.
- **Gør:** opdaterer **masterplan + tekniske docs** (kode-gæld / G-numre / andet) til at afspejle det byggede; repo-hygiejne (én aktiv sandhed; midlertidige artefakter arkiveres).
- **Skal kunne:** main efterlades som fuldt spor (krav 8); masterplan styrer retning og opdateres (krav 10, ændringer = Mathias-gate).
- **Anti-snyd:** **dine sandheds-docs (vision + forretning) rettes ALDRIG her** — de er ankeret; konkurrerende aktiv sandhed → BLOKER.
- **→ næste:** pakke lukket.

---

## TVÆRGÅENDE — gælder hele forløbet

**Mekaniske håndhævere (deterministiske):**
- Hooks (PreToolUse/Stop exit-2; kritiske i org-`managed-settings`).
- GitHub event→Action (aktivering/transport; committet artefakt uforfalskeligt).
- Author-verificering på gate-ord (kun `mgrubak`).
- Gate-state + dirigent (`gate_ord`).
- Hash/SHA-binding (krav-hash · plan-SHA · recon-hash · låste vision/forretning-SHAs).
- Divergens-tjek (`gate_ord`↔`gate-def` · repo↔repo).
- `codex exec --ephemeral` (friskhed).
- CI mod rigtige committede artefakter.

**Dømmekrafts-lag (bundet til mekanisk gate):** Codex omission/djævel/troskab · Claude.ai menings-troskab · recon-grundighed. Regel: uadresseret fund / manglende artefakt → hook BLOKERER.

**Bord-deling:** krav = HVAD (Mathias) · HVORDAN = Code/Codex' bord · **Code/Codex ejer at deres HVORDAN leverer HVAD'et (efter hensigten)** · Claude.ai = uafhængigt menings-kryds · Mathias = endelig + definerer hensigt.

**Drivkraft + økonomi:** `/loop` intra-bid (turn-cap, hård success = prover) · friskhed pr. bid · billigste model der bærer (mekanik billigt, angreb/byg/prover dyrt) · abonnement ikke API (Codex lokal, Claude OAuth).

---

## FORUDSÆTNINGS-FIX (mekanismer der mangler/er røde i dag)

1. **`gate_ord`↔`gate-def`-afstemning:** `plan OK` + `build OK` findes kun i `workflow/gate-def.json`, ikke i dirigentens `kaede-regler.json gate_ord` → motoren kan ikke se front-/build-gaterne. Skal afstemmes + divergens-vogtes.
2. **CI mod rigtige artefakter:** i dag kører validatorerne som selftests/fixtures, ikke mod den committede kæde. Skal vendes (Build 1's falsk-grøn).
3. **Codex command/værktøjs-setup** verificeret for korrekt opsætning (`codex exec`, `--ephemeral`, reasoning_effort, sandbox, adapter).
4. **`workflow:selftest`-rød på `main`** (pre-eksisterende) skal fikses for sig selv — blokerer ellers PR'er.
5. **App-/GitHub-adgang ved privat repo:** Actions koster minutter; apps (Claude Action + marketplace-sync) skal re-grantes adgang til privat repo.

---

## KENDTE SVAGE LED (til Codex-angreb, step 6 / løbende)

- **Forretnings-recon-komplethed** — irreducibel ukendt-ukendt; mitigeret af coverage-mapping + 3-aktør-connect + Mathias-validering, men residual.
- **Claude.ai-app som menneske-led** — kan ikke automatiseres; afhænger af Mathias' hånd + sync (privat-repo-adgang).
- **Forretnings-troskab** — semantisk dømmekraft, ikke ren mekanik; gjort ikke-springbar + meta-canary-bevist, men ultimativ garant er Mathias.
- **Håndover-koblingerne** (recon→krav, krav→plan, plan→build, kæde↔workflow) — hvor kæden kan "hoppe"; integrations-canary skal dække hver.

---

*Slut på step-1-kortlægning. Næste: løbende Codex-angreb fase-for-fase → fold fund ind → Mathias holder mod krav → ingen feedback = klar til godkendelse.*
