**Samlet dom: FAIL — C1/C2 kan ikke erklæres opfyldt før første bid.** Flere rettelser holder, men genudledningen accepterer fortsat selvmodsigende kontrakter, ommærkede mutantresultater og ubevist renhed. Dokumentets »alle lukket« holder derfor ikke.

| Modul | Dom | Verificeret blob-OID |
|---|---|---|
| `forventnings-manifest.mjs` — **M** | **PASS** | `f43796cf27ec34b90b1afe821759da3a66c0b3dd` |
| `build-harness.mjs` — **H** | **FAIL** | `f4959f4bb431030637f3b03ec643e21335c8f615` |
| `build-proof.mjs` — **V** | **FAIL** | `72c1c50daff093babbe1a9115ec6fe0b08ef9f8e` |
| `gates.mjs` — **G**, kun det angivne delta | **PASS** | `5f1f67ef1875d13c8664998081ab9cbdc34d29a0` |
| `gate-eval.mjs` — **E**, kun det angivne delta | **PASS** | `25bdcc7ce08292a8d3d32d7bc998c9a3ba5be710` |

PASS for M er positivt begrundet i ID-/form-/negativafledningen, eksplicit alias-ekspansion, synlig deloverdragelse og afvisning af ugyldige relationer. PASS for G/E gælder manifestbindingen og layoutet; den endnu manglende produktionskobling til `build-gate-run` er ikke dermed bevist.

Jeg har ikke skrevet filer eller brugt web. Snapshot’et indeholder ingen `.git`. Git-blobhash er beregnet over filernes bytes; **alle 11 efterbilleder og rekonstruerede førbilleder i hoveddeltaet matcher diffens OID-præfikser**. Det særskilte G/E-delta matcher også. Commit-tilhørsforhold er ikke selvstændigt verificeret.

| Øvrigt input | Verificeret blob-OID |
|---|---|
| Hoveddelta | `f682d6784ee674e8486b4d26d2cca6e256b1563c` |
| G/E-delta | `d762d677ed2a4ce2d6bf5d719a0665f3715bfaa2` |
| C1-R1-FUND | `53cdb1104f1f8099def4fa4637a076cc59dfbd4a` |
| B2-leverance | `460a9b26db03f88ba148c42daaaf525e1120db5a` |
| Låst forventningsliste | `2200b76e29b52f7084c0bfe003c0a2e8121c2346` |
| P-8-spec | `4af07ef4164882ca54643e79df3554c0bf22b0e4` |
| Workflowplan | `e84a705bec7bbdafd4cf94b15bc0e5ee3f7ee311` |
| Integrationslog | `c08f51aafb6fa53d228d8806778a747c926dc249` |
| Integrationskode — **I** | `07aebf6f4a90aedbbf62971dc2f8372a294ccdb8` |

**Kørselsgrundlag:** eksisterende manifest-selvtest **61/61** og harness-selvtest **82/82**. Egne prober og kode-mutanter kørte udelukkende i hukommelsen gennem de faktiske moduler. Verifierproberne brugte modellerede Git-opslag og den faktiske `evaluateGate`/proof-router. De beviser accepteringsveje i logikken, ikke autentificeret Git-, CI- eller Postgres-effekt. Selvtests, der skriver midlertidige repositories, og Postgres-integrationen blev ikke genkørt.

**Delta-lukning af runde 1**

