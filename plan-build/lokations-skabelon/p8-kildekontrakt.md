# p8-kildekontrakt — lokations-skabelon · FA-5 held-out-kildekontrakt (A2-14)

Committet af driveren FØR plan-lås (plan v3 §0.1 FA-5 · P-8 §1.1-§1.2 · T:34 · T:42-56 · T:238). Hash-bundet: planen
refererer denne fil ved sti + blob-OID; de maskinlæsbare dele ligger i `p8-kilde.json` (fabrik-armens skema) og
`p8-kilde-scope.sql` (deterministisk definition — dens sha256 er kontraktens kildehash). Ingen credentials i nogen af
filerne; forbindelsen kommer fra CI-runnerens miljø (C4). Skrevet 2026-09-10 af driver-10b (session de4474).

## (1) Systemidentitet for driftskilden

- Art: `supabase-postgres` · projekt-ref `imtxvrymaqbgcvsarlib` (fra repoets `supabase/config.toml`, ikke hemmelig) ·
  host-ref `imtxvrymaqbgcvsarlib.supabase.co` · database `postgres`.
- Kun ÉN eksisterende systemgrænse — ingen ny tenant-grænse opfindes (T:44). Kilden er det virkelige system, ikke en
  kopi. **Identitet ≠ adgang:** om slutprøven må LÆSE fra dette system i CI (med en dedikeret read-only rolle uden
  write-grants) eller skal læse fra et dedikeret held-out-projekt seedet fra det, er Mathias' beslutning (data/risiko) og
  forelægges særskilt med denne navngivne kilde, de konkrete populationer nedenfor og den ønskede læseadgang (devil-krav
  10/9: ikke som abstrakt teknisk valg). Indtil da: default = read-only-rolle mod dette projekt, `skriv: false`
  (`p8-kilde.json.adgang`).

## (2) Scope (hele kildens eksisterende population — ingen rækkefilter)

`core_identity.clients` · `public.org_nodes` + `public.org_node_versions` · `public.client_node_placements` ·
`public.employees` + `public.employee_node_placements` + referentiel lukning (roller · grants/legacy-grants · permission
area/page/tab/action · `employee_active_config` · relevante klassifikationer/feltdefinitioner inkl. inaktive ·
nødvendige pending-/undo-/anonymiseringsmetadata) — P-8 §1.2 (T:46-52). Udtræksregler pr. tabel står i
`p8-kilde-scope.sql` del 1. Pakkens egne objekter (lokationer · stande · grupper · koblinger · fravalg · historik ·
pending) er IKKE kilde: de skabes af det byggede produkt under slutprøven (P-8 §1.1 pkt. 2).

## (3) Projektion (deklarerede kolonner + navngivne udeladelser med før-build-begrundelse)

Kolonner pr. tabel og udeladelser står i `p8-kilde-scope.sql` del 1 (kolonnerne `kolonner_inkluderet` ·
`kolonner_udeladt` · `begrundelse_udeladt`). Udeladt før build (T:56): auth-hemmeligheder, password-hashes, tokens,
sessions, logo-binary (kun tilstedeværelse/form registreres); persondata-felter der ikke behøves for kædens negativer
registreres kun som til stede/tom. Rækker udelades aldrig. Mekanisk kontrol af den observerede kolonnemængde:
`p8-kilde-scope.sql` del 2 (pg_catalog, fast sortering).

## (4) Isoleret måltarget

Eksplicit CI-projekt/DB-identitet — aldrig runnerens project-ref-default (T:238). Udpeges af fabrik-armen (C4) som
`p8-kilde.json.maaltarget` og bindes FØR build; indtil da står feltet som `<udfyldes af fabrik-armen/C4>` og er en
deklareret åben binding (blokerer plan-lås jf. plan v3 BV-5? — nej: plan-lås kræver kontraktens FELTER navngivet;
måltargetets identitet kræves før Fase 5's fetch, se P-8 §1.2 »isoleret CI-miljø«).

## (5) Bindes EFTER build (P-8 §1.3, T:60-69)

Snapshot-tidspunkt · de konkrete rækker · `raw_source_digest` · `anonymized_snapshot_digest` · `run_id` og `k_run`
(frisk hemmelig nøgle fra betroet CI-jobidentitet). Seed = HMAC-SHA256(k_run, canonical([»P8-selection-v1«, run_id,
build_oid, build_proof_digest, spec_blob_oid])). Intet af dette kan vælges af byggeren.

## Syntetiske fixtures

Bid 1-5's egne testdata er eksplicit IKKE held-out (`canary`/`mutant`-mærkede pakkeobjekter, T:36). Kun populationen i (2)
er reel data.

## Bindinger

- `p8-kilde-scope.sql` (denne mappe) — sha256 `f3347b82df20c528637e11473871072e61d4d8c00ac9678fee8627165c46fd9b`
  (= `p8-kilde.json.scope_definition_sha256`; ændres filen, ændres hashen og kontrakten er ny).
- `p8-kilde.json` (denne mappe) — maskinlæsbar form (fabrik-armens skema v1); binder krav `9402164d`, P-8 `4af07ef4` og
  plan v3 ved blob.
- krav `docs/sandhed/krav/lokations-skabelon-krav.md` @ `9402164d87a35fb939661058bea77c1a052493d0` · P-8
  `p8-slutproeve-spec.md` @ `4af07ef4164882ca54643e79df3554c0bf22b0e4`.
- Held-out-fetch (Fase 5) genlæser scope-definitionen fra det navngivne system og sammenligner mod sha256; afvigelse =
  rød (drift i kilden). Manifestet (`forventnings-manifest.json`) kan senere path-binde `bindings.p8_kilde` (C1-r2).
