# fund-log — lokations-skabelon (A8: hvert modtaget fund → kilde · fund-id · input-OID · status)

Regler (GRUNDPLAN-v2 A8 · princip 6 »beskriv ≠ luk« · Codex F-10): hvert fund fra et tjek
registreres HER når det modtages — kilde (fil · blob) · fund-id (kildens eget id) · input-OID
(blobben fundet blev rejst mod) · status. Ved fold-ind får rækken én af tre lukke-tilstande +
rettelses-OID (blobben hvor rettelsen står) + bevis (fold-ind-rapport-afsnit / diff / test):

- `modtaget` — registreret, ikke behandlet.
- `rettet m. bevis` — indarbejdet; rettelses-OID + bevis udfyldt.
- `inden for mandat` — begrundet afgørelse uden ændring (begrundelsen står i fold-ind-rapporten).
- `kræver Mathias` — kan kun lukkes af hans ord (→ spørgsmåls-devil → fremlæggelse; ordet får M-id).

Status opdateres i rækken (versionshistorikken bærer forløbet). Et fund slettes aldrig. Efter
fold-ind tjekkes at den oprindelige K-forpligtelse består (princip 6). Overlap mellem kilderne er
plannerens fold-ind-arbejde — loggen dedupliker IKKE.

Føres af driveren. Oprettet 2026-09-09 af driver-10b med de tre Fase 3-tjek på plan v1.

## Plan v1 — input-OID `423d9b20` (plan.md @ ec4a3d9) — modtaget 2026-09-08, registreret 2026-09-09

### Kilde 1: codex-angreb — `plan-angreb-r1.md` (blob `c5b467db`; provenance/plan-angreb-r1.\*)

| fund-id | alvor | akse | kort (driverens resumé — kilden er autoritet) | berører | status | rettelses-OID | bevis |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A-1 | BLOKER | 3·4·5 | T10-halen genåbner netop de direkte writes kravet forbyder | K-8/ac1 · K-4/ac3 · K-2/ac6 | genåbnet (B4-A: ikke båret) | 2069aa16 (plan v2) | plan-angreb-r2 §1 A-1 (0b2a36ca): ikke båret → A2-6; batch → v3 |
| A-2 | BLOKER | 1·3 | Bid 2 specificerer en klassifikationsværdi registryet afviser | K-7/ac1 · Bid 2 som forudsætning for Bid 3-5 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 A-2 (39936c64) — dømmes i B4 |
| A-3 | BLOKER | 2·3·4·6 | K-7's nedgraderingsforbud mangler udførende kode og negativ | K-7 struktur · K-8/ac2 · K-9/ac3 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 A-3 (39936c64) — dømmes i B4 |
| A-4 | BLOKER | 3·4·6 | Planen vælger lokations-PII men leverer ingen lokationsanonymisering | K-7/ac3-4 · K-9/ac1-2 | genåbnet (B4-A: ikke båret) | 2069aa16 (plan v2) | plan-angreb-r2 §1 A-4 (0b2a36ca): ikke båret → A2-1..A2-5; batch → v3 |
| A-5 | RET | 1·2·3·6 | Den lovede fulde mapping-lifecycle kan ikke køres på den seedede mapping | K-7/ac4 · Bid 5 | genåbnet (B4-A: ikke båret) | 2069aa16 (plan v2) | plan-angreb-r2 §1 A-5 (0b2a36ca): ikke båret → A2-3; batch → v3 |
| A-6 | BLOKER | 2·3·4·6 | INVOKER-oraklet kan svare falsk på en sand klientret pga. en anden sides RLS | K-3/ac4 · K-6/ac4,7 · K-8/ac4 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 A-6 (39936c64) — dømmes i B4 |
| A-7 | RET | 2·6 | JWT-simulering og superadmin-positive smokes binder ikke non-bypass/API-beviset | K-8/ac1,4 · K-9/ac1-2 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 A-7 (39936c64) — dømmes i B4 |
| A-8 | RET | 2·5 | Flere erklærede kills kan ikke dræbes gennem den angivne effektsti | K-5 · K-8 · kill-listens metode pr. K | genåbnet (B4-A: ikke båret) | 2069aa16 (plan v2) | plan-angreb-r2 §1 A-8 (0b2a36ca): ikke båret → A2-6..A2-8; batch → v3 |
| A-9 | BLOKER | 3·4·5·6 | Dagens pending med 24 timers undo bliver en historikændring i morgen | K-6/ac6,7,10 · M-13 · P-8's historie-invariant | genåbnet (B4-A: ikke båret) | 2069aa16 (plan v2) | plan-angreb-r2 §1 A-9 (0b2a36ca): ikke båret → A2-8; batch → v3 |
| A-10 | RET | 3·4·5 | SQL-udtrykkene håndhæver hverken den lovede UTC-dato eller skiftetid | K-1/ac3 · K-4/ac4-5 · K-6/ac7 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 A-10 (39936c64) — dømmes i B4 |
| A-11 | RET | 3·4 | Centrale RPC'er og deres interne adgangskanter er stadig build-valg | K-6/ac1,5,10 · K-8/ac1,4 · K-9 | genåbnet (B4-A: ikke båret) | 2069aa16 (plan v2) | plan-angreb-r2 §1 A-11 (0b2a36ca): ikke båret → A2-13; batch → v3 |
| A-12 | BLOKER | 1·2·5·6 | Det påkrævede concurrency-bevis kan nedgraderes til prosa og kodeinspektion | K-2/ac6 · Bid 4's samtidighed | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 A-12 (39936c64) — dømmes i B4 |
| A-13 | BLOKER | 1·3·6 | P-8 er ikke indbundet; kædens nødvendige adaptere har intet leverancested | K-1..K-9 · M-35/P-8 | genåbnet (B4-A: ikke båret) | 2069aa16 (plan v2) | plan-angreb-r2 §1 A-13 (0b2a36ca): ikke båret → A2-9/A2-10/A2-14; batch → v3 |
| A-14 | RET | 3·6 | API-sidegrænsen er omtalt, men fuldstændig læsning er ikke specificeret | K-9/ac1-2 · P-8/C10 | genåbnet (B4-A: ikke båret) | 2069aa16 (plan v2) | plan-angreb-r2 §1 A-14 (0b2a36ca): ikke båret → A2-12; batch → v3 |
| A-15 | RET | 2·4·6 | Økonomiforbuddets måler undersøger kun schema/FK, ikke den lovede flade | K-1/ac4 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 A-15 (39936c64) — dømmes i B4 |