| Oprindeligt fund | Efterprøvet resultat |
|---|---|
| F-C1-1: manifestvalg | **Rettet i de undersøgte moduler.** Gate-binding, forgængersammenligning og fast standardlayout holder. Produktionskoblingen afventer særskilt bevis. |
| F-C1-2: navngivne delbeviser/alias | **Rettet for navne, former og ekspansion.** Delbevisernes indhold kan stadig svækkes: F-C1-13. |
| F-C1-3: selvrapporterede flag | **Ikke lukket.** Genudledning virker, men mangler kontrakt-/identitetsbinding og komplet proof-afstemning: F-C1-11–13/19. |
| F-C1-4: reject-kontrakt | **Ikke lukket.** SQL-token/routine og exit-diagnose forbedret; kanal, fase og aktør har huller: F-C1-11/14/15. |
| F-C1-5: observationer/orakler | **De konkrete runde-1-veje er rettet.** Afviste observationskald og de prøvede manglende/ikke-endelige scalarværdier bliver protokolfejl. |
| F-C1-6: meningsfuldt kill | **Ikke lukket.** `42601` afvises korrekt i SQL-sporet; andre falske kills består: F-C1-12/13/15. |
| F-C1-7: restore | **Ikke lukket.** Kontroller genkøres, men deres identitet, fuldstændighed og tilstand før setup bindes ikke: F-C1-16. |
| F-C1-8: SA/integration | **Ikke lukket.** PID-barrieren er forbedret; protokol- og runnerhuller består: F-C1-15/17. |
| F-C1-9: FS med negativ-ID | **Den direkte vej er rettet.** D10 kan stadig omgås gennem indlejret formskift: F-C1-12. |
| F-C1-10: tomt effekt-bid | **Den konkrete tomme ejer er rettet.** Den låste forudsætningsrelation kan stadig slettes: F-C1-18. |

De rettede dele accepteres ved ovenstående rettelses-OID’er og kørsler. De resterende dele er åbne fejl, som blokerer; de lukkes ikke ved at kaldes residualer.

**F-C1-11 — SQL-negativ kan erstattes af et exit-resultat**

**Type:** manglende effektbevis. **Evidens:** H:110 vælger exit-grenen ud fra tilstedeværelsen af `obs.exit`. V:167 kontrollerer SQL-kontraktfelterne, men kræver ikke, at netop SQL-observationsformen er brugt.

Eksekveret: behold SQL-kontraktens krævede felter, tilføj `exit_code`/`klasse` og et matchende `exit`-objekt, og fjern `positive`, `negative`, `state_before` og `state_after`.

```text
judgeObservations → opfyldt
verifyBuildProof  → ok:true
evaluateGate      → open:true
```

**Rettelse:** lad den låste kanal bestemme observationsvarianten; kræv variantens komplette felter og afvis blandede SQL-/exit-payloads. **Materialitet:** D11 kan godkendes uden SQL-forsøget. Dette er en konsistensfejl, ikke spørgsmålet om runnerens ægthed.

**F-C1-12 — Indlejrede mutantresultater kan skifte forpligtelse, kørsel og form**

**Type:** falsk D10-kill. **Evidens:** V:199 genudleder indlejrede resultater, men binder ikke deres forpligtelse, form, negativ, kontrakt, bid eller run-ID til den autoritative case. V:228 sammenligner `m.break_form` med topniveauets målform, **ikke med `judgeKill(m).break_form`**.

Følgende uafhængige prober gav alle `ok:true` og `open:true`:

- Alle indlejrede resultater fik `run_id:"OLD-RUN"`, fremmed forpligtelse og fremmed bid.
- Sidste-stand-UT-resultater blev ommærket med blank-navn-casens ID.
- Blank-navn-mutantens `under` blev erstattet med et FS-prisbrud. `judgeKill` udledte **FS**, mens proofen angav **UT**; det talte stadig som blank-navn-negativets D10-kill.

**Rettelse:** bind hvert delresultat til case-/spec-identitet, run og mutantfase; efterprøv den samme låste kontrakt ved alle genkørsler. Sammenlign den faktisk genudledte brudform med målformen. **Materialitet:** én anden cases brud kan opfylde et uafprøvet eneste-værn-negativ.

**F-C1-13 — Navngivne vidner har stadig et producentvalgt orakel og en producentvalgt angrebs-spec**

