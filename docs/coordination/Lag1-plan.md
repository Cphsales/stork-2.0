---
status: V5.3 — 6 stilstand-konsistens-fixes + 2 simplifikationer (drop CODE-ESCALATE + marker-priority)
type: pakke-plan
forudsætning: workflow-test gennemført; Codex runde 5 APPROVAL på V5.1; Claude.ai 2 runder feedback; Mathias-princip "system der virker og er bygget korrekt, ikke regler på regler"
plan-flow: krav → afklar → plan → approval → build → slut-rapport
autoritet: denne fil er kilde-til-sandhed for workflow-spec under Lag 1's design-fase; workflow-skabelon.md opdateres som del af build (leverance I)
---

# Lag 1 — Workflow-stabilisering (samlet plan V5.3)

## Formål

Implementer 9 leverancer (A-J) der eliminerer 6 friktioner fra T9-supplement-perioden + etablerer **dialog-baseret workflow** (defensive + positive markers, FLAG→LØS→STOP-protokol med max-iter-cap) for kommende pakker.

## Round-historik

| Runde                       | Plan | Fund                                                              | Status                                                             |
| --------------------------- | ---- | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| 1                           | V1   | 2 KRITISK + 2 MELLEM                                              | Alle ACCEPT                                                        |
| 2                           | V2   | 3 LAV                                                             | Alle ACCEPT                                                        |
| 3                           | V3   | —                                                                 | APPROVAL (kode-leverancer A-J)                                     |
| 4                           | V4   | 7 HULler                                                          | Alle ACCEPT                                                        |
| Konsolidering               | V5   | Huller udfyldt                                                    | Round 5 killed før output                                          |
| Self-review                 | V5.1 | 2 yderligere selv-fundne huller (marker-priority + iter-counting) | Codex runde 5 APPROVAL                                             |
| Claude.ai step 4            | V5.1 | AFVIS — 2 KRITISK + 3 MELLEM                                      | Mathias enig i 2 KRITISK; 3 MELLEM → G-nummer-kandidater           |
| KRITISK-fixes               | V5.2 | OPGRADERING bevaret + WORKAROUND-gate flyttet til ny mappe        | Claude.ai runde 2: AFVIS — 6 stilstand-inkonsistenser (line-edits) |
| Konsistens + simplifikation | V5.3 | 6 line-edits + drop CODE-ESCALATE + drop marker-priority          | Klar til Claude.ai runde 3                                         |

V3's kode-leverancer (A-J) er **uændrede**. V5 udvider workflow-spec'en.

---

## Round 4 hul-håndtering (alle ACCEPT)

| HUL      | Beskrivelse                                                                          | Fix i V5                                                                  | V5.3-status                                                                                                        |
| -------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1        | TEKNISK-BLOKERING-marker manglede                                                    | Tilføjet som femte halt-marker                                            | Aktiv                                                                                                              |
| 2        | PLAN-AFVIGELSE-marker manglede                                                       | Tilføjet som sjette halt-marker                                           | Aktiv                                                                                                              |
| 3        | Dialog kan låse uden max-iter                                                        | Max 3 LØS-iter + Code-ESCALATE + auto-eskalation ved iter 4               | **Erstattet i V5.3** — Code-ESCALATE droppet; auto-eskalering ved iter > 3 + arbejds-disciplinens stop-rule dækker |
| 4        | Konsistens-hul mod workflow-skabelon.md                                              | V5 er autoritativ; workflow-skabelon opdateres under build (leverance I)  | Aktiv                                                                                                              |
| 5        | Mathias-gate ikke operationelt defineret                                             | Konkret protokol via `mathias-afgoerelser.md` entry-format                | **Erstattet i V5.2** — to-fil-flow med ny `mathias-gate/`-mappe; mathias-afgoerelser.md forbliver append-only log  |
| 6        | STOP-sluttilstande mangler routing                                                   | Routing-tabel for alle 6 halt-markers                                     | Aktiv                                                                                                              |
| 7        | Positive markers afskåret fra slut-rapport                                           | Udvidet til alle 3 review-faser med scope-clarification                   | Aktiv                                                                                                              |
| A (self) | Marker-overlap ambiguity (SQL-injection = både KRITISK-SIKKERHED OG PLAN-AFVIGELSE?) | Marker-priority-tabel: højeste relevante vinder                           | **Erstattet i V5.3** — priority-tabel droppet; Codex' skøn + G-nummer-logging af sekundære markers                 |
| B (self) | Iteration-counting mechanism uklart                                                  | Iter tælles PER FUND PER RUNDE, reset ved ny runde, logges i Codex-output | Aktiv                                                                                                              |

