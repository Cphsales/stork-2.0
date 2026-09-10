**FAIL for `codex-run.sh` @ `c6a3cbd6896f6170f94836e6a9a21f9aac9e0fe1`.** De ni `.mjs`-modulers runde-9-PASS genbekræftes. **G-F1 forbliver HALT og er ikke eneste udestående:** F-3c kan omgås, og F-3b’s leverede filbindingstest lader den krævede mutant overleve.

Ingen filer skrevet; intet web. Diffens fire før-/efter-blobs er rekonstrueret og matcher de angivne OID-præfikser.

**1. F-3c: gyldig TOML kan vælge en fremmed modelserver uden at ramme værnet.**

[Regex’et på linje 149](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde10b/wd/scripts/v5/codex-run.sh:149) accepterer eksempelvis:

```toml
"model_provider" = "evil"
"model_providers" = { evil = { name = "evil", base_url = "http://evil.invalid/v1", wire_api = "responses", requires_openai_auth = false } }
```

Eksekveret:

- Wrapperens præcise `grep`-udtryk: **rc 1 — ingen blokering**.
- TOML-parsing: felterne bliver `model_provider` og `model_providers`, uden anførselstegn i nøglerne.
- Den SHA256-verificerede native CLI accepterer den tilsvarende dekodede konfiguration gennem `features list -c …`: **rc 0**, samtidig med `model="gpt-6-astra"`.
- Negativ kontrol: ugyldig type på `requires_openai_auth` afvises på netop dette provider-felt.

`-m` binder modelnavnet, men wrapperen binder ikke provider/server. `config_sha256` registrerer blot den accepterede konfigurations bytes. Den forhindrer ikke, at den valgte server leverer tekst under det pinnede modelnavn.

**Bevisgrænse:** Konfigurationsaccepten er eksekveret; jeg har ikke kontaktet en fremmed server eller produceret en fysisk slutkvittering fra den.

| Skrivemåde | Observeret |
|---|---|
| Almindelig `model_providers = { … }` | Fanges |
| Anførte nøgler med `"` eller `'` | Gyldig TOML passerer |
| Dotted keys under `model_providers.openai.…` | Gyldig TOML passerer regex’et; provider-effekten er ikke særskilt efterprøvet |
| `[model_providers . evil]` eller anført tabelnavn, kombineret med anførte øvrige nøgler | Gyldig TOML passerer |
| Unicode-whitespace før nøgle | Den prøvede NBSP-variant afvises af TOML-parseren; intet selvstændigt fund |

**Angrebs-spec:** Værnet skal bedømme de dekodede nøgler og de konfigurationskilder, CLI’en faktisk anvender. Kræv nul Codex-starter for ovenstående fremmede provider-konfigurationer. En mutant, der erstatter den semantiske kontrol med det nuværende regex, skal dræbes. De eksisterende seks config-cases dækker ikke dette hul.

**2. F-3b: bindingsassertionen består, selv når `exec` går gennem shim’en.**

[Selvtesten på linje 296](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-runde10b/wd/scripts/v5/codex-run.selftest.mjs:296) kontrollerer kvitteringens `codex_exec.path`, startantal og `CODEX_MANAGED_PACKAGE_ROOT`. Miljøvariablen sættes imidlertid af wrapperen ved begge eksekveringsveje. Den falske shim og native er kopier af samme script.

Jeg eksekverede den leverede mock og den præcise bindingsassertion med filoperationer i hukommelsen samt wrapperens argumentopbygning:

```text
Original: --version → native; exec → native
Mutant b: --version → native; exec → shim

Begge: bindingsassertion=true
Begge: identiske argv-/env-logs og "RESULTAT 1"
```

Mutanten ændrer kun kaldets `$CODEX_EXEC` til `$CODEX`; kvitteringsfeltet forbliver uændret. Den genåbner dermed runde-10’s resolverproblem uden at gøre den leverede bindingscase rød.

**Angrebs-spec:** Gør shim-fixturen til en separat fælde, som logger start og fejler. Kun native-fixturen må levere korrekt version og resultat. Kræv nul shim-starter, og dræb mutanten gennem mislykket levering. Miljø og selvdeklareret kvitteringssti kan ikke alene bevise procesidentiteten.

Den aktuelle implementering bruger faktisk native direkte. Fundet gælder **målelaget og den manglende mutantdrab**, ikke en påstand om, at originalens aktuelle dispatch stadig bruger shim’en.

**Genbesøg af rækkefølge, driftsantagelser og A5**

Runde-10’s rækkefølgebrud er rettet i den eksekverede pin-blok:

```text
Gyldig:       hash shim → hash native → native --version → accept
Forkert shim: hash shim → BLOKER; nul Codex-starter
Forkert native: hash shim → hash native → BLOKER; nul Codex-starter
```

Manglende native/låsefelt afvises før start. Forkert version, ekstra indholdslinje og rc 7 afvises efter versionsstarten.

Node starter før Codex-hashkontrollerne og er ikke hash-pinnet. Det følger den eksisterende kendt-prefix/betroet-runner-afgrænsning i wrapperens linje 10–14; rettelsen beviser **Codex-integritet**, ikke integritet af alle værktøjer. Tilsvarende giver `realpath` ingen atomisk binding gennem efterfølgende stiudskiftning eller bind-mount. Sådanne samtidige ændringer er ikke løst af deltaet og må ikke beskrives som teknisk elimineret.

