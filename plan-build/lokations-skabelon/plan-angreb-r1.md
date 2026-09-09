# OUT-angreb — lokations-skabelon, Fase 3

Aktør: codex-ANGREB. Dato: 2026-09-08. Rolleteksten `scripts/v5/roller/codex-angreb.md` er læst først. Web er ikke brugt. Kun denne rapport er skrevet; krav, plan og kode er uændrede.

## Verificeret input og dommens rækkevidde

`HEAD = ec4a3d9f1e3b4c243c46a73d10d55f1f7ec17f42`. Både `HEAD:plan-build/lokations-skabelon/plan.md` og arbejdsfilens `git hash-object` er **423d9b20e20d52c273572473a5808c5f6ff1415e** — det bestilte angrebsobjekt.

| Binding | Verificeret blob |
| --- | --- |
| `docs/sandhed/krav/lokations-skabelon-krav.md` | `9402164d87a35fb939661058bea77c1a052493d0` |
| `plan-build/lokations-skabelon/recon2.md` | `2bdbb122158b6f8c72fc942b8de28e679742b4aa` |
| `recon/recon-2-bilag.md` | `6e569779353ea1d0a2bf747ce6eda6509de1aea0` |
| `plan-build/lokations-skabelon/p8-slutproeve-spec.md` | `4af07ef4164882ca54643e79df3554c0bf22b0e4` |
| `plan-build/lokations-skabelon/ordbog.md` | `bcab6b4ed9c9c0fe21f13c70d8e1d47a2afd9fef` |
| `plan-build/lokations-skabelon/mathias-ord.md` | `b883de9358480984425064d1502d02fd63c6a3c3` |

Alle planhenvisninger nedenfor er til den verificerede planblob og dens 1-baserede linjer. Kildekodehenvisninger er til filer ved ovenstående HEAD. Fundene er kildeafledte modbeviser og konkrete prøvespecifikationer, **ikke påstande om udførte lokations-runtime-tests eller dræbte mutanter**. Pakken er endnu en plan; ingen database-, deploy- eller livekontrol er udført i dette angreb.

Nummerkontrol af matrixen giver **53/53 ac**, fordelt K-1..K-9 som 5/6/6/9/5/10/4/5/3, uden dublerede ac inden for et K. Det er derfor ikke manglende ac-numre, der angribes. Indhold, negative strukturkrav, udførende kode og måleveje er ikke dækket alene af denne optælling.

## A-1 — T10-halen genåbner netop de direkte writes, kravet forbyder

**Akse:** 3 · 4 · 5. **Alvor: BLOKER.** K-8/ac1, K-4/ac3 og K-2/ac6.

**Plancitat:** L157: »eksplicit DML-GRANT (`grant insert, update` — ALDRIG delete)« og policies på »`current_setting('stork.allow_<tabel>_write', true) = 'true'`«. L124 kræver samtidig direkte DML afvist »uanset rettigheder og selvsatte session-vars«. L460 begrunder min-1-stand med, at revoke-regimet har »lukket enhver anden skrivevej«.

**Hul/falsk-grøn-kanal:** Juni-revoken er en engangs-REVOKE på daværende tabeller, ikke en regel der ophæver fremtidige GRANTs (`20260607110004_core_identity_revoke_authenticated_core_writes.sql:1-12`, blob `408a96ff`). Nye september-GRANTs vinder. `grupper` får dermed en reel direkte INSERT-vej, når authenticated selv sætter write-var og en årsag. En gyldig direkte INSERT af gruppen behøver hverken wrapperens permission-check eller en allerede læsbar række. Tilsvarende genåbnes mutation af øvrige tabeller; deres RPC-only-domæneregler er ikke beskyttet af en selvvalgt GUC. Det modsiger K-8/ac1 direkte og ødelægger begrundelsen for RPC-båret minimumsstand/status. Korrekt `app-write-revoke-discipline` bliver rød; den nuværende SECDEF-write-vej har heller ikke brug for disse app-grants. Recon-Codex advarede udtrykkeligt om denne gamle/nye mønsterkonflikt, recon2 L232 og L366.

**Konkret ret-forslag:** Fjern app-INSERT/UPDATE fra fællesreglen og alle tabelhaler, også status-INSERT og Bid 4-tabellerne. Bind eksplicit ingen effektive INSERT/UPDATE/DELETE/TRUNCATE for public/anon/authenticated/app-roller og behold kun nødvendige SELECT/EXECUTE. Bevis normal SECDEF-skrivning som app-bruger samt direkte DML med og uden selvvalgte GUC'er på hver tabel. Mutant: genindfør ét effektivt app-GRANT; kræv både privilege-kontrol og den konkrete direkte skriveprøve rød. Faldgrube 3 er først lukket, når denne forudsætning holder.

## A-2 — Bid 2 specificerer en klassifikationsværdi, registryet afviser

**Akse:** 1 · 3. **Alvor: BLOKER.** K-7/ac1 og Bid 2 som forudsætning for Bid 3–5.

**Plancitat:** L292: »Kategorier: master_data (lokationer/stande), **historik (de tre logs)**«.

