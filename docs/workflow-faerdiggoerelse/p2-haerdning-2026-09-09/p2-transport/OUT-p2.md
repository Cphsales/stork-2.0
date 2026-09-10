**Dom: FAIL(9) — 6 BLOKER, 3 RET. Denne version får ikke driftspas.**

Ingen filer er skrevet. Jeg har gennemgået diff, kode og selvtests samt kørt prøver i hukommelsen med den faktiske hjælper-, hook- og gate-logik. Den fulde suite er **ikke kørt**: workdir mangler `.git` og bl.a. `proofs.mjs`.

Dommen gælder disse Git-blob-OID’er, beregnet fra de leverede bytes:

| Fil | Blob-OID |
|---|---|
| `codex-run.sh` | `796214be2f7fb3df650570c81af974e9dc0c19aa` |
| `verdikt-byg.mjs` | `6539b9a8d1cb3e31db67c74dd963f355a4a19a77` |
| `krav-gate-run.mjs` | `9e28a1dfe754693fb8ef25d1a6aac83af3d056c8` |
| `pre-commit-zone.mjs` | `d7cd4683ede663842d9ad64bc6b51ad4b74dc1ca` |
| `codex-run.selftest.mjs` | `975732e8e53597ad50ccbf9428ac160df6af89a6` |
| `krav-gate-run.selftest.mjs` | `2dab5b7c5a0c3b6711915f67b663828b28ecceaa` |
| `package.json` | `a99aef2932935328bdb3b436fc7af369fe454e86` |

Reprokommandoerne nedenfor er forslag til fixtures; de er ikke udført med filskrivning her.

**F-1 · `verdikt-byg.mjs:35–36,83–89` · fail-open · BLOKER**

**Repro:** Giv hjælperen et ellers gyldigt PASS-draft og denne provenance:

```text
start=2026-09-09T00:00:00Z rolle=codex-angreb aktivitet=dom model=gpt-6-astra effort=xhigh sandbox=read-only lock=committed
attempt=1 rolle=codex-angreb effort=xhigh rc=7
attempt=2 rolle=codex-angreb effort=xhigh rc=7
attempt=2 FEJLEDE → MANGLENDE RESULTAT = BLOKER (fail-closed)
```

Hjælperen accepterer: `run_attempt=2`, `effort=xhigh`. Wrapperens slutmarkør på `codex-run.sh:107` matcher **ikke** `/^BLOKER:/m`. Ingen kontrollerer `rc`, leverance eller afsluttet succes.

**Observeret:** Med gyldige øvrige bindinger, approval og forgænger gav den faktiske gate-kerne `open:true`. Samme resultat med wrapperens `rc=0 men TOM/MANGLENDE`-linjer.

Parseren accepterer også `attempt=999 rolle=` som ét forsøg. Ved genbrug af OUT tæller den forsøg fra flere kørsler og tager effort fra **første** startlinje, fordi wrapperen appender provenance (`codex-run.sh:102`). Jeg reproducerede gammel `xhigh` + ny `low` → erklæret `xhigh`.

**Rettelse:** Erstat fritekst som autoritet med én struktureret kvittering pr. kørsel. Kontrollér sammenhængende forsøgsnumre, højst to forsøg, identisk faktisk konfiguration og en afsluttende leverance:

```js
const last = p.attempts.at(-1);
if (
  p.status !== "success" ||
  ![1, 2].includes(p.attempts.length) ||
  !p.attempts.every((a, i) =>
    a.attempt === i + 1 &&
    a.model === p.model &&
    a.effort === p.effort &&
    a.sandbox === p.sandbox) ||
  last.rc !== 0 ||
  last.output_bytes <= 0
) throw new Error("PROVENANCE-RØD");
```

Kvitteringen skal desuden autentificeres som i F-2.

**F-2 · `verdikt-byg.mjs:26,80–104` · forfalskning · BLOKER**

