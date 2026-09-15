# P-1-dom: FAIL — HALT før autoritativ ibrugtagning

| Artefakt | Blob-OID | Dom |
|---|---|---|
| `scripts/v5/ci-gate-dom.mjs` | `ef8b31b48f33b21cf7dbb12ce1b535088a5df0aa` | **FAIL** — F-C4-1 og F-C4-2 |
| `scripts/v5/checkrun.mjs` | `137cfe05adbb9f8fcbee9a5a0b5f24590296b485` | **PASS** — mapperens kontrakt holder |
| `.github/workflows/v5.yml` | `c752bae82859da0495795fd7ba6187d64175ab5c` | **PASS** — kandidatflag og streng registerkontrol er adskilt |
| `.github/workflows/v5-gate-dom.yml` | `fd5aa3d0bf47970cc87863cfefd309eeb9476e9a` | **PASS på CI-adskillelsen** — selvtest før emission, særskilt jobnavn og permissions |

Workflow-dommene godkender adskillelsen; de ophæver ikke transportens FAIL.

## Bevisgrundlag

Blob-OID’erne er beregnet fra de læste bytes og matcher kandidatregistret. Planen er læst ved blob `65c9dfe97dcf343fa50758dcc2da3d206f3534f4`.

**Intet er skrevet, og intet netværk er brugt.** Udtrækket mangler `.git`. Derfor er der ikke udført en historisk genkørsel af `cdddf64` eller verificeret live-admin-konfiguration.

Udført:

- De **29 CI-selvtests og 20 mappercases består**. En netværksfælde registrerede ingen rigtig `fetch`.
- **Seks transportmutanter dræbt**, både af selvtesten og gennem opsamlede POST-payloads/HTTP-fejl.
- En samlet kædeprøve kørte **de faktiske default-runnere, `evaluateGate` og samtlige verifikatorer**. Kun Git-I/O og HTTP blev erstattet: Git-objekter og historik blev modelleret i RAM; HTTP-payloads blev opsamlet.
- Registerkontrollen blev udført med Git-blob-hashing i RAM, fordi direkte subprocess-kørsel ramte sandboxens `EPERM`.

RAM-prøverne er eksekverede kodebeviser, **ikke real-Git- eller live-GitHub-beviser**. Den medsendte live-fil dokumenterer den oplyste succestransport; den indeholder ingen negativ replay-prøve.

## F-C4-1 — En gammel godkendelse bliver grøn for ændret indhold

**Forpligtelse:** 2.A kræver, at ændret indhold bryder den gamle OID-binding.

**Locus:** [ci-gate-dom.mjs:71](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-c4-p1/wd/scripts/v5/ci-gate-dom.mjs:71), især linje 81–89 og 106; `plan-gate-run.mjs:36–38`.

Forfaderkravet kontrollerer historisk slægtskab. Der findes ingen efterfølgende binding mellem det dømte artefakt ved `pinned` og artefaktet ved `pushed`.

**Eksekveret angreb:**

1. Opret en komplet, mekanisk åben krav-/plan-kæde.
2. Bevar `plan-gate-resultat.json.commit_sha` og evidensen.
3. Ændr alene `plan-build/pk/plan.md` i en efterkommer.
4. Kør den faktiske CI-dommer og emitter.

Resultat:

| Observation | Udfald |
|---|---|
| CI-dom over gammel `pinned`, check på ændret `pushed` | `v5/gate/plan = success` |
| Direkte `runPlanGate(pushed, {evidenceRef: pushed})` | `open = false` |
| Begrundelser i kontrollen | Tre brudte verdikt-artefaktbindinger, approval-scope-mismatch og kvittering for anden tekst |

En variant ændrede `launch.pakke` til `other`: nåetheden kom fra `plan-build/other/`, mens runneren genlæste pakken `pk` fra `pinned` og producerede et grønt plan-check. Det er samme manglende identitetsbinding, ikke et separat fund.

**Nødvendig rettelse:** Bind den dømte pakke, artefaktet og de nødvendige gate-/forgængerinput til den commit, checket gælder. Tillad nyere evidenscommits gennem dokumenteret OID-lighed. Et senere build-check kan ikke efterfølgende gøre dette plan-check sandt.

