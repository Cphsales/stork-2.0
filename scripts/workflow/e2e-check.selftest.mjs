// Selftest for e2e-check (S14, Leverance 4) — kæde-uafhængig e2e + kanariefugl-suite.
import { runFrontHalvdel } from "./e2e-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, frag) => res.fejl.some((f) => f.includes(frag));

// Positiv evne: hele front-halvdelen producerer godkendt plan uden hånd-syning.
const groen = runFrontHalvdel();
ok("front-halvdelen producerer godkendt plan", groen.ok);
ok("alle trin kørt", groen.trin.includes("start-kaede") && groen.trin.includes("plan-gate"));

// Kanariefugl-suite: hver seedet fejl fanges af sin station.
ok(
  "ufuldstændig start-kæde → fanget",
  harFejl(runFrontHalvdel({ startKaede: { kravOplaegFremlagt: false } }), "start-kaede:kravOplaegMangler"),
);
ok("fake recon-hash i kravspec → fanget", harFejl(runFrontHalvdel({ fakeReconHash: "ikke-en-hash" }), "kravspec:"));
ok(
  "krav-gate uden alle AI → fanget",
  harFejl(runFrontHalvdel({ kravGateUdenAlle: true }), "krav-gate:manglerAiVerdikt"),
);
ok(
  "plan-gate før ren krav-gate → fanget",
  harFejl(runFrontHalvdel({ kravGateIkkeRen: true }), "plan-gate:kravGateIkkeRen"),
);
ok(
  "dårlig recon (tidlig stop) → fanget",
  harFejl(runFrontHalvdel({ reconFoerKrav: { stoppedEarly: true } }), "recon-foer-krav:"),
);

if (fejl) {
  console.error(`e2e-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("e2e-check selftest: alle checks passed");
