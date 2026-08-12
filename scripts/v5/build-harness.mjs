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
// KERNEN (hvorfor dette ikke er en findes-test): en mutant tæller KUN som dræbt
// hvis den NEGATIVE (forbudte) sti FLIPPER fra afvist til tilladt MENS den positive
// stadig virker — dvs. sikkerheds-assertionen fangede ændringen (ikke en generisk
// positiv-regression, ikke en runner-fejl). Fail-closed overalt: en runner der
// kaster / returnerer ikke {ok:boolean} / tom sql / malformet input → IKKE green,
// IKKE dræbt (virkeligheden er ukendt ≠ "mutanten blev fanget").

const isPlainObject = (v) => {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const p = Object.getPrototypeOf(v);
  return p === Object.prototype || p === null;
};
const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;
const isDenseNonEmptyArray = (a) => {
  if (!Array.isArray(a) || a.length === 0) return false;
  for (let i = 0; i < a.length; i++) if (!Object.prototype.hasOwnProperty.call(a, i)) return false;
  return true;
};

// safeRun(sql, text, opts) → {ok, error, protocolOk}
// protocolOk=false ⟺ runner mangler/kaster/returnerer ikke {ok:boolean} ELLER sql
// er tom (en PROTOKOL-fejl, ikke en legitim afvisning). protocolOk=true dækker BÅDE
// ok=true og en legitim ok=false (afvisning). Så en fejlende kør kan aldrig
// forveksles med et bevis.
function safeRun(sql, text, opts) {
  if (typeof sql !== "function") return { ok: false, error: "sql-runner mangler (fail-closed)", protocolOk: false };
  if (!isNonEmptyString(text)) return { ok: false, error: "tom/ugyldig sql (fail-closed)", protocolOk: false };
  let r;
  try {
    r = sql(text, opts);
  } catch (e) {
    return { ok: false, error: `runner kastede: ${e?.message ?? String(e)}`, protocolOk: false };
  }
  if (!isPlainObject(r) || typeof r.ok !== "boolean")
    return { ok: false, error: "runner returnerede ikke {ok:boolean} (fail-closed)", protocolOk: false };
  return { ok: r.ok, error: typeof r.error === "string" ? r.error : null, protocolOk: true };
}

// runEffectHarness(harness, sql) → {green, protocolOk, positiveOk, negativeRejected, detail}
//
// harness = {
//   asRole,                             // ikke-bypass DB-rolle (SET ROLE) — obligatorisk
//   settings?,                          // session-settings (fx tenant-org)
//   positive: { sql },                  // handling der SKAL lykkes (samme-org)
//   negative: { sql, expectError },     // handling der SKAL afvises (cross-org).
//                                        // expectError = substring fejlen SKAL matche.
//                                        // OBLIGATORISK: uden den kan en afvisning af
//                                        // FORKERT grund (syntax/constraint) ikke
//                                        // skelnes fra den tilsigtede RLS-afvisning.
// }
// Negativ-udfaldet er TRE-vejs (ikke bare afvist true/false):
//   negAllowed        = forbudt op LYKKEDES (ok:true) → isolationen er brudt
//   negRejectedRight  = afvist AF DEN PINNEDE GRUND (ok:false + error ⊇ expectError)
//   (alt andet: afvist-af-forkert-grund / protokol-fejl → hverken green ELLER kill)
// green ⟺ protokol-valid + positiv lykkes + negRejectedRight.
export function runEffectHarness(harness, sql) {
  const dead = (error) => ({ green: false, protocolOk: false, positiveOk: false, negAllowed: false, negRejectedRight: false, error });
  if (!isPlainObject(harness) || !isPlainObject(harness.positive) || !isPlainObject(harness.negative))
    return dead("malformet harness (positive/negative kræves)");
  if (!isNonEmptyString(harness.asRole)) return dead("asRole mangler (ikke-bypass rolle kræves — bypass omgår RLS)");
  if (!isNonEmptyString(harness.negative.expectError))
    return dead("negative.expectError kræves (afvisnings-grunden skal pinnes — ellers tæller en tilfældig SQL-fejl som afvisning)");
  const opts = { role: harness.asRole, settings: isPlainObject(harness.settings) ? harness.settings : undefined };
  const pos = safeRun(sql, harness.positive.sql, opts);
  const neg = safeRun(sql, harness.negative.sql, opts);
  const protocolOk = pos.protocolOk === true && neg.protocolOk === true;
  const positiveOk = pos.protocolOk === true && pos.ok === true;
  const negAllowed = neg.protocolOk === true && neg.ok === true; // forbudt op lykkedes = isolation brudt
  const negRejectedRight =
    neg.protocolOk === true && neg.ok === false && isNonEmptyString(neg.error) && neg.error.includes(harness.negative.expectError);
  const green = protocolOk && positiveOk && negRejectedRight;
  return { green, protocolOk, positiveOk, negAllowed, negRejectedRight, detail: { pos, neg } };
}

