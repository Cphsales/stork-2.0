**Dom: FAIL(9) — 6 BLOKER + 3 RET. v3 får ikke lokalt driftspas.**

Dommen er bundet til de leverede bytes:

| Fil | Git-blob-OID |
|---|---|
| `codex-run.sh` | `7c73b69210563ae51d36c8a8b09dae5a8c21a31c` |
| `verdikt-byg.mjs` | `8e1f9d109bea33ee9e2dd44a3a78047dc0bafd06` |
| `krav-gate-run.mjs` | `9e28a1dfe754693fb8ef25d1a6aac83af3d056c8` |
| `pre-commit-zone.mjs` | `1ad43ce2ae45f98b5f386022af0427f9a21928e5` |
| `codex-run.selftest.mjs` | `4c1fa5a66be8ffcecce9acfec0734c1d8559e7ab` |

Diffen rekonstruerer præcis runde 1’s fire berørte OID’er. Ingen filer skrevet. **Den fulde selvtest og wrapper-mutantsuite er ikke genkørt:** selvtesten skriver filer, og input mangler `.git`, rolletekster og moduler. Den direkte krav-selvtest stopper ved manglende `proofs.mjs`. Nedenstående eksekverede prøver bruger faktisk hjælper-/hook-/gate-kode med fil-/Git-fixtures i hukommelsen samt isolerede Bash-kodesnit.

| Fund | Lukket? | Fil:linje i v3 | Bemærkning |
|---|---|---|---|
| F-1 | **LUKKET** | `verdikt-byg.mjs:48–68` | Den konkrete parservej er lukket: fejlstatus, rc≠0, bytes=0, attempt=999 og afvigende retry-effort blev afvist. Kvitteringen læses én gang; leverancehash beregnes. Autenticitet hører fortsat til F-2. |
| F-2 · BLOKER | **DELVIST** | `verdikt-byg.mjs:42–68,110–129`; `verdikt.mjs:248–256` | Ingen-kvittering-vejen er lukket i hjælperen. Håndskrevet kvittering accepteres stadig, også uden binær-/låsbindinger. Hjælperen kan desuden omgås ved direkte verdikt-JSON; gate-prøven gav `open:true`. |
| F-3 · BLOKER | **DELVIST** | `codex-run.sh:98–116` | Absolut angriber-PATH bevares. Hashes registreres, men sammenlignes aldrig med forventede pins. `git/node/timeout` har ingen prefixkontrol. Prefixchecket accepterede `/usr/bin/true`. |
| F-4 | **DELVIST** | `codex-run.sh:38–41,119–152` | Egen realpath, rensning af `GIT_DIR` og én commit lukker de oprindelige omdirigeringer. Git-objektlæsningen har stadig F-13. |
| F-5 | **DELVIST** | `codex-run.sh:155–160,178` | Rolleteksten indgår nu i prompten; `cat --` og prompthash er reelle rettelser. OID→indhold kan stadig brydes, jf. F-13. |
| F-6 | **DELVIST** | `codex-run.sh:59–61,80,163–164` | Sekventiel stale-oprydning er flyttet frem. Ved overlap ændrer også taberen af `flock` den aktive kørsels filer; dækkes af F-7. |
| F-7 · BLOKER | **DELVIST** | `codex-run.sh:59,93,163–170,185–197` | Filtypeværn hjælper, men forsøgsfilerne er forudsigelige og deler navnerum med publicerede OUT-filer. Låsen dækker ikke hele livscyklussen. |
| F-8 · RET | **DELVIST** | `pre-commit-zone.mjs:21–39` | Rename-, Unicode- og slettet-lock-fixtures gav korrekt exit 2. Kravet fra runde 1 om **gyldig staged lås** er ikke opfyldt: status `M` accepteres uden læsning af låsen, også ved `ikke JSON`/`{}`. |
| F-9 · RET | **DELVIST** | `codex-run.selftest.mjs:35–39,75–76,94–120,134–135,174–204` | Retry-argv, levende PID, tidsmåling og committed-grenen er forbedret. Der mangler effektfixtures for tom eksisterende fil, mappe, eksisterende forkert rolleblob og andre gyldige model/effort-værdier. |

