# F-3h mutant-bevis — kernel-observerede starter (ptrace) for `codex-run.sh`

Produceret 2026-09-10 af fabrik-armen på Mathias' maskine (WSL2, Linux 6.6, yama ptrace_scope=1) efter Codex P2 runde 10g's angrebs-spec: »grøn original/positiv kontrol og rød targeted mutant, hvor selve tracerloggen viser den ekstra start«. Wrapper-blob under test: `codex-run.sh` = `5102d31b37e1b793d7e8e406c3fa4583448190c8` (uændret siden runde 10f). Tracer og selvtest = de versioner der committes sammen med denne mappe (se commit).

Metode: `baseline/` = `node scripts/v5/codex-run.selftest.mjs` på den uændrede wrapper (SELFTEST_TRACE_DIR gemmer ptrace-loggen for nøgle-cases). Hver `mutant-*/` = samme selvtest kørt mod wrapperen med præcis ét bevidst indført hul (`mutant.diff`; transformationerne `mut-*.py` er vedlagt), wrapperen gendannet byte-identisk bagefter (cmp). `rigtig-koersel/` = en rigtig dom-kørsel (CLI 0.154.0, gpt-6-astra) under traceren.

| Kørsel | Resultat | Røde assertions | Bevis i trace-log |
|---|---|---|---|
| baseline (uændret wrapper) | **codex-run: 138 ok** | — | `wb`: 0 starter af native-fixturen; `w2`: præcis 2 (`--version`, `exec`) |
| mutant a-native-hash-efter-version: native-sha-tjek flyttet EFTER `--version` (F-3h) | **codex-run: 2 FEJLEDE (136 ok)** | 2 — native binær ≠ låsens sha → BLOKER (F-3b) — ptrace: NUL starter af f…; native binær udskiftet efter låsen (shim uændret) → BLOKER uden noge… | `wb-native-sha-forkert.trace.log`: 1 linje(r) m. den ekstra start — fx `EXEC 1456449 /tmp/v5-codex-run-aBSjHI/node_modules/@openai/codex-linux-x64/vendor/x86_64-unknown-linux-musl/bi…` |
| mutant b-elf-efter-version: ELF-tjek flyttet EFTER `--version` (F-3g) | **codex-run: 1 FEJLEDE (137 ok)** | 1 — shim-KOPI på vendor-stien, korrekt pinnet → BLOKER: ikke ELF, ingen … | `wg2-shim-kopi-paa-vendor-sti.trace.log`: 1 linje(r) m. den ekstra start — fx `EXEC 1465519 /usr/bin/env /usr/bin/env node /tmp/v5-codex-run-B9tSYj/node_modules/@openai/codex-linux-x64/vend…` |
| mutant c-exec-via-shim: `exec` via `$CODEX` (shim) i stedet for `$CODEX_EXEC` (F-3b) | **codex-run: 3 FEJLEDE (135 ok)** | 3 — binaries.lock-pin == codex-entry + native + version → kører: fik 1, …; EKSEKVERINGEN er bundet til den hashede ELF: codex_exec == native, e… | `w2-positiv-kontrol.trace.log`: 8 linje(r) m. den ekstra start — fx `EXEC 1448019 /usr/bin/timeout /usr/bin/timeout --signal=KILL 5s /tmp/v5-codex-run-1s6tMO/bin/codex exec --skip…` |
| mutant d-node-foer-pin: `"$NODE" -e ""` FØR node.pin-autorisationen (F-3d) | **codex-run: 11 FEJLEDE (127 ok)** | 11 — node.pin peger på en anden node end den valgte → BLOKER med NUL node…; ptrace bekræfter: ingen exec af nogen node-binær i hele procestræet … | `n1-node-pin-fremmed-node.trace.log`: 1 linje(r) m. den ekstra start — fx `EXEC 1471441 /home/mathias/.nvm/versions/node/v24.15.0/bin/node /home/mathias/.nvm/versions/node/v24.15.0/bin/…` |
| mutant e-tracer-fjernet: selvtesten spawner bash direkte uden tracer (tom exec-log) | **codex-run: 18 FEJLEDE (120 ok)** | 18 — ptrace-sporet (kernel) ser det samme: præcis 2 starter af den falske…; ptrace bekræfter: ingen exec af nogen node-binær i hele procestræet … | alle trace-afhængige positive kontroller røde (tom log) |

**Rigtig kørsel** (`rigtig-koersel/trace.log`, 418 execve): den ægte native codex startes præcis 2 gange — pid 1484311 `--version` · pid 1484378 `exec` — begge efter `cmp -s -n 4` (ELF) og `sha256sum` af samme fil; node startes først efter `git show …:scripts/v5/node.pin` → `grep` → `sha256sum`. Leverance `OK`, kvittering vedlagt.

