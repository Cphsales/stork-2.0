# gov-docs-renhed — Plan V1

**Branch:** claude/gov-docs-renhed-plan
**Krav-dok:** docs/coordination/gov-docs-renhed-krav-og-data.md
**Dato:** 2026-06-10
**Status-fil:** docs/coordination/gov-docs-renhed-status.md (konvergens-counter: 1)

## Formål

> Denne pakke leverer: et docs-repo hvor ingen doc eller script modsiger
> virkeligheden — plus de mekaniske værn der holder det rent — så fælles
> forståelse og workflow ikke kan brydes af drift.

## Step 2.0 — Skitse + størrelses-tjek

**0 migrations.** Pakken rører kun docs + scripts: 3 scripts slettes, 1 script
repareres, 2 `.mjs`-filer udvides (scanner + selftest), 9 docs patches. Under
§3.8-grænsen → fuld V1, intet split.

## Verificerede repo-objekter (state-dump)

§3.2 DB-state-dump er **N/A** — pakken rører ingen DB-objekter (0 RPC'er, 0
tabeller, 0 policies). Erstattet af repo-state-dump, verificeret 2026-06-10 på
main @ `1278e92`:

```
pnpm governance:check:
✓ dead-doc-paths ✓ junk-files ✓ laesefoelge-targets ✓ pointer-validity
✓ owns-uniqueness ✓ number-home-uniqueness ✓ H-ref-integrity
Governance-check: alle checks passed (19 docs, 6 scripts)
```

- **Scripts (`.sh`, scannet af governance-check):** codex-review.sh (286 l) ·
  claude-ai-prompt.sh (192 l) · data-grundlag.sh (173 l) · krav-afklar.sh (135 l)
  · schema-check.sh · types-gen.sh
- **CI:** `governance:check` = `.github/workflows/ci.yml:67`, `governance:selftest`
  = `ci.yml:70`; package.json:27-28.
- **Allowlist:** `scripts/governance-check.mjs:42-99` — 12 entries med
  `klasse`-felt; `deadDocPaths()` (linje 129-142) bruger kun `ALLOWED`-settet
  (linje 100) og skelner IKKE på klasse eller fil-type. **Det er hullet:**
  `codex-review.sh:78` peger på slettet `docs/skabeloner/codex-review-prompt.md`
  og går grønt fordi entry'en findes som historisk-provenance.
- **H020:** historisk kode i `docs/teknisk/huskeliste.md:54` (gov-historical-codes)
  med tombstone-række linje 62 → `arkiv/H020-flow-fejl.md`. Refereres levende fra
  `disciplin.md:46` (§2) og `disciplin.md:174` (§6.2).
- **Allowlist-stiers faktiske referenter** (grep uden arkiv/v4-slettede-docs/
  rapport-historik — dvs. scannerens scope):

  | Allowlist-sti                          | Refereres fra (scannet scope)                                                                                         |
  | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
  | skabeloner/codex-review-prompt.md      | codex-review.sh + krav-dok (prosa)                                                                                    |
  | coordination/mathias-afgoerelser.md    | claude-ai-prompt.sh + data-grundlag.sh (kun scripts)                                                                  |
  | overvaagning/claude-ai-overvaagning.md | claude-ai-prompt.sh (kun script)                                                                                      |
  | overvaagning/codex-overvaagning.md     | gov-2-vagt-plan.md + teknisk-gaeld.md (prosa)                                                                         |
  | strategi/bygge-status.md               | data-grundlag.sh + gov-2-vagt-plan.md + teknisk-gaeld.md                                                              |
  | skabeloner/plan-skabelon.md            | gov-2-vagt-plan.md + teknisk-gaeld.md (prosa)                                                                         |
  | skabeloner/rapport-skabelon.md         | **ingen i scannet scope** (kun rapport-historik/README.md, som er scope-ekskluderet — derfor overlevede den døde ref) |
  | strategi/arbejds-disciplin.md          | gov-2-vagt-plan.md + teknisk-gaeld.md (prosa)                                                                         |
  | coordination/plan-feedback             | claude-ai-prompt.sh + disciplin §4 (kortform uden mappe-prefix)                                                       |
  | coordination/codex-reviews             | codex-review.sh                                                                                                       |

## Repair-vs-slet-verdikt pr. script (krav-dok §Åbne spørgsmål, D1+D3)

