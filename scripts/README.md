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

## Formater

Hooken, vagten og byggetjekket læser filerne sådan. Fabrikken giver afsnittet til rollen sammen med rolleteksten. Tjek bindingerne før commit med `node scripts/v5/byggetjek.mjs --kun-bindinger`.

- **Ledger-række** (`docs/sandhed/mathias-ord.md`, kun nye rækker): `| M-n | ÅÅÅÅ-MM-DD | »hans ord ordret« | hvad han svarede på / godkender |`. Hans ord er en godkendelse, når citatet er netop `ja`, `ok`, `krav ok`, `plan ok` eller `slut ok` (evt. med et punktnummer foran som svar på et nummereret spørgsmål, fx `1. ja`, og med `tak` og punktum) eller `ok til planen`. Svarer han med flere ord, beder rollen om det rene ord. En fil bindes som `<fil> → blob <mindst 12 tegn>`; flere adskilles med `·`. Sletning: `<fil>, <fil> slettes` i sit eget afsnit.
  - `krav ok`: `<pakke>-krav.md → blob <krav-udkastets blob>`
  - `plan ok`: `plan-build/<pakke>/plan.md → blob <planens blob>` — fuld sti; ½-siden i den blob er den godkendte
  - `slut ok`: `plan-build/<pakke>/slut-rapport.md → blob <…> · commit <prøvet commit> · <dokument> → blob <ny blob> …`
  - ændring i vision, forretningsforståelse, masterplan, `disciplin.md` eller en rolletekst: `<fil> → blob <ny blob>`
- **`codex-plan.md`:** linjen `dom: grøn` (eller `dom: rød` med fund) og `plan.md → blob <planens blob>`.
- **`daekningsdom.json`:** `{"dom": "grøn", "krav": "<kravets blob, 40 tegn>", "plan": "<planens blob, 40 tegn>", "filer": {"<sti>": "<blob, 40 tegn>", …}}`. `filer` binder mindst `forventnings-manifest.json`, `angrebs-spec.json`, `prover.json` og `slutproeve.json` i `plan-build/<pakke>/`, hver fil under `scripts/v5/<pakke>/` og hver målelagsfil, som pakkens PR ændrer uden for pakken (en lukket pakkes tests, `supabase/tests/`); en slettet fil står med `null`.
- **`prover.json`:** `{"cmd": ["node", "scripts/v5/<pakke>/prover-run.mjs"], "resultRelPath": "plan-build/<pakke>/prover-result.json"}`; resultatet er `{"total", "passed", "failed", "skipped"}`.
- **`slutproeve.json`:** som testindekset (`schema_version: 2`, `pakke`, `tests: [{id, file, oid, covers}]`) med mindst ét scenarie og `mutants: []`. `bids` (D12) kun når manifestet har `effekt_bid`.
- **`codex-gennemgang.md`:** `commit <det læste commit>` og merge-dommen på sin egen linje. En dom køres på en ren checkout; indpakningen sender det læste commit med.
- **`slut-rapport.md`:** skabelonen i `disciplin.md` §10.3: `**Prøvet kodeversion:** commit <sha>` og tabellen under `## Rettelser i Mathias' dokumenter` (dokumentet i første kolonne, den forventede blob i sidste). Kun dokumenter under `docs/` kan rettes med `slut ok`.

## Testdatabasen

Byggetjekket kører alle migrationer på en tom Supabase-Postgres med styret klokke (start `@2026-04-01 00:00:00`; testene flytter uret fremad). PostgREST kører mod samme database; testenes tokens bærer ingen tid, så databasens klokke er den eneste i systemet under test. Aktørkald går over login-rollen `v5_aktoer`, der kun er medlem af `authenticated` og `anon`, så en test ikke kan skifte til en rolle med bypass; ejerforbindelsen (`postgres`) bruges kun til setup og observation. DB-testene i `supabase/tests/` kører i et eget CI-job på en tom database med rigtig tid. To test-brugere indsættes i `auth.users` først (migrationen `t1_bootstrap_admins` peger på dem), og én oprydnings-migration, der kræver data fra driften, springes over — kun præcis den godkendte blob.

## Fitness checks

Tilføj en ny check: implementér en async function i `scripts/fitness.mjs`, der returnerer `{ name, violations: string[] }`, og push den til `checks`-arrayet nederst i filen.

Katalog-tjekkene sammenligner repoet med databasen. De kører med `--kandidat` mod testdatabasen med PR'ens migrationer (byggetjek-jobbet, `FITNESS_DATABASE_URL`); resten kører i governance-jobbet, som også tjekker driftens data og OpenAPI-eksponering. En pakkes nye poster i listerne (fx `SECDEF_SANCTIONED`, `T9_RPCS`) skriver fabrikken ind efter planen.
