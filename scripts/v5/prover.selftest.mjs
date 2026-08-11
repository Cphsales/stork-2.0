#!/usr/bin/env node
// prover.selftest.mjs — red-team af den model-frie reel-kør-dommer (plan DEL VI (a)).
// judgeTestSummary testes pure (mange kanter); runProver testes ende-til-ende
// mod et RIGTIGT git-repo — inkl. det bærende bevis: prover dømmer på den
// COMMITTEDE tilstand, ikke arbejdstræet (et grønt arbejdstræ kan ikke snyde).

import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { judgeTestSummary, runProver } from "./prover.mjs";
import { makeGit } from "./git.mjs";

let failed = 0;
const ok = (n) => console.log(`  ✓ ${n}`);
const bad = (n, d) => {
  console.error(`  ✗ ${n} — ${d}`);
  failed++;
};
const expectGreen = (n, r) => (r.ok === true ? ok(n) : bad(n, `rød: ${r.reasons.join(" | ")}`));
const expectRed = (n, r, needle) => {
  const hit = r.reasons.some((x) => new RegExp(needle).test(x));
  !r.ok && hit
    ? ok(n)
    : bad(n, r.ok ? "GRØN (falsk-grøn slap igennem)" : `rød men uden '${needle}': ${r.reasons.join(" | ")}`);
};

// ---------- judgeTestSummary (pure) ----------
console.log("judgeTestSummary — grøn kun ved reel, hel, skip-fri kør:");
expectGreen("alle beståede", judgeTestSummary({ total: 4, passed: 4, failed: 0, skipped: 0 }));
expectRed("0 tests = rød", judgeTestSummary({ total: 0, passed: 0, failed: 0, skipped: 0 }), "0 tests");
expectRed(
  "skipped > 0 = rød (skipped ≠ grøn)",
  judgeTestSummary({ total: 3, passed: 2, failed: 0, skipped: 1 }),
  "skipped ≠ grøn",
);
expectRed("failed > 0 = rød", judgeTestSummary({ total: 3, passed: 2, failed: 1, skipped: 0 }), "fejlede");
expectRed("passed = 0 = rød", judgeTestSummary({ total: 2, passed: 0, failed: 0, skipped: 2 }), "skipped ≠ grøn");
expectRed("inkonsistent sum", judgeTestSummary({ total: 5, passed: 2, failed: 0, skipped: 0 }), "inkonsistent");
expectRed(
  "ikke-heltal",
  judgeTestSummary({ total: 2.5, passed: 2, failed: 0, skipped: 0 }),
  "ikke et ikke-negativt heltal",
);
expectRed(
  "negativt tal",
  judgeTestSummary({ total: 2, passed: 3, failed: -1, skipped: 0 }),
  "ikke et ikke-negativt heltal",
);
expectRed("manglende felt", judgeTestSummary({ total: 2, passed: 2 }), "ikke et ikke-negativt heltal");
expectRed("ikke et objekt", judgeTestSummary(null), "mangler");
expectRed(
  "streng-tal (ingen coercion)",
  judgeTestSummary({ total: "4", passed: "4", failed: "0", skipped: "0" }),
  "ikke et ikke-negativt heltal",
);

// ---------- runProver (ende-til-ende mod rigtigt git-repo) ----------
const ROOT = mkdtempSync(join(tmpdir(), "v5-prover-fixture-"));
process.on("exit", () => rmSync(ROOT, { recursive: true, force: true }));
execFileSync("git", ["init", "-q", ROOT]);
const git = makeGit(ROOT);
git("config", "user.name", "selftest");
git("config", "user.email", "selftest@local");

// En triviel "test-runner": kører tests.mjs som skriver et resultat-JSON.
// tests.mjs styres af en konstant, så vi kan mutere udfaldet pr. commit.
const writeRunner = (summaryLiteral, exitCode = 0) => {
  mkdirSync(join(ROOT, "t"), { recursive: true });
  writeFileSync(
    join(ROOT, "t/run.mjs"),
    `import { writeFileSync } from "node:fs";\n` +
      `writeFileSync("result.json", JSON.stringify(${summaryLiteral}));\n` +
      `process.exit(${exitCode});\n`,
  );
};
const commitAll = (msg) => {
  git("add", "-A");
  git("commit", "-qm", msg);
  return git("rev-parse", "HEAD");
};
const CMD = ["node", "t/run.mjs"];

