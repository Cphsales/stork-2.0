// Selftest for start-kaede-check (S4, Leverance 2).
import { validateStartKaede } from "./start-kaede-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

const god = {
  authorVerificeret: true,
  aktiverede: ["Code", "Codex", "Claude.ai"],
  reconSamlet: true,
  kravOplaegFremlagt: true,
  autoValideret: false,
};

// Positiv evne: hel kæde, transport-grænse holdt → passerer.
ok("hel start-kæde passerer", validateStartKaede(god).ok);

// Kanariefugle (slut-effekt):
ok(
  "forkert author → IGNORER/FAIL",
  harFejl(validateStartKaede({ ...god, authorVerificeret: false }), "forkertAuthorIgnoreret"),
);
ok(
  "qwers aktiverer ikke alle tre → FAIL",
  harFejl(validateStartKaede({ ...god, aktiverede: ["Code", "Codex"] }), "ikkeAlleAktiveret(Claude.ai)"),
);
ok(
  "transport auto-validerer → FAIL",
  harFejl(validateStartKaede({ ...god, autoValideret: true }), "transportAutoValiderede"),
);
ok(
  "krav-oplæg uden samlet recon → FAIL",
  harFejl(validateStartKaede({ ...god, reconSamlet: false }), "kravOplaegUdenRecon"),
);

if (fejl) {
  console.error(`start-kaede-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("start-kaede-check selftest: alle checks passed");
