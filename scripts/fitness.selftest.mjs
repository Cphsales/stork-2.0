#!/usr/bin/env node
// fitness.selftest.mjs — negativ-test (§3.6) for gov-3a's §3-checks.
// Beviser at de fanger overtrædelser, inkl. de falsk-grøn-klasser Codex fandt:
// #4 både-update-og-delete + trigger-final-state (drop-after-create), #7 eksakt
// undtagelses-sæt, og fail-closed for required live-checks i CI.
// Kører mod git archive HEAD (committed tree).

import { execSync } from "node:child_process";
import { mkdtempSync, rmSync, appendFileSync, writeFileSync } from "node:fs";
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
function runFitness(root, extraEnv = {}) {
  try {
    const out = execSync(`node ${join(ROOT, "scripts/fitness.mjs")}`, {
      cwd: root,
      stdio: "pipe",
      env: { ...process.env, SUPABASE_ACCESS_TOKEN: "", CI: "", ...extraEnv },
    }).toString();
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout?.toString() || "") + (e.stderr?.toString() || "") };
  }
}
function sed(d, expr) {
  const needle = expr.split("/")[1];
  execSync(`grep -rlI -- ${JSON.stringify(needle)} "${d}/supabase/migrations" | xargs sed -i ${JSON.stringify(expr)}`, {
    stdio: "pipe",
  });
}
// plant: kør en mutation på fixture, forvent specifik violation-substring + exit≠0
function plant(name, mutate, needle) {
  const d = fixture();
  mutate(d);
  const r = runFitness(d);
  r.code !== 0 && new RegExp(needle).test(r.out)
    ? ok(name)
    : bad(name, `code=${r.code}, needle "${needle}" ${new RegExp(needle).test(r.out) ? "fundet" : "IKKE fundet"}`);
  rmSync(d, { recursive: true, force: true });
}

// baseline: clean committed tree, live skippet lokalt -> static checks grønne
{
  const d = fixture();
  const r = runFitness(d);
  r.code === 0 ? ok("baseline (static checks) -> exit 0") : bad("baseline", `forventede exit 0, fik ${r.code}`);
  rmSync(d, { recursive: true, force: true });
}

// #1 fail-closed: required live-check uden token i CI -> violation (ikke skip-til-grøn)
{
  const d = fixture();
  const r = runFitness(d, { CI: "true" }); // token stadig "" -> liveGuard fail-closed
  r.code !== 0 && /SUPABASE_ACCESS_TOKEN mangler i CI/.test(r.out)
    ? ok("fail-closed: live-check uden token i CI -> violation")
    : bad("fail-closed", `code=${r.code}`);
  rmSync(d, { recursive: true, force: true });
}

// #4 update-only -> mangler delete-dækning
plant(
  "#4 update-only trigger -> fanges (delete ikke dækket)",
  (d) => sed(d, "s/before update or delete/before update/Ig"),
  "BÅDE update og delete \\(update=true, delete=false\\)",
);
// #4 delete-only -> mangler update-dækning
plant(
  "#4 delete-only trigger -> fanges (update ikke dækket)",
  (d) => sed(d, "s/before update or delete/before delete/Ig"),
  "BÅDE update og delete \\(update=false, delete=true\\)",
);
// #4 drop-after-create -> senere DROP TRIGGER fjerner immutabilitet (final-state)
plant(
  "#4 drop-after-create -> fanges (trigger final-state)",
  (d) =>
    writeFileSync(
      join(d, "supabase/migrations/99999999999999_zz_drop_immut.sql"),
      "drop trigger audit_log_immutability on core_compliance.audit_log;\n",
    ),
  "core_compliance\\.audit_log: immutable tabel mangler surviving BEFORE-trigger",
);
// #7 manglende mutable-flag i guard
plant(
  "#7 guard mangler mutable-flag -> fanges",
  (d) => sed(d, "s/is_candidate/zz_renamed/g"),
  "undtager ikke mutable-flag",
);
// #7 EKSTRA undtaget felt -> for bredt (et snapshot-felt gjort mutérbart)
plant(
  "#7 guard undtager ekstra felt -> fanges",
  (d) => sed(d, "s/- 'candidate_run_id'/- 'candidate_run_id' - 'gross_amount'/g"),
  "undtager EKSTRA felt",
);

if (failed) {
  console.error(`\nfitness selftest FEJLEDE (${failed})`);
  process.exit(1);
}
console.log("\nfitness selftest: alle cases passed");
