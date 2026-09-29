# lokations-skabelon — Plan v3.8

**Krav:** docs/sandhed/krav/lokations-skabelon-krav.md (@ blob cee4d8192cfa, M-89) · **Ordbog:** docs/sandhed/ordbog.md · **Målelag (bruges som det er; i trin 3 opdateres kun bindingerne til krav og plan):** `forventnings-manifest.json` @ 4e84481d6df1 · `angrebs-spec.json` @ dd6cec8da39f · `prover.json` @ 88c45f7bc323 · **Masterplan-rettelser:** `masterplan-rettelser-del-b-c.md` @ 57c906230985 (Del B følger med `slut ok`)

v3.8 afløser v3.7 (blob 934291780be9). v3.7's tekniske afgørelser står, medmindre denne plan siger andet. Fundamentet er læst i `supabase/migrations/` 29/9; seneste migration er `20260610190000`, og alle definitioner planen bygger på er de seneste (angivet ved fil nedenfor).

## Formål

Lokations-skabelonen: fysiske lokationer med stande (placements), grupper (ejere), klient-tilladelser (hvilke klienter må stå hvor), status-livscyklus og hvile-regler som central master-data — UI-styret, auditeret og klar til at bære bookinger og resten af FM-kæden (trin 24-29) uden om-design. Fundamentet for hele FM-grenen.

## Det testene og kravet bruger

### Fælles regler for pakkens indgange

- Tabeller og indgange ligger i `core_identity`; klassifikations- og mapping-værnene i `core_compliance`.
- Offentlige indgange: `security definer set search_path = ''`, `revoke all … from public, anon`, `grant execute … to authenticated`. Interne funktioner og trigger-funktioner: `revoke all … from public, anon, authenticated`.
- Sider i rettigheds-træet: `grupper` og `lokationer`, hver med fanen `manage`, under det eksisterende område `org_structure`. Superadmin får side- og fane-grants (5-kolonne ON CONFLICT). Andre tildelinger er UI-drift.
- Rækkefølge i hver skrive-indgang: rettighed `core_identity.has_permission('<side>','manage',true)` → årsag (`p_change_reason`) → input → eksistens (med `for update`, hvor det er angivet) → tilstandsvagter → først derefter `stork.source_type = 'manual'`, `stork.change_reason = p_change_reason`, `stork.allow_<tabel>_write = 'true'` → skrivning. Læse-indgange: `has_permission('<side>','manage',false)` som første sætning.
- Afvisninger: `<fn>: <sag>` på ASCII uden værdier fra kørslen (ingen uuid eller tal). Hver afvisning står som én `raise exception '<fn>: <sag>' using errcode = '…'` i plpgsql; testindeksets mutanter finder stedet sådan.
- Ingen app-rolle har INSERT, UPDATE, DELETE eller TRUNCATE på pakkens tabeller. De har kun `grant select` + select-policy `has_permission('<side>','manage',false)`, RLS `enable` + `force` og `core_compliance.stork_audit` på alle 9.
- Systemets dag: `core_identity.dags_dato_utc()` = `(clock_timestamp() at time zone 'UTC')::date` (sql, volatile; `grant execute` til authenticated og service_role, fordi den er default-argument). Historikrækker stemples af triggeren `_stamp_utc` (`sat_kl`, `sat_dato`). Ingen indgang kan vælge datoen på en historikrække.
- Superadmin er kun undtaget på forretningsvagterne `gruppe_inaktiv` og `klient_inaktiv`: `is_admin()` i wrappers, `is_admin_by_employee_id(requested_by)` ved apply. Strukturvagter har ingen undtagelse.

### Tabeller (9)

| Tabel | Side | Kolonner og constraints (umulighederne) | Skrives af |
| --- | --- | --- | --- |
| `grupper` | grupper | `navn` NOT NULL, CHECK `length(trim(navn)) > 0` · `type` NULL eller ∈ {`kaede`,`enkelt_butik`,`messe_operatoer`,`andet`} · `is_active` | W1, W2 |
| `gruppe_kontakter` | grupper | `gruppe_id` NOT NULL FK RESTRICT · `navn` NOT NULL + CHECK · `email`, `telefon` · `is_active` · `udfaset_dato date` · `anonymized_at` · CHECK `is_active = (udfaset_dato is null)` | W3, W4, I5, I6 |
| `lokationer` | lokationer | `navn` NOT NULL + CHECK · `adresse` NULL · `type` NOT NULL ∈ {`butik`,`messe`,`marked`,`event`,`andet`} · `dagspris numeric(12,2)` NOT NULL ≥ 0 · `gruppe_id` NOT NULL FK RESTRICT · `hviledage` NULL eller ≥ 1 · `anonymized_at` · ingen status-kolonne og ingen parent-kolonne | W5-W8, I7, I8 |
| `stande` | lokationer | `lokation_id` NOT NULL FK RESTRICT · `navn` NOT NULL + CHECK · `dagspris numeric(12,2)` NULL (= arv) eller ≥ 0 · `is_active` | W5, W9-W11 |
| `lokation_status_skift` | lokationer | `seq` identity · `lokation_id` FK RESTRICT · `status` NOT NULL ∈ {`aktiv`,`dvale`,`nedlagt`} · `dvale_ophoer date` kun ved dvale · `sat_kl`, `sat_dato` NOT NULL | W5 (første skift: `aktiv`), W12 |
| `pris_historik` | lokationer | `seq` · præcis én af `lokation_id`/`stand_id` (FK RESTRICT) · `ny_dagspris` (NULL kun for stand = arv) · `sat_kl`, `sat_dato` | kun triggere |
| `lokation_gruppe_historik` | lokationer | `seq` · `lokation_id`, `gruppe_id` FK RESTRICT · `sat_kl`, `sat_dato` | kun trigger |
| `gruppe_klient_koblinger` | grupper | `gruppe_id`, `klient_id` (→ `core_identity.clients`) NOT NULL FK RESTRICT · `gaeldende_fra` NOT NULL · `gaeldende_til` NULL · CHECK `gaeldende_fra < gaeldende_til` · partial UNIQUE `(gruppe_id, klient_id) where gaeldende_til is null` · EXCLUDE (gist) overlap pr. par · `created_by_pending_change_id` FK | I1 (ny), I2 (luk) |
| `lokation_klient_fravalg` | lokationer | samme form pr. `(lokation_id, klient_id)` | I3 (ny), I4 (luk) |

Fælles for alle 9: `id uuid` PK og `created_at`. Master- og relationstabellerne har også `updated_at` + `set_updated_at`. På de 6 master- og relationstabeller er der write-policies `current_setting('stork.allow_<tabel>_write', true) = 'true'` (fitness D4). Ingen tabel har en delete-policy. Klassifikationen står i samme migration som `CREATE TABLE`: `master_data`, `none` og opbevaring NULL på alle kolonner, undtagen `gruppe_kontakter.{navn,email,telefon}` = `direct`.

