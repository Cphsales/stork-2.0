#!/usr/bin/env node
// build-proof.mjs — v5's build-gate proof-verifier (plan 2.C, build-proof).
//
// Plugges ind i makeProofVerifier (proofs.mjs) → evaluateGate. CI RE-KØRER
// denne mod rå input hvert run; en committet `ok:true` trustes aldrig.
//
// ANSVARSDELING (plan 2.C, ærlig): dybden DESIGNES + DØMMES ved plan-gaten;
// build UDFØRER + BEKRÆFTER mekanisk (eksekveret + dræbt), ingen ny dom.
// Denne verifier er BEKRÆFTELSES-leddet:
//
//   U-FORFALSKELIG KERNE (re-verificeret mod rå git her):
//     - claim_graph source-ankre re-bundet ved OID (verifyEvidence, verdikt.mjs)
//       — OBLIGATORISK ikke-tom: den git-forankrede kerne kan ikke droppes.
//     - strukturelle gulve der MINDSKER falsk-grøn-rummet: bijektion (K↔bid↔test,
//       intet rogue), effect-harness-FORM (public-entrypoint-KIND · ikke-bypass
//       rolle · hård slut-effekt, ALDRIG helper-return), config-mutant-kill-gulv
//       (≥1 dræbt targeted mutant pr. K), async-review-PASS pr. bid bundet til
//       base_oid, prover grøn (skipped/0-tests = rød).
//
//   ENFORCEMENT-RESIDUAL (ærligt navngivet — håndhæves ved KØRSEL, ikke her):
//     (1) den FAKTISKE effect-harness/mutant-EKSEKVERING mod en real backing
//         store / ikke-bypass DB-rolle produceres af harness/mutation-
//         frameworket (næste stykke) + køres af CI's build-job. Denne rene
//         funktion re-verificerer git-ankrene + kræver eksekverings-flagene sat.
//     (2) at en test's entrypoint FAKTISK er en public indgang (ikke en intern
//         helper klædt som "api") kan ikke afgøres i en ren funktion — her
//         kræves kun en public-KIND-klassifikation; realiteten er harness-lag.
//     (3) hvilke K der (proportionalt) undtages mutant-gulvet er en PLAN-gate-
//         beslutning; indtil planen wires er default fail-closed = ALLE K kræver
//         en dræbt mutant (en selv-erklæret "non-config"-opt-out ville være en
//         falsk-grøn — Codex-fund #1).
//
// Effect-harness + mutant-kill MINDSKER falsk-grøn mekanisk; de TVINGER ikke
// fuld dybde — resten er plan-gatens dom (DEL VII). Ingen overclaim.

import { isOid } from "./gates.mjs";
import { verifyEvidence } from "./verdikt.mjs";