---

## Claude.ai step 4 fund-håndtering (V5.2)

| Fund                                                                          | Klasse  | Mathias-svar           | V5.2 fix                                                                                                                                   |
| ----------------------------------------------------------------------------- | ------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| OPGRADERING→OPTIMERING-FORSLAG rename modsiger 2026-05-17 afgørelse           | KRITISK | ACCEPT                 | OPGRADERING bevares for plan-fase. OPTIMERING-FORSLAG begrænses til BUILD-fase (parallel mekanisme, ikke rename).                          |
| WORKAROUND-gate omdefinerer mathias-afgoerelser.md fra append-only til hybrid | KRITISK | ACCEPT                 | Ny mappe `docs/coordination/mathias-gate/` for AFVENTER-entries. mathias-afgoerelser.md forbliver append-only log af trufne afgørelser.    |
| Krav-dok ikke skrevet (procedural)                                            | MELLEM  | Mathias-skip godkendt  | Fire-dokument-tabel rettes: krav-dok markeret "✗ — undtagelse godkendt af Mathias 2026-05-20 (pakken opstod gennem workflow-test session)" |
| Marker-priority kan skjule plan-afvigelser                                    | MELLEM  | → G-nummer-kandidat    | Tilføj G-nummer i build: sekundære markers logges som G-numre selv når primær routes alene                                                 |
| CODE-ESCALATE svækker Code's "argument eller stop"-binæritet                  | MELLEM  | V5.3: ACCEPT — droppet | Auto-eskalering ved iter > 3 + arbejds-disciplinens eksisterende stop-rule dækker behovet. Ingen funktionalitet tabt.                      |

---

## Leverancer (9 — uændret kontrakt fra V3)

### Nye filer (5)

| ID  | Fil                                      | Kort beskrivelse                                 |
| --- | ---------------------------------------- | ------------------------------------------------ |
| A   | `scripts/codex-review.sh`                | Wrapper, xhigh+fast_mode, timeout, marker-parser |
| D   | `scripts/claude-ai-prompt.sh`            | Paste-fil-generator                              |
| H   | `scripts/krav-afklar.sh`                 | Codex-spørgs-mode                                |
| J   | `scripts/data-grundlag.sh`               | Kontekst-indsamling step 0                       |
| B   | `.github/workflows/pr-drift-warning.yml` | PR-overlap warning                               |

### Ændrede filer (uændret fra V3, men I-leverance UDVIDES — se HUL 4 fix)

| ID  | Fil                                                        | Ændring                                                                        | V5-ændringer ift V3                                                                                                                   |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| C   | `.husky/pre-commit`                                        | Rapport-historik reminder                                                      | Som V3                                                                                                                                |
| E+F | `docs/skabeloner/codex-review-prompt.md`                   | Niveau 1-prefix udvidet med markers                                            | Tilføj 6 halt-markers + 2 positive + dialog-cap                                                                                       |
| I   | `docs/skabeloner/workflow-skabelon.md`                     | Opdateres til V5-spec                                                          | NY: skal aligne med V5's nye markers/routing/Mathias-gate                                                                             |
| I   | `docs/skabeloner/plan-skabelon.md`                         | Halt-håndtering + optimerings-felter                                           | Tilføj routing-reference                                                                                                              |
| I   | `docs/skabeloner/rapport-skabelon.md`                      | Halt-eskaleringer + optimeringer                                               | Tilføj plan-afvigelser-koppling til markers                                                                                           |
| I   | `docs/strategi/arbejdsmetode-og-repo-struktur.md`          | Reference til workflow-skabelon                                                | Som V3                                                                                                                                |
| I   | `docs/strategi/arbejds-disciplin.md`                       | Selv-tjek udvidet                                                              | Som V3                                                                                                                                |
| I   | `docs/coordination/overvaagning/claude-ai-overvaagning.md` | Cadence-ændring                                                                | Som V3                                                                                                                                |
| I   | `docs/coordination/overvaagning/code-overvaagning.md`      | Code's svar-protokol                                                           | ACCEPT/PUSHBACK/PROPOSE-ALTERNATIVE (3 svar-typer, ingen CODE-ESCALATE — auto-eskalering ved iter > 3 dækker)                         |
| I   | `docs/coordination/overvaagning/codex-overvaagning.md`     | Codex' svar-protokol + OPTIMERING-FORSLAG tilføjet til build/slut-rapport-fase | NY: OPGRADERING bevaret for plan-fase per 2026-05-17 afgørelse; OPTIMERING-FORSLAG er PARALLEL mekanisme for build-fase (ikke rename) |