Triggere på tabellerne:
- `_stamp_utc` BEFORE INSERT på de 3 logs.
- `_historik_immutabel` BEFORE UPDATE/DELETE (række) og BEFORE TRUNCATE (sætning) på de 3 logs.
- `_kobling_historik_guard` på koblinger og fravalg, række og TRUNCATE. Den tillader kun at lukke en åben række: `gaeldende_til` sættes, og de øvrige kolonner er uændrede.
- `_pris_historik_lokation`, `_pris_historik_stand` og `_lokation_gruppe_historik` er AFTER INSERT/UPDATE OF og skriver kun ved ændring. En stand, der sættes til NULL, giver en arv-række.

Begge guards afviser med P0001 `<tabel>_immutabel (operation <op>)`.

### Skrive-indgange (18)

Vagterne står efter rettighed og årsag, i den rækkefølge de tjekkes.

| # | Signatur | Side | Vagter | Virkning |
| --- | --- | --- | --- | --- |
| W1 | `gruppe_upsert(p_navn text, p_change_reason text, p_type text default null, p_gruppe_id uuid default null) returns uuid` | grupper | navn · type · findes (ved p_gruppe_id, lås) | opret eller ret navn/type; rører aldrig `is_active` |
| W2 | `gruppe_saet_aktiv(p_gruppe_id uuid, p_is_active boolean, p_change_reason text) returns void` | grupper | påkrævet · findes · uændret | udfas/genaktivér |
| W3 | `gruppe_kontakt_upsert(p_gruppe_id uuid, p_navn text, p_change_reason text, p_email text default null, p_telefon text default null, p_kontakt_id uuid default null) returns uuid` | grupper | navn · påkrævet · gruppe findes · kontakt findes (lås) · anonymiseret kontakt | opret eller ret; rører aldrig `is_active`/`anonymized_at` |
| W4 | `gruppe_kontakt_saet_aktiv(p_kontakt_id uuid, p_is_active boolean, p_change_reason text) returns void` | grupper | påkrævet · findes · anonymiseret kontakt · uændret | `is_active` + `udfaset_dato` (dags dato ved udfasning, NULL ved genaktivering) |
| W5 | `lokation_opret(p_navn text, p_type text, p_dagspris numeric, p_gruppe_id uuid, p_foerste_stand_navn text, p_change_reason text, p_adresse text default null, p_hviledage integer default null, p_foerste_stand_dagspris numeric default null) returns uuid` | lokationer | navn · type · pris · påkrævet (gruppe) · gruppe findes · gruppe inaktiv · navn (stand) · pris (stand) · hviledage | én transaktion: lokation + første stand + status-skift `aktiv` |
| W6 | `lokation_rediger(p_lokation_id uuid, p_navn text, p_type text, p_dagspris numeric, p_change_reason text, p_adresse text default null) returns void` | lokationer | navn · type · pris · påkrævet · findes (lås) · anonymiseret lokation | `p_adresse` NULL = uændret, `''` = ryd. Ændring af en kolonne, der nu er `direct`, på en anonymiseret række afvises. Rører aldrig gruppe, hviledage, status. Tilladt på nedlagt |
| W7 | `lokation_saet_gruppe(p_lokation_id uuid, p_gruppe_id uuid, p_change_reason text) returns void` | lokationer | påkrævet ×2 · lokation findes (lås) · gruppe findes · gruppe inaktiv · uændret | skifter ejer straks; historik via trigger |
| W8 | `lokation_saet_hviledage(p_lokation_id uuid, p_hviledage integer, p_change_reason text) returns void` | lokationer | hviledage · påkrævet · findes (lås) | straks (M-87); NULL = intet valg |
| W9 | `stand_opret(p_lokation_id uuid, p_navn text, p_change_reason text, p_dagspris numeric default null) returns uuid` | lokationer | navn · pris · påkrævet · lokation findes (lås) · lokation nedlagt | ny stand |
| W10 | `stand_rediger(p_stand_id uuid, p_navn text, p_dagspris numeric, p_change_reason text) returns void` | lokationer | navn · pris (NULL = arv) · påkrævet · findes (lås) | ingen lokations-parameter: en stand kan ikke flyttes |
| W11 | `stand_saet_aktiv(p_stand_id uuid, p_is_active boolean, p_change_reason text) returns void` | lokationer | påkrævet · findes · lås på lokationens række · uændret · sidste aktive stand | tag ud af brug / tilbage |
| W12 | `lokation_saet_status(p_lokation_id uuid, p_status text, p_change_reason text, p_dvale_ophoer date default null) returns void` | lokationer | status · ophør kræver dvale · påkrævet · findes (lås) · ophør ≤ dags dato · samme status (undtagen dvale→dvale med ændret ophør) | nyt status-skift. Genåbning og stop før tid bruger samme indgang. Nedlæggelse skriver intet andet |
| W13 | `gruppe_klient_kobl(p_gruppe_id uuid, p_klient_id uuid, p_gaeldende_fra date, p_change_reason text) returns uuid` | grupper | påkrævet ×3 · gruppe findes · gruppe inaktiv · klient findes · klient inaktiv · dato i fortiden · åben kobling findes | anmodning `gruppe_klient_kobl` |
| W14 | `gruppe_klient_frakobl(p_gruppe_id uuid, p_klient_id uuid, p_gaeldende_fra date, p_change_reason text) returns uuid` | grupper | påkrævet ×3 · findes ×2 · dato i fortiden · ingen åben kobling · dato ≤ koblingens start | anmodning `gruppe_klient_frakobl`; ingen inaktiv- eller nedlagt-vagt |
| W15 | `lokation_klient_fravaelg(p_lokation_id uuid, p_klient_id uuid, p_gaeldende_fra date, p_change_reason text) returns uuid` | lokationer | påkrævet ×3 · lokation findes · lokation nedlagt · klient findes · dato i fortiden · ikke koblet på lokationens gruppe på datoen · åbent fravalg findes | anmodning `lokation_klient_fravalg` |
| W16 | `lokation_klient_fravalg_ophaev(p_lokation_id uuid, p_klient_id uuid, p_gaeldende_fra date, p_change_reason text) returns uuid` | lokationer | påkrævet ×3 · lokation findes · lokation nedlagt · klient findes · dato i fortiden · ikke i gruppen · intet åbent fravalg · dato ≤ fravalgets start | anmodning `lokation_klient_fravalg_ophaev` |
| W17 | `anonymiser_gruppe_kontakt(p_kontakt_id uuid, p_change_reason text) returns void` | grupper | påkrævet · findes | → I5 |
| W18 | `anonymiser_lokation(p_lokation_id uuid, p_change_reason text) returns void` | lokationer | påkrævet · findes | → I7. Uden aktiv mapping eller direct-kolonne afviser fundamentet |

