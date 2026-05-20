# PR #42 merge-plan — Code's forensiske analyse

## Kontekst

PR #42 ("Disciplin: output-kvalitets-pakke") fra Mathias selv (18. maj 2026) har stået åben siden FØR Lag 1's PR #48-#50. Indholdet er fundament-disciplin (forretningsspoergsmaal-fase, krav-dok-disciplin, fire-dokument-disciplin) som Lag 1's workflow-skabelon refererer.

Specifikt: `docs/skabeloner/forretningsspoergsmaal-skabelon.md` er ny fil i PR #42 og refereret af Lag 1's `workflow-skabelon.md` — pt. brudt link på main.

## 4 commits i PR #42

| Commit    | Tidspunkt  | Hvad                                                                                                                                             | Status                                                        |
| --------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| `2cab851` | 18/5 20:49 | Stor commit: introducerer tre-rolle-struktur + forretningsspoergsmaal-fase + krav-dok-disciplin + ny skabelon-fil + arbejds-disciplin-udvidelser | Indhold værdifuldt, men tre-rolle blev fortrudt 24 min senere |
| `7fbf984` | 18/5 20:51 | Slet MS Office lock-fil + .gitignore for `~$*.md`                                                                                                | Lock-fil findes ikke længere; .gitignore-entry stadig nyttig  |
| `4a9f329` | 18/5 21:13 | FJERN "Tre Claude.ai-roller" sektion ("roller er implicit per chat")                                                                             | Mathias' egen fortrydelse — DROP tre-rolle-struktur           |
| `88b4457` | 18/5 21:22 | qwers triggerer Filesystem-MCP-læsning                                                                                                           | REDUNDANT — Lag 1 har samme indhold på main allerede          |

## Code's merge-plan (10 filer)

| Fil                                                        | Aktion                                                                                                                                          | Begrundelse                                                                             |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `docs/skabeloner/forretningsspoergsmaal-skabelon.md` (NY)  | Tilføj verbatim fra 2cab851                                                                                                                     | Lag 1 refererer den; brudt link på main                                                 |
| `docs/coordination/mathias-afgoerelser.md`                 | Append 2 entries fra 2cab851 (2026-05-18-entries)                                                                                               | Append-only-log; ingen overlap med Lag 1                                                |
| `.gitignore`                                               | Tilføj `~$*.md` linje fra 7fbf984                                                                                                               | Forhindrer fremtidige Office-lock-filer                                                 |
| `docs/skabeloner/plan-skabelon.md`                         | Merge: PR #42's "Fundament-tjek-passeret"-sektion + step-detalje-format + Lag 1's V5.3 build-fase + optimering                                  | Begge tilføjer parallelle sektioner                                                     |
| `docs/coordination/overvaagning/codex-overvaagning.md`     | Merge: PR #42's OPGRADERING-detalje + Lag 1's svar-typer                                                                                        | Komplementære additions                                                                 |
| `docs/coordination/overvaagning/code-overvaagning.md`      | Merge: PR #42's qwerg-protokol-uddybning + Lag 1's svar-typer                                                                                   | Komplementære additions                                                                 |
| `docs/skabeloner/codex-review-prompt.md`                   | Merge: PR #42's +13 linjer + Lag 1's marker-protokol-udvidelse                                                                                  | Lag 1 har omskrevet niveau 1-prefix; PR #42 har +13 linjer der måske allerede er dækket |
| `docs/strategi/arbejds-disciplin.md`                       | Merge: PR #42's +94 linjer fire-dokument-disciplin + Lag 1's spm 5 (halt-marker-tjek)                                                           | Begge er udvidelser                                                                     |
| `docs/strategi/arbejdsmetode-og-repo-struktur.md`          | Merge: PR #42's +70 linjer flow-disciplin + Lag 1's workflow-skabelon-reference                                                                 | Begge er udvidelser                                                                     |
| `docs/coordination/overvaagning/claude-ai-overvaagning.md` | Merge: PR #42's 3 nye sektioner (forretningsspoergsmaal-fase + krav-dok-skrivnings-disciplin + krav-dok-review-rolle) + Lag 1's Cadence-sektion | STØRSTE MERGE                                                                           |

## Hvad Code DROPPER fra PR #42

| Indhold                                  | Grund                                     |
| ---------------------------------------- | ----------------------------------------- |
| Tre Claude.ai-roller-sektion (i 2cab851) | Mathias selv fortrød (commit 4a9f329)     |
| qwers-Filesystem-MCP ændring (88b4457)   | Allerede i Lag 1's claude-ai-overvaagning |
| Lock-fil slet (i 7fbf984)                | Filen findes ikke længere                 |

## Estimat

1-2 timer for komplet manuel merge. Resultat: clean PR der bringer hele PR #42's værdi ind uden at overskrive Lag 1.

## Spørgsmål til Codex

1. **Forensisk analyse korrekt?** Har Code identificeret de rigtige 4 commits og deres effektive netto-effekt?
2. **Drop-beslutninger sundne?** Specielt: er det rigtigt at droppe `88b4457` (qwers-Filesystem-MCP) som "redundant"? Tjek main's `claude-ai-overvaagning.md` mod 88b4457's diff.
3. **Merge-prioritering rigtig?** Er der filer Code har misset eller hvor merge-rækkefølgen vil skabe konflikter?
4. **Konkrete fejl i merge-tabellen?** Misforstår Code en sektion?

Marker fund per V5.3:

- HUL: struktur-mangel
- KRITISK/MELLEM/LAV: tekniske fejl
- APPROVAL hvis plan er sund
