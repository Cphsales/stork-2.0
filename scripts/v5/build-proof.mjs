#!/usr/bin/env node
// build-proof.mjs — v5's build-gate proof-verifier, v2 (plan 2.C · M-41 Trin C1/C2 · Codex' adapter-krav B2).
//
// Plugges ind i makeProofVerifier (proofs.mjs) → evaluateGate. CI RE-KØRER denne mod rå input hvert run; en
// committet `ok:true` trustes aldrig. Denne verifier er BEKRÆFTELSES-leddet: dybden designes + dømmes ved plan-gaten
// (forventningsliste → manifest), build UDFØRER (build-harness.mjs) og verifieren bekræfter at det producerede
// bevis dækker PRÆCIS den forventede mængde — hverken mere (rogue) eller mindre (udeladelse).
//
//   U-FORFALSKELIG KERNE (re-verificeret mod rå git her):
//     - FORVENTNINGEN kommer fra manifestet (forventnings-manifest.mjs) path-bundet @ gated commit — ALDRIG fra
//       proof.ks (B2's frit pas: bevisproducenten må ikke kunne indsnævre sin egen K-mængde). Manifestets egne
//       bindinger (forventningsliste · krav · plan) path-bindes også, og plan-bindingen skal være gatens plan.
//     - hver forpligtelse i nu-scope: ≥1 case pr. bevisform med status opfyldt; hvert negativ: ≥1 opfyldt UT-case
//       bundet til netop det negativ (reject-kontrakten hentes fra manifestet — D11: negativet er observeret i
//       SAMME kørsel (run_id), ikke et flag)
//     - D10: hvert negativ med eneste-værn (sole_guard_ref) har ≥1 DRÆBT mutant på det værn, formbestemt
//       (break_form == målets form) + restored + cleanAfter; og hvert K har ≥1 dræbt targeted mutant (gulvet)
//     - D12: bids skelner forudsætning/effekt; depends_on eksisterer og er acyklisk; hver forudsætning bæres af
//       ≥1 effekt-bid; effekt-bids' covers = præcis den forventede mængde; hver case hører til et effekt-bid der
//       dækker dens forpligtelse; angrebs-spec path-bundet + base_oid ancestor pr. bid
//     - claim_graph source-ankre re-bundet ved OID (verifyEvidence) — obligatorisk ikke-tom
//     - async-review PASS pr. bid bundet til base_oid · prover grøn (skipped/0-tests = rød) · engine.store = real
//
//   ENFORCEMENT-RESIDUAL (ærligt): at kørslen FAKTISK skete mod en real backing store som ikke-bypass rolle
//   produceres af harness-engine i CI's build-job (runner-adapteren); denne rene funktion re-verificerer
//   git-ankre + konsistens + komplethed. Proportional undtagelse fra mutant-gulvet er plan-gatens dom (manifest).

import { isOid } from "./gates.mjs";
import { verifyEvidence } from "./verdikt.mjs";
import { validateManifest, expectedSet, PROOF_FORMS } from "./forventnings-manifest.mjs";
import { HARD_EFFECTS, PUBLIC_ENTRYPOINT_KINDS, STATUS } from "./build-harness.mjs";

const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const own = (o, k) => {
  if (o === null || typeof o !== "object") return undefined;
  const d = Object.getOwnPropertyDescriptor(o, k);
  return d && typeof d.get !== "function" && typeof d.set !== "function" ? d.value : undefined;
};
const ownTrue = (o, k) => own(o, k) === true;
const isStr = (v) => typeof v === "string" && v.length > 0;
const isPlain = (v) => {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const p = Object.getPrototypeOf(v);
  return p === Object.prototype || p === null;
};
const isDense = (a, pred) => {
  if (!Array.isArray(a) || Object.getPrototypeOf(a) !== Array.prototype) return false;
  const len = a.length;
  for (const k of Reflect.ownKeys(a)) {
    if (typeof k === "symbol") return false;
    if (k === "length") continue;
    const idx = Number(k);
    if (!Number.isInteger(idx) || idx < 0 || idx >= len || String(idx) !== k) return false;
    const d = Object.getOwnPropertyDescriptor(a, k);
    if (!d || typeof d.get === "function" || typeof d.set === "function" || !d.enumerable) return false;
  }
  for (let i = 0; i < len; i++) if (!hasOwn(a, i) || !pred(a[i])) return false;
  return true;
};
const isPosInt = (v) => Number.isInteger(v) && v >= 0;
const gitObjectType = (git, oid) => { try { return String(git("cat-file", "-t", oid)).trim(); } catch { return null; } };
const isAncestor = (git, anc, desc) => { try { git("merge-base", "--is-ancestor", anc, desc); return true; } catch { return false; } };
export { HARD_EFFECTS, PUBLIC_ENTRYPOINT_KINDS };

