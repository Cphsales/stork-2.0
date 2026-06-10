#!/usr/bin/env node
// Fitness-functions: arkitektoniske invarianter der køres i CI på hver PR.
// Fanger drift som ESLint ikke ser fordi de er repo-omfattende, ikke per-fil.
// Hver check er en function der returnerer { name, violations: string[] }.
// Tilføj nye checks ved at skrive en function og pushe den til `checks`-array'et.

import { readdir, readFile } from "node:fs/promises";
import { readFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = process.cwd();
const SKIP_DIRS = new Set(["node_modules", "dist", ".turbo", ".git", "coverage"]);
const MIGRATIONS_DIR = "supabase/migrations";

// Master-tabeller / config-tabeller / audit-infrastruktur uden ingestion-flow
// der kræver dedup_key. Nye tabeller skal enten erklære dedup_key eller
// eksplicit opt-out med `-- no-dedup-key: <reason>` i CREATE TABLE-blokken.
//
// Public-tabeller er fra fase 0 (C2-D5) — DB-tabellerne er droppet i trin 1
// (rettelse 20), men migration-filerne bevares som historik og fanges stadig
// af fitness-checks. De forbliver grandfathered.
//
// Core_*-tabeller er fra trin 1 (rettelse 20).
const GRANDFATHERED_NO_DEDUP_KEY = new Set([
  // Historisk (public, droppet i trin 1):
  "public.audit_log",
  "public.cron_heartbeats",
  "public.pay_period_settings",
  "public.pay_periods",
  "public.commission_snapshots",
  "public.salary_corrections",
  "public.cancellations",
  "public.data_field_definitions",
  "public.employees",
  "public.roles",
  "public.role_page_permissions",
  "public.clients",
  "public.client_field_definitions",
  "public.org_units",
  "public.teams",
  "public.employee_teams",
  "public.client_teams",
  // Trin 1 (core-schemas):
  "core_compliance.audit_log",
  "core_compliance.cron_heartbeats",
  "core_compliance.data_field_definitions",
  "core_identity.employees",
  "core_identity.roles",
  "core_identity.role_page_permissions",
  // Trin 2 (identitet del 1):
  "core_compliance.superadmin_settings",
  // Trin 6 (anonymisering):
  "core_compliance.anonymization_mappings",
  "core_compliance.anonymization_state",
  // Trin 7 (periode-skabelon + candidate + break-glass):
  "core_money.pay_period_settings",
  "core_money.pay_periods",
  "core_money.commission_snapshots",
  "core_money.salary_corrections",
  "core_money.cancellations",
  "core_money.pay_period_candidate_runs",
  // R6: commission_snapshots_candidate + salary_corrections_candidate droppet
  "core_compliance.break_glass_operation_types",
  "core_compliance.break_glass_requests",
]);

// Tabeller der har immutability-trigger (BEFORE UPDATE/DELETE block).
// De SKAL også have BEFORE TRUNCATE-blokering, da TRUNCATE bypasser
// row-level triggers.
// Trin 1: audit_log.
// Trin 6: anonymization_state (rettelse 18 A3).
// Trin 7: commission_snapshots, salary_corrections, cancellations, pay_periods.
// Trin 16 (kommende): rejections, basket_corrections.
//
// H024: pay_periods tilføjet (Codex sidefund #3 — pay_periods har
// `DELETE altid blokeret` via lock_and_delete_check, men manglede TRUNCATE-
// blok-check).
const IMMUTABLE_TABLES_REQUIRE_TRUNCATE_BLOCK = [
  "core_compliance.audit_log",
  "core_compliance.anonymization_state",
  "core_money.commission_snapshots",
  "core_money.salary_corrections",
  "core_money.cancellations",
  "core_money.pay_periods",
];

// H024: Tabeller hvor DB-tests der INSERT'er skal bruge BEGIN/ROLLBACK wrap.
// Strict immutability + conditional immutability + lifecycle-DELETE-restricted.
// Fitness-check `db-test-tx-wrap-on-immutable-insert` håndhæver disciplin.
// Allowlist-kommentar `-- no-transaction-needed: <reason>` undertrykker check pr. fil.
const TX_WRAP_REQUIRED_FOR_TEST_INSERT = [
  // Strict immutability (RAISE'r ubetinget på UPDATE/DELETE)
  "core_compliance.audit_log",
  "core_compliance.anonymization_state",
  "core_money.cancellations",
  "core_money.salary_corrections",
  // Conditional immutability (lock-and-delete-mønster)
  "core_money.commission_snapshots",
  "core_money.pay_periods",
  // Lifecycle-DELETE-restricted (status<>'draft' blokerer DELETE)
  "core_compliance.anonymization_strategies",
  "core_compliance.anonymization_mappings",
  "core_compliance.break_glass_operation_types",
  // T9 mutable state-tabeller (G053 refactor 2026-05-19): tests må ikke
  // efterlade rows der kolliderer med Step 12 seed eller andre runs.
  // Alle T9-smoke-tests er allerede BEGIN/ROLLBACK-wrapped efter refactor;
  // listen låser mønsteret for fremtidige tilføjelser.
  "core_identity.org_nodes",
  "core_identity.org_node_versions",
  "core_identity.employee_node_placements",
  "core_identity.client_node_placements",
  "core_identity.pending_changes",
  "core_identity.role_permission_grants",
  "core_identity.permission_areas",
  "core_identity.permission_pages",
  "core_identity.permission_tabs",
];

// R2 (master-plan rettelse 23): Snapshot-tabeller der er bevidst undtaget
// fra stork_audit-trigger. Tilføjelse til listen kræver kode-commit + review.
// Ingen admin-konfigurerbar version af denne liste — det er kerne-disciplin.
//
// Initial:
// - commission_snapshots: efter R3 (UPDATE-flag refactor) bærer den ikke
//   stork_audit-trigger; status-overgange spores via flag-kolonner +
//   periode-audit. (Pre-R3 har den stadig trigger; check er one-way.)
// - commission_snapshots_candidate + salary_corrections_candidate: legacy
//   candidate-tabeller (droppes i R6); de er scratch-buffers uden audit.
const AUDIT_EXEMPT_SNAPSHOT_TABLES = new Set([
  "core_money.commission_snapshots",
  // R6: commission_snapshots_candidate + salary_corrections_candidate droppet
  // T9 Plan V6 Valg 3: closure-tabel er current-state-derived fra org_node_versions.
  // Kategori-udvidelse (G-nummer-kandidat for master-plan rettelse 23-udvidelse til derived-tables).
  "core_identity.org_node_closure",
]);

// Audit-tabellen + dens partitioner auditer ikke sig selv (uendelig rekursion).
const AUDIT_LOG_SELF_EXCLUSION_RE = /^core_compliance\.audit_log(_\d{4}_\d{2}|_default)?$/;

// R7d-pattern (legacy-is-active-readers) er specifik for tabeller der har
// BÅDE is_active boolean OG status text (employees-pattern). Funktioner der
// læser is_active=true på tabeller med kun is_active (uden status) er ikke
// R7d-relevante. T9-tabellerne (org_node_versions, employee_node_placements,
// client_node_placements) har is_active som lifecycle-signal alene; ingen
// status-kolonne. Disse er allowlist'et nedenfor.
//
// G-nummer-kandidat: R7d-fitness-check skal eksplicit dokumentere at den er
// employees-specifik (dual-column-pattern). Tabeller med kun is_active skal
// være allowlist'et fra start, ikke retroaktivt.
const LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS = new Set([
  "core_identity._apply_employee_place",
  "core_identity._apply_client_place",
  "core_identity.client_node_place",
  "core_identity.permission_elements_read",
  // T10.16 (V6+V8 Code-validering): client_field_definitions har kun is_active,
  // ingen status-kolonne. R7d-pattern (dual-column employees) gælder ikke.
  "core_identity.client_field_definitions_list",
  "core_identity.clients_validate_fields",
  // T9-supplement-2 (V11 Mathias-fund B3): permission_actions har kun
  // is_active-kolonne (samme T9-pattern som permission_pages/tabs).
  // R7d-pattern (dual-column employees) gælder ikke.
  "core_identity.has_permission_action",
]);

// D3 (master-plan princip 15): Bootstrap-INSERTs i klassifikations- og
// konfig-tabeller skal være idempotente. ON CONFLICT DO NOTHING (eller
// DO UPDATE) sikrer at replay ikke duplikerer eller fejler. Direkte
// INSERT uden ON CONFLICT er drift.
//
// Tabeller der bootstrappes via migration:
const BOOTSTRAP_CONFIG_TABLES = new Set([
  "core_compliance.data_field_definitions",
  "core_compliance.anonymization_mappings",
  "core_compliance.anonymization_strategies",
  "core_compliance.break_glass_operation_types",
  "core_compliance.superadmin_settings",
  "core_identity.roles",
  "core_identity.role_page_permissions",
  "core_identity.employee_active_config",
  "core_money.pay_period_settings",
]);

// Migrationsfiler der er undtaget fra set-config-discipline-check.
// Pre-D6-filer kan indeholde top-level INSERT/UPDATE uden session-vars.
// Migration-filer er historik og modificeres ikke retroaktivt.
const GRANDFATHERED_NO_SETCONFIG_DISCIPLINE = new Set([
  "20260511165543_c4_pay_periods_template.sql", // singleton-config-INSERT uden top-level session-vars
  "20260514120007_t1_bootstrap_admins.sql", // R7g afslørede DO-block-INSERT pre-D6
]);

// D3 grandfather: 9 migration-filer pre-D3 har INSERTs uden ON CONFLICT.
// Migration-filer er historik og modificeres ikke retroaktivt. Disciplin
// gælder fremadrettet — alle nye migrations skal have ON CONFLICT-klausul.
const GRANDFATHERED_NO_ON_CONFLICT = new Set([
  "20260514120008_t1_classify_trin_1.sql",
  "20260514130000_t2_superadmin_floor.sql",
  "20260514130002_t2_classify.sql",
  "20260514140000_t6_anonymization_tables.sql",
  "20260514140003_t6_classify.sql",
  "20260514150000_t7_pay_periods.sql",
  "20260514150008_t7c_break_glass.sql",
  "20260514150009_t7_classify.sql",
  "20260514180000_g028_classify_anonymization_dispatcher_columns.sql",
  "20260514120007_t1_bootstrap_admins.sql", // R7g afslørede DO-block-INSERT pre-D3
]);

async function walk(dir, exts) {
  const out = [];
  async function recurse(d) {
    let entries;
    try {
      entries = await readdir(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (SKIP_DIRS.has(e.name)) continue;
      const p = join(d, e.name);
      if (e.isDirectory()) await recurse(p);
      else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
    }
  }
  await recurse(dir);
  return out;
}

function rel(p) {
  return relative(ROOT, p);
}

function stripSqlComments(sql) {
  return sql.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

// Strip dollar-quoted-strings ($$...$$, $tag$...$tag$). Brugt til checks
// der vurderer migration-tidens mutationer — funktion-bodies eksekverer
// først ved runtime, ikke ved apply.
//
// R7g: differentier mellem dollar-quoted-kontekster:
// - CREATE FUNCTION/PROCEDURE: body eksekverer ved runtime → strip
// - DO: eksekverer ved migration-tid → KEEP (mutation skal scannes)
// - cron.schedule: body eksekverer ved cron-run, ikke ved migration-apply → strip
// - default (string-literaler i SELECT/INSERT): strip (data, ikke kode)
//
// Differentiering via 200-char preceding context før $tag$-start.
function classifyDollarBlockContext(sql, blockStart) {
  const lookbehind = sql.slice(Math.max(0, blockStart - 200), blockStart);
  // CREATE [OR REPLACE] FUNCTION/PROCEDURE ... AS $...$
  if (/CREATE\s+(OR\s+REPLACE\s+)?(FUNCTION|PROCEDURE)\b[\s\S]*?AS\s*$/i.test(lookbehind)) {
    return "function_body"; // strip — runtime
  }
  // cron.schedule(..., $cron$ ... $cron$)
  if (/cron\.schedule\s*\([\s\S]*?,\s*$/i.test(lookbehind)) {
    return "cron_body"; // strip — runtime
  }
  // DO $$...$$ (eller DO $tag$...$tag$)
  if (/\bDO\s*$/i.test(lookbehind)) {
    return "do_block"; // KEEP — migration-time
  }
  return "default"; // strip — data
}

function stripDollarQuoted(sql) {
  let out = "";
  let i = 0;
  while (i < sql.length) {
    const m = sql.slice(i).match(/^\$(\w*)\$/);
    if (m) {
      const tag = m[0];
      const endIdx = sql.indexOf(tag, i + tag.length);
      if (endIdx === -1) {
        out += sql.slice(i);
        break;
      }
      const block = sql.slice(i, endIdx + tag.length);
      const context = classifyDollarBlockContext(sql, i);
      if (context === "do_block") {
        // KEEP: DO-block er migration-time. Skal scannes for INSERTs/UPDATEs.
        out += block;
      } else {
        // Strip (function body / cron body / data-literal): erstat med whitespace
        // for at bevare linje-numre
        out += block.replace(/[^\n]/g, " ");
      }
      i = endIdx + tag.length;
    } else {
      out += sql[i];
      i++;
    }
  }
  return out;
}

async function readMigrationFiles() {
  let entries;
  try {
    entries = await readdir(MIGRATIONS_DIR);
  } catch {
    return [];
  }
  const files = entries.filter((f) => f.endsWith(".sql")).sort();
  const out = [];
  for (const f of files) {
    const path = join(MIGRATIONS_DIR, f);
    const sql = await readFile(path, "utf8");
    out.push({ file: f, path, sql });
  }
  return out;
}

// ─── checks ─────────────────────────────────────────────────────────────────

async function noTsIgnore() {
  const files = await walk("apps", [".ts", ".tsx"]);
  files.push(...(await walk("packages", [".ts", ".tsx"])));
  const violations = [];
  for (const f of files) {
    const txt = await readFile(f, "utf8");
    txt.split("\n").forEach((line, idx) => {
      if (/@ts-ignore\b/.test(line)) {
        violations.push(
          `${rel(f)}:${idx + 1}: @ts-ignore (brug @ts-expect-error i stedet — det fanger når kommentaren bliver forældet)`,
        );
      }
    });
  }
  return { name: "no-ts-ignore", violations };
}

async function eslintDisableJustified() {
  const files = await walk("apps", [".ts", ".tsx", ".js", ".mjs", ".cjs"]);
  files.push(...(await walk("packages", [".ts", ".tsx", ".js", ".mjs", ".cjs"])));
  const violations = [];
  const disableRe = /eslint-disable(?:-line|-next-line)?\s+([\w\-/@]+)/;
  const justifiedRe = /eslint-disable\S*\s+[\w\-/@,\s]+--\s+\S+/;
  for (const f of files) {
    const txt = await readFile(f, "utf8");
    txt.split("\n").forEach((line, idx) => {
      if (disableRe.test(line) && !justifiedRe.test(line)) {
        violations.push(`${rel(f)}:${idx + 1}: eslint-disable mangler "-- begrundelse" efter regelnavnet`);
      }
    });
  }
  return { name: "eslint-disable-justified", violations };
}

async function migrationNaming() {
  const violations = [];
  let entries;
  try {
    entries = await readdir(MIGRATIONS_DIR);
  } catch {
    return { name: "migration-naming", violations };
  }
  const re = /^\d{14}_[a-z0-9_]+\.sql$/;
  for (const e of entries) {
    if (e === ".gitkeep" || e.startsWith(".")) continue;
    if (!re.test(e)) {
      violations.push(`${MIGRATIONS_DIR}/${e}: skal matche <14digits>_<snake_case>.sql`);
    }
  }
  return { name: "migration-naming", violations };
}

async function workspaceBoundaries() {
  const files = await walk("packages", [".ts", ".tsx"]);
  const violations = [];
  for (const f of files) {
    const txt = await readFile(f, "utf8");
    txt.split("\n").forEach((line, idx) => {
      if (/from\s+["']@stork\/web["']/.test(line) || /from\s+["'].*apps\/web/.test(line)) {
        violations.push(
          `${rel(f)}:${idx + 1}: packages/ må ikke importere fra @stork/web — afhængighedsretning er web → packages, ikke omvendt`,
        );
      }
    });
  }
  return { name: "workspace-boundaries", violations };
}

async function noHardcodedSupabaseUrls() {
  const files = await walk("apps/web/src", [".ts", ".tsx"]);
  const violations = [];
  const re = /https?:\/\/[a-z0-9]+\.supabase\.co/i;
  for (const f of files) {
    const txt = await readFile(f, "utf8");
    txt.split("\n").forEach((line, idx) => {
      if (re.test(line)) {
        violations.push(`${rel(f)}:${idx + 1}: hardkodet supabase URL — flyt til env-variabel`);
      }
    });
  }
  return { name: "no-hardcoded-supabase-urls", violations };
}

// D6 check 1: migrations der muterer feature-tabeller skal sætte session-vars
// stork.source_type + stork.change_reason inden mutation.
// Pragmatisk per-fil-check: hvis filen indeholder INSERT/UPDATE/DELETE på
// en feature-tabel (ikke information_schema, ikke audit_log selv), kræver
// vi at filen også sætter begge session-vars et sted før.
//
// Hvis migration KUN udfører DDL (CREATE TABLE, ALTER, CREATE TRIGGER,
// CREATE FUNCTION, GRANT/REVOKE), kræves ingen session-vars.
async function migrationSetConfigDiscipline() {
  const violations = [];
  const migrations = await readMigrationFiles();
  for (const { file, path, sql } of migrations) {
    if (GRANDFATHERED_NO_SETCONFIG_DISCIPLINE.has(file)) continue;
    // Strip kommentarer OG dollar-quoted-strings: INSERT inden i en
    // CREATE FUNCTION-body eksekverer først ved runtime og er ikke
    // migration-tidens mutation.
    const cleaned = stripDollarQuoted(stripSqlComments(sql));
    // Mutation i public eller core_* (alle feature-tabeller).
    const hasMutation =
      /\b(INSERT\s+INTO|UPDATE\s+|DELETE\s+FROM)\s+(public|core_compliance|core_identity|core_money|app_\w+)\./i.test(
        cleaned,
      );
    if (!hasMutation) continue;
    const hasSourceType = /set_config\s*\(\s*'stork\.source_type'/i.test(cleaned);
    const hasChangeReason = /set_config\s*\(\s*'stork\.change_reason'/i.test(cleaned);
    if (!hasSourceType || !hasChangeReason) {
      const missing = [];
      if (!hasSourceType) missing.push("stork.source_type");
      if (!hasChangeReason) missing.push("stork.change_reason");
      violations.push(`${rel(path)}: muterer feature-tabel uden at sætte session-var(s): ${missing.join(", ")}`);
    }
  }
  return { name: "migration-set-config-discipline", violations };
}

// D6 check 2: nye CREATE TABLE skal enten have dedup_key text-kolonne
// ELLER eksplicit "-- no-dedup-key: <reason>" comment i migration-filen.
// Tabeller oprettet før D6 er grandfathered (se GRANDFATHERED_NO_DEDUP_KEY).
async function dedupKeyOrOptOut() {
  const violations = [];
  const migrations = await readMigrationFiles();
  const createTableRe =
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:(\w+)\.)?(\w+)\s*\(([\s\S]*?)\)\s*(?:WITH\s*\([^)]*\)\s*)?(?:TABLESPACE\s+\w+\s*)?;/gi;
  for (const { path, sql } of migrations) {
    // Strip kommentarer så CREATE TABLE i docs ikke fanger.
    const cleaned = stripSqlComments(sql);
    // Opt-out marker SØGES i raw SQL (det er bevidst en kommentar
    // foran CREATE TABLE — markeret med "-- no-dedup-key: <reason>").
    const optOutRe = /--\s*no-dedup-key:\s*\S+/i;
    const hasOptOut = optOutRe.test(sql);
    createTableRe.lastIndex = 0;
    let m;
    while ((m = createTableRe.exec(cleaned)) !== null) {
      const schema = (m[1] || "public").toLowerCase();
      const table = m[2].toLowerCase();
      const qualified = `${schema}.${table}`;
      if (GRANDFATHERED_NO_DEDUP_KEY.has(qualified)) continue;
      const body = m[3];
      const hasDedupKey = /\bdedup_key\s+\w+/i.test(body);
      if (!hasDedupKey && !hasOptOut) {
        violations.push(
          `${rel(path)}: ${qualified} mangler enten dedup_key-kolonne eller "-- no-dedup-key: <reason>"-marker`,
        );
      }
    }
  }
  return { name: "dedup-key-or-opt-out", violations };
}

// D6 check 3: immutable tabeller (med BEFORE UPDATE/DELETE-blokering)
// skal også blokere TRUNCATE eksplicit. TRUNCATE bypassser row-level
// triggers og er en gengivelse-bypass uden BEFORE TRUNCATE-trigger.
async function truncateBlockedOnImmutable() {
  const violations = [];
  const migrations = await readMigrationFiles();
  const allSql = migrations.map((x) => x.sql).join("\n");
  for (const qualified of IMMUTABLE_TABLES_REQUIRE_TRUNCATE_BLOCK) {
    // Find CREATE TRIGGER ... BEFORE TRUNCATE ON <qualified> i en
    // hvilken som helst migration-fil.
    const re = new RegExp(
      `CREATE\\s+TRIGGER\\s+\\w+\\s+BEFORE\\s+TRUNCATE\\s+ON\\s+${qualified.replace(".", "\\.")}\\b`,
      "i",
    );
    if (!re.test(allSql)) {
      violations.push(
        `${qualified}: immutable tabel uden BEFORE TRUNCATE-trigger (TRUNCATE bypasser DELETE-blokering)`,
      );
    }
  }
  return { name: "truncate-blocked-on-immutable", violations };
}

// D6 check 4: cron.schedule()-kald skal sætte stork.change_reason i
// command-body. Audit-trail for cron-mutationer ville ellers være tom.
async function cronChangeReason() {
  const violations = [];
  const migrations = await readMigrationFiles();
  for (const { path, sql } of migrations) {
    // Find cron.schedule( ... )
    const re = /cron\.schedule\s*\(/gi;
    let m;
    while ((m = re.exec(sql)) !== null) {
      // Find matching close-paren (depth-aware, quote-aware)
      let i = m.index + m[0].length;
      let depth = 1;
      let inQuote = false;
      let inDollar = false;
      let dollarTag = "";
      while (i < sql.length && depth > 0) {
        const ch = sql[i];
        if (inDollar) {
          if (sql.slice(i, i + dollarTag.length) === dollarTag) {
            inDollar = false;
            i += dollarTag.length;
            continue;
          }
          i++;
          continue;
        }
        if (inQuote) {
          if (ch === "'") {
            if (sql[i + 1] === "'") {
              i += 2;
              continue;
            }
            inQuote = false;
          }
          i++;
          continue;
        }
        const dm = sql.slice(i).match(/^\$(\w*)\$/);
        if (dm) {
          dollarTag = dm[0];
          inDollar = true;
          i += dm[0].length;
          continue;
        }
        if (ch === "'") {
          inQuote = true;
          i++;
          continue;
        }
        if (ch === "(") depth++;
        else if (ch === ")") depth--;
        i++;
      }
      const callBody = sql.slice(m.index, i);
      if (!/set_config\s*\(\s*'stork\.change_reason'/i.test(callBody)) {
        // Find linje-nummer
        const upto = sql.slice(0, m.index);
        const line = (upto.match(/\n/g) || []).length + 1;
        violations.push(
          `${rel(path)}:${line}: cron.schedule mangler set_config('stork.change_reason', ...) i command-body`,
        );
      }
    }
  }
  return { name: "cron-change-reason", violations };
}

// D6 check 5: spørg Supabase Management API om RLS-aktiverede tabeller
// uden policies. Default-deny er OK, men skal være dokumenteret via
// skip-force-rls-marker. Skip hvis SUPABASE_ACCESS_TOKEN ikke er sat
// (lokal udvikling uden Supabase-link).
async function dbRlsPolicies() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const projectRef = process.env.SUPABASE_PROJECT_REF || "imtxvrymaqbgcvsarlib";
  if (!token) {
    return { name: "db-rls-policies", violations: [], skipped: "SUPABASE_ACCESS_TOKEN ikke sat" };
  }

  // R7f: udvidet fra kun 'public' til alle stork-schemas
  const query = `
    SELECT n.nspname AS schema, c.relname AS table_name,
           (SELECT count(*) FROM pg_policy p WHERE p.polrelid = c.oid) AS policy_count
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
      AND c.relrowsecurity = true
      AND n.nspname IN ('public', 'core_compliance', 'core_identity', 'core_money', 'core_time')
    ORDER BY 1, 2;
  `;

  let body;
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) {
      return {
        name: "db-rls-policies",
        violations: [`Management API returned ${res.status}; check skipped`],
        soft: true,
      };
    }
    body = await res.json();
  } catch (err) {
    return { name: "db-rls-policies", violations: [`Network fejl: ${err.message}; check skipped`], soft: true };
  }

  // Tabeller med 0 policies = default deny. Det er OK hvis dokumenteret
  // via "-- skip-force-rls:" eller "-- default-deny:" markør i nogen
  // migration-fil for den tabel. Ellers violation.
  const migrations = await readMigrationFiles();
  const allSql = migrations.map((x) => x.sql).join("\n");
  const violations = [];
  const rows = Array.isArray(body) ? body : body.result || body.rows || [];
  for (const row of rows) {
    if (row.policy_count > 0) continue;
    const qualified = `${row.schema}.${row.table_name}`;
    const markerRe = new RegExp(
      `--\\s*(skip-force-rls|default-deny):\\s*\\S+[\\s\\S]*?${qualified.replace(".", "\\.")}|${qualified.replace(".", "\\.")}[\\s\\S]*?--\\s*(skip-force-rls|default-deny):`,
      "i",
    );
    if (!markerRe.test(allSql)) {
      violations.push(
        `${qualified}: RLS ENABLE'd men 0 policies og ingen "-- skip-force-rls:" eller "-- default-deny:" markør`,
      );
    }
  }
  return { name: "db-rls-policies", violations };
}

// R2 check: audit-trigger-coverage. Hver core_*-tabel skal enten have en
// stork_audit-trigger ELLER stå i AUDIT_EXEMPT_SNAPSHOT_TABLES. Det forhindrer
// at man ved et uheld opretter en feature-tabel uden audit-spor.
//
// One-way: tabeller i allowlisten må have trigger (det er ikke en fejl); men
// tabeller udenfor allowlisten skal have triggeren. Dvs. master-plan rettelse
// 23 sikrer eksplicit dokumentation når audit udelades; tilstedeværelsen af
// trigger på en allowlistet tabel er stadig OK (overkill, ikke under-coverage).
async function auditTriggerCoverage() {
  const violations = [];
  const migrations = await readMigrationFiles();
  const allCleaned = migrations.map((m) => stripSqlComments(m.sql)).join("\n");

  // Find alle CREATE TABLE i core_*-schemas
  const createTableRe = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:(\w+)\.)?(\w+)\s*\(/gi;
  const tables = new Set();
  let m;
  while ((m = createTableRe.exec(allCleaned)) !== null) {
    const schema = (m[1] || "public").toLowerCase();
    const table = m[2].toLowerCase();
    if (schema.startsWith("core_")) tables.add(`${schema}.${table}`);
  }

  // Fjern tabeller der senere er droppet (DROP TABLE schema.name).
  const dropTableRe = /DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:(\w+)\.)?(\w+)\b/gi;
  while ((m = dropTableRe.exec(allCleaned)) !== null) {
    const schema = (m[1] || "public").toLowerCase();
    const table = m[2].toLowerCase();
    tables.delete(`${schema}.${table}`);
  }

  for (const qualified of tables) {
    if (AUDIT_LOG_SELF_EXCLUSION_RE.test(qualified)) continue;
    if (AUDIT_EXEMPT_SNAPSHOT_TABLES.has(qualified)) continue;
    // Skal have stork_audit-trigger et eller andet sted i migrations.
    // Pattern: CREATE TRIGGER <name> (BEFORE|AFTER) ... ON <qualified> ... stork_audit
    const triggerRe = new RegExp(
      `CREATE\\s+TRIGGER\\s+\\w+\\s+(?:BEFORE|AFTER)\\s+[\\s\\S]*?ON\\s+${qualified.replace(".", "\\.")}\\b[\\s\\S]*?stork_audit`,
      "i",
    );
    if (!triggerRe.test(allCleaned)) {
      violations.push(
        `${qualified}: mangler stork_audit-trigger (tilfoej audit-trigger i migration ELLER placer tabellen i AUDIT_EXEMPT_SNAPSHOT_TABLES med kode-commit + review)`,
      );
    }
  }

  // Verificér at allowlist-entries faktisk eksisterer i CREATE TABLE
  // (forhindrer drift: liste-entry for tabel der ikke længere oprettes)
  for (const qualified of AUDIT_EXEMPT_SNAPSHOT_TABLES) {
    if (!tables.has(qualified)) {
      violations.push(
        `${qualified}: er i AUDIT_EXEMPT_SNAPSHOT_TABLES men ingen CREATE TABLE-statement findes — fjern fra allowlist`,
      );
    }
  }

  return { name: "audit-trigger-coverage", violations };
}

// D3 check: bootstrap-INSERT'er i klassifikations-/konfig-tabeller skal være
// idempotente via ON CONFLICT-klausul (DO NOTHING eller DO UPDATE). Direkte
// INSERT i bootstrap-tabel uden ON CONFLICT er drift — replay vil enten
// duplikere eller fejle.
//
// Pragmatisk per-statement-tjek: for hver INSERT INTO bootstrap-table-statement,
// scan resten af statementet (frem til afsluttende `;`) for ON CONFLICT.
// Statement-grænser respekteres ved at scanne fra match til næste top-level `;`
// (depth-tracking på parentheses + ignore semicolons i strings/dollar-quoted).
async function migrationOnConflictDiscipline() {
  const violations = [];
  const migrations = await readMigrationFiles();
  for (const { file, path, sql } of migrations) {
    if (GRANDFATHERED_NO_ON_CONFLICT.has(file)) continue;
    // Strip kommentarer + dollar-quoted (function-bodies eksekverer ved runtime,
    // ikke migration-tid; deres INSERT'er er ikke "bootstrap").
    const cleaned = stripDollarQuoted(stripSqlComments(sql));

    const insertRe = /INSERT\s+INTO\s+([a-z_][a-z0-9_]*)\.([a-z_][a-z0-9_]*)/gi;
    let m;
    while ((m = insertRe.exec(cleaned)) !== null) {
      const qualified = `${m[1].toLowerCase()}.${m[2].toLowerCase()}`;
      if (!BOOTSTRAP_CONFIG_TABLES.has(qualified)) continue;

      // Find slutningen af INSERT-statement (næste top-level `;`)
      let i = m.index + m[0].length;
      let depth = 0;
      let inSingleQuote = false;
      while (i < cleaned.length) {
        const ch = cleaned[i];
        if (inSingleQuote) {
          if (ch === "'") {
            if (cleaned[i + 1] === "'") {
              i += 2;
              continue;
            }
            inSingleQuote = false;
          }
          i++;
          continue;
        }
        if (ch === "'") {
          inSingleQuote = true;
          i++;
          continue;
        }
        if (ch === "(") depth++;
        else if (ch === ")") depth--;
        else if (ch === ";" && depth === 0) break;
        i++;
      }
      const stmt = cleaned.slice(m.index, i);
      if (!/ON\s+CONFLICT\b/i.test(stmt)) {
        // Find line-number
        const upto = cleaned.slice(0, m.index);
        const line = (upto.match(/\n/g) || []).length + 1;
        violations.push(
          `${rel(path)}:${line}: INSERT INTO ${qualified} uden ON CONFLICT-klausul (bootstrap-tabel kraever DO NOTHING/DO UPDATE for replay-idempotence)`,
        );
      }
    }
  }
  return { name: "migration-on-conflict-discipline", violations };
}

// D4 check (R-runde-2): aktive anonymization_mappings.table_name skal have
// en RLS-policy paa target-tabellen der bruger stork.allow_<table>_write
// som session-var-gate. Forhindrer fremtidig drift hvor ny entity_type
// tilfoejes uden matching write-policy.
//
// Live-query via Management API. Skip-when-no-token (samme pattern som
// db-rls-policies). Polcmd ∈ {a,w,d,*} = INSERT/UPDATE/DELETE/ALL.
async function writePolicySessionVarConsistency() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const projectRef = process.env.SUPABASE_PROJECT_REF || "imtxvrymaqbgcvsarlib";
  if (!token) {
    return {
      name: "write-policy-session-var-consistency",
      violations: [],
      skipped: "SUPABASE_ACCESS_TOKEN ikke sat",
    };
  }

  const query = `
    WITH active_mappings AS (
      SELECT table_schema, table_name
      FROM core_compliance.anonymization_mappings
      WHERE status = 'active' AND is_active = true
    ),
    target_policies AS (
      SELECT
        n.nspname AS schema_name,
        c.relname AS table_name,
        array_agg(DISTINCT m[1]) FILTER (WHERE m[1] IS NOT NULL) AS write_vars
      FROM pg_policy p
      JOIN pg_class c ON c.oid = p.polrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      LEFT JOIN LATERAL regexp_matches(
        coalesce(pg_get_expr(p.polqual, p.polrelid), '') || ' ' ||
        coalesce(pg_get_expr(p.polwithcheck, p.polrelid), ''),
        'stork\\.allow_(\\w+)_write', 'g'
      ) m ON true
      WHERE p.polcmd IN ('a', 'w', 'd', '*')
      GROUP BY n.nspname, c.relname
    )
    SELECT m.table_schema, m.table_name,
           coalesce(tp.write_vars, ARRAY[]::text[]) AS write_vars,
           m.table_name = ANY(coalesce(tp.write_vars, ARRAY[]::text[])) AS has_expected_var
    FROM active_mappings m
    LEFT JOIN target_policies tp
      ON tp.schema_name = m.table_schema AND tp.table_name = m.table_name;
  `;

  let body;
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) {
      return {
        name: "write-policy-session-var-consistency",
        violations: [`Management API returned ${res.status}; check skipped`],
        soft: true,
      };
    }
    body = await res.json();
  } catch (err) {
    return {
      name: "write-policy-session-var-consistency",
      violations: [`Network fejl: ${err.message}; check skipped`],
      soft: true,
    };
  }

  const rows = Array.isArray(body) ? body : body.result || body.rows || [];
  const violations = [];
  for (const row of rows) {
    if (!row.has_expected_var) {
      violations.push(
        `${row.table_schema}.${row.table_name}: aktiv mapping mangler write-policy med stork.allow_${row.table_name}_write (har: ${JSON.stringify(row.write_vars)})`,
      );
    }
  }
  return { name: "write-policy-session-var-consistency", violations };
}

