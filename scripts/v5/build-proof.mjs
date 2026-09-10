#!/usr/bin/env node
// build-proof.mjs — v5's build-gate proof-verifier, v2.1 (plan 2.C · M-41 Trin C1/C2 · Codex' adapter-krav B2 · C1-r1 F-1..F-10).
//
// Plugges ind i makeProofVerifier (proofs.mjs) → evaluateGate. CI RE-KØRER denne mod rå input hvert run; et committet
// flag trustes aldrig. Verifieren GENUDLEDER alt der kan genudledes:
//   - FORVENTNINGEN kommer fra manifestet som GATE-BINDING (snapshot.bindings.manifest — layout-sti @ pinned commit, kæde-
//     bundet til plan-gatens manifest via predecessorBindings i gates.mjs). Beviset må IKKE pege på sit eget manifest (F-1).
//   - hver case's status + assertions GENUDLEDES fra dens rå observationer (judgeObservations) og skal være identiske med det
//     selvrapporterede; reject-kontrakten i observationerne skal være manifestets (F-3, F-4)
//   - komplethed: pr. (forpligtelse × form) · pr. negativ (UT-case m. netop det negativ, samme run_id — D11) · pr. NAVNGIVET
//     assertion fra manifestet (checkpoint:<id> · vidne:<id> · race_id) (F-2)
//   - mutanter: kill GENUDLEDES (judgeKill) fra de indlejrede rå delresultater, hvis status igen genudledes; guard_ref ∈ manifest;
//     D10: eneste-værn-negativ kræver dræbt mutant hvis MÅL er UT-casen for netop det negativ (F-9); K-gulv (F-6, F-7)
//   - D12: bids forudsætning/effekt, acyklisk, forudsætning båret; effekt-bids' covers = forventet mængde og HVER dækket
//     forpligtelse har ≥1 opfyldt case i netop det bid; manifestets effekt_bid (hvis sat) = det dækkende bid (F-10)
//   - engine.summary genudledes; claim_graph binder case_ids/mutant_ids; async-review PASS pr. bid @ base_oid; prover grøn
//   ENFORCEMENT-RESIDUAL (ærligt, R-CI-AUTENTICITET): at observationerne stammer fra en real store som ikke-bypass rolle
//   attesteres af runner-adapteren i CI's build-job — denne rene funktion beviser konsistens, komplethed og git-binding.

import { isOid } from "./gates.mjs";
import { verifyEvidence } from "./verdikt.mjs";
import { validateManifest, expectedSet, PROOF_FORMS } from "./forventnings-manifest.mjs";
import { HARD_EFFECTS, PUBLIC_ENTRYPOINT_KINDS, STATUS, judgeObservations, judgeKill, summarize, canon } from "./build-harness.mjs";

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
const isPosInt = (v) => Number.isInteger(v) && v >= 0;
const gitObjectType = (git, oid) => { try { return String(git("cat-file", "-t", oid)).trim(); } catch { return null; } };
const isAncestor = (git, anc, desc) => { try { git("merge-base", "--is-ancestor", anc, desc); return true; } catch { return false; } };
const safeCanon = (v) => { try { return canon(v); } catch { return null; } };
export { HARD_EFFECTS, PUBLIC_ENTRYPOINT_KINDS };

