**Samlet dom: FAIL. C1/C2 er ikke opfyldt før første bid.** Alle tre moduler har konkrete huller, hvor forventninger kan indsnævres, manglende bevis kan tælle, eller uvedkommende fejl kan blive mutant-kills.

| Modul | Dom | Verificeret blob-OID |
|---|---|---|
| [forventnings-manifest.mjs](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-c1-r1/wd/scripts/v5/forventnings-manifest.mjs) — **M** nedenfor | **FAIL** | `7110075dc0337bc987ea95d76c52c90d38bca6c3` |
| [build-harness.mjs](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-c1-r1/wd/scripts/v5/build-harness.mjs) — **H** | **FAIL** | `30c0e2897641365a141f43a8a2e9faab92b74a5a` |
| [build-proof.mjs](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-c1-r1/wd/scripts/v5/build-proof.mjs) — **V** | **FAIL** | `1fffd02c9c3d5eadaf4f423ee8125bde7a46d077` |

Jeg har kun læst og kørt kode uden filskrivning; ingen web. Snapshot’et indeholder ingen `.git`. Blob-OID’er er verificeret med `git hash-object`, og **alle syv filers efterbilleder samt før-OID-præfikser i hele diffen matcher**. Commit-tilhørsforhold er ikke selvstændigt verificeret.

| Øvrigt input | Verificeret blob-OID |
|---|---|
| `DIFF-c1.diff` | `8511a344a7327b0144e060c402c1b5df6306498f` |
| B2-leverancen | `460a9b26db03f88ba148c42daaaf525e1120db5a` |
| Låst forventningsliste | `2200b76e29b52f7084c0bfe003c0a2e8121c2346` |
| P-8-spec | `4af07ef4164882ca54643e79df3554c0bf22b0e4` |
| Workflow-implementeringsplan | `fb8cab8d37fa531643ab75ad72ba480ab93ce782` |
| GRUNDPLAN Trin C | `f1bbc167cefe826f010e3636aa74b36644d93e50` |
| Integrationslog | `0017e2a3e87506228b4db9ac0f8937d7fea73316` |
| Integrationskode | `86ec11e5b6e0892c6c2b9513d2c070b3eb2f8a8a` |

**Kørselsgrundlag:** eksisterende manifest-selvtest **46/46**, harness-selvtest **85/85**. Nye prober kørte de faktiske moduler med kontrollerede runner-svar og en Git-model i hukommelsen. Verifier-proberne omfattede også `evaluateGate`; de dokumenterer logiske accepteringsveje, **ikke autentificerede Git-/Postgres-/CI-kørsler**. Den eksisterende build-proof-selvtest skriver et midlertidigt repository og blev derfor ikke kørt. Postgres-integrationen blev ikke genkørt.

**F-C1-1 — Bevisproducenten vælger stadig forventningskilden.**  
**Type:** forventningsindsnævring. **Evidens:** V:119–133 henter `manifest_ref` fra proofen. Path-binding viser, at filen findes i build-committen; ingen kontrol viser, at netop dette manifest blev låst ved plan-gaten. Samme plan-OID er utilstrækkeligt.

Eksekveret: to gyldige manifester i samme modellerede commit, med identiske krav-/liste-/planbindinger. Det alternative manifest fjernede K-2 og ét negativ. Proofen blev tilsvarende reduceret:

```text
verifyBuildProof → ok:true
evaluateGate    → open:true
```

Samme vej kan fjerne `sole_guard_ref` eller flytte et nu-punkt til `overdragelse`. En deklareret guard hjælper kun, hvis dens obligatoriske relation ikke kan omskrives.

**Rettelse:** manifestets præcise path+OID skal komme fra et uafhængigt, plan-gatet input. Kontrollér også de autoritative liste-/kravbindinger. Et nyt manifest kræver ny binding og dom; tilstedeværelse i build-committen er ikke godkendelse. **Materialitet:** blokerer hele K-/D10-kompletheden.