// D5 check (R-runde-2): readers af lifecycle-tabeller skal læse med BÅDE
// status='active' AND is_active=true. Live introspection via
// pg_get_functiondef + cron.job.command. Skip-when-no-token.
//
// Pattern: hver function-body / cron-body med `is_active = true` skal
// også indeholde `status = 'active'`. False-positives accepteret hvis
// patterns lever i samme function-body — per-occurrence-detection er G035.
async function legacyIsActiveReaders() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const projectRef = process.env.SUPABASE_PROJECT_REF || "imtxvrymaqbgcvsarlib";
  if (!token) {
    return {
      name: "legacy-is-active-readers",
      violations: [],
      skipped: "SUPABASE_ACCESS_TOKEN ikke sat",
    };
  }

  const query = `
    WITH functions AS (
      SELECT n.nspname || '.' || p.proname AS site,
             pg_get_function_arguments(p.oid) AS args,
             pg_get_functiondef(p.oid) AS body
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname IN ('core_identity','core_compliance','core_money','core_time')
        AND p.prokind = 'f'
    ),
    cron_bodies AS (
      SELECT 'cron.' || jobname AS site, '' AS args, command AS body
      FROM cron.job
    )
    SELECT site, args FROM functions
    WHERE body ~* '(?:where|and)\\s+[\\w\\.]*is_active\\s*=\\s*true'
      AND body !~* 'status\\s*=\\s*''active'''
    UNION ALL
    SELECT site, args FROM cron_bodies
    WHERE body ~* '(?:where|and)\\s+[\\w\\.]*is_active\\s*=\\s*true'
      AND body !~* 'status\\s*=\\s*''active''';
  `;

  let body;
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) {
      return {
        name: "legacy-is-active-readers",
        violations: [`Management API returned ${res.status}; check skipped`],
        soft: true,
      };
    }
    body = await res.json();
  } catch (err) {
    return {
      name: "legacy-is-active-readers",
      violations: [`Network fejl: ${err.message}; check skipped`],
      soft: true,
    };
  }

  const rows = Array.isArray(body) ? body : body.result || body.rows || [];
  const violations = rows
    .filter((r) => !LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS.has(r.site))
    .map((r) => `${r.site}(${r.args}): is_active=true reader uden status='active'-check (R7d-pattern)`);
  return { name: "legacy-is-active-readers", violations };
}