**Type:** forventningsindsnævring/falsk meningsfuld mutation. **Evidens:** H:134/145 sammenligner med `expect` fra observationerne. V:189 kræver navnet, men binder ikke oraklet til en autoritativ case-/målespec. V:110 kontrollerer angrebs-spec’ens path/OID uden at efterprøve dens kontrakt.

Eksekveret med uændret manifest:

```text
audit-row: rows=[] og expect={kind:"empty"} → gate åben
pris/historisk pris og begge expect-værdier ændret → gate åben
angrebs-spec skiftet til anden fil med {"mutants":[]} → gate åben
```

En engine-probe ændrede kun lagret pris ved mutant-apply, uden at ændre produktlogik: `killed:true`, `restored:true`, `cleanAfter:true`.

**Rettelse:** bind den anvendte målespec og dens orakel, målassertion, nødvendige kontroller samt mutationslocus til det plan-godkendte input. Dynamiske orakler kan bindes ved beregningsspec og input; de behøver ikke være konstante værdier. Efterprøv mutationens tilsigtede aftryk.

**Materialitet:** et navngivet auditvidne kan bevise fravær af audit, og en ren dataændring kan tælle som konfigurationskill. Plan-gaten ejer indholdets tilstrækkelighed; verifieren skal bevare forbindelsen til det indhold, der blev dømt.

**F-C1-14 — Fase og aktør er ikke konsekvent bundet**

**Type:** forkert forsøg tæller som korrekt afvisning. **Evidens:** H:225 gemmer `obs.fase`, men dommeren bruger den ikke. V:133 udelader fase. SA-observationerne udelader aktøren, og V:173 indsætter manifestets aktør i sammenligningen.

Eksekveret:

- UT med kontrakt `wrapper`, observeret fase `apply`: **opfyldt**, gate åben.
- UT med `actor_role:"postgres"` og `obs.aktoer:"app_role"`: gate åben.
- SA kørt gennem `runCase` med `case.actor.role:"postgres"` mod kontraktens `app_role`: **opfyldt**, gate åben.

**Rettelse:** bind fase, aktør og den relevante probe/signatur til kontrakten; kontrollér indbyrdes lighed mellem casens metadata og observationerne. **Materialitet:** især wrapper/apply-negativer i K-6 og adgangsbeviserne i K-8/K-9 kan erstattes af et andet forsøg.

**F-C1-15 — Ugyldigt SA-forløb og procesfejl kan stadig dræbe**

**Type:** mutant tæller uden det krævede brud. **Evidens:** H:148–176 og H:281.

Eksekveret:

| Under mutant | Resultat |
|---|---|
| SA uden PID’er, uden observeret barriere og uden commitfelter; invariant afviger | `brudt`, `killed:true` |
| SA med anden afvisningsgrund/klasse, mens invarianten stadig er korrekt | `killed:true` |
| Exit-kontrol stopper med **127**, uden klasselinje | `killed:true`, restored og clean |

**Rettelse:** manglende sessions-/afslutnings-/overlapbevis skal være protokolfejl. SA-kill skal dokumentere den låste raceforpligtelses faktiske brud under et gyldigt forløb. Når produktlåsen muteres væk, kræves et uafhængigt overlapvidne. Exit-kill skal skelne bortfald af den krævede afvisning fra en proces, der ikke fungerer.

**Materialitet:** B2’s udtrykkelige udelukkelse af uvedkommende fejl og ustartbare mutantforløb håndhæves ikke.

**F-C1-16 — Clean-beviset kan skifte kontroller eller reparere skaden før målingen**

**Type:** falsk restaureringsbevis. **Evidens:** V:221–223 kræver ikke samme kontrolmængde på tværs af faser. Indlejrede kontroller efterprøves heller ikke for manifestets komplette navngivne delbeviser. H:206 kører setup før clean-målingen.

Eksekveret:

- FS-kontrol før mutation, MH-kontrol under mutation og SA-kontrol efter restore: gate åben.
- Historisk checkpoint fjernet alene fra clean-kontrollen: gate åben.
- Restore ødelægger prisopslaget; clean-kontrollens ejer-setup reparerer det før læsning: `cleanAfter:true`.

**Rettelse:** bind samme nødvendige kontrolspec gennem alle faser og verificér hele dens delbevismængde. Observer restaureringsaftrykket før reparerende setup, eller brug isolerede kopier med særskilt restaureringsbevis.

**Materialitet:** en beskadiget eftertilstand kan godkendes. Et generelt forbud mod fixtures/setup er ikke nødvendigt.

**F-C1-17 — Integrationsrunneren er fortsat ikke fail-closed**

**Type:** fejlagtig transport-/rolleobservation. **Evidens:** I:95 ignorerer resultaterne af rolleopsætningen. I:68 afslutter et resultat ved stdout-markøren og læser det stderr-udsnit, der tilfældigvis er ankommet. Commitfelterne udledes gennem samme mekanisme.

Jeg eksekverede de faktiske runnerfunktioner med kontrollerede afhængigheder:

```text
begge SET ROLE-kald returnerer fejl → SA opfyldt
stdout-markør før forsinket ERROR på stderr → session.run: ok:true
```

Dette er transportprober, ikke en genkørsel mod Postgres.

**Rettelse:** kontrollér rolleopsætningen, observer faktisk rolle og relevante settings, og brug en fælles resultatramme for kommando, SQLSTATE og terminalt transaktionsudfald. **Materialitet:** integrationsbeviset kan være grønt under forkert rolle eller efter en fejl, som resultatopsamlingen overser.

**F-C1-18 — En låst forudsætning kan slettes fra proofen**

**Type:** falsk D12-afslutning. **Evidens:** V:94–128 validerer den bidgraf, proofen selv afleverer. `effekt_bid` binder en ejer, men ikke den fulde forudsætningsgraf.

Eksekveret: fjern `bid-1` fra proofen, fjern `bid-2.depends_on` og det tilsvarende review. Fixtureplanen deklarerer stadig forudsætningen.

```text
verifyBuildProof → ok:true
evaluateGate    → open:true
```

**Rettelse:** afled forventede bids og afhængigheder fra en låst maskinlæsbar planrelation og sammenlign proofen med den. **Materialitet:** den rettede kontrol for et tomt effekt-bid forhindrer ikke, at selve forudsætningen forsvinder.

**F-C1-19 — Prover og claim-graph afstemmes ikke mod den komplette kørsel**

**Type:** ufuldstændigt/selvmodsigende samlet bevis. **Evidens:** V:246–276.

Eksekveret proof med seks topniveau-cases:

- `prover_result:{ok:true,tests_run:1,skipped:0,failed:99}`;
- K-1-claim med `executed:false`;
- samme claim henviser til K-2’s mutant.

Verifier og gate blev grønne. Et gyldigt source-citat beviser her kun Git-ankeret; det binder ikke en udført trace til ankret.

**Rettelse:** afstem proverresultatet med det komplette forventede kørselsgrundlag og bind relevante claim-led til samme K, case, assertion, trace og mutant. `claim_graph_refs`’ indholdsejerskab forbliver hos code-reviewer. **Materialitet:** B2 pkt. 6 er fortsat ikke opfyldt; et rettet engine-resumé erstatter ikke den samlede afstemning.

**Manifestkæden og de vejede forsvar**

Manglende `predecessor.bindings_oids`, tomt map og forkert manifest-OID blev alle afvist. JSON med manifestet alene under en `__proto__`-nøgle blev også afvist; det er data, ikke et arvet felt. Egne felter kræves i koden. Ekstra irrelevante nøgler accepteres, men ændrer ikke den krævede manifestlighed; jeg rejser ikke et nit her.

