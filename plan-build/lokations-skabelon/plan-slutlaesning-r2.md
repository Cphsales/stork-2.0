Alle verifikationer er inde. Jeg skriver nu slutlæser-dommen.

---

# Slutlæser-dom (code-reviewer, Fase 3 runde 2) — plan v2 `2069aa16`

**REST-DOM: REST ≠ ∅. Én ekstra runde er nødvendig.** Plan v2 bærer 27 af de 46 runde-1-fund og hele E20-snittet, men tre uafhængige kilder efterlader ægte åbne fund, og jeg tilføjer syv egne. Ét fund er HALT-klasse og kræver Mathias' ord. Resten er planner-rettelser i v3 plus to driver-opgaver. Dommen er en frisk slutlæsning, ikke gate-verdiktet.

Læsegrundlag: alle ti input-blobs matcher de citerede OID'er. Alle fundament-kodeankre planen citerer med blob8 er hash-verificeret i workdir og matcher. To bindings-afvigelser er fundet og står som R2-5 og R2-6. Sti-forkortelse nedenfor: `plan.md` = `plan-build/lokations-skabelon/plan.md`; migrationer ligger i `supabase/migrations/`.

**Batch til v3, fund → v2-afsnit:**

| v2-afsnit | fund |
| --- | --- |
| §0.2 S-17 · §1 K-6/ac-6, ac-10 · T6.14 | A2-8, NF-1 |
| §1 mutant-kolonner T1.3, T2.8, T3.5, T4.3, T6.3, T7.5, T7.14 | A2-7 |
| §1 K-8/ac-1 T8.1, K-8/ac-4 T8.5, K-9/ac-1 T9.1 | A2-6 |
| §1 K-7/ac-4 (c) + §2.2 `_mapping_daekning_guard` + Bid 5.1 pkt 2-3 | A2-3, R2-1 |
| §2.3 W6 + K-7/ac-4 (b) lokations-lifecycle | A2-4 |
| §2.5 I6/I8 + K-7/ac-2 replay | A2-5 |
| §1 K-7/ac-4/neg-3 · K-8/ac-1/neg-2 · K-8/ac-3 · K-8/ac-4 · K-9/ac-2 | A2-13 |
| §1 K-8/ac-2 + §2.6 approve/undo + W13-W16 request-audit | A2-11, R2-2 |
| §1 K-4/ac-2 audit-læsning | R2-4 |
| §1 K-9/ac-1 bevisform · §2.4 R12/R14/R15/R16 + S-25 | A2-10, A2-12 |
| §3 done-tekster Bid 1/2/3 + D12-relationer · §0.1 FA-3 + BV-5 | A2-9, R2-3 |
| §0.1 FA-5 kilde-identitet | A2-14 (driver) |
| §10 bekræftelses-linjer: B-3 udgår → S-2 · B-2 relabel · nye S-1, B-4, B-5, D-1 · linje 7 governance-påstand | A2-1/FUND2-3, FUND2-1, FUND2-2, FUND2-4, FUND2-5, FUND2-6, D-1 |
| Proces: audit-r2-trunkering · implplan re-pin | R2-5, R2-6 (driver) |

**Båret og derfor ikke i batch:** A2-2, alias-delen af A2-10, og A2-15 i det væsentlige. Begrundelse står i fund-tabellen.

**HALT-klasse:** A2-1 (= FUND2-3 = NF-2). Indsnævringen »persondata = direct« kan kun lukkes af Mathias' ord eller af en indirect-vej som fundamentet ikke har. A2-11 er HALT-klasse hvis planneren ikke kan deklarere K:161-læsningen som mandat.

## Pr. K: dybde · troskab · kill-list · bid

