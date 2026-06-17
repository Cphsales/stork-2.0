// Selftest for repo-hygiejne-check (regel-flade klausul i) — krav 8.
import { validateInventory } from "./repo-hygiejne-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

const levende = {
  doc: "workflow/regelflade.md",
  status: "workflow-funktion",
  emne: "regelflade",
  formaal: "regel-flade",
  ejerFunktion: "gate-check",
  testGate: "selvtjek",
};
const arkiv = { doc: "gammel.md", status: "arkiv", emne: "gammelt", handling: "arkiver-git-historik" };

// Positiv evne: gyldig inventory passerer.
ok("gyldig inventory passerer", validateInventory([levende, arkiv]).ok);

// Kanariefugle:
ok("ukendt status → FAIL", harFejl(validateInventory([{ ...levende, status: "fancy" }]), "ukendtStatus"));
ok("levende doc uden testGate → FAIL", harFejl(validateInventory([{ ...levende, testGate: "" }]), "levendeDocUden(testGate)"));
ok("ukendt handling → FAIL", harFejl(validateInventory([{ ...arkiv, handling: "smid-ud" }]), "ukendtHandling"));
ok(
  "konkurrerende aktiv sandhed pr. emne → BLOKER",
  harFejl(
    validateInventory([
      { doc: "a.md", status: "aktiv-sandhed", emne: "loen", formaal: "x", ejerFunktion: "y", testGate: "z" },
      { doc: "b.md", status: "aktiv-sandhed", emne: "loen", formaal: "x", ejerFunktion: "y", testGate: "z" },
    ]),
    "konkurrerendeSandhed(loen)",
  ),
);

if (fejl) {
  console.error(`repo-hygiejne-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("repo-hygiejne-check selftest: alle checks passed");
