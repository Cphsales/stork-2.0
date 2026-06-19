# Workflow-færdiggørelse — forløbs-kortlægning (Step 1)

**Type:** Step 1 — kortlægning af HELE byg-workflowet, bid-for-bid, fra `qwers` til `slut OK`.
**Status:** UDKAST v3 — Codex runde 1 + runde 2 (retssag, Mathias-dømt) foldet ind. Intet bygges. Til fælles grundig læsning (Mathias + Code). Step 2 = hvordan hvert element sættes op.
**Grundlag:** krav-dok (de 11 krav) · vision + forretning (låste) · masterplan. Aftalt krav 5-model står som sandhed via Mathias' ord (PR #178 ikke merget — vi fortsætter uden merge).
**Acceptkriterie for step 1:** alle elementer er med, hvert lille step står konkret, og kæden hænger sammen uden huller (positivt bevist, ikke ved tavshed).

## Læsenøgle (felter pr. step)

- **Aktiveres af** · **Hvem/hvad** · **Aktiverer** · **Gør / samler** · **Skal kunne** (krav-ref) · **Mekanisme** (mekanisk=deterministisk · dømmekraft=bundet til mekanisk gate) · **Anti-snyd** · **→ næste**

Aktør-noter: **Code** = lokal builder/driver · **Codex** = lokal, kørt af Code (`codex exec --ephemeral`, reasoning=xhigh) · **Claude.ai** = `claude -p`-rolle under recon + app'en (Mathias' hånd) ved krav · **Mathias** = gates + definerer hensigt.

**Gennemgående: dybde-først-loop + Code-kontinuitet.** Recon og dybde-tjek (S1.x, S7.6) kører en **dybde-først-loop**: *ny info → vurdér → dyk ned (brugbar?) → dyk dybere → ved X nej (dead-ends) → loop til næste info.* **Dybden af et fund giver konteksten, ikke fundet selv** — loopen er **selv-rensende** (dead-ends droppes efter X nej; kun dybt-verificeret bæres frem). Derfor: **Code = kontinuerlig driver inden for en fase** (bærer dybde-kontekst, ikke flade fund), **nulstilles ved fase-nulpunkter** (anti-session-rot). Anti-drift afhænger IKKE af Code's friskhed, men af mekanismerne + de friske uafhængige angribere (Codex `--ephemeral` · Claude.ai `claude -p`) + frisk kontrakt pr. bid. (Loopen er **metode**, ikke en ny mekanisme — tænderne er dybde-meta-canary + prover.)

