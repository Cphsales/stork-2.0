# gov-1-paritet-groen — Plan V3

**Branch:** claude/gov-1-paritet-groen-plan
**Krav-dok:** governance-vagt (ét dok over 6 pakker — Claude.ai's bord; denne pakke = leverance "repo↔DB-paritet + types grøn")
**Forfatter:** Code · **Dato:** 2026-06-04
**Type:** migration-history-reconciliation (ikke skema/data-migration)

## V3 — håndtering af Codex-fund (runde 2)

| Fund                                                                                                       | Severity | Svar       | Hvordan adresseret                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| #1 §A-manifest stadig ufuldstændigt (manglende objekter + check-klasser)                                   | KRITISK  | **ACCEPT** | §A genopbygget fra fuld statement-ekstraktion (komplet verb-sæt, ingen trunkering). Tilføjet de missede objekter (ADD COLUMN `action_id` ×2, constraint/index drop+recreate i 100003, top-level `update employees` i t9_supplement) + 6 nye check-klasser (RLS flags, kolonne-default/nullability, trigger-def+enabled, policy cmd/roles, positive+negative privileges, direkte DML-state) |
| #2 §C step 2 (`db push --dry-run`) fejler nu på de 25 remote-only stamps → runbook stopper i partial state | KRITISK  | **ACCEPT** | §C reordnet: mellem apply og revert verificeres "0 repo-only pending" med **direkte SQL set-diff** mod `schema_migrations`; `db push --dry-run` flyttet til **final gate efter revert + paritet**                                                                                                                                                                                          |

**Min fejl i V2 (ærligt):** "manifestet er komplet"-påstanden var overstated — mit ekstraktions-grep havde ufuldstændigt verb-sæt (manglede `update`/`add column`/`drop constraint`) og output blev trunkeret ved 100004. V3-inventaret er nu fra fuld ekstraktion af alle 24 filer.

Codex runde-2-svar indarbejdet: Q1 (ingen default-privs/sequences/enums, men de 6 klasser tilføjet) · Q2 (direkte INSERT som transaktioneret nødartefakt, efter sletning af 24 applied rows — §D) · Q3 (direkte SQL i mellem-position, `db push` som final gate — §C).

## Formål

Bring repo og live-DB's migration-registre i overensstemmelse, så CI bliver grøn mod live — forudsætning for at gov-4 (branch protection) kan kræve CI-checks uden at bricke main. Retning (Mathias): **(1) align registry → repo-stamps**; orphan subsumeret. **Formålet er IKKE** at ændre live-skemaet.

## Recon-grundlag (verificeret — bekræftet af Codex)

Manuel anvendelse på live af kollega-konto (`km@…`) uden om automationen, restampede timestamps. 116 repo · 117 remote · 24 repo-only · 25 remote-only · 38 `created_by`=kollega. Orphan `102809` (null_guard) subsumeret af repo `…000004`.

---

## §A Objekt-manifest — primær gate (fuld ekstraktion) · fund #1

**Princip:** repair er kun sikker hvis hver repo-migrations _effekt_ allerede er i live, bevist pr. objekt med katalog-checks — ikke `db diff` (blinde vinkler: grants, default privileges, RLS-flags, ownership, comments). `db diff` = afsluttende smoke-test (§C), aldrig eneste bevis.

### Check-klasser (build genererer én konkret check pr. objekt; ALLE skema-substantielle skal være grønne)

| Klasse                                 | Check                                                                                                   | Kilde                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Funktion                               | `pg_get_functiondef('<s>.<fn>(<args>)'::regprocedure)` findes + normaliseret body-hash == repo          | pg_proc                              |
| Tabel + kolonner                       | kolonne-navn + type                                                                                     | pg_attribute                         |
| **Kolonne-default + nullability** (ny) | `atthasdef`/`pg_get_expr` + `attnotnull` matcher                                                        | pg_attribute/pg_attrdef              |
| **ADD COLUMN** (ny)                    | kolonne eksisterer m. type + FK + on-delete-aktion                                                      | pg_attribute + pg_constraint         |
| Constraint (add/**drop**)              | tilstedeværende: `pg_get_constraintdef` matcher; droppet: fravær                                        | pg_constraint                        |
| Index (add/**drop**)                   | tilstedeværende: `indexdef` matcher; droppet: fravær                                                    | pg_indexes                           |
| **RLS enable/force** (ny)              | `relrowsecurity` + `relforcerowsecurity` = true                                                         | pg_class                             |
| **Trigger def + enabled** (ny)         | `pg_get_triggerdef` matcher + `tgenabled` = 'O'                                                         | pg_trigger                           |
| **Policy cmd + roles** (ny)            | `cmd` + `roles` + `qual` + `with_check` matcher                                                         | pg_policies                          |
| **Privilegier ±** (ny)                 | positive: `has_*_privilege`; negative: revoke verificeret (ingen utilsigtet PUBLIC/anon-priv)           | information_schema / pg_class.relacl |
| Comment                                | `obj_description`/`col_description` — **forventede residualer**, ikke-blokerende → §E                   | pg_description                       |
| Direkte DML-state (ny)                 | seed-rows til stede; deleted-rows fraværende; `employees.role_id` = forventet for bootstrap-superadmins | data-rækker                          |

> **Note — UPDATE inde i funktions-body vs. top-level DML:** de fleste `update`-forekomster ligger _inde i_ `create or replace function`-bodies (dækket af funktions-body-hash). Kun **top-level DML** kræver separat række-state-check. Top-level DML i de 24: `t9_supplement` seeds + `update employees` (bootstrap-superadmin role_id, linje ~1017); `t10_classify`/`seed_permissions`/`seed_legacy_permissions` seeds; `remove_legacy_permissions` DELETE; `100002`/`100003`/`100004`/`100007` seeds.

### Korrigeret objekt-inventar (de tidligere missede er nu med — udvalgte kritiske)

| Migration                     | Skema-substantielle objekter (ud over funktioner/grants/comments)                                                                                                                                                                                                                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| t10_tables                    | clients + client_field_definitions: **RLS enable+force ×2**, 6 policies (cmd/roles), 4 triggers (enabled), 3 indexes, kolonne-defaults                                                                                                                                                                                                    |
| t10_client_node_placements_fk | FK `client_node_placements_client_id_fkey` (on delete restrict) + comment (kendt residual)                                                                                                                                                                                                                                                |
| **100003 permission_actions** | tabel permission_actions (**RLS enable+force**, 3 policies, trigger, 2 unique-index) · **role_permission_grants: ADD COLUMN `action_id` (FK→permission_actions, on delete cascade)** · **DROP gammel check-constraint + ADD `role_permission_grants_one_element` check** · **DROP+recreate `role_permission_grants_unique`-index** · seed |
| **100004 approve_helpers**    | **pending_changes: ADD COLUMN `action_id` (FK→permission_actions, on delete restrict)** · funktioner · seed                                                                                                                                                                                                                               |
| 100002 superadmin_bypass      | 2 `_apply_*`-funktioner · top-level seed/delete-state                                                                                                                                                                                                                                                                                     |
| t9_supplement                 | 24 funktioner · policy `client_node_placements_select` (cmd/roles) · **top-level `update employees` (bootstrap-superadmin role_id)** · org_nodes/placements seed+delete · 5 comments                                                                                                                                                      |

Fuld 24-rækkers manifest (hver med eksakt objekt + check) genereres i build-pre-flight; resultat-tabel (objekt · check · PASS/FAIL/COSMETIC) i slut-rapport. **Skema-substantiel FAIL → STOP, eskalér.** Kun comment-mismatch er ikke-blokerende (→ §E).

---

## §B types-grøn (Codex Q5 bekræftet)

`types:check` fejler på manglende generated type for `core_compliance.audit_log_2026_08` (månedlig audit-partition) = stale committed types, ikke orphan/divergens. `pnpm types:generate` + commit fikser. ⚠️ Recurring-risk: månedlige partitioner kan gen-introducere drift → kandidat-G-nummer (ikke gov-1-scope).

---

## §C Reconciliation-procedure — apply-first, SQL-verify, revert, final dry-run · fund #2

**Sikkerhedsgaranti (Supabase-docs):** `migration repair` opdaterer KUN tracking-tabellen, kører ikke SQL. **Deploy-freeze** under hele operationen (ingen push til main der rører `supabase/migrations/*`).

> **Hvorfor `db push --dry-run` IKKE kan stå mellem apply og revert (Codex runde 2, kørt):** den fejler allerede nu med "Remote migration versions not found in local migrations directory" og lister de 25 remote-only stamps. De findes stadig efter apply-first → `set -e` ville stoppe runbooken i partial state. Derfor: direkte SQL-set-diff i mellem-position; `db push --dry-run` som final gate efter de 25 er reverted.

- **Step 0 — Pre-flight (BLOKERENDE):** §A-manifest alle skema-substantielle grønne (kun comment-residualer tilladt) + §D fuld-snapshot.
- **Step 1 — APPLY 24 repo-stamps** (`--status applied`).
- **Step 2 — Verificér 0 repo-only pending via DIREKTE SQL** (ikke db push): de 24 repo-versions `EXCEPT` `select version from schema_migrations` → **0 rows**. Bekræfter alle 24 nu kendt-applied; intet repo-only SQL ville køre mod live.
- **Step 3 — REVERT 25 gamle remote-stamps** (`--status reverted`).
- **Step 4 — Registry-paritet:** `supabase migration list` → LOCAL == REMOTE (116 = 116, ingen huller).
- **Step 5 — Final gate (nu valid):** `supabase db push --linked --dry-run` → "up to date" / 0 pending · `supabase db diff --linked` → kun kosmetiske comment-residualer · `pnpm types:generate` + commit → `types:check` exit 0 · `pnpm fitness` + `migration:check` grønne.

---

## §D Rollback — transaktioneret, fuld-kolonne, korrekt sekvens · fund #3 (Codex Q2 runde 2)

`migration repair --status applied` genskaber KUN `version`(+name) — ikke `statements/created_by/idempotency_key/rollback`. Derfor er direkte INSERT den byte-præcise vej, **men kun transaktioneret nødartefakt og i rette sekvens.**

- **Snapshot (Step 0):** `select *` (alle 6 kolonner, alle 117 rows) → artefakt.
- **Rollback-artefakt (genereret):** transaktioneret SQL:
  ```sql
  begin;
  -- 1) fjern de 24 repair-applied rows (kun version sat — fjernes helt)
  delete from supabase_migrations.schema_migrations where version = any(array[<24 repo-stamps>]);
  -- 2) genskab de 25 originale rows byte-præcist (alle 6 kolonner fra snapshot)
  insert into supabase_migrations.schema_migrations
    (version, statements, name, created_by, idempotency_key, rollback)
  values <25 rows fra snapshot>
  on conflict (version) do update set
    statements = excluded.statements, name = excluded.name,
    created_by = excluded.created_by, idempotency_key = excluded.idempotency_key,
    rollback = excluded.rollback;
  commit;
  ```
- Resultat: registry byte-identisk med udgangspunkt. Fuld registry-rollback (ikke kun version-state). Ingen data berørt på noget tidspunkt.

---

## §E Residual-håndtering · (uændret fra V2)

- `comment on`-residualer (fx `client_node_placements_client_id_fkey`-kommentaren): **DEFAULT = opsamlings-migration**.
- `change_reason`-strengforskelle (set_config): **eksplicit ekskluderet** — ingen skema-effekt, ikke replaybar.
- Accept-i-stedet: kun dokumenteret kosmetisk + tidsbokset → **G-nummer + ejer + deadline**.

---

## §F Eksekverings-runbook — fulde versions, fail-fast, korrekt rækkefølge · fund #5 + #2

```bash
set -euo pipefail
PROJ=imtxvrymaqbgcvsarlib
REPO_STAMPS=( \
  20260520000000 \
  20260521000001 20260521000002 20260521000003 20260521000004 20260521000005 \
  20260521000006 20260521000007 20260521000008 20260521000009 20260521000010 \
  20260521000011 20260521000012 20260521000013 20260521000014 \
  20260521100000 20260521100001 20260521100002 20260521100003 20260521100004 \
  20260521100005 20260521100006 20260521100007 20260521100008 )
OLD_REMOTE=( \
  20260519125710 \
  20260521004003 20260521004027 20260521004051 20260521004116 20260521004130 \
  20260521004145 20260521004154 20260521004231 20260521004250 20260521004311 \
  20260521004330 20260521004346 20260521004746 \
  20260521102809 \
  20260521113653 \
  20260522000919 20260522000934 20260522001016 20260522001116 20260522001141 \
  20260522001153 20260522001221 20260522001255 20260522001313 )

# STEP 1 — APPLY 24 repo-stamps
for v in "${REPO_STAMPS[@]}"; do supabase migration repair --status applied "$v"; done

# STEP 2 — verificér 0 repo-only pending via DIREKTE SQL (ikke db push)
#   forventet output: 0 rows
#   select v from unnest(ARRAY[<REPO_STAMPS>]) v
#   except select version from supabase_migrations.schema_migrations;

# STEP 3 — REVERT 25 gamle remote-stamps (kun efter step 2 = 0 rows)
for v in "${OLD_REMOTE[@]}"; do supabase migration repair --status reverted "$v"; done

# STEP 4 — paritet
supabase migration list   # LOCAL == REMOTE, 116 = 116

# STEP 5 — final gate (nu valid, de 25 remote-only er væk)
supabase db push --linked --dry-run   # "up to date"
```

`20260521102809` (orphan) er i revert-listen; effekt subsumeret af repo `…000004`.

---

## End-to-end-test-design (§3.6)

(1) `migration list` 0 divergens · (2) §A-manifest alle skema-substantielle grønne · (3) Step 2 SQL = 0 repo-only pending · (4) `db diff` kun kosmetik · (5) `db push --dry-run` "up to date" · (6) `types:check` exit 0 · (7) `fitness`+`migration:check` grønne. Output i slut-rapport.

## Oprydnings- og opdaterings-strategi

`aktiv-plan.md` opdateres · types-regen committes · evt. §E-opsamlings-migration + recurring-types-G-nummer (§B) i teknisk-gaeld.md · ingen ændring til vision/forretningsforstaaelse/master-plan.

## Åbne punkter til Codex (runde 3)

1. §A: er de 12 check-klasser nu udtømmende for de 24, eller rører en migration en klasse jeg stadig ikke har (fx sequence-defaults via identity-kolonner, `set_config`-baserede session-effekter der efterlader vedvarende state)?
2. §D: er `delete` af de 24 + `insert` af de 25 i én transaktion korrekt rollback-sekvens, eller skal hele `schema_migrations` truncate+restore fra snapshot foretrækkes for at undgå rest-state?
3. §C step 2: er `EXCEPT`-set-diff tilstrækkelig, eller skal jeg også verificere at de 25 _stadig findes_ før revert (så vi ikke reverter noget allerede væk)?
