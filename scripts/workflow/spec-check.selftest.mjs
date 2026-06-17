// Selftest for spec-check (regel-flade klausul b) — beviser at matrix-gaten faktisk afviser.
import { validateSpec } from "./spec-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

// Positiv evne: en konform spec passerer.
const god = {
  krav: [{ id: "K-1", acceptkriterie: "x virker", step: "S1", test: "t1" }],
  planSteps: ["S1"],
};
ok("konform spec passerer", validateSpec(god).ok);

// Kanariefugle (seedede fejl) — hver SKAL fanges, ellers er matrix-gaten papirgrøn:
ok("krav uden step → FAIL", harFejl(validateSpec({ krav: [{ id: "K-1", acceptkriterie: "a", test: "t" }] }), "kravUdenStep"));
ok("krav uden test → FAIL", harFejl(validateSpec({ krav: [{ id: "K-1", acceptkriterie: "a", step: "S1" }] }), "kravUdenTest"));
ok("krav uden acceptkriterie → FAIL", harFejl(validateSpec({ krav: [{ id: "K-1", step: "S1", test: "t" }] }), "kravUdenAcceptkriterie"));
ok("ugyldigt krav-id → FAIL", harFejl(validateSpec({ krav: [{ id: "K1x", acceptkriterie: "a", step: "S1", test: "t" }] }), "ugyldigtKravId"));
ok("plan-step uden krav → FAIL", harFejl(validateSpec({ krav: [{ id: "K-1", acceptkriterie: "a", step: "S1", test: "t" }], planSteps: ["S1", "S2"] }), "stepUdenKrav"));
ok("pakke-2 uden begrundelse → FAIL", harFejl(validateSpec({ krav: [{ id: "K-2", acceptkriterie: "a", pakke: 2 }] }), "pakke2UdenBegrundelse"));
ok("pakke-2 med begrundelse passerer", validateSpec({ krav: [{ id: "K-2", acceptkriterie: "a", pakke: 2, begrundelse: "bag-halvdel" }] }).ok);

if (fejl) {
  console.error(`spec-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("spec-check selftest: alle checks passed");
