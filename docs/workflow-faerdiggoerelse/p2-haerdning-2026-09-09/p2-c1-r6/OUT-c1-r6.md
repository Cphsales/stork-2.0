# C1-runde 6: FAIL — H og I blokerer

**V består sin resterende verifierkontrakt. F-35 er rettet med bevis. F-34 og F-36 har materielle resthuller: F-C1-37 og F-C1-38.** Prover-/claim_graph-skæringerne begrunder ingen nye fund.

Dette er blokerende input til gaten, ikke den endelige menneskeafgørelse.

## 1. Hash-bundne moduldomme

| Modul | Dom | Verificeret blob-OID |
|---|---|---|
| H — `build-harness.mjs` | **FAIL — F-C1-37** | `df11128bdd925051ed73938105810f18d0762e53` |
| V — `build-proof.mjs` | **PASS** | `8c1f97189e0d2d8080d18d05dbbf14f293ce8957` |
| I — `build-harness.integration.mjs` | **FAIL — F-C1-38** | `b2894f7175c9225910481b329ba8f51e64e3de71` |

**V’s PASS åbner ikke den samlede kæde.** V afviser de bevarede fejl i sine deklarerede observationsformer. H/I kan stadig fjerne eller substituere oplysninger, før V modtager beviset.

M/A/G/E/P er byte-identiske med runde 5; ingen ny dom:

| Modul | Bekræftet blob-OID |
|---|---|
| M | `64ea01e0bbacbc00ceb1e4da6d484b715e899b1d` |
| A | `e768060dc551e347fcc82362e1fc716251e9022e` |
| G | `7210d6d63f227a90f9774278516e78a0db69fce3` |
| E | `227ab027396821817e0b5d2e6fa53d1b84b0db95` |
| P | `c121b9fc0321d6a87e2dc22dd9d12f7c4c520bd3` |

### Input og bevisgrundlag

- Delta: `a49acd41d2fd61d141ebaac81485a9461c10b2d3`. Alle **syv tilgængelige filpatches** matcher rekonstruerede førbilleder og aktuelle efterbilleder.
- R5-dom: `bfd81cc5f9cb8abbeb656f9b8f980159b617db81`.
- Workflowplan: `6b7de0272747139ea421fb2cb1bc0ba18e3b5c5b`. B2, forventningslisten og P-8 matcher R5’s inputblobs.
- **H: 159 selvtests bestået. V: 88 selvtests bestået**, sidstnævnte med repository-/Git-I/O modelleret i hukommelsen.
- Egne effektprøver og alle syv krævede kodemutanter er eksekveret uden filskrivning.
- Integrationslog: `916cda50a5407e9664169e3b1def544cfe18f7a0`, **56 indsendte grønne checks**. Postgres-kørslen er ikke genkørt: Docker-socketen afviser adgang.

Snapshot’et mangler `.git`; `v5.yml` findes kun i diffen. Commit-tilhørsforhold og det komplette workflow er derfor ikke verificeret. **»Gate åben« nedenfor betyder eksekveret `evaluateGate` med modellerede Git-opslag.** Transportprøverne bruger den faktiske transportkode med kontrollerede strømme.

Ingen filer er skrevet. Web er ikke brugt.

## 2. F-C1-37 — H reparerer stadig ugyldige rå udfald til gyldige observationer

**Forpligtelse:** B2’s resultatkontrakt og formbestemte kills; F-34’s krav om validering før normalisering. Berører navnlig K-2/ac-6 og fælles målinger.

**Kode:** `build-harness.mjs:95–98`, `:276`, `:337`.

| Eksekveret angreb | Faktisk resultat |
|---|---|
| SA-session A leverer `ok:true, code:null, detail:"syntax error"` | `sess()` erstatter det ugyldige detail med `null`. SA-baseline består, SA-mutanten dræbes; **engine, verifier og gate grønne**. Også efterprøvet med `detail:[]` og `detail:42601`. |
| `ok:true, detail:{message:42601,routine:null}` ved setup, state, observe, checkpoint, vidne eller footprint | `safeSql` erstatter den ikke-null rå message med `null`, før konfliktkontrollen. **Alle seks placeringer gav grøn engine/verifier/gate.** |
| Setup leverer `ok:true, code:""` | Koden passerer `code.length`-kontrollen og forsvinder ved projektionen til `{ok:true}`. **Verifier og gate grønne.** |

