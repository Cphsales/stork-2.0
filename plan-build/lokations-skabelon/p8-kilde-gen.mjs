#!/usr/bin/env node
// p8-kilde-gen.mjs — lokations-skabelon · FA-5 held-out-kildekontrakt (A2-14 → A3-1): ÉN kilde til
// p8-kilde-scope.sql · p8-kilde-katalog.txt · p8-kilde.json · p8-kildekontrakt.md. Kør:
//   node plan-build/lokations-skabelon/p8-kilde-gen.mjs [<kildekontrakt-md-blob-oid>]
// Deklarationen (population · closure · kolonner · projektion) er kontrakten; filerne er dens tre former.
// Kolonnerne er læst i supabase/migrations @ 79ab859 (CREATE TABLE + senere ADD COLUMN) — ingen kolonne er antaget.
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const T = { uuid: "uuid", text: "text", tstz: "timestamp with time zone", bool: "boolean", jsonb: "jsonb", date: "date", bytea: "bytea", int: "integer", smallint: "smallint" };
const F = "fuld"; // hele værdien hentes
// Projektion pr. kolonne: "fuld" · "tilstede" (kun null/ikke-null) · "tilstede+laengde" · "blank/udfyldt" · "noeglesaet" · "pr-noegle-klassifikation"
// Tabeller: population (P-8 §1.2 tabel) og closure (P-8 §1.2 »Afhængigheder«). Alle rækker, ingen rækkefilter.
const TABELLER = [
  { skema: "core_identity", rel: "clients", art: "population", ddl: "20260521000001_t10_tables.sql:24",
    udtraek: "alle rækker, også inaktive og uden org-placering; ingen filtrering på navn, felt-gyldighed, logo, aktualitet eller tidligere testresultat",
    kol: [["id", T.uuid], ["name", T.text], ["fields", T.jsonb, "pr-noegle-klassifikation"], ["is_active", T.bool], ["logo_bytes", T.bytea, "tilstede+laengde"], ["logo_content_type", T.text], ["logo_filename", T.text], ["created_at", T.tstz], ["updated_at", T.tstz]],
    begrundelse: "logo_bytes: binærindhold hentes ikke (T:56 — billedfladen er disponeret uden for kravet; tilstedeværelse + længde registreres). fields: nøgler hvis pii_level i client_field_definitions ≠ none (eller nøglen er udefineret) hentes kun som tilstede/blank — persondata der ikke behøves for kædens negativer (T:56); nøgler med pii_level = none hentes fuldt." },
  { skema: "core_identity", rel: "org_nodes", art: "population", ddl: "20260518000001_t9_org_nodes.sql:25",
    udtraek: "alle identiteter, også lukkede og uden aktuel version eller placering",
    kol: [["id", T.uuid], ["created_at", T.tstz], ["updated_at", T.tstz]] },
  { skema: "core_identity", rel: "org_node_versions", art: "population", ddl: "20260518000001_t9_org_nodes.sql:45",
    udtraek: "alle versioner, også lukkede, fremtidige og uden aktuel placering; alle intervalgrænser",
    kol: [["version_id", T.uuid], ["node_id", T.uuid], ["name", T.text], ["parent_id", T.uuid], ["node_type", T.text], ["is_active", T.bool], ["effective_from", T.date], ["effective_to", T.date], ["applied_at", T.tstz], ["created_by_pending_change_id", T.uuid], ["created_at", T.tstz]] },
  { skema: "core_identity", rel: "client_node_placements", art: "population", ddl: "20260518000004_t9_client_node_placements.sql:13",
    udtraek: "alle historiske, aktuelle og fremtidige placeringer; ingen effective_to IS NULL-begrænsning",
    kol: [["id", T.uuid], ["client_id", T.uuid], ["node_id", T.uuid], ["effective_from", T.date], ["effective_to", T.date], ["applied_at", T.tstz], ["created_by_pending_change_id", T.uuid], ["created_at", T.tstz], ["updated_at", T.tstz]] },
  { skema: "core_identity", rel: "employees", art: "population", ddl: "20260514120007_t1_bootstrap_admins.sql:16",
    udtraek: "alle employees, også uden auth_user_id, uden rolle/placering, fratrådte og anonymiserede; intet filter gennem current_employee_id() eller »kan logge ind«",
    kol: [["id", T.uuid], ["auth_user_id", T.uuid, "tilstede"], ["first_name", T.text, "blank/udfyldt"], ["last_name", T.text, "blank/udfyldt"], ["email", T.text, "blank/udfyldt"], ["hire_date", T.date], ["termination_date", T.date], ["anonymized_at", T.tstz], ["role_id", T.uuid], ["created_at", T.tstz], ["updated_at", T.tstz]],
    begrundelse: "auth_user_id: kun login-mappingens tilstedeværelse behøves (T:52). first_name/last_name/email: persondata uden nødvendighed for kædens negativer — kun blank/udfyldt (T:56). Auth-hemmeligheder/tokens/sessions ligger i auth.* og er ikke i scope." },
  { skema: "core_identity", rel: "employee_node_placements", art: "population", ddl: "20260518000003_t9_employee_node_placements.sql:15",
    udtraek: "alle placeringer, også lukkede og fremtidige",
    kol: [["id", T.uuid], ["employee_id", T.uuid], ["node_id", T.uuid], ["effective_from", T.date], ["effective_to", T.date], ["applied_at", T.tstz], ["created_by_pending_change_id", T.uuid], ["created_at", T.tstz], ["updated_at", T.tstz]] },
  // ---- referentiel lukning (P-8 §1.2 »Afhængigheder«: roller · grants · legacy-grants · permission area/page/tab/action · employee_active_config · klassifikationer/feltdefinitioner inkl. inaktive · pending-/undo-/anonymiseringsmetadata · org-closure som observeret afledning)
  { skema: "core_identity", rel: "roles", art: "closure", ddl: "20260514120007_t1_bootstrap_admins.sql:50", udtraek: "alle roller", kol: [["id", T.uuid], ["name", T.text], ["description", T.text], ["created_at", T.tstz], ["updated_at", T.tstz]] },
  { skema: "core_identity", rel: "role_permission_grants", art: "closure", ddl: "20260518000006_t9_grants_and_helpers.sql:8 + 20260521100003:60 (action_id)", udtraek: "alle grants (area/page/tab/action-niveau), også for inaktive elementer — ingen vanskelig grant fjernes", kol: [["id", T.uuid], ["role_id", T.uuid], ["area_id", T.uuid], ["page_id", T.uuid], ["tab_id", T.uuid], ["can_access", T.bool], ["can_write", T.bool], ["visibility", T.text], ["created_at", T.tstz], ["updated_at", T.tstz], ["action_id", T.uuid]] },
  { skema: "core_identity", rel: "role_page_permissions", art: "closure", ddl: "20260514120007_t1_bootstrap_admins.sql:78", udtraek: "alle legacy-grants (has_permission's sidste opslagsniveau)", kol: [["id", T.uuid], ["role_id", T.uuid], ["page_key", T.text], ["tab_key", T.text], ["can_view", T.bool], ["can_edit", T.bool], ["scope", T.text], ["created_at", T.tstz], ["updated_at", T.tstz]] },
  { skema: "core_identity", rel: "permission_areas", art: "closure", ddl: "20260518000005_t9_permission_elements.sql:8", udtraek: "alle, også inaktive", kol: [["id", T.uuid], ["name", T.text], ["is_active", T.bool], ["sort_order", T.int], ["created_at", T.tstz], ["updated_at", T.tstz]] },
  { skema: "core_identity", rel: "permission_pages", art: "closure", ddl: "20260518000005_t9_permission_elements.sql:32", udtraek: "alle, også inaktive", kol: [["id", T.uuid], ["area_id", T.uuid], ["name", T.text], ["is_active", T.bool], ["sort_order", T.int], ["created_at", T.tstz], ["updated_at", T.tstz]] },
  { skema: "core_identity", rel: "permission_tabs", art: "closure", ddl: "20260518000005_t9_permission_elements.sql:58", udtraek: "alle, også inaktive", kol: [["id", T.uuid], ["page_id", T.uuid], ["name", T.text], ["is_active", T.bool], ["sort_order", T.int], ["created_at", T.tstz], ["updated_at", T.tstz]] },
  { skema: "core_identity", rel: "permission_actions", art: "closure", ddl: "20260521100003_t9_supplement_2_permission_actions.sql:13", udtraek: "alle, også inaktive", kol: [["id", T.uuid], ["tab_id", T.uuid], ["name", T.text], ["is_active", T.bool], ["sort_order", T.int], ["requires_second_approver", T.bool], ["has_undo", T.bool], ["second_approver_type", T.text], ["bypass_tab_write", T.bool], ["created_at", T.tstz], ["updated_at", T.tstz]] },
  { skema: "core_identity", rel: "employee_active_config", art: "closure", ddl: "20260514180300_q1_employee_active_config.sql:31", udtraek: "den ene konfigurationsrække (aktiv-reglens faktiske input)", kol: [["id", T.smallint], ["post_termination_grace_days", T.int], ["treat_anonymized_as_active", T.bool], ["created_at", T.tstz], ["updated_at", T.tstz]] },
  { skema: "core_identity", rel: "org_node_closure", art: "closure", ddl: "20260518000002_t9_org_node_closure.sql:14", udtraek: "alle rækker — indlæses som OBSERVERET AFLEDNING og kontrolleres mod org_node_versions (T:52); erstatter dem ikke", kol: [["ancestor_id", T.uuid], ["descendant_id", T.uuid], ["depth", T.int]] },
  { skema: "core_identity", rel: "client_field_definitions", art: "closure", ddl: "20260521000001_t10_tables.sql:90", udtraek: "alle feltdefinitioner for clients.fields, også inaktive (styrer projektionen af clients.fields)", kol: [["id", T.uuid], ["key", T.text], ["display_name", T.text], ["field_type", T.text], ["required", T.bool], ["pii_level", T.text], ["display_order", T.int], ["is_active", T.bool], ["created_at", T.tstz], ["updated_at", T.tstz]] },
  { skema: "core_compliance", rel: "data_field_definitions", art: "closure", ddl: "20260514120005_t1_data_field_definitions.sql:9", udtraek: "alle klassifikationer, også udfasede PII-definitioner", kol: [["id", T.uuid], ["table_schema", T.text], ["table_name", T.text], ["column_name", T.text], ["category", T.text], ["pii_level", T.text], ["retention_type", T.text], ["retention_value", T.jsonb], ["match_role", T.text], ["purpose", T.text], ["created_at", T.tstz], ["updated_at", T.tstz]] },
  { skema: "core_identity", rel: "pending_changes", art: "closure", ddl: "20260518000000_t9_pending_changes.sql:32 + 20260521100004:13 (action_id)", udtraek: "alle pending-rækker (alle status), så placeringer/versioner m. created_by_pending_change_id ikke bliver forældreløse",
    kol: [["id", T.uuid], ["change_type", T.text], ["target_id", T.uuid], ["payload", T.jsonb, "noeglesaet"], ["effective_from", T.date], ["requested_by", T.uuid], ["requested_at", T.tstz], ["approved_by", T.uuid], ["approved_at", T.tstz], ["undo_deadline", T.tstz], ["applied_at", T.tstz], ["undone_at", T.tstz], ["status", T.text], ["created_at", T.tstz], ["updated_at", T.tstz], ["action_id", T.uuid]],
    begrundelse: "payload: kan bære persondata for employee-ændringer og behøves kun som metadata (nøglesæt + change_type + status) for kædens negativer — værdier udeladt før build (T:56)." },
  { skema: "core_identity", rel: "undo_settings", art: "closure", ddl: "20260518000000_t9_pending_changes.sql:97", udtraek: "alle", kol: [["change_type", T.text], ["undo_period_seconds", T.int], ["updated_at", T.tstz], ["updated_by", T.uuid]] },
  { skema: "core_compliance", rel: "anonymization_mappings", art: "closure", ddl: "20260514140000_t6_anonymization_tables.sql:19 + p2:26 (status) + c002:37 (internal_rpc_*)", udtraek: "alle mappings (alle status), også inaktive", kol: [["id", T.uuid], ["entity_type", T.text], ["table_schema", T.text], ["table_name", T.text], ["field_strategies", T.jsonb], ["jsonb_field_strategies", T.jsonb], ["strategy_version", T.int], ["is_active", T.bool], ["created_at", T.tstz], ["updated_at", T.tstz], ["status", T.text], ["internal_rpc_anonymize", T.text], ["internal_rpc_apply", T.text]] },
  { skema: "core_compliance", rel: "anonymization_state", art: "closure", ddl: "20260514140000_t6_anonymization_tables.sql:76", udtraek: "alle (metadata for allerede anonymiserede kilderækker)", kol: [["id", T.uuid], ["entity_type", T.text], ["table_schema", T.text], ["table_name", T.text], ["entity_id", T.uuid], ["anonymized_at", T.tstz], ["anonymization_reason", T.text], ["strategy_version", T.int], ["field_mapping_snapshot", T.jsonb], ["jsonb_field_mapping_snapshot", T.jsonb], ["audit_reference", T.uuid], ["created_by", T.uuid]] },
  { skema: "core_compliance", rel: "anonymization_strategies", art: "closure", ddl: "20260515110100_p1a_anonymization_strategies.sql:22", udtraek: "alle (også ikke-aktive)", kol: [["id", T.uuid], ["strategy_name", T.text], ["function_schema", T.text], ["function_name", T.text], ["status", T.text], ["description", T.text], ["created_at", T.tstz], ["updated_at", T.tstz], ["activated_at", T.tstz], ["activated_by", T.uuid]] },
];

