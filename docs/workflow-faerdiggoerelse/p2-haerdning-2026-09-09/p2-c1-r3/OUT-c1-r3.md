**Samlet dom: FAIL.** C1/C2 kan ikke bogføres som opfyldt før første bid. Flere rettelser er bevist, men v2.2 accepterer fortsat ugyldige effektbeviser og kills. Workflowplanens »F-11..19 — alle lukket« holder ikke.

| Modul | Dom | Verificeret blob-OID |
|---|---|---|
| `forventnings-manifest.mjs` — M | **PASS** | `f43796cf27ec34b90b1afe821759da3a66c0b3dd` |
| `angrebs-spec.mjs` — A | **FAIL** | `d37a6a969adfdf3838db176658f24de437717872` |
| `build-harness.mjs` — H | **FAIL** | `7311ef947067b80a963d0d0f701f9c09754368a1` |
| `build-proof.mjs` — V | **FAIL** | `bc80350b46aaafb0ef9e08eac35e29d176825b4c` |
| `gates.mjs` — G | **PASS** | `7210d6d63f227a90f9774278516e78a0db69fce3` |
| `gate-eval.mjs` — E | **PASS** | `227ab027396821817e0b5d2e6fa53d1b84b0db95` |
| `prover.mjs` — P | **PASS** | `c121b9fc0321d6a87e2dc22dd9d12f7c4c520bd3` |

M-PASS bygger på den bevarede afledning af forpligtelser, aliaser, negativer og navngivne delbeviser samt grønne selvtests. G/E-PASS gælder deltaet oven på runde 9: obligatoriske bindinger, manifestlighed med forgængeren, fast layout og afvisning af traversal/sammenfaldende inputstier. P-PASS genbekræfter den uændrede blob og den nye anvendelse af `judgeTestSummary`; sumkontrollen blev også efterprøvet med en dræbt kodemutant. **Ingen af disse PASS-domme attesterer den endnu manglende C4-produktionskobling.**

Jeg har ikke skrevet filer eller brugt web. Rolleteksten matcher `f6e64979941b55b57d6000306ccf9404dd2a15d1`. Snapshot’et indeholder ingen `.git`; blobhashes er beregnet over filernes bytes. Alle 11 efterbilleder og rekonstruerede førbilleder i hoveddeltaet matcher diffens OID-præfikser; det særskilte G/E-delta matcher også. Commit-tilhørsforhold er ikke selvstændigt verificeret.

| Øvrigt input | Verificeret blob-OID |
|---|---|
| Hoveddelta | `9d9bd7641063a7ca483580ee8527f54f10b1d094` |
| G/E-delta | `e06add42dd7cf028492702dbfc77dd9662553f81` |
| C1-R2-FUND | `75676bcf1c62936009de02a1174631b3acd255e7` |
| B2-leverance | `460a9b26db03f88ba148c42daaaf525e1120db5a` |
| Låst forventningsliste | `2200b76e29b52f7084c0bfe003c0a2e8121c2346` |
| P-8-spec | `4af07ef4164882ca54643e79df3554c0bf22b0e4` |
| Workflowplan | `40fa74fe1a72008e8c7df579898f6c127267b01b` |
| Integrationslog | `4d311d0d815e0277b998ead0078beabcb2fe5ac0` |
| Integrationsrunner — I | `1ce2f062cc7e2bb51a99a813b7bbac5df9f404bb` |

Kørselsgrundlaget er de eksisterende manifest-, spec- og harness-selvtests, egne JSON-/runnerprober og kodemutanter udelukkende i hukommelsen. Verifierproberne udøvede de faktiske dommere og `evaluateGate` med modellerede Git-opslag. Én exit-probe startede en virkelig Node-proces. Postgres-integrationen og selvtests, der skriver repositories, blev ikke genkørt.

Nedenfor betyder **»gate åben«** dette eksekverede, modellerede Git-forløb; det betyder ikke autentificeret CI- eller Postgres-effekt.

