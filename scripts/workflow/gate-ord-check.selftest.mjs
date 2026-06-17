// Selftest for gate-ord-check (S12) — genbruger gate-def (a) + internalState.
import { validateGateOrdMapping } from "./gate-ord-check.mjs";
import { internalState } from "./gate-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

// Positiv evne: den faktiske gate-def mapper alle eksterne gate-ord.
ok("faktisk gate-def: alle eksterne mapper", validateGateOrdMapping().ok);
ok("plan OK → plan-laast", internalState("plan OK") === "plan-laast");

// Kanariefugl: en gate-def med et eksternt ord uden intern state → FAIL.
const huldef = { gateOrd: { eksterne: ["krav OK", "ukendt OK"], interneStates: { "krav OK": "krav-laast" } } };
ok("eksternt ord uden intern state → FAIL", harFejl(validateGateOrdMapping(huldef), "manglerInternState(ukendt OK)"));

if (fejl) {
  console.error(`gate-ord-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("gate-ord-check selftest: alle checks passed");
