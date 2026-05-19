# scripts/

Disciplin-mekanismer der køres lokalt og i CI.

| Script                | Formål                                                                                                                                                                                                                               | Aktiveres                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `types-gen.sh`        | Type-codegen for eksponerede API-schemas (`public,core_identity,core_compliance,core_money`). `--write` regenererer `packages/types/src/database.ts`; `--check` verificerer drift mod remote. Schema-listen står ét sted i scriptet. | `pnpm types:generate` (write) / `pnpm types:check` (check) |
| `schema-check.sh`     | Drift-detection: remote schema vs `supabase/schema.sql`. Skipper på `-- PLACEHOLDER`-marker.                                                                                                                                         | `pnpm schema:check`                                        |
| `migration-gate.mjs`  | Phase 1: warner på uklassificerede kolonner. Phase 2 (`MIGRATION_GATE_STRICT=true`): blokerer.                                                                                                                                       | `pnpm migration:check`                                     |
| `fitness.mjs`         | Arkitektoniske invarianter på tværs af repo. Hver check er en function.                                                                                                                                                              | `pnpm fitness`                                             |
| `codex-review.sh`     | Codex CLI-wrapper for review-runder (V5.3 marker-protokol). xhigh+fast_mode default, hard timeout, marker-parser med exit-koder per routing-tabel.                                                                                   | `scripts/codex-review.sh <plan-fil> <runde-N>`             |
| `claude-ai-prompt.sh` | Genererer paste-pakke til Claude.ai-web for forretnings-review. Phase=plan eller phase=slut-rapport. Output til stdout (pipe til xclip eller fil).                                                                                   | `scripts/claude-ai-prompt.sh <plan-fil> <runde-N>`         |
| `krav-afklar.sh`      | Step 2 (KRAV-AFKLAR) i workflow-skabelon. Dispatcher Codex med "stil spørgsmål, ingen plan"-mode. Output: `<pakke>-krav-afklaring.md`.                                                                                               | `scripts/krav-afklar.sh <krav-dok-fil>`                    |
| `data-grundlag.sh`    | Step 0 (DATA-GRUNDLAG) — kontekst-indsamling før krav-fase. 3 sektioner (Code/Codex/Claude.ai). Skip-kriterier dokumenteret.                                                                                                         | `scripts/data-grundlag.sh <pakke-topic>`                   |

## Workflow-scripts (Lag 1)

`codex-review.sh`, `claude-ai-prompt.sh`, `krav-afklar.sh`, `data-grundlag.sh` implementerer V5.3 workflow-skabelon-spec. Se `docs/skabeloner/workflow-skabelon.md` for fuld marker-protokol + dialog-flow.

**Tooling-defaults (per workflow-test læringer 2026-05-19):**

- `--enable fast_mode` (obligatorisk — uden hænger codex 30+ min)
- `model_reasoning_effort="xhigh"` (default for review-runder)
- `timeout --signal=KILL` (480s default, 120s ved `--quick`)
- File-reference prompts (codex læser filer selv, hurtigere end embedded content)
- Non-json output (tail-friendly for live progress)

## Fitness checks (B4 starter-sæt)

| Check                        | Hvad fanger den                                                                   |
| ---------------------------- | --------------------------------------------------------------------------------- |
| `no-ts-ignore`               | Brug `@ts-expect-error` i stedet — den fanger når kommentaren bliver forældet     |
| `eslint-disable-justified`   | Hver `eslint-disable*` skal have `-- begrundelse` efter regelnavnet               |
| `migration-naming`           | `supabase/migrations/<14digits>_<snake_case>.sql`                                 |
| `workspace-boundaries`       | `packages/*` må ikke importere fra `@stork/web`. Afhængighedsretning er ensrettet |
| `no-hardcoded-supabase-urls` | Supabase-URLs skal komme fra env-variabel, ikke hardkodet i `apps/web/src/`       |

Tilføj en ny check: implementér en async function i `scripts/fitness.mjs`
der returnerer `{ name, violations: string[] }`, og push den til
`checks`-array'et nederst i filen.