| Script                | Verdikt    | Begrundelse                                                                                                                                                                                                                     |
| --------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `codex-review.sh`     | **REPAIR** | Severity-exit-routing (G055-arbejdet), timeout-håndtering og review-fil-med-header er reel værdi nu (manuel dispatch) og genbruges i gov-5-runneren. Bruddet er kun V5.3-skallen: prefix-fil + fire-dok-formål.                 |
| `claude-ai-prompt.sh` | **SLET**   | Indlejrer fjernet fire-dok-ramme + V5.3-step-numre; peger på slettede mathias-afgoerelser.md + claude-ai-overvaagning.md. Substansen er overhalet af SKILL.md-i-repo + Filesystem-MCP (Claude.ai læser disciplin §9.1 direkte). |
| `data-grundlag.sh`    | **SLET**   | V5.3 "Step 0"; læser slettet bygge-status.md. Substansen lever i §9.1 proaktiv recon (`qwers <pakke>`).                                                                                                                         |
| `krav-afklar.sh`      | **SLET**   | V5.3 "Step 2" + V5.3-routing-tabel. Substansen lever i V5 Step 1 (krav-dok-fasen, Claude.ai spørger direkte) + Step 2.1 Codex-parallel. Rækken i scripts/README.md fjernes med.                                                 |

Alle tre sletninger er `git rm` — fuld body bevares i git-history (§4).

## Patch-først pr. ændret fil (§3.1)

### 1. `scripts/codex-review.sh` — V5-repair

Nuværende (brud-punkterne):

- Linje 3: `# Wrapper for Codex CLI review-runder (V5.3 marker-protocol).`
- Linje 31: usage nævner "V5.3 marker-protokol"
- Linje 78-82: `PREFIX_FILE="docs/skabeloner/codex-review-prompt.md"` + exit 64 hvis mangler — **dør altid** (filen er V4-slettet)
- Linje 113-115: slut-rapport-formål refererer "fire-dokument-tjek" (V4-fjernet ramme)
- Linje 118-131: PROMPT bygger på prefix-filen

DIFF:

- Prefix-fil-blokken (78-82) fjernes. PROMPT genereres fra disciplin V5 §10.4
  inline: læs-listen (vision, forretningsforstaaelse, disciplin §9.3, krav-dok,
  plan-fil, status-fil — status-fil udledes som `docs/coordination/<pakke>-status.md`),
  review-fokus-punkterne og fund-formatet fra §10.4, runde-nummer + fase + max-ord
  bevares fra nuværende script.
- "V5.3" → "V5 (disciplin.md §5 severities + §6.1 halt-markers)" i header/usage.
- Slut-rapport-FORMAAL_LINE (113-115): "fire-dokument-tjek korrekt" → "leverance-tabel
  mod krav-dok + Stork-invariant-tjek (§10.3) korrekt".
- Ved governance-doc-berøring instruerer prompten §8.1-SVAR-markøren (se værn 3).
- **Bevares 1:1:** argument-parsing, --quick/--xhigh, timeout-håndtering,
  output-fil-header m. re-run-command, HELE marker-parsing-sektionen (linje
  199-259 inkl. G055 severity-prefix + NEEDS-MATHIAS), exit-kode-routing
  (270-286). Ingen gates/markers tabes.

### 2. Sletninger

`git rm scripts/claude-ai-prompt.sh scripts/data-grundlag.sh scripts/krav-afklar.sh`

`scripts/README.md`: rækken `krav-afklar.sh` (linje 12 i tabellen) fjernes.
Øvrige rækker uændret.

### 3. `scripts/governance-check.mjs` — allowlist-split (værn 1, krav pkt 9)

Nuværende: `deadDocPaths()` linje 129-142 — `if (ALLOWED.has(r))` → note + continue,
uanset om `f` er doc eller script.

DIFF i `deadDocPaths()`:

- Ny helper `isDeprecated(file)`: script indeholder standalone-linje der starter
  med `# governance: deprecated`.
- For `f` i SCRIPT_FILES: allowlist-entry med `klasse === "historisk-provenance"`
  accepteres KUN hvis `isDeprecated(f)`; ellers violation
  `"aktivt script peger på slettet sti (historisk-provenance er kun for prosa)"`.
  Klasserne `runtime-ephemeral` / `future-required` / `scope-excluded-local`
  gælder fortsat begge fil-typer (scripts laver legitimt `mkdir -p` på
  runtime-ephemeral-stier).
