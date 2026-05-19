# Workflow-skabelon — Stork 2.0

Operationel reference for hvordan en pakke kører gennem systemet fra Mathias' intention til pakkens lukning.

Strategi-grundlaget (hvorfor flowet ser sådan ud) står i [`docs/strategi/arbejdsmetode-og-repo-struktur.md`](../strategi/arbejdsmetode-og-repo-struktur.md). Denne fil beskriver **hvordan** — step-by-step, hvem gør hvad, hvilke filer, hvilke loops, hvilke tooling-disciplinregler.

---

## 7-step flow

```
┌──────────────────────────────────────────────────────────────┐
│ 0. DATA-GRUNDLAG (kan skippes — se skip-kriterier)           │
│    Mathias rejser emne → alle aktører briefes                │
│    Kontekst-indsamling fra master-plan, teknisk-gaeld,       │
│    bygge-status, mathias-afgoerelser                         │
│    Output: <pakke>-data-grundlag.md                          │
└────────────────────────────┬─────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────┐
│ 1. KRAV-FASE                                                 │
│    Mathias + Claude.ai → krav-dok (forretnings-tanke)        │
│    Output: <pakke>-krav-og-data.md                           │
└────────────────────────────┬─────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. KRAV-AFKLAR                                               │
│    Code + Codex læser krav-dok → afklarende spørgsmål        │
│    → ACCEPT (buildable) eller AFVIS (revid krav)             │
│    Output: <pakke>-krav-afklaring.md                         │
└──────────┬───────────────────────────┬───────────────────────┘
           │ AFVIS                     │ ACCEPT
           ▼                           ▼
   ┌───────────────┐         ┌──────────────────────────────┐
   │ → step 1      │         │ 3. PLAN-FASE                 │
   │ (revid krav)  │         │    Code + Codex iter (max 7) │
   └───────────────┘         │    PUSHBACK + REQUEST-RAAD   │
                             │    Iteration 8+ → Mathias    │
                             │    Krav-fejl opdaget → step 1│
                             │    Output: <pakke>-plan.md   │
                             └──────────────┬───────────────┘
                                            ▼ (ÉN færdig plan)
                             ┌──────────────────────────────┐
                             │ 4. APPROVAL-FASE             │
                             │    Mathias + Claude.ai       │
                             │    → godkend / afvis plan    │
                             └──────┬─────────────┬─────────┘
                                    │ AFVIS       │ GODKEND
                                    ▼             ▼
                            ┌───────────────┐   ┌──────────────────────────┐
                            │ → step 3 (V2) │   │ 5. BUILD-FASE            │
                            └───────────────┘   │    Code bygger,          │
                                                │    Codex valider (runder)│
                                                │    Output: PR + commits  │
                                                └──────────────┬───────────┘
                                                               ▼
                                                ┌──────────────────────────┐
                                                │ 6. SLUT-RAPPORT + LUK    │
                                                │    Code skriver,         │
                                                │    Codex + Claude.ai     │
                                                │    validerer             │
                                                │    Mathias lukker pakken │
                                                │    Output: rapport-      │
                                                │    historik/<dato>-      │
                                                │    <pakke>.md            │
                                                └──────────────────────────┘
```

---

## Aktører + ansvar pr. step

| Step | Aktør(er)                               | Output                                 | Skabelon                                                                   |
| ---- | --------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------- |
| 0    | Mathias initierer, alle aktører briefes | `<pakke>-data-grundlag.md`             | —                                                                          |
| 1    | Mathias + Claude.ai                     | `<pakke>-krav-og-data.md`              | [`forretningsspoergsmaal-skabelon.md`](forretningsspoergsmaal-skabelon.md) |
| 2    | Code + Codex                            | `<pakke>-krav-afklaring.md`            | —                                                                          |
| 3    | Code + Codex (iterativt)                | `<pakke>-plan.md`                      | [`plan-skabelon.md`](plan-skabelon.md)                                     |
| 4    | Mathias + Claude.ai                     | Godkendelse i `mathias-afgoerelser.md` | —                                                                          |
| 5    | Code bygger, Codex validerer            | PR + commits + codex-review-filer      | [`codex-review-prompt.md`](codex-review-prompt.md)                         |
| 6    | Code + Codex + Claude.ai + Mathias      | `rapport-historik/<dato>-<pakke>.md`   | [`rapport-skabelon.md`](rapport-skabelon.md)                               |

