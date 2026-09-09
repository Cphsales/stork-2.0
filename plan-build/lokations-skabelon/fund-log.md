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
| A-1 | BLOKER | 3·4·5 | T10-halen genåbner netop de direkte writes kravet forbyder | K-8/ac1 · K-4/ac3 · K-2/ac6 | modtaget | — | — |
| A-2 | BLOKER | 1·3 | Bid 2 specificerer en klassifikationsværdi registryet afviser | K-7/ac1 · Bid 2 som forudsætning for Bid 3-5 | modtaget | — | — |
| A-3 | BLOKER | 2·3·4·6 | K-7's nedgraderingsforbud mangler udførende kode og negativ | K-7 struktur · K-8/ac2 · K-9/ac3 | modtaget | — | — |
| A-4 | BLOKER | 3·4·6 | Planen vælger lokations-PII men leverer ingen lokationsanonymisering | K-7/ac3-4 · K-9/ac1-2 | modtaget | — | — |
| A-5 | RET | 1·2·3·6 | Den lovede fulde mapping-lifecycle kan ikke køres på den seedede mapping | K-7/ac4 · Bid 5 | modtaget | — | — |
| A-6 | BLOKER | 2·3·4·6 | INVOKER-oraklet kan svare falsk på en sand klientret pga. en anden sides RLS | K-3/ac4 · K-6/ac4,7 · K-8/ac4 | modtaget | — | — |
| A-7 | RET | 2·6 | JWT-simulering og superadmin-positive smokes binder ikke non-bypass/API-beviset | K-8/ac1,4 · K-9/ac1-2 | modtaget | — | — |
| A-8 | RET | 2·5 | Flere erklærede kills kan ikke dræbes gennem den angivne effektsti | K-5 · K-8 · kill-listens metode pr. K | modtaget | — | — |
| A-9 | BLOKER | 3·4·5·6 | Dagens pending med 24 timers undo bliver en historikændring i morgen | K-6/ac6,7,10 · M-13 · P-8's historie-invariant | modtaget | — | — |
| A-10 | RET | 3·4·5 | SQL-udtrykkene håndhæver hverken den lovede UTC-dato eller skiftetid | K-1/ac3 · K-4/ac4-5 · K-6/ac7 | modtaget | — | — |
| A-11 | RET | 3·4 | Centrale RPC'er og deres interne adgangskanter er stadig build-valg | K-6/ac1,5,10 · K-8/ac1,4 · K-9 | modtaget | — | — |
| A-12 | BLOKER | 1·2·5·6 | Det påkrævede concurrency-bevis kan nedgraderes til prosa og kodeinspektion | K-2/ac6 · Bid 4's samtidighed | modtaget | — | — |
| A-13 | BLOKER | 1·3·6 | P-8 er ikke indbundet; kædens nødvendige adaptere har intet leverancested | K-1..K-9 · M-35/P-8 | modtaget | — | — |
| A-14 | RET | 3·6 | API-sidegrænsen er omtalt, men fuldstændig læsning er ikke specificeret | K-9/ac1-2 · P-8/C10 | modtaget | — | — |
| A-15 | RET | 2·4·6 | Økonomiforbuddets måler undersøger kun schema/FK, ikke den lovede flade | K-1/ac4 | modtaget | — | — |

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
| FUND-1 | medium | K-7 ac 4: kravets »persondata« indsnævres tavst til »direct« — adresse klassificeret indirect, anonymisering holdt inaktiv uden deklaration | 115-116 · 292 · 490/S-13 | modtaget | — | — |
| FUND-2 | mindre | Fejl-attribution »K-9-fladekontrakt-note«: max_rows/30 s er recon-2, ikke kravet | 308 | modtaget | — | — |
| FUND-3 | mindre | Fejl-citat: forbeholdet »nødvendigvis« klippet ud af recon-Codex-citatet (V9) | 466 | modtaget | — | — |
| FUND-4 | mindre | Dinglende afgørelses-reference »V-A« — hedder S-1 | 42 · 215 | modtaget | — | — |
| FUND-5 | mindre | Tælle-fejl »de fem [NY ENTRY]-ordbogs-rækker« — det er seks | 604 | modtaget | — | — |

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
| F01 | MODSTRID | Nye INSERT/UPDATE-grants til authenticated vs. lovet revoke-båret lukket skrivevej | 157 · 191 · 283 · 395 vs. 124 · 460 · 527 | modtaget | — | — |
| F02 | MODSTRID | Klassifikationskategori `historik` findes ikke i registryets CHECK (kun operationel · konfiguration · master_data · audit · raw_payload) | 292 | modtaget | — | — |
| F03 | MODSTRID | Adresse = indirect, men lokationsanonymisering inaktiv m. begrundelse »ingen direct-felter« — kravet siger »persondata« | 115-116 · 292 · 490 · 541 | modtaget | — | — |
| F04 | MODSTRID | Direct→lavere-forbud (K:136) + delete/recreate-værn udeladt af ændringsplan og matrix | 440 · 587-589 | modtaget | — | — |
| F05 | MODSTRID | FORCE-fravalg begrundet m. trigger-INSERT »i invoker-kontekst« — `stork_audit` er SECURITY DEFINER | 283 · 480 | modtaget | — | — |
| F06 | MODSTRID | `skiftet_kl::date` hævdes UTC-dato — cast følger sessionens TimeZone; ingen UTC-binding | 334 · 466 · 481 · 309 | modtaget | — | — |
| F07 | MODSTRID | Generelt self-approve-forbud lovet, men forbilledet forbyder kun for non-admin ved `action_id` NULL | 105 · 425 vs. 412 | modtaget | — | — |
| F08 | MODSTRID | Kolonnevejen kaldes »0 ny anonymiserings-kode« trods to nye funktioner + wrapper + ACL | 450 · 452 vs. 433-438 | modtaget | — | — |
| F09 | MODSTRID | `c5b47ec5:78-131` angivet som forbillede for regprocedure-dispatch — spannet har ingen | 435 | modtaget | — | — |
| F10 | MODSTRID | Exact-start-DELETE tilskrevet `17930649:151-222` — spannet lukker med UPDATE | 464 | modtaget | — | — |
| F11 | MODSTRID | Tre lovede runtime-kills (fjernet CHECK · fjernet DML-grant · udeladt mapping-kolonne) ændrer ikke den autoriserede sti | 90b · 130a · 118b | modtaget | — | — |
| F12 | MODSTRID | Kodeinspektions-kill/residual tilladt i stedet for to-sessions-bevis — R/T kræver særskilt concurrency-bevis | 319 · 527 · 602 | modtaget | — | — |
| F13 | MODSTRID | Anonymiseret kontakt-række hævdes låst (»UPDATE → 22023«), men `gruppe_kontakt_saet_aktiv` har ubetinget UPDATE | 488 vs. 199-200 | modtaget | — | — |
| F14 | MODSTRID | Snapshot-konflation »aldrig« på pakkens sti — `6083fecd:112-118` skriver begge snapshotfelter ubetinget | 528 | modtaget | — | — |
| F15 | MODSTRID | Redaktionelle kilde-/sporbarhedsfejl: blob8 vs. blob12 · `70d52135:13-53` · E015 · fem→seks entries · step 1.4 · 427→426 linjer · B:142 | 15 · 139 · 509 · 604 · 128 · 12 · 36 | modtaget | — | — |
| F16 | MODSTRID | Forbilledet `bb9ee808:29-41` har ikke alle domænevalideringer før session-vars (ukendt-id-check efter UPDATE) | 157 | modtaget | — | — |
| U01 | MANGLER KILDE | P-8 behandlet som fremtidig leverance trods påstand om fastlagte bindinger — T's blob, C0-C10, N1-N9 ikke bundet | 604 · 591 | modtaget | — | — |
| U02 | MANGLER KILDE | »Interne« funktioner uden komplet DDL/ACL/returtype; ingen revoke fra authenticated på 4+2 nye funktioner | 408 · 433 · 438 · 591 | modtaget | — | — |
| U03 | MANGLER KILDE | Fuld non-admin-læsning lovet uden tværside-/række-synlighedskontrakt (42501 / false / delvis liste?) | 420-423 | modtaget | — | — |
| U04 | MANGLER KILDE | Forsinket apply (apply-dato > payload-dato) ikke disponeret — historik-invarians vs. pending-flow | 105 · 408 · 425 | modtaget | — | — |
| U05 | MANGLER KILDE | »Ingen build-tids-valg« lovet, men wrappers mangler parameterlister/defaults/named errors; numeric-/integer-udfald; trigger-DDL | 591 · 399-406 · 408 | modtaget | — | — |
| U06 | MANGLER KILDE | Samlet K-7-dækning krediteret uden binding felt→audit→anonymisering→replay→retention ved senere tilladte valg | 116 · 436-440 | modtaget | — | — |
| U07 | MANGLER KILDE | Alle negativer erklæret dækket, men to testkontekster (trigger-P0001 vs. 42501) ubundet; JWT-sim/superadmin skifter ikke SQL-rolle | 151 · 587 · 24 · 71/101/126 vs. 124 · 137 | modtaget | — | — |
| U08 | MANGLER KILDE | Live-eksponeringskontrol kaldt fail-closed, men OpenAPI-canary er T9-specifik; nye lokations-RPC'er ubevist | 600 | modtaget | — | — |
| U09 | MANGLER KILDE | Produktvalg begrundet som »M-24 1:1« / »eneste meningsfulde default« / navne kategorisk ikke-persondata | 450 · 479 · 490 · 493 | modtaget | — | — |
| U10 | MANGLER KILDE | Fravær af money-FK + fitness som fuldt bevis for ingen økonomi-/attributionsdimension | 33 · 587-589 | modtaget | — | — |

Medfølgende materiale (ikke fund): §3-§10 klassifikationstabeller (alle 29 afgørelser · 53 ac ·
DDL/RPC · recon-2-citater · kill-frø · planfaseliste · M-bindinger · bro-bindinger) — fold-ind
læser dem som kontekst; §8 bekræfter at intet planfase-emne er efterladt.

## Optælling

| kilde | fund | modtaget | rettet m. bevis | inden for mandat | kræver Mathias |
| --- | --- | --- | --- | --- | --- |
| codex-angreb r1 | 15 (8 BLOKER · 7 RET) | 15 | 0 | 0 | 0 |
| fresh-eyes plan-audit r1 | 5 (1 medium · 4 mindre) | 5 | 0 | 0 | 0 |
| P-4 kildetjek | 26 (16 MODSTRID · 10 MANGLER KILDE) | 26 | 0 | 0 | 0 |
| **i alt** | **46** | **46** | 0 | 0 | 0 |
