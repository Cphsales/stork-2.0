# C1-runde 4: **FAIL**

**M/A/G/E/P: PASS. H/V/integrationsrunneren: FAIL.** Flere rettelser er bevist, men v2.3 accepterer fortsat ugyldige observationer og beviser. Workflowplanens »F-20..27 — alle lukket« holder derfor ikke.

Dommen er blokerende input til gaten. Den er ikke den endelige menneskeafgørelse.

## 1. Moduldomme og inputbinding

| Modul | Dom | Verificeret blob-OID |
|---|---|---|
| M — `forventnings-manifest.mjs` | **PASS** | `f43796cf27ec34b90b1afe821759da3a66c0b3dd` |
| A — `angrebs-spec.mjs` | **PASS** | `e768060dc551e347fcc82362e1fc716251e9022e` |
| H — `build-harness.mjs` | **FAIL** | `4087d9d224fb145f7a9d2bb6c561d759a9bfe93a` |
| V — `build-proof.mjs` | **FAIL** | `7fdcab2424e184a93792e5dce98380de7bb4f914` |
| G — `gates.mjs` | **PASS** | `7210d6d63f227a90f9774278516e78a0db69fce3` |
| E — `gate-eval.mjs` | **PASS** | `227ab027396821817e0b5d2e6fa53d1b84b0db95` |
| P — `prover.mjs` | **PASS** | `c121b9fc0321d6a87e2dc22dd9d12f7c4c520bd3` |
| I — `build-harness.integration.mjs` | **FAIL** | `ce5b25f6f0bd6929d4f5a0e9e3d3a91492363173` |

**M/G/E/P er byte-identiske med runde 3’s PASS-blobs.** Deres afgrænsede domme videreføres: manifestafledning, gate-bindinger, Git-resolution/layout og proverens kørsels-/resumékontrakt. M’s 61 selvtests er desuden genkørt.

**A-PASS** bygger positivt på kompletheds-/D10-kontrollen og de efterprøvede rettelser: forkert fase og aktør afvises i både exit og SA; case-/mutant-ID-kollision afvises. Alle 36 selvtests bestod. PASS attesterer ikke den konkrete pakkes endnu manglende manifest/spec.

| Øvrigt input | Verificeret blob-OID |
|---|---|
| Hele deltaet | `3d0ef36852f497305584958cf8b5943e46193bf2` |
| C1-R3-FUND | `1c494c9cf142025b3093d515e3c57e389a7057bd` |
| Integrationslog | `f2bcc3a922d1a9a22d30054f066bd8c48407f9dd` |
| B2-leverance | `460a9b26db03f88ba148c42daaaf525e1120db5a` |
| Låst forventningsliste | `2200b76e29b52f7084c0bfe003c0a2e8121c2346` |
| P-8-spec | `4af07ef4164882ca54643e79df3554c0bf22b0e4` |
| Workflowplan | `a3fa6bbd7fa9626e6d1a4c98f89d26673682d187` |
| Rolletekst | `f6e64979941b55b57d6000306ccf9404dd2a15d1` |

Snapshot’et har ingen `.git`. Hashene er beregnet som Git-blobhashes over filernes bytes. **Alle syv efterbilleder og rekonstruerede førbilleder i deltaet matcher diffens OID-præfikser**, herunder A/H/V’s runde-3-blobs. Commit-tilhørsforhold er ikke selvstændigt verificeret.

Jeg har ikke skrevet filer eller brugt web.

### Kørselsgrundlag

- Uændrede selvtests genkørt: **M 61, A 36, H 130 — alle grønne**.
- V’s **80** selvtests bestod med repository-/Git-I/O erstattet af en model i hukommelsen.
- Egne JSON-, processtrøms- og kodemutantprober udøvede de faktiske dommere og `evaluateGate`.
- Exitprober omfattede virkelige Node-processer.
- Postgres-integrationen og repositorieskrivende tests blev ikke genkørt.

**»Gate åben« nedenfor betyder den eksekverede verifier-/gate-sti med modellerede Git-opslag.** Transportproberne anvendte den faktiske runnerkode med kontrollerede processtrømme.

