# gov-5-automation — Plan V2

**Branch:** claude/gov-5-automation-plan
**Krav-dok:** docs/coordination/gov-5-automation-krav-og-data.md (fornyet runde 1, Mathias-valideret 2026-06-10)
**Pakke-status:** docs/coordination/gov-5-automation-status.md
**Recon-grundlag:** docs/coordination/gov-5-automation-recon.md (PR #122)
**Plan-version:** V2 · konvergens-counter: 2

## Kode-fund-håndtering (fra Codex V1)

- **KRITISK 1 (CODEOWNERS-undtagelser ikke bevist leverbare): ACCEPT.** P3 udvidet: (1) mekanikken er GitHub-dokumenteret — CODEOWNERS-syntaks tillader pattern-linje uden ejer; sidst-matchende regel vinder, så en senere ejer-løs linje fjerner ejerskab for stien (GitHub Docs "About code owners", eksemplet `/apps/ @octocat` + ejer-løs `/apps/github`). (2) Bevis-step tilføjet: efter P3-merge åbnes test-PR der KUN rører `docs/coordination/aktiv-plan.md` — forventet: ingen code-owner-review-request (gov-4 #111-mønster); fejler forventningen, rulles P3 tilbage og krav 2-leverancen STOP-gates. Se step 11b.
- **KRITISK 2 (protection-ændring uden state-dump + eksakt diff): ACCEPT.** Step 13 omskrevet til 13a/13b: 13a er rå admin-læsning af protection-state (KRÆVER MATHIAS-MANDAT — rejst som blocker i pakke-status) hvis output indsættes ordret i plan V<n> FØR qwerg, med eksakt diff + bevarelsesliste (required CI-check "Lint, typecheck, test, build" · require_code_owner_reviews=true · dismiss_stale=true · delete_branch_on_merge). Planen er ikke qwerg-klar før dumpet står her.
- **MELLEM (disciplin "Forudsætninger" efterlades stale): ACCEPT.** Ny P5: Forudsætninger-afsnittet (disciplin.md:476–484) patch-først — se Dokument-currency-leverancen.

## Mathias-vagter indarbejdet (2026-06-10, efter V1)

1. **Split (§3.8):** egen analyse nedenfor — afgjort af leverance-kæden, ikke af forventning i nogen retning.
2. **Dokument-opdatering er leverance:** dedikeret sektion — hver tekst pakken forælder, rettes i pakken; maskinen må aldrig validere mod en løgn.
3. **Rolle-linjer + anti-tunnelsyn:** designet skærpet — ansvars-tabel pr. komponent + mekanismer mod låst-forkert-data; ingen antagelser kan flyde ind i krav-dok via kæden (strukturelt: kæden vækker aldrig nogen til at skrive krav-dok).

## Formål

> Workflowet kører automatisk fra start til slut: Mathias åbner, og Mathias lukker. Undervejs har han én fast kontrolpost — krav-dokket, forretningen, som kun han kan validere. Plan og byg valideres af rollerne; Mathias kaldes kun ind når der findes en afgørelse der er hans. Det vi bygger er grundstenen under alle fremtidige Stork 2.0-pakker, og målet er klart: sammen kan vi opnå greatness.

(1:1 fra krav-dok §Formål. Format-punkt fortsat åbent: structural-chain kræver `> Denne pakke leverer:`-prefix i begge Formål-blokke ved markør-flip — krav-dok fornys med prefix-linjen før qwerg-merge, indhold uændret.)

## Split-analyse (§3.8 + vagt 1)

**Kandidat-snit:** A) kæde-kerne (dirigent + tilstandsmaskine + adapters + tests + systemd) · B) Mathias-flade (kæde-issue + notifikation + author-verifikation) · C) klik-differentiering (CODEOWNERS + protection) · D) dokument-leverancen.

