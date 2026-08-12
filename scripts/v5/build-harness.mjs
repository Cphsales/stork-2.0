#!/usr/bin/env node
// build-harness.mjs — v5's effect-harness/mutation-FRAMEWORK (plan 2.C).
//
// verifyBuildProof (build-proof.mjs) VALIDERER en build-proof; DETTE modul
// PRODUCERER beviset ved faktisk at KØRE effect-harnesses + mutanter mod en real
// backing store som en ikke-bypass DB-rolle. PoC'en beviste mekanismen mod rigtig
// Postgres: baseline afviser cross-org · WITH CHECK-true-mutant → tilladt = harness
// flipper = mutant dræbt · en "findes"-test overlever = falsk-grøn.
//
// TRANSPORT-AGNOSTISK: frameworket tager en `sql`-runner (dependency injection),
// så orkestrerings-LOGIKKEN kan unit-testes container-frit (mock-runner) OG bevises
// mod rigtig Postgres (psql/pg-runner). En rigtig pakke leverer en pg-client-runner.
//
//   sql(sqlText, opts) → { ok: boolean, error: string|null }
//     opts = { role?: string, settings?: {navn: værdi} }  (SET ROLE + SET before)
//     ok=true  ⟺ sætningen kørte uden fejl
//     ok=false ⟺ sætningen blev AFVIST (RLS/constraint/fejl) — error = besked
//
// KERNEN (hvorfor dette ikke er en findes-test): green afgøres KUN af om den
// POSITIVE case faktisk lykkes OG den NEGATIVE case faktisk AFVISES gennem den
// reelle effekt-sti — aldrig af at en policy "findes". Fail-closed: en runner der
// kaster, en manglende/malformet harness, eller en tvetydig status → IKKE green.

const isPlainObject = (v) => {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const p = Object.getPrototypeOf(v);
  return p === Object.prototype || p === null;
};
const isNonEmptyString = (v) => typeof v === "string" && v.length > 0;

// safeRun(sql, text, opts) → {ok, error}: en runner der KASTER → {ok:false} med
// fejl (fail-closed; en exception må aldrig boble op som "grøn").
function safeRun(sql, text, opts) {
  if (typeof sql !== "function") return { ok: false, error: "sql-runner mangler (fail-closed)" };
  let r;
  try {
    r = sql(text, opts);
  } catch (e) {
    return { ok: false, error: `runner kastede: ${e?.message ?? String(e)}` };
  }
  // runner-svaret SKAL være {ok:boolean}; alt andet er tvetydigt → fail-closed
  if (!isPlainObject(r) || typeof r.ok !== "boolean")
    return { ok: false, error: "runner returnerede ikke {ok:boolean} (fail-closed)" };
  return { ok: r.ok, error: typeof r.error === "string" ? r.error : null };
}

// runEffectHarness(harness, sql) → {green, positiveOk, negativeRejected, detail}
//
// harness = {
//   asRole,                 // ikke-bypass DB-rolle (SET ROLE) — obligatorisk
//   settings?,              // session-settings (fx tenant-org)
//   positive: { sql },      // handling der SKAL lykkes (samme-org)
//   negative: { sql },      // handling der SKAL afvises (cross-org / forbudt)
// }
// green ⟺ positive lykkes OG negative AFVISES. En manglende ikke-bypass rolle →
// IKKE green (en bypass-/superuser-kør omgår RLS og beviser intet).
export function runEffectHarness(harness, sql) {
  if (!isPlainObject(harness) || !isPlainObject(harness.positive) || !isPlainObject(harness.negative))
    return { green: false, error: "malformet harness (positive/negative kræves)" };
  if (!isNonEmptyString(harness.asRole))
    return { green: false, error: "asRole mangler (ikke-bypass rolle kræves — bypass omgår RLS)" };
  const opts = { role: harness.asRole, settings: isPlainObject(harness.settings) ? harness.settings : undefined };
  const pos = safeRun(sql, harness.positive.sql, opts);
  const neg = safeRun(sql, harness.negative.sql, opts);
  const green = pos.ok === true && neg.ok === false; // negativ SKAL afvises
  return { green, positiveOk: pos.ok === true, negativeRejected: neg.ok === false, detail: { pos, neg } };
}

