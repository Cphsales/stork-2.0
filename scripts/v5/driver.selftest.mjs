#!/usr/bin/env node
// driver.selftest.mjs — red-team af decide-halvdelen (plan DEL VI (a)).
// Verificerer at flow-beslutningen matcher krav 9 (kun krav/plan/slut afbryder)
// og at afbryd-punkterne er AFLEDT af registryet, ikke hårdkodet.

import { decideNext, HUMAN_GATES, CHAIN } from "./driver.mjs";

let failed = 0;
const ok = (n) => console.log(`  ✓ ${n}`);
const bad = (n, d) => {
  console.error(`  ✗ ${n} — ${d}`);
  failed++;
};
const openUpTo = (gateId) => {
  // åbn alle gates FØR gateId (ekskl.) i kæde-orden
  const idx = gateId === null ? CHAIN.length : CHAIN.indexOf(gateId);
  const open = {};
  for (let i = 0; i < idx; i++) open[CHAIN[i]] = true;
  return open;
};
const expect = (n, state, action, gate) => {
  const r = decideNext(state);
  const okAction = r.action === action;
  const okGate = gate === undefined || r.gate === gate;
  okAction && okGate
    ? ok(n)
    : bad(
        n,
        `forventede ${action}${gate ? "/" + gate : ""}, fik ${r.action}${r.gate ? "/" + r.gate : ""} (${r.reason})`,
      );
};

console.log("registry-afledt: kun krav/plan/slut er menneske-gates (krav 9):");
JSON.stringify(HUMAN_GATES) === JSON.stringify(["krav", "plan", "slut"])
  ? ok(`HUMAN_GATES = ${JSON.stringify(HUMAN_GATES)} (afledt af approver ≠ null)`)
  : bad("human-gates", JSON.stringify(HUMAN_GATES));
JSON.stringify(CHAIN) === JSON.stringify(["recon", "krav", "plan", "build", "slut"])
  ? ok("kæde-orden fra registry")
  : bad("chain", JSON.stringify(CHAIN));

console.log("\nflow — næste milepæl + auto/menneske, i kæde-orden:");
expect("ikke launched → await-qwers", { launched: false, open: {} }, "await-qwers");
expect(
  "intet åbent → advance-auto/recon (auto-gate)",
  { launched: true, open: openUpTo("recon") },
  "advance-auto",
  "recon",
);
expect("recon åben → await-human/krav", { launched: true, open: openUpTo("krav") }, "await-human", "krav");
expect(
  "krav åben → advance-auto/plan? NEJ, plan er human",
  { launched: true, open: openUpTo("plan") },
  "await-human",
  "plan",
);
expect(
  "plan åben → advance-auto/build (auto-gate)",
  { launched: true, open: openUpTo("build") },
  "advance-auto",
  "build",
);
expect("build åben → await-human/slut", { launched: true, open: openUpTo("slut") }, "await-human", "slut");
expect("alle åbne → done", { launched: true, open: openUpTo(null) }, "done");

console.log("\nfail-closed:");
expect("HALT vinder over alt", { launched: true, halt: true, open: openUpTo(null) }, "halt");
expect("state mangler → inconsistent", null, "inconsistent");
expect(
  "gate åben uden forgænger → inconsistent",
  { launched: true, open: { recon: false, krav: true } },
  "inconsistent",
);
expect(
  "build åben mens plan lukket → inconsistent",
  { launched: true, open: { recon: true, krav: true, plan: false, build: true } },
  "inconsistent",
);

console.log("\nCodex P2-regressioner — malformeret state fail-lukker (2026-08-11):");
expect(
  "arvede open-felter (prototype) → inconsistent",
  { launched: true, open: Object.create({ recon: true, krav: true, plan: true, build: true, slut: true }) },
  "inconsistent",
);
expect(
  "ekstra ukendt gate i open → inconsistent",
  { launched: true, open: { recon: true, krav: true, plan: true, build: true, slut: true, fake: true } },
  "inconsistent",
);
expect("non-boolean open-værdi → inconsistent", { launched: true, open: { recon: 1 } }, "inconsistent");
expect("open som tal → inconsistent", { launched: true, open: 42 }, "inconsistent");
expect(
  "non-boolean halt (string) → inconsistent (ingen bypass)",
  { launched: true, halt: "true", open: { recon: true } },
  "inconsistent",
);
expect("non-boolean launched → inconsistent", { launched: 1, open: {} }, "inconsistent");
expect("state som array → inconsistent", [], "inconsistent");
expect("manglende open (frisk start) → advance-auto/recon", { launched: true }, "advance-auto", "recon");

console.log("");
if (failed > 0) {
  console.error(`driver red-team: ${failed} FEJLEDE`);
  process.exit(1);
}
console.log("driver red-team: alle cases passed");
