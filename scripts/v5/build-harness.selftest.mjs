#!/usr/bin/env node
// build-harness.selftest.mjs — container-FRI red-team af orkestrerings-logikken
// (plan DEL VI (a)). MOCK sql-runner, så CI kan køre uden Postgres. Rigtig-DB-bevis
// ligger i build-harness.integration.mjs (kræver container).
//
// Dækker Codex-P2-fundene: kill KUN når forbudt-op bliver EKSPLICIT TILLADT (ikke
// positiv-break, ikke protokol-fejl, ikke afvist-af-forkert-kode); baseline green
// kræver afvisning med den PINNEDE, ANERKENDTE kode (expectCode ∈ REJECT_CODES,
// ikke en fri streng harnessen selv kan svække); restore+ren state; ingen vacuous/
// sparse grøn; whitespace-sql afvist.

import { runEffectHarness, killMutant, runBuildProofEngine, REJECT_CODES } from "./build-harness.mjs";

let failed = 0;
const ok = (n) => console.log(`  ✓ ${n}`);
const bad = (n, d) => {
  console.error(`  ✗ ${n} — ${d}`);
  failed++;
};
const eq = (n, got, want) => (got === want ? ok(n) : bad(n, `fik ${JSON.stringify(got)}, forventede ${JSON.stringify(want)}`));

const RLS = "42501"; // anerkendt autorisations-afvisnings-kode
const SYNTAX = "42601"; // IKKE i REJECT_CODES
const rejRLS = { ok: false, error: "rejected by RLS", code: RLS };

// ægte svækkelses-mutant: NEG afvist (RLS) baseline, TILLADT under mutant; POS ok
const flip = () => {
  let m = false;
  return (t) => {
    if (t === "APPLY") return (m = true), { ok: true };
    if (t === "RESTORE") return (m = false), { ok: true };
    if (t === "POS") return { ok: true };
    if (t === "NEG") return m ? { ok: true } : rejRLS;
    return { ok: false, code: SYNTAX };
  };
};
const findes = (t) => (t === "NEG" ? rejRLS : { ok: true }); // NEG afvist (RLS) altid
const posBreak = () => {
  let m = false;
  return (t) => {
    if (t === "APPLY") return (m = true), { ok: true };
    if (t === "RESTORE") return (m = false), { ok: true };
    if (t === "POS") return m ? { ok: false, error: "positiv brød", code: SYNTAX } : { ok: true };
    if (t === "NEG") return rejRLS;
    return { ok: false };
  };
};
const underThrow = () => {
  let m = false;
  return (t) => {
    if (t === "APPLY") return (m = true), { ok: true };
    if (t === "RESTORE") return (m = false), { ok: true };
    if (t === "POS") return { ok: true };
    if (t === "NEG") {
      if (m) throw new Error("connection lost");
      return rejRLS;
    }
    return { ok: false };
  };
};
// wrong-reason-under-mutant: NEG stadig afvist under mutant, men med FORKERT kode
// (forbidden-op blev ALDRIG tilladt → ingen reel isolations-brud → ikke en kill)
const wrongReasonUnder = () => {
  let m = false;
  return (t) => {
    if (t === "APPLY") return (m = true), { ok: true };
    if (t === "RESTORE") return (m = false), { ok: true };
    if (t === "POS") return { ok: true };
    if (t === "NEG") return m ? { ok: false, error: "syntax error", code: SYNTAX } : rejRLS;
    return { ok: false };
  };
};
const restoreFail = () => {
  let m = false;
  return (t) => {
    if (t === "APPLY") return (m = true), { ok: true };
    if (t === "RESTORE") return { ok: false, error: "restore fejlede" };
    if (t === "POS") return { ok: true };
    if (t === "NEG") return m ? { ok: true } : rejRLS;
    return { ok: false };
  };
};

const harness = { asRole: "app_role", settings: { "app.current_org": "1" }, positive: { sql: "POS" }, negative: { sql: "NEG", expectCode: RLS } };
const mutant = { knob: "with-check", apply: "APPLY", restore: "RESTORE" };

console.log(`REJECT_CODES = [${REJECT_CODES.join(",")}]`);
console.log("\nrunEffectHarness — green ⟺ positiv OK + negativ afvist med PINNET ANERKENDT kode:");
eq("baseline (POS ok, NEG afvist-42501) → green", runEffectHarness(harness, flip()).green, true);
eq("negativ TILLADT (falsk-grøn) → ikke green", runEffectHarness(harness, () => ({ ok: true })).green, false);
eq("positiv FEJLER → ikke green", runEffectHarness(harness, () => ({ ok: false, code: RLS })).green, false);

console.log("\nafvisnings-KODE ejes af frameworket (Codex #1/#2):");
eq("NEG afvist m. FORKERT kode (syntax 42601) → ikke green (#2)", runEffectHarness(harness, (t) => (t === "NEG" ? { ok: false, code: SYNTAX } : { ok: true })).green, false);
eq("expectCode mangler → ikke green (obligatorisk)", runEffectHarness({ ...harness, negative: { sql: "NEG" } }, flip()).green, false);
eq("expectCode ikke i REJECT_CODES (selv-svækkelse) → ikke green (#1)", runEffectHarness({ ...harness, negative: { sql: "NEG", expectCode: SYNTAX } }, flip()).green, false);