// H024: DB-tests der INSERT'er i immutable/lifecycle-DELETE-blokerede tabeller
// skal bruge BEGIN/ROLLBACK wrap. Forhindrer non-idempotente tests (G043/G044
// grundårsag). Falsk-negativ-afgrænsning: fanger ikke RPC-side-effects der
// INSERT'er indirekte (G-nummer for senere Mønster D-udvidelse).
//
// Allowlist: `-- no-transaction-needed: <reason>` linje i fil-toppen undertrykker
// check for hele filen.
async function dbTestTxWrapOnImmutableInsert() {
  const violations = [];
  const testsDir = "supabase/tests";
  const files = await collectSqlFiles(testsDir);
  // Byg regex for hver tabel: matcher "insert into <schema>.<table>" case-insensitive
  const insertPatterns = TX_WRAP_REQUIRED_FOR_TEST_INSERT.map((qname) => ({
    qname,
    re: new RegExp(`insert\\s+into\\s+${qname.replace(".", "\\.")}\\b`, "i"),
  }));
  for (const file of files) {
    const content = await readFile(join(ROOT, file), "utf8");
    // Allowlist-eskap
    if (/^\s*--\s*no-transaction-needed\s*:/im.test(content)) continue;
    const hits = insertPatterns.filter((p) => p.re.test(content));
    if (hits.length === 0) continue;
    // Krav: filen har eksplicit `begin;` OG `rollback;` på linje-niveau
    const hasBegin = /^\s*begin\s*;\s*$/im.test(content);
    const hasRollback = /^\s*rollback\s*;\s*$/im.test(content);
    if (hasBegin && hasRollback) continue;
    const tableList = hits.map((h) => h.qname).join(", ");
    violations.push(`${file}: INSERT i [${tableList}] uden BEGIN/ROLLBACK wrap`);
  }
  return { name: "db-test-tx-wrap-on-immutable-insert", violations };
}

