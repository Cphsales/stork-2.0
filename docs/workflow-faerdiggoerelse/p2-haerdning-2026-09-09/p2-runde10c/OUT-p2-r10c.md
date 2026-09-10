**FAIL for `codex-run.sh` @ `31a779c949ee79cca6116257bf19cdaa0ff79165`.** F-3d tillader en Node, som ikke matcher `node.sha256`, at starte før afvisningen. De ni `.mjs`-modulers runde-9-PASS genbekræftes. **G-F1 forbliver HALT og er ikke eneste udestående.**

Begge diffs rekonstruerer de angivne før-/efter-blobs. Ingen filer skrevet; intet web. Efterprøvningen omfatter eksekverede Bash-udtræk, faktiske installerede binærer og den leverede mock med filoperationer i hukommelsen. Den fulde selvtest er ikke kørt: den skriver filer og kræver `.git`, som udsnittet mangler.

**F-3d: tekstmedlemskab giver eksekvering før den egentlige node-pin.**

[Linje 162](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde10c/wd/scripts/v5/codex-run.sh:162) accepterer kandidatens SHA som en anført streng **hvor som helst** i låsen. Kandidaten starter på linje 188; sammenligningen med `node.sha256` kommer først på linje 200.

Jeg bevarede låsens `node.sha256` for v24.15.0 og tilføjede følgende almindelige JSON-data:

```json
"andet": {
  "sha256": "08a8fa363038215afda76c21853ec2c64b405b2610ba4ff04ef09448997f982d"
}
```

Det er SHA256 for den installerede `/home/mathias/.nvm/versions/node/v22.11.0/bin/node`, som ligger under et tilladt prefix.

Den originale pin-blok gav:

| Lås / valgt Node | Faktiske Node-starter | Resultat |
|---|---:|---|
| Leveret lås / v24.15.0 | 1 | Node-pin accepteret |
| Leveret lås / v22.11.0 | 0 | BLOKER før start |
| Tilføjet `andet.sha256` / v22.11.0 | **1** | BLOKER efter parsing; `NODE_PINNED=1` |

Git-læsningen var modelleret; SHA-beregning og Node-eksekvering var virkelige. **Den leverede lås uændret afviser altså denne alternative Node. Hullet kræver låseindhold som ovenfor.**

En efterfølgende afvisning tilbagekalder ikke den allerede udførte kode. Forsvaret »den præcise parser afviser bagefter« forudsætter desuden, at den endnu ikke korrekt pinnede parser fortæller sandheden. Ingen løgnagtig parser eller grøn slutkvittering var nødvendig for at demonstrere rækkefølgebruddet.

**Målelaget overser samme effekt.** Selvtestens [`starts()`](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde10c/wd/scripts/v5/codex-run.selftest.mjs:79) tæller Codex-fixturens starter, ikke Node-starter. Jeg indsatte derfor den targeted mutant `"$NODE" -e ""` umiddelbart før tekstværnet:

```text
Lås uden node.sha256:

Original:  0 Node-starter; leveret wn-assertion = true
Mutant:    1 Node-start;   leveret wn-assertion = true
```

Fejltekst, `node_pinned=false` og nul Codex-starter er uændrede. Dette er eksekveret mod den leverede assertions betingelser; det er ikke en påstand om en fuld selvtestkørsel.

**Angrebs-spec for rettelsen:** Bootstrap skal entydigt autorisere Node-hashen før første Node-start gennem en allerede betroet mekanisme. Det kan eksempelvis være et særskilt pin-artefakt med streng tekstgrammatik. Den kandidat, der verificeres, må ikke selv afgøre sin autorisation.

Kill-listen skal omfatte:

- **F-3d / feltbinding:** Erstat den entydige bootstrapbinding med nuværende `grep`-medlemskab. Bevar korrekt `node.sha256`, anbring en anden Nodes SHA i et uvedkommende felt, og vælg denne Node. Kræv **nul Node-starter**.
- **F-3d / rækkefølge:** Start Node før bootstrapværnet. Brug lås uden gyldig node-pin. Kræv **nul Node-starter**, observeret særskilt fra Codex-loggen.
- **Positiv kontrol:** Korrekt Node, shim, native og version skal stadig levere resultat og korrekt kvittering.

F-3d er åbent og kræver rettelse med eksekveret effektbevis og dræbte mutanter.

**Efterprøvning af de øvrige rettelser**

