Rest-status: 8 åbne

De otte forhold nedenfor samler gentagne fundhenvisninger. Dette er delta-verifikation af plan-blob `c5f451f8a901c3fea23576de6aee1be0f2f51f5a`, ikke den endelige gate-afgørelse.

`P:linje` betyder [plan-build/lokations-skabelon/plan.md](/home/mathias/.claude/jobs/870c5b0e/tmp/b4r3/wd-a/plan-build/lokations-skabelon/plan.md). **Ja** betyder, at rapportens dokumenttilstand bæres af teksten og dens kilder. Ved »KRÆVER MATHIAS« betyder det, at spørgsmålet og betingede udfald er beskrevet; det attesterer intet svar. Ingen implementeret effekt eller dræbt mutant attesteres.

Tilstandsforkortelser: **RB** = RETTET M. BEVIS; **IM** = INDEN FOR MANDAT; **KM** = KRÆVER MATHIAS; **BV2** = BÅRET (v2).

**1. Efterprøvning af rapportens 77 fund**

| id | rapportens tilstand | BÅRET ja/nej | v3 path:linjer | hvis nej: hvorfor + hvad der mangler |
|---|---|---|---|---|
| A2-1 | KM | Ja | P:23,201,624,758 | S-2 er udtrykkeligt ikke mandat; begge betingede planveje er beskrevet. Svarafstemning: A3-8. |
| A2-2 | IM | Nej | P:201,565,793 | Default uden retention erstatter prøven af et aktivt UI-valg. A3-6. |
| A2-3 | RB | Nej | P:87,201,280,558,563,622 | Guard-scope er rettet; R+ mangler rettigheden til den upsert, der skal nå guarden. A3-4. |
| A2-4 | RB | Nej | P:84,201,291,563,633,712 | Guard, negativ og bevaring af `none`-felter er beskrevet; den krævede offentlige opsætningskæde mangler mapping-grant. A3-4. |
| A2-5 | RB | Ja | P:199,211,333,335 | Frisk replay-session, tre GUC’er før UPDATE og faktisk værdierstatning er bundet. |
| A2-6 | RB | Ja | P:95,210,213,217,223 | Effektivt UPDATE-grant, R1 uden indre gate og effektiv EXECUTE-revoke er konkrete mål. |
| A2-7 | RB | Ja | P:113,128,141,143,154,199 | Skelnende fixtures og effektmål er specificeret; T4.3’s redundans accepteres. |
| A2-8 | RB | Ja | P:53,185,189,548,617 | Ønsket/effektiv dato, forsinkelsesprøve og skelnende I2-mutant hænger sammen. |
| A2-9 | RB | Nej | P:114,155,186,213,232–242,354,548,565 | 59 i bid-tabellen; forkert placering af T8.2; to T6.8-loci. A3-2. |
| A2-10 | RB | Ja | P:18,41,115,170,183–184,188,223–226 | Selvstændige obligationer og eksplicit genbrug. Manifestets 60 ID’er matcher matrixen præcist. |
| A2-11 | IM + FS/default | Nej | P:189,211,298,332,348,636,778 | Mandatbelægget for approve/undo-labels holder; den samlede årsagskontrakt gør ikke. A3-3. |
| A2-12 | RB | Ja | P:224,320,322–324,634 | De fire manglende fortsættelsesveje er tilføjet; otte indgange omfattes af breddeprøven. |
| A2-13 | RB | Nej | P:55,91,201,210–213,266,637,795 | De fem konkrete rettelser findes, men fælles årsagsafvisninger er fortsat modstridende/ikke individuelt bundet. A3-3. |
| A2-14 | RB, kontraktkrav | Nej | P:35–37,743,788 | Den nu bundne kontrakt opfylder ikke FA-5’s scope, projektion og eksplicitte target. A3-1. |
| A2-15 | RB | Ja | P:97,198,204 | Faktisk katalogafstemning i begge retninger og særskilt Bid 5-kontrol er specificeret. |
| FUND2-1 | KM | Nej | P:396,573,711,757 | S-1-B er ikke fuldt kontraktbundet og har et ubeskyttet persondatavalg. A3-5; klassifikation afstemmes i A3-8. |
| FUND2-2 | IM + B-4 | Nej | P:141,300,768 | Medlemskabsværnet er konkret; B-4 lover en første-dags-garanti, som kæden ikke sikrer. A3-8. |
| FUND2-3 | KM | Ja | P:624,758 | Samme dokumentmæssige disposition som A2-1. |
| FUND2-4 | IM + B-5 | Nej | P:294,608,769 | IM/bekræftelse er uafstemt med det udsendte ja/nej-spørgsmål. Ingen svarbinding lukker afvigelsen. A3-8. |
| FUND2-5 | IM + default D-1 | Ja | P:602,770 | Startvalget er synligt; mulighed for straks at sætte dvale er beskrevet. |
| FUND2-6 | RB, relabel | Ja | P:587,702,767 | V8 attribueres nu til K:181’s delegation, ikke et påstået M-19-ord om fravalg. |
| NF-1 | IM + B-1 | Nej | P:53,185,766 | Datomodellen er rettet, men B-1 lover virkning på godkendelsesdagen uden udløbet undo-frist. A3-8. |
| NF-2 | KM | Ja | P:624,758 | Indsnævringen fremstilles ikke længere som mandat. |
| D-1 | RB | Ja | P:7 | Formålsnoten skelner nu første afsnit fra hele kravets Formål-sektion. |
| R2-1 | RB | Ja | P:87,199,280,557,563 | Strategiaktivering er et navngivet R+-step før normal anonymisering; manglende aktivering har egen negativ. |
| R2-2 | RB | Nej | P:189,211,298,796 | Request-labelen er rettet lokalt, men P:211(a) lover fortsat brugerens tekst for alle W1–W18. A3-3. |
| R2-3 | RB | Ja | P:33,113,155,168,484,492,548,635,788 | FA-3 omfatter nu pris-, status-, hvile- og koblingshistorik og blokerer relevante bids. |
| R2-4 | RB | Ja | P:152,168,563 | Audit observeres ved SQL-kontrollæsning; R+ behøver ikke et skjult `audit/log`-grant. |
| R2-5 | DRIVER | Ja | P:11 | Den bundne fresh-eyes-fil er komplet med FUND2-1..6 og Mathias-listen. |
| R2-6 | DRIVER + RB | Ja | P:20,733 | Aktuel implplan er re-pinnet; D13-attributionen stemmer med dens tekst. |
| R2-7 | RB | Nej | P:82,298,331 | Sammenligningen er typet, men datoens teksttransport er stadig DateStyle-afhængig. A3-7. |
| A-1 | RB | Ja | P:95,210 | T8.1 rammer den effektive ACL med opfyldt write-policy og gyldig årsag. |
| A-4 | KM + RB | Nej | P:201,333,335,563,758 | Replay og S-2-disposition er båret; direct-kædens R+-opsætning er ikke. A3-4. |
| A-5 | RB | Nej | P:87,201,280,563 | Det rettede mapping-værn nås ikke gennem den bundne R+-upsert. A3-4. |
| A-8 | RB | Ja | P:113,128,141,143,154,185,199,210,213,223 | De nævnte erstatningsmutanter har skelnende mål; redundansen i T4.3 er begrundet. |
| A-9 | RB | Ja | P:53,185,617 | Forsinket apply måles særskilt uden omskrivning af fortiden. |
| A-11 | RB | Nej | P:55–97,210–213,266 | Registerets samlede afvisningskontrakt er endnu ikke konsistent. A3-3. |
| A-13 | RB | Nej | P:35,41,232–242 | ID-sættet er korrekt, men FA-5 og effektfordelingen er ikke. A3-1/A3-2. |
| A-14 | RB | Ja | P:224,320–324,634 | Fortsættelse og fuld mængdeobservation er tilføjet. |
| FUND-1 | KM | Ja | P:624,758 | Indirect-undtagelsen kræver nu udtrykkeligt Mathias’ stillingtagen. |
| F01 | RB | Ja | P:95,210 | Samme effektive ACL-rettelse som A-1. |
| F03 | KM | Ja | P:624,758 | Samme spørgsmål og betingede udfald som A2-1. |
| F11 | RB | Ja | P:113,128,143,154,199,210,213,223 | De tidligere uvirksomme mål er erstattet eller begrundet udtaget. |
| U01 | RB | Nej | P:35,232–242 | Kildekontrakt og D12-fordeling er fortsat åbne. A3-1/A3-2. |
| U02 | RB | Ja | P:210,266,637 | Kaldbare handlers og triggerfunktioners ACL-prober er skilt. |
| U03 | RB | Ja | P:213,325 | V, requester og fremmed pending har særskilte læsekontrakter. |
| U04 | RB | Ja | P:53,185 | Forsinkelsesprøven og dens forventede dato er konkrete. |
| U05 | RB | Nej | P:55–97,201,210–211 | De konkrete type-/mappingrettelser findes; fælles årsagskontrakter modsiger stadig kilden. A3-3. |
| U06 | RB + KM | Nej | P:199,201,333,335,563,758 | R+-mappingopsætning og retention-disposition bærer ikke helkæden. A3-4/A3-6. |
| U07 | RB | Ja | P:47–49,210,212 | Privilegieafvisning, triggerprobe og TRUNCATE-værn har adskilte kontekster. |
| A-2 | BV2 | Ja | P:252,628 | `master_data`-klassifikationen står fortsat. |
| F02 | BV2 | Ja | P:252,628 | Samme klassifikationsrettelse. |
| A-3 | BV2 | Ja | P:202,279,360 | Fysisk nedgraderings-/delete-værn gennem fælles indgange, inklusive SA. |
| F04 | BV2 | Ja | P:202,279,360 | Samme tre negativer og mål T7.1/T7.2. |
| A-6 | BV2 | Ja | P:305,321,620 | SECDEF-orakel og egen page-gate undgår falsk forretnings-`false` fra indre RLS. |
| A-7 | BV2 | Ja | P:45–49,223 | Faktisk non-bypass DB-rolle og API-indgang er fortsat krævet. |
| A-10 | BV2 | Ja | P:51,272–273,618 | UTC-helper og stamp-trigger er eksplicitte. |
| F06 | BV2 | Ja | P:51,272–273,618 | Samme UTC-binding. |
| A-12 | BV2 | Ja | P:32,129,181,743 | To forbindelser, barriere og committed observation er blokerende. |
| F12 | BV2 | Ja | P:32,129,181,743 | Ingen residualvej for de to races. |
| A-15 | BV2 | Nej | P:114,237,484,626 | Kontrakten omfatter alle pakkefunktioner, men slutbeviset placeres før de sidste funktioner findes. A3-2. |
| U10 | BV2 | Nej | P:114,237,484,626 | Samme uafsluttede tværgående output-/økonomikontrol. A3-2. |
| FUND-2 | BV2 | Ja | P:669–674 | `max_rows` er attribueret til recon-2. |
| FUND-3 | BV2 | Ja | P:589 | Recon-citatets »ikke nødvendigvis nødvendig« er bevaret. |
| FUND-4 | BV2 | Ja | P:124,405 | Den dinglende V-A-reference er erstattet af S-1. |
| FUND-5 | BV2 | Ja | P:20,643–665 | Seks ordbogsentries og opdaterede kildehenvisninger er båret. |
| F15 | BV2 | Ja | P:20,643–665 | Samme dokument-/ordbogsrettelser. |
| F05 | BV2 | Ja | P:252,630 | FORCE RLS og triggerens faktiske ejerkontekst er skilt korrekt. |
| F07 | BV2 | Ja | P:189,348,631 | Non-admin self-approve-forbud og SA-undtagelse følger fundamentet. |
| F08 | BV2 | Ja | P:573 | Nyt kodearbejde er konkret navngivet. |
| F09 | BV2 | Ja | P:333,575 | Callable-format og nested snapshot er korrekt adskilt. |
| F10 | BV2 | Ja | P:587 | Luk-UPDATE og exact-start-DELETE har adskilte forbilleder. |
| F13 | BV2 | Ja | P:199,288–289,623 | Begge kontaktindgange har lifecycle-værn. |
| F14 | BV2 | Ja | P:575,669–674 | Snapshot-konflationen er fortsat beskrevet korrekt. |
| F16 | BV2 | Ja | P:282 | Gate-rækkefølgen deklareres som planens skærpelse. |
| U08 | BV2 | Ja | P:223,354 | Nye RPC-sentinels og faktisk API-forløb er specificeret. |
| U09 | BV2 | Ja | P:571–637 | Planvalg er synlige; indirect-læsningen påstås ikke længere delegeret. |