Standardlayoutet resolver én manifeststi pr. pakke og commit. Sammenfald mellem manifest- og plansti afvises. Kontrakten er tilstrækkelig **når kalderen afleverer bindingen fra den faktisk efterprøvede plan-gate**. At kopiere buildets manifest-OID ind i en løs succespost ville ikke være den krævede produktionskobling; den er endnu ikke leveret.

Alias med UT kræver ejerens egne negativer og udvider ejerens forventede former. En deklareret UT-deloverdragelse fjerner de aktuelle negativer, men bevarer dem i råmanifestet og registrerer formen i `overdragetFormer`. Det er synligt for plan-gatens dommere. Formatets mulighed for overdragelse giver ingen tilladelse til at overdrage et oprindeligt nu-krav.

FS behøver heller ikke generelt en separat skrivehandling: et læsekrav kan legitimt opfyldes ved observation. Hullet er manglende binding til den konkrete låste prøve, ikke fravær af `action` i enhver FS-case.

**Kontraktdækning mod B2**

| Kontrakt | Status | Materiel rest før første bid |
|---|---|---|
| Tabel 1: UT | **DELVIST** | Kanal, fase og aktør; F-11/14 |
| Tabel 1: FS | **DELVIST** | Typede svar/checkpoints virker; oraklet er ubundet |
| Tabel 1: MH | **DELVIST** | Navngivne vidner virker; samme vidne kan ændres til forventet fravær |
| Tabel 1: SA | **DELVIST** | PID-barriere findes; protokol, kill og runner svigter |
| Fælles resultatkontrakt | **DELVIST** | Indlejret identitet/run/form og fuld afstemning mangler |
| Reject-felter | **DELVIST** | Token/routine forbedret; kanal/fase/aktør ufuldstændig |
| D10/D12 pkt. 1: forventninger/cases | **DELVIST** | ID-/formkomplethed mødt; målespec-binding mangler |
| Pkt. 2: meningsfuld mutant | **DELVIST** | Målassertion findes; autoritativt locus/spec-aftryk mangler |
| Pkt. 3: formbestemt kill | **DELVIST** | F-12/15/16 |
| Pkt. 4: D11 | **DELVIST** | Topniveauets negativ/run bindes; kanalbypass består |
| Pkt. 5: D12 | **DELVIST** | Tom ejer/cykler afvises; forventet bidgraf mangler |
| Pkt. 6: produceret komplet proof | **MANGLER som samlet kontrakt** | Prover-/trace-afstemning og produktionssamling ikke bevist |
| Frit-pas-manifest | **MØDT for entydig K-/form-/negativkilde** | Semantisk afledning skal dømmes ved plan-gaten |

Tabel 2 er vurderet som **adapterdækning**, ikke som en påstand om implementeret lokationspakke:

| K | Status | Afgørende rest |
|---|---|---|
| K-1 | **DELVIST** | Atomaritet/historisk pris og leverancenegativ skal bindes til prøvens indhold |
| K-2 | **DELVIST** | SA-protokol og reelt minimumsbrud |
| K-3 | **DELVIST** | Arv/fravalg/lokalitet kræver bundne orakler og negativkontekster |
| K-4 | **DELVIST** | Audit-/historikvidner kan svækkes |
| K-5 | **DELVIST** | Stop-/hvileeffekt og kontrolforløb mangler autoritativ binding |
| K-6 | **DELVIST** | Fasebinding, race og historisk kontrol |
| K-7 | **DELVIST** | Exit-procesfejl kan tælle som kill; replay-indhold ubundet |
| K-8 | **DELVIST** | Tomt svar understøttes; faktisk aktør-/adgangsforpligtelse ikke sikret |
| K-9 | **DELVIST** | Offentlig handling og målrettet eksponeringsbrud kræver bundet prøve |

**Mutant-tabel — eksekveret i hukommelsen**