async function collectSqlFiles(dir) {
  const out = [];
  async function recurse(d) {
    let entries;
    try {
      entries = await readdir(join(ROOT, d), { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (SKIP_DIRS.has(e.name)) continue;
      const sub = `${d}/${e.name}`;
      if (e.isDirectory()) await recurse(sub);
      else if (e.name.endsWith(".sql")) out.push(sub);
    }
  }
  await recurse(dir);
  return out;
}

// ─── T9-test-disciplin (G053 refactor 2026-05-19) ──────────────────────────
//
// Tre værn der låser hermetisk-fixture-kontrakten for T9-smoke-tests:
//   db-test-no-disabled-sql        — midlertidige .sql.disabled må ikke merges
//   db-test-no-t9-seed-user-fixtures — t9_*.sql må ikke bruge mg@/km@ mutable
//   db-test-no-t9-skip-guards      — t9_*.sql må ikke skippe ved manglende tabel

async function dbTestNoDisabledSql() {
  const violations = [];
  const testsDir = "supabase/tests";
  async function recurse(d) {
    let entries;
    try {
      entries = await readdir(join(ROOT, d), { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (SKIP_DIRS.has(e.name)) continue;
      const sub = `${d}/${e.name}`;
      if (e.isDirectory()) await recurse(sub);
      else if (e.name.endsWith(".sql.disabled")) {
        violations.push(`${sub}: disabled DB-test må ikke merges (rename til .sql + fix testen, eller slet)`);
      }
    }
  }
  await recurse(testsDir);
  return { name: "db-test-no-disabled-sql", violations };
}

async function dbTestNoT9SeedUserFixtures() {
  const violations = [];
  const dir = "supabase/tests/smoke";
  let entries;
  try {
    entries = await readdir(join(ROOT, dir), { withFileTypes: true });
  } catch {
    return { name: "db-test-no-t9-seed-user-fixtures", violations };
  }
  const seedUsers = ["mg@copenhagensales.dk", "km@copenhagensales.dk"];
  for (const e of entries) {
    if (!e.isFile() || !e.name.startsWith("t9_") || !e.name.endsWith(".sql")) continue;
    const file = `${dir}/${e.name}`;
    const content = await readFile(join(ROOT, file), "utf8");
    if (/^\s*--\s*allow-bootstrap-seed-user-test\s*:/im.test(content)) continue;
    for (const u of seedUsers) {
      if (content.includes(u)) {
        violations.push(
          `${file}: bruger seed-user "${u}" som fixture — forbudt. Brug throwaway employees med uuid-suffix-emails, eller tilføj "-- allow-bootstrap-seed-user-test: <reason>" hvis testen er read-only seed/auth verification.`,
        );
        break;
      }
    }
  }
  return { name: "db-test-no-t9-seed-user-fixtures", violations };
}

async function postgrestT9SchemaExposure() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const projectRef = process.env.SUPABASE_PROJECT_REF || "imtxvrymaqbgcvsarlib";

  // T9-supplement Step 5 + Codex runde 2 follow-up: deterministisk schema-exposure-
  // canary via PostgREST OpenAPI-introspection (ikke RPC-call). Service_role har
  // ingen direkte data-grants på core_identity-tabeller — en security-invoker RPC
  // ville fejle med 42501 uanset om schemaet er korrekt eksponeret. OpenAPI-spec
  // verificerer schema + cache-state uden at kræve tabel-access.
  // Hard-fail hvis SUPABASE_ACCESS_TOKEN mangler i CI; skip lokalt for udvikler-flow.
  if (!token) {
    return {
      name: "postgrest-t9-schema-exposure",
      violations: [],
      skipped: "SUPABASE_ACCESS_TOKEN ikke sat (lokal udvikler-mode)",
    };
  }

  let serviceRoleKey;
  try {
    const apiKeysRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/api-keys`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!apiKeysRes.ok) {
      return {
        name: "postgrest-t9-schema-exposure",
        violations: [`Management API /api-keys returned ${apiKeysRes.status}`],
      };
    }
    const keys = await apiKeysRes.json();
    const serviceKeyEntry = (Array.isArray(keys) ? keys : keys.data || []).find(
      (k) => k.name === "service_role" || k.type === "service_role",
    );
    if (!serviceKeyEntry) {
      return {
        name: "postgrest-t9-schema-exposure",
        violations: [`service_role-key ikke fundet i /api-keys response`],
      };
    }
    serviceRoleKey = serviceKeyEntry.api_key;
  } catch (err) {
    return {
      name: "postgrest-t9-schema-exposure",
      violations: [`Netværksfejl ved api-keys-hent: ${err.message}`],
    };
  }

  // PostgREST OpenAPI-introspection: GET /rest/v1/ med Accept-Profile=core_identity.
  // Hvis schemaet er eksponeret + cachen er fresh, returnerer PostgREST en OpenAPI
  // spec hvor T9-RPCs (org_tree_read etc.) er listet under "paths". Verifikationen
  // kræver ingen tabel-SELECT-grant på service_role (modsat tidligere RPC-call —
  // service_role har bevidst ingen direkte data-grants på core_identity, så et
  // RPC-call med security invoker ville fejle med 42501 selv ved korrekt exposure).
  //
  // Sentinel-RPCs der skal være i spec'en for at bevise schema + cache er friske.
  const expectedRpcs = [
    "/rpc/org_tree_read",
    "/rpc/permission_elements_read",
    "/rpc/employee_placement_read",
    "/rpc/client_placement_read",
    "/rpc/pending_changes_read",
  ];

  try {
    const specRes = await fetch(`https://${projectRef}.supabase.co/rest/v1/`, {
      method: "GET",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Accept-Profile": "core_identity",
        Accept: "application/openapi+json",
      },
    });

    if (!specRes.ok) {
      const body = await specRes.text();
      return {
        name: "postgrest-t9-schema-exposure",
        violations: [
          `OpenAPI-introspection fejlede: HTTP ${specRes.status}. ` +
            `Forventet 200 med Accept-Profile: core_identity. ` +
            `Body: ${body.slice(0, 200)}`,
        ],
      };
    }

    const spec = await specRes.json();
    const paths = (spec && spec.paths) || {};
    const missing = expectedRpcs.filter((p) => !(p in paths));
    if (missing.length > 0) {
      return {
        name: "postgrest-t9-schema-exposure",
        violations: [
          `core_identity er eksponeret men T9-RPCs mangler i OpenAPI-spec: ${missing.join(", ")}. ` +
            `Mulige årsager: PostgREST schema-cache stale (notify pgrst, 'reload schema'), ` +
            `eller RPC'erne mangler i remote DB (tjek migrations-state).`,
        ],
      };
    }
    return { name: "postgrest-t9-schema-exposure", violations: [] };
  } catch (err) {
    return {
      name: "postgrest-t9-schema-exposure",
      violations: [`Netværksfejl ved OpenAPI-introspection: ${err.message}`],
    };
  }
}

