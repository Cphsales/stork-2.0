# B2 — forventningsliste (UDKAST) — lokations-skabelon, plan v2

**Status: UDKAST** — skrivebordsarbejde af driver-10b 2026-09-09, uden aktør. Låses først i Trin B
(GRUNDPLAN-v2 B2) efter (a) Codex har vist at måle-adapteren kan udtrykke de fire bevisformer, og
(b) fold-ind (B3) har givet hver ⚠-række én af tre tilstande. Listen bruges til BÅDE at producere
beviset (planner-Code skriver plan v2's matrix mod den) og kontrollere det (Codex-angreb ·
fresh-eyes · code-reviewer dømmer mod den; build-proof/prover får den som input, GRUNDPLAN-v2 C1).

**Bindinger (alle @ HEAD bd5c51a):** krav `9402164d` (K:linje = linje i krav-blobben) · plan v1
`423d9b20` @ ec4a3d9 (P:linje — v1 er UDKAST; rækker mærket ⚠ har åbne fund i `fund-log.md`) ·
P-8 `4af07ef4` (T:N-canary · T:C-step · T:§) · ledger M-1..M-41 · recon2 `2bdbb122` (R, som citeret
af plan v1) · fund-log (A-n angreb · FUND-n fresh-eyes plan-audit · F/U kildetjek) · M-40 E20
(P-8-beskæring) · D10 (mutant-regel). Kolonnen »acceptkriterie (kort)« er driverens komprimering —
K:linjen er autoritet.

---

## 0. De fire bevisformer (udfald) — definitioner

| kode | udfald | hvad prøven gør | falsk-grøn-kanalen den lukker |
| --- | --- | --- | --- |
| **UT** | ulovlig tilladelse | forsøg på det forbudte via offentlig indgang, med en rolle der FØRST har bevist adgang via et lovligt søsterkald → navngiven afvisning (SQLSTATE/domænefejl) OG uændret backing store | generel adgangsnægtelse, 404, timeout, catch-all og »anden fejlkode« tæller ikke (T:§3.1); superadmin prøves også på strukturforbud |
| **FS** | forkert slutværdi | lovlig handling → hård observation (DB-row · oracle-svar · opslag pr. dato) matcher det uafhængige forventningsorakel (T:§4.1); historiske datoer genlæses efter hvert step (T:§4.3 Historie) | helper-return, audit-alene, produktets egne PASS-strenge, »kolonnen findes« |
| **MH** | manglende handling | den lovlige handling KAN udføres af legitim non-admin via app-fladen uden tekniske privilegier, OG de krævede sideeffekter sker (audit-række, historik-event, afledt frakobling, straks-synlighed) | død API-flade, glemt EXECUTE/DML-grant, glemt dispatcher-gren, bypass-rolle der skjuler manglen |
| **SA** | samtidighed | to uafhængige DB-sessions med dokumenteret barriere → invarianten holder efter commit; KUN de to E20-races (§3) | sekventiel »race«, kodeinspektion som kill (A-12 · F12), manuel reparation af mellemresultat |

**Regler for tildeling:** hvert AFVISES-ac har UT · hvert »AFVISES IKKE«/»MÅ«/»kan« har MH (positiv
kontrol) · hvert opslags-/historik-ac har FS med historisk genlæsning · et strukturforbud (kravets
»umuligt«-liste) bevises som »designet UD« (schema-assert + DML→42501) OG med en UT-negativ på den
offentlige flade hvor én findes — strukturelt urepræsenterbare input skal eksplicit afvises, ikke
tælles som »testes ikke« (T:150). **Mutant (D10):** én meningsfuld dræbt mutant pr. afvisnings-ac
hvis værn ALENE bærer negativet — aldrig pr. konfig-knap. Kolonnen »frø« nedenfor er krydsreference
til plan v1's kill-list-UDKAST / angrebets pr.-K-tabel / T:§3.3; **Codex' blinde kill-list (B1,
`kill-list-udkast.md`) er autoritet**, ikke denne kolonne.

---

## 1. Forventninger pr. K

### K-1 Lokation som central master-data (K:17-31 · P:26-36 · T:N1 · C2/C3)

Strukturforbud (K:21): lokation uden navn · type uden for listen · lokations-data spredt uden for
master-kilden · lokation som attributions-/økonomi-dimension · sær-mekanik pr. lokations-type.