**Hul/falsk-grøn-kanal:** `data_field_definitions.category` tillader kun `operationel`, `konfiguration`, `master_data`, `audit`, `raw_payload` (`20260514120005_t1_data_field_definitions.sql:14-16`, blob `fb805b56`). Ingen senere ændring af dette kategoridomæne er fundet i migrationskæden. En 1:1-klassifikations-INSERT med `historik` rammer CHECK/23514. Den syntaktiske migration-gate validerer udtrykkeligt ikke category-værdier (`scripts/migration-gate.mjs:12`), så et grønt tuple-bevis kan skjule en migration der ikke kan anvendes.

**Konkret ret-forslag:** Angiv en eksisterende, begrundet kategori pr. historiktabel og de præcise klassifikationstupler. Bind Bid 2's done til faktisk anvendelse af migrationen på schemaet, ikke alene parserens kolonnetilstedeværelse. Udvid ikke det fælles kategoridomæne stiltiende for at redde teksten.

## A-3 — K-7's nedgraderingsforbud mangler udførende kode og negativ

**Akse:** 2 · 3 · 4 · 6. **Alvor: BLOKER.** K-7's strukturregel samt K-8/ac2 og K-9/ac3.

**Plancitat:** L440: »klassifikations-valg via de FÆLLES eksisterende indgange (`b9f976338`-fladen)«. L115/L490 klassificerer kontaktfelterne direct; K-7-kill-listen L118 tester en ændret klassifikationsværdi, men ingen offentlig direct→lavere-/delete→recreate-vej.

**Hul/falsk-grøn-kanal:** Den citerede `data_field_definition_upsert` opdaterer frit `pii_level` i ON CONFLICT (`20260514190200_q_class_anon_rpcs.sql:38-52`); `data_field_definition_delete` sletter definitionen (:58-83). Der er ingen tilsvarende planændring eller fysisk nedgraderingsguard. T10's værn sidder i **client_field_definition_upsert**, ikke i disse fælles indgange. En klassifikationsrettighedshaver kan derfor nedgradere `gruppe_kontakter.email`, eller slette og genoprette definitionen som none, og derefter få nye kontaktændringer skrevet i audit i klartekst. En rigtig authenticated SECDEF-vej gør dette muligt selv efter rettelsen af A-1. Det er netop recon2 L354/E116–E117 og P-8/N7, L155.

**Konkret ret-forslag:** Tilføj et bid-bundet værn på de fælles fysiske klassifikationsveje, inklusive DELETE og identitetsflytning/recreate; angiv scope, funktion/trigger, navn og fejl. Det skal afvise direct→indirect/none også for superadmin. Negativ: udfør begge omgåelser gennem offentlige indgange, kræv navngiven afvisning og uændret definition, opdater derpå en sporværdi og bevis beskyttet audit. Mutanter: fjern henholdsvis nedgraderings- og delete-værnet; hvert kald skal dræbe sin mutant. En seed-assert er ikke denne effektprøve.

## A-4 — Planen vælger lokations-PII, men leverer ingen lokationsanonymisering

**Akse:** 3 · 4 · 6. **Alvor: BLOKER.** K-7/ac3–4 og K-9/ac1–2.

**Plancitat:** L115: »lokationer.adresse er `indirect`«. L116: »lokations-anonymisering: `anonymized_at` = inaktiv struktur (**ingen direct-felter → ingen mapping**)«. L490 gentager valget; Bid 5.1 L433–438 leverer kun `gruppe_kontakt`-mapping og wrapper.

**Hul/falsk-grøn-kanal:** Kravet L143 siger **persondata**, ikke kun direct: lokationsanonymisering aktiveres ved aktiv PII-klassifikation. Planen foretager allerede et aktivt indirect-valg for adresse og erstatter dette vilkår med »ingen direct«. Den fælles `anonymize_generic_apply` og mapping-test går kun gennem direct-kolonner (`20260515140000…sql:54-97`; `20260515120000…sql:198-230`). Adresse er derfor ubehandlet. Selv ved et senere lovligt UI-valg adresse→direct mangler pakkens lokations-wrapper, intern anonymiserings-/replayfunktion og mapping. K-9's klassifikationshandling kan gennemføres, men det efterfølgende krævede produktflow kan ikke. P-8/C9 og §2.3 kræver dette flow med faktisk valgte lokationsfelter; det kan ikke udføres mod Bid 5's kontakt-only-flade.

**Konkret ret-forslag:** Bevar kravets aktiveringsvilkår og planlæg den nødvendige lokationsvej med feltvis behandling, mapping-/coverage-aktivering, replay, historik/audit og præcis adfærd ved nye aktive klassifikationsvalg. Bind også de UI-valgbare retention-regler til en udførende vej; en NULL-seed beskriver kun starttilstanden. Prøv adresse med det valgte indirect-niveau og derefter en lovlig direct-opklassificering via fælles RPC; normal anonymisering og nyproduceret snapshot→replay skal erstatte sporværdien og bevare identiteter/forretningshistorik. Mutant: filtrér indirect fra eller undlad lokationsdispatch; denne kæde skal blive rød. Det faste kolonnevalg er tilladt, men fjerner ikke disse pligter.

