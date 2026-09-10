#!/usr/bin/env node
// build-proof.mjs — v5's build-gate proof-verifier, v2.2 (plan 2.C · M-41 Trin C1/C2 · B2 · Codex C1-r1 F-1..10 · C1-r2 F-11..19).
//
// Plugges ind i makeProofVerifier (proofs.mjs) → evaluateGate. CI RE-KØRER denne mod rå input hvert run. Verifieren GENUDLEDER alt:
//   - FORVENTNINGEN = manifestet (gate-binding `manifest`, kæde-bundet til plan-gaten) · MÅLINGEN = angrebs-/måle-spec'en
//     (gate-binding `angrebsspec`: cases m. orakler/kontrakter, mutanter m. locus/kontroller/footprint, bid-graf) — begge path-bundne
//     @ pinned commit. Beviset leverer KUN observationer; orakler, kontroller, mutationer og bid-graf kan ikke vælges af buildet
//     (F-13, F-16, F-18). validateAngrebsSpec beviser spec'ens komplethed mod manifestet.
//   - hver spec-case har PRÆCIS ét delbevis i proofen; dets identitetsfelter og de spec-afledte dele af observationerne (kontrakt ·
//     expect · checkpoint/vidne-id'er · race_id · invariant_expect · fase · aktør) skal være spec'ens/manifestets; status+assertions
//     GENUDLEDES med judgeObservations (F-3, F-4, F-11, F-14)
//   - hver spec-mutant har PRÆCIS ét resultat; indlejrede delresultater bindes til case-identitet + run_id + form + kontrakt (F-12),
//     kontrol-mængden er spec'ens i alle faser (F-16), kill GENUDLEDES (judgeKill) inkl. footprint-attesteret mutation og restore,
//     og break_form skal være judgeKill's (F-12, F-15)
//   - bids i proofen == spec'ens graf (F-18) · engine.summary genudledes · prover_result er et konsistent resumé (judgeTestSummary)
//     der dækker alle cases+mutanter (F-19) · claim_graph binder case_ids/mutant_ids til samme K (F-19) · async-review PASS pr. bid
//   ENFORCEMENT-RESIDUAL (R-CI-AUTENTICITET): at observationerne stammer fra en real store som ikke-bypass rolle attesteres af den
//   betroede runner i CI's build-job; R-PREDECESSOR-WIRING: build-gate-run (frisk plan-dom → predecessor.bindings_oids) er C4.

import { isOid } from "./gates.mjs";
import { verifyEvidence } from "./verdikt.mjs";
import { validateManifest, expectedSet, PROOF_FORMS } from "./forventnings-manifest.mjs";
import { validateAngrebsSpec } from "./angrebs-spec.mjs";
import { HARD_EFFECTS, PUBLIC_ENTRYPOINT_KINDS, STATUS, judgeObservations, judgeKill, summarize, canon } from "./build-harness.mjs";
import { judgeTestSummary } from "./prover.mjs";

const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const own = (o, k) => { if (o === null || typeof o !== "object") return undefined; const d = Object.getOwnPropertyDescriptor(o, k); return d && typeof d.get !== "function" && typeof d.set !== "function" ? d.value : undefined; };
const ownTrue = (o, k) => own(o, k) === true;
const isStr = (v) => typeof v === "string" && v.length > 0;
const isPlain = (v) => { if (v === null || typeof v !== "object" || Array.isArray(v)) return false; const p = Object.getPrototypeOf(v); return p === Object.prototype || p === null; };
const isDense = (a, pred) => {
  if (!Array.isArray(a) || Object.getPrototypeOf(a) !== Array.prototype) return false;
  const len = a.length;
  for (const k of Reflect.ownKeys(a)) { if (typeof k === "symbol") return false; if (k === "length") continue; const idx = Number(k); if (!Number.isInteger(idx) || idx < 0 || idx >= len || String(idx) !== k) return false; const d = Object.getOwnPropertyDescriptor(a, k); if (!d || typeof d.get === "function" || typeof d.set === "function" || !d.enumerable) return false; }
  for (let i = 0; i < len; i++) if (!hasOwn(a, i) || !pred(a[i])) return false;
  return true;
};
const gitObjectType = (git, oid) => { try { return String(git("cat-file", "-t", oid)).trim(); } catch { return null; } };
const isAncestor = (git, anc, desc) => { try { git("merge-base", "--is-ancestor", anc, desc); return true; } catch { return false; } };
const safeCanon = (v) => { try { return canon(v); } catch { return null; } };
const sameCanon = (a, b) => { const x = safeCanon(a), y = safeCanon(b); return x !== null && x === y; };
export { HARD_EFFECTS, PUBLIC_ENTRYPOINT_KINDS };

