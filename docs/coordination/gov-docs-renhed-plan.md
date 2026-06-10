# gov-docs-renhed — Plan V4

**Branch:** claude/gov-docs-renhed-plan
**Krav-dok:** docs/coordination/gov-docs-renhed-krav-og-data.md
**Dato:** 2026-06-10
**Status-fil:** docs/coordination/gov-docs-renhed-status.md (konvergens-counter: 4 — §3.4-alert rejst, se status-fil)

## Formål

> Denne pakke leverer: et docs-repo hvor ingen doc eller script modsiger
> virkeligheden — plus de mekaniske værn der holder det rent — så fælles
> forståelse og workflow ikke kan brydes af drift.

## V1 → V2: Codex-fund runde 1 (alle ADRESSERET)

| #   | Fund                                                                            | Severity | Code-svar                                                                                                                                                                                                                         |
| --- | ------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Vision-banner i modstrid med D4 (§8.1-MODSIGELSE)                               | KRITISK  | **ACCEPT.** Vision-banneret patches (appendix A.1) — minimal D4-undtagelse, kilde er Mathias' egen D4-afgørelse i krav-dok. Vision er LÅST: ændringen håndhæves af Mathias' CODEOWNERS-approval ved merge; flagges eksplicit i PR |
| 2   | Patch-først ikke opfyldt (ingen body 1:1)                                       | KRITISK  | **ACCEPT.** Appendix A (docs) + B (scripts/checks) giver nuværende tekst 1:1 + ny tekst 1:1 pr. ændring                                                                                                                           |
| 3   | Repo-state-dump matcher ikke faktisk state                                      | MELLEM   | **ACCEPT.** Dump erstattet med pr.-tree-verificerede tal (git archive + scanner-kørsel pr. hash, se nedenfor)                                                                                                                     |
| 4   | Kæde-tjek/selftest dækker ikke fase:rapport + krydspegning                      | MELLEM   | **ACCEPT.** Check udvidet med plan→krav-dok-krydspeg + rapport-eksistens/Formål ved fase:rapport; 3 nye selftest-cases (i alt 7 nye)                                                                                              |
| 5   | §10.4 bliver stale kanonisk prompt                                              | MELLEM   | **ACCEPT.** §10.4 patches med i batch 2 (appendix A.7)                                                                                                                                                                            |
| 6   | _(Code-eget fund under runde 1-dispatch)_ `codex exec` hænger på stdin uden TTY | —        | Repair-diffen for codex-review.sh udvidet med `< /dev/null` på exec-linjen (appendix B.1) — fanget live: runde 1 hang på "Reading additional input from stdin..."                                                                 |

## V2 → V3: Codex-fund runde 2 (alle ADRESSERET)

| #    | Fund                                                                                                    | Severity | Code-svar                                                                                                                                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R2-1 | Parser matcher ikke `[KRITISK]`-bracketformat fra det nye §10.4-prompt — stopfund kan give exit 0       | KRITISK  | **ACCEPT.** Alle marker-greps gøres bracket-tolerante + ny `--parse-test`-selvtest i scriptet (appendix B.1, fund R2-1-blok)                                                                                                                              |
| R2-2 | State-dump stale pr. V2-commit (28e0010 = 22 docs, tabel siger 21)                                      | MELLEM   | **ACCEPT** (rettet nu frem for G-nummer — billigere end gælden). Dump omdefineret: baseline (main) er det autoritative måle-punkt planen patcher mod; branch-tallet drifter pr. plan-commit by construction og re-verificeres i build batch 3, ikke pr. V |
| R2-3 | Kæde-tjek: ingen status-krydspeg; fase:rapport fejler ikke når rapport mangler Formål-blok              | MELLEM   | **ACCEPT** (rettet nu). B.3: rapport uden Formål-blok = violation; plan→status-sti-krydspeg + status→pakkenavn-krydspeg; B.4: +2 cases (i alt 9)                                                                                                          |
| R2-4 | Master-plan kalder stadig forretningsforståelse "tanke-data" + vision-vinder-hierarki (§8.1-MODSIGELSE) | MELLEM   | **ACCEPT** (rettet nu). Ny A.14 patcher master-planens hierarki-afsnit. §8-rationale: master-plan er RETNINGSGIVENDE — Mathias har allerede afgjort løftet i krav-dok, så master-plan tilrettes (præcis som master-planen selv foreskriver)               |

## V3 → V4: Codex-fund runde 3 (alle ADRESSERET)

| #    | Fund                                                                                                 | Severity          | Code-svar                                                                                                                                              |
| ---- | ---------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R3-1 | A.6 efterlod §8-tabellens vision-række som "Vinder over alt" — to modsatrettede regler i samme tabel | KRITISK           | **ACCEPT.** A.6 udvidet: vision-rækken patches med D4-undtagelsen (nuværende 1:1 + ny 1:1 i A.6). Lukker §8.1-modsigelsen samlet med A.1/A.2/A.10/A.14 |
| R3-2 | parse-test mangler routing-dækning for WORKAROUND/ESCALATE/halt-marker                               | G-NUMMER-KANDIDAT | **ADOPT** (rettet nu frem for G-nummer). +3 fixtures i B.1 — alle fem exit-koder 0/1/2/3/4 beviste                                                     |

## Step 2.0 — Skitse + størrelses-tjek

**0 migrations.** 3 scripts slettes, 1 script repareres, 2 `.mjs`-filer udvides
(scanner + selftest), 11 docs patches (inkl. vision-banner, fund 1, +
master-plan-hierarki, fund R2-4). Under §3.8-grænsen → fuld plan, intet split.

## Verificerede repo-objekter (state-dump, fund 3-rettet)

§3.2 DB-state-dump er **N/A** — pakken rører ingen DB-objekter. Erstattet af
repo-state-dump. Metode: `git archive <hash> | tar -x` til temp-dir +
`node scripts/governance-check.mjs` i den — altså committed tree, ikke working
tree. Verificeret 2026-06-10:

| Tree                                                                   | Resultat                                      |
| ---------------------------------------------------------------------- | --------------------------------------------- |
| `main @ 1278e92`                                                       | alle 7 checks grønne — **18 docs, 6 scripts** |
| `claude/gov-docs-renhed-plan @ df4105d` (V1: + krav-dok, plan, status) | alle 7 checks grønne — **21 docs, 6 scripts** |