Medfølgende materiale (ikke fund): afsnit »Pr.-K-afledning til revideret kill-list« (K-1..K-9,
targeted mutanter → effektsti) — input til B1 (Codex' blinde kill-list-udkast) og B3 (fold-ind,
D10-filter: én meningsfuld mutant pr. afvisnings-ac). Konklusion: ANGREB-STÅR(15) — 8 BLOKER ·
7 RET · 0 NOTE. NB (drift-log 09-08 17:2x): angrebet kørte på codex-angreb-teksten @ ec4a3d9
(pr.-knap-regel) — kill-list-fund filtreres gennem D10 ved fold-ind.

### Kilde 2: fresh-eyes plan-audit — `plan-audit-fresh-eyes-r1.md` (blob `cb10e231`), afsnit »## Plan-audit (blob 423d9b20)« (linje 193-221)

Akse: kun kilde-troskab (teknisk kvalitet er ikke dømt dér). Fund-id'erne FUND-1..5 er
plan-auditens egne; de kolliderer navnemæssigt med krav-auditens FUND-1..8 i samme fil, men kun
plan-afsnittets fund er logget her.

| fund-id | alvor | kort (driverens resumé — kilden er autoritet) | berører (plan-linje) | status | rettelses-OID | bevis |
| --- | --- | --- | --- | --- | --- | --- |
| FUND-1 | medium | K-7 ac 4: kravets »persondata« indsnævres tavst til »direct« — adresse klassificeret indirect, anonymisering holdt inaktiv uden deklaration | 115-116 · 292 · 490/S-13 | genåbnet (B4-A: ikke båret) | 2069aa16 (plan v2) | plan-angreb-r2 §1 FUND-1 (0b2a36ca): ikke båret → A2-1; batch → v3 |
| FUND-2 | mindre | Fejl-attribution »K-9-fladekontrakt-note«: max_rows/30 s er recon-2, ikke kravet | 308 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 FUND-2 (39936c64) — dømmes i B4 |
| FUND-3 | mindre | Fejl-citat: forbeholdet »nødvendigvis« klippet ud af recon-Codex-citatet (V9) | 466 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 FUND-3 (39936c64) — dømmes i B4 |
| FUND-4 | mindre | Dinglende afgørelses-reference »V-A« — hedder S-1 | 42 · 215 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 FUND-4 (39936c64) — dømmes i B4 |
| FUND-5 | mindre | Tælle-fejl »de fem [NY ENTRY]-ordbogs-rækker« — det er seks | 604 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 FUND-5 (39936c64) — dømmes i B4 |

