#!/usr/bin/env node
// Fitness-functions: arkitektoniske invarianter der køres i CI på hver PR.
// Fanger drift som ESLint ikke ser fordi de er repo-omfattende, ikke per-fil.
// Hver check er en function der returnerer { name, violations: string[] }.
// Tilføj nye checks ved at skrive en function og pushe den til `checks`-array'et.

import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

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
const LEGACY_IS_ACTIVE_EXEMPT_FUNCTIONS = new Set(["core_identity._apply_employee_place"]);

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

// ─── runner ────────────────────────────────────────────────────────────────

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

main().catch((err) => {
  console.error("Fitness fatal:", err);
  process.exit(1);
});
