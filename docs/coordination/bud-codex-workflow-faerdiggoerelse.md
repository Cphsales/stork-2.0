# workflow-faerdiggoerelse — Codex' bud

**Status:** Codex' konkurrerende bud, ikke konsensus.
**Dato:** 2026-06-15.
**Kontrakt:** `docs/coordination/workflow-faerdiggoerelse-krav-og-data.md`.
**Grundlag læst:** Code-recon fra `origin/claude/recon-code-workflow-faerdiggoerelse` + Codex-recon fra `origin/codex-recon-workflow-faerdiggoerelse` + kontrakten fra `origin/main`.

## Hovedbud

Mit bud er et **bevisstyret arbejdsflow med kontrolleret modspil**.

Workflowet skal ikke være "den nuværende kæde plus lidt mere". Det skal være den rigtige arbejdsform for resten af Stork 2.0: en **workflow-kerne** der bygger en pakke fra krav til luk med samme disciplin hver gang, uanset hvilke konkrete agentværktøjer der er bedst om tre måneder.

Den nuværende kæde er derfor kun en prototype-bank. Den har bevist nyttige knudepunkter, men den er ikke rammen. Rammen er kravet:

1. Alt væsentligt starter som krav fra Mathias.
2. Alle afgørende valg møder modspil før de bliver plan.
3. Alle aktørbidrag bliver frosset i GitHub, ikke i mutable working-tree-filer.
4. Transport automatiseres hårdt.
5. Dømmekraft automatiseres aldrig, men den gøres obligatorisk, SHA-/hash-bundet og synlig.
6. Konkurrence bruges kun der, hvor den løfter beslutningskvalitet; ikke som sport, ikke som pynt, ikke som permanent kamp om alt.

Det stærkeste workflow er derfor:

**åbning + scale-determination → regel-/handoff-synk → parallel recon → krav-hash → konkurrerende modsvar på afgørende valg → plan-SHA → fire aktør-godkendelser → batch-build med cross-review-loop på committede PR'er → slutrapport med fire aktør-godkendelser → ren pakke-luk.**

Min store satsning: workflowet skal have et **evidens-register** som første-klasses objekt. Ikke et dokument der fortæller hvad der skete, men en pakke-ledger der løbende binder krav-sætninger, plan-valg, modsvar, commits, tests, reviews og gates sammen. Slutrapporten bliver en læsbar projektion af registeret, ikke endnu et manuelt sandhedsdokument.

## Felt-syntese — otte kilder

Jeg har læst de fire angivne kilder og fundet fire supplerende kilder, der handler om samme praktiske felt: fælles terminal-/repo-workflows for Codex og Claude Code, store kodeopgaver, handoff, gates, parallelitet og hvad der knækker i drift.

### De fire angivne