## A-5 — Den lovede fulde mapping-lifecycle kan ikke køres på den seedede mapping

**Akse:** 1 · 2 · 3 · 6. **Alvor: RET.** K-7/ac4 og Bid 5.

**Plancitat:** L436: »Mapping-seed … `status='approved'`« og »e2e-testen driver **hele lifecyclen** inkl. aktivering under ROLLBACK«.

**Hul/falsk-grøn-kanal:** Den eksisterende `anonymization_mapping_test_run` kræver draft (`20260515120000_p2_anonymization_mapping_lifecycle.sql:192-196`). Upsert af en eksisterende mapping bevarer status (:152-158), og regression approved→draft er blokeret (:69-71). Det specificerede seed kan aktiveres, men kan ikke gå gennem den påståede fulde draft→test→approve→activate-kæde. Dertil kan en aktiv mappings strategier ændres via upsert uden ny coverage-test; activate revaliderer ikke feltcoverage (:275-299). »Mapping findes/kan aktiveres« er derfor ikke det P-8 §2.3 L133-135 kræver, især ved ændring efter aktivering.

**Konkret ret-forslag:** Fastlæg én konkret produkt-lifecycle og et tilsvarende testforløb. Eksempel: seed draft og lad de eksisterende offentlige steps validere/godkende/aktivere, hvis det er den ønskede leverance; bind desuden en scoped ændring der kræver revalidering ved ændring af en aktiv mappings relevante data. Alternativt specificér en separat lovlig coverage-prøve af bootstrap-mappingen og en faktisk vej til genvalidering, frem for at kalde aktivering »hele lifecyclen«. Test udeladt telefon-strategi både før første aktivering og ved opdatering af aktiv mapping; observer afvisning før ubeskyttet brug, med intakte data.

## A-6 — INVOKER-oraklet kan svare falsk på en sand klientret på grund af en anden sides RLS

**Akse:** 2 · 3 · 4 · 6. **Alvor: BLOKER.** K-3/ac4, K-6/ac4,7 og K-8/ac4.

**Plancitat:** L157: read-RPC'er er invoker med `has_permission(<page>,'manage',false)`. L395: koblingernes SELECT-page er `grupper`, fravalgenes er `lokationer`. L420: `klient_maa_staa_paa` kombinerer begge tabeller. L421/L423 lover klientnavne/lister.

**Hul/falsk-grøn-kanal:** En legitim bruger med lokationer/manage-read, men uden grupper/manage-read, ser nul `gruppe_klient_koblinger` gennem den specificerede INVOKER-vej. `EXISTS` bliver false, selv om relationen findes, og oraklet returnerer en forkert **forretningsafvisning** frem for en navngiven adgangsafvisning. Hvis builderen i stedet tilføjer ekstra read-gates, har builderen selv valgt en skjult rettighedsafhængighed. Navne/lister har yderligere afhængighed til clients/manage (`clients_select`, `20260521000001_t10_tables.sql:69-71`); lokationens gruppenavn til grupper. Superadmin-positive tests skjuler alle disse fejl. Planen binder heller ikke, om `visibility=self/subtree/all` har rækkeeffekt; den valgte helper læser kun can_access/can_write (`20260518000010_t9_seed_owners.sql:28-83`), ikke visibility. Ingen org-kobling må opfindes som ejergruppe.

**Konkret ret-forslag:** Bind en fuld action/read/source/scope-matrix for gruppesiden, lokationssiden, klientnavne og pending-visning. Afgør eksplicit global sideadgang kontra faktisk rækkeafgrænsning. Implementér den valgte adgangsvej, så manglende datakildeadgang aldrig maskeres som ret=false. Prøv legitim non-admin med kun hver enkelt page/tab-kombination, dernæst de nødvendige grant-kombinationer, med identiske backing rows. Sammenlign oracle og liste-ID'er mod et uafhængigt ret-orakel. Mutanter: skift en kildepolicy til forkert page eller fjern en nødvendig gate; prøven skal vise den præcise ændring i adgang/ret.

## A-7 — JWT-simulering og superadmin-positive smokes binder ikke non-bypass/API-beviset

**Akse:** 2 · 6. **Alvor: RET.** K-8/ac1,4 og K-9/ac1–2.

**Plancitat:** L24: »authenticated via JWT-sim `t10_client_lifecycle.sql:26-36`«. L206: »JWT-sim superadmin (positiv) + rettigheds-løs employee … + view-only«. L440 bruger igen JWT-sim; L600 overlader eksponeringen til fitness' live-checks.

