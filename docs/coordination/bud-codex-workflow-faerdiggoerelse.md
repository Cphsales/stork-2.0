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

**pakkeåbning + foreløbig scale + regel-snapshot → actor-start-kontrakt → parallel recon med scale-signal → krav-hash → plan med scale-lock og modsvar → fire aktør-godkendelser → batch-build med review-pakke og cross-review/disposition-loop på committede PR'er → slutrapport med fire aktør-godkendelser → ren pakke-luk.**

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

Svageste led i mit tidligere bud var derfor Step 5: review var korrekt uafhængig, men ikke stærk nok som iterativ kæde. Første v2 ændrede det til et SHA-/PR-bundet cross-review-loop med budget og stop-regler. Den fulde kæde-gennemgang viser nu et mere præcist svagt led: ikke review alene, men **overgangen mellem led**. Scale kan være forkert efter recon, regler kan drive mellem aktører, og review kan mangle den pakke der gør et PR-fund handlingsbart. Derfor er v2 nu strammet på overgangene, ikke kun på enkeltfunktionerne.

### Helhedsgennemgang efter v2

| Kædepunkt                       | Feltets signal                                                                                                       | Helhedsvurdering                                                                                                      | Ændring i buddet                                                                                                         |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Scale som livscyklus            | DEV + begge workflow-repos bruger scale-routing, men store opgaver ændrer ofte form efter intake/recon.              | En åbning-scale alene kan under-scope en pakke; scale skal starte foreløbig, bekræftes efter recon og låses i planen. | `Step 0`, `Step 1`, `Step 3` ændres til `scale-provisional → scale-signal → scale-lock`.                                 |
| Actor-start som samlet kontrakt | GenAI-bridge, tap og DEV peger på filer/handoff/frisk kontekst som bro mellem heterogene agenter.                    | Regel-checksum, seneste handoff, korrekt SHA/PR og budget må ikke være fire løse checks; de skal være én startport.   | `Step 0`, `§2` og `§3` får actor-start-kontrakt, så ingen aktør starter et led med halv kontekst.                        |
| Review-pakke før cross-review   | TDS' PR-loop, GenAI-handoff og workflow-repoernes design/task/review-kæde viser, at review kræver stabilt materiale. | Uafhængig review kan blive støj, hvis reviewer kun ser diffen og ikke plan-slice, tests, evidens-delta og handoff.    | `Step 5` kræver review-pakke før review-request.                                                                         |
| Review-disposition efter fund   | TDS viser fix/re-review-værdien; Verdent og workflow-repos viser budget/quality-gates som værn mod uendelig drift.   | Et review-fund må hverken ignoreres tavst eller tvinge evigt loop; hvert fund skal klassificeres og lukkes synligt.   | `Step 5`, `§3`, `§4` og `§9` får dispositioner: blocker, fix-now, follow-up, false-positive-with-evidence, Mathias-gate. |
| Evidens-register som router     | tap og workflow-repos viser at artifact-protokoller virker, når næste handling kan udledes af status, ikke chat.     | Registeret skal ikke kun dokumentere efterfølgende; det skal drive næste lovlige led og stoppe manglende bevis.       | `§2`, `§3` og `§6` gør evidens-gap til routing-input.                                                                    |
| Rule-snapshot pr. pakke         | GenAI-bridge advarer indirekte mod drift i agentregler; tap viser at protokollen skal overleve parallel drift.       | Hvis workflow-regler ændres midt i en pakke, kan aktører godkende forskellige virkeligheder.                          | `Step 0`, `§3` og `§6` får rule-snapshot og rule-change gate.                                                            |

### Hvad feltet bekræfter urørt

- Fire aktør-godkendelser bliver stående. Kilderne løfter cross-review og filbaserede artefakter, men intet i feltet erstatter Mathias' krav/slutdom eller Claude.ai's krav-/meningsdom.
- Worktree/blob-isolation bliver stående. TDS, GenAI og tap peger alle mod PR/commit/worktree som samlingspunkt, ikke delt working tree.
- Evidens-register + GitHub bliver stående som sandhed. `CHANGES.log`/`handoff.md` er nyttige bro-formater, men feltet viser dem som transport/hukommelse, ikke som tilstrækkelig sandhed for Stork.
- Full Access/Goals bliver stående som fravalg for dømmekraft. Kilderne viser autonomi-værdi efter plan-gate, men også behov for budget, permission-snit og stop.
- Scale må stadig ikke fjerne hovedgates. Feltet bekræfter routing efter størrelse, men ingen kilde viser at små opgaver bør slippe krav-hash, plan-SHA eller slut OK.
- Samtidig multi-agent-build af samme batch bliver ikke indført. Feltet viser værdi i uafhængig review på committet PR; parallel skrivning på samme batch ville svække ejerskab, disposition og rollback.