const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
// læs KUN et eget DATA-felt: hverken arvet (Object.prototype-pollution) ELLER en
// accessor (en getter kunne returnere true under checket / en anden værdi bagefter).
// own(o,k) → data-værdien hvis eget non-accessor felt, ellers undefined.
const own = (o, k) => {
  if (o === null || typeof o !== "object") return undefined;
  const d = Object.getOwnPropertyDescriptor(o, k);
  return d && typeof d.get !== "function" && typeof d.set !== "function" ? d.value : undefined;
};
const ownTrue = (o, k) => own(o, k) === true;
const isNonEmptyString = (v) => typeof v === "string" && v.length > 0;
// plain object KUN: en ikke-standard prototype kan maskere manglende felter som
// arvede → afvis (fail-closed). JSON-parset proof er altid plain.
const isPlainObject = (v) => {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const p = Object.getPrototypeOf(v);
  return p === Object.prototype || p === null;
};
// tæt, RENT array: ingen huller + standard Array.prototype + ingen egne symbol-/
// accessor-/ikke-index-nøgler — så en custom prototype eller egen every/Symbol.
// iterator-override ikke kan forfalske checket (og efterfølgende for...of er sikker).
// Index-loop, ikke a.every (Codex-fund; jf. actors-lock.checkPureDenseArrayOf).
const isDenseArrayOf = (a, pred) => {
  if (!Array.isArray(a) || Object.getPrototypeOf(a) !== Array.prototype) return false;
  const len = a.length;
  for (const k of Reflect.ownKeys(a)) {
    if (typeof k === "symbol") return false;
    if (k === "length") continue;
    const idx = Number(k);
    // KANONISK index-nøgle: String(idx) === k afviser "", "01", "1e0", "-0" osv.
    // (som Number(k) ellers ville mappe ind i range som en falsk ekstra "index").
    if (!Number.isInteger(idx) || idx < 0 || idx >= len || String(idx) !== k) return false;
    const d = Object.getOwnPropertyDescriptor(a, k);
    if (!d || typeof d.get === "function" || typeof d.set === "function" || !d.enumerable) return false;
  }
  for (let i = 0; i < len; i++) {
    if (!hasOwn(a, i)) return false;
    if (!pred(a[i])) return false;
  }
  return true;
};
const isPosInt = (v) => Number.isInteger(v) && v >= 0;
// git-objekt-type mod rå git (fail-closed): "blob"/"commit"/… eller null hvis
// OID'en ikke findes. Så en syntaktisk gyldig men IKKE-committet 40-hex OID
// (fake anker) fanges — isOid alene beviser ikke eksistens.
const gitObjectType = (git, oid) => {
  try {
    return String(git("cat-file", "-t", oid)).trim();
  } catch {
    return null;
  }
};
// er `anc` en ancestor af `desc` (inkl. lig)? merge-base --is-ancestor: exit 0 =
// ja, ≠0 (inkl. "ikke ancestor") → git() kaster → false (fail-closed). Fanger en
// unreachable/divergent base-commit der bare tilfældigvis er et gyldigt commit-objekt.
const isAncestor = (git, anc, desc) => {
  try {
    git("merge-base", "--is-ancestor", anc, desc);
    return true;
  } catch {
    return false;
  }
};

// hårde slut-effekter (plan 2.C): state/event/DB-row. Helper-return EKSPLICIT
// forbudt — den klassiske falsk-grøn (test på intern return, reel policy aldrig kørt).
const HARD_EFFECTS = Object.freeze(["state", "event", "db-row"]);
// public-entrypoint-KINDS (plan 2.C: API/RPC/UI-flow). En fri streng ville lade
// en intern helper passere som "public" (Codex-fund #3) → kræv en kendt kind.
const PUBLIC_ENTRYPOINT_KINDS = Object.freeze(["api", "rpc", "ui-flow"]);

