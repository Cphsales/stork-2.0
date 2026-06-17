// Selftest for s15-light-check (S15-light) — doc-grundlag + dækning.
import { validateS15 } from "./s15-light-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

const inv = [
  {
    doc: "workflow/regelflade.md",
    status: "workflow-funktion",
    emne: "regelflade",
    formaal: "regel-flade",
    ejerFunktion: "checks",
    testGate: "selftest",
    handling: "behold",
  },
];

// Positiv evne: inventory dækker alle md-filer → ok.
ok("dækkende inventory passerer", validateS15(inv, ["workflow/regelflade.md"]).ok);

// Kanariefugle:
ok(
  "uinventeret workflow-doc → FAIL",
  harFejl(validateS15(inv, ["workflow/regelflade.md", "workflow/ny.md"]), "uinventeretDoc(workflow/ny.md)"),
);
ok(
  "konkurrerende aktiv sandhed videregives fra (i) → BLOKER",
  harFejl(
    validateS15(
      [
        { doc: "a.md", status: "aktiv-sandhed", emne: "x", formaal: "f", ejerFunktion: "e", testGate: "t" },
        { doc: "b.md", status: "aktiv-sandhed", emne: "x", formaal: "f", ejerFunktion: "e", testGate: "t" },
      ],
      ["a.md", "b.md"],
    ),
    "konkurrerendeSandhed",
  ),
);

if (fejl) {
  console.error(`s15-light-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("s15-light-check selftest: alle checks passed");