W13-W16: `stork.t9_write_authorized = 'true'` sættes, og derefter kaldes `pending_change_request(<type>, <gruppe_id|lokation_id>, <payload>, p_gaeldende_fra)`. Payload er `{"gruppe_id"|"lokation_id", "klient_id", "gaeldende_fra": to_char(p_gaeldende_fra, 'YYYY-MM-DD'), "change_reason"}`. Datoen skrives aldrig som `::text`, fordi det afhænger af DateStyle.

### Læse-indgange (17)

Alle læse-indgange er SECDEF og `stable`, med typede `returns` (aldrig jsonb). Klient-navne returneres ikke (kun `klient_id`). Liste-indgangene bruger keyset: `p_antal integer default 200` skal være 1..1000.

| # | Signatur | Side |
| --- | --- | --- |
| R1 | `gruppe_hent(p_gruppe_id uuid) returns table(id uuid, navn text, type text, is_active boolean, created_at timestamptz, updated_at timestamptz)` | grupper |
| R2 | `grupper_liste(p_antal integer default 200, p_efter_navn text default null, p_efter_id uuid default null) returns table(id uuid, navn text, type text, is_active boolean, created_at timestamptz, updated_at timestamptz)`; orden `(navn, id)` | grupper |
| R3 | `gruppe_kontakter_liste(p_gruppe_id uuid, p_antal integer default 200, p_efter_navn text default null, p_efter_id uuid default null) returns table(id uuid, gruppe_id uuid, navn text, email text, telefon text, is_active boolean, anonymized_at timestamptz, created_at timestamptz, updated_at timestamptz)` | grupper |
| R4 | `lokation_status_paa(p_lokation_id uuid, p_dato date default core_identity.dags_dato_utc()) returns text` | lokationer |
| R5 | `lokation_er_bookbar(p_lokation_id uuid, p_dato date default core_identity.dags_dato_utc()) returns boolean` | lokationer |
| R6 | `stand_er_bookbar(p_stand_id uuid, p_dato date default core_identity.dags_dato_utc()) returns boolean` | lokationer |
| R7 | `lokation_dagspris_paa(p_lokation_id uuid, p_dato date default core_identity.dags_dato_utc()) returns numeric` | lokationer |
| R8 | `stand_dagspris_paa(p_stand_id uuid, p_dato date default core_identity.dags_dato_utc()) returns numeric` | lokationer |
| R9 | `lokation_hent(p_lokation_id uuid) returns table(id uuid, navn text, adresse text, type text, dagspris numeric, gruppe_id uuid, hviledage integer, status text, bookbar boolean, anonymized_at timestamptz, created_at timestamptz, updated_at timestamptz)` | lokationer |
| R10 | `lokationer_liste(p_antal integer default 200, p_efter_navn text default null, p_efter_id uuid default null) returns table(id uuid, navn text, adresse text, type text, dagspris numeric, gruppe_id uuid, hviledage integer, status text, created_at timestamptz, updated_at timestamptz)` | lokationer |
| R11 | `stande_liste(p_lokation_id uuid, p_antal integer default 200, p_efter_navn text default null, p_efter_id uuid default null) returns table(id uuid, lokation_id uuid, navn text, dagspris numeric, is_active boolean, created_at timestamptz, updated_at timestamptz)` | lokationer |
| R12 | `lokation_status_historik(p_lokation_id uuid, p_antal integer default 200, p_efter_seq bigint default null) returns table(seq bigint, status text, dvale_ophoer date, sat_kl timestamptz, sat_dato date)` | lokationer |
| R13 | `klient_maa_staa_paa(p_klient_id uuid, p_lokation_id uuid, p_dato date default core_identity.dags_dato_utc()) returns boolean` | lokationer |
| R14 | `lokation_klienter(p_lokation_id uuid, p_dato date default core_identity.dags_dato_utc(), p_antal integer default 200, p_efter_klient_id uuid default null) returns table(klient_id uuid)` | lokationer |
| R15 | `gruppe_koblinger_liste(p_gruppe_id uuid, p_dato date default core_identity.dags_dato_utc(), p_antal integer default 200, p_efter_klient_id uuid default null, p_efter_fra date default null, p_efter_id uuid default null) returns table(id uuid, klient_id uuid, gaeldende_fra date, gaeldende_til date)` | grupper |
| R16 | `lokation_fravalg_liste(p_lokation_id uuid, p_dato date default core_identity.dags_dato_utc(), p_antal integer default 200, p_efter_klient_id uuid default null, p_efter_fra date default null, p_efter_id uuid default null) returns table(id uuid, klient_id uuid, gaeldende_fra date, gaeldende_til date)` | lokationer |
| R17 | `lokation_pending_hent(p_pending_id uuid) returns table(pending_id uuid, change_type text, status text, oensket_fra date, gruppe_id uuid, lokation_id uuid, klient_id uuid, change_reason text, requested_by uuid, approved_by uuid, undo_deadline timestamptz, applied_at timestamptz)` | se nedenfor |

**Opslagene, som trin 24 bruger:**
- »På dato D« er den seneste række med `sat_dato ≤ D`; `seq` afgør, hvis der er flere samme dag. Før oprettelsen er status NULL, bookbar false, ret false og pris NULL.
- R4: dvale med `dvale_ophoer ≤ D` giver `aktiv`. Ophørsdagen er altså bookbar.
- R5 = status `aktiv`. R6 = standen `is_active` og R5 for dens lokation.
- R7: dagens sidste pris gælder dagen. R8: standens egen pris på D, ellers lokationens pris på D.
- R13 er sand, når alle tre gælder på samme D:
  - klienten er koblet på lokationens gruppe på D (gruppen læses i `lokation_gruppe_historik`),
  - klienten er ikke fravalgt på D,
  - status på D er hverken NULL eller `nedlagt`.
- Intervallerne er halvåbne `[fra, til)`. R14 er R13 som mængde. R15/R16 viser rækkerne, der dækker D; deres tre cursor-parametre sættes samlet eller slet ikke.
- R17 giver adgang, når kaldet kommer fra anmoderen, `is_admin()` eller `has_permission(<side for typen>, null, true)`. Kobl og frakobl hører til `grupper`, fravalg og ophæv til `lokationer`. Ellers afvises kaldet med 42501, uden payload. Andre ændringstyper giver `pending findes ikke`. `oensket_fra` er pendingens `effective_from`.

### Interne funktioner (8)