**2. De 21 kill-list-dispositioner**

»Virksom« vurderer den specificerede effektvej eller en kildebåret udtagelse. Det er ikke en opgørelse over udførte kills.

| post | disposition | virksom ja/nej | hvorfor |
|---|---|---|---|
| T1.3 | I | Ja | P:113: udelad prislogning ved UPDATE; R+ ændrer pris; opslag på D2 skal vise P2. |
| T2.8 | I | Ja | P:128: deaktiver stande ved nedlæggelse; C8 sammenholder både identiteter og `is_active`. |
| T3.5 | I | Ja | P:143: fjern lokationspredikat i I4’s åbne-fravalg-opslag; ældste søsterfravalg gør lokalitetsbruddet synligt. |
| T4.3 | R | Ja | P:154: omskrivningen rammer immutability-værnet. Separat nødvendiggørelse af redundant værn kræves ikke. |
| T6.3 | I | Ja | P:141: W15 uden medlemskabsværn accepterer outsider-request; R+ og pending-effekten er bundet. |
| T6.14 | I | Ja | P:185: I2 skriver ønsket dato ved forsinket apply; historisk Ret flipper i den obligatoriske forsinkelsesprøve. |
| T7.5 | I | Ja | P:199: faktisk `generic_apply`-loop udelader telefon; sporværdien består trods timestamp/state. |
| T7.9 | I | Ja | P:199,333: I6 sætter kun timestamp; frisk replay skal påvise manglende værdierstatning. |
| T7.10 | R, betinget S-2 | Nej | P:201,624,758: afventer et bundet Mathias-svar; hverken ubetinget udtagelse eller valgt instans foreligger. A3-8. |
| T7.12 | R | Nej | P:201,565: ingen seedet retention bruges til at udelade den aktivt valgte retentionprøve. A3-6. |
| T7.14 | I | Ja | P:199: to kontakter i samme gruppe skelner korrekt ID fra gruppens første kontakt. |
| S7.1 | S | Ja | P:97,198: fjernet tuple skal ramme både STRICT-parser og faktisk katalogafstemning. |
| SL7.1 | Leveret | Ja | P:198,204: fysisk kolonnemængde sammenholdes begge veje med klassifikation. S-1-B kræver særskilt fold-ind, A3-5. |
| SL6.2 | Leveret | Nej | P:189,211,298,331,563: årsagskontrakt, datoserialisering og konfigurationsaktør er ikke konsistente. A3-3/A3-4/A3-7. |
| SL7.3 | Leveret | Nej | P:201,204,563,565: normal mappingopsætning og aktiv retention er ikke båret. A3-4/A3-6. |
| T8.1 | I | Ja | P:210: effektivt UPDATE-grant; R+ opfylder policy/årsag og kan under mutanten skrive direkte. |
| T8.5 | I, R1; R9 udtaget | Ja | P:213: R1 har ingen indre gate, der skjuler den fjernede read-gate. |
| T8.6 | I | Nej | P:211,217: lovet scope er hele mutationsfladen; instanserne omfatter 18 W’er, mens fælles RPC-kontrakter er forkerte. A3-3. |
| SL8.1 | Leveret | Nej | P:91,211,563: fælles rettigheder og årsagsafvisninger er ikke fuldt kontraktbundet. A3-3/A3-4. |
| T9.1 | I | Ja | P:223,565: effektiv EXECUTE-revoke på W5 gør den lovlige API-handling utilgængelig. |
| SL9.1 | Leveret | Nej | P:114,211,232–242,563,573: fuld flade mangler konsistent effektfordeling, roller og variantkontrakt. A3-2/A3-3/A3-4/A3-5. |

