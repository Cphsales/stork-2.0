# scripts/

Disciplin-mekanismer der køres lokalt og i CI.

| Script               | Formål                                                                                                             | Aktiveres              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| `types-check.sh`     | Drift-detection: generated Supabase-typer vs `packages/types/src/database.ts`. Skipper på `// PLACEHOLDER`-marker. | `pnpm types:check`     |
| `schema-check.sh`    | Drift-detection: remote schema vs `supabase/schema.sql`. Skipper på `-- PLACEHOLDER`-marker.                       | `pnpm schema:check`    |
| `migration-gate.mjs` | Phase 1: warner på uklassificerede kolonner. Phase 2 (`MIGRATION_GATE_STRICT=true`): blokerer.                     | `pnpm migration:check` |
| `fitness.mjs`        | Arkitektoniske invarianter på tværs af repo. Hver check er en function.                                            | `pnpm fitness`         |

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
