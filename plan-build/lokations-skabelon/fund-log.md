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
| A-1 | BLOKER | 3·4·5 | T10-halen genåbner netop de direkte writes kravet forbyder | K-8/ac1 · K-4/ac3 · K-2/ac6 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A-1 (1b0240c1): RETTET M. BEVIS (via A2-6) · plan.md:210 K-8/ac-1 T8.1 I + K-8/ac-1/neg-1 · plan.md:95 — dømmes i A'/B' |
| A-2 | BLOKER | 1·3 | Bid 2 specificerer en klassifikationsværdi registryet afviser | K-7/ac1 · Bid 2 som forudsætning for Bid 3-5 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 A-2 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:252 §2.1 hale · plan.md:628 S-28 — dømmes i A'/B' |
| A-3 | BLOKER | 2·3·4·6 | K-7's nedgraderingsforbud mangler udførende kode og negativ | K-7 struktur · K-8/ac2 · K-9/ac3 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 A-3 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:202 K-7/S neg-1..3 · plan.md:279 _pii_klassifikation_guard · plan.md:360 Bid 1.1 — dømmes i A'/B' |
| A-4 | BLOKER | 3·4·6 | Planen vælger lokations-PII men leverer ingen lokationsanonymisering | K-7/ac3-4 · K-9/ac1-2 | kræver Mathias | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A-4 (1b0240c1): KRÆVER MATHIAS (S-2) + RETTET M. BEVIS (kompositionshuller A2-3/A2-4/A2-5) · plan.md:758 S-2 · plan.md:201 K-7/ac-4 (b)(c)(d) · plan.md:333,335 I6/I8 — dømmes i A'/B' |
| A-5 | RET | 1·2·3·6 | Den lovede fulde mapping-lifecycle kan ikke køres på den seedede mapping | K-7/ac4 · Bid 5 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A-5 (1b0240c1): RETTET M. BEVIS (via A2-3) · plan.md:87,280,201 — dømmes i A'/B' |
| A-6 | BLOKER | 2·3·4·6 | INVOKER-oraklet kan svare falsk på en sand klientret pga. en anden sides RLS | K-3/ac4 · K-6/ac4,7 · K-8/ac4 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 A-6 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:305 §2.4 · plan.md:321 R13 · plan.md:620 S-20 — dømmes i A'/B' |
| A-7 | RET | 2·6 | JWT-simulering og superadmin-positive smokes binder ikke non-bypass/API-beviset | K-8/ac1,4 · K-9/ac1-2 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 A-7 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:45-49 roller/ctx · plan.md:223 K-9/ac-1 — dømmes i A'/B' |
| A-8 | RET | 2·5 | Flere erklærede kills kan ikke dræbes gennem den angivne effektsti | K-5 · K-8 · kill-listens metode pr. K | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A-8 (1b0240c1): RETTET M. BEVIS (via A2-6/A2-7/A2-8) · plan.md:113,128,141,143,154,185,199,210,213,223 — dømmes i A'/B' |
| A-9 | BLOKER | 3·4·5·6 | Dagens pending med 24 timers undo bliver en historikændring i morgen | K-6/ac6,7,10 · M-13 · P-8's historie-invariant | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A-9 (1b0240c1): RETTET M. BEVIS (via A2-8) · plan.md:53,185,617 — dømmes i A'/B' |
| A-10 | RET | 3·4·5 | SQL-udtrykkene håndhæver hverken den lovede UTC-dato eller skiftetid | K-1/ac3 · K-4/ac4-5 · K-6/ac7 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 A-10 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:51 UTC-regel · plan.md:272-273 · plan.md:618 S-18 — dømmes i A'/B' |
| A-11 | RET | 3·4 | Centrale RPC'er og deres interne adgangskanter er stadig build-valg | K-6/ac1,5,10 · K-8/ac1,4 · K-9 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A-11 (1b0240c1): RETTET M. BEVIS (via A2-13) · plan.md:55-97 katalog · plan.md:266 · plan.md:210-213 — dømmes i A'/B' |
| A-12 | BLOKER | 1·2·5·6 | Det påkrævede concurrency-bevis kan nedgraderes til prosa og kodeinspektion | K-2/ac6 · Bid 4's samtidighed | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 A-12 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:32 FA-2 · plan.md:129 K-2/ac-6/SA-1 · plan.md:181 K-6/ac-2/SA-1 · plan.md:743 §9 — dømmes i A'/B' |
| A-13 | BLOKER | 1·3·6 | P-8 er ikke indbundet; kædens nødvendige adaptere har intet leverancested | K-1..K-9 · M-35/P-8 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A-13 (1b0240c1): RETTET M. BEVIS (via A2-9/A2-10/A2-14) · plan.md:35,232-242,41 + manifest — dømmes i A'/B' |
| A-14 | RET | 3·6 | API-sidegrænsen er omtalt, men fuldstændig læsning er ikke specificeret | K-9/ac1-2 · P-8/C10 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A-14 (1b0240c1): RETTET M. BEVIS (via A2-12) · plan.md:320-324,224,634 — dømmes i A'/B' |
| A-15 | RET | 2·4·6 | Økonomiforbuddets måler undersøger kun schema/FK, ikke den lovede flade | K-1/ac4 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 A-15 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:114 K-1/ac-4 (b)(c) · plan.md:626 S-26 — dømmes i A'/B' |

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
| FUND-1 | medium | K-7 ac 4: kravets »persondata« indsnævres tavst til »direct« — adresse klassificeret indirect, anonymisering holdt inaktiv uden deklaration | 115-116 · 292 · 490/S-13 | kræver Mathias | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 FUND-1 (1b0240c1): KRÆVER MATHIAS (S-2) · plan.md:758,624 — dømmes i A'/B' |
| FUND-2 | mindre | Fejl-attribution »K-9-fladekontrakt-note«: max_rows/30 s er recon-2, ikke kravet | 308 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 FUND-2 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:669 §6 — dømmes i A'/B' |
| FUND-3 | mindre | Fejl-citat: forbeholdet »nødvendigvis« klippet ud af recon-Codex-citatet (V9) | 466 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 FUND-3 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:589 V9 — dømmes i A'/B' |
| FUND-4 | mindre | Dinglende afgørelses-reference »V-A« — hedder S-1 | 42 · 215 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 FUND-4 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:124 K-2/ac-1 · plan.md:405 DDL-kommentar — dømmes i A'/B' |
| FUND-5 | mindre | Tælle-fejl »de fem [NY ENTRY]-ordbogs-rækker« — det er seks | 604 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 FUND-5 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:20 · plan.md:643 §5 — dømmes i A'/B' |

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
| F01 | MODSTRID | Nye INSERT/UPDATE-grants til authenticated vs. lovet revoke-båret lukket skrivevej | 157 · 191 · 283 · 395 vs. 124 · 460 · 527 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 F01 (1b0240c1): RETTET M. BEVIS (via A2-6) · plan.md:210 — dømmes i A'/B' |
| F02 | MODSTRID | Klassifikationskategori `historik` findes ikke i registryets CHECK (kun operationel · konfiguration · master_data · audit · raw_payload) | 292 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 F02 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:252 §2.1 hale · plan.md:628 S-28 — dømmes i A'/B' |
| F03 | MODSTRID | Adresse = indirect, men lokationsanonymisering inaktiv m. begrundelse »ingen direct-felter« — kravet siger »persondata« | 115-116 · 292 · 490 · 541 | kræver Mathias | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 F03 (1b0240c1): KRÆVER MATHIAS (S-2) · plan.md:758 — dømmes i A'/B' |
| F04 | MODSTRID | Direct→lavere-forbud (K:136) + delete/recreate-værn udeladt af ændringsplan og matrix | 440 · 587-589 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 F04 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:202 K-7/S neg-1..3 · plan.md:279 _pii_klassifikation_guard · plan.md:360 Bid 1.1 — dømmes i A'/B' |
| F05 | MODSTRID | FORCE-fravalg begrundet m. trigger-INSERT »i invoker-kontekst« — `stork_audit` er SECURITY DEFINER | 283 · 480 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 F05 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:630 S-30 · plan.md:252 — dømmes i A'/B' |
| F06 | MODSTRID | `skiftet_kl::date` hævdes UTC-dato — cast følger sessionens TimeZone; ingen UTC-binding | 334 · 466 · 481 · 309 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 F06 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:51 UTC-regel · plan.md:272-273 · plan.md:618 S-18 — dømmes i A'/B' |
| F07 | MODSTRID | Generelt self-approve-forbud lovet, men forbilledet forbyder kun for non-admin ved `action_id` NULL | 105 · 425 vs. 412 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 F07 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:631 S-31 · plan.md:189 K-6/ac-10/neg-7 · plan.md:348 — dømmes i A'/B' |
| F08 | MODSTRID | Kolonnevejen kaldes »0 ny anonymiserings-kode« trods to nye funktioner + wrapper + ACL | 450 · 452 vs. 433-438 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 F08 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:573 V1 — dømmes i A'/B' |
| F09 | MODSTRID | `c5b47ec5:78-131` angivet som forbillede for regprocedure-dispatch — spannet har ingen | 435 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 F09 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:333 I6 · plan.md:575 V2 — dømmes i A'/B' |
| F10 | MODSTRID | Exact-start-DELETE tilskrevet `17930649:151-222` — spannet lukker med UPDATE | 464 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 F10 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:587 V8 — dømmes i A'/B' |
| F11 | MODSTRID | Tre lovede runtime-kills (fjernet CHECK · fjernet DML-grant · udeladt mapping-kolonne) ændrer ikke den autoriserede sti | 90b · 130a · 118b | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 F11 (1b0240c1): RETTET M. BEVIS (via A2-6/A2-7) · plan.md:113,128,143,154,199,210,213,223 — dømmes i A'/B' |
| F12 | MODSTRID | Kodeinspektions-kill/residual tilladt i stedet for to-sessions-bevis — R/T kræver særskilt concurrency-bevis | 319 · 527 · 602 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 F12 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:32 FA-2 · plan.md:129 K-2/ac-6/SA-1 · plan.md:181 K-6/ac-2/SA-1 · plan.md:743 §9 — dømmes i A'/B' |
| F13 | MODSTRID | Anonymiseret kontakt-række hævdes låst (»UPDATE → 22023«), men `gruppe_kontakt_saet_aktiv` har ubetinget UPDATE | 488 vs. 199-200 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 F13 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:623 S-23 · plan.md:288-289 W3/W4 · plan.md:199 K-7/ac-2/neg-3,4 — dømmes i A'/B' |
| F14 | MODSTRID | Snapshot-konflation »aldrig« på pakkens sti — `6083fecd:112-118` skriver begge snapshotfelter ubetinget | 528 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 F14 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:575 V2 · plan.md:669 §6 pkt 4 — dømmes i A'/B' |
| F15 | MODSTRID | Redaktionelle kilde-/sporbarhedsfejl: blob8 vs. blob12 · `70d52135:13-53` · E015 · fem→seks entries · step 1.4 · 427→426 linjer · B:142 | 15 · 139 · 509 · 604 · 128 · 12 · 36 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 F15 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:20 · plan.md:643 §5 — dømmes i A'/B' |
| F16 | MODSTRID | Forbilledet `bb9ee808:29-41` har ikke alle domænevalideringer før session-vars (ukendt-id-check efter UPDATE) | 157 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 F16 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:282 §2.3 indledning — dømmes i A'/B' |
| U01 | MANGLER KILDE | P-8 behandlet som fremtidig leverance trods påstand om fastlagte bindinger — T's blob, C0-C10, N1-N9 ikke bundet | 604 · 591 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 U01 (1b0240c1): RETTET M. BEVIS (via A2-14/A2-9/A2-10) · plan.md:35,232-242 + manifest — dømmes i A'/B' |
| U02 | MANGLER KILDE | »Interne« funktioner uden komplet DDL/ACL/returtype; ingen revoke fra authenticated på 4+2 nye funktioner | 408 · 433 · 438 · 591 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 U02 (1b0240c1): RETTET M. BEVIS (via A2-13) · plan.md:266,210 K-8/ac-1/neg-2 + neg-5 · plan.md:637 S-37 — dømmes i A'/B' |
| U03 | MANGLER KILDE | Fuld non-admin-læsning lovet uden tværside-/række-synlighedskontrakt (42501 / false / delvis liste?) | 420-423 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 U03 (1b0240c1): RETTET M. BEVIS (via A2-13) · plan.md:213 K-8/ac-4 + neg-4 — dømmes i A'/B' |
| U04 | MANGLER KILDE | Forsinket apply (apply-dato > payload-dato) ikke disponeret — historik-invarians vs. pending-flow | 105 · 408 · 425 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 U04 (1b0240c1): RETTET M. BEVIS (via A2-8) · plan.md:53,185 — dømmes i A'/B' |
| U05 | MANGLER KILDE | »Ingen build-tids-valg« lovet, men wrappers mangler parameterlister/defaults/named errors; numeric-/integer-udfald; trigger-DDL | 591 · 399-406 · 408 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 U05 (1b0240c1): RETTET M. BEVIS (via A2-13) · plan.md:55-97,201,210 — dømmes i A'/B' |
| U06 | MANGLER KILDE | Samlet K-7-dækning krediteret uden binding felt→audit→anonymisering→replay→retention ved senere tilladte valg | 116 · 436-440 | kræver Mathias | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 U06 (1b0240c1): RETTET M. BEVIS + KRÆVER MATHIAS (S-2 for indirect) · plan.md:199,201,333,335,758 — dømmes i A'/B' |
| U07 | MANGLER KILDE | Alle negativer erklæret dækket, men to testkontekster (trigger-P0001 vs. 42501) ubundet; JWT-sim/superadmin skifter ikke SQL-rolle | 151 · 587 · 24 · 71/101/126 vs. 124 · 137 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 U07 (1b0240c1): RETTET M. BEVIS (via A2-13) · plan.md:47-49 ctx · plan.md:210,212 — dømmes i A'/B' |
| U08 | MANGLER KILDE | Live-eksponeringskontrol kaldt fail-closed, men OpenAPI-canary er T9-specifik; nye lokations-RPC'er ubevist | 600 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 U08 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:354 §3 (iv) · plan.md:223 K-9/ac-1 — dømmes i A'/B' |
| U09 | MANGLER KILDE | Produktvalg begrundet som »M-24 1:1« / »eneste meningsfulde default« / navne kategorisk ikke-persondata | 450 · 479 · 490 · 493 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 U09 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:571-637 §4 — dømmes i A'/B' |
| U10 | MANGLER KILDE | Fravær af money-FK + fitness som fuldt bevis for ingen økonomi-/attributionsdimension | 33 · 587-589 | båret (v2, kvitteret i v3) | 2069aa16 (plan v2; kvitteret c5f451f8) | fold-ind-rapport-r3 §1.5 U10 (1b0240c1): BÅRET (v2) — RETTET M. BEVIS · plan.md:114 K-1/ac-4 (b)(c) · plan.md:626 S-26 — dømmes i A'/B' |

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
| NF-1 | K-genlæsning | S-17 (effektiv dato = greatest(ønsket, apply-dag)) ændrer bruger-forventningen i forventningslistens K-6 ac 6/ac 10 (»mister ret FRA D7«) når apply sker efter D7 — planneren: inden for mandat (K:122 + M-13) + bekræftelses-linje B-1 | K-6/ac-6 · K-6/ac-10 · forventningsliste 2200b76e | inden for mandat | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 NF-1 (1b0240c1): INDEN FOR MANDAT + bekræftelse B-1 (teknisk rest = A2-8, rettet) · plan.md:53 S-17 · plan.md:185 K-6/ac-6 · plan.md:766 B-1 — dømmes i A'/B' |
| NF-2 | K-genlæsning | adresse klassificeres `none` (v1: `indirect`); K:134 »konservativ default« vs K:142 »uden aktivt valg er intet felt persondata« — planneren: inden for mandat (K:142 er ac) + bekræftelses-linje B-3; claude-ai dømmer forretnings-troskab | K-7/ac-3 · K-7 HVAD | kræver Mathias | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 NF-2 (1b0240c1): KRÆVER MATHIAS (= A2-1) · plan.md:758 S-2 — dømmes i A'/B' |

