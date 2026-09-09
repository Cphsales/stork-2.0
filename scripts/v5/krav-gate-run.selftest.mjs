#!/usr/bin/env node
// krav-gate-run.selftest.mjs — rundevalg fra eksplicit leverancehenvisning (M-41 Trin A4 /
// validering V-F3): gaten må aldrig hardkode hvilken verdikt-runde den dømmer på.
import { vaelgVerdikter, runKravGate } from "./krav-gate-run.mjs";
import { execFileSync } from "node:child_process";
let pass = 0, fail = 0;
const ok = (n) => { pass++; console.log(`  ✓ ${n}`); };
const bad = (n, r) => { fail++; console.error(`  ✗ ${n}: ${r}`); };
const throws = (n, fn, re) => { try { fn(); bad(n, "kastede ikke"); } catch (e) { re.test(e.message) ? ok(n) : bad(n, `forkert fejl: ${e.message}`); } };

const V = (id) => ({ run: { run_id: id }, id });
const filer = ["verdikt-code-krav.json", "verdikt-code-krav-r2.json", "verdikt-codex-krav-r4b.json", "verdikt-code-krav-r4b.json", "andet.json", "plan.md"];
const store = { "verdikt-code-krav.json": V("r1-code"), "verdikt-code-krav-r2.json": V("r2-code"), "verdikt-codex-krav-r4b.json": V("r4b-codex"), "verdikt-code-krav-r4b.json": V("r4b-code"), "andet.json": V("r4b-code") };
const læs = (f) => store[f];
const ap = (ids) => ({ approval: {}, _provenance: { verdikt_run_ids: ids } });

console.log("krav-gate-run — rundevalg:");
{
  const v = vaelgVerdikter({ approvalFil: ap(["r4b-code", "r4b-codex"]), filer, læs });
  v.length === 2 && v[0].id === "r4b-code" && v[1].id === "r4b-codex" ? ok("vælger præcis de run_ids approval navngiver, i approval-orden") : bad("udvalg", JSON.stringify(v));
}
{
  const v = vaelgVerdikter({ approvalFil: ap(["r2-code"]), filer, læs });
  v.length === 1 && v[0].id === "r2-code" ? ok("ældre runde vælges når approval peger på den (ingen 'nyeste'-antagelse)") : bad("ældre runde", JSON.stringify(v));
}
throws("manglende verdikt_run_ids → fail-closed", () => vaelgVerdikter({ approvalFil: { approval: {} }, filer, læs }), /mangler\/ugyldig/);
throws("tom liste → fail-closed", () => vaelgVerdikter({ approvalFil: ap([]), filer, læs }), /mangler\/ugyldig/);
throws("ikke-streng i listen → fail-closed", () => vaelgVerdikter({ approvalFil: ap(["r4b-code", 7]), filer, læs }), /mangler\/ugyldig/);
throws("dublet run_id → fail-closed", () => vaelgVerdikter({ approvalFil: ap(["r4b-code", "r4b-code"]), filer, læs }), /dubletter/);
throws("run_id uden fil → fail-closed", () => vaelgVerdikter({ approvalFil: ap(["findes-ikke"]), filer, læs }), /matcher 0 verdikt-filer/);
throws("run_id i to filer → fail-closed", () => vaelgVerdikter({ approvalFil: ap(["r4b-code"]), filer: [...filer, "verdikt-x-krav-r9.json"], læs: (f) => (f === "verdikt-x-krav-r9.json" ? V("r4b-code") : store[f]) }), /matcher 2 verdikt-filer/);
{
  // filer der ikke matcher verdikt-mønstret må aldrig tælle (andet.json bærer samme run_id)
  const v = vaelgVerdikter({ approvalFil: ap(["r4b-code"]), filer, læs });
  v.length === 1 ? ok("kun verdikt-*-krav*.json er kandidater (andet.json ignoreret trods samme run_id)") : bad("kandidat-filter", JSON.stringify(v));
}
throws("approvalFil null → fail-closed", () => vaelgVerdikter({ approvalFil: null, filer, læs }), /mangler\/ugyldig/);

console.log("\nkrav-gate-run — reel kørsel mod repoets gate-commit:");
{
  const full = execFileSync("git", ["rev-parse", "efc85d5"], { encoding: "utf8" }).trim();
  const r = runKravGate(full);
  r.open === true ? ok(`krav-gaten åben @ ${full.slice(0, 7)} med approval-udvalgte verdikter (${r.reasons.length} reasons)`) : bad("reel gate", JSON.stringify(r.reasons));
  const kort = runKravGate("efc85d5");
  kort.open === false && /pinned commit-OID/.test(kort.reasons[0]) ? ok("kort OID afvises fail-closed") : bad("kort OID", JSON.stringify(kort));
}
console.log("");
if (fail > 0) { console.error(`krav-gate-run: ${fail} FEJLEDE (${pass} ok)`); process.exit(1); }
console.log(`krav-gate-run: ${pass} ok`);
