# Flow-analyse af v5-workflowet, Fase 0-6 + tværgående — Claude-analytiker

**Grundlag:** repo pinnet til HEAD `d5cb478` (kl. 17:02), hele planen (329 linjer), 9 rolletekster, gates/hooks/driver/verdikt-byg/codex-run/krav-gate-run/preflight/register, alle 34 filer i `plan-build/lokations-skabelon/`, `recon/`, driverens `tmp/` (fase2 · fase3 · m40 · minipas-m39 inkl. provenance/logs), driverens transkript (561 værktøjskald med tidsstempler, 8 Agent-spawns, 45 codex-kald), `npm run -s v5:selftest` kørt, samt de fire tidligere analyser (læst for at gå videre, ikke gentage). Arbejdsnoter: `scratchpad/flow/claude-work/NOTER-evidens.md`.

**Fem fakta der ikke står i de tidligere analyser (fundet i dag, kl. 17:00-17:10):**

1. **Transport-hang kostede 54 min på Fase 3's kritiske vej.** `codex-run.sh` (M-39 pkt. 1) sendte prompten som argument men lod stdin stå åben → codex skrev »Reading additional input from stdin...« og ventede. Angrebet på planen (start 16:14:31) producerede intet i 54 min; driveren patchede wrapperen (`< /dev/null`) kl. 17:08:10 og genstartede angreb + P-4 + batch-pas. Det P2-pas der skulle hærde `verdikt.mjs` (minipas) blev dræbt to gange (2083 s og 900 s) → BLOKER. Samme wrapper havde et fail-open-hul ved HEAD: `scripts/v5/codex-run.sh:27` sætter `.done` ved rc=0 uden at kræve output-fil (driveren så »pkill → rc=0, ingen fil«). Patchen er **ucommittet** — de kørsler der nu er i gang, kører på en transport uden OID.
2. **HEAD er ikke grøn.** Hærdet-registret: 5 røde (`codex-run.sh`, `krav-gate-run.mjs`, `verdikt-byg.mjs` MANGLER · `verdikt.mjs`, `consolidate-recon.mjs` ÆNDRET siden pas). `actors.lock`: 3 stale skill_oids (planner-code · code-reviewer · codex-angreb ændret i `6ab0716` uden regen). Det kørende angreb bruger rolletekst @ `ec4a3d9` (før D10/D14) — plan-gaten dømmer med D10. Mathias' proces-canary »u-hærdet transport i drift → register rød« er sand lige nu; ingen stoppede.
3. **Kill-list-udkastet i planen er skrevet af planneren, ikke Codex.** `plan.md:24`: »Kill-list-UDKAST pr. K står under hvert K«. Rolleteksten `codex-angreb.md:37-42` siger Codex skriver den og den skal foreligge ved plan-gaten. Codex' uafhængige kill-list findes ikke som artefakt — Codex angriber kun plannerens.
4. **Ledestjernens mønster er allerede bevist én gang i pakken:** P-8 (Codex) startede 15:39:45, planneren 15:39:26 — begge på frosset krav-blob + recon2-blob, blindt for hinanden; P-8 blev færdig 15:57 (17 min), planneren 16:12 (33 min); afstemningen er angrebets akse (6). Men `plan.md:604` skriver »planens §1-matrix er dens input« — det modsatte af kørslen.
5. **Krav-runde 2 omskrev 107 af 400 linjer (66+/41−, `727ba0b→b474d29`) efter ét struktur-ord (M-17).** Gruppe-ordet fandtes allerede 2/9 (M-27c); fremlæggelse-1 (3/9 18:26) viste K-3/K-6 på »klient × lokation«. Et 9-linjers K-skelet havde vist forskydningen før kroppen var skrevet.

---

## 1. Flow-kort

### Fase 0 — Åbning

| Skridt | Aktør/model | Input frosset? | Skal ligge før | Kostede i pakke 1 | Fandt | Forbedring |
|---|---|---|---|---|---|---|
| `qwers` → `launch/launch.json` | Mathias (mgrubak) + driver | ja (anker-OID `e6c9a715`) | intet | 41 s (14:06:06→14:06:47) | — | ingen. Rigtigt som det er. |

### Fase 1 — Recon (13/8, 67 min, 14:06→15:13)

| Skridt | Aktør/model | Input frosset? | Skal ligge før | Kostede | Fandt | Forbedring |
|---|---|---|---|---|---|---|
| Bundle + `flade_filter` | driver | ja (anker + 2 låste docs @ OID) | launch | 4 min (14:10) | 174 af 309 punkter | filteret er recon's *skelet* — det dømmes i dag EFTER kroppen (se F-4) |
| 3 blinde aktører | recon-Code (Agent) · recon-Codex (`codex exec` xhigh) · recon-Claude.ai (Agent, docs-only) | ja (bundle-OID) — men **bundlet skiftede mid-flight** (M-2 14:52 → re-bind ×2 + codex re-run) | bundle | 14:14→~14:45 (claude-ai 10 min · codex 22 · code ~31) + re-bind 2 min | 182/78/33 fund | allerede parallelt; driveren byggede `consolidate-recon.mjs` + `recon-gate-run.mjs` imens (rigtigt) |
| Konsolidering | `consolidate-recon.mjs` | ja (3 kandidater) | aktører | 14:45→14:56 | 216 id'er · 77 divergenser · 29 usikkerheder | D15 (M-40) håndterer divergens-default |
| Omission-devil (2 akser) | Codex xhigh | ja (recon-commit) | recon.md | pass 1: 7,3 min → **1 fund (akse a, filter)** → filter-fix → re-bind ×2 + codex re-run → recon v2 → pass 2: 3,8 min → PASS. Loop = 9 min + 2 commits | 1 reelt hul (p0_gdpr) | **F-4**: akse a (filter) FØR aktørerne på frosset bundle → 0 re-bind |
| Coverage-proof + gate | `recon-gate-run.mjs` | ja | devil PASS | 22 s | open:true | worktrees slettet 15:14 FØR arkivering → provenance-tab (allerede lukket som regel) |

