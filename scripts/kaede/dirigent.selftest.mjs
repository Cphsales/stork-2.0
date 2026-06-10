// scripts/kaede/dirigent.selftest.mjs — negativ-/fixture-test for kuréren
// (gov-5, plan V7 step 3). Mønster: fitness.selftest.mjs / governance-check.selftest.mjs.
//
// Dækker decide() (ren kerne) + tilstand.mjs' rene parsere — UDEN git/gh.
// Kør: pnpm kaede:selftest

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { decide } from "./dirigent.mjs";
import { parseDeklaration, udtraekMarkers, findDivergens } from "./tilstand.mjs";

const REGLER = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "kaede-regler.json"), "utf8"));

let failed = 0;
function check(navn, betingelse, detalje = "") {
  if (betingelse) {
    console.log(`  ✓ ${navn}`);
  } else {
    failed++;
    console.error(`  ✗ ${navn}${detalje ? ` — ${detalje}` : ""}`);
  }
}

const TOM = { divergens: [], gateOrd: [], leverancer: [], marker: { pakke: "gov-6-arkiv-fold", fase: "build" } };

// ---------- 1. divergens-STOP (én sandhed) ----------
{
  const h = decide({ ...TOM, divergens: [{ felt: "branch-sha", kilder: [] }], leverancer: [{ fil: "x.md", deklaration: null, markers: [] }] }, REGLER);
  check("divergens → KAEDE-STOP som ENESTE handling", h.length === 1 && h[0].handling === "KAEDE-STOP" && h[0].grund === "divergens");
}

// ---------- 2. gate-ord author-verifikation ----------
{
  const h = decide({ ...TOM, gateOrd: [{ author: "anden-bruger", tekst: "qwerg" }] }, REGLER);
  check("gate-ord fra forkert author → IGNORER + flag, intet andet", h.some((x) => x.handling === "IGNORER-GATE-ORD" && x.flag) && !h.some((x) => x.handling === "GATE-ORD-REGISTRERET"));
}
{
  const h = decide({ ...TOM, gateOrd: [{ author: "mgrubak", tekst: "slut OK" }] }, REGLER);
  check("gate-ord fra mgrubak → registreret", h.some((x) => x.handling === "GATE-ORD-REGISTRERET" && x.ord === "slut OK"));
}
{
  const h = decide({ ...TOM, gateOrd: [{ author: "mgrubak", tekst: "stop" }], leverancer: [{ fil: "y.md", deklaration: { naeste: "codex", type: "plan-version" }, markers: [] }] }, REGLER);
  check("Mathias-stop → KAEDE-PAUSE, ingen dispatch (suverænitet)", h.at(-1).handling === "KAEDE-PAUSE" && !h.some((x) => x.handling === "DISPATCH"));
}

// ---------- 3. transport-commit før routing ----------
{
  const h = decide({ ...TOM, leverancer: [{ fil: "docs/coordination/codex-reviews/r.md", untracked: true, deklaration: null, markers: [] }] }, REGLER);
  check("untracked leverance → TRANSPORT-COMMIT, ingen dispatch i samme cyklus", h.some((x) => x.handling === "TRANSPORT-COMMIT") && !h.some((x) => x.handling === "DISPATCH"));
}

// ---------- 4. routing pr. leverance-type (vækningsmodellen) ----------
const ROUTING_CASES = [
  ["plan-version", "codex"],
  ["build-batch", "codex"],
  ["slut-rapport", "claude-ai-rolle"],
  ["review-feedback", "code"],
  ["review-approval", "code"],
  ["sparring-oenske", "codex"],
  ["sparring-svar", "code"],
  ["kode-fund", "code"],
  ["optimering-forslag", "code"],
  ["loes-replik", "codex"],
  ["fund-gate-pakke", "mathias"],
];
for (const [type, forventet] of ROUTING_CASES) {
  const h = decide({ ...TOM, leverancer: [{ fil: `f-${type}.md`, sha: "abc123", deklaration: null, type, markers: [] }] }, REGLER);
  const d = h.find((x) => x.handling === "DISPATCH");
  check(`type '${type}' → ${forventet}`, d?.aktoer === forventet, JSON.stringify(h));
}