**Analyse:** §3.8's tal-grænse (migrations) rammes ikke (0). Ånden — reviewability + risiko-isolation — vejes pr. snit: A+B er udelelig (en dirigent uden Mathias-flade kan ikke køre en eneste gate; adapters uden dirigent dispatches ikke — et split her leverer intet kørbart). D følger pr. definition det der ændrer sandheden. C KAN skilles ud (egen risiko-profil: gate-fladen selv), men: C er lille (2 steps + bevis-step), velforstået efter gov-4 (samme flade, samme verifikations-mønster #111), og et selvstændigt C-pakke-løb koster to ekstra Mathias-gates (qwerg + slut OK) + pakke-overhead — i strid med krav 3 (friskhed) uden tilsvarende risiko-gevinst, fordi C's risiko allerede er isoleret i egen batch med eget bevis-step og STOP-gate-rute (fejler bevis-steppet, udskydes C uden at kæden tabes — plan-afvigelse til Mathias).

**Konklusion: ÉN pakke, batched (B1–B5).** Revisit-trigger (eksplicit, mod gennempresnings-bias): vokser step-antallet i V3+, eller flagger Codex reviewability-problemer, splittes C ud som egen pakke — viljen er der (vagt 1), analysen afgør (krav 9).

## Verificerede DB-objekter (§3.2)

**Ingen DB-objekter berøres.** Leverancerne er lokale processer, shell-/Node-scripts, GitHub-flade (CODEOWNERS, issue-mønster, protection) og docs. 0 migrations, 0 RPC'er, 0 policies, 0 grants — evidens: implementations-rækkefølgen indeholder ingen SQL-filer. (Supabase-MCP-dump bevidst udeladt — ingen objekter at dumpe for.)

## G/H-opslag (§3.2)

| G/H                                       | Løses-i                     | Håndtering                                                                                                                                                                                                                                         |
| ----------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [H028] mekanisk G/H-opslag i recon-doc'en | gov-5 / partnerskabs-runde  | **Bevidst udskudt til partnerskabs-runden.** H028's hjem-entry peger selv på recon-mekanismen som partnerskabs-input; §3.2's manuelle pligt er broen (praktiseret i gov-5-recon). Kædens transport er forudsætningen for mekanikken — ikke omvendt |
| [G062] recurring types-drift              | —                           | **Bevidst udskudt.** Ikke kæde-transport; eget G-spor. Dirigenten ændrer ikke deploy-/types-flowet                                                                                                                                                 |
| [H029] tekst-staleness                    | dedikeret pakke efter gov-6 | **Udskudt (Mathias-besluttet).** Gov-5 retter selv alle tekster den forælder (Dokument-currency-leverancen) — H029 er rest-gennemgangen af det gov-5 IKKE rører                                                                                    |
| H012/G039, H025, G063                     | —                           | Rammer ikke automation-scope                                                                                                                                                                                                                       |

## Verificerede afhængigheder

