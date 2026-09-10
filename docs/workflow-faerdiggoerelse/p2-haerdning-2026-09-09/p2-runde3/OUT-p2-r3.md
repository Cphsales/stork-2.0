**FAIL(8) — T-F3, T-F7, T-F8, G-F1 og F-14–F-17; afhængige restfund tælles ikke dobbelt.**

Alle ni filers blob-OID’er er beregnet, og begge diffs rekonstruerer deres angivne før-versioner korrekt. Udtrækket mangler `.git`: tilhørsforholdet til commit `4cacbb3` kan derfor ikke verificeres.

Ingen filer skrevet; intet web. **87 kernecases og 74 kvitteringscases består med Git/FS modelleret i hukommelsen.** Proberne nedenfor bruger produktionsfunktionerne. Fuld wrapper-/temp-Git-kørsel er ikke udført; runner-importerne mangler desuden `coverage.mjs`/`build-proof.mjs`.

T = transport, G = gates. Linjer gælder de leverede filer under `scripts/v5/`.

| Fund | Dom | Fil:linje |
|---|---|---|
| T-F1 | **LUKKET**, afgrænset kørselsbevis: schema/status/forsøg kontrolleres; kvitteringsfejl gav exit 1 | `verdikt-byg.mjs:56`, `codex-run.sh:227` |
| T-F2 | **DELVIST — hul**, hjælperen kan stadig omgås; F-14/F-15 | `kvittering.mjs:227` |
| T-F3 | **DELVIST — hul**, flere tillidsbærende værktøjer bruger stadig kalder-PATH | `codex-run.sh:60`, `codex-run.sh:124`, `codex-run.sh:178` |
| T-F4 | **DELVIST**, tidligere omdirigeringer rettet; replacement-bevisets rest ligger i T-F13 | `codex-run.sh:33`, `codex-run.sh:112` |
| T-F5 | **DELVIST — hul**, løs `cat` kan ændre rollen efter hashkontrollen; T-F3 | `codex-run.sh:177`, `codex-run.sh:178` |
| T-F6 | **DELVIST**, oprydning er under lås; navnekollisionen i T-F7 består | `codex-run.sh:103`, `codex-run.sh:106` |
| T-F7 | **DELVIST — hul**, privat forsøgsmappe løser forsøgsfilkollisionen, men OUT kan overskrive en anden kørsels låsefil | `codex-run.sh:103`, `codex-run.sh:216` |
| T-F8 | **DELVIST — hul**, en staged slettet rolle valideres mod HEAD og accepteres fortsat i låsen | `pre-commit-zone.mjs:57`, `pre-commit-zone.mjs:60` |
| T-F9 | **DELVIST — målehul**, de annoncerede fixtures er tilføjet; F-17 består | `codex-run.selftest.mjs:107`, `kvittering.selftest.mjs:134` |
| T-F10 | **DELVIST — huller**, gate-input virker; domsudledning og forventet rolle er utilstrækkelige; F-14–F-16 | `verdikt-byg.mjs:62`, `verdikt-byg.mjs:78`, `verdikt-byg.mjs:141` |
| T-F11 | **LUKKET**, repo-override uden selftest afvises; begge modtagere afviser selftest | `codex-run.sh:115`, `verdikt-byg.mjs:58`, `kvittering.mjs:171` |
| T-F12 | **LUKKET for de oprindelige fejlveje**, OUT-mappe afvises; kvitteringsfejl stopper før `.done` | `codex-run.sh:98`, `codex-run.sh:227` |
| T-F13 | **DELVIST — målehul**, begge rettelser findes; selvtesten udøver ikke replacement gennem `git.mjs` | `codex-run.sh:59`, `codex-run.sh:177`, `git.mjs:16` |
| G-F1 | **DELVIST — kræver Mathias’ ord**; historiske digests matcher, men residualen er ikke delegeret her | `gates.mjs:38`, `gates.mjs:386` |
| G-F2 | **LUKKET**, tidligere aliasrettelse uændret | `gate-eval.mjs:68` |
| G-F3 | **LUKKET ved allerede delegeret D14-mandat** | `gates.mjs:368` |
| G-F4 | **LUKKET**, multiset-værnet og tidligere drabsbevis består | `gates.mjs:370` |
| G-F5 | **LUKKET**, devil-indholdskontrollen dræber mutant h | `kvittering.mjs:131` |
| G-F6 | **LUKKET med egen effektprobe**, rettet tree-fixture dræber i; leveret test gør ikke | `kvittering.mjs:125` |
| G-F7 | **LUKKET med egen effektprobe**, refskift dræber j; leveret test gør ikke | `kvittering.mjs:94`, `plan-gate-run.mjs:35`, `krav-gate-run.mjs:55` |