console.log("\nrunProver — reel kør mod committede artefakter:");
writeRunner(`{ total: 3, passed: 3, failed: 0, skipped: 0 }`);
const cGreen = commitAll("grøn test-suite");
expectGreen(
  "grøn committet suite → grøn",
  runProver({ repoRoot: ROOT, commitSha: cGreen, cmd: CMD, resultRelPath: "result.json", git }),
);

writeRunner(`{ total: 3, passed: 2, failed: 0, skipped: 1 }`);
const cSkip = commitAll("suite med skip");
expectRed(
  "committet skip → rød",
  runProver({ repoRoot: ROOT, commitSha: cSkip, cmd: CMD, resultRelPath: "result.json", git }),
  "skipped ≠ grøn",
);

writeRunner(`{ total: 2, passed: 1, failed: 1, skipped: 0 }`, 1);
const cFail = commitAll("fejlende suite (exit 1)");
{
  const r = runProver({ repoRoot: ROOT, commitSha: cFail, cmd: CMD, resultRelPath: "result.json", git });
  !r.ok && r.reasons.some((x) => /fejlede/.test(x)) && r.reasons.some((x) => /exit 1/.test(x))
    ? ok("fejlende suite → rød (både resumé OG exit-kode)")
    : bad("fejlende suite", r.ok ? "GRØN" : r.reasons.join(" | "));
}

// runner der IKKE skriver noget resultat (påstår grønt uden reel kør)
writeFileSync(join(ROOT, "t/run.mjs"), `process.exit(0);\n`);
const cNoResult = commitAll("runner uden resultat-fil");
expectRed(
  "intet resultat skrevet → rød",
  runProver({ repoRoot: ROOT, commitSha: cNoResult, cmd: CMD, resultRelPath: "result.json", git }),
  "kunne ikke læses",
);

// ---------- KERNEN: dom på COMMITTET tilstand, ikke arbejdstræet ----------
console.log("\nprover kører mod COMMITTET, ikke arbejdstræ:");
writeRunner(`{ total: 2, passed: 1, failed: 1, skipped: 0 }`, 1);
const cCommittedFail = commitAll("committet FEJLENDE suite");
// ret nu ARBEJDSTRÆET til grønt UDEN at committe:
writeRunner(`{ total: 2, passed: 2, failed: 0, skipped: 0 }`, 0);
{
  const r = runProver({ repoRoot: ROOT, commitSha: cCommittedFail, cmd: CMD, resultRelPath: "result.json", git });
  !r.ok && r.reasons.some((x) => /fejlede|exit/.test(x))
    ? ok("grønt arbejdstræ kan ikke snyde: prover ser den committede fejl (rød)")
    : bad("committet-vs-arbejdstræ", r.ok ? "GRØN — arbejdstræet snød proveren!" : r.reasons.join(" | "));
}
// og den committede grønne SHA er stadig grøn (samme arbejdstræ, anden SHA)
const cCommittedGreen = commitAll("committet grøn suite");
expectGreen(
  "committet grøn SHA → grøn",
  runProver({ repoRoot: ROOT, commitSha: cCommittedGreen, cmd: CMD, resultRelPath: "result.json", git }),
);

console.log("\nrunProver — input-validering (fail-closed):");
expectRed(
  "tom cmd",
  runProver({ repoRoot: ROOT, commitSha: cCommittedGreen, cmd: [], resultRelPath: "result.json", git }),
  "cmd skal være",
);
expectRed(
  "manglende git-dep",
  runProver({ repoRoot: ROOT, commitSha: cCommittedGreen, cmd: CMD, resultRelPath: "result.json", git: undefined }),
  "git-dep mangler",
);
expectRed(
  "ukendt commit-sha",
  runProver({ repoRoot: ROOT, commitSha: "0".repeat(40), cmd: CMD, resultRelPath: "result.json", git }),
  "kan ikke arkivere",
);

console.log("");
if (failed > 0) {
  console.error(`prover red-team: ${failed} FEJLEDE`);
  process.exit(1);
}
console.log("prover red-team: alle cases passed");
