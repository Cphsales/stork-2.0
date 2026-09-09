# Grundlæggende plan — v5-fabrikken efter analyse-dagen

Samlet 2026-09-09 af mathias-9b på Mathias' ord: »nu skal vi sørge for at vi får samlet det hele til en grundlæggende plan«.
Kilder: 8 analyser 2026-09-08 — Codex-integration (P-1..P-9) · tidsoptimering (Codex T-1..12, Claude T-1..9) · over-test (Codex O-1..13, Claude O-1..13) · hele flowet (Codex F-1..10, Claude F-1..11) · Codex' egen opsætning (22 pkt, Mathias' relæ 09-09). Alle resultatfiler ligger i `scratchpad/{codex-workflow-analyse,tidsoptimering,overtest,flow}/RESULTAT-*.md`.
Mathias-ord der bærer det gjorte: M-34 (ét ok) · M-35 (Codex i alt) · M-39 (tidsoptimering, effort VENT) · M-40 (over-test: alle forbedringer).

---

## 0. Status — sandt pr. 2026-09-09 kl. 10:23

| Hvad | Tilstand |
|---|---|
| Repo | origin = HEAD `bd5c51a` · suite GRØN inkl. hærdet-register · 16 commits pushet 08-09 17:43 · CI grøn |
| Krav-gate | ÅBEN og pinnet (`krav-gate-run.mjs`, genkørt) · krav-blob `9402164d` immutabel · M-38 `krav ok` |
| Fase 3 | plan v1 `423d9b20` @ `ec4a3d9` = UDKAST · tre tjek landet: **angreb 15 (8 BLOKER + 7 RET) · fresh-eyes 5 · kildetjek 30 modstrid + 24 uden kilde** · fold-ind til v2 IKKE sket |
| Driver | sessionen »qwers trin 10b« kører IKKE (proces væk, ikke på peer-listen) · ingen aktører kører · Fase 3 står stille indtil den genstartes |
| Åbne Mathias-ord | flow-forslagene (F) · fabrik i egen session nu · runde 2 som delta · Codex-opsætning (22 pkt) · effort = VENT |

---

## 1. Fundamentet — de 11 principper dagen gav

1. **Falsk-grøn er hovedfjenden.** Tid spares aldrig ved at fjerne et negativ-tjek, en dommer eller fail-closed.
2. **Rigtig parallelitet = frosne input samtidig, blindt.** Forkert = angribe et udkast mens det skrives (målet flytter sig, blindheden tabes).
3. **Skelet før krop.** Struktur dømmes før detaljen skrives: filter før recon-aktører · K-skelet før krav-krop · matrix+bids før plan-krop.
4. **Løkken er det eneste ægte sekventielle.** Første angrebs-pas = opslag mod blindt katalog; anden = delta-verifikation. »Til angrebet er tømt« er undtagelse, ikke default.
5. **Ét delta-batch pr. runde.** Alle tjek på samme blob → én fold-ind → én re-bind → FØRST derefter Mathias. Intet åbent tjek bag en besked der beder om ok.
6. **Beskriv ≠ luk.** Hvert materielt fund ender som: rettet m. bevis / inden for delegeret valg / kræver Mathias' ord. »Deklareret afledning« og »residual« er beskrivelser.
7. **Rollen bestemmer kaldet.** Model, tænke-niveau, rolletekst, sandbox afledes af låsen — aldrig af prompten eller aktøren. Det faktisk kørte logges (model · effort · forsøg · service-tier · CLI-version).
8. **Fabrikken er selv frosset pr. kørsel.** Regel- og værktøjsversion pinnet; rolletekst→lock→register er én atomisk bevægelse; aldrig »HEAD i arbejdstræet« som gate-input.
9. **Mathias sidst er en hændelseskæde, ikke kun en digest.** Verdikter + fremlæggelse samles i én uforanderlig kvittering; hans ord bindes til den; rækkefølge-kravet gælder alle gater.
10. **Sandhed = effect-harness + dræbt mutant mod rigtig database.** Coverage, bijektion, flag og attester = komplethed. Sandheds-motoren skal være koblet før Fase 4.
11. **Mathias spørges mindre og bedre.** Afled-før-spørg · bekræftelses-linjer · skelet-stoptjek · ét ord pr. gate · kun ægte forretnings-forks.