| ac | acceptkriterie (kort) | negativ (forsøg → forventet) · positiv kontrol | bevisform | effekt-bid (P v1) | canary · chain-step | kildeankre | frø (krydsref.) | ⚠ åbne fund |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | blankt/manglende navn AFVISES | `lokation_opret` m. NULL/blank/whitespace-navn, som rettighedshaver OG som app-superadmin → 22023; ingen halv lokation/stand. Positiv: lovlig opret virker | UT · MH | 2.2 | N1 · C2 | K:25 · P:30 · T:149 · M-24 | P K-1(a) | — |
| 2 | type uden for {butik, messe, marked, event, andet} AFVISES | ugyldig/seedet fremmed type → 22023. Positiv: alle fem typer accepteres (C2: L3..L5 dækker alle) | UT · MH | 2.2 | N1 · C2 | K:26 · P:31 · S-16 | P K-1(b) | — |
| 3 | prisændring ændrer ALDRIG fortiden; hvad gjaldt hvornår kan altid ses | P1@D1, P2@D2 → opslag(D1)=P1, opslag(D2)=P2; standens ARVEDE pris følger samme datoer; forsøg på at omskrive D1 → afvist; UPDATE/DELETE på pris-historik → P0001; direkte DML → 42501; genlæs D1/D2 igen ved C10 | FS (historisk) · UT | 2.1+2.2 | N1 · C3 · C10 | K:27 · P:32 · T:149,215,230 · princip 9 | P K-1(d)(e)(f) · T K-1/N1 | ⚠ A-10 · F06 (UTC-dato-cast realiserer ikke deklareret semantik) · S-4/S-5 tie-semantik skal være bundet og testes på kanten |
| 4 | ingen økonomi-/attributions-kobling på lokationen | schema-assert: ingen FK/kolonne mod core_money; fitness CROSS_SCHEMA_FK grøn; leverance-negativ: injicér økonomi-/attributionsreference i build-kopi → rød — OGSÅ i JSONB/udgående RPC-data, ikke kun FK-navne | UT (leverance-negativ, CI-dommer) | 2.1 | N1 | K:28 · P:33 · T:149 · forretningsforståelse §3/§14 | P K-1(g) | ⚠ A-15 · U10 (måleren dækker kun schema/FK) |
| 5 | oprettelse/ændring kræver ALDRIG udvikler | = K-9 ac 1-harness: alle handlinger via granted SECDEF-RPC som authenticated; psql-/service-privilegier aldrig nødvendige | MH | 2.2 / 5.2 | N9 · C0-C10 | K:29 · P:34 | — | — |

### K-2 Stande under lokation (K:33-50 · P:38-49 · T:N2, N2-B · C2/C6/C8 · §4.3 SA)

Strukturforbud (K:37): cykler · stand uden entydig pris-opløsning · to klienter på samme stand
samtidig · stand uden lokation · lokation uden stande · under-stande · booking på stand under
ikke-aktiv lokation · stande der forsvinder ved nedlæggelse.

| ac | acceptkriterie (kort) | negativ (forsøg → forventet) · positiv kontrol | bevisform | effekt-bid | canary · chain-step | kildeankre | frø | ⚠ åbne fund |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | cyklus i hierarkiet AFVISES | designet UD (to-tabel, S-1): pg_catalog-assert ingen self-FK/parent-kolonne; DML som authenticated → 42501. **OG** offentlige input »selv-parent · længere cyklus · stand under stand · ukendt lokation« skal EKSPLICIT afvises (T:150), ikke »kan ikke udtrykkes« | UT (struktur + eksplicit) | 2.1 | N2 | K:41 · P:42 · T:150 · S-1 | P K-2(f) | ⚠ FUND-4 (V-A → S-1) · plan v1 har kun schema-assert — eksplicit input-afvisning mangler |
| 2 | stand uden egen pris læses med lokationens; aldrig to sandheder | egen pris → egen; NULL → lokationens; reset → lokationens igen; 0 ≠ NULL (V11); læses på samme dato som lokationens pris | FS | 2.2 | N2 · C3 | K:42 · P:43 · T:150,215 · V11 | P K-1(c) | ⚠ U05 (numeric-afrunding/overflow-udfald ubundet) |
| 3 | stand under dvale/nedlagt er IKKE bookbar | `stand_er_bookbar` → false under dvale/nedlagt for ALLE lokationens stande; true under aktiv; følger K-4's aktiv-opslag pr. dato | FS | 3.1 | N4 · C5 | K:43 · P:44 · T:152 | P K-2(e) | overdragelse N4-B (booking-skrivevej) → trin 24 |
| 4 | én klient pr. stand ad gangen — trin 24 håndhæver | stand-id er stabil identitet; bookbar-flade leveret til trin 24. **Dobbeltbooking = N2-B → `downstream_dependency: trin-24`, ALDRIG runtime-PASS** | FS (identitet) | 2.1/2.2 | C2 · (N2-B overdragelse) | K:44 · P:45 · T:163 · M-29 | — | — |
| 5 | nedlæggelse sletter ingen stande | samme stand-id'er og -antal før/efter nedlæg+genåbn; ingen delete-grant/-policy/-RPC (DML → 42501) | FS · UT | 3.1-test | N2 · C6 · C8 | K:45 · P:46 · T:150,218,220 · M-14 | P K-2(d)(f) | — |
| 6 | ejerkæden kan IKKE brydes; mindst én stand | opret uden første stands navn → 22023; deaktivér sidste aktive stand → P0001; FK NOT NULL begge led; under-stande kan ikke udtrykkes (+ eksplicit afvist, ac 1). **SA (E20-race 1):** to sessions deaktiverer hver sin af lokationens to sidste aktive stande → præcis én fejler; ingen committed tilstand med nul aktive stande | UT · SA · FS (min-1-assert efter opret) | 2.2 | N2 · C2 · T:§4.3 SA | K:46 · P:47 · T:150,231 · M-17 · M-18 · V6 | P K-2(a)(b)(c) · T K-2/N2 | ⚠ A-12 · F12 (to-sessions-bevis må IKKE nedgraderes til residual/kodeinspektion — plan v1 B-3 @ P:600 strider mod T:169,231) |

