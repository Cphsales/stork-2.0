# Supabase — Stork 2.0

Backend lever på et selvstændigt Supabase B-projekt
(`imtxvrymaqbgcvsarlib`, Region: West EU (Ireland)).
PostgreSQL 17. Tom database — migrations ankommer i lag B/C.

## Toolchain

Supabase CLI er pinned som workspace devDep i root `package.json`
og kører via `pnpm exec supabase ...` på enhver dev-maskine.

```bash
pnpm install                          # installerer CLI binær
pnpm exec supabase --version          # ≥ 2.98.2
```

Build-script-allowlist håndteres af `pnpm.onlyBuiltDependencies` i
root `package.json` (pnpm 10 kører ikke postinstall by default).

## Konfiguration

`supabase/config.toml` indeholder hele standard-skemaet
genereret af `supabase init`, med `project_id` overskrevet til
`imtxvrymaqbgcvsarlib`. Felter med deres default-værdier er
explicit committet så ændringer fremover er synlige i diff.

## Link til remote

`project_id` i `config.toml` ER linket. Når CLI-kommandoer
køres i denne mappe, kobler de til remote-projektet automatisk.

For at autorisere CLI mod remote (kræves for migrations + push):

```bash
# Engangsskridt pr. dev-maskine:
pnpm exec supabase login              # åbner browser → access token
pnpm exec supabase link --project-ref imtxvrymaqbgcvsarlib
pnpm exec supabase status             # verificerer linket
```

`supabase/.temp/` (gitignored) holder access-token-cachen.

## Almindelige kommandoer

| Kommando                                           | Effekt                                                                                                         |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `pnpm exec supabase start`                         | Starter lokal Supabase-stak (Postgres, GoTrue, Storage, Realtime, Studio) på portene defineret i `config.toml` |
| `pnpm exec supabase stop`                          | Stopper lokal stak                                                                                             |
| `pnpm exec supabase status`                        | Viser status + URLs for lokal stak + link til remote                                                           |
| `pnpm exec supabase db reset`                      | Reset lokal DB, anvender migrations + seed.sql                                                                 |
| `pnpm exec supabase migration new <name>`          | Opretter ny migration-fil i `supabase/migrations/`                                                             |
| `pnpm exec supabase db push`                       | Push migrations til remote                                                                                     |
| `pnpm exec supabase db pull`                       | Pull schema-ændringer fra remote til ny migration                                                              |
| `pnpm exec supabase functions deploy <name>`       | Deploy edge function                                                                                           |
| `pnpm exec supabase gen types typescript --linked` | Generér TS-typer fra remote schema                                                                             |

## Migration-disciplin

Migrations lever i `supabase/migrations/`. Filnavnskonvention:
`<timestamp>_<beskrivelse>.sql`.

### Migration-gate

`scripts/migration-gate.mjs` parser hver migration, finder kolonner
fra `CREATE TABLE` og `ALTER TABLE ADD COLUMN`, og tjekker dem mod
`supabase/classification.json`.

**Phase 1 (lag B-D, default):** uklassificerede kolonner giver
`::warning::` i CI men blokerer ikke merge.

**Phase 2 (efter lag D):** samme tjek, men som `::error::` der
fejler CI. Aktiveres via `MIGRATION_GATE_STRICT=true` env var i CI.

```bash
pnpm migration:check                           # Phase 1
MIGRATION_GATE_STRICT=true pnpm migration:check # Phase 2 simulation
```

### Klassifikations-registry

`supabase/classification.json` er Phase 1's enkle registry:

```json
{
  "columns": {
    "public.tablename.columnname": {}
  }
}
```

I Phase 1 tæller eksistens af nøglen som "klassificeret".
Lag D introducerer skemaet (pii_level, retention_type osv.) som
hver indgang skal opfylde, og flytter registryet til en DB-tabel.

## Database-typer + schema-snapshot

Begge bygger på `supabase --linked`. Engangs-setup per dev-maskine:

```bash
pnpm exec supabase login          # browser-auth, gemmer access token
pnpm supabase:link                # link til imtxvrymaqbgcvsarlib via config.toml
```

CI har `SUPABASE_ACCESS_TOKEN`-secret sat på repo'et — link sker
automatisk i workflow før drift-checks kører.

### Types — packages/types/src/database.ts

```bash
pnpm types:generate   # regenerér fra remote schema → packages/types/src/database.ts
pnpm types:check      # CI-check: drift → exit 1
```

Placeholder-Database-typen blev pre-genereret i B1. Når første
migration lander, kør `pnpm types:generate` lokalt og commit.

### Schema-snapshot — supabase/schema.sql

```bash
pnpm schema:pull      # supabase db dump --linked --schema public → supabase/schema.sql
pnpm schema:check     # CI-check: drift → exit 1
```

Snapshot er strukturel ground truth (DDL, ingen data). Når
migrations lander på remote, kør `pnpm schema:pull` lokalt og commit.

Indtil første pull er filen en placeholder med marker — CI's
schema drift check springer over til filen er populated. Det betyder
første migration's PR SKAL include en opdateret schema.sql.

## Edge functions

Edge functions lever i `supabase/functions/<name>/index.ts`. Lag B
introducerer skabelon + disciplin (Deno-runtime, error-handling,
audit-integration).