**Hul/falsk-grøn-kanal:** Det anviste lifecycle-forbillede sætter kun JWT-subjekt; det skifter ikke DB-rolle (`supabase/tests/smoke/t10_client_lifecycle.sql:12-36`). DML-negativerne henviser andetsteds til en rigtig rolleprobe, men samme garanti er ikke bundet til positive reads, pending-visning og K-9-kæden. JWT under postgres skjuler A-6 og enhver tilsvarende SELECT-policyfejl. Planen kræver heller ikke positiv fuld kæde som legitim **non-admin**; inaktiv-gruppe-/klient-afvisninger kan således testes i den rolle, som planen selv tillader at bypass'e dem. Den eksisterende fitness-eksponeringskontrol undersøger fem T9-OpenAPI-navne, ikke nye lokationskald (`scripts/fitness.mjs:1013-1028,1060-1074`). SQL-smokes kan bestå, selv om en nødvendig ny RPC mangler i appens schema-cache.

**Konkret ret-forslag:** Bind positiv fuld kæde til legitim non-admin gennem den faktiske API med verificeret DB-app-rolle; bind SQL-prober til `SET LOCAL ROLE authenticated`, `current_user`, ejerskab og `rolbypassrls=false`. Adskil app-superadmin fra DB-superuser og kræv lovligt søsterkald før domænenegativ. Nulstil kontekst mellem aktører. Tilføj aktuelle lokationssentinels og faktiske positive API-kald. Mutanter: restriktiv SELECT-policy, manglende EXECUTE/schema-cache-entry, fjernet non-admin-aktivguard; hvert tilfælde skal ramme sin egen effektassertion. Dette er P-8 L143-145 og L238-242 konkretiseret på planens flade.

## A-8 — Flere erklærede kills kan ikke dræbes gennem den angivne effektsti

**Akse:** 2 · 5. **Alvor: RET.** Især K-5/K-8; kill-listens metode pr. K.

**Plancitat:** L90: »fjern hviledage-CHECK → 0-negativ rød«. L130: »glem DML-GRANT … → positiv-flow rød« og »sæt session-var FØR permission-checket → fejlet-check-efterlader-autoriseret-tx-testen rød«. L319 tilbyder »fjern låsen → kodeinspektions-kill«.

**Hul/falsk-grøn-kanal:**

| Erklæret mutant | Hvorfor den angivne drabsmekanisme ikke holder |
| --- | --- |
| K-5(b), fjern tabel-CHECK | `lokation_opret` og `lokation_saet_hviledage` afviser stadig <1 med 22023, L300/L303. Den offentlige 0-negativ forbliver grøn. |
| K-8(a), fjern app-DML-GRANT | Writeren er SECDEF med ejerrettigheder. Fjernelse af authenticated-grantet fjerner A-1; den lovlige write-vej behøver ikke blive rød. |
| K-8(b), flyt set_config før RAISE | En fejlet funktionskørsels databaseændringer, inklusive lokale GUC-ændringer, rulles tilbage med den fejlede statement/subtransaktion. En exception-catch uden for kaldet beviser ikke den påståede efterladte autorisation. Planen angiver ingen faktisk overlevende effektsti. |
| K-5(a), en session-var-policy-gate | Efter A-1 er direkte app-DML revoked; SECDEF-ejeren kan bypass'e RLS. En isoleret ændring af denne policy er ikke et bevis på den relevante hvile-RPC's rettighedsgate. Trigger-IF-fælden fra P1a er heller ikke automatisk samme semantik som en RLS-policy. |
| K-8(d), fjern superadmin-page-grant | Det specifikke approve-kill er ikke sikkert: `has_permission` falder tilbage til area-grant, og org_structure er et eksisterende superadmin-seedet area (`20260518000010…sql:59-67,198-207`). En særskilt seed-row-assert kan opdage seed-drift, men det er et andet bevis. |

De øvrige gyldige frø redder ikke disse påstande. Gulvet er nåbare, targeted effektkills, og alle relevante knapper skal være disponeret; en statisk forskel må ikke ommærkes til et dræbt domæneforløb.

**Konkret ret-forslag:** Udskift frøene med de faktiske offentlige RPC-predikater. Eksempelvis mutér hviledage-valideringen og kræv den lovlige bruger ramme en anden fejl end 22023/ændret sluttilstand; test DB-CHECK særskilt som bagstopper i en eksplicit privilegeret constraint-probe. Hold effektdrab, schema-/leverancekontrol og ikke-nåbare forsvarslag adskilt. Bind locus→mutant→indgang→rolle→slut-effekt før gate; pr.-K-afledningen nederst er minimumsgrundlaget for revisionen. Ingen af disse mutanter er dræbt i denne planrunde.

## A-9 — Dagens pending med 24 timers undo bliver en historikændring i morgen

**Akse:** 3 · 4 · 5 · 6. **Alvor: BLOKER.** K-6/ac6,7,10; M-13 og P-8's historie-invariant.

**Plancitat:** L399 tillader `p_gaeldende_fra = current_date`. L408 binder payload-dato til effective_from og lukker/indsætter med payload-datoen. L414 seeder 24 timers undo. L411 kopierer eksisterende due-gate.