### K-3 Gruppe (leverandør) som ejer (K:52-67 · P:51-62 · T:N3 · C1/C2/C4/C7)

Strukturforbud (K:56): lokation uden gruppe · gruppe som fritekst på lokationen · gruppe uden navn ·
klient på en lokation uden at være koblet på lokationens gruppe.

| ac | acceptkriterie (kort) | negativ (forsøg → forventet) · positiv kontrol | bevisform | effekt-bid | canary · chain-step | kildeankre | frø | ⚠ åbne fund |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | lokation uden gruppe AFVISES | `p_gruppe_id` NULL → 22023; ukendt gruppe → P0002; kolonnen NOT NULL | UT | 2.2 | N3 · C2 | K:60 · P:55 · T:151 | — | — |
| 2 | gruppe kun som reference til gruppe-entitet | ingen tekst-kolonne (schema-assert); ukendt uuid → P0002; fritekst-gruppe som input → afvist | UT (struktur) | 2.1 | N3 | K:61 · P:56 · T:151 | — | — |
| 3 | gruppe uden navn AFVISES | `gruppe_upsert` blankt navn → 22023. Positiv: G og H oprettes m. navn, stabile separate identiteter (navne må kollidere i variant — identitet afgør) | UT · MH | 1.2 | N3 · C1 | K:62 · P:57 · T:151,213 · M-17 | P K-3(c) | — |
| 4 | klient på gruppen arver ALLE lokationer, også senere; til-valg uden for gruppen AFVISES | kobl C1/C2 på G → ret på L1, L2 OG senere L3..L5; C3 (H) arver ikke G; fravalg-ophæv af klient uden kobling → 22023 `klient_ikke_i_gruppen` | FS (afledt ret, V8) · UT | 4.2/4.3 | N3 · C1 · C2 · C4 | K:63 · P:58 · T:151,214 · M-17 · M-36 | P K-3(e) · T K-3/N3 | — |
| 5 | gruppe med lokationer kan IKKE slettes | DELETE som authenticated → 42501; ingen delete-RPC; FK RESTRICT bagstopper; slet G med L1/L2, også når L1 er nedlagt → afvist, G/L/stande/historik består. Udfasning = `is_active=false` (V13): ny lokation/kobling på inaktiv gruppe → 22023 (superadmin-bypass tilladt — forretningsvagt, S-7); eksisterende retter består | UT · FS | 1.2+2.1 | N3 · C7 | K:64 · P:59 · T:151,219 · princip 9 · V13 | P K-3(b)(d) | — |
| 6 | lokation kan fravælge klient gruppen har; øvrige lokationer uberørte; ophæves igen | fravælg C1 på L1@D3 → ret(C1,L1)=false fra D3, ret(C1,L2..L5)=true, ret(C2,L1)=true; ophæv → true igen; dobbelt fravalg → 22023 | FS · UT · MH | 4.2/4.3 | N3 · C4 | K:65 · P:60 · T:151,216 · M-17 | — | via pending-vej (K-6 ac 10) — samme ⚠ som dér |

### K-4 Status-livscyklus (K:69-87 · P:64-78 · T:N4 · C5-C8)

Strukturforbud (K:73): booking på ikke-aktiv lokation · status uden for de tre · skift uden årsag ·
overskrevet/slettet status-historik · status-skrivning uden om den dedikerede handling.