## 1. Struktur

### Step 0 — Åbning, scale og isolering

**Funktioner:**

- Mathias åbner en **pakke-case** på en author-verificerbar kanal.
- Workflow-kernen opretter et entydigt pakke-id, evidens-register og aktør-workspaces.
- Workflow-kernen laver **foreløbig scale-determination**: Small, Medium, Large eller Critical.
- Scale starter som foreløbig procesvalg, bekræftes/ændres efter recon og låses først i plan-SHA. Scale styrer artefakt-dybde, review-cadence, budgetter og loop-grænser. Scale må aldrig fjerne krav-hash, plan-SHA eller slut-gate.
- Workflow-kernen tager et **rule-snapshot** af den gældende workflow-sandhed. Pakken kører på snapshot'et, medmindre en rule-change gate eksplicit åbnes.
- Workflow-kernen genererer/validerer regelprojektioner: `docs/workflow/*` er sandhed; `.claude/CLAUDE.md` og `AGENTS.md` er adapter-projektioner med samme checksum.
- Workflow-kernen opretter `handoff.jsonl` som append-only view af evidens-registeret; ingen aktør starter et led uden at læse seneste handoff.
- Workflow-kernen håndhæver en **actor-start-kontrakt** før hvert led: korrekt rule-snapshot/checksum, seneste handoff læst, korrekt pakke-id/SHA/PR-kontekst og budget tilbage.
- Hver aktør arbejder i egen branch/worktree.
- Alle aktør-artefakter læses fra committede blobs/origin-refs, ikke fra den aktuelle working tree.
- Preflight tjekker værktøjer, auth, mobil-modtagelse, stop-state, baseline, regel-drift, handoff-format og budgetprofil.

**Formål:** Første led skal forhindre det der allerede gik galt: delt arbejdstræ, mutable untracked filer og branch-flip der ændrer andres virkelighed.

**Output:** pakke-id, `scale-provisional`, evidens-register, handoff-log, aktør-branches/worktrees, rule-snapshot-id, regel-checksum, actor-start-kontrakt, budgetprofil, baseline, "klar til recon".

### Step 1 — Parallel recon før krav

**Funktioner:**

- Code-recon: faktisk repo/kode/docs/forretningslogik i koden.
- Codex-recon: uafhængig teknisk/verifikations-recon og feltmønstre.
- Claude.ai-recon: forretningssprog, vision, forretningsforståelse, Mathias-intentioner og spørgsmål.
- Recon-syntese: kun fund + åbne spørgsmål; ingen løsning, ingen plan.
- Hver recon leverer et **scale-signal**: om den foreløbige scale stadig passer, eller om fundene kræver op-/nedskalering.
- Recon-filer committes/pushes på aktørens egen branch og læses derefter fra blob.

**Formål:** Kravet skal være dækkende for alle forretningsfunktioner pakken rører, og kode-misforståelser skal opdages før plan.

**Output:** tre recon-filer + syntese + scale-signal + spørgsmål til Mathias.

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
- Planen låser scale som `scale-lock` og forklarer afvigelser fra åbningens foreløbige scale.
- Planen definerer review-pakkens minimumsindhold for hver batch: plan-slice, krav-id'er, diff/PR, test-output, evidens-delta, handoff-resumé og budgetstatus.
- Planen definerer review-dispositioner, så hvert review-fund skal lukkes som blocker, fix-now, follow-up, false-positive-with-evidence eller Mathias-gate.
- Planen fastlægger review-loopets kadence: hvilke batches kræver cross-review, maksimal antal fix/review-runder før stop, og hvilken scale der kræver ekstra review.
- For hvert afgørende valg skal planen indeholde:
  - valgt opsætning,
  - to andre opsætninger,
  - testet modsvar mod begge,
  - hvorfor tabende opsætninger ikke vælges,
  - hvilke tabende indvendinger der bliver til værn.

