#!/usr/bin/env node
// build-proof.mjs — v5's build-gate proof-verifier (plan 2.C, build-proof).
//
// Plugges ind i makeProofVerifier (proofs.mjs) → evaluateGate. CI RE-KØRER
// denne mod rå input hvert run; en committet `ok:true` trustes aldrig.
//
// ANSVARSDELING (plan 2.C, ærlig): dybden DESIGNES + DØMMES ved plan-gaten;
// build UDFØRER + BEKRÆFTER mekanisk (eksekveret + dræbt), ingen ny dom.
// Denne verifier er BEKRÆFTELSES-leddet. Den har:
//
//   U-FORFALSKELIG KERNE (re-verificeret mod rå git her):
//     - claim_graph source-ankre re-bundet ved OID (verifyEvidence, verdikt.mjs)
//       — en aktør kan ikke påstå et kilde-anker; det citeres mod rå git.
//     - strukturelle gulve der MINDSKER falsk-grøn-rummet: bijektion (K→bid→test,
//       intet rogue), effect-harness-FORM (public entrypoint · ikke-bypass rolle ·
//       hård slut-effekt, ALDRIG helper-return), config-mutant-kill-gulv
//       (≥1 dræbt targeted mutant pr. opsætnings-K), async-review-PASS pr. bid
//       bundet til base_oid, prover grøn (skipped/0-tests = rød).
//
//   ENFORCEMENT-RESIDUAL (ærligt navngivet — håndhæves ved KØRSEL, ikke her):
//     den FAKTISKE effect-harness- + mutant-EKSEKVERING mod en real backing
//     store / ikke-bypass DB-rolle produceres af harness/mutation-frameworket
//     (build-proof-runner, næste stykke) og køres af CI's build-job. Denne rene
//     funktion re-verificerer de git-forankrede ankre + kræver eksekverings-
//     flagene sat — men den kan ikke selv rejse en DB. Frameworket sætter kun
//     flagene sande ved en reel kør; her fail-lukkes hvis de ikke er eksplicit
//     sande. (Præcis som recon-coverage: kernen re-deriveres, blindheden er
//     driver-residual.)
//
// Effect-harness + mutant-kill MINDSKER falsk-grøn mekanisk; de TVINGER ikke
// fuld dybde — resten er plan-gatens dom (DEL VII). Ingen overclaim.

import { isOid } from "./gates.mjs";
import { verifyEvidence } from "./verdikt.mjs";

const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const isNonEmptyString = (v) => typeof v === "string" && v.length > 0;
// plain object KUN: en ikke-standard prototype kan maskere manglende felter som
// arvede → afvis (fail-closed). JSON-parset proof er altid plain.
const isPlainObject = (v) => {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const p = Object.getPrototypeOf(v);
  return p === Object.prototype || p === null;
};
// tæt array: ingen huller (sparse array må ikke tælle som udfyldt — fail-closed).
const isDenseArrayOf = (a, pred) => {
  if (!Array.isArray(a)) return false;
  for (let i = 0; i < a.length; i++) if (!hasOwn(a, i)) return false;
  return a.every(pred);
};
const isPosInt = (v) => Number.isInteger(v) && v >= 0;

// hårde slut-effekter (plan 2.C): state/event/DB-row. En helper-return er
// EKSPLICIT forbudt — den klassiske falsk-grøn (test på intern return mens den
// reelle policy aldrig køres).
const HARD_EFFECTS = Object.freeze(["state", "event", "db-row"]);

