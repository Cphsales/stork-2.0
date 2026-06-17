// Selftest for mathias-komm-check (regel-flade klausul c) — krav 6.
import { checkMathiasMessage } from "./mathias-komm-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, kode) => res.fejl.some((f) => f.startsWith(kode));

// Positiv evne: en ren "hvad"-besked (prosa + inline SHA-fakta) passerer.
const god = "Du godkender at vi bygger front-halvdelen.\n\nGaeldende plan-SHA: `94c70eb`.\nDit valg: plan OK eller flere skaerpelser?";
ok("ren hvad-besked passerer", checkMathiasMessage(god).ok);
ok("inline SHA-backtick flagges ikke", checkMathiasMessage("Bundet til `c964826`.").ok);

// Kanariefugle: kode/hvordan på Mathias' bord SKAL afvises.
const medHegn = "Her er loesningen:\n\n```js\nconst x = 1\n```\n";
ok("kode-hegn → FAIL", harFejl(checkMathiasMessage(medHegn), "kodeHegn"));
ok("impl-kommando (git) → FAIL", harFejl(checkMathiasMessage("Koer foelgende:\ngit push origin main"), "implKommando"));
ok("impl-kommando (pnpm) → FAIL", harFejl(checkMathiasMessage("pnpm install foerst"), "implKommando"));

if (fejl) {
  console.error(`mathias-komm-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("mathias-komm-check selftest: alle checks passed");
