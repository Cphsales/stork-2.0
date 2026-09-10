**FAIL for `codex-run.sh` @ `f2990e07421427b5f9fd18781d964891c8beeee1`.** De ni `.mjs`-modulers runde-9-PASS genbekræftes. **G-F1 er ikke eneste udestående:** deltaet åbner et bypass ved tom binærlås, og to relevante kildebindingsmutanter overlever de leverede cases.

Begge diffs rekonstruerer de angivne før-/efter-blobs. Filerne matcher også Git-objekterne ved commit `1f5daf5c699c4141b6a0068b4665db5103939fd9`. Ingen filer skrevet; intet web.

Efterprøvningen anvendte Bash-udtræk, reelle SHA-beregninger og faktiske Node-/Codex-versionstarter. Git-/filtilstand for angrebscases blev modelleret i hukommelsen. Den fulde selvtest og driverens sandbox-røgtest er ikke genkørt; selvtesten kræver skrivning.

**F-3f: Tom `binaries.lock.json` åbner selvtestgrenen i produktion.**

Efter vellykket Node-autorisation kan [læsningen på linje 168](scripts/v5/codex-run.sh) returnere en tom streng med rc 0. Betingelsen `[ -n "$BINLOCK" ]` på linje 193 bliver falsk, hvorefter linje 212 vælger `CODEX_EXEC="$CODEX"`.

Denne gren kontrollerer **ikke** `SELFTEST`. Den springer shim-hash, native-hash og versionsbinding over.

Eksekveret med `SELFTEST=0`, korrekt Node-pin og den installerede CLI:

| Binærlås | Codex-starter | Observeret resultat |
|---|---:|---|
| Leveret, gyldig lås | 1 | Native starter; version `codex-cli 0.154.0` accepteres |
| Forkert shim-pin | 0 | BLOKER |
| Tom blob | **1** | **Shim starter; versionsfasen passerer uden Codex-pins** |
| Kun afsluttende LF’er | **1** | Samme bypass |
| Ét mellemrum | 0 | JSON-parseren afviser |

Den rekonstruerede 10c-version afviser den tomme lås allerede ved Node-tekstkontrollen. **Det er derfor en regression i dette delta.**

Jeg har ikke produceret en grøn slutkvittering fra bypasset. Den faktiske start uden de krævede pins er i sig selv det påviste brud.

**Angrebs-spec:** Adgang til grenen uden binærkontrol skal afhænge af den eksplicitte selvtesttilstand. Tilføj tom blob og LF-only-lås med korrekt Node-pin; kræv BLOKER og **nul Codex-starter**, inklusive `--version`. Dræb mutanten, der igen lader tomt låseindhold vælge direkte shim-start. Node-starter behøver ikke være nul her: Node er allerede autoriseret.

**F-3d/målelag: Arbejdstræ og alternativt `node`-felt er ikke skelnet af de leverede cases.**

[Selvtesten](scripts/v5/codex-run.selftest.mjs) committer hver ændring af `node.pin` før kørsel. Den planter kandidatens hash i `andet.sha256`, men aldrig i et genindført `node.sha256`.

Derfor overlever begge følgende meningsfulde mutanter:

| Manglende case | Original | Mutant |
|---|---|---|
| Commit-pin = A; arbejdstræ-pin = B; valgt Node = B | BLOKER, 0 Node-starter | Arbejdstræ-læsning: **1 faktisk Node-start** |
| Commit-pin = A; låsens `node.sha256` = B; valgt Node = B | BLOKER, 0 Node-starter | »Pin ELLER node-felt«: **1 faktisk Node-start** |

A og B var de installerede Node v24.15.0 og v22.11.0 med forskellige, beregnede SHA256-værdier. Det er målehuller, som kan skjule eksekvering uden autorisation fra den committede pin; de består vejnings-reglen.

**Angrebs-spec:** Tilføj netop disse to cases med den leverede falske Node. Kræv nul Node-starter og dræb henholdsvis arbejdstræ-mutanten og alternativ-kilde-mutanten.

Den efterspurgte mutant-tabel følger. Dækningen er efterprøvet mod de relevante leverede case-betingelser gennem udtrækkene; dette er ikke en fuld selvtestkørsel.