Runde 2’s fund er efterprøvet således:

| Fund | Delta-dom |
|---|---|
| F-11, kanalvalg | **Rettet med bevis** i H/V: kontraktbytte og blandede payloads afvises; kanalmutanten dræbt. |
| F-12, indlejret identitet/run/form | **De konkrete ommærkningsveje rettet med bevis** i V. Forkert run/forpligtelse og bytte med `under` afvises. |
| F-13, producentvalgte orakler/spec | Orakel-/ID-bindingen rettet; **ikke samlet lukket**: F-20/21 og den udestående spec-provenance. |
| F-14, fase/aktør | SQL-UT og SA-aktør forbedret; **ikke lukket**: F-24. |
| F-15, ugyldige kills | **Ikke lukket**: F-22/23. |
| F-16, kontroller/restore | Kontrolmængde og checkpointbinding rettet; **ikke samlet lukket**: F-20/21. |
| F-17, integrationsrunner | Prelude- og rollekontrol rettet og efterprøvet; **ikke lukket**: F-27. |
| F-18, producentvalgt bidgraf | **Rettet mod den bundne spec** i A/V/G/E: udeladt forudsætningsbid afvises. Spec’ens legitimitet før build afventer C4. |
| F-19, samlet afstemning | Sumkontrol og afvisning af fremmede K-referencer rettet; **ikke lukket**: F-25/26. |

**F-C1-20 — Spec-projektionen bevarer ikke den foreskrevne handling og opsætning**

**Krav:** B2 tabel 1, FS og fælles resultatkontrakt; bl.a. K-1/ac-3, K-4/ac-5/9 og K-6/ac-7/10. **Kode:** V:46–64 og H:139–147,220,247–256.

Eksekveret med uændret spec, som indeholder `FS.action`: fjern alene `observations.action`, og genudled assertions.

```text
verifyBuildProof → ok:true
evaluateGate     → open:true
```

En observation med fejlet handling var først `brudt`; efter udeladelsen blev den accepteret. Desuden accepteres en spec-krævet `setup`, når proofen mangler setup-observationen eller udtrykkeligt bærer `setup:{ok:false}`. Det gælder også indlejrede kontroller.

**Nødvendig rettelse/angreb:** Bevar den deklarerede observationsvariant: foreskrevet handling og setup skal have komplette, gyldige udfald. Gentag sletning/fejl i topniveau, baseline, under og clean. Et komplet orakelmatch må ikke skjule, at det foreskrevne forløb mangler.

Checkpoint-rækkefølge og dubletter blev derimod efterprøvet og **afvist**. Det forsvar accepteres.

**F-C1-21 — Et fejlet footprint-kald attesterer mutation**

**Krav:** B2 pkt. 2–3; D10’s attesterede, tilsigtede mutation. **Kode:** H:295–298 og `killCaseMutant`’s `fp()`.

`safeCanon(null)` giver strengen `"null"`. `fpOk` kræver kun, at **baseline** er et rækkesæt. Derfor bliver en manglende under-observation forskellig fra baseline og tæller som mutation.

Eksekveret gennem motoren: footprint-queryen returnerede `ok:false, code:"42601"` under mutationen. Motoren producerede:

```text
footprint_under:null
killed:true · restored:true · cleanAfter:true
engine.allOk:true · verifier grøn · gate åben
```

Et JSON-objekt `{error:"query failed"}` som under-footprint accepteres også.

**Nødvendig rettelse/angreb:** Alle tre footprint-målinger skal være vellykkede, komplette observationer af den deklarerede type. Fejl/null/malformet under-observation skal forhindre kill. Bevar de særskilte prøver for uændret mutation og manglende restore.

**F-C1-22 — SA-kill kræver stadig ikke et gyldigt raceforløb**

**Krav:** K-2/ac-6, K-6/ac-2; B2 tabel 1 SA og pkt. 3. **Kode:** H:163–174,188,278,298.