// ---- kanonisk katalog (drift-kontrol af KILDEN — alle kolonner, uafhængigt af projektion) ----
const kanon = TABELLER.flatMap((t) => t.kol.map(([k, ty]) => `${t.skema}.${t.rel}.${k}\t${ty}`)).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
const katalogTekst = kanon.join("\n");
const katalogDigest = createHash("sha256").update(katalogTekst, "utf8").digest("hex");
writeFileSync(join(DIR, "p8-kilde-katalog.txt"), katalogTekst + "\n");

// ---- SQL: deklaration + mekanisk kontrol ----
const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";
const deklRows = TABELLER.map((t, i) => {
  const inkl = t.kol.map(([k, , p]) => (p && p !== F ? `${k} [${p}]` : k)).join(", ");
  return `  (${i + 1}, ${q(t.art)}, ${q(t.skema + "." + t.rel)}, ${q(t.udtraek)}, ${q(inkl)}, ${q(t.begrundelse ?? "-")}, ${q(t.ddl)})`;
}).join(",\n");
const forventetRows = kanon.map((l) => { const [navn, ty] = l.split("\t"); const [s, r, k] = navn.split("."); return `  (${q(s)}, ${q(r)}, ${q(k)}, ${q(ty)})`; }).join(",\n");
const relList = TABELLER.map((t) => `    (${q(t.skema)}, ${q(t.rel)})`).join(",\n");
const sql = `-- p8-kilde-scope.sql — lokations-skabelon · FA-5 held-out-kildekontrakt (A2-14 → A3-1). GENERERET af p8-kilde-gen.mjs — ret generatoren, ikke denne fil.
-- Deterministisk deklaration af KILDEN for slutprøvens held-out-fetch (Fase 5, EFTER build): population + referentiel lukning,
-- projektion pr. kolonne, og en MEKANISK katalogkontrol. Ingen tidsstempler, ingen tilfældighed, fast sortering (collate "C").
-- Systemidentitet: supabase-postgres · projekt_ref imtxvrymaqbgcvsarlib · database postgres (p8-kilde.json). Ingen credentials her.
-- Pakkens EGNE objekter (lokationer · stande · grupper · koblinger · fravalg · historik · pending for dem) er IKKE kilde (P-8 §1.1 pkt. 2).
-- Syntetiske bid-fixtures (Bid 1-5) er eksplicit IKKE held-out (canary/mutant-mærkede, T:36).
--
-- 1) DEKLARATION: population (P-8 §1.2 tabel) + closure (P-8 §1.2 »Afhængigheder«). Udtræksregel = ALLE rækker, ingen rækkefilter.
--    kolonner_inkluderet: navn [projektion] — uden klammer = fuld værdi; [tilstede] = kun null/ikke-null; [tilstede+laengde] = null/ikke-null + octet_length;
--    [blank/udfyldt] = kun om tekst er blank; [noeglesaet] = jsonb-nøgler sorteret, ingen værdier; [pr-noegle-klassifikation] = fuld hvis nøglens
--    pii_level = none i client_field_definitions, ellers tilstede/blank. Rækker udelades ALDRIG; en udeladt kolonneværdi tælles stadig (T:56).
with deklaration(ordinal, art, relation, udtraeksregel, kolonner_inkluderet, begrundelse_projektion, ddl_kilde) as (
  values
${deklRows}
)
select * from deklaration order by ordinal;

-- 2) MEKANISK KATALOGKONTROL ved fetch (CI, read-only-rollen): den observerede kolonnemængde for de ${TABELLER.length} relationer sammenholdes med den
--    FORVENTEDE (nedenfor) i begge retninger — begge mængder skal være tomme. Drift i kilden (ny/fjernet/omtypet kolonne) = RØD, aldrig tavs.
with forventet(skema, relation, kolonne, type) as (
  values
${forventetRows}
),
observeret as (
  select n.nspname::text as skema, c.relname::text as relation, a.attname::text as kolonne, format_type(a.atttypid, a.atttypmod) as type
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  join pg_catalog.pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
  where c.relkind in ('r', 'p')
    and (n.nspname, c.relname) in (
${relList}
    )
)
select 'MANGLER I KILDEN' as afvigelse, * from (select * from forventet except select * from observeret) f
union all
select 'UVENTET I KILDEN' as afvigelse, * from (select * from observeret except select * from forventet) o
order by 1, 2, 3, 4;

-- 3) KATALOG-DIGEST (samme mængde som 2, kanonisk form: "skema.relation.kolonne<TAB>type", sorteret bytewise, linjer adskilt af LF, ingen afsluttende LF).
--    Skal være lig p8-kilde.json.forventet_katalog_digest = ${katalogDigest}
--    (identisk værdi beregnet af generatoren over p8-kilde-katalog.txt uden afsluttende LF).
select encode(sha256(convert_to(string_agg(linje, E'\\n' order by linje collate "C"), 'utf8')), 'hex') as observeret_katalog_digest
from (
  select n.nspname || '.' || c.relname || '.' || a.attname || E'\\t' || format_type(a.atttypid, a.atttypmod) as linje
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  join pg_catalog.pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
  where c.relkind in ('r', 'p')
    and (n.nspname, c.relname) in (
${relList}
    )
) k;

-- 4) Isoleret måltarget (FA-5 felt 4) og efter-build-bindinger (felt 5) står i p8-kilde.json; snapshot-tidspunkt, konkrete rækker,
--    raw_source_digest, anonymized_snapshot_digest og run_id/k_run bindes EFTER build af CI (P-8 §1.3).
`;
writeFileSync(join(DIR, "p8-kilde-scope.sql"), sql);
const sqlSha = createHash("sha256").update(readFileSync(join(DIR, "p8-kilde-scope.sql"))).digest("hex");
const katalogSha = createHash("sha256").update(readFileSync(join(DIR, "p8-kilde-katalog.txt"))).digest("hex");

