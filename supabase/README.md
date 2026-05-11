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
`<timestamp>_<beskrivelse>.sql`. Lag B introducerer migration-gate
der validerer hver migration mod klassifikations-skemaet før den
kan merges.

## Database-typer

TS-typer genereres fra remote schema og bor i
`packages/types/src/database.ts` (eksporteret som `Database`).

```bash
# Generér typer (kræver SUPABASE_ACCESS_TOKEN sat eller `supabase login`)
pnpm types:generate

# Drift-check (CI bruger denne — fejler hvis typer ikke matcher remote)
pnpm types:check
```

`packages/types/src/database.ts` er pre-fyldt med tomt
placeholder-skema. Når første migration lander og bliver pushet til
remote, kør `pnpm types:generate` lokalt og commit resultatet.

CI har et "Types drift check"-trin i `.github/workflows/ci.yml` der
kører kun hvis `SUPABASE_ACCESS_TOKEN`-secret er sat på repo'et.
Tilføj den via GitHub Settings → Secrets and variables → Actions.

## Edge functions

Edge functions lever i `supabase/functions/<name>/index.ts`. Lag B
introducerer skabelon + disciplin (Deno-runtime, error-handling,
audit-integration).