---

## Workflow-spec V5

### Halt-markers (defensive) — 6 markers

| #   | Marker                            | Trigger                                                             | Routing ved STOP                                              |
| --- | --------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1   | `BRUD-PAA-KRAV: <hvad>`           | Build/plan modsiger krav-doc                                        | → step 1 (revid krav)                                         |
| 2   | `TEKNISK-BLOKERING: <hvad>`       | Ikke fysisk implementerbar (CI/tooling/dependency/migration umulig) | → step 3 (revid plan); fundamental: Mathias eskaleres         |
| 3   | `PLAN-AFVIGELSE: <hvad>`          | Build afviger fra approved plan uden krav-brud                      | → step 3 (plan V2) eller Mathias-godkendelse af afvigelse     |
| 4   | `KRITISK-SIKKERHEDSHUL: <hvad>`   | RLS-hul, datatab, SQL-injection, klar sikkerheds-risiko             | Fix i samme batch FØRST; hvis ikke muligt → Mathias           |
| 5   | `WORKAROUND-INTRODUCERET: <hvad>` | Bevidst kvalitets-sænkning                                          | Mathias-gate (se protokol nedenfor); efter approval: genoptag |
| 6   | `STOP-FOR-CLARIFICATION: <hvad>`  | Info mangler genuint                                                | Auto-STOP; mål-part svarer; genoptag samme step               |

### Log-marker

| Marker                      | Trigger                      | Respons                             |
| --------------------------- | ---------------------------- | ----------------------------------- |
| `G-NUMMER-KANDIDAT: <hvad>` | Forbedring der ikke blokerer | Log til `teknisk-gaeld.md`; fortsæt |

### Positive markers — 2 markers (KORRIGERET V5.2 efter Claude.ai KRITISK 1)

**Plan-fase reviews** bevarer `OPGRADERING` per Mathias-afgørelse 2026-05-17 (uændret):

- Rejses af Codex med svar-typer: **AFVIS** eller **IMPLEMENTER**
- Dokumenteres i V<n+1>'s "Opgraderings-håndtering"-sektion
- Bevares uændret — OPTIMERING-FORSLAG ER IKKE rename af OPGRADERING

**Build-fase + slut-rapport** får ny separat mekanisme:

| Marker                              | Rejses af | Anvendelses-scope                                                  | Svar-typer                                        |
| ----------------------------------- | --------- | ------------------------------------------------------------------ | ------------------------------------------------- |
| `OPTIMERING-FORSLAG: <hvad>`        | Codex     | Build + Slut-rapport (rapport-tekst, arkivering, doc-forbedringer) | Code: ADOPT/DEFER/DISMISS; Codex: CONFIRM-MOVE-ON |
| `SPARRING-OENSKE: <kode-spørgsmål>` | Code      | Build + Slut-rapport                                               | Codex: CONFIRM/TIMING/AVOID                       |

**Slut-rapport-clarification:** OPTIMERING-FORSLAG i slut-rapport gælder rapport-tekst, arkiveringsprocesser, doc-fejl — IKKE kode-omarbejde (kode er i merge-klar tilstand).

**Plan-fase-clarification (V5.2):** OPTIMERING-FORSLAG anvendes IKKE i plan-fase. Plan-fase reviews fortsætter med eksisterende OPGRADERING-mekanisme. De to mekanismer er parallelle, ikke rename — distinkt fase-scope.

### Dialog-protokol — FLAG → LØS → STOP med max-cap

```
FLAG    — Marker rejses (af enten Code eller Codex)
LØS     — Dialog, MAX 3 LØS-iterationer per fund
          Iter 1: initial respons + modrespons
          Iter 2: refine
          Iter 3: sidste forsøg
          Iter 4 (auto-eskalation): tving STOP
STOP    — Hvis nogen rejser ESCALATE, ELLER iter > 3
```

