**FAIL for hærdningen af `codex-run.sh` @ `5102d31b37e1b793d7e8e406c3fa4583448190c8`.** F-3g er rettet med effektbevis, men ændringen af selvtesten indfører ét materielt målehul: **F-3h — native-versionstarter før hashkontrollen kan slippe gennem grønne assertions.** G-F1 er derfor ikke eneste udestående.

Begge diffs rekonstruerer de angivne før-/efter-blobs. De ni `.mjs`-moduler matcher runde-9-PASS. Ingen filer skrevet; intet web. Efterprøvningen anvendte produktionsudtræk, faktiske binærhashes og versionsstarter samt filtilstand modelleret i hukommelsen. Den fulde selvtest og sandbox-røgtesten er ikke genkørt.

**F-3h: Selvtestens ELF-fixture skjuler en relevant rækkefølgemutant.**

[Selvtesten](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde10f/wd/scripts/v5/codex-run.selftest.mjs:105) tæller `argv.*`-filer. Node-fixturens indbyggede `--version` kører imidlertid uden `exec.js` og producerer ingen startlog. Derfor beviser `wb` og `wg` på linje 368/409 ikke deres påståede nulstarter.

Den konkrete mutant flytter [native-hashkontrollen på linje 216](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde10f/wd/scripts/v5/codex-run.sh:216) til umiddelbart efter versionskaldet på linje 227. Kontrollen gælder fortsat kun ved `BINCHECK=1`; øvrige værn bevares.

| Efterprøvning | Original | Mutant |
|---|---|---|
| Forkert native-pin, faktisk versionsstart | 0 starter | **1 start** |
| Efterfølgende wrapperresultat | BLOKER, rc 1 | BLOKER, rc 1 |
| ELF-fixturens registrerede starter | 0 | **0** |
| Leverede `wb`-/`wg`-assertions i replay | Består | **Består** |

Programstarten blev også efterprøvet med den **installerede native Codex på dens faktiske vendor-sti, uden filmodellering**. Med native-pin `000…000` returnerede mutanten `codex-cli 0.154.0`, rc 0, før hashværnet blokerede. Den startede binærs SHA256 var:

```text
3188814c35471432d4123203e0eb38e5bddc60226e3d7ddf0e59e649ea140022
```

Den hash fandtes hverken i angrebslåsens pins eller i `node.pin`. Det er derfor en demonstreret falsk-grøn for **start uden native-autorisation**. Den leverede wrapper har korrekt rækkefølge; FAIL gælder hærdningsbeviset.

**Angrebs-spec:** Målingen skal observere enhver native-start, inklusive `--version`, uafhængigt af `exec.js`. Bevar positiv kontrol. Forkert native-pin skal give nul observerede starter; ovenstående flyttemutant skal give mindst én og dræbes af assertionen. F-3h kræver rettelse med dette bevis.

**F-3g er rettet med bevis ved den nye wrapper-OID.** Grammatikken afviser shim-sti og alias; ELF-kontrollen afviser shim-bytes på en grammatisk gyldig vendor-sti. Ophævelse af ELF-værnet ændrede shim-kopi-replayet fra BLOKER uden start til faktisk shim-start.

En anden ELF, eksempelvis Node, kan accepteres med dens egen korrekte pin og version. Det ligger inden for opgavens udtrykkelige ramme: »låsen er en betroet, versionsbundet kilde«. Wrapperen binder eksekveringen til de autoriserede bytes; låsens review bærer **binærens produkt-/udgiveridentitet ved en bevidst pin-opdatering**. ELF-magic attesterer ikke Codex-identitet. Dette er den præcise tillidsgrænse, ikke et nyt wrapperfund eller en residual-lukning af F-3g.

Rækkefølgen er grammatikkontrol → ELF → native-SHA → `--version`. System-`cmp` afviste eksekveret 0-, 1- og 3-byte-input, forkert magic, manglende fil og læsefejl. Ingen af dem gav stille accept. Bash’ manglende `pipefail` åbner ikke denne vej: `cmp` er sidste pipelinekommando, og dens fejl udløser `blok`.

| Efterspurgt mutant | Fanges af leverede cases? |
|---|---|
| a. Fjern ELF-tjekket | **Ja:** shim-kopi, `wg2`; start bliver mulig og assertionen fejler. |
| b. Erstat regex med »ender på `/bin/codex`« | **Ja:** traversal-casen `we` passerer det lempede værn og når versionsstart. |
| c. Erstat regex med »starter med `/node_modules/@openai/`« | **Nej.** ELF og SHA beskytter fortsat shim-negativet. Intet selvstændigt FAIL eller krav om isoleret mutantdrab. |
| d. Genindfør 10e-kontrollen uden begge nye værn | **Ja:** shim-kopi-casen dræber mutanten gennem startobservationen. |

Jeg kræver ikke den droppede `rc≠0`-case som en særskilt delta-betingelse. Det uændrede rc-værn genåbnes ikke; F-3h kræver konkret måling af den nu usynlige versionsstart.

Registerresultater og inputbinding:

```text
FAIL codex-run.sh        5102d31b37e1b793d7e8e406c3fa4583448190c8

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
INPUT codex-run.selftest.mjs          63543c9449429078476b8d32b131b6b22ed2e5e2
INPUT haerdet-register.json           f854e109005272918c078966ca52ffc9245cf555
INPUT DIFF-runde10e-til-runde10f.diff  34aad51c4b37d9fed4b833f3b101d04621fe97ad
INPUT DIFF-runde9-til-runde10f.diff    b5ee1d14f22d6a6a42696096fc0627ce0f970fb4
INPUT RUNDE9-FUND.md                  325bd3e574c941f7897cb3d2e621b5104350e08f
INPUT RUNDE10d-FUND.md                549b32e3129b4a5dde6680a14baf2d8e8dd44540
INPUT RUNDE10e-FUND.md                8c282f1a4efa50ac159c893770dc8095fafa1ec1
```

**G-F1 kræver fortsat Mathias’ ord → HALT.** Begge historiske kanoniske digests matcher undtagelseslisten; det beviser ikke mandatet. Dette FAIL er blokerende input til gaten.