### Kilde 5: driver-observationer under arkivering (driver-10b)

| fund-id | klasse | kort | berører | status | rettelses-OID | bevis |
| --- | --- | --- | --- | --- | --- | --- |
| D-1 | påstand | plan v2 §Formål påstår »byte-identisk med kravets Formål«; første 4 linjer er identiske, men kravets »## Formål«-sektion har yderligere afsnit (Grundlag · Sprog-note · Form). `governance-check.mjs` sammenligner kun en »> Denne pakke leverer:«-blockquote, som hverken krav eller plan har, og gælder `docs/coordination/`-layoutet — påstanden er uprøvet | plan v2 §Formål · K:Formål | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 D-1 (1b0240c1): RETTET M. BEVIS · plan.md:7 Formåls-note — dømmes i A'/B' |

## Efter B4-B (fresh-eyes antag-aldrig-audit r2 af plan v2 `2069aa16`) — modtaget 2026-09-10 17:2x

### Kilde 6: fresh-eyes r2 — `plan-audit-fresh-eyes-r2.md` (frisk claude-ai-instans, read-only @ deb8b2c; først arkiveret hoved-trunkeret som 292d029c, fuld version 417d96b6 — R2-5; provenance/plan-audit-fresh-eyes-r2.\*)

Auditten dømmer også runde 1: FUND-2..FUND-5 LUKKET i v2; FUND-1 »adresseret men forkert klassificeret« → FUND2-3. Rapportens »kræver Mathias = 0« holder ikke: to ægte spørgsmål (S-1 · S-2), to bekræftelser (B-4 · B-5), én relabel (B-2), én synlig default (D-1). Dømmes samlet af code-reviewer-slutlæseren (B4-C).

