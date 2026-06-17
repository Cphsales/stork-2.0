// Selftest for plan-gate-check (S9, Leverance 3) — dual-hash fire-aktør + djævel + plan-troskab.
import { validatePlanGate } from "./plan-gate-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

const cur = { planSha: "ps0000", kravHash: "kh0000" };
const ai = (aktoer) => ({ aktoer, planSha: cur.planSha, kravHash: cur.kravHash });
const djaevelPass = {
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
};
const god = {
  kravGateRen: true,
  djaevelPass,
  planTroskab: { planModVisionOgKrav: "plan holdt op mod vision + krav" },
  current: cur,
  aiVerdikter: [ai("Code"), ai("Codex"), ai("Claude.ai")],
  mathiasVerdikt: { aktoer: "Mathias", ...cur },
};

// Positiv evne: fuld plan-gate passerer.
ok("fuld plan-gate passerer", validatePlanGate(god).ok);

// Kanariefugle:
ok("ikke ren krav-gate → FAIL", harFejl(validatePlanGate({ ...god, kravGateRen: false }), "kravGateIkkeRen"));
ok(
  "stale plan-SHA → FAIL",
  harFejl(
    validatePlanGate({
      ...god,
      aiVerdikter: [ai("Code"), ai("Codex"), { aktoer: "Claude.ai", planSha: "STALE", kravHash: cur.kravHash }],
    }),
    "binding(Claude.ai):stale(planSha)",
  ),
);
ok(
  "stale krav-hash (dual-hash) → FAIL",
  harFejl(
    validatePlanGate({
      ...god,
      aiVerdikter: [ai("Code"), ai("Codex"), { aktoer: "Claude.ai", planSha: cur.planSha, kravHash: "STALE" }],
    }),
    "binding(Claude.ai):stale(kravHash)",
  ),
);
ok("manglende plan-troskab → FAIL", harFejl(validatePlanGate({ ...god, planTroskab: {} }), "manglerPlanTroskab"));
ok(
  "Mathias før alle AI → FAIL",
  harFejl(validatePlanGate({ ...god, aiVerdikter: [ai("Code"), ai("Codex")] }), "mathiasIkkeSidst"),
);
ok(
  "ufuldt djævel-pass → FAIL",
  harFejl(validatePlanGate({ ...god, djaevelPass: { krav: [{ id: "K-1" }], approval: true } }), "djaevel:"),
);

if (fejl) {
  console.error(`plan-gate-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("plan-gate-check selftest: alle checks passed");
