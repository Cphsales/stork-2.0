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
  if (!Array.isArray(a) || Object.getPrototypeOf(a) !== Array.prototype || a.length === 0) return false;
  const len = a.length;
  // ingen egne symbol-/accessor-/ikke-index-nøgler (en accessor-index kunne
  // returnere en anden værdi ved hver læsning; ekstra nøgler skjuler intention).
  for (const k of Reflect.ownKeys(a)) {
    if (typeof k === "symbol") return false;
    if (k === "length") continue;
    const idx = Number(k);
    // kanonisk index-nøgle (String(idx) === k) afviser "", "01", "-0" osv.
    if (!Number.isInteger(idx) || idx < 0 || idx >= len || String(idx) !== k) return false;
    const d = Object.getOwnPropertyDescriptor(a, k);
    if (!d || typeof d.get === "function" || typeof d.set === "function" || !d.enumerable) return false;
  }
  for (let i = 0; i < len; i++) if (!Object.prototype.hasOwnProperty.call(a, i)) return false;
  return true;
};
// læs KUN et eget DATA-felt (ingen getter/setter, ikke arvet) — så et felt arvet
// fra (en forurenet) Object.prototype eller en accessor ikke kan levere en fakta
// til et ellers tomt input. (Global built-in-METODE-mutation + Proxy forbliver
// runtime-residualer; her lukkes object-NIVEAU-arv/accessors som i actors-lock/hooks.)
const ownVal = (o, k) => {
  if (o === null || typeof o !== "object") return undefined;
  const d = Object.getOwnPropertyDescriptor(o, k);
  return d && typeof d.get !== "function" && typeof d.set !== "function" ? d.value : undefined;
};

// Anerkendte AUTORISATIONS-/isolations-afvisnings-koder (Postgres SQLSTATE).
// 42501 = insufficient_privilege — RLS-policy- OG WITH CHECK-violation. En harness
// SKAL pinne sin negative afvisning til en af disse (via `expectCode`), så en
// syntax-/constraint-fejl (fx 42601) IKKE kan selv-svække checket til at "tælle som
// afvist" (Codex-fund: en caller-valgt substring kunne forfalskes). Reject-KLASSEN
// ejes af frameworket, ikke af harness-forfatteren. (Andre backing stores leverer
// deres egen kode-klasse — men aldrig en fri streng.)
export const REJECT_CODES = Object.freeze(["42501"]);

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
    return { ok: false, error: "runner returnerede ikke {ok:boolean} (fail-closed)", protocolOk: false, code: null };
  return { ok: r.ok, error: typeof r.error === "string" ? r.error : null, code: typeof r.code === "string" ? r.code : null, protocolOk: true };
}