Medfølgende noter (ikke fund, til gate-panelet — kildens ord): »da gældende« ved genåbning bør
citeres (M-19 + E057/V8) · »V8-lektionen (bb9ee808)« kolliderer læsemæssigt med planens V8-afgørelse
· S-1's fravigelse af §1.12 + AUDIT-EXEMPT-udvidelsen er deklarerede valg (Codex/gatens bord) ·
verifikationsgrænse: `path:linjer @ blob` og bilag-L###-frø ikke efterprøvet dér · plan §0
pinner M-1..M-38 (M-39/M-40 uden krav-/plan-substans). Konklusion: FUND (5) — 1 medium + 4 mindre;
ingen fabrikeret recon-fakta, ingen M-ord-brud, ingen ordbogs-brud.

### Kilde 3: Codex P-4 kildetjek — `p4-plan-kildetjek.md` (blob `c50fe1f2` @ 3907705; provenance/p4-plan-kildetjek.\*)

Kildens tal: 272 klassifikationsrækker (29 afgørelser · 53 ac · DDL/RPC · kill-frø · øvrige
påstande); bundlinje 30 MODSTRID + 24 MANGLER KILDE **rækker**. Fund = kildens to eksplicitte
lister (§1 F01-F16 · §2 U01-U10); gentagelser i klassifikationstabellerne peger på samme fund.