| ac | acceptkriterie (kort) | negativ (forsøg → forventet) · positiv kontrol | bevisform | effekt-bid | canary · chain-step | kildeankre | frø | ⚠ åbne fund |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | status uden for {aktiv, dvale, nedlagt} AFVISES | ugyldig værdi → 22023. Positiv: hver af de tre kan sættes; alle overgange mellem forskellige statusser tilladt (S-2) | UT · MH | 3.1 | N4 · C5-C8 | K:77 · P:68 · T:152 · M-25.1 | — | — |
| 2 | skift uden årsag AFVISES; hvert skift auditeres | blank årsag → 22023; audit-række med brugerens `change_reason` pr. skift (assert via audit-læsevej — ikke fixture-global årsag) | UT · FS (audit-række) | 3.1 | N4 | K:78 · P:69 · T:152,240 | P K-4(f) | — |
| 3 | status kun via dedikeret handling | direkte INSERT som authenticated → 42501; `lokation_rediger` har ingen status-parameter (signatur-assert); status via almindelig stamdata-upsert → afvist | UT | 2.1+3.1 | N4 | K:79 · P:70 · T:152 | P K-4(g) | — |
| 4 | status-historik kan ikke overskrives | UPDATE/DELETE/TRUNCATE på event-loggen → P0001 (alle tre) | UT | 2.1 | N4 · N8 | K:80 · P:71 · T:152 | P K-4(d) | ⚠ F05 (triggerens sikkerhedskontekst/FORCE-begrundelse forkert — fastlæg ejer/SECDEF/ACL) |
| 5 | aktiv-opslag pr. dato svarer entydigt | forløb aktiv→dvale(m. ophør)→afledt aktiv på ophørsdagen→nedlagt→aktiv genlæses korrekt på hvert knæk og på kanterne (S-4 halvåben; samme-dags start+stop → seneste event gælder); gælder alle lokationens stande | FS (historisk) | 3.1 | N4 · C5 · C10 | K:81 · P:72 · T:152,217,230 · S-4 | P K-4(a)(b) · T K-4/N4 | ⚠ A-10 · F06 (UTC) · Bid 3 angrebs-spec-krav (P:334) · booking-afvisning = N4-B → trin 24 |
| 6 | til-/fravalg MÅ ske i dvale | pending-flow gennemføres mens L1 er i dvale — AFVISES IKKE; prøven skelner ret=true (dvale) fra bookbar=false | MH · FS | 4.2 | N4 · C5 | K:82 · P:73 · T:152,217 · M-27a | — | — |
| 7 | genåbning af nedlagt er MULIG via samme handling | `lokation_saet_status('aktiv')` på nedlagt → bookbar igen; auditeret m. årsag; ingen manuel genindsættelse af klientretter | MH · FS | 3.1 | N4 · C8 | K:83 · P:74 · T:220 · M-28 | — | — |
| 8 | til-valg på nedlagt AFVISES | fravalg-ophæv/tilvalgsrequest på nedlagt → 22023 `lokation_nedlagt` — OGSÅ som app-superadmin (S-7: strukturvagt, ingen bypass) | UT | 4.2 | N4 · C7 | K:84 · P:75 · T:152,219 · M-30.2 · M-13 | — | — |
| 9 | nedlæggelse kobler alle af (afledt), stande + historik består, gruppe uberørt; genåbning arver gruppens DA gældende klienter | nedlæg@D6: `lokation_klienter(L1, D≥D6)` = ∅, `(L1, D<D6)` uændret; koblings-/fravalgs-rækker uberørte; G's medlemskab og L2..L5/H intakte; stande består. Genåbn@D8: C3 (koblet på G under nedlagt) arves automatisk; C1 (frakoblet D7) vender ikke tilbage; C2 følger det FØR build låste fravalgsvalg (V8: fravalg BESTÅR → ingen ret før ophævelse); D6≤D<D8 giver fortsat ingen ret | FS (historisk + lokalitet) | 4.3 | N4 · C6 · C7 · C8 | K:85 · P:76 · T:218-220,229 · M-14 · M-19 · M-13 · V8 | P K-4(c) · T K-4/N4 | ⚠ FUND-1-note (citér »da gældende« som M-19 + E057/V8) |

### K-5 Hvile (cooldown) (K:89-107 · P:80-90 · T:N5 · C5)

Strukturforbud (K:93): booking under hvile · »book alligevel«-fravigelse · automatisk hvile uden
valgt antal hviledage · hvile-konfig-ændring uden rettighed/audit · periode-afslutning uden
rettighed/audit.

| ac | acceptkriterie (kort) | negativ (forsøg → forventet) · positiv kontrol | bevisform | effekt-bid | canary · chain-step | kildeankre | frø | ⚠ åbne fund |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | booking på hvilende AFVISES; INGEN omgåelse | `lokation_er_bookbar` under dvale → false for ALLE klienter (ingen klient-parameter); C1 og C2 afvises begge; gentag som app-superadmin og med hver eksponeret override-/force-parameter → ingen bypass virker; pg_catalog-assert: ingen pakke-RPC har override-parameter | UT (fraværs + eksplicit) · FS | 3.1 | N5 · C5 | K:97 · P:84 · T:153 · M-27b | P K-5(d) · T K-5/N5 | booking-skrivevej = N5-B → trin 24 |
| 2 | stop før tid uden rettighed AFVISES; med rettighed → aktiv, auditeret | E2 uden stop-ret → 42501, periode uændret; med ret + årsag → bookbar flipper straks, audit-række | UT · MH · FS | 3.1 | N5 · C5 | K:98 · P:85 · T:153,217 · M-27b | P K-5(c) | — |
| 3 | ændring af hviledage uden rettighed AFVISES; med → straks, auditeret | uden ret → 42501; blank årsag → 22023; med ret → ny værdi straks synlig ved genlæsning (ingen godkendelses-trin — kravets bekræftelses-linje M-29.5); må IKKE tvinges gennem den daterede kø (T:224) | UT · FS · MH | 3.1 | N5 · C5 | K:99 · P:86 · T:153,224 · M-29.5 · V10 | P K-5(a)(c) | bekræftelses-linjen står i kravet (blokerer ikke) |
| 4 | ændring kræver ALDRIG udvikler | = K-9 ac 1 (samme RPC, granted) | MH | 3.1 | C5 | K:100 · P:87 | — | — |
| 5 | auto-hvile KUN ved valgt antal; enhed = dage | ny lokation: hviledage NULL; ingen mekanik udløser dvale af sig selv i pakken; 0/negativ → 22023 (CHECK ≥1 bagstopper); L2 uden valg: »default hvile« kan ikke accepteres som lovlig konfigurationstilstand; ingen manuel dvale slettes for at nå positivet | FS · UT | 2.1+3.1 | N5 · C5 | K:101 · P:88 · T:153 · M-21 · M-25.2 · V9 | P K-5(b) | ⚠ F11 (fjernet CHECK ændrer ikke public 0-prøve — mutanten skal ramme den autoriserede sti) · auto-udløsning = trin 24 (scope-ærlighed K:105) |