**Iteration-counting mechanik (V5.1 fix HUL B):**

- Iter tælles **PER FUND PER RUNDE** — ikke globalt
- Reset ved ny runde (samme fund kan re-rejses i V2-runde uden iter-arv)
- Codex' runde-output inkluderer metadata pr. fund:

```
[FUND-1] KRITISK-SIKKERHEDSHUL: ...
  Iter: 1/3
  Status: AKTIV
```

- Hvis fund når iter 3 uden konvergens → auto-eskalation marker tilføjet i sluttekst:

```
AUTO-ESKALATION — Runde N
[FUND-X] iter 3 nået uden konvergens. Mathias-judgment påkrævet.
```

### Marker-valg ved overlap (V5.3 simplificeret fra V5.1's priority-tabel)

Hvis en situation matcher flere markers samtidigt: **Codex bruger den marker der bedst beskriver primær problem**. Sekundære aspekter nævnes i body som G-nummer-kandidater.

**Eksempel:** Step 5 introducerer SQL-injection sårbarhed der også afviger fra plan.
→ Codex vælger `KRITISK-SIKKERHEDSHUL` (sikkerheds-risiko er primær — kræver fix). Body nævner: _"Sekundær PLAN-AFVIGELSE: G-nummer-kandidat til tracking af hvorfor afvigelse skete."_

