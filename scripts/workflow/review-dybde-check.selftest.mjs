// Selftest for review-dybde-check (regel-flade klausul g) — proportionel re-validering.
import { decideReValidering } from "./review-dybde-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};

// Positiv evne (proportionalitet virker):
ok("ingen baseline → full-scope", decideReValidering({ hasBaseline: false, touched: [] }) === "full-scope");
ok(
  "lille kosmetisk ændring → diff-bundet",
  decideReValidering({ hasBaseline: true, touched: ["status-historik"] }) === "diff-bundet",
);
ok("tom diff på baseline → diff-bundet", decideReValidering({ hasBaseline: true, touched: [] }) === "diff-bundet");

// Kanariefugl: en trigger MÅ tvinge full-scope — kan ikke gambles til diff-bundet.
ok(
  "gate-semantik-trigger → full-scope",
  decideReValidering({ hasBaseline: true, touched: ["gate-semantik"] }) === "full-scope",
);
ok(
  "baerende-kontrakt-trigger → full-scope",
  decideReValidering({ hasBaseline: true, touched: ["status-historik", "baerende-kontrakt"] }) === "full-scope",
);
ok(
  "reviewer-miss → full-scope",
  decideReValidering({ hasBaseline: true, touched: ["reviewer-miss"] }) === "full-scope",
);

if (fejl) {
  console.error(`review-dybde-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("review-dybde-check selftest: alle checks passed");
