# p8-kildekontrakt — lokations-skabelon · FA-5 held-out-kildekontrakt (A2-14 → rettet efter A3-1)

Committet af driveren FØR plan-lås (plan §0.1 FA-5 · P-8 §1.1-§1.3 · T:34 · T:42-56 · T:238). Hash-bundet: planen refererer
denne fil ved sti + blob-OID. **Kontrakten har ÉN kilde:** deklarationen i `p8-kilde-gen.mjs` (population · closure · kolonner ·
projektion — læst i `supabase/migrations` @ 79ab859, CREATE TABLE + senere ADD COLUMN; ingen kolonne er antaget). Generatoren
skriver `p8-kilde-scope.sql` (deklaration + mekanisk katalogkontrol), `p8-kilde-katalog.txt` (kanonisk kolonnemængde) og
`p8-kilde.json` (maskinlæsbar form) og indsætter tabellen nedenfor — ret generatoren, aldrig de afledte filer. Ingen credentials
i nogen af filerne; forbindelsen kommer fra CI-runnerens miljø (C4). v1 skrevet 2026-09-10 af driver-10b; **v2 2026-09-16 af
driver mathias-5f** efter Codex' A3-1 (v1 pegede på `public.org_nodes`/`public.employees`, som t1 droppede — koden har dem i
`core_identity`; v1's kolonner på `org_node_versions` var forkerte; closure var ubunden; »hash af SQL-filen« attesterede ikke
resultatmængden; måltargetets bindingstidspunkt var modstridende).

## (1) Systemidentitet for driftskilden — BUNDET

- Art `supabase-postgres` · projekt-ref `imtxvrymaqbgcvsarlib` (repoets `supabase/config.toml`, ikke hemmelig) · host-ref
  `imtxvrymaqbgcvsarlib.supabase.co` · database `postgres`. Kun ÉN eksisterende systemgrænse — ingen ny tenant-grænse
  opfindes (T:44). Kilden er det virkelige system, ikke en kopi. Live-identiteten attesteres af CI ved fetch (C4), ikke her.
- **Adgang (identitet ≠ adgang):** default = dedikeret read-only-rolle mod dette projekt (`p8-kilde.json.adgang`, `skriv: false`;
  rollens navn gives af fabrik-armen i C4, som håndhæver at den ingen write-grants har før fetch). Slutprøven læser eksisterende
  klient-/org-/medarbejderdata og ændrer intet i kilden (P-8 §1.2). Om der i stedet skal seedes et dedikeret held-out-projekt fra
  kilden, er Mathias' bord (data/risiko — TIL-DRIVER 15/9 pkt. 4); defaulten fremlægges som ORIENTERING under `plan ok` (B7):
  siger han stop, seedes et held-out-projekt først — kontrakten er da uændret på nær `adgang`.

## (2) Scope — hele kildens eksisterende population, ingen rækkefilter — BUNDET

Seks populationsrelationer (P-8 §1.2's tabel) + seksten closure-relationer (P-8 §1.2 »Afhængigheder«), alle i skemaerne
`core_identity`/`core_compliance` (public-udgaverne blev droppet i `20260514120000_t1_drop_public.sql`). Udtræksregel pr. relation
= ALLE rækker (også inaktive · lukkede · fremtidige · uden placering/rolle · anonymiserede), ingen top-N, ingen tavs
timeout-afkortning, ingen ad hoc-udvalg af klienter/teams/navne/datoer. `core_identity.org_node_closure` indlæses som OBSERVERET
AFLEDNING og kontrolleres mod `org_node_versions` (T:52) — den erstatter dem ikke. Pakkens egne objekter (lokationer · stande ·
grupper · koblinger · fravalg · deres historik og pending-rækker) er IKKE kilde: de skabes af det byggede produkt under slutprøven
(P-8 §1.1 pkt. 2). Relationerne og deres kolonner står i tabellen under (3).

## (3) Projektion — deklarerede kolonner + navngivne udeladelser med før-build-begrundelse — BUNDET

Alle kolonner i de 22 relationer er deklareret (193 kolonner, `p8-kilde-katalog.txt`). Projektionen er `fuld` medmindre
andet står i klammer: `[tilstede]` kun null/ikke-null · `[tilstede+laengde]` + `octet_length` · `[blank/udfyldt]` kun om tekst er
blank · `[noeglesaet]` jsonb-nøgler sorteret, ingen værdier · `[pr-noegle-klassifikation]` fuld hvis nøglens `pii_level = none` i
`client_field_definitions`, ellers tilstede/blank. Udeladt før build (T:56): logo-binærindhold · medarbejdernes navn/e-mail
(persondata uden nødvendighed for kædens negativer) · klientfelters persondata-værdier · pending-payloads værdier. Auth-hemmeligheder,
password-hashes, tokens og sessions ligger i `auth.*` og er ikke i scope. **Rækker udelades aldrig; en udeladt kolonneværdi tælles
stadig** (»følsom« fjerner ikke en problemrække).

<!-- GEN:tabel -->
| # | art | relation | udtræksregel (alle rækker) | kolonner [projektion ≠ fuld] | begrundelse for projektion ≠ fuld (før build) | DDL-kilde (supabase/migrations) |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | population | `core_identity.clients` | alle rækker, også inaktive og uden org-placering; ingen filtrering på navn, felt-gyldighed, logo, aktualitet eller tidligere testresultat | id, name, fields [pr-noegle-klassifikation], is_active, logo_bytes [tilstede+laengde], logo_content_type, logo_filename, created_at, updated_at | logo_bytes: binærindhold hentes ikke (T:56 — billedfladen er disponeret uden for kravet; tilstedeværelse + længde registreres). fields: nøgler hvis pii_level i client_field_definitions ≠ none (eller nøglen er udefineret) hentes kun som tilstede/blank — persondata der ikke behøves for kædens negativer (T:56); nøgler med pii_level = none hentes fuldt. | `20260521000001_t10_tables.sql:24` |
| 2 | population | `core_identity.org_nodes` | alle identiteter, også lukkede og uden aktuel version eller placering | id, created_at, updated_at | - | `20260518000001_t9_org_nodes.sql:25` |
| 3 | population | `core_identity.org_node_versions` | alle versioner, også lukkede, fremtidige og uden aktuel placering; alle intervalgrænser | version_id, node_id, name, parent_id, node_type, is_active, effective_from, effective_to, applied_at, created_by_pending_change_id, created_at | - | `20260518000001_t9_org_nodes.sql:45` |
| 4 | population | `core_identity.client_node_placements` | alle historiske, aktuelle og fremtidige placeringer; ingen effective_to IS NULL-begrænsning | id, client_id, node_id, effective_from, effective_to, applied_at, created_by_pending_change_id, created_at, updated_at | - | `20260518000004_t9_client_node_placements.sql:13` |
| 5 | population | `core_identity.employees` | alle employees, også uden auth_user_id, uden rolle/placering, fratrådte og anonymiserede; intet filter gennem current_employee_id() eller »kan logge ind« | id, auth_user_id [tilstede], first_name [blank/udfyldt], last_name [blank/udfyldt], email [blank/udfyldt], hire_date, termination_date, anonymized_at, role_id, created_at, updated_at | auth_user_id: kun login-mappingens tilstedeværelse behøves (T:52). first_name/last_name/email: persondata uden nødvendighed for kædens negativer — kun blank/udfyldt (T:56). Auth-hemmeligheder/tokens/sessions ligger i auth.* og er ikke i scope. | `20260514120007_t1_bootstrap_admins.sql:16` |
| 6 | population | `core_identity.employee_node_placements` | alle placeringer, også lukkede og fremtidige | id, employee_id, node_id, effective_from, effective_to, applied_at, created_by_pending_change_id, created_at, updated_at | - | `20260518000003_t9_employee_node_placements.sql:15` |
| 7 | closure | `core_identity.roles` | alle roller | id, name, description, created_at, updated_at | - | `20260514120007_t1_bootstrap_admins.sql:50` |
| 8 | closure | `core_identity.role_permission_grants` | alle grants (area/page/tab/action-niveau), også for inaktive elementer — ingen vanskelig grant fjernes | id, role_id, area_id, page_id, tab_id, can_access, can_write, visibility, created_at, updated_at, action_id | - | `20260518000006_t9_grants_and_helpers.sql:8 + 20260521100003:60 (action_id)` |
| 9 | closure | `core_identity.role_page_permissions` | alle legacy-grants (has_permission's sidste opslagsniveau) | id, role_id, page_key, tab_key, can_view, can_edit, scope, created_at, updated_at | - | `20260514120007_t1_bootstrap_admins.sql:78` |
| 10 | closure | `core_identity.permission_areas` | alle, også inaktive | id, name, is_active, sort_order, created_at, updated_at | - | `20260518000005_t9_permission_elements.sql:8` |
| 11 | closure | `core_identity.permission_pages` | alle, også inaktive | id, area_id, name, is_active, sort_order, created_at, updated_at | - | `20260518000005_t9_permission_elements.sql:32` |
| 12 | closure | `core_identity.permission_tabs` | alle, også inaktive | id, page_id, name, is_active, sort_order, created_at, updated_at | - | `20260518000005_t9_permission_elements.sql:58` |
| 13 | closure | `core_identity.permission_actions` | alle, også inaktive | id, tab_id, name, is_active, sort_order, requires_second_approver, has_undo, second_approver_type, bypass_tab_write, created_at, updated_at | - | `20260521100003_t9_supplement_2_permission_actions.sql:13` |
| 14 | closure | `core_identity.employee_active_config` | den ene konfigurationsrække (aktiv-reglens faktiske input) | id, post_termination_grace_days, treat_anonymized_as_active, created_at, updated_at | - | `20260514180300_q1_employee_active_config.sql:31` |
| 15 | closure | `core_identity.org_node_closure` | alle rækker — indlæses som OBSERVERET AFLEDNING og kontrolleres mod org_node_versions (T:52); erstatter dem ikke | ancestor_id, descendant_id, depth | - | `20260518000002_t9_org_node_closure.sql:14` |
| 16 | closure | `core_identity.client_field_definitions` | alle feltdefinitioner for clients.fields, også inaktive (styrer projektionen af clients.fields) | id, key, display_name, field_type, required, pii_level, display_order, is_active, created_at, updated_at | - | `20260521000001_t10_tables.sql:90` |
| 17 | closure | `core_compliance.data_field_definitions` | alle klassifikationer, også udfasede PII-definitioner | id, table_schema, table_name, column_name, category, pii_level, retention_type, retention_value, match_role, purpose, created_at, updated_at | - | `20260514120005_t1_data_field_definitions.sql:9` |
| 18 | closure | `core_identity.pending_changes` | alle pending-rækker (alle status), så placeringer/versioner m. created_by_pending_change_id ikke bliver forældreløse | id, change_type, target_id, payload [noeglesaet], effective_from, requested_by, requested_at, approved_by, approved_at, undo_deadline, applied_at, undone_at, status, created_at, updated_at, action_id | payload: kan bære persondata for employee-ændringer og behøves kun som metadata (nøglesæt + change_type + status) for kædens negativer — værdier udeladt før build (T:56). | `20260518000000_t9_pending_changes.sql:32 + 20260521100004:13 (action_id)` |
| 19 | closure | `core_identity.undo_settings` | alle | change_type, undo_period_seconds, updated_at, updated_by | - | `20260518000000_t9_pending_changes.sql:97` |
| 20 | closure | `core_compliance.anonymization_mappings` | alle mappings (alle status), også inaktive | id, entity_type, table_schema, table_name, field_strategies, jsonb_field_strategies, strategy_version, is_active, created_at, updated_at, status, internal_rpc_anonymize, internal_rpc_apply | - | `20260514140000_t6_anonymization_tables.sql:19 + p2:26 (status) + c002:37 (internal_rpc_*)` |
| 21 | closure | `core_compliance.anonymization_state` | alle (metadata for allerede anonymiserede kilderækker) | id, entity_type, table_schema, table_name, entity_id, anonymized_at, anonymization_reason, strategy_version, field_mapping_snapshot, jsonb_field_mapping_snapshot, audit_reference, created_by | - | `20260514140000_t6_anonymization_tables.sql:76` |
| 22 | closure | `core_compliance.anonymization_strategies` | alle (også ikke-aktive) | id, strategy_name, function_schema, function_name, status, description, created_at, updated_at, activated_at, activated_by | - | `20260515110100_p1a_anonymization_strategies.sql:22` |
<!-- /GEN:tabel -->

**Mekanisk kontrol ved fetch (erstatter v1's »hash af SQL-filen«):** `p8-kilde-scope.sql` del 2 sammenholder den observerede
kolonnemængde (pg_catalog, `format_type`) for de 22 relationer med den FORVENTEDE i begge retninger — 0 rækker = OK;
del 3 beregner sha256 over den kanoniske katalog-tekst (`skema.relation.kolonne<TAB>type`, sorteret bytewise, LF-adskilt, ingen
afsluttende LF) og skal give `forventet_katalog_digest` = `d701ec56628bc7ebcd2624973e37691985964c4fdee9e8d49ee399449880ccfd`. Enhver afvigelse = RØD (drift i KILDEN, ikke i
buildet) — aldrig tavs tilpasning. `scope_definition_sha256` (`67663a2af68cf90af5b757a7ef9d96c59fbd99573cf02052d9c5c199b3f26b1e`) er kontraktens VERSIONS-identitet (ændres filen, er
kontrakten ny), ikke en attest af resultatmængden.

## (4) Isoleret måltarget — DEKLARERET ÅBENT m. ejer + tidspunkt

Eksplicit CI-projekt/DB-identitet, aldrig runnerens project-ref-default (T:238). **Udpeges af fabrik-armen i C4 og bindes FØR
Fase 5's fetch** (`p8-kilde.json.maaltarget.identitet`, pt. `<udfyldes af fabrik-armen i C4>` — fabrik-armens beslutning 15/9,
TIL-DRIVER pkt. 4: behold placeholderen). Plan-lås kræver felt 1-3 + 5 bundne og felt 4 deklareret åbent med ejer og tidspunkt
(denne linje) — IKKE identiteten selv. Planens FA-5-tekst (§0.1 · BV-5 · §9) skal sige det samme (v3.2 retter v3's »før plan-lås«).

## (5) Bindes EFTER build (P-8 §1.3, T:60-69) — FORM BUNDET, VÆRDIER SENERE

Snapshot-tidspunkt · de konkrete rækker · `raw_source_digest` · `anonymized_snapshot_digest` · `run_id` og `k_run` (frisk hemmelig
nøgle fra betroet CI-jobidentitet). `seed = HMAC-SHA256(k_run, canonical(["P8-selection-v1", run_id, build_oid, build_proof_digest,
spec_blob_oid]))`. Intet af dette kan vælges af byggeren; replay bruger samme snapshot/seed; nyt snapshot = nyt attesteret forsøg.

## Syntetiske fixtures

Bid 1-5's egne testdata er eksplicit IKKE held-out (`canary`/`mutant`-mærkede pakkeobjekter, T:36). Kun populationen i (2) er reel
data. Kildens inaktive klientregler gøres ikke ved analogi til K-regler (T:54) — planen binder forventningen ved sådanne input.

## Bindinger

- `p8-kilde-gen.mjs` (kilden) → `p8-kilde-scope.sql` sha256 `67663a2af68cf90af5b757a7ef9d96c59fbd99573cf02052d9c5c199b3f26b1e` · `p8-kilde-katalog.txt` sha256 `ea38431f90a9b7fec2bde690b08a50b6691be27170849ca91853d613a72e97b0`
  (`forventet_katalog_digest` = `d701ec56628bc7ebcd2624973e37691985964c4fdee9e8d49ee399449880ccfd`) · `p8-kilde.json` (schema_version 2; bærer denne fils blob-OID).
- krav `docs/sandhed/krav/lokations-skabelon-krav.md` @ `9402164d87a35fb939661058bea77c1a052493d0` · P-8 `p8-slutproeve-spec.md` @
  `4af07ef4164882ca54643e79df3554c0bf22b0e4`.
- Kontrakten binder IKKE planen — planen binder kontrakten (FA-5), ellers cirkulær reference. Manifestet kan senere path-binde
  `bindings.p8_kilde` (C1-r2).
