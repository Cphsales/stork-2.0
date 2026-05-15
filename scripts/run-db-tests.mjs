#!/usr/bin/env node
// DB-level test runner. Itererer supabase/tests/**/*.sql, sender hver til
// Supabase Management API som én query, fail-fast ved første test-fejl.
//
// Konvention: hver test er en SQL-fil med DO-block der RAISE EXCEPTION ved
// assertion-failure. Filer med side-effekter (employees/audit) bruger
// BEGIN/ROLLBACK så prod-DB ikke forurenes.

import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const TESTS_DIR = "supabase/tests";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "imtxvrymaqbgcvsarlib";

function parseArgs() {
  const args = process.argv.slice(2);
  const dirArg = args.indexOf("--dir");
  return {
    dir: dirArg >= 0 ? args[dirArg + 1] : null,
  };
}

async function walk(dir) {
  const out = [];
  async function recurse(d) {
    const entries = await readdir(d, { withFileTypes: true });
    for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const p = join(d, e.name);
      if (e.isDirectory()) await recurse(p);
      else if (e.name.endsWith(".sql")) out.push(p);
    }
  }
  await recurse(dir);
  return out;
}

async function runQuery(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const body = await res.text();
    return { ok: false, status: res.status, body };
  }
  const body = await res.json();
  return { ok: true, body };
}

async function main() {
  if (!TOKEN) {
    console.error("SUPABASE_ACCESS_TOKEN env-var er påkrævet for test:db");
    process.exit(2);
  }

  const { dir } = parseArgs();
  const targetDir = dir ? join(TESTS_DIR, dir) : TESTS_DIR;

  try {
    await stat(targetDir);
  } catch {
    console.error(`Test-mappe findes ikke: ${targetDir}`);
    process.exit(2);
  }

  const files = await walk(targetDir);
  if (files.length === 0) {
    console.log(`Ingen test-filer fundet i ${targetDir}`);
    return;
  }

  console.log(`Kører ${files.length} DB-test(s) mod project ${PROJECT_REF}`);
  console.log("");

  let passed = 0;
  let failed = 0;

  for (const file of files) {
    const rel = relative(ROOT, file);
    const sql = await readFile(file, "utf8");
    const start = Date.now();
    const result = await runQuery(sql);
    const elapsed = Date.now() - start;

    if (result.ok) {
      console.log(`✓ ${rel} (${elapsed} ms)`);
      passed++;
    } else {
      console.log(`✗ ${rel} (${elapsed} ms)`);
      console.log(`  status: ${result.status || "n/a"}`);
      let errMsg;
      try {
        const parsed = JSON.parse(result.body);
        errMsg = parsed.message || result.body;
      } catch {
        errMsg = result.body;
      }
      console.log(`  error: ${errMsg.split("\n").slice(0, 5).join("\n         ")}`);
      console.log(`::error file=${rel}::DB-test fejlet: ${errMsg.split("\n")[0]}`);
      failed++;
      // Fail-fast for kortest CI-feedback
      break;
    }
  }

  console.log("");
  console.log(`DB-tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test-runner fatal:", err);
  process.exit(2);
});
