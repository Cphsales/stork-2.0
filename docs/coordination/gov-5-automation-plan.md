# gov-5-automation — Plan V8

**Branch:** claude/gov-5-automation-plan
**Krav-dok:** docs/coordination/gov-5-automation-krav-og-data.md (fornyet runde 1, Mathias-valideret 2026-06-10)
**Pakke-status:** docs/coordination/gov-5-automation-status.md
**Recon-grundlag:** docs/coordination/gov-5-automation-recon.md (PR #122)
**Plan-version:** V8 · konvergens-counter: 8 (Mathias-genåbnet 2026-06-11: PLAN-AFVIGELSE-fund under build — qwerg var givet på V7; V8 kræver Codex-review + Mathias-re-godkendelse, §8 pakke-kontrakt. V6+V7+V8 hver eksplicit Mathias-tilladt. Verdikter altid på frossen version)

## Plan-afvigelses-håndtering (Mathias-fund under build → V8)

**[KRITISK — anden krav-dok-afvigelse i samme pakke]: ACCEPT, rod + instans.** Krav 1 siger "FRA ÅBNING til lukning kører alt selv". V7's kæde startede ved krav-dok-merge — strækningen qwers → krav OK (recon-fasen) lå udenfor, så Mathias selv skulle dirigere recon med manuelle bokse. Samme glid-klasse som V4: planen holdt mod DAGENS flow (recon er manuel i dag) i stedet for formålet.

- **Instansen:** kæden starter nu ved qwers — recon er leverance-typer med routing (se Vækningsmodel + kæde-spor). Forretnings-grunden (Mathias): recon på nuværende kodes forretningsside FØR krav-dok — rettigheder, PII, lifecycle som de reelt fungerer i koden — er præcis den info krav-dokket skal stå på, særligt frem mod UI-bygning. Workflowet er rammen for HELE Stork 2.0-bygningen.
- **Roden:** "tavlen viskes ren ved HVERT kæde-led" — ny sektion "Formåls-fejning af alle kæde-led" gennemgår hvert led mod formålet og afdækker to rest-klik af samme klasse (krav-dok-merge + pakke-luk-arkiv) med [FORSLAG] til Mathias' re-godkendelse.
- **Hegn der består:** krav-dok-DIALOGEN forbliver Mathias↔Claude.ai og automatiseres ALDRIG (kontrolposten, formålets egen undtagelse). Anti-tunnelsyn 3 uændret: ingen aktør vækkes til at SKRIVE krav-dok — recon INFORMERER dialogen, fodrer den ikke. Verdikter altid på frossen version.
- **Afgrænsning:** H028/partnerskabs-runden bærer IKKE recon-transporten — H028 er kun det mekaniske G/H-opslag; runden formaliserer §9-tekst. Transporten er DENNE pakkes leverance (G/H-opslags-tabellen justeret).

**TILLÆG 1 (claude-ai-rolle-instruksen skal bære dagens gate-læringer): ACCEPT.** Step 7's instruks-indholdskrav udvidet — se Implementations-rækkefølge step 7.

**TILLÆG 2 (sikkert/frosset-snittet er hypotese): ACCEPT.** Ny sektion "B1-bevarings-verifikation (hypotese)" — Codex' V8-review skal eksplicit verificere hver påstået væknings-agnostisk B1-del under qwers-starten, FØR den bevares. (Nummerering: Mathias' "runde 8" = næste plan-runde semantisk; mekanisk navngives den runde 17 — den globale review-sekvens fortsætter, build-batch-runderne brugte 8–16.)

**TILLÆG 3 [KRITISK] (fangst-laget røg ud med qwerg): ACCEPT.** Krav 6 kræver rollernes validering uændret og altid fuld — kun HVORNÅR Mathias' klik kræves ændres. Da qwerg udgik, udgik Claude.ai's plan-mod-krav-dok-validering med — det lag fangede BEGGE pakkens afvigelser (V4: klik bevaret; V7: recon udenfor), som Codex approvede forbi begge gange (krav-troskab er forretnings-bord, ikke kode-bord). V8 genindsætter laget AUTOMATISERET som obligatorisk plan-led: **Codex APPROVAL → Claude.ai-rollen krav-troskabs-tjek (sætning for sætning per TILLÆG 1-instruksen) → PASS → build-start / FEEDBACK → Code-V\<n+1\>.** Nul Mathias-klik: krav 1 består, fangst-laget består. Ny leverance-type `troskabs-verdikt` (se Vækningsmodel); kæde-spor led 4 justeret; §9.1-rettelsen i P1 udvides (rollen er nu plan-led — V2-beslutningen fra maj om at fjerne Claude.ai fra plan-fasen omgøres ÆRLIGT i disciplin-diffen).

**TILLÆG 3-SKÆRPELSE (Mathias: leddet HÅNDHÆVES mekanisk, ikke som tekst-pligt): ACCEPT — ophøjet til generelt V8-princip.** `kaede-regler.json` får et `betingelser`-felt pr. dispatch-regel: build-dispatch har Claude.ai-PASS-leverancen som TILSTANDS-BETINGELSE — mangler filen, KAN kuréren ikke dispatche build (decide() returnerer BLOKERET m. manglende betingelse, ikke en advarsel). Generelt princip (design pkt. 11): hver regel i kæden der KAN håndhæves som tilstands-betingelse i regelbogen, SKAL — regler i tekst er det svageste lag; dagens tre fund slap alle gennem tekst-håndhævede pligter. Betingelses-fejning af alle kæde-regler: se "Regelbogs-håndhævelse". Bonus: den manuelle diff-tom-verifikation fra V7-qwerg MEKANISERES — build-betingelsen kræver at APPROVAL + PASS er bundet til SAMME frosne plan-SHA som artefaktets aktuelle; afviger den, blokeres build og ny review-runde routes.

**TILLÆG 4 (gov-6-mål + recon-form fra formålet): ACCEPT.** (1) gov-6-målekriterierne udvidet til den nye strækning — se End-to-end-test-design. (2) Recon-designet er argumenteret fra formålet, ikke fra dagens manuelle recon — se "Recon-formen (krav 9)" i Vækningsmodel: sekvensen Code+Codex parallelt → Claude.ai-rollen (med begge kode-recon-docs som input) er valgt fordi oplægget informerer dialogen bedst når det kan PEGE PÅ divergenser mellem kodens virkelighed og forretningsforståelsen — uafhængighed først (anti-tunnelsyn), syntese-blik sidst, dialog til sidst (kontrolposten).

## Kode-fund-håndtering (fra Codex V6)

- **MANGLENDE-EKSISTERENDE-BEVARELSE (P3-inversion taber /supabase/-rest + 4 værn-scripts): ACCEPT — strukturelt fix, ikke lap.** Fund-klassen ("glemt sti i positiv enumeration") ramte to gange (V5: teknisk-docs; V6: supabase-rest + scripts) — positiv enumeration af Mathias' flader er ikke sikkert vedligeholdbar. V7 vender til **default-own**: `* @mgrubak` BESTÅR; kun bogførings-fladen enumereres ejer-løst (7 mønstre, Mathias-accepteret ordret 2026-06-11). Alle V6-fundets flader dækkes af defaulten; klassen er elimineret strukturelt. 11b udvidet med værn-fil-case som krævet. P3-diffen er nu RENT ADDITIV mod eksisterende fil (M-E-B-venlig pr. konstruktion: intet eksisterende fjernes).

