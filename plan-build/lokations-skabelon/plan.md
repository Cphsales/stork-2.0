# lokations-skabelon — plan (krav_oid 9402164d · recon2_oid 2bdbb122 · status UDKAST)

## Formål — hvad pakken leverer

Lokations-skabelonen: fysiske lokationer med stande (placements), grupper (ejere), klient-tilladelser (hvilke klienter må stå hvor), status-livscyklus og hvile-regler som central master-data — UI-styret, auditeret og klar til at bære bookinger og resten af FM-kæden (trin 24-29) uden om-design. Fundamentet for hele FM-grenen.

*(Formålsblokken er byte-identisk med kravets Formål — governance-check kræver identisk formålsblok på tværs af krav/plan/status; `scripts/governance-check.mjs:273-326 @ f3012195`.)*

## 0. Input-verifikation & bindinger

- Pinned commit: `ae73d833b0c18d6474c93292d1c6a63e44aac1cf` (`git rev-parse HEAD` verificeret i dette workdir).
- KRAV (immutabelt, gate-åbent, planens ENESTE sandhedskilde for HVAD): `docs/sandhed/krav/lokations-skabelon-krav.md` @ blob `9402164d87a35fb939661058bea77c1a052493d0` — verificeret med `git rev-parse HEAD:…`, læst i fuld længde (427 linjer). K-1..K-9 inkl. alle negativer forstået.
- recon-2: `plan-build/lokations-skabelon/recon2.md` @ blob `2bdbb122158b6f8c72fc942b8de28e679742b4aa` — verificeret, læst i fuld længde (begge aktør-blikke: recon-Code §1-3 + recon-Codex R2-K1..K9/P01-P14/E001-E209).
- recon-1: `recon/recon.md` + `recon/recon-2-bilag.md` (mutations-frø — genbrugt som kill-list-kilde nedenfor) · ordbog: `plan-build/lokations-skabelon/ordbog.md` · ledger: `plan-build/lokations-skabelon/mathias-ord.md` (M-1..M-38 læst).
- Alle mønster-referencer i planen er `path:linjer @ blob12` fra recon-2's evidensregister; de bærende skabeloner (t10_tables 359c0b23 · t10_client_rpcs bb9ee808 · t9_employee_node_placements 17930649 · t10_seed_permissions fcf49401 · t9_supplement_2_permission_actions 5a09930f · t9_pending_changes c3b2865c · core_identity_secdef_pending_change ae336ee6 · pending_changes_select_policy 4df2fca6 · t9_client_node_placements f49e7d5b · c002_c003_dispatcher c5b47ec5 · p2_mapping_lifecycle ec3d9a0b · t10_classify f467bafd · t10_audit_filter_values 4eb775c9) er GENLÆST i dette workdir — planen bygger fra committet kilde, ikke hukommelse.
- Web ikke brugt. Ingen krav-ændring foretaget eller foreslået (retur-noter: §8).

**Seneste gældende definitioner verificeret (grep over migrations-kæden):** `pending_change_apply` = `20260518000004 @ f49e7d5b:152-220` · `pending_change_approve`/`pending_change_undo` = `20260607110001 @ ae336ee6` · `pending_changes_select`-policy = `20260521100005 @ 4df2fca6:19-60` · grant-unikindexet på `role_permission_grants` er 5-kolonne inkl. `action_id` (`20260521100003 @ 5a09930f:84-93`). Byggeren udvider DISSE definitioner, aldrig ældre versioner.

---

## 1. Krav-ID-matrix (bijektion)

Effect-harness-form pr. række: **indgang** (public RPC/CI-dommer) · **rolle** (authenticated via JWT-sim `t10_client_lifecycle.sql:26-36 @ 6777522c`; superadmin hhv. rettigheds-løs hhv. view-only) · **positiv slut-effekt** (hård DB-row/oracle-svar, aldrig helper-return) · **navngiven afvisning m. SQLSTATE**. Kill-list-UDKAST pr. K står under hvert K (P-6: foreligger her, finaliseres bid-bundet af Codex i Fase 4). Planen specificerer testene; Codex skriver dem (måle-laget).

### K-1 Lokation som central master-data → Bid 2 (ac 5 slutbevises i Bid 5)

| ac | bid·step | indgang · rolle | positiv slut-effekt | navngiven afvisning |
|---|---|---|---|---|
| 1 | 2.2 | `lokation_opret` · authenticated m. lokationer-grant | række i `core_identity.lokationer` + init-rækker i status-/pris-/gruppe-historik | `p_navn` NULL/blank → **22023** `lokation_opret: navn er paakraevet` (tabel-CHECK 23514 = bagstopper, deklareret ikke-nåbar via public flade) |
| 2 | 2.2 | `lokation_opret`/`lokation_rediger` | hver af de 5 typer {butik, messe, marked, event, andet} accepteres | type uden for listen → **22023** `…: ugyldig type` (CHECK 23514 bagstopper) |
| 3 | 2.1+2.2 | `lokation_rediger` (pris) + `lokation_dagspris_paa`/`stand_dagspris_paa` | pris P1 sat D1, ændret til P2 D2: opslag(D1)=P1, opslag(D2)=P2; stands ARVEDE pris følger samme datoer | UPDATE/DELETE på `pris_historik` → **P0001** `pris_historik_immutabel`; direkte DML som authenticated → **42501** |
| 4 | 2.1 | schema-assertion (pg_catalog) + `scripts/fitness.mjs` CROSS_SCHEMA_FK (`d1b4d601:1172-1176`) | ingen kolonne/FK fra pakkens tabeller mod `core_money`; fitness grøn | en tilføjet money-FK → fitness **rød** (CI-dommer) |
| 5 | 2.2/5.2 | alle handlinger via granted SECDEF-RPC som authenticated | = K-9 ac 1-harness (fuldt gennemløb) | psql-/service-privilegier aldrig nødvendige (fraværs-effekt) |

**Kill-list-UDKAST K-1:** (a) fjern navn-22023-grenen i `lokation_opret` → ac1-negativ får 23514 i stedet for 22023 → rød. (b) fjern type-valideringen → ac2 rød. (c) byt COALESCE-retningen i `stand_dagspris_paa` (lokation før stand) → arve-testen rød. (d) fjern `pris_historik`-triggeren på lokationer → ac3's D1-opslag efter ændring rød. (e) fjern immutability-guard på `pris_historik` → P0001-negativ rød. (f) hardcode `current_date` i `lokation_dagspris_paa` (ignorér p_dato) → historisk opslag rød (frø: bilag L205 date-parametrisering). (g) tilføj FK mod core_money → fitness rød (frø: `fitness.mjs`-mutationen, bilag L142).

### K-2 Stande under lokation → Bid 2 (ac 3 i Bid 3)