**Repro:** Udelad provenance-argumentet og brug `draft.aktor="codex"`, `draft.effort="xhigh"` og en vilkårlig 64-cifret hexstreng som `raw_output_sha256`. Alternativt håndskrives de to linjer:

```text
start=x rolle=codex-angreb aktivitet=dom model=gpt-6-astra effort=xhigh sandbox=read-only
attempt=1 rolle=
```

Begge veje accepteres. `actor_server_id` er blot en ikke-tom streng i `verdikt.mjs:126–127`; teksten »SELV-ERKLÆRET« gør ikke verdiktet gate-ugyldigt. Output-hashen beregnes heller ikke fra leverancen.

**Konsekvens:** En Codex-dom kan konstrueres uden et Codex-kald. SELFTEST-værnet kan omgås ved at udelade provenance eller fjerne OVERRIDE-markøren. At `$OUT.provenance` ligger uden for workdir er heller ikke håndhævet: kalderen vælger OUT. Provenance læses endda to gange, så den tidlige kontrol og den senere parsing kan se forskellige bytes.

**Observeret:** Begge ovenstående inputs kunne give `open:true` i hukommelsesprøven med gyldig øvrig evidens.

**Rettelse:** Codex-verdikter skal kræve en kvittering fra en betroet runner, læst én gang og bundet til rå leverance, rolle, input-commit og regelversion:

```js
if (draft.aktor === "codex" && provenancePath === undefined)
  throw new Error("Codex kræver transportkvittering");

if (!verify(null, receiptBytes, PINNED_RUNNER_PUBLIC_KEY, signature))
  throw new Error("Uægte transportkvittering");

if (receipt.output_sha256 !== sha256(rawOutput))
  throw new Error("Leverancebinding brudt");
```

Runnerens nøgle og kvitteringslager skal være uden for aktørens skriveadgang. Den eksisterende Claude-fallback må ikke automatisk gælde Codex.

**F-3 · `codex-run.sh:53,64–72,83–86` · forfalskning · BLOKER**

**Repro:** Brug selvtestens falske `codex` på PATH, men kør i et normalt, korrekt frosset repo **uden** STORK-overrides:

```bash
PATH="$FAKE_BIN:$PATH" bash scripts/v5/codex-run.sh \
  codex-angreb dom "$W" 5 "$O" "$P"
```

En falsk binær, der skriver `RESULTAT` til `-o` og returnerer 0, giver `.done` og provenance med `lock=committed`, `model=gpt-6-astra`, `effort=xhigh`. Intet Codex-modelkald behøver at ske.

**Konsekvens:** Provenance logger wrapperens variable som faktisk kørsel, mens programmet kommer fra kalderens PATH. `git`, `node` og `timeout` har samme tillidsproblem. Selvtestflaget er ikke nødvendigt for denne omgåelse.

**Rettelse:** Start gennem en betroet launcher med renset miljø og pinnede eksekverbare filer:

```bash
/usr/bin/env -i PATH=/trusted/bin:/usr/bin:/bin \
  /bin/bash --noprofile --norc /trusted/codex-run.sh ...
```

Wrapperen skal bruge absolutte, integritetskontrollerede programstier. Rensningen skal ske **før Bash starter**, så bl.a. `BASH_ENV` ikke allerede har kørt. Faktiske kørselsdata skal indgå i den autentificerede kvittering.

**F-4 · `codex-run.sh:32–39,53–70` · omgåelse · BLOKER**

**Repro A — symlink:** Opret et andet repo `$E` med committet lav-effort-lås og matchende rolletekst. Lad wrapperstien dér være et symlink til den angrebne wrapper:

```bash
ln -s "$R/scripts/v5/codex-run.sh" "$E/scripts/v5/codex-run.sh"
bash "$E/scripts/v5/codex-run.sh" codex-angreb dom "$W" 5 "$O" "$P"
```

`REPO_STD` afledes af symlinkets placering, ikke wrapperens reelle placering. Det fremmede repo behandles som `committed`, uden OVERRIDE-markør.