SA-modprøven er særlig direkte: **V afviser samme ugyldige detail, når det bevares i SA-observationen. H’s normalisering gør forskellen mellem afvisning og accept.**

Det er et protokolhul, fordi en ugyldig måling kan attestere både baseline og kill. Det kræver ingen ny JS-runtimevektor.

**Angrebs-spec til rettelsen:**

- Afvis ugyldigt råt SA-detail før `sess()` projekterer resultatet.
- Kontrollér rå `detail.message/routine`, før værdier kan blive til `null`.
- Håndhæv `ok:true ⇒ code null/udeladt` også på kald, hvis kode efterfølgende kasseres.
- Bevar gyldige null-/udeladte felter som positive kontroller.
- Kræv, at genindført normalisering til succes dræbes gennem den berørte case-/mutantsti.

**Status:** F-34 er delvist rettet, men ikke lukket. F-C1-37 er et blokerende rettelseskrav, ikke en residual.

## 3. F-C1-38 — ERROR-feltindhold kan udgive sig for den sidste fejlblok

**Forpligtelse:** B2’s præcise grund-/stedbinding; navnlig K-2/ac-6.  
**Kode:** `build-harness.integration.mjs:76–88`, anvendt af både `session()` og `dockerPsql()`.

Parseren skelner ikke mellem en virkelig feltgrænse og en indlejret linje i fejlens egen MESSAGE/DETAIL.

Eksekveret stderr-modprøve:

```text
ERROR:  P0001: unrelated_failure
DETAIL:  user text
ERROR:  P0001: min_en_stand
CONTEXT:  PL/pgSQL function f.stand_deaktiver(int) line 1 at RAISE
CONTEXT:  PL/pgSQL function f.other(int) line 2 at RAISE
LOCATION:  exec_stmt_raise, pl_exec.c:3894
```

Med status `true P0001` afleverer **begge transporter**:

```json
{"code":"P0001","detail":{"message":"min_en_stand","routine":"f.stand_deaktiver"}}
```

Indsat som UT-/SA-afvisningen gav det **engine allOk, verifier grøn og gate åben**. Samme effekt er efterprøvet med indlejrede linjer i primærmeddelelsen og med falsk CONTEXT i meddelelsen.

**Vejning:** Jeg bruger ikke en hypotetisk efterfølgende NOTICE som fund. Angrebet ligger i tekstfelterne i selve fejlen og kræver ikke, at produktkode fortsætter efter en ubehandlet ERROR. Den konkrete Postgres-rendering skal suppleres i integrationskørslen; her er parser-, transport- og effektstien eksekveret med kontrolleret stderr.

**Angrebs-spec til rettelsen:**

- Bind SQLSTATE, hele primærmeddelelsen og afvisningsstedet til strukturerede felter fra samme faktiske fejl.
- Plant `ERROR:`/`CONTEXT:` i MESSAGE og DETAIL via `RAISE EXCEPTION USING`.
- Kræv, at den oprindelige fejlgrund og det virkelige afvisningssted bevares; prøv både session- og enkeltkaldstransport.
- Bevar kontrollerne for tidligere NOTICE-forfalskning, flerlinjet besked og forskellig status-SQLSTATE.

**Status:** F-36’s tidligere modprøver er rettet med bevis, men klassen er ikke lukket. F-C1-38 blokerer.

## 4. F-35 og skæringerne

**F-35: rettet med bevis ved H’s aktuelle OID.** Manglende/null stdout, malformede reserverede linjer og flertydig klassifikation afvises. Komplet `stdout:""` med exit 0 forbliver legitimt bortfald. Mutanten, der tillader stdout-fravær, er dræbt.

**Skæring (2), prover-bijektion: mindre redundans; intet nyt påvist hul.** Efter fjernelsen kræver V stadig hvert case- og mutantresultat. Med et uafhængigt grønt proverresumé blev manglende case, mutant, kontrol og footprint fortsat afvist.

**Skæring (3), valgfri claim_graph: accepteret inden for det delegerede valg i 2.C.** Fravær giver ikke dispensation fra mutant-/footprintbeviset. Leverede ugyldige claims og locusbindinger afvises fortsat. Locusets semantiske tilstrækkelighed og reviewerens ankre hører fortsat til plan-/C3-dommen.

De fjernede krav genindføres ikke som fund eller residualkrav.

## 5. Kandidatregistret

Registerdommer: `f033ae0ab5a2bdfe2f2ddaba35eff9852dc88740`.  
Register: `efcfb03e0f24c88b36b2c2e51032e43921d7e7cf`.

Logikken blev eksekveret med `hash-object` erstattet af tilsvarende Git-blobberegning i hukommelsen.

| Prøve | Resultat |
|---|---|
| Uden kandidatflag, også med `CI=true` | Exit 1; H/V afvist som kandidater |
| Med kandidatflag | Exit 0; 16 pas-bundne og 2 udtrykkeligt mærkede kandidater |
| Kandidat med forkert blob | Exit 1 |
| Entry uden status og uden pas_ref | Exit 1 |
| Kandidat uden påkrævet dato | Exit 1 |

**Registerkontrakten består disse prøver.** Flaget giver dog også exit 0, når miljøet samtidig kalder jobbet `v5-haerdet-register-autoritet`; scriptet skelner ikke selv mellem jobtyper.

Den viste diff sætter flaget på selftest-steppet og tilføjer autoritetsjobbet uden flag. At ændre autoritetsjobbets miljø ændrer den betroede konfiguration; det er ikke et påvist bypass via registerindhold. **Uden hele `v5.yml` giver jeg ingen ubetinget PASS til den samlede CI-adskillelse.**

## 6. Krævet mutant-tabel

Alle nedenstående er **DRÆBT**. Originalen afviser modprøven; kodemutanten accepterer den forkert.

| Kodemutant | Effektbevis | Mutant-blob-OID |
|---|---|---|
| Fjern rå-typetjek i `safeSql` | Numerisk kode under UT-mutant: protokol/ingen kill → kill og verifier grøn | `93d99a75f630ca5d2c9b4d10299947261c76848a` |
| Fjern `obsKaldGyldig`-konsistens | FS `ok:true,code:"42601"`: verifier rød → grøn | `51cca5ee9d250702b0e6830f9107e8bec0741680` |
| Tillad stdout-fravær | Manglende stdout: protokol/ingen kill → exit-kill og verifier grøn | `ebe49725bc98ceec2831e09d619f29a8840426dc` |
| Tag første ERROR-blok | To P0001-blokke: gate lukket → åben med falsk grund/sted | `9b63178a8bbfe7af2f5210ce6829bd51fef38443` |
| Fjern samme-blok-kravet for CONTEXT | CONTEXT før fejlen: gate lukket → åben | `9391fc499fe5bc0757fa8c8bb60cc86dda2c72a4` |
| Tillad kandidat uden blob-match | Forkert kandidatblob: exit 1 → 0 | `beb2257d73ec6e91c635460f8b8d7b7c861fd537` |
| Fjern kandidatflagkravet | Kandidater uden opt-in: exit 1 → 0 | `ee5c3e0a34800ca662ceb7b9c04780e711eb1f80` |

Disse kills beviser rettelsernes virkning, men lukker ikke F-C1-37/38’s særskilte restveje.

## 7. Navngivne residualer

- **R-PLAN-SEMANTIK:** orakler, nødvendige kontroller, mutantens relevans og footprintets dækning.
- **R-RUNNER-UDFØRELSE / R-CI-AUTENTICITET:** faktisk store, rolle, kald og målingernes oprindelse; dækker ikke de to fund.
- **R-RUNNER-OVERLAP:** faktisk uafhængigt vidne og timing.
- **R-RUNNER-EXIT:** stdout-kanalen og komplet procesindsamling.
- **R-CI-AUTORITETSJOB:** komplet workflow, strengt miljø og autoritativ CI-kørsel er ikke efterprøvet her.
- **R-SPEC-LEGITIMITET / R-PREDECESSOR-WIRING / R-C3-REVIEW:** frossen autoriseret spec, frisk plan-dom og bundet reviewerbevis.
- **R-INTEGRATIONS-PROVENANCE / R-P8-SLUTPRØVE:** ny Postgres-efterprøvning henholdsvis pakkens fulde slutprøve.
- **R-D14:** ingen nye angreb i den frosne runtimeklasse.

**H og I kræver rettelse og effektbevis. At fastholde deres nuværende svagere resultatkontrakt ville ændre forpligtelsen og kræve Mathias’ ord — HALT, ikke residual.**