Der er konkrete targeted kandidater for alle K-1..K-9, eksempelvis T1.1, T2.7, T3.2, T4.4, T5.6, T6.14, T7.5, T8.1 og T9.1. Det dokumenterer kandidatgulvet; det dokumenterer ikke drab eller fuldstændig negativdækning.

**3. Nye og fortsatte forhold A3-1..A3-8**

**A3-1 — BLOKER · kildebinding/fuld population · FA-5 er ikke opfyldt af den bundne kontrakt.**

Berører A2-14, A-13/U01, FA-5 og P-8 §1.2.

Citat: P:35 kræver »isoleret måltarget = eksplicit CI-projekt/DB-identitet« før plan-lås; P:743 gentager tidspunktet. Kildekontrakten:38–41 udskyder identiteten og omfortolker kravet til navngivne felter. JSON:17 indeholder fortsat en placeholder.

Kontrol af de fem felter:

| FA-5-felt | Båret |
|---|---|
| 1. Systemidentitet | Ja, som deklareret kildeidentitet: project-ref/database er navngivet. Ingen live-identitet attesteres. |
| 2. Hele populationen | Nej. Scope peger på `public.org_nodes`, `public.org_node_versions`, placements og employees. Den bundne kode placerer org-tabellerne i `core_identity`; `public.employees` droppes. MANGLER KILDE til den erklærede alternative placering. |
| 3. Projektion | Nej. Scope-SQL:26 lægger `node_type` på identitetstabellen; :30 bruger `id`/`parent_node_id` på versioner. Kilden har `version_id`, `parent_id` og `node_type` på versionstabellen. Afhængigheder beskrives som »alle kolonner der kræves«; org-closure er ikke konkret bundet som krævet i P-8:52. |
| 4. Eksplicit isoleret target | Nej, placeholder og modstridende bindingstidspunkt. |
| 5. Efter-build-bindinger | Ja, snapshot-tidspunkt, rækker, digests, run-id og nøgle er navngivet. |

