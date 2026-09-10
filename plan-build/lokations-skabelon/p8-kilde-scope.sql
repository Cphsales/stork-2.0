-- p8-kilde-scope.sql — lokations-skabelon · FA-5 held-out-kildekontrakt (A2-14 · P-8 §1.1-§1.2)
-- DETERMINISTISK definition af hvad der udgør kilden for slutprøvens held-out-fetch (Fase 5, EFTER build).
-- Ingen tidsstempler, ingen tilfældighed, fast sortering. sha256 af DENNE fil = p8-kilde.json.scope_definition_sha256.
-- Held-out-fetch (CI, C4) genlæser objekt-/kolonnemængden fra det navngivne system og sammenligner mod hashen;
-- afvigelse = rød (drift i KILDEN, ikke i buildet). Ingen credentials her; forbindelse fra CI-runnerens miljø.
-- Systemidentitet: supabase-postgres · projekt_ref imtxvrymaqbgcvsarlib · database postgres (se p8-kilde.json).
--
-- SCOPE (P-8 §1.2 · plan v3 §0.1 FA-5 pkt. 2): hele kildens eksisterende population — ALLE rækker, ingen rækkefilter.
--   Bundet systemgrænse = det ene eksisterende projekt; ingen ny tenant-grænse opfindes (T:44).
-- PROJEKTION (P-8 §1.2 · FA-5 pkt. 3): deklarerede kolonner pr. tabel; navngivne udeladelser med før-build-begrundelse.
-- Pakkens EGNE objekter (lokationer · stande · grupper · koblinger · fravalg · historik · pending) er IKKE kilde —
--   de skabes af det byggede produkt under slutprøven (P-8 §1.1 pkt. 2) og er derfor ikke i scope her.
-- Syntetiske bid-fixtures (Bid 1-5's testdata) er eksplicit IKKE held-out (canary/mutant-mærkede pakkeobjekter, T:36).

-- 1) Population og projektion (skema-uafhængig deklaration; kolonnelisten er kontrakten)
--    Udtræksregel pr. tabel: ALLE rækker (også inaktive · lukkede · fremtidige · uden placering/rolle · anonymiserede).
with scope(ordinal, relation, udtraeksregel, kolonner_inkluderet, kolonner_udeladt, begrundelse_udeladt) as (
  values
  (1, 'core_identity.clients',
      'alle rækker i det bundne scope, også inaktive og uden org-placering; ingen filtrering på navn, felt-gyldighed, logo, aktualitet eller tidligere testresultat',
      'id, name, is_active, fields, org_node_id (hvis kolonnen findes), created_at, updated_at, anonymized_at (hvis kolonnen findes)',
      'logo (binærindhold — kun tilstedeværelse/form registreres), kontaktfelter der ifølge data_field_definitions er persondata registreres kun som til stede/tom',
      'P-8 §1.2: auth-hemmeligheder, password-hashes, tokens, sessions og logo-binary hentes ikke; billedfladen er disponeret uden for kravet'),
  (2, 'public.org_nodes',
      'alle identiteter, også lukkede og uden aktuel version/placering',
      'id, node_type, created_at',
      '-', '-'),
  (3, 'public.org_node_versions',
      'alle versioner, også lukkede, fremtidige og uden aktuel placering',
      'id, node_id, parent_node_id, name, is_active, effective_from, effective_to, created_at',
      '-', '-'),
  (4, 'public.client_node_placements',
      'alle historiske, aktuelle og fremtidige placeringer; ingen effective_to IS NULL-begrænsning',
      'id, client_id, node_id, effective_from, effective_to, created_at',
      '-', '-'),
  (5, 'public.employees',
      'alle employees og alle placeringer, også uden auth_user_id, uden rolle/placering, fratrådte og anonymiserede; intet filter gennem current_employee_id()',
      'id, auth_user_id (kun tilstedeværelse: null/ikke-null), role_id, is_active, employed_from, employed_to, anonymized_at, created_at',
      'email, name, telefon (persondata — registreres kun som til stede/tom), auth-relaterede felter ud over tilstedeværelse',
      'P-8 §1.2: auth-hemmeligheder og persondata uden nødvendighed for kædens negativer udelades; udeladelsen er navngivet før build'),
  (6, 'public.employee_node_placements',
      'alle placeringer, også lukkede og fremtidige',
      'id, employee_id, node_id, effective_from, effective_to, created_at',
      '-', '-'),
  (7, 'referentiel lukning (P-8 §1.2 »Afhængigheder«)',
      'roller (roles), grants (role_permissions, legacy-grants), permission area/page/tab/action, employee_active_config, relevante klassifikationer og feltdefinitioner (core_compliance.data_field_definitions — også inaktive), nødvendige pending-/undo-/anonymiseringsmetadata; alle definitioner for indlæste felter',
      'alle kolonner der kræves for at ingen indlæst reference bliver forældreløs',
      'hemmeligheder/tokens i evt. konfigurationsrækker',
      'P-8 §1.2: referentiel lukning uden forældreløse referencer; hemmeligheder aldrig')
)
select ordinal, relation, udtraeksregel, kolonner_inkluderet, kolonner_udeladt, begrundelse_udeladt
from scope
order by ordinal;

-- 2) Mekanisk kontrol ved fetch (CI kører denne mod kilden med read-only-rollen og sammenligner mod
--    p8-kilde.json.scope_definition_sha256 + den observerede kolonnemængde; fast sortering).
select n.nspname as skema, c.relname as relation, a.attname as kolonne, format_type(a.atttypid, a.atttypmod) as type
from pg_catalog.pg_class c
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
join pg_catalog.pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
where c.relkind in ('r', 'p')
  and (n.nspname, c.relname) in (
    ('core_identity', 'clients'),
    ('public', 'org_nodes'),
    ('public', 'org_node_versions'),
    ('public', 'client_node_placements'),
    ('public', 'employees'),
    ('public', 'employee_node_placements')
  )
order by n.nspname, c.relname, a.attnum;

-- 3) Isoleret måltarget (FA-5 pkt. 4) og efter-build-bindinger (FA-5 pkt. 5) står i p8-kilde.json; snapshot-tidspunkt,
--    konkrete rækker, raw_source_digest, anonymized_snapshot_digest og run_id/k_run bindes EFTER build af CI (P-8 §1.3).