console.log("\nfail-closed (protokol / form):");
eq("asRole mangler → ikke green", runEffectHarness({ ...harness, asRole: "" }, flip()).green, false);
eq("tom negativ-sql → ikke green", runEffectHarness({ ...harness, negative: { sql: "", expectCode: RLS } }, flip()).green, false);
eq("whitespace-only sql → ikke green (#3)", runEffectHarness({ ...harness, positive: { sql: "   " } }, flip()).green, false);
eq("runner kaster → protocolOk=false", runEffectHarness(harness, () => { throw new Error("x"); }).protocolOk, false);
eq("runner ikke {ok:boolean} → protocolOk=false", runEffectHarness(harness, () => ({ status: "ok" })).protocolOk, false);
eq("runner m. accessor ok-felt (getter) → protocolOk=false (Codex r6)", runEffectHarness(harness, () => { const o = {}; Object.defineProperty(o, "ok", { enumerable: true, get: () => true }); return o; }).protocolOk, false);

console.log("\nkillMutant — dræbt ⟺ forbudt-op bliver EKSPLICIT TILLADT:");
eq("ægte svækkelses-mutant (NEG→tilladt) → dræbt", killMutant(mutant, harness, flip()).killed, true);
eq("findes-agtig (NEG afvist altid) → OVERLEVER", killMutant(mutant, harness, findes).killed, false);
eq("positiv-break (POS fejler) → IKKE dræbt (#3)", killMutant(mutant, harness, posBreak()).killed, false);
eq("wrong-reason-under-mutant (NEG afvist-forkert-kode) → IKKE dræbt (#1)", killMutant(mutant, harness, wrongReasonUnder()).killed, false);
eq("under-mutant runner kaster → IKKE dræbt (#2)", killMutant(mutant, harness, underThrow()).killed, false);
{
  const r = killMutant(mutant, harness, flip());
  eq("dræbt + restored + cleanAfter", r.killed && r.restored && r.cleanAfter, true);
}
{
  const r = killMutant(mutant, harness, restoreFail());
  eq("restore fejler → restored=false + cleanAfter=false (#4)", r.restored === false && r.cleanAfter === false, true);
}
eq("malformet mutant (uden apply) → ikke dræbt", killMutant({ knob: "x", restore: "RESTORE" }, harness, flip()).killed, false);

console.log("\nrunBuildProofEngine — baseline green + hver mutant dræbt+restored+ren:");
eq("green + dræbt+ren → allKilled", runBuildProofEngine({ kTests: [{ k_id: "K-1", harness, mutants: [mutant] }] }, flip()).allKilled, true);
eq("findes-agtig → allKilled=false", runBuildProofEngine({ kTests: [{ k_id: "K-1", harness, mutants: [mutant] }] }, findes).allKilled, false);
eq("wrong-reason → allKilled=false (#1)", runBuildProofEngine({ kTests: [{ k_id: "K-1", harness, mutants: [mutant] }] }, wrongReasonUnder()).allKilled, false);
eq("restore-fejl → allKilled=false (#4)", runBuildProofEngine({ kTests: [{ k_id: "K-1", harness, mutants: [mutant] }] }, restoreFail()).allKilled, false);
eq("tom kTests → allGreen=false (#5)", runBuildProofEngine({ kTests: [] }, flip()).allGreen, false);
eq("tom kTests → allKilled=false", runBuildProofEngine({ kTests: [] }, flip()).allKilled, false);
eq("sparse mutants → allKilled=false (#5)", runBuildProofEngine({ kTests: [{ k_id: "K-1", harness, mutants: new Array(1) }] }, flip()).allKilled, false);
eq("K uden mutant → allKilled=false (gulv)", runBuildProofEngine({ kTests: [{ k_id: "K-1", harness, mutants: [] }] }, flip()).allKilled, false);
eq("malformet spec → allKilled=false", runBuildProofEngine({}, flip()).allKilled, false);

console.log("\nObject.prototype-forurening må ikke udfylde tomme inputs (Codex #2, læser kun egne data):");
{
  Object.prototype.asRole = "app_role";
  const h = { positive: { sql: "POS" }, negative: { sql: "NEG", expectCode: RLS } }; // INGEN egen asRole
  let r;
  try {
    r = runEffectHarness(h, flip());
  } finally {
    delete Object.prototype.asRole;
  }
  eq("arvet asRole → ikke green", r.green, false);
}
{
  Object.prototype.kTests = [{ k_id: "K-1", harness, mutants: [mutant] }];
  let r;
  try {
    r = runBuildProofEngine({}, flip());
  } finally {
    delete Object.prototype.kTests;
  }
  eq("arvet kTests → allKilled=false", r.allKilled, false);
}
// Codex r4 #2: accessor-index / symbol-nøgle på kTests-array
{
  const kt = { k_id: "K-1", harness, mutants: [mutant] };
  const arr = [];
  Object.defineProperty(arr, 0, { enumerable: true, get: () => kt });
  eq("kTests m. accessor-index → allKilled=false", runBuildProofEngine({ kTests: arr }, flip()).allKilled, false);
}
{
  const arr = [{ k_id: "K-1", harness, mutants: [mutant] }];
  arr[Symbol("x")] = 1;
  eq("kTests m. symbol-nøgle → allKilled=false", runBuildProofEngine({ kTests: arr }, flip()).allKilled, false);
}
{
  const arr = [{ k_id: "K-1", harness, mutants: [mutant] }];
  arr[""] = { k_id: "K-9", harness, mutants: [mutant] }; // ikke-kanonisk index-nøgle
  eq("kTests m. ikke-kanonisk nøgle ('') → allKilled=false", runBuildProofEngine({ kTests: arr }, flip()).allKilled, false);
}

console.log("");
if (failed > 0) {
  console.error(`build-harness red-team: ${failed} FEJLEDE`);
  process.exit(1);
}
console.log("build-harness red-team: alle cases passed");