async function dbTestNoT9SkipGuards() {
  const violations = [];
  const dir = "supabase/tests/smoke";
  let entries;
  try {
    entries = await readdir(join(ROOT, dir), { withFileTypes: true });
  } catch {
    return { name: "db-test-no-t9-skip-guards", violations };
  }
  // Skip-guard-mønster: information_schema.tables-lookup + raise notice "skipping" + early return.
  // T9 er deployed; manglende schema skal være rød test, ikke silent skip.
  const skipPatterns = [/information_schema\.tables/i, /pre-migration state/i, /not yet created;\s*skipping/i];
  for (const e of entries) {
    if (!e.isFile() || !e.name.startsWith("t9_") || !e.name.endsWith(".sql")) continue;
    const file = `${dir}/${e.name}`;
    const content = await readFile(join(ROOT, file), "utf8");
    for (const re of skipPatterns) {
      if (re.test(content)) {
        violations.push(
          `${file}: indeholder skip-guard-mønster (/${re.source}/). T9 er deployed; manglende schema skal være rød test, ikke silent skip.`,
        );
        break;
      }
    }
  }
  return { name: "db-test-no-t9-skip-guards", violations };
}

// ─── runner ────────────────────────────────────────────────────────────────

// ─── gov-3a: §3-blockers #4, #7, #16, #17 ────────────────────────────────────
// #4/#7 = static + final-state-aware (Codex: droppede tabeller ignoreres; sidste
// guard-funktions-def vinder). #16/#17 = live introspektion (robust mod fragil
// static FK-source-schema-parsing; skip uden token, mønster som dbRlsPolicies).

// Hver immutable tabel → dens GUARD-trigger (identificeret via execute-funktion). #4 validerer at
// netop guard-triggeren dækker update+delete — IKKE union af alle before-triggere (en almindelig
// before-update som *_set_updated_at må ikke "dække" UPDATE-immutabilitet). flags: felter der MÅ
// muteres (kun conditional felt-guard); null = strict eller lock-and-delete (intet felt-guard, #7 skipper).
const IMMUTABLE_GUARDS = {
  "core_compliance.audit_log": { guardFn: "audit_log_immutability_check", flags: null },
  "core_compliance.anonymization_state": { guardFn: "anonymization_state_immutability_check", flags: null },
  "core_money.cancellations": { guardFn: "cancellations_immutability_check", flags: null },
  "core_money.salary_corrections": { guardFn: "salary_corrections_immutability_check", flags: null },
  "core_money.pay_periods": { guardFn: "pay_periods_lock_and_delete_check", flags: null },
  "core_money.commission_snapshots": {
    guardFn: "commission_snapshots_immutability_check",
    flags: ["is_candidate", "candidate_run_id"],
  },
};
// #17: tilladte cross-schema-FK-mål (grund pr. entry). Nye mål → flag (review/migration-kommentar).
const CROSS_SCHEMA_FK_ALLOWED_TARGETS = {
  "core_identity.employees":
    "actor/medarbejder-ref (created_by, approved_by, employee_id, gdpr_responsible_employee_id m.fl.)",
  "auth.users": "employees.auth_user_id → Supabase auth (Entra-login)",
};

// final-state-aware, kronologisk INDEN FOR hver migration: alle CREATE/DROP table+trigger samles
// som én op-stream sorteret efter match.index og anvendes i kildekode-rækkefølge. DROP TABLE
// cascader til tabellens triggere; CREATE TABLE nulstiller dens trigger-sæt (recreate kræver ny
// trigger). Migrations behandles i filnavn-rækkefølge (readMigrationFiles sorterer).
// Returnerer { tables:Set, triggers:Map(table -> Map(triggerName -> {events, fn})) } — fn = execute-funktion (schema-strippet).
function finalState(migrations) {
  const tables = new Set();
  const triggers = new Map();
  for (const { sql } of migrations) {
    const ops = [];
    for (const m of sql.matchAll(/\bcreate\s+table\s+(?:if\s+not\s+exists\s+)?([a-z_]+\.[a-z0-9_]+)/gi))
      ops.push({ i: m.index, kind: "ct", t: m[1].toLowerCase() });
    for (const m of sql.matchAll(/\bdrop\s+table\s+(?:if\s+exists\s+)?([a-z_]+\.[a-z0-9_]+)/gi))
      ops.push({ i: m.index, kind: "dt", t: m[1].toLowerCase() });
    for (const m of sql.matchAll(
      /\bcreate\s+trigger\s+(\w+)\s+before\s+([a-z\s]+?)\s+on\s+([a-z_]+\.[a-z0-9_]+)[\s\S]{0,200}?execute\s+(?:function|procedure)\s+(?:[a-z_]+\.)?(\w+)/gi,
    ))
      ops.push({
        i: m.index,
        kind: "cg",
        t: m[3].toLowerCase(),
        name: m[1].toLowerCase(),
        events: m[2].toLowerCase(),
        fn: m[4].toLowerCase(),
      });
    for (const m of sql.matchAll(/\bdrop\s+trigger\s+(?:if\s+exists\s+)?(\w+)\s+on\s+([a-z_]+\.[a-z0-9_]+)/gi))
      ops.push({ i: m.index, kind: "dg", t: m[2].toLowerCase(), name: m[1].toLowerCase() });
    ops.sort((a, b) => a.i - b.i);
    for (const o of ops) {
      if (o.kind === "ct") {
        tables.add(o.t);
        triggers.set(o.t, new Map());
      } else if (o.kind === "dt") {
        tables.delete(o.t);
        triggers.delete(o.t);
      } else if (o.kind === "cg") {
        if (!triggers.has(o.t)) triggers.set(o.t, new Map());
        triggers.get(o.t).set(o.name, { events: o.events, fn: o.fn });
      } else if (o.kind === "dg") {
        triggers.get(o.t)?.delete(o.name);
      }
    }
  }
  return { tables, triggers };
}
// sidste create-or-replace-function-blok for en navngiven guard-funktion (final-state).
// Returnerer den dollar-quotede body ($tag$ ... $tag$), så undtagelses-parsing er afgrænset.
function lastFunctionBody(allSql, fnName) {
  const re = /create\s+or\s+replace\s+function\s+([\s\S]*?)\$(\w*)\$([\s\S]*?)\$\2\$/gi;
  let last = null,
    m;
  while ((m = re.exec(allSql))) if (new RegExp(`\\b${fnName}\\b`, "i").test(m[1])) last = m[3];
  return last;
}
async function liveQuery(query) {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const projectRef = process.env.SUPABASE_PROJECT_REF || "imtxvrymaqbgcvsarlib";
  if (!token) return { noToken: true };
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) return { apiError: `Management API ${res.status}` };
    const body = await res.json();
    return { rows: Array.isArray(body) ? body : body.result || body.rows || [] };
  } catch (err) {
    return { apiError: `Network fejl: ${err.message}` };
  }
}
// fail-closed: required live-checks må IKKE skippe-til-grøn i CI. Mangler token / API-fejl i CI = violation.
// Lokalt (uden CI) skippes for udvikler-flow. Returnerer et check-resultat hvis guard rammer, ellers null.
function liveGuard(name, r) {
  if (r.noToken) {
    if (process.env.CI)
      return {
        name,
        violations: [`SUPABASE_ACCESS_TOKEN mangler i CI — required live-check kan ikke køre (fail-closed)`],
      };
    return { name, violations: [], skipped: "SUPABASE_ACCESS_TOKEN ikke sat (lokal)" };
  }
  if (r.apiError) {
    if (process.env.CI) return { name, violations: [`live-query fejl: ${r.apiError} (fail-closed i CI)`] };
    return { name, violations: [r.apiError], soft: true };
  }
  return null;
}

// #4 immutability-trigger: den KONKRETE guard-trigger (identificeret via execute-funktion, ikke
// vilkårlige before-triggere som *_set_updated_at) skal dække BÅDE update OG delete. Final-state-aware.
async function immutabilityTriggerCoverage() {
  const violations = [];
  const migrations = await readMigrationFiles();
  const { tables, triggers } = finalState(migrations);
  for (const [q, cfg] of Object.entries(IMMUTABLE_GUARDS)) {
    if (!tables.has(q.toLowerCase())) continue; // droppet tabel ignoreres
    const trigs = triggers.get(q.toLowerCase()) || new Map();
    const guardFn = cfg.guardFn.toLowerCase();
    let found = false,
      upd = false,
      del = false;
    for (const t of trigs.values()) {
      if (t.fn !== guardFn) continue; // KUN guard-triggeren tæller — ikke set_updated_at o.l.
      found = true;
      if (/\bupdate\b/.test(t.events)) upd = true;
      if (/\bdelete\b/.test(t.events)) del = true;
    }
    if (!found)
      violations.push(
        `${q}: guard-trigger (execute ${cfg.guardFn}) ikke fundet/surviving — immutabilitet ikke håndhævet`,
      );
    else if (!upd || !del)
      violations.push(
        `${q}: guard-trigger ${cfg.guardFn} dækker ikke BÅDE update og delete (update=${upd}, delete=${del})`,
      );
  }
  return { name: "immutability-trigger-coverage", violations };
}

// #7 snapshot-felt-beskyttelse: sidste guard-funktion skal (a) RAISE og (b) undtage PRÆCIS
// mutable-flag-sættet — et ekstra mutérbart snapshot-felt (eller et manglende flag) skal fejle.
async function snapshotFieldProtection() {
  const violations = [];
  const migrations = await readMigrationFiles();
  const allSql = migrations.map((x) => x.sql).join("\n");
  const { tables } = finalState(migrations);
  for (const [q, cfg] of Object.entries(IMMUTABLE_GUARDS)) {
    if (cfg.flags === null || !tables.has(q.toLowerCase())) continue;
    const body = lastFunctionBody(allSql, cfg.guardFn);
    if (!body) {
      violations.push(`${q}: guard-funktion ${cfg.guardFn} ikke fundet`);
      continue;
    }
    // old/new-sammenligning (<> / is distinct from) koblet til RAISE — ikke bare en vilkårlig RAISE.
    // Fanger 'if false then raise' (sammenligning fjernet). Behavioral bevis: db:test r3.
    if (!/\bif\b[\s\S]{0,200}?(<>|is\s+distinct\s+from)[\s\S]{0,200}?\braise\s+(exception|sqlstate)/i.test(body))
      violations.push(
        `${q}: ${cfg.guardFn} har ingen old/new-sammenligning (<> / is distinct from) koblet til RAISE — UPDATE-blokering ikke håndhævet`,
      );
    // jsonb-subtraktions-undtagelser (`- '<felt>'`) skal være PRÆCIS flag-sættet
    const excluded = new Set([...body.matchAll(/-\s*'(\w+)'/g)].map((m) => m[1].toLowerCase()));
    const expected = new Set(cfg.flags.map((f) => f.toLowerCase()));
    const extra = [...excluded].filter((f) => !expected.has(f));
    const missing = [...expected].filter((f) => !excluded.has(f));
    if (extra.length)
      violations.push(
        `${q}: ${cfg.guardFn} undtager EKSTRA felt(er) fra immutabilitet: ${extra.join(", ")} (kun ${cfg.flags.join(", ")} må muteres)`,
      );
    if (missing.length) violations.push(`${q}: ${cfg.guardFn} undtager ikke mutable-flag(s): ${missing.join(", ")}`);
  }
  return { name: "snapshot-field-protection", violations };
}

// #16 schema-ownership (live, fail-closed i CI): ingen stork-tabel i public
async function schemaOwnership() {
  const r = await liveQuery(
    `select c.relname as t from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relkind='r' and n.nspname='public';`,
  );
  const g = liveGuard("schema-ownership", r);
  if (g) return g;
  return {
    name: "schema-ownership",
    violations: r.rows.map((x) => `public.${x.t}: stork-tabel i public — skal ligge i core_*`),
  };
}