| fund-id | klasse | kort (driverens resumé — kilden er autoritet) | berører (plan-linje) | status | rettelses-OID | bevis |
| --- | --- | --- | --- | --- | --- | --- |
| F01 | MODSTRID | Nye INSERT/UPDATE-grants til authenticated vs. lovet revoke-båret lukket skrivevej | 157 · 191 · 283 · 395 vs. 124 · 460 · 527 | genåbnet (B4-A: ikke båret) | 2069aa16 (plan v2) | plan-angreb-r2 §1 F01 (0b2a36ca): ikke båret → A2-6; batch → v3 |
| F02 | MODSTRID | Klassifikationskategori `historik` findes ikke i registryets CHECK (kun operationel · konfiguration · master_data · audit · raw_payload) | 292 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 F02 (39936c64) — dømmes i B4 |
| F03 | MODSTRID | Adresse = indirect, men lokationsanonymisering inaktiv m. begrundelse »ingen direct-felter« — kravet siger »persondata« | 115-116 · 292 · 490 · 541 | genåbnet (B4-A: ikke båret) | 2069aa16 (plan v2) | plan-angreb-r2 §1 F03 (0b2a36ca): ikke båret → A2-1; batch → v3 |
| F04 | MODSTRID | Direct→lavere-forbud (K:136) + delete/recreate-værn udeladt af ændringsplan og matrix | 440 · 587-589 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 F04 (39936c64) — dømmes i B4 |
| F05 | MODSTRID | FORCE-fravalg begrundet m. trigger-INSERT »i invoker-kontekst« — `stork_audit` er SECURITY DEFINER | 283 · 480 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 F05 (39936c64) — dømmes i B4 |
| F06 | MODSTRID | `skiftet_kl::date` hævdes UTC-dato — cast følger sessionens TimeZone; ingen UTC-binding | 334 · 466 · 481 · 309 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 F06 (39936c64) — dømmes i B4 |
| F07 | MODSTRID | Generelt self-approve-forbud lovet, men forbilledet forbyder kun for non-admin ved `action_id` NULL | 105 · 425 vs. 412 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 F07 (39936c64) — dømmes i B4 |
| F08 | MODSTRID | Kolonnevejen kaldes »0 ny anonymiserings-kode« trods to nye funktioner + wrapper + ACL | 450 · 452 vs. 433-438 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 F08 (39936c64) — dømmes i B4 |
| F09 | MODSTRID | `c5b47ec5:78-131` angivet som forbillede for regprocedure-dispatch — spannet har ingen | 435 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 F09 (39936c64) — dømmes i B4 |
| F10 | MODSTRID | Exact-start-DELETE tilskrevet `17930649:151-222` — spannet lukker med UPDATE | 464 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 F10 (39936c64) — dømmes i B4 |
| F11 | MODSTRID | Tre lovede runtime-kills (fjernet CHECK · fjernet DML-grant · udeladt mapping-kolonne) ændrer ikke den autoriserede sti | 90b · 130a · 118b | genåbnet (B4-A: ikke båret) | 2069aa16 (plan v2) | plan-angreb-r2 §1 F11 (0b2a36ca): ikke båret → A2-6/A2-7; batch → v3 |
| F12 | MODSTRID | Kodeinspektions-kill/residual tilladt i stedet for to-sessions-bevis — R/T kræver særskilt concurrency-bevis | 319 · 527 · 602 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 F12 (39936c64) — dømmes i B4 |
| F13 | MODSTRID | Anonymiseret kontakt-række hævdes låst (»UPDATE → 22023«), men `gruppe_kontakt_saet_aktiv` har ubetinget UPDATE | 488 vs. 199-200 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 F13 (39936c64) — dømmes i B4 |
| F14 | MODSTRID | Snapshot-konflation »aldrig« på pakkens sti — `6083fecd:112-118` skriver begge snapshotfelter ubetinget | 528 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 F14 (39936c64) — dømmes i B4 |
| F15 | MODSTRID | Redaktionelle kilde-/sporbarhedsfejl: blob8 vs. blob12 · `70d52135:13-53` · E015 · fem→seks entries · step 1.4 · 427→426 linjer · B:142 | 15 · 139 · 509 · 604 · 128 · 12 · 36 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 F15 (39936c64) — dømmes i B4 |
| F16 | MODSTRID | Forbilledet `bb9ee808:29-41` har ikke alle domænevalideringer før session-vars (ukendt-id-check efter UPDATE) | 157 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 F16 (39936c64) — dømmes i B4 |
| U01 | MANGLER KILDE | P-8 behandlet som fremtidig leverance trods påstand om fastlagte bindinger — T's blob, C0-C10, N1-N9 ikke bundet | 604 · 591 | genåbnet (B4-A: ikke båret) | 2069aa16 (plan v2) | plan-angreb-r2 §1 U01 (0b2a36ca): ikke båret → A2-14/A2-9/A2-10; batch → v3 |
| U02 | MANGLER KILDE | »Interne« funktioner uden komplet DDL/ACL/returtype; ingen revoke fra authenticated på 4+2 nye funktioner | 408 · 433 · 438 · 591 | genåbnet (B4-A: ikke båret) | 2069aa16 (plan v2) | plan-angreb-r2 §1 U02 (0b2a36ca): ikke båret → A2-13; batch → v3 |
| U03 | MANGLER KILDE | Fuld non-admin-læsning lovet uden tværside-/række-synlighedskontrakt (42501 / false / delvis liste?) | 420-423 | genåbnet (B4-A: ikke båret) | 2069aa16 (plan v2) | plan-angreb-r2 §1 U03 (0b2a36ca): ikke båret → A2-13; batch → v3 |
| U04 | MANGLER KILDE | Forsinket apply (apply-dato > payload-dato) ikke disponeret — historik-invarians vs. pending-flow | 105 · 408 · 425 | genåbnet (B4-A: ikke båret) | 2069aa16 (plan v2) | plan-angreb-r2 §1 U04 (0b2a36ca): ikke båret → A2-8; batch → v3 |
| U05 | MANGLER KILDE | »Ingen build-tids-valg« lovet, men wrappers mangler parameterlister/defaults/named errors; numeric-/integer-udfald; trigger-DDL | 591 · 399-406 · 408 | genåbnet (B4-A: ikke båret) | 2069aa16 (plan v2) | plan-angreb-r2 §1 U05 (0b2a36ca): ikke båret → A2-13; batch → v3 |
| U06 | MANGLER KILDE | Samlet K-7-dækning krediteret uden binding felt→audit→anonymisering→replay→retention ved senere tilladte valg | 116 · 436-440 | genåbnet (B4-A: ikke båret) | 2069aa16 (plan v2) | plan-angreb-r2 §1 U06 (0b2a36ca): ikke båret → A2-1..A2-5; batch → v3 |
| U07 | MANGLER KILDE | Alle negativer erklæret dækket, men to testkontekster (trigger-P0001 vs. 42501) ubundet; JWT-sim/superadmin skifter ikke SQL-rolle | 151 · 587 · 24 · 71/101/126 vs. 124 · 137 | genåbnet (B4-A: ikke båret) | 2069aa16 (plan v2) | plan-angreb-r2 §1 U07 (0b2a36ca): ikke båret → A2-13; batch → v3 |
| U08 | MANGLER KILDE | Live-eksponeringskontrol kaldt fail-closed, men OpenAPI-canary er T9-specifik; nye lokations-RPC'er ubevist | 600 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 U08 (39936c64) — dømmes i B4 |
| U09 | MANGLER KILDE | Produktvalg begrundet som »M-24 1:1« / »eneste meningsfulde default« / navne kategorisk ikke-persondata | 450 · 479 · 490 · 493 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 U09 (39936c64) — dømmes i B4 |
| U10 | MANGLER KILDE | Fravær af money-FK + fitness som fuldt bevis for ingen økonomi-/attributionsdimension | 33 · 587-589 | rettet m. bevis | 2069aa16 (plan v2) | fold-ind-rapport-r2 §1 U10 (39936c64) — dømmes i B4 |

