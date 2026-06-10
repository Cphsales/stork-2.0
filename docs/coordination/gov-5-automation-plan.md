# gov-5-automation — Plan V1

**Branch:** claude/gov-5-automation-plan
**Krav-dok:** docs/coordination/gov-5-automation-krav-og-data.md (fornyet runde 1, Mathias-valideret 2026-06-10)
**Pakke-status:** docs/coordination/gov-5-automation-status.md
**Recon-grundlag:** docs/coordination/gov-5-automation-recon.md (PR #122)
**Plan-version:** V1 · konvergens-counter: 1

## Formål

> Workflowet kører automatisk fra start til slut: Mathias åbner, og Mathias lukker. Undervejs har han én fast kontrolpost — krav-dokket, forretningen, som kun han kan validere. Plan og byg valideres af rollerne; Mathias kaldes kun ind når der findes en afgørelse der er hans. Det vi bygger er grundstenen under alle fremtidige Stork 2.0-pakker, og målet er klart: sammen kan vi opnå greatness.

(1:1 fra krav-dok §Formål. NB format-punkt rejst til Mathias: structural-chain kræver `> Denne pakke leverer:`-prefix i begge Formål-blokke ved markør-flip — krav-dok fornys med prefix-linjen før qwerg-merge, indhold uændret.)

## Verificerede DB-objekter (§3.2)

**Ingen DB-objekter berøres.** Pakkens leverancer er lokale processer (dirigent + adapters), shell-/Node-scripts, GitHub-flade (CODEOWNERS, issue-mønster, protection-indstilling) og docs. Ingen migrations, ingen RPC'er, ingen policies, ingen grants. Evidens: implementations-rækkefølgen nedenfor indeholder 0 SQL-filer. (Supabase-MCP-dump derfor bevidst udeladt — der er ingen objekter at dumpe for.)

## G/H-opslag (§3.2)

| G/H                                                     | Løses-i                     | Håndtering                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [H028] mekanisk G/H-opslag i recon-doc'en               | gov-5 / partnerskabs-runde  | **Bevidst udskudt til partnerskabs-runden.** Begrundelse: H028's hjem-entry peger selv på recon-doc-mekanismen som partnerskabs-input; §3.2's manuelle pligt er broen og blev praktiseret i gov-5's recon. Kædens transport (denne pakke) er forudsætningen for mekanikken — ikke omvendt |
| [G062] recurring types-drift (auto-regen-cron-kandidat) | —                           | **Bevidst udskudt.** Ikke kæde-transport; eget G-spor. Dirigenten ændrer ikke deploy-/types-flowet                                                                                                                                                                                        |
| [H029] tekst-staleness                                  | dedikeret pakke efter gov-6 | **Udskudt (Mathias-besluttet).** Men gov-5 retter selv de tekster den forælder (§2-note, §6.2) — § 4 udtømt-formål, se Patch-først                                                                                                                                                        |
| H012/G039, H025, G063                                   | —                           | Rammer ikke automation-scope (REST-test, Trin 14-FK'er, gov-6-allowlist)                                                                                                                                                                                                                  |

## Verificerede afhængigheder

| Reference                                                                                                                                                                                          | Defineret i                             | Linje         | Brug i denne plan                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------ |
| §2-automation-note (mål-tilstand, delvist stale)                                                                                                                                                   | docs/strategi/disciplin.md              | 48            | Patch-først P1: omskrives til dirigent-virkelighed ved pakke-luk                                 |
| §6.2 Automation (notify-only-tekst)                                                                                                                                                                | docs/strategi/disciplin.md              | 178–180       | Patch-først P2: omskrives ærligt                                                                 |
| §9.1/§9.2/§9.3 rolle-hjem                                                                                                                                                                          | docs/strategi/disciplin.md              | 246/260/268   | Adapter-instrukser genbruger rollernes egne §9-sektioner — dirigenten definerer INGEN roller     |
| CODEOWNERS (`* @mgrubak`, sidst-matchende vinder)                                                                                                                                                  | .github/CODEOWNERS                      | 1–22          | Patch-først P3: ejer-løse bogførings-linjer                                                      |
| codex-review.sh dispatch + marker-parser + exit-koder 0–4 + `--parse-test`                                                                                                                         | scripts/codex-review.sh                 | 1–60, 200–247 | Genbruges som Codex-adapter; udvides med `--phase=docs` (recon E.5)                              |
| PHASE-case (plan\|build\|slut-rapport)                                                                                                                                                             | scripts/codex-review.sh                 | 242–247       | Indsætningspunkt for docs-mode                                                                   |
| ci.yml triggers (pull_request uden draft-eksklusion)                                                                                                                                               | .github/workflows/ci.yml                | 3–7           | Draft-PR'er får CI → plan-iteration valideres uden klik                                          |
| migrations-deploy.yml (push main + migrations-paths)                                                                                                                                               | .github/workflows/migrations-deploy.yml | 3–7           | Uændret — dirigenten rører ikke deploy                                                           |
| structural-chain + markør-regex (`fase: plan\|build\|rapport`)                                                                                                                                     | scripts/governance-check.mjs            | 285–324       | Markør-flip sker først post-qwerg (kræver Formål-prefix-fix, se ovenfor)                         |
| Lokalt værktøj verificeret 2026-06-10: claude CLI 2.1.172 (`~/.local/bin/claude`), codex-cli 0.137.0, gh 2.45.0 (konto stork-code-bot aktiv), node v24.15.0, systemd user-instans `running` (WSL2) | —                                       | —             | Dirigent-hosting + alle tre aktør-kørsler er lokalt mulige som krævet (krav 1)                   |
| Merge-konvention: mgrubak-approval er gaten, auto-merge --rebase armeret af Code                                                                                                                   | CLAUDE.md "Identiteter" + disciplin:48  | —             | Dirigenten genbruger konventionen — armerer auto-merge, klikker aldrig selv merge på gated PR'er |

## Design (krav 9: tavlen visket ren — formålet afgør)

**Kæde-dirigenten** (`scripts/kaede/dirigent.mjs` + `scripts/kaede/adapters/`): én lokal proces (systemd-user-service) der i en poll-cyklus (default 60s, konfigurerbar) læser **tilstand** — git fetch + `gh api` på PR'er/reviews/checks/issue-kommentarer — og afgør "hvis tur" ud fra en deklarativ tilstandsmaskine over kædens 9 væknings-punkter (recon B-tabellen). Derefter dispatcher den én aktør-kørsel og venter på dens afslutning.

Bærende valg, hver begrundet i formålet:

1. **Tilstandslæsning, ikke besked-kø** (maj-designets transport-princip): dirigenten genberegner tilstand fra repo/GitHub hver cyklus. Konsekvens: crash/stop mister intet — næste cyklus ser samme tilstand. **Krav 7 opfyldt strukturelt:** stop dirigenten → tilstanden ER det manuelle flow; intet går i stå.
2. **Polling, ikke webhooks:** lokal webhook kræver offentlig tunnel ind på Mathias' maskine — afvist (angrebs-flade + skørhed). 60s-latens er irrelevant mod aktør-kørslers minutter.
3. **Transport-renhed (krav 6):** dirigenten læser KUN tilstands-felter (branch-SHA'er, PR-state, fil-eksistens, marker-linjer, gate-ord) — aldrig leverance-indhold. Den kan ikke "vurdere" noget; den kan kun matche tilstand → dispatch-regel. Reglerne er deklarative i én konfig-fil (`scripts/kaede/kaede-regler.json`) — auditerbar, diff-bar.
4. **Dømmekraft bor i aktørerne:** adapters starter rollens egen kørsel med rollens egen §9-instruks; LÆSEFØLGE-pligt, severities, FLAG→LØS — alt uændret. Dirigenten parser kun aktørens **markers/exit-koder** (eksisterende mekanik, codex-review.sh:30–60) for at afgøre næste tilstand.
5. **Kvalitet pr. led (krav 4):** exit-kode ≠ 0-ruter: KRITISK → samme spor, næste runde; NEEDS-MATHIAS/ESCALATE/gate-markers → Mathias-flade + spor-pause; uventet output/parse-fejl → kæde-STOP + Mathias-notifikation + manuelt flow. Fejl flyttes aldrig videre.
6. **Mathias' flade (krav 2+3):** ét **kæde-issue pr. pakke** (GitHub). Dirigenten poster gate-anmodninger som kommentar med @mgrubak-mention → GitHub Mobile push. Mathias svarer med gate-ord som kommentar (qwers/krav OK/qwerg/slut OK/GODKENDT/AFVIST/stop) — **fra mobilen**. Dirigenten accepterer gate-ord KUN fra author `mgrubak` (identitets-tjek på kommentar-forfatter). PR-beslutninger: review-request → native GitHub Mobile push + approve fra mobil. Pakke-åbning fra mobil: "qwers <pakke> …"-kommentar på stående dirigent-issue.
7. **Klik kun på beslutninger (krav 2):** CODEOWNERS-differentiering (P3) + protection-justering så code-owner-kravet alene bærer gaten (admin-mandat, step 13). Konservativt: kun de fem enumererede bogførings-stier åbnes; alt andet — inkl. alt nyt — forbliver `* @mgrubak`. Ved tvivl: gate (krav 2, ordret).
8. **Spille hinanden bedre (krav 5):** dirigenten implementerer de parallel-mønstre disciplinen allerede definerer: krav-dok merged → Code-plan OG Codex-kode-research dispatches samtidig (§2.1); build-batch committet → Codex-batch-review parallelt med Codes næste batch (§9.3). Fund deles som committede filer (eksisterende mønster) — transporten garanterer at modtager vækkes med pointer straks.
9. **Suverænitet:** "stop" fra Mathias (enhver kanal dirigenten læser) → øjeblikkelig kæde-pause. Dirigent-tilstand vises i kæde-issuet (sidste handling + næste forventede) så Mathias altid kan se hvor kæden står.

**Claude.ai-rollen lokalt (krav 1, fornyet):** adapter kører `claude -p` med §9.1-rolleinstruks (genereret fra disciplin §9.1 + V2-mønstrets leverance-formater) for de to vækbare leverancer: slut-rapport-review og qwerg-gate-pakke. Rollen skriver sin leverance som **untracked fil** (V2-mønstret: docs/coordination/codex-reviews/<dato>-<pakke>-runde-<n>-claude-ai.md); **Code committer** — §1's eneste-repo-skriver-grænse bevares. Windows-appen består urørt til dialogen med Mathias (krav-dok-fasen).

## End-to-end-spor (§3.3, tilpasset: ingen DB-write-veje — kæde-spor i stedet)

Ét konkret gennemløb, gov-6 som case (= krav 8's bevis), komponent + identitet + gate pr. led:

1. Mathias kommenterer "qwers gov-6-arkiv-fold" på dirigent-issuet (mobil) → dirigent (stork-code-bot) verificerer author=mgrubak → dispatcher Claude.ai-rolle-recon? **Nej** — Step 0/1 er dialog (vækkes ikke, krav 1); dirigenten poster kvittering + venter på krav-dok-fil
2. Krav-dok committet (Code) + merged → dirigent ser merge → dispatcher Code-plan-adapter OG Codex-research-adapter parallelt (§2.1)
3. Code committer plan-V1 på plan-branch → dirigent ser ny V<n> → dispatcher Codex-review (`codex-review.sh <plan> <n>`)
4. Codex-fil committet (Code committer adapter-output) → marker-parse: FEEDBACK → dispatch Code-V2 · APPROVAL → dispatch Claude.ai-rolle (qwerg-gate-pakke, untracked → Code committer) → gate-anmodning på kæde-issue + @mgrubak → **Mathias læser pakke, svarer "qwerg" (mobil)**
5. qwerg verificeret (author-tjek) → dirigent dispatcher Code-build; pr. batch-commit dispatches Codex-batch-review parallelt (§9.3)
6. Build-PR klar (grøn CI + reviews) → dirigent armerer intet selv — Code-adapteren har armeret auto-merge ved PR-oprettelse; dirigent re-requester mgrubak-review → **GitHub Mobile push → Mathias approver (mobil)** → auto-merge fyrer
7. Merge set → dispatch Code-slut-rapport → push set → dispatch Claude.ai-rolle-review (untracked → Code committer) → APPROVAL → gate-anmodning → **Mathias svarer "slut OK" (mobil)** → Code merger slut-rapport-PR (mgrubak-approval er gaten, konvention uændret)
8. Hvert led: exit-kode/marker-parse før næste dispatch (krav 4). Ethvert brud → spor-pause + Mathias-notifikation + manuelt flow (krav 7)

## Implementations-rækkefølge

| Step | Type                      | Hvad                                                                                                                                         | Eksakt indhold                                                                                                                                                                 | Afhængigheder | Risiko                                                                                                 |
| ---- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------ |
| 1    | Node-script               | `scripts/kaede/tilstand.mjs`                                                                                                                 | Tilstandslæser: git fetch + gh api → normaliseret tilstands-objekt (branches, PR-state, checks, reviews, issue-kommentarer m. author, marker-filer). Ren læsning, ingen writes | gh-konto bot  | Lav — read-only                                                                                        |
| 2    | JSON + Node               | `scripts/kaede/kaede-regler.json` + `scripts/kaede/dirigent.mjs`                                                                             | Deklarativ tilstandsmaskine (9 væknings-punkter) + dispatch-løkke m. poll-interval, lås-fil (én kørsel ad gangen), struktureret log                                            | Step 1        | Mellem — kernen; dækkes af fixture-tests (step 3)                                                      |
| 3    | Tests                     | `scripts/kaede/dirigent.test.mjs` (vitest)                                                                                                   | Fixture-tilstande → forventet dispatch pr. væknings-punkt; author-tjek-cases (gate-ord fra ikke-mgrubak ignoreres + flagges); parse-fejl → STOP-rute                           | Step 2        | Lav                                                                                                    |
| 4    | Shell-patch               | `scripts/codex-review.sh` `--phase=docs`                                                                                                     | Ny case i PHASE-case (linje 242–247) + docs-prompt-variant (§8.1-fokus, Review-klassifikation); marker-parser/exit-koder uændrede; `--parse-test`-fixtures udvidet             | —             | Lav — additiv; recon E.5-fix                                                                           |
| 5    | Adapter                   | `scripts/kaede/adapters/codex.sh`                                                                                                            | Wrapper: vælger fase ud fra tilstand (plan/build/slut-rapport/docs) → codex-review.sh → committer output-fil → exit-kode videre til dirigent                                   | Step 2, 4     | Lav                                                                                                    |
| 6    | Adapter                   | `scripts/kaede/adapters/code.sh`                                                                                                             | `claude -p` headless m. qwerr-ækvivalent kontekst-prompt (LÆSEFØLGE-pligt ligger i rollen); arbejder på korrekt branch; rapporterer commit-hash                                | Step 2        | Mellem — headless Code skal respektere alle §9.2-stop-betingelser; dry-run-test før aktivering         |
| 7    | Adapter + instruks        | `scripts/kaede/adapters/claude-ai-rolle.sh` + `scripts/kaede/claude-ai-rolle-instruks.md` (instruks bor hos adapterne — permanent komponent) | `claude -p` m. §9.1-instruks for de to vækbare leverancer; output untracked; Code committer (step 6-adapter)                                                                   | Step 2        | Mellem — rolle-renhed (docs-lag, ingen kode-vurdering) håndhæves i instruks + Codex tjekker leverancer |
| 8    | Adapter                   | `scripts/kaede/adapters/mathias.mjs`                                                                                                         | Kæde-issue-mønster: gate-anmodnings-kommentar m. @mgrubak-mention; gate-ord-læsning m. author-verifikation; review-re-request på beslutnings-PR'er                             | Step 1        | Lav — gh api                                                                                           |
| 9    | Integration               | Dry-run-mode (`--dry-run`: log dispatches uden at køre dem) + ét kontrolleret led live (Codex --quick på test-branch)                        | Verificeret dispatch-log mod forventet sekvens                                                                                                                                 | Step 1–8      | Lav                                                                                                    |
| 10   | systemd                   | `scripts/kaede/stork-kaede.service` (user-unit) + install-note                                                                               | Restart=on-failure; WantedBy=default.target; stop = manuelt flow                                                                                                               | Step 9        | Lav                                                                                                    |
| 11   | CODEOWNERS                | Patch-først P3                                                                                                                               | Ejer-løse linjer for 5 bogførings-stier (eksakt diff nedenfor)                                                                                                                 | —             | Mellem — forkert sti = mistet gate; konservativ enumeration + Codex-tjek                               |
| 12   | Docs                      | Patch-først P1+P2: disciplin §2-note + §6.2 → ærlig dirigent-virkelighed; §9-recon-trins-formalisering                                       | Eksakt diff nedenfor; §8.1-gate (governance-doc)                                                                                                                               | Build færdig  | Lav                                                                                                    |
| 13   | Protection (admin-mandat) | Required-approvals-samspil verificeres + justeres så code-owner-kravet alene bærer gaten                                                     | KUN på eksplicit Mathias-mandat, fælles admin-login, switch tilbage til bot straks (CLAUDE.md-regler)                                                                          | Step 11       | Mellem — verificeres med test-PR (à la gov-4 #111) før tillid                                          |
| 14   | Docs                      | aktiv-plan markør-flip → `fase: build`-mekanik dokumenteret + seneste-rapport uændret                                                        | Doc-currency B                                                                                                                                                                 | qwerg         | Lav                                                                                                    |

**Skitse-størrelse (§2 2.0):** 0 migrations → fuld V1 (grænsen er migrations-baseret). Komponent-bredden håndteres i build-batches: B1=step 1–3 · B2=step 4–7 · B3=step 8–9 · B4=step 10–11+13 · B5=step 12+14. Per-batch Codex-review (§9.3).

## Patch-først pr. ændret fil (§3.1)

**P1 — disciplin.md:48 (§2-automation-note).** Nuværende body 1:1:

> **Automation-tilstand (Codes kortlægning, juni 2026 — Codes bord):** Der er **ingen notify-automation, ingen Codex-runner og intet auto-merge-workflow** (codex-notify + tracker-issue #12 nedlagt 2026-06-10 som død kanal — trigger-flade-arven ligger i git-history som gov-5-input). Codex-review dispatches via `scripts/codex-review.sh`. Merge-konvention (efter gov-4/PR #112, Mathias-besluttet): mgrubak-approval er gaten; Code merger derefter (rebase) — protection-kravene (required CI + code-owner-review) bærer kontrollen, ikke merge-klikket. Flowet ovenfor er mål-tilstanden — gates der hviler på auto-merge er ikke aktive endnu. Denne fil påstår ikke en automation der ikke kører.

DIFF: omskrives ved pakke-luk (step 12) til dirigent-virkelighed: kæden kører via `scripts/kaede/` (dirigent + adapters), gates uændrede, manuelt flow dokumenteret fallback. Bevares: merge-konventionen (uændret sand), "denne fil påstår ikke automation der ikke kører"-ærligheden (nu med omvendt fortegn). Intet andet i §2 røres.

**P2 — disciplin.md:178–180 (§6.2).** Nuværende body 1:1:

> ### 6.2 Automation (Codes bord — tilstand: notify-only)
>
> Ingen notify-automation: `codex-notify.yml` + tracker-issue #12 er nedlagt (2026-06-10, GitHub-flade-renhed — kanalen havde ingen modtager; trigger-fladerne aktiv-plan/seneste-rapport/build-branch/slut-rapport-PR er gov-5-input, bevaret i git-history). Codex dispatches via `scripts/codex-review.sh`. Mål-tilstand (skal bygges, Codes bord — samlet i gov-5-automation): plan-branch-trigger, Codex-runner, auto-merge-flow ved grøn CI + godkendelse. `migrations-deploy.yml` deployer til live + regenererer types ved push til migrations (tracker-kvitterings-steps fjernet med kanalen; deploy-status ses i Actions).

DIFF: "tilstand: notify-only" → dirigent-beskrivelse (komponenter, kæde-issue-mønster, identitets-tjek, fallback). Bevares: migrations-deploy-sætningen (uændret sand), git-history-arve-referencen. §8.1-gate + Codex prosa-modsigelses-svar obligatorisk (governance-doc).

**P3 — .github/CODEOWNERS.** Nuværende body 1:1 (22 linjer): header-kommentarer + `* @mgrubak` + 4 eksplicitte strategi-doc-linjer + 3 udkommenterede lag-B-linjer. DIFF — tilføjes EFTER `* @mgrubak` (sidst-matchende vinder), før strategi-linjerne:

```
# Bogførings-flade (gov-5, Mathias-godkendt snit): ejer-løs = ingen code-owner-gate.
# Konservativt: KUN disse fem; alt andet (inkl. alt nyt) ejes af @mgrubak.
/docs/coordination/aktiv-plan.md
/docs/coordination/seneste-rapport.md
/docs/coordination/codex-reviews/
/docs/coordination/plan-feedback/
docs/coordination/*-status.md
```

Bevares: alt eksisterende, inkl. de udkommenterede lag-B-linjer og header-historikken. Krav-dok-/plan-filer, rapport-historik, arkiv, teknisk-gaeld, huskeliste: **bevidst IKKE åbnet** (grænse-cases — ved tvivl er det hans, krav 2; kan åbnes senere ved Mathias-ord).

**P4 — scripts/codex-review.sh.** Berørte sektioner 1:1: PHASE-case linje 242–247 (`plan|build|slut-rapport` → OUTPUT_DIR) + prompt-heredoc linje ~265 ff. DIFF: ny `docs)`-case + docs-prompt-variant (læseliste: diff + §8.1 + Review-klassifikation; fokus: prosa-modsigelse mod owns-ejerskaber; format: §8.1-SVAR-markør obligatorisk). Marker-parsing (linje 38–60), exit-koder, output-konvention: uændrede. `--parse-test`-fixtures udvides med docs-case.

## End-to-end-test-design (§3.6 + krav 8)

- **Komponent-niveau (i pakken):** dirigent-fixture-tests (step 3) — hvert væknings-punkt + author-tjek + STOP-ruter; codex-review.sh `--parse-test` udvidet (step 4); kørbare i CI (vitest + shell).
- **Led-niveau (i pakken):** dry-run-gennemløb af fuld sekvens (logget dispatch-kæde matcher forventet) + ét live led (Codex --quick på test-branch) — step 9.
- **Fuldt bevis (krav 8, læsning (a)):** gov-6 kører hele kæden; gov-5's slut-rapport bærer gennemløbet som evidens (led-for-led-log mod kæde-sporet ovenfor); pakke-luk efter. Målbart: alle 9 væknings-punkter fyrede automatisk; Mathias' eneste handlinger var gates + beslutnings-klik; 0 relæ-handlinger.

## Doc-currency (§10.2)

**A. Fundament-validering:** planen ændrer ingen forretnings-intention — verificeret current pr. main `437fc8b` mod vision (suverænitet/§1 bevaret; "Default = intet": dirigenten dispatcher intet uden deklareret regel; princip 5-lifecycle: protection-ændring kun på mandat) + forretningsforstaaelse (ingen forretnings-domæne-flader berøres). Ingen intent-ændring.

**B. Status-opdatering (committes med merge):**

| Doc                        | Berørt? | Opdatering / N/A                                                                                         |
| -------------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| aktiv-plan.md              | ja      | markør-flip + Step 2/3-status (post-qwerg, step 14)                                                      |
| seneste-rapport.md         | nej     | uændret til Step 5                                                                                       |
| master-plan §4.1           | nej     | gov-5 er proces-pakke, ikke byggetrin (§4.1 uændret; "Forudsætninger"-listen i disciplin rettes i P1/P2) |
| teknisk-gaeld.md (G)       | ja      | G062-håndtering noteret (udskudt); evt. nye G ved build                                                  |
| huskeliste.md (H)          | ja      | H028-håndtering noteret (udskudt til partnerskabs-runde)                                                 |
| disciplin "Forudsætninger" | ja      | "Codex-runner + auto-merge + plan-branch-trigger (gov-5)" → gjort (P1/P2, §8.1-gate)                     |

## Åbne punkter (Codex-research + qwerg-læsning)

1. Code-adapter-headless (step 6): afgrænsning af hvad headless-Code må uden interaktiv Mathias — STOP-betingelser skal dække alt §9.2 forbyder. Codex: find blind-vinkler.
2. Kæde-issue vs. flere kanaler: én pr. pakke [valgt] vs. ét stående — research-input velkomment.
3. Secrets/auth for headless `claude -p` (eksisterende login-kontekst genbruges — verificeres i step 9 dry-run).
4. Format-punktet (Formål-prefix) — Mathias/Claude.ai fornyer krav-dok-linjen før qwerg-merge.
