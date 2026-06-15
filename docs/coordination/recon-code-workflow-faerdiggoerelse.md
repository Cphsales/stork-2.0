# Recon (Code) — workflow-færdiggørelse

**Type:** Funktions-recon fra Code — input til planen, IKKE en plan
**Dato:** 2026-06-15 · **Status:** RECON-FUND — committet + PR'et for at låse min version mod overskrivning (det delte arbejdstræ tillod ellers in-place-erstatning)
**Forfatter:** Code (`stork-code-bot`) · **Kontrakt:** `docs/coordination/workflow-faerdiggoerelse-krav-og-data.md`

## Læsenote (form + grundlag)

- **Grundlag:** branch-bevidst git-sync kørt; kontrakt + nuværende workflow læst; alle ✓-fund er live-afprøvet i denne session i `/home/mathias/stork-2.0`.
- **Framing (bindende fra kontrakt + Mathias):** det nuværende workflow (`disciplin.md`, kæden, docs + kode) er **KUN inspiration — på niveau med nettet**, ikke fundament. Recon starter fra kravet.
- **Roller/adgange er åbne:** ingen aktørs nuværende adgang er låst som forudsætning. Udvidet adgang foreslås som kandidat, ikke valg.
- **FORM:** kun fund + åbne spørgsmål. Ingen plan, intet design, intet funktionsvalg.
- **Mærker:** ✓ bevist live i vores setup · ⚑ flag (flade-begrænset / ikke fyret / eksperimentel) · ✦ nyt vi ikke havde tænkt på · ⚠ udfordrer vores tænkning.
- **Codex-afgrænsning:** Codex' eget udstyr reciteres ALDRIG her — det kommer fra Codex' egen fil.
- **Kravs-vurdering:** kravet er hverken fundet forkert eller umuligt → ingen STOP. Én faktuel observation (bot-`admin:true`) bæres videre som Mathias-/plan-beslutning, ikke som recon-begrænsning.

---

# KILDE 0 — Inter-aktør-kanaler (verificeret denne session)

Hvordan Code faktisk kan sende til / modtage fra de andre aktører lige nu — kun det der er afprøvet.

- ✓ **Delt filsystem / samme repo-arbejdstræ.** `ps` + `/proc/<pid>/cwd` viser Codex-processer med cwd `= /home/mathias/stork-2.0`, samme bruger (`mathias`) som mig. Deponering verificeret (skrev+læste+fjernede en probe-fil i træet). → rå to-vejs-kanal virker NU. **Men:** ingen postkasse-konvention (`grep .gitignore` = intet `postkasse/mailbox/inbox`), og **ingen signalering** — en deponeret fil "pinger" ikke modtageren; hver part skal selv kigge. Evidens for at den anden vej bruges: en untracked recon-fil blev ændret in-place i dette delte træ (→ derfor låses denne version via commit/PR).
- ✓ **GitHub (`Cphsales/stork-2.0`).** `gh` som `stork-code-bot` (write); committet/pushet indhold + issues + PR-kommentarer er delt kanal. **Untracked/gitignorerede filer rejser IKKE her.** Async, kræver commit+push.
- ⚑ **Kæde-transport (kurér + adapters + dispatch-log).** `scripts/kaede/adapters/{code,codex,claude-ai-rolle}.sh` + `dirigent.mjs` + `.dispatch-log.jsonl` findes, men `stork-kaede.service` = **`inactive (dead)`**; dispatch-loggens sidste linjer er Jun 12. → bygget men SLUKKET nu (manuel fase).
- ⚑ **Direkte injektion i Codex' kørende session-stdin** — ingen verificerbar mekanisme fra min side. Jeg kan deponere en fil i det delte træ, ikke skrive ind i dens REPL.

---

# KILDE 1 — Mit eget udstyr (Claude Code), pr. metode-familie

Funktioner i samme familie _er_ hinandens alternativer = materialet til planens to-modsvar.

### A. Hård spærring/validering ved et led