| ac | bid·step | indgang · rolle | positiv slut-effekt | navngiven afvisning |
|---|---|---|---|---|
| 1 | 2.1 | schema-assertion + direkte DML-forsøg | **designet UD**: to-tabel-model — `lokationer` har ingen parent-kolonne, `stande` har ingen barn-tabel; cyklus kan ikke udtrykkes (afgørelse V-A; recon-Code K-2: to-tabel-model = "cyklus strukturelt umulig — også gyldig opfyldelse") | pg_catalog-assert: ingen self-FK på nogen pakke-tabel; DML som authenticated → **42501** |
| 2 | 2.2 | `stand_dagspris_paa` | stand m. egen pris → egen; NULL → lokationens; arv-reset (rediger til NULL) → lokationens igen — aldrig to sandheder | — (opslaget kan ikke svare tvetydigt: NOT NULL på lokations-pris + COALESCE) |
| 3 | 3.1 | `stand_er_bookbar` | under dvale/nedlagt → `false`; under aktiv → `true` | — (afvisningen bor i trin 24's forbrug af opslaget, jf. K-4 ac 5) |
| 4 | 2.1/2.2 | `stand_opret` + `lokation_hent` | stand-id er stabil identitet; bookbar-fladen (`stand_er_bookbar`) leveret til trin 24 | to-klienter-pr-stand håndhæves i trin 24 (kravets egen afgrænsning, K-2 ac 4) |
| 5 | 3.1-test | `lokation_saet_status('nedlagt')` + `lokation_hent` | samme stand-id'er og -antal før og efter nedlæg + genåbn | stande kan ikke slettes: ingen delete-grant/-policy/-RPC (fraværs-effekt + **42501** ved DML) |
| 6 | 2.2 | `lokation_opret` · `stand_saet_aktiv` | lokation fødes atomisk m. første stand; ejerkæden er FK-båren (stande.lokation_id NOT NULL → lokationer; lokationer.gruppe_id NOT NULL → grupper) | opret uden stand-navn → **22023**; deaktivering af sidste aktive stand → **P0001** `sidste_aktive_stand_kan_ikke_deaktiveres`; under-stande: kan ikke udtrykkes (designet UD) |

**Kill-list-UDKAST K-2:** (a) fjern count-checket i `stand_saet_aktiv` → sidste-stand-negativ rød. (b) fjern `FOR UPDATE`-låsen på lokations-rækken → to-sessioners-prøven (angrebs-spec-krav Bid 2) rød. (c) gør stand-INSERT i `lokation_opret` betinget/udeladt → nyoprettet lokation uden stande → min-1-stand-assert rød. (d) tilføj delete-grant/-policy på `stande` → gov-negativ (42501-forventning) rød. (e) fjern is_active-leddet i `stand_er_bookbar` → deaktiveret-stand-test rød. (f) skift `stande.lokation_id` til ON DELETE CASCADE → schema-assert (confdeltype='r') rød (frø: bilag L98 CASCADE-mutationen).

### K-3 Gruppe (leverandør) som ejer → Bid 1 (ac 1/2 i Bid 2 · ac 4/6 i Bid 4)

| ac | bid·step | indgang · rolle | positiv slut-effekt | navngiven afvisning |
|---|---|---|---|---|
| 1 | 2.2 | `lokation_opret` | — | `p_gruppe_id` NULL → **22023**; ukendt gruppe → **P0002**; kolonnen `gruppe_id` NOT NULL (designet UD) |
| 2 | 2.1 | schema-assertion | gruppe angives KUN som uuid-FK-reference — fritekst-gruppenavn på lokationen kan ikke eksistere (ingen tekst-kolonne; designet UD) | ukendt uuid → **P0002** `lokation_opret: gruppe % findes ikke` |
| 3 | 1.2 | `gruppe_upsert` | række i `grupper` m. navn | blankt navn → **22023** `gruppe_upsert: navn er paakraevet` |
| 4 | 4.2/4.3 | `gruppe_klient_kobl` → approve → apply + `klient_maa_staa_paa` | koblet klient har ret på ALLE gruppens lokationer — også L3 oprettet EFTER koblingen (afledt ret, V8) | til-valg (fravalg-ophæv) af klient uden kobling → **22023** `klient_ikke_i_gruppen` |
| 5 | 1.2 + 2.1 | DML-forsøg + `gruppe_saet_aktiv` | udfasning = `is_active=false` (V13); historik + lokationer består | DELETE som authenticated → **42501**; ingen delete-RPC (fraværs); FK RESTRICT fra `lokationer.gruppe_id` = bagstopper; ny lokation på inaktiv gruppe → **22023** `gruppe_inaktiv` (superadmin-bypass, forretningsvagt-klassen) |
| 6 | 4.2/4.3 | `lokation_klient_fravaelg`/`…_fravalg_ophaev` (pending-flow) | fravalgt: ret=false på L1, uændret true på L2; ophævet: true igen | dobbelt fravalg → **22023** `fravalg_findes_allerede` |

**Kill-list-UDKAST K-3:** (a) **kardinalitets-mutanten** (cnp-fælden): partial UNIQUE på `(klient_id) WHERE gaeldende_til IS NULL` i stedet for `(gruppe_id, klient_id)` → klient-i-to-grupper-testen rød. (b) fjern gruppe-aktiv-guarden i `lokation_opret` → inaktiv-gruppe-negativ rød. (c) fjern navn-grenen i `gruppe_upsert` → ac3 rød. (d) FK CASCADE-mutant → schema-assert rød. (e) fjern arve-leddet (materialisér retten kun ved kobling) → L3-testen rød (frø: recon-Codex E053-mutationen).

### K-4 Status-livscyklus → Bid 3 (ac 6/8/9-klientdele i Bid 4; ac 3/4-strukturen lægges i Bid 2)

| ac | bid·step | indgang · rolle | positiv slut-effekt | navngiven afvisning |
|---|---|---|---|---|
| 1 | 3.1 | `lokation_saet_status` | hvert af {aktiv, dvale, nedlagt} kan sættes | værdi uden for listen → **22023** `lokation_saet_status: ugyldig status` (CHECK 23514 bagstopper) |
| 2 | 3.1 | `lokation_saet_status` | audit-række m. brugerens change_reason pr. skift (assert via audit-læsevej) | blank årsag → **22023**; `stork_audit` P0001 = bagstopper (`a7ec4884:34,122-129`) |
| 3 | 2.1+3.1 | DML-forsøg + signatur-assert | status kan KUN skrives via `lokation_saet_status` | direkte INSERT som authenticated → **42501** (revoke); `lokation_rediger` har ingen status-parameter (fraværs-effekt) |
| 4 | 2.1 | UPDATE/DELETE/TRUNCATE-forsøg på `lokation_status_skift` | append-only event-log: fortid kan aldrig omskrives (designet UD) | → **P0001** `lokation_status_skift_immutabel` (alle tre operationer) |
| 5 | 3.1 | `lokation_status_paa(l, dato)` / `lokation_er_bookbar(l, dato)` | entydigt svar pr. dato, også historisk: forløb aktiv→dvale→aktiv genlæses korrekt på alle datoer | — (fladen trin 24 forbruger; booking-afvisningen håndhæves dér) |
| 6 | 4.2 | `lokation_klient_fravaelg` m.fl. med lokation i DVALE | pending-flowet gennemføres — AFVISES IKKE | — |
| 7 | 3.1 | `lokation_saet_status('aktiv')` på nedlagt | genåbnet: bookbar igen, auditeret m. årsag — samme dedikerede handling | — |
| 8 | 4.2 | `lokation_klient_fravalg_ophaev` på nedlagt | — | → **22023** `lokation_nedlagt` (kravfæstet strukturvagt — INGEN superadmin-bypass, jf. S-7) |
| 9 | 4.3 | `lokation_saet_status('nedlagt')` + `lokation_klienter`/`klient_maa_staa_paa` | afledt frakobling pr. dato (V8): `lokation_klienter(L, D≥nedlæg)` = tom; `(L, D<nedlæg)` = uændret (historik består, M-13); koblings-/fravalgs-rækker UBERØRTE (gruppens kobling + øvrige lokationer intakte); stande består (K-2 ac 5); genåbning → gruppens DA gældende klienter automatisk tilbage (M-19) | en "nedlagt lokation med aktive klienter" kan ikke observeres i nogen læseflade |

**Kill-list-UDKAST K-4:** (a) fjern `dvale_ophoer`-afledningen i `lokation_status_paa` (eller mutér `<=` til `<`) → ophørsdags-testen rød. (b) byt `ORDER BY seq DESC` til ASC → seneste-event-testen rød. (c) fjern nedlagt-leddet i `klient_maa_staa_paa` → ac9-testen rød. (d) fjern immutability-guarden → ac4 rød. (e) fjern init-status-eventet i `lokation_opret` → nyoprettet-lokation-bookbar-test rød. (f) fjern årsags-grenen → blank-årsag-negativ rammer ikke public indgang → rød (frø: bilag L12/L13 change_reason-mutationerne). (g) genindfør status-skrivning i `lokation_rediger` → signatur-/adfærds-assert rød (frø: bb9ee808-V8-lektionen, bilag L102).

### K-5 Hvile (cooldown) → Bid 3

| ac | bid·step | indgang · rolle | positiv slut-effekt | navngiven afvisning |
|---|---|---|---|---|
| 1 | 3.1 | `lokation_er_bookbar` under dvale | `false` for ALLE klienter (opslaget tager ingen klient-parameter — klient-uafhængighed er designet ind i signaturen) | ingen bypass-handling findes: pg_catalog-assert på at ingen pakke-RPC har override-parameter (fraværs-effekt; M-27b) |
| 2 | 3.1 | `lokation_saet_status('aktiv')` på dvale | lokationen er DEREFTER aktiv (bookbar-opslag flipper straks); audit m. årsag | uden rettighed → **42501** |
| 3 | 3.1 | `lokation_saet_hviledage` | ny værdi straks synlig ved genlæsning (ingen godkendelses-trin — K-5 ac 3's afledning, M-29.5) + audit m. årsag | uden rettighed → **42501** (q1-negativ-formen `7ea7bfa7`); blank årsag → **22023** |
| 4 | 3.1 | samme RPC | = K-9 (ingen udvikler/migration nødvendig) | — |
| 5 | 2.1+3.1 | data-assertion | ny lokation: `hviledage` NULL (default = intet, princip 4); ingen mekanik udløser dvale af sig selv i pakken (auto-udløsning = trin 24, kravets scope-ærlighed) | `hviledage` 0 eller negativ → **22023** + CHECK `hviledage >= 1` (23514 bagstopper); enheden er DAGE (integer — M-21 låser) |

**Kill-list-UDKAST K-5:** (a) NULL-usikker session-var-gate (`<>`-mutanten, p1a-frøet `6775c829`) → uden-var-negativ rød. (b) fjern hviledage-CHECK → 0-negativ rød. (c) fjern 42501-grenen i `lokation_saet_hviledage` → rettigheds-negativ rød. (d) tilføj klient-parameter/undtagelse i bookbar-opslaget → klient-uafhængigheds-assert rød (frø: recon-Codex K-5-mutationen "gør hvile-opslaget afhængigt af client_id").

### K-6 Klient-tilladelser → Bid 4

| ac | bid·step | indgang · rolle | positiv slut-effekt | navngiven afvisning |
|---|---|---|---|---|
| 1 | 4.1/4.2 | `gruppe_klient_kobl` | — | manglende/ukendt gruppe eller klient → **P0002**; NOT NULL FK'er (designet UD) |
| 2 | 4.1/4.2 | samme | én sandhed pr. (klient, gruppe) | dobbelt kobling → **22023** `kobling_findes_allerede` (wrapper OG apply-handler); partial UNIQUE **23505** + EXCLUDE **23P01** = bagstoppere |
| 3 | 4.2 | samme | åben kobling (gaeldende_til NULL) er normaltilstanden — AFVISES IKKE | — |
| 4 | 4.3 | `klient_maa_staa_paa` | arv til alle + senere lokationer (afledt ret) | til-valg uden for gruppen → **22023** `klient_ikke_i_gruppen` |
| 5 | 4.2/4.3 | `lokation_klient_fravaelg` / `…_ophaev` | fravalg rammer kun L1; øvrige lokationer uberørte; ophævelse genskaber ret | — |
| 6 | 4.2/4.3 | `gruppe_klient_frakobl` | åben række lukkes m. `gaeldende_til = dato` (luk-åben-formen `17930649:98-100`); alle gruppens lokationer mister ret FRA dato; svar for D<dato uændret | UPDATE af lukket række / andre kolonner → **P0001** `koblinger_historik_immutabel` (guard-trigger); DELETE → **P0001** |
| 7 | 4.3 | `klient_maa_staa_paa(k, l, dato)` | entydigt svar også for historiske datoer — alle tre led (gruppe-paa-dato · fravalg-paa-dato · status-paa-dato) er daterede | — |
| 8 | 4.3 | to koblinger, samme lokation | begge klienter har ret samtidig — AFVISES IKKE (M-29.1) | — |
| 9 | 4.3 | nedlæg + oracle | = K-4 ac 9-rækken (afledt frakobling; genåbnings-arv M-19) | — |
| 10 | 4.2 | wrappers + pending-kæden | dateret ændring: request → approve (self-approve-forbud) → undo-vindue → apply; undo før frist → ingen effekt; effekt præcis når alle gates er passeret | uden rettighed → **42501**; apply før undo_deadline/dato → ingen effekt (due-gates `f49e7d5b:172-187`); undo efter apply → **22023** (fortrydelse efter apply = ny modsatrettet ændring — eksplicit disposition, S-10) |

**Kill-list-UDKAST K-6:** (a) kardinalitets-mutanten (= K-3 a). (b) fjern gruppe-leddet i oraklet → ukoblet-klient-testen rød. (c) fjern fravalgs-NOT-leddet → fravalgs-testen rød. (d) hardcode `current_date` i ét oracle-led → historisk-dato-testen rød (frø: bilag L205). (e) fjern undo_deadline-gaten i apply → tidlig-apply-negativ rød (frø: bilag L64 due-check-mutationen). (f) udelad select-policy-grenen for en ny change_type → godkenderen kan ikke SE pending'en → flow-testen rød (frø: bilag L122). (g) udelad dispatcher-grenen → apply **42883** → positiv-flow rød. (h) fjern re-verifikationen i apply-handleren → request→nedlæg→apply-negativ rød (frø: bilag L100 dobbelt-verifikations-mutationen). (i) fjern payload-dato==effective_from-asserten → dato-drift-mutanten overlever ellers (recon-Codex E079-fælden). (j) fjern guard-triggeren → historik-UPDATE-negativ rød. (k) fjern change_reason-propageringen i handleren → audit-årsag-asserten rød (K-8-gabet recon-Codex nævner: T9-wrappers bærer ikke bruger-årsag — lukket ved S-9).

### K-7 Klassifikation, persondata, anonymisering → Bid 1/2/4 (klassifikation) + Bid 5 (anonymisering)

| ac | bid·step | indgang · rolle | positiv slut-effekt | navngiven afvisning |
|---|---|---|---|---|
| 1 | 1.1/2.1/4.1 | CI: `scripts/migration-gate.mjs` STRICT (`ci.yml:102 @ 4312d4b5`) | hver ny kolonne har klassifikations-tuple I SAMME migrationsfil som CREATE TABLE (skærpelse af t10-rækkefølgen — lukker LENIENT-vinduet helt) | fjernet tuple → gate **exit 1** (CI-negativ, specificeret som mutant) |
| 2 | 5.1 | `anonymiser_gruppe_kontakt` (e2e: mapping-lifecycle → activate → anonymisér) | kontakt-rækkens navn/email/telefon ERSTATTET (værdi-assert — aldrig kun anonymized_at/errors=0); rækken, gruppen, lokations-koblinger og audit består; præcis én state-row | DELETE-forsøg → **42501**; dobbelt-anonymisering → **P0002** (generic_apply's `IS NULL`-guard `6083fecd:99-109`) |
| 3 | 1.1/2.1/4.1 | data-assertion mod `data_field_definitions` | KUN gruppe_kontakter.{navn,email,telefon} er `direct`; lokationer.adresse er `indirect` (deklareret læsning, recon-flag); ALT andet `none`; retention NULL overalt (default = intet; D1/D2 tillader NULL-retention) | — |
| 4 | 5.1 | mapping + `anonymize_generic_apply`-coverage | alle tre direct-kolonner har strategi (blank/hash/hash_email fra P1a-seedet `d69ea57e`/`15557e93`-formen); dæknings-e2e grøn; lokations-anonymisering: `anonymized_at` = inaktiv struktur (ingen direct-felter → ingen mapping → ingen falske alarmer i verify-cron `ac335748`) | mapping uden strategi for en direct-kolonne → **P0001** PII-coverage (`6083fecd:75-78`) |

**Kill-list-UDKAST K-7:** (a) klassificér `email` som none → audit-klartekst-testen rød (frø: bilag L91). (b) mapping-seed uden `anonymized_check_column='anonymized_at'` → e2e rød (frø: bilag L33). (c) `_gruppe_kontakt_apply` coalescer ukendt strategi til original værdi (E109-fælden) → replay-negativ (ukendt strategi SKAL raise) rød. (d) genindfør EXECUTE-grant til authenticated på `anonymize_generic_apply` → direkte-kald-negativ (42501) rød (S-12). (e) udelad `telefon` fra field_strategies → ac4-coverage-negativ rød. (f) NULL-fallback-strateginavn (silent no-op-frøet, bilag L26) → værdi-asserten rød.

### K-8 Adgang, audit, fortrydelse → Bid 1 (ac 5 fuldendes Bid 2; gælder alle bids)

| ac | bid·step | indgang · rolle | positiv slut-effekt | navngiven afvisning |
|---|---|---|---|---|
| 1 | 1.1 | direkte INSERT/UPDATE/DELETE på HVER ny tabel som authenticated (gov_3b-formen `a2c85a04:25-51`) | — | → **42501**/permission denied — uanset rettigheder og selvsatte session-vars (revoke-laget `408a96ff` + default-privileges `c6fb84d2`) |
| 2 | 1.2+ | HVER write-RPC m. blank årsag (parametriseret negativ-suite over ALLE pakkens write-indgange, inkl. pending-wrappers) | — | → **22023**; `stork_audit` **P0001** = bagstopper |
| 3 | 2.1 | UPDATE/DELETE på audit + pakkens historik-tabeller | — | → **P0001** (eksisterende `a7ec4884:184-207` + pakkens tre immutability-guards) |
| 4 | 1.2 | view-only rolle (can_access uden can_write — r7b-matrix-formen) | read-RPC'er svarer | write-RPC → **42501**; uden synligheds-grant: read giver ingen data |
| 5 | 1.4+2.3 | `m1_permission_matrix`-smoke + grant-opslag | pages `grupper`+`lokationer` (+ manage-tabs) seedet under `org_structure`-area; superadmin har BÅDE page- og tab-grants (approve-gaten kalder `has_permission(page, null, true)` — page-level, `ae336ee6:36-55`); alle tildelinger derefter UI-drift | manglende seed → m1-smoke **rød** |

**Kill-list-UDKAST K-8:** (a) glem DML-GRANT på en tabel → positiv-flow rød med permission-denied-FØR-policy (Codex V4-lektionen, `359c0b23:62-65`). (b) sæt session-var FØR permission-checket → fejlet-check-efterlader-autoriseret-tx-testen rød (frø: bilag L83 — rækkefølgen ER mønstret). (c) glem EXECUTE-grant på én RPC → K-9-gennemløbet rød (frø: bilag L114 'død API-flade'). (d) udelad page-grant i seed → approve-gate-negativ rød. (e) fjern has_permission-checket i en SECDEF-body → åben-for-alle-negativ rød (frø: bilag L127-130). (f) SECDEF-RPC uden SECDEF_SANCTIONED-entry → fitness rød (`d1b4d601:1530-1546`).

### K-9 UI-styrbarhed → Bid 5 (samleharness; ac 3-fraværs-tests i Bid 2/3)

| ac | bid·step | indgang · rolle | positiv slut-effekt | navngiven afvisning |
|---|---|---|---|---|
| 1+2 | 5.2 | HELE handlingslisten (§2, Bid 5.2-listen) som authenticated rettighedshaver via JWT-sim; genlæsning gennem read-fladen efter hver handling | alle K-1..K-8-handlinger udførbare uden migration/deploy/tekniske privilegier | hver handling også prøvet UDEN grant → **42501** |
| 3 | 2/3-tests | pg_catalog-assert på RPC-signaturer + superadmin-negativer | intet strukturelt forbud kan slås fra: ingen RPC eksponerer CHECK-/guard-parametre (kode-låste-flag-mønstret `5a09930f`); blank navn/cyklus-udtryk/blank årsag afvises OGSÅ for superadmin | superadmin + blank navn → **22023** (struktur-vagter har ingen bypass) |

**Kill-list-UDKAST K-9:** (a) fjern EXECUTE-grant på én indgang → gennemløbs-harness rød. (b) tilføj en `p_spring_validering_over`-parameter → signatur-asserten rød. (c) ny tabel/RPC uden `pnpm types:generate` → CI types:check rød (`70d52135:13-53`). (d) fjern `core_identity` fra types-SCHEMAS → typer forsvinder tavst → types-drift-testen rød (frø: bilag L140).

### Bijektion — bid → K (rogue-tjek)

| bid | bærer K (fuldt eller del) | forudsætnings-indhold uden eget K |
|---|---|---|
| 1 | K-3 (ac 3, 5) · K-7 (ac 1, 3 for gruppe-tabeller) · K-8 (ac 1-4; ac 5-del) | — |
| 2 | K-1 (ac 1-4) · K-2 (ac 1, 2, 4, 5-struktur, 6) · K-3 (ac 1, 2; ac 5-FK-lag) · K-4 (ac 3-struktur, ac 4) · K-7 (ac 1, 3) · K-8 (ac 5-del) · K-9 (ac 3-del) | `lokation_status_skift`-TABELLEN (K-4-forudsætning; dens handlinger bevises i Bid 3) |
| 3 | K-2 (ac 3; ac 5-bevis) · K-4 (ac 1, 2, 3, 5, 7) · K-5 (ac 1-5) · K-9 (ac 3-del) | — |
| 4 | K-3 (ac 4, 6) · K-4 (ac 6, 8, 9) · K-6 (ac 1-10) · K-7 (ac 1 for koblings-tabeller) | — |
| 5 | K-7 (ac 2, 4) · K-9 (ac 1, 2) · K-1 (ac 5-slutbevis) | — |

Ingen K uden bid+test; intet bid uden K (Bid 2's status-tabel er deklareret forudsætning, ikke rogue — dens K-4-effekter prøves i Bid 3, jf. forudsætnings-bid-reglen).

---

## 2. Bid-opdeling (afhængigheds-ordnet · prover-bevisbar · angrebs-spec-krav + risiko-flag pr. bid)

Fælles for alle bids: (i) hver ny tabel følger t10-skabelonen `20260521000001_t10_tables.sql:24-82 @ 359c0b23` — `id uuid primary key default gen_random_uuid()` · `created_at`/`updated_at timestamptz not null default now()` · `set_updated_at`- og `stork_audit`-triggere · `enable`+`force row level security` · `revoke all … from public, anon, service_role` · `grant select … to authenticated` · eksplicit DML-GRANT (`grant insert, update` — ALDRIG delete) · select-policy `has_permission(<page>,'manage',false)` · insert/update-policies på `current_setting('stork.allow_<tabel>_write', true) = 'true'` · ingen delete-policy (default deny) · `-- no-dedup-key: <grund>`-kommentar — MED de afvigelser der står eksplicit pr. tabel nedenfor. (ii) Hver write-RPC følger gate-rækkefølgen fra `20260521000009_t10_client_rpcs.sql:17-63 @ bb9ee808` BINDENDE: permission-check **42501** → blank change_reason **22023** → domæne-valideringer (**22023**/**P0002**) → FØRST DEREFTER `set_config` af `stork.source_type='manual'` + `stork.change_reason` + allow-write-vars (alle `, true` = tx-lokale) → mutation. `security definer set search_path = ''`. `revoke all on function … from public, anon` + `grant execute … to authenticated`. Fejlbeskeder: `'<fn>: <sag>'`-formen som bb9ee808. (iii) Read-RPC'er: `security invoker` + eksplicit `has_permission(<page>,'manage',false)`-check i body → **42501** (dobbelt-laget er bevidst — t10-read-formen `8bef6e71:11-41`). (iv) Pr. bid: SECDEF_SANCTIONED-entry pr. ny SECDEF-signatur (også overloads; stale entries = rød), `pnpm types:generate` committes, advisor-baseline ajourføres hvis nye eksponeringer, klassifikation i samme fil som DDL. (v) "Done" pr. bid = biddets K-effect-harnesses + negativer + dræbte targeted-mutanter grønne + CI (fitness/migration-gate/types/db:test) grøn.

### Bid 1 — Gruppe-fundamentet (K-3 · K-7 · K-8)

Afhænger af: intet (første bid).

**Step 1.1 — migration `20260910100000_t10b_01_grupper_tabeller.sql`:**

```sql
-- no-dedup-key: master-data; id er stabil PK; udfasning via is_active (K-3 ac 5)
create table core_identity.grupper (
  id          uuid primary key default gen_random_uuid(),
  navn        text not null check (length(trim(navn)) > 0),
  type        text check (type in ('kaede','enkelt_butik','messe_operatoer','andet')),  -- V3: nullable
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- no-dedup-key: kontaktpersoner; id er stabil PK; ny kontaktperson = ny række (S-11)
create table core_identity.gruppe_kontakter (
  id            uuid primary key default gen_random_uuid(),
  gruppe_id     uuid not null references core_identity.grupper(id) on delete restrict,
  navn          text not null check (length(trim(navn)) > 0),
  email         text,
  telefon       text,
  is_active     boolean not null default true,
  anonymized_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index gruppe_kontakter_gruppe_idx on core_identity.gruppe_kontakter (gruppe_id);
```

\+ fuld t10-hale for begge (triggere/RLS/grants/policies pr. fælles-regel (i); session-vars: `stork.allow_grupper_write`, `stork.allow_gruppe_kontakter_write`; select-policy-page: `grupper`) + klassifikations-INSERT i SAMME fil (form: `20260521000003 @ f467bafd:16-65` — top-level `set_config`, én INSERT, `on conflict … do nothing`): alle kolonner `category='master_data'`, `pii_level='none'`, `retention_type=null`, `retention_value=null` — UNDTAGEN `gruppe_kontakter.navn/email/telefon` = `pii_level='direct'` (purpose-tekster angiver kontaktperson-persondata, §11-grænsen).

**Step 1.2 — migration `20260910100001_t10b_02_gruppe_rpcs.sql`:** RPC-specs (gate-rækkefølge pr. fælles-regel (ii); page `grupper`):

| RPC | signatur | domæne-valideringer efter permission+årsag | mutation |
|---|---|---|---|
| `gruppe_upsert` | `(p_navn text, p_change_reason text, p_type text default null, p_gruppe_id uuid default null) returns uuid` | blank navn → 22023; `p_type` sat men uden for de 4 værdier → 22023 | INSERT eller UPDATE (navn, type). UPDATE rører ALDRIG `is_active` (V8-lektionen bb9ee808:49-55). Ukendt id → P0002 |
| `gruppe_saet_aktiv` | `(p_gruppe_id uuid, p_is_active boolean, p_change_reason text) returns void` | — | UPDATE is_active. Ukendt → P0002 (V13) |
| `gruppe_kontakt_upsert` | `(p_gruppe_id uuid, p_navn text, p_change_reason text, p_email text default null, p_telefon text default null, p_kontakt_id uuid default null) returns uuid` | blank navn → 22023; gruppe findes ellers P0002; ved UPDATE: kontakt findes ellers P0002; ved UPDATE af række m. `anonymized_at IS NOT NULL` → 22023 `kontakt_anonymiseret_opret_ny` (S-11) | INSERT eller UPDATE (navn, email, telefon) |
| `gruppe_kontakt_saet_aktiv` | `(p_kontakt_id uuid, p_is_active boolean, p_change_reason text) returns void` | — | UPDATE is_active. Ukendt → P0002 |
| `gruppe_hent` (read, invoker) | `(p_gruppe_id uuid) returns jsonb` | permission-read-check 42501 | jsonb: gruppe-felter + kontakter-array + koblede klienter pr. dags dato (fra Bid 4 udvides — i Bid 1 leveres uden koblings-del, Bid 4 CREATE OR REPLACE m. koblings-array) |
| `grupper_liste` (read, invoker) | `() returns table (id uuid, navn text, type text, is_active boolean, created_at timestamptz, updated_at timestamptz)` | permission-read-check 42501 | select |

**Step 1.3 — migration `20260910100002_t10b_03_gruppe_seed_permissions.sql`:** seed-formen `fcf49401:17-56` (session-vars inkl. `stork.t9_write_authorized` top-level; area-scoped JOINs mod `org_structure`): page `grupper` + tab `manage` + superadmin-grants på BÅDE tab-niveau OG page-niveau (`can_access=true, can_write=true, visibility='all'`; page-grantet fordi approve-gaten i `ae336ee6:36-55` kalder `has_permission(page, null, true)`). ON CONFLICT-målet er det NUVÆRENDE 5-kolonne-unikindex inkl. `action_id` (`5a09930f:86-93`): `on conflict (role_id, coalesce(area_id::text,''), coalesce(page_id::text,''), coalesce(tab_id::text,''), coalesce(action_id::text,'')) do nothing`. Legacy `role_page_permissions` seedes IKKE (t10.13/14-lektionen).

**Fejl-loci Bid 1:** has_permission-kaldet i hver RPC · 22023-grenene · gate-rækkefølgen (var efter check) · DML-grants · session-var-policies (`= 'true'`-formen, NULL-sikker) · seed-fuldstændighed (page+tab+begge grant-niveauer) · klassifikations-tuplerne. **Harness-form:** JWT-sim superadmin (positiv) + rettigheds-løs employee (42501-negativer) + view-only (K-8 ac 4). **Done:** K-3 ac 3/5-, K-8 ac 1-4-harness + kill-frø (K-3 c, K-8 a/b/e/f) grønne. **Angrebs-spec-krav:** Codex efterprøver at direkte-DML-negativerne rammer ALLE fire tabel-operationer på begge tabeller, og at 42501 kommer fra revoke-laget (ikke kun policy). **Risiko-flag: LAV** (ren skabelon-appliance) — targeted mutanter, ingen bred mutation.

### Bid 2 — Lokation + stande + pris/gruppe-historik + status-struktur (K-1 · K-2 · K-3 ac 1/2 · K-4-struktur · K-8 ac 5)

Afhænger af: Bid 1 (gruppe-FK).

**Step 2.1 — migration `20260910110000_t10b_04_lokation_tabeller.sql`:**

```sql
-- no-dedup-key: master-data; id er stabil PK (V-A: to-tabel-model — se afgørelse)
create table core_identity.lokationer (
  id            uuid primary key default gen_random_uuid(),
  navn          text not null check (length(trim(navn)) > 0),
  adresse       text,
  type          text not null check (type in ('butik','messe','marked','event','andet')),
  dagspris      numeric(12,2) not null check (dagspris >= 0),          -- V11: NOT NULL, implicit DKK/dag
  gruppe_id     uuid not null references core_identity.grupper(id) on delete restrict,
  hviledage     integer check (hviledage is null or hviledage >= 1),   -- V-hvile: NULL = intet valg (M-21)
  anonymized_at timestamptz,                                           -- doc-låst §1.12; inaktiv struktur (K-7 ac 4)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index lokationer_gruppe_idx on core_identity.lokationer (gruppe_id);

-- no-dedup-key: master-data under lokation; stande slettes aldrig (M-14)
create table core_identity.stande (
  id          uuid primary key default gen_random_uuid(),
  lokation_id uuid not null references core_identity.lokationer(id) on delete restrict,
  navn        text not null check (length(trim(navn)) > 0),
  dagspris    numeric(12,2) check (dagspris is null or dagspris >= 0), -- NULL = arv (V11)
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index stande_lokation_idx on core_identity.stande (lokation_id);

-- APPEND-ONLY status-event-log (V9: ÉN status-sandhed, ingen status-kolonne på lokationer)
-- no-dedup-key: event-log; seq er total orden
create table core_identity.lokation_status_skift (
  id           uuid primary key default gen_random_uuid(),
  seq          bigint generated always as identity unique,
  lokation_id  uuid not null references core_identity.lokationer(id) on delete restrict,
  status       text not null check (status in ('aktiv','dvale','nedlagt')),
  dvale_ophoer date check (status = 'dvale' or dvale_ophoer is null),
  skiftet_kl   timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index lokation_status_skift_opslag_idx
  on core_identity.lokation_status_skift (lokation_id, seq desc);

-- APPEND-ONLY pris-historik (K-1 ac 3) — skrives KUN af trigger
-- no-dedup-key: event-log; seq er total orden
create table core_identity.pris_historik (
  seq         bigint generated always as identity primary key,
  lokation_id uuid references core_identity.lokationer(id) on delete restrict,
  stand_id    uuid references core_identity.stande(id) on delete restrict,
  ny_dagspris numeric(12,2) check (ny_dagspris is null or ny_dagspris >= 0),
  sat_kl      timestamptz not null default now(),
  check (num_nonnulls(lokation_id, stand_id) = 1),
  check (lokation_id is null or ny_dagspris is not null)  -- lokations-pris er aldrig NULL
);
create index pris_historik_lokation_idx on core_identity.pris_historik (lokation_id, seq desc);
create index pris_historik_stand_idx on core_identity.pris_historik (stand_id, seq desc);

-- APPEND-ONLY gruppe-ejerskabs-historik (K-6 ac 7: dateret ejerled) — skrives KUN af trigger
-- no-dedup-key: event-log; seq er total orden
create table core_identity.lokation_gruppe_historik (
  seq           bigint generated always as identity primary key,
  lokation_id   uuid not null references core_identity.lokationer(id) on delete restrict,
  gruppe_id     uuid not null references core_identity.grupper(id) on delete restrict,
  gaeldende_fra date not null default current_date,
  sat_kl        timestamptz not null default now()
);
create index lokation_gruppe_historik_idx
  on core_identity.lokation_gruppe_historik (lokation_id, seq desc);
```

RLS/grants/policies: `lokationer` og `stande` = fuld t10-hale (vars `stork.allow_lokationer_write`, `stork.allow_stande_write`; page `lokationer`). `lokation_status_skift` = t10-hale MEN kun insert-grant + insert-policy (`stork.allow_lokation_status_skift_write`) — INGEN update/delete-grant eller -policy; stork_audit-trigger PÅ (INSERT auditeres). `pris_historik` + `lokation_gruppe_historik` = **audit_log-mønstret** (bevidst afvigelse, dokumenteret i tabel-comment): `enable row level security` UDEN force (trigger-skrevne rækker; FORCE ville blokere trigger-INSERTs i invoker-kontekst — præcedens: audit_log, bilag L153), `revoke all`, `grant select to authenticated`, select-policy `has_permission('lokationer','manage',false)`, INGEN DML-grants/policies.

Immutability-guards (form: `a7ec4884:184-207`): trigger-funktioner der raiser **P0001** ved UPDATE/DELETE + statement-trigger ved TRUNCATE på `lokation_status_skift` (`lokation_status_skift_immutabel`), `pris_historik` (`pris_historik_immutabel`), `lokation_gruppe_historik` (`lokation_gruppe_historik_immutabel`).

Historik-triggere (design fejl-klasse UD: synk kan ikke glemmes af nogen skrivevej):
- `pris_historik_lokation_trg`: AFTER INSERT på lokationer (skriv `(lokation_id, NEW.dagspris)`) + AFTER UPDATE WHEN (`OLD.dagspris IS DISTINCT FROM NEW.dagspris`).
- `pris_historik_stand_trg`: AFTER INSERT på stande WHEN (`NEW.dagspris IS NOT NULL`) + AFTER UPDATE WHEN (`OLD.dagspris IS DISTINCT FROM NEW.dagspris`) — også ændring TIL NULL (arv-reset-række m. `ny_dagspris NULL`).
- `lokation_gruppe_historik_trg`: AFTER INSERT på lokationer + AFTER UPDATE WHEN (`OLD.gruppe_id IS DISTINCT FROM NEW.gruppe_id`) — skriver `(lokation_id, NEW.gruppe_id, current_date)`.

Klassifikation i samme fil: alle kolonner `none`/retention NULL, undtagen `lokationer.adresse` = `indirect` (konservativ læsning, recon-flag; deklareret i purpose-teksten). Kategorier: master_data (lokationer/stande), historik (de tre logs).

Fitness-vedligehold i samme PR: `IMMUTABLE_GUARDS` + TRUNCATE-listen (`d1b4d601:79-118, 1160-1170`) + `TX_WRAP_REQUIRED` udvides med de tre log-tabeller; `AUDIT_EXEMPT_SNAPSHOT_TABLES` (`d1b4d601:130-136`) udvides med `pris_historik` og `lokation_gruppe_historik` med begrundelses-kommentar: *derived — kilde-mutationen (lokationer/stande-UPDATE) bærer selv audit m. old/new-værdier; log-rækken er query-flade, ikke ny sandhed*. `lokation_status_skift` er IKKE exempt (den HAR stork_audit).

**Step 2.2 — migration `20260910110001_t10b_05_lokation_rpcs.sql`** (page `lokationer`; gate-rækkefølge pr. fælles-regel):

| RPC | signatur | domæne-valideringer efter permission+årsag | mutation |
|---|---|---|---|
| `lokation_opret` | `(p_navn text, p_type text, p_dagspris numeric, p_gruppe_id uuid, p_foerste_stand_navn text, p_change_reason text, p_adresse text default null, p_hviledage integer default null, p_foerste_stand_dagspris numeric default null) returns uuid` | blank navn → 22023 · type uden for 5-listen → 22023 · `p_dagspris` NULL eller <0 → 22023 · blank stand-navn → 22023 · `p_hviledage` sat og <1 → 22023 · gruppe findes ellers P0002 · gruppe aktiv ellers 22023 `gruppe_inaktiv` (superadmin-bypass via `is_admin()` — forretningsvagt, S-7) | atomisk i ÉN tx (formen `71cadac3:235-246`): INSERT lokation (triggere skriver pris- + gruppe-historik) → INSERT første stand → INSERT status-event `('aktiv', now())`. Returns lokations-id. Sætter vars: allow_lokationer/stande/lokation_status_skift_write |
| `lokation_rediger` | `(p_lokation_id uuid, p_navn text, p_type text, p_dagspris numeric, p_change_reason text, p_adresse text default null) returns void` | som opret (navn/type/pris) · findes ellers P0002 | UPDATE navn/adresse/type/dagspris. Rører ALDRIG gruppe_id, hviledage eller status (fraværs-effekt; egne handlinger) |
| `lokation_saet_gruppe` | `(p_lokation_id uuid, p_gruppe_id uuid, p_change_reason text) returns void` | lokation P0002 · gruppe P0002 · gruppe aktiv 22023 (admin-bypass) · samme gruppe → 22023 `gruppe_uaendret` | UPDATE gruppe_id (trigger skriver historik-række m. `gaeldende_fra = current_date`). Tilladt på nedlagt (stamdata, S-8) |
| `lokation_saet_hviledage` | `(p_lokation_id uuid, p_hviledage integer, p_change_reason text) returns void` | `p_hviledage` sat og <1 → 22023 · findes P0002 | UPDATE hviledage (NULL = fjern valget). Straks-virkning (K-5 ac 3) |
| `stand_opret` | `(p_lokation_id uuid, p_navn text, p_change_reason text, p_dagspris numeric default null) returns uuid` | blank navn 22023 · pris <0 22023 · lokation P0002 · lokation nedlagt → 22023 `lokation_nedlagt` (strukturvagt-analog, INGEN bypass — S-8) | INSERT stand |
| `stand_rediger` | `(p_stand_id uuid, p_navn text, p_dagspris numeric, p_change_reason text) returns void` | blank navn 22023 · pris <0 22023 · findes P0002 | UPDATE navn/dagspris (`p_dagspris` NULL = sæt til arv — eksplicit semantik) |
| `stand_saet_aktiv` | `(p_stand_id uuid, p_is_active boolean, p_change_reason text) returns void` | findes P0002 · ved deaktivering: `SELECT id FROM core_identity.lokationer WHERE id = <standens lokation> FOR UPDATE` (serialiserings-lås) → tæl aktive stande på lokationen; =1 → **P0001** `sidste_aktive_stand_kan_ikke_deaktiveres` (V6) | UPDATE is_active |
| `lokation_hent` (read) | `(p_lokation_id uuid) returns jsonb` | 42501-read-check | lokation + stande-array + aktuel status (oracle) + gruppe-navn + hviledage (Bid 4 udvider m. fravalgs-array via CREATE OR REPLACE) |
| `lokationer_liste` (read) | `() returns table (id uuid, navn text, adresse text, type text, dagspris numeric, gruppe_id uuid, gruppe_navn text, hviledage integer, status text, created_at timestamptz, updated_at timestamptz)` | 42501-read-check | status beregnes pr. række via oracle (current_date). NB: læse-RPC'er er underlagt max_rows=1000/30s (K-9-fladekontrakt-note) |
| `lokation_dagspris_paa` (read) | `(p_lokation_id uuid, p_dato date default current_date) returns numeric` | 42501-read-check | seneste `pris_historik`-række for lokationen m. `sat_kl::date <= p_dato` (ORDER BY seq DESC LIMIT 1); NULL hvis før oprettelse. Semantik: dagens SIDSTE pris gælder dagen (S-5) |
| `stand_dagspris_paa` (read) | `(p_stand_id uuid, p_dato date default current_date) returns numeric` | 42501-read-check | seneste stand-række ≤ dato; ikke fundet ELLER `ny_dagspris` NULL → `lokation_dagspris_paa(standens lokation, p_dato)` (K-2 ac 2: altid ét svar) |

Status-oraklerne defineres i Bid 3 (RPC-mæssigt), men `lokationer_liste`/`lokation_hent` bruger dem → **Bid 2 leverer også** `lokation_status_paa` + `lokation_er_bookbar` + `stand_er_bookbar` som funktioner (invoker, grant execute authenticated) — Bid 3 leverer HANDLINGEN (`lokation_saet_status`) og beviser oraklerne. Oracle-spec (bindende, S-4):
- `lokation_status_paa(p_lokation_id uuid, p_dato date default current_date) returns text`: seneste række i `lokation_status_skift` hvor `skiftet_kl::date <= p_dato`, ORDER BY seq DESC LIMIT 1. Ingen række (dato før oprettelse) → NULL (dokumenteret). Hvis rækken er `dvale` og `dvale_ophoer IS NOT NULL` og `dvale_ophoer <= p_dato` → `'aktiv'` (halvåbent interval — ophørs-dagen er aktiv; afledt auto-ophør, ingen cron). Ellers rækkens status. Eksisterer lokationen ikke → **P0002**.
- `lokation_er_bookbar(p_lokation_id uuid, p_dato date default current_date) returns boolean`: `lokation_status_paa(...) = 'aktiv'` (NULL → false). Ingen klient-parameter, ingen override-parameter (K-5 ac 1 designet ind i signaturen).
- `stand_er_bookbar(p_stand_id uuid, p_dato date default current_date) returns boolean`: standens `is_active` AND `lokation_er_bookbar(standens lokation, p_dato)`. Ukendt stand → **P0002**.

**Step 2.3 — migration `20260910110002_t10b_06_lokation_seed_permissions.sql`:** som Step 1.3 for page `lokationer` (tab `manage` + superadmin page- og tab-grants, 5-kolonne ON CONFLICT).

**Fejl-loci Bid 2:** min-1-stand (parameter-krav + atomisk tx + count-check + FOR UPDATE) · COALESCE-retning og seq-orden i pris-oraklet · trigger-WHEN-klausulerne · immutability-guards · NOT NULL/CHECK-sættet (navn, type, dagspris, gruppe-FK) · init-status-eventet · gruppe-aktiv-guarden · fraværet af delete-veje. **Harness-form:** K-1/K-2/K-3-rækkerne i matrixen. **Done:** matrix-rækkerne K-1 ac 1-4, K-2 ac 1/2/6, K-3 ac 1/2 + kill-frø K-1 a-f, K-2 a-f, K-3 b/d grønne. **Angrebs-spec-krav:** to-sessioners concurrency-bevis for min-1-aktiv-stand (to samtidige `stand_saet_aktiv` på hver sin af lokationens to sidste aktive stande — præcis én skal fejle). OBS: `run-db-tests.mjs` sender én query ad gangen (`e767efb8:84-109`) og kan IKKE bære to-sessioners-beviset — Codex' prover-harness skal bruge to forbindelser; kan det ikke etableres i Fase 4, dokumenteres FOR UPDATE-låsen som residual med enkelt-sessions-mutant (fjern låsen → kodeinspektions-kill) og flaget bæres synligt i build-proof. **Risiko-flag: HØJ** (atomicitet + concurrency + tre trigger-logs) → targeted mutanter + to-sessioners-prøven; bred mutation på `lokation_opret`-flowet.

### Bid 3 — Status-livscyklus + hvile-handlinger (K-4 · K-5 · K-2 ac 3)

Afhænger af: Bid 2.

**Step 3.1 — migration `20260910120000_t10b_07_status_rpcs.sql`:**

| RPC | signatur | gates (efter permission `lokationer/manage/true` + årsag) | mutation/effekt |
|---|---|---|---|
| `lokation_saet_status` | `(p_lokation_id uuid, p_status text, p_change_reason text, p_dvale_ophoer date default null) returns void` | status uden for {aktiv,dvale,nedlagt} → 22023 `ugyldig status` · `p_dvale_ophoer` sat og `p_status <> 'dvale'` → 22023 · `p_dvale_ophoer <= current_date` → 22023 `dvale_ophoer skal ligge efter i dag` · lokation findes ellers P0002 + `FOR UPDATE` på lokations-rækken (serialiserer skift pr. lokation) · v_nu := `lokation_status_paa(id, current_date)`; samme status → 22023 `status_uaendret` — UNDTAGEN dvale→dvale med ÆNDRET ophør (lovligt: forlæng/afkort hvile, S-6) | INSERT event i `lokation_status_skift` (var: allow_lokation_status_skift_write). Straks-virkning: intet backdate-parameter findes (fortid designet urørlig). Genåbning (ac 7) = samme RPC m. 'aktiv'. Nedlæggelse: INGEN kaskade-skrivning — afledt frakobling via oraklet (V8/K-4 ac 9) |
| `lokation_status_historik` (read) | `(p_lokation_id uuid) returns table (status text, dvale_ophoer date, skiftet_kl timestamptz)` | 42501-read-check | select fra loggen, seq-orden (ac 4's "hvad gjaldt hvornår kan altid ses") |

(`lokation_saet_hviledage` blev leveret i Bid 2-migrationen; dens EFFEKT-harness hører til her, K-5 ac 3/4/5.)

**Fejl-loci Bid 3:** dvale_ophoer-afledningen (<=-grænsen) · seq-ordenen · samme-status-undtagelsen · FOR UPDATE · fraværet af backdate-/bypass-parametre · init-eventets samspil (nyoprettet = aktiv). **Harness-form:** K-4 ac 1-5/7- og K-5 ac 1-5-rækkerne; forløbs-test aktiv→dvale(m. ophør)→(afledt aktiv på ophørsdagen)→nedlagt→aktiv m. datoopslag på hvert knæk; stand-bookbarhed følger (K-2 ac 3, K-2 ac 5-stand-bestand). **Done:** rækkerne + kill-frø K-4 a/b/d/e/f, K-5 a-d grønne. **Angrebs-spec-krav:** Codex angriber dato-grænserne (ophørs-dag, samme-dags dvale-start+stop → to events samme dato, seq afgør; skift nær midnat: `skiftet_kl::date` er UTC-dato — deklareret semantik, S-4). **Risiko-flag: HØJ** (oracle-logik er pakkens booking-fundament) → bred mutation på `lokation_status_paa` + targeted på RPC-gates.

### Bid 4 — Klient-tilladelser (K-6 · K-3 ac 4/6 · K-4 ac 6/8/9)

Afhænger af: Bid 1+2+3 (gruppe, lokation, status-orakel).

**Step 4.1 — migration `20260910130000_t10b_08_koblinger_tabeller.sql`:**

```sql
-- no-dedup-key: versioneret koblings-tabel; partial UNIQUE pr. (gruppe, klient) er natural dedup
create table core_identity.gruppe_klient_koblinger (
  id            uuid primary key default gen_random_uuid(),
  gruppe_id     uuid not null references core_identity.grupper(id) on delete restrict,
  klient_id     uuid not null references core_identity.clients(id) on delete restrict,
  gaeldende_fra date not null,
  gaeldende_til date,
  applied_at    timestamptz not null default now(),
  created_by_pending_change_id uuid references core_identity.pending_changes(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (gaeldende_til is null or gaeldende_fra < gaeldende_til)
);
-- KARDINALITETS-AFGØRELSEN (cnp-fælden designet UD): unikhed pr. PAR, ikke pr. klient
create unique index gruppe_klient_koblinger_aaben_pr_par
  on core_identity.gruppe_klient_koblinger (gruppe_id, klient_id)
  where gaeldende_til is null;
alter table core_identity.gruppe_klient_koblinger
  add constraint gruppe_klient_koblinger_ingen_overlap
  exclude using gist (
    gruppe_id with =, klient_id with =,
    daterange(gaeldende_fra, coalesce(gaeldende_til, 'infinity'::date), '[)') with &&
  );
create index gruppe_klient_koblinger_opslag_idx
  on core_identity.gruppe_klient_koblinger (gruppe_id, klient_id, gaeldende_fra);

-- no-dedup-key: fravalgs-tabel; partial UNIQUE pr. (lokation, klient) er natural dedup
create table core_identity.lokation_klient_fravalg (
  id            uuid primary key default gen_random_uuid(),
  lokation_id   uuid not null references core_identity.lokationer(id) on delete restrict,
  klient_id     uuid not null references core_identity.clients(id) on delete restrict,
  gaeldende_fra date not null,
  gaeldende_til date,
  applied_at    timestamptz not null default now(),
  created_by_pending_change_id uuid references core_identity.pending_changes(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (gaeldende_til is null or gaeldende_fra < gaeldende_til)
);
create unique index lokation_klient_fravalg_aabent_pr_par
  on core_identity.lokation_klient_fravalg (lokation_id, klient_id)
  where gaeldende_til is null;
alter table core_identity.lokation_klient_fravalg
  add constraint lokation_klient_fravalg_ingen_overlap
  exclude using gist (
    lokation_id with =, klient_id with =,
    daterange(gaeldende_fra, coalesce(gaeldende_til, 'infinity'::date), '[)') with &&
  );
create index lokation_klient_fravalg_opslag_idx
  on core_identity.lokation_klient_fravalg (lokation_id, klient_id, gaeldende_fra);
```

\+ t10-hale (vars `stork.allow_gruppe_klient_koblinger_write`, `stork.allow_lokation_klient_fravalg_write`; select-policy-pages: koblinger → `grupper`, fravalg → `lokationer`; grants insert+update, ingen delete) + klassifikation (alle none/NULL) + **historik-guard-trigger pr. tabel** (design UD af "omskrivning af historik", K-6 ac 6): tillad UPDATE KUN når `OLD.gaeldende_til IS NULL` og ændringen alene sætter `gaeldende_til` (+updated_at via trigger); alt andet → **P0001** `koblinger_historik_immutabel` hhv. `fravalg_historik_immutabel`; DELETE → altid P0001. btree_gist findes allerede (`71cadac3:21`).

**Step 4.2 — migration `20260910130001_t10b_09_koblinger_pending_wiring.sql`:**

Fire wrappers (SECDEF; form `713960b8:50-97`; gate-rækkefølge: permission → blank årsag 22023 → dato-/domæne-checks → `set_config('stork.t9_write_authorized','true',true)` (G059: FØR request, EFTER alle checks) → `pending_change_request(<change_type>, <target_id>, <payload>, p_gaeldende_fra)`; returns pending-uuid). **Bruger-årsagen bæres i payload** (`payload.change_reason` — kravfæstet lukning af T9-gabet "wrappers har ikke brugersendt årsag", S-9). Fælles dato-check: `p_gaeldende_fra < current_date` → 22023 `dato_i_fortiden`.

| wrapper | change_type | target_id | payload | domæne-checks (wrapper OG apply-handler — dobbelt-verifikation `b0cff39e`) |
|---|---|---|---|---|
| `gruppe_klient_kobl` | `gruppe_klient_kobl` | p_gruppe_id | `{gruppe_id, klient_id, gaeldende_fra, change_reason}` | gruppe P0002/aktiv 22023 (admin-bypass) · klient P0002/aktiv 22023 (admin-bypass) · åben kobling findes → 22023 `kobling_findes_allerede` |
| `gruppe_klient_frakobl` | `gruppe_klient_frakobl` | p_gruppe_id | samme | åben kobling findes ellers 22023 `ingen_aaben_kobling` · `p_gaeldende_fra > koblingens gaeldende_fra` ellers 22023 |
| `lokation_klient_fravaelg` | `lokation_klient_fravalg` | p_lokation_id | `{lokation_id, klient_id, gaeldende_fra, change_reason}` | lokation P0002 · **nedlagt → 22023 `lokation_nedlagt` (INGEN bypass — strukturvagt, V4/S-7)** · klient koblet på lokationens gruppe ellers 22023 `klient_ikke_i_gruppen` · åbent fravalg → 22023 `fravalg_findes_allerede` |
| `lokation_klient_fravalg_ophaev` | `lokation_klient_fravalg_ophaev` | p_lokation_id | samme | lokation P0002 · **nedlagt → 22023 (K-4 ac 8, kravfæstet — INGEN bypass)** · klient i gruppen ellers 22023 (K-6 ac 4) · åbent fravalg findes ellers 22023 |

Fire apply-handlers `_apply_gruppe_klient_kobl` / `_apply_gruppe_klient_frakobl` / `_apply_lokation_klient_fravalg` / `_apply_lokation_klient_fravalg_ophaev` `(p_payload jsonb, p_change_id uuid)`: (1) assert `payload->>'gaeldende_fra' = pending.effective_from` ellers **P0001** (én dato-sandhed — E079-fælden); (2) re-verificér ALLE domæne-checks — admin-bypass via `is_admin_by_employee_id(pending.requested_by)` (`713960b8:25-47` — ALDRIG `is_admin()`: cron har `auth.uid()` NULL); nedlagt-checks re-verificeres UDEN bypass (fanger nedlæggelse mellem request og apply); (3) `set_config('stork.change_reason', payload->>'change_reason', true)` FØR mutationen (brugerens årsag i audit — S-9); (4) mutation: kobl/fravælg = INSERT (m. `created_by_pending_change_id = p_change_id`); frakobl/ophæv = UPDATE åben række `set gaeldende_til = payload-dato` (guard-triggeren tillader præcis dét); (5) sætter allow-write-var for sin tabel.

Wiring-udvidelser (de FIRE obligatoriske pr. change_type — K-6-faldgrube 1):
1. `pending_change_apply`: CREATE OR REPLACE — kopiér den SENESTE body (`f49e7d5b:152-220`) og tilføj 4 `when`-grene i dispatcher-CASEn (grants består ved CREATE OR REPLACE, samme signatur).
2. `pending_change_approve` + `pending_change_undo`: CREATE OR REPLACE — kopiér de SENESTE bodies (`ae336ee6:8-183`) og tilføj i BEGGE change_type→page-CASEs: `gruppe_klient_kobl`/`gruppe_klient_frakobl` → `'grupper'`; `lokation_klient_fravalg`/`lokation_klient_fravalg_ophaev` → `'lokationer'`.
3. `pending_changes_select`-policy: DROP POLICY + CREATE — kopiér den SENESTE tekst (`4df2fca6:19-60`) og tilføj to `action_id is null`-grene: de to kobl-typer m. `has_permission('grupper', null, true)`; de to fravalgs-typer m. `has_permission('lokationer', null, true)`.
4. `undo_settings`-seed (formen `f49e7d5b:222-230`): alle 4 change_types → `24 * 3600` sekunder, `on conflict (change_type) do nothing` (eksplicit seed — den defensive 24t-fallback i approve må aldrig VÆRE kontrakten). Ingen permission_actions-entries (V10: intet 2.-godkender-krav i kravet; additiv model står klar).

**Step 4.3 — migration `20260910130002_t10b_10_ret_oracle_rpcs.sql`:**

| RPC | signatur | logik (bindende) |
|---|---|---|
| `klient_maa_staa_paa` (read, invoker) | `(p_klient_id uuid, p_lokation_id uuid, p_dato date default current_date) returns boolean` | v_gruppe := gruppe-paa-dato fra `lokation_gruppe_historik` (seneste række `gaeldende_fra <= p_dato`, seq DESC; NULL → false) · v_koblet := EXISTS åben/dækkende kobling (v_gruppe, klient) på dato (`gaeldende_fra <= d AND (til IS NULL OR til > d)`) · v_fravalgt := EXISTS dækkende fravalg (lokation, klient) på dato · v_status := `lokation_status_paa(lokation, dato)` · **return v_koblet AND NOT v_fravalgt AND v_status IS NOT NULL AND v_status <> 'nedlagt'** (dvale ⇒ ret=true men bookbar=false — kravets model, K-4 ac 6) |
| `lokation_klienter` (read, invoker) | `(p_lokation_id uuid, p_dato date default current_date) returns table (klient_id uuid, klient_navn text)` | mængde-formen af oraklet (samme tre led); tom for nedlagt dato (K-6 ac 9's observationsflade) |
| `lokation_pending_hent` (read, invoker) | `(p_pending_id uuid) returns jsonb` | select payload+status+effective_from fra `pending_changes` WHERE id og change_type i pakkens 4 typer — RLS-select-policyen afgrænser (godkender-synlighed); ukendt/fremmed type → P0002. (Lukker recon-Codex' payload-læsevejs-gab E081) |
| `gruppe_hent` (CREATE OR REPLACE fra Bid 1) | uændret signatur | + koblede klienter pr. dags dato-array. `lokation_hent` (CREATE OR REPLACE fra Bid 2): + aktive fravalg-array |

**Fejl-loci Bid 4:** de fire wiring-punkter · kardinalitets-indexet · guard-triggerne · oraklets tre led + dato-læsning i hvert led · dobbelt-verifikationen · payload-dato-asserten · årsags-propageringen · undo_settings-seedet · nedlagt-guards uden bypass. **Harness-form:** recon-Codex' acceptmatrix (recon2 §K-6) overtages som testskelet: fuld kæde request→(synlig for godkender)→approve (self-approve-forbud)→undo-negativ→due→apply→oracle-flip; historiske datoer før/efter frakobling; nedlæg/genåbn-forløbet m. gruppens ændrede klientmængde (M-19: DA gældende); request→nedlæg→apply-negativen. **Done:** K-6 ac 1-10-, K-3 ac 4/6-, K-4 ac 6/8/9-rækkerne + kill-frø K-6 a-k grønne. **Angrebs-spec-krav:** Codex angriber dato-kanterne (kobl+frakobl samme dag → 22023-kravet `fra < til`; re-kobling efter frakobling; fravalg der overlever nedlæg/genåbn (V-P05: BEVAR)) og to samtidige requests på samme relation (approve/apply-serialisering via `FOR UPDATE` på pending-rækken + partial-UNIQUE-bagstopperen — to-sessioners-prøve som Bid 2). **Risiko-flag: HØJ** (flest bevægelige dele; pakkens forretningskerne) → bred mutation på oraklet + targeted på wiring-punkterne.

### Bid 5 — Anonymisering + K-9-samleharness (K-7 ac 2/4 · K-9 · K-1 ac 5)

Afhænger af: Bid 1 (kontakter); harness-delen af Bid 1-4.

**Step 5.1 — migration `20260910140000_t10b_11_anonymisering.sql`:**

1. **Interne funktioner** (mapping-kolonnerne `internal_rpc_anonymize`/`internal_rpc_apply` er NOT NULL og regprocedure-valideret — `c5b47ec5:38-52,70-73` + r7a-fix `6f0e1db3`):
   - `core_identity._anonymiser_gruppe_kontakt_internal(uuid, text)`: delegerer til `core_compliance.anonymize_generic_apply('gruppe_kontakt', $1, $2)` (p1c-delegeringsformen `ca921ccb:20-57`).
   - `core_identity._gruppe_kontakt_apply(uuid, jsonb, text)`: pure apply til replay — parser generic_apply's NESTEDE snapshot-format `{kolonne:{strategy,strategy_id}}` (`6083fecd:92-119`) og anvender registry-strategifunktionen pr. kolonne (navn/email/telefon) via regprocedure-kald (formen `20260514170004:78-131 @ c5b47ec5`); **ukendt/manglende strategi → RAISE P0002 — ALDRIG coalesce til original værdi** (E109-fælden designet ud).
2. **Mapping-seed** (INSERT m. `status='approved'` er tilladt under migration — lifecycle-triggerens migration-bootstrap-gren `ec3d9a0b:49-57`): `entity_type='gruppe_kontakt'`, `table_schema='core_identity'`, `table_name='gruppe_kontakter'`, `field_strategies='{"navn":"hash","email":"hash_email","telefon":"blank"}'` (P1a-seedede strateginavne: blank/hash/hash_email — `d69ea57e:223-228` + `15557e93:53`), `jsonb_field_strategies=NULL`, `anonymized_check_column='anonymized_at'`, `retention_event_column=NULL` (ingen event-retention valgt — princip 4), `internal_rpc_anonymize='core_identity._anonymiser_gruppe_kontakt_internal'`, `internal_rpc_apply='core_identity._gruppe_kontakt_apply'`. Én tabel pr. entity_type (E209-fælden undgået). **Aktivering er et UI-drift-step** (anonymization_mapping_activate af rettighedshaver — konsistent m. K-9 og P2-precedensen "approved kræver UI-aktivering"); e2e-testen driver hele lifecyclen inkl. aktivering under ROLLBACK.
3. **Offentlig wrapper** `anonymiser_gruppe_kontakt(p_kontakt_id uuid, p_change_reason text) returns void` (SECDEF; p1c-formen): `has_permission('grupper','manage',true)` 42501 → blank årsag 22023 → kontakt findes P0002 → delegér til generic_apply. (generic_apply's egne gates: aktiv mapping P0002 · PII-coverage P0001 · active-strategi P0001 · `anonymized_at IS NULL`-guard P0002 — `6083fecd:41-125`.)
4. **Luk adgangskanten** (E119-E121): `revoke execute on function core_compliance.anonymize_generic_apply(text, uuid, text) from authenticated;` — SECDEF-wrapperne kalder som ejer og berøres ikke; negativ-test: authenticated direkte kald → afvist. (Build-verifikationspunkt B-2, §8: viser e2e at en eksisterende flade knækker, HALT + retur til Mathias-bordet i stedet for tavs videreførelse.)

**Step 5.2 — K-9-samleharnesset (spec — Codex skriver):** fuldt gennemløb som authenticated rettighedshaver (JWT-sim) af den NUMMEREREDE handlingsliste: gruppe opret/redigér/type-sæt/udfas · kontakt opret/redigér/udfas · lokation opret (m. stand)/redigér/gruppe-skift/hviledage · stand opret/redigér/deaktivér(+sidste-stand-negativ) · status: dvale (m./u. ophør)/stop-før-tid/nedlæg/genåbn · kobl/frakobl/fravælg/ophæv gennem hele pending-kæden · anonymisér kontakt (efter UI-lifecycle-steps) · klassifikations-valg via de FÆLLES eksisterende indgange (`b9f976338`-fladen) · alle oracle-/read-opslag. Hver handling: også uden grant → 42501. Intet trin må kræve psql/service-adgang (K-9 ac 2). + m1_permission_matrix + gov_3b-suiten grøn.

**Fejl-loci Bid 5:** mapping-seedets felter (check-kolonne, strateginavne, RPC-navne) · nested-snapshot-parseren · revoke-steppet · wrapper-gates. **Done:** K-7 ac 2/4- og K-9-rækkerne + kill-frø K-7 a-f grønne; replay-prøven kører med NYPRODUCERET snapshot (aldrig legacy-flat-fixture — E111/E112-lektionen) og asserter VÆRDI-erstatning. **Angrebs-spec-krav:** Codex angriber genbrugs-scenariet (anonymiseret kontakt → ny kontaktperson = NY række (S-11) → ny anonymisering rammer KUN den nye) + state-idempotens (dobbelt-kald P0002). **Risiko-flag: MIDDEL** (meget er eksisterende fundament; nyt = seed-data + to små funktioner) → targeted mutanter.

---

## 3. Plan-fase-afgørelser (alle 13 deklarerede valg + supplerende)

Hver afgørelse: truffet HER, inden for kravets ramme, på recon-2's fakta. Codex angriber; Mathias' plan-OK dækker. (Numre = recon-Codes V1-V13; recon-Codex' P01-P14 er samme bord — P04/P05 er dækket under V4/V8.)

**V1 · Gruppens feltliste: FAST (rigtige kolonner)** — navn, type, kontaktpersoner i egen tabel (navn/email/telefon). *Afviger fra kravets analogi-default ("som for klienter") — kravet deklarerer selv analogien som "analogi, ikke krav" og lægger valget her.* Begrundelse: (a) UI-udvidelig registry-jsonb koster ALLE 6 dele (registry + jsonb-CHECK + validate-trigger + audit-special-case PR TABEL + immutabilitets-RPC + set_active) OG rammer den døde jsonb-anonymiseringsvej (V2); (b) fast kolonneliste er M-24's skel 1:1: HVILKE felter er struktur (hardkodet), værdierne er UI; (c) generic_apply virker DIREKTE på fysiske direct-kolonner — 0 ny anonymiserings-kode (recon-Code V1 + recon-Codex P01/P02-fakta). Nye felt-BEHOV senere = migration (eksplicit vedstået omkostning). CVR m.v. medtages IKKE (intet Mathias-ord, intet krav — antag aldrig; nye felter er én migration væk).

**V2 · Anonymiserings-vej: RIGTIGE KOLONNER** — følger af V1. Kontakt-felterne klassificeres `direct`; mapping + strategier er ren DATA (blank/hash/hash_email genbruges); jsonb-snapshot-konflationen (`6083fecd:112-118`) kommer ALDRIG på pakkens sti — se §5-faldgrube 4.

**V3 · Gruppe-type: VALGFRI ved oprettelse (kravets default)** — nullable + CHECK IN {kaede, enkelt_butik, messe_operatoer, andet} (ordbogs-mappede værdier, §4). M-17 nævner kun navn ved oprettelse; NULL = reelt "ikke valgt" (princip 4). Krævet-før-rabat-brug håndhæves i trin 29's forbrugsflade (kravets egen afgrænsning). valgfri→krævet senere = migration m. backfill (vedstået).

**V4 · Fravalgs-/frakoblings-handlinger på nedlagt lokation: AFVISES (kravets default)** — 22023 `lokation_nedlagt` i wrapper OG apply-handler (dobbelt-verifikation). UNDTAGELSE præcist afgrænset: gruppe-NIVEAU-handlinger (kobl/frakobl på gruppen) guarder IKKE mod nedlagte lokationer i gruppen — gruppens generelle frakobling skal fungere (recon-Codex P04), og nedlæggelses-"frakoblingen" er afledt (V8) og blokerer derfor aldrig sig selv.

**V5 · Gruppe = §1.12's leverandør: ÉN entitet** (`core_identity.grupper`). Fakta: ingen leverandør-/gruppe-objekt findes i kodebasen (intet at flette); to entiteter ville kræve en kardinalitets-beslutning intet Mathias-ord bærer (recon-Codex P06) og fordoble master-data-omkostningen. §1.12's "leverandør-FK" på lokationen ER `gruppe_id`; type-feltet (rabat-anker, trin 29) bor på gruppen. Ordbogen bærer mappingen (§4).

**V6 · Mindst én stand: (a) oprettelse = atomisk RPC** — `lokation_opret` KRÆVER første stands navn som parameter og INSERT'er lokation+stand+status-event i én tx (formen `71cadac3:235-246`). Ingen deferrable-constraint: 0 precedens i hele fladen (grep-verificeret af recon-Code) — RPC-atomicitet er kodebase-nativ og TÆT, fordi revoke-regimet (`408a96ff`) har lukket enhver anden skrivevej. **(b) sletning: findes ikke** (ingen delete-grant/-policy/-RPC; M-14). **(c) deaktivering:** stande får `is_active` (UI-styring af "hvilke stande", K-2 Værdi; klient-precedensen: toggle i stedet for DELETE) med guard "sidste AKTIVE stand kan ikke deaktiveres" (P0001) under `FOR UPDATE`-lås på lokations-rækken (serialiserer to samtidige deaktiveringer — recon-Codex E034/E035-fælden). Se §5-faldgrube 3.

**V7 · Gruppe-arv på stand: AFLEDT** — stande har INGEN gruppe-kolonne; gruppen læses via lokationen (præcedens: §1.12's pris-arv = NULL+arv). Mismatch er strukturelt umulig (der findes ingen anden gruppe-sandhed på standen); materialisering ville kræve sync-trigger uden forbillede (recon-Code V7).

**V8 · Effektiv ret klient×lokation: AFLEDES** — prædikat-komposition af TRE daterede kilder: kobling-på-dato ∧ ¬fravalg-på-dato ∧ status-på-dato ≠ nedlagt, alle læst på SAMME D (recon-Codex E057/E082). Derfor er status-historik (event-log), daterede koblinger/fravalg OG dateret gruppe-ejerskab (`lokation_gruppe_historik`) forudsætninger — leveret i Bid 2/4. closure-formen kan IKKE bære K-6 ac 7 (se §5-faldgrube 2). **Fravalg BESTÅR gennem nedlæggelse/genåbning** (P05: egen række, urørt af status — genåbning arver gruppens DA gældende klienter MINUS stadig gældende fravalg; M-19 + M-36: fravalg gælder også senere tilkomne lokationer). **Nedlæggelses-"frakoblingen" (K-4/K-6 ac 9) er AFLEDT**: ingen kaskade-mutation — retten dør pr. dato via status-leddet, historiske svar består (M-13), genåbnings-arven er gratis (M-19), og "nedlagt lokation med aktive klienter" kan ikke observeres i nogen læseflade. Team_close-kaskade-formen (`17930649:151-222`) bruges bevidst IKKE (dens exact-start-DELETE er ikke append-only — recon-Codex E087/E088).

**V9 · Dvale og hvile: ÉN model-ting** — hvile ER status `dvale`, evt. med `dvale_ophoer` (dato); manuel dvale = samme status uden/med ophør. Én sandhed (princip 1), r7d-umulig by construction (lokationer har INGEN status-/is_active-kolonne — status afledes ALTID af event-loggen), K-4 ac 5 og K-5 ac 1 forbruges af SAMME bookbar-orakel. Auto-ophør er AFLEDT i oraklet (dvale m. `ophoer <= dato` → aktiv) — ingen cron i pakken (recon-Codex: "cron ikke nødvendig for status ved datoopslag"). Stop-før-tid = `lokation_saet_status('aktiv')` (M-27b: åbner lokationen i UI, straks). Trin 24's auto-hvile kalder samme RPC med `dvale` + ophør = kampagne-slut + hviledage (nedstrøms-noten består). **Hviledage-konfig-formen:** nullable integer-kolonne PÅ lokationen (pr. lokation — IKKE singleton, recon-Code K-5), NULL = intet valg = ingen auto-hvile (M-21, princip 4), enhed = DAGE (M-21 låser), CHECK `>= 1` (0/negativ afvist — 0 dage er semantisk "intet valg" og udtrykkes som NULL; INTET øvre loft — intet forretningsgrundlag for et opfundet tal). Intradag-kanten (R2-H7): status-events bærer `skiftet_kl timestamptz`; dato-opslag læser `skiftet_kl::date <= p_dato` (UTC-dato) med seq som total orden — samme-dags start+stop giver to events hvor den seneste gælder for dagen; deklareret semantik, testes på kanten.

**V10 · Fortrydelses-wiring + direkte-vs-godkendelse pr. handlings-type** — kravets ramme (Usikkerheds-dispositionen): *daterede ændringer = fortrydelses-mekanisme; stamdata = direkte m. audit.* Konkret: **pending-vejen** (request→approve→undo-vindue→apply) for de fire klient-koblings-handlinger (kobl/frakobl/fravælg/ophæv — de bærer gældende-dato, K-6 ac 10); **direkte-vejen** (permission+årsag+audit, straks) for al stamdata OG status-skift OG hviledage (K-5 ac 3's straks-afledning M-29.5 — bekræftelses-linjen står i kravet; siger Mathias stop, er pending-formen drop-in med samme gate-rækkefølge). Undo-defaults: 24t pr. ny change_type, EKSPLICIT seedet (aldrig den tavse fallback); 0..30 døgn er UI-justerbart (K-8 Værdi). **Ingen permission_actions/2.-godkender** for pakkens handlinger — intet K kræver det; modellen er additiv og kan tilkobles senere uden om-design. Applied kan ikke undo'es → fortrydelse EFTER apply = ny modsatrettet ændring (eksplicit disposition — S-10).

**V11 · Valuta/enhed + tom pris** — `numeric(12,2)` (eneste beløbs-precedens `b0491013:17`), implicit DKK pr. DAG (dagspris); INGEN valuta-kolonne (ingen precedens, intet Mathias-ord — fremtidig migration hvis behovet opstår; vedstået afgrænsning). **Lokationens dagspris NOT NULL** (krævet ved oprettelse) + **standens NULL = arv** — recon-Codes V11-faktum: eneste variant der opfylder K-2 ac 2 uden tre-tilstands-semantik. `0` er en lovlig, eksplicit pris (CHECK `>= 0`); 0 ≠ NULL (recon-Codex P08). Pris-historik: append-only trigger-log + dato-oracle (K-1 ac 3's "hvad gjaldt hvornår" som reel opslagsflade for trin 24/29 — ikke kun audit-spor; recon-Codex E026: audit alene er ikke et entydigt forretningsopslag).

**V12 · Seeding: KUN superadmin** (m1-/t10-precedensen; skellet leverance/drift). Pages `grupper` + `lokationer` under EKSISTERENDE area `org_structure` (t10-precedens; undgår nyt-area-grant-hullet). Superadmin får BÅDE tab- og page-grants (approve-gaten er page-level — `ae336ee6:36-55`). Øvrige roller = UI-drift via eksisterende grant-RPC'er.

**V13 · Gruppe ud af brug: `is_active`-toggle** (`gruppe_saet_aktiv`, bb9ee808-formen) + guards: ny lokation på inaktiv gruppe afvises, ny kobling på inaktiv gruppe afvises (22023, superadmin-bypass som forretningsvagt-klassen). Semantik: eksisterende lokationer, koblinger og effektive retter BESTÅR (intet K kobler gruppe-udfasning til ret-tab; ingen automatisk nedlæggelse — recon-Codex P12); sletning er designet ud i tre lag (revoke + ingen delete-policy/RPC + FK RESTRICT).

**Supplerende afgørelser (S) — self-check mod skjulte build-tids-valg:**

- **S-1 Model-form:** TO tabeller (`lokationer` + `stande`) i stedet for §1.12's samme-tabel/parent_location_id. Designer UD: cykler, selv-reference, under-stande, stand-uden-lokation, og alle betingede type-CHECKs en blandet tabel ville kræve. Recon-Code K-2 blåstempler eksplicit to-tabel-modellen som gyldig opfyldelse; kravet binder ejerkæden, ikke tabel-formen (præcedens: kravets eget §1.12-vedligeholds-flag om relations-tabellen). Masterplan-opdateringen (§6) dokumenterer formen; ordbogen mappes (§4).
- **S-2 Status-lager:** append-only event-log `lokation_status_skift` med `seq`-identity som total orden; INGEN status-kolonne (V9). Ny lokation fødes `aktiv` (init-event i opret — den oprettes for at bruges; eneste meningsfulde default). Alle skift af FORSKELLIG status tilladt (aktiv↔dvale↔nedlagt — kravet forbyder ingen overgang; genåbning M-28); samme-status afvist (22023) undtagen dvale→dvale m. ændret ophør (S-6).
- **S-3 Historik-lager for pris og gruppe-ejerskab:** trigger-fødte append-only logs (kolonnen er NU-sandheden, loggen er HISTORIK-sandheden, triggeren gør synk uglemmelig). Audit-form (enable uden force) — præcedens: audit_log.
- **S-4 Dato-semantik (bindende for alle oracler):** "på dato D" = seneste event m. `skiftet_kl::date <= D` (UTC-dato), seq-orden afgør samme-dags-tie; dvale-ophør er halvåbent (ophørs-dagen er aktiv); pris på dato D = dagens SIDSTE pris (S-5); før-oprettelses-datoer → NULL-status/false-bookbar/false-ret (dokumenteret).
- **S-5 Pris-opslags-tie:** dagens sidste ord gælder for dagen (konsistent med S-4).
- **S-6 Dvale-forlængelse:** dvale→dvale m. ÆNDRET `dvale_ophoer` er lovlig (nyt event dokumenterer ændringen; fortiden urørt).
- **S-7 Bypass-grænsen (bindende klassifikation):** superadmin-bypass KUN på forretningsvagter (gruppe-/klient-AKTIV-checks — b0cff39e-mønstret); ALDRIG på strukturvagter (P0002 findes-ikke · 22023 forkert-type · blank navn/årsag · **nedlagt-guards** — de er kravfæstede afvisninger, K-4 ac 8, og en bypass ville være den omgåelse M-27b afviser).
- **S-8 Stamdata på nedlagt lokation:** `lokation_rediger`/`lokation_saet_gruppe`/`lokation_saet_hviledage`/`stand_rediger`/`stand_saet_aktiv` er TILLADT (stamdata er ikke klient-til-valg); `stand_opret` på nedlagt afvises (ny kapacitet på ude-af-drift → genåbn først; dvale tillader alt — "kan forberedes", K-4).
- **S-9 Bruger-årsag i pending-vejen:** wrappers kræver `p_change_reason` (22023) og bærer den i payload; apply-handleren sætter den som `stork.change_reason` før mutationen → K-8 ac 2 gælder også dateret vej (lukker T9-gabet recon-Codex fandt: request-funktionen lagrer ingen bruger-årsag).
- **S-10 Fortrydelse efter apply:** findes ikke som undo — ny modsat-rettet ændring gennem samme pending-vej (deklareret; c3b2865c:55-61-status-CHECKs).
- **S-11 Kontakt-genbrug efter anonymisering:** en anonymiseret kontakt-række er LÅST (UPDATE → 22023 `kontakt_anonymiseret_opret_ny`); ny kontaktperson = NY række (ny entity_id → state-UNIQUE og `IS NULL`-guarden forbliver sande; recon-Codex' genbrugs-fælde designet ud).
- **S-12 generic_apply-adgangskanten lukkes:** revoke execute fra authenticated (E119-E121); SECDEF-wrappers upåvirkede (kalder som ejer). Build-verifikationspunkt B-2 (§8).
- **S-13 Klassifikations-valg (K-7):** `direct` KUN gruppe_kontakter.{navn,email,telefon}; `indirect` KUN lokationer.adresse (recon-flagets konservative læsning); alt andet `none`; retention NULL overalt (ingen 'permanent' → ingen allowlist-udvidelse; D1/D2 tillader NULL). Gruppens/lokationens NAVN er virksomheds-/steds-data, ikke persondata (kravets §11-grænse: kontaktpersonen er grænsen).
- **S-14 Navnekonvention:** domæne-ord på dansk efter ordbogen; verbums-suffikser følger kodebasens former (`_upsert`, `_saet_*`, `_opret`, `_hent`, `_liste`, `_paa`) — mapping i §4.
- **S-15 Migrationsfil-navne:** `202609101x0000_t10b_NN_<navn>.sql` som angivet pr. bid — byggeren opfinder ingen navne.
- **S-16 Required-skellet på lokationen:** `type` er KRÆVET ved oprettelse (NOT NULL — K-1: lokationen "bærer" type; listen har 'andet' som eksplicit opsamling, så kravet koster intet informationstab og "typeløs lokation" designes ud); `adresse` er VALGFRI (M-24 hardkoder kun navn som krævet; princip 4). Gruppe-typens valgfrihed (V3) er dermed en bevidst asymmetri: dér har M-17 talt ("oprettes med navn"), her har K-1's feltliste.

---

## 4. Ordbogs-arv (planen arver Mathias' navne — mapping-tabel)

Planens system-navne pr. ordbogs-reglen (B3). Rækker markeret **[NY ENTRY]** SKAL appendes til `plan-build/lokations-skabelon/ordbog.md` af driveren FØR plan-gaten (en navne-afvigelse uden entry = FAIL):

| Mathias' ord (kilde) | system-navn i planen | note |
|---|---|---|
| lokation (M-23/M-24, §1.12) | `core_identity.lokationer` (tabel) · `lokation_*` (RPC-præfiks) | arvet direkte |
| stand / stande (M-14/M-17/M-18) | `core_identity.stande` (tabel) · `stand_*` | **[NY ENTRY]** opdaterer eksisterende entry: egen tabel m. `lokation_id`-FK (S-1) — IKKE child-lokation m. parent_location_id; placement = masterplan-ordet |
| gruppe (M-17/M-18/M-27c) | `core_identity.grupper` · `gruppe_id` · `gruppe_*` | gruppe ER leverandør-entiteten (V5) — **[NY ENTRY]**: afklaringen i eksisterende entry lukkes: én entitet |
| ejer / ejerkæden (M-18) | FK-kæden `grupper ← lokationer ← stande` | arvet som struktur |
| kobles på (gruppen) (M-17) | `gruppe_klient_koblinger` (tabel) · `gruppe_klient_kobl`/`gruppe_klient_frakobl` (RPC) | arvet |
| fravælge (M-17) | `lokation_klient_fravalg` (tabel) · `lokation_klient_fravaelg`/`lokation_klient_fravalg_ophaev` (RPC) | arvet |
| aktiv · dvale · nedlagt (M-25.1) | enum-værdierne `'aktiv'`,`'dvale'`,`'nedlagt'` + tabel `lokation_status_skift` | hans ord ER værdierne. **[NY ENTRY]**: nedlagt er GENÅBNELIG (M-28) — retter ordbogens "slut-tilstand"-formulering (recon-Codex E015-flaget) |
| antal hvile dage (M-21) | kolonnen `lokationer.hviledage` (integer, dage) | arvet |
| stoppe dvaleperioden (M-27b) | `lokation_saet_status('aktiv')` | samme dedikerede handling |
| navn, adresse, dagspris | `navn`, `adresse`, `dagspris` | dansk 1:1 |
| type (butik/messe/marked/event/andet) (K-1) | CHECK-værdierne `'butik','messe','marked','event','andet'` | kravets ord 1:1 |
| gruppens type (kæde/enkelt-butik/messe-operatør/andet, §1.12) | CHECK-værdierne `'kaede','enkelt_butik','messe_operatoer','andet'` | **[NY ENTRY]** ASCII-mapping (æ/ø → ae/oe) |
| kontaktperson (K-7/§11) | `core_identity.gruppe_kontakter` | **[NY ENTRY]** |
| klient (gennemgående) | eksisterende `core_identity.clients` · param-/kolonnenavn `klient_id` | **[NY ENTRY]** mapping klient ↔ clients-tabellen (dansk i pakkens flade, eksisterende tabel uændret) |
| tilladelse (§14, FORÆLDET som direkte objekt) | afledt ret: `klient_maa_staa_paa` (oracle) | konsistent m. ordbogens M-17-rettelse |

Systemtekniske ord uden Mathias-flade (seq, gaeldende_fra/til, skiftet_kl, dvale_ophoer, is_active, anonymized_at) følger kodebasens konventioner og optræder aldrig i Mathias-vendt tekst.

---

## 5. Faldgruber fra recon-2 — synligt adresseret

1. **cnp-kardinalitets-fælden** (recon-Code K-3 faldgrube 1): `client_node_placements`' partial UNIQUE på `(client_id)` alene ville forbyde multi-gruppe-medlemskab, som kravet IKKE forbyder. Planen: partial UNIQUE på **`(gruppe_id, klient_id)`** WHERE åben + EXCLUDE pr. PAR (Bid 4.1-DDL) + dedikeret kill-mutant (K-3/K-6 frø a) + positiv-test "samme klient i to grupper samtidig".
2. **closure current-state-only vs K-6 ac 7** (recon-Code V8 / recon-Codex P07): `org_node_closure` er et current_date-snapshot (aldrig historisk) m. AUDIT_EXEMPT — formen kan IKKE bære historiske ret-opslag. Planen MATERIALISERER derfor IKKE retten: afledt komposition af tre daterede kilder (V8), inkl. dateret gruppe-ejerskab (`lokation_gruppe_historik`) så selv gruppe-skift ikke omskriver historiske svar. Kill-mutant: hardcode current_date i ét led (K-6 frø d).
3. **Ingen deferrable-precedens for min-1-stand** (recon-Code V6, grep: 0 hits): planen opfinder INGEN ny constraint-form — atomisk opret-RPC (parameter-krævet første stand) + deaktiverings-guard m. FOR UPDATE + fraværet af delete-veje; tætheden bæres af revoke-regimet. Concurrency-beviset er eksplicit angrebs-spec-krav (Bid 2) med deklareret runner-begrænsning (`e767efb8` én query ad gangen) og synlig residual-vej hvis to-sessioners-harness ikke kan etableres.
4. **jsonb-snapshot-konflationen** (recon-Code usikkerhed 3, `6083fecd:112-118`): jsonb-strategier appliceres ikke og kolonne-snapshottet skrives i begge snapshot-felter. Planen VÆLGER kolonnevejen (V1/V2) — konflationen ligger aldrig på pakkens sti; `jsonb_field_strategies` sættes NULL i mappingen; replay-apply-funktionen parser det NESTEDE format generic_apply faktisk skriver (Bid 5.1), med RAISE på ukendt strategi (E109-fælden).

Øvrige adresserede: LENIENT-audit-vinduet (klassifikation i SAMME fil som DDL) · DML-GRANT-glemslen (V4-lektionen — eksplicit i fælles-reglen + kill-frø) · session-var-rækkefølgen (gate-rækkefølgen BINDENDE) · NULL-usikre var-gates (`= 'true'`-formen overalt) · r7d-dual-sandhed (ingen status-kolonne overhovedet) · de FIRE pending-udvidelsespunkter (Bid 4.2's nummererede wiring) · payload-dato-drift (assert i handlers) · undo-fallback-tavshed (eksplicit seed) · approve-gatens page-level-check (page-grants seedet) · T9-wrappers uden bruger-årsag (S-9) · exact-start-DELETE/UPDATE-formerne fravalgt for al pakke-historik (append-only + luk-åben-række er de eneste mutationer) · grant-indexets action_id-kolonne (5-kolonne ON CONFLICT) · types-drift (types:generate pr. bid) · governance-dokumentkæden (formålsblok byte-identisk).

---

## 6. Repo-doc-tekst 1:1 (forud-godkendte blokke til Fase 6 — anvendes, fabrikeres ikke)

**Blok A — masterplan §1.12 opdateres** (erstatter afsnittene "Lokations-entitet", "Klient-tilladelser pr. lokation", "Cooldown pr. lokation" og "Leverandører" i `docs/strategi/stork-2-0-master-plan.md` §1.12; adresserer også kravets vedligeholds-flag (a); `<BUILD-COMMIT>` udfyldes ved luk):

```doc:docs/strategi/stork-2-0-master-plan.md
**Lokations-entitet (bygget ved trin 10b, commit <BUILD-COMMIT>):**

- Pr. lokation: navn, adresse (nullable), default-dagspris (NOT NULL, numeric(12,2), DKK/dag), gruppe-FK (ejeren — se Grupper), type (butik / messe / marked / event / andet), hviledage (nullable integer — NULL = ingen automatisk hvile), anonymized_at (inaktiv struktur til fremtidig felt-klassifikation)
- Stande (placements) er en EGEN tabel (`core_identity.stande`, FK `lokation_id`) — to-tabel-formen afløser den tidligere skitserede parent_location_id-selvreference: cykler og under-stande er dermed strukturelt umulige (M-18: gruppe ejer lokation, lokation ejer stand; standen er bladet). En lokation fødes atomisk med sin første stand og har altid mindst én aktiv stand
- Stand bærer egen dagspris hvis sat; ellers arves lokationens (NULL = arv; opslag altid entydigt)
- Pris- og gruppe-ejerskabshistorik føres i trigger-fødte append-only logs med dato-opslag (`lokation_dagspris_paa`/`stand_dagspris_paa`) — en ændring rører aldrig fortiden

**Lokations-status som første-klasses livscyklus (afgjort ved trin 10b):**

- Enum-værdier: aktiv · dvale · nedlagt. Nedlagt kan genåbnes (M-28)
- Status lagres som append-only event-log (`lokation_status_skift`); nuværende status AFLEDES altid — ingen status-kolonne, ingen dobbelt sandhed
- Overgange via dedikeret RPC (`lokation_saet_status`) med årsag; auditeres. Dvale kan bære planlagt ophør (dato) — ophøret afledes i opslaget uden cron; stop-før-tid = samme RPC med 'aktiv'
- Bookings kan kun oprettes på aktiv lokation (trin 24 forbruger `lokation_er_bookbar`/`stand_er_bookbar` pr. dato)

**Klient-tilladelser (Mathias-modellen 2026-09-03, M-17 — afløser den tidligere skitserede relations-tabel klient × lokation × from/to):**

- Klienter kobles på GRUPPEN (`gruppe_klient_koblinger`, dateret, uden slutdato-krav) og arver alle gruppens lokationer — også senere tilkomne
- En lokation kan FRAVÆLGE klienter gruppen har (`lokation_klient_fravalg`, dateret) og ophæve fravalget igen; fravalg består gennem nedlæggelse/genåbning
- Effektiv ret afledes pr. dato: koblet på lokationens gruppe (dateret ejerskab) ∧ ikke fravalgt ∧ lokationen ikke nedlagt — `klient_maa_staa_paa(klient, lokation, dato)` svarer entydigt, også historisk. Booking-RPC (trin 24) validerer mod denne flade
- Nedlæggelse kobler automatisk klienterne fra lokationen (afledt pr. dato — koblings-rækker og historik bevares urørt); genåbning arver gruppens da gældende klienter (M-19)
- Til-/frakobling og til-/fravalg sker via fortrydelses-mekanismen (pending → godkendelse → undo-vindue → apply; undo-perioder pr. ændrings-type, UI-styret)

**Cooldown pr. lokation** (ikke pr. klient eller kampagne — Appendix A): hviledage-feltet på lokationen, UI-redigerbart (direkte handling med rettighed + audit); hvile udtrykkes som dvale-status med planlagt ophør. Automatisk udløsning efter kampagne kobles på i trin 24.

**Grupper (leverandører):**

- ÉN entitet: `core_identity.grupper` — Mathias' ord "gruppe" ER masterplanens leverandør (afgjort i plan-fasen, trin 10b). Lokationens leverandør-FK er `gruppe_id`
- Gruppe oprettes i UI med navn; type-felt (kæde / enkelt-butik / messe-operatør / andet — lagret som kaede/enkelt_butik/messe_operatoer/andet) er valgfrit ved oprettelse og styrer rabataftale-lookup i trin 29
- Kontaktpersoner i egen tabel (`gruppe_kontakter`) med persondata-klassifikation (direct) og anonymiseringsvej via den generiske mapping-mekanik; gruppen og dens lokationer består ved anonymisering
- Grupper slettes aldrig (FK RESTRICT + ingen delete-vej); udfasning via is_active
```

**Blok B — masterplan §4-statusrækken** (rækken for 10b i statustabellen erstattes; `<BUILD-COMMIT>`/`<DATO>` udfyldes ved luk):

```doc:docs/strategi/stork-2-0-master-plan.md
| 10b     | Lokations-skabelon                                             | ✓ Godkendt           | Trin 10b   | <BUILD-COMMIT> | <DATO>  |
```

**Blok C — §1.12-fodnote om rettelse-17-henvisningen** (kravets vedligeholds-flag (b); tilføjes ved cooldown-afsnittet):

```doc:docs/strategi/stork-2-0-master-plan.md
*(Henvisningen "afgørelse fra rettelse 17" for cooldown-pr-lokation matcher ikke Appendix C's nummerering; substansen er låst i Appendix A. Noteret ved trin 10b-plan; rettes af Mathias ved lejlighed.)*
```

---

## 7. Bro-bindinger

**plan ⊨ krav:** §1-matrixen er bijektiv — hvert K-1..K-9 (alle acceptkriterier inkl. negativer) er afbildet til bid+step+effect-harness m. navngiven afvisning; hvert bid peger tilbage på sine K; det ene forudsætnings-element (status-tabellen i Bid 2) er deklareret. Kravets negativer er hvor muligt designet UD (NOT NULL/FK/CHECK/partial-UNIQUE/EXCLUDE/append-only/fraværs-signaturer — konstateret pr. matrix-række) og ellers båret af navngivne RPC-gates med SQLSTATE. Kravets fire "kan ikke ske"-kerner: lokation uden gruppe (NOT NULL FK) · to sandheder om pris (NOT NULL+arv) · omskrevet historik (append-only + guards) · omgåelse af hvile (ingen bypass-flade) — alle strukturelle.

**plan ⊨ vision/forretning:** princip 1 (én sandhed: status/pris/ret afledes af én kilde; ingen dual-kolonner) · princip 2+3 (eksplicit sammenkobling: FK-ejerkæden gruppe→lokation→stand er M-18 som skema; forretningslogik som data: hviledage, undo-perioder, mapping, strategier, grants er DATA) · princip 4 (default = intet: hviledage NULL, gruppe-type NULL, retention NULL, ingen seeds ud over superadmin) · princip 6+9 (audit på alt m. årsag; status/koblinger bevarer historik — nedlæggelse ændrer aldrig fortiden, M-13) · forretningsforståelse §14 (systemet håndhæver hvem der må stå hvor — oraklet er skrive-/læse-fladen trin 24 forbruger) · §3 (ingen økonomi-kobling på lokation — designet ud + fitness-håndhævet) · M-ordene er citeret pr. afgørelse (M-12/13/14/17/18/19/21/25/27/28/29/36). UI-styrbarheden (M-23/M-24) er beviselig: hele handlingsfladen er granted RPC'er; struktur-forbud kan ikke slås fra i UI (K-9 ac 3-fraværstests).

**build ⊨ plan (1:1):** byggeren træffer INGEN beslutning — planen fastlægger: alle tabel-/kolonne-/index-/constraint-/trigger-navne og -definitioner (DDL-blokkene) · alle RPC-navne, signaturer, gate-rækkefølger, SQLSTATEs og fejlbesked-former · alle session-var-navne · alle enum-/CHECK-værdier · alle tærskler (hviledage ≥ 1; undo 24t-seed; dagspris ≥ 0) · dato-/tie-semantik (S-4/S-5) · bypass-klassifikationen (S-7) · seed-indhold og ON CONFLICT-mål · migrationsfil-navne og -rækkefølge (S-15) · fitness-/allowlist-vedligehold pr. bid · mapping-seedets samtlige felter · hvilke eksisterende funktioner der CREATE OR REPLACE'es og fra hvilken blob. Skabelon-boilerplate kopieres fra navngivne forbilleder (path:linjer @ blob) — genbrug ved reference, aldrig fri fantasi. Ændrer et forbillede sig mellem pin og build → HALT (ny plan-SHA), aldrig tavs tilpasning.

---

## 8. HALT-flag & retur-noter

**Ingen krav-returer.** Kravet er bygbart som skrevet; planen retter intet i det. To bekræftelses-linjer står allerede i kravet (K-1 lokation-uden-klienter · K-5 straks-virkning) og er fulgt som skrevet.

**Build-verifikationspunkter (ikke plan-HALT — deklarerede stop-betingelser i build):**
- **B-1 Live-state (R2-H1, arvet):** PostgREST-eksponeringen af core_identity kan ikke afgøres statisk; fitness' live-checks er fail-closed og CI dømmer. Rød live-check i build → HALT, aldrig baseline-hvidvask (bilag L141-fælden).
- **B-2 generic_apply-revoken (S-12):** hvis revoke-steppet knækker en eksisterende flade i e2e (ukendt live-afhængighed), → HALT + flag til Mathias-bordet; steppet må ikke droppes tavst (kanten er reel, E119-E121).
- **B-3 To-sessioners-beviserne (Bid 2/Bid 4):** kan prover-harnesset ikke bære to forbindelser, dokumenteres residualet synligt i build-proof (aldrig en tavs grøn).

**Til plan-gatens aktører:** de fem [NY ENTRY]-ordbogs-rækker (§4) skal være committet af driveren før gaten; Codex' kill-list-UDKAST (§1) finaliseres bid-bundet i Fase 4 (P-6/M-35); slutprøve-spec (P-8) leveres af Codex før plan-lås — planens §1-matrix og §2-harness-former er dens input.
