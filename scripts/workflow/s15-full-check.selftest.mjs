// Selftest for s15-full-check (S15-full, Leverance 4) — hermetisk over temp-fixture.
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanDocsTree, validateS15Full } from "./s15-full-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

// scanDocsTree finder .md rekursivt.
const dir = mkdtempSync(join(tmpdir(), "wf-s15full-"));
try {
  mkdirSync(join(dir, "under"), { recursive: true });
  writeFileSync(join(dir, "a.md"), "# a");
  writeFileSync(join(dir, "under", "b.md"), "# b");
  writeFileSync(join(dir, "ignorer.txt"), "x");
  const md = scanDocsTree(dir, dir).sort();
  ok("scanner .md rekursivt (ikke .txt)", md.length === 2 && md.includes("a.md") && md.includes("under/b.md"));

  const inv = [{ doc: "a.md", status: "aktiv-sandhed", emne: "a", formaal: "f", ejerFunktion: "e", testGate: "t" }];
  // b.md er ikke inventoriseret → skal fanges (Plan-2-precondition: hele docs/ klassificeret).
  ok("uinventeret docs/-doc → FAIL", harFejl(validateS15Full(inv, md), "uinventeretDoc(under/b.md)"));
} finally {
  rmSync(dir, { recursive: true, force: true });
}

// Konkurrerende aktiv sandhed videregives fra (i).
ok(
  "konkurrerende aktiv sandhed → BLOKER",
  harFejl(
    validateS15Full(
      [
        { doc: "x.md", status: "aktiv-sandhed", emne: "t", formaal: "f", ejerFunktion: "e", testGate: "g" },
        { doc: "y.md", status: "aktiv-sandhed", emne: "t", formaal: "f", ejerFunktion: "e", testGate: "g" },
      ],
      ["x.md", "y.md"],
    ),
    "konkurrerendeSandhed",
  ),
);

if (fejl) {
  console.error(`s15-full-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("s15-full-check selftest: alle checks passed");