- For docs: uændret adfærd.

Allowlist-vedligehold (samme commit, efter sletningerne + README-repoint):

| Entry                                                                                                  | Handling  | Hvorfor                                                                 |
| ------------------------------------------------------------------------------------------------------ | --------- | ----------------------------------------------------------------------- |
| mathias-afgoerelser.md                                                                                 | **prune** | Eneste referenter var de to slettede scripts                            |
| overvaagning/claude-ai-overvaagning.md                                                                 | **prune** | Eneste referent var slettet script                                      |
| skabeloner/rapport-skabelon.md                                                                         | **prune** | Eneste referent var rapport-historik/README.md (repointes, pkt 6)       |
| codex-review-prompt.md, codex-overvaagning.md, bygge-status.md, plan-skabelon.md, arbejds-disciplin.md | behold    | Levende prosa-referenter (historisk-provenance — lovligt for docs)      |
| gdpr-compliance.md, plan-feedback, codex-reviews, v4-slettede-docs                                     | behold    | future-required / runtime-ephemeral / scope-excluded — uændret semantik |

Pruning verificeres med `GOV_VERBOSE=1`-kørsel: ingen "tilladt manglende"-note må
referere en prunet entry.

### 4. `scripts/governance-check.mjs` — strukturel kæde-tjek (værn 2, krav pkt 10)

Ny check `structural-chain` (tilføjes i CHECKS-array linje 256-264):

- **Markør** (standalone linje i `docs/coordination/aktiv-plan.md`):
  `<!-- aktiv-pakke: <navn> fase: plan|build|rapport -->` eller
  `<!-- aktiv-pakke: ingen -->`. Manglende markør = violation (tilstanden skal
  være eksplicit, ikke implicit).
- `ingen` → pass.
- Ellers kræves eksistens af `docs/coordination/<navn>-krav-og-data.md`,
  `<navn>-plan.md`, `<navn>-status.md`.
- **Formåls-immutabilitet mekanisk (§3.0):** blockquoten der starter med
  `> Denne pakke leverer:` ekstraheres fra krav-dok og plan (fortløbende
  `>`-linjer, `> `-prefix strippet, joinet med mellemrum, whitespace collapsed)
  — strengene skal være identiske. Mismatch = violation.
- `fase: rapport` → derudover skal mindst én
  `docs/coordination/rapport-historik/*-<navn>.md` eksistere med samme
  normaliserede Formål-streng.
- Strukturel + string-match, ingen semantik (ærlig grænse per krav-dok).

`aktiv-plan.md` får markøren i denne pakke:
`<!-- aktiv-pakke: gov-docs-renhed fase: build -->` ved build-start; ved
pakke-luk → `ingen` i merge-commit (doc-currency B).

### 5. `scripts/governance-check.selftest.mjs` — nye cases (værn-bevis)

Nuværende cases-array linje 43-55 (5 planted cases). DIFF — 4 nye:

1. `script-dead-path`: append `cat docs/skabeloner/plan-skabelon.md` til
   `scripts/types-gen.sh` i fixture → exit != 0 (beviser allowlist-split; denne
   case ville have fanget krav-dok pkt 1).
2. `script-dead-path-deprecated`: samme + `# governance: deprecated`-linje →
   exit 0 (beviser flugtvejen er bevidst, ikke et hul).
3. `chain-missing-files`: skriv markør `aktiv-pakke: testpakke fase: plan` i
   aktiv-plan.md uden at oprette filerne → exit != 0.
4. `chain-formaal-mismatch`: opret testpakke-krav/plan/status hvor planens
   Formål-streng afviger → exit != 0.

Baseline-case (a) består uændret som positiv-bevis.

### 6. Doc-reconciles