Desuden lover scope-SQL:4–5,55–56 sammenligning af observeret katalog med **SQL-filens hash**. Der er ingen defineret fælles repræsentation eller forventet katalogdigest. En hash af definitionsfilen attesterer ikke resultatmængden.

Lukning: rettelses-OID for kontrakt/JSON/SQL og planbinding; korrekte relationer, konkret projektion inklusive afhængigheder, navngivne udeladelser, eksplicit target og entydig katalogkontrol. Efterprøv alle fem felter mod P-8:42–56 og P:35, ikke blot at filerne findes.

**A3-2 — BLOKER · D12/bijektion · effektfordelingen er stadig ikke prover-bevisbar som skrevet.**

Berører A2-9, NF-3, K-1/ac-4, K-6/ac-7, K-8/ac-4 og K-9/S.

Citat: P:234 kræver »PRÆCIS disse« effektobligationer; P:242 påstår `2 + 13 + 13 + 21 + 11 = 60`.

- P:240 oplister **10**, ikke 11, obligationer. K-9/S findes i matrixen P:226, men mangler både her og i Bid 5’s done-liste P:565.
- K-8/ac-4 har effekt-bid 4 og T8.2 på P:213. T8.2 står først som krævet drab i Bid 5, P:565. Det modsiger P:354’s regel om obligationens I-mutanter ved dens afslutning.
- K-1/ac-4 kræver hver read-RPC og alle pakkefunktioners output-/økonomikontrol på P:114, men afsluttes i Bid 2. R12 kommer i Bid 3; R13–R17 og I5–I8 senere. De senere dele har ingen tilsvarende slutbinding for denne obligation.
- T6.8 betyder to forskellige mutanter: **inde i R4** på P:155 og **R13’s argument til R4** på P:186. Et drab på førstnævnte i Bid 3 beviser ikke sidstnævnte. P:192,492,548 kalder det blot genobservation.

