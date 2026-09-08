# ANALYSE — buildability-verdikt (aktør: code), krav-gate RUNDE 2 (gruppe-modellen)

Pakke: lokations-skabelon · Fase 2 pkt. 4 · run_id: fase2-buildability-code-2026-09-03

## 0. Input-verifikation (læst ved OID)

- Pinned commit: `8e1830bb84e85fb8e893ce6fed37c89a11451a4a` (verificeret `git rev-parse HEAD`).
- Krav-doc `docs/sandhed/krav/lokations-skabelon-krav.md` @ blob `43b3e0aa760e2060391b70f018ef64ca8fe34284` (verificeret via `git rev-parse HEAD:docs/sandhed/krav/lokations-skabelon-krav.md`) — læst i fuld længde (427 linjer).
- Recon `recon/recon.md` @ blob `7fbd3a2f43c03ce239aa81e20483326bf438463c` (verificeret) — læst: hele bøtte 2, bøtte 3, konflikter, usikkerheder, forretnings-flade-enumeration samt bøtte 1's fund for alle skabeloner kravene læner sig mod.
- Ledger `plan-build/lokations-skabelon/mathias-ord.md` @ blob `6d41d216...` (verificeret — matcher krav-doc'ens angivelse) — læst i fuld længde; alle M-citater i krav-doc'en er holdt mod ledgeren (se §3).
- Kode læst direkte (linjelæsning, ikke kun recon): `20260521000001_t10_tables.sql` (domæne-tabel-skabelon), `20260518000001_t9_org_nodes.sql` (cycle-check + leaf-trigger), `20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql` (nuværende anonymiserings-body), `20260518000000_t9_pending_changes.sql` (fortrydelses-maskineri + undo_settings), `20260521000009_t10_client_rpcs.sql` (upsert + dedikeret status-toggle-RPC), `20260518000003_t9_employee_node_placements.sql` (versioneret placement-mønster).

Akse: KUN "kan det kodes? er der huller?" — ingen forretnings-merit, ingen rettelser af krav.

## 1. Verdikt pr. K-krav

### K-1 Lokation som central master-data — BYGGELIG, testbar

- ac 1 (blankt navn AFVISES): 1:1-skabelon findes — `clients.name text not null check (length(trim(name)) > 0)` (t10_tables.sql:26). Effect-harness: INSERT via RPC med blank navn → 22023/CHECK.
- ac 2 (type uden for enum AFVISES): CHECK IN-mønstret er gennemgående (status/operation/source_type-CHECKs i fundamentet). Testbar med navngiven afvisning.
- ac 3 (prisændring ændrer aldrig fortiden): to kendte mekanikker bærer det — per-row audit m. old/new_values (stork_audit, immutable) og/eller versionering (org_node_versions-mønstret). Kravet låser slut-effekten ("hvad der gjaldt hvornår kan altid ses"), ikke repræsentationen; begge veje er testbare (skriv pris, læs historik). Forbruget er eksplicit skubbet til trin 24/29 — ingen skjult afhængighed.
- ac 4 (ingen økonomi-kobling): strukturel fraværs-invariant — mekanisk verificérbar (ingen FK/kolonner mod core_money; fitness cross-schema-fk-discipline tillader i forvejen kun employees + auth.users som cross-schema-FK-mål). "Umulig" håndhæves strukturelt = konsistent med kravets egen UMULIGT-kategori.
- ac 5 (aldrig udvikler-indgreb): bevises via K-9's handlings-flade (offentlige RPC'er). Testbar.
- Kendte plan-fase-huller er deklareret synligt (valuta/tom-pris) — ikke tavse.

### K-2 Stande — BYGGELIG, testbar

