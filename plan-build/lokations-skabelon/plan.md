# lokations-skabelon — plan (v2 · krav_oid 9402164d · recon2_oid 2bdbb122 · p8_oid 4af07ef4 · killlist_oid 13b78392 · forventningsliste_oid 2200b76e · status UDKAST)

## Formål — hvad pakken leverer

Lokations-skabelonen: fysiske lokationer med stande (placements), grupper (ejere), klient-tilladelser (hvilke klienter må stå hvor), status-livscyklus og hvile-regler som central master-data — UI-styret, auditeret og klar til at bære bookinger og resten af FM-kæden (trin 24-29) uden om-design. Fundamentet for hele FM-grenen.

*(Formålsblokken er byte-identisk med kravets Formål — governance-check kræver identisk formålsblok på tværs af krav/plan/status; `scripts/governance-check.mjs:273-326 @ f3012195`.)*

## 0. Input-verifikation & bindinger

Denne plan er **v2** — plan v1 (`plan.md` @ blob `423d9b20e20d52c273572473a5808c5f6ff1415e`, commit ec4a3d9) foldet sammen med alle 46 fund (angreb A-1..A-15 · fresh-eyes FUND-1..5 · P-4 F01-F16/U01-U10), Codex' blinde kill-list og den låste forventningsliste. Ingen afgørelse fra v1 (V1-V13, S-1..S-16) er ændret tavst — hver ændring står i §11 (ændringslog) med fund-id; fold-ind-rapporten (`fold-ind-rapport-r2.md`) bærer tilstanden pr. fund.

- **Pinned commit (arkiv, uden `.git`):** `d7972a136d2252ceaca4931c73a1209c5463eed0`. Alle bindinger nedenfor er verificeret i dette workdir med `git hash-object <fil>` (blob-OID = samme værdi som `git rev-parse <commit>:<fil>`).
- **KRAV (immutabelt, gate-åbent — planens ENESTE sandhedskilde for HVAD):** `docs/sandhed/krav/lokations-skabelon-krav.md` @ `9402164d87a35fb939661058bea77c1a052493d0` — læst i fuld længde (426 fysiske linjer). K-1..K-9 inkl. alle negativer og strukturforbud forstået; `K:<linje>` nedenfor = linje i denne blob.
- **recon-2:** `plan-build/lokations-skabelon/recon2.md` @ `2bdbb122158b6f8c72fc942b8de28e679742b4aa` (recon-Code §1-3 + recon-Codex R2-K1..K9/P01-P14/E001-E209, evidensregister) · **mutationsbilag:** `recon/recon-2-bilag.md` @ `6e569779353ea1d0a2bf747ce6eda6509de1aea0` (frø, ikke krav-føde; `B:<linje>`).
- **P-8 slutprøve-spec (Codex, M-35):** `plan-build/lokations-skabelon/p8-slutproeve-spec.md` @ `4af07ef4164882ca54643e79df3554c0bf22b0e4` — OPTAGET i denne plan (A-13 · U01): matrixen bærer chain-step C0-C10 og canary N1-N9 pr. ac (§1); overdragelser N2-B/N4-B/N5-B/N6-B (§9); fabrik-afhængigheder (§0.1). `T:<linje>` = linje i P-8-blobben.
- **Codex' blinde kill-list (B1):** `plan-build/lokations-skabelon/kill-list-udkast.md` @ `13b783927f4fed107caa0e849e65499fd3291b61` — **kill-list-autoritet**. Hvert `Tn.m`/`Sn.m` er disponeret i §1 (instansieret · ikke-instansieret m. kilde-/signaturbevis · redundant m. bærende værn navngivet). Plan v1's kill-list-UDKAST er kun sammenligningsgrundlag og gengives ikke.
- **Forventningsliste (B2, LÅST):** `plan-build/lokations-skabelon/forventningsliste-udkast.md` @ `2200b76e29b52f7084c0bfe003c0a2e8121c2346` — matrixen (§1) læses 1:1 mod den: ID-regler §5 pkt. 6 (`K-n/ac-m` · `K-n/S` · `K-n/ac-m/neg-k`), bevisformer UT/FS/MH/SA, effekt-bid, chain-step, canary. K-9 »1+2« er splittet i `K-9/ac-1` + `K-9/ac-2`; alias-ac'er (K-6/ac-4 = K-3/ac-4 · K-6/ac-5 = K-3/ac-6 · K-6/ac-9 = K-4/ac-9 · K-1/ac-5 = K-9/ac-1 · K-5/ac-4 = K-9/ac-1) har ÉN kanonisk definition og en henvisning fra den anden (§0.2).
- **Adapter-krav-liste (B2-dom, C1-input):** `provenance/b2-adapter-tjek.leverance.md` @ `460a9b26db03f88ba148c42daaaf525e1120db5a` — dens tabel 2 »MANGLER KILDE«-poster er låst her til konkret kode/sted/tilstand (§0.2 afvisnings-katalog + §1).
- **Ordbog:** `plan-build/lokations-skabelon/ordbog.md` @ `bcab6b4ed9c9c0fe21f13c70d8e1d47a2afd9fef` (de **seks** plan-fase-entries er committet — §5). **Ledger:** `plan-build/lokations-skabelon/mathias-ord.md` @ `14722b4c17fba1011709525ef4a06a7cabe2cfa8` (M-1..M-41 læst; M-39/M-40/M-41 er workflow-domme uden krav-substans — M-40 D10/D11/D12/D13 + E20 og M-41 er dog BINDENDE for denne plans form). **Implplan:** `docs/workflow-faerdiggoerelse/workflow-implementeringsplan.md` @ `8fab089deb7798e528140c559ff04988a69ebb77` (Fase 3 pkt. 2-4 · 2.C D10/D11/D12).
- **Kilde-notation:** `path:linjer @ blob8` — de første 8 tegn af blob-OID'et (F15: v1 skrev »blob12« men brugte 8; her deklareret 8). Alle kode-ankre er GENLÆST i dette workdir mod recon-2's evidensregister; ingen hentet fra hukommelse. Hvor et anker afviger fra v1 er det rettet (F09 · F10 · F15 · F16 — se §11).
- **Seneste gældende definitioner (verificeret i migrations-kæden):** `pending_change_apply` = `20260518000004 @ f49e7d5b:152-218` · `pending_change_approve`/`pending_change_undo` = `20260607110001 @ ae336ee6:8-120 / 122-183` · `pending_changes_select`-policy = `20260521100005 @ 4df2fca6:17-60` · `has_permission` = `20260518000010 @ 07ec8a8e:15-85` (tab→page→area→legacy; læser IKKE visibility) · grant-unikindex 5-kolonne inkl. `action_id` = `20260521100003 @ 5a09930f:86-93` · `anonymize_generic_apply` = `20260515140000 @ 6083fecd:22-127` · `replay_anonymization` = `20260515130000 @ 6f0e1db3:239-300` · `is_admin()` = `20260514180300 @ 776b884b:131-146` · app-DML-revoke = `20260607110004 @ 408a96ff:11-12` (engangs-REVOKE på daværende tabeller — IKKE en regel der ophæver fremtidige GRANTs, A-1) · default-privileges = `20260514120001 @ c6fb84d2:33-41` (tabeller: ingen; funktioner: EXECUTE til authenticated som DEFAULT — derfor eksplicit revoke på hver intern funktion, U02). Byggeren udvider DISSE definitioner, aldrig ældre versioner.
- Web ikke brugt. Ingen krav-ændring foretaget eller foreslået (§10).

### 0.1 Fabrik-afhængigheder (P-8-indbinding — hvad build IKKE kan levere selv)

P-8 T:24 kræver at planen binder matrixen `K/ac → bid → chain-step → signatur → observation → negativ → mutant` (§1 gør det) OG at kædens adaptere har et leverancested (A-13). De er FABRIKKENS bord (driver/fabrik-arm), ikke produkt-kode, og planen binder dem som forudsætninger med afslutningsgate:

| afhængighed | hvad | ejer · gate | binding i denne plan |
| --- | --- | --- | --- |
| **FA-1 måle-adapter (C1)** | udtrykker UT/FS/MH/SA særskilt, `reject_contract_ref` pr. negativ, før/efter-observation, cases/obligation_refs, D10/D12-kontrakt (adapter-krav-listen tabel 1 + D10/D12-kontrakten) | fabrik-arm · **Trin C: Codex-dom »adapter-PASS« FØR Bid 1 bygges** (forventningsliste §5 pkt. 1) | §1's negativ-ID'er + §0.2's afvisnings-katalog ER adapterens reject-kontrakt-kilde |
| **FA-2 to-sessions-harness** | ≥2 uafhængige DB-forbindelser, dokumenteret barriere (pg_locks/wait_event-observation), committed slut-observation | fabrik-arm · **blokerende for »done« på Bid 2 og Bid 4** (A-12 · F12 — ingen residualvej) | K-2/ac-6/SA-1 · K-6/ac-2/SA-1 (§1) |
| **FA-3 clock-/job-driver** | styrer CI-databasens tid og cron-kald (`pending_change_apply` som normal driftsindgang) uden at skrive pending-status/deadline/domænerækker (T:191) | fabrik-arm · Trin C | K-6/ac-10 (undo-vindue · due · replay) · K-4/ac-5 (datokanter) |
| **FA-4 chain-proof-verifier + resultatadapter** | `scripts/v5/proofs.mjs` afviser i dag `chain-proof` (T:252); prover-resumé mod forudberegnet witness-liste | fabrik-arm · Fase 5-forudsætning | §9 (E20-snit) · C0-C10-kolonnen |
| **FA-5 held-out-udtrækker/attest** | P-8 §1-§2 (kilde/scope/projektion bindes af driveren FØR build; udtræk EFTER build) | driver · Fase 5 | ingen produkt-kode; nævnt så P-8 §1.2 ikke tabes |

Planen bygger intet af dette; »fabrikken skriver måle-laget« (rolle-grænsen). Uden FA-1/FA-2 kan intet bid erklæres done — det er gate-kriteriet, ikke et residual.

### 0.2 Fælles definitioner (bindende for hele planen)

**ID-regler (forventningsliste §5 pkt. 6):** `K-n/ac-m` = ét acceptkriterie · `K-n/S` = kravets strukturforbud der ikke bæres af et ac · `K-n/ac-m/neg-k` = én navngiven negativ (én afvisning, ét sted, én rolle) · `K-n/ac-m/SA-1` = to-sessions-race · `K-n/ac-m/S-k` = schema-/leverancebevis (tæller aldrig som domæne-kill). Alias: `K-6/ac-4 → K-3/ac-4` · `K-6/ac-5 → K-3/ac-6` · `K-6/ac-9 → K-4/ac-9` · `K-1/ac-5 → K-9/ac-1` · `K-5/ac-4 → K-9/ac-1` (den kanoniske række definerer ALLE positiver/negativer; alias-rækken bærer kun henvisningen + evt. ekstra chain-step). Ingen andre aliasser opfindes.

**Bevisformer (forventningsliste §0):** **UT** ulovlig tilladelse (forbudt forsøg → PRÆCIS den bundne afvisning + uændret store; lovligt søsterkald FØRST med samme rolle/indgang) · **FS** forkert slutværdi (hård observation mod uafhængigt orakel; historiske datoer genlæses efter hvert step) · **MH** manglende handling (legitim non-admin udfører via app-fladen + sideeffekter observeres) · **SA** samtidighed (kun de to E20-races).

**Roller (kill-list »Roller«):** `R+` authenticated rettighedshaver (non-admin; tab-grant på pakkens page) · `R−` samme app-brugertype uden netop den prøvede rettighed · `V` view-only (can_access uden can_write) · `A+` særskilt lovlig godkender · `SA` app-superadmin (employee m. superadmin-rolle under DB-rollen `authenticated` — ALDRIG DB-superuser). Alle positive kæder køres som R+ (A-7); SA prøves på strukturforbud.

**Testkontekster (U07 — to kontekster, bundet pr. negativ):**
- **ctx-A (app-rolle):** `SET LOCAL ROLE authenticated` + `request.jwt.claim.sub` sat; verificeret `current_user = 'authenticated'`, `rolbypassrls = false`, ingen ejerskab. Direkte DML → **42501** (privilegie-laget); RPC-kald → domæne-/rettigheds-afvisninger. Et JWT under postgres er IKKE ctx-A (A-7).
- **ctx-B (ejer-probe, rollbacket):** kørsel som tabel-ejer/postgres for at nå triggere bag privilegie-laget (immutability-guards, stamp-trigger, pii-guard). Resultat = **schema-bevis (S)**, aldrig domæne-kill (F11 · kill-list S4.1/S8.1).

**UTC-datoregel (S-18, A-10 · F06):** al »dags dato« i pakken = `core_identity.dags_dato_utc()` = `(clock_timestamp() at time zone 'UTC')::date` (VOLATILE; læses ÉN gang pr. RPC-kald i en lokal variabel EFTER lås-erhvervelse). Alle historik-rækker stemples af trigger (`_stamp_utc`) med `…_kl := clock_timestamp()` og `…_dato := (…_kl at time zone 'UTC')::date` — ingen skrivevej kan vælge dato; ingen `::date`-cast uden eksplicit zone; ingen `now()`/`current_date` i pakkens egne dato-afledninger (transaktions-start kan ellers stemple efter-midnats-skrivninger med gårsdagens dato). Oracler sammenligner `…_dato <= p_dato`; `p_dato default core_identity.dags_dato_utc()`. Fundamentets egen due-gate `effective_from > current_date` (`f49e7d5b:183`) arves uændret (uden for pakken); S-17 gør pakken robust mod den (effektiv dato kan aldrig ligge i fortiden).

**Effektiv dato ved dateret ændring (S-17, A-9 · U04):** en godkendt ændring med ønsket dato D effektueres ved apply med `gaeldende_fra = greatest(D, dags_dato_utc())` — aldrig i fortiden. Pending viser den ønskede D (payload = `pending.effective_from`, assert); relationens `gaeldende_fra` viser den effektive dato. Forsinket godkendelse/apply flytter ikrafttræden frem, ikke tilbage (K-6 ac 6 »ændrer aldrig fortiden« + M-13). Ingen dødt pending-flow, ingen tavs payload-drift.

**Afvisnings-katalog (adapterens `reject_contract_ref`-kilde — hver negativ i §1 peger på ét ID her):**

| id | SQLSTATE | besked-form (ASCII, `<fn>: <sag>`) | afvisningssted · førbetingelse |
| --- | --- | --- | --- |
| AK-PERM | 42501 | `<fn>: permission_denied` | første gate i hver SECDEF-write/-read; `has_permission(<page>,'manage',true/false)` false |
| AK-AARSAG | 22023 | `<fn>: change_reason er paakraevet` | anden gate; `p_change_reason` NULL/blank |
| AK-NAVN | 22023 | `<fn>: navn er paakraevet` | `p_navn`/`p_foerste_stand_navn` NULL/blank/whitespace |
| AK-TYPE | 22023 | `<fn>: ugyldig type` | lokations-type ∉ {butik, messe, marked, event, andet} · gruppe-type sat ∉ {kaede, enkelt_butik, messe_operatoer, andet} |
| AK-PRIS | 22023 | `<fn>: dagspris er ugyldig (kraeves, >= 0, hoejst 2 decimaler, < 10000000000)` | lokation: NULL/negativ/>2 dec./≥10^10 · stand: samme undtagen NULL (=arv) |
| AK-PAAKRAEVET | 22023 | `<fn>: <felt> er paakraevet` | NULL-reference hvor en reference kræves: `p_gruppe_id` (lokation_opret) · `p_lokation_id` (stand_opret) · `p_klient_id` (wrappers) — A-11: ét løfte, NULL er 22023, ukendt er P0002 |
| AK-FINDES-IKKE | P0002 | `<fn>: <objekt> % findes ikke` | ukendt uuid for gruppe/lokation/stand/kontakt/klient/pending |
| AK-GRUPPE-INAKTIV | 22023 | `<fn>: gruppe_inaktiv` | forretningsvagt (S-7): SA-bypass via `is_admin()` (wrapper) / `is_admin_by_employee_id(requested_by)` (apply) |
| AK-KLIENT-INAKTIV | 22023 | `<fn>: klient_inaktiv` | forretningsvagt (S-7), samme bypass |
| AK-HVILEDAGE | 22023 | `<fn>: hviledage skal vaere mindst 1` | `p_hviledage` sat og < 1 (NULL = fjern valget) |
| AK-STATUS | 22023 | `<fn>: ugyldig status` | ∉ {aktiv, dvale, nedlagt} eller NULL |
| AK-STATUS-UAENDRET | 22023 | `<fn>: status_uaendret` | samme status som nu, undtagen dvale→dvale m. ændret ophør (S-6) |
| AK-OPHOER-DVALE | 22023 | `<fn>: dvale_ophoer kraever status dvale` | `p_dvale_ophoer` sat og `p_status <> 'dvale'` |
| AK-OPHOER-FORTID | 22023 | `<fn>: dvale_ophoer skal ligge efter dags dato` | `p_dvale_ophoer <= dags_dato_utc()` |
| AK-SIDSTE-STAND | P0001 | `<fn>: sidste_aktive_stand_kan_ikke_deaktiveres` | deaktivering når antal aktive stande på lokationen (under lås) = 1 |
| AK-NEDLAGT | 22023 | `<fn>: lokation_nedlagt` | strukturvagt (S-7): INGEN bypass; wrapper OG apply-handler |
| AK-IKKE-I-GRUPPEN | 22023 | `<fn>: klient_ikke_i_gruppen` | fravalg/ophæv af klient uden dækkende kobling på lokationens gruppe pr. dato |
| AK-KOBLING-FINDES | 22023 | `<fn>: kobling_findes_allerede` | åben kobling (gruppe, klient) findes — wrapper OG apply (race-taberen rammer HER, S-19) |
| AK-INGEN-KOBLING | 22023 | `<fn>: ingen_aaben_kobling` | frakobl uden åben kobling |
| AK-FRAVALG-FINDES | 22023 | `<fn>: fravalg_findes_allerede` | åbent fravalg findes |
| AK-INTET-FRAVALG | 22023 | `<fn>: intet_aabent_fravalg` | ophæv uden åbent fravalg |
| AK-DATO-FORTID | 22023 | `<fn>: dato_i_fortiden` | wrapper: `p_gaeldende_fra < dags_dato_utc()` |
| AK-DATO-FOER-START | 22023 | `<fn>: dato_foer_start` | frakobl/ophæv: effektiv dato ≤ den åbne rækkes `gaeldende_fra` (også samme dag) — wrapper OG apply |
| AK-DATO-DRIFT | P0001 | `<fn>: payload_dato_afviger_fra_pending` | apply-handler: `payload->>'gaeldende_fra' <> pending.effective_from` |
| AK-IMMUTABEL | P0001 | `<tabel>_immutabel (operation %)` | guard-trigger: UPDATE/DELETE/TRUNCATE på historik; UPDATE af andet end `gaeldende_til` (+`updated_at`) på åben koblings-/fravalgsrække |
| AK-PII-NEDGRADERING | P0001 | `pii_nedgradering_forbudt: %.%.% (direct -> %)` | trigger på `data_field_definitions`: OLD.pii_level='direct' AND NEW.pii_level<>'direct' · INGEN bypass (heller ikke migration) |
| AK-PII-BESKYTTET | P0001 | `pii_definition_beskyttet: %.%.%` | samme trigger: DELETE af direct-række · UPDATE af (schema, table, column) på direct-række |
| AK-DAEKNING | P0001 | `anonymiseringsdaekning_ufuldstaendig: %` | trigger på `anonymization_mappings`: UPDATE af `field_strategies` på status='active'-række der efterlader en direct-kolonne uden approved/active-strategi eller peger på ikke-direct kolonne |
| AK-KONTAKT-LUKKET | 22023 | `<fn>: kontakt_anonymiseret_opret_ny` | `gruppe_kontakt_upsert`/`gruppe_kontakt_saet_aktiv` på række m. `anonymized_at IS NOT NULL` |
| AK-STRATEGI-UKENDT | P0002 | `<fn>: strategi % findes ikke eller er ikke active` | replay-apply: snapshot-strategi uden active registry-række — ALDRIG coalesce til original værdi |
| AK-PAGINERING | 22023 | `<fn>: antal skal vaere 1..1000` | liste-RPC'er: `p_antal` uden for 1..1000 |
| AK-FUNDAMENT-* | — | arvet | `pending_change_approve/undo/apply`: P0002 `pending_change_not_found` · 22023 `pending_change_wrong_status`/`pending_change_not_approved`/`not_yet_due`/`undo_deadline_expired` · 42501 `permission_denied`/`pending_change_self_approve_forbidden` (kun non-admin — F07) · 42883 `unknown_change_type` · generic_apply: P0002 `ingen aktiveret mapping`/`findes ikke eller er allerede anonymized` · P0001 `PII-coverage-fejl`/`strategy ikke active`/`ingen pii_level=direct kolonner` (`6083fecd:48-98,107-109`) |
| AK-TYPE-GRAENSE | 22P02 / 22003 | PostgreSQL input-cast (`invalid_text_representation` / `numeric_value_out_of_range`) | signatur-grænsen: tekst i uuid-parameter (fritekst-gruppe, T3.1) · ikke-heltal/overflow i `integer`-parameter (U05). Bundet klasse — ikke domænefejl, ikke »anden fejlkode« |
| AK-API-SIGNATUR | PGRST202 / 42883 | PostgREST »function not found« | kald med ukendt/ekstra parameter (fx `p_parent_stand_id`) — eksplicit afvisning af urepræsenterbar struktur (T:150), tæller ikke som domæne-kill |
| AK-CI-GATE | exit 1 | `migration-gate` STRICT (`e79ce6eb:202-243` + `ci.yml:98-107 @ 4312d4b5`) · fitness rød | leverance-negativer (K-1/ac-4 · K-7/ac-1) |
| AK-DIREKTE-DML | 42501 | `permission denied for table …` | ctx-A: INSERT/UPDATE/DELETE/TRUNCATE på enhver pakke-tabel — ingen app-DML-grants (S-29); også med selvsatte `stork.allow_*_write`-vars |

**Uafhængigt orakel (P-8 §4.1, kill-list »Uafhængigt orakel«):** `Ret(C,L,D) = Medlem(C, Gruppe(L,D), D) AND NOT Fravalgt(C,L,D) AND Status(L,D) <> nedlagt` · `Bookbar(L,D) = Status(L,D) = aktiv` (dvale ⇒ ret=true, bookbar=false) · `Pris(S,D) = EgenPris(S,D) hvis sat, ellers Pris(Lokation(S),D)` — beregnes af testen fra de faktisk effektuerede hændelser, aldrig fra produktets helper-return.

---

## 1. Krav-ID-matrix (bijektion)

Kolonner: **ID** · **bid·step** (effekt-bid = hvor slut-effekten FØRST er nåbar) · **indgang · rolle** · **positiv slut-effekt (FS/MH)** · **negativer (UT)** → `neg-k: forsøg → AK-id` · **bevisform** · **C** (chain-step) · **N** (canary) · **mutant** (Codex T-id: **I** = instansieret her m. locus, **R** = redundant/ikke-instansieret m. bærende værn, **S** = schema-/leverancebevis) · **overdragelse**. Negativer prøves ALTID efter et lovligt søsterkald med samme rolle/indgang; SA gentages på strukturvagter. Kill-listen finaliseres bid-bundet af Codex i Fase 4 (P-6) — planen binder locus, indgang, rolle og effektassertion HER så gaten kan dømme dybden.

### K-1 Lokation som central master-data (K:17-31 · N1 · C2/C3/C10) → Bid 2

