#!/usr/bin/env node
// Fitness-functions: arkitektoniske invarianter der køres i CI på hver PR.
// Fanger drift som ESLint ikke ser fordi de er repo-omfattende, ikke per-fil.
// Hver check er en function der returnerer { name, violations: string[] }.
// Tilføj nye checks ved at skrive en function og pushe den til `checks`-array'et.

import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SKIP_DIRS = new Set(["node_modules", "dist", ".turbo", ".git", "coverage"]);

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
  // eslint-disable[-line|-next-line] <rule> -- <begrundelse>
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
    entries = await readdir("supabase/migrations");
  } catch {
    return { name: "migration-naming", violations };
  }
  const re = /^\d{14}_[a-z0-9_]+\.sql$/;
  for (const e of entries) {
    if (e === ".gitkeep" || e.startsWith(".")) continue;
    if (!re.test(e)) {
      violations.push(`supabase/migrations/${e}: skal matche <14digits>_<snake_case>.sql`);
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

// ─── runner ────────────────────────────────────────────────────────────────

const checks = [noTsIgnore, eslintDisableJustified, migrationNaming, workspaceBoundaries, noHardcodedSupabaseUrls];

async function main() {
  let total = 0;
  for (const check of checks) {
    const { name, violations } = await check();
    if (violations.length === 0) {
      console.log(`✓ ${name}`);
      continue;
    }
    console.log(`✗ ${name} — ${violations.length} violation(s)`);
    for (const v of violations) {
      const file = v.split(":")[0];
      console.log(`::error file=${file}::${v}`);
    }
    total += violations.length;
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
