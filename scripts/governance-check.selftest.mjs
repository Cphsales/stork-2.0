#!/usr/bin/env node
// Selftest for governance-check.mjs (§3.6 leverings-kriterium).
// Beviser scanneren: (a) går grøn på en gyldig kopi af repoet, (b) fejler korrekt
// på planted overtrædelser pr. check-klasse. Kører scanneren via cwd=temp-fixture.

import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync, appendFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SCANNER = join(process.cwd(), "scripts", "governance-check.mjs");
let failed = 0;
const ok = (n) => console.log(`  ✓ ${n}`);
const bad = (n, d) => {
  console.error(`  ✗ ${n} — ${d}`);
  failed++;
};

function run(root) {
  try {
    execSync(`node ${SCANNER}`, { cwd: root, stdio: "pipe" });
    return 0;
  } catch (e) {
    return e.status ?? 1;
  }
}
function fixture() {
  // git archive HEAD = committed tree (uden untracked strays) — afspejler hvad CI ser,
  // så untracked-fil-falsk-grøn fanges. Working-tree-kopi ville skjule den klasse.
  const d = mkdtempSync(join(tmpdir(), "govtest-"));
  execSync(`git archive HEAD | tar -x -C "${d}"`, { stdio: "pipe" });
  return d;
}

// (a) baseline: ren kopi -> grøn
{
  const d = fixture();
  run(d) === 0 ? ok("baseline ren kopi -> exit 0") : bad("baseline", "forventede exit 0");
  rmSync(d, { recursive: true, force: true });
}

// (b) planted overtrædelser pr. klasse -> exit != 0
const cases = [
  ["dead-doc-paths", (d) => appendFileSync(join(d, "docs/strategi/disciplin.md"), "\nSe docs/findes-ikke-xyz.md\n")],
  ["junk-files", (d) => writeFileSync(join(d, "docs/~$junk.md"), "x")],
  [
    "owns-uniqueness",
    (d) => appendFileSync(join(d, "docs/strategi/vision-og-principper.md"), "\n<!-- governance-owns: kode-gaeld -->\n"),
  ],
  [
    "number-home-uniqueness",
    (d) => appendFileSync(join(d, "docs/strategi/disciplin.md"), "\n### [H001] dublet-entry\n"),
  ],
  ["H-ref-integrity", (d) => appendFileSync(join(d, "docs/strategi/disciplin.md"), "\nSe H999 et sted.\n")],
];
for (const [name, plant] of cases) {
  const d = fixture();
  plant(d);
  run(d) !== 0 ? ok(`planted ${name} -> exit != 0`) : bad(name, "scanner gik grøn trods overtrædelse");
  rmSync(d, { recursive: true, force: true });
}

if (failed) {
  console.error(`\nSelftest FEJLEDE (${failed})`);
  process.exit(1);
}
console.log("\nGovernance selftest: alle cases passed");