// killMutant(mutant, harness, sql) → {killed, restored, baselineGreen, underMutantGreen}
//
// mutant = { knob, apply: sql, restore: sql }  (config-ændring + gendannelse; køres
//   som ejer/DDL-rolle, dvs. UDEN harness.asRole).
// Dræbt ⟺ harnessen var green FØR (baseline) men er IKKE green UNDER mutanten
//   (dvs. testen OPDAGER ændringen — en findes-test ville ikke flippe).
// restore køres ALTID (også ved dræbt) så efterfølgende mutanter starter rent.
export function killMutant(mutant, harness, sql) {
  if (!isPlainObject(mutant) || !isNonEmptyString(mutant.knob))
    return { killed: false, restored: false, error: "malformet mutant (knob kræves)" };
  const baseline = runEffectHarness(harness, sql);
  if (baseline.green !== true) return { killed: false, restored: true, baselineGreen: false, error: "baseline ikke green — intet at dræbe mod" };

  const applied = safeRun(sql, mutant.apply, {});
  if (applied.ok !== true) return { killed: false, restored: false, baselineGreen: true, error: `mutant-apply fejlede: ${applied.error}` };

  const underMutant = runEffectHarness(harness, sql);
  const restore = safeRun(sql, mutant.restore, {});

  return {
    killed: underMutant.green === false, // harnessen flippede = mutanten blev fanget
    restored: restore.ok === true,
    baselineGreen: true,
    underMutantGreen: underMutant.green === true,
    detail: { underMutant, restore },
  };
}

// runBuildProofEngine(spec, sql) → {allGreen, allKilled, results}
//
// spec = { kTests: [{ k_id, harness, mutants: [{knob, apply, restore}] }] }
// Pr. K: baseline harness green + HVER mutant dræbt (config-mutant-kill-gulvet).
// Producerer OBSERVATIONERNE build-proof kræver. OID/git-anchoring + kobling til
// krav/plan er wiring-/pakke-residual (frameworket kender ikke git-konteksten her).
export function runBuildProofEngine(spec, sql) {
  if (!isPlainObject(spec) || !Array.isArray(spec.kTests))
    return { allGreen: false, allKilled: false, error: "malformet spec (kTests-array kræves)", results: [] };
  const results = [];
  let allGreen = true;
  let allKilled = true;
  for (const kt of spec.kTests) {
    if (!isPlainObject(kt) || !isNonEmptyString(kt.k_id)) {
      results.push({ k_id: null, ok: false, error: "malformet kTest" });
      allGreen = false;
      allKilled = false;
      continue;
    }
    const baseline = runEffectHarness(kt.harness, sql);
    const mutants = Array.isArray(kt.mutants) ? kt.mutants : [];
    if (mutants.length === 0) {
      // gulvet: hvert opsætnings-K SKAL have ≥1 mutant (ellers ingen dybde bevist)
      results.push({ k_id: kt.k_id, baselineGreen: baseline.green, mutantsKilled: [], ok: false, error: "ingen mutant (mutant-kill-gulv brudt)" });
      allGreen = allGreen && baseline.green;
      allKilled = false;
      continue;
    }
    const mutantsKilled = mutants.map((m) => {
      const r = killMutant(m, kt.harness, sql);
      return { knob: m?.knob ?? null, killed: r.killed, restored: r.restored, error: r.error ?? null };
    });
    const everyKilled = mutantsKilled.every((m) => m.killed === true);
    allGreen = allGreen && baseline.green === true;
    allKilled = allKilled && everyKilled;
    results.push({ k_id: kt.k_id, baselineGreen: baseline.green === true, mutantsKilled, ok: baseline.green === true && everyKilled });
  }
  return { allGreen, allKilled, results };
}
