// Selftest for handoff-wiring-check (S16) — genbruger (j)/kanalFor.
import { validateKanaler } from "./handoff-wiring-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

// Positiv evne: alle fire gate-aktører har en defineret kanal (jf. handoff-kontrakt j).
ok("alle gate-aktører har kanal", validateKanaler().ok);

// Kanariefugl: en aktør uden defineret kanal → FAIL.
ok("ukendt aktør uden kanal → FAIL", harFejl(validateKanaler(["Code", "UkendtAktoer"]), "manglerKanal(UkendtAktoer)"));

if (fejl) {
  console.error(`handoff-wiring-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("handoff-wiring-check selftest: alle checks passed");