**Konkurrence-mekanikkens plads:** Den skal være fast i planfasen for afgørende valg, men ikke som "bedste retoriske bud vinder". Den skal hedde **modspilsrunde**: to eller flere opsætninger prøves mod kontrakten og terminal-/repo-beviser, og den stærkeste evidens vinder. En tabende opsætning efterlades ikke som affald; dens bedste indvendinger bliver tests, gates eller fravalg.

**Formål:** Første-løsning-svagheden dør først, når konkurrerende opsætninger faktisk skal slå hinanden på bevis.

**Output:** plan-SHA med `scale-lock`, modsvarsmatrix, krav→plan→test-bindinger, review-pakke-kontrakt, review-dispositioner, batch-/review-loop-kadence og budgetprofil.

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
- Hver PR får en **review-pakke** før review-request: plan-SHA, plan-slice, krav-id'er, diff/PR-link, test-output, evidens-delta, seneste handoff-resumé og budgetstatus.
- Cross-review-loopet kører sådan: build → commit/PR → uafhængig review i frisk kontekst → fix-commit → re-request review → gentag til grøn eller stop.
- Loopet er bounded: scale bestemmer max-runder; samme fejlklasse to gange i træk udløser stop/ejer-gate i stedet for mere automatik.
- Hvert review-fund får en **review-disposition** i evidens-registeret: `BLOCKER`, `FIX-NOW`, `FOLLOW-UP`, `FALSE-POSITIVE-WITH-EVIDENCE` eller `MATHIAS-GATE`. Builder må ikke ignorere fund tavst; reviewer må ikke gøre smag til blocker uden kontrakt/test/krav-belæg.
- Mekaniske checks kører før frys: hash/SHA, ordret-diff, status/counter, filklasse, link/marker/deklaration.
- Hver batch opdaterer evidens-registeret: hvilke krav/planpunkter blev dækket, hvilke tests/reviews beviser det, og hvilke åbne huller står tilbage.
- Codex reviewer hver batch read-only som teknisk verifikator, når Code har bygget; hvis Codex bygger et teknisk batch-artefakt, skal Code-review køre mod den committede PR efter samme princip.
- Claude.ai kaldes kun ind, når batchen rejser krav-/meningsspørgsmål eller skal oversætte Mathias-gate.
- Mathias kaldes kun ind på beslutninger der er hans.

**Formål:** Fejl, bordbrud og kædebrud fanges ved det led de opstår, ikke som slutrapport-overraskelse.

**Output:** batch-commits/PR'er, review-pakker, review-artefakter, review-dispositioner, fix-commits, loop-resultat, eventuelle fund-gates.

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

Kæden skal kobles med fjorten bærende bindinger:

1. **Pakke-id-binding:** alle artefakter, events og reviews hører til et bestemt pakke-id.
2. **Scale-livscyklus-binding:** scale går fra `scale-provisional` til recon `scale-signal` til planens `scale-lock`; den bestemmer procesdybde, budget og review-kadence, men ikke om hovedgates findes.
3. **Rule-snapshot-binding:** pakken peger på det workflow-snapshot den kører efter; midt-pakke regelændring kræver rule-change gate.
4. **Regel-binding:** `docs/workflow/*` genererer `CLAUDE.md` og `AGENTS.md`; checksum-drift blokerer.
5. **Actor-start-binding:** ingen aktør starter et led uden samme pakke-id, rule-snapshot, seneste handoff, korrekt SHA/PR-kontekst og budget tilbage.
6. **Handoff-binding:** hver aktør læser seneste `handoff.jsonl`-event før start og skriver et nyt event ved led-luk.
7. **Blob-binding:** aktører læser hinandens leverancer fra commits/origin-refs, ikke fra mutable working tree.
8. **Hash-binding:** Mathias' krav OK peger på et konkret krav-dok.
9. **SHA-binding:** plan- og review-godkendelser peger på en konkret plan.
10. **PR-binding:** cross-review kører på committet PR/diff, ikke på den byggende agents session.
11. **Review-pakke-binding:** review-request må kun sendes, når PR'en har plan-slice, krav-id'er, tests, evidens-delta, handoff-resumé og budgetstatus.
12. **Review-disposition-binding:** hvert review-fund får en synlig disposition; uafklarede fund blokerer batch-luk.
13. **Gate-binding:** hvert stop har en ejer: Code, Codex, Claude.ai eller Mathias.
14. **Evidens-binding:** krav, planpunkt, test, review, commit, handoff, disposition og slutrapport bindes i ét register, og manglende binding router næste handling.

