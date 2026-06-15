# workflow-færdiggørelse — Krav-og-data

**Type:** Mathias' krav til hvad workflowet skal kunne
**Dato:** 2026-06-15 · **Status:** UDKAST — intet låst, krav OK ikke givet. Navnet (v6/gov-6) er ligegyldigt; budskabet er ét.

## Formål

> Denne pakke fuldender workflowet. Vi har bygget gov-1 til gov-5; dette er det sidste step. Her samler vi trådene fra de tidligere byg og gør workflowet færdigt — så vi står tilbage med ét workflow, der sikrer at Stork bygges korrekt og efter hensigten.

## Sådan skal det bygges

Det nuværende workflow — både det der står i docs, og det der ligger i kode — er **ikke** fundamentet vi bygger videre på. Det er kun inspiration, på nøjagtig samme niveau som en søgning på nettet eller et kig i aktørernes egne indstillinger.

Grunden er enkel: bygger vi videre på det nuværende, arver vi også svagheden bag det — at den første løsning, der virker, er den vi går med. Det er præcis den svaghed dette step skal være fri af. Derfor starter vi ikke fra det eksisterende; vi leder bredt efter funktioner — i docs, i kode, på nettet og i hver aktørs egne indstillinger — med ét krav til søgningen: vi finder funktioner der berører **alle** aktører, ikke kun én.

## Krav-dok og plan — hvad hører hvor

Dette dokument er kravene til løsningen: hvad workflowet skal kunne. Selve løsningen ligger i planen. Det er dér det afgøres hvilke funktioner der tages i brug, og hvornår. Planen skal derfor beskrive workflowet **step for step** — hvilke funktioner der bruges, og på hvilket sted i flowet.

## Workflowet skal kunne

- Validere at vision+forretning, krav, plan og slut hænger sammen — det er hovedvalideringen.
- Sikre at intet bygges uden krav bag det, og at intet lukkes uden fuld validering.
- Sikre at det byggede hænger sammen med den nuværende kode og forretningslogikker.
- Lave forretnings-recon der gør kravet 100% dækkende for alle forretningsfunktioner pakken rører.
- Lave kode-recon der fanger misforståelser mellem krav-dok og koden.
- Sikre at krav, plan og slut hver godkendes af alle fire aktører — Mathias' godkendelse er at planen/byg er tro mod hans hvad, ikke en stillingtagen til hvordan.
- Fange fejl, bordbrud og kædebrud undervejs ved hvert led — gennem validering, ikke til sidst.
- Automatisere transport, ikke dømmekraft — aktørernes validering forbliver fuld.
- Lade aktørerne løfte hinandens arbejde — direkte modspil der løfter er en pligt; modspil der ikke løfter (ligegyldige spørgsmål, spildtid) hører ikke hjemme.
- Teste hvor det skaber værdi — så validering ikke stjæler kræfter fra bygningen.
- Teste docs på en måde der skaber værdi — fange reelle brud uden at skabe forkert fokus.
- Holde repoet rent — hvert dokument har ét formål, ingen dubletter, holdes opdateret, én sandhed, kun relevant info.
- Lade main/GitHub være sporet efter fuld validering — så færdige pakker ikke kræver dokumentering oven på det.
- Tage de brugbare aktør-egenskaber i brug der, hvor de giver mest værdi.
- Bruge hver aktørs kræfter der, hvor de giver mest værdi.
- Køre automatisk fra åbning til luk og derved beskytte Mathias' friskhed — fjerne dræn, så hans glid-fangst holdes skarp (systemkrav, ikke bekvemmelighed).
- Holde Mathias ude af det mekaniske — aldrig hvordan-spørgsmål til ham. Han styrer hvad systemet skal kunne (vision, forretning, krav-dok); Code/Codex sørger for hvordan det kan lade sig gøre i kode (plan, byg). Kald ham kun ind på beslutninger der er hans — og de fund undervejs der kræver hans afgørelse.
- Give de tre AI-aktører to rolle-typer — en workflow-rolle og en almindelig rolle — som de skifter mellem efter behov. Mathias styrer selv.
- Fordele rollerne så både grundighed og effektivitet øges.

## Det afgørende krav — to modsvar pr. funktion

For hver funktion der overvejes til planen, skal der som minimum ligge to modsvar — to konkrete indvendinger mod at bruge den, hver båret af en anden funktion. En funktion der ikke har mødt mindst to modsvar, er ikke klar til at komme i planen. Det er værnet mod første-løsning-svagheden: ingen funktion vælges, før den er prøvet imod af andre funktioner.

## IKKE i scope

- Stork-forretningsfeatures (løn, salg, vagter, provision) — dette er workflow-infrastruktur, ikke domæne.
- Vision og forretningsforståelse som genstand for ombygning — de er ankeret, ikke til revision her.

## Idé-liste (kandidater — ideer, ikke krav)

Denne liste er en del af krav-dokket, men er **ideer, ikke krav**. Den er input til planen — kandidater, intet valgt. Kataloget er startpunkt, ikke eneste grundlag: der søges også på nettet og i aktørernes egne indstillinger, og søgningen skal ramme alle aktører.

**Claude Code-egenskaber:** Hooks · /goal · .claude/rules/ · Skills · Codex-plugin · /loop · Statusline · Checkpointing (/rewind) · --from-pr · /doctor + /context + /memory · Sandboxing · Headless · Agent SDK · Agent view · Agent teams · Workflows · ultrareview · Routines · Worktrees · Auto mode · Computer use.

**Codex-opsætning:** model + reasoning_effort · approval_policy · sandbox_mode · network_access · github-plugin · trust_level pr. projekt.