Lukning: én konsistent obligationsfordeling i matrix, bid-tabel og done-lister; eksplicit slutbinding for tværgående kontroller; entydige T6.8-instansankre og effekt-bids. Bevar begge relevante datoobservationer. Manifestets gamle skema indgår ikke i fundet.

**A3-3 — BLOKER · afvisningskontrakt/audit · K-8/ac-2 modsiger både sig selv og fundamentet.**

Berører A2-11/A2-13, R2-2, K-6/ac-10, K-8/ac-2, T8.6 og SL6.2/SL8.1.

Citat: P:211(d) lover »egen 22023-årsags-gate … + brugerens tekst i audit« og blank-årsagsnegativ for alle nævnte fælles RPC’er.

Det bæres ikke:

- `role_permission_grant_set` har ingen årsagsparameter; kilden sætter labelen `role_permission_grant_set`.
- `undo_setting_update` har ingen årsagsparameter; kilden sætter `undo_setting_update`.
- `replay_anonymization(text,boolean)` har ingen årsagsparameter; årsagen kommer fra eksisterende anonymiserings-state.
- `anonymization_mapping_test_run` skriver `test_run OK: ` efterfulgt af brugerårsagen.
- Normal `generic_apply` skriver `anonymization: ` efterfulgt af årsagen. P:332 tilføjer endnu en auditeret ændring med `anonymisering: `.
- P:211(a) lover samtidig brugerens tekst for alle W1–W18, mens P:211(e),298 korrekt binder W13–W16’s request-audit til `pending_change_request`.

K:161,185,274 bærer accepten af fundamentets approve/undo-labels. Det forsvar accepteres. Det lukker ikke de øvrige modstridende assertions.

Lukning: RPC- og hændelsesspecifik tabel med normal aktør, inputårsag eller arvet label, auditobservation samt hver faktisk negativs `sqlstate`, afvisningssted, grund og aktør. Bind de relevante targeted mutanter til denne fulde flade; fælles RPC’er må ikke forsvinde ved parametrisering over kun W1–W18.

**A3-4 — BLOKER · rolle/nåbar effektvej · R+-overlayet kan ikke udføre hele den beskrevne kæde.**

Berører A2-3/A2-4, K-7/ac-4, K-6/ac-10, K-9 og SL7.3/SL8.1/SL9.1.

Citat: P:563 giver R+ `anonymization_mappings/{test_run,approve,activate}`. P:201 kræver offentlig `anonymization_mapping_upsert`.