- Ejerkæden gruppe→lokation→stand med standen som blad: begge repræsentationer (én selv-refererende tabel jf. §1.12, eller to tabeller) kan kodes; kravet låser invarianterne, ikke formen.
- ac 1 (cyklus AFVISES): skabelonen findes ordret — `_org_node_cycle_check` (t9_org_nodes.sql:105-146, P0001 org_node_cycle_detected, dybde-loft 100). I en to-tabel-model bliver cyklus strukturelt umulig — også en gyldig opfyldelse af et UMULIGT-krav.
- "under-stande findes ikke": leaf-enforcement-skabelonen findes ordret — `_org_node_team_no_children_check` (t9_org_nodes.sql:157-190, P0001 hvis parent er blad-type). Direkte genbrugelig.
- ac 2 (entydig pris-opløsning): NULL-pris + COALESCE ved læsning (aldrig kopi) — trivielt kodbar, testbar ("aldrig to sandheder").
- ac 3 + ac 4: håndhævelses-punktet er ærligt placeret (K-4's aktiv-opslag / booking-leddet trin 24); pakkens egen leverance (stand-identitet, opslags-flade) er mekanisk testbar nu. Nedstrøms-afhængigheden er deklareret i "IKKE i scope" — ingen tavs udvanding.
- ac 5 (stande består ved nedlæggelse): ingen DELETE-vej (t10-mønstret: ingen delete-policy = default-deny) + test at nedlæg-RPC ikke rører stande. Testbar.
- ac 6 (mindst 1 stand): invarianten er testbar som slut-effekt, og den er reelt håndhævbar i denne kodebase NETOP fordi al skrivning går gennem SECDEF-RPC'er (20260607110004 revoker al direkte DML) — opret-RPC'en kan skabe lokation+stand atomisk, slet/deaktivér-RPC'en kan afvise fjernelse af sidste stand. "Hvordan" er flyttet synligt til plan-fase; det efterlader ikke byggeren gættende på invarianten.

### K-3 Gruppe som ejer — BYGGELIG, testbar

- Gruppe-entitet: domæne-tabel-skabelonen (t10 clients) kopierer 1:1 (navn-CHECK, FORCE RLS, audit, felt-registry-mønster m. client_field_definitions som forlæg).
- ac 1/ac 2 (lokation uden gruppe / fritekst-gruppe AFVISES): NOT NULL FK — strukturelt, testbart.
- ac 3 (gruppe uden navn AFVISES): CHECK som ac 1 i K-1.
- ac 4 (kobling på gruppen, arv af ALLE lokationer inkl. senere; til-valg uden for gruppen AFVISES): kodbar begge veje — afledt prædikat (ret = koblet ∧ ¬fravalgt ∧ ¬nedlagt) giver "også senere lokationer" gratis; materialiseret variant kræver sync-trigger. Valget er deklareret plan-fase ("afledes eller materialiseres"). Junction-skabeloner findes (client_node_placements: FK'er, partial UNIQUE på åben række, EXCLUDE no-overlap).
- ac 5 (gruppe med lokationer kan ikke slettes): FK RESTRICT — ordret mønster i t10.7 (client_node_placements.client_id → clients RESTRICT).
- ac 6 (fravalg pr. lokation, reversibelt): fravalgs-tabel (lokation×klient) — trivielt kodbar; testbar (opslag før/efter).
- Gruppe/leverandør én-eller-to-entiteter + type-krævet-ved-oprettelse: deklareret plan-fase. Ingen af udfaldene blokerer kodning; kravet pinner de bindende invarianter (lokation har gruppe; gruppen bærer type-feltet som rabat-anker). Se dog note N3 (§4).

### K-4 Status-livscyklus — BYGGELIG, testbar

- ac 1 (enum-CHECK), ac 2 (årsag + audit): stork_audit håndhæver allerede change_reason NOT NULL m. P0001 — mutation uden årsag er umulig på audit-trigget tabel; skift auditeres per-row. 1:1.
- ac 3 (skrivning uden om dedikeret handling AFVISES): dobbelt værn findes som skabelon — 20260607110004 (al direkte DML revoked) + upsert-RPC der bevidst IKKE rører status (t10 client_upsert: "UPDATE rør IKKE is_active. Brug client_set_active") + dedikeret toggle-RPC m. permission/årsag/P0002 (client_set_active, t10_client_rpcs.sql:72-105). Lokations-status-RPC'en er en direkte udvidelse af dét mønster til tre-værdi-enum.
- ac 4 (historik kan ikke overskrives): audit-immutability (BEFORE UPDATE/DELETE RAISER, TRUNCATE blokeret) — findes; evt. status-historik-tabel kan genbruge samme immutability-triggere (fitness IMMUTABLE_GUARDS-registrering).
- ac 5 (aktiv-opslag pr. dato): read_at(date)-mønstret findes (t9_read_rpcs: read() = read_at(current_date)); dato-svar kræver dateret status-lagring — det versionerede mønster (effective_from/to, CHECK from<to, partial UNIQUE åben, EXCLUDE no-overlap) findes ordret i employee_node_placements. Testbar inkl. historiske datoer.
- ac 6 (til-/fravalg i dvale tilladt): positivt kriterie — testbart (handling lykkes i dvale).
- ac 7 (genåbning via samme handling), ac 8 (til-valg på nedlagt AFVISES): RPC-guards — client_node_place-mønstret viser præcis formen (pre-check → P0002/22023-afvisninger). r7d-disciplinen (status='active' AND is_active) er kendt constraint på læsere og er forenelig.
- ac 9 (nedlæggelse kobler af, stande består, genåbning arver): kodbar i begge modeller — afledt (status i prædikatet: nedlagt ⇒ ingen effektiv ret; genåbning ⇒ retten vender automatisk tilbage, M-19) eller materialiseret (nedlæg-RPC lukker rækker transaktionelt). Slut-effekterne ("nedlagt lokation med aktive klienter kan IKKE findes"; dato-opslag svarer historisk korrekt) er testbare uafhængigt af valget.

### K-5 Hvile — BYGGELIG, testbar; scope-ærligheden er reel

- ac 5/ac 3/ac 4 (antal hviledage pr. lokation, kun UI-valg udløser, straks-virkning m. rettighed+audit): konfig-felt (nullable = intet valg = ingen auto-hvile, princip 4-konsistent) + direkte SECDEF-RPC (t10-mønstret: has_permission → 22023 ved blank årsag → 42501 uden rettighed). Straks-virkningen (afledt M-29.5, fremlagt som bekræftelses-linje m. eksplicit fallback til K-6 ac 10-mekanismen hvis Mathias siger stop) er buildability-neutral: begge udfald har færdige skabeloner (direkte RPC hhv. pending_changes). Ingen gæt påkrævet af byggeren.
- ac 1 (booking under hvile AFVISES — ingen omgåelse): leveres som afvisnings-opslag (via K-4); "ingen handling der tillader booking uden synlig afslutning" er strukturelt (ingen bypass-RPC leveres; break-glass er eksplicit uden for pakke-fladen, konsistent med M-27b "nej"). Testbar på opslags-fladen.
- ac 2 (stop før tid: uden rettighed AFVISES; med rettighed auditeret, lokation aktiv): RPC-guard + audit — 1:1-mønstre.
- Scope-ærligheden er præcis dér recon kræver den: udløsningen ved kampagne-slut KAN ikke bygges nu (bookinger findes ikke) og er deklareret trin 24-afhængighed med navngivet rest (annullering, evalueringsniveau). Det er den korrekte buildability-disposition — ikke et hul.
- Dvale-status vs. hvile-mekanisme én-eller-to model-ting: deklareret plan-fase med bindende forretnings-sandhed (samme oplevelse, ingen omgåelse). Begge modeller er kodbare; slut-effekterne er ens testbare.

### K-6 Klient-tilladelser (gruppe-modellen) — BYGGELIG, testbar

- ac 1 (kobling uden klient/gruppe): NOT NULL FK'er. ac 2 (dobbelt kobling): partial UNIQUE på åben række — ordret skabelon (employee_node_placements_open_per_employee; client-varianten ligeså).
- ac 3 (ingen slutdato-krav — åben kobling AFVISES IKKE): det versionerede mønster har netop åben effective_to som normaltilstand. Positivt kriterie, testbart.
- ac 4/ac 5 (arv af alle lokationer inkl. senere; fravalg pr. lokation, reversibelt, øvrige lokationer uberørt): se K-3 ac 4/ac 6 — afledt-eller-materialiseret er deklareret plan-fase; begge kodbare, slut-effekterne testbare.
- ac 6 (frakobling fra dato, fortiden urørt; historik-omskrivning AFVISES): dateret lukning (effective_to) + audit-immutability. 1:1-mønstre.
- ac 7 (opslag klient×lokation×dato, også historisk): date-parametriserede læsere findes (acl_*_at, stork.t9_read_at_date-policy) — opslags-RPC'en er en komposition af daterede prædikater. Testbar med historiske datoer.
- ac 8 (flere klienter samtidig OK): positivt, testbart. Grænsen (1 pr. stand) er korrekt henvist til K-2 ac 4/trin 24.
- ac 9 (nedlæggelse kobler af; genåbning arver; dvale rører intet): se K-4 ac 9. Testbar som dato-opslags-effekter.
- ac 10 (uden rettighed AFVISES; daterede ændringer → godkendelse + fortrydelses-periode): hele maskineriet findes (pending_changes m. status-livscyklus-CHECKs, undo_settings 0..30 dage pr. change_type, approve m. self-approve-forbud, central apply-gate, dispatcher udvidbar pr. pakke via CREATE OR REPLACE; nye change_types kræver kendte følge-udvidelser: select-policy-gren + approve-mapping — alt dokumenteret i recon). Hvilke handlings-typer der er daterede vs. direkte er deklareret plan-fase ("direkte-vs-godkendelses-mekanik pr. handlings-type") — recon'ens HALT-flag om pending-vs-direkte er dermed disponeret i kravet, ikke efterladt åbent.
- Nedstrøms-noten (eksisterende bookinger ved frakobling → trin 24) er deklareret.

### K-7 Klassifikation/persondata/anonymisering — BYGGELIG, testbar (med én plan-note, N2)

- ac 1 (uklassificeret kolonne blokerer): migration-gate STRICT i CI — findes, fail-closed. Testbar mekanisk.
- ac 2 (gruppens kontaktperson anonymiserbar; sletning AFVISES): infrastrukturen findes (mappings m. lifecycle, strategier, generic_apply, entity-wrapper-mønster p1c, state-log m. replay). VIGTIG kode-kendsgerning verificeret ved linjelæsning af nuværende body (r7h): `anonymize_generic_apply` itererer KUN pii_level='direct' KOLONNER; jsonb_field_strategies snapshottes men walkes ikke, og 0 direct-kolonner → P0001. Konsekvens: lægges kontakt-felterne som rene registry-jsonb-nøgler (clients.fields-mønstret), går standard-apply-vejen ikke uden udvidelse. Det er IKKE et krav-hul: (a) kravet dikterer ikke repræsentationen (felt-registry-udformning er deklareret plan-fase), (b) dispatcheren er config-drevet — en gruppe-mapping kan registrere sin egen internal_rpc_anonymize (data, ikke kode), (c) ac 4's dæknings-gate gør at vejen ikke kan tabes tavst. Se note N2 til plan/bord.
- ac 3 (default = intet): registry-defaults + princip 4 — findes.
- ac 4 (dækning i leverancen; lokations-anonymisering hviler til aktivt PII-valg): anonymized_at som inaktiv struktur er uproblematisk (verify-cron sammenligner state-rækker mod master; ingen state = ingen inkonsistens). Testbar.
- Kendt bi-krav fra koden (ikke modsigelse): 'permanent'-retention på nye tabeller kræver is_permanent_allowed-udvidelse (d1c-trigger) — kopiér-alt+tilføj-mønstret findes (t10.2); audit-PII-hash kræver at klassifikationen ER der når triggeren fyrer (LENIENT-fælden) — klassifikation i samme migration løser det (t10.3-mønstret).

### K-8 Adgang/audit/fortrydelse — BYGGELIG, testbar

- ac 1-4: er fundamentets eksisterende, verificerede adfærd (revoke-alt + FORCE RLS + session-var-policies som defense-in-depth; stork_audit m. P0001; immutability; has_permission/grants m. default-deny og synlighed≠handling). Kravet føjer sig efter reglerne — recon bøtte 1 bekræfter hver AFVISER-adfærd.
- ac 5 (sider tildelbare fra dag ét; superadmin dækket): seed-skabelonen findes 1:1 (t10_seed_permissions: pages/tabs/grants ON CONFLICT under t9_write_authorized). Kendt fælde er dokumenteret i recon og fanget af CI: superadmins area-grants blev kun seedet for dengang-eksisterende areas — nyt lokations-area SKAL seedes eksplicit, og m1_permission_matrix-testen gør manglende dækning rød. Testbar mekanisk.

### K-9 UI-styrbarhed — BYGGELIG, testbar

- ac 1/ac 2: bevis-punktet er korrekt konstrueret for et core-lag-trin: handlings-fladen (offentlige RPC'er, §1.9) ER den flade UI kalder 1:1, så "ingen udvikler/ingen tekniske privilegier" kan effect-testes nu (kald alle RPC'er som authenticated rettighedshaver). Lag F-resten er deklareret, ikke udvandet.
- ac 3 (strukturelt forbud kan ikke slås fra i UI): strukturelle værn er CHECK/trigger/revoke — der findes ingen konfig-flade der deaktiverer dem, og en sådan ville kræve migration. Testbar som fraværs-/afvisnings-effekt.
- Struktur/værdi-skellet (M-24) er konsistent gennemført i alle K ("Struktur (umuligt)" vs "Værdi (UI)") — jeg fandt ingen "umulig" ting der ikke kan håndhæves strukturelt, og ingen "konfigurerbar" værdi der er hardkodet i kravet.

## 2. UMULIGT/KONFIGURERBART-konsistens (tvær-tjek)

Gennemgået pr. K: alle UMULIGT-punkter har en strukturel håndhævelses-vej i eksisterende mønstre (CHECK, NOT NULL FK, partial UNIQUE, EXCLUDE, triggere, revoke, immutability, CI-gates); alle KONFIGURERBART-punkter er værdier (navne, typer, priser, hviledage, koblinger, fravalg, perioder, klassifikations-valg) uden hardkodning i kravet. Ingen kategori-fejl fundet.

## 3. Kilde-ærlighed (ledger-tjek)

Alle krav-bærende citater holdt mod `plan-build/lokations-skabelon/mathias-ord.md` (M-1..M-34): M-12, M-13, M-14, M-17, M-18, M-19, M-21, M-23, M-24, M-25(.1/.2/.4), M-27(a/b/c), M-28, M-29(.1/.5), M-30(.2/.4) — alle findes verbatim i ledgeren, og krav-doc'ens Grundlag gengiver dem ordret (ellipser markeret). Under-nummereringen (M-25.1, M-29.5, M-30.2 …) refererer entydigt til nummererede delsvar inde i ét ledger-ord — sporbar. Runde 2-substansen (gruppe-modellen M-17/M-18, genåbnings-arv M-19, hviledage M-21, maks 1 klient pr. stand M-29) er korrekt bærende i K-2/K-3/K-4/K-5/K-6. Én mindre afvigelse fundet — se N1.

## 4. Noter, spørgsmål og forslag (til claude-ai-rollens bord-test — IKKE rettelser)

- **N1 (citat-ortografi, mindre):** K-3's HVAD-afsnit citerer M-17 i anførselstegn med normaliseret stavning ("lokation kun have klienter … lokationer kan godt fravælge") hvor ledgeren har »loaktion … loaktioner«. Grundlag-afsnittet (linje 9) gengiver korrekt verbatim. Substansen er identisk, men krav-doc'en erklærer selv "Ingen parafrase i anførselstegn" (linje 424) og ledgeren kræver stavefejl bevaret. Forslag til bord-test: enten verbatim-ret citatet i K-3 eller flyt normaliseringen uden for anførselstegn. Blokerer ikke buildability.
- **N2 (plan-note, K-7):** Nuværende `anonymize_generic_apply` (r7h) anonymiserer kun direct-klassificerede kolonner — jsonb-poser walkes ikke, og audit-PII-hash af jsonb-nøgler kræver en tabel-specifik special-case (clients.fields-præcedens; ingen generisk walking). Vælger planen registry-jsonb til gruppens kontakt-felter, skal leverancen ENTEN bruge rigtige kolonner for persondata, ELLER registrere en entity-specifik internal_rpc_anonymize, ELLER udvide generic_apply — plus audit_filter_values-special-case. K-7 ac 4's dæknings-gate fanger det, så det kan ikke tabes tavst; noteres så planneren vælger bevidst.
- **N3 (spørgsmål, K-3, lille):** K-3 udskyder "om typen er krævet ved oprettelse" til plan-fasen, mens recon'ens bøtte 2-læsning af §1.12 formulerer "forbyder type-løs leverandør (typen er forretningsbærende)". Ingen verbatim doc-modsigelse (typen forbruges først i trin 29), og begge udfald er kodbare — men bord-testen kan billigt afklare om plan-rammen må lande på "type valgfri ved oprettelse, krævet før rabat-brug", så trin 29 aldrig møder en type-løs gruppe.
- **N4 (kant-spørgsmål, K-4/K-6, lille):** Til-valg på nedlagt AFVISES (K-4 ac 8); fravalgs-/frakoblings-HANDLINGER på en nedlagt lokation er ikke eksplicit dækket af et kriterie (nedlæggelsen har allerede koblet alle af). Kanten hører naturligt under den deklarerede plan-fase-afgørelse "om fravalg består gennem nedlæggelse og genåbning" — nævnes så effekt-harnessen i Fase 3 vælger forventet udfald bevidst frem for tilfældigt.
- **N5 (bekræftelses-linjerne):** De to afledninger (K-1: lokation uden klienter; K-5 ac 3: straks-virkning) er begge buildability-neutrale — begge udfald har færdige skabeloner. Ingen indvending fra denne akse.

## 5. Recon-usikkerheder holdt mod kravet

Recon'ens HALT-flag er alle enten disponeret i krav-doc'en (pending-vs-direkte → K-6 ac 10 + plan-fase-listen; break-glass → lukket m. M-27b; "aktiv lokation"-flertydighed → lukket m. M-25.1; enum/cooldown/tilladelses-semantik → lukket m. runde 2-ordene M-17/M-18/M-19/M-21/M-25/M-29/M-30) eller bygge-ramme uden krav-konsekvens (live-eksponering, CI-token — begge fail-closed). Claude-ai's 12 intet-data-flag er alle synligt disponeret i dispositions-tabellen. Jeg fandt ingen recon-kendt constraint der modsiger et K-krav.

## 6. Konklusion

**PASS.** Alle 9 K-krav er byggelige mod eksisterende skabeloner i kodebasen, hvert acceptkriterie er formuleret som testbar slut-effekt (positivt udfald + navngiven afvisning eller strukturel umulighed), UMULIGT/KONFIGURERBART-skellet er konsistent, nedstrøms-afhængigheder (trin 24/29, lag F) er deklareret i stedet for tavst udvandet, og plan-fase-beslutningerne er flyttet synligt med bindende invarianter. Ingen reelle huller; ingen uafgørlig usikkerhed. Noterne N1-N4 er spørgsmål/forslag til bord-testen, ikke blokeringer.