Shim-koden bekræfter pakkerodsmiljøet og direkte native-start. Wrapperen nulstiller dog ikke shim’ens øvrige package-manager-flags. Jeg har ikke påvist modelspoofing derfra og rejser intet separat fund.

For øvrige miljøvektorer er `OPENAI_API_KEY`, `wire_api` og `env_key` alene ikke bevis for en fremmed server. **Proxy kombineret med en angriberstyret CA er derimod relevant:** den eksekverede `codex_env` videresender `HTTPS_PROXY`, `SSL_CERT_FILE` og `CODEX_CA_CERTIFICATE`; native-binæren indeholder understøttelse af de to sidste. En TLS-effektkørsel er ikke udført, så dette er en konkret efterprøvning i angrebs-spec’en, ikke et ekstra påstået fuldt reproduceret fund.

A5’s tre nøgler genkendes af den pinnede CLI: ugyldige typer afvises på hvert præcist felt. De tre korrekte overrides overskriver også en tidligere ugyldig tabel i den eksekverede CLI-konfigurationsindlæsning. Wrapperen sender politikken ved både dom og produktion.

**Den faktiske sandbox-effekt og alle konfigurationslags præcedens er ikke genkørt her.** De leverede cases observerer argumenter; de udfører ikke netværks-/skriveforsøg. Jeg rejser derfor ikke et nyt bevist A5-brud eller udsteder en bredere effektgodkendelse.

**Mutanttabellen**

Resultaterne nedenfor bygger på eksekverede udtræk og leverede assertioner. Den fulde selvtest er ikke kørt: den skriver midlertidige filer og kræver `.git`, som udsnittet mangler.

| Mutant | Fanges af leverede cases? | Bevis |
|---|---|---|
| a. Versionsstart før bytekontroller | **Ja** | `w`, `wb`, `wd`: tidlig start bryder `starts.length === 0`, selv om wrapperen senere blokerer |
| b. `exec` via `$CODEX` | **Nej** | Bindingsassertionen består med identiske observationer |
| c. Fjern `-u OPENAI_BASE_URL` | **Ja** | F-3c-casen med eksplicit fremmed URL observerer nu variablen |
| d. Fjern config-værnet | **Ja** | De seks leverede config-afvisninger mister blokeringen; dækker ikke fund 1 |
| e. Fjern én sandbox-politik | **Ja, alle tre** | `harPolitik` bliver falsk for hver fjernelse; dette er argumentbevis |
| f. Accepter første versionslinje og ignorér resten | **Ja** | `wh`; den meningsfulde `head -1`-mutant accepterer det ellers afviste output |
| g. Hash native efter versionsstart | **Ja** | `wb`/`wg`: start før hashafvisning bryder nulstartsassertionen |

Bash fjerner afsluttende LF i command substitution; ekstra tomme slutlinjer accepteres derfor stadig. Det blev reproduceret, men åbner ikke alene en upinnet executable og bliver ikke et særskilt FAIL efter vejnings-reglen.

**OID-bundne registerresultater**

```text
FAIL codex-run.sh        c6a3cbd6896f6170f94836e6a9a21f9aac9e0fe1

PASS gates.mjs           9c94efde403d26312f72557b3bfb5dcf1a223429
PASS git.mjs             9bc53ebfd7ea1a4e56906a567f276638297620cb
PASS gate-eval.mjs       1f9934570739d2b14b7ab27833f9084fbf15fe5b
PASS verdikt.mjs         4d80c7b05f01540d6a3a65438fb07ad172e334b7
PASS kvittering.mjs      a9f13ed38449d8961a361dead87e4076f36fee91
PASS verdikt-byg.mjs     411f47f6a482384e3e0adc58e89cbf98222c627f
PASS recon-gate-run.mjs  b776d19d9d4fe8e3169e780d30c5ef4a2181a060
PASS krav-gate-run.mjs   a8723a5321e733b4b5fc385559087ad2195daf9f
PASS plan-gate-run.mjs   8b4f60f529262e353a9f8f3a89c72819a3aee5f3

INPUT binaries.lock.json           e6bcac1527a77880c489cc0f96b8f39fd9ff7ff6
INPUT codex-run.selftest.mjs        c3c9e985bf3d3119f4e45c0a7acea31962c959ce
INPUT haerdet-register.json         f854e109005272918c078966ca52ffc9245cf555
INPUT DIFF-runde9-til-runde10b.diff  3afdfa78ae43c1104f186605250e7a1009a98a6a
INPUT RUNDE9-FUND.md                325bd3e574c941f7897cb3d2e621b5104350e08f
INPUT RUNDE10-FUND-ukvitteret.md     f1237b80a2bb456fa02a653f266b7f32af73b77c
```

De ni PASS genbekræfter præcis de tidligere dømte bytes. F-3c og F-3b’s målefund er **ikke lukket**; de kræver rettelse med bevis, inklusive den overlevende mutant.

**G-F1: kræver Mathias’ ord → HALT.** Begge historiske undtagelsesdigests matcher fortsat; ligheden beviser ikke mandatet. Dette FAIL er blokerende input til gaten, ikke den endelige menneskebeslutning.