// #17 cross-schema-FK (live, fail-closed i CI): cross-schema-FK fra core_* skal ramme allowlist-mål, ellers review
async function crossSchemaFkDiscipline() {
  const r =
    await liveQuery(`select con.conname, sn.nspname||'.'||sc.relname as src, tn.nspname||'.'||tc.relname as target
    from pg_constraint con
    join pg_class sc on con.conrelid=sc.oid join pg_namespace sn on sc.relnamespace=sn.oid
    join pg_class tc on con.confrelid=tc.oid join pg_namespace tn on tc.relnamespace=tn.oid
    where con.contype='f' and sn.nspname<>tn.nspname and sn.nspname like 'core_%';`);
  const g = liveGuard("cross-schema-fk-discipline", r);
  if (g) return g;
  const violations = [];
  for (const row of r.rows)
    if (!CROSS_SCHEMA_FK_ALLOWED_TARGETS[row.target])
      violations.push(
        `${row.src} → ${row.target} (${row.conname}): cross-schema-FK uden allowlist-mønster — kræver review/migration-kommentar`,
      );
  return { name: "cross-schema-fk-discipline", violations };
}

// ─── gov-3b-1: §3-blockers #19 (FK-dækning) + #6 (indeks pr. policy-prædikat) ──
// Begge live (pg_catalog = kilde-of-truth, robust mod fragil migration-parsing), fail-closed i CI.

// #19: *_id-kolonner på core_* der bevidst IKKE har FK (permanent, begrundet). Polymorfe/eksterne refs.
const FK_COVERAGE_EXEMPTIONS = {
  "core_compliance.anonymization_state.entity_id": "polymorf (entity_type-diskriminator) — ingen enkelt-tabel-target",
  "core_compliance.audit_log.actor_user_id":
    "audit skal overleve sletning af aktør; FK ville koble audit til users-livscyklus (cascade/block) og bryde audit-immutabilitet",
  "core_compliance.audit_log.record_id": "polymorf (peger på række i vilkårlig auditeret tabel via tabel-navn-kolonne)",
  "core_compliance.break_glass_requests.target_id": "polymorf (mål-entitet varierer per operation_type)",
  "core_identity.pending_changes.target_id": "polymorf (mål varierer per change_type)",
  "core_money.cancellations.match_id": "ekstern CRM-match-id, ikke en intern tabel-PK",
};
// #19: *_id-kolonner hvis FK er BESLUTTET men afventer target-tabellens eksistens (selv-udløbende).
// Honoreres KUN mens target-tabellen er fraværende; findes target uden FK → violation (grace udløbet).
// Spores af [H025] (Trin 14): tilføj FK + ryd orphans + fjern entry her. Anti-permanens (jf. G063).
const FK_PENDING = {
  "core_money.cancellations.source_sale_id": { targetTable: "core_money.sales" },
  "core_money.commission_snapshots.sale_id": { targetTable: "core_money.sales" },
  "core_money.salary_corrections.source_sale_id": { targetTable: "core_money.sales" },
};
// #6: policy-prædikat-kolonner der bevidst ikke har ledende indeks (lav selektivitet / sekundære).
const POLICY_INDEX_EXEMPTIONS = {
  "core_identity.pending_changes.action_id": "NULL-check, ikke selektivt scope-filter",
  "core_identity.pending_changes.change_type": "sekundær OR-betingelse (koblet til action_id IS NULL)",
  "core_money.commission_snapshots.is_candidate": "boolean-flag, lav selektivitet",
};

// #19 helper (ren — unit-testet i selftest): klassificér en *_id-kolonne. Returnerer violation-streng eller null.
export function classifyIdColumn(key, { isPK, hasFK, targetExists }) {
  if (isPK) return null; // PK (fx version_id) — ikke FK-kandidat
  if (hasFK) return null; // allerede dækket
  if (FK_COVERAGE_EXEMPTIONS[key]) return null; // permanent, begrundet
  if (FK_PENDING[key]) {
    if (targetExists)
      return `${key}: FK_PENDING-target ${FK_PENDING[key].targetTable} findes nu, men FK mangler — grace udløbet (tilføj FK + fjern FK_PENDING-entry, jf. [H025])`;
    return null; // honoreres mens target-tabel fraværende
  }
  return `${key}: *_id-reference uden FK, PK eller exemption — tilføj FK eller begrund i FK_COVERAGE_EXEMPTIONS`;
}

// #6 helper (ren — unit-testet i selftest): udtræk current-table-prædikat-kolonner fra en policy-qual.
// (1) strip current_setting('...')-kald (string-arg må ikke forveksles med kolonne); (2) eksplicit
// current-table-kvalificering (<tabel>.col / <schema>.<tabel>.col) tælles; (3) alle kvalificerede refs
// (alias.col / schema.table.col) fjernes; (4) ukvalificerede tokens der matcher current-table-kolonner
// tælles (fanger korreleret action_id). Codex HØJ-fix: fremmede refs falsk-matcher ikke current-table.
export function predicateColumns(expr, tableCols, tableName) {
  const cols = new Set((tableCols || []).map((c) => c.toLowerCase()));
  const lowerName = (tableName || "").toLowerCase();
  const short = lowerName.includes(".") ? lowerName.split(".").pop() : lowerName;
  const s = (expr || "").toLowerCase().replace(/current_setting\s*\([^)]*\)/g, " ");
  const found = new Set();
  const dotted = /\b[a-z_][a-z0-9_]*(?:\.[a-z_][a-z0-9_]*)+\b/g;
  // (2) eksplicit current-table-kvalificering: <tabel>.col eller <schema>.<tabel>.col
  for (const m of s.matchAll(dotted)) {
    const parts = m[0].split(".");
    const col = parts.at(-1);
    const qualifier = parts.slice(0, -1).join(".");
    if ((qualifier === short || qualifier === lowerName) && cols.has(col)) found.add(col);
  }
  // (3) fjern ALLE kvalificerede refs som hele dotted chains; (4) tokenisér resten
  const unqualified = s.replace(dotted, " ");
  for (const tok of unqualified.match(/[a-z_][a-z0-9_]*/g) || []) if (cols.has(tok)) found.add(tok);
  return found;
}

// #6 helper (ren — unit-testet): leading btree-kolonner pr. tabel. Non-btree må ikke tælle som dækning.
export function leadingBtreeColumns(rows) {
  const byTbl = new Map();
  for (const row of rows || []) {
    if ((row.amname || row.am || "").toLowerCase() !== "btree") continue;
    if (!byTbl.has(row.tbl)) byTbl.set(row.tbl, new Set());
    byTbl.get(row.tbl).add(row.col.toLowerCase());
  }
  return byTbl;
}

// #19 FK-dækning (live, fail-closed i CI): hver *_id-reference på core_* har FK, er PK, er exempt,
// eller er FK_PENDING (kun mens target fraværende). Partition-børn springes over (deler forælder-kolonner).
async function fkCoverage() {
  const r = await liveQuery(
    `select n.nspname||'.'||c.relname as tbl, a.attname as col,
       exists(select 1 from pg_constraint k where k.conrelid=c.oid and k.contype='p' and a.attnum=any(k.conkey)) as is_pk,
       exists(select 1 from pg_constraint k where k.conrelid=c.oid and k.contype='f' and a.attnum=any(k.conkey)) as has_fk
     from pg_class c join pg_namespace n on c.relnamespace=n.oid
     join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped
     where n.nspname like 'core_%' and c.relkind in ('r','p') and not c.relispartition and a.attname ~ '_id$';`,
  );
  const g = liveGuard("fk-coverage", r);
  if (g) return g;
  // selv-udløb: findes FK_PENDING-target-tabellerne nu?
  const targets = [...new Set(Object.values(FK_PENDING).map((p) => p.targetTable))];
  const existing = new Set();
  if (targets.length) {
    const list = targets.map((t) => `'${t}'`).join(",");
    const tr = await liveQuery(
      `select n.nspname||'.'||c.relname as tbl from pg_class c join pg_namespace n on c.relnamespace=n.oid
       where c.relkind in ('r','p') and (n.nspname||'.'||c.relname) in (${list});`,
    );
    const tg = liveGuard("fk-coverage", tr);
    if (tg) return tg;
    for (const row of tr.rows) existing.add(row.tbl);
  }
  const violations = [];
  for (const row of r.rows) {
    const key = `${row.tbl}.${row.col}`;
    const pend = FK_PENDING[key];
    const v = classifyIdColumn(key, {
      isPK: row.is_pk,
      hasFK: row.has_fk,
      targetExists: pend ? existing.has(pend.targetTable) : false,
    });
    if (v) violations.push(v);
  }
  return { name: "fk-coverage", violations };
}

// #6 indeks pr. policy-prædikat (live, fail-closed i CI): hver policy-prædikat-kolonne (reel current-table-
// kolonne, ikke session-var/funktions-gate) skal være ledende kolonne i et btree-indeks — ellers exempt.
async function indexPerPolicy() {
  const pr = await liveQuery(
    `select schemaname||'.'||tablename as tbl, policyname,
       coalesce(qual,'')||' '||coalesce(with_check,'') as expr
     from pg_policies where schemaname like 'core_%';`,
  );
  const g = liveGuard("index-per-policy", pr);
  if (g) return g;
  const cr = await liveQuery(
    `select n.nspname||'.'||c.relname as tbl, a.attname as col
     from pg_attribute a join pg_class c on a.attrelid=c.oid join pg_namespace n on c.relnamespace=n.oid
     where n.nspname like 'core_%' and c.relkind in ('r','p') and a.attnum>0 and not a.attisdropped;`,
  );
  const cg = liveGuard("index-per-policy", cr);
  if (cg) return cg;
  const lr = await liveQuery(
    `select n.nspname||'.'||t.relname as tbl, a.attname as col, am.amname
     from pg_index i join pg_class t on i.indrelid=t.oid join pg_namespace n on t.relnamespace=n.oid
     join pg_class idx on idx.oid=i.indexrelid join pg_am am on am.oid=idx.relam
     join pg_attribute a on a.attrelid=t.oid and a.attnum=i.indkey[0]
     where n.nspname like 'core_%' and am.amname='btree';`,
  );
  const lg = liveGuard("index-per-policy", lr);
  if (lg) return lg;
  const colsByTbl = new Map();
  for (const row of cr.rows) {
    if (!colsByTbl.has(row.tbl)) colsByTbl.set(row.tbl, []);
    colsByTbl.get(row.tbl).push(row.col);
  }
  const leadByTbl = leadingBtreeColumns(lr.rows);
  const violations = [];
  for (const p of pr.rows) {
    const cols = colsByTbl.get(p.tbl) || [];
    const lead = leadByTbl.get(p.tbl) || new Set();
    for (const col of predicateColumns(p.expr, cols, p.tbl)) {
      if (lead.has(col)) continue;
      if (POLICY_INDEX_EXEMPTIONS[`${p.tbl}.${col}`]) continue;
      violations.push(
        `${p.tbl}.${col} (policy ${p.policyname}): prædikat-kolonne uden ledende btree-indeks — tilføj indeks eller begrund i POLICY_INDEX_EXEMPTIONS`,
      );
    }
  }
  return { name: "index-per-policy", violations: [...new Set(violations)] };
}