| ID | bid·step | indgang · rolle | positiv slut-effekt | negativer → AK | form | C | N | mutant |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| K-1/ac-1 | 2.2 | `lokation_opret` · R+ | række i `lokationer` + første stand + init-status-event `aktiv` + pris-/gruppe-historik-rækker (genlæs via `lokation_hent`/`stande_liste`) | neg-1: `p_navn` NULL → AK-NAVN · neg-2: blank/whitespace → AK-NAVN · neg-3: som SA blank → AK-NAVN (strukturvagt, ingen bypass) · alle: ingen halv lokation/stand (assert 0 nye rækker) | UT · MH | C2 | N1 | **T1.1 I** — locus `lokation_opret` navn-gren: mutant erstatter NULL/blank med default-navn → neg-1/2 rød (lagret række med opdigtet navn). Tabel-CHECK `length(trim(navn))>0` = 23514-bagstopper (S) |
| K-1/ac-2 | 2.2 | `lokation_opret` / `lokation_rediger` · R+ | hver af de fem typer accepteres og genlæses ordret (C2: L1..L5 dækker alle) | neg-1: type ∉ listen → AK-TYPE · neg-2: NULL → AK-TYPE (type er KRÆVET, S-16) | UT · MH | C2 · C3 | N1 | **T1.2 I** — locus type-gren: normalisér ukendt → `'andet'` → neg-1 rød (række med `andet` lagret). CHECK = bagstopper (S) |
| K-1/ac-3 | 2.1+2.2 | `lokation_rediger` (pris) + `lokation_dagspris_paa` / `stand_dagspris_paa` · R+ | P1 sat D1, P2 sat D2 → `lokation_dagspris_paa(L,D1)=P1`, `(L,D2)=P2`; stand uden egen pris følger samme datoer; genlæses uændret ved C10; samme svar under `SET LOCAL timezone` = 'Etc/UTC' og 'Pacific/Kiritimati' (S-18) | neg-1 (ctx-A): UPDATE/DELETE/TRUNCATE på `pris_historik` → AK-DIREKTE-DML · neg-2 (ctx-B, S): samme → AK-IMMUTABEL `pris_historik_immutabel` · neg-3: ingen offentlig indgang kan omskrive D1 — `lokation_rediger` har ingen dato-parameter (signatur-assert; AK-API-SIGNATUR ved ekstra parameter) | FS (historisk) · UT | C3 · C10 | N1 | **T1.3 I** — locus `pris_historik_lokation_trg`: mutant UPDATE'r seneste log-række i stedet for INSERT → opslag(D1) skifter til P2 → FS rød. **T1.4 I** — locus `stand_dagspris_paa` dato-led: brug lokationens NU-pris ved arv → historisk standopslag rød. Ekstra locus (frø B:205): `sat_dato <= p_dato` muteret til `dags_dato_utc()` → historisk opslag rød |
| K-1/ac-4 | 2.1 · 2.2 | leverance-kontrol (CI + pg_catalog) · R+ læser | (a) ingen kolonne/FK fra pakkens tabeller mod `core_money` (`CROSS_SCHEMA_FK_ALLOWED_TARGETS` `d1b4d601:1172-1176`) · (b) **output-kontrakt:** hver read-RPC's `pg_get_function_result(oid)` er byte-identisk med §2's bundne `returns table(...)` (ingen jsonb-blobs — S-26) · (c) `pg_get_functiondef` af ALLE pakkens funktioner indeholder ikke `core_money` | neg-1 (leverance-mutant): FK mod `core_money` → fitness rød (AK-CI-GATE) · neg-2 (leverance-mutant): tilføj kolonne `provision numeric` til `lokation_hent`'s returns → kontrakt-assert (b) rød · neg-3: reference til `core_money.*` i en funktions-body → (c) rød | UT (leverance) | C2 · C3 | N1 | **S1.1** (kill-list) = neg-1..3 — leverancekontrol, ikke domæne-kill (A-15 · U10 lukket: også JSONB/udgående RPC-data via typede returns) |
| K-1/ac-5 | → K-9/ac-1 | alias (kanonisk K-9/ac-1) | oprettelse/ændring af lokation indgår i K-9's fulde handlingsliste som R+ | — | MH | C0-C10 | N9 | — |
| K-1/S | 2.1 | schema-assert | »lokations-data spredt uden for master-kilden« og »sær-mekanik pr. type« designet UD: ingen anden tabel bærer lokations-felter; ingen `CASE type`/`WHEN type` i nogen pakke-funktion (`pg_get_functiondef`-assert); fem-type-forløbet (C2/C3) bruger identiske RPC'er | — | S | C2 | N1 | S (del af S1.1) |

**Kill-list-binding K-1:** T1.1 I · T1.2 I · T1.3 I · T1.4 I · S1.1 S. Gulv ≥1: opfyldt (4). Frø-valg »MANGLER KILDE« (T1.3/T1.4): valgt her = trigger-født append-only `pris_historik` + dato-orakel (§3 Bid 2).

### K-2 Stande under lokation (K:33-50 · N2 · C2/C6/C8 · SA) → Bid 2 (ac-3 i Bid 3)

| ID | bid·step | indgang · rolle | positiv slut-effekt | negativer → AK | form | C | N | mutant |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| K-2/ac-1 | 2.1 · 2.2 | `stand_opret` · R+/SA + schema-assert | to-tabel-model (S-1): `lokationer` har ingen parent-kolonne, `stande` ingen barn-tabel, ingen self-FK (pg_catalog); cyklus/under-stand kan ikke udtrykkes | neg-1: `stand_opret(p_lokation_id := <stand-id>)` → AK-FINDES-IKKE (en stand er ikke en lokation — eksplicit afvisning af »stand under stand«) · neg-2: `p_lokation_id` NULL → AK-PAAKRAEVET · neg-3: ukendt → AK-FINDES-IKKE · neg-4: API-kald med `p_parent_stand_id`/`p_parent_lokation_id` → AK-API-SIGNATUR (T:150 »skal eksplicit afvises«) · neg-5 (ctx-A): DML → AK-DIREKTE-DML | UT (struktur + eksplicit) | C2 | N2 | **T2.1 R** — cyklus urepræsenterbar (kilde: DDL §3 Bid 2 + pg_catalog-assert); bærende bevis = neg-1..4 + S. **T2.2/T2.3 R** — blad-guard urepræsenterbar (ingen parent-parameter på stande; ingen omtypnings-handling). **T2.4 I** — locus `stand_opret` lokations-opslag: mutant erstatter manglende/ukendt lokation med første eksisterende → neg-2/3 rød (stand tilkoblet skjult default) |
| K-2/ac-2 | 2.2 | `stand_rediger` (pris) + `stand_dagspris_paa` · R+ | egen pris P≠lokationens → egen; NULL → lokationens på SAMME D; `stand_rediger(p_dagspris := NULL)` = reset til arv → lokationens igen; `0` er en pris (0 ≠ NULL, V11) | neg-1: `p_dagspris` negativ/3 decimaler/≥10^10 → AK-PRIS · neg-2: ikke-numerisk → AK-TYPE-GRAENSE | FS · UT | C3 | N2 | **T2.7 I** — locus `stand_dagspris_paa` prioritet: lokationspris vinder over sat standpris → FS rød. (T1.4 dækker dato-leddet) |
| K-2/ac-3 | 3.1 | `stand_er_bookbar(S,D)` · R+ | `false` for ALLE lokationens stande på datoer i dvale/nedlagt; `true` under aktiv; `false` for deaktiveret stand under aktiv lokation | — (afvisningen af selve bookingen er trin 24 — N4-B) | FS | C5 · C6 | N4 | **T2.9 I** — locus `stand_er_bookbar`: returnér `stande.is_active` uden lokationens `lokation_er_bookbar`-led → dvale-test rød |
| K-2/ac-4 | 2.1 · 2.2 | `stand_opret` + `stande_liste` · R+ | stand-id stabil identitet + `lokation_id`-reference; bookbar-fladen (`stand_er_bookbar`) leveret til trin 24 | — | FS (identitet) | C2 | (N2-B) | — · **overdragelse** N2-B dobbeltbooking → `downstream_dependency: trin-24` (aldrig runtime-PASS) |
| K-2/ac-5 | 3.1-test | `lokation_saet_status('nedlagt')` → `('aktiv')` + `stande_liste` · R+ | samme stand-id'er, -antal, egne priser og prishistorik før/under/efter nedlæg+genåbn | neg-1 (ctx-A): DELETE på `stande` → AK-DIREKTE-DML · neg-2: ingen delete-RPC (signatur-assert: ingen pakke-funktion udfører DELETE på `stande` — `pg_get_functiondef`) · neg-3 (S): `stande.lokation_id` FK er `ON DELETE RESTRICT` (confdeltype='r') | FS · UT | C6 · C8 | N2 | **T2.8 I** — locus `lokation_saet_status` nedlagt-gren: mutant tilføjer `DELETE FROM stande WHERE lokation_id=…` → C8 stand-mængde-assert rød |
| K-2/ac-6 | 2.2 | `lokation_opret` · `stand_saet_aktiv` · R+/SA | lokation fødes atomisk m. første stand (assert: min-1-aktiv-stand efter commit for hver oprettet lokation); ejerkæden FK-båret (`stande.lokation_id NOT NULL` → `lokationer`; `lokationer.gruppe_id NOT NULL` → `grupper`) | neg-1: `p_foerste_stand_navn` NULL/blank → AK-NAVN + INGEN lokation committed · neg-2: deaktivér sidste aktive stand → AK-SIDSTE-STAND (R+ og SA) · neg-3: under-stand = K-2/ac-1/neg-1 · **SA-1 (E20-race 1):** to sessions (FA-2), L har S1+S2 aktive, hver deaktiverer sin; barriere: session B's `wait_event` = lås på L's række observeret før A committer; udfald: præcis én AK-SIDSTE-STAND, committed tilstand har ≥1 aktiv stand | UT · SA · FS | C2 | N2 | **T2.5 I** — locus `lokation_opret` stand-INSERT: spring over men returnér uuid → min-1-assert rød. **T2.10 I** — locus `stand_saet_aktiv` count-check: fjern → neg-2 rød. **T2.6 I (TO SESSIONER)** — locus `stand_saet_aktiv` `FOR UPDATE` på `lokationer`-rækken: fjern → SA-1 ender med 0 aktive stande → rød. Betingelsen »lovlig fjern/flyt-flade« er opfyldt af deaktivering (flyt findes ikke: `stand_rediger` har ingen lokations-parameter — S) |
| K-2/S | 2.1 | schema-assert | »stand uden lokation« (NOT NULL FK) · »lokation uden stande« (T2.5/T2.10) · »under-stande« (ac-1) · »stande der forsvinder« (ac-5) — alle båret ovenfor | — | S | C2 | N2 | S |

**Kill-list-binding K-2:** T2.1 R · T2.2 R · T2.3 R · T2.4 I · T2.5 I · T2.6 I · T2.7 I · T2.8 I · T2.9 I · T2.10 I. Gulv opfyldt (7 I). SL2.1/SL2.2/SL2.3 leveres (§3 Bid 2 + S-1-strukturbevis).

### K-3 Gruppe (leverandør) som ejer (K:52-67 · N3 · C1/C2/C4/C7) → Bid 1 (ac-1/2 i Bid 2 · ac-4/6 i Bid 4)

| ID | bid·step | indgang · rolle | positiv slut-effekt | negativer → AK | form | C | N | mutant |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| K-3/ac-1 | 2.2 | `lokation_opret` · R+/SA | lovlig G-reference genlæses som G (`lokation_hent.gruppe_id`) | neg-1: `p_gruppe_id` NULL → AK-PAAKRAEVET · neg-2: ukendt uuid → AK-FINDES-IKKE · neg-3 (S): `gruppe_id NOT NULL` (23502-bagstopper) | UT | C2 | N3 | **T3.6 I** — locus `lokation_opret` gruppe-opslag: erstat NULL/ukendt med default-gruppe → neg-1/2 rød (lokation med skjult ejer) |
| K-3/ac-2 | 2.1 · 2.2 | schema-assert + `lokation_opret` · R+ | gruppe angives KUN som uuid-FK; ingen tekst-kolonne for gruppe på `lokationer` (pg_catalog) | neg-1: tekst (»Coop«) i `p_gruppe_id` → AK-TYPE-GRAENSE (22P02) — bundet klasse for fritekst-input · neg-2: ukendt uuid → AK-FINDES-IKKE | UT (struktur) | C2 | N3 | **T3.1 R** — fritekst urepræsenterbar i typed signatur (uuid); bærende = neg-1 (22P02) + S. Ingen fritekst-RPC opfindes |
| K-3/ac-3 | 1.2 | `gruppe_upsert` · R+/SA | G og H oprettes m. navn, stabile separate id'er (navne må kollidere — identitet afgør, T:189); redigering genlæses | neg-1: `p_navn` NULL/blank → AK-NAVN (R+ og SA) · neg-2: `p_type` sat ∉ 4-listen → AK-TYPE | UT · MH | C1 | N3 | **T3.2 I** — locus `gruppe_upsert` navn-gren: default-navn ved blank → neg-1 rød |
| K-3/ac-4 | 4.2/4.3 (kanonisk; alias K-6/ac-4) | `gruppe_klient_kobl` → approve → apply + `klient_maa_staa_paa` · R+/A+ | C1/C2 koblet på G → `Ret(C1,L1..L2)=true` og senere L3..L5 = true (afledt, V8); C3 (H) → false på alle G-lokationer | neg-1: `lokation_klient_fravalg_ophaev(L1, C3)` (C3 uden G-kobling) → AK-IKKE-I-GRUPPEN · neg-2: `lokation_klient_fravaelg(L1, C3)` → AK-IKKE-I-GRUPPEN (fravalg af outsider er meningsløst — afvises samme sted) | FS (afledt ret) · UT | C1 · C2 · C4 | N3 | **T3.3 I** — locus `klient_maa_staa_paa` medlemskabs-led: tilføj cutoff `lokationer.created_at <= kobling.gaeldende_fra` (arv kun til lokationer der eksisterede ved kobling) → L3-test rød. **T6.3 I** — locus wrapper `lokation_klient_fravalg_ophaev` gruppe-check: fjern → neg-1 rød (request accepteres). Afvisningsgrænsen er REQUEST (wrapper) — apply-genvalidering er T6.16 |
| K-3/ac-5 | 1.2 + 2.1 | `gruppe_saet_aktiv` + DML-forsøg · R+/SA | udfasning = `is_active=false` (V13): G/L/stande/historik/koblinger og effektive retter består; slet-forsøg på G med L1/L2 (også L1 nedlagt) afvist | neg-1 (ctx-A): DELETE på `grupper` → AK-DIREKTE-DML · neg-2: ingen delete-RPC (signatur-assert) · neg-3: `lokation_opret` på inaktiv G → AK-GRUPPE-INAKTIV som R+; som SA lykkes (forretningsvagt, S-7) · neg-4: `gruppe_klient_kobl` på inaktiv G → AK-GRUPPE-INAKTIV (R+) · **S-1 (ctx-B):** FK `lokationer.gruppe_id` er RESTRICT: ejer-DELETE af G m. lokationer → 23503 | UT · FS | C7 | N3 | **S3.1 S** — CASCADE-mutant er schema-probe (ikke nåbar via public flade). Domæne-kill for ac-5: locus `lokation_opret` gruppe-aktiv-guard: fjern → neg-3 rød (K-3 frø b bevaret som I under ac-5) |
| K-3/ac-6 | 4.2/4.3 (kanonisk; alias K-6/ac-5) | `lokation_klient_fravaelg` / `lokation_klient_fravalg_ophaev` (pending-kæden) + `klient_maa_staa_paa` · R+/A+ | fravælg C1 på L1 fra D3 → `Ret(C1,L1,D≥D3)=false`, `Ret(C1,L2..L5)=true`, `Ret(C2,L1)=true`, H uberørt; ophæv fra D4 → `Ret(C1,L1,D≥D4)=true`, `D3≤D<D4` fortsat false (historik) | neg-1: dobbelt fravalg (åbent findes) → AK-FRAVALG-FINDES (wrapper OG apply) · neg-2: ophæv uden åbent fravalg → AK-INTET-FRAVALG · neg-3: ophæv med dato ≤ fravalgets start → AK-DATO-FOER-START | FS · UT · MH | C4 | N3 | **T3.4 I** — locus `klient_maa_staa_paa` `NOT fravalgt`-led: fjern → fravalgs-test rød. **T3.5 I** — locus `_apply_lokation_klient_fravalg_ophaev` UPDATE-afgrænsning: fjern `lokation_id` fra WHERE → ophævelse lukker C1's fravalg på ALLE lokationer → lokalitets-assert (L2..L5 uændret) rød |

**Kill-list-binding K-3:** T3.1 R · T3.2 I · T3.3 I · T3.4 I · T3.5 I · T3.6 I · S3.1 S. SL3.1/SL3.2 leveres (§3 Bid 4: afledt ret + daterede fravalgsrækker).

### K-4 Status-livscyklus (K:69-87 · N4 · C5-C8) → Bid 3 (ac-6/8/9 i Bid 4 · struktur i Bid 2)

| ID | bid·step | indgang · rolle | positiv slut-effekt | negativer → AK | form | C | N | mutant |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| K-4/ac-1 | 3.1 | `lokation_saet_status` · R+/SA | hver af {aktiv, dvale, nedlagt} kan sættes; alle overgange mellem forskellige statusser tilladt (S-2); genlæs via `lokation_status_paa` | neg-1: ukendt værdi → AK-STATUS · neg-2: NULL → AK-STATUS · neg-3: samme status → AK-STATUS-UAENDRET (undtagen dvale→dvale m. ændret ophør, S-6 — positiv) | UT · MH | C5-C8 | N4 | **T4.1 I** — locus status-gren: normalisér ukendt → `'aktiv'` → neg-1 rød |
| K-4/ac-2 | 3.1 | `lokation_saet_status` + `audit_log_read('core_identity','lokation_status_skift', <event-id>)` · R+ | pr. skift én audit-række med `change_reason` = brugerens tekst (ikke fixture-global — vars nulstilles mellem aktører) og `actor_user_id` = R+ | neg-1: blank årsag → AK-AARSAG · neg-2 (ctx-B, S): INSERT uden `stork.change_reason` → `stork_audit` P0001 (`e3cfa9fe:44-105`) | UT · FS (audit-række) | C5 | N4 | **T8.6 (K-8) dækker** — locus `lokation_saet_status` årsags-gren: erstat blank med `'auto'` → neg-1 rød + audit bærer fabrikeret årsag |
| K-4/ac-3 | 2.1+3.1 | DML-forsøg + signatur-assert · R+ | status kan KUN skrives via `lokation_saet_status`; `lokation_rediger` har ingen status-parameter (pg_catalog `pg_get_function_arguments`) | neg-1 (ctx-A): INSERT på `lokation_status_skift` → AK-DIREKTE-DML · neg-2: `lokation_rediger` kaldt med `p_status` → AK-API-SIGNATUR · neg-3: omdøb dvale-lokation via `lokation_rediger` → status uændret (FS) | UT · FS | C3 | N4 | **T4.2 I** — locus `lokation_rediger`: mutant tilføjer status-INSERT (`'aktiv'`) i UPDATE-vejen → neg-3 rød (omdøbning genåbner dvale) |
| K-4/ac-4 | 2.1 | ctx-A + ctx-B på `lokation_status_skift` | append-only event-log: fortid kan aldrig omskrives; `lokation_status_historik` viser alle events i seq-orden | neg-1 (ctx-A): UPDATE/DELETE/TRUNCATE → AK-DIREKTE-DML · neg-2 (ctx-B, S): samme → AK-IMMUTABEL `lokation_status_skift_immutabel` (alle tre operationer) | UT | C5 | N4 · N8 | **T4.3 I** — locus `lokation_saet_status`: skriv ny status i seneste event-række (UPDATE) i stedet for INSERT → `lokation_status_paa(L, D_før)` ændres → FS rød. **S4.1 S** — guard-fjernelse = ctx-B-probe |
| K-4/ac-5 | 3.1 | `lokation_status_paa(L,D)` / `lokation_er_bookbar(L,D)` · R+ | forløb aktiv→dvale(ophør D5)→afledt aktiv D5→nedlagt D6→aktiv D8 genlæses korrekt på hvert knæk og kant: D5−1 dvale, D5 aktiv (halvåben, S-4), samme-dags start+stop → seneste seq gælder; datoer før oprettelse → NULL/false; identisk under to `timezone`-indstillinger | — (booking-afvisningen = N4-B → trin 24) | FS (historisk) | C5 · C10 | N4 | **T4.4 I** — locus `lokation_er_bookbar`: `status = 'aktiv'` → `status <> 'nedlagt'` → dvale-test rød. Ekstra loci (frø): `dvale_ophoer <= p_dato` → `<` (ophørsdag rød) · `ORDER BY seq DESC` → ASC (seneste-event rød) · `skiftet_dato <= p_dato` → `dags_dato_utc()` (T6.8 I) |
| K-4/ac-6 | 4.2 | `lokation_klient_fravaelg`/`…_ophaev` mens L1 i dvale · R+/A+ | pending-flowet gennemføres (request→approve→apply) — AFVISES IKKE; efter apply: `Ret=true/false` som forventet, `Bookbar=false` (prøven skelner) | — | MH · FS | C5 | N4 | **T4.5 I** — locus wrapper/handler status-guard: erstat `<> 'nedlagt'` med `= 'aktiv'` → dvale-positiv rød (for stramt værn er kravbrud) |
| K-4/ac-7 | 3.1 | `lokation_saet_status('aktiv')` på nedlagt · R+/SA | genåbnet: `Bookbar=true`; audit m. årsag; samme lokation/stand-id'er; ingen manuel genindsættelse af klientretter (C8) | — | MH · FS | C8 | N4 | **T4.6 I** — locus status-overgangs-check: afvis ud af nedlagt (terminal) → C8 rød |
| K-4/ac-8 | 4.2 | `lokation_klient_fravalg_ophaev` / `lokation_klient_fravaelg` på nedlagt L1 · R+ og SA | — | neg-1: ophæv på nedlagt → AK-NEDLAGT (R+) · neg-2: som SA → AK-NEDLAGT (strukturvagt — INGEN bypass, S-7) · neg-3: fravælg på nedlagt → AK-NEDLAGT (V4) | UT | C7 | N4 | **T4.7 I** — locus wrapper nedlagt-guard: tilføj `and not is_admin()` → neg-2 rød |
| K-4/ac-9 | 4.3 (kanonisk; alias K-6/ac-9) | `lokation_saet_status('nedlagt')` D6 + `lokation_klienter`/`klient_maa_staa_paa` · R+ | afledt frakobling (V8): `lokation_klienter(L1, D≥D6)` = ∅ · `(L1, D<D6)` uændret · koblings-/fravalgs-rækker UBERØRTE · G's medlemskab, L2..L5 og H intakte · stande består (K-2/ac-5) · request→nedlæg→apply: apply afvist uden delvis kaskade (C6) · genåbn D8: C3 (koblet på G under nedlagt) arves; C1 (frakoblet D7) vender ikke tilbage; C2 følger det låste valg (V8: fravalg BESTÅR → ingen ret før ophævelse); `D6≤D<D8` giver fortsat ingen ret | neg-1: lovligt fravalgs-request → nedlæg L1 → approve/due/apply → AK-NEDLAGT ved apply (pending forbliver `approved`; ingen relation skrevet) | FS (historisk + lokalitet) · UT | C6 · C7 · C8 | N4 | **T4.9 I** — locus `klient_maa_staa_paa` status-led: fjern `<> 'nedlagt'` → ac-9 rød. **T4.8 I** — locus `_apply_lokation_klient_fravalg`/`…_ophaev` nedlagt-genvalidering: udelad ved apply → neg-1 rød. **T4.10 R** — »genbrug klientliste fra nedlæggelsen« er urepræsenterbar i afledt model (ingen liste materialiseres); bærende = T6.5 (medlemskab på D) + C8-FS. **T4.11 R** — ingen kaskade-skrivning findes; lokalitets-assert (L2..L5/H uændret) er FS-del af denne række |

**Kill-list-binding K-4:** T4.1 I · T4.2 I · T4.3 I · T4.4 I · T4.5 I · T4.6 I · T4.7 I · T4.8 I · T4.9 I · T4.10 R · T4.11 R · S4.1 S. SL4.1/SL4.2 leveres (§3 Bid 3/4).

### K-5 Hvile (cooldown) (K:89-107 · N5 · C5) → Bid 3

