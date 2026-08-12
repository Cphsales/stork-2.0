#!/usr/bin/env node
// build-harness.selftest.mjs — container-FRI red-team af orkestrerings-logikken
// (plan DEL VI (a)). MOCK sql-runner, så CI kan køre uden Postgres. Rigtig-DB-bevis
// ligger i build-harness.integration.mjs (kræver container).
//
// Dækker Codex-P2-fundene: kill KUN ved at forbudt-op bliver EKSPLICIT TILLADT
// (ikke positiv-break, ikke protokol-fejl, ikke afvist-af-forkert-grund); baseline
// green kræver afvisning AF DEN PINNEDE GRUND (expectError obligatorisk); restore+
// ren state kræves; tom/sparse spec ≠ vacuous grøn; whitespace-sql ≠ ikke-tom.

import { runEffectHarness, killMutant, runBuildProofEngine } from "./build-harness.mjs";

let failed = 0;
const ok = (n) => console.log(`  ✓ ${n}`);
const bad = (n, d) => {
  console.error(`  ✗ ${n} — ${d}`);
  failed++;
};
const eq = (n, got, want) => (got === want ? ok(n) : bad(n, `fik ${JSON.stringify(got)}, forventede ${JSON.stringify(want)}`));

// NEG-fejl indeholder "RLS" ⇒ matcher expectError (afvist af rigtig grund).
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
// findes-agtig: NEG afvist (rigtig grund) ALTID — flipper aldrig til tilladt
const findes = (t) => (t === "NEG" ? { ok: false, error: "rejected by RLS" } : { ok: true });
// positiv-break: POS FEJLER under mutant; NEG afvist (rigtig grund) altid
const posBreak = () => {
  let m = false;
  return (t) => {
    if (t === "APPLY") return (m = true), { ok: true };
    if (t === "RESTORE") return (m = false), { ok: true };
    if (t === "POS") return m ? { ok: false, error: "positiv brød" } : { ok: true };
    if (t === "NEG") return { ok: false, error: "rejected by RLS" };
    return { ok: false };
  };
};
// under-mutant-throw: NEG KASTER når mutated (protokol-fejl)
const underThrow = () => {
  let m = false;
  return (t) => {
    if (t === "APPLY") return (m = true), { ok: true };
    if (t === "RESTORE") return (m = false), { ok: true };
    if (t === "POS") return { ok: true };
    if (t === "NEG") {
      if (m) throw new Error("connection lost");
      return { ok: false, error: "rejected by RLS" };
    }
    return { ok: false };
  };
};
// wrong-reason-under-mutant: NEG stadig afvist under mutant, men af FORKERT grund
// (forbidden-op blev ALDRIG tilladt → ingen reel isolations-brud → ikke en kill)
const wrongReasonUnder = () => {
  let m = false;
  return (t) => {
    if (t === "APPLY") return (m = true), { ok: true };
    if (t === "RESTORE") return (m = false), { ok: true };
    if (t === "POS") return { ok: true };
    if (t === "NEG") return m ? { ok: false, error: "syntax error" } : { ok: false, error: "rejected by RLS" };
    return { ok: false };
  };
};
// restore-fejl: flip, men RESTORE fejler (mutated forbliver true → uren)
const restoreFail = () => {
  let m = false;
  return (t) => {
    if (t === "APPLY") return (m = true), { ok: true };
    if (t === "RESTORE") return { ok: false, error: "restore fejlede" };
    if (t === "POS") return { ok: true };
    if (t === "NEG") return m ? { ok: true } : { ok: false, error: "rejected by RLS" };
    return { ok: false };
  };
};

const harness = { asRole: "app_role", settings: { "app.current_org": "1" }, positive: { sql: "POS" }, negative: { sql: "NEG", expectError: "RLS" } };
const mutant = { knob: "with-check", apply: "APPLY", restore: "RESTORE" };

console.log("runEffectHarness — green ⟺ positiv OK + negativ afvist AF PINNEDE GRUND:");
eq("baseline (POS ok, NEG afvist-RLS) → green", runEffectHarness(harness, flip()).green, true);
eq("negativ TILLADT (falsk-grøn) → ikke green", runEffectHarness(harness, () => ({ ok: true })).green, false);
eq("positiv FEJLER → ikke green", runEffectHarness(harness, () => ({ ok: false, error: "RLS" })).green, false);