// verifyBuildProof(proof, snapshot, {git}) → {ok, reasons}
//
// proof (= snapshot.proof_result payload) forventet form:
//   {
//     proof_kind: "build-proof",
//     ks: [{ k_id }],                                   // krav-acceptkriteriets K-sæt
//     bids: [{
//       bid_id, angrebs_spec_oid, base_oid,
//       tests:   [{ k_id, entrypoint:{kind:"api"|"rpc"|"ui-flow", ref},
//                   store:"real", non_bypass_role:true, hard_effect, negative_path_exercised:true }],
//       mutants: [{ k_id, knob, killed:true }],
//     }],
//     claim_graph: [{ k_id, executed:true, mutant_killed:true, source_anchor:{...evidence} }],  // ikke-tom
//     async_reviews: [{ bid_id, conclusion:"PASS", base_oid }],
//     prover_result: { ok:true, tests_run:>0, skipped:0 },
//   }
export function verifyBuildProof(proof, snapshot, { git } = {}) {
  const reasons = [];
  const fail = (r) => reasons.push(r);
  if (typeof git !== "function") return { ok: false, reasons: ["git-dep mangler (fail-closed)"] };
  if (!isPlainObject(proof)) return { ok: false, reasons: ["build-proof er ikke et objekt"] };
  if (!isPlainObject(snapshot)) return { ok: false, reasons: ["snapshot mangler/ugyldig (fail-closed)"] };
  // LAGDELING (Codex r5 #3, bevidst): envelope-bindingerne (ok/gate_id/proof_kind/
  // artifact_oid/bindings_oids) håndhæves af evaluateGate FØR verifyProof kaldes —
  // samme design som verifyReconCoverageProof. Denne funktion verificerer PAYLOAD
  // (bevis-indholdet). I produktion nås den kun via evaluateGate; et direkte kald
  // uden om gaten er ikke gate-stien. (Duplikér ikke envelope her → ingen divergens.)

  // EGNE snapshot-felter (stol ikke på kalderen — defense-in-depth mod
  // Object.prototype-pollution, også når verifyBuildProof kaldes direkte).
  // commit_sha SKAL være en pinned OID (mutable ref som HEAD forbudt) OG findes
  // som commit i git — hele bindingen hviler på en pinned commit.
  const commitSha = own(snapshot, "commit_sha");
  if (!isOid(commitSha)) fail("snapshot.commit_sha mangler/ikke en pinned OID (mutable ref som HEAD forbudt)");
  else if (gitObjectType(git, commitSha) !== "commit") fail("snapshot.commit_sha findes ikke som commit i git (fake/mutable)");

  // PATH-BIND en ref: blobben skal ligge på den CITEREDE sti i den gatede commit
  // (git rev-parse <commit>:<path> === oid) — ikke bare være en vilkårlig
  // eksisterende blob et andet sted (defense-in-depth; i produktion resolver
  // gate-eval.buildSnapshot refs fra rå git, men evaluateGate SELV er git-løs).
  const pathBind = (ref, label) => {
    if (!isPlainObject(ref)) return void fail(`${label} mangler/ugyldig (fail-closed)`);
    const path = own(ref, "path");
    const oid = own(ref, "oid");
    if (!isNonEmptyString(path) || !isOid(oid)) return void fail(`${label}: path/oid mangler/ugyldig`);
    if (!isOid(commitSha)) return; // commit_sha allerede rapporteret
    let atPath = null;
    try {
      atPath = git("rev-parse", `${commitSha}:${path}`);
    } catch {
      atPath = null;
    }
    if (atPath === null) fail(`${label}: sti '${path}' findes ikke i den gatede commit`);
    else if (atPath !== oid) fail(`${label}: oid matcher ikke stien i commit (citeret ${oid}, reel ${atPath}) — stale/orphan`);
    else if (gitObjectType(git, oid) !== "blob") fail(`${label}: oid er ikke en blob (fil forventet)`);
  };
  pathBind(own(snapshot, "artifact"), "snapshot.artifact");
  const sBindings = own(snapshot, "bindings");
  const planRef = isPlainObject(sBindings) ? own(sBindings, "plan") : null;
  if (!planRef) fail("build-gatens plan-binding mangler/ugyldig i snapshot (fail-closed)");
  else pathBind(planRef, "plan-binding");

  // ---------- 1) K-sæt (krav-acceptkriteriet, deklareret) ----------
  const kIds = new Set();
  const ksArr = own(proof, "ks");
  if (!isDenseArrayOf(ksArr, (k) => isPlainObject(k)) || ksArr.length === 0)
    fail("ks skal være et ikke-tomt, tæt array af objekter (K-sættet mangler → intet at bevise)");
  else {
    for (const k of ksArr) {
      const kId = own(k, "k_id");
      if (!isNonEmptyString(kId)) {
        fail("K uden gyldigt k_id");
        continue;
      }
      if (kIds.has(kId)) fail(`dublet K: ${kId}`);
      kIds.add(kId);
    }
  }

  // ---------- 2) bids + effect-harness-form + mutant-kill ----------
  const testedKs = new Set(); // K'er med ≥1 gyldig effect-harness-test
  const killedKs = new Set(); // K'er med ≥1 dræbt targeted mutant
  const bidIds = new Set();
  const bidsArr = own(proof, "bids");
  if (!isDenseArrayOf(bidsArr, (b) => isPlainObject(b)) || bidsArr.length === 0)
    fail("bids skal være et ikke-tomt, tæt array af objekter");
  else {
    for (const b of bidsArr) {
      const bid = own(b, "bid_id");
      if (!isNonEmptyString(bid)) {
        fail("bid uden gyldigt bid_id");
        continue;
      }
      if (bidIds.has(bid)) fail(`dublet bid_id: ${bid}`);
      bidIds.add(bid);
      // pr.-bid OID-bindinger: angrebs-spec (kill-listen) + base (async-review-anker).
      // angrebs-spec PATH-bindes til den gatede commit (reachable + på sin sti) —
      // ikke bare en vilkårlig/dangling blob i object-DB'en (Codex r5 #1).
      // RESIDUAL (ærlig, r3 #1): at blobben er DEN plan-gate-låste angrebs-spec for
      // netop dette bid (ikke bare en committet fil på en sti) kræver en PLAN-
      // deklareret forventet OID + angrebs-spec-schema (plan-wiring). Provenance-
      // binding, ikke build-DYBDEN (den håndhæves af mutant-kill + harness + claim_graph).
      const asOid = own(b, "angrebs_spec_oid");
      const asPath = own(b, "angrebs_spec_path");
      if (!isOid(asOid)) fail(`${bid}: angrebs_spec_oid mangler/ugyldig (kill-list ikke bundet)`);
      else if (!isNonEmptyString(asPath)) fail(`${bid}: angrebs_spec_path mangler (kan ikke path-binde kill-listen)`);
      else pathBind({ path: asPath, oid: asOid }, `${bid} angrebs-spec`);
      // base_oid: eksisterende commit OG en ancestor af den gatede commit (en
      // unreachable/divergent base må ikke tælle — Codex r5 #2).
      const baseOid = own(b, "base_oid");
      if (!isOid(baseOid)) fail(`${bid}: base_oid mangler/ugyldig`);
      else if (gitObjectType(git, baseOid) !== "commit") fail(`${bid}: base_oid er ikke en eksisterende commit (fake/ikke-committet OID)`);
      else if (isOid(commitSha) && !isAncestor(git, baseOid, commitSha)) fail(`${bid}: base_oid er ikke en ancestor af den gatede commit (unreachable/divergent base)`);

      // tests: effect-harness-FORM (public-kind entrypoint; ikke-bypass; hård effekt)
      const tests = own(b, "tests");
      if (!isDenseArrayOf(tests, (t) => isPlainObject(t)) || tests.length === 0)
        fail(`${bid}: tests skal være et ikke-tomt, tæt array (et bid uden test beviser intet)`);
      else {
        for (const t of tests) {
          const kId = own(t, "k_id");
          if (!isNonEmptyString(kId)) {
            fail(`${bid}: test uden gyldigt k_id`);
            continue;
          }
          if (!kIds.has(kId)) {
            fail(`${bid}: test refererer ukendt K '${kId}' (rogue — ikke i krav-sættet)`);
            continue;
          }
          let shapeOk = true;
          const ep = own(t, "entrypoint");
          if (!isPlainObject(ep) || !PUBLIC_ENTRYPOINT_KINDS.includes(own(ep, "kind")) || !isNonEmptyString(own(ep, "ref"))) {
            fail(`${bid}/${kId}: entrypoint skal være {kind: api|rpc|ui-flow, ref} (public indgang — ikke en fri streng/helper)`);
            shapeOk = false;
          }
          if (own(t, "store") !== "real") {
            fail(`${bid}/${kId}: store ikke "real" (fixture/mock ≠ real backing store)`);
            shapeOk = false;
          }
          if (!ownTrue(t, "non_bypass_role")) {
            fail(`${bid}/${kId}: non_bypass_role ikke eksplicit true (bypass-rolle omgår RLS → værdiløs)`);
            shapeOk = false;
          }
          if (!HARD_EFFECTS.includes(own(t, "hard_effect"))) {
            fail(
              `${bid}/${kId}: hard_effect '${String(own(t, "hard_effect"))}' ugyldig — skal være state/event/db-row, ALDRIG helper-return`,
            );
            shapeOk = false;
          }
          if (!ownTrue(t, "negative_path_exercised")) {
            fail(`${bid}/${kId}: negative_path_exercised ikke eksplicit true (afvisnings-stien ikke udøvet)`);
            shapeOk = false;
          }
          if (shapeOk) testedKs.add(kId);
        }
      }

      // mutants: config-mutant-kill. En OVERLEVENDE mutant = rød (findes-test).
      if (hasOwn(b, "mutants")) {
        const mutants = own(b, "mutants");
        if (!isDenseArrayOf(mutants, (m) => isPlainObject(m))) fail(`${bid}: mutants er ikke et tæt array af objekter`);
        else {
          for (const m of mutants) {
            const kId = own(m, "k_id");
            const knob = own(m, "knob");
            if (!isNonEmptyString(kId) || !isNonEmptyString(knob)) {
              fail(`${bid}: mutant uden gyldigt k_id/knob`);
              continue;
            }
            if (!kIds.has(kId)) {
              fail(`${bid}: mutant refererer ukendt K '${kId}'`);
              continue;
            }
            // dræbt ER IKKE nok: harness-engine kræver killed && restored &&
            // cleanAfter (Codex r2 #2) — en kill uden gendannelse eller på beskidt/
            // ukendt state tæller ikke. Alle tre eksplicit true.
            if (!ownTrue(m, "killed") || !ownTrue(m, "restored") || !ownTrue(m, "cleanAfter")) {
              fail(`${bid}/${kId}: mutant '${knob}' ikke dræbt+restored+ren (killed/restored/cleanAfter skal alle være eksplicit true)`);
              continue;
            }
            killedKs.add(kId);
          }
        }
      }
    }
  }

  // ---------- 3) bijektion: hvert K dækket af ≥1 gyldig test ----------
  for (const kId of kIds) if (!testedKs.has(kId)) fail(`K '${kId}' har ingen gyldig effect-harness-test (bijektion brudt)`);

  // ---------- 4) mutant-kill-gulv: hvert K har ≥1 dræbt targeted mutant ----------
  // (fail-closed for ALLE K — en selv-erklæret non-config-opt-out ville være en
  // falsk-grøn, Codex-fund #1; proportional undtagelse hører til plan-gaten.)
  for (const kId of kIds) if (!killedKs.has(kId)) fail(`K '${kId}' mangler ≥1 dræbt targeted mutant (mutant-kill-gulv brudt)`);

  // ---------- 5) claim_graph: OBLIGATORISK ikke-tom, source-ankre re-verificeret mod rå git ----------
  // u-forfalskelig kerne — må ikke droppes (Codex-fund #2). Hvert anker citeres
  // OID-bundet (verifyEvidence) og skal være eksekveret + mutant-dræbt.
  // RESIDUAL (ærlig, Codex-confirm #3): gulvet her er ≥1 git-forankret claim. Hvilke
  // K der PROPORTIONALT skal have en claim (plan 2.C: høj-risiko + sikkerheds-/
  // penge-/rettigheds-K) er en PLAN-gate-beslutning — den pure verifier har ingen
  // risiko-metadata og kan ikke re-derivere den uden planen. Per-K-dækning
  // håndhæves når plan-classification wires (ikke ensidigt overskrevet her).
  const cg = own(proof, "claim_graph");
  if (!isDenseArrayOf(cg, (c) => isPlainObject(c)) || cg.length === 0)
    fail("claim_graph skal være et ikke-tomt, tæt array (den git-forankrede kerne må ikke droppes)");
  else {
    for (let i = 0; i < cg.length; i++) {
      const c = cg[i];
      const kId = own(c, "k_id");
      if (!isNonEmptyString(kId) || !kIds.has(kId)) fail(`claim_graph[${i}]: ukendt/manglende K`);
      if (!ownTrue(c, "executed")) fail(`claim_graph[${i}] (${String(kId)}): executed ikke eksplicit true`);
      if (!ownTrue(c, "mutant_killed")) fail(`claim_graph[${i}] (${String(kId)}): mutant_killed ikke eksplicit true`);
      const anchor = own(c, "source_anchor");
      if (!isPlainObject(anchor)) {
        fail(`claim_graph[${i}] (${String(kId)}): source_anchor mangler/er ikke et plain object`);
        continue;
      }
      const ev = verifyEvidence(anchor, snapshot, { git });
      if (!ev.ok) fail(`claim_graph[${i}] (${String(kId)}): source-anker ikke git-verificeret — ${ev.reasons.join("; ")}`);
    }
  }

  // ---------- 6) async-reviews: PASS pr. bid, bundet til base_oid ----------
  const reviewedBids = new Map(); // bid_id → base_oid for PASS-reviews
  const reviewsArr = own(proof, "async_reviews");
  if (!isDenseArrayOf(reviewsArr, (r) => isPlainObject(r)))
    fail("async_reviews skal være et tæt array af objekter (manglende = anti-tavshed rød)");
  else {
    for (const r of reviewsArr) {
      const rbid = own(r, "bid_id");
      if (!isNonEmptyString(rbid) || !bidIds.has(rbid)) {
        fail(`async_review for ukendt bid '${String(rbid)}'`);
        continue;
      }
      if (own(r, "conclusion") !== "PASS") {
        fail(`async_review for ${rbid} ikke PASS (${String(own(r, "conclusion"))}) — build-gaten åbner ikke med et ikke-PASS review`);
        continue;
      }
      if (!isOid(own(r, "base_oid"))) {
        fail(`async_review for ${rbid}: base_oid mangler/ugyldig`);
        continue;
      }
      reviewedBids.set(rbid, r.base_oid);
    }
  }
  // hvert bid SKAL have et PASS-review bundet til nøjagtig dets egen base_oid
  for (const b of Array.isArray(bidsArr) ? bidsArr : []) {
    if (!isPlainObject(b) || !isNonEmptyString(own(b, "bid_id"))) continue;
    const bBase = own(b, "base_oid");
    if (!reviewedBids.has(b.bid_id)) fail(`bid '${b.bid_id}' mangler et PASS async-review (anti-tavshed)`);
    else if (isOid(bBase) && reviewedBids.get(b.bid_id) !== bBase)
      fail(`bid '${b.bid_id}': async-review base_oid matcher ikke bid'ets base_oid (stale review)`);
  }

  // ---------- 7) prover grøn (reel kør; skipped/0-tests = rød) ----------
  const pr = own(proof, "prover_result");
  if (!isPlainObject(pr)) fail("prover_result mangler/er ikke et objekt");
  else {
    if (!ownTrue(pr, "ok")) fail("prover_result.ok ikke eksplicit true (prover ikke grøn)");
    const tr = own(pr, "tests_run");
    if (!isPosInt(tr) || tr === 0) fail("prover_result.tests_run = 0 eller ugyldig (0-tests = rød)");
    const sk = own(pr, "skipped");
    if (!isPosInt(sk) || sk !== 0) fail("prover_result.skipped ≠ 0 (skippede tests = rød)");
  }

  return { ok: reasons.length === 0, reasons };
}
