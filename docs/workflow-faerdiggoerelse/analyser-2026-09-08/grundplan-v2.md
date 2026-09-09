# Grundlæggende plan — v5-fabrikken · VERSION 2 (efter Codex-validering)

Samlet 2026-09-09 af mathias-9b. v1 = `GRUNDPLAN.md` (før validering). v2 indarbejder Codex-validatorens dom (`validering/RESULTAT-codex.md`: »KAN GODKENDES MED RETTELSER V-1..V-8, V-10, V-11«) — alle 12 fund og 4 forbedringer er verificeret mod repoet af mathias-9b og indarbejdet; ændringer mod v1 er markeret **[V-n]**.
Kilder: 8 analyser 2026-09-08 (Codex-integration P-1..9 · tidsoptimering Codex T-1..12 + Claude T-1..9 · over-test Codex O-1..13 + Claude O-1..13 · flow Codex F-1..10 + Claude F-1..11 · Codex' egen opsætning 22 pkt via Mathias' relæ) + valideringen.
Bindende Mathias-ord: M-31/M-33 model-pins · M-34 ét ok · M-35 P-1..P-9 · M-39 tidsoptimering (effort = VENT) · M-40 alle over-test-forbedringer. Ingen af dem genåbnes her.

---

## 0. Status — sandt pr. 2026-09-09 kl. 13:00

| Hvad | Tilstand |
|---|---|
| Repo | origin = HEAD `bd5c51a` · **14** commits pushet 08-09 17:43 **[V-12]** · selvtest-suite grøn lokalt og i CI (CI kører KUN selvtests — ikke gate-dom) |
| Krav-gate | **Godkendt ved M-38 og består lokal gate-beregning (pinnet script, `open:true`). CI-autoritet og server-verificeret godkender er endnu IKKE etableret** (`krav-gate-resultat.json` deklarerer det selv). **[V-1]** |
| Fase 3 | plan v1 `423d9b20` @ `ec4a3d9` = UDKAST · tre tjek: **angreb 15 poster (8 BLOKER + 7 RET) · fresh-eyes 5 poster · kildetjek 16 F-fund + 10 U-fund** (272 kontrolrækker, ikke 54 fund) **[V-12]** · fold-ind IKKE sket · angreb- og audit-output ligger KUN i den døde drivers scratchpad (sikkerhedskopi taget af mathias-9b i `backup-fase3-fund/`) |
| Driver | »qwers trin 10b« døde 09-09 10:17 (login udløbet) · ikke genstartet kl. 13:00 · ingen aktører kører |
| Rolletekster | **P-6-konsistens IKKE gennemført:** planner-code.md:50 bærer stadig »kun hvor umulighed ikke kan → effect-harness« efter D13-sætningen · codex-angreb.md:91 »hver konfig-knap« · builder-code.md:27-29 »redundant policy → mutant overlever → gate rød« — alle tre modsiger D10/D13 **[V-4]** |
| Åbne Mathias-ord | de 8 beslutninger i afsnit 10 (revideret) |

---

## 1. Fundamentet — 11 principper (uændret substans, 3 præciseret)