Medfølgende materiale (ikke fund): §3-§10 klassifikationstabeller (alle 29 afgørelser · 53 ac ·
DDL/RPC · recon-2-citater · kill-frø · planfaseliste · M-bindinger · bro-bindinger) — fold-ind
læser dem som kontekst; §8 bekræfter at intet planfase-emne er efterladt.

## Optælling

| kilde | fund | modtaget | rettet m. bevis | inden for mandat | kræver Mathias |
| --- | --- | --- | --- | --- | --- |
| codex-angreb r1 | 15 (8 BLOKER · 7 RET) | 0 | 7 båret (B4-A) + 8 genåbnet → v3 | 0 | 0 |
| fresh-eyes plan-audit r1 | 5 (1 medium · 4 mindre) | 0 | 4 båret (B4-A) + 1 genåbnet → v3 | 0 | 0 |
| P-4 kildetjek | 26 (16 MODSTRID · 10 MANGLER KILDE) | 0 | 16 båret (B4-A) + 10 genåbnet → v3 | 0 | 0 |
| planner K-genlæsning r2 (NF-1/NF-2) + driver (D-1) + fresh-eyes r2 (FUND2-1..6) + codex-angreb r2 (A2-1..15) — se afsnittene nedenfor | 24 | 24 | 0 | 0 | 0 |
| **i alt** | **70** | **24 (+19 genåbnet)** | **27 båret** | 0 | 0 |

## Efter B3 (fold-ind r2, plan v2 blob `2069aa16`) — nye fund, modtaget 2026-09-10

### Kilde 4: planner-code K-genlæsning — `fold-ind-rapport-r2.md` §3 (blob `39936c64`)

Plannerens egen klassifikation (»inden for mandat« + bekræftelses-linje) er producentens påstand — dømmes i B4 (princip 6).

| fund-id | klasse | kort (driverens resumé — kilden er autoritet) | berører | status | rettelses-OID | bevis |
| --- | --- | --- | --- | --- | --- | --- |
| NF-1 | K-genlæsning | S-17 (effektiv dato = greatest(ønsket, apply-dag)) ændrer bruger-forventningen i forventningslistens K-6 ac 6/ac 10 (»mister ret FRA D7«) når apply sker efter D7 — planneren: inden for mandat (K:122 + M-13) + bekræftelses-linje B-1 | K-6/ac-6 · K-6/ac-10 · forventningsliste 2200b76e | modtaget | — | — |
| NF-2 | K-genlæsning | adresse klassificeres `none` (v1: `indirect`); K:134 »konservativ default« vs K:142 »uden aktivt valg er intet felt persondata« — planneren: inden for mandat (K:142 er ac) + bekræftelses-linje B-3; claude-ai dømmer forretnings-troskab | K-7/ac-3 · K-7 HVAD | modtaget | — | — |

### Kilde 5: driver-observationer under arkivering (driver-10b)