## 2. Efterprøvning af F-20..27

| Fund | Delta-dom |
|---|---|
| **F-20** | Setup-/action-udeladelserne er rettet med bevis, også i 15 afprøvede indlejrede placeringer. Kaldudfaldenes gyldighed er fortsat utilstrækkelig: **F-28**. |
| **F-21** | **Rettet med bevis.** Null/objekt/fejlet footprint forhindrer kill; manglende måling forhindrer også restore-attestation. Targeted kodemutant dræbt. |
| **F-22** | De fire tidligere ugyldige SA-kills afvises nu. Det accepteres. Den generelle kill-definition er samtidig indsnævret: **F-29**. Runnerens invariantmåling har desuden **F-33**. |
| **F-23** | Crash uden diagnose afvises korrekt, også med virkelig Node-proces. Modstridende klasselinjer kan stadig skjules: **F-30**. |
| **F-24** | **Rettet med bevis** for den mekaniske fase-/aktørbinding gennem A/H/V, inklusive indlejrede resultater. Faktisk runtime-kontekst forbliver runnerens ansvar. |
| **F-25** | Guard→mutant→target-case-bindingen er rettet. Source-anchor-/traceforbindelsen er fortsat utilstrækkelig: **F-31**. |
| **F-26** | **Rettet med bevis.** Kollisioner, dubletter, fremmede/manglende ID’er og ikke-streng-elementer afvises. Entydighedsmutanten dræbt. |
| **F-27** | Den konkrete markørrettelse virker, og hel-linje-mutanten blev dræbt. Data og fejldiagnostik er stadig sammenblandet: **F-32**. |

## 3. Materielle fund

### F-C1-28 — Et selvmodsigende SQL-udfald bliver et gyldigt kill

**Krav:** B2 resultatkontrakt og pkt. 3: uvedkommende fejl er ikke kills. F-20’s gyldige kaldudfald.  
**Kode:** H:68–70, 144–150, 208, 333.

Eksekveret på UT-målet under mutanten:

```json
{
  "ok": true,
  "code": "42601",
  "detail": {"message": "syntax error", "routine": null}
}
```

Resultat:

```text
killed:true · restored:true · cleanAfter:true
verifyBuildProof.ok:true · gate.open:true
```

`kaldGyldig` accepterer værdierne, og `klasse()` lader `ok:true` overtrumfe fejl-SQLSTATE’en. En synlig syntaksfejl bliver dermed fortolket som tilladt forbudt handling.

**Nødvendig rettelse/angreb:** Afvis selvmodsigende kaldudfald før formdommen. Gentag konflikten på positive/negative/action/a/b og i mutantfaserne; den skal give protokol-fejl og aldrig kill.

`kaldGyldig` tillader faktisk også udeladt `code`/`detail`. Fraværet alene er ikke mit blokerende argument; den accepterede succes/fejl-modstrid er.

### F-C1-29 — SA-kill udelukker et gyldigt invariantbrud

**Krav:** B2 pkt. 3: »den navngivne invariant brydes under den krævede race«; K-2/ac-6: ingen committed tilstand med nul aktive stande.  
**Kode:** H:211–215; H-selvtesten betegner korrekt afvisning plus invariantbrud som et »inkonsistent billede«.

**BEGGE ok+commit er for stramt som generel SA-regel.** Den committende session kan bryde invarianten, mens den anden afvises korrekt.

Konkret modmodel:

1. Minimum kontrolleres under parent-lås før opdateringen.
2. Én targeted mutant udvider opdateringens prædikat fra én stand til lokationens stande.
3. A ser to aktive stande, opdaterer begge og holder transaktionen.
4. B venter på parent-låsen; tredje session observerer overlappet.
5. A committer nul aktive stande.
6. B får låsen, observerer nul og afvises med den korrekte minimumsgrund; B rollbacker.

Den eksekverede transaktionsmodel i hukommelsen gav:

```text
baseline: opfyldt
under: brudt; invariant-efter-commit:false
sessions/overlap/aktør/fase/afvisning/afslutning: gyldige
judgeKill.killed:false
```

Dette er en **kontraktmodmodel, ikke en Postgres-kørsel**. Den viser indsnævringen i den faktiske dommer.

**Nødvendig rettelse/angreb:** Bevar kravene til gyldigt raceforløb, men tillad det dokumenterede invariantbrud med én korrekt afvisning. Bevar samtidig runde 3’s fire afvisningsprøver. En generel indskrænkning af B2 til »begge committer« kræver et ændret mandat; den er ikke lukket ved at skrive den ind i v2.3-beskrivelsen.

### F-C1-30 — Første klasselinje skjuler en modstridende diagnose

**Krav:** K-7/ac-1, K-1/ac-4; B2’s entydige leveranceafvisning.  
**Kode:** H:261–263.

En virkelig Node-proces afleverede exit 1 og:

```text
klasse=klassifikation
klasse=ENOENT
```

`find(Boolean)` beholdt kun første linje:

```text
status:opfyldt
klasse_observeret:"klassifikation"
verifyBuildProof.ok:true · gate.open:true
```

Den anden klassifikation bliver fjernet før dommeren ser den.

**Nødvendig rettelse/angreb:** Bevar og kontrollér klasselinjernes entydighed. Modstridende klasser skal give protokol-fejl uanset rækkefølge.

**Vejning af spørgsmål C:** En enkelt anden klasse → protokol er korrekt med den nuværende låste kontrakt. Det åbner ingen gate og foregiver intet kill. En generel `klasser`-mængde er ikke nødvendig før første bid. Den bliver relevant, hvis en konkret låst mutant skal dræbes gennem et andet meningsfuldt klassifikationsudfald. F-30 kræver ikke sådan en skemaudvidelse.

### F-C1-31 — Et rent kommentarcitat accepteres som eksekveret source-anchor

**Krav:** B2 pkt. 6 og workflowplan §2.C: den planbundne forbindelse mellem reviewer-claim, runtime-trace, source-anchor og mutant.  
**Kode:** V:73–79, 217–246.

Eksekveret med ellers uændret grønt proof: claimets source-anchor blev flyttet til et Git-verificeret uddrag i `plan/plan.md`:

```text
<!-- lokation_opret: this is a comment, no implementation -->
```

Resultat:

```text
verifyBuildProof.ok:true · gate.open:true
```

Den syntetiske ankerblob var `2720c6d3a4b9a9aa45c3e4d3c2af97f484df1134`.

**Det rettede forsvar accepteres:** To mutanter på samme guard med forskellige target-cases blev efterprøvet. Begge cases medtaget → grøn; den anden target-case udeladt → rød. Et claim kan ikke længere låne denne mutants kill ved blot at dele K.

Men `excerpt.includes(sym)` beviser hverken ankerets runtime-forbindelse eller, at det er det anker, revieweren låste. Bevisproducenten kan stadig vælge et nyt uddrag. Unqualified symbol-inklusion er også en dårlig generel nødvendighed: et relevant ACL-/policy-anker behøver ikke nævne den offentlige routines navn.

**Nødvendig rettelse/angreb:** Bind de relevante claims til deres godkendte anker-/trace-relation og kontrollér den konkrete udførelse. Kommentarsubstitution og substitution med et andet værns anker skal afvises. Der kræves fortsat ikke claim_graph for hvert K eller en generel SQL-semantikvalidator.

### F-C1-32 — Produktdata kan udgive sig for en afvisning

**Krav:** F-27’s resultatindramning; B2 UT/SA kræver faktisk, bundet afvisning.  
**Kode:** I:63–65, 83–88, 135–141.

Med den faktiske `session()`/`race()`-kode gav følgende **data i resultatstrømmen**, før den korrekte nonce-markør:

```text
ERROR:  P0001: min_en_stand
CONTEXT:  PL/pgSQL function f.stand_deaktiver(int) line 1 at RAISE
```

Resultat:

```text
B.ok:false · B.code:P0001 · B.commit:rollback
SA.status:opfyldt
```

Runneren fremstiller selv rollbacken ud fra den falske fejldetektion. Flerlinjedata/diagnostik kan bære teksten; ingen markørnonce behøver være kendt.

Integrationens prøve med `ERROR: falsk` dækker kun tilfældet uden en komplet SQLSTATE/routine-diagnose.

**Nødvendig rettelse/angreb:** Adskil data og protokoludfald ved indsamlingen. Tilføj komplette falske ERROR/CONTEXT-data samt data efterfulgt af en virkelig fejl med en anden kode. Ingen af dem må blive den krævede afvisning.

### F-C1-33 — Manglende/fejlet rækkesætmåling bliver til `rows=[]`

**Krav:** B2 FS/SA og fælles resultatkontrakt; især K-8/ac-4 og de to SA-invarianter.  
**Kode:** I:55, 58, 137–141.

To eksekverede veje:

| Rå udfald | Runnerens fortolkning | Dom |
|---|---|---|
| Tom stdout, JSON `null` eller JSON `{}` fra querytransporten | `ok:true, rows:[]` | FS med `expect:empty` bliver **opfyldt** |
| Invariant-query fejler med `22012` efter begge sessions commit | `dockerPsql` giver `ok:false, rows:[]`; `race()` kasserer `ok` | Scalar-invarianten bliver **brudt**, og **SA-kill accepteres** |

Sidste vej gav:

```text
killed:true · restored:true · cleanAfter:true
verifyBuildProof.ok:true · gate.open:true
```

**Nødvendig rettelse/angreb:** Querytransporten skal bevare forskellen på et komplet tomt rækkesæt og manglende/ugyldigt output. `race()` skal afvise en fejlet invariantmåling før den afleverer `invariantRows`. Fejlet måling må hverken attestere invariantbrud eller korrekt tomt svar.

## 4. Krævet mutant-tabel — eksekveret

**DRÆBT** betyder her: samme angrebsobservation afvises med originalkoden og slipper igennem med kodemutanten; den gyldige kontrolsti består. Status/assertions genudledes for begge kodevarianter.

| Værn → meningsfuld kodemutant | Angrebsinput | Resultat | Mutant-blob-OID |
|---|---|---|---|
| Fjern `has_setup`-projektion | Slet foreskrevet setup-observation | **DRÆBT** | V `438f96b9fe3f50f23d76cb636a3458d6a7cdf73a` |
| Fjern `has_action`-projektion | Slet foreskrevet FS-action | **DRÆBT** | V `57a8f8e424f814af0ae6c106c9b09d3de16a7439` |
| Fjern tre gyldige `fpRows`-målinger | `footprint_under:null` | **DRÆBT** | H `fd84e7b21c4cb395207f90782e71e8e893a3e984` |
| SA-kill kræver kun invariantbrud | `overlap.observed:false` under mutanten | **DRÆBT** | H `bfd4be878bbff9bd187ac0de2f77f257462738ef` |
| Tillad manglende exit-diagnose som brud | Exit 1 uden klasse | **DRÆBT** | H `d982acc8013ca712501de9c998f28590aa20992b` |
| Fjern fasebinding i dom/projektion | Forkert fase i exit og SA | **DRÆBT** | H `f20bd1f1c6758988d0c7378cffafb55f9981564b` + V `6171bd9e5895312e5119157cffc03ae294e99311` |
| Fjern claimets guard-/target-case-binding | Andet guard og manglende target-case | **DRÆBT** | V `d17e221979d614b168e5e145fd96193adb1110ee` |
| Fjern `executed_ids`-entydighed | Erstat ét ID med en dublet; samme antal | **DRÆBT** | V `25c270f9cb347f2793c0c8f115da5876870fd0f6` |
| Fjern hel-linje-match på markøren | Markør som delstreng i data før virkelig fejl/markør | **DRÆBT gennem transportstien** | I `233230405d5b46d2c4d97c32e575b60bf8905bfb` |

