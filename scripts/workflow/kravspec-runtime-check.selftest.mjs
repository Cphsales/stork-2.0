// Selftest for kravspec-runtime-check (S7, Leverance 2).
import { validateKravspecRun, kravHashAf } from "./kravspec-runtime-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

const god = {
  reconHash: "abc123",
  spec: { krav: [{ id: "K-1", acceptkriterie: "x", step: "S1", test: "t" }], planSteps: ["S1"] },
  medforfatterBidrag: "Claude.ai hjalp med at skrive K-1",
  buildVsOensker: "nuværende build vs ønske: x",
  kravModVision: "K-1 holdt op mod vision",
};

// Positiv evne: fuld kravspec-run passerer + giver krav-hash.
const r = validateKravspecRun(god);
ok("fuld kravspec-run passerer", r.ok);
ok("producerer krav-hash", typeof r.kravHash === "string" && r.kravHash.length === 64);

// Kanariefugle:
ok(
  "ikke bygget fra recon-sandhed → FAIL",
  harFejl(validateKravspecRun({ ...god, reconHash: "" }), "ikkeByggetFraReconSandhed"),
);
ok(
  "matrix-fejl (krav uden step) → FAIL",
  harFejl(
    validateKravspecRun({ ...god, spec: { krav: [{ id: "K-1", acceptkriterie: "x", test: "t" }] } }),
    "matrix:kravUdenStep",
  ),
);
ok(
  "manglende medforfatter-bidrag → FAIL",
  harFejl(validateKravspecRun({ ...god, medforfatterBidrag: "" }), "manglerMedforfatterBidrag"),
);
ok(
  "manglende build-vs-ønsker → FAIL",
  harFejl(validateKravspecRun({ ...god, buildVsOensker: "" }), "manglerBuildVsOensker"),
);
ok("manglende krav⊨vision → FAIL", harFejl(validateKravspecRun({ ...god, kravModVision: "" }), "manglerKravModVision"));

// Krav-hash deterministisk af spec.
ok("samme spec → samme krav-hash", kravHashAf(god.spec) === kravHashAf(god.spec));

if (fejl) {
  console.error(`kravspec-runtime-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("kravspec-runtime-check selftest: alle checks passed");
