# v6 (gov-6) — Komplet plan: workflowet gøres færdigt

**Status:** UDKAST til Mathias' godkendelse — intet er låst (rammen
§5/§9: valget tages i dialog). AFLØSER plan-udkastet af 2026-06-12
(faldgrube 15: en ny version afløser — lægges aldrig ved siden af;
git-history bevarer den gamle).

**Grundlag (frisk opslag 2026-06-13, main @ `fc87410`):** rammen
(`v6-krav-og-data.md`), broen, gov-6-krav-UDKAST + katalog og porten
(`.claude/`-dokumentet) læst fuldt. Kode verificeret direkte:
`kaede-regler.json` (109 l.), `adapters/code.sh` (58 l.),
`docs/LÆSEFØLGE.md` findes IKKE, `stork-kaede.service` ikke
installeret (kæden aldrig aktiveret), `rette-til-status.md` +
GitHub-state (PR #153 MERGED 2026-06-12 02:16Z). Maskineri- og
docs-inventar via fuld gennemgang af `.claude/`, `scripts/`,
`.github/`, `docs/`.

**Fakta-rettelser mod det afløste udkast:** gov-5 konvergerede på 52
review-runder, ikke 78 (kilde: `gov-5-automation-status.md:6`) ·
"qwerg udgået" kan ikke bevises fra repoet — ordet står i
`kaede-regler.json:11`; om det består er Mathias' ord · rette-til er
FÆRDIG OG MERGET (kun pakke-luk udestår; `rette-til-status.md` er
bagud — siger "afventer klik" om en PR der er merget).

## Formål (én sætning)

> Byg et workflow som sikrer at vi bygger Stork korrekt og efter
> hensigten. Ingen hurtige beslutninger og ingen nemme løsninger.

Planen kobler den godkendte ramme + porten på den beviste kæde-motor,
så ÉT workflow dækker begge flader — og beviser det med falsificering,
ikke grøn selvtest.

## De to krav-sæt alt måles mod

1. **gov-6-kravene** (`gov-6-krav-og-recon-UDKAST.md` + katalogets
   læseregler): workflowets formål (ovenfor) · ét workflow, to flader ·
   kæden vision/forretning = krav = plan = build = PR = luk ·
   nuværende kode respekteres.
2. **Denne chats krav (2026-06-13):** rammen `v6-krav-og-data.md`
   (godkendt — det eneste lukkede) + porten, konstant aktiv i
   `.claude/`: dybde-redegørelse + min. 2 modstands-fund pr.
   substantielt svar; mekanik tjekker kun FORM — dommen er en tænkende
   dommers.

## DEL 1 — Nuværende opsætning målt mod kravene

**Hvad står (verificeret):** kæde-motoren (`dirigent.mjs` + regelbog +
4 adapters + preflight) — fail-closed betingelser, 172 selftest-cases
grøn, preflight 11/11 live, hærdet af rette-til (transport→PR-vej,
spor-anker, persistent KAEDE-STOP) · porten aktiv for Code (3 hooks i
settings-filen i `.claude/`) · GitHub-fysik: branch protection +
CODEOWNERS + CI-trappe + live-migration-deploy.

| #   | Krav (kilde)                                   | Tilstand (verificeret)                                                                                       | Gap                                                                      |
| --- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| 1   | Mekanisk kæde krav=plan=build=luk (ramme §6)   | `decide()` + betingelser FINDES, fail-closed (`kaede-regler.json:92-98`)                                     | Slukket; har ALDRIG kørt en hel pakke (gov-5 krav 8 udestår)             |
| 2   | Nuværende logik hænger sammen (ramme §6)       | `code.sh:42,45` → slettet `docs/LÆSEFØLGE.md`; prompts bærer disciplin-§§ (V5, lukket)                       | Injektions-fladerne peger på det lukkede V5 — kæden ville genskabe V5    |
| 3   | To flader, samme metode (ramme §6; gov-6)      | Kæden = pakke-fladen; porten = uden-om, KUN Code                                                             | Ikke forbundet om samme ramme; Codex/Claude.ai/app-fladen uden port      |
| 4   | Dom udefra + blind (faldgrube 7/9/10)          | Troskabs-tjek dispatches EFTER Codex-APPROVAL (`review-approval`-routing); verdiktet ligger læsbart i repoet | Blind-først mangler                                                      |
| 5   | Tids-prisen: ingen endeløse runder (ramme §10) | Konvergens-counter findes kun som status-føring (disciplin §3.4); gov-5: 52 runder                           | Bremsen er ikke mekanisk betingelse i regelbogen                         |
| 6   | Porten konstant + troværdig (denne chat)       | Hooks aktive; vagterne har MÅLTE falske positiver (Stop-vagt mod ægte transcript; PreToolUse — se bid 4a)    | Vagt-fix udestår; portens form-krav ikke i kædens selvtjek               |
| 7   | Én sandhed, afløsning (faldgrube 14/15)        | Rammen (låst) og `disciplin.md` (V5-proces-hjem, 528 l.) står SIDE OM SIDE                                   | V5-hjemmet ikke afløst; ar ikke høstet — naiv sletning gentager V4-tabet |
| 8   | Ingen fylde (ramme §8: docs-delen fejler)      | 24.921 linjer md i `docs/`; katalogets docs-punkter uafgjort                                                 | Docs-renhed er åbent scope — Mathias' ord                                |

## DEL 2 — Den rigtige løsning (tegnet fra kravene, ikke fra koden)

Fra kravene alene har løsningen disse egenskaber:

1. **Rækkefølge som fysik:** intet led starter uden det forrige
   beviseligt godkendt; Mathias' ord er nøglerne (author-verificeret);
   vagten siger nej mekanisk — aldrig en seddel der beder om disciplin
   (faldgrube 7: indefra-disciplin binder ikke).
2. **Dom udefra og BLIND:** dommeren ser hverken forfatterens
   begrundelse eller den anden dommers verdikt. FÅ og genuint diverse
   domme — ikke mange runder.
3. **Niveau injiceret fra start:** hver frisk session/aktør får rammen
   og portens form som tekst ved start (niveau-indsigten: tekst kan
   sættes op) — aldrig afhængigt af hukommelse.
4. **Dybde synlig pr. svar:** dybde-redegørelse + min. 2 modstands-fund
   på alle substantielle leverancer — BEGGE flader.
5. **Bevis ved falsificering:** plantede brud skal blokere; grøn
   selvtest alene beviser intet (faldgrube 13).
6. **Én sandhed, afløsning:** ny version afløser; ar høstes FØR noget
   dør (faldgrube 14/15).
7. **Minimal tekst:** Mathias-prosa kun hvor Mathias er læser;
   AI-internt kodificeres som data + kode + selftest (fylde er
   glid-kilde).
8. **Mathias' tid = ren beslutning:** åbn, godkend, afgør, luk — fra
   mobil; alt andet kører selv.
9. **Ét workflow over begge flader,** forankret i SAMME ramme-dokument.

**Ærligt sammenfald-tjek mod det stående:** 1 og 8 + GitHub-fysikken
STÅR allerede — motoren ER kravets rækkefølge-fysik, bygget og hærdet.
3 er bygget, men injicerer det FORKERTE indhold (V5). 2, 4 (kæde-delen),
5 og 6 mangler. 7 + docs-renhed er uafgjort scope. Konklusion:
koblingen er repoint + rens + forbind + bevis — ikke ombygning.
(Modstands-fund 1 og 2 udfordrer netop denne konklusion — se nederst.)

## DEL 3 — Koblingen (bidder)

**Forudsætning (mekanik, før genåbning):** rette-til pakke-luk
(§4-bevarelse: status/plan/reviews ryddes, krav-dok arkiveres — PR #153
ER merget). Gov-6 genåbnes på Mathias' qwers-ord (#126).

### Bid 1 — Ét proces-hjem (ar-høst + afløsning)

`disciplin.md` (V5, lukket som mislykket) står i dag SIDE OM SIDE med
rammen — faldgrube 15 i levende live. Høst: regel-for-regel bogføring
af alle §§ (patch-først, DB-state-dump, end-to-end-spor,
konvergens-skel, destruktiv-preflight, severities, bevarings-politik
§4, m.fl.) → bevares (ind i `v6-produktionsregler.md`) / omformes /
dør. Hver DØR-dom kræver Mathias' ord (V4 tabte fire discipliner uden
beslutning — faldgrube 14). Derefter pensioneres `disciplin.md`.
Risiko: lav (docs). Bevis: bogførings-tabellen + governance-check grøn.