1. **Falsk-grøn er hovedfjenden.** Tid spares aldrig ved at fjerne et negativ-tjek, en dommer eller fail-closed.
2. **Rigtig parallelitet = frosne input samtidig, blindt.** Forkert = angribe et udkast mens det skrives. **Blindt betyder: aktøren har ikke set producentens output OG producenten har ikke set aktørens.** En tjekliste begge har læst er et fælles kontrolgrundlag, ikke et uafhængigt angreb. **[V-3]**
3. **Skelet før krop.** Struktur dømmes før detaljen skrives (filter før recon · K-skelet før krav-krop · matrix+bids før plan-krop).
4. **Løkken er det eneste ægte sekventielle.** Første angrebs-pas = opslag mod blindt katalog **+ ét frit helheds-pas** (kan to lokalt rigtige dele tilsammen bryde et krav?). Andet pas = delta på **rettelserne OG de krav, negativer og afhængigheder de berører** — ikke kun diff-linjerne. **[V-3]**
5. **Ét delta-batch pr. runde.** Alle tjek på samme blob → én fold-ind → én re-bind → først derefter Mathias.
6. **Beskriv ≠ luk.** Hvert materielt fund ender som: rettet m. bevis / begrundet afgørelse inden for eksisterende mandat / kræver Mathias' ord. Efter fold-ind tjekkes at den oprindelige K-forpligtelse består.
7. **Rollen bestemmer kaldet.** Model, effort, rolletekst og sandbox afledes af låsen; det faktisk kørte logges (model · effort · forsøg · service-tier · CLI-version).
8. **Fabrikken er selv frosset pr. kørsel.** Regel- og værktøjsversion pinnet; rolletekst→lock→register atomisk; aldrig »HEAD i arbejdstræet« som gate-input.
9. **Mathias sidst er en hændelseskæde.** Rækkefølgen er: **endelige artefakter + kontroller → fremlæggelse → REN devil på PRÆCIS den tekst → frys tekst + kvittering (verdikt-digests · fremlæggelses-blob · P-8 · ordbog · tidsstempel) → registrér afsendelse → bind Mathias' svar.** Enhver ændring efter kvitteringen gør den ugyldig. Gælder alle gater med Mathias-godkendelse; slut-gaten binder også maskinbeviset. **[V-2]**
10. **Sandhed = effect-harness + dræbt mutant mod rigtig database.** Alt andet = komplethed. Motoren koblet før Fase 4.
11. **Mathias spørges mindre og bedre.** Afled-før-spørg · bekræftelser · skelet-stoptjek · ét ord pr. gate · **én samlet liste over åbne punkter pr. tur (kilde · eksisterende svar · materialitet), ikke ét spørgsmål ad gangen over flere ture** **[V-9, Codex T-2]**.

---

## 2. Gjort — pushet og verificeret @ `bd5c51a`

- **M-34** ét godkendelses-ord; upload = driver-automatik efter REN audit.
- **M-35** P-1..P-9 forankret · P-2/P-4/P-5 kørt retro · P-3 aktiv (6 tabte forbehold fanget) · P-8 leveret. **P-6 (rolletekst-konsistens): DELVIST — pas på de 3 M-40-ændrede tekster udestår, se afsnit 0.** **[V-4]** **P-1: venter på gate-transport — se 3l for ansvar og frist.** **[V-1]**
- **M-39** wrapper (stdin-rodårsag lukket · output-krav · isolation pr. forsøg) · delta-batch · auto-input m. tidlig citat-scope · effort logges · pakke-2-blok i DEL IV.
- **M-40** krav-gate-run.mjs pinnet (2 fail-open lukket) · 6 selvtest-fixes m. mutations-bevis (enkelte foreslåede sletninger begrundet afvist, se m40-b-fixes-rapport) · **D10/D12/D13 indsat i plan og roller — men de modsatte sætninger står stadig (afsnit 0); håndhævelse i build-proof.mjs (én test/mutant pr. K, egen test pr. bid) er IKKE ændret endnu** **[V-4, V-5]** · D14 · D15 · E16-E20.
- 3 stale rolle-pins regenereret · wrapper-patch committet · drift-log.

---

## 3. NU — i den rækkefølge kørslerne kræver **[V-6, B-1]**

Hvert punkt har »færdig når«. Rækkefølgen er styret af én regel: **intet aktør-kald starter på regler, pins eller roller, der ikke er endelige.**

**Trin A — før NOGEN ny aktør-dom (fabrik-arm, ~½ dag):**

