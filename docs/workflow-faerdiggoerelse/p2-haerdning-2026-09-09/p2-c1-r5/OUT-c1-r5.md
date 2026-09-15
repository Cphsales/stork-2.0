# C1-runde 5: FAIL

**M/A/G/E/P: PASS. H/V/integrationsrunneren: FAIL.**

F-29 og F-33 er rettet med bevis. F-28, F-30 og F-32 har materielle resthuller: **F-C1-34..36** nedenfor. F-31’s mekaniske locus-binding virker; locusets semantiske tilstrækkelighed kræver den konkrete plan-dom.

Dette er blokerende input til gaten, ikke den endelige menneskeafgørelse.

## 1. Moduldomme og inputbinding

| Modul | Dom | Verificeret blob-OID |
|---|---|---|
| M — `forventnings-manifest.mjs` | **PASS** | `64ea01e0bbacbc00ceb1e4da6d484b715e899b1d` |
| A — `angrebs-spec.mjs` | **PASS** | `e768060dc551e347fcc82362e1fc716251e9022e` |
| H — `build-harness.mjs` | **FAIL** | `f51a9c32e091e3262c3d356e0cb3fe14ca7f20c9` |
| V — `build-proof.mjs` | **FAIL** | `cb3107cb5d17308e9f04b137ee262051fb9fa641` |
| G — `gates.mjs` | **PASS** | `7210d6d63f227a90f9774278516e78a0db69fce3` |
| E — `gate-eval.mjs` | **PASS** | `227ab027396821817e0b5d2e6fa53d1b84b0db95` |
| P — `prover.mjs` | **PASS** | `c121b9fc0321d6a87e2dc22dd9d12f7c4c520bd3` |
| I — `build-harness.integration.mjs` | **FAIL** | `ae9b06c6bb638e079fc66307c2e743a200d99c2a` |

**A/G/E/P er byte-identiske med runde 4’s PASS-blobs.** PASS videreføres for deres afgrænsede kontrakter:

- **M:** locus-skema og Map-projektion fungerer sammen med den eksisterende forventningsafledning.
- **A:** kompletheds-, negativ-, fase-/aktør-, D10- og bidkontroller består med det ændrede M.
- **G:** manifestet bindes fortsat til forgængerens dom; substitution blev efterprøvet og afvist.
- **E:** pinned Git-resolution fungerer; traversal og sammenfaldende inputstier blev afvist.
- **P:** den tidligere dom over kørselskontrakten videreføres. Resuméets positive kontrol, nul-tests, skips og inkonsistens blev efterprøvet.

| Øvrigt input | Blob-OID |
|---|---|
| Delta | `d56a112f1b90e18f7ee7d8a984cb8bbecc9c124e` |
| C1-R4-FUND | `a9209efe6a23926f996b724b280f5c9e3192cd71` |
| Integrationslog | `b5f629f42948d53ca911329e7c0c0fb28711ff5c` |
| B2-leverance | `460a9b26db03f88ba148c42daaaf525e1120db5a` |
| Låst forventningsliste | `2200b76e29b52f7084c0bfe003c0a2e8121c2346` |
| P-8 | `4af07ef4164882ca54643e79df3554c0bf22b0e4` |
| Workflowplan | `df321f9d43b2888bf7451991b3599a54da9a15b4` |
| Rolletekst | `f6e64979941b55b57d6000306ccf9404dd2a15d1` |

Alle **syv patches** matcher både rekonstruerede førbilleder og aktuelle efterbilleder. Workflowplanen har også ændret OID siden R4, men indgår ikke i diffen; dens aktuelle tekst er vurderet særskilt.

### Bevisgrundlag

- **M 66, A 36, H 144 selvtests:** alle bestået.
- **V 85 selvtests:** alle bestået med repository-/Git-I/O erstattet af en model i hukommelsen.
- Egne JSON-, transport- og kodemutantprober gennem de faktiske dommere, motoren, verifieren og `evaluateGate`.
- Klassediagnoser fra en virkelig Node-proces blev indsamlet og tilført runnerprøven.
- Integrationsloggen indeholder **49 grønne checks**. Postgres-kørslen blev **ikke genkørt**: Docker-socketen afviser adgang.

Snapshot’et mangler `.git`. Hashene er verificerede Git-blobhashes; commit-tilhørsforhold er ikke selvstændigt verificeret. **»Gate åben« nedenfor betyder eksekveret gate/verifier med modellerede Git-opslag.** Transportmodprøverne bruger faktisk runnerkode med kontrollerede strømme, ikke en ny Postgres-kørsel.