Ingen del må alene kunne bære flowet:

- Recon uden krav er kun input.
- Scale uden krav må kun vælge procesdybde.
- Scale uden recon-bekræftelse må ikke låse plan.
- Actor-start uden rule-snapshot/handoff/SHA/budget er ikke aktivering.
- Regelfiler uden checksum kan drive og må ikke aktivere roller.
- Handoff-log uden commit/PR er kun note, ikke bevis.
- Krav uden hash må ikke planlægges.
- Plan uden modspil må ikke godkendes.
- Modspil uden test er kun mening.
- Test uden aktør-dømmekraft er kun prefilter.
- Review uden PR/SHA og review-pakke kan ikke starte eller lukke batch.
- Review-fund uden disposition er et åbent hul, ikke en afsluttet review.
- Slutrapport uden fire aktør-godkendelser kan ikke lukke pakken.
- Slutrapport uden evidens-register er prosa, ikke bevis.

## 3. Automatisering

### Automatiseres

- Event-opdagelse.
- Scale-determination efter deklarerede heuristikker.
- Scale-signal sammenlignes mod foreløbig scale, og scale-lock valideres mod planen.
- Rule-snapshot oprettes ved pakkeåbning og sammenlignes ved aktørstart.
- Generering og drift-check af `CLAUDE.md`/`AGENTS.md` fra workflow-sandheden.
- Handoff-log append, format-check og "seneste handoff læst"-check.
- Actor-start-kontrakt: pakke-id, snapshot, checksum, handoff, SHA/PR-kontekst og budget.
- Dispatch til aktørernes workflow-roller.
- Status, led-log og notifikationer.
- Evidens-registerets mekaniske felter: commits, SHA'er, PR'er, testnavne, review-refs, åbne gates.
- Evidens-gap routing: manglende kravbinding, test, review-pakke eller disposition sender pakken til det led der ejer hullet.
- Transport-PR'er, review-request og re-request efter fix.
- Review-pakke format-check før review-request.
- Review-disposition format-check og "ingen uafklarede blocker/fix-now"-check før batch-luk.
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
- **Actor-start:** mismatch i pakke-id, rule-snapshot, checksum, handoff-read, SHA/PR-kontekst eller budget blokerer før aktøren må arbejde.
- **Recon:** syntese blokerer uden alle krævede recon-kilder; scale-signal uden belæg må ikke ændre scale.
- **Krav:** hash mismatch blokerer.
- **Plan:** manglende scale-lock, modsvar, utestede modsvar, review-pakke-kontrakt, review-dispositioner, review-kadence eller budgetprofil blokerer.
- **Godkendelse:** PASS/APPROVAL på forkert SHA blokerer.
- **Build:** batch-review, selftest, committet PR og review-pakke før review; adapter-fejl stopper.
- **Cross-review-loop:** samme fejlklasse to gange, konflikt mellem review og plan, manglende review-disposition eller loop-budget udløber stopper og tildeler ejer.
- **Rule-change:** workflow-regelændring midt i en pakke kræver rule-change gate; ellers kører pakken videre på åbningens snapshot.
- **Gate:** åben Mathias-gate pauser sporet.
- **Slut:** manglende Claude.ai/Codex/Code/Mathias-godkendelse blokerer luk.

## 4. Kontrolposter

### Mathias kaldes ind

- Pakkeåbning.
- Krav-validering (`krav OK <hash>`).
- Planens hvad-gate, hvis planen har reelle valg der kræver hans accept.
- Fund-gates: formål, scope, forretningsregel, risikoaccept, workaround.
- Scale-override kun hvis `scale-lock` ændrer hvor meget af hans forretningsrisiko der vurderes nu; ikke for mekanisk filantal.
- Review-fund med disposition `MATHIAS-GATE`, når fundet handler om hvad, risiko, scope eller accept af en workaround.
- Beslutnings-sti-review: workflow-regler, stamme-docs, kode, DB, scripts, GitHub protection/adgang.
- Slut OK.