| Reference                                                                                                                                                            | Defineret i                             | Linje         | Brug i denne plan                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------- | --------------------------------------------------------------------------------------- |
| §2-automation-note (mål-tilstand, delvist stale)                                                                                                                     | docs/strategi/disciplin.md              | 48            | P1: omskrives til dirigent-virkelighed                                                  |
| §6.2 Automation (notify-only-tekst)                                                                                                                                  | docs/strategi/disciplin.md              | 178–180       | P2: omskrives ærligt                                                                    |
| Forudsætninger-afsnit ("Codex-runner + auto-merge + plan-branch-trigger (gov-5)" udestående)                                                                         | docs/strategi/disciplin.md              | 476–484       | P5: rettes ved leverance (Codex V1-MELLEM)                                              |
| §9.1/§9.2/§9.3 rolle-hjem                                                                                                                                            | docs/strategi/disciplin.md              | 246/260/268   | Adapter-instrukser genbruger rollernes §9-sektioner — dirigenten definerer INGEN roller |
| CODEOWNERS (`* @mgrubak`, sidst-matchende vinder — header dokumenterer selv reglen)                                                                                  | .github/CODEOWNERS                      | 1–22          | P3: ejer-løse bogførings-linjer + bevis-step 11b                                        |
| codex-review.sh dispatch + marker-parser + exit-koder 0–4 + `--parse-test`                                                                                           | scripts/codex-review.sh                 | 1–60, 200–247 | Codex-adapter; udvides med `--phase=docs` (recon E.5)                                   |
| PHASE-case (plan\|build\|slut-rapport)                                                                                                                               | scripts/codex-review.sh                 | 242–247       | Indsætningspunkt for docs-mode                                                          |
| ci.yml triggers (pull_request uden draft-eksklusion)                                                                                                                 | .github/workflows/ci.yml                | 3–7           | Draft-PR'er får CI → plan-iteration valideres uden klik                                 |
| migrations-deploy.yml (push main + migrations-paths)                                                                                                                 | .github/workflows/migrations-deploy.yml | 3–7           | Uændret                                                                                 |
| structural-chain + markør-regex (`fase: plan\|build\|rapport`)                                                                                                       | scripts/governance-check.mjs            | 285–324       | Markør-flip post-qwerg (kræver Formål-prefix-fix)                                       |
| Lokalt værktøj verificeret 2026-06-10: claude CLI 2.1.172, codex-cli 0.137.0, gh 2.45.0 (stork-code-bot aktiv), node v24.15.0, systemd user-instans `running` (WSL2) | —                                       | —             | Dirigent-hosting + alle aktør-kørsler lokalt mulige (krav 1)                            |
| Merge-konvention: mgrubak-approval er gaten; Code armerer auto-merge --rebase                                                                                        | CLAUDE.md "Identiteter" + disciplin:48  | —             | Genbruges uændret af kæden                                                              |

## Design (krav 9: tavlen visket ren — formålet afgør)

**Kæde-dirigenten** (`scripts/kaede/dirigent.mjs` + `scripts/kaede/adapters/`): én lokal proces (systemd-user-service) der i poll-cyklus (default 60s) læser **tilstand** — git fetch + `gh api` på PR'er/reviews/checks/issue-kommentarer — og afgør "hvis tur" via deklarativ tilstandsmaskine over kædens 9 væknings-punkter (recon B). Derefter dispatcher den én aktør-kørsel og afventer dens exit.

Bærende valg (begrundet i formålet):