Ingen filer er skrevet. Web er ikke brugt.

## 2. Delta-dom over F-28..33

| Fund | Efterprøvning |
|---|---|
| **F-28** | Den oprindelige strengkonflikt afvises. `ok:true` med detail, tom kode og afvisning uden kode afvises i de seks afprøvede kaldplaceringer: positive/negative, FS-/MH-action og SA-a/b. Rest: **F-34**. |
| **F-29** | **Rettet med bevis.** Én commit plus én korrekt afvisning kan dræbe SA-mutanten. De fire tidligere ugyldige raceforløb samt begge-afvist og uvedkommende kode afvises fortsat. |
| **F-30** | Flere korrekt formaterede klasselinjer afvises; første-linje-mutanten er dræbt. CRLF fungerer, og exit 0 med en genkendt klasselinje giver protokol. Rest: **F-35**. |
| **F-31** | Sti, mønster og krav om locus ved claims er efterprøvet; begge bindingsmutanter er dræbt. Locusets betydning behandles som **delegeret planvalg**, med de konkrete krav i §4. |
| **F-32** | Falske ERROR/CONTEXT-data på stdout bliver korrekt data. Forskellig SQLSTATE mellem status og diagnostik afvises. Rest: **F-36**. |
| **F-33** | **Rettet med bevis.** Manglende/ugyldigt query-output bevares som fejlet måling; fejlet invariantmåling bliver protokol. Den meningsfulde mutant gennem de overlappende værn er dræbt. |

### SA-definitionen er proportional

B2 pkt. 3 kræver invariantbrud **under den krævede race**. Det kræver ikke, at bruddet kun kan opstå ved samtidighed.

Derfor er én korrekt afvisning og én commit, der bryder den bundne invariant, et gyldigt SA-kill, når det krævede forløb og overlappet er bevist. Et brud på en uvedkommende invariant eller en forkert starttilstand skal afvises gennem den konkrete spec, kontroller og runner. At genindføre »begge committer« ville igen udelukke R4’s gyldige K-2/ac-6-modmodel.

## 3. Materielle fund

### F-C1-34 — Konsistenskravet dækker ikke hele observationsstien

**Krav:** B2’s fælles resultatkontrakt og pkt. 3; F-28’s skelnen mellem protokolfejl og faktisk udfald.

**Kode:** [H:68](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-c1-r5/wd/scripts/v5/build-harness.mjs:68), H:85–90, 171–186; V:156–159 genbruger dommeren.

**Tre eksekverede veje:**

| Angrebsinput | Faktisk resultat |
|---|---|
| Under UT-mutanten: `{"ok":true,"code":42601,"detail":null}` | `safeSql` omdanner den numeriske kode til `null`. Resultatet bliver tilladelse; **kill=true, verifier=true, gate åben**. |
| `ok:true` med `detail:{message:"syntax error"}` ved setup, state, observe, checkpoint, witness eller footprint | Detailkonflikten bliver kasseret eller ignoreret. Alle seks placeringer gav **verifier=true, gate åben**. |
| I proofens FS-observation: `observe.ok:true`, `observe.code:"42601"` og ellers korrekte rækker | Den rene dommer ignorerer koden. **Verifier=true, gate åben**, også efter genudledning. |

Det første er en **typefejl i protokollen**, ikke en gyldig SQLSTATE. Den må ikke repareres til succes. Det tredje viser, hvorfor en rettelse alene i runnergrænsen ikke er tilstrækkelig: verifieren accepterer selv den bevarede modstrid.

**Nødvendig rettelse/angreb:** Valider rå typer og konsistens før normalisering eller projektion. Genudled tilsvarende konsistens for observationskald, checkpoints og vidner. Gentag modprøverne i mål-, kontrol- og restorefaser.

**Afgrænsning:** `ok:false, code:"22023", detail:{}` blev ikke en bundet UT-afvisning. Med uændret tilstand bliver det heller ikke et UT-kill. Manglende detailfelter alene begrunder derfor ikke et universelt nyt krav.

### F-C1-35 — Manglende og malformet exit-output bliver til »ingen diagnose«

**Krav:** K-1/ac-4, K-7/ac-1; B2’s entydige leveranceafvisning og forbud mod at gøre manglende observation til udfald.