Manglende felter afvises delvist, men **ugyldige observerede værdier** bliver assertions med `ok:false`. `judgeKill` kræver derefter blot invariantbruddet.

Følgende gav hver især `killed:true`, verifier grøn og gate åben med brudt invariant:

| Under mutanten | Accepteret fejl |
|---|---|
| `barrier:{observed:false}` | Intet overlapbevis |
| Samme PID for A og B | Kun én dokumenteret session |
| Succesfuld A med `commit:"rollback"` | Forkert terminalt udfald |
| Forkert afvisningsgrund kombineret med invariantbrud | Uvedkommende afvisning medregnes |

Yderligere normaliserer `runCase` runnerens manglende `barrier.observed` til `false`. Dermed kan motoren selv omgå dommerens kontrol for det manglende felt.

**Nødvendig rettelse/angreb:** SA-kill skal kræve gyldige sessions-, overlap-, aktør- og afslutningsbeviser omkring invariantbruddet. Når produktlåsen muteres væk, skal et **uafhængigt overlapvidne** bestå. Det er ikke et krav om, at den fjernede produktlås stadig skal blokere.

Integrationsloggens `m-min-laas` lukker ikke dette: runneren har ingen selvstændig attestation af overlap under den fjernede lås.

**F-C1-23 — Crash med den forventede exitkode bliver stadig kill**

**Krav:** K-7/ac-1 og K-1/ac-4; B2’s udelukkelse af uvedkommende procesfejl. **Kode:** H:114–118,229–234.

Eksekveret med en virkelig Node-proces, der kørte `throw new Error(...)`. Den afsluttede med **1**, uden klassediagnose:

```text
exit:{exit_code:1, klasse_observeret:null}
status:"brudt" · killed:true
engine.allOk:true · verifier grøn · gate åben
```

At 127 nu afvises løser derfor ikke klassen »processen fungerer ikke«.

**Nødvendig rettelse/angreb:** Skeln en fuldført kontrol med et gyldigt klassifikationsudfald fra manglende diagnose/crash. En anden klasse kræver en låst, meningsfuld udfaldskontrakt, hvis den skal tælle som målrettet brud. Test både crash med rc 1, manglende diagnose og det legitime bortfald af afvisningen med rc 0.

**F-C1-24 — Fase-/aktørbindingen er fortsat ufuldstændig**

**Krav:** B2 reject-kontrakt; især K-6/ac-2 og K-7/ac-1. **Kode:** A:99–106,114–115; V:50,55,61,64; H:234,277.

Eksekveret:

- SA-case med `fase:"wrapper"` mod manifestets `fase:"apply"`: spec gyldig, motor grøn, gate åben.
- SA-observation med den modstridende fase: gate åben.
- Exit-case med `actor.role:"postgres"` og `fase:"wrapper"` mod manifestets `ci/ci`: spec gyldig, motor grøn, gate åben.

A sammenligner fase/aktør i SQL-UT-grenen, men ikke i exit-grenen. SA mister fasen i produktion og projektion.

**Nødvendig rettelse/angreb:** Bind kontraktens relevante fase og aktør gennem spec, observation og verifier for alle berørte varianter. SA skal kunne bære den låste fasekontrakt for de konkurrerende forløb.

**F-C1-25 — Samme K erstatter stadig forbindelsen mellem claim, trace og mutant**

**Krav:** B2 pkt. 6 og workflowplanens §2.C: `test → runtime-trace → source-anchor → mutant → reviewer-claim`. **Kode:** V:203–216.

Eksekveret claim med:

```text
case_ids:["c-k1-mh"]
mutant_ids:["m-navn"]  // rammer c-k1-ut
```

Det accepteres, fordi begge tilhører K-1. Der kræves intet runtime-trace-/assertionsbevis, som forbinder det citerede source-anchor med netop claimets udførte prøve og mutant. Opdigtede trace-/assertion-ID’er ændrer heller ikke dommen.