## SHA-256-manifest

- `mut-a.py` — `41c85d7ce3bcbabd6ae0cb8b4a57043f8940a1d0c006f04458bf6c25a2fa3b24`
- `mut-b.py` — `f980eb2490295404d09519a738bc28e057a1c8a844b506e7620502a9ffd8eb1d`
- `mut-d.py` — `2bf6b49b31bfc72ad8d9e30fd1363dfca40d773950ecb5dd9b9b350278644efe`
- `mutant-e-tracer-fjernet/mutant.diff` — `45b0dfff611b6ea670ceaabe8a12f1c3968a7eee189eda9c8a3ff6ce7a037a36`
- `mutant-e-tracer-fjernet/selftest.log` — `e8247f703ef32eb31d730ef8066fa742982a0c799ffc519da09f58f49bc31c45`
- `mutant-b-elf-efter-version/mutant.diff` — `9cfaf7a617940b14ce9db487b5ccabb3b22c056f22245e6205a9a13814c204ea`
- `mutant-b-elf-efter-version/n1-node-pin-fremmed-node.trace.log` — `cb22d755ca6e6a1e388f5343dd493ce86b5b498fa4cf5b430b67ee03512db16f`
- `mutant-b-elf-efter-version/selftest.log` — `40e8233f8003679b4254a72bcc60ffe69a6fdc4a15df4f02e813ad267feace30`
- `mutant-b-elf-efter-version/w-shim-pin-forkert.trace.log` — `0f8d60b117a837a982ff226bd909050c2f9b05a11eb6c27bb96a0727d22f1ab7`
- `mutant-b-elf-efter-version/w2-positiv-kontrol.trace.log` — `ffc2f31bce3170f391df82d1742c732f46fd27a8c36c319a1aed41217e2b3fb4`
- `mutant-b-elf-efter-version/wb-native-sha-forkert.trace.log` — `7e31014ad968a52f73bd1d2b5f6787bbd2b8f8c0c338bb124fef4a65c30bf958`
- `mutant-b-elf-efter-version/wg-native-byttet.trace.log` — `933c6f2420fbe53521b0a1fefbf92b5e521e795dba91bd8bd54299d35ac4ef2d`
- `mutant-b-elf-efter-version/wg2-shim-kopi-paa-vendor-sti.trace.log` — `4d2e0ae280754ed847780b9285c170cf9fb65d7659c6af3b3addfb91187901a2`
- `mutant-d-node-foer-pin/mutant.diff` — `91441eec1953fba4ad45bc5964b112599a4b7b68c937396b0b415d92232b69f9`
- `mutant-d-node-foer-pin/n1-node-pin-fremmed-node.trace.log` — `47e1daf136526f4eb95a36789a437e19ced83e431cb7405393414e6fcc18fbe6`
- `mutant-d-node-foer-pin/selftest.log` — `905c7a21ce3580a7a4629a2a6e42b0f8883f601e106dc08711ee97f7a83cfd26`
- `mutant-d-node-foer-pin/w-shim-pin-forkert.trace.log` — `d994b2ce2e2141a68ce63c91ca7ced21aaf0886915cd2e145d69c4de0447ea7a`
- `mutant-d-node-foer-pin/w2-positiv-kontrol.trace.log` — `7545db52d178544eea71efaa7792bbe5b8f6513fb9a52aae7609898d78f4bcb3`
- `mutant-d-node-foer-pin/wb-native-sha-forkert.trace.log` — `1a4b821d83e060ddad58ac5545d9374435e666c28a0a9a07f0f4a3f7dd4f488e`
- `mutant-d-node-foer-pin/wg-native-byttet.trace.log` — `bf4578171b75a18356cf44df028a9d0fba24bbdcb3abdd85a256976f2f7cc899`
- `mutant-d-node-foer-pin/wg2-shim-kopi-paa-vendor-sti.trace.log` — `ef0d79920b7ee31424ec42a34adcaea32b10f6a0622a35433091cedce3bed232`
- `rigtig-koersel/OUT.md` — `565339bc4d33d72817b583024112eb7f5cdf3e5eef0252d6ec1b9c9a94e12bb3`
- `rigtig-koersel/OUT.md.provenance` — `59a55f3bc3fd9570ab9a09ebf1231f5123a5364ef4782c48cad8464b932f9e94`
- `rigtig-koersel/OUT.md.receipt.json` — `4f5b477cf221957762557ce714386642399f1ef68984e04494b5d30ceb2deb91`
- `rigtig-koersel/trace.log` — `f8b44c6969ca33e8c0f353ba6958f5da69a66d4efdc23d25e0f285c8e97599c9`
- `baseline/n1-node-pin-fremmed-node.trace.log` — `0462675cac19e013e217a60429e80dcb826b847fee1032687d7ddc6da4d2588e`
- `baseline/selftest.log` — `14a28bbc1c584924edb42e50e5b126637678a22471b8c4454812b1d65ac4bda3`
- `baseline/w-shim-pin-forkert.trace.log` — `faa99f3d498225eb89057d1e58e860848c220005ba730c899ed47baeec198817`
- `baseline/w2-positiv-kontrol.trace.log` — `09e95a1d4b6c524fdbc66993e8cec5d362b11e42604a24a72da853ba4aab3a75`
- `baseline/wb-native-sha-forkert.trace.log` — `227be1ac8639867048e4423c67a4278291795921a413b77a14c632b75bf612c9`
- `baseline/wg-native-byttet.trace.log` — `a763dbc535c8f1b4c6bcc453a705e921a378c675ca1b753272c92350b93666dd`
- `baseline/wg2-shim-kopi-paa-vendor-sti.trace.log` — `a414fc022256e4d23ddf55b2ad3a92993e3fd5b517960fb18aff0c2b8a1737b4`
- `mutant-a-native-hash-efter-version/mutant.diff` — `2eab2352d414bdb8244f3db52f6d6a8efd36a2013b59d9ea99e49b7015aa439f`
- `mutant-a-native-hash-efter-version/n1-node-pin-fremmed-node.trace.log` — `22d6419e0e4a6c05f8541823e3ab6d1497a41909012628f4aa61f529087832d1`
- `mutant-a-native-hash-efter-version/selftest.log` — `d991251114b83fa91e856afbdd5c16316f1bb1c3ee8b5cb849cd5b0fd83deee3`
- `mutant-a-native-hash-efter-version/w-shim-pin-forkert.trace.log` — `8b42d8aa11ea9b6af922a854f11723d53f7f8386df53c44015dc690beaf2592c`
- `mutant-a-native-hash-efter-version/w2-positiv-kontrol.trace.log` — `2d19b4cd175940d805d896b0617e0a3cd576e00fceb30ac367ee41ab5d54f1df`
- `mutant-a-native-hash-efter-version/wb-native-sha-forkert.trace.log` — `856d462386692cebd4be975fdd5e79d3b13e9a48ed7844d30d083abaab4dd36d`
- `mutant-a-native-hash-efter-version/wg-native-byttet.trace.log` — `91d2952626ee4067ebd21b4bb388f11fbd71e0fd877731c971705c435fab1327`
- `mutant-a-native-hash-efter-version/wg2-shim-kopi-paa-vendor-sti.trace.log` — `2f13755ba8261a9a656650eadacb59ae0a820dddc2fade6f2f6713a4672f9bf2`
- `mutant-c-exec-via-shim/mutant.diff` — `2717a37eb502403632104b0e4a89336412a78fdc74a00eb80760c6b13d9e570f`
- `mutant-c-exec-via-shim/n1-node-pin-fremmed-node.trace.log` — `9e8aa8e1bd5b5ae92e2f4cd73a0f56842074abaef5d6717f7c676f5e7cae16fa`
- `mutant-c-exec-via-shim/selftest.log` — `d87c8d05dedc94bc90a01e84724d00ce04c634187611176491068d8221c4491e`
- `mutant-c-exec-via-shim/w-shim-pin-forkert.trace.log` — `8ee6587717de6b224f51806db6b9f64c1fe0d61d15389618d4f6bd61031dbcce`
- `mutant-c-exec-via-shim/w2-positiv-kontrol.trace.log` — `1fd71c386635860448d5340b6b607c3fd5da41f8ac16458395308936ec56836d`
- `mutant-c-exec-via-shim/wb-native-sha-forkert.trace.log` — `18906055ae12f0f5f978e0b8caadb158e42bec3a08477e0f3eadd5a9a9522691`
- `mutant-c-exec-via-shim/wg-native-byttet.trace.log` — `dcdfac3589dce0efe2c0bfa419894318df92d796b603d13e68c817d882617a71`
- `mutant-c-exec-via-shim/wg2-shim-kopi-paa-vendor-sti.trace.log` — `3b5ddc4c47bbb20b88dc6a05295cc454cd1a45290d90f03c6a5e7b5ab8cd9761`