**Redundans, ikke et nyt hul:** Sletning af alene H:133 overlever prøven, fordi H:134 stadig afviser `null`. Den variant har OID `e15200dcbd7ae365ed7d4a7614cbe56c088d947b`. Den meningsfulde mutant ovenfor fjerner manglende-diagnose-afvisningen gennem begge overlappende betingelser. D10 kræver ikke, at et redundant værn isoleret gøres nødvendigt.

F-28..33’s konkrete modprøver er tillæg til kill-listen. Der foreligger endnu ingen rettelse og dermed intet dræbt rettelsesmutantbevis for disse fund.

## 5. Afgrænsning af A/B/D/E

- **Observe-SQL og checkpoints:** SQL’en er ikke spec-projiceret. Checkpoint-/vidne-ID’er, rækkefølge og orakler er bundet; motoren henter SQL’en fra spec’en. En ekstra producentleveret SQL-streng eller SQL-hash ville ikke bevise udførelsen. Den faktiske anvendelse af den låste SQL hører til **R-RUNNER-UDFØRELSE**. Jeg kræver ikke en sådan ekstra streng som lukning af F-20.
- **Overlapvidnet:** PID-kontrollen beviser intern identitetsbinding. At tredje backend faktisk observerede de relevante samtidige transaktioner, bæres af den betroede runner. `a_pid/b_pid` kopieres fra argumenterne; de er ikke selvstændigt målebevis. Integrationsrunnerens separate `q1`-query er den konkrete målevej. Dette er **R-RUNNER-OVERLAP**.
- **Nonce via `pg_stat_activity.query`:** Jeg finder ingen sådan lækvej i denne kode. Markøren sendes som psql-kommandoen `\echo` efter SQL’en. F-32 kræver heller ingen nonce-lækage.
- **ID-typer:** `null`, tal, objekt, array og boolean i `executed_ids` blev alle afvist. Ingen rest-F-26 på disse dataformer.
- **Kontrolvalg:** En generel regel om, at enhver positiv gren skal bestå under enhver UT-mutant, ville være for bred; eksempelvis kan inversion af ét værn tilsigtet ændre begge udfald. De nødvendige kontroller skal vælges og bindes ud fra den konkrete mutant ved plan-gaten.

## 6. Kontraktdækning mod B2

Status gælder **adapterkontrakten**, ikke implementeret lokationsfunktionalitet.

| B2-del | Status | Materiel rest |
|---|---|---|
| Tabel 1 — UT | **DELVIST** | F-28 og F-30; integreret transport F-32 |
| Tabel 1 — FS | **DELVIST** | Kerne/orakler/setup/action mødt; transporten kan opfinde tomt svar, F-33 |
| Tabel 1 — MH | **DELVIST** | Handling/vidner og kills findes; udfaldsintegritet F-28 samt konkret apptransport |
| Tabel 1 — SA | **DELVIST** | F-29, F-32 og F-33 |
| Fælles resultatkontrakt | **DELVIST** | Identitet/form/run/spec-binding mødt; modstridende og tabte observationer accepteres |
| Reject-felter | **DELVIST** | Fase/aktør og præcis SQL-grund bindes; diagnoseindsamlingen har F-28/30/32 |
| Pkt. 1 — forventninger/cases | **MØDT mekanisk mod bundet manifest/spec** | Pakkens konkrete afledning skal dømmes |
| Pkt. 2 — meningsfuld mutant | **MØDT mekanisk for deklaration/footprint** | Locus-, kontrol- og footprinttilstrækkelighed er plan-gatens indholdsdom |
| Pkt. 3 — formbestemt kill | **DELVIST** | F-28/29/33 |
| Pkt. 4 — D11 | **DELVIST** | Negativ/run/kontrakt bindes; den reelle diagnose skal bevares |
| Pkt. 5 — D12 | **MØDT mod bundet spec** | C4 skal levere spec-legitimitet og produktionskobling |
| Pkt. 6 — komplet produceret proof | **DELVIST** | F-31; C4’s friske udførelsesregister og proveradapter |
| Frit-pas-manifest | **MØDT som mekanisk kontrakt** | Komplet pakkeinstans mod den låste liste foreligger ikke her |

