# ANALYSE-r3 — buildability delta-dom (aktør: code), krav-gate RUNDE 3 (v4-delta)

Pakke: lokations-skabelon · run_id: fase2-buildability-code-r3 · bygger oven på min runde 2-analyse (ANALYSE.md i wt-b2-code, raw sha256 9668dbacd3ebdc7963dbc7ab6b6d7108d01a45ab40282fd3b5fec39d74306485, verdikt PASS på blob 43b3e0aa).

## 1. Input-verifikation

- Pinned commit `d5fa4bed145505461a7d6af5e9f3b1646c2ba55f` (git rev-parse HEAD — verificeret).
- Krav-doc @ blob `b9c5249b7ab90d8898992bde61b8cb018bc4f561` (git rev-parse HEAD:docs/sandhed/krav/lokations-skabelon-krav.md — verificeret).
- Delta set SELV med `git diff 43b3e0aa b9c5249b`: præcis 2 hunks, 2 insertions / 2 deletions, begge 1:1-linjeudskiftninger (linje 54 og linje 181) — INGEN andre ændringer, ingen linjeforskydning.
- Øvrige bindinger uændrede mod r2: recon/recon.md @ `7fbd3a2f` (identisk), alle tre kode-evidens-blobs identiske (`71cadac3`, `359c0b23`, `6083fecd`) — mine linjelæsninger fra r2 gælder uforandret.
- Ledger: `f5b17de8` = ren append af M-35 (workflow-dom om Codex-integrationspunkter, ikke krav-stof; verificeret med blob-diff mod `6d41d216`). Krav-doc'ens citatgrundlag (M-1..M-34 @ ledger-blob 6d41d216) er intakt.

## 2. Delta-dom: ændrer de 4 linjer PASS-konklusionen?

**Nej — PASS består og styrkes.** De to ændrede linjer disponerer præcis mine fire r2-noter:

- **N1 (K-3, linje 54):** M-17-citatet er nu VERBATIM mod ledgeren (»loaktion kun have klienter … loaktioner kan godt fravælge«) — verificeret tegn-for-tegn mod ledger-rækken M-17. Min eneste citat-ærligheds-afvigelse er dermed lukket; "ingen parafrase i anførselstegn"-erklæringen holder nu også for K-3.
- **N2 (plan-fase-listen, linje 181):** ny afgørelse "anonymiserings-vej for gruppens kontakt-felter — rigtige kolonner vs. registry-jsonb" med den KORREKTE kode-kendsgerning citeret ("jsonb walkes ikke af den generiske anonymisering" — matcher min r7h-linjelæsning) og med K-7 ac 4's dæknings-gate som fejlsikring. Planneren kan ikke længere vælge tavst/uinformeret.
- **N3 (linje 181):** type-krav ved oprettelse har nu default ("valgfri ved oprettelse, krævet før rabat-brug i trin 29") — fjerner spændingen mod recon-bøtte 2's "type-løs leverandør"-læsning uden at ændre substans: trin 29 møder aldrig en type-løs gruppe i rabat-brug. Kodbar 1:1 (nullable kolonne + guard i trin 29's forbrugsflade).
- **N4 (linje 181):** fravalgs-/frakoblings-handlinger på nedlagt lokation har nu deklareret default ("afvises, som til-valg i K-4 ac 8") — kanten er ikke længere udækket; effekt-harnessen i Fase 3 har et forventet udfald. Symmetrisk med K-4 ac 8 og kodbar med samme RPC-guard-mønster (P0002/22023). Ingen konflikt med M-19 (genåbnings-arv): workflowet "genåbn først, handl derefter" var allerede kravets linje.

Alle fire er buildability-neutrale eller -styrkende: ingen nye acceptkriterier, ingen ny substans ud over defaults inden for kravets ramme (defaults er plan-fase-dispositioner Codex kan angribe i plan-gaten), ingen modsigelser introduceret. Struktur/værdi-skellet og scope-ærligheden er uberørte.

## 3. Evidens-re-verifikation mod ny blob

Begge hunks er 1:1-udskiftninger ⇒ al linjenummerering er uforskudt. Mine 8 spans fra r2 genbruges uændret; indholdet er kun ændret inden for K-3-spannet [52,67] (linje 54 — læst i den nye blob, både via diff og direkte opslag i b9c5249b) og uden for alle øvrige spans. Excerpt-hashes beregnes af verdikt-byg mod den NYE blob @ pinned commit. Recon-/migrations-spans peger på blob-identiske filer.

## 4. Konklusion

**PASS.** v4-delta'et implementerer mine egne r2-noter loyalt (N1 verbatim-rettet; N2/N3/N4 synligt disponeret i plan-fase-listen med ærlige kode-kendsgerninger og defaults). Alle 9 K-krav er fortsat byggelige med testbare acceptkriterier; ingen nye huller; ingen uafgørlig usikkerhed. Ingen rest-noter til bord-testen fra denne akse.