| Mutant | Fanges af leverede cases? | Begrundelse |
|---|---|---|
| a. Node-start før pin-tjek | **Ja** | Bl.a. manglende pin: `nodeStarts` ændres fra 0 til 1 |
| b. `grep -c == 1` → `grep -q` | **Nej; redundant værn** | Længde 71 udelukker to matchende linjer; den præcise hashbinding består |
| c. Fjern længdetjek | **Nej; redundant for autorisationen** | De fem cases afvises fortsat; ekstra indhold kan ikke passere den efterfølgende fulde hash-sammenligning |
| d. Læs pin fra arbejdstræ | **Nej — materielt målehul** | Ingen leveret case har forskellige commit-/arbejdstræ-pins |
| e. Fjern hash-sammenligningen | **Ja** | n1/n2 får Node-start og bryder nulstartsassertionen |
| f. Genindfør `node` som alternativ kilde | **Nej — materielt målehul** | `andet.sha256` aktiverer ikke denne alternative kilde |

Jeg kræver ikke ekstra mutantdrab for b/c: det ville gøre redundante værn isoleret nødvendige.

**10c’s konkrete tekstmedlemskabsangreb er rettet med effektbevis.** Originalen afviser fremmed Node med hash i `andet.sha256` før start. Mutanten, der genindfører tekstmedlemskab, ændrer observationen fra 0 til 1 Node-start og dræbes af n2.

Node-grammatikken blev desuden efterprøvet under både `C` og `C.utf8`:

- CRLF, BOM, indledende tom linje, to sha-linjer, multibytetilføjelser og de fem leverede grammatikbrud afvises før Node-start.
- Manglende afsluttende LF accepteres.
- Ekstra afsluttende LF’er og indlejrede NUL-bytes accepteres, fordi Bash fjerner dem før kontrollen.
- `${#…}` tæller bytes under `C`, men tegn under `C.utf8`.

Påstanden om **rå filbytes som præcis én linje** er således for stærk. De accepterede normaliseringer ændrer imidlertid ikke den præcise hashbinding og udgør ikke et selvstændigt FAIL efter opgavens afgrænsning.

`g()` sender også `--no-replace-objects` ved pin-opslaget. Et faktisk opslag af den bundne `node.pin`, med en konfigureret textconv-driver, returnerede de originale bytes uden `--textconv`. Denne blob-læsning anvender ikke checkout/smudge.

`sha_of`, den minimale `printf`-kvittering og EXIT-stien starter ingen Node før autorisation. Mismatch, manglende pin og CRLF gav alle blokeret kvittering med `node_pinned=false`, efterfulgt af cleanup og nul Node-starter.

Registerresultater og inputbinding:

```text
FAIL codex-run.sh        f2990e07421427b5f9fd18781d964891c8beeee1

PASS gates.mjs           9c94efde403d26312f72557b3bfb5dcf1a223429
PASS git.mjs             9bc53ebfd7ea1a4e56906a567f276638297620cb
PASS gate-eval.mjs       1f9934570739d2b14b7ab27833f9084fbf15fe5b
PASS verdikt.mjs         4d80c7b05f01540d6a3a65438fb07ad172e334b7
PASS kvittering.mjs      a9f13ed38449d8961a361dead87e4076f36fee91
PASS verdikt-byg.mjs     411f47f6a482384e3e0adc58e89cbf98222c627f
PASS recon-gate-run.mjs  b776d19d9d4fe8e3169e780d30c5ef4a2181a060
PASS krav-gate-run.mjs   a8723a5321e733b4b5fc385559087ad2195daf9f
PASS plan-gate-run.mjs   8b4f60f529262e353a9f8f3a89c72819a3aee5f3

INPUT binaries.lock.json             dac912f2d621cc64947216bca050ef0e501e7ea5
INPUT node.pin                       609bb6560b1ac427f5afd0fecb65587386de711a
INPUT codex-run.selftest.mjs          0f34a09184971240943123535bd191031b6cc2f2
INPUT haerdet-register.json           f854e109005272918c078966ca52ffc9245cf555
INPUT DIFF-runde10c-til-runde10d.diff  66a74b30d19a235aa068d234fe0f6d4366755272
INPUT DIFF-runde9-til-runde10d.diff    413910f526b87068b3ca82c8cc26a0b16b879de8
INPUT RUNDE9-FUND.md                  325bd3e574c941f7897cb3d2e621b5104350e08f
INPUT RUNDE10b-FUND.md                7dceb895c48ae587471ba5c2c116f5161dca6180
INPUT RUNDE10c-FUND.md                ba14753c5ae466fd94f97e896093fb723b441e18
```

**F-3f og F-3d’s to målehuller er ikke lukket; de kræver rettelse med bevis. G-F1 kræver fortsat Mathias’ ord → HALT.** Begge historiske kanoniske digests matcher undtagelseslisten; det beviser ikke mandatet. Dette FAIL er blokerende input til gaten.