**Lukningsprøve:** Uændrede input med senere evidens skal bestå. Ændret plan, relevant binding eller pakke skal give `failure` gennem emissionen. Fjernelse af den nye binding skal dræbes af samme prøve.

## F-C4-2 — CI ophøjer selvskrevet provenance til autoritet

**Forpligtelse:** 2.A kræver serververificeret approver; 2.F/pkt. 36 placerer autentisk menneske- og aktørprovenance hos et betroet CI-flow.

**Loci:** `krav-gate-run.mjs:62–77`, `plan-gate-run.mjs:40–45`, `gates.mjs:370`, samt [kvittering.mjs:149](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-c4-p1/wd/scripts/v5/kvittering.mjs:149) og transportverifikationen fra linje 204.

Kæden efterprøver hashes, indhold, låseværdier og commit-orden. Den autentificerer ikke den, der skrev dataene.

**Eksekveret angreb:** RAM-prøven fremstillede nye verdikter, leverancer, transportkvitteringer og approvals som almindeligt JSON-/tekstindhold. Den brugte den eksisterende aktørlås uændret og lagde kvittering før approval i historikken. Ingen menneskegodkendelse eller aktørkørsel producerede disse data.

De faktiske verifikatorer accepterede kæden, og emitteren producerede:

```text
v5/gate/recon = success
v5/gate/krav  = success
v5/gate/plan  = success
```

Prøven brugte **ingen historisk undtagelse og ændrede ingen produktionskode eller aktørlås**.

Kontrollen med kvittering og approval i **samme commit** gav korrekt `failure`. `evidenceRef=pushed` fastholder altså evidensen og rækkefølgekontrollen; producenten kan stadig fremstille to ordnede commits.

**Nødvendig rettelse før autoritet:** Verificér approval og aktørprovenance mod en betroet afsender uden for producentens skriveadgang, bundet til gate, input og hændelse. Frisk genberegning af producentens hashes tilfører ikke denne autenticitet.

Den medsendte M-38-approval matcher præcis den registrerede historiske undtagelse. Den undtagelse genåbnes ikke af fundet; angrebet ovenfor bruger nye data.

**Disposition for begge fund:** Autoritativ accept af de foreliggende blobs med hullerne stående er **tilstand (3): HALT**, fordi det svækker de oprindelige forpligtelser. Mekaniske rettelser ligger allerede under fabrikmandatet i pkt. 37. Fundene kan lukkes som **(1) rettet med bevis** efter rettelses-OID og de angivne modprøver. Kandidatdrift er allerede delegeret; den lukker ikke autoritetshullerne.

## Accepterede forsvar

- **Mapperen består:** Eget datafelt `open === true`, tomt eget reasons-array og korrekt `gate_id` kræves. Malformede resultater, de eksisterende accessor-/arvecases og ukendt gate afvises. Ingen nye angreb i den frosne JS-runtimeklasse.
- **Nåethed består:** Slettet approval giver intet check. Et påkrævet manglende check blokerer; manglende krav om checket er admin-konfiguration.
- **Fejlbehandling består:** Manglende/malformet kandidatresultat, fremmed pinned-historik og kastende runner bliver røde. De faktiske build-/slut-defaults emitterer `failure`.
- **`anc === desc` er ikke et selvstændigt fund:** Workflowet leverer `GITHUB_SHA`; lighed er tilladt. Kortslutningen løser heller ikke F-C4-1.
- **Fork/PR består inden for workflowformen:** Emissionsworkflowet har kun `push` og `workflow_dispatch`. PR-workflowet har `contents:read`. HTTP 403 fra emission kaster og fører via CLI-fejlhandleren til nonzero.
- **Selvtest før dom består:** Fejlet selvtest stopper det efterfølgende emissionsstep. Selvtesten injicerer `fetch`; ingen rigtig emission blev observeret.
- **Registeradskillelsen består:** Strengt: to kandidatfejl. Kandidattilstand: 18 pas og to advarsler. Manglende status og `pas_ref` afvises; ændret kandidatblob afvises også med kandidatflaget. En kandidat uden senere pas forbliver rød i streng tilstand.

