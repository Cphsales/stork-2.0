#!/usr/bin/env node
// angrebs-spec.mjs — den MASKINLÆSBARE angrebs-/måle-spec v2.3 (M-41 Trin C1/C2 · Codex C1-r2 F-13/F-16/F-18 · C1-r3 F-24/F-26): HVAD der måles, HVORDAN,
// med hvilke orakler, kontroller og mutanter — låst FØR byg (plan 2.E attack-spec-state-machine · Fase 4 pkt. 1), path-bundet som
// build-gate-binding (gates.mjs `angrebsspec`, layout plan-build/<pakke>/angrebs-spec.json). Bevisproducenten leverer kun
// OBSERVATIONER; verifieren dømmer dem mod DENNE spec + manifestet — orakler, kontroller, mutationslocus og bid-graf kan ikke
// vælges af buildet.
//
//   spec = { schema_version: 1, pakke,
//     bindings: { manifest: {path, oid}, plan: {path, oid} },
//     bids:    [{ bid_id, kind: "forudsaetning"|"effekt", depends_on: [bid_id], covers: [obligation_id] }],   // den låste D12-graf
//     cases:   [ case-spec som build-harness.runCase forbruger (case_id · obligation_id · proof_form · bid_id · hard_effect ·
//                entrypoint · actor · fase · setup? · UT: positive/negative/state | check · FS: action?/observe/expect/checkpoints[{id,…}]
//                · MH: action/witnesses[{id,…}] · SA: race{race_id,a,b,barrier,invariant,reject_negative_id}) ],
//     mutants: [{ mutant_id, guard_ref, target_case_id, target_assertion_id, controls: [case_id…] (≥1), apply, restore,
//                 footprint: { observe: {sql} } }] }   // footprint = ejer-observation af det muterede objekt (attesterer mutation + restore)
// validateAngrebsSpec(spec, manifest) → {ok, reasons}: form, krydsreferencer og KOMPLETHED mod manifestet (pr. form · negativ ·
// navngivet delbevis · bid) og D10 (eneste-værn → mutant på UT-casen for netop det negativ) + K-gulv. Fase + aktør bindes til
// kontrakten i ALLE varianter (UT-sqlstate · UT-exit · SA, F-24). case_id og mutant_id deler ÉT entydigt id-rum (F-26).

import { expectedSet, validateManifest, PROOF_FORMS } from "./forventnings-manifest.mjs";

export const HARD_EFFECTS = Object.freeze(["state", "event", "db-row"]);
export const PUBLIC_ENTRYPOINT_KINDS = Object.freeze(["api", "rpc", "ui-flow"]);
const EXPECT_KINDS = Object.freeze(["rows", "count", "scalar", "empty", "null"]);
const ID_RE = /^[a-z0-9][a-z0-9._:-]{0,79}$/;
const OID_RE = /^[0-9a-f]{40}$/;
const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const own = (o, k) => { if (o === null || typeof o !== "object") return undefined; const d = Object.getOwnPropertyDescriptor(o, k); return d && typeof d.get !== "function" && typeof d.set !== "function" ? d.value : undefined; };
const isPlain = (v) => { if (v === null || typeof v !== "object" || Array.isArray(v)) return false; const p = Object.getPrototypeOf(v); return p === Object.prototype || p === null; };
const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const isDense = (a, pred = () => true) => {
  if (!Array.isArray(a) || Object.getPrototypeOf(a) !== Array.prototype) return false;
  const len = a.length;
  for (const k of Reflect.ownKeys(a)) { if (typeof k === "symbol") return false; if (k === "length") continue; const idx = Number(k); if (!Number.isInteger(idx) || idx < 0 || idx >= len || String(idx) !== k) return false; const d = Object.getOwnPropertyDescriptor(a, k); if (!d || typeof d.get === "function" || typeof d.set === "function" || !d.enumerable) return false; }
  for (let i = 0; i < len; i++) if (!hasOwn(a, i) || !pred(a[i])) return false;
  return true;
};
const sqlObj = (v) => isPlain(v) && isStr(own(v, "sql"));
const expectOk = (e) => { if (!isPlain(e) || !EXPECT_KINDS.includes(own(e, "kind"))) return false; const k = own(e, "kind"); if (k === "empty" || k === "null") return true; if (!hasOwn(e, "value")) return false; if (k === "count") return Number.isInteger(own(e, "value")) && own(e, "value") >= 0; if (k === "rows") return isDense(own(e, "value"), isPlain); return own(e, "value") !== undefined && !(typeof own(e, "value") === "number" && !Number.isFinite(own(e, "value"))); };