- **I1-I4:** `_apply_gruppe_klient_kobl`, `_apply_gruppe_klient_frakobl`, `_apply_lokation_klient_fravalg`, `_apply_lokation_klient_fravalg_ophaev`, alle `(p_payload jsonb, p_change_id uuid) returns void`. Trinene:
  1. Læs payload. Datoen skal matche `^[0-9]{4}-[0-9]{2}-[0-9]{2}$` og læses med `to_date`; ellers `invalid_payload`.
  2. Er payload-datoen forskellig fra pendingens `effective_from` (sammenlignet som `date`), afvises med `payload_dato_afviger_fra_pending`.
  3. Lås: gruppens række for kobl/frakobl, lokationens række for fravalg/ophæv.
  4. Effektiv dato = `greatest(payload-dato, dags_dato_utc())`.
  5. Alle request-vagter tjekkes igen.
  6. `stork.change_reason` sættes til payloadens årsag.
  7. Ny række med `gaeldende_fra` = effektiv dato, eller den åbne række lukkes med `gaeldende_til` = effektiv dato.

  Fejler et trin, afbrydes apply, og pendingen forbliver `approved` (fundamentets kontrakt).
- **I5** `_anonymiser_gruppe_kontakt_internal(p_kontakt_id uuid, p_reason text)`: kalder `anonymize_generic_apply('gruppe_kontakt', …)`. Derefter sættes `is_active = false` og `udfaset_dato = coalesce(udfaset_dato, dags dato)` med årsag `anonymization: <årsag>`. Kaldes af W17 og af retention-jobbet (`grant execute` til service_role).
- **I6** `_gruppe_kontakt_apply(p_kontakt_id uuid, p_snapshot jsonb, p_reason text)`: replay.
  - Nøglerne er snapshottets nøgler ∪ de kolonner, der nu er `direct`.
  - Strategien tages fra snapshottet, ellers fra den aktive mapping. Mangler begge: P0001 `direct_kolonne_uden_strategi`. En strategi, der ikke er active: P0002 `strategi_ikke_active`. Den gamle værdi bruges aldrig i stedet.
  - Allow-var, `source_type` og `change_reason` sættes før UPDATE.
- **I7** `_anonymiser_lokation_internal(p_lokation_id uuid, p_reason text)`: kalder `anonymize_generic_apply('lokation', …)`. Ingen status-ændring.
- **I8** `_lokation_apply(p_lokation_id uuid, p_snapshot jsonb, p_reason text)`: som I6, for lokationer.

### Værn i `core_compliance`

Ingen af de tre værn har undtagelser, heller ikke for migrationer.

- **`_pii_klassifikation_guard`** er BEFORE INSERT/UPDATE/DELETE på `data_field_definitions`. Alle fire grene afviser med P0001:
  1. DELETE af en `direct`-række: `pii_definition_beskyttet: <s>.<t>.<k>`. Samme besked ved omdøbning af en `direct`-række.
  2. `direct` → lavere: `pii_nedgradering_forbudt: <s>.<t>.<k> (direct -> <ny>)`.
  3. `indirect` på pakkens 9 tabeller: `pii_indirect_uden_anonymiseringsvej: <s>.<t>.<k>`.
  4. `direct` på pakkens 9 tabeller uden for de fem kolonner {`gruppe_kontakter.navn`, `.email`, `.telefon`, `lokationer.navn`, `.adresse`}: `pii_direct_uden_anonymiseringsvej: <s>.<t>.<k>`.
- **`_mapping_daekning_guard`** er BEFORE UPDATE OF `field_strategies` på `anonymization_mappings`, når `old.status` ∈ {tested, approved, active}. Den afviser med P0001 `anonymiseringsdaekning_ufuldstaendig:` + én af tre sager: `<s>.<t>.<k> mangler strategi`, `<s>.<t>.<k> strategi <navn> ikke active` eller `stale noegle <key>`.
- **`_mapping_delta_apply`** (SECDEF) er AFTER UPDATE OF `field_strategies`, når mappingen er active og gælder `gruppe_kontakter` eller `lokationer`.
  - Nye nøgler anonymiseres på de rækker, der allerede er anonymiseret, med årsag `anonymization-delta: <årsag>`. Brugerens årsag genoprettes bagefter.
  - Den skriver ingen `anonymization_state`-række.

**Mapping-seed (begge status `draft`):**
- `gruppe_kontakt` → `gruppe_kontakter` `{"navn":"blank","email":"hash_email","telefon":"blank"}`, check-kolonne `anonymized_at`, `retention_event_column` `udfaset_dato`, I5/I6.
- `lokation` → `lokationer` `{}`, `anonymized_at`, NULL, I7/I8.

Intet seedes som `active`. Strategi-aktivering og mappingens forløb sker gennem fundamentets indgange.

### Fundamentets indgange, som pakken bruger uændret

- `pending_change_approve(uuid)`, `pending_change_undo(uuid)` og `pending_change_apply(uuid)`. Apply er driftsindgangen, og testene kalder den som authenticated gennem API'et.
- `undo_setting_update`, `role_permission_grant_set`, `data_field_definition_upsert` og `data_field_definition_delete`.
- `anonymization_mapping_upsert`, `anonymization_mapping_test_run`, `anonymization_mapping_approve` og `anonymization_mapping_activate`, `anonymization_strategy_activate` og `replay_anonymization`.
- `client_upsert` og `client_set_active`.

Deres afvisninger er fundamentets og står ordret i manifestet. De er holdt mod migrationerne `20260518000004`, `20260607110001`, `20260514190200`, `20260515120000`, `20260515140000` og `20260514160000`.

### Afvisninger: pakkens sager

| Sag (`<fn>: …`) | SQLSTATE | Hvornår |
| --- | --- | --- |
| `permission_denied` | 42501 | første gate i hver indgang |
| `change_reason er paakraevet` | 22023 | tom årsag |
| `<felt> er paakraevet` (`navn`, `foerste_stand_navn`, `gruppe_id`, `lokation_id`, `klient_id`, `stand_id`, `kontakt_id` = parameternavnet uden `p_`) | 22023 | NULL, blank eller mellemrum |
| `ugyldig type` | 22023 | type uden for listen (lokation: også NULL) |
| `dagspris er ugyldig (kraeves, >= 0, hoejst 2 decimaler, < 10000000000)` | 22023 | lokation: NULL, negativ, >2 decimaler, ≥ 10^10; stand: samme, men NULL = arv |
| `<objekt> findes ikke` (`gruppe`, `lokation`, `stand`, `kontakt`, `klient`, `pending`) | P0002 | ukendt id (også `stand_opret` med en stands id) |
| `gruppe_inaktiv` · `klient_inaktiv` | 22023 | forretningsvagt; superadmin er undtaget |
| `gruppe_uaendret` · `kontakt_uaendret` · `stand_uaendret` · `status_uaendret` | 22023 | samme værdi som nu |
| `hviledage skal vaere mindst 1` | 22023 | sat og < 1 |
| `ugyldig status` · `dvale_ophoer kraever status dvale` · `dvale_ophoer skal ligge efter dags dato` | 22023 | W12 |
| `sidste_aktive_stand_kan_ikke_deaktiveres` | P0001 | W11 |
| `lokation_nedlagt` | 22023 | W9, W15, W16, I3, I4, uden undtagelse |
| `klient_ikke_i_gruppen` | 22023 | W15, W16, I3, I4 |
| `kobling_findes_allerede` · `ingen_aaben_kobling` · `fravalg_findes_allerede` · `intet_aabent_fravalg` | 22023 | anmodning og apply |
| `dato_i_fortiden` | 22023 | W13-W16 |
| `dato_foer_start` | 22023 | frakobl/ophæv: dato ≤ den åbne rækkes start (anmodning og apply) |
| `invalid_payload` · `payload_dato_afviger_fra_pending` | 22023 · P0001 | I1-I4 |
| `lokation_anonymiseret_persondata_laast` | 22023 | W6 |
| `kontakt_anonymiseret_opret_ny` | 22023 | W3, W4 |
| `antal skal vaere 1..1000` | 22023 | liste-indgange |
| `direct_kolonne_uden_strategi` · `strategi_ikke_active` | P0001 · P0002 | I6, I8 |

