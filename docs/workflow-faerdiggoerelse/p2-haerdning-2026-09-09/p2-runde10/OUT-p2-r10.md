**FAIL for `codex-run.sh` @ `1caee1ac8e1935bdda7dab1e534e49353dfee0ff`.** De ni `.mjs`-modulers runde-9-PASS genbekræftes. **G-F1 er fortsat HALT, men er ikke længere eneste udestående: F-3b er ikke lukket.**

Ingen filer skrevet; intet web. Diffens før-/efter-OID’er er rekonstrueret og verificeret. Inputbeskrivelsen kræver én korrektion: diffen ændrer også `haerdet-register.json`.

Jeg har eksekveret produktionskodens pin-blok, konkrete mutanter, shim-resolveren, den leverede mock samt kvitterings- og transportkontroller. Git-opslag og udvalgte fil-/procesoperationer var modelleret i hukommelsen. **Den fulde selvtest er ikke kørt:** den skriver midlertidige filer og kræver et Git-repository; udsnittet mangler `.git`.

**1. F-3b/rækkefølge: en ikke-pinnet executable køres før kontrollen.**

[Linje 142 i wrapperen](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde10/wd/scripts/v5/codex-run.sh:142) starter `"$CODEX" --version`. Låsen læses først bagefter; shim- og native-hash kontrolleres på linje 159 og 165.

Eksekveret rækkefølge ved forkert native-hash:

```text
exec --version
hash shim
hash native
BLOKER
```

Forkert shim-hash og manglende `codex_native` gav også **kald først, BLOKER bagefter**. En efterfølgende rød kvittering tilbagekalder ikke allerede eksekveret kode.

[Selvtestens mock](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde10/wd/scripts/v5/codex-run.selftest.mjs:34) returnerer fra `--version` **før** kaldelogningen. Eksekveret separat:

```text
--version → exit 0, argvLogs=0
exec      → exit 0, argvLogs=1
```

Derfor beviser `calls.length === 0` i FORCE-casene ikke »ingen codex-kode kørt«.

**Angrebs-spec:** Log alle starter, inklusive `--version`. Udskift shim henholdsvis native før wrapperstart; kræv afvisning uden nogen start. Targeted mutant: flyt versionskaldet foran bytekontrollerne. Den skal dræbes af startobservationen. Korrekt rækkefølge er låsvalidering → shim/native-integritet → versionskald og sammenligning → `exec`.

**2. F-3b/filbinding: wrapperen kan kontrollere en anden native end shim’en vælger.**

[Wrapperen](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde10/wd/scripts/v5/codex-run.sh:161) udleder native fra pakkeroden og låsens faste suffix. Den faktisk pinnede [shim](/home/mathias/.nvm/versions/node/v24.15.0/lib/node_modules/@openai/codex/bin/codex.js:79) bruger derimod:

```js
require.resolve(`${platformPackage}/package.json`)
```

Native vælges relativt til dette opslag; ved opslagfejl bruges `<pakkerod>/vendor/…`.

Den lokale shim og native matcher begge låsens fulde SHA256. Med uændrede bytes i disse to filer blev følgende **JSON-baserede** ændring prøvet gennem shim’ens faktiske resolver og Nodes faktiske exports-resolver:

```json
{"exports":{"./package.json":"./alt/package.json"}}
```

Resultat:

```text
Hashet:  …/codex-linux-x64/vendor/…/bin/codex
Valgt:   …/codex-linux-x64/alt/vendor/…/bin/codex
```

En exports-konfiguration, der afviser `./package.json`, aktiverede også fallback til `<pakkerod>/vendor/…/bin/codex`.

Den uændrede pin-blok accepterede de oprindelige, korrekt pinnede filer, når den modellerede alternative executable svarede med låsens versionsstreng. Kvitteringsproducenten registrerede den **hashede** native; der findes ingen sammenligning med shim’ens faktisk valgte executable. Alternativ filtilstedeværelse og processtart var modelleret; dette er ikke en fysisk end-to-end-kørsel af en injiceret binær.

Versionssvaret kan altså ikke bære forsvaret: den alternative executable kan returnere den forventede tekst.

**Angrebs-spec:** Bevar shim og låsens native byte-identiske. Tilføj en alternativ executable med samme versionssvar, og styr valget gennem henholdsvis package-exports og fallback. Observer den faktisk startede native. Wrapperen skal binde eksekveringen til den verificerede fil. Targeted mutant: kontrollér en pinnet attrap, mens dispatch bruger alternativet. De leverede selvtests mangler denne binding: deres falske shim starter aldrig native-fixturen.

**Øvrige efterprøvninger**