| # | Tiltag | Færdig når | Kilde |
|---|---|---|---|
| A1 | **Arkivér rå leverancer** fra den døde driver: OUT-angreb.md (15 poster) · OUT-audit.md (5) · prompts · provenance → `plan-build/lokations-skabelon/` committet **før** arbejdsmapper genbruges | tre fund-sæt ligger OID-bundet i repoet | B-3 · recon/spor-reglen |
| A2 | **Rolletekst-konsistens (P-6):** fjern de modstridende sætninger i planner-code.md:50 · codex-angreb.md:91 · builder-code.md:27-29 samlet; P-6-pas; lock-regen i ren commit | P-6 PASS · lock = HEAD · suite grøn | V-4 |
| A3 | **Rollen bestemmer kaldet (3d):** `codex-run.sh`/`verdikt-byg.mjs` tager rolle + lås-OID → model/effort/rolletekst/sandbox afledes; modstridende parametre afvises; `run_attempt` reelt; effort fra kørslen; hvert forsøg eget output | mock-selvtest grøn · første reelle kald viser xhigh i provenance | Codex F-2 · opsætning 7+20 |
| A4 | **Fabrik-frys (3e):** hver kørsel binder input-OID OG regel-/værktøjs-commit; hook afviser `roller/*.md` uden `actors.lock` og gate-modul uden register-entry; `krav-gate-run.mjs` parametriseret | hook-selftest grøn · én kørsel viser regel-commit i provenance | Codex F-3 · Claude F-10 |
| A5 | **Sandbox efter aktivitet (ikke pr. rolle):** domme (angreb-DOM · P-4 · devil · buildability · P-9) = read-only; produktion (recon-output · måle-lag · kill-list) = afgrænset skrivezone; output via `-o`; læse-isolation mellem aktører bevares separat (read-only forhindrer ikke læsning af andres filer) | codex-run.sh har `--sandbox` som parameter fra rolle+aktivitet | V-8 · opsætning 5+15 |
| A6 | **Beskriv ≠ luk i rolletekster** (fresh-eyes · P-4 · codex-angreb · code-reviewer · P-9) — anvendes på plan-fundene ved fold-ind | rolletekster opdateret + P-6 · hvert plan-fund har én af tre tilstande i fold-ind-rapporten | Codex F-8 |
| A7 | **Wrapper færdig:** PID-fil · mock-codex-selvtest (stdin · rc=0 uden output → fejl · timeout → ét retry samme effort · monotont ur) · 10-sek smoke efter ændring · separat fejllog | selvtest grøn · smoke kørt | Claude F-3 · opsætning 18/19 |
| A8 | **Fund-log starter:** hvert modtaget fund → kilde · fund-id · input-OID · status; rettelse → rettelses-OID + bevis | de 26 + 15 + 5 plan-fund står i loggen med status | Codex F-10 |
| A9 | **Frisk driver** startes med versionsbundet overdragelse @ `bd5c51a` (krav-/plan-blobs · gældende M-ord · åbne fund · zoner · næste handling). `--resume` er kun forsvarligt hvis samme genforankring gennemføres først; sessionens hukommelse er aldrig autoritet | driveren har kvitteret bindinger | B-2 |

**Trin B — Fase 3 runde 2 (driver, én runde):**

