Alle kontroller er gennemført. Ingen sandhedsdokument-regel modsiger D-2 (masterplanens UTC-linje er ingest-specifik, P-8 T:78 delegerer tidsgranularitet til planen), §7's masterplan-blok er implplanens Fase 6-mekanik (masterplan-diff godkendes af Mathias ved luk, masterplanen ligger ikke i `docs/sandhed/`), manifestet tæller 53 ac + 7 struktur = 60 obligationer som planen påstår, og recon-Codex-citatet i V9 er ordret (recon2:300). Her er verdikt, fremlæggelse og verdikt-JSON.

## A) Min læsning

**Binding (alle blobs hash-verificeret med `git hash-object` i workdir @ 9d94278):** plan `fea69661` ✓ · manifest `3ab9cf9b` ✓ · krav `9402164d` ✓ · recon2 `2bdbb122` ✓ · P-8 `4af07ef4` ✓ · ordbog `bcab6b4e` ✓ · kill-list `13b78392` ✓ · kontekst: ledger `5f4425d1` ✓ · kildekontrakt `5183dec1` ✓ · fold-ind-r4 `1aa91bbe` ✓ · implplan `11fb2208` ✓. Planens Formål-afsnit (plan:5) er identisk med kravets (K:7). Manifestet binder krav `9402164d` og plan `fea69661` (manifest:1-16).

**Pr. K (bijektion · negativer · forretnings-troskab):**

- **K-1** (K:17-31 × plan:145-150): alle 5 ac + strukturrække afbildet. Negativer: blankt navn afvises også for superadmin uden halv lokation (145); type uden for listen (146); prishistorik kan ikke omskrives, ingen dato-parameter (147); ingen økonomi-kobling, leverancekontrol over alle 9 tabeller/43 funktioner (148); ingen sær-mekanik pr. type (150). Troskab: M-23/M-24 struktur/værdi-skel holdt. Type-krævet (D-8) er strammere end kravets negativ-liste men inden for »lokation bærer type« (K:19) med »andet« som udvej.
- **K-2** (K:33-50 × plan:158-164): under-stand og stand-uden-lokation afvises eksplicit (158); prisarv entydig, 0 ≠ tom (159); stand ikke bookbar under dvale/nedlagt (160); stand-identitet leveret, dobbeltbooking → trin 24 præcis som kravet selv siger (K:44, K:416) (161); nedlæggelse sletter ingen stande, mutant der tager stande ud af brug fanges (162); atomisk første stand + sidste aktive stand kan ikke deaktiveres, to-sessions-bevis blokerende (163). M-17/M-18/M-29 tro; under-stande ikke plan-fase ✓.
- **K-3** (K:52-67 × plan:172-177): uden gruppe/fritekst/uden navn afvises (172-174); arv til ALLE lokationer også senere tilkomne, mutant med oprettelses-cutoff fanges (175); gruppe kan ikke slettes, kun tages ud af brug (176); fravalg lokalt med søster-vidne (177). Type valgfri = kravets default (K:181) ✓. M-17/M-36 tro.
- **K-4** (K:69-87 × plan:185-193): ukendt status/blank årsag/skrivning uden om handlingen afvises (185-187); historik uomskrivelig (188); aktiv-opslag pr. dato, booking → trin 24 (K:81 selv) (189); til-/fravalg i dvale afvises IKKE, for stramt værn = kravbrud (190); genåbning mulig (191); til-valg på nedlagt afvises uden SA-bypass (192); nedlæggelse: ingen klient har ret, gruppe-kobling og øvrige lokationer uberørte, stande og historik består, genåbning arver da gældende (193). Afledt frakobling er den ENESTE form der opfylder K:85 »gruppens kobling berøres ikke« og M-14 samtidig ✓.
- **K-5** (K:89-107 × plan:201-206): ingen override-/klient-parameter, SA får samme »false« (201); stop uden rettighed afvises, med rettighed straks aktiv + audit (202); hviledage straks-virkning uden godkendelse = kravets bekræftede afledning M-29.5 (203); ingen auto-hvile uden valg, ingen mekanik skriver dvale af sig selv (205). Auto-udløsning → trin 24 som K:105 ✓. V9 »én model-ting« inden for K:103 ✓.
- **K-6** (K:109-130 × plan:214-224): kobling uden klient/gruppe afvises (214); dobbelt kobling afvises også i race (215); ingen slutdato-parameter, kobling uden slutdato afvises IKKE (216); frakobling ændrer aldrig fortiden, forsinkelsesprøve obligatorisk (219); opslag pr. dato med tre daterede led inkl. ejerskifte (220); flere klienter samtidig afvises IKKE (221); fuld godkendelses-/fortrydelseskæde, uden rettighed/årsag/dato i fortiden afvises (223). M-12/M-13/M-17/M-19/M-29.1/M-30.4 tro.
- **K-7** (K:132-145 × plan:232-236): uklassificeret kolonne blokerer leverance (232); anonymisering erstatter, sletning afvises, gruppe og lokationer består (233); default = intet (234); ingen persondata-felt uden vej, lokationsvej leveret inaktiv (235); nedgradering og »indirekte uden vej« afvises også for SA (236). **S-2-B = M-42 + K:143:** M-42 »styres i ui« → UI vælger pr. felt; K:143 forbyder markering uden anonymiseringsvej → tredje niveau urepræsenterbart. Bekræftet, ingen krav-ændring.
- **K-8** (K:147-161 × plan:244-249): direkte skrivning afvises uanset rettigheder, også med selvsatte variabler (244); årsag pr. skrivevej, arvede labels inden for mandat K:161/K:185/K:274 (245); audit/historik uændrelig (246); synlighed ≠ handling (247); tildelbar fra dag ét (248).
- **K-9** (K:163-177 × plan:257-260): hele handlingsfladen som non-admin uden udvikler (257); ingen service-adgang (258); strukturforbud kan ikke slås fra, heller ikke af SA (259). Lag F-overdragelse = K:175 ✓.