## Kode-fund-håndtering (fra Codex V5)

- **KRITISK (13a-dump manglede): LUKKET VED HANDLING.** Mathias-mandat givet 2026-06-11; admin READ udført (switch-back til bot straks efter, verificeret). Rå dump + eksakt diff står nu i step 13a-sektionen nedenfor.
- **MANGLENDE-EKSISTERENDE-BEVARELSE (4 governance-owned teknisk-docs uden gate i P3): ACCEPT.** `/docs/teknisk/` tilføjet P3-snittet (dækker teknisk-gaeld, huskeliste, permission-matrix, cutover-checklist — alle governance-owns). Konservativt: hele mappen, ved tvivl er det hans.
- **MELLEM (prefix-state stale): ACCEPT.** Krav-dok-prefixet ER fornyet (verificeret på disk + i historik); Formål-blokken nedenfor er synket 1:1, format-punktet fjernet fra åbne punkter. Proces-note: fornyelsen røg med i V5-commit'en via bredt `git add` uden egen ordret-deklaration — rapporteret til Mathias som levende argument for transport-commit-designet (ordret + deklareret).

## Fund-håndtering (fra Claude.ai-gate-FEEDBACK på V4, leveret via Mathias)

- **KRITISK 1 (formåls-afvigelse — Mathias' flade): ACCEPT.** V4 holdt planen mod nuværende flow; formålet + krav 2 definerer fladen udtømmende, og krav 6 siger ordret at det er _hvornår Mathias' klik kræves_ der ændres. V5 leverer formålets flade: qwerg og build-PR-approve UDGÅR som ubetingede Mathias-led; plan og byg valideres af rollerne; Mathias kaldes ved fund der er hans + ved ændringer af hans beslutnings-flader (se Mathias-flade-modellen). P1 omfatter nu disciplinens gate-model (krav 6-leverancen). Ingen krav-doc-feedback rejses — Code ser ingen teknisk grund mod formålet; selv-modifikations-risikoen (kæden ændrer egne værn) håndteres ved at værn-stierne ER en afgørelse der er hans (beslutnings-CODEOWNERS).
- **KRITISK 2 (krav 5 ikke fuldt realiseret): ACCEPT.** Vækningsmodellen omdesignet: §5-mekanismerne (SPARRING-OENSKE, FLAG→LØS-replikker, KODE-FUND-deling, OPTIMERING-FORSLAG) får filbårne formater med routing — aktør-til-aktør spørgsmål/svar MID-FASE, fund deles når de findes (ikke ved runde-grænser), ping/pong i ventevinduer. Se Vækningsmodel.
- **KRITISK 3 (kun dirigenten vækker, kun ved fase-skift): ACCEPT.** Vækningsretten flyttet til aktørerne: hver leverance bærer en `→NÆSTE:`-deklaration (eller routes af sin type); dirigenten er kurér, ikke vækker — den har ingen egen dagsorden, kun aktørernes deklarationer + kalender-poll. Se Vækningsmodel.
- **MELLEM 1 (intro "én kørsel ad gangen" vs. parallel-dispatch): ACCEPT.** Rettet: dirigenten kører flere samtidige aktør-kørsler — lås pr. aktør pr. spor (én Codex-kørsel ad gangen pr. spor; Code og Codex samtidig er normal-tilstand), ikke global lås.
- **MELLEM 2 (krav 9-begrundelse tynd på systemd + headless): ACCEPT.** Begrundelser mod alternativer tilføjet + verificér-før-tillid-markører. Se Design-valg-begrundelser.

## Kode-fund-håndtering (fra Codex V1–V3 — alle lukket, Codex APPROVAL på V4)

- **V1-KRITISK 1 (CODEOWNERS-mekanik ubevist):** ACCEPT → mekanik-citat + bevis-step 11b (test-PR, gov-4 #111-mønster). Består i V5 (snittet er inverteret, beviset samme mønster — nu to test-cases: ejet sti kræver klik, u-ejet merger på grøn CI).
- **V1-KRITISK 2 + V2-KRITISK 2 (protection-state):** ACCEPT → 13a-dump (MATHIAS-MANDAT, uændret afventende); bevarelsesliste er forventninger, dump er sandhed.
- **V1-MELLEM (Forudsætninger stale):** ACCEPT → P5.
- **V2-KRITISK 1 + V3-KRITISK 1 (commit-ansvar):** ACCEPT → transport-commit (design pkt. 10), fejet konsistent.
- **V2-KRITISK 3 (systemd Linger=no):** ACCEPT → step 10-preflight; nu også begrundet mod alternativer (MELLEM 2).

## Mathias-vagter indarbejdet (2026-06-10, efter V1)

1. **Split (§3.8):** egen analyse — afgjort af leverance-kæden. Re-vurderet i V5 (se Split-analyse).
2. **Dokument-opdatering er leverance:** hver tekst pakken forælder rettes i pakken — nu inkl. disciplinens gate-model (P1 udvidet).
3. **Rolle-linjer + anti-tunnelsyn:** ansvars-tabel + divergens-STOP + ingen kæde-vej ind i krav-dok.

## Formål

> Denne pakke leverer: workflowet kørende automatisk fra start til slut — Mathias åbner, og Mathias lukker. Undervejs har han én fast kontrolpost — krav-dokket, forretningen, som kun han kan validere. Plan og byg valideres af rollerne; Mathias kaldes kun ind når der findes en afgørelse der er hans. Det vi bygger er grundstenen under alle fremtidige Stork 2.0-pakker, og målet er klart: sammen kan vi opnå greatness.

(1:1 fra krav-dok §Formål — prefix-fornyet version, synket i V6.)

## Mathias-flade-modellen (formåls-tro — KRITISK 1-leverancen)

**Ubetingede Mathias-led (udtømmende, fra formål + krav 2):**

| Led                 | Flade                                                            |
| ------------------- | ---------------------------------------------------------------- |
| Åbning              | qwers-udmelding (chat eller kæde-issue fra mobil)                |
| Krav-dok-validering | krav OK i krav-dok-dialogen (Claude.ai-chatten — uden for kæden) |
| Lukning             | slut OK efter Claude.ai-rolle-review af slut-rapport             |

**Betingede Mathias-led (kun når afgørelsen er hans):**

| Trigger                                                           | Mekanik                                                                                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| NEEDS-MATHIAS / ESCALATE / iter>3 / halt-markers (§5, §6.1, §6.3) | Fund-gate: gate-fil + kæde-issue-anmodning m. @mgrubak → mobil; kæden pauser sporet                           |
| Plan-afvigelse / formåls-tvivl / krav-doc-feedback                | Samme fund-gate-mekanik                                                                                       |
| PR der rører hans beslutnings-stier (værn, governance, identitet) | Code-owner-review-krav → GitHub Mobile push → hans klik. Det ER afgørelsen — værn-ændringer er hans pr. natur |
| Konvergens-counter 4/5/6 (§3.4)                                   | Alert/pause/STOP til hans flade                                                                               |

**UDGÅR som ubetingede led:** qwerg (Mathias' læsning var transport af tillid han ikke teknisk kan validere — formålet flytter den til fund-gates) · build-PR-approve (byg valideres af rollerne: Codex per-batch + final + grøn CI; merge på rolle-validering, medmindre beslutnings-stier røres eller fund er åbne). **V8-rettelse (TILLÆG 3):** plan-godkendelse er IKKE længere Codex alene — fuld rolle-validering er Codex-APPROVAL (kode-bord) + Claude.ai-rollens krav-troskabs-PASS (forretnings-bord). Fangst-laget der fangede V4- og V7-afvigelserne består — automatiseret, nul Mathias-klik.

**Suverænitet uændret:** Mathias kan altid gribe ind, stoppe, omgøre — fladen ovenfor er hvad kæden KRÆVER af ham, ikke hvad den tillader ham.

**Overgangs-klarhed:** gov-5 selv bygges under NUVÆRENDE disciplin (qwerg + approvals gælder for denne plan). Den nye flade aktiveres ved pakkens leverance (P1-disciplin-rettelse + B4-protection/CODEOWNERS) og bevises i gov-6 (krav 8). Mathias' qwerg på DENNE plan er samtidig hans ratificering af den nye gate-model og beslutnings-sti-snittet.

## Vækningsmodel (KRITISK 2+3-leverancen — krav 1 + 5)

**Vækningsretten ligger hos aktørerne.** Hver aktør-leverance er en fil med en afsluttende deklaration `→NÆSTE: <aktør> [<leverance-type>]` (eller falder tilbage til sin types default-routing i kaede-regler.json). Dirigenten er **kurér**: den transport-committer leverancen ordret, læser deklarationen/typen og dispatcher modtageren med pointer. Den vækker aldrig af egen dagsorden — kun aktør-deklarationer + kalender-poll (opsamling af eksterne events: merges, checks, Mathias-gate-ord).

**Leverance-typer med routing (alle §5-mekanismer bæres — mid-fase, ikke kun fase-skift):**

| Type                                                                                                         | Afsender → modtager                             | Hvornår                                                      |
| ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------ |
| plan-V\<n\> / build-batch / slut-rapport                                                                     | Code → Codex                                    | fase-arbejde (uændret)                                       |
| review/feedback/APPROVAL                                                                                     | Codex → Code                                    | reviews (uændret)                                            |
| SPARRING-OENSKE → CONFIRM/TIMING/AVOID                                                                       | Code ⇄ Codex                                    | **mid-fase**, når spørgsmålet opstår                         |
| FLAG→LØS-replik (ACCEPT/PUSHBACK/PROPOSE-ALTERNATIVE ⇄ AGREE/REFINE/ESCALATE)                                | Code ⇄ Codex                                    | **pr. fund løbende** — max 3 iter, så fund-gate (§5 uændret) |
| KODE-FUND-deling (research)                                                                                  | Codex → Code                                    | **når fundet gøres** — ikke ved runde-grænse                 |
| OPTIMERING-FORSLAG → ADOPT/DEFER/DISMISS                                                                     | Codex ⇄ Code                                    | build, løbende                                               |
| qwerg-gate-pakke → fund-gate-pakke (§9.1-rettelse i P1)                                                      | Claude.ai-rolle → Mathias                       | ved fund-gates + slut OK                                     |
| **recon-kode-doc (V8)** — nuværende kodes forretningsside: rettigheder, PII, lifecycle som de reelt fungerer | Code → repo (transport-commit) → Mathias-flade  | **ved qwers** — kæde-start                                   |
| **recon-research-doc (V8)** — uafhængig kode-recon (blind-vinkler, teknisk realiserbarhed)                   | Codex → repo (transport-commit) → Mathias-flade | **ved qwers** — parallel m. Codes                            |
| **recon-oplaeg (V8)** — forretningsdata-oplæg TIL MATHIAS (informerer dialogen, fodrer ikke krav-dok)        | Claude.ai-rolle → Mathias                       | **ved qwers** — parallel                                     |
| gate-ord / GODKENDT / AFVIST / stop                                                                          | Mathias → kæden                                 | author-verificeret, enhver tid                               |

| **troskabs-verdikt (V8, TILLÆG 3)** — krav-troskabs-tjek af Codex-approvet plan: PASS/FEEDBACK | Claude.ai-rolle → kæden (PASS → Code build-start · FEEDBACK → Code V\<n+1\>) | **obligatorisk efter Codex-APPROVAL**, før build |

**Kæde-start (V8, Mathias-fund) — Recon-formen (krav 9, fra formålet):** qwers-eventet IGANGSÆTTER kæden. Sekvens: (1) Code + Codex dispatches PARALLELT — to uafhængige blikke på nuværende kode (Codes: forretningssiden — rettigheder, PII, lifecycle som de reelt fungerer; Codex': teknisk realiserbarhed + blind-vinkler). Uafhængigheden er begrundet i anti-tunnelsyn: divergens mellem de to synliggør blinde vinkler. (2) Når begge recon-docs er transport-committet → Claude.ai-rollen dispatches med forretningsdata + BEGGE docs som input → recon-oplaeg TIL MATHIAS, der kan pege på hvor kodens virkelighed og forretningsforståelsen divergerer (syntese-blik sidst — derfor sekventielt, ikke fordi recon "plejer" at køre sådan). (3) `recon-klar` → Mathias notificeres (mobil): krav-dok-DIALOGEN (Mathias↔Claude.ai, Windows-appen) begynder — kontrolposten, automatiseres ALDRIG. Kæden venter på krav OK/krav-dok-merge. Hegn: ingen routing-regel producerer krav-dok-indhold (anti-tunnelsyn 3); recon-leverancer er INPUT til dialogen, ikke til krav-dok-filen.

**Ventevinduer (krav 5):** mens Codex reviewer V\<n\>, er Code IKKE i tomgang: dirigenten dispatcher Codes deklarerede vente-opgaver (fx svar på åbne SPARRING/LØS-tråde, forberedelse af næste batch) — kun opgaver AKTØREN selv har deklareret som næste; kuréren finder ikke på arbejde. Parallel-kørsel: lås pr. aktør pr. spor — Code og Codex kører samtidig som normal-tilstand; to samtidige Codex-kørsler på samme spor er forbudt (verdikt på frossen version: hver review-dispatch binder til plan-SHA, og ny V\<n\> invaliderer ikke en igangværende review — den køber næste runde).

## Design-valg-begrundelser (MELLEM 2 — krav 9: formålet mod alternativer)

- **systemd-user-unit** vs. alternativer: cron (ingen long-running proces, ingen restart-semantik — polling-kurér er en proces, ikke et job) · nohup/terminal-proces (dør med session, intet selvhelende Restart=on-failure — bryder "ingen venter på Mathias" når processen dør stille) · pm2 (ekstra dependency + endnu en daemon at drifte; systemd ER der allerede). systemd vinder på: deklarativ unit, journald-log (auditerbar transport), Restart=on-failure, ingen nye dependencies. **Verificér-før-tillid:** Linger=no-fundet (Codex V2) består — step 10-preflight beviser hosting før kæden får tillid; fallback krav 7.
- **`claude -p` headless** vs. alternativer: Agent SDK (mere kode for samme model-adgang; ny kodebase at vedligeholde) · rå API (mister tool-harness — fil-adgang, git, gh — som rollerne kræver) · stående interaktiv session (kan ikke dispatches deterministisk; tilstand lækker mellem kørsler). `claude -p` vinder på: genbruger eksisterende lokal auth + tool-adgang + rolle-instruks pr. kørsel, frisk kontekst pr. dispatch (anti-tunnelsyn 1). **Verificér-før-tillid:** step 9 dry-run beviser auth-kontekst + leverance-format før tillid.
- **Polling-kurér** (begrundet i V2, består): webhooks kræver offentlig tunnel ind på Mathias' maskine — afvist (angrebs-flade); 60s-latens irrelevant mod kørslers minutter.

## Split-analyse (§3.8 + vagt 1 — re-vurderet i V5)

**Kandidat-snit:** A) kæde-kerne (kurér + routing + adapters + tests + systemd) · B) Mathias-flade (kæde-issue + author-verifikation + notifikation) · C) gate-model-ændringen (disciplin P1 + CODEOWNERS-inversion + protection) · D) dokument-leverancen.