**F-C1-2 — Komplethed stopper ved form; obligatoriske assertions kan forsvinde.**  
**Type:** målekontrakt/indsnævring. **Evidens:** M:190–207 indeholder ingen forventet assertion-/checkpoint-mængde. H:178–185 accepterer fraværende eller tomme checkpoints. V:214–218 kræver blot én case pr. form og negativ.

Eksekveret på samme manifest og samme runner:

```text
forkert historisk checkpoint + checkpoint bevaret → brudt
forkert historisk checkpoint + checkpoints:[]     → opfyldt
```

Det rammer direkte K-1/ac-3’s historiske genlæsning og tilsvarende K-4/K-6-historik.

Aliasprøven fjernede UT og negativer fra `K-6/ac-5`, men beholdt alias til `K-3/ac-6`: manifestet var stadig gyldigt, og ejerens forventning blev FS/MH uden negativ. Den låste liste:131 kræver udtrykkeligt UT-negativet.

**Aliasdom:** at alias ikke tilføjer ekstra **globale ID’er**, er korrekt; målet findes allerede i mængden. Men relationen beviser ikke alias-ejerens dækningsforpligtelse. En ubetinget union af alle målformer er heller ikke korrekt: eksempelvis kan en henvisning genbruge kun MH-delen. Der kræves eksplicit, kontrollerbar ekspansion eller dækningsmapping for de relevante assertions/negativer.

Scope har samme granularitetsproblem: selvtest-fixturerne overdrager hele `K-2/ac-4`, mens den låste liste:70 bevarer **standidentitet nu** og overdrager dobbeltbooking.

**Rettelse:** lås individuelle assertioner, relevante checkpoints, alias-dækning og deloverdragelser; verificér deres fuldstændige udførelse. **Materialitet:** blokerende; én grøn FS/MH-case kan ellers absorbere flere ubeviste krav.

**F-C1-3 — Verifieren accepterer håndskrevne og selvmodsigende effektflag.**  
**Type:** falsk effektbevis. **Evidens:** V:195–197 kræver vilkårlige assertion-ID’er med `ok:true`; observationer læses ikke. V:235–236 tror på kill/restore/clean/form. `engine.summary` afstemmes ikke.

Eksekveret accepterede verifieren og gate-kernen:

- Cases uden observationer, alene `assertions:[{id:"invented",ok:true}]`.
- UT-observation med `negative.ok:true` og ændret tilstand, mens status/assertions sagde grøn.
- Mutanter med `baselineOk:false`, `controlsOk:false` og `under.status:"protokol-fejl"`, men `killed:true`.
- Engine-resumé med 99 brud og 99 protokolfejl.
- Seks delbeviser, `tests_run:1` og claim-graph kun for K-1 trods K-2-dækning.

Harnessen afleverer heller ikke tilstrækkelige rå resultater til efterprøvning: UT gemmer ikke før-/efterrækkerne; MH gemmer ikke vidnerækker; checkpoints og SA-invariantrækker reduceres til assertions.

**Rettelse:** aflever typede observationer og bundne assertion-/spec-referencer; genudled status, kill og tællinger. Bind relevante claim-graph-led til de samme case-/assertion-/mutant-ID’er. C1’s samling af engine- og prover-output mangler også i den leverede produktionsvej.

**Materialitet:** direkte brud på C1-kriteriet »verifieren afviser hånd-skrevne flag«. Autenticiteten af et komplet råresultat kræver CI; afvisning af fraværende eller modstridende råresultater kan håndhæves nu.

**F-C1-4 — Reject-kontraktens grund, fase og aktør håndhæves ikke; exit-klassen ignoreres.**  
**Type:** forkert afvisning tæller som korrekt. **Evidens:** H:139,147–166 anvender casens aktør og sammenligner SQLSTATE. Manifestets `aktoer`, `fase`, signatur og afvisningssted er ikke operationelt bundet til observationen.

