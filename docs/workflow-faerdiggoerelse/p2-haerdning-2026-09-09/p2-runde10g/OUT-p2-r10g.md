**HALT for en ny PASS-entry til `codex-run.sh` @ `5102d31b37e1b793d7e8e406c3fa4583448190c8`.** Rettelsen består mine effekt-replays, men F-3h kan ikke lukkes med et hashbundet bevis for den leverede tracers faktiske mutantkørsel. **G-F1 kan derfor endnu ikke erklæres eneste udestående.** Jeg rejser intet nyt implementeringsfund mod wrapperen.

Begge diffs rekonstruerer deres før-/efter-blobs. Wrapperen matcher runde 10f, og alle ni `.mjs`-moduler matcher runde-9-PASS. F-3g’s tidligere bevisbundne lukning består. Ingen filer skrevet; intet web.

**Det eksekverede bevis støtter rettelsen:**

| Værn → mutant | Effekt-replay, original → mutant | Leveret måling |
|---|---|---|
| F-3h/native-pin → flyt hashkontrollen efter `--version` | Native-starter **0 → 1**; begge afslutter BLOKER | `wb` og `wg`: **grøn → rød** |
| F-3g/ELF → flyt ELF-kontrollen efter `--version` | Shim-starter **0 → 1**; efterfølgende BLOKER | `wg2`: **grøn → rød** |
| F-3b/eksekveringsbinding → vælg shim som `CODEX_EXEC` | Shim-starter **0 → 1** | `w2`’s nul-shim-predikat: **grøn → rød** |
| F-3d/Node-autorisation → start Node før pin-kontrollen | Node-starter **0 → 1**; efterfølgende BLOKER | `n1`’s kernel-assertion: **grøn → rød** |
| Måleinfrastruktur → fjern traceren globalt/tøm alle spor | Ingen registrerede starter | Første positive kontrol, `n1` og `w2`: **røde** |

De fire første replays anvendte wrapperens Bash-udtræk, faktiske binærer og `/proc`-observation. Observationerne gik gennem den **leverede `logexec`-formatter og parser** til assertions. ELF-casens stiopslag blev modelleret; Git-opslaget blev modelleret i Node-pin-casen. Dette er faktisk starteffekt med assertion-replay, **ikke en fuld selvtest eller en fungerende ptrace-kørsel**.

**Bevisbindingen er det resterende problem:**

- Denne sandbox returnerer eksekveret `PTRACE_TRACEME = -1`, `errno = EPERM`. Traceren ignorerer fejlen og returnerer eksempelvis **rc 0 med tom log** for `/bin/true`. De positive kontrolassertions gør denne globale målefejl rød.
- [Det vedlagte spor](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde10g/wd/TRACE-rigtig-dom-koersel.log:42) indeholder uescapede linjeskift inde i argumenter. Den [leverede formatter](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde10g/wd/scripts/v5/exec-tracer.py:21) escaper dem. Sporet kan derfor ikke uden dokumenteret efterbehandling eller versionsbinding tilskrives tracer-OID `bf8e691…`.
- Sporet indeholder **410 `EXEC`-poster på 476 tekstlinjer**. Parseren finder de oplyste native-PID’er med `["--version","exec"]`, efter `cmp` og SHA-kommandoerne. Det støtter den normale rækkefølge, men dokumenterer ikke en targeted mutantkørsel med den leverede tracer.

**De øvrige efterspurgte angreb giver følgende afgrænsning:**

- Den faktiske eventloop-kode blev eksekveret med modellerede root-, fork-, vfork-, clone- og exec-events, inklusive barnets stop før forælderens fork-event. Første root-exec blev logget, og options blev sat før fortsættelse. Kerneladfærden blev ikke genkørt lokalt.
- `CLONE_UNTRACED` kan undgå automatisk tracing. Wrapperens normale Bash/env-startsti anvender ikke denne mekanisme; jeg har ikke etableret en data-nåelig omgåelse før den første autoriserede programstart. Det bliver derfor ikke et selvstændigt fund.
- `startsAf` tæller env→Node-shebang én gang pr. PID og ignorerer de prøvede `sha256sum`-, `realpath`-, `cmp`- og timeout-læsninger. Den overser scripts ved `argv[3+]` og ukendte fortolkere. De konkrete leverede shim-cases bruger de understøttede positioner; en efterfølgende direkte ELF-exec genkendes via `exe`.
- `argv[:8]` bevarer native-programmets `argv[1]`; trunkeringen åbner ikke det konkrete rækkefølgebevis. `wc` og `w2` sammenligner argumentrækkefølgen. **`wh` kræver kun én start, ikke eksplicit `argv[1] === "--version"`.**
- Kun første kontrol og `n1` har eksplicit `execs.length > 0`. `w`, `wa`, **`wb`**, `wd`, `we`, `wg1`, `wg2` og **`wg`** mangler det. Tom-lås-casene og flere Node-pin-cases bruger fortsat fixtureloggene. Global fjernelse af traceren dræbes af de positive kontroller; **`wb` består isoleret med tom log**, hvilket blev eksekveret. Jeg gør ikke denne forskel til et nyt suite-FAIL.

**Angrebs-spec for lukning af F-3h:** Lever en læsbar kørsel bundet til de nedenstående OID’er fra et miljø med fungerende ptrace: grøn original/positiv kontrol og rød targeted mutant »native-hash efter `--version`«, hvor selve tracerloggen viser den ekstra native-start. Medtag tilsvarende udfald for de øvrige efterspurgte mutanter. Det efterprøver den eksisterende forpligtelse; der kræves ingen ny wrapperfunktion.

Registerresultater:

```text
HALT codex-run.sh        5102d31b37e1b793d7e8e406c3fa4583448190c8

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
INPUT exec-tracer.py                 bf8e6917114285eb0a25ecd7d4615ef90a3217c6
INPUT codex-run.selftest.mjs          cccb8ce39362ec8bcd1d452855b890533c63d7d7
INPUT haerdet-register.json           f854e109005272918c078966ca52ffc9245cf555
INPUT DIFF-runde10f-til-runde10g.diff  06e8f091ffffa58f5db968e25cc12b247a4bbfc2
INPUT DIFF-runde9-til-runde10g.diff    c1257e0111ab5408cec5372e69f69eab3c8f5f94
INPUT TRACE-rigtig-dom-koersel.log    13ed6cea29cfb26048a74e0791882de376382208
INPUT RUNDE9-FUND.md                  325bd3e574c941f7897cb3d2e621b5104350e08f
INPUT RUNDE10e-FUND.md                8c282f1a4efa50ac159c893770dc8095fafa1ec1
INPUT RUNDE10f-FUND.md                f2ec458edc11c7862f611114b509a7c69ce6e58e
```

**G-F1: kræver fortsat Mathias’ ord → HALT.** Begge historiske kanoniske digests matcher undtagelseslisten; ligheden beviser fortsat ikke mandatet. Denne dom er input til gaten.