**Hul/falsk-grøn-kanal:** C er koblet på G fra D0. På D1 kl. 12 anmodes/godkendes frakobling med dato D1; deadline bliver D2 kl. 12. På D1 og frem til deadline er C stadig berettiget, hvilket K-6/ac10 kræver. Ved lovlig apply på D2 sættes koblingens `gaeldende_til=D1`. Genlæsning af den nu historiske D1 bliver false, selv om den tidligere var true: normal drift ændrer fortiden. Central apply kræver kun `effective_from <= current_date`, aldrig at datoen stadig er gyldig fremadrettet (`20260518000004_t9_client_node_placements.sql:172-187`). Kopierer handleren også wrapperens fortidsafvisning, fejler i stedet det normale 24-timers-flow. Ingen af de to læsninger leverer planens samtidige løfter. En prøve der først læser historien efter apply kan blive falsk grøn.

**Konkret ret-forslag:** Bind, hvordan gældende-dato og faktisk effektuering forenes uden omskrivning af allerede observeret fortid. En mulig konkret kontrakt er at validere datoens realiserbarhed ved request/approve og afvise for sent apply med navngiven fejl og uændret relation, så brugeren må indsende en ny fremadrettet ændring. Planlæg den valgte løsning, inklusive ændrede undo-perioder/forsinket scheduler; behold ingen tavs payload-/effective_from-drift. Prøven skal gemme D1-svar før deadline, flytte den isolerede klokke til D2, udøve normal apply og genlæse D1. Mutant: tillad for sent apply med gammel dato; den bevarede historieassertion skal blive rød.

## A-10 — SQL-udtrykkene håndhæver hverken den lovede UTC-dato eller skiftetid

**Akse:** 3 · 4 · 5. **Alvor: RET.** K-1/ac3, K-4/ac4–5, K-6/ac7.

**Plancitat:** L250/L263 bruger `default now()`; L290 bruger `current_date`. L313 og L481 kalder `skiftet_kl::date` en »UTC-dato«. L329 siger »intet backdate-parameter findes (fortid designet urørlig)«.

**Hul/falsk-grøn-kanal:** Cast fra timestamptz til date afhænger af sessionens TimeZone; `SET search_path=''` binder ikke TimeZone. Samme event ved 22:30 UTC kan dermed tilhøre forskellige datoer i to sessions, og pris/status/ret kan skifte uden ændrede rækker. Desuden er `now()`/`current_date` transaktionens starttid/dato. En transaktion åbnet før UTC-midnat kan udføre et lovligt status-/pris-/ejerskifte efter midnat og stemple det med gårsdagens dato. Fravær af et backdate-argument er derfor ikke et forbud mod tilbagevirkende historik. En enkelt UTC-session uden midnatskryds udøver ingen af kanterne.

**Konkret ret-forslag:** Bind UTC teknisk i alle datoafledninger og default-argumenter, fx eksplicit `AT TIME ZONE 'UTC'` eller en komplet, dokumenteret funktionskonfiguration. Bind også det autoritative hændelsestidspunkt og låserækkefølge, så transaktionsstart ikke kan stemple en senere mutation ind i en afsluttet dag. Prøv samme records under to TimeZone-indstillinger og en transaktion over midnat; kræv identiske UTC-datoopslag og uændret gårsdag. Mutanter: fjern UTC-normalisering eller genindfør transaktionsstart som skifttid; de navngivne kantprøver skal blive røde.

## A-11 — Centrale RPC'er og deres interne adgangskanter er stadig build-valg

**Akse:** 3 · 4. **Alvor: RET.** K-6/ac1,5,10, K-8/ac1,4 og K-9.

**Plancitat:** L591: »alle RPC-navne, signaturer, gate-rækkefølger, SQLSTATEs … byggeren træffer INGEN beslutning«. L399–408 beskriver fire wrappers/handlers med payload-tabel, men uden komplette wrapper-signaturer. L55 siger `p_gruppe_id NULL → 22023`, mens L300 kun binder gruppe-eksistens til P0002.

**Hul/falsk-grøn-kanal:** Builderen skal stadig beslutte de fire wrapperes parameterrækkefølge/defaults, flere returtyper, konkret page-gating af mixed read-flader og JSONB-resultatets keys/tom-/ukendt-semantik. `lokation_klient_fravalg_ophaev` mangler den intervalvalidering, frakobl eksplicit har: en ophævelsesdato ≤ fravalgets start rammer tabel-CHECK/23514 frem for en bundet offentlig fejl. NULL-gruppe har to forskellige fejlløfter. De fire nye apply-handlers' EXECUTE-ACL er ikke bundet eksplicit, og den interne `_anonymiser_gruppe_kontakt_internal` henviser til en offentlig wrapper som forbillede. T1 giver nye funktioner authenticated-EXECUTE som default (`20260514120001…sql:37-41`); etiketten »intern« lukker intet. `_gruppe_kontakt_apply` har et bedre forbillede med revoke, men det kan ikke automatisk udfylde alle de andre signaturers ACL. Her er beslutninger med reel effekt på API, domænefejl og adgang, ikke krav om at specificere lokale variabelnavne.