Upsert-kilden `ec3d9a0b:125–127` kræver **`anonymization_mappings/manage`**, som ikke er tildelt. De andre tab-grants giver ikke dette grant; `has_permission` søger den konkrete tab og derefter page/area/legacy.

P:189 kræver desuden ændring af et positivt undo-vindue gennem `undo_setting_update`; kilden kræver `pending_changes/settings`, også fraværende i overlayet.

Lukning: bind de nødvendige effektive grants og aktører i C0 og de berørte cases. Angiv særskilt C0-aktøren for rettighedstildeling. Normal kopis offentlige opsætning skal kunne nå mapping-/undo-værnet under den erklærede rolle; en tidligere 42501 må ikke krediteres som den tilsigtede afvisning.

**A3-5 — BLOKER · betinget plan/klassifikation · S-1-B er ikke en færdig, bygbar alternativ leverance.**

Berører FUND2-1, K-3/ac-3, K-7, K-8, K-9 og påstanden om begge udfald i P:757.

Citat: P:573 siger »Persondata designet UD af registret« og »registry-felter er ALTID `pii_level='none'`«.

Den konkrete variant sikrer ikke påstanden. Den tilføjer ingen beskyttelse mod fælles `data_field_definition_upsert(...,'grupper','fields',...,'direct',...)`. Et register uden egen `pii_level`-kolonne forhindrer ikke ændring af den fysiske containers klassifikation. Den eksisterende `_pii_klassifikation_guard` forbyder nedgradering, ikke `none → direct`. T7.11’s udtagelse mangler derfor et bærende værn.

Derudover:

- `gruppe_field_definitions_liste(p_antal, p_efter_key text, p_efter_id)` mangler fulde parametertyper og returkontrakt.
- Ny tabel og nye RPC’er er ikke foldet ind i de udtømmende katalog-/ACL-/handlingsmængder på P:198,210,215,565.
- Det nye required-negativ `K-3/ac-3/neg-4` har intet bundet kill. Den ene beskrevne mutant krediteres kun neg-3.

Lukning: afstem først S-1 efter A3-8. Skal varianten beholdes, bind dens fulde register, rettigheder, klassifikationsværn og effektobligationer. Vis den offentlige afvisning, der faktisk gør persondata-valget urepræsenterbart, og bind neg-4 til en meningsfuld mutantobservation. Fjernes varianten som led i den afstemte planbeslutning, skal henvisningerne rettes samlet.

**A3-6 — RET · krav/kill-list · T7.12’s udtagelse indsnævrer aktivt-valg-prøven.**

Berører A2-2, K-7’s opbevaringsvalg, T7.12 og SL7.3.

Citat: P:565: »event_based-vej … verificeres KUN som eksisterende konfig-indgang«.

Den autoritative kill-list:164 kræver udtrykkeligt: »C9 vælg en understøttet opbevaringsregel offentligt« og observer faktisk felt-erstatning gennem den udførende vej. SL7.3:172 gentager aktivt valgte retentionregler. K:137 gør opbevaring til UI-værdi.

Sætningen om kun at prøve aktivt valgte, understøttede regler begrænser regeltyperne. Den ophæver ikke det beskrevne aktive valg i prøven. K:142’s default uden retention er et andet positiv.

Lukning: bind et understøttet `event_based`-forløb med offentlig konfiguration, lovlig udløser, normal driftsrolle, konkret effektassertion og T7.12’s skip-mutant. Ingen ny executor for ikke-understøttede regeltyper kræves. En indsnævring af selve UI-forpligtelsen kræver Mathias’ ord.

**A3-7 — RET · data/tid · typet sammenligning gør ikke datoens transport DateStyle-uafhængig.**

Berører R2-7, AK-DATO-DRIFT, K-6/ac-10 og SL6.2.

Citat: P:82 lover »DateStyle-uafhængigt«. P:298 serialiserer datoen med `::text`; P:331 parser den senere med `::date`.

En dato som 3. april kan serialiseres som `03/04/2026` under SQL/DMY og fortolkes som 4. marts under SQL/MDY. Den typede driftkontrol vil da afvise en oprindeligt lovlig pending. En prøve med ens sessionsformat finder ikke hullet.

Lukning: bind et entydigt datoformat ved payloadproduktion og parsing. Tilføj den sekventielle request→apply-prøve med forskellige DateStyle-indstillinger og samme tilsigtede dato. En mutant, der genindfører formatfølsom transport, skal gøre den lovlige kæde rød. Ingen ekstra race kræves.

**A3-8 — AFSTEMNING / KRÆVER MATHIAS’ SVARBINDING · §10 og den udsendte devil-REN tekst er forskellige beslutningsgrundlag.**

