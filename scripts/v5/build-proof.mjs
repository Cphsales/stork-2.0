#!/usr/bin/env node
// build-proof.mjs — v5's build-gate proof-verifier, v3 (HURTIGT SPOR 2026-09-21 — Mathias: »hele workflowet er overkill«; plan DEL VIII pkt. 42).
//
// Beviset er en TESTRAPPORT (test-runner.mjs) produceret af CI's eget måle-job fra Codex' testfiler — ikke en DSL af rå observationer som
// verifieren skal genudlede (v2.x — i git-historikken ≤ eb90600; angrebs-spec.mjs/build-harness.mjs bliver som biblioteker). Beskyttelsen mod falsk-grøn er PROCESSEN: der måler ≠ der bygger (hooks) ·
// CI kører testene · mutant-kill · CI = autoritet (pkt. 36). Verifieren tjekker derfor STRUKTUR og BINDING, ikke semantik:
//   - manifest (gate-binding, kæde-bundet til plan-gaten) + angrebs-INDEKS (gate-binding `angrebsspec`, skema 2) læses fra den pinnede commit;
//     indekset valideres for komplethed mod manifestet (angrebs-indeks.mjs) — så forventningen er plan-gatens, ikke bevisets
//   - rapporten bærer index_oid == indeks-bindingen · pakke · run_id; PRÆCIS indeksets tests (samme id-mængde, hver ok:true, covers ==
//     indeksets); PRÆCIS indeksets mutanter (hver killed:true m. kill-protokollen: applied · alle targets fejlede · controls ok · restore ok ·
//     alle grønne igen); summary genudledes
//   - bid_bindings == indeksets bid-graf · async_reviews PASS pr. bid @ bid'ets base_oid · prover_result konsistent + grøn
//   - artefaktet er ci-produceret (type ci-produced) eller committet blob; kernen binder proof.artifact_oid
//   Residualer (navngivet, pkt. 36/38/42): R-CI-AUTENTICITET (rapporten er CI's) · R-C3-REVIEW (reviewer-identitet) · R-SPEC-LEGITIMITET
//   (indekset er Codex' og frosset før byg — hooks) · testenes semantiske dybde er Codex' + reviewets ansvar, ikke verifierens.

import { isOid } from "./gates.mjs";
import { validateManifest } from "./forventnings-manifest.mjs";
import { validateAngrebsIndeks } from "./angrebs-indeks.mjs";
import { judgeTestSummary } from "./prover.mjs";
import { summarizeReport } from "./test-runner.mjs";