**Analyse:** A+B fortsat udelelig (kurér uden Mathias-flade kan ikke køre fund-gates). V5 GØR C tungere (gate-model-ændring i disciplin er nu del af C) — re-vurdering: C er stadig 3 steps + docs-diff, men dens natur er ændret: den er nu PRIMÆRT en disciplin-/CODEOWNERS-leverance hvis apply (B4/B5) ligger EFTER kæde-kernen er bevist i dry-run (step 9). Et C-split ville give: gov-5a leverer kæden under gamle gates (qwerg består) → gov-5b leverer gate-modellen → gov-6 beviser. Mod-argument (vægtigst): formålet er ÉN helhed — "Mathias kaldes kun ind ved fund" er ikke leveret før C er leveret; gov-6-beviset (krav 8) skal køre den FULDE flade. To pakker = to slut OK + dobbelt overgangs-tilstand i disciplinen (gamle gates i 5a-perioden, nye i 5b) = mere stale-risiko (vagt 2), ikke mindre. **Konklusion: fortsat ÉN pakke.** B4/B5-rækkefølgen giver allerede C-isolation (apply efter kerne-bevis). Revisit-trigger består: flagger Codex V5-review reviewability-problemer, splittes C ud.

## Verificerede DB-objekter (§3.2)

**Ingen DB-objekter berøres.** 0 migrations, 0 RPC'er, 0 policies, 0 grants — implementations-rækkefølgen indeholder ingen SQL-filer. (Supabase-MCP-dump bevidst udeladt — ingen objekter at dumpe for.)