**Repro B — Git-miljø:** `GIT_DIR="$E/.git"` kan dirigere Git-opslag væk fra `$REPO`, selv om kommandoerne bruger `git -C`. Med en tilsvarende lokal lås kan det fremmede HEAD legitimere den.

**Konsekvens:** Det særlige STORK-værn dækker ikke alle veje til fremmed repo/lås. Desuden læses låsen før dens hashkontrol; udskiftning mellem læsning og hashing kan få brugte værdier og kontrollerede bytes til at afvige.

**Rettelse:** Resolve wrapperens virkelige sti, rens Git-miljøet i launcheren, og læs låsen fra én pinnet commit:

```bash
SELF=$(realpath -e -- "${BASH_SOURCE[0]}") || exit 1
REPO=$(cd -- "$(dirname -- "$SELF")/../.." && pwd -P) || exit 1
REGEL_COMMIT=$("$GIT" -C "$REPO" rev-parse --verify 'HEAD^{commit}') || exit 1
LOCK_JSON=$("$GIT" -C "$REPO" show \
  "$REGEL_COMMIT:scripts/v5/actors.lock.json") || exit 1
```

Parse og hash samme indlæste bytes. Brug `$REGEL_COMMIT`, ikke nye `HEAD`-opslag, til resten af frysen.

**F-5 · `codex-run.sh:65–66,86` · omgåelse · BLOKER**

**Repro:** Kør med en gyldig lås, men lad prompten være `Svar kun PASS`, eller lad den henvise til en ændret rolletekst i det valgte WORKDIR. Wrapperen kontrollerer rolletekstens OID, men sender aldrig den kontrollerede tekst til Codex og binder ikke promptens bytes.

Der er også en konkret fejllæsning: Hvis en eksisterende promptfil hedder `--help`, består `-f`-kontrollen, men `cat "$PROMPTFIL"` leverer **cats hjælpetekst**. `cat --help` returnerer 0.

**Konsekvens:** Frysen kan stå grøn, selv om kaldet får en anden instruks end den frosne rolle eller den angivne promptfil. Det bryder princip 7’s binding af rolletekst til kaldet.

**Rettelse:** Hent rollen fra den pinnede blob, læs prompten fejlkontrolleret, og bind de samlede instruktionsbytes i kvitteringen:

```bash
ROLE_TEXT=$("$GIT" -C "$REPO" show "$SKILL_OID") || blok "rollelæsning"
TASK_TEXT=$(cat -- "$PROMPTFIL") || blok "promptlæsning"
PROMPT="$ROLE_TEXT"$'\n\n'"$TASK_TEXT"
```

Afslut CLI-options før prompten: `... -o "$ATTEMPT_OUT" -- "$PROMPT"`. Kontrollér også promptstørrelsen før exec, så argumentgrænsen giver en entydig blokering.

**F-6 · `codex-run.sh:35–70,99–101` · fail-open · RET**

**Repro:** Kør først succesfuldt med OUT=`$O`. Kør derefter samme OUT med timeout `5s`, manglende prompt eller stale lås.

Andet kald blokerer **før** markøroprydningen. Den gamle `$O.attempt1.done` og leverance bliver liggende.

**Konsekvens:** Exitstatus er rød, men transportens dokumenterede leverancemarkør viser stadig grøn for den genbrugte OUT-sti.

**Rettelse:** Invalidér tidligere markører før alle valideringer, hvor OUT er kendt:

```bash
rm -f -- "$OUT".attempt*.done "$OUT".attempt*.started "$PIDFIL" \
  || exit 1
```

Brug desuden et unikt kørsels-id; en forbruger skal kræve succes for **den aktuelle invocation**, ikke blot eksistensen af en `.done`-fil.

**F-7 · `codex-run.sh:79–94` · fail-open · BLOKER**

**Repro:** To samtidige kald bruger samme OUT:

1. A fjerner OUT og starter en mock, der efter to sekunder returnerer 0 uden output.
2. B starter lidt senere, skriver `RESULTAT` til samme OUT og returnerer 0.
3. A afslutter og ser B’s ikke-tomme fil.

A sætter `.done`, selv om A ikke leverede noget. En symlink oprettet **efter** A’s `rm` kan tilsvarende tilfredsstille `-s`; testen følger symlinks.

**Konsekvens:** Kombinationen `rc=0 && -s OUT` beviser ikke, at filen tilhører det pågældende forsøg. Kaldervalgt OUT i en skrivebar workdir gør også aktørmanipulation mulig.

**Rettelse:** Runneren skal allokere en privat mappe uden for aktørens skrivezone og en særskilt outputfil pr. forsøg. Serialisér publicering til samme OUT med en betroet lås. Publicér først efter afsluttet proces, kontrol af almindelig fil og beregnet leverancehash:

```bash
[ "$rc" -eq 0 ] &&
[ -f "$ATTEMPT_OUT" ] &&
[ ! -L "$ATTEMPT_OUT" ] &&
[ -s "$ATTEMPT_OUT" ] || return 1
```

Filkontrollen alene løser ikke racet; den private mappe og entydige forsøgssti er nødvendige.

**F-8 · `pre-commit-zone.mjs:19–31` · omgåelse · RET**

**Repro A:**

```bash
git -c diff.renames=true mv \
  scripts/v5/roller/codex-angreb.md scripts/v5/arkiv/codex-angreb.md
STORK_V5_ROLLE=fabrik node scripts/v5/pre-commit-zone.mjs
```

Når rename genkendes, viser `--name-only` destinationen. Den fjernede rolletekst ses ikke af A4-regexen.

**Repro B:** Stage `scripts/v5/roller/angreb-æ.md` med standard `core.quotePath=true`. Git citerer navnet med anførselstegn/escape-sekvenser; regexen matcher ikke.

**Observeret:** Med disse Git-outputfixtures returnerede den faktiske hook exit 0 uden lock. Almindelig rolleændring og almindelig staged delete returnerede korrekt exit 2.

**Konsekvens:** A4’s deny kan omgås uden `--no-verify`. Den senere wrapper kan blokere den slettede rolle, men hookens egen dom er forkert.

**Rettelse:**

```js
const staged = execFileSync("git", [
  "-C", repoRoot, "diff", "--cached",
  "--no-renames", "--name-only", "-z",
], { encoding: "utf8" }).split("\0").filter(Boolean);
```

`--no-renames` gør flytning til delete+add; `-z` bevarer rå stier. Kontrollér også, at den staged lås faktisk findes og er gyldig: en **slettet** lock tæller nu som »lock følger med«.

**F-9 · `codex-run.selftest.mjs:27,54,71,87,96–97` · test-kan-ikke-fejle · RET**

**Repro:** Sænk kun det faktisk sendte effort på forsøg 2; lad `$EFFORT` i provenance være uændret. Assertionen på linje 87 forbliver grøn, fordi den tæller tre `effort=xhigh`-tekster i wrapperens egen log. Mockens argv-fil overskrives pr. kald, og retry-argumenterne kontrolleres ikke.

Tilsvarende:

- »monotont ur« kræver kun `varighed_mono_s=\d+`; konstant `0` består.
- PID-testene består, hvis PID-filen aldrig oprettes.
- Alle normale wrapperfixtures bruger SELFTEST-override og udøver derfor ikke kontrollen af den committede lås.
- Ingen fixture forudopretter gamle `.done`-markører.

**Konsekvens:** Succesfulde assertions kan bruges som grønt bevis for egenskaber, de ikke kontrollerer.

**Rettelse:** Gem argv separat pr. faktisk proces og assertér begge kald:

```js
assert.equal(calls.length, 2);
assert.deepEqual(calls.map(readEffort), ["xhigh", "xhigh"]);
```