Berører DV-1/DV-2, S-1/S-2, B-1/B-2/B-4/B-5, D-6/D-9/D-10 samt de tilknyttede fund ovenfor.

Citat: P:760 kalder sin tabel »Den samlede Mathias-liste«. Den er ikke identisk med den bundne, udsendte liste.

| punkt | plan v3 | devil-REN liste | rest |
|---|---|---|---|
| S-1 / DV-2 | P:573,757: spørgsmål med to varianter | :30–32: planens valg, orientering | Klassifikationen skal afstemmes. |
| B-2 | P:767: planvalg, men kræver ja/nej i ordlyden | :40–41: orientering om valget | Svarbehovet er forskelligt. |
| B-5 | P:769: bekræftelse/default | :17–20: ja/nej-spørgsmål | Ingen afsluttet svarbinding. |
| D-6 / DV-1 | P:775: synlig default, »lav« | :22–26: ja/nej-spørgsmål | Samme-dags-afvisningen er ikke afstemt. |
| S-2 | P:758: »altid anonymisérbar« betyder også afvisning af indirect-markeringen | :9–15: ja/nej til undtagelse; nej kan kræve ekstra arbejde | Svaret må ikke automatisk oversættes til variantens ændrede valgmængde. |
| B-1 | P:766: godkendelse 3/10 ⇒ virkning 3/10 | :34–38: også udløbet fortrydelsesfrist kræves | Planens eksempel lover for meget med dens 24-timers default. |
| B-4 | P:768: samme ønskede fremtidige dato ⇒ udelukkelse fra første dag | :43–47: ingen sådan garanti | Separate godkendelses-/apply-forløb kan træde i kraft på forskellige dage. |
| D-9/D-10 | P:778–779: nye selvstændige punkter | D-9 mangler; D-10’s grænse indgår i B-1 | Nye/omplacerede budskaber skal versions- og svarbindes. |
| S-3 | Ikke et selvstændigt spørgsmål | Udgået ifølge driverens disposition | Skal ikke genindføres som ubesvaret punkt. |

Jeg afgør ikke, hvilken klassifikation der skal have forrang. Lukning: Mathias’ faktiske svar bindes til den tekst, han modtog; driveren afstemmer derefter én samlet liste og en ny plan-OID. Berørte guards, varianter, negativer og datoeksempler efterprøves mod den afstemte tekst. »Noteret« lukker ikke DV-1/DV-2.

**4. Frit helhedspas**

| pas-2-spørgsmål | resultat |
|---|---|
| Kan lokalt rigtige dele tilsammen bryde K/C/N? | Ja: fælles RPC’er × universel auditassertion; rettighedsgrants × mapping-upsert; tekstlig datotransport × typet driftkontrol. A3-3/A3-4/A3-7. |
| Er bid-opdelingen afhængighedsordnet efter NF-3? | Flere flytninger er korrekte, men slutfordelingen er ikke konsistent. A3-2. |
| Er der bijektion uden manglende K eller rogue-bid? | Matrix og manifest har samme 60 unikke ID’er; de fem bids har K-bindinger. K-9/S mangler dog fra bid-/done-fordelingen. A3-2. |
| Er C0–C10/N1–N9 fortsat substantielt dækket? | De står fortsat i planen, men C0/C9 afhænger af åbne rolle-, audit-, retention- og kildekontrakter. Navngivne canaries alene lukker ikke disse. |
| Holder E20-snittet? | Ja som planlagt snit: præcis de to navngivne races, reel barriere/commit-observation, én permutationskopi og sekventiel genvalidering. Ingen yderligere concurrency-krav rejses. |
| Er held-out-prøven uafhængig og fuld? | Sondringen fra syntetiske fixtures står klart. Den konkrete kilde-/projektions-/targetbinding mangler fortsat. A3-1. |

**5. Blob-bindinger**

Alle forventede input-OID’er matcher filbytes kontrolleret med `git hash-object`. Planen har 871 linjer. Plan v2 er ikke læst; delta-kortet er anvendt som foreskrevet.

I tabellen betyder `L/` = `plan-build/lokations-skabelon/`.