- [Towards Data Science: How to Combine Claude Code and Codex for Maximum Coding Power](https://towardsdatascience.com/how-to-combining-claude-code-and-codex-for-max-coding-power/) — konkret cross-review-loop: builder laver plan/implementation, den anden model reviewer committet PR, builder retter og gen-requester review til grøn.
- [DEV: Same Framework, Different Engine](https://dev.to/shinpr/same-framework-different-engine-porting-ai-coding-workflows-from-claude-code-to-codex-cli-n3p) — workflow-overførsel lykkes, når roller, kontekstseparation, stop-punkter og artefakthandoffs er platform-uafhængige.
- [GenAI Unplugged: Claude Code vs Codex — Build a Bridge Instead](https://genaiunplugged.substack.com/p/claude-code-vs-codex-comparison) — `CLAUDE.md`/`AGENTS.md` som samme regelhjerne, `CHANGES.log` som fælles handoff, worktrees til store projekter, hooks når log-reglen skal være garanti.
- [Verdent: Codex CLI vs Claude Code for Terminal Agent Workflows](https://www.verdent.ai/guides/codex-cli-vs-claude-code-terminal-agent-workflows) — begge flader flytter sig hurtigt; vurder workflowform, MCP/skills/review/session/budget og ikke "hvilken model vinder".

### Fire supplerende

- [GenAI Unplugged: OpenAI Codex Setup Guide](https://genaiunplugged.substack.com/p/openai-codex-setup-guide-beginner) — tilføjer konkret `handoff.md`-bro, terminal-i-Codex hvor Claude kan køres samme sted, permission-mode som autonomi-snit, Goals som long-running loop og sikkerhedsadvarsel ved app-/mail-adgang.
- [arXiv: tap — A File-Based Protocol for Heterogeneous LLM Agent Collaboration](https://arxiv.org/abs/2606.14445) — tilføjer produktionsbevis for filbaserede beskeder + realtidsnotifikationer + separate worktrees; 27 dage, 209 PR'er, 717 artifacts, og flere review-fund i heterogene modelpar end homogene.
- [GitHub: shinpr/codex-workflows](https://github.com/shinpr/codex-workflows) — tilføjer konkret Codex-implementering af scale-routing, PRD/design/task/commit-kæde, TDD, quality gates, fresh-context subagents og "1 task = 1 commit".
- [GitHub: shinpr/claude-code-workflows](https://github.com/shinpr/claude-code-workflows) — tilføjer samme workflowform på Claude-siden: small/medium/large routing, design-sync, verification, fullstack slicing, review mod design docs og context separation.

### Enighed på tværs

- **Filer bærer samarbejde bedre end chat-hukommelse.** Kilderne gentager samme mønster: regler, handoff, design, tasks, reviews og test-evidens skal være repo-filer/PR-artifacts, ikke usynlig session state.
- **Worktrees er ikke pynt ved store opgaver.** Når flere agenter arbejder parallelt, skal de isoleres i branch/worktree og først mødes ved PR/merge.
- **Fælles regler skal projekteres til begge agenters læseflade.** `CLAUDE.md` og `AGENTS.md` må ikke drive fra hinanden; én sandhed skal generere begge.
- **Kontekstseparation er en arkitektur, ikke en feature.** Generator, reviewer, verifier og fixer skal arbejde fra artefakter i friske kontekster, så den samme antagelse ikke bare genbruges.
- **Cross-review-loopet er den praktiske kombinationsgevinst.** Værdien kommer ikke af at have to modeller i samme rum, men af en committet PR, en anden model som uafhængig reviewer, rettelser og ny review.
- **Store opgaver skal routes efter scale.** Letvægtsopgaver må ikke drukne i tung proces; store eller kritiske opgaver må ikke slippe for PRD/design/test/review-kæden.

### Modsigelser feltet tvinger stillingtagen til

- **"CHANGES.log er nok" vs. "worktrees ved store opgaver".** Mit valg: enkel handoff-log er nok som hukommelsesformat, men ikke som isolation. Stork bruger handoff-log som evidens-view og worktrees som skadefladeværn.
- **Full Access/Goals for autonomi vs. godkendelseskrav.** Mit valg: Goals/long-running loops kan bruges til transport efter plan-gate, men aldrig til krav, planvalg, risk-accept eller slut OK.
- **Fast model-rolle vs. skiftende lead efter opgave.** Mit valg: Stork har faste ansvarsroller, men ikke fast "bedste model". Lead/indsats routes efter package-scale og led, ikke efter modeltro.
- **Tool-features vs. workflow-kerne.** Mit valg: konkrete flader som `CLAUDE.md`, `AGENTS.md`, hooks, skills og PR-review bruges som adaptere. Sandheden er stadig workflow-docs, evidens-register og GitHub.

### Virker i praksis vs. hype

- **Virker i praksis:** committede PR'er som review-enhed, separate worktrees, filbaseret handoff, identiske regelprojektioner, explicit scale-routing, fresh-context review, tests før commit, hooks/checks der håndhæver log/regeldrift.
- **Hype eller forfatter-præference:** "vælg én vinder-model", "Full Access er bare bedre", "memory/goals kan bære sandheden", "én app som command center løser governance", og "flere parallelle agenter er automatisk bedre".

### Ændringer i denne forbedrede version

| Ændring                                                                  | Hvad feltet viste                                                                                                     | Led der styrkes                              |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Scale-determination ved åbning                                           | DEV + begge workflow-repos bruger small/medium/large routing; store opgaver kræver mere struktur, små opgaver mindre. | Åbning, plan, Mathias-friskhed               |
| Én regelrygrad med `CLAUDE.md` + `AGENTS.md` som genererede projektioner | GenAI-bridge og Verdent viser samme regler som praktisk bro; drift mellem filerne er kendt fejl.                      | Rolle-aktivering, handoff, doc-sandhed       |
| Handoff-log som evidence-view                                            | GenAI bruger `CHANGES.log`/`handoff.md`; tap viser filbaserede beskeder overlever restart/notification-fejl.          | Handoff, restart, audit                      |
| Cross-review-loop på committet PR                                        | TDS, GenAI og tap peger på anden model som reviewer som den reelle kombinationsgevinst.                               | Build-validering, fejl-fangst, kvalitet      |
| Token-/turn-/loop-budget pr. scale                                       | Verdent og GenAI viser task budgets/Goals/limits som praktisk driftspunkt; uden budget løber automatik.               | Automatisering, stop-state, Mathias-friskhed |
| Permission-mode som led-politik                                          | GenAI setup viser Full Access vs default som autonomi-snit; sikkerhedsafsnittet advarer ved app/mail/private data.    | Transport vs dømmekraft, sikkerhed           |

Svageste led i mit tidligere bud var derfor Step 5: review var korrekt uafhængig, men ikke stærk nok som iterativ kæde. Det er nu ændret til et SHA-/PR-bundet cross-review-loop med budget og stop-regler.

## 1. Struktur

### Step 0 — Åbning, scale og isolering

**Funktioner:**

- Mathias åbner en **pakke-case** på en author-verificerbar kanal.
- Workflow-kernen opretter et entydigt pakke-id, evidens-register og aktør-workspaces.
- Workflow-kernen laver **scale-determination**: Small, Medium, Large eller Critical.
- Scale styrer artefakt-dybde, review-cadence, budgetter og loop-grænser. Scale må aldrig fjerne krav-hash, plan-SHA eller slut-gate.
- Workflow-kernen genererer/validerer regelprojektioner: `docs/workflow/*` er sandhed; `.claude/CLAUDE.md` og `AGENTS.md` er adapter-projektioner med samme checksum.
- Workflow-kernen opretter `handoff.jsonl` som append-only view af evidens-registeret; ingen aktør starter et led uden at læse seneste handoff.
- Hver aktør arbejder i egen branch/worktree.
- Alle aktør-artefakter læses fra committede blobs/origin-refs, ikke fra den aktuelle working tree.
- Preflight tjekker værktøjer, auth, mobil-modtagelse, stop-state, baseline, regel-drift, handoff-format og budgetprofil.

**Formål:** Første led skal forhindre det der allerede gik galt: delt arbejdstræ, mutable untracked filer og branch-flip der ændrer andres virkelighed.

**Output:** pakke-id, scale, evidens-register, handoff-log, aktør-branches/worktrees, regel-checksum, budgetprofil, baseline, "klar til recon".

### Step 1 — Parallel recon før krav

**Funktioner:**

- Code-recon: faktisk repo/kode/docs/forretningslogik i koden.
- Codex-recon: uafhængig teknisk/verifikations-recon og feltmønstre.
- Claude.ai-recon: forretningssprog, vision, forretningsforståelse, Mathias-intentioner og spørgsmål.
- Recon-syntese: kun fund + åbne spørgsmål; ingen løsning, ingen plan.
- Recon-filer committes/pushes på aktørens egen branch og læses derefter fra blob.

**Formål:** Kravet skal være dækkende for alle forretningsfunktioner pakken rører, og kode-misforståelser skal opdages før plan.

**Output:** tre recon-filer + syntese + spørgsmål til Mathias.

### Step 2 — Krav-dok-dialog og krav-hash

**Funktioner:**

- Claude.ai almindelig rolle skriver krav-dok fra Mathias' ord.
- Code og Codex må kun flage dækningshuller og teknisk/faktisk urealiserbarhed; de må ikke skrive løsningen ind i kravet.
- Mathias validerer med `krav OK <hash>`.
- Krav-hash skal matche den fil, der bliver merged.

**Formål:** Intet bygges uden krav bag sig, og det skal kunne bevises hvilket krav Mathias godkendte.

**Output:** krav-dok på main + hash-bevis.

### Step 3 — Plan med kontrolleret konkurrence

**Funktioner:**

- Code skriver hovedplanen.
- Codex leverer adversarial plan-review og kan levere alternativ opsætning for afgørende valg.
- Claude.ai laver krav-troskabs-review: kravets mening sætning for sætning mod planen.
- Evidens-registeret knytter hver krav-sætning til planpunkt, testform, review-status og eventuel Mathias-gate.
- Planen fastlægger review-loopets kadence: hvilke batches kræver cross-review, maksimal antal fix/review-runder før stop, og hvilken scale der kræver ekstra review.
- For hvert afgørende valg skal planen indeholde:
  - valgt opsætning,
  - to andre opsætninger,
  - testet modsvar mod begge,
  - hvorfor tabende opsætninger ikke vælges,
  - hvilke tabende indvendinger der bliver til værn.

**Konkurrence-mekanikkens plads:** Den skal være fast i planfasen for afgørende valg, men ikke som "bedste retoriske bud vinder". Den skal hedde **modspilsrunde**: to eller flere opsætninger prøves mod kontrakten og terminal-/repo-beviser, og den stærkeste evidens vinder. En tabende opsætning efterlades ikke som affald; dens bedste indvendinger bliver tests, gates eller fravalg.

**Formål:** Første-løsning-svagheden dør først, når konkurrerende opsætninger faktisk skal slå hinanden på bevis.

**Output:** plan-SHA med modsvarsmatrix, krav→plan→test-bindinger, batch-/review-loop-kadence og budgetprofil.

### Step 4 — Fire aktør-godkendelser før build

**Funktioner:**

- **Mathias:** godkender at planen/byg-retningen er tro mod hans hvad.
- **Claude.ai:** PASS/FEEDBACK på krav-troskab.
- **Code:** build-ready og scope-ready.
- **Codex:** teknisk APPROVAL/FEEDBACK.
- Build-start kræver alle fire godkendelser på samme plan-SHA og ingen åbne Mathias-gates.

**Formål:** Planen kan ikke snige sig fra "plausibel" til "bygget" uden fuld rolle-validering.

**Output:** build-start eller FEEDBACK-runde.

### Step 5 — Batch-build med led-validering

**Funktioner:**

- Code bygger i små batches.
- Hver batch fryses som commit/PR, før den anden tekniske aktør reviewer.
- Cross-review-loopet kører sådan: build → commit/PR → uafhængig review i frisk kontekst → fix-commit → re-request review → gentag til grøn eller stop.
- Loopet er bounded: scale bestemmer max-runder; samme fejlklasse to gange i træk udløser stop/ejer-gate i stedet for mere automatik.
- Mekaniske checks kører før frys: hash/SHA, ordret-diff, status/counter, filklasse, link/marker/deklaration.
- Hver batch opdaterer evidens-registeret: hvilke krav/planpunkter blev dækket, hvilke tests/reviews beviser det, og hvilke åbne huller står tilbage.
- Codex reviewer hver batch read-only som teknisk verifikator, når Code har bygget; hvis Codex bygger et teknisk batch-artefakt, skal Code-review køre mod den committede PR efter samme princip.
- Claude.ai kaldes kun ind, når batchen rejser krav-/meningsspørgsmål eller skal oversætte Mathias-gate.
- Mathias kaldes kun ind på beslutninger der er hans.

**Formål:** Fejl, bordbrud og kædebrud fanges ved det led de opstår, ikke som slutrapport-overraskelse.

**Output:** batch-commits/PR'er, review-artefakter, fix-commits, loop-resultat, eventuelle fund-gates.

### Step 6 — Slutrapport med fuld validering

**Funktioner:**

- Code genererer/skriver slutrapport som læsbar projektion af evidens-registeret: krav-dækning, plan-afvigelser, test-evidens, åbne rester og links til GitHub-evidens.
- Codex reviewer teknisk sandhed og kravdækning.
- Claude.ai reviewer krav/vision/forretning og rapportens mening.
- Mathias giver slut OK.
- Slut-merge kræver alle fire slut-godkendelser.

**Formål:** Intet lukkes uden fuld validering. Main/GitHub bliver sporet, ikke chat-hukommelsen.

**Output:** slutrapport + pakke-luk.

### Step 7 — Renhed og arkivering

**Funktioner:**

- Pakke-artefakter lukkes: beholdes, genereres, flyttes eller slettes efter formål.
- Idéer flyttes til idé-hjem og må aldrig blive workflow-sandhed.
- Workflow-regler opdateres kun når pakken faktisk ændrer workflowet.
- Slutrapport og GitHub er historikken.

**Formål:** Repoet skal ikke vokse til et arkiv af gamle sandheder.

**Output:** rent repo efter pakke-luk.

## 2. Kobling

Kæden skal kobles med ti bærende bindinger:

1. **Pakke-id-binding:** alle artefakter, events og reviews hører til et bestemt pakke-id.
2. **Scale-binding:** scale bestemmer artefaktdybde, budget og review-kadence, men ikke om hovedgates findes.
3. **Regel-binding:** `docs/workflow/*` genererer `CLAUDE.md` og `AGENTS.md`; checksum-drift blokerer.
4. **Handoff-binding:** hver aktør læser seneste `handoff.jsonl`-event før start og skriver et nyt event ved led-luk.
5. **Blob-binding:** aktører læser hinandens leverancer fra commits/origin-refs, ikke fra mutable working tree.
6. **Hash-binding:** Mathias' krav OK peger på et konkret krav-dok.
7. **SHA-binding:** plan- og review-godkendelser peger på en konkret plan.
8. **PR-binding:** cross-review kører på committet PR/diff, ikke på den byggende agents session.
9. **Gate-binding:** hvert stop har en ejer: Code, Codex, Claude.ai eller Mathias.
10. **Evidens-binding:** krav, planpunkt, test, review, commit, handoff og slutrapport bindes i ét register.

Ingen del må alene kunne bære flowet:

- Recon uden krav er kun input.
- Scale uden krav må kun vælge procesdybde.
- Regelfiler uden checksum kan drive og må ikke aktivere roller.
- Handoff-log uden commit/PR er kun note, ikke bevis.
- Krav uden hash må ikke planlægges.
- Plan uden modspil må ikke godkendes.
- Modspil uden test er kun mening.
- Test uden aktør-dømmekraft er kun prefilter.
- Review uden PR/SHA kan ikke starte build eller lukke batch.
- Slutrapport uden fire aktør-godkendelser kan ikke lukke pakken.
- Slutrapport uden evidens-register er prosa, ikke bevis.

## 3. Automatisering

### Automatiseres

- Event-opdagelse.
- Scale-determination efter deklarerede heuristikker.
- Generering og drift-check af `CLAUDE.md`/`AGENTS.md` fra workflow-sandheden.
- Handoff-log append, format-check og "seneste handoff læst"-check.
- Dispatch til aktørernes workflow-roller.
- Status, led-log og notifikationer.
- Evidens-registerets mekaniske felter: commits, SHA'er, PR'er, testnavne, review-refs, åbne gates.
- Transport-PR'er, review-request og re-request efter fix.
- Baseline, idempotens og budget-counter.
- Hash/SHA/deklaration/marker/fileclass/selftest.
- Stop ved ukendt event/type/modtager.
- Stop ved regel-drift, manglende handoff eller budget/loop-overskridelse.
- Stop ved divergens, stale spor eller halvskrevet leverance.

### Automatiseres aldrig

- Mathias' krav, slut OK og forretningsafgørelser.
- Claude.ai's krav-/meningsdom.
- Codex' tekniske review-dom.
- Codes tekniske valg inden for godkendt krav.
- At overrule et review-fund som "acceptabelt".
- Valget om at acceptere en risiko, et scope-skift eller en workaround.

### Fejl-fangst ved hvert led

- **Åbning:** forkert author ignoreres; pakke-id, scale, regel-checksum og handoff-log kræves.
- **Recon:** syntese blokerer uden alle krævede recon-kilder.
- **Krav:** hash mismatch blokerer.
- **Plan:** manglende modsvar, utestede modsvar, manglende review-kadence eller budgetprofil blokerer.
- **Godkendelse:** PASS/APPROVAL på forkert SHA blokerer.
- **Build:** batch-review, selftest og committet PR før review; adapter-fejl stopper.
- **Cross-review-loop:** samme fejlklasse to gange, konflikt mellem review og plan, eller loop-budget udløber stopper og tildeler ejer.
- **Gate:** åben Mathias-gate pauser sporet.
- **Slut:** manglende Claude.ai/Codex/Code/Mathias-godkendelse blokerer luk.

## 4. Kontrolposter

### Mathias kaldes ind

- Pakkeåbning.
- Krav-validering (`krav OK <hash>`).
- Planens hvad-gate, hvis planen har reelle valg der kræver hans accept.
- Fund-gates: formål, scope, forretningsregel, risikoaccept, workaround.
- Scale-override kun hvis scale ændrer hvor meget af hans forretningsrisiko der vurderes nu; ikke for mekanisk filantal.
- Beslutnings-sti-review: workflow-regler, stamme-docs, kode, DB, scripts, GitHub protection/adgang.
- Slut OK.

### Mathias holdes ude af

- Actor-relæ.
- Branch-/worktree-skift.
- Statusbogføring.
- Transport-PR'er på ramme-stier.
- Genkørsler efter mekaniske fejl.
- Cross-review-retry og re-request efter tekniske fix.
- Regelfil-projektion og handoff-format.
- Hvordan-spørgsmål.
- Konkurrencebedømmelse på teknik; den afgøres af kontrakt, tests og aktørernes rolleansvar.

### Fire-aktør-godkendelser

- **Krav:** Mathias krav OK; Claude.ai kravtekst/mening; Code byggelighedsfakta; Codex teknisk realiserbarhedsfakta.
- **Plan:** Code plan-ready; Codex APPROVAL; Claude.ai PASS; Mathias hvad-gate når påkrævet.
- **Build-batch:** builder commit/PR; uafhængig teknisk review; fix-loop til grøn eller ejer-gate.
- **Slut:** Code leverance-erklæring; Codex slut-review; Claude.ai slut-review; Mathias slut OK.

Alle godkendelser skal være artefakt-båret og kunne læses efterfølgende uden chat-hukommelse.

## 5. Rolle-opsætning

### Claude.ai

- **Workflow-rolle:** forretnings-recon, krav-troskabsdommer, Mathias-gate-oversætter, slutrapport-reviewer.
- **Almindelig rolle:** krav-dialog med Mathias og strategisk sparring i forretningssprog.

### Code

- **Workflow-rolle:** builder, teknisk planforfatter, repo-/kode-recon, state-/transport-ejer, slutrapportforfatter.
- **Almindelig rolle:** implementering af Stork-features, tests, migrations, UI/API og teknisk kvalitet.

### Codex

- **Workflow-rolle:** uafhængig read-only reviewer på committede PR'er, adversarial modspil, teknisk realiserbarhedsdom, docs-/workflow-sandhedstjek.
- **Almindelig rolle:** kode-reviewer, bug-/risk-finder og verifikator.

### Mathias

Mathias er ikke AI-aktør, men hans flade deles i to:

- **Beslutningsflade:** hvad, krav, forretning, risikoaccept, slut OK.
- **Modtageflade:** led-status, gate-pakker, spørgsmål, alerts.

Modtagefladen må aldrig blive mekanisk relæ.

## 6. Dokument-opsætning

### Grundregel

Repoet skal skelne mellem:

- **Sandhed:** bindende.
- **Workflow-regel:** bindende proces.
- **Adapter-projektion:** genereret læseflade til en bestemt agent; ikke sandhed.
- **Pakke-artefakt:** midlertidigt indtil pakke-luk.
- **Evidens-register:** maskinlæsbar pakke-ledger.
- **Historik:** slutrapporter + GitHub.
- **Idé:** må modsige, må aldrig styre.

### Foreslået mappestruktur

```text
repo-root/
  CLAUDE.md              # genereret fra docs/workflow/*
  AGENTS.md              # genereret fra samme kilde, samme checksum
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
      evidens-register.schema.json
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
        evidence.json
        handoff.jsonl
        status.json      # genereret/projektion af evidence.json
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

### Hvad er workflow-docs

- `docs/workflow/workflow.md`: menneskelig step-for-step sandhed.
- `docs/workflow/roller.md`: rolletyper og ansvar.
- `docs/workflow/gates.md`: gate-ord, beslutnings-stier, ramme-stier.
- `docs/workflow/scale-og-budgetter.md`: scale-heuristik, turn/token/loop-budget, review-cadence.
- `docs/workflow/artefakt-kontrakt.md`: markers, `→NÆSTE`, hash/SHA, filnavne.
- `docs/workflow/evidens-register.schema.json`: krav→plan→test→review→gate-kontrakt.
- `docs/workflow/rule-projection.schema.json`: checksum og genereringskontrakt for `CLAUDE.md`/`AGENTS.md`.
- `scripts/**` eller tilsvarende maskinlæsbar regelbog: den eksekverbare del.
- Adapter-docs: kun aktivering/pointer, ikke rolleindhold.
- `CLAUDE.md` og `AGENTS.md`: genererede adapter-projektioner; de må ikke håndredigeres som sandhed.

### Hvad er udenom

- Strategi-docs er anker, ikke workflow-regler.
- Tekniske docs er reference/gæld, ikke proces.
- Idé-docs er lovlige modsigelser, tydeligt mærket.
- Slutrapporter er historik, ikke nye regler.
- Lokal session-memory og agent-app history er brugerflade, ikke repo-sandhed.

### Slette-/flytteplan

- `docs/coordination/v4-slettede-docs/**`: ud af levende repo; git-history er default hjem.
- Gamle pakke-planer/krav i `docs/coordination/arkiv/**`: slettes eller flyttes til history kun hvis slutrapport ikke dækker.
- `gov-5-automation-*` og `rette-til-*`: behold kun indtil workflow-færdiggørelse lukker; derefter slutrapport/history eller slet.
- `gov-6-forslag-og-udskudte.md`: opløses i krav/plan eller `docs/ideas/workflow/`.
- `aktiv-plan.md` og `seneste-rapport.md`: erstattes af genereret current-state eller én kort pointer.
- `docs/claude-ai/SKILL.md`: behold kun som ren adapter/pointer.
- `docs/codex/sandbox-opsaetning.md`: teknisk reference, ikke workflow-regel.
- Håndskrevne `CLAUDE.md`/`AGENTS.md` med selvstændige regler: erstattes af genererede projektioner fra `docs/workflow/*`.
- Løse `CHANGES.log`/`handoff.md` uden schema eller package-id: migreres til `handoff.jsonl` eller slettes efter slutrapport.

## 7. Fravalg

### Fravalgt: delt working tree som leverancehjem

Det er allerede observeret som skadeligt. Untracked filer i et delt træ har ingen author, ingen commit, ingen stabil branch og kan forsvinde ved checkout. Artefakter skal låses med commit+push.

### Fravalgt: Cowork/postkasse som gate

Cowork/postkasse kan blive informationskanal, men ikke gate, før author-verifikation er bevist. En lokal fil kan ikke alene bevise Mathias' beslutning.

### Fravalgt: cloud-first rygrad

Cloud-rutiner er relevante til audits og natlige checks, men Stork-flowet kræver lokal repo-state, GitHub-state, WSL/tooling og aktørernes konkrete arbejdstræer. Cloud kan supplere, ikke være fundament.

### Fravalgt: permanent "bedste bud vinder" for hele workflowet

Konkurrence løfter valg, når kriterier og beviser er faste. Den skader, hvis den belønner overbevisende tekst, store løfter eller aktører der skriver stærkest. Derfor skal konkurrence være en **kontrolleret modspilsrunde på afgørende valg**, ikke en permanent kampform for alle pakker.

### Fravalgt: slutrapport som primær sandhed

Slutrapporten er læsbar og nødvendig, men den må ikke være den primære sandhed. Hvis slutrapporten er primær, gentager vi den manuelle afskriftsfejl. Den primære pakke-sandhed skal være evidens-registeret + GitHub; rapporten er den menneskelige visning.

### Fravalgt: én super-agent

Kravet kræver fire aktører og modspil. Én agent der både skriver, bygger, reviewer og oversætter genskaber første-løsning-svagheden.

### Fravalgt: direct main-push

Det gør transport lettere, men fjerner PR/check/review-sporet. Main skal være resultat af validering, ikke transportgenvej.

### Fravalgt: doc-lint som meningsdommer

Docs-tests skal fange reelle brud. De må ikke udgive sig for at kunne afgøre vision/forretning/krav-mening.

### Fravalgt: unbounded Full Access/Goals som workflow-rygrad

Long-running autonomous loops er nyttige efter plan-gate, men uden scale-budget, permission-snit og stop-regler bliver de en ny fejlflade. De må bære transport, aldrig dømmekraft.

### Fravalgt: `CHANGES.log` som primær sandhed

Feltet viser, at en fælles log virker som bro, men Stork kræver stærkere bevis. Derfor bliver handoff en append-only projektion af evidens-registeret med package-id, SHA/PR og schema, ikke en løs tekstlog.

## 8. Idé-liste dækket

Status lukker krav-dokkets idé-liste. "Brugt" betyder, at funktionen faktisk er en del af buddets workflow. "Dækket af anden bærer" betyder, at samme metode er løst, men ikke med kandidatens produktflade som primær bærer. Henvisningerne peger på stabile afsnit i dette bud, så belægget ikke knækker ved formattering.

Efter felt-syntesen bliver flere kandidater stærkere, men stadig ikke "brugt" som deres egen produktflade. De er dækket af Storks workflow-bærere: scale, rule-projection, handoff, PR-binding, worktrees, budgetter og evidens-register.

### Claude Code-egenskaber

| Kandidat                           | Status                | Verificerbart belæg                                                                                                                                                                                                     |
| ---------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hooks                              | DÆKKET AF ANDEN BÆRER | **Bærer:** scripts/checks for regel-drift, handoff-format, selftest og stop. **Metode:** lifecycle-værn. **Belæg:** `§3 Automatisering`, `§3 Fejl-fangst`, `§6 workflow-docs`.                                          |
| `/goal`                            | FRAVALGT              | Konkret grund: en session-goal kan ikke alene bære krav-hash, plan-SHA, PR-binding og fire aktør-godkendelser; long-running loops er kun transport efter plan-gate. **Belæg:** `Fravalgt: unbounded Full Access/Goals`. |
| `.claude/rules/`                   | DÆKKET AF ANDEN BÆRER | **Bærer:** `docs/workflow/*` plus genererede `CLAUDE.md`/`AGENTS.md`. **Metode:** samme regler til begge agenter uden at gøre Claude-fladen til sandhed. **Belæg:** `Step 0`, `§6 Dokument-opsætning`.                  |
| Skills                             | DÆKKET AF ANDEN BÆRER | **Bærer:** workflow-docs, adapter-docs og eksekverbar regelbog. **Metode:** genbrugbare rolle-/gate-procedurer. **Belæg:** `§5 Rolle-opsætning`, `§6 workflow-docs`.                                                    |
| Codex-plugin                       | FRAVALGT              | Konkret grund: formel Codex-gate skal være uafhængig af Code/Claude-konteksten; plugin kan bruges som før-review, men ikke gate. **Belæg:** `§4 Fire-aktør-godkendelser`, `§5 Codex`.                                   |
| `/loop`                            | DÆKKET AF ANDEN BÆRER | **Bærer:** cross-review-loop + budget/stop. **Metode:** iterér build/review/fix uden ubegrænset session-loop. **Belæg:** `Step 5`, `§3 Automatisering`.                                                                 |
| Statusline                         | DÆKKET AF ANDEN BÆRER | **Bærer:** evidens-register, `handoff.jsonl` og `status.json`. **Metode:** synlig led-status fra pakke-sandheden. **Belæg:** `Step 0`, `§6 mappestruktur`.                                                              |
| Checkpointing (`/rewind`)          | DÆKKET AF ANDEN BÆRER | **Bærer:** commit+push, PR'er, branches/worktrees og blob-binding. **Metode:** rollback/genoptagelse på frosne artefakter. **Belæg:** `§2 Kobling`, `Fravalgt: delt working tree`.                                      |
| `--from-pr`                        | DÆKKET AF ANDEN BÆRER | **Bærer:** PR-binding + blob-binding. **Metode:** genoptagelse/review fra frossen PR-kontekst. **Belæg:** `§2 Kobling`, `Step 5`.                                                                                       |
| `/doctor` + `/context` + `/memory` | DÆKKET AF ANDEN BÆRER | **Bærer:** preflight, handoff-log, evidens-register og GitHub. **Metode:** diagnose/kontekst/persistens uden session-memory som sandhed. **Belæg:** `Step 0`, `§6 Hvad er udenom`.                                      |
| Sandboxing                         | DÆKKET AF ANDEN BÆRER | **Bærer:** worktree-isolation, permission-/sti-snit, CI/checks og stop-regler. **Metode:** begræns skadeflade. **Belæg:** `Step 0`, `§3 Fejl-fangst`.                                                                   |
| Headless                           | DÆKKET AF ANDEN BÆRER | **Bærer:** event-dispatch til workflow-roller. **Metode:** aktører kaldes uden Mathias som relæ. **Belæg:** `§3 Automatisering`, `§4 Mathias holdes ude af`.                                                            |
| Agent SDK                          | DÆKKET AF ANDEN BÆRER | **Bærer:** workflow-kerne + adapter-docs. **Metode:** orkestrering via kontrakt frem for én SDK. **Belæg:** `Hovedbud`, `§6 adapters`.                                                                                  |
| Agent view                         | DÆKKET AF ANDEN BÆRER | **Bærer:** evidens-register, handoff-log og status-projektion. **Metode:** observerbarhed. **Belæg:** `Step 0`, `§3 Automatisering`, `§6 mappestruktur`.                                                                |
| Agent teams                        | FRAVALGT              | Konkret grund: peer-chat/team-runtime giver ikke i sig selv frosne blobs, PR-binding eller fire uafhængige gates. **Belæg:** `§2 Kobling`, `Step 5`.                                                                    |
| Workflows                          | DÆKKET AF ANDEN BÆRER | **Bærer:** Storks workflow-kerne + `docs/workflow/*`. **Metode:** gentagelig pakkeproces med steps, gates, artefaktkontrakt og evidens. **Belæg:** `Hovedbud`, `§1 Struktur`, `§6 Dokument-opsætning`.                  |
| ultrareview                        | FRAVALGT              | Konkret grund: stor-diff-review kan supplere, men kan ikke erstatte uafhængig Codex-gate, Claude.ai kravdom, Code build-erklæring og Mathias slut OK. **Belæg:** `§4 Fire-aktør-godkendelser`.                          |
| Routines                           | DÆKKET AF ANDEN BÆRER | **Bærer:** workflow-docs + scripts + event/state. **Metode:** gentagelige procedurer/audits uden cloud-rutine som rygrad. **Belæg:** `§3 Automatisering`, `§6 workflow-docs`, `Fravalgt: cloud-first rygrad`.           |
| Worktrees                          | BRUGT                 | **Brugt i buddet:** egen branch/worktree pr. aktør og worktree-isolation ved store opgaver. **Belæg:** `Step 0`, `§2 Blob-binding`, `Fravalgt: delt working tree`.                                                      |
| Auto mode                          | FRAVALGT              | Konkret grund: opaque klassifikation må ikke bære governance-gates; buddet bruger deklarerede events, scale, filklasse, hash/SHA og stop-regler. **Belæg:** `Step 0`, `§3 Fejl-fangst`.                                 |
| Computer use                       | FRAVALGT              | Konkret grund: desktop-kontrol er konto-/fladeafhængig og giver ikke stabilt artifact-, author- eller SHA-bevis. **Belæg:** `§4 Fire-aktør-godkendelser`, `Fravalgt: unbounded Full Access/Goals`.                      |

### Codex-opsætning

| Kandidat                 | Status                | Verificerbart belæg                                                                                                                                                                                                                                |
| ------------------------ | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| model + reasoning_effort | DÆKKET AF ANDEN BÆRER | **Bærer:** scale-/budgetprofil i adapterlaget. **Metode:** højere indsats på modsvar/review, lavere på mekanisk transport, uden at vælge én fast model som workflow-sandhed. **Belæg:** `Step 0`, `Step 3`, `docs/workflow/scale-og-budgetter.md`. |
| approval_policy          | DÆKKET AF ANDEN BÆRER | **Bærer:** permission-mode som led-politik + gates. **Metode:** transport kan køre, dømmekraft kræver aktør/human. **Belæg:** `§3 Automatisering`, `Fravalgt: unbounded Full Access/Goals`.                                                        |
| sandbox_mode             | DÆKKET AF ANDEN BÆRER | **Bærer:** worktree-isolation, sti-/permission-snit og fail-closed checks. **Metode:** begrænset skrive- og skadeflade. **Belæg:** `Step 0`, `§3 Fejl-fangst`.                                                                                     |
| network_access           | DÆKKET AF ANDEN BÆRER | **Bærer:** preflight, GitHub/blob-transport og trusted adapter. **Metode:** netadgang som verificerbar transport, ikke beslutningsgrundlag. **Belæg:** `Step 0`, `§2 Blob-/PR-binding`, `§3 Automatisering`.                                       |
| github-plugin            | DÆKKET AF ANDEN BÆRER | **Bærer:** GitHub som PR/blob/evidens-spor, uanset plugin/CLI. **Metode:** frosne artefakter, review-requests og historik. **Belæg:** `Hovedbud`, `§2 Kobling`, `Step 5`.                                                                          |
| trust_level pr. projekt  | DÆKKET AF ANDEN BÆRER | **Bærer:** preflight, aktør-workspaces, regel-checksum og gate-ejerskab. **Metode:** workflow-automatik kun i kontrolleret repo-/worktree-kontekst. **Belæg:** `Step 0`, `§2 Gate-binding`, `§3 Fejl-fangst`.                                      |

## 9. Modsvar med testede knudepunkter

### Testgrundlag

```text
pnpm kaede:selftest
Resultat: Kæde-selftest: alle cases passed
```

Udvalgte grønne selftest-knudepunkter:

```text
qwers-åbning → kæden IGANGSÆTTES: Code + Codex recon-dispatches
recon-syntese uden begge kode-docs → BLOKERET
krav OK-hash ≠ fil-hash → krav-dok-merge BLOKERET
PASS bundet til FORKERT plan-SHA → BLOKERET
transport-vej: origin/main URØRT
adapter-fejl → stop-fil skrevet
```

Felt-syntesens nye knudepunkter sanity-testet i terminalen:

```text
scale-1-file Small maxLoops 1
scale-6-files Large maxLoops 3
scale-critical Critical maxLoops 4
rule-projection OK:same-checksum
rule-drift BLOKERET:rules-checksum
handoff-missing BLOKERET:seneste-handoff-laest
handoff-read START-OK
review-no-pr BLOKERET:committed-pr-required
review-with-pr REVIEW-OK:committed-pr
loop-distinct LOOP-OK
loop-repeat BLOKERET:gentaget-fejlklasse-ejer-gate
loop-overbudget BLOKERET:loop-budget
```

### Opsætning A — Blob/worktree-isolation som artefaktregel

**Valg:** Aktører arbejder i egne branches/worktrees. Leverancer læses fra committede blobs/origin-refs.

**Modsvar mod delt working tree:** Observeret skadeligt; terminal viser nu separate worktrees.

**Modsvar mod "bare untracked files":** Recon-blobs findes på origin og kan læses uden checkout; untracked filer har ikke den garanti.

**Terminaltest:**

```text
code-recon-blob-ok
codex-recon-blob-ok

worktree /home/mathias/stork-2.0       [codex-bud-workflow-faerdiggoerelse]
worktree /home/mathias/stork-2.0-code  [claude/bud-code-workflow-faerdiggoerelse]
```

### Opsætning B — Event/state-machine som transport-rygrad

**Valg:** Workflowet styres af events, state, regler og frosne artefakter.

**Modsvar mod manuel relæ-opsætning:** qwers dispatches automatisk til to aktører; idempotens og behandlet-state er selftestet.

**Modsvar mod always-on chat/session som rygrad:** selftest viser fail-closed ved ukendt event/type/modtager og stop-fil ved fejl. En session er aktørflade, ikke sandhed.

**Terminaltest:**

```text
qwers-dispatch code:recon-kode,codex:recon-research
syntese-uden-begge BLOKERET:begge-kode-recon-docs-findes
syntese-med-begge claude-ai-rolle:recon-syntese
```

### Opsætning C — Parallel recon + syntese

**Valg:** Code og Codex recon parallelt; Claude.ai syntese efter begge; Mathias afklarer.

**Modsvar mod én samlet recon:** syntese blokerer uden begge kode-docs; én kilde er ikke nok.

**Modsvar mod Claude.ai først, kode bagefter:** kravet om kode-recon før krav understøttes af blokeringen uden begge tekniske inputs.

**Terminaltest:**

```text
syntese-uden-begge BLOKERET:begge-kode-recon-docs-findes
syntese-med-begge claude-ai-rolle:recon-syntese
```

### Opsætning D — Author-verificeret gate + krav-hash

**Valg:** Mathias-gates bæres af author-verificerbare events og hash.

**Modsvar mod Cowork/lokal fil som gate:** forkert author ignoreres.

**Modsvar mod PR-klik som eneste krav-gate:** hash mismatch blokerer; klik alene beviser ikke indholdet.

**Terminaltest:**

```text
wrong-author IGNORER-GATE-ORD
right-author GATE-ORD-REGISTRERET
hash-mismatch BLOKERET:krav-ok-hash-matcher-fil-hash
```

### Opsætning E — SHA-bundet fire-aktør-godkendelse

**Valg:** Build og luk kræver fire aktørers frosne godkendelser.

**Modsvar mod Codex-only gate:** slut uden Claude.ai approval blokeres.

**Modsvar mod Claude.ai/Mathias-only gate:** forkert Codex approval SHA blokerer build.

**Terminaltest:**

```text
build-start-ok DISPATCH:code:build-start
wrong-plan-sha BLOKERET:codex-approval-paa-aktuel-plan-sha
slut-without-claude BLOKERET:claude-ai-approval-findes
```

### Opsætning F — Differentierede stier

**Valg:** Beslutnings-stier kræver Mathias; ramme-/transport-stier kan merge efter rolle-validering og grøn CI.

**Modsvar mod "alt kræver Mathias":** recon, plan og rapporthistorik klassificeres som ramme.

**Modsvar mod "intet kræver Mathias":** scripts, CODEOWNERS og disciplin klassificeres som beslutning.

**Terminaltest:**

```text
ramme docs/coordination/workflow-test-recon-kode.md
ramme docs/coordination/workflow-test-plan.md
beslutning scripts/kaede/dirigent.mjs
beslutning .github/CODEOWNERS
beslutning docs/strategi/disciplin.md
ramme docs/coordination/rapport-historik/2026-06-15-workflow-test.md
```

### Opsætning G — Kontrolleret konkurrence som modspilsrunde

**Valg:** Konkurrence bruges fast på afgørende valg, men kun som bevisbaseret modspil: opsætninger prøves mod kontrakt, tests og role reviews.

**Modsvar mod ingen konkurrence:** kontrakten kræver to modsvar; uden modspil vender første-løsning-svagheden tilbage.

**Modsvar mod permanent vinderkonkurrence:** delt arbejdstræ viste, at konkurrence uden isolation giver clobbering; "stærkest skrivende" kan se bedre ud end stærkest løsning. Derfor kræves blob/worktree-isolation og testmatrix.

**Terminaltest af de nødvendige sikkerhedsrammer:**

```text
code-recon-blob-ok
codex-recon-blob-ok
worktree /home/mathias/stork-2.0-code [claude/bud-code-workflow-faerdiggoerelse]
worktree /home/mathias/stork-2.0      [codex-bud-workflow-faerdiggoerelse]
```

### Opsætning H — Få sandheder + idé-hjem

**Valg:** Workflow-docs samles; pakke-artefakter er midlertidige; idéer må modsige, men må ikke styre.

**Modsvar mod nuværende coordination som levende sandhed:** recon viser blanding af gamle pakker, arkiv, forslag, status og aktivt workflow. Det skaber glid.

**Modsvar mod kun GitHub og ingen rapportdocs:** GitHub er detaljespor; slutrapporten er den menneskelige slutfortælling. Begge er nødvendige, men de må ikke dubleres som regler.

**Terminal-/repo-observation:** nuværende coordination-root rummer samtidig `gov-5-automation-*`, `rette-til-*`, `gov-6-forslag-og-udskudte.md`, `v4-slettede-docs/**`, `rapport-historik/**`, `aktiv-plan.md` og `seneste-rapport.md`. Det er ikke én sandhed; det er flere dokument-klasser i samme læseflade.

### Opsætning I — Evidens-register som primær pakke-sandhed

**Valg:** Hver pakke har et maskinlæsbar evidens-register. Slutrapporten er en læsbar projektion.

**Modsvar mod manuel slutrapport som primær sandhed:** recon og historik viser stale/status-afskriftsfejl. Registeret kan mekanisk bære SHA'er, PR'er, testnavne og review-refs.

**Modsvar mod kun GitHub som sandhed:** GitHub har detaljerne, men ikke den semantiske krav→plan→test-binding. Registeret binder GitHub-evidens til kravets mening.

**Terminaltest der viser behovet for mekanisk binding:**

```text
krav OK-hash ≠ fil-hash → krav-dok-merge BLOKERET
PASS bundet til FORKERT plan-SHA → BLOKERET
transport-vej: origin/main URØRT
```

### Opsætning J — Scale og budget som åbningsregel

**Valg:** Alle pakker får scale-determination ved åbning. Scale styrer artefaktdybde, review-cadence og loop-budget, men aldrig om krav/plan/slut-gates findes.

**Modsvar mod "alt kører tung kæde":** små pakker bruger færre runder og mindre dokumentdybde, så Mathias' friskhed ikke brændes på mekanik.

**Modsvar mod "ingen scale, bare agentens vurdering":** store/critical pakker får flere loops og stærkere artifacts, før arbejde må fortsætte.

**Terminaltest:**

```text
scale-1-file Small maxLoops 1
scale-6-files Large maxLoops 3
scale-critical Critical maxLoops 4
loop-overbudget BLOKERET:loop-budget
```

### Opsætning K — Regelprojektion + handoff-log

**Valg:** `docs/workflow/*` er sandhed. `CLAUDE.md` og `AGENTS.md` er genererede projektioner med samme checksum. `handoff.jsonl` er append-only evidence-view, og aktørstart kræver at seneste handoff er læst.

**Modsvar mod løse `CLAUDE.md`/`AGENTS.md`:** drift mellem regelfiler blokerer, i stedet for at to agenter kører forskellige regler tavst.

**Modsvar mod løs `CHANGES.log`:** handoff skal have package-id, schema og SHA/PR-binding; ellers er den note, ikke bevis.

**Terminaltest:**

```text
rule-projection OK:same-checksum
rule-drift BLOKERET:rules-checksum
handoff-missing BLOKERET:seneste-handoff-laest
handoff-read START-OK
```

### Opsætning L — PR-bundet cross-review-loop

**Valg:** Kombinationen af Codex og den anden tekniske aktør bruges som committet PR-loop: build → PR → uafhængig review → fix → re-review til grøn eller stop.

**Modsvar mod same-session review:** samme kontekst kan dele fejlantagelser; PR-review i frisk kontekst bevarer uafhængigheden.

**Modsvar mod one-pass review:** feltet viser, at værdien ofte opstår, når review-fund bliver rettet og re-reviewed; ét review uden loop taber den gevinst.

**Terminaltest:**

```text
review-no-pr BLOKERET:committed-pr-required
review-with-pr REVIEW-OK:committed-pr
loop-distinct LOOP-OK
loop-repeat BLOKERET:gentaget-fejlklasse-ejer-gate
```

## Slutkonklusion

Mit bud er ikke at pudse den nuværende kæde. Det er at gøre workflowet til Stork 2.0's build-kernel: en pakke-case med evidens-register, kontrolleret modspil, frosne aktørartefakter og fire aktør-godkendelser.

Den færdige løsning skal gøre syv ting ufravigelige:

1. **Alt vigtigt er frosset i GitHub, ikke i working tree.**
2. **Scale bestemmer procesdybde, ikke om hovedgates findes.**
3. **Pakke-sandheden bæres af evidens-register + GitHub, ikke manuel prosa.**
4. **Regler og handoff er filbaserede, genererede og checksum-/schema-validerede.**
5. **Afgørende valg og batches møder testet modspil på committede artefakter.**
6. **Alle tre AI-aktører har workflow-rolle og almindelig rolle.**
7. **Mathias' friskhed beskyttes ved at skære mekanik væk, ikke ved at skære hans beslutningsret væk.**

Konkurrence hører hjemme i workflowet som kontrolleret modspil på afgørende valg og som cross-review-loop på committede PR'er. Ikke som permanent show, ikke som alt-eller-intet-kamp, og aldrig uden test, budget og stop. Det er sådan konkurrencen løfter uden at belønne det der bare virker stærkest.