// ---------- 5. aktør-deklaration overrider modtager (vækningsret hos aktørerne) ----------
{
  const h = decide({ ...TOM, leverancer: [{ fil: "f.md", sha: "s1", deklaration: { naeste: "claude-ai-rolle", type: "review-approval" }, markers: [] }] }, REGLER);
  check("→NÆSTE-deklaration overrider default-modtager", h.find((x) => x.handling === "DISPATCH")?.aktoer === "claude-ai-rolle");
}

// ---------- 6. frossen version: SHA bindes i dispatch-kontekst ----------
{
  const h = decide({ ...TOM, leverancer: [{ fil: "plan.md", sha: "f554220", deklaration: { naeste: "codex", type: "plan-version" }, markers: [] }] }, REGLER);
  check("dispatch binder leverance-SHA (verdikt på frossen version)", h.find((x) => x.handling === "DISPATCH")?.kontekst.sha === "f554220");
}

// ---------- 7. idempotens: behandlede leverancer dispatches ikke igen ----------
{
  const lev = { fil: "plan.md", sha: "s2", deklaration: { naeste: "codex", type: "plan-version" }, markers: [] };
  const h = decide({ ...TOM, leverancer: [lev], behandlede: ["plan.md@s2"] }, REGLER);
  check("behandlet leverance → ingen ny dispatch (idempotens)", !h.some((x) => x.handling === "DISPATCH"));
}

// ---------- 8. lås pr. (aktør, spor): igangværende kørsel afbrydes aldrig ----------
{
  const h = decide(
    { ...TOM, laase: [{ aktoer: "codex", spor: "gov-6-arkiv-fold" }], leverancer: [{ fil: "V8.md", sha: "s3", deklaration: { naeste: "codex", type: "plan-version" }, markers: [] }] },
    REGLER,
  );
  check("lås på (codex, spor) + ny plan-V → VENT, ikke dobbelt-kørsel", h.some((x) => x.handling === "VENT" && x.grund === "laas") && !h.some((x) => x.handling === "DISPATCH"));
}

// ---------- 9. fund-gate-markers → Mathias-gate + ingen modtager-dispatch ----------
for (const marker of ["NEEDS-MATHIAS", "ESCALATE", "STOP-FOR-CLARIFICATION"]) {
  const h = decide({ ...TOM, leverancer: [{ fil: "rev.md", sha: "s4", deklaration: { naeste: "code", type: "review-feedback" }, markers: [marker] }] }, REGLER);
  check(`${marker} i leverance → FUND-GATE, ingen dispatch`, h.some((x) => x.handling === "FUND-GATE") && !h.some((x) => x.handling === "DISPATCH"));
}
{
  const h = decide({ ...TOM, leverancer: [{ fil: "rev.md", sha: "s5", deklaration: { naeste: "code", type: "review-feedback" }, markers: ["KRITISK"] }] }, REGLER);
  check("KRITISK alene → normal feedback-routing (næste runde, ikke Mathias-gate)", h.find((x) => x.handling === "DISPATCH")?.aktoer === "code");
}

// ---------- 10. fail-closed: ukendt type / modtager / event → KAEDE-STOP ----------
{
  const h = decide({ ...TOM, leverancer: [{ fil: "x.md", sha: "s6", deklaration: null, type: "ukendt-type", markers: [] }] }, REGLER);
  check("ukendt leverance-type → KAEDE-STOP", h.at(-1).handling === "KAEDE-STOP" && h.at(-1).grund === "ukendt-leverance-type");
}
{
  const h = decide({ ...TOM, leverancer: [{ fil: "gammel-fil.md", sha: "s9", deklaration: null, type: null, markers: [] }] }, REGLER);
  check("committed fil uden deklaration/type → ARV-IGNORERET (pre-kæde, ingen STOP)", h.some((x) => x.handling === "ARV-IGNORERET") && !h.some((x) => x.handling === "KAEDE-STOP" || x.handling === "DISPATCH"));
}
{
  const h = decide({ ...TOM, leverancer: [{ fil: "x.md", sha: "s7", deklaration: { naeste: "hacker-aktoer", type: "plan-version" }, markers: [] }] }, REGLER);
  check("ukendt modtager i deklaration → KAEDE-STOP (fail-closed)", h.at(-1).handling === "KAEDE-STOP" && h.at(-1).grund === "ukendt-modtager");
}
{
  const h = decide({ ...TOM, events: [{ type: "ukendt-event" }] }, REGLER);
  check("ukendt event → KAEDE-STOP", h.at(-1).handling === "KAEDE-STOP" && h.at(-1).grund === "ukendt-event");
}