export function validateAngrebsSpec(spec, manifest) {
  const reasons = []; const fail = (r) => reasons.push(r);
  if (!isPlain(spec)) return { ok: false, reasons: ["angrebs-spec er ikke et plain object"] };
  const mv = validateManifest(manifest); if (!mv.ok) return { ok: false, reasons: ["manifestet er ugyldigt: " + mv.reasons.join("; ")] };
  const F = expectedSet(manifest);
  if (own(spec, "schema_version") !== 1) fail("schema_version ≠ 1");
  if (own(spec, "pakke") !== manifest.pakke) fail("pakke ≠ manifestets pakke");
  const b = own(spec, "bindings");
  if (!isPlain(b)) fail("bindings mangler");
  else for (const k of ["manifest", "plan"]) { const r = own(b, k); if (!isPlain(r) || !isStr(own(r, "path")) || !OID_RE.test(String(own(r, "oid")))) fail(`bindings.${k} skal være {path, oid}`); }
  if (isPlain(b) && isPlain(own(b, "plan")) && own(own(b, "plan"), "oid") !== manifest.bindings.plan.oid) fail("bindings.plan ≠ manifestets plan-binding");

  // ---- bids (D12-grafen) ----
  const bids = own(spec, "bids"); const bidById = new Map(); const coveredBy = new Map();
  if (!isDense(bids, isPlain) || bids.length === 0) fail("bids skal være et ikke-tomt, tæt array");
  else {
    for (const x of bids) {
      const id = own(x, "bid_id"); const kind = own(x, "kind"); const dep = own(x, "depends_on"); const cov = own(x, "covers");
      if (!isStr(id) || !ID_RE.test(id)) { fail(`bid uden gyldigt bid_id: ${String(id)}`); continue; }
      if (bidById.has(id)) { fail(`dublet bid_id ${id}`); continue; }
      if (kind !== "forudsaetning" && kind !== "effekt") fail(`${id}: kind skal være forudsaetning|effekt`);
      if (!isDense(dep, isStr)) fail(`${id}: depends_on skal være tæt array`);
      if (!isDense(cov, isStr)) fail(`${id}: covers skal være tæt array`);
      if (kind === "forudsaetning" && isDense(cov, isStr) && cov.length) fail(`${id}: forudsætning dækker ikke forpligtelser direkte`);
      if (kind === "effekt" && isDense(cov, isStr) && !cov.length) fail(`${id}: effekt-bid skal dække ≥1 forpligtelse`);
      bidById.set(id, { kind, depends_on: isDense(dep, isStr) ? dep : [], covers: isDense(cov, isStr) ? cov : [] });
    }
    const dependedOn = new Set();
    for (const [id, x] of bidById) for (const d of x.depends_on) { if (d === id) fail(`${id}: afhænger af sig selv`); else if (!bidById.has(d)) fail(`${id}: depends_on '${d}' findes ikke`); else dependedOn.add(d); }
    const color = new Map(); const dfs = (id, st) => { if (color.get(id) === 2) return; if (color.get(id) === 1) { fail(`cyklisk afhængighed: ${[...st, id].join(" → ")}`); return; } color.set(id, 1); for (const d of bidById.get(id)?.depends_on ?? []) if (bidById.has(d)) dfs(d, [...st, id]); color.set(id, 2); };
    for (const id of bidById.keys()) dfs(id, []);
    for (const [id, x] of bidById) if (x.kind === "forudsaetning" && !dependedOn.has(id)) fail(`${id}: forudsætning som intet effekt-bid afhænger af`);
    const covered = new Map();
    for (const [id, x] of bidById) if (x.kind === "effekt") for (const o of x.covers) { if (!F.obligations.has(o)) fail(`${id}: covers '${o}' er ikke forventet`); else if (covered.has(o)) fail(`'${o}' dækkes af flere bids`); else covered.set(o, id); }
    for (const [o, ob] of F.obligations) { if (!covered.has(o)) fail(`forpligtelse '${o}' dækkes af intet effekt-bid`); else if (ob.effekt_bid && ob.effekt_bid !== covered.get(o)) fail(`'${o}': manifestet binder effekt_bid '${ob.effekt_bid}' ≠ '${covered.get(o)}'`); }
    for (const [o, id] of covered) coveredBy.set(o, id);
  }

  // ---- cases ----
  const cases = own(spec, "cases"); const caseById = new Map(); const cov = new Map(); const negCov = new Set(); const assertCov = new Set(); const casesByBid = new Map();
  if (!isDense(cases, isPlain) || cases.length === 0) fail("cases skal være et ikke-tomt, tæt array");
  else for (const c of cases) {
    const cid = own(c, "case_id"); if (!isStr(cid) || !ID_RE.test(cid)) { fail(`case uden gyldigt case_id: ${String(cid)}`); continue; }
    if (caseById.has(cid)) { fail(`dublet case_id ${cid}`); continue; }
    const oid = own(c, "obligation_id"); const form = own(c, "proof_form"); const ob = F.obligations.get(oid); let okc = true;
    if (!ob) { fail(`${cid}: obligation '${String(oid)}' er ikke forventet`); okc = false; }
    else if (!PROOF_FORMS.includes(form) || !ob.forms.has(form)) { fail(`${cid}: form '${String(form)}' ikke i manifestets former for ${oid}`); okc = false; }
    const bid = own(c, "bid_id"); if (!isStr(bid) || !bidById.has(bid) || bidById.get(bid).kind !== "effekt" || (ob && coveredBy.get(oid) !== bid)) { fail(`${cid}: bid_id '${String(bid)}' er ikke det effekt-bid der dækker ${String(oid)}`); okc = false; }
    if (!HARD_EFFECTS.includes(own(c, "hard_effect"))) { fail(`${cid}: hard_effect ugyldig`); okc = false; }
    const ep = own(c, "entrypoint"); if (!isPlain(ep) || !PUBLIC_ENTRYPOINT_KINDS.includes(own(ep, "kind")) || !isStr(own(ep, "ref"))) { fail(`${cid}: entrypoint ugyldig`); okc = false; }
    const actor = own(c, "actor"); if (!isPlain(actor) || !isStr(own(actor, "role"))) { fail(`${cid}: actor.role kræves`); okc = false; }
    if (hasOwn(c, "setup") && !sqlObj(own(c, "setup"))) { fail(`${cid}: setup skal være {sql}`); okc = false; }
    const nid = own(c, "negative_id");
    if (form !== "UT" && nid !== undefined && nid !== null) { fail(`${cid}: negative_id kun på UT`); okc = false; }
    if (form === "UT" && ob) {
      const neg = F.negatives.get(nid);
      if (!neg || neg.obligation_id !== oid) { fail(`${cid}: negative_id '${String(nid)}' er ikke et negativ under ${oid}`); okc = false; }
      else {
        const rc = neg.reject_contract;
        if (rc.kanal === "sqlstate") {
          for (const k of ["positive", "negative", "state"]) if (!sqlObj(own(c, k))) { fail(`${cid}: UT (sqlstate) kræver ${k}{sql}`); okc = false; }
          if (hasOwn(c, "check")) { fail(`${cid}: check hører til exit-kanalen — blandet variant afvises`); okc = false; }
          if (own(c, "fase") !== rc.fase) { fail(`${cid}: fase '${String(own(c, "fase"))}' ≠ kontraktens '${rc.fase}'`); okc = false; }
          if (isPlain(actor) && own(actor, "role") !== rc.aktoer) { fail(`${cid}: actor.role '${String(own(actor, "role"))}' ≠ kontraktens aktør '${rc.aktoer}'`); okc = false; }
        } else {
          if (!isPlain(own(c, "check")) || !isDense(own(own(c, "check"), "cmd"), isStr) || own(own(c, "check"), "cmd").length === 0) { fail(`${cid}: UT (exit) kræver check.cmd[]`); okc = false; }
          for (const k of ["positive", "negative", "state"]) if (hasOwn(c, k)) { fail(`${cid}: ${k} hører til sqlstate-kanalen — blandet variant afvises`); okc = false; }
          if (own(c, "fase") !== rc.fase) { fail(`${cid}: fase '${String(own(c, "fase"))}' ≠ kontraktens '${rc.fase}' (exit-kanal, F-24)`); okc = false; }
          if (isPlain(actor) && own(actor, "role") !== rc.aktoer) { fail(`${cid}: actor.role '${String(own(actor, "role"))}' ≠ kontraktens aktør '${rc.aktoer}' (exit-kanal, F-24)`); okc = false; }
        }
        if (okc) negCov.add(nid);
      }
    }
    if (form === "FS") { if (!sqlObj(own(c, "observe")) || !expectOk(own(c, "expect"))) { fail(`${cid}: FS kræver observe{sql} + gyldig expect`); okc = false; } if (hasOwn(c, "action") && !sqlObj(own(c, "action"))) { fail(`${cid}: action skal være {sql}`); okc = false; }
      const cps = hasOwn(c, "checkpoints") ? own(c, "checkpoints") : []; if (!isDense(cps, isPlain)) { fail(`${cid}: checkpoints skal være tæt array`); okc = false; } else { const seen = new Set(); for (const cp of cps) { const id = own(cp, "id"); if (!isStr(id) || !ID_RE.test(id) || seen.has(id) || !sqlObj(own(cp, "observe")) || !expectOk(own(cp, "expect"))) { fail(`${cid}: checkpoint ugyldigt/dublet`); okc = false; } else { seen.add(id); if (okc && ob) assertCov.add(`${oid}|FS|${id}`); } } } }
    if (form === "MH") { const w = own(c, "witnesses"); if (!sqlObj(own(c, "action")) || !isDense(w, isPlain) || w.length === 0) { fail(`${cid}: MH kræver action{sql} + ≥1 witnesses`); okc = false; } else { const seen = new Set(); for (const x of w) { const id = own(x, "id"); if (!isStr(id) || !ID_RE.test(id) || seen.has(id) || !sqlObj(own(x, "observe")) || !expectOk(own(x, "expect"))) { fail(`${cid}: vidne ugyldigt/dublet`); okc = false; } else { seen.add(id); if (okc && ob) assertCov.add(`${oid}|MH|${id}`); } } } }
    if (form === "SA") { const r = own(c, "race"); if (!isPlain(r) || !isStr(own(r, "race_id")) || !ID_RE.test(own(r, "race_id")) || !sqlObj(own(r, "a")) || !sqlObj(own(r, "b")) || !isStr(own(r, "barrier")) || !isPlain(own(r, "invariant")) || !sqlObj(own(own(r, "invariant"), "observe")) || !expectOk(own(own(r, "invariant"), "expect"))) { fail(`${cid}: race ufuldstændig`); okc = false; }
      else { const rn = F.negatives.get(own(r, "reject_negative_id")); if (!rn || rn.obligation_id !== oid || rn.reject_contract.kanal !== "sqlstate") { fail(`${cid}: race.reject_negative_id er ikke et sqlstate-negativ under ${oid}`); okc = false; } else { if (isPlain(actor) && own(actor, "role") !== rn.reject_contract.aktoer) { fail(`${cid}: SA actor.role ≠ kontraktens aktør`); okc = false; } if (own(c, "fase") !== rn.reject_contract.fase) { fail(`${cid}: SA fase '${String(own(c, "fase"))}' ≠ kontraktens '${rn.reject_contract.fase}' (F-24)`); okc = false; } } if (hasOwn(r, "setup") && !sqlObj(own(r, "setup"))) { fail(`${cid}: race.setup skal være {sql}`); okc = false; } if (okc && ob) assertCov.add(`${oid}|SA|${own(r, "race_id")}`); } }
    caseById.set(cid, { obligation_id: oid, form, k_id: ob?.k_id ?? null, ok: okc, negative_id: form === "UT" ? nid : null, bid_id: bid });
    if (okc) { if (!cov.has(oid)) cov.set(oid, new Set()); cov.get(oid).add(form); if (!casesByBid.has(bid)) casesByBid.set(bid, new Set()); casesByBid.get(bid).add(oid); }
  }
  // ---- komplethed mod manifestet ----
  for (const [oid, ob] of F.obligations) {
    const got = cov.get(oid) ?? new Set();
    for (const f of ob.forms) if (!got.has(f)) fail(`'${oid}': ingen ${f}-case i spec'en (udeladelse)`);
    for (const a of ob.assertions) if (!assertCov.has(`${oid}|${a.form}|${a.id}`)) fail(`'${oid}': navngivet ${a.form}-delbevis '${a.id}' har ingen case (F-2)`);
  }
  for (const nid of F.negatives.keys()) if (!negCov.has(nid)) fail(`negativ '${nid}': ingen UT-case`);
  for (const [id, x] of bidById) if (x.kind === "effekt") for (const o of x.covers) if (!casesByBid.get(id)?.has(o)) fail(`${id}: dækker '${o}' uden case`);

  // ---- mutanter ----
  const mutants = own(spec, "mutants"); const mutById = new Map(); const killsByGuard = new Map(); const ksWithMutant = new Set();
  if (!isDense(mutants, isPlain)) fail("mutants skal være et tæt array");
  else for (const m of mutants) {
    const mid = own(m, "mutant_id"); if (!isStr(mid) || !ID_RE.test(mid)) { fail(`mutant uden gyldigt mutant_id`); continue; }
    if (mutById.has(mid)) { fail(`dublet mutant_id ${mid}`); continue; }
    if (caseById.has(mid)) { fail(`mutant_id '${mid}' kolliderer med et case_id — ét entydigt id-rum for alle delbeviser (F-26)`); continue; }
    const g = own(m, "guard_ref"); const t = caseById.get(own(m, "target_case_id")); const ta = own(m, "target_assertion_id"); const ctl = own(m, "controls"); let okm = true;
    if (!isStr(g) || !F.guards.has(g)) { fail(`${mid}: guard_ref '${String(g)}' ikke deklareret i manifestet`); okm = false; }
    if (!t || !t.ok) { fail(`${mid}: target_case_id ukendt/ugyldig`); okm = false; }
    if (!isStr(ta) || !/^[a-z0-9][a-z0-9._:-]*$/.test(ta)) { fail(`${mid}: target_assertion_id mangler`); okm = false; }
    if (!isDense(ctl, isStr) || ctl.length === 0 || ctl.some((x) => !caseById.has(x) || x === own(m, "target_case_id")) || new Set(ctl).size !== ctl.length) { fail(`${mid}: controls skal være ≥1 eksisterende, distinkte case_ids ≠ target`); okm = false; }
    if (!isStr(own(m, "apply")) || !isStr(own(m, "restore"))) { fail(`${mid}: apply/restore kræves`); okm = false; }
    const fp = own(m, "footprint"); if (!isPlain(fp) || !sqlObj(own(fp, "observe"))) { fail(`${mid}: footprint.observe{sql} kræves (attesterer mutation + restore)`); okm = false; }
    mutById.set(mid, { guard_ref: g, target: own(m, "target_case_id"), ok: okm });
    if (okm && t) { if (!killsByGuard.has(g)) killsByGuard.set(g, []); killsByGuard.get(g).push({ form: t.form, negative_id: t.negative_id }); if (t.k_id) ksWithMutant.add(t.k_id); }
  }
  for (const [g, nids] of F.soleGuards) for (const nid of nids) if (!(killsByGuard.get(g) ?? []).some((k) => k.form === "UT" && k.negative_id === nid)) fail(`D10: negativ '${nid}' bæres alene af '${g}' men ingen mutant på det værn rammer UT-casen for netop det negativ`);
  for (const k of F.ks) if (!ksWithMutant.has(k)) fail(`K '${k}' har ingen mutant (mutant-kill-gulv)`);
  return { ok: reasons.length === 0, reasons };
}
