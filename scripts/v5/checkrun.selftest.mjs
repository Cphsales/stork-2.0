#!/usr/bin/env node
// checkrun.selftest.mjs — red-team af check-run-mappingen (plan DEL VI (a)).
// Kernen: KUN eksplicit open===true → success; alt andet (malformeret, mismatch,
// truthy-men-ikke-true) → failure. Et required check må aldrig blive grønt på tvivl.

import { GATE_IDS, checkRunName } from "./gates.mjs";
import { checkRunFromGateResult } from "./checkrun.mjs";

let failed = 0;
const ok = (n) => console.log(`  ✓ ${n}`);
const bad = (n, d) => {
  console.error(`  ✗ ${n} — ${d}`);
  failed++;
};
const expectSuccess = (n, gateId, result) => {
  const cr = checkRunFromGateResult(gateId, result);
  cr.conclusion === "success" && cr.name === checkRunName(gateId) ? ok(n) : bad(n, `fik ${cr.conclusion} / ${cr.name}`);
};
const expectFailure = (n, gateId, result, needleName) => {
  const cr = checkRunFromGateResult(gateId, result);
  const nameOk = needleName === undefined || cr.name === needleName;
  cr.conclusion === "failure" && nameOk ? ok(n) : bad(n, `fik ${cr.conclusion} / ${cr.name} (falsk-grøn?)`);
};

console.log("check-run-mapping — success KUN ved eksplicit open===true:");
expectSuccess("åben gate → success", "build", { open: true, gate_id: "build", reasons: [] });
for (const g of GATE_IDS) expectSuccess(`${g}: åben → success (navn v5/gate/${g})`, g, { open: true, gate_id: g, reasons: [] });

console.log("\nlukket / fail-closed → failure:");
expectFailure("lukket gate m. reasons → failure", "build", { open: false, gate_id: "build", reasons: ["mutant overlevede"] });
expectFailure("open: 'true' (streng, ikke bool) → failure", "build", { open: "true", gate_id: "build", reasons: [] });
expectFailure("open: 1 → failure", "build", { open: 1, gate_id: "build", reasons: [] });
expectFailure("open mangler → failure", "build", { gate_id: "build", reasons: [] });
expectFailure("resultat null → failure", "build", null);
expectFailure("resultat ikke-objekt → failure", "build", 42);

console.log("\ngate-mismatch + ukendt gate (anti-spoof):");
expectFailure("result.gate_id ≠ emitteret gate → failure", "build", { open: true, gate_id: "recon", reasons: [] });
expectFailure("ukendt emitteret gate → failure m. sikkert navn", "hacker", { open: true, gate_id: "hacker", reasons: [] }, "v5/gate/invalid");

console.log("\naccessor / prototype-pollution / inkonsistens (Codex-P2):");
{
  const r = { gate_id: "build", reasons: [] };
  Object.defineProperty(r, "open", { enumerable: true, get: () => true });
  expectFailure("accessor open (getter) → failure", "build", r);
}
{
  const r = { open: true, reasons: [] };
  Object.defineProperty(r, "gate_id", { enumerable: true, get: () => "build" });
  expectFailure("accessor gate_id (getter) → failure", "build", r);
}
{
  Object.prototype.open = true; // pollution
  const r = { gate_id: "build", reasons: [] };
  let cr;
  try {
    cr = checkRunFromGateResult("build", r);
  } finally {
    delete Object.prototype.open;
  }
  cr.conclusion === "failure" ? ok("arvet open (prototype-pollution) → failure") : bad("cr-proto", "success");
}
expectFailure("open:true MEN reasons ikke-tom (inkonsistent) → failure", "build", { open: true, gate_id: "build", reasons: ["mutant overlevede"] });
expectFailure("open:true uden reasons-felt (malformed) → failure", "build", { open: true, gate_id: "build" });
expectFailure("open:true m. reasons som streng (malformed) → failure", "build", { open: true, gate_id: "build", reasons: "mutant overlevede" });

console.log("\nsummary-indhold (reasons medtages, men aldrig grøn):");
{
  const cr = checkRunFromGateResult("build", { open: false, gate_id: "build", reasons: ["a-fejl", "b-fejl"] });
  cr.conclusion === "failure" && /a-fejl/.test(cr.output.summary) && /b-fejl/.test(cr.output.summary)
    ? ok("failure-summary lister reasons")
    : bad("summary", cr.output.summary);
}

console.log("");
if (failed > 0) {
  console.error(`checkrun red-team: ${failed} FEJLEDE`);
  process.exit(1);
}
console.log("checkrun red-team: alle cases passed");