## Mutant-tabel

Transportprøverne bruger kontrollerede runnerresultater og måler den faktiske mapper/emitter.

| Forpligtelse / værn | Targeted mutant | Målt forskel | Dom |
|---|---|---|---|
| Fremmed historik afvises | Fjern forfaderkravet | POST `failure → success` | **Dræbt** |
| Resultatet tilhører gaten | Fjern `gate_id`-match | POST `failure → success` under forkert gates navn | **Dræbt** |
| Åben kræver nul reasons | Tillad ikke-tomme reasons | POST `failure → success` | **Dræbt** |
| Ikke-nået giver intet check | Emit `neutral` ved ikke-nået | `0 POST → neutral POST` | **Dræbt** |
| Emissionsfejl må ikke skjules | Ignorér HTTP-fejl | HTTP 403: `kast → normal retur` | **Dræbt** |
| Evidens skal være pushed | Byt `evidenceRef` til `HEAD` | POST `failure → success` for kontrollens anden evidens | **Dræbt** |
| Kandidater blokerer autoritet | Tving kandidatflaget sandt | Strengt register: `exit 1 → exit 0` | **Dræbt** |

Disse drab dækker transportværnene. **F-C4-1 og F-C4-2 passerer den umuterede kode** og kræver de yderligere angrebsprøver beskrevet ovenfor.

## Navngivne admin-forudsætninger

### R-CI-REQUIRED — checks og kilde

Required checks skal låses til **GitHub Actions**, ikke »enhver kilde«.

- Recon-grænse: `v5/gate/recon`.
- Krav-grænse: også `v5/gate/krav`.
- Plan-grænse: også `v5/gate/plan`.
- Build-grænse: også `v5/gate/build`.
- Slut-/leveringsgrænse: alle ovenstående plus `v5/gate/slut`.

Sættet skal bestemmes af beskyttet fasepolitik; producentens sletning af nåethedsfiler må ikke reducere det.

Kræv desuden den strenge registerkontrol:

```text
hærdet-register (autoritet — rød = kandidat-drift uden Codex-pas)
```

Registerjobbet er ikke en afhængighed for emissionsjobbet. Uden dette required check kan grønne gate-checks stå ved siden af et rødt register uden at blokere.

For at kræve gennemført, vellykket CI-kontrol medtages også:

```text
v5 dommer-selftests (falsk-grøn-fri)
gate-dommer (frisk dom pr. gate → check-runs v5/gate/<id>)
```

### R-CI-WORKFLOW-INTEGRITET — paths og regler

Beskyt mindst `scripts/v5/**` og `.github/workflows/**`; plan 2.E omfatter desuden `test/v5/**` og `.claude/**`. Beskyt også den anvendte CODEOWNERS-fil.

Reglerne skal håndhæve:

- Ingen uautoriseret oprettelse, ændring, sletning eller omdøbning i de beskyttede stier.
- Uafhængigt review af den aktuelle ændring; gamle approvals bortfalder ved nye ændringer.
- Ingen builder-/driver-bypass eller ubeskyttet force-push.
- Dækning af **alle refs, hvis workflowkørsler kan producere autoritative checks**.

Beskyttelse alene på målbranchens workflowfil er utilstrækkelig, hvis en producent kan tilføje en anden emitterende workflow på en ubeskyttet branch. Begge emitterer med kilden GitHub Actions.

### R-CI-APP-IDENTITET — hvad en særskilt App vinder

En gate-App giver en særskilt check-afsender, som required checks kan låses til. Andre workflows’ `GITHUB_TOKEN` kan dermed ikke opfylde kravet under samme afsenderidentitet.

App-nøglen skal være utilgængelig for producentstyrede workflows; App’en får `checks:write` og nødvendige læserettigheder, aldrig `contents:write`. **App-skift alene retter hverken stale-bindingen eller selvskrevet provenance.**

**Samlet:** Mapperen fortjener PASS, og jobadskillelsen er ærlig. CI-transporten fortjener FAIL før autoritet på grund af de to eksekveret påviste huller. Dommen er input til gaten; den er ikke den endelige menneskebeslutning.