// spec-afledte observationsfelter pr. form (det beviset IKKE må vælge) — sammenlignes kanonisk med observationerne
function specObs(c, F) {
  const ob = F.obligations.get(c.obligation_id);
  if (c.proof_form === "UT") {
    const rc = F.negatives.get(c.negative_id).reject_contract;
    if (rc.kanal === "exit") return { kontrakt: { kanal: "exit", exit_code: rc.exit_code, klasse: rc.klasse } };
    return { kontrakt: { kanal: "sqlstate", sqlstate: rc.sqlstate, grund: rc.grund, afvisningssted: rc.afvisningssted, aktoer: rc.aktoer, fase: rc.fase }, aktoer: c.actor.role, fase: c.fase };
  }
  if (c.proof_form === "FS") return { expect: c.expect, checkpoints: (c.checkpoints ?? []).map((cp) => ({ id: cp.id, expect: cp.expect })) };
  if (c.proof_form === "MH") return { witnesses: c.witnesses.map((w) => ({ id: w.id, expect: w.expect })) };
  if (c.proof_form === "SA") { const rc = F.negatives.get(c.race.reject_negative_id).reject_contract; return { race_id: c.race.race_id, invariant_expect: c.race.invariant.expect, kontrakt: { kanal: "sqlstate", sqlstate: rc.sqlstate, grund: rc.grund, afvisningssted: rc.afvisningssted, aktoer: rc.aktoer }, aktoer: c.actor.role }; }
  void ob; return {};
}
// projektion af observationerne på de spec-afledte felter (samme form som specObs)
function obsProj(form, obs) {
  if (!isPlain(obs)) return null;
  if (form === "UT") { const k = own(obs, "kontrakt"); return own(k, "kanal") === "exit" ? { kontrakt: k } : { kontrakt: k, aktoer: own(obs, "aktoer"), fase: own(obs, "fase") }; }
  if (form === "FS") return { expect: own(obs, "expect"), checkpoints: (isDense(own(obs, "checkpoints"), isPlain) ? own(obs, "checkpoints") : []).map((cp) => ({ id: own(cp, "id"), expect: own(cp, "expect") })) };
  if (form === "MH") return { witnesses: (isDense(own(obs, "witnesses"), isPlain) ? own(obs, "witnesses") : []).map((w) => ({ id: own(w, "id"), expect: own(w, "expect") })) };
  if (form === "SA") return { race_id: own(obs, "race_id"), invariant_expect: own(obs, "invariant_expect"), kontrakt: own(obs, "kontrakt"), aktoer: own(obs, "aktoer") };
  return null;
}