Eksekveret gav et negativ begrundet med `lokation_nedlagt` stadig **opfyldt** for blankt navn, fordi begge brugte `22023`. Det er netop B2’s skelnen mellem K-1/ac-1, K-3’s adgang til gruppen og K-4/ac-8.

Exit-kanalen, H:148–154, accepterede `{exit_code:1, klasse:"ENOENT"}` som klassifikationsafvisning. `klasse` observeres slet ikke. Desuden kan en korrekt exit-mutant, som fjerner kontrollen og giver exit 0, **ikke dræbes** af UT-killklassifikationen.

**Rettelse:** bind prøve/signatur, fase, aktør og entydige førbetingelser til den låste reject-post. Observer en struktureret leverancediagnose for exit-kanalen samt kontrollens funktionsdygtighed. Brug ikke fri fejltekst som dommer. Tilføj exit-kanalens formbestemte kill.

**Materialitet:** blokerer blandt andet K-7/ac-1 og afvisninger, der deler SQLSTATE.

**F-C1-5 — Engine gør afviste observationer og manglende scalar-orakel grønne.**  
**Type:** protokolfejl bliver effektbevis. **Evidens:** H:161–163,175–183,195–196 kontrollerer rækkesættet, men ikke observationskaldets `ok`.

Eksekveret:

```text
FS: observe → {ok:false, code:"42501", rows:[]} → opfyldt
UT: begge state-kald afvist, rows:[]           → opfyldt
MH: afvist vidnekald med matchende rows        → opfyldt
matchExpect([{v:null}], {kind:"scalar"})       → ok:true
```

Sidste tilfælde skyldes H:58–63,94–97: manglende `value` kanoniseres som NULL. En yderligere **JSON-nåelig** prøve, `JSON.parse('[{"v":1e400}]')`, matcher også forventet NULL via samme kanonisering.

**Rettelse:** kræv succesfulde observationskald, eksplicit scalar-`value` og en valideret værdirepræsentation, der ikke sammenblander manglende/ikke-endelige værdier med NULL.

**Materialitet:** direkte falsk-grøn for især K-8/ac-4. Almindelig `false` versus NULL, streng versus tal og dubletrækker håndteres ellers korrekt.

**F-C1-6 — »Formbestemt« kill er ikke bundet til det tilsigtede brud.**  
**Type:** uvedkommende fejl tæller som mutant-kill. **Evidens:** H:225–232 klassificerer enhver afvist MH-handling som MH-brud og enhver forkert SA-afvisningsfordeling som SA-brud.

Eksekveret, begge med en grøn FS-kontrol:

```text
MH-handling fejler med 42601 → killed:true
SA: begge fejler med 42601, invariant stadig 1 → killed:true
```

Der kræves intet `target_assertion_id` eller attesteret mutantlocus. V:156–159 binder angrebs-spec-filen, men læser ikke dens mutantkontrakt.

**Rettelse:** bind mutationens locus/aftryk, målassertion og forventede brud til angrebs-spec’en. MH skal skelne den tilsigtede manglende adgang/handling fra eksempelvis syntaksfejl; SA skal bevise den låste raceforpligtelses faktiske brud under et gyldigt forløb.

**Controls:** et mekanisk krav om ≥1 vilkårlig kontrol er utilstrækkeligt—ovenstående passer allerede sådan en. Kræv de **nødvendige, låste kontrolforløb**. Tomme controls kan kun forsvares, når målets egne kontroller bærer de relevante alternativer. I dag bliver tomhed automatisk `controlsOk:true`; en prøve, der også ødelagde prisopslaget, blev dræbt uden at opdage denne regression.

**Materialitet:** blokerer påstanden om meningsfulde D10-kills.

**F-C1-7 — `cleanAfter:true` kan afgives med en ødelagt kontrolcase.**  
**Type:** falsk restaureringsbevis. **Evidens:** H:257–262 kører kontroller før restore; efter restore genkøres kun målet.