---

## 2. Gjort — pushet og verificeret (`bd5c51a`)

- **M-34** ét godkendelses-ord; upload = driver-automatik efter REN audit.
- **M-35** P-1..P-9 forankret; P-2/P-4/P-5 kørt retroaktivt (P-2: 77 divergenser → 0 forretnings-forks · P-4: 4 fund, 2 materielle · P-5: 0); P-3 troskabs-akse aktiv (fandt 6 tabte forbehold); P-6-modstrid afgjort (kill-list-udkast ved plan-gaten); P-8 slutprøve-spec leveret (274 linjer).
- **M-39** timeout+retry-wrapper (stdin-rodårsag fundet og lukket) · delta-batch-regel · auto-pakket aktør-input m. tidlig citat-scope-kontrol · effort logges · pakke-2-blok i plan DEL IV.
- **M-40** krav-gate-run.mjs som pinnet dom (2 fail-open lukket: approval-laundering + symlink) · 6 selvtest-fixes m. mutations-bevis · D10 mutant-regel · D11 branch-coverage ud som selvstændigt bevis · D12 forudsætnings-bids · D13 planner-undtagelse fjernet · D14 JS-klasse frosset · D15 bøtte-1 → AI-spor · E16-E20 (instruks · audit-input · devil-genbrug · kun verificerede tal · P-8 skæres ved gaten).
- **Fra flow-analysen (allerede rettet):** 3 stale rolle-pins regenereret · wrapper-patch committet · drift-log m. pkill-lærdom og credits-stop.
- **Hærdet-register:** 6 moduler re-registreret efter P2-kæde batch→delta→verifikation→konvergens (11 fund lukket m. regressions-cases).

---

## 3. NU — før planen låses

Rækkefølge er bevidst: 3a-3c er forudsætning for at plan-gaten kan dømme rigtigt; 3d-3i er fabrik-arbejde der kan køre parallelt i eget spor.