| Værn → mutant | Prøve | Observeret |
|---|---|---|
| Fjern genudledning af topniveau-case | Faktisk pris 90; selvrapporteret grøn mod 100 | Original rød, mutant grøn: **dræbt** |
| Tillad `manifest_ref` | Tilføj alternativ reference | Original rød, mutant grøn: **syntaktdræbt**; feltet bliver stadig ikke forventningskilde |
| Fjern navngivne assertions-krav | Fjern historisk checkpoint | Original rød, mutant grøn: **dræbt** |
| Fjern klasse-regel | MH-handling fejler med `42601` | Original protokol/ikke-kill, mutant kill: **dræbt ved harnessgrænsen** |
| Fjern `predecessorBindings` | Forkert forgænger-manifest | Original lukket, mutant åben: **dræbt** |
| Tillad tomme controls | Kør mutation uden kontroller | Original ikke-kill, mutant kill/clean: **dræbt ved harnessgrænsen** |
| Fjern UT-koblingen samlet | FS-priskill med påsat negativ-ID | Original rød, mutant grøn: **dræbt** |

Kun at fjerne `k.form === "UT"` fra sidste D10-check åbner ikke den direkte vej: negativ-ID-valideringen og nulstillingen på andre former beskytter redundant. Den isolerede mutant kræves derfor ikke dræbt. Den samlede relaxation ovenfor fjerner netop UT-koblingen gennem dens tre håndhævelsespunkter.

Mutantblobs i tabellens rækkefølge:

```text
ef250c0e7e012e0292bab4ec18e600074243fa9f
61a210f912762d763458c51d92a84d730d61dd65
2a63b88ecee011786553ecea54ec9c1b179b41ab
aea54ce11b9805d7f716a64c08cc93e7437a2e7f
eb4a7068921cbac36839e8996a0a2545b23b5a1f
29744b6116f8e80464fd3acd6db82639d37a5a3e
77cb4a74c29efd7d03e5dd4aa95fa4ffc9f88254
```

Supplerende manifestmutant, som fjerner alias-ekspansion, fjernede ejerens UT-form og negativ fra den afledte forventning. Den positive afledningsprøve dræber denne mutant: `6b9fdc911b1f43b5689897678d1bbd1ab2d56f3c`.

**Navngivne residualer og afgrænsninger**

- **R-CI-AUTENTICITET:** ægtheden af fuldt konsistente råresultater kræver den betroede runner, som opgaven udtrykkeligt afgrænser. Det dækker ikke de påviste interne modsigelser.
- **R-PLAN-SEMANTIK:** plan-dommerne afgør oraklers, kontrollernes og kill-listens tilstrækkelighed. Verifieren skal binde udførelsen til netop den dømte spec.
- **R-PREDECESSOR-WIRING:** frisk plan-dom og dens manifestbinding skal føres gennem den kommende build-runner. G/E-PASS er ikke et udført end-to-end-bevis.
- **R-INTEGRATIONS-PROVENANCE:** den leverede log angiver 25 grønne checks, syv baselinecases og syv kills. Den indeholder ikke komplette råresultater eller en verificeret samlet build-proof. Fixtureprodukt, priser, audit og stande er syntetiske, selv om databasen er reel. `WHERE lokation_id=999` beviser tom-resultattransport; integrationens K-8 har fortsat intet kill til verifierens K-gulv.
- **R-C3-REVIEW:** det bestemte reviewer-sæt og kode-OID hører til C3. Denne dom udvider ikke scope dertil.
- **R-D14:** ingen nye angreb i den frosne JS-runtimeklasse.

**F-C1-11–19 er materielle før første bid.** De kræver rettelser og udført efterprøvning; en dokumentændring eller residualbetegnelse lukker dem ikke. En indsnævring af de oprindelige B2-forpligtelser kræver Mathias’ ord og HALT. Dette FAIL er det blokerende P2-input til den samlede gate-afgørelse.