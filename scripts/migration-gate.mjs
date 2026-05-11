#!/usr/bin/env node
// Migration-gate. Phase 1 (default): warner på uklassificerede kolonner.
// Phase 2 (MIGRATION_GATE_STRICT=true): fejler ved samme tilstand.
// Phase 2 aktiveres efter lag D introducerer klassifikations-skemaet.

import { readdir, readFile, access } from "node:fs/promises";
import { join } from "node:path";

const MIGRATIONS_DIR = "supabase/migrations";
const CLASSIFICATION_FILE = "supabase/classification.json";
const STRICT = process.env.MIGRATION_GATE_STRICT === "true";

const CONSTRAINT_KEYWORDS = new Set(["constraint", "primary", "foreign", "unique", "check", "exclude", "like"]);

function stripComments(sql) {
  return sql.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

function extractColumns(sql) {
  const cleaned = stripComments(sql);
  const columns = [];

  const createTableRe =
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:(\w+)\.)?(\w+)\s*\(([\s\S]*?)\)\s*(?:WITH\s*\([^)]*\)\s*)?(?:TABLESPACE\s+\w+\s*)?;/gi;
  let m;
  while ((m = createTableRe.exec(cleaned)) !== null) {
    const schema = (m[1] || "public").toLowerCase();
    const table = m[2].toLowerCase();
    const body = m[3];
    let depth = 0;
    let current = "";
    const parts = [];
    for (const ch of body) {
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      else if (ch === "," && depth === 0) {
        parts.push(current);
        current = "";
        continue;
      }
      current += ch;
    }
    if (current.trim()) parts.push(current);

    for (const raw of parts) {
      const trimmed = raw.trim();
      const first = trimmed.match(/^"?(\w+)"?\s/);
      if (!first) continue;
      const word = first[1].toLowerCase();
      if (CONSTRAINT_KEYWORDS.has(word)) continue;
      columns.push({ schema, table, column: first[1].toLowerCase() });
    }
  }

  const alterRe =
    /ALTER\s+TABLE\s+(?:ONLY\s+)?(?:(\w+)\.)?(\w+)\s+ADD\s+(?:COLUMN\s+)?(?:IF\s+NOT\s+EXISTS\s+)?"?(\w+)"?/gi;
  while ((m = alterRe.exec(cleaned)) !== null) {
    const word = m[3].toLowerCase();
    if (CONSTRAINT_KEYWORDS.has(word)) continue;
    columns.push({
      schema: (m[1] || "public").toLowerCase(),
      table: m[2].toLowerCase(),
      column: word,
    });
  }

  return columns;
}

async function fileExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await fileExists(MIGRATIONS_DIR))) {
    console.log("Migration-gate: ingen migrations-mappe endnu — skipper");
    return;
  }

  const entries = await readdir(MIGRATIONS_DIR);
  const migrationFiles = entries.filter((f) => f.endsWith(".sql")).sort();

  if (migrationFiles.length === 0) {
    console.log("Migration-gate: ingen migrations endnu — skipper");
    return;
  }

  let classification = { columns: {} };
  if (await fileExists(CLASSIFICATION_FILE)) {
    const raw = await readFile(CLASSIFICATION_FILE, "utf8");
    classification = JSON.parse(raw);
  }
  const classified = new Set(Object.keys(classification.columns || {}));

  let unclassified = 0;
  for (const file of migrationFiles) {
    const sql = await readFile(join(MIGRATIONS_DIR, file), "utf8");
    const columns = extractColumns(sql);
    for (const { schema, table, column } of columns) {
      const key = `${schema}.${table}.${column}`;
      if (!classified.has(key)) {
        const level = STRICT ? "error" : "warning";
        console.log(`::${level} file=${MIGRATIONS_DIR}/${file}::Uklassificeret kolonne: ${key}`);
        unclassified++;
      }
    }
  }

  if (unclassified === 0) {
    console.log(`Migration-gate: alle kolonner i ${migrationFiles.length} migration(s) er klassificerede`);
    return;
  }

  const phase = STRICT ? "Phase 2 (strict)" : "Phase 1 (warn-only)";
  console.log(
    `Migration-gate ${phase}: ${unclassified} uklassificerede kolonner i ${migrationFiles.length} migration(s)`,
  );

  if (STRICT) {
    console.error("::error::Migration-gate Phase 2: uklassificerede kolonner blokerer merge");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Migration-gate fatal:", err);
  process.exit(1);
});
