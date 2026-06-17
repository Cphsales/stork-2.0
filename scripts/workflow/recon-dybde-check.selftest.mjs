// Selftest for recon-dybde-check (regel-flade klausul h).
import { validateReconDybde } from "./recon-dybde-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

// Positiv evne: runde-1 recon med dækningsflade + ingen dubletter passerer.
ok(
  "runde-1 recon passerer",
  validateReconDybde({ runde: 1, daekningsflade: ["kode", "docs"], fund: [{ emne: "a", kilde: "x", flade: "kode" }] }).ok,
);

// Kanariefugle:
ok("manglende dækningsflade → FAIL", harFejl(validateReconDybde({ fund: [] }), "manglerDaekningsflade"));
ok(
  "dublet fund → FAIL",
  harFejl(
    validateReconDybde({
      daekningsflade: ["kode"],
      fund: [
        { emne: "a", kilde: "x", flade: "kode" },
        { emne: "a", kilde: "x", flade: "kode" },
      ],
    }),
    "dublet(a|x)",
  ),
);
ok(
  "runde-2 fund i allerede-dækket flade → reconMiss",
  harFejl(
    validateReconDybde({
      runde: 2,
      daekningsflade: ["kode"],
      fund: [{ emne: "b", kilde: "y", flade: "kode" }],
      tidligereFlader: ["kode"],
    }),
    "reconMiss(kode)",
  ),
);

if (fejl) {
  console.error(`recon-dybde-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("recon-dybde-check selftest: alle checks passed");