**V5.3 simplifikation:** Formel priority-tabel (V5.1's HUL A fix) er droppet. Codex' professionelle skøn + automatisk G-nummer-logging af sekundære markers dækker samme behov uden rigid rangering. Match disciplin-pakke's princip _"don't add abstractions for hypothetical needs"_.

**Defensive svar-typer (under FLAG→LØS):**

| Hvem  | Svar                | Hvornår                              |
| ----- | ------------------- | ------------------------------------ |
| Code  | ACCEPT              | "Du har ret, jeg fixer"              |
| Code  | PUSHBACK            | "Fund er ikke gyldigt pga. X"        |
| Code  | PROPOSE-ALTERNATIVE | "Du har en pointe, men her er Y"     |
| Codex | AGREE               | "OK, issue lukket"                   |
| Codex | REFINE              | "Næsten — overvej Z" (næste iter)    |
| Codex | ESCALATE            | "Vi er uenige om noget fundamentalt" |

**Note V5.3:** CODE-ESCALATE (foreslået i V5 til HUL 3) er **droppet** — auto-eskalering ved iter > 3 + arbejds-disciplinens eksisterende "argument eller stop"-binæritet dækker behovet. Hvis Code ikke kan argumentere videre, STOPPER Code. Mathias-judgment hentes via gate-fil-mekanismen.

**Positive svar-typer (under FLAG→LØS for positive markers):**

| Hvem                | Svar            | Hvornår                                           |
| ------------------- | --------------- | ------------------------------------------------- |
| Code                | ADOPT           | "God catch, fix i samme batch"                    |
| Code                | DEFER           | "Smart, men ikke i scope → G-nummer"              |
| Code                | DISMISS         | "Smag eller premature → afvis med begrundelse"    |
| Codex               | CONFIRM-MOVE-ON | Default modsvar — issue lukket uanset Code's valg |
| Codex (på SPARRING) | CONFIRM         | "Ja, gør det"                                     |
| Codex (på SPARRING) | TIMING          | "Vent — abstrahér først ved 3+ gentagelser"       |
| Codex (på SPARRING) | AVOID           | "Premature abstraction eller modsiger disciplin"  |

### Mathias-gate protokol (WORKAROUND + ESCALATE) — KORRIGERET V5.2 efter Claude.ai KRITISK 2

**Bevarer `mathias-afgoerelser.md` som append-only log over trufne afgørelser** (Claude.ai's korrekte indvending). Ny mappe `docs/coordination/mathias-gate/` introduceres for afventende entries.

1. **Build pauser.** Script exit code = 3 (WORKAROUND) eller 4 (ESCALATE).
2. **Code skriver gate-fil** `docs/coordination/mathias-gate/<pakke>-<workaround|escalate>-<N>.md`:

```markdown
# YYYY-MM-DD — [Pakke] [WORKAROUND|ESCALATE] afventer afgørelse

**Type:** WORKAROUND-INTRODUCERET / ESCALATE-konsensus / auto-eskalation (iter > 3)
**Beskrivelse:** <hvad er problemet>
**Real-løsning (hvis WORKAROUND):** <hvad burde være lavet i stedet>
**Begrundelse:** <hvorfor afvigelse er nødvendig>
**G-nummer (hvis WORKAROUND):** <reference til ny G-nummer>
**Deadline for fix (hvis WORKAROUND):** <dato>
**Status:** AFVENTER MATHIAS
```

3. **Mathias responderer** ved at editere gate-fil: `**Status:** GODKENDT` eller `**Status:** AFVIST — alternativ retning: <hvad>`.
4. **Code reagerer:**
   - GODKENDT →
     a. Tilføj append-only entry i `mathias-afgoerelser.md` med samme dato + reference til gate-fil + sammenfatning af trufne afgørelse
     b. Flyt gate-fil til `docs/coordination/mathias-gate/arkiv/` (eller slet — pakkens slut-rapport refererer den arkiverede sti)
     c. Genoptag build fra samme batch
   - AFVIST →
     a. Tilføj append-only entry i `mathias-afgoerelser.md` om afvisning + alternativ retning
     b. Arkivér gate-fil
     c. Implementer alternativ retning

**To-fil-strukturen bevarer begge filers kontrakt:**

- `mathias-gate/` = aktuelt afventende beslutninger (kø)
- `mathias-afgoerelser.md` = append-only log over trufne afgørelser

### Routing-tabel (efter STOP eller eskalation)

| Trigger                                        | Default routing                            | Alternativ                                                                                   |
| ---------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| BRUD-PAA-KRAV                                  | step 1 (revid krav-dok)                    | —                                                                                            |
| TEKNISK-BLOKERING                              | step 3 (revid plan med teknisk constraint) | Mathias-eskalation hvis fundamental                                                          |
| PLAN-AFVIGELSE                                 | step 3 (plan V2 inkorporerer afvigelse)    | Mathias-godkendelse af afvigelse via `mathias-gate/` (to-fil-flow per Mathias-gate-protokol) |
| KRITISK-SIKKERHEDSHUL                          | Fix i samme batch                          | Mathias-eskalation hvis ikke muligt                                                          |
| WORKAROUND-INTRODUCERET                        | Mathias-gate (se protokol)                 | —                                                                                            |
| STOP-FOR-CLARIFICATION                         | Genoptag samme step efter mål-parts svar   | —                                                                                            |
| ESCALATE-konsensus (Code+Codex begge ESCALATE) | Mathias-judgment via `mathias-gate/`       | Mathias kan route til: step 1, step 3, eller abandon-pakke                                   |
| Auto-eskalation (iter > 3)                     | Tving ESCALATE-rute via `mathias-gate/`    | —                                                                                            |

---

## Eksempler — dialog-flow

### Workaround der løses uden Mathias-eskalering MEN kræver godkendelse

```
Codex: WORKAROUND-INTRODUCERET: Step 3 bruger string-split i stedet for zod parsing
       REAL-LØSNING: zod schema
       BEGRUNDELSE: zod tilføjer dependency

Code: PROPOSE-ALTERNATIVE: zod er allerede i package.json (T9-supplement). Bruger zod.

Codex: AGREE.

[Code+Codex enige om at workaround IKKE er nødvendigt → WORKAROUND-marker annulleres
 → ingen Mathias-gate, build fortsætter med zod-implementation]
```

### Workaround der reelt er nødvendig → Mathias-gate (V5.3 to-fil-flow)

```
Codex: WORKAROUND-INTRODUCERET: A bruger inline regex i stedet for proper parser
       REAL-LØSNING: implementer @stork/parser-modul
       BEGRUNDELSE: pakken er Lag 1, parser er Lag B-arbejde

Code: ACCEPT (workaround er nødvendig — parser-modul er ikke i scope).

[Build pauser →
 Code skriver docs/coordination/mathias-gate/Lag1-workaround-1.md med
   Status: AFVENTER MATHIAS + G-nummer + deadline
 → Mathias edit'er gate-fil: Status: GODKENDT
 → Code tilføjer append-only entry til mathias-afgoerelser.md (trufne afgørelse)
 → Gate-fil flyttes til mathias-gate/arkiv/
 → Build genoptager]
```

### Dialog-låse forhindres af max-cap

```
Codex: KRITISK-SIKKERHEDSHUL: RLS-policy bypasses for service_role
Iter 1 Code: PUSHBACK — service_role er designet til at bypasse
Iter 1 Codex: REFINE — men der mangler audit-trail
Iter 2 Code: PUSHBACK — audit-trail er separat ansvar
Iter 2 Codex: REFINE — kan vi tilføje minimum-audit?
Iter 3 Code: PROPOSE-ALTERNATIVE — log via trigger i stedet
Iter 3 Codex: AGREE

[Konvergens nået på iter 3 — build fortsætter]
```

```
Codex: PLAN-AFVIGELSE: Step 5 leverer X i stedet for Y som planlagt
Iter 1 Code: PUSHBACK
Iter 1 Codex: REFINE
Iter 2 Code: PUSHBACK
Iter 2 Codex: REFINE
Iter 3 Code: PUSHBACK
Iter 3 Codex: REFINE

[Iter > 3 → AUTO-ESCALATE → Mathias-gate]
```

### Optimering adopteret

```
Codex: OPTIMERING-FORSLAG: scripts/codex-review.sh har gentaget timeout-handling
       HVORDAN: udskil til helper `_run_with_timeout()`
       IMPACT: -15 linjer, mere testbar
       TIMING: NU

Code: ADOPT — refactor i samme batch.

Codex: CONFIRM-MOVE-ON.
```

---

## Implementation-rækkefølge

V5 justerer V3's rækkefølge let — doc-opdateringer kommer FØRST så scripts implementerer mod konsolideret kontrakt.

1. **Doc-fundament (I-leverancer):**
   - `workflow-skabelon.md` opdatering (build-fase dialog-spec V5.3)
   - `codex-review-prompt.md` udvidelse (niveau 1-prefix med markers/routing)
   - 3 overvaagning-docs (OPGRADERING bevaret for plan-fase + OPTIMERING-FORSLAG parallel for build-fase)
   - `plan-skabelon.md` + `rapport-skabelon.md` opdatering
   - `arbejds-disciplin.md` + `arbejdsmetode-og-repo-struktur.md` reference-opdatering
2. **Script-fundament (A+D):** scripts med marker-parser (6 halt + 1 log + 2 positive)
3. **Workflow-scripts (H+J)**
4. **Marker-håndtering integration (F):** post-processing for alle 9 markers
5. **Selvstændig automation (B+C)**

---

## Dogfood

Under build anvender vi V5-workflow på vores egen implementation:

- Mellem hver batch: `codex-review.sh --quick`
- Codex returnerer markers; Code reagerer per protokol
- Optimeringer adopteres direkte
- Halt-eskaleringer dokumenteres i slut-rapport

---

## Test pr. leverance

| ID  | Test                                                                        |
| --- | --------------------------------------------------------------------------- |
| A   | Kør på T9-supplement-plan + verificer parser fanger alle 9 marker-typer     |
| B   | Lokal fixture-test af gh CLI mock                                           |
| C   | Stage mock rapport-historik + verificer y/N + non-interactive               |
| D   | Kør på plan-fil + verificer paste-fil indeholder rolle-prefix + krav + plan |
| E+F | Grep-konsistens i 8 docs; ingen marker-format-modsigelser                   |
| H   | Kør på mock krav-dok + verificer afklarende spørgsmål                       |
| J   | Kør med pakke-topic + verificer 3 sektioner                                 |

---

## Risici + mitigation

| Risiko                                             | Mitigation                                                             |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| Codex CLI nede                                     | Scripts fejler tidligt med codex doctor-hint                           |
| Niveau 1-prefix bryder manuel paste                | CHANGELOG-linje i scripts/README.md                                    |
| 9 markers er for mange                             | Soft-limit 3 markers/runde; dokumenter pattern                         |
| Optimering-glid                                    | Code's DISMISS-option obligatorisk; reference til disciplin-pakke      |
| Dialog-låse                                        | Max 3 LØS-iter + auto-eskalation (V5 fix)                              |
| Doc-konsistens-glid mellem V5 og workflow-skabelon | Build-leverance I synkroniserer (V5 er autoritativ kilde under design) |
| WORKAROUND Mathias-gate omgået                     | Separat gate i protokollen — uanset Code+Codex-konsensus               |
| TEKNISK-BLOKERING vs BRUD-PAA-KRAV mix-up          | Routing-tabel skelner; Codex-overvaagning får eksempler                |

---

## Oprydnings- og opdaterings-strategi

Når Lag 1 er bygget + merged + slut-rapport godkendt:

### Filer der flyttes til arkiv (`docs/coordination/arkiv/`)

- `docs/coordination/Lag1-plan.md` → `arkiv/Lag1-plan.md`
- `docs/coordination/plan-feedback/Lag1-V5.1-claude-ai.md` → `arkiv/Lag1-V5.1-claude-ai.md` + `arkiv/Lag1-V5.3-claude-ai.md` (split af kombineret fil)
- `docs/coordination/plan-feedback/Lag1-approved-codex.md` → `arkiv/Lag1-approved-codex.md`
- `docs/coordination/mathias-gate/Lag1-*` (hvis nogen WORKAROUND-entries genereret under build) → `arkiv/mathias-gate-Lag1-*`

### Filer der opdateres

- `docs/coordination/aktiv-plan.md` → Aktuel: ingen aktiv pakke; Historisk: Lag 1 afsluttet med dato + commit-hash + slut-rapport-reference
- `docs/coordination/seneste-rapport.md` → peger på `rapport-historik/2026-MM-DD-Lag1.md`
- `docs/strategi/bygge-status.md` → IKKE relevant (Lag 1 er ikke en §4-trin; det er meta-pakke om workflow-tooling). Tilføj note i Action-items om workflow-spec etableret
- `docs/teknisk/teknisk-gaeld.md` → G-numre logget under build inkluderes (specielt for MELLEM 2-3 fra Claude.ai-runde 1)
- `docs/skabeloner/workflow-skabelon.md` → opdateres af leverance I til V5.3-konsistens (V5.3 plan er autoritativ under build)

### Reference-konsekvenser

- `grep -r "Lag1-plan.md" docs/` efter arkivering → opdater stier til `arkiv/Lag1-plan.md`
- Slut-rapport refererer plan-fil ved arkiv-sti (ikke coordination-rod)
- Workflow-skabelon's "Konvergens-eksempel"-sektion opdateres med Lag 1's faktiske runde-historik (7 plan-versioner, 5 Codex-runder + 3 Claude.ai-runder)

### Verifikations-grep (skal returnere 0 hits efter arkivering)

- `grep -rn "Lag1-plan.md" docs/ | grep -v arkiv | grep -v rapport-historik` → 0 hits forventet
- `grep -rn "Lag1-V5" docs/ | grep -v arkiv | grep -v rapport-historik` → 0 hits forventet

---

## Fire-dokument-konsultation

| Dokument                                   | Konsulteret                                                                                                                                                                      | Match       |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `docs/strategi/vision-og-principper.md`    | Princip 6 (disciplin) + driftsovervågning                                                                                                                                        | ✓ overholdt |
| `docs/strategi/stork-2-0-master-plan.md`   | §0 vision om plan-driven build                                                                                                                                                   | ✓ overholdt |
| `docs/coordination/mathias-afgoerelser.md` | Trufne afgørelser logges her (append-only); AFVENTER-entries lever i `mathias-gate/` per to-fil-flow                                                                             | ✓ overholdt |
| Krav-dok                                   | ✗ — undtagelse godkendt af Mathias 2026-05-20 (pakken opstod gennem workflow-test session; krav ekstraheres implicit fra de 6 dokumenterede friktioner i T9-supplement-perioden) |

---

## Konklusion

V5.3 = V3 (kode-godkendt af Codex runde 3) + V4's workflow-spec + V5's 7 hul-fixes (Codex runde 4-5) + V5.2's KRITISK-fixes (OPGRADERING bevaret + mathias-gate to-fil-flow) + V5.3's konsistens-fixes (6 line-edits efter Claude.ai V5.2-review) + V5.3's simplifikationer (drop CODE-ESCALATE + drop marker-priority-tabel).

**Workflow-spec V5.3 er kontrakten** scripts (A+D+H+J) implementerer imod.

**Approval-status:**

- ✅ Codex APPROVED på V5.1 (runde 5)
- ✅ Claude.ai APPROVED på V5.3 (runde 3)
- ⌛ Afventer Mathias' formelle godkendelse via `qwerg`

**Klar til:** Step 5 BUILD efter Mathias-godkendelse.