| fund-id | klasse | kort | berører | status | rettelses-OID | bevis |
| --- | --- | --- | --- | --- | --- | --- |
| D-1 | påstand | plan v2 §Formål påstår »byte-identisk med kravets Formål«; første 4 linjer er identiske, men kravets »## Formål«-sektion har yderligere afsnit (Grundlag · Sprog-note · Form). `governance-check.mjs` sammenligner kun en »> Denne pakke leverer:«-blockquote, som hverken krav eller plan har, og gælder `docs/coordination/`-layoutet — påstanden er uprøvet | plan v2 §Formål · K:Formål | modtaget | — | — |

## Efter B4-B (fresh-eyes antag-aldrig-audit r2 af plan v2 `2069aa16`) — modtaget 2026-09-10 17:2x

### Kilde 6: fresh-eyes r2 — `plan-audit-fresh-eyes-r2.md` (frisk claude-ai-instans, read-only @ deb8b2c; provenance/plan-audit-fresh-eyes-r2.\*)

Auditten dømmer også runde 1: FUND-2..FUND-5 LUKKET i v2; FUND-1 »adresseret men forkert klassificeret« → FUND2-3. Rapportens »kræver Mathias = 0« holder ikke: to ægte spørgsmål (S-1 · S-2), to bekræftelser (B-4 · B-5), én relabel (B-2), én synlig default (D-1). Dømmes samlet af code-reviewer-slutlæseren (B4-C).

| fund-id | alvor | kort (driverens resumé — kilden er autoritet) | berører (plan v2-linje) | status | rettelses-OID | bevis |
| --- | --- | --- | --- | --- | --- | --- |
| FUND2-1 | medium | V1 »gruppens feltliste FAST« går mod kravets default (K:181 »som for klienter«, UI-udvidelig) og M-23 »alt skal kunne styres i UI« — deklareret teknisk (U09) men er et forretningsvalg → ægte spørgsmål S-1 | plan:566 · K:57 · K:181 · M-23 | modtaget | — | — |
| FUND2-2 | mindre | fravalg af klient uden gældende kobling afvises (AK-IKKE-I-GRUPPEN) — intet M-ord/K-linje siger negativet; »meningsløst« er planens dom → bekræftelse B-4 (ét skridt fra M-17/M-36) m. konsekvens synlig | plan:138 · plan:293 · K:65 · K:121 | modtaget | — | — |
| FUND2-3 | medium | »persondata« indsnævret til pii_level='direct' (S-24); B-3 er ikke ét-skridts-afledning af et M-ord og bærer tre beslutninger → ægte spørgsmål S-2 (anbefaling: registrering ok); B-3 udgår i nuværende form | plan:617 · plan:743 · K:143 · K:134 · K:145 | modtaget | — | — |
| FUND2-4 | mindre | ny stand på nedlagt lokation afvises (S-8/W9) — K:71/K:181 delegerer ikke stand-oprettelse; M-30.2 er analogi → bekræftelse B-5 via analogi | plan:601 · plan:287 · K:71 · K:84 · M-30.2 | modtaget | — | — |
| FUND2-5 | mindre | ny lokation fødes »aktiv« (S-2) — ingen kilde vælger starttilstand; effekt: bookbar straks → synlig default D-1, intet spørgsmål (lav materialitet) | plan:595 · K-4 | modtaget | — | — |
| FUND2-6 | mindre | B-2 tilskrives M-13 + M-19, men ingen af dem tager stilling til om fravalg består gennem nedlæg/genåbn; K:181 delegerer det → relabel til »plan-valg inden for kravets ramme« | plan:742 · K:181 · M-13 · M-19 | modtaget | — | — |

## Efter B4-A (codex-angreb delta + frit helheds-pas på plan v2 `2069aa16`) — modtaget 2026-09-10 17:38

### Kilde 7: codex-angreb r2 — `plan-angreb-r2.md` (read-only @ deb8b2c; provenance/plan-angreb-r2.\*)

»Rest-status: 15 åbne«. Af de 46 fund er 19 dømt IKKE båret af v2 (genåbnet ovenfor m. henvisning) og 21 kill-list-dispositioner ikke virksomme. Restfundene nedenfor er selvstændige; flere tidligere fund henviser til samme restfund. Batch → plan v3 (én dokumenteret ekstra runde, GRUNDPLAN B4).