### Fase 2 — Krav (2/9→8/9; aktive bursts ≈ 9 t, venten ≈ 5 d 18 t)

| Skridt | Aktør/model | Input frosset? | Skal ligge før | Kostede | Fandt | Forbedring |
|---|---|---|---|---|---|---|
| Handover + 3-bøtte + spørgerunde | claude-ai-session (Fable xhigh) + Mathias | recon @ OID: ja · Mathias live: nej | recon-gate | 2/9-3/9; ~16 krav-svar i 6 runder (M-32-klagen) | M-12..M-14, M-23..M-30 | **F-5**: K-skelet (9 linjer + M-ord pr. K) som sidste led i 3-bøtte-præsentationen, FØR kroppen |
| Krav-udkast (krop) | claude-ai-session | ledger + låste docs: ja · struktur: **nej** (M-17 vendte K-3/K-6 efter fremlæggelse-1) | spørgerunden | v1 400 linjer; runde 2 omskrev 107 linjer | — | F-5 |
| Fresh-eyes-audit | frisk Fable-instans (Agent a3be71d) | ja (udkast-blob) | udkast committet | 11 min → **10 fund**; re-audit 7 min; 3 addenda 3-4 min → 0/0/0 | 8 afledninger + 2 fejl-citater | rigtigt; addenda af SAMME instans (hurtigt, men dømmer egne lukninger) |
| P-4 kildetjek | Codex xhigh | ja | udkast-blob | 20 min → 377 rækker → **4 fund (2 materielle; F-03 slap gennem Claude)** | cross-vendor-værdi bevist | batching = M-39 pkt. 2 (afgjort) |
| Upload | driver-automatik (M-34) | ja | REN audit | 1 min pr. blob × 5 blobs | — | afgjort |
| Buildability | code (Agent) ∥ codex (xhigh/high) | ja (upload-commit) | upload | r1 15 min · r2 13 · r3 4 · r4 4 · r4b 2 = **5 runder, 10 verdikter, 10 PASS** | r1 3 Q · r2 N1-N4 · r3/r4/r4b 0 | delta-re-bind virker; r4b skyldtes citat-scope (nu fanget tidligt af `verdikt-byg.mjs:41-54`) |
| Fremlæggelse + spørgsmåls-devil | claude-ai + Codex-devil | krav-blob: ja | buildability | fremlæggelse-2: **4 versioner på 15 min** (14:14→14:29), 3 devil-pas: 5 form-fund + 6 troskabs-fund + PASS | 11 rettelser før Mathias så teksten | **F-6**: troskabs-listen genereres mekanisk fra blobben → første devil-pas = opslag; løkken 3→1 |
| `krav ok` + gate | Mathias · `krav-gate-run.mjs` | ja | fremlæggelse | M-37 holdt (F-runde åben) → M-38 15:06 → gate 15:12 | orderedApproval virkede | afgjort (M-39 pkt. 2) |

### Fase 3 — Plan (8/9 15:12 → kører)

| Skridt | Aktør/model | Input frosset? | Skal ligge før | Kostede | Fandt | Forbedring |
|---|---|---|---|---|---|---|
| recon-2 | recon-Code (Agent) ∥ recon-Codex (xhigh) | ja (krav 9402164d · recon-1 · bilag) | krav-gate | 15:14→15:38 = 24 min (code 17 · codex 23); fuld bevaring, ingen dedupe → 134 KB | Code: V1-V13 + 7 usikkerheder · Codex: P01-P14 + H1-H8 + E001-E209 | recon-2's V/P/H-lister ER 70 % af et angrebs-katalog — gør det til kontrakt (F-1 variant B) |
| Planner | planner-Code (Fable xhigh, frisk) | ja (krav + recon2 + bilag + ordbog + ledger) | recon2 | 15:39→16:12 = **33 min** → 604 linjer, 56 matrix-rækker, 29 afgørelser, 0 krav-returer | — | **F-2** skelet-commit (§1+§3 = 39 % af bytes) efter ~12-15 min |
| P-8 slutprøve-spec | Codex xhigh | ja — **∥ planner, blind** | krav + recon2 | 15:39→15:57 = 17 min | N1-N9 canaries, 9 mutant-frø, C0-C10 | rigtigt; ret `plan.md:604`-påstanden |
| Kill-list-udkast | **planneren** (skal være Codex) | — | — | inkluderet i plannerens 33 min | 10 blokke | **F-1**: Codex' blinde kill-list-udkast ∥ planner |
| Codex-angreb | Codex xhigh (`codex-run.sh`, 2400 s) | ja (plan-blob 423d9b20 @ ec4a3d9; rolletekst @ ec4a3d9 = før D10) | plan committet | 16:14:31 start → **stdin-hang 54 min** → genstart 17:08:10 → kører. Input ≈ 620 KB | (afventer) | **F-3** transport; F-1 gør første pas til opslag; anden runde = delta-verifikation, ikke fri runde |
| Fresh-eyes (plan) ∥ P-4 (plan) | a3be71d (samme instans som krav-auditen) ∥ Codex | ja (samme blob) | plan committet | start 16:53 (40 min efter plan-commit — driveren lavede M-40) · P-4 hang → genstart 17:08 | (afventer) | tre kørsler på én blob = rigtigt; F-11 frisk instans pr. artefakt |
| Plan-gate | code-reviewer · codex · claude-ai + Mathias | — | angreb tømt + audit REN + ordbog | ikke kørt | — | claude-ai-verdikt kræver Mathias' nye session; F-6 gælder plan-fremlæggelsen |