// verifyBuildProof(proof, snapshot, {git}) → {ok, reasons}
//
// proof (= snapshot.proof_result payload) forventet form:
//   {
//     proof_kind: "build-proof",
//     ks: [{ k_id, is_config_k }],                     // krav-acceptkriteriets K-sæt
//     bids: [{
//       bid_id, angrebs_spec_oid, base_oid,
//       tests:   [{ k_id, entrypoint, store:"real",
//                   non_bypass_role:true, hard_effect, negative_path_exercised:true }],
//       mutants: [{ k_id, knob, killed:true }],
//     }],
//     claim_graph: [{ k_id, executed:true, mutant_killed:true, source_anchor:{...evidence} }],
//     async_reviews: [{ bid_id, conclusion:"PASS", base_oid }],
//     prover_result: { ok:true, tests_run:>0, skipped:0 },
//   }
export function verifyBuildProof(proof, snapshot, { git } = {}) {
  const reasons = [];
  const fail = (r) => reasons.push(r);
  if (typeof git !== "function") return { ok: false, reasons: ["git-dep mangler (fail-closed)"] };
  if (!isPlainObject(proof)) return { ok: false, reasons: ["build-proof er ikke et objekt"] };
  if (!isPlainObject(snapshot)) return { ok: false, reasons: ["snapshot mangler/ugyldig (fail-closed)"] };

  const planOid = snapshot?.bindings?.plan?.oid;
  if (!isOid(planOid)) fail("build-gatens plan-binding mangler/ugyldig i snapshot (fail-closed)");

  // ---------- 1) K-sæt (krav-acceptkriteriet, deklareret) ----------
  const kIds = new Set();
  const configKs = new Set();
  if (!isDenseArrayOf(proof.ks, (k) => isPlainObject(k)) || proof.ks.length === 0)
    fail("ks skal være et ikke-tomt, tæt array af objekter (K-sættet mangler → intet at bevise)");
  else {
    for (const k of proof.ks) {
      if (!isNonEmptyString(k.k_id)) {
        fail("K uden gyldigt k_id");
        continue;
      }
      if (kIds.has(k.k_id)) fail(`dublet K: ${k.k_id}`);
      kIds.add(k.k_id);
      // is_config_k SKAL være eksplicit boolean (manglende/arvet = rød): et
      // opsætnings-K der tavst mister config-flaget ville slippe mutant-gulvet.
      if (!hasOwn(k, "is_config_k") || typeof k.is_config_k !== "boolean")
        fail(`${k.k_id}: is_config_k ikke eksplicit boolean`);
      else if (k.is_config_k) configKs.add(k.k_id);
    }
  }

  // ---------- 2) bids + bijektion + effect-harness-form + mutant-gulv ----------
  const testedKs = new Set(); // K'er med ≥1 gyldig effect-harness-test
  const killedConfigKs = new Set(); // config-K'er med ≥1 dræbt targeted mutant
  const bidIds = new Set();
  if (!isDenseArrayOf(proof.bids, (b) => isPlainObject(b)) || proof.bids.length === 0)
    fail("bids skal være et ikke-tomt, tæt array af objekter");
  else {
    for (const b of proof.bids) {
      const bid = isNonEmptyString(b.bid_id) ? b.bid_id : null;
      if (!bid) {
        fail("bid uden gyldigt bid_id");
        continue;
      }
      if (bidIds.has(bid)) fail(`dublet bid_id: ${bid}`);
      bidIds.add(bid);
      // pr.-bid OID-bindinger: angrebs-spec (kill-listen) + base (async-review-anker)
      if (!isOid(b.angrebs_spec_oid)) fail(`${bid}: angrebs_spec_oid mangler/ugyldig (kill-list ikke bundet)`);
      if (!isOid(b.base_oid)) fail(`${bid}: base_oid mangler/ugyldig`);

      // tests: effect-harness-FORM (ingen helper-return; ikke-bypass rolle; hård effekt)
      if (!isDenseArrayOf(b.tests, (t) => isPlainObject(t)) || b.tests.length === 0)
        fail(`${bid}: tests skal være et ikke-tomt, tæt array (et bid uden test beviser intet)`);
      else {
        for (const t of b.tests) {
          if (!isNonEmptyString(t.k_id)) {
            fail(`${bid}: test uden gyldigt k_id`);
            continue;
          }
          // rogue-test: refererer et K der ikke er i krav-acceptkriteriet
          if (!kIds.has(t.k_id)) {
            fail(`${bid}: test refererer ukendt K '${t.k_id}' (rogue — ikke i krav-sættet)`);
            continue;
          }
          let shapeOk = true;
          if (!isNonEmptyString(t.entrypoint)) {
            fail(`${bid}/${t.k_id}: entrypoint mangler (test skal gå gennem public entrypoint)`);
            shapeOk = false;
          }
          if (t.store !== "real") {
            fail(`${bid}/${t.k_id}: store ikke "real" (fixture/mock ≠ real backing store)`);
            shapeOk = false;
          }
          if (t.non_bypass_role !== true) {
            fail(`${bid}/${t.k_id}: non_bypass_role ikke eksplicit true (bypass-rolle omgår RLS → værdiløs)`);
            shapeOk = false;
          }
          if (!HARD_EFFECTS.includes(t.hard_effect)) {
            fail(
              `${bid}/${t.k_id}: hard_effect '${String(t.hard_effect)}' ugyldig — skal være state/event/db-row, ALDRIG helper-return`,
            );
            shapeOk = false;
          }
          if (t.negative_path_exercised !== true) {
            fail(`${bid}/${t.k_id}: negative_path_exercised ikke eksplicit true (afvisnings-stien ikke udøvet)`);
            shapeOk = false;
          }
          if (shapeOk) testedKs.add(t.k_id);
        }
      }

      // mutants: config-mutant-kill. En OVERLEVENDE mutant = rød (findes-test).
      if (hasOwn(b, "mutants")) {
        if (!isDenseArrayOf(b.mutants, (m) => isPlainObject(m))) fail(`${bid}: mutants er ikke et tæt array af objekter`);
        else {
          for (const m of b.mutants) {
            if (!isNonEmptyString(m.k_id) || !isNonEmptyString(m.knob)) {
              fail(`${bid}: mutant uden gyldigt k_id/knob`);
              continue;
            }
            if (!kIds.has(m.k_id)) {
              fail(`${bid}: mutant refererer ukendt K '${m.k_id}'`);
              continue;
            }
            if (m.killed !== true) {
              // eksplicit: en overlevende (eller uafklaret) mutant lukker gaten rød
              fail(`${bid}/${m.k_id}: mutant '${m.knob}' ikke dræbt (killed ≠ true) — overlevende mutant = falsk-grøn`);
              continue;
            }
            if (configKs.has(m.k_id)) killedConfigKs.add(m.k_id);
          }
        }
      }
    }
  }

  // ---------- 3) bijektion: hvert K dækket af ≥1 gyldig test ----------
  for (const kId of kIds) if (!testedKs.has(kId)) fail(`K '${kId}' har ingen gyldig effect-harness-test (bijektion brudt)`);

  // ---------- 4) config-mutant-kill-gulv (obligatorisk pr. opsætnings-K) ----------
  for (const kId of configKs)
    if (!killedConfigKs.has(kId)) fail(`opsætnings-K '${kId}' mangler ≥1 dræbt targeted mutant (mutant-kill-gulv brudt)`);

  // ---------- 5) claim_graph: source-ankre re-verificeret mod rå git ----------
  // u-forfalskelig kerne. Hvert anker citeres OID-bundet (verifyEvidence) og
  // skal være eksekveret + mutant-dræbt (claim uden eksekvering+kill = ugyldigt).
  if (hasOwn(proof, "claim_graph")) {
    if (!isDenseArrayOf(proof.claim_graph, (c) => isPlainObject(c))) fail("claim_graph er ikke et tæt array af objekter");
    else {
      for (let i = 0; i < proof.claim_graph.length; i++) {
        const c = proof.claim_graph[i];
        if (!isNonEmptyString(c.k_id) || !kIds.has(c.k_id)) fail(`claim_graph[${i}]: ukendt/manglende K`);
        if (c.executed !== true) fail(`claim_graph[${i}] (${String(c.k_id)}): executed ikke eksplicit true`);
        if (c.mutant_killed !== true) fail(`claim_graph[${i}] (${String(c.k_id)}): mutant_killed ikke eksplicit true`);
        // source-anker re-bundet mod rå git (samme læsebevis-kontrakt som verdikt)
        const ev = verifyEvidence(c.source_anchor, snapshot, { git });
        if (!ev.ok) fail(`claim_graph[${i}] (${String(c.k_id)}): source-anker ikke git-verificeret — ${ev.reasons.join("; ")}`);
      }
    }
  }

  // ---------- 6) async-reviews: PASS pr. bid, bundet til base_oid ----------
  const reviewedBids = new Map(); // bid_id → base_oid for PASS-reviews
  if (!isDenseArrayOf(proof.async_reviews, (r) => isPlainObject(r)))
    fail("async_reviews skal være et tæt array af objekter (manglende = anti-tavshed rød)");
  else {
    for (const r of proof.async_reviews) {
      if (!isNonEmptyString(r.bid_id) || !bidIds.has(r.bid_id)) {
        fail(`async_review for ukendt bid '${String(r.bid_id)}'`);
        continue;
      }
      if (r.conclusion !== "PASS") {
        fail(`async_review for ${r.bid_id} ikke PASS (${String(r.conclusion)}) — build-gaten åbner ikke med et ikke-PASS review`);
        continue;
      }
      if (!isOid(r.base_oid)) {
        fail(`async_review for ${r.bid_id}: base_oid mangler/ugyldig`);
        continue;
      }
      reviewedBids.set(r.bid_id, r.base_oid);
    }
  }
  // hvert bid SKAL have et PASS-review bundet til nøjagtig dets egen base_oid
  for (const b of Array.isArray(proof.bids) ? proof.bids : []) {
    if (!isPlainObject(b) || !isNonEmptyString(b.bid_id)) continue;
    if (!reviewedBids.has(b.bid_id)) fail(`bid '${b.bid_id}' mangler et PASS async-review (anti-tavshed)`);
    else if (isOid(b.base_oid) && reviewedBids.get(b.bid_id) !== b.base_oid)
      fail(`bid '${b.bid_id}': async-review base_oid matcher ikke bid'ets base_oid (stale review)`);
  }

  // ---------- 7) prover grøn (reel kør; skipped/0-tests = rød) ----------
  const pr = proof.prover_result;
  if (!isPlainObject(pr)) fail("prover_result mangler/er ikke et objekt");
  else {
    if (pr.ok !== true) fail("prover_result.ok ikke eksplicit true (prover ikke grøn)");
    if (!isPosInt(pr.tests_run) || pr.tests_run === 0) fail("prover_result.tests_run = 0 eller ugyldig (0-tests = rød)");
    if (!isPosInt(pr.skipped) || pr.skipped !== 0) fail("prover_result.skipped ≠ 0 (skippede tests = rød)");
  }

  return { ok: reasons.length === 0, reasons };
}