Direkte DML fra en app-rolle rammer privilegielaget: 42501 `permission denied for table <tabel>`. EXECUTE på en intern funktion eller på `anonymize_generic_apply` giver 42501 `permission denied for function <fn>`.

### Audit pr. skrivevej

- **W1-W12, W17, W18:** brugerens årsag står ordret på hver række, transaktionen skriver, også historikrækker fra triggerne. `source_type` er `manual`, og `actor_user_id` er brugeren.
- **W13-W16:** anmodnings-rækken bærer fundamentets label `pending_change_request` (G071). Årsagen står i payload. Gennemførelses-rækkerne bærer brugerens årsag, både relationen og pendingens skift til `applied`.
- **Approve og undo:** labels `pending_change_approve` og `pending_change_undo` (ingen årsagsparameter).
- **Anonymisering:** `anonymization: <årsag>`. Replay: `replay: <årsag>`. Retention-jobbet: `anonymization: retention: <N> dage efter udfaset_dato`. Delta-vejen: `anonymization-delta: <årsag>`.

### Umuligheder pr. negativ i kravet

Hver umulighed bevises stadig med en effekt-test gennem den offentlige indgang.

| K | Negativ | Gjort umulig af | Afvist i indgangen med |
| --- | --- | --- | --- |
| K-1 | lokation uden navn · type uden for listen | NOT NULL + CHECK | `navn er paakraevet` · `ugyldig type` |
| K-1 | lokations-data uden for master-kilden · økonomi på lokationen | ingen anden tabel bærer lokationsfelter; ingen app-DML; ingen FK/kolonne mod `core_money`; typede returns | 42501 · kontrol-testene (manifestet K-1/ac-4) |
| K-1 | ændret pris ændrer fortiden | append-only `pris_historik` (trigger, guard, ingen dato-parameter) | 42501 / `pris_historik_immutabel` |
| K-2 | cykler · under-stande · stand uden lokation | to tabeller; `stande.lokation_id` NOT NULL FK; ingen parent-kolonne eller -parameter | `stand_opret: lokation findes ikke` |
| K-2 | lokation uden stand · stande forsvinder | atomisk W5; vagt for sidste aktive stand under lås; ingen sletning (grant, policy, RPC); FK RESTRICT; nedlæggelse skriver kun et status-skift | `sidste_aktive_stand_kan_ikke_deaktiveres` · 42501 |
| K-2 | to sandheder om pris | NULL = arv; R8 giver altid ét svar | — |
| K-3 | lokation uden gruppe · gruppe som fritekst · gruppe uden navn | NOT NULL FK; uuid-parameter (tekst → 22P02); NOT NULL + CHECK | `gruppe_id er paakraevet` · `gruppe findes ikke` · `navn er paakraevet` |
| K-3 | gruppe med lokationer slettes | ingen sletning (grant, policy, RPC) + FK RESTRICT | 42501 |
| K-4 | status uden for de tre · skift uden årsag · uden om handlingen · overskrevet historik | CHECK; ingen status-kolonne; append-only log + `_historik_immutabel`; ingen app-DML | `ugyldig status` · `change_reason er paakraevet` · 42501 |
| K-4 / K-6 | til-valg på nedlagt · nedlagt lokation med aktive klienter | retten afledes med status-leddet; ingen liste gemmes | `lokation_nedlagt` (også som superadmin) |
| K-5 | »book alligevel« · automatisk hvile uden valg | ingen parameter, indgang eller admin-gren i opslagene; `hviledage` NULL som standard; intet skriver dvale af sig selv | fraværet af parametre + `lokation_er_bookbar` = false |
| K-6 | kobling uden klient/gruppe · dobbelt kobling | NOT NULL FK; partial UNIQUE + EXCLUDE pr. par | `klient_id er paakraevet` · `kobling_findes_allerede` (anmodning og apply under gruppe-lås) |
| K-6 | klient uden for gruppen · slettet/omskrevet historik | retten afledes (ingen række klient × lokation); `_kobling_historik_guard`; ingen app-DML | `klient_ikke_i_gruppen` · 42501 |
| K-7 | uklassificeret kolonne · implicit persondata · nedgradering · sletning som anonymisering | migration-gate STRICT + katalog-kontrol; strict audit-filter (G001); standard `none`/NULL; `_pii_klassifikation_guard`; anonymisering er UPDATE | `pii_…`-afvisningerne ovenfor |
| K-8 | direkte skrivning · ændring uden årsag · rørt audit · pakke-egen rettighedsmekanisme | ingen DML-grants + RLS; `stork_audit`; fundamentets audit-guards; alle indgange gater med `has_permission` | 42501 · `change_reason er paakraevet` |
| K-9 | forbud der kan slås fra · handling der kræver udvikler | forbuddene er constraints og triggere uden flag; alle handlinger er RPC'er til authenticated | — |

### Byggetrin

Numrene er dem, manifestet og testindekset bruger som `effekt_bid`. Migrationerne har præfikset `t10b_`, og byggeren vælger tidsstemplerne efter `20260610190000`. De 12 migrationer er delt i trin 1-5 (§3.8).

1. **Grupper.**
   - 1.0: G001, strict audit-filter.
   - 1.1: `grupper`, `gruppe_kontakter` og `_pii_klassifikation_guard` med klassifikation.
   - 1.2: W1-W4 og R1-R3.
   - 1.3: siden `grupper` med superadmin.
   - 1.4: Codex' `prover.json` køres. Ingen migration.
2. **Lokationer.**
   - 2.1: `dags_dato_utc`, `_stamp_utc` og `_historik_immutabel`; `lokationer`, `stande` og de 3 logs med triggere og klassifikation; R4-R8.
   - 2.2: W5-W11 og R9-R11.
   - 2.3: siden `lokationer` med superadmin.
