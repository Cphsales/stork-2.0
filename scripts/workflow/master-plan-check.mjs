// S11 (Leverance 3) — master-plan-konsistens-gate (krav 10).
// Master-plan ændret siden krav OK, ELLER plan modsiger master-plan → kræver Mathias-gate.
import { readFileSync } from "node:fs";

// state = { masterPlanAendret, planModsigerMasterPlan, mathiasGate }
export function validateMasterPlan(state) {
  const fejl = [];
  const udloeser = state?.masterPlanAendret || state?.planModsigerMasterPlan;
  if (udloeser && !state?.mathiasGate) fejl.push("kraeverMathiasGate");
  return { ok: fejl.length === 0, fejl };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) {
    console.error("brug: master-plan-check.mjs <state.json>");
    process.exit(2);
  }
  const res = validateMasterPlan(JSON.parse(readFileSync(path, "utf8")));
  if (!res.ok) {
    console.error("MASTER-PLAN-GATE:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log("master-plan OK (ingen ændring/modsigelse uden Mathias-gate)");
}
