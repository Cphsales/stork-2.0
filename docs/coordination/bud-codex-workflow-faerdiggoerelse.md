# workflow-faerdiggoerelse - Codex' endelige bud

**Status:** Endeligt konkurrerende bud fra Codex.
**Dato:** 2026-06-16.
**Kontrakt:** `docs/coordination/workflow-faerdiggoerelse-krav-og-data.md`.
**Grundlag:** begge recon-filer, otte feltkilder, begge v2.1-bud og den afsluttende modspilsrunde.

## Hovedbud

Stork 2.0 skal have en **krav-ID-båret workflow-kernel med lean grundform og hærdede overgange dér hvor kæden faktisk knækker**.

Det endelige valg på aksen er derfor ikke "mest muligt schema" og ikke "én løs worklog". Kernen skal være smal nok til at køre build efter build uden vedligeholdelsesgæld, men hård dér hvor brud allerede er observeret eller feltet gentager samme fejlklasse:

1. **Krav-ID er hovedtråden.** Krav-ID -> planpunkt -> test -> PR -> review -> slut-evidens er den primære læsevej.
2. **GitHub og package-ledger er sandheden.** Worklog og slutrapport er projektioner, ikke manuelt primær-sandhed.
3. **Scale reducerer kontrakt-tæthed, ikke sikkerhedsgulvet.** Small non-sensitive får let form; sensitive eller opskalerede pakker får fuld form.
4. **Overgange hærdes med få kontrakter:** rule-snapshot, actor-start, plan-SHA, review-pakke og review-disposition.
5. **Schemafladen holdes lille.** Der er én package-ledger-schema og én rule-projection-schema. Review-dispositioner ligger i ledger-schemaet.
6. **Dømmekraft automatiseres aldrig.** Transport, checks, routing og drift-gates automatiseres; krav, mening, risiko og accept bliver hos aktørerne.

Den endelige kæde:

**pakkeåbning -> foreløbig scale + rule-snapshot -> recon med scale-signal -> kravspec med krav-ID og hash -> plan med krav-ID-dækning, scale-lock og plan-SHA -> fire aktør-godkendelser på samme SHA -> batch-build med scale-passende review-pakke, cross-review og dispositioner -> slutrapport genereret fra ledger/worklog -> fire slut-godkendelser -> ren lukning.**

## Felt-syntese - otte kilder

Feltet er ikke brugt som løse tips. Det er brugt til at finde de mønstre der gentages på tværs:

- [Towards Data Science: How to Combine Claude Code and Codex for Maximum Coding Power](https://towardsdatascience.com/how-to-combining-claude-code-and-codex-for-max-coding-power/) - committet PR + anden model som reviewer + fix/re-review er den praktiske kombinationsgevinst.
- [DEV: Same Framework, Different Engine](https://dev.to/shinpr/same-framework-different-engine-porting-ai-coding-workflows-from-claude-code-to-codex-cli-n3p) - workflow skal bæres af roller, artefakter, scale-routing og stop-punkter, ikke en bestemt terminalflade.
- [GenAI Unplugged: Claude Code vs Codex - Build a Bridge Instead](https://genaiunplugged.substack.com/p/claude-code-vs-codex-comparison) - samme regler til begge agenter, filbaseret handoff, worktrees og hooks ved garanti-behov.
- [Verdent: Codex CLI vs Claude Code for Terminal Agent Workflows](https://www.verdent.ai/guides/codex-cli-vs-claude-code-terminal-agent-workflows) - vurder workflowform, budgets, review og session-grænser; ikke model-vinder som dogme.
- [GenAI Unplugged: OpenAI Codex Setup Guide](https://genaiunplugged.substack.com/p/openai-codex-setup-guide-beginner) - handoff-fil, permission-mode og long-running loops er nyttige, men kræver sikkerhedssnit.
- [arXiv: tap - A File-Based Protocol for Heterogeneous LLM Agent Collaboration](https://arxiv.org/abs/2606.14445) - heterogene agenter fungerer bedst via filbaserede artefakter, worktree-isolation og artifact-protokoller.
- [GitHub: shinpr/codex-workflows](https://github.com/shinpr/codex-workflows) - scale-routing, PRD/design/task/commit-kæde, TDD, quality gates og fresh-context review.
- [GitHub: shinpr/claude-code-workflows](https://github.com/shinpr/claude-code-workflows) - samme workflowform på anden terminalflade: small/medium/large routing, design-sync, verification og context separation.

**Enighed der bærer buddet:** fil-/PR-artefakter over chat-hukommelse, worktrees ved parallelitet, fælles regler, fresh-context review, scale-routing, cross-review på committet PR og mekanisk håndhævelse dér hvor mennesker ellers glemmer.

**Modsigelse der styrer buddet:** feltet viser både værdi i stærke artefaktkontrakter og risiko for procesoverhead. Derfor har buddet et ufravigeligt sikkerhedsgulv, men scale afgør hvor tungt artefakterne materialiseres.

## 1. Struktur

### Step 0 - Åbning, snapshot og foreløbig scale

**Funktioner**

- Mathias åbner en pakke på author-verificerbar kanal.
- Workflow-kernen opretter pakke-id, aktør-workspaces, `package-ledger.json` og en genereret `worklog.md`.
- Kernen tager `rule-snapshot.json` af workflow-regler og schema-versioner.
- Kernen laver `scale-provisional`: `DIRECT`, `WORKFLOW`, `DELEGATED` eller `CRITICAL`.
- Kernen vælger kontrakt-tæthed efter scale:

| Scale       | Typisk scope                                   | Kontrakt-tæthed                                                     | Ufravigeligt gulv                                        |
| ----------- | ---------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------- |
| `DIRECT`    | 1-2 filer, non-sensitive                       | Pakke-preflight, genereret PR-template, disposition kun ved fund    | krav-hash, plan-SHA, mindst én uafhængig review, slut OK |
| `WORKFLOW`  | 3-5 filer eller tværgående doc/kode            | Actor-start pr. hovedled, review-pakke pr. PR, disposition ved fund | samme gulv                                               |
| `DELEGATED` | 6+ filer, flere batches eller uklar arkitektur | Fuld actor-start, fuld review-pakke, konkurrerende opsætninger      | samme gulv                                               |
| `CRITICAL`  | løn, penge, schema, RLS, auth, dataadgang      | Fuld kontrakt uanset filantal, ekstra review-cadence                | samme gulv                                               |

**Formål**

Åbningen skal forhindre delt working-tree, stale regler og forkert procesdybde. Den må ikke gøre en lille pakke tungere end nødvendigt.

**Output**

Pakke-id, rule-snapshot, schema-version, `scale-provisional`, package-ledger, generated worklog, aktør-workspaces og "klar til recon".

### Step 1 - Parallel recon med scale-signal

**Funktioner**

- Code-recon: repo/kode/teknisk realitet.
- Codex-recon: uafhængig teknisk/verifikations-recon og feltmønstre.
- Claude.ai-recon: forretningssprog, vision, Mathias-intentioner og dækningsspørgsmål.
- Hver recon leverer `scale-signal`: behold, op- eller nedskalér.
- Recon-filer committes og læses derefter fra blob/origin-ref.
- Recon-syntese er kun fund + åbne spørgsmål, ikke løsning.

**Formål**

Kravet skal være dækkende før plan. En pakke der så lille ud ved åbning, kan opskaleres før planen låses.

**Output**

Tre recon-filer, syntese, åbne spørgsmål, scale-signal og eventuelle Mathias-gates.

### Step 2 - Kravspec med krav-ID og hash

**Funktioner**

- Claude.ai almindelig rolle skriver kravspec fra Mathias' ord.
- Hvert krav får stabilt `K-<nr>` med acceptkriterie og kilde.
- Code og Codex må flage dækningshuller og urealiserbarhed, men må ikke skrive løsningen ind i kravet.
- Mathias godkender med `krav OK <hash>`.
- Krav-hash skal matche den fil der bliver merged.

**Formål**

Krav-ID er tråden gennem hele workflowet. Intet bygges uden krav bag sig.

**Output**

`krav.md` med krav-ID'er, acceptkriterier og hash-bevis.

### Step 3 - Plan med scale-lock, plan-SHA og modspil

**Funktioner**

- Planen låser scale som `scale-lock`; mismatch mellem `scale-provisional` og recon `scale-signal` skal forklares og re-routes før plan-lock.
- Planen mapper hvert krav-ID til planpunkt, testform, ejer, review-form og slut-evidens.
- Afgørende valg får to modsvar. I `DIRECT` kan modsvar være korte og test-/kontraktbårne; i `DELEGATED` og `CRITICAL` kræves fuld matrix.
- Planen fryses som `plan-SHA`.
- Alle fire plan-godkendelser skal pege på samme aktuelle plan-SHA. Nyt plan-commit invaliderer tidligere godkendelser.

**Formål**

Planen skal være stærk nok til at bygge efter, men ikke så tung at små pakker dør i proces.

**Output**

Plan-SHA, scale-lock, krav-ID-dækningsmatrix, modsvarsmatrix, test-/review-form og build-start-kriterier.

### Step 4 - Fire aktør-godkendelser før build

**Funktioner**

- Mathias godkender planens hvad-retning på plan-SHA; hvis der ingen nye what-valg er, præsenteres kun en kort gatepakke.
- Claude.ai giver krav-/menings-PASS på plan-SHA.
- Code giver build-ready på plan-SHA.
- Codex giver teknisk APPROVAL/FEEDBACK på plan-SHA.
- Build-start kræver alle fire relevante godkendelser på samme SHA og ingen åbne Mathias-gates.

**Formål**

Planen kan ikke glide fra plausibel til bygget uden fuld rolle-validering.

**Output**

Build-start eller FEEDBACK-runde.

### Step 5 - Batch-build med scale-passende review

**Funktioner**

- Builder arbejder i egen branch/worktree.
- Hver batch fryses som commit/PR.
- Review kører i frisk kontekst på committet PR.
- Review-pakke er scale-passende:
  - `DIRECT`: genereret PR-template med krav-ID, plan-SHA, test-output og diff.
  - `WORKFLOW`: separat review-pakke med plan-slice, krav-ID'er, test-output, evidence-delta og budgetstatus.
  - `DELEGATED`/`CRITICAL`: fuld review-pakke pr. batch plus ekstra review-cadence.
- Review-fund får disposition:
  - `BLOCKER`: skal rettes før batch kan lukke.
  - `FIX-NOW`: rettes i samme loop.
  - `FOLLOW-UP`: reelt, ikke-blokerende, får sporet issue/gæld med krav-ID og evidens.
  - `FALSE-POSITIVE-WITH-EVIDENCE`: lukkes kun med test/source/kontraktbelæg.
  - `MATHIAS-GATE`: hvad, risiko, scope eller workaround.
- Loopet er bounded af scale. Samme fejlklasse to gange eller budget udløbet stopper og får ejer.

**Formål**

Cross-review skal fange reelle fejl uden at blive uendelig churn eller stille ignorering.

**Output**

Batch-commits/PR'er, review-resultater, dispositioner ved fund, fix-commits og evidence-opdatering.

### Step 6 - Slutrapport og luk

**Funktioner**

- `worklog.md` genereres fra package-ledger + git/GitHub-state og drift-checkes.
- Slutrapport genereres som læsbar projektion af krav-ID-dækning, plan-afvigelser, tests, reviews, åbne follow-ups og gates.
- Codex reviewer teknisk sandhed og krav-ID-dækning.
- Claude.ai reviewer krav/vision/forretning og rapportens mening.
- Mathias giver slut OK.
- Slut-merge kræver fire slut-godkendelser.

**Formål**

Intet lukkes uden fuld validering, og færdige pakker kræver ikke ny manuel dokumentation oven på GitHub-sporet.

**Output**

Slutrapport, lukket package-ledger, merged PR'er og rent repo.

### Step 7 - Renhed og arkivering

**Funktioner**

- Pakke-artefakter lukkes, arkiveres eller slettes efter formål.
- Idéer flyttes til idé-hjem og må modsige workflow-sandheden.
- Workflow-regler ændres kun via egen rule-change gate.
- Slutrapport og GitHub er historikken.

**Formål**

Repoet skal ikke blive et arkiv af gamle sandheder.

## 2. Kobling

Kæden har ni bærende bindinger:

1. **Krav-ID-binding:** `K-*` er primær tråd fra krav til slut.
2. **Package-binding:** alle artefakter har pakke-id og branch/PR-reference.
3. **Scale-livscyklus-binding:** `scale-provisional -> scale-signal -> scale-lock`.
4. **Rule-snapshot-binding:** pakken kører på sit rule-snapshot; midt-pakke regelændring kræver gate.
5. **Plan-SHA-binding:** fire plan-godkendelser skal pege på samme aktuelle plan-SHA.
6. **Blob/PR-binding:** aktører læser committede blobs og PR'er, ikke mutable working tree.
7. **Actor-start-binding:** fuld pr. hovedled i `WORKFLOW+`; let pakke-preflight i `DIRECT`.
8. **Review-binding:** review kræver scale-passende materiale og disposition ved fund.
9. **Ledger/worklog-binding:** package-ledger + GitHub er sandhed; worklog er genereret projektion med drift-gate.

Ingen del kan alene bære workflowet:

- Worklog uden ledger/GitHub er prosa.
- Ledger uden krav-ID er bogføring uden mening.
- Scale uden recon-signal kan under-scope.
- Review uden PR/SHA kan arve session-bias.
- Fund uden disposition bliver enten tavst ignoreret eller uendelig churn.
- Slutrapport uden fire godkendelser lukker ikke pakken.

## 3. Automatisering

### Automatiseres

- Pakkeoprettelse, worktree/branch-oprettelse og package-ledger-initialisering.
- Scale-provisional og scale-signal-sammenligning.
- Rule-snapshot, schema-version-check og rule-projection-check.
- Package-ledger mekaniske felter: krav-ID, SHA'er, PR'er, testnavne, review-refs, gates og dispositionsstatus.
- Generering af `worklog.md` fra ledger + GitHub.
- Drift-gate: worklogens mekaniske påstande re-deriveres og skal matche.
- Krav-ID coverage-gate: krav uden plan/test/evidens blokerer.
- Plan-SHA-gate: stale eller mismatchende approvals blokerer.
- Review-request og re-request efter fix.
- Review-pakke-format efter scale.
- Disposition-check: blocker/fix-now åbne blokerer; follow-up kræver tracking; false-positive kræver evidens.
- Budget/loop-counters.
- Stop ved ukendt event, stale SHA, schema mismatch, drift, divergens eller halvskrevet leverance.

### Automatiseres aldrig

- Mathias' krav, slut OK og forretningsafgørelser.
- Claude.ai's krav-/meningsdom.
- Codex' tekniske review-dom.
- Codes tekniske valg inden for godkendt krav.
- At acceptere risiko, scope-skift, workaround eller overrule et review-fund uden belæg.

### Fejl-fangst ved hvert led

- **Åbning:** author, pakke-id, rule-snapshot, schema-version og scale-provisional kræves.
- **Recon:** alle krævede recon-kilder kræves; scale-signal uden belæg ændrer ikke scale.
- **Krav:** hash mismatch blokerer.
- **Plan:** umappet krav-ID, manglende scale-lock, manglende modsvar eller manglende plan-SHA blokerer.
- **Godkendelse:** godkendelse på forkert/stale plan-SHA blokerer.
- **Build:** PR, tests og scale-passende review-materiale kræves.
- **Review:** udisponerede fund blokerer batch-luk.
- **Worklog:** drift mellem genereret worklog og ledger/GitHub blokerer.
- **Schema/rules:** kørende pakke fortsætter på snapshot; migration kræver rule-change gate.
- **Slut:** manglende Code/Codex/Claude.ai/Mathias-godkendelse blokerer luk.

## 4. Kontrolposter

### Mathias kaldes ind

- Pakkeåbning.
- Krav-validering: `krav OK <hash>`.
- Planens hvad-gate, når planvalg ændrer formål, scope, risiko eller prioritet.
- Review-disposition `MATHIAS-GATE`.
- Rule-change gate, hvis workflow-regelændring ændrer hans beslutningsflade.
- Slut OK.

### Mathias holdes ude af

- Branch/worktree, transport, PR-relæ og statusbogføring.
- Genkørsel efter mekaniske fejl.
- Review-retry efter tekniske fix.
- Klassifikation af tekniske fund som `FIX-NOW`, `FOLLOW-UP` eller `FALSE-POSITIVE-WITH-EVIDENCE`.
- Schema-/worklog-drift-checks.
- Hvordan-spørgsmål.

### Fire-aktør-godkendelser

- **Krav:** Mathias krav OK; Claude.ai kravtekst/mening; Code byggelighedsfakta; Codex teknisk realiserbarhedsfakta.
- **Plan:** Code build-ready; Codex teknisk APPROVAL; Claude.ai krav-/menings-PASS; Mathias hvad-gate når påkrævet. Alle på samme plan-SHA.
- **Build-batch:** builder PR; uafhængig teknisk review; fix/disposition-loop til grøn eller ejer-gate.
- **Slut:** Code leverance-erklæring; Codex slut-review; Claude.ai slut-review; Mathias slut OK.

## 5. Rolle-opsætning

### Claude.ai

- **Workflow-rolle:** forretnings-recon, kravspec-forfatter, krav-/meningsdommer, Mathias-gate-oversætter, slutrapport-reviewer.
- **Almindelig rolle:** krav-dialog med Mathias og strategisk sparring i forretningssprog.

### Code

- **Workflow-rolle:** builder, teknisk planforfatter, repo-/kode-recon, transport-/state-ejer, slutrapportforfatter.
- **Almindelig rolle:** implementering, tests, migrations, UI/API og teknisk kvalitet.

### Codex

- **Workflow-rolle:** uafhængig read-only reviewer på committede PR'er, adversarial modspil, teknisk realiserbarhedsdom, docs-/workflow-sandhedstjek.
- **Almindelig rolle:** kode-reviewer, bug-/risk-finder og verifikator.

### Mathias

- **Beslutningsflade:** hvad, krav, forretning, risikoaccept, slut OK.
- **Modtageflade:** genereret worklog, gate-pakker, korte spørgsmål og alerts.

Modtagefladen må aldrig blive mekanisk relæ.

## 6. Dokument-opsætning

### Grundregel

- **Sandhed:** kravspec, plan-SHA, package-ledger, GitHub PR'er, rule-snapshot.
- **Projektion:** `worklog.md`, `status.json`, slutrapport.
- **Workflow-regel:** `docs/workflow/*`.
- **Adapter-projektion:** `CLAUDE.md` og `AGENTS.md`, genereret fra samme workflow-regler.
- **Idé:** må modsige, må aldrig styre.

### Schema-ejerskab og versionering

- Code ejer eksekverbar schema-/transport-implementering.
- Codex reviewer schema-sandhed, drift og fail-closed-adfærd.
- Claude.ai og Mathias inddrages kun hvis schemaændring ændrer mening, gates eller beslutningsflade.
- `package-ledger.schema.json` versioneres med `schemaVersion`.
- Hver pakke pin'er `schemaVersion` og `ruleSnapshotId`.
- Kørende pakker fortsætter på deres snapshot som default.
- Schema-/regelændring midt i pakke kræver rule-change gate og migrationsplan.
- Mekaniske worklog-felter må ikke håndredigeres; de genereres fra ledger + GitHub og drift-checkes.

### Foreslået mappestruktur

```text
repo-root/
  CLAUDE.md              # genereret adapter-projektion
  AGENTS.md              # genereret adapter-projektion, samme checksum
  docs/
    strategi/
      vision-og-principper.md
      forretningsforstaaelse.md
      stork-2-0-master-plan.md
    workflow/
      workflow.md
      roller.md
      gates.md
      scale-og-budgetter.md
      artefakt-kontrakt.md
      package-ledger.schema.json
      rule-projection.schema.json
      adapters/
        claude-ai.md
        code.md
        codex.md
        mathias.md
    packages/
      <pakke>/
        krav.md
        plan.md
        rule-snapshot.json
        package-ledger.json
        worklog.md        # genereret projektion
        status.json       # genereret projektion
        recon/
          code.md
          codex.md
          claude-ai.md
        reviews/
        slutrapport.md
    ideas/
      workflow/
        <emne>.md
    history/
      reports/
        <dato>-<pakke>.md
```

### Slette-/flytteplan

- Gamle pakke-planer, recon og rapporter flyttes til package-history eller slettes, hvis slutrapport/GitHub dækker.
- `aktiv-plan.md` og `seneste-rapport.md` erstattes af genereret current pointer.
- Løse `CHANGES.log`/`handoff.md` migreres til generated worklog eller slettes.
- Håndskrevne `CLAUDE.md`/`AGENTS.md` med egne regler erstattes af genererede projektioner.
- Idé-docs flyttes til `docs/ideas/workflow/`.

## 7. Fravalg

- **Delt working tree som leverancehjem:** observeret skadeligt; commits/PR'er er eneste stabile leverancehjem.
- **Manuel worklog som sandhed:** kan blive stale. Worklog er genereret projektion med drift-gate.
- **Multi-schema-sprawl:** review-dispositioner og actor-start skal ikke have egne schemaer. De bor i package-ledger/artefakt-kontrakt.
- **Fuld kontrakt på alle Small-pakker:** beskytter ikke helheden hvis overhead bliver nyt svagt led. `DIRECT` bruger let form, men gulvet består.
- **Scale der dropper gates:** scale må ikke fjerne krav-hash, plan-SHA, uafhængig review eller slut OK.
- **Permanent "bedste bud vinder":** konkurrence bruges på afgørende valg, ikke som sport i alle led.
- **Review-fund som automatisk blocker:** giver churn. Fund skal disponeres.
- **Unbounded Full Access/Goals:** kan bære transport efter plan-gate, aldrig dømmekraft.
- **Cloud-first rygrad:** kan supplere audits, men lokal repo/GitHub-state bærer workflowet.
- **Én super-agent:** bryder kravet om modspil og fire aktører.
- **Doc-lint som meningsdommer:** docs-tests må fange brud, ikke afgøre forretningsmening.
- **Realtidsnotifikation som gate:** nyttig transport, men ikke author-/SHA-/krav-bevis.

## 8. Idé-liste dækket

Status lukker krav-dokkets idé-liste. "Brugt" betyder del af workflowet. "Dækket" betyder metoden løses af en anden bærer.

### Claude Code-egenskaber

| Kandidat                           | Status   | Belæg                                                                            |
| ---------------------------------- | -------- | -------------------------------------------------------------------------------- |
| Hooks                              | DÆKKET   | Drift-gates, coverage-gates, worklog-drift og rule-projection checks i §3 og §6. |
| `/goal`                            | FRAVALGT | Long-running loops bærer transport, ikke gates eller dømmekraft, jf. §7.         |
| `.claude/rules/`                   | DÆKKET   | `docs/workflow/*` genererer `CLAUDE.md`/`AGENTS.md`, jf. §6.                     |
| Skills                             | DÆKKET   | Rolle-/adapter-docs og workflow-regler, jf. §5-§6.                               |
| Codex-plugin                       | FRAVALGT | Gate skal være uafhængig PR-/artifact-review, ikke in-session blanding.          |
| `/loop`                            | DÆKKET   | Bounded cross-review-loop, jf. Step 5 og §3.                                     |
| Statusline                         | DÆKKET   | Generated worklog/status, jf. §6.                                                |
| Checkpointing (`/rewind`)          | DÆKKET   | Git commits/PR/worktrees, jf. §2.                                                |
| `--from-pr`                        | DÆKKET   | PR-binding og fresh-context review, jf. §2 og Step 5.                            |
| `/doctor` + `/context` + `/memory` | DÆKKET   | Preflight, rule-snapshot, worklog og package-ledger, jf. Step 0 og §6.           |
| Sandboxing                         | DÆKKET   | Worktrees, permission-snit og fail-closed checks, jf. Step 0 og §3.              |
| Headless                           | DÆKKET   | Event-dispatch og workflow-roller, jf. §3-§5.                                    |
| Agent SDK                          | FRAVALGT | Workflow-kontrakten må ikke afhænge af én SDK.                                   |
| Agent view                         | DÆKKET   | Worklog/status/ledger som observerbarhed, jf. §6.                                |
| Agent teams                        | FRAVALGT | Peer-runtime giver ikke i sig selv PR/SHA/gate-bevis.                            |
| Workflows                          | DÆKKET   | Hele §1-§6 er workflow-kernen.                                                   |
| ultrareview                        | FRAVALGT | Kan supplere, men erstatter ikke fire aktører og krav-ID-review.                 |
| Routines                           | DÆKKET   | Gentagelige gates/checks i §3 og §6.                                             |
| Worktrees                          | BRUGT    | Egen branch/worktree pr. aktør, jf. Step 0 og §2.                                |
| Auto mode                          | FRAVALGT | Opaque klassifikation bærer ikke governance; scale er deklareret.                |
| Computer use                       | FRAVALGT | Desktop-kontrol giver ikke stabilt author-/SHA-bevis.                            |

### Codex-opsætning

| Kandidat                 | Status | Belæg                                                    |
| ------------------------ | ------ | -------------------------------------------------------- |
| model + reasoning_effort | DÆKKET | Scale-/budgetprofil i §1 og §3.                          |
| approval_policy          | DÆKKET | Transport vs. dømmekraft og permission-snit i §3 og §7.  |
| sandbox_mode             | DÆKKET | Worktree/permission/fail-closed i Step 0 og §3.          |
| network_access           | DÆKKET | GitHub/blob transport som verificerbart spor, jf. §2-§3. |
| github-plugin            | DÆKKET | GitHub som PR/blob/evidens-spor, uanset konkret flade.   |
| trust_level pr. projekt  | DÆKKET | Rule-snapshot, workspaces, actor-start og gates.         |

## 9. Modsvar og testede knudepunkter

### Hvad er testet, og hvad er ikke e2e-bevist

`pnpm kaede:selftest` tester eksisterende transport-/fail-closed-primitiver. Det er nyttigt belæg for hash/SHA, author, stale-spor, stop og dispatch, men det er ikke et e2e-bevis for dette endelige workflow.

De finale knudepunkter nedenfor er eksekverede terminalprober. De er kontraktprober, ikke fuld e2e.

```text
schema-running-package schema-v1@rulesnap-a OK
schema-change-without-gate BLOKERET:rule-change-gate
schema-change-with-gate MIGRATION-PLAN-KRAEVET
worklog-generated OK:derived-from-ledger
worklog-drift BLOKERET:worklog-drift
direct-small DIRECT->DIRECT actor-start:package-preflight review-package:generated-pr-template dispositions:on-findings-only
direct-sensitive DIRECT+SAFETY-FLOOR->DIRECT+SAFETY-FLOOR cross-review:required
recon-upscope DIRECT->DELEGATED plan-lock:DELEGATED
plan-approval-same-sha BUILD-OK
plan-approval-stale BLOKERET:plan-sha-mismatch
review-follow-up DISPOSITION-OK:FOLLOW-UP:not-blocking
review-false-positive-no-evidence BLOKERET:false-positive-evidence
```

`pnpm kaede:selftest` er også kørt på samme branch:

```text
Kæde-selftest: alle cases passed
```

### Opsætning A - Krav-ID spine

**Valg:** Krav-ID er primær tråd.

**Modsvar mod bred ledger uden primær tråd:** for meget kan bindes uden at vise krav-dækning.

**Modsvar mod prosa-spec:** udeladelser bliver svære at fange.

**Knudepunkt:** krav-ID coverage-gate blokerer umappede krav i plan.

### Opsætning B - Generated worklog + ledger som sandhed

**Valg:** Worklog er menneskelig flade; package-ledger + GitHub er sandhed.

**Modsvar mod manuel worklog som sandhed:** stale worklog bliver ny driftgæld.

**Modsvar mod fuld multi-schema-register:** flere schemaer bliver selv nye vedligeholdelsesled.

**Terminalprobe:**

```text
worklog-generated OK:derived-from-ledger
worklog-drift BLOKERET:worklog-drift
```

### Opsætning C - Scale-livscyklus

**Valg:** `scale-provisional -> scale-signal -> scale-lock`.

**Modsvar mod one-shot scale:** recon kan vise større scope end åbningen.

**Modsvar mod fast tungvægt:** små ufarlige pakker brænder verifikationsressource.

**Terminalprobe:**

```text
direct-small DIRECT->DIRECT actor-start:package-preflight review-package:generated-pr-template dispositions:on-findings-only
recon-upscope DIRECT->DELEGATED plan-lock:DELEGATED
```

### Opsætning D - Plan-SHA-binding

**Valg:** Alle fire plan-godkendelser peger på samme aktuelle plan-SHA.

**Modsvar mod "godkendt i chat":** kan være stale eller bundet til forkert version.

**Modsvar mod PR-klik alene:** klik beviser ikke hvilken planversion aktøren vurderede.

**Terminalprobe:**

```text
plan-approval-same-sha BUILD-OK
plan-approval-stale BLOKERET:plan-sha-mismatch
```

### Opsætning E - Cross-review med disposition

**Valg:** Review-fund lukkes som blocker, fix-now, follow-up, false-positive-with-evidence eller Mathias-gate.

**Modsvar mod automatisk blocker:** giver churn på nits/follow-ups.

**Modsvar mod tavs ignorering:** reelle fund forsvinder uden spor.

**Terminalprobe:**

```text
review-follow-up DISPOSITION-OK:FOLLOW-UP:not-blocking
review-false-positive-no-evidence BLOKERET:false-positive-evidence
```

### Opsætning F - Schema-snapshot og migration

**Valg:** Pakker pin'er schemaVersion og ruleSnapshotId; migration kræver gate.

**Modsvar mod flydende schema:** kørende pakker skifter regler under fødderne på aktørerne.

**Modsvar mod frosne schemaer for evigt:** workflowet kan ikke udvikle sig.

**Terminalprobe:**

```text
schema-running-package schema-v1@rulesnap-a OK
schema-change-without-gate BLOKERET:rule-change-gate
schema-change-with-gate MIGRATION-PLAN-KRAEVET
```

## 10. Endelig ændrings-log v2.1 -> final

- Krav-ID blev gjort til primær spine, så package-ledger ikke bliver bred bogføring uden krav-dækning.
- Worklog blev ændret fra artefakt i kæden til genereret projektion med drift-gate.
- Schemafladen blev reduceret til `package-ledger.schema.json` + `rule-projection.schema.json`; review-dispositioner flyttede ind i ledger-schemaet.
- Schema-ejerskab, versionering, snapshot og migration blev specificeret.
- Scale blev gjort til reel kontrakt-tætheds-routing: `DIRECT` får let form, mens sensitive/opscope får fuld form.
- Scale-livscyklus blev fastholdt og skærpet: `scale-provisional -> scale-signal -> scale-lock`.
- Plan-SHA-binding blev gjort til eksplicit build-start-kontrakt for alle fire plan-godkendelser.
- Review-dispositioner blev bevaret, men gjort lean: dispositioner oprettes kun ved fund; `FOLLOW-UP` og `FALSE-POSITIVE-WITH-EVIDENCE` lukker hullet mellem churn og tavs ignorering.
- Testgrundlaget blev adskilt: `pnpm kaede:selftest` er primitive-belæg, finale terminalprober er kontraktprober, ikke påstået e2e.
