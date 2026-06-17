// Selftest for krav-troskab-check (regel-flade klausul f) — krav 2.
// Beviser at (f) komponerer (b)+(j) og fanger fejl i hvert led + menings-gate + kæde-troskab.
import { validateKravTroskab } from "./krav-troskab-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

const current = { planSha: "94c70eb", kravHash: "c964826" };
const god = {
  spec: { krav: [{ id: "K-1", acceptkriterie: "a", step: "S1", test: "t" }], planSteps: ["S1"] },
  verdikt: { planSha: "94c70eb", kravHash: "c964826", meningsGate: "PASS" },
  current,
  kaedeTroskab: { kravModVision: "krav holdt op mod vision" },
};

// Positiv evne: fuldt krav-troskab-input passerer.
ok("fuldt input passerer", validateKravTroskab(god).ok);

// Kanariefugle — fejl i hvert komponeret led fanges:
ok("matrix-fejl (krav uden step) → FAIL", harFejl(validateKravTroskab({ ...god, spec: { krav: [{ id: "K-1", acceptkriterie: "a", test: "t" }] } }), "matrix:kravUdenStep"));
ok("binding-fejl (stale SHA) → FAIL", harFejl(validateKravTroskab({ ...god, verdikt: { ...god.verdikt, planSha: "570c9e6" } }), "binding:stale(planSha)"));
ok("manglende menings-gate → FAIL", harFejl(validateKravTroskab({ ...god, verdikt: { planSha: "94c70eb", kravHash: "c964826" } }), "manglerMeningsGate"));
ok("ugyldig menings-gate → FAIL", harFejl(validateKravTroskab({ ...god, verdikt: { ...god.verdikt, meningsGate: "LGTM" } }), "ugyldigMeningsGate"));
ok("manglende kæde-troskab → FAIL", harFejl(validateKravTroskab({ ...god, kaedeTroskab: {} }), "manglerKaedeTroskab(kravModVision)"));

if (fejl) {
  console.error(`krav-troskab-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("krav-troskab-check selftest: alle checks passed");
