#!/usr/bin/env node
// Frosset måle-lag, ejet af Codex: plan.md:391 (§3 (vi)(a)), :436 (Step 1.4).
// Byggeren må køre, men ALDRIG ændre denne fil eller prover.json (A6-1/M-41).
import { spawnSync } from "node:child_process";
import { readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const resultRelPath = "plan-build/lokations-skabelon/prover-result.json";
const resultPath = join(repoRoot, resultRelPath);
const databaseUrl = process.env.DATABASE_URL;

// Et tidligere resultat må aldrig overleve en kørsel uden DATABASE_URL.
rmSync(resultPath, { force: true });
if (!databaseUrl || databaseUrl.trim().length === 0) {
  console.error("DATABASE_URL mangler; ingen resultatfil skrevet.");
  process.exit(2);
}

const testsRelPath = "supabase/tests/smoke";
const tests = readdirSync(join(repoRoot, testsRelPath))
  .filter((name) => /^t10b_.*\.sql$/.test(name))
  .sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)));

let passed = 0;
let failed = 0;
for (const name of tests) {
  const testRelPath = `${testsRelPath}/${name}`;
  const result = spawnSync("psql", [
    databaseUrl, "-X", "-q", "-v", "ON_ERROR_STOP=1", "-f", testRelPath,
  ], { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (!result.error && result.status === 0) passed += 1;
  else failed += 1;
  const rc = result.status ?? (result.signal ? `signal:${result.signal}` : `spawn:${result.error?.code ?? "failed"}`);
  console.error(`${testRelPath} · rc=${rc}`);
}

const total = passed + failed;
writeFileSync(resultPath, JSON.stringify({ total, passed, failed, skipped: 0 }) + "\n");
if (total === 0) console.error("Ingen supabase/tests/smoke/t10b_*.sql-filer; total=0 er rød.");
process.exit(failed === 0 && total >= 1 ? 0 : 1);