| Vektor | Resultat |
|---|---|
| Native udskiftet, shim uændret | Native-hash afviser, men efter det tidlige versionskald. |
| Native som symlink | Accepteres, hvis målets hash matcher. `realpath` fjerner symlinket før `-L`-testen. Forkert målhash afvises; derfor intet selvstændigt fund om pin-omgåelse. |
| Shim flyttet inden for kendt prefix | Placeringen er ikke bundet til `entry_suffix`. Rodafledningen alene beviser ikke omgåelse; forskellig native-resolution er det konkrete hul ovenfor. |
| URL-encodede/unicode-`..` | Ingen traversal-dekodning; prøvede stier afvises som manglende filer. |
| Dobbelte skråstreger / trailing slash | Dobbelte accepteres med samme kanoniske fil og hash; trailing slash på fil afvises. |
| SHA i store bogstaver; CR/LF i låsens version | Afvises af låsvalideringen. |
| JSON-dubletnøgler / `__proto__` | Sidste dubletværdi kontrolleres konsekvent. Native alene under `__proto__` afvises. |
| Flere versionslinjer | **Accepteres**, når første linje matcher. `head -1` ignorerer resten. Matchende output med exit 7 accepteres også. |
| Tomt versionsoutput / CRLF-output | Afvises mod den leverede lås: henholdsvis `ukendt` og ekstra CR matcher ikke. |
| Ugyldig `BIN_JSON` fra `"` eller ugyldig backslash-escape | Kvitteringsopbygningen fejler; succesafslutningen returnerer 1, udsteder fjernelse af leverancen og når ikke `.done`. |

Ændringen rører ikke flock, den private kørselsmappe eller OUT-reglerne. En almindelig BLOKER efter låsetagning kan efterlade en kvittering med **`status=blokeret`**; det er ikke en grøn kvittering. `.done` oprettes først efter vellykket kvitteringsskrivning.

`SELFTEST=1` uden FORCE springer pin-blokken over og mærker kvitteringen `selftest=true`. Produktionsverifikatoren afviste dette flag i den eksekverede kontrol. FORCE-casene når faktisk både native- og versionsværnet; deres problem er den skjulte start før kontrollen.

**Mutant-tabel**

For a–d er originalens afvisning og mutantens accept eksekveret i pin-blokken. Koblingen til de leverede assertioner fremgår nedenfor; den fulde selvtest er ikke kørt.

| Mutant | Fanges af leverede cases? | Bevis/dækning |
|---|---|---|
| a. Fjern native-sha-tjek | **Ja** | `wb` og `wg`: hash-afvisningen forsvinder. |
| b. Fjern versionssammenligning | **Ja** | `wc`: forkert version accepteres. |
| c. Accepter lås uden native | **Ja** | `wd`: meningsfuld bagudkompatibilitetsmutant med valgfri native accepterer den gamle lås. Kun at fjerne `!n` efterlader en exception og er ikke denne mutant. |
| d. Tillad `..` | **Ja** | `we`: traversal tilbage til den eksisterende, korrekt hashede fil accepteres. |
| e. Kontrollér native efter første codex-kald | **Nej** | Det er allerede originalens adfærd: `--version` er kørt, men loggen viser nul kald. Flytning helt efter `exec` ville derimod blive fanget af kaldetællingen. |

**OID-bundne registerresultater**

PASS nedenfor genbekræfter de identiske runde-9-blobs; det ophæver ingen HALT.

```text
FAIL codex-run.sh        1caee1ac8e1935bdda7dab1e534e49353dfee0ff

PASS gates.mjs           9c94efde403d26312f72557b3bfb5dcf1a223429
PASS git.mjs             9bc53ebfd7ea1a4e56906a567f276638297620cb
PASS gate-eval.mjs       1f9934570739d2b14b7ab27833f9084fbf15fe5b
PASS verdikt.mjs         4d80c7b05f01540d6a3a65438fb07ad172e334b7
PASS kvittering.mjs      a9f13ed38449d8961a361dead87e4076f36fee91
PASS verdikt-byg.mjs     411f47f6a482384e3e0adc58e89cbf98222c627f
PASS recon-gate-run.mjs  b776d19d9d4fe8e3169e780d30c5ef4a2181a060
PASS krav-gate-run.mjs   a8723a5321e733b4b5fc385559087ad2195daf9f
PASS plan-gate-run.mjs   8b4f60f529262e353a9f8f3a89c72819a3aee5f3

INPUT binaries.lock.json         e6bcac1527a77880c489cc0f96b8f39fd9ff7ff6
INPUT codex-run.selftest.mjs      c0d44b6bc8856839d51e3a79677eee2de9c1f909
INPUT haerdet-register.json       f854e109005272918c078966ca52ffc9245cf555
INPUT DIFF-runde9-til-runde10.diff 7b0b34b37146691f8fe5235d49d4b730cafcb47f
INPUT RUNDE9-FUND.md              325bd3e574c941f7897cb3d2e621b5104350e08f
```

**G-F1: kræver Mathias’ ord → HALT.** De historiske digests matcher fortsat undtagelseslisten; det beviser ikke mandatet. F-3b kræver rettelse med eksekveret bevis og de ovenstående targeted mutanter, før wrapperen kan få PASS. Dette verdikt er blokerende input til gaten, ikke den endelige menneskebeslutning.