### K-6 Klient-tilladelser (K:109-130 · P:92-107 · T:N6 · C1/C4/C6-C8 · §4.3 SA/Replay)

Strukturforbud (K:113): klient på lokation uden kobling på gruppen · til-valg uden for gruppen ·
kobling uden klient eller gruppe · dobbelt kobling · til-valg på nedlagt · nedlagt lokation med
aktive klienter · sletning/omskrivning af historik · booking uden gældende ret (trin 24 forbruger).

| ac | acceptkriterie (kort) | negativ (forsøg → forventet) · positiv kontrol | bevisform | effekt-bid | canary · chain-step | kildeankre | frø | ⚠ åbne fund |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | kobling uden klient/gruppe AFVISES | manglende/ukendt → P0002; NOT NULL FK'er | UT | 4.1/4.2 | N6 | K:117 · P:96 · T:154 | — | — |
| 2 | dobbelt kobling AFVISES — én sandhed | dobbelt C1×G → 22023 (wrapper OG apply-handler); partial UNIQUE 23505 + EXCLUDE 23P01 = bagstoppere. **SA (E20-race 2):** to samtidige dublet-requests → ingen dobbelt aktiv relation efter commit | UT · SA | 4.1/4.2 | N6 · T:§4.3 SA | K:118 · P:97 · T:154,231 | P K-3(a)/K-6(a) · T K-6/N6 | Bid 4 angrebs-spec-krav (P:425) |
| 3 | kobling uden slutdato AFVISES IKKE | åben kobling (`gaeldende_til` NULL) = normaltilstand; accepteres | MH | 4.2 | N6 · C1 | K:119 · P:98 · T:154,213 · M-12 · M-17 | — | — |
| 4 | arv til alle + senere lokationer; til-valg uden for gruppen AFVISES | = K-3 ac 4 | FS · UT | 4.3 | N6 · C2 | K:120 · P:99 | — | — |
| 5 | fravalg rammer kun den lokation; ophævelse genskaber | = K-3 ac 6 | FS · MH | 4.2/4.3 | N6 · C4 | K:121 · P:100 | — | — |
| 6 | frakobling fra dato; fortid uændret; historik-omskrivning AFVISES | frakobl C1 fra G@D7: alle G-lokationer mister ret FRA D7, D<D7 uændret, H-ret består; UPDATE af lukket række/andre kolonner → P0001; DELETE → P0001 | FS (historisk) · UT | 4.2/4.3 | N6 · C7 · C10 | K:122 · P:101 · T:154,219,230 · M-13 | P K-6(j) | ⚠ F10 (forbillede-attribution forkert) |
| 7 | opslaget »må X stå på Y på D?« entydigt, også historisk | tre daterede led (gruppe-på-dato · fravalg-på-dato · status-på-dato) læst på SAMME D; `read()` = `read_at(current_date)` under samme rolle; alle observerede datoer genlæses efter hvert step | FS | 4.3 | N6 · C4-C8 · C10 | K:123 · P:102 · T:193-201,230 · V8 | P K-6(b)(c)(d) · T K-6/N6 | ⚠ A-6 (INVOKER-orakel kan svare falsk pga. anden sides RLS) |
| 8 | flere klienter samtidig AFVISES IKKE | C1 + C2 har begge ret på L1; C1 også koblet på H (kardinalitets-positiv) | MH · FS | 4.3 | N6 · C1 · C2 | K:124 · P:103 · T:154,213 · M-29.1 | P K-3(a) | — |
| 9 | nedlæggelse kobler af (afledt); genåbning arver | = K-4 ac 9 | FS | 4.3 | N6 · C6-C8 | K:125 · P:104 | — | — |
| 10 | uden rettighed AFVISES; daterede ændringer: godkendelse + fortrydelse | uden ret → 42501; request → synlig pending for RETTE godkender → approve (self-approve-forbud) → undo-vindue → apply; undo før frist → ingen effekt; apply før frist/dato → ingen effekt; undo efter apply → 22023 (S-10); godkendt due ændring anvendes PRÆCIS én gang; genkørsel af anvendt job → ingen ekstra relation/historik (T:§4.3 Replay); reelt positivt undo-vindue + planens grænser prøves — 24 t-fallback er ikke bevis | UT · FS · MH | 4.2 | N6 · C4 · C6 · T:§4.3 Replay | K:126 · P:105 · T:154,216,224,232 · V10 | P K-6(e)(f)(g)(h)(i)(k) | ⚠ A-9 · U04 (apply-dato > payload-dato → historikændring eller dødt pending-flow) · F07 (self-approve-forbud kun for non-admin i forbilledet) · U03 (pending synlig for rette godkender kræver række-synlighedskontrakt) · U07 (testkontekster) |

### K-7 Klassifikation, persondata, anonymisering (K:132-145 · P:109-118 · T:N7 · C9)

Strukturforbud (K:136): uklassificeret kolonne i leverancen · sletning som anonymisering ·
**nedgradering af persondata-niveau (direct → lavere)** · implicit persondata/retention uden aktivt
valg.

