#!/usr/bin/env node
// fitness.selftest.mjs — negativ-test (§3.6) for gov-3a's nye static §3-checks (#4, #7).
// Beviser at de fanger overtrædelser. Live-checks (#16 schema-ownership, #17 cross-schema-FK)
// skippes her (SUPABASE_ACCESS_TOKEN unset) — de er verificeret grønne mod faktisk DB, og
// deres logik er allowlist-inspektérbar; en live-negativ-test ville kræve mutation af prod.
//
// Kører mod git archive HEAD (committed tree).

import { execSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = process.cwd();
let failed = 0;
const ok = (n) => console.log(`  ✓ ${n}`);
const bad = (n, d) => {
  console.error(`  ✗ ${n} — ${d}`);
  failed++;
};

function fixture() {
  const d = mkdtempSync(join(tmpdir(), "fittest-"));
  execSync(`git archive HEAD | tar -x -C "${d}"`, { stdio: "pipe" });
  return d;
}
function runFitness(root) {
  try {
    const out = execSync(`node ${join(ROOT, "scripts/fitness.mjs")}`, {
      cwd: root,
      stdio: "pipe",
      env: { ...process.env, SUPABASE_ACCESS_TOKEN: "" },
    }).toString();
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout?.toString() || "") + (e.stderr?.toString() || "") };
  }
}

// baseline: clean committed tree, live skippet -> static checks grønne
{
  const d = fixture();
  const r = runFitness(d);
  r.code === 0 ? ok("baseline (static checks) -> exit 0") : bad("baseline", `forventede exit 0, fik ${r.code}`);
  rmSync(d, { recursive: true, force: true });
}

// #4: fjern UPDATE/DELETE fra immutability-triggere -> immutability-trigger-coverage fejler
{
  const d = fixture();
  execSync(
    `grep -rlI "before update or delete" "${d}/supabase/migrations" | xargs sed -i "s/before update or delete/before insert/Ig"`,
    { stdio: "pipe" },
  );
  const r = runFitness(d);
  r.code !== 0 && /immutable tabel mangler BEFORE UPDATE\/DELETE/.test(r.out)
    ? ok("planted #4 (trigger uden update/delete) -> immutability-trigger-coverage fejler")
    : bad("#4", `forventede immutability-violation, code=${r.code}`);
  rmSync(d, { recursive: true, force: true });
}

// #7: fjern mutable-flag fra commission_snapshots-guard -> snapshot-field-protection fejler
{
  const d = fixture();
  execSync(`grep -rlI "is_candidate" "${d}/supabase/migrations" | xargs sed -i "s/is_candidate/zz_removed_flag/g"`, {
    stdio: "pipe",
  });
  const r = runFitness(d);
  r.code !== 0 && /mutable-flag 'is_candidate' ikke undtaget/.test(r.out)
    ? ok("planted #7 (guard mangler flag) -> snapshot-field-protection fejler")
    : bad("#7", `forventede snapshot-felt-violation, code=${r.code}`);
  rmSync(d, { recursive: true, force: true });
}

if (failed) {
  console.error(`\nfitness selftest FEJLEDE (${failed})`);
  process.exit(1);
}
console.log("\nfitness selftest: alle cases passed");
