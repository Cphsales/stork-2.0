// Selftest for krav-gate-check (S8, Leverance 3) — komponerer f+k+j+kravspec + Mathias-sidst.
import { validateKravGate } from "./krav-gate-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

const recon64 = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const cur = { planSha: "ps0000", kravHash: "kh0000" };
const ai = (aktoer) => ({ aktoer, planSha: cur.planSha, kravHash: cur.kravHash });
const spec = { krav: [{ id: "K-1", acceptkriterie: "x", step: "S1", test: "t" }], planSteps: ["S1"] };
const god = {
  kravTroskab: {
    spec,
    verdikt: { planSha: "ps", kravHash: "kh", meningsGate: "PASS" },
    current: { planSha: "ps", kravHash: "kh" },
    kaedeTroskab: { kravModVision: "krav holdt op mod vision" },
  },
  djaevelPass: {
    krav: [
      {
        id: "K-1",
        minLaesning: "m",
        maxLaesning: "M",
        snydevejTilGroen: "s",
        kanariefuglDerLukker: "k",
        evneIkkeFaerdig: "e",
        ikkeGemtBagBuildRecon: "i",
      },
    ],
    approval: true,
  },
  kravspecRun: { reconHash: recon64, spec, medforfatterBidrag: "b", buildVsOensker: "b", kravModVision: "v" },
  currentReconHash: recon64,
  current: cur,
  aiVerdikter: [ai("Code"), ai("Codex"), ai("Claude.ai")],
  mathiasVerdikt: { aktoer: "Mathias", ...cur },
};

// Positiv evne: fuld krav-gate passerer.
ok("fuld krav-gate passerer", validateKravGate(god).ok);

// Kanariefugle — hvert komponeret led fanges:
ok(
  "manglende AI-verdikt → FAIL",
  harFejl(validateKravGate({ ...god, aiVerdikter: [ai("Code"), ai("Codex")] }), "manglerAiVerdikt(Claude.ai)"),
);
ok(
  "Mathias før alle AI → FAIL",
  harFejl(validateKravGate({ ...god, aiVerdikter: [ai("Code"), ai("Codex")] }), "mathiasIkkeSidst"),
);
ok(
  "stale AI-binding → FAIL",
  harFejl(
    validateKravGate({
      ...god,
      aiVerdikter: [ai("Code"), ai("Codex"), { aktoer: "Claude.ai", planSha: "FORKERT", kravHash: cur.kravHash }],
    }),
    "binding(Claude.ai):stale",
  ),
);
ok(
  "kravspec recon-hash mismatch current → FAIL",
  harFejl(validateKravGate({ ...god, currentReconHash: "f".repeat(64) }), "kravspec:reconHashMismatch"),
);
ok(
  "manglende currentReconHash → FAIL",
  harFejl(validateKravGate({ ...god, currentReconHash: undefined }), "manglerCurrentReconHash"),
);
ok(
  "ufuldt djævel-pass → FAIL",
  harFejl(
    validateKravGate({ ...god, djaevelPass: { krav: [{ id: "K-1", minLaesning: "m" }], approval: true } }),
    "djaevel:",
  ),
);
ok(
  "troskab-fejl (umappet krav) → FAIL",
  harFejl(
    validateKravGate({
      ...god,
      kravTroskab: { ...god.kravTroskab, spec: { krav: [{ id: "K-1", acceptkriterie: "x", test: "t" }] } },
    }),
    "troskab:matrix:kravUdenStep",
  ),
);

if (fejl) {
  console.error(`krav-gate-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("krav-gate-check selftest: alle checks passed");
