# C1-runde 7: H PASS · I FAIL

**F-37 er rettet med bevis. I har ét materielt resthul i F-38-klassen: F-C1-39.** Påstanden om, at resten alene er runner-/plan-/CI-residualer, er derfor afkræftet.

## 1. Hash-bundne domme

| Modul | Dom | Verificeret blob-OID |
|---|---|---|
| H — `build-harness.mjs` | **PASS** | `500dfbfd819fb8762d194a01f7734ed835160e2f` |
| I — `build-harness.integration.mjs` | **FAIL — F-C1-39** | `93eeb105c8cead8ef2b42ad7aee6a56de8ca9b83` |

Øvrige moduler er byte-identiske med runde 6; **ingen ny dom**:

| Modul | Bekræftet blob-OID |
|---|---|
| V | `8c1f97189e0d2d8080d18d05dbbf14f293ce8957` |
| M | `64ea01e0bbacbc00ceb1e4da6d484b715e899b1d` |
| A | `e768060dc551e347fcc82362e1fc716251e9022e` |
| G | `7210d6d63f227a90f9774278516e78a0db69fce3` |
| E | `227ab027396821817e0b5d2e6fa53d1b84b0db95` |
| P | `c121b9fc0321d6a87e2dc22dd9d12f7c4c520bd3` |

Registret binder V til `pas_ref a7a9fcf5362f530d0cf820e12e383b9a4a5d7b4b`; H står fortsat som kandidat.

### Bevisgrundlag

- Alle **fire filpatches** matcher rekonstruerede førbilleder og aktuelle efterbilleder.
- **166 H-selvtests og 97 yderligere målrettede dataprøver bestået.**
- Alle fem krævede kodemutanter er eksekveret i hukommelsen gennem effektstien.
- Egne transportprøver bruger den faktiske parser-/transportkode med kontrollerede strømme. Verifier og `evaluateGate` er eksekveret med Git-opslag modelleret i hukommelsen.
- Integrationsloggen indeholder **65 indsendte grønne checks**. Postgres er **ikke genkørt her**: Docker-socketen afviser adgang. Snapshot’et mangler `.git`; commit-provenance er derfor ikke verificeret.

Inputblobs, forkortet: delta `0fba3a69`, R6-dom `96f69beb`, workflowplan `b5d3ccb1`, B2 `460a9b26`, låst liste `2200b76e`, P-8 `4af07ef4`, integrationslog `66c127e6`.

Ingen filer skrevet; intet web brugt.

## 2. H: F-37 rettet med bevis

Råvalideringen afviser nu de oprindelige veje **før oplysninger kan forsvinde**:

- Ugyldigt SA-detail afvises før `sess()`. Under en produktmutant bliver resultatet protokol-fejl og **ikke dræbt**.
- Numerisk `detail.message/routine` afvises ved setup, state, observe, checkpoint, vidne og footprint.
- `ok:true, code:''` afvises før setup-projektionen.
- Gyldige null-/udeladte felter består de relevante positive kontroller.

De øvrige efterspurgte felter giver heller ikke et nyt H-hul:

| Felt | Efterprøvning |
|---|---|
| `rows` og indhold | Manglende/malformede rækkesæt og ikke-endelige observerede værdier afvises i de berørte målinger. |
| PID’er og `commit` | Forkerte typer/afslutningsværdier afvises; værdierne normaliseres ikke til gyldigt sessionsbevis. |
| Overlap | Manglende boolean, forkert vidne eller mismatchede PID-bindinger giver aldrig opfyldt SA eller gyldigt SA-kill. |
| `invariantRows` | Ugyldig måling under mutanten giver protokol-fejl, ikke kill. |
| Footprint | Ugyldig under-måling bliver `null` og attesterer ingen mutation. |

**Vejning:** Et `count`-orakel måler kardinalitet; et krav om også at kontrollere uvedkommende kolonneindhold ville udvide oraklet. Yderligere PID-grænser beviser heller ikke, at sessionerne eksisterede. Den oprindelse skal runneren dokumentere. Det er skærpelser eller eksisterende ansvarsgrænser, ikke nye H-fund.

## 3. F-C1-39 — I afkorter stadig primærmeddelelsen til en gyldig grund

**Forpligtelse:** B2’s præcise grundbinding, konkret K-2/ac-6; F-36/F-38’s krav om den **hele primærmeddelelse**.

**Kode:** [build-harness.integration.mjs:95](/tmp/claude-1000/-home-mathias/18ea96e9-e010-4b41-a8fa-69cc7eadeb3e/scratchpad/p2-c1-r7/wd/scripts/v5/build-harness.integration.mjs:95), sammen med `FELT` på linje 82.

Parseren afslutter primærmeddelelsen ved ethvert `FELT`-præfiks. En feltlignende fortsættelseslinje behøver imidlertid hverken være `ERROR` eller `CONTEXT`.

### Eksekveret modprøve

Kontrolleret stderr:

```text
ERROR:  P0001: min_en_stand
HINT:  wrong_reason
CONTEXT:  PL/pgSQL function f.stand_deaktiver(int) line 1 at RAISE
LOCATION:  exec_stmt_raise, pl_exec.c:3894
```

Her afprøves primærmeddelelsen:

```text
min_en_stand\nHINT:  wrong_reason
```