| # | Tiltag | Kilde | Kræver Mathias' ord |
|---|---|---|---|
| 3a | **Genstart driveren og kør Fase 3 runde 2 som DELTA, ikke ny fri runde:** katalog = recon-2's egen tjekliste (V/P/H-lister + test-kontrakt, variant B) · alle 15+5+54 fund foldes ind i ÉN plan v2 (angrebets kill-list-krav filtreres gennem D10) · Codex + fresh-eyes verificerer kun v1→v2-diffen mod fund-listen · én FRISK afsluttende reviewer ser helteksten uden producentens forklaring · vi påstår ikke bagefter at forløbet var blindt fra start | Claude F-1/F-11 · Codex F-6 · Mathias' eget ord om metoden | **ja** |
| 3b | **Bevisform afstemt før lås:** pr. K/acceptkriterie hvilken prøve-type (ulovlig tilladelse · forkert slutværdi · manglende offentlig handling · samtidighed) · Codex viser at måle-adapteren kan udtrykke dem · P-8 og plan i én matrix · P-8 skæres (E20: samtidighed kun K-2 sidste stand + K-6 dublet-kobling) | Codex F-7 · M-40 E20 | ja (plan/spec) |
| 3c | **»Mathias sidst« som hændelseskæde:** kvittering (verdikt-digests + fremlæggelses-blob + tidsstempel) skrives FØR fremlæggelsen sendes; hans ord bindes til kvitteringen; nye verdikter kan ikke bagefter blive dens forudsætning · `orderedApproval: true` på plan-gaten (i dag false) | Codex F-1 (M-38 15:06 vs r4b 15:10 — dokumenteret hul i rækkefølge-beviset) | **ja** (gate-kontrakt) |
| 3d | **Rollen bestemmer kaldet:** `codex-run.sh`/`verdikt-byg.mjs` tager rolle + lås-OID og afleder model/effort/rolletekst/sandbox; modstridende parametre afvises; `run_attempt` reelt (i dag hardkodet 1); effort fra kørslen, ikke fra aktørens udkast; hvert forsøg eget output | Codex F-2 (10 af 31 kald 08-09 kørte high trods xhigh-pin) · Codex-opsætning 7+20 | nej (håndhæver eksisterende pins) |
| 3e | **Fabrik-frys pr. kørsel:** hver aktør-kørsel binder arbejdsinput OG regel-/værktøjsversion (commit, ikke arbejdstræ); hook afviser `roller/*.md` staged uden `actors.lock` og nyt gate-modul uden register-entry; `krav-gate-run.mjs` parametriseret (ikke `r4b` hardkodet) | Codex F-3 · Claude F-10 | ja (proceskontrakt) |
| 3f | **Beskriv ≠ luk i rolletekster** (fresh-eyes · P-4 · codex-angreb · P-9): tre tilstande pr. fund; efter fold-ind tjekkes at den oprindelige K-forpligtelse stadig består — anvendes STRAKS på plan-fundene (fx persondata-indsnævringen i K-7) | Codex F-8 | ja (rolletekst) |
| 3g | **Mekanisk troskabs-liste** udtrækkes fra krav-/plan-blob (struktur-punkter · ikke-i-scope · plan-fase-valg · afledt/bekræftes · forbehold); forfatter skriver mod den; devilens P-3-pas afkrydser → første pas = opslag | Claude F-6 (fremlæggelse-2: 4 versioner på 15 min) | nej |
| 3h | **Wrapper færdiggøres:** PID-fil pr. kørsel (målrettede drab) · mock-codex-selvtest (stdin lukket · rc=0 uden output → fejl · timeout → præcis ét retry samme effort · monotont ur) · 10-sek smoke gennem den reelle kaldevej efter hver wrapper-ændring · separat fejllog (ikke /dev/null) | Claude F-3 · Codex-opsætning 18/19 · driverens løfte | nej |
| 3i | **Lukningsgrundlag fra nu:** hvert modtaget fund logges (kilde · fund-id · input-OID · status → rettelses-OID + bevis) i driverens arbejdslog; P-9 og luk-rapport afledes af sporet | Codex F-10 | ja (arbejdslog-kontrakt) |
| 3j | **Sandheds-motoren kobles** (M-40 C): build-proof.json produceres af `runBuildProofEngine` + `runProver`; K-liste fra LÅST plan; harness observerer data + flere reject-klasser (K-8: læsning m. nul rækker) — start NU i fabrik-spor | Claude O-3/O-13 · Codex O-1/O-2 | nej (allerede M-40) |
| 3k | **Fabrik-arbejde i egen session** (fremrykket fra pakke 2): driveren kører KUN kæden; fabrik-armen committer i egen zone; rolletekst+lock lander stadig FØR aktør-spawn | Claude T-4 · M-39 pakke-2 pkt. 8 | **ja** (fremrykning) |

---

## 4. Fase 4 — build (denne pakke; design, ikke empiri)

- **Blind harness + angrebs-specs ∥ builder:** Codex skriver alle bids' angrebs-specs i pipeline (N+1 mens builder bygger N) og effect-harness+mutanter for bid N fra planens harness-form, blind for diffen. Første prover-kørsel = opslag. Afviger diffen fra planens navne → harness rød = 1:1-brud → HALT (feature). [Claude F-7]
- **Højst ét ubekræftet efterfølgende bid i gang** ad gangen; delt skema/rettighedskerne venter på review; cascade-STOP består. [Codex F-9]
- **P-7 Codex-review af faktisk diff** pr. bid, bundet til aktør + base_oid + kode-OID i build-proofens review-kontrakt. [M-35]
- **build-proof fra engine-output** (3j) · **D10 mutant-regel** (én dræbt mutant pr. afvisnings-acceptkriterie m. eget værn) · **D12 forudsætnings-bids** binder til senere effekt-bid.
- **P-1 gate-transport red-team** køres når CI-actor-runner/gate-transport findes (står ærligt som ventende i planen 2.F).

## 5. Fase 5 — sandhed (design)

- **chain-proof-harness bygges UNDER Fase 4** (CI-job · data-udvælgelse P-8 §1 · canaries N1-N9 · kæde C0-C10 · verifier) fra P-8-spec + låst plan; Fase 5's kritiske vej = kørselstid. Held-out-fetch EFTER build (anti-tailoring intakt). [Claude F-8]
- `proofs.mjs` fail-lukker korrekt indtil da — det må ikke beskrives som afsluttet beskyttelse.