// ---------- 11. kalender-events: kædens væknings-punkter ----------
{
  const h = decide({ ...TOM, events: [{ type: "krav-dok-merged", sha: "m1" }] }, REGLER);
  const aktoerer = h.filter((x) => x.handling === "DISPATCH").map((x) => x.aktoer);
  check("krav-dok-merged → Code OG Codex parallelt (§2.1)", aktoerer.includes("code") && aktoerer.includes("codex"));
}
{
  const h = decide({ ...TOM, events: [{ type: "build-pr-merged", sha: "m2" }] }, REGLER);
  check("build-pr-merged → Code (slut-rapport)", h.find((x) => x.handling === "DISPATCH")?.opgave === "slut-rapport");
}
{
  const h = decide({ ...TOM, events: [{ type: "build-pr-klar-beslutningssti" }] }, REGLER);
  check("build-PR m. beslutnings-sti → Mathias review-request", h.find((x) => x.handling === "DISPATCH")?.aktoer === "mathias");
}
{
  const h = decide({ ...TOM, events: [{ type: "slut-ok-registreret" }] }, REGLER);
  check("slut OK registreret → Code merger slut-rapport (ordet er gaten)", h.find((x) => x.handling === "DISPATCH")?.opgave === "slut-merge");
}
{
  const h = decide({ ...TOM, events: [{ type: "qwers-aabning" }] }, REGLER);
  check("qwers-åbning → kvittering (Step 0/1 er dialog — ingen aktør-vækning)", h.find((x) => x.handling === "DISPATCH")?.opgave === "kvittering");
}

// ---------- 12. tom tilstand → INGEN ----------
{
  const h = decide(TOM, REGLER);
  check("tom tilstand → INGEN (kuréren finder ikke på arbejde)", h.length === 1 && h[0].handling === "INGEN");
}

// ---------- 13. parseDeklaration ----------
check("deklaration m. type", JSON.stringify(parseDeklaration("indhold\n\n→NÆSTE: codex [plan-version]\n")) === JSON.stringify({ naeste: "codex", type: "plan-version" }));
check("deklaration u. type", JSON.stringify(parseDeklaration("x\n→NÆSTE: code")) === JSON.stringify({ naeste: "code", type: null }));
check("ingen deklaration → null", parseDeklaration("almindelig tekst\nuden deklaration") === null);
check("deklaration IKKE på sidste linje ignoreres", parseDeklaration("→NÆSTE: codex\nmere tekst bagefter") === null);
check("ukendt aktør i deklaration → null (fail-closed i parser)", parseDeklaration("x\n→NÆSTE: hacker [plan-version]") === null);

// ---------- 14. udtraekMarkers ----------
check("APPROVAL findes", udtraekMarkers("APPROVAL — Runde 7\n").includes("APPROVAL"));
check("[KRITISK] bracket-form findes", udtraekMarkers("[KRITISK] Noget er galt\n").includes("KRITISK"));
check("KRITISKE matcher IKKE (G055)", !udtraekMarkers("KRITISKE forhold er fine\n").includes("KRITISK"));
check("NEEDS-MATHIAS findes", udtraekMarkers("NEEDS-MATHIAS: afgørelse kræves\n").includes("NEEDS-MATHIAS"));

// ---------- 15. findDivergens ----------
check("enige kilder → ingen divergens", findDivergens([{ felt: "sha", kilder: [{ navn: "a", vaerdi: "x" }, { navn: "b", vaerdi: "x" }] }]).length === 0);
check("uenige kilder → divergens", findDivergens([{ felt: "sha", kilder: [{ navn: "a", vaerdi: "x" }, { navn: "b", vaerdi: "y" }] }]).length === 1);

// ---------- resultat ----------
if (failed) {
  console.error(`\nKæde-selftest FEJLEDE (${failed})`);
  process.exit(1);
}
console.log("\nKæde-selftest: alle cases passed");