---

## Loops + meta-regel

### Loops

| Loop        | Trigger                           | Til                 |
| ----------- | --------------------------------- | ------------------- |
| 2 → 1       | Krav ikke buildable (AFVIS)       | step 1 (revid krav) |
| 3 → 1       | Krav-fejl opdaget midt i plan     | step 1 (revid krav) |
| 3 → Mathias | Plan-iteration 8+ uden konvergens | Eskalation          |
| 4 → 3       | Plan ikke godkendt (AFVIS)        | step 3 (V2)         |

### Meta-regel: `STOP-FOR-CLARIFICATION`

Kan rejses i ETHVERT step af enhver aktør:

```
STOP-FOR-CLARIFICATION: <hvad skal afklares>
```

Flow pauser → mål-part (Mathias / Claude.ai / Codex) svarer → flow fortsætter fra samme step. Brug ved "filling-in-the-blanks"-risiko.

---

## Skip-kriterier for step 0

Step 0 (DATA-GRUNDLAG) er IKKE obligatorisk. Skip når:

- **Mikro-pakker** (PR direkte uden plan-runde — typo-fix, doc-rettelse, oprydning under 100 linjer)
- **Hot-fix-pakker** med klar rod-årsag og ingen tvivl om kontekst
- **Pakker hvor data-grundlaget er etableret af forrige pakke** (samme session, samme dag, samme tema)

Beslutning om at skippe dokumenteres med én linje i krav-dok's åbnings-sektion:

```markdown
> Step 0 skippet — mikro-pakke / hot-fix / kontekst etableret i [reference]
```

---

## Trigger-format under runder (step 3 og 5)

Ved review-runder kan Code, Codex eller Claude.ai bruge:

```
REQUEST-RAAD Mathias: <funktions-spørgsmål>
REQUEST-RAAD Claude.ai: <forretnings-spørgsmål>
REQUEST-RAAD Codex: <kode-spørgsmål>
REQUEST-RAAD CONTEXT: <hvad-skal-tjekkes i repo>
```

Scriptet (`scripts/codex-review.sh` eller manuel proces) dispatcher konsultationen. Svar gemmes som `<review-fil>-konsultationer.md` og injiceres i næste runde-prompt.

### PUSHBACK-format (Code's svar på Codex-fund)

Per fund i Codex' review-runde svarer Code:

| Klasse   | Begrundelse                                                                                        |
| -------- | -------------------------------------------------------------------------------------------------- |
| ACCEPT   | Fund er korrekt → fix i næste commit                                                               |
| DEFER    | Fund er gyldig men ikke-blokerende → G-nummer                                                      |
| PUSHBACK | Fund er ikke gyldig (premature optimization, scope-overskridelse, modsiger disciplin) → argumenter |

Codex kan acceptere PUSHBACK eller eskalere til Mathias.

---

## Filer pr. pakke

Forventet filsæt for en pakke kaldet `<pakke>`:

| Fil                                                           | Step | Vedligeholdes af           |
| ------------------------------------------------------------- | ---- | -------------------------- |
| `docs/coordination/<pakke>-data-grundlag.md`                  | 0    | Auto (script)              |
| `docs/coordination/<pakke>-krav-og-data.md`                   | 1    | Mathias + Claude.ai        |
| `docs/coordination/<pakke>-krav-afklaring.md`                 | 2    | Code + Codex               |
| `docs/coordination/<pakke>-plan.md`                           | 3    | Code (V1-Vn)               |
| `docs/coordination/plan-feedback/<pakke>-V<N>-codex.md`       | 3    | Auto via `codex-review.sh` |
| `docs/coordination/plan-feedback/<pakke>-V<N>-claude-ai.md`   | 4    | Mathias paster fra web     |
| `docs/coordination/codex-reviews/<dato>-<pakke>-runde-<N>.md` | 5    | Auto via `codex-review.sh` |
| `docs/coordination/rapport-historik/<dato>-<pakke>.md`        | 6    | Code                       |