### Mathias holdes ude af

- Actor-relæ.
- Branch-/worktree-skift.
- Statusbogføring.
- Transport-PR'er på ramme-stier.
- Genkørsler efter mekaniske fejl.
- Cross-review-retry og re-request efter tekniske fix.
- Klassifikation af tekniske review-fund som `FIX-NOW`, `FOLLOW-UP` eller `FALSE-POSITIVE-WITH-EVIDENCE`, medmindre dispositionen peger på hans beslutningsflade.
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
      actor-start-kontrakt.md
      evidens-register.schema.json
      rule-projection.schema.json
      review-disposition.schema.json
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
        evidence.json
        handoff.jsonl
        status.json      # genereret/projektion af evidence.json
        recon/
          code.md
          codex.md
          claude-ai.md
        review-packages/
          <batch>.json
        reviews/
        review-dispositions.jsonl
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
- `docs/workflow/actor-start-kontrakt.md`: minimumskrav før en aktør må starte et led.
- `docs/workflow/evidens-register.schema.json`: krav→plan→test→review→gate-kontrakt.
- `docs/workflow/rule-projection.schema.json`: checksum og genereringskontrakt for `CLAUDE.md`/`AGENTS.md`.
- `docs/workflow/review-disposition.schema.json`: lovlige review-dispositioner og lukke-regler.
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

### Fravalgt: parallel skrivning på samme batch

Feltet viser værdi i uafhængig review på committet PR, ikke i at to tekniske aktører skriver samme batch samtidig. Samtidig skrivning kan se hurtigere ud, men svækker ejerskab, review-disposition, rollback og krav→plan→test-binding.

### Fravalgt: review-fund som automatisk blocker

Alle review-fund skal lukkes, men ikke alle fund skal stoppe pakken. Automatisk blocker-status ville gøre cross-review-loopet tungt og belønne støj; disposition med belæg holder både uafhængigheden og fremdriften.

### Fravalgt: realtidsnotifikation som gate

tap viser at notifikationer er nyttig transport, men en notifikation er ikke author-, SHA- eller krav-bevis. Stork kan bruge notifikationer til opmærksomhed, men gate-status bor i evidens-registeret og GitHub.

### Fravalgt: scale som shortcut udenom hovedgates

Scale skal beskytte Mathias' friskhed og vælge procesdybde. Hvis Small får lov til at springe krav-hash, plan-SHA eller slut OK over, bliver routing til governance-lækage.

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

Helhedskædens nye overgange sanity-testet i terminalen:

```text
scale-lifecycle Small->Medium->Medium
scale-critical Critical->Critical->Critical
actor-start-ok START-OK:actor-start-contract
actor-start-drift BLOKERET:actor-start-contract
review-package-ok REVIEW-REQUEST-OK:review-package
review-package-missing BLOKERET:review-package:planSlice,requirements,evidenceDelta,handoffSummary,budget
disposition-fix DISPOSITION-OK:FIX-NOW
disposition-false-positive BLOKERET:false-positive-evidence
disposition-mathias DISPOSITION-OK:MATHIAS-GATE
rule-change-without-gate BLOKERET:rule-change-gate
rule-change-with-gate RULE-SNAPSHOT-OK
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

### Opsætning J — Scale og budget som livscyklus

**Valg:** Alle pakker får foreløbig scale-determination ved åbning, scale-signal efter recon og scale-lock i planen. Scale styrer artefaktdybde, review-cadence og loop-budget, men aldrig om krav/plan/slut-gates findes.

**Modsvar mod "alt kører tung kæde":** små pakker bruger færre runder og mindre dokumentdybde, så Mathias' friskhed ikke brændes på mekanik. Hvis recon viser større blast radius, opskaleres pakken før plan-lock.

**Modsvar mod "ingen scale, bare agentens vurdering":** store/critical pakker får flere loops og stærkere artifacts, før arbejde må fortsætte. Scale er ikke en engangs-mavefornemmelse; den skal efterprøves mod recon.

**Terminaltest:**

```text
scale-1-file Small maxLoops 1
scale-6-files Large maxLoops 3
scale-critical Critical maxLoops 4
loop-overbudget BLOKERET:loop-budget
scale-lifecycle Small->Medium->Medium
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
actor-start-ok START-OK:actor-start-contract
actor-start-drift BLOKERET:actor-start-contract
rule-change-without-gate BLOKERET:rule-change-gate
```

### Opsætning L — PR-bundet cross-review-loop med review-pakke

**Valg:** Kombinationen af Codex og den anden tekniske aktør bruges som committet PR-loop: build → PR med review-pakke → uafhængig review → disposition → fix/re-review eller gate → grøn eller stop.

**Modsvar mod same-session review:** samme kontekst kan dele fejlantagelser; PR-review i frisk kontekst bevarer uafhængigheden.

**Modsvar mod one-pass review:** feltet viser, at værdien ofte opstår, når review-fund bliver rettet og re-reviewed; ét review uden loop taber den gevinst.

**Modsvar mod review uden pakke/disposition:** det kan give mange fund, men ikke en stabil kæde. Review-pakken sikrer at reviewer ser kontrakt, tests og evidens; dispositionen sikrer at fund lukkes uden tavs ignorering eller uendelig churn.

**Terminaltest:**

```text
review-no-pr BLOKERET:committed-pr-required
review-with-pr REVIEW-OK:committed-pr
loop-distinct LOOP-OK
loop-repeat BLOKERET:gentaget-fejlklasse-ejer-gate
review-package-ok REVIEW-REQUEST-OK:review-package
review-package-missing BLOKERET:review-package:planSlice,requirements,evidenceDelta,handoffSummary,budget
disposition-fix DISPOSITION-OK:FIX-NOW
disposition-false-positive BLOKERET:false-positive-evidence
```

### Opsætning M — Overgangskontrakter som samlet kæde

**Valg:** De stærkeste feltmønstre samles som overgangskontrakter: scale-livscyklus, actor-start, review-pakke, review-disposition og rule-snapshot.

**Modsvar mod isolerede gode led:** et stærkt review-loop hjælper ikke, hvis scale er forkert, aktøren starter på driftede regler eller review mangler plan/test/evidens. Overgangskontrakterne binder leddene, så næste aktør får det samme verificerede billede som forrige led lukkede på.

**Modsvar mod at tilføje alt feltet:** notifikationer, full-access loops og parallel skrivning kan styrke transport eller hastighed, men svækker author-bevis, dømmekraft, ejerskab og rollback. Derfor bruges de kun som sekundær transport, ikke som kædebærere.

**Terminaltest:**

```text
scale-lifecycle Small->Medium->Medium
actor-start-ok START-OK:actor-start-contract
actor-start-drift BLOKERET:actor-start-contract
review-package-ok REVIEW-REQUEST-OK:review-package
disposition-mathias DISPOSITION-OK:MATHIAS-GATE
rule-change-without-gate BLOKERET:rule-change-gate
```

## Slutkonklusion

Mit bud er ikke at pudse den nuværende kæde. Det er at gøre workflowet til Stork 2.0's build-kernel: en pakke-case med evidens-register, kontrolleret modspil, frosne aktørartefakter og fire aktør-godkendelser.

Den færdige løsning skal gøre ni ting ufravigelige:

1. **Alt vigtigt er frosset i GitHub, ikke i working tree.**
2. **Scale er en livscyklus fra foreløbig vurdering til recon-signal til plan-lock.**
3. **Scale bestemmer procesdybde, ikke om hovedgates findes.**
4. **Pakke-sandheden bæres af evidens-register + GitHub, ikke manuel prosa.**
5. **Regler, handoff og actor-start er filbaserede, genererede og checksum-/schema-validerede.**
6. **Afgørende valg og batches møder testet modspil på committede artefakter.**
7. **Cross-review kræver review-pakke og synlig disposition for hvert fund.**
8. **Alle tre AI-aktører har workflow-rolle og almindelig rolle.**
9. **Mathias' friskhed beskyttes ved at skære mekanik væk, ikke ved at skære hans beslutningsret væk.**

Konkurrence hører hjemme i workflowet som kontrolleret modspil på afgørende valg og som cross-review-loop på committede PR'er. Ikke som permanent show, ikke som alt-eller-intet-kamp, og aldrig uden test, budget og stop. Det er sådan konkurrencen løfter uden at belønne det der bare virker stærkest.