**Bijektion** (plan:264-276): 60 obligationer = 53 ac + 7 struktur, ét effekt-bid pr. obligation, intet rogue-bid; manifestet tæller det samme (53 `ac`, 7 `K-n/S`). §9 (plan:786-790) overdrager præcis det kravet selv lægger i trin 24/29/lag F (K:411-418); intet nu-scope-negativ er overdraget.

**§10's 21 defaults (plan:804-823) — bord-test »ændrer det et krav/sandhedsdokument?« · citat ordret:**

| id | bord-test bestået | citat ordret | note |
|---|---|---|---|
| S-1 | ja | n/a | K:57/K:181 delegerer; kravets udgangspunkt fraveget SYNLIGT med stop |
| S-2 | ja (M-42-afgjort) | **ja** (M-42 ledger:96) | = K:143, ingen undtagelse |
| S-3 | ja | n/a | kildekontrakt §(1)-(3); data/risiko-default med stop |
| B-1 | ja | n/a | K:122/K:126; fortiden skrives aldrig |
| B-2 | ja | n/a | K:181 delegerer eksplicit |
| B-4 | ja | **ja** (M-36 ledger:85, ordret) | = K:65; første-dags-konsekvens ærligt deklareret |
| B-5 | ja | **ja** (M-30.2 »den skal væres åben«, som ANALOGI) | K:71 + K:48/K:181 |
| D-1 | ja | n/a | ingen kilde vælger start; lav materialitet |
| D-2 | ja | n/a | ingen låst doc kræver dansk kalenderdag (masterplan:1091 er ingest-specifik; P-8 T:78 delegerer) |
| D-3 | ja | n/a | K:181 seeding |
| D-4 | ja | n/a | K:407 »stamdata = direkte m. audit« + K:181 |
| D-5 | ja | n/a | K:46/K:48, M-17 står |
| D-6 | ja | n/a | K:111 »gældende-dato … plan-mekanik«; kant-regel |
| D-7 | ja | n/a | P-8 T:230 delegerer |
| D-8 (+SM-1) | ja | n/a | K:19/K:26/K:181, M-24 |
| D-9 | ja | n/a | K:161/K:185/K:274 disponerer fundamentets regel |
| D-10 | ja | n/a | fundament-grænse, uden for skabelon |
| SM-2 | ja | n/a | K:64 delegerer |
| SM-3 | ja | n/a | K:254 disponeret |
| SM-4 | ja | n/a | K:134/K:137/K:142; fundament-grænse |

