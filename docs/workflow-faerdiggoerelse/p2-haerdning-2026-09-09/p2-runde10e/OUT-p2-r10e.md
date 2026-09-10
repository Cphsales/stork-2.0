**FAIL for `codex-run.sh` @ `a7e1ebb60c511767265baaa5cb8d15817c7b0e7f`.** F-3f og F-3d’s to målehuller er rettet med bevis. Et særskilt **F-3g** tillader imidlertid start af en native Codex-binær uden dens hashbinding. **G-F1 er derfor ikke eneste udestående.** De ni `.mjs`-modulers runde-9-PASS genbekræftes.

Begge diffs rekonstruerer de angivne før-/efter-blobs. Ingen filer skrevet; intet web. Efterprøvningen brugte Bash-udtræk, faktiske binærhashes og versionsstarter samt Git/FS modelleret i hukommelsen. Den fulde selvtest og sandbox-røgtesten er ikke genkørt; udsnittet mangler `.git`, og selvtesten kræver skrivning.

**F-3g: “native” kan være shim’en selv — som starter en anden, ikke-hashbundet binær.**

Bevar korrekt `node.pin` og `codex`-felt. Erstat låsens `codex_native` med:

```json
{
  "sha256": "61b0194f3bb6534439c8d26a3ed57d0805f84b884588b761795323eeb92fcf70",
  "path_from_pkg_root": "/bin/codex.js"
}
```

[Wrapperens kontrol](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde10e/wd/scripts/v5/codex-run.sh:210) accepterer filen: korrekt realpath, almindelig eksekverbar fil, tilladt prefix og matchende SHA. Dermed bliver `CODEX_EXEC` shim’en gennem **binærkontrolgrenen**, selv med `SELFTEST=0`.

Eksekveret resultat:

| Lås | Versionsfasen | Observeret eksekvering |
|---|---|---|
| Leveret lås | Accepteret, `codex-cli 0.154.0` | Den hashbundne native |
| Ovenstående `codex_native` | **Accepteret, samme version** | Shim → faktisk native uden dens hashbinding |
| Sti `/bin/./codex.js` | **Samme bypass** | Samme native |

Jeg observerede den faktiske native proces gennem `/proc`. Dens SHA256 var:

```text
3188814c35471432d4123203e0eb38e5bddc60226e3d7ddf0e59e649ea140022
```

Denne hash findes **ikke blandt angrebslåsens pins eller Node-pinnen**. Shim’ens kode vælger programmet gennem `require.resolve` og starter det med `spawn`. At hashe shim’en to gange binder derfor ikke det program, den starter. Versionskontrollen består også.

**Den leverede lås uændret udløser ikke angrebet.** Repro kræver ovenstående låseindhold fra `regel_commit`. Ingen binær blev ændret, og jeg har ikke produceret en grøn slutkvittering. Den observerede programstart uden native-pin er selve bruddet.

**Angrebs-spec / kill-list for F-3g:** Før første `--version` skal produktionskontrollen sikre, at native-kandidaten er den native eksekverbare fil, som hashbindingen skal dække. En eksekverbar shim må ikke opfylde dette.

- Tilføj produktionscase med ovenstående lås og korrekt Node-pin. Kræv BLOKER og **nul shim-/Codex-starter**, inklusive versionskald.
- Dæk realpath-alias og en shim-kopi på en anden sti, så en rent tekstlig stisammenligning ikke kan give falsk-grøn.
- Dræb mutanten, der ophæver denne native-binding, gennem den faktiske startobservation. Bevar en positiv kontrol med korrekt native og version.

Dette er ét afvisningskriterium; redundante værn skal ikke hver især gøres nødvendige. **F-3g er åbent og kræver rettelse med effektbevis.**

**De tidligere fund og selvtest-kæden:**

- **F-3f: rettet med bevis.** Tom blob, LF-only og whitespace-only gav BLOKER og nul Codex-starter. Den minimale kvitteringsserializer gav `status="blokeret"`. Genindsættelse af den rekonstruerede 10d-kontrol ændrede tom/LF-casene til faktisk shim-start; regressionen dræbes.
- **F-3d/målelag: rettet med bevis.** Commit-pin A/arbejdstræ-pin B/valgt Node B og commit-pin A/låsens `node.sha256` B/valgt Node B gav begge nul Node-starter. De respektive mutanter gav én faktisk Node-start. De **leverede `nd`-/`nf`-assertions blev eksekveret** mod observationerne og skiftede fra bestået til fejlet. Replays brugte to installerede Node-binærer.
- **Ufuldstændig/anderledes JSON:** `null`, array, streng, `{}`, manglende krævede pinfelter og `..`-traversal blev afvist før Codex-start.
- **Selvtest udefra: kæden holder.** Den præcise miljøværdi `"1"` bliver `selftest=true`. Kvitteringsserializer → `verdikt-byg` → transportverifikator → gate-kerne blev efterprøvet: hjælper exit 1, transport afvist, gate lukket. Positiv kontrol åbnede den modellerede gate. Manglende flag, `"false"`, `0` og `null` blev også afvist. Git/FS og øvrig godkendelse var modelleret.

**Mutanttabellen kræver præcis locusangivelse:**

| Mutant | Fanges af leverede cases? | Observation |
|---|---|---|
| a. Kun linje 197: `BINCHECK` → ikke-tom `BINLOCK` | **Nej; nu redundant** | Tom-lås-værnet stopper tidligere. Dette alene genindfører ikke 10d-regressionen. |
| a. Begge `BINCHECK`-betingelser ændres | **Ja** | Første blok springes over; de leverede FORCE-cases får Codex-start. |
| b. Fjern tom-lås-tjekket | **Ja, på fejlteksten** | `/er tom/` fejler. JSON-parseren blokerer fortsat; nul Codex-starter. Ikke et isoleret sikkerhedsbypass. |
| c. Pin fra arbejdstræet | **Ja** | `nd`: Node-starter 0 → 1. |
| d. Pin ELLER låsens `node.sha256` | **Ja** | `nf`: Node-starter 0 → 1. |
| e. Fjern dobbeltsikringen alene | **Nej; redundant** | Enig: isoleret mutantdrab skal ikke kræves. |

Registerresultater — alle ni PASS er byte-identiske med runde 9:

```text
FAIL codex-run.sh        a7e1ebb60c511767265baaa5cb8d15817c7b0e7f

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
INPUT codex-run.selftest.mjs          67a3f7c644eaa867cd72e3eb10958f5cd7e2967c
INPUT kvittering.selftest.mjs         07ff633bb894bd15583ff526baeb71ec54cd9a82
INPUT haerdet-register.json           f854e109005272918c078966ca52ffc9245cf555
INPUT DIFF-runde10d-til-runde10e.diff  014540d404cc5dabed26351d963e3529cda46a0b
INPUT DIFF-runde9-til-runde10e.diff    43279dc486fe6e94d1c9891a2d43db09ce91945a
INPUT RUNDE9-FUND.md                  325bd3e574c941f7897cb3d2e621b5104350e08f
INPUT RUNDE10c-FUND.md                ba14753c5ae466fd94f97e896093fb723b441e18
INPUT RUNDE10d-FUND.md                549b32e3129b4a5dde6680a14baf2d8e8dd44540
```

**G-F1 kræver fortsat Mathias’ ord → HALT.** Begge historiske kanoniske digests matcher undtagelseslisten; det beviser ikke mandatet. Dette FAIL er blokerende input til gaten.