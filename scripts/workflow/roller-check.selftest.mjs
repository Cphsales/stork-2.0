// Selftest for roller-check (S2). Beviser BÅDE struktur (rigtige imports pr. rolle) OG
// adfærd (kontrakten styrer rollens output i en realistisk opgave — Codex' test-tråd).
import { validateRoller, importererForRolle, loadDef } from "./roller-check.mjs";
import { checkMathiasMessage } from "./mathias-komm-check.mjs";

let fejl = 0;
const ok = (navn, cond) => {
  if (!cond) {
    console.error(`FAIL: ${navn}`);
    fejl++;
  }
};
const harFejl = (res, frag) => res.fejl.some((f) => f.includes(frag));

// --- 1) Struktur: den faktiske roller.json er konform ---
ok("faktiske roller.json er konform", validateRoller().ok);

// Kanariefugle (struktur): manglende import i de rigtige roller fanges.
const def = loadDef();
const udenC = structuredClone(def);
udenC.roller["Claude.ai-workflow"].importerer = udenC.roller["Claude.ai-workflow"].importerer.filter(
  (k) => k !== "mathias-komm",
);
ok("workflow-rolle uden (c) → FAIL", harFejl(validateRoller(udenC), "mangler import: mathias-komm"));

const udenK = structuredClone(def);
udenK.roller["Codex-workflow"].importerer = udenK.roller["Codex-workflow"].importerer.filter((k) => k !== "djaevel");
ok("review-rolle uden (k) → FAIL", harFejl(validateRoller(udenK), "mangler import: djaevel"));

const udenKravTroskab = structuredClone(def);
udenKravTroskab.roller["Claude.ai-workflow"].importerer = udenKravTroskab.roller[
  "Claude.ai-workflow"
].importerer.filter((k) => k !== "krav-troskab");
ok(
  "Claude.ai-workflow uden krav-troskab → FAIL",
  harFejl(validateRoller(udenKravTroskab), "mangler import: krav-troskab"),
);

const almindeligMedImport = structuredClone(def);
almindeligMedImport.roller["Code-almindelig"].importerer = ["mathias-komm"];
ok("almindelig rolle med imports → FAIL", harFejl(validateRoller(almindeligMedImport), "fri dialog"));

// --- 2) Adfærd (test-tråd): (c) importeret af Claude.ai-workflow STYRER output ---
// Realistisk opgave: rollen producerer et krav-oplæg til Mathias.
ok("Claude.ai-workflow importerer (c)", importererForRolle("Claude.ai-workflow").includes("mathias-komm"));
const kravOplaegMedKode = "Forslag:\n\n```sql\nSELECT * FROM loen\n```\n";
ok("workflow-output med kode på Mathias' bord → afvist af (c)", !checkMathiasMessage(kravOplaegMedKode).ok);
const rentKravOplaeg = "Pakken berører løn. Dit valg: krav OK eller spørgsmål?";
ok("rent hvad-output → accepteret", checkMathiasMessage(rentKravOplaeg).ok);

if (fejl) {
  console.error(`roller-check selftest: ${fejl} fejl`);
  process.exit(1);
}
console.log("roller-check selftest: alle checks passed");