Øvrige citater: plan:11 M-42 »plan er kode og krav er forretningsgange« ordret ✓; plan:626 recon-Codex-citat ordret (recon2:300) ✓.

**Fund:**
- **F-1 (form, driverens brief, ikke planen):** driverens fremlæggelses-instruks pkt. 3 skriver »klient-, butiks- og medarbejderdata«. Kildekontrakten §(2) og plan:806 siger klient-, organisations- og medarbejderdata; P-8 §1.1 (T:32) fastslår at der ingen lokationsdata findes. Fremlæggelsen nedenfor følger kilden. Ingen verdikt-konsekvens.
- Ingen fund mod planen. Uden for mit bord og ikke dømt: test-dybde, kill-list-instansiering, manifest-negativernes klasser (code-reviewer/codex).

**Verdikt: PASS.** Plan⊨krav⊨vision aktivt bekræftet pr. K × §1-linje ovenfor; ingen af §10's defaults ændrer krav eller sandhedsdokument; ingen spørgsmål til Mathias (M-42); alle »Dit ord«-citater ordrette.

## B) Fremlæggelse

<<<FREMLAEGGELSE-PLAN
**Plan for lokations-skabelonen (version 3.2). Fremlæggelse før `plan ok`.**

**1. Hvad planen bygger.** Butik = lokation: butik, messe, marked, event eller andet, samme regler for alle.

- **K-1 Butikken som stamdata.** Bilka Hundige oprettes i UI med navn, adresse, dagspris, type og gruppe. Uden navn afvises den, også for superadmin. Prisen kan ændres, men fortiden består: hvad der gjaldt hvornår kan altid ses. Butikken kan aldrig blive en økonomi- eller provisionsdimension.
- **K-2 Stande.** Bilka Hundige fødes med sin første stand og har altid mindst én stand i brug. En stand kan ikke ligge under en anden stand. En stand uden egen pris følger butikkens. Nedlægges butikken, består standene og er klar ved genåbning. At to klienter ikke kan stå på samme stand samme dag afvises i booking-leddet (trin 24); skabelonen leverer standen som den enhed en booking binder til.
- **K-3 Gruppen ejer.** Brugsen hører under Coop, et center under Dansk Shoppingcentre. En butik uden gruppe, en gruppe uden navn eller en gruppe skrevet som fri tekst afvises. Klienter kobles på gruppen og arver alle dens butikker, også senere tilkomne. Tryg uden for Coop kan ikke stå i nogen Coop-butik. En gruppe med butikker kan ikke slettes, kun tages ud af brug.
- **K-4 Aktiv · dvale · nedlagt.** Kun aktiv kan bookes. Skift sker med årsag og logges; historikken kan ikke omskrives. I dvale kan I stadig fravælge og til-vælge klienter. Nedlægges Bilka Hundige, har ingen klient ret dér længere, men koblingen til Coop og Coops øvrige butikker berøres ikke. Genåbnes butikken, arver den automatisk Coops da gældende klienter. At til-vælge en klient på en nedlagt butik afvises, også for superadmin.
- **K-5 Hvile.** Hvile udløses kun hvis der er valgt et antal hviledage på butikken; uden valg ingen automatisk hvile. Under hvile kan ingen booke, og der findes ingen »book alligevel«. Hvilen kan stoppes før tid i UI af en rettighedshaver med årsag. Ændring af hviledage gælder straks med rettighed og årsag. Selve udløsningen efter en kampagne kobles på i trin 24.
- **K-6 Hvem må stå hvor.** Tryg må stå i Bilka Hundige når Tryg er koblet på Coop, butikken ikke har fravalgt Tryg, og butikken ikke er nedlagt. Koblingen har ingen slutdato. Tryg og Alka kan begge have ret i samme butik samtidig. Opslaget »må Tryg stå i Bilka Hundige den 5. oktober?« svarer entydigt, også bagud i tid. Kobling, frakobling, fravalg og ophævelse går gennem anmodning → godkendelse → fortrydelsesfrist (24 timer som start, justerbar 0–30 døgn i UI) → gennemførelse. Fortiden ændres aldrig.
- **K-7 Persondata.** Coops kontaktpersoner (navn, e-mail, telefon) er persondata og kan anonymiseres uden at gruppen eller butikkerne mistes; sletning er ikke anonymisering. Om et butiksfelt, fx adressen, er persondata vælger I i UI; markeres det, kan det altid anonymiseres. Ingen ny oplysning kan leveres uden klassifikation. Uden aktivt valg er intet persondata, og intet har opbevaringsregel.
- **K-8 Rettigheder og spor.** Al skrivning går gennem de godkendte indgange. Uden rettighed afvises handlingen, uden årsag afvises den. Sporet kan ikke ændres eller slettes. Skabelonens sider er tildelbare i rettigheds-UI'et fra dag ét; superadmin er dækket.
- **K-9 Styres i UI.** Hele handlingsfladen (grupper, butikker, stande, koblinger, fravalg, status, hvile, klassifikation) udføres af rettighedshavere uden udvikler. Et strukturelt forbud (manglende navn, nedlagt til-valg, nedgradering af persondata) kan ikke slås fra i UI, heller ikke af superadmin. Skærmbillederne kommer i lag F; nu bevises maskinrummet de vil kalde.