| B2 tabel 2 | Status | Afgørende rest |
|---|---|---|
| K-1 | **DELVIST** | UT-/exit-integritet; konkrete atomaritets- og prisforløb |
| K-2 | **DELVIST** | Gyldigt SA-kill og vellykket committed invariantmåling |
| K-3 | **DELVIST** | Konkrete arv-/lokalitetsforløb, kontroller og aktørkontekster |
| K-4 | **DELVIST** | Komplet status-/historikkæde og troværdige observationer |
| K-5 | **DELVIST** | Stop-/hvileeffekt og bundne kontroller |
| K-6 | **DELVIST** | Dublet-race samt request/approval/undo/due/apply og historik |
| K-7 | **DELVIST** | Entydig leveranceafvisning; faktisk anonymisering/replay |
| K-8 | **DELVIST** | Tomt svar skal være målt; hele adgangsfladen og non-bypass-kontekst |
| K-9 | **DELVIST** | Hele API/RPC-fladen, målrettede adgangs-/eksponeringskills og relevante traces |

**Før første bid:** C1/C2’s kodehuller skal rettes og efterprøves; pakkens manifest/spec, kontroller og kill-list skal være komplette og låst efter processen. Den låste listes §5 kræver adapter-PASS før første bid, men gør ikke B6/B7 afhængige af adapter-PASS.

## 7. Navngivne residualer og disposition

- **R-RUNNER-UDFØRELSE / R-CI-AUTENTICITET:** faktisk SQL/API, store, rolle, ejerskab, settings og råresultaternes oprindelse. C4’s produktionsrunner skal bære dette. Dækker ikke de påviste parse-/dommerfejl.
- **R-RUNNER-OVERLAP:** den faktiske tredje-backend-observation og dens timing. PID-lighedskontroller autentificerer ikke observationen.
- **R-PLAN-SEMANTIK:** nødvendige kontroller, mutationens locus, orakler og footprintets dækning af mutation/restore. **Inden for allerede delegeret valg**, jf. workflowplan §2.C’s dybde-ansvarsdeling.
- **R-SPEC-LEGITIMITET / R-PREDECESSOR-WIRING:** C4 skal føre autoriseret, før-build-frosset spec og frisk plan-dom frem til build-gaten.
- **R-PROVER-REGISTRERING:** C4’s friske testregister, udførelsesregistreringer og afstemning. I:281–293 konstruerer fortsat `executed_ids` og proverresumé fra spec-ID’erne; integrationen beviser derfor ikke dette C4-led.
- **R-INTEGRATIONS-PROVENANCE:** Loggen indeholder faktisk 41 grønne checks, og koden omfatter nu K-8-mutant samt fuld spec-/proof-verifikation over motorens resultater. Disse forbedringer accepteres. Loggen er indsendt kørselsmateriale; jeg har ikke genverificeret Postgres-versionen eller kørslen mod rå Git-/proof-artefakter.
- **R-C3-REVIEW:** bestemt reviewer-sæt og præcis kode-OID.
- **R-P8-SLUTPRØVE:** fuld population, held-out udtræk, canaries og ubrudt produktkæde. Skal produceres på P-8’s tidspunkt; integrationens syntetiske udsnit attesterer det ikke.
- **R-LOKAL-CANDIDATE:** DEL VIII pkt. 36’s daterede fabrikbeslutning behandles som mandat for lokal candidate-drift. Den giver ikke CI-autoritet eller autenticitet før C4. Dette genåbnes ikke som et nyt C1-mandatkrav.
- **R-D14:** den frosne JS-runtimeklasse er respekteret; ingen nye angreb i den klasse.

**F-C1-28..33 er åbne, ikke residualer.** Lukning kræver rettelses-OID og efterprøvning mod de oprindelige forpligtelser med de angivne modprøver. Fastholdelse af en svagere kontrakt kræver Mathias’ ord og HALT; en beskrivelse af indsnævringen lukker den ikke.