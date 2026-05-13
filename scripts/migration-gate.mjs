#!/usr/bin/env node
// Migration-gate. Phase 1 (default): warner på uklassificerede kolonner.
// Phase 2 (MIGRATION_GATE_STRICT=true): fejler ved samme tilstand.
//
// D6 flip: kilden er nu (a) classification.json (legacy/transition) +
// (b) INSERT INTO public.data_field_definitions i migration-filer.
// Migration-filerne er sandheden — classification.json bevares som
// transitions-fallback indtil cleanup-commit.
//
// Princip (Mathias' låste UI-konfig-regel): Gaten validerer KUN
// existence af klassifikations-rækken pr. (schema, table, column).
// Den må IKKE validere værdier (pii_level/category/retention) —
// værdier er UI-konfigurerbare.

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

  // Accepter både simpel CREATE TABLE og PARTITION BY-varianter.
  // Trin 1: core_*-schemas tilføjet; PARTITION BY-klausul nu mulig.
  const createTableRe =
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:(\w+)\.)?(\w+)\s*\(([\s\S]*?)\)\s*(?:PARTITION\s+BY\s+\w+\s*\([^)]*\)\s*)?(?:WITH\s*\([^)]*\)\s*)?(?:TABLESPACE\s+\w+\s*)?;/gi;
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

// D6: parse INSERT INTO public.data_field_definitions VALUES (...) blocks
// og udtræk klassificerede (schema, table, column)-tuples. Hver række's
// første tre værdier er table_schema, table_name, column_name.
// Quote-aware: håndterer single-quoted strings med embedded ';' eller '('
// (fx 'Audit-rækkens uuid PK; uændret efter INSERT').
function extractClassifiedFromInserts(sql) {
  const cleaned = stripComments(sql);
  const classified = new Set();

  // Find hver INSERT-start (uden den greedy regex' semicolon-trap).
  // Trin 1 (rettelse 20): data_field_definitions er flyttet fra public til
  // core_compliance. Begge schemas accepteres så historiske migrations stadig
  // matches.
  const startRe = /INSERT\s+INTO\s+(?:public|core_compliance)\.data_field_definitions\s*(?:\([^)]*\))?\s*VALUES\s*/gi;
  let m;
  while ((m = startRe.exec(cleaned)) !== null) {
    const startOfValues = m.index + m[0].length;
    // Find statement-end: ';' uden for single-quoted string
    let endIdx = startOfValues;
    let inQuote = false;
    while (endIdx < cleaned.length) {
      const ch = cleaned[endIdx];
      if (ch === "'") {
        if (cleaned[endIdx + 1] === "'") {
          endIdx += 2;
          continue;
        }
        inQuote = !inQuote;
      } else if (ch === ";" && !inQuote) {
        break;
      }
      endIdx++;
    }
    const valuesBlock = cleaned.slice(startOfValues, endIdx);

    // Tuple-parser med quote-awareness
    let depth = 0;
    let current = "";
    let tInQuote = false;
    const tuples = [];
    for (let j = 0; j < valuesBlock.length; j++) {
      const ch = valuesBlock[j];
      if (tInQuote) {
        if (ch === "'") {
          if (valuesBlock[j + 1] === "'") {
            current += "''";
            j++;
            continue;
          }
          tInQuote = false;
        }
        current += ch;
        continue;
      }
      if (ch === "'") {
        tInQuote = true;
        current += ch;
        continue;
      }
      if (ch === "(") {
        if (depth === 0) {
          current = "";
        } else {
          current += ch;
        }
        depth++;
      } else if (ch === ")") {
        depth--;
        if (depth === 0) {
          tuples.push(current);
          current = "";
          continue;
        }
        current += ch;
      } else if (depth > 0) {
        current += ch;
      }
    }

    for (const t of tuples) {
      const matches = [...t.matchAll(/'((?:[^']|'')*)'/g)].slice(0, 3);
      if (matches.length === 3) {
        const [schema, table, column] = matches.map((x) => x[1].toLowerCase());
        classified.add(`${schema}.${table}.${column}`);
      }
    }
  }
  return classified;
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

  // Source A: classification.json (legacy)
  let classification = { columns: {} };
  if (await fileExists(CLASSIFICATION_FILE)) {
    const raw = await readFile(CLASSIFICATION_FILE, "utf8");
    classification = JSON.parse(raw);
  }
  const classifiedFromFile = new Set(Object.keys(classification.columns || {}));

  // Source B: INSERT INTO data_field_definitions i migration-filer (D6+)
  const classifiedFromMigrations = new Set();
  for (const file of migrationFiles) {
    const sql = await readFile(join(MIGRATIONS_DIR, file), "utf8");
    for (const key of extractClassifiedFromInserts(sql)) {
      classifiedFromMigrations.add(key);
    }
  }

  const classified = new Set([...classifiedFromFile, ...classifiedFromMigrations]);

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
    const phase = STRICT ? "Phase 2 (strict)" : "Phase 1 (warn-only)";
    console.log(
      `Migration-gate ${phase}: alle kolonner i ${migrationFiles.length} migration(s) er klassificerede ` +
        `(file=${classifiedFromFile.size}, migrations=${classifiedFromMigrations.size}, union=${classified.size})`,
    );
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