| # | Tiltag | Færdig når | Kilde |
|---|---|---|---|
| B1 | **Codex' EGET kill-list-udkast** (M-35/rolletekst) skrives BLINDT fra låst krav + recon-2 — ikke plannerens (plan.md:24). Recon-2's tjekliste er fælles kontrolgrundlag, ikke katalog. | committet før planneren ser det | V-3 · Claude F-1 |
| B2 | **Forventningsliste låses:** pr. K · acceptkriterie · strukturforbud · negativ · bevisform (ulovlig tilladelse / forkert slutværdi / manglende handling / samtidighed) · effekt-bid · kildeankre. Bruges til BÅDE at producere og kontrollere beviset. P-8 afstemmes ind (samtidighed kun K-2 sidste stand + K-6 dublet-kobling; én permutations-kontrolkopi; ingen kodeinspektion som erstatning for to-sessions-prøve) | én matrix; Codex viser at måle-adapteren kan udtrykke de 4 udfald | V-5 · Codex F-7 · M-40 E20 |
| B3 | **Fold-ind:** planner folder 15 + 5 + 26 fund + Codex' kill-list + forventningsliste ind i plan v2 (D10-filter på kill-krav; hvert fund én af tre tilstande) | plan v2 committet · fold-ind-rapport | plan Fase 3 pkt. 3 |
| B4 | **Delta + frit pas:** Codex + fresh-eyes verificerer rettelser OG berørte K/negativer/afhængigheder; derefter ét frit helheds-pas; code-reviewer = den friske slutlæser (ingen ny dommer) | rest = ∅ eller én dokumenteret ekstra runde | V-3 |
| B5 | **Plan-gate-bindinger udvides** til krav · recon2 · P-8 · ordbog · kill-list; `orderedApproval: true` på plan-gaten | gates.mjs + selftest + Codex-pas | V-2 |
| B6 | **Plan-gate-verdikter** (code-reviewer · codex · claude-ai) mod v2 | tre PASS | plan Fase 3 pkt. 4 |
| B7 | **Fremlæggelse → REN devil (m. mekanisk troskabs-liste, 3g) → frys → kvittering → afsendelse → Mathias' `plan ok`** | kvittering registreret før afsendelse; svar bundet | V-2 · Claude F-6 |

**Trin C — før Fase 4 starter:**

| # | Tiltag | Færdig når |
|---|---|---|
| C1 | **Sandheds-motoren koblet** (M-40 C): build-proof.json fra `runBuildProofEngine` + `runProver`; forventningslisten (B2) som input; harness observerer data + flere reject-klasser (K-8 læsning m. nul rækker) | integration mod container grøn; verifieren afviser hånd-skrevne flag |
| C2 | **D10/D12 håndhævet mekanisk** i build-proof.mjs (én meningsfuld mutant pr. afvisnings-ac m. eget værn; forudsætnings-bid binder til effekt-bid) | selftest-cases for begge |
| C3 | **P-7 diff-review** wiret (aktør + base_oid + kode-OID i review-kontrakten) | selftest |
| C4 | **CI-som-dommer-transport:** ansvarlig = fabrik-arm; frist = **før build-gaten får autoritativ virkning**; P-1 red-team FØR ibrugtagning. Indtil da skrives det ærligt: »lokal gate-beregning, ikke CI-autoritet«. **[V-1]** | check-run emitteret af CI for én gate; P-1 PASS |

**Senere spor (blokerer IKKE plan v2) [V-6]:** Codex-opsætningens hygiejne (8 · 9 · 11-14) · projekt-AGENTS.md + `.codex/` (snævert) · identitets-tjek før skrivehandling · legacy-afvikling (afsnit 8).

---

## 4. Fase 4 — build (denne pakke; design)

- Blind harness + angrebs-specs ∥ builder fra låst plan (Claude F-7); første prover-kørsel = opslag; navne-afvigelse → harness rød = 1:1-brud → HALT.
- **Højst ét efterfølgende bid startet uden det forriges review**; delt skema/rettighedskerne venter (Codex F-9). Cascade-STOP består.
- P-7 pr. bid · build-proof fra engine (C1) · D10/D12 (C2) · P-1 når transport findes (C4).

## 5. Fase 5 — sandhed (design)

- chain-proof-harness bygges UNDER Fase 4 (CI-job · P-8 §1 data-udvælgelse · canaries N1-N9 · kæde C0-C10 · verifier); held-out-fetch EFTER build. `proofs.mjs` fail-lukker korrekt indtil da.
- **B4-sandbox** (recon-attester bliver mekaniske) planlagt fra pakke 2 — står her eksplicit. **[V-9]**

## 6. Fase 6 — luk (design)