**Kode:** [H:276](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-c1-r5/wd/scripts/v5/build-harness.mjs:276)–280.

Følgende runnerresultater under klassifikationsmutanten blev alle accepteret som kills:

```json
{"exit_code":0}
{"exit_code":0,"stdout":null}
{"exit_code":0,"stdout":"klasse=klassifikation \n"}
```

Alle tre bliver til:

```text
klasse_linjer=0 · klasse_observeret=null
status=brudt · killed=true · verifier=true · gate åben
```

Derudover gav dette baseline-output **opfyldt**:

```text
klasse=klassifikation
klasse=ENOENT␠
```

`␠` betegner et afsluttende mellemrum. Det rå output har to `klasse=`-linjer; tælleren registrerer kun den ene, der matcher hele regexen.

**Nødvendig rettelse/angreb:**

- Kræv faktisk indsamlet stdout som streng; fravær må ikke erstattes med `""`.
- Skeln mellem ingen klasselinje og en malformet linje i det reserverede `klasse=`-format.
- Bevar negativkontrollen: komplet `stdout:""` med exit 0 er fortsat et legitimt bortfald af afvisningen.

**Stderr:** H’s deklarerede `exec`-kontrakt bruger stdout. En klasse på stderr observeres ikke. **R-RUNNER-EXIT** skal binde emitterens kanal og sikre komplet indsamling; en stderr-emitter må ikke godkendes som opfyldelse af denne kontrakt. Det kræver ikke en fri sammenblanding af processtrømmene.

### F-C1-36 — SQLSTATE-konsistens binder ikke grund og routine til samme fejl

**Krav:** B2’s præcise reject-kontrakt og pkt. 3; K-2/ac-6 samt de øvrige SQL-negativer.

**Kode:** [I:71](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-c1-r5/wd/scripts/v5/build-harness.integration.mjs:71)–73, 98–101 og `dockerPsql`’s fejlgren på linje 66.

`parseErr` tager **første ERROR-match og første CONTEXT-match uafhængigt**. Statuskontrollen sammenligner kun SQLSTATE.

Kontrolleret stderr:

```text
NOTICE:  00000: prefix
ERROR:  P0001: min_en_stand
CONTEXT:  PL/pgSQL function f.stand_deaktiver(int) line 1 at RAISE
ERROR:  P0001: unrelated_failure
CONTEXT:  PL/pgSQL function f.other(int) line 2 at RAISE
```

Med psql-status `true P0001` afleverer `session()`:

```json
{
  "ok":false,
  "code":"P0001",
  "detail":{"message":"min_en_stand","routine":"f.stand_deaktiver"}
}
```

**SA blev opfyldt, og verifieren accepterede beviset.**

Yderligere efterprøvet:

- En indsat CONTEXT-linje før den virkelige fejl kan alene substituere routinen.
- En flerlinjet primærmeddelelse bliver afkortet til første linje og kan dermed fejlagtigt matche det præcise token.
- `dockerPsql` har ingen tilsvarende psql-statuskontrol. En falsk P0001-blok før en virkelig **22012** blev gennem motoren til en bundet UT-afvisning: **allOk=true, verifier=true, gate åben**.

**Vejning af NOTICE-spørgsmålet:** En enkeltlinjet `NOTICE: … ERROR: …` rammer ikke `^ERROR:`. En indlejret ERROR-linje med status=ok bliver korrekt afvist af konsistenskravet. Hullet er især kombinationen med en virkelig fejl med **samme** SQLSTATE — eller `dockerPsql`’s ubundne tekstparser. Noncen behøver ikke være kendt.

De konkrete NOTICE-renderinger skal suppleres med en rigtig Postgres-kørsel; her er parser- og effektstien eksekveret med kontrolleret stderr. Det er ikke påstået som en ny databasekørsel.

**Nødvendig rettelse/angreb:** Indsaml SQLSTATE, hele primærmeddelelsen og afvisningsstedet fra samme faktiske fejl. NOTICE/WARNING og indhold i beskeder må ikke levere fejlens felter. Efterprøv både session- og enkeltkaldstransporten med samme/forskellig SQLSTATE samt gyldige NOTICE-kontroller.

## 4. R-PLAN-SEMANTIK: hvad locus konkret skal bevise

Locus-bindingen begrænser producenten til **matchende uddrag på den låste sti**. Den låser ikke ét bestemt linjespan.

