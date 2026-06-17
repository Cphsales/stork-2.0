// Meta-selftest for selvtjek (S13) — beviser at runnerens fail-stier VIRKER:
//  1) en checker uden selftest fanges (silent-skip-risiko), og
//  2) en fejlende selftest fanges (CI fejler faktisk).
// Bruger en temp-fixture-mappe, så vi tester runneren mod kendte fejl-tilfælde.
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { manglendeDaekning, koerSelftests } from "./selvtjek.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};

const dir = mkdtempSync(join(tmpdir(), "wf-selvtjek-"));
try {
  // Checker uden matchende selftest → skal fanges af dæknings-tjek.
  writeFileSync(join(dir, "foo-check.mjs"), "export const x = 1;\n");
  // Checker MED selftest der fejler → skal fanges af kørsel.
  writeFileSync(join(dir, "bar-check.mjs"), "export const x = 1;\n");
  writeFileSync(join(dir, "bar-check.selftest.mjs"), "process.exit(1);\n");
  // Checker MED selftest der passerer → må ikke rapporteres som fejl.
  writeFileSync(join(dir, "baz-check.mjs"), "export const x = 1;\n");
  writeFileSync(join(dir, "baz-check.selftest.mjs"), "process.exit(0);\n");

  const mangler = manglendeDaekning(dir);
  ok("dækning fanger checker uden selftest", mangler.includes("foo-check.mjs"));
  ok("dækning rapporterer ikke checker MED selftest", !mangler.includes("bar-check.mjs"));

  const fejlede = koerSelftests(dir, { stdio: "ignore" });
  ok("kørsel fanger fejlende selftest", fejlede.includes("bar-check.selftest.mjs"));
  ok("kørsel rapporterer ikke passerende selftest", !fejlede.includes("baz-check.selftest.mjs"));
} finally {
  rmSync(dir, { recursive: true, force: true });
}

if (fejl) {
  console.error(`selvtjek meta-selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("selvtjek meta-selftest: alle checks passed (begge fail-stier bevist)");
