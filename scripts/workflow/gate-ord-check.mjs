// S12 (Leverance 3) — gate-ord-afstemning. Verificerer at hvert eksternt gate-ord
// (krav OK / plan OK / build OK) mapper til en intern state. Genbruger gate-def (a).
import { loadGateDef } from "./gate-check.mjs";

export function validateGateOrdMapping(def = loadGateDef()) {
  const fejl = [];
  const interne = def?.gateOrd?.interneStates ?? {};
  for (const w of def?.gateOrd?.eksterne ?? []) {
    if (!Object.prototype.hasOwnProperty.call(interne, w)) fejl.push(`manglerInternState(${w})`);
  }
  return { ok: fejl.length === 0, fejl };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const res = validateGateOrdMapping();
  if (!res.ok) {
    console.error("GATE-ORD AFVIST:\n  " + res.fejl.join("\n  "));
    process.exit(1);
  }
  console.log("gate-ord OK (alle eksterne gate-ord mapper til intern state)");
}