const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const own = (o, k) => { if (o === null || typeof o !== "object") return undefined; const d = Object.getOwnPropertyDescriptor(o, k); return d && typeof d.get !== "function" && typeof d.set !== "function" ? d.value : undefined; };
const ownTrue = (o, k) => own(o, k) === true;
const isStr = (v) => typeof v === "string" && v.length > 0;
const isPlain = (v) => { if (v === null || typeof v !== "object" || Array.isArray(v)) return false; const p = Object.getPrototypeOf(v); return p === Object.prototype || p === null; };
const isDense = (a, pred) => { if (!Array.isArray(a) || Object.getPrototypeOf(a) !== Array.prototype) return false; for (let i = 0; i < a.length; i++) if (!hasOwn(a, i) || !pred(a[i])) return false; return true; };
const gitObjectType = (git, oid) => { try { return String(git("cat-file", "-t", oid)).trim(); } catch { return null; } };
const isAncestor = (git, anc, desc) => { try { git("merge-base", "--is-ancestor", anc, desc); return true; } catch { return false; } };
const canon = (v) => JSON.stringify(v, Object.keys(v ?? {}).sort());

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
    if (gitObjectType(git, oid) !== "blob") { fail(`${label}: oid er ikke en blob`); return false; }
    return true;
  };
  const readJson = (ref, label) => { try { return JSON.parse(String(git("show", `${commitSha}:${own(ref, "path")}`))); } catch (e) { fail(`${label} kan ikke læses/parses fra git: ${e?.message ?? e}`); return null; } };
  { const art = own(snapshot, "artifact"); if (isPlain(art) && own(art, "type") === "ci-produced") { if (!isStr(own(art, "path")) || !isOid(own(art, "oid"))) fail("snapshot.artifact (ci-produced): path/oid mangler/ugyldig"); } else pathBind(art, "snapshot.artifact"); }
  const sB = own(snapshot, "bindings");
  const planRef = isPlain(sB) ? own(sB, "plan") : null;
  if (!planRef) fail("build-gatens plan-binding mangler/ugyldig i snapshot (fail-closed)"); else pathBind(planRef, "plan-binding");

  // ---------- 0) run_id · engine · forbudte kilder ----------
  const runId = own(proof, "run_id"); if (!isStr(runId)) fail("run_id mangler");
  for (const k of ["ks", "manifest_ref", "spec_ref", "bids", "cases_spec", "cases", "mutants_spec"]) if (hasOwn(proof, k)) fail(`proof.${k} er ikke en kilde — forventning og måling kommer fra gate-bindingerne (manifest · angrebsspec)`);

  // ---------- 1) FORVENTNING (manifest) + MÅLING (indeks) som GATE-BINDINGER ----------
  let manifest = null, idx = null;
  const mref = isPlain(sB) ? own(sB, "manifest") : null;
  if (!mref) fail("build-gatens manifest-binding mangler i snapshot"); else if (pathBind(mref, "manifest-binding")) {
    manifest = readJson(mref, "manifest");
    if (manifest !== null) { const v = validateManifest(manifest); if (!v.ok) { fail(`manifest ugyldigt: ${v.reasons.join("; ")}`); manifest = null; } else { for (const k of ["forventningsliste", "krav", "plan"]) pathBind(manifest.bindings[k], `manifest.bindings.${k}`); if (planRef && isOid(own(planRef, "oid")) && manifest.bindings.plan.oid !== own(planRef, "oid")) fail("manifest.bindings.plan ≠ gatens plan-binding"); } }
  }
  const aref = isPlain(sB) ? own(sB, "angrebsspec") : null;
  if (!aref) fail("build-gatens angrebsspec-binding mangler i snapshot (test-indekset er gate-input)"); else if (pathBind(aref, "angrebsspec-binding") && manifest) {
    idx = readJson(aref, "angrebs-indeks");
    if (idx !== null) { const v = validateAngrebsIndeks(idx, manifest); if (!v.ok) { fail(`angrebs-indeks ugyldigt/ukomplet mod manifestet: ${v.reasons.slice(0, 12).join("; ")}`); idx = null; } else if (idx.bindings.manifest.oid !== own(mref, "oid")) { fail("angrebs-indeks.bindings.manifest ≠ gatens manifest-binding"); idx = null; } }
  }
  if (!manifest || !idx) return { ok: false, reasons };

  // ---------- 2) rapporten: binding + præcis indeksets tests og mutanter ----------
  if (own(proof, "schema_version") !== 3) fail("bevisets schema_version ≠ 3 (testrapport)");
  if (own(proof, "pakke") !== idx.pakke) fail(`bevisets pakke '${String(own(proof, "pakke"))}' ≠ indeksets '${idx.pakke}'`);
  if (own(proof, "index_oid") !== own(aref, "oid")) fail(`rapportens index_oid ${String(own(proof, "index_oid")).slice(0, 12)} ≠ gate-bindingens ${String(own(aref, "oid")).slice(0, 12)} — rapporten stammer ikke fra det frosne indeks`);
  const tests = own(proof, "tests"); const idxTests = new Map(idx.tests.map((t) => [t.id, t]));
  if (!isDense(tests, isPlain)) fail("tests skal være et tæt array");
  else {
    const seen = new Set();
    for (const t of tests) {
      const id = own(t, "id"); if (!isStr(id) || !idxTests.has(id)) { fail(`test '${String(id)}' findes ikke i indekset (rogue)`); continue; }
      if (seen.has(id)) { fail(`dublet test-resultat ${id}`); continue; } seen.add(id);
      const it = idxTests.get(id);
      if (own(t, "file") !== it.file) fail(`test ${id}: file ≠ indeksets`);
      if ([...(own(t, "covers") ?? [])].sort().join("|") !== [...it.covers].sort().join("|")) fail(`test ${id}: covers ≠ indeksets`);
      if (!ownTrue(t, "ok")) fail(`test ${id} FEJLEDE: ${String(own(t, "detail") ?? "")}`.slice(0, 300));
    }
    for (const id of idxTests.keys()) if (!seen.has(id)) fail(`test '${id}' fra indekset har intet resultat (udeladelse)`);
  }
  const mutants = own(proof, "mutants"); const idxMut = new Map(idx.mutants.map((m) => [m.mutant_id, m]));
  if (!isDense(mutants, isPlain)) fail("mutants skal være et tæt array");
  else {
    const seen = new Set();
    for (const m of mutants) {
      const mid = own(m, "mutant_id"); if (!isStr(mid) || !idxMut.has(mid)) { fail(`mutant '${String(mid)}' findes ikke i indekset (rogue)`); continue; }
      if (seen.has(mid)) { fail(`dublet mutant-resultat ${mid}`); continue; } seen.add(mid);
      const im = idxMut.get(mid);
      if ((own(m, "guard_ref") ?? null) !== (im.guard_ref ?? null) || (own(m, "locus_ref") ?? null) !== (im.locus_ref ?? null)) fail(`${mid}: guard_ref/locus_ref ≠ indeksets`);
      const tg = own(m, "targets"), ct = own(m, "controls"), rs = own(m, "restored");
      const ids = (a) => (isDense(a, isPlain) ? a.map((x) => own(x, "id")).sort().join("|") : null);
      if (ids(tg) !== [...im.target_test_ids].sort().join("|")) fail(`${mid}: targets ≠ indeksets target_test_ids`);
      if (ids(ct) !== [...im.control_test_ids].sort().join("|")) fail(`${mid}: controls ≠ indeksets control_test_ids`);
      if (ids(rs) !== [...im.target_test_ids, ...im.control_test_ids].sort().join("|")) fail(`${mid}: restored ≠ targets+controls`);
      // kill genudledes fra protokollen — ikke fra flaget
      const killed = ownTrue(m, "applied_ok") && isDense(tg, isPlain) && tg.length > 0 && tg.every((x) => own(x, "failed") === true) && isDense(ct, isPlain) && ct.every((x) => ownTrue(x, "ok")) && ownTrue(m, "restore_ok") && isDense(rs, isPlain) && rs.every((x) => ownTrue(x, "ok"));
      if (!killed) fail(`${mid}: IKKE dræbt (applied=${own(m, "applied_ok")} · targets fejlede=${isDense(tg, isPlain) ? tg.filter((x) => own(x, "failed") === true).length + "/" + tg.length : "?"} · controls ok=${isDense(ct, isPlain) ? ct.every((x) => ownTrue(x, "ok")) : "?"} · restore=${own(m, "restore_ok")})`);
      if (own(m, "killed") !== killed) fail(`${mid}: selvrapporteret killed ≠ genudledt`);
    }
    for (const mid of idxMut.keys()) if (!seen.has(mid)) fail(`mutant '${mid}' fra indekset har intet resultat (udeladelse)`);
  }
  if (isDense(tests, isPlain) && isDense(mutants, isPlain)) { const s = summarizeReport({ tests, mutants }); if (canon(own(proof, "summary")) !== canon(s)) fail(`summary ≠ genudledt (${JSON.stringify(s)})`); }

  // ---------- 3) bids == indeksets graf · reviews · prover ----------
  const specBid = new Map(idx.bids.map((b) => [b.bid_id, b]));
  const pb = own(proof, "bid_bindings"); const bidBase = new Map();
  if (!isDense(pb, isPlain)) fail("bid_bindings skal være et tæt array [{bid_id, base_oid}]");
  else { const seen = new Set(); for (const b of pb) { const id = own(b, "bid_id"); if (!isStr(id) || !specBid.has(id)) { fail(`bid_bindings: '${String(id)}' er ikke et bid i indekset`); continue; } if (seen.has(id)) { fail(`bid_bindings: dublet ${id}`); continue; } seen.add(id); const base = own(b, "base_oid"); if (!isOid(base)) fail(`${id}: base_oid mangler/ugyldig`); else if (gitObjectType(git, base) !== "commit") fail(`${id}: base_oid er ikke en eksisterende commit`); else if (isOid(commitSha) && !isAncestor(git, base, commitSha)) fail(`${id}: base_oid er ikke en ancestor af den gatede commit`); bidBase.set(id, base); } for (const id of specBid.keys()) if (!seen.has(id)) fail(`bid '${id}' fra indekset mangler i proofen (den låste graf kan ikke beskæres)`); }
  const reviewed = new Map(); const reviews = own(proof, "async_reviews");
  if (!isDense(reviews, isPlain)) fail("async_reviews skal være et tæt array (manglende = anti-tavshed rød)");
  else for (const r of reviews) { const rbid = own(r, "bid_id"); if (!isStr(rbid) || !specBid.has(rbid)) { fail(`async_review for ukendt bid '${String(rbid)}'`); continue; } if (own(r, "conclusion") !== "PASS") { fail(`async_review for ${rbid} ikke PASS`); continue; } if (!isOid(own(r, "base_oid"))) { fail(`async_review for ${rbid}: base_oid mangler`); continue; } reviewed.set(rbid, own(r, "base_oid")); }
  for (const id of specBid.keys()) { if (!reviewed.has(id)) fail(`bid '${id}' mangler et PASS async-review`); else if (bidBase.has(id) && reviewed.get(id) !== bidBase.get(id)) fail(`bid '${id}': review base_oid ≠ bid'ets base_oid (stale review)`); }
  const pr = own(proof, "prover_result");
  if (!isPlain(pr)) fail("prover_result mangler");
  else { if (!ownTrue(pr, "ok")) fail(`prover_result.ok ikke true (${String(own(pr, "reason") ?? "prover ikke grøn")})`); const js = judgeTestSummary({ total: own(pr, "total"), passed: own(pr, "passed"), failed: own(pr, "failed"), skipped: own(pr, "skipped") }); if (!js.ok) fail(`prover_result: ${js.reasons.join("; ")}`); }
  return { ok: reasons.length === 0, reasons };
}
