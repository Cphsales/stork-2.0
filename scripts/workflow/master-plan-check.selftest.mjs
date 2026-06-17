// Selftest for master-plan-check (S11) — krav 10.
import { validateMasterPlan } from "./master-plan-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

// Positiv evne: ingen ændring/modsigelse → passerer.
ok("ingen ændring → OK", validateMasterPlan({}).ok);
ok("ændring MED Mathias-gate → OK", validateMasterPlan({ masterPlanAendret: true, mathiasGate: true }).ok);

// Kanariefugle:
ok(
  "master-plan ændret uden Mathias-gate → FAIL",
  harFejl(validateMasterPlan({ masterPlanAendret: true }), "kraeverMathiasGate"),
);
ok(
  "plan modsiger master-plan uden gate → FAIL",
  harFejl(validateMasterPlan({ planModsigerMasterPlan: true }), "kraeverMathiasGate"),
);

if (fejl) {
  console.error(`master-plan-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("master-plan-check selftest: alle checks passed");