**Nødvendig rettelse/angreb:** Afstem de **planbundne, relevante reviewer-claims** med deres konkrete case/assertion, udførte trace, source-anchor og mutantrelation. Det kræver ikke claim_graph for alle K uden proportionalitetsgrundlag. `claim_graph_refs`’ indholdsejerskab forbliver hos code-reviewer.

Dette er den resterende mekaniske del af F-19, ikke en ny generel provenance-diskussion.

**F-C1-26 — Proverens ID-kontrol er ikke en bijektion**

**Krav:** B2 pkt. 6 og v2.2’s udtrykkelige »præcis alle case_ids + mutant_ids«. **Kode:** A:81,133 og V:237–240.

To eksekverede veje:

1. Tilføj en dublet til ni korrekte `executed_ids`, mens `total` forbliver 9: gate åben.
2. Giv en case og en mutant samme ID. A accepterer spec’en. Den ærlige liste afvises; erstat den med de otte unikke forventede navne plus `PHANTOM-TEST`: **gate åben**.

**Nødvendig rettelse/angreb:** Gør eksekveringsidentiteter entydige på tværs af typer, og sammenlign præcis antal og medlemskab uden dubletter eller uvedkommende ID’er. En navnekollision skal afvises ved spec-valideringen eller repræsenteres med eksplicit type.

**F-C1-27 — Integrationsrunnerens markør kan forveksles med data**

**Krav:** F-17’s korrekte resultatindramning; B2’s transport-/afslutningsbevis. **Kode:** I:65–69.

Den ordnede strøm retter stderr-rækkefølgen. Men `out.includes(mark)` afslutter ved første forekomst af en forudsigelig tekst.

Den faktiske `session()`-funktion blev eksekveret med denne kontrollerede strøm:

```text
MARK_A_1
ERROR:  P0001: min_en_stand
CONTEXT:  PL/pgSQL function f.stand_deaktiver(int) ...
MARK_A_1
```

Den første forekomst som data gav `ok:true, code:null`; fejlen blev udeladt. Dette var en transportprobe, ikke en Postgres-genkørsel.

**Nødvendig rettelse/angreb:** Resultatrammen skal skelne kontrolmarkører fra returnerede data og diagnostik. Markørtekst i data må ikke afslutte eller flytte en fejl til en anden kommando.

Prelude-fejl og forkert observeret rolle blev særskilt efterprøvet og **korrekt afvist**; de rettelser accepteres.

Om footprintets **semantiske tilstrækkelighed**: `baseline ≠ under` beviser alene, at den valgte observation ændrede sig. Plan-gaten skal efterprøve forbindelsen **værn → mutationslocus → target-assertion → footprint** og footprintets dækning af restore-skaden. Et ur eller en uvedkommende tæller er utilstrækkeligt. Jeg kræver ikke en generel SQL-semantikvalidator eller fingerprint af hele databasen; den indholdsvurdering er allerede delegeret til plan-gaten i §2.C. F-21 er derimod en konkret målefejl og kan ikke placeres dér.

Om indlejrede resultater: Forkert run/forpligtelse og bytte af `baseline↔under` eller `under↔clean.target` blev afvist. Bytte af to opfyldte baseline-/clean-resultater for samme case accepteres. Det er ikke i sig selv et nyt fund: begge tilfredsstiller samme kontrakt. Attestation af, at de faktisk stammer fra hver sin korrekte kørselsfase, hører til runnerens provenance.

Den krævede mutant-tabel blev eksekveret. For hver række var angrebsinputtet **rødt med originalkoden og grønt med kodemutanten gennem gate-stien**; dermed dræber afvisningsprøven mutanten. OID’erne er beregnede blobhashes af kodevarianter i hukommelsen.