// killMutant(mutant, harness, sql) → {killed, restored, cleanAfter, baselineGreen, detail}
//
// mutant = { knob, apply: sql, restore: sql }  (config-ændring + gendannelse; køres
//   som ejer/DDL-rolle, dvs. UDEN harness.asRole).
// DRÆBT ⟺ baseline var green, under-mutant-kørslen var protokol-valid, den POSITIVE
//   virker STADIG, men den NEGATIVE er IKKE længere afvist (isolationen brød, og
//   sikkerheds-assertionen fangede det). En positiv-regression eller en runner-fejl
//   under mutanten tæller IKKE som kill (virkeligheden er da ukendt/irrelevant).
// restore + en post-restore baseline køres ALTID, så næste mutant starter rent;
// cleanAfter=false betyder gendannelsen efterlod beskidt state.
export function killMutant(mutant, harness, sql) {
  if (!isPlainObject(mutant) || !isNonEmptyString(mutant.knob) || !isNonEmptyString(mutant.apply) || !isNonEmptyString(mutant.restore))
    return { killed: false, restored: false, cleanAfter: false, error: "malformet mutant (knob/apply/restore kræves)" };

  const baseline = runEffectHarness(harness, sql);
  if (baseline.green !== true) return { killed: false, restored: false, cleanAfter: false, baselineGreen: false, error: "baseline ikke green — intet at dræbe mod" };

  const applied = safeRun(sql, mutant.apply, {});
  if (applied.protocolOk !== true || applied.ok !== true) {
    const rr = safeRun(sql, mutant.restore, {}); // best-effort gendannelse
    const clean = runEffectHarness(harness, sql);
    return { killed: false, restored: rr.ok === true, cleanAfter: clean.green === true, baselineGreen: true, error: `mutant-apply fejlede: ${applied.error}` };
  }

  const underMutant = runEffectHarness(harness, sql);
  const restore = safeRun(sql, mutant.restore, {});
  const cleanBaseline = runEffectHarness(harness, sql); // post-restore: er vi rene igen?

  // DRÆBT ⟺ under mutanten er den forbudte op nu EKSPLICIT TILLADT (negAllowed),
  // mens positiv stadig virker. "Afvist af forkert grund" eller en protokol-fejl
  // er IKKE en kill (forbidden-op blev aldrig tilladt = ingen reel isolations-brud).
  const killed =
    underMutant.protocolOk === true && underMutant.positiveOk === true && underMutant.negAllowed === true;
  return {
    killed,
    restored: restore.ok === true,
    cleanAfter: cleanBaseline.green === true,
    baselineGreen: true,
    detail: { underMutant, restore, cleanBaseline },
  };
}

// runBuildProofEngine(spec, sql) → {allGreen, allKilled, results}
//
// spec = { kTests: [{ k_id, harness, mutants: [{knob, apply, restore}] }] }  (ikke-tom)
// Pr. K: baseline harness green + HVER mutant DRÆBT + RESTORED + cleanAfter
// (config-mutant-kill-gulvet). Producerer OBSERVATIONERNE build-proof kræver.
// OID/git-anchoring + kobling til krav/plan er wiring-/pakke-residual.
export function runBuildProofEngine(spec, sql) {
  if (!isPlainObject(spec) || !isDenseNonEmptyArray(spec.kTests))
    return { allGreen: false, allKilled: false, error: "malformet spec (ikke-tomt, tæt kTests-array kræves)", results: [] };
  const results = [];
  let allGreen = true;
  let allKilled = true;
  for (let i = 0; i < spec.kTests.length; i++) {
    const kt = spec.kTests[i];
    if (!isPlainObject(kt) || !isNonEmptyString(kt.k_id)) {
      results.push({ k_id: null, ok: false, error: "malformet kTest" });
      allGreen = false;
      allKilled = false;
      continue;
    }
    const baseline = runEffectHarness(kt.harness, sql);
    if (!isDenseNonEmptyArray(kt.mutants)) {
      // gulvet: hvert K SKAL have ≥1 (tæt) mutant — sparse/tomt = ingen dybde bevist
      results.push({ k_id: kt.k_id, baselineGreen: baseline.green === true, mutantsKilled: [], ok: false, error: "ingen mutant (mutant-kill-gulv brudt / sparse)" });
      allGreen = allGreen && baseline.green === true;
      allKilled = false;
      continue;
    }
    const mutantsKilled = [];
    let everyKilled = true;
    for (let j = 0; j < kt.mutants.length; j++) {
      const m = kt.mutants[j];
      const r = killMutant(m, kt.harness, sql);
      const good = r.killed === true && r.restored === true && r.cleanAfter === true;
      mutantsKilled.push({ knob: isPlainObject(m) ? m.knob ?? null : null, killed: r.killed === true, restored: r.restored === true, cleanAfter: r.cleanAfter === true, ok: good, error: r.error ?? null });
      everyKilled = everyKilled && good;
    }
    allGreen = allGreen && baseline.green === true;
    allKilled = allKilled && everyKilled;
    results.push({ k_id: kt.k_id, baselineGreen: baseline.green === true, mutantsKilled, ok: baseline.green === true && everyKilled });
  }
  return { allGreen, allKilled, results };
}