- Doc-diffs fra plan §6 ved plan-lås, appliceret byte-identisk ved luk · `retro-kpi.mjs` mekaniske tal (aktørtid · ventetid · fabrik-tid · Mathias-ture — **måles pr. pakke, så »sparet tid« er måling, ikke løfte** **[B-4]**) · én luk-fremlæggelse, ét ord · P-9 mod fund-loggen (A8).

---

## 7. Pakke 2-blok

Forankret (M-39, spørges ikke igen): spekulativ recon-2 + P-2 i ventetid · audit ∥ buildability · P-5 i omission-passet · genbrug ved byte-lighed **— genbrug kræver identisk samlet input + rolle + model + effort + instruks, ikke kun dokument-bytes** **[V-3]**.
Nye:
- **Fase 1:** filter- og omission-/dokument-katalog bygges BLINDT før recon-aktørerne på frosset bundle (Claude F-4 + Codex F-4 er samme tiltag); aktørerne binder én gang; frit komplethedspas efter katalog-opslag bevares.
- **Fase 2:** K-skelet (9 linjer) vises i den eksisterende forretningsdialog før krav-teksten — stoptjek, ikke ekstra gate (Claude F-5) · spørgsmål med stabilt id, svarmuligheder, kilde; svar gemt med spørgsmål; ny betydning markerer hvad den afløser (Codex F-5) · samlet åben-punkt-liste pr. tur (Codex T-2) **[V-9]**.
- **Fase 1/2 præsentation:** gentagne tekniske forklaringer i recon vises én gang; ordlyds-divergenser grupperes; kun forretningsvalg til Mathias (Codex O-11) **[V-9]**.
- **Fase 3 fuldt skelet-forløb** m. frosne input, dokumenteret feedback-rækkefølge og bevaret frit uafhængigt pas; variant ved stor struktur-risiko: stop ved skelettet, luk struktur-fund, frys skelet v2, skriv krop (Claude F-2 · Codex F-6).
- Frisk fresh-eyes-instans pr. artefakt (Claude F-11).
- **Fase 5:** parallelle effekt-prøver i isolerede databaser — KUN ved målt behov (Codex T-10) **[V-9]**.
- **Flere pakker samtidig vurderes først når pakke 2 er kørt rent OG pakke-afgrænsede stier/routing findes** (samme formulering i afsnit 9) **[V-11]**.

---

## 8. Codex' egen opsætning — 22 punkter, revideret klassifikation **[V-7, V-8]**

**Ind nu, snævert (Trin A):** 5+15 sandbox efter aktivitet (A5) · 7+20 log faktisk konfiguration (A3) · 4 identitets-tjek før skrivehandling (CLI = stork-code-bot, GitHub-integration = copenhagensales) · 3 kort projekt-AGENTS.md m. henvisning til rolletekster/plan · 10 versioneret `.codex/` i projektet · 22 måling = retro-kpi (afsnit 6). **Globale regler, trust-poster og nye skills følger IKKE med dette ok.**

**Legacy-kæden (pkt. 1, 2, 16, 17, 18, 19, 21 — `scripts/kaede/*`, `codex-review.sh`):** uden for v5's direkte kaldesti — **men ikke uden afhængigheder:** `.github/workflows/ci.yml:113` kører `pnpm kaede:selftest`; en systemd-brugerservice `stork-kaede.service` er installeret (inaktiv, disabled, peger på det gamle checkout). Pkt. 16 er ikke automatisk fail-open (adapterens succes = leveret fil); pkt. 18 er delvist løst (tmp + atomisk mv). **Afvikling tages UD af dette ok** og planlægges som eget spor: afstem CI · npm-scripts · doc-henvisninger · servicefil → derefter flyt til foraeldet. Retning = pensionér.

**Hygiejne (senere spor, ingen Mathias-ord):** 8 kortere obligatorisk kontekst · 9 git-sync-regel · 11 global AGENTS.md · 12 projekt-skills · 13 lange DB-kommandoer → scripts · 14 forældede trust-poster + Node-22-regel.

**Mathias' ord:** 6 tænke-niveau = **VENT** (M-39, uændret).

