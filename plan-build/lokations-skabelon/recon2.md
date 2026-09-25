# recon-2 — lokations-skabelon (krav-drevet dybde, Fase 3)

Bindinger: krav-blob 9402164d87a35fb939661058bea77c1a052493d0 (immutabelt, gate-åbent @ 03ac5e1) · recon-1 7fbd3a2f · recon-2-bilag (aftager-arv). Hold: recon-Code + recon-Codex (friske, blinde, hver sit workdir, web forbudt). Fletning: FULD bevaring aktør-mærket — ingen dedupe (planner-Code konsumerer begge blikke; divergens er signal). Aftager: plan-dokken.

---

# AKTØR: recon-Code

# OUT — recon-2-candidate (aktør: Code) — lokations-skabelon, Fase 3 krav-drevet dybde

run_id: fase3-recon2-code-2026-09-08 · modus: recon-2 (krav-OID-input ⇒ dybde pr. K, ikke ny bred flade)

## 0. Input-verifikation (alle bindinger rev-parse-verificeret i dette workdir)

- Pinned commit: `03ac5e18db57588e9930e337193d33e49d17d087` (`git rev-parse HEAD`).
- KRAV (immutabelt, gate-åbent): `docs/sandhed/krav/lokations-skabelon-krav.md` @ blob `9402164d87a35fb939661058bea77c1a052493d0` — VERIFICERET, læst i fuld længde (427 linjer).
- recon-1: `recon/recon.md` @ `7fbd3a2f43c03ce239aa81e20483326bf438463c` — læst i fuld længde; recon-2-bilag: `recon/recon-2-bilag.md` @ `6e569779353ea1d0a2bf747ce6eda6509de1aea0` — læst i fuld længde (mutations-arven pr. fund genbruges nedenfor som kill-frø, ikke gentaget).
- Spor-arv læst: `plan-build/lokations-skabelon/` buildability-analyse-code{,-r2,-r3,-r4,-r4b}.md + ordbog.md.
- Alle blob-OID'er for kode-evidens nedenfor er rev-parset mod HEAD i DENNE kørsel (fx t10_tables=`359c0b23...`, t9_org_nodes=`71cadac3...`, r7h=`6083fecd...` — identiske med recon-1's OID'er ⇒ kortlagt tree uændret). Evidens-format: `path:linjer @ blob12`. Web ikke brugt; den anden aktørs workdir ikke rørt.

Nøgling: kode-punkter nøgles ved OID-adresse (path @ blob) — den delte observerbare kilde; K-refs nøgles mod krav-blob 9402164d.

---

## 1. Dybde pr. K-krav

### K-1 Lokation som central master-data

**Mønster-forbilleder (følges 1:1):**
- Domæne-tabel-skabelonen: `supabase/migrations/20260521000001_t10_tables.sql:24-82 @ 359c0b23` — name NOT NULL + `check (length(trim(name)) > 0)` (:26, ac 1 ordret form); jsonb-object-CHECK (:35); audit + set_updated_at-triggere (:49-55); ENABLE+FORCE RLS (:57-58); revoke+eksplicit DML-GRANT (:60-65 — grant-kommentaren :62-64 ER lektionen); tab-aware select-policy (:69-71); session-var write-policies (:73-80); ingen delete-policy = default-deny (:82).
- Write-RPC-skabelonen: `20260521000009_t10_client_rpcs.sql:17-63 @ bb9ee808` — gate-rækkefølgen er bindende: permission-check 42501 (:29-31) → blank change_reason 22023 (:32-34) → blank navn 22023 (:35-37) → FØRST DEREFTER set_config af source_type/change_reason/allow-write (:39-41) → mutation; ukendt id → P0002 (:56-58).
- Type-enum (ac 2): CHECK IN-formen — `20260518000001_t9_org_nodes.sql:50 @ 71cadac3` (`node_type in ('department','team')`) / `t10_tables.sql:96 @ 359c0b23`. Lokations-type = `check (type in (...5 værdier...))`; værdi-navnene er ordbogs-flade (Mathias' ord eller eksplicit mapping — `plan-build/lokations-skabelon/ordbog.md:3-6`).
- Pris-fortid (ac 3), to bærende mekanikker — planner vælger repræsentation, slut-effekt testbar begge veje:
  (a) per-row audit m. old/new_values: `20260514120003_t1_audit_partitioned.sql:155-159 @ a7ec4884` + immutability :184-207 (UPDATE/DELETE → P0001; TRUNCATE-blok :194-207);
  (b) versioneret lagring: `t9_org_nodes.sql:45-92 @ 71cadac3` (luk-prior+insert-ny-formen :249-256).
- Attribution-forbud (ac 4) håndhæves mekanisk: `scripts/fitness.mjs:1172-1176 @ d1b4d601` — CROSS_SCHEMA_FK_ALLOWED_TARGETS tillader KUN core_identity.employees + auth.users; enhver FK lokation↔core_money flagges live; fk-coverage :1368-1403 tvinger hver `*_id`-kolonne til FK/PK/exemption/FK_PENDING.

**Bindende constraints:** alle nye tabeller fødes skrivelåst (`20260607110004:11-12 @ 408a96ff` — INSERT/UPDATE/DELETE/TRUNCATE revoked fra authenticated+anon på hele core_*; kun SECDEF-vejen skriver); default-privileges giver 0 tabel-rettigheder + 30s statement-timeout (`20260514120001 @ c6fb84d2`, recon-verificeret); dedup-key-or-opt-out (`fitness.mjs:433-458` — CREATE TABLE kræver dedup_key ELLER `-- no-dedup-key: <grund>`; t10 bruger opt-out :22 i 359c0b23); audit-trigger-coverage (`fitness.mjs:626-677` — stork_audit-trigger ELLER AUDIT_EXEMPT-entry; listen :130-136 er kun derived-tabeller — en lokations-forretningstabel hører ALDRIG dertil); beløbs-precedens `numeric(12,2)` (`20260514150001:17 @ b0491013` + alle core_money-beløb).

**Test-vej:** `scripts/run-db-tests.mjs @ e767efb8` (én query pr. fil, DO-blok RAISE = fail, fail-fast). Smoke-forbillede 1:1: `supabase/tests/smoke/t10_client_lifecycle.sql:12-80 @ 6777522c` — BEGIN/ROLLBACK-wrap, fixture-session-vars (:22-23), JWT-simulering af authenticated superadmin via `request.jwt.claim.sub` (:26-36), positiv+negativ assertions. Negativ-mappen (fx `supabase/tests/negative/q1_employee_active_config_update_without_permission.sql`) er formen for ac-afvisninger. Nye lokations-tabeller SKAL på TX_WRAP-listen (`fitness.mjs:92-118`) hvis tests INSERT'er.

**Faldgruber:** (1) glemt DML-GRANT → permission denied FØR policy-evaluering (Codex V4-lektionen, dokumenteret :62-65 @ 359c0b23). (2) LENIENT audit-filter: uklassificeret kolonne skrives i KLARTEKST i audit m. kun WARNING (`20260521000004:43-51 @ 4eb775c9`) — klassifikation skal lande i samme migration som tabellen (t10.3/t10.4-rækkefølgen). (3) `is_active`+`status` samtidig udløser r7d-disciplinen (se K-4 faldgrube 1). (4) ON CONFLICT obligatorisk i alle bootstrap-INSERTs (`fitness.mjs:172-182` BOOTSTRAP_CONFIG_TABLES + :698-707).

### K-2 Stande (placements)

**Mønster-forbilleder:**
- Cycle-check (ac 1): `t9_org_nodes.sql:105-152 @ 71cadac3` — BEFORE-trigger, besøgs-array (:113+122-126), dybde-loft 100 (:121+138-141), parent-opslag i versioner effektive på NEW.effective_from (:129-135), P0001 `org_node_cycle_detected`. Selv-parent-CHECK :60. I en to-tabel-model (lokationer + stande som separat tabel m. NOT NULL FK) er cyklus strukturelt umulig — også gyldig opfyldelse.
- Blad-håndhævelse ("under-stande findes ikke", ac 6): `t9_org_nodes.sql:156-188 @ 71cadac3` — `_org_node_team_no_children_check` afviser parent af blad-type m. P0001; direkte analog: parent må ikke være en stand.
- Atomisk opret (min-1-stand, ac 6): `_apply_org_node_upsert` `t9_org_nodes.sql:235-246 @ 71cadac3` — identity+version INSERT'es i ÉN SECDEF-tx; analog: opret-lokation-RPC INSERT'er lokation+første stand atomisk. FAKTUM: ingen deferrable/constraint-trigger-precedens i hele migrations-fladen (grep verificeret: 0 hits) — RPC-atomicitet er den kodebase-native håndhævelse, og revoke-regimet (408a96ff) gør den tæt (ingen anden skrivevej findes).
- Stande består ved nedlæggelse (ac 5): ingen delete-grant/policy (359c0b23:82 + 408a96ff) + nedlæg-handleren må IKKE genbruge cascade-lukningen af placements fra `_apply_team_close` (`20260518000003:204-216 @ 17930649`) på STANDE — kun på klient-koblinger (M-14: koblinger af, stande består).
- Pris-opløsning (ac 2): NULL-pris på stand + COALESCE(stand.pris, lokation.pris) ved læsning — §1.12's arv-form; aldrig kopiering (to sandheder). Ingen eksisterende COALESCE-pris-læser findes (grønt felt) — formen er triviel, men læse-RPC'en er stedet den skal bo, ikke en materialiseret kolonne.

**Bindende constraints:** btree_gist er allerede oprettet (`t9_org_nodes.sql:21`); EXCLUDE/partial-UNIQUE-formene (:72-83) står klar hvis stande versioneres. fk-coverage tvinger stand.lokation_id-FK.

**Test-vej:** `supabase/tests/smoke/t9_org_nodes.sql @ 3c0103d7` (cycle-, overlap-, blad-negativer — genbrug assertions-formen) + `t9_placements.sql @ 242bf587`.

**Faldgruber:** (1) cycle-checkens dato-traversal (:129-135) er versionerings-specifik — uversioneret lokations-hierarki simplificerer opslaget, men besøgs-arrayet SKAL bevares (bilag-mutation: fjern array → cyklus opdages først ved dybde-loftet, semantisk korrupte træer når læserne). (2) Dybde-loftet alene håndhæver IKKE 2-niveau-kæden — blad-triggeren er den reelle vagt for M-18. (3) "Sletning af sidste stand": stande kan ikke slettes (ingen vej); guarden gælder kun DEAKTIVERING hvis stande får aktiv-flag — plan-valg om stande overhovedet har egen livscyklus.

### K-3 Gruppe (leverandør) som ejer

**Mønster-forbilleder:**
- Gruppe-entiteten = clients-skabelonen 1:1 (`t10_tables.sql:24-82 @ 359c0b23`): navn-CHECK (ac 3), FORCE RLS, audit, is_active-livscyklus i stedet for DELETE.
- Lokation-uden-gruppe AFVISES (ac 1/2): NOT NULL FK — FK-formen `20260521000007:15-22 @ 81fe5ff7` (ON DELETE RESTRICT; ac 5: gruppe m. lokationer kan ikke slettes — RESTRICT + ingen delete-policy + revoke = tre lag).
- Klient↔gruppe-koblingen (ac 4): koblings-tabel-skelettet fra `20260518000004:13-55 @ f49e7d5b` (FK'er, CHECK from<to, FORCE RLS, audit) + `20260518000003:15-42 @ 17930649` (partial UNIQUE + EXCLUDE-formene).
- Fravalg pr. lokation (ac 6): INGEN direkte forbillede — negativ-semantik (undtagelse) findes ikke i fladen. Nærmeste form: samme koblings-skelet (lokation_id FK + klient_id FK + audit + partial UNIQUE på aktivt fravalg). M-12/M-17-koblingen er til/fra UDEN slutdato ⇒ EXCLUDE/no-overlap er KUN nødvendig hvis planen vælger dateret versionering; ved ren til/fra-model er partial UNIQUE `(lokation_id, klient_id) WHERE aktiv` + dateret historik via audit nok.

**Bindende constraints:** gruppens type-felt: CHECK IN + (default-valget) nullable. Klassifikation af ALLE gruppe-kolonner (K-7). Kontakt-felter = persondata ⇒ anonymiserings-vejen (K-7) binder feltform-valget.

**Test-vej:** t10_client_lifecycle-formen (opret/omdøb/deaktivér + negativer); FK-testformen `supabase/tests/smoke/t10_client_node_placements_fk.sql`.

**Faldgruber (kritisk mønster-afvigelse):** (1) `client_node_placements` har partial UNIQUE på `(client_id) WHERE effective_to IS NULL` (`f49e7d5b:29-31`) = én placering pr. klient TOTALT. K-6 ac 2 kræver kun én sandhed pr. (klient, GRUPPE) — kopiéres unikheden 1:1 forbydes multi-gruppe-medlemskab, som kravet IKKE forbyder. Indexet skal være `(klient_id, gruppe_id) WHERE aktiv`. (2) team-only-triggeren (`f49e7d5b:58-83`) er org-specifik — må ikke følge med skelettet. (3) M-17-modellen lægger koblingen på GRUPPEN — cnp-formens node-kobling er analogi for FORMEN, ikke for relationens parter.

### K-4 Status-livscyklus (aktiv · dvale · nedlagt)

**Mønster-forbilleder:**
- Dedikeret status-handling (ac 3): `client_set_active` `t10_client_rpcs.sql:72-97 @ bb9ee808` — permission 42501 (:80-82), blank årsag 22023 (:83-85), P0002 ukendt (:94-96); udvides fra bool-toggle til 3-værdi-enum + årsag. Upsert-RPC'en rører BEVIDST IKKE status (:49-55 — "UPDATE rør IKKE is_active. Brug client_set_active") — dobbelt-RPC-adskillelsen ER ac 3's form. Tredje lag: 408a96ff (ingen direkte DML overhovedet).
- Årsag + audit (ac 2): stork_audit håndhæver change_reason NOT NULL+trim>0 (`a7ec4884:34`) og RAISER P0001 uden session-var for manual source (:122-129); RPC-laget afviser blank årsag FØR den sættes (bb9ee808:83-85). Cron-kilde auto-genererer årsag (:126) — auto-hvile i trin 24 auditeres derfor også.
- Historik urørlig (ac 4): audit-immutability `a7ec4884:184-207` (P0001 + TRUNCATE-blok); gøres en egen status-historik-tabel immutable skal den registreres i `fitness.mjs:79-86` (TRUNCATE-liste) + :1160-1170 (IMMUTABLE_GUARDS) + TX_WRAP :92-118.
- Aktiv-opslag pr. dato (ac 5): versioneret status = employee_node_placements-formen (`17930649:15-42` — CHECK from<to :25, partial UNIQUE åben :32-34, EXCLUDE :37-42); læse-symmetrien read()=read_at(current_date) (`20260518000008:7-135 @ b0b1c01c`) + dato-session-var-formen `stork.t9_read_at_date` (`20260520000000:667-683 @ 7e490d5f`).
- Nedlæggelses-cascade (ac 9): `_apply_team_close` `17930649:151-222` — ATOMISK i én tx: luk version (:194-196) + insert inaktiv version (:198-202) + luk alle åbne koblinger på noden (:204-216). 1:1-formen for "nedlæg → luk klient-koblinger; gruppe-koblingen røres ikke" (frakoblingen sker på lokations-relationen). Idempotens-/bypass-grænsen i nuværende body: `20260521100002:18-107 @ b0cff39e` — admin-bypass KUN på forretningsvagter, ALDRIG på strukturvagter (P0002 findes-ikke / 22023 forkert-type).
- Genåbning (ac 7): samme dedikerede handling begge retninger (set_active-formen er symmetrisk toggle m. årsag).
- Til-valg på nedlagt AFVISES (ac 8): guard-formen `client_node_place` `20260521000008:60-81 @ 713960b8` (pre-check → P0002/22023, admin-bypass kun på forretningsvagten).

**Bindende constraints:** r7d-disciplinen (`20260515130300:1-127 @ 97282fac`): tabeller med BÅDE is_active og status skal læses `status='active' AND is_active=true`; håndhævet fremadrettet af fitness legacy-is-active-readers (live pg_get_functiondef-scan, `fitness.mjs:899` + exempt-liste :151-164).

**Test-vej:** `supabase/tests/smoke/t10_client_active_check.sql @ 28c0535b` (aktiv-check-negativer) + `r7d_is_active_status_consistency.sql`; status-enum-negativ = CHECK-violation-assertion i DO-blok.

**Faldgruber:** (1) Giv IKKE lokationen både is_active-bool OG status-enum — vælg ÉN status-sandhed (3-værdi-enum), ellers skal hver ny læser dobbelt-filtrere og fitness flagger den (medmindre begrundet exempt-entry). (2) Versioneret status-historik uden EXCLUDE/partial-UNIQUE → to åbne statusser. (3) Ved genåbning i materialiseret K-6-model: genåbnings-handleren må IKKE genskabe koblings-rækker med nye datoer der omskriver fortiden — arven kommer af at gruppe-koblingen består (M-19), ikke af re-INSERT af historik.

### K-5 Hvile (cooldown)

**Mønster-forbilleder:**
- Antal hviledage pr. lokation (ac 5): nullable integer-kolonne PÅ lokationen (NULL = intet valg = ingen auto-hvile — princip 4 strukturelt). IKKE singleton-formen (`20260514130000:16-21 @ d3f3e0e3` er formen for GLOBAL konfig; hviledage er pr. lokation → kolonne).
- Ændrings-RPC m. rettighed+audit+straks-virkning (ac 3/4): q1-formen `20260514180300 @ 776b884b` — RPC: has_permission(...,'manage',true) → 42501; validering → 22023; change_reason; session-var; UPDATE (adfærd recon-verificeret :29-242; tabel+helper linjelæst :29-146 i denne runde). Alternativt t10-formen (bb9ee808) — identisk gate-rækkefølge.
- Stop-før-tid (ac 2): dedikeret handling m. årsag = status-RPC-formen (K-4); "lokationen er derefter aktiv" er slut-effekten af samme handling.
- Afvisnings-opslaget (ac 1): leveres via K-4's aktiv-pr.-dato-opslag; "ingen omgåelses-handling" er strukturel (ingen bypass-RPC leveres; break-glass er uden for pakke-fladen — konsistent m. M-27b, flade_filter-noten).
- Trin 24-koblingen (auto-udløsning): cron-skabelonen står klar — `20260514120004 @ de1eb1b3` (set_config cron+reason → arbejde → heartbeat 'ok' → EXCEPTION-blok heartbeat 'failure' + re-raise) + consecutive-failure-alarm `25805cce`; fitness cron-change-reason kræver set_config i cron-body.

**Test-vej:** negativ-formen `q1_employee_active_config_update_without_permission.sql` (ændring uden rettighed → 42501) er 1:1 for ac 3; ac 5-testen er ren data-assertion (NULL-kolonne ⇒ intet hvile-vindue opstår).

**Faldgruber:** (1) session-var-gates skal skrives NULL-sikkert: `= 'true'`-formen (p1a-coalesce-lektionen, `20260515110150 @ 6775c829` — `<>`-sammenligning m. usat var er NULL ⇒ åben gate). (2) Modelleres hvile som separat vindue VED SIDEN AF status, skal K-4 ac 5-opslaget komponere begge — se plan-valg 9. (3) M-25.2 "periode styres i ui" er DAGE (M-21) — enheds-repræsentationen (int dage) er låst af ordene, ikke frit interval-valg.

### K-6 Klient-tilladelser (gruppe-kobling + fravalg)

**Mønster-forbilleder:**
- Koblings-tabellen: skelettet fra `17930649:15-42` + `f49e7d5b:13-55` (se K-3) — ac 1 = NOT NULL FK'er; ac 2 = partial UNIQUE pr. (klient, gruppe) (OBS kardinalitets-faldgruben, K-3); ac 3 = åben effective_to er normaltilstanden i mønstret (`17930649:29` kommentar: aktiv = from<=d AND (to IS NULL OR to>d)).
- Skrivevejen (ac 10): wrapper→pending-formen `client_node_place` `713960b8:50-97` — permission-gate → pre-checks (eksistens P0002, aktiv-check 22023 m. admin-bypass) → `stork.t9_write_authorized` (:84 — SKAL sættes FØR pending_change_request, G059-lektionen `20260521100000 @ 6f8f00a1`) → pending_change_request. Apply-siden m. re-verifikation + bypass-grænse: `b0cff39e:18-107` (dobbelt-verifikations-mønstret: aktiv-check BÅDE i wrapper og apply-handler — deaktivering mellem request og apply fanges).
- Fortrydelses-maskineriet (ac 10): `20260518000000 @ c3b2865c` — pending_changes m. status-CHECKs (:55-61), undo_settings 0..30 dage (:97-116), request INTERN/revoked (:118-159), approve m. self-approve-forbud (:195-198) + undo_deadline=now()+konfig, defensiv 24t-fallback (:205-208); central apply-gate re-verificerer approved+deadline+effective_from (`f49e7d5b:172-187`); dispatcher-CASE udvides pr. pakke via CREATE OR REPLACE (`f49e7d5b:192-210`), ukendt type → 42883.
- Opslaget pr. dato (ac 7): date-parametriseret prædikat-komposition — policy-formen `7e490d5f:667-683` (is_admin OR subtree pr. `stork.t9_read_at_date`, default current_date) + read/read_at-symmetrien `b0b1c01c`.
- Frakobling fra dato, fortid urørt (ac 6): luk-åben-række-formen (`17930649:98-100` / `f49e7d5b:143-145`: `set effective_to = dato where ... and effective_to is null`) — aldrig UPDATE af historiske rækker; audit-immutability bærer "omskrivning AFVISES".
- Nedlæggelse kobler af (ac 9): team_close-cascade-formen (K-4) på lokationens koblings-/fravalgsrækker (afledt model: gratis via status — se plan-valg 8).

**Bindende constraints:** `pending_changes.target_id` er allerede FK-exempt som polymorf (`fitness.mjs:1374`) — nye lokations-change_types genbruger den (ingen ny exemption). pending-select-policy og approve-dispatcher er UDTØMMENDE pr. change_type (`20260521100005:19-60 @ 4df2fca6`; `20260607110001 @ ae336ee6` + `20260518100000 @ 7851d3b1`).

**Test-vej:** `supabase/tests/smoke/t9_pending_changes.sql @ 98245925` (request/approve/undo/apply-negativer) + `t9_supplement_2_full_flow.sql @ 97539c95` (e2e: request→approve→due→apply). Historisk-dato-opslag testes med `t9_read_at_date`-var (formen i `t9_backdated_historical_traversal.sql`).

**Faldgruber:** (1) Ny change_type kræver FIRE følge-udvidelser i samme leverance: dispatcher-CASE (ellers 42883) · pending_changes_select-policy-gren (ellers kan godkendere ikke SE pending'en — funktionelt dødt flow, bilag:122) · approve/undo change_type→page_key-mapping (ellers 42501 ved approve) · undo_settings-seed (ellers tavs 24t-default). (2) Applied kan IKKE undo'es — undo kun fra approved før deadline (`c3b2865c:59-61` status-CHECKs); fortrydelse EFTER apply = ny modsat-rettet ændring; planen skal disponere dette eksplicit for K-6 ac 10. (3) undo_period=0 er lovligt (CHECK >=0) = fortrydelses-frit flow (apply straks efter approve) — det er sådan "direkte m. godkendelse men uden vindue" udtrykkes i data. (4) Kardinalitets-faldgruben (K-3 faldgrube 1). (5) cron-apply har auth.uid()=NULL — brug `is_admin_by_employee_id` (`713960b8:25-47`) i apply-handlere, aldrig is_admin().

### K-7 Klassifikation, persondata, anonymisering

**Mønster-forbilleder:**
- Klassifikations-migrationen: `20260521000003:16-65 @ f467bafd` — top-level `select set_config(...)` (:16-19, så fitness ser dem) + ÉN INSERT m. alle kolonner + ON CONFLICT (:65). Gaten: `scripts/migration-gate.mjs @ e79ce6eb` (STRICT i CI, `ci.yml:102 @ 4312d4b5`) parser CREATE/ALTER og kræver tuple pr. kolonne (ac 1 mekanisk).
- permanent-retention: d1c-triggeren `20260514180600:15-36 @ a0c4771d` (P0001 uden allowlist) + udvidelses-formen kopiér-alt+tilføj `20260521000002:10-47 @ bb21196b` (17 entries i dag; lokations-/gruppe-tabeller SKAL tilføjes hvis 'permanent' vælges).
- Anonymiserings-vejen (ac 2): mapping-lifecycle `20260515120000:25-200 @ ec3d9a0b` (upsert→test_run→approve→activate; alt er DATA, ikke kode); entity-wrapper-formen `20260515110300:20-57 @ ca921ccb` (analog `anonymize_gruppe_kontakt`: permission → 22023-checks → deleger til generic_apply); nuværende apply-body `20260515140000:22-127 @ 6083fecd`: aktiv mapping ellers P0002 (:48-53) → stale-check (:54-65) → itererer KUN pii_level='direct'-KOLONNER (:66-72) → PII-coverage P0001 (:75-78) → strategi skal være 'active' (:79-83) → UPDATE m. `<check_col> IS NULL`-guard (:99-109, dobbelt-anonymisering → P0002) → state-INSERT (:110-120). 0 direct-kolonner → P0001 (:95-98).
- Audit-hash af jsonb: `20260521000004:78-105 @ 4eb775c9` — clients.fields-special-casen walker registry-nøgler UDEN is_active-filter (felt-deaktivering må ikke lække historiske værdier); der findes INGEN generisk jsonb-walking — en gruppe-fields-jsonb kræver sin egen special-case.
- ac 4 (dæknings-gate): verify-cron'en sammenligner kun state-rækker mod master (`20260514140002 @ ac335748`, recon-verificeret) — anonymized_at som inaktiv struktur giver INGEN falske alarmer; mapping aktiveres først når felter faktisk er direct-klassificeret.

**Bindende constraints:** retention-cron springer TAVST tabeller over uden event_based-klassifikation og uden mapping status='active' (`20260515130000:331-347 @ 6f0e1db3` — `continue`-grenene); strategi-registry-validering (P1a `d69ea57e`: prefix/signatur/volatilitet/lifecycle).

**Test-vej:** `supabase/tests/smoke/r7a_anonymize_generic_apply_e2e.sql` (fuldt apply-flow), `negative/d1c_permanent_blocked_outside_allowlist.sql @ 7170a556` (ac-formen for permanent-negativ), `negative/p1b_anonymize_requires_active_strategy.sql`. ac 1 testes ikke i db-test men i CI (migration-gate exit 1).

**Faldgruber:** (1) **jsonb-vejen er reelt død i apply:** `jsonb_field_strategies` anvendes ikke af generic_apply, OG i nuværende body skrives kolonne-snapshottet i BEGGE snapshot-felter (`6083fecd:112-118`: `field_mapping_snapshot, jsonb_field_mapping_snapshot ← v_field_snapshot, v_field_snapshot`) — jsonb-sporet er både u-appliceret og snapshot-konflateret. Vælges registry-jsonb til gruppens kontakt-felter kræves entity-specifik `internal_rpc_anonymize` (config-slot findes: dispatcher `20260514170004:33-358 @ c5b47ec5` — RPC-navne som data, regprocedure-valideret) ELLER generic_apply-udvidelse + audit-special-case + snapshot-fix. (2) LENIENT-fælden (K-1 faldgrube 2). (3) key-immutabilitet + direct→lavere-forbud UDEN superadmin-bypass er formen for felt-registre (`20260521000010:55-72 @ 9d2a0e04`) — genbruges 1:1 hvis gruppe-felt-registry vælges. (4) apply_field_strategy-NULL-fallback (legacy-vejen) er et silent no-op ved strateginavne-tastefejl — brug KUN registry-vejen (P1a-valideret).

### K-8 Adgang, audit, fortrydelse (arve-rammen)

**Mønster-forbilleder:**
- has_permission nuværende body: `20260518000010:15-213 @ 07ec8a8e` (grants primær: tab→page→area-arv, `can_access AND (…can_write)`; legacy-fallback; default-deny). Grant-modellen: `20260518000006:8-178 @ 05bcc94b` (CHECK præcis ét element; visibility self/subtree/all).
- Handlings-granularitet (hvis en lokations-handling skal have 2. godkender): permission_actions `20260521100003:12-240 @ 5a09930f` (kode-låste flag requires_second_approver/has_undo/bypass_tab_write — KUN migration-seed; CHECK has_undo⇒requires_second_approver; approver_type above|superadmin) + approve-eligibility `20260521100004:10-99 @ 2793702c` (additiv: eksplicit action-grant + tab-can_write medmindre bypass).
- Seed-skabelonen (ac 5): `20260521000006:17-56 @ fcf49401` — pages under eksisterende area m. area-scoped JOIN (navnekollisions-værn) + 'manage'-tab pr. page + superadmin tab-grants (can_access+can_write+visibility='all'), alt ON CONFLICT + `stork.t9_write_authorized` top-level. Legacy seedes IKKE (t10.13/t10.14-lektionen).
- m1-lektionen: `20260519000000:28-49 @ 1d74e04f` — hvert nyt has_permission-kaldested kræver superadmin-dækning i samme PR; `supabase/tests/smoke/m1_permission_matrix.sql @ 53d3a3dc` blokerer ellers.
- ac 1-3 er fundamentets verificerede adfærd: 408a96ff (skrivning uden om indgange) · stork_audit P0001 (årsag) · audit-immutability (a7ec4884:184-207).

**Bindende constraints (fitness-allowlists = pakkens review-flade, alle @ d1b4d601):** SECDEF_SANCTIONED pr. SIGNATUR :1530-1546ff (hver ny SECDEF-RPC + entry i samme PR; stale entries også røde :1686) · advisor-baseline `supabase/advisor-baseline.json @ b09f79cf` (nye SECDEF-eksponeringer/0-policy-tabeller; bider begge veje) · app-write-revoke (tom exemption-liste) · index-per-policy (policy-prædikat-kolonner kræver ledende btree-index; exemptions :1386-1390) · 0-policy-tabel kræver `-- default-deny:`-markør (:603-618).

**Test-vej:** `smoke/has_permission_*` + `gov_3b_3a/3b` (SECDEF-checks) + `01_function_grants_matrix.sql` (grant-paritet). K-8 ac 4 (synlighed≠handling): can_view-only-matrixen `r7b_can_view_can_edit_matrix.sql`.

**Faldgruber:** (1) Nyt lokations-AREA får IKKE automatisk superadmin-grant — t9_seed_owners' area-grants itererede kun dengang-eksisterende areas (`07ec8a8e`, seed-sektionen); seed eksplicit ELLER genbrug org_structure-arealet. (2) Revoke-from-public dækker ikke authenticated — hver RPC skal have eksplicit GRANT EXECUTE (G059, `6f8f00a1` + `20260521100001 @ add08e47`-lektionen i recon). (3) Return-type-ændring på read-RPC = DROP+CREATE + re-grant (42P13-lektionen). (4) Session-var SKAL sættes EFTER permission-check i RPC-body (t9_fundament-lektionen, bilag:83) — omvendt rækkefølge efterlader autoriseret tx efter fejlet check.

### K-9 UI-styrbarhed

**Mønster-forbilleder:** handlings-fladen = de granted SECDEF-RPC'er (§1.9-fladen) — alle mønstre ovenfor; beviset er at HVERT acceptkriterie i K-1..K-8 udøves via RPC-kald som authenticated (JWT-sim-testformen 6777522c:26-36), aldrig via psql-privilegier. CI-rammen: `ci.yml:78-168 @ 4312d4b5` (migration-gate STRICT, fitness+selftest, governance, types:check, schema:check, db:test — slutjob kræver alle grønne). Type-kontrakten: `scripts/types-gen.sh:13-53 @ 70d52135` — nye tabeller/RPC'er ⇒ `pnpm types:generate` committes i samme leverance, ellers types-drift-rød.

**Bindende constraints:** config-eksponering: `supabase/config.toml:6-20 @ 011818ba` (lokal liste = public+graphql_public) vs types-gen:15 (live-listen inkl. core_identity) — lokations-RPC'er skal ligge i core_identity for REST-kaldbarhed; fitness postgrest-t9-schema-exposure verificerer live (fail-closed). max_rows=1000 + 30s timeout begrænser læse-RPC'er.

**ac 3 (strukturelt forbud kan ikke slås fra i UI):** formen er kode-låste-flag-mønstret — UI-RPC'erne EKSPONERER ikke parametrene (`5a09930f` + UI-RPC'erne `3df4807f` i recon: upsert kan ikke sætte requires_second_approver); CHECK/trigger/revoke kræver migration at ændre. Testbar som fraværs-effekt (parameteren findes ikke i signaturen).

**Faldgruber:** governance-check (`scripts/governance-check.mjs:273-326 @ f3012195`) kræver dokumentkæden (krav/plan/status + identisk formålsblok) — pakkens CI-grønhed afhænger også af dok-kæden, ikke kun kode.

---

## 2. Plan-fase-valg — fakta-grundlag pr. udfald (planner afgør; dette er substratet)

**V1 · Gruppens feltliste fast vs UI-udvidelig (K-3/K-7; default: som klienter).**
Fast: alm. kolonner + klassifikations-rows (auto-håndhævet af migration-gate); generic_apply virker DIREKTE på direct-klassificerede kolonner; feltliste-ændring = migration (konsistent m. M-24: listen er struktur, værdierne UI). UI-udvidelig (klient-mønstret) koster ALLE 6 dele: registry-tabel (`359c0b23:90-144`) + fields-jsonb m. object-CHECK (:27+35) + lenient validate-trigger (`82f83e0e:14-59`) + audit-special-case PR TABEL (`4eb775c9:78-105`) + key-immutabilitet/direct-nedgraderings-forbud (`9d2a0e04:55-72`) + set_active-RPC — OG persondata i jsonb rammer V2. Bemærk: t10-clients ER den blandede form (navn fast, resten jsonb) — analogien er blandet, ikke ren.

**V2 · Anonymiserings-vej for gruppens kontakt-felter: rigtige kolonner vs registry-jsonb (K-7).**
Rigtige kolonner: 0 ny anonymiserings-KODE — kun data (klassificér direct + mapping-lifecycle `ec3d9a0b` + genbrug strateginavne blank/hash/hash_email `15557e93`-seedet, aktivering er UI-step). Registry-jsonb: generic_apply walker IKKE jsonb (`6083fecd:66-72`), jsonb-snapshottet er konflateret (:112-118), audit-hash kræver ny special-case (`4eb775c9` har ingen generisk walking) ⇒ enten entity-specifik internal_rpc (data-slot findes, `c5b47ec5`) eller kode-udvidelse af generic_apply + audit_filter_values. K-7 ac 4's dæknings-gate fanger tavs udeladelse uanset. Fakta-vægt: kolonne-vejen er ren data; jsonb-vejen er kode+data.

**V3 · Gruppe-type krævet ved oprettelse? (K-3; default: valgfri, krævet før rabat-brug trin 29).**
Nullable + CHECK IN = nul ekstra kode; ingen eksisterende gruppe-rækker ⇒ NOT NULL koster heller ingen backfill NU, men M-17 nævner kun navn ved oprettelse ("en gruppe oprettes med navn"). Skifte valgfri→krævet senere = migration m. backfill; krævet→valgfri = triviel. Trin 29-guarden ("type-løs gruppe møder aldrig rabat-brug") hører til trin 29's forbrugsflade, ikke denne pakke.

**V4 · Fravalgs-/frakoblings-handlinger på nedlagt lokation (K-6; default: afvises som K-4 ac 8).**
Guard-formen findes 1:1 (`713960b8:60-81`: status-pre-check → 22023/P0002; + spejl i apply-handler `b0cff39e`). Koster én guard pr. wrapper+handler + én negativ-test pr. handling. Alternativet (tillad) = 0 guards men asymmetri mod til-valg (ac 8) og mod M-14 (alt er allerede koblet af på nedlagt — handlingen er semantisk tom).

**V5 · Gruppe = §1.12's leverandør: én eller to entiteter (K-3).**
FAKTUM: der findes INGEN leverandør-/gruppe-objekt i kodebasen i dag (recon: ingen lokations-flade overhovedet) — intet skal flettes/migreres uanset udfald. Én entitet: master-data-omkostningen × 1 (tabel + RLS/policies/grants + audit + klassifikation + evt. permanent-allowlist + permission-page/tab/grants-seed + read/write-RPC'er + SECDEF_SANCTIONED-entries + advisor-baseline + types-regen); §1.12's "leverandør-FK" på lokationen peger på gruppen; type-feltet bor der. To entiteter: samme liste × 2 + FK mellem dem + stillingtagen til hvilken der bærer klient-kobling hhv. kontakt-persondata + to permission-sider. Ordbogen har allerede mapping-linjen 'gruppe (leverandør)' (`ordbog.md:11+14`) — én-entitets-udfaldet er navnemæssigt forberedt.

**V6 · Mindst én stand ved oprettelse/sletning (K-2).**
Oprettelse: atomisk SECDEF-RPC (lokation+stand i én tx — formen `71cadac3:235-246`); ingen deferrable-constraint-precedens i fladen (grep: 0 hits) ⇒ DB-deklarativ håndhævelse ville være ny form uden forbillede; RPC-vejen er tæt fordi 408a96ff har lukket alle andre skriveveje. Sletning: stande kan ikke slettes (ingen delete-grant/policy; M-14 siger består) — invarianten reduceres til en deaktiverings-guard HVIS stande får eget aktiv-flag ("sidste aktive stand kan ikke deaktiveres" = count-check i set_active-RPC, P0001).

**V7 · Gruppe-arv på stand (K-2/K-3).**
Afledt (stand har ingen gruppe-kolonne; gruppen læses via lokationen): gratis konsistens, ét join i opslag — samme form som §1.12's pris-arv (NULL+arv). Materialiseret (gruppe-FK på stand + sync-håndhævelse): hurtigere opslag men kræver trigger uden forbillede + drift-risiko ved gruppe-skift. Pris-arven er præcedensen for afledt.

**V8 · Effektiv ret klient×lokation: afledes vs materialiseres (K-6) + fravalg gennem nedlæggelse/genåbning.**
Afledt: prædikat-komposition (koblet-på-gruppe ∧ ¬fravalgt ∧ lokation-aktiv) i opslags-RPC/policy — formen findes (date-parametriserede helpers + policy `7e490d5f:667-683`; helper-komposition `776b884b:74-85`). K-6 ac 7's HISTORISKE svar kræver da at ALLE tre input er daterede — dvs. status-historik (K-4 ac 5-formen) og daterede koblinger/fravalg er forudsætninger. Genåbnings-arv (M-19) er gratis (retten genopstår når status flipper); fravalg består by-default gennem nedlæggelse (egen række, urørt af status). Materialiseret: derived-tabel m. rebuild — forbilledet `org_node_closure @ 82d21194` er CURRENT-STATE-only (aldrig historisk!) + kræver AUDIT_EXEMPT-entry (`fitness.mjs:130-136`) ⇒ closure-formen alene kan IKKE bære ac 7's historiske opslag; en materialiseret variant skal selv være dateret (ny form) eller kombineres med afledt historik. Nedlæggelse i materialiseret model = cascade-luk pr. dato (team_close-formen); fravalgs-rydning ved nedlæggelse ville være et AKTIVT valg i handleren (ellers består de).

**V9 · Dvale-status og hvile-mekanisme: én eller to model-ting (K-4/K-5).**
Én ting (hvile = status 'dvale', evt. m. planlagt ophørs-dato på status-rækken): én sandhed, r7d-ren, K-4 ac 5-opslaget svarer alene; auto-hvile (trin 24) sætter status via samme dedikerede handling (cron-audit-årsag auto-genereres, `a7ec4884:122-127`); stop-før-tid = status-skift m. årsag. To ting (status + separat hvile-vindue): hver "kan bookes"-læser skal komponere BEGGE — r7d-klassens dual-sandheds-fælde (`97282fac` + fitness-scan) gælder analogt; opslaget skal stadig svare entydigt pr. dato (K-4 ac 5 + K-5 ac 1 forbruges af samme booking-gate). Fakta-vægt: én-tings-modellen genbruger K-4's maskineri 1:1; to-tings-modellen tilføjer et vindue-objekt uden eksisterende forbillede.

**V10 · Fortrydelses-wiring: ændrings-typer + undo-defaults (K-6/K-8) og direkte-vs-godkendelse pr. handlings-type.**
Pr. ny change_type: de FIRE udvidelsespunkter (K-6 faldgrube 1) + undo_settings-seed (24t-mønstret `f49e7d5b:222-230`; defensiv fallback 24t `c3b2865c:205-208`; CHECK 0..30 dage :99-100; 0 sek = fortrydelses-frit). Direkte handling = t10-formen (`bb9ee808`: permission+årsag+audit, straks-virkning); dateret/godkendt handling = wrapper+pending-formen (`713960b8`); skærpet godkendelse pr. handling = permission_actions m. 2.-godkender (`5a09930f`+`2793702c`). ALLE tre mekanik-niveauer er fuldt understøttet — valget pr. handlings-type er rent deklarativt inden for rammen. K-5 ac 3's straks-virkning (bekræftelses-linje) matcher den direkte form; siger Mathias stop, er pending-formen drop-in (samme gate-rækkefølge).

**V11 · Valuta/enhed + tom-pris-gyldighed (K-1/K-2).**
Precedens: `numeric(12,2)` på ALLE beløb (`b0491013:17` m.fl.; c4-skabelonens deklaration); ingen valuta-kolonne findes i hele fladen (implicit DKK) — valuta-felt ville være ny form uden forbillede. Tom pris: K-2 ac 2 kræver altid-entydig opløsning ⇒ stand-NULL+lokation-NULL må enten være strukturelt umulig (NOT NULL på lokations-dagspris — giver altid svar) eller en defineret "ingen pris"-tilstand som forbrugerne (trin 24/29) skal kunne læse. Fakta-vægt: NOT NULL på lokation + NULL-arv på stand er den eneste variant der opfylder ac 2 uden tre-tilstands-semantik.

**V12 · Seeding ud over superadmin (K-8).**
Præcedens: m1-scopet var EKSPLICIT kun superadmin (`1d74e04f:11-13`); t10 seedede ligeså kun superadmin-grants (`fcf49401:41-56`). Øvrige tildelinger er UI-drift via grant-RPC'erne (findes). Ingen teknisk omkostning ved flere seeds, men det ville bryde det etablerede skel leverance/drift.

**V13 · Gruppe tages ud af brug (K-3 ac 5-mekanik).**
Formen: is_active-toggle-RPC (`bb9ee808:72-97`) + guard i lokations-oprettelse/gruppe-skift mod inaktiv gruppe (aktiv-check-formen `713960b8:72-81` m. admin-bypass-grænsen fra `b0cff39e`). FK RESTRICT + ingen delete-policy + revoke bærer "kan ikke slettes" i tre lag.

---

## 3. Usikkerheder (HALT-flag — ikke oprundet til fund)

1. **Live PostgREST-eksponering** (arvet fra recon-1, uændret): repo viser kun lokal `api.schemas`; den live-eksponerede liste dokumenteres af `types-gen.sh:15` og verificeres af fitness live-check (fail-closed) — kan ikke afgøres statisk. Ramme, ingen krav-konsekvens; nævnes fordi K-9's REST-kaldbarhed hviler på den.
2. **`20260520000000_t9_supplement.sql:161-656` (backdate-guards i `_apply_employee_place`/`_apply_org_node_upsert`)**: fortsat IKKE linjelæst i fuld dybde i denne runde (kun struktur + senere overskrivende bodies). Materialitet LAV for pakken: klient-koblings-vejens NUVÆRENDE bodies (`b0cff39e:18-107`, team_close-cascaden :111ff + `20260520:640-656`) ER linjelæst, og det er dem der er K-4/K-6-forbilleder. Konsolidering må ikke regne de to employee/org-handlere som verificeret dybde herfra.
3. **jsonb_field_mapping_snapshot-konflationen** (`6083fecd:112-118`): jeg kan forudsige adfærden præcist (jsonb-strategier ignoreres i apply; kolonne-snapshot skrives i jsonb-snapshot-feltet) og navngive mutationen der ville bryde den — men om konflationen er BEVIDST midlertidig (jsonb-vejen ikke taget i brug endnu) eller latent fejl kan ikke afgøres statisk. Konsekvens for planner: V2's jsonb-udfald må ikke vælges uden at disponere dette punkt eksplicit.
4. **q1-RPC'ens body** (`776b884b` efter linje 148): adfærden (42501/22023/session-var/gate-rækkefølge) er recon-1-verificeret (samme blob); i denne runde linjelæste jeg :29-146 (tabel+helper+refactors). Deklareret som arv-genbrug, ikke ny linjelæsning.
5. **m1_permission_matrix-scannerens mekanik** (`53d3a3dc`): at den scanner has_permission-kaldesteder og kræver superadmin-dækning er recon-1-verificeret adfærd; selve parser-logikken er ikke re-linjelæst her. Materialitet: kun K-8 ac 5-testvejens præcise fejltilstand.
6. **Break-glass-fladen**: fortsat uden for pakke-fladen (flade_filter + M-27b "nej" — reglen absolut). Ingen ny usikkerhed; flaget videreføres kun så koblingen ikke tabes hvis en fremtidig override-vej alligevel rejses.
7. **Ordbogs-binding**: tabel-/kolonne-/enum-navne for stand/gruppe/dvale/nedlagt er bundet af ordbogs-reglen (Mathias' ord arves eller mappes eksplicit — `ordbog.md:3-6`); en navne-afvigelse uden entry er plan-gate-FAIL. Ikke en kode-usikkerhed, men en bindende ramme planen skal bære synligt.

---

# AKTØR: recon-Codex

# Recon-2 candidate — lokations-skabelon

Aktør: recon-Codex. Modus: Fase 3, krav-drevet dybde. Leverance: plan-substrat; ingen buildability-dom, planbeslutning eller runtime-attest.

`commit_sha = 03ac5e18db57588e9930e337193d33e49d17d087`

Verificeret med `git rev-parse`: HEAD matcher pin; krav = `9402164d87a35fb939661058bea77c1a052493d0`; recon-1 = `7fbd3a2f43c03ce239aa81e20483326bf438463c`; recon-2-bilag = `6e569779353ea1d0a2bf747ce6eda6509de1aea0`. INSTRUKS.md læst først, dernæst scripts/v5/roller/recon-codex.md. Kun workdir-kilder; ingen web/netværk, eksterne workdirs, databaseændringer eller nye agenter.

Evidensnotation: `[E…]` er en entydig fremmednøgle til evidensregistret nedenfor: `path + line_span + blob_oid`, alle under commit_sha ovenfor. Registerets `flade_punkt` er den fælles kilde-nøgle, ikke mit fund-id. `fund_id` identificerer dybdebidraget; samme kilde kan bære flere K. Fysiske kodepunkter er altid bøtte `nuværende-kode`; åbne forretningsvalg er særskilt bøtte `intet-data`. Testveje og mutationer er kandidater til efterprøvning, ikke udførte tests. Ordet **kræver** under konsekvens beskriver arbejde for at opfylde det bundne krav, ikke allerede eksisterende kode.

## Arv og kildepræcedens

`fund_id: R2-D0; bøtte: dokument`. Kravet er autoriteten. Det har allerede fastlagt tre statusværdier, genåbning, gruppe-kobling, mindst én stand, ingen under-stande, ingen hvile-omgåelse og K-5's direkte konfigurationsændring. Disse genåbnes ikke med recon-1's ældre intet-data-spørgsmål. Booking, automatisk hvileudløsning, rabataftaler og formularer er udtrykkeligt nedstrøms. [E001] [E002]

Recon-1 og mutationsbilaget bruges som spor til originalkode, ikke som erstatning for den. Især bilagets påstande om nødvendige authenticated-DML-grants (L87), service-role-only og RLS/FORCE skal læses i den senere migrationskæde. Juni-revoken fjerner direkte app-writes; postgres/BYPASSRLS-SECDEF er ikke beskyttet af FORCE RLS. En policy-mutation alene er derfor ikke et bevist brud på den nuværende adgangsvej. [E003] [E004] [E005] [E006]

R2→r3's synlige valg om type, nedlagt-fravalg og JSONB videreføres; r4 gør fast/UI-udvidelig feltliste til et reelt planvalg. R3's tidligere udsagn om obligatorisk UI-udvideligt registry er således ikke en ekstra binding. R4b er evidens-trim, ikke fjernelse af kodearbejdet. P4's kritik gælder den ældre b9c5249b-kravblob; den endelige 9402164d-tekst er læst direkte. Ordbogens “nedlagt = slut-tilstand” må ikke trumfe kravets genåbning. [E007] [E008] [E009] [E010] [E011] [E012] [E013] [E014] [E015]

## Bøtte 1 — nuværende-kode, dybde pr. K

### K-1 — central lokation, type og historisk dagspris

`fund_id: R2-K1; bøtte: nuværende-kode; krav_ref: K-1/ac1-5; flade_punkter: evidensregistrenes kilde-nøgler`.

**Mønster-forbillede.** T10 `clients` giver stabil UUID, `name NOT NULL CHECK(length(trim(name))>0)`, audit, updated_at og separate read/write-flader. `client_upsert` kontrollerer permission → årsag → navn, før transaktionslokale audit/write-vars sættes; INSERT returnerer UUID, UPDATE af ukendt id rejser P0002. Dette er det konkrete masterdata-/RPC-mønster. Navnet er ikke UNIQUE; navne-entydighed er ikke et lokationskrav. [E016] [E017]

Prisens gyldighed kræver et andet forbillede: T9 adskiller stabil `org_nodes.id` fra versionernes mutable data. Versionen har `[effective_from,effective_to)`, FK til identitet, CHECK for positiv intervallængde, partial UNIQUE for én åben version og GiST EXCLUDE mod overlap. `_apply_org_node_upsert` finder versionen på ændringsdatoen og kan splitte den; read_at anvender samme halvåbne interval. [E018] [E019] [E020]

**Bindende constraints/konsekvens.** K-1's fem typeværdier skal håndhæves i den autoritative skrivevej/struktur, også når input sendes uden UI. Enum/CHECK-mønstret findes i T9, men den eksisterende liste department/team er ikke en lokationstype. Lokationens gruppe-FK og første stand er oprettelsesafhængigheder til K-2/K-3. Gruppefri eller standfri “kladde-lokation” er ikke en undtagelse i kravet. Core_identity er hjemstedet; core_money's pricing/booking er forbrugere. [E021] [E022] [E023]

**Test-vej.** T10 lifecycle-testens opret→læs→ændr→genlæs er et faktisk RPC-forløb. T9 historiktesten måler bevarede intervaller ved split og efterfølgende version. For K-1: (ac1) NULL/blankt navn afvises; (ac2) hver af fem typer accepteres, ukendt type afvises; (ac3) gem pris P1 på D1, ændr til P2 på D2, genlæs D1/D2 og en stands arvede pris på begge datoer; (ac4) schema-/RPC-diff må ikke introducere attributions-/provisionsrelation til lokation; (ac5) samme operationer gennem authenticated indgange. Prisformatets NULL/0/grænseprøver skal følge P08 nedenfor. [E024] [E025]

**Faldgruber og brydende mutation.** En aktuel `price` med audit er ikke automatisk et entydigt forretningsopslag pr. dato. T9's exact-start-gren UPDATE'r allerede eksisterende forretningsfelter, og pre-history-grenen kan indsætte tilbage i tiden; det beviser ikke uforanderlig fortid for K-1. Audit-triggeren søger feltet `id`, ikke `version_id`, så T9-versioners record_id bliver NULL; versionens identitet må da spores i old/new_values, ikke med et opdigtet UUID-record_id-opslag. Mutation: byt parent-pris-på-D med parentens pris nu; den historiske standsprisprøve skal skifte fra grøn til rød. [E026] [E027]

### K-2 — lokation ejer mindst én stand; standen er blad

`fund_id: R2-K2; bøtte: nuværende-kode; krav_ref: K-2/ac1-6`.

**Mønster-forbillede.** Den dokumentbundne form er lokation og stand i samme tabel med `parent_location_id`. T9 har selvreference-CHECK, FK ON DELETE RESTRICT og `_org_node_cycle_check`: en besøgt UUID-liste, traversal af parent på NEW.effective_from, afvisning ved gentaget id eller dybde 100. Den seneste bladkontrol er supplementets **tovejs intervalkontrol**: både barn ind under en eksisterende team-version og omtypning af en parent til team med eksisterende børn afvises ved intervaloverlap. Det er et præcist forbillede for “stand må ikke have under-stande”. [E028] [E029] [E030] [E031]

**Bindende constraints/konsekvens.** FK sikrer parentens eksistens, ikke dens art eller at parenten har mindst ét barn. K-2 kræver både top/stand-art og ejerkæde; vilkårlig T9-afdelingsdybde er ikke tilladt. Seneste T9-bladkontrol dækker hele intervallet; cykelkontrollen undersøger derimod kun startdatoen. Hvis planen versionerer relationer, må et senere interval ikke kunne skabe en ulovlig struktur. Ingen eksisterende minimum-barn-kontrol er identificeret i dette forbillede. Pending-rækkens `FOR UPDATE` låser kun den ene request; det serialiserer ikke to requests der fjerner hver sin stand fra samme lokation. Minimumskravets transaktions-/konkurrensværn skal bygges og bevises særskilt. [E032] [E033] [E034] [E035]

**Test-vej.** `t9_org_nodes.sql` skaber en root→department→root-cyklus og et barn under et team og kræver P0001. Overfør det negative mønster til K-2/ac1+6: selvreference, længere cyklus, stand under stand, manglende/ukendt parent, manglende gruppe, oprettelse uden første stand, fjernelse/flytning af sidste stand. Test også ændring af en parent der allerede har børn. Minimumsstanden kræver en særskilt prøve med to samtidige transaktioner og kontrolleret rækkefølge; den eksisterende SQL-runner sender én query ad gangen og er ikke sådan et bevis. [E036] [E037] [E038]

Ac2: egen pris vinder, ellers lokationens pris **på samme dato**; nul må ikke forveksles med “ikke sat”. Ac3: standen bruger top-lokationens aktiv-opslag. Ac5: opret flere stande, nedlæg og genåbn top, sammenlign de samme stand-ID'er/antal og historik. Ac4: bevis stabil stand-identitet og lokationsrelation her; samtidig dobbeltbooking afvises først i trin 24. [E039] [E040]

**Faldgruber og brydende mutation.** Kopi af T9's bladkontrol med kun startdato mister overlapkontrollen; FK ON DELETE CASCADE mister bevaring. “Klientplacering” i T9 betyder klient→org-team, ikke en fysisk stand. Dens UNIQUE pr. klient er ingen kapacitetsregel for stande. Mutation: fjern kontrollen i den modsatte retning (omtyp parent med børn); negativet skal stadig ramme et reelt afvist input. [E041] [E042]

### K-3 — navngiven gruppe, ejerreference og klientarv

`fund_id: R2-K3; bøtte: nuværende-kode; krav_ref: K-3/ac1-6`.

**Mønster-forbillede.** T10's navngivne UUID-master og to særskilte RPC'er for stamdata og aktiv/inaktiv er den nærmeste entitetsform. `client_node_placements_client_id_fkey` giver det faktiske klient-FK-mål: `core_identity.clients(id) ON DELETE RESTRICT`. T9's referencestruktur viser RESTRICT for masterrelationer; en tilstedeværende historisk reference tæller også, FK'en filtrerer ikke på “aktiv”. [E043] [E044] [E045] [E021]

**Bindende constraints/konsekvens.** Gruppe er en ny navngivet master, ikke et eksisterende org-team eller `clients`-rækken. Lokation→gruppe kræver reference frem for gruppenavn i fields. Gruppe→klient har entydighed på **parret**; T9's UNIQUE/EXCLUDE kun på client_id ville forbyde klientens tilhør til flere grupper uden belæg. En gruppes type er rabat-anker, ikke lokationens butik/messe-type. K-3's fulde arv til også senere lokationer kræver enten datoafledning over ejerrelationen eller vedligeholdelse ved alle berørte hændelser; nuværende klient→team-placement leverer ikke denne arv. [E046] [E047]

**Test-vej.** Masterdata-RPC-forløbet fra T10 kombineres med FK/interval-fixtures fra T9. K-3/ac1-3: manglende gruppe, ikke-eksisterende gruppe, fritekst i referenceinput og blankt gruppenavn afvises. Ac4+6: G har C1/C2 og L1/L2; opret L3 efter koblingen; begge klienter arver L1/L2/L3. Fravælg C1 på L1: kun den ret forsvinder; ophæv: den vender tilbage. C3 uden G-kobling kan ikke tilvælges. Ac5: slet G med tilknyttet L1 — afvist og alle identiteter bevaret. Kør også med nul klienter på G/L uden at slette masterrækker. [E024] [E048] [E049]

**Faldgruber og brydende mutation.** T10-feltregistret kræver pii_level som parameter og har hverken retention-felter eller databasevalidering af `field_type`/`required` mod værdier. Dets eksistens afgør ikke valget fast/UI-udvideligt. `client_set_active` leverer kun et aktivflag, ingen gruppe-udfasningssemantik. Mutation: materialisér klientrettigheder kun ved gruppe-kobling; L3-prøven bliver rød. Mutation: byt RESTRICT til CASCADE; sletningsprøven skal vise det tabte ejerskab/historik. [E050] [E051] [E052] [E053]

### K-4 — aktiv, dvale, nedlagt; dedikeret statusvej og genåbning

`fund_id: R2-K4; bøtte: nuværende-kode; krav_ref: K-4/ac1-9`.

**Mønster-forbillede.** T10 upsert ignorerer is_active i UPDATE; kun `client_set_active` toggler det med permission og årsag. T9 version/opslag giver datodelen. Seneste `_apply_team_close` demonstrerer en statusændring og efterfølgende lukning af tilknytninger i samme funktion; der er både split og exact-start-grene. [E054] [E029] [E020] [E055]

**Bindende constraints/konsekvens.** Enum er præcis aktiv/dvale/nedlagt, og ingen stamdataindgang må skrive status uden den dedikerede handling. Nedlagt er reversibel. Status, effektiv klientret og bevaring af stande skal være konsistente i samme synlige tilstand. Dvale tillader klienthandlinger og bevarer koblinger; nedlagt afskærer effektive rettigheder og lokalt tilvalg. Genåbning bruger gruppens **da gældende** klientmængde, ikke en kopi fra nedlæggelsen. K-6/P05 afgør lokale fravalgs overlevelse. [E056] [E057]

**Test-vej.** T10-testens “deaktiver→omdøb med aktiv-default→stadig inaktiv→genaktiver” er forbilledet for afvisning af statusændring gennem upsert. T9 placement-testen kontrollerer både status og de lukkede tilknytninger efter team_close. For K-4/ac1-4: ugyldig status, NULL/blank årsag, almindelig upsert med skjult status og historik-DML afvises; hvert lovligt skift efterlader årsag/audit. Ac5-9: datoer før/under/efter dvale; lovligt lokalt til-/fravalg i dvale; nedlæg→afvist lokalt tilvalg→ændr gruppens klienter→genåbn; kontroller historisk ret, aktuelle klienter og uændrede stand-ID'er. [E058] [E059]

**Faldgruber og brydende mutation.** Team_close sletter placements ved exact-start; det er ikke et 1:1-forbillede for K-4's bevarede koblingshistorik. T9/T10's seneste klient-apply har superadmin-bypass for inaktivt team/klient. K-4/K-5's absolutte lokationsforbud kan ikke arve det. Statuscheck kun ved request er utilstrækkeligt: senere apply kan møde nedlagt lokation; den seneste klient-handler viser genvalidering før mutation, men dens bypass er domænespecifik. Mutation: udskift “ikke nedlagt” med “aktiv” i klienthandlingens guard — dvale-positivet skal fejle. Mutation: fjern genvalidering ved apply — request→nedlæg→apply-negativet skal fejle. [E060] [E061] [E062]

### K-5 — valgte hviledage, faktisk hvile og stop-handling

`fund_id: R2-K5; bøtte: nuværende-kode; krav_ref: K-5/ac1-5`.

**Mønster-forbillede.** `employee_active_config_update` viser direkte permission-gated konfigurering: check permission, check årsag, check antal, sæt audit/write-vars, UPDATE RETURNING. Den passer som kontrolflow til K-5/ac3's straks-virkning. Tabellen har et integer-dagefelt med CHECK, men er en singleton; lokationskravet er **pr. lokation**, og default er intet valgt. Kopi af singleton id=1 eller default 0 er derfor ikke samme forretningsmodel. [E063] [E064] [E065]

**Bindende constraints/konsekvens.** Konfigurationsværdi og faktisk hvileperiode er to forskellige oplysninger, uanset om planen samler dem i én statusmodel. Et antal dage skaber ikke i sig selv dokumentation for hvileperiodens start/slut. Bookbarhedsopslaget afskærer hvile for alle klienter; ingen bypass-parameter eller superadmin-undtagelse følger af fælles permissions. Stop før tid er en synlig, auditeret handling med årsag. Automatisk kampagne-slut-trigger er ikke bygget eller bevist her. [E065] [E066]

**Test-vej.** Q1-negativtesten kræver 42501 uden konfigurationsrettighed; T10 statusforløbet giver write→read-kontrol. K-5/ac2-4 kræver en almindelig autoriseret bruger: stop uden ret afvises; med ret ændres den faktiske periode/status og audit viser årsagen; rediger hviledage og genlæs straks uden approval/undo-ventetid. Ac1: to klienter på samme lokation får begge bookbar=false under hvile, også når en autoriseret bruger forsøger en omgåelsesparameter. Ac5: ny lokation uden valg har ingen auto-hvile-konfiguration; sæt og fjern et antal gennem offentlig indgang. “Uden valg” må ikke blive en skjult tidsperiode. Grænser for 0/negativ/brøk/MAX afgøres udtrykkeligt i P11. [E067] [E058]

**Faldgruber og brydende mutation.** Q1-smoketesten læser globalt forventede defaults; den beviser hverken lokal konfigurationsændring eller klientuafhængig hvile. Den nye prøve skal have egen lokationsfixture og kontrollere effekt. En cron er ikke nødvendigvis nødvendig for status ved datoopslag; hvis planen vælger tidsudløb via job, skal den også bære due-gate og heartbeat. Pending-cronens fejlede item bliver i approved og giver partial_failure; den er ikke en generel model for “fejl betyder annulleret”. Mutation: gør hvile-opslaget afhængigt af client_id; to-klient-prøven skal ramme forskellen. [E068] [E069]

### K-6 — klient på gruppe, lokalt fravalg og effektiv ret på dato

`fund_id: R2-K6; bøtte: nuværende-kode; krav_ref: K-6/ac1-10`.

**Mønster-forbillede.** T9 client_node_placements giver daterede intervaller og klient-FK, men **ikke** gruppetilladelsesmodellen. K-6's entydighed skal anvendes på klient×gruppe; fravalg har lokation×klient som sin egen relation. Sammenhængen med den gældende gruppe er et cross-row-vilkår, ikke noget en klient-FK alene kan bevise. [E070] [E045] [E057]

Godkendelseskædens konkrete koblingspunkter:

1. Offentlig wrapper validerer domæne/permission, sætter `t9_write_authorized`, kalder intern `pending_change_request`. Den eksisterende request-funktion tager change_type, target, payload og dato; den lagrer ikke action_id eller en brugerangivet årsag. Trods tabelkommentarens “registered handler” er der ingen change_type-validering i denne funktion. [E071] [E072]
2. `pending_changes.action_id` er senere nullable FK til permission_actions. Actions har additive grants og kode-låste has_undo/requires_second_approver; CHECK forbinder dem. Registryet alene forbinder ikke en ny lokationswrapper med action_id. [E073] [E074] [E075]
3. **Seneste** approve er juni-SECDEF: lås pending; kræv pending-status; whitelist change_type→page **før** action-grenen; permission/above/superadmin-regel; beregn deadline. Ukendt change_type giver 42883 selv med action_id. [E076]
4. **Seneste** undo er samme juni-fil: approved + deadline endnu åben; egen whitelist change_type→page; almindeligt page-can_write-check. Den er ikke action-aware som approve. [E077]
5. **Seneste** apply er T9 client-placement-migrationen: FOR UPDATE på pending, approved, udløbet undo_deadline og effective_from≤current_date, CASE med syv kendte handlers, derefter status=applied. Ukendt handler giver 42883. Payload-datoen læses af handleren, mens due-gaten læser pending.effective_from: nye indgange må ikke skabe to uafhængige datoer. [E078] [E079]
6. Pending SELECT har egne legacy change_type-lister samt en action-gren der afspejler approve-egnethed. Requester/admin kan læse særskilt. Den seneste pending_changes_read returnerer metadata/status/action_id, **ikke payload**. Et godkendelsesflow der skal vise de foreslåede domæneværdier, kræver derfor en læsevej med samme adgangsafgrænsning; den nuværende liste-RPC beviser ikke den del. Cron vælger op til 100 due-rækker, behandler hver i exception-subtransaktion og logger partial_failure. [E080] [E081] [E069]

**Bindende constraints/konsekvens.** Ret(C,L,D) følger kravets tre led: C er på L's gruppe på D; L har ikke fravalgt C på D; L er ikke nedlagt på D. Dvale kan derfor have ret=true og bookbar=false. Ingen max-én-klient-regel på lokationen. Åben kobling skal være lovlig; frakoblingsdato er en historisk boundary, ikke et krævet aftale-slutfelt ved oprettelse. Alle komponenter, også eventuelt dateret ejerforhold, skal læses på samme D. Dateret ændring må ikke effektueres før approval, deadline og dato. [E057] [E082]

**Test-vej.** `t9_pending_changes.sql` har faktiske negativer for intern request-EXECUTE, ukendt change_type, fremtidig deadline/dato og forkert/udløbet undo-status. `t9_backdated_historical_traversal.sql` giver intervalassertions; dato-aware read-policy/read_at giver et særskilt autorisationslag. [E083] [E084] [E025] [E085] [E086]

Acceptmatrix til ny lokationsfixture:

| Ac | Handling/input | Observerbar slut-effekt |
| --- | --- | --- |
| 1-3 | Manglende/ukendte refs; dobbelt C×G; lovlig kobling uden slutdato | De første afvises, den åbne kobling lykkes; to klienter kan fortsat være på samme G |
| 4-5,8 | C1/C2 på G; L1/L2; tilføj senere L3; fravælg C1 kun på L1, ophæv; forsøg C3 uden G | Fuld arv også til L3; kun L1/C1 ændres; C3 tilvalg afvises; C1/C2-ret samtidigt tilladt |
| 6-7 | Frakobl C1 fra G på D2; genlæs D1<D2, D2 og efter D2 | Alle G's lokationer mister retten fra D2, D1-svaret bevares; historik-DML afvises |
| 9 | Dvale; nedlæg L1 på D3; ændr G's klienter; genåbn D4 | Dvale bevarer kobling; ingen effektiv ret under nedlagt; L2/G/stande bevares; D4 arver da gældende G |
| 10 | Request som rettighedshaver; forsøg tidlig apply; approve; undo inden frist; separat due request→apply | Intet effekt før alle gates; undo bevarer effektiv ret; korrekt due apply ændrer præcis den aftalte ret |
| 9-10 | Request→nedlæg/frakobl gruppe→apply; to samtidige requests på samme relation | Domænet genvalideres; ingen dobbeltret eller genaktivering på nedlagt; ingen delvis kaskade |

**Faldgruber og brydende mutation.** `_apply_client_place` exact-start flytter eksisterende node_id; `_apply_client_close` kan DELETE ved exact-start. De er ikke append-only-historikgarantier. Offentlige T9 wrappers har ikke brugersendt årsag, mens K-8 kræver angivet årsag for pakkens mutationer. `has_undo=false` giver deadline=now(); missing undo-setting falder tilbage til 24 timer. Disse defaults må ikke tavst blive K-6-kontrakten. Mutationer: fjern gruppeleddet, fjern statusleddet, brug current_date i ét historikled, eller fjern én due-gate; acceptmatricen giver hver en konkret observation. [E087] [E088] [E089] [E090]

### K-7 — fysisk klassifikation, kontaktfelter, anonymisering og replay

`fund_id: R2-K7; bøtte: nuværende-kode; krav_ref: K-7/ac1-4 + strukturreglen om nedgradering`.

**Mønster-forbillede og bindende constraints.** `data_field_definitions` har UNIQUE(schema,table,column), krævet category/pii_level/purpose og auditerede, rettighedsgatede upsert/delete-indgange. Den senere D1/D2-migration tillader NULL-retention og fjerner legal. Valideringen kræver bl.a. max_days for time_based og event+days_after for event_based. `permanent` kræver den snævre `is_permanent_allowed`-liste; T10 tilføjer klienttabeller, ikke alle kommende core_identity-tabeller. Lokations-/gruppefelter får ikke permanent ved analogi. [E091] [E092] [E093] [E094] [E095] [E096]

Fysisk dækningsgate = migration-gatens parser samler klassifikationstuples fra SQL plus legacy classification.json og afviser genkendte kolonner uden entry i STRICT. Den fastlægger ikke PII/retention-værdier og finder ikke JSONB-nøgler. P2's parserprobe viser også, at dynamisk format-DDL ikke bliver dækket af dette syntaktiske bevis. K-7/ac1 kræver derfor en reel kolonneliste, ikke alene et grønt parserresultat ved dynamisk struktur. [E097] [E098] [E099]

Audit-filteret har to forskellige walkers: fysiske direct-kolonner hashes; kun `core_identity.clients.fields` walkes på feltnøgler. Her medtages inaktive direct-definitioner, og JSON-null bevares uden at nulstille hele auditværdien. Ukendt fysisk kolonne er WARNING/klartekst som default; strict på fysisk container beviser ikke dens indre nøgler. [E100]

**Anonymiseringskæde.** Employee-wrapperens permission+årsag→generic_apply er forbilledet for en offentlig gruppehandling. Seneste generic_apply kræver mapping status=active **og** is_active, eksisterende physical direct-kolonner, ingen stale keys, strategi pr. kolonne og active-strategier. Strategi-registry validerer core_compliance-prefix, eksisterende `(text,text)`-funktion, text-retur og STABLE/IMMUTABLE. Runtime bygger UPDATE mod `id = UUID` og `anonymized_check_column IS NULL`; state-INSERT kræver schema/table/reason/version/snapshot og UNIQUE(entity_type,entity_id). Række og FK-identitet består. [E101] [E102] [E103] [E104]

Mappingens offentlige lifecycle har draft→test_run→tested→approve→approved→activate→active. **Ved senere upsert af samme mapping bevarer UPDATE dog status/is_active**, mens strategier, check-/event-kolonner og interne RPC-targets kan ændres; hver konfigurationsændring tvinges derfor ikke gennem en ny test/godkendelse af den viste kode. Felt-/targetændring efter aktivering skal have sin egen dækningsprøve. [E208] Test_run gennemløber fysiske direct-kolonner og tillader approved/active strategier; selve anonymisering kræver active. **Ingen af de to løkker behandler registry-JSONB-nøgler eller indirect-kolonner.** Kopiering af K-7/ac4 som en kommentar skaber ikke den manglende feltvise dækningsgate. [E105] [E106] [E107]

Replay læser immutable state, slår aktiv mapping op og kalder mappingens `internal_rpc_apply(uuid,jsonb,text)` med **field_mapping_snapshot**. Snapshot fra generic_apply er nested `{kolonne:{strategy,strategy_id}}`; employee-apply forventer flade strateginavne og coalescer ukendt strategi tilbage til oprindelig værdi. Den eksisterende replay-e2e seed'er bevidst legacy-flat snapshot for at isolere G042. Den er dermed ikke bevis for generic-anonymisering→restore→replay med nyproduceret snapshot. Group/JSONB-valget skal bære samme format hele vejen. [E108] [E109] [E110] [E111] [E112]

**Test-vej.** T10-tests afviser key-rename/direct→none og kontrollerer hash på et udfaset kontaktfelt. R7a generic-e2e kontrollerer faktisk ændrede personværdier, anonymized_at og præcis én state-row. Overfør til K-7: (ac1) fjern én fysisk klassifikation → strict gate rød; (ac2) anonymisér kontaktfelter og sammenlign gruppe/lokation/stand-ID'er, relationer og audit; DELETE/TRUNCATE af bevaringspligtige rækker afvises; (ac3) nyt uvalgt felt = pii none, retention NULL uden skjult aktivering; (ac4) udelad strategi for et relevant fysisk/JSONB-personfelt → konkret dækningsafvisning, også efter feltudfasning. Brug derefter **rigtigt produceret** snapshot til restore/replay-prøve og kræv ændrede personværdier, ikke kun et sat timestamp eller errors=0. [E113] [E114] [E115]

**Faldgruber og brydende mutationer.**

- Den generelle classification-upsert kan ændre pii_level, og delete kan fjerne definitionen; T10's direct-nedgraderingsværn gælder kun client_field_definition_upsert. K-7's fysiske felter skal også beskyttes gennem de fælles indgange. Mutation: allow direct→none eller delete/recreate; auditværdiprøven skal afsløre klartekst. [E116] [E117]
- T10-field-registry har ingen retention pr. nøgle; en `fields`-kolonneklassifikation erstatter ikke dette. At anonymisere hele fields som text er heller ikke feltvis bevaring af forretningsdata. [E050] [E118]
- Generic_apply's “intern”-kommentar er ikke et effektivt EXECUTE-revoke: T1 default-granter authenticated, mens P1b kun revoker PUBLIC. Kroppen har ingen brugerpermission-gate. Under samme migrations-ejer består det eksplicitte default-grant; live ACL/ejerforhold er ikke observeret her. For en ny gruppe-mapping er dette en eksisterende adgangskant der skal undersøges/lukkes eller gates eksplicit, ikke et bevist service-only-forbillede. [E119] [E120] [E121]
- Mappingens UNIQUE er `(entity_type,table_schema,table_name)`, mens generic_apply/replay slår op alene på entity_type + aktiv status. State har UNIQUE(entity_type,entity_id). Flere tabeller under samme entity_type giver således ikke automatisk entydig dispatch eller anonymisering af alle historik-/kontaktrækker; et valg med flere tabeller skal specificere identitet og faktisk dækningsvej. Mutation: tilføj et personfelt i en anden tabel uden udførende vej; værdiprøven skal finde det urørte felt. [E209] [E102] [E104] [E109]
- Efter sat anonymized_check_column rammer generic_apply ikke rækken igen, og state-identiteten er unik. Udskiftning/tilføjelse af kontaktdata på samme anonymiserede master er derfor ikke dokumenteret dækket af blot at gentage kaldet; den valgte kontakt-lifecycle skal afprøves med nye personværdier. [E102] [E104]
- Retention-jobbet vælger aktiv mapping med event-kolonne, tager **max(days_after)** blandt tabellens event_based-definitioner og kalder internal_rpc_anonymize; det er ingen generel executor af individuelle JSONB-/time_based-/manual-regler. En ny valgt klassifikation skal have en faktisk udførende vej. [E122]
- Mutation: tilføj is_active-filter i direct-key-walkeren; udfaset kontaktfelt skal blive ubeskyttet i prøven. Mutation: giv replay et snapshotformat modtageren ikke forstår; prøven skal kræve erstatning af værdier og dermed blive rød, selv hvis anonymized_at sættes. [E123] [E124]

### K-8 — rettighedsgrænser, audit, fortrydelse og fitness

`fund_id: R2-K8; bøtte: nuværende-kode; krav_ref: K-8/ac1-5`.

**Mønster-forbillede.** T10's eksplicit gatede SECDEF-write, tom search_path og INVOKER-read er mønstret. Seneste juni-revoke betyder ingen INSERT/UPDATE/DELETE/TRUNCATE for authenticated/anon på eksisterende core-tabeller. Nye tabeller har default-deny, men et nyt eksplicit GRANT som T10's historiske L65 ville genåbne adgangen efter juni-migrationen. App-rollen må ikke kunne skrive, heller ikke hvis den har fået samme UI-permission som superadmin eller selv sætter en write-session-var. [E017] [E125] [E126] [E006]

`has_permission(page,tab,write)` starter med current_employee_id og role_id, prøver tab→page→area→legacy og kræver can_access samt can_write ved write. Den bruger ikke visibility. `has_permission_action` kræver aktiv action, tab-adgang og **direkte** action-can_access-grant; tab-write kræves medmindre bypass_tab_write. Resolver(action)'s fallback er derfor ikke erstatning for handlingsgaten. Gruppens ejerskab er ikke medarbejderens org-subtree; en valgt rækkeafgrænsning skal have en eksplicit kobling og bruge samme regler i SELECT og RPC. [E127] [E128] [E075] [E129] [E085]

Seneste `stork_audit` kræver ikke-blank årsag for manual/unknown; cron/trigger_cascade kan generere den. Source_type kan komme fra session-var. K-8 “angivet årsag” er derfor en indgangsvalidering, ikke noget enhver eksisterende audit-trigger alene beviser. Audit UPDATE/DELETE rejser P0001 med en eksisterende gdpr_retroactive-undtagelse; TRUNCATE rejser altid. Undtagelsen er fundamentets GDPR-vej, ikke en status-/hvile-override. [E130] [E131]

**Bindende fitness- og seed-koblinger.**

| Berørt kontrol | Nuværende mekanik og pakkens konsekvens |
| --- | --- |
| SECDEF_SANCTIONED | Nøgle er fuld identity-signatur, ikke kun navn; nye ikke-trigger SECDEF og nye overloads kræver egne entries. Stale entries er også fejl. [E132] [E133] |
| app-write-revoke-discipline | Effektive INSERT/UPDATE/DELETE/TRUNCATE-rettigheder kontrolleres med has_table_privilege for authenticated/anon/app_*. Exemptionlisten er tom. [E134] |
| Audit-coverage / derived | Nye core-tabeller skal have stork_audit eller en begrundet kode-allowlist-entry. Closure er en navngiven undtagelse, ikke en generel undtagelse for alle afledte tabeller. [E135] [E136] |
| Historik-immutability | IMMUTABLE_GUARDS, TRUNCATE-listen og TX_WRAP_REQUIRED er eksplicitte lister. En ny historiktabel får ikke automatisk guard-/testdækning ved sit navn. [E137] [E138] |
| FK og policy-index | Nye *_id-felter skal have FK/PK eller begrundet exemption; eksisterende polymorfe exceptions gælder navngivne felter. Cross-schema-mål er snævert allowlistet. Policyprædikater kræver ledende btree-indeks eller præcis exemption; GiST-overlap-indekset tæller ikke som btree-dækning. [E139] [E140] |
| is_active/dedup/bootstrap | Kopi af boolean-only registry kan kræve en præcis LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS-entry; den er ikke begrundelse for at ignorere status i dual-column-tabeller. Nye mastertabeller bruger begrundet no-dedup-key eller dedup. Bootstrap/config skal være idempotent og sætte audit-vars. [E141] [E142] |

T10 seed'er pages under org_structure, manage-tabs og superadmin-grants med area-scopede joins. **Faldgrube ved 1:1-kopi:** T10's gamle ON CONFLICT-grantmål har kun area/page/tab; supplement-2 erstatter indekset med area/page/tab/**action**. En ny seed på nuværende schema skal matche det nuværende indeks. Handlinger kræver desuden eksplicit action-dækning, hvis indgangen bruger has_permission_action; et area-grant er ikke tilstrækkeligt i den additive helper. [E143] [E144] [E145]

**Test-vej.** `gov_3b_3b_secdef_revoke.sql` bruger faktisk SET LOCAL ROLE authenticated til 42501 og has_table_privilege til direkte write-grants. T9 read-gates kontrollerer EXECUTE og ingen-data/42501 uden medarbejdermatch; et SQL-kald med kun JWT sat under postgres er ikke et RLS-bevis. For K-8/ac1-5: test alle nye tabeller/RPC-signaturer med anon, authenticated uden grant, view-only, writer/action-holder og superadmin; direkte DML med og uden sat write-var skal afvises; blank årsag afvises; audit har årsag/aktør; audit-DML/TRUNCATE afvises; alle nyseedede tabs/actions er tildelbare. Til eventuel scope-afgrænsning: en sibling-rolle ser ingen fremmede rækker/payloads. [E146] [E147] [E080]

**Brydende mutationer.** Tilføj direkte app-GRANT → privilegie-/DML-prøve rød. Erstat action-helper med resolver-fallback → bruger med kun tab-grant får uberettiget handling. Udelad seed til en ny action → den legitime action-holder mangler adgang. Fjern årsagsvalideringen → blank-årsagsprøve må ramme den offentlige indgang, ikke bare en testfixture der altid sætter global årsag.

### K-9 — hele handlingsfladen kaldbar som UI-bruger

`fund_id: R2-K9; bøtte: nuværende-kode; krav_ref: K-9/ac1-3`.

**Mønster-forbillede.** T10 har opret/rediger/status og get/list/field-definitions-list som separate indgange med eksplicit authenticated EXECUTE og INVOKER-læsning. Den aktuelle K-9-leverance er disse offentlige indgange for lokationsdomænet, ikke formularer. [E148] [E149] [E150]

**Flade der skal kunne gennemløbes.** Gruppe opret/rediger/udfasning efter planvalg, gruppetype-opslag, lokation opret/rediger med første stand, stand opret/rediger/pris, ejer- og prisopslag pr. dato, gruppe-klient til/fra, lokale fravalg/ophævelser, status/dvale/nedlagt/genåbn, valgte hviledage/stop, datoens ret og bookbarhed, felt-/klassifikationsvalg, kontaktanonymisering og de nødvendige mapping-/pending-/undo-opslag. Hvis planen vælger UI-registry, også feltdefinitionernes opret/rediger/udfasning. Ingen brugerflow må afhænge af direkte DML for at forbinde action_id, aktivere en mapping eller angive en årsag. [E151] [E152] [E073] [E106]

**API-/type-constraint.** Lokal config eksponerer kun public/ graphql_public og max_rows=1000. Typegeneratoren erklærer public+core_identity+core_compliance+core_money og bruger linked remote; den er intention, ikke observation af live. Fitness' OpenAPI-canary kræver Accept-Profile=core_identity og fem **T9**-RPC'er; den beviser ikke eksistensen af en ny lokations-RPC. Schema-eksponering og app-DML-revoke er forskellige grænser. [E153] [E154] [E155] [E156]

**Test-vej.** K-9/ac1-2: gennemløb hele den valgte handlingsliste med almindelig authenticated rettighedshaver og læs resultatet tilbage gennem den offentlige flade. En SQL-editor-smoke under postgres alene beviser ikke dette. Ac3: ændr de konfigurerbare værdier/field-definitions/undo-setting og gentag forbudsprøverne for navn, gruppe, hierarki, overlap, årsag og direct-PII-nedgradering. Ugyldige værdier skal afvises, også med superadmin. Lag F har fortsat ansvar for sider/formularer; trin 24 har ansvar for booking-kaldets brug af opslagene. [E147] [E157] [E158] [E159]

**Faldgruber og brydende mutation.** Et get/list uden felter, historik, fravalgsstatus eller pending-status kan gøre write-RPC'en ubrugelig som forretningsflow. Store lister kan afskæres af API-max_rows; sidevisning/detaljeopslag er en fladekontrakt, ikke bevis for mindre datamængde. Mutation: fjern EXECUTE fra én påkrævet indgang eller udelad den fra deploy/schema-cache; kald under authenticated/API skal afvise og få handlingsprøven til at fejle. Typegeneratorens remote-check og OpenAPI-kontrollen er ikke kørt her.

## Bøtte 2 — dokument; fakta pr. plan-fase-valg

`fund_id: R2-PLAN; bøtte: dokument; kilde: kravets planmandat`. Tabellen vælger ikke udfald. Defaults er de ordrette plan-defaults i kravets L181, ikke implementerede defaults. Omkostning angives som berørte kodeled/forpligtelser; ingen opdigtet tidsestimering. [E160]

| Valg | Fakta ved udfald A | Fakta ved udfald B | Fælles binding / afgørende prøve |
| --- | --- | --- | --- |
| **P01 Feltliste fast / UI-udvidelig** (K-3/K-7; default som klienter) | **Fast:** kendte felter kan være deklarerede kolonner med klassifikation og RPC-parametre. Nye strukturelle felter kræver senere migration, men feltværdier og klassifikation skal kunne drives via UI-fladen. Fast feltliste er nu tilladt; ingen tvungen felt-opret-operation. | **UI-udvidelig:** T10-registry+JSONB kræver definition CRUD/udfasning/listing, stabile keys, værdivalidering, feltvis PII/retention, audit-walk, anonymisering og replay. T10 har ingen retention pr. key, field_type er fritekst, required håndhæves ikke i validate_fields. Flere kodeled end blot én JSONB-kolonne. | Krævet navn, ejerkæde og andre forbud kan ikke gøres til UI-fravælgelige required-flags. UI-udvidelighed er ikke det samme valg som lagring. [E161] [E162] [E052] [E163] |
| **P02 Kontaktfelter i kolonner / registry-JSONB** (K-7) | **Kolonner:** fysiske direct-PII-tekstfelter passer i generic_apply's loop og strategi-signatur. Stadig krav om mapping-lifecycle, rettighedsgated wrapper, fuldt replayformat, fælles klassifikationsværn og ingen tab af FK/historik. Indirect eller ikke-teksttyper er ikke automatisk dækket. | **JSONB:** kræver feltvis strategi-/metadataopslag og faktisk JSONB-UPDATE i både normal anonymisering og replay samt udvidet auditfilter. En entity-specifik dispatcher-target eller udvidet generisk body er kodearbejde; blot at registrere et navn skaber ikke funktionen. Mapping-test_run/coverage og retention skal også kende feltnøgler. | Nyproduceret snapshot→restore→replay skal erstatte alle valgte personværdier, inkl. udfasede keys, bevare forretningsfelter/rækker. Fast liste kan også lagres i JSONB; det fjerner ikke JSONB-arbejdet. [E164] [E123] [E165] [E166] |
| **P03 Gruppetype ved oprettelse / før rabatbrug** (K-3) | **Krævet ved oprettelse:** NOT NULL og domænevalidering i opret-rediger-fladen; navngiven gruppe uden type afvises. Ingen ekstra eksisterende type-register-genbrug følger af T10. | **Valgfri ved oprettelse** (kravets default): NULL er reel “ikke valgt”, ikke skjult andet. Gyldighedscheck ved udfyldt type, offentlig senere redigering og et entydigt typeopslag; trin 29 skal kræve type ved rabatbrug. | Typelisten kæde/enkelt-butik/messe-operatør/andet må ikke blandes med lokationstypen. Typefeltet og opslag leveres nu; rabatberegning/forbrugsgate påstås ikke bygget. [E167] [E168] [E169] [E170] |
| **P04 Lokale fravalgs-/frakoblingshandlinger på nedlagt** (K-4/K-6) | **Afvis** (default): statuscheck i request og ved effektuering, konsistent med statusovergang; gruppens generelle frakobling må fortsat fungere, og automatisk lokal frakobling ved nedlæggelse må ikke blokere sig selv. | **Tillad lokal redigering:** giver kun en ændret fravalgs-/historiktilstand; effektiv ret under nedlagt skal stadig være false. Kræver eksplicit semantik for ophævelse, som kan nærme sig det forbudte tilvalg, og for effekten ved genåbning. | Begge skal tillade handlinger i dvale og afvise lokalt tilvalg på nedlagt. Test request før nedlæggelse→apply efter nedlæggelse. Eksisterende active-check+senere apply-check viser to indgange, ikke den nye statusregel. [E071] [E060] [E062] [E169] |
| **P05 Fravalg bevares / nulstilles gennem nedlæggelse** (K-6) | **Bevar:** fravalgshistorikken løber videre; status skjuler rettigheder under nedlagt; genåbning arver den aktuelle gruppe minus stadig gældende fravalg. | **Nulstil:** nedlæggelse/genåbning må etablere en auditeret ophørsboundary for fravalg; gamle fravalg/historiske svar må ikke DELETE's. Genåbning arver den aktuelle gruppe uden tidligere fravalg. | Ret(C,L,D) før nedlæggelse bevares under begge valg. Ny gruppe-kobling mens nedlagt må ikke gøre lokationen åben. T9-close's DELETE ved exact-start er en særskilt faldgrube for B. [E088] [E057] [E169] |
| **P06 Gruppe = leverandør / to entiteter** (K-3) | **Én:** én navngiven master, type og kontaktfelter samt klientkoblinger; lokationens ejer-/leverandørreference peger samme sted. Én lifecycle/klassifikations-/anonymiseringsflade. | **To:** ekstra identitet, relation mellem ejergruppe og leverandør, FK'er, data/permissions/CRUD/historik samt afklaring af cardinalitet og hvilket type/kontakt-opslag trin 29 forbruger. De to navne giver ikke selv kardinaliteten. | Masterplan kræver leverandør-master og FK fra lokation; kravet kræver navngiven ejergruppe og samme type-anker. Ingen af udfaldene kan reducere gruppen til fritekst eller eksisterende org-team. Mapping i ordbogen skal være eksplicit. [E171] [E172] [E047] [E014] |
| **P07 Effektiv klient×lokation-ret afledes / materialiseres** (K-6) | **Afled:** opslag kombinerer dateret gruppe-ejerskab, C×G, lokalt fravalg og status på D. Senere lokationer arver via relationen. Ingen kopier at vedligeholde, men alle historiske led og adgangskontroller er nødvendige i opslaget. | **Materialisér:** mutationer ved gruppe-kobling/frakobling, ny/flyttet lokation, fravalg/ophævelse, nedlæggelse/genåbning skal opdatere afledte rettigheder atomisk. Historiske svar skal kunne genskabes; current-only cache er utilstrækkelig. Nye tabeller kræver audit eller begrundet derived-undtagelse og egne constraints/klassifikation. | Org-closure er et eksisterende **current_date**-snapshot der genbygges efter versionsmutation; dens håndtering og audit-undtagelse er ikke automatisk tilladelseshistorik. Prøv alle hændelser på samme ret-orakel. [E173] [E174] [E175] [E057] |
| **P08 Pris: repræsentation/enhed/valuta og tom pris** (K-1/K-2) | **Decimal:** eksisterende beløbsmønster er numeric(12,2), men i provisionssnapshots, ikke lokationspriser. Genbrug låser skala/range og kræver eksplicit enhed/afrunding; ingen valuta er bevist af typen. **Pris krævet:** oprettelse skal have top-pris; stand kan arve. | **Heltal i mindsteenhed/anden repræsentation:** kræver eksplicit konvertering og samme kontrakt i parent/stand/historik/read API. **Tom top-pris tilladt:** et opslag må svare entydigt “ikke prissat”/planvalgt afvisning; ingen automatisk 0 og ingen fremtidig økonomisemantik opfundet her. | Alle udfald skal bevare historisk pris og entydig arv; 0 og NULL er forskellige input. Native beløbstypen fastlægger ikke dagsprisens forbrug. [E176] [E177] [E178] [E169] |
| **P09 Mindst én stand ved opret/slet/flyt** (K-2) | **Samlet opret-indgang:** atomisk lokation+første stand; fejl i standdelen må rulle oprettelsen tilbage. Fjernelse/flytning kræver kontrol under fælles lokationslås, så flere requests ikke hver ser “én anden stand”. | **Udskudt transaktionskontrol:** midlertidigt manglende barn inde i samme transaktion kan være teknisk mellemtilstand, men commit må ikke lykkes uden stand. Der er ikke fundet et eksisterende deferred/min-barn-forbillede her; dette er en ny guard/test-mekanik, ikke en påstået færdig skabelon. | FK alene beviser kun barn→parent, ikke parent→mindst ét barn. Et permanent standløst udkast er ikke et tredje tilladt udfald. Pending-rækkelås er ikke parent-lås. [E021] [E034] [E035] |
| **P10 Gruppe-arv på stand** (K-2/K-3) | **Afled fra parent:** parent→gruppe er en enkelt autoritativ kæde. Ved datoopslag skal parentens gruppe være den på D. | **Lagring af gruppe på både top og stand:** kræver værn mod mismatch og atomisk/historisk konsistens ved ejerskifte; to hver for sig gyldige FK'er er ikke tilstrækkelige. | Stand er blad, ingen selvstændig omgåelse af lokationens status/tilladelse/hvile. [E021] [E179] [E035] |
| **P11 Dvale og hvile samlet / særskilt** (K-4/K-5) | **Samlet:** statusperiodens datamodel må rumme manuel dvale og hvile med slut samt auditeret tidligt stop; valgt hviledagsantal er separat konfigurationsværdi, også hvis samme række bærer det. | **Særskilt:** statusopslag og hvileintervaller skal give én bookbarhedsbeslutning; stop/slut må ikke lade den anden model fortsat blokere eller utilsigtet genåbne nedlagt. Hver mutationsvej kræver konsistens/årsag. | Default ingen automatisk hvile; antal i dage. Kravet afgør ikke 0 versus intet, maksimum, heltalsvalideringens konkrete udfald eller intradag-granularitet. Planen fastlægger repræsentation/kanter uden at genindføre booking-override. [E180] [E181] [E065] |
| **P12 Gruppe tages ud af brug** (K-3) | **Aktivflag:** T10 set_active er et konkret kontrolflow; giver ingen dato-/arveregel af sig selv. Historik og eksisterende ejerrelationer består. | **Dateret lifecycle/udfasningshændelse:** kræver versionsopslag, dedikeret handling og eventuel pending-wiring. Definition af hvad der afvises ved ny lokation/ny kobling skal fremgå af planen; eksisterende lokationer må ikke forsvinde. | Gruppe med lokationer kan ikke slettes. Ingen automatisk nedlæggelse af alle ejede lokationer følger af T10-forbilledet. [E053] [E029] [E182] [E169] |
| **P13 Seeding ud over superadmin** (K-8) | **Kun krævet superadmin:** seed area/page/tab/action-dækning; andre rollers tildeling sker gennem fælles UI-indgange. | **Yderligere initiale tildelinger:** kræver navngivne roller, mål og idempotente grants; data om ønskede konkrete tildelinger er ikke udledelig af skabelonen. Nye rolle-navne må ikke hardkodes som bypass i RPC'er. | Seed skal matche det nuværende grant-indeks inklusive action_id, og handlingsprøven skal bruge både legitim non-admin og superadmin. [E143] [E144] [E183] |
| **P14 Direkte / approval + undo pr. handling** (K-6/K-8) | **Direkte stamdata:** T10 permission+årsag→mutation; K-5 hviledagsændring læses straks. Ingen skjult pending-ventetid. | **Daterede ændringer:** K-6 kræver approval og undo. Nye change_types skal forbindes til request/action_id, approve, undo, apply, pending-synlighed, undo_settings og faktisk domænehandler. has_undo=true kræver requires_second_approver=true; UI kan ændre second_approver_type, ikke de kode-låste flag. | Undo-sekunder er 0..30 døgn i eksisterende CHECK; manglende række bliver 24 timer i approve. Eksisterende defaults er fakta, ikke automatisk det rigtige produktvalg. Approve er action-aware, undo er page-aware; valgt flow skal prøves med samme rettighedshaver hele vejen. [E184] [E185] [E186] [E187] [E188] [E189] |

## Test- og prover-kontrakt for aftageren

`fund_id: R2-TEST; bøtte: nuværende-kode`.

DB-testkonventionen er SQL med BEGIN/ROLLBACK, syntetiske fixtures, RAISE EXCEPTION ved fejlet assertion og SQLSTATE-specifikke negative kontroller. T9's dokumenterede kontrakt kræver egne UUID-fixtures, fixtureafgrænsede assertions, ingen muterede seed-users og ingen skip ved manglende schema. Ældre tests er funktionsforbilleder, ikke automatisk perfekte fixtures: fx R7a aktiverer eksisterende mappings, og T9 full-flow beskriver rolle-swap. Genbrug de observerbare assertions med egne data. [E190] [E191] [E192]

Runneren `pnpm db:test`/`scripts/run-db-tests.mjs` sender SQL til Supabase Management API og failer ved første fejl. Den kræver netværk/token, skriver ikke proverens JSON-resumé og beviser ikke i sig selv at remote schema matcher build-commit. Dens nul-filer-gren afslutter endda uden fejl. [E193] [E194] [E195]

V5 `runProver` kræver pinned commit og en kommando der skriver friskt `{total,passed,failed,skipped}`; nul tests, skips, fejl eller inkonsistent optælling er rødt. `build-proof` kræver source-ankre genverificeret mod Git og executed/mutant_killed samt mindst én targeted mutant pr. K. Derfor skal SQL-resultater forbindes til et faktisk resultatskrivende harness, bundet databaseschema og kravets virkelige effektpunkter. Et håndskrevet grønt JSON-resumé eller en test af indpakkede stubs er ikke den beskrevne bevisvej. [E196] [E197] [E198]

De lokale veje her er statisk kilde-/OID-/spankontrol. DB-runner, linked typegenerator og fitness' netværkschecks er **ikke kørt**. Især fitness har forskellig skip-adfærd: nyere liveGuard-checks er fail-closed i CI; den ældre OpenAPI-check returnerer skipped ved manglende token. Grøn lokal fitness alene ville ikke bevise live-eksponering. [E199] [E155] [E200]

## Evidensregister

Fælles `commit_sha` for ALLE poster: `03ac5e18db57588e9930e337193d33e49d17d087`. `line_span` er 1-baseret, inklusivt. Alle citerede arbejdsfiler er byte-identiske med deres Git-blob ved pin.

| Evidens-id | path | line_span | blob_oid | flade_punkt |
| --- | --- | --- | --- | --- |
| E001 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [17, 181] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E002 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [394, 426] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E003 | `recon/recon.md` | [438, 558] | `7fbd3a2f43c03ce239aa81e20483326bf438463c` | `oid:7fbd3a2f43c03ce239aa81e20483326bf438463c:recon/recon.md` |
| E004 | `recon/recon-2-bilag.md` | [64, 120] | `6e569779353ea1d0a2bf747ce6eda6509de1aea0` | `oid:6e569779353ea1d0a2bf747ce6eda6509de1aea0:recon/recon-2-bilag.md` |
| E005 | `plan-build/lokations-skabelon/p2-divergens-bilag.md` | [9, 17] | `0f5b64edaa8fa13c645bf6abfe19ff0d2f850370` | `oid:0f5b64edaa8fa13c645bf6abfe19ff0d2f850370:plan-build/lokations-skabelon/p2-divergens-bilag.md` |
| E006 | `supabase/migrations/20260607110004_core_identity_revoke_authenticated_core_writes.sql` | [1, 12] | `408a96ff17ec2460919c678633b85e613036b9eb` | `migration:supabase/migrations/20260607110004_core_identity_revoke_authenticated_core_writes.sql` |
| E007 | `plan-build/lokations-skabelon/buildability-analyse-codex-r2.md` | [71, 87] | `b9584bf19444ef0078f7f8073f34721fd95c06ee` | `oid:b9584bf19444ef0078f7f8073f34721fd95c06ee:plan-build/lokations-skabelon/buildability-analyse-codex-r2.md` |
| E008 | `plan-build/lokations-skabelon/buildability-analyse-code-r2.md` | [103, 113] | `7a21a07ac2a51b11e96cb72f81b45a40115de84b` | `oid:7a21a07ac2a51b11e96cb72f81b45a40115de84b:plan-build/lokations-skabelon/buildability-analyse-code-r2.md` |
| E009 | `plan-build/lokations-skabelon/buildability-analyse-code-r3.md` | [15, 22] | `ea99e54026fdb856822b42e0fcc027089da327f6` | `oid:ea99e54026fdb856822b42e0fcc027089da327f6:plan-build/lokations-skabelon/buildability-analyse-code-r3.md` |
| E010 | `plan-build/lokations-skabelon/buildability-analyse-codex-r4.md` | [10, 25] | `1a8a93803283432100509e2af164ef2d3843417e` | `oid:1a8a93803283432100509e2af164ef2d3843417e:plan-build/lokations-skabelon/buildability-analyse-codex-r4.md` |
| E011 | `plan-build/lokations-skabelon/buildability-analyse-code-r4b.md` | [3, 13] | `212cf94dc5da41d66eaece789a0c267d40eaf891` | `oid:212cf94dc5da41d66eaece789a0c267d40eaf891:plan-build/lokations-skabelon/buildability-analyse-code-r4b.md` |
| E012 | `plan-build/lokations-skabelon/buildability-analyse-codex-r4b.md` | [3, 9] | `395de85943293e8eb15fa601d8b2b14f75751f0f` | `oid:395de85943293e8eb15fa601d8b2b14f75751f0f:plan-build/lokations-skabelon/buildability-analyse-codex-r4b.md` |
| E013 | `plan-build/lokations-skabelon/p4-kildetjek.md` | [46, 55] | `deaedfadf0625262a4b376d0cdb6a34ab9f6c3c9` | `oid:deaedfadf0625262a4b376d0cdb6a34ab9f6c3c9:plan-build/lokations-skabelon/p4-kildetjek.md` |
| E014 | `plan-build/lokations-skabelon/ordbog.md` | [9, 20] | `714f9b80028ad34656d94ccd2bfadb4ceb2e70b6` | `oid:714f9b80028ad34656d94ccd2bfadb4ceb2e70b6:plan-build/lokations-skabelon/ordbog.md` |
| E015 | `plan-build/lokations-skabelon/mathias-ord.md` | [85, 89] | `52b0e73fa472efe3aaf9e3a1c523828bf210d7ca` | `oid:52b0e73fa472efe3aaf9e3a1c523828bf210d7ca:plan-build/lokations-skabelon/mathias-ord.md` |
| E016 | `supabase/migrations/20260521000001_t10_tables.sql` | [24, 82] | `359c0b2301f38499704f8778292b0a6dd3892588` | `migration:supabase/migrations/20260521000001_t10_tables.sql` |
| E017 | `supabase/migrations/20260521000009_t10_client_rpcs.sql` | [17, 69] | `bb9ee808bc6f57d571f975646bbdf62ae0459870` | `migration:supabase/migrations/20260521000009_t10_client_rpcs.sql` |
| E018 | `supabase/migrations/20260518000001_t9_org_nodes.sql` | [25, 83] | `71cadac316a633ed7f58762755b4fd13ed2fe404` | `migration:supabase/migrations/20260518000001_t9_org_nodes.sql` |
| E019 | `supabase/migrations/20260520000000_t9_supplement.sql` | [402, 488] | `7e490d5f302f07767b57cf9c4cfcfa38f216fc79` | `migration:supabase/migrations/20260520000000_t9_supplement.sql` |
| E020 | `supabase/migrations/20260520000000_t9_supplement.sql` | [789, 844] | `7e490d5f302f07767b57cf9c4cfcfa38f216fc79` | `migration:supabase/migrations/20260520000000_t9_supplement.sql` |
| E021 | `supabase/migrations/20260518000001_t9_org_nodes.sql` | [45, 60] | `71cadac316a633ed7f58762755b4fd13ed2fe404` | `migration:supabase/migrations/20260518000001_t9_org_nodes.sql` |
| E022 | `supabase/migrations/20260514120001_t1_schemas_and_defaults.sql` | [18, 41] | `c6fb84d25dcc6e8fc7d0669e1df4bd7a3b501886` | `migration:supabase/migrations/20260514120001_t1_schemas_and_defaults.sql` |
| E023 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [19, 46] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E024 | `supabase/tests/smoke/t10_client_lifecycle.sql` | [38, 94] | `6777522cf9183d21458270af5daa4d7a7992c7d4` | `oid:6777522cf9183d21458270af5daa4d7a7992c7d4:supabase/tests/smoke/t10_client_lifecycle.sql` |
| E025 | `supabase/tests/smoke/t9_backdated_historical_traversal.sql` | [65, 140] | `795542662ef4bf292bd90c1239eb37463ca34e09` | `oid:795542662ef4bf292bd90c1239eb37463ca34e09:supabase/tests/smoke/t9_backdated_historical_traversal.sql` |
| E026 | `supabase/migrations/20260520000000_t9_supplement.sql` | [458, 484] | `7e490d5f302f07767b57cf9c4cfcfa38f216fc79` | `migration:supabase/migrations/20260520000000_t9_supplement.sql` |
| E027 | `supabase/migrations/20260514160000_t1_inline_fix_audit_non_uuid_id.sql` | [70, 105] | `e3cfa9fefc635b2658af2eb7be5dea0d70614975` | `migration:supabase/migrations/20260514160000_t1_inline_fix_audit_non_uuid_id.sql` |
| E028 | `docs/strategi/stork-2-0-master-plan.md` | [611, 634] | `e6c9a715b81b8d9b069f36ae77a798186dabcde1` | `oid:e6c9a715b81b8d9b069f36ae77a798186dabcde1:docs/strategi/stork-2-0-master-plan.md` |
| E029 | `supabase/migrations/20260518000001_t9_org_nodes.sql` | [45, 83] | `71cadac316a633ed7f58762755b4fd13ed2fe404` | `migration:supabase/migrations/20260518000001_t9_org_nodes.sql` |
| E030 | `supabase/migrations/20260518000001_t9_org_nodes.sql` | [105, 152] | `71cadac316a633ed7f58762755b4fd13ed2fe404` | `migration:supabase/migrations/20260518000001_t9_org_nodes.sql` |
| E031 | `supabase/migrations/20260520000000_t9_supplement.sql` | [20, 67] | `7e490d5f302f07767b57cf9c4cfcfa38f216fc79` | `migration:supabase/migrations/20260520000000_t9_supplement.sql` |
| E032 | `supabase/migrations/20260518000001_t9_org_nodes.sql` | [129, 140] | `71cadac316a633ed7f58762755b4fd13ed2fe404` | `migration:supabase/migrations/20260518000001_t9_org_nodes.sql` |
| E033 | `supabase/migrations/20260520000000_t9_supplement.sql` | [34, 59] | `7e490d5f302f07767b57cf9c4cfcfa38f216fc79` | `migration:supabase/migrations/20260520000000_t9_supplement.sql` |
| E034 | `supabase/migrations/20260518000004_t9_client_node_placements.sql` | [162, 165] | `f49e7d5bf248af01d8a67ac2a5f1129ceb462a7a` | `migration:supabase/migrations/20260518000004_t9_client_node_placements.sql` |
| E035 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [35, 48] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E036 | `supabase/tests/smoke/t9_org_nodes.sql` | [63, 117] | `3c0103d78b89adc0710104f5a0c7f7ffa91b8244` | `oid:3c0103d78b89adc0710104f5a0c7f7ffa91b8244:supabase/tests/smoke/t9_org_nodes.sql` |
| E037 | `scripts/run-db-tests.mjs` | [39, 47] | `e767efb8b392a98102f88dd9008d6d6ad6dfb05f` | `oid:e767efb8b392a98102f88dd9008d6d6ad6dfb05f:scripts/run-db-tests.mjs` |
| E038 | `scripts/run-db-tests.mjs` | [84, 109] | `e767efb8b392a98102f88dd9008d6d6ad6dfb05f` | `oid:e767efb8b392a98102f88dd9008d6d6ad6dfb05f:scripts/run-db-tests.mjs` |
| E039 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [40, 48] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E040 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [411, 416] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E041 | `supabase/migrations/20260520000000_t9_supplement.sql` | [20, 59] | `7e490d5f302f07767b57cf9c4cfcfa38f216fc79` | `migration:supabase/migrations/20260520000000_t9_supplement.sql` |
| E042 | `supabase/migrations/20260518000004_t9_client_node_placements.sql` | [13, 38] | `f49e7d5bf248af01d8a67ac2a5f1129ceb462a7a` | `migration:supabase/migrations/20260518000004_t9_client_node_placements.sql` |
| E043 | `supabase/migrations/20260521000001_t10_tables.sql` | [24, 45] | `359c0b2301f38499704f8778292b0a6dd3892588` | `migration:supabase/migrations/20260521000001_t10_tables.sql` |
| E044 | `supabase/migrations/20260521000009_t10_client_rpcs.sql` | [43, 104] | `bb9ee808bc6f57d571f975646bbdf62ae0459870` | `migration:supabase/migrations/20260521000009_t10_client_rpcs.sql` |
| E045 | `supabase/migrations/20260521000007_t10_client_node_placements_fk.sql` | [15, 21] | `81fe5ff76e7759872e307beeba73c282e0011ca9` | `migration:supabase/migrations/20260521000007_t10_client_node_placements_fk.sql` |
| E046 | `supabase/migrations/20260518000004_t9_client_node_placements.sql` | [29, 38] | `f49e7d5bf248af01d8a67ac2a5f1129ceb462a7a` | `migration:supabase/migrations/20260518000004_t9_client_node_placements.sql` |
| E047 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [54, 65] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E048 | `supabase/tests/smoke/t9_placements.sql` | [137, 155] | `242bf5876c29b1164b3a143bb78a9aa76e53e604` | `oid:242bf5876c29b1164b3a143bb78a9aa76e53e604:supabase/tests/smoke/t9_placements.sql` |
| E049 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [59, 65] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E050 | `supabase/migrations/20260521000001_t10_tables.sql` | [90, 104] | `359c0b2301f38499704f8778292b0a6dd3892588` | `migration:supabase/migrations/20260521000001_t10_tables.sql` |
| E051 | `supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql` | [16, 25] | `9d2a0e0470ea0782e8f3bf1583c4680c042e3f68` | `migration:supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql` |
| E052 | `supabase/migrations/20260521000005_t10_clients_validate_fields.sql` | [21, 49] | `82f83e0e32accc3928a2c1536e16e1640ac737ce` | `migration:supabase/migrations/20260521000005_t10_clients_validate_fields.sql` |
| E053 | `supabase/migrations/20260521000009_t10_client_rpcs.sql` | [72, 104] | `bb9ee808bc6f57d571f975646bbdf62ae0459870` | `migration:supabase/migrations/20260521000009_t10_client_rpcs.sql` |
| E054 | `supabase/migrations/20260521000009_t10_client_rpcs.sql` | [29, 104] | `bb9ee808bc6f57d571f975646bbdf62ae0459870` | `migration:supabase/migrations/20260521000009_t10_client_rpcs.sql` |
| E055 | `supabase/migrations/20260521100002_t9_supplement_2_superadmin_bypass.sql` | [143, 231] | `b0cff39e52b6659241862f75741500883d9a5d0a` | `migration:supabase/migrations/20260521100002_t9_supplement_2_superadmin_bypass.sql` |
| E056 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [71, 85] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E057 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [111, 126] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E058 | `supabase/tests/smoke/t10_client_lifecycle.sql` | [62, 94] | `6777522cf9183d21458270af5daa4d7a7992c7d4` | `oid:6777522cf9183d21458270af5daa4d7a7992c7d4:supabase/tests/smoke/t10_client_lifecycle.sql` |
| E059 | `supabase/tests/smoke/t9_placements.sql` | [170, 203] | `242bf5876c29b1164b3a143bb78a9aa76e53e604` | `oid:242bf5876c29b1164b3a143bb78a9aa76e53e604:supabase/tests/smoke/t9_placements.sql` |
| E060 | `supabase/migrations/20260521100002_t9_supplement_2_superadmin_bypass.sql` | [34, 74] | `b0cff39e52b6659241862f75741500883d9a5d0a` | `migration:supabase/migrations/20260521100002_t9_supplement_2_superadmin_bypass.sql` |
| E061 | `supabase/migrations/20260521100002_t9_supplement_2_superadmin_bypass.sql` | [200, 229] | `b0cff39e52b6659241862f75741500883d9a5d0a` | `migration:supabase/migrations/20260521100002_t9_supplement_2_superadmin_bypass.sql` |
| E062 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [82, 85] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E063 | `supabase/migrations/20260514180300_q1_employee_active_config.sql` | [31, 63] | `776b884b09131b7e24058abc5ac5db345c9aa73f` | `migration:supabase/migrations/20260514180300_q1_employee_active_config.sql` |
| E064 | `supabase/migrations/20260514180300_q1_employee_active_config.sql` | [179, 217] | `776b884b09131b7e24058abc5ac5db345c9aa73f` | `migration:supabase/migrations/20260514180300_q1_employee_active_config.sql` |
| E065 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [91, 105] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E066 | `supabase/migrations/20260521100002_t9_supplement_2_superadmin_bypass.sql` | [42, 61] | `b0cff39e52b6659241862f75741500883d9a5d0a` | `migration:supabase/migrations/20260521100002_t9_supplement_2_superadmin_bypass.sql` |
| E067 | `supabase/tests/negative/q1_employee_active_config_update_without_permission.sql` | [1, 15] | `7ea7bfa7008ca4deba387f13a0dc3eb376e75b63` | `oid:7ea7bfa7008ca4deba387f13a0dc3eb376e75b63:supabase/tests/negative/q1_employee_active_config_update_without_permission.sql` |
| E068 | `supabase/tests/smoke/q1_employee_active_config.sql` | [8, 33] | `73b7bd3a1b47c921519c97072238c4f3e01c111d` | `oid:73b7bd3a1b47c921519c97072238c4f3e01c111d:supabase/tests/smoke/q1_employee_active_config.sql` |
| E069 | `supabase/migrations/20260518000000_t9_pending_changes.sql` | [394, 435] | `c3b2865c5b72b5b899454507a1e48a2656dfe540` | `migration:supabase/migrations/20260518000000_t9_pending_changes.sql` |
| E070 | `supabase/migrations/20260518000004_t9_client_node_placements.sql` | [13, 41] | `f49e7d5bf248af01d8a67ac2a5f1129ceb462a7a` | `migration:supabase/migrations/20260518000004_t9_client_node_placements.sql` |
| E071 | `supabase/migrations/20260521000008_t10_client_active_check.sql` | [50, 97] | `713960b8fd276ba65b28315284c9db935f2be46e` | `migration:supabase/migrations/20260521000008_t10_client_active_check.sql` |
| E072 | `supabase/migrations/20260518000000_t9_pending_changes.sql` | [121, 159] | `c3b2865c5b72b5b899454507a1e48a2656dfe540` | `migration:supabase/migrations/20260518000000_t9_pending_changes.sql` |
| E073 | `supabase/migrations/20260521100004_t9_supplement_2_approve_helpers.sql` | [10, 14] | `2793702cfd7be93e5fa624dd76aa49285f1660d0` | `migration:supabase/migrations/20260521100004_t9_supplement_2_approve_helpers.sql` |
| E074 | `supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql` | [13, 37] | `5a09930f323034d28debf3b40e68f950ce6b12cc` | `migration:supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql` |
| E075 | `supabase/migrations/20260521100004_t9_supplement_2_approve_helpers.sql` | [47, 83] | `2793702cfd7be93e5fa624dd76aa49285f1660d0` | `migration:supabase/migrations/20260521100004_t9_supplement_2_approve_helpers.sql` |
| E076 | `supabase/migrations/20260607110001_core_identity_secdef_pending_change.sql` | [8, 120] | `ae336ee67bbb960739d252863e3785d4b2804e40` | `migration:supabase/migrations/20260607110001_core_identity_secdef_pending_change.sql` |
| E077 | `supabase/migrations/20260607110001_core_identity_secdef_pending_change.sql` | [122, 183] | `ae336ee67bbb960739d252863e3785d4b2804e40` | `migration:supabase/migrations/20260607110001_core_identity_secdef_pending_change.sql` |
| E078 | `supabase/migrations/20260518000004_t9_client_node_placements.sql` | [152, 220] | `f49e7d5bf248af01d8a67ac2a5f1129ceb462a7a` | `migration:supabase/migrations/20260518000004_t9_client_node_placements.sql` |
| E079 | `supabase/migrations/20260521100002_t9_supplement_2_superadmin_bypass.sql` | [34, 39] | `b0cff39e52b6659241862f75741500883d9a5d0a` | `migration:supabase/migrations/20260521100002_t9_supplement_2_superadmin_bypass.sql` |
| E080 | `supabase/migrations/20260521100005_t9_supplement_2_pending_changes_select_policy.sql` | [19, 60] | `4df2fca6e873d845c5af1a1ee1f0293b4f943d97` | `migration:supabase/migrations/20260521100005_t9_supplement_2_pending_changes_select_policy.sql` |
| E081 | `supabase/migrations/20260521100008_t9_supplement_2_read_rpcs_action.sql` | [19, 47] | `0b14515695b358fc426a5ac5ff9187302a724688` | `migration:supabase/migrations/20260521100008_t9_supplement_2_read_rpcs_action.sql` |
| E082 | `supabase/migrations/20260518000004_t9_client_node_placements.sql` | [172, 210] | `f49e7d5bf248af01d8a67ac2a5f1129ceb462a7a` | `migration:supabase/migrations/20260518000004_t9_client_node_placements.sql` |
| E083 | `supabase/tests/smoke/t9_pending_changes.sql` | [53, 116] | `982459259a3e4c5a5cb1d81ea41c06080d1b7df0` | `oid:982459259a3e4c5a5cb1d81ea41c06080d1b7df0:supabase/tests/smoke/t9_pending_changes.sql` |
| E084 | `supabase/tests/smoke/t9_pending_changes.sql` | [146, 177] | `982459259a3e4c5a5cb1d81ea41c06080d1b7df0` | `oid:982459259a3e4c5a5cb1d81ea41c06080d1b7df0:supabase/tests/smoke/t9_pending_changes.sql` |
| E085 | `supabase/migrations/20260520000000_t9_supplement.sql` | [667, 680] | `7e490d5f302f07767b57cf9c4cfcfa38f216fc79` | `migration:supabase/migrations/20260520000000_t9_supplement.sql` |
| E086 | `supabase/migrations/20260520000000_t9_supplement.sql` | [903, 952] | `7e490d5f302f07767b57cf9c4cfcfa38f216fc79` | `migration:supabase/migrations/20260520000000_t9_supplement.sql` |
| E087 | `supabase/migrations/20260521100002_t9_supplement_2_superadmin_bypass.sql` | [78, 105] | `b0cff39e52b6659241862f75741500883d9a5d0a` | `migration:supabase/migrations/20260521100002_t9_supplement_2_superadmin_bypass.sql` |
| E088 | `supabase/migrations/20260520000000_t9_supplement.sql` | [357, 398] | `7e490d5f302f07767b57cf9c4cfcfa38f216fc79` | `migration:supabase/migrations/20260520000000_t9_supplement.sql` |
| E089 | `supabase/migrations/20260607110001_core_identity_secdef_pending_change.sql` | [92, 119] | `ae336ee67bbb960739d252863e3785d4b2804e40` | `migration:supabase/migrations/20260607110001_core_identity_secdef_pending_change.sql` |
| E090 | `supabase/migrations/20260518000000_t9_pending_changes.sql` | [135, 149] | `c3b2865c5b72b5b899454507a1e48a2656dfe540` | `migration:supabase/migrations/20260518000000_t9_pending_changes.sql` |
| E091 | `supabase/migrations/20260514120005_t1_data_field_definitions.sql` | [9, 30] | `fb805b56b827f9da26682390bb074d89c60d8858` | `migration:supabase/migrations/20260514120005_t1_data_field_definitions.sql` |
| E092 | `supabase/migrations/20260514190200_q_class_anon_rpcs.sql` | [8, 83] | `b9f976338ddde79ec97538173a617246b23342ff` | `migration:supabase/migrations/20260514190200_q_class_anon_rpcs.sql` |
| E093 | `supabase/migrations/20260514180500_d1_d2_drop_legal_convert_rows.sql` | [27, 59] | `5f93b405b918008ddedb6af936d40a3a9127627d` | `migration:supabase/migrations/20260514180500_d1_d2_drop_legal_convert_rows.sql` |
| E094 | `supabase/migrations/20260514170003_c001_retention_not_null.sql` | [52, 94] | `550119e661e6392ce4c80db66096cab94c24689b` | `migration:supabase/migrations/20260514170003_c001_retention_not_null.sql` |
| E095 | `supabase/migrations/20260514180600_d1c_validate_permanent_classification.sql` | [14, 36] | `a0c4771d1b0a47618c96db1a86b5e7b426f9ec4c` | `migration:supabase/migrations/20260514180600_d1c_validate_permanent_classification.sql` |
| E096 | `supabase/migrations/20260521000002_t10_is_permanent_allowed_extend.sql` | [19, 42] | `bb21196b0b4cd6c6a2a327178c73a33ab3fff203` | `migration:supabase/migrations/20260521000002_t10_is_permanent_allowed_extend.sql` |
| E097 | `scripts/migration-gate.mjs` | [202, 243] | `e79ce6eb985c5994cd320398cb9c23f101db8135` | `oid:e79ce6eb985c5994cd320398cb9c23f101db8135:scripts/migration-gate.mjs` |
| E098 | `.github/workflows/ci.yml` | [98, 107] | `4312d4b59493cd35cad092c17fd9921190747be5` | `oid:4312d4b59493cd35cad092c17fd9921190747be5:.github/workflows/ci.yml` |
| E099 | `plan-build/lokations-skabelon/p2-divergens-bilag.md` | [16, 17] | `0f5b64edaa8fa13c645bf6abfe19ff0d2f850370` | `oid:0f5b64edaa8fa13c645bf6abfe19ff0d2f850370:plan-build/lokations-skabelon/p2-divergens-bilag.md` |
| E100 | `supabase/migrations/20260521000004_t10_audit_filter_values.sql` | [37, 124] | `4eb775c9f77bd90a2c471d2a6413a02f7da84eb4` | `migration:supabase/migrations/20260521000004_t10_audit_filter_values.sql` |
| E101 | `supabase/migrations/20260515110300_p1c_anonymize_employee_wrapper.sql` | [20, 54] | `ca921ccbd40212964ba79ca21db310b271b8719b` | `migration:supabase/migrations/20260515110300_p1c_anonymize_employee_wrapper.sql` |
| E102 | `supabase/migrations/20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql` | [41, 125] | `6083fecd79ff6ba167dd12222144824c02a78d2e` | `migration:supabase/migrations/20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql` |
| E103 | `supabase/migrations/20260515110100_p1a_anonymization_strategies.sql` | [70, 101] | `d69ea57e1c4567f66cda044fcbd794a78a30a604` | `migration:supabase/migrations/20260515110100_p1a_anonymization_strategies.sql` |
| E104 | `supabase/migrations/20260514140000_t6_anonymization_tables.sql` | [76, 125] | `e6206176802a265547c773480ec0b82d7341459c` | `migration:supabase/migrations/20260514140000_t6_anonymization_tables.sql` |
| E105 | `supabase/migrations/20260515120000_p2_anonymization_mapping_lifecycle.sql` | [172, 239] | `ec3d9a0bb5bb188105feba1efdd714ab7b8a448c` | `migration:supabase/migrations/20260515120000_p2_anonymization_mapping_lifecycle.sql` |
| E106 | `supabase/migrations/20260515120000_p2_anonymization_mapping_lifecycle.sql` | [246, 300] | `ec3d9a0bb5bb188105feba1efdd714ab7b8a448c` | `migration:supabase/migrations/20260515120000_p2_anonymization_mapping_lifecycle.sql` |
| E107 | `supabase/migrations/20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql` | [54, 98] | `6083fecd79ff6ba167dd12222144824c02a78d2e` | `migration:supabase/migrations/20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql` |
| E108 | `supabase/migrations/20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql` | [92, 119] | `6083fecd79ff6ba167dd12222144824c02a78d2e` | `migration:supabase/migrations/20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql` |
| E109 | `supabase/migrations/20260515130000_r7a_regprocedure_callable_fix.sql` | [239, 300] | `6f0e1db3eca18a225d66ae627b6872289c3c0e9b` | `migration:supabase/migrations/20260515130000_r7a_regprocedure_callable_fix.sql` |
| E110 | `supabase/migrations/20260514170004_c002_c003_anonymization_dispatcher.sql` | [78, 131] | `c5b47ec57dc86c40a152a6820211e8b11a9c3140` | `migration:supabase/migrations/20260514170004_c002_c003_anonymization_dispatcher.sql` |
| E111 | `supabase/tests/smoke/r7a_replay_anonymization_e2e.sql` | [1, 10] | `ec44d2c9c5dc774afd2438210cbaacdfb110a5da` | `oid:ec44d2c9c5dc774afd2438210cbaacdfb110a5da:supabase/tests/smoke/r7a_replay_anonymization_e2e.sql` |
| E112 | `supabase/tests/smoke/r7a_replay_anonymization_e2e.sql` | [47, 82] | `ec44d2c9c5dc774afd2438210cbaacdfb110a5da` | `oid:ec44d2c9c5dc774afd2438210cbaacdfb110a5da:supabase/tests/smoke/r7a_replay_anonymization_e2e.sql` |
| E113 | `supabase/tests/smoke/t10_client_field_definitions.sql` | [51, 79] | `f94c6d16d1f02477f57b36016f7f74f6ec71f42d` | `oid:f94c6d16d1f02477f57b36016f7f74f6ec71f42d:supabase/tests/smoke/t10_client_field_definitions.sql` |
| E114 | `supabase/tests/smoke/t10_clients_validate_fields.sql` | [91, 128] | `1da0df5f717a49e20926de83976dd64a2b667357` | `oid:1da0df5f717a49e20926de83976dd64a2b667357:supabase/tests/smoke/t10_clients_validate_fields.sql` |
| E115 | `supabase/tests/smoke/r7a_anonymize_generic_apply_e2e.sql` | [58, 79] | `4ec30daeca107c92cb92dd10ea0ccdc2412bef91` | `oid:4ec30daeca107c92cb92dd10ea0ccdc2412bef91:supabase/tests/smoke/r7a_anonymize_generic_apply_e2e.sql` |
| E116 | `supabase/migrations/20260514190200_q_class_anon_rpcs.sql` | [38, 82] | `b9f976338ddde79ec97538173a617246b23342ff` | `migration:supabase/migrations/20260514190200_q_class_anon_rpcs.sql` |
| E117 | `supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql` | [55, 84] | `9d2a0e0470ea0782e8f3bf1583c4680c042e3f68` | `migration:supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql` |
| E118 | `supabase/migrations/20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql` | [85, 102] | `6083fecd79ff6ba167dd12222144824c02a78d2e` | `migration:supabase/migrations/20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql` |
| E119 | `supabase/migrations/20260514120001_t1_schemas_and_defaults.sql` | [37, 41] | `c6fb84d25dcc6e8fc7d0669e1df4bd7a3b501886` | `migration:supabase/migrations/20260514120001_t1_schemas_and_defaults.sql` |
| E120 | `supabase/migrations/20260515110200_p1b_anonymize_generic_apply.sql` | [182, 186] | `f953769574f0a6d265a8213b5798894a20ced779` | `migration:supabase/migrations/20260515110200_p1b_anonymize_generic_apply.sql` |
| E121 | `supabase/migrations/20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql` | [41, 53] | `6083fecd79ff6ba167dd12222144824c02a78d2e` | `migration:supabase/migrations/20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql` |
| E122 | `supabase/migrations/20260515130000_r7a_regprocedure_callable_fix.sql` | [325, 369] | `6f0e1db3eca18a225d66ae627b6872289c3c0e9b` | `migration:supabase/migrations/20260515130000_r7a_regprocedure_callable_fix.sql` |
| E123 | `supabase/migrations/20260521000004_t10_audit_filter_values.sql` | [78, 105] | `4eb775c9f77bd90a2c471d2a6413a02f7da84eb4` | `migration:supabase/migrations/20260521000004_t10_audit_filter_values.sql` |
| E124 | `supabase/migrations/20260514170004_c002_c003_anonymization_dispatcher.sql` | [108, 121] | `c5b47ec57dc86c40a152a6820211e8b11a9c3140` | `migration:supabase/migrations/20260514170004_c002_c003_anonymization_dispatcher.sql` |
| E125 | `supabase/migrations/20260521000012_t10_client_read_rpcs.sql` | [11, 41] | `8bef6e71142e70a1061a75a5595a52a820b19707` | `migration:supabase/migrations/20260521000012_t10_client_read_rpcs.sql` |
| E126 | `supabase/migrations/20260514120001_t1_schemas_and_defaults.sql` | [28, 41] | `c6fb84d25dcc6e8fc7d0669e1df4bd7a3b501886` | `migration:supabase/migrations/20260514120001_t1_schemas_and_defaults.sql` |
| E127 | `supabase/migrations/20260518000010_t9_seed_owners.sql` | [15, 84] | `07ec8a8e600e16493506423b42e42aa7cab9b05f` | `migration:supabase/migrations/20260518000010_t9_seed_owners.sql` |
| E128 | `supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql` | [97, 175] | `5a09930f323034d28debf3b40e68f950ce6b12cc` | `migration:supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql` |
| E129 | `supabase/migrations/20260520000000_t9_supplement.sql` | [79, 115] | `7e490d5f302f07767b57cf9c4cfcfa38f216fc79` | `migration:supabase/migrations/20260520000000_t9_supplement.sql` |
| E130 | `supabase/migrations/20260514160000_t1_inline_fix_audit_non_uuid_id.sql` | [44, 105] | `e3cfa9fefc635b2658af2eb7be5dea0d70614975` | `migration:supabase/migrations/20260514160000_t1_inline_fix_audit_non_uuid_id.sql` |
| E131 | `supabase/migrations/20260514120003_t1_audit_partitioned.sql` | [174, 207] | `a7ec488473128315107d2c1294e5d0a125b7b60d` | `migration:supabase/migrations/20260514120003_t1_audit_partitioned.sql` |
| E132 | `scripts/fitness.mjs` | [1530, 1545] | `d1b4d601ef273e62dbaba42261cc20ba051882c5` | `oid:d1b4d601ef273e62dbaba42261cc20ba051882c5:scripts/fitness.mjs` |
| E133 | `scripts/fitness.mjs` | [1672, 1706] | `d1b4d601ef273e62dbaba42261cc20ba051882c5` | `oid:d1b4d601ef273e62dbaba42261cc20ba051882c5:scripts/fitness.mjs` |
| E134 | `scripts/fitness.mjs` | [1709, 1743] | `d1b4d601ef273e62dbaba42261cc20ba051882c5` | `oid:d1b4d601ef273e62dbaba42261cc20ba051882c5:scripts/fitness.mjs` |
| E135 | `scripts/fitness.mjs` | [120, 139] | `d1b4d601ef273e62dbaba42261cc20ba051882c5` | `oid:d1b4d601ef273e62dbaba42261cc20ba051882c5:scripts/fitness.mjs` |
| E136 | `scripts/fitness.mjs` | [626, 682] | `d1b4d601ef273e62dbaba42261cc20ba051882c5` | `oid:d1b4d601ef273e62dbaba42261cc20ba051882c5:scripts/fitness.mjs` |
| E137 | `scripts/fitness.mjs` | [79, 118] | `d1b4d601ef273e62dbaba42261cc20ba051882c5` | `oid:d1b4d601ef273e62dbaba42261cc20ba051882c5:scripts/fitness.mjs` |
| E138 | `scripts/fitness.mjs` | [1160, 1176] | `d1b4d601ef273e62dbaba42261cc20ba051882c5` | `oid:d1b4d601ef273e62dbaba42261cc20ba051882c5:scripts/fitness.mjs` |
| E139 | `scripts/fitness.mjs` | [1171, 1176] | `d1b4d601ef273e62dbaba42261cc20ba051882c5` | `oid:d1b4d601ef273e62dbaba42261cc20ba051882c5:scripts/fitness.mjs` |
| E140 | `scripts/fitness.mjs` | [1364, 1438] | `d1b4d601ef273e62dbaba42261cc20ba051882c5` | `oid:d1b4d601ef273e62dbaba42261cc20ba051882c5:scripts/fitness.mjs` |
| E141 | `scripts/fitness.mjs` | [16, 18] | `d1b4d601ef273e62dbaba42261cc20ba051882c5` | `oid:d1b4d601ef273e62dbaba42261cc20ba051882c5:scripts/fitness.mjs` |
| E142 | `scripts/fitness.mjs` | [141, 182] | `d1b4d601ef273e62dbaba42261cc20ba051882c5` | `oid:d1b4d601ef273e62dbaba42261cc20ba051882c5:scripts/fitness.mjs` |
| E143 | `supabase/migrations/20260521000006_t10_seed_permissions.sql` | [17, 56] | `fcf49401ff24a3c22905f6f39da5e3db9ae0c41b` | `migration:supabase/migrations/20260521000006_t10_seed_permissions.sql` |
| E144 | `supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql` | [75, 93] | `5a09930f323034d28debf3b40e68f950ce6b12cc` | `migration:supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql` |
| E145 | `supabase/migrations/20260521100004_t9_supplement_2_approve_helpers.sql` | [68, 80] | `2793702cfd7be93e5fa624dd76aa49285f1660d0` | `migration:supabase/migrations/20260521100004_t9_supplement_2_approve_helpers.sql` |
| E146 | `supabase/tests/smoke/gov_3b_3b_secdef_revoke.sql` | [25, 51] | `a2c85a04e40835a0143e17f3ee7704d3ef3db707` | `oid:a2c85a04e40835a0143e17f3ee7704d3ef3db707:supabase/tests/smoke/gov_3b_3b_secdef_revoke.sql` |
| E147 | `supabase/tests/smoke/t9_read_gates.sql` | [27, 94] | `14a96a1d7f810244cc681765eb529564bfd269c9` | `oid:14a96a1d7f810244cc681765eb529564bfd269c9:supabase/tests/smoke/t9_read_gates.sql` |
| E148 | `supabase/migrations/20260521000009_t10_client_rpcs.sql` | [17, 104] | `bb9ee808bc6f57d571f975646bbdf62ae0459870` | `migration:supabase/migrations/20260521000009_t10_client_rpcs.sql` |
| E149 | `supabase/migrations/20260521000012_t10_client_read_rpcs.sql` | [11, 91] | `8bef6e71142e70a1061a75a5595a52a820b19707` | `migration:supabase/migrations/20260521000012_t10_client_read_rpcs.sql` |
| E150 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [165, 175] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E151 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [165, 181] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E152 | `supabase/migrations/20260518000000_t9_pending_changes.sql` | [121, 149] | `c3b2865c5b72b5b899454507a1e48a2656dfe540` | `migration:supabase/migrations/20260518000000_t9_pending_changes.sql` |
| E153 | `supabase/config.toml` | [7, 18] | `011818baf19747943671dbe65dc987a9216574d0` | `config:supabase/config.toml` |
| E154 | `scripts/types-gen.sh` | [13, 49] | `70d52135782e35327a8392e7e5922f322750279c` | `oid:70d52135782e35327a8392e7e5922f322750279c:scripts/types-gen.sh` |
| E155 | `scripts/fitness.mjs` | [1013, 1028] | `d1b4d601ef273e62dbaba42261cc20ba051882c5` | `oid:d1b4d601ef273e62dbaba42261cc20ba051882c5:scripts/fitness.mjs` |
| E156 | `scripts/fitness.mjs` | [1060, 1112] | `d1b4d601ef273e62dbaba42261cc20ba051882c5` | `oid:d1b4d601ef273e62dbaba42261cc20ba051882c5:scripts/fitness.mjs` |
| E157 | `supabase/tests/smoke/gov_3b_3b_secdef_revoke.sql` | [25, 40] | `a2c85a04e40835a0143e17f3ee7704d3ef3db707` | `oid:a2c85a04e40835a0143e17f3ee7704d3ef3db707:supabase/tests/smoke/gov_3b_3b_secdef_revoke.sql` |
| E158 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [170, 175] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E159 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [411, 418] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E160 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [179, 181] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E161 | `supabase/migrations/20260521000001_t10_tables.sql` | [90, 144] | `359c0b2301f38499704f8778292b0a6dd3892588` | `migration:supabase/migrations/20260521000001_t10_tables.sql` |
| E162 | `supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql` | [16, 95] | `9d2a0e0470ea0782e8f3bf1583c4680c042e3f68` | `migration:supabase/migrations/20260521000010_t10_client_field_definition_rpcs.sql` |
| E163 | `plan-build/lokations-skabelon/buildability-analyse-codex-r4.md` | [10, 18] | `1a8a93803283432100509e2af164ef2d3843417e` | `oid:1a8a93803283432100509e2af164ef2d3843417e:plan-build/lokations-skabelon/buildability-analyse-codex-r4.md` |
| E164 | `supabase/migrations/20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql` | [54, 119] | `6083fecd79ff6ba167dd12222144824c02a78d2e` | `migration:supabase/migrations/20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql` |
| E165 | `supabase/migrations/20260515130000_r7a_regprocedure_callable_fix.sql` | [270, 288] | `6f0e1db3eca18a225d66ae627b6872289c3c0e9b` | `migration:supabase/migrations/20260515130000_r7a_regprocedure_callable_fix.sql` |
| E166 | `supabase/migrations/20260515120000_p2_anonymization_mapping_lifecycle.sql` | [198, 237] | `ec3d9a0bb5bb188105feba1efdd714ab7b8a448c` | `migration:supabase/migrations/20260515120000_p2_anonymization_mapping_lifecycle.sql` |
| E167 | `docs/strategi/stork-2-0-master-plan.md` | [631, 634] | `e6c9a715b81b8d9b069f36ae77a798186dabcde1` | `oid:e6c9a715b81b8d9b069f36ae77a798186dabcde1:docs/strategi/stork-2-0-master-plan.md` |
| E168 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [54, 57] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E169 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [181, 181] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E170 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [411, 412] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E171 | `docs/strategi/stork-2-0-master-plan.md` | [613, 634] | `e6c9a715b81b8d9b069f36ae77a798186dabcde1` | `oid:e6c9a715b81b8d9b069f36ae77a798186dabcde1:docs/strategi/stork-2-0-master-plan.md` |
| E172 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [11, 11] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E173 | `supabase/migrations/20260518000002_t9_org_node_closure.sql` | [21, 38] | `82d21194bff5e85fda4311e633f2f1f5de742e6e` | `migration:supabase/migrations/20260518000002_t9_org_node_closure.sql` |
| E174 | `supabase/migrations/20260518000002_t9_org_node_closure.sql` | [43, 104] | `82d21194bff5e85fda4311e633f2f1f5de742e6e` | `migration:supabase/migrations/20260518000002_t9_org_node_closure.sql` |
| E175 | `scripts/fitness.mjs` | [120, 136] | `d1b4d601ef273e62dbaba42261cc20ba051882c5` | `oid:d1b4d601ef273e62dbaba42261cc20ba051882c5:scripts/fitness.mjs` |
| E176 | `supabase/migrations/20260514150001_t7_commission_snapshots.sql` | [12, 24] | `b0491013635f53414f481321d5b2f5eb3c997a42` | `migration:supabase/migrations/20260514150001_t7_commission_snapshots.sql` |
| E177 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [25, 28] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E178 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [42, 42] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E179 | `docs/strategi/stork-2-0-master-plan.md` | [613, 616] | `e6c9a715b81b8d9b069f36ae77a798186dabcde1` | `oid:e6c9a715b81b8d9b069f36ae77a798186dabcde1:docs/strategi/stork-2-0-master-plan.md` |
| E180 | `supabase/migrations/20260514180300_q1_employee_active_config.sql` | [31, 36] | `776b884b09131b7e24058abc5ac5db345c9aa73f` | `migration:supabase/migrations/20260514180300_q1_employee_active_config.sql` |
| E181 | `supabase/migrations/20260514180300_q1_employee_active_config.sql` | [179, 214] | `776b884b09131b7e24058abc5ac5db345c9aa73f` | `migration:supabase/migrations/20260514180300_q1_employee_active_config.sql` |
| E182 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [64, 64] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E183 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [149, 159] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E184 | `supabase/migrations/20260518000000_t9_pending_changes.sql` | [95, 116] | `c3b2865c5b72b5b899454507a1e48a2656dfe540` | `migration:supabase/migrations/20260518000000_t9_pending_changes.sql` |
| E185 | `supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql` | [19, 30] | `5a09930f323034d28debf3b40e68f950ce6b12cc` | `migration:supabase/migrations/20260521100003_t9_supplement_2_permission_actions.sql` |
| E186 | `supabase/migrations/20260607110001_core_identity_secdef_pending_change.sql` | [34, 119] | `ae336ee67bbb960739d252863e3785d4b2804e40` | `migration:supabase/migrations/20260607110001_core_identity_secdef_pending_change.sql` |
| E187 | `supabase/migrations/20260607110001_core_identity_secdef_pending_change.sql` | [154, 181] | `ae336ee67bbb960739d252863e3785d4b2804e40` | `migration:supabase/migrations/20260607110001_core_identity_secdef_pending_change.sql` |
| E188 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [99, 105] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E189 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [126, 126] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E190 | `supabase/tests/README.md` | [7, 24] | `1eaa99bbd35ac08f0394724f204bdd7fe993a6b4` | `oid:1eaa99bbd35ac08f0394724f204bdd7fe993a6b4:supabase/tests/README.md` |
| E191 | `supabase/tests/README.md` | [52, 68] | `1eaa99bbd35ac08f0394724f204bdd7fe993a6b4` | `oid:1eaa99bbd35ac08f0394724f204bdd7fe993a6b4:supabase/tests/README.md` |
| E192 | `supabase/tests/smoke/r7a_anonymize_generic_apply_e2e.sql` | [30, 56] | `4ec30daeca107c92cb92dd10ea0ccdc2412bef91` | `oid:4ec30daeca107c92cb92dd10ea0ccdc2412bef91:supabase/tests/smoke/r7a_anonymize_generic_apply_e2e.sql` |
| E193 | `scripts/run-db-tests.mjs` | [14, 22] | `e767efb8b392a98102f88dd9008d6d6ad6dfb05f` | `oid:e767efb8b392a98102f88dd9008d6d6ad6dfb05f:scripts/run-db-tests.mjs` |
| E194 | `scripts/run-db-tests.mjs` | [39, 75] | `e767efb8b392a98102f88dd9008d6d6ad6dfb05f` | `oid:e767efb8b392a98102f88dd9008d6d6ad6dfb05f:scripts/run-db-tests.mjs` |
| E195 | `scripts/run-db-tests.mjs` | [84, 116] | `e767efb8b392a98102f88dd9008d6d6ad6dfb05f` | `oid:e767efb8b392a98102f88dd9008d6d6ad6dfb05f:scripts/run-db-tests.mjs` |
| E196 | `scripts/v5/prover.mjs` | [30, 91] | `c121b9fc0321d6a87e2dc22dd9d12f7c4c520bd3` | `oid:c121b9fc0321d6a87e2dc22dd9d12f7c4c520bd3:scripts/v5/prover.mjs` |
| E197 | `scripts/v5/build-proof.mjs` | [303, 330] | `09e62f90389bacee59727ce3b469d257e7349a5c` | `oid:09e62f90389bacee59727ce3b469d257e7349a5c:scripts/v5/build-proof.mjs` |
| E198 | `scripts/v5/build-proof.mjs` | [365, 373] | `09e62f90389bacee59727ce3b469d257e7349a5c` | `oid:09e62f90389bacee59727ce3b469d257e7349a5c:scripts/v5/build-proof.mjs` |
| E199 | `scripts/types-gen.sh` | [25, 49] | `70d52135782e35327a8392e7e5922f322750279c` | `oid:70d52135782e35327a8392e7e5922f322750279c:scripts/types-gen.sh` |
| E200 | `scripts/fitness.mjs` | [1249, 1264] | `d1b4d601ef273e62dbaba42261cc20ba051882c5` | `oid:d1b4d601ef273e62dbaba42261cc20ba051882c5:scripts/fitness.mjs` |
| E201 | `scripts/types-gen.sh` | [13, 15] | `70d52135782e35327a8392e7e5922f322750279c` | `oid:70d52135782e35327a8392e7e5922f322750279c:scripts/types-gen.sh` |
| E202 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [134, 143] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E203 | `supabase/migrations/20260515130000_r7a_regprocedure_callable_fix.sql` | [329, 339] | `6f0e1db3eca18a225d66ae627b6872289c3c0e9b` | `migration:supabase/migrations/20260515130000_r7a_regprocedure_callable_fix.sql` |
| E204 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [125, 126] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E205 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [46, 48] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |
| E206 | `supabase/migrations/20260518000001_t9_org_nodes.sql` | [52, 58] | `71cadac316a633ed7f58762755b4fd13ed2fe404` | `migration:supabase/migrations/20260518000001_t9_org_nodes.sql` |
| E207 | `docs/sandhed/krav/lokations-skabelon-krav.md` | [409, 418] | `9402164d87a35fb939661058bea77c1a052493d0` | `oid:9402164d87a35fb939661058bea77c1a052493d0:docs/sandhed/krav/lokations-skabelon-krav.md` |

| E208 | `supabase/migrations/20260515120000_p2_anonymization_mapping_lifecycle.sql` | [109, 166] | `ec3d9a0bb5bb188105feba1efdd714ab7b8a448c` | `migration:supabase/migrations/20260515120000_p2_anonymization_mapping_lifecycle.sql` |
| E209 | `supabase/migrations/20260514140000_t6_anonymization_tables.sql` | [19, 30] | `e6206176802a265547c773480ec0b82d7341459c` | `migration:supabase/migrations/20260514140000_t6_anonymization_tables.sql` |

## Udført kontrol

Kravets OID er genverificeret ved slutkontrollen. Alle 209 evidensposter er kontrolleret mod rå Git: fuldt blob-OID, tilstedeværende sti, gyldigt line_span og byte-identitet mellem de 77 citerede arbejdsfiler og pin. Alle K-1..K-9 har mønster, constraints, test-vej og faldgruber; P01..P14 dækker den deklarerede planliste. Dette er artefakt-/kildekontrol, ikke udført database-, migrations- eller lokations-runtime-test. Krav, kode og arvede dokumenter er uændrede.

## Bøtte 3 — intet-data og HALT-flag

Ingen eksisterende kode er placeret i denne bøtte. Åbne planvalg ovenfor er deklareret af kravet; de er ikke nye kravspørgsmål eller grund til at ændre kravblobben. HALT betyder her “stop den pågældende uunderbyggede slutning før plan/build-bevis”, ikke “recon-leverancen er tilbageholdt”.

| Fund-id / fælles nøgle | Usikkerhed og præcis grænse | Hvad aftageren skal binde |
| --- | --- | --- |
| **R2-H1 / intet-data:deployment-live-state** | **HALT-LIVE.** Den faktiske API-eksponering, funktions-ejere/effective ACL, live policies/triggers og migreret schema er ikke observeret. Det er en intet-data-observation om deployment, mens konfig-/migrationskoden ovenfor forbliver bøtte 1. [E153] [E201] [E156] | Runtime-evidens bundet til deployed schema og build-commit; nye lokationssentinels og authenticated kald, ikke kun T9-canary. |
| **R2-H2 / intet-data:pris-semantik** | **HALT-PLAN.** Valuta, enhed, skala og tom top-pris er bevidst åbne; numeric(12,2) i en anden tabel afgør dem ikke. [E169] [E176] | P08's konkrete kontrakt og grænseprøver. Ingen attributions-/faktureringsregel kan afledes her. |
| **R2-H3 / intet-data:leverandoer-entitetens-fulde-indhold** | **HALT-PLAN.** Gruppe/leverandør-cardinalitet ved to entiteter, kontaktfeltliste/CVR og udfasningens konkrete virkning er ikke bestemt af T10. [E047] [E169] | P01/P02/P06/P12 med konkrete felter/relationer; ingen opdigtet standardleverandør eller juridisk klassifikation. |
| **R2-H4 / intet-data:lokations-pii-og-retention** | **HALT-DÆKNING.** Konkrete feltvalg, indirect-PII-behandling, event for retention og JSONB-feltstrategier er ikke implicitte. Den nuværende generic-/mappingtest dækker kun fysiske direct-kolonner. [E202] [E107] [E203] | Felt→klassifikation→audit→normal anonymisering→snapshot→replay→retention-kæden, inkl. udfasede felter og fælles classification-indgange. Ingen fuld dækning må krediteres før værdierne faktisk erstattes. |
| **R2-H5 / intet-data:klient-tilladelse-kommerciel-betydning** | **HALT-PLAN.** Fravalgets persistens og lokale handlinger mens nedlagt er udtrykkeligt planvalg; default afvisning ved nedlagt gælder handling, ikke gruppefrakobling eller statuskaskadens krævede følge. [E204] [E169] | P04/P05 samt request→statusændring→apply- og genåbningsprøver. Ingen tavs sletning af fravalg. |
| **R2-H6 / intet-data:hierarki-dybde-og-placement-regler** | **HALT-BEVIS.** Mindst én stand er fastlagt; dens concurrency-/commit-guard og tidspunktet for kontrol er ikke leveret af T9-FK/cykel-forbilledet. [E029] [E034] [E205] | P09/P10 med reelt to-sessioners bevis og historisk ejer-/pris-arv. Ingen påstået færdig deferred-trigger. |
| **R2-H7 / intet-data:cooldown-forretnings-semantik** | **HALT-PLAN.** Antal dage og ingen bypass er afgjort; 0/tomt/maksimum, dato versus intradag og samspil mellem manuel dvale og allerede eksisterende hvile skal gøres konkrete. Kravets stop er straks synligt, mens T9 bruger date-intervaller; intradag-historik kan ikke hævdes bevist af date alene. [E065] [E206] | P11 samt dato-/tid-boundaries; udløsning efter kampagne og annulleringsvirkning forbliver trin 24. |
| **R2-H8 / intet-data:permissions-konkrete-tildelinger** | **HALT-PLAN.** Superadmin-dækning er krævet; øvrige initiale tildelinger og eventuel rækkevisibility følger ikke af et gruppe-ejerskab. has_permission læser ikke visibility, og org-subtree læser org-placements. [E127] [E129] [E183] | P13/P14 med role/action/scope-matrix og reelt non-admin-kald. Ingen ny særrettighedsmodel. |

Stop-kanter: ingen ny gennemgang af booking/assignments/hotel/køretøj/fakturering, import eller frontend-komponenter; kravet lægger implementeringen nedstrøms. Core_money er kun læst for den konkrete beløbstype-analogi, ikke gjort til ny attributionsflade. Ingen status/hvile-break-glass, da K-5 forbyder omgåelsen. [E207]
