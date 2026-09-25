# scripts/

| Script / mappe       | Formål                                                                                            | Aktiveres              |
| -------------------- | ------------------------------------------------------------------------------------------------- | ---------------------- |
| `types-gen.sh`       | Genererer `packages/types/src/database.ts` for `public,core_identity,core_compliance,core_money`. | `pnpm types:generate`  |
| `migration-gate.mjs` | Hver kolonne i en migration skal have en klassifikations-række; strict i CI.                      | `pnpm migration:check` |
| `fitness.mjs`        | Arkitektoniske invarianter på tværs af repoet og databasen.                                       | `pnpm fitness`         |
| `run-db-tests.mjs`   | Kører `supabase/tests/` mod databasen.                                                            | `pnpm db:test`         |
| `v5/`                | Workflowets værktøjer (se nedenfor).                                                              | `pnpm v5:selftest`     |

## scripts/v5/

| Fil                                               | Formål                                                                                                                                                   |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `byggetjek.mjs`                                   | Byggetjekket og slutdommen i CI: bindingerne (krav, ½-side, plan, målelag), tests og mutanter for alle pakker, slutprøven, og `slut ok` for pakke-PR'er. |
| `sandhed-vagt.mjs`                                | Afviser ændringer i vision, forretningsforståelse, masterplan, `disciplin.md` og rolleteksterne uden Mathias' godkendelse i ledgeren.                    |
| `hooks.mjs`                                       | Hvem må skrive hvad (roller og zoner); bruges af `pre-commit-zone.mjs`.                                                                                  |
| `test-runner.mjs`                                 | Kører en pakkes tests og mutanter mod testdatabasen (`forvent.mjs`: sammenligning af forventet og observeret).                                           |
| `pg-runner.mjs`                                   | Kalder databasen og PostgREST og tolker fejl entydigt.                                                                                                   |
| `forventnings-manifest.mjs`, `angrebs-indeks.mjs` | Validerer manifestet og testindekset.                                                                                                                    |
| `codex-run.sh`                                    | Den eneste vej til Codex: privat Codex-hjem, netværk fra, kun-læse ved domme.                                                                            |
| `roller/`                                         | Rolleteksterne.                                                                                                                                          |
| `<pakke>/`                                        | Pakkens tests (Codex' målelag).                                                                                                                          |

## Testdatabasen

Byggetjekket kører alle migrationer på en tom Supabase-Postgres med styret klokke (start `@2026-04-01 00:00:00`; testene flytter uret fremad). DB-testene i `supabase/tests/` kører i et eget CI-job på en tom database med rigtig tid. To test-brugere indsættes i `auth.users` først (migrationen `t1_bootstrap_admins` peger på dem), og én oprydnings-migration, der kræver data fra driften, springes over — kun præcis den godkendte blob.

## Fitness checks

Tilføj en ny check: implementér en async function i `scripts/fitness.mjs`, der returnerer `{ name, violations: string[] }`, og push den til `checks`-arrayet nederst i filen.