| fund-id | alvor | kort (driverens resumé — kilden er autoritet) | berører (plan v2-linje) | status | rettelses-OID | bevis |
| --- | --- | --- | --- | --- | --- | --- |
| FUND2-1 | medium | V1 »gruppens feltliste FAST« går mod kravets default (K:181 »som for klienter«, UI-udvidelig) og M-23 »alt skal kunne styres i UI« — deklareret teknisk (U09) men er et forretningsvalg → ægte spørgsmål S-1 | plan:566 · K:57 · K:181 · M-23 | kræver Mathias | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 FUND2-1 (1b0240c1): KRÆVER MATHIAS · plan.md:757 S-1 · plan.md:573 V1 (+ variant S-1-B) · plan.md:396 Bid 1 · plan.md:711 Blok  — dømmes i A'/B' |
| FUND2-2 | mindre | fravalg af klient uden gældende kobling afvises (AK-IKKE-I-GRUPPEN) — intet M-ord/K-linje siger negativet; »meningsløst« er planens dom → bekræftelse B-4 (ét skridt fra M-17/M-36) m. konsekvens synlig | plan:138 · plan:293 · K:65 · K:121 | inden for mandat | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 FUND2-2 (1b0240c1): INDEN FOR MANDAT + bekræftelse B-4 · plan.md:141 K-3/ac-4 neg-2 · plan.md:300 W15 · plan.md:768 B-4 — dømmes i A'/B' |
| FUND2-3 | medium | »persondata« indsnævret til pii_level='direct' (S-24); B-3 er ikke ét-skridts-afledning af et M-ord og bærer tre beslutninger → ægte spørgsmål S-2 (anbefaling: registrering ok); B-3 udgår i nuværende form | plan:617 · plan:743 · K:143 · K:134 · K:145 | kræver Mathias | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 FUND2-3 (1b0240c1): KRÆVER MATHIAS (= A2-1) · plan.md:758 S-2 · plan.md:624 S-24 — dømmes i A'/B' |
| FUND2-4 | mindre | ny stand på nedlagt lokation afvises (S-8/W9) — K:71/K:181 delegerer ikke stand-oprettelse; M-30.2 er analogi → bekræftelse B-5 via analogi | plan:601 · plan:287 · K:71 · K:84 · M-30.2 | inden for mandat | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 FUND2-4 (1b0240c1): INDEN FOR MANDAT + bekræftelse B-5 (analogi) · plan.md:608 S-8 · plan.md:294 W9 · plan.md:769 B-5 — dømmes i A'/B' |
| FUND2-5 | mindre | ny lokation fødes »aktiv« (S-2) — ingen kilde vælger starttilstand; effekt: bookbar straks → synlig default D-1, intet spørgsmål (lav materialitet) | plan:595 · K-4 | inden for mandat | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 FUND2-5 (1b0240c1): INDEN FOR MANDAT + synlig default D-1 · plan.md:602 S-2 · plan.md:770 D-1 — dømmes i A'/B' |
| FUND2-6 | mindre | B-2 tilskrives M-13 + M-19, men ingen af dem tager stilling til om fravalg består gennem nedlæg/genåbn; K:181 delegerer det → relabel til »plan-valg inden for kravets ramme« | plan:742 · K:181 · M-13 · M-19 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 FUND2-6 (1b0240c1): RETTET M. BEVIS (relabel) · plan.md:767 B-2 · plan.md:702 Blok A · plan.md:587 V8 — dømmes i A'/B' |