### Fase 4 — Build — **DESIGN-ANALYSE (ikke kørt; planens tekst `:199-204` + koden)**

| Skridt | Aktør | Input frosset? | Skal ligge før | Design-omkostning | Forbedring |
|---|---|---|---|---|---|
| Angrebs-spec pr. bid | Codex | ja (låst plan-SHA) | byg af biddet (`hooks.mjs:198` kræver committet spec) | sekventielt pr. bid → builder venter | **F-7a**: alle 5 specs skrives i pipeline (bid N+1 mens builder bygger N) |
| Effect-harness + mutanter | Codex (måle-lag `test/v5/**` — findes ikke endnu) | ja: planens harness-form er komplet (indgang · rolle · slut-effekt · SQLSTATE; navne S-14/S-15) | — | i dag uspecificeret hvornår | **F-7b**: skrives fra planen PARALLELT med builder, blind for diffen → første prover-kørsel = opslag; blind harness er også 1:1-detektor |
| Builder | builder-Code (frisk) | ja (plan-SHA) | angrebs-spec | 5 bids | fix-loop bundet (rigtigt) |
| build-proof | `build-proof.mjs` + sandheds-motor | ja | M-40 C (kobling) | — | afgjort (M-40) |
| P-7 diff-review | Codex pr. bid, bundet til base_oid | ja | diff committet | eneste ægte sekventielle led | async_reviews lader builder fortsætte at-risk (rigtigt) |

### Fase 5 — Sandhed — **DESIGN-ANALYSE**

| Skridt | Aktør | Input frosset? | Skal ligge før | Forbedring |
|---|---|---|---|---|
| chain-proof-harness (CI-job, data-udvælgelse §1, canaries N1-N9, kæde C0-C10) | Codex/CI | ja (P-8-spec c512106 + låst plan) | held-out fetch | **F-8**: bygges UNDER Fase 4 (måle-lag) → Fase 5's kritiske vej = kørselstid. `proofs.mjs:147-151` fail-lukker korrekt indtil da |
| held-out fetch EFTER build | CI | nej (bevidst — anti-tailoring) | build-gate | uændret |

### Fase 6 — Luk — **DESIGN-ANALYSE**