Der er **én ERROR og én CONTEXT**. Parseren returnerer alligevel:

```json
{
  "code": "P0001",
  "detail": {
    "message": "min_en_stand",
    "routine": "f.stand_deaktiver"
  },
  "flertydig": false
}
```

| Effektprøve | Engine | Verifier | Modelleret gate |
|---|---|---|---|
| Hele primærmeddelelsen bevaret | Rød | Rød | Lukket |
| Samme diagnostik gennem `dockerPsql` | **Grøn** | **Grøn** | **Åben** |
| Samme diagnostik gennem `session()` | **Grøn** | **Grøn** | **Åben** |

Varianten med `DETAIL:` gav også opfyldt UT-case. Den tilsvarende SQL-modprøve er `RAISE EXCEPTION USING message = E'min_en_stand\nHINT:  wrong_reason'` i den bundne routine; **den SQL-variant er ikke kørt mod Postgres her**.

**Hvorfor hul frem for skærpelse:** H afviser den bevarede, forkerte primærmeddelelse. I ændrer den til kontraktens præcise token og muliggør både grøn baseline og mutantbevis. Det er tab af oplysninger i målelaget.

### Angrebs-spec til rettelsen

- Bevar primærmeddelelsens faktiske feltgrænse; kan teksttransporten ikke afgøre den, skal resultatet være protokol-fejl.
- Prøv feltlignende fortsættelser i `MESSAGE` gennem begge transporter og UT-/kill-stien.
- Kræv en dræbt targeted mutant, der genindfører afkortning ved et feltlignende præfiks.
- **Kun flere dublettællere lukker ikke dette:** én indlejret `HINT:` uden et egentligt HINT-felt giver ingen dublet.

F-38’s tidligere ERROR-/CONTEXT-vektorer er rettet med bevis. **Den oprindelige grundbinding er endnu ikke lukket. F-C1-39 er et rettelseskrav, ikke en residual.**

### Den efterspurgte routine-afgrænsning

Samme SQLSTATE og grund fra `f.other` blev bevaret og gav **brudt**, ikke opfyldt. Det er netop afvisningsstedets kontraktbinding. At den korrekte routine faktisk udsender det korrekte token kræver fortsat semantisk værn-/mutantdækning; det begrunder ikke et ekstra parserfund.

Accepterede røde udfald ved flertydig, legitim diagnostik rejser jeg heller ikke som fund.

## 4. Krævet mutant-tabel

**Alle fem kodemutanter DRÆBT:** originalen lukker kæden; kodemutanten gør den samme ugyldige måling grøn gennem engine, verifier og modelleret gate.

| Kodemutant | Effektvektor | Mutant-blob-OID |
|---|---|---|
| Fjern `raaKaldFejl` i `safeSql` | Setup med numerisk `detail.message` | `ea9c932934c9a633788efbfb1a426306e1b69aa0` |
| Fjern `raaKaldFejl` før `sess()` | Ugyldigt SA-detail under produktmutanten: ingen kill → fejlagtigt kill | `1af57cc8d2af0fdecddeba09b6689703af2709fd` |
| Tillad `code:''` på `ok:true` | Selvmodsigende setup accepteres | `aa66018d87b9d0d46bd17f70a6e6407fb91f0891` |
| Vælg sidste ERROR frem for flertydig | Indlejret sidste blok overtager grund/sted | `22fd42d7afaec0caa138fd04df15c5b3e44fc20b` |
| Tæl kun ERROR, ikke CONTEXT | Falsk CONTEXT efter den virkelige overtager routine | `7016ad4c56f7184385304590949e3e4060c4bb53` |

Disse kills beviser rettelsernes virkning; de lukker ikke F-C1-39.

## 5. Hvad C4 skal bære

| Residual | Konkret produktionsforpligtelse |
|---|---|
| **R-RUNNER-UDFØRELSE** | Udfør den frosne specs faktiske kald mod korrekt isoleret store/build; verificér offentlig indgang, faktisk rolle, bypass/ejerskab og aktør-settings. Indsaml observationerne fra kørslen. |
| **R-RUNNER-OVERLAP** | Dokumentér to faktiske sessions, uafhængigt overlapvidne før afslutning, faktisk commit/rollback og efterfølgende invariantmåling. |
| **R-RUNNER-EXIT** | Indsaml komplet stdout og procesafslutning; manglende output, signal, timeout eller afbrudt indsamling må ikke ligne et legitimt udfald. |
| **R-PLAN-SEMANTIK** | Plan-gaten dømmer orakler, nødvendige kontroller, værnernes negativdækning, mutantrelevans og footprintets dækning. |
| **R-CI-AUTENTICITET** | Beskyt runner/målelag; bind autoriseret før-build-spec og frisk plan-dom til rå input; genkør dommen og emitér autoritativt check-run. Kandidatflag må ikke erstatte autoritetskontrollen. |

Dette omfatter fortsat **R-SPEC-LEGITIMITET/R-PREDECESSOR-WIRING** samt adapteren fra den reelle prover-kørsel til proof-kontrakten. Den fjernede prover-bijektion og obligatorisk `claim_graph` genindføres ikke.

**Samlet: H består. I blokerer alene på F-C1-39. Dommen er input til gaten og den menneskelige afgørelse.**