## Efter B4-A (codex-angreb delta + frit helheds-pas på plan v2 `2069aa16`) — modtaget 2026-09-10 17:38

### Kilde 7: codex-angreb r2 — `plan-angreb-r2.md` (read-only @ deb8b2c; provenance/plan-angreb-r2.\*)

»Rest-status: 15 åbne«. Af de 46 fund er 19 dømt IKKE båret af v2 (genåbnet ovenfor m. henvisning) og 21 kill-list-dispositioner ikke virksomme. Restfundene nedenfor er selvstændige; flere tidligere fund henviser til samme restfund. Batch → plan v3 (én dokumenteret ekstra runde, GRUNDPLAN B4).

| fund-id | alvor | akse | kort (driverens resumé — kilden er autoritet) | berører | status | rettelses-OID | bevis |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A2-1 | BLOKER | kravtrofasthed / delta | Aktiv `indirect`-klassifikation er fortsat uden anonymiseringsvej (K:143) — indsnævring til direct lukker ikke persondataforpligtelsen (A-4 · FUND-1 · F03 · U06) | K-7/ac-3 · K-7/ac-4 · plan:198,617,743 | kræver Mathias | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A2-1 (1b0240c1): KRÆVER MATHIAS · plan.md:758 S-2 · plan.md:201 K-7/ac-4 T7.10 · plan.md:624 S-24 · plan.md:23 §0 — dømmes i A'/B' |
| A2-2 | RET | aktiv konfiguration / delta | T7.12 skæres på en default (ingen retention valgt), ikke på sit acceptkriterium | K-7 · kill-list T7.12 | inden for mandat | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A2-2 (1b0240c1): INDEN FOR MANDAT · plan.md:201 K-7/ac-4 T7.12 R — dømmes i A'/B' |
| A2-3 | BLOKER | konfiguration + rækkefølge / delta og frit pas | Testet mapping kan ændres og derefter aktiveres udækket (A-5 · U06) | K-7/ac-4 · Bid 5.1 · plan:198,273,550-551 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A2-3 (1b0240c1): RETTET M. BEVIS · plan.md:87 AK-DAEKNING · plan.md:280 _mapping_daekning_guard · plan.md:201 K-7/ac-4 (c) +  — dømmes i A'/B' |
| A2-4 | BLOKER | persondata-lifecycle / frit pas | Lokationen kan modtage nye personværdier efter anonymisering | K-7/ac-2 · K-7/ac-4 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A2-4 (1b0240c1): RETTET M. BEVIS · plan.md:84 AK-LOKATION-ANONYMISERET · plan.md:291 W6 gate · plan.md:201 K-7/ac-4 (d) + K-7 — dømmes i A'/B' |
| A2-5 | BLOKER | replay + audit / frit pas | I6/I8 mangler auditkontekst på den normale replay-vej (U06) | K-6/ac-10 · K-8/ac-2 · P-8 §4.3 Replay | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A2-5 (1b0240c1): RETTET M. BEVIS · plan.md:333 I6 · plan.md:335 I8 · plan.md:211 K-8/ac-2 (c) · plan.md:199 K-7/ac-2 replay — dømmes i A'/B' |
| A2-6 | RET | D10 / delta | Tre adgangsmutanter er forkert disponeret; det krævede effektive grant-kill bortforklares (A-1 · F01 · F11 · A-8) | K-8/ac-1 · plan:207,247,622 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A2-6 (1b0240c1): RETTET M. BEVIS · plan.md:210 K-8/ac-1 T8.1 I · plan.md:213 K-8/ac-4 T8.5 (R1) · plan.md:223 K-9/ac-1 T9.1 · — dømmes i A'/B' |
| A2-7 | RET | mutantidentitet og vidner / delta | Flere I-poster lover en anden mutation eller effekt end planen kan levere (A-8 · F11 · T1.3 m.fl.) | §1 mutant-kolonner · register | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A2-7 (1b0240c1): RETTET M. BEVIS · plan.md:113 T1.3 · plan.md:128 T2.8 · plan.md:141 T6.3 · plan.md:143 T3.5 · plan.md:154 T4 — dømmes i A'/B' |
| A2-8 | RET | dateret effekt / delta | Forsinkelsesreglen (S-17), oraklet og T6.14 er ikke enige (A-9 · U04) | K-6/ac-6 · K-6/ac-10 · plan:53,182,186,324,541 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A2-8 (1b0240c1): RETTET M. BEVIS · plan.md:53 S-17 (§0.2) · plan.md:185 K-6/ac-6 (+ T6.14) · plan.md:189 K-6/ac-10 · plan.md: — dømmes i A'/B' |
| A2-9 | RET | D12 og bid-orden / delta og frit pas | Flere bids kræver beviser fra senere bids (A-13 · U01) | §3 bid-opdeling · D12 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A2-9 (1b0240c1): RETTET M. BEVIS · plan.md:41 ID-regler (ét effekt-bid) · plan.md:232-242 bijektions-tabel · plan.md:354 §3 ( — dømmes i A'/B' |
| A2-10 | RET | manifest og ID'er / delta og frit pas | 53 rækker er ikke den krævede entydige bevismængde: fem aliasrækker + K-9 mangler individuelle bevisformer (ID-regler §5 pkt. 6) | §1 matrix · K-9 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A2-10 (1b0240c1): RETTET M. BEVIS · plan.md:18 §0 · plan.md:41 ID-regler · plan.md:115 K-1/ac-5 · plan.md:170 K-5/ac-4 · plan. — dømmes i A'/B' |
| A2-11 | BLOKER | årsagsforpligtelse / frit pas | T8.6's fælles mutationer er indsnævret til 18 nye RPC'er — årsagskravet dækker ikke hele skrivefladen | K-8/ac-2 · K-4/ac-2 | inden for mandat | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A2-11 (1b0240c1): INDEN FOR MANDAT (m. FS-assert + synlig default) · plan.md:211 K-8/ac-2 (a)-(e) + K-8/ac-2/neg-1..3 · plan.md:189 K-6/ac-10 audit-observation — dømmes i A'/B' |
| A2-12 | RET | komplet offentlig læsning / delta og frit pas | R12/R14/R15/R16 mangler pagineringskontrakten (A-14) | K-9/ac-2 · plan:221,298,313-317,618 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A2-12 (1b0240c1): RETTET M. BEVIS · plan.md:320 R12 · plan.md:322-324 R14/R15/R16 · plan.md:224 K-9/ac-2 breddeprøve + K-9/ac- — dømmes i A'/B' |
| A2-13 | RET | afvisningskontrakter / delta | Flere præcise fejl-/rolleudsagn modsiger deres førbetingelser (A-11 · U02 · U03 · U05 · U07) | §0.2 afvisnings-katalog · §2 register | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A2-13 (1b0240c1): RETTET M. BEVIS · plan.md:55 katalog-regel · plan.md:83 AK-IMMUTABEL (TRUNCATE) · plan.md:91 AK-FUNDAMENT-*  — dømmes i A'/B' |
| A2-14 | BLOKER | P-8-kædens binding / delta | Kildeidentitet og måltarget er stadig fremtidige — syntetiske bid-fixtures accepteres ikke som held-out (A-13 · U01) | §0.1 FA-1..5 · §9 · P-8 §1 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A2-14 (1b0240c1): RETTET M. BEVIS (kontrakt-KRAV; identitet `<udfyldes af driveren>`) · plan.md:35 FA-5 · plan.md:37 · plan.md:743 §9 held-out-snit · plan.md:788 BV-5 — dømmes i A'/B' |
| A2-15 | RET | leverancegate / delta og frit pas | S7.1/SL7.1 er reduceret til parserens billede af SQL | K-7/ac-1 · S7.1 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 A2-15 (1b0240c1): RETTET M. BEVIS · plan.md:97 AK-CI-KATALOG · plan.md:198 K-7/ac-1 (b)/(c) + K-7/ac-1/neg-1 · plan.md:204 S7. — dømmes i A'/B' |

Frit helhedspas (kildens §4): E20-snittet holder (kun T2.6/T6.2 SA); bijektion har alle 53 ac-ID'er men obligation→effekt-bid→bevisform er ikke entydig (A2-9/10); ID-regler ikke fulgt uden aliasser (A2-10); kildepopulation ikke låst (A2-14).

## Efter B4-C (code-reviewer frisk slutlæser af plan v2 @ 2949f69) — modtaget 2026-09-10 18:47

### Kilde 8: code-reviewer slutlæsning r2 — `plan-slutlaesning-r2.md` (read-only @ 2949f69; provenance/plan-slutlaesning-r2.\*)

REST-DOM: REST ≠ ∅ → én ekstra runde (batch → v3). C's dom over A2: A2-2 båret · A2-10 delvist (K-9/ac-1 MH+UT ægte, alias-delen båret) · A2-15 delvist/lav · A2-1 HALT-klasse (kræver Mathias — samme sag som FUND2-3/NF-2 · S-2) · A2-14 ejer driver · øvrige ægte. FUND2-1..6 ægte. NF-1 dækkes af B-1 (teknisk rest = A2-8) · NF-2 = A2-1 · D-1 ægte (tekst).

| fund-id | alvor | kort (driverens resumé — kilden er autoritet) | berører | status | rettelses-OID | bevis |
| --- | --- | --- | --- | --- | --- | --- |
| R2-1 | RET | Anonymiserings-strategier seedes `approved`, men `anonymize_generic_apply` kræver `active`; planen binder ikke `anonymization_strategy_activate` som step (kaldes »UI-drift«) — K-7/ac-2's positive kæde er ubundet | K-7/ac-2 · K-7/ac-4 (c) · Bid 5.2 · plan:550 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 R2-1 (1b0240c1): RETTET M. BEVIS · plan.md:199 K-7/ac-2 step (1) + K-7/ac-2/neg-7 · plan.md:557 Bid 5.1 pkt 2 · plan.md:563 B — dømmes i A'/B' |
| R2-2 | RET | Wrapperne W13-W16 sætter brugerens årsag, men `pending_change_request` overskriver `stork.change_reason` med labelen før INSERT — request-audit bærer aldrig brugerens årsag; FS-asserten kan ikke gå grøn | K-8/ac-2 · K-6/ac-10 · §2.6 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 R2-2 (1b0240c1): RETTET M. BEVIS · plan.md:211 K-8/ac-2 (e) · plan.md:189 K-6/ac-10 audit-observation · plan.md:298 W13 audit — dømmes i A'/B' |
| R2-3 | RET | S-18 stempler alle logs med `clock_timestamp()`; D1<D2-forløb (pris), D5/D6/D8 (status) og »senere opslag« kræver klok-styring; FA-3 dækker kun Bid 4 og nævner ikke K-1/ac-3 | alle FS-historisk-rækker · FA-3 · K-1/ac-3 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 R2-3 (1b0240c1): RETTET M. BEVIS · plan.md:33 FA-3 · plan.md:113 K-1/ac-3 · plan.md:155 K-4/ac-5 · plan.md:168 K-5/ac-2 · pla — dømmes i A'/B' |
| R2-4 | RET | `audit_log_read` er gatet på `has_permission('audit','log')`; planen binder audit-læsningen som R+ m. kun pakke-tab-grant → 42501 i stedet for audit-rækken | K-4/ac-2 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 R2-4 (1b0240c1): RETTET M. BEVIS · plan.md:152 K-4/ac-2 · plan.md:168 K-5/ac-2 · plan.md:563 Bid 5.2 rights-overlay (INGEN au — dømmes i A'/B' |
| R2-5 | proces (driver) | `plan-audit-fresh-eyes-r2.md` @ 292d029c er hoved-trunkeret (linje 1 »ag F, migration).«); trunkeringen skete før arkivering (result-feltet starter identisk); provenance-resuméet »Rest-status: 6 fund« findes ikke i filen | B4-B-arkivering · C dømte den trunkerede fil | rettet m. bevis (driver) | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 R2-5 (1b0240c1): DRIVER (lukket før v3: fuld audit `417d96b6` rekonstrueret) · plan.md:11 (v3 læser den fulde audit-blob) — dømmes i A'/B' |
| R2-6 | binding (driver) | implplan i workdir @ 2949f69 har blob 0fdd5b1e (fabrik-push cb55344 ændrede 2.F), mens plan.md:20, kill-list:254 og plan-angreb-r2:387 pinner 8fab089d; D13-læsning i plan:720 uverificeret mod ledgeren | plan v2 hoved · kill-list · angreb-r2 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 R2-6 (1b0240c1): DRIVER + RETTET M. BEVIS (re-pin i v3) · plan.md:20 implplan 0fdd5b1e + D13-verifikation · plan.md:733 §8 — dømmes i A'/B' |
| R2-7 | mindre | AK-DATO-DRIFT sammenligner `payload->>'gaeldende_fra' <> effective_from::text` som tekst (DateStyle-afhængig) — sammenlign som date | plan:324 | rettet m. bevis | c5f451f8 (plan v3) | fold-ind-rapport-r3 §1 R2-7 (1b0240c1): RETTET M. BEVIS · plan.md:82 AK-DATO-DRIFT · plan.md:331 I1-I4 step (1)/(2) — dømmes i A'/B' |

## Efter spørgsmåls-devil kørsel 1 (`spoergsmaal-plan-r2.md` @ 4cef5bee, FAIL 11 fund) — modtaget 2026-09-10 19:12

### Kilde 9: spørgsmåls-devil (codex-angreb i devil-funktion, read-only @ 1e62bca; provenance/spoergsmaal-plan-r2.devil-1.\*)

Devilens fund gælder Mathias-teksten (form/klassifikation, rettet i ny blob) — to har plan-substans og registreres her:

| fund-id | klasse | kort (driverens resumé — kilden er autoritet) | berører | status | rettelses-OID | bevis |
| --- | --- | --- | --- | --- | --- | --- |
| DV-1 | ny afvisning uden mandat | AK-DATO-FOER-START (»en kobling/fravalg varer mindst én dag«, plan:81/292/324) er et model-valg uden citeret mandat (audit: »ingen; model-valg«; K:181 delegerer fortrydelsesmekanik, ikke dette negativ) → kræver Mathias (D-6 som ja/nej) eller planneren fjerner reglen | K-6/ac-6 · K-6/ac-10 · K-3/ac-6 · plan v2 §0.2 | modtaget | — | — |
| DV-2 | klassifikation | S-1 (gruppens feltliste FAST, V1) er planens bord — K:57 »analogi, ikke krav« + K:179/181 delegerer udtrykkeligt; FUND2-1 var fejlklassificeret som ægte spørgsmål → orientering; v3 skal ikke skrive S-1 som kræver-Mathias-variant (V1 står, synlig afvigelse fra udgangspunktet) | plan:566 · K:57 · K:181 | modtaget | — | — |

## Efter planner v3 (fold-ind r2, plan v3 blob `c5f451f8`, rapport-r3 `1b0240c1`) — 2026-09-10 20:1x

Rapport-r3 §1's tilstande er overført mekanisk til de 77 rækker ovenfor (status · rettelses-OID · bevis »dømmes i A'/B'«); §1.5's 27 bårne runde-1-fund er kvitteret som »båret (v2, kvitteret i v3)«. Nye fund fra plannerens K-genlæsning (rapport §3), plannerens egen klassifikation — dømmes i A'/B':

### Kilde 10: planner-code K-genlæsning r3 — `fold-ind-rapport-r3.md` §3 (blob `1b0240c1`)

| fund-id | klasse | kort (driverens resumé — kilden er autoritet) | berører | status | rettelses-OID | bevis |
| --- | --- | --- | --- | --- | --- | --- |
| NF-3 | K-genlæsning | Effekt-bids flyttet SENERE (Bid 4/5) for at overholde A2-9 — ingen ac svagere (samme cases/bevisformer), men Bid 1/2 lukker færre obligationer; forventningslistens »effekt-bid (P v1)«-kolonne afviger nu fra v3 | K-7/ac-3 · K-7/ac-1 · K-8/ac-1 · K-8/ac-2 · K-8/S · K-9/ac-3 | modtaget (planner: inden for mandat) | c5f451f8 (plan v3) | fold-ind-rapport-r3 §3 NF-3 — dømmes i A'/B' |
| NF-4 | K-genlæsning | T4.3 omdisponeret I → R (immutability-guard gør omskrivning urepræsenterbar); K-4's gulv består (8 I); ac-4 bevisform udvidet til UT + FS (historik-genlæsning C10) | K-4/ac-4 | modtaget (planner: inden for mandat, D10) | c5f451f8 (plan v3) | fold-ind-rapport-r3 §3 NF-4 — dømmes i A'/B' |
| NF-5 | K-genlæsning | `pending_change_apply` undtaget fra »hver handling som R− → AK-PERM«: fundamentet har ingen page-gate på apply (`f49e7d5b:220`) — enhver authenticated kan udløse apply af en DUE, APPROVED pending (samme effekt som cron); fundament-egenskab, ikke pakke-svaghed | K-9/ac-2 | modtaget (planner: inden for mandat + synlig default) | c5f451f8 (plan v3) | fold-ind-rapport-r3 §3 NF-5 — dømmes i A'/B' |
| NF-6 | K-genlæsning | Alias-udskrivningen (A2-10) gav K-1/ac-5 · K-5/ac-4 · K-6/ac-4 · K-6/ac-5 · K-6/ac-9 egne negativ-ID'er der er »samme case som« mål-obligationens; casen køres én gang | K-1/ac-5 · K-5/ac-4 · K-6/ac-4 · K-6/ac-5 · K-6/ac-9 | modtaget (planner: inden for mandat, §5 pkt. 6) | c5f451f8 (plan v3) | fold-ind-rapport-r3 §3 NF-6 — dømmes i A'/B' |
