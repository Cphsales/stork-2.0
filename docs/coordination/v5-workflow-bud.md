# Stork 2.0 — Workflow V5 (bud til review, opgraderet)

**Status:** AFLØST 2026-06-05. Dette var _forslaget_. Dets substans er nu adopteret: workflowet bor i `disciplin.md`, og bygge-kontrakten for governance-pakkerne bor i `governance-vagt-krav-og-data.md`. **Ikke en live kilde** — ved konflikt vinder disciplin.md. Beholdes som historisk diagnose indtil gov-6 folder coordination-artefakter til git-history.
**Oprindeligt bud:** 2026-06-03, efter Code+Codex-review + læsning af de V4-slettede proces-docs.

**Afgrænsning:** Buddet er docs-lag. Det vurderer hvilke dokumenter vi ender med, og om de er fyldestgørende og overskuelige for den videre proces. Kode-/tilstands-fakta (fundament, automation-wiring, hvilke CI-blockers er bygget) er Codes bord; hvor de optræder, er de attribueret til Code/Codex' kortlægning, ikke mine påstande.

---

## 0. Formål

V5 findes for at sikre at de dokumenter vi ender med er **fyldestgørende for den videre proces** — at alt det at bygge resten af Stork kræver er til stede og brugbart — og **overskueligt** nok til at man kan bruge det uden at afkode det først.

Målestokken er visionen om systemet: én sandhed pr. fakta, styr på data, sammenkobling eksplicit. Anvendt på dokumenterne betyder visionens første princip — én autoritativ kilde pr. fakta — **ét hjem pr. begreb**. Et dokument fortjener sin plads hvis den videre proces ikke kan undvære det; alt forstyrrende, overflødigt eller dobbelt-kildet skal væk.

To fejl-tilstande, ikke én: et dokument kan **mangle** noget processen kræver (ikke fyldestgørende), eller **indeholde det i uoverskuelig form** (ikke brugbart). V5 retter begge.

---

## 1. Hvad det opgraderede bud bygger på

Det første bud antog at V5 var "fire tilføjelser til V4." Læsningen af de V4-slettede docs viser at det var forkert ramme.