Eksekveret: restore genåbnede MH-handlingen, men ændrede samtidig prisopslaget fra 100 til 90:

```text
killed:true, restored:true, cleanAfter:true, controlsOk:true
samme FS-kontrol efter restore → brudt
```

**Rettelse:** efterprøv restaurering af mutationens bundne aftryk og genkør de nødvendige kontroller efter restore. Aflever før-/efterbeviset. **Materialitet:** en beskadiget eftertilstand kan godkendes og påvirke senere mutantmålinger.

**F-C1-8 — SA-resultatkontrakten mangler sessions-/commitbevis; integrationen lukker ikke hullet.**  
**Type:** ubevist samtidighed og afslutning. **Evidens:** H:201–218 accepterer `blockedObserved:true` uden session-/transaktionsidentiteter, barriereforløb eller commitudfald. Dette blev reproduceret som **opfyldt**. Manglende barriere bliver `brudt`, og kan sammen med et invariantbrud stadig give kill.

Integrationskoden:85–100 bruger faktisk to processer og transaktioner, men ignorerer resultaterne af rolleopsætning og commit/rollback. Markøren på stdout og fejllæsningen fra stderr har desuden ingen fælles resultatramme.

**Rettelse:** kræv to bundne sessions, observeret overlap/barriere, terminale commit-/rollbackudfald og efterfølgende invariantobservation. Runneren skal kontrollere og aflevere disse. Ved mutation af produktlåsen skal et uafhængigt overlapvidne bestå; produktlåsen skal ikke kunstigt bevares.

**Integrationsdom:** `waitLockOn` returnerer false ved timeout; en overset lås giver derfor ikke i sig selv grøn baseline. App-navn + enhver `Lock` er dog svagere end PID-/blokker-/ressourcebinding. Loggen understøtter en syntetisk kørsel, men mangler rå vidner og kørselsbinding til blob/container-version.

Fixturens `idem.sql`, linje 194, udfører også ejer-DELETE før **negative** opret-kald og reset før visse handlinger. Det ændrer tilstanden inde i måleforløbet og svækker beviset for tilstandsbevarelse/renhed. Flyt setup til eksplicitte fasegrænser eller isolerede kopier.

**Materialitet:** blokerer B2’s SA-kontrakt for K-2/ac-6 og K-6/ac-2.

**F-C1-9 — Et frit negativ-ID på en FS-case opfylder D10.**  
**Type:** falsk D10-kobling. **Evidens:** V:206–211 validerer kun negativtilhørsforhold for UT, men gemmer `negative_id` for alle former. V:237–242 bruger derefter dette felt som D10-bevis.

Eksekveret: behold korrekt UT-baseline for negativet, fjern dets UT-kill, mærk en FS-case med negativ-ID’et, og peg mutanten på denne med `break_form:"FS"`:

```text
verifyBuildProof → ok:true
evaluateGate    → open:true
```

**Rettelse:** kræv den låste relation mellem negativets faktisk udførte forsøg, målassertion og mutantbrud. Et påsat negativ-ID på en anden form må ikke skabe relationen. **Materialitet:** den nuværende `break_form == målform` beskytter ikke eneste-værn-kravet.

**F-C1-10 — Et effekt-bid uden cases kan bære en forudsætning.**  
**Type:** falsk D12-afslutning. **Evidens:** V:166–175 kontrollerer afhængigheder og global covers-union; V:202–205 kontrollerer kun retningen case→bid.

Eksekveret: tilføj en forudsætning og et nyt effekt-bid, som afhænger af den og deklarerer `covers:["K-1/ac-1"]`, men har **nul cases**. Lad et andet effekt-bid levere alle cases. Med de krævede reviewflag bliver resultatet grønt.

Manifestets `effekt_bid` valideres som streng, men bortfalder desuden i `expectedSet`.

