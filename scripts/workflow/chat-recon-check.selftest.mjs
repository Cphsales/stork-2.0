// Selftest for chat-recon-check (regel-flade klausul l) — krav 2/6.
import { validateChatRecon } from "./chat-recon-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

const fuldtFund = {
  citat: "Mathias: alt skal styres i UI",
  dato: "2026-05-12",
  traad: "stork-2.0-projekt/tråd-7",
  klassifikation: "laast-beslutning",
};

// Positiv evne: et fuldt kildet + klassificeret fund passerer.
ok("fuldt fund passerer", validateChatRecon({ fund: [fuldtFund] }).ok);

// Kanariefugle: ukildet eller uklassificeret fund SKAL afvises (ingen usynlig sandhed).
ok("fund uden dato → FAIL", harFejl(validateChatRecon({ fund: [{ ...fuldtFund, dato: "" }] }), "fundUdenKilde(dato)"));
ok("fund uden tråd → FAIL", harFejl(validateChatRecon({ fund: [{ ...fuldtFund, traad: undefined }] }), "fundUdenKilde(traad)"));
ok("ukendt klassifikation → FAIL", harFejl(validateChatRecon({ fund: [{ ...fuldtFund, klassifikation: "synes-jeg" }] }), "ukendtKlassifikation"));

if (fejl) {
  console.error(`chat-recon-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("chat-recon-check selftest: alle checks passed");