**Konkret ret-forslag:** Afslut et fuldt offentligt/internt RPC-register med signatur, returformat, rettighed, konkrete kontroller/fejl, funktionssikkerhed/ejerforudsætning og endelig ACL pr. signatur. Bind eksplicit revoke fra public/anon/authenticated for alle interne handlers; ingen app-EXECUTE via default. Afstem NULL-gruppe og ophævelsens intervalgrænser. Bind før/efter-assertions og en API-negativ for manglende/ekstra argumenter samt direkte interne kald med ellers gyldigt payload/pending-id. Mutant: tilføj authenticated-EXECUTE på en intern handler eller fjern intervalchecket; den rigtige afvisning skal forsvinde og prøven blive rød.

## A-12 — Det påkrævede concurrency-bevis kan nedgraderes til prosa og kodeinspektion

**Akse:** 1 · 2 · 5 · 6. **Alvor: BLOKER.** K-2/ac6 og Bid 4's samtidighed.

**Plancitat:** L319: hvis to forbindelser ikke kan etableres, »dokumenteres FOR UPDATE-låsen som residual med enkelt-sessions-mutant … kodeinspektions-kill«. L602: »dokumenteres residualet synligt i build-proof«.

**Hul/falsk-grøn-kanal:** Den kritiske prøve er to sessions, der begge ser en anden aktiv stand og forsøger at deaktivere hver sin. Fjernelse af låsen ændrer ikke et enkelt-session-forløb. At en tekstscanner finder/finder ikke `FOR UPDATE`, beviser heller ikke, at begge handlinger låser samme parent før count og faktisk serialiseres. Det er en erklæret undtagelse fra biddets eget done-kriterium, ikke et drab. P-8 L231 kræver to uafhængige sessions med dokumenteret barriere; dens L272 kræver den faktiske effektprøve rød ved fjernet parent-lås. Det kan ikke indfries ad den tilbudte residual-vej.

**Konkret ret-forslag:** Gør to forbindelser/barriere/committed observation til en nødvendig, leveret prover-forudsætning før Bid 2 og Bid 4 kan afsluttes. Manglende harness betyder rødt/ufuldendt bid, ikke grøn med residual. Bind forløbet: to aktive stande, to aktører, samme parent; baseline giver præcis én domæneafvisning og én aktiv stand tilbage; mutant uden parent-lås tillader det kontrollerede nul-aktive-udfald og dræbes. Bind tilsvarende dubletkobling til to requests/to apply-forløb; en pending-rækkelås alene serialiserer ikke forskellige pending-id'er.

## A-13 — P-8 er ikke indbundet, og kædens nødvendige adaptere har intet leverancested

**Akse:** 1 · 3 · 6. **Alvor: BLOKER.** K-1..K-9; M-35/P-8.

**Plancitat:** L604: »slutprøve-spec (P-8) leveres af Codex før plan-lås — planens §1-matrix og §2-harness-former er dens input«. L157 kræver prover-/CI-grønt pr. bid; L440 angiver et JWT-samleharness.

**Hul/falsk-grøn-kanal:** Den nu foreliggende spec `4af07ef4…` er ikke optaget med OID, og ingen planrække binder C0–C10/N1–N9 til konkrete bids, signaturer og mutanter. P-8 L24 kræver netop denne matrix. Der mangler også før-build-binding af kildeidentitet/scope/projektion (P-8 L34,42-56), legitim clock-/job-driver for D0…D8 og positive undo-vinduer uden direkte pending-DML (L191), samt sammenhængende commits/API/rolleovergange og prover-resultatadapter (L238-250). Det er ikke udfyldt af at skrive »fuldt gennemløb« eller »Codex skriver«. P-8 L252 identificerer desuden den manglende chain-proof-verifier. Der er ingen navngiven fabriksleverance/afhængighed i planen, som gør dette arbejde konkret og reviewbart. En bunke grønne rollback-smokes kan derfor ikke blive det krævede kædebevis.

**Konkret ret-forslag:** Optag P-8's verificerede OID og udfyld matrixen `K/ac → bid/step → C/N → fuld offentlig signatur → rolle/observation/negativ → mutant-locus`. Bind kilde/scope/projektion og isoleret måltarget før lås. Placér clock-driver, API-/multi-session-harness, udtrækker/attest, resultatadapter og chain-proof-verifier som konkrete fabriksafhængigheder med ejer og afslutningsgate; deres kode skal have egen 1:1-plan. Det kræver ikke en produktfeature til migration af 1.0-data. Hvis fabriksarbejdet ligger i en anden plan, bind dens OID og færdigbevis; henvis ikke blot til en fremtidig aktør.

## A-14 — API-sidegrænsen er omtalt, men fuldstændig læsning er ikke specificeret

**Akse:** 3 · 6. **Alvor: RET.** K-9/ac1–2 og P-8/C10.

**Plancitat:** L202: `grupper_liste() … | select`. L308: `lokationer_liste()` og »læse-RPC'er er underlagt max_rows=1000/30s«. L421 returnerer klientliste; L201/L307 returnerer JSONB med indlejrede arrays.