**Rettelse:** bind bidrelationen til den låste plan og kræv den konkrete case-/assertionkørsel, som udøver hver forudsætning. Genbrug kræver eksplicit dækningsreference. **Materialitet:** en DDL-forudsætning kan afsluttes uden sit effektbevis.

**Kontraktdækning mod B2**

| Kontrakt | Status | Begrundelse |
|---|---|---|
| UT-skelneregel | **DELVIST** | Korrekt rækkefølge og præcis SQLSTATE; afvisningsgrund, exit-klasse og observationssucces svigter. |
| FS-skelneregel | **DELVIST** | Typede sammenligninger og checkpoints findes; obligatoriske checkpoints/orakler kan forsvinde. |
| MH-skelneregel | **DELVIST** | Handling og ≥1 vidne kræves; uvedkommende fejl kan dræbe, faktiske vidner bevares ikke. |
| SA-skelneregel | **DELVIST** | Raceadapter findes; sessions-/commitkontrakt og gyldig brudklassifikation mangler. |
| Fælles resultatkontrakt | **DELVIST** | Case-/obligation-/form-/run-identitet og status findes. Komplette observationer, assertions og OID-relationer mangler. `k_id`/ac kan afledes af ID’et; ekstra kopifelter er ikke i sig selv en blocker. |
| Reject-kontraktens felter | **DELVIST** | SQL-felter valideres syntaktisk; kun koden afgør udfaldet. Exit-klassen observeres ikke. |
| D10/D12 pkt. 1: forventninger/cases | **DELVIST** | Form-/negativkomplethed virker mod det valgte manifest; assertion-, alias- og bidbinding mangler. |
| Pkt. 2: meningsfuld mutant | **DELVIST** | ID/guard/mål findes; OID-locus, attesteret mutation og målassertion mangler. |
| Pkt. 3: formbestemt kill | **DELVIST** | Baseline og kontrolmekanik findes; F-C1-6/7/8 åbner falske kills. |
| Pkt. 4: D11 | **DELVIST** | Negativ-ID og ens run-ID kræves; konkret observation efterprøves ikke. |
| Pkt. 5: D12 | **DELVIST** | Ukendte afhængigheder/cykler/global udeladelse afvises; effektrelationen kan være tom. |
| Pkt. 6: produceret komplet proof | **MANGLER som samlet kontrakt** | Ingen leveret produktionskobling fra engine + prover til efterprøvelige resultater; flag accepteres. |
| Frit-pas-manifest | **DELVIST** | Grammatik og mængdeafledning findes; entydig plan-gatet kilde og fuld atomar dækning mangler. |

Alle fund ovenfor er materielle for C1/C2 før første bid. De er ikke krav om, at den syntetiske integration allerede skal implementere hele lokationspakken.

**Mutant-tabel / angrebs-spec**

*Kørselsangivelserne nedenfor gælder kode i hukommelsen gennem de faktiske case-/verifierfunktioner, ikke Postgres. Ingen mutantfiler er skrevet.*

