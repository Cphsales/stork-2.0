#!/usr/bin/env node
// build-harness.selftest.mjs — container-FRI red-team af orkestrerings-logikken
// (plan DEL VI (a)). Bruger en MOCK sql-runner, så CI kan køre den uden Postgres.
// Den rigtige-DB-bevis ligger i build-harness.integration.mjs (kræver container).
//
// Kernen der testes: green ⟺ positiv lykkes OG negativ AFVISES; dræbt ⟺ harnessen
// FLIPPER under mutanten (en findes-agtig harness der ikke flipper → mutant
// overlever = falsk-grøn fanget); fail-closed på runner der kaster / malformet input.

import { runEffectHarness, killMutant, runBuildProofEngine } from "./build-harness.mjs";

let failed = 0;
const ok = (n) => console.log(`  ✓ ${n}`);
const bad = (n, d) => {
  console.error(`  ✗ ${n} — ${d}`);
  failed++;
};
const eq = (n, got, want) => (got === want ? ok(n) : bad(n, `fik ${got}, forventede ${want}`));

// --- mock-runnere ---
// ægte flip: NEG afvises baseline, men TILLADES efter APPLY (mutant svækker RLS)
const makeFlipRunner = () => {
  let mutated = false;
  return (t) => {
    if (t === "APPLY") return (mutated = true), { ok: true, error: null };
    if (t === "RESTORE") return (mutated = false), { ok: true, error: null };
    if (t === "POS") return { ok: true, error: null };
    if (t === "NEG") return mutated ? { ok: true, error: null } : { ok: false, error: "rejected by RLS" };
    return { ok: false, error: "unknown sql" };
  };
};
// findes-agtig: NEG afvises ALTID (harnessen flipper aldrig — opdager ikke mutanten)
const findesRunner = (t) => {
  if (t === "APPLY" || t === "RESTORE" || t === "POS") return { ok: true, error: null };
  if (t === "NEG") return { ok: false, error: "rejected" };
  return { ok: false, error: "unknown" };
};

const harness = { asRole: "app_role", settings: { "app.current_org": "1" }, positive: { sql: "POS" }, negative: { sql: "NEG" } };
const mutant = { knob: "with-check", apply: "APPLY", restore: "RESTORE" };

console.log("runEffectHarness — green ⟺ positiv OK + negativ AFVIST:");
eq("baseline (POS ok, NEG afvist) → green", runEffectHarness(harness, makeFlipRunner()).green, true);
eq("negativ TILLADT (falsk-grøn) → ikke green", runEffectHarness(harness, (t) => (t === "NEG" ? { ok: true } : { ok: true })).green, false);
eq("positiv FEJLER → ikke green", runEffectHarness(harness, (t) => (t === "POS" ? { ok: false } : { ok: false })).green, false);

console.log("\nfail-closed:");
eq("asRole mangler (bypass omgår RLS) → ikke green", runEffectHarness({ ...harness, asRole: "" }, makeFlipRunner()).green, false);
eq("malformet harness → ikke green", runEffectHarness({}, makeFlipRunner()).green, false);
eq("runner kaster → ikke green", runEffectHarness(harness, () => { throw new Error("boom"); }).green, false);
eq("runner returnerer ikke {ok:boolean} → ikke green", runEffectHarness(harness, () => ({ status: "ok" })).green, false);

console.log("\nkillMutant — dræbt ⟺ harnessen flipper:");
eq("ægte mutant (NEG flipper til tilladt) → dræbt", killMutant(mutant, harness, makeFlipRunner()).killed, true);
eq("findes-agtig harness (flipper ikke) → mutant OVERLEVER", killMutant(mutant, harness, findesRunner).killed, false);
{
  const r = killMutant(mutant, harness, makeFlipRunner());
  eq("restore køres (rent efter dræbt)", r.restored, true);
}
eq("baseline ikke green → intet at dræbe (killed=false)", killMutant(mutant, { ...harness, asRole: "" }, makeFlipRunner()).killed, false);
eq("mutant-apply fejler → ikke dræbt", killMutant({ ...mutant, apply: "BAD" }, harness, makeFlipRunner()).killed, false);
eq("malformet mutant (uden knob) → ikke dræbt", killMutant({}, harness, makeFlipRunner()).killed, false);

console.log("\nrunBuildProofEngine — baseline green + hver mutant dræbt:");
{
  const spec = { kTests: [{ k_id: "K-1", harness, mutants: [mutant] }] };
  const r = runBuildProofEngine(spec, makeFlipRunner());
  eq("K m. green baseline + dræbt mutant → allGreen", r.allGreen, true);
  eq("... → allKilled", r.allKilled, true);
  eq("... → K-resultat ok", r.results[0].ok, true);
}
{
  const spec = { kTests: [{ k_id: "K-1", harness, mutants: [] }] };
  const r = runBuildProofEngine(spec, makeFlipRunner());
  eq("K uden mutant → allKilled=false (gulv brudt)", r.allKilled, false);
}
{
  const spec = { kTests: [{ k_id: "K-1", harness, mutants: [mutant] }] };
  const r = runBuildProofEngine(spec, findesRunner);
  eq("findes-agtig harness → mutant overlever → allKilled=false", r.allKilled, false);
}
eq("malformet spec → allKilled=false", runBuildProofEngine({}, makeFlipRunner()).allKilled, false);

console.log("");
if (failed > 0) {
  console.error(`build-harness red-team: ${failed} FEJLEDE`);
  process.exit(1);
}
console.log("build-harness red-team: alle cases passed");
