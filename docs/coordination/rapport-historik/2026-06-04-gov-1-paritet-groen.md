# gov-1-paritet-groen — Slut-rapport

**Dato:** 2026-06-04 · **Pakke:** gov-1-paritet-groen (1/6 i governance-vagt) · **Type:** migration-history-reconciliation
**Plan:** `docs/coordination/gov-1-paritet-groen-plan.md` (V3, Codex APPROVAL runde 3)
**Build:** registry-mutation mod live (ingen skema/data-ændring) + types-regen

## Formål (genfremlagt fra plan)

Bring repo og live-DB's migration-registre i overensstemmelse, så CI bliver grøn mod live — forudsætning for at gov-4 (branch protection) kan kræve CI-checks uden at bricke main. Retning: align registry → repo-stamps; orphan subsumeret. Live-skemaet blev IKKE ændret.

## Leverancer (mod plan)

| Leverance                        | Status | Evidens                                                                                                                   |
| -------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| Registry aligned til repo-stamps | ✓      | 24 repo-stamps applied, 25 old-remote reverted; `total=116, repo_present=24, oldremote_present=0`                         |
| `migration list` paritet         | ✓      | LOCAL == REMOTE for hele t9_supplement/t10/t9_supplement_2-batchen, ingen huller                                          |
| `db push --dry-run` ren          | ✓      | "Remote database is up to date" (fejlede før på 25 remote-only stamps)                                                    |
| types grøn                       | ✓      | `pnpm types:generate` regen fra live + commit; `types:check` exit 0 ("Types in sync") — fiksede `audit_log_2026_08`-drift |
| Orphan-håndtering                | ✓      | `102809` (null_guard) reverted; effekt subsumeret af repo `…000004` (NULL-guard bekræftet i live)                         |

## Verifikation — Step 0 pre-flight (objekt-manifest, §A)

14/14 PASS mod live (read-only) FØR mutation. Inkl. alle Codex-flaggede: ADD COLUMN `role_permission_grants.action_id` + `pending_changes.action_id` (begge m. FK→permission_actions), constraint `role_permission_grants_one_element`, FK `client_node_placements_client_id_fkey`, RLS enable+force på clients/client_field_definitions/permission_actions, `audit_filter_values` NULL-guard, bootstrap-superadmin `employees.role_id`-DML, legacy-removal-DML, permission_actions-policies, nøgle-RPC'er. **Hver migrations skema-effekt bekræftet i live → marking applied tabte intet.**

## Mutation — atomisk (Step 1-4)

Eksekveret som ÉN transaktion (DO-block): insert 24 → assert 0 repo-only pending → assert 25 old-remote til stede (resume-safety) → delete 25 → assert total=116. Alle asserts grønne, ingen exception. Pre-mutation byte-eksakt backup i `supabase_migrations.gov1_registry_backup` (117 rows) som rollback-kilde.

## Stork-invariant-tjek (§7)

| Invariant                    | Status | Evidens                                                                           |
| ---------------------------- | ------ | --------------------------------------------------------------------------------- |
| Vision-overholdelse          | ✓      | Tjener princip 1 (én sandhed pr. fakta): registry = repo, divergens elimineret    |
| Permission-matrix-konsistens | N/A    | Ingen RPC/RLS-ændring (registry-only)                                             |
| Audit-trigger-dækning        | N/A    | Ingen nye tabeller                                                                |
| Konfiguration-i-data         | N/A    | Ingen satser/lønarter rørt                                                        |
| End-to-end-flow virker       | ✓      | 5 gates grønne (manifest, migration list, dry-run, types, fitness+migration-gate) |
| Anonymisering-bevaring       | N/A    | Ingen data rørt — mutation kun på `supabase_migrations.schema_migrations`         |

## Plan-afvigelser

1. **Repair eksekveret som transaktionel SQL (DO-block), ikke sekventiel `supabase migration repair`-CLI.** Identisk registry-effekt (insert/delete på `schema_migrations`, jf. Supabase-docs), men atomisk → eliminerer fuldstændigt partial-failure-vinduet som Codex' KRITISK-fund #2 adresserede; Codex endossserede transaktionel delete+insert (runde 2 Q2). Teknisk implementerings-valg inden for plan-intentionen (§8.2). Ingen Mathias-gate vurderet nødvendig (effekt = godkendt plan; metode strengt sikrere).
2. **`db diff` (§C step 5 supplerende smoke-test) ikke kørt** — kræver shadow-DB (Docker) ikke tilgængelig i miljøet. Mitigeret: primær-gaten (objekt-manifest §A, 14/14) + `migration list` + `db push --dry-run` beviser paritet autoritativt uden db diff.

## G-numre rejst

- **G061** — §E comment-parity-residual: 2 `comment on`-labels fra PR-polish nåede aldrig live (`client_node_placements_client_id_fkey`-constraint + `permission_actions`-tabel). Rent kosmetisk (ingen skema/CI-effekt). Fix: opsamlings-migration (§E default). Ejer: Code. Deadline: før gov-4 (branch protection), så paritet er 100% når den håndhæves.
- **G062** — recurring types-drift fra månedlige audit-partitioner: `audit_log_<YYYY_MM>`-partitioner kan gen-introducere `types:check`-drift hver måned. Fix-kandidat: ekskludér partition-børn fra types-gen, eller auto-regen-cron. Ejer: Code. Deadline: senere gov-pakke.

## Konvergens-historie

| V   | Codex-fund                                                                  | Code-svar   | Outcome       |
| --- | --------------------------------------------------------------------------- | ----------- | ------------- |
| V1  | 3 KRITISK (db-diff-orakel, revert-rækkefølge, rollback-fidelity) + 2 MELLEM | alle ACCEPT | V2            |
| V2  | 2 KRITISK (manifest ufuldstændigt, dry-run-position)                        | alle ACCEPT | V3            |
| V3  | APPROVAL — ingen nye fund (runde 3)                                         | —           | qwerg → build |

Runde 3, inden for normalt leje (§3.4). To af Codex' KRITISK-fund (partial-failure-rækkefølge, rollback-fidelity) var reelle huller Code missede — lag-modellen fungerede.

## Vision-tjek

- Rigtig løsning eller workaround? **Rigtig.** Registry rettet til repo (sandheds-kilden), ikke repo bøjet til divergens. Live-skema urørt.
- Vision-styrkelser: princip 1 (én sandhed) — divergensen mellem to migration-registre er elimineret; fremtidig `db push` er deterministisk.
- Vision-svækkelser: ingen (G061-residual er kosmetisk + planlagt lukket).
- Konklusion: **forsvarligt.**

## Rollback-status

`supabase_migrations.gov1_registry_backup` (117 pre-repair rows) bevares indtil pakke-luk. Rollback = delete 24 applied + insert 25 fra backup (transaktioneret). Slettes ved pakke-luk (§4) når gov-1 er merged + stabil.
