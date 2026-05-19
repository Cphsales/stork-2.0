# Codex review — T9-supplement PR #44 runde 2

**Review-type:** PR code review
**PR:** #44
**Branch:** `claude/T9-supplement-build`
**Head reviewet:** `3cf5013`
**Resultat:** APPROVAL

## Vurdering

Code's runde-2 commit adresserer de 6 fund fra runde 1 på kode-niveau.

- KRITISK 1 lukket: `permission_elements_read()`, `role_permissions_read(uuid)` og `pending_changes_read()` bevarer Step 9 `RETURNS TABLE`-signaturerne. Supplementet tilføjer kun gate/logik i function body, så `CREATE OR REPLACE FUNCTION` kan applye uden return-type-fejl.
- KRITISK 2 lukket: `t9_backdated_historical_traversal.sql` bruger direkte tabelassertions for handler-state i stedet for auth-gated read-RPCs.
- MELLEM 1 håndteret: coverage er udvidet med `_apply_org_node_upsert`, `_apply_team_close` og team-retype invariant b i `t9_org_nodes.sql`.
- MELLEM 2 håndteret: `t9_read_gates.sql` tester nu no-permission path med fake JWT, admin-only 42501 og visibility-empty, samt superadmin success path.
- MELLEM 3 håndteret som teknisk gæld: G054 dokumenterer at type-codegen er blokeret af Dashboard/PostgREST exposure og beskriver konkret follow-up.
- MELLEM 4 lukket: `postgrest-t9-schema-exposure` har ikke længere `soft: true` på error paths.

Ingen nye KRITISK eller MELLEM kodefund.

## Verifikation

- `pnpm migration:check` — exit 0.
- `pnpm types:check` — exit 0, med forventet placeholder-skip indtil G054 lukkes.
- `pnpm fitness` — exit 1 på `postgrest-t9-schema-exposure` med PGRST202 for `org_tree_read`. Det matcher PR'ens forventede blocker indtil Mathias eksponerer `core_identity` i Dashboard.
- GitHub CI fejler samme sted: `Fitness functions` → `postgrest-t9-schema-exposure`. Tidligere CI-steps nåede fitness, så formattering/lint/typecheck/build/migration-gate passerede på CI.

## Note

Lokal `pnpm format:check` fejler kun på untracked temp-filer uden for PR-diffet (`~$...` / lokal Claude.ai approval-fil). Det er ikke et PR #44-fund.