- **F-3b, runde-10b-fund 2: rettet med eksekveret målebevis.** Originalens mock-kørsel gav to native-starter og `RESULTAT 1`. Mutant b gav native-version efterfulgt af to shim-starter, intet resultat og falsk bindingsassertion. Version via shim rammer også fælden: rc 3 før levering.
- **Privat hjem/HOME-fallback:** Den SHA-verificerede CLI’s `doctor --json`, med brugerens rigtige `HOME` og `CODEX_HOME=/proc`, rapporterede `/proc/config.toml` som manglende, model `<default>` og provider `openai`. Brugerens eksisterende config har en konfigureret model. Den kørsel bekræfter, at HOME ikke alene genaktiverer brugerens config.
- **Allowlist/F-3e:** Det eksekverede `codex_env` gav præcis de seks tilladte miljønøgler. Arvemutanten videresendte giftvariablerne. Fjernet `NODE_*`-rensning fik wrapperens eget Node-kald til at fejle på `--require /tmp/evil.js`.
- **Øvrige config-kilder:** Projekt-/forældreconfig, `.env` og plantning mellem produktionskørsler er ikke effektprøvet her. Binærstrenge dokumenterer ikke deres faktiske præcedens. Syscall-sporing blev afvist af miljøet. Jeg udsteder derfor ingen samlet effektlukning af F-3c’s påstand om alle config-kilder og rejser heller ikke et spekulativt ekstra bypass-fund.
- **`auth_tilbage`:** Refresh og manglende tilbageskrivning blev skelnet i hukommelsesmodellen. Under den angivne sandboxafgrænsning ligger kopien uden for aktørens skriveområde. En kompromitteret native CLI tilhører allerede den procesklasse, der kan skrive kildens auth-fil; dette er ikke et selvstændigt påvist privilegiehul.
- **Systemværktøjer:** Vurderet under opgavens udtrykkelige betroet-runner-afgrænsning. A5’s faktiske netværks-/skriveeffekt er ikke genkørt her.

**De otte efterspurgte mutanter**

»Ja« nedenfor angiver dækning i de leverede cases, efterprøvet med de beskrevne udtræk.

| Mutant | Fanges? | Dræbende observation |
|---|---|---|
| a. `env -i` → `env` | **Ja** | Miljønøglerne afviger fra den præcise allowlist. |
| b. `exec` via `$CODEX` | **Ja** | Shim-fælden fejler begge forsøg; ingen leverance; bindingsassertion falsk. |
| c. `CODEX_HOME=$HOME/.codex` | **Ja** | Kravet om privat `.run-…/codex-home` fejler. |
| d. Kopiér brugerconfig til privat hjem | **Ja, når kopien oprettes** | `cfgExists=false` fejler. Selvtesten opretter ikke selv brugerconfig-fixturen. |
| e. Fjern node-teksttjekket | **Ja, via metadata** | Manglende-node-casen får anden fejltekst og kvitteringsgren. **Node-starten måles ikke.** |
| f. Fjern `NODE_*`-rensningen | **Ja** | Gift-casens krav om rc 0 fejler i wrapperens eget Node-kald. |
| g. Ingen `auth_tilbage` | **Ja** | Refresh-casen får uændret auth-kilde. |
| h. `--version` før native-sha | **Ja** | Forkert-native-casens nulstartsassertion fejler. Versionsstart før afvisning er også eksekveret med den faktiske native. |

**OID-bundne registerresultater**

De ni PASS genbekræfter byte-identiske runde-9-artefakter og ophæver ingen HALT.

```text
FAIL codex-run.sh        31a779c949ee79cca6116257bf19cdaa0ff79165

PASS gates.mjs           9c94efde403d26312f72557b3bfb5dcf1a223429
PASS git.mjs             9bc53ebfd7ea1a4e56906a567f276638297620cb
PASS gate-eval.mjs       1f9934570739d2b14b7ab27833f9084fbf15fe5b
PASS verdikt.mjs         4d80c7b05f01540d6a3a65438fb07ad172e334b7
PASS kvittering.mjs      a9f13ed38449d8961a361dead87e4076f36fee91
PASS verdikt-byg.mjs     411f47f6a482384e3e0adc58e89cbf98222c627f
PASS recon-gate-run.mjs  b776d19d9d4fe8e3169e780d30c5ef4a2181a060
PASS krav-gate-run.mjs   a8723a5321e733b4b5fc385559087ad2195daf9f
PASS plan-gate-run.mjs   8b4f60f529262e353a9f8f3a89c72819a3aee5f3

INPUT binaries.lock.json            cb595a2f11d085d877e6387d1ef59dc0dc00d85b
INPUT codex-run.selftest.mjs         40fab5324146fe07e5cdc73db9881639b15e44d2
INPUT haerdet-register.json          f854e109005272918c078966ca52ffc9245cf555
INPUT DIFF-runde10b-til-runde10c.diff ccbf3b3b396984e163c9d080dece2ab716a18d87
INPUT DIFF-runde9-til-runde10c.diff   70bb25c336383c6adbfaec88c8a02ca383f3ed87
INPUT RUNDE9-FUND.md                 325bd3e574c941f7897cb3d2e621b5104350e08f
INPUT RUNDE10-FUND-ukvitteret.md      f1237b80a2bb456fa02a653f266b7f32af73b77c
INPUT RUNDE10b-FUND.md               7dceb895c48ae587471ba5c2c116f5161dca6180
```

**G-F1: kræver Mathias’ ord → HALT.** Begge historiske digests matcher fortsat undtagelseslisten; det beviser ikke mandatet. Dette FAIL er blokerende input til gaten, ikke den endelige menneskebeslutning.