## G/H-opslag (§3.2)

| G/H                          | Løses-i                    | Håndtering                                                                                                                                                                                                                                     |
| ---------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [H028] mekanisk G/H-opslag   | gov-5 / partnerskabs-runde | **V8-præcisering (Mathias):** H028 er KUN det mekaniske G/H-opslag (udskudt til partnerskabs-runden, som også formaliserer §9-tekst). Recon-TRANSPORTEN (qwers → recon-leverancer → dialog) er DENNE pakkes leverance — den bæres ikke af H028 |
| [G062] recurring types-drift | —                          | Bevidst udskudt — ikke kæde-transport                                                                                                                                                                                                          |
| [H029] tekst-staleness       | pakke efter gov-6          | Udskudt (Mathias-besluttet); gov-5 retter selv alt den forælder (Dokument-currency)                                                                                                                                                            |
| H012/G039, H025, G063        | —                          | Rammer ikke automation-scope                                                                                                                                                                                                                   |

## Verificerede afhængigheder

| Reference                                                                                                               | Defineret i                                      | Linje               | Brug i denne plan                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| §2-flow + gate-linje ("Tre gates kræver Mathias: krav OK, qwerg, slut OK")                                              | docs/strategi/disciplin.md                       | 32–46               | P1: gate-model rettes (formåls-flade)                                                                                      |
| §2 Step 3 (qwerg) + fundament-validering                                                                                | docs/strategi/disciplin.md                       | 67–71               | P1: Step 3 → rolle-godkendelse + fund-gates; fundament-validering BESTÅR uændret (flyttes til Codex-APPROVAL-forudsætning) |
| §9.1 qwerg-gate-pakke · §9.2 qwerg-trigger · §10.2 doc-currency-skabelon                                                | docs/strategi/disciplin.md                       | 253 / 265 / 354+358 | P1: gate-pakke → fund-gate-pakke; trigger-rettelse; skabelon-rettelse. Fuld qwerg-grep i B5-fejning                        |
| §2-automation-note · §6.2                                                                                               | docs/strategi/disciplin.md                       | 48 / 178–180        | P1/P2: dirigent-virkelighed (uændret fra V2)                                                                               |
| Forudsætninger-afsnit                                                                                                   | docs/strategi/disciplin.md                       | 476–484             | P5 (uændret)                                                                                                               |
| §9.1/§9.2/§9.3 rolle-hjem                                                                                               | docs/strategi/disciplin.md                       | 246/260/268         | Adapter-instrukser genbruger rollernes §9-sektioner                                                                        |
| §5 severities + FLAG→LØS + positive markers                                                                             | docs/strategi/disciplin.md                       | 150–168             | Vækningsmodellens leverance-typer er §5-mekanismerne filbårne — ingen nye severities opfindes                              |
| CODEOWNERS (nuværende: `* @mgrubak` + 4 strategi-linjer)                                                                | .github/CODEOWNERS                               | 1–22                | P3 INVERTERET: beslutnings-stier ejes eksplicit (se P3)                                                                    |
| codex-review.sh (dispatch, marker-parser, exit 0–4, plan-SHA i output-header, `--parse-test`)                           | scripts/codex-review.sh                          | 1–60, 200–247       | Codex-adapter + docs-fase (P4); plan-SHA-header = frossen-version-bevis                                                    |
| ci.yml (pull_request u. draft-eksklusion) · migrations-deploy.yml · governance-check structural-chain                   | .github/workflows + scripts/governance-check.mjs | —                   | Uændret / markør-flip post-godkendelse                                                                                     |
| Lokalt værktøj (claude 2.1.172, codex 0.137.0, gh 2.45.0 bot-aktiv, node 24, systemd `running` i session MEN Linger=no) | —                                                | —                   | Hosting mulig MED step 10-preflight                                                                                        |
| Merge-konvention (mgrubak-approval er gaten; Code armerer auto-merge)                                                   | CLAUDE.md + disciplin:48                         | —                   | BESTÅR for beslutnings-sti-PR'er; rolle-validerede PR'er merger på grøn CI (ny gate-model, P1+13b)                         |

## Design (krav 9: tavlen visket ren — formålet afgør)

**Kæde-kuréren** (`scripts/kaede/dirigent.mjs` + `scripts/kaede/adapters/`): lokal systemd-user-proces; poll-cyklus (60s) læser tilstand (git fetch + gh api) og eksekverer **aktørernes vækninger** (leverance-deklarationer/typer → routing) + opsamler eksterne events (merges, checks, Mathias-ord). Flere samtidige aktør-kørsler; lås pr. aktør pr. spor.

