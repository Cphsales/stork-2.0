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

**åbning → parallel recon → krav-hash → konkurrerende modsvar på afgørende valg → plan-SHA → fire aktør-godkendelser → batch-build med led-validering → slutrapport med fire aktør-godkendelser → ren pakke-luk.**

Min store satsning: workflowet skal have et **evidens-register** som første-klasses objekt. Ikke et dokument der fortæller hvad der skete, men en pakke-ledger der løbende binder krav-sætninger, plan-valg, modsvar, commits, tests, reviews og gates sammen. Slutrapporten bliver en læsbar projektion af registeret, ikke endnu et manuelt sandhedsdokument.

## 1. Struktur

### Step 0 — Åbning og isolering

**Funktioner:**

- Mathias åbner en **pakke-case** på en author-verificerbar kanal.
- Workflow-kernen opretter et entydigt pakke-id, evidens-register og aktør-workspaces.
- Hver aktør arbejder i egen branch/worktree.
- Alle aktør-artefakter læses fra committede blobs/origin-refs, ikke fra den aktuelle working tree.
- Preflight tjekker værktøjer, auth, mobil-modtagelse, stop-state og baseline.

**Formål:** Første led skal forhindre det der allerede gik galt: delt arbejdstræ, mutable untracked filer og branch-flip der ændrer andres virkelighed.

**Output:** pakke-id, evidens-register, aktør-branches/worktrees, baseline, "klar til recon".

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
- For hvert afgørende valg skal planen indeholde:
  - valgt opsætning,
  - to andre opsætninger,
  - testet modsvar mod begge,
  - hvorfor tabende opsætninger ikke vælges,
  - hvilke tabende indvendinger der bliver til værn.

**Konkurrence-mekanikkens plads:** Den skal være fast i planfasen for afgørende valg, men ikke som "bedste retoriske bud vinder". Den skal hedde **modspilsrunde**: to eller flere opsætninger prøves mod kontrakten og terminal-/repo-beviser, og den stærkeste evidens vinder. En tabende opsætning efterlades ikke som affald; dens bedste indvendinger bliver tests, gates eller fravalg.

**Formål:** Første-løsning-svagheden dør først, når konkurrerende opsætninger faktisk skal slå hinanden på bevis.

**Output:** plan-SHA med modsvarsmatrix og krav→plan→test-bindinger.

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
- Mekaniske checks kører før frys: hash/SHA, ordret-diff, status/counter, filklasse, link/marker/deklaration.
- Hver batch opdaterer evidens-registeret: hvilke krav/planpunkter blev dækket, hvilke tests/reviews beviser det, og hvilke åbne huller står tilbage.
- Codex reviewer hver batch read-only.
- Claude.ai kaldes kun ind, når batchen rejser krav-/meningsspørgsmål eller skal oversætte Mathias-gate.
- Mathias kaldes kun ind på beslutninger der er hans.

**Formål:** Fejl, bordbrud og kædebrud fanges ved det led de opstår, ikke som slutrapport-overraskelse.

**Output:** batch-commits/PR'er, review-artefakter, eventuelle fund-gates.

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

Kæden skal kobles med seks bærende bindinger:

1. **Pakke-id-binding:** alle artefakter, events og reviews hører til et bestemt pakke-id.
2. **Blob-binding:** aktører læser hinandens leverancer fra commits/origin-refs, ikke fra mutable working tree.
3. **Hash-binding:** Mathias' krav OK peger på et konkret krav-dok.
4. **SHA-binding:** plan- og review-godkendelser peger på en konkret plan.
5. **Gate-binding:** hvert stop har en ejer: Code, Codex, Claude.ai eller Mathias.
6. **Evidens-binding:** krav, planpunkt, test, review, commit og slutrapport bindes i ét register.

Ingen del må alene kunne bære flowet:

- Recon uden krav er kun input.
- Krav uden hash må ikke planlægges.
- Plan uden modspil må ikke godkendes.
- Modspil uden test er kun mening.
- Test uden aktør-dømmekraft er kun prefilter.
- Review uden SHA kan ikke starte build.
- Slutrapport uden fire aktør-godkendelser kan ikke lukke pakken.
- Slutrapport uden evidens-register er prosa, ikke bevis.

## 3. Automatisering

### Automatiseres

- Event-opdagelse.
- Dispatch til aktørernes workflow-roller.
- Status, led-log og notifikationer.
- Evidens-registerets mekaniske felter: commits, SHA'er, PR'er, testnavne, review-refs, åbne gates.
- Transport-PR'er og review-request.
- Baseline og idempotens.
- Hash/SHA/deklaration/marker/fileclass/selftest.
- Stop ved ukendt event/type/modtager.
- Stop ved divergens, stale spor eller halvskrevet leverance.

### Automatiseres aldrig

- Mathias' krav, slut OK og forretningsafgørelser.
- Claude.ai's krav-/meningsdom.
- Codex' tekniske review-dom.
- Codes tekniske valg inden for godkendt krav.
- Valget om at acceptere en risiko, et scope-skift eller en workaround.

### Fejl-fangst ved hvert led