| ac | acceptkriterie (kort) | negativ (forsøg → forventet) · positiv kontrol | bevisform | effekt-bid | canary · chain-step | kildeankre | frø | ⚠ åbne fund |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ingen uklassificeret kolonne — gaten blokerer | migration-gate STRICT: tuple i SAMME fil som DDL; fjernet tuple for én fysisk katalogkolonne → gate exit 1 (CI-negativ) | UT (leverance-negativ) | 1.1/2.1/4.1 | N7 | K:140 · P:113 · T:155 | — | ⚠ F02 (kategori `historik` findes ikke i registryets CHECK → 23514) |
| 2 | kontaktperson kan anonymiseres; rækken består; sletning AFVISES | e2e: mapping → activate → anonymisér → navn/email/telefon ERSTATTET (værdi-assert, aldrig kun `anonymized_at`/errors=0); række, gruppe, lokations-koblinger og audit består; DELETE → 42501; dobbelt anonymisering → P0002; replay med NYPRODUCERET snapshot → samme beskyttende effekt; ret-/pris-/statusopslag gentages efter (C9); anonymiseret række låst for nye personværdier (S-11) | FS · UT · MH | 5.1 | N7 · C9 | K:141 · P:114 · T:155,221,232 · §11 | P K-7(b)(c)(f) · T K-7/N7 | ⚠ A-5 (lifecycle på seedet mapping) · F08 (»0 ny kode«) · F09 (forbillede) · F13 (låse-påstand vs ubetinget UPDATE) · F14 (snapshot-konflation) |
| 3 | uden aktivt valg: intet felt persondata, ingen retention | data-assert mod feltdefinitioner: `direct` KUN kontakt.{navn, email, telefon}; `indirect` KUN lokationer.adresse; alt andet `none`; retention NULL overalt; ny uvalgt kolonne fødes none/NULL | FS | 1.1/2.1/4.1 | N7 | K:142 · P:115 · T:155 · princip 4 · S-13 | P K-7(a) | ⚠ U09 (»navne kategorisk ikke-persondata« er deklareret læsning — skal stå som valg, ikke nødvendighed) |
| 4 | ingen persondata-felt uden anonymiserings-vej; lokations-anonymisering aktiveres ved aktiv persondata-klassifikation | mapping uden strategi for en direct-kolonne → P0001 coverage; dæknings-e2e grøn; **kravets ord er »persondata« — plan v1 klassificerer adresse `indirect` OG holder lokations-anonymisering inaktiv m. »ingen direct-felter«** | FS · UT | 5.1 | N7 · C9 | K:143 · P:116 · T:155,221 | P K-7(e) | ⚠ A-4 · F03 · FUND-1 · U06 — SAMME hul fra tre kilder: v2 skal ENTEN deklarere læsningen »persondata = direct« synligt (S-13) ELLER klassificere adresse `none` m. recon-flag noteret ELLER levere vejen. Én af tre — ikke tavst |
| (struktur) | **nedgraderingsforbud** direct → lavere; delete/recreate-omgåelse | nedgradér et aktivt valgt direkte personfelt til indirect/none, OGSÅ som app-superadmin → afvist; delete + recreate som none → afvist; fysisk klassifikationsværn (ikke kun client-field-registry) | UT | — (ingen række i plan v1) | N7 | K:136 · T:155 · R:354/E116-117 | T K-7/N7 | ⚠ A-3 · F04 — INGEN matrix-række bærer forbuddet i plan v1 → v2 skal have en række (ac-niveau) m. udførende kode + negativ |

### K-8 Adgang, audit, fortrydelse (K:147-161 · P:120-130 · T:N8 · C0)

Strukturforbud (K:151): direkte tabel-skrivning uden om indgangene · mutation uden årsag ·
ændret/slettet audit-spor · lokations-særskilt rettigheds-mekanisme uden om den fælles model.