De ni selvstændige restfund er **F-2, F-3, F-7, F-8, F-9 og F-10–F-13**. Afhængighederne i F-4–F-6 tælles ikke dobbelt.

**F-3/F-7: konkrete resterende angreb.** En falsk `timeout` først på en absolut PATH kan ignorere den rigtige Codex-binær, skrive til `-o` og returnere 0; dens egen hash bliver blot registreret. Rettelsen kræver betroet opstartsmiljø og verificerede eksekverbare filer.

For F-7: start A med `OUT=$O`, lad A vente og returnere 0 uden output; start B med `OUT=$O.attempt1.out`. Låsene er forskellige, men B publicerer direkte til A’s forsøgsfil. A kan dermed godkende B’s leverance. Dette er en kodeafledt repro, ikke en udført samtidighedstest. Desuden rydder linje 59 før låsen, og `blok()` overskriver kvittering/fjerner PID efter tabt `flock`. Kræv privat kørselsmappe, særskilt publiceringsnavnerum og låseejerskab før ændring af fælles tilstand.

**F-10 · `verdikt-byg.mjs:63–68,74–83,123–129` · ombinding · BLOKER**

**Repro/observeret:** En kvitteringsfixture for `codex-forbedring`, `produktion`, commit A og rå tekst `FAIL: K-7 er ikke opfyldt` blev kombineret med PASS-draft for commit B. Hjælperen returnerede 0; den faktiske gate-kerne gav **`open:true`**, med gyldige approval-/forgænger-fixtures.

**Konsekvens:** Hashen binder leverancens bytes, men hverken dommens indhold eller dens tiltænkte input. En signatur alene løser ikke dette.

**Rettelse:** Bind forventet rolle, aktivitet, regelversion og eksplicit gate-input til kørslen. Udled verdiktfelterne fra en struktureret rå aktørleverance og kontrollér bindingerne.

**F-11 · `codex-run.sh:107–112,121–134`; `verdikt-byg.mjs:54` · selvtest-læk · BLOKER**

**Repro:** Brug `STORK_V5_SELFTEST=1`, fremmed committet repo via `STORK_V5_REPO`, falsk Codex og **ingen** `STORK_V5_LOCK`. De eksekverede Bash-grene gav `lock_mode=committed`. Selvtesten forventer netop denne kombination på linje 174–175.

**Konsekvens:** En uændret selvtestkvittering kan opfylde hjælperens transportkontrol. Ingen manuel kvitteringsforfalskning er nødvendig.

**Rettelse:** Alle selvtestlempelser skal mærke kørslen som uegnet til gate-evidens, også når låsen læses fra en commit. Tilføj en negativ ende-til-ende-case for denne kombination.

**F-12 · `codex-run.sh:78,196–207` · falsk succesmarkering · RET**

**Repro/observeret:** Det faktiske succes-kodesnit på linje 204 returnerede **0**, selv om `skriv_kvittering()` returnerede 1. `.done` sættes allerede på linje 197. Hertil kommer, kodeafledt: eksisterende OUT-mappe får `mv` til at flytte leverancen *ind i mappen* og stadig rapportere succes.

**Konsekvens:** Exit 0 og `.done` kan foreligge uden den lovede publicerede fil og kvittering. Hjælperens senere afvisning lukker ikke transportens falske succes.

**Rettelse:** Kontrollér destinationstype, brug publicering med præcis destinationssemantik, og kræv vellykket kvitteringspublicering før `.done` og exit 0.

**F-13 · `codex-run.sh:135–155`; `git.mjs:15–18` · Git-objektsubstitution · BLOKER**