// ---- JSON ----
const mdOid = process.argv[2] ?? "<udfyldes af driveren efter hash-object af p8-kildekontrakt.md>";
const json = {
  schema_version: 2,
  pakke: "lokations-skabelon",
  genereret_af: "plan-build/lokations-skabelon/p8-kilde-gen.mjs (deklarationen er kontrakten; sql/katalog/json er dens former)",
  system: { art: "supabase-postgres", projekt_ref: "imtxvrymaqbgcvsarlib", host_ref: "imtxvrymaqbgcvsarlib.supabase.co", database: "postgres", note: "deklareret kildeidentitet fra repoets supabase/config.toml — kun ÉN eksisterende systemgrænse, ingen ny tenant-grænse (T:44); live-identitet attesteres af CI ved fetch" },
  adgang: { rolle: "<read-only rolle — navngives af fabrik-armen i C4; CI håndhæver at rollen ingen write-grants har før fetch>", skriv: false, default: "read-only-rolle mod dette projekt (læser eksisterende klient-/org-/medarbejderdata; ændrer intet)", mathias: "default deklareret som orientering i plan-fremlæggelsen (B7): siger han stop, seedes et dedikeret held-out-projekt fra kilden først (TIL-DRIVER 15/9 pkt. 4: PROD read-only = Mathias' bord, uændret)" },
  maaltarget: { beskrivelse: "isoleret CI-projekt/DB-identitet — aldrig runnerens project-ref-default (P-8 T:238)", identitet: "<udfyldes af fabrik-armen i C4>", bindes: "af fabrik-armen (C4) FØR Fase 5's fetch — IKKE en plan-lås-forudsætning; plan-lås kræver felt 1-3 + 5 bundne og felt 4 deklareret åbent m. ejer + tidspunkt (denne linje)" },
  scope: {
    udtraeksregel: "ALLE rækker i hver relation, ingen rækkefilter (P-8 §1.2); ingen top-N, ingen tavs timeout-afkortning; pakkens egne objekter er IKKE kilde",
    population: TABELLER.filter((t) => t.art === "population").map((t) => `${t.skema}.${t.rel}`),
    closure: TABELLER.filter((t) => t.art === "closure").map((t) => `${t.skema}.${t.rel}`),
    org_closure: "core_identity.org_node_closure indlæses som observeret afledning og kontrolleres mod org_node_versions (T:52)",
    definition_fil: "plan-build/lokations-skabelon/p8-kilde-scope.sql",
  },
  projektion: {
    regler: { fuld: "hele værdien", tilstede: "kun null/ikke-null", "tilstede+laengde": "null/ikke-null + octet_length", "blank/udfyldt": "kun om tekst er blank", noeglesaet: "jsonb-nøgler sorteret, ingen værdier", "pr-noegle-klassifikation": "fuld hvis nøglens pii_level = none i client_field_definitions, ellers tilstede/blank" },
    udeladt_foer_build: TABELLER.flatMap((t) => t.kol.filter(([, , p]) => p && p !== F).map(([k, , p]) => ({ kolonne: `${t.skema}.${t.rel}.${k}`, projektion: p, begrundelse: t.begrundelse }))),
    raekker_udelades: false,
  },
  katalogkontrol: {
    metode: "p8-kilde-scope.sql del 2 (EXCEPT begge veje, skal give 0 rækker) + del 3 (sha256 over kanonisk katalog-tekst, skal være lig forventet_katalog_digest); drift i kilden = rød",
    kanonisk_form: "skema.relation.kolonne<TAB>format_type, sorteret bytewise (collate C), LF-adskilt, ingen afsluttende LF",
    forventet_katalog_digest: katalogDigest,
    katalog_fil: "plan-build/lokations-skabelon/p8-kilde-katalog.txt",
    katalog_fil_sha256: katalogSha,
    antal_relationer: TABELLER.length,
    antal_kolonner: kanon.length,
  },
  scope_definition_sha256: sqlSha,
  efter_build: ["snapshot_tidspunkt", "konkrete_raekker", "raw_source_digest", "anonymized_snapshot_digest", "run_id", "k_run"],
  syntetiske_fixtures_held_out: false,
  bindinger: {
    krav: { path: "docs/sandhed/krav/lokations-skabelon-krav.md", oid: "9402164d87a35fb939661058bea77c1a052493d0" },
    p8_spec: { path: "plan-build/lokations-skabelon/p8-slutproeve-spec.md", oid: "4af07ef4164882ca54643e79df3554c0bf22b0e4" },
    kildekontrakt: { path: "plan-build/lokations-skabelon/p8-kildekontrakt.md", oid: mdOid },
    note: "kontrakten binder IKKE planen — planen binder kontrakten (FA-5), ellers cirkulær reference",
  },
};
writeFileSync(join(DIR, "p8-kilde.json"), JSON.stringify(json, null, 2) + "\n");