**2. Plannerens valg. Orienteringer under `plan ok`.** Ingen af dem ændrer et krav eller et sandhedsdokument. Siger du stop til én, laves en ny planversion før byg.

| id | valget | hvis du siger stop |
|---|---|---|
| S-1 | Coop-gruppen har faste felter: navn, type og kontaktpersoner (navn, e-mail, telefon). Et nyt felt, fx CVR, kræver en udvikler. | Bygges som for klienter med UI-udvidelige felter. |
| S-2 | Afgjort af dit ord 15/9: om et felt er persondata vælger I i UI; markeres det, kan det altid anonymiseres. »Indirekte persondata« uden anonymisering findes ikke på skabelonens felter. | Intet stop-udfald; en undtagelse ville ændre kravet. |
| S-3 | Slutprøvens kildedata, se pkt. 3. | En kopi laves først. |
| B-1 | Tryg ønskes frakoblet Coop fra 1/10. Godkendes det 3/10 og udløber fristen 4/10, gælder frakoblingen fra 4/10. Intet ændres bagud. En kobling »fra i dag« træder tidligst i kraft dagen efter ved 24 timers frist. | Anden dato-regel; fortiden kan stadig ikke skrives. |
| B-2 | Tryg er fravalgt i Bilka Hundige. Nedlægges og genåbnes butikken, er Tryg fortsat fravalgt indtil fravalget ophæves. | Nedlæggelse nulstiller fravalg (logget). |
| B-4 | Alka kan først fravælges i Bilka Hundige når Alka er koblet på Coop med en dato der dækker fravalget. Kobles Alka »fra i dag«, kan Alka have ret i butikken indtil fravalget er trådt i kraft. Ønskes udelukkelse fra første dag, sættes fravalgets frist til 0 i UI. | Fravalg uden forudgående kobling tillades. |
| B-5 | Bilka Hundige er nedlagt: en ny stand kan først oprettes når butikken er genåbnet. De eksisterende stande består og kan redigeres. | Nye stande tillades på nedlagt butik. |
| D-1 | En ny butik er aktiv og kan bookes fra oprettelsen. Skal den vente, sættes den i dvale straks efter. | Ny butik starter i dvale. |
| D-2 | Systemets »dag« skifter kl. 01 om vinteren og kl. 02 om sommeren (dansk tid). Et skift kl. 00.30 dateres dagen før. | Dansk kalenderdag; rører alle historik-datoer. |
| D-3 | Grupper og butikker lægges under rettigheds-området »organisation«. | Kan flyttes senere i rettigheds-UI'et uden planændring. |
| D-4 | Skifter Bilka Hundige fra Coop til en anden gruppe, sker det straks med rettighed og årsag, uden godkendelse og frist. Fra samme dag følger klienternes ret den nye gruppe. Butikkens fravalg gælder fortsat. | Gruppeskift går gennem godkendelse og frist. |
| D-5 | En stand kan tages ud af brug uden at slettes. Den sidste stand i brug kan ikke tages ud af brug; sæt butikken i dvale eller nedlagt i stedet. | Kun mekanikken ændres; »mindst én stand« står. |
| D-6 | Tryg kobles på Coop fra 1/10. En frakobling fra samme dato afvises: en kobling varer mindst én dag. Fortryd inden fristen, eller vælg dagen efter. Samme for ophævelse af et fravalg på dets startdag. | Samme-dags lukning tillades. |
| D-7 | Dvale »til den 5. oktober« betyder at butikken kan bookes igen den 5. oktober. Skærmteksten siger det samme. | Den 5. er stadig dvale; bookbar fra den 6. |
| D-8 (+SM-1) | Type er krævet på en butik; »andet« kan altid vælges. Adresse er valgfri. Dagspris er krævet; 0 kr. er en pris. En stand uden egen pris følger butikkens. | Krævet/valgfri vendes for adresse eller pris. |
| D-9 | Når en godkender siger ja til, eller fortryder, en kobling, frakobling eller et fravalg, skrives ingen ny årsag. Anmoderens årsag følger anmodningen og gennemførelsen. Godkendelse og fortrydelse logges med hvem og hvornår. | Kræver ændring uden for skabelonen i den fælles godkendelsesmekanik; det er et stop-flag, ikke en planændring. |
| D-10 | En godkendt ændring der ikke længere kan gennemføres, fx fordi butikken blev nedlagt inden datoen, bliver stående som »godkendt« og ses i loggen som fejlet ved gennemførelse. Den får ikke status »afvist«. | Kendt grænse i den fælles mekanik. |
| SM-2 | En gruppe taget ud af brug kan ikke få nye butikker, nye gruppeskift til sig eller nye klient-koblinger; det bestående består. Superadmin kan alligevel. | Superadmin afvises også. |
| SM-3 | En klient sat inaktiv kan ikke kobles på en gruppe. Superadmin kan alligevel. | Som SM-2. |
| SM-4 | Vælger I i UI reglen »anonymisér N dage efter at kontaktpersonen er taget ud af brug«, sker det automatisk (dagligt). Regler »N dage efter oprettelse« eller »manuelt« har ingen automatik i dag. Butikker kan ikke få en tidsregel; nedlæggelse er en status, ikke en »taget ud af brug«-dato. | Grænse i den fælles mekanik; udvidelse er uden for skabelonen. |