| Skridt | Aktør | Input frosset? | Forbedring |
|---|---|---|---|
| Repo-docs 1:1 fra plan §6 (3 doc-blokke) | driver | ja (plan-SHA) | **F-9a**: doc-diffs forberedes ved plan-lås, appliceres byte-identisk ved luk |
| Retrospektiv + 3 KPI-tal | driver | ja (ledger · audits · verdikter) | **F-9b**: `retro-kpi.mjs` tæller mekanisk (M-40 E19 kræver det — værktøjet mangler) |
| Masterplan-diff + workflow-diff godkendelse | Mathias | — | **F-9c**: ÉN luk-fremlæggelse, ét ord (kræver Mathias' ord) |
| P-9 luknings-efterprøvning | frisk Codex | ja | uændret |

### Tværgående

| Mekanisme | Fandt i pakke 1 | Tilstand ved HEAD | Forbedring |
|---|---|---|---|
| Driver = én seriel session | 145 kald/112 min 8/9; fresh-eyes for planen startede 40 min efter plan-commit pga. M-40-arbejde | — | M-39 pkt. 4 (afgjort) |
| Gate-kerne + verdikt-kontrakt | r4 afvist for citat-scope (fail-closed virkede); M-37 holdt af orderedApproval | grøn | rigtigt |
| Hooks/commit-zoner | 0 zone-brud siden aa6ba0b | — | **F-10**: rolletekst uden lock-regen skal afvises af hooken |
| Hærdet-register | fangede B2-ændring 3/9 | **5 røde** | F-10 |
| actors.lock | pin M-31/M-33 | **3 stale** | F-10 |
| Spørgsmåls-devil | 18 fund på ny tekst · 0 på re-pas | — | F-6 |
| Fresh-eyes + P-4 | 10 + 4 fund, forskellige | — | F-11 (frisk instans pr. artefakt) |
| Ledger/ordbog | 40 M-entries, heraf 12 workflow-doms/relæ; ordbog 6 plan-entries appended EFTER plan | — | ordbogs-entries hører til skelettet (F-2) |
| Mathias-fladen | ~16 krav-svar i 6 runder; 2 upload-ord (afskaffet); 2 ok (M-37 holdt) | — | F-5, F-9c |

---

## 2. Forslag

### F-1 · Blindt angrebs-katalog ∥ planskrivning — Codex' egen kill-list før den ser planen
- **Fase/skridt:** Fase 3 pkt. 2-3 (planner + Codex-angreb).
- **Hvad:** Mens planneren skriver, bygger Codex (codex-angreb-rollen, eget worktree, læseforbud mod planner-worktree) et katalog fra de FROSNE input: (K1) beslutnings-tjekliste — alt planen SKAL afgøre (kravets 13 plan-fase-valg `krav.md:179-182` + recon-2's V1-V13/P01-P14/H1-H8 + navne/typer/SQLSTATE/filnavne-klasser); (K2) pr. afvisnings-acceptkriterie (53 ac, 45 struktur-bullets): forventet værn + én meningsfuld mutant (D10) + harness-form; (K3) fejl-klasser pr. K (de 4 recon-2-faldgruber + H-flags); (K4) P-8-bindingskrav. Første angrebs-pas = opslag »hvilke katalog-punkter dækker planen ikke«, plus én bevidst fri DYBDE-akse uden katalog-anker.
- **Hvor:** `plan.md:24` (planneren skrev kill-list-udkastet) · `codex-angreb.md:37-42` (Codex skal skrive det, det skal foreligge ved gaten) · `planner-code.md:29-31` · angreb-prompten `tmp/fase3/angreb-prompt.txt` (6 fri akser på 620 KB input).
- **Mønster:** frosset-input-parallelitet + løkke-reduktion + uafhængighed.
- **Gevinst:** *Tid:* kataloget koster 0 på kritisk vej (P-8 tog 17 min ∥ plannerens 33); den fri angrebsrunde (≥40 min xhigh, i dag stadig ikke afsluttet) bliver et opslag (skøn 10-15 min); anden runde bliver delta-verifikation → 1-2 runder i stedet for »til angrebet er tømt«. *Resultat:* kill-listen får for første gang en cross-vendor uafhængig kilde FØR plannerens er set — i dag angriber Codex kun Claude's egen liste (fælles blind vinkel).
- **Pris i beskyttelse:** lav — angriberen kan jagte sin egen liste (briefens advarsel); mitigering: fri akse i samme pas + code-reviewer/fresh-eyes (Claude) de-korrelerer ved gaten.
- **Forudsætning:** prompt + rolletekst-præcisering (timing); driveren committer kataloget FØR planen ses (commit-orden = blindheds-bevis).
- **Kræver Mathias' ord?** Ja (rolletekst codex-angreb/planner-code er AAA-godkendt → P-6-pas + hans ord).
- **Anbefaling:** **denne pakke, Fase 3 runde 2** (efter det kørende angreb: fold-in → delta-verifikation, ikke ny fri runde); fuldt katalog fra pakke 2. Se afsnit 3 for variant B (billigst).

### F-2 · Skelet-før-krop i planen
- **Fase/skridt:** Fase 3 pkt. 2.
- **Hvad:** Planneren committer først skelettet: §1 matrix-rækker (én linje pr. ac: bid·step · indgang · slut-effekt · afvisning), §2 bid-liste (leverer K · afhænger af · done · risiko), §3 afgørelser (valgt udfald + én linje), §4 ordbogs-entries. Status `SKELET`. Angriberen dømmer strukturen (bijektion 56 rækker ↔ 53 ac · rækkefølge · alle 13+16 valg afgjort · ordbog · faldgruber adresseret) mens kroppen (DDL/RPC-specs · kill-loci · doc-tekst) skrives. Regel: ændrer kroppen skelettet → eksplicit skelet-diff, aldrig tavst.
- **Hvor:** `plan.md:22-154` (§1) + `:446-497` (§3) = 34,7 KB af 89 KB (39 %) · ordbogs-entries appended af driveren 16:13 EFTER planen (`ordbog.md` »Plan-fasens navne-entries«).
- **Mønster:** skelet-først.
- **Gevinst:** *Resultat:* struktur-fund (forkert bid-split, uafgjort valg, navne-afvigelse) når planneren før 291 linjer krop (§2) er skrevet på en forkert struktur. Evidens fra Fase 2: ét struktur-ord kostede 107/400 omskrevne linjer. I planen ville en forkert S-1 (to-tabel-model) eller V9 (én-model-ting) invalidere DDL for 5 bids. *Tid:* struktur-passet (≈10 min) ligger helt inde i plannerens krop-tid.
- **Pris i beskyttelse:** lav-mellem — angriberen ser et mål der KAN flytte sig (netop briefens »forkert parallelitet«); derfor skal skelettet være COMMITTET (frosset OID) og krop-ændringer af skelettet deklareres. To ekstra commits.
- **Forudsætning:** rolletekst planner-code.md (output i to trin) + driver-instruks.
- **Kræver Mathias' ord?** Ja (rolletekst).
- **Anbefaling:** pakke 2.

### F-3 · Transport-selvtest med mock-codex + smoke gennem den reelle kaldevej
- **Fase/skridt:** tværgående (Fase 3 i dag).
- **Hvad:** (a) commit patchen (`< /dev/null` + ikke-tom-output-krav); (b) `codex-run.selftest.mjs` med et falsk `codex` på PATH der (1) fejler hvis stdin ikke er lukket/`/dev/null`, (2) exiter 0 uden output → wrapperen SKAL returnere 1, (3) simulerer timeout → præcis ét retry, samme effort, (4) succes → `.done`; (c) obligatorisk 10-sekunders smoke (»sig OK«) gennem PRÆCIS samme kaldevej (baggrund + `-o` + markører) efter enhver wrapper-ændring, før første gate-relevante kørsel.
- **Hvor:** `scripts/v5/codex-run.sh:23` (HEAD: uden `< /dev/null`) · `:27` (fail-open: rc=0 uden fil = done) · transkript 15:56:52→16:16:32 (tre wrapper-versioner testet på det rigtige P2-pas i stedet for en smoke) · `tmp/fase3/angreb-out/OUT-angreb-log.md.provenance` (start 16:14:31, genstart 17:08:10) · `tmp/minipas-m39/out.md.provenance` (2083 s + 900 s → BLOKER).
- **Mønster:** forbygning (transport).
- **Gevinst:** *Tid:* 54 min tabt på angrebet i dag + ~50 min minipas + 15-17 min P-4/batchpas = ~2 t aktør-vægur; med selvtest + smoke ≈ 0. *Resultat:* fail-open-hullet (rc=0 = done) lukkes med regressions-case (P4-reglen) — det var netop batch-passets punkt 4, og passet sad selv fast i hullet.
- **Pris i beskyttelse:** ingen.
- **Forudsætning:** ~40 linjer selvtest; register-entry for `codex-run.sh` (F-10).
- **Kræver Mathias' ord?** Nej.
- **Anbefaling:** **nu** (patchen er ucommittet mens gate-relevante kørsler bruger den).
- *Ærlig note:* minipas attempt 1 blev dræbt efter 2083 s trods timeout 900 s (attempt 2 præcis 900 s). Årsag ukendt — nærmeste forklaring er en ur-/pause-anomali i WSL2. Provenance-varighed = vægur; timeout = monotont ur. Skriv begge.

### F-4 · Filter-angrebet FØR recon-aktørerne (recon's skelet dømmes først)
- **Fase/skridt:** Fase 1 (omission-devil akse a).
- **Hvad:** Devilens `filter_angreb` kører på det frosne bundle + surface-309 (kræver ikke recon.md) FØR de tre aktører spawnes (≈5-8 min). Aktørerne binder én gang til et devil-dømt filter. `pakke_flade_angreb` (akse b) kører som i dag efter konsolidering.
- **Hvor:** plan `:151` (devil efter konsolidering, begge akser) · `proofs.mjs` (omission_devil bundet til recon_commit) · transkript 13/8: devil pass 1 14:57→15:04 → fund p0 (akse a) → filter-fix 15:05 → re-bind ×2 + codex re-run 15:06 → recon v2 15:08 → devil pass 2 15:09→15:13.
- **Mønster:** skelet-først + løkke-reduktion.
- **Gevinst:** *Tid:* det ene reelle devil-fund var et filter-fund → hele loopet (re-bind ×2, codex re-run, recon v2, devil pass 2 = 9 min + 2 commits + den spildte akse-b-halvdel af pass 1) forsvinder: ≈12-15 min pr. pakke. *Resultat:* aktør-attesterne bindes én gang (ingen mid-flight bundle-skift).
- **Pris i beskyttelse:** ingen — samme dommer, samme input, begge akser attesteres stadig.
- **Forudsætning:** to devil-prompts; `proofs.mjs` skal acceptere akse a bundet til bundle-OID (pinnet modul → Codex-pas).
- **Kræver Mathias' ord?** Nej (plan Fase 1-tekst er struktur, ikke hans regel; D15 viser præcedens).
- **Anbefaling:** pakke 2.

### F-5 · K-skelettet fremlægges før kroppen (Fase 2)
- **Fase/skridt:** Fase 2 pkt. 2→3 (overgang fra 3-bøtte-præsentation til udkast).
- **Hvad:** 3-bøtte-præsentationen afsluttes med K-skelettet: 9 linjer (K-n · HVAD i én sætning · de M-ord/låste-doc-linjer K hviler på · bord-flyt-liste). Mathias siger stop eller intet. Først derefter skrives acceptkriterier og dispositioner. Ikke en godkendelse — et struktur-stoptjek inden for M-34's ene fremlæggelse.
- **Hvor:** `fremlaeggelse-1.md:10-13` (K-3 »gruppe som ejer«, K-6 »klienter kobles på de enkelte lokationer«) vs. M-27c 2/9 (»så gruppe ejer lokationen«) og M-17 3/9 · diff `727ba0b→b474d29` 66+/41− af 400 linjer · audit FC-1 (»aftaler pr. lokation« fandtes ikke i ledgeren).
- **Mønster:** skelet-først + Mathias-belastning.
- **Gevinst:** *Tid:* runde 2 (omskrivning + ny ledger-runde + ny fresh-eyes + 114 t til re-konvergens) erstattes af ét kort stoptjek før kroppen. *Resultat:* struktur-fejl i K-inddelingen (den farligste falsk-grøn: »internt komplet, eksternt forkert«, DEL VII) fanges hvor de er billigst.
- **Pris i beskyttelse:** ingen. Mathias-belastning: +1 kort tur (9 linjer), −1 fuld fremlæggelses-runde.
- **Forudsætning:** rolletekst claude-ai.md (præsentations-afsnittet).
- **Kræver Mathias' ord?** Ja (hans fremlæggelses-regler M-6/M-34).
- **Anbefaling:** pakke 2.

### F-6 · Troskabs-listen genereres mekanisk fra blobben — devilens første pas bliver et opslag
- **Fase/skridt:** tværgående (spørgsmåls-devil P-3), næste gang: plan-fremlæggelsen.
- **Hvad:** Et lille script udtrækker fra den frosne krav-/plan-blob de bindende dele en fremlæggelse SKAL bære: alle »Struktur (umuligt)«-punkter (45), IKKE-i-scope-linjer (8), plan-fase-valg (13), »afledt/bekræftes«-markeringer, ærligt-forbehold. Forfatteren skriver mod listen; devilens P-3-pas afkrydser den (tabt punkt = fund) og bruger dømmekraften på form/bord-test.
- **Hvor:** `fremlaeggelse-2.md` historik: 4 versioner 14:14→14:29 (c9e1289 → 0e1c2bd → e7d26aa → 40fadec) · devil-fund v2.2: »plan-fase-punkter · daterede ændringer · særregler pr. type · persondata-nedgradering + lokations-forbehold · læse-ret · åbne hvile-afgørelser« — alle 6 er blob-udtrækkelige · plan `:126` (P-3).
- **Mønster:** frosset-input-forberedelse + løkke-reduktion.
- **Gevinst:** *Tid:* 3 devil-pas → 1-2 (≈8-10 min + 2 SendMessage-ture pr. fremlæggelse). *Resultat:* tabte negativer fanges deterministisk, ikke kun af modellen.
- **Pris i beskyttelse:** ingen — devilen kører stadig; listen er tillæg.
- **Forudsætning:** ~40 linjer script (driver-mekanik, ikke rolletekst).
- **Kræver Mathias' ord?** Nej.
- **Anbefaling:** **nu** (før plan-fremlæggelsen).

### F-7 · Fase 4: harness og angrebs-specs skrives blindt fra den låste plan, parallelt med byggeren — DESIGN
- **Fase/skridt:** Fase 4 pkt. 1-3.
- **Hvad:** (a) Codex skriver alle 5 bids' angrebs-specs i pipeline (N+1 mens builder bygger N). (b) Codex skriver effect-harness + mutanter for bid N fra planens harness-form (indgang · rolle · slut-effekt · SQLSTATE; alle navne er fastlagt af S-14/S-15) PARALLELT med at builder bygger N, blind for diffen. Builderens første prover-kørsel = opslag. Afviger diffen fra planens navne, går harnessen rød = 1:1-brud → HALT (det er en feature).
- **Hvor:** plan `:200-202` · `hooks.mjs:141-199` (spec skal være committet før skriv; harness-tidspunkt uregul.) · `plan.md:22-24` (harness-form pr. række) · `plan.md:585-593` (build⊨plan: alle navne fastlagt) · `test/v5/` findes ikke endnu.
- **Mønster:** frosset-input-parallelitet + uafhængighed.
- **Gevinst:** *Tid:* harness og specs ud af kritisk vej efter build. *Resultat:* spec-afledte tests i stedet for kode-afledte → teach-to-the-test bliver strukturelt sværere (`builder-code.md:69-72`).
- **Pris i beskyttelse:** lav — små navne-rettelser hvis planen var ufuldstændig (men det er selv et 1:1-fund).
- **Forudsætning:** M-40 C (sandheds-motor koblet) · pg-runner · `test/v5/`.
- **Kræver Mathias' ord?** Nej for tidspunkt (planen regulerer kun »spec før byg«); P-6-pas ved rolletekst-præcisering.
- **Anbefaling:** denne pakke, Fase 4. **Design-analyse, ikke empiri.**

### F-8 · Fase 5: chain-proof-harness bygges under Fase 4 — DESIGN
- **Fase/skridt:** Fase 5.
- **Hvad:** CI-job, data-udvælgelses-generator (P-8 §1), canary-generatorer N1-N9, kæde C0-C10 og `chain-proof`-verifieren bygges fra P-8-spec + låst plan mens Fase 4 kører (måle-lag). Kun held-out-fetch sker efter build.
- **Hvor:** `p8-slutproeve-spec.md:139-234` · `proofs.mjs:147-151` (fail-lukker: »endnu ikke bygget«) · plan `:206-208`.
- **Mønster:** frosset-input-parallelitet.
- **Gevinst:** Fase 5's kritiske vej = kørselstid. **Pris:** ingen (anti-tailoring intakt). **Forudsætning:** P-8-beskæring ved plan-gaten (M-40 E20, afgjort). **Mathias' ord?** Nej. **Anbefaling:** denne pakke, parallelt med Fase 4. **Design-analyse.**

### F-9 · Fase 6: forberedt doc-diff, mekaniske KPI-tal, én luk-fremlæggelse — DESIGN
- **Hvad:** (a) doc-diffs fra plan §6 (3 blokke) genereres ved plan-lås og appliceres byte-identisk ved luk; (b) `retro-kpi.mjs` tæller de 3 KPI-tal fra ledger/audit/verdikter (M-40 E19 kræver mekaniske tal — værktøjet mangler); (c) masterplan-diff + workflow-diff + KPI i ÉN luk-fremlæggelse → ét ord.
- **Hvor:** plan `:211-213` · `plan.md:534-585`.
- **Gevinst:** −1 Mathias-tur; doc-arbejde ud af kritisk vej; KPI-tal der ikke er aktør-ord. **Pris:** ingen. **Mathias' ord?** Ja for (c). **Anbefaling:** denne pakkes luk. **Design-analyse.**

### F-10 · Rolletekst → lock-regen → register som ÉN atomisk bevægelse (hook-håndhævet)
- **Fase/skridt:** tværgående (hooks/commit-zoner · register · actors.lock).
- **Hvad:** pre-commit i fabrik-zonen afviser: `roller/*.md` staged uden `actors.lock.json` staged; nyt modul i GATE_ENTRYPOINTS/ARTEFAKT_PRODUCENTER uden register-entry. Plus: `krav-gate-run.mjs:39` parametriseres (pakke-agnostisk verdikt-fil-navn, ikke `r4b`).
- **Hvor:** HEAD d5cb478: `actors.lock` 3 stale (planner-code b8dda6bc→ce8ebf5c · code-reviewer 709ffee3→1c99ae68 · codex-angreb 1550fe80→c9ec5725, ændret i 6ab0716) · register 5 røde (`haerdet-register.selftest.mjs:21-24` kender nu producenterne, `haerdet-register.json` mangler dem) · `hooks.mjs:221-265` (commitZoneDecision) · det kørende angreb bruger rolletekst @ ec4a3d9 (pr.-knap-reglen) mens plan-gaten dømmer med D10.
- **Mønster:** forbygning + uafhængighed (provenance).
- **Gevinst:** *Resultat:* proces-canaryen »u-hærdet transport i drift« er sand ved HEAD og gik ikke rød for nogen — hooken gør den rød ved kilden. *Tid:* 0.
- **Pris:** ingen. **Forudsætning:** ~20 linjer i hooks + register-entries efter batch-passet. **Mathias' ord?** Nej (hans regel 2026-09-03 håndhæves). **Anbefaling:** **nu.**

### F-11 · Frisk fresh-eyes-instans pr. artefakt
- **Hvad:** Plan-auditen sendes til en NY instans; samme instans genbruges kun til delta-addenda inden for ét artefakt.
- **Hvor:** transkript 16:53:25 SendMessage til `a3be71d…` (samme agent som 5 krav-audit-runder siden 3/9 18:55) · `antag-aldrig-audit.md:92-187` (re-audit + 3 addenda samme instans; F-03 slap gennem den).
- **Mønster:** uafhængighed. **Gevinst:** blindhed for egne tidligere domme; +5 min læsetid. **Pris:** ingen. **Mathias' ord?** Nej. **Anbefaling:** pakke 2 (svag empiri: intet misset fund påvist endnu).

---

## 3. Fase 3-metoden konkret: »blindt angrebs-katalog ∥ planskrivning + skelet-før-krop + ét samlet angreb«

**T0 — krav-gate åben, recon-2 committet (frosne OID'er: krav 9402164d · recon2 2bdbb122 · bilag 6e569779 · ordbog · ledger).**
Tre kørsler starter samtidig i hver sit worktree med læseforbud mod hinanden:
- planner-Code (frisk) → skriver skelet, så krop;
- codex-angreb → **angrebs-katalog** `plan-build/<pakke>/angrebs-katalog.md`: K1 beslutnings-tjekliste (13 plan-fase-valg + V1-V13/P01-P14/H1-H8 + navne/typer/SQLSTATE/filnavn-klasser) · K2 pr. afvisnings-ac: værn + meningsfuld mutant (D10) + harness-form · K3 fejl-klasser pr. K · K4 P-8-binding;
- codex P-8 (som i dag).
Blindhed: kataloget committes FØR planneren ser det; planneren ser det først efter sin skelet-commit; Codex ser planen først efter katalog-commit. Commit-rækkefølgen er beviset.

**T1 — skelet-commit (planner, ~12-15 min):** §1 én linje pr. ac · §2 bid-liste (leverer · afhænger · done · risiko) · §3 alle afgørelser med valgt udfald · §4 ordbogs-entries (driveren appender dem NU, ikke efter kroppen). Status `SKELET`.

**T2 — struktur-pas = opslag (Codex, ~10 min, ∥ planner skriver krop):** bijektion (hver ac har række, intet rogue-bid) · K1 dækket? · rækkefølge/afhængigheder · ordbog · K3 adresseret? → `angreb-1.md`. Planneren ser det IKKE før kroppen er committet (én fold-ind, ikke løbende).

**T3 — krop-commit (planner, ~20 min):** DDL/RPC-specs · kill-loci · doc-tekst. Regel: ændrer kroppen skelettet → eksplicit skelet-diff i commit-beskeden; angriberen genlæser kun diffen.

**T4 — ét samlet angreb på plan v1 (Codex; ∥ fresh-eyes ∥ P-4 på samme blob):** K2 pr. ac (matcher planens værn+mutant kataloget? findes-test?) · 1:1 (skjulte build-valg) · K4 · uløste struktur-fund · **én fri DYBDE-akse uden katalog-anker** → `angreb-2.md` (BLOKER/RET/NOTE).

**T5 — ÉN fold-ind** (angreb-1 + angreb-2 + fresh-eyes + P-4) → plan v2.

**T6 — delta-verifikation, ikke fri runde:** Codex + fresh-eyes læser v1→v2-diff mod fund-listen → »alle lukket« eller rest. Rest ≠ ∅ → én runde mere (logges som undtagelse).

**T7 — plan-gate:** code-reviewer · codex · claude-ai mod v2-blob; Mathias-fremlæggelse via devil med F-6-listen → `plan ok`.

**Vurdering.**
*Styrker:* kritisk vej ≈ planner 33 + T4 15 + fold-ind 10 + T6 5 ≈ **65 min** mod i dag 33 + fri runde ≥40 + fold-ind + ny fri runde ≥30 (+ 54 min hang) ≈ 2+ t. Kill-listen får for første gang en cross-vendor-uafhængig kilde. Struktur-fejl fanges før 291 linjer krop. Løkken er defineret som 1 + delta, ikke »til tømt«.
*Svagheder:* (1) katalog-forankring — angriberen jagter sin liste; derfor fri akse i T4 og Claude-øjne (fresh-eyes, code-reviewer) som de-korrelation. (2) Skelettet kan flytte sig under kroppen — regel T3 + frosset OID; ellers er det netop forkert parallelitet. (3) To ekstra commits og en planner der skal stoppe midt i sit flow. (4) Kataloget kan være forkert (i dag ville det være skrevet på rolletekst @ ec4a3d9 = pr.-knap-reglen) → kataloget skal citere D10/rolletekst @ HEAD (F-10).
*Hvad kan gå galt:* Codex skriver konkrete mutanter mod navne der ikke findes → kataloget bærer kun harness-FORM og værn-klasse, aldrig kode (det er Fase 4). Planneren »skriver til kataloget« hvis han ser det for tidligt → commit-ordenen er den eneste garanti.

**Bedre variant (B, billigst):** recon-Codex' output-kontrakt udvides med en eksplicit »planen SKAL afgøre/vise«-tjekliste — R2-K1..K9 · P01-P14 · H1-H8 · »Test- og prover-kontrakt for aftageren« (`recon2.md:403-435`) ER allerede ~70 % af K1+K3. Katalog-tid ≈ 0; Codex-angrebets første pas = opslag mod recon-2's egen liste. Pris: rolle-blanding (kortlægger skriver angrebs-tjekliste) og mangler K2 (pr.-ac mutant). **Anbefaling:** B nu (recon-2 findes), A (separat blind katalog-kørsel) fra pakke 2 hvis B's liste viser sig for tynd. For det igangværende angreb: afbryd ikke; men gør runde 2 til T5+T6 (delta), ikke en ny fri runde.

---

## 4. Rigtigt som det er (med evidens)

- **3-blind recon i parallel + hård konflikt-bevaring:** 3 aktører spawnet inden for 13 s (14:14:12/20/25); 216 id'er; 0 kasseret uenighed. Driveren byggede `consolidate-recon.mjs` mens de kørte.
- **P-8 blindt ∥ planner på frosset input** (15:39:45 vs 15:39:26): mønsteret virker; kun `plan.md:604`-teksten skal rettes.
- **Tre kørsler på ÉN plan-blob (angreb ∥ fresh-eyes ∥ P-4 @ 423d9b20)** med én fold-ind planlagt — det er M-39 pkt. 2 anvendt på Fase 3, korrekt.
- **OID-binding + orderedApproval:** M-37 blev holdt (ok afgivet mod b9c5249b mens F-runden var åben); r4 afvist for citat-scope og `verdikt-byg.mjs:41-54` fanger det nu før gate-eval. r3/r4 fandt 0, men ER beviset for at dommen gælder den blob Mathias skrev ok på.
- **Fresh-eyes + P-4 som to leverandører:** 10 + 4 fund, forskellige; F-03 slap gennem Claude.
- **Spørgsmåls-devil på ny tekst:** 18 fund før Mathias så teksten (7+5+6); troskabs-aksen fandt 6 tabte forbehold i en tekst forfatteren mente færdig.
- **Fail-closed transport:** minipas attempt 2 → BLOKER (ikke fail-open); driveren så og lukkede rc=0-hullet — mekanikken tænker rigtigt, den mangler kun selvtesten (F-3).
- **Planneren leverede 29 afgørelser og 0 krav-returer** — recon-2's »fakta pr. udfald« (INSTRUKS-recon2) gav planneren grundlaget, uden en Mathias-tur.
- **Ledger verbatim** (40 entries) og fremlæggelse som durabel fil: 0 aktør-tid, høj værdi.
- **Driveren bruger aktør-ventetid til fabrik-arbejde** (M-39 pkt. 1-4 15:49-15:52 mens planner kørte) — rigtigt, indtil det bliver kritisk-vej-arbejde (fresh-eyes for planen startede 40 min sent; M-39 pkt. 4 løser det).

---

## 5. Rangliste

| F-id | Fase | Hvad | Gevinst | Pris | Mathias' ord? | Anbefaling |
|---|---|---|---|---|---|---|
| F-3 | tvær/3 | codex-run.sh: commit patch + mock-selvtest + smoke gennem reel kaldevej | ~2 t aktør-vægur i dag (54 min kritisk vej); fail-open lukket | ingen | nej | **nu** |
| F-10 | tvær | rolletekst→lock→register atomisk (hook); register-entries; krav-gate-run parametriseret | proces-canary reelt rød; provenance sand (3 stale pins, 5 røde nu) | ingen | nej | **nu** |
| F-1 | 3 | blindt angrebs-katalog ∥ planner; Codex' egen kill-list; første pas = opslag; runde 2 = delta | fri runde ≥40 min → 10-15; løkke →1-2; cross-vendor kill-list | lav (katalog-anker) | ja (rolletekst) | runde 2 i denne pakke (variant B) · fuldt pakke 2 |
| F-6 | tvær | troskabs-liste mekanisk fra blobben → devil = opslag | 3 devil-pas → 1-2 pr. fremlæggelse; tabte negativer deterministisk | ingen | nej | **nu** (før plan-fremlæggelse) |
| F-7 | 4 | harness + specs blindt fra låst plan ∥ builder (design) | harness ud af kritisk vej; anti teach-to-the-test | lav | nej (P-6-pas) | denne pakke, Fase 4 |
| F-2 | 3 | skelet-commit før krop; struktur-pas ∥ krop | struktur-fund før 291 linjer krop | lav-mellem (flyttende mål → frosset OID) | ja | pakke 2 |
| F-5 | 2 | K-skelet (9 linjer) fremlægges før kroppen | −1 fuld runde (107/400 linjer omskrevet i pakke 1) | ingen; +1 kort tur | ja | pakke 2 |
| F-4 | 1 | filter-angreb FØR aktørerne | 12-15 min + 0 re-bind pr. pakke | ingen | nej | pakke 2 |
| F-8 | 5 | chain-proof-harness bygges under Fase 4 (design) | Fase 5 = kørselstid | ingen | nej | denne pakke ∥ Fase 4 |
| F-9 | 6 | doc-diff ved plan-lås · mekaniske KPI-tal · én luk-fremlæggelse (design) | −1 Mathias-tur; tal ≠ ord | ingen | ja for (c) | denne pakkes luk |
| F-11 | 3/tvær | frisk fresh-eyes-instans pr. artefakt | uafhængighed af egne domme | ingen (+5 min) | nej | pakke 2 |

**Samlet:** Det ægte sekventielle i kæden er tre løkker — krav-omskrivning efter struktur-ord (Fase 2), planner↔angreb (Fase 3), builder↔prover (Fase 4). F-5/F-2 lægger skelettet før kroppen i de to første; F-1/F-7 gør første angrebs-/prøve-pas til et opslag i frosne input; F-6 gør det samme for Mathias-fladen. De to »nu«-punkter (F-3, F-10) er ikke optimering men reparation: transporten og pinnene der skal bære næste gate er ikke grønne ved HEAD.