// Selftest for gate-check (regel-flade klausul a).
// Beviser at funktionen VIRKER, ikke kun findes (krav 1 / test-dybde):
// kanariefuglen er den seedede UGYLDIGE disposition/gate-ord der SKAL afvises.
import { validGateOrd, validDisposition, internalState } from "./gate-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};

// Positiv evne: gyldige tokens accepteres + mapper til intern state.
ok("gyldigt gate-ord", validGateOrd("plan OK"));
ok("gyldig disposition", validDisposition("BLOCKER"));
ok("intern state mapping", internalState("plan OK") === "plan-laast");

// Kanariefugl (seedet fejl): ugyldige tokens SKAL afvises — ellers er gaten papirgroen.
ok("ukendt gate-ord afvist", validGateOrd("approved") === false);
ok("ukendt disposition afvist", validDisposition("LGTM") === false);
ok("ukendt gate-ord har ingen state", internalState("approved") === null);

if (fejl) {
  console.error(`gate-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("gate-check selftest: alle checks passed");