| K | dom | evidens |
| --- | --- | --- |
| K-1 | Dybde OK: `lokation_opret`/`lokation_rediger` som public entry, hård effekt via `lokation_dagspris_paa`/`stand_dagspris_paa`. Troskab OK. Kill-list: T1.1/T1.2/T1.4 I gyldige; T1.3 er ikke virksom som bundet, UPDATE på loggen rammer `_historik_immutabel` med P0001 før den lovede FS-ændring, og locus-navnet matcher ikke §2.2. Bid 2 OK, men FS-historisk kræver klok-styring (R2-3). | `plan.md:108-110` · `plan.md:110` vs `plan.md:267,269` |
| K-2 | Dybde OK inkl. SA-1 via `FOR UPDATE` på lokationsrækken; READ COMMITTED genlæser count efter låsen, så taberen får AK-SIDSTE-STAND. Troskab OK: to-tabel designer cykler ud og afviser dem eksplicit. Kill-list: T2.4-T2.7, T2.9, T2.10 I gyldige; T2.1-T2.3 R kildebundet; T2.8 mangler D10-note om `pris_historik.stand_id` RESTRICT som modværn. Bid 2's done-tekst kræver T2.8/T2.9 der er Bid 3. | `plan.md:121-127,289` · `plan.md:125,446` · `plan.md:477` |
| K-3 | Dybde OK. Troskab OK. Kill-list: T3.2/T3.3/T3.4/T3.6 I gyldige; T3.5's WHERE-led findes ikke, I4 opdaterer `where id = <aaben.id>`; T6.3 er bundet til neg-1 hvor INTET-FRAVALG-gaten står bag gruppe-checket, så mutanten giver ikke accepteret request, neg-2 gør. K-3/ac-5's kobl-negativ er Bid 4, Bid 2 erklærer den done. | `plan.md:135-140` · `plan.md:140` vs `plan.md:324` · `plan.md:138,294` · `plan.md:477` |
| K-4 | Dybde OK for `lokation_saet_status` og oraklerne. Troskab OK. Kill-list: T4.1/T4.2/T4.4-T4.9 I gyldige, T4.10/T4.11 R kildebundet; T4.3 har samme immutability-problem som T1.3. Audit-læsningen som R+ kan ikke lykkes (R2-4). T6.8 er dobbelt-bundet i Bid 3 og Bid 4. | `plan.md:148-156` · `plan.md:151` vs `plan.md:267` · `plan.md:152` og `plan.md:183` |
| K-5 | Dybde OK med R− før R+. Troskab OK: V9 én model-ting ligger inden for K:103. Kill-list: T5.2-T5.6 I gyldige; T5.1 R kildebundet ved signatur uden klient-parameter. Bid 3 OK, men »senere opslag D<stop fortsat dvale« kræver klok-styring (R2-3). | `plan.md:164-168,286,290,306` |
| K-6 | Dybde stærk: fuld pending-kæde, tre daterede led i R13, SA-1 via gruppelås. Troskab: ac-6's orakel-tekst modsiger S-17 (A2-8). Kill-list: T6.1-T6.13, T6.15-T6.17 I gyldige; T6.14 er en ækvivalent mutant, fordi due-gaten gør payload-datoen ≤ i dag ved apply. Bid 4 OK med FA-2/FA-3. | `plan.md:177-187,314,324` · `plan.md:182` vs `plan.md:53` · `20260518000004_t9_client_node_placements.sql:183` |
| K-7 | Dybde: kontakt-kæden OK. Troskab: K:143's »persondata« er indsnævret til direct uden mandat (A2-1). Kill-list: T7.1-T7.4, T7.6-T7.8, T7.13 I gyldige; T7.5/T7.14 locus/vidne ikke virksomme; T7.9's replay-vej mangler GUC i I6/I8 (A2-5); guarden dækker kun `status='active'` (A2-3); strategi-status og aktivering er ubundet (R2-1); lokation kan få ny adresse efter anonymisering (A2-4). Bid 1 erklærer K-7/S neg-4 done, men adresse-kolonnen kommer i Bid 2. | `plan.md:196-199,273,284,326,328,550,617` · `plan.md:389` |
| K-8 | Dybde: ctx-A/ctx-B korrekt skilt. Troskab: ac-2 dækker 18 RPC'er, men pakkens egen wiring bruger approve/undo uden brugerårsag, og request-audit bærer en label (A2-11, R2-2). Kill-list: T8.2, T8.6-T8.9 I gyldige; T8.1 fejl-disponeret som S, T8.5 rammer ikke, T9.1 er no-op (A2-6); trigger-funktioner kan ikke give 42501 (A2-13). | `plan.md:207-212,247,275,291` · `20260607110001_core_identity_secdef_pending_change.sql:108,175` |
| K-9 | Dybde OK: API-kæde som R+ non-admin. Troskab: ac-1 har kun MH, den låste forventningsliste kræver MH+UT for både ac-1 og ac-2 (A2-10). Kill-list: T9.3/T9.4 I gyldige, T9.2 R OK, T9.1 se K-8. Paginering mangler på fire flerrække-indgange (A2-12). Bid 5 OK. | `plan.md:220-222,313-317,556,618` · `forventningsliste-udkast.md:240` |