Ved pakke-lukning (efter step 6) flyttes plan + krav-og-data + V1-Vn plan-feedback til `docs/coordination/arkiv/` med prefix `<pakke>-*`.

---

## Tooling-disciplin

Læringer fra workflow-test (2026-05-19). Skal følges af scripts der wrapper Codex CLI.

### 1. `fast_mode` er obligatorisk

```bash
codex exec --enable fast_mode ...
```

Uden `fast_mode` kan codex hænge 30+ min på selv simple prompts. Med `fast_mode`: trivielle prompts ~10s, store reviews 5-10 min. Default i `~/.codex/config.toml` er ikke nok — eksplicit `--enable fast_mode` i scripts.

### 2. `model_reasoning_effort="xhigh"` for review-runder

```bash
codex exec -c 'model_reasoning_effort="xhigh"' ...
```

Combineret med `fast_mode` giver det dybde uden hang.

### 3. File-reference > embedded content i prompts

**Forkert:**

```bash
codex exec "$(cat large-file.md)\n\nValider denne plan..."
```

**Rigtigt:**

```bash
codex exec "Læs /path/to/large-file.md. Valider planen..."
```

Codex læser selv hurtigere end at parse store embedded-prompts. Streaming-events arriver tidligere.

### 4. Non-json mode for live progress på store reviews

`--json` batcher events til slut når reasoning er tung. For live-feedback brug standard output mode + `tail -F` + grep mod kendte markers:

```bash
tail -F output.txt | grep --line-buffered -E '^(exec|codex| succeeded| failed|KRITISK|MELLEM|LAV|APPROVAL|FEEDBACK)'
```

### 5. Hard timeout-wrapper er essentielt

```bash
timeout --signal=KILL 480 codex exec ...
```

Garanterer deterministisk worst-case. Uden det kan codex køre 30+ min uden output. Foreslået default: 480s (8 min) for plan-reviews, 600s (10 min) for slut-rapport-reviews.

### 6. Codex' grundighed → token-budget

Codex læser typisk 8-10 filer i en dyb runde før den giver fund. Forventet token-budget:

- Runde 1 (initial review): ~70-90k tokens
- Runde 2 (verifikation efter V2): ~80-100k tokens
- Runde 3 (approval-konfirmering): ~25-30k tokens

### 7. Konvergens typisk i 3 runder

V1 → V2 → V3 = approval er det forventede mønster. **7-iter cap er rigelig margin.** Lag 1's workflow-stabilisering selv ramte V5.1 (6 plan-versioner) før APPROVAL — det er øvre normal-grænse for kompleks workflow-design. Hvis runde 8+ stadig viser KRITISK-fund: eskaler til Mathias (workflow-loop fra step 3 → Mathias).

### 8. Niveau 3-protokol — runde-afhængige stop-betingelser

| Runde | Stop-betingelse                           |
| ----- | ----------------------------------------- |
| 1     | Alle fund vurderes                        |
| 2     | Kun HØJ/KRITISK stopper; MELLEM → G-numre |
| 3     | Kun KRITISK stopper; LAV/MELLEM → G-numre |

### 9. Trigger-system er klar men sjældent brugt

PUSHBACK, REQUEST-RAAD, STOP-FOR-CLARIFICATION blev IKKE brugt i workflow-stabilisering-testen (alle fund var simple ACCEPTs). Mekanismen er **tilgængelig når fund er kontroversielle**, ikke obligatorisk.

---

## Konvergens-eksempel — workflow-stabilisering Lag 1 (2026-05-19)

| Runde | Plan-version | Fund                 | Code's svar | Tokens |
| ----- | ------------ | -------------------- | ----------- | ------ |
| 1     | V1           | 2 KRITISK + 2 MELLEM | Alle ACCEPT | ~70k   |
| 2     | V2           | 3 LAV                | Alle ACCEPT | ~83k   |
| 3     | V3           | APPROVAL             | —           | ~27k   |

Total: 3 runder, ~180k tokens, ~25-30 min wallclock med `xhigh + fast_mode`.

---

**Sidste opdatering:** 2026-05-19 — etablering af workflow-skabelon efter Lag 1 workflow-stabilisering V3 approval.
