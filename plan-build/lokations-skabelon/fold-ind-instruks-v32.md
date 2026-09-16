# Fold-ind-instruks v3.2 — plan v3 → plan v3.2 (SIDSTE planner-delta i B4's ene ekstra runde), lokations-skabelon

**Status: BINDENDE** (driver mathias-5f, 2026-09-16; afløser driver-10b's udkast af 11/9). Dette er den SIDSTE planner-rettelse i
GRUNDPLAN B4's ene dokumenterede ekstra runde: A' (Codex delta pr. henvisning på v3), B' (fresh-eyes r3), v3.1 (manifest) er
kørt på v3 @ 4716507 — deres fund + Mathias' ord M-42/M-43 foldes ind i ÉT delta → plan v3.2. Derefter dømmer A'' (Codex delta på
v3.2), C (code-reviewer frisk slutlæser) og claude-ai v3.2 som GATE-DOMME (B6). Alle regler i `fold-ind-instruks-udkast.md`
(runde 1, pkt. 1-10) og `fold-ind-instruks-v3-udkast.md` (runde 2, pkt. 11-21) gælder uændret, MED ÉN UNDTAGELSE: pkt. 13/20's
»KRÆVER MATHIAS« er OPHÆVET af Mathias' ord M-42 (se pkt. 22). Rolle: **planner-code** @ lock. Aktivitet: produktion. Workdir:
arkiv @ `<PIN>` uden `.git`, uden for `~/.claude`. Blobs verificeres med `git hash-object <fil>` (ÉN kommando pr. Bash-kald, ingen
`&&`/pipes). Skriv KUN de tre leverancer. Rør ikke driverens filer (fund-log · ledger · ordbog · p8-* · provenance/ · køreplan).

## Bindinger (afvigelse = HALT)