(V1 angav "19 docs" — det var en working-tree-kørsel med untracked krav-dok.
Præcis den fabrikations-flade selftesten's git-archive-fixture eksisterer for.)

**Måle-punkt-disciplin (fund R2-2):** baseline-rækken (main) er det autoritative
dump planen patcher mod. Branch-rækken drifter pr. plan-commit by construction
(hver V-commit tilføjer/ændrer docs — fx er V2-committen selv 22 docs) og
fastfryses derfor ikke pr. V; den re-verificeres som build-evidens i batch 3.

- **Scripts (`.sh`, scannet):** codex-review.sh (286 l) · claude-ai-prompt.sh
  (192 l) · data-grundlag.sh (173 l) · krav-afklar.sh (135 l) · schema-check.sh ·
  types-gen.sh
- **CI:** `governance:check` = `.github/workflows/ci.yml:67`,
  `governance:selftest` = `ci.yml:70`; package.json:27-28.
- **Allowlist:** `scripts/governance-check.mjs:42-99` — 12 entries med
  `klasse`-felt; `deadDocPaths()` (linje 129-142) bruger kun `ALLOWED`-settet
  (linje 100) og skelner IKKE på klasse eller fil-type. **Hullet:**
  `codex-review.sh:78` peger på slettet `docs/skabeloner/codex-review-prompt.md`
  og går grønt fordi entry'en findes som historisk-provenance.
- **H020:** historisk kode i `docs/teknisk/huskeliste.md:54` med tombstone-række
  linje 62. Refereres levende fra `disciplin.md:46` (§2) og `disciplin.md:174` (§6.2).
- **Allowlist-stiers referenter** (grep i scannerens scope — uden arkiv,
  v4-slettede-docs og rapport-historik):

  | Allowlist-sti                          | Refereres fra                                                                                              |
  | -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
  | skabeloner/codex-review-prompt.md      | codex-review.sh + krav-dok (prosa)                                                                         |
  | coordination/mathias-afgoerelser.md    | claude-ai-prompt.sh + data-grundlag.sh (kun scripts)                                                       |
  | overvaagning/claude-ai-overvaagning.md | claude-ai-prompt.sh (kun script)                                                                           |
  | overvaagning/codex-overvaagning.md     | gov-2-vagt-plan.md + teknisk-gaeld.md (prosa)                                                              |
  | strategi/bygge-status.md               | data-grundlag.sh + gov-2-vagt-plan.md + teknisk-gaeld.md                                                   |
  | skabeloner/plan-skabelon.md            | gov-2-vagt-plan.md + teknisk-gaeld.md (prosa)                                                              |
  | skabeloner/rapport-skabelon.md         | ingen i scannet scope (kun rapport-historik/README.md — scope-ekskluderet, derfor overlevede den døde ref) |
  | strategi/arbejds-disciplin.md          | gov-2-vagt-plan.md + teknisk-gaeld.md (prosa)                                                              |
  | coordination/plan-feedback             | claude-ai-prompt.sh + disciplin §4 (kortform uden mappe-prefix)                                            |
  | coordination/codex-reviews             | codex-review.sh                                                                                            |

## Repair-vs-slet-verdikt pr. script (krav-dok §Åbne spørgsmål, D1+D3)

| Script                | Verdikt    | Begrundelse                                                                                                                                                                                                                        |
| --------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `codex-review.sh`     | **REPAIR** | Severity-exit-routing (G055-arbejdet), timeout-håndtering og review-fil-med-header er reel værdi nu (manuel dispatch) og genbruges i gov-5-runneren. Bruddet er V5.3-skallen: prefix-fil + fire-dok-formål + stdin-hænger (fund 6) |
| `claude-ai-prompt.sh` | **SLET**   | Indlejrer fjernet fire-dok-ramme + V5.3-step-numre; peger på slettede mathias-afgoerelser.md + claude-ai-overvaagning.md. Substansen overhalet af SKILL.md-i-repo + Filesystem-MCP                                                 |
| `data-grundlag.sh`    | **SLET**   | V5.3 "Step 0"; læser slettet bygge-status.md. Substansen lever i §9.1 proaktiv recon (`qwers <pakke>`)                                                                                                                             |
| `krav-afklar.sh`      | **SLET**   | V5.3 "Step 2" + V5.3-routing. Substansen lever i V5 Step 1 + Step 2.1 Codex-parallel. Rækken i scripts/README.md fjernes med                                                                                                       |

Alle tre sletninger er `git rm` — fuld body bevares i git-history (§4).

## Mekaniske værn — design

### Værn 1: allowlist-split (krav pkt 9)

`deadDocPaths()` skelner fil-type: docs må bruge alle allowlist-klasser
(uændret); scripts må IKKE bruge `historisk-provenance`-entries, medmindre
scriptet har standalone-linje `# governance: deprecated`. Klasserne
`runtime-ephemeral` / `future-required` / `scope-excluded-local` gælder fortsat
begge fil-typer (scripts laver legitimt `mkdir -p` på runtime-stier). Kode 1:1 i
appendix B.2. Allowlist-vedligehold i samme commit: prune
`mathias-afgoerelser.md`, `claude-ai-overvaagning.md`, `rapport-skabelon.md`
(referenter væk efter sletninger + README-repoint — verificeres med
`GOV_VERBOSE=1`); resten beholdes (levende prosa-referenter).

### Værn 2: strukturelt kæde-tjek (krav pkt 10, fund 4-udvidet)

Ny check `structural-chain` (kode 1:1 i appendix B.3):

- **Markør** (standalone linje i aktiv-plan.md):
  `<!-- aktiv-pakke: <navn> fase: plan|build|rapport -->` eller
  `<!-- aktiv-pakke: ingen -->`. Manglende markør = violation (tilstand skal
  være eksplicit). `ingen` → pass.
- Ellers: `<navn>-krav-og-data.md` + `<navn>-plan.md` + `<navn>-status.md`
  skal eksistere i docs/coordination/.
- **Krydspeg (fund 4 + R2-3):** plan-filen skal indeholde stierne til BÅDE
  krav-dok og status-fil; status-filen skal nævne pakkenavnet.
- **Formåls-immutabilitet mekanisk (§3.0):** blockquoten der starter med
  `> Denne pakke leverer:` normaliseres (fortløbende `>`-linjer, prefix
  strippet, joinet, whitespace collapsed) — identisk i krav-dok og plan.
- **fase: rapport (fund 4 + R2-3):** mindst én
  `rapport-historik/*-<navn>.md` skal eksistere, HAVE en Formål-blok (mangler
  blokken er det en violation, ikke et skip) og matche den normaliserede
  Formål-streng.
- Strukturel + string-match, ingen semantik (ærlig grænse per krav-dok).

aktiv-plan.md får markøren i denne pakke (`fase: build` ved build-start;
`ingen` i merge-commit ved pakke-luk — doc-currency B).

### Værn 3: §8.1-SVAR som fast markør (krav pkt 11)

Markør-format: `§8.1-SVAR: INGEN-MODSIGELSE` eller
`§8.1-SVAR: MODSIGELSE — <begreb> ejes af <doc>`. Obligatorisk linje i
Codex-review når governance-doc er berørt; felt i slut-rapport-skabelonen
(§10.3) så den kan tjekkes i rapport/PR, ikke kun chat. Doc-patches i appendix
A.5/A.6/A.7. (Runde 1 af denne pakke brugte den allerede — og fangede fund 1.)

## End-to-end-spor (§3.3)

N/A i DB-forstand — ingen write-RPC'er. Det leverede spor er check-sporet:
planted overtrædelse → scanner rød → CI rød (ci.yml:67/70) → fix → grøn.
Beviset er selftest-casene (§3.6 opfyldt, ikke schema-only).

## End-to-end-test-design (fund 4-udvidet)

`governance-check.selftest.mjs` udvides med 9 cases (kode 1:1 i appendix B.4):

1. `script-dead-path`: script peger på historisk-provenance-sti → rød
   (ville have fanget krav-dok pkt 1)
2. `script-dead-path-deprecated`: samme + `# governance: deprecated` → grøn
   (flugtvejen er bevidst, ikke et hul)
3. `chain-missing-files`: markør sat, filer mangler → rød
4. `chain-formaal-mismatch`: krav↔plan Formål-streng afviger → rød
5. `chain-missing-krydspeg`: plan uden krav-dok-sti → rød
6. `chain-missing-status-krydspeg`: plan uden status-sti → rød (fund R2-3)
7. `chain-rapport-missing`: fase:rapport uden rapport-fil → rød
8. `chain-rapport-formaal-mismatch`: rapport-Formål afviger → rød
9. `chain-rapport-no-formaal`: rapport uden Formål-blok → rød (fund R2-3)

Baseline-case (ren git-archive-kopi → grøn) består uændret. Dertil
`codex-review.sh --parse-test` (appendix B.1, fund R2-1) som batch 1-evidens.

## Implementations-rækkefølge (3 batches)

| Batch                | Hvad                                                                                           | Afhængighed | Risiko                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| 1 — script-reconcile | git rm 3 scripts · repair codex-review.sh (appendix B.1) · scripts/README.md                   | ingen       | Lav. Governance-check grøn efter                                                          |
| 2 — doc-reconcile    | alle doc-patches (appendix A.1–A.14)                                                           | ingen       | Lav. §8.1-gate: Codex' §8.1-SVAR kræves; vision-patch kræver Mathias-CODEOWNERS ved merge |
| 3 — mekaniske værn   | allowlist-split + prune · kæde-tjek · aktiv-pakke-markør · 7 selftest-cases (appendix B.2–B.4) | batch 1+2   | Mellem. Selftest beviser begge retninger                                                  |

Rækkefølgen er bevidst: værnene lander mod et rent repo; selftest case 1
beviser at de ville have fanget batch 1-tilstanden.

## Doc-currency

**A. Fundament-validering (FØR qwerg):** Pakken ændrer BEGGE stamme-docs'
status-tekst: forretningsforstaaelse løftes til LÅST (Mathias' afgørelse i
krav-dok) og vision-banneret får D4-undtagelsen (fund 1 — implementerer Mathias'
D4, ingen ny Code-intention). Begge går gennem §8.1-gaten i dette review +
Mathias' CODEOWNERS-approval ved merge — valideret FØR qwerg via Codex'
§8.1-SVAR i godkendelses-runden. Øvrig plan: ingen forretnings-intentions-
ændring. Verificeret current pr. main @ `1278e92`.

**B. Status-opdatering (committes med merge):**

| Doc                        | Berørt? | Opdatering                                                                      |
| -------------------------- | ------- | ------------------------------------------------------------------------------- |
| aktiv-plan.md              | ja      | pakke-status + aktiv-pakke-markør (→ `ingen` ved pakke-luk)                     |
| seneste-rapport.md         | ja      | ny rapport-sti + commit ved Step 5                                              |
| master-plan §4.1           | delvist | §4.1-trinstatus uberørt (gov-spor); hierarki-afsnittet patches dog (A.14, R2-4) |
| teknisk-gaeld.md (G)       | nej     | G063 forbliver åben (gov-6); ingen G rejst/løst — medmindre build finder noget  |
| huskeliste.md (H)          | nej     | H020 forbliver historisk; refs repointes kun                                    |
| disciplin "Forudsætninger" | ja      | CI-blocker-linje + Gjort-listen à jour (§8.1-gate)                              |

## IKKE i denne plan

gov-4 branch protection (værnene gøres required DÉR) · gov-5 automation ·
gov-6 arkiv-fold (G063 + v4-slettede-docs) · P3-spor · semantisk
prosa-modsigelses-scanner (§8.1 lag 2 er Codex).

**Observation uden handling (gov-6-kandidat):** gov-1/gov-2/gov-3a-plan-filer
ligger stadig i docs/coordination/ trods §4. Noteres til gov-6.

## Åbne krav-dok-spørgsmål → afgjort

1. Script-verdikter: 1 repair, 3 slet (tabel ovenfor).
2. Kæde-tjek i CI eller on-demand: **CI** (kører via governance:check-steppet;
   required først i gov-4 per D2).

---

## Appendix A — Patch-først: docs (nuværende 1:1 → ny 1:1)

### A.1 `docs/strategi/vision-og-principper.md:5` (fund 1)

Nuværende:

> **LÅST DOKUMENT.** Dette er grundstenen i Stork 2.0. Ændringer kræver eksplicit godkendelse fra Mathias via PR. CODEOWNERS håndhæver at kun Mathias kan approve ændringer. Dokumentet er autoritativ kilde for vision og principper — ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette.

Ny (kun sidste sætning udvidet — resten bevares ordret):

> **LÅST DOKUMENT.** Dette er grundstenen i Stork 2.0. Ændringer kræver eksplicit godkendelse fra Mathias via PR. CODEOWNERS håndhæver at kun Mathias kan approve ændringer. Dokumentet er autoritativ kilde for vision og principper — ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette. Undtagelse (D4): `forretningsforstaaelse.md` er med-stamme-doc — en modsigelse mellem de to er et hul der STOPPER arbejdet og lukkes af Mathias, ikke en konflikt dette dokument vinder.

### A.2 `docs/strategi/forretningsforstaaelse.md` — LÅST-banner

Nuværende linje 1-5 (banner findes ikke):

```
# Stork 2.0 — Forretningsforståelse

<!-- governance-owns: forretnings-intention -->

Dette dokument forklarer hvordan Stork-forretningen hænger sammen. [...]
```

Ny: banner indsættes mellem owns-markøren og intro-afsnittet:

> **LÅST DOKUMENT (stamme-doc med vision-og-principper.md).** Ændringer kræver eksplicit godkendelse fra Mathias via PR; CODEOWNERS håndhæver. Opdateres når Mathias' tanker udvikler sig — men de to stamme-docs må aldrig være indbyrdes uenige: en modsigelse er et hul der STOPPER og lukkes af Mathias (D4). Mekanisk håndhævelse (required code-owner-review) lander i gov-4 — dette er doc-niveau-løftet.

### A.3 `disciplin.md:46` (§2 automation-note)

Nuværende (uddrag — kun den fede del ændres):

> [...] og plan-branchen er ikke dækket af triggeren **(H020)**. Indtil det bygges: [...]

Ny: `(H020)` → `(bygges i gov-5-automation)`. Resten af noten ordret bevaret.

### A.4 `disciplin.md:174` (§6.2)

Nuværende:

> Mål-tilstand (skal bygges, Codes bord): plan-branch-trigger (H020), Codex-runner, auto-merge ved grøn CI + godkendelse.

Ny:

> Mål-tilstand (skal bygges, Codes bord — samlet i gov-5-automation): plan-branch-trigger, Codex-runner, auto-merge ved grøn CI + godkendelse.

### A.5 `disciplin.md:189` (§7 invariant 4)

Nuværende: `| 4 | Konfiguration-i-data | Ingen hardkodede satser/lønarter (lint) |`
Ny: `| 4 | Konfiguration-i-data | Ingen hardkodede satser/lønarter (Codex + Claude.ai-tjek — lint bygges i senere spor) |`

### A.6 `disciplin.md` §8 + §8.1 + §10.3

§8-tabellens vision-række (linje 203) patches OGSÅ (fund R3-1 — uden dette
ville tabellen rumme to modsatrettede regler). Nuværende 1:1:

```
| `vision-og-principper.md`               | **LÅST**            | STOP. KRITISK. Vinder over alt. Dokumentér i blokker-fil, argumentér ikke videre                                                                             |
```

Ny:

```
| `vision-og-principper.md`               | **LÅST**            | STOP. KRITISK. Vinder over alt undtagen forretningsforstaaelse (D4: indbyrdes stamme-doc-modsigelse = hul → STOP → Mathias lukker). Dokumentér i blokker-fil, argumentér ikke videre |
```

Dernæst (uændret fra V2): ny række indsættes efter vision-rækken:

```
| `forretningsforstaaelse.md` | **LÅST** | STOP. KRITISK. Stamme-doc med vision (D4): modsigelse mellem de to er et hul Mathias lukker — ingen trumf |
```

§8.1 (efter Codex-mandat-afsnittet, linje 215): to nye afsnit:

> **Stamme-doc-konsistens (D4):** ændres én af de to stamme-docs (vision /
> forretningsforstaaelse) SKAL ændringen eksplicit konsistens-tjekkes mod den
> anden. Modsigelse = hul → STOP → Mathias lukker. Ingen af de to trumfer den anden.
>
> **Fast markør:** Codex' svar gives som linjen `§8.1-SVAR: INGEN-MODSIGELSE`
> eller `§8.1-SVAR: MODSIGELSE — <begreb> ejes af <doc>` i reviewet, og gentages
> i slut-rapporten (§10.3) når pakken har berørt governance-docs — så svaret kan
> tjekkes i PR/rapport, ikke kun huskes i chat.

§10.3-skabelonen: ny sektion-linje efter "## G-numre rejst":

```
## §8.1-svar (hvis governance-docs berørt)
```

### A.7 `disciplin.md` §10.4 (fund 5)

Nuværende (de to linjer der ændres):

```
- docs/strategi/forretningsforstaaelse.md (tanke-data, ikke kontrakt)
```

og fund-formatet slutter ved `Anbefalet handling: [...]`.

Ny: parentesen → `(LÅST stamme-doc, D4)`; efter fund-formatet tilføjes:

```
Berører ændringen en governance-doc (vision / disciplin / master-plan /
forretningsforstaaelse / owns-register): afslut med
`§8.1-SVAR: INGEN-MODSIGELSE` eller `§8.1-SVAR: MODSIGELSE — <hvad>`.
```

### A.8 `disciplin.md:440` (§13)

Nuværende:

> `git pull origin main` før enhver session-start/review-runde. Påstande baseret på cached/forældet kopi = fabrikation. Code: pull ved hver trigger. Codex (auto): frisk på commit-trigger. Codex (manuel): pull før review. Claude.ai: kan ikke pulle — beder Mathias om commit-hash/fil-indhold ved tvivl, antager ikke fra hukommelse. Uventede commits ved pull → STOP, rapportér.

Ny:

> Branch-bevidst sync før enhver session-start/review-runde: `git fetch` + verificér aktuel branch/base/remote + pull den branch arbejdet faktisk sker på (plan/build/main). `git pull origin main` er kun korrekt når arbejdet ER på main. Påstande baseret på cached/forældet kopi = fabrikation. Code: sync ved hver trigger. Codex (auto): frisk på commit-trigger. Codex (manuel): sync før review. Claude.ai: kan ikke pulle — beder Mathias om commit-hash/fil-indhold ved tvivl, antager ikke fra hukommelse. Uventede commits ved sync → STOP, rapportér.

### A.9 `disciplin.md:450+452` (Forudsætninger/Gjort)

Nuværende linje 450:

> - **Fundament + spærhager (Codes bord):** resterende CI-blocker (gov-3b-2: #10 SECDEF + #18 app-write) · branch protection (gov-4) · Codex-runner + auto-merge + plan-branch-trigger (gov-5).

Ny:

> - **Fundament + spærhager (Codes bord):** branch protection (gov-4) · Codex-runner + auto-merge + plan-branch-trigger (gov-5). (gov-3 CI-blockers fuldt færdig — G065 lukket i gov-3b-3b.)

Linje 452 ("Gjort"): efter `**gov-3b-1 (...PR #96 merged)**` appendes ordret:

> · **gov-3b-2 (#10 SECDEF-markør-disciplin, PR #101 merged)** · **gov-3b-3a (#18 del 1: 9 INVOKER→SECDEF, PR #103 merged)** · **gov-3b-3b (#18 del 2 + REVOKE + G065 LØST, PR #105 merged)**

### A.10 `LÆSEFØLGE.md` (i docs-roden) pkt 0 + pkt 2 + konflikt-linje

Pkt 0 (linje 18-22) nuværende:

```
0. `git pull origin main`
   Verificér at lokal arbejds-kopi matcher repo HEAD. Stop hvis
   `git status` viser uventede uncommitted changes. Stop hvis pull
   viser commits der ikke var forventede — rapportér til Mathias.
```

Ny:

```
0. Branch-bevidst git-sync (disciplin §13): `git fetch` + verificér
   branch/base/remote + pull den branch arbejdet sker på.
   Stop hvis `git status` viser uventede uncommitted changes. Stop hvis
   sync viser commits der ikke var forventede — rapportér til Mathias.
```

Pkt 2 (linje 26-29) nuværende:

```
2. `docs/strategi/forretningsforstaaelse.md`
   Mathias' tanker om hvad systemet skal kunne på forretnings-niveau.
   **TANKE-DATA** — kontekst-grundlag for krav-dok, ikke kontrakt.
   Kan opdateres når Mathias' tanker udvikler sig.
```

Ny:

```
2. `docs/strategi/forretningsforstaaelse.md`
   Mathias' tanker om hvad systemet skal kunne på forretnings-niveau.
   **LÅST-AUTORITATIV** — stamme-doc med vision (D4). Opdateres når
   Mathias' tanker udvikler sig, via PR + CODEOWNERS.
```

Konflikt-linjen (47) nuværende:

> Ved konflikt mellem dokumenter: vision (1) vinder over alle andre.

Ny:

> Ved konflikt mellem dokumenter: vision (1) vinder over alle andre — undtagen forretningsforstaaelse (2): modsigelse mellem de to stamme-docs er et hul → STOP → Mathias lukker (D4).

### A.11 `CLAUDE.md:4`

Nuværende: `Git pull før hver trigger.`
Ny: `Branch-bevidst git-sync før hver trigger (disciplin §13).`

### A.12 `rapport-historik/README.md:5` + `scripts/README.md`

README:5 nuværende: `Hver rapport følger \`docs/skabeloner/rapport-skabelon.md\`.`Ny:`Hver rapport følger skabelonen i \`docs/strategi/disciplin.md\` §10.3.`

scripts/README.md: `krav-afklar.sh`-rækken slettes ordret (hele tabel-rækken).
Øvrige rækker uændret.

### A.13 `docs/claude-ai/SKILL.md` — kanonisk-deklaration

Ny sektion tilføjes nederst (ingen eksisterende tekst ændres):

```
## Kanonisk kilde

Denne fil er DEN kanoniske skill. Platform-skill'en i claude.ai er en kopi
af denne fil — ved drift vinder repo-versionen. Sync: Mathias kopierer
fil-indholdet til platform-skill'en når denne fil ændres (flagges i
slut-rapport som Mathias-handling).
```

### A.14 `docs/strategi/stork-2-0-master-plan.md` — hierarki-afsnit (fund R2-4)

Nuværende (afsnittet under "### Strategiske retning-skift", 1:1):

> Mathias' tanker pr. pakke lever i `docs/coordination/<pakke>-krav-og-data.md` (pakke-kontrakt). Tanker der ændrer ramme på tværs af pakker går ind i `docs/strategi/forretningsforstaaelse.md` (tanke-data) eller `docs/strategi/vision-og-principper.md` (LÅST evig, ved princip-niveau). Master-planen reflekterer arkitektur-konsekvensen som Appendix C-rettelser. Ved konflikt vinder vision (LÅST) → forretningsforstaaelse + krav-dok → master-plan tilrettes.

Ny:

> Mathias' tanker pr. pakke lever i `docs/coordination/<pakke>-krav-og-data.md` (pakke-kontrakt). Tanker der ændrer ramme på tværs af pakker går ind i `docs/strategi/forretningsforstaaelse.md` (LÅST stamme-doc) eller `docs/strategi/vision-og-principper.md` (LÅST evig, ved princip-niveau). Master-planen reflekterer arkitektur-konsekvensen som Appendix C-rettelser. Ved konflikt vinder stamme-docs (vision + forretningsforstaaelse — indbyrdes modsigelse mellem de to er et hul → STOP → Mathias lukker, D4) → krav-dok → master-plan tilrettes.

§8-rationale: master-plan er RETNINGSGIVENDE — Mathias har afgjort løftet i
krav-dok'en, så master-planen tilrettes (præcis som dens egen tekst foreskriver).
Sammen med A.1 + A.2 + A.6 + A.10 er alle steder der beskriver
dokument-hierarkiet nu konsistente med D4.

---

## Appendix B — Patch-først: scripts/checks (nuværende 1:1 → ny 1:1)

### B.1 `scripts/codex-review.sh` — repair-diff

**Fjernes** (linje 78-82, nuværende 1:1):

```bash
PREFIX_FILE="docs/skabeloner/codex-review-prompt.md"
if [ ! -f "$PREFIX_FILE" ]; then
  echo "❌ Niveau 1-prefix-fil findes ikke: $PREFIX_FILE" >&2
  exit 64
fi
```

**Erstattes** (linje 109-131, nuværende 1:1):

```bash
case "$PHASE" in
  plan|build)
    FORMAAL_LINE='FORMÅL: udledes af "## Formål"-sektionen i '"$PLAN_FILE"'.'
    ;;
  slut-rapport)
    FORMAAL_LINE='FORMÅL (slut-rapport-fase): Verificér at slut-rapporten reflekterer faktisk leverance, plan-afvigelser ærligt, og fire-dokument-tjek korrekt. Underliggende pakke-formål kan slås op i rapport-headerens "Plan-fil"-felt hvis nødvendigt.'
    ;;
esac

PROMPT=$(cat <<EOF
Læs disse filer:
1. $PREFIX_FILE (niveau 1-prefix — anvend ordret)
2. $PLAN_FILE ($PHASE-fasen for pakke $PAKKE_NAME)

RUNDE-NUMMER: $ROUND_N
FASE: $PHASE
$FORMAAL_LINE

Følg niveau 1-prefixens scope-krav + marker-protokol + dialog-regler.

Max $MAX_WORDS ord output. Brug marker-format fra niveau 1-prefix (KRITISK/MELLEM/LAV/HUL/OPTIMERING-FORSLAG/G-NUMMER-KANDIDAT etc.). Hvis du ikke har fund: skriv "APPROVAL — Runde $ROUND_N".
EOF
)
```

— med (ny 1:1):

```bash
STATUS_FILE="docs/coordination/${PAKKE_NAME}-status.md"
KRAV_FILE="docs/coordination/${PAKKE_NAME}-krav-og-data.md"

case "$PHASE" in
  plan|build)
    FORMAAL_LINE='FORMÅL: udledes af "## Formål"-sektionen i '"$PLAN_FILE"'.'
    ;;
  slut-rapport)
    FORMAAL_LINE='FORMÅL (slut-rapport-fase): Verificér at slut-rapporten reflekterer faktisk leverance, plan-afvigelser ærligt, og leverance-tabel mod krav-dok + Stork-invariant-tjek (disciplin §10.3) korrekt.'
    ;;
esac

PROMPT=$(cat <<EOF
Du er Codex i Stork 2.0 — uafhængig kode-reviewer, read-only (disciplin §9.3).

Læs FØR review:
- docs/strategi/vision-og-principper.md
- docs/strategi/forretningsforstaaelse.md (LÅST stamme-doc, D4)
- docs/strategi/disciplin.md §9.3 (din rolle) + §5 (severities) + §8.1
- $KRAV_FILE (pakke-kontrakt — hvis den findes)
- $PLAN_FILE ($PHASE-fasen for pakke $PAKKE_NAME)
- $STATUS_FILE (kontekst + konvergens-counter — hvis den findes)

RUNDE-NUMMER: $ROUND_N
FASE: $PHASE
$FORMAAL_LINE

Review-fokus (§9.3): patch-først (§3.1) · end-to-end-spor (§3.3) ·
state-dump matcher faktisk state (§3.2) · krav-dok-konsistens uden
scope-creep · vision/forretningsforstaaelse-modsigelse ·
MANGLENDE-EKSISTERENDE-BEVARELSE.

Format pr. fund:
[SEVERITY] Kort beskrivelse
Konkret afvigelse: ...
Anbefalet handling: [V<n+1>-rettelse / G-nummer / kosmetisk note]

Berører ændringen en governance-doc: afslut med
"§8.1-SVAR: INGEN-MODSIGELSE" eller "§8.1-SVAR: MODSIGELSE — <hvad>".

Max $MAX_WORDS ord. Hvis ingen fund: skriv "APPROVAL — Runde $ROUND_N".
EOF
)
```

**Exec-linjen** (linje 146-149, nuværende 1:1):

```bash
timeout --signal=KILL "$TIMEOUT_SEC" codex exec --skip-git-repo-check \
  -c "model_reasoning_effort=\"$REASONING\"" \
  --enable fast_mode \
  "$PROMPT" > "$RAW_OUTPUT" 2>&1
```

Ny (fund 6 — stdin-hænger uden TTY, fanget live i runde 1):

```bash
timeout --signal=KILL "$TIMEOUT_SEC" codex exec --skip-git-repo-check \
  -c "model_reasoning_effort=\"$REASONING\"" \
  --enable fast_mode \
  "$PROMPT" > "$RAW_OUTPUT" 2>&1 < /dev/null
```

**Marker-parsing gøres bracket-tolerant (fund R2-1, KRITISK):** §10.4-formatet
er `[SEVERITY] Kort beskrivelse`, men parseren matcher kun nøgne prefixes — et
`[KRITISK]`-fund ville give exit 0. Hver marker-grep ændres fra nøgent mønster
til bracket-tolerant. Nuværende 1:1 → ny 1:1:

```
^(STOP-FOR-CLARIFICATION):                                      → ^\[?STOP-FOR-CLARIFICATION\]?(\b|:)
^(BRUD-PAA-KRAV|TEKNISK-BLOKERING|PLAN-AFVIGELSE|KRITISK-SIKKERHEDSHUL): → ^\[?(BRUD-PAA-KRAV|TEKNISK-BLOKERING|PLAN-AFVIGELSE|KRITISK-SIKKERHEDSHUL)\]?(\b|:)
^KRITISK\b                                                      → ^\[?KRITISK\]?\b
^(\[NEEDS-MATHIAS\]|NEEDS-MATHIAS)\b                            → ^\[?NEEDS-MATHIAS\]?\b
^(WORKAROUND-INTRODUCERET):                                     → ^\[?WORKAROUND-INTRODUCERET\]?(\b|:)
^(ESCALATE|AUTO-ESKALATION):                                    → ^\[?(ESCALATE|AUTO-ESKALATION)\]?(\b|:)
^(OPTIMERING-FORSLAG):                                          → ^\[?OPTIMERING-FORSLAG\]?(\b|:)
^(SPARRING-OENSKE):                                             → ^\[?SPARRING-OENSKE\]?(\b|:)
^(G-NUMMER-KANDIDAT):                                           → ^\[?G-NUMMER-KANDIDAT\]?(\b|:)
^APPROVAL\b                                                     → ^\[?APPROVAL\]?\b
```

NB: `^\[?KRITISK\]?\b` bevarer G055-egenskaben (ordgrænse — "KRITISKE" matcher
ikke). Eksisterende routing-prioritet og exit-koder uændret.

**Ny `--parse-test`-mode (bevis for R2-1-fixet):** marker-parsing + exit-routing
refaktoreres til funktionen `parse_markers <fil>` (samme logik, samme output);
`scripts/codex-review.sh --parse-test` kører canned fixtures gennem den og
asserter routing:

| Fixture-indhold                     | Forventet exit |
| ----------------------------------- | -------------- |
| `APPROVAL — Runde 1`                | 0              |
| `[KRITISK] fund`                    | 2              |
| `KRITISK: fund`                     | 2              |
| `KRITISKE detaljer` (negativ-case)  | 0              |
| `[NEEDS-MATHIAS] spørgsmål`         | 4              |
| `STOP-FOR-CLARIFICATION: mangler X` | 1              |
| `[PLAN-AFVIGELSE] afviger fra plan` | 2              |
| `WORKAROUND-INTRODUCERET: hack`     | 3              |
| `[ESCALATE] iter > 3`               | 4              |

(De tre sidste fixtures tilføjet i V4 efter Codex' runde 3-kandidat — fuld
routing-table-dækning: alle fem exit-koder 0/1/2/3/4 er nu beviste, frem for
G-nummer.)

Køres lokalt som build-evidens i batch 1; CI-wiring noteres til gov-5
(runner-pakken, hvor scriptet får sin automation-rolle).

**Kosmetisk i samme repair:** header linje 3 + usage linje 31: "V5.3
marker-protocol/-protokol" → "V5 (disciplin §5 severities + §6.1 halt-markers)".

**Bevares 1:1 (MANGLENDE-EKSISTERENDE-BEVARELSE-tjek):** argument-parsing
(22-60) · pre-flight minus prefix-blok (66-76, 84-87) · PAKKE_NAME/DATE/
OUTPUT_DIR/OUTPUT_FILE/PLAN_SHA (94-107) · timeout-/fejl-håndtering (137-165) ·
output-fil-header m. re-run-command (167-193) · marker-parsing-sektionen
(199-259) strukturelt bevaret — eneste ændring er de bracket-tolerante mønstre
(R2-1-tabellen ovenfor) + flytning ind i `parse_markers`-funktion ·
exit-kode-routing (261-286) uændret. Ingen gates/markers/exit-koder tabes.

### B.2 `scripts/governance-check.mjs` — allowlist-split

Nuværende `deadDocPaths()` (linje 129-142, 1:1):

```js
function deadDocPaths() {
  const scan = [...DOC_FILES, ...SCRIPT_FILES];
  for (const f of scan) {
    const refs = docRefs(stripFenced(read(f)));
    for (const r of refs) {
      if (pathExists(r)) continue;
      if (ALLOWED.has(r)) {
        notes.push(`dead-doc-paths: tilladt manglende ${r} (${f})`);
        continue;
      }
      v("dead-doc-paths", `${f}: peger på ikke-eksisterende ${r} (ikke i allowlist)`);
    }
  }
}
```

Ny (1:1):

```js
const ALLOW_BY_PATH = new Map(MISSING_PATH_ALLOWLIST.map((a) => [a.path, a]));
const SCRIPT_SET = new Set(SCRIPT_FILES);
function isDeprecated(file) {
  return read(file)
    .split("\n")
    .some((l) => l.trim().startsWith("# governance: deprecated"));
}
function deadDocPaths() {
  const scan = [...DOC_FILES, ...SCRIPT_FILES];
  for (const f of scan) {
    const refs = docRefs(stripFenced(read(f)));
    for (const r of refs) {
      if (pathExists(r)) continue;
      const entry = ALLOW_BY_PATH.get(r);
      if (entry) {
        // Split (gov-docs-renhed): prosa må bære historisk-provenance;
        // aktive scripts må ikke — medmindre scriptet selv er deprecated.
        if (SCRIPT_SET.has(f) && entry.klasse === "historisk-provenance" && !isDeprecated(f)) {
          v(
            "dead-doc-paths",
            `${f}: aktivt script peger på slettet ${r} (historisk-provenance er kun for prosa — markér scriptet '# governance: deprecated' eller fjern referencen)`,
          );
          continue;
        }
        notes.push(`dead-doc-paths: tilladt manglende ${r} (${f})`);
        continue;
      }
      v("dead-doc-paths", `${f}: peger på ikke-eksisterende ${r} (ikke i allowlist)`);
    }
  }
}
```

(`ALLOWED`-settet linje 100 beholdes — bruges fortsat af laesefoelge-/pointer-checks.)

**Scanner-præcisions-fix (Code-fund under V2-skrivning, OPGRADERING):**
`docRefs()`-regexen (linje 113) mangler danske bogstaver i charclass — en doc
der refererer LÆSEFØLGE.md med fuld sti får matchet afskåret ved første danske
bogstav og giver falsk violation. Fix i samme batch: charclass udvides med
danske bogstaver. Fanget live to gange under plan-skrivningen.

Allowlist-prune (entries fjernet 1:1 — de tre objekter for
`mathias-afgoerelser.md`, `overvaagning/claude-ai-overvaagning.md`,
`skabeloner/rapport-skabelon.md`, jf. referent-tabellen). Øvrige 9 entries
uændrede.

### B.3 Ny check `structural-chain` (tilføjes + registreres i CHECKS)

Nuværende CHECKS-array (linje 256-264, 1:1):

```js
const CHECKS = [
  ["dead-doc-paths", deadDocPaths],
  ["junk-files", junkFiles],
  ["laesefoelge-targets", laesefoelgeTargets],
  ["pointer-validity", pointerValidity],
  ["owns-uniqueness", ownsUniqueness],
  ["number-home-uniqueness", numberHomeUniqueness],
  ["H-ref-integrity", hRefIntegrity],
];
```

Ny: + `["structural-chain", structuralChain],` som sidste element. Funktionen (ny 1:1):

```js
// ---------- check: structural-chain (gov-docs-renhed pkt 10) ----------
// Strukturelt + string-match — ingen semantik. Formåls-immutabilitet (§3.0) mekanisk.
function normFormaal(text) {
  const lines = text.split("\n");
  const i = lines.findIndex((l) => l.trim().startsWith("> Denne pakke leverer:"));
  if (i === -1) return null;
  const out = [];
  for (let j = i; j < lines.length && lines[j].trim().startsWith(">"); j++) {
    out.push(lines[j].replace(/^\s*>\s?/, ""));
  }
  return out.join(" ").replace(/\s+/g, " ").trim();
}
function structuralChain() {
  const ap = read("docs/coordination/aktiv-plan.md");
  let marker = null;
  for (const line of ap.split("\n")) {
    const m = line.trim().match(/^<!--\s*aktiv-pakke:\s*(\S+)(?:\s+fase:\s*(plan|build|rapport))?\s*-->$/);
    if (m) marker = { pakke: m[1], fase: m[2] ?? "plan" };
  }
  if (!marker)
    return v(
      "structural-chain",
      "aktiv-plan.md mangler standalone-markør <!-- aktiv-pakke: <navn|ingen> [fase: plan|build|rapport] -->",
    );
  if (marker.pakke === "ingen") return;
  const base = "docs/coordination";
  const krav = `${base}/${marker.pakke}-krav-og-data.md`;
  const plan = `${base}/${marker.pakke}-plan.md`;
  const status = `${base}/${marker.pakke}-status.md`;
  for (const f of [krav, plan, status]) {
    if (!existsSync(f)) v("structural-chain", `aktiv pakke '${marker.pakke}': mangler ${f}`);
  }
  if (!existsSync(krav) || !existsSync(plan)) return;
  if (!read(plan).includes(krav)) v("structural-chain", `${plan}: krydspeger ikke ${krav}`);
  if (!read(plan).includes(status)) v("structural-chain", `${plan}: krydspeger ikke ${status}`);
  if (existsSync(status) && !read(status).includes(marker.pakke))
    v("structural-chain", `${status}: nævner ikke pakken '${marker.pakke}'`);
  const fk = normFormaal(read(krav));
  const fp = normFormaal(stripFenced(read(plan)));
  if (!fk) v("structural-chain", `${krav}: ingen "> Denne pakke leverer:"-blok`);
  if (!fp) v("structural-chain", `${plan}: ingen "> Denne pakke leverer:"-blok`);
  if (fk && fp && fk !== fp) v("structural-chain", `Formål-streng afviger mellem ${krav} og ${plan} (§3.0)`);
  if (marker.fase === "rapport") {
    const dir = "docs/coordination/rapport-historik";
    const rapporter = existsSync(dir) ? readdirSync(dir).filter((x) => x.endsWith(`-${marker.pakke}.md`)) : [];
    if (!rapporter.length)
      return v("structural-chain", `fase: rapport men ingen rapport-historik/*-${marker.pakke}.md`);
    const nyeste = rapporter.sort().at(-1);
    const fr = normFormaal(read(join(dir, nyeste)));
    if (!fr) v("structural-chain", `${dir}/${nyeste}: ingen "> Denne pakke leverer:"-blok`);
    else if (fk && fk !== fr) v("structural-chain", `Formål-streng afviger mellem ${krav} og ${dir}/${nyeste} (§3.0)`);
  }
}
```

NB: plan-filens Formål læses EFTER `stripFenced` så citerede skabelon-eksempler
ikke matcher; krav-dok/rapport læses råt (Formål står som blockquote, ikke fence).

`docs/coordination/aktiv-plan.md` får markøren (build-fasen):
`<!-- aktiv-pakke: gov-docs-renhed fase: build -->`.

### B.4 `scripts/governance-check.selftest.mjs` — 9 nye cases

Nuværende cases-array (linje 43-55) bevares; appendes (ny 1:1). Helperen
`chainFiles` producerer en FULDT konsistent kæde (krav+plan+status, begge
krydspeg, Formål-match) — hver case planter præcis ÉN defekt ovenpå:

```js
const FORMAAL = "> Denne pakke leverer: testleverance.\n";
const PLAN_OK = `# t\n\ndocs/coordination/testpakke-krav-og-data.md\ndocs/coordination/testpakke-status.md\n\n## Formål\n\n${FORMAAL}`;
const chainFiles = (d, { plan = PLAN_OK, kravFormaal = FORMAAL } = {}) => {
  writeFileSync(join(d, "docs/coordination/testpakke-krav-og-data.md"), `# t\n\n## Formål\n\n${kravFormaal}`);
  writeFileSync(join(d, "docs/coordination/testpakke-plan.md"), plan);
  writeFileSync(join(d, "docs/coordination/testpakke-status.md"), "# testpakke status\n");
};
const setMarker = (d, fase) =>
  appendFileSync(join(d, "docs/coordination/aktiv-plan.md"), `\n<!-- aktiv-pakke: testpakke fase: ${fase} -->\n`);
cases.push(
  [
    "script-dead-path",
    (d) => appendFileSync(join(d, "scripts/types-gen.sh"), "\ncat docs/skabeloner/plan-skabelon.md\n"),
  ],
  ["chain-missing-files", (d) => setMarker(d, "plan")],
  [
    "chain-formaal-mismatch",
    (d) => {
      chainFiles(d, { kravFormaal: "> Denne pakke leverer: noget ANDET.\n" });
      setMarker(d, "plan");
    },
  ],
  [
    "chain-missing-krydspeg",
    (d) => {
      chainFiles(d, { plan: `# t\n\ndocs/coordination/testpakke-status.md\n\n## Formål\n\n${FORMAAL}` });
      setMarker(d, "plan");
    },
  ],
  [
    "chain-missing-status-krydspeg",
    (d) => {
      chainFiles(d, { plan: `# t\n\ndocs/coordination/testpakke-krav-og-data.md\n\n## Formål\n\n${FORMAAL}` });
      setMarker(d, "plan");
    },
  ],
  [
    "chain-rapport-missing",
    (d) => {
      chainFiles(d);
      setMarker(d, "rapport");
    },
  ],
  [
    "chain-rapport-formaal-mismatch",
    (d) => {
      chainFiles(d);
      writeFileSync(
        join(d, "docs/coordination/rapport-historik/2099-01-01-testpakke.md"),
        "# t\n\n## Formål\n\n> Denne pakke leverer: noget TREDJE.\n",
      );
      setMarker(d, "rapport");
    },
  ],
  [
    "chain-rapport-no-formaal",
    (d) => {
      chainFiles(d);
      writeFileSync(join(d, "docs/coordination/rapport-historik/2099-01-01-testpakke.md"), "# t\n\nIngen blok.\n");
      setMarker(d, "rapport");
    },
  ],
);
// positiv-case: deprecated script får lov at bære historisk-provenance-ref
{
  const d = fixture();
  appendFileSync(join(d, "scripts/types-gen.sh"), "\n# governance: deprecated\ncat docs/skabeloner/plan-skabelon.md\n");
  run(d) === 0
    ? ok("script-dead-path-deprecated -> exit 0")
    : bad("script-dead-path-deprecated", "deprecated script burde gå grøn");
  rmSync(d, { recursive: true, force: true });
}
```

NB: baseline-casen kræver at HEAD-tree'et selv er kædekonsistent — markøren
`fase: build` + krav/plan/status committes i batch 3, FØR checken aktiveres
(implementations-rækkefølgen sikrer det).