// ─── gov-3b-2: §3-blocker #10 (SECURITY DEFINER markør-disciplin) ───────────────
// Live (pg_catalog = kilde-of-truth), fail-closed i CI. Trigger-funktioner tilladt uden markør
// (§3 #10); al anden SECDEF skal stå i SECDEF_SANCTIONED. Key = SIGNATUR
// (schema.name(identity-args)), så en ny overload af et sanctioned navn ikke arver markøren.
// Markør = reviewet allowlist-entry ("hvidliste vs marker = Code's valg", master-plan §3:168-169;
// FK_COVERAGE_EXEMPTIONS-præcedens). Kategori-tag pr. entry = begrundelse.
// Seed (81 ikke-trigger SECDEF) = DB-state-dump 2026-06-05; de 7 trigger-fns auto-OK (ikke listet).
const SECDEF_SANCTIONED = {
  // ── core_compliance ──
  "core_compliance.anonymization_mapping_activate(p_mapping_id uuid, p_change_reason text)": "write-rpc",
  "core_compliance.anonymization_mapping_approve(p_mapping_id uuid, p_change_reason text)": "write-rpc",
  "core_compliance.anonymization_mapping_test_run(p_mapping_id uuid, p_change_reason text)": "write-rpc",
  "core_compliance.anonymization_mapping_upsert(p_entity_type text, p_table_schema text, p_table_name text, p_field_strategies jsonb, p_anonymized_check_column text, p_retention_event_column text, p_internal_rpc_anonymize text, p_internal_rpc_apply text, p_change_reason text)":
    "write-rpc",
  "core_compliance.anonymization_state_read(p_entity_type text, p_entity_id uuid, p_from timestamp with time zone, p_to timestamp with time zone, p_limit integer)":
    "laese-rpc",
  "core_compliance.anonymization_strategy_activate(p_strategy_id uuid, p_change_reason text)": "write-rpc",
  "core_compliance.anonymize_generic_apply(p_entity_type text, p_entity_id uuid, p_change_reason text)": "write-rpc",
  "core_compliance.audit_filter_values(p_schema text, p_table text, p_values jsonb)": "laese-rpc",
  "core_compliance.audit_log_read(p_table_schema text, p_table_name text, p_record_id uuid, p_from timestamp with time zone, p_to timestamp with time zone, p_limit integer)":
    "laese-rpc",
  "core_compliance.break_glass_approve(p_request_id uuid, p_approval_notes text)": "write-rpc",
  "core_compliance.break_glass_execute(p_request_id uuid)": "write-rpc",
  "core_compliance.break_glass_operation_type_activate(p_id uuid, p_change_reason text)": "write-rpc",
  "core_compliance.break_glass_operation_type_approve(p_id uuid, p_change_reason text)": "write-rpc",
  "core_compliance.break_glass_operation_type_upsert(p_operation_type text, p_display_name text, p_description text, p_internal_rpc text, p_required_payload_schema jsonb, p_change_reason text)":
    "write-rpc",
  "core_compliance.break_glass_reject(p_request_id uuid, p_rejection_reason text)": "write-rpc",
  "core_compliance.break_glass_request(p_operation_type text, p_target_id uuid, p_target_payload jsonb, p_reason text)":
    "write-rpc",
  "core_compliance.break_glass_requests_read(p_status text, p_operation_type text, p_limit integer)": "laese-rpc",
  "core_compliance.cron_heartbeat_record(p_job_name text, p_schedule text, p_status text, p_error text, p_duration_ms integer)":
    "cron-rpc",
  "core_compliance.cron_heartbeats_export()": "laese-rpc",
  "core_compliance.cron_heartbeats_read()": "laese-rpc",
  "core_compliance.data_field_definition_delete(p_table_schema text, p_table_name text, p_column_name text, p_change_reason text)":
    "write-rpc",
  "core_compliance.data_field_definition_upsert(p_table_schema text, p_table_name text, p_column_name text, p_category text, p_pii_level text, p_purpose text, p_retention_type text, p_retention_value jsonb, p_match_role text, p_change_reason text)":
    "write-rpc",
  "core_compliance.ensure_audit_partition(p_months_ahead integer)": "cron-rpc",
  "core_compliance.gdpr_responsible_set(p_employee_id uuid, p_change_reason text)": "write-rpc",
  "core_compliance.healthcheck()": "laese-rpc",
  "core_compliance.replay_anonymization(p_entity_type text, p_dry_run boolean)": "laese-rpc",
  "core_compliance.superadmin_settings_update(p_min_admin_count integer, p_change_reason text)": "write-rpc",
  "core_compliance.verify_anonymization_consistency()": "laese-rpc",
  // ── core_identity ──
  "core_identity._anonymize_employee_apply(p_employee_id uuid, p_strategies jsonb, p_reason text)": "intern-helper",
  "core_identity._anonymize_employee_log_state(p_employee_id uuid, p_reason text, p_strategies jsonb, p_strategy_version integer)":
    "intern-helper",
  "core_identity._apply_client_close(p_payload jsonb, p_pending_change_id uuid)": "intern-helper",
  "core_identity._apply_client_place(p_payload jsonb, p_pending_change_id uuid)": "intern-helper",
  "core_identity._apply_employee_place(p_payload jsonb, p_pending_change_id uuid)": "intern-helper",
  "core_identity._apply_employee_remove(p_payload jsonb, p_pending_change_id uuid)": "intern-helper",
  "core_identity._apply_org_node_deactivate(p_payload jsonb, p_pending_change_id uuid)": "intern-helper",
  "core_identity._apply_org_node_upsert(p_payload jsonb, p_pending_change_id uuid)": "intern-helper",
  "core_identity._apply_team_close(p_payload jsonb, p_pending_change_id uuid)": "intern-helper",
  "core_identity._org_node_closure_rebuild()": "intern-helper",
  "core_identity.anonymize_employee(p_employee_id uuid, p_reason text)": "write-rpc",
  "core_identity.anonymize_employee_internal(p_employee_id uuid, p_reason text)": "intern-helper",
  "core_identity.client_field_definition_set_active(p_field_id uuid, p_is_active boolean, p_change_reason text)":
    "write-rpc",
  "core_identity.client_field_definition_upsert(p_key text, p_display_name text, p_field_type text, p_pii_level text, p_change_reason text, p_required boolean, p_display_order integer, p_is_active boolean, p_field_id uuid)":
    "write-rpc",
  "core_identity.client_logo_clear(p_client_id uuid, p_change_reason text)": "write-rpc",
  "core_identity.client_logo_set(p_client_id uuid, p_logo_bytes bytea, p_logo_content_type text, p_logo_filename text, p_change_reason text)":
    "write-rpc",
  "core_identity.client_node_close(p_client_id uuid, p_effective_from date)": "write-rpc",
  "core_identity.client_node_place(p_client_id uuid, p_node_id uuid, p_effective_from date)": "write-rpc",
  "core_identity.client_set_active(p_client_id uuid, p_is_active boolean, p_change_reason text)": "write-rpc",
  "core_identity.client_upsert(p_name text, p_fields jsonb, p_change_reason text, p_is_active boolean, p_client_id uuid)":
    "write-rpc",
  "core_identity.employee_active_config_update(p_post_termination_grace_days integer, p_treat_anonymized_as_active boolean, p_change_reason text)":
    "write-rpc",
  "core_identity.employee_place(p_employee_id uuid, p_node_id uuid, p_effective_from date)": "write-rpc",
  "core_identity.employee_remove_from_node(p_employee_id uuid, p_effective_from date)": "write-rpc",
  "core_identity.employee_terminate(p_employee_id uuid, p_termination_date date, p_change_reason text)": "write-rpc",
  "core_identity.employee_upsert(p_id uuid, p_auth_user_id uuid, p_first_name text, p_last_name text, p_email text, p_hire_date date, p_termination_date date, p_role_id uuid, p_change_reason text)":
    "write-rpc",
  "core_identity.org_node_deactivate(p_node_id uuid, p_effective_from date)": "write-rpc",
  "core_identity.org_node_upsert(p_id uuid, p_name text, p_parent_id uuid, p_node_type text, p_is_active boolean, p_effective_from date)":
    "write-rpc",
  "core_identity.pending_change_apply(p_change_id uuid)": "write-rpc",
  "core_identity.role_page_permission_upsert(p_role_id uuid, p_page_key text, p_tab_key text, p_can_view boolean, p_can_edit boolean, p_scope text, p_change_reason text)":
    "intern-helper",
  "core_identity.role_upsert(p_id uuid, p_name text, p_description text, p_change_reason text)": "write-rpc",
  "core_identity.team_close(p_node_id uuid, p_effective_from date)": "write-rpc",
  // gov-3b-3a: T9 permission-tree RPC'er konverteret INVOKER→SECDEF (#18 retning A, forbereder REVOKE i 3b)
  "core_identity.permission_action_upsert(p_id uuid, p_tab_id uuid, p_name text, p_is_active boolean, p_sort_order integer)":
    "write-rpc",
  "core_identity.permission_action_deactivate(p_action_id uuid)": "write-rpc",
  "core_identity.permission_action_set_approver_type(p_action_id uuid, p_type text)": "write-rpc",
  "core_identity.permission_area_upsert(p_id uuid, p_name text, p_is_active boolean, p_sort_order integer)":
    "write-rpc",
  "core_identity.permission_area_deactivate(p_area_id uuid)": "write-rpc",
  "core_identity.permission_page_upsert(p_id uuid, p_area_id uuid, p_name text, p_is_active boolean, p_sort_order integer)":
    "write-rpc",
  "core_identity.permission_page_deactivate(p_page_id uuid)": "write-rpc",
  "core_identity.permission_tab_upsert(p_id uuid, p_page_id uuid, p_name text, p_is_active boolean, p_sort_order integer)":
    "write-rpc",
  "core_identity.permission_tab_deactivate(p_tab_id uuid)": "write-rpc",
  // gov-3b-3b: resterende T9-write-RPC'er konverteret INVOKER→SECDEF (#18 retning A, lukker G065)
  "core_identity.pending_change_approve(p_change_id uuid)": "write-rpc",
  "core_identity.pending_change_undo(p_change_id uuid)": "write-rpc",
  "core_identity.role_permission_grant_set(p_role_id uuid, p_element_type text, p_element_id uuid, p_can_access boolean, p_can_write boolean, p_visibility text)":
    "write-rpc",
  "core_identity.role_permission_grant_remove(p_role_id uuid, p_element_type text, p_element_id uuid)": "write-rpc",
  "core_identity.undo_setting_update(p_change_type text, p_undo_period_seconds integer)": "write-rpc",
  // ── core_money ──
  "core_money._compute_period_data_checksum(p_period_id uuid)": "intern-helper",
  "core_money._pay_period_compute_candidate_internal(p_period_id uuid, p_change_reason text)": "intern-helper",
  "core_money._pay_period_lock_internal(p_period_id uuid, p_change_reason text)": "intern-helper",
  "core_money.pay_period_compute_candidate(p_period_id uuid, p_change_reason text)": "write-rpc",
  "core_money.pay_period_compute_candidate_via_cron(p_period_id uuid)": "cron-rpc",
  "core_money.pay_period_for_date(p_date date)": "laese-rpc",
  "core_money.pay_period_lock(p_period_id uuid, p_change_reason text)": "write-rpc",
  "core_money.pay_period_lock_attempt(p_period_id uuid)": "cron-rpc",
  "core_money.pay_period_lock_via_cron(p_period_id uuid)": "cron-rpc",
  "core_money.pay_period_settings_update(p_start_day_of_month integer, p_recommended_lock_date_rule text, p_auto_lock_enabled boolean, p_change_reason text)":
    "write-rpc",
  "core_money.pay_period_unlock_via_break_glass(p_period_id uuid, p_change_reason text)": "write-rpc",
  "core_money.period_recommended_lock_date(p_period_id uuid)": "laese-rpc",
  // ── public (API-overflade; sanktioneret write-vej §1.1:55/:603) ──
  "public.client_assign_to_team(p_client_id uuid, p_team_id uuid, p_change_reason text, p_from_date date)": "write-rpc",
  "public.client_field_definition_upsert(p_key text, p_display_name text, p_field_type text, p_pii_level text, p_change_reason text, p_required boolean, p_match_role text, p_display_order integer, p_is_active boolean, p_field_id uuid)":
    "write-rpc",
  "public.client_upsert(p_name text, p_fields jsonb, p_change_reason text, p_client_id uuid)": "write-rpc",
  "public.data_field_definition_upsert(p_table_schema text, p_table_name text, p_column_name text, p_category text, p_pii_level text, p_purpose text, p_retention_type text, p_retention_value jsonb, p_match_role text, p_change_reason text)":
    "write-rpc",
  "public.employee_assign_to_team(p_employee_id uuid, p_team_id uuid, p_change_reason text, p_from_date date)":
    "write-rpc",
  "public.employee_upsert(p_auth_user_id uuid, p_first_name text, p_last_name text, p_email text, p_hire_date date, p_change_reason text, p_employee_id uuid, p_termination_date date)":
    "write-rpc",
  "public.org_unit_upsert(p_name text, p_change_reason text, p_org_unit_id uuid, p_parent_id uuid, p_is_active boolean)":
    "write-rpc",
  "public.role_page_permission_upsert(p_role_id uuid, p_page_key text, p_can_view boolean, p_can_edit boolean, p_scope text, p_change_reason text, p_tab_key text)":
    "write-rpc",
  "public.role_upsert(p_name text, p_change_reason text, p_role_id uuid, p_description text)": "write-rpc",
  "public.team_upsert(p_name text, p_org_unit_id uuid, p_change_reason text, p_team_id uuid, p_is_active boolean)":
    "write-rpc",
};