### Bid 2 — Injektions-fladerne repointes (niveau-indsigten operationaliseret)

Injiceret tekst ER niveau-sætteren — og kæden injicerer i dag V5:
`code.sh:42,45` → slettet `docs/LÆSEFØLGE.md`; prompts bærer
disciplin-§§. Repoint ALLE injektionspunkter (`code.sh`, `codex.sh`,
`claude-ai-rolle.sh`, `claude-ai-rolle-instruks.md`): ramme-formål +
produktionsregler + portens form-krav ind i hver headless-prompt;
substans bevares ordret hvor den består (patch-først med fuld
body-udtræk på byggetid). Risiko: lav-mellem (prompt-tekst). Bevis:
kæde-selftest grøn + ingen død doc-reference i scripts
(governance-check: dead-doc-paths-klassen).

### Bid 3 — Blind-først + konvergens-bremse (regelbogen)

(a) Troskabs-tjekket dispatches i dag EFTER Codex-APPROVAL og
verdiktet ligger læsbart i repoet — dommen er ikke blind (faldgrube
9). Mekanik: troskabs-opgaven får KUN krav + plan som kontekst;
instruks + selftest håndhæver. (b) Konvergens-counteren bliver
mekanisk betingelse: >3 substans-runder på samme leverance →
BLOKERET + Mathias-gate (arret: gov-5's 52 runder; tids-prisen §10).
(c) `gate_ord`-listen renses på Mathias' ord (qwerg: består/dør?).
Risiko: MELLEM (rører dispatch) → bryd-test pr. ændring. Bevis:
selftest-cases for blind-kontekst + bremse.

### Bid 4 — Porten gøres troværdig og fælles (to flader forbindes)

(a) Port-vagterne fixes mod VIRKELIGHEDEN — to målte falsk-positiv-
klasser (faldgrube 13): Stop-vagten har fejlet mod ægte transcript
(bogført i porten-dokumentet), og PreToolUse-vagten blokerede
2026-06-13 skrivningen af DENNE plan, fordi den grepper hele
tool-inputtet for de beskyttede filnavne i stedet for kun at tjekke
fil-stien — omtale udløser blokering. Før fixene må vagterne ikke
stoles på. (b) Portens FORM-krav (dybde-redegørelse + 2 modstands-fund)
ind som selvtjek på kædens substantielle leverancer (recon,
plan-version, slut-rapport) — samme port, begge flader. (c)
Porten-tekst til Claude.ai-app-fladen er Mathias' klik (hans flade —
bogføres som hans punkt). Risiko: lav. Bevis: vagt-bryd-test mod ægte
transcript og ægte tool-kald (begge retninger: blokerer ægte brud,
slipper legitimt arbejde).