| ac | acceptkriterie (kort) | negativ (forsøg → forventet) · positiv kontrol | bevisform | effekt-bid | canary · chain-step | kildeankre | frø | ⚠ åbne fund |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | skrivning uden om godkendte indgange AFVISES — uanset rettigheder | INSERT/UPDATE/DELETE/TRUNCATE på HVER ny tabel som anon og authenticated, også med selvsat write-var → 42501/permission denied; EXECUTE på interne handlers → 42501; faktisk non-bypass DB-rolle verificeret (`SET LOCAL ROLE authenticated`, rolbypassrls, ejerskab) — et JWT under postgres er ikke RLS-bevis | UT | 1.1 | N8 · C0 | K:155 · P:124 · T:156,240 · §1.1 | P K-8(a)(e) · T K-8/N8 | ⚠ A-1 · F01 (T10-hale genindfører app-DML-grants) · A-7 · U07 (JWT-sim/superadmin binder ikke non-bypass) · U02 (interne funktioner uden revoke/ACL) |
| 2 | mutation uden årsag AFVISES | parametriseret negativ-suite over ALLE pakkens write-indgange inkl. pending-wrappers m. blank årsag → 22023; transaktionslokale vars nulstilles mellem aktører (fixture-global årsag forbudt); apply-handler bærer brugerens årsag (S-9) | UT | 1.2+ | N8 | K:156 · P:125 · T:156,240 · S-9 | P K-4(f) · K-6(k) | ⚠ U07 (trigger-P0001 vs 42501 — to testkontekster skal bindes eksplicit) |
| 3 | ændring/sletning af audit-spor AFVISES | UPDATE/DELETE på audit + pakkens tre historik-tabeller → P0001 | UT | 2.1 | N8 | K:157 · P:126 · T:156 · §1.3 | — | ⚠ F05 (triggerkontekst) |
| 4 | uden rettighed AFVISES; læsning uden synlighed giver ingen data | view-only: read-RPC'er svarer, write → 42501; uden synligheds-grant: read giver ingen data — **nul rækker/false er et FS-udfald der skal asserteres, ikke fravær af fejl**; usynlig læsning giver ingen fremmede pending-payloads | UT · FS (nul rækker) | 1.2 | N8 · C0 | K:158 · P:127 · T:156,212 · §12 | P K-8(e) | ⚠ U03 (tværside-/række-synlighedskontrakt: 42501 / false / delvis liste?) · A-6 |
| 5 | sider/handlinger tildelbare fra dag ét; superadmin dækket | permission-matrix-smoke; pages grupper + lokationer under `org_structure`; superadmin har BÅDE page- og tab-grants; separat approver kan godkende (page-level check); alle nye actions tildelbare via fælles model | MH · FS | 1.4+2.3 | N8 · C0 | K:159 · P:128 · T:156,212 · V12 | P K-8(c)(d) | — |

### K-9 UI-styrbarhed (K:163-177 · P:132-140 · T:N9 · C0-C10)

Strukturforbud (K:167): et forbud eller required-felt der kan slås fra via UI-konfiguration · en
forretningshandling der kræver udvikler.

| ac | acceptkriterie (kort) | negativ (forsøg → forventet) · positiv kontrol | bevisform | effekt-bid | canary · chain-step | kildeankre | frø | ⚠ åbne fund |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1+2 | ingen udvikler-indgreb; ingen tekniske privilegier | HELE handlingslisten (opret/rediger lokation · stande · grupper · kobl/frakobl · til-/fravælg · status · hvile · klassifikationsvalg) udført som authenticated rettighedshaver gennem API/RPC-fladen (non-bypass), med genlæsning gennem read-fladen efter hver handling; hver handling også UDEN grant → 42501; mutant: fjern EXECUTE eller API-eksponering for én krævet handling → rød kæde på netop det kald (404 er ikke bestået negativ); fuld læsning over API-sidegrænsen (hele ID-mængden) | MH · UT | 5.2 | N9 · C0-C10 | K:171-172 · P:136 · T:157,212,222,238 · M-23 | P K-9(a)(c)(d) · T K-9/N9 | ⚠ A-14 (fuldstændig læsning over sidegrænse ikke specificeret) · U08 (OpenAPI-canary T9-specifik; nye RPC'er ubevist) · A-11 (centrale RPC'er stadig build-valg) |
| 3 | strukturelt forbud kan IKKE deaktiveres via UI | pg_catalog-assert: ingen pakke-RPC eksponerer CHECK-/guard-/override-parametre; brug hver eksponeret konfigurationsindgang til at forsøge at slå required navn, ejer-/blad-/overlap-/årsagsværn fra eller ændre kode-låste action-flags → afvist eller uden virkning; send derefter N1/N2/N6 igen → fortsat afvist; app-superadmin + blank navn → 22023 | UT | 2/3-tests | N9 | K:173 · P:137 · T:157 · M-24 | P K-9(b) | — |

---

## 2. Planparametre der SKAL have ét forventet udfald før build (T:§0 »Det planen skal binde før lås«)

Ingen af udfaldene må vælges ud fra hvad buildet tilfældigvis gør. Plan v1's svar og status:

