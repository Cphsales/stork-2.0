// Selftest for handoff-check (regel-flade klausul j) — SHA-binding (krav 2/5/9).
import { validateBinding, kanalFor } from "./handoff-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

const current = { planSha: "94c70eb", kravHash: "c964826" };

// Positiv evne: verdikt bundet til aktuel SHA + hash passerer.
ok("korrekt binding passerer", validateBinding({ planSha: "94c70eb", kravHash: "c964826" }, current).ok);
ok("aktør har defineret kanal", kanalFor("Claude.ai") !== null);

// Kanariefugle: stale/forkert/manglende binding SKAL afvises.
ok("stale plan-SHA → FAIL", harFejl(validateBinding({ planSha: "570c9e6", kravHash: "c964826" }, current), "stale(planSha)"));
ok("forkert krav-hash → FAIL", harFejl(validateBinding({ planSha: "94c70eb", kravHash: "DEADBEEF" }, current), "stale(kravHash)"));
ok("manglende krav-hash → FAIL", harFejl(validateBinding({ planSha: "94c70eb" }, current), "bindingMangler(kravHash)"));
ok("ukendt aktør har ingen kanal", kanalFor("Ukendt") === null);

if (fejl) {
  console.error(`handoff-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("handoff-check selftest: alle checks passed");
