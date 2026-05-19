# Codex review — T9-supplement PR #44 runde 3

**Review-type:** PR code review
**PR:** #44
**Branch:** `claude/T9-supplement-build`
**Head reviewet:** `cc29472`
**Resultat:** APPROVAL

## Vurdering

Runde-3 committene lukker den sidste runtime-verifikation:

- `postgrest-t9-schema-exposure` bruger nu OpenAPI-introspection i stedet for service-role RPC-call. Det tester schema/cache exposure uden at kræve direkte `SELECT`-grants til `service_role` på `core_identity`-tabeller.
- `legacy-is-active-readers` allowlister nu `core_identity._apply_client_place`, hvilket er korrekt: den læser `org_node_versions.is_active`, og `org_node_versions` har ikke `status`-kolonne. Det er ikke et R7d dual-column lifecycle-pattern.
- GitHub CI er grøn på PR-head `cc29472`.

Ingen nye KRITISK eller MELLEM kodefund.

## Version-drift

Remote har supplement-migrationen registreret som `20260519125710 / t9_supplement`, mens repo-filen hedder `20260520000000_t9_supplement.sql`. Post-merge `supabase db push` vil derfor se repo-versionen som ikke-applied og forsøge at køre den igen.

Jeg har gennemgået `supabase/migrations/20260520000000_t9_supplement.sql` for re-apply-risiko:

- Top-level schemaændringer er `CREATE OR REPLACE FUNCTION`, `REVOKE`, `GRANT`, `COMMENT`, `DROP POLICY IF EXISTS` + `CREATE POLICY`.
- DML-statements med `INSERT/UPDATE/DELETE` ligger i function bodies og eksekveres ikke ved migration apply.
- Den eneste top-level runtime-blok er Step 12 DO-blocken; den er idempotent og opdaterer kun mg@/km@ hvis `role_id is distinct from superadmin`.

Vurdering: version-driften er en deployment-watch, ikke en blocker. Re-apply bør lykkes; hold øje med `supabase db push` efter merge og stop hvis den mod forventning fejler.

## Verifikation

- `pnpm fitness` — exit 0.
- `pnpm db:test` — exit 0, 32/32 passed mod remote.
- Remote migrations-check: `supabase_migrations.schema_migrations` har `20260519125710 / t9_supplement`.
- GitHub PR checks — alle grønne på `cc29472`.