**Repro-spec, ikke udført her:** Opret `refs/replace/<skill_oid>` mod en anden eksisterende blob, eksempelvis med `git replace <skill_oid> <anden-blob>`. Commit-træets rolle-OID kan stadig matche låsen, mens `git show <skill_oid>` leverer erstatningsindholdet. Git understøtter dette som standard; det er verificeret i den lokale Git-manual.

**Konsekvens:** Frysen kan vise den oprindelige OID, mens en anden rolletekst sendes. Samme Git-læseadfærd berører gate-verifikationen.

**Rettelse:** Deaktivér replacement-objekter ved de betroede Git-kald og verificér de læste rå objektbytes mod deres OID. Uden replacement eller ændret lås/path afviser linje 152 faktisk en anden rolleblob.

**Mutanter.** **E** = eksekveret mod faktisk hjælperkode i hukommelsen; **K** = kodeafledt vurdering af den leverede selvtest. Ingen K-række er et rapporteret, eksekveret mutantdrab.

| Mutant | Fanges af v3-selvtesten? |
|---|---|
| a · fjern `-s/-f/! -L` | **K: samlet ja**, via symlink-casen, linje 101–102. **Separat fjernet `-s` eller `-f` overlever** de leverede fixtures. |
| b · argument som effort | **K: ja**, argv-kontrollen på linje 76. |
| c · drop frys-check | **K: rød fejltekst, utilstrækkeligt effektbevis.** Nul-OID-fixturen fejler senere ved `git show`, også uden checket. Brug en eksisterende forkert blob. |
| d · lavere retry-effort | **K: ja**, linje 96. Assertionen blev særskilt afprøvet med lavere effort på andet kald og gik rød. |
| e · behold gammel `.done` | **K: ja**, forudoprettet markør og eksistensassertion, linje 202–204. |
| f · drop worktree-lock/pinned-check | **K: ja**, committed-grenen, linje 177–179. |
| g · hardkod model/effort | **K: nej.** Alle gyldige Codex-låsefixtures kræver samme værdier. |
| h · drop OUT-udenfor-workdir | **K: ja**, linje 148–149. |
| i · drop Codex-kræver-kvittering | **E: dræbt.** Original afviste; mutant accepterede. Suitecase: linje 222–223. |
| j · drop SHA256-binding | **E: dræbt.** Forkert draft-hash og anden leverance blev accepteret af mutanten, afvist af originalen. Suitecases: linje 231–235. |

**Berørte naboer.** `krav-gate-run.mjs:57–85` læser ingen kvittering. Transportkravet skal håndhæves ved den obligatoriske verifikationsgrænse, eksempelvis gennem en fælles verifikator med durabel kvitterings-/leverancereference. Hjælperen alene er omgåelig. `RUN_KEYS` tillader fortsat kun de eksisterende felter plus `effort`; et tilføjet `receipt_sha256` blev afvist. Kontrakten skal derfor ændres sammenhængende. `hooks.mjs` accepterer det nye stisæt uden kontraktbrud.

Driverens wrappersignatur er uændret. Hjælperkaldet skal ændres fra valgfri provenance til **kvittering + leverance**, og approval skal bruge kvitteringens `run_id`. Eksisterende driverkode er ikke leveret, så migrationen er ikke bevist.

**Residualen er ærligt navngivet, men utilstrækkelig som lokal lukning.** Binærerne er ikke integritetspinnede, og kvitteringen mangler både autentificering og obligatorisk gate-binding. Henvisningen »plan 2.F/P-1« dokumenterer ikke i det leverede input et delegeret mandat til at svække F-2. En sådan kravændring kræver Mathias’ ord; betegnelsen »residual« lukker ikke fundet.

**Det rigtige:** Struktureret engangslæsning, beregnet leverancehash, forsøgssekvens og retry-argv er væsentlige forbedringer. Hookens tre oprindelige stivektorer afvises nu, og krav-gatens ti rene udvælgelsescases bestod den isolerede genkørsel.