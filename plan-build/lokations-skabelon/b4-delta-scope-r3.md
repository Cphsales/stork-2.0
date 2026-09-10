# b4-delta-scope-r3 — mekanisk delta-kort plan v2 (2069aa16) → v3 (c5f451f8) · rapport 1b0240c1

Genereret af driveren (delta-scope.mjs) — ingen dom, kun kort. Diff: 28 hunks · 95 fjernede · 179 tilføjede linjer (v1 796 → v2 872 linjer). Delta for B4 = de ændrede afsnit OG de K/ac/negativer/bids de refererer (princip 4) — ikke kun diff-linjerne.

## 1. Ændrede v2-områder (hunks) → sektion

| v2-linjer | v1-linjer | sektion (##/###) |
| --- | --- | --- |
| 1-26 | 1-26 | — |
| 30-44 | 30-44 | ### 0.1 Fabrik-afhængigheder (P-8-indbinding — hvad build IKKE kan levere selv) (25-38) |
| 50-58 | 50-58 | ### 0.2 Fælles definitioner (bindende for hele planen) (39-102) |
| 79-100 | 79-97 | ### 0.2 Fælles definitioner (bindende for hele planen) (39-102) |
| 110-121 | 107-118 | ### K-1 Lokation som central master-data (K:17-31 · N1 · C2/C3/C10) → Bid 2 (107-119) |
| 125-133 | 122-130 | ### K-2 Stande under lokation (K:33-50 · N2 · C2/C6/C8 · SA) → Bid 2 (ac-3 i Bid 3) (120-133) |
| 138-146 | 135-143 | ### K-3 Gruppe (leverandør) som ejer (K:52-67 · N3 · C1/C2/C4/C7) → Bid 1 (ac-1/2 i Bid 2 · ac-4/6 i Bid 4) (134-146) |
| 149-177 | 146-174 | ### K-4 Status-livscyklus (K:69-87 · N4 · C5-C8) → Bid 3 (ac-6/8/9 i Bid 4 · struktur i Bid 2) (147-162) |
| 180-245 | 177-240 | ### K-6 Klient-tilladelser (K:109-130 · N6 · C1/C4/C6-C8 · SA/Replay) → Bid 4 (176-193) |
| 260-269 | 255-262 | ### 2.1 Tabeller (9) — fælles hale (S-29 · S-30 · S-27) (250-267) |
| 272-283 | 265-276 | ### 2.2 Hjælpere og trigger-funktioner (trigger-fns kræver ingen SECDEF-markør; hjælperen er invoker) (268-281) |
| 288-301 | 281-294 | ### 2.3 Write-RPC'er (18) — `security definer set search_path=''` · `revoke all on function … from public, anon` · `grant execute … to authenticated` · SECDEF_SANCTIONED `"write-rpc"` · gate-rækkefølge BINDENDE: AK-PERM → AK-AARSAG → input-validering (AK-NAVN/TYPE/PRIS/PAAKRAEVET/HVILEDAGE/STATUS/…) → eksistens (AK-FINDES-IKKE, m. `FOR UPDATE` hvor angivet) → tilstands-vagter (INAKTIV/NEDLAGT/UAENDRET/SIDSTE-STAND/…) → **først derefter** `set_config('stork.source_type','manual',true)`, `set_config('stork.change_reason', p_change_reason, true)`, `set_config('stork.allow_<tabel>_write','true',true)` → mutation. (Skærpelse valgt her — F16: forbilledet `bb9ee808:29-58` tjekker ukendt-id EFTER UPDATE; her tjekkes eksistens FØR vars.) Fejlbesked-form `'<fn>: <sag>'`. (282-304) |
| 317-338 | 310-331 | ### 2.4 Read-RPC'er (17) — `security definer stable set search_path=''` · eksplicit gate `has_permission('<page>','manage',false)` → AK-PERM som FØRSTE statement · `revoke all from public, anon` · `grant execute to authenticated` · SECDEF_SANCTIONED `"laese-rpc"` · **typede `returns table(...)`, aldrig jsonb** (S-26) · page-bred læsning uden række-scope (S-20 — visibility bruges ikke; `has_permission` læser den ikke, `07ec8a8e:15-85`) · klient-navne returneres IKKE (kun `klient_id`; navne via `client_get`/`client_list` m. egen gate — A-6) · keyset-paginering: `p_antal integer default 200` (1..1000 ellers AK-PAGINERING), `p_efter_navn text default null`, `p_efter_id uuid default null`; `order by navn, id`; `where (p_efter_navn is null) or (navn, id) > (p_efter_navn, p_efter_id)` (S-25 — A-14). SECDEF er valgt fordi oraklerne læser på tværs af pages (koblinger under `grupper`, fravalg/status under `lokationer`) — INVOKER ville give forretningsfalsk `false` for en lokationer-læser uden grupper-grant (A-6). (305-326) |
| 345-357 | 338-350 | ### 2.6 Fundament-funktioner der CREATE OR REPLACE'es / policies der genskabes (Bid 4.2) — fra SENESTE blob, aldrig ældre (337-351) |
| 393-399 | 386-392 | ### Bid 1 — Gruppe-fundamentet + klassifikationsværn (K-3 ac-3/5 · K-7 ac-1/3 + K-7/S · K-8 ac-1..5) (356-397) |
| 481-487 | 474-480 | ### Bid 2 — Lokation + stande + historik-logs + status-struktur + UTC-fundament (K-1 · K-2 · K-3 ac-1/2 · K-4-struktur · K-8 ac-5 · K-9 ac-3-del) (398-485) |
| 489-495 | 482-488 | ### Bid 3 — Status-livscyklus + hvile-handlinger (K-4 ac-1/2/5/7 · K-5 · K-2 ac-3/5) (486-493) |
| 545-551 | 538-544 | ### Bid 4 — Klient-tilladelser (K-6 · K-3 ac-4/6 · K-4 ac-6/8/9) (494-549) |
| 554-568 | 547-561 | ### Bid 5 — Anonymisering (K-7 ac-2/4) + lokations-anonymiseringsvej + K-9-samleharness (K-9 ac-1/2 · K-1 ac-5 · K-5 ac-4) (550-568) |
| 570-576 | 563-569 | ## 4. Plan-fase-afgørelser (V1-V13 fra kravets liste · S-1..S-32 supplerende) — alle »valgt her« (569-640) |
| 599-611 | 592-604 | ## 4. Plan-fase-afgørelser (V1-V13 fra kravets liste · S-1..S-32 supplerende) — alle »valgt her« (569-640) |
| 614-627 | 607-620 | ## 4. Plan-fase-afgørelser (V1-V13 fra kravets liste · S-1..S-32 supplerende) — alle »valgt her« (569-640) |
| 630-640 | 623-628 | ## 4. Plan-fase-afgørelser (V1-V13 fra kravets liste · S-1..S-32 supplerende) — alle »valgt her« (569-640) |
| 699-706 | 687-694 | ## 7. Repo-doc-tekst 1:1 (forud-godkendte blokke til Fase 6 — anvendes, fabrikeres ikke) (677-730) |
| 708-715 | 696-702 | ## 7. Repo-doc-tekst 1:1 (forud-godkendte blokke til Fase 6 — anvendes, fabrikeres ikke) (677-730) |
| 730-736 | 717-723 | ## 7. Repo-doc-tekst 1:1 (forud-godkendte blokke til Fase 6 — anvendes, fabrikeres ikke) (677-730) |
| 740-805 | 727-762 | ## 8. Bro-bindinger (731-740) |
| 836-871 | 793-795 | ### 11.1 v1 (423d9b20) → v2 (2069aa16) — pr. fund-id (fold-ind-rapport-r2 bærer tilstand + bevis; 19 af rækkerne blev IKKE båret i B4 og er rettet igen i 11.2) (802-839) |

## 2. Fund → tilstand → v2-afsnit (fra fold-ind-rapport-r2 §1 — producentens kort, ikke lukningsliste)

| fund-id | kilde | tilstand (planneren) | v2-afsnit (planneren) |
| --- | --- | --- | --- |
| A2-1 | angreb r2 (BLOKER) = FUND2-3 = NF-2 | **KRÆVER MATHIAS** | `plan.md:758` S-2 · `plan.md:201` K-7/ac-4 T7.10 · `plan.md:624` S-24 · `plan.md:23` §0 |
| A2-2 | angreb r2 (RET) — C: båret | **INDEN FOR MANDAT** | `plan.md:201` K-7/ac-4 T7.12 R |
| A2-3 | angreb r2 (BLOKER) | **RETTET M. BEVIS** | `plan.md:87` AK-DAEKNING · `plan.md:280` `_mapping_daekning_guard` · `plan.md:201` K-7/ac-4 (c) + `K-7/ac-4/neg-2` (tested) + `neg-6` (active) · `plan.md:558` Bid 5.1 pkt 3 · `plan.md:622` S-22 |
| A2-4 | angreb r2 (BLOKER) | **RETTET M. BEVIS** | `plan.md:84` AK-LOKATION-ANONYMISERET · `plan.md:291` W6 gate · `plan.md:201` K-7/ac-4 (d) + `K-7/ac-4/neg-5` · `plan.md:633` S-33 · `plan.md:712` Blok A |
| A2-5 | angreb r2 (BLOKER) | **RETTET M. BEVIS** | `plan.md:333` I6 · `plan.md:335` I8 · `plan.md:211` K-8/ac-2 (c) · `plan.md:199` K-7/ac-2 replay |
| A2-6 | angreb r2 (RET) | **RETTET M. BEVIS** | `plan.md:210` K-8/ac-1 T8.1 I · `plan.md:213` K-8/ac-4 T8.5 (R1) · `plan.md:223` K-9/ac-1 T9.1 · `plan.md:95` AK-DIREKTE-DML · `plan.md:217` binding K-8 |
| A2-7 | angreb r2 (RET) | **RETTET M. BEVIS** | `plan.md:113` T1.3 · `plan.md:128` T2.8 · `plan.md:141` T6.3 · `plan.md:143` T3.5 · `plan.md:154` T4.3 R · `plan.md:199` T7.5/T7.14 |
| A2-8 | angreb r2 (RET) | **RETTET M. BEVIS** | `plan.md:53` S-17 (§0.2) · `plan.md:185` K-6/ac-6 (+ T6.14) · `plan.md:189` K-6/ac-10 · `plan.md:617` S-17 · `plan.md:548` Bid 4 angrebs-spec |
| A2-9 | angreb r2 (RET) | **RETTET M. BEVIS** | `plan.md:41` ID-regler (ét effekt-bid) · `plan.md:232-242` bijektions-tabel · `plan.md:354` §3 (v) done · `plan.md:396` Bid 1 done · `plan.md:484` Bid 2 done · `plan.md:492` Bid 3 done · `plan.md:548` Bid 4 done · `plan.md:565` Bid 5 done · `plan.md:155` T6.8 locus R4 · `plan.md:142` K-3/ac-5 → 4 · `plan.md:153-154` K-4/ac-3/ac-4 → 3 · `plan.md:198,200` K-7/ac-1/ac-3 → 4 · `plan.md:202` K-7/S → 1 · `plan.md:210-215` K-8 → 4/5 · `plan.md:225` K-9/ac-3 → 5 |
| A2-10 | angreb r2 (RET) — C: delvist ægte | **RETTET M. BEVIS** | `plan.md:18` §0 · `plan.md:41` ID-regler · `plan.md:115` K-1/ac-5 · `plan.md:170` K-5/ac-4 · `plan.md:183` K-6/ac-4 · `plan.md:184` K-6/ac-5 · `plan.md:188` K-6/ac-9 · `plan.md:223` K-9/ac-1 (MH·UT) · `plan.md:224` K-9/ac-2 (MH·UT·FS) · `plan.md:116,130,172,190,215,226` S-rækker · `forventnings-manifest.json` |
| A2-11 | angreb r2 (BLOKER) | **INDEN FOR MANDAT** (m. FS-assert + synlig default) | `plan.md:211` K-8/ac-2 (a)-(e) + `K-8/ac-2/neg-1..3` · `plan.md:189` K-6/ac-10 audit-observation · `plan.md:348` §2.6 · `plan.md:636` S-36 · `plan.md:778` D-9 |
| A2-12 | angreb r2 (RET) | **RETTET M. BEVIS** | `plan.md:320` R12 · `plan.md:322-324` R14/R15/R16 · `plan.md:224` K-9/ac-2 breddeprøve + `K-9/ac-2/neg-2..3` · `plan.md:634` S-34 |
| A2-13 | angreb r2 (RET) | **RETTET M. BEVIS** | `plan.md:55` katalog-regel · `plan.md:83` AK-IMMUTABEL (TRUNCATE) · `plan.md:91` AK-FUNDAMENT-* splittet · `plan.md:96` AK-INTERN-EXEC · `plan.md:201` `K-7/ac-4/neg-3` (P0002) + `neg-4` (P0001) · `plan.md:210` `K-8/ac-1/neg-2` (8 handlers) + `neg-5` (trigger-fn S-probe) · `plan.md:212` K-8/ac-3 (TRUNCATE-guard) · `plan.md:213` K-8/ac-4 (V/requester/R−; `neg-4`) · `plan.md:224` K-9/ac-2 (apply undtaget) · `plan.md:266` trigger-ACL · `plan.md:275` `_kobling_historik_guard` stmt-trigger · `plan.md:637` S-37 · `plan.md:795` arv-note apply |
| A2-14 | angreb r2 (BLOKER) — C: ejer driver | **RETTET M. BEVIS** (kontrakt-KRAV; identitet `<udfyldes af driveren>`) | `plan.md:35` FA-5 · `plan.md:37` · `plan.md:743` §9 held-out-snit · `plan.md:788` BV-5 |
| A2-15 | angreb r2 (RET) — C: delvist/lav | **RETTET M. BEVIS** | `plan.md:97` AK-CI-KATALOG · `plan.md:198` K-7/ac-1 (b)/(c) + `K-7/ac-1/neg-1` · `plan.md:204` S7.1 |
| FUND2-1 | fresh-eyes r2 (medium) | **KRÆVER MATHIAS** | `plan.md:757` S-1 · `plan.md:573` V1 (+ variant S-1-B) · `plan.md:396` Bid 1 · `plan.md:711` Blok A |
| FUND2-2 | fresh-eyes r2 (mindre) | **INDEN FOR MANDAT** + bekræftelse B-4 | `plan.md:141` K-3/ac-4 neg-2 · `plan.md:300` W15 · `plan.md:768` B-4 |
| FUND2-3 | fresh-eyes r2 (medium) | **KRÆVER MATHIAS** (= A2-1) | `plan.md:758` S-2 · `plan.md:624` S-24 |
| FUND2-4 | fresh-eyes r2 (mindre) | **INDEN FOR MANDAT** + bekræftelse B-5 (analogi) | `plan.md:608` S-8 · `plan.md:294` W9 · `plan.md:769` B-5 |
| FUND2-5 | fresh-eyes r2 (mindre) | **INDEN FOR MANDAT** + synlig default D-1 | `plan.md:602` S-2 · `plan.md:770` D-1 |
| FUND2-6 | fresh-eyes r2 (mindre) | **RETTET M. BEVIS** (relabel) | `plan.md:767` B-2 · `plan.md:702` Blok A · `plan.md:587` V8 |
| NF-1 | planner K-genlæsning r2 | **INDEN FOR MANDAT** + bekræftelse B-1 (teknisk rest = A2-8, rettet) | `plan.md:53` S-17 · `plan.md:185` K-6/ac-6 · `plan.md:766` B-1 |
| NF-2 | planner K-genlæsning r2 | **KRÆVER MATHIAS** (= A2-1) | `plan.md:758` S-2 |
| D-1 | driver-observation | **RETTET M. BEVIS** | `plan.md:7` Formåls-note |
| R2-1 | slutlæsning r2 (RET) | **RETTET M. BEVIS** | `plan.md:199` K-7/ac-2 step (1) + `K-7/ac-2/neg-7` · `plan.md:557` Bid 5.1 pkt 2 · `plan.md:563` Bid 5.2 pkt (7) · `plan.md:87` AK-DAEKNING (active) · `plan.md:280` guard |
| R2-2 | slutlæsning r2 (RET) | **RETTET M. BEVIS** | `plan.md:211` K-8/ac-2 (e) · `plan.md:189` K-6/ac-10 audit-observation · `plan.md:298` W13 audit-kontrakt · `plan.md:796` arv-note |
| R2-3 | slutlæsning r2 (RET) | **RETTET M. BEVIS** | `plan.md:33` FA-3 · `plan.md:113` K-1/ac-3 · `plan.md:155` K-4/ac-5 · `plan.md:168` K-5/ac-2 · `plan.md:484,492,548` Bid 2/3/4 done · `plan.md:635` S-35 · `plan.md:788` BV-5 · `plan.md:743` §9 |
| R2-4 | slutlæsning r2 (RET) | **RETTET M. BEVIS** | `plan.md:152` K-4/ac-2 · `plan.md:168` K-5/ac-2 · `plan.md:563` Bid 5.2 rights-overlay (INGEN `audit/log`-grant) |
| R2-5 | slutlæsning r2 (proces) | **DRIVER** (lukket før v3: fuld audit `417d96b6` rekonstrueret) | `plan.md:11` (v3 læser den fulde audit-blob) |
| R2-6 | slutlæsning r2 (binding) | **DRIVER + RETTET M. BEVIS** (re-pin i v3) | `plan.md:20` implplan `0fdd5b1e` + D13-verifikation · `plan.md:733` §8 |
| R2-7 | slutlæsning r2 (mindre) | **RETTET M. BEVIS** | `plan.md:82` AK-DATO-DRIFT · `plan.md:331` I1-I4 step (1)/(2) |
| A-1 | angreb r1 (BLOKER) | **RETTET M. BEVIS** (via A2-6) | `plan.md:210` K-8/ac-1 T8.1 I + `K-8/ac-1/neg-1` · `plan.md:95` |
| A-4 | angreb r1 (BLOKER) | **KRÆVER MATHIAS** (S-2) + RETTET M. BEVIS (kompositionshuller A2-3/A2-4/A2-5) | `plan.md:758` S-2 · `plan.md:201` K-7/ac-4 (b)(c)(d) · `plan.md:333,335` I6/I8 |
| A-5 | angreb r1 (RET) | **RETTET M. BEVIS** (via A2-3) | `plan.md:87,280,201` |
| A-8 | angreb r1 (RET) | **RETTET M. BEVIS** (via A2-6/A2-7/A2-8) | `plan.md:113,128,141,143,154,185,199,210,213,223` |
| A-9 | angreb r1 (BLOKER) | **RETTET M. BEVIS** (via A2-8) | `plan.md:53,185,617` |
| A-11 | angreb r1 (RET) | **RETTET M. BEVIS** (via A2-13) | `plan.md:55-97` katalog · `plan.md:266` · `plan.md:210-213` |
| A-13 | angreb r1 (BLOKER) | **RETTET M. BEVIS** (via A2-9/A2-10/A2-14) | `plan.md:35,232-242,41` + manifest |
| A-14 | angreb r1 (RET) | **RETTET M. BEVIS** (via A2-12) | `plan.md:320-324,224,634` |
| FUND-1 | fresh-eyes r1 (medium) | **KRÆVER MATHIAS** (S-2) | `plan.md:758,624` |
| F01 | P-4 (MODSTRID) | **RETTET M. BEVIS** (via A2-6) | `plan.md:210` |
| F03 | P-4 (MODSTRID) | **KRÆVER MATHIAS** (S-2) | `plan.md:758` |
| F11 | P-4 (MODSTRID) | **RETTET M. BEVIS** (via A2-6/A2-7) | `plan.md:113,128,143,154,199,210,213,223` |
| U01 | P-4 (MANGLER KILDE) | **RETTET M. BEVIS** (via A2-14/A2-9/A2-10) | `plan.md:35,232-242` + manifest |
| U02 | P-4 (MANGLER KILDE) | **RETTET M. BEVIS** (via A2-13) | `plan.md:266,210` `K-8/ac-1/neg-2` + `neg-5` · `plan.md:637` S-37 |
| U03 | P-4 (MANGLER KILDE) | **RETTET M. BEVIS** (via A2-13) | `plan.md:213` K-8/ac-4 + `neg-4` |
| U04 | P-4 (MANGLER KILDE) | **RETTET M. BEVIS** (via A2-8) | `plan.md:53,185` |
| U05 | P-4 (MANGLER KILDE) | **RETTET M. BEVIS** (via A2-13) | `plan.md:55-97,201,210` |
| U06 | P-4 (MANGLER KILDE) | **RETTET M. BEVIS** + KRÆVER MATHIAS (S-2 for indirect) | `plan.md:199,201,333,335,758` |
| U07 | P-4 (MANGLER KILDE) | **RETTET M. BEVIS** (via A2-13) | `plan.md:47-49` ctx · `plan.md:210,212` |
| FUND-2 | BÅRET (v2) — RETTET M. BEVIS | `plan.md:669` §6 | max_rows attribueret til recon-2 |
| FUND-3 | BÅRET (v2) — RETTET M. BEVIS | `plan.md:589` V9 | citat ordret |
| FUND-4 | BÅRET (v2) — RETTET M. BEVIS | `plan.md:124` K-2/ac-1 · `plan.md:405` DDL-kommentar | »V-A« → S-1 |
| F05 | BÅRET (v2) — RETTET M. BEVIS | `plan.md:630` S-30 · `plan.md:252` | FORCE uniformt |
| F07 | BÅRET (v2) — RETTET M. BEVIS | `plan.md:631` S-31 · `plan.md:189` K-6/ac-10/neg-7 · `plan.md:348` | fundamentets self-approve-regel |
| F08 | BÅRET (v2) — RETTET M. BEVIS | `plan.md:573` V1 | nyt kodearbejde navngivet |
| F09 | BÅRET (v2) — RETTET M. BEVIS | `plan.md:333` I6 · `plan.md:575` V2 | callable-form; replay-effekt = A2-5 (rettet) |
| F10 | BÅRET (v2) — RETTET M. BEVIS | `plan.md:587` V8 | attribution rettet |
| F13 | BÅRET (v2) — RETTET M. BEVIS | `plan.md:623` S-23 · `plan.md:288-289` W3/W4 · `plan.md:199` K-7/ac-2/neg-3,4 | begge kontakt-RPC'er låst |
| F14 | BÅRET (v2) — RETTET M. BEVIS | `plan.md:575` V2 · `plan.md:669` §6 pkt 4 | konflation beskrevet korrekt |
| F16 | BÅRET (v2) — RETTET M. BEVIS | `plan.md:282` §2.3 indledning | skærpelse »valgt her« |
| U08 | BÅRET (v2) — RETTET M. BEVIS | `plan.md:354` §3 (iv) · `plan.md:223` K-9/ac-1 | OpenAPI-sentinels |
| U09 | BÅRET (v2) — RETTET M. BEVIS | `plan.md:571-637` §4 | »valgt her« gennemgående; indirect-undtagelsen = S-2 (accepteret ikke som mandat) |
| NF-3 | K-7/ac-3 · K-7/ac-1 · K-8/ac-1 · K-8/ac-2 · K-8/S · K-9/ac-3 | Effekt-bids er flyttet SENERE (Bid 4/5) for at overholde A2-9 — ingen ac er blevet svagere (samme cases, samme bevisformer), men Bid 1/2 lukker nu færre obligationer. Forventningslistens »effekt-bid (P v1)«-kolonne afviger derfor for disse (den var plan v1's). | INDEN FOR MANDAT — forventningslisten binder ac/bevisform/negativer (§5 pkt. 6), ikke effekt-bid; instruks pkt. 16 kræver cyklusfri bid-orden. Ingen ac svækket. Synligt her. |
| NF-4 | K-4/ac-4 | T4.3 omdisponeret fra I til R (immutability-guarden gør omskrivning urepræsenterbar). K-4's targeted-gulv består (8 I). Bevisformen for ac-4 er UDVIDET til UT + FS (historik-genlæsning ved C10) — stærkere, ikke svagere. | INDEN FOR MANDAT — D10 (redundant værn gøres ikke isoleret nødvendigt); C's dom (A2-7) accepterer redundans. |
| NF-5 | K-9/ac-2 | `pending_change_apply` er undtaget fra »hver handling som R− → AK-PERM« fordi fundamentet ikke har en page-gate på apply (`f49e7d5b:220`). Enhver authenticated kan udløse apply af en DUE, APPROVED pending (samme effekt som cron). Det er en fundament-egenskab, ikke en pakke-svækkelse, men den er ny-synliggjort. | INDEN FOR MANDAT (K:185/K:232 disponerer `20260518000004` behandlet → K-6/K-8; arv-note `plan.md:795`) — driveren afgør om det skal på Mathias-bordet som kendt grænse (ikke tilføjet listen: ingen forretningskonsekvens ud over at »gennemfør nu« kan udløses af en anden rettighedshaver når ændringen alligevel er due). |
| NF-6 | K-1/ac-5 · K-5/ac-4 · K-6/ac-4 · K-6/ac-5 · K-6/ac-9 | Alias-udskrivningen (A2-10) gav disse obligationer egne negativ-ID'er der er »samme case som« mål-obligationens. Ingen ny logik; casen køres én gang. | INDEN FOR MANDAT (forventningsliste §5 pkt. 6 »alias skrives ud«; manifest-skema `aliases`). |

## 3. Berørte forpligtelser i tilføjede linjer (afhængigheds-lukning — B4 dømmer DISSE og deres negativer/bids, ikke kun diff-linjerne)

| K/ac-ID | forekomster i tilføjede linjer |
| --- | ---: |
| K-1/S | 5 |
| K-1/ac-1 | 2 |
| K-1/ac-2 | 2 |
| K-1/ac-3 | 7 |
| K-1/ac-4 | 2 |
| K-1/ac-5 | 7 |
| K-2/S | 5 |
| K-2/ac-1 | 5 |
| K-2/ac-1/neg-1 | 1 |
| K-2/ac-2 | 4 |
| K-2/ac-3 | 3 |
| K-2/ac-4 | 2 |
| K-2/ac-5 | 6 |
| K-2/ac-6 | 3 |
| K-3/ac-1 | 2 |
| K-3/ac-2 | 2 |
| K-3/ac-3 | 3 |
| K-3/ac-3/neg-3 | 2 |
| K-3/ac-3/neg-4 | 2 |
| K-3/ac-4 | 11 |
| K-3/ac-4/neg-1 | 1 |
| K-3/ac-4/neg-2 | 3 |
| K-3/ac-5 | 7 |
| K-3/ac-6 | 8 |
| K-3/ac-6/neg-1 | 1 |
| K-3/ac-6/neg-2 | 1 |
| K-3/ac-6/neg-3 | 1 |
| K-4/ac-1 | 2 |
| K-4/ac-2 | 6 |
| K-4/ac-3 | 5 |
| K-4/ac-3/neg-1 | 1 |
| K-4/ac-4 | 6 |
| K-4/ac-5 | 7 |
| K-4/ac-6 | 2 |
| K-4/ac-7 | 2 |
| K-4/ac-8 | 5 |
| K-4/ac-8/neg-2 | 1 |
| K-4/ac-9 | 9 |
| K-4/ac-9/neg-1 | 1 |
| K-5/S | 5 |
| K-5/ac-1 | 5 |
| K-5/ac-1/neg-1 | 1 |
| K-5/ac-2 | 8 |
| K-5/ac-2/neg-1 | 1 |
| K-5/ac-3 | 2 |
| K-5/ac-4 | 6 |
| K-5/ac-5 | 2 |
| K-6/S | 5 |
| K-6/ac-1 | 2 |
| K-6/ac-10 | 5 |
| K-6/ac-10/neg-7 | 1 |
| K-6/ac-2 | 1 |
| K-6/ac-4 | 5 |
| K-6/ac-4/neg-1 | 1 |
| K-6/ac-5 | 5 |
| K-6/ac-6 | 6 |
| K-6/ac-7 | 1 |
| K-6/ac-9 | 5 |
| K-7/S | 10 |
| K-7/ac-1 | 10 |
| K-7/ac-2 | 8 |
| K-7/ac-2/neg-7 | 1 |
| K-7/ac-3 | 4 |
| K-7/ac-4 | 7 |
| K-7/ac-4/neg-3 | 1 |
| K-8/S | 6 |
| K-8/ac-1 | 12 |
| K-8/ac-1/neg-1 | 1 |
| K-8/ac-2 | 12 |
| K-8/ac-3 | 5 |
| K-8/ac-4 | 10 |
| K-8/ac-4/neg-1 | 1 |
| K-8/ac-5 | 3 |
| K-9/S | 3 |
| K-9/ac-1 | 14 |
| K-9/ac-1/neg-1 | 2 |
| K-9/ac-2 | 9 |
| K-9/ac-3 | 9 |
| K-9/ac-3/neg-1 | 1 |

| Bid | forekomster i tilføjede linjer |
| --- | ---: |
| Bid 1 | 19 |
| Bid 2 | 27 |
| Bid 3 | 16 |
| Bid 4 | 24 |
| Bid 5 | 18 |
| Bid 5.1 | 2 |
| Bid 5.2 | 3 |

## 4. v2-sektionsoversigt (til navigation)

- Formål — hvad pakken leverer (linje 3-8)
- 0. Input-verifikation & bindinger (linje 9-24)
- 1. Krav-ID-matrix (bijektion) (linje 103-106)
- 2. Funktions- og tabel-register (fuld kontrakt — A-11 · U02 · U05) (linje 246-249)
- 3. Bid-opdeling (afhængigheds-ordnet · prover-bevisbar · angrebs-spec-krav + risiko-flag pr. bid) (linje 352-355)
- 4. Plan-fase-afgørelser (V1-V13 fra kravets liste · S-1..S-32 supplerende) — alle »valgt her« (linje 569-640)
- 5. Ordbogs-arv (planen arver Mathias' navne — mapping-tabel) (linje 641-666)
- 6. Faldgruber fra recon-2 — synligt adresseret (linje 667-676)
- 7. Repo-doc-tekst 1:1 (forud-godkendte blokke til Fase 6 — anvendes, fabrikeres ikke) (linje 677-730)
- 8. Bro-bindinger (linje 731-740)
- 9. E20-snit (P-8-beskæring — plan-gatens dom) og overdragelser (linje 741-748)
- 10. HALT-flag · KRÆVER MATHIAS · den samlede Mathias-liste · build-verifikationspunkter · arv-noter (linje 749-799)
- 11. Ændringslog (linje 800-801)