| Værn → kodemutant | Angrebsinput | Resultat | Mutant-OID |
|---|---|---|---|
| Fjern spec-projektion | Pris og `expect` ændres sammen | **DRÆBT** | `25c8637037fc4723c1f003092af6cc23ae4ed522` |
| Fjern mutations-footprintkrav | Under-footprint = baseline | **DRÆBT** | `b85ff871ca0e3a5b66e9c3ff9b6637d88866d934` |
| Fjern restore-footprintkrav | Restored-footprint ≠ baseline | **DRÆBT** | `03697853ce2f64b888e73846f261a5ace4382d54` |
| Tillad `proof.bids` som grafkilde | Slet forudsætningsbid, afhængighed og review | **DRÆBT** | `a3eedbabc1f15b74dda9e5f087d2a8edaf075c3e` |
| Fjern kontrolmængde-lighed | FS-kontrol erstattes af MH under mutanten | **DRÆBT** | `59a1736fe14e05199bded11ed587c5e0759a290c` |
| Fjern kanalens blandingsforbud | SQL-case med ekstra exit-observation | **DRÆBT** | `b39104091e16853d324ab60984e24bd47b1dba85` |
| Fjern SA-protokolkrav | Manglende PID/commit/barrierefelt og brudt invariant | **DRÆBT** | `253c94cac30a196382302e251b97a2ba819220b4` |
| Fjern prover-afstemning | Én bestået test/ét ID til ni forventede delbeviser | **DRÆBT** | `3fd046a01cc58c5bebfb99ef33d606f8fb016a72` |

`proof.bids`-mutanten genindfører producentens graf som **kilde**. Blot at tillade et ignoreret ekstra felt ville ikke være et meningsfuldt D12-angreb.

Supplerende blev A’s K-gulv og P’s sumkontrol dræbt med henholdsvis `e379f3501b3d75f85c8d5cfe43fb58ce141dc7a6` og `b2be2c3158205827818ab1b614d4673b7dfc7635`. D10 afviste også en eneste-værn-mutant flyttet fra negativets UT-case til MH.

**Proverkravet er gennemførligt, men C4-adapteren mangler.** `runProver` bevarer det parsedes `summary`, så CI kan levere én logisk test pr. spec-case og pr. spec-mutant. De indlejrede baseline-/under-/clean-kørsler kan være delmålinger under mutanttesten.

C4 skal konkret levere:

1. Et testregister afledt af det låste manifest/spec med entydige eksekverings-ID’er.
2. Friske udførelsesregistreringer fra de committede tests; `executed_ids` må ikke blot kopieres fra forventningslisten.
3. Afstemning af disse registreringer med resumé, cases, mutanter og relevante traces fra samme kørsel.
4. Adapteren fra `runProver`’s `{ok, summary}` til proof-kontrakten. Øvrige testsuites skal fortsat være obligatoriske, men deres tællinger skal have en eksplicit relation til dette delbevisresumé.
5. Produktionskoblingen fra frisk plan-dom og autoriseret, frosset angrebs-spec til build-gaten.

F-26 skal rettes først. Det er ikke nødvendigt at ændre P’s generelle resumékontrakt.

Kontraktdækningen mod B2 vurderes som **adapterdækning**, ikke som implementeret lokationspakke:

| B2-kontrakt | Status | Materiel rest |
|---|---|---|
| Tabel 1: UT | **DELVIST** | Kanal og SQL-kontrakt forbedret; F-23/24 |
| Tabel 1: FS | **DELVIST** | Orakler/checkpoints bindes; foreskrevet handling/setup kan bortfalde |
| Tabel 1: MH | **DELVIST** | Bundne vidner og målrettet grant-kill findes; setup-/traceforbindelsen ufuldstændig |
| Tabel 1: SA | **DELVIST** | F-22/24/27 |
| Fælles resultatkontrakt | **DELVIST** | Case/run/form bindes; forløb og trace ikke komplet |
| Reject-felter | **DELVIST** | SQLSTATE/token/routine virker; fase/aktør og exit-protokol ufuldstændig |
| Pkt. 1: forventninger/cases | **DELVIST** | Form-/negativ-/delbeviskomplethed mødt; kontekstbinding har huller |
| Pkt. 2: meningsfuld mutant | **DELVIST** | Låst mutationsspec findes; F-21 samt planens konkrete locus-/footprintdom |
| Pkt. 3: formbestemt kill | **DELVIST** | F-21/22/23 |
| Pkt. 4: D11 | **DELVIST** | Negativ og run bindes; F-23/24 |
| Pkt. 5: D12 | **MØDT mod den bundne spec** | Legitimiteten af netop denne spec før build skal leveres i C4 |
| Pkt. 6: produceret komplet proof | **DELVIST** | F-25/26 og C4’s udførelsesafstemning |
| Frit-pas-manifest | **MØDT som mekanisk kontrakt** | Pakkens konkrete afledning skal stadig dømmes mod den låste liste |

