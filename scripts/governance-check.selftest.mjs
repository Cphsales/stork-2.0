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

// gov-docs-renhed: allowlist-split + structural-chain cases.
// chainFiles producerer en FULDT konsistent kæde — hver case planter ÉN defekt.
const FORMAAL = "> Denne pakke leverer: testleverance.\n";
const PLAN_OK = `# t\n\ndocs/coordination/testpakke-krav-og-data.md\ndocs/coordination/testpakke-status.md\n\n## Formål\n\n${FORMAAL}`;
const chainFiles = (d, { plan = PLAN_OK, kravFormaal = FORMAAL } = {}) => {
  writeFileSync(join(d, "docs/coordination/testpakke-krav-og-data.md"), `# t\n\n## Formål\n\n${kravFormaal}`);
  writeFileSync(join(d, "docs/coordination/testpakke-plan.md"), plan);
  writeFileSync(join(d, "docs/coordination/testpakke-status.md"), "# testpakke status\n");
};
const setMarker = (d, fase) =>
  appendFileSync(join(d, "docs/coordination/aktiv-plan.md"), `\n<!-- aktiv-pakke: testpakke fase: ${fase} -->\n`);
cases.push(
  [
    "script-dead-path",
    (d) => appendFileSync(join(d, "scripts/types-gen.sh"), "\ncat docs/skabeloner/plan-skabelon.md\n"),
  ],
  ["chain-missing-files", (d) => setMarker(d, "plan")],
  [
    "chain-formaal-mismatch",
    (d) => {
      chainFiles(d, { kravFormaal: "> Denne pakke leverer: noget ANDET.\n" });
      setMarker(d, "plan");
    },
  ],
  [
    "chain-missing-krydspeg",
    (d) => {
      chainFiles(d, { plan: `# t\n\ndocs/coordination/testpakke-status.md\n\n## Formål\n\n${FORMAAL}` });
      setMarker(d, "plan");
    },
  ],
  [
    "chain-missing-status-krydspeg",
    (d) => {
      chainFiles(d, { plan: `# t\n\ndocs/coordination/testpakke-krav-og-data.md\n\n## Formål\n\n${FORMAAL}` });
      setMarker(d, "plan");
    },
  ],
  [
    "chain-rapport-missing",
    (d) => {
      chainFiles(d);
      setMarker(d, "rapport");
    },
  ],
  [
    "chain-rapport-formaal-mismatch",
    (d) => {
      chainFiles(d);
      writeFileSync(
        join(d, "docs/coordination/rapport-historik/2099-01-01-testpakke.md"),
        "# t\n\n## Formål\n\n> Denne pakke leverer: noget TREDJE.\n",
      );
      setMarker(d, "rapport");
    },
  ],
  [
    "chain-rapport-no-formaal",
    (d) => {
      chainFiles(d);
      writeFileSync(join(d, "docs/coordination/rapport-historik/2099-01-01-testpakke.md"), "# t\n\nIngen blok.\n");
      setMarker(d, "rapport");
    },
  ],
);

for (const [name, plant] of cases) {
  const d = fixture();
  plant(d);
  run(d) !== 0 ? ok(`planted ${name} -> exit != 0`) : bad(name, "scanner gik grøn trods overtrædelse");
  rmSync(d, { recursive: true, force: true });
}

// positiv-case: deprecated script får lov at bære historisk-provenance-ref
{
  const d = fixture();
  appendFileSync(join(d, "scripts/types-gen.sh"), "\n# governance: deprecated\ncat docs/skabeloner/plan-skabelon.md\n");
  run(d) === 0 ? ok("script-dead-path-deprecated -> exit 0") : bad("script-dead-path-deprecated", "deprecated script burde gå grøn");
  rmSync(d, { recursive: true, force: true });
}

if (failed) {
  console.error(`\nSelftest FEJLEDE (${failed})`);
  process.exit(1);
}
console.log("\nGovernance selftest: alle cases passed");