| ID | bid·step | indgang · rolle | positiv slut-effekt | negativer → AK | form | C | N | mutant |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| K-5/ac-1 | 3.1 | `lokation_er_bookbar(L1,D)` / `stand_er_bookbar` under dvale · R+ og SA | `false` på alle datoer i perioden — for C1 OG C2 (opslaget har ingen klient-parameter: klientuafhængighed er designet ind i signaturen); L2 (aktiv) `true` | neg-1: pg_catalog-assert: ingen pakke-RPC har parameter matchende `%override%`/`%force%`/`%bypass%`/`%klient%` på bookbar-oraklerne · neg-2: kald med ekstra `p_force := true` → AK-API-SIGNATUR · neg-3: som SA → samme `false` (ingen admin-gren i oraklet: `pg_get_functiondef` indeholder ikke `is_admin`) | UT (fraværs + eksplicit) · FS | C5 | N5 | **T5.1 R** — klientafhængig hvile er urepræsenterbar (signatur uden klient); bærende = neg-1..3 + FS (C1/C2 begge false). Booking-skrivevej = N5-B → trin 24 |
| K-5/ac-2 | 3.1 | `lokation_saet_status('aktiv', årsag)` på dvale før D5 · R− → R+ | R+: `Bookbar(L1, dags dato)` flipper straks til `true`; senere opslag på D<stop fortsat dvale (historik); audit-række m. årsag | neg-1: R− (uden lokationer/manage-write) → AK-PERM, perioden uændret · neg-2: blank årsag → AK-AARSAG | UT · MH · FS | C5 | N5 | **T5.2 I** — locus `lokation_saet_status` permission-gate: ubetinget true → neg-1 rød. **T5.3 I** — locus samme RPC: skriv audit/`updated_at` men udelad INSERT af `aktiv`-eventet → bookbar forbliver false → MH/FS rød |
| K-5/ac-3 | 3.1 | `lokation_saet_hviledage(L1, 21, årsag)` · R− → R+ | ny værdi straks synlig (`lokation_hent.hviledage`) — ingen godkendelses-trin, ingen pending-række oprettet (assert `pending_changes` uændret); audit m. årsag; L2/H uændret | neg-1: R− → AK-PERM, værdi uændret · neg-2: blank årsag → AK-AARSAG · neg-3: `0` eller negativ → AK-HVILEDAGE · neg-4: ikke-heltal (`7.5`)/overflow → AK-TYPE-GRAENSE (bundet klasse) | UT · FS · MH | C5 | N5 | **T5.4 I** — locus permission-gate i `lokation_saet_hviledage`: fjern → neg-1 rød. **T5.5 I** — locus UPDATE-WHERE: fjern `id = p_lokation_id` → L2 ændres → lokalitets-FS rød. Frø »fjern CHECK« er IKKE et kill (F11): CHECK `hviledage >= 1` = 23514-bagstopper (S) |
| K-5/ac-4 | → K-9/ac-1 | alias (kanonisk K-9/ac-1) | hviledage-ændring indgår i K-9's handlingsliste (granted RPC, ingen migration) | — | MH | C5 | N9 | — |
| K-5/ac-5 | 2.1+3.1 | `lokation_opret` uden `p_hviledage` + `lokation_hent` · R+ | ny lokation: `hviledage IS NULL` (default = intet, princip 4); ingen pakke-mekanik (ingen cron, ingen trigger) skriver et `dvale`-event af sig selv (`pg_get_functiondef`-assert: kun `lokation_saet_status` INSERT'er i `lokation_status_skift`); sæt 14 → fjern (`p_hviledage := NULL`) → NULL igen; manuel dvale på L2 består uanset hviledage | neg-1: `p_hviledage := 0` i opret → AK-HVILEDAGE · neg-2: »default hvile« kan ikke sættes: der findes ingen konfig-indgang der giver alle lokationer et antal (signatur-assert) | FS · UT | C2 · C5 | N5 | **T5.6 I** — locus `lokation_opret`/`lokation_saet_hviledage`: `coalesce(p_hviledage, 7)` → NULL-assert rød |
| K-5/S | 3.1 | — | »booking under hvile« (N5-B → trin 24) · »book alligevel« (ac-1) · »auto-hvile uden valg« (ac-5) · »ændring uden rettighed/audit« (ac-2/3) · »periode-afslutning uden rettighed/audit« (ac-2) — alle båret ovenfor | — | — | C5 | N5 | — |

**Kill-list-binding K-5:** T5.1 R · T5.2 I · T5.3 I · T5.4 I · T5.5 I · T5.6 I. SL5.1/SL5.2 leveres (V9 én model-ting: hvile = status `dvale` m. `dvale_ophoer`; auto-udløsning = trin 24 via samme RPC — §9).

### K-6 Klient-tilladelser (K:109-130 · N6 · C1/C4/C6-C8 · SA/Replay) → Bid 4

| ID | bid·step | indgang · rolle | positiv slut-effekt | negativer → AK | form | C | N | mutant |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| K-6/ac-1 | 4.2 | `gruppe_klient_kobl` · R+/SA | — (positiv = ac-3) | neg-1: `p_klient_id` NULL → AK-PAAKRAEVET · neg-2: ukendt klient → AK-FINDES-IKKE · neg-3: `p_gruppe_id` NULL → AK-PAAKRAEVET · neg-4: ukendt gruppe → AK-FINDES-IKKE · neg-5: inaktiv klient (R+) → AK-KLIENT-INAKTIV (SA: lykkes, forretningsvagt) · neg-6 (S): NOT NULL FK'er | UT | C1 | N6 | **T6.1 I** — locus wrapper klient-opslag: erstat NULL/ukendt med første eksisterende klient → neg-1/2 rød (pending oprettes med forkert klient) |
| K-6/ac-2 | 4.1/4.2 | `gruppe_klient_kobl` (request) + `_apply_gruppe_klient_kobl` (apply) · R+/A+ | én sandhed pr. (gruppe, klient): efter apply findes præcis én åben række | neg-1: request når åben kobling findes → AK-KOBLING-FINDES (wrapper) · neg-2: to requests før første apply → anden apply → AK-KOBLING-FINDES (apply-genvalidering under gruppe-lås, S-19); pending forbliver `approved` (fundamentets partial_failure-kontrakt, E069 — arv, deklareret) · **SA-1 (E20-race 2):** to sessions (FA-2) applier hver sin approved dublet-pending for (C1,G) samtidigt; barriere: session B venter på `FOR UPDATE` af G's række (wait_event observeret); udfald: præcis én ny åben række, taberen AK-KOBLING-FINDES (22023, apply-fasen) — 23505/23P01 er bagstoppere (S), aldrig det bundne udfald | UT · SA | C1 | N6 | **T6.2 I (TO SESSIONER)** — locus `_apply_gruppe_klient_kobl`: fjern `select … from grupper where id = … for update` → begge sessions passerer genvalideringen → anden INSERT rammer partial-UNIQUE 23505 i stedet for 22023 → SA-1's bundne udfald rød (og uden UNIQUE: to åbne rækker). **T6.10 I** — locus partial-UNIQUE-definition: `(klient_id) WHERE gaeldende_til IS NULL` i stedet for `(gruppe_id, klient_id)` → C1-på-H-positiv (ac-8) rød |
| K-6/ac-3 | 4.2 | `gruppe_klient_kobl(G, C1, D0)` → approve (A+) → due → apply · R+ | åben række (`gaeldende_til IS NULL`) er normaltilstanden; genlæs via `gruppe_koblinger_liste(G)`; ingen slutdato-parameter findes (signatur) | — | MH | C1 | N6 | (positiv-kontrol; ingen egen mutant — MH-kill via T9.1) |
| K-6/ac-4 | → K-3/ac-4 | alias (kanonisk K-3/ac-4) | arv til alle + senere lokationer; til-valg uden for gruppen AFVISES | — | FS · UT | C2 | N6 | **T6.4 I** — locus `klient_maa_staa_paa` medlemskabs-led: fjern → outsider får ret / frakoblet klient beholder ret → FS rød (bindes her, effekt-bid 4) |
| K-6/ac-5 | → K-3/ac-6 | alias (kanonisk K-3/ac-6) | fravalg rammer kun L1; ophævelse genskaber; dobbelt fravalg afvises | — | FS · MH · UT | C4 | N6 | (T3.4/T3.5 under K-3/ac-6) |
| K-6/ac-6 | 4.2/4.3 | `gruppe_klient_frakobl(G, C1, D7)` → approve → apply · R+/A+ | åben række lukkes: `gaeldende_til = greatest(D7, apply-dag)` (S-17); `Ret(C1, alle G-lokationer, D≥D7)=false`, `D<D7` uændret (genlæses ved C10), H-ret består | neg-1 (ctx-A): UPDATE/DELETE på `gruppe_klient_koblinger` → AK-DIREKTE-DML · neg-2 (ctx-B, S): UPDATE af lukket række / af `gaeldende_fra`/`klient_id` på åben række → AK-IMMUTABEL `koblinger_historik_immutabel`; DELETE → samme · neg-3: frakobl uden åben kobling → AK-INGEN-KOBLING · neg-4: frakobl med dato ≤ koblingens start (samme dag) → AK-DATO-FOER-START (wrapper OG apply) | FS (historisk) · UT | C7 · C10 | N6 | **T6.5 I** — locus medlemskabs-led i `klient_maa_staa_paa`: brug `dags_dato_utc()` i stedet for `p_dato` → D<D7 læses false → historisk FS rød. **T6.9 I** — locus samme led: `gaeldende_til > p_dato` → `>=` → D7-svar true → grænse-FS rød |
| K-6/ac-7 | 4.3 | `klient_maa_staa_paa(C,L,D)` · R+ | tre daterede led (gruppe-på-dato via `lokation_gruppe_historik` · fravalg-på-dato · status-på-dato) læst på SAMME D; `klient_maa_staa_paa(C,L)` (default) = `…(C,L,dags_dato_utc())`; alle observerede datoer genlæses efter hvert step (C10); ejerskifte G→H via `lokation_saet_gruppe` D9: D<D9 følger G, D≥D9 følger H | — | FS | C4-C8 · C10 | N6 | **T6.6 I** — locus fravalgs-led: `dags_dato_utc()` i stedet for `p_dato` → historisk fravalgs-FS rød. **T6.7 I** — locus ejer-led: læs `lokationer.gruppe_id` (NU) i stedet for `lokation_gruppe_historik` på D → D<D9 følger H → FS rød. **T6.8 I** — locus status-led (`lokation_status_paa(L, p_dato)` → `(L, dags_dato_utc())`) → historisk nedlagt/aktiv-FS rød |
| K-6/ac-8 | 4.3 | to koblinger (C1, C2) på G + C1 også på H · R+ | `Ret(C1,L1)=Ret(C2,L1)=true` samtidig; C1 har ret på H's lokation — AFVISES IKKE (M-29.1; kardinalitets-positiv) | — | MH · FS | C1 · C2 | N6 | (T6.10 under ac-2 bærer kardinaliteten) |
| K-6/ac-9 | → K-4/ac-9 | alias (kanonisk K-4/ac-9) | nedlæggelse kobler af (afledt); genåbning arver | — | FS | C6-C8 | N6 | (T4.8/T4.9 under K-4/ac-9) |
| K-6/ac-10 | 4.2 | wrappers + `pending_change_approve/undo/apply` + `lokation_pending_hent` · R+/A+/R−/V | fuld kæde: request (R+) → pending synlig for A+ MED foreslåede værdier (`lokation_pending_hent`: gruppe/lokation/klient/ønsket dato/årsag) → approve (A+, ikke requester) → undo-vindue = `undo_settings` (eksplicit seedet 24 t, UI-justerbart 0..30 døgn; testen sætter et positivt vindue via `undo_setting_update`) → due (FA-3) → apply PRÆCIS én gang → oracle flipper; genkørsel af applied job → 22023 `pending_change_not_approved`, ingen ekstra række (Replay); undo før frist → status `undone`, ingen effekt | neg-1: R− (uden tab-write) → AK-PERM på hver af de 4 wrappers · neg-2: V → AK-PERM · neg-3: blank årsag → AK-AARSAG (hver wrapper) · neg-4: apply før frist → 22023 `not_yet_due` · neg-5: apply før ønsket dato → 22023 `not_yet_due` · neg-6: undo efter apply → 22023 `pending_change_wrong_status` (S-10) · neg-7: requester (non-admin) approver selv → 42501 `pending_change_self_approve_forbidden` (fundament-regel; SA må — F07) · neg-8: R− læser `lokation_pending_hent` → AK-PERM (ingen payload) · neg-9: `p_gaeldende_fra` i fortiden → AK-DATO-FORTID · neg-10: apply-handler møder `payload.gaeldende_fra <> effective_from` (ctx-B-konstrueret) → AK-DATO-DRIFT | UT · FS · MH | C4 · C6 | N6 | **T6.11 I** — locus `pending_change_apply` status-check (fundament-kopi): fjern → ikke-godkendt applies → rød. **T6.12 I** — fjern `undo_deadline > now()` → neg-4 rød. **T6.13 I** — fjern `effective_from > current_date` → neg-5 rød. **T6.14 I** — locus handler: skriv `dags_dato_utc()` i stedet for `greatest(payload-dato, dags_dato_utc())` når payload-dato er fremtidig → effekt fra forkert dato → FS rød. **T6.15 I** — locus `pending_change_undo`: returnér uden UPDATE → pending applies senere → rød. **T6.16 I** — locus `_apply_lokation_klient_fravalg_ophaev` medlemskabs-genvalidering: udelad → request→frakobl→apply-negativ rød. **T6.17 I** — locus approve: ignorér `undo_settings` (deadline = now) → undo-vindue-test rød. **T9.4 I** — locus `lokation_pending_hent`: udelad payload-felter → A+ kan ikke se foreslåede værdier → MH rød |
| K-6/S | 4.1 | — | »kobling uden klient/gruppe« (ac-1) · »dobbelt kobling« (ac-2) · »til-valg på nedlagt« (K-4/ac-8) · »nedlagt lokation m. aktive klienter« (K-4/ac-9) · »sletning/omskrivning af historik« (ac-6) · »booking uden gældende ret« → N6-B trin 24 | — | — | — | N6 | — |

**Kill-list-binding K-6:** T6.1 I · T6.2 I · T6.3 I (under K-3/ac-4) · T6.4 I · T6.5 I · T6.6 I · T6.7 I · T6.8 I · T6.9 I · T6.10 I · T6.11 I · T6.12 I · T6.13 I · T6.14 I · T6.15 I · T6.16 I · T6.17 I. SL6.1/SL6.2/SL6.3 leveres (§3 Bid 4). Afvisningsgrænsen for outsider-tilvalg er REQUEST (T6.3) med apply-genvalidering (T6.16) — to forskellige bærende værn (request-check ser ikke senere frakobling), begge instansieret.

### K-7 Klassifikation, persondata, anonymisering (K:132-145 · N7 · C9) → Bid 1 (struktur + ac-1/3) · Bid 5 (ac-2/4)

| ID | bid·step | indgang · rolle | positiv slut-effekt | negativer → AK | form | C | N | mutant |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| K-7/ac-1 | 1.1 · 2.1 · 4.1 | CI `migration-gate` STRICT · leverance | hver ny kolonne har klassifikations-tuple i SAMME migrationsfil som `CREATE TABLE` (lukker LENIENT-vinduet); ingen dynamisk DDL i pakkens migrationer (B:145) | neg-1 (leverance-mutant): fjern tuple for én fysisk kolonne → AK-CI-GATE exit 1 | UT (leverance) | — | N7 | **S7.1 S** — leverancegate, ikke domæne-kill |
| K-7/ac-2 | 5.1 | `anonymiser_gruppe_kontakt(K1, årsag)` · R+ efter offentlig lifecycle (`anonymization_mapping_test_run` → `_approve` → `_activate` som R+ m. de eksisterende `anonymization_mappings/*`-grants) | `gruppe_kontakter.{navn,email,telefon}` ERSTATTET (værdi-assert mod sporværdier; `navn`='[anonymized]', `email`=hash_email-form, `telefon`='[anonymized]'), `anonymized_at` sat, `is_active=false` (S-23); rækken, G, L1..L5, stande, koblinger, fravalg, historik og audit består; præcis én `anonymization_state`-række; ret-/pris-/status-opslag uændrede efter (C9); replay: nyproduceret snapshot → isoleret restore → `replay_anonymization('gruppe_kontakt')` → værdier erstattet igen | neg-1 (ctx-A): DELETE på `gruppe_kontakter` → AK-DIREKTE-DML · neg-2: `anonymiser_gruppe_kontakt` igen → P0002 (AK-FUNDAMENT: allerede anonymized) · neg-3: `gruppe_kontakt_upsert(K1, …)` → AK-KONTAKT-LUKKET · neg-4: `gruppe_kontakt_saet_aktiv(K1, true)` → AK-KONTAKT-LUKKET · neg-5: R− → AK-PERM · neg-6: `anonymiser_gruppe_kontakt(K_H)` må ikke røre K_G (lokalitet, FS) | FS · UT · MH | C9 | N7 | **T7.5 I** — locus `_anonymiser_gruppe_kontakt_internal` (fundament-kopi af generic_apply-loop): spring `telefon` over men sæt `anonymized_at` → værdi-assert rød. **T7.9 I** — locus `_gruppe_kontakt_apply`: sæt `anonymized_at` men returnér originalværdier → replay-assert rød. **T7.13 I** — locus `gruppe_kontakt_upsert`: fjern anonymiseret-guard → neg-3 rød. **T7.14 I** — locus wrapper: anonymisér gruppens første kontakt i stedet for `p_kontakt_id` → neg-6 rød |
| K-7/ac-3 | 1.1 · 2.1 · 4.1 | data-assert mod `data_field_definitions` + `data_field_definition_upsert` (fælles UI-indgang) · R+ | `direct` KUN `gruppe_kontakter.{navn,email,telefon}`; ALT andet `none` (inkl. `lokationer.adresse` — S-24, recon-flag deklareret i purpose-tekst); `retention_type IS NULL` overalt (default = intet); ny uvalgt kolonne fødes none/NULL; UI-valg adresse→`direct` via fælles RPC lykkes og aktiverer dæknings-vejen (ac-4) | neg-1 (leverance-mutant): klassificér `lokationer.adresse` `direct` i migrationen → FS-assert rød · neg-2 (leverance-mutant): `retention_type='time_based', {"max_days":30}` på en kolonne → FS-assert rød | FS | C9 | N7 | **T7.3 I** — = neg-1 (leverance-mutant på klassifikations-tuplen). **T7.4 I** — = neg-2 |
| K-7/ac-4 | 5.1 | mapping-lifecycle (fælles RPC'er) + `anonymiser_gruppe_kontakt` / `anonymiser_lokation` · R+ | (a) gruppe_kontakt: alle tre direct-kolonner har strategi (`{"navn":"blank","email":"hash_email","telefon":"blank"}`); e2e grøn · (b) lokation: mapping `entity_type='lokation'` seedet **draft** m. `field_strategies='{}'` + wrapper `anonymiser_lokation` + interne fns leveret (inaktiv struktur); efter UI-valg adresse→direct: `anonymization_mapping_upsert` (strategier `{"adresse":"blank"}`) → test_run → approve → activate → `anonymiser_lokation(L1)` → adresse ERSTATTET, L1/stande/koblinger/status/pris-historik består; replay som ac-2 · (c) aktiv-mapping-redigering: `anonymization_mapping_upsert` på aktiv gruppe_kontakt-mapping uden `telefon` → AK-DAEKNING (S-22) | neg-1: `anonymization_mapping_test_run` på draft uden `telefon`-strategi → P0001 `PII-kolonne … mangler strategy` (fundament) · neg-2: aktiv mapping redigeret til ufuldstændig → AK-DAEKNING · neg-3: `anonymiser_lokation(L)` uden aktivt PII-valg → P0001 `ingen pii_level=direct kolonner` (fundament — inaktiv struktur afviser, aktiverer ikke tavst) | FS · UT | C9 | N7 | **T7.7 I** — locus `anonymization_mapping_test_run` coverage-loop (fundament-kopi): udelad én direct-kolonne → aktivering uden strategi → neg-1 rød. **T7.8 I** — locus dæknings-trigger `_mapping_daekning_guard`: fjern → neg-2 rød (aktiv udækket tilstand). **T7.6 I** — locus `audit_filter_values` direct-walker (fundament-kopi): spring `email` over → klartekst i `audit_log.new_values` efter `gruppe_kontakt_upsert` → FS rød. **T7.10 R** — indirect-vej: ikke instansieret; S-24 deklarerer »persondata-felt i dæknings-forstand = pii_level direct« (fundamentets egen semantik: `audit_filter_values` hasher kun direct · `generic_apply`/`test_run` dækker kun direct · `indirect` har ingen mekanik nogen steder — præcedens `clients.fields`); indirect-valg via UI er lovligt men udløser ingen anonymisering — synligt for gaten/Mathias (§10 bekræftelses-linje B-3). **T7.11 R** — JSONB fravalgt (V1/V2). **T7.12 R** — ingen retention valgt (princip 4); event_based-vej findes via fundamentets `retention_event_column` (UI-sætbar i `anonymization_mapping_upsert`, cron `6f0e1db3:325-369`); time_based/manual har ingen executor i fundamentet (arv, uden for pakken — §10) |
| K-7/S | 1.1 | `data_field_definition_upsert` / `_delete` (fælles indgange) · R+ og SA | **nedgraderingsforbud** (K:136): klassificér `gruppe_kontakter.email` direct (leverance) → forsøg direct→indirect/none → afvist; delete → afvist; rename af (schema,table,column) → afvist; efterfølgende `gruppe_kontakt_upsert` med sporværdi → audit hasher fortsat (FS) | neg-1: `data_field_definition_upsert(…,'email','master_data','none',…)` som R+ (classification/manage) → AK-PII-NEDGRADERING · neg-2: som SA → AK-PII-NEDGRADERING (ingen bypass) · neg-3: `data_field_definition_delete(…,'email',…)` → AK-PII-BESKYTTET · neg-4: opklassificering none→direct (adresse) → LYKKES (positiv, ac-3) | UT · FS | C9 | N7 | **T7.1 I** — locus `_pii_klassifikation_guard` nedgraderings-gren: fjern → neg-1 rød + klartekst i audit. **T7.2 I** — locus samme trigger delete-gren: fjern → neg-3 rød (definition kan slettes og genoprettes som none) |

**Kill-list-binding K-7:** S7.1 S · T7.1 I · T7.2 I · T7.3 I · T7.4 I · T7.5 I · T7.6 I · T7.7 I · T7.8 I · T7.9 I · T7.10 R · T7.11 R · T7.12 R · T7.13 I · T7.14 I. SL7.1 (katalog→klassifikation: migration-gate STRICT + ingen dynamisk DDL) · SL7.2 (nedgraderings-/delete-værn gennem de FÆLLES indgange — trigger på registry-tabellen) · SL7.3 (feltvis anonymisering, beskyttet audit, snapshot→replay, aktiv-mapping-redigering; indirect deklareret) · SL7.4 (kontakt-lifecycle lukket) leveres (§3 Bid 1/5).

### K-8 Adgang, audit, fortrydelse (K:147-161 · N8 · C0) → Bid 1 (gælder alle bids)

| ID | bid·step | indgang · rolle | positiv slut-effekt | negativer → AK | form | C | N | mutant |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| K-8/ac-1 | 1.1 (+ hver ny tabel/funktion i 2.1/4.1/5.1) | ctx-A på HVER pakke-tabel + EXECUTE på HVER intern funktion · anon og authenticated | lovlig R+-ændring via SECDEF-RPC først; derefter: DB-rolle verificeret non-bypass (`current_user='authenticated'`, `rolbypassrls=false`, ikke ejer) | neg-1: INSERT/UPDATE/DELETE/TRUNCATE på hver af de 9 tabeller → AK-DIREKTE-DML — også med selvsat `stork.allow_<tabel>_write='true'` og årsag · neg-2: `EXECUTE` på hver intern funktion (`_apply_*`, `_anonymiser_*_internal`, `_*_apply`, `_stamp_utc`, guards) → 42501 (revoke from public, anon, authenticated) · neg-3: `anonymize_generic_apply` direkte som authenticated → 42501 (S-12 revoke) · neg-4 (ctx-B, S): `has_table_privilege('authenticated', <tabel>, 'INSERT')` = false for alle 9 (fitness `app-write-revoke-discipline` `d1b4d601:1728-1744`) | UT | C0 | N8 | **T8.1 S** — grant-mutanten er redundant med RLS default-deny (ingen write-policy kan opfyldes af app-rollen uden grant; med grant men uden opfyldt policy stopper RLS) → schema-/privilegie-bevis (neg-4), ikke domæne-kill (kill-list T8.1 D10). **U02-mutant I:** genindfør authenticated-EXECUTE på `_apply_gruppe_klient_kobl` → neg-2 rød (direkte kald med gyldigt payload lykkes) |
| K-8/ac-2 | 1.2+ | HVER write-RPC (18 stk, §2) m. blank årsag · R+ | parametriseret suite: hver indgang → AK-AARSAG; audit-række efter lovligt kald bærer brugerens årsag (`audit_log_read`); vars nulstilles mellem aktører (`RESET`/ny tx) — fixture-global årsag forbudt; apply-handlere sætter `stork.change_reason := payload->>'change_reason'` FØR mutation (S-9) | neg-1: blank årsag pr. write-RPC → AK-AARSAG · neg-2 (ctx-B, S): INSERT uden var → `stork_audit` P0001 | UT · FS (audit) | C1-C9 | N8 | **T8.6 I** — locus årsags-gren (repræsentativt `lokation_saet_status`, parametriseret over alle 18): erstat blank med `'auto'` → neg-1 rød. **K-6(k)-arv I:** locus apply-handler: udelad `set_config('stork.change_reason', payload…)` → audit-rækkens `change_reason` = `'pending_change_apply'` → FS rød |
| K-8/ac-3 | 2.1 | ctx-A + ctx-B på `audit_log` og de tre historik-logs + koblings-/fravalgsrækker | — | neg-1 (ctx-A): UPDATE/DELETE/TRUNCATE → AK-DIREKTE-DML · neg-2 (ctx-B, S): audit → P0001 (`a7ec4884:174-207`); logs → AK-IMMUTABEL (pakkens guards) | UT | C10 | N8 | **S8.1 S** + pakkens tre guards = ctx-B-probe (T4.3 er domæne-killet for status-historik) |
| K-8/ac-4 | 1.2 | V og R− på read-/write-RPC'er · rolle-matrix | V: alle read-RPC'er svarer; R− uden page-read: hver read-RPC → AK-PERM (ingen data); direkte `SELECT` på tabellerne som R− → `rows = []` (select-policy `has_permission(<page>,'manage',false)`) — FS-udfald der asserteres; `lokation_pending_hent` for fremmed pending → AK-PERM (ingen payload) | neg-1: V kalder write-RPC → AK-PERM · neg-2: R− read-RPC → AK-PERM · neg-3: R− direkte SELECT → 0 rækker (FS, ikke fejl) | UT · FS | C0 | N8 | **T8.2 I** — locus write-gate: `has_permission(page,'manage',true)` → `(…,false)` → neg-1 rød (V kan skrive). **T8.5 I** — locus read-gate i `lokation_hent`: fjern → neg-2 rød. **T8.3/T8.4 R** — ingen `permission_actions` bruges (V10). **T8.9 I** — locus approve (fundament-kopi): fjern non-admin self-approve-check → K-6/ac-10/neg-7 rød. **T8.10 R** — intet række-scope valgt (S-20 page-bred); ikke-anvendelig, kildebundet |
| K-8/ac-5 | 1.3 · 2.3 | `m1_permission_matrix`-smoke + `role_permission_grant_set` (fælles) · SA → R+ | pages `grupper` + `lokationer` under `org_structure`, tab `manage` pr. page; superadmin har tab- OG page-grants; en ny rolle kan tildeles `lokationer/manage` via `role_permission_grant_set` og udfører derefter en handling (MH); A+ (page-can_write) kan approve pakkens pendings | neg-1 (leverance-mutant): udelad `manage`-tab-seed for `lokationer` → `role_permission_grant_set(rolle, 'tab', <lokationer/manage>)` har intet mål → R+ kan ikke tildeles → MH rød (SA's area-fallback skjuler det ikke, A-8) | MH · FS | C0 | N8 | **T8.8 I** — = neg-1 (tildelbarhed for R+, ikke SA-positiv) |
| K-8/S | 1.1 | `pg_get_functiondef`-assert | »lokations-særskilt rettigheds-mekanisme« designet UD: hver pakke-RPC's første gate er `core_identity.has_permission(...)` (assert: alle 18 write + 17 read indeholder kaldet; ingen `is_admin()` som eneste gate) | — | S | C0 | N8 | S |

**Kill-list-binding K-8:** T8.1 S · T8.2 I · T8.3 R · T8.4 R · T8.5 I · T8.6 I · T8.7 I (locus: fjern `*_audit`-trigger på `gruppe_klient_koblinger` → K-6/ac-10's audit-FS rød) · T8.8 I · T8.9 I · T8.10 R · S8.1 S. SL8.1 leveres som §2's ACL-/rolle-matrix.

### K-9 UI-styrbarhed (K:163-177 · N9 · C0-C10) → Bid 5 (samleharness) · ac-3 i Bid 2/3

| ID | bid·step | indgang · rolle | positiv slut-effekt | negativer → AK | form | C | N | mutant |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| K-9/ac-1 | 5.2 | HELE handlingslisten (§3 Bid 5.2) via PostgREST-API'et som R+ (non-admin, ctx-A) | hver handling udføres uden migration/deploy; genlæst via read-fladen efter hver handling (hård effekt); OpenAPI-spec for `core_identity` indeholder `/rpc/lokation_hent` og `/rpc/gruppe_hent` (sentinels tilføjet fitness `postgrest-t9-schema-exposure` `d1b4d601:1068-1074` — U08) | neg-1 (leverance-mutant): fjern `grant execute … to authenticated` på én krævet RPC → den positive kæde rød på netop det kald (MH-kill; 404/42501 tæller ikke som bestået negativ) | MH | C0-C10 | N9 | **T9.1 I** — = neg-1 |
| K-9/ac-2 | 5.2 | samme liste UDEN grant (R−) + `lokationer_liste`/`grupper_liste` over sidegrænsen | intet trin kræver psql/service-adgang (harnessen bruger kun API + ctx-A; SQL-kanalen kun til kontrollæsning); breddeprøve: >1000 produktproducerede lokationer → keyset-paginering (`p_antal`, `p_efter_navn`, `p_efter_id`) genfinder hver id præcis én gang (A-14) | neg-1: hver handling som R− → AK-PERM · neg-2: `p_antal := 5000` → AK-PAGINERING | UT · FS | C0-C10 | N9 | **T9.3 I** — locus `lokationer_liste`: ignorér `p_efter_*` (altid første side) → breddeprøve rød |
| K-9/ac-3 | 2/3-tests | pg_catalog-assert + SA-negativer + fælles konfig-indgange | intet strukturelt forbud kan slås fra: ingen pakke-RPC eksponerer CHECK-/guard-/override-parametre (signatur-assert); `permission_action_upsert` kan ikke sætte kode-låste flag (fundament, `3df4807f`); efter forsøg på konfig-omgåelse (undo_setting 0 · felt-registry · mapping-upsert) gentages N1/N2/N6 → fortsat afvist | neg-1: SA + blank navn → AK-NAVN · neg-2: SA + nedlagt til-valg → AK-NEDLAGT · neg-3: SA + pii-nedgradering → AK-PII-NEDGRADERING · neg-4: kald med `p_spring_validering_over` → AK-API-SIGNATUR | UT | C0 | N9 | **T9.2 R** — ingen UI-redigerbar required-metadata i modellen (fast signatur, S-16); bærende = signatur-S + neg-1..4 |
| K-9/S | — | — | »forbud der kan slås fra via UI« (ac-3) · »handling der kræver udvikler« (ac-1) — båret ovenfor; sider/formularer → lag F (§9) | — | — | — | N9 | — |

**Kill-list-binding K-9:** T9.1 I · T9.2 R · T9.3 I · T9.4 I (under K-6/ac-10). SL9.1 leveres som §2 (fuld signatur-/handlings-/læsematrix m. bid-ID, indgang, reject-klasse).

### Bijektion — bid → K (rogue-tjek) og forudsætnings-bindinger (D12)

| bid | bærer K (effekt bevist i biddet) | forudsætnings-indhold (D12: bindes til senere effekt-bid + K) |
| --- | --- | --- |
| 1 | K-3 (ac-3, ac-5) · K-7 (ac-1, ac-3 for gruppe-tabeller · **K-7/S**) · K-8 (ac-1, ac-2, ac-3-del, ac-4, ac-5-del) | — |
| 2 | K-1 (ac-1..4, S) · K-2 (ac-1, ac-2, ac-4, ac-6 inkl. SA-1, S) · K-3 (ac-1, ac-2) · K-4 (ac-3-struktur, ac-4) · K-7 (ac-1, ac-3) · K-8 (ac-5-del) · K-9 (ac-3-del) | `lokation_status_skift`-TABELLEN + `lokation_status_paa`/`lokation_er_bookbar`/`stand_er_bookbar`-oraklerne → **Bid 3 / K-4 ac-1,2,5,7 + K-5 + K-2 ac-3** · `lokation_gruppe_historik` → **Bid 4 / K-6 ac-7** · `dags_dato_utc()`/`_stamp_utc` → alle senere bids |
| 3 | K-2 (ac-3, ac-5) · K-4 (ac-1, ac-2, ac-5, ac-7) · K-5 (ac-1, ac-2, ac-3, ac-5, S) · K-9 (ac-3-del) | — |
| 4 | K-3 (ac-4, ac-6) · K-4 (ac-6, ac-8, ac-9) · K-6 (ac-1..10, S) · K-7 (ac-1 for koblings-tabeller) · K-8 (ac-2/ac-3 for koblings-tabeller) | — |
| 5 | K-7 (ac-2, ac-4) · K-9 (ac-1, ac-2) · alias-rækker K-1/ac-5, K-5/ac-4 | — |

Ingen K uden bid+test; intet bid uden K. Forudsætnings-indholdet i Bid 2 har INGEN egen effect-harness men er eksplicit bundet til Bid 3/4's K'er (D12) — »kolonnen findes«-tests er aldrig beviset. Bid 2 kan derfor ikke erklæres K-4-bevist; det kan Bid 3.

---

## 2. Funktions- og tabel-register (fuld kontrakt — A-11 · U02 · U05)

Alt her er **valgt her** (deklareret afledning) medmindre et forbillede er citeret. Byggeren opfinder intet navn, ingen parameter, ingen fejlkode.

### 2.1 Tabeller (9) — fælles hale (S-29 · S-30 · S-27)

Hver tabel: `id uuid primary key default gen_random_uuid()` · `created_at timestamptz not null default now()` (+ `updated_at` og `set_updated_at`-trigger på master-/relations-tabeller, ikke på logs) · `stork_audit`-trigger AFTER INSERT OR UPDATE OR DELETE (ALLE 9 — ingen AUDIT_EXEMPT-udvidelse) · `enable row level security` + `force row level security` (uniform; FORCE er irrelevant for SECDEF-ejer m. bypassrls — deklareret, F05) · `revoke all on table … from public, anon, authenticated, service_role` · `grant select on table … to authenticated` · **INGEN insert/update/delete/truncate-grant til nogen app-rolle** (S-29 — A-1/F01) · select-policy `for select to authenticated using (core_identity.has_permission('<page>','manage',false))` · på de 6 master-/relations-tabeller: insert-/update-policies `with check/using (current_setting('stork.allow_<tabel>_write', true) = 'true')` (kræves af fitness D4 `write-policy-session-var-consistency` `d1b4d601:757-831` for tabeller m. aktiv mapping; harmløse uden grant — uniformt på alle 6) · ingen delete-policy · `-- no-dedup-key: <grund>` · klassifikations-INSERT i SAMME fil (form `f467bafd:16-65`: top-level `set_config` ×3, én INSERT, `on conflict (table_schema, table_name, column_name) do nothing`; `category='master_data'` for alle 9 tabeller inkl. logs (S-28 — registryets CHECK `fb805b56:14-16` kender ikke `historik`), `pii_level='none'` overalt undtagen `gruppe_kontakter.{navn,email,telefon}='direct'`, `retention_type=null, retention_value=null` overalt (D1/D2 `5f93b405:48-59` tillader NULL/NULL), `purpose` udfyldt pr. kolonne — `lokationer.adresse` bærer purpose-teksten »Adresse (forretningsdata). Kan være indirekte personhenførbar for enkelt-butik (recon-flag) — aktivt UI-valg til direct aktiverer anonymiseringsvejen (mapping lokation)«).

| tabel | page | skrives af | særligt |
| --- | --- | --- | --- |
| `core_identity.grupper` | grupper | `gruppe_upsert`, `gruppe_saet_aktiv` | `type` nullable CHECK 4 værdier (V3) |
| `core_identity.gruppe_kontakter` | grupper | `gruppe_kontakt_upsert`, `gruppe_kontakt_saet_aktiv`, `_anonymiser_gruppe_kontakt_internal`, `_gruppe_kontakt_apply`, `generic_apply` | direct-PII ×3; `anonymized_at` |
| `core_identity.lokationer` | lokationer | `lokation_opret/_rediger/_saet_gruppe/_saet_hviledage`, `_anonymiser_lokation_internal`, `_lokation_apply` | `type NOT NULL` (S-16) · `dagspris NOT NULL` (V11) · `hviledage` nullable CHECK ≥1 · `anonymized_at` · index `(navn, id)` (S-25) |
| `core_identity.stande` | lokationer | `stand_opret/_rediger/_saet_aktiv`, `lokation_opret` | `dagspris` NULL = arv · `is_active` |
| `core_identity.lokation_status_skift` | lokationer | KUN `lokation_opret` (init) + `lokation_saet_status` | append-only; `_stamp_utc` BEFORE INSERT; `_historik_immutabel` BEFORE UPDATE/DELETE (row) + BEFORE TRUNCATE (statement); ingen write-policies |
| `core_identity.pris_historik` | lokationer | KUN triggere `_pris_historik_lokation`/`_pris_historik_stand` | som ovenfor |
| `core_identity.lokation_gruppe_historik` | lokationer | KUN trigger `_lokation_gruppe_historik` | som ovenfor |
| `core_identity.gruppe_klient_koblinger` | grupper | `_apply_gruppe_klient_kobl` (INSERT), `_apply_gruppe_klient_frakobl` (UPDATE `gaeldende_til`) | partial UNIQUE `(gruppe_id, klient_id) WHERE gaeldende_til IS NULL` · EXCLUDE gist pr. par · `_kobling_historik_guard` BEFORE UPDATE/DELETE |
| `core_identity.lokation_klient_fravalg` | lokationer | `_apply_lokation_klient_fravalg` (INSERT), `_apply_lokation_klient_fravalg_ophaev` (UPDATE `gaeldende_til`) | partial UNIQUE `(lokation_id, klient_id) WHERE …` · EXCLUDE · samme guard |

### 2.2 Hjælpere og trigger-funktioner (trigger-fns kræver ingen SECDEF-markør; hjælperen er invoker)

| funktion | signatur · sikkerhed | adfærd (bindende) | ACL |
| --- | --- | --- | --- |
| `core_identity.dags_dato_utc` | `() returns date` · `language sql volatile set search_path=''` | `select (clock_timestamp() at time zone 'UTC')::date` (S-18) | `revoke all from public; grant execute to authenticated, service_role` (bruges som default-argument) |
| `core_identity._stamp_utc` | `() returns trigger` · plpgsql invoker | `new.sat_kl := clock_timestamp(); new.sat_dato := (new.sat_kl at time zone 'UTC')::date; return new` — BEFORE INSERT på de tre logs (ingen default på kolonnerne: skrivevejen kan ikke vælge) | — |
| `core_identity._historik_immutabel` | `() returns trigger` · plpgsql | `raise exception '%_immutabel (operation %)', tg_table_name, tg_op using errcode='P0001'` — BEFORE UPDATE OR DELETE FOR EACH ROW + BEFORE TRUNCATE FOR EACH STATEMENT på de tre logs (form `a7ec4884:174-207`) | — |
| `core_identity._kobling_historik_guard` | `() returns trigger` · plpgsql | DELETE → P0001 (AK-IMMUTABEL). UPDATE tilladt KUN når `old.gaeldende_til is null and new.gaeldende_til is not null` og `(new.id, new.klient_id, new.gaeldende_fra, new.created_by_pending_change_id, new.created_at)` samt ejer-kolonnen (`gruppe_id`/`lokation_id`) er uændrede; ellers P0001. BEFORE UPDATE OR DELETE på koblinger + fravalg | — |
| `core_identity._pris_historik_lokation` | `() returns trigger` | AFTER INSERT OR UPDATE OF dagspris ON `lokationer`: `if tg_op='INSERT' or old.dagspris is distinct from new.dagspris then insert into pris_historik (lokation_id, ny_dagspris) values (new.id, new.dagspris)` (stamp-trigger sætter tid/dato) | — |
| `core_identity._pris_historik_stand` | `() returns trigger` | AFTER INSERT OR UPDATE OF dagspris ON `stande`: INSERT når `(tg_op='INSERT' and new.dagspris is not null) or (tg_op='UPDATE' and old.dagspris is distinct from new.dagspris)` — også → NULL (arv-reset-række m. `ny_dagspris NULL`) | — |
| `core_identity._lokation_gruppe_historik` | `() returns trigger` | AFTER INSERT OR UPDATE OF gruppe_id ON `lokationer`: `insert into lokation_gruppe_historik (lokation_id, gruppe_id) values (new.id, new.gruppe_id)` | — |
| `core_compliance._pii_klassifikation_guard` | `() returns trigger` · plpgsql `set search_path=''` | BEFORE UPDATE OR DELETE ON `core_compliance.data_field_definitions`: DELETE m. `old.pii_level='direct'` → AK-PII-BESKYTTET · UPDATE m. `old.pii_level='direct' and new.pii_level<>'direct'` → AK-PII-NEDGRADERING · UPDATE der ændrer `(table_schema, table_name, column_name)` på direct-række → AK-PII-BESKYTTET · ellers return new/old. **INGEN bypass-gren** (heller ikke `source_type='migration'`: en fremtidig lovlig nedklassificering kræver at migrationen dropper/genskaber triggeren — reviewet udviklerhandling, ikke UI). Fundament-bred effekt (beskytter også `clients.name` m.fl.) — deklareret; build-verifikationspunkt BV-4 (§10) | — |
| `core_compliance._mapping_daekning_guard` | `() returns trigger` · plpgsql | BEFORE UPDATE OF field_strategies ON `core_compliance.anonymization_mappings` WHEN `(old.status = 'active')`: for hver direct-kolonne i `(new.table_schema, new.table_name)` (information_schema ⋈ data_field_definitions, form `ec3d9a0b:213-230`): nøgle skal findes i `new.field_strategies` og strategien have `status in ('approved','active')` → ellers AK-DAEKNING; hver nøgle i `new.field_strategies` skal pege på en direct-kolonne → ellers AK-DAEKNING (stale). Generel for alle mappings (bevidst; lukker E208-gabet) — build-verifikationspunkt BV-3 (§10): r7a-/p2-suiten forbliver grøn | — |

### 2.3 Write-RPC'er (18) — `security definer set search_path=''` · `revoke all on function … from public, anon` · `grant execute … to authenticated` · SECDEF_SANCTIONED `"write-rpc"` · gate-rækkefølge BINDENDE: AK-PERM → AK-AARSAG → input-validering (AK-NAVN/TYPE/PRIS/PAAKRAEVET/HVILEDAGE/STATUS/…) → eksistens (AK-FINDES-IKKE, m. `FOR UPDATE` hvor angivet) → tilstands-vagter (INAKTIV/NEDLAGT/UAENDRET/SIDSTE-STAND/…) → **først derefter** `set_config('stork.source_type','manual',true)`, `set_config('stork.change_reason', p_change_reason, true)`, `set_config('stork.allow_<tabel>_write','true',true)` → mutation. (Skærpelse valgt her — F16: forbilledet `bb9ee808:29-58` tjekker ukendt-id EFTER UPDATE; her tjekkes eksistens FØR vars.) Fejlbesked-form `'<fn>: <sag>'`.

| # | bid | signatur | page | gates ud over PERM/AARSAG (i rækkefølge) → AK | mutation / retur |
| --- | --- | --- | --- | --- | --- |
| W1 | 1.2 | `core_identity.gruppe_upsert(p_navn text, p_change_reason text, p_type text default null, p_gruppe_id uuid default null) returns uuid` | grupper | NAVN · TYPE (hvis sat) · ved UPDATE: FINDES-IKKE (`for update`) | INSERT (`is_active` default true) eller UPDATE navn/type — rører ALDRIG `is_active` (form `bb9ee808:49-55`). Retur id |
| W2 | 1.2 | `core_identity.gruppe_saet_aktiv(p_gruppe_id uuid, p_is_active boolean, p_change_reason text) returns void` | grupper | PAAKRAEVET(gruppe) · FINDES-IKKE · UAENDRET (`gruppe_uaendret` hvis samme værdi — AK-UAENDRET 22023, samme klasse som STATUS-UAENDRET) | UPDATE is_active (V13) |
| W3 | 1.2 | `core_identity.gruppe_kontakt_upsert(p_gruppe_id uuid, p_navn text, p_change_reason text, p_email text default null, p_telefon text default null, p_kontakt_id uuid default null) returns uuid` | grupper | NAVN · PAAKRAEVET(gruppe) · FINDES-IKKE(gruppe) · ved UPDATE: FINDES-IKKE(kontakt, `for update`) · KONTAKT-LUKKET (`anonymized_at is not null`) | INSERT eller UPDATE navn/email/telefon; rører ALDRIG `is_active`/`anonymized_at`. Retur id |
| W4 | 1.2 | `core_identity.gruppe_kontakt_saet_aktiv(p_kontakt_id uuid, p_is_active boolean, p_change_reason text) returns void` | grupper | PAAKRAEVET · FINDES-IKKE · KONTAKT-LUKKET (S-23 — F13 lukket: begge kontakt-RPC'er er låst) · UAENDRET | UPDATE is_active |
| W5 | 2.2 | `core_identity.lokation_opret(p_navn text, p_type text, p_dagspris numeric, p_gruppe_id uuid, p_foerste_stand_navn text, p_change_reason text, p_adresse text default null, p_hviledage integer default null, p_foerste_stand_dagspris numeric default null) returns uuid` | lokationer | NAVN · TYPE · PRIS(lokation: NULL/negativ/>2 dec./≥10^10) · PAAKRAEVET(gruppe) · FINDES-IKKE(gruppe) · GRUPPE-INAKTIV (bypass `is_admin()`) · NAVN(stand) · PRIS(stand, NULL ok) · HVILEDAGE | atomisk i ÉN tx (form `71cadac3:235-246`): INSERT `lokationer` (triggere skriver pris- + gruppe-historik) → INSERT `stande` (første stand, `is_active=true`) → INSERT `lokation_status_skift (lokation_id, status) values (id, 'aktiv')` (stamp-trigger daterer). Vars: `allow_lokationer/stande/lokation_status_skift_write`. Retur lokations-id |
| W6 | 2.2 | `core_identity.lokation_rediger(p_lokation_id uuid, p_navn text, p_type text, p_dagspris numeric, p_change_reason text, p_adresse text default null) returns void` | lokationer | NAVN · TYPE · PRIS · PAAKRAEVET · FINDES-IKKE (`for update`) | UPDATE navn/adresse/type/dagspris (pris-trigger logger ved ændring). Rører ALDRIG gruppe_id/hviledage/status (fraværs-effekt). Tilladt på nedlagt (S-8) |
| W7 | 2.2 | `core_identity.lokation_saet_gruppe(p_lokation_id uuid, p_gruppe_id uuid, p_change_reason text) returns void` | lokationer | PAAKRAEVET ×2 · FINDES-IKKE(lokation, `for update`) · FINDES-IKKE(gruppe) · GRUPPE-INAKTIV (bypass) · UAENDRET (`gruppe_uaendret`) | UPDATE gruppe_id (trigger skriver historik-række dateret `dags_dato_utc()` via stamp). Tilladt på nedlagt (S-8) |
| W8 | 2.2 | `core_identity.lokation_saet_hviledage(p_lokation_id uuid, p_hviledage integer, p_change_reason text) returns void` | lokationer | HVILEDAGE (sat og <1) · PAAKRAEVET · FINDES-IKKE (`for update`) | UPDATE hviledage — UPDATE-WHERE `id = p_lokation_id` (T5.5); `NULL` = fjern valget. Straks-virkning, ingen pending (K-5 ac 3 · V10) |
| W9 | 2.2 | `core_identity.stand_opret(p_lokation_id uuid, p_navn text, p_change_reason text, p_dagspris numeric default null) returns uuid` | lokationer | NAVN · PRIS(NULL ok) · PAAKRAEVET(lokation) · FINDES-IKKE(lokation, `for update`) · NEDLAGT (`lokation_status_paa(id, v_i_dag) = 'nedlagt'` — ingen bypass, S-8) | INSERT stand. Retur id |
| W10 | 2.2 | `core_identity.stand_rediger(p_stand_id uuid, p_navn text, p_dagspris numeric, p_change_reason text) returns void` | lokationer | NAVN · PRIS(NULL = sæt til arv) · PAAKRAEVET · FINDES-IKKE (`for update`) | UPDATE navn/dagspris (trigger logger, også → NULL). Ingen lokations-parameter (flyt findes ikke) |
| W11 | 2.2 | `core_identity.stand_saet_aktiv(p_stand_id uuid, p_is_active boolean, p_change_reason text) returns void` | lokationer | PAAKRAEVET · FINDES-IKKE(stand) · **lås:** `select id from core_identity.lokationer where id = <standens lokation> for update` (S-19) · UAENDRET · ved deaktivering af aktiv stand: `count(*) where lokation_id=… and is_active` = 1 → SIDSTE-STAND | UPDATE is_active |
| W12 | 3.1 | `core_identity.lokation_saet_status(p_lokation_id uuid, p_status text, p_change_reason text, p_dvale_ophoer date default null) returns void` | lokationer | STATUS · OPHOER-DVALE · PAAKRAEVET · FINDES-IKKE (`for update` — serialiserer skift pr. lokation) · `v_i_dag := dags_dato_utc()` · OPHOER-FORTID (`p_dvale_ophoer <= v_i_dag`) · `v_nu := lokation_status_paa(id, v_i_dag)`; STATUS-UAENDRET hvis `v_nu = p_status` — UNDTAGEN `p_status='dvale'` og seneste rækkes `dvale_ophoer is distinct from p_dvale_ophoer` (S-6) | INSERT `lokation_status_skift (lokation_id, status, dvale_ophoer)`; stamp-trigger daterer. Ingen backdate-parameter (fortid designet urørlig). Genåbning (K-4 ac 7) = samme RPC m. `'aktiv'`; stop-før-tid (K-5 ac 2) = samme; nedlæggelse skriver INGEN kaskade (V8) |
| W13 | 4.2 | `core_identity.gruppe_klient_kobl(p_gruppe_id uuid, p_klient_id uuid, p_gaeldende_fra date, p_change_reason text) returns uuid` | grupper | PAAKRAEVET ×3 · FINDES-IKKE(gruppe) · GRUPPE-INAKTIV (bypass `is_admin()`) · FINDES-IKKE(klient, `core_identity.clients`) · KLIENT-INAKTIV (bypass) · DATO-FORTID · KOBLING-FINDES (åben række) | `set_config('stork.t9_write_authorized','true',true)` (G059 `6f8f00a1:34-35`) → `pending_change_request('gruppe_klient_kobl', p_gruppe_id, jsonb_build_object('gruppe_id',…::text,'klient_id',…::text,'gaeldende_fra',…::text,'change_reason',p_change_reason), p_gaeldende_fra)`. Retur pending-id |
| W14 | 4.2 | `core_identity.gruppe_klient_frakobl(p_gruppe_id uuid, p_klient_id uuid, p_gaeldende_fra date, p_change_reason text) returns uuid` | grupper | PAAKRAEVET ×3 · FINDES-IKKE(gruppe) · FINDES-IKKE(klient) · DATO-FORTID · INGEN-KOBLING · DATO-FOER-START (`p_gaeldende_fra <= aaben.gaeldende_fra`) — INGEN inaktiv-/nedlagt-guard (V4/V13: frakobling skal altid kunne ske) | request `'gruppe_klient_frakobl'` (samme payload-form) |
| W15 | 4.2 | `core_identity.lokation_klient_fravaelg(p_lokation_id uuid, p_klient_id uuid, p_gaeldende_fra date, p_change_reason text) returns uuid` | lokationer | PAAKRAEVET ×3 · FINDES-IKKE(lokation) · NEDLAGT (`lokation_status_paa(id, v_i_dag)='nedlagt'` — INGEN bypass, V4/S-7) · FINDES-IKKE(klient) · DATO-FORTID · IKKE-I-GRUPPEN (dækkende åben/fremtidig kobling (lokationens NUVÆRENDE gruppe, klient) på `p_gaeldende_fra`) · FRAVALG-FINDES | request `'lokation_klient_fravalg'` target `p_lokation_id`, payload `{lokation_id, klient_id, gaeldende_fra, change_reason}` |
| W16 | 4.2 | `core_identity.lokation_klient_fravalg_ophaev(p_lokation_id uuid, p_klient_id uuid, p_gaeldende_fra date, p_change_reason text) returns uuid` | lokationer | PAAKRAEVET ×3 · FINDES-IKKE(lokation) · NEDLAGT (K-4 ac 8 — ingen bypass) · FINDES-IKKE(klient) · DATO-FORTID · IKKE-I-GRUPPEN (K-6 ac 4) · INTET-FRAVALG · DATO-FOER-START | request `'lokation_klient_fravalg_ophaev'` |
| W17 | 5.1 | `core_identity.anonymiser_gruppe_kontakt(p_kontakt_id uuid, p_change_reason text) returns void` | grupper | PAAKRAEVET · FINDES-IKKE(kontakt) | `perform core_identity._anonymiser_gruppe_kontakt_internal(p_kontakt_id, p_change_reason)` (p1c-formen `ca921ccb:20-54`); generic_apply's egne gates arves (AK-FUNDAMENT) |
| W18 | 5.1 | `core_identity.anonymiser_lokation(p_lokation_id uuid, p_change_reason text) returns void` | lokationer | PAAKRAEVET · FINDES-IKKE(lokation) | `perform core_identity._anonymiser_lokation_internal(p_lokation_id, p_change_reason)`; uden aktivt PII-valg/aktiv mapping → fundamentets P0002/P0001 (inaktiv struktur afviser) |

### 2.4 Read-RPC'er (17) — `security definer stable set search_path=''` · eksplicit gate `has_permission('<page>','manage',false)` → AK-PERM som FØRSTE statement · `revoke all from public, anon` · `grant execute to authenticated` · SECDEF_SANCTIONED `"laese-rpc"` · **typede `returns table(...)`, aldrig jsonb** (S-26) · page-bred læsning uden række-scope (S-20 — visibility bruges ikke; `has_permission` læser den ikke, `07ec8a8e:15-85`) · klient-navne returneres IKKE (kun `klient_id`; navne via `client_get`/`client_list` m. egen gate — A-6) · keyset-paginering: `p_antal integer default 200` (1..1000 ellers AK-PAGINERING), `p_efter_navn text default null`, `p_efter_id uuid default null`; `order by navn, id`; `where (p_efter_navn is null) or (navn, id) > (p_efter_navn, p_efter_id)` (S-25 — A-14). SECDEF er valgt fordi oraklerne læser på tværs af pages (koblinger under `grupper`, fravalg/status under `lokationer`) — INVOKER ville give forretningsfalsk `false` for en lokationer-læser uden grupper-grant (A-6).

| # | bid | signatur | page-gate | logik (bindende) |
| --- | --- | --- | --- | --- |
| R1 | 1.2 | `core_identity.gruppe_hent(p_gruppe_id uuid) returns table (id uuid, navn text, type text, is_active boolean, created_at timestamptz, updated_at timestamptz)` | grupper | FINDES-IKKE hvis ingen række |
| R2 | 1.2 | `core_identity.grupper_liste(p_antal integer default 200, p_efter_navn text default null, p_efter_id uuid default null) returns table (id uuid, navn text, type text, is_active boolean, created_at timestamptz, updated_at timestamptz)` | grupper | keyset; aktive + inaktive |
| R3 | 1.2 | `core_identity.gruppe_kontakter_liste(p_gruppe_id uuid, p_antal integer default 200, p_efter_navn text default null, p_efter_id uuid default null) returns table (id uuid, gruppe_id uuid, navn text, email text, telefon text, is_active boolean, anonymized_at timestamptz, created_at timestamptz, updated_at timestamptz)` | grupper | FINDES-IKKE(gruppe); keyset |
| R4 | 2.2 | `core_identity.lokation_status_paa(p_lokation_id uuid, p_dato date default core_identity.dags_dato_utc()) returns text` | lokationer | FINDES-IKKE(lokation) · seneste række i `lokation_status_skift` m. `sat_dato <= p_dato` (`order by seq desc limit 1`); ingen række → NULL · hvis `status='dvale' and dvale_ophoer is not null and dvale_ophoer <= p_dato` → `'aktiv'` (halvåbent, S-4) · ellers rækkens status |
| R5 | 2.2 | `core_identity.lokation_er_bookbar(p_lokation_id uuid, p_dato date default core_identity.dags_dato_utc()) returns boolean` | lokationer | `coalesce(core_identity.lokation_status_paa(p_lokation_id, p_dato) = 'aktiv', false)`. Ingen klient-/override-parameter (K-5 ac 1) |
| R6 | 2.2 | `core_identity.stand_er_bookbar(p_stand_id uuid, p_dato date default core_identity.dags_dato_utc()) returns boolean` | lokationer | FINDES-IKKE(stand) · `stande.is_active and core_identity.lokation_er_bookbar(stande.lokation_id, p_dato)` (stand-aktivflag er udateret — deklareret) |
| R7 | 2.2 | `core_identity.lokation_dagspris_paa(p_lokation_id uuid, p_dato date default core_identity.dags_dato_utc()) returns numeric` | lokationer | FINDES-IKKE · seneste `pris_historik`-række (`lokation_id`, `sat_dato <= p_dato`, `order by seq desc limit 1`).`ny_dagspris`; ingen række → NULL (før oprettelse). Dagens SIDSTE pris gælder dagen (S-5) |
| R8 | 2.2 | `core_identity.stand_dagspris_paa(p_stand_id uuid, p_dato date default core_identity.dags_dato_utc()) returns numeric` | lokationer | FINDES-IKKE(stand) · seneste stand-række ≤ dato; ikke fundet ELLER `ny_dagspris is null` → `lokation_dagspris_paa(stande.lokation_id, p_dato)` (K-2 ac 2: altid ét svar) |
| R9 | 2.2 | `core_identity.lokation_hent(p_lokation_id uuid) returns table (id uuid, navn text, adresse text, type text, dagspris numeric, gruppe_id uuid, hviledage integer, status text, bookbar boolean, anonymized_at timestamptz, created_at timestamptz, updated_at timestamptz)` | lokationer | FINDES-IKKE · `status := lokation_status_paa(id)` · `bookbar := lokation_er_bookbar(id)` (dags dato) |
| R10 | 2.2 | `core_identity.lokationer_liste(p_antal integer default 200, p_efter_navn text default null, p_efter_id uuid default null) returns table (id uuid, navn text, adresse text, type text, dagspris numeric, gruppe_id uuid, hviledage integer, status text, created_at timestamptz, updated_at timestamptz)` | lokationer | keyset over `(navn, id)`; `status` pr. række via R4 (dags dato) |
| R11 | 2.2 | `core_identity.stande_liste(p_lokation_id uuid, p_antal integer default 200, p_efter_navn text default null, p_efter_id uuid default null) returns table (id uuid, lokation_id uuid, navn text, dagspris numeric, is_active boolean, created_at timestamptz, updated_at timestamptz)` | lokationer | FINDES-IKKE(lokation); keyset |
| R12 | 3.1 | `core_identity.lokation_status_historik(p_lokation_id uuid) returns table (seq bigint, status text, dvale_ophoer date, sat_kl timestamptz, sat_dato date)` | lokationer | FINDES-IKKE · alle events `order by seq` (K-4 ac 4 »hvad gjaldt hvornår«) |
| R13 | 4.3 | `core_identity.klient_maa_staa_paa(p_klient_id uuid, p_lokation_id uuid, p_dato date default core_identity.dags_dato_utc()) returns boolean` | lokationer | FINDES-IKKE(lokation) · FINDES-IKKE(klient) · `v_gruppe :=` seneste `lokation_gruppe_historik`-række m. `sat_dato <= p_dato` (`seq desc`).gruppe_id (NULL → false) · `v_koblet := exists(koblinger where gruppe_id=v_gruppe and klient_id=p_klient_id and gaeldende_fra <= p_dato and (gaeldende_til is null or gaeldende_til > p_dato))` · `v_fravalgt := exists(fravalg where lokation_id=… and klient_id=… and samme dato-prædikat)` · `v_status := lokation_status_paa(p_lokation_id, p_dato)` · **return v_koblet and not v_fravalgt and v_status is not null and v_status <> 'nedlagt'** — alle led på SAMME `p_dato` (V8) |
| R14 | 4.3 | `core_identity.lokation_klienter(p_lokation_id uuid, p_dato date default core_identity.dags_dato_utc()) returns table (klient_id uuid)` | lokationer | FINDES-IKKE · mængdeformen af R13 (samme tre led); tom for nedlagt dato |
| R15 | 4.3 | `core_identity.gruppe_koblinger_liste(p_gruppe_id uuid, p_dato date default core_identity.dags_dato_utc()) returns table (id uuid, klient_id uuid, gaeldende_fra date, gaeldende_til date)` | grupper | FINDES-IKKE(gruppe) · rækker dækkende `p_dato`; `order by klient_id, gaeldende_fra` |
| R16 | 4.3 | `core_identity.lokation_fravalg_liste(p_lokation_id uuid, p_dato date default core_identity.dags_dato_utc()) returns table (id uuid, klient_id uuid, gaeldende_fra date, gaeldende_til date)` | lokationer | FINDES-IKKE · rækker dækkende `p_dato` |
| R17 | 4.3 | `core_identity.lokation_pending_hent(p_pending_id uuid) returns table (pending_id uuid, change_type text, status text, oensket_fra date, gruppe_id uuid, lokation_id uuid, klient_id uuid, change_reason text, requested_by uuid, approved_by uuid, undo_deadline timestamptz, applied_at timestamptz)` | særlig | række i `pending_changes` m. `change_type in` pakkens 4 typer ellers FINDES-IKKE · adgang: `requested_by = current_employee_id()` ELLER `is_admin()` ELLER `has_permission(<page for typen: kobl/frakobl → 'grupper', fravalg/ophaev → 'lokationer'>, null, true)` — ellers AK-PERM (spejler select-policyens grene `4df2fca6:24-39` — ingen payload-læk) · felter fra payload (`gruppe_id`/`lokation_id`/`klient_id`/`change_reason`) + `effective_from` som `oensket_fra` (S-17: ønsket dato; effektiv dato læses på relationen) |

### 2.5 Interne funktioner (8) — `security definer set search_path=''` · `revoke all on function … from public, anon, authenticated` (eksplicit — default-privilegiet `c6fb84d2:39-41` ville ellers give authenticated EXECUTE, U02) · SECDEF_SANCTIONED `"intern-handler"` · kaldes KUN af `pending_change_apply`, `replay_anonymization`, retention-cron og pakkens egne wrappers

| # | bid | signatur | adfærd (bindende) |
| --- | --- | --- | --- |
| I1-I4 | 4.2 | `core_identity._apply_gruppe_klient_kobl(p_payload jsonb, p_change_id uuid) returns void` · `_apply_gruppe_klient_frakobl(…)` · `_apply_lokation_klient_fravalg(…)` · `_apply_lokation_klient_fravalg_ophaev(…)` | (1) parse payload (`gruppe_id`/`lokation_id`, `klient_id`, `gaeldende_fra`, `change_reason`); manglende → 22023 `invalid_payload` · (2) `select requested_by, effective_from into … from pending_changes where id = p_change_id`; `payload->>'gaeldende_fra' <> effective_from::text` → AK-DATO-DRIFT · (3) **lås (S-19):** kobl/frakobl: `select id from grupper where id = … for update`; fravalg/ophæv: `select id from lokationer where id = … for update` · (4) `v_i_dag := dags_dato_utc()`; `v_effektiv := greatest(payload-dato, v_i_dag)` (S-17) · (5) **genvalidering af ALLE wrapper-vagter** pr. type (kobl: gruppe findes/aktiv m. bypass `is_admin_by_employee_id(requested_by)` (`713960b8:25-47` — ALDRIG `is_admin()`: cron har `auth.uid()` NULL), klient findes/aktiv m. bypass, KOBLING-FINDES · frakobl: INGEN-KOBLING, DATO-FOER-START (`v_effektiv <= aaben.gaeldende_fra`) · fravalg: lokation findes, NEDLAGT på `v_i_dag` UDEN bypass, IKKE-I-GRUPPEN på `v_effektiv`, FRAVALG-FINDES · ophæv: NEDLAGT, IKKE-I-GRUPPEN, INTET-FRAVALG, DATO-FOER-START) · (6) `set_config('stork.change_reason', payload->>'change_reason', true)` FØR mutation (S-9); `set_config('stork.allow_<tabel>_write','true',true)` · (7) mutation: kobl/fravælg = INSERT `(…_id, klient_id, gaeldende_fra := v_effektiv, created_by_pending_change_id := p_change_id)`; frakobl/ophæv = `update … set gaeldende_til = v_effektiv where id = <aaben.id>` (guard-triggeren tillader præcis dét). Fejl i (5) → exception → `pending_change_apply` aborter; pending forbliver `approved`, cron logger `partial_failure` (fundamentets kontrakt `c3b2865c:394-435`/E069 — arv, deklareret) |
| I5 | 5.1 | `core_identity._anonymiser_gruppe_kontakt_internal(p_kontakt_id uuid, p_reason text) returns void` | `perform core_compliance.anonymize_generic_apply('gruppe_kontakt', p_kontakt_id, p_reason)` → derefter `set_config('stork.allow_gruppe_kontakter_write','true',true)`, `set_config('stork.change_reason','anonymisering: '||p_reason,true)`, `update gruppe_kontakter set is_active=false where id=p_kontakt_id and is_active` (S-23). `grant execute to service_role` (retention-cron-form `c5b47ec5:130-131`) |
| I6 | 5.1 | `core_identity._gruppe_kontakt_apply(p_kontakt_id uuid, p_snapshot jsonb, p_reason text) returns void` | replay-apply (kaldes af `replay_anonymization` `6f0e1db3:270-288` med `field_mapping_snapshot`): for hver nøgle i `jsonb_object_keys(p_snapshot)`: nøgle ∉ {navn,email,telefon} → P0001 `ukendt_kolonne_i_snapshot`; `v_strategi := p_snapshot->nøgle->>'strategy'` (NESTET format `6083fecd:92-93`); registry-opslag `where strategy_name = v_strategi and status = 'active'` — ingen række → AK-STRATEGI-UKENDT (ALDRIG coalesce til originalværdi — E109-fælden); callable via `(function_schema||'.'||function_name||'(text, text)')::regprocedure` + pg_proc-lookup (form `6083fecd:84-91`); dynamisk `update … set <kol> = <fn>(<kol>, $1), …, anonymized_at = now(), is_active = false where id = $2` (`$1 = p_kontakt_id::text`). `grant execute to service_role` |
| I7 | 5.1 | `core_identity._anonymiser_lokation_internal(p_lokation_id uuid, p_reason text) returns void` | `perform core_compliance.anonymize_generic_apply('lokation', p_lokation_id, p_reason)` (ingen status-/aktiv-ændring — lokationens livscyklus er K-4's) |
| I8 | 5.1 | `core_identity._lokation_apply(p_lokation_id uuid, p_snapshot jsonb, p_reason text) returns void` | som I6 men nøgler valideres mod `information_schema.columns` for `core_identity.lokationer` (ukendt → P0001); `anonymized_at = now()`; ingen `is_active` |

### 2.6 Fundament-funktioner der CREATE OR REPLACE'es / policies der genskabes (Bid 4.2) — fra SENESTE blob, aldrig ældre

| objekt | kilde-blob (kopiér body) | tilføjelse (og INTET andet) |
| --- | --- | --- |
| `core_identity.pending_change_apply(uuid)` | `f49e7d5b:152-218` | 4 `when`-grene i CASE: `'gruppe_klient_kobl'` → I1 · `'gruppe_klient_frakobl'` → I2 · `'lokation_klient_fravalg'` → I3 · `'lokation_klient_fravalg_ophaev'` → I4 |
| `core_identity.pending_change_approve(uuid)` | `ae336ee6:8-120` | 4 `when` i page-key-CASE: kobl/frakobl → `'grupper'`; fravalg/ophaev → `'lokationer'` |
| `core_identity.pending_change_undo(uuid)` | `ae336ee6:122-183` | samme 4 `when` |
| policy `pending_changes_select` | `4df2fca6:17-60` (DROP + CREATE, fuld tekst) | to grene efter `client_place`-grenen: `(action_id is null and change_type in ('gruppe_klient_kobl','gruppe_klient_frakobl') and core_identity.has_permission('grupper', null, true))` · `(action_id is null and change_type in ('lokation_klient_fravalg','lokation_klient_fravalg_ophaev') and core_identity.has_permission('lokationer', null, true))` |
| `core_identity.undo_settings` seed | form `f49e7d5b:222-230` | 4 rækker à `24 * 3600`, `on conflict (change_type) do nothing` (eksplicit — 24 t-fallbacken `ae336ee6:103` må aldrig VÆRE kontrakten) |
| `core_compliance.anonymize_generic_apply(text, uuid, text)` | — (ingen body-ændring) | `revoke execute … from public, anon, authenticated` (S-12; E119-E121) |

Ingen `permission_actions` oprettes (V10). Self-approve: fundamentets regel arves (`ae336ee6:56-61`: forbudt for non-admin ved `action_id NULL`; SA må) — F07.

---

## 3. Bid-opdeling (afhængigheds-ordnet · prover-bevisbar · angrebs-spec-krav + risiko-flag pr. bid)

Fælles for alle bids: (i) tabel-hale + klassifikation pr. §2.1 · (ii) write-RPC-gate-rækkefølge pr. §2.3 · (iii) read-RPC-form pr. §2.4 · (iv) fitness-vedligehold pr. bid: `SECDEF_SANCTIONED`-entry pr. ny SECDEF-signatur (`d1b4d601:1535ff`; stale entries = rød) · `TX_WRAP_REQUIRED_FOR_TEST_INSERT` (`:92-118`) + biddets tabeller · `IMMUTABLE_TABLES_REQUIRE_TRUNCATE_BLOCK` (`:79-86`) + `IMMUTABLE_GUARDS` (`:1160-1170`) for de tre logs (`guardFn: "_historik_immutabel", flags: null`) og for koblinger/fravalg (`guardFn: "_kobling_historik_guard", flags: ["gaeldende_til"]`) · `postgrestT9SchemaExposure.expectedRpcs` (`:1068-1074`) + `"/rpc/gruppe_hent"` (Bid 1) og `"/rpc/lokation_hent"` (Bid 2) — U08 · `LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS` (`:151-164`): PRÆCIS de pakke-funktioner fitness' `legacy-is-active-readers` navngiver, m. begrundelse »tabellen har kun is_active, ingen status-kolonne« — ingen andre · INGEN AUDIT_EXEMPT-, FK_COVERAGE-, CROSS_SCHEMA_FK- eller POLICY_INDEX-udvidelser (pakken behøver ingen) · `pnpm types:generate` committes (`70d52135:13-15,25-49`) · advisor-baseline ajourføres kun for nye SECDEF-eksponeringer · (v) **»Done« pr. bid** = biddets effect-harnesses (§1-rækker m. dette bid som effekt-bid) + alle deres negativer (pinnet AK-klasse, ctx-A/ctx-B som angivet) + alle **I**-mutanter dræbt via FA-1-adapteren + SA-1 (hvor angivet) via FA-2 + CI grøn (fitness/migration-gate/types/db:test) + Codex' P-7-resultat for diff ⊨ plan. Migrationsfil-navne er bindende (S-15).

### Bid 1 — Gruppe-fundamentet + klassifikationsværn (K-3 ac-3/5 · K-7 ac-1/3 + K-7/S · K-8 ac-1..5)

Afhænger af: intet (første bid). Trin C-forudsætning: FA-1 adapter-PASS.

**Step 1.1 — migration `20260910100000_t10b_01_grupper_tabeller.sql`:**

```sql
-- no-dedup-key: master-data; id er stabil PK; udfasning via is_active (K-3 ac 5, V13)
create table core_identity.grupper (
  id          uuid primary key default gen_random_uuid(),
  navn        text not null check (length(trim(navn)) > 0),
  type        text check (type is null or type in ('kaede','enkelt_butik','messe_operatoer','andet')),  -- V3
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- no-dedup-key: kontaktpersoner; id er stabil PK; anonymiseret kontakt lukkes, ny kontaktperson = ny raekke (S-23)
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
create index grupper_navn_id_idx on core_identity.grupper (navn, id);                     -- keyset (S-25)
create index gruppe_kontakter_navn_id_idx on core_identity.gruppe_kontakter (gruppe_id, navn, id);
```

\+ hale pr. §2.1 for begge (vars `stork.allow_grupper_write`, `stork.allow_gruppe_kontakter_write`; page `grupper`) + **`_pii_klassifikation_guard`** (§2.2) + `create trigger data_field_definitions_pii_guard before update or delete on core_compliance.data_field_definitions for each row execute function core_compliance._pii_klassifikation_guard();` (FØR klassifikations-INSERT'en — guarden rører ikke INSERT) + klassifikations-INSERT i samme fil (alle kolonner `master_data`/`none`/NULL/NULL; `gruppe_kontakter.navn`, `.email`, `.telefon` = `direct` m. purpose »Kontaktpersonens <felt> — persondata, §11-grænsen; anonymiseres via mapping gruppe_kontakt«).

**Step 1.2 — migration `20260910100001_t10b_02_gruppe_rpcs.sql`:** W1-W4 + R1-R3 pr. §2.3/§2.4.

**Step 1.3 — migration `20260910100002_t10b_03_gruppe_seed_permissions.sql`:** seed-formen `fcf49401:17-56` (top-level `set_config` inkl. `stork.t9_write_authorized`; area-scoped JOINs mod `org_structure`): page `grupper` + tab `manage` + superadmin-grants på BÅDE tab-niveau OG page-niveau (`can_access=true, can_write=true, visibility='all'`; page-grantet fordi approve-gaten `ae336ee6:49-53` kalder `has_permission(page, null, true)`). ON CONFLICT-mål = det NUVÆRENDE 5-kolonne-unikindex: `on conflict (role_id, coalesce(area_id::text,''), coalesce(page_id::text,''), coalesce(tab_id::text,''), coalesce(action_id::text,'')) do nothing` (`5a09930f:86-93` — IKKE t10's 4-kolonne-form). Legacy `role_page_permissions` seedes IKKE.

**Fejl-loci Bid 1:** `has_permission`-kaldet som første statement i W1-W4/R1-R3 · AK-AARSAG-grenene · AK-NAVN-grenen (T3.2) · gate-rækkefølgen (vars efter alle checks) · fraværet af DML-grants (S-29) · select-policy-formen · seed-fuldstændighed (page + tab + begge grant-niveauer) · klassifikations-tuplerne (3 × direct) · pii-guardens to grene (T7.1/T7.2) · KONTAKT-LUKKET i W3 og W4 (T7.13-forudsætning; effekt bevises i Bid 5). **Harness-form:** ctx-A som R+ (positiv), R− (AK-PERM), V (K-8/ac-4) og SA (strukturvagter); ctx-B kun for S-beviser. **Done:** K-3/ac-3, K-3/ac-5 (uden inaktiv-gruppe-negativerne der kræver `lokation_opret` — de bevises i Bid 2), K-7/ac-1 (leverance), K-7/ac-3 (gruppe-tabeller), **K-7/S** (fuldt: neg-1..4 + T7.1 + T7.2 dræbt — direct-kolonnerne findes fra dette bid), K-8/ac-1 (2 tabeller), K-8/ac-2 (W1-W4), K-8/ac-4, K-8/ac-5 (grupper-del), K-8/S — grønne. **Angrebs-spec-krav:** Codex efterprøver at AK-DIREKTE-DML rammer alle fire operationer på begge tabeller under ctx-A med selvsatte vars, at 42501 kommer fra privilegie-laget (ikke policy), og at pii-guarden afviser SA. **Risiko-flag: LAV** (skabelon-appliance + én trigger) — targeted mutanter, ingen bred mutation.

### Bid 2 — Lokation + stande + historik-logs + status-struktur + UTC-fundament (K-1 · K-2 · K-3 ac-1/2 · K-4-struktur · K-8 ac-5 · K-9 ac-3-del)

Afhænger af: Bid 1 (gruppe-FK). **Forudsætnings-indhold (D12):** `lokation_status_skift` + R4/R5/R6 → Bid 3 (K-4 ac-1/2/5/7, K-5, K-2 ac-3); `lokation_gruppe_historik` → Bid 4 (K-6 ac-7); `dags_dato_utc`/`_stamp_utc` → alle senere bids.

**Step 2.1 — migration `20260910110000_t10b_04_lokation_tabeller.sql`:** først hjælperne `dags_dato_utc`, `_stamp_utc`, `_historik_immutabel` (§2.2), derefter:

```sql
-- no-dedup-key: master-data; id er stabil PK (S-1: to-tabel-model — cykler/under-stande urepraesenterbare)
create table core_identity.lokationer (
  id            uuid primary key default gen_random_uuid(),
  navn          text not null check (length(trim(navn)) > 0),
  adresse       text,
  type          text not null check (type in ('butik','messe','marked','event','andet')),   -- S-16
  dagspris      numeric(12,2) not null check (dagspris >= 0),                                  -- V11
  gruppe_id     uuid not null references core_identity.grupper(id) on delete restrict,
  hviledage     integer check (hviledage is null or hviledage >= 1),                          -- V9: NULL = intet valg (M-21)
  anonymized_at timestamptz,                                                                  -- §1.12; inaktiv struktur (K-7 ac 4)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index lokationer_gruppe_idx   on core_identity.lokationer (gruppe_id);
create index lokationer_navn_id_idx  on core_identity.lokationer (navn, id);

-- no-dedup-key: master-data under lokation; stande slettes aldrig (M-14)
create table core_identity.stande (
  id          uuid primary key default gen_random_uuid(),
  lokation_id uuid not null references core_identity.lokationer(id) on delete restrict,
  navn        text not null check (length(trim(navn)) > 0),
  dagspris    numeric(12,2) check (dagspris is null or dagspris >= 0),                         -- NULL = arv (V11)
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index stande_lokation_navn_id_idx on core_identity.stande (lokation_id, navn, id);

-- APPEND-ONLY status-event-log (S-2/V9: EN status-sandhed, ingen status-kolonne paa lokationer)
-- no-dedup-key: event-log; seq er total orden; sat_kl/sat_dato saettes af _stamp_utc (S-18)
create table core_identity.lokation_status_skift (
  id           uuid primary key default gen_random_uuid(),
  seq          bigint generated always as identity unique,
  lokation_id  uuid not null references core_identity.lokationer(id) on delete restrict,
  status       text not null check (status in ('aktiv','dvale','nedlagt')),
  dvale_ophoer date check (status = 'dvale' or dvale_ophoer is null),
  sat_kl       timestamptz not null,
  sat_dato     date not null,
  created_at   timestamptz not null default now()
);
create index lokation_status_skift_opslag_idx on core_identity.lokation_status_skift (lokation_id, sat_dato, seq desc);

-- APPEND-ONLY pris-historik (K-1 ac 3) — skrives KUN af trigger
-- no-dedup-key: event-log; seq er total orden
create table core_identity.pris_historik (
  id          uuid primary key default gen_random_uuid(),
  seq         bigint generated always as identity unique,
  lokation_id uuid references core_identity.lokationer(id) on delete restrict,
  stand_id    uuid references core_identity.stande(id) on delete restrict,
  ny_dagspris numeric(12,2) check (ny_dagspris is null or ny_dagspris >= 0),
  sat_kl      timestamptz not null,
  sat_dato    date not null,
  created_at  timestamptz not null default now(),
  check (num_nonnulls(lokation_id, stand_id) = 1),
  check (lokation_id is null or ny_dagspris is not null)
);
create index pris_historik_lokation_idx on core_identity.pris_historik (lokation_id, sat_dato, seq desc);
create index pris_historik_stand_idx    on core_identity.pris_historik (stand_id, sat_dato, seq desc);

-- APPEND-ONLY gruppe-ejerskabs-historik (K-6 ac 7: dateret ejerled) — skrives KUN af trigger
-- no-dedup-key: event-log; seq er total orden
create table core_identity.lokation_gruppe_historik (
  id          uuid primary key default gen_random_uuid(),
  seq         bigint generated always as identity unique,
  lokation_id uuid not null references core_identity.lokationer(id) on delete restrict,
  gruppe_id   uuid not null references core_identity.grupper(id) on delete restrict,
  sat_kl      timestamptz not null,
  sat_dato    date not null,
  created_at  timestamptz not null default now()
);
create index lokation_gruppe_historik_idx on core_identity.lokation_gruppe_historik (lokation_id, sat_dato, seq desc);
```

Triggere: `_stamp_utc` BEFORE INSERT + `_historik_immutabel` BEFORE UPDATE OR DELETE (row) + BEFORE TRUNCATE (statement) på de tre logs · `_pris_historik_lokation`, `_lokation_gruppe_historik` AFTER INSERT OR UPDATE OF … på `lokationer` · `_pris_historik_stand` på `stande` (§2.2) · `stork_audit` på alle 5 · `set_updated_at` på `lokationer`/`stande`. Hale pr. §2.1: `lokationer`/`stande` m. write-policies (vars `stork.allow_lokationer_write`, `stork.allow_stande_write`); de tre logs UDEN write-policies (skrives kun af triggere i SECDEF-kontekst); page `lokationer` for alle 5. Klassifikation i samme fil (alle `master_data`/`none`/NULL — `lokationer.adresse` m. den deklarerede purpose-tekst, §2.1). Derefter R4-R8 (oraklerne — Bid 3 beviser dem) og fitness-vedligehold pr. (iv).

**Step 2.2 — migration `20260910110001_t10b_05_lokation_rpcs.sql`:** W5-W11 + R9-R11 pr. §2.3/§2.4.

**Step 2.3 — migration `20260910110002_t10b_06_lokation_seed_permissions.sql`:** som Step 1.3 for page `lokationer` (tab `manage` + superadmin page- og tab-grants, 5-kolonne ON CONFLICT).

**Fejl-loci Bid 2:** min-1-stand (parameter-krav + atomisk tx + count-check + `FOR UPDATE` på lokations-rækken — T2.5/T2.6/T2.10) · COALESCE-retning og seq-orden i pris-oraklerne (T2.7/T1.4) · trigger-betingelserne (`is distinct from`; INSERT-grenen) og INSERT-vs-UPDATE i pris-triggeren (T1.3) · `_stamp_utc` (UTC-dato; ingen default) · immutability-guards (S) · NOT NULL/CHECK-sættet · init-status-eventet · gruppe-aktiv-guarden (K-3/ac-5) · gruppe-/lokations-opslag uden fallback (T3.6/T2.4) · navne-/type-normalisering (T1.1/T1.2) · fraværet af delete-veje og af dato-/status-parametre på `lokation_rediger` (T4.2 forudsætning) · typede returns (S-26). **Harness-form:** K-1/K-2/K-3-rækkerne i §1 under ctx-A (R+/R−/SA); SA-1 via FA-2. **Done:** K-1/ac-1..4 + K-1/S, K-2/ac-1/2/4/6 (inkl. SA-1) + K-2/S, K-3/ac-1/2 og K-3/ac-5's inaktiv-gruppe-negativer, K-4/ac-4 (ctx-A + S), K-7/ac-1/3 (lokations-tabeller), K-8/ac-1 (7 tabeller), K-8/ac-2 (W5-W11), K-8/ac-5 (lokationer-del), K-9/ac-3 (signatur-asserts + SA-negativer) — grønne; alle I-mutanter K-1/K-2/K-3 dræbt. **Angrebs-spec-krav:** SA-1 (to sessioner, dokumenteret barriere, committed slut-observation — FA-2 er en hård forudsætning, INGEN residualvej) · UTC-kantprøven (samme rækker under to `timezone`-indstillinger + en transaktion åbnet før UTC-midnat der skriver efter: `sat_dato` = skrive-dagen, ikke tx-startdagen) · prisens format-grænser (2 dec., 10^10, 0 ≠ NULL). **Risiko-flag: HØJ** (atomicitet + concurrency + tre trigger-logs + UTC) → targeted mutanter + SA-1; bred mutation på `lokation_opret`-flowet og `_stamp_utc`/oraklernes dato-led.

### Bid 3 — Status-livscyklus + hvile-handlinger (K-4 ac-1/2/5/7 · K-5 · K-2 ac-3/5)

Afhænger af: Bid 2 (tabel, oracler, `lokation_saet_hviledage`). Realiserer Bid 2's D12-forudsætning for K-4/K-5.

**Step 3.1 — migration `20260910120000_t10b_07_status_rpcs.sql`:** W12 (`lokation_saet_status`) + R12 (`lokation_status_historik`) pr. §2. (`lokation_saet_hviledage` blev leveret i Bid 2 — dens EFFEKT-harness hører til her: K-5/ac-3/ac-5.)

**Fejl-loci Bid 3:** dvale_ophoer-afledningen (`<=`-grænsen, halvåben) · seq-ordenen · `sat_dato <= p_dato`-leddet (UTC) · samme-status-undtagelsen (S-6) · `FOR UPDATE` · fraværet af backdate-/bypass-parametre · init-eventets samspil (nyoprettet = aktiv) · `= 'aktiv'` (ikke `<> 'nedlagt'`) i bookbar (T4.4) · INSERT-vs-UPDATE i statusskrivningen (T4.3) · permission-gaten på stop og hviledage (T5.2/T5.4) · lokalitet i hviledage-UPDATE (T5.5) · NULL-default (T5.6) · eventet SKAL skrives (T5.3). **Harness-form:** forløbs-test aktiv→dvale(ophør D5)→afledt aktiv D5→nedlagt D6→aktiv D8 med dato-opslag på hvert knæk og kant, under to `timezone`-indstillinger; stand-bookbarhed følger (K-2/ac-3); stand-bestand før/efter (K-2/ac-5); audit-læsning pr. skift (K-4/ac-2); R−/V-negativer. **Done:** K-2/ac-3, K-2/ac-5, K-4/ac-1/2/3(neg-2/3)/5/7, K-5/ac-1/2/3/5 + K-5/S, K-8/ac-2 (W12), K-9/ac-3 (status-signatur) — grønne; I-mutanter T2.8, T2.9, T4.1..T4.4, T4.6, T5.2..T5.6, T6.8 dræbt. **Angrebs-spec-krav:** Codex angriber dato-grænserne (ophørs-dag; samme-dags start+stop → to events samme `sat_dato`, seq afgør; skift efter UTC-midnat i en tx åbnet før — `sat_dato` er skrive-dagen) og bypass-fraværet (ingen admin-gren i oraklerne, SA får `false`). **Risiko-flag: HØJ** (oracle-logik er pakkens booking-fundament) → bred mutation på R4/R5 + targeted på W12's gates.

### Bid 4 — Klient-tilladelser (K-6 · K-3 ac-4/6 · K-4 ac-6/8/9)

Afhænger af: Bid 1+2+3 (gruppe, lokation, status-orakel, gruppe-historik). Trin-forudsætning: FA-2 (SA-1) og FA-3 (clock-driver for undo/due).

**Step 4.1 — migration `20260910130000_t10b_08_koblinger_tabeller.sql`:**

```sql
-- no-dedup-key: dateret koblings-tabel; partial UNIQUE pr. (gruppe, klient) er natural dedup (cnp-faelden designet UD)
create table core_identity.gruppe_klient_koblinger (
  id            uuid primary key default gen_random_uuid(),
  gruppe_id     uuid not null references core_identity.grupper(id) on delete restrict,
  klient_id     uuid not null references core_identity.clients(id) on delete restrict,
  gaeldende_fra date not null,
  gaeldende_til date,
  created_by_pending_change_id uuid references core_identity.pending_changes(id) on delete restrict,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (gaeldende_til is null or gaeldende_fra < gaeldende_til)
);
create unique index gruppe_klient_koblinger_aaben_pr_par
  on core_identity.gruppe_klient_koblinger (gruppe_id, klient_id) where gaeldende_til is null;
alter table core_identity.gruppe_klient_koblinger add constraint gruppe_klient_koblinger_ingen_overlap
  exclude using gist (gruppe_id with =, klient_id with =,
    daterange(gaeldende_fra, coalesce(gaeldende_til, 'infinity'::date), '[)') with &&);
create index gruppe_klient_koblinger_opslag_idx
  on core_identity.gruppe_klient_koblinger (gruppe_id, klient_id, gaeldende_fra);

-- no-dedup-key: dateret fravalgs-tabel; partial UNIQUE pr. (lokation, klient) er natural dedup
create table core_identity.lokation_klient_fravalg (
  id            uuid primary key default gen_random_uuid(),
  lokation_id   uuid not null references core_identity.lokationer(id) on delete restrict,
  klient_id     uuid not null references core_identity.clients(id) on delete restrict,
  gaeldende_fra date not null,
  gaeldende_til date,
  created_by_pending_change_id uuid references core_identity.pending_changes(id) on delete restrict,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (gaeldende_til is null or gaeldende_fra < gaeldende_til)
);
create unique index lokation_klient_fravalg_aabent_pr_par
  on core_identity.lokation_klient_fravalg (lokation_id, klient_id) where gaeldende_til is null;
alter table core_identity.lokation_klient_fravalg add constraint lokation_klient_fravalg_ingen_overlap
  exclude using gist (lokation_id with =, klient_id with =,
    daterange(gaeldende_fra, coalesce(gaeldende_til, 'infinity'::date), '[)') with &&);
create index lokation_klient_fravalg_opslag_idx
  on core_identity.lokation_klient_fravalg (lokation_id, klient_id, gaeldende_fra);
```

\+ hale pr. §2.1 (vars `stork.allow_gruppe_klient_koblinger_write`, `stork.allow_lokation_klient_fravalg_write`; select-policy-pages: koblinger → `grupper`, fravalg → `lokationer`) + `_kobling_historik_guard` BEFORE UPDATE OR DELETE på begge (§2.2) + `stork_audit` + `set_updated_at` + klassifikation (alle `master_data`/`none`/NULL). `btree_gist` findes (`71cadac3:21`). Fitness: `IMMUTABLE_GUARDS`-entries m. `flags: ["gaeldende_til"]`; `TX_WRAP`.

**Step 4.2 — migration `20260910130001_t10b_09_koblinger_pending_wiring.sql`:** W13-W16 (wrappers) + I1-I4 (apply-handlers) pr. §2.3/§2.5 + de fire fundament-udvidelser pr. §2.6 (apply-CASE · approve/undo-page-CASE · select-policy · undo_settings-seed). Payload-formen er bindende: `{"gruppe_id"|"lokation_id": <uuid::text>, "klient_id": <uuid::text>, "gaeldende_fra": <date::text>, "change_reason": <text>}`; `pending.effective_from = p_gaeldende_fra` (én dato-sandhed, AK-DATO-DRIFT ved afvigelse).

**Step 4.3 — migration `20260910130002_t10b_10_ret_oracle_rpcs.sql`:** R13-R17 pr. §2.4.

**Fejl-loci Bid 4:** de fire wiring-punkter (dispatcher · page-mapping i approve OG undo · select-policy-grene · undo-seed) · kardinalitets-indexet pr. PAR (T6.10) · guard-triggeren · oraklets tre led + dato-læsning i HVERT led (T6.4/T6.5/T6.6/T6.7/T6.8/T6.9) · gruppe-/lokations-låsen i handlerne (T6.2 — SA-1) · genvalidering af alle wrapper-vagter ved apply (T4.8/T6.16) · payload-dato-asserten · `greatest(D, dags_dato_utc())` (S-17, T6.14) · årsags-propageringen (K-6(k)) · nedlagt-guards uden bypass (T4.7) · gruppe-checket i request (T6.3) · fravalgets lokalitet i UPDATE (T3.5) · pending-detaljens felter + gate (T9.4) · eksplicit revoke på I1-I4 (U02). **Harness-form:** recon-Codex' acceptmatrix (recon2 K-6) overtaget som testskelet under ctx-A m. R+/A+/R−/V: fuld kæde request → `lokation_pending_hent` (A+ ser værdier; R− AK-PERM) → approve (A+; requester-non-admin → 42501) → undo-negativ (før frist) → due via FA-3 → apply → oracle-flip → replay (genkørsel → 22023, ingen ekstra række); historiske datoer før/efter frakobling og ejerskifte (`lokation_saet_gruppe` D9); nedlæg/genåbn-forløbet m. ændret klientmængde (M-19 »da gældende« = V8/E057); request→nedlæg→apply og request→frakobl→apply (sekventielle FS+UT); SA-1 (to sessions applier dublet-pendings; taber AK-KOBLING-FINDES). **Done:** K-3/ac-4, K-3/ac-6, K-4/ac-6/8/9, K-6/ac-1..10 + K-6/S, K-7/ac-1 (koblings-tabeller), K-8/ac-1/2/3 (koblings-tabeller + I1-I4) — grønne; alle I-mutanter K-6 + T3.3/T3.4/T3.5/T4.5/T4.7/T4.8/T4.9/T8.7/T8.9/T9.4 dræbt; SA-1 grøn via FA-2. **Angrebs-spec-krav:** dato-kanterne (kobl + frakobl samme dag → AK-DATO-FOER-START · re-kobling efter frakobling (ny åben række, EXCLUDE tillader ikke-overlap) · fravalg der overlever nedlæg/genåbn (V8: BEVAR) · forsinket apply (ønsket D1, apply D2 → `gaeldende_fra = D2`, `Ret(D1)` uændret — S-17)) · to-sessions-dubletten (FA-2) · pending-synlighed for A+ uden `grupper`-page-grant (→ AK-PERM på `lokation_pending_hent`, ikke false). **Risiko-flag: HØJ** (flest bevægelige dele; pakkens forretningskerne) → bred mutation på R13 + targeted på wiring-/handler-punkterne.

### Bid 5 — Anonymisering (K-7 ac-2/4) + lokations-anonymiseringsvej + K-9-samleharness (K-9 ac-1/2 · K-1 ac-5 · K-5 ac-4)

Afhænger af: Bid 1 (kontakter) og Bid 2 (lokationer); harness-delen af Bid 1-4.

**Step 5.1 — migration `20260910140000_t10b_11_anonymisering.sql`:**

1. **Interne funktioner** I5-I8 (§2.5) FØR mapping-seed (mapping-kolonnerne `internal_rpc_anonymize`/`internal_rpc_apply` er NOT NULL og regprocedure-valideret — `c5b47ec5:37-41,68-70`).
2. **Mapping-seed (draft — A-5):** top-level `set_config('stork.allow_anonymization_mappings_write','true',false)`, `('stork.source_type','migration',false)`, `('stork.change_reason', 'T10b-11: draft-mappings gruppe_kontakt + lokation', false)`; `insert into core_compliance.anonymization_mappings (entity_type, table_schema, table_name, field_strategies, jsonb_field_strategies, anonymized_check_column, retention_event_column, internal_rpc_anonymize, internal_rpc_apply, is_active, status) values ('gruppe_kontakt','core_identity','gruppe_kontakter','{"navn":"blank","email":"hash_email","telefon":"blank"}'::jsonb, null, 'anonymized_at', null, 'core_identity._anonymiser_gruppe_kontakt_internal', 'core_identity._gruppe_kontakt_apply', false, 'draft'), ('lokation','core_identity','lokationer','{}'::jsonb, null, 'anonymized_at', null, 'core_identity._anonymiser_lokation_internal', 'core_identity._lokation_apply', false, 'draft') on conflict (entity_type, table_schema, table_name) do nothing;` — strateginavne fra P1a-seedet (`blank`/`hash_email` `d69ea57e`; `hash` `15557e93:51-55`; alle `approved` ved bootstrap — aktivering af strategier er UI-drift via `anonymization_strategy_activate`). Lifecyclen draft→test_run→approve→activate køres GENNEM de offentlige RPC'er (`ec3d9a0b:172-304`) af R+ i e2e og af UI i drift — »approved kræver UI-aktivering«-precedensen bevaret; ingen »seed som active«.
3. **Dæknings-guard** `_mapping_daekning_guard` (§2.2) + `create trigger anonymization_mappings_daekning before update of field_strategies on core_compliance.anonymization_mappings for each row when (old.status = 'active') execute function core_compliance._mapping_daekning_guard();`.
4. **Offentlige wrappers** W17/W18 (§2.3).
5. **Luk adgangskanten (S-12):** `revoke execute on function core_compliance.anonymize_generic_apply(text, uuid, text) from public, anon, authenticated;` — SECDEF-wrapperne kalder som ejer og berøres ikke. Build-verifikationspunkt BV-2 (§10).
6. Fitness pr. (iv): SECDEF_SANCTIONED for W17/W18 (`write-rpc`) + I5-I8 (`intern-handler`).

**Step 5.2 — K-9-samleharnesset (spec — fabrikken skriver):** fuldt gennemløb GENNEM PostgREST-API'et som R+ (non-admin, ctx-A) af den NUMMEREREDE handlingsliste med genlæsning gennem read-fladen efter hver handling: (1) gruppe opret/redigér/type-sæt/udfas (W1/W2) · (2) kontakt opret/redigér/udfas (W3/W4) · (3) lokation opret m. første stand/redigér/gruppe-skift/hviledage (W5-W8) · (4) stand opret/redigér/deaktivér (+sidste-stand-negativ) (W9-W11) · (5) status: dvale m./u. ophør · stop-før-tid · nedlæg · genåbn (W12) · (6) kobl/frakobl/fravælg/ophæv gennem HELE pending-kæden inkl. `lokation_pending_hent`, approve (A+), undo, due (FA-3), apply (W13-W16 + fundament) · (7) klassifikations-valg via fælles `data_field_definition_upsert` (adresse → direct) + mapping-lifecycle via fælles RPC'er (upsert/test_run/approve/activate) · (8) anonymisér kontakt (W17) og lokation (W18) + replay (`replay_anonymization`) · (9) alle read-/orakel-opslag R1-R17 · (10) breddeprøve: >1000 lokationer via `lokationer_liste` keyset — hver id præcis én gang. Hver handling også som R− → AK-PERM. Intet trin må kræve psql/service-adgang (SQL-kanalen bruges KUN til kontrollæsning og ctx-B-prober). + `m1_permission_matrix` + `gov_3b`-suiten grøn + OpenAPI-sentinels til stede.

**Fejl-loci Bid 5:** mapping-seedets felter (check-kolonne, strateginavne, RPC-navne, status draft) · nested-snapshot-parseren og AK-STRATEGI-UKENDT (T7.9) · værdi-erstatningen pr. felt (T7.5) · mål-identiteten (T7.14) · `is_active=false` efter anonymisering (S-23) · revoke-steppet (S-12) · wrapper-gates · dæknings-guarden (T7.8) · direct-walkerens dækning i audit (T7.6) · EXECUTE-grants på alle 35 offentlige RPC'er (T9.1) · keyset-pagineringen (T9.3). **Done:** K-7/ac-2, K-7/ac-4 (a/b/c), K-9/ac-1, K-9/ac-2 + alias K-1/ac-5, K-5/ac-4 — grønne; I-mutanter T7.5..T7.9, T7.13, T7.14, T9.1, T9.3 dræbt; replay-prøven kører m. NYPRODUCERET snapshot (aldrig legacy-flat-fixture — E111/E112) og asserter VÆRDI-erstatning; lokations-vejen prøves efter et AKTIVT UI-valg (adresse→direct) gennem fælles RPC'er. **Angrebs-spec-krav:** genbrugs-scenariet (anonymiseret kontakt → W3/W4 afvist → ny kontaktperson = NY række → ny anonymisering rammer KUN den nye) · state-idempotens (dobbelt-kald P0002) · aktiv-mapping-redigering (AK-DAEKNING) · lokalitet (G anonymiseret, H urørt) · retention: ingen valgt (T7.12 R); event_based-vej via fundamentets `retention_event_column` verificeres KUN som eksisterende konfig-indgang (ikke som effekt — princip 4). **Risiko-flag: MIDDEL** (meget er fundament; nyt = to små apply-fns, én guard-trigger, seed-data) → targeted mutanter.

---

## 4. Plan-fase-afgørelser (V1-V13 fra kravets liste · S-1..S-32 supplerende) — alle »valgt her«

Hver afgørelse er truffet HER, inden for kravets ramme, på recon-2's fakta. Codex angriber; Mathias' plan-OK dækker. Formuleringer som »1:1 med M-24«, »eneste meningsfulde default« og »kategorisk ikke-persondata« fra v1 er erstattet af »valgt her« med begrundelse (U09).

**V1 · Gruppens feltliste: FAST (rigtige kolonner)** — navn, type, kontaktpersoner i egen tabel (navn/email/telefon). Afviger fra kravets analogi-default (»som for klienter« — kravet kalder det selv »analogi, ikke krav«, K:57/K:181). Valgt her fordi (a) UI-udvidelig registry-jsonb koster ALLE 6 dele (recon-Code V1) OG rammer den døde jsonb-anonymiseringsvej (V2); (b) fast liste passer M-24's skel (HVILKE felter er struktur, værdierne er UI) — en læsning, ikke en nødvendighed (U09); (c) kolonnevejen genbruger `generic_apply` DIREKTE på direct-klassificerede kolonner. **Nyt kodearbejde alligevel (F08):** W17/W18 (wrappers), I5-I8 (interne + replay-apply), `_mapping_daekning_guard`, revoke (S-12) — »0 ny anonymiserings-kode« var forkert; genbruget er generic_apply, strategi-registry og mapping-lifecycle. CVR m.v. medtages IKKE (intet Mathias-ord; ny kolonne = én migration).

**V2 · Anonymiserings-vej: RIGTIGE KOLONNER** — følger af V1. Kontakt-felterne klassificeres `direct`; mapping + strategier er data (blank/hash_email/hash). Snapshot-konflationen (`6083fecd:112-118`: `v_field_snapshot` skrives i BEGGE snapshot-felter — også ved kolonne-mapping) FOREKOMMER på pakkens sti (F14), men er harmløs: `jsonb_field_strategies` er NULL, og replay (`6f0e1db3:286-288`) læser `field_mapping_snapshot` (det nestede kolonne-format), som I6/I8 parser. Deklareret, ikke »aldrig«.

**V3 · Gruppe-type: VALGFRI ved oprettelse (kravets default)** — nullable + CHECK IN {kaede, enkelt_butik, messe_operatoer, andet}. M-17 nævner kun navn ved oprettelse; NULL = reelt »ikke valgt« (princip 4). Krævet-før-rabat-brug hører til trin 29.

**V4 · Fravalgs-/frakoblings-handlinger på nedlagt lokation: AFVISES (kravets default)** — AK-NEDLAGT i wrapper OG apply-handler; INGEN bypass (S-7). Undtagelse: gruppe-NIVEAU-handlinger (kobl/frakobl på gruppen) guarder IKKE mod nedlagte lokationer i gruppen (recon-Codex P04/R2-H5); nedlæggelsens »frakobling« er afledt (V8) og blokerer aldrig sig selv.

**V5 · Gruppe = §1.12's leverandør: ÉN entitet** (`core_identity.grupper`). Ingen leverandør-/gruppe-objekt findes (intet at flette); to entiteter kræver en kardinalitets-beslutning intet Mathias-ord bærer (P06). Ordbogen bærer mappingen (§5).

**V6 · Mindst én stand: (a) oprettelse = atomisk RPC** (W5 kræver `p_foerste_stand_navn`; INSERT lokation+stand+status-event i én tx); ingen deferrable-constraint (0 precedens); RPC-atomicitet er tæt fordi INGEN app-rolle har DML (S-29). **(b) sletning findes ikke** (ingen grant/policy/RPC; M-14). **(c) deaktivering** m. guard »sidste AKTIVE stand« (AK-SIDSTE-STAND) under `FOR UPDATE` på lokations-rækken (S-19) — to-sessions-beviset er BLOKERENDE (A-12).

**V7 · Gruppe-arv på stand: AFLEDT** — stande har ingen gruppe-kolonne; gruppen læses via lokationen (præcedens: pris-arv).

**V8 · Effektiv ret klient×lokation: AFLEDES** — prædikat-komposition af TRE daterede kilder på SAMME D (R13): gruppe-på-dato (`lokation_gruppe_historik`) ∧ kobling-på-dato ∧ ¬fravalg-på-dato ∧ status-på-dato ≠ nedlagt (E057/E082). **Fravalg BESTÅR gennem nedlæggelse/genåbning** (P05 Bevar: egen række, urørt af status; genåbning arver gruppens DA gældende klienter MINUS gældende fravalg — »da gældende« er V8-modellens konsekvens + recon-Codex E057, M-19 bærer »automatisk tilbage«). **Nedlæggelsens frakobling er AFLEDT** (ingen kaskade-skrivning; retten dør pr. dato via status-leddet; historik består, M-13). Luk-åben-række-formen for frakobling/ophævelse er `17930649:98-100` (UPDATE `effective_to`); exact-start-DELETE-formen der bevidst IKKE bruges er `_apply_client_close` `7e490d5f:357-398` (E088) — F10.

**V9 · Dvale og hvile: ÉN model-ting** — hvile ER status `dvale` evt. med `dvale_ophoer`; manuel dvale = samme status uden/med ophør. Én sandhed (princip 1), r7d-umulig by construction (ingen status-kolonne). Auto-ophør AFLEDES i R4 (`dvale_ophoer <= p_dato` → aktiv, halvåbent); ingen cron i pakken — recon-Codex: »En cron er ikke nødvendigvis nødvendig for status ved datoopslag« (R2-K5, ordret — FUND-3). Stop-før-tid = W12 m. `'aktiv'` (M-27b). Trin 24's auto-hvile kalder samme RPC. Hviledage: nullable integer PÅ lokationen, NULL = intet valg (M-21, princip 4), enhed DAGE (M-21), CHECK ≥1 (0/negativ afvist på RPC — AK-HVILEDAGE; CHECK er bagstopper), intet øvre loft (intet forretningsgrundlag; int4-grænsen er typens, AK-TYPE-GRAENSE). Intradag: events bærer `sat_kl` + `sat_dato` (UTC, S-18); samme-dags start+stop → seq afgør.

**V10 · Fortrydelses-wiring + direkte-vs-godkendelse pr. handlings-type** — pending-vejen for de fire klient-koblings-handlinger (W13-W16, dateret, K-6 ac 10); direkte-vejen (permission+årsag+audit, straks) for stamdata, status og hviledage (K-5 ac 3's afledning M-29.5 — bekræftelses-linjen står i kravet; siger Mathias stop, er pending-formen drop-in). Undo-defaults: 24 t pr. ny change_type, EKSPLICIT seedet; UI-justerbart 0..30 døgn via `undo_setting_update`. Ingen `permission_actions`/2.-godkender (intet K kræver det). Applied kan ikke undo'es → fortrydelse EFTER apply = ny modsatrettet ændring (S-10). Self-approve: fundamentets regel (S-31).

**V11 · Valuta/enhed + tom pris** — `numeric(12,2)` (beløbs-precedens `b0491013:12-24`), implicit DKK pr. DAG; ingen valuta-kolonne. Lokationens dagspris NOT NULL; standens NULL = arv; `0` er en pris (0 ≠ NULL). **Format-kontrakt på public flade (U05, S-32):** AK-PRIS ved >2 decimaler eller ≥10^10 (numeric(12,2)'s 22003 designes ud af den offentlige sti).

**V12 · Seeding: KUN superadmin** — pages `grupper` + `lokationer` under EKSISTERENDE area `org_structure`; superadmin får tab- OG page-grants (approve-gaten er page-level). Øvrige roller = UI-drift.

**V13 · Gruppe ud af brug: `is_active`-toggle** (W2) + guards: ny lokation/nyt gruppe-skift/ny kobling på inaktiv gruppe → AK-GRUPPE-INAKTIV (SA-bypass, forretningsvagt). Eksisterende lokationer, koblinger og retter BESTÅR; frakobling virker altid. Sletning designet ud i tre lag (ingen DML-grant + ingen delete-RPC + FK RESTRICT).

**Supplerende afgørelser (S) — self-check mod skjulte build-tids-valg:**

- **S-1 Model-form:** TO tabeller (`lokationer` + `stande`) i stedet for §1.12's parent_location_id-selvreference. Designer UD: cykler, selv-reference, under-stande, stand-uden-lokation (recon-Code K-2: to-tabel = gyldig opfyldelse). Urepræsenterbare input afvises EKSPLICIT på den offentlige flade (K-2/ac-1 neg-1..4 — T:150), ikke »testes ikke«.
- **S-2 Status-lager:** append-only `lokation_status_skift` m. `seq`; INGEN status-kolonne. Ny lokation fødes `aktiv` (init-event i W5) — valgt her: den oprettes for at bruges (K-4 »kan bookes«); ikke en nødvendighed (U09). Alle skift af FORSKELLIG status tilladt; samme status afvist undtagen dvale→dvale m. ændret ophør (S-6).
- **S-3 Historik-lager for pris og gruppe-ejerskab:** trigger-fødte append-only logs (kolonnen = NU-sandhed, loggen = HISTORIK-sandhed, triggeren gør synk uglemmelig). **Ændret fra v1:** logs HAR `stork_audit` (S-27) — ingen AUDIT_EXEMPT-udvidelse.
- **S-4 Dato-semantik (bindende for alle oracler):** »på dato D« = seneste række m. `sat_dato <= D` (UTC-dato via `_stamp_utc`, S-18), seq afgør samme-dags-tie; dvale-ophør halvåbent (ophørs-dagen er aktiv); pris på D = dagens SIDSTE pris (S-5); før-oprettelses-datoer → NULL-status/false-bookbar/false-ret.
- **S-5 Pris-opslags-tie:** dagens sidste ord gælder dagen.
- **S-6 Dvale-forlængelse:** dvale→dvale m. ÆNDRET `dvale_ophoer` er lovlig.
- **S-7 Bypass-grænsen:** SA-bypass KUN på forretningsvagter (AK-GRUPPE-INAKTIV, AK-KLIENT-INAKTIV — `b0cff39e`-mønstret); ALDRIG på strukturvagter (AK-FINDES-IKKE · AK-TYPE · AK-NAVN · AK-AARSAG · AK-NEDLAGT · AK-SIDSTE-STAND · AK-PII-*). I apply-handlere via `is_admin_by_employee_id(requested_by)`, i wrappers via `is_admin()`.
- **S-8 Stamdata på nedlagt lokation:** W6/W7/W8/W10/W11 TILLADT; W9 (`stand_opret`) afvist (ny kapacitet på ude-af-drift); dvale tillader alt.
- **S-9 Bruger-årsag i pending-vejen:** wrappers kræver `p_change_reason` og bærer den i payload; handleren sætter `stork.change_reason` FØR mutation → K-8 ac 2 gælder også dateret vej.
- **S-10 Fortrydelse efter apply:** findes ikke som undo — ny modsatrettet ændring gennem samme pending-vej.
- **S-11 (afløst af S-23).**
- **S-12 generic_apply-adgangskanten lukkes:** `revoke execute … from public, anon, authenticated` (E119-E121). BV-2.
- **S-13 (afløst af S-24).**
- **S-14 Navnekonvention:** domæne-ord på dansk efter ordbogen; verbums-suffikser som kodebasens (`_upsert`, `_saet_*`, `_opret`, `_hent`, `_liste`, `_paa`); interne `_`-præfiks.
- **S-15 Migrationsfil-navne:** `202609101x000N_t10b_NN_<navn>.sql` som angivet pr. bid — byggeren opfinder ingen navne.
- **S-16 Required-skellet på lokationen:** `type` KRÆVET (NOT NULL — K-1's feltliste; `andet` er eksplicit opsamling), `adresse` VALGFRI (M-24 hardkoder kun navn; princip 4). Valgt her.
- **S-17 Effektiv dato ved dateret ændring** (§0.2; A-9/U04): `gaeldende_fra/-til = greatest(ønsket D, apply-dagen UTC)`; pending viser ønsket D. Bekræftelses-linje B-1 (§10).
- **S-18 UTC-datoregel** (§0.2; A-10/F06): `dags_dato_utc()`, `_stamp_utc`, `sat_dato`-kolonner, `clock_timestamp()`; ingen `::date` uden zone i pakken.
- **S-19 Serialisering:** `FOR UPDATE` på `lokationer`-rækken i W6/W7/W8/W9/W11/W12 og i I3/I4; på `grupper`-rækken i I1/I2. Race-taber (I1) → AK-KOBLING-FINDES i apply-fasen (22023); pending forbliver `approved` + cron `partial_failure` (fundamentets kontrakt — arv, §10).
- **S-20 Læse-kontrakt** (A-6/U03): alle read-RPC'er SECDEF m. eksplicit page-gate (AK-PERM ved manglende page-read); page-bred, intet række-scope (visibility ignoreres — `has_permission` læser den ikke); klient-navne aldrig returneret (kun `klient_id`); direkte SELECT som R− → `rows=[]` via select-policy.
- **S-21 Klassifikationsværn** (A-3/F04): `_pii_klassifikation_guard` på `core_compliance.data_field_definitions` (§2.2) — uden bypass.
- **S-22 Mapping-dæknings-guard** (A-5/U06): `_mapping_daekning_guard` på aktive mappings (§2.2) — generel.
- **S-23 Anonymiseret kontakt er LUKKET og INAKTIV** (F13): I5/I6 sætter `is_active=false`; W3 OG W4 afviser (AK-KONTAKT-LUKKET); ny kontaktperson = ny række.
- **S-24 Klassifikations-valg (K-7)** (A-4/F03/FUND-1/U06): `direct` KUN `gruppe_kontakter.{navn,email,telefon}`; ALT andet `none` inkl. `lokationer.adresse` (default = intet, K:142; recon-flaget deklareret i purpose); retention NULL overalt. Lokations-anonymiseringsvejen LEVERES (W18, I7/I8, mapping `lokation` draft) så et senere AKTIVT UI-valg (adresse→direct) har en udførende vej fra dag ét (K:143). **Læsning deklareret:** »persondata-felt« i K-7 ac 4's dæknings-forstand = `pii_level='direct'` — fundamentets egen semantik (`audit_filter_values` hasher kun direct `4eb775c9:53-76`; `generic_apply`/`test_run` dækker kun direct `6083fecd:66-72`, `ec3d9a0b:212-230`; `indirect` har ingen mekanik nogen steder — præcedens `clients.fields` er `indirect` uden anonymisering). Et UI-valg »indirect« for adresse er lovligt men udløser ingen anonymisering — synligt for gaten og for Mathias (B-3). Gruppens/lokationens NAVN klassificeres `none` — valgt her (K:134 lægger klassifikationen på »vores læsning«; §11's grænse er kontaktpersonen), ikke en nødvendighed.
- **S-25 Paginering** (A-14): keyset `(navn, id)` på alle liste-RPC'er, `p_antal` 1..1000, indekser `(…navn, id)`; sub-samlinger (stande, kontakter, koblinger, fravalg) som egne liste-RPC'er.
- **S-26 Typede returns + økonomi-kontrakt** (A-15/U10): ingen jsonb-returns; `pg_get_function_result` matcher §2.4 ordret; ingen `core_money`-reference i nogen pakke-funktion.
- **S-27 Audit på alle 9 tabeller** (inkl. logs) — ingen AUDIT_EXEMPT-udvidelse (B:142-frøet er netop den fælde).
- **S-28 Klassifikations-kategori:** `master_data` for alle 9 tabeller (registryets CHECK `fb805b56:14-16` kender kun operationel/konfiguration/master_data/audit/raw_payload — A-2/F02; logs ER den daterede master-data-sandhed).
- **S-29 Ingen app-DML-grants** (A-1/F01): `revoke all` + kun `grant select`; write-policies m. `stork.allow_<tabel>_write` beholdes på de 6 master-/relations-tabeller alene for fitness D4 (`d1b4d601:757-831`) — de er moot uden grant; SECDEF-RPC'er skriver som ejer.
- **S-30 FORCE RLS uniformt** (F05): alle 9 tabeller `enable + force`; SECDEF-ejer (postgres, bypassrls) berøres ikke af FORCE — triggere kører i den kontekst; audit_log-»FORCE blokerer trigger«-begrundelsen (B:153) bruges IKKE.
- **S-31 Self-approve** (F07): fundamentets regel arves (`ae336ee6:56-61`): forbudt for non-admin ved `action_id NULL`; SA må godkende egen request. Intet nyt absolut forbud opfindes (kill-list T8.9).
- **S-32 Input-typegrænser** (U05): `numeric`-parametre valideres på RPC (AK-PRIS: ≥0, ≤2 dec., <10^10); `integer`-/`uuid`-parametre: ikke-heltal/overflow/fritekst afvises af PostgreSQL's input-cast FØR body (AK-TYPE-GRAENSE 22P02/22003) — bundet klasse, ikke »anden fejlkode«.

---

## 5. Ordbogs-arv (planen arver Mathias' navne — mapping-tabel)

Planens system-navne pr. ordbogs-reglen (B3). De **seks** plan-fase-entries (stande · gruppe · aktiv/dvale/nedlagt · gruppens type · kontaktperson · klient) er committet i `ordbog.md:25-34` @ `bcab6b4e` (FUND-5/F15: seks, ikke fem). **v2 kræver ingen nye entries**: ingen nye Mathias-vendte ord introduceres (nye system-navne — `dags_dato_utc`, `sat_dato`, `lokation_pending_hent`, keyset-parametre — er teknik uden Mathias-flade).

| Mathias' ord (kilde) | system-navn i planen | note |
| --- | --- | --- |
| lokation (M-23/M-24, §1.12) | `core_identity.lokationer` · `lokation_*` | arvet direkte |
| stand / stande (M-14/M-17/M-18) | `core_identity.stande` · `stand_*` | ordbog:29 — egen tabel m. `lokation_id`-FK (S-1) |
| gruppe (M-17/M-18/M-27c) | `core_identity.grupper` · `gruppe_id` · `gruppe_*` | ordbog:30 — gruppe ER leverandør-entiteten (V5) |
| ejer / ejerkæden (M-18) | FK-kæden `grupper ← lokationer ← stande` | arvet som struktur |
| kobles på (gruppen) (M-17) | `gruppe_klient_koblinger` · `gruppe_klient_kobl`/`_frakobl` | arvet |
| fravælge (M-17) | `lokation_klient_fravalg` · `lokation_klient_fravaelg`/`_fravalg_ophaev` | arvet |
| aktiv · dvale · nedlagt (M-25.1) | værdierne `'aktiv'`,`'dvale'`,`'nedlagt'` + `lokation_status_skift` | ordbog:31 — nedlagt er GENÅBNELIG (M-28) |
| antal hvile dage (M-21) | `lokationer.hviledage` (integer, dage) | arvet |
| stoppe dvaleperioden (M-27b) | `lokation_saet_status('aktiv')` | samme dedikerede handling |
| navn, adresse, dagspris | `navn`, `adresse`, `dagspris` | dansk 1:1 |
| type (butik/messe/marked/event/andet) (K-1) | CHECK-værdierne | kravets ord 1:1 |
| gruppens type (§1.12) | `'kaede','enkelt_butik','messe_operatoer','andet'` | ordbog:32 (ASCII-mapping) |
| kontaktperson (K-7/§11) | `core_identity.gruppe_kontakter` | ordbog:33 |
| klient (gennemgående) | `core_identity.clients` · param `klient_id` | ordbog:34 |
| tilladelse (§14, forældet som objekt) | afledt ret: `klient_maa_staa_paa` | konsistent m. ordbogens M-17-rettelse |

Systemtekniske ord uden Mathias-flade (seq, gaeldende_fra/til, sat_kl/sat_dato, dvale_ophoer, is_active, anonymized_at, oensket_fra) følger kodebasens konventioner og optræder aldrig i Mathias-vendt tekst.

---

## 6. Faldgruber fra recon-2 — synligt adresseret

1. **cnp-kardinalitets-fælden** (recon-Code K-3): partial UNIQUE på `(gruppe_id, klient_id)` WHERE åben + EXCLUDE pr. PAR (Bid 4.1) + T6.10 I + positiv »C1 i G og H samtidig« (K-6/ac-8).
2. **closure current-state-only vs K-6 ac 7** (recon-Code V8 / recon-Codex P07): retten MATERIALISERES IKKE; afledt komposition af tre daterede kilder inkl. dateret gruppe-ejerskab (`lokation_gruppe_historik`); T6.5/T6.6/T6.7/T6.8 I (ét dato-led ad gangen).
3. **Ingen deferrable-precedens for min-1-stand** (recon-Code V6): atomisk opret-RPC + deaktiverings-guard m. `FOR UPDATE` + ingen delete-veje; tætheden bæres af S-29 (ingen app-DML). To-sessions-beviset er BLOKERENDE via FA-2 (ingen residualvej — A-12/F12).
4. **jsonb-snapshot-konflationen** (`6083fecd:112-118`): kolonne-snapshottet skrives i BEGGE snapshot-felter — også på pakkens sti (F14). Harmløst fordi `jsonb_field_strategies` er NULL og replay læser `field_mapping_snapshot`; I6/I8 parser det NESTEDE format og RAISER ved ukendt strategi (E109).
5. **LENIENT-audit-vinduet:** klassifikation i SAMME fil som DDL (K-7/ac-1) · **DML-grant-glemslen** (Codex V4-lektionen `359c0b23:62-65`) er IRRELEVANT i v2 — der ER ingen app-DML-grants (S-29); SECDEF-vejen skriver som ejer · **session-var-rækkefølgen** (B:83): vars efter alle checks (§2.3) · **NULL-usikre var-gates:** `= 'true'`-formen · **r7d-dual-sandhed:** ingen status-kolonne · **de FIRE pending-udvidelsespunkter** (§2.6) · **payload-dato-drift** (AK-DATO-DRIFT) · **undo-fallback-tavshed** (eksplicit seed) · **approve-gatens page-level-check** (page-grants seedet) · **T9-wrappers uden bruger-årsag** (S-9) · **exact-start-DELETE/UPDATE-formerne** fravalgt for al pakke-historik · **grant-indexets action_id-kolonne** (5-kolonne ON CONFLICT) · **types-drift** · **governance-dokumentkæden** (formålsblok byte-identisk) · **max_rows=1000/30 s** på læse-RPC'er er recon-2's K-9-fladekontrakt (recon-Code K-9 + R2-K9/E153, `011818ba:16-18`), ikke kravets (FUND-2) — håndteret af keyset-paginering (S-25) · **OpenAPI-canary er T9-specifik** (`d1b4d601:1068-1074`) — udvides m. pakkens sentinels (U08) · **default-EXECUTE til authenticated på nye funktioner** (`c6fb84d2:39-41`) — eksplicit revoke på hver intern funktion (U02) · **`::date`-cast følger sessionens TimeZone** — S-18.

---

## 7. Repo-doc-tekst 1:1 (forud-godkendte blokke til Fase 6 — anvendes, fabrikeres ikke)

**Blok A — masterplan §1.12 opdateres** (erstatter afsnittene »Lokations-entitet«, »Klient-tilladelser pr. lokation«, »Cooldown pr. lokation« og »Leverandører« i `docs/strategi/stork-2-0-master-plan.md` §1.12; adresserer kravets vedligeholds-flag (a); `<BUILD-COMMIT>` udfyldes ved luk):

```doc:docs/strategi/stork-2-0-master-plan.md
**Lokations-entitet (bygget ved trin 10b, commit <BUILD-COMMIT>):**

- Pr. lokation: navn, adresse (nullable, klassificeret none — aktivt UI-valg kan gøre den til persondata), default-dagspris (NOT NULL, numeric(12,2), DKK/dag), gruppe-FK (ejeren — se Grupper), type (butik / messe / marked / event / andet, krævet), hviledage (nullable integer — NULL = ingen automatisk hvile), anonymized_at (inaktiv struktur indtil aktivt persondata-valg)
- Stande (placements) er en EGEN tabel (`core_identity.stande`, FK `lokation_id`) — to-tabel-formen afløser den tidligere skitserede parent_location_id-selvreference: cykler og under-stande er dermed strukturelt umulige (M-18: gruppe ejer lokation, lokation ejer stand; standen er bladet). En lokation fødes atomisk med sin første stand og har altid mindst én aktiv stand
- Stand bærer egen dagspris hvis sat; ellers arves lokationens (NULL = arv; opslag altid entydigt)
- Pris- og gruppe-ejerskabshistorik føres i trigger-fødte append-only logs med UTC-datostempel og dato-opslag (`lokation_dagspris_paa`/`stand_dagspris_paa`) — en ændring rører aldrig fortiden
- Alle læse-RPC'er er typede (ingen jsonb) og keyset-paginerede; ingen økonomi-/attributionsfelter findes på lokationen (forbud, håndhævet af kontrakt-test)

**Lokations-status som første-klasses livscyklus (afgjort ved trin 10b):**

- Enum-værdier: aktiv · dvale · nedlagt. Nedlagt kan genåbnes (M-28)
- Status lagres som append-only event-log (`lokation_status_skift`, UTC-dateret); nuværende status AFLEDES altid — ingen status-kolonne, ingen dobbelt sandhed
- Overgange via dedikeret RPC (`lokation_saet_status`) med årsag; auditeres. Dvale kan bære planlagt ophør (dato) — ophøret afledes i opslaget uden cron; stop-før-tid = samme RPC med 'aktiv'
- Bookings kan kun oprettes på aktiv lokation (trin 24 forbruger `lokation_er_bookbar`/`stand_er_bookbar` pr. dato)

**Klient-tilladelser (Mathias-modellen 2026-09-03, M-17 — afløser den tidligere skitserede relations-tabel klient × lokation × from/to):**

- Klienter kobles på GRUPPEN (`gruppe_klient_koblinger`, dateret, uden slutdato-krav) og arver alle gruppens lokationer — også senere tilkomne
- En lokation kan FRAVÆLGE klienter gruppen har (`lokation_klient_fravalg`, dateret) og ophæve fravalget igen; fravalg består gennem nedlæggelse/genåbning
- Effektiv ret afledes pr. dato: koblet på lokationens gruppe (dateret ejerskab) ∧ ikke fravalgt ∧ lokationen ikke nedlagt — `klient_maa_staa_paa(klient, lokation, dato)` svarer entydigt, også historisk. Booking-RPC (trin 24) validerer mod denne flade
- Nedlæggelse kobler automatisk klienterne fra lokationen (afledt pr. dato — koblings-rækker og historik bevares urørt); genåbning arver gruppens da gældende klienter (M-19)
- Til-/frakobling og til-/fravalg sker via fortrydelses-mekanismen (pending → godkendelse → undo-vindue → apply; undo-perioder pr. ændrings-type, UI-styret). En godkendt ændring træder i kraft fra den ønskede dato eller fra apply-dagen hvis denne er senere — aldrig med tilbagevirkende kraft

**Cooldown pr. lokation** (ikke pr. klient eller kampagne — Appendix A): hviledage-feltet på lokationen, UI-redigerbart (direkte handling med rettighed + audit); hvile udtrykkes som dvale-status med planlagt ophør. Automatisk udløsning efter kampagne kobles på i trin 24.

**Grupper (leverandører):**

- ÉN entitet: `core_identity.grupper` — Mathias' ord "gruppe" ER masterplanens leverandør (afgjort i plan-fasen, trin 10b). Lokationens leverandør-FK er `gruppe_id`
- Gruppe oprettes i UI med navn; type-felt (kæde / enkelt-butik / messe-operatør / andet — lagret som kaede/enkelt_butik/messe_operatoer/andet) er valgfrit ved oprettelse og styrer rabataftale-lookup i trin 29
- Kontaktpersoner i egen tabel (`gruppe_kontakter`) med persondata-klassifikation (direct) og anonymiseringsvej via den generiske mapping-mekanik; en anonymiseret kontakt lukkes (inaktiv, låst for nye personværdier) — ny kontaktperson er en ny række; gruppen og dens lokationer består
- Grupper slettes aldrig (FK RESTRICT + ingen delete-vej); udfasning via is_active
- Persondata-klassifikation kan aldrig sænkes fra direct (fysisk værn på klassifikations-registret, gælder alle tabeller)
```

**Blok B — masterplan §4-statusrækken** (rækken for 10b erstattes; `<BUILD-COMMIT>`/`<DATO>` udfyldes ved luk):

```doc:docs/strategi/stork-2-0-master-plan.md
| 10b     | Lokations-skabelon                                             | ✓ Godkendt           | Trin 10b   | <BUILD-COMMIT> | <DATO>  |
```

**Blok C — §1.12-fodnote om rettelse-17-henvisningen** (kravets vedligeholds-flag (b)):

```doc:docs/strategi/stork-2-0-master-plan.md
*(Henvisningen "afgørelse fra rettelse 17" for cooldown-pr-lokation matcher ikke Appendix C's nummerering; substansen er låst i Appendix A. Noteret ved trin 10b-plan; rettes af Mathias ved lejlighed.)*
```

---

## 8. Bro-bindinger

**plan ⊨ krav:** §1-matrixen er bijektiv — hvert K-1..K-9 (alle 53 acceptkriterier + strukturforbud som `K-n/S`) er afbildet til effekt-bid+step, indgang, rolle, positiv slut-effekt, navngivne negativer m. pinnet AK-klasse og ctx, bevisform, chain-step, canary og Codex-mutant (I/R/S); hvert bid peger tilbage på sine K; forudsætnings-indholdet i Bid 2 er D12-bundet til Bid 3/4. Kravets negativer er designet UD hvor det er muligt (NOT NULL/FK/CHECK/partial-UNIQUE/EXCLUDE/append-only/stamp-trigger/fraværs-signaturer/ingen app-DML) — OG hver design-out bevises gennem den offentlige indgang med effekt-test + targeted mutant (M-40 D13). Kravets »kan ikke ske«-kerner: lokation uden gruppe (NOT NULL FK + AK-PAAKRAEVET) · to sandheder om pris (NOT NULL + arv-orakel) · omskrevet historik (append-only + guards + UTC-stamp + S-17) · omgåelse af hvile (ingen bypass-flade, ingen admin-gren) · nedgradering af persondata (fysisk guard uden bypass) — alle strukturelle og alle prøvet.

**plan ⊨ vision/forretning:** princip 1 (én sandhed: status/pris/ret/ejer afledes af én dateret kilde) · princip 2+3 (FK-ejerkæden er M-18 som skema; forretningslogik som data: hviledage, undo-perioder, mapping, strategier, grants, klassifikation) · princip 4 (default = intet: hviledage NULL, gruppe-type NULL, adresse none, retention NULL, ingen seeds ud over superadmin) · princip 6+9 (audit på alt m. brugerens årsag — også på logs og dateret vej; status/koblinger/pris/ejer bevarer historik; nedlæggelse og forsinket godkendelse ændrer aldrig fortiden — M-13) · princip 7 (anonymisering bevarer audit; kontakt lukkes, gruppe består) · forretningsforståelse §14 (systemet håndhæver hvem der må stå hvor — oraklet er fladen trin 24 forbruger) · §3 (ingen økonomi-kobling — designet ud + kontrakt-test) · §11/§12 (persondata-grænsen er kontaktpersonen; rettigheder via den fælles model, synlighed ≠ handling). M-ordene er citeret pr. afgørelse (M-12/13/14/17/18/19/21/25/27/28/29/36). UI-styrbarheden (M-23/M-24) er beviselig: hele handlingsfladen er granted RPC'er kørt som non-admin gennem API'et; strukturforbud kan ikke slås fra (K-9/ac-3).

**build ⊨ plan (1:1):** byggeren træffer INGEN beslutning — planen fastlægger: alle tabel-/kolonne-/index-/constraint-/trigger-navne og -definitioner (§2.1, §3 DDL) · alle 43 funktioners navne, fulde signaturer, returtyper, sikkerhedskontekst, ACL og SECDEF_SANCTIONED-kategori (§2.2-2.5) · gate-rækkefølger og HVER afvisnings SQLSTATE/besked-form/afvisningssted (§0.2 katalog) · alle session-var-navne · alle enum-/CHECK-værdier · alle tærskler (hviledage ≥1; undo 24 t-seed; dagspris ≥0, ≤2 dec., <10^10; `p_antal` 1..1000) · dato-/tie-/UTC-semantik (S-4/S-5/S-17/S-18) · låse-rækkefølge (S-19) · bypass-klassifikationen (S-7) · seed-indhold og ON CONFLICT-mål · payload-form · mapping-seedets samtlige felter og status · migrationsfil-navne og -rækkefølge (S-15) · fitness-/allowlist-vedligehold pr. bid (§3 (iv)) · hvilke fundament-objekter der CREATE OR REPLACE'es og fra hvilken blob (§2.6). Skabelon-boilerplate kopieres fra navngivne forbilleder (`path:linjer @ blob8`) — genbrug ved reference, aldrig fri fantasi. Ændrer et forbillede sig mellem pin og build → HALT (ny plan-SHA). Hvor planen har VALGT (frem for kopieret) står »valgt her«.

---

## 9. E20-snit (P-8-beskæring — plan-gatens dom) og overdragelser

**Samtidighed (SA) skæres til de to K-navngivne races** (M-40 E20 · kill-list »E20«): (1) `K-2/ac-6/SA-1` sidste aktive stand (Bid 2, T2.6) · (2) `K-6/ac-2/SA-1` dublet-kobling (Bid 4, T6.2). Form: ≥2 uafhængige DB-sessions (FA-2), dokumenteret barriere (pg_locks/wait_event), committed slut-observation, ingen manuel reparation. Sekventiel »race« og kodeinspektion er ikke kill. **Kan FA-2 ikke leveres, er Bid 2 og Bid 4 IKKE done** — ingen residualvej (v1's B-3 er fjernet, A-12/F12). Genvalidering request→nedlæg/frakobl→apply er SEKVENTIEL (FS+UT). **Permutation: ÉN kontrolkopi** (ombyt seedvalgte klienters roller/navne/rækkefølge; samme relationer/datoer/permissions → ommærkede svar). **Beholdes fuldt:** fuld-populations-import + bijektion (T §1), canaries N1-N9 (T §3 — kolonne N i §1), kæde C0-C10 (T §4.2 — kolonne C i §1), historie-genlæsning og lokalitet (T §4.3). Gate-aktørerne dømmer snittet.

**Overdragelser — aldrig runtime-PASS (T §3.2):** `downstream_dependency: trin-24`: N2-B dobbeltbooking pr. stand (K-2/ac-4) · N4-B/N5-B/N6-B booking under dvale/nedlagt/hvile eller uden gældende ret (K-4/ac-5 · K-5/ac-1 · K-6/S) · kampagne-slut-trigger for auto-hvile (K-5 scope-ærlighed — kalder W12) · konsekvens for eksisterende bookinger ved frakobling/fravalg (K-6 trin-24-note). `trin-29`: prisens økonomiske forbrug (K-1/ac-3) · gruppe-type krævet før rabat (V3). `lag-F`: sider/formularer oven på den beviste RPC-flade (K-9 scope-ærlighed). Alle nu-scope-assertions udføres; deklareret nedstrøms-scope er ikke en skjult skipped test.

---

## 10. HALT-flag · bekræftelses-linjer · build-verifikationspunkter · arv-noter

**HALT-flag (krav-problemer, retur til Mathias): INGEN.** Kravet er bygbart som skrevet; planen retter intet i det.

**Bekræftelses-linjer til fremlæggelsen (M-33 værn 1+2: afledelige i ét skridt af eksisterende ord/krav — batches, blokerer ikke; »står medmindre Mathias siger stop«):**
- **B-1 (S-17 · A-9/U04):** »Når en klient-kobling/frakobling/fravalg er bedt om fra en dato, men godkendelsen eller effektueringen først sker senere, gælder ændringen fra den dag den effektueres — aldrig med tilbagevirkende kraft. Eksempel: bedt 1/10 om frakobling fra 1/10, godkendt 3/10 → gælder fra 3/10.« Afledt af K-6 ac 6 (»ændrer aldrig fortiden«) + M-13.
- **B-2 (V8/P05):** »En lokations fravalg af en klient består, hvis lokationen nedlægges og senere genåbnes — klienten er fortsat fravalgt indtil fravalget ophæves.« Afledt af M-13 (historik) + M-19 (genåbning arver gruppen); P-8 C8 kræver valget låst før build.
- **B-3 (S-24 · A-4/F03/FUND-1/U06):** »En butiks adresse er almindelig forretningsdata, medmindre I aktivt vælger i UI at den er persondata. Vælger I »direkte persondata« kan adressen anonymiseres (vejen er bygget). Vælger I »indirekte« registreres det, men der sker ingen anonymisering — det er systemets gældende betydning af »indirekte«.« Afledt af K:134 (»vores læsning«) + K:142 (default = intet) + fundamentets semantik.

**Build-verifikationspunkter (ikke plan-HALT — deklarerede stop-betingelser i build):**
- **BV-1 Live-state (R2-H1):** PostgREST-eksponeringen af `core_identity` afgøres af fitness' live-checks (fail-closed) + pakkens sentinels; rød → HALT, aldrig baseline-hvidvask.
- **BV-2 generic_apply-revoken (S-12):** knækker revoke-steppet en eksisterende flade i e2e (ukendt live-afhængighed) → HALT + flag til Mathias-bordet; steppet droppes ikke tavst.
- **BV-3 Mapping-dæknings-guarden (S-22):** fundament-suiten (r7a/p2/t6) skal forblive grøn efter triggeren; rød → HALT (guarden er generel med vilje — scope-begrænsning til pakkens entity_types er den alternative afgørelse, som da kræver ny plan-SHA).
- **BV-4 PII-guarden (S-21):** fundament-suiten (t10-klassifikation, d1/d2) grøn efter triggeren; rød → HALT (ingen bypass-gren tilføjes tavst).
- **BV-5 Adapter-PASS (FA-1) + to-sessions-harness (FA-2) + clock-driver (FA-3):** Bid 1 starter ikke før FA-1-PASS (Trin C); Bid 2/4 kan ikke erklæres done uden FA-2; Bid 4 ikke uden FA-3.

**Arv-noter (fundament-forhold uden for pakkens K — til driverens bord, ikke HALT):**
- Pending-status-modellen har ingen »afvist«-tilstand: en `approved` pending hvis apply-genvalidering fejler (nedlagt, frakoblet, dublet-taber) forbliver `approved` og logges som `partial_failure` af cron (`c3b2865c:394-435`). Deklareret kontrakt for race-taberen (S-19) og T4.8/T6.16-negativerne.
- Retention-executor findes kun for `event_based` via `retention_event_column` (`6f0e1db3:325-369`); `time_based`/`manual` har ingen udførende vej i fundamentet. Pakken vælger ingen retention (princip 4); et senere UI-valg af `time_based` på kontakt-felter ville ramme dette fundament-gap (T7.12 R).
- Fundamentets due-gate bruger `current_date` (session-TZ) — pakkens S-17/S-18 gør den effektive dato robust, men gaten selv er uden for pakken.

---

## 11. Ændringslog v1 (423d9b20) → v2 — pr. fund-id (fold-ind-rapporten bærer tilstand + bevis)

| fund | v2-afsnit | ændring (kort) |
| --- | --- | --- |
| A-1 · F01 | §2.1 · S-29 · K-8/ac-1 | ingen app-DML-grants; write-policies kun for D4; T8.1 → S |
| A-2 · F02 | S-28 · §2.1 | kategori `master_data` for logs |
| A-3 · F04 | K-7/S · §2.2 `_pii_klassifikation_guard` · Bid 1.1 · T7.1/T7.2 I | fysisk nedgraderings-/delete-værn uden bypass |
| A-4 · F03 · FUND-1 · U06 | S-24 · K-7/ac-3/ac-4 · W18/I7/I8 · B-3 | adresse none; lokations-vej leveret; indirect-læsning deklareret |
| A-5 | Bid 5.1 pkt 2 · S-22 · T7.8 I | mapping seedet draft; lifecycle via fælles RPC'er; dæknings-guard |
| A-6 | S-20 · §2.4 · K-8/ac-4 · T8.5 I | SECDEF read m. page-gate; klient_id only; læse-matrix |
| A-7 · U07 | §0.2 ctx-A/ctx-B, roller · K-9/ac-1 | positive kæder som R+ via API; to testkontekster pr. negativ |
| A-8 · F11 | §1 mutant-kolonner · kill-list-bindinger | Codex' T-id'er I/R/S; pr.-knap-frø skåret |
| A-9 · U04 | S-17 · I1-I4 (4)/(7) · T6.14 I · B-1 | effektiv dato = greatest(ønsket, apply-dag) |
| A-10 · F06 | S-18 · §2.2 · DDL `sat_dato` · K-1/ac-3, K-4/ac-5 FS | UTC-helper + stamp-trigger; ingen `::date` uden zone |
| A-11 · U02 · U05 | §2 (W1-W18, R1-R17, I1-I8) · §0.2 katalog · S-32 | fuldt register m. ACL/returtyper/named errors/typegrænser |
| A-12 · F12 | §0.1 FA-2 · §9 · K-2/ac-6/SA-1, K-6/ac-2/SA-1 | to-sessions-bevis blokerende; B-3-residual fjernet |
| A-13 · U01 | hoved · §0.1 · §1 kolonner C/N · §9 | P-8 optaget; fabrik-afhængigheder m. ejer/gate |
| A-14 · U08 | S-25 · §2.4 · K-9/ac-2 · T9.3 I · §3 (iv) sentinels | keyset-paginering; OpenAPI-sentinels |
| A-15 · U10 | K-1/ac-4 (b)(c) · S-26 | typede returns; kontrakt-/functiondef-assert |
| FUND-2 | §6 | max_rows attribueret til recon-2 |
| FUND-3 | V9 | citat ordret (»ikke nødvendigvis nødvendig«) |
| FUND-4 | K-2/ac-1 · DDL-kommentar | »V-A« → S-1 |
| FUND-5 · F15 | §0 · §5 · §6 · K-1/ac-4 | seks entries; blob8; types-gen-linjer; E014; step 1.3; 426 linjer; money-FK-frø → E139 |
| F05 | S-30 · §2.1 | FORCE uniformt; trigger-kontekst korrekt |
| F07 | S-31 · K-6/ac-10/neg-7 · T8.9 I | fundamentets self-approve-regel arvet |
| F08 | V1 | begrundelse: nyt kodearbejde navngivet |
| F09 | §2.5 I6 · V2 | callable-form `6083fecd:84-91`; replay `6f0e1db3:270-288` |
| F10 | V8 | luk-åben = `17930649:98-100`; exact-start-DELETE = `7e490d5f:357-398` |
| F13 | S-23 · W3/W4 · I5/I6 | begge kontakt-RPC'er låst; inaktiv ved anonymisering |
| F14 | V2 · §6 pkt 4 | konflationen beskrevet korrekt |
| F16 | §2.3 indledning | skærpelse deklareret »valgt her« |
| U03 | S-20 · K-8/ac-4 | læse-kontrakt: 42501 på RPC, rows=[] på SELECT, intet række-scope |
| U09 | §4 gennemgående | »valgt her« i stedet for nødvendigheds-påstande |
| — (afledt) | S-3 · S-27 | logs får audit (ingen AUDIT_EXEMPT-udvidelse) |
| — (afledt) | S-19 | låse-rækkefølge og race-taber-kontrakt |
| — (afledt) | §2.4 R14 | `lokation_klienter` returnerer kun `klient_id` (A-6-følge) |
| — (afledt) | DDL | alle logs får `id uuid` PK + `seq` (audit `record_id` kræver `id`, E027) |