## 6. Fase 6 — luk (design)

- **Doc-diffs** fra plan §6 genereres ved plan-lås, appliceres byte-identisk ved luk. [Claude F-9a]
- **`retro-kpi.mjs`** tæller KPI-tal mekanisk fra ledger/audits/verdikter (M-40 E19 kræver mekaniske tal — værktøjet mangler). [Claude F-9b · Codex-opsætning 22]
- **Én luk-fremlæggelse, ét ord:** masterplan-diff + workflow-diff + KPI samlet. [Claude F-9c — kræver Mathias' ord]
- **P-9 efterprøvning** starter med opslag mod lukningsgrundlaget (3i), derefter frit pas efter manglende lukninger. [Codex F-10]

---

## 7. Pakke 2-blok (forankret i plan DEL IV + nye)

Allerede forankret (M-39): spekulativ recon-2 + P-2 i ventetid på Mathias · audit ∥ buildability på udkast-blob · P-5 ind i omission-passet · genbrug ved byte-lighed.
Nye fra flow-analysen:
- **Fase 1: filter- og omission-katalog FØR recon-aktørerne** på frosset bundle (det ene reelle devil-fund i pakke 1 var et filter-fund → 12-15 min re-bind-løkke sparet; aktørerne binder én gang). [Claude F-4 · Codex F-4]
- **Fase 2: K-skelet fremlægges før kroppen** som sidste led i 3-bøtte-præsentationen (9 linjer: K-n · HVAD · bærende M-ord · bord-flyt) — stoptjek, ikke ekstra godkendelse. Ét struktur-ord omskrev 107/400 linjer i pakke 1. [Claude F-5]
- **Fase 2: spørgsmål med stabilt id, svarmuligheder og kilde; svar gemmes med spørgsmålet;** ny betydning markerer hvad den afløser. [Codex F-5 — svarbinding kan bruges allerede ved næste besked]
- **Fase 3 fuldt skelet-forløb:** planner committer skelet (matrix · bid-liste · valg · ordbogs-entries) → struktur-pas ∥ krop → krop-commit m. deklareret skelet-diff → ét samlet angreb. Variant ved store struktur-risici: stop kort ved skelettet, luk struktur-fund, frys skelet v2, skriv krop. [Claude F-2 · Codex F-6]
- **Separat blind Codex-katalog-kørsel** (variant A) hvis recon-2's tjekliste viser sig for tynd i denne pakke. [Claude F-1]
- **Frisk fresh-eyes-instans pr. artefakt** (samme instans kun til delta-addenda). [Claude F-11]
- **Flere pakker samtidig:** først efter ét rent gennemløb; kræver pakke-stier for launch/recon. [begge tids-analyser]

---

## 8. Codex' egen opsætning — de 22 punkter klassificeret

**v5-relevante, ind nu (fabrik-spor):**
- **3 AGENTS.md** i repo-roden m. henvisning til rolletekster/plan (Codex indlæser den automatisk; v5 giver rollen via prompt, men en fast indgang fjerner en fejlkilde).
- **4 GitHub-identiteter afstemt:** CLI = stork-code-bot, GitHub-integration = copenhagensales; CLAUDE.md kræver bot til commits/PR'er → identitet tjekkes før skrivehandling, uanset værktøj.
- **5 + 15 Sandbox pr. rolle = Codex' enforcement:** `codex-run.sh` kører i dag `--sandbox workspace-write` for alle; review-/angrebs-/audit-roller får eksplicit `read-only`-profil; kun måle-lags-roller får write. Git-tilladelser indsnævres (`git branch` matcher i dag også `branch -D`). Det er Codex-siden af planens 2.E (hooks er kun Claude).
- **7 + 20 Log faktisk konfiguration** (service_tier · effektive overrides · CLI-version · forbrug) = princip 7 / 3d.
- **10 Versionsstyret `.codex/`** i projektet (er tom) så opsætningen kan gennemgås og reproduceres — hører til fabrik-frys (3e).
- **22 Mål forbedringerne** = `retro-kpi.mjs` (6).

**Legacy-kæden (`scripts/kaede/*`, `scripts/codex-review.sh`) — v5 kalder dem IKKE (verificeret: ingen referencer fra scripts/v5, CI eller v5-npm-scripts):** pkt. 1, 2, 16, 17, 18, 19, 21 (Plan-SHA-format · parser fail-open · exit-kode→succes · runde-tælling pr. pakke · atomisk publicering · stderr · preflight-skrivehandling). **Beslutning: pensionér** (flyt til foraeldet, fjern npm-scripts `kaede:*`) medmindre Mathias vil beholde dem — at rette dem er arbejde på et kort, ikke på fabrikken.

**Hygiejne (fabrik-spor, ingen Mathias-ord):** 8 kortere obligatorisk kontekst (læsefølge ~25.000 ord → kort overblik + målrettet læsning) · 9 git-sync-regel præciseret · 11 global AGENTS.md (dansk, svarlængde) · 12 projekt-skills for SQL/RLS-review · 13 lange DB-engangskommandoer → gennemgåelige scripts · 14 forældede trust-poster + Node 22-regel ryddes.

**Mathias' ord:** 6 tænke-niveau pr. opgave = **VENT** (M-39, uændret).

---

## 9. IKKE-listen (alle analyser enige)

Skær ikke suiten efter antal (52 reelle red-team-fund bag) · 3-blind recon + hård konflikt-bevaring · fresh-eyes + P-4 som to leverandører · spørgsmåls-devil på ny tekst · omission-devil ét pas · hærdet-register uden »trivielle ændringer undtaget« · OID-binding + orderedApproval + re-bind pr. blob · effect-harness + mutant-kill · held-out slutprøve · ledger verbatim · effort-sænkning (vent) · flere pakker før pakke 2 er kørt rent · P-8's anti-cherry-pick og canaries.

---

## 10. Beslutninger til Mathias — ét samlet ok (»ok undtagen nr. X« virker)

| Nr | Beslutning | Anbefaling |
|---|---|---|
| 1 | Fase 3 runde 2 som delta m. recon-2-katalog + frisk sidste reviewer (3a) | ja |
| 2 | »Mathias sidst« som kvitterings-kæde + rækkefølge-krav på plan-gaten, før `plan ok` (3c) | ja |
| 3 | Rollen bestemmer kaldet — eksisterende pins håndhæves mekanisk, niveau uændret (3d) | ja |
| 4 | Fabrik-frys pr. kørsel + atomisk rolletekst→lock→register (3e) | ja |
| 5 | Beskriv ≠ luk i rolletekster, anvendt på plan-fundene nu (3f) | ja |
| 6 | Bevisform pr. K afstemt før plan-lås, P-8 skæres (3b) | ja |
| 7 | Lukningsgrundlag logges fra nu (3i) | ja |
| 8 | Fabrik-arbejde i egen session fra nu (3k) | ja |
| 9 | Read-only sandbox for Codex' review-/angrebs-/audit-roller + identitets-tjek + AGENTS.md (8) | ja |
| 10 | Legacy-kæden pensioneres (8) | ja |
| 11 | Fase 4-6-design (afsnit 4-6) forankres i planen nu, så det står klar når faserne nås | ja |
| 12 | Pakke 2-blokken (afsnit 7) forankres i plan DEL IV | ja |
| 13 | Én luk-fremlæggelse, ét ord (6) | ja |

Uændret uden nyt ord: tænke-niveau xhigh overalt (M-39 VENT).

---

## 11. Sådan kommer vi videre (rækkefølge)

1. Mathias' samlede ok på afsnit 10.
2. Driveren genstartes (`claude --resume 61d9c799-0bdc-4346-ac4a-8909ab7d9987` eller ny driver-session med binding @ `bd5c51a`); dette dokument gives som forankrings-kilde (M-41).
3. Fabrik-arm (egen session) tager 3d-3j + afsnit 8 parallelt; driveren tager 3a-3c og Fase 3 runde 2.
4. Plan v2 → delta-verifikation → frisk reviewer → plan-gate-verdikter (code-reviewer · codex · claude-ai) → kvittering → fremlæggelse via devil m. troskabs-liste → Mathias' `plan ok`.
5. Fase 4 starter med sandheds-motoren koblet og blind harness ∥ builder.