**Gennemgående anti-tavsheds-regel (Codex #4/#24):** intet step godkendes ved *fravær* af indvending. Hvert gate har et **forventet antal positive, hash-bundne verdikter**; manglende verdikt / timeout / forkert hash = **fail-closed (BLOKER)**, aldrig auto-grønt. Tavshed er ikke et ja.

**Gennemgående læsebevis-regel (Codex #4/#13):** en aktørs verdikt tæller kun hvis det er **indholds-afledt** — bundet til konkrete fund/citater der kun kan komme af faktisk læsning (eller: aktøren henter selv artefaktet via egen kanal, og hentningen ER beviset) + citerer den læste SHA. Bare at *nævne* en SHA tæller ikke (stale/fabrikeret SHA-citat → BLOKER).

---

## FASE 0 — Åbning

### S0.1 — qwers
- **Aktiveres af:** Mathias. **Hvem/hvad:** `qwers <pakke>` på #126. **Aktiverer:** GitHub-event → dirigent.
- **Skal kunne:** starte workflowet med ÉN prompt (krav 9). **Mekanisme:** issue-event + author-verificering (kun `mgrubak`).
- **Anti-snyd:** forkert author → IGNORÉR (fail-closed). **→** S0.2.

### S0.2 — Dirigent dispatcher
- **Aktiveres af:** #126-event. **Hvem/hvad:** dirigent. **Aktiverer:** de tre lokale AI-aktører.
- **Gør:** sætter aktiv pakke + pakke-kontekst + read-only recon-mode. **Skal kunne:** aktivere ALLE tre deterministisk (krav 9).
- **Mekanisme:** deklarativ event-transport, fail-closed. **Anti-snyd:** ikke alle tre aktiveret → FAIL; transport auto-validerer → FAIL. **→** S0.3.

### S0.3 — Aktørerne vågner (frisk)
- **Hvem/hvad:** Code · Codex (`--ephemeral`) · Claude.ai (`claude -p`), hver frisk/statsløs. **Aktiverer:** frisk load af workflow-rolle-tekst.
- **Skal kunne:** to rolle-typer pr. AI (workflow/almindelig), Mathias styrer (krav 7).
- **Mekanisme:** rolle-tekst i skill + **capability-tjek ved session-start** (`/skills`/`/doctor`) + hook der garanterer rolle/freshness.
- **Anti-snyd:** forkert-rolle-kanariefugl (forkert rolle → afvis/fejl højt); manglende capability → fejl højt. **→** S1.x.

---

## FASE 1 — Recon (FØR krav)

### S1.1 + S1.2 — 2× kode-recon (Code + Codex)
- **Hvem/hvad:** Code og Codex laver hver **uafhængig kode-recon** (ikke angreb — koden er stor/kompleks, to cross-vendor-recons giver bedre dækning).
- **Gør / samler:** fund i recon-output-skema `{kilde, kategori, emne, evidens-ref, aktør, klassifikation}`.
- **Skal kunne:** fuld recon, kortlæg HELE scope (krav 4). **Mekanisme:** read-only + grundig-recon-kontrakt + `--ephemeral` (Codex).
- **Anti-snyd:** stopper-for-tidligt/uden kilde → FAIL. **Dækningsmål (Codex #6):** recon-komplethed måles mod **coverage-matrix** (forretningsdele × viewpoints) — "fuld" = hvert kendt viewpoint dækket, ikke aktørens skøn. **→** S1.4.

### S1.3 — Docs-/forretnings-recon (Claude.ai)
- **Hvem/hvad:** Claude.ai (`claude -p`). **Gør:** læser vision/forretning/masterplan-relevante dele/krav-historik/Mathias-afgørelser.
- **Skal kunne:** ramme "hvad Stork skal være" (krav 4). **Anti-snyd:** recon uden dokument-recon → FAIL. **→** S1.4.

### S1.4 — Konsolidering til ÉN sandhed
- **Aktiveres af:** alle tre recons færdige (positivt — anti-tavshed). **Aktiverer:** angrebs-funktionen (først NU).
- **Gør / samler:** fletter de tre recons → **ÉN committet, hash-bundet recon-sandhed**.
- **Skal kunne:** ingen pakke på divergent grundlag; alle binder til recon-hash (krav 4).
- **Mekanisme:** mekanisk fletning + hash-binding. **Konflikt-bevaring HÅRD (Codex #5):** divergenser mellem aktør-recons **bevares eksplicit** (ikke dedupet væk); kun *ægte dubletter* dedupes; støjbudget må aldrig kassere en uenighed. Kasseret/ikke-bevaret divergens → BLOKER.
- **Anti-snyd:** u-konsolideret/divergent recon → BLOKER; aktør bundet til anden recon-version → BLOKER. **→** S1.5.

### S1.5 — Omission-angreb (første brug af angreb)
- **Hvem/hvad:** Codex (angriber). **Gør:** finder hvad reconen MISSEDE på den konsoliderede sandhed.
- **Mekanisme:** adversarisk review + coverage-mapping. **Anti-snyd:** fund → tilbage til S1.4; residual ukendt-ukendt navngives ærligt. **→** S1.6.

### S1.6 — Recon → Mathias (3-bøtte)
- **Hvem/hvad:** Claude.ai oversætter; Mathias validerer. **Gør:** "pakken berører disse forretningsdele" i tre bøtter (nuværende kode / ikke-bygget / intet-data).
- **Skal kunne:** Mathias dømmer forretning, ikke kode (krav 6). **Mekanisme:** Mathias-komm-kontrakt + recon-præsentationskontrakt.
- **Anti-snyd:** kode til Mathias → FAIL; ikke-3-kategori → FAIL. **Handover-binding (Codex #7):** hvert recon-fund får en **disposition** (behandlet i krav / udskudt / ikke-relevant), bundet til recon-hash → senere gates kan bevise at intet fund blev sprunget over. **→** S2.x.

---

## FASE 2 — Krav (Mathias + Claude.ai på app'en)

### S2.1 — Claude.ai-app aktiveres frisk
- **Hvem/hvad:** Mathias åbner Claude.ai, ny chat. **Aktiverer:** auto-sync fra GitHub-marketplace.
- **Gør:** app'en henter docs+skills (testet 2026-06-18). **Mekanisme:** `.claude-plugin/marketplace.json` + app-sync.
- **Anti-snyd (Codex #8):** sync skal **verificere at den hentede state = aktuel committet SHA/branch** (ikke kun "manifest present") — stale/forkert-branch/delvis sync → synlig fejl, ikke tavs gammel kontekst. **→** S2.2.

### S2.2 — Krav skrives (kun HVAD)
- **Hvem/hvad:** Mathias + Claude.ai. **Gør:** krav-doc med **funktioner tydeligt beskrevet ved HVAD de skal kunne** + acceptkriterie + krav-ID. HVORDAN = Code/Codex' bord, ikke i kravet.
- **Skal kunne:** Claude.ai medforfatter + build-vs-ønsker-sammenligning (krav 2); forretnings-sprog (krav 6).
- **Mekanisme:** krav-medforfatter-kontrakt; krav holdt mod LÅSTE vision/forretning ved SKABELSE. **Recon-binding (Codex #7):** krav-doc binder til recon-hash; hvert recon-fund skal være disponeret.
- **Anti-snyd:** krav driver fra vision/forretning → FEEDBACK; kode i kravet → hører ikke hjemme; krav-ID uden acceptkriterie → FAIL. **→** S2.3.

### S2.3 — Mathias godkender + Claude.ai uploader
- **Hvem/hvad:** Mathias + Claude.ai. **Gør:** Mathias + Claude.ai godkender krav-doc FØR upload (= Mathias' godkendelse, krav 5); Claude.ai uploader.
- **Mekanisme + anti-snyd (Codex #3):** Mathias godkender en **konkret hash** af krav-doc; **upload skal matche den godkendte hash** — ellers BLOKER (Claude/app kan ikke regenerere/ændre en anden version ind uden at kæden ser det). Mathias' ord overruler altid (krav 5). **→** S3.x.

---

## FASE 3 — Krav-godkendelse (positivt indvendings-vindue)

### S3.1 — Upload trigger kode-aktørerne
- **Hvem/hvad:** GitHub Action → Code (+ Codex via Code), bundet til krav-hash via egen kanal.
- **Skal kunne:** ekstern aktivering, kører selv (krav 9). **Mekanisme:** GitHub event→Action; committet artefakt uforfalskeligt.
- **Anti-snyd:** aktør uden egen læsekanal (citeret SHA) → gate BLOKERET. **⚙️ Step-2 (Codex #9):** runner-/auth-/workspace-/artefakt-protokol så cloud-event og lokal aktør beviseligt rammer SAMME krav-hash. **→** S3.2.

### S3.2 — Djævel + POSITIVT verdikt
- **Hvem/hvad:** Code + Codex (djævlens-advokat). **Gør:** djævel-pass pr. berørt krav (minimums-/stærkeste læsning · kan planen snyde sig grøn · hvilken canary forhindrer snyd · hvad "ikke færdig" betyder).
- **Skal kunne:** krav-huller fanges af anden aktør, ikke Mathias (krav 3/5).
- **Mekanisme + anti-snyd (Codex #4/#24):** **begge aktører skal afgive et positivt, hash-bundet verdikt** ("ingen indvending" ELLER konkret fund) bundet til krav-hash + djævel-artefakt. **Manglende verdikt / timeout / forkert hash = BLOKER** (fail-closed). Ingen indvending betyder her: *begge har positivt registreret det* — ikke tavshed. Indvending → tilbage til Mathias (+ Claude.ai retter). **→** S3.3.

### S3.3 — krav OK (gate-state)
- **Hvem/hvad:** Mathias (ord) + dirigent (registrering). **Gør:** gate-state `krav-laast`; krav-hash = immutable gatet identitet.
- **Mekanisme:** committet gate-state + dirigent læser `gate_ord` (`krav OK` findes). **Anti-snyd:** spring uden registreret ord → blokeret. **→** S4.x.

---

## FASE 4 — Plan (kode-recon FØR plan, så plan)

### S4.1 — Kode-recon #2 (før plan)
- **Hvem/hvad:** Code + Codex (2× kode-recon, mod krav-hash). **Gør:** kodepåvirkning + dokument-recon (krav + vision/forretning + masterplan + **repo-sandheds-inventory**) → konsolideret recon-sandhed-2.
- **Skal kunne:** plan passer vision+forretning+krav, ikke kun koden (krav 4).
- **Anti-snyd:** kode-recon mangler før plan → FAIL. **⚙️ Step-2 (Codex #10):** "repo-sandheds-inventory" defineres som et hash-bundet led i kæden (hvor det kommer fra, hvordan det valideres) — ikke en antaget ekstern dependency. **→** S4.2.

### S4.2 — Plan skrives (hele kæden, 1:1 med build)
- **Hvem/hvad:** Code skriver; Codex angriber. **Gør:** plan-kontrakt, hele kæden gennemtænkt; **bid-opdeling besluttes HER**.
- **Skal kunne:** **plan 1:1 med build**; hver funktion → test der følger tråden til slut-effekt (ikke artefakt-eksistens).
- **Mekanisme:** ingen-byg-før-plan-OK via **hook** (PreToolUse exit-2); **krav-ID-matrix** (`K-n` → step + test) + **løfte↔bevis-bijektion**.
- **Anti-snyd:** byg før plan OK → hook BLOKERER; `K-n` uden step/test → FAIL; plan-løfte uden canary → rød; build uden plan-løfte → "rogue". **Canary-styrke (Codex #11):** en canary tæller kun hvis den tester **slut-effekt** (ikke triviel eksistens); reviewer + dybde-meta-canary vurderer styrke (residual dømmekraft, se "svage led"). **→** S4.3.

### S4.3 — Troskabs-angreb på planen
- **Hvem/hvad:** Codex (+ Claude.ai menings-troskab). **Gør:** finder hvor plan modsiger krav / krav modsiger vision; overclaim; teknik-forklædt-som-kravopfyldelse.
- **Skal kunne:** **Code/Codex ejer at deres plan/kode leverer hensigten** (deres bord); Claude.ai kryds-tjekker; Mathias endelig.
- **Mekanisme:** troskabs-angriber + Claude.ai sætning-for-sætning mod låste docs; **troskabs-meta-canary** (plant modsigelse → SKAL fanges). **Anti-snyd:** uadresseret troskabs-fund → BLOKER (positivt verdikt krævet). **→** S5.x.

---

## FASE 5 — Plan-gate

### S5.1 — Plan frosset + 4-aktør-binding
- **Hvem/hvad:** Code + Codex + Claude.ai på samme plan-SHA; Mathias sidst.
- **Gør:** plan frosset som plan-SHA; tre AI-verdikter binder til plan-SHA + krav-hash **via egen kanal med citeret SHA**; djævel-pass FØR hver approval.
- **Skal kunne:** kumulativ kæde-troskab — plan⊨vision+forretning+krav (krav 2).
- **Mekanisme:** plan-SHA-binding + gate-check (approval matcher SHA) + stale-stop. **Anti-snyd:** stale-SHA → BLOKER; verdikt uden citeret SHA → BLOKER; manglende verdikt/timeout → fail-closed. **→** S5.2.

### S5.2 — plan OK (gate-state)
- **Hvem/hvad:** Mathias (sidst). **Gør:** `plan OK`; gate-state `plan-laast`. Modsigelse mod krav/vision/forretning → **STOP → Mathias + Claude.ai retter**.
- **Mekanisme:** committet gate-state + dirigent (**⚠️ forudsætning: `plan OK` afstemt ind i `gate_ord` — mangler i dag**). **Anti-snyd:** AI retter aldrig selv en modsigelse mod styrende docs. **→** S6.

---

## FASE 6 — Build OK

### S6.1 — build OK (eksplicit, før byg)
- **Hvem/hvad:** Mathias. **Gør:** `build OK` før byg; gate-state `build-laast`.
- **Skal kunne:** intet bygges/merges før ordet (krav 9). **Mekanisme:** committet gate-state + **hook** (byg-tool-kald før `build OK` → exit-2).
- **Anti-snyd:** byg før `build OK` → hook BLOKERER; `gate_ord`↔`gate-def` divergens → BLOKER. **Default-deny (Codex #2/#14):** gaten er **default-deny** — før `build OK` er KUN eksplicit tilladte tool-kald lovlige; alt andet (shell/fil-skrivning/scripts/formattere) blokeres. IKKE en blocklist af "byg-kommandoer" der kan omgås. (⚙️ step-2: den konkrete allowlist.) **→** S7.x.

---

## FASE 7 — Build (bid-for-bid pr. skive)

### S7.1 — Friskhed pr. bid
- **Hvem/hvad:** Code + freshness-skill. **Gør:** loader tynd pakke-kontrakt frisk.
- **Mekanisme + anti-snyd (Codex #15):** kontrakten er **hash-bundet** (pakke + krav-hash + plan-SHA + bid-ID), ikke kun "present" — forkert/gammel kontrakt der er "present" → fail (ingen falsk friskhed). **→** S7.2.

### S7.2 — Codex skriver angrebs-spec FØR byg (HÅRD gate)
- **Hvem/hvad:** Codex. **Gør:** definerer "done" op-front = de hårde canaries skiven skal overleve.
- **Mekanisme + anti-snyd (Codex #16):** **byg-tool-kald uden registreret angrebs-spec for bid'en → hook BLOKERER** (ikke bare "ingen defined done"). Hård gate. **→** S7.3.

### S7.3 — Code bygger skiven
- **Hvem/hvad:** Code. **Gør:** bygger for at dræbe canaries; HVORDAN er Code's bord, men koden skal levere kravets HVAD efter hensigten.
- **Skal kunne:** funktioner skal VIRKE, ikke kun se gode ud (krav 1).
- **Anti-snyd (Codex #17):** **Code må IKKE ændre prover, hooks, gates, fixtures eller canary-defs** (sine egne målepunkter) — uautoriseret ændring af måle-laget → hook BLOKERER/STOP. Byggeren kan ikke flytte egne mål. **→** S7.4.

### S7.4 — Codex angriber forrige skives reelle kør (async)
- **Hvem/hvad:** Codex (lokal, `--ephemeral`), parallelt. **Gør:** adversarisk review + snydevej-check på reel kør (via #126).
- **Mekanisme:** pipeline — N bygger på N-1's **prover-grønne** base (ikke ubevist grundlag); Codex' adversariale angreb på N-1 kører **async som en anden gate**. **Anti-snyd (Codex #10/#18):** finder det sene angreb en fejl i N-1 → **cascade-STOP/rewind** der også invaliderer N. Altså: byg på prover-grøn, aldrig på uafsluttet. **→** S7.5.

### S7.5 — To-sidet prover (model-frit verdikt)
- **Hvem/hvad:** prover (deterministisk, ingen model); Codex planter, Mathias ser rød.
- **Gør:** reel kør der **(a) går RØD på den plantede hårde (dybe) fejl OG (b) GRØN på baseline** — samme kør.
- **Skal kunne:** grøn = reel konsekvens (krav 3). **Mekanisme:** to-sidet bevis + **meta-canary** + **CI mod RIGTIGE committede artefakter, ikke fixtures** (Build 1's synd).
- **Prover-isolation (Codex #3/#19 — Mathias-dom: Codex kan få skrive):** **Codex ejer + har SKRIVE-adgang til prover + canaries + angrebs-spec** (måle-laget); **Code har INGEN skrive-adgang til sit eget måle-lag** (prover/hooks/gates/fixtures). Den der måler ≠ den der bygger — *håndhævet*, ikke en regel. **⚙️ Step-2:** præcis permissions/CI-isolation. **Anti-snyd:** prover der ikke kan gå rød → meta-canary; syntetisk bevis → forbudt. **→** S7.6.

### S7.6 — Dybde-tjek (krav bid-for-bid ned gennem hele koden)
- **Hvem/hvad:** Code + Codex (deres bord). **Gør:** tager kravet **bid for bid** og løber **ned gennem hele koden** til slut-effekt — ikke kun første lag.
- **Mekanisme:** test-dybde-kontrakt; **SHA-bundet dybde-artefakt pr. krav** + **dybde-meta-canary** (fejl plantet DYBT → SKAL fanges, ellers kiggede tjekket kun på lag 1).
- **Anti-snyd:** "doc-/første-lags-check grøn" beviser ikke funktion → afvises. **Residual (Codex #20):** fuld gren-/sti-dækning kan ikke gøres rent deterministisk — dybde-meta-canary + (⚙️ step-2) coverage-kriterier mindsker det; rest = dømmekraft (se "svage led"). **→** S7.7.

### S7.7 — Kontinuerlig troskab (build ⊨ hele kæden)
- **Hvem/hvad:** Codex troskabs-angriber + Claude.ai menings-troskab. **Gør:** build⊨plan · plan⊨krav · krav⊨vision/forretning, diff-bundet ved hver ændring.
- **Skal kunne:** tro hele vejen (krav 2); modsigelse → **STOP → Mathias + Claude.ai retter**.
- **Mekanisme:** diff-bundet re-validering + troskabs-meta-canary; **always-on-floor** scaler aldrig ned. **→** S7.8.

### S7.8 — Loop-driver + fix-loop
- **Hvem/hvad:** `/loop` (intra-bid driver), Code. **Gør:** grøn+bevist → advance; fejl → afgrænset fix-loop (`/loop` driver, bound = `/goal` "stop efter N", **hård success = proveren**); uløst → `/rewind` + eskalér.
- **Mekanisme:** `/loop` (bundlet skill — capability-tjek) + `/goal` turn-cap + `Stop`-hook (hård) + prover som success. **Anti-snyd:** loop der stopper på egen blød "done" → forbudt; success ER proveren. **→** næste skive / acceptance.

---

## FASE 8 — Acceptance / slut-gate

### S8.1 — Fuld-kæde reel kør
- **Hvem/hvad:** Code + Codex; prover. **Gør:** hele kæden på reel committet testpakke **UDEN fixtures**; alle hårde canaries døde; **integrations-canary** (plantet brud i en håndover SKAL fanges).
- **Skal kunne:** beviser gearene griber ind i hinanden. **Anti-snyd (Codex #21):** **kriterier for "reel" testpakke** — committet, afledt af *faktisk* brug/data, IKKE skrevet til at tilfredsstille workflowet; en omdøbt fixture tæller ikke. (⚙️ step-2: konkrete reel-kriterier.) Ufanget canary → BLOKER. **→** S8.2.

### S8.2 — slut OK
- **Hvem/hvad:** Code + Codex + Claude.ai (slut-troskab) → Mathias sidst. **Gør:** slut⊨vision+forretning+krav+plan; **krav-rammen tjekkes opfyldt** (alle `K-n` leveret + bevist = "v5 færdigt"); Mathias `slut OK`.
- **Mekanisme:** committet gate-state; promise↔proof-bijektion lukket. **Anti-snyd:** krav-rammen ikke fuldt opfyldt → ikke slut OK. **Residual (Codex #22):** en internt komplet bijektion kan stadig være *eksternt* forkert (krav forkert splittet/udvandet) — fanges ikke rent mekanisk; **Mathias + Claude.ai menings-troskab er den ultimative fangst** (se "svage led"). **→** S9.

---

## FASE 9 — Doks efter build

### S9.1 — Opdater afledte docs (under gate)
- **Hvem/hvad:** Code. **Gør:** opdaterer **masterplan + tekniske docs** (kode-gæld/G-numre) til at afspejle det byggede; repo-hygiejne.
- **Skal kunne:** main = fuldt spor (krav 8); masterplan opdateres (krav 10).
- **Mekanisme + anti-snyd (Codex #23):** doc-diffet efter build er **ikke fri** — masterplan-/styrings-ændring = **Mathias-gate** (krav 10), så aktive styrings-docs ikke ender ude af trit med det beviste build. **Dine sandheds-docs (vision + forretning) rettes ALDRIG her** (strukturelt håndhævet, se mappe-struktur). Konkurrerende aktiv sandhed → BLOKER. **→** pakke lukket.

---

## MAPPE-STRUKTUR (doc-taksonomi — selv en mekanisme)

Mappe-grænsen **håndhæver** bord-delingen: en hook/CODEOWNERS blokerer AI-skrivning til sandheds-mappen (kun Mathias via PR), mens teknik-mappen er AI-opdaterbar under gate. Strukturen gør "sandheds-docs rettes aldrig af AI" til en *mekanisk* regel, ikke en hensigt.

```
docs/
  sandhed/            # LÅST — Mathias' bord. AI retter ALDRIG (kun Mathias via PR + CODEOWNERS)
    vision-og-principper.md
    forretningsforstaaelse.md
    <pakke>-krav.md          # krav pr. pakke (HVAD, tydeligt beskrevet + acceptkriterie)
  teknik/             # opdaterbar EFTER build af AI — masterplan-ændring = Mathias-gate (krav 10)
    master-plan.md
    teknisk-gaeld.md         # G-numre / kode-gæld
    fremtid/                 # idé-docs til senere beslutninger
  plan-build/         # pr. pakke: plan (1:1 med build) + build-rapport/artefakter
    <pakke>-plan.md
    <pakke>-build-rapport.md
  proces/             # workflow-regler, rolle-instrukser, kontrakter, gate-defs (aktør-flade — Mathias læser ikke)
  arkiv/              # lukkede artefakter (læsbar reference, ikke aktiv kilde)
```

- **Håndhævelse (Codex #12):** lokal skrivning til `docs/sandhed/` blokeres af en **PreToolUse-hook** (deterministisk, lokalt — CODEOWNERS gater kun *merge*, ikke lokal redigering). CODEOWNERS=mgrubak er merge-gaten på PR-siden. **Hooken er mekanismen; mappen alene er ikke.** `docs/teknik/master-plan.md`-diff → Mathias-gate.
- **Migration er én bevægelse** (gov-6-princip): flyt + opdater alle referencer (hooks/CI/CLAUDE.md/LÆSEFØLGE) i ét, ikke gradvist. **→ step 2/3** (den faktiske flytning er ikke gjort her; dette er målstrukturen).

---

## KENDTE SVAGE LED (ærlige residualer — fake-fixes IKKE)

- **Forretnings-recon-komplethed** — irreducibel ukendt-ukendt; coverage-matrix + 3-aktør-connect + Mathias krymper den, men residual.
- **Forretnings-troskab (Codex #12)** — semantisk; troskabs-meta-canary beviser tjekket *fyrer*, ikke at *subtil* drift fanges. Ultimativ garant = Mathias + Claude.ai (krav 2/5).
- **Dybde-fuldstændighed (Codex #20)** — fuld gren-dækning ikke rent deterministisk; dybde-meta-canary + coverage-kriterier mindsker, rest = dømmekraft.
- **Internt-komplet vs. eksternt-forkert (Codex #22)** — en lukket bijektion kan stadig misse krav forkert splittet/udvandet. Mathias-vs-krav + Claude.ai-mening er den eneste fangst.
- **Claude.ai-app som menneske-led** — kan ikke automatiseres; afhænger af Mathias' hånd + sync (privat-repo-adgang).
- **Canary-styrke (Codex #11)** — bijektion beviser eksistens, ikke styrke; afbødet af slut-effekt-krav + meta-canary, rest = reviewer-dømmekraft.

---

## FORUDSÆTNINGS-FIX + STEP-2-DETALJER

**Røde i dag (skal fikses før workflowet håndhæver):**
1. `gate_ord`↔`gate-def`-afstemning (`plan OK`/`build OK` ind i motoren) + divergens-vogter.
2. CI mod rigtige committede artefakter (ikke selftests/fixtures) — Build 1's falsk-grøn.
3. `workflow:selftest`-rød på `main` (pre-eksisterende) — fikses for sig.
4. App-/GitHub-adgang ved privat repo (Actions-minutter + app re-grant).

**⚙️ Step-2 (hvordan sættes op — Codex-flaggede detaljer):** GitHub-Action→lokal aktør protokol (#9) · definition af "byg-tool-kald" (#14) · prover-isolations-mekanik (#19) · repo-sandheds-inventory som kæde-led (#10) · reel-acceptance-kriterier (#21) · dybde-coverage-kriterier (#20) · mappe-migration (én bevægelse).

---

## CODEX RUNDE 1 — DISPOSITIONER

24 fund. **Foldet ind (mekanisk hardening):** #3,#4,#5,#7,#8,#13,#15,#16,#17,#18,#19(delvis),#21,#23,#24 + anti-tavshed/læsebevis som gennemgående regler. **Markeret ⚙️ step-2:** #9,#10,#14,#19(detalje),#20(kriterier). **Ærlige residualer (ikke fake-fixet):** #6(delvis),#11,#12,#20,#22. **Allerede i forudsætnings-fix:** #1,#2.

---

*Slut på step-1-kortlægning v2. Næste: Mathias holder mod krav + evt. runde 2 Codex → ingen feedback = klar til godkendelse.*
