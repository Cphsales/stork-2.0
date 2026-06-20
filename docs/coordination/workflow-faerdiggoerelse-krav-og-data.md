# workflow-færdiggørelse — Krav-og-data

**Type:** Mathias' krav til hvad workflowet skal kunne
**Dato:** 2026-06-16 · **Status:** UDKAST — intet låst, krav OK ikke givet. Navnet (v6/gov-6) er ligegyldigt; budskabet er ét.

## Formål

> Denne pakke fuldender workflowet. Vi har bygget gov-1 til gov-5; dette er det sidste step. Her samler vi trådene fra de tidligere byg og gør workflowet færdigt — så vi står tilbage med ét workflow, der sikrer at Stork bygges korrekt og efter hensigten.

## Sådan skal det bygges

Det nuværende workflow — både det der står i docs, og det der ligger i kode — er **ikke** fundamentet vi bygger videre på. Det er kun inspiration, på nøjagtig samme niveau som en søgning på nettet eller et kig i aktørernes egne indstillinger.

Grunden er enkel: bygger vi videre på det nuværende, arver vi også svagheden bag det — at den første løsning, der virker, er den vi går med. Det er præcis den svaghed dette step skal være fri af. Derfor starter vi ikke fra det eksisterende; vi leder bredt efter funktioner — i docs, i kode, på nettet og i hver aktørs egne indstillinger — med ét krav til søgningen: vi finder funktioner der berører **alle** aktører, ikke kun én.

## Krav-dok og plan — hvad hører hvor

Dette dokument er kravene til løsningen: hvad workflowet skal kunne. Selve løsningen ligger i planen. Det er dér det afgøres hvilke funktioner der tages i brug, og hvornår. Planen skal derfor beskrive workflowet **step for step** — hvilke funktioner der bruges, og på hvilket sted i flowet.

## Krav

**1. Funktioner bygges grundigt**
Hver funktion workflowet bruger bygges grundigt. Teksten/opbygningen af funktionen er afgørende for outputtet — funktioner der kun ser gode ud på papiret er ikke acceptable; de skal virke og være gode.

**2. Kæden hænger sammen**
Kæden er vision+forretning = krav = plan = slut, tro hele vejen. Mathias ejer vision+forretning og krav; det er hvad build skal overholde. Vision+forretning er låste docs; krav laves først og låses ved Mathias' krav OK. Eksisterende kode/build må ikke ændres uden Mathias' tydelige godkendelse — sker det, stop. Claude.ai's fornemmeste opgave er at hjælpe Mathias med at skrive krav og forstå det nuværende forretnings-build holdt op mod Mathias' ønsker til fremtiden.

**3. Fejl fanges løbende**
Fejl fanges løbende under hele workflowet, ikke til sidst. Et brud fanges mekanisk, af en anden aktør, eller af aktøren selv — flere mekanismer må gerne være i spil på én gang. Der testes ikke for at få grønt: fangsten af fejl er det der afgør om et build er korrekt.

**4. Forretnings-recon før krav og kode-recon før plan**
Før krav og plan skrives, laver workflowet fuld recon af hvad pakken berører. Reconen stopper ikke ved første fund — den kortlægger det hele.

**5. Fire-aktør-godkendelse**
Krav, plan og slut godkendes af alle fire aktører, og **Mathias godkender sidst** — hans godkendelse sker først efter de tre andre har godkendt. Mathias' ord er overordnet og kan altid overrule (ny information eller en bedre idé kan opstå undervejs).

Opstår der i plan eller build en modsigelse mod krav, vision eller forretning, stopper forløbet, og Mathias retter det sammen med Claude.ai før videre godkendelse. AI-aktørerne retter aldrig selv en modsigelse mod de styrende dokumenter.