De tre øvrige mekaniske restfund er konkrete:

- **T-F3:** `cat`, `cut`, `mv` m.fl. resolves fortsat gennem kalderens PATH. Et isoleret Bash-kodesnit bestod den faktiske rollehashkontrol og endte derefter med `ROLE_TEXT=INJICERET ROLLETEKST`, da `cat`-afhængigheden blev substitueret. Fastlås også disse værktøjer; kræv en fixture med falsk `cat`/`cut`.
- **T-F7:** Stivalideringen accepterede `OUT=A.lock`, som selv låser `A.lock.lock`. **Kodeafledt samtidighedsrepro:** B publicerer over A’s låsefil med `mv`; A holder nu låsen på den gamle inode, og C kan tage den nye `A.lock`. Kræv adskilt, beskyttet navnerum for låse/kvitteringer og en effektcase for denne kollision. Hele samtidighedsforløbet er ikke eksekveret.
- **T-F8:** Faktisk hook-kode gav **exit 0** for `D rolle.md` + staged lås, der fortsat refererer rollens HEAD-OID. Samme fixture med `M rolle.md` gav korrekt exit 2. Validér mod det kommende index-træ; en slettet rolle må ikke falde tilbage til HEAD.

**F-14 — PASS kan bindes til en FAIL-leverance.**  
`kvittering.mjs:188,227`: En kvittering med korrekt hash af en struktureret **FAIL**-leverance blev kombineret med et ændret PASS-verdikt. Kvitteringen og leverancehashen var uændrede; produktionskernen og de faktiske verdikt-/approval-/transportverifikatorer gav **`open:true`** med en gyldig forgængerfixture. Forkert hash gav korrekt rødt. Gaten skal genudlede domsfelterne fra den hashbundne leverance. Kill-case: ændr alene `conclusion`, behold kvittering/hash, og kræv lukket gate.

**F-15 — Forventet rolle og kørselsidentitet håndhæves ikke.**  
`verdikt-byg.mjs:138,141`; `kvittering.mjs:181,227`: Hjælperen accepterede **`codex-forbedring`**, når dens korrekte skill-OID blev medsendt. Gaten accepterede også ændret `run_id`, `run_attempt=999` og effort. Rollen kontrolleres dér kun som en ikke-tom streng. En ældre `regel_commit` med anden model/effort blev ligeledes accepteret af hjælperen. Kræv den forventede gate-rolle, match kørselsfelterne og bind til den forventede fabrik-frys; regelcommit behøver ikke være identisk med artefaktcommit. Kill-cases skal bruge indbyrdes konsistente, men forkerte roller/låse.

**F-16 — Citeret eksempel bliver autoritativ draft.**  
`verdikt-byg.mjs:78`: Leverancen begyndte med **“Dom: FAIL”** og havde en PASS-draft som eksempel inde i en fire-backtick-kodeblok. Hjælperen returnerede **exit 0/PASS**. En inline åbner accepteredes også. To matchende blokke, hvor én var indlejret, blev korrekt afvist. Brug en entydig struktureret leverance eller en parser, der skelner aktive blokke fra citerede eksempler; kræv negative fixtures for begge accepterede former.

**F-17 — Selvtestene beskytter ikke alle rettede værn.**  
`kvittering.selftest.mjs:134,150`: Tree-casen har samtidig forkert devil-binding og accepterer fejlteksten `devil`; derfor overlever fjernet typekontrol. Refskift-casen bruger forkert digest og accepterer enhver rød dom. Mine korrigerede fixtures dræbte begge mutanter. Der mangler også replacement-case gennem `git.mjs` og en pin-mismatch-case, der faktisk når `binaries.lock`-kontrollen uden selftest.