// ren helper (unit-testet i selftest, INGEN live-DB): returnér ALLE violations givet live-rows +
// allowlist. row = { key: "schema.name(identity_args)", returnsTrigger: bool }. Dækker både
// umarkeret-SECDEF og stale-allowlist-entry (mekanisk §3.6-bevis).
export function secdefMarkerViolations(rows, sanctioned) {
  const violations = [];
  const liveKeys = new Set();
  for (const row of rows || []) {
    liveKeys.add(row.key);
    if (row.returnsTrigger) continue; // trigger-funktion — tilladt uden markør (§3 #10)
    if (Object.prototype.hasOwnProperty.call(sanctioned, row.key)) continue; // markeret + reviewet
    violations.push(
      `${row.key}: SECURITY DEFINER uden markør — gør funktionen ikke-SECDEF, ELLER (hvis bevidst) tilføj til SECDEF_SANCTIONED med kategori-begrundelse (§3 #10)`,
    );
  }
  // allowlist-hygiejne (mod drift, jf. audit-trigger-coverage): hver entry skal matche en live SECDEF-fn
  for (const key of Object.keys(sanctioned)) {
    if (!liveKeys.has(key))
      violations.push(`${key}: i SECDEF_SANCTIONED men ingen matchende SECDEF-funktion findes live — fjern entry`);
  }
  return [...new Set(violations)];
}

// #10 SECDEF-markør-disciplin (live, fail-closed i CI): hver SECDEF-funktion i stork-schemas er
// enten trigger-funktion (tilladt uden markør) eller i SECDEF_SANCTIONED (eksplicit markør + review).
async function secdefMarkerDiscipline() {
  const r = await liveQuery(
    `select n.nspname||'.'||p.proname||'('||pg_get_function_identity_arguments(p.oid)||')' as key,
       (t.typname = 'trigger') as returns_trigger
     from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     join pg_type t on t.oid = p.prorettype
     where n.nspname in ('public','core_identity','core_compliance','core_money')
       and p.prosecdef = true;`,
  );
  const g = liveGuard("secdef-marker-discipline", r);
  if (g) return g;
  const rows = r.rows.map((row) => ({ key: row.key, returnsTrigger: row.returns_trigger }));
  return { name: "secdef-marker-discipline", violations: secdefMarkerViolations(rows, SECDEF_SANCTIONED) };
}

// ─── gov-3b-3b: §3-blocker #18 (app-write-REVOKE-disciplin) ─────────────────────
// App-roller (authenticated/anon/fremtidige app_*) må IKKE have direkte INSERT/UPDATE/DELETE/TRUNCATE på
// core_* — apps skriver udelukkende via SECURITY DEFINER-RPC'er (§1.1:157 + §3 #18). Live, fail-closed.
// EFFEKTIV privilegie-test (has_table_privilege fanger også PUBLIC-grants + rolle-medlemskab), ikke kun
// rå information_schema-grant-rækker. Allowlist for evt. legitime undtagelser (tom).
const APP_WRITE_REVOKE_EXEMPTIONS = {}; // "schema.table.role.PRIV" → begrundelse

// ren helper (unit-testet i selftest, INGEN live-DB): row = { tbl, role, priv }.
export function appWriteViolations(rows, exemptions) {
  const violations = [];
  for (const row of rows || []) {
    if (Object.prototype.hasOwnProperty.call(exemptions, `${row.tbl}.${row.role}.${row.priv}`)) continue;
    violations.push(
      `${row.tbl}: app-rolle '${row.role}' har ${row.priv} på core_* — apps skal skrive via SECURITY DEFINER-RPC (§1.1:157/#18); REVOKE eller begrund i APP_WRITE_REVOKE_EXEMPTIONS`,
    );
  }
  return violations;
}

async function appWriteRevokeDiscipline() {
  const r = await liveQuery(
    `select n.nspname||'.'||c.relname as tbl, r.rolname as role, priv
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
     cross join pg_roles r
     cross join unnest(array['INSERT','UPDATE','DELETE','TRUNCATE']) as priv
     where n.nspname in ('core_identity','core_compliance','core_money')
       and c.relkind in ('r','p')
       and (r.rolname in ('authenticated','anon') or r.rolname like 'app\\_%')
       and has_table_privilege(r.oid, c.oid, priv)
     order by 1,2,3;`,
  );
  const g = liveGuard("app-write-revoke-discipline", r);
  if (g) return g;
  return { name: "app-write-revoke-discipline", violations: appWriteViolations(r.rows, APP_WRITE_REVOKE_EXEMPTIONS) };
}

// ---------- advisor-baseline (G066 / DEL 5, 2026-06-10) ----------
// De SQL-tjekbare Supabase-advisor-klasser holdes mod committet baseline
// (supabase/advisor-baseline.json) med begrundelser: nye eksponeringer = rød,
// forsvundne baseline-entries = rød (stram baselinen — den bider begge veje).
// Auth-config-advisors (Dashboard-klik) kan IKKE tjekkes via SQL — fladen er
// dokumenteret i G066 (leaked-password-protection slået TIL 2026-06-10;
// auth-slutbillede: Entra eneste provider ved Lag F).
export function compareAdvisorBaseline(live, baseline) {
  const violations = [];
  for (const key of ["secdef_exposed", "rls_no_policy"]) {
    const b = new Set(baseline[key] || []);
    const l = new Set(live[key] || []);
    for (const x of l)
      if (!b.has(x))
        violations.push(
          `supabase/advisor-baseline.json: NY ${key}-eksponering ikke i baseline: ${x} (tilfoej med begrundelse i samme PR, eller fjern eksponeringen)`,
        );
    for (const x of b)
      if (!l.has(x))
        violations.push(
          `supabase/advisor-baseline.json: baseline-entry findes ikke laengere live: ${x} (${key}) — fjern den fra baselinen`,
        );
  }
  return violations;
}
// Normalizer for live-row (testbar): row.baseline kan være JSON-string eller objekt.
// Tomt/uventet resultat -> null (fail-closed: kalderen giver violation).
export function parseAdvisorLiveRow(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const row = rows[0] || {};
  const raw = row.baseline ?? row;
  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (!parsed || typeof parsed !== "object" || !("secdef_exposed" in parsed)) return null;
  return parsed;
}
async function advisorBaseline() {
  const name = "advisor-baseline";
  const baselinePath = "supabase/advisor-baseline.json";
  if (!existsSync(baselinePath)) return { name, violations: [`${baselinePath} mangler (G066)`] };
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
  const r = await liveQuery(`select json_build_object(
    'secdef_exposed', (select coalesce(json_agg(fn order by fn),'[]'::json) from (
      select distinct n.nspname||'.'||p.proname||'('||pg_get_function_identity_arguments(p.oid)||')' as fn
      from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where p.prosecdef and n.nspname in ('public','core_identity','core_compliance','core_money')
      and (has_function_privilege('authenticated', p.oid, 'execute') or has_function_privilege('anon', p.oid, 'execute'))
    ) s),
    'rls_no_policy', (select coalesce(json_agg(t order by t),'[]'::json) from (
      select n.nspname||'.'||c.relname as t
      from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where c.relkind in ('r','p') and not c.relispartition and c.relrowsecurity
      and not exists (select 1 from pg_policy p where p.polrelid=c.oid)
      and n.nspname in ('public','core_identity','core_compliance','core_money')
    ) s)
  ) as baseline;`);
  const g = liveGuard(name, r);
  if (g) return g;
  const live = parseAdvisorLiveRow(r.rows);
  if (!live) return { name, violations: ["live-query gav tomt/uventet resultat — fail-closed (G066)"] };
  return { name, violations: compareAdvisorBaseline(live, baseline) };
}

const checks = [
  noTsIgnore,
  eslintDisableJustified,
  migrationNaming,
  workspaceBoundaries,
  noHardcodedSupabaseUrls,
  migrationSetConfigDiscipline,
  dedupKeyOrOptOut,
  truncateBlockedOnImmutable,
  cronChangeReason,
  auditTriggerCoverage,
  migrationOnConflictDiscipline,
  dbRlsPolicies,
  writePolicySessionVarConsistency,
  legacyIsActiveReaders,
  dbTestTxWrapOnImmutableInsert,
  dbTestNoDisabledSql,
  dbTestNoT9SeedUserFixtures,
  dbTestNoT9SkipGuards,
  postgrestT9SchemaExposure,
  immutabilityTriggerCoverage,
  snapshotFieldProtection,
  schemaOwnership,
  crossSchemaFkDiscipline,
  fkCoverage,
  indexPerPolicy,
  secdefMarkerDiscipline,
  appWriteRevokeDiscipline,
  advisorBaseline,
];

async function main() {
  let total = 0;
  for (const check of checks) {
    const result = await check();
    const { name, violations, skipped, soft } = result;
    if (skipped) {
      console.log(`- ${name} — skipped (${skipped})`);
      continue;
    }
    if (violations.length === 0) {
      console.log(`✓ ${name}`);
      continue;
    }
    const marker = soft ? "!" : "✗";
    console.log(`${marker} ${name} — ${violations.length} violation(s)`);
    for (const v of violations) {
      const file = v.split(":")[0];
      const level = soft ? "warning" : "error";
      console.log(`::${level} file=${file}::${v}`);
    }
    if (!soft) total += violations.length;
  }
  if (total === 0) {
    console.log("\nFitness: all checks passed");
    return;
  }
  console.error(`\nFitness: ${total} violation(s) — fix dem før merge`);
  process.exit(1);
}

// Kør kun når invokeret direkte (node fitness.mjs) — ikke ved import (selftest importerer rene helpers).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((err) => {
    console.error("Fitness fatal:", err);
    process.exit(1);
  });
}