// runEffectHarness(harness, sql) → {green, protocolOk, positiveOk, negativeRejected, detail}
//
// harness = {
//   asRole,                             // ikke-bypass DB-rolle (SET ROLE) — obligatorisk
//   settings?,                          // session-settings (fx tenant-org)
//   positive: { sql },                  // handling der SKAL lykkes (samme-org)
//   negative: { sql, expectCode },      // handling der SKAL afvises (cross-org).
//                                        // expectCode = den STRUKTUREREDE afvisnings-
//                                        // kode (SQLSTATE) fra runneren. OBLIGATORISK
//                                        // og SKAL være i REJECT_CODES — så harnessen
//                                        // ikke kan selv-svække ved at pinne en
//                                        // triviel/forkert fejlklasse (Codex-fund).
// }
// Negativ-udfaldet er TRE-vejs (ikke bare afvist true/false):
//   negAllowed        = forbudt op LYKKEDES (ok:true) → isolationen er brudt
//   negRejectedRight  = afvist med den PINNEDE, ANERKENDTE autorisations-kode
//                       (ok:false + code === expectCode ∈ REJECT_CODES)
//   (alt andet: afvist-af-forkert-kode / protokol-fejl → hverken green ELLER kill)
// green ⟺ protokol-valid + positiv lykkes + negRejectedRight.
export function runEffectHarness(harness, sql) {
  const dead = (error) => ({ green: false, protocolOk: false, positiveOk: false, negAllowed: false, negRejectedRight: false, error });
  if (!isPlainObject(harness)) return dead("malformet harness");
  const positive = ownVal(harness, "positive");
  const negative = ownVal(harness, "negative");
  const asRole = ownVal(harness, "asRole");
  const settings = ownVal(harness, "settings");
  if (!isPlainObject(positive) || !isPlainObject(negative)) return dead("malformet harness (positive/negative kræves)");
  if (!isNonEmptyString(asRole)) return dead("asRole mangler (ikke-bypass rolle kræves — bypass omgår RLS)");
  const expectCode = ownVal(negative, "expectCode");
  if (!isNonEmptyString(expectCode) || !REJECT_CODES.includes(expectCode))
    return dead(`negative.expectCode kræves og skal være en anerkendt autorisations-afvisnings-kode (${REJECT_CODES.join("/")}) — en fri fejl-streng kan selv-svækkes`);
  const opts = { role: asRole, settings: isPlainObject(settings) ? settings : undefined };
  const pos = safeRun(sql, ownVal(positive, "sql"), opts);
  const neg = safeRun(sql, ownVal(negative, "sql"), opts);
  const protocolOk = pos.protocolOk === true && neg.protocolOk === true;
  const positiveOk = pos.protocolOk === true && pos.ok === true;
  const negAllowed = neg.protocolOk === true && neg.ok === true; // forbudt op lykkedes = isolation brudt
  // afvist med den ANERKENDTE, pinnede kode (ikke en tilfældig/forkert fejlklasse)
  const negRejectedRight = neg.protocolOk === true && neg.ok === false && neg.code === expectCode;
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
  const knob = ownVal(mutant, "knob");
  const apply = ownVal(mutant, "apply");
  const restore = ownVal(mutant, "restore");
  if (!isNonEmptyString(knob) || !isNonEmptyString(apply) || !isNonEmptyString(restore))
    return { killed: false, restored: false, cleanAfter: false, error: "malformet mutant (knob/apply/restore kræves)" };

  const baseline = runEffectHarness(harness, sql);
  if (baseline.green !== true) return { killed: false, restored: false, cleanAfter: false, baselineGreen: false, error: "baseline ikke green — intet at dræbe mod" };

  const applied = safeRun(sql, apply, {});
  if (applied.protocolOk !== true || applied.ok !== true) {
    const rr = safeRun(sql, restore, {}); // best-effort gendannelse
    const clean = runEffectHarness(harness, sql);
    return { killed: false, restored: rr.ok === true, cleanAfter: clean.green === true, baselineGreen: true, error: `mutant-apply fejlede: ${applied.error}` };
  }

  const underMutant = runEffectHarness(harness, sql);
  const restore_ = safeRun(sql, restore, {});
  const cleanBaseline = runEffectHarness(harness, sql); // post-restore: er vi rene igen?

  // DRÆBT ⟺ under mutanten er den forbudte op nu EKSPLICIT TILLADT (negAllowed),
  // mens positiv stadig virker. "Afvist af forkert grund" eller en protokol-fejl
  // er IKKE en kill (forbidden-op blev aldrig tilladt = ingen reel isolations-brud).
  const killed =
    underMutant.protocolOk === true && underMutant.positiveOk === true && underMutant.negAllowed === true;
  return {
    killed,
    restored: restore_.ok === true,
    cleanAfter: cleanBaseline.green === true,
    baselineGreen: true,
    detail: { underMutant, restore: restore_, cleanBaseline },
  };
}

// runBuildProofEngine(spec, sql) → {allGreen, allKilled, results}
//
// spec = { kTests: [{ k_id, harness, mutants: [{knob, apply, restore}] }] }  (ikke-tom)
// Pr. K: baseline harness green + HVER mutant DRÆBT + RESTORED + cleanAfter
// (config-mutant-kill-gulvet). Producerer OBSERVATIONERNE build-proof kræver.
// OID/git-anchoring + kobling til krav/plan er wiring-/pakke-residual.
export function runBuildProofEngine(spec, sql) {
  const kTests = ownVal(spec, "kTests");
  if (!isDenseNonEmptyArray(kTests))
    return { allGreen: false, allKilled: false, error: "malformet spec (ikke-tomt, tæt kTests-array kræves)", results: [] };
  const results = [];
  let allGreen = true;
  let allKilled = true;
  for (let i = 0; i < kTests.length; i++) {
    const kt = kTests[i];
    const k_id = ownVal(kt, "k_id");
    const ktHarness = ownVal(kt, "harness");
    const ktMutants = ownVal(kt, "mutants");
    if (!isNonEmptyString(k_id)) {
      results.push({ k_id: null, ok: false, error: "malformet kTest" });
      allGreen = false;
      allKilled = false;
      continue;
    }
    const baseline = runEffectHarness(ktHarness, sql);
    if (!isDenseNonEmptyArray(ktMutants)) {
      // gulvet: hvert K SKAL have ≥1 (tæt) mutant — sparse/tomt = ingen dybde bevist
      results.push({ k_id, baselineGreen: baseline.green === true, mutantsKilled: [], ok: false, error: "ingen mutant (mutant-kill-gulv brudt / sparse)" });
      allGreen = allGreen && baseline.green === true;
      allKilled = false;
      continue;
    }
    const mutantsKilled = [];
    let everyKilled = true;
    for (let j = 0; j < ktMutants.length; j++) {
      const m = ktMutants[j];
      const r = killMutant(m, ktHarness, sql);
      const good = r.killed === true && r.restored === true && r.cleanAfter === true;
      mutantsKilled.push({ knob: ownVal(m, "knob") ?? null, killed: r.killed === true, restored: r.restored === true, cleanAfter: r.cleanAfter === true, ok: good, error: r.error ?? null });
      everyKilled = everyKilled && good;
    }
    allGreen = allGreen && baseline.green === true;
    allKilled = allKilled && everyKilled;
    results.push({ k_id, baselineGreen: baseline.green === true, mutantsKilled, ok: baseline.green === true && everyKilled });
  }
  return { allGreen, allKilled, results };
}
