# Codex review — gov-docs-renhed runde 7

**Pakke:** gov-docs-renhed
**Fase:** build
**Plan-fil:** docs/coordination/gov-docs-renhed-plan.md
**Plan-SHA:** 2fdc9f0
**Dato:** 2026-06-10
**Reasoning:** xhigh
**Max ord:** 350
**Command:** `scripts/codex-review.sh docs/coordination/gov-docs-renhed-plan.md 7 --xhigh --phase=build` (re-run via samme args inkl. flags)

---

Reading additional input from stdin...
OpenAI Codex v0.137.0
--------
workdir: /home/mathias/stork-2.0
model: gpt-5.5
provider: openai
approval: never
sandbox: workspace-write [workdir, /tmp, $TMPDIR] (network access enabled)
reasoning effort: xhigh
reasoning summaries: none
session id: 019eb18f-f655-79a2-8b31-f8a130071fc4
--------
user
Du er Codex i Stork 2.0 — uafhængig kode-reviewer, read-only (disciplin §9.3).

Læs FØR review:
- docs/strategi/vision-og-principper.md
- docs/strategi/forretningsforstaaelse.md (LÅST stamme-doc, D4)
- docs/strategi/disciplin.md §9.3 (din rolle) + §5 (severities) + §8.1
- docs/coordination/gov-docs-renhed-krav-og-data.md (pakke-kontrakt — hvis den findes)
- docs/coordination/gov-docs-renhed-plan.md (build-fasen for pakke gov-docs-renhed)
- docs/coordination/gov-docs-renhed-status.md (kontekst + konvergens-counter — hvis den findes)

RUNDE-NUMMER: 7
FASE: build
FORMÅL: udledes af "## Formål"-sektionen i docs/coordination/gov-docs-renhed-plan.md.

Review-fokus (§9.3): patch-først (§3.1) · end-to-end-spor (§3.3) ·
state-dump matcher faktisk state (§3.2) · krav-dok-konsistens uden
scope-creep · vision/forretningsforstaaelse-modsigelse ·
MANGLENDE-EKSISTERENDE-BEVARELSE.

Format pr. fund:
[SEVERITY] Kort beskrivelse
Konkret afvigelse: ...
Anbefalet handling: [V<n+1>-rettelse / G-nummer / kosmetisk note]

Berører ændringen en governance-doc: afslut med
"§8.1-SVAR: INGEN-MODSIGELSE" eller "§8.1-SVAR: MODSIGELSE — <hvad>".

Max 350 ord. Hvis ingen fund: skriv "APPROVAL — Runde 7".
codex
Jeg læser først de nævnte governance- og strategi-docs og sammenholder dem med den aktuelle diff, uden at ændre filer.
exec
/bin/bash -lc 'git status --short' in /home/mathias/stork-2.0
 succeeded in 0ms:
exec
/bin/bash -lc 'pwd && rg --files docs/strategi docs/coordination | sort' in /home/mathias/stork-2.0
 succeeded in 0ms:
/home/mathias/stork-2.0
docs/coordination/aktiv-plan.md
docs/coordination/arkiv/H020-V1-blokeret.md
docs/coordination/arkiv/H020-V2-codex.md
docs/coordination/arkiv/H020-approved.md
docs/coordination/arkiv/H020-flow-fejl.md
docs/coordination/arkiv/H020-krav-og-data.md
docs/coordination/arkiv/H020-plan.md
docs/coordination/arkiv/H024-V1-claude-ai.md
docs/coordination/arkiv/H024-V1-codex.md
docs/coordination/arkiv/H024-V2-approved-claude-ai.md
docs/coordination/arkiv/H024-approved-codex.md
docs/coordination/arkiv/H024-krav-og-data.md
docs/coordination/arkiv/H024-plan.md
docs/coordination/arkiv/I001-krav-og-data.md
docs/coordination/arkiv/Lag1-V5.1-claude-ai.md
docs/coordination/arkiv/Lag1-approved-codex.md
docs/coordination/arkiv/Lag1-plan.md
docs/coordination/arkiv/PR42-disciplin-fundament-merge.md
docs/coordination/arkiv/README.md
docs/coordination/arkiv/T9-V1-claude-ai.md
docs/coordination/arkiv/T9-V1-codex.md
docs/coordination/arkiv/T9-V2-approved-claude-ai.md
docs/coordination/arkiv/T9-V2-claude-ai.md
docs/coordination/arkiv/T9-V2-codex.md
docs/coordination/arkiv/T9-V3-codex.md
docs/coordination/arkiv/T9-V4-claude-ai.md
docs/coordination/arkiv/T9-V4-codex.md
docs/coordination/arkiv/T9-V5-approved-claude-ai.md
docs/coordination/arkiv/T9-V5-claude-ai.md
docs/coordination/arkiv/T9-V5-codex.md
docs/coordination/arkiv/T9-approved-claude-ai.md
docs/coordination/arkiv/T9-approved-codex.md
docs/coordination/arkiv/T9-foraeldet-2026-05-17/README.md
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V1-approved-claude-ai.md
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V1-codex.md
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V2-approved-claude-ai.md
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V2-codex.md
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V3-approved-claude-ai.md
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V3-approved-codex.md
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-V3-claude-ai-FEEDBACK.md
docs/coordination/arkiv/T9-foraeldet-2026-05-17/T9-plan-V3.md
docs/coordination/arkiv/T9-krav-og-data.md
docs/coordination/arkiv/T9-plan.md
docs/coordination/arkiv/forretningsspoergsmaal-skabelon-UDGAAET-V2.md
docs/coordination/arkiv/i001-arbejde/audit/audit-code-2026-05-15.md
docs/coordination/arkiv/i001-arbejde/audit/audit-codex-2026-05-15.md
docs/coordination/arkiv/mathias-afgoerelser-historik.md
docs/coordination/arkiv/r-runde-2-plan.md
docs/coordination/arkiv/r-runde-2-recon.md
docs/coordination/arkiv/r7h-plan.md
docs/coordination/arkiv/rapport-historik-meta/2026-05-15-h010.md
docs/coordination/arkiv/rapport-historik-meta/2026-05-15-h020-1.md
docs/coordination/arkiv/rapport-historik-meta/2026-05-15-h022.md
docs/coordination/arkiv/rapport-historik-meta/2026-05-16-h020.md
docs/coordination/arkiv/rapport-historik-meta/2026-05-16-h024.md
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1-disciplin-fundament.md
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-Lag1.md
docs/coordination/arkiv/rapport-historik-meta/2026-05-20-trin-10-workflow-fund.md
docs/coordination/arkiv/rapport-historik-meta/2026-05-22-v4-automation.md
docs/coordination/arkiv/t9-supplement-2-forretningsgang-claude-ai.md
docs/coordination/arkiv/t9-supplement-2-forretningsgang-code.md
docs/coordination/arkiv/t9-supplement-2-forretningsgang-codex.md
docs/coordination/arkiv/t9-supplement-2-forretningsgang-konsolideret.md
docs/coordination/arkiv/t9-supplement-2-krav-og-data.md
docs/coordination/arkiv/t9-supplement-2-plan.md
docs/coordination/arkiv/trin-10-approved-codex.md
docs/coordination/arkiv/trin-10-krav-og-data.md
docs/coordination/arkiv/trin-10-plan.md
docs/coordination/arkiv/v4-automation-krav-og-data.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-1.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-2.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-3.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-4.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md
docs/coordination/gov-1-paritet-groen-plan.md
docs/coordination/gov-2-vagt-plan.md
docs/coordination/gov-3a-ci-blockers-plan.md
docs/coordination/gov-docs-renhed-krav-og-data.md
docs/coordination/gov-docs-renhed-plan.md
docs/coordination/gov-docs-renhed-status.md
docs/coordination/governance-vagt-krav-og-data.md
docs/coordination/rapport-historik/2026-05-18-t9.md
docs/coordination/rapport-historik/2026-05-19-t9-supplement.md
docs/coordination/rapport-historik/2026-05-21-trin-10.md
docs/coordination/rapport-historik/2026-05-22-t9-supplement-2.md
docs/coordination/rapport-historik/2026-06-04-gov-1-paritet-groen.md
docs/coordination/rapport-historik/2026-06-05-gov-2-vagt.md
docs/coordination/rapport-historik/2026-06-05-gov-3a-ci-blockers.md
docs/coordination/rapport-historik/2026-06-05-gov-3b-1-ci-blockers.md
docs/coordination/rapport-historik/2026-06-05-gov-3b-2.md
docs/coordination/rapport-historik/2026-06-07-gov-3b-3a.md
docs/coordination/rapport-historik/2026-06-07-gov-3b-3b.md
docs/coordination/rapport-historik/README.md
docs/coordination/seneste-rapport.md
docs/coordination/v5-workflow-bud.md
docs/strategi/disciplin.md
docs/strategi/forretningsforstaaelse.md
docs/strategi/stork-2-0-master-plan.md
docs/strategi/vision-og-principper.md

exec
/bin/bash -lc 'git diff --stat' in /home/mathias/stork-2.0
 succeeded in 0ms:
codex
Arbejdstræet ser rent ud, så reviewet skal sandsynligvis baseres på pakkens dokumenter og branchens aktuelle tilstand. Jeg henter nu de relevante afsnit og diff-kontekst mod git.
exec
/bin/bash -lc "sed -n '1,260p' docs/strategi/forretningsforstaaelse.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
# Stork 2.0 — Forretningsforståelse

<!-- governance-owns: forretnings-intention -->

> **LÅST DOKUMENT (stamme-doc med vision-og-principper.md).** Ændringer kræver eksplicit godkendelse fra Mathias via PR; CODEOWNERS håndhæver. Opdateres når Mathias' tanker udvikler sig — men de to stamme-docs må aldrig være indbyrdes uenige: en modsigelse er et hul der STOPPER og lukkes af Mathias (D4). Mekanisk håndhævelse (required code-owner-review) lander i gov-4 — dette er doc-niveau-løftet.

Dette dokument forklarer hvordan Stork-forretningen hænger sammen. Hvert punkt beskriver hvad systemet skal kunne på forretnings-niveau, efterfulgt af en kort opsummering af hvorfor det er sådan.

Dokumentet er målrettet roller der hjælper med plan-arbejde, krav-dok og review. Det erstatter ikke vision-dokumentet, master-planen eller Mathias-afgørelser — det er baggrunden der gør de dokumenter forståelige.

---

## 1. Klient som omdrejningspunkt

- Stork skal kunne knytte alt forretningsmæssigt indhold (salg, calls, vagter, løn, rapporter) til den klient det vedrører
- Stork skal kunne svare på "hvilken klient er dette for?" for enhver forretnings-handling
- Stork skal kunne håndtere at klienter ejes af teams — én klient ad gangen
- Stork skal kunne forhindre at et salg lever uden klient-kobling

Klienten er Storks driftsmotor. Stork sælger for andre firmaer (Tryg, Eesy, TDC, Finansforbundet), og det er klient-bindingen der bestemmer hvem der har ansvaret for hvad. Hvis et salg ikke kan kobles til en klient, kan det ikke faktureres, lønberegnes eller rapporteres.

---

## 2. Dato-snapshot-princippet

- Stork skal kunne fryse klient-team-bindingen ind på salget når det laves
- Stork skal kunne slå op hvilket team der ejede en klient på en hvilken som helst historisk dato
- Stork skal kunne sikre at senere klient-team-skift ikke ændrer historiske salg
- Stork skal kunne håndtere at klient-team-bindinger ændrer sig løbende uden at fortid forandres

Fortid skrives ikke om. Når et salg laves på en dato, så er klient-team-bindingen den dag dét der tæller — også når annulleringer eller korrektioner kommer ind måneder senere. Det er den eneste måde at sikre at konsekvenser rammer det rigtige team selvom verden har ændret sig siden.

---

## 3. Attribution-trekanten: sælger, team, klient

- Stork skal kunne attribuere hvert salg til en sælger (den der lavede det), en klient (det firma salget er for) og et team (det der ejede klienten den dag)
- Stork skal kunne afgøre team-attribution via klienten, ikke via sælgerens nuværende team
- Stork skal kunne håndtere at en sælger over tid skifter team uden at fortidens salg påvirkes
- Stork skal kunne bruge klient-dimensionen til at afgøre pris og provisions-sats
- Stork skal kunne koble salg til den rigtige medarbejder uanset hvordan sælger-identiteten kommer fra ekstern API

Tre dimensioner, tre konsekvenser. Sælgeren får sin provision. Klienten bestemmer prisen og satserne. Teamet får DB-løn til sin leder. De tre er adskilte, og særligt vigtigt: team kommer via klienten, ikke direkte fra sælgeren. Det forhindrer at sælger-skift midt i en periode ødelægger tidligere attribution.

---

## 4. Salget — flere linjer, regel-baseret pris, berigelse undervejs

- Stork skal kunne registrere et salg med en eller flere produktlinjer, hver med egen pris og provision
- Stork skal kunne aggregere provision og omsætning pr. salg som summen af linjerne
- Stork skal kunne finde prisen via en regel der matcher produkt + kampagne + felt-værdier
- Stork skal kunne vælge deterministisk mellem flere regler der matcher
- Stork skal kunne flage og rette salg hvor ingen regel matcher (i stedet for at skjule det bag en standardværdi)
- Stork skal kunne berige et salg med ekstra felter via UI efter registrering
- Stork skal kunne lade berigelses-felter påvirke prissætningen og udløse opdateret provision
- Stork skal kunne logge alle berigelser
- Stork skal kunne merge to produkter til ét
- Stork skal kunne gruppere produkter til rapportering og aggregering
- Stork skal kunne sammenligne felt-værdier på flere måder i pricing-regler (præcis match, intervaller, ranges)
- Stork skal kunne tidsbegrænse pricing-reglers gyldighed
- Stork skal kunne bære flere pricing-formler pr. produkt til forskellige situationer
- Stork skal kunne vise salgs-linjer med navn der adskiller sig fra produktnavnet (fx kampagne-specifikt navn)
- Stork skal kunne håndtere særlige betalings-tilfælde (fx straksbetaling) som data, ikke separat mekanik
- Stork skal kunne styre salgs-livscyklus med kontrollerede status-overgange (ikke automatiske)
- Stork skal kunne udelukke salg i bestemte status'er fra commission-aggregat
- Stork skal kunne genberegne salg når pricing ændres — kun før provision er udbetalt

Salget er bygget op af linjer. Prisen kommer ikke fra produktet alene — den kommer fra en regel der ser på flere felter samtidig. Salget kan ændre værdi efter registrering hvis det beriges med nye felter (eksempel: straksbetaling). Hele forretningens prissætning kører gennem samme regel-mekanisme, så sælger-provision og leder-DB altid bygger på samme tal.

---

## 5. Vagter, stempelur og klient-tid

- Stork skal kunne planlægge vagter pr. medarbejder med start og slut
- Stork skal kunne bruge vagten som autoritativ kilde til løn-timer (uafhængigt af stempelur)
- Stork skal kunne registrere stempelur som dokumentation for fremmøde
- Stork skal kunne håndtere at stempelur kan bruges til at fordele tid mellem klienter uden at det ændrer løn-timerne
- Stork skal kunne kræve at en sælger-vagt fordeles 100% på klienter
- Stork skal kunne acceptere flere kilder til klient-fordeling samtidig (stempelur, dialer-events, fast klient på vagten)
- Stork skal kunne beregne CPO og time-provision pr. klient via samme regel-mekanisme som salgs-pricing
- Stork skal kunne håndtere salg der kommer ind uden tilhørende vagt (flag + retroaktiv vagt-oprettelse + automatisk klient-fordeling ved retroaktiv oprettelse)
- Stork skal kunne håndtere tre vagt-typer med egne regler pr. type: stab (stempelur som dokumentation), teamledelse (stempelur som dokumentation), sælger (klient-tid dækker 100% af total arbejdstid)
- Stork skal kunne bestemme total arbejdstid ud fra vagten; pauser indgår ikke
- Stork skal kunne udløse revalidering af klient-fordeling når total arbejdstid ændres
- Stork skal kunne validere at sum af klient-segmenter ikke overstiger total arbejdstid
- Stork skal kunne lade UI prioritere når flere klient-fordelings-kilder er aktive samtidig
- Stork skal kunne mødes to API-events fra forskellige klienter i tids-midtpunktet
- Stork skal kunne udvide første API-events klient bagud til arbejdstidens start
- Stork skal kunne udvide sidste API-events klient fremad til arbejdstidens slut
- Stork skal kunne lade kampagner under en klient have egne klient-tid-betalings-regler der afviger fra klient-default
- Stork skal kunne udløse klient-tid-betaling kun på sælger-vagter
- Stork skal kunne planlægge vagter fremadrettet
- Stork skal kunne ændre vagter pr. dag uden at ændre andre vagter
- Stork skal kunne replikere vagt-mønster på tværs af mange medarbejdere uden manuel taste
- Stork skal kunne følge medarbejderens start- og slut-dato (ingen vagter udenfor; auto-afslut hvis medarbejder stopper midt i periode)
- Stork skal kunne tildele vagter status (no-show som mulig status)
- Stork skal kunne behandle manglende vagt som ingen arbejdstid (ikke automatisk default fra ugedag)
- Stork skal kunne nægte vagtbytte mellem medarbejdere
- Stork skal kunne nægte vagt-overlap i tid for samme medarbejder
- Stork skal kunne følge danske helligdage
- Stork skal kunne oprette vagter på helligdage
- Stork skal kunne forhindre ændring af stempel-tidspunkter efter de er sat
- Stork skal kunne logge stempel-rettelser
- Stork skal kunne håndtere vagter der går på tværs af midnat
- Stork skal kunne anvende én konsistent pause-model på tværs af systemet
- Stork skal kunne definere pauser på flere niveauer (skabelon, medarbejder, klient) som data i UI
- Stork skal kunne registrere fraværs-typer som data (minimum: ferie, sygdom — udvideligt)
- Stork skal kunne håndtere fravær som hel dag eller del af dag
- Stork skal kunne kræve approval på ferie men ikke på sygefravær
- Stork skal kunne logge fraværs-status-overgange

Vagten er fundamentet for sælgerens dag. Den planlægges, den betales. Stempeluret dokumenterer hvad der faktisk skete, og klient-tid-fordelingen siger hvilken klient sælgeren brugte tiden på. Klient-tid kan give CPO og provision — beregnet gennem samme mekanisme som salgs-pricing, så de to systemer aldrig afviger.

---

## 6. Annulleringer rejser tilbage gennem tiden

- Stork skal kunne modtage annulleringer på salg uger eller måneder efter selve salget
- Stork skal kunne sende konsekvenserne af annulleringen tilbage til det team der ejede klienten på salgs-tidspunktet
- Stork skal kunne registrere annulleringer som modposter uden at røre den oprindelige salgslinje
- Stork skal kunne håndtere annullering af et helt salg eller af én linje eller af en del af en linje
- Stork skal kunne håndtere andre feedback-typer (korrektioner, kurv-rettelser, afvisninger) gennem samme dato-baserede rute

Annulleringer rammer fortiden men retter den ikke. Det oprindelige salg står urørt, og annulleringen registreres som en ny begivenhed der peger på det. Det er det der gør at audit, historik og rapporter kan stoles på selv efter mange korrektions-runder. Team-attribution følger dato-snapshot — annulleringer rammer det historiske team, ikke det nuværende.

---

## 7. Provision-mekanikken — sælger, leder, assistent/stab

- Stork skal kunne beregne sælger-provision pr. salg baseret på klientens provisions-aftale
- Stork skal kunne beregne leder-løn som procent af team-DB (teamets klient-omsætning minus sælger-løn minus annulleringer)
- Stork skal kunne beregne assistent- og stab-løn via faste lønarter (timeløn, månedsløn, tillæg) uden afhængighed af salgs-tal
- Stork skal kunne tillægge feriepenge til alle løn-niveauer
- Stork skal kunne konfigurere alle satser, lønarter og formler via UI, ikke via teknisk ændring
- Stork skal kunne ændre en sats eller tilføje en ny lønart uden at omdesigne systemet
- Stork skal kunne håndtere timeløn, månedsløn og commission som separate løntype-kategorier
- Stork skal kunne kategorisere formler efter formål (lønarter vs. KPI'er)
- Stork skal kunne lade tid indgå som input-variabel i begge formel-kategorier
- Stork skal kunne beregne sygeløn pr. vagt via formel-systemet
- Stork skal kunne anmode og godkende overtid
- Stork skal kunne medregne godkendt overtid automatisk i lønberegning
- Stork skal kunne logge overtid-godkendelser
- Stork skal kunne aggregere pr. medarbejder pr. periode: antal vagter (totalt og pr. status), antal FM-bookinger, antal FM-salgsregistreringer
- Stork skal kunne stille anciennitet til rådighed som input-variabel i formel-systemet
- Stork skal kunne stille medarbejder-aggregater til rådighed som input-variabler i formel-systemet
- Stork skal kunne stille medarbejderens standard arbejdstid til rådighed som data

Tre niveauer der ikke fungerer ens. Sælgeren får direkte provision pr. salg. Lederen får DB-løn bundet til klient-ejerskab. Assistent og stab har faste lønarter uden salgs-afhængighed. Det fælles træk: alle satser og lønarter konfigureres i UI gennem formel-systemet, så forretningen kan reagere uden at gå gennem en udvikler.

---

## 8. Lønperiode-låsning

- Stork skal kunne afgrænse drift i lønperioder (typisk månedlige) med klar start og slut
- Stork skal kunne åbne og lukke perioder kontrolleret
- Stork skal kunne forhindre enhver ændring i en låst periode
- Stork skal kunne håndtere sene annulleringer som modposter i en åben periode valgt af bruger
- Stork skal kunne pege modposter tilbage til det oprindelige salg, så sammenhængen kan ses
- Stork skal kunne attribuere modposten til det historiske team, selv om den udbetales i nuværende periode

Låsning er det der gør lønhistorik pålidelig. Når en periode er udbetalt, kan den ikke ændres — så hverken Skat eller medarbejdere kan komme i tvivl om hvad der blev udbetalt. Annulleringer der kommer sent rammer ikke fortiden; de placeres som modposter i en åben periode brugeren vælger. Forretningen styrer placeringen, og attributionen følger dato-snapshot.

---

## 9. Forretningslogik som data — ikke som kode

- Stork skal kunne lade brugere ændre satser, lønarter, klient-felter, regler og andre værdier via UI
- Stork skal kunne adskille algoritmer (hvordan noget beregnes) fra værdier (hvad satserne er)
- Stork skal kunne nægte at virke når kritisk konfiguration ikke er sat (default = intet)
- Stork skal kunne tage konfigurations-ændringer gennem livscyklus: kladde → testet → godkendt → aktiv
- Stork skal kunne kræve superadmin til at aktivere særligt følsomme ændringer (anonymiserings-strategier, retention-regler)
- Stork skal kunne logge enhver konfigurations-ændring fra hvert stadie
- Stork skal kunne vise hvilken pricing-regel der gav et salg sin pris
- Stork skal kunne logge pricing-regel-ændringer uanset hvor ændringen kommer fra

Algoritmen er kode, værdien er data. Hvordan en provision beregnes ligger fast i kode; hvad satsen er, ligger som data i UI. Det betyder forretningen kan reagere hurtigt på ændringer uden teknisk arbejde. Livscyklus-disciplinen forhindrer at "data i UI" bliver anarki — ændringer går gennem flere kontrol-skridt før de er live.

---

## 10. Identitet eksisterer én gang

- Stork skal kunne genkende en person som samme person på tværs af alle systemer
- Stork skal kunne forhindre at samme person optræder under flere navne eller flere ID'er
- Stork skal kunne markere data som "ikke matchet" når en person ikke kan identificeres entydigt
- Stork skal kunne kræve Microsoft-konto-login for medarbejdere (ingen separat Stork-login, ingen bagdør)
- Stork skal kunne behandle kandidater som ikke-identiteter indtil de bliver ansat

Én person, én identitet. Det lyder selvfølgeligt men har konsekvenser overalt — sælger-attribution, vagt-registrering, løn, audit, alt skal pege på samme entitet. Når et salg ikke kan identificere sin sælger, sendes det til manuel håndtering frem for at gætte. Det er bedre at have et salg liggende end at have det attribueret forkert.

---

## 11. Persondata vs. forretningsdata

- Stork skal kunne adskille persondata (navne, kontaktoplysninger) fra forretningsdata (klient-navn, omsætning, lønarter)
- Stork skal kunne anonymisere persondata efter retention-periode uden at slette den bærende række
- Stork skal kunne bevare hele audit-sporet selv efter anonymisering
- Stork skal kunne håndtere direkte PII (felter der i sig selv identificerer) og indirekte PII (felter der kombineret identificerer) forskelligt
- Stork skal kunne logge enhver ændring der rører data (audit per række på alt undtagen audit selv)
- Stork skal kunne bevare forretningsdata evigt (klient-rækker, historiske salg, sælger-rækker bag anonymiseret navn)

Grænsen går mellem entitet og felter. Klient-rækken bliver stående evigt; en kontaktperson på klienten har sletteregler. Anonymisering fjerner ikke rækken — den fjerner personhenførbare felter og lader resten stå. Det er det der gør at historisk lønberegning og rapporter stadig fungerer to år efter en sælger er stoppet og hans navn er anonymiseret.

---

## 12. Rettigheder og adgang

- Stork skal kunne definere rettigheder pr. side og pr. handling i UI uden teknisk ændring
- Stork skal kunne lade en rolle være en samling af rettigheder, ikke en hardkodet kategori
- Stork skal kunne håndtere én undtagelse (superadmin) som hardkodet sikkerhedsventil
- Stork skal kunne adskille synlighed (hvad ses) fra handling (hvad må ændres)
- Stork skal kunne styre synlighed via tre niveauer: sig selv, hierarki (egen knude og alt under), eller alt
- Stork skal kunne koble hierarki-synlighed til medarbejderens placering i organisations-træet
- Stork skal kunne tildele compliance-ansvar (GDPR, AI, AMO) til konkrete medarbejdere uden om rettigheds-systemet
- Stork skal kunne tillade break-glass-handlinger på låste data via to-niveau godkendelse med særlig audit

Rettigheder er driftsfunktion, ikke bi-funktion. Synlighed udledes af træet — en team-leder ser sit team automatisk. Handlinger styres pr. side og pr. tab, så samme synlighed kan kombineres med forskellige skrive-rettigheder. Compliance-ansvar er juridisk udpegning, ikke en rettigheds-rolle. Break-glass er den eksplicitte undtagelse der gør at låste data kan ændres når det er virkeligt nødvendigt — men kun gennem en sporet, godkendt handling.

---

## 13. Yderligere funktioner

- Kontrakt-mekanisme — skal kunne sende kontrakter
- Besked- og spørgeskema-funktion — skal kunne udsende beskeder enten som ren information eller som spørgeskema
- Dashboard — skal kunne vise kuraterede visninger med egen adgangsstyring
- Rapportering — skal kunne aggregere data pr. sælger, team, klient og dato

Disse fire funktioner er en del af Stork som selvstændige områder ved siden af kerne-driften. De er nævnt her så de ikke glemmes — den konkrete forretningsforståelse for hver enkelt bliver afdækket pakke for pakke når funktionen skal bygges.

---

## 14. FM-grenen — felt-marketing på samme stamme

- Stork skal kunne håndtere FM-salg via samme mekanik som TM-salg (samme klient-dimension, samme attribution, samme pricing, samme annullerings-håndtering)
- Stork skal kunne planlægge fysiske lokationer som master-data på linje med klient og medarbejder
- Stork skal kunne registrere bookinger der knytter lokation, klient og medarbejdere sammen i tid
- Stork skal kunne kontrollere at en klient kun sælges på lokationer hvor der er tilladelse
- Stork skal kunne håndtere FM-specifikke lønarter (diæt, oplæringsbonus, mileage) gennem samme formel-system som al anden løn

FM er ikke et separat univers. Det er samme stamme set fra en anden vinkel: i stedet for at sidde og ringe står sælgeren fysisk på en messe eller i en butik. Klienten er stadig dimensionen, lederen får stadig DB, provisionen beregnes stadig på samme måde. Lokationen og bookingen er FM's egne entiteter, men de spiller ind i samme system som resten af forretningen — ingen parallel løn, ingen parallel attribution.

---

## 15. Greenfield-rammen — 2.0 er ikke kopi af 1.0

- Stork 2.0 skal kunne bygges uden at arve antagelser fra 1.0
- Stork 2.0 skal kunne tage migration som separat beslutning pr. pakke, ikke som automatisk leverance
- Stork 2.0 skal kunne hente data direkte fra eksterne kilder (klient-API'er) som primær kilde frem for at gå gennem 1.0
- Stork 2.0 skal kunne afgøre design ud fra vision og principper, ikke ud fra "hvordan gør 1.0 det?"

  2.0 bygges fra bunden. 1.0 fortsætter med at køre indtil cutover, men 2.0 er ikke en migration af koden — det er et nyt system med nyt design. 1.0's anti-mønstre overføres ikke. Når data senere skal med over, afgøres det pakke for pakke når behovet konkret melder sig.

---

## 16. Hvordan det hele hænger sammen

- Stork skal kunne kæde alle forretnings-handlinger sammen via klient-dimensionen
- Stork skal kunne fryse historiske bindinger ind så fortiden ikke skrives om
- Stork skal kunne lade konsekvenser (annulleringer, korrektioner) rejse tilbage gennem tiden uden at ændre fortiden
- Stork skal kunne låse perioder uden at miste mulighed for at lave modposter senere
- Stork skal kunne håndtere ændringer i organisation, satser og regler gennem UI uden teknisk ændring

exec
/bin/bash -lc "sed -n '1,260p' docs/coordination/gov-docs-renhed-krav-og-data.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
# gov-docs-renhed — Krav-og-data

**Type:** Kontrakt for gov-docs-renhed-pakken (docs-renhed + selvvedligeholdende værn)
**Dato:** 2026-06-08

> **Ærlig note om dokumentets natur + bord.** §10.1 lægger krav-dok-typist-rollen
> hos Claude.ai, og Mathias dikterer. Denne er Code-draftet, fordi indholdet er
> Mathias' dikterede afgørelser (D1–D6 + renheds-princippet + løftet af
> forretningsforståelse) sammen med Code- og Codex-verificerede fund — ikke
> forretnings-tanker der kræver en typist. **Ingen forretnings-afgørelse er
> truffet af Code.** Hver påstand sources nedenfor. Vil Mathias hellere have
> Claude.ai til at type den for cadence-konsistens, omdirigeres den — flag rejst,
> ikke afgjort.

## Formål

> Denne pakke leverer: et docs-repo hvor ingen doc eller script modsiger
> virkeligheden — plus de mekaniske værn der holder det rent — så fælles
> forståelse og workflow ikke kan brydes af drift.

_Kilde: Mathias 2026-06-08 ("urent docs = brudt fælles forståelse = brudt
workflow; hold det rent ER workflowet, ikke oprydning ved siden af");
Code-analyse H-1…H-8; Codex-analyse C-1…C-8 (branch-protection-fund
API-verificeret)._

## Hvad pakken skal sikre (workflow-/renheds-niveau, ikke Stork-forretning)

Pakken bygger ikke løn, salg eller klienter. Den retter **måden** repoet bærer
fælles forståelse på, så en aktør aldrig fejlledes af en doc/script der lyver.

- Et docs-repo eksisterer for at skabe fælles forståelse og sikre workflowet. En
  doc der modsiger virkeligheden, en død reference eller en pointer der peger
  forkert undergraver præcis det repoet er til for. Renhed **er** workflowet.
  _(Mathias 2026-06-08.)_
- Kun filer der tjener et reelt formål overlever i repoet. Alt andet ud — doc
  eller script, V5.3-rest eller ej. _(Mathias D3.)_
- De to stamme-docs — `vision-og-principper.md` og `forretningsforstaaelse.md` —
  er begge LÅST-AUTORITATIVE og **må aldrig være indbyrdes uenige**. En
  modsigelse mellem dem er et hul der skal lukkes, ikke en præcedens hvor den ene
  trumfer den anden. _(Mathias D4 + afgørelse: forretningsforståelse hæves til
  samme beskyttelse som vision.)_
- Et script der ligner fungerende automation men er brudt er værre end intet
  script — det fejlleder aktøren. _(Codex C-3; Code H-1.)_
- Renheden må ikke hvile på menneske-hukommelse: det der kan fanges mekanisk skal
  fanges mekanisk; resten falder til Codex + Mathias. _(v5-bud §1; arvet fra
  gov-2.)_

## I scope

Code afgør faktisk bygge-rækkefølge, batch-split og repair-vs-slet-verdikt pr.
script i plan-fasen (hans bord, jf. D1). Krav-dok'en fastlåser ikke det tekniske
hvordan — kun hvad der skal være sandt til sidst.

### A. Reconcile — docs og scripts der modsiger virkeligheden i dag

1. **Aktiverings-scripts bringes til at virke under V5 ELLER fjernes** — verdikt
   pr. script, styret af "tjener et reelt formål" (D3): `codex-review.sh` (dør på
   `exit 64`; kræver slettet `docs/skabeloner/codex-review-prompt.md`),
   `claude-ai-prompt.sh` (peger på slettede `mathias-afgoerelser.md` +
   `overvaagning/claude-ai-overvaagning.md`; indlejrer fjernet fire-dok-ramme),
   `data-grundlag.sh` (V5.3 "Step 0"), `krav-afklar.sh` (V5.3 "Step 2"). _(D1+D3;
   H-1/H-2; C-3/C-4.)_
2. **`disciplin.md` doc-currency** — "Forudsætninger"- og "Gjort"-sektionerne
   (`§ Forudsætninger`) lister gov-3b-2 #10/#18 som udestående; de er merged
   (PR #101/#103/#105). Bringes i sync med faktisk gov-state. _(C-8.)_
3. **Forretningsforståelse løftes til LÅST-AUTORITATIV (doc-niveau)** — (a)
   LÅST-banner i header som `vision-og-principper.md`; (b) `LÆSEFØLGE.md` pkt. 2
   "TANKE-DATA — ikke kontrakt" → låst-status; (c) ny række i `disciplin.md §8`
   som **LÅST → STOP**; (d) `§8.1` udvides så ændring af én stamme-doc tvinger et
   konsistens-tjek mod den anden (modsigelse = hul → STOP → Mathias lukker).
   CODEOWNERS dækker den allerede. _Mekanisk håndhævelse (code-owner-review
   required) lander i gov-4 — her er det doc-niveau-løftet._ \_(Mathias-afgørelse
   - D4; C-2/H-5.)\_
4. **Git-reglen rettes** — "git pull origin main" ved hver trigger er forkert når
   arbejdet sker på plan/build/mergehash-branches. Erstattes med branch-bevidst
   "fetch + verificér branch/base/remote + pull relevant branch; uventede commits
   → STOP". I `LÆSEFØLGE.md` pkt. 0, `disciplin.md §13`, `CLAUDE.md`. _(C-7.)_
5. **Døde reference-rester repointes** — `rapport-historik/README.md` peger på
   slettet `rapport-skabelon.md`; `disciplin.md §2/§6.2` peger på H020-tombstone
   i stedet for det levende gov-5-arbejde. _(H-3/H-7.)_
6. **`disciplin.md §7` invariant #4 gøres ærlig** — mærket "(lint)", men ingen
   sats/lønart-lint findes. Relabel til Codex/Claude.ai-tjek (lint bygges først i
   et senere spor). _(H-5.)_
7. **Claude.ai-aktivering: én kanonisk kilde i repoet** — repoets
   `docs/claude-ai/SKILL.md` gøres til den autoritative skill; platform-skill'en
   peger på / genereres fra den, så aktiveringen er versioneret og synlig for
   alle aktører. Forudsætter at `claude-ai-prompt.sh`-konflikten (pkt. 1) er
   lukket, så der ikke er to borde. _(Mathias-afgørelse: skill ud af platform,
   ind i repo; H-2.)_
8. **`fundament-samlet.md` slettet** — utracked working-tree-fil, fjernet som
   oprydning (ikke en tracked commit). _(Mathias D5. Allerede udført
   2026-06-08.)_

### B. Mekaniske værn — så renheden holder sig selv

9. **Governance-check-allowlisten splittes i to klasser** — prosa-docs _må_ nævne
   slettede stier (historisk-provenance); aktive scripts _må ikke_ pege på
   slettede stier, medmindre scriptet selv er markeret `deprecated`.
   Allowlisten har allerede et `klasse`-felt — checken bruger det bare ikke til
   at skelne doc vs. script. **Dette er fixet der automatisk ville have fanget
   pkt. 1.** _(H-3/C-5.)_
10. **Strukturel kæde-tjek** — for en aktiv pakke: krav-dok + plan + status +
    slut-rapport eksisterer og krydspeger konsistent, og `## Formål`-strengen er
    identisk på tværs af krav-dok/plan/rapport (formåls-immutabilitet §3.0
    mekanisk). **Strukturel, ikke semantisk** — existence + string-match, ingen
    betydnings-vurdering. _(H-4/C-6; Codex' eksplicitte råd "start strukturelt".)_
11. **§8.1 Codex-svar som fast review-marker** — den lovede "modsiger dette
    prosa-mæssigt et begreb en anden doc ejer?"-gate er i dag kun en instruktion;
    intet kræver at svaret blev givet. Gøres til en fast marker der kan tjekkes i
    PR/rapport, ikke kun huskes i chat. _(Codex-forbedring.)_

## IKKE i scope

- **gov-4 (branch protection)** — `required_status_checks` + `require_code_owner_reviews`
  - `required_approving_review_count ≥ 1`. Selvvedligeholds-checkene fra denne
    pakke (pkt. 9–10) gøres _required_ DÉR, ikke her. _(D2; sekvens.)_
- **gov-5 (automation)** — Codex-runner + auto-merge + plan-branch-trigger (H020).
  _(D6: bevidst udskudt hertil.)_
- **gov-6 (arkiv-fold)** — arkiv → git-history + `v4-slettede-docs/` (untracked) +
  G063-allowlist-fjernelse. _(disciplin §4; G063.)_
- **P3-spor** — Code-rolle-binding i `CLAUDE.md`, decision-packet-format ved
  gates, sats/lønart-lint. Følger efter; tages kun med her hvis plan-fasen finder
  dem billige. _(Code H-6; Codex-forbedring.)_
- **Semantisk modsigelses-detektion mellem stamme-docs som lag-1-check** — kan
  ikke gøres mekanisk; det er §8.1 Codex (lag 2). Pkt. 3(d) leverer _udløseren_
  (ændring → tjek-krav), ikke en prosa-modsigelses-scanner. Ærlig grænse. _(D4.)_
- **Stork-forretningsfeatures.**

## End-to-end-test-design

Mønster fra gov-2: `governance:selftest` — baseline grøn + plantede overtrædelser
fanges. Mindst tre nye negativ-cases i `scripts/governance-check.selftest.mjs`:

1. Et aktivt script der peger på en slettet sti (uden `deprecated`-markør) →
   allowlist-split-checken fejler (rød). _(beviser pkt. 9.)_
2. En aktiv pakke uden plan, eller med `## Formål`-streng-mismatch mellem
   krav-dok og plan → kæde-tjekket fejler (rød). _(beviser pkt. 10.)_
3. Baseline (alt rent) → grøn.

Skema-only ("checken findes") accepteres ikke (§3.6).

## Afgjort (Mathias D1–D6 + afgørelser, 2026-06-08)

- **D1:** Scripts repareres hvis de kan virke under V5 og tjener et formål; ellers
  slettes. Repair-vs-slet-verdikt pr. script = Code+Codex' bord i plan.
- **D2:** gov-4 kræver **både** CI-status **og** code-owner-review (næste pakke).
- **D3:** Kun filer der tjener et reelt formål overlever.
- **D4:** Vision + forretningsforståelse holdes konsistente; modsigelse = hul der
  lukkes, ikke afgøres.
- **D5:** `fundament-samlet.md` slettet.
- **D6:** Plan-branch-trigger/runner udskudt til gov-5.
- **Afgørelse:** Forretningsforståelse hæves til samme beskyttelse som vision.
- **Afgørelse:** Claude.ai-skill ud af platform-miljøet, ind i repoet (kanonisk +
  versioneret + synlig for alle aktører).

## Åbne spørgsmål

- _(Code+Codex i plan — ikke Mathias)_ Hvilke af de fire scripts tjener et reelt
  formål under V5 (repair) vs. er V5.3-rester (slet)? Foreløbig læsning:
  `data-grundlag.sh` + `krav-afklar.sh` er V5.3-step-rester hvis substans nu
  ligger i §9.1 proaktiv recon (V5 §0 footer) → slet-kandidater; `codex-review.sh`
  har værdi (severity-exit-routing) hvis V5-rettet; `claude-ai-prompt.sh` kan være
  overflødig efter SKILL.md + MCP + skill-i-repo-afgørelsen.
- _(Code+Codex i plan)_ Skal kæde-tjekket (pkt. 10) køre i CI så det bider efter
  gov-4, eller kun on-demand? Foreløbig: CI, så det faktisk blokerer.

## Oprydnings- og opdaterings-strategi

Ved pakke-luk: denne krav-dok → `arkiv/gov-docs-renhed-krav-og-data.md`;
plan/status/feedback i git-history (§4). Pakken redigerer governance-docs
(`disciplin.md`, `LÆSEFØLGE.md`, `forretningsforstaaelse.md`, evt. owns-register),
så den går gennem §8.1-gaten: `governance:check` grøn + Codex' eksplicitte
prosa-modsigelses-svar før merge.

exec
/bin/bash -lc "sed -n '1,240p' docs/strategi/vision-og-principper.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
# Stork 2.0 — Vision og principper

<!-- governance-owns: vision, principper -->

> **LÅST DOKUMENT.** Dette er grundstenen i Stork 2.0. Ændringer kræver eksplicit godkendelse fra Mathias via PR. CODEOWNERS håndhæver at kun Mathias kan approve ændringer. Dokumentet er autoritativ kilde for vision og principper — ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette. Undtagelse (D4): `forretningsforstaaelse.md` er med-stamme-doc — en modsigelse mellem de to er et hul der STOPPER arbejdet og lukkes af Mathias, ikke en konflikt dette dokument vinder.

## Vision

Stork 2.0 bygges til at holde. Vi tager ikke nemme løsninger, hardkodede
shortcuts, eller midlertidige fixes der bliver permanente. Hvert valg
vurderes mod hvad der står om 5 år, ikke hvad der virker i dag.

Systemet er fundamentet for Copenhagen Sales' drift. Det skal kunne tåle
ny lovgivning, nye klienter, nye datatyper, og nye krav uden at blive
bygget om. Det betyder data, rettigheder og forretningslogik styres i
UI — ikke i kode. Algoritmer lever i kode, alt andet i data. Du har
kontrollen, ikke en hardkodet regel.

Vi bygger greenfield. 1.0's anti-mønstre kopieres ikke, selv hvis det
går hurtigere. Workarounds uden plan er drift. Vi accepterer ikke
teknisk gæld uden eksplicit beslutning om hvornår den løses.

Audit, rettigheder, anonymisering og retention er ikke add-ons. Det er
fundament. De skal være på plads før systemet går i produktion, og de
skal kunne ændres i UI når nye regler kommer.

## Tre bærende principper

De tre essentielle principper hele systemet bygges på. Alt andet leder tilbage til disse.

1. **Én sandhed** — én autoritativ kilde pr. fakta. Database er sandheden; alt andet (frontend-state, edge-cache, beregningsresultater) er views af samme sandhed. Konflikt mellem to kilder er en fejl, ikke en feature.

2. **Styr på data** — hver kolonne har eksplicit semantik: klassifikation, PII-niveau, retention. GDPR-compliance er indbygget, ikke add-on.

3. **Sammenkobling eksplicit i modellen** — relations som data, ikke implicit i kode. FK-constraints er obligatoriske mellem relaterede entiteter.

De ni operationelle principper nedenfor er konkretiseringer af disse tre.

## Ni operationelle principper

### 1. Data-kontrol i UI

Al data — uanset kilde (UI, API, uploads) — klassificeres i UI for PII,
retention og anonymisering.

### 2. Rettigheder i UI

Team-træ styrer hvilken data der vises. Page/tabs styrer hvilke dele
af systemet der ses. Superadmin er eneste hardkodede rolle.

### 3. Forretningslogik som data

KPI'er, lønarter, formler, klassifikationer, regler — alt er data i UI.
Algoritmer er kode, værdier er data.

### 4. Default = intet

Ingen PII, ingen retention, ingen anonymisering, ingen audit-opgradering
medmindre det aktivt vælges i UI.

### 5. Lifecycle for konfiguration

Alt der påvirker data-håndtering gennemgår draft → tested → approved →
active. Aktivering er bevidst handling, ikke automatik.

### 6. Audit på alt der ændrer data

Per-row audit som default. Snapshot-tabeller har aggregat-audit som
undtagelse.

### 7. Anonymisering bevarer audit

Anonymisering er UPDATE der erstatter PII med placeholder. Row forbliver,
audit-spor bevares.

### 8. Identitet eksisterer én gang

Personer findes som én entitet. Systemer kobles via identity-mapping,
ikke parallelle person-tabeller.

### 9. Status-modeller bevarer historik

Forretningshandlinger ændrer aldrig oprindelig data. Statusændringer
sker via separate tabeller eller status-felter, aldrig ved overskrivning.

---

> **Aktører, roller og arbejdsmetode er flyttet til `docs/strategi/disciplin.md`.**
> Dette dokument handler om systemet Stork — ikke om hvordan vi arbejder.
> Ét hjem pr. begreb: proces bor i disciplin, ikke her.

exec
/bin/bash -lc "sed -n '1,260p' docs/coordination/gov-docs-renhed-plan.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
# gov-docs-renhed — Plan V4

**Branch:** claude/gov-docs-renhed-plan
**Krav-dok:** docs/coordination/gov-docs-renhed-krav-og-data.md
**Dato:** 2026-06-10
**Status-fil:** docs/coordination/gov-docs-renhed-status.md (konvergens-counter: 4 — §3.4-alert rejst, se status-fil)

## Formål

> Denne pakke leverer: et docs-repo hvor ingen doc eller script modsiger
> virkeligheden — plus de mekaniske værn der holder det rent — så fælles
> forståelse og workflow ikke kan brydes af drift.

## V1 → V2: Codex-fund runde 1 (alle ADRESSERET)

| #   | Fund                                                                            | Severity | Code-svar                                                                                                                                                                                                                         |
| --- | ------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Vision-banner i modstrid med D4 (§8.1-MODSIGELSE)                               | KRITISK  | **ACCEPT.** Vision-banneret patches (appendix A.1) — minimal D4-undtagelse, kilde er Mathias' egen D4-afgørelse i krav-dok. Vision er LÅST: ændringen håndhæves af Mathias' CODEOWNERS-approval ved merge; flagges eksplicit i PR |
| 2   | Patch-først ikke opfyldt (ingen body 1:1)                                       | KRITISK  | **ACCEPT.** Appendix A (docs) + B (scripts/checks) giver nuværende tekst 1:1 + ny tekst 1:1 pr. ændring                                                                                                                           |
| 3   | Repo-state-dump matcher ikke faktisk state                                      | MELLEM   | **ACCEPT.** Dump erstattet med pr.-tree-verificerede tal (git archive + scanner-kørsel pr. hash, se nedenfor)                                                                                                                     |
| 4   | Kæde-tjek/selftest dækker ikke fase:rapport + krydspegning                      | MELLEM   | **ACCEPT.** Check udvidet med plan→krav-dok-krydspeg + rapport-eksistens/Formål ved fase:rapport; 3 nye selftest-cases (i alt 7 nye)                                                                                              |
| 5   | §10.4 bliver stale kanonisk prompt                                              | MELLEM   | **ACCEPT.** §10.4 patches med i batch 2 (appendix A.7)                                                                                                                                                                            |
| 6   | _(Code-eget fund under runde 1-dispatch)_ `codex exec` hænger på stdin uden TTY | —        | Repair-diffen for codex-review.sh udvidet med `< /dev/null` på exec-linjen (appendix B.1) — fanget live: runde 1 hang på "Reading additional input from stdin..."                                                                 |

## V2 → V3: Codex-fund runde 2 (alle ADRESSERET)

| #    | Fund                                                                                                    | Severity | Code-svar                                                                                                                                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R2-1 | Parser matcher ikke `[KRITISK]`-bracketformat fra det nye §10.4-prompt — stopfund kan give exit 0       | KRITISK  | **ACCEPT.** Alle marker-greps gøres bracket-tolerante + ny `--parse-test`-selvtest i scriptet (appendix B.1, fund R2-1-blok)                                                                                                                              |
| R2-2 | State-dump stale pr. V2-commit (28e0010 = 22 docs, tabel siger 21)                                      | MELLEM   | **ACCEPT** (rettet nu frem for G-nummer — billigere end gælden). Dump omdefineret: baseline (main) er det autoritative måle-punkt planen patcher mod; branch-tallet drifter pr. plan-commit by construction og re-verificeres i build batch 3, ikke pr. V |
| R2-3 | Kæde-tjek: ingen status-krydspeg; fase:rapport fejler ikke når rapport mangler Formål-blok              | MELLEM   | **ACCEPT** (rettet nu). B.3: rapport uden Formål-blok = violation; plan→status-sti-krydspeg + status→pakkenavn-krydspeg; B.4: +2 cases (i alt 9)                                                                                                          |
| R2-4 | Master-plan kalder stadig forretningsforståelse "tanke-data" + vision-vinder-hierarki (§8.1-MODSIGELSE) | MELLEM   | **ACCEPT** (rettet nu). Ny A.14 patcher master-planens hierarki-afsnit. §8-rationale: master-plan er RETNINGSGIVENDE — Mathias har allerede afgjort løftet i krav-dok, så master-plan tilrettes (præcis som master-planen selv foreskriver)               |

## V3 → V4: Codex-fund runde 3 (alle ADRESSERET)

| #    | Fund                                                                                                 | Severity          | Code-svar                                                                                                                                              |
| ---- | ---------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R3-1 | A.6 efterlod §8-tabellens vision-række som "Vinder over alt" — to modsatrettede regler i samme tabel | KRITISK           | **ACCEPT.** A.6 udvidet: vision-rækken patches med D4-undtagelsen (nuværende 1:1 + ny 1:1 i A.6). Lukker §8.1-modsigelsen samlet med A.1/A.2/A.10/A.14 |
| R3-2 | parse-test mangler routing-dækning for WORKAROUND/ESCALATE/halt-marker                               | G-NUMMER-KANDIDAT | **ADOPT** (rettet nu frem for G-nummer). +3 fixtures i B.1 — alle fem exit-koder 0/1/2/3/4 beviste                                                     |

## Step 2.0 — Skitse + størrelses-tjek

**0 migrations.** 3 scripts slettes, 1 script repareres, 2 `.mjs`-filer udvides
(scanner + selftest), 11 docs patches (inkl. vision-banner, fund 1, +
master-plan-hierarki, fund R2-4). Under §3.8-grænsen → fuld plan, intet split.

## Verificerede repo-objekter (state-dump, fund 3-rettet)

§3.2 DB-state-dump er **N/A** — pakken rører ingen DB-objekter. Erstattet af
repo-state-dump. Metode: `git archive <hash> | tar -x` til temp-dir +
`node scripts/governance-check.mjs` i den — altså committed tree, ikke working
tree. Verificeret 2026-06-10:

| Tree                                                                   | Resultat                                      |
| ---------------------------------------------------------------------- | --------------------------------------------- |
| `main @ 1278e92`                                                       | alle 7 checks grønne — **18 docs, 6 scripts** |
| `claude/gov-docs-renhed-plan @ df4105d` (V1: + krav-dok, plan, status) | alle 7 checks grønne — **21 docs, 6 scripts** |

(V1 angav "19 docs" — det var en working-tree-kørsel med untracked krav-dok.
Præcis den fabrikations-flade selftesten's git-archive-fixture eksisterer for.)

**Måle-punkt-disciplin (fund R2-2):** baseline-rækken (main) er det autoritative
dump planen patcher mod. Branch-rækken drifter pr. plan-commit by construction
(hver V-commit tilføjer/ændrer docs — fx er V2-committen selv 22 docs) og
fastfryses derfor ikke pr. V; den re-verificeres som build-evidens i batch 3.

- **Scripts (`.sh`, scannet):** codex-review.sh (286 l) · claude-ai-prompt.sh
  (192 l) · data-grundlag.sh (173 l) · krav-afklar.sh (135 l) · schema-check.sh ·
  types-gen.sh
- **CI:** `governance:check` = `.github/workflows/ci.yml:67`,
  `governance:selftest` = `ci.yml:70`; package.json:27-28.
- **Allowlist:** `scripts/governance-check.mjs:42-99` — 12 entries med
  `klasse`-felt; `deadDocPaths()` (linje 129-142) bruger kun `ALLOWED`-settet
  (linje 100) og skelner IKKE på klasse eller fil-type. **Hullet:**
  `codex-review.sh:78` peger på slettet `docs/skabeloner/codex-review-prompt.md`
  og går grønt fordi entry'en findes som historisk-provenance.
- **H020:** historisk kode i `docs/teknisk/huskeliste.md:54` med tombstone-række
  linje 62. Refereres levende fra `disciplin.md:46` (§2) og `disciplin.md:174` (§6.2).
- **Allowlist-stiers referenter** (grep i scannerens scope — uden arkiv,
  v4-slettede-docs og rapport-historik):

  | Allowlist-sti                          | Refereres fra                                                                                              |
  | -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
  | skabeloner/codex-review-prompt.md      | codex-review.sh + krav-dok (prosa)                                                                         |
  | coordination/mathias-afgoerelser.md    | claude-ai-prompt.sh + data-grundlag.sh (kun scripts)                                                       |
  | overvaagning/claude-ai-overvaagning.md | claude-ai-prompt.sh (kun script)                                                                           |
  | overvaagning/codex-overvaagning.md     | gov-2-vagt-plan.md + teknisk-gaeld.md (prosa)                                                              |
  | strategi/bygge-status.md               | data-grundlag.sh + gov-2-vagt-plan.md + teknisk-gaeld.md                                                   |
  | skabeloner/plan-skabelon.md            | gov-2-vagt-plan.md + teknisk-gaeld.md (prosa)                                                              |
  | skabeloner/rapport-skabelon.md         | ingen i scannet scope (kun rapport-historik/README.md — scope-ekskluderet, derfor overlevede den døde ref) |
  | strategi/arbejds-disciplin.md          | gov-2-vagt-plan.md + teknisk-gaeld.md (prosa)                                                              |
  | coordination/plan-feedback             | claude-ai-prompt.sh + disciplin §4 (kortform uden mappe-prefix)                                            |
  | coordination/codex-reviews             | codex-review.sh                                                                                            |

## Repair-vs-slet-verdikt pr. script (krav-dok §Åbne spørgsmål, D1+D3)

| Script                | Verdikt    | Begrundelse                                                                                                                                                                                                                        |
| --------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `codex-review.sh`     | **REPAIR** | Severity-exit-routing (G055-arbejdet), timeout-håndtering og review-fil-med-header er reel værdi nu (manuel dispatch) og genbruges i gov-5-runneren. Bruddet er V5.3-skallen: prefix-fil + fire-dok-formål + stdin-hænger (fund 6) |
| `claude-ai-prompt.sh` | **SLET**   | Indlejrer fjernet fire-dok-ramme + V5.3-step-numre; peger på slettede mathias-afgoerelser.md + claude-ai-overvaagning.md. Substansen overhalet af SKILL.md-i-repo + Filesystem-MCP                                                 |
| `data-grundlag.sh`    | **SLET**   | V5.3 "Step 0"; læser slettet bygge-status.md. Substansen lever i §9.1 proaktiv recon (`qwers <pakke>`)                                                                                                                             |
| `krav-afklar.sh`      | **SLET**   | V5.3 "Step 2" + V5.3-routing. Substansen lever i V5 Step 1 + Step 2.1 Codex-parallel. Rækken i scripts/README.md fjernes med                                                                                                       |

Alle tre sletninger er `git rm` — fuld body bevares i git-history (§4).

## Mekaniske værn — design

### Værn 1: allowlist-split (krav pkt 9)

`deadDocPaths()` skelner fil-type: docs må bruge alle allowlist-klasser
(uændret); scripts må IKKE bruge `historisk-provenance`-entries, medmindre
scriptet har standalone-linje `# governance: deprecated`. Klasserne
`runtime-ephemeral` / `future-required` / `scope-excluded-local` gælder fortsat
begge fil-typer (scripts laver legitimt `mkdir -p` på runtime-stier). Kode 1:1 i
appendix B.2. Allowlist-vedligehold i samme commit: prune
`mathias-afgoerelser.md`, `claude-ai-overvaagning.md`, `rapport-skabelon.md`
(referenter væk efter sletninger + README-repoint — verificeres med
`GOV_VERBOSE=1`); resten beholdes (levende prosa-referenter).

### Værn 2: strukturelt kæde-tjek (krav pkt 10, fund 4-udvidet)

Ny check `structural-chain` (kode 1:1 i appendix B.3):

- **Markør** (standalone linje i aktiv-plan.md):
  `<!-- aktiv-pakke: <navn> fase: plan|build|rapport -->` eller
  `<!-- aktiv-pakke: ingen -->`. Manglende markør = violation (tilstand skal
  være eksplicit). `ingen` → pass.
- Ellers: `<navn>-krav-og-data.md` + `<navn>-plan.md` + `<navn>-status.md`
  skal eksistere i docs/coordination/.
- **Krydspeg (fund 4 + R2-3):** plan-filen skal indeholde stierne til BÅDE
  krav-dok og status-fil; status-filen skal nævne pakkenavnet.
- **Formåls-immutabilitet mekanisk (§3.0):** blockquoten der starter med
  `> Denne pakke leverer:` normaliseres (fortløbende `>`-linjer, prefix
  strippet, joinet, whitespace collapsed) — identisk i krav-dok og plan.
- **fase: rapport (fund 4 + R2-3):** mindst én
  `rapport-historik/*-<navn>.md` skal eksistere, HAVE en Formål-blok (mangler
  blokken er det en violation, ikke et skip) og matche den normaliserede
  Formål-streng.
- Strukturel + string-match, ingen semantik (ærlig grænse per krav-dok).

aktiv-plan.md får markøren i denne pakke (`fase: build` ved build-start;
`ingen` i merge-commit ved pakke-luk — doc-currency B).

### Værn 3: §8.1-SVAR som fast markør (krav pkt 11)

Markør-format: `§8.1-SVAR: INGEN-MODSIGELSE` eller
`§8.1-SVAR: MODSIGELSE — <begreb> ejes af <doc>`. Obligatorisk linje i
Codex-review når governance-doc er berørt; felt i slut-rapport-skabelonen
(§10.3) så den kan tjekkes i rapport/PR, ikke kun chat. Doc-patches i appendix
A.5/A.6/A.7. (Runde 1 af denne pakke brugte den allerede — og fangede fund 1.)

## End-to-end-spor (§3.3)

N/A i DB-forstand — ingen write-RPC'er. Det leverede spor er check-sporet:
planted overtrædelse → scanner rød → CI rød (ci.yml:67/70) → fix → grøn.
Beviset er selftest-casene (§3.6 opfyldt, ikke schema-only).

## End-to-end-test-design (fund 4-udvidet)

`governance-check.selftest.mjs` udvides med 9 cases (kode 1:1 i appendix B.4):

1. `script-dead-path`: script peger på historisk-provenance-sti → rød
   (ville have fanget krav-dok pkt 1)
2. `script-dead-path-deprecated`: samme + `# governance: deprecated` → grøn
   (flugtvejen er bevidst, ikke et hul)
3. `chain-missing-files`: markør sat, filer mangler → rød
4. `chain-formaal-mismatch`: krav↔plan Formål-streng afviger → rød
5. `chain-missing-krydspeg`: plan uden krav-dok-sti → rød
6. `chain-missing-status-krydspeg`: plan uden status-sti → rød (fund R2-3)
7. `chain-rapport-missing`: fase:rapport uden rapport-fil → rød
8. `chain-rapport-formaal-mismatch`: rapport-Formål afviger → rød
9. `chain-rapport-no-formaal`: rapport uden Formål-blok → rød (fund R2-3)

Baseline-case (ren git-archive-kopi → grøn) består uændret. Dertil
`codex-review.sh --parse-test` (appendix B.1, fund R2-1) som batch 1-evidens.

## Implementations-rækkefølge (3 batches)

| Batch                | Hvad                                                                                           | Afhængighed | Risiko                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| 1 — script-reconcile | git rm 3 scripts · repair codex-review.sh (appendix B.1) · scripts/README.md                   | ingen       | Lav. Governance-check grøn efter                                                          |
| 2 — doc-reconcile    | alle doc-patches (appendix A.1–A.14)                                                           | ingen       | Lav. §8.1-gate: Codex' §8.1-SVAR kræves; vision-patch kræver Mathias-CODEOWNERS ved merge |
| 3 — mekaniske værn   | allowlist-split + prune · kæde-tjek · aktiv-pakke-markør · 7 selftest-cases (appendix B.2–B.4) | batch 1+2   | Mellem. Selftest beviser begge retninger                                                  |

Rækkefølgen er bevidst: værnene lander mod et rent repo; selftest case 1
beviser at de ville have fanget batch 1-tilstanden.

## Doc-currency

**A. Fundament-validering (FØR qwerg):** Pakken ændrer BEGGE stamme-docs'
status-tekst: forretningsforstaaelse løftes til LÅST (Mathias' afgørelse i
krav-dok) og vision-banneret får D4-undtagelsen (fund 1 — implementerer Mathias'
D4, ingen ny Code-intention). Begge går gennem §8.1-gaten i dette review +
Mathias' CODEOWNERS-approval ved merge — valideret FØR qwerg via Codex'
§8.1-SVAR i godkendelses-runden. Øvrig plan: ingen forretnings-intentions-
ændring. Verificeret current pr. main @ `1278e92`.

**B. Status-opdatering (committes med merge):**

| Doc                        | Berørt? | Opdatering                                                                      |
| -------------------------- | ------- | ------------------------------------------------------------------------------- |
| aktiv-plan.md              | ja      | pakke-status + aktiv-pakke-markør (→ `ingen` ved pakke-luk)                     |
| seneste-rapport.md         | ja      | ny rapport-sti + commit ved Step 5                                              |
| master-plan §4.1           | delvist | §4.1-trinstatus uberørt (gov-spor); hierarki-afsnittet patches dog (A.14, R2-4) |
| teknisk-gaeld.md (G)       | nej     | G063 forbliver åben (gov-6); ingen G rejst/løst — medmindre build finder noget  |
| huskeliste.md (H)          | nej     | H020 forbliver historisk; refs repointes kun                                    |
| disciplin "Forudsætninger" | ja      | CI-blocker-linje + Gjort-listen à jour (§8.1-gate)                              |

## IKKE i denne plan

gov-4 branch protection (værnene gøres required DÉR) · gov-5 automation ·
gov-6 arkiv-fold (G063 + v4-slettede-docs) · P3-spor · semantisk
prosa-modsigelses-scanner (§8.1 lag 2 er Codex).

**Observation uden handling (gov-6-kandidat):** gov-1/gov-2/gov-3a-plan-filer
ligger stadig i docs/coordination/ trods §4. Noteres til gov-6.

## Åbne krav-dok-spørgsmål → afgjort

1. Script-verdikter: 1 repair, 3 slet (tabel ovenfor).
2. Kæde-tjek i CI eller on-demand: **CI** (kører via governance:check-steppet;
   required først i gov-4 per D2).

---

## Appendix A — Patch-først: docs (nuværende 1:1 → ny 1:1)

### A.1 `docs/strategi/vision-og-principper.md:5` (fund 1)

Nuværende:

> **LÅST DOKUMENT.** Dette er grundstenen i Stork 2.0. Ændringer kræver eksplicit godkendelse fra Mathias via PR. CODEOWNERS håndhæver at kun Mathias kan approve ændringer. Dokumentet er autoritativ kilde for vision og principper — ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette.

Ny (kun sidste sætning udvidet — resten bevares ordret):

> **LÅST DOKUMENT.** Dette er grundstenen i Stork 2.0. Ændringer kræver eksplicit godkendelse fra Mathias via PR. CODEOWNERS håndhæver at kun Mathias kan approve ændringer. Dokumentet er autoritativ kilde for vision og principper — ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette. Undtagelse (D4): `forretningsforstaaelse.md` er med-stamme-doc — en modsigelse mellem de to er et hul der STOPPER arbejdet og lukkes af Mathias, ikke en konflikt dette dokument vinder.

### A.2 `docs/strategi/forretningsforstaaelse.md` — LÅST-banner

Nuværende linje 1-5 (banner findes ikke):

```
# Stork 2.0 — Forretningsforståelse

<!-- governance-owns: forretnings-intention -->

Dette dokument forklarer hvordan Stork-forretningen hænger sammen. [...]
```

Ny: banner indsættes mellem owns-markøren og intro-afsnittet:

> **LÅST DOKUMENT (stamme-doc med vision-og-principper.md).** Ændringer kræver eksplicit godkendelse fra Mathias via PR; CODEOWNERS håndhæver. Opdateres når Mathias' tanker udvikler sig — men de to stamme-docs må aldrig være indbyrdes uenige: en modsigelse er et hul der STOPPER og lukkes af Mathias (D4). Mekanisk håndhævelse (required code-owner-review) lander i gov-4 — dette er doc-niveau-løftet.

### A.3 `disciplin.md:46` (§2 automation-note)

Nuværende (uddrag — kun den fede del ændres):

> [...] og plan-branchen er ikke dækket af triggeren **(H020)**. Indtil det bygges: [...]

Ny: `(H020)` → `(bygges i gov-5-automation)`. Resten af noten ordret bevaret.

exec
/bin/bash -lc 'rg -n "(''^##? ?§?5|''^##? ?5|Severity|SEVERITY|''^##? ?§?8'"\\.1|"'^##? ?8'"\\.1|"'^##? ?§?9'"\\.3|"'^##? ?9'"\\.3|patch|Patch|state-dump|MANGLENDE|bevarelse)\" docs/strategi/disciplin.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
20:| **Codex**     | Uafhængig kode-reviewer. Read-only. Bugs, RLS-huller, SQL-fejl, manglende-eksisterende-bevarelse                                          |
73:Batches på 3-5 migrations. Patch-først (§3.1). End-to-end-konsistens per batch. Smoke-fejl → STOP-gate (§3.7).
87:### 3.1 Patch-først (byg ovenpå, ikke nyt)
89:For HVER eksisterende funktion/policy/tabel der ændres: plan inkluderer NUVÆRENDE body 1:1 med file:linje + markerer DIFF eksplicit (hvad fjernes/tilføjes, hvilke gates/kommentarer/kolonner/audit-spor bevares) + migration starter med diff-summary. Tab af gate/kommentar/kolonne uden begrundelse = `MANGLENDE-EKSISTERENDE-BEVARELSE` (KRITISK).
91:### 3.2 DB-state-dump som plan-pre-condition
97:For hver write-RPC der ændres/tilføjes: (1) GRANT + policy + session-var som tre-pak, (2) SELECT-policy bred nok til alle legitime læsere, (3) apply-dispatcher-extension, (4) én eksempel-row gennem fuldt flow (UI → handler → RPC → DB → læsning), (5) krydscheck mod fundament-tjek. Manglende ét = KRITISK i plan-review.
144:## §5 Severities + FLAG/LØS-dialog
146:| Severity                             | Konsekvens                                                                                                                                       |
149:| **MANGLENDE-EKSISTERENDE-BEVARELSE** | KRITISK-undertype: mister gate/kommentar/kolonne fra eksisterende body uden begrundelse                                                          |
156:Hver severity bærer funktion — de kollapses ikke. (MANGLENDE-EKSISTERENDE-BEVARELSE binder patch-først; OPGRADERING muliggør approval+forslag samtidig.)
247:**MÅ IKKE:** forretnings-afgørelser · udvide scope uden plan-revurdering · afvige fra krav-dok-leverance uden gate · genfortolke eksisterende funktioner uden patch-først (§3.1) · ændre formål (§3.0).
249:**Plan-disciplin:** DB-state-dump (§3.2) · patch-først (§3.1) · end-to-end-spor (§3.3) · pre-push-tjekliste (formål matcher krav-dok, alle leverancer dækket, body-sektioner udfyldt).
256:**Plan-review-fokus (dækker den gamle fire-dok-konsultations substans):** patch-først korrekt? · end-to-end-spor alle 5? · DB-state-dump matcher faktisk state? · krav-dok-konsistens uden scope-creep? · vision + forretningsforstaaelse-modsigelse? **Approval:** APPROVAL eller FEEDBACK (undtagelse: APPROVAL + OPGRADERING). Kun Codex-approval kræves for plan.
307:## Verificerede DB-objekter (DB-state-dump)
315:## Patch-først pr. ændret funktion
321:[GRANT + policy + session-var + apply-dispatcher + eksempel-row-flow]
383:## §8.1-svar (hvis governance-docs berørt)
412:- Patch-først (§3.1): eksisterende body 1:1 + diff?
414:- DB-state-dump (§3.2): matcher faktisk state?
417:- MANGLENDE-EKSISTERENDE-BEVARELSE (KRITISK-undertype)
420:[SEVERITY] Kort beskrivelse
437:1. Hvilket vision-element understøtter dette? 2. Hvilket kunne det svække? 3. Findes en simplere løsning uden vision-kompromis? 4. Hvis kompromis: dokumenteret med G-nummer + deadline? 5. Skal en halt-marker rejses (§6.1)? 6. Patch-først overholdt (§3.1)? 7. End-to-end-spor dokumenteret (§3.3)? 8. Hvis destructive drop: preflight kørt (§3.9)?

exec
/bin/bash -lc "sed -n '1,260p' docs/coordination/gov-docs-renhed-status.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
# gov-docs-renhed — Pakke-status

**Sidste handling:** Build batch 5: Codex runde 6 gav 2 KRITISK — begge rettet (prettier-format på de to .mjs; MELLEM runde-aware routing + 4 nye fixtures, parse-test 14/14). 2026-06-10.
**Næste forventet:** Codex verifikations-review (runde 7) af batch 5 → grøn → Code skriver slut-rapport → Claude.ai-review FØR merge (Step 5) → Mathias "slut OK" + merge.
**Konvergens-counter:** 4 (plan-fase, afsluttet ved runde 4-APPROVAL). Build-reviews: runde 5 (3 KRITISK → batch 4/4b) · runde 6 (2 KRITISK → batch 5) · runde 7 afventes.
**Aktuel blocker:** ingen.

Build-state (qwerg 2026-06-10):

- Batch 1 ✓ (`ddc72db`): 3 V5.3-scripts slettet, codex-review.sh repareret.
  Evidens: --parse-test grøn, governance:check grøn.
- Batch 2 ✓ (`42bfb55`): doc-reconcile A.1–A.14. Evidens: governance:check grøn.
  (Fejl-committede også 17 v4-slettede-docs-filer — fanget af Codex runde 5,
  rettet i batch 4.)
- Batch 3 ✓ (`00c1ebd`): allowlist-split + structural-chain + sti-regex-fix +
  9 selftest-cases + aktiv-pakke-markør. Evidens: selftest fuldt grøn
  (baseline + 13 plantede + deprecated-positiv), fitness grøn.
- Batch 4 ✓: runde 5-fund-fixes (denne commit).

Plan-afvigelser (til slut-rapport):

1. rapport-skabelon-allowlist-entry beholdt (plan sagde prune) — planens egen
   A.12-tekst er levende prosa-referent; prune ved pakke-luk/gov-6.
2. v4-slettede-docs/ kortvarigt tracked i batch 2 (Code-fejl, `git add -A`) —
   untracked igen + .gitignore-værn i batch 4. Aldrig på main.
3. MANGLENDE-EKSISTERENDE-BEVARELSE-routing tilføjet parseren (runde 5-fund) —
   udvidelse af B.1 inden for §5-semantikken.
4. codex-reviews/ tilføjet scannerens DOC_EXCLUDE (batch 4b) — review-filer er
   ephemeral rå-output (§4) der bevidst citerer døde stier; first-time-fund da
   reviews aldrig før var committet som filer.
5. MELLEM-routing gjort runde-aware i parseren (runde 6-fund, batch 5) —
   §5 runde-trapper: exit 2 i runde 1, G-spor i runde 2+.

Noter:

- Krav OK 2026-06-10 · qwerg 2026-06-10. 0 migrations — ren docs+scripts-pakke.
- Reviews: codex-reviews/2026-06-10-gov-docs-renhed-runde-{1..4}.md (plan:
  2K+3M → 1K+3M → 1K+1G → APPROVAL) · runde-5.md (build: 3 KRITISK → batch 4).
- Driftsnote: `codex exec` uden TTY kræver `< /dev/null` — indbygget i repareret
  codex-review.sh.

codex
Planen og statusfilen siger, at runde 7 er verifikation efter batch 5. Jeg sammenligner derfor branchens samlede ændring mod `main` og tjekker især de rettelser, statusfilen hævder er landet.
exec
/bin/bash -lc 'git branch --show-current' in /home/mathias/stork-2.0
 succeeded in 0ms:
claude/gov-docs-renhed-build

exec
/bin/bash -lc 'git merge-base HEAD main' in /home/mathias/stork-2.0
 succeeded in 0ms:
20fa13a2c283cee2638a9621f44119ea9cd1b352

exec
/bin/bash -lc 'git status -sb' in /home/mathias/stork-2.0
 succeeded in 0ms:
## claude/gov-docs-renhed-build...origin/claude/gov-docs-renhed-build

exec
/bin/bash -lc "sed -n '80,105p' docs/strategi/disciplin.md && sed -n '144,160p' docs/strategi/disciplin.md && sed -n '240,260p' docs/strategi/disciplin.md && sed -n '380,423p' docs/strategi/disciplin.md" in /home/mathias/stork-2.0
 succeeded in 0ms:

## §3 Bygge-disciplin

### 3.0 Formåls-immutabilitet (genindført)

Hver pakke har ét FORMÅL (krav-dok §Formål). Når Mathias har godkendt det, er det **låst**. Code må ændre den tekniske implementations-vej undervejs (Code's domæne — flag i slut-rapport under Plan-afvigelser), men **ikke** formålet. Afslører implementation at formålet ikke kan leveres: STOP, eskalér. Codex-fund kan føre til bug-fix, implementations-ændring, G-nummer eller STOP+eskalation — **aldrig** til at Code ændrer formål, tilføjer features eller omtolker hvad pakken skal levere.

### 3.1 Patch-først (byg ovenpå, ikke nyt)

For HVER eksisterende funktion/policy/tabel der ændres: plan inkluderer NUVÆRENDE body 1:1 med file:linje + markerer DIFF eksplicit (hvad fjernes/tilføjes, hvilke gates/kommentarer/kolonner/audit-spor bevares) + migration starter med diff-summary. Tab af gate/kommentar/kolonne uden begrundelse = `MANGLENDE-EKSISTERENDE-BEVARELSE` (KRITISK).

### 3.2 DB-state-dump som plan-pre-condition

Code må ikke skrive plan før konkret DB-state er dumpet via Supabase MCP (RPC-bodies via `pg_get_functiondef`, kolonner+constraints, policies, grants) og lagt i plan under "Verificerede DB-objekter" som råt output. Ingen gæt, ingen cached state.

### 3.3 End-to-end-spor pr. write-vej

For hver write-RPC der ændres/tilføjes: (1) GRANT + policy + session-var som tre-pak, (2) SELECT-policy bred nok til alle legitime læsere, (3) apply-dispatcher-extension, (4) én eksempel-row gennem fuldt flow (UI → handler → RPC → DB → læsning), (5) krydscheck mod fundament-tjek. Manglende ét = KRITISK i plan-review.

### 3.4 Konvergens-counter med auto-STOP

Counter i pakke-status, incrementerer pr. V<n>. Runde 1-3 normalt · 4 Mathias-alert ("er krav-dok præcist nok?") · 5 auto-pause · 6+ auto-STOP (krav-dok genåbnes eller pakken splittes). Konvergerer vi ikke i 3-4 runder er problemet rammen, ikke "prøv igen".

### 3.5 Pakke-status.md — kontekst mellem sessioner

Hver aktiv pakke har én lille fil: sidste handling · næste forventet · konvergens-counter · aktuel blocker. AI'er læser den FØRST.
## §5 Severities + FLAG/LØS-dialog

| Severity                             | Konsekvens                                                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **KRITISK**                          | Stopper plan/build i alle runder. Code SKAL adressere næste runde                                                                                |
| **MANGLENDE-EKSISTERENDE-BEVARELSE** | KRITISK-undertype: mister gate/kommentar/kolonne fra eksisterende body uden begrundelse                                                          |
| **MELLEM**                           | Stopper i runde 1. G-nummer i runde 2+                                                                                                           |
| **KOSMETISK**                        | Stopper IKKE. G-nummer-kandidat                                                                                                                  |
| **OPGRADERING**                      | Stopper IKKE. Code afviser eller implementerer eksplicit i V<n+1>. Codex må give APPROVAL + OPGRADERING samtidig                                 |
| **NEEDS-MATHIAS**                    | Stopper i alle runder. Code kan ikke lave V<n+1> før Mathias afgør. Reviewer skriver eksplicit spørgsmål. Max 2 pr. review — flugtvej hvis flere |
| **FULDSTYRKE-MANGEL**                | Kun Mathias-rejst. AI scrapper output, gentager samme V-nummer                                                                                   |

Hver severity bærer funktion — de kollapses ikke. (MANGLENDE-EKSISTERENDE-BEVARELSE binder patch-først; OPGRADERING muliggør approval+forslag samtidig.)

**Runde-trapper:** runde 1 alle fund vurderes · runde 2 kun KRITISK stopper, MELLEM → G-numre · runde 3 kun KRITISK, resten → G-numre · runde 4+ se §3.4.

**FLAG → LØS (Code's svar pr. Codex-fund):** ACCEPT / PUSHBACK (argumentér; Codex: AGREE/REFINE) / PROPOSE-ALTERNATIVE. Max 3 LØS-iterationer pr. fund; > 3 → auto-eskalation via `mathias-gate/`.
**MÅ IKKE:** tekniske beslutninger · krav-dok-påstande uden Mathias-kilde · kode-vurdering (Codex' bord) · datamodel-design (Code's bord) · skrive "afgørelser" · påstå at noget ER bygget når et dokument kun siger det SKAL bygges (→ "ikke verificeret, Codes bord").
**Triggers:** `qwers` → bekræft rolle · `qwers <pakke>` → bekræft + proaktiv kontekst-recon STRENGT i forretnings-sprog (læs forretningsforstaaelse + evt. vision + søg rapport-historik; output: "det vi har" + targeted spørgsmål + scope-forslag; FORBUDT: tabel/kolonne/RPC-navne) · `qwerr` → slut-rapport-review.

### §9.2 Code

**Rolle:** builder.
**MÅ:** vælge tekniske løsninger inden for godkendt plan · PUSHBACK med teknisk grund · stoppe ved blokering og lave gate-fil.
**MÅ IKKE:** forretnings-afgørelser · udvide scope uden plan-revurdering · afvige fra krav-dok-leverance uden gate · genfortolke eksisterende funktioner uden patch-først (§3.1) · ændre formål (§3.0).
**Triggers:** `qwers` → bekræft · `qwerr` → læs pakke-status + udfør næste · `qwerg` → byg.
**Plan-disciplin:** DB-state-dump (§3.2) · patch-først (§3.1) · end-to-end-spor (§3.3) · pre-push-tjekliste (formål matcher krav-dok, alle leverancer dækket, body-sektioner udfyldt).

### §9.3 Codex

**Rolle:** uafhængig kode-reviewer, read-only.
**MÅ:** flage alt tvivlsomt på kode-niveau · foreslå OPGRADERING · bestride "kompromis" som mulig drift.
**MÅ IKKE:** skrive kode · beslutte · holde "nok OK" tilbage · acceptere "kendt gæld" uden G-nummer · eskalere alt til NEEDS-MATHIAS som flugt.
**Plan-review-fokus (dækker den gamle fire-dok-konsultations substans):** patch-først korrekt? · end-to-end-spor alle 5? · DB-state-dump matcher faktisk state? · krav-dok-konsistens uden scope-creep? · vision + forretningsforstaaelse-modsigelse? **Approval:** APPROVAL eller FEEDBACK (undtagelse: APPROVAL + OPGRADERING). Kun Codex-approval kræves for plan.

---

## §10 Skabeloner (inline)

[Reference til teknisk-gaeld.md]

## §8.1-svar (hvis governance-docs berørt)

## Konvergens-historie

| V<n> | Codex-fund | Code-svar | Outcome |

## Vision-tjek

- Rigtig løsning eller workaround?
- Vision-styrkelser / -svækkelser denne pakke
- Konklusion: forsvarligt / kompromis / drift
```

### §10.4 Codex-review-prompt-skabelon

```markdown
Du er Codex i Stork 2.0 — uafhængig kode-reviewer.

Læs FØR review:

- docs/strategi/vision-og-principper.md
- docs/strategi/forretningsforstaaelse.md (LÅST stamme-doc, D4)
- docs/strategi/disciplin.md §9.3 (din rolle)
- docs/coordination/<pakke>-krav-og-data.md (pakke-kontrakt)
- docs/coordination/<pakke>-plan.md (det du reviewer)
- docs/coordination/<pakke>-status.md (kontekst + konvergens-counter)

Review-fokus:

- Patch-først (§3.1): eksisterende body 1:1 + diff?
- End-to-end-spor (§3.3): alle 5 punkter pr. write-vej?
- DB-state-dump (§3.2): matcher faktisk state?
- Krav-dok-konsistens uden scope-creep
- Vision + forretningsforstaaelse-modsigelse
- MANGLENDE-EKSISTERENDE-BEVARELSE (KRITISK-undertype)

Format pr. fund:
[SEVERITY] Kort beskrivelse
Konkret afvigelse: ...
Anbefalet handling: [V<n+1>-rettelse / G-nummer / kosmetisk note]


exec
/bin/bash -lc 'git log --oneline --decorate --max-count=12' in /home/mathias/stork-2.0
 succeeded in 0ms:
2fdc9f0 (HEAD -> claude/gov-docs-renhed-build, origin/claude/gov-docs-renhed-build) gov-docs-renhed build batch 5: runde 6-fixes — prettier på governance-check{,.selftest}.mjs (KRITISK 1), MELLEM runde-aware routing per §5 runde-trapper + 4 fixtures (KRITISK 2), runde 6-review-fil
821e1b3 gov-docs-renhed build batch 4b: codex-reviews/ scope-ekskluderet i scanner — committede review-filer er ephemeral rå-output (§4) der bevidst citerer døde stier
1b87753 gov-docs-renhed build batch 4: runde 5-fixes — v4-slettede-docs untracked + .gitignore-værn (KRITISK 1), status-fil synkroniseret (KRITISK 2), MANGLENDE-EKSISTERENDE-BEVARELSE → exit 2 + fixture (KRITISK 3), runde 5-review-fil committet
00c1ebd gov-docs-renhed build batch 3: allowlist-split (klasse-skel + deprecated-flugtvej) + structural-chain (markør, krydspeg, Formål-immutabilitet mekanisk, fase:rapport) + danske bogstaver i sti-regex + 9 selftest-cases + aktiv-pakke-markør
42bfb55 gov-docs-renhed build batch 2: doc-reconcile A.1–A.14 — D4-konsistens i begge stamme-docs + §8-tabel + LÆSEFØLGE + master-plan, §8.1-SVAR-markør, branch-bevidst git-regel, §7 #4 ærlig label, Forudsætninger-sync, README-repoint, SKILL kanonisk
ddc72db gov-docs-renhed build batch 1: slet 3 V5.3-scripts + repair codex-review.sh (V5-prompt fra §10.4, bracket-tolerant parsing, --parse-test, stdin-fix) + README-række
4fe5164 (origin/claude/gov-docs-renhed-plan, claude/gov-docs-renhed-plan) gov-docs-renhed: Codex runde 4 APPROVAL + INGEN NYE FUND — plan-fase lukket, afventer qwerg
fd26f84 gov-docs-renhed Plan V4: R3-1 KRITISK — §8-vision-række D4-patches også; R3-2 ADOPT — parse-test fuld routing-dækning. Counter 4: §3.4-alert rejst i status (klar til Codex runde 4)
9c1dcff gov-docs-renhed Plan V3: runde 2-fund adresseret — bracket-tolerant marker-parsing + parse-test (KRITISK), kæde-tjek status-krydspeg + rapport-Formål-krav, master-plan-hierarki D4-patch, måle-punkt-disciplin (klar til Codex runde 3)
28e0010 gov-docs-renhed Plan V2: runde 1-fund adresseret — vision-banner D4, patch-først-appendix, præcis state-dump, kæde-tjek udvidet, §10.4-patch (klar til Codex runde 2)
df4105d gov-docs-renhed Plan V1: script-verdikter + doc-reconciles + allowlist-split + kæde-tjek (klar til Codex)
1278e92 (origin/main, origin/HEAD) gov-3b-3b: udfyld merge-hash (7be6511) i rapport + pointers

exec
/bin/bash -lc 'git diff --stat main...HEAD' in /home/mathias/stork-2.0
 succeeded in 0ms:
 .gitignore                                         |    3 +
 CLAUDE.md                                          |    2 +-
 "docs/L\303\206SEF\303\230LGE.md"                  |   16 +-
 docs/claude-ai/SKILL.md                            |    7 +
 docs/coordination/aktiv-plan.md                    |    4 +-
 .../2026-06-10-gov-docs-renhed-runde-1.md          |   33 +
 .../2026-06-10-gov-docs-renhed-runde-2.md          |   29 +
 .../2026-06-10-gov-docs-renhed-runde-3.md          |   19 +
 .../2026-06-10-gov-docs-renhed-runde-4.md          |   17 +
 .../2026-06-10-gov-docs-renhed-runde-5.md          | 3890 +++++++++++++
 .../2026-06-10-gov-docs-renhed-runde-6.md          | 5995 ++++++++++++++++++++
 docs/coordination/gov-docs-renhed-krav-og-data.md  |  173 +
 docs/coordination/gov-docs-renhed-plan.md          |  842 +++
 docs/coordination/gov-docs-renhed-status.md        |   40 +
 .../rapport-historik/2026-06-05-gov-3b-2.md        |   80 +
 .../rapport-historik/2026-06-07-gov-3b-3a.md       |  104 +
 .../rapport-historik/2026-06-07-gov-3b-3b.md       |   87 +
 docs/coordination/rapport-historik/README.md       |    2 +-
 docs/coordination/seneste-rapport.md               |    2 +-
 docs/strategi/disciplin.md                         |   71 +-
 docs/strategi/forretningsforstaaelse.md            |    2 +
 docs/strategi/stork-2-0-master-plan.md             |    4 +-
 docs/strategi/vision-og-principper.md              |    2 +-
 docs/teknisk/teknisk-gaeld.md                      |    8 +
 packages/types/src/database.ts                     |   28 +-
 scripts/README.md                                  |    1 -
 scripts/claude-ai-prompt.sh                        |  192 -
 scripts/codex-review.sh                            |  298 +-
 scripts/data-grundlag.sh                           |  173 -
 scripts/fitness.mjs                                |  220 +
 scripts/fitness.selftest.mjs                       |   67 +-
 scripts/governance-check.mjs                       |  107 +-
 scripts/governance-check.selftest.mjs              |   77 +
 scripts/krav-afklar.sh                             |  135 -
 ...0001_core_identity_secdef_permission_action.sql |   74 +
 ...100002_core_identity_secdef_permission_area.sql |   56 +
 ...100003_core_identity_secdef_permission_page.sql |   49 +
 ...7100004_core_identity_secdef_permission_tab.sql |   49 +
 ...7110001_core_identity_secdef_pending_change.sql |  183 +
 ..._core_identity_secdef_role_permission_grant.sql |   75 +
 ...607110003_core_identity_secdef_undo_setting.sql |   39 +
 ...e_identity_revoke_authenticated_core_writes.sql |   12 +
 .../tests/smoke/gov_3b_3a_permission_secdef.sql    |   75 +
 supabase/tests/smoke/gov_3b_3b_secdef_revoke.sql   |   58 +
 44 files changed, 12716 insertions(+), 684 deletions(-)

codex
Branchens base er ikke identisk med `main`, så `main...HEAD` indeholder også ældre gov-3b-historik. For runde 7 isolerer jeg build-ændringerne oven på den godkendte plan-commit `4fe5164`.
exec
/bin/bash -lc 'git diff --stat claude/gov-docs-renhed-plan..HEAD' in /home/mathias/stork-2.0
 succeeded in 0ms:
 .gitignore                                         |    3 +
 CLAUDE.md                                          |    2 +-
 "docs/L\303\206SEF\303\230LGE.md"                  |   16 +-
 docs/claude-ai/SKILL.md                            |    7 +
 docs/coordination/aktiv-plan.md                    |    4 +-
 .../2026-06-10-gov-docs-renhed-runde-5.md          | 3890 +++++++++++++
 .../2026-06-10-gov-docs-renhed-runde-6.md          | 5995 ++++++++++++++++++++
 docs/coordination/gov-docs-renhed-status.md        |   52 +-
 docs/coordination/rapport-historik/README.md       |    2 +-
 docs/strategi/disciplin.md                         |   49 +-
 docs/strategi/forretningsforstaaelse.md            |    2 +
 docs/strategi/stork-2-0-master-plan.md             |    2 +-
 docs/strategi/vision-og-principper.md              |    2 +-
 scripts/README.md                                  |    1 -
 scripts/claude-ai-prompt.sh                        |  192 -
 scripts/codex-review.sh                            |  298 +-
 scripts/data-grundlag.sh                           |  173 -
 scripts/governance-check.mjs                       |  107 +-
 scripts/governance-check.selftest.mjs              |   77 +
 scripts/krav-afklar.sh                             |  135 -
 20 files changed, 10338 insertions(+), 671 deletions(-)

exec
/bin/bash -lc 'git diff --name-status claude/gov-docs-renhed-plan..HEAD' in /home/mathias/stork-2.0
 succeeded in 0ms:
M	.gitignore
M	CLAUDE.md
M	"docs/L\303\206SEF\303\230LGE.md"
M	docs/claude-ai/SKILL.md
M	docs/coordination/aktiv-plan.md
A	docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md
A	docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md
M	docs/coordination/gov-docs-renhed-status.md
M	docs/coordination/rapport-historik/README.md
M	docs/strategi/disciplin.md
M	docs/strategi/forretningsforstaaelse.md
M	docs/strategi/stork-2-0-master-plan.md
M	docs/strategi/vision-og-principper.md
M	scripts/README.md
D	scripts/claude-ai-prompt.sh
M	scripts/codex-review.sh
D	scripts/data-grundlag.sh
M	scripts/governance-check.mjs
M	scripts/governance-check.selftest.mjs
D	scripts/krav-afklar.sh

exec
/bin/bash -lc 'git diff --check claude/gov-docs-renhed-plan..HEAD' in /home/mathias/stork-2.0
 exited 2 in 0ms:
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1305: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1339: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1486: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1551: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1553: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1589: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1591: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1714: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1719: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1737: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1748: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1754: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1757: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1759: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1772: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1786: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1790: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1796: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1809: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1815: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1825: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1828: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1833: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1836: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1903: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1907: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1936: trailing whitespace.
+   176	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1938: trailing whitespace.
+   178	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1944: trailing whitespace.
+   184	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1947: trailing whitespace.
+   187	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1949: trailing whitespace.
+   189	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1957: trailing whitespace.
+   197	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1959: trailing whitespace.
+   199	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1968: trailing whitespace.
+   208	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1970: trailing whitespace.
+   210	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1974: trailing whitespace.
+   214	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1977: trailing whitespace.
+   217	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1979: trailing whitespace.
+   219	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1983: trailing whitespace.
+   223	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1985: trailing whitespace.
+   225	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1987: trailing whitespace.
+   227	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1989: trailing whitespace.
+   229	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1991: trailing whitespace.
+   231	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1993: trailing whitespace.
+   233	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1995: trailing whitespace.
+   235	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1997: trailing whitespace.
+   237	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:1999: trailing whitespace.
+   239	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2001: trailing whitespace.
+   241	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2004: trailing whitespace.
+   244	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2009: trailing whitespace.
+   271	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2011: trailing whitespace.
+   273	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2014: trailing whitespace.
+   276	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2016: trailing whitespace.
+   278	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2019: trailing whitespace.
+   281	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2023: trailing whitespace.
+   285	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2025: trailing whitespace.
+   287	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2029: trailing whitespace.
+   291	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2031: trailing whitespace.
+   293	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2035: trailing whitespace.
+   297	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2037: trailing whitespace.
+   299	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2046: trailing whitespace.
+   308	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2048: trailing whitespace.
+   310	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2052: trailing whitespace.
+   314	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2054: trailing whitespace.
+   316	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2056: trailing whitespace.
+   318	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2060: trailing whitespace.
+   322	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2062: trailing whitespace.
+   324	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2064: trailing whitespace.
+   326	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2083: trailing whitespace.
+    93	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2085: trailing whitespace.
+    95	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2101: trailing whitespace.
+   111	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2103: trailing whitespace.
+   113	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2118: trailing whitespace.
+   128	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2120: trailing whitespace.
+   130	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2126: trailing whitespace.
+     2	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2131: trailing whitespace.
+     7	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2133: trailing whitespace.
+     9	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2143: trailing whitespace.
+    19	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2145: trailing whitespace.
+    21	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2207: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2211: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2213: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2219: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2221: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2230: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2233: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2240: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2245: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2271: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2273: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2278: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2280: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2286: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2288: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2291: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2293: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2299: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2301: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2304: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2306: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2308: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2310: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2313: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2315: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2317: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2319: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2336: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2338: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2340: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2342: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2354: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2356: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2358: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2360: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2366: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2369: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2371: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2375: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2379: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2395: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2398: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2400: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2403: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2405: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2407: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2412: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2415: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2417: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2423: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2425: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2428: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:2430: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3445: trailing whitespace.
+    20	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3451: trailing whitespace.
+    26	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3453: trailing whitespace.
+    28	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3459: trailing whitespace.
+    34	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3461: trailing whitespace.
+    36	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3544: trailing whitespace.
+     2	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3546: trailing whitespace.
+     4	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3548: trailing whitespace.
+     6	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3550: trailing whitespace.
+     8	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3552: trailing whitespace.
+    10	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3559: trailing whitespace.
+    17	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3640: trailing whitespace.
+    28	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3642: trailing whitespace.
+    30	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3648: trailing whitespace.
+    36	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3653: trailing whitespace.
+    41	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3658: trailing whitespace.
+    46	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3663: trailing whitespace.
+    51	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3672: trailing whitespace.
+    60	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3678: trailing whitespace.
+    66	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3683: trailing whitespace.
+    71	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3688: trailing whitespace.
+    76	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3692: trailing whitespace.
+    80	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3696: trailing whitespace.
+    84	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3700: trailing whitespace.
+    88	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3704: trailing whitespace.
+    92	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3713: trailing whitespace.
+   101	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3718: trailing whitespace.
+   106	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3752: trailing whitespace.
+   127	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3754: trailing whitespace.
+   129	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3756: trailing whitespace.
+   131	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3758: trailing whitespace.
+   133	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3760: trailing whitespace.
+   135	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3762: trailing whitespace.
+   137	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3764: trailing whitespace.
+   139	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3766: trailing whitespace.
+   141	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3768: trailing whitespace.
+   143	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3770: trailing whitespace.
+   145	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3782: trailing whitespace.
+   400	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3784: trailing whitespace.
+   402	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3791: trailing whitespace.
+   409	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3793: trailing whitespace.
+   411	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3800: trailing whitespace.
+   418	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3805: trailing whitespace.
+   423	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3859: trailing whitespace.
+[KRITISK] Gov-6-arbejde er bygget i forkert pakke  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3860: trailing whitespace.
+Konkret afvigelse: Krav-dok og Plan V4 siger eksplicit at `v4-slettede-docs/`/arkiv-fold hører til gov-6, ikke denne pakke. Builden tilføjer alligevel 17 tracked filer under `docs/coordination/v4-slettede-docs/` i batch 2.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3863: trailing whitespace.
+[KRITISK] Pakke-status matcher ikke faktisk build-state  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3864: trailing whitespace.
+Konkret afvigelse: `gov-docs-renhed-status.md` siger stadig “INTET bygges før qwerg” og “afventer Mathias”, mens branch HEAD har batch 1-3 bygget, og `aktiv-plan.md` markerer `fase: build`. Det bryder formålet: docs må ikke modsige virkeligheden.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3867: trailing whitespace.
+[KRITISK] `codex-review.sh` lader kritisk subtype passere som exit 0  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3868: trailing whitespace.
+Konkret afvigelse: Disciplin §5 definerer `MANGLENDE-EKSISTERENDE-BEVARELSE` som KRITISK-undertype, og §10.4 beder Codex flage den. Parseren stopper kun på `KRITISK`, ikke på denne subtype; `--parse-test` har heller ingen fixture for den.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3876: trailing whitespace.
+[KRITISK] Gov-6-arbejde er bygget i forkert pakke  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3877: trailing whitespace.
+Konkret afvigelse: Krav-dok og Plan V4 siger eksplicit at `v4-slettede-docs/`/arkiv-fold hører til gov-6, ikke denne pakke. Builden tilføjer alligevel 17 tracked filer under `docs/coordination/v4-slettede-docs/` i batch 2.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3880: trailing whitespace.
+[KRITISK] Pakke-status matcher ikke faktisk build-state  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3881: trailing whitespace.
+Konkret afvigelse: `gov-docs-renhed-status.md` siger stadig “INTET bygges før qwerg” og “afventer Mathias”, mens branch HEAD har batch 1-3 bygget, og `aktiv-plan.md` markerer `fase: build`. Det bryder formålet: docs må ikke modsige virkeligheden.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3884: trailing whitespace.
+[KRITISK] `codex-review.sh` lader kritisk subtype passere som exit 0  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3885: trailing whitespace.
+Konkret afvigelse: Disciplin §5 definerer `MANGLENDE-EKSISTERENDE-BEVARELSE` som KRITISK-undertype, og §10.4 beder Codex flage den. Parseren stopper kun på `KRITISK`, ikke på denne subtype; `--parse-test` har heller ingen fixture for den.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1369: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1410: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1412: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1542: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1547: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1565: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1576: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1582: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1585: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1587: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1600: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1614: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1618: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1624: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1637: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1643: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1653: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1656: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1661: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1664: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1731: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1735: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1835: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:1869: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2016: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2038: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2042: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2044: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2050: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2052: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2061: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2064: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2071: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2076: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2102: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2104: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2109: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2111: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2161: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2163: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2166: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2168: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2174: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2176: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2179: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2181: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2183: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2185: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2188: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2190: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2192: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2194: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2211: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2213: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2215: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2217: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2229: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2231: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2233: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2235: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2241: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2244: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2246: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2250: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2254: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2270: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2273: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2275: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2278: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2280: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2282: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2287: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2290: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2292: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2298: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2300: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2304: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2311: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2313: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2316: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2318: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2324: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2326: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2329: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2331: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2341: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:2343: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4135: trailing whitespace.
+docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3860:Konkret afvigelse: Krav-dok og Plan V4 siger eksplicit at `v4-slettede-docs/`/arkiv-fold hører til gov-6, ikke denne pakke. Builden tilføjer alligevel 17 tracked filer under `docs/coordination/v4-slettede-docs/` i batch 2.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4136: trailing whitespace.
+docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3868:Konkret afvigelse: Disciplin §5 definerer `MANGLENDE-EKSISTERENDE-BEVARELSE` som KRITISK-undertype, og §10.4 beder Codex flage den. Parseren stopper kun på `KRITISK`, ikke på denne subtype; `--parse-test` har heller ingen fixture for den.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4138: trailing whitespace.
+docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3877:Konkret afvigelse: Krav-dok og Plan V4 siger eksplicit at `v4-slettede-docs/`/arkiv-fold hører til gov-6, ikke denne pakke. Builden tilføjer alligevel 17 tracked filer under `docs/coordination/v4-slettede-docs/` i batch 2.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4139: trailing whitespace.
+docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-5.md:3885:Konkret afvigelse: Disciplin §5 definerer `MANGLENDE-EKSISTERENDE-BEVARELSE` som KRITISK-undertype, og §10.4 beder Codex flage den. Parseren stopper kun på `KRITISK`, ikke på denne subtype; `--parse-test` har heller ingen fixture for den.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4410: trailing whitespace.
++[KRITISK] Vision-banner efterlades i modstrid med D4  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4412: trailing whitespace.
++Konkret afvigelse: Planen siger “vision uberørt”, men `vision-og-principper.md` siger stadig at vision vinder over “andre dokumenter”. Samtidig vil V2 gøre forretningsforståelse LÅST og “ingen trumf” ved vision↔forretningsforståelse-konflikt.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4414: trailing whitespace.
++[KRITISK] Patch-først er ikke opfyldt  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4416: trailing whitespace.
++Konkret afvigelse: Planen giver snippets/tabel-diff, men ikke eksisterende body 1:1 pr. ændret script/doc. Det gør bevarelse af gates/kommentarer ikke reviewbar, især for `codex-review.sh`, `governance-check.mjs`, selftest og doc-skabeloner.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4418: trailing whitespace.
++[MELLEM] Repo-state-dump matcher ikke faktisk state  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4420: trailing whitespace.
++Konkret afvigelse: Planen siger `main @ 1278e92` og `19 docs`; verificeret `origin/main @ 1278e92` giver 18 docs, planbranch HEAD er `df4105d` og working tree-check giver 21 docs.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4422: trailing whitespace.
++[MELLEM] Kæde-tjek/selftests beviser ikke hele krav pkt. 10  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4424: trailing whitespace.
++Konkret afvigelse: Cases dækker manglende plan og formåls-mismatch krav↔plan, men ikke `fase: rapport`, manglende/mismatchende slut-rapport eller status-krydspegning.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4426: trailing whitespace.
++[MELLEM] `disciplin.md §10.4` bliver stale kanonisk prompt  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4428: trailing whitespace.
++Konkret afvigelse: `codex-review.sh` skal generere prompt fra §10.4, men planen patcher ikke §10.4, som stadig kalder forretningsforståelse “tanke-data, ikke kontrakt” og bruger gamle marker-termer.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4430: trailing whitespace.
++[KRITISK] `codex-review.sh` kan overse KRITISK efter nyt §10.4-format  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4432: trailing whitespace.
++Konkret afvigelse: V2-prompten kræver `[SEVERITY]` (`gov-docs-renhed-plan.md:469`), men B.1 bevarer parseren der kun matcher `^KRITISK\b` (`scripts/codex-review.sh:224`). `[KRITISK] test` matcher ikke, så et stopfund kan ende med exit 0.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4434: trailing whitespace.
++[MELLEM] State-dump er stadig stale for V2-committen  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4436: trailing whitespace.
++Konkret afvigelse: Planen verificerer `main @ 1278e92` og V1 `df4105d`, men aktuel V2 er `28e0010`; `git archive 28e0010` giver governance-check grøn med **22 docs, 6 scripts**, ikke tabellens 21 docs.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4438: trailing whitespace.
++[MELLEM] Kæde-tjek dækker stadig ikke hele pkt. 10  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4440: trailing whitespace.
++Konkret afvigelse: B.3 kræver status-filens eksistens, men ingen status-krydspegning. I `fase:rapport` fejler den ikke hvis rapporten mangler `> Denne pakke leverer:`-Formål-blokken, fordi den kun sammenligner når `fr` findes. B.4 mangler negative cases for begge.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4442: trailing whitespace.
++[MELLEM] D4-løftet efterlader master-plan-modsigelse  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4444: trailing whitespace.
++Konkret afvigelse: A.1 lukker den direkte vision-banner-modsigelse reelt, men `docs/strategi/stork-2-0-master-plan.md:40` kalder stadig forretningsforståelse “tanke-data” og siger at vision vinder over den.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4446: trailing whitespace.
++[KRITISK] A.6 efterlader D4-modsigelse i disciplin §8  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4448: trailing whitespace.
++Konkret afvigelse: V3 retter master-planen i A.14, men A.6 indsætter kun en ny `forretningsforstaaelse.md`-række efter den eksisterende vision-række. Vision-rækken bevares som “Vinder over alt”, mens den nye række siger “ingen trumf”. Planen efterlader derfor to modsatrettede regler i samme §8. A.14 lukker master-plan-teksten, men §8.1-modsigelsen er ikke lukket samlet.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4450: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4452: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4454: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4456: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4458: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4460: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4462: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4464: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4466: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4468: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4470: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4472: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4474: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4476: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4478: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4480: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4482: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4484: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4486: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4488: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4490: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4492: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4494: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4496: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4498: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4500: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4502: trailing whitespace.
++   176	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4504: trailing whitespace.
++   178	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4506: trailing whitespace.
++   184	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4508: trailing whitespace.
++   187	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4510: trailing whitespace.
++   189	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4512: trailing whitespace.
++   197	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4514: trailing whitespace.
++   199	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4516: trailing whitespace.
++   208	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4518: trailing whitespace.
++   210	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4520: trailing whitespace.
++   214	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4522: trailing whitespace.
++   217	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4524: trailing whitespace.
++   219	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4526: trailing whitespace.
++   223	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4528: trailing whitespace.
++   225	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4530: trailing whitespace.
++   227	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4532: trailing whitespace.
++   229	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4534: trailing whitespace.
++   231	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4536: trailing whitespace.
++   233	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4538: trailing whitespace.
++   235	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4540: trailing whitespace.
++   237	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4542: trailing whitespace.
++   239	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4544: trailing whitespace.
++   241	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4546: trailing whitespace.
++   244	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4548: trailing whitespace.
++   271	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4550: trailing whitespace.
++   273	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4552: trailing whitespace.
++   276	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4554: trailing whitespace.
++   278	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4556: trailing whitespace.
++   281	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4558: trailing whitespace.
++   285	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4560: trailing whitespace.
++   287	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4562: trailing whitespace.
++   291	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4564: trailing whitespace.
++   293	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4566: trailing whitespace.
++   297	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4568: trailing whitespace.
++   299	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4570: trailing whitespace.
++   308	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4572: trailing whitespace.
++   310	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4574: trailing whitespace.
++   314	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4576: trailing whitespace.
++   316	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4578: trailing whitespace.
++   318	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4580: trailing whitespace.
++   322	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4582: trailing whitespace.
++   324	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4584: trailing whitespace.
++   326	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4586: trailing whitespace.
++    93	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4588: trailing whitespace.
++    95	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4590: trailing whitespace.
++   111	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4592: trailing whitespace.
++   113	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4594: trailing whitespace.
++   128	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4596: trailing whitespace.
++   130	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4598: trailing whitespace.
++     2	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4600: trailing whitespace.
++     7	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4602: trailing whitespace.
++     9	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4604: trailing whitespace.
++    19	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4606: trailing whitespace.
++    21	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4608: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4610: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4612: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4614: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4616: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4618: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4620: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4622: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4624: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4626: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4628: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4630: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4632: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4634: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4636: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4638: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4640: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4642: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4644: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4646: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4648: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4650: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4652: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4654: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4656: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4658: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4660: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4662: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4664: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4666: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4668: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4670: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4672: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4674: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4676: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4678: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4680: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4682: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4684: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4686: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4688: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4690: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4692: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4694: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4696: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4698: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4700: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4702: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4704: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4706: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4708: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4710: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4712: trailing whitespace.
++ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4714: trailing whitespace.
++    20	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4716: trailing whitespace.
++    26	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4718: trailing whitespace.
++    28	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4720: trailing whitespace.
++    34	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4722: trailing whitespace.
++    36	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4724: trailing whitespace.
++     2	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4726: trailing whitespace.
++     4	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4728: trailing whitespace.
++     6	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4730: trailing whitespace.
++     8	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4732: trailing whitespace.
++    10	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4734: trailing whitespace.
++    17	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4736: trailing whitespace.
++    28	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4738: trailing whitespace.
++    30	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4740: trailing whitespace.
++    36	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4742: trailing whitespace.
++    41	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4744: trailing whitespace.
++    46	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4746: trailing whitespace.
++    51	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4748: trailing whitespace.
++    60	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4750: trailing whitespace.
++    66	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4752: trailing whitespace.
++    71	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4754: trailing whitespace.
++    76	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4756: trailing whitespace.
++    80	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4758: trailing whitespace.
++    84	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4760: trailing whitespace.
++    88	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4762: trailing whitespace.
++    92	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4764: trailing whitespace.
++   101	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4766: trailing whitespace.
++   106	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4768: trailing whitespace.
++   127	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4770: trailing whitespace.
++   129	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4772: trailing whitespace.
++   131	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4774: trailing whitespace.
++   133	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4776: trailing whitespace.
++   135	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4778: trailing whitespace.
++   137	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4780: trailing whitespace.
++   139	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4782: trailing whitespace.
++   141	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4784: trailing whitespace.
++   143	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4786: trailing whitespace.
++   145	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4788: trailing whitespace.
++   400	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4790: trailing whitespace.
++   402	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4792: trailing whitespace.
++   409	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4794: trailing whitespace.
++   411	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4796: trailing whitespace.
++   418	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4798: trailing whitespace.
++   423	
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4800: trailing whitespace.
++[KRITISK] Gov-6-arbejde er bygget i forkert pakke  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4802: trailing whitespace.
++Konkret afvigelse: Krav-dok og Plan V4 siger eksplicit at `v4-slettede-docs/`/arkiv-fold hører til gov-6, ikke denne pakke. Builden tilføjer alligevel 17 tracked filer under `docs/coordination/v4-slettede-docs/` i batch 2.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4804: trailing whitespace.
++[KRITISK] Pakke-status matcher ikke faktisk build-state  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4806: trailing whitespace.
++Konkret afvigelse: `gov-docs-renhed-status.md` siger stadig “INTET bygges før qwerg” og “afventer Mathias”, mens branch HEAD har batch 1-3 bygget, og `aktiv-plan.md` markerer `fase: build`. Det bryder formålet: docs må ikke modsige virkeligheden.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4808: trailing whitespace.
++[KRITISK] `codex-review.sh` lader kritisk subtype passere som exit 0  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4810: trailing whitespace.
++Konkret afvigelse: Disciplin §5 definerer `MANGLENDE-EKSISTERENDE-BEVARELSE` som KRITISK-undertype, og §10.4 beder Codex flage den. Parseren stopper kun på `KRITISK`, ikke på denne subtype; `--parse-test` har heller ingen fixture for den.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4812: trailing whitespace.
++[KRITISK] Gov-6-arbejde er bygget i forkert pakke  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4814: trailing whitespace.
++Konkret afvigelse: Krav-dok og Plan V4 siger eksplicit at `v4-slettede-docs/`/arkiv-fold hører til gov-6, ikke denne pakke. Builden tilføjer alligevel 17 tracked filer under `docs/coordination/v4-slettede-docs/` i batch 2.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4816: trailing whitespace.
++[KRITISK] Pakke-status matcher ikke faktisk build-state  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4818: trailing whitespace.
++Konkret afvigelse: `gov-docs-renhed-status.md` siger stadig “INTET bygges før qwerg” og “afventer Mathias”, mens branch HEAD har batch 1-3 bygget, og `aktiv-plan.md` markerer `fase: build`. Det bryder formålet: docs må ikke modsige virkeligheden.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4820: trailing whitespace.
++[KRITISK] `codex-review.sh` lader kritisk subtype passere som exit 0  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:4822: trailing whitespace.
++Konkret afvigelse: Disciplin §5 definerer `MANGLENDE-EKSISTERENDE-BEVARELSE` som KRITISK-undertype, og §10.4 beder Codex flage den. Parseren stopper kun på `KRITISK`, ikke på denne subtype; `--parse-test` har heller ingen fixture for den.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5768: trailing whitespace.
+@stork/web:lint: 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5771: trailing whitespace.
+@stork/web:lint: 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5791: trailing whitespace.
+@stork/web:typecheck: 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5794: trailing whitespace.
+@stork/web:typecheck: 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5795: trailing whitespace.
+@stork/types:typecheck: 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5798: trailing whitespace.
+@stork/types:typecheck: 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5802: trailing whitespace.
+  Time:    987ms 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5842: trailing whitespace.
+@stork/web:test: 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5845: trailing whitespace.
+@stork/web:test: 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5846: trailing whitespace.
+@stork/web:test: 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5848: trailing whitespace.
+@stork/web:test: 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5850: trailing whitespace.
+@stork/web:test: 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5855: trailing whitespace.
+@stork/web:test: 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5895: trailing whitespace.
+ 
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5976: trailing whitespace.
+[KRITISK] Required CI-format fejler  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5977: trailing whitespace.
+Konkret afvigelse: `pnpm format:check` fejler på `scripts/governance-check.mjs` og `scripts/governance-check.selftest.mjs`. CI kører samme check før governance-checks, så build-state er ikke faktisk grøn.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5980: trailing whitespace.
+[KRITISK] `codex-review.sh` ruter ikke `[MELLEM]` efter §5  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5981: trailing whitespace.
+Konkret afvigelse: §5 siger MELLEM stopper i runde 1, men parseren returnerer exit 0 for `[MELLEM] ...`; `--parse-test` har heller ingen MELLEM-fixture. Det kollapser en severity-funktion i V5-wrapperen.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5987: trailing whitespace.
+[KRITISK] Required CI-format fejler  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5988: trailing whitespace.
+Konkret afvigelse: `pnpm format:check` fejler på `scripts/governance-check.mjs` og `scripts/governance-check.selftest.mjs`. CI kører samme check før governance-checks, så build-state er ikke faktisk grøn.  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5991: trailing whitespace.
+[KRITISK] `codex-review.sh` ruter ikke `[MELLEM]` efter §5  
docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md:5992: trailing whitespace.
+Konkret afvigelse: §5 siger MELLEM stopper i runde 1, men parseren returnerer exit 0 for `[MELLEM] ...`; `--parse-test` har heller ingen MELLEM-fixture. Det kollapser en severity-funktion i V5-wrapperen.  

exec
/bin/bash -lc 'npm run governance:check' in /home/mathias/stork-2.0
exec
/bin/bash -lc 'npm run governance:selftest' in /home/mathias/stork-2.0
 succeeded in 165ms:
✓ dead-doc-paths
✓ junk-files
✓ laesefoelge-targets
✓ pointer-validity
✓ owns-uniqueness
✓ number-home-uniqueness
✓ H-ref-integrity
✓ structural-chain

Governance-check: alle checks passed (21 docs, 3 scripts)

 succeeded in 1785ms:
  ✓ baseline ren kopi -> exit 0
  ✓ planted dead-doc-paths -> exit != 0
  ✓ planted junk-files -> exit != 0
  ✓ planted owns-uniqueness -> exit != 0
  ✓ planted number-home-uniqueness -> exit != 0
  ✓ planted H-ref-integrity -> exit != 0
  ✓ planted script-dead-path -> exit != 0
  ✓ planted chain-missing-files -> exit != 0
  ✓ planted chain-formaal-mismatch -> exit != 0
  ✓ planted chain-missing-krydspeg -> exit != 0
  ✓ planted chain-missing-status-krydspeg -> exit != 0
  ✓ planted chain-rapport-missing -> exit != 0
  ✓ planted chain-rapport-formaal-mismatch -> exit != 0
  ✓ planted chain-rapport-no-formaal -> exit != 0
  ✓ script-dead-path-deprecated -> exit 0

Governance selftest: alle cases passed

codex
`governance:check` og `governance:selftest` er grønne. Der er dog rå review-filer med trailing whitespace i diffen; jeg tjekker om det rammer repoets faktiske CI/format-gate eller kun er et git-hygiejnefund.
exec
/bin/bash -lc 'node scripts/codex-review.sh --parse-test' in /home/mathias/stork-2.0
 exited 1 in 0ms:
node:internal/modules/esm/get_format:236
  throw new ERR_UNKNOWN_FILE_EXTENSION(ext, filepath);
        ^

TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".sh" for /home/mathias/stork-2.0/scripts/codex-review.sh
    at Object.getFileProtocolModuleFormat [as file:] (node:internal/modules/esm/get_format:236:9)
    at defaultGetFormat (node:internal/modules/esm/get_format:262:36)
    at defaultLoadSync (node:internal/modules/esm/load:158:16)
    at #loadAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:776:12)
    at #loadSync (node:internal/modules/esm/loader:796:49)
    at ModuleLoader.load (node:internal/modules/esm/loader:762:26)
    at ModuleLoader.loadAndTranslate (node:internal/modules/esm/loader:504:31)
    at #getOrCreateModuleJobAfterResolve (node:internal/modules/esm/loader:555:36)
    at afterResolve (node:internal/modules/esm/loader:603:52)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:609:12) {
  code: 'ERR_UNKNOWN_FILE_EXTENSION'
}

Node.js v24.15.0

exec
/bin/bash -lc "rg -n \"format:check|governance:check|governance:selftest|fitness\" package.json .github/workflows scripts -g '"'!node_modules'"'" in /home/mathias/stork-2.0
 succeeded in 0ms:
package.json:18:    "format:check": "prettier --check .",
package.json:25:    "fitness": "node scripts/fitness.mjs",
package.json:26:    "fitness:selftest": "node scripts/fitness.selftest.mjs",
package.json:27:    "governance:check": "node scripts/governance-check.mjs",
package.json:28:    "governance:selftest": "node scripts/governance-check.selftest.mjs",
scripts/README.md:10:| `fitness.mjs`        | Arkitektoniske invarianter på tværs af repo. Hver check er en function.                                                                                                                                                              | `pnpm fitness`                                             |
scripts/README.md:22:Tilføj en ny check: implementér en async function i `scripts/fitness.mjs`
.github/workflows/ci.yml:41:        run: pnpm format:check
.github/workflows/ci.yml:61:        run: pnpm fitness
.github/workflows/ci.yml:64:        run: pnpm fitness:selftest
.github/workflows/ci.yml:67:        run: pnpm governance:check
.github/workflows/ci.yml:70:        run: pnpm governance:selftest
scripts/fitness.selftest.mjs:2:// fitness.selftest.mjs — negativ-test (§3.6) for gov-3a's §3-checks.
scripts/fitness.selftest.mjs:18:} from "./fitness.mjs";
scripts/fitness.selftest.mjs:35:    const out = execSync(`node ${join(ROOT, "scripts/fitness.mjs")}`, {
scripts/fitness.selftest.mjs:289:  console.error(`\nfitness selftest FEJLEDE (${failed})`);
scripts/fitness.selftest.mjs:292:console.log("\nfitness selftest: alle cases passed");
scripts/fitness.mjs:21:// af fitness-checks. De forbliver grandfathered.
scripts/fitness.mjs:147:// G-nummer-kandidat: R7d-fitness-check skal eksplicit dokumentere at den er
scripts/fitness.mjs:1805:// Kør kun når invokeret direkte (node fitness.mjs) — ikke ved import (selftest importerer rene helpers).

exec
/bin/bash -lc 'npm run fitness' in /home/mathias/stork-2.0
exec
/bin/bash -lc 'pnpm format:check' in /home/mathias/stork-2.0
 succeeded in 5592ms:

> stork-2.0@0.0.0 format:check /home/mathias/stork-2.0
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

 succeeded in 8868ms:
✓ no-ts-ignore
✓ eslint-disable-justified
✓ migration-naming
✓ workspace-boundaries
✓ no-hardcoded-supabase-urls
✓ migration-set-config-discipline
✓ dedup-key-or-opt-out
✓ truncate-blocked-on-immutable
✓ cron-change-reason
✓ audit-trigger-coverage
✓ migration-on-conflict-discipline
✓ db-rls-policies
✓ write-policy-session-var-consistency
✓ legacy-is-active-readers
✓ db-test-tx-wrap-on-immutable-insert
✓ db-test-no-disabled-sql
✓ db-test-no-t9-seed-user-fixtures
✓ db-test-no-t9-skip-guards
✓ postgrest-t9-schema-exposure
✓ immutability-trigger-coverage
✓ snapshot-field-protection
✓ schema-ownership
✓ cross-schema-fk-discipline
✓ fk-coverage
✓ index-per-policy
✓ secdef-marker-discipline
✓ app-write-revoke-discipline

Fitness: all checks passed

codex
Format-gaten er grøn; trailing whitespace er ikke fanget af Prettier her, fordi de rå review-filer åbenbart ikke normaliseres af format-checken. Jeg kører de resterende relevante gates og scriptets egen parse-test korrekt via shell.
exec
/bin/bash -lc "sed -n '1,90p' .github/workflows/ci.yml" in /home/mathias/stork-2.0
 succeeded in 0ms:
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}

jobs:
  ci:
    name: Lint, typecheck, test, build
    runs-on: ubuntu-latest
    timeout-minutes: 15
    env:
      HUSKY: "0"
      TURBO_TELEMETRY_DISABLED: "1"
      SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

    steps:
      - uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10.33.0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Prettier check
        run: pnpm format:check

      - name: ESLint
        run: pnpm lint

      - name: TypeScript
        run: pnpm typecheck

      - name: Vitest
        run: pnpm test

      - name: Build
        run: pnpm build

      - name: Migration-gate (Phase 2 strict)
        env:
          MIGRATION_GATE_STRICT: "true"
        run: pnpm migration:check

      - name: Fitness functions
        run: pnpm fitness

      - name: Fitness selftest (§3-checks negativ-test)
        run: pnpm fitness:selftest

      - name: Governance check (lag-1 spærhage)
        run: pnpm governance:check

      - name: Governance selftest
        run: pnpm governance:selftest

      - name: Supabase link
        if: env.SUPABASE_ACCESS_TOKEN != ''
        run: pnpm supabase:link

      - name: Types drift check
        if: env.SUPABASE_ACCESS_TOKEN != ''
        run: pnpm types:check

      - name: Schema drift check
        if: env.SUPABASE_ACCESS_TOKEN != ''
        run: pnpm schema:check

      - name: DB tests
        if: env.SUPABASE_ACCESS_TOKEN != ''
        run: pnpm db:test

exec
/bin/bash -lc 'bash scripts/codex-review.sh --parse-test' in /home/mathias/stork-2.0
exec
/bin/bash -lc 'pnpm fitness:selftest' in /home/mathias/stork-2.0
exec
/bin/bash -lc 'pnpm lint' in /home/mathias/stork-2.0
exec
/bin/bash -lc 'pnpm typecheck' in /home/mathias/stork-2.0
 succeeded in 216ms:
  ✓ 'STOP-FOR-CLARIFICATION: mangler X' (runde 1) -> exit 1
  ✓ '[PLAN-AFVIGELSE] afviger fra plan' (runde 1) -> exit 2
  ✓ 'WORKAROUND-INTRODUCERET: hack' (runde 1) -> exit 3
  ✓ '[ESCALATE] iter > 3' (runde 1) -> exit 4
  ✓ '[MANGLENDE-EKSISTERENDE-BEVARELSE] gate tabt' (runde 2) -> exit 2
  ✓ '[MELLEM] fund i runde 1' (runde 1) -> exit 2
  ✓ '[MELLEM] fund i runde 2' (runde 2) -> exit 0
  ✓ 'MELLEM: fund i runde 3' (runde 3) -> exit 0
parse-test: alle fixtures passed

 succeeded in 443ms:

> stork-2.0@0.0.0 lint /home/mathias/stork-2.0
> turbo run lint

• turbo 2.9.12

   • Packages in scope: @stork/core, @stork/eslint-config, @stork/types, @stork/utils, @stork/web
   • Running lint in 5 packages
   • Remote caching disabled

@stork/web:lint: cache hit, replaying logs 09e7a0d0ebd62113
@stork/web:lint: 
@stork/web:lint: > @stork/web@0.0.0 lint /home/mathias/stork-2.0/apps/web
@stork/web:lint: > eslint .
@stork/web:lint: 

 Tasks:    1 successful, 1 total
Cached:    1 cached, 1 total
  Time:    59ms >>> FULL TURBO


 succeeded in 452ms:

> stork-2.0@0.0.0 typecheck /home/mathias/stork-2.0
> turbo run typecheck

• turbo 2.9.12

   • Packages in scope: @stork/core, @stork/eslint-config, @stork/types, @stork/utils, @stork/web
   • Running typecheck in 5 packages
   • Remote caching disabled

@stork/types:typecheck: cache hit, replaying logs 5203d3678fbd427e
@stork/types:typecheck: 
@stork/types:typecheck: > @stork/types@0.0.0 typecheck /home/mathias/stork-2.0/packages/types
@stork/types:typecheck: > tsc --noEmit
@stork/types:typecheck: 
@stork/web:typecheck: cache hit, replaying logs a0d80a74b032d7b9
@stork/web:typecheck: 
@stork/web:typecheck: > @stork/web@0.0.0 typecheck /home/mathias/stork-2.0/apps/web
@stork/web:typecheck: > tsc --noEmit -p tsconfig.app.json && tsc --noEmit -p tsconfig.node.json
@stork/web:typecheck: 

 Tasks:    2 successful, 2 total
Cached:    2 cached, 2 total
  Time:    50ms >>> FULL TURBO


 succeeded in 5214ms:

> stork-2.0@0.0.0 fitness:selftest /home/mathias/stork-2.0
> node scripts/fitness.selftest.mjs

  ✓ baseline (static checks) -> exit 0
  ✓ fail-closed: live-check uden token i CI -> violation
  ✓ #4 update-only trigger -> fanges (delete ikke dækket)
  ✓ #4 delete-only trigger -> fanges (update ikke dækket)
  ✓ #4 drop-after-create -> fanges (trigger final-state)
  ✓ #4 guard delete-only m. set_updated_at intakt -> fanges (ikke union)
  ✓ #7 guard mangler mutable-flag -> fanges
  ✓ #7 guard undtager ekstra felt -> fanges
  ✓ #4 same-file drop+recreate table uden trigger -> fanges
  ✓ #7 old/new-sammenligning fjernet -> fanges
  ✓ #6 session-var-gate -> ingen prædikat-kolonne
  ✓ #6 reel kolonne auth_user_id (ikke auth.uid)
  ✓ #6 Codex-negativ: act.id -> {action_id}, ikke {id}
  ✓ #6 schema-kvalificeret fremmed ref -> {action_id}, ikke {id}
  ✓ #6 eksplicit current-table-kvalificering tælles
  ✓ #6 setting-streng m. tabel-navn -> ingen falsk kolonne
  ✓ #6 non-btree leading index tæller ikke som dækning
  ✓ #19 PK -> null
  ✓ #19 hasFK -> null
  ✓ #19 exemption -> null
  ✓ #19 FK_PENDING m. target fraværende -> null
  ✓ #19 FK_PENDING selv-udløb: target findes uden FK -> violation
  ✓ #19 ukendt *_id uden FK -> violation
  ✓ #10 baseline (trigger + sanctioned) -> 0 violations
  ✓ #10 trigger uden allowlist-entry -> OK
  ✓ #10 ukendt SECDEF uden markør -> violation
  ✓ #10 stale allowlist-entry -> violation
  ✓ #18 ingen app-write -> 0 violations
  ✓ #18 authenticated INSERT på core_* -> violation
  ✓ #18 exemption -> skippes

fitness selftest: alle cases passed

codex
Scriptets parse-test dækker nu både `MANGLENDE-EKSISTERENDE-BEVARELSE` og runde-aware `MELLEM`, og de øvrige lokale gates er grønne indtil videre. Jeg kører resten af de obligatoriske CI-trin, som ikke kræver Supabase-token.
exec
/bin/bash -lc 'pnpm test' in /home/mathias/stork-2.0
exec
/bin/bash -lc 'pnpm build' in /home/mathias/stork-2.0
exec
/bin/bash -lc 'MIGRATION_GATE_STRICT=true pnpm migration:check' in /home/mathias/stork-2.0
 succeeded in 423ms:

> stork-2.0@0.0.0 test /home/mathias/stork-2.0
> turbo run test

• turbo 2.9.12

   • Packages in scope: @stork/core, @stork/eslint-config, @stork/types, @stork/utils, @stork/web
   • Running test in 5 packages
   • Remote caching disabled

@stork/web:test: cache hit, replaying logs af209448f52f8b45
@stork/web:test: 
@stork/web:test: > @stork/web@0.0.0 test /home/mathias/stork-2.0/apps/web
@stork/web:test: > vitest run
@stork/web:test: 
@stork/web:test: 
@stork/web:test:  RUN  v3.2.4 /home/mathias/stork-2.0/apps/web
@stork/web:test: 
@stork/web:test:  ✓ src/test/example.test.ts (1 test) 6ms
@stork/web:test: 
@stork/web:test:  Test Files  1 passed (1)
@stork/web:test:       Tests  1 passed (1)
@stork/web:test:    Start at  17:35:25
@stork/web:test:    Duration  3.05s (transform 143ms, setup 312ms, collect 24ms, tests 6ms, environment 1.38s, prepare 907ms)
@stork/web:test: 

 Tasks:    1 successful, 1 total
Cached:    1 cached, 1 total
  Time:    65ms >>> FULL TURBO


 succeeded in 461ms:

> stork-2.0@0.0.0 migration:check /home/mathias/stork-2.0
> node scripts/migration-gate.mjs

Migration-gate Phase 2 (strict): alle kolonner i 124 migration(s) er klassificerede (file=0, migrations=480, union=480)

 succeeded in 478ms:

> stork-2.0@0.0.0 build /home/mathias/stork-2.0
> turbo run build

• turbo 2.9.12

   • Packages in scope: @stork/core, @stork/eslint-config, @stork/types, @stork/utils, @stork/web
   • Running build in 5 packages
   • Remote caching disabled

@stork/web:build: cache hit, replaying logs e4a479fcf8a9889c
@stork/web:build: 
@stork/web:build: > @stork/web@0.0.0 build /home/mathias/stork-2.0/apps/web
@stork/web:build: > vite build
@stork/web:build: 
@stork/web:build: vite v6.4.2 building for production...
@stork/web:build: transforming...
@stork/web:build: ✓ 1664 modules transformed.
@stork/web:build: rendering chunks...
@stork/web:build: computing gzip size...
@stork/web:build: dist/index.html                   0.45 kB │ gzip:  0.28 kB
@stork/web:build: dist/assets/index-CMTfYxUa.css   56.78 kB │ gzip: 10.00 kB
@stork/web:build: dist/assets/index-B4djv16J.js   308.52 kB │ gzip: 99.47 kB
@stork/web:build: ✓ built in 6.39s

 Tasks:    1 successful, 1 total
Cached:    1 cached, 1 total
  Time:    55ms >>> FULL TURBO


codex
Alle lokale CI-trin uden eksternt Supabase-token er grønne. Jeg læser nu selve scanner-/parser-diffen for at lede efter huller, som de eksisterende selftests ikke nødvendigvis fanger.
exec
/bin/bash -lc 'git diff --unified=80 claude/gov-docs-renhed-plan..HEAD -- scripts/governance-check.mjs' in /home/mathias/stork-2.0
 succeeded in 0ms:
diff --git a/scripts/governance-check.mjs b/scripts/governance-check.mjs
index ca9d634..f301219 100644
--- a/scripts/governance-check.mjs
+++ b/scripts/governance-check.mjs
@@ -1,282 +1,355 @@
 #!/usr/bin/env node
 // governance-check.mjs — mekanisk lag-1 governance-scanner (gov-2-vagt).
 //
 // Fanger governance-drift mekanisk. Princip (Codex): owner = DEFINITIONShjem,
 // ikke mention-hjem. Semantisk/prosa-modsigelse er Codex-mandatets bord (ikke her).
 //
 // Checks: dead-doc-paths · junk-files · laesefoelge-targets · pointer-validity ·
-//         owns-uniqueness · number-home-uniqueness · H-ref-integrity
+//         owns-uniqueness · number-home-uniqueness · H-ref-integrity ·
+//         structural-chain (gov-docs-renhed)
+//
+// Allowlist-split (gov-docs-renhed pkt 9): prosa-docs MÅ referere slettede
+// stier (historisk-provenance); aktive scripts MÅ IKKE — medmindre scriptet
+// bærer standalone-linjen "# governance: deprecated".
 //
 // Build-krav (Codex): fenced code blocks strippes FØR alle heading/ref-checks,
 // så skabelon-eksempler (fx ### [Hxxx] i ```-blok) ikke tæller som kanoniske.
 
 import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
 import { join } from "node:path";
 
 const SELFTEST = process.argv.includes("--selftest");
 const violations = [];
 const notes = [];
 const v = (check, msg) => violations.push(`[${check}] ${msg}`);
 
 // ---------- scope ----------
 const DOC_EXCLUDE = [
   "docs/coordination/arkiv",
   "docs/coordination/v4-slettede-docs",
   "docs/coordination/rapport-historik",
+  // Rå reviewer-output (ephemeral, slettes ved pakke-luk per §4) — citerer
+  // bevidst døde/historiske stier og skal ikke holdes path-rene.
+  "docs/coordination/codex-reviews",
 ];
 function walk(dir, acc = []) {
   for (const e of readdirSync(dir, { withFileTypes: true })) {
     const p = join(dir, e.name);
     if (e.isDirectory()) {
       if (!DOC_EXCLUDE.some((x) => p === x || p.startsWith(x + "/"))) walk(p, acc);
     } else acc.push(p);
   }
   return acc;
 }
 const DOC_FILES = walk("docs").filter((f) => f.endsWith(".md"));
 const SCRIPT_FILES = readdirSync("scripts")
   .filter((f) => f.endsWith(".sh"))
   .map((f) => join("scripts", f));
 
 // ---------- allowlist for manglende doc-paths {path, klasse, grund} ----------
 const MISSING_PATH_ALLOWLIST = [
   { path: "docs/gdpr-compliance.md", klasse: "future-required", grund: "fremtidig leverance, ej bygget endnu" },
   {
     path: "docs/coordination/overvaagning/codex-overvaagning.md",
     klasse: "historisk-provenance",
     grund: "V4-slettet doc, refereret som provenance",
   },
-  {
-    path: "docs/coordination/overvaagning/claude-ai-overvaagning.md",
-    klasse: "historisk-provenance",
-    grund: "V4-slettet doc, refereret som provenance",
-  },
   {
     path: "docs/strategi/arbejds-disciplin.md",
     klasse: "historisk-provenance",
     grund: "V4-slettet (konsolideret til disciplin.md)",
   },
   {
     path: "docs/strategi/bygge-status.md",
     klasse: "historisk-provenance",
     grund: "V4-slettet (foldet til master-plan §4.1)",
   },
   {
     path: "docs/skabeloner/plan-skabelon.md",
     klasse: "historisk-provenance",
     grund: "V4-slettet (inline i disciplin §10.2)",
   },
-  {
-    path: "docs/skabeloner/codex-review-prompt.md",
-    klasse: "historisk-provenance",
-    grund: "V4-slettet (inline i disciplin §10.4)",
-  },
   {
     path: "docs/skabeloner/rapport-skabelon.md",
     klasse: "historisk-provenance",
-    grund: "V4-slettet (inline i disciplin §10.3)",
+    grund:
+      "V4-slettet (inline i disciplin §10.3); refereres som provenance i gov-docs-renhed-plan A.12 — prune ved pakke-luk (gov-6)",
   },
   {
-    path: "docs/coordination/mathias-afgoerelser.md",
+    path: "docs/skabeloner/codex-review-prompt.md",
     klasse: "historisk-provenance",
-    grund: "V4-slettet (arkiv/mathias-afgoerelser-historik.md)",
+    grund: "V4-slettet (inline i disciplin §10.4)",
   },
   {
     path: "docs/coordination/plan-feedback",
     klasse: "runtime-ephemeral",
     grund: "mkdir -p ved pakke-kørsel; slettes ved pakke-luk (disciplin §4)",
   },
   {
     path: "docs/coordination/codex-reviews",
     klasse: "runtime-ephemeral",
     grund: "output-dir ved pakke-kørsel; slettes ved pakke-luk (disciplin §4)",
   },
   {
     path: "docs/coordination/v4-slettede-docs",
     klasse: "scope-excluded-local",
     grund: "lokale midlertidige V4-gennemgangs-kopier; aldrig committet; scope-ekskluderet; foldes/fjernes i gov-6",
   },
 ];
 const ALLOWED = new Set(MISSING_PATH_ALLOWLIST.map((a) => a.path));
 
 // ---------- helpers ----------
 function read(f) {
   return existsSync(f) ? readFileSync(f, "utf8") : "";
 }
 // fjern ```...``` fenced blocks (build-krav) + ~~~-varianten
 function stripFenced(text) {
   return text.replace(/```[\s\S]*?```/g, "").replace(/~~~[\s\S]*?~~~/g, "");
 }
 // doc-path-refs i en tekst (efter fenced-strip). Skip templates (< >).
+// Charclass inkluderer danske bogstaver (gov-docs-renhed: docs/LÆSEFØLGE.md
+// ville ellers matche afskåret og give falsk violation).
 function docRefs(text) {
   const out = new Set();
-  const re = /docs\/[A-Za-z0-9_./<>-]+/g;
+  const re = /docs\/[A-Za-z0-9_./<>ÆØÅæøå-]+/g;
   let m;
   while ((m = re.exec(text))) {
     let p = m[0].replace(/[.)\]:,/]+$/, ""); // strip trailing punktuation + slash
     if (p.includes("<") || p.includes(">")) continue; // template
     out.add(p);
   }
   return [...out];
 }
 function pathExists(p) {
   // accepterer både fil og mappe; mappe-ref kan ende på /
   const clean = p.replace(/\/$/, "");
   return existsSync(clean);
 }
 
-// ---------- check: dead-doc-paths (docs + scripts) ----------
+// ---------- check: dead-doc-paths (docs + scripts, klasse-split) ----------
+const ALLOW_BY_PATH = new Map(MISSING_PATH_ALLOWLIST.map((a) => [a.path, a]));
+const SCRIPT_SET = new Set(SCRIPT_FILES);
+function isDeprecated(file) {
+  return read(file)
+    .split("\n")
+    .some((l) => l.trim().startsWith("# governance: deprecated"));
+}
 function deadDocPaths() {
   const scan = [...DOC_FILES, ...SCRIPT_FILES];
   for (const f of scan) {
     const refs = docRefs(stripFenced(read(f)));
     for (const r of refs) {
       if (pathExists(r)) continue;
-      if (ALLOWED.has(r)) {
+      const entry = ALLOW_BY_PATH.get(r);
+      if (entry) {
+        // Split (gov-docs-renhed): prosa må bære historisk-provenance;
+        // aktive scripts må ikke — medmindre scriptet selv er deprecated.
+        if (SCRIPT_SET.has(f) && entry.klasse === "historisk-provenance" && !isDeprecated(f)) {
+          v(
+            "dead-doc-paths",
+            `${f}: aktivt script peger på slettet ${r} (historisk-provenance er kun for prosa — markér scriptet '# governance: deprecated' eller fjern referencen)`,
+          );
+          continue;
+        }
         notes.push(`dead-doc-paths: tilladt manglende ${r} (${f})`);
         continue;
       }
       v("dead-doc-paths", `${f}: peger på ikke-eksisterende ${r} (ikke i allowlist)`);
     }
   }
 }
 
 // ---------- check: junk-files ----------
 function junkFiles() {
   for (const f of DOC_FILES.concat(walk("docs").filter((x) => /(^|\/)~\$|(^|\/)\.~|~\$[^/]*$/.test(x)))) {
     if (/(^|\/)~\$/.test(f) || /\.tmp$/.test(f)) v("junk-files", `junk/lock-fil i docs/: ${f}`);
   }
 }
 
 // ---------- check: laesefoelge-targets ----------
 function laesefoelgeTargets() {
   const lf = "docs/LÆSEFØLGE.md";
   if (!existsSync(lf)) return v("laesefoelge-targets", "LÆSEFØLGE.md mangler");
   for (const r of docRefs(stripFenced(read(lf)))) {
     if (!pathExists(r) && !ALLOWED.has(r)) v("laesefoelge-targets", `LÆSEFØLGE-mål mangler: ${r}`);
   }
 }
 
 // ---------- check: pointer-validity ----------
 function pointerValidity() {
   for (const pf of ["docs/coordination/aktiv-plan.md", "docs/coordination/seneste-rapport.md"]) {
     if (!existsSync(pf)) {
       v("pointer-validity", `pointer-fil mangler: ${pf}`);
       continue;
     }
     for (const r of docRefs(stripFenced(read(pf)))) {
       if (!pathExists(r) && !ALLOWED.has(r)) v("pointer-validity", `${pf}: pointer-mål mangler: ${r}`);
     }
   }
 }
 
 // ---------- check: owns-uniqueness ----------
 // kun standalone-linjer: ^<!-- governance-owns: ... -->$  (robust mod inline-eksempler)
 function parseOwns(text) {
   const concepts = [];
   for (const line of text.split("\n")) {
     const m = line.trim().match(/^<!--\s*governance-owns:\s*(.+?)\s*-->$/);
     if (m)
       concepts.push(
         ...m[1]
           .split(",")
           .map((s) => s.trim())
           .filter(Boolean),
       );
   }
   return concepts;
 }
 function ownsUniqueness() {
   const byConcept = new Map();
   for (const f of DOC_FILES) {
     for (const c of parseOwns(stripFenced(read(f)))) {
       if (!byConcept.has(c)) byConcept.set(c, []);
       byConcept.get(c).push(f);
     }
   }
   for (const [c, files] of byConcept) {
     if (files.length > 1) v("owns-uniqueness", `begreb "${c}" ejet af ${files.length} docs: ${files.join(", ")}`);
   }
 }
 
 // ---------- check: number-home-uniqueness (kun ### [Xxxx]-entries) ----------
 function numberHomeUniqueness() {
   const byNum = new Map();
   for (const f of DOC_FILES) {
     const text = stripFenced(read(f));
     const re = /^###\s*\[([GH]\d{3})\]/gm;
     let m;
     while ((m = re.exec(text))) {
       if (!byNum.has(m[1])) byNum.set(m[1], new Set());
       byNum.get(m[1]).add(f);
     }
   }
   for (const [num, files] of byNum) {
     if (files.size > 1)
       v("number-home-uniqueness", `${num} har kanonisk entry i ${files.size} docs: ${[...files].join(", ")}`);
   }
 }
 
 // ---------- check: H-ref-integrity ----------
 function hRefIntegrity() {
   const husk = "docs/teknisk/huskeliste.md";
   const text = stripFenced(read(husk));
   const open = new Set();
   let m;
   const reOpen = /^###\s*\[(H\d{3})\]/gm;
   while ((m = reOpen.exec(text))) open.add(m[1]);
   // historisk-marker (standalone-linje, source of truth)
   const hist = new Set();
   for (const line of text.split("\n")) {
     const hm = line.trim().match(/^<!--\s*gov-historical-codes:\s*(.+?)\s*-->$/);
     if (hm)
       hm[1]
         .split(",")
         .map((s) => s.trim())
         .forEach((c) => /^H\d{3}$/.test(c) && hist.add(c));
   }
   const known = new Set([...open, ...hist]);
   if (known.size === 0) v("H-ref-integrity", "ingen H-entries/historiske koder fundet i huskeliste.md");
   // scan alle docs + scripts for H-refs (efter fenced-strip), suffix -> parent
   for (const f of [...DOC_FILES, ...SCRIPT_FILES]) {
     const t = stripFenced(read(f));
     const re = /\bH(\d{3})\b/g;
     let mm;
     const seen = new Set();
     while ((mm = re.exec(t))) {
       const parent = "H" + mm[1];
       if (known.has(parent) || seen.has(parent)) continue;
       seen.add(parent);
       v("H-ref-integrity", `${f}: H-ref ${parent} har hverken åben entry eller historisk-kode i huskeliste.md`);
     }
   }
 }
 
+// ---------- check: structural-chain (gov-docs-renhed pkt 10) ----------
+// Strukturelt + string-match — ingen semantik. Formåls-immutabilitet (§3.0) mekanisk.
+function normFormaal(text) {
+  const lines = text.split("\n");
+  const i = lines.findIndex((l) => l.trim().startsWith("> Denne pakke leverer:"));
+  if (i === -1) return null;
+  const out = [];
+  for (let j = i; j < lines.length && lines[j].trim().startsWith(">"); j++) {
+    out.push(lines[j].replace(/^\s*>\s?/, ""));
+  }
+  return out.join(" ").replace(/\s+/g, " ").trim();
+}
+function structuralChain() {
+  const ap = read("docs/coordination/aktiv-plan.md");
+  let marker = null;
+  for (const line of ap.split("\n")) {
+    const m = line.trim().match(/^<!--\s*aktiv-pakke:\s*(\S+)(?:\s+fase:\s*(plan|build|rapport))?\s*-->$/);
+    if (m) marker = { pakke: m[1], fase: m[2] ?? "plan" };
+  }
+  if (!marker)
+    return v(
+      "structural-chain",
+      "aktiv-plan.md mangler standalone-markør <!-- aktiv-pakke: <navn|ingen> [fase: plan|build|rapport] -->",
+    );
+  if (marker.pakke === "ingen") return;
+  const base = "docs/coordination";
+  const krav = `${base}/${marker.pakke}-krav-og-data.md`;
+  const plan = `${base}/${marker.pakke}-plan.md`;
+  const status = `${base}/${marker.pakke}-status.md`;
+  for (const f of [krav, plan, status]) {
+    if (!existsSync(f)) v("structural-chain", `aktiv pakke '${marker.pakke}': mangler ${f}`);
+  }
+  if (!existsSync(krav) || !existsSync(plan)) return;
+  if (!read(plan).includes(krav)) v("structural-chain", `${plan}: krydspeger ikke ${krav}`);
+  if (!read(plan).includes(status)) v("structural-chain", `${plan}: krydspeger ikke ${status}`);
+  if (existsSync(status) && !read(status).includes(marker.pakke))
+    v("structural-chain", `${status}: nævner ikke pakken '${marker.pakke}'`);
+  const fk = normFormaal(read(krav));
+  const fp = normFormaal(stripFenced(read(plan)));
+  if (!fk) v("structural-chain", `${krav}: ingen "> Denne pakke leverer:"-blok`);
+  if (!fp) v("structural-chain", `${plan}: ingen "> Denne pakke leverer:"-blok`);
+  if (fk && fp && fk !== fp) v("structural-chain", `Formål-streng afviger mellem ${krav} og ${plan} (§3.0)`);
+  if (marker.fase === "rapport") {
+    const dir = "docs/coordination/rapport-historik";
+    const rapporter = existsSync(dir) ? readdirSync(dir).filter((x) => x.endsWith(`-${marker.pakke}.md`)) : [];
+    if (!rapporter.length)
+      return v("structural-chain", `fase: rapport men ingen rapport-historik/*-${marker.pakke}.md`);
+    const nyeste = rapporter.sort().at(-1);
+    const fr = normFormaal(read(join(dir, nyeste)));
+    if (!fr) v("structural-chain", `${dir}/${nyeste}: ingen "> Denne pakke leverer:"-blok`);
+    else if (fk && fk !== fr) v("structural-chain", `Formål-streng afviger mellem ${krav} og ${dir}/${nyeste} (§3.0)`);
+  }
+}
+
 // ---------- run ----------
 const CHECKS = [
   ["dead-doc-paths", deadDocPaths],
   ["junk-files", junkFiles],
   ["laesefoelge-targets", laesefoelgeTargets],
   ["pointer-validity", pointerValidity],
   ["owns-uniqueness", ownsUniqueness],
   ["number-home-uniqueness", numberHomeUniqueness],
   ["H-ref-integrity", hRefIntegrity],
+  ["structural-chain", structuralChain],
 ];
 for (const [name, fn] of CHECKS) {
   const before = violations.length;
   try {
     fn();
   } catch (e) {
     v(name, `scanner-fejl: ${e.message}`);
   }
   if (violations.length === before) console.log(`✓ ${name}`);
   else console.log(`✗ ${name}`);
 }
 
 if (violations.length) {
   console.error("\nGovernance-check FEJLEDE:");
   for (const x of violations) console.error("  " + x);
   process.exit(1);
 }
 console.log(`\nGovernance-check: alle checks passed (${DOC_FILES.length} docs, ${SCRIPT_FILES.length} scripts)`);
 if (notes.length && process.env.GOV_VERBOSE) notes.forEach((n) => console.log("  · " + n));

exec
/bin/bash -lc 'git diff --unified=80 claude/gov-docs-renhed-plan..HEAD -- scripts/governance-check.selftest.mjs' in /home/mathias/stork-2.0
 succeeded in 0ms:
diff --git a/scripts/governance-check.selftest.mjs b/scripts/governance-check.selftest.mjs
index 4c421e7..1c062f3 100644
--- a/scripts/governance-check.selftest.mjs
+++ b/scripts/governance-check.selftest.mjs
@@ -1,67 +1,144 @@
 #!/usr/bin/env node
 // Selftest for governance-check.mjs (§3.6 leverings-kriterium).
 // Beviser scanneren: (a) går grøn på en gyldig kopi af repoet, (b) fejler korrekt
 // på planted overtrædelser pr. check-klasse. Kører scanneren via cwd=temp-fixture.
 
 import { execSync } from "node:child_process";
 import { mkdtempSync, writeFileSync, appendFileSync, rmSync } from "node:fs";
 import { tmpdir } from "node:os";
 import { join } from "node:path";
 
 const SCANNER = join(process.cwd(), "scripts", "governance-check.mjs");
 let failed = 0;
 const ok = (n) => console.log(`  ✓ ${n}`);
 const bad = (n, d) => {
   console.error(`  ✗ ${n} — ${d}`);
   failed++;
 };
 
 function run(root) {
   try {
     execSync(`node ${SCANNER}`, { cwd: root, stdio: "pipe" });
     return 0;
   } catch (e) {
     return e.status ?? 1;
   }
 }
 function fixture() {
   // git archive HEAD = committed tree (uden untracked strays) — afspejler hvad CI ser,
   // så untracked-fil-falsk-grøn fanges. Working-tree-kopi ville skjule den klasse.
   const d = mkdtempSync(join(tmpdir(), "govtest-"));
   execSync(`git archive HEAD | tar -x -C "${d}"`, { stdio: "pipe" });
   return d;
 }
 
 // (a) baseline: ren kopi -> grøn
 {
   const d = fixture();
   run(d) === 0 ? ok("baseline ren kopi -> exit 0") : bad("baseline", "forventede exit 0");
   rmSync(d, { recursive: true, force: true });
 }
 
 // (b) planted overtrædelser pr. klasse -> exit != 0
 const cases = [
   ["dead-doc-paths", (d) => appendFileSync(join(d, "docs/strategi/disciplin.md"), "\nSe docs/findes-ikke-xyz.md\n")],
   ["junk-files", (d) => writeFileSync(join(d, "docs/~$junk.md"), "x")],
   [
     "owns-uniqueness",
     (d) => appendFileSync(join(d, "docs/strategi/vision-og-principper.md"), "\n<!-- governance-owns: kode-gaeld -->\n"),
   ],
   [
     "number-home-uniqueness",
     (d) => appendFileSync(join(d, "docs/strategi/disciplin.md"), "\n### [H001] dublet-entry\n"),
   ],
   ["H-ref-integrity", (d) => appendFileSync(join(d, "docs/strategi/disciplin.md"), "\nSe H999 et sted.\n")],
 ];
+
+// gov-docs-renhed: allowlist-split + structural-chain cases.
+// chainFiles producerer en FULDT konsistent kæde — hver case planter ÉN defekt.
+const FORMAAL = "> Denne pakke leverer: testleverance.\n";
+const PLAN_OK = `# t\n\ndocs/coordination/testpakke-krav-og-data.md\ndocs/coordination/testpakke-status.md\n\n## Formål\n\n${FORMAAL}`;
+const chainFiles = (d, { plan = PLAN_OK, kravFormaal = FORMAAL } = {}) => {
+  writeFileSync(join(d, "docs/coordination/testpakke-krav-og-data.md"), `# t\n\n## Formål\n\n${kravFormaal}`);
+  writeFileSync(join(d, "docs/coordination/testpakke-plan.md"), plan);
+  writeFileSync(join(d, "docs/coordination/testpakke-status.md"), "# testpakke status\n");
+};
+const setMarker = (d, fase) =>
+  appendFileSync(join(d, "docs/coordination/aktiv-plan.md"), `\n<!-- aktiv-pakke: testpakke fase: ${fase} -->\n`);
+cases.push(
+  [
+    "script-dead-path",
+    (d) => appendFileSync(join(d, "scripts/types-gen.sh"), "\ncat docs/skabeloner/plan-skabelon.md\n"),
+  ],
+  ["chain-missing-files", (d) => setMarker(d, "plan")],
+  [
+    "chain-formaal-mismatch",
+    (d) => {
+      chainFiles(d, { kravFormaal: "> Denne pakke leverer: noget ANDET.\n" });
+      setMarker(d, "plan");
+    },
+  ],
+  [
+    "chain-missing-krydspeg",
+    (d) => {
+      chainFiles(d, { plan: `# t\n\ndocs/coordination/testpakke-status.md\n\n## Formål\n\n${FORMAAL}` });
+      setMarker(d, "plan");
+    },
+  ],
+  [
+    "chain-missing-status-krydspeg",
+    (d) => {
+      chainFiles(d, { plan: `# t\n\ndocs/coordination/testpakke-krav-og-data.md\n\n## Formål\n\n${FORMAAL}` });
+      setMarker(d, "plan");
+    },
+  ],
+  [
+    "chain-rapport-missing",
+    (d) => {
+      chainFiles(d);
+      setMarker(d, "rapport");
+    },
+  ],
+  [
+    "chain-rapport-formaal-mismatch",
+    (d) => {
+      chainFiles(d);
+      writeFileSync(
+        join(d, "docs/coordination/rapport-historik/2099-01-01-testpakke.md"),
+        "# t\n\n## Formål\n\n> Denne pakke leverer: noget TREDJE.\n",
+      );
+      setMarker(d, "rapport");
+    },
+  ],
+  [
+    "chain-rapport-no-formaal",
+    (d) => {
+      chainFiles(d);
+      writeFileSync(join(d, "docs/coordination/rapport-historik/2099-01-01-testpakke.md"), "# t\n\nIngen blok.\n");
+      setMarker(d, "rapport");
+    },
+  ],
+);
+
 for (const [name, plant] of cases) {
   const d = fixture();
   plant(d);
   run(d) !== 0 ? ok(`planted ${name} -> exit != 0`) : bad(name, "scanner gik grøn trods overtrædelse");
   rmSync(d, { recursive: true, force: true });
 }
 
+// positiv-case: deprecated script får lov at bære historisk-provenance-ref
+{
+  const d = fixture();
+  appendFileSync(join(d, "scripts/types-gen.sh"), "\n# governance: deprecated\ncat docs/skabeloner/plan-skabelon.md\n");
+  run(d) === 0
+    ? ok("script-dead-path-deprecated -> exit 0")
+    : bad("script-dead-path-deprecated", "deprecated script burde gå grøn");
+  rmSync(d, { recursive: true, force: true });
+}
+
 if (failed) {
   console.error(`\nSelftest FEJLEDE (${failed})`);
   process.exit(1);
 }
 console.log("\nGovernance selftest: alle cases passed");

exec
/bin/bash -lc 'git diff --unified=80 claude/gov-docs-renhed-plan..HEAD -- scripts/codex-review.sh' in /home/mathias/stork-2.0
 succeeded in 0ms:
diff --git a/scripts/codex-review.sh b/scripts/codex-review.sh
index 8d54cc4..5c1fd8f 100755
--- a/scripts/codex-review.sh
+++ b/scripts/codex-review.sh
@@ -1,286 +1,378 @@
 #!/usr/bin/env bash
 # scripts/codex-review.sh
-# Wrapper for Codex CLI review-runder (V5.3 marker-protocol).
+# Wrapper for Codex CLI review-runder — V5 (disciplin.md §5 severities + §6.1 halt-markers).
 #
 # Brug:
 #   scripts/codex-review.sh <plan-fil> <runde-N> [--xhigh|--quick] [--phase=plan|build|slut-rapport]
+#   scripts/codex-review.sh --parse-test
 #
-# Defaults: xhigh + fast_mode + timeout 480s + file-reference prompt + tail-monitor.
+# Defaults: xhigh + fast_mode + timeout 480s + file-reference prompt.
 # --quick: medium reasoning + timeout 120s + max 150 ord output (til intermediate batch-tjek).
 # --xhigh: explicit (default — flag for klarhed når der er valg).
+# --parse-test: kør canned fixtures gennem marker-parseren og assertér exit-routing.
+#
+# Prompt genereres fra disciplin.md V5 §10.4 (inline — ingen prefix-fil).
 #
 # Output: docs/coordination/codex-reviews/<dato>-<pakke>-runde-<N>.md
 #         (med header om command + plan-SHA + raw codex-output)
-# Stdout: echoes outputtet samt parser markers per V5.3 marker-protokol
+# Stdout: echoes outputtet samt parser markers per V5 §5/§6.1
+#
+# Exit-koder:
+#   0  = clean eller G-NUMMER-KANDIDAT (fortsæt)
+#   1  = STOP-FOR-CLARIFICATION (info-mangel)
+#   2  = halt-marker (BRUD-PAA-KRAV / TEKNISK-BLOKERING / PLAN-AFVIGELSE / KRITISK-SIKKERHEDSHUL)
+#        ELLER severity-prefix (KRITISK — stopper plan i alle runder per §5)
+#   3  = WORKAROUND-INTRODUCERET (Mathias-gate)
+#   4  = ESCALATE / AUTO-ESKALATION / NEEDS-MATHIAS (Mathias-judgment kræves før V<n+1>)
+#   124 = codex timeout
 
 set -euo pipefail
 
+# ============================================================
+# Marker-parsing (V5 §5 severities + §6.1 halt-markers)
+# Bracket-tolerant: §10.4-formatet er "[SEVERITY] beskrivelse"; nøgne
+# "SEVERITY:"-prefixes accepteres også (gov-docs-renhed R2-1).
+# ============================================================
+
+parse_markers() {
+  local f="$1"
+  local round="${2:-1}"
+  local clarification_hit=0 halt_hit=0 severity_hit=0
+  local workaround_hit=0 escalate_hit=0 needs_mathias_hit=0
+
+  if grep -qE '^\[?STOP-FOR-CLARIFICATION\]?(\b|:)' "$f"; then
+    clarification_hit=1
+    echo "  ⏸  STOP-FOR-CLARIFICATION rejst — info-mangel" >&2
+  fi
+
+  if grep -qE '^\[?(BRUD-PAA-KRAV|TEKNISK-BLOKERING|PLAN-AFVIGELSE|KRITISK-SIKKERHEDSHUL)\]?(\b|:)' "$f"; then
+    halt_hit=1
+    echo "  🛑 Halt-marker rejst — kræver LØS-dialog eller eskalation" >&2
+  fi
+
+  # Severity-prefix detection (G055-fix, bracket-tolerant per R2-1)
+  # KRITISK uden halt-marker er stadig blocker per §5
+  # ("KRITISK — stopper plan/build i alle runder").
+  # \b efter KRITISK så "KRITISKE" ikke triggers false positive.
+  if grep -qE '^\[?KRITISK\]?\b' "$f"; then
+    severity_hit=1
+    echo "  🛑 KRITISK-severity rejst — stopper plan i alle runder" >&2
+  fi
+
+  # MANGLENDE-EKSISTERENDE-BEVARELSE er KRITISK-undertype (§5) — samme routing
+  if grep -qE '^\[?MANGLENDE-EKSISTERENDE-BEVARELSE\]?\b' "$f"; then
+    severity_hit=1
+    echo "  🛑 MANGLENDE-EKSISTERENDE-BEVARELSE rejst (KRITISK-undertype) — stopper" >&2
+  fi
+
+  # MELLEM er runde-afhængig (§5 runde-trapper): stopper i runde 1, G-spor i runde 2+
+  if grep -qE '^\[?MELLEM\]?\b' "$f"; then
+    if [ "$round" = "1" ]; then
+      severity_hit=1
+      echo "  🛑 MELLEM-severity i runde 1 — stopper (§5 runde-trapper)" >&2
+    else
+      echo "  📝 MELLEM-severity (runde $round) — G-nummer-spor, fortsæt (§5)" >&2
+    fi
+  fi
+
+  # NEEDS-MATHIAS — stopper plan og kræver Mathias-afgørelse før V<n+1>
+  if grep -qE '^\[?NEEDS-MATHIAS\]?\b' "$f"; then
+    needs_mathias_hit=1
+    echo "  🚦 NEEDS-MATHIAS rejst — Code må ikke lave V<n+1> før Mathias har afgjort" >&2
+  fi
+
+  if grep -qE '^\[?WORKAROUND-INTRODUCERET\]?(\b|:)' "$f"; then
+    workaround_hit=1
+    echo "  ⚠️  WORKAROUND-INTRODUCERET — Mathias-gate kræves" >&2
+  fi
+
+  if grep -qE '^\[?(ESCALATE|AUTO-ESKALATION)\]?(\b|:)' "$f"; then
+    escalate_hit=1
+    echo "  🚨 ESCALATE/AUTO-ESKALATION — Mathias-judgment via gate-fil" >&2
+  fi
+
+  if grep -qE '^\[?OPTIMERING-FORSLAG\]?(\b|:)' "$f"; then
+    echo "  💡 OPTIMERING-FORSLAG fundet — Code's valg (ADOPT/DEFER/DISMISS)" >&2
+  fi
+
+  if grep -qE '^\[?SPARRING-OENSKE\]?(\b|:)' "$f"; then
+    echo "  💬 SPARRING-OENSKE fundet" >&2
+  fi
+
+  if grep -qE '^\[?G-NUMMER-KANDIDAT\]?(\b|:)' "$f"; then
+    echo "  📝 G-NUMMER-KANDIDAT(er) — log til teknisk-gaeld.md (fortsæt)" >&2
+  fi
+
+  if grep -qE '^\[?APPROVAL\]?\b' "$f"; then
+    echo "  ✅ APPROVAL" >&2
+  fi
+
+  # Exit-koder per routing-tabel (uændret prioritet):
+  if [ "$clarification_hit" -eq 1 ]; then return 1; fi
+  if [ "$workaround_hit" -eq 1 ]; then return 3; fi
+  if [ "$escalate_hit" -eq 1 ]; then return 4; fi
+  if [ "$needs_mathias_hit" -eq 1 ]; then return 4; fi
+  if [ "$halt_hit" -eq 1 ] || [ "$severity_hit" -eq 1 ]; then return 2; fi
+  return 0
+}
+
+# ============================================================
+# --parse-test: canned fixtures gennem parseren, assertér routing
+# (gov-docs-renhed R2-1/R3-2 — fuld dækning af exit-koder 0/1/2/3/4)
+# ============================================================
+
+if [ "${1:-}" = "--parse-test" ]; then
+  # Format: indhold|runde|forventet-exit
+  declare -a FIXTURES=(
+    "APPROVAL — Runde 1|1|0"
+    "[KRITISK] fund|1|2"
+    "KRITISK: fund|1|2"
+    "[KRITISK] fund|3|2"
+    "KRITISKE detaljer|1|0"
+    "[NEEDS-MATHIAS] spørgsmål|1|4"
+    "STOP-FOR-CLARIFICATION: mangler X|1|1"
+    "[PLAN-AFVIGELSE] afviger fra plan|1|2"
+    "WORKAROUND-INTRODUCERET: hack|1|3"
+    "[ESCALATE] iter > 3|1|4"
+    "[MANGLENDE-EKSISTERENDE-BEVARELSE] gate tabt|2|2"
+    "[MELLEM] fund i runde 1|1|2"
+    "[MELLEM] fund i runde 2|2|0"
+    "MELLEM: fund i runde 3|3|0"
+  )
+  FAILED=0
+  TMP="$(mktemp -t parse-test.XXXXXX)"
+  trap 'rm -f "$TMP"' EXIT
+  for fixture in "${FIXTURES[@]}"; do
+    CONTENT="${fixture%%|*}"
+    REST="${fixture#*|}"
+    ROUND="${REST%%|*}"
+    WANT="${REST##*|}"
+    printf '%s\n' "$CONTENT" > "$TMP"
+    set +e
+    parse_markers "$TMP" "$ROUND" 2>/dev/null
+    GOT=$?
+    set -e
+    if [ "$GOT" = "$WANT" ]; then
+      echo "  ✓ '$CONTENT' (runde $ROUND) -> exit $GOT"
+    else
+      echo "  ✗ '$CONTENT' (runde $ROUND) -> exit $GOT (forventede $WANT)" >&2
+      FAILED=1
+    fi
+  done
+  if [ "$FAILED" -eq 1 ]; then
+    echo "parse-test FEJLEDE" >&2
+    exit 1
+  fi
+  echo "parse-test: alle fixtures passed"
+  exit 0
+fi
+
 # ============================================================
 # Argument-parsing
 # ============================================================
 
 if [ $# -lt 2 ]; then
   cat <<EOF
 Usage: $0 <plan-fil> <runde-N> [--xhigh|--quick] [--phase=plan|build|slut-rapport]
+       $0 --parse-test
 
 Eksempel:
   $0 docs/coordination/<pakke>-plan.md 1
   $0 docs/coordination/<pakke>-plan.md 2 --quick
   $0 docs/coordination/rapport-historik/<dato>-<pakke>.md 1 --phase=slut-rapport
 
-V5.3 marker-protokol: scriptet parser output for halt-markers + severity-prefixes + log-markers + positive markers.
+V5 marker-routing: scriptet parser output for halt-markers + severity-prefixes + positive markers (disciplin §5/§6.1).
 Exit-koder:
   0  = clean eller G-NUMMER-KANDIDAT (fortsæt)
   1  = STOP-FOR-CLARIFICATION (info-mangel)
-  2  = halt-marker (BRUD-PAA-KRAV / TEKNISK-BLOKERING / PLAN-AFVIGELSE / KRITISK-SIKKERHEDSHUL)
-       ELLER severity-prefix (^KRITISK\b — stopper plan i alle runder per overvaagning)
+  2  = halt-marker ELLER KRITISK-severity
   3  = WORKAROUND-INTRODUCERET (Mathias-gate)
-  4  = ESCALATE / AUTO-ESKALATION / NEEDS-MATHIAS (Mathias-judgment kræves før V<n+1>)
+  4  = ESCALATE / AUTO-ESKALATION / NEEDS-MATHIAS
   124 = codex timeout
 EOF
   exit 64
 fi
 
 PLAN_FILE="$1"
 ROUND_N="$2"
 shift 2
 
 REASONING="xhigh"
 TIMEOUT_SEC="${CODEX_TIMEOUT:-480}"
 PHASE="plan"
 MAX_WORDS="350"
 
 while [ $# -gt 0 ]; do
   case "$1" in
     --xhigh) REASONING="xhigh"; shift ;;
     --quick) REASONING="medium"; TIMEOUT_SEC="${CODEX_QUICK_TIMEOUT:-120}"; MAX_WORDS="150"; shift ;;
     --phase=*) PHASE="${1#--phase=}"; shift ;;
     *) echo "Ukendt flag: $1" >&2; exit 64 ;;
   esac
 done
 
 # ============================================================
 # Pre-flight verifikation
 # ============================================================
 
 REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
 if [ -z "$REPO_ROOT" ]; then
   echo "❌ scripts/codex-review.sh skal køres inde i et git-repo." >&2
   exit 64
 fi
 cd "$REPO_ROOT"
 
 if [ ! -f "$PLAN_FILE" ]; then
   echo "❌ Plan-fil findes ikke: $PLAN_FILE" >&2
   exit 64
 fi
 
-PREFIX_FILE="docs/skabeloner/codex-review-prompt.md"
-if [ ! -f "$PREFIX_FILE" ]; then
-  echo "❌ Niveau 1-prefix-fil findes ikke: $PREFIX_FILE" >&2
-  exit 64
-fi
-
 if ! command -v codex >/dev/null 2>&1; then
   echo "❌ codex CLI ikke fundet i PATH. Kør 'codex doctor' for diagnose." >&2
   exit 64
 fi
 
 # ============================================================
-# Build prompt — file-reference > embedded content
-# (V5.3 workflow-skabelon tooling-disciplin #3)
+# Build prompt — genereret fra disciplin.md V5 §10.4 (inline)
 # ============================================================
 
 PAKKE_NAME="$(basename "$PLAN_FILE" | sed -E 's/-plan\.md$//; s/\.md$//; s/^[0-9]{4}-[0-9]{2}-[0-9]{2}-//')"
 DATE="$(date +%Y-%m-%d)"
 
 case "$PHASE" in
   plan)         OUTPUT_DIR="docs/coordination/codex-reviews" ;;
   build)        OUTPUT_DIR="docs/coordination/codex-reviews" ;;
   slut-rapport) OUTPUT_DIR="docs/coordination/codex-reviews" ;;
   *) echo "❌ Ukendt --phase: $PHASE (forventet: plan|build|slut-rapport)" >&2; exit 64 ;;
 esac
 
 mkdir -p "$OUTPUT_DIR"
 OUTPUT_FILE="${OUTPUT_DIR}/${DATE}-${PAKKE_NAME}-runde-${ROUND_N}.md"
 
 PLAN_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo 'uncommitted')"
 
+STATUS_FILE="docs/coordination/${PAKKE_NAME}-status.md"
+KRAV_FILE="docs/coordination/${PAKKE_NAME}-krav-og-data.md"
+
 case "$PHASE" in
   plan|build)
     FORMAAL_LINE='FORMÅL: udledes af "## Formål"-sektionen i '"$PLAN_FILE"'.'
     ;;
   slut-rapport)
-    FORMAAL_LINE='FORMÅL (slut-rapport-fase): Verificér at slut-rapporten reflekterer faktisk leverance, plan-afvigelser ærligt, og fire-dokument-tjek korrekt. Underliggende pakke-formål kan slås op i rapport-headerens "Plan-fil"-felt hvis nødvendigt.'
+    FORMAAL_LINE='FORMÅL (slut-rapport-fase): Verificér at slut-rapporten reflekterer faktisk leverance, plan-afvigelser ærligt, og leverance-tabel mod krav-dok + Stork-invariant-tjek (disciplin §10.3) korrekt.'
     ;;
 esac
 
 PROMPT=$(cat <<EOF
-Læs disse filer:
-1. $PREFIX_FILE (niveau 1-prefix — anvend ordret)
-2. $PLAN_FILE ($PHASE-fasen for pakke $PAKKE_NAME)
+Du er Codex i Stork 2.0 — uafhængig kode-reviewer, read-only (disciplin §9.3).
+
+Læs FØR review:
+- docs/strategi/vision-og-principper.md
+- docs/strategi/forretningsforstaaelse.md (LÅST stamme-doc, D4)
+- docs/strategi/disciplin.md §9.3 (din rolle) + §5 (severities) + §8.1
+- $KRAV_FILE (pakke-kontrakt — hvis den findes)
+- $PLAN_FILE ($PHASE-fasen for pakke $PAKKE_NAME)
+- $STATUS_FILE (kontekst + konvergens-counter — hvis den findes)
 
 RUNDE-NUMMER: $ROUND_N
 FASE: $PHASE
 $FORMAAL_LINE
 
-Følg niveau 1-prefixens scope-krav + marker-protokol + dialog-regler.
+Review-fokus (§9.3): patch-først (§3.1) · end-to-end-spor (§3.3) ·
+state-dump matcher faktisk state (§3.2) · krav-dok-konsistens uden
+scope-creep · vision/forretningsforstaaelse-modsigelse ·
+MANGLENDE-EKSISTERENDE-BEVARELSE.
 
-Max $MAX_WORDS ord output. Brug marker-format fra niveau 1-prefix (KRITISK/MELLEM/LAV/HUL/OPTIMERING-FORSLAG/G-NUMMER-KANDIDAT etc.). Hvis du ikke har fund: skriv "APPROVAL — Runde $ROUND_N".
+Format pr. fund:
+[SEVERITY] Kort beskrivelse
+Konkret afvigelse: ...
+Anbefalet handling: [V<n+1>-rettelse / G-nummer / kosmetisk note]
+
+Berører ændringen en governance-doc: afslut med
+"§8.1-SVAR: INGEN-MODSIGELSE" eller "§8.1-SVAR: MODSIGELSE — <hvad>".
+
+Max $MAX_WORDS ord. Hvis ingen fund: skriv "APPROVAL — Runde $ROUND_N".
 EOF
 )
 
 # ============================================================
 # Eksekvér med hard timeout + non-json (live tail-friendly)
+# stdin lukkes — codex exec uden TTY hænger ellers på
+# "Reading additional input from stdin..." (gov-docs-renhed fund 6)
 # ============================================================
 
 RAW_OUTPUT="$(mktemp -t codex-review-raw.XXXXXX)"
 trap 'rm -f "$RAW_OUTPUT"' EXIT
 
 echo "▶ codex review (runde $ROUND_N, reasoning=$REASONING, timeout=${TIMEOUT_SEC}s)" >&2
 echo "  Plan: $PLAN_FILE" >&2
 echo "  Output: $OUTPUT_FILE" >&2
 echo "" >&2
 
 set +e
 timeout --signal=KILL "$TIMEOUT_SEC" codex exec --skip-git-repo-check \
   -c "model_reasoning_effort=\"$REASONING\"" \
   --enable fast_mode \
-  "$PROMPT" > "$RAW_OUTPUT" 2>&1
+  "$PROMPT" > "$RAW_OUTPUT" 2>&1 < /dev/null
 CODEX_EXIT=$?
 set -e
 
 if [ $CODEX_EXIT -eq 124 ] || [ $CODEX_EXIT -eq 137 ]; then
   echo "❌ codex timed out efter ${TIMEOUT_SEC}s." >&2
   echo "  Sidste output gemt i $RAW_OUTPUT (kopier til $OUTPUT_FILE manuelt hvis nyttig)." >&2
   cp "$RAW_OUTPUT" "$OUTPUT_FILE"
   exit 124
 fi
 
 if [ $CODEX_EXIT -ne 0 ]; then
   echo "❌ codex fejlede (exit $CODEX_EXIT)." >&2
   echo "  Output:" >&2
   tail -10 "$RAW_OUTPUT" >&2
   exit $CODEX_EXIT
 fi
 
 # ============================================================
 # Skriv output-fil med header
 # ============================================================
 
 case "$REASONING" in
   xhigh)  REASONING_FLAG="--xhigh" ;;
   medium) REASONING_FLAG="--quick" ;;
   *)      REASONING_FLAG="" ;;
 esac
 RERUN_CMD="$0 $PLAN_FILE $ROUND_N $REASONING_FLAG --phase=$PHASE"
 
 cat > "$OUTPUT_FILE" <<EOF
 # Codex review — $PAKKE_NAME runde $ROUND_N
 
 **Pakke:** $PAKKE_NAME
 **Fase:** $PHASE
 **Plan-fil:** $PLAN_FILE
 **Plan-SHA:** $PLAN_SHA
 **Dato:** $DATE
 **Reasoning:** $REASONING
 **Max ord:** $MAX_WORDS
 **Command:** \`$RERUN_CMD\` (re-run via samme args inkl. flags)
 
 ---
 
 EOF
 cat "$RAW_OUTPUT" >> "$OUTPUT_FILE"
 
 # ============================================================
-# Marker-parsing (V5.3 marker-protokol)
+# Marker-parsing + echo output + exit per routing
 # ============================================================
 
 echo "" >&2
 echo "▶ Marker-parsing:" >&2
 
-HALT_HIT=0
-SEVERITY_HIT=0
-WORKAROUND_HIT=0
-CLARIFICATION_HIT=0
-ESCALATE_HIT=0
-NEEDS_MATHIAS_HIT=0
-
-if grep -qE '^(STOP-FOR-CLARIFICATION):' "$RAW_OUTPUT"; then
-  CLARIFICATION_HIT=1
-  echo "  ⏸  STOP-FOR-CLARIFICATION rejst — info-mangel" >&2
-fi
-
-if grep -qE '^(BRUD-PAA-KRAV|TEKNISK-BLOKERING|PLAN-AFVIGELSE|KRITISK-SIKKERHEDSHUL):' "$RAW_OUTPUT"; then
-  HALT_HIT=1
-  echo "  🛑 Halt-marker rejst — kræver LØS-dialog eller eskalation" >&2
-fi
-
-# Severity-prefix detection (NY 2026-05-20 — G055-fix)
-# KRITISK uden halt-marker er stadig blocker per overvaagning-disciplin
-# ("KRITISK — STOPPER plan i alle runder"). Halt-markeren kan være
-# eksplicit ("KRITISK — PLAN-AFVIGELSE:") eller alene ("KRITISK: <fund>").
-# Matcher ord-grænse efter KRITISK så "KRITISKE" ikke triggers false positive.
-if grep -qE '^KRITISK\b' "$RAW_OUTPUT"; then
-  SEVERITY_HIT=1
-  echo "  🛑 KRITISK-severity rejst — stopper plan i alle runder" >&2
-fi
-
-# NEEDS-MATHIAS — stopper plan og kræver Mathias-afgørelse før V<n+1>
-if grep -qE '^(\[NEEDS-MATHIAS\]|NEEDS-MATHIAS)\b' "$RAW_OUTPUT"; then
-  NEEDS_MATHIAS_HIT=1
-  echo "  🚦 NEEDS-MATHIAS rejst — Code må ikke lave V<n+1> før Mathias har afgjort" >&2
-fi
-
-if grep -qE '^(WORKAROUND-INTRODUCERET):' "$RAW_OUTPUT"; then
-  WORKAROUND_HIT=1
-  echo "  ⚠️  WORKAROUND-INTRODUCERET — Mathias-gate kræves" >&2
-fi
-
-if grep -qE '^(ESCALATE|AUTO-ESKALATION):' "$RAW_OUTPUT"; then
-  ESCALATE_HIT=1
-  echo "  🚨 ESCALATE/AUTO-ESKALATION — Mathias-judgment via gate-fil" >&2
-fi
-
-if grep -qE '^(OPTIMERING-FORSLAG):' "$RAW_OUTPUT"; then
-  echo "  💡 OPTIMERING-FORSLAG fundet — Code's valg (ADOPT/DEFER/DISMISS)" >&2
-fi
-
-if grep -qE '^(SPARRING-OENSKE):' "$RAW_OUTPUT"; then
-  echo "  💬 SPARRING-OENSKE fundet" >&2
-fi
-
-if grep -qE '^(G-NUMMER-KANDIDAT):' "$RAW_OUTPUT"; then
-  echo "  📝 G-NUMMER-KANDIDAT(er) — log til teknisk-gaeld.md (fortsæt)" >&2
-fi
-
-if grep -qE '^APPROVAL\b' "$RAW_OUTPUT"; then
-  echo "  ✅ APPROVAL" >&2
-fi
-
-# ============================================================
-# Echo output + exit per marker-priority
-# ============================================================
+set +e
+parse_markers "$RAW_OUTPUT" "$ROUND_N"
+ROUTING_EXIT=$?
+set -e
 
 echo "" >&2
 echo "▶ Output:" >&2
 cat "$RAW_OUTPUT"
 
-# Exit-koder per V5.3 routing-tabel:
-if [ "$CLARIFICATION_HIT" -eq 1 ]; then
-  exit 1
-fi
-if [ "$WORKAROUND_HIT" -eq 1 ]; then
-  exit 3
-fi
-if [ "$ESCALATE_HIT" -eq 1 ]; then
-  exit 4
-fi
-if [ "$NEEDS_MATHIAS_HIT" -eq 1 ]; then
-  exit 4
-fi
-if [ "$HALT_HIT" -eq 1 ] || [ "$SEVERITY_HIT" -eq 1 ]; then
-  exit 2
-fi
-
-exit 0
+exit $ROUTING_EXIT

exec
/bin/bash -lc "git diff --unified=60 claude/gov-docs-renhed-plan..HEAD -- docs/strategi/disciplin.md docs/strategi/vision-og-principper.md docs/strategi/forretningsforstaaelse.md docs/strategi/stork-2-0-master-plan.md 'docs/LÆSEFØLGE.md' CLAUDE.md docs/claude-ai/SKILL.md docs/coordination/aktiv-plan.md docs/coordination/gov-docs-renhed-status.md docs/coordination/rapport-historik/README.md scripts/README.md .gitignore" in /home/mathias/stork-2.0
 succeeded in 0ms:
diff --git a/.gitignore b/.gitignore
index 6ca0875..9a70015 100644
--- a/.gitignore
+++ b/.gitignore
@@ -1,48 +1,51 @@
 # Logs
 logs
 *.log
 npm-debug.log*
 yarn-debug.log*
 yarn-error.log*
 pnpm-debug.log*
 lerna-debug.log*
 
 node_modules
 dist
 dist-ssr
 *.local
 
 # Environment
 .env
 .env.*
 !.env.example
 
 # Monorepo build caches
 .turbo
 
 # Supabase CLI artifacts
 supabase/.temp/
 supabase/.branches/
 
 # Editor directories and files
 .vscode/*
 !.vscode/extensions.json
 .idea
 .DS_Store
 *.suo
 *.ntvs*
 *.njsproj
 *.sln
 *.sw?
 
 # Windows alternate-data-stream artefakter (overført fra NTFS via WSL)
 *:Zone.Identifier
 
 # Windows NTFS Alternate Data Streams
 *:Zone.Identifier
 
 # Claude Code lokal arbejds-mappe
 .claude/
 
 # MS Office lock-filer (utilsigtet åbnet i Word/Excel)
 ~$*
+
+# Lokale V4-gennemgangs-kopier — aldrig committet; foldes/fjernes i gov-6 (G063)
+docs/coordination/v4-slettede-docs/
diff --git a/CLAUDE.md b/CLAUDE.md
index 1d40383..70c7e6d 100644
--- a/CLAUDE.md
+++ b/CLAUDE.md
@@ -1,13 +1,13 @@
 # Stork 2.0
 
 Læs `docs/LÆSEFØLGE.md` ved hver af de fem triggere defineret deri.
-Git pull før hver trigger.
+Branch-bevidst git-sync før hver trigger (disciplin §13).
 
 ## Kig ikke i (medmindre eksplicit autoriseret af Mathias)
 
 - `/home/mathias/sales-commission-hub/` (stork 1.0 — anti-mønstre, jf. forretningsforstaaelse §15)
 - `copenhagensales/*` GitHub-repos (samme grund)
 - `docs/coordination/arkiv/` (lukkede pakke-artefakter — kun læsbar reference, ikke aktiv kilde)
 - `docs/coordination/rapport-historik/<dato>-<pakke>.md` (historisk; konsulter kun hvis krav-dok refererer)
 
 Hooks i `~/.claude/settings.json` håndhæver de første to + arkiv/. Toggle via lock-filer hvis Mathias autoriserer adgang.
diff --git "a/docs/L\303\206SEF\303\230LGE.md" "b/docs/L\303\206SEF\303\230LGE.md"
index 840fd9a..b870975 100644
--- "a/docs/L\303\206SEF\303\230LGE.md"
+++ "b/docs/L\303\206SEF\303\230LGE.md"
@@ -1,46 +1,48 @@
 # Læsefølge
 
 <!-- governance-owns: laeseflade-nav -->
 
 Skal læses ved hver af følgende triggere:
 
 - Ny session/chat starter
 - Ny plan-runde starter (planlægning)
 - Codex-review-runde starter
 - Implementation starter (efter Mathias-godkendelse)
 - Slut-rapport skrives
 
 Begrundelse: andre aktører kan have committet siden sidst.
 Stale repo-state = fabrikation af kontekst.
 
 Procedure:
 
-0. `git pull origin main`
-   Verificér at lokal arbejds-kopi matcher repo HEAD. Stop hvis
-   `git status` viser uventede uncommitted changes. Stop hvis pull
-   viser commits der ikke var forventede — rapportér til Mathias.
+0. Branch-bevidst git-sync (disciplin §13): `git fetch` + verificér
+   branch/base/remote + pull den branch arbejdet sker på.
+   Stop hvis `git status` viser uventede uncommitted changes. Stop hvis
+   sync viser commits der ikke var forventede — rapportér til Mathias.
 
 1. `docs/strategi/vision-og-principper.md`
    Vision og 9 principper. **LÅST-AUTORITATIV** — vinder over alt andet ved konflikt.
 
 2. `docs/strategi/forretningsforstaaelse.md`
    Mathias' tanker om hvad systemet skal kunne på forretnings-niveau.
-   **TANKE-DATA** — kontekst-grundlag for krav-dok, ikke kontrakt.
-   Kan opdateres når Mathias' tanker udvikler sig.
+   **LÅST-AUTORITATIV** — stamme-doc med vision (D4). Opdateres når
+   Mathias' tanker udvikler sig, via PR + CODEOWNERS.
 
 3. `docs/strategi/disciplin.md`
    Hvordan vi arbejder sammen (V5): aktører + roller + workflow + gates +
    disciplin + skabeloner. **Eneste rolle-hjem** — læs §9.X for din egen rolle.
 
 4. `docs/strategi/stork-2-0-master-plan.md`
    **OVERBLIK** — autoritativ teknisk plan + status pr. trin (§4.1) + action-items (§4.2).
    Rettes til sidst i hver pakke. Konsulteres for kontekst, men er ikke kilde i pakke-arbejde.
 
 5. `docs/coordination/aktiv-plan.md`
    Peger på nuværende plan-arbejde + pakke-status.
 
 6. `docs/coordination/seneste-rapport.md`
    Sidste leverance-state.
 
 Stop ved tvivl. Spørg Mathias hvis 1-6 modsiger hinanden.
-Ved konflikt mellem dokumenter: vision (1) vinder over alle andre.
+Ved konflikt mellem dokumenter: vision (1) vinder over alle andre — undtagen
+forretningsforstaaelse (2): modsigelse mellem de to stamme-docs er et hul →
+STOP → Mathias lukker (D4).
diff --git a/docs/claude-ai/SKILL.md b/docs/claude-ai/SKILL.md
index 57598e5..06d4ba4 100644
--- a/docs/claude-ai/SKILL.md
+++ b/docs/claude-ai/SKILL.md
@@ -1,39 +1,46 @@
 ---
 name: stork-2-0-claude-ai
 description: Claude.ai-rolle i Stork 2.0 (V5) — krav-dok-typist + slut-rapport-reviewer. Aktiveres via `qwers`. Læser rolle-definition i disciplin.md §9.1 via Filesystem-MCP fra repoet.
 ---
 
 # Stork 2.0 — Claude.ai
 
 Du er Claude.ai i Stork 2.0's workflow (V5) — krav-dok-typist (Step 1) + slut-rapport-reviewer (Step 5).
 
 ## Aktivering
 
 **Når Mathias paster `qwers`:** læs `docs/strategi/disciplin.md` §9.1 via Filesystem-MCP. Følg rolle-definitionen der. Bekræft kort:
 
 > "Rolle bekræftet som Claude.ai (krav-dok-typist + slut-rapport-reviewer). Klar til qwerr eller pakke-kontekst."
 
 **Når Mathias paster `qwerr`:** følg protokollen fra disciplin.md §9.1. Find review-target via:
 
 - Eksplicit besked fra Mathias (typisk slut-rapport-PR-link), eller
 - tracker-issue #12 (`slut-rapport-pr` eller `slut-rapport-push`)
 
 ## Referencer (læs via Filesystem-MCP når relevant)
 
 Per V5 LÆSEFØLGE:
 
 - `docs/strategi/vision-og-principper.md` — LÅST-AUTORITATIV (system, ikke roller)
 - `docs/strategi/forretningsforstaaelse.md` — TANKE-DATA (Mathias' tanker)
 - `docs/strategi/disciplin.md` — V5-disciplin (din rolle i §9.1, krav-dok-skabelon i §10.1, slut-rapport-skabelon i §10.3)
 - `docs/strategi/stork-2-0-master-plan.md` — OVERBLIK (rettes til sidst i pakke)
 - `docs/coordination/<pakke>-krav-og-data.md` — pakke-kontrakt (efter Mathias-godkendelse)
 - `docs/coordination/<pakke>-plan.md` — pakke-kontrakt efter qwerg
 - `docs/coordination/<pakke>-status.md` — pakke-kontekst + konvergens-counter
 
 ## Hvorfor minimal
 
 Hele rolle-definitionen lever i `docs/strategi/disciplin.md` §9.1 (versioneret i git). Skill'en peger bare på den. Det betyder:
 
 - Ændringer til rolle/cadence/protokol skal kun laves ét sted (filen)
 - Skill'en arver automatisk forbedringer fra fremtidige pakker
 - Du behøver ikke re-opdatere skill'en når workflow-spec udvikler sig
+
+## Kanonisk kilde
+
+Denne fil er DEN kanoniske skill. Platform-skill'en i claude.ai er en kopi
+af denne fil — ved drift vinder repo-versionen. Sync: Mathias kopierer
+fil-indholdet til platform-skill'en når denne fil ændres (flagges i
+slut-rapport som Mathias-handling).
diff --git a/docs/coordination/aktiv-plan.md b/docs/coordination/aktiv-plan.md
index a18a1c0..5743170 100644
--- a/docs/coordination/aktiv-plan.md
+++ b/docs/coordination/aktiv-plan.md
@@ -1,17 +1,19 @@
 # Aktiv plan
 
 Peger på den plan-fil der aktuelt er under arbejde (skrives → reviewes → bygges).
 
-**Aktuel:** ingen pakke under arbejde — næste i rest-sekvens: gov-4-branch-protection (gov-3 CI-blockers fuldt færdig). **Merged:** gov-1 (paritet, 2026-06-04) · gov-2 (vagt, PR #93) · gov-docs-housekeeping (krav-dok-familie, PR #94) · **gov-3a** (4 §3-checks #4/#7/#16/#17 + zone-§3-fjernelse, PR #95, main @ c32097c; ikke-required indtil gov-4) · **gov-3b-1** (#19 FK-dækning + #6 indeks-pr-policy, PR #96, main @ a88d217; 23→25 fitness-checks; 0 SQL-/indeks-migrations; 3 sale-FK'er `FK_PENDING` → Trin 14 [H025]) · **gov-3b-2** (#10 SECDEF-markør-disciplin, PR #101, main @ `165833c`; 25→26 fitness-checks; 0 migrations; #18 udskilt → gov-3b-3 + [G065]) · **gov-3b-3a** (#18 del 1: §1.1:160-reconcile + 9 `permission_*` INVOKER→SECDEF, PR #103, main @ `c846105`; 4 migrations live-applikeret; G065 stadig åben → 3b) · **gov-3b-3b** (#18 del 2: sidste 5 INVOKER→SECDEF + REVOKE authenticated-write + #18-check, PR #105, main @ `7be6511`; 4 migrations live; **[G065] LØST**; gov-3 CI-blockers fuldt færdig). Rest-sekvens: gov-4-branch-protection → gov-5-automation → gov-6-arkiv-fold. Åbne G-numre: G061 (comment-parity, før gov-4), G062 (recurring types-drift), G063 (v4-slettede-docs-allowlist → gov-6). (G065 LØST i gov-3b-3b.) Åbne H: [H025] (Trin 14: sale-FK'er + orphan-cleanup). Krav-dok (ét dok over de 6): `docs/coordination/governance-vagt-krav-og-data.md` ✓.
+<!-- aktiv-pakke: gov-docs-renhed fase: build -->
+
+**Aktuel:** **gov-docs-renhed** under build — plan: `docs/coordination/gov-docs-renhed-plan.md` (V4, Codex-approved runde 4 m. §8.1-SVAR: INGEN-MODSIGELSE; qwerg 2026-06-10). Derefter i rest-sekvens: gov-4-branch-protection (gov-3 CI-blockers fuldt færdig). **Merged:** gov-1 (paritet, 2026-06-04) · gov-2 (vagt, PR #93) · gov-docs-housekeeping (krav-dok-familie, PR #94) · **gov-3a** (4 §3-checks #4/#7/#16/#17 + zone-§3-fjernelse, PR #95, main @ c32097c; ikke-required indtil gov-4) · **gov-3b-1** (#19 FK-dækning + #6 indeks-pr-policy, PR #96, main @ a88d217; 23→25 fitness-checks; 0 SQL-/indeks-migrations; 3 sale-FK'er `FK_PENDING` → Trin 14 [H025]) · **gov-3b-2** (#10 SECDEF-markør-disciplin, PR #101, main @ `165833c`; 25→26 fitness-checks; 0 migrations; #18 udskilt → gov-3b-3 + [G065]) · **gov-3b-3a** (#18 del 1: §1.1:160-reconcile + 9 `permission_*` INVOKER→SECDEF, PR #103, main @ `c846105`; 4 migrations live-applikeret; G065 stadig åben → 3b) · **gov-3b-3b** (#18 del 2: sidste 5 INVOKER→SECDEF + REVOKE authenticated-write + #18-check, PR #105, main @ `7be6511`; 4 migrations live; **[G065] LØST**; gov-3 CI-blockers fuldt færdig). Rest-sekvens: gov-4-branch-protection → gov-5-automation → gov-6-arkiv-fold. Åbne G-numre: G061 (comment-parity, før gov-4), G062 (recurring types-drift), G063 (v4-slettede-docs-allowlist → gov-6). (G065 LØST i gov-3b-3b.) Åbne H: [H025] (Trin 14: sale-FK'er + orphan-cleanup). Krav-dok (ét dok over de 6): `docs/coordination/governance-vagt-krav-og-data.md` ✓.
 
 Når ny pakke startes følges V5-flowet i `docs/strategi/disciplin.md` §2:
 
 1. **Step 0** — Pakke-åbning (Mathias melder ud)
 2. **Step 1** — Krav-dok (Claude.ai-typist + Mathias-validator i chat)
 3. **Step 2** — Plan (Code + Codex parallel; skitse-størrelses-tjek; fuld plan eller split)
 4. **Step 3** — `qwerg` approval (Mathias)
 5. **Step 4** — Build (Code batches; Codex per-batch auto)
 6. **Step 5** — Slut-rapport (Code skriver; Claude.ai-review FØR merge)
 
 For tidligere pakke-historik: se `docs/coordination/rapport-historik/`.
 For status pr. byggetrin: se `docs/strategi/stork-2-0-master-plan.md` §4.1.
diff --git a/docs/coordination/gov-docs-renhed-status.md b/docs/coordination/gov-docs-renhed-status.md
index 7d5ba76..da8ce9f 100644
--- a/docs/coordination/gov-docs-renhed-status.md
+++ b/docs/coordination/gov-docs-renhed-status.md
@@ -1,26 +1,40 @@
 # gov-docs-renhed — Pakke-status
 
-**Sidste handling:** Codex runde 4: **APPROVAL — INGEN NYE FUND + §8.1-SVAR: INGEN-MODSIGELSE** (2026-06-10). Plan V4 er Codex-approved.
-**Næste forventet:** Mathias læser Plan V4 igennem → paster `qwerg` → build starter (batch 1: script-reconcile). INTET bygges før qwerg (§2 Step 3).
-**Konvergens-counter:** 4 (afsluttet — konvergeret ved runde 4).
-**Aktuel blocker:** afventer Mathias-gennemlæsning + `qwerg`.
+**Sidste handling:** Build batch 5: Codex runde 6 gav 2 KRITISK — begge rettet (prettier-format på de to .mjs; MELLEM runde-aware routing + 4 nye fixtures, parse-test 14/14). 2026-06-10.
+**Næste forventet:** Codex verifikations-review (runde 7) af batch 5 → grøn → Code skriver slut-rapport → Claude.ai-review FØR merge (Step 5) → Mathias "slut OK" + merge.
+**Konvergens-counter:** 4 (plan-fase, afsluttet ved runde 4-APPROVAL). Build-reviews: runde 5 (3 KRITISK → batch 4/4b) · runde 6 (2 KRITISK → batch 5) · runde 7 afventes.
+**Aktuel blocker:** ingen.
 
-Til Mathias' gennemlæsning (qwerg-forudsætninger, §2 Step 3):
+Build-state (qwerg 2026-06-10):
 
-- **Fundament-validering:** planen implementerer dine egne krav-dok-afgørelser
-  (D4 + forretningsforståelse-løft). Vision-banneret får en minimal
-  D4-undtagelse (plan appendix A.1) — vision er LÅST, så DEN ændring håndhæves
-  af din CODEOWNERS-approval ved merge.
-- **§3.4-alert (counter 4):** rejst i runde 4-versionen — Codes vurdering: fund-
-  kæden var plan-interne huller (D4-temaet fra skiftende vinkler), ikke krav-
-  uklarhed. Konvergeret: 5 → 4 → 1 → 0 fund.
-- **Script-verdikter:** codex-review.sh repareres; claude-ai-prompt.sh,
-  data-grundlag.sh, krav-afklar.sh slettes (git-history bevarer).
+- Batch 1 ✓ (`ddc72db`): 3 V5.3-scripts slettet, codex-review.sh repareret.
+  Evidens: --parse-test grøn, governance:check grøn.
+- Batch 2 ✓ (`42bfb55`): doc-reconcile A.1–A.14. Evidens: governance:check grøn.
+  (Fejl-committede også 17 v4-slettede-docs-filer — fanget af Codex runde 5,
+  rettet i batch 4.)
+- Batch 3 ✓ (`00c1ebd`): allowlist-split + structural-chain + sti-regex-fix +
+  9 selftest-cases + aktiv-pakke-markør. Evidens: selftest fuldt grøn
+  (baseline + 13 plantede + deprecated-positiv), fitness grøn.
+- Batch 4 ✓: runde 5-fund-fixes (denne commit).
+
+Plan-afvigelser (til slut-rapport):
+
+1. rapport-skabelon-allowlist-entry beholdt (plan sagde prune) — planens egen
+   A.12-tekst er levende prosa-referent; prune ved pakke-luk/gov-6.
+2. v4-slettede-docs/ kortvarigt tracked i batch 2 (Code-fejl, `git add -A`) —
+   untracked igen + .gitignore-værn i batch 4. Aldrig på main.
+3. MANGLENDE-EKSISTERENDE-BEVARELSE-routing tilføjet parseren (runde 5-fund) —
+   udvidelse af B.1 inden for §5-semantikken.
+4. codex-reviews/ tilføjet scannerens DOC_EXCLUDE (batch 4b) — review-filer er
+   ephemeral rå-output (§4) der bevidst citerer døde stier; first-time-fund da
+   reviews aldrig før var committet som filer.
+5. MELLEM-routing gjort runde-aware i parseren (runde 6-fund, batch 5) —
+   §5 runde-trapper: exit 2 i runde 1, G-spor i runde 2+.
 
 Noter:
 
-- Krav OK givet af Mathias 2026-06-10. 0 migrations — ren docs+scripts-pakke.
-- Reviews: codex-reviews/2026-06-10-gov-docs-renhed-runde-{1,2,3,4}.md
-  (2K+3M → 1K+3M → 1K+1G-kandidat → APPROVAL).
-- Driftsnote: `codex exec` uden TTY kræver `< /dev/null` (stdin-hænger) — fix
-  indgår i codex-review.sh-repair (appendix B.1).
+- Krav OK 2026-06-10 · qwerg 2026-06-10. 0 migrations — ren docs+scripts-pakke.
+- Reviews: codex-reviews/2026-06-10-gov-docs-renhed-runde-{1..4}.md (plan:
+  2K+3M → 1K+3M → 1K+1G → APPROVAL) · runde-5.md (build: 3 KRITISK → batch 4).
+- Driftsnote: `codex exec` uden TTY kræver `< /dev/null` — indbygget i repareret
+  codex-review.sh.
diff --git a/docs/coordination/rapport-historik/README.md b/docs/coordination/rapport-historik/README.md
index bd06c3e..2ba0155 100644
--- a/docs/coordination/rapport-historik/README.md
+++ b/docs/coordination/rapport-historik/README.md
@@ -1,9 +1,9 @@
 # Rapport-historik
 
 Alle slut-rapporter fra Code til Mathias. Én fil pr. afsluttet pakke, navngivet `<dato>-<pakke-kode>.md`.
 
-Hver rapport følger `docs/skabeloner/rapport-skabelon.md`.
+Hver rapport følger skabelonen i `docs/strategi/disciplin.md` §10.3.
 
 Den senest leverede rapport peges der på fra `docs/coordination/seneste-rapport.md`. Ændring i `seneste-rapport.md` trigger Codex-notify GitHub Action.
 
 Append-only struktur. Historikken bevares som audit-spor.
diff --git a/docs/strategi/disciplin.md b/docs/strategi/disciplin.md
index 0eea85d..06e62a8 100644
--- a/docs/strategi/disciplin.md
+++ b/docs/strategi/disciplin.md
@@ -1,106 +1,106 @@
 # Stork 2.0 — Arbejds-disciplin (V5)
 
 <!-- governance-owns: aktoerer-roller, workflow, gates, severities, vagter, skabeloner, bevarings-politik -->
 
 Ét hjem for hvordan vi arbejder sammen: aktører, roller, flow, gates, severities, disciplin. Mathias styrer tanker, funktioner, logik og vision; AI'erne (Claude.ai, Code, Codex) bygger. Vi bygger ovenpå eksisterende kode, ikke nyt hver gang.
 
 > **Dette er det eneste rolle- og proces-hjem.** Vision-og-principper.md definerer ikke længere aktører eller roller — det er proces, og det bor her. Ved konflikt om systemets vision vinder vision-dokumentet; ved spørgsmål om hvordan vi arbejder vinder denne fil.
 
 > **V5-ændringer fra V4 (afgørelser, kan omgøres):** Genindført fire discipliner V4 tabte uden beslutning, fordi de er bærende — formåls-immutabilitet (§3.0), differentieret modsigelses-håndtering (§8), destructive-drops-preflight (§3.9), glid-detector (§9). Ikke genindført det V4 bevidst droppede (footer): 3-AI forretningsgang-triangulering og fire-dok-konsultations-tabel — substansen ligger i §9.1 proaktiv recon og §9.3 Codex-review-fokus, og V4 havde ret i at skære ceremonien. Automation skrevet ærligt som notify-only (§2, §6.2).
 
 ---
 
 ## §1 Aktører og roller
 
 | Aktør         | Rolle                                                                                                                                     |
 | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
 | **Mathias**   | Tanker, funktioner, logik, vision. Eneste beslutningstager. Dikterer krav-dok pr. pakke. Godkender plan + slut-rapport                    |
 | **Claude.ai** | Krav-dok-typist (skriver Mathias' tanker ned). Slut-rapport-reviewer. Strategisk sparring. **Docs-lag — kigger ikke på kode/DB-tilstand** |
 | **Code**      | Builder. Migrations, RPC'er, tests. Eneste med skrive-adgang til repo                                                                     |
 | **Codex**     | Uafhængig kode-reviewer. Read-only. Bugs, RLS-huller, SQL-fejl, manglende-eksisterende-bevarelse                                          |
 
 **Ingen AI må:** træffe forretnings-beslutninger på Mathias' vegne · skrive "afgørelser"/"ramme-låsninger" som AI · fortolke retning som specifikation uden bekræftelse · designe datamodel uden Mathias-input (Claude.ai) · skrive kode (Codex) · påstå repo-/DB-tilstand uden at have verificeret den (alle).
 
 ---
 
 ## §2 Workflow — 5-step flow
 
 Alle pakker kører fuld disciplin. Ingen skala-distinktion.
 
 ```
 0. Pakke-åbning (Mathias)
    ↓
 1. Krav-dok (Mathias → Claude.ai-typist, proaktiv recon; Mathias validerer)   ← gate: "krav OK"
    ↓
 2. Plan (Code + Codex parallel; skitse → størrelses-tjek → fuld plan eller split)
    ↓
 3. qwerg approval (Mathias)                                                    ← gate: "qwerg"
    ↓
 4. Build (Code batches; Codex per-batch; end-to-end-konsistens per batch)
    ↓
 5. Slut-rapport (Code skriver; Claude.ai-review FØR merge)                     ← gate: "slut OK"
 ```
 
 Tre gates kræver Mathias: `krav OK`, `qwerg`, `slut OK`. Trin 2 og 4 er hvor det meste arbejde sker.
 
-> **Automation-tilstand (Codes kortlægning, juni 2026 — Codes bord):** `codex-notify` poster kun tracker-comment. Der er **ingen Codex-runner og ingen auto-merge-workflow endnu**, og plan-branchen er ikke dækket af triggeren (H020). Indtil det bygges: Mathias merger PR'er, og Codex-review relæes manuelt. Flowet ovenfor er mål-tilstanden — gates der hviler på auto-merge er ikke aktive endnu. Denne fil påstår ikke en automation der ikke kører.
+> **Automation-tilstand (Codes kortlægning, juni 2026 — Codes bord):** `codex-notify` poster kun tracker-comment. Der er **ingen Codex-runner og ingen auto-merge-workflow endnu**, og plan-branchen er ikke dækket af triggeren (bygges i gov-5-automation). Indtil det bygges: Mathias merger PR'er, og Codex-review relæes manuelt. Flowet ovenfor er mål-tilstanden — gates der hviler på auto-merge er ikke aktive endnu. Denne fil påstår ikke en automation der ikke kører.
 
 ### Step 0 — Pakke-åbning
 
 Mathias melder ny pakke ud i chat.
 
 ### Step 1 — Krav-dok
 
 Claude.ai skriver `docs/coordination/<pakke>-krav-og-data.md` fra Mathias' chat-input; Mathias validerer i samme chat.
 
 - Mathias' tanker om hvad pakken skal levere (forretning + funktion + logik)
 - Ingen tabel-navne/kolonner/RPC-signaturer (Code's bord i plan-fasen)
 - Hver påstand peges på Mathias-ord — ingen kilde: spørg, skriv ikke. Ingen fabrikation.
 
 ### Step 2 — Plan (med skitse-tjek)
 
 **2.0 skitse + størrelse:** 1-5 migrations → fuld V1. 6+ → STOP, split-forslag (krav-dok forbliver ÉT dok, implementation splittes over pakker).
 **2.1 fuld plan (Code+Codex parallel fra V1):** Code skriver V<n>; Codex laver parallel kode-research. Code håndterer hvert KODE-FUND eksplicit i V<n+1> (ADRESSERET / AFVIST fordi Y). Stop: Codex APPROVAL + "INGEN NYE FUND".
 
 ### Step 3 — qwerg
 
 Mathias paster `qwerg` når Codex har approved OG Mathias selv har læst igennem.
 
 **Forudsætning — fundament-validering (grøn før qwerg):** planen skal stå på mål med vision + forretningsforstaaelse. Almindelig plan bekræfter "ingen forretnings-intentions-ændring" (Doc-currency A, §10.2). Plan der ændrer intention: fundament-doc'en reconciles først gennem §8.1-gaten + Mathias' CODEOWNERS — FØR qwerg. Modsigelses-konsekvens per §8 (vision LÅST = STOP). En plan godkendes ikke stående på fundament den modsiger.
 
 ### Step 4 — Build
 
 Batches på 3-5 migrations. Patch-først (§3.1). End-to-end-konsistens per batch. Smoke-fejl → STOP-gate (§3.7).
 
 ### Step 5 — Slut-rapport
 
 Code skriver `rapport-historik/<dato>-<pakke>.md`. Claude.ai reviewer FØR merge.
 
 ---
 
 ## §3 Bygge-disciplin
 
 ### 3.0 Formåls-immutabilitet (genindført)
 
 Hver pakke har ét FORMÅL (krav-dok §Formål). Når Mathias har godkendt det, er det **låst**. Code må ændre den tekniske implementations-vej undervejs (Code's domæne — flag i slut-rapport under Plan-afvigelser), men **ikke** formålet. Afslører implementation at formålet ikke kan leveres: STOP, eskalér. Codex-fund kan føre til bug-fix, implementations-ændring, G-nummer eller STOP+eskalation — **aldrig** til at Code ændrer formål, tilføjer features eller omtolker hvad pakken skal levere.
 
 ### 3.1 Patch-først (byg ovenpå, ikke nyt)
 
 For HVER eksisterende funktion/policy/tabel der ændres: plan inkluderer NUVÆRENDE body 1:1 med file:linje + markerer DIFF eksplicit (hvad fjernes/tilføjes, hvilke gates/kommentarer/kolonner/audit-spor bevares) + migration starter med diff-summary. Tab af gate/kommentar/kolonne uden begrundelse = `MANGLENDE-EKSISTERENDE-BEVARELSE` (KRITISK).
 
 ### 3.2 DB-state-dump som plan-pre-condition
 
 Code må ikke skrive plan før konkret DB-state er dumpet via Supabase MCP (RPC-bodies via `pg_get_functiondef`, kolonner+constraints, policies, grants) og lagt i plan under "Verificerede DB-objekter" som råt output. Ingen gæt, ingen cached state.
 
 ### 3.3 End-to-end-spor pr. write-vej
 
 For hver write-RPC der ændres/tilføjes: (1) GRANT + policy + session-var som tre-pak, (2) SELECT-policy bred nok til alle legitime læsere, (3) apply-dispatcher-extension, (4) én eksempel-row gennem fuldt flow (UI → handler → RPC → DB → læsning), (5) krydscheck mod fundament-tjek. Manglende ét = KRITISK i plan-review.
 
 ### 3.4 Konvergens-counter med auto-STOP
 
 Counter i pakke-status, incrementerer pr. V<n>. Runde 1-3 normalt · 4 Mathias-alert ("er krav-dok præcist nok?") · 5 auto-pause · 6+ auto-STOP (krav-dok genåbnes eller pakken splittes). Konvergerer vi ikke i 3-4 runder er problemet rammen, ikke "prøv igen".
 
 ### 3.5 Pakke-status.md — kontekst mellem sessioner
 
 Hver aktiv pakke har én lille fil: sidste handling · næste forventet · konvergens-counter · aktuel blocker. AI'er læser den FØRST.
 
@@ -114,163 +114,168 @@ Build-afvigelse fra krav-dok kræver eksplicit Mathias-godkendelse via gate-fil
 
 ### 3.8 Pakke-størrelses-grænse
 
 Skitse > 5 migrations → STOP, foreslå split.
 
 ### 3.9 Destructive drops kræver preflight (genindført — højeste indsats; Stork rører løndata)
 
 `DROP TABLE/COLUMN`, `TRUNCATE`, `DELETE` uden WHERE o.l. kræver:
 
 - **Tom-check:** `count(*) = 0`, eller eksplicit kvittering for antal rows der tabes
 - **Reference-check:** ingen FK refererer det droppede (ikke kun CASCADE-fix)
 - **Audit-spor:** session-vars `source_type` + `change_reason` sat før operation
 - **Rollback-plan:** hvordan operationen rulles tilbage
 
 Pre-cutover (ingen rigtige data): tom-check + audit-spor er minimum. Post-cutover: alle fire er CI-blocker; manglende preflight = review-rejection. Dette er den dyreste fejl-klasse i systemet.
 
 ---
 
 ## §4 Bevarelses-disciplin — hvad gemmes, hvad slettes
 
 **Princip:** kun krav-dok + godkendt plan (slut-version) + slut-rapport overlever pakken. Resten lever i git-history.
 
 **Bevares på main:** krav-dok → `arkiv/<pakke>-krav-og-data.md` · plan → `arkiv/<pakke>-plan.md` · slut-rapport → `rapport-historik/<dato>-<pakke>.md` · in-place-opdateringer til vision, forretningsforstaaelse, master-plan (overblik), teknisk-gaeld.
 
 **Slettes ved pakke-luk:** `<pakke>-status.md` · alle `plan-feedback/<pakke>-V<n>-*` · alle `codex-reviews/<pakke>-runde-*` · afgjorte `mathias-gate/<pakke>-*` · plan-versioner V1..Vn (git-history bevarer sporet).
 
 **Én bevarings-politik.** Arkivet er ikke en voksende kirkegård; iterations-, recon- og review-filer lever i git-history, ikke som filer på main.
 
 ---
 
 ## §5 Severities + FLAG/LØS-dialog
 
 | Severity                             | Konsekvens                                                                                                                                       |
 | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
 | **KRITISK**                          | Stopper plan/build i alle runder. Code SKAL adressere næste runde                                                                                |
 | **MANGLENDE-EKSISTERENDE-BEVARELSE** | KRITISK-undertype: mister gate/kommentar/kolonne fra eksisterende body uden begrundelse                                                          |
 | **MELLEM**                           | Stopper i runde 1. G-nummer i runde 2+                                                                                                           |
 | **KOSMETISK**                        | Stopper IKKE. G-nummer-kandidat                                                                                                                  |
 | **OPGRADERING**                      | Stopper IKKE. Code afviser eller implementerer eksplicit i V<n+1>. Codex må give APPROVAL + OPGRADERING samtidig                                 |
 | **NEEDS-MATHIAS**                    | Stopper i alle runder. Code kan ikke lave V<n+1> før Mathias afgør. Reviewer skriver eksplicit spørgsmål. Max 2 pr. review — flugtvej hvis flere |
 | **FULDSTYRKE-MANGEL**                | Kun Mathias-rejst. AI scrapper output, gentager samme V-nummer                                                                                   |
 
 Hver severity bærer funktion — de kollapses ikke. (MANGLENDE-EKSISTERENDE-BEVARELSE binder patch-først; OPGRADERING muliggør approval+forslag samtidig.)
 
 **Runde-trapper:** runde 1 alle fund vurderes · runde 2 kun KRITISK stopper, MELLEM → G-numre · runde 3 kun KRITISK, resten → G-numre · runde 4+ se §3.4.
 
 **FLAG → LØS (Code's svar pr. Codex-fund):** ACCEPT / PUSHBACK (argumentér; Codex: AGREE/REFINE) / PROPOSE-ALTERNATIVE. Max 3 LØS-iterationer pr. fund; > 3 → auto-eskalation via `mathias-gate/`.
 
 **Positive markers:** OPTIMERING-FORSLAG (Codex) → Code: ADOPT/DEFER/DISMISS · SPARRING-OENSKE (Code) → Codex: CONFIRM/TIMING/AVOID.
 
 ---
 
 ## §6 Build-markers + automation
 
 ### 6.1 Halt-markers
 
 `BRUD-PAA-KRAV` → Step 1 · `TEKNISK-BLOKERING` → Step 2 / Mathias · `PLAN-AFVIGELSE` → Step 2 / Mathias · `KRITISK-SIKKERHEDSHUL` → fix samme batch / Mathias · `WORKAROUND-INTRODUCERET` → mathias-gate · `STOP-FOR-CLARIFICATION` → gate-fil.
 
 ### 6.2 Automation (Codes bord — tilstand: notify-only)
 
-`codex-notify.yml` poster tracker-comments på push til aktiv-plan/seneste-rapport/build-branch og på slut-rapport-PR. **Den kører ikke Codex, og der er ingen auto-merge.** Mål-tilstand (skal bygges, Codes bord): plan-branch-trigger (H020), Codex-runner, auto-merge ved grøn CI + godkendelse. `migrations-deploy.yml` deployer til live + regenererer types ved push til migrations — verificér mod Codes kortlægning før den antages aktiv.
+`codex-notify.yml` poster tracker-comments på push til aktiv-plan/seneste-rapport/build-branch og på slut-rapport-PR. **Den kører ikke Codex, og der er ingen auto-merge.** Mål-tilstand (skal bygges, Codes bord — samlet i gov-5-automation): plan-branch-trigger, Codex-runner, auto-merge ved grøn CI + godkendelse. `migrations-deploy.yml` deployer til live + regenererer types ved push til migrations — verificér mod Codes kortlægning før den antages aktiv.
 
 ### 6.3 Mathias-gate to-fil-flow
 
 For WORKAROUND-INTRODUCERET, STOP-FOR-CLARIFICATION, dobbelt-ESCALATE og iter > 3: build pauser → Code skriver gate-fil (Status: AFVENTER MATHIAS + begrundelse + G-nummer + deadline) → Mathias: GODKENDT/AFVIST → genoptag/alternativ → slettes ved pakke-luk.
 
 ---
 
 ## §7 Stork-invariant-tjek pr. pakke (verificeres i slut-rapport)
 
-| #   | Invariant                    | Test                                                        |
-| --- | ---------------------------- | ----------------------------------------------------------- |
-| 1   | Vision-overholdelse          | Vision-tjek-sektion (ja/nej + evidens pr. princip)          |
-| 2   | Permission-matrix-konsistens | RPC→tab/page-mapping opdateret + RLS dækker alle write-veje |
-| 3   | Audit-trigger-dækning        | Alle nye tabeller har audit-trigger (fitness)               |
-| 4   | Konfiguration-i-data         | Ingen hardkodede satser/lønarter (lint)                     |
-| 5   | End-to-end-flow virker       | Smoke-test passerer (ikke schema-only)                      |
-| 6   | Anonymisering-bevaring       | UPDATE, ikke DELETE; FK'er intakt                           |
+| #   | Invariant                    | Test                                                                                  |
+| --- | ---------------------------- | ------------------------------------------------------------------------------------- |
+| 1   | Vision-overholdelse          | Vision-tjek-sektion (ja/nej + evidens pr. princip)                                    |
+| 2   | Permission-matrix-konsistens | RPC→tab/page-mapping opdateret + RLS dækker alle write-veje                           |
+| 3   | Audit-trigger-dækning        | Alle nye tabeller har audit-trigger (fitness)                                         |
+| 4   | Konfiguration-i-data         | Ingen hardkodede satser/lønarter (Codex + Claude.ai-tjek — lint bygges i senere spor) |
+| 5   | End-to-end-flow virker       | Smoke-test passerer (ikke schema-only)                                                |
+| 6   | Anonymisering-bevaring       | UPDATE, ikke DELETE; FK'er intakt                                                     |
 
 Tabel med ja/nej + evidens. Manglende eller "nej" uden begrundelse → KRITISK fra Claude.ai-reviewer.
 
 ---
 
 ## §8 Modsigelses-disciplin (genindført — differentieret efter dokument-status)
 
 Hvad en modsigelse udløser afhænger af hvilket dokument den rammer. Det forhindrer at arbejdet stopper på master-plan (som er overblik, ikke kontrakt).
 
-| Dokument                                | Status              | Modsigelse udløser                                                                                                                                           |
-| --------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
-| `vision-og-principper.md`               | **LÅST**            | STOP. KRITISK. Vinder over alt. Dokumentér i blokker-fil, argumentér ikke videre                                                                             |
-| `stork-2-0-master-plan.md` + afgørelser | **RETNINGSGIVENDE** | Rapport til Mathias — IKKE auto-blokering. Han afgør: er rammen forældet (rettes) eller skal pakken justeres? Arbejdet stopper ikke, det venter på afgørelse |
-| krav-dok + plan (efter approval)        | **PAKKE-KONTRAKT**  | STOP. KRITISK indtil Mathias afgør re-godkendelse eller justering                                                                                            |
+| Dokument                                | Status              | Modsigelse udløser                                                                                                                                                                   |
+| --------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
+| `vision-og-principper.md`               | **LÅST**            | STOP. KRITISK. Vinder over alt undtagen forretningsforstaaelse (D4: indbyrdes stamme-doc-modsigelse = hul → STOP → Mathias lukker). Dokumentér i blokker-fil, argumentér ikke videre |
+| `forretningsforstaaelse.md`             | **LÅST**            | STOP. KRITISK. Stamme-doc med vision (D4): modsigelse mellem de to er et hul Mathias lukker — ingen trumf                                                                            |
+| `stork-2-0-master-plan.md` + afgørelser | **RETNINGSGIVENDE** | Rapport til Mathias — IKKE auto-blokering. Han afgør: er rammen forældet (rettes) eller skal pakken justeres? Arbejdet stopper ikke, det venter på afgørelse                         |
+| krav-dok + plan (efter approval)        | **PAKKE-KONTRAKT**  | STOP. KRITISK indtil Mathias afgør re-godkendelse eller justering                                                                                                                    |
 
 Pointe: kun vision og pakke-kontrakten stopper automatisk. Master-plan-modsigelse er en trigger for en afgørelse, ikke en blokering.
 
 ### §8.1 Governance-vagt (gov-2 — mekanisk lag-1 + Codex-mandat)
 
 Spærhagen der fanger governance-drift, så disciplinen ikke kun hviler på selv-tjek.
 
 **Mekanisk (lag 1 — `scripts/governance-check.mjs`, `pnpm governance:check`, CI-step):** døde doc-stier (docs + scripts), junk/lock-filer, brudte LÆSEFØLGE-/pointer-mål, **owns-unikhed** (ét begreb, ét hjem), nummer-hjem-unikhed (G/H kanonisk entry ét sted), H-ref-integritet (hver H-ref → åben entry eller historisk-kode i `huskeliste.md`). Princip: **owner = definitionshjem, ikke mention-hjem.** Hver governance-doc deklarerer sit ejerskab via en `<!-- governance-owns: … -->`-markør; scanneren fejler ved dobbelt-ejerskab. **Ærlig grænse:** fanger _deklareret_ dobbelt-ejerskab + nummer-dubletter mekanisk; _udeklareret prosa-overlap_ fanges ikke mekanisk → lag 2.
 
 **Codex-mandat (lag 2 — semantisk):** ved enhver ændring til en governance-doc (vision / disciplin / master-plan / forretningsforstaaelse / owns:-register) SKAL Codex eksplicit svare: **"modsiger dette prosa-mæssigt et begreb som en anden doc ejer?"** før merge. Det dækker den klasse scanneren ikke kan.
 
+**Stamme-doc-konsistens (D4):** ændres én af de to stamme-docs (vision / forretningsforstaaelse) SKAL ændringen eksplicit konsistens-tjekkes mod den anden. Modsigelse = hul → STOP → Mathias lukker. Ingen af de to trumfer den anden.
+
+**Fast markør:** Codex' svar gives som linjen `§8.1-SVAR: INGEN-MODSIGELSE` eller `§8.1-SVAR: MODSIGELSE — <begreb> ejes af <doc>` i reviewet, og gentages i slut-rapporten (§10.3) når pakken har berørt governance-docs — så svaret kan tjekkes i PR/rapport, ikke kun huskes i chat.
+
 **Governance-ændringer er review-artefakter:** en ændring til vision/disciplin/master-plan går gennem samme gate som kode — `governance:check` grøn + Codex' prosa-modsigelses-svar. Fraværet af netop dette gav V5's rolle-modsigelse (vision↔disciplin); §8.1 lukker den klasse.
 
 ---
 
 ## §9 Rolle-disciplin pr. AI
 
 Når Mathias paster `qwers` læser AI'en sin sektion + bekræfter rolle.
 
 **Glid-detector (genindført — svageste lag).** Selv-tjek fanger ikke pålideligt; det bærende værn er mekanisk tjek + Codex + Mathias. Men hver aktør spotter selv:
 
 - **Code:** "jeg har implicit forenklet" / "ikke fået svar 2 gange" / "afviger fra plan uden flag" → STOP, flag
 - **Claude.ai:** "jeg gætter på kilde" / "jeg fabrikerer detalje" / "jeg pakker forslag som afgjort" / "jeg påstår repo-tilstand uden at have set den" → flag [gæt] eller verificér/spørg
 - **Codex:** "jeg holder nok-OK tilbage" / "jeg eskalerer for at undgå at afgøre" → flag
 
 ### §9.1 Claude.ai
 
 **Rolle:** krav-dok-typist (Step 1) + slut-rapport-reviewer (Step 5) + sparring. Docs-lag.
 **MÅ:** skrive krav-dok fra Mathias' input · spørge Mathias direkte i krav-dok-fasen · reviewe slut-rapport mod krav-dok + vision + forretningsforstaaelse · levere FEEDBACK eller APPROVAL (aldrig begge).
 **MÅ IKKE:** tekniske beslutninger · krav-dok-påstande uden Mathias-kilde · kode-vurdering (Codex' bord) · datamodel-design (Code's bord) · skrive "afgørelser" · påstå at noget ER bygget når et dokument kun siger det SKAL bygges (→ "ikke verificeret, Codes bord").
 **Triggers:** `qwers` → bekræft rolle · `qwers <pakke>` → bekræft + proaktiv kontekst-recon STRENGT i forretnings-sprog (læs forretningsforstaaelse + evt. vision + søg rapport-historik; output: "det vi har" + targeted spørgsmål + scope-forslag; FORBUDT: tabel/kolonne/RPC-navne) · `qwerr` → slut-rapport-review.
 
 ### §9.2 Code
 
 **Rolle:** builder.
 **MÅ:** vælge tekniske løsninger inden for godkendt plan · PUSHBACK med teknisk grund · stoppe ved blokering og lave gate-fil.
 **MÅ IKKE:** forretnings-afgørelser · udvide scope uden plan-revurdering · afvige fra krav-dok-leverance uden gate · genfortolke eksisterende funktioner uden patch-først (§3.1) · ændre formål (§3.0).
 **Triggers:** `qwers` → bekræft · `qwerr` → læs pakke-status + udfør næste · `qwerg` → byg.
 **Plan-disciplin:** DB-state-dump (§3.2) · patch-først (§3.1) · end-to-end-spor (§3.3) · pre-push-tjekliste (formål matcher krav-dok, alle leverancer dækket, body-sektioner udfyldt).
 
 ### §9.3 Codex
 
 **Rolle:** uafhængig kode-reviewer, read-only.
 **MÅ:** flage alt tvivlsomt på kode-niveau · foreslå OPGRADERING · bestride "kompromis" som mulig drift.
 **MÅ IKKE:** skrive kode · beslutte · holde "nok OK" tilbage · acceptere "kendt gæld" uden G-nummer · eskalere alt til NEEDS-MATHIAS som flugt.
 **Plan-review-fokus (dækker den gamle fire-dok-konsultations substans):** patch-først korrekt? · end-to-end-spor alle 5? · DB-state-dump matcher faktisk state? · krav-dok-konsistens uden scope-creep? · vision + forretningsforstaaelse-modsigelse? **Approval:** APPROVAL eller FEEDBACK (undtagelse: APPROVAL + OPGRADERING). Kun Codex-approval kræves for plan.
 
 ---
 
 ## §10 Skabeloner (inline)
 
 ### §10.1 Krav-dok-skabelon
 
 ```markdown
 # <pakke> — Krav-og-data
 
 **Type:** Mathias' tanker om hvad pakken skal levere
 **Dato:** YYYY-MM-DD
 
 ## Formål
 
 > Denne pakke leverer: [én sætning]
 
 ## Forretningssandheder
 
 [Mathias' tanker om hvad systemet skal kunne — forretnings-niveau, ikke teknisk]
 
 ## I scope
 
 - [Konkret leverance]
 
@@ -318,141 +323,147 @@ Når Mathias paster `qwers` læser AI'en sin sektion + bekræfter rolle.
 ## Implementations-rækkefølge
 
 | Step | Type | Hvad | Eksakt indhold | Afhængigheder | Risiko |
 
 ## End-to-end-test-design
 
 [Konkret smoke-test-fil + flow]
 
 ## Doc-currency
 
 **A. Fundament-validering (FØR qwerg — jf. §2 Step 3):**
 Står planen på mål med vision + forretningsforstaaelse?
 
 - Ingen intent-ændring: "verificeret current pr. <hash>".
 - Intent-ændring: hvilken fundament-doc reconciles gennem §8.1-gate FØR qwerg.
 
 **B. Status-opdatering (committes MED merge-commit, ikke ved Step 5-review):**
 Eksplicit verdikt pr. række — ingen tom:
 
 | Doc                        | Berørt? | Opdatering / N/A            |
 | -------------------------- | ------- | --------------------------- |
 | aktiv-plan.md              | ja/nej  | pakke-status → ny tilstand  |
 | seneste-rapport.md         | ja/nej  | ny rapport-sti + commit     |
 | master-plan §4.1 status    | ja/nej  | trin-status                 |
 | teknisk-gaeld.md (G)       | ja/nej  | G rejst/løst                |
 | huskeliste.md (H)          | ja/nej  | H rejst/løst                |
 | disciplin "Forudsætninger" | ja/nej  | milestone gjort (§8.1-gate) |
 ```
 
 ### §10.3 Slut-rapport-skabelon
 
 ```markdown
 # <pakke> — Slut-rapport
 
 **Dato:** YYYY-MM-DD · **Branch:** claude/<pakke>-build · **Merge-commit:** <hash>
 
 ## Formål (genfremlagt fra krav-dok)
 
 ## Leverancer (mod krav-dok §I scope)
 
 | Krav-dok-leverance | Status | Migration/RPC | Test | Evidens |
 
 ## Stork-invariant-tjek
 
 | Invariant | Status | Evidens |
 | Vision-overholdelse | ✓/✗ | [princip + hvordan opfyldt] |
 | Permission-matrix | ✓/✗ | [opdateret fil + linje] |
 | Audit-trigger | ✓/✗ | [fitness grøn] |
 | Konfiguration-i-data | ✓/✗ | [ingen hardkodede satser] |
 | End-to-end-flow | ✓/✗ | [smoke grøn — ikke schema-only] |
 | Anonymisering-bevaring | ✓/✗ | [UPDATE ikke DELETE; FK intakt] |
 
 ## Plan-afvigelser
 
 [Liste eller "ingen" — hver med Mathias-gate-fil eller godkendelse]
 
 ## G-numre rejst
 
 [Reference til teknisk-gaeld.md]
 
+## §8.1-svar (hvis governance-docs berørt)
+
 ## Konvergens-historie
 
 | V<n> | Codex-fund | Code-svar | Outcome |
 
 ## Vision-tjek
 
 - Rigtig løsning eller workaround?
 - Vision-styrkelser / -svækkelser denne pakke
 - Konklusion: forsvarligt / kompromis / drift
 ```
 
 ### §10.4 Codex-review-prompt-skabelon
 
 ```markdown
 Du er Codex i Stork 2.0 — uafhængig kode-reviewer.
 
 Læs FØR review:
 
 - docs/strategi/vision-og-principper.md
-- docs/strategi/forretningsforstaaelse.md (tanke-data, ikke kontrakt)
+- docs/strategi/forretningsforstaaelse.md (LÅST stamme-doc, D4)
 - docs/strategi/disciplin.md §9.3 (din rolle)
 - docs/coordination/<pakke>-krav-og-data.md (pakke-kontrakt)
 - docs/coordination/<pakke>-plan.md (det du reviewer)
 - docs/coordination/<pakke>-status.md (kontekst + konvergens-counter)
 
 Review-fokus:
 
 - Patch-først (§3.1): eksisterende body 1:1 + diff?
 - End-to-end-spor (§3.3): alle 5 punkter pr. write-vej?
 - DB-state-dump (§3.2): matcher faktisk state?
 - Krav-dok-konsistens uden scope-creep
 - Vision + forretningsforstaaelse-modsigelse
 - MANGLENDE-EKSISTERENDE-BEVARELSE (KRITISK-undertype)
 
 Format pr. fund:
 [SEVERITY] Kort beskrivelse
 Konkret afvigelse: ...
 Anbefalet handling: [V<n+1>-rettelse / G-nummer / kosmetisk note]
+
+Berører ændringen en governance-doc (vision / disciplin / master-plan /
+forretningsforstaaelse / owns-register): afslut med
+`§8.1-SVAR: INGEN-MODSIGELSE` eller `§8.1-SVAR: MODSIGELSE — <hvad>`.
 ```
 
 ### §10.5 Pakke-status-skabelon
 
 Se §3.5 — kort fil med sidste handling, næste forventet, konvergens-counter, blocker.
 
 ---
 
 ## §11 Disciplin-tjekliste — før hver migration skrives
 
 1. Hvilket vision-element understøtter dette? 2. Hvilket kunne det svække? 3. Findes en simplere løsning uden vision-kompromis? 4. Hvis kompromis: dokumenteret med G-nummer + deadline? 5. Skal en halt-marker rejses (§6.1)? 6. Patch-først overholdt (§3.1)? 7. End-to-end-spor dokumenteret (§3.3)? 8. Hvis destructive drop: preflight kørt (§3.9)?
 
 Hvis "nej" på 4, 7 eller 8: STOP og spørg Mathias.
 
 ---
 
 ## §12 Stop-betingelser
 
 Master-plan-konflikt (men master-plan er overblik — se §8) · vision-modsigelse (LÅST) · designvalg ikke afgjort · data-tab-risiko ud over allerede afgjort · konvergens-counter rammer 5 · destructive drop uden preflight (§3.9) · inline-fix kræver ændring af fundament-infrastruktur.
 
 ---
 
 ## §13 Git-sync-disciplin
 
-`git pull origin main` før enhver session-start/review-runde. Påstande baseret på cached/forældet kopi = fabrikation. Code: pull ved hver trigger. Codex (auto): frisk på commit-trigger. Codex (manuel): pull før review. Claude.ai: kan ikke pulle — beder Mathias om commit-hash/fil-indhold ved tvivl, antager ikke fra hukommelse. Uventede commits ved pull → STOP, rapportér.
+Branch-bevidst sync før enhver session-start/review-runde: `git fetch` + verificér aktuel branch/base/remote + pull den branch arbejdet faktisk sker på (plan/build/main). `git pull origin main` er kun korrekt når arbejdet ER på main. Påstande baseret på cached/forældet kopi = fabrikation. Code: sync ved hver trigger. Codex (auto): frisk på commit-trigger. Codex (manuel): sync før review. Claude.ai: kan ikke pulle — beder Mathias om commit-hash/fil-indhold ved tvivl, antager ikke fra hukommelse. Uventede commits ved sync → STOP, rapportér.
 
 ---
 
 ## Forudsætninger før V5 er fuldt i kraft (ikke gjort endnu — ærligt)
 
 Adoption af denne fil er første skridt, ikke hele V5. Udestår:
 
 - **Docs-oprydning (Claude.ai's bord):** fold arkivet til git-history (gov-6).
 - **Master-plan (Claude.ai's bord):** afklar om Appendix C's rettelses-historik hører i planen eller i historik.
-- **Fundament + spærhager (Codes bord):** resterende CI-blocker (gov-3b-2: #10 SECDEF + #18 app-write) · branch protection (gov-4) · Codex-runner + auto-merge + plan-branch-trigger (gov-5).
+- **Fundament + spærhager (Codes bord):** branch protection (gov-4) · Codex-runner + auto-merge + plan-branch-trigger (gov-5). (gov-3 CI-blockers fuldt færdig — G065 lukket i gov-3b-3b.)
 
-Gjort i V5-adoptionen: disciplin.md = V5 · vision renset for roller · seneste-rapport-pointer rettet · skill flyttet til docs/claude-ai/ (tombstone `git rm`'et) · Appendix A 4-dim markeret superseded · LÆSEFØLGE opdateret · `codex-notify.yml` handoff-refs rettet til §9.1/§9.3. · **gov-1 (repo↔DB-paritet, PR #92 merged)** · **gov-2 (mekanisk spærhage + owns-register + §8.1 Codex-mandat + H-hjem `huskeliste.md`, PR #93 merged)** · **gov-docs-housekeeping (krav-dok-familie, PR #94 merged)** · **gov-3a (4 §3-checks #4/#7/#16/#17 + zone-§3-fjernelse, PR #95 merged)** · **gov-3b-1 (#19 FK-dækning + #6 indeks-pr-policy, PR #96 merged)**.
+Gjort i V5-adoptionen: disciplin.md = V5 · vision renset for roller · seneste-rapport-pointer rettet · skill flyttet til docs/claude-ai/ (tombstone `git rm`'et) · Appendix A 4-dim markeret superseded · LÆSEFØLGE opdateret · `codex-notify.yml` handoff-refs rettet til §9.1/§9.3. · **gov-1 (repo↔DB-paritet, PR #92 merged)** · **gov-2 (mekanisk spærhage + owns-register + §8.1 Codex-mandat + H-hjem `huskeliste.md`, PR #93 merged)** · **gov-docs-housekeeping (krav-dok-familie, PR #94 merged)** · **gov-3a (4 §3-checks #4/#7/#16/#17 + zone-§3-fjernelse, PR #95 merged)** · **gov-3b-1 (#19 FK-dækning + #6 indeks-pr-policy, PR #96 merged)** · **gov-3b-2 (#10 SECDEF-markør-disciplin, PR #101 merged)** · **gov-3b-3a (#18 del 1: 9 INVOKER→SECDEF, PR #103 merged)** · **gov-3b-3b (#18 del 2 + REVOKE + G065 LØST, PR #105 merged)**.
 
 V5 virker kun hvis erstatning faktisk sker — denne fil afløser V4, lægges ikke ved siden af.
 
 ---
 
 **V5 — 2026-06-03.** Afløser V4 (2026-05-22). Genindfører formåls-immutabilitet, differentieret modsigelses-håndtering, destructive-drops-preflight, glid-detector. Beholder V4's bevidste forenklinger. Skriver automation ærligt som notify-only.
diff --git a/docs/strategi/forretningsforstaaelse.md b/docs/strategi/forretningsforstaaelse.md
index 9b1c149..75cb42a 100644
--- a/docs/strategi/forretningsforstaaelse.md
+++ b/docs/strategi/forretningsforstaaelse.md
@@ -1,64 +1,66 @@
 # Stork 2.0 — Forretningsforståelse
 
 <!-- governance-owns: forretnings-intention -->
 
+> **LÅST DOKUMENT (stamme-doc med vision-og-principper.md).** Ændringer kræver eksplicit godkendelse fra Mathias via PR; CODEOWNERS håndhæver. Opdateres når Mathias' tanker udvikler sig — men de to stamme-docs må aldrig være indbyrdes uenige: en modsigelse er et hul der STOPPER og lukkes af Mathias (D4). Mekanisk håndhævelse (required code-owner-review) lander i gov-4 — dette er doc-niveau-løftet.
+
 Dette dokument forklarer hvordan Stork-forretningen hænger sammen. Hvert punkt beskriver hvad systemet skal kunne på forretnings-niveau, efterfulgt af en kort opsummering af hvorfor det er sådan.
 
 Dokumentet er målrettet roller der hjælper med plan-arbejde, krav-dok og review. Det erstatter ikke vision-dokumentet, master-planen eller Mathias-afgørelser — det er baggrunden der gør de dokumenter forståelige.
 
 ---
 
 ## 1. Klient som omdrejningspunkt
 
 - Stork skal kunne knytte alt forretningsmæssigt indhold (salg, calls, vagter, løn, rapporter) til den klient det vedrører
 - Stork skal kunne svare på "hvilken klient er dette for?" for enhver forretnings-handling
 - Stork skal kunne håndtere at klienter ejes af teams — én klient ad gangen
 - Stork skal kunne forhindre at et salg lever uden klient-kobling
 
 Klienten er Storks driftsmotor. Stork sælger for andre firmaer (Tryg, Eesy, TDC, Finansforbundet), og det er klient-bindingen der bestemmer hvem der har ansvaret for hvad. Hvis et salg ikke kan kobles til en klient, kan det ikke faktureres, lønberegnes eller rapporteres.
 
 ---
 
 ## 2. Dato-snapshot-princippet
 
 - Stork skal kunne fryse klient-team-bindingen ind på salget når det laves
 - Stork skal kunne slå op hvilket team der ejede en klient på en hvilken som helst historisk dato
 - Stork skal kunne sikre at senere klient-team-skift ikke ændrer historiske salg
 - Stork skal kunne håndtere at klient-team-bindinger ændrer sig løbende uden at fortid forandres
 
 Fortid skrives ikke om. Når et salg laves på en dato, så er klient-team-bindingen den dag dét der tæller — også når annulleringer eller korrektioner kommer ind måneder senere. Det er den eneste måde at sikre at konsekvenser rammer det rigtige team selvom verden har ændret sig siden.
 
 ---
 
 ## 3. Attribution-trekanten: sælger, team, klient
 
 - Stork skal kunne attribuere hvert salg til en sælger (den der lavede det), en klient (det firma salget er for) og et team (det der ejede klienten den dag)
 - Stork skal kunne afgøre team-attribution via klienten, ikke via sælgerens nuværende team
 - Stork skal kunne håndtere at en sælger over tid skifter team uden at fortidens salg påvirkes
 - Stork skal kunne bruge klient-dimensionen til at afgøre pris og provisions-sats
 - Stork skal kunne koble salg til den rigtige medarbejder uanset hvordan sælger-identiteten kommer fra ekstern API
 
 Tre dimensioner, tre konsekvenser. Sælgeren får sin provision. Klienten bestemmer prisen og satserne. Teamet får DB-løn til sin leder. De tre er adskilte, og særligt vigtigt: team kommer via klienten, ikke direkte fra sælgeren. Det forhindrer at sælger-skift midt i en periode ødelægger tidligere attribution.
 
 ---
 
 ## 4. Salget — flere linjer, regel-baseret pris, berigelse undervejs
 
 - Stork skal kunne registrere et salg med en eller flere produktlinjer, hver med egen pris og provision
 - Stork skal kunne aggregere provision og omsætning pr. salg som summen af linjerne
 - Stork skal kunne finde prisen via en regel der matcher produkt + kampagne + felt-værdier
 - Stork skal kunne vælge deterministisk mellem flere regler der matcher
 - Stork skal kunne flage og rette salg hvor ingen regel matcher (i stedet for at skjule det bag en standardværdi)
 - Stork skal kunne berige et salg med ekstra felter via UI efter registrering
 - Stork skal kunne lade berigelses-felter påvirke prissætningen og udløse opdateret provision
 - Stork skal kunne logge alle berigelser
 - Stork skal kunne merge to produkter til ét
 - Stork skal kunne gruppere produkter til rapportering og aggregering
 - Stork skal kunne sammenligne felt-værdier på flere måder i pricing-regler (præcis match, intervaller, ranges)
 - Stork skal kunne tidsbegrænse pricing-reglers gyldighed
 - Stork skal kunne bære flere pricing-formler pr. produkt til forskellige situationer
 - Stork skal kunne vise salgs-linjer med navn der adskiller sig fra produktnavnet (fx kampagne-specifikt navn)
 - Stork skal kunne håndtere særlige betalings-tilfælde (fx straksbetaling) som data, ikke separat mekanik
 - Stork skal kunne styre salgs-livscyklus med kontrollerede status-overgange (ikke automatiske)
 - Stork skal kunne udelukke salg i bestemte status'er fra commission-aggregat
 - Stork skal kunne genberegne salg når pricing ændres — kun før provision er udbetalt
diff --git a/docs/strategi/stork-2-0-master-plan.md b/docs/strategi/stork-2-0-master-plan.md
index 6b5f0b9..e6c9a71 100644
--- a/docs/strategi/stork-2-0-master-plan.md
+++ b/docs/strategi/stork-2-0-master-plan.md
@@ -1,100 +1,100 @@
 # Stork 2.0 — Master-plan
 
 <!-- governance-owns: teknisk-plan, byggeraekkefoelge, laaste-beslutninger, aabne-beslutninger, permission-model -->
 
 **Status:** Komplet med 45 rettelser indlejret (Appendix C — bemærk at tabel-numrene 18-29 er duplikerede pga. to lag af nummerering; antallet refererer faktiske row-entries)
 **Dato:** 13. maj 2026
 **Skopus:** Fundament + Lag E (forretnings-domæner)
 **Grundlag:** Behov, krav-dokumenter, FM deep dive, 17 strategiske afgørelser
 
 ---
 
 ## Læsevejledning
 
 Dokumentet er master-plan for Stork 2.0. Det erstatter ikke princippet "vi bygger fra behov" — det realiserer princippet ved at oversætte krav og afgørelser til arkitektur.
 
 **Struktur:**
 
 - §0 Plan-grundlag — hvad planen bygger på
 - §1 Fundament — det alle forretnings-domæner hænger på
 - §2 Lag E — forretnings-domæner
 - §3 Disciplin — CI-blockers og test-skabeloner
 - §4 Byggerækkefølge — 31 trin med schema-tildeling
 - §5 Det vi står inde for
 - Appendix A: Lukkede beslutninger (kan laves om)
 - Appendix B: Åbne beslutninger (afgøres ved bygning)
 - Appendix C: Rettelses-historik
 
 Konkrete tabel- og kolonne-navne afgøres ved bygning. Planen taler i koncepter.
 
 ---
 
 ## §0 Plan-grundlag
 
 ### Vision og principper
 
 Vision, tre bærende principper og ni operationelle principper er defineret i `docs/strategi/vision-og-principper.md`. Master-planen forudsatter dem og bygger arkitekturen ovenpå. Konflikt mellem master-plan og vision-dokument løses ved at master-planen tilrettes — vision-dokumentet er autoritativ kilde.
 
 ### Strategiske retning-skift
 
-Mathias' tanker pr. pakke lever i `docs/coordination/<pakke>-krav-og-data.md` (pakke-kontrakt). Tanker der ændrer ramme på tværs af pakker går ind i `docs/strategi/forretningsforstaaelse.md` (tanke-data) eller `docs/strategi/vision-og-principper.md` (LÅST evig, ved princip-niveau). Master-planen reflekterer arkitektur-konsekvensen som Appendix C-rettelser. Ved konflikt vinder vision (LÅST) → forretningsforstaaelse + krav-dok → master-plan tilrettes.
+Mathias' tanker pr. pakke lever i `docs/coordination/<pakke>-krav-og-data.md` (pakke-kontrakt). Tanker der ændrer ramme på tværs af pakker går ind i `docs/strategi/forretningsforstaaelse.md` (LÅST stamme-doc) eller `docs/strategi/vision-og-principper.md` (LÅST evig, ved princip-niveau). Master-planen reflekterer arkitektur-konsekvensen som Appendix C-rettelser. Ved konflikt vinder stamme-docs (vision + forretningsforstaaelse — indbyrdes modsigelse mellem de to er et hul → STOP → Mathias lukker, D4) → krav-dok → master-plan tilrettes.
 
 Historiske ramme-niveau-beslutninger fra V3 og tidligere lever i `docs/coordination/arkiv/mathias-afgoerelser-historik.md` som læsbar reference (ikke aktiv kilde).
 
 ### Filosofi
 
 **Stamme = database.** Adgang, klassifikation, audit, lås, snapshot lever i DB.
 **Beregning over databasen.** TypeScript-pakke (`@stork/core`), ikke PL/pgSQL.
 
 ### Stack
 
 - React + TypeScript + Supabase
 - Frontend hosting: managed-service (specifik platform afgøres ved tilkobling — se Appendix B). Tilkobles ved første frontend-side, ikke før. Selv-hosting eksplicit afvist
 - Microsoft Entra ID som eneste auth-provider for medarbejdere
 - Tre-schema-arkitektur (core_identity / core_money / core_compliance) fra trin 1
 - Apps får eget schema (`app_<navn>`), må kun skrive til core\_\* via SECURITY DEFINER RPC'er
 
 ### Drift-kontekst
 
 - 50-150 samtidige brugere voksende til 200-500
 - Mange KPI'er
 - 1M+ sales over tid
 
 ### Dashboard-model
 
 Team-matrix + person-tildeling som union. Fri date-range bygget på dags-aggregater.
 
 ---
 
 ## §0.5 Migration fra 1.0
 
 Stork 2.0 bygges greenfield, men data fra Stork 1.0 overføres. 130+ medarbejderes historik må ikke tabes.
 
 ### Grundprincip
 
 **Migration sker via direkte udtræk + upload, IKKE via ETL-pipeline eller adapter-dobbelt-skriv.**
 
 Mekanik pr. data-kategori:
 
 1. Udtræk fra 1.0 (SQL-dump eller CSV) der matcher 2.0's tabel-struktur direkte
 2. Upload via Code/psql/Supabase direkte til 2.0
 3. Audit-spor: `source_type='migration'`, `change_reason='legacy_import_t0'`
 
 **Hvad er ikke en del af migration:**
 
 - Ingen UI-baseret import-flow
 - Ingen sync-job mellem 1.0 og 2.0
 - Ingen adapter-dobbelt-skriv
 - Ingen migration_staging-schema (over-engineering for direkte upload)
 - Ingen kompleks migration_orchestrator
 
 Udtræk + upload er tilstrækkeligt. Inkonsistens-håndtering sker i udtræks-SQL eller pre-upload-scripts.
 
 **Cutover kan ske gradvist** — behøver ikke vente på fuld lag E-færdighed. Cutover-tidspunktet er ikke deadline-drevet og ikke bundet til "alle 31 trin er færdige".
 
 ### De fire data-kategorier
 
 **Kategori 1 — Historiske låste perioder** (alt før cutover-dato hvor 1.0 har låst/udbetalt løn):
 
 - Importeres som immutable legacy-data i `core_compliance`-schema (se §1.11)
 - To-tabel-tilgang: `legacy_snapshots` (data) + `legacy_audit` (1.0's audit-historik)
diff --git a/docs/strategi/vision-og-principper.md b/docs/strategi/vision-og-principper.md
index d92b82f..37cf974 100644
--- a/docs/strategi/vision-og-principper.md
+++ b/docs/strategi/vision-og-principper.md
@@ -1,65 +1,65 @@
 # Stork 2.0 — Vision og principper
 
 <!-- governance-owns: vision, principper -->
 
-> **LÅST DOKUMENT.** Dette er grundstenen i Stork 2.0. Ændringer kræver eksplicit godkendelse fra Mathias via PR. CODEOWNERS håndhæver at kun Mathias kan approve ændringer. Dokumentet er autoritativ kilde for vision og principper — ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette.
+> **LÅST DOKUMENT.** Dette er grundstenen i Stork 2.0. Ændringer kræver eksplicit godkendelse fra Mathias via PR. CODEOWNERS håndhæver at kun Mathias kan approve ændringer. Dokumentet er autoritativ kilde for vision og principper — ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette. Undtagelse (D4): `forretningsforstaaelse.md` er med-stamme-doc — en modsigelse mellem de to er et hul der STOPPER arbejdet og lukkes af Mathias, ikke en konflikt dette dokument vinder.
 
 ## Vision
 
 Stork 2.0 bygges til at holde. Vi tager ikke nemme løsninger, hardkodede
 shortcuts, eller midlertidige fixes der bliver permanente. Hvert valg
 vurderes mod hvad der står om 5 år, ikke hvad der virker i dag.
 
 Systemet er fundamentet for Copenhagen Sales' drift. Det skal kunne tåle
 ny lovgivning, nye klienter, nye datatyper, og nye krav uden at blive
 bygget om. Det betyder data, rettigheder og forretningslogik styres i
 UI — ikke i kode. Algoritmer lever i kode, alt andet i data. Du har
 kontrollen, ikke en hardkodet regel.
 
 Vi bygger greenfield. 1.0's anti-mønstre kopieres ikke, selv hvis det
 går hurtigere. Workarounds uden plan er drift. Vi accepterer ikke
 teknisk gæld uden eksplicit beslutning om hvornår den løses.
 
 Audit, rettigheder, anonymisering og retention er ikke add-ons. Det er
 fundament. De skal være på plads før systemet går i produktion, og de
 skal kunne ændres i UI når nye regler kommer.
 
 ## Tre bærende principper
 
 De tre essentielle principper hele systemet bygges på. Alt andet leder tilbage til disse.
 
 1. **Én sandhed** — én autoritativ kilde pr. fakta. Database er sandheden; alt andet (frontend-state, edge-cache, beregningsresultater) er views af samme sandhed. Konflikt mellem to kilder er en fejl, ikke en feature.
 
 2. **Styr på data** — hver kolonne har eksplicit semantik: klassifikation, PII-niveau, retention. GDPR-compliance er indbygget, ikke add-on.
 
 3. **Sammenkobling eksplicit i modellen** — relations som data, ikke implicit i kode. FK-constraints er obligatoriske mellem relaterede entiteter.
 
 De ni operationelle principper nedenfor er konkretiseringer af disse tre.
 
 ## Ni operationelle principper
 
 ### 1. Data-kontrol i UI
 
 Al data — uanset kilde (UI, API, uploads) — klassificeres i UI for PII,
 retention og anonymisering.
 
 ### 2. Rettigheder i UI
 
 Team-træ styrer hvilken data der vises. Page/tabs styrer hvilke dele
 af systemet der ses. Superadmin er eneste hardkodede rolle.
 
 ### 3. Forretningslogik som data
 
 KPI'er, lønarter, formler, klassifikationer, regler — alt er data i UI.
 Algoritmer er kode, værdier er data.
 
 ### 4. Default = intet
 
 Ingen PII, ingen retention, ingen anonymisering, ingen audit-opgradering
 medmindre det aktivt vælges i UI.
 
 ### 5. Lifecycle for konfiguration
 
 Alt der påvirker data-håndtering gennemgår draft → tested → approved →
 active. Aktivering er bevidst handling, ikke automatik.
 
diff --git a/scripts/README.md b/scripts/README.md
index 2049129..987ef2b 100644
--- a/scripts/README.md
+++ b/scripts/README.md
@@ -1,25 +1,24 @@
 # scripts/
 
 Disciplin-mekanismer der køres lokalt og i CI.
 
 | Script               | Formål                                                                                                                                                                                                                               | Aktiveres                                                  |
 | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
 | `types-gen.sh`       | Type-codegen for eksponerede API-schemas (`public,core_identity,core_compliance,core_money`). `--write` regenererer `packages/types/src/database.ts`; `--check` verificerer drift mod remote. Schema-listen står ét sted i scriptet. | `pnpm types:generate` (write) / `pnpm types:check` (check) |
 | `schema-check.sh`    | Drift-detection: remote schema vs `supabase/schema.sql`. Skipper på `-- PLACEHOLDER`-marker.                                                                                                                                         | `pnpm schema:check`                                        |
 | `migration-gate.mjs` | Phase 1: warner på uklassificerede kolonner. Phase 2 (`MIGRATION_GATE_STRICT=true`): blokerer.                                                                                                                                       | `pnpm migration:check`                                     |
 | `fitness.mjs`        | Arkitektoniske invarianter på tværs af repo. Hver check er en function.                                                                                                                                                              | `pnpm fitness`                                             |
-| `krav-afklar.sh`     | Codex-dispatcher med "stil spørgsmål, ingen plan"-mode for krav-afklaring. Output: `<pakke>-krav-afklaring.md`.                                                                                                                      | `scripts/krav-afklar.sh <krav-dok-fil>`                    |
 
 ## Fitness checks
 
 | Check                        | Hvad fanger den                                                                   |
 | ---------------------------- | --------------------------------------------------------------------------------- |
 | `no-ts-ignore`               | Brug `@ts-expect-error` i stedet — den fanger når kommentaren bliver forældet     |
 | `eslint-disable-justified`   | Hver `eslint-disable*` skal have `-- begrundelse` efter regelnavnet               |
 | `migration-naming`           | `supabase/migrations/<14digits>_<snake_case>.sql`                                 |
 | `workspace-boundaries`       | `packages/*` må ikke importere fra `@stork/web`. Afhængighedsretning er ensrettet |
 | `no-hardcoded-supabase-urls` | Supabase-URLs skal komme fra env-variabel, ikke hardkodet i `apps/web/src/`       |
 
 Tilføj en ny check: implementér en async function i `scripts/fitness.mjs`
 der returnerer `{ name, violations: string[] }`, og push den til
 `checks`-array'et nederst i filen.

codex
Jeg har fundet én semantisk stale reference i den aktive Claude.ai-skill og en mulig status-sync-skævhed. Jeg laver et sidste krydstjek på de konkrete linjer, så fundene ikke bygger på diff-indtryk alene.
exec
/bin/bash -lc 'rg -n "TANKE-DATA|LÅST-AUTORITATIV|forretningsforstaaelse|forretningsforståelse|Build batch 5|Batch 4|Batch 5|runde 7|denne commit" docs/claude-ai/SKILL.md docs/coordination/gov-docs-renhed-status.md docs/coordination/gov-docs-renhed-plan.md docs/coordination/gov-docs-renhed-krav-og-data.md docs/LÆSEFØLGE.md docs/strategi/disciplin.md docs/strategi/forretningsforstaaelse.md docs/strategi/vision-og-principper.md' in /home/mathias/stork-2.0
 succeeded in 0ms:
docs/strategi/vision-og-principper.md:5:> **LÅST DOKUMENT.** Dette er grundstenen i Stork 2.0. Ændringer kræver eksplicit godkendelse fra Mathias via PR. CODEOWNERS håndhæver at kun Mathias kan approve ændringer. Dokumentet er autoritativ kilde for vision og principper — ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette. Undtagelse (D4): `forretningsforstaaelse.md` er med-stamme-doc — en modsigelse mellem de to er et hul der STOPPER arbejdet og lukkes af Mathias, ikke en konflikt dette dokument vinder.
docs/strategi/disciplin.md:69:**Forudsætning — fundament-validering (grøn før qwerg):** planen skal stå på mål med vision + forretningsforstaaelse. Almindelig plan bekræfter "ingen forretnings-intentions-ændring" (Doc-currency A, §10.2). Plan der ændrer intention: fundament-doc'en reconciles først gennem §8.1-gaten + Mathias' CODEOWNERS — FØR qwerg. Modsigelses-konsekvens per §8 (vision LÅST = STOP). En plan godkendes ikke stående på fundament den modsiger.
docs/strategi/disciplin.md:136:**Bevares på main:** krav-dok → `arkiv/<pakke>-krav-og-data.md` · plan → `arkiv/<pakke>-plan.md` · slut-rapport → `rapport-historik/<dato>-<pakke>.md` · in-place-opdateringer til vision, forretningsforstaaelse, master-plan (overblik), teknisk-gaeld.
docs/strategi/disciplin.md:203:| `vision-og-principper.md`               | **LÅST**            | STOP. KRITISK. Vinder over alt undtagen forretningsforstaaelse (D4: indbyrdes stamme-doc-modsigelse = hul → STOP → Mathias lukker). Dokumentér i blokker-fil, argumentér ikke videre |
docs/strategi/disciplin.md:204:| `forretningsforstaaelse.md`             | **LÅST**            | STOP. KRITISK. Stamme-doc med vision (D4): modsigelse mellem de to er et hul Mathias lukker — ingen trumf                                                                            |
docs/strategi/disciplin.md:216:**Codex-mandat (lag 2 — semantisk):** ved enhver ændring til en governance-doc (vision / disciplin / master-plan / forretningsforstaaelse / owns:-register) SKAL Codex eksplicit svare: **"modsiger dette prosa-mæssigt et begreb som en anden doc ejer?"** før merge. Det dækker den klasse scanneren ikke kan.
docs/strategi/disciplin.md:218:**Stamme-doc-konsistens (D4):** ændres én af de to stamme-docs (vision / forretningsforstaaelse) SKAL ændringen eksplicit konsistens-tjekkes mod den anden. Modsigelse = hul → STOP → Mathias lukker. Ingen af de to trumfer den anden.
docs/strategi/disciplin.md:239:**MÅ:** skrive krav-dok fra Mathias' input · spørge Mathias direkte i krav-dok-fasen · reviewe slut-rapport mod krav-dok + vision + forretningsforstaaelse · levere FEEDBACK eller APPROVAL (aldrig begge).
docs/strategi/disciplin.md:241:**Triggers:** `qwers` → bekræft rolle · `qwers <pakke>` → bekræft + proaktiv kontekst-recon STRENGT i forretnings-sprog (læs forretningsforstaaelse + evt. vision + søg rapport-historik; output: "det vi har" + targeted spørgsmål + scope-forslag; FORBUDT: tabel/kolonne/RPC-navne) · `qwerr` → slut-rapport-review.
docs/strategi/disciplin.md:256:**Plan-review-fokus (dækker den gamle fire-dok-konsultations substans):** patch-først korrekt? · end-to-end-spor alle 5? · DB-state-dump matcher faktisk state? · krav-dok-konsistens uden scope-creep? · vision + forretningsforstaaelse-modsigelse? **Approval:** APPROVAL eller FEEDBACK (undtagelse: APPROVAL + OPGRADERING). Kun Codex-approval kræves for plan.
docs/strategi/disciplin.md:334:Står planen på mål med vision + forretningsforstaaelse?
docs/strategi/disciplin.md:404:- docs/strategi/forretningsforstaaelse.md (LÅST stamme-doc, D4)
docs/strategi/disciplin.md:416:- Vision + forretningsforstaaelse-modsigelse
docs/strategi/disciplin.md:425:forretningsforstaaelse / owns-register): afslut med
docs/LÆSEFØLGE.md:24:   Vision og 9 principper. **LÅST-AUTORITATIV** — vinder over alt andet ved konflikt.
docs/LÆSEFØLGE.md:26:2. `docs/strategi/forretningsforstaaelse.md`
docs/LÆSEFØLGE.md:28:   **LÅST-AUTORITATIV** — stamme-doc med vision (D4). Opdateres når
docs/LÆSEFØLGE.md:47:forretningsforstaaelse (2): modsigelse mellem de to stamme-docs er et hul →
docs/strategi/forretningsforstaaelse.md:227:Disse fire funktioner er en del af Stork som selvstændige områder ved siden af kerne-driften. De er nævnt her så de ikke glemmes — den konkrete forretningsforståelse for hver enkelt bliver afdækket pakke for pakke når funktionen skal bygges.
docs/coordination/gov-docs-renhed-krav-og-data.md:9:> forretningsforståelse) sammen med Code- og Codex-verificerede fund — ikke
docs/coordination/gov-docs-renhed-krav-og-data.md:37:- De to stamme-docs — `vision-og-principper.md` og `forretningsforstaaelse.md` —
docs/coordination/gov-docs-renhed-krav-og-data.md:38:  er begge LÅST-AUTORITATIVE og **må aldrig være indbyrdes uenige**. En
docs/coordination/gov-docs-renhed-krav-og-data.md:40:  trumfer den anden. _(Mathias D4 + afgørelse: forretningsforståelse hæves til
docs/coordination/gov-docs-renhed-krav-og-data.md:66:3. **Forretningsforståelse løftes til LÅST-AUTORITATIV (doc-niveau)** — (a)
docs/coordination/gov-docs-renhed-krav-og-data.md:68:   "TANKE-DATA — ikke kontrakt" → låst-status; (c) ny række i `disciplin.md §8`
docs/coordination/gov-docs-renhed-krav-og-data.md:148:- **D4:** Vision + forretningsforståelse holdes konsistente; modsigelse = hul der
docs/coordination/gov-docs-renhed-krav-og-data.md:171:(`disciplin.md`, `LÆSEFØLGE.md`, `forretningsforstaaelse.md`, evt. owns-register),
docs/claude-ai/SKILL.md:25:- `docs/strategi/vision-og-principper.md` — LÅST-AUTORITATIV (system, ikke roller)
docs/claude-ai/SKILL.md:26:- `docs/strategi/forretningsforstaaelse.md` — TANKE-DATA (Mathias' tanker)
docs/coordination/gov-docs-renhed-status.md:3:**Sidste handling:** Build batch 5: Codex runde 6 gav 2 KRITISK — begge rettet (prettier-format på de to .mjs; MELLEM runde-aware routing + 4 nye fixtures, parse-test 14/14). 2026-06-10.
docs/coordination/gov-docs-renhed-status.md:4:**Næste forventet:** Codex verifikations-review (runde 7) af batch 5 → grøn → Code skriver slut-rapport → Claude.ai-review FØR merge (Step 5) → Mathias "slut OK" + merge.
docs/coordination/gov-docs-renhed-status.md:5:**Konvergens-counter:** 4 (plan-fase, afsluttet ved runde 4-APPROVAL). Build-reviews: runde 5 (3 KRITISK → batch 4/4b) · runde 6 (2 KRITISK → batch 5) · runde 7 afventes.
docs/coordination/gov-docs-renhed-status.md:18:- Batch 4 ✓: runde 5-fund-fixes (denne commit).
docs/coordination/gov-docs-renhed-plan.md:32:| R2-4 | Master-plan kalder stadig forretningsforståelse "tanke-data" + vision-vinder-hierarki (§8.1-MODSIGELSE) | MELLEM   | **ACCEPT** (rettet nu). Ny A.14 patcher master-planens hierarki-afsnit. §8-rationale: master-plan er RETNINGSGIVENDE — Mathias har allerede afgjort løftet i krav-dok, så master-plan tilrettes (præcis som master-planen selv foreskriver)               |
docs/coordination/gov-docs-renhed-plan.md:191:status-tekst: forretningsforstaaelse løftes til LÅST (Mathias' afgørelse i
docs/coordination/gov-docs-renhed-plan.md:236:> **LÅST DOKUMENT.** Dette er grundstenen i Stork 2.0. Ændringer kræver eksplicit godkendelse fra Mathias via PR. CODEOWNERS håndhæver at kun Mathias kan approve ændringer. Dokumentet er autoritativ kilde for vision og principper — ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette. Undtagelse (D4): `forretningsforstaaelse.md` er med-stamme-doc — en modsigelse mellem de to er et hul der STOPPER arbejdet og lukkes af Mathias, ikke en konflikt dette dokument vinder.
docs/coordination/gov-docs-renhed-plan.md:238:### A.2 `docs/strategi/forretningsforstaaelse.md` — LÅST-banner
docs/coordination/gov-docs-renhed-plan.md:289:| `vision-og-principper.md`               | **LÅST**            | STOP. KRITISK. Vinder over alt undtagen forretningsforstaaelse (D4: indbyrdes stamme-doc-modsigelse = hul → STOP → Mathias lukker). Dokumentér i blokker-fil, argumentér ikke videre |
docs/coordination/gov-docs-renhed-plan.md:295:| `forretningsforstaaelse.md` | **LÅST** | STOP. KRITISK. Stamme-doc med vision (D4): modsigelse mellem de to er et hul Mathias lukker — ingen trumf |
docs/coordination/gov-docs-renhed-plan.md:301:> forretningsforstaaelse) SKAL ændringen eksplicit konsistens-tjekkes mod den
docs/coordination/gov-docs-renhed-plan.md:320:- docs/strategi/forretningsforstaaelse.md (tanke-data, ikke kontrakt)
docs/coordination/gov-docs-renhed-plan.md:329:forretningsforstaaelse / owns-register): afslut med
docs/coordination/gov-docs-renhed-plan.md:380:2. `docs/strategi/forretningsforstaaelse.md`
docs/coordination/gov-docs-renhed-plan.md:382:   **TANKE-DATA** — kontekst-grundlag for krav-dok, ikke kontrakt.
docs/coordination/gov-docs-renhed-plan.md:389:2. `docs/strategi/forretningsforstaaelse.md`
docs/coordination/gov-docs-renhed-plan.md:391:   **LÅST-AUTORITATIV** — stamme-doc med vision (D4). Opdateres når
docs/coordination/gov-docs-renhed-plan.md:401:> Ved konflikt mellem dokumenter: vision (1) vinder over alle andre — undtagen forretningsforstaaelse (2): modsigelse mellem de to stamme-docs er et hul → STOP → Mathias lukker (D4).
docs/coordination/gov-docs-renhed-plan.md:432:> Mathias' tanker pr. pakke lever i `docs/coordination/<pakke>-krav-og-data.md` (pakke-kontrakt). Tanker der ændrer ramme på tværs af pakker går ind i `docs/strategi/forretningsforstaaelse.md` (tanke-data) eller `docs/strategi/vision-og-principper.md` (LÅST evig, ved princip-niveau). Master-planen reflekterer arkitektur-konsekvensen som Appendix C-rettelser. Ved konflikt vinder vision (LÅST) → forretningsforstaaelse + krav-dok → master-plan tilrettes.
docs/coordination/gov-docs-renhed-plan.md:436:> Mathias' tanker pr. pakke lever i `docs/coordination/<pakke>-krav-og-data.md` (pakke-kontrakt). Tanker der ændrer ramme på tværs af pakker går ind i `docs/strategi/forretningsforstaaelse.md` (LÅST stamme-doc) eller `docs/strategi/vision-og-principper.md` (LÅST evig, ved princip-niveau). Master-planen reflekterer arkitektur-konsekvensen som Appendix C-rettelser. Ved konflikt vinder stamme-docs (vision + forretningsforstaaelse — indbyrdes modsigelse mellem de to er et hul → STOP → Mathias lukker, D4) → krav-dok → master-plan tilrettes.
docs/coordination/gov-docs-renhed-plan.md:507:- docs/strategi/forretningsforstaaelse.md (LÅST stamme-doc, D4)
docs/coordination/gov-docs-renhed-plan.md:519:scope-creep · vision/forretningsforstaaelse-modsigelse ·

exec
/bin/bash -lc 'rg -n "''^> Denne pakke leverer" docs/coordination/gov-docs-renhed-krav-og-data.md docs/coordination/gov-docs-renhed-plan.md docs/coordination/rapport-historik docs/coordination/aktiv-plan.md' in /home/mathias/stork-2.0
 succeeded in 0ms:
docs/coordination/gov-docs-renhed-plan.md:10:> Denne pakke leverer: et docs-repo hvor ingen doc eller script modsiger
docs/coordination/gov-docs-renhed-krav-og-data.md:17:> Denne pakke leverer: et docs-repo hvor ingen doc eller script modsiger

exec
/bin/bash -lc 'git show --name-status --oneline --max-count=1 HEAD && git show --name-status --oneline --max-count=1 HEAD~1' in /home/mathias/stork-2.0
 succeeded in 0ms:
2fdc9f0 gov-docs-renhed build batch 5: runde 6-fixes — prettier på governance-check{,.selftest}.mjs (KRITISK 1), MELLEM runde-aware routing per §5 runde-trapper + 4 fixtures (KRITISK 2), runde 6-review-fil
A	docs/coordination/codex-reviews/2026-06-10-gov-docs-renhed-runde-6.md
M	docs/coordination/gov-docs-renhed-status.md
M	scripts/codex-review.sh
M	scripts/governance-check.mjs
M	scripts/governance-check.selftest.mjs
821e1b3 gov-docs-renhed build batch 4b: codex-reviews/ scope-ekskluderet i scanner — committede review-filer er ephemeral rå-output (§4) der bevidst citerer døde stier
M	docs/coordination/gov-docs-renhed-status.md
M	scripts/governance-check.mjs

exec
/bin/bash -lc "nl -ba docs/claude-ai/SKILL.md | sed -n '20,46p' && nl -ba docs/coordination/gov-docs-renhed-status.md | sed -n '1,40p'" in /home/mathias/stork-2.0
 succeeded in 0ms:
    20	
    21	## Referencer (læs via Filesystem-MCP når relevant)
    22	
    23	Per V5 LÆSEFØLGE:
    24	
    25	- `docs/strategi/vision-og-principper.md` — LÅST-AUTORITATIV (system, ikke roller)
    26	- `docs/strategi/forretningsforstaaelse.md` — TANKE-DATA (Mathias' tanker)
    27	- `docs/strategi/disciplin.md` — V5-disciplin (din rolle i §9.1, krav-dok-skabelon i §10.1, slut-rapport-skabelon i §10.3)
    28	- `docs/strategi/stork-2-0-master-plan.md` — OVERBLIK (rettes til sidst i pakke)
    29	- `docs/coordination/<pakke>-krav-og-data.md` — pakke-kontrakt (efter Mathias-godkendelse)
    30	- `docs/coordination/<pakke>-plan.md` — pakke-kontrakt efter qwerg
    31	- `docs/coordination/<pakke>-status.md` — pakke-kontekst + konvergens-counter
    32	
    33	## Hvorfor minimal
    34	
    35	Hele rolle-definitionen lever i `docs/strategi/disciplin.md` §9.1 (versioneret i git). Skill'en peger bare på den. Det betyder:
    36	
    37	- Ændringer til rolle/cadence/protokol skal kun laves ét sted (filen)
    38	- Skill'en arver automatisk forbedringer fra fremtidige pakker
    39	- Du behøver ikke re-opdatere skill'en når workflow-spec udvikler sig
    40	
    41	## Kanonisk kilde
    42	
    43	Denne fil er DEN kanoniske skill. Platform-skill'en i claude.ai er en kopi
    44	af denne fil — ved drift vinder repo-versionen. Sync: Mathias kopierer
    45	fil-indholdet til platform-skill'en når denne fil ændres (flagges i
    46	slut-rapport som Mathias-handling).
     1	# gov-docs-renhed — Pakke-status
     2	
     3	**Sidste handling:** Build batch 5: Codex runde 6 gav 2 KRITISK — begge rettet (prettier-format på de to .mjs; MELLEM runde-aware routing + 4 nye fixtures, parse-test 14/14). 2026-06-10.
     4	**Næste forventet:** Codex verifikations-review (runde 7) af batch 5 → grøn → Code skriver slut-rapport → Claude.ai-review FØR merge (Step 5) → Mathias "slut OK" + merge.
     5	**Konvergens-counter:** 4 (plan-fase, afsluttet ved runde 4-APPROVAL). Build-reviews: runde 5 (3 KRITISK → batch 4/4b) · runde 6 (2 KRITISK → batch 5) · runde 7 afventes.
     6	**Aktuel blocker:** ingen.
     7	
     8	Build-state (qwerg 2026-06-10):
     9	
    10	- Batch 1 ✓ (`ddc72db`): 3 V5.3-scripts slettet, codex-review.sh repareret.
    11	  Evidens: --parse-test grøn, governance:check grøn.
    12	- Batch 2 ✓ (`42bfb55`): doc-reconcile A.1–A.14. Evidens: governance:check grøn.
    13	  (Fejl-committede også 17 v4-slettede-docs-filer — fanget af Codex runde 5,
    14	  rettet i batch 4.)
    15	- Batch 3 ✓ (`00c1ebd`): allowlist-split + structural-chain + sti-regex-fix +
    16	  9 selftest-cases + aktiv-pakke-markør. Evidens: selftest fuldt grøn
    17	  (baseline + 13 plantede + deprecated-positiv), fitness grøn.
    18	- Batch 4 ✓: runde 5-fund-fixes (denne commit).
    19	
    20	Plan-afvigelser (til slut-rapport):
    21	
    22	1. rapport-skabelon-allowlist-entry beholdt (plan sagde prune) — planens egen
    23	   A.12-tekst er levende prosa-referent; prune ved pakke-luk/gov-6.
    24	2. v4-slettede-docs/ kortvarigt tracked i batch 2 (Code-fejl, `git add -A`) —
    25	   untracked igen + .gitignore-værn i batch 4. Aldrig på main.
    26	3. MANGLENDE-EKSISTERENDE-BEVARELSE-routing tilføjet parseren (runde 5-fund) —
    27	   udvidelse af B.1 inden for §5-semantikken.
    28	4. codex-reviews/ tilføjet scannerens DOC_EXCLUDE (batch 4b) — review-filer er
    29	   ephemeral rå-output (§4) der bevidst citerer døde stier; first-time-fund da
    30	   reviews aldrig før var committet som filer.
    31	5. MELLEM-routing gjort runde-aware i parseren (runde 6-fund, batch 5) —
    32	   §5 runde-trapper: exit 2 i runde 1, G-spor i runde 2+.
    33	
    34	Noter:
    35	
    36	- Krav OK 2026-06-10 · qwerg 2026-06-10. 0 migrations — ren docs+scripts-pakke.
    37	- Reviews: codex-reviews/2026-06-10-gov-docs-renhed-runde-{1..4}.md (plan:
    38	  2K+3M → 1K+3M → 1K+1G → APPROVAL) · runde-5.md (build: 3 KRITISK → batch 4).
    39	- Driftsnote: `codex exec` uden TTY kræver `< /dev/null` — indbygget i repareret
    40	  codex-review.sh.

exec
/bin/bash -lc "sed -n '600,760p' docs/coordination/gov-docs-renhed-plan.md" in /home/mathias/stork-2.0
 succeeded in 0ms:

**Bevares 1:1 (MANGLENDE-EKSISTERENDE-BEVARELSE-tjek):** argument-parsing
(22-60) · pre-flight minus prefix-blok (66-76, 84-87) · PAKKE_NAME/DATE/
OUTPUT_DIR/OUTPUT_FILE/PLAN_SHA (94-107) · timeout-/fejl-håndtering (137-165) ·
output-fil-header m. re-run-command (167-193) · marker-parsing-sektionen
(199-259) strukturelt bevaret — eneste ændring er de bracket-tolerante mønstre
(R2-1-tabellen ovenfor) + flytning ind i `parse_markers`-funktion ·
exit-kode-routing (261-286) uændret. Ingen gates/markers/exit-koder tabes.

### B.2 `scripts/governance-check.mjs` — allowlist-split

Nuværende `deadDocPaths()` (linje 129-142, 1:1):

```js
function deadDocPaths() {
  const scan = [...DOC_FILES, ...SCRIPT_FILES];
  for (const f of scan) {
    const refs = docRefs(stripFenced(read(f)));
    for (const r of refs) {
      if (pathExists(r)) continue;
      if (ALLOWED.has(r)) {
        notes.push(`dead-doc-paths: tilladt manglende ${r} (${f})`);
        continue;
      }
      v("dead-doc-paths", `${f}: peger på ikke-eksisterende ${r} (ikke i allowlist)`);
    }
  }
}
```

Ny (1:1):

```js
const ALLOW_BY_PATH = new Map(MISSING_PATH_ALLOWLIST.map((a) => [a.path, a]));
const SCRIPT_SET = new Set(SCRIPT_FILES);
function isDeprecated(file) {
  return read(file)
    .split("\n")
    .some((l) => l.trim().startsWith("# governance: deprecated"));
}
function deadDocPaths() {
  const scan = [...DOC_FILES, ...SCRIPT_FILES];
  for (const f of scan) {
    const refs = docRefs(stripFenced(read(f)));
    for (const r of refs) {
      if (pathExists(r)) continue;
      const entry = ALLOW_BY_PATH.get(r);
      if (entry) {
        // Split (gov-docs-renhed): prosa må bære historisk-provenance;
        // aktive scripts må ikke — medmindre scriptet selv er deprecated.
        if (SCRIPT_SET.has(f) && entry.klasse === "historisk-provenance" && !isDeprecated(f)) {
          v(
            "dead-doc-paths",
            `${f}: aktivt script peger på slettet ${r} (historisk-provenance er kun for prosa — markér scriptet '# governance: deprecated' eller fjern referencen)`,
          );
          continue;
        }
        notes.push(`dead-doc-paths: tilladt manglende ${r} (${f})`);
        continue;
      }
      v("dead-doc-paths", `${f}: peger på ikke-eksisterende ${r} (ikke i allowlist)`);
    }
  }
}
```

(`ALLOWED`-settet linje 100 beholdes — bruges fortsat af laesefoelge-/pointer-checks.)

**Scanner-præcisions-fix (Code-fund under V2-skrivning, OPGRADERING):**
`docRefs()`-regexen (linje 113) mangler danske bogstaver i charclass — en doc
der refererer LÆSEFØLGE.md med fuld sti får matchet afskåret ved første danske
bogstav og giver falsk violation. Fix i samme batch: charclass udvides med
danske bogstaver. Fanget live to gange under plan-skrivningen.

Allowlist-prune (entries fjernet 1:1 — de tre objekter for
`mathias-afgoerelser.md`, `overvaagning/claude-ai-overvaagning.md`,
`skabeloner/rapport-skabelon.md`, jf. referent-tabellen). Øvrige 9 entries
uændrede.

### B.3 Ny check `structural-chain` (tilføjes + registreres i CHECKS)

Nuværende CHECKS-array (linje 256-264, 1:1):

```js
const CHECKS = [
  ["dead-doc-paths", deadDocPaths],
  ["junk-files", junkFiles],
  ["laesefoelge-targets", laesefoelgeTargets],
  ["pointer-validity", pointerValidity],
  ["owns-uniqueness", ownsUniqueness],
  ["number-home-uniqueness", numberHomeUniqueness],
  ["H-ref-integrity", hRefIntegrity],
];
```

Ny: + `["structural-chain", structuralChain],` som sidste element. Funktionen (ny 1:1):

```js
// ---------- check: structural-chain (gov-docs-renhed pkt 10) ----------
// Strukturelt + string-match — ingen semantik. Formåls-immutabilitet (§3.0) mekanisk.
function normFormaal(text) {
  const lines = text.split("\n");
  const i = lines.findIndex((l) => l.trim().startsWith("> Denne pakke leverer:"));
  if (i === -1) return null;
  const out = [];
  for (let j = i; j < lines.length && lines[j].trim().startsWith(">"); j++) {
    out.push(lines[j].replace(/^\s*>\s?/, ""));
  }
  return out.join(" ").replace(/\s+/g, " ").trim();
}
function structuralChain() {
  const ap = read("docs/coordination/aktiv-plan.md");
  let marker = null;
  for (const line of ap.split("\n")) {
    const m = line.trim().match(/^<!--\s*aktiv-pakke:\s*(\S+)(?:\s+fase:\s*(plan|build|rapport))?\s*-->$/);
    if (m) marker = { pakke: m[1], fase: m[2] ?? "plan" };
  }
  if (!marker)
    return v(
      "structural-chain",
      "aktiv-plan.md mangler standalone-markør <!-- aktiv-pakke: <navn|ingen> [fase: plan|build|rapport] -->",
    );
  if (marker.pakke === "ingen") return;
  const base = "docs/coordination";
  const krav = `${base}/${marker.pakke}-krav-og-data.md`;
  const plan = `${base}/${marker.pakke}-plan.md`;
  const status = `${base}/${marker.pakke}-status.md`;
  for (const f of [krav, plan, status]) {
    if (!existsSync(f)) v("structural-chain", `aktiv pakke '${marker.pakke}': mangler ${f}`);
  }
  if (!existsSync(krav) || !existsSync(plan)) return;
  if (!read(plan).includes(krav)) v("structural-chain", `${plan}: krydspeger ikke ${krav}`);
  if (!read(plan).includes(status)) v("structural-chain", `${plan}: krydspeger ikke ${status}`);
  if (existsSync(status) && !read(status).includes(marker.pakke))
    v("structural-chain", `${status}: nævner ikke pakken '${marker.pakke}'`);
  const fk = normFormaal(read(krav));
  const fp = normFormaal(stripFenced(read(plan)));
  if (!fk) v("structural-chain", `${krav}: ingen "> Denne pakke leverer:"-blok`);
  if (!fp) v("structural-chain", `${plan}: ingen "> Denne pakke leverer:"-blok`);
  if (fk && fp && fk !== fp) v("structural-chain", `Formål-streng afviger mellem ${krav} og ${plan} (§3.0)`);
  if (marker.fase === "rapport") {
    const dir = "docs/coordination/rapport-historik";
    const rapporter = existsSync(dir) ? readdirSync(dir).filter((x) => x.endsWith(`-${marker.pakke}.md`)) : [];
    if (!rapporter.length)
      return v("structural-chain", `fase: rapport men ingen rapport-historik/*-${marker.pakke}.md`);
    const nyeste = rapporter.sort().at(-1);
    const fr = normFormaal(read(join(dir, nyeste)));
    if (!fr) v("structural-chain", `${dir}/${nyeste}: ingen "> Denne pakke leverer:"-blok`);
    else if (fk && fk !== fr) v("structural-chain", `Formål-streng afviger mellem ${krav} og ${dir}/${nyeste} (§3.0)`);
  }
}
```

NB: plan-filens Formål læses EFTER `stripFenced` så citerede skabelon-eksempler
ikke matcher; krav-dok/rapport læses råt (Formål står som blockquote, ikke fence).

`docs/coordination/aktiv-plan.md` får markøren (build-fasen):
`<!-- aktiv-pakke: gov-docs-renhed fase: build -->`.

### B.4 `scripts/governance-check.selftest.mjs` — 9 nye cases


exec
/bin/bash -lc "rg -n \"A\\.13|claude-ai|SKILL|TANKE-DATA|forretningsforstaaelse\" docs/coordination/gov-docs-renhed-plan.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
67:- **Scripts (`.sh`, scannet):** codex-review.sh (286 l) · claude-ai-prompt.sh
85:  | coordination/mathias-afgoerelser.md    | claude-ai-prompt.sh + data-grundlag.sh (kun scripts)                                                       |
86:  | overvaagning/claude-ai-overvaagning.md | claude-ai-prompt.sh (kun script)                                                                           |
92:  | coordination/plan-feedback             | claude-ai-prompt.sh + disciplin §4 (kortform uden mappe-prefix)                                            |
100:| `claude-ai-prompt.sh` | **SLET**   | Indlejrer fjernet fire-dok-ramme + V5.3-step-numre; peger på slettede mathias-afgoerelser.md + claude-ai-overvaagning.md. Substansen overhalet af SKILL.md-i-repo + Filesystem-MCP                                                 |
116:`mathias-afgoerelser.md`, `claude-ai-overvaagning.md`, `rapport-skabelon.md`
191:status-tekst: forretningsforstaaelse løftes til LÅST (Mathias' afgørelse i
236:> **LÅST DOKUMENT.** Dette er grundstenen i Stork 2.0. Ændringer kræver eksplicit godkendelse fra Mathias via PR. CODEOWNERS håndhæver at kun Mathias kan approve ændringer. Dokumentet er autoritativ kilde for vision og principper — ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette. Undtagelse (D4): `forretningsforstaaelse.md` er med-stamme-doc — en modsigelse mellem de to er et hul der STOPPER arbejdet og lukkes af Mathias, ikke en konflikt dette dokument vinder.
238:### A.2 `docs/strategi/forretningsforstaaelse.md` — LÅST-banner
289:| `vision-og-principper.md`               | **LÅST**            | STOP. KRITISK. Vinder over alt undtagen forretningsforstaaelse (D4: indbyrdes stamme-doc-modsigelse = hul → STOP → Mathias lukker). Dokumentér i blokker-fil, argumentér ikke videre |
295:| `forretningsforstaaelse.md` | **LÅST** | STOP. KRITISK. Stamme-doc med vision (D4): modsigelse mellem de to er et hul Mathias lukker — ingen trumf |
301:> forretningsforstaaelse) SKAL ændringen eksplicit konsistens-tjekkes mod den
320:- docs/strategi/forretningsforstaaelse.md (tanke-data, ikke kontrakt)
329:forretningsforstaaelse / owns-register): afslut med
380:2. `docs/strategi/forretningsforstaaelse.md`
382:   **TANKE-DATA** — kontekst-grundlag for krav-dok, ikke kontrakt.
389:2. `docs/strategi/forretningsforstaaelse.md`
401:> Ved konflikt mellem dokumenter: vision (1) vinder over alle andre — undtagen forretningsforstaaelse (2): modsigelse mellem de to stamme-docs er et hul → STOP → Mathias lukker (D4).
415:### A.13 `docs/claude-ai/SKILL.md` — kanonisk-deklaration
432:> Mathias' tanker pr. pakke lever i `docs/coordination/<pakke>-krav-og-data.md` (pakke-kontrakt). Tanker der ændrer ramme på tværs af pakker går ind i `docs/strategi/forretningsforstaaelse.md` (tanke-data) eller `docs/strategi/vision-og-principper.md` (LÅST evig, ved princip-niveau). Master-planen reflekterer arkitektur-konsekvensen som Appendix C-rettelser. Ved konflikt vinder vision (LÅST) → forretningsforstaaelse + krav-dok → master-plan tilrettes.
436:> Mathias' tanker pr. pakke lever i `docs/coordination/<pakke>-krav-og-data.md` (pakke-kontrakt). Tanker der ændrer ramme på tværs af pakker går ind i `docs/strategi/forretningsforstaaelse.md` (LÅST stamme-doc) eller `docs/strategi/vision-og-principper.md` (LÅST evig, ved princip-niveau). Master-planen reflekterer arkitektur-konsekvensen som Appendix C-rettelser. Ved konflikt vinder stamme-docs (vision + forretningsforstaaelse — indbyrdes modsigelse mellem de to er et hul → STOP → Mathias lukker, D4) → krav-dok → master-plan tilrettes.
507:- docs/strategi/forretningsforstaaelse.md (LÅST stamme-doc, D4)
519:scope-creep · vision/forretningsforstaaelse-modsigelse ·
675:`mathias-afgoerelser.md`, `overvaagning/claude-ai-overvaagning.md`,

exec
/bin/bash -lc "sed -n '400,430p' docs/coordination/gov-docs-renhed-plan.md" in /home/mathias/stork-2.0
 succeeded in 0ms:

> Ved konflikt mellem dokumenter: vision (1) vinder over alle andre — undtagen forretningsforstaaelse (2): modsigelse mellem de to stamme-docs er et hul → STOP → Mathias lukker (D4).

### A.11 `CLAUDE.md:4`

Nuværende: `Git pull før hver trigger.`
Ny: `Branch-bevidst git-sync før hver trigger (disciplin §13).`

### A.12 `rapport-historik/README.md:5` + `scripts/README.md`

README:5 nuværende: `Hver rapport følger \`docs/skabeloner/rapport-skabelon.md\`.`Ny:`Hver rapport følger skabelonen i \`docs/strategi/disciplin.md\` §10.3.`

scripts/README.md: `krav-afklar.sh`-rækken slettes ordret (hele tabel-rækken).
Øvrige rækker uændret.

### A.13 `docs/claude-ai/SKILL.md` — kanonisk-deklaration

Ny sektion tilføjes nederst (ingen eksisterende tekst ændres):

```
## Kanonisk kilde

Denne fil er DEN kanoniske skill. Platform-skill'en i claude.ai er en kopi
af denne fil — ved drift vinder repo-versionen. Sync: Mathias kopierer
fil-indholdet til platform-skill'en når denne fil ændres (flagges i
slut-rapport som Mathias-handling).
```

### A.14 `docs/strategi/stork-2-0-master-plan.md` — hierarki-afsnit (fund R2-4)

Nuværende (afsnittet under "### Strategiske retning-skift", 1:1):

codex
Den aktive skill er faktisk den eneste tilbageværende “TANKE-DATA”-klassifikation uden for planens før/efter-citater. Jeg tjekker lige om der også ligger utilsigtede gov-6-filer tracked efter batch 4/5.
exec
/bin/bash -lc 'git ls-files docs/coordination/v4-slettede-docs' in /home/mathias/stork-2.0
 succeeded in 0ms:
exec
/bin/bash -lc "rg -n \"TANKE-DATA|tanke-data|ikke kontrakt|vision \\(LÅST\\).*forretningsforstaaelse|vinder vision\" docs --glob '*.md' --glob '"'!docs/coordination/gov-docs-renhed-plan.md'"' --glob '"'!docs/coordination/codex-reviews/**'"'" in /home/mathias/stork-2.0
 succeeded in 0ms:
docs/strategi/disciplin.md:7:> **Dette er det eneste rolle- og proces-hjem.** Vision-og-principper.md definerer ikke længere aktører eller roller — det er proces, og det bor her. Ved konflikt om systemets vision vinder vision-dokumentet; ved spørgsmål om hvordan vi arbejder vinder denne fil.
docs/strategi/disciplin.md:199:Hvad en modsigelse udløser afhænger af hvilket dokument den rammer. Det forhindrer at arbejdet stopper på master-plan (som er overblik, ikke kontrakt).
docs/claude-ai/SKILL.md:26:- `docs/strategi/forretningsforstaaelse.md` — TANKE-DATA (Mathias' tanker)
docs/coordination/gov-docs-renhed-krav-og-data.md:68:   "TANKE-DATA — ikke kontrakt" → låst-status; (c) ny række i `disciplin.md §8`
docs/coordination/arkiv/T9-plan.md:568:- Krav-dok sektion 4 specificerer Hent som funktioner T9 leverer; ren PostgREST-eksponering opfylder ikke kontrakten 1:1

exec
/bin/bash -lc 'git diff --name-only claude/gov-docs-renhed-plan..HEAD -- docs/coordination/v4-slettede-docs docs/coordination/arkiv' in /home/mathias/stork-2.0
 succeeded in 0ms:
codex
Gov-6-filerne er ikke tracked længere. Den tilbageværende materielle afvigelse er skill’ens stale klassifikation; statusfilen har også en mindre “denne commit”/batch-liste-skævhed, men den modsiger ikke næste handling på samme måde.
codex
Jeg laver et sidste hurtigt tjek af de nye henvisninger, så der ikke er en manglende §-target eller død reference gemt i docs-teksten.
exec
/bin/bash -lc 'rg -n "§13|Branch-bevidst|git-sync|branch" docs/strategi/disciplin.md docs/LÆSEFØLGE.md CLAUDE.md' in /home/mathias/stork-2.0
 succeeded in 0ms:
CLAUDE.md:4:Branch-bevidst git-sync før hver trigger (disciplin §13).
docs/LÆSEFØLGE.md:18:0. Branch-bevidst git-sync (disciplin §13): `git fetch` + verificér
docs/LÆSEFØLGE.md:19:   branch/base/remote + pull den branch arbejdet sker på.
docs/strategi/disciplin.md:46:> **Automation-tilstand (Codes kortlægning, juni 2026 — Codes bord):** `codex-notify` poster kun tracker-comment. Der er **ingen Codex-runner og ingen auto-merge-workflow endnu**, og plan-branchen er ikke dækket af triggeren (bygges i gov-5-automation). Indtil det bygges: Mathias merger PR'er, og Codex-review relæes manuelt. Flowet ovenfor er mål-tilstanden — gates der hviler på auto-merge er ikke aktive endnu. Denne fil påstår ikke en automation der ikke kører.
docs/strategi/disciplin.md:174:`codex-notify.yml` poster tracker-comments på push til aktiv-plan/seneste-rapport/build-branch og på slut-rapport-PR. **Den kører ikke Codex, og der er ingen auto-merge.** Mål-tilstand (skal bygges, Codes bord — samlet i gov-5-automation): plan-branch-trigger, Codex-runner, auto-merge ved grøn CI + godkendelse. `migrations-deploy.yml` deployer til live + regenererer types ved push til migrations — verificér mod Codes kortlægning før den antages aktiv.
docs/strategi/disciplin.md:449:## §13 Git-sync-disciplin
docs/strategi/disciplin.md:451:Branch-bevidst sync før enhver session-start/review-runde: `git fetch` + verificér aktuel branch/base/remote + pull den branch arbejdet faktisk sker på (plan/build/main). `git pull origin main` er kun korrekt når arbejdet ER på main. Påstande baseret på cached/forældet kopi = fabrikation. Code: sync ved hver trigger. Codex (auto): frisk på commit-trigger. Codex (manuel): sync før review. Claude.ai: kan ikke pulle — beder Mathias om commit-hash/fil-indhold ved tvivl, antager ikke fra hukommelse. Uventede commits ved sync → STOP, rapportér.
docs/strategi/disciplin.md:461:- **Fundament + spærhager (Codes bord):** branch protection (gov-4) · Codex-runner + auto-merge + plan-branch-trigger (gov-5). (gov-3 CI-blockers fuldt færdig — G065 lukket i gov-3b-3b.)

exec
/bin/bash -lc 'rg -n "docs/[''^` )'"\\],.;:]+\" CLAUDE.md docs/LÆSEFØLGE.md docs/claude-ai/SKILL.md docs/coordination/aktiv-plan.md docs/coordination/gov-docs-renhed-status.md docs/coordination/rapport-historik/README.md docs/strategi/disciplin.md docs/strategi/stork-2-0-master-plan.md docs/strategi/vision-og-principper.md docs/strategi/forretningsforstaaelse.md" in /home/mathias/stork-2.0
 exited 2 in 0ms:
/bin/bash: -c: line 1: unexpected EOF while looking for matching ``'

exec
/bin/bash -lc "git diff --unified=20 claude/gov-docs-renhed-plan..HEAD -- docs/strategi/disciplin.md | sed -n '1,260p'" in /home/mathias/stork-2.0
 succeeded in 0ms:
diff --git a/docs/strategi/disciplin.md b/docs/strategi/disciplin.md
index 0eea85d..06e62a8 100644
--- a/docs/strategi/disciplin.md
+++ b/docs/strategi/disciplin.md
@@ -26,41 +26,41 @@
 ## §2 Workflow — 5-step flow
 
 Alle pakker kører fuld disciplin. Ingen skala-distinktion.
 
 ```
 0. Pakke-åbning (Mathias)
    ↓
 1. Krav-dok (Mathias → Claude.ai-typist, proaktiv recon; Mathias validerer)   ← gate: "krav OK"
    ↓
 2. Plan (Code + Codex parallel; skitse → størrelses-tjek → fuld plan eller split)
    ↓
 3. qwerg approval (Mathias)                                                    ← gate: "qwerg"
    ↓
 4. Build (Code batches; Codex per-batch; end-to-end-konsistens per batch)
    ↓
 5. Slut-rapport (Code skriver; Claude.ai-review FØR merge)                     ← gate: "slut OK"
 ```
 
 Tre gates kræver Mathias: `krav OK`, `qwerg`, `slut OK`. Trin 2 og 4 er hvor det meste arbejde sker.
 
-> **Automation-tilstand (Codes kortlægning, juni 2026 — Codes bord):** `codex-notify` poster kun tracker-comment. Der er **ingen Codex-runner og ingen auto-merge-workflow endnu**, og plan-branchen er ikke dækket af triggeren (H020). Indtil det bygges: Mathias merger PR'er, og Codex-review relæes manuelt. Flowet ovenfor er mål-tilstanden — gates der hviler på auto-merge er ikke aktive endnu. Denne fil påstår ikke en automation der ikke kører.
+> **Automation-tilstand (Codes kortlægning, juni 2026 — Codes bord):** `codex-notify` poster kun tracker-comment. Der er **ingen Codex-runner og ingen auto-merge-workflow endnu**, og plan-branchen er ikke dækket af triggeren (bygges i gov-5-automation). Indtil det bygges: Mathias merger PR'er, og Codex-review relæes manuelt. Flowet ovenfor er mål-tilstanden — gates der hviler på auto-merge er ikke aktive endnu. Denne fil påstår ikke en automation der ikke kører.
 
 ### Step 0 — Pakke-åbning
 
 Mathias melder ny pakke ud i chat.
 
 ### Step 1 — Krav-dok
 
 Claude.ai skriver `docs/coordination/<pakke>-krav-og-data.md` fra Mathias' chat-input; Mathias validerer i samme chat.
 
 - Mathias' tanker om hvad pakken skal levere (forretning + funktion + logik)
 - Ingen tabel-navne/kolonner/RPC-signaturer (Code's bord i plan-fasen)
 - Hver påstand peges på Mathias-ord — ingen kilde: spørg, skriv ikke. Ingen fabrikation.
 
 ### Step 2 — Plan (med skitse-tjek)
 
 **2.0 skitse + størrelse:** 1-5 migrations → fuld V1. 6+ → STOP, split-forslag (krav-dok forbliver ÉT dok, implementation splittes over pakker).
 **2.1 fuld plan (Code+Codex parallel fra V1):** Code skriver V<n>; Codex laver parallel kode-research. Code håndterer hvert KODE-FUND eksplicit i V<n+1> (ADRESSERET / AFVIST fordi Y). Stop: Codex APPROVAL + "INGEN NYE FUND".
 
 ### Step 3 — qwerg
 
@@ -154,83 +154,88 @@ Pre-cutover (ingen rigtige data): tom-check + audit-spor er minimum. Post-cutove
 | **FULDSTYRKE-MANGEL**                | Kun Mathias-rejst. AI scrapper output, gentager samme V-nummer                                                                                   |
 
 Hver severity bærer funktion — de kollapses ikke. (MANGLENDE-EKSISTERENDE-BEVARELSE binder patch-først; OPGRADERING muliggør approval+forslag samtidig.)
 
 **Runde-trapper:** runde 1 alle fund vurderes · runde 2 kun KRITISK stopper, MELLEM → G-numre · runde 3 kun KRITISK, resten → G-numre · runde 4+ se §3.4.
 
 **FLAG → LØS (Code's svar pr. Codex-fund):** ACCEPT / PUSHBACK (argumentér; Codex: AGREE/REFINE) / PROPOSE-ALTERNATIVE. Max 3 LØS-iterationer pr. fund; > 3 → auto-eskalation via `mathias-gate/`.
 
 **Positive markers:** OPTIMERING-FORSLAG (Codex) → Code: ADOPT/DEFER/DISMISS · SPARRING-OENSKE (Code) → Codex: CONFIRM/TIMING/AVOID.
 
 ---
 
 ## §6 Build-markers + automation
 
 ### 6.1 Halt-markers
 
 `BRUD-PAA-KRAV` → Step 1 · `TEKNISK-BLOKERING` → Step 2 / Mathias · `PLAN-AFVIGELSE` → Step 2 / Mathias · `KRITISK-SIKKERHEDSHUL` → fix samme batch / Mathias · `WORKAROUND-INTRODUCERET` → mathias-gate · `STOP-FOR-CLARIFICATION` → gate-fil.
 
 ### 6.2 Automation (Codes bord — tilstand: notify-only)
 
-`codex-notify.yml` poster tracker-comments på push til aktiv-plan/seneste-rapport/build-branch og på slut-rapport-PR. **Den kører ikke Codex, og der er ingen auto-merge.** Mål-tilstand (skal bygges, Codes bord): plan-branch-trigger (H020), Codex-runner, auto-merge ved grøn CI + godkendelse. `migrations-deploy.yml` deployer til live + regenererer types ved push til migrations — verificér mod Codes kortlægning før den antages aktiv.
+`codex-notify.yml` poster tracker-comments på push til aktiv-plan/seneste-rapport/build-branch og på slut-rapport-PR. **Den kører ikke Codex, og der er ingen auto-merge.** Mål-tilstand (skal bygges, Codes bord — samlet i gov-5-automation): plan-branch-trigger, Codex-runner, auto-merge ved grøn CI + godkendelse. `migrations-deploy.yml` deployer til live + regenererer types ved push til migrations — verificér mod Codes kortlægning før den antages aktiv.
 
 ### 6.3 Mathias-gate to-fil-flow
 
 For WORKAROUND-INTRODUCERET, STOP-FOR-CLARIFICATION, dobbelt-ESCALATE og iter > 3: build pauser → Code skriver gate-fil (Status: AFVENTER MATHIAS + begrundelse + G-nummer + deadline) → Mathias: GODKENDT/AFVIST → genoptag/alternativ → slettes ved pakke-luk.
 
 ---
 
 ## §7 Stork-invariant-tjek pr. pakke (verificeres i slut-rapport)
 
-| #   | Invariant                    | Test                                                        |
-| --- | ---------------------------- | ----------------------------------------------------------- |
-| 1   | Vision-overholdelse          | Vision-tjek-sektion (ja/nej + evidens pr. princip)          |
-| 2   | Permission-matrix-konsistens | RPC→tab/page-mapping opdateret + RLS dækker alle write-veje |
-| 3   | Audit-trigger-dækning        | Alle nye tabeller har audit-trigger (fitness)               |
-| 4   | Konfiguration-i-data         | Ingen hardkodede satser/lønarter (lint)                     |
-| 5   | End-to-end-flow virker       | Smoke-test passerer (ikke schema-only)                      |
-| 6   | Anonymisering-bevaring       | UPDATE, ikke DELETE; FK'er intakt                           |
+| #   | Invariant                    | Test                                                                                  |
+| --- | ---------------------------- | ------------------------------------------------------------------------------------- |
+| 1   | Vision-overholdelse          | Vision-tjek-sektion (ja/nej + evidens pr. princip)                                    |
+| 2   | Permission-matrix-konsistens | RPC→tab/page-mapping opdateret + RLS dækker alle write-veje                           |
+| 3   | Audit-trigger-dækning        | Alle nye tabeller har audit-trigger (fitness)                                         |
+| 4   | Konfiguration-i-data         | Ingen hardkodede satser/lønarter (Codex + Claude.ai-tjek — lint bygges i senere spor) |
+| 5   | End-to-end-flow virker       | Smoke-test passerer (ikke schema-only)                                                |
+| 6   | Anonymisering-bevaring       | UPDATE, ikke DELETE; FK'er intakt                                                     |
 
 Tabel med ja/nej + evidens. Manglende eller "nej" uden begrundelse → KRITISK fra Claude.ai-reviewer.
 
 ---
 
 ## §8 Modsigelses-disciplin (genindført — differentieret efter dokument-status)
 
 Hvad en modsigelse udløser afhænger af hvilket dokument den rammer. Det forhindrer at arbejdet stopper på master-plan (som er overblik, ikke kontrakt).
 
-| Dokument                                | Status              | Modsigelse udløser                                                                                                                                           |
-| --------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
-| `vision-og-principper.md`               | **LÅST**            | STOP. KRITISK. Vinder over alt. Dokumentér i blokker-fil, argumentér ikke videre                                                                             |
-| `stork-2-0-master-plan.md` + afgørelser | **RETNINGSGIVENDE** | Rapport til Mathias — IKKE auto-blokering. Han afgør: er rammen forældet (rettes) eller skal pakken justeres? Arbejdet stopper ikke, det venter på afgørelse |
-| krav-dok + plan (efter approval)        | **PAKKE-KONTRAKT**  | STOP. KRITISK indtil Mathias afgør re-godkendelse eller justering                                                                                            |
+| Dokument                                | Status              | Modsigelse udløser                                                                                                                                                                   |
+| --------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
+| `vision-og-principper.md`               | **LÅST**            | STOP. KRITISK. Vinder over alt undtagen forretningsforstaaelse (D4: indbyrdes stamme-doc-modsigelse = hul → STOP → Mathias lukker). Dokumentér i blokker-fil, argumentér ikke videre |
+| `forretningsforstaaelse.md`             | **LÅST**            | STOP. KRITISK. Stamme-doc med vision (D4): modsigelse mellem de to er et hul Mathias lukker — ingen trumf                                                                            |
+| `stork-2-0-master-plan.md` + afgørelser | **RETNINGSGIVENDE** | Rapport til Mathias — IKKE auto-blokering. Han afgør: er rammen forældet (rettes) eller skal pakken justeres? Arbejdet stopper ikke, det venter på afgørelse                         |
+| krav-dok + plan (efter approval)        | **PAKKE-KONTRAKT**  | STOP. KRITISK indtil Mathias afgør re-godkendelse eller justering                                                                                                                    |
 
 Pointe: kun vision og pakke-kontrakten stopper automatisk. Master-plan-modsigelse er en trigger for en afgørelse, ikke en blokering.
 
 ### §8.1 Governance-vagt (gov-2 — mekanisk lag-1 + Codex-mandat)
 
 Spærhagen der fanger governance-drift, så disciplinen ikke kun hviler på selv-tjek.
 
 **Mekanisk (lag 1 — `scripts/governance-check.mjs`, `pnpm governance:check`, CI-step):** døde doc-stier (docs + scripts), junk/lock-filer, brudte LÆSEFØLGE-/pointer-mål, **owns-unikhed** (ét begreb, ét hjem), nummer-hjem-unikhed (G/H kanonisk entry ét sted), H-ref-integritet (hver H-ref → åben entry eller historisk-kode i `huskeliste.md`). Princip: **owner = definitionshjem, ikke mention-hjem.** Hver governance-doc deklarerer sit ejerskab via en `<!-- governance-owns: … -->`-markør; scanneren fejler ved dobbelt-ejerskab. **Ærlig grænse:** fanger _deklareret_ dobbelt-ejerskab + nummer-dubletter mekanisk; _udeklareret prosa-overlap_ fanges ikke mekanisk → lag 2.
 
 **Codex-mandat (lag 2 — semantisk):** ved enhver ændring til en governance-doc (vision / disciplin / master-plan / forretningsforstaaelse / owns:-register) SKAL Codex eksplicit svare: **"modsiger dette prosa-mæssigt et begreb som en anden doc ejer?"** før merge. Det dækker den klasse scanneren ikke kan.
 
+**Stamme-doc-konsistens (D4):** ændres én af de to stamme-docs (vision / forretningsforstaaelse) SKAL ændringen eksplicit konsistens-tjekkes mod den anden. Modsigelse = hul → STOP → Mathias lukker. Ingen af de to trumfer den anden.
+
+**Fast markør:** Codex' svar gives som linjen `§8.1-SVAR: INGEN-MODSIGELSE` eller `§8.1-SVAR: MODSIGELSE — <begreb> ejes af <doc>` i reviewet, og gentages i slut-rapporten (§10.3) når pakken har berørt governance-docs — så svaret kan tjekkes i PR/rapport, ikke kun huskes i chat.
+
 **Governance-ændringer er review-artefakter:** en ændring til vision/disciplin/master-plan går gennem samme gate som kode — `governance:check` grøn + Codex' prosa-modsigelses-svar. Fraværet af netop dette gav V5's rolle-modsigelse (vision↔disciplin); §8.1 lukker den klasse.
 
 ---
 
 ## §9 Rolle-disciplin pr. AI
 
 Når Mathias paster `qwers` læser AI'en sin sektion + bekræfter rolle.
 
 **Glid-detector (genindført — svageste lag).** Selv-tjek fanger ikke pålideligt; det bærende værn er mekanisk tjek + Codex + Mathias. Men hver aktør spotter selv:
 
 - **Code:** "jeg har implicit forenklet" / "ikke fået svar 2 gange" / "afviger fra plan uden flag" → STOP, flag
 - **Claude.ai:** "jeg gætter på kilde" / "jeg fabrikerer detalje" / "jeg pakker forslag som afgjort" / "jeg påstår repo-tilstand uden at have set den" → flag [gæt] eller verificér/spørg
 - **Codex:** "jeg holder nok-OK tilbage" / "jeg eskalerer for at undgå at afgøre" → flag
 
 ### §9.1 Claude.ai
 
 **Rolle:** krav-dok-typist (Step 1) + slut-rapport-reviewer (Step 5) + sparring. Docs-lag.
 **MÅ:** skrive krav-dok fra Mathias' input · spørge Mathias direkte i krav-dok-fasen · reviewe slut-rapport mod krav-dok + vision + forretningsforstaaelse · levere FEEDBACK eller APPROVAL (aldrig begge).
 **MÅ IKKE:** tekniske beslutninger · krav-dok-påstande uden Mathias-kilde · kode-vurdering (Codex' bord) · datamodel-design (Code's bord) · skrive "afgørelser" · påstå at noget ER bygget når et dokument kun siger det SKAL bygges (→ "ikke verificeret, Codes bord").
 **Triggers:** `qwers` → bekræft rolle · `qwers <pakke>` → bekræft + proaktiv kontekst-recon STRENGT i forretnings-sprog (læs forretningsforstaaelse + evt. vision + søg rapport-historik; output: "det vi har" + targeted spørgsmål + scope-forslag; FORBUDT: tabel/kolonne/RPC-navne) · `qwerr` → slut-rapport-review.
@@ -358,101 +363,107 @@ Eksplicit verdikt pr. række — ingen tom:
 | Krav-dok-leverance | Status | Migration/RPC | Test | Evidens |
 
 ## Stork-invariant-tjek
 
 | Invariant | Status | Evidens |
 | Vision-overholdelse | ✓/✗ | [princip + hvordan opfyldt] |
 | Permission-matrix | ✓/✗ | [opdateret fil + linje] |
 | Audit-trigger | ✓/✗ | [fitness grøn] |
 | Konfiguration-i-data | ✓/✗ | [ingen hardkodede satser] |
 | End-to-end-flow | ✓/✗ | [smoke grøn — ikke schema-only] |
 | Anonymisering-bevaring | ✓/✗ | [UPDATE ikke DELETE; FK intakt] |
 
 ## Plan-afvigelser
 
 [Liste eller "ingen" — hver med Mathias-gate-fil eller godkendelse]
 
 ## G-numre rejst
 
 [Reference til teknisk-gaeld.md]
 
+## §8.1-svar (hvis governance-docs berørt)
+
 ## Konvergens-historie
 
 | V<n> | Codex-fund | Code-svar | Outcome |
 
 ## Vision-tjek
 
 - Rigtig løsning eller workaround?
 - Vision-styrkelser / -svækkelser denne pakke
 - Konklusion: forsvarligt / kompromis / drift
 ```
 
 ### §10.4 Codex-review-prompt-skabelon
 
 ```markdown
 Du er Codex i Stork 2.0 — uafhængig kode-reviewer.
 
 Læs FØR review:
 
 - docs/strategi/vision-og-principper.md
-- docs/strategi/forretningsforstaaelse.md (tanke-data, ikke kontrakt)
+- docs/strategi/forretningsforstaaelse.md (LÅST stamme-doc, D4)
 - docs/strategi/disciplin.md §9.3 (din rolle)
 - docs/coordination/<pakke>-krav-og-data.md (pakke-kontrakt)
 - docs/coordination/<pakke>-plan.md (det du reviewer)
 - docs/coordination/<pakke>-status.md (kontekst + konvergens-counter)
 
 Review-fokus:
 
 - Patch-først (§3.1): eksisterende body 1:1 + diff?
 - End-to-end-spor (§3.3): alle 5 punkter pr. write-vej?
 - DB-state-dump (§3.2): matcher faktisk state?
 - Krav-dok-konsistens uden scope-creep
 - Vision + forretningsforstaaelse-modsigelse
 - MANGLENDE-EKSISTERENDE-BEVARELSE (KRITISK-undertype)
 
 Format pr. fund:
 [SEVERITY] Kort beskrivelse
 Konkret afvigelse: ...
 Anbefalet handling: [V<n+1>-rettelse / G-nummer / kosmetisk note]
+
+Berører ændringen en governance-doc (vision / disciplin / master-plan /
+forretningsforstaaelse / owns-register): afslut med
+`§8.1-SVAR: INGEN-MODSIGELSE` eller `§8.1-SVAR: MODSIGELSE — <hvad>`.
 ```
 
 ### §10.5 Pakke-status-skabelon
 
 Se §3.5 — kort fil med sidste handling, næste forventet, konvergens-counter, blocker.
 
 ---
 
 ## §11 Disciplin-tjekliste — før hver migration skrives
 
 1. Hvilket vision-element understøtter dette? 2. Hvilket kunne det svække? 3. Findes en simplere løsning uden vision-kompromis? 4. Hvis kompromis: dokumenteret med G-nummer + deadline? 5. Skal en halt-marker rejses (§6.1)? 6. Patch-først overholdt (§3.1)? 7. End-to-end-spor dokumenteret (§3.3)? 8. Hvis destructive drop: preflight kørt (§3.9)?
 
 Hvis "nej" på 4, 7 eller 8: STOP og spørg Mathias.
 
 ---
 
 ## §12 Stop-betingelser
 
 Master-plan-konflikt (men master-plan er overblik — se §8) · vision-modsigelse (LÅST) · designvalg ikke afgjort · data-tab-risiko ud over allerede afgjort · konvergens-counter rammer 5 · destructive drop uden preflight (§3.9) · inline-fix kræver ændring af fundament-infrastruktur.
 
 ---
 
 ## §13 Git-sync-disciplin
 
-`git pull origin main` før enhver session-start/review-runde. Påstande baseret på cached/forældet kopi = fabrikation. Code: pull ved hver trigger. Codex (auto): frisk på commit-trigger. Codex (manuel): pull før review. Claude.ai: kan ikke pulle — beder Mathias om commit-hash/fil-indhold ved tvivl, antager ikke fra hukommelse. Uventede commits ved pull → STOP, rapportér.
+Branch-bevidst sync før enhver session-start/review-runde: `git fetch` + verificér aktuel branch/base/remote + pull den branch arbejdet faktisk sker på (plan/build/main). `git pull origin main` er kun korrekt når arbejdet ER på main. Påstande baseret på cached/forældet kopi = fabrikation. Code: sync ved hver trigger. Codex (auto): frisk på commit-trigger. Codex (manuel): sync før review. Claude.ai: kan ikke pulle — beder Mathias om commit-hash/fil-indhold ved tvivl, antager ikke fra hukommelse. Uventede commits ved sync → STOP, rapportér.
 
 ---
 
 ## Forudsætninger før V5 er fuldt i kraft (ikke gjort endnu — ærligt)
 
 Adoption af denne fil er første skridt, ikke hele V5. Udestår:
 
 - **Docs-oprydning (Claude.ai's bord):** fold arkivet til git-history (gov-6).
 - **Master-plan (Claude.ai's bord):** afklar om Appendix C's rettelses-historik hører i planen eller i historik.
-- **Fundament + spærhager (Codes bord):** resterende CI-blocker (gov-3b-2: #10 SECDEF + #18 app-write) · branch protection (gov-4) · Codex-runner + auto-merge + plan-branch-trigger (gov-5).
+- **Fundament + spærhager (Codes bord):** branch protection (gov-4) · Codex-runner + auto-merge + plan-branch-trigger (gov-5). (gov-3 CI-blockers fuldt færdig — G065 lukket i gov-3b-3b.)
 
-Gjort i V5-adoptionen: disciplin.md = V5 · vision renset for roller · seneste-rapport-pointer rettet · skill flyttet til docs/claude-ai/ (tombstone `git rm`'et) · Appendix A 4-dim markeret superseded · LÆSEFØLGE opdateret · `codex-notify.yml` handoff-refs rettet til §9.1/§9.3. · **gov-1 (repo↔DB-paritet, PR #92 merged)** · **gov-2 (mekanisk spærhage + owns-register + §8.1 Codex-mandat + H-hjem `huskeliste.md`, PR #93 merged)** · **gov-docs-housekeeping (krav-dok-familie, PR #94 merged)** · **gov-3a (4 §3-checks #4/#7/#16/#17 + zone-§3-fjernelse, PR #95 merged)** · **gov-3b-1 (#19 FK-dækning + #6 indeks-pr-policy, PR #96 merged)**.
+Gjort i V5-adoptionen: disciplin.md = V5 · vision renset for roller · seneste-rapport-pointer rettet · skill flyttet til docs/claude-ai/ (tombstone `git rm`'et) · Appendix A 4-dim markeret superseded · LÆSEFØLGE opdateret · `codex-notify.yml` handoff-refs rettet til §9.1/§9.3. · **gov-1 (repo↔DB-paritet, PR #92 merged)** · **gov-2 (mekanisk spærhage + owns-register + §8.1 Codex-mandat + H-hjem `huskeliste.md`, PR #93 merged)** · **gov-docs-housekeeping (krav-dok-familie, PR #94 merged)** · **gov-3a (4 §3-checks #4/#7/#16/#17 + zone-§3-fjernelse, PR #95 merged)** · **gov-3b-1 (#19 FK-dækning + #6 indeks-pr-policy, PR #96 merged)** · **gov-3b-2 (#10 SECDEF-markør-disciplin, PR #101 merged)** · **gov-3b-3a (#18 del 1: 9 INVOKER→SECDEF, PR #103 merged)** · **gov-3b-3b (#18 del 2 + REVOKE + G065 LØST, PR #105 merged)**.
 
 V5 virker kun hvis erstatning faktisk sker — denne fil afløser V4, lægges ikke ved siden af.
 
 ---

exec
/bin/bash -lc "nl -ba docs/strategi/disciplin.md | sed -n '196,222p' && rg -n \"kun vision|TANKE-DATA|forretningsforstaaelse.*TANKE|forretningsforståelse.*TANKE\" docs/strategi docs/claude-ai docs/LÆSEFØLGE.md CLAUDE.md" in /home/mathias/stork-2.0
 succeeded in 0ms:
   196	
   197	## §8 Modsigelses-disciplin (genindført — differentieret efter dokument-status)
   198	
   199	Hvad en modsigelse udløser afhænger af hvilket dokument den rammer. Det forhindrer at arbejdet stopper på master-plan (som er overblik, ikke kontrakt).
   200	
   201	| Dokument                                | Status              | Modsigelse udløser                                                                                                                                                                   |
   202	| --------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
   203	| `vision-og-principper.md`               | **LÅST**            | STOP. KRITISK. Vinder over alt undtagen forretningsforstaaelse (D4: indbyrdes stamme-doc-modsigelse = hul → STOP → Mathias lukker). Dokumentér i blokker-fil, argumentér ikke videre |
   204	| `forretningsforstaaelse.md`             | **LÅST**            | STOP. KRITISK. Stamme-doc med vision (D4): modsigelse mellem de to er et hul Mathias lukker — ingen trumf                                                                            |
   205	| `stork-2-0-master-plan.md` + afgørelser | **RETNINGSGIVENDE** | Rapport til Mathias — IKKE auto-blokering. Han afgør: er rammen forældet (rettes) eller skal pakken justeres? Arbejdet stopper ikke, det venter på afgørelse                         |
   206	| krav-dok + plan (efter approval)        | **PAKKE-KONTRAKT**  | STOP. KRITISK indtil Mathias afgør re-godkendelse eller justering                                                                                                                    |
   207	
   208	Pointe: kun vision og pakke-kontrakten stopper automatisk. Master-plan-modsigelse er en trigger for en afgørelse, ikke en blokering.
   209	
   210	### §8.1 Governance-vagt (gov-2 — mekanisk lag-1 + Codex-mandat)
   211	
   212	Spærhagen der fanger governance-drift, så disciplinen ikke kun hviler på selv-tjek.
   213	
   214	**Mekanisk (lag 1 — `scripts/governance-check.mjs`, `pnpm governance:check`, CI-step):** døde doc-stier (docs + scripts), junk/lock-filer, brudte LÆSEFØLGE-/pointer-mål, **owns-unikhed** (ét begreb, ét hjem), nummer-hjem-unikhed (G/H kanonisk entry ét sted), H-ref-integritet (hver H-ref → åben entry eller historisk-kode i `huskeliste.md`). Princip: **owner = definitionshjem, ikke mention-hjem.** Hver governance-doc deklarerer sit ejerskab via en `<!-- governance-owns: … -->`-markør; scanneren fejler ved dobbelt-ejerskab. **Ærlig grænse:** fanger _deklareret_ dobbelt-ejerskab + nummer-dubletter mekanisk; _udeklareret prosa-overlap_ fanges ikke mekanisk → lag 2.
   215	
   216	**Codex-mandat (lag 2 — semantisk):** ved enhver ændring til en governance-doc (vision / disciplin / master-plan / forretningsforstaaelse / owns:-register) SKAL Codex eksplicit svare: **"modsiger dette prosa-mæssigt et begreb som en anden doc ejer?"** før merge. Det dækker den klasse scanneren ikke kan.
   217	
   218	**Stamme-doc-konsistens (D4):** ændres én af de to stamme-docs (vision / forretningsforstaaelse) SKAL ændringen eksplicit konsistens-tjekkes mod den anden. Modsigelse = hul → STOP → Mathias lukker. Ingen af de to trumfer den anden.
   219	
   220	**Fast markør:** Codex' svar gives som linjen `§8.1-SVAR: INGEN-MODSIGELSE` eller `§8.1-SVAR: MODSIGELSE — <begreb> ejes af <doc>` i reviewet, og gentages i slut-rapporten (§10.3) når pakken har berørt governance-docs — så svaret kan tjekkes i PR/rapport, ikke kun huskes i chat.
   221	
   222	**Governance-ændringer er review-artefakter:** en ændring til vision/disciplin/master-plan går gennem samme gate som kode — `governance:check` grøn + Codex' prosa-modsigelses-svar. Fraværet af netop dette gav V5's rolle-modsigelse (vision↔disciplin); §8.1 lukker den klasse.
docs/claude-ai/SKILL.md:26:- `docs/strategi/forretningsforstaaelse.md` — TANKE-DATA (Mathias' tanker)
docs/strategi/disciplin.md:208:Pointe: kun vision og pakke-kontrakten stopper automatisk. Master-plan-modsigelse er en trigger for en afgørelse, ikke en blokering.

codex
[KRITISK] Forretningsforståelse-løftet er ikke gennemført konsistent  
Konkret afvigelse: [disciplin.md](/home/mathias/stork-2.0/docs/strategi/disciplin.md:208) siger stadig “kun vision og pakke-kontrakten stopper automatisk”, selv om §8-tabellen lige ovenfor gør `forretningsforstaaelse.md` LÅST/STOP. [SKILL.md](/home/mathias/stork-2.0/docs/claude-ai/SKILL.md:26) kalder stadig samme doc “TANKE-DATA”. Det modsiger D4/krav-dok’ens løft til LÅST stamme-doc.  
Anbefalet handling: V8-rettelse.

[KRITISK] Pakke-status matcher ikke faktisk HEAD  
Konkret afvigelse: [gov-docs-renhed-status.md](/home/mathias/stork-2.0/docs/coordination/gov-docs-renhed-status.md:18) siger “Batch 4 … (denne commit)”, men HEAD er batch 5 (`2fdc9f0`). Samme Build-state mangler en Batch 5-række, selv om linje 3-5 siger batch 5 er udført og runde 7 afventer.  
Anbefalet handling: V8-rettelse.

§8.1-SVAR: MODSIGELSE — `forretningsforstaaelse.md` status/stamme-doc-stopregel er inkonsistent i aktive governance-docs.
tokens used
109,044
[KRITISK] Forretningsforståelse-løftet er ikke gennemført konsistent  
Konkret afvigelse: [disciplin.md](/home/mathias/stork-2.0/docs/strategi/disciplin.md:208) siger stadig “kun vision og pakke-kontrakten stopper automatisk”, selv om §8-tabellen lige ovenfor gør `forretningsforstaaelse.md` LÅST/STOP. [SKILL.md](/home/mathias/stork-2.0/docs/claude-ai/SKILL.md:26) kalder stadig samme doc “TANKE-DATA”. Det modsiger D4/krav-dok’ens løft til LÅST stamme-doc.  
Anbefalet handling: V8-rettelse.

[KRITISK] Pakke-status matcher ikke faktisk HEAD  
Konkret afvigelse: [gov-docs-renhed-status.md](/home/mathias/stork-2.0/docs/coordination/gov-docs-renhed-status.md:18) siger “Batch 4 … (denne commit)”, men HEAD er batch 5 (`2fdc9f0`). Samme Build-state mangler en Batch 5-række, selv om linje 3-5 siger batch 5 er udført og runde 7 afventer.  
Anbefalet handling: V8-rettelse.

§8.1-SVAR: MODSIGELSE — `forretningsforstaaelse.md` status/stamme-doc-stopregel er inkonsistent i aktive governance-docs.