1. **Tilstandslæsning, ikke besked-kø** — crash/stop mister intet; stop = manuelt flow (krav 7 strukturelt).
2. **Polling, ikke webhooks** — begrundet i Design-valg-begrundelser.
3. **Transport-renhed (krav 6):** kuréren læser KUN tilstands-felter + leverance-DEKLARATIONER (sidste `→NÆSTE:`-linje / fil-type) — aldrig leverance-indhold i øvrigt. Routing deklarativ i `kaede-regler.json`.
4. **Dømmekraft bor i aktørerne:** adapters kører rollens §9-instruks; severities/FLAG→LØS/fuldstyrke uændret.
5. **Kvalitet pr. led (krav 4):** marker-/exit-parse pr. leverance: KRITISK → næste runde samme spor · NEEDS-MATHIAS/ESCALATE/halt → fund-gate + spor-pause · parse-fejl/ukendt deklaration → kæde-STOP + notifikation + manuelt flow. Fejl transporteres aldrig videre.
6. **Mathias' flade:** kæde-issue pr. pakke (gate-anmodninger m. @mgrubak-mention → mobil-push; gate-ord KUN fra author `mgrubak`); beslutnings-sti-PR'er → review-request → mobil. Åbning fra mobil: qwers-kommentar på stående issue.
7. **Klik kun på beslutninger:** Mathias-flade-modellen + P3-inversion + 13b.
8. **Spille hinanden bedre (krav 5):** Vækningsmodellens mid-fase-typer + ventevindue-dispatch.
9. **Suverænitet:** "stop" (enhver læst kanal) → øjeblikkelig pause; kæde-tilstand synlig i issuet.
10. **Transport-commit:** al aktør-leverance-commit sker i kurérens transport-commit — ordret, logget, aldrig eget/redigeret indhold. Codex read-only; Claude.ai-rollen docs-lag (untracked → transport-commit); Code committer egne leverancer.
11. **Regelbogs-håndhævelse (V8, TILLÆG 3-skærpelse):** hver kæde-regel der KAN udtrykkes som tilstands-betingelse i `kaede-regler.json`, SKAL — tekst-pligter er svageste lag. Dispatch-regler bærer `betingelser` (krævede leverancer/tilstande, SHA-bundne); decide() kan ikke dispatche når en betingelse mangler — den returnerer BLOKERET med den manglende betingelse navngivet (logget, synligt i kæde-issue). Betingelses-fejningen: **build-start** kræver Codex-APPROVAL + troskabs-PASS, begge bundet til plan-filens AKTUELLE SHA (mekaniseret diff-tom-tjek — V7-qwergs manuelle verifikation) + ingen åbne fund-gates · **slut-merge** kræver Claude.ai-APPROVAL-leverance + author-verificeret slut OK · **recon-klar** kræver alle tre recon-leverancer · **claude-ai-syntese-dispatch** kræver begge kode-recon-docs. Strukturelt håndhævet (ingen regel = ingen vej): krav-dok-skrivning kan ikke dispatches. GitHub-håndhævet: grøn CI, code-owner-review på beslutnings-stier.

**Claude.ai-rollen lokalt (krav 1):** `claude -p` m. §9.1-instruks for vækbare leverancer: slut-rapport-review + fund-gate-pakker (P1-rettelsen: gate-pakke-leverancen følger fund-gates + slut OK). Untracked output → transport-commit. Windows-appen urørt til Mathias-dialog.

### Rolle- og ansvars-linjer (vagt 3)

| Komponent               | Identitet                  | MÅ                                                                                                                                                       | MÅ ALDRIG                                                                                                                                                       |
| ----------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kurér (dirigent)        | stork-code-bot             | Læse tilstand + deklarationer; dispatche pr. routing; transport-committe ordret (logget); poste kæde-issue; re-requeste reviews på beslutnings-sti-PR'er | Generere/redigere leverance-indhold; vurdere indhold; vække af egen dagsorden; røre protection/admin; merge beslutnings-sti-PR'er; dispatche krav-dok-skrivning |
| Code-adapter            | Code (§9.2)                | Fuld rolle headless                                                                                                                                      | Overskride §9.2; fortsætte forbi STOP uden gate-fil                                                                                                             |
| Codex-adapter           | Codex (§9.3), read-only    | Review + research + §5-replikker                                                                                                                         | Skrive kode; committe (transport-commit bærer output)                                                                                                           |
| Claude.ai-rolle-adapter | Claude.ai (§9.1), docs-lag | Slut-rapport-review; fund-gate-pakker                                                                                                                    | Kode-vurdering; datamodel; committe; skrive krav-dok (vækkes ALDRIG dertil)                                                                                     |
| Mathias-adapter         | bot poster; mgrubak afgør  | Notifikation + ordret gate-ord-aflæsning m. author-verifikation                                                                                          | Tolke/sammenfatte; acceptere gate-ord fra andre                                                                                                                 |

### Anti-tunnelsyn-mekanismer (vagt 3)

1. Frisk tilstand hver cyklus — ingen cached antagelser; frisk kontekst pr. aktør-kørsel.
2. Divergens-STOP (én sandhed): uenige kilder → intet dispatches; STOP + notifikation m. begge værdier.
3. Ingen antagelses-vej ind i krav-dok: ingen routing-regel producerer krav-dok-indhold — Step 0/1 er dialog (Microsoft-casen, Mathias 2026-06-10, kan ikke opstå).
4. Kilde-pligt nedarves uændret (fabrikations-STOP §9.2, fuldstyrke §9.3, kilde-pligt §9.1).
5. Dispatch-log: tilstand → regel/deklaration → handling; gov-6 leverer loggen som bevis.

## End-to-end-spor (§3.3-tilpasset: kæde-spor, gov-6 som case — NY GATE-MODEL)

1. Mathias: "qwers gov-6-arkiv-fold" (mobil, author-verificeret) → **kæden IGANGSÆTTES (V8)**: Code + Codex recon-kørsler PARALLELT (kodens forretningsside → recon-kode-doc · uafhængig kode-recon → recon-research-doc; begge transport-committes)
   1b. Begge kode-recon-docs klar → Claude.ai-rollen dispatches (forretningsdata + begge docs) → recon-oplaeg til Mathias → `recon-klar` → Mathias notificeres (mobil) → krav-dok-DIALOG Mathias↔Claude.ai (kontrolposten — ALDRIG automatiseret; recon informerer, fodrer ikke). Kæden venter på krav OK
2. Krav-dok merged → Code-plan + Codex-research dispatches parallelt; mid-fase: SPARRING/KODE-FUND-filer routes løbende begge veje
3. Code committer plan-V\<n\> (`→NÆSTE: Codex [review]`) → Codex-review (frossen V\<n\>, plan-SHA i header)
4. Codex APPROVAL (+ INGEN NYE FUND) → **Claude.ai-rollen: krav-troskabs-tjek (V8, TILLÆG 3 — sætning for sætning mod krav-dok)** → PASS → **build starter automatisk** (qwerg udgået, fangst-laget består) · FEEDBACK → Code-V\<n+1\>; åbne fund-gates blokerer fortsat (fund-gate-pakke → Mathias afgør fra mobil)
5. Build: batches; Codex per-batch parallelt; §5-replikker løbende; fund-der-er-hans → fund-gate
6. Build-PR (ingen beslutnings-stier, ingen åbne fund) → grøn CI + Codex final → **merger på rolle-validering** (auto-merge armeret). Rører PR'en beslutnings-stier → mgrubak-review-request → hans klik (afgørelsen er hans)
7. Merge → Code-slut-rapport → Claude.ai-rolle-review → APPROVAL → **"slut OK"-gate (mobil)** → merge (lukning — Mathias lukker, formålet)
8. Hvert led: marker-/exit-parse; brud → spor-pause + notifikation + manuelt flow

