**PASS for `codex-run.sh` @ `5102d31b37e1b793d7e8e406c3fa4583448190c8`. F-3h er rettet med bevis efter runde-10g-specifikationen. G-F1 er det ENESTE udestående og kræver fortsat Mathias’ ord → HALT.**

Alle **48 SHA-256-poster** i [bevisarkivets manifest](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde10h/wd/docs/workflow-faerdiggoerelse/p2-haerdning-2026-09-09/f3h-mutant-bevis/README.md) matcher filerne. Begge rundediffs rekonstruerer deres angivne før-/efter-blobs. De fem `mutant.diff` indeholder præcis de beskrevne ændringer; transformationerne a, b og d reproducerer dem byteidentisk.

Den positive begrundelse er, at målingen nu observerer den tidligere usynlige versionsstart og dræber rækkefølgemutanten:

| Værn → targeted mutant | Observeret effekt, baseline → mutant | Leveret kill |
|---|---|---|
| Native-pin → hash efter `--version` | `wb`: 0 → 1 native-start, PID **1456449**, `argv[1]="--version"`. `wg`: tilsvarende PID **1457686**. | Præcis **2 røde**: `wb`, `wg`. |
| ELF → kontrol efter `--version` | `wg2`: 0 → 1 shim-kopistart via `env node …/vendor/…/bin/codex --version`, PID **1465519**. | Præcis **1 rød**: `wg2`. |
| Eksekveringsbinding → `exec` via shim | `w2`: 0 → **2 shim-processer**, PID **1448020/1448048**, begge `exec` — inklusive genforsøget. | **3 røde**: resultat, eksekveringsbinding og positiv trace-kontrol. |
| Node-pin → Node før autorisation | `n1`: 0 → 1 proces, PID **1471441**, `node -e ""` før opslaget af `node.pin`. | **11 røde**, inklusive kernel-assertionen. |
| Måleinfrastruktur → tracer fjernet | Tomt spor gør positive kontroller og de berørte nul-start-assertions røde. | Præcis **18 røde**. |

Baseline har **138 grønne assertions**. Dens `w2` viser præcis to native-starter, `--version` og `exec`, og nul shim-starter. Jeg har eksekveret den leverede parser og startpredikater på **alle 30 arkiverede selvtestspor**; udfaldene stemmer med kill-tabellen. Ingen efterspurgt mutant eller kørsel mangler.

Tracerens delta afbryder eksplicit med exit **125** ved fejlet `PTRACE_TRACEME` eller ingen observerede exec-events. Nul-start-værnene kræver nu et ikke-tomt spor, og `wh` kræver eksplicit `--version`.

Den rigtige kørsel viser native-start ved linje **54**, PID **1484311**, og linje **84**, PID **1484378** — begge efter ELF-kontrollen på linje **50** og SHA-kaldet på linje **51** for samme fil. Kvitteringens native-/shim-/Node-hashes matcher pins; rolleblob, aktørlås og leverancens hash/længde matcher også.

To præciseringer af inputbeskrivelsen:

- Sporet indeholder **418 `EXEC`-linjer og 0 andre linjer**, som README angiver; opgavetekstens 378 stemmer ikke med filen.
- `.provenance` indeholder **ikke et wrapper-blobfelt**. Wrapperbindingen fremgår af README og matcher den genberegnede `5102d31b…`; jeg bekræfter derfor ikke et sådant felt i provenance.

Efterprøvningen gælder det leverede kørselsbevis. De fulde ptrace-/selvtest-kørsler er ikke genkørt her. Ingen filer skrevet; intet web.

**PASS-entries** — alle ni `.mjs`-blobs er identiske med runde-9-PASS:

```text
PASS codex-run.sh        5102d31b37e1b793d7e8e406c3fa4583448190c8
PASS gates.mjs           9c94efde403d26312f72557b3bfb5dcf1a223429
PASS git.mjs             9bc53ebfd7ea1a4e56906a567f276638297620cb
PASS gate-eval.mjs       1f9934570739d2b14b7ab27833f9084fbf15fe5b
PASS verdikt.mjs         4d80c7b05f01540d6a3a65438fb07ad172e334b7
PASS kvittering.mjs      a9f13ed38449d8961a361dead87e4076f36fee91
PASS verdikt-byg.mjs     411f47f6a482384e3e0adc58e89cbf98222c627f
PASS recon-gate-run.mjs  b776d19d9d4fe8e3169e780d30c5ef4a2181a060
PASS krav-gate-run.mjs   a8723a5321e733b4b5fc385559087ad2195daf9f
PASS plan-gate-run.mjs   8b4f60f529262e353a9f8f3a89c72819a3aee5f3
```

Inputbinding med Git-blob-OID; `README.md` er bevisarkivets manifest:

```text
INPUT binaries.lock.json             dac912f2d621cc64947216bca050ef0e501e7ea5
INPUT node.pin                       609bb6560b1ac427f5afd0fecb65587386de711a
INPUT exec-tracer.py                 b834473885a9bbebf898b14073ba3574fc358a16
INPUT codex-run.selftest.mjs          12ec4459b0dde5de5910167b4bfe3e303764a3b4
INPUT README.md                      2faddf87ca48b0aee14468774cbd5a6d7077b7fc
INPUT haerdet-register.json           f854e109005272918c078966ca52ffc9245cf555
INPUT DIFF-runde10g-til-runde10h.diff  675cebb1eb8f92bbfc0bcfbfa5c865ed1427af0f
INPUT DIFF-runde9-til-runde10h.diff    c3237f70dcfd19435f5f32cc320b710047aca413
INPUT RUNDE9-FUND.md                  325bd3e574c941f7897cb3d2e621b5104350e08f
INPUT RUNDE10f-FUND.md                f2ec458edc11c7862f611114b509a7c69ce6e58e
INPUT RUNDE10g-FUND.md                38cbd0c36048aa9dfc0ad72fe026fae74c362e23
```

**G-F1: kræver Mathias’ ord → HALT.** Begge historiske kanoniske digests matcher fortsat undtagelseslisten; det beviser ikke mandatet. Dette PASS er input til gaten og ophæver ikke denne blokering.