V4 var ikke et workflow-design. Det var en **simplificering af et rigere V2/V3-workflow** der allerede fandtes. Den disciplin er ar-båret — hver regel er knyttet til en konkret fejl (trin 10's 14 plan-runder, T9-fabrikationen, H022, R6). Det er reel disciplin, ikke ceremoni.

Men den gamle form var ikke simpel. Ét dokument (Code-rollen) rummer V2-, V3- og V5.3-lag oven i hinanden — grundigt og uoverskueligt på samme tid. Det er det V5 skal væk fra.

Derfor er V5 hverken "genrejs det gamle" eller "tilføj nyt." **V5 = giv den reelle disciplin ét brugbart hjem, fjern det forstyrrende, og ret det V4 brød.**

Ærlig korrektion af mit eget første bud: jeg "simplificerede" ved at kollapse funktionsbærende disciplin — fem severities til fire, gradueret konvergens til hård genåbning, FLAG→LØS til "Codex flager, Code fixer". Det er præcis den fejl V4 lavede, og review fangede den. **Simpelt betyder ikke færre funktioner. Simpelt betyder ét hjem, ingen dubletter, ingen versions-lag, intet forstyrrende.** Substansen bevares; kun uoverskueligheden fjernes.

Og det generaliserer — denne samtale er selv beviset. Forfatteren (Claude.ai) lavede undervejs hver fejl-måde buddet adresserer: påstand om repo-tilstand uden verifikation, dramatisering af simple ting, kollaps af disciplin, stilhed behandlet som input, "Codes bord" som flugtvej. mathias-partner-disciplinen var loadet fra første besked og forhindrede intet af det. Tre konsekvenser for designet: (1) **Fangsten kom altid udefra** — Mathias' flag eller Code/Codex' verifikation mod disk, aldrig fra mit eget selv-tjek. Selv-disciplin er det svageste lag og må aldrig være bærende værn; vægten ligger på mekanisk tjek, Codex og Mathias. (2) **Driften gik altid mod mere** — komplicér, tilføj, lag-på-lag; det rigtige var næsten altid mindre. Den additive instinkt er den systemiske sygdom — i mig, i V4, i de 36 rettelser. Derfor subtraktiv bias, og hver tilføjelse skal retfærdiggøre sig. (3) **To drift-klasser, to værn:** fakta-fabrikation (repo-tilstand) er mekanisk fangbar hvis hver påstand tvinges mærket verificeret/ikke-verificeret; dømmekrafts-drift (dramatisering, kollaps, spejling) er ikke mekanisk fangbar og falder til Codex + Mathias. Den knappe ressource er Mathias' opmærksomhed — designets mål er at bruge den kun på det kun han kan fange.

---

## 2. Diagnosen (korrigeret)

Roden er stadig: konsolidering forgrener i stedet for at erstatte. To rettelser fra review:

- Rolle-modsigelsen er **to-vejs** (vision↔disciplin), ikke tre-vejs. `bibel-v3_1.md` findes ikke i repoet — den var min fabrikation fra projekt-filer udenfor repoet.
- Kode-tilstanden er Codes bord. Code+Codex' kortlægning viste fundamentet brudt (branch protection kræver intet, repo↔DB divergeret, 11/20 CI-blockers bygget, automation notify-only). Det er deres verificerede fakta — ikke mine påstande, og ikke noget V5-docs-arbejdet løser. Det er en **forudsætning V5 hviler på**, som skal bringes i orden separat (Codes bord).

---

## 3. Grundprincip

Ét hjem pr. begreb — visionens princip 1 anvendt på dokumenterne. Et afløst dokument slettes eller mærkes reference; det beholder ikke autoritet. Intet dokument gentager et andets indhold. En skill kopierer aldrig en rolle ind — den peger. Behold den reelle disciplin; smid uoverskueligheden.

---

## 4. Roller (afgjort, ikke åbent)

Claude.ai's rolle er ikke et åbent valg — den blev afgjort 2026-05-20 ("Workflow-justering V2"): krav-dok-forfatter + slut-rapport-reviewer + strategisk sparring. Plan-reviewer-rollen (V5.3) er udgået. Mit første bud præsenterede det som lean-vs-fuld; det var forkert — det er en låst beslutning.

Vision **stopper med at definere roller** — roller er proces, ikke system, og hører ikke i visionen. `disciplin.md` er det eneste rolle-hjem. Det fjerner to-vejs-modsigelsen ved roden.

| Aktør         | Rolle                                                            | Må ikke                                                                                    |
| ------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Mathias**   | Forretningsbeslutninger, krav-dok-indhold, godkendelse ved gates | —                                                                                          |
| **Claude.ai** | Krav-dok-forfatter + slut-rapport-reviewer + sparring            | Tekniske beslutninger; fabrikation; kode-vurdering; datamodel-design                       |
| **Code**      | Eneste builder: plan, migrations, RPC'er, tests                  | Forretnings-afgørelser; afvige fra krav-dok/plan uden Mathias-gate; bygge uden recon-først |
| **Codex**     | Uafhængig read-only reviewer                                     | Skrive kode; beslutte; holde "nok OK" tilbage; gæld uden G-nummer; NEEDS-MATHIAS som flugt |

---

## 5. Docs-listen i V5 (målt mod fyldestgørenhed)

**Kerne — ét begreb, ét hjem (strategi/):**

- `vision-og-principper.md` — ejer: vision om systemet (renset for proces/roller)
- `forretningsforstaaelse.md` — ejer: forretnings-intentionen (hvad Stork skal kunne)
- `disciplin.md` — ejer: proces (aktører, roller, flow, gates, severities, vagter) — eneste rolle-hjem
- `stork-2-0-master-plan.md` — ejer: teknisk plan + låste beslutninger (Appendix A, normaliseret)

**Reference (teknisk/):** `teknisk-gaeld.md` (G-numre — tjener vision: ingen gæld uden plan) · `cutover-checklist.md` · `permission-matrix.md`.

**Aktør-opsætning:** skills (én pr. aktør) der kun aktiverer og peger på disciplin — kopierer aldrig rollen · `codex/sandbox-opsaetning.md`.

**Arbejds-flade pr. aktiv pakke (coordination/):** `LÆSEFØLGE.md` (navet) · krav-dok · plan · status · slut-rapport · `rapport-historik/`.

**Fjernet / foldet (tjener intet):** junk-fil `~$SEFØLGE.md` (væk) · stale `forretnings-reviewer`-skill (væk) · `codex/SKILL.md` fejlplaceret Claude.ai-skill (flyttet) · brudt `seneste-rapport`-pointer (rettet) · `arkiv/` ~50 filer (foldet til git-history; kun krav+plan+slut overlever, én bevarings-politik).

**Codes bord (kan ikke afgøres af mig):** om pointer-filer (`aktiv-plan`, `seneste-rapport`) og `rapport-historik/` afhænger af automation — det afgør om de kan fjernes. Plus hele `scripts/` + `.github/`-laget (det eksekverbare workflow), som kræver Codes eget overblik.

---

## 6. Er processen fyldestgørende?

Den egentlige prøve: når næste pakke bygges, er alt processen kræver til stede og brugbart? Processens trin og den disciplin hvert kræver — alt sammen ar-båret og allerede eksisterende:

- **Forretningsgang-recon** (før krav-dok): tre parallelle rapporter (Code/Codex/Claude.ai), trianguleret i matrix med Mathias-afgørelses-kolonne. Fanger blind-vinkler én AI missede.
- **Krav-dok:** Mathias' ord, kilde-disciplin (hver påstand citerer Mathias/låst afgørelse), ingen kode, ingen fabrikation.
- **Plan:** recon-først med "Verificerede afhængigheder" (file:linje) + fire-dokument-konsultation. Antagelse uden reference = KRITISK-fabrikation der stopper arbejdet.
- **Plan-review** (Code+Codex parallelt): FLAG→LØS med navngivne svar-typer (ACCEPT/PUSHBACK/PROPOSE-ALTERNATIVE; ADOPT/DEFER/DISMISS); **fem severities, hver funktionsbærende** (KRITISK / MELLEM / KOSMETISK / OPGRADERING / NEEDS-MATHIAS); graduerede runde-trapper (runde 1 alle fund, runde 2 HØJ stopper, runde 3 kun KRITISK).
- **Build:** batches (3-5 migrations), per-batch Codex-review, oprydnings-strategi som del af build.
- **Slut-rapport:** vision-tjek, fire-dokument-verifikation, Claude.ai-reviewer før merge.

Tværgående disciplin: differentieret modsigelses-håndtering (vision = STOP; master-plan + afgørelser = rapportér, ikke stop; krav-dok + plan = STOP); formåls-immutabilitet (Code må ændre vej, ikke formål); git-sync (stale state = fabrikation); destructive-drops-preflight; glid-detector pr. aktør.

**V5's opgave er ikke at opfinde dette — det eksisterer.** Opgaven er at sikre det har ét brugbart hjem (`disciplin.md`), at intet er tabt i V4's konsolidering, og at formen er overskuelig (ikke V2/V3/V5.3 oven i hinanden). Om V4's konsolidering bevarede hver disciplin eller tabte noget, kræver en sammenligning af nuværende `disciplin.md` mod de slettede docs — det er docs-arbejde (mit bord) når du vil have det gjort.

---

## 7. Hvad review fandt der skal rettes (mest Codes bord)

- **Vagterne splittes:** mekanisk (døde stier, junk, brudte mål, krav-dok-dækning) → lag 1 CI; semantisk (begreb-modsigelse, governance-konsistens) → Codex-mandat. En CI-gate kan ikke afgøre sprog-modsigelse.
- **Appendix A normaliseres** (superseded-markering — den modsiger sig selv: 4-dim vs 3-niveau permission) før den bindes ind som kilde.
- **Gated cutover:** V5 leveres som en pakke gennem sin egen disciplin, med slut-gate-invariant (0 begreber to steder, 0 døde pointere, vision uden rolle-def). Ellers bliver V5 selv fjerde forgrening.
- **Automation:** kald den notify-only indtil en faktisk Codex-runner + plan-branch-trigger findes.
- **Fundament før governance:** branch protection, repo↔DB-paritet.

De fire sidste er Codes bord; buddet anerkender dem, løser dem ikke.

---

## 8. Åbne spørgsmål — til Code og Codex

1. **Code — handoff-wiringen.** Hvordan kører Code↔Codex-handoffet faktisk i dag (notify-comment / tmux / manuel), og hvad skal til for at trin 2/4 reelt er automatiske (inkl. plan-branch-dækning, jf. H020)?
2. **Code/Codex — mekanisk vagt.** Er lag-1-scanneren (døde stier, junk, brudte mål, krav-dok-dækning) feasibel med lav falsk-positiv? Den ville have fanget den brudte pointer i dag.
3. **Code/Codex — Appendix A.** Hvilket tag-skema skal til for at "relevant udsnit" kan udtrækkes deterministisk?
4. **Codex — blind vinkel.** Er der en klasse af fejl (Codes eller min) som hverken lag 1 eller jeres review fanger?
5. **Code/Codex — `mangler-grundlag`.** Findes der overhovedet en lateral kanal, og hvor går grænsen mellem "fakta jeg ikke kan tilgå" og "vurdering jeg selv skulle lave"?

---

## 9. Forudsætning (ikke til forhandling)

Erstat, læg ikke oven på. Lægges dette oven på de gamle docs uden at degradere dem, har vi en fjerde forgrening om en måned. Buddet virker kun hvis erstatning faktisk sker.