export function verifyBuildProof(proof, snapshot, { git } = {}) {
  const reasons = [];
  const fail = (r) => reasons.push(r);
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
  pathBind(own(snapshot, "artifact"), "snapshot.artifact");
  const sBindings = own(snapshot, "bindings");
  const planRef = isPlain(sBindings) ? own(sBindings, "plan") : null;
  if (!planRef) fail("build-gatens plan-binding mangler/ugyldig i snapshot (fail-closed)"); else pathBind(planRef, "plan-binding");

  // ---------- 0) run_id + engine ----------
  const runId = own(proof, "run_id");
  if (!isStr(runId)) fail("run_id mangler (alle delbeviser skal stamme fra én kørsel)");
  const engine = own(proof, "engine");
  if (!isPlain(engine)) fail("engine mangler (kørsels-metadata fra build-harness)");
  else { if (own(engine, "run_id") !== runId) fail("engine.run_id ≠ proof.run_id"); if (own(engine, "store") !== "real") fail('engine.store ikke "real" (fixture/mock ≠ real backing store)'); }
  if (hasOwn(proof, "ks")) fail("proof.ks er ikke en kilde — forventningen udledes af manifestet (fjern feltet)");
  if (hasOwn(proof, "manifest_ref")) fail("proof.manifest_ref er ikke en kilde — manifestet er gate-binding (snapshot.bindings.manifest), ikke bevisets valg (C1-r1 F-1)");

  // ---------- 1) FORVENTNINGEN: manifest som GATE-BINDING ----------
  let forventning = null; let manifest = null;
  const mref = isPlain(sBindings) ? own(sBindings, "manifest") : null;
  if (!mref) fail("build-gatens manifest-binding mangler i snapshot (gates.mjs: bindings plan+manifest)");
  else if (pathBind(mref, "manifest-binding")) {
    try { manifest = JSON.parse(String(git("show", `${commitSha}:${own(mref, "path")}`))); } catch (e) { fail(`manifest kan ikke læses/parses fra git: ${e?.message ?? e}`); }
    if (manifest !== null) {
      const v = validateManifest(manifest);
      if (!v.ok) fail(`manifest ugyldigt: ${v.reasons.join("; ")}`);
      else {
        for (const k of ["forventningsliste", "krav", "plan"]) pathBind(manifest.bindings[k], `manifest.bindings.${k}`);
        if (planRef && isOid(own(planRef, "oid")) && manifest.bindings.plan.oid !== own(planRef, "oid")) fail("manifest.bindings.plan ≠ gatens plan-binding (manifestet er afledt af en anden plan)");
        forventning = expectedSet(manifest);
      }
    }
  }
  if (!forventning) return { ok: false, reasons };

  // ---------- 2) bids (D12) ----------
  const bids = own(proof, "bids"); const bidById = new Map();
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
      if (kind === "forudsaetning" && isDense(cov, isStr) && cov.length > 0) fail(`${id}: et forudsætnings-bid dækker ingen forpligtelser direkte`);
      if (kind === "effekt" && isDense(cov, isStr) && cov.length === 0) fail(`${id}: et effekt-bid skal dække ≥1 forpligtelse`);
      const asOid = own(b, "angrebs_spec_oid"); const asPath = own(b, "angrebs_spec_path");
      if (!isOid(asOid)) fail(`${id}: angrebs_spec_oid mangler/ugyldig (kill-list ikke bundet)`);
      else if (!isStr(asPath)) fail(`${id}: angrebs_spec_path mangler`);
      else pathBind({ path: asPath, oid: asOid }, `${id} angrebs-spec`);
      const baseOid = own(b, "base_oid");
      if (!isOid(baseOid)) fail(`${id}: base_oid mangler/ugyldig`);
      else if (gitObjectType(git, baseOid) !== "commit") fail(`${id}: base_oid er ikke en eksisterende commit`);
      else if (isOid(commitSha) && !isAncestor(git, baseOid, commitSha)) fail(`${id}: base_oid er ikke en ancestor af den gatede commit`);
      bidById.set(id, { kind, depends_on: isDense(dep, isStr) ? dep : [], covers: isDense(cov, isStr) ? cov : [], base_oid: baseOid });
    }
    const dependedOn = new Set();
    for (const [id, b] of bidById) for (const d of b.depends_on) { if (d === id) fail(`${id}: afhænger af sig selv`); else if (!bidById.has(d)) fail(`${id}: depends_on '${d}' findes ikke`); else dependedOn.add(d); }
    const color = new Map(); const dfs = (id, stack) => { if (color.get(id) === 2) return; if (color.get(id) === 1) { fail(`cyklisk afhængighed: ${[...stack, id].join(" → ")}`); return; } color.set(id, 1); for (const d of bidById.get(id)?.depends_on ?? []) if (bidById.has(d)) dfs(d, [...stack, id]); color.set(id, 2); };
    for (const id of bidById.keys()) dfs(id, []);
    for (const [id, b] of bidById) if (b.kind === "forudsaetning" && !dependedOn.has(id)) fail(`${id}: forudsætnings-bid som intet effekt-bid afhænger af`);
    const covered = new Map();
    for (const [id, b] of bidById) if (b.kind === "effekt") for (const o of b.covers) { if (!forventning.obligations.has(o)) fail(`${id}: covers '${o}' er ikke en forventet forpligtelse (rogue/overdraget/ukendt)`); else if (covered.has(o)) fail(`forpligtelse '${o}' dækkes af flere effekt-bids (${covered.get(o)}, ${id}) — én ejer`); else covered.set(o, id); }
    for (const [o, ob] of forventning.obligations) { if (!covered.has(o)) fail(`forpligtelse '${o}' dækkes af intet effekt-bid (udeladelse)`); else if (ob.effekt_bid && ob.effekt_bid !== covered.get(o)) fail(`forpligtelse '${o}': manifestet binder effekt_bid '${ob.effekt_bid}', men beviset dækker den i '${covered.get(o)}'`); }
  }

  // ---------- 3) cases: genudledt status · manifest-kontrakt · komplethed ----------
  const cases = own(proof, "cases"); const caseById = new Map();
  const coverage = new Map(); const negCovered = new Set(); const assertionCovered = new Set(); const casesByBid = new Map();
  const kontraktMatcher = (obsK, rc) => isPlain(obsK) && ["sqlstate", "grund", "afvisningssted", "aktoer"].every((k) => own(obsK, k) === rc[k]);
  if (!isDense(cases, isPlain) || cases.length === 0) fail("cases skal være et ikke-tomt, tæt array af objekter");
  else {
    for (const c of cases) {
      const cid = own(c, "case_id");
      if (!isStr(cid)) { fail("case uden gyldigt case_id"); continue; }
      if (caseById.has(cid)) { fail(`dublet case_id: ${cid}`); continue; }
      const oid = own(c, "obligation_id"); const form = own(c, "proof_form"); const status = own(c, "status"); const obs = own(c, "observations");
      const ob = forventning.obligations.get(oid); let okShape = true;
      if (!ob) { fail(`${cid}: obligation '${String(oid)}' er ikke forventet (rogue/overdraget/ukendt)`); okShape = false; }
      else if (!PROOF_FORMS.includes(form) || !ob.forms.has(form)) { fail(`${cid}: bevisform '${String(form)}' er ikke en af manifestets former for ${oid}`); okShape = false; }
      if (own(c, "run_id") !== runId) { fail(`${cid}: run_id ≠ kørslens run_id`); okShape = false; }
      const ep = own(c, "entrypoint");
      if (!isPlain(ep) || !PUBLIC_ENTRYPOINT_KINDS.includes(own(ep, "kind")) || !isStr(own(ep, "ref"))) { fail(`${cid}: entrypoint skal være {kind: api|rpc|ui-flow, ref}`); okShape = false; }
      if (!isStr(own(c, "actor_role"))) { fail(`${cid}: actor_role mangler`); okShape = false; }
      if (!HARD_EFFECTS.includes(own(c, "hard_effect"))) { fail(`${cid}: hard_effect skal være state|event|db-row`); okShape = false; }
      const bid = own(c, "bid_id"); const bb = isStr(bid) ? bidById.get(bid) : null;
      if (!bb) { fail(`${cid}: bid_id '${String(bid)}' findes ikke`); okShape = false; }
      else if (bb.kind !== "effekt") { fail(`${cid}: bid '${bid}' er et forudsætnings-bid`); okShape = false; }
      else if (ob && !bb.covers.includes(oid)) { fail(`${cid}: bid '${bid}' dækker ikke ${oid}`); okShape = false; }
      // negative_id KUN på UT (F-9)
      const nid = own(c, "negative_id");
      if (form !== "UT" && nid !== null && nid !== undefined) { fail(`${cid}: negative_id på ${form}-case (kun UT bærer negativer)`); okShape = false; }
      let neg = null;
      if (form === "UT" && ob) { neg = forventning.negatives.get(nid); if (!neg || neg.obligation_id !== oid) { fail(`${cid}: UT-case uden gyldigt negative_id under ${oid}`); okShape = false; } }
      // GENUDLED status/assertions fra rå observationer (F-3) og bind kontrakten til manifestet (F-4)
      if (!isPlain(obs)) { fail(`${cid}: observations mangler (rå observationer kræves)`); okShape = false; }
      else if (PROOF_FORMS.includes(form)) {
        const j = judgeObservations(form, obs);
        if (j.status !== STATUS.OPFYLDT) { fail(`${cid}: genudledt status '${j.status}' ≠ opfyldt (${j.assertions.filter((a) => !a.ok).map((a) => a.id + ": " + a.detail).join("; ")})`); okShape = false; }
        if (status !== j.status) { fail(`${cid}: selvrapporteret status '${String(status)}' ≠ genudledt '${j.status}'`); okShape = false; }
        if (safeCanon(own(c, "assertions")) !== safeCanon(j.assertions)) { fail(`${cid}: selvrapporterede assertions ≠ genudledte`); okShape = false; }
        if (neg) {
          const rc = neg.reject_contract;
          if (rc.kanal === "sqlstate" && !kontraktMatcher(own(obs, "kontrakt"), rc)) { fail(`${cid}: observationernes reject-kontrakt ≠ manifestets for ${nid} (sqlstate/grund/afvisningssted/aktoer)`); okShape = false; }
          if (rc.kanal === "exit" && !(isPlain(own(obs, "kontrakt")) && own(own(obs, "kontrakt"), "exit_code") === rc.exit_code && own(own(obs, "kontrakt"), "klasse") === rc.klasse)) { fail(`${cid}: exit-kontrakt ≠ manifestets`); okShape = false; }
        }
        if (form === "SA" && ob) {
          const rn = forventning.negatives.get(own(own(obs, "kontrakt"), "negative_id") ?? null);
          const rid = own(obs, "race_id");
          const saNeg = [...forventning.negatives.entries()].find(([, n]) => n.obligation_id === oid && kontraktMatcher({ ...own(obs, "kontrakt"), aktoer: n.reject_contract.aktoer }, n.reject_contract));
          if (!saNeg) { fail(`${cid}: SA-observationernes reject-kontrakt matcher intet negativ under ${oid}`); okShape = false; }
          void rn; if (isStr(rid) && okShape) assertionCovered.add(`${oid}|SA|${rid}`);
        }
        if (okShape) for (const a of j.assertions) { const m = a.id.match(/^(checkpoint|vidne):(.+)$/); if (m) assertionCovered.add(`${oid}|${form}|${m[2]}`); }
      }
      caseById.set(cid, { obligation_id: oid, form, k_id: ob?.k_id ?? null, ok: okShape, negative_id: form === "UT" ? nid ?? null : null, bid_id: bid });
      if (okShape) {
        if (!coverage.has(oid)) coverage.set(oid, new Set()); coverage.get(oid).add(form);
        if (form === "UT") negCovered.add(nid);
        if (!casesByBid.has(bid)) casesByBid.set(bid, new Set()); casesByBid.get(bid).add(oid);
      }
    }
    for (const [oid, ob] of forventning.obligations) {
      const got = coverage.get(oid) ?? new Set();
      for (const f of ob.forms) if (!got.has(f)) fail(`forpligtelse '${oid}': ingen opfyldt ${f}-case (udeladelse)`);
      for (const a of ob.assertions) if (!assertionCovered.has(`${oid}|${a.form}|${a.id}`)) fail(`forpligtelse '${oid}': navngivet ${a.form}-delbevis '${a.id}' ikke observeret opfyldt (F-2)`);
    }
    for (const nid of forventning.negatives.keys()) if (!negCovered.has(nid)) fail(`negativ '${nid}': ingen opfyldt UT-case bundet til det (D11)`);
    // D12 (F-10): hvert effekt-bid har ≥1 opfyldt case for HVER forpligtelse det dækker
    for (const [id, b] of bidById) if (b.kind === "effekt") for (const o of b.covers) if (!(casesByBid.get(id)?.has(o))) fail(`${id}: dækker '${o}' men har ingen opfyldt case for den (et bid uden cases beviser intet)`);
  }

  // ---------- 4) mutanter (D10): genudledt kill · målrettet · eneste-værn via UT · K-gulv ----------
  const mutants = hasOwn(proof, "mutants") ? own(proof, "mutants") : [];
  const killedByGuard = new Map(); const killedKs = new Set(); const goodMutants = [];
  const rejudge = (r, label) => {   // et indlejret delresultat skal selv være genudledeligt
    if (!isPlain(r) || !isStr(own(r, "case_id")) || !caseById.has(own(r, "case_id"))) { fail(`${label}: indlejret delresultat uden gyldig case_id`); return false; }
    const j = judgeObservations(own(r, "proof_form"), own(r, "observations"));
    if (j.status !== own(r, "status") || safeCanon(j.assertions) !== safeCanon(own(r, "assertions"))) { fail(`${label}: indlejret delresultat for ${own(r, "case_id")} er ikke genudledeligt (status/assertions ≠ observationer)`); return false; }
    return true;
  };
  if (!isDense(mutants, isPlain)) fail("mutants skal være et tæt array af objekter");
  else {
    const mids = new Set();
    for (const m of mutants) {
      const mid = own(m, "mutant_id");
      if (!isStr(mid)) { fail("mutant uden gyldigt mutant_id"); continue; }
      if (mids.has(mid)) { fail(`dublet mutant_id: ${mid}`); continue; } mids.add(mid);
      const g = own(m, "guard_ref"); const tc = own(m, "target_case_id"); const target = isStr(tc) ? caseById.get(tc) : null;
      if (!isStr(g) || !forventning.guards.has(g)) { fail(`${mid}: guard_ref '${String(g)}' er ikke et deklareret værn i manifestet`); continue; }
      if (!target || !target.ok) { fail(`${mid}: target_case_id '${String(tc)}' findes ikke / er ikke en gyldig opfyldt case`); continue; }
      if (own(m, "run_id") !== runId) { fail(`${mid}: run_id ≠ kørslens run_id`); continue; }
      if (!isStr(own(m, "target_assertion_id"))) { fail(`${mid}: target_assertion_id mangler (målrettet kill)`); continue; }
      // indlejrede rå delresultater: mål (baseline/under/clean) og kontroller — alle genudledelige og for de rigtige cases
      const under = own(m, "under"); const base = own(m, "baseline"); const clean = own(m, "clean");
      let embedOk = rejudge(base, `${mid}.baseline`) && rejudge(under, `${mid}.under`) && isPlain(clean) && rejudge(own(clean, "target"), `${mid}.clean.target`);
      for (const r of [base, under, isPlain(clean) ? own(clean, "target") : null]) if (isPlain(r) && own(r, "case_id") !== tc) { fail(`${mid}: indlejret målresultat er for en anden case end target_case_id`); embedOk = false; }
      for (const [lab, arr] of [["controls_baseline", own(m, "controls_baseline")], ["controls_under", own(m, "controls_under")], ["clean.controls", isPlain(clean) ? own(clean, "controls") : null]]) {
        if (!isDense(arr, isPlain) || arr.length === 0) { fail(`${mid}: ${lab} mangler/tomt (≥1 nødvendig kontrol kræves)`); embedOk = false; continue; }
        for (const r of arr) { if (!rejudge(r, `${mid}.${lab}`)) embedOk = false; else if (own(r, "case_id") === tc) { fail(`${mid}: kontrol == mål`); embedOk = false; } }
      }
      if (!embedOk) continue;
      const j = judgeKill(m);
      if (!j.killed || !j.restored || !j.cleanAfter) { fail(`${mid}: genudledt kill fejler — ${j.why}${j.restored ? "" : " · ikke restored"}${j.cleanAfter ? "" : " · ikke ren efter"}`); continue; }
      if (!ownTrue(m, "killed") || !ownTrue(m, "restored") || !ownTrue(m, "cleanAfter") || own(m, "break_form") !== target.form) { fail(`${mid}: selvrapporterede kill-flag/break_form ≠ genudledt (${target.form})`); continue; }
      if (!killedByGuard.has(g)) killedByGuard.set(g, []); killedByGuard.get(g).push({ mid, form: target.form, negative_id: target.negative_id, obligation_id: target.obligation_id });
      if (target.k_id) killedKs.add(target.k_id); goodMutants.push(mid);
    }
    for (const [g, nids] of forventning.soleGuards) {
      const kills = killedByGuard.get(g) ?? [];
      for (const nid of nids) if (!kills.some((k) => k.form === "UT" && k.negative_id === nid)) fail(`D10: negativ '${nid}' bæres alene af værnet '${g}' men ingen dræbt mutant på det værn rammer UT-casen for netop det negativ`);
    }
    for (const k of forventning.ks) if (!killedKs.has(k)) fail(`K '${k}' mangler ≥1 dræbt targeted mutant (mutant-kill-gulv brudt)`);
  }

  // ---------- 5) engine.summary genudledes ----------
  if (isPlain(engine) && isDense(cases ?? [], isPlain) && isDense(mutants ?? [], isPlain)) {
    const derived = summarize(cases, mutants);
    if (safeCanon(own(engine, "summary")) !== safeCanon(derived)) fail(`engine.summary ≠ genudledt (${safeCanon(derived)})`);
    if (derived.brudt !== 0 || derived.protokol_fejl !== 0 || derived.draebt !== derived.mutanter) fail("kørslen indeholder brudte/protokol-fejlede cases eller ikke-dræbte mutanter");
  }

  // ---------- 6) claim_graph: bundet til case-/mutant-id'er + git-ankre ----------
  const cg = own(proof, "claim_graph");
  if (!isDense(cg, isPlain) || cg.length === 0) fail("claim_graph skal være et ikke-tomt, tæt array (den git-forankrede kerne må ikke droppes)");
  else for (let i = 0; i < cg.length; i++) {
    const c = cg[i]; const kId = own(c, "k_id");
    if (!isStr(kId) || !forventning.ks.has(kId)) fail(`claim_graph[${i}]: ukendt/manglende K`);
    const cids = own(c, "case_ids"); const mids2 = own(c, "mutant_ids");
    if (!isDense(cids, isStr) || cids.length === 0 || !cids.every((x) => caseById.get(x)?.ok && caseById.get(x)?.k_id === kId)) fail(`claim_graph[${i}] (${String(kId)}): case_ids skal være ≥1 opfyldte cases for netop dette K`);
    if (!isDense(mids2, isStr) || mids2.length === 0 || !mids2.every((x) => goodMutants.includes(x))) fail(`claim_graph[${i}] (${String(kId)}): mutant_ids skal være ≥1 dræbte mutanter`);
    const anchor = own(c, "source_anchor");
    if (!isPlain(anchor)) { fail(`claim_graph[${i}] (${String(kId)}): source_anchor mangler`); continue; }
    const ev = verifyEvidence(anchor, snapshot, { git });
    if (!ev.ok) fail(`claim_graph[${i}] (${String(kId)}): source-anker ikke git-verificeret — ${ev.reasons.join("; ")}`);
  }

  // ---------- 7) async-reviews: PASS pr. bid bundet til base_oid ----------
  const reviewed = new Map(); const reviews = own(proof, "async_reviews");
  if (!isDense(reviews, isPlain)) fail("async_reviews skal være et tæt array af objekter (manglende = anti-tavshed rød)");
  else for (const r of reviews) {
    const rbid = own(r, "bid_id");
    if (!isStr(rbid) || !bidById.has(rbid)) { fail(`async_review for ukendt bid '${String(rbid)}'`); continue; }
    if (own(r, "conclusion") !== "PASS") { fail(`async_review for ${rbid} ikke PASS`); continue; }
    if (!isOid(own(r, "base_oid"))) { fail(`async_review for ${rbid}: base_oid mangler/ugyldig`); continue; }
    reviewed.set(rbid, own(r, "base_oid"));
  }
  for (const [id, b] of bidById) { if (!reviewed.has(id)) fail(`bid '${id}' mangler et PASS async-review (anti-tavshed)`); else if (isOid(b.base_oid) && reviewed.get(id) !== b.base_oid) fail(`bid '${id}': async-review base_oid matcher ikke bid'ets base_oid (stale review)`); }

  // ---------- 8) prover grøn ----------
  const pr = own(proof, "prover_result");
  if (!isPlain(pr)) fail("prover_result mangler/er ikke et objekt");
  else { if (!ownTrue(pr, "ok")) fail("prover_result.ok ikke eksplicit true (prover ikke grøn)"); const tr = own(pr, "tests_run"); if (!isPosInt(tr) || tr === 0) fail("prover_result.tests_run = 0 eller ugyldig (0-tests = rød)"); const sk = own(pr, "skipped"); if (!isPosInt(sk) || sk !== 0) fail("prover_result.skipped ≠ 0 (skippede tests = rød)"); }
  return { ok: reasons.length === 0, reasons };
}