export function verifyBuildProof(proof, snapshot, { git } = {}) {
  const reasons = []; const fail = (r) => reasons.push(r);
  if (typeof git !== "function") return { ok: false, reasons: ["git-dep mangler (fail-closed)"] };
  if (!isPlain(proof)) return { ok: false, reasons: ["build-proof er ikke et objekt"] };
  if (!isPlain(snapshot)) return { ok: false, reasons: ["snapshot mangler/ugyldig (fail-closed)"] };
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
  const readJson = (ref, label) => { try { return JSON.parse(String(git("show", `${commitSha}:${own(ref, "path")}`))); } catch (e) { fail(`${label} kan ikke læses/parses fra git: ${e?.message ?? e}`); return null; } };
  pathBind(own(snapshot, "artifact"), "snapshot.artifact");
  const sB = own(snapshot, "bindings");
  const planRef = isPlain(sB) ? own(sB, "plan") : null;
  if (!planRef) fail("build-gatens plan-binding mangler/ugyldig i snapshot (fail-closed)"); else pathBind(planRef, "plan-binding");

  // ---------- 0) run_id · engine · forbudte kilder ----------
  const runId = own(proof, "run_id"); if (!isStr(runId)) fail("run_id mangler (alle delbeviser skal stamme fra én kørsel)");
  const engine = own(proof, "engine");
  if (!isPlain(engine)) fail("engine mangler (kørsels-metadata fra build-harness)");
  else { if (own(engine, "run_id") !== runId) fail("engine.run_id ≠ proof.run_id"); if (own(engine, "store") !== "real") fail('engine.store ikke "real" (fixture/mock ≠ real backing store)'); }
  for (const k of ["ks", "manifest_ref", "spec_ref", "bids", "cases_spec"]) if (hasOwn(proof, k)) fail(`proof.${k} er ikke en kilde — forventning og måling kommer fra gate-bindingerne (manifest · angrebsspec), ikke fra beviset`);

  // ---------- 1) FORVENTNING (manifest) + MÅLING (angrebs-spec) som GATE-BINDINGER ----------
  let F = null, manifest = null, spec = null;
  const mref = isPlain(sB) ? own(sB, "manifest") : null;
  if (!mref) fail("build-gatens manifest-binding mangler i snapshot"); else if (pathBind(mref, "manifest-binding")) {
    manifest = readJson(mref, "manifest");
    if (manifest !== null) { const v = validateManifest(manifest); if (!v.ok) { fail(`manifest ugyldigt: ${v.reasons.join("; ")}`); manifest = null; } else { for (const k of ["forventningsliste", "krav", "plan"]) pathBind(manifest.bindings[k], `manifest.bindings.${k}`); if (planRef && isOid(own(planRef, "oid")) && manifest.bindings.plan.oid !== own(planRef, "oid")) fail("manifest.bindings.plan ≠ gatens plan-binding"); F = expectedSet(manifest); } }
  }
  const aref = isPlain(sB) ? own(sB, "angrebsspec") : null;
  if (!aref) fail("build-gatens angrebsspec-binding mangler i snapshot (måle-spec er gate-input)"); else if (pathBind(aref, "angrebsspec-binding") && manifest) {
    spec = readJson(aref, "angrebs-spec");
    if (spec !== null) { const v = validateAngrebsSpec(spec, manifest); if (!v.ok) { fail(`angrebs-spec ugyldig/ukomplet mod manifestet: ${v.reasons.join("; ")}`); spec = null; } else if (spec.bindings.manifest.oid !== own(mref, "oid")) { fail("angrebs-spec.bindings.manifest ≠ gatens manifest-binding (spec'en er skrevet mod et andet manifest)"); spec = null; } }
  }
  if (!F || !spec) return { ok: false, reasons };
  const specCase = new Map(spec.cases.map((c) => [c.case_id, c]));
  const specMut = new Map(spec.mutants.map((m) => [m.mutant_id, m]));
  const specBid = new Map(spec.bids.map((b) => [b.bid_id, b]));
  const coveringBid = new Map(); for (const b of spec.bids) if (b.kind === "effekt") for (const o of b.covers) coveringBid.set(o, b.bid_id);

  // ---------- 2) bids i proofen == spec'ens graf (F-18) + angrebs-spec/base-bindinger pr. bid ----------
  const pb = own(proof, "bid_bindings"); const bidBase = new Map();
  if (!isDense(pb, isPlain)) fail("bid_bindings skal være et tæt array [{bid_id, base_oid}] (angrebs-spec'en er gate-bundet — pr. bid bindes kun base_oid)");
  else {
    const seen = new Set();
    for (const b of pb) {
      const id = own(b, "bid_id"); if (!isStr(id) || !specBid.has(id)) { fail(`bid_bindings: '${String(id)}' er ikke et bid i spec'en`); continue; }
      if (seen.has(id)) { fail(`bid_bindings: dublet ${id}`); continue; } seen.add(id);
      const base = own(b, "base_oid");
      if (!isOid(base)) fail(`${id}: base_oid mangler/ugyldig`);
      else if (gitObjectType(git, base) !== "commit") fail(`${id}: base_oid er ikke en eksisterende commit`);
      else if (isOid(commitSha) && !isAncestor(git, base, commitSha)) fail(`${id}: base_oid er ikke en ancestor af den gatede commit`);
      bidBase.set(id, base);
    }
    for (const id of specBid.keys()) if (!seen.has(id)) fail(`bid '${id}' fra spec'en mangler i proofen (F-18: den låste graf kan ikke beskæres)`);
  }

  // ---------- 3) cases: præcis ét delbevis pr. spec-case; identitet + spec-afledte felter + genudledning ----------
  const cases = own(proof, "cases"); const resById = new Map();
  const bindCase = (r, c, label) => {   // identitetsfelter der SKAL være spec'ens
    let ok = true;
    const want = { obligation_id: c.obligation_id, proof_form: c.proof_form, negative_id: c.proof_form === "UT" ? c.negative_id : null, bid_id: c.bid_id, hard_effect: c.hard_effect, actor_role: c.actor.role };
    for (const [k, v] of Object.entries(want)) if ((own(r, k) ?? null) !== (v ?? null)) { fail(`${label}: ${k} '${String(own(r, k))}' ≠ spec'ens '${String(v)}'`); ok = false; }
    const ep = own(r, "entrypoint"); if (!isPlain(ep) || own(ep, "kind") !== c.entrypoint.kind || own(ep, "ref") !== c.entrypoint.ref) { fail(`${label}: entrypoint ≠ spec'ens`); ok = false; }
    if (own(r, "run_id") !== runId) { fail(`${label}: run_id ≠ kørslens`); ok = false; }
    const obs = own(r, "observations");
    if (!isPlain(obs)) { fail(`${label}: observations mangler`); return false; }
    if (!sameCanon(obsProj(c.proof_form, obs), specObs(c, F))) { fail(`${label}: spec-afledte felter i observationerne (kontrakt/orakel/id'er/fase/aktør) ≠ spec'en/manifestet`); ok = false; }
    const j = judgeObservations(c.proof_form, obs);
    if (own(r, "status") !== j.status || !sameCanon(own(r, "assertions"), j.assertions)) { fail(`${label}: selvrapporteret status/assertions ≠ genudledt (${j.status})`); ok = false; }
    return ok ? j : false;
  };
  if (!isDense(cases, isPlain)) fail("cases skal være et tæt array");
  else {
    for (const r of cases) {
      const cid = own(r, "case_id");
      if (!isStr(cid) || !specCase.has(cid)) { fail(`case '${String(cid)}' findes ikke i spec'en (rogue)`); continue; }
      if (resById.has(cid)) { fail(`dublet case-resultat ${cid}`); continue; }
      const j = bindCase(r, specCase.get(cid), `case ${cid}`);
      resById.set(cid, { ok: j !== false && j.status === STATUS.OPFYLDT, judged: j });
      if (j !== false && j.status !== STATUS.OPFYLDT) fail(`case ${cid}: genudledt status '${j.status}' ≠ opfyldt (${j.assertions.filter((a) => !a.ok).map((a) => a.id + ": " + a.detail).join("; ")})`);
    }
    for (const cid of specCase.keys()) if (!resById.has(cid)) fail(`case '${cid}' fra spec'en har intet delbevis (udeladelse)`);
  }
  const caseOk = (cid) => resById.get(cid)?.ok === true;

  // ---------- 4) mutanter: præcis ét resultat pr. spec-mutant; indlejrede delresultater bundet; genudledt kill ----------
  const mutants = own(proof, "mutants"); const mutOk = new Set();
  if (!isDense(mutants, isPlain)) fail("mutants skal være et tæt array");
  else {
    const seen = new Set();
    for (const m of mutants) {
      const mid = own(m, "mutant_id");
      if (!isStr(mid) || !specMut.has(mid)) { fail(`mutant '${String(mid)}' findes ikke i spec'en (rogue)`); continue; }
      if (seen.has(mid)) { fail(`dublet mutant-resultat ${mid}`); continue; } seen.add(mid);
      const sm = specMut.get(mid); const tc = specCase.get(sm.target_case_id); let okm = true;
      for (const [k, v] of [["guard_ref", sm.guard_ref], ["target_case_id", sm.target_case_id], ["target_assertion_id", sm.target_assertion_id]]) if (own(m, k) !== v) { fail(`${mid}: ${k} ≠ spec'ens`); okm = false; }
      if (own(m, "run_id") !== runId) { fail(`${mid}: run_id ≠ kørslens`); okm = false; }
      if (!caseOk(sm.target_case_id)) { fail(`${mid}: målets topniveau-delbevis er ikke opfyldt`); okm = false; }
      // indlejrede delresultater: mål (baseline/under/clean.target) bundet til target-casen; kontroller = spec'ens mængde i ALLE faser (F-12, F-16)
      const emb = (r, c, label) => { const j = bindCase(r, c, label); if (j === false) okm = false; if (isPlain(r) && own(r, "case_id") !== c.case_id) { fail(`${label}: case_id ≠ ${c.case_id}`); okm = false; } return j; };
      const clean = own(m, "clean");
      emb(own(m, "baseline"), tc, `${mid}.baseline`); emb(own(m, "under"), tc, `${mid}.under`); if (!isPlain(clean)) { fail(`${mid}: clean mangler`); okm = false; } else emb(own(clean, "target"), tc, `${mid}.clean.target`);
      const wantCtl = [...sm.controls].sort().join(",");
      for (const [lab, arr] of [["controls_baseline", own(m, "controls_baseline")], ["controls_under", own(m, "controls_under")], ["clean.controls", isPlain(clean) ? own(clean, "controls") : null]]) {
        if (!isDense(arr, isPlain)) { fail(`${mid}: ${lab} mangler`); okm = false; continue; }
        const got = arr.map((r) => own(r, "case_id")).sort().join(",");
        if (got !== wantCtl) { fail(`${mid}: ${lab} = [${got}] ≠ spec'ens kontroller [${wantCtl}] (F-16: samme nødvendige kontrolmængde i alle faser)`); okm = false; }
        for (const r of arr) { const c = specCase.get(own(r, "case_id")); if (c) emb(r, c, `${mid}.${lab}.${c.case_id}`); }
      }
      if (!okm) continue;
      const j = judgeKill(m);
      if (!j.killed || !j.restored || !j.cleanAfter) { fail(`${mid}: genudledt kill fejler — ${j.why}${j.restored ? "" : " · restore ikke attesteret (footprint)"}${j.cleanAfter ? "" : " · ikke ren efter"}`); continue; }
      if (!ownTrue(m, "killed") || !ownTrue(m, "restored") || !ownTrue(m, "cleanAfter") || own(m, "break_form") !== j.break_form || j.break_form !== tc.proof_form) { fail(`${mid}: selvrapporterede kill-flag/break_form ≠ genudledt (${j.break_form})`); continue; }
      mutOk.add(mid);
    }
    for (const mid of specMut.keys()) if (!seen.has(mid)) fail(`mutant '${mid}' fra spec'en har intet resultat (udeladelse)`);
  }

  // ---------- 5) engine.summary genudledes ----------
  if (isPlain(engine) && isDense(cases ?? [], isPlain) && isDense(mutants ?? [], isPlain)) {
    const derived = summarize(cases, mutants);
    if (!sameCanon(own(engine, "summary"), derived)) fail(`engine.summary ≠ genudledt (${safeCanon(derived)})`);
  }

  // ---------- 6) claim_graph: K-bundet til opfyldte cases og dræbte mutanter + git-ankre (F-19) ----------
  const cg = own(proof, "claim_graph");
  if (!isDense(cg, isPlain) || cg.length === 0) fail("claim_graph skal være et ikke-tomt, tæt array (den git-forankrede kerne må ikke droppes)");
  else for (let i = 0; i < cg.length; i++) {
    const c = cg[i]; const kId = own(c, "k_id");
    if (!isStr(kId) || !F.ks.has(kId)) fail(`claim_graph[${i}]: ukendt/manglende K`);
    const cids = own(c, "case_ids"); const mids = own(c, "mutant_ids");
    if (!isDense(cids, isStr) || cids.length === 0 || !cids.every((x) => caseOk(x) && F.obligations.get(specCase.get(x)?.obligation_id)?.k_id === kId)) fail(`claim_graph[${i}] (${String(kId)}): case_ids skal være ≥1 opfyldte cases for netop dette K`);
    if (!isDense(mids, isStr) || mids.length === 0 || !mids.every((x) => mutOk.has(x) && F.obligations.get(specCase.get(specMut.get(x)?.target_case_id)?.obligation_id)?.k_id === kId)) fail(`claim_graph[${i}] (${String(kId)}): mutant_ids skal være ≥1 dræbte mutanter for netop dette K`);
    if (!ownTrue(c, "executed") || !ownTrue(c, "mutant_killed")) fail(`claim_graph[${i}] (${String(kId)}): executed/mutant_killed ikke eksplicit true (og skal stemme med case_ids/mutant_ids)`);
    const anchor = own(c, "source_anchor");
    if (!isPlain(anchor)) { fail(`claim_graph[${i}] (${String(kId)}): source_anchor mangler`); continue; }
    const ev = verifyEvidence(anchor, snapshot, { git }); if (!ev.ok) fail(`claim_graph[${i}] (${String(kId)}): source-anker ikke git-verificeret — ${ev.reasons.join("; ")}`);
  }

  // ---------- 7) async-reviews: PASS pr. bid @ base_oid ----------
  const reviewed = new Map(); const reviews = own(proof, "async_reviews");
  if (!isDense(reviews, isPlain)) fail("async_reviews skal være et tæt array af objekter (manglende = anti-tavshed rød)");
  else for (const r of reviews) {
    const rbid = own(r, "bid_id");
    if (!isStr(rbid) || !specBid.has(rbid)) { fail(`async_review for ukendt bid '${String(rbid)}'`); continue; }
    if (own(r, "conclusion") !== "PASS") { fail(`async_review for ${rbid} ikke PASS`); continue; }
    if (!isOid(own(r, "base_oid"))) { fail(`async_review for ${rbid}: base_oid mangler/ugyldig`); continue; }
    reviewed.set(rbid, own(r, "base_oid"));
  }
  for (const id of specBid.keys()) { if (!reviewed.has(id)) fail(`bid '${id}' mangler et PASS async-review (anti-tavshed)`); else if (bidBase.has(id) && reviewed.get(id) !== bidBase.get(id)) fail(`bid '${id}': async-review base_oid matcher ikke bid'ets base_oid (stale review)`); }

  // ---------- 8) prover: konsistent resumé der dækker kørslen (F-19) ----------
  const pr = own(proof, "prover_result");
  if (!isPlain(pr)) fail("prover_result mangler/er ikke et objekt");
  else {
    if (!ownTrue(pr, "ok")) fail("prover_result.ok ikke eksplicit true (prover ikke grøn)");
    const js = judgeTestSummary({ total: own(pr, "total"), passed: own(pr, "passed"), failed: own(pr, "failed"), skipped: own(pr, "skipped") });
    if (!js.ok) fail(`prover_result: ${js.reasons.join("; ")}`);
    const exp = specCase.size + specMut.size;
    if (own(pr, "total") !== exp) fail(`prover_result.total ${String(own(pr, "total"))} ≠ kørslens ${exp} delbeviser (cases + mutanter) — afstemning mod den komplette forventede liste`);
    const ex = own(pr, "executed_ids");
    if (!isDense(ex, isStr) || new Set(ex).size !== exp || ![...specCase.keys(), ...specMut.keys()].every((id) => ex.includes(id))) fail("prover_result.executed_ids skal være præcis alle case_ids + mutant_ids fra spec'en");
  }
  return { ok: reasons.length === 0, reasons };
}