1. **Tilstandslæsning, ikke besked-kø:** tilstand genberegnes fra rå kilder hver cyklus — crash/stop mister intet. **Krav 7 strukturelt:** stop dirigenten → tilstanden ER det manuelle flow.
2. **Polling, ikke webhooks:** lokal webhook kræver offentlig tunnel ind på Mathias' maskine — afvist (angrebs-flade). 60s-latens er irrelevant mod aktør-kørslers minutter.
3. **Transport-renhed (krav 6):** dirigenten læser KUN tilstands-felter (SHA'er, PR-state, fil-eksistens, markers, gate-ord) — aldrig leverance-indhold. Reglerne er deklarative i `scripts/kaede/kaede-regler.json` — auditerbar, diff-bar.
4. **Dømmekraft bor i aktørerne:** adapters starter rollens kørsel med rollens egen §9-instruks; LÆSEFØLGE-pligt, severities, FLAG→LØS — alt uændret. Dirigenten parser kun markers/exit-koder (eksisterende mekanik).
5. **Kvalitet pr. led (krav 4):** KRITISK → samme spor, næste runde · NEEDS-MATHIAS/ESCALATE/halt-markers → Mathias-flade + spor-pause · parse-fejl/uventet output → kæde-STOP + notifikation + manuelt flow. Fejl transporteres aldrig videre.
6. **Mathias' flade (krav 2+3):** ét kæde-issue pr. pakke; gate-anmodninger som kommentar m. @mgrubak-mention → GitHub Mobile push; Mathias svarer med gate-ord fra mobil; **gate-ord accepteres KUN fra author `mgrubak`**. PR-beslutninger: review-request → native push + approve fra mobil. Pakke-åbning fra mobil: "qwers <pakke> …"-kommentar på stående dirigent-issue.
7. **Klik kun på beslutninger (krav 2):** P3 + step 13 — konservativt: kun fem enumererede bogførings-stier åbnes; alt andet (inkl. alt nyt) forbliver `* @mgrubak`. Ved tvivl: gate.
8. **Spille hinanden bedre (krav 5):** dirigenten implementerer disciplinens egne parallel-mønstre: krav-dok merged → Code-plan OG Codex-research samtidig (§2.1); build-batch → Codex-review parallelt med næste batch (§9.3). Fund deles som committede filer; transporten garanterer øjeblikkelig vækning med pointer.
9. **Suverænitet:** "stop" fra Mathias (enhver kanal dirigenten læser) → øjeblikkelig kæde-pause. Dirigent-tilstand (sidste handling + næste forventede) vises løbende i kæde-issuet.

**Claude.ai-rollen lokalt (krav 1, fornyet):** adapter kører `claude -p` med §9.1-rolleinstruks (`scripts/kaede/claude-ai-rolle-instruks.md`) for de to vækbare leverancer: slut-rapport-review og qwerg-gate-pakke. Leverancen skrives **untracked** (V2-mønstret); **Code committer**. Windows-appen består urørt til dialogen med Mathias.

### Rolle- og ansvars-linjer (vagt 3)

| Komponent               | Identitet                  | MÅ                                                                                                      | MÅ ALDRIG                                                                                                                          |
| ----------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Dirigent                | stork-code-bot (gh)        | Læse tilstand; dispatche adapter-kørsler; poste kæde-issue-status/gate-anmodninger; re-requeste reviews | Committe/pushe indhold; læse/vurdere leverance-indhold; røre protection/admin-API; merge gated PR'er; dispatche krav-dok-skrivning |
| Code-adapter            | Code (§9.2)                | Alt §9.2 tillader — fuld rolle, headless                                                                | Overskride §9.2 (formål, scope, stamme-docs); fortsætte forbi STOP-betingelser uden gate-fil                                       |
| Codex-adapter           | Codex (§9.3), read-only    | Review + research; markers                                                                              | Skrive kode; committe (Code committer outputtet)                                                                                   |
| Claude.ai-rolle-adapter | Claude.ai (§9.1), docs-lag | Slut-rapport-review + qwerg-gate-pakke; untracked output                                                | Kode-vurdering; datamodel; committe; skrive krav-dok (krav-dok-fasen er dialog og vækkes ALDRIG af kæden)                          |
| Mathias-adapter         | bot poster; mgrubak afgør  | Notifikation + gate-ord-aflæsning m. author-verifikation                                                | Tolke/sammenfatte gate-indhold (kun transport af ordret tekst); acceptere gate-ord fra andre authors                               |

### Anti-tunnelsyn-mekanismer (vagt 3)

1. **Frisk tilstand, hver cyklus:** ingen cached antagelser — alt genlæses fra rå kilder (git + gh api). En låst-forkert læsning overlever max én cyklus.
2. **Divergens-STOP (én sandhed):** er to kilder uenige om samme faktum (lokal git vs. GitHub API; markør vs. fil-eksistens; plan-version vs. review-version), dispatches INTET — kæde-STOP + Mathias-notifikation med begge værdier. Konflikt mellem kilder er en fejl, ikke et valg dirigenten træffer (vision-princip 1).
3. **Ingen antagelses-vej ind i krav-dok (strukturelt):** kæden har ingen regel der vækker nogen aktør til at producere krav-dok-indhold — Step 0/1 ER dialog med Mathias og forbliver det. En automatiseret recon der fodrer krav-dok med antagelser (Microsoft-casen, Mathias 2026-06-10) kan ikke opstå i denne kæde, fordi vejen ikke findes.
4. **Kilde-pligt nedarves uændret:** aktør-leverancer reviewes af de eksisterende discipliner (fabrikations-STOP §9.2, fuldstyrke-krav §9.3, kilde-pligt §9.1) — kæden flytter leverancer, den blåstempler dem ikke.
5. **Dispatch-log:** hver beslutning logges (tilstand → regel → handling) — auditerbar bagudrettet; gov-6-gennemløbet leverer loggen som bevis.

## End-to-end-spor (§3.3, tilpasset: ingen DB-write-veje — kæde-spor)

Ét konkret gennemløb, gov-6 som case (= krav 8's bevis), komponent + identitet + gate pr. led:

1. Mathias: "qwers gov-6-arkiv-fold"-kommentar på dirigent-issue (mobil) → author-verifikation → kvittering; Step 0/1 er dialog — kæden venter på krav-dok
2. Krav-dok merged → dispatch Code-plan + Codex-research parallelt (§2.1)
3. Code committer plan-V<n> → dispatch Codex-review
4. Codex-output committet (af Code-adapter) → marker-parse: FEEDBACK → Code-V<n+1> · APPROVAL → dispatch Claude.ai-rolle (qwerg-gate-pakke, untracked → Code committer) → gate-anmodning + @mgrubak → **Mathias læser, svarer "qwerg" (mobil)**
5. qwerg author-verificeret → Code-build; pr. batch dispatches Codex-batch-review parallelt
6. Build-PR klar (grøn CI + reviews) → re-request mgrubak-review → **push → Mathias approver (mobil)** → auto-merge (armeret af Code ved PR-oprettelse) fyrer
7. Merge set → Code-slut-rapport → push set → Claude.ai-rolle-review (untracked → Code committer) → APPROVAL → gate-anmodning → **Mathias: "slut OK" (mobil)** → Code merger slut-rapport-PR (konvention uændret)
8. Hvert led: marker-/exit-parse før næste dispatch; ethvert brud → spor-pause + notifikation + manuelt flow

## Implementations-rækkefølge

| Step | Type               | Hvad                                                                                                                                                                                                                                                                         | Eksakt indhold                                                                                                    | Afhængigheder | Risiko                                                                |
| ---- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------- |
| 1    | Node-script        | `scripts/kaede/tilstand.mjs`                                                                                                                                                                                                                                                 | Tilstandslæser: git fetch + gh api → normaliseret tilstands-objekt (read-only) inkl. kilde-par til divergens-tjek | gh bot-konto  | Lav                                                                   |
| 2    | JSON + Node        | `scripts/kaede/kaede-regler.json` + `scripts/kaede/dirigent.mjs`                                                                                                                                                                                                             | Deklarativ tilstandsmaskine (9 væknings-punkter) + dispatch-løkke, lås-fil, divergens-STOP, dispatch-log          | 1             | Mellem — kernen; fixture-dækket (3)                                   |
| 3    | Tests              | `scripts/kaede/dirigent.test.mjs` (vitest)                                                                                                                                                                                                                                   | Fixtures pr. væknings-punkt + author-tjek-cases + divergens-cases + parse-fejl→STOP                               | 2             | Lav                                                                   |
| 4    | Shell-patch        | codex-review.sh `--phase=docs`                                                                                                                                                                                                                                               | P4 — ny case (linje 242–247) + docs-prompt (§8.1-fokus); parser/exit-koder uændrede; `--parse-test` udvidet       | —             | Lav                                                                   |
| 5    | Adapter            | `scripts/kaede/adapters/codex.sh`                                                                                                                                                                                                                                            | Fase-valg fra tilstand → codex-review.sh → commit output → exit-kode videre                                       | 2, 4          | Lav                                                                   |
| 6    | Adapter            | `scripts/kaede/adapters/code.sh`                                                                                                                                                                                                                                             | `claude -p` headless m. qwerr-ækvivalent kontekst; korrekt branch; rapporterer hash                               | 2             | Mellem — STOP-betingelses-dækning; dry-run før aktivering             |
| 7    | Adapter + instruks | `scripts/kaede/adapters/claude-ai-rolle.sh` + `scripts/kaede/claude-ai-rolle-instruks.md`                                                                                                                                                                                    | `claude -p` m. §9.1-instruks, to leverancer, untracked output                                                     | 2             | Mellem — rolle-renhed håndhæves i instruks + Codex tjekker leverancer |
| 8    | Adapter            | `scripts/kaede/adapters/mathias.mjs`                                                                                                                                                                                                                                         | Kæde-issue: gate-anmodning m. mention; gate-ord-læsning m. author-verifikation; review-re-request                 | 1             | Lav                                                                   |
| 9    | Integration        | `--dry-run` (log dispatches uden kørsel) + ét live led (Codex --quick på test-branch)                                                                                                                                                                                        | Dispatch-log mod forventet sekvens                                                                                | 1–8           | Lav                                                                   |
| 10   | systemd            | `scripts/kaede/stork-kaede.service` (user-unit) + install-note                                                                                                                                                                                                               | Restart=on-failure; stop = manuelt flow                                                                           | 9             | Lav                                                                   |
| 11   | CODEOWNERS         | P3                                                                                                                                                                                                                                                                           | Ejer-løse linjer for 5 bogførings-stier (eksakt diff i P3)                                                        | —             | Mellem — dækket af 11b                                                |
| 11b  | Bevis              | Test-PR rører KUN aktiv-plan.md                                                                                                                                                                                                                                              | Forventet: ingen code-owner-request + merge på grøn CI (post step 13). Fejler → P3 rollback + STOP-gate           | 11, 13        | Lav                                                                   |
| 12   | Docs               | Dokument-currency-leverancen (P1+P2+P5 + grep-fejning)                                                                                                                                                                                                                       | Eksakt diff pr. fil nedenfor; §8.1-gate (governance-docs)                                                         | build færdig  | Lav                                                                   |
| 13a  | Protection-dump    | **MATHIAS-MANDAT: admin READ** af branch-protection → rå JSON indsættes ordret i plan V<n> FØR qwerg + eksakt diff + bevarelsesliste (required CI-check "Lint, typecheck, test, build" · require_code_owner_reviews=true · dismiss_stale=true · delete_branch_on_merge=true) | Plan er IKKE qwerg-klar uden                                                                                      | mandat        | Lav (read-only)                                                       |
| 13b  | Protection-apply   | Admin-apply af 13a-diffen (forventet: approvals-count → 0 så code-owner-kravet alene bærer gaten — bekræftes mod 13a-dump); switch til bot STRAKS efter; verificeret af 11b                                                                                                  | KUN på Mathias-mandat (CLAUDE.md-regler)                                                                          | 13a, qwerg    | Mellem — gate-flade; 11b beviser                                      |
| 14   | Docs               | aktiv-plan markør-flip (`fase: build`) + status-opdateringer                                                                                                                                                                                                                 | Doc-currency B                                                                                                    | qwerg         | Lav                                                                   |

**Skitse-størrelse (§2 2.0):** 0 migrations → fuld V1-vej. Batches: B1=1–3 · B2=4–7 · B3=8–9 · B4=10–11+13 · B5=12+14. Per-batch Codex-review (§9.3). Split-analyse: se egen sektion.

## Dokument-currency-leverance (vagt 2 — maskinen må aldrig validere mod en løgn)

Hver tekst gov-5 forælder, rettes i pakken (batch B5, §8.1-gate på governance-docs):

| Tekst                                                                                                                                                                                                                                       | Fil:linje                    | Handling                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| §2-automation-note                                                                                                                                                                                                                          | disciplin.md:48              | P1 (verbatim + diff nedenfor)                                                                            |
| §6.2 notify-only                                                                                                                                                                                                                            | disciplin.md:178–180         | P2 (verbatim + diff nedenfor)                                                                            |
| Forudsætninger: "Codex-runner + auto-merge + plan-branch-trigger (gov-5)"                                                                                                                                                                   | disciplin.md:476–484         | P5: punktet flyttes til "Gjort"-listen med gov-5-reference; Claude.ai/master-plan-punkterne urørte       |
| CLAUDE.md merge-konvention/identiteter                                                                                                                                                                                                      | CLAUDE.md                    | Verificeret: forbliver sand (konventionen genbruges) — ingen ændring; bekræftes i grep-fejning           |
| codex-review.sh usage-header                                                                                                                                                                                                                | scripts/codex-review.sh:4–12 | P4 opdaterer header med docs-fasen                                                                       |
| **Grep-fejning (obligatorisk, B5):** `grep -ri "notify\|runner\|manuel dispatch\|mål-tilstand\|skal bygges" docs/ scripts/ CLAUDE.md README.md` — hvert hit klassificeres: rettes / sand / historisk-bevaret (arkiv/git-history-referencer) | alle aktive docs             | Fanger det tabellen har overset — memory-lektion: D4-løftet kostede 3 runder at finde 7 steder enkeltvis |

## Patch-først pr. ændret fil (§3.1)

**P1 — disciplin.md:48 (§2-automation-note).** Nuværende body 1:1:

> **Automation-tilstand (Codes kortlægning, juni 2026 — Codes bord):** Der er **ingen notify-automation, ingen Codex-runner og intet auto-merge-workflow** (codex-notify + tracker-issue #12 nedlagt 2026-06-10 som død kanal — trigger-flade-arven ligger i git-history som gov-5-input). Codex-review dispatches via `scripts/codex-review.sh`. Merge-konvention (efter gov-4/PR #112, Mathias-besluttet): mgrubak-approval er gaten; Code merger derefter (rebase) — protection-kravene (required CI + code-owner-review) bærer kontrollen, ikke merge-klikket. Flowet ovenfor er mål-tilstanden — gates der hviler på auto-merge er ikke aktive endnu. Denne fil påstår ikke en automation der ikke kører.

DIFF (B5): omskrives til dirigent-virkelighed: kæden kører via `scripts/kaede/` (dirigent + adapters + kæde-issue), gates uændrede, manuelt flow = dokumenteret fallback (stop dirigenten). **Bevares:** merge-konventionen (uændret sand) + ærligheds-sætningen ("påstår ikke automation der ikke kører" — nu opfyldt med omvendt fortegn). Intet andet i §2 røres.

**P2 — disciplin.md:178–180 (§6.2).** Nuværende body 1:1:

> ### 6.2 Automation (Codes bord — tilstand: notify-only)
>
> Ingen notify-automation: `codex-notify.yml` + tracker-issue #12 er nedlagt (2026-06-10, GitHub-flade-renhed — kanalen havde ingen modtager; trigger-fladerne aktiv-plan/seneste-rapport/build-branch/slut-rapport-PR er gov-5-input, bevaret i git-history). Codex dispatches via `scripts/codex-review.sh`. Mål-tilstand (skal bygges, Codes bord — samlet i gov-5-automation): plan-branch-trigger, Codex-runner, auto-merge-flow ved grøn CI + godkendelse. `migrations-deploy.yml` deployer til live + regenererer types ved push til migrations (tracker-kvitterings-steps fjernet med kanalen; deploy-status ses i Actions).

DIFF (B5): overskrift → "Automation (Codes bord — kæde-dirigent)"; body → komponent-oversigt (dirigent, adapters, kæde-issue, identitets-tjek, divergens-STOP, fallback). **Bevares:** migrations-deploy-sætningen (uændret sand) + git-history-arve-referencen.

**P3 — .github/CODEOWNERS.** Nuværende body 1:1 (22 linjer): header (linje-format + sidst-matchende-vinder-regel + Unknown-owner-historik) · `* @mgrubak` · 4 eksplicitte strategi-doc-linjer · 3 udkommenterede lag-B-linjer. DIFF — indsættes EFTER `* @mgrubak`, FØR strategi-linjerne:

```
# Bogførings-flade (gov-5, Mathias-godkendt snit): ejer-løs linje = ingen
# code-owner-gate (GitHub-dokumenteret: sidst-matchende regel vinder; linje
# uden ejer fjerner ejerskab). Konservativt: KUN disse fem; alt andet — inkl.
# alt nyt — ejes af @mgrubak. Verificeret af test-PR (step 11b).
/docs/coordination/aktiv-plan.md
/docs/coordination/seneste-rapport.md
/docs/coordination/codex-reviews/
/docs/coordination/plan-feedback/
docs/coordination/*-status.md
```

**Bevares:** alt eksisterende inkl. lag-B-kommentarer og header-historik. Krav-dok/plan/rapport-historik/arkiv/teknisk-gaeld/huskeliste: **bevidst IKKE åbnet** (ved tvivl er det hans — krav 2). Mekanik-bevis: GitHub Docs "About code owners" (ejer-løs override-eksempel) + step 11b-test-PR.

**P4 — scripts/codex-review.sh.** Berørte sektioner 1:1: usage-header (linje 4–12: tre faser dokumenteret), PHASE-case (linje 242–247: `plan|build|slut-rapport` → OUTPUT_DIR), prompt-heredoc (linje ~265 ff.). DIFF: `docs)`-case + docs-prompt-variant (læseliste: diff + §8.1 + Review-klassifikation; fokus: prosa-modsigelse mod owns-ejerskaber; obligatorisk §8.1-SVAR-markør) + header-opdatering. **Bevares:** marker-parsing (linje 38–60), exit-koder, output-konvention, `--parse-test` (udvides, fjernes ikke).

**P5 — disciplin.md:476–484 (Forudsætninger).** Nuværende relevante punkt 1:1:

> - **Fundament + spærhager (Codes bord):** Codex-runner + auto-merge + plan-branch-trigger (gov-5). (gov-3 CI-blockers fuldt færdig — G065 lukket i gov-3b-3b. gov-4 branch protection fuldt aktiv 2026-06-10: required CI-check + required code-owner-review.)

DIFF (B5): punktet fjernes fra "Udestår"-listen; gov-5-leverancen tilføjes "Gjort i V5-adoptionen"-listen (mønster: eksisterende gov-pakke-entries). **Bevares:** Claude.ai- og master-plan-punkterne (gov-6 udestår fortsat) + hele Gjort-listen.

## End-to-end-test-design (§3.6 + krav 8)

- **Komponent (i pakken):** dirigent-fixtures (step 3: væknings-punkter, author-tjek, divergens, STOP-ruter) + `--parse-test` udvidet (step 4) — kørbare i CI.
- **Led (i pakken):** dry-run-gennemløb (logget dispatch-kæde mod forventet) + ét live led (step 9) + klik-bevis (step 11b).
- **Fuldt bevis (krav 8, læsning a):** gov-6 kører hele kæden; gov-5's slut-rapport bærer gennemløbet som evidens (dispatch-log led-for-led mod kæde-sporet); pakke-luk efter. Målbart: alle 9 væknings-punkter fyrede automatisk · Mathias' handlinger = gates + beslutnings-klik alene · 0 relæ-handlinger · 0 bogførings-klik.

## Doc-currency (§10.2)

**A. Fundament-validering:** ingen forretnings-intentions-ændring — verificeret current pr. main `437fc8b` mod vision (suverænitet bevaret; "Default = intet": dirigenten dispatcher intet uden deklareret regel; én sandhed: divergens-STOP) + forretningsforstaaelse (ingen forretnings-domæner berøres). Ingen intent-ændring.

**B. Status-opdatering (committes med merge):**

| Doc                        | Berørt? | Opdatering / N/A                              |
| -------------------------- | ------- | --------------------------------------------- |
| aktiv-plan.md              | ja      | markør-flip + Step-status (step 14)           |
| seneste-rapport.md         | nej     | uændret til Step 5                            |
| master-plan §4.1           | nej     | proces-pakke, ikke byggetrin                  |
| teknisk-gaeld.md (G)       | ja      | G062-håndtering noteret; evt. nye G ved build |
| huskeliste.md (H)          | ja      | H028-håndtering noteret                       |
| disciplin "Forudsætninger" | ja      | P5 (Codex V1-MELLEM lukket)                   |

## Åbne punkter (Codex V2-research + qwerg-læsning)

1. Step 6 headless-Code: STOP-betingelses-dækning — Codex: find blind-vinkler.
2. Kæde-issue: ét pr. pakke [valgt] + ét stående åbnings-issue — research-input velkomment.
3. Headless `claude -p` auth-kontekst — verificeres i step 9 dry-run.
4. Format-punkt (Formål-prefix) — Mathias/Claude.ai fornyer linjen før qwerg-merge.
5. **BLOCKER før qwerg:** step 13a protection-dump kræver Mathias-mandat (admin READ).