3. **Status og hvile.** 3.1: W12 og R12.
4. **Klient-koblinger.**
   - 4.1: `gruppe_klient_koblinger`, `lokation_klient_fravalg` og `_kobling_historik_guard` med klassifikation.
   - 4.2: W13-W16, I1-I4 og fundament-udvidelserne (se nedenfor).
   - 4.3: R13-R17.
5. **Anonymisering og hele fladen.**
   - 5.1: I5-I8, mapping-seed, `_mapping_daekning_guard`, `_mapping_delta_apply` og W17/W18, og revoke på `anonymize_generic_apply`.
   - 5.2: ingen ny migration. Hele fladen kaldes som UI-bruger gennem API'et (Codex' samleprøve).

## Eksisterende objekter der ændres (§3.1)

| Objekt (seneste definition) | Hvad ændres | Hvad bevares |
| --- | --- | --- |
| `core_identity.pending_change_apply(uuid)` (`20260518000004:152-218`) | 4 nye grene i CASE: `gruppe_klient_kobl` → I1, `gruppe_klient_frakobl` → I2, `lokation_klient_fravalg` → I3, `lokation_klient_fravalg_ophaev` → I4 | alt andet ordret: signatur, due-gate (`current_date`, G070), label, `else`-grenen, revoke |
| `pending_change_approve(uuid)` · `pending_change_undo(uuid)` (`20260607110001`) | 4 nye grene i side-CASE: kobl/frakobl → `grupper`, fravalg/ophæv → `lokationer` | resten ordret: SECDEF, regel mod selv-godkendelse, action-grenen, labels |
| policy `pending_changes_select` (`20260521100005`) | DROP + CREATE med to nye grene: `action_id is null`, pakkens typer og `has_permission(<side>, null, true)` | alle eksisterende grene ordret |
| `core_identity.undo_settings` | 4 rækker à 24 timer (`on conflict do nothing`) | eksisterende rækker |
| `core_compliance.anonymize_generic_apply(text,uuid,text)` | revoke execute fra public, anon, authenticated | kroppen uændret; SECDEF-indgangene kalder den som ejer |
| `core_compliance.data_field_definitions` | ny trigger `_pii_klassifikation_guard` + pakkens klassifikationsrækker | eksisterende rækker og triggere. Gren 1-2 beskytter også fundamentets `direct`-rækker (fx `clients.name`), gren 3-4 kun pakkens tabeller |
| `core_compliance.anonymization_mappings` | to triggere (dækning og delta) + 2 rækker i `draft` | eksisterende mappings. Dæknings-vagten gælder alle mappings, delta kun pakkens to tabeller |
| `core_compliance.audit_filter_values(text,text,jsonb)` (`20260521000004`), G001 | altid strict: tabel uden klassifikation og ukendt kolonne giver P0001 i stedet for WARNING; `stork.audit_filter_strict` har ingen virkning mere. Migrationen fejler, hvis en tabel med audit-trigger har en kolonne uden klassifikation | hashing af `direct`, specialtilfældet `clients.fields`, NULL-håndteringen, signaturen |
| rettigheds-træet | nye sider og faner (se »Fælles regler«) | ingen eksisterende rækker ændres |
| `scripts/fitness.mjs` | `SECDEF_SANCTIONED` for pakkens SECDEF-funktioner · `IMMUTABLE_GUARDS` og `IMMUTABLE_TABLES_REQUIRE_TRUNCATE_BLOCK` for de 5 historik-tabeller · `T9_RPCS` + `/rpc/gruppe_hent`, `/rpc/lokation_hent` · G006. Filen ligger i fabrikkens zone (`scripts/v5/hooks.mjs`); ændringen laves af fabrikken | alle eksisterende tjek og lister |
| `packages/types/src/database.ts` | regenereres (`pnpm types:generate`) | — |

Alle signaturer på de fire fundament-funktioner bevares med samme argumentnavne og defaults. CASE beholder alle eksisterende grene og `else` (G049, G051). Fundamentets egne tests og de lukkede pakkers tests skal forblive grønne. Bliver de røde, stopper byggeriet (HALT), og der tilføjes ingen undtagelse.

## G/H-opslag

| G/H | Løses-i | Håndtering |
| --- | --- | --- |
| G001 (HØJ) audit-filteret er lempeligt som standard | pakke 1, plan v3.8 | **Tages med**, byggetrin 1.0 (se ovenfor). Mangler en auditeret kolonne klassifikation, vælges der ikke klassifikation i byggeriet; byggeriet stopper (HALT). Den negative test er Codex'; manifestet har i dag ingen post for G001 |
| G006 (MELLEM) fire live-fitness-tjek kan give grønt uden at køre | pakke 1, trin 2 | **Tages med:** `db-rls-policies`, `write-policy-session-var-consistency`, `legacy-is-active-readers` og `postgrest-t9-schema-exposure` får `liveGuard`-adfærd. Manglende token eller API-fejl er rødt i CI og springes over lokalt. Laves af fabrikken (`scripts/` er dens zone) |
| G049 (MELLEM) mønstret for at udvide dispatcheren er ikke skrevet ned | næste pakke der udvider dispatcheren | **Tages med for pakkens egne ændringer:** signatur, alle eksisterende grene og `else` bevares (§3.1-tabellen). Tjeklisten i §10.2 er en workflow-ændring og venter til mellem pakker |
| G051 (LAV) funktioner redefineret uden signatur-diff | næste pakke der ændrer funktioner | **Tages med:** de fire fundament-funktioner bevarer signatur og defaults; gennemgangen tjekker linje for linje (§3.1). Fitness-tjekket i G051's plan ligger i `scripts/` og er udskudt |
| G083 (LAV) permission-matrixen er forældet | næste pakke der ændrer rettigheder | **Tages med ved trin 4:** `docs/teknisk/permission-matrix.md` regenereres (repo-docs rettes ved trin 4) |
| G077 (LAV) testbibliotekets datoforløb | pakke 1, trin 3 | **Tages med i trin 3 af Codex.** Planens datoforløb kræver databasens styrede klokke |
| G067 (MELLEM) apply har ingen rettigheds-gate | næste pakke der ændrer pending-fundamentet | **Udskudt:** pakken udvider kun dispatcheren. En gate ændrer reglen for alle ændringstyper og er en beslutning om pending-modellen. Pakkens typer tåler det: apply kræver godkendt og forfalden, og alle vagter tjekkes igen |
| G068 (MELLEM) ingen »afvist«-status | som G067 | **Udskudt**, samme grund. En apply, der fejler, lader pendingen stå som `approved` (orientering) |
| G070 (LAV) due-gaten bruger `current_date` | systemets dag afgøres ved `plan ok`; rettelsen ved næste pending-pakke | **Afgjort her:** UTC (afvigelse A7). Rettelsen i fundamentet er udskudt, som G070 selv siger. Pakkens egne datoer er robuste (effektiv dato = max(ønsket dato, UTC-dagen)), så en for tidlig apply ikke flytter en ret i tid |
| G071 (LAV) `pending_change_request` overskriver årsagen | som G067 | **Udskudt:** testene forventer labelen på anmodnings-rækken. Årsagen står i payload og på gennemførelses-rækkerne |
| G069 (MELLEM) retention kun `event_based` · G081 (LAV) stille ikke-afvisninger | før cutover | **Udskudt** (fundament). Pakken leverer `udfaset_dato`, så `event_based` virker for kontaktpersoner (orientering) |
| G072 (LAV) `gdpr_responsible` er ikke koblet på | pakken der ændrer strategierne | **Rammer ikke:** pakken bruger strategierne, men ændrer dem ikke |
| G082 (LAV) dynamisk DDL / jsonb med persondata | pakken der indfører næste af dem | **Rammer ikke:** ingen jsonb-persondata (faste kolonner) og ingen dynamisk DDL. Delta-triggeren bruger dynamisk DML |
| H032 Codex-opsætning | før Codex skriver testene i pakke 1, trin 3 | **Uden for planen:** fabrikken før trin 3 |