// verifyBuildProof(proof, snapshot, {git}) → {ok, reasons}
//
// proof (= snapshot.proof_result payload):
//   { proof_kind: "build-proof", run_id,
//     manifest_ref: { path, oid },                       // forventnings-manifest.json @ gated commit — KILDEN
//     engine: { run_id, store: "real", summary },
//     cases:   [ runCase-resultater m. case_id · obligation_id · negative_id · proof_form · bid_id · hard_effect ·
//                entrypoint{kind,ref} · actor_role · status · assertions[{id,ok}] · run_id ],
//     mutants: [ killCaseMutant-resultater m. mutant_id · guard_ref · target_case_id · killed · break_form ·
//                restored · cleanAfter · run_id ],
//     bids:    [{ bid_id, kind: "forudsaetning"|"effekt", depends_on:[bid_id], covers:[obligation_id],
//                 angrebs_spec_oid, angrebs_spec_path, base_oid }],
//     claim_graph: [{ k_id, executed:true, mutant_killed:true, source_anchor:{…evidence} }],   // ikke-tom
//     async_reviews: [{ bid_id, conclusion:"PASS", base_oid }],
//     prover_result: { ok:true, tests_run:>0, skipped:0 } }
export function verifyBuildProof(proof, snapshot, { git } = {}) {
  const reasons = [];
  const fail = (r) => reasons.push(r);
  if (typeof git !== "function") return { ok: false, reasons: ["git-dep mangler (fail-closed)"] };
  if (!isPlain(proof)) return { ok: false, reasons: ["build-proof er ikke et objekt"] };
  if (!isPlain(snapshot)) return { ok: false, reasons: ["snapshot mangler/ugyldig (fail-closed)"] };
  // LAGDELING: envelope (ok/gate_id/proof_kind/artifact_oid/bindings_oids) håndhæves af evaluateGate FØR denne kaldes.

  const commitSha = own(snapshot, "commit_sha");
  if (!isOid(commitSha)) fail("snapshot.commit_sha mangler/ikke en pinned OID (mutable ref som HEAD forbudt)");
  else if (gitObjectType(git, commitSha) !== "commit") fail("snapshot.commit_sha findes ikke som commit i git (fake/mutable)");
  const pathBind = (ref, label) => {
    if (!isPlain(ref)) { fail(`${label} mangler/ugyldig (fail-closed)`); return false; }
    const path = own(ref, "path"); const oid = own(ref, "oid");
    if (!isStr(path) || !isOid(oid)) { fail(`${label}: path/oid mangler/ugyldig`); return false; }
    if (!isOid(commitSha)) return false;
    let atPath = null; try { atPath = git("rev-parse", `${commitSha}:${path}`); } catch { atPath = null; }
    if (atPath === null) { fail(`${label}: sti '${path}' findes ikke i den gatede commit`); return false; }
    if (String(atPath).trim() !== oid) { fail(`${label}: oid matcher ikke stien i commit (citeret ${oid}, reel ${String(atPath).trim()}) — stale/orphan`); return false; }
    if (gitObjectType(git, oid) !== "blob") { fail(`${label}: oid er ikke en blob (fil forventet)`); return false; }
    return true;
  };
  pathBind(own(snapshot, "artifact"), "snapshot.artifact");
  const sBindings = own(snapshot, "bindings");
  const planRef = isPlain(sBindings) ? own(sBindings, "plan") : null;
  if (!planRef) fail("build-gatens plan-binding mangler/ugyldig i snapshot (fail-closed)");
  else pathBind(planRef, "plan-binding");

  // ---------- 0) run_id + engine ----------
  const runId = own(proof, "run_id");
  if (!isStr(runId)) fail("run_id mangler (alle delbeviser skal stamme fra én kørsel)");
  const engine = own(proof, "engine");
  if (!isPlain(engine)) fail("engine mangler (kørsels-metadata fra build-harness)");
  else {
    if (own(engine, "run_id") !== runId) fail("engine.run_id ≠ proof.run_id");
    if (own(engine, "store") !== "real") fail('engine.store ikke "real" (fixture/mock ≠ real backing store)');
  }
  if (hasOwn(proof, "ks")) fail("proof.ks er ikke en kilde — forventningen udledes af manifestet (fjern feltet)");

  // ---------- 1) FORVENTNINGEN: manifest path-bundet @ gated commit ----------
  let forventning = null;
  const mref = own(proof, "manifest_ref");
  if (pathBind(mref, "manifest_ref")) {
    let manifest = null;
    try { manifest = JSON.parse(String(git("show", `${commitSha}:${own(mref, "path")}`))); } catch (e) { fail(`manifest kan ikke læses/parses fra git: ${e?.message ?? e}`); }
    if (manifest !== null) {
      const v = validateManifest(manifest);
      if (!v.ok) fail(`manifest ugyldigt: ${v.reasons.join("; ")}`);
      else {
        // manifestets egne bindinger: alle tre path-bundet @ gated commit; plan-bindingen SKAL være gatens plan
        const mb = manifest.bindings;
        for (const k of ["forventningsliste", "krav", "plan"]) pathBind(mb[k], `manifest.bindings.${k}`);
        if (planRef && isOid(own(planRef, "oid")) && mb.plan.oid !== own(planRef, "oid")) fail("manifest.bindings.plan ≠ gatens plan-binding (manifestet er afledt af en anden plan)");
        forventning = expectedSet(manifest);
      }
    }
  }
  if (!forventning) return { ok: false, reasons };   // uden forventning kan intet dækkes — stop her (fail-closed)
  const manifestGuards = forventning.guards;

  // ---------- 2) bids (D12) ----------
  const bids = own(proof, "bids");
  const bidById = new Map();
  if (!isDense(bids, isPlain) || bids.length === 0) fail("bids skal være et ikke-tomt, tæt array af objekter");
  else {
    for (const b of bids) {
      const id = own(b, "bid_id");
      if (!isStr(id)) { fail("bid uden gyldigt bid_id"); continue; }
      if (bidById.has(id)) { fail(`dublet bid_id: ${id}`); continue; }
      const kind = own(b, "kind");
      if (kind !== "forudsaetning" && kind !== "effekt") fail(`${id}: kind skal være forudsaetning|effekt (D12)`);
      const dep = own(b, "depends_on"); if (!isDense(dep, isStr)) fail(`${id}: depends_on skal være et tæt array af bid_ids (evt. tomt)`);
      const cov = own(b, "covers"); if (!isDense(cov, isStr)) fail(`${id}: covers skal være et tæt array af forpligtelses-ids (evt. tomt)`);
      if (kind === "forudsaetning" && isDense(cov, isStr) && cov.length > 0) fail(`${id}: et forudsætnings-bid dækker ingen forpligtelser direkte (effekten bevises i det effekt-bid der afhænger af det)`);
      if (kind === "effekt" && isDense(cov, isStr) && cov.length === 0) fail(`${id}: et effekt-bid skal dække ≥1 forpligtelse`);
      // angrebs-spec path-bundet + base_oid ancestor (uændret fra v1)
      const asOid = own(b, "angrebs_spec_oid"); const asPath = own(b, "angrebs_spec_path");
      if (!isOid(asOid)) fail(`${id}: angrebs_spec_oid mangler/ugyldig (kill-list ikke bundet)`);
      else if (!isStr(asPath)) fail(`${id}: angrebs_spec_path mangler (kan ikke path-binde kill-listen)`);
      else pathBind({ path: asPath, oid: asOid }, `${id} angrebs-spec`);
      const baseOid = own(b, "base_oid");
      if (!isOid(baseOid)) fail(`${id}: base_oid mangler/ugyldig`);
      else if (gitObjectType(git, baseOid) !== "commit") fail(`${id}: base_oid er ikke en eksisterende commit (fake/ikke-committet OID)`);
      else if (isOid(commitSha) && !isAncestor(git, baseOid, commitSha)) fail(`${id}: base_oid er ikke en ancestor af den gatede commit (unreachable/divergent base)`);
      bidById.set(id, { kind, depends_on: isDense(dep, isStr) ? dep : [], covers: isDense(cov, isStr) ? cov : [], base_oid: baseOid });
    }
    // afhængigheder: eksisterer, ikke selv, acykliske; hver forudsætning bæres af ≥1 effekt-bid
    const dependedOn = new Set();
    for (const [id, b] of bidById) for (const d of b.depends_on) { if (d === id) fail(`${id}: afhænger af sig selv`); else if (!bidById.has(d)) fail(`${id}: depends_on '${d}' findes ikke`); else dependedOn.add(d); }
    const color = new Map(); const dfs = (id, stack) => { if (color.get(id) === 2) return; if (color.get(id) === 1) { fail(`cyklisk afhængighed: ${[...stack, id].join(" → ")}`); return; } color.set(id, 1); for (const d of bidById.get(id)?.depends_on ?? []) if (bidById.has(d)) dfs(d, [...stack, id]); color.set(id, 2); };
    for (const id of bidById.keys()) dfs(id, []);
    for (const [id, b] of bidById) if (b.kind === "forudsaetning" && !dependedOn.has(id)) fail(`${id}: forudsætnings-bid som intet effekt-bid afhænger af — kan ikke afsluttes som effektbevist`);
    // covers: præcis den forventede mængde (unioner over effekt-bids)
    const covered = new Map();
    for (const [id, b] of bidById) if (b.kind === "effekt") for (const o of b.covers) { if (!forventning.obligations.has(o)) fail(`${id}: covers '${o}' er ikke en forventet forpligtelse (rogue/overdraget/ukendt)`); else covered.set(o, id); }
    for (const o of forventning.obligations.keys()) if (!covered.has(o)) fail(`forpligtelse '${o}' dækkes af intet effekt-bid (udeladelse)`);
  }

  // ---------- 3) cases: form fra manifestet, status opfyldt, negativ bundet, samme run ----------
  const cases = own(proof, "cases");
  const caseById = new Map();
  const coverage = new Map(); // obligation → Set(forms opfyldt)
  const negCovered = new Set();
  if (!isDense(cases, isPlain) || cases.length === 0) fail("cases skal være et ikke-tomt, tæt array af objekter");
  else {
    for (const c of cases) {
      const cid = own(c, "case_id");
      if (!isStr(cid)) { fail("case uden gyldigt case_id"); continue; }
      if (caseById.has(cid)) { fail(`dublet case_id: ${cid}`); continue; }
      const oid = own(c, "obligation_id"); const form = own(c, "proof_form"); const status = own(c, "status");
      const ob = forventning.obligations.get(oid);
      let okShape = true;
      if (!ob) { fail(`${cid}: obligation '${String(oid)}' er ikke forventet (rogue/overdraget/ukendt)`); okShape = false; }
      else if (!PROOF_FORMS.includes(form) || !ob.forms.has(form)) { fail(`${cid}: bevisform '${String(form)}' er ikke en af manifestets former for ${oid}`); okShape = false; }
      if (own(c, "run_id") !== runId) { fail(`${cid}: run_id ≠ kørslens run_id (delbevis fra en anden kørsel)`); okShape = false; }
      if (status !== STATUS.OPFYLDT) { fail(`${cid}: status '${String(status)}' ≠ opfyldt`); okShape = false; }
      const A = own(c, "assertions");
      if (!isDense(A, isPlain) || A.length === 0 || !A.every((a) => ownTrue(a, "ok") && isStr(own(a, "id")))) { fail(`${cid}: assertions skal være ikke-tomme og alle ok:true`); okShape = false; }
      const ep = own(c, "entrypoint");
      if (!isPlain(ep) || !PUBLIC_ENTRYPOINT_KINDS.includes(own(ep, "kind")) || !isStr(own(ep, "ref"))) { fail(`${cid}: entrypoint skal være {kind: api|rpc|ui-flow, ref}`); okShape = false; }
      if (!isStr(own(c, "actor_role"))) { fail(`${cid}: actor_role mangler (ikke-bypass rolle)`); okShape = false; }
      if (!HARD_EFFECTS.includes(own(c, "hard_effect"))) { fail(`${cid}: hard_effect skal være state|event|db-row`); okShape = false; }
      const bid = own(c, "bid_id"); const bb = isStr(bid) ? bidById.get(bid) : null;
      if (!bb) { fail(`${cid}: bid_id '${String(bid)}' findes ikke`); okShape = false; }
      else if (bb.kind !== "effekt") { fail(`${cid}: bid '${bid}' er et forudsætnings-bid — cases hører til effekt-bids`); okShape = false; }
      else if (ob && !bb.covers.includes(oid)) { fail(`${cid}: bid '${bid}' dækker ikke ${oid}`); okShape = false; }
      if (form === "UT" && ob) {
        const nid = own(c, "negative_id"); const neg = forventning.negatives.get(nid);
        if (!neg || neg.obligation_id !== oid) { fail(`${cid}: UT-case uden gyldigt negative_id under ${oid}`); okShape = false; }
        else if (okShape) negCovered.add(nid);
      }
      caseById.set(cid, { obligation_id: oid, form, k_id: ob?.k_id ?? null, ok: okShape, negative_id: own(c, "negative_id") ?? null });
      if (okShape) { if (!coverage.has(oid)) coverage.set(oid, new Set()); coverage.get(oid).add(form); }
    }
    for (const [oid, ob] of forventning.obligations) {
      const got = coverage.get(oid) ?? new Set();
      for (const f of ob.forms) if (!got.has(f)) fail(`forpligtelse '${oid}': ingen opfyldt ${f}-case (udeladelse)`);
    }
    for (const nid of forventning.negatives.keys()) if (!negCovered.has(nid)) fail(`negativ '${nid}': ingen opfyldt UT-case bundet til det (D11: negativet er ikke observeret i kørslen)`);
  }

  // ---------- 4) mutants (D10): formbestemt kill · eneste-værn · K-gulv ----------
  const mutants = hasOwn(proof, "mutants") ? own(proof, "mutants") : [];
  const killedByGuard = new Map(); const killedKs = new Set();
  if (!isDense(mutants, isPlain)) fail("mutants skal være et tæt array af objekter");
  else {
    const mids = new Set();
    for (const m of mutants) {
      const mid = own(m, "mutant_id");
      if (!isStr(mid)) { fail("mutant uden gyldigt mutant_id"); continue; }
      if (mids.has(mid)) { fail(`dublet mutant_id: ${mid}`); continue; } mids.add(mid);
      const g = own(m, "guard_ref"); const tc = own(m, "target_case_id"); const target = isStr(tc) ? caseById.get(tc) : null;
      if (!isStr(g) || !manifestGuards.has(g)) { fail(`${mid}: guard_ref '${String(g)}' er ikke et deklareret værn i manifestet`); continue; }
      if (!target || !target.ok) { fail(`${mid}: target_case_id '${String(tc)}' findes ikke / er ikke en gyldig opfyldt case`); continue; }
      if (own(m, "run_id") !== runId) { fail(`${mid}: run_id ≠ kørslens run_id`); continue; }
      if (!ownTrue(m, "killed") || !ownTrue(m, "restored") || !ownTrue(m, "cleanAfter")) { fail(`${mid}: ikke dræbt+restored+ren (alle tre eksplicit true)`); continue; }
      if (own(m, "break_form") !== target.form) { fail(`${mid}: break_form '${String(own(m, "break_form"))}' ≠ målets bevisform ${target.form} (kill skal være formbestemt)`); continue; }
      if (!killedByGuard.has(g)) killedByGuard.set(g, []); killedByGuard.get(g).push({ mid, negative_id: target.negative_id, obligation_id: target.obligation_id });
      if (target.k_id) killedKs.add(target.k_id);
    }
    for (const [g, nids] of forventning.soleGuards) {
      const kills = killedByGuard.get(g) ?? [];
      for (const nid of nids) if (!kills.some((k) => k.negative_id === nid)) fail(`D10: negativ '${nid}' bæres alene af værnet '${g}' men ingen dræbt mutant på det værn rammer netop det negativ`);
    }
    for (const k of forventning.ks) if (!killedKs.has(k)) fail(`K '${k}' mangler ≥1 dræbt targeted mutant (mutant-kill-gulv brudt)`);
  }

  // ---------- 5) claim_graph: obligatorisk ikke-tom, ankre re-verificeret mod rå git ----------
  const cg = own(proof, "claim_graph");
  if (!isDense(cg, isPlain) || cg.length === 0) fail("claim_graph skal være et ikke-tomt, tæt array (den git-forankrede kerne må ikke droppes)");
  else for (let i = 0; i < cg.length; i++) {
    const c = cg[i]; const kId = own(c, "k_id");
    if (!isStr(kId) || !forventning.ks.has(kId)) fail(`claim_graph[${i}]: ukendt/manglende K`);
    if (!ownTrue(c, "executed")) fail(`claim_graph[${i}] (${String(kId)}): executed ikke eksplicit true`);
    if (!ownTrue(c, "mutant_killed")) fail(`claim_graph[${i}] (${String(kId)}): mutant_killed ikke eksplicit true`);
    const anchor = own(c, "source_anchor");
    if (!isPlain(anchor)) { fail(`claim_graph[${i}] (${String(kId)}): source_anchor mangler/er ikke et plain object`); continue; }
    const ev = verifyEvidence(anchor, snapshot, { git });
    if (!ev.ok) fail(`claim_graph[${i}] (${String(kId)}): source-anker ikke git-verificeret — ${ev.reasons.join("; ")}`);
  }

  // ---------- 6) async-reviews: PASS pr. bid bundet til base_oid ----------
  const reviewed = new Map();
  const reviews = own(proof, "async_reviews");
  if (!isDense(reviews, isPlain)) fail("async_reviews skal være et tæt array af objekter (manglende = anti-tavshed rød)");
  else for (const r of reviews) {
    const rbid = own(r, "bid_id");
    if (!isStr(rbid) || !bidById.has(rbid)) { fail(`async_review for ukendt bid '${String(rbid)}'`); continue; }
    if (own(r, "conclusion") !== "PASS") { fail(`async_review for ${rbid} ikke PASS (${String(own(r, "conclusion"))})`); continue; }
    if (!isOid(own(r, "base_oid"))) { fail(`async_review for ${rbid}: base_oid mangler/ugyldig`); continue; }
    reviewed.set(rbid, own(r, "base_oid"));
  }
  for (const [id, b] of bidById) {
    if (!reviewed.has(id)) fail(`bid '${id}' mangler et PASS async-review (anti-tavshed)`);
    else if (isOid(b.base_oid) && reviewed.get(id) !== b.base_oid) fail(`bid '${id}': async-review base_oid matcher ikke bid'ets base_oid (stale review)`);
  }

  // ---------- 7) prover grøn ----------
  const pr = own(proof, "prover_result");
  if (!isPlain(pr)) fail("prover_result mangler/er ikke et objekt");
  else {
    if (!ownTrue(pr, "ok")) fail("prover_result.ok ikke eksplicit true (prover ikke grøn)");
    const tr = own(pr, "tests_run"); if (!isPosInt(tr) || tr === 0) fail("prover_result.tests_run = 0 eller ugyldig (0-tests = rød)");
    const sk = own(pr, "skipped"); if (!isPosInt(sk) || sk !== 0) fail("prover_result.skipped ≠ 0 (skippede tests = rød)");
  }
  return { ok: reasons.length === 0, reasons };
}