**Mutanttabellen:** E = eksekveret med ovenstående afgrænsning; K = vurderet fra leveret testkode.

| Mutant | Kan leverede selvtests dræbe den? |
|---|---|
| a · drop hjælperens gate-input-check | **E: ja**, original afviser, mutant bygger; `codex-run.selftest.mjs:290` |
| b · drop selftest-check | **E: ja**, både hjælper og transportverifikator bliver fejlagtigt grønne |
| c · drop rolleblob-hashcheck | **K: nej** mod replacement-fixturen; `--no-replace-objects` dækker samme negativ. Ikke selvstændigt et fund |
| d · drop `--no-replace-objects` i `git.mjs` | **K: nej**, replacement-fixturen kører wrapperens separate Git-funktion |
| e · tøm historiske undtagelser | **E: ja**, r4b-positivtesten fejler; approval-undtagelsen har ikke tilsvarende positivcase |
| f · plan `transportReceipt:false` | **E: ja**, tre kernecases åbner fejlagtigt |
| g · drop output-hashbinding | **E: ja**, to kvitteringscases bliver fejlagtigt grønne |
| h · drop devil-blob-læsning | **E: ja**, tre kvitteringscases bliver fejlagtigt grønne |
| i · drop blob-typekontrol | **E: overlever alle 74**; korrigeret egen tree-fixture dræber |
| j · returnér flytbar ref efter eksistenskontrol | **E: overlever alle 74**; egen H1/H2-splejsning dræber |

De øvrige nye vektorer gav følgende: Kolon i artefaktstien og tomme gatefelter afvises; ekstra linjer ignoreres af Bash-parseren, uden påvist ombinding. `STORK_V5_REPO` omgår kun binærlåsen under markeret selftest. Den installerede entry-fil matcher faktisk binærlåsens SHA256. FD9 arves til entryprocessen; dens viderespawn arver ikke låseinoden. Privat `mktemp` og OUT-efterkontrollen lukker de beskrevne mappe-/symlink-veje; T-F7 er det særskilte navnerumsproblem.

**Residualen kan accepteres for lokal candidate-drift, hvis Mathias udtrykkeligt accepterer den svagere kontrakt.** Kvitteringsmodulets deklaration er ærlig om manglende hændelsesautenticitet, men `gates.mjs:381` overdriver fortsat, hvad historikken beviser. Begge historiske digests matcher input; ændrede run-ID’er mister undtagelsen. Ingen separat pakkeomgåelse er påvist gennem runneren: den historiske anker-OID binder også den launch, hvorfra pakken læses. Et residualmandat lukker ikke de mekaniske huller ovenfor.

Det rigtige er den obligatoriske transportverifikator, de præcise historiske digests, devil-dom fra kildeblobben, fastholdt evidenscommit og kvittering før succesmarkør. Disse rettelser har konkret effekt.

De ni dømte filers bytes er bundet således:

| Fil | Blob-OID |
|---|---|
| `codex-run.sh` | `a1033d4e94ed9728aea9ea87cfdc4c282005ab23` |
| `verdikt-byg.mjs` | `e5d211b4270fcc1626129e459a24f49491c835b3` |
| `verdikt.mjs` | `4d80c7b05f01540d6a3a65438fb07ad172e334b7` |
| `git.mjs` | `9bc53ebfd7ea1a4e56906a567f276638297620cb` |
| `gates.mjs` | `852f0654ba3da44e021f0a7c456a7e1abc542df7` |
| `gate-eval.mjs` | `1f9934570739d2b14b7ab27833f9084fbf15fe5b` |
| `kvittering.mjs` | `e1982570e6670bc5bc83de541d12952b4829e5cd` |
| `plan-gate-run.mjs` | `8b4f60f529262e353a9f8f3a89c72819a3aee5f3` |
| `krav-gate-run.mjs` | `a8723a5321e733b4b5fc385559087ad2195daf9f` |