| K i B2 tabel 2 | Status | Afgørende rest før anvendelse |
|---|---|---|
| K-1 | **DELVIST** | Atomaritet/prishistorie med bindende handlingsforløb; leverancekontrollens exit-protokol |
| K-2 | **DELVIST** | Gyldigt SA-kill og committed minimumsbevis |
| K-3 | **DELVIST** | Bundne opsætnings-/handlingsforløb for arv, lokalitet og fravalg |
| K-4 | **DELVIST** | Audit/status/historik må ikke bevises efter udeladt handling |
| K-5 | **DELVIST** | Stop-/hvileeffekt og nødvendige kontroller gennem samme foreskrevne forløb |
| K-6 | **DELVIST** | Fasebundet dublet-race, historik og approval/undo/apply-forløb |
| K-7 | **DELVIST** | Crash må ikke dræbe klassifikationskontrol; faktisk anonymisering/replay |
| K-8 | **DELVIST** | Tom-resultattransport findes; komplet aktør-/adgangskontekst og relevant trace |
| K-9 | **DELVIST** | MH-grant-eksempel findes; hele den krævede offentlige flade og dens runtime-forbindelser skal bevises |

De påviste kodehuller skal være rettet og genprøvet før adapter-PASS og første bid. Pakkens konkrete manifest/spec, reject-kontrakter, nødvendige kontroller og kill-listens locus-/footprintbinding skal foreligge efter den låste proces. Denne levering indeholder ikke disse komplette pakkeinstanser.

De navngivne residualer er:

- **R-CI-AUTENTICITET:** ægthed, faktisk store/rolle/settings og oprindelsen af fuldt konsistente råresultater. Dækker ikke F-20–27.
- **R-SPEC-LEGITIMITET / R-PREDECESSOR-WIRING:** C4 skal bevise den autoriserede spec og dens frysning før build samt føre den friske planbinding videre. En hash ved build-commit beviser ikke dette alene; hookens boolean gør det heller ikke.
- **R-PLAN-SEMANTIK:** oraklers, kontrollernes og locus-/footprintvalgets tilstrækkelighed er plan-gatens delegerede indholdsdom, jf. §2.C.
- **R-INTEGRATIONS-PROVENANCE:** loggen oplyser 26 grønne checks, men leverer ikke råresultater og en samlet verificeret build-proof. Integrationen bruger syntetisk produkt/data, mangler K-8-mutant til K-gulvet og gennemløber ikke den fulde spec-/proof-verifikation.
- **R-C3-REVIEW:** det bestemte reviewer-sæt og binding til kode-OID forbliver C3.
- **R-P8-SLUTPRØVE:** fuld population, held-out udtræk, canaries og ubrudt kæde er ikke bevist af denne integration.
- **R-D14:** ingen nye angreb i den frosne JS-runtimeklasse.

**F-20–27 er ikke lukket.** De kræver rettelse med nyt OID og relevant kørsels-/mutantbevis. At acceptere den svagere kontrakt uændret kræver Mathias’ ord og HALT; betegnelsen »residual« lukker dem ikke. Dommen er blokerende input til gaten, ikke den endelige menneskeafgørelse.