| artefakt | blob-OID |
|---|---|
| L/plan.md | `c5f451f8a901c3fea23576de6aee1be0f2f51f5a` |
| L/b4-delta-scope-r3.md | `a97bdfb8916eb26e101edd0076e3557a0fdea917` |
| L/fold-ind-rapport-r3.md | `1b0240c1bf99115e265877ef83ff16d4be131488` |
| L/plan-angreb-r2.md | `0b2a36ca14e05a14459694b125fde3f84dc34ca5` |
| L/plan-audit-fresh-eyes-r2.md | `417d96b6244c1c1e613d4f9c3394995ed3793a04` |
| L/plan-slutlaesning-r2.md | `9f13a7cb726c76615605136a4641876ba7472892` |
| L/fund-log.md | `da00cabbc7b4bbbc0299a656370f248d0567712a` |
| L/kill-list-udkast.md | `13b783927f4fed107caa0e849e65499fd3291b61` |
| L/forventningsliste-udkast.md | `2200b76e29b52f7084c0bfe003c0a2e8121c2346` |
| docs/sandhed/krav/lokations-skabelon-krav.md | `9402164d87a35fb939661058bea77c1a052493d0` |
| L/recon2.md | `2bdbb122158b6f8c72fc942b8de28e679742b4aa` |
| recon/recon-2-bilag.md | `6e569779353ea1d0a2bf747ce6eda6509de1aea0` |
| L/p8-slutproeve-spec.md | `4af07ef4164882ca54643e79df3554c0bf22b0e4` |
| L/mathias-ord.md | `14722b4c17fba1011709525ef4a06a7cabe2cfa8` |
| L/ordbog.md | `bcab6b4ed9c9c0fe21f13c70d8e1d47a2afd9fef` |
| docs/workflow-faerdiggoerelse/workflow-implementeringsplan.md | `0fdd5b1e09d38be8a47fdd616b837446179eb767` |
| L/p8-kildekontrakt.md | `ff0a09c24675afe9f3ce4da0284224bd83140a97` |
| L/p8-kilde.json | `9184acc857cec92e1e9b9442e4097cb3f1133d63` |
| L/p8-kilde-scope.sql | `44df7b73b4d223a8ecf6e0e895965c934ebf728d` |
| L/spoergsmaal-plan-r2.md | `598f98fd022d09dfa82beded36f5d4eb4101ba18` |
| L/forventnings-manifest.json | `cd15f16f6cd00f0009efddc4dac435b665c59742` |

JSON/SQL-blobberne ovenfor er afledte bindinger; opgaven angav ingen forventet OID for dem. Scope-SQL’s SHA-256 matcher kontraktens `f3347b82df20c528637e11473871072e61d4d8c00ac9678fee8627165c46fd9b`.

Supplerende kildebelæg, også hash-verificeret. `M/` = `supabase/migrations/`.

| kilde | blob-OID |
|---|---|
| supabase/config.toml | `011818baf19747943671dbe65dc987a9216574d0` |
| M/20260518000001_t9_org_nodes.sql | `71cadac316a633ed7f58762755b4fd13ed2fe404` |
| M/20260514120000_t1_drop_public.sql | `2455be659e4dbf934340e43178a89cc8021b19a0` |
| M/20260515120000_p2_anonymization_mapping_lifecycle.sql | `ec3d9a0bb5bb188105feba1efdd714ab7b8a448c` |
| M/20260515140000_r7h_anonymize_generic_apply_state_insert_fix.sql | `6083fecd79ff6ba167dd12222144824c02a78d2e` |
| M/20260515130000_r7a_regprocedure_callable_fix.sql | `6f0e1db3eca18a225d66ae627b6872289c3c0e9b` |
| M/20260515110100_p1a_anonymization_strategies.sql | `d69ea57e1c4567f66cda044fcbd794a78a30a604` |
| M/20260607110001_core_identity_secdef_pending_change.sql | `ae336ee67bbb960739d252863e3785d4b2804e40` |
| M/20260518000000_t9_pending_changes.sql | `c3b2865c5b72b5b899454507a1e48a2656dfe540` |
| M/20260514160000_t1_inline_fix_audit_non_uuid_id.sql | `e3cfa9fefc635b2658af2eb7be5dea0d70614975` |
| M/20260514190200_q_class_anon_rpcs.sql | `b9f976338ddde79ec97538173a617246b23342ff` |
| M/20260607110002_core_identity_secdef_role_permission_grant.sql | `b19ef09f0a354ae35b8175d19f8023dbb222b03b` |
| M/20260607110003_core_identity_secdef_undo_setting.sql | `fab7af0d62e86f100e29d612ab57a96428d4cc99` |
| M/20260518000010_t9_seed_owners.sql | `07ec8a8e600e16493506423b42e42aa7cab9b05f` |

Commit `4716507df4887b54a4ab878e4db68c5b30c7d335` og rollebindningen `f6e64979941b` er driveroplysninger; commit-/tree-medlemskab kan ikke attesteres uden `.git`. Ingen web, læsning uden for workdir eller filændringer indgår.