**3. Slutprøvens kildedata (S-3).** Slutprøven læser jeres rigtige klient-, medarbejder- og organisationsdata (afdelinger og teams) direkte fra driftssystemet. Kun læsning, intet ændres. Der findes ingen butiksdata endnu; butikker, grupper og stande skabes af det byggede system selv under prøven. Medarbejderes navn og e-mail og klientfelters personværdier hentes ikke. Siger du stop, laves en kopi først.

**4. Hvad der ikke bygges nu.** Trin 24 (booking): selve afvisningen af bookinger på dvale, nedlagt, hvile eller uden ret · dobbeltbooking pr. stand · automatisk hvile efter kampagne · hvad der sker med allerede bookede dage når en klient kobles fra. Trin 29: hvad dagsprisen bruges til økonomisk · gruppetype krævet før rabat. Lag F: skærmbilleder oven på den beviste flade. Import af 1.0-data: udskudt på dit ord. Masterplanens tekst om lokationer opdateres først ved luk og godkendes af dig dér.

**5. Status.** Tre dommere har dømt planen: Codex · code-reviewer · claude-ai. Dommene fremgår af kvitteringen.

**6. Hvad `plan ok` betyder.** Planen låses ved sin version (3.2), og byggeriet starter. Orienteringerne i pkt. 2 og 3 står som planens valg. Enhver ændring herefter kræver ny planversion og nyt ord fra dig.

Skriv det ene ord: `plan ok`
FREMLAEGGELSE-PLAN>>>

## C) Verdikt

