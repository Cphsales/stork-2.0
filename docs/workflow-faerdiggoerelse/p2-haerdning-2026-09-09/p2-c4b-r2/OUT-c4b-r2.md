**C4b-runde 2: samlet FAIL.** F-C4b-1 og F-C4b-2 er rettet inden for det vurderede transportsnit. Ét nyt materielt fund, **F-C4b-3**, blokerer `ci-build-dom`: et korrupt artefakt kan give `success` med en forkert artefakt-OID.

| Artefakt | Dom som hærdet transport | Verificeret blob-OID |
|---|---|---|
| `ci-build-dom.mjs` | **FAIL — F-C4b-3** | `5641cd28e7c781af7ca151ce24d61d38d8c35eb6` |
| `pg-runner.mjs` | **PASS** | `c43c57bcfdb193e0d8044a06f64d96ea4ebc0547` |
| `v5-build-dom.yml` | **PASS på formen: to tillidszoner** | `884fd2d0b5ff33d380481eb36300e3fb2046088a` |

De fire tidligere PASS-moduler er byte-identiske med runde 1:

| Modul | Blob-OID |
|---|---|
| `gates.mjs` | `1a4369b713b6a6a929f6d4fa75a62848febe5aea` |
| `gate-eval.mjs` | `7110053ac597a6b3f3ab99f6449323f208c6e005` |
| `build-proof.mjs` | `756627cb11cb4af4b2d23a994ee7041d8dd8c1e9` |
| `ci-gate-dom.mjs` | `dc59d796e6c86df5194fe2367e2df3cef9e08520` |

**Bevisgrundlaget:** Diffens efterbilleder matcher filerne; tilbagerulning i RAM reproducerer før-OID’erne. De **33 selvtests består**, kørt med filsystem og Git modelleret i RAM. Egne angreb udførte kandidatfunktionerne, motor/verifier og den faktiske emitter med opsamlede HTTP-payloads. De **79 Postgres-checks er den leverede integrationslog**, ikke min egen integrationskørsel. Udtrækket mangler `.git` og psql; live-GitHub er ikke efterprøvet. Intet skrevet; intet web anvendt.

**F-C4b-3 — tabsfuld UTF-8-afkodning bryder bindingen til artefaktets rå bytes.**

Forpligtelse: pkt. 39 kræver `git hash-object` over bevisets bytes og tredjepartsgenverifikation mod checkets fulde OID.

Loci i `ci-build-dom.mjs`:

- Linje 183: `readFileSync(inn, "utf8")` afkoder før dommen.
- Linje 143–146: dommeren parser og hasher den allerede afkodede streng.

Ugyldige UTF-8-bytes erstattes under afkodningen. Dommeren kan derfor godkende ét byteindhold, mens det downloadede artefakt indeholder noget andet.

**Eksekveret modprøve:** Et ellers gyldigt bevis fik et ekstra JSON-strengfelt med byte `0xff`. Efter CLI’ens afkodning accepterede den faktiske `doemBevis` og verifier beviset. Den faktiske emitter konstruerede følgende resultat gennem en kontrolleret HTTP-adapter:

| Observation | Resultat |
|---|---|
| Check | `v5/gate/build = success` |
| OID over modtagne rå bytes | `d4513e9c895bb4d16fa3bf42a9cb0c2e2f9c43f0` |
| OID angivet i check-resuméet | `c27cd1569c162130690985c821c8626fb3e61d7e` |
| Matcher artefaktets rå bytes? | **Nej** |

Dette består vejnings-reglen: checket attesterer en artefaktbinding, som tredjeparten konkret ikke kan reproducere. Det kræver ingen forfalskning af målingens ophav og hører derfor ikke under R-CI-AUTENTICITET.

**Rettelseskrav og angrebs-spec:** Bevar rå bytes ved indlæsning, beregn OID over dem, og afvis ugyldig UTF-8 før JSON-dom. Bevar positiv kontrol med gyldig UTF-8. En mutant, som genindfører tabsfuld afkodning før hashing, skal dræbes gennem samme dom/emissionssti.

En RAM-kalibrering med tabsfrihedskontrol afviste angrebet og bevarede den grønne kontrol. **Det er ikke en rettelse af kandidatblobben. F-C4b-3 er åbent.**

**De oprindelige fund og isolationens præcise grænse.**

**F-C4b-1: rettet med bevis for emissionscredential-adskillelsen.** Workflowet placerer produktudførelse i `maaling` med `contents:read`, uden `checks:write` og uden vedvarende checkout-credentials. `dom` har emissionsrettigheden og udfører dom over data uden produktkommandoer eller Postgres. CLI’en afviser kombinationen `--produce --emit`. De to øvrige workflows bevarer adskillelsen mellem selftests, registerautoritet og gate-emission.

To bredere påstande om miljøisolering holder dog ikke:

- `prover.mjs:145` bruger `{ ...process.env, ...(env ?? {}) }`. En eksekveret prøve gennem den faktiske `runProver` genindførte syntetiske credentials, som `producentMiljoe` havde fjernet.
- Et renset underprocesmiljø er ikke generelt isolation fra forælderen. En skrivefri Linux-prøve viste, at en underproces kunne læse en syntetisk forældrevariabel gennem `/proc/<ppid>/environ`.

Ingen af disse prøver gav adgang til **det separate dom-jobs** token. De genåbner derfor ikke det oprindelige falsk-grønne emissionshul, men afkræfter påstanden om fuldstændig miljøisolering.

**F-C4b-2: rettet med bevis.** Settings anvendes og aflæses i begge sessions før handlingerne. Med en kontrolleret processtrøm, hvor `SET` blev kvitteret, men den effektive tenant var forkert, stoppede kandidaten før handling. Uden verifikationen udførtes begge handlinger i den forkerte tenant. Integrationsloggen underbygger den virkelige tenant-kontrast og injektionsnøglens afvisning.

Nøgler valideres før anvendelse; apostroffer i værdier fordobles. Ændrer produktet selv konteksten under handlingen, er det produktadfærd, som effektoraklet skal bedømme. En senere `RAISE` ændrer ikke en allerede udført kontrol før handlingerne.

**Mutant-tabellen:**

| Forpligtelse → mutant | Observeret kontrast | Status |
|---|---|---|
| F-C4b-1: slå jobbene sammen / giv `maaling` `checks:write` | Begge ændringer bryder den udførte workflow-formkontrol | **Formmutanter fanget; ingen live-GitHub-effekt attesteret** |
| F-C4b-1: fjern kun `producentMiljoe` | Credential-afvisningen stopper runneren før produktudførelse | **Redundant værn; intet kunstigt krav om lækage** |
| F-C4b-1: fjern rensning og credential-afvisning | Produktprocessens kontrollerede adapter: ingen credential → credential synlig | **Dræbt gennem procesgrænsen** |
| F-C4b-2: fjern settings-verifikationen | Forkert effektiv tenant: protokol før handling → begge handlinger udført | **Dræbt gennem runnerens effektsti** |
| Pkt. 39: fjern commit-bindingen | Fremmed commit: `failure → success` | **Dræbt** |
| Pkt. 39: fjern pakke-bindingen | Fremmed pakke: `failure → success` | **Dræbt** |
| Pkt. 39: ignorér `meta.fejl` | Migrationsfejl plus ellers gyldige bytes: `failure → success` | **Dræbt** |
| Pkt. 39: tillad tabsfuld byteafkodning | Korrupt artefakt → `success` med afvigende OID | **Kandidaten fejler; F-C4b-3 åbent** |

**Meta, ophav og residualernes placering.**

Manglende proof med nået meta samt almindelig ugyldig JSON giver rød dom. **Manglende meta giver derimod tavshed:** workflowets linje 99 fremstiller `naaet:false`, og CLI’en emitterer intet. Et fejlet `maaling` kan også forhindre `dom` gennem `needs`. Det skaber ingen ny `success`; et manglende required check åbner ikke en beskyttet merge. Det er ikke dokumentation for eksplicit rød emission.

| Residual | Placering og afgrænsning |
|---|---|
| **R-CI-AUTENTICITET** | Betroet workflowrevision, repository, run/attempt, head-SHA og artefakthentning fra netop kørslen. `run_id` i JSON autentificerer ikke sig selv. Konsistente opdigtede observationer kan bestå verifieren; det blev efterprøvet. Job A er fortsat artefaktkilden og kan ændre filer før upload. |
| **R-RUNNER-UDFØRELSE / service-isolation** | Værtsudførelse, underprocesser, proverens miljø og Postgres-containerens isolation. Serverfunktioner som `COPY TO PROGRAM` og `lo_export` udføres i servicecontaineren; workflowet deklarerer ingen værtsmount. Dette attesterer ikke hele runtimeisoleringen eller ikke-bypass-egenskaberne. |
| **C3** | Revieweridentitet og provenance bag bid/review-filerne. Indholdsmæssig sammenhæng autentificerer ikke revieweren. |
| **C4c** | Autoriseret/frosset spec og proverregistrering samt den valgte, serververificerede godkendelseskanal og tidsorden. |
| **Admin** | Kumulative required checks, afsenderbinding, strengt register og beskyttelse af målelag/workflows på alle emitterende refs. Kandidatdrift er fortsat ikke autoritet. |

**Registerinput:** PASS til `pg-runner` og workflowets form ved de angivne OID’er; de fire tidligere PASS består. **Ingen PASS til `ci-build-dom` ved `5641cd28…` på grund af F-C4b-3.** Dommen er blokerende input til gaten, ikke den endelige menneskeafgørelse.