- plan v3 (udgangspunkt): `plan.md` @ `c5f451f8a901c3fea23576de6aee1be0f2f51f5a` (871 linjer) · rapport-r3 @ `1b0240c1bf99115e265877ef83ff16d4be131488`
- **manifest (udgangspunkt, v3.1 i endeligt skema, validator-gyldigt):** `forventnings-manifest.json` @ `ce191381b919fb4c2a9e5242eb00189762dc7a17`
  (= planner v3.1's leverance `bc6a8062` minus 10 `locus`-strenge; `bindings.plan.oid` = c5f451f8). Validator = repoets
  `scripts/v5/forventnings-manifest.mjs` @ `64ea01e0` (i workdir'en): kør
  `node scripts/v5/forventnings-manifest.mjs validate plan-build/lokations-skabelon/forventnings-manifest.json` — »✓ manifest gyldigt« er kravet.
- **Batch-kilder (ALLE skal foldes ind — hver fund-id får præcis én tilstand, pkt. 11-gyldigt bevis):**
  - `plan-angreb-r3.md` @ `1dad9636fb510b82b266bfb546c2afed82ee703a` — Codex A': §1 tabel 77 fund m. **22 »Nej«** (hver Nej-række skal
    have en NY rapport-række der viser hvorfor v3.2-teksten nu bærer det — eller ærligt »åbent« m. begrundelse) · §2 21 kill-list-
    dispositioner m. **9 »Nej«** (gen-disponeres ved kilden) · §3 **A3-1..A3-8** · §4 frit pas.
  - `plan-audit-fresh-eyes-r3.md` @ `82229a6ad1312f2e200af7906d51ee4ce0c0dd1f` — **FUND3-1..FUND3-4** · SM-1..4 · form-noter · »plan-SHA-synk«-liste (pkt. 8 —
    dens »B-5/D-6 → SPØRGSMÅL« er OVERHALET af M-42, se pkt. 22).
  - `provenance/manifest-v31.slutbesked.md` @ `16a76c84f30bb50afdc5c50f55c53bf4f3fb3faf` — v3.1-plannerens »MANGLER KILDE«-liste = **V31-1..V31-11** i fund-log
    Kilde 13 (pkt. 32).
  - `fund-log.md` @ `14535e1dea9d262ac2277e6688a1e3fa37a503ce` — ALLE fund m. tilstand (Kilde 1-13); dit arbejdskort. Rettelser af driverens fund-log laver DRIVEREN
    ud fra din rapport.
- **Mathias' ord (BINDENDE, ledger `mathias-ord.md` @ `5f4425d135e9cf56b9bf137a6a45f6bf96591c11`, M-1..M-43):** M-42 (15/9): »nu får jeg en masse spørgsmål? plan er
  kode og krav er forretningsgange - derudover s-2 spørgsmålet modsiger mine sandhedsdokumenter: svaret på spørgsmålet er at de
  styres i ui« · M-43 (15/9): »det er ikke mit bord« / »altså så længe det kun er kode logikker«. Implplan DEL VIII pkt. 37 +
  Fase 3 pkt. 4 (implplan @ `11fb22087c7fa57776d2e04dd70826db626392b6` — RE-PIN planens implplan-reference hertil; v3 pinnede 0fdd5b1e).
- **Driverens rettede kildekontrakt (A3-1 — LÆS, ret ikke):** `p8-kildekontrakt.md` @ `5183dec1d39fcb327cb7ef477d1e5fb8f5fa2a34` · `p8-kilde.json` @ `0b253117263ab55553a12bba78f213b25f5b633d`
  · `p8-kilde-scope.sql` @ `2353d3924dabfb8b5371dbb9c4f41d2352d2de34` (sha256 `67663a2af68cf90af5b757a7ef9d96c59fbd99573cf02052d9c5c199b3f26b1e`) · `p8-kilde-katalog.txt` @ `12f6babacc84ffe3db9d5f76cf26e51d6bc4bc62` (forventet_katalog_digest
  `d701ec56628bc7ebcd2624973e37691985964c4fdee9e8d49ee399449880ccfd`) · `p8-kilde-gen.mjs` @ `e64e7c2027cf28343b484f7f3342f0a86fba92f4`. Planens FA-5-reference skal pege på DISSE blobs (pkt. 31).
- uændrede låste input: krav `9402164d` · kill-list `13b78392` (autoritet) · forventningsliste (LÅST) `2200b76e` · recon2 `2bdbb122` ·
  bilag `6e569779` · P-8 `4af07ef4` · ordbog @ `bcab6b4ed9c9c0fe21f13c70d8e1d47a2afd9fef` · devil-REN Mathias-liste `spoergsmaal-plan-r2.md` @ `598f98fd` (den
  tekst Mathias FIK og svarede M-42 på) · adapter-krav-liste `460a9b26` · rolletekst planner-code @ lock.

## Pkt. 22 — §10 omskrives til PLANNERENS DEKLAREREDE DEFAULTS (M-42 · DEL VIII pkt. 37) — INGEN spørgsmål til Mathias

Mathias' bord er krav (forretningsgange) og godkendelses-ordet; plan-mekanik (bid-opdeling, datomekanik, kant-regler, feltlister
inden for kravets delegation) er DIT. **Bord-testen for enhver §10-post: »ændrer det et krav eller et sandhedsdokument?« — hvis
nej, er det dit valg, deklareret som default; hvis ja, er det HALT-flag (krav-problem), ikke et spørgsmål.** Konkret:

- **S-2 er AFGJORT af M-42, ikke et default:** præmissen (undtagelse fra K:143) blev afvist — »styres i ui« = om et felt er
  persondata afgøres i UI (K-7 ac 1); markeres det, SKAL det kunne anonymiseres (K:143). Planens stilling = v3's variant **S-2-B**
  (`_pii_klassifikation_guard` afviser `indirect` uden anonymiseringsvej på pakkens tabeller; personfelt kun `direct` eller `none`;
  `K-7/S/neg-4` tilføjes manifestet; T7.10 instansieres; §4 S-24 omskrives; T7.10's R-disposition i §1 vendes). Kilde: K:143 +
  M-42 (ordret citeret). Ingen krav-ændring — påstanden P:23/751 »ingen krav-ændring« er dermed SAND (FUND3-4's udfald A bortfalder).
  Udfald A (registrering uden anonymisering) fjernes fra planen; ingen variant-markering tilbage.
- **S-1 afgøres af DIG (K:179/181 delegerer feltlisten til planfasen):** vælg ÉN model og skriv den færdig — enten V1 (fast
  kolonneliste; navngiv afvigelsen fra kravets udgangspunkt »som for klienter« K:181 og hvorfor den ligger inden for delegationen) og
  FJERN S-1-B-varianten og alle dens henvisninger konsistent (P:396,573,711,757 · `K-3/ac-3/neg-3`/`neg-4` hvis variant-bundne),
  ELLER S-1-B færdiggjort så den er bygbar (A3-5: fuldt register m. typer/returkontrakt · rettigheder · klassifikationsværn der
  faktisk gør persondata-valget urepræsenterbart · alle nye objekter i katalog-/ACL-/handlingsmængderne P:198,210,215,565 · `neg-4`
  m. bundet meningsfuld mutant). Ingen »begge udfald bygbare«-form tilbage.
- **B-5 (ny stand på nedlagt) og D-6 (mindst én dag)** = dine deklarerede defaults (kant-regler, pkt. 37) — skriv default, kilde
  (»planner-valg inden for K:71/K:181-delegation«; M-30.2 må nævnes som analogi, ikke som mandat — FUND3-2), og hvad der sker ved
  stop (ny plan-SHA; navngiv de berørte værn/negativer/DDL — for D-6: AK-DATO-FOER-START, CHECK `gaeldende_fra < gaeldende_til`,
  P:511/531, berørte ac; FUND3-3).
- **B-1 og B-4 i devil-formen (A3-8):** B-1: godkendelse ≠ ikrafttræden — »træder i kraft« kræver BÅDE godkendelse OG udløbet
  fortrydelsesfrist; planens 3/10-eksempel må ikke love virkning på godkendelsesdagen m. 24-timers default. B-4: ingen første-dags-
  garanti — kobling og fravalg er separate godkendelses-/apply-forløb der kan træde i kraft på forskellige dage; teksten siger hvad
  der GÆLDER (fravalget skal være trådt i kraft senest samme dag som koblingen for udelukkelse fra første dag). B-4's citat = M-36
  ORDRET: »En lokation kan fravælge en klient gruppen har, og ophæve fravalget igen.« (FUND3-1 — tjek ALLE »Dit ord«-citater i §10
  mod ledgeren ordret).
- **B-2 · D-1..D-5 · D-7 · D-8 · D-9 · D-10 · SM-1..4 · S-3 (held-out læser PROD read-only, p8-kildekontrakt (1))** = orienteringer
  (deklarerede defaults/kendte grænser) i Mathias' sprog, ordbogens ord, ingen systemord (fresh-eyes r3 form-noter: systemord ud
  af D-2/D-3). D-10 får eget id (var indlejret i B-1 i den sendte liste). S-3 er IKKE et spørgsmål (devilen tog den ud) — kun
  orientering om defaulten.
- §10's overskrift/struktur: **»HALT-flag: INGEN« · »KRÆVER MATHIAS: INGEN (pkt. 37 — bord-testen anvendt på hver post)« ·
  »Plannerens deklarerede defaults (orienteringer under plan ok)«** som ÉN tabel: id · default (Mathias' sprog) · kilde/mandat ·
  hvad der sker ved stop. Rapport-optællingen får »kræver Mathias = 0« (rapport-r3 havde 8).
- Spørgsmåls-devilen (driverens, B7) får »plan = kode« som akse og dømmer §10-teksten ÉN gang — skriv derfor hver post så den
  består bord-testen synligt (kilde-kolonnen).

## Pkt. 23-30 — A3-2..A3-7 + FUND3-1..3 (alle BLOKER/RET rettes m. bevis — pkt. 11-form: `plan.md:<linje>` + ID + negativ/observation/mutant)

23. **A3-2 (D12/bijektion):** P:240 skal oplistes med ALLE 11 (K-9/S mangler) og summen P:242 stemme; K-9/S ind i Bid 5's done-liste
    (P:565). T8.2: krævet drab i det bid hvor K-8/ac-4 afsluttes (P:354's regel) — flyt enten obligationen eller drabet, konsistent i
    matrix · bid-tabel · done. K-1/ac-4: eksplicit SLUTBINDING for den tværgående output-/økonomikontrol (R12 i Bid 3, R13-R17/I5-I8
    senere) — enten afsluttes K-1/ac-4 i det bid hvor den sidste read-RPC findes, eller de senere dele får egen navngiven slutbinding
    m. effekt-bid; A-15/U10 samme forhold. T6.8: to forskellige mutanter (inde i R4 P:155 · R13's argument til R4 P:186) — giv dem
    entydige instans-ankre (fx T6.8-a/T6.8-b m. locus) og bind hver til sit bid/case; »genobservation« (P:192,492,548) er ikke et drab.
    V31-10: `effekt_bid` konsistent — K-2/S (eneste negativ bruger `stand_opret` W9 = 2.2) · K-7/S (FS-delen bruger
    `gruppe_kontakt_upsert` W3 = 1.2) · K-1/ac-4 (2.2, ikke »2.1 · 2.2«).
24. **A3-3 (afvisningskontrakt/audit — K-8/ac-2 · K-6/ac-10 · T8.6 · SL6.2/SL8.1 · A2-11/A2-13 · R2-2 · A-11 · U05):** skriv ÉN RPC-/
    hændelsesspecifik tabel (i §0.2 eller §2, henvist fra §1) m. kolonner: indgang · normal aktør · inputårsag ELLER arvet label
    (`role_permission_grant_set` · `undo_setting_update` · `replay_anonymization` har INGEN årsagsparameter — kilden sætter label;
    `anonymization_mapping_test_run` skriver `test_run OK: ` + årsag; `generic_apply` skriver `anonymization: ` + årsag; P:332's
    `anonymisering: ` skal stemme) · auditobservation (faktisk `change_reason`/label pr. række) · negativ m. sqlstate · afvisningssted ·
    grund · aktør. P:211(a) må ikke love brugerens tekst for alle W1-W18 mens (e)/P:298 binder W13-W16 til `pending_change_request`-
    labelen — én sandhed. Bind T8.6/SL8.1's targeted mutanter til den fulde flade (18 W'er + fælles RPC'er), ikke kun W1-W18.
    Afvisningskontrakter: samme negativ har samme førbetingelse, sted og klasse i §0.2 · §1 · §2 (A2-13 — én kilde, henvisninger).
25. **A3-4 (R+-overlay):** C0's R+-grants skal kunne nå hele den beskrevne kæde: `anonymization_mappings/manage` (upsert-kilden
    `ec3d9a0b:125-127`) · `pending_changes/settings` (undo_setting_update) — tilføj dem, navngiv C0-aktøren for rettighedstildeling
    særskilt, og skriv eksplicit at en TIDLIG 42501 aldrig krediteres som den tilsigtede afvisning (negativ-kontrakten binder
    afvisningssted). SL7.3/SL8.1/SL9.1 rebindes derefter.
26. **A3-6 (T7.12):** bind et understøttet `event_based`-forløb: offentlig konfiguration af opbevaringsregel (K:137 UI-værdi) · lovlig
    udløser · normal driftsrolle · konkret effektassertion (faktisk felt-erstatning gennem den udførende vej `6f0e1db3:325-369`) ·
    T7.12 skip-mutant. Ingen ny executor for `time_based`/`manual` (fundament-gap, arv-note består). K:142's default uden retention
    er et ANDET positiv — ikke en udtagelse.
27. **A3-7 (DateStyle):** payload-datoer produceres og parses i ét entydigt format (ISO 8601 `YYYY-MM-DD` via `to_char(d,'YYYY-MM-DD')`
    / `to_date(s,'YYYY-MM-DD')` eller jsonb-date-typet vej) i ALLE W13-W16/apply-stier (P:82,298,331); tilføj den sekventielle
    request→apply-prøve m. forskellige `DateStyle` (SQL,DMY vs SQL,MDY) og samme tilsigtede dato + en mutant der genindfører
    formatfølsom transport (skal gøre den lovlige kæde rød). R2-7 lukkes derved reelt.
28. **FUND3-1..3** som beskrevet i pkt. 22 (citat M-36 · B-5/D-6 som defaults m. stop-konsekvens). **FUND3-4** bortfalder m. S-2-B
    (skriv i §11 hvorfor).
29. **A'-»Nej«-rækker (22) og »ikke virksom«-dispositioner (9):** hver får NY række/disposition m. pkt. 11-gyldigt bevis ved kilden —
    ikke omformulering. Kill-list-ID'er er Codex' (T/S/SL) — du instansierer/disponerer, du omdøber ikke.
30. **K-forpligtelsen består (pkt. 5):** efter fold-ind genlæses hvert K mod forventningslisten; svagere ac = NYT fund (NF-7..).

## Pkt. 31 — FA-5/kildekontrakt (A3-1 er rettet af DRIVEREN — du synkroniserer planen)

Planens FA-5-række (§0.1) · P:35 · P:743 · BV-5 · §9 skal sige: felt 1 (systemidentitet) · 2 (scope: 6 populations- + 16 closure-
relationer i `core_identity`/`core_compliance`, alle rækker) · 3 (projektion m. navngivne udeladelser) · 5 (efter-build-form) er
BUNDNE i kontrakten @ `5183dec1d39fcb327cb7ef477d1e5fb8f5fa2a34`; felt 4 (isoleret måltarget) er DEKLARERET ÅBENT m. ejer (fabrik-armen, C4) og tidspunkt
(FØR Fase 5's fetch) — plan-lås kræver IKKE identiteten selv (v3's »før plan-lås« rettes). Katalogkontrollen er mekanisk
(EXCEPT begge veje + `forventet_katalog_digest` `d701ec56628bc7ebcd2624973e37691985964c4fdee9e8d49ee399449880ccfd`), ikke »hash af SQL-filen«. Referér ALLE fem blobs (kontrakt ·
json · scope.sql · katalog.txt · gen.mjs). A2-14 · A-13/U01 · A3-1 → RETTET M. BEVIS (driver) i rapporten m. disse OID'er.

## Pkt. 32 — V31-1..V31-10 (manifest-huller planen SKAL bære — ellers fejler motoren lukket på »MANGLER KILDE«)

V31-1 FA-3's apply-driftsindgang: BIND DB-rollen `pending_change_apply` kaldes som (cron-rolle/`postgres` via pg_cron vs.
`authenticated` via FA-3-driveren) — dit valg, deklareret i §0.1 FA-3 + §0.2, og `aktoer` i K-4/ac-9/neg-1 · K-6/ac-2/neg-2 ·
K-6/ac-10/neg-4,-5,-10 · V31-2 `stork_audit`-beskedens `%` (`source_type`): fastlæg om ctx-B-proben sætter `stork.source_type`
(manual/unknown) — én værdi · V31-3 AK-DAEKNING's `%`: definér interpolationen i §0.2/§2.2 · V31-4 K-8/ac-3/neg-2 dækker tre
guard-familier m. forskellige beskeder/steder: split i ét negativ PR. værn (nye `neg-k` efter ID-reglerne; audit-beskeden bærer
runtime-partitionsnavn → vælg besked uden partitionsnavn eller pin partitionen) · V31-5 runtime-uuid i AK-FINDES-IKKE: vælg —
enten fejlbesked UDEN uuid (fast token, anbefalet: `grund` bliver da lighed) eller en eksplicit substitutionsregel i §0.2 som motoren
kan følge; gælder K-2/ac-1/neg-1,-3 · K-2/ac-6/neg-3 · K-2/S/neg-1 · K-3/ac-1/neg-2 · K-3/ac-2/neg-2 · K-6/ac-1/neg-2,-4 ·
K-7/ac-2/neg-2 · V31-6 parametriserede negativer (K-9/ac-2/neg-1 R1-R16 m.fl.): pin ÉN repræsentant pr. negativ i §1 (som
manifestet gør) OG skriv ekspansionsreglen (alle instanser prøves; repræsentanten bærer `grund`) i §0.2 · V31-7 AK-PAAKRAEVET:
parameternavn eller feltnavn — ét valg · V31-8 skriv afledningerne eksplicit (K-7/ac-2/neg-7 `hash_email` · K-9/ac-3/neg-3
kolonne/niveau) · V31-9 §0.2 bærer de FULDE fundament-beskeder (AK-F-TESTCOVERAGE `test_run FAILED: PII-kolonne telefon mangler
strategy` · AK-F-WRONGSTATUS `pending_change_wrong_status: applied (expected approved)` · AK-F-ALLEREDE · AK-F-INGENMAPPING —
verificér i migrationerne) · V31-10 se pkt. 23. (V31-11 er afgjort af fabrik-armen 16/9: canaries/§9-overdragelser er IKKE
manifestets ansvar — brug `overdraget_former` + `overdragelse_ref` KUN hvor en forpligtelses bevisform reelt overdrages; exit-
kanalens `aktoer` OG `fase` = den frie, stabile streng `"ci"`.)

## Pkt. 33 — Manifest-synk (tredje leverance)

Ændres et ID, en negativ, en bevisform, et bid, en `grund`/`afvisningssted`/`aktoer` eller en assertion i planen, ændres manifestet
identisk (S-2-B: `K-7/S/neg-4`; A3-3: nye/rettede reject_contracts; V31-4: split; A3-2/V31-10: effekt_bid; S-1: neg-3/-4 efter dit
valg). INGEN `locus` på guards (udelades). Kør validatoren til »✓ manifest gyldigt« og skriv stats-linjen i slutbeskeden.
`bindings.plan.oid` = `"<udfyldes af driveren>"` (du kender ikke din slut-blob). Manifestet er gate-binding på plan- og build-gaten.

## Pkt. 34 — Ændringslog, rapport-r4, disciplin

- `plan.md` v3.2: status UDKAST; hoved m. `angreb_r3_oid` · `audit_r3_oid` · `manifest_v31_oid` · `kildekontrakt_oid` · `ledger` M-1..M-43 ·
  implplan @ `11fb22087c7fa57776d2e04dd70826db626392b6`; **§11.3 ændringslog v3 → v3.2 PR. FUND-ID m. `plan.md:<linje>`** (A'' dømmer delta pr. henvisning —
  hver linje i §11.3 er en henvisning den følger).
- `fold-ind-rapport-r4.md`: KUN delta — tabel m. alle fund-id'er der har ændret tilstand/linje siden r3 (A3-1..8 · V31-1..10 ·
  FUND3-1..4 · 22 A'-Nej-rækker · 9 dispositioner · S-1/S-2/B-5/D-6/FUND2-4-omklassificeringer) + FULD optælling pr. tilstand over
  ALLE fund (skal stemme m. fund-log; »kræver Mathias« = 0) + HALT-flag (eller »ingen HALT«) + §6 = §10's default-tabel (Mathias-
  vendt tekst, ordbogens ord) + nye ordbogs-entries (driveren committer dem før gaten) + bindinger. Kravet: ÅBNE = 0.
- Skriv ALDRIG »MANGLER KILDE« væk ved at opfinde — vælg og skriv »valgt her: …« med begrundelse inden for kravet (det er dit mandat,
  pkt. 37), eller HALT-flag hvis kravet må ændres.

## Output (skriv KUN disse)

`plan-build/lokations-skabelon/plan.md` (v3.2) · `plan-build/lokations-skabelon/fold-ind-rapport-r4.md` ·
`plan-build/lokations-skabelon/forventnings-manifest.json`. Slutbesked i ÉN besked: tre filnavne + sha256 + validator-stats + optælling
pr. tilstand + HALT (eller »ingen HALT«) + bindinger. Web forbudt · antag aldrig · én kommando pr. Bash-kald · læs store filer i bidder.