VERDIKT-DRAFT-JSON: {"aktor":"claude-ai","conclusion":"PASS","negative_cases":["K-1 ac 1 × plan.md:145 — lokation uden navn afvises, også for superadmin, ingen halv lokation efterlades → afbildet (AK-NAVN, T1.1)","K-1 ac 4 × plan.md:148 — lokation kan ikke blive økonomi-/attributionsdimension; leverancekontrol over alle 9 tabeller og 43 funktioner → afbildet","K-2 ac 1/ac 6 × plan.md:158,163 — under-stand og stand uden lokation afvises eksplicit; sidste aktive stand kan ikke deaktiveres, også for SA, to-sessions-bevis blokerende → afbildet","K-2 ac 5 × plan.md:162 — nedlæggelse sletter ingen stande; mutant der tager stande ud af brug ved nedlæggelse gør genåbnings-asserten rød → afbildet","K-3 ac 1/2/3 × plan.md:172-174 — lokation uden gruppe, fritekst-gruppe og gruppe uden navn afvises → afbildet","K-3 ac 4/ac 6 × plan.md:175,177 — klient uden for gruppen kan hverken til- eller fravælges; fravalg rammer kun én lokation (søster-vidne) → afbildet","K-4 ac 1/2/3 × plan.md:185-187 — ukendt status, blank årsag og status-skrivning uden om den dedikerede handling afvises → afbildet","K-4 ac 6 × plan.md:190 — til-/fravalg i dvale afvises IKKE; for stramt værn dømmes som kravbrud (T4.5) → afbildet","K-4 ac 8/ac 9 × plan.md:192-193 — til-valg på nedlagt afvises uden SA-bypass; nedlagt lokation har ingen klienter med ret, gruppens kobling, stande og historik består, genåbning arver da gældende → afbildet","K-5 ac 1/ac 2/ac 5 × plan.md:201-205 — ingen book-alligevel/override-flade, SA får samme false; stop før tid uden rettighed afvises; ingen automatisk hvile uden valgt antal dage → afbildet","K-6 ac 2/ac 3/ac 8 × plan.md:215-216,221 — dobbelt kobling afvises også i race; kobling uden slutdato afvises IKKE; flere klienter samtidig afvises IKKE → afbildet","K-6 ac 6/ac 10 × plan.md:219,223 — frakobling ændrer aldrig fortiden (forsinkelsesprøve); kobling uden rettighed, uden årsag eller med dato i fortiden afvises; godkendelse + fortrydelsesfrist før ikrafttræden → afbildet","K-7 ac 2/S × plan.md:233,236 — sletning som anonymisering afvises; nedgradering af persondata og markering indirekte uden anonymiseringsvej afvises også for SA (S-2-B = M-42 + K:143) → afbildet","K-8 ac 1/ac 3 × plan.md:244,246 — direkte tabel-skrivning afvises uanset rettigheder og selvsatte variabler; audit og historik kan ikke ændres eller slettes → afbildet","K-9 ac 3 × plan.md:259 — strukturelt forbud (blankt navn, nedlagt til-valg, pii-nedgradering) kan ikke slås fra i UI, heller ikke af SA → afbildet","§10 × plan.md:804-823 — 21 defaults bord-testet: ingen ændrer et krav eller sandhedsdokument; Dit ord-citater M-36 (ledger:85), M-42 (ledger:96) og M-30.2 ordret mod ledgeren → bestået"],"claim_graph_refs":[],"evidence":[{"path":"plan-build/lokations-skabelon/plan.md","line_span":[141,262]},{"path":"plan-build/lokations-skabelon/plan.md","line_span":[264,276]},{"path":"plan-build/lokations-skabelon/plan.md","line_span":[606,634]},{"path":"plan-build/lokations-skabelon/plan.md","line_span":[786,790]},{"path":"plan-build/lokations-skabelon/plan.md","line_span":[794,825]},{"path":"docs/sandhed/krav/lokations-skabelon-krav.md","line_span":[17,177]},{"path":"docs/sandhed/krav/lokations-skabelon-krav.md","line_span":[179,181]},{"path":"docs/sandhed/krav/lokations-skabelon-krav.md","line_span":[409,418]},{"path":"plan-build/lokations-skabelon/ordbog.md","line_span":[25,34]},{"path":"plan-build/lokations-skabelon/p8-slutproeve-spec.md","line_span":[28,56]},{"path":"plan-build/lokations-skabelon/recon2.md","line_span":[657,671]},{"path":"plan-build/lokations-skabelon/forventnings-manifest.json","line_span":[1,16]}]}