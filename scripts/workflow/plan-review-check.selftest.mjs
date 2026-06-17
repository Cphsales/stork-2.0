// Selftest for plan-review-check (S10) — dispositioner (a) + proportionel re-validering (g).
import { validatePlanReview } from "./plan-review-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

// Positiv evne: alle fund disponeret med gyldige verdikter + diff-bundet re-validering.
const god = {
  fund: [{ disposition: "FIX-NOW" }, { disposition: "FOLLOW-UP" }],
  reValidering: { hasBaseline: true, touched: [] },
};
const r = validatePlanReview(god);
ok("disponeret review passerer", r.ok);
ok("diff-bundet re-validering ved kosmetisk delta", r.reValidering === "diff-bundet");

// Kanariefugle:
ok("udisponeret fund → BLOKER", harFejl(validatePlanReview({ fund: [{}] }), "udisponeretFund"));
ok(
  "ugyldig disposition → FAIL",
  harFejl(validatePlanReview({ fund: [{ disposition: "LGTM" }] }), "ugyldigDisposition"),
);

// Re-validering: en trigger tvinger full-scope (genbrug af g).
ok(
  "trigger → full-scope re-validering",
  validatePlanReview({
    fund: [{ disposition: "FIX-NOW" }],
    reValidering: { hasBaseline: true, touched: ["gate-semantik"] },
  }).reValidering === "full-scope",
);

if (fejl) {
  console.error(`plan-review-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("plan-review-check selftest: alle checks passed");