Jeg efterprøvede to yderligere kildevarianter med eksempelregexen:

| Variant på samme sti | Verifier |
|---|---|
| En anden definition af `f.lokation_opret` | Accepteret |
| En matchende definitionslinje inde i `/* … */` | Accepteret |

Det afgrænser mekanikkens løfte. Formuleringen »producenten kan ikke vælge et andet uddrag« er for stærk.

**R-PLAN-SEMANTIK skal konkret dømme:**

1. Locus udpeger det rigtige værn, objekt og relevante signatur.
2. Alternative matches — kommentarer, historiske definitioner, overloads og senere erstatninger — kan ikke attestere et andet værn som dette.
3. Uddraget dækker det, claimet faktisk påstår; en funktionsoverskrift alene beviser ikke et indre prædikat.
4. Claim, mutantlocus, target-case/assertion og runnerens faktiske objektudførelse beskriver samme forbindelse.

Dette ligger inden for det allerede delegerede mandat i workflowplan §2.C: **»dybden DESIGNES + DØMMES ved plan-gaten«**. Det er ikke en generel SQL-semantikgaranti fra regexmotoren.

**Proportionalitet:** V kræver kun locus for værn, der bærer claims. Den kræver ikke locus på alle værn eller alle mutanter. Den grønne fixture demonstrerer netop dette.

## 5. Krævet mutant-tabel

**DRÆBT:** originalkoden giver den krævede dom; kodemutanten ændrer den forkert gennem den afprøvede effektsti.

| Kodemutant | Modprøve og resultat | Mutant-blob-OID |
|---|---|---|
| Fjern konsistenskravet i `kaldGyldig` | Selvmodsigende UT-underobservation: original lukker; mutant åbner gaten. **DRÆBT** | `9ad17779f74702726c05911f9c8d54f2f900f2f2` |
| Genindfør »begge committer« | Gyldigt invariantbrud med én korrekt afvisning: original accepterer kill; mutant forkaster det. **DRÆBT** | `b5cd1968202410bc68144e54e2a41b0e64f60530` |
| Tillad første klasselinje | To klasselinjer fra Node-processen: original lukker; mutant åbner. **DRÆBT** | `abb59204eda67c84eb1267025694350a911f37d3` |
| Fjern locus-sti-kravet | Matchende definition i anden fil: original lukker; mutant åbner. **DRÆBT** | `1a0ebb7adb69b8248b5c16f5dfe3fcdc3c3c1987` |
| Fjern locus-mønster-kravet | Kommentarcitat på korrekt sti: original lukker; mutant åbner. **DRÆBT** | `6e9c1985e6c77a077657c5a6a7eda56bf44de374` |
| Sammenlæg strømmene med `2>&1` | Gyldigt kald: original lykkes; mutant mangler stderr-markøren og giver timeout/protokol. **DRÆBT i transportmodellen** | `1ca984ccc63f81c20b3f52835e65279105387824` |
| `rows=[]` ved tomt output | FS-empty: original giver protokol; mutant giver opfyldt. **DRÆBT** | `8c1181066c15ee4578dd70d17df88beb4330e2b6` |
| Race uden invariant-tjek | Fejlet query bevarer `rows:null`; H afviser fortsat. **OVERLEVER effektprøven: redundant værn** | `a0d55c54f129fb9a510799350fbbd737e7043bd8` |
| Fjern invariant-tjek **og** genindfør `rows=[]` ved queryfejl | 22012 under invariantmåling: original protokol; mutant SA-kill og verifier grøn. **DRÆBT** | `48ec3d8e046cc9d222d48db160f1fc6e9e903fe9` |

Den overlevende enkeltmutant er **ikke et fund**: D10 kræver ikke, at overlappende værn isoleret gøres nødvendige.

F-34..36’s modprøver er tillæg til kill-listen. Der foreligger endnu ingen rettelses-OID eller dræbt rettelsesmutant for disse resthuller.

## 6. Kontraktdækning mod B2

Status gælder adapteren, ikke implementeret lokationsfunktionalitet.

