#!/usr/bin/env node
// build-harness.selftest.mjs — container-FRI red-team af orkestrerings-logikken
// (plan DEL VI (a)). MOCK sql-runner, så CI kan køre uden Postgres. Rigtig-DB-bevis
// ligger i build-harness.integration.mjs (kræver container).
//
// Dækker Codex-P2-fundene: kill KUN ved negativ-flip (ikke positiv-break); protokol-
// fejl ≠ kill; restore-fejl/uren state ≠ tælt; tom/sparse spec ≠ vacuous grøn;
// expectError = afvisning af RIGTIG grund.

import { runEffectHarness, killMutant, runBuildProofEngine } from "./build-harness.mjs";

let failed = 0;
const ok = (n) => console.log(`  ✓ ${n}`);
const bad = (n, d) => {
  console.error(`  ✗ ${n} — ${d}`);
  failed++;
};
const eq = (n, got, want) => (got === want ? ok(n) : bad(n, `fik ${JSON.stringify(got)}, forventede ${JSON.stringify(want)}`));

// --- mock-runnere (POS/NEG/APPLY/RESTORE; stateful mutated-flag) ---
// ægte svækkelses-mutant: NEG afvist baseline, TILLADT under mutant; POS altid ok
const flip = () => {
  let m = false;
  return (t) => {
    if (t === "APPLY") return (m = true), { ok: true };
    if (t === "RESTORE") return (m = false), { ok: true };
    if (t === "POS") return { ok: true };
    if (t === "NEG") return m ? { ok: true } : { ok: false, error: "rejected by RLS" };
    return { ok: false, error: "unknown" };
  };
};
// findes-agtig: NEG afvist ALTID (flipper aldrig)
const findes = (t) => (t === "NEG" ? { ok: false, error: "rejected" } : { ok: true });
// positiv-break: POS FEJLER under mutant, NEG afvist altid (generisk regression)
const posBreak = () => {
  let m = false;
  return (t) => {
    if (t === "APPLY") return (m = true), { ok: true };
    if (t === "RESTORE") return (m = false), { ok: true };
    if (t === "POS") return m ? { ok: false, error: "positiv brød" } : { ok: true };
    if (t === "NEG") return { ok: false, error: "rejected" };
    return { ok: false };
  };
};
// under-mutant-throw: NEG KASTER når mutated (protokol-fejl, ikke et bevis)
const underThrow = () => {
  let m = false;
  return (t) => {
    if (t === "APPLY") return (m = true), { ok: true };
    if (t === "RESTORE") return (m = false), { ok: true };
    if (t === "POS") return { ok: true };
    if (t === "NEG") {
      if (m) throw new Error("connection lost");
      return { ok: false, error: "rejected" };
    }
    return { ok: false };
  };
};
// restore-fejl: flip, men RESTORE fejler (og mutated forbliver true → uren)
const restoreFail = () => {
  let m = false;
  return (t) => {
    if (t === "APPLY") return (m = true), { ok: true };
    if (t === "RESTORE") return { ok: false, error: "restore fejlede" };
    if (t === "POS") return { ok: true };
    if (t === "NEG") return m ? { ok: true } : { ok: false, error: "rejected" };
    return { ok: false };
  };
};

const harness = { asRole: "app_role", settings: { "app.current_org": "1" }, positive: { sql: "POS" }, negative: { sql: "NEG" } };
const mutant = { knob: "with-check", apply: "APPLY", restore: "RESTORE" };

console.log("runEffectHarness — green ⟺ protokol-valid + positiv OK + negativ AFVIST:");
eq("baseline (POS ok, NEG afvist) → green", runEffectHarness(harness, flip()).green, true);
eq("negativ TILLADT (falsk-grøn) → ikke green", runEffectHarness(harness, () => ({ ok: true })).green, false);
eq("positiv FEJLER → ikke green", runEffectHarness(harness, () => ({ ok: false })).green, false);

console.log("\nfail-closed (protokol):");
eq("asRole mangler → ikke green", runEffectHarness({ ...harness, asRole: "" }, flip()).green, false);
eq("malformet harness → ikke green", runEffectHarness({}, flip()).green, false);
eq("tom negativ-sql → ikke green (protokol-fejl)", runEffectHarness({ ...harness, negative: {} }, flip()).green, false);
eq("runner kaster → ikke green + protocolOk=false", runEffectHarness(harness, () => { throw new Error("x"); }).protocolOk, false);
eq("runner returnerer ikke {ok:boolean} → protocolOk=false", runEffectHarness(harness, () => ({ status: "ok" })).protocolOk, false);

console.log("\nexpectError — afvisning skal ske af RIGTIG grund (Codex #1):");
eq("NEG afvist m. matchende fejl → green", runEffectHarness({ ...harness, negative: { sql: "NEG", expectError: "RLS" } }, flip()).green, true);
eq("NEG afvist af FORKERT grund → ikke green", runEffectHarness({ ...harness, negative: { sql: "NEG", expectError: "cross-org-policy" } }, flip()).green, false);

console.log("\nkillMutant — dræbt ⟺ NEGATIV flipper (ikke positiv-break, ikke protokol-fejl):");
eq("ægte svækkelses-mutant (NEG flipper) → dræbt", killMutant(mutant, harness, flip()).killed, true);
eq("findes-agtig (NEG flipper ikke) → OVERLEVER", killMutant(mutant, harness, findes).killed, false);
eq("positiv-break (POS fejler, NEG afvist) → IKKE dræbt (Codex #3)", killMutant(mutant, harness, posBreak()).killed, false);
eq("under-mutant runner kaster → IKKE dræbt (Codex #2)", killMutant(mutant, harness, underThrow()).killed, false);
{
  const r = killMutant(mutant, harness, flip());
  eq("dræbt + restored + cleanAfter (ren state)", r.killed && r.restored && r.cleanAfter, true);
}
{
  const r = killMutant(mutant, harness, restoreFail());
  eq("restore fejler → restored=false (Codex #4)", r.restored, false);
  eq("restore fejler → cleanAfter=false (uren state)", r.cleanAfter, false);
}
eq("malformet mutant (uden apply) → ikke dræbt", killMutant({ knob: "x", restore: "RESTORE" }, harness, flip()).killed, false);

console.log("\nrunBuildProofEngine — baseline green + hver mutant dræbt+restored+ren:");
eq("green baseline + dræbt+ren mutant → allKilled", runBuildProofEngine({ kTests: [{ k_id: "K-1", harness, mutants: [mutant] }] }, flip()).allKilled, true);
eq("findes-agtig → mutant overlever → allKilled=false", runBuildProofEngine({ kTests: [{ k_id: "K-1", harness, mutants: [mutant] }] }, findes).allKilled, false);
eq("restore-fejl → allKilled=false (Codex #4)", runBuildProofEngine({ kTests: [{ k_id: "K-1", harness, mutants: [mutant] }] }, restoreFail()).allKilled, false);
eq("tom kTests → allGreen=false (Codex #5, ikke vacuous)", runBuildProofEngine({ kTests: [] }, flip()).allGreen, false);
eq("tom kTests → allKilled=false (Codex #5)", runBuildProofEngine({ kTests: [] }, flip()).allKilled, false);
{
  const sparse = new Array(1); // hul, ingen faktisk mutant
  eq("sparse mutants → allKilled=false (Codex #5)", runBuildProofEngine({ kTests: [{ k_id: "K-1", harness, mutants: sparse }] }, flip()).allKilled, false);
}
eq("K uden mutant → allKilled=false (gulv)", runBuildProofEngine({ kTests: [{ k_id: "K-1", harness, mutants: [] }] }, flip()).allKilled, false);
eq("malformet spec → allKilled=false", runBuildProofEngine({}, flip()).allKilled, false);

console.log("");
if (failed > 0) {
  console.error(`build-harness red-team: ${failed} FEJLEDE`);
  process.exit(1);
}
console.log("build-harness red-team: alle cases passed");
