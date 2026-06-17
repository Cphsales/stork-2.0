// Selftest for grundig-recon-check (regel-flade klausul e) — krav 4.
import { validateGrundig } from "./grundig-recon-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

// Positiv evne: hele scope kortlagt, ingen tidlig stop → passerer.
ok(
  "fuld dækning passerer",
  validateGrundig({ scope: ["a", "b"], fund: [{ emne: "a" }, { emne: "b" }] }).ok,
);

// Kanariefugle: ukortlagt scope og tidlig stop SKAL afvises.
ok(
  "ukortlagt scope → FAIL",
  harFejl(validateGrundig({ scope: ["a", "b"], fund: [{ emne: "a" }] }), "ukortlagtScope"),
);
ok(
  "stoppet ved første fund → FAIL",
  harFejl(validateGrundig({ scope: ["a"], fund: [{ emne: "a" }], stoppedEarly: true }), "stoppetVedFoersteFund"),
);

if (fejl) {
  console.error(`grundig-recon-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("grundig-recon-check selftest: alle checks passed");