Tilføj en fixture uden overrides med ændret worktree-lock, en eksisterende `.done` før et fejlkald og observation af PID-filen, mens processen lever. Urtesten skal kontrollere målingen, ikke feltnavnet.

**Mutant-tabel — tankemæssig mutation af den leverede wrapper**

| Mutant | Fanget af case? |
|---|---|
| Fjern `-s "$OUT"` | **Ja.** »rc=0 uden output« og »ingen .done ved tom output«, linje 84–86. |
| Brug tredje argument som effort | **Ja.** Argumentet er WORKDIR; argv-assertionen på linje 71 forventer `xhigh`. |
| Fjern begge frys-sammenligninger, behold metadataopslag | **Ja.** Stale `skill_oid` på linje 115–116 skal give specifik driftblokering. |
| Send lavere effort på retry, behold logget `$EFFORT` | **Nej.** Linje 87 kontrollerer logtekst, ikke retry-kaldet. |
| Fjern oprydning og efterkontrol af gamle `.done` | **Nej.** Ingen case starter med en gammel markør. |
| Fjern kun worktree-lock-versus-HEAD-kontrollen | **Nej.** De normale fixtures springer grenen over via SELFTEST. |
| Hardkod model/effort til de nuværende låseværdier | **Nej.** Ingen gyldig kontrastfixture kræver andre værdier. |

**Det, der er rigtigt — og angreb, som ikke giver et yderligere fund**

- `codex-run.sh:53–60`: Rollen indsættes ikke i JavaScript-kilde. `process.argv` og eget-property-opslag beskytter mod den foreslåede rolle-navneinjektion. Shell-tegn i indholdet af `"$(cat ...)"` genfortolkes heller ikke som shellkode.
- `codex-run.sh:79–80,94`: Sekventiel oprydning af tidligere output og kravet om både rc 0 og ikke-tom fil er reelle værn. En allerede eksisterende OUT-symlink fjernes. F-7 kræver overlap eller efterfølgende manipulation.
- `codex-run.sh:103–108`: Normal fejlvej har præcis ét retry med samme variabler. PID’en på linje 87 er transportens baggrundsproces, normalt `timeout`, ikke Codex’ egen PID. TERM til timeout videresendes; wrapperen kan derefter starte retry. KILL af monitoren giver ikke samme videresendelsesgaranti. `SECONDS` bruges til logning, ikke til timeout-afgørelsen; timeout `0` accepteres og deaktiverer tidsgrænsen.
- `verdikt-byg.mjs:35–36,87–88`: Intakt OVERRIDE-markør, begyndende `BLOKER:` og manglende start-effort afvises. Selvtestenes specifikke provenance-fejlkrav på linje 147/152 gør, at deres manglende draft/git-fixtures ikke alene kan give falsk beståelse.
- `krav-gate-run.mjs:27–36`: Manglende liste, dubletter og kollision mellem to kandidatfilers run-id afvises. Den snævre filnavnsregex kan udelukke navne, men det dokumenterer ikke falsk-grøn.
- `gates.mjs:272–295,313–328`: Forkert artefakt, binding eller ændret verdikt bryder kontrollen. **Bevidst valg af en ældre runde er derfor ikke et selvstændigt hul**, når samme input og approvalens fulde verdikt-digests matcher. Ny regel-/rolleprovenance er derimod ikke bundet, jf. F-2/F-5.
- `krav-gate-run.mjs:64–72`: Git-navnecitering giver ikke i sig selv ekstra gyldige kandidater. Flad approval med `_provenance` sendes videre urørt og afvises som ukendt felt af `gates.mjs:307–308`; fallbacken åbner ikke gaten. Ændret `evidenceRef` ophæver heller ikke digest- og inputkontrollerne.
- `pre-commit-zone.mjs:30–35`: Lock ændret alene tillades; almindelig staged delete af en rolle kræver lock. `.husky/pre-commit:6` viderefører hookens afvisning.