## Implementations-rækkefølge

| Step | Type             | Hvad                                                                                                                                                                                                                                                                                     | Eksakt indhold                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Afh.                | Risiko                                           |
| ---- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------ |
| 1    | Node             | `scripts/kaede/tilstand.mjs`                                                                                                                                                                                                                                                             | Tilstandslæser (read-only) inkl. kilde-par til divergens-tjek + leverance-deklarations-læsning (`→NÆSTE:`-linje + fil-type)                                                                                                                                                                                                                                                                                                                                                                                                                                 | gh bot              | Lav                                              |
| 2    | JSON+Node        | `kaede-regler.json` + `dirigent.mjs`                                                                                                                                                                                                                                                     | Leverance-type→modtager-routing (vækningsmodellen) + kalender-poll-events + multi-kørsel m. lås pr. aktør/spor + transport-commit + dispatch-log + divergens-STOP                                                                                                                                                                                                                                                                                                                                                                                           | 1                   | Mellem — kernen; fixtures (3)                    |
| 3    | Tests            | `dirigent.test.mjs`                                                                                                                                                                                                                                                                      | Fixtures: alle leverance-typer + routing + mid-fase-tråde + author-tjek + divergens + STOP-ruter + lås-semantik + frossen-SHA-binding                                                                                                                                                                                                                                                                                                                                                                                                                       | 2                   | Lav                                              |
| 4    | Shell            | codex-review.sh `--phase=docs`                                                                                                                                                                                                                                                           | P4 (uændret fra V2)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —                   | Lav                                              |
| 5    | Adapter          | `adapters/codex.sh`                                                                                                                                                                                                                                                                      | Fase-/type-valg → codex-review.sh → output m. deklaration → transport-commit → exit-kode                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 2,4                 | Lav                                              |
| 6    | Adapter          | `adapters/code.sh`                                                                                                                                                                                                                                                                       | `claude -p` headless m. qwerr-ækvivalent + §5-replik-opgaver; deklarations-pligt i output                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 2                   | Mellem — STOP-dækning; dry-run før tillid        |
| 7    | Adapter          | `adapters/claude-ai-rolle.sh` + `scripts/kaede/claude-ai-rolle-instruks.md`                                                                                                                                                                                                              | `claude -p` m. §9.1-instruks — FIRE leverancer (V8): slut-rapport-review · fund-gate-pakker · recon-oplaeg · krav-troskabs-tjek (TILLÆG 3). **Instruksen SKAL bære gate-læringerne (TILLÆG 1):** krav-dok læses SÆTNING FOR SÆTNING mod planen; formålet læses FØRST og gate-spørgsmålet er "er formålet opnået?"; kravets MENING, ikke ord-match; leverancen DEKLARERER sit grundlag (egen læsning vs. rollernes verdikt); ALDRIG fuldstændigheds-garantier — kun "hvad er holdt mod hvad"; stikprøver flages som stikprøver. Untracked → transport-commit | 2                   | Mellem — rolle-renhed i instruks + Codex tjekker |
| 8    | Adapter          | `adapters/mathias.mjs`                                                                                                                                                                                                                                                                   | Kæde-issue: gate-anmodninger, author-verifikation, review-re-request på beslutnings-stier                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 1                   | Lav                                              |
| 9    | Integration      | `--dry-run` + ét live led (Codex --quick på test-branch) + headless-auth-bevis                                                                                                                                                                                                           | Dispatch-log mod forventet; verificér-før-tillid (MELLEM 2)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 1–8                 | Lav                                              |
| 10   | systemd          | `stork-kaede.service` + preflight (linger-tjek, `loginctl enable-linger`, env-krav)                                                                                                                                                                                                      | Begrundet mod alternativer (Design-valg); Restart=on-failure; stop = manuelt flow                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 9                   | Mellem                                           |
| 11   | CODEOWNERS       | P3-inversion                                                                                                                                                                                                                                                                             | Beslutnings-stier ejes eksplicit (eksakt diff i P3)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —                   | Mellem — 11b beviser                             |
| 11b  | Bevis            | TRE test-PR'er: (a) rører governance-doc (docs/strategi) → forvent review-krav; (b) rører tidligere-default VÆRN-fil (scripts/migration-gate.mjs el. supabase/config.toml, Codex V6-krav) → forvent review-krav; (c) rører kun bogførings-sti (aktiv-plan.md) → forvent merge på grøn CI | gov-4 #111-mønster; fejl → P3-rollback + STOP-gate                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 11,13               | Lav                                              |
| 12   | Docs             | Dokument-currency-leverancen (P1+P2+P5 + grep-fejning inkl. "qwerg")                                                                                                                                                                                                                     | §8.1-gate; eksakte diffs i Patch-først                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | build               | Lav                                              |
| 13a  | Protection-dump  | **UDFØRT 2026-06-11 (Mathias-mandat)** — rå dump + verifikation + eksakt diff: se "Step 13a"-sektionen; alle gov-4-forventninger verificeret sande                                                                                                                                       | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | mandat              | Lav                                              |
| 13b  | Protection-apply | 13a-diff: approvals→0; code-owner-review BESTÅR (bærer beslutnings-stierne); required CI BESTÅR; admin kun på mandat, switch-back straks; verificeret af 11b                                                                                                                             | 13a + plan-godkendelse                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Mellem — gate-flade |
| 14   | Docs             | aktiv-plan markør-flip + status                                                                                                                                                                                                                                                          | Doc-currency B                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | godkendelse         | Lav                                              |

**Skitse-størrelse:** 0 migrations. Batches: B1=1–3 · B2=4–7 · B3=8–9 · B4=10–11+13 · B5=12+14+11b. Per-batch Codex-review.

## Dokument-currency-leverance (vagt 2)

| Tekst                                                                                                                                                                                                    | Fil:linje                      | Handling                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------- |
| §2-flow + gate-linje + Step 3 (qwerg)                                                                                                                                                                    | disciplin.md:32–46, 67–71      | **P1 (udvidet i V5):** gate-model → formåls-flade                                            |
| §9.1 qwerg-gate-pakke · §9.2 qwerg-trigger · §10.2-skabelon                                                                                                                                              | disciplin.md:253, 265, 354+358 | P1: fund-gate-pakke / trigger-rettelse / skabelon                                            |
| §2-automation-note · §6.2                                                                                                                                                                                | disciplin.md:48, 178–180       | P1/P2: dirigent-virkelighed                                                                  |
| Forudsætninger                                                                                                                                                                                           | disciplin.md:476–484           | P5                                                                                           |
| CLAUDE.md merge-konvention                                                                                                                                                                               | CLAUDE.md                      | Rettes: konvention gælder beslutnings-sti-PR'er; rolle-validerede merger på grøn CI (P6, NY) |
| codex-review.sh header                                                                                                                                                                                   | scripts/codex-review.sh:4–12   | P4                                                                                           |
| **Grep-fejning (B5):** `grep -ri "qwerg\|notify\|runner\|manuel dispatch\|mål-tilstand\|skal bygges\|tre gates" docs/ scripts/ CLAUDE.md README.md` — hvert hit klassificeres: rettes / sand / historisk | alle aktive docs               | Vagt 2: maskinen må aldrig validere mod en løgn                                              |

## Patch-først pr. ændret fil (§3.1)

**P1 — disciplin.md gate-model (UDVIDET i V5).** Nuværende §2-gate-linje 1:1 (linje 46): "Tre gates kræver Mathias: `krav OK`, `qwerg`, `slut OK`. Trin 2 og 4 er hvor det meste arbejde sker." + flow-diagram (linje 32–44, trin 3 = "qwerg approval (Mathias) ← gate: qwerg") + Step 3-afsnit 1:1 (linje 67–71, citeret i Verificerede afhængigheder). DIFF: trin 3 → "Rolle-godkendelse (Codex-APPROVAL; fund-gates til Mathias ved NEEDS-MATHIAS m.v.)"; gate-linjen → "To ubetingede Mathias-gates: `krav OK`, `slut OK`. Betingede fund-gates + beslutnings-sti-review når afgørelsen er hans (Mathias-flade-modellen, gov-5)."; Step 3-afsnit omskrives (qwerg-mekanik → fund-gate-mekanik). **BEVARES:** fundament-valideringen (§2 Step 3-forudsætningen) ordret — flyttes til Codex-APPROVAL-forudsætning, ingen svækkelse; §9.1-gate-hjælpens substans (gate-pakke-format) — retarget til fund-gates + slut OK; konvergens-trappen §3.4 uændret. Også §2-automation-note (linje 48, verbatim i V2-P1) → dirigent-virkelighed. §8.1-gate + Codex prosa-svar obligatorisk; **Mathias' qwerg på denne plan ratificerer modellen — disciplin-diffen committes ordret derefter.**

**P2 — disciplin.md:178–180 (§6.2).** Verbatim + diff uændret fra V2 (notify-only → kæde-beskrivelse; migrations-deploy-sætning + arve-reference bevares).

**P3 — .github/CODEOWNERS (STRUKTURELT REDESIGNET i V7 efter Codex V6-M-E-B — Mathias-accepteret 2026-06-11).** Nuværende 1:1 (22 linjer, header + `* @mgrubak` + 4 strategi-linjer + 3 udkommenterede lag-B). DIFF: **`* @mgrubak` BESTÅR** (default-own: alt nyt og alt uopremset er hans — fund-klassen "glemt sti" kan strukturelt ikke opstå); KUN den rolle-validerede bogførings-flade enumereres som ejer-løse undtagelses-linjer, indsat EFTER `* @mgrubak`, FØR strategi-linjerne (sidst-matchende vinder; strategi-linjerne gen-ejer intet der er undtaget — de matcher andre stier):

```
# Rolle-valideret bogførings-flade (gov-5, Mathias-accepteret 2026-06-11):
# ejer-løs linje fjerner code-owner-kravet (GitHub-dokumenteret mekanik).
# Mathias' gates er ORDENE (qwerg/slut OK, author-verificeret i kæden),
# ikke PR-klikkene — kæden merger aldrig før ordet er registreret.
/docs/coordination/aktiv-plan.md
/docs/coordination/seneste-rapport.md
/docs/coordination/codex-reviews/
/docs/coordination/plan-feedback/
/docs/coordination/rapport-historik/
docs/coordination/*-status.md
docs/coordination/*-plan.md
```

**Snittet (ved tvivl er det hans — strukturelt håndhævet af defaulten):** ALT beholder hans gate undtagen de syv bogførings-mønstre — dvs. supabase/ (hele, inkl. config/baseline/schema/tests), scripts/ (alle værn), packages/, apps/, .github/, docs/strategi/, docs/teknisk/, CLAUDE.md, krav-dok-kontrakter, mathias-gate/, README, rod-configs og alt fremtidigt. Codex V6-fundets flader (config.toml, advisor-baseline.json, schema.sql, supabase/tests, migration-gate.mjs, run-db-tests.mjs, schema-check.sh, types-gen.sh, selftests) er dækket af defaulten — ingen inventory nødvendig, klassen er elimineret. Rapport-historik + plan-filer er ejer-løse fordi gaterne er Mathias' ORD: kæden merger slut-rapport først når slut OK er author-verificeret registreret, og plan-merges følger rolle-godkendelse (gov-5-gate-model). **NB:** forretnings-builds (migrations/packages/apps) kræver fortsat hans klik — forretnings-trinnets klik-model er en NY afgørelse til den tid. **BEVARES:** hele den eksisterende fil ordret (header-historik, `* @mgrubak`, 4 strategi-linjer, lag-B-kommentarer) — diffen er RENT ADDITIV. Bevis: 11b (tre cases).

**P4 — codex-review.sh.** Uændret fra V2 (docs-fase + header; parser/exit/`--parse-test` bevares).

**P5 — disciplin Forudsætninger (476–484).** Uændret fra V2 (punkt → Gjort-listen).

**P6 — CLAUDE.md (NY i V5).** Nuværende merge-konvention-afsnit 1:1 (CLAUDE.md "Identiteter"-sektion, citeret i Verificerede afhængigheder). DIFF: konventionen præciseres: mgrubak-approval er gaten **på beslutnings-sti-PR'er**; rolle-validerede PR'er merger på grøn CI + Codex (gov-5-gate-model, jf. disciplin §2). **BEVARES:** tre-konto-strukturen, aldrig-admin-reglen, alt andet.

## Step 13a — Protection-state-dump (udført 2026-06-11 på Mathias-mandat)

Admin READ via fælles admin-login; switch-back til bot straks efter (verificeret: `gh auth status` → stork-code-bot aktiv). Rå dump (`gh api repos/Cphsales/stork-2.0/branches/main/protection`, felter ordret — URL-felter udeladt for læsbarhed, intet andet ændret):

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Lint, typecheck, test, build"],
    "checks": [{ "context": "Lint, typecheck, test, build", "app_id": 15368 }]
  },
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "require_last_push_approval": false,
    "required_approving_review_count": 1
  },
  "required_signatures": { "enabled": false },
  "enforce_admins": { "enabled": true },
  "required_linear_history": { "enabled": true },
  "allow_force_pushes": { "enabled": false },
  "allow_deletions": { "enabled": false },
  "block_creations": { "enabled": false },
  "required_conversation_resolution": { "enabled": true },
  "lock_branch": { "enabled": false },
  "allow_fork_syncing": { "enabled": false }
}
```

**Verifikation mod gov-4-forventningerne:** required CI-check "Lint, typecheck, test, build" ✓ · require_code_owner_reviews=true ✓ · dismiss_stale_reviews=true ✓ — alle forventninger SANDE (ingen afvigelses-rapport nødvendig). Strict=true forklarer i øvrigt merge-kø-friktionen (recon E.2): branch skal være ajour + stale-dismiss ved rebase.

**Eksakt 13b-diff (én felt-ændring, alt andet bevares ordret):**

| Felt                                                            | Nu  | Efter 13b |
| --------------------------------------------------------------- | --- | --------- |
| `required_pull_request_reviews.required_approving_review_count` | 1   | **0**     |

Konsekvens: PR der rører CODEOWNERS-ejede stier kræver fortsat code-owner-approval (mgrubak); PR der kun rører rolle-validerede stier kræver 0 menneske-approvals → merger på grøn CI (+ kædens Codex-discipliner). `enforce_admins=true` bevares — ingen bypass-vej, heller ikke for admin. `required_conversation_resolution=true` bevares (note: drift-warning-kommentarer er issue-comments, ikke review-tråde — blokerer ikke).

## Formåls-fejning af alle kæde-led (V8 — roden, ikke kun instansen)

Hvert led holdt mod formålet ("fra åbning til lukning kører alt selv; Mathias kaldes kun ind når afgørelsen er hans"), IKKE mod dagens flow:

| Led                                                    | Formåls-status                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Åbning (qwers, mobil)                                  | ✓ kæde-båret                                                                                                                                                                                                                                                                                                                                                                                          |
| Recon (qwers → recon-klar)                             | ✓ **V8-fixet** — var udenfor kæden (fundets instans)                                                                                                                                                                                                                                                                                                                                                  |
| Krav-dok-dialog                                        | ✓ bevidst manuel — KONTROLPOSTEN (formålets egen undtagelse)                                                                                                                                                                                                                                                                                                                                          |
| **Krav-dok-commit/merge efter krav OK**                | ⚠ REST-KLIK: `*-krav-og-data.md` er ejet (P3) → PR-klik EFTER hans eget krav OK-ord. Bogføring af afgjort ord — samme klasse som fundet. **[FORSLAG]** un-own krav-og-data; gaten bæres af author-verificeret "krav OK" (kæden merger aldrig før ordet — Mathias' egen ratificerings-model). Konservativt alternativ: klik består som del af kontrolpost-fladen. **Mathias afgør ved re-godkendelse** |
| Plan-fase (rolle-valideret)                            | ✓                                                                                                                                                                                                                                                                                                                                                                                                     |
| Build + build-merge                                    | ✓ (rolle-valideret; beslutnings-stier → hans klik = afgørelsen)                                                                                                                                                                                                                                                                                                                                       |
| Slut-rapport + slut OK                                 | ✓ (lukning — formålets ord)                                                                                                                                                                                                                                                                                                                                                                           |
| **Pakke-luk-bogføring (arkiv-flytning, doc-currency)** | ⚠ REST-KLIK: `arkiv/` er ejet → klik EFTER slut OK. Samme klasse. **[FORSLAG]** un-own `/docs/coordination/arkiv/` (flytning af allerede-lukkede artefakter, gated af slut OK-ordet). Konservativt alternativ: klik består. **Mathias afgør ved re-godkendelse**                                                                                                                                      |
| gov-6-bevis                                            | ✓ (krav 8)                                                                                                                                                                                                                                                                                                                                                                                            |

Fejnings-regel fremad (roden): enhver ny plan-version holder HVERT led mod formålet før Codex-review — checken er nu del af pre-push-tjeklisten for denne pakke.

## B1-bevarings-verifikation (TILLÆG 2 — HYPOTESE til Codex' V8-review)

Codes sikkert/frosset-snit er en hypotese, ikke et faktum. Codex SKAL i V8-reviewet eksplicit verificere hver række under qwers-starten, FØR den bevares:

| B1-del                                                                                                                                      | Påstand: væknings-agnostisk?            | Codex-verdikt (V8-review) |
| ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------- |
| tilstandslæsning + parsere (deklaration/markers/divergens)                                                                                  | JA — læser tilstand uanset kæde-start   | afventer                  |
| transport-commit-isolation (--only)                                                                                                         | JA                                      | afventer                  |
| parallel-eksekvering + kørende-register + låse                                                                                              | JA                                      | afventer                  |
| behandlet-semantik (kun exit 0) + idempotens-nøgler                                                                                         | JA                                      | afventer                  |
| author-verifikation + gate-mekanik (fund-gate/SPOR-PAUSET/GATE-AFGJORT)                                                                     | JA                                      | afventer                  |
| `kaede-regler.json` events-tabel (`qwers-aabning`: "kvittering" → SKAL ændres til recon-igangsætning; `krav-dok-merged`-events composition) | **NEJ — re-åbnes efter V8-godkendelse** | afventer                  |
| `afledEvents` (krav-dok-merged-afledning: "kravDok && !planFil" — holder den når recon-docs ligger FØR krav-dok?)                           | **TVIVL — Codex afgør**                 | afventer                  |
| event-fixtures (krav-dok-merged/qwers-cases)                                                                                                | **NEJ — omskrives m. V8-semantik**      | afventer                  |

## End-to-end-test-design (§3.6 + krav 8)

- **Komponent:** routing-fixtures (alle leverance-typer inkl. recon-typer + troskabs-verdikt + mid-fase-tråde + lås + SHA-binding) · `--parse-test` udvidet.
- **Led:** dry-run-gennemløb + ét live led + headless-auth-bevis (step 9) + 11b's tre gate-cases.
- **Fuldt bevis (krav 8, læsning a — TILLÆG 4: dækker den NYE strækning):** gov-6 kører den FULDE flade FRA qwers. Målbart: (1) qwers → recon-kørsler dispatches automatisk (Code+Codex parallelt, derefter Claude.ai-rolle) · (2) recon-leverancer transport-committet + `recon-klar` → Mathias-notifikation uden relæ · (3) krav-dok-dialogen forbliver manuel (kontrolposten — 0 automatiserede krav-dok-skrivninger, verificeret i dispatch-log) · (4) Codex-APPROVAL → krav-troskabs-tjek → PASS → build uden Mathias-klik (TILLÆG 3-leddet fyrede) · (5) alle øvrige vækninger aktør-deklarerede/automatiske · (6) Mathias' handlinger = åbning, krav OK, slut OK + evt. fund-gates ALENE · 0 relæ · 0 bogførings-klik · 0 ubetingede plan/byg-klik. Slut-rapport bærer dispatch-loggen led-for-led; pakke-luk efter.

## Doc-currency (§10.2)

**A. Fundament-validering:** ingen forretnings-intentions-ændring — verificeret current pr. main `437fc8b` mod vision + forretningsforstaaelse. Gate-model-ændringen er PROCES (disciplin), ikke forretnings-intention; disciplin er ikke stamme-doc — ændringen går gennem §8.1 + Mathias' CODEOWNERS-approval (ratificering ved qwerg på denne plan). Ingen intent-ændring.

**B. Status-opdatering (med merge):** aktiv-plan ✓ (flip, step 14) · seneste-rapport n/a · master-plan §4.1 n/a (proces-pakke) · teknisk-gaeld ✓ (G062 noteret) · huskeliste ✓ (H028 noteret) · disciplin Forudsætninger ✓ (P5).

## Åbne punkter (Codex V8-review/runde 17 + Mathias-re-godkendelse)

1. **Rest-klik-afgørelser (Formåls-fejningen):** krav-dok-merge-klik + pakke-luk-arkiv-klik — [FORSLAG] un-own begge (gates bæres af author-verificerede ord); konservativt alternativ: klik består. **Mathias afgør ved re-godkendelse.**
2. **B1-bevarings-verifikation:** Codex verificerer hypotese-tabellen eksplicit (TILLÆG 2) — hvilke B1-dele består under qwers-start.
3. Step 6 headless-Code STOP-dækning — Codex: blind-vinkler (uændret fra V7).
4. Headless-auth (step 9-bevis før tillid, uændret).
5. **P3-snittets forretnings-linjer** bekræftet ved V7-qwerg; står ved magt medmindre Mathias siger andet ved re-godkendelse.

(Lukket: V5-prefix · 13a-dump · V7-qwerg givet 2026-06-11 — V8 kræver re-godkendelse pga. plan-afvigelses-fundet, §8 pakke-kontrakt.)