_(tjener: "fang fejl/brud ved hvert led, ikke til sidst"; "intet lukkes uden fuld validering")_

- **PreToolUse-hooks** ✓ — script ved livscyklus-punkt, `exit 2` = kaldet afvises. **Testet:** armet låsefil → Bash med blokeret mønster hård-blokeret (kommandoen kørte aldrig); lås fjernet → kører. **Metode:** deterministisk fysisk nægtelse uafhængigt af model-hukommelse.
- **Plan-tilstand** ✓ — permission-mode hvor edits gates til godkendelse (`--permission-mode plan`). **Testet:** nested headless plan-mode nægtede at skrive fil, ingen fil skabt; i headless er der ingen godkendelses-sti → stopper med planen. **Metode:** edit-gate hvor frigivelsen ender i menneske-godkendelse.
- **Auto mode** ✓ — semantisk klassifikator (`allow`/`soft_deny`/`hard_deny` natursprogs-regler). **Testet:** `claude auto-mode config/defaults` returnerer ægte intent-regler (scope-eskalation, preemptive block). **Metode:** intent-bevidst gating under uovervåget drift.
- **Permissions-allowlist** ✓ — statisk allow/deny pr. værktøjs-mønster. **Testet:** i kraft denne session. **Metode:** statisk handlings-grænse pr. aktør/spor.
- _Alternativer i familien:_ de fire bærer samme metode med forskellig hårdhed/altitude (deterministisk vs. semantisk vs. statisk vs. edit-specifik) + CI/`governance-check.mjs` som post-hoc-variant (kilde 4).
- ⚑ **Hook-events ud over PreToolUse** (`Stop`/`SubagentStop`/`SessionStart`/`UserPromptSubmit`) — konfigurérbare, kun PreToolUse bevist (ægte recon-unknown, se nederst).

### B. Parallelle perspektiver / rolle-instanser

_(tjener: forretnings-/kode-recon; krav-troskab; "lade aktørerne løfte hinandens arbejde")_