| fund-id | alvor | akse | kort (driverens resumé — kilden er autoritet) | berører | status | rettelses-OID | bevis |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A2-1 | BLOKER | kravtrofasthed / delta | Aktiv `indirect`-klassifikation er fortsat uden anonymiseringsvej (K:143) — indsnævring til direct lukker ikke persondataforpligtelsen (A-4 · FUND-1 · F03 · U06) | K-7/ac-3 · K-7/ac-4 · plan:198,617,743 | modtaget | — | — |
| A2-2 | RET | aktiv konfiguration / delta | T7.12 skæres på en default (ingen retention valgt), ikke på sit acceptkriterium | K-7 · kill-list T7.12 | modtaget | — | — |
| A2-3 | BLOKER | konfiguration + rækkefølge / delta og frit pas | Testet mapping kan ændres og derefter aktiveres udækket (A-5 · U06) | K-7/ac-4 · Bid 5.1 · plan:198,273,550-551 | modtaget | — | — |
| A2-4 | BLOKER | persondata-lifecycle / frit pas | Lokationen kan modtage nye personværdier efter anonymisering | K-7/ac-2 · K-7/ac-4 | modtaget | — | — |
| A2-5 | BLOKER | replay + audit / frit pas | I6/I8 mangler auditkontekst på den normale replay-vej (U06) | K-6/ac-10 · K-8/ac-2 · P-8 §4.3 Replay | modtaget | — | — |
| A2-6 | RET | D10 / delta | Tre adgangsmutanter er forkert disponeret; det krævede effektive grant-kill bortforklares (A-1 · F01 · F11 · A-8) | K-8/ac-1 · plan:207,247,622 | modtaget | — | — |
| A2-7 | RET | mutantidentitet og vidner / delta | Flere I-poster lover en anden mutation eller effekt end planen kan levere (A-8 · F11 · T1.3 m.fl.) | §1 mutant-kolonner · register | modtaget | — | — |
| A2-8 | RET | dateret effekt / delta | Forsinkelsesreglen (S-17), oraklet og T6.14 er ikke enige (A-9 · U04) | K-6/ac-6 · K-6/ac-10 · plan:53,182,186,324,541 | modtaget | — | — |
| A2-9 | RET | D12 og bid-orden / delta og frit pas | Flere bids kræver beviser fra senere bids (A-13 · U01) | §3 bid-opdeling · D12 | modtaget | — | — |
| A2-10 | RET | manifest og ID'er / delta og frit pas | 53 rækker er ikke den krævede entydige bevismængde: fem aliasrækker + K-9 mangler individuelle bevisformer (ID-regler §5 pkt. 6) | §1 matrix · K-9 | modtaget | — | — |
| A2-11 | BLOKER | årsagsforpligtelse / frit pas | T8.6's fælles mutationer er indsnævret til 18 nye RPC'er — årsagskravet dækker ikke hele skrivefladen | K-8/ac-2 · K-4/ac-2 | modtaget | — | — |
| A2-12 | RET | komplet offentlig læsning / delta og frit pas | R12/R14/R15/R16 mangler pagineringskontrakten (A-14) | K-9/ac-2 · plan:221,298,313-317,618 | modtaget | — | — |
| A2-13 | RET | afvisningskontrakter / delta | Flere præcise fejl-/rolleudsagn modsiger deres førbetingelser (A-11 · U02 · U03 · U05 · U07) | §0.2 afvisnings-katalog · §2 register | modtaget | — | — |
| A2-14 | BLOKER | P-8-kædens binding / delta | Kildeidentitet og måltarget er stadig fremtidige — syntetiske bid-fixtures accepteres ikke som held-out (A-13 · U01) | §0.1 FA-1..5 · §9 · P-8 §1 | modtaget | — | — |
| A2-15 | RET | leverancegate / delta og frit pas | S7.1/SL7.1 er reduceret til parserens billede af SQL | K-7/ac-1 · S7.1 | modtaget | — | — |

Frit helhedspas (kildens §4): E20-snittet holder (kun T2.6/T6.2 SA); bijektion har alle 53 ac-ID'er men obligation→effekt-bid→bevisform er ikke entydig (A2-9/10); ID-regler ikke fulgt uden aliasser (A2-10); kildepopulation ikke låst (A2-14).