### Bid 5 — Aktivér + falsificér (krav-8-beviset)

Mathias' aktiverings-tjekliste (evt. stop-fil væk · unit-cp +
daemon-reload · preflight) → kæden kører ÉN rigtig pakke (næste
masterplan-trin — Mathias' valg) fra qwers til luk, med porten aktiv.
**Falsificerings-batteri — hvert plantet brud SKAL give BLOKERET:**
(1) byg uden krav OK · (2) byg med kun Codex-approval, ingen troskab ·
(3) forældet plan-SHA · (4) gate-ord fra forkert afsender · (5) luk
uden slut OK · (6) Codex-verdikt plantet i troskabs-kontekst
(blind-brud). Grøn selvtest alene beviser INTET. **Niveau-målepunktet
(rammens åbne data-spørgsmål):** løfter injektionen niveauet uden
Mathias i samtalen — dømmes på porten-redegørelserne i gennemløbets
leverancer. Bevis → gov-5-rapportens krav-8-sektion udfyldes + gov-6
lukkes med rapport.

### Bid 6 — Docs-renhed (scope: Mathias' ord)

Katalogets docs-punkter (mappestruktur efter sandhedsstatus,
1.0-reference-arkiv, aktiv-plan-sanering,
permission-matrix-regenerering, fylde-trim). Egen bid ELLER egen
pakke — afgøres af Mathias; bygges IKKE under denne plan før hans ord.

## Rækkefølge + flow pr. bid

Forudsætning → bid 1 → 2 → 3 + 4 (parallelt) → 5. Bid 6 efter
scope-ord. **Bootstrap-noten (ærlig):** bid 1-4 kan ikke køre gennem
kæden — den er slukket og injicerer V5. De kører det dokumenterede
manuelle flow med porten aktiv + blindt headless Codex-review pr. bid
(revieweren ser kun krav + leverance, ikke begrundelser). Kæden tændes
i bid 5 og beviser sig selv. Hver bid: krav → blind review → byg →
bevis → Mathias hvor ordet er hans.

## Doc-currency (hvad dør — afløsning, aldrig side om side)

- Plan-udkastet 2026-06-12: AFLØST af denne fil (git-history bevarer).
- `disciplin.md`: pensioneres EFTER bid 1's ar-høst — aldrig før.
- `rette-til-*`-filerne: ryddes/arkiveres ved rette-til pakke-luk.
- `docs/LÆSEFØLGE.md`-referencer i scripts: dør i bid 2.
- `rapport-historik/` + `arkiv/`: urørt (append-only audit-spor).

## Mathias-spørgsmål (forretning — kun hans)

1. **Genåbning + navn:** qwers-ord på #126 — og hedder pakken gov-6
   eller nyt navn (kataloget: navnevalget lukker divergensen)?
2. **Docs-renhed:** del af gov-6 (bid 6) eller egen pakke efter?
3. **qwerg:** består eller dør ordet i `gate_ord`?
4. **App-fladen:** porten-tekst i Claude.ai-appens instruks — dit klik.

## Modstands-fund (mod planens egen retning)

1. **Genopliver vi V5 under nyt navn?** Kæden koder V5-flowets steps
   0-5, og V5 er lukket som mislykket. Planen hviler på at dommen ramte
   opdagelses-timing + fylde — ikke gate-fysikken — og at rammen selv
   kræver kæden (krav = plan = build = luk) og respekt for nuværende
   kode. Men intet injektionspunkt ARVES (bid 2 re-deriver hvert
   enkelt), og risikoen står åben til falsificeringen i bid 5 har talt.
2. **Ekstern forskning taler mod review-maskinen** (arvet fra det
   afløste udkast — IKKE frisk-verificeret i dag, deklareret):
   multi-agent-krydsreview er overvurderet; det der virker er
   blind-først + genuint diverse roller; flertalspres undertrykker
   korrektion. Konsekvens taget: bid 3 gør domme FÆRRE og blinde —
   ikke flere.
3. **Rammens egen vej er ikke synligt gennemløbet:** §9 siger analyse →
   valg i dialog → plan; broen står på "FIND afventer go". En komplet
   plan NU kan være svar-refleksen (faldgrube 2). Derfor er status
   UDKAST: planen er oplægget TIL dialogen — intet låses uden Mathias'
   ord.
4. **Portens mekaniske lag er ikke troværdigt endnu** (to målte
   falsk-positiv-klasser, jf. bid 4a — den ene ramte skrivningen af
   denne plan). At bære porten ind i kæden (bid 4b) FØR vagt-fixet
   (4a) ville være tjekkets bogstav uden formål — deraf rækkefølgen.
5. **Niveau-hypotesen er hypotese, ikke viden:** bid 2 bygger på at
   injiceret tekst løfter niveauet — rammens eget åbne spørgsmål er om
   det virker uden Mathias i samtalen. Bid 5 MÅLER det; planen antager
   det ikke bevist.

## Hvad planen IKKE er

Ikke masterplan-produktion (gennemløbets pakke er drifttestens emne,
ikke denne leverance) · ikke docs-renhed-build før scope-ord · ikke
line-level patch-først her — det er hver bids eget første skridt mod
live kode (fuld body-udtræk på byggetidspunktet, ikke fra denne plan).
