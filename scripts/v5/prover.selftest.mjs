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
expectRed("manglende felt", judgeTestSummary({ total: 2, passed: 2 }), "mangler egent felt");
expectRed("ikke et objekt", judgeTestSummary(null), "mangler");
expectRed(
  "usikkert JSON-tal (> 2^53) → rød (JSON.parse-afrunding)",
  judgeTestSummary(JSON.parse('{"total":9007199254740992,"passed":9007199254740993,"failed":0,"skipped":0}')),
  "ikke et ikke-negativt heltal",
);
expectRed(
  "arvede felter (prototype) = rød",
  judgeTestSummary(Object.create({ total: 1, passed: 1, failed: 0, skipped: 0 })),
  "mangler egent felt",
);
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
  "kan ikke (liste træet|checke commit)",
);
expectRed(
  "resultRelPath med .. (escape) → rød",
  runProver({ repoRoot: ROOT, commitSha: cCommittedGreen, cmd: CMD, resultRelPath: "../escape.json", git }),
  "inde i worktree",
);
expectRed(
  "ikke-pinned ref (HEAD) → rød (Codex-fund: dom skal bindes til OID)",
  runProver({ repoRoot: ROOT, commitSha: "HEAD", cmd: CMD, resultRelPath: "result.json", git }),
  "pinned commit-OID",
);

// ---------- Codex P2-regressioner (2026-08-11) ----------
console.log("\nCodex-fund — git worktree tager HELE committede tree (ikke export-ignore-filtreret):");
{
  // .gitattributes export-ignore på en committet FEJL-markør. git archive ville
  // udelade t/FAIL → runner ser den ikke → falsk-grøn. worktree tager den med.
  writeFileSync(
    join(ROOT, "t/run.mjs"),
    `import { existsSync, writeFileSync } from "node:fs";\n` +
      `const failing = existsSync("t/FAIL");\n` +
      `writeFileSync("result.json", JSON.stringify({ total: 1, passed: failing ? 0 : 1, failed: failing ? 1 : 0, skipped: 0 }));\n` +
      `process.exit(failing ? 1 : 0);\n`,
  );
  writeFileSync(join(ROOT, "t/FAIL"), "en committet fejlende test\n");
  writeFileSync(join(ROOT, ".gitattributes"), "t/FAIL export-ignore\n");
  const cIgnore = commitAll("export-ignore på committet fejl-markør");
  expectRed(
    "export-ignoreret committet fejl ses stadig (worktree, ikke archive)",
    runProver({ repoRoot: ROOT, commitSha: cIgnore, cmd: CMD, resultRelPath: "result.json", git }),
    "fejlede|exit",
  );
  // ryd op så senere cases ikke arver FAIL/.gitattributes
  rmSync(join(ROOT, "t/FAIL"), { force: true });
  rmSync(join(ROOT, ".gitattributes"), { force: true });
}

console.log("\nCodex-fund — committet/stale result-fil tæller ikke (slettes før kør):");
{
  writeRunner(`{ total: 2, passed: 2, failed: 0, skipped: 0 }`); // committer OGSÅ en grøn result.json
  writeFileSync(join(ROOT, "result.json"), JSON.stringify({ total: 9, passed: 9, failed: 0, skipped: 0 }));
  // men runneren SKRIVER intet (kun exit 0) — så kun den committede stale fil ville findes
  writeFileSync(join(ROOT, "t/run.mjs"), `process.exit(0);\n`);
  const cStale = commitAll("committet stale result.json + runner der intet skriver");
  expectRed(
    "committet grøn result.json kan ikke overleve (slettet før kør)",
    runProver({ repoRoot: ROOT, commitSha: cStale, cmd: CMD, resultRelPath: "result.json", git }),
    "kunne ikke læses",
  );
  rmSync(join(ROOT, "result.json"), { force: true });
}

console.log("\nCodex-fund — submodules fail-closed (ufuldstændig committet testflade):");
{
  writeRunner(`{ total: 1, passed: 1, failed: 0, skipped: 0 }`);
  writeFileSync(join(ROOT, ".gitmodules"), '[submodule "vendor"]\n  path = vendor\n  url = ../x\n');
  const cSub = commitAll("committet .gitmodules");
  expectRed(
    "repo med .gitmodules → rød",
    runProver({ repoRoot: ROOT, commitSha: cSub, cmd: CMD, resultRelPath: "result.json", git }),
    "submodules understøttes ikke",
  );
  rmSync(join(ROOT, ".gitmodules"), { force: true });
}

console.log("\nCodex-fund (final2) — gitlink UDEN .gitmodules fail-closer:");
{
  // opret en ægte gitlink (mode 160000) uden en .gitmodules-fil
  writeRunner(`{ total: 1, passed: 1, failed: 0, skipped: 0 }`);
  const sub = mkdtempSync(join(tmpdir(), "v5-sub-"));
  execFileSync("git", ["init", "-q", sub]);
  execFileSync("git", ["-C", sub, "config", "user.name", "s"]);
  execFileSync("git", ["-C", sub, "config", "user.email", "s@l"]);
  writeFileSync(join(sub, "f.txt"), "x\n");
  execFileSync("git", ["-C", sub, "add", "-A"]);
  execFileSync("git", ["-C", sub, "commit", "-qm", "sub"]);
  const subOid = execFileSync("git", ["-C", sub, "rev-parse", "HEAD"]).toString().trim();
  // tilføj gitlink direkte i index (ingen .gitmodules)
  execFileSync("git", ["-C", ROOT, "update-index", "--add", "--cacheinfo", `160000,${subOid},vendor/sub`]);
  git("commit", "-qm", "gitlink uden .gitmodules");
  const cLink = git("rev-parse", "HEAD");
  expectRed(
    "gitlink (160000) uden .gitmodules → rød",
    runProver({ repoRoot: ROOT, commitSha: cLink, cmd: CMD, resultRelPath: "result.json", git }),
    "gitlink/submodule",
  );
  execFileSync("git", ["-C", ROOT, "rm", "--cached", "-q", "vendor/sub"]);
  git("commit", "-qm", "fjern gitlink");
  rmSync(sub, { recursive: true, force: true });
}

console.log("");
if (failed > 0) {
  console.error(`prover red-team: ${failed} FEJLEDE`);
  process.exit(1);
}
console.log("prover red-team: alle cases passed");
