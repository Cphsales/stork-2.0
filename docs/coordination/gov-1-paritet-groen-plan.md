# gov-1-paritet-groen — Plan V2

**Branch:** claude/gov-1-paritet-groen-plan
**Krav-dok:** governance-vagt (ét dok over 6 pakker — Claude.ai's bord; denne pakke = leverance "repo↔DB-paritet + types grøn")
**Forfatter:** Code · **Dato:** 2026-06-04
**Type:** migration-history-reconciliation (ikke skema/data-migration)

## V2 — håndtering af Codex-fund (runde 1)

| Fund                                        | Severity | Svar       | Hvordan adresseret                                                                                                                                                                        |
| ------------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #1 db diff utilstrækkelig som eneste orakel | KRITISK  | **ACCEPT** | §A: eksplicit objekt-manifest for alle 24 med per-klasse SQL-checks; `db diff` degraderet til afsluttende smoke-test, ikke bevis                                                          |
| #2 revert-first usikker ved partial failure | KRITISK  | **ACCEPT** | §C reordnet til **apply-first → verificér ingen repo-only pending → revert-second**; deploy-freeze under hele operationen                                                                 |
| #3 rollback overlover fuld registry-restore | KRITISK  | **ACCEPT** | §D: fuld-kolonne-snapshot (alle 6 kolonner) + konkret rollback-INSERT-artefakt der genskaber præcise rows; `migration repair` er ikke rollback-mekanismen for de fulde rows               |
| #4 Step 5 for åben                          | MELLEM   | **ACCEPT** | §E: `comment on`-residual → opsamlings-migration som DEFAULT; `change_reason`-tekst eksplicit ekskluderet (ingen skema-effekt, ikke replaybar); accept kun med G-nummer + ejer + deadline |
| #5 shorthand/ranges for risikabelt          | MELLEM   | **ACCEPT** | §F: fulde 14-cifrede versions + copy-pastebar fail-fast runbook                                                                                                                           |

Codex' svar på de 5 åbne spørgsmål er indarbejdet (apply-first pr. Q2; db push version-styret pr. Q3; types-fejl = stale committed types pr. Q5 — se §B).

## Formål

Bring repo og live-DB's migration-registre i overensstemmelse, så CI bliver grøn mod live — forudsætningen for at gov-4 (branch protection) kan kræve CI-checks uden at bricke main. Retning (Mathias): **(1) align registry → repo-stamps**; orphan subsumeret (ingen forward-port).

**Formålet er IKKE** at ændre live-skemaet. Live-skemaet er korrekt; kun migration-_registret_ og de committede types er ude af sync.

---

## Recon-grundlag (verificeret — bekræftet af Codex runde 1)

t9_supplement / t10 / t9_supplement_2-batchen blev anvendt manuelt på live af en kollega-konto (`km@…`, registry `created_by`) uden om repo→push-automationen, med wall-clock-timestamps der afviger fra repo-filernes planlagte stamps. Codex bekræftede tallene mod live: 116 repo · 117 remote · 24 repo-only · 25 remote-only · 38 `created_by`=kollega.

---

## §A Objekt-manifest — primær gate (erstatter db-diff-som-bevis) · fund #1

**Princip:** repair er kun sikker hvis hver repo-migrations _effekt_ allerede er i live. Det bevises pr. objekt med konkrete katalog-checks — ikke ved `db diff` (som har kendte blinde vinkler: grants, default privileges, ownership, visse comments). `db diff` køres som afsluttende smoke-test (§C step 5), aldrig som eneste bevis.

**Objekt-inventar pr. migration (ekstraheret fra repo-filerne — build genererer én konkret check pr. objekt):**

| Migration                                     | Objekter der skal verificeres i live                                                                                                                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| t9_supplement                                 | 24 funktioner (`acl_subtree_*`, `_apply_*`, `*_read*`, `_require_read_permission`, …) · 1 policy `client_node_placements_select` · 9 grant + 16 revoke · 5 comments · seed/delete-rows i org_nodes/placements |
| t10_tables                                    | 2 tabeller (clients, client_field_definitions) · 6 policies · 4 triggers · 3 indexes · 2 comments · 4 grant/2 revoke                                                                                          |
| t10_is_permanent_allowed_extend               | funktion `is_permanent_allowed` + comment                                                                                                                                                                     |
| t10_classify                                  | seed i `data_field_definitions` (række-eksistens)                                                                                                                                                             |
| t10_audit_filter_values                       | funktion `audit_filter_values` (m. NULL-guard) + comment                                                                                                                                                      |
| t10_clients_validate_fields                   | funktion + trigger `clients_validate_fields` + comment                                                                                                                                                        |
| t10_seed_permissions                          | seed i permission_pages/tabs/role_permission_grants                                                                                                                                                           |
| t10_client_node_placements_fk                 | FK-constraint `client_node_placements_client_id_fkey` + (comment — kendt residual)                                                                                                                            |
| t10_client_active_check                       | 4 funktioner + comment + grant/revoke + seed                                                                                                                                                                  |
| t10_client_rpcs                               | client_upsert/client_set_active + comments + grants                                                                                                                                                           |
| t10_client_field_definition_rpcs              | 2 funktioner + comments + grants                                                                                                                                                                              |
| t10_client_logo_rpcs                          | 3 funktioner (logo_set/get/clear) + comment + grants                                                                                                                                                          |
| t10_client_read_rpcs                          | 3 funktioner (list/get/field_definitions_list) + comments + grants                                                                                                                                            |
| t10_seed_legacy_permissions                   | seed i role_page_permissions                                                                                                                                                                                  |
| t10_remove_legacy_permissions                 | DELETE i role_page_permissions (række-fravær)                                                                                                                                                                 |
| t9_supplement_2_wrappers_session_var          | 5 wrapper-funktioner + grant/revoke                                                                                                                                                                           |
| t9_supplement_2_grants_fix                    | 9 grants                                                                                                                                                                                                      |
| t9_supplement_2_superadmin_bypass             | 2 `_apply_*`-funktioner + seed/delete                                                                                                                                                                         |
| t9_supplement_2_permission_actions            | tabel permission_actions + 3 policies + trigger + 2 unique-index + 2 funktioner + comment + grants + seed                                                                                                     |
| t9_supplement_2_approve_helpers               | funktioner + grants + seed                                                                                                                                                                                    |
| t9_supplement_2_pending_changes_select_policy | policy                                                                                                                                                                                                        |
| t9_supplement_2_pending_change_approve        | funktion(er)                                                                                                                                                                                                  |
| t9_supplement_2_ui_rpcs                       | UI-RPC-funktioner                                                                                                                                                                                             |
| t9_supplement_2_read_rpcs_action              | read-RPC-funktion(er)                                                                                                                                                                                         |

**Per-klasse SQL-check (build genererer eksplicit check pr. objekt; ALLE skal være grønne før repair):**

| Objekt-klasse  | Check                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Funktion       | `pg_get_functiondef('<schema>.<fn>(<args>)'::regprocedure)` findes + normaliseret body-hash == repo-filens funktions-body |
| Tabel/kolonner | `pg_attribute` join `pg_class` — kolonne-navne + typer matcher                                                            |
| Constraint     | `pg_constraint` (conname) + `pg_get_constraintdef` matcher                                                                |
| Policy         | `pg_policies` (polname) + qual/with_check matcher                                                                         |
| Trigger        | `pg_trigger` (tgname) findes på rette tabel                                                                               |
| Index          | `pg_indexes` (indexname) + indexdef matcher                                                                               |
| Grant/ACL      | `has_function_privilege` / `has_table_privilege` pr. (rolle, objekt, priv) — eksplicit, da db diff misser ACL             |
| Comment        | `obj_description`/`col_description` — **forventede residualer**; mismatch her er ikke-blokerende, registreres til §E      |
| Seed (INSERT)  | række-eksistens via nøgle-prædikat                                                                                        |
| DELETE         | række-fravær via nøgle-prædikat                                                                                           |

**Minimum:** de 10 ikke-dybde-verificerede migrations (jf. V1) får fuld per-objekt-check. De øvrige 14 ligeså (manifestet er komplet, ikke stikprøve). Resultat-tabel (objekt · check · PASS/FAIL/COSMETIC) ind i slut-rapporten.

---

## §B types-grøn — rod-årsag bekræftet (Codex Q5) · fund-relateret

`types:check` fejler konkret på manglende generated type for `core_compliance.audit_log_2026_08` (månedlig audit-partition). Det er **stale committed types** mod live — ikke orphan/divergens. `pnpm types:generate` (fra live) + commit fikser nuværende drift.

⚠️ **Recurring-risk (note, ikke gov-1-scope):** månedlige audit-partitioner (partition-create-cron) kan introducere samme types-drift hver måned. Kandidat til G-nummer / senere gov-pakke (fx ekskludér partition-børn fra types-gen, eller auto-regen-cron). Registreres, løses ikke her.

---

## §C Reconciliation-procedure — apply-first, revert-second · fund #2

**Sikkerhedsgaranti (Supabase-docs):** `migration repair` opdaterer KUN tracking-tabellen, kører ikke SQL. **Begrundelse for rækkefølge (Codex Q2):** history har PK på `version`, så begge rækkefølger er constraint-gyldige — men revert-first efterlader ved partial failure repo-migrations som "pending", hvorefter et `db push --include-all` kunne forsøge at køre dem mod live. Apply-first eliminerer det transiente vindue.

**Deploy-freeze under hele operationen:** ingen push til `main` der rører `supabase/migrations/*` (pauser `migrations-deploy.yml`) før §C er færdig-verificeret.

- **Step 0 — Pre-flight (BLOKERENDE):** kør §A objekt-manifest (alle 24 grønne, kun comment-residualer tilladt) + §D snapshot. Enhver skema-substantiel FAIL → STOP, eskalér (antagelsen om ren omstempling brudt).
- **Step 1 — APPLY 24 repo-stamps** (`--status applied`).
- **Step 2 — Verificér ingen repo-only pending:** `supabase db push --linked --dry-run` → "up to date" / 0 pending. Bekræfter at de 24 nu er kendt-applied og at intet repo-only SQL ville køre mod live.
- **Step 3 — REVERT 25 gamle remote-stamps** (`--status reverted`).
- **Step 4 — Registry-paritet:** `supabase migration list` → LOCAL == REMOTE (116 = 116, ingen huller).
- **Step 5 — Afsluttende smoke-test:** `supabase db diff --linked` → kun kosmetiske comment-residualer (ingen tabel/kolonne/funktions-logik-diff). `pnpm types:generate` + commit → `pnpm types:check` exit 0. `pnpm fitness` + `pnpm migration:check` uændret grønne.

---

## §D Rollback — fuld-kolonne, konkret artefakt · fund #3

`migration repair --status applied` genskaber KUN `version` (+ name) — **ikke** `statements`, `created_by`, `idempotency_key`, `rollback`. Derfor er repair ikke en fuld rollback-mekanisme.

- **Snapshot (Step 0):** `select *` fra `supabase_migrations.schema_migrations` (alle 6 kolonner, alle 117 rows) → gemt artefakt.
- **Konkret rollback-artefakt:** generér `insert into supabase_migrations.schema_migrations (version, statements, name, created_by, idempotency_key, rollback) values (…) on conflict (version) do update set …` for de 25 rows der reverteres — så de kan genskabes **byte-præcist** (direkte INSERT, ikke `migration repair`).
- **Rollback-procedure:** (a) fjern de 24 apply-indsatte rows (`--status reverted` på repo-stamps); (b) kør rollback-INSERT for de 25 → registry byte-identisk med udgangspunkt. Ingen data berørt på noget tidspunkt.

Dette er **fuld registry-rollback** (ikke kun version-state), nu hvor artefaktet genskaber alle kolonner.

---

## §E Residual-håndtering · fund #4

- **`comment on`-residualer** (objekter live mangler, fx `client_node_placements_client_id_fkey`-kommentaren): **DEFAULT = opsamlings-migration** der anvender de manglende `comment on`-statements. Resultat: repo↔live 100% paritet, fremtidig `db push` ren.
- **`change_reason`-strengforskelle** (set_config-arg): **eksplicit ekskluderet.** Ingen skema-effekt; konsumeret af audit-trigger ved oprindelig apply-tid; ikke meningsfuldt replaybar. Får hverken opsamlings-migration eller G-nummer — noteres som forklaret ikke-residual.
- **Accept-i-stedet-for-fix:** kun hvis en residual er dokumenteret rent kosmetisk OG tidsbokset → **G-nummer i teknisk-gaeld.md med ejer + deadline.** Ikke default.

---

## §F Eksekverings-runbook — fulde versions, fail-fast · fund #5

`set -euo pipefail`; én repair pr. linje; verificér efter hvert trin. Ingen ranges/shorthand.

```bash
set -euo pipefail
# === STEP 1: APPLY 24 repo-stamps ===
for v in \
  20260520000000 \
  20260521000001 20260521000002 20260521000003 20260521000004 20260521000005 \
  20260521000006 20260521000007 20260521000008 20260521000009 20260521000010 \
  20260521000011 20260521000012 20260521000013 20260521000014 \
  20260521100000 20260521100001 20260521100002 20260521100003 20260521100004 \
  20260521100005 20260521100006 20260521100007 20260521100008 ; do
  supabase migration repair --status applied "$v"
done
# === STEP 2: verificér ingen repo-only pending ===
supabase db push --linked --dry-run   # forventet: up to date / 0 pending
# === STEP 3: REVERT 25 gamle remote-stamps ===
for v in \
  20260519125710 \
  20260521004003 20260521004027 20260521004051 20260521004116 20260521004130 \
  20260521004145 20260521004154 20260521004231 20260521004250 20260521004311 \
  20260521004330 20260521004346 20260521004746 \
  20260521102809 \
  20260521113653 \
  20260522000919 20260522000934 20260522001016 20260522001116 20260522001141 \
  20260522001153 20260522001221 20260522001255 20260522001313 ; do
  supabase migration repair --status reverted "$v"
done
# === STEP 4: paritet ===
supabase migration list   # LOCAL == REMOTE, 116 = 116
```

`20260521102809` (orphan) er i revert-listen; dens effekt er subsumeret af repo `…000004` (NULL-guard allerede merged — bekræftet af Codex runde 1).

---

## End-to-end-test-design (leverings-kriterium, §3.6)

CI grøn mod live = leverance: (1) `migration list` 0 divergens · (2) §A-manifest alle grønne · (3) `db diff` kun kosmetik · (4) `types:check` exit 0 · (5) `fitness`+`migration:check` grønne · (6) `db push --dry-run` "up to date". Output i slut-rapport.

## Oprydnings- og opdaterings-strategi

`aktiv-plan.md` opdateres · ingen ændring til vision/forretningsforstaaelse/master-plan · types-regen committes · evt. §E-opsamlings-migration + recurring-types-G-nummer (§B) i teknisk-gaeld.md.

## Åbne punkter til Codex (runde 2)

1. §A: er per-klasse-check-sættet komplet — mangler en objekt-klasse (fx default privileges via `pg_default_acl`, sequence-ownership, enum-værdier) som en af de 24 rører?
2. §D: er direkte `insert into supabase_migrations.schema_migrations` den rette rollback-vej (privilegier/side-effekter), eller foretrækkes `db pull`-baseret genskabelse?
3. §C step 2: er `db push --dry-run` et pålideligt "0 pending"-signal efter apply-first, eller skal det suppleres?
