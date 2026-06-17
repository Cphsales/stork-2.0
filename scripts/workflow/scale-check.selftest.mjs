// Selftest for scale-check (S5, Leverance 2) — scale-router.
import { decideRute, kontrolSaet, validateKontrolSaet, loadDef } from "./scale-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));
const def = loadDef();

// Positiv evne: ruter til pakke-scale.
ok("scale 1 → DIRECT", decideRute(1) === "DIRECT");
ok("scale 9 → DELEGATED", decideRute(9) === "DELEGATED");
ok("scale 5 → SIGNAL", decideRute(5) === "SIGNAL");

// Altid-på er med uanset scale; scale-routede lettes ved lav scale, fulde ved høj.
ok("altid-på med ved scale 1", validateKontrolSaet(kontrolSaet(1)).ok);
ok("scale 9 → alle scale-routede aktive", kontrolSaet(9).aktive.length === def.scaleRoutet.length);
ok("scale 1 → færre scale-routede aktive", kontrolSaet(1).aktive.length < def.scaleRoutet.length);

// Kanariefugl: et droppet altid-på-gulv → FAIL (integritet kan ikke scales væk).
ok(
  "droppet altid-på → FAIL",
  harFejl(validateKontrolSaet({ altidPaa: def.altidPaa.slice(1), aktive: [] }), "altidPaaDroppet"),
);

if (fejl) {
  console.error(`scale-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("scale-check selftest: alle checks passed");