- **Subagent-dispatch (Agent-værktøj)** ✓ — **testet:** spawnede `Explore`-agent, returnerede struktureret inventar. **Metode:** isoleret bounded arbejde i eget kontekst-vindue, samlet af lead.
- **Inline custom-agent + selection (`--agents`/`--agent`)** ✓ — **testet:** nested `claude -p --agents '{…}' --agent reconprobe "ping"` returnerede præcis `PONG`. **Metode:** ad hoc rolle-typede instanser defineret on-the-fly.
- **Headless `claude -p`** ✓ — **testet:** bar både plan-mode- og custom-agent-prøven. **Metode:** deterministisk scriptbar instans-kørsel.
- ⚑ **Workflow-værktøjet** — present, bevidst ikke kørt (orkestrering er opt-in; recon-fase). **Metode:** deterministisk scriptet fan-out/pipeline + adversarial-verify.
- ⚑ **Agent Teams** — eksperimentel, slukket (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`), ingen resume; peer-beskeder + delt task-liste.
- ⚑ **pr-review-toolkit's 6 review-agenter** (code-reviewer, silent-failure-hunter, type-design, pr-test, comment, simplifier) — i marketplace, men **nul plugins aktive** (`claude plugin list` tom) → ét `claude plugin enable` væk.
- _Alternativer:_ subagenter (rapporterer kun til lead) vs. Agent Teams (peer-til-peer) vs. Workflow (scriptet) vs. headless-instanser vs. plugin-review-agenter — reelle forskelle i koordination/maturitet.

### C. Rolle-skift / to rolle-typer

_(tjener: "to rolle-typer aktørerne skifter mellem"; "fordel roller så grundighed OG effektivitet øges")_

- **Inline `--agents`/`--agent`** ✓ · **`--permission-mode` / `chat:cycleMode` (shift+tab)** ✓ (mode-skift bekræftet i binær + keybinding-output) · **Skills som rolle-bootstrap** ✓ — **Metode:** skift mellem en "workflow-rolle" og en "almindelig" rolle pr. dispatch/mode.
- _Alternativer:_ `--append-system-prompt`, output-styles, separate agent-filer, CLAUDE.md-pr-rolle.

### D. Automatisk drift åbning→luk

_(tjener: "kør automatisk fra åbning til luk"; "automatisér transport, ikke dømmekraft"; beskyt Mathias' friskhed)_

- **Baggrunds-Bash-task + completion-notifikation** ✓ — **testet:** detached job, ID straks, `<task-notification>` ved exit. **Metode:** ikke-blokerende lange ops + async genvækning.
- **Agent-view / background-agent-supervisor (`claude agents`)** ✓ — **testet:** `--json --all` listede live sessioner (denne + idle), overlever terminal. **Metode:** dispatch/observér/attach langtkørende sessioner.
- **Session-cron (`CronList`)** ✓ (queryable, tom) / **`CronCreate`** present (ikke fyret) — **Metode:** tidsplanlagt gen-enqueue (durable persisterer).
- ⚑ **`/loop` + `ScheduleWakeup`** — present, ikke fyret. ⚑ **Cloud-Routines (`schedule`-skill)** — cloud + GitHub-app. ⚑ **`--from-pr`** — kræver PR-koblet session.
- _Alternativer:_ background (one-shot) vs. agent-view (sessioner) vs. cron (tid) vs. /loop (selv-paced) vs. cloud-Routines (maskin-uafhængig) vs. systemd (kilde 4).

### E. Notifikation / gate-overvågning

_(tjener: "fang brud undervejs"; ren rapportering af åbne gates)_

- **Monitor** ✓ — **testet:** 3 per-event-notifikationer + stream-end. **Metode:** per-occurrence-besked når tilstand ændrer sig (log/PR/fil).
- **Background-task-completion** ✓ — én besked ved afslutning.
- _Alternativer:_ Monitor (per-event) vs. background (one-shot) vs. cron (poll) vs. hooks (livscyklus) vs. `gh`-poll-løkke vs. Cowork/Telegram-MCP (kilde 3).

### F. Isolering af parallelt fil-arbejde

_(tjener: sideløbende byg/review uden kollision)_

- **Worktree-isolation** ✓ — **testet:** opret/list/fjern rent; to gate-worktrees findes allerede i vores setup. **Metode:** isoleret checkout pr. session/agent. _Alternativer:_ separate clones, branches+sekventielt, agent-view-sessioner med eget cwd.

### G. Værktøjs-rækkevidde / transport til eksterne systemer

_(tjener: "lade main/GitHub være sporet")_

- **ToolSearch / MCP on-demand-load** ✓ — **testet:** loadede 6 schemaer; Supabase-MCP connected + allowlistet. **Metode:** lazy adgang til stor værktøjs-flade (GitHub, Supabase, docs).
- ⚑ **MCP ud over Supabase** (M365/Atlassian/Notion/Linear …) — kræver interaktiv auth. _Alternativer:_ statisk `--mcp-config`, direkte CLI (`gh`, `supabase`), plugin-MCP.

### H. Persistens mellem led

_(tjener: kontekst mellem sessioner uden Mathias-genfortælling)_

- **Memory (fil-baseret)** ✓ — **testet:** recall virker (MEMORY.md i kontekst); writes rutine. **Metode:** bevaring af facts/feedback/beslutninger på tværs af sessioner. _Alternativer:_ repo-docs (committet), pakke-status-fil, `kaede-regler.json` (kilde 4).

### I. Skills som ét-kalds-procedure

_(tjener: faste preflight/rolle-instruks/gate-tjek)_

- **Skills** ✓ — **testet:** `keybindings-help` dispatchede + injicerede sin procedure (ingen ændring lavet — invokationen er beviset). **Metode:** gentagne procedurer ens i ét kald. _Alternativer:_ custom-agents, append-system-prompt, plugin-commands, skill-creator (enable-væk).

### Flag-rest i kilde 1 (ingen tavs overspringelse)

- ⚑ **`/goal`** — intet `goal` i `--help`/skills; evaluator kan ikke kalde værktøjer; eneste indgang = interaktiv REPL (menneske-tastet/session-start). Ikke reachable fra modellens værktøjs-/headless-flade.
- ⚑ **ultrareview (`claude ultrareview`)** — subcommand bekræftet; ikke kørt (cloud-kost; Codex-uafhængighed er governance-valg).
- ⚑ **Computer use / `--chrome`** — flag i binær; kræver desktop-Chrome = Mathias' flade. ⚑ **Fork-subagenter** (`CLAUDE_CODE_FORK_SUBAGENT=1`) — env-gated. ⚑ **Sandboxing** — `bwrap` på `/usr/bin/bwrap`, men ikke håndhævet på denne sessions Bash (off by default her). ⚑ **Statusline** — ingen konfigureret, klient-display. ⚑ **`/rewind`/`/context`** — REPL-only; **`/doctor`** subcommand (health-check, ikke workflow-bærende).
- **Setup-fakta (testet):** `effortLevel: xhigh`, `useAutoModeDuringPlan: true`, `skipDangerousModePermissionPrompt: true` sat globalt. To PreToolUse-hooks (stork1/arkiv-lås) findes men er **gated på låsefiler der aktuelt er fraværende** → inaktive nu. Ingen `.claude/rules/`, ingen custom commands/agents/skills i repo eller globalt. `claude` CLI = 2.1.177.

---

# KILDE 2 — Nettet, bredt: hvordan feltet bygger Claude/Codex-workflows

Mønstre, ikke kun enkelt-funktioner. Hver mappet til en testet kilde-1-bærer hvor muligt.

### Cluster 1 — Hvordan de kobler det sammen

- **PIV-loop (Plan-Implement-Verify)** som kerne-mekanik — "holder agenten ansvarlig ved hvert led, forhindrer silent-failure-spiraler." ✓ matcher "validering ved hvert led."
- **Operator/orchestrator-mønster** — "brain"-agent deler mål op, delegerer til subagenter, syntetiserer; sekventiel/pipeline simplest.
- **Tre arkitektur-mønstre:** (1) **subagenter** (parent styrer dependency-graf manuelt); (2) **Agent Teams** (delt task-liste, auto-dependency, peer-beskeder, **fil-låsning**); (3) **cloud-orchestrators** (delegér, luk laptop, review PR senere). ✦ "to niveauer af agent-koordination" formaliseres kun i Claude Code.
- **JSON-drevne workflow-frameworks som community-projekter** (`catlog22/Claude-Code-Workflow`, `cexll/myclaude`). ✓ validerer at en deklarativ regelbog (vores `kaede-regler.json`) er anerkendt mønster.
- **Inter-agent-JSON-kontrakter** + "narrow task + narrow toolset + narrow output-contract" som rolle-hygiejne. ✦

### Cluster 2 — Parallelisme + verifikations-flaskehalsen ⚠

- ⚠✓ **"The bottleneck is no longer generation. It's verification."** — at fanne bredt ud skader hvis review ikke kan følge med; flaskehalsen er Mathias' review-kapacitet, ikke agent-antal.
- ✦⚠ **3-5 teammates er sweet-spot** (token-kost lineær); "tilføj kun en parallel agent når du kan reviewe dens output"; review-workflow bruger 3 "fordi et menneske kan holde 3 rapporter i hovedet" — konkret menneske-bandbredde-loft.
- ✓✦ **Worktrees = standard-isolations-primitiv**; dashboards findes (Conductor, dux, VS Code multi-agent, diff-first review-UI). _Felt-observation:_ mange kører Claude Code + Codex som parallelle agenter i separate worktrees — **Codex' eget setup er Codex' bord, reciteres ikke.**
- ✓ **"Monitor hver 5-10 min, hover ikke; dræb agenter fast 3+ iterationer."** matcher konvergens-counter auto-STOP.

### Cluster 3 — Gating/review-opsætning

- ✦ **Tre obligatoriske gates:** (1) **plan-godkendelse FØR kodning**; (2) **hooks på livscyklus-events** (tests/lint før opgave må markeres færdig; agent arbejder videre hvis checks fejler → peger på `Stop`/`SubagentStop`-hooks, mit ubeviste flag); (3) **dedikeret read-only reviewer-teammate** (auto-trigger på hver opgave-afslutning).
- ✓ **Spec-compliance = primært review-kriterium** ("does code meet the spec?") = vores krav-troskabs-tjek, løftet til primær gate.

### Cluster 4 — Spec-Driven Development (SDD) som navngivet felt

- ✓✓ **Eksekverbar, versions-styret SPEC som eneste sandhed**: spec → plan → atomare opgaver → derefter kode; "compliance-verification fanger defekt-klasser unit-tests strukturelt ikke kan." Dette ER vores krav-dok→plan→byg→valider-model som industriens anerkendte mønster.
- ✦ **Vi havde ikke tænkt på:** økosystem (GitHub Spec Kit, AWS Kiro, OpenSpec, BMAD, Tessl, Antigravity) + **EARS**-krav-notation — kandidat-inspiration til maskin-verificerbar krav-dok-struktur.

### Cluster 5 — Model/effort + ressource-fordeling

- ✦✓ **2D-kontrolflade: model-tier × effort-level.** Subagenter kan **hver køre sin egen model**. Mønster: main på Opus, review på Sonnet, opslag på Haiku → **60-80% kost-besparelse uden kvalitetstab**; "Haiku-explorer + Sonnet-reviewer dækker 80%." _Bærer hos os:_ `--model`/`--effort` pr. agent.
- ✓ **Per-agent token-budgetter**, auto-pause ved 85%, kill+reassign efter 3 fastsiddende iterationer — matcher §3.4.

### Cluster 6 — CI/headless/hosting

- ✦ **`claude -p`** + **`--output-format json`** + **`--max-turns`** + **`--max-budget-usd`** + concurrency-grupper + timeouts (`--max-budget-usd`/`--max-turns` er nye guardrails jeg ikke havde noteret). ✓ headless bekræftet live.
- ✦ **Officiel GitHub Action `anthropics/claude-code-action@v1`** wrapper headless; **`prompt` kan være ren tekst ELLER navnet på en skill**; `claude_args` sendes igennem. Self-hosted runners + GitLab/Jenkins; secrets til nøgler.

### Cluster 7 — Felt-taksonomi for hvad-bruges-til-hvad

- ✓ **Tools/MCP = nye handlinger · Skills = genbrugbare metoder · Subagenter = isolér eksekvering · Hooks = håndhæv constraints + saml audit-signaler · Plugins = distribution** — kortlægger rent til mine kilde-1-familier.
- ✦ **Subagenter er en _kontekst-styrings_-primitiv, ikke kun delegering**: arbejdet i frisk kontekst, kun resumé returnerer → forhindrer "context-contamination." Konsekvens: at fanne recon/review til subagenter er også kontekst-hygiejne der holder lead'ens dømmekraft skarp.

### Cluster 8 — Det der UDFORDRER vores tænkning ⚠ (vigtigst)

- ⚠ **Menneske-skrevet kontekst slår AI-skrevet.** Citeret forskning: **LLM-genererede `AGENTS.md`/`CLAUDE.md` giver ingen gevinst og kan marginalt _sænke_ succes (~3%)**; udvikler-skrevet giver ~4% forbedring; **opdatér aldrig automatisk.** → udfordrer at AI-aktører forfatter/vedligeholder governance-/CLAUDE-docs hos os.
- ⚠ **"Human pain was a feature":** langsom generering tvang tidlig fejl-opdagelse; agenter fjerner den flaskehals, så små fejl skalerer lydløst til arkitekturen kollapser — quality-gates kompenserer.
- ⚠✓ **Hallucination på datoer/navne/tal = behandl som hypotese**, kræver kilde-/faktatjek før handling — validerer grundlag-før-svar.
- ⚠✓ **Kontekst-attention degraderer over lange sessioner** (ikke fyldt vindue — attention) → resumé + ny session — validerer §3.10 session-skift.
- ✦ **"Factory model":** man bygger fabrikken der bygger softwaren — process-disciplin, WIP-limits, kill-kriterier, retrospektiver. Rammer præcis hvad "workflow-færdiggørelse" er.
- ✓ **Meta-fund:** gabet mellem værdi og spild er IKKE hvilket værktøj, men om man har bygget en reel arbejds-relation inde i et reelt workflow — bekræfter kontraktens FOKUS (HVORDAN over funktions-listen).

**Kilder (uafhængige, ikke-vendor):** MindStudio (workflow patterns) · AddyOsmani (Code Agent Orchestra) · Simon Willison (parallel coding agents) · Patrick D'appollonio (multiple agents) · hidekazu-konishi (CI/CD & headless) · Code With Seb (headless CI/CD playbook) · dev.to (model selection) · prommer.net + BCMS (Spec-Driven Development) · orchestrator.dev (agent memory) · tw93 (inside Claude Code) · Medium (7-month honest review).

---

# KILDE 3 — Cowork som mekanisme (kandidat to-vejs-kanal mellem aktørerne)

- **Hvad:** Claude Cowork = Anthropics **Desktop-app research-preview** (macOS/Windows; ikke web/mobil) — autonom agent i sandboxed VM, læser MCP fra `claude_desktop_config.json`. To-vejs-kanal via **MCP-plugins** (Telegram/Discord, eller `cowork-terminal-mcp`): send kommandoer TIL / få svar FRA agenten uden for terminalen.
- **Testet i vores setup:** `/mnt/c` + Mathias' Windows-bruger reachable, men **ingen `cowork`-binær** og ingen CLI-flade → **kan ikke drives fra min flade**; lever på Mathias' Windows-desktop. ⚑
- **Metode den muliggør:** to-vejs aktør↔aktør- eller aktør↔Mathias-kanal (gate-pakker ud, gate-ord ind) uden GitHub-issue-ceremoni.
- **Alternativer (familie G + kilde 0):** delt filsystem (rå, virker nu) · GitHub-issue/PR-write-flade · Telegram/Discord-MCP · `--brief`/SendUserMessage (agent↔bruger) · Agent Teams-beskeder · delt task-liste.

---

# KILDE 4 — Docs/kode som inspiration (ikke fundament; reciterer ikke Codex' udstyr)

Mekanismer det nuværende byg viser — hver mappet til en native kilde-1-ækvivalent jeg testede:

- **Deklarativ regelbog (`kaede-regler.json`)** — transport-regler som data. → hooks/permissions + Memory (familie A/H). ✓ valideret af felt-cluster 1 (JSON-drevne frameworks).
- **Selvtjek før frys (`selvtjek-docs.mjs`: ordret-diff/tal/konsistens)** → hooks (familie A) + CI.
- **Mekanisk governance-vagt (`governance-check.mjs`: owns-register, døde links)** → hooks/CI (familie A).
- **Kurér + systemd-user-unit hosting (`dirigent.mjs`, `stork-kaede.service`)** — transport, aldrig dømmekraft → agent-view/cron/headless (familie D).
- **Codex-adapter (`codex-review.sh`/`adapters/codex.sh`)** — transport-flade til en uafhængig reviewer findes; **Codex' eget udstyr er Codex' bord, reciteres ikke.**
- _Form-fund:_ alt dette er inspiration på niveau med nettet; det er IKKE udgangspunktet, og rollefordelingen bygges ikke videre på.

---

# Adgangs-/rolle-forslag (kandidater til planen — IKKE valg, ikke nuværende-tilstand)

Form: "ville forbedre X · kræver afklaring af adgang Y". Feasibility/org-friktion/audit-spor er Mathias-/plan-beslutninger.

1. **Claude.ai → kode/DB-læseadgang (read-only).** Ville forbedre forretnings-recon ("krav 100% dækkende") + krav-troskab grundet i faktisk kode. _Kræver afklaring:_ connector/MCP-read på Claude.ai's flade + forening med business-sprog-rollen. _Modsvar-alternativ:_ Code/Codex leverer kode-recon-resuméer.
2. **Claude.ai → GitHub-skriveadgang (PR-/issue-kommentar).** Ville forbedre direkte review-/gate-pakke-postering (web: coordinator poster ÉT review) og skære transport-hop. _Kræver afklaring:_ connector-write + author-/integritets-model.
3. **Codex → repo-skriveadgang.** Ville forbedre direkte fix-applicering frem for FLAG→LØS-runder. _Kræver afklaring:_ om Codex-uafhængighed bevidst skal opgives; **adgangs-kandidaten surfaces, Codex' eget udstyr er Codex' bord.**
4. **Code → admin-scoped token / stående protection-adgang.** Ville forbedre at workflowet selv kan justere branch-protection. _Faktum testet:_ bot-konto har `admin:true`, men token 403'er på protection-API; **rolle vs. token-model + ønsket audit-spor er en Mathias-/plan-beslutning.** _Modsvar-alternativ:_ mandat-model (admin kun på eksplicit Mathias-ord).
5. **Mathias → to-vejs mobil-/desktop-kanal (Cowork/Telegram-MCP).** Ville forbedre "Mathias ude af det mekaniske" — gate-pakker ud, gate-ord ind, uden GitHub-ceremoni. _Kræver afklaring:_ at kanalen kan bære author-verifikation (gaterne er ordene, ikke kanalen).
6. **Delt to-vejs aktør-kanal / delt task-liste (Agent Teams-stil eller MCP-backet).** Ville forbedre "lade aktørerne løfte hinandens arbejde" direkte frem for ét-vejs relay. _Kræver afklaring:_ Agent Teams' eksperimentelle modenhed (ingen resume) vs. MCP-backet delt tilstand. NB: det rå delte filsystem (kilde 0) findes allerede, men uden postkasse/signalering/author-verifikation.

---

# Det jeg ikke ved endnu — og flade-begrænset vs. reel begrænsning

**Flade-begrænset** (kapaciteten findes; jeg kan bare ikke teste den fra MIN flade):

- **`/goal`** — interaktiv REPL (menneske-tastet/session-start); ikke i værktøjs-/headless-flade.
- **Computer use / `--chrome`, Cowork** — Mathias' Windows-desktop.
- **Cloud-Routines, ultrareview** — Anthropic-cloud + (Routines) GitHub-app.
- **MCP ud over Supabase** (M365/Atlassian/…) — interaktiv auth på aktørens flade.
- **`--from-pr`** — kræver en PR-koblet session at genoptage.
- **Claude.ai's / Codex' egne adgange & udstyr** — deres flader/filer (Codex reciteres aldrig her).

**Reel begrænsning** (genuin egenskab ved kapaciteten selv):

- **`/goal`-evaluatoren kan ikke kalde værktøjer** — kan kun dømme transcript.
- **Agent Teams har ingen resume** + er eksperimentel (env-gated).
- ⚠ **AI-genereret `CLAUDE.md`/`AGENTS.md` kan sænke succes (~3%)** — menneske-skrevet kontekst er det der hjælper.
- **Delt filsystem (kilde 0) har ingen author-verifikation/signalering** — egnet til transport/fakta, ikke til gate.

**Ægte recon-unknowns (kan bevises med mere test):**

- **Hook-events ud over PreToolUse** — kun PreToolUse bevist; feltet bruger netop disse til gate-mekanik nr. 2.
- **Auto-mode-dømmekraft i en faktisk uovervåget kørsel** — kun config inspiceret.
- **Reel uafhængighed mellem alternativ-bærere pr. metode-familie** (selve to-modsvar-vurderingen) — plan-fase-vurdering.
- **Cowork-kanalens author-verifikations-kapacitet** vs. GitHub-issue-fladen.