- **Åbning:** forkert author ignoreres; pakke-id kræves.
- **Recon:** syntese blokerer uden alle krævede recon-kilder.
- **Krav:** hash mismatch blokerer.
- **Plan:** manglende modsvar eller utestede modsvar blokerer.
- **Godkendelse:** PASS/APPROVAL på forkert SHA blokerer.
- **Build:** batch-review og selftest før frys; adapter-fejl stopper.
- **Gate:** åben Mathias-gate pauser sporet.
- **Slut:** manglende Claude.ai/Codex/Code/Mathias-godkendelse blokerer luk.

## 4. Kontrolposter

### Mathias kaldes ind

- Pakkeåbning.
- Krav-validering (`krav OK <hash>`).
- Planens hvad-gate, hvis planen har reelle valg der kræver hans accept.
- Fund-gates: formål, scope, forretningsregel, risikoaccept, workaround.
- Beslutnings-sti-review: workflow-regler, stamme-docs, kode, DB, scripts, GitHub protection/adgang.
- Slut OK.

### Mathias holdes ude af

- Actor-relæ.
- Branch-/worktree-skift.
- Statusbogføring.
- Transport-PR'er på ramme-stier.
- Genkørsler efter mekaniske fejl.
- Hvordan-spørgsmål.
- Konkurrencebedømmelse på teknik; den afgøres af kontrakt, tests og aktørernes rolleansvar.

### Fire-aktør-godkendelser

- **Krav:** Mathias krav OK; Claude.ai kravtekst/mening; Code byggelighedsfakta; Codex teknisk realiserbarhedsfakta.
- **Plan:** Code plan-ready; Codex APPROVAL; Claude.ai PASS; Mathias hvad-gate når påkrævet.
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

- **Workflow-rolle:** uafhængig read-only reviewer, adversarial modspil, teknisk realiserbarhedsdom, docs-/workflow-sandhedstjek.
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
- **Pakke-artefakt:** midlertidigt indtil pakke-luk.
- **Evidens-register:** maskinlæsbar pakke-ledger.
- **Historik:** slutrapporter + GitHub.
- **Idé:** må modsige, må aldrig styre.

### Foreslået mappestruktur

```text
docs/
  strategi/
    vision-og-principper.md
    forretningsforstaaelse.md
    stork-2-0-master-plan.md
  workflow/
    workflow.md
    roller.md
    gates.md
    artefakt-kontrakt.md
    evidens-register.schema.json
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
      status.json        # genereret/projektion af evidence.json
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
- `docs/workflow/artefakt-kontrakt.md`: markers, `→NÆSTE`, hash/SHA, filnavne.
- `docs/workflow/evidens-register.schema.json`: krav→plan→test→review→gate-kontrakt.
- `scripts/**` eller tilsvarende maskinlæsbar regelbog: den eksekverbare del.
- Adapter-docs: kun aktivering/pointer, ikke rolleindhold.

### Hvad er udenom

- Strategi-docs er anker, ikke workflow-regler.
- Tekniske docs er reference/gæld, ikke proces.
- Idé-docs er lovlige modsigelser, tydeligt mærket.
- Slutrapporter er historik, ikke nye regler.

### Slette-/flytteplan

- `docs/coordination/v4-slettede-docs/**`: ud af levende repo; git-history er default hjem.
- Gamle pakke-planer/krav i `docs/coordination/arkiv/**`: slettes eller flyttes til history kun hvis slutrapport ikke dækker.
- `gov-5-automation-*` og `rette-til-*`: behold kun indtil workflow-færdiggørelse lukker; derefter slutrapport/history eller slet.
- `gov-6-forslag-og-udskudte.md`: opløses i krav/plan eller `docs/ideas/workflow/`.
- `aktiv-plan.md` og `seneste-rapport.md`: erstattes af genereret current-state eller én kort pointer.
- `docs/claude-ai/SKILL.md`: behold kun som ren adapter/pointer.
- `docs/codex/sandbox-opsaetning.md`: teknisk reference, ikke workflow-regel.

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

## 8. Modsvar med testede knudepunkter

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

## Slutkonklusion

Mit bud er ikke at pudse den nuværende kæde. Det er at gøre workflowet til Stork 2.0's build-kernel: en pakke-case med evidens-register, kontrolleret modspil, frosne aktørartefakter og fire aktør-godkendelser.

Den færdige løsning skal gøre fire ting ufravigelige:

1. **Alt vigtigt er frosset i GitHub, ikke i working tree.**
2. **Pakke-sandheden bæres af evidens-register + GitHub, ikke manuel prosa.**
3. **Afgørende valg møder testet modspil.**
4. **Alle tre AI-aktører har workflow-rolle og almindelig rolle.**
5. **Mathias' friskhed beskyttes ved at skære mekanik væk, ikke ved at skære hans beslutningsret væk.**

Konkurrence hører hjemme i workflowet som kontrolleret modspil på afgørende valg. Ikke som permanent show, ikke som alt-eller-intet-kamp, og aldrig uden test. Det er sådan konkurrencen løfter uden at belønne det der bare virker stærkest.