| parameter (T:24-26) | plan v1's svar | status ved fold-ind |
| --- | --- | --- |
| gruppe/leverandør-identitet og typer | V5: ÉN entitet `grupper` · V3: type valgfri ved oprettelse, CHECK {kaede, enkelt_butik, messe_operatoer, andet} · S-16: lokationens type KRÆVET | bundet |
| prisformat/enhed, NULL/0 | V11: numeric(12,2), implicit DKK pr. dag, lokation NOT NULL ≥ 0, stand NULL = arv, 0 ≠ NULL | ⚠ U05: afrundings-/overflow-udfald på public flade ubundet |
| mindste-stand-mekanik | V6: atomisk opret m. første stand · ingen sletning · sidste-aktive-stand-guard m. FOR UPDATE | ⚠ A-12 · F12: to-sessions-bevis er BLOKERENDE, ikke residual (§3) |
| dateret ejer-/pris-/statusmodel og intervalkanter | V8 + S-2..S-6: event-log m. seq, halvåben dvale-ophør, dagens sidste pris, dateret gruppe-ejerskab | ⚠ A-10 · F06: UTC-binding realiseres ikke af `::date` · A-9 · U04: forsinket apply |
| hviledagenes grænser, stop/udløb | V9: integer ≥ 1, NULL = intet valg, intet øvre loft; stop = status-handling; auto-ophør afledt i oraklet | ⚠ F11 (mutant-nåbarhed) · FUND-3 (citat-hedge) |
| fravalgs overlevelse ved genåbning | V8/P05: fravalg BESTÅR gennem nedlæg/genåbn | bundet — T C8 kræver netop et før-build-låst valg |
| lokale fravalg/frakoblinger på nedlagt | V4: afvises 22023 `lokation_nedlagt`, dobbelt-verifikation, ingen superadmin-bypass (S-7); gruppe-niveau-handlinger undtaget | bundet |
| fast/udvidelig feltliste, lagring, anonymiserings-/replayvej | V1 fast kolonner · V2 kolonnevej · S-11 låst række · S-12 revoke generic_apply · S-13 klassifikation | ⚠ A-4 · F03 · FUND-1 · U06 (indirect uden vej) · F08 · F09 · F13 · F14 · U09 |
| række-synlighedens faktiske kobling til org-data | `has_permission` page-level; ingen tværside-/række-kontrakt | ⚠ U03 · A-6 — UBUNDET; skal deklareres og prøves mod self/subtree/all |
| action-/approval-/undo-wiring og perioder | V10: pending-vej for 4 koblings-handlinger, direkte for stamdata/status/hviledage; undo 24 t eksplicit seedet, 0-30 døgn UI; ingen 2.-godkender | ⚠ F07 (self-approve kun non-admin) · A-9 · U04 · U07 |
| P-8-indbinding: T-blob + matrix `K/ac → bid → chain-step → signatur → observation → negativ → mutant` | plan v1 §8: »leveres af Codex før plan-lås« — T er leveret (4af07ef4) men IKKE optaget | ⚠ A-13 · U01 — v2 SKAL optage T-blobben og chain-step-/canary-kolonnen (denne liste leverer dem) |

---

## 3. Samtidigheds- og permutations-snit (M-40 E20 — plan-gatens dom)

- **SA kun for de to K-navngivne races:** (1) K-2 ac 6 sidste aktive stand (Bid 2) · (2) K-6 ac 2
  dublet-kobling (Bid 4). Form: mindst to uafhængige DB-sessions med dokumenteret barriere,
  committed observation, ingen manuel reparation (T:231). Sekventiel »race« og kodeinspektion er
  ikke kill (T:169; A-12 · F12). Kan harnesset ikke bære to forbindelser, er beviset **blokerende**
  — plan v1's B-3-residualvej (P:600) skal vendes i v2 (T `run-db-tests` én query pr. fil er ikke
  slutprøvens harness, T:238).
- **Genvalidering** request → nedlæg/frakobl → apply (T C6) er sekventiel: FS + UT, ikke SA.
- **Permutation: ÉN kontrolkopi** (T:228) — ombyt seedvalgte klienters roller/navne/rækkefølge;
  samme relationer/datoer/permissions → tilsvarende ommærkede svar.
- **Beholdes fuldt:** fuld-populations-import + bijektion (T §1), canaries N1-N9 (T §3), kæde C0-C10
  (T §4.2), historie-genlæsning og lokalitet (T §4.3).

---

## 4. Overdragelser — aldrig runtime-PASS (T:§3.2)

`downstream_dependency: trin-24`: N2-B dobbeltbooking pr. stand (K-2 ac 4) · N4-B/N5-B/N6-B booking
under dvale/nedlagt/hvile eller uden gældende ret (K-4 ac 5 · K-5 ac 1 · K-6 struktur) ·
kampagne-slut-trigger for auto-hvile (K-5 scope-ærlighed) · konsekvens for eksisterende bookinger
ved frakobling/fravalg (K-6 trin-24-note). `trin-29`: prisens økonomiske forbrug (K-1 ac 3).
`lag-F`: sider/formularer oven på den beviste RPC-flade (K-9 scope-ærlighed). Alle nu-scope-
assertions skal være udført; deklareret nedstrøms-scope er ikke en skjult skipped test.

---

## 5. Hvad B2-låsen kræver ud over dette udkast

1. **Codex' måle-adapter-tjek:** adapteren (C1: `runBuildProofEngine` + `runProver`, kontraktbundne
   reject-klasser) kan udtrykke UT · FS · MH · SA som særskilte udfald — herunder »læsning med nul
   rækker« (K-8 ac 4) som FS-observation, ikke som fravær af fejl.
2. **Plan v2's matrix** får kolonnerne chain-step (C0-C10) og canary (N1-N9) pr. ac og optager
   T-blob `4af07ef4` (A-13 · U01).
3. **Hver ⚠-række** har i fold-ind-rapporten én af tre tilstande: rettet m. bevis · inden for
   mandat (begrundet) · kræver Mathias (princip 6). K-7's nedgraderingsforbud får en egen række.
4. **Kill-list:** Codex' blinde `kill-list-udkast.md` (B1) afløser kolonnen »frø«; denne liste
   peger kun på plan v1's frø som krydsreference. D10-filter ved fold-ind.
5. **Efter fold-ind** genlæses hver K's forpligtelse mod denne liste: er et ac blevet svagere (fx
   »designet UD« uden offentlig negativ, eller en SA nedgraderet til residual), er det et nyt fund.