**6. Mathias' bord**
Mathias' bord er ikke kode. Det er udelukkende hvad systemet skal kunne — ikke hvordan/kode. Mathias tager stilling til krav-dok, og derfor skal alle spørgsmål til ham omhandle hans bord. Alt i krav-dok skal være tydeligt godkendt af Mathias.

Ved krav præsenteres den samlede recon for Mathias til validering eller spørgsmål. De funktioner/forretningsdele pakken berører kortlægges gennem recon og fremlægges sådan — "Pakken berører disse forretningsdele":

_Nuværende kode:_

1. x er bygget på denne måde i koden — er det korrekt?
2. osv.

_Ikke bygget endnu / dokument-info:_

1. pakken bygger x, og dokument y siger dette — er det korrekt?
2. osv.

_Intet data:_

1. Pakken berører x, og der er intet data om det — hvad skal x kunne?

**7. Roller**
Workflowet har fire aktører: Mathias, Claude.ai, Code og Codex. De tre AI-aktører har hver to rolle-typer — en workflow-rolle og en almindelig rolle. Mathias skal nemt kunne styre hvilken rolle der er aktiv via en simpel prompt. Claude.ai er Mathias' nærmeste partner og skal hjælpe med at holde det uoverskuelige — tekst, kode og lignende — simpelt for Mathias.

**8. Docs og repo**
Repoet holdes rent gennem hele workflowet: hvert dokument har ét formål, ingen dubletter, én sandhed. En færdig pakke efterlader main som det fulde spor — der skrives ikke dokumentering oven på en validering der allerede er sket.

**9. Flow og gates**
Mathias starter workflowet med én simpel prompt (qwers). Derefter aktiveres alle aktører, og det kører af sig selv indtil Mathias præsenteres for forretnings-recon og det der skal valideres. Mathias og Claude.ai laver krav sammen; når kravet er færdigt, uploades det og valideres af de tre andre aktører — Mathias får besked om godkendt, eller om spørgsmål/andet. Ved Mathias' krav OK kører alt af sig selv indtil plan, hvor det stopper for Mathias' plan OK; ved OK kører alt af sig selv indtil build, hvor det stopper for Mathias' build OK. Grænsen består under flowet: det der kører af sig selv, er transport — at flytte, samle og fremlægge. Dømmekraft kører aldrig af sig selv; hver aktørs validering forbliver fuld og udføres af aktøren. Det fjerner det mekaniske dræn, så Mathias kun kaldes ind ved sine gates og hans friskhed bevares.

**10. Master-plan styrer retning**
Master-planen bestemmer den overordnede retning og opdateres løbende. Ændringer i master-planen — og modsigelser mod den — kræver Mathias' tydelige godkendelse.

**11. Rammen for pakken**
Vi har ikke et workflow der virker endnu, så de to bud fra Code og Codex er retningen, sammen med Mathias' tre styrende docs: vision-og-principper, forretningsforståelse og krav.

## IKKE i scope

- Stork-forretningsfeatures (løn, salg, vagter, provision) — dette er workflow-infrastruktur, ikke domæne.
- Vision og forretningsforståelse som genstand for ombygning — de er ankeret, ikke til revision her.

## Idé-liste (kandidater — ideer, ikke krav)

Denne liste er en del af krav-dokket, men er **ideer, ikke krav**. Den er input til planen — kandidater, intet valgt. Kataloget er startpunkt, ikke eneste grundlag: der søges også på nettet og i aktørernes egne indstillinger, og søgningen skal ramme alle aktører.

**Claude Code-egenskaber:** Hooks · /goal · .claude/rules/ · Skills · Codex-plugin · /loop · Statusline · Checkpointing (/rewind) · --from-pr · /doctor + /context + /memory · Sandboxing · Headless · Agent SDK · Agent view · Agent teams · Workflows · ultrareview · Routines · Worktrees · Auto mode · Computer use.

**Codex-opsætning:** model + reasoning_effort · approval_policy · sandbox_mode · network_access · github-plugin · trust_level pr. projekt.
