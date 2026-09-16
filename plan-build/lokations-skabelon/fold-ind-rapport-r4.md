# fold-ind-rapport r4 — lokations-skabelon (plan v3 `c5f451f8` → plan v3.2) — KUN delta

**Aktør:** planner-code (Claude Fable 5.1 · xhigh · rolle @ skill_oid `eb190c08`) · **dato:** 2026-09-16 · **workdir:** arkiv @ `8c664f4f999af37f0f35da8bca7d4beba6018603` (uden `.git`, uden for `~/.claude`) · **input verificeret m. `git hash-object` (én kommando pr. kald, alle matcher v3.2-instruksens OID'er — ingen afvigelse):** plan v3 `c5f451f8` (871 linjer) · rapport-r3 `1b0240c1` · manifest v3.1 `ce191381` · plan-angreb-r3 `1dad9636` · plan-audit-fresh-eyes-r3 `82229a6a` · manifest-v31.slutbesked `16a76c84` · fund-log `14535e1d` · ledger `5f4425d1` (M-1..M-43) · implplan `11fb2208` · p8-kildekontrakt `5183dec1` · p8-kilde.json `0b253117` · p8-kilde-scope.sql `2353d392` · p8-kilde-katalog.txt `12f6baba` · p8-kilde-gen.mjs `e64e7c20` · krav `9402164d` · kill-list `13b78392` · forventningsliste `2200b76e` · recon2 `2bdbb122` · P-8 `4af07ef4` · ordbog `bcab6b4e` · devil-REN liste `598f98fd` · validator `64ea01e0`. Kodeankre hash-verificeret i workdir (nye i v3.2): `b19ef09f` · `fab7af0d` · `1d74e04f` · `f49e7d5b` · `6f0e1db3` · `550119e6` · `5f93b405` · `a7ec4884` · `e3cfa9fe` · `6083fecd` · `ec3d9a0b` · `ae336ee6` · `c3b2865c` · `b9f97633` · `d69ea57e` · `07ec8a8e` · `fb805b56`.

**Læseregel (instruks pkt. 11 + 34):** rapporten er et DELTA — kun fund hvis tilstand eller linje er ændret siden r3 står i §1; §1.5 giver den FULDE optælling over ALLE fund. »plan.md:linje« = linje i den skrevne v3.2-fil (921 linjer + §11.3-tabel). Tilstande: **RETTET M. BEVIS** · **INDEN FOR MANDAT** (kilde citeret; deklareret default) · **DRIVER** (driverens rettelse — synkroniseret i planen) · **BORTFALDET**. **KRÆVER MATHIAS = 0** (M-42 · implplan DEL VIII pkt. 37 — bord-testen anvendt på hver §10-post). »Bevis« = den negativ/observation/mutant der nu bærer hullet m. bevisform og `reject_contract_ref` (AK-id · afvisningssted · aktør).

## 1. Delta-tabel (fund hvis tilstand/linje ændrede sig siden r3)

### 1.1 A3-1..A3-8 (Codex A' §3) — BLOKER/RET

| fund-id | tilstand | plan.md:linje + ID | bevis / mandat |
| --- | --- | --- | --- |
| A3-1 (BLOKER · FA-5) | **DRIVER + RETTET M. BEVIS** (driveren rettede kontrakten 16/9; planen synkroniseret) | `plan.md:20` (fem kontrakt-blobs) · `:35` FA-5 · `:37` · `:788` §9 held-out · `:832` BV-5 | Kontrakt @ `5183dec1`: felt 1 (project-ref `imtxvrymaqbgcvsarlib`, database `postgres`) · 2 (6 populations- + 16 closure-relationer i `core_identity`/`core_compliance`, alle rækker) · 3 (193 kolonner i `p8-kilde-katalog.txt` @ `12f6baba`; navngivne udeladelser) · 5 (efter-build-form) BUNDNE; felt 4 DEKLARERET ÅBENT m. ejer (fabrik-armen, C4) og tidspunkt (før Fase 5's fetch); katalogkontrol mekanisk (EXCEPT begge veje + `forventet_katalog_digest` `d701ec56…`); »før plan-lås« rettet til »felt 1-3+5 bundne + felt 4 åbent m. ejer/tidspunkt«. Bevis: bindings-strukturelt (P-8 §1 T:34/T:42-56/T:238 pkt. for pkt.). |
| A3-2 (BLOKER · D12/bijektion) | **RETTET M. BEVIS** | `plan.md:41` (effekt-bid-regel + instans-ankre) · `:148` K-1/ac-4 · `:164` K-2/S · `:189` K-4/ac-5 · `:195` · `:220` K-6/ac-7 · `:226` · `:236` K-7/S · `:247` K-8/ac-4 · `:251` · `:260` K-9/S · `:270-276` bijektion · `:521` · `:529` · `:585` · `:602` done-lister | Bid 5 oplister 12 (`K-9/S` + `K-1/ac-4` tilføjet), sum `2 + 12 + 13 + 21 + 12 = 60`; **T8.2** dræbes i Bid 4 (K-8/ac-4's effekt-bid; instans W13, `K-8/ac-4/neg-1` UT AK-PERM 42501 `core_identity.gruppe_klient_kobl` · V); **K-1/ac-4** slutbinding → 5.1 (én test `t10b_oekonomi_graense.sql` over alle 43 funktioner; `K-1/ac-4/neg-1..3` UT exit-kanal `ci`); **T6.8** → T6.8-a (R4, Bid 3, K-4/ac-5 FS) + T6.8-b (R13's argument til R4, Bid 4, K-6/ac-7 FS) — »genobservation« fjernet; V31-10: K-2/S → 2.2 · K-7/S → 1.2. Manifest: `effekt_bid` 5.1/2.2/1.2. |
| A3-3 (BLOKER · afvisningskontrakt/audit) | **RETTET M. BEVIS** (labels fortsat INDEN FOR MANDAT K:161/K:185/K:274) | `plan.md:110-133` §0.3 (16 rækker + familie A) · `:100` AK-FUNDAMENT-* · `:186` K-4/ac-2 · `:223` K-6/ac-10 · `:233` K-7/ac-2 · `:245` K-8/ac-2 · `:251` · `:366` I5 · `:382` §2.6 · `:679` S-42 | Én RPC-/hændelsesspecifik tabel: indgang · normal aktør · inputårsag ELLER arvet label (`role_permission_grant_set` `b19ef09f:34` · `undo_setting_update` `fab7af0d:30` · `replay_anonymization` `6f0e1db3:288` · approve/undo `ae336ee6:108,175` — ingen årsagsparameter) · faktisk `change_reason` pr. række (`anonymization: ` `6083fecd:105` · `test_run OK: ` `ec3d9a0b:235` · `replay: ` · pending-UPDATE = brugerens tekst `f49e7d5b:212-216`) · negativ. **Bevis:** `K-8/ac-2/neg-1` UT (AK-AARSAG 22023 `core_identity.lokation_saet_status`, 18 W) · `K-8/ac-2/neg-2` UT (22023 `change_reason er paakraevet` @ `core_compliance.anonymization_mapping_upsert`, familie A = 7) · FS-assertions pr. §0.3-række (`k-8.ac-2.fs.*` inkl. ny `pending-update-til-applied-baerer-brugerens-tekst`) · T8.6 I (25 instanser) · K-6(k)-arv I (I1 uden `set_config` → to rækker bærer `pending_change_apply`). I5's `anonymisering: ` → `anonymization: ` (S-42). |
| A3-4 (BLOKER · R+-overlay) | **RETTET M. BEVIS** | `plan.md:49` (»tidlig 42501 krediteres aldrig«) · `:130` §0.3 #15 · `:600` Bid 5.2 rights-overlay · `:251` | Overlay = fuld liste: + `anonymization_mappings/manage` (`ec3d9a0b:125`) · + `pending_changes/settings` (`fab7af0d:23`); C0-aktør = SA (superadmin har `permissions/manage` `1d74e04f:45`; `has_permission` uden admin-kortslutning `07ec8a8e:15-85`). **Bevis:** K-7/ac-4/neg-2,-6 UT (AK-DAEKNING P0001 `core_compliance._mapping_daekning_guard` — nåbar fordi upsert-grantet findes) · K-6/ac-10 MH (undo-vindue via `undo_setting_update`) · regel: 42501 før negativets `afvisningssted` = protokol-fejl. SL7.3/SL8.1/SL9.1 rebundet. |
| A3-5 (BLOKER · S-1-B) | **RETTET M. BEVIS** (variant fjernet; S-1 = planner-valg, INDEN FOR MANDAT) | `plan.md:610` V1 · `:433` Bid 1 done · `:688` §5 · `:756` Blok A · `:804` §10 S-1 · `:21` | S-1 afgjort HER (pkt. 37): V1 fast kolonneliste m. navngivet afvigelse fra K:181's udgangspunkt og begrundelse inden for K:57/K:181; S-1-B og ALLE henvisninger fjernet (ingen `K-3/ac-3/neg-3/-4`, ingen »felt«-entry, Blok A's placeholder erstattet, S-1-B-ankre ud af §0); stop-konsekvens deklareret. Manifestet er uændret på K-3/ac-3 (neg-1/-2). |
| A3-6 (RET · T7.12) | **RETTET M. BEVIS** | `plan.md:235` K-7/ac-4 (e) · `:238` · `:33` FA-3 · `:124` §0.3 #9 · `:291` · `:323` W4 · `:366` I5 · `:367` I6 · `:415` DDL · `:594` seed · `:600` (8b) · `:602` · `:675` S-38 · `:833` BV-7 · `:838` · `:823` SM-4 | Understøttet `event_based`-forløb: UI-valg `data_field_definition_upsert(…,'event_based','{"event":"udfasning","days_after":30}',…)` (K:137; `550119e6:77`) → W4 udfaser K1a (`udfaset_dato = dags_dato_utc()`) → FA-3 D0+29: pg_cron `retention_cleanup_daily` (ejer `postgres`, `6f0e1db3:315-373`) erstatter intet → D0+30: jobbet kalder `_anonymiser_gruppe_kontakt_internal(K1a, 'retention: 30 dage efter udfaset_dato')` → felt-erstatning; K1b/K_H uberørte. **Bevis:** FS-assertions `k-7.ac-4.fs.e-*` (3) + **T7.12 I** (mapping-loop m. `entity_type <> 'gruppe_kontakt'` → K1a uændret → rød). Ingen ny executor; `time_based`/`manual` og lokations-felter = arv-note. |
| A3-7 (RET · DateStyle) | **RETTET M. BEVIS** | `plan.md:90` AK-DATO-DRIFT · `:223` K-6/ac-10 · `:226` · `:332` W13 · `:365` I1-I4 (1) · `:585` Bid 4 · `:676` S-39 · `:788` | W13-W16 `to_char(…,'YYYY-MM-DD')`; I1-I4 regex `^[0-9]{4}-[0-9]{2}-[0-9]{2}$` + `to_date`; DateStyle-prøve (request `SQL, DMY` → apply `SQL, MDY`, dato 2026-04-03) som obligatorisk FS (`k-6.ac-10.fs.datestyle-dmy-request-mdy-apply-samme-dato-2026-04-03-ingen-drift`). **Bevis:** DATO-TRANSPORT-mutant I (W13 `::text` → `invalid_payload`/AK-DATO-DRIFT → lovlig kæde rød) + `K-6/ac-10/neg-10` UT (AK-DATO-DRIFT P0001 `core_identity._apply_gruppe_klient_kobl`, aktør `authenticated`). R2-7 lukket reelt. |
| A3-8 (AFSTEMNING) | **RETTET M. BEVIS (afgjort af M-42)** | `plan.md:794-825` §10 · `:23` · `:61` · `:175` · `:645` · `:654` · `:778-782` §8 | §10 omskrevet: HALT-flag INGEN · KRÆVER MATHIAS INGEN · én tabel af deklarerede defaults m. kilde (bord-test) og stop-konsekvens (S-1 · S-2 (M-42) · S-3 · B-1 · B-2 · B-4 · B-5 · D-1..D-10 · SM-2..4); B-1/B-4 i devil-formen; systemord ud af D-2/D-3; »Dit ord«-citater ordret (M-36, M-42). Ingen to lister længere. |

### 1.2 V31-1..V31-11 (manifest-huller)

| fund-id | tilstand | plan.md:linje + ID | bevis / valg |
| --- | --- | --- | --- |
| V31-1 | **RETTET M. BEVIS** | `plan.md:33` FA-3 · `:120` §0.3 #5 · `:193` · `:215` · `:223` · `:677` S-40 | `pending_change_apply(uuid)` kaldes som `authenticated` (A+ via API); manifest `aktoer` = `authenticated` for K-4/ac-9/neg-1 · K-6/ac-2/neg-2 · K-6/ac-10/neg-4,-5,-10 (`fase` = apply). |
| V31-2 | **RETTET M. BEVIS** | `:186` K-4/ac-2/neg-2 · `:245` K-8/ac-2/neg-3 · `:680` S-43 | ctx-B sætter ikke `stork.source_type` → `unknown` (`e3cfa9fe:47-58`); grund `… for source_type=unknown`. |
| V31-3 | **RETTET M. BEVIS** | `:96` AK-DAEKNING · `:235` · `:681` S-44 | tre faste sager; K-7/ac-4/neg-2,-6 grund `anonymiseringsdaekning_ufuldstaendig: core_identity.gruppe_kontakter.telefon mangler strategi`. |
| V31-4 | **RETTET M. BEVIS** | `:91` · `:246` K-8/ac-3/neg-2,-3,-4 · `:309` · `:682` S-45 | split: neg-2 audit (`TRUNCATE core_compliance.audit_log` → `block_truncate_immutable`, besked uden partitionsnavn) · neg-3 logs (`pris_historik_immutabel (operation UPDATE)`) · neg-4 koblinger (`gruppe_klient_koblinger_immutabel (operation DELETE)`). |
| V31-5 | **RETTET M. BEVIS** | `:47` · `:73` · `:164` · `:233` · `:678` S-41 | regel A: pakke-beskeder uden uuid (`<fn>: <objekt> findes ikke` — 8 manifest-grunds rettet) · regel B: `{id}`-substitution for fundament-beskeder (K-7/ac-2/neg-2). |
| V31-6 | **RETTET M. BEVIS** | `:43` · `:223` · `:244` · `:245` · `:246` · `:257` · `:258` | repræsentanter pinnet i §1 + ekspansionsregel i §0.2. |
| V31-7 | **RETTET M. BEVIS** | `:45` · `:69` · `:72` · `:163` | `<felt>` = parameternavn uden `p_` (4 AK-PAAKRAEVET-grunds + K-2/ac-6/neg-1 `foerste_stand_navn` rettet). |
| V31-8 | **RETTET M. BEVIS** | `:100` · `:233` · `:259` | `hash_email` (`order by c.column_name` `6083fecd:71`) og K-9/ac-3/neg-3's kolonne/niveau eksplicit. |
| V31-9 | **RETTET M. BEVIS** | `:100` | fulde fundament-beskeder i §0.2 (verificeret i migrationerne). |
| V31-10 | **RETTET M. BEVIS** | `:41` · `:148` · `:164` · `:236` | se A3-2. |
| V31-11 | **RETTET M. BEVIS (afgjort af fabrik-armen 16/9)** | `:103` · `:788` | ingen `overdraget_former` (ingen form overdrages reelt); exit-kanalens `aktoer`/`fase` = `ci` (2 negativer). |

### 1.3 FUND3-1..4 (fresh-eyes r3)

| fund-id | tilstand | plan.md:linje + ID | bevis |
| --- | --- | --- | --- |
| FUND3-1 | **RETTET M. BEVIS** | `:809` B-4 · `:175` | M-36 ordret (ledger:85): »En lokation kan fravælge en klient gruppen har, og ophæve fravalget igen.« |
| FUND3-2 | **RETTET M. BEVIS** (relabel; FUND2-4 → INDEN FOR MANDAT som deklareret default) | `:645` S-8 · `:810` B-5 | B-5 = planner-default m. kilde K:71 + K:48/K:181; M-30.2 analogi; stop: W9-gate fjernes (ingen manifest-negativ). |
| FUND3-3 | **RETTET M. BEVIS** | `:816` D-6 | D-6 = planner-default m. kilde (K:111/K:181 · K:122) og NEJ-udfald (CHECK `<=`, AK-DATO-FOER-START kun `<`, negativer `K-3/ac-6/neg-3` · `K-6/ac-5/neg-3` · `K-6/ac-6/neg-4`, ac K-3/ac-6 · K-6/ac-5 · K-6/ac-6 · K-6/ac-10, Bid 4 angrebs-spec). |
| FUND3-4 | **BORTFALDET** (S-2-B) | `:23` · `:661` · `:796` | udfald A fjernet — påstanden »ingen krav-ændring« er sand; K:143 står. |

### 1.4 A'-»Nej«-rækkerne (22) — ny række pr. fund-id

| fund-id | r3-tilstand → A' | v3.2-tilstand | plan.md:linje + ID | hvorfor v3.2 bærer det |
| --- | --- | --- | --- | --- |
| A2-2 | IM → Nej (A3-6) | **RETTET M. BEVIS** | `:235` (e) · `:238` T7.12 I | bundet `event_based`-forløb + T7.12 I; K:142-defaulten er ac-3's positiv, ikke udtagelse |
| A2-3 | RB → Nej (A3-4) | **RETTET M. BEVIS** | `:600` overlay · `:49` · `:235` | `anonymization_mappings/manage` i overlayet → `K-7/ac-4/neg-2` (AK-DAEKNING) nås gennem R+ |
| A2-4 | RB → Nej (A3-4) | **RETTET M. BEVIS** | `:600` · `:235` (d) | mapping-grant → opsætningskæden (adresse→direct → upsert → test_run → approve → activate → W18) nås; `K-7/ac-4/neg-5` (AK-LOKATION-ANONYMISERET) |
| A2-9 | RB → Nej (A3-2) | **RETTET M. BEVIS** | `:41` · `:270-276` · `:148` · `:247` | 60 = 2+12+13+21+12; T8.2 i Bid 4; K-1/ac-4 slutbinding; T6.8-a/-b |
| A2-11 | IM → Nej (A3-3) | **RETTET M. BEVIS** (labels IM) | `:110-133` · `:245` | samlet årsagskontrakt pr. skrivevej i §0.3 |
| A2-13 | RB → Nej (A3-3) | **RETTET M. BEVIS** | `:100` · `:110-133` · `:245` | fælles årsagsafvisninger individuelt bundet (familie A) og konsistente i §0.2/§0.3/§1/§2 |
| A2-14 | RB → Nej (A3-1) | **DRIVER + RETTET M. BEVIS** | `:35` · `:37` · `:788` | kontrakt @ `5183dec1` opfylder FA-5's felt 1-3+5; felt 4 åbent m. ejer/tidspunkt |
| FUND2-1 | KM → Nej (A3-5/A3-8) | **INDEN FOR MANDAT** (S-1 planner-valg) | `:610` V1 · `:804` | K:57 + K:181 delegerer feltlisten; afvigelse fra udgangspunktet navngivet; ingen variant |
| FUND2-2 | IM → Nej (A3-8) | **INDEN FOR MANDAT** (B-4 devil-form) | `:809` · `:175` | kerne K:65/K:121/M-36; første-dags-løftet fjernet |
| FUND2-4 | IM → Nej (A3-8) | **INDEN FOR MANDAT** (deklareret default B-5) | `:810` · `:645` | K:71 + K:48/K:181; M-30.2 analogi |
| NF-1 | IM → Nej (A3-8) | **INDEN FOR MANDAT** (B-1 devil-form) | `:807` · `:61` · `:654` | K:122/K:126/M-13; godkendelse ≠ ikrafttræden |
| R2-2 | RB → Nej (A3-3) | **RETTET M. BEVIS** | `:117` §0.3 #2 · `:120` #5 · `:245` | request-rækken = label; apply-rækker inkl. pending-UPDATE = brugerens tekst; ingen (a)-løfte for W13-W16 |
| R2-7 | RB → Nej (A3-7) | **RETTET M. BEVIS** | `:90` · `:365` · `:332` | ISO-transport + DateStyle-prøve + mutant |
| A-4 | KM+RB → Nej (A3-4) | **RETTET M. BEVIS (afgjort af M-42)** | `:600` · `:661` S-24 · `:236` K-7/S/neg-4 | direct-kædens R+-opsætning nåbar; indirect urepræsenterbar (S-2-B) |
| A-5 | RB → Nej (A3-4) | **RETTET M. BEVIS** | `:600` · `:126` §0.3 #11 | mapping-upsert nås gennem R+ |
| A-11 | RB → Nej (A3-3) | **RETTET M. BEVIS** | `:110-133` · `:100` | registerets afvisningskontrakt konsistent |
| A-13 | RB → Nej (A3-1/A3-2) | **RETTET M. BEVIS** | `:35` · `:264-276` | FA-5 + effektfordeling |
| A-15 | BV2 → Nej (A3-2) | **RETTET M. BEVIS** | `:148` | slutbinding K-1/ac-4 → 5.1 over alle 43 funktioner |
| U01 | RB → Nej (A3-1/A3-2) | **RETTET M. BEVIS** | `:35` · `:270-276` | som A-13 |
| U05 | RB → Nej (A3-3) | **RETTET M. BEVIS** | `:110-133` · `:100` | fælles årsagskontrakter matcher kilden |
| U06 | RB+KM → Nej (A3-4/A3-6) | **RETTET M. BEVIS (afgjort af M-42)** | `:600` · `:235` · `:661` | overlay + retention (e) + indirect afgjort |
| U10 | BV2 → Nej (A3-2) | **RETTET M. BEVIS** | `:148` | som A-15 |

### 1.5 Øvrige omklassificeringer

| fund-id | r3 | v3.2 | plan.md:linje + ID | bevis / kilde |
| --- | --- | --- | --- | --- |
| A2-1 · FUND2-3 · NF-2 · FUND-1 · F03 | KRÆVER MATHIAS (S-2) | **RETTET M. BEVIS (afgjort af M-42)** | `:661` S-24 · `:236` K-7/S/neg-4 · `:95` AK-PII-INDIRECT · `:313` guard · `:427` Bid 1 trigger · `:805` | M-42 ordret »s-2 spørgsmålet modsiger mine sandhedsdokumenter: svaret på spørgsmålet er at de styres i ui« + K:143. **Bevis:** `K-7/S/neg-4` UT (AK-PII-INDIRECT P0001 `core_compliance._pii_klassifikation_guard`, fase konfiguration, aktør `authenticated`, `sole_guard_ref g.pii_klassifikation_guard`) + **T7.10 I** (fjern indirect-grenen → neg-4 rød). |
| DV-1 | modtaget | **INDEN FOR MANDAT** (default D-6) | `:816` | K:111/K:181 · K:122; stop-udfald beskrevet (FUND3-3) |
| DV-2 | modtaget | **INDEN FOR MANDAT** (S-1 orientering) | `:804` · `:610` | K:57 · K:181 |
| D-1 · D-2 · D-3 · D-4 · D-5 · D-7 · D-8 (+SM-1) · D-9 · D-10 · S-3 · SM-2 · SM-3 · SM-4 | fresh-eyes/orienteringer | **INDEN FOR MANDAT** (deklarerede defaults/orienteringer) | `:811-823` · `:806` | kilder i §10's kilde-kolonne; systemord ud af D-2/D-3; D-10 eget id; SM-1 batchet i D-8 |

## 2. Nye fund fra K-genlæsning (pkt. 30) — hvert K genlæst mod forventningslisten efter fold-ind

| id | K/ac | observation | tilstand |
| --- | --- | --- | --- |
| NF-7 | K-1/ac-4 | Effekt-bid flyttet fra Bid 2 til 5.1 (slutbinding, A3-2). Samme (a)-(c), samme negativer (neg-1..3, exit-kanal); kontrollen er BREDERE (alle 43 funktioner, én test der også fejler ved manglende funktion). Ikke svagere. | INDEN FOR MANDAT (A2-9's regel »første bid hvor alle cases er nåbare«) |
| NF-8 | K-7/S · K-7/ac-4 | K-7/S får `neg-4` (AK-PII-INDIRECT) og K-7/ac-4 får positiv (e) + T7.12 I — begge STÆRKERE end forventningslistens K-7 (struktur) og ac 4. Ingen ac svækket. | INDEN FOR MANDAT (K:143 + M-42; kill-list:164) |

Kontrol: ingen »designet UD« uden offentlig negativ (alle 7 S-rækker har UT + ≥1 negativ; K-7/S har nu 4) · ingen positiv kontrol tabt (K-6/ac-10 og K-7/ac-4 har FÅET positiver) · ingen SA nedgraderet (T2.6/T6.2 uændret blokerende) · K-9's tre ac uændrede.

## 3. HALT-flag

**INGEN.** Kravet `9402164d` er bygbart som skrevet; intet foreslås ændret eller fodnoteret. S-2 er afgjort inden for kravet af M-42 (K:143 står — udfald A fjernet, FUND3-4 bortfalder). A3-1 er lukket af driverens kontrakt @ `5183dec1`. Ingen §10-post ændrer et krav eller et sandhedsdokument (bord-testen, pkt. 37).

## 4. Kill-list-dispositioner — de 9 »ikke virksomme« (A' §2 + A3-2's to D12-forhold) gen-disponeret

| post | A' | v3.2 | target (locus · indgang · rolle · effektassertion) | plan.md |
| --- | --- | --- | --- | --- |
| T7.10 | R (betinget S-2) — Nej | **I** | `_pii_klassifikation_guard` indirect-gren fjernes · `data_field_definition_upsert(…,'lokationer','adresse',…,'indirect',…)` · R+ og SA · `K-7/S/neg-4` rød (markering står uden vej) | 236 · 238 |
| T7.12 | R — Nej | **I** | kontrolkopi af `retention_cleanup_daily`'s mapping-loop (`6f0e1db3:329-332`) m. `entity_type <> 'gruppe_kontakt'` · UI-valg `event_based` + W4 udfas + FA-3 D0+30 + pg_cron som `postgres` · K1a uændret → K-7/ac-4 (e) FS rød; kontrol D0+29 grøn | 235 · 238 · 602 |
| SL6.2 | leveres — Nej | **leveres** | årsags-/rolle-/dato-kontrakt = §0.3 #2-#5 (labels/brugerens tekst pr. række) + S-39 (ISO) + S-40 (apply som `authenticated`) | 110-133 · 226 · 676 · 677 |
| SL7.3 | leveres — Nej | **leveres** | normal mapping-opsætning nåbar via fuldt overlay (`anonymization_mappings/manage`) + aktivt valgt retention udført (e) + indirect urepræsenterbar | 238 · 600 · 235 |
| T8.6 | I — Nej | **I** | årsags-gate (`coalesce(p_change_reason,'auto')` før validering) i 18 W + kontrolkopi-mutation af familie A's 7 fundament-gates = 25 instanser · R+/SA · `K-8/ac-2/neg-1` (repr. W12) og `neg-2` (repr. `anonymization_mapping_upsert`) rød | 245 · 133 · 251 |
| SL8.1 | leveres — Nej | **leveres** | §0.3 (én kontrakt-tabel) + §2's ACL-matrix + fuld overlay-liste m. C0-aktør SA | 251 · 110-133 · 600 |
| SL9.1 | leveres — Nej | **leveres** | konsistent effektfordeling (60 = 2+12+13+21+12), roller pr. §0.3, ingen variantkontrakt (S-1-B væk) | 262 · 264-276 · 600 |
| T8.2 (A3-2) | I i Bid 5 — forkert placeret | **I i Bid 4** | write-gate `has_permission(page,'manage',true)` → `false` i W13 · V kalder `gruppe_klient_kobl` · `K-8/ac-4/neg-1` rød (K-8/ac-4's effekt-bid 4) | 247 · 251 · 585 · 273 |
| T6.8 (A3-2) | to loci under ét id | **T6.8-a I (Bid 3) + T6.8-b I (Bid 4)** | a: R4 `sat_dato <= dags_dato_utc()` → K-4/ac-5 historisk FS rød · b: R13's kald `lokation_status_paa(p_lokation_id, dags_dato_utc())` → K-6/ac-7 historisk Ret-FS rød | 189 · 195 · 220 · 226 · 529 · 585 |

De øvrige 12 dispositioner fra r3 (T1.3 · T2.8 · T3.5 · T4.3 R · T6.3 · T6.14 · T7.5 · T7.9 · T7.14 · S7.1/SL7.1 · T8.1 · T8.5 · T9.1) er uændrede (A': »Ja«). Nye I-mutanter i v3.2: T7.10 · T7.12 · DATO-TRANSPORT-mutant (W13 `to_char` → `::text`, FS-kill på DateStyle-prøven). Targeted-gulvet består: K-1 4 I · K-2 7 I · K-3 5 I · K-4 8 I (+T6.8-a) · K-5 5 I · K-6 17 I (+T6.8-b, DATO-TRANSPORT) · K-7 14 I (+S-33-mutant) · K-8 7 I (+U02/K-6(k)) · K-9 3 I. To-sessions: præcis T2.6 + T6.2. Permutation: én kontrolkopi.

## 5. Manifest-synk (tredje leverance — `forventnings-manifest.json`, afledt 1:1 af plan v3.2 §1)

Transformationen fra v3.1 (`ce191381`) er udført med Edit-værktøjet (målrettede streng-erstatninger; en node-transformation blev forsøgt først, men node-kald krævede godkendelse i den ubemandede session og blev ikke kørt — hjælperscriptet ligger uden for workdir'en og er ikke en leverance). Ændringer:

- `bindings.plan.oid` = `"<udfyldes af driveren>"` (instruks pkt. 33; driveren indsætter `git hash-object plan.md` før commit — validatoren kræver 40 hex, se stats-linjen nedenfor).
- **Kildeankre `P:`:** alle 60 §1-ankre forskudt +34 (v3-linje → v3.2-linje; §1-rækkerne er byte-identiske i antal). Nye ankre: K-1/ac-4 `P:602` · K-6/ac-10 `P:90` · K-7/ac-4 `K:137`, `T:164` · K-7/S `K:143`.
- **`effekt_bid`:** K-1/ac-4 `2.2` → `5.1` · K-2/S `2.1` → `2.2` · K-7/S `1.1` → `1.2` (A3-2 · V31-10).
- **Nye negativer (3):** `K-7/S/neg-4` (AK-PII-INDIRECT, `sole_guard_ref g.pii_klassifikation_guard`) · `K-8/ac-3/neg-3` (`_historik_immutabel`) · `K-8/ac-3/neg-4` (`_kobling_historik_guard`); `K-8/ac-3/neg-2` omdefineret til audit-familiens TRUNCATE-repræsentant (V31-4).
- **`grund` rettet:** 8 AK-FINDES-IKKE uden uuid (regel A) · 4 AK-PAAKRAEVET uden `p_` · K-2/ac-6/neg-1 `foerste_stand_navn` · K-7/ac-2/neg-2 `{id}` (regel B) · K-4/ac-2/neg-2 + K-8/ac-2/neg-3 `source_type=unknown` · K-7/ac-4/neg-2,-6 fuld AK-DAEKNING-besked.
- **`aktoer`:** 5 »MANGLER KILDE« → `authenticated` (S-40) · exit-kanalens 2 negativer `aktoer`/`fase` = `ci` (V31-11).
- **K-8/ac-2/neg-2:** repræsentant `anonymization_mapping_upsert` (afvisningssted/signatur/fase), beskrivelse = familie A (7) + RPC'er uden årsagsparameter eksplicit undtaget.
- **Assertions (+5):** K-7/ac-4 `e-*` ×3 (event_based) · K-6/ac-10 `datestyle-*` · K-8/ac-2 `pending-update-til-applied-*`; én omdøbt (`d-faelles-rpc-audit-praecis-som-0-3-tabellen-…`).
- **Guards:** `g.pii_klassifikation_guard`'s beskrivelse omfatter den tredje gren; ingen `locus` (udelades, pkt. 33); ingen nye guards (DATO-TRANSPORT- og T7.12-mutanterne er FS-kills uden `sole_guard_ref`).
- Beskrivelser med »MANGLER KILDE« fjernet (11 steder) — hver erstattet af det bundne valg + S-reference.
- Ingen `scope: overdragelse`, ingen `overdraget_former` (V31-11).

**Validator (`node scripts/v5/forventnings-manifest.mjs validate …` @ `64ea01e0`): KUNNE IKKE KØRES i denne session** — både `node` (validator og transformation) og `python3` (JSON-parse) krævede interaktiv godkendelse, som den ubemandede kørsel ikke kunne give. Erklæret ærligt (ingen »✓« er observeret her). **Mekanisk selvkontrol udført med grep (læsning):** klammer `{`/`}` = 474/474 · parenteser `[`/`]` = 250/250 · obligation-ID'er 60 (+ 11 alias-referencer = 71 `"id": "K-n/…"`-forekomster) · negativ-ID'er **118** (115 + 3 nye) · assertions **147** (142 + 5) · `sqlstate` = 22023 ×58 · 42501 ×28 · P0001 ×20 · P0002 ×10 (= 116) + `kanal: exit` ×2 (= 118) · `aktoer` = `authenticated` ×108 · `postgres` ×8 · `ci` ×2 · `effekt_bid` = 1.2 ×2 · 2.1 ×1 · 2.2 ×10 · 2.3 ×1 · 3.1 ×13 · 4.1 ×3 · 4.2 ×7 · 4.3 ×11 · 5.1 ×8 · 5.2 ×4 (sum 60) · `sole_guard_ref` 41 (10 guards, alle deklarerede) · »MANGLER KILDE« 0 · `grund` m. `%` 0. **Driveren:** indsæt `bindings.plan.oid` (`git hash-object plan.md`) og kør validatoren FØR commit; forventet stats-linje: `✓ manifest gyldigt: lokations-skabelon · 9 K · 60 forpligtelser i nu-scope (0 overdraget) · 118 negativer · pr. form {"UT":47,"MH":19,"FS":35,"SA":2} · 10 eneste-vaern` (proof_forms er uændrede; kun negativer/assertions er tilføjet). Fejler validatoren, er det et planner-fund (ny v3.2-blob), ikke noget driveren retter tavst.

## 6. Plannerens deklarerede defaults = plan v3.2 §10 (Mathias-vendt tekst; driveren tager tabellen gennem spørgsmåls-devilen ÉN gang med »plan = kode« som akse)

| id | default (Mathias' sprog) | kilde / mandat | ved stop |
| --- | --- | --- | --- |
| S-1 | Felter på en gruppe: faste felter (navn, type, kontaktpersoner m. navn/e-mail/telefon); nyt felt, fx CVR, kræver en udvikler — afviger fra udgangspunktet »som for klienter«, men udformningen er lagt til planfasen. | K:57 · K:181 | ny plan-SHA m. felt-register |
| S-2 (afgjort af M-42) | Om et felt er persondata vælger I i UI; markeres det, kan systemet altid anonymisere det. »Indirekte persondata« uden anonymisering kan ikke vælges på skabelonens felter. | M-42 ordret · K:143 · K:137 | — (Mathias' ord) |
| S-3 | Slutprøven læser jeres rigtige klient-, organisations- og medarbejderdata direkte fra driftssystemet, kun læsning; medarbejderes navn/e-mail og klientfelters personværdier hentes ikke. | kildekontrakt @ `5183dec1` §(1)-(3) | separat held-out-projekt seedes først |
| B-1 | Tryg ønskes koblet fra Coop fra 1/10; godkendes 3/10 og udløber fristen (24 t) 4/10, gælder frakoblingen fra 4/10 — ikke fra 1/10 og ikke fra godkendelsesdagen. Intet ændres bagud. Samme for til-kobling og fravalg; »fra i dag« træder tidligst i kraft når fristen er udløbet og ændringen gennemført. | K:122 · K:126 · M-13 | ny plan-SHA |
| B-2 | Tryg fravalgt i Bilka Hundige forbliver fravalgt gennem nedlæggelse og genåbning indtil fravalget ophæves. | K:181 · V8 | »Nulstil«-variant, ny plan-SHA |
| B-4 | Alka skal kobles på Coop og holdes ude af Bilka Hundige. Dit ord: »En lokation kan fravælge en klient gruppen har, og ophæve fravalget igen.« En gældende kobling skal dække fravalgets dato før fravalget kan bedes om; kobles Alka »fra i dag«, kan Alka have ret indtil fravalget er trådt i kraft — udelukkelse fra første dag kræver at fravalget er trådt i kraft senest samme dag som koblingen (fristen for fravalg kan sættes til 0 i UI). | M-36 ordret · M-17 · K:65 · K:121 | W15-gate fjernes, ny plan-SHA |
| B-5 | Bilka Hundige er nedlagt: en ny stand kan først oprettes når butikken er genåbnet; eksisterende stande består. | K:71 · K:48/K:181 (M-30.2 analogi) | W9-gate fjernes, ny plan-SHA |
| D-1 | En ny butik er aktiv og kan bookes fra oprettelsen; skal den vente, sættes den i dvale straks efter. | K:71 | init-status dvale, ny plan-SHA |
| D-2 | Systemets »dag« skifter kl. 01 om vinteren og kl. 02 om sommeren (dansk tid); et skift kl. 00.30 dateres dagen før. | P-8 T:78 | dansk kalenderdag, ny plan-SHA |
| D-3 | Grupper og butikker lægges under rettigheds-området »organisation«; adgang til hele området giver adgang til grupper og butikker. | K:181 | flyttes i rettigheds-UI |
| D-4 | Skifter Bilka Hundige fra Coop til en anden gruppe, sker det straks med rettighed og årsag, uden godkendelse/fortrydelsesfrist; klienternes ret følger den nye gruppe fra samme dag; fravalg gælder fortsat; ingen ret mens butikken er nedlagt. | K:181 | W7 → fortrydelses-vej, ny plan-SHA |
| D-5 | En stand kan tages ud af brug uden at slettes; den sidste stand i brug kan ikke tages ud af brug — sæt butikken i dvale eller nedlagt. | K:46 · K:48 · M-17 | — |
| D-6 | En kobling/et fravalg varer mindst én dag: frakobling eller ophævelse fra samme dag som starten afvises — fortryd inden fristen, eller vælg dagen efter. | K:111/K:181 · K:122 | samme-dags lukning tillades (CHECK/AK/negativer navngivet), ny plan-SHA |
| D-7 | Dvale »til den 5. oktober« betyder at butikken kan bookes igen den 5. oktober; skærmteksten skal sige det samme. | P-8 T:230 | lukket grænse, ny plan-SHA |
| D-8 (+SM-1) | Type er krævet (»andet« kan altid vælges); adresse valgfri; dagspris krævet (0 kr. er en pris); stand uden egen pris følger butikkens. | K:19/K:26 · K:181 · M-24 | ny plan-SHA |
| D-9 | Godkenderen skriver ingen ny årsag; anmoderens årsag står på anmodningen og på gennemførelsen; godkendelse/fortrydelse registreres med hvem og hvornår. | K:161 · K:185 · K:274 | uden for skabelonen (ville være HALT-flag) |
| D-10 | En godkendt ændring der ikke længere kan gennemføres bliver stående som »godkendt« og får aldrig status »afvist« — ses i loggen som fejlet ved gennemførsel. | fundamentets pending-model | — |
| SM-2 | En gruppe taget ud af brug kan ikke få nye butikker, gruppeskift eller klient-koblinger; det bestående består; superadmin kan alligevel. | K:64 · V13 | strukturvagt, ny plan-SHA |
| SM-3 | En klient sat inaktiv kan ikke kobles på en gruppe; superadmin kan alligevel. | K:254 · P-8 T:54/T:73 | som SM-2 |
| SM-4 | Vælger I i UI »anonymisér N dage efter at kontaktpersonen er taget ud af brug«, sker det automatisk (dagligt). »N dage efter oprettelse« eller »manuelt« har ingen automatik i dag; butikker kan ikke få en tidsregel. | K:134 · K:137 · K:142 · fundamentets job | — (fundament-grænse) |

Bord-testen (»ændrer det et krav eller et sandhedsdokument?«) er NEJ for alle 21 poster → ingen spørgsmål; alle er orienteringer under `plan ok`.

## 7. Fuld optælling pr. tilstand — ALLE fund (fund-log Kilde 1-13 = 106 · + NF-7/NF-8 = 108)

| tilstand | antal | fund-id'er |
| --- | ---: | --- |
| RETTET M. BEVIS (inkl. »afgjort af M-42«, »BÅRET (v2)« kvitteret og BORTFALDET) | **94** | runde 1 (46): A-1 · A-2 · A-3 · A-4 · A-5 · A-6 · A-7 · A-8 · A-9 · A-10 · A-11 · A-12 · A-13 · A-14 · A-15 · FUND-1 · FUND-2 · FUND-3 · FUND-4 · FUND-5 · F01 · F02 · F03 · F04 · F05 · F06 · F07 · F08 · F09 · F10 · F11 · F12 · F13 · F14 · F15 · F16 · U01 · U02 · U03 · U04 · U05 · U06 · U07 · U08 · U09 · U10 — NF-1 · NF-2 — D-1 (driver) — FUND2-3 · FUND2-6 — A2-1 · A2-2 · A2-3 · A2-4 · A2-5 · A2-6 · A2-7 · A2-8 · A2-9 · A2-10 · A2-11 · A2-12 · A2-13 · A2-14 · A2-15 — R2-1 · R2-2 · R2-3 · R2-4 · R2-7 — FUND3-1 · FUND3-2 · FUND3-3 · FUND3-4 (bortfaldet) — A3-1 · A3-2 · A3-3 · A3-4 · A3-5 · A3-6 · A3-7 · A3-8 — V31-1 · V31-2 · V31-3 · V31-4 · V31-5 · V31-6 · V31-7 · V31-8 · V31-9 · V31-10 · V31-11 |
| INDEN FOR MANDAT (kilde citeret / deklareret default) | **12** | FUND2-1 · FUND2-2 · FUND2-4 · FUND2-5 · DV-1 · DV-2 · NF-3 · NF-4 · NF-5 · NF-6 · NF-7 · NF-8 |
| DRIVER (kvitteret) | **2** | R2-5 · R2-6 |
| KRÆVER MATHIAS | **0** | — (r3 havde 8: A2-1 · FUND2-3 · NF-2 · A-4 · FUND-1 · F03 · U06 · FUND2-1 — alle afgjort af M-42 eller af planneren under pkt. 37) |
| **ÅBNE** | **0** | — |
| **i alt** | **108** | 46 + 2 + 1 + 6 + 15 + 7 + 2 + 4 + 4 + 8 + 11 (= 106 i fund-log) + 2 nye |

Kontrol: 94 + 12 + 2 + 0 = 108. NF-1 tælles RB (B-1 rettet til devil-form med bevis) — kernen er fortsat inden for mandat; A2-11 tælles RB (§0.3-kontrakten) med labels inden for mandat. Fund-loggen (driverens) opdateres af driveren ud fra denne tabel; »kræver Mathias« = 0.

## 8. Nye ordbogs-entries

**Ingen.** `udfaset_dato` er systemteknisk uden Mathias-flade (Mathias-teksten siger »taget ud af brug«); den betingede entry »felt« (S-1-B) bortfalder med V1. Formålsblokken er uændret (første afsnit identisk med K:7).

## 9. Bindinger og leverancer

- **plan v3.2:** `plan-build/lokations-skabelon/plan.md` — status UDKAST; hoved m. `angreb_r3_oid 1dad9636` · `audit_r3_oid 82229a6a` · `manifest_v31_oid ce191381` · `kildekontrakt_oid 5183dec1` · `fundlog_oid 14535e1d` · `ledger_oid 5f4425d1 (M-1..M-43)` · `implplan_oid 11fb2208` · `plan_v3_oid c5f451f8` · pinned commit `8c664f4f`; §11.3 = ændringslog v3 → v3.2 pr. fund-id m. `plan.md:<linje>`; sha256 i slutbeskeden.
- **denne rapport:** `plan-build/lokations-skabelon/fold-ind-rapport-r4.md`.
- **manifest:** `plan-build/lokations-skabelon/forventnings-manifest.json` (v3.2) — `bindings.plan.oid = "<udfyldes af driveren>"`; validator-status i §5 og slutbeskeden (ikke kørt her — driveren kører den).
- Ingen ændring i krav, recon, P-8, ordbog, ledger, fund-log, kildekontrakt-filerne, køreplan eller provenance/. Ingen kode i produktzonen. Web ikke brugt. Ingen andre aktørers workdirs læst. Bash brugt til `git hash-object`, `grep`/`sed -n`/`wc`/`ls`/`cut`/`sort`/`uniq`/`sha256sum` (læsning/hash); `node`/`python3` forsøgt men afvist (godkendelse). Ét hjælperscript (`manifest-v32-transform.cjs`) blev skrevet UDEN FOR workdir'en og aldrig kørt — det er ikke en leverance og kan slettes.
- **Driver-opgaver før gaten:** `bindings.plan.oid` udfyldes m. `git hash-object plan.md` og validatoren køres igen · fund-log opdateres (108 rækker, »kræver Mathias« = 0; NF-7/NF-8 tilføjes) · §10/§6-tabellen gennem spørgsmåls-devilen (én gang, akse »plan = kode«) · A'' (Codex delta pr. §11.3-henvisning) · C (frisk slutlæser) · claude-ai — som GATE-DOMME (B6).