| Værn → targeted mutant | Prøve og krævet effekt | Observeret |
|---|---|---|
| H:132 → fjern form-binding | FS-case på UT/MH-forpligtelse skal afvises | Original `protokol-fejl`; mutant `opfyldt`: **dræbt lokalt**. Verifierens selvstændige formkontrol skal bevares. |
| V:216 → fjern komplethed pr. form | Udelad FS, behold øvrig dækning | Original rød; mutant grøn: **dræbt**. |
| V:242 → fjern D10-negativkobling | To negativer deler guard; kill kun det ene | Original D10-rød; mutant grøn: **dræbt**. Supplér med F-C1-9’s forkert-form-angreb. |
| V:117 → tillad `proof.ks` | Indsæt rogue K-felt | Syntakstesten dræber mutanten. **Ikke selvstændigt meningsfuldt scope-kill:** forventningen kommer stadig fra manifestet. F-C1-1 skal testes særskilt. |
| H:167 → fjern tilstandsassertion | Negativ afvises korrekt, men ændrer state | Original `brudt`; mutant `opfyldt`: **dræbt**. |
| Controls → tillad tomme controls | Mutation ødelægger både mål og nødvendig kontrol | **Allerede tilladt:** `killed:true`, mens anden case er brudt. Kræv låst relevant kontrolmængde, ikke en vilkårlig tæller. |
| Manifestkilde → vælg alternativt manifest | Samme plan/commit, færre K/negativer | **Angrebet passerer nu**; skal blive rød ved kildens binding. |
| Reject → byt domænegrund, behold kode / uvedkommende exit 1 | Korrekt negatividentitet skal efterprøves | **Angrebene passerer nu**. |
| MH/SA → uvedkommende `42601` | Ingen tilsigtet værnsvækkelse/invariantbrud | **Falske kills nu**, også med grøn kontrol. |
| Restore → ødelæg tidligere grøn kontrol | Ren eftertilstand skal afvises | **Falsk `cleanAfter:true` nu**. |

De meningsfulde kodeændringers beregnede mutantblobs er henholdsvis `de0ecc96cfc1a04a8e2d4da3a2a1557dd83faed2` (form), `dedb456c4ce7e013edc239b0a5671c9e33ee9b0d` (komplethed), `83ff1600994a3dc7dd55cedcb73f481c7e829916` (D10) og `b594ba3c437184067f46bd2d791757b4ca7c1887` (tilstand).

**Bevisbundne forsvar, som jeg accepterer:** UT-rækkefølgen er `positiv → før → negativ → efter`; positivets egen tilstandsændring accepteres korrekt. Mutant-apply’s forudgående stateændring giver ikke alene UT-kill. Rækkesammenligningen bevarer dubletmultiplicitet og understøtter eksplicit orden. Kendt forkert form, manglende form og forkert UT-negativkobling afvises. Apply/restore som ejer er korrekt; effektkald skal fortsat ske som den bundne app-aktør. Et generelt forbud mod identiske observationer ville være over-test—gyldigt genbrug skal bindes, ikke forbydes.

**Navngivne residualer og afgrænsninger**

- **R-CI-AUTENTICITET:** at råresultater faktisk stammer fra de pinnede moduler, den rigtige store, roller og kørsel, kræver betroet runner og C4-transport. Denne residual omfatter ikke de mekaniske mangler i F-C1-1–10.
- **R-PLAN-SEMANTIK:** dommerne skal kontrollere manifestets afledning fra den oprindelige K-forpligtelse. Gyldig grammatik beviser ikke fuldstændig kravoversættelse.
- **R-INTEGRATIONS-PROVENANCE:** loggen angiver 23 beståede checks, herunder syv baselinecases og syv kills. Den dokumenterer ikke en samlet verifieret build-proof; blandt andet har integrationens K-8 ingen mutant til verifierens K-gulv. `PUBLIC`-revoke er en nødvendig fixtureforudsætning, ikke et snydegreb. `WHERE lokation_id=999` beviser tom-resultattransport, ikke K-8’s faktiske synlighedsværn.
- **R-C3-REVIEW:** bestemt reviewer-sæt, aktør og kode-OID hører til det eksplicitte C3-spor. PASS ved samme `base_oid` lukker ikke C3.
- **R-D14:** ingen nye Proxy-/prototype-/getter-/Symbol-/sparse-angreb er planlagt. Eksisterende cases er bevaret.

Ingen af F-C1-1–10 er lukket ved denne læsegennemgang. Rettelse kræver rettelses-OID og udført efterprøvning mod de oprindelige forpligtelser; implementeret effekt kræver de relevante kørsler og targeted kills. At dispensere fra kontrakten kræver Mathias’ ord og HALT. Dette FAIL er det blokerende P2-input til den samlede gate-afgørelse.