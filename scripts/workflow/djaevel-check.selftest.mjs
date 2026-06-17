// Selftest for djaevel-check (regel-flade klausul k) — krav 3/5.
import { validateDjaevelPass } from "./djaevel-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

const fuldtKrav = {
  id: "K-1",
  minLaesning: "min",
  maxLaesning: "max",
  snydevejTilGroen: "kunne snyde via x",
  kanariefuglDerLukker: "test der fanger x",
  evneIkkeFaerdig: "evne mangler = ikke færdig",
  ikkeGemtBagBuildRecon: "intet gemt",
};

// Positiv evne: fuldt 6-felts-pass passerer, også med approval.
ok("fuldt pass passerer", validateDjaevelPass({ krav: [fuldtKrav], approval: true }).ok);

// Kanariefugle: manglende felt + approval uden fuldt pass SKAL afvises.
ok(
  "manglende felt → FAIL",
  harFejl(validateDjaevelPass({ krav: [{ ...fuldtKrav, snydevejTilGroen: "" }] }), "manglerFelt(K-1.snydevejTilGroen)"),
);
ok(
  "approval uden fuldt pass → FAIL",
  harFejl(
    validateDjaevelPass({ krav: [{ ...fuldtKrav, kanariefuglDerLukker: "" }], approval: true }),
    "approvalUdenFuldtPass",
  ),
);
ok(
  "tomt pass (ingen krav) + approval → FAIL",
  harFejl(validateDjaevelPass({ krav: [], approval: true }), "approvalUdenFuldtPass"),
);

// Codex-hærdning: scope-routing må ikke springe et BERØRT krav over.
ok(
  "berørt krav ikke dækket → FAIL",
  harFejl(
    validateDjaevelPass({ krav: [fuldtKrav], beroerte: ["K-1", "K-3"], approval: true }),
    "beroertKravIkkeDaekket(K-3)",
  ),
);
ok(
  "alle berørte dækket → OK",
  validateDjaevelPass({ krav: [fuldtKrav, { ...fuldtKrav, id: "K-3" }], beroerte: ["K-1", "K-3"], approval: true }).ok,
);

if (fejl) {
  console.error(`djaevel-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("djaevel-check selftest: alle checks passed");