---

## 9. IKKE-listen

Skær ikke suiten efter antal (52 reelle red-team-fund bag) · 3-blind recon + hård konflikt-bevaring · fresh-eyes + P-4 som to leverandører · devil på ny tekst · omission ét pas · hærdet-register uden undtagelser · OID-binding + orderedApproval + re-bind pr. blob · effect-harness + mutant-kill · held-out slutprøve m. anti-cherry-pick og canaries · ledger verbatim · effort-sænkning (VENT) · **flere pakker samtidig før pakke 2 er kørt rent og pakke-stier findes** **[V-11]** · katalog som ERSTATNING for frit angreb (opslag + frit pas, altid begge) **[V-3]**.

---

## 10. Beslutninger til Mathias — 8, ikke 13 **[V-10]**

Fjernet fordi de er udførelse af allerede afgivne ord (M-31/33/35/39/40) eller mekanik: v1-nr. 3 (pins håndhæves) · 5 (beskriv≠luk) · 6 (bevisform før lås — dømmes ved `plan ok`) · 7 (fund-log) · 9 (sandbox/identitet/AGENTS — lokal håndhævelse). Udskudt: v1-nr. 10 (legacy) til eget spor efter afstemning. Nr. 12 delt i to.

| Nr | Beslutning (ét-ords-svar) | Anbefaling |
|---|---|---|
| 1 | Fase 3 runde 2 køres som ét samlet rettelses-batch + delta på berørte krav/negativer/afhængigheder + frit helheds-pas, afsluttet af den eksisterende code-reviewer som frisk slutlæser | ja |
| 2 | Krav-, plan- og slut-godkendelser bindes fremover til en færdig, devil-REN fremlæggelse og dens beviser gennem en registreret kvitterings-kæde (rækkefølgen i princip 9); rækkefølge-krav slås til på plan-gaten | ja |
| 3 | Arbejdsgrundlag, regler og værktøjer fryses pr. kørsel; ændringer kræver ny synlig versionsbinding før berørte domme genbruges | ja |
| 4 | Driver og fabrik-bygger adskilles i to sessioner fra nu (fremrykket fra pakke 2); driveren forbliver eneste postkontor | ja |
| 5 | Fase 4: højst ét efterfølgende bid startet uden det forriges review; delt skema/rettighedskerne afventer review | ja |
| 6a | Fra pakke 2: krav-skelettet vises i den eksisterende forretningsdialog før den fulde krav-tekst (ingen ekstra gate) | ja |
| 6b | Fra pakke 2: filter-/omission-katalog før recon, plan-skelet før krop, spørgsmål m. stabile id'er — alt med frosne input, dokumenteret feedback-rækkefølge og bevaret frit uafhængigt pas | ja |
| 7 | Luk: masterplan-diff + workflow-diff + mekaniske nøgletal fremlægges samlet og godkendes med ét ord | ja |

Et samlet ok gælder **arbejdsmetoden**. Det er IKKE `plan ok` til plan v1. Et »nej« til et punkt slår aldrig eksisterende pins eller M-40 fra.

---

## 11. Vejen videre

1. Mathias' samlede ok på afsnit 10.
2. **Trin A** (fabrik-arm, egen session): A1 arkivering FØRST → A2-A8 → A9 frisk driver m. overdragelse @ `bd5c51a` + dette dokument (M-41).
3. **Trin B** (driver): B1 blindt kill-list-udkast ∥ B2 forventningsliste → B3 fold-ind → B4 delta + frit pas → B5 gate-bindinger → B6 verdikter → B7 kvittering → `plan ok`.
4. **Trin C** (fabrik-arm, parallelt med B): C1-C4 færdige før første bid bygges.
5. Fase 4 m. blind harness ∥ builder; chain-proof-harness bygges undervejs; Fase 6 forberedt.
6. **Retro-KPI måles** på denne pakke som baseline — ingen tidsbesparelse loves før den er målt.