| B2-del | Status | Materiel rest |
|---|---|---|
| Tabel 1: UT | **DELVIST** | F-34/35/36 |
| Tabel 1: FS | **DELVIST** | Tomt svar er rettet; observationskonsistens har F-34 |
| Tabel 1: MH | **DELVIST** | Handling/vidner findes; udfaldsintegritet har F-34 |
| Tabel 1: SA | **DELVIST** | Kill-definition og fejlet invariantmåling rettet; diagnosebinding har F-36 |
| Fælles resultatkontrakt | **DELVIST** | Identitet/form/run/spec bindes; observationer kan stadig forvanskes |
| Reject-felter | **DELVIST** | Fase/aktør/præcis grund sammenlignes; indsamlingen er utilstrækkelig |
| Pkt. 1: forventninger/cases | **MØDT mekanisk** | Konkret pakkeafledning skal dømmes |
| Pkt. 2: meningsfuld mutant | **DELVIST** | Deklaration/D10 findes; F-34 berører footprintmåling, og indhold dømmes ved plan-gaten |
| Pkt. 3: formbestemt kill | **DELVIST** | F-34/35/36 |
| Pkt. 4: D11 | **DELVIST** | Samme-run-binding findes; observeret afvisning kan forvanskes |
| Pkt. 5: D12 | **MØDT mod bundet spec** | C4’s autorisation/frys/produktionskobling udestår |
| Pkt. 6: komplet produceret proof | **DELVIST** | F-34 samt friske udførelsesregistreringer og konkret traceforbindelse |
| Frit-pas-manifest | **MØDT mekanisk** | Komplet manifest/spec for selve pakken **MANGLER i input** |

| B2 tabel 2 | Status | Konkret resterende dækning |
|---|---|---|
| K-1 | **DELVIST** | Atomaritet, pris-/historikforløb og leverancediagnose |
| K-2 | **DELVIST** | Hele struktur-/standforløbet og troværdig raceafvisning |
| K-3 | **DELVIST** | Arv, senere lokationer, outsider og lokalitet |
| K-4 | **DELVIST** | Status-/historikkæde, årsag og genåbning |
| K-5 | **DELVIST** | Stop-/hvileeffekt, rettigheder og datokanter |
| K-6 | **DELVIST** | Dubletrace samt request/approve/undo/due/apply/replay |
| K-7 | **DELVIST** | Leverancekontrol, faktisk anonymisering og replay |
| K-8 | **DELVIST** | Hele adgangsfladen, komplette observationer og non-bypass-kontekst |
| K-9 | **DELVIST** | Hele API/RPC-fladen, sidegrænser og målrettede eksponeringskills |

**Før første bid:** F-34..36 skal rettes og efterprøves, og pakkens konkrete manifest/spec, nødvendige kontroller og bidbundne kill-list skal være komplette og frosset efter processen. Integrationens syntetiske udsnit er ikke pakkens fulde D10-bevis.

## 7. Navngivne residualer

- **R-PLAN-SEMANTIK:** locuskravene ovenfor samt orakler, kontroller, mutationens relevans og footprintets dækning. Delegeret indholdsdom.
- **R-RUNNER-UDFØRELSE / R-CI-AUTENTICITET:** faktisk SQL/API, store, rolle, settings, ejerskab og målingernes oprindelse. Dækker ikke F-34..36.
- **R-RUNNER-OVERLAP:** faktisk tredje-backend-observation, starttilstand og timing.
- **R-RUNNER-EXIT:** stdout-kontrakten og komplet procesindsamling.
- **R-SPEC-LEGITIMITET / R-PREDECESSOR-WIRING:** C4’s autoriserede, før-build-frosne spec og friske plan-dom.
- **R-PROVER-REGISTRERING:** C4’s friske udførelsesregister og proveradapter. I:300–312 kopierer fortsat forventede ID’er til resuméet.
- **R-INTEGRATIONS-PROVENANCE:** de 49 indsendte checks er læst; Postgres-version og kørsel er ikke genverificeret her.
- **R-C3-REVIEW:** bestemt reviewer-sæt og præcis kode-OID.
- **R-P8-SLUTPRØVE:** fuld population, held-out udtræk, canaries og ubrudt produktkæde på P-8’s tidspunkt.
- **R-LOKAL-CANDIDATE:** R4’s disposition af DEL VIII pkt. 36 videreføres; ingen ny CI-autoritet følger heraf.
- **R-D14:** ingen nye angreb i den frosne JS-runtimeklasse.

**F-C1-34..36 er åbne, blokerende rettelseskrav — ikke residualer.** De kan lukkes med rettelses-OID og de angivne effektbeviser. At fastholde den svagere kontrakt kræver Mathias’ ord og HALT. Workflowplanens »F-28..33 — alle lukket« er derfor ikke bevist af denne leverance.