// ---- markdown-tabel til kontrakten (indsættes mellem markører) ----
const mdRows = TABELLER.map((t, i) => `| ${i + 1} | ${t.art} | \`${t.skema}.${t.rel}\` | ${t.udtraek} | ${t.kol.map(([k, , p]) => (p && p !== F ? `${k} [${p}]` : k)).join(", ")} | ${t.begrundelse ?? "-"} | \`${t.ddl}\` |`).join("\n");
const mdTable = `| # | art | relation | udtræksregel (alle rækker) | kolonner [projektion ≠ fuld] | begrundelse for projektion ≠ fuld (før build) | DDL-kilde (supabase/migrations) |\n| --- | --- | --- | --- | --- | --- | --- |\n${mdRows}`;
const mdPath = join(DIR, "p8-kildekontrakt.md");
if (existsSync(mdPath)) {
  const md = readFileSync(mdPath, "utf8");
  const start = md.indexOf("<!-- GEN:tabel -->"), end = md.indexOf("<!-- /GEN:tabel -->");
  if (start >= 0 && end > start) {
    const ny = md.slice(0, start) + "<!-- GEN:tabel -->\n" + mdTable + "\n" + md.slice(end);
    writeFileSync(mdPath, ny.split("@@KATALOG_DIGEST@@").join(katalogDigest).split("@@SQL_SHA@@").join(sqlSha).split("@@KATALOG_SHA@@").join(katalogSha).split("@@ANTAL_REL@@").join(String(TABELLER.length)).split("@@ANTAL_KOL@@").join(String(kanon.length)));
  }
}
console.log(`relationer=${TABELLER.length} kolonner=${kanon.length} katalog_digest=${katalogDigest} sql_sha256=${sqlSha} katalog_sha256=${katalogSha} kildekontrakt_oid=${mdOid}`);