Ingen andre åbne G- eller H-poster har en Løses-i eller deadline, der rammer pakkens scope.

## Destruktive drops (§3.9)

Ingen: ingen DROP TABLE/COLUMN, TRUNCATE eller DELETE. Den eneste DROP er policy'en `pending_changes_select`, som genskabes i samme migration med alle eksisterende grene. Ingen data berøres.

## Afvigelser fra masterplanen

| # | Masterplan-afsnit | Planen gør | Begrundelse |
| --- | --- | --- | --- |
| A1 | §1.12 Lokations-entitet: `parent_location_id`-selvreference + cycle-detection-trigger | stande i egen tabel `stande` (FK `lokation_id`), ingen parent-kolonne | M-18 (standen er bladet). Cykler og under-stande bliver umulige i stedet for at skulle opdages. Del B B1 |
| A2 | §1.12 status (livscyklus) på lokationen; værdierne »afgøres ved bygning« (Appendix B) | aktiv/dvale/nedlagt gemmes som skift i `lokation_status_skift`; status på en dato afledes; ingen status-kolonne | M-25.1, M-28, K-4 ac 4 (historikken kan ikke overskrives). Én sandhed. B1, B5 |
| A3 | §1.12 Klient-tilladelser: relations-tabel klient × lokation × from/to | kobling på gruppen + fravalg pr. lokation, begge daterede; retten afledes pr. dato (`klient_maa_staa_paa`) | Mathias' valg i kravet (K-6, M-17, M-36). B1 |
| A4 | §1.12 Cooldown: »cooldown-konfiguration jsonb« / »konfig-tabel« | `lokationer.hviledage` (heltal, NULL = intet valg); hvile = dvale med `dvale_ophoer` | M-21, M-25.2, K-5 (én model-ting). B1, B2 |
| A5 | §1.12 Leverandører: egen master-data-entitet med type | gruppe = leverandør: én entitet `grupper` med valgfri type; lokationens leverandør-FK er `gruppe_id` | Kravet l.11/l.181 lægger valget i planen. Ejer, type og klient-kobling gælder gruppen, og en anden leverandør-entitet findes ikke. B1 variant »én entitet«, B3, B4 |
| A6 | §4 trin 10b: »+ migration: udtræks-SQL for lokations-historik hvis relevant« | ingen migration | M-25.4 »dette importeres senere«; kravet IKKE i scope. B4, B5 |
| A7 | §2.3 »lagring UTC, render Europe/Copenhagen« og forretningsforståelse §16 (tidszone-drift) → Del C C8 | systemets dag = UTC-dagen for alle pakkens datoer (status, pris, ejer, koblinger, fristens dato) | én fast dag, uafhængig af sessionen; testene er skrevet på UTC-dagen. Ved stop: dansk kalenderdag (Europe/Copenhagen) i `dags_dato_utc`, `_stamp_utc` og opslagene. B1 V-2 |

## Valg Mathias kan mærke i forretningen

- **D-1, D-8** Ny lokation er aktiv fra oprettelsen. Type er krævet (`andet` findes), adresse valgfri, dagspris krævet (0 kr. er en pris); en stand uden egen pris følger lokationens.
- **S-1** Gruppen har faste felter: navn, type (valgfri) og kontaktpersoner (navn, e-mail, telefon). Et nyt felt, fx CVR, kræver en migration. Kravets udgangspunkt var »som for klienter«, men et felt-register på gruppen ville kræve en anonymiseringsvej for persondata i jsonb, som fundamentet ikke har (G082).
- **D-11** Persondata: I UI kan en lokations navn og adresse markeres som persondata og kan så altid anonymiseres, også på lokationer, der allerede er anonymiseret. Type, tal, datoer og gruppens egne felter kan ikke markeres. Gruppens persondata er kontaktpersonerne.
- **D-5, B-5** En stand tages ud af brug, den slettes ikke. Den sidste stand i brug kan ikke tages ud af brug. En nedlagt lokation får først nye stande, når den er genåbnet.
- **SM-2, SM-3** En gruppe taget ud af brug kan ikke få nye lokationer, gruppeskift eller klient-koblinger; det bestående består. En inaktiv klient kan ikke kobles på. Superadmin er undtaget i begge.
- **D-4** Gruppeskift sker straks med rettighed og årsag. Klienternes ret følger den nye gruppe fra samme dag.
- **V10, B-1** Kobling, frakobling, fravalg og ophævelse går gennem godkendelse og en fortrydelsesfrist på 24 timer, som kan ændres i UI (0-30 døgn). Ændringen gælder fra den ønskede dato, eller fra den dag den gennemføres, hvis det er senere. Aldrig bagud.
- **B-4, B-2, D-6** Et fravalg kræver, at klienten er koblet på gruppen på datoen. Et fravalg består gennem nedlæggelse og genåbning. En kobling og et fravalg varer mindst én dag.
- **D-7** Dvale »til 5. oktober« betyder bookbar igen 5. oktober.
- **D-9** Godkenderen skriver ingen ny årsag; anmoderens årsag følger ændringen.
- **D-3** Grupper og lokationer ligger under rettigheds-området »organisation«. Adgang til siden giver adgang til alle grupper hhv. lokationer; der er ingen afgrænsning pr. team.

## Orienteringer

- **Tidszone:** systemets dag er UTC (A7).
- **Persondata:**
  - Kun kontaktpersonernes navn, e-mail og telefon er persondata ved levering. Alt andet er `none`, uden opbevaringsregel (kravets standard).
  - Audit-loggen afviser nu skrivninger på felter uden klassifikation (G001).