**Hul/falsk-grøn-kanal:** Planen binder hverken stabil total sortering, side-/cursor-kontrakt eller hvordan listen fortsættes efter 1000. PostgreSQL-resultater uden ORDER BY er ikke en stabil sideorden. En gruppe/lokation uden for første side kan være oprettelig, men ikke genfindelig i det planlagte brugerflow. Indlejrede JSONB-arrays har heller ingen selvstændig sidekontrakt. P-8 L82 kræver hvert forventet synligt ID præcis én gang også ud over API-grænsen; en note om begrænsningen er ikke en udøvelig kontrakt for det.

**Konkret ret-forslag:** Bind stabil total orden med ID-tie-break og konkret pagination gennem PostgREST Range eller navngivne cursor-parametre, inklusive tom side, alle aktive/inaktive records og konsistens under læsning. Angiv separat listevej for arrays, hvis de skal kunne fortsættes. Test >1000 produktproducerede records via den faktiske API og sammenlign hele ID-mængden mod uafhængig kontrollæsning. Mutant: fast LIMIT 1000/ignorer næste side; breddeprøven skal blive rød.

## A-15 — Økonomiforbuddets måler undersøger kun schema/FK, ikke den lovede flade

**Akse:** 2 · 4 · 6. **Alvor: RET.** K-1/ac4.

**Plancitat:** L33: »schema-assertion (pg_catalog) + … CROSS_SCHEMA_FK … ingen kolonne/FK … mod `core_money`«. L36(g): »tilføj FK mod core_money → fitness rød«.

**Hul/falsk-grøn-kanal:** Den konkrete mutant og dommer beviser FK-grænsen. K-1 forbyder en attributions-/økonomi-dimension i pakken, og P-8/N1 L149 kræver også JSONB/udgående RPC-data undersøgt. En mutation i fx `lokation_hent` der tilføjer et beregnet provisions-/attributionsobjekt, mens DDL/FK er uændret, undersøges ikke af den angivne K-1/ac4-harness. JSONB-kontrakten er heller ikke eksakt nok til at afvise ekstra økonomifelter. Alle aktuelle FK-tests kan derfor forblive grønne.

**Konkret ret-forslag:** Udvid den bindende ac4-kontrol til hele pakkens kode-/RPC-/resultatkontrakt, inklusive JSONB, uden at bygge økonomifunktioner. Fastlæg tilladte outputfelter og en afhængighedskontrol på de nye funktioner. Tilføj en kontrolleret mutant med en økonomi-/attributionsreference i en eksisterende read-RPC's resultat; det skal være denne konkrete kontrakt-/fladekontrol, der bliver rød, ud over den eksisterende gyldige money-FK-mutant.

## Pr.-K-afledning til revideret kill-list

Dette er angrebs-specifikation til planrevisionen, ikke runtime-PASS. Hver nævnt knap skal have sit eget targeted variant-id, locus og udført effektassertion før build kan krediteres. Gyldige frø i planen beholdes; ikke-nåbare DB-bagstoppere får separat constraint-/schema-bevis og tæller ikke som offentlige domænekills. Fælles permissions/årsag/audit/EXECUTE prøves parametriseret på **hver** relevant indgang, ikke kun på én repræsentant.