## Åbne fund fra runde 2: ægte eller båret

Codex' angreb r2 (`plan-angreb-r2.md` @ 0b2a36ca) meldte 15 selvstændige restfund. Jeg har dømt hvert uafhængigt mod kode og plan.

| id | Codex | min dom | evidens |
| --- | --- | --- | --- |
| A2-1 | BLOKER | **Ægte, HALT-klasse.** Planen deklarerer læsningen og lægger den til Mathias som B-3, men mærkning lukker intet. Fundamentet har kun direct-mekanik, så vejen kan ikke leveres i pakken. Spørgsmålet er forretning: må et aktivt valgt indirekte personfelt stå uden anonymiseringsvej. | `plan.md:617,743` · K:143 · `20260515140000_r7h_…sql:66-72` |
| A2-2 | RET | **Båret.** Kill-listens egen T7.12-regel kræver kun udførelse af aktivt valgte, understøttede regler. Pakken vælger ingen, og event_based-vejen er deklareret som fundament-konfig. Ingen v3-ændring ud over at T7.12-teksten citerer kill-list:164. | `plan.md:198,754` · `kill-list-udkast.md:164` |
| A2-3 | BLOKER | **Ægte, RET-niveau.** Verificeret: upsert bevarer status, approve tjekker kun `tested`, activate kun `approved`, ingen af dem genkører coverage. Planens guard fyrer kun ved `old.status='active'`. Runtime-P0001 i generic_apply gør hullet ikke tavst, men K-7/ac-4 (c)'s påstand »ingen aktiv udækket tilstand« holder ikke. Fix: guard for tested/approved/active, eller status tilbage til draft ved feltændring. | `20260515120000_p2_…sql:152-158,261,291` · `plan.md:273,551` · `…r7h_…sql:75-77` |
| A2-4 | BLOKER | **Ægte, RET-niveau.** W6 har ingen anonymiseret-guard. generic_apply opdaterer kun rækker med `anonymized_at is null`, replay skipper markerede rækker. P-8 T:137 kræver ét valgt orakel. Materialiseres først efter aktivt UI-valg, men planen hævder vejen leveret fra dag ét. | `plan.md:284` · `…r7h_…sql:99-108` · `20260515130000_r7a_…sql:267-268` |
| A2-5 | BLOKER | **Ægte.** `replay_anonymization` sætter ingen GUC. Audit-triggeren kræver `stork.change_reason` for manual/unknown. Fundamentets eget replay-apply-forbillede sætter selv `allow_*_write` og `change_reason` før UPDATE; planens I6/I8 udelader det. Fejlen fanges af `exception when others`, så replay melder errors=1 og erstatter intet. Normal-kopiens replay-FS bliver rød. | `…r7a_…sql:235-300` · `20260514160000_t1_inline_fix_audit_non_uuid_id.sql:60-67` · `20260514170004_c002_c003_…sql:112-113` · `plan.md:326,328` |
| A2-6 | RET | **Ægte, alle tre.** T8.1: write-policies på de 6 tabeller er opfyldelige med selvsat GUC, så revoken bærer alene og mutanten er I, ikke S. T8.5: R9 kalder R4/R5, der har egne gates; fjernet R9-gate dræbes ikke. T9.1: default-privilegiet giver authenticated EXECUTE rolle-specifikt; `revoke all from public` fjerner det ikke, og sletning af GRANT-linjen er no-op. | `plan.md:207,247` · `plan.md:305-307,310` · `20260514120001_t1_schemas_and_defaults.sql:39-41` |
| A2-7 | RET | **Ægte.** T1.3/T4.3: immutability-P0001 før lovet FS, T1.3's locus-navn matcher ikke §2.2. T2.8: FK-modværn skal accepteres. T3.5: WHERE-leddet findes ikke. T6.3: brug neg-2. T7.5: I5 delegerer til generic_apply. T7.14: én kontakt pr. gruppe skelner ikke. | `plan.md:110,125,140,151,196` vs `plan.md:267,324,325,446` |
| A2-8 | RET | **Ægte.** ac-6 siger både `greatest(D7, apply-dag)` og `Ret(D≥D7)=false`. Due-gaten sikrer payload-dato ≤ current_date ved apply, så `greatest(payload, i dag)` er i dag i alle nåelige tilfælde, kun TZ-kanten afviger. T6.14 som bundet er derfor ækvivalent. Skelnende mutant er `v_effektiv := payload-dato`. | `plan.md:53,182,186,324` · `…t9_client_node_placements.sql:183` |
| A2-9 | RET | **Ægte.** Bid 2 done kræver T2.8/T2.9 (Bid 3) og T3.3-T3.5 (Bid 4). Bid 1 done kræver K-7/S neg-4 med adresse (Bid 2). Bid 2 done kræver K-3/ac-5's kobl-negativ (Bid 4). T6.8 er bundet i både Bid 3 og Bid 4. | `plan.md:389,477,485` · `plan.md:152,183` |
| A2-10 | RET | **Delvist ægte.** K-9/ac-1 har kun MH; den låste liste kræver MH+UT for hver af ac-1 og ac-2. Alias-rækkerne er deklareret med eksplicit henvisning, og listen tillader »eksplicitte alias-/genbrugsrelationer«, så den del er båret. »Alias skrives ud« er dog ikke fulgt bogstaveligt; planneren afgør i v3. | `plan.md:41,220` · `forventningsliste-udkast.md:237,240-241` |
| A2-11 | BLOKER | **Ægte, disposition mangler.** approve/undo sætter faste labels og har ingen årsagsparameter. Planen wirer dem selv i §2.6 og hævder »HVER write-RPC (18 stk)«. K:156 siger »enhver mutation«; K:161 knytter ac 2 til audit-triggerens regel, som labels opfylder. Planneren skal enten deklarere K:161-læsningen som mandat med FS-assert på labels, eller wrappe approve/undo med årsag. Uden deklaration er det HALT. Se også R2-2. | `plan.md:208,335-336` · `…secdef_pending_change.sql:108,175` · K:156,161 |
| A2-12 | RET | **Ægte.** R12/R14/R15/R16 har hverken `p_antal` eller cursor. S-25 lover keyset på alle liste-RPC'er. PostgREST max_rows afkorter tavst. | `plan.md:313,315-317,618` |
| A2-13 | RET | **Ægte, alle fem rækker.** K-7/ac-4/neg-3: generic_apply afviser manglende aktiv mapping med P0002 før P0001-grenen. Trigger-funktioner: ingen ACL i §2.2, og et direkte kald giver 0A000, ikke 42501. TRUNCATE på koblinger/fravalg: guarden har kun UPDATE/DELETE. V vs R17: V kan ikke læse fremmede pendings. `pending_change_apply` har ingen permission-gate, så R− kan kalde apply. | `…r7h_…sql:48-53,95-97` · `plan.md:207,209,210,221,265-273,318,556` · `…t9_client_node_placements.sql:152-218` |
| A2-14 | BLOKER | **Ægte, ejer driver.** FA-5 siger kilde/scope/projektion bindes »FØR build« uden identitet. P-8 kræver systemidentitet og scope bundet nu, før plan-lås. Skal lukkes med en hash-bundet kontrakt planen refererer. | `plan.md:35` · `p8-slutproeve-spec.md:34,42-44` |
| A2-15 | RET | **Delvist ægte, lav.** Gaten er regex på SQL-tekst, ikke katalog. Pakkens DDL er ren CREATE TABLE, så neg-1 virker for denne leverance. Rest lukkes billigt med én katalog-fuldstændigheds-assert i K-7/ac-3's data-assert. Ikke K-brud. | `scripts/migration-gate.mjs:28-79,213-225` · `plan.md:195,197,201` |

Fresh-eyes-auditen (`plan-audit-fresh-eyes-r2.md` @ 292d029c) er forretnings-troskab og ligger uden for min tekniske akse. Jeg dømmer kun om fundene er ægte åbne i v2-teksten.

| id | min dom | evidens |
| --- | --- | --- |
| FUND2-1 | **Ægte, fremlæggelse.** V1 afviger fra kravets deklarerede default »som for klienter« og står ikke i Mathias' sprog. Teknisk konsistent, men afvigelsen fra K:181 er usynlig i Blok A. | `plan.md:566,695-701` · K:57,181 |
| FUND2-2 | **Ægte, bekræftelses-linje.** Negativet »fravalg af ikke-medlem afvises« er planens regel, ikke kravets. | `plan.md:138,293` |
| FUND2-3 | = A2-1. | |
| FUND2-4 | **Ægte, bekræftelses-linje.** K:71/K:181 delegerer ikke stand-oprettelse på nedlagt. | `plan.md:287,601` |
| FUND2-5 | **Ægte, synlig default.** | `plan.md:595` |
| FUND2-6 | **Ægte, relabel.** Hverken M-13 eller M-19 tager stilling til fravalgets overlevelse; K:181 delegerer det. | `plan.md:742` |

Planner og driver (fund-log §Kilde 4-5):

| id | min dom | evidens |
| --- | --- | --- |
| NF-1 | Brugerforventningen dækkes af B-1. Den tekniske rest er A2-8. | `plan.md:741` |
| NF-2 | = A2-1. | |
| D-1 | **Ægte, tekst.** governance-check sammenligner en »> Denne pakke leverer:«-blockquote i docs/coordination-layoutet; hverken krav eller plan har den. Påstanden om byte-identitet er misattribueret. Ingen K berørt. | `scripts/governance-check.mjs:275-314` · `plan.md:7` |

## Egne fund R2-n og binding

- **R2-1 · RET · K-7/ac-2, ac-4 (c).** Strategierne `blank`, `hash_email` og `hash` seedes med status `approved`, og `anonymize_generic_apply` kræver `status='active'`. Planen binder ikke `anonymization_strategy_activate` som step i K-7/ac-2's positive kæde eller i Bid 5.2's handlingsliste; linje 550 kalder det »UI-drift«. Samtidig accepterer `_mapping_daekning_guard` approved eller active, spejlet fra test_run, mens den udførende sti kræver active. »Dækket« er dermed ikke »udførbar«. Lukning: bind strategi-aktivering som eksplicit R+-step og skærp guarden til active, eller deklarér skellet. Evidens: `20260515110100_p1a_…sql:223-226`, `…r7h_…sql:79-82`, `20260515120000_p2_…sql:227`, `plan.md:196,273,550,556`.
- **R2-2 · RET · K-8/ac-2, K-6/ac-10.** Wrapperne W13-W16 sætter `stork.change_reason` til brugerens årsag, men `pending_change_request` overskriver den med labelen `pending_change_request` før INSERT. Audit-rækken for request-steppet bærer derfor aldrig brugerens årsag. Planens FS-assert »audit-række efter lovligt kald bærer brugerens årsag« kan ikke bestå for de fire wrappers; kun apply-rækkerne kan via S-9. Uden binding pr. skrivevej opstår teach-to-the-test-risiko når harnessen justeres. Evidens: `20260518000000_t9_pending_changes.sql:142-143`, `plan.md:208,275,291`.
- **R2-3 · RET · alle FS-historisk-rækker.** S-18 stempler alle logs med `clock_timestamp()` og ingen skrivevej kan vælge dato. D1<D2 for pris, D5/D6/D8-forløbet for status og »senere opslag D<stop fortsat dvale« kan derfor kun produceres hvis FA-3 flytter databasens klokke på OS-niveau. FA-3 er kun blokerende for Bid 4 og nævner ikke K-1/ac-3. Uden bundet mekanisme er Bid 2's og Bid 3's historiske FS-rækker ikke eksekverbare som specificeret. Lukning: bind FA-3's mekanisme og gør den blokerende for done på Bid 2 og 3. Evidens: `plan.md:33,51,110,152,165,266,750`.
- **R2-4 · RET · K-4/ac-2.** `audit_log_read` er gatet på `has_permission('audit','log',false)`. Planen binder indgangen som R+ med kun pakke-tab-grant, så kaldet giver 42501 i stedet for audit-rækken. Lukning: bind audit-læsningen som kontrollæsning på SQL-kanalen, eller giv R+ eksplicit audit-grant i fixturen og deklarér det. Evidens: `20260514190100_q_audit_rpcs.sql:25-28`, `plan.md:149,556`.
- **R2-5 · proces · driver.** `plan-audit-fresh-eyes-r2.md` @ 292d029c er hoved-trunkeret. Linje 1 er »ag F, migration).«, og `result`-feltet i `provenance/plan-audit-fresh-eyes-r2.claude-result.json` starter identisk, så trunkeringen skete før arkivering. Provenance-teksten resumerer »Rest-status: 6 fund«, som ikke findes i filen. Auditens egen rest-dom og indledende gennemgang mangler. Min dom over auditen hviler kun på det bevarede FUND2-afsnit og runde-1-tabellen. Driveren skal genskabe, genkøre eller bogføre tabet i fund-log før gaten.
- **R2-6 · binding · driver.** Implplan i workdir @ 2949f699 har blob `0fdd5b1e09d38be8a47fdd616b837446179eb767`, mens plan.md:20, kill-list:254 og plan-angreb-r2:387 pinner `8fab089d`. D10 og D12 i den læste version stemmer med planens brug. »D13« optræder kun som ledger-post »planner-undtagelse fjernet D13«; plan.md:720's D13-læsning er uverificeret af mig. Driveren re-pinner eller bekræfter.
- **R2-7 · mindre · build-robusthed.** AK-DATO-DRIFT sammenligner `payload->>'gaeldende_fra' <> effective_from::text`. Tekst-sammenligning afhænger af DateStyle i wrapper- og cron-session. Sammenlign som date. Evidens: `plan.md:324`.

**Hvad jeg bekræfter som båret ved egen læsning:** `_pii_klassifikation_guard` er nåbar gennem den fælles upsert, fordi den bruger INSERT ON CONFLICT DO UPDATE, så K-7/S er ægte lukket (`20260514190200_q_class_anon_rpcs.sql:38-52`, `plan.md:199,272`). `pending_changes.change_type` har ingen CHECK, og `pending_change_request` har ingen type-CASE, så §2.6's liste af fundament-ændringer er komplet på den akse (`…t9_pending_changes.sql:32-62,121-153`). SA-1 for K-2 og K-6 er korrekt bundet: låsen på ejer-rækken plus READ COMMITTED-genlæsning giver taberen den pinnede 22023-klasse (`plan.md:126,178,289,324`). E20-snittet holder med præcis T2.6 og T6.2.

**Binding.** Workdir `wd-c` @ commit `2949f699d94d032871c4e4e6f5a67265d7753843` uden `.git`; alle blobs verificeret med `git hash-object`. Web ikke brugt. Intet skrevet.

| artefakt | blob |
| --- | --- |
| `plan-build/lokations-skabelon/plan.md` | `2069aa16e36d4b693ddad5f6166ec928ee72fa45` |
| `plan-build/lokations-skabelon/kill-list-udkast.md` | `13b783927f4fed107caa0e849e65499fd3291b61` |
| `plan-build/lokations-skabelon/forventningsliste-udkast.md` | `2200b76e29b52f7084c0bfe003c0a2e8121c2346` |
| `plan-build/lokations-skabelon/krav-udkast.md` | `9402164d87a35fb939661058bea77c1a052493d0` |
| `plan-build/lokations-skabelon/recon2.md` | `2bdbb122158b6f8c72fc942b8de28e679742b4aa` |
| `plan-build/lokations-skabelon/p8-slutproeve-spec.md` | `4af07ef4164882ca54643e79df3554c0bf22b0e4` |
| `plan-build/lokations-skabelon/plan-angreb-r2.md` | `0b2a36ca14e05a14459694b125fde3f84dc34ca5` |
| `plan-build/lokations-skabelon/plan-audit-fresh-eyes-r2.md` | `292d029cfb8eb0e5d65ee9ffdde04892ca117bf7` (hoved-trunkeret, R2-5) |
| `plan-build/lokations-skabelon/fold-ind-rapport-r2.md` | `39936c64f96d9dc6ac97af87d7ddd8b1e20f99bb` |
| `plan-build/lokations-skabelon/fund-log.md` | `9eaa12a567e4dc10ce4274390439c92b6b77f7aa` |
| `docs/workflow-faerdiggoerelse/workflow-implementeringsplan.md` | `0fdd5b1e09d38be8a47fdd616b837446179eb767` (afviger fra planens pin, R2-6) |
| `20260515120000_p2_anonymization_mapping_lifecycle.sql` | `ec3d9a0bb5bb188105feba1efdd714ab7b8a448c` |
| `20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql` | `6083fecd79ff6ba167dd12222144824c02a78d2e` |
| `20260515130000_r7a_regprocedure_callable_fix.sql` | `6f0e1db3eca18a225d66ae627b6872289c3c0e9b` |
| `20260514160000_t1_inline_fix_audit_non_uuid_id.sql` | `e3cfa9fefc635b2658af2eb7be5dea0d70614975` |
| `20260607110001_core_identity_secdef_pending_change.sql` | `ae336ee67bbb960739d252863e3785d4b2804e40` |
| `20260514120001_t1_schemas_and_defaults.sql` | `c6fb84d25dcc6e8fc7d0669e1df4bd7a3b501886` |
| `20260518000004_t9_client_node_placements.sql` | `f49e7d5bf248af01d8a67ac2a5f1129ceb462a7a` |
| `20260518000010_t9_seed_owners.sql` | `07ec8a8e600e16493506423b42e42aa7cab9b05f` |
| `20260521100005_t9_supplement_2_pending_changes_select_policy.sql` | `4df2fca6e873d845c5af1a1ee1f0293b4f943d97` |
| `20260514120003_t1_audit_partitioned.sql` | `a7ec488473128315107d2c1294e5d0a125b7b60d` |
| `scripts/migration-gate.mjs` | `e79ce6eb985c5994cd320398cb9c23f101db8135` |
| `scripts/fitness.mjs` | `d1b4d601ef273e62dbaba42261cc20ba051882c5` |

Filer læst ved sti uden egen hash: `20260518000000_t9_pending_changes.sql`, `20260514170004_c002_c003_anonymization_dispatcher.sql`, `20260514190200_q_class_anon_rpcs.sql`, `20260514190100_q_audit_rpcs.sql`, `20260515110100_p1a_anonymization_strategies.sql`, `20260514180300_q1_employee_active_config.sql`, `20260607110002_core_identity_secdef_role_permission_grant.sql`, `scripts/governance-check.mjs`. Deres linjeankre er læst i dette workdir @ 2949f699.