console.log("\nafvisnings-GRUND (expectError obligatorisk — Codex #1/#2):");
eq("NEG afvist af FORKERT grund (syntax) → ikke green (#2)", runEffectHarness({ ...harness, negative: { sql: "NEG", expectError: "RLS" } }, (t) => (t === "NEG" ? { ok: false, error: "syntax error" } : { ok: true })).green, false);
eq("negative.expectError mangler → ikke green (obligatorisk)", runEffectHarness({ ...harness, negative: { sql: "NEG" } }, flip()).green, false);

console.log("\nfail-closed (protokol / form):");
eq("asRole mangler → ikke green", runEffectHarness({ ...harness, asRole: "" }, flip()).green, false);
eq("tom negativ-sql → ikke green", runEffectHarness({ ...harness, negative: { sql: "", expectError: "RLS" } }, flip()).green, false);
eq("whitespace-only sql → ikke green (#3)", runEffectHarness({ ...harness, positive: { sql: "   " } }, flip()).green, false);
eq("runner kaster → protocolOk=false", runEffectHarness(harness, () => { throw new Error("x"); }).protocolOk, false);
eq("runner ikke {ok:boolean} → protocolOk=false", runEffectHarness(harness, () => ({ status: "ok" })).protocolOk, false);

console.log("\nkillMutant — dræbt ⟺ forbudt-op bliver EKSPLICIT TILLADT:");
eq("ægte svækkelses-mutant (NEG→tilladt) → dræbt", killMutant(mutant, harness, flip()).killed, true);
eq("findes-agtig (NEG afvist altid) → OVERLEVER", killMutant(mutant, harness, findes).killed, false);
eq("positiv-break (POS fejler) → IKKE dræbt (Codex #3)", killMutant(mutant, harness, posBreak()).killed, false);
eq("wrong-reason-under-mutant (NEG afvist-forkert) → IKKE dræbt (Codex #1)", killMutant(mutant, harness, wrongReasonUnder()).killed, false);
eq("under-mutant runner kaster → IKKE dræbt (Codex #2)", killMutant(mutant, harness, underThrow()).killed, false);
{
  const r = killMutant(mutant, harness, flip());
  eq("dræbt + restored + cleanAfter", r.killed && r.restored && r.cleanAfter, true);
}
{
  const r = killMutant(mutant, harness, restoreFail());
  eq("restore fejler → restored=false + cleanAfter=false", r.restored === false && r.cleanAfter === false, true);
}
eq("malformet mutant (uden apply) → ikke dræbt", killMutant({ knob: "x", restore: "RESTORE" }, harness, flip()).killed, false);

console.log("\nrunBuildProofEngine — baseline green + hver mutant dræbt+restored+ren:");
eq("green + dræbt+ren → allKilled", runBuildProofEngine({ kTests: [{ k_id: "K-1", harness, mutants: [mutant] }] }, flip()).allKilled, true);
eq("findes-agtig → allKilled=false", runBuildProofEngine({ kTests: [{ k_id: "K-1", harness, mutants: [mutant] }] }, findes).allKilled, false);
eq("wrong-reason → allKilled=false (Codex #1)", runBuildProofEngine({ kTests: [{ k_id: "K-1", harness, mutants: [mutant] }] }, wrongReasonUnder()).allKilled, false);
eq("restore-fejl → allKilled=false (Codex #4)", runBuildProofEngine({ kTests: [{ k_id: "K-1", harness, mutants: [mutant] }] }, restoreFail()).allKilled, false);
eq("tom kTests → allGreen=false (Codex #5)", runBuildProofEngine({ kTests: [] }, flip()).allGreen, false);
eq("tom kTests → allKilled=false", runBuildProofEngine({ kTests: [] }, flip()).allKilled, false);
eq("sparse mutants → allKilled=false (Codex #5)", runBuildProofEngine({ kTests: [{ k_id: "K-1", harness, mutants: new Array(1) }] }, flip()).allKilled, false);
eq("K uden mutant → allKilled=false (gulv)", runBuildProofEngine({ kTests: [{ k_id: "K-1", harness, mutants: [] }] }, flip()).allKilled, false);
eq("malformet spec → allKilled=false", runBuildProofEngine({}, flip()).allKilled, false);

console.log("");
if (failed > 0) {
  console.error(`build-harness red-team: ${failed} FEJLEDE`);
  process.exit(1);
}
console.log("build-harness red-team: alle cases passed");