- **Kendte grænser i fundamentet (uændret):**
  - En godkendt ændring, der ikke kan gennemføres, bliver stående som »godkendt« (G068).
  - Tidsregler for anonymisering virker kun som »N dage efter at en kontaktperson er taget ud af brug« (G069). Lokationer kan ikke få en tidsregel.
  - Enhver indlogget kan udløse gennemførelsen af en godkendt og forfalden ændring (G067).

## Flyttet fra kravet

| Post i kravets »Plan-fase-afgørelser« | Afgjort | Inden for kravets ramme fordi |
| --- | --- | --- |
| Mindst én stand ved oprettelse og sletning (K-2) | W5 opretter lokation og første stand i én transaktion. Stande kan ikke slettes. Den sidste aktive stand kan ikke deaktiveres (lås pr. lokation) | M-17 ordret; under-stande findes ikke (M-18) |
| Gruppe-arv på stand (K-2/K-3) | afledt gennem lokationen; standen har ingen gruppe | ejerkæden gruppe → lokation → stand (M-18) |
| Effektiv ret afledt eller gemt (K-6) | afledt pr. dato (R13) | historikken består (M-13), én sandhed |
| Fravalg gennem nedlæggelse og genåbning (K-6) | fravalget består | genåbning arver gruppens klienter (M-19); fravalget er lokationens egen række |
| Fravalgs- og frakoblings-handlinger på nedlagt lokation (default: afvises) | fravalg og ophævelse på en nedlagt lokation afvises uden undtagelse. Frakobling fra gruppen er en gruppe-handling og afvises aldrig | kravets default; M-12 (altid kunne kobles fra) |
| Gruppe og leverandør: én eller to (K-3) | én entitet (A5) | kravet l.11 og l.181 |
| Type krævet ved oprettelse (default: valgfri, krævet før rabat i trin 29) | valgfri; krav før rabat-brug hører til trin 29 | kravets default |
| En gruppe tages ud af brug (K-3) | `is_active` via W2. Nyt på en inaktiv gruppe afvises (superadmin er undtaget). Sletning er umulig | K-3 ac 5, princip 9 |
| Anonymiseringsvej for kontakt-felterne (K-7) | rigtige kolonner i `gruppe_kontakter` + mapping `gruppe_kontakt` | K-7 ac 4. Jsonb gennemgås ikke af den generiske anonymisering |
| Valuta, enhed og tom pris (K-1) | `numeric(12,2)`, DKK pr. dag. Lokationens pris er krævet, standens tomme pris = arv, 0 er en pris | K-1, K-2 ac 2 |
| Gruppens feltliste fast eller udvidelig, CVR m.v. (default: som for klienter) | fast (S-1, valg på ½-siden) | kravet lægger udformningen i planen; begrundelse under S-1 |
| Seeding ud over superadmin (K-8) | ingen | K-8 ac 5 (øvrige tildelinger er UI-drift) |
| Fortrydelse: ændringstyper og standarder (K-6/K-8) | fire typer: `gruppe_klient_kobl`, `gruppe_klient_frakobl`, `lokation_klient_fravalg`, `lokation_klient_fravalg_ophaev`; 24 timer hver, seedet eksplicit | K-6 ac 10; fristen styres i UI |
| Dvale og hvile: én eller to model-ting (K-4/K-5) | én: hvile = dvale med `dvale_ophoer`, afledt i opslaget uden cron. Stop før tid = W12 med `aktiv` | M-27b: samme oplevelse, ingen omgåelse |
| Direkte eller med godkendelse pr. handlingstype (K-8) | godkendelse + fortrydelse for de fire klient-handlinger. Direkte (rettighed + årsag + audit, straks) for stamdata, status, hviledage og gruppeskift | K-6 ac 10 (daterede ændringer); K-5 ac 3 (M-87 »Straks«) |

Kravets øvrige plan-mekanik (K-6: gældende dato og versionering) er afgjort således: kobling og fravalg er daterede rækker `[gaeldende_fra, gaeldende_til)`, og den effektive dato er den seneste af den ønskede dato og gennemførelsesdagen (B-1).

## Mathias' ½ side

**Afvigelser fra masterplanen** (rettes i masterplanen med `slut ok`):
1. Stande er egne rækker under lokationen, så under-stande ikke kan opstå.
2. Aktiv, dvale og nedlagt gemmes som dateret historik.
3. Klienter kobles på gruppen og fravælges pr. lokation (dit valg i kravet), ikke en liste klient × lokation.
4. Hvile er antal hviledage på lokationen; selve hvilen er dvale med slutdato.
5. Gruppe og leverandør er én ting: gruppen.
6. Migration fra 1.0 er udskudt (M-25).
7. **Systemets dag følger UTC.** Den skifter kl. 01 om vinteren og kl. 02 om sommeren, så et skift kl. 00.30 dateres dagen før. Dine dokumenter peger på dansk kalenderdag. Siger du stop, bliver det dansk kalenderdag.

**Valg du kan mærke:**
- En ny lokation er aktiv fra start. Type og dagspris er krævet (0 kr. er en pris), adresse er valgfri. En stand uden egen pris følger lokationens.
- En gruppe har faste felter: navn, type (valgfri) og kontaktpersoner. Et nyt felt, fx CVR, kræver en udvikler. Kravets udgangspunkt var »som for klienter«.
- En lokations navn og adresse kan markeres som persondata i UI og kan så altid anonymiseres. Andre felter på lokation og gruppe kan ikke.
- En stand slettes aldrig, og den sidste i brug kan ikke tages ud af brug. En nedlagt lokation får først nye stande efter genåbning.
- En gruppe taget ud af brug får ingen nye lokationer, gruppeskift eller klienter, og en inaktiv klient kobles ikke på. Superadmin kan alligevel.
- Gruppeskift sker straks, og klienternes ret følger den nye gruppe fra samme dag.
- Kobling, frakobling og fravalg har 24 timers fortrydelsesfrist, som kan ændres i UI. Ønskes Tryg frakoblet Coop fra 1/10, men gennemføres det 4/10, gælder det fra 4/10. Intet ændres bagud.
- Et fravalg kræver, at klienten er koblet på gruppen på datoen, og det består gennem nedlæggelse. En kobling varer mindst én dag.
- Dvale »til 5. oktober« betyder bookbar igen 5. oktober.
- Den, der godkender, skriver ingen ny årsag; anmoderens årsag følger ændringen.
- Adgang til siden for lokationer eller grupper giver adgang til dem alle.

**Orienteringer:** Ved levering er kun kontaktpersonernes navn, e-mail og telefon persondata, og loggen afviser felter uden klassifikation. Tre grænser i fundamentet ændres ikke af pakken. En godkendt ændring, der ikke kan gennemføres, står som »godkendt«. En tidsregel for anonymisering virker kun som »N dage efter at en kontaktperson er taget ud af brug«. Enhver indlogget kan sætte en godkendt, forfalden ændring i gang.
