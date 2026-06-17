# workflow-færdiggørelse — Plan-2-fund (til Codex-validering)

**Type:** aktør-flade / teknisk fund-log (til Codex). **Status:** dokumenteret som Plan-2-byggekrav + senere Codex-validering — IKKE bootstrap-patchet (Mathias-beslutning 2026-06-17: "bygges i plan 2"). **Sandhed:** beskrevet, ikke handlet.

Denne log samler fund opdaget under bootstrap-testen af front-halvdelen (Pakke 1), som skal bygges i Plan 2 og valideres af Codex når Plan 2 bygges.

---

## FUND-1 — Aktiverings-laget mangler (`qwers` er dødt for en frisk aktør)

**Opdaget:** ren bootstrap-test, 2026-06-17 — frisk Code/Claude-session, ren udcheckning af `main`, prompt `qwers`. Begge friske sessioner: "forstår ikke qwers." En forurenet test (aktøren der byggede Pakke 1) ville have skjult fundet 100%.

### Fundet

`qwers` er ikke wiret som live aktiverings-trigger for en frisk aktør. Pakke 1 (front-halvdel) byggede **maskineriet** (kontrakter a–m, validatorer, `roller.json`, S4 start-kæde-checker) men IKKE **på-rampen**: den committede instruks en frisk aktør læser for at genkende `qwers`, loade sin workflow-rolle og åbne kæden. De eneste `qwers`-definitioner i repoet peger på det døde V5-lag.

### Evidens (reproducerbar mod `origin/main` @ `97a650d`)

1. Frisk Code-session auto-læser `CLAUDE.md` → den siger kun: "Læs `docs/LÆSEFØLGE.md` ved de fem triggere."
2. `docs/LÆSEFØLGE.md`s fem triggere er: (1) ny session, (2) ny plan-runde, (3) Codex-review-runde, (4) implementation starter, (5) slut-rapport. **Ingen er `qwers`.** Procedure-docsene inkluderer `docs/strategi/disciplin.md` (V5, "lukket som mislykket") + `docs/coordination/aktiv-plan.md` (peger på V5-flowet).
3. `qwers` er defineret KUN i dødt/superseded kontekst: `docs/claude-ai/SKILL.md:17,36` → `disciplin.md §9.1` (V5); `docs/coordination/aktiv-plan.md:11` ("Step 0 … qwers") → V5-flow; `gov-5-automation-*` + `arkiv/` (V5-æraens kæde-automatik).
4. Code-rollen har INGEN aktiverings-adapter. Claude.ai har `docs/claude-ai/SKILL.md`; Code har intet, som en frisk Claude Code-session læser, der tænder workflow-rollen på `qwers`.

### Rod

Front-halvdelen leverede rolle-DEFINITIONER (`roller.json`) + start-kæde-VALIDATOR (S4) — men ikke den aktør-vendte AKTIVERING. `S16`/`R10` udskød eksplicit den konkrete deklarative/eksterne aktiverings-mekanisme (K9: "`qwers` → kører af sig selv … ikke kun manuel GUI") til **build-recon** → Plan 2. Fundet er altså konsistent med planen: aktiverings-laget ER det udskudte stykke; den rene test gjorde det konkret.

### Plan-2-byggekrav

- **A — Code-workflow-aktiverings-adapter:** sidestykke til `claude-ai/SKILL.md`. En frisk Code-session læser den (via `CLAUDE.md`/`LÆSEFØLGE`) og ved på `qwers`: _du er Code-workflow-aktøren; læs `workflow/regelflade.md` + `roller.json`; åbn kæden (S4); konsolidér recon (S6); fremlæg krav-oplæg._ (Bootstrap: Code = midlertidig orkestrator; færdig: runneren ejer orkestreringen — S16 flow-orkestrering.)
- **B — Wire `qwers` ind i auto-læse-stien:** `CLAUDE.md`/`LÆSEFØLGE` skal route `qwers` (+ `qwers <pakke>`) til aktiverings-adapteren, så en frisk aktør genkender den (fx `qwers` som eksplicit trigger/sektion).
- **C — Repoint `claude-ai/SKILL.md`** fra døde `disciplin §9.1` til det nye workflow (`workflow/regelflade.md` + `roller.json`).
- **D — Deklarativ/ekstern aktivering (K9, S16):** committed config / `qwers`-trigger, ikke manuel GUI pr. session; Claude.ai's konkrete app-mekanisme (connector-config / deep-link / headless) afgøres i Plan-2 build-recon (Claude.ai's flade).
- **E — Ryd døde `qwers`-referencer** (aktiv-plan Step 0 → V5-flow; SKILL → `disciplin §9.1`) så der ikke er konkurrerende/døde aktiverings-sandheder (krav 8: én aktiv sandhed pr. emne).

### Codex' valideringskriterium (senere, ved Plan-2-byg)

Acceptance = den ren-test der netop fejlede skal nu **bestå**:

- **POSITIV:** frisk aktør (ren kontekst + ren udcheckning af `main`) + `qwers` → kæden åbnes, aktøren loader workflow-rollen, recon-konsolidering (S6) starter, krav-oplæg fremlægges. Ingen forhåndsviden om byg krævet.
- **NEGATIV (K9-kanariefugle):** GUI-kun / manuel-relay-aktivering → FAIL; `qwers` route'r til dødt V5-lag → FAIL; aktør uden adapter → FAIL.

Dette instantierer S16/S14-acceptance (ekstern aktiverbar kanal; manuel relay tæller aldrig som færdig løsning).