| Fil:linje                           | Nuværende                                                                       | Ændring                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `disciplin.md:46` (§2 note)         | "...plan-branchen er ikke dækket af triggeren (H020)"                           | "(bygges i gov-5-automation)" — levende reference i stedet for H020-tombstone                                                                                                                                                                                                                                                       |
| `disciplin.md:174` (§6.2)           | "plan-branch-trigger (H020), Codex-runner..."                                   | "plan-branch-trigger, Codex-runner, auto-merge — alt sammen gov-5-automation"                                                                                                                                                                                                                                                       |
| `disciplin.md:189` (§7 #4)          | "Ingen hardkodede satser/lønarter (lint)"                                       | "(Codex + Claude.ai-tjek — lint bygges i senere spor)" — ærlig label                                                                                                                                                                                                                                                                |
| `disciplin.md:201-207` (§8-tabel)   | forretningsforstaaelse har ingen række                                          | Ny række: `forretningsforstaaelse.md` — **LÅST** — STOP; + D4-note: modsigelse mellem de to stamme-docs er et hul Mathias lukker, ikke en trumf                                                                                                                                                                                     |
| `disciplin.md:209-217` (§8.1)       | Codex-mandat som instruktion                                                    | (a) stamme-doc-regel: ændring af én stamme-doc kræver eksplicit konsistens-tjek mod den anden (modsigelse = hul → STOP); (b) svaret formaliseres som markør `§8.1-SVAR: INGEN-MODSIGELSE` / `§8.1-SVAR: MODSIGELSE — <begreb> ejes af <doc>` — obligatorisk linje i Codex-review når governance-doc er berørt (værn 3, krav pkt 11) |
| `disciplin.md` §10.3-skabelon       | intet §8.1-felt                                                                 | Ny linje i slut-rapport-skabelon: "## §8.1-svar (hvis governance-docs berørt)" — så markøren kan tjekkes i rapport, ikke kun chat                                                                                                                                                                                                   |
| `disciplin.md:440` (§13)            | "git pull origin main før enhver session-start..."                              | Branch-bevidst: "fetch + verificér aktuel branch/base/remote + pull den branch arbejdet sker på; uventede commits → STOP, rapportér"                                                                                                                                                                                                |
| `disciplin.md:450` (Forudsætninger) | "resterende CI-blocker (gov-3b-2: #10 SECDEF + #18 app-write)"                  | Fjernes (gov-3 fuldt færdig); tilbage: gov-4 branch protection + gov-5 automation                                                                                                                                                                                                                                                   |
| `disciplin.md:452` (Gjort)          | slutter ved gov-3b-1                                                            | Append: gov-3b-2 (PR #101) · gov-3b-3a (PR #103) · gov-3b-3b (PR #105, G065 LØST)                                                                                                                                                                                                                                                   |
| `LÆSEFØLGE.md:18-22` (pkt 0)        | "git pull origin main ... Stop hvis pull viser commits der ikke var forventede" | Branch-bevidst formulering (spejler §13-rettelsen)                                                                                                                                                                                                                                                                                  |
| `LÆSEFØLGE.md:26-29` (pkt 2)        | "**TANKE-DATA** — kontekst-grundlag for krav-dok, ikke kontrakt"                | "**LÅST-AUTORITATIV** (stamme-doc med vision) — opdateres når Mathias' tanker udvikler sig, via PR + CODEOWNERS"                                                                                                                                                                                                                    |
| `LÆSEFØLGE.md:46-47`                | "Ved konflikt ... vision (1) vinder over alle andre"                            | + undtagelse per D4: vision↔forretningsforstaaelse-modsigelse er et hul → STOP → Mathias lukker (ingen trumf)                                                                                                                                                                                                                       |
| `CLAUDE.md:4`                       | "Git pull før hver trigger."                                                    | "Branch-bevidst git-sync før hver trigger (disciplin §13)."                                                                                                                                                                                                                                                                         |
| `forretningsforstaaelse.md:1-5`     | ingen banner                                                                    | LÅST-banner efter owns-markøren, spejler vision-banneren: LÅST DOKUMENT · ændring kræver Mathias-PR · CODEOWNERS håndhæver · D4-sætning (de to stamme-docs må aldrig være indbyrdes uenige; modsigelse = hul der lukkes). Mekanisk håndhævelse (required code-owner-review) = gov-4, doc-niveau her — ærligt markeret               |
| `rapport-historik/README.md:5`      | "Hver rapport følger `docs/skabeloner/rapport-skabelon.md`"                     | "...følger skabelonen i `docs/strategi/disciplin.md` §10.3"                                                                                                                                                                                                                                                                         |
| `docs/claude-ai/SKILL.md`           | ingen kanonisk-deklaration                                                      | Ny sektion: denne fil er DEN kanoniske skill; platform-skill'en er en kopi genereret herfra; ved drift vinder repo-filen; sync = Mathias kopierer ved ændring (flagges i slut-rapport som Mathias-handling)                                                                                                                         |

Krav-dok pkt 8 (fundament-samlet.md) er allerede udført 2026-06-08 — ingen
plan-handling.

## End-to-end-spor (§3.3)

N/A i DB-forstand — ingen write-RPC'er. Det leverede spor er check-sporet:
planted overtrædelse → scanner rød → CI rød (`ci.yml:67/70`) → fix → grøn.
Beviset er selftest-casene ovenfor (§3.6 opfyldt, ikke schema-only).

## Implementations-rækkefølge (3 batches)

| Batch                | Hvad                                                                                      | Afhængighed                                                | Risiko                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1 — script-reconcile | git rm 3 scripts · repair codex-review.sh · scripts/README.md                             | ingen                                                      | Lav. Governance-check skal være grøn efter (færre scripts, ingen døde refs)                      |
| 2 — doc-reconcile    | alle doc-patches i tabellen ovenfor                                                       | ingen                                                      | Lav. §8.1-gate: berører disciplin + LÆSEFØLGE + forretningsforstaaelse → Codex' §8.1-SVAR kræves |
| 3 — mekaniske værn   | allowlist-split + prune · kæde-tjek · aktiv-pakke-markør i aktiv-plan.md · selftest-cases | batch 1+2 (værnene må først bide når virkeligheden er ren) | Mellem. Selftest beviser begge retninger (rød på plantet, grøn på baseline)                      |

Rækkefølgen er bevidst: værnene (batch 3) lander mod et rent repo, og selftest
case 1 beviser at de ville have fanget batch 1-tilstanden.

## End-to-end-test-design

`pnpm governance:selftest` udvidet med de 4 cases (afsnit 5) + eksisterende
baseline. Kørsel lokalt + CI. Accept: alle planted → rød, baseline → grøn.

## Doc-currency

**A. Fundament-validering (FØR qwerg):** Planen ændrer ÉN fundament-doc-status:
forretningsforstaaelse.md løftes til LÅST — det er ikke Code-intention men
Mathias' egen afgørelse i krav-dok (D4 + "Afgørelse: forretningsforståelse
hæves..."). Ingen forretnings-intentions-ændring derudover; vision uberørt.
Verificeret current pr. main @ `1278e92`. Løftet går gennem §8.1-gaten i denne
pakkes review (Codex' §8.1-SVAR) + Mathias' CODEOWNERS-approval ved merge — FØR
qwerg er den altså valideret af reviewet, og selve merge-håndhævelsen er
Mathias' PR-approval.

**B. Status-opdatering (committes med merge):**

| Doc                        | Berørt? | Opdatering                                                                         |
| -------------------------- | ------- | ---------------------------------------------------------------------------------- |
| aktiv-plan.md              | ja      | pakke-status + ny aktiv-pakke-markør (→ `ingen` ved pakke-luk)                     |
| seneste-rapport.md         | ja      | ny rapport-sti + commit-hash ved Step 5                                            |
| master-plan §4.1 status    | nej     | gov-docs-renhed er gov-spor, ikke nummereret byggetrin; aktiv-plan bærer status    |
| teknisk-gaeld.md (G)       | nej     | G063 forbliver åben (gov-6); ingen G rejst/løst her — medmindre build finder noget |
| huskeliste.md (H)          | nej     | H020 forbliver historisk kode; refs repointes kun                                  |
| disciplin "Forudsætninger" | ja      | CI-blocker-linje synkroniseret + Gjort-listen ført à jour (§8.1-gate)              |

## IKKE i denne plan (bekræftet mod krav-dok)

gov-4 branch protection (værnene gøres required DÉR) · gov-5 automation ·
gov-6 arkiv-fold (inkl. G063 + v4-slettede-docs) · P3-spor (Code-rolle-binding,
decision-packet, sats-lint — ingen viste sig billige nok til at tage med uden
scope-glid) · semantisk prosa-modsigelses-scanner (§8.1 lag 2 er Codex).

**Observation uden handling (gov-6-kandidat):** gov-1/gov-2/gov-3a-plan-filer
ligger stadig i docs/coordination/ trods §4 (plan → arkiv ved pakke-luk). Ikke
i denne pakkes scope — noteres til gov-6.

## Åbne krav-dok-spørgsmål → afgjort i denne plan

1. Script-verdikter: afgjort ovenfor (1 repair, 3 slet) — Codex challenger i review.
2. Kæde-tjek i CI eller on-demand: **CI** (kører allerede via `governance:check`-steppet;
   required først i gov-4 per D2).