| K | Acceptafledte knapper → konkrete targeted mutanter → effektsti |
| --- | --- |
| K-1 | Navn/type-validering → fjern hver offentlig gren → ellers lovlig `lokation_opret` med NULL/blank/ugyldig type skal miste den bundne afvisning uden at et forkert setup tæller. Prishistorik/trigger-WHEN/dato/tie → spring logning over, erstat dato med nu, vend seq → opret P1, ændr P2 senere, genlæs tidligere checkpoint og standens arvede pris. Økonomigrænse → money-FK samt RPC/JSONB-økonomireference → A-15's leverancekontrol. |
| K-2 | Atomisk første stand → undlad stand-INSERT/slug fejl i standdelen → opret og genlæs samme lokations-ID; ingen committed standløs række. Minimum/parent-lås → fjern count og fjern lås hver for sig → sidste-stand-negativ og A-12's to sessions. Ejer/blad/bevaring → tillad forkert reference/delete/cascade → navngiven strukturafvisning og uændrede stand-ID'er efter nedlæg/genåbn. Egen pris/NULL/0/arv samt aktiv-led → vend COALESCE, behandl 0 som NULL, fjern standens eller lokationens aktiv-led → faktiske pris-/bookbar-opslag. |
| K-3 | Navn/gruppe-FK/gruppeaktivitet/udfasning → fjern hver RPC-guard; tillad sletning med relation → almindelig writer skal få den bundne fejl, master/historik består. Arv/lokalitet/kardinalitet → materialisér kun ved kobling, gør fravalg globalt, UNIQUE kun på klient → senere L3 arves, kun L1 mister ret, samme klient kan være i G og H. |
| K-4 | Statusdomæne/dedikeret vej/årsag → fjern domænegren, lad almindelig rediger skrive status, fjern årsagscheck → eksakte negative sluttilstande. Historik/seq/ophørsgrænse → tillad historikændring, ASC, `<` i stedet for `<=` → historik-guardprobe plus status/bookbar på alle kanter. Dvale/nedlagt/genvalidering/genåbning → kræv aktiv i klienthandling, fjern nedlagt-led eller apply-check, genskab gammel klientliste → positiv dvale, request→nedlæg→afvist apply, genåbn med ændret G-medlemskab. |
| K-5 | Valgt antal/default/lokalitet → NULL→implicit standard, fjern offentlig <1-guard, opdater alle lokationer → sæt/fjern valg og genlæs L1/L2; manuel dvale består ved fjernet auto-konfig. Stop/config-permission og audit → fjern de to permissions/årsagsgrene hver for sig → non-admin uden ret ændrer intet, legitim bruger ændrer straks med årsag. Absolut hvile → skjult admin-/klientbypass i bookbar-body → samme hvilende L afviser alle relevante roller/klientkontekster. |
| K-6 | Referencer/dublet/par/interval/fravalg/lokalitet → fjern relevante guards/ret-led eller ændr parindeks → faktisk request→approve→due→apply→oracle og de præcise ugyldige søsterkald. Dateret ejer/medlem/fravalg/status → brug current_date/aktuel gruppe i **ét led ad gangen** → ejerflytning samt frakobling/nedlæg/genåbn på adskilte datoer, alle gamle checkpoints genlæses. Approval/deadline/effective_from/undo/datoidentitet/genvalidering/wiring/årsag → fjern hver gate/gren/propagering særskilt → særskilt requester/approver, positivt undo-vindue, for tidligt og for sent apply, payload-læsning, mutation præcis én gang og bevaret auditårsag. |
| K-7 | Fysisk klassifikation/default/nedgradering/delete → fjern tuple, implicit PII/retention, ophæv A-3's værn → fysisk katalog-dækning og fælles UI-indgange. Feltcoverage/indirect/aktive ændringer → udelad hver valgt feltstrategi/indirect-loop/revalidering → afvis manglende vej og erstat alle sporværdier. Mapping-/strategistatus, checkkolonne, normal dispatch, snapshotparser, replay, kontaktgenbrug → spring hver guard/UPDATE over eller timestamp-only replay → offentlig lifecycle→anonymisering→nyproduceret snapshot→restore→replay, behold relationer og præcis state, afvis nye værdier på låst kontakt. |
| K-8 | Effektiv tabel-/intern-funktions-ACL, hver write-permission, årsag, audit, read-synlighed, grants/approval-scope → ét uautoriseret GRANT eller fjernet konkret gate ad gangen → rigtige app-roller, selvvalgte GUC'er, view-only/non-admin/approver/superadmin; hårde før/efter- og auditassertions. Seedingens specifikke rækker kontrolleres separat fra helperens fallback-effekt; en moot policy krediteres ikke. |
| K-9 | Hver offentlig signatur/EXECUTE/API-eksponering, read-payload/pagination og kode-låste strukturgrænser → fjern én API-indgang, truncér liste, gør et forbud UI-fravigeligt → ubrudt API-kæde med produkt-ID'er, hele ID-mængden, lovligt søsterkald og gentagne N1/N2/N6 efter konfigændring. Fjern typedækning → særskilt CI-leverancekontrol, ikke erstatning for API-effekt. |

## Afgrænsninger, der består angrebet

Den valgte to-tabel-ejerkæde designer cykler og under-stande ud og er inden for kravets planmandat. Ordbogens L29-34 har allerede de nødvendige opdateringer; planens gamle bemærkning om at tilføje dem er ikke i sig selv et åbent navnefund. Gruppe=leverandør, fast feltliste og fravalg bevaret ved genåbning er tilladte planvalg. Der rejses ikke et nyt krav om booking, frontend eller automatisk kampagneudløst hvile i denne pakke.

De fire særlige recon-faldgruber er vurderet således: **cnp-kardinalitet** er konkret adresseret med par-UNIQUE/EXCLUDE og to-gruppe-positiv; **closure-current-state** er erstattet af daterede kilder, men tids- og læseforudsætningerne i A-6/A-9/A-10 består; **ingen deferrable** er et tilladt designvalg, men RPC-tætheden og beviset er brudt af A-1/A-12; **jsonb-konflation** kan holdes uden for denne pakkes valgte kolonnevej, fordi replay læser field_mapping_snapshot. Den sidste vurdering fritager ikke for A-4/A-5's feltcoverage/lifecycle eller den krævede virkelige replay-prøve.

## Konklusion

**ANGREB-STÅR(15)** — **8 BLOKER, 7 RET, 0 NOTE**, bundet til planblob **423d9b20e20d52c273572473a5808c5f6ff1415e** og uændret kravblob **9402164d87a35fb939661058bea77c1a052493d0**.

Planen kan ikke passere dette angreb ved at love senere tests: A-1/A-2/A-3/A-4/A-6/A-9 er konkrete modstridende eller ufuldstændige produktkontrakter; A-12/A-13 lader det nødvendige bevis stå uden en bindende udførelsesvej. Næste iteration skal bindes til en ny plan-OID og forsvare hvert fund med den reviderede konkrete kontrakt og de relevante udførte beviser, når de findes. Rapporten er input til plan-gaten og Mathias' afgørelse, ikke en selvstændig endelig gate-dom.
