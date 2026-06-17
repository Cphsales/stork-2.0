// Selftest for self-validering-check (regel-flade klausul m) — krav 3.
import { validateSelfValidering } from "./self-validering-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

const god = {
  docsLaest: ["vision", "krav-dok"],
  holdtOpMod: "krav K1-K4",
  kanariefugl: "krav uden step → FAIL",
  driftFundet: [],
  ikkeVerificeret: "intet",
};

// Positiv evne: fuld blok passerer (driftFundet:[] = eksplicit 'ingen', gyldigt).
ok("fuld self-validerings-blok passerer", validateSelfValidering(god).ok);

// Kanariefugle: sprunget/tom blok SKAL afvises (papirgrøn-guard).
ok(
  "manglende kanariefugl → FAIL",
  harFejl(validateSelfValidering({ ...god, kanariefugl: "" }), "manglerIndhold(kanariefugl)"),
);
ok("tom docsLaest → FAIL", harFejl(validateSelfValidering({ ...god, docsLaest: [] }), "manglerIndhold(docsLaest)"));
ok(
  "manglende driftFundet-felt → FAIL",
  harFejl(validateSelfValidering({ ...god, driftFundet: undefined }), "manglerFelt(driftFundet)"),
);
ok("helt tom blok → flere fejl", validateSelfValidering({}).fejl.length >= 4);

if (fejl) {
  console.error(`self-validering-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("self-validering-check selftest: alle checks passed");
