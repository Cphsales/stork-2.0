#!/usr/bin/env node
// angrebs-indeks.mjs — validator for angrebs-spec.json SKEMA 2 = INDEKS over Codex-skrevne test-filer + mutanter (kursændring 2026-09-21).
// Erstatter DSL-validatoren (angrebs-spec.mjs skema 1) som build-gatens spec-dommer. Komplethed mod manifestet:
//   hver forpligtelse×form  ← ≥1 test m. covers "<oid>:<FORM>"        hvert negativ ← ≥1 test m. covers "<nid>"
//   hvert navngivet delbevis ← ≥1 test m. covers "<oid>|<delbevis-id>"  bids = den låste D12-graf (covers = manifestets effekt_bid)
//   D10: hvert eneste-værn g → en mutant m. guard_ref g hvis target_test_ids dækker en test der covers netop det negativ (SA-tests tæller)
//   K-gulv: hvert K → ≥1 mutant hvis targets dækker en test på en af K's forpligtelser
// Tests: id entydige · file under scripts/v5/<pakke>/tests/ · oid (blob) · covers kun manifest-kendte referencer. Mutanter: guard_ref
// deklareret · apply/restore ikke-tomme · target_test_ids ≥1 · control_test_ids ≥1, alle kendte og disjunkte fra targets.
import { expectedSet, validateManifest, PROOF_FORMS } from "./forventnings-manifest.mjs";

const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const own = (o, k) => { if (o === null || typeof o !== "object") return undefined; const d = Object.getOwnPropertyDescriptor(o, k); return d && typeof d.get !== "function" && typeof d.set !== "function" ? d.value : undefined; };
const isPlain = (v) => { if (v === null || typeof v !== "object" || Array.isArray(v)) return false; const p = Object.getPrototypeOf(v); return p === Object.prototype || p === null; };
const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const isDense = (a, pred = () => true) => { if (!Array.isArray(a) || Object.getPrototypeOf(a) !== Array.prototype) return false; for (let i = 0; i < a.length; i++) if (!hasOwn(a, i) || !pred(a[i])) return false; return true; };
const ID_RE = /^[a-z0-9][a-z0-9._:-]{0,99}$/; const OID_RE = /^[0-9a-f]{40}$/;

export function validateAngrebsIndeks(idx, manifest) {
  const reasons = []; const fail = (r) => reasons.push(r);
  if (!isPlain(idx)) return { ok: false, reasons: ["indekset er ikke et plain object"] };
  const mv = validateManifest(manifest); if (!mv.ok) return { ok: false, reasons: ["manifestet er ugyldigt: " + mv.reasons.join("; ")] };
  const F = expectedSet(manifest);
  if (own(idx, "schema_version") !== 2) fail("schema_version ≠ 2 (indeks over test-filer)");
  if (own(idx, "pakke") !== manifest.pakke) fail("pakke ≠ manifestets pakke");
  const b = own(idx, "bindings");
  if (!isPlain(b)) fail("bindings mangler"); else for (const k of ["manifest", "plan"]) { const r = own(b, k); if (!isPlain(r) || !isStr(own(r, "path")) || !OID_RE.test(String(own(r, "oid")))) fail(`bindings.${k} skal være {path, oid}`); }
  if (isPlain(b) && isPlain(own(b, "plan")) && own(own(b, "plan"), "oid") !== manifest.bindings.plan.oid) fail("bindings.plan ≠ manifestets plan-binding");

  // ---- bids (D12) — uændret fra skema 1 ----
  const bids = own(idx, "bids"); const bidById = new Map();
  if (!isDense(bids, isPlain) || bids.length === 0) fail("bids skal være et ikke-tomt, tæt array");
  else {
    for (const x of bids) { const id = own(x, "bid_id"); if (!isStr(id) || !ID_RE.test(id)) { fail(`bid uden gyldigt bid_id`); continue; } if (bidById.has(id)) { fail(`dublet bid_id ${id}`); continue; } const kind = own(x, "kind"); if (kind !== "forudsaetning" && kind !== "effekt") fail(`${id}: kind skal være forudsaetning|effekt`); bidById.set(id, { kind, depends_on: isDense(own(x, "depends_on"), isStr) ? own(x, "depends_on") : [], covers: isDense(own(x, "covers"), isStr) ? own(x, "covers") : [] }); if (kind === "forudsaetning" && bidById.get(id).covers.length) fail(`${id}: forudsætning dækker ikke forpligtelser`); if (kind === "effekt" && !bidById.get(id).covers.length) fail(`${id}: effekt-bid skal dække ≥1 forpligtelse`); }
    const dependedOn = new Set(); for (const [id, x] of bidById) for (const d of x.depends_on) { if (d === id) fail(`${id}: afhænger af sig selv`); else if (!bidById.has(d)) fail(`${id}: depends_on '${d}' findes ikke`); else dependedOn.add(d); }
    const color = new Map(); const dfs = (id, st) => { if (color.get(id) === 2) return; if (color.get(id) === 1) { fail(`cyklisk afhængighed: ${[...st, id].join(" → ")}`); return; } color.set(id, 1); for (const d of bidById.get(id)?.depends_on ?? []) if (bidById.has(d)) dfs(d, [...st, id]); color.set(id, 2); }; for (const id of bidById.keys()) dfs(id, []);
    for (const [id, x] of bidById) if (x.kind === "forudsaetning" && !dependedOn.has(id)) fail(`${id}: forudsætning som intet effekt-bid afhænger af`);
    const covered = new Map(); for (const [id, x] of bidById) if (x.kind === "effekt") for (const o of x.covers) { if (!F.obligations.has(o)) fail(`${id}: covers '${o}' er ikke forventet`); else if (covered.has(o)) fail(`'${o}' dækkes af flere bids`); else covered.set(o, id); }
    for (const [o, ob] of F.obligations) { if (!covered.has(o)) fail(`forpligtelse '${o}' dækkes af intet effekt-bid`); else if (ob.effekt_bid && ob.effekt_bid !== covered.get(o)) fail(`'${o}': manifestet binder effekt_bid '${ob.effekt_bid}' ≠ '${covered.get(o)}'`); }
  }

  // ---- tests ----
  const tests = own(idx, "tests"); const testById = new Map(); const formCov = new Set(); const negCov = new Map(); const assertCov = new Set(); const obCov = new Map();
  if (!isDense(tests, isPlain) || tests.length === 0) fail("tests skal være et ikke-tomt, tæt array");
  else for (const t of tests) {
    const id = own(t, "id"); if (!isStr(id) || !ID_RE.test(id)) { fail(`test uden gyldigt id`); continue; } if (testById.has(id)) { fail(`dublet test-id ${id}`); continue; }
    const file = own(t, "file"); if (!isStr(file) || !file.startsWith(`scripts/v5/${manifest.pakke}/tests/`) || !/\.test\.mjs$/.test(file) || file.includes("..")) fail(`${id}: file skal ligge under scripts/v5/${manifest.pakke}/tests/ og hedde *.test.mjs`);
    if (!OID_RE.test(String(own(t, "oid")))) fail(`${id}: oid (blob af testfilen) mangler`);
    const cov = own(t, "covers"); if (!isDense(cov, isStr) || cov.length === 0) { fail(`${id}: covers skal være et ikke-tomt array`); testById.set(id, { covers: [] }); continue; }
    const cs = []; for (const c of cov) {
      let m;
      if ((m = c.match(/^(.+):(UT|FS|MH|SA)$/)) && F.obligations.has(m[1])) { if (!F.obligations.get(m[1]).forms.has(m[2])) fail(`${id}: covers '${c}' — formen er ikke manifestets for ${m[1]}`); else { formCov.add(c); cs.push({ oid: m[1] }); } }
      else if (F.negatives.has(c)) { negCov.set(c, [...(negCov.get(c) ?? []), id]); cs.push({ oid: F.negatives.get(c).obligation_id, nid: c }); }
      else if ((m = c.match(/^(.+)\|(.+)$/)) && F.obligations.has(m[1])) { if (!F.obligations.get(m[1]).assertions.some((a) => a.id === m[2])) fail(`${id}: covers '${c}' — ukendt delbevis`); else { assertCov.add(c); cs.push({ oid: m[1] }); } }
      else fail(`${id}: covers '${c}' er ikke en manifest-reference (<oid>:<FORM> · <negativ-id> · <oid>|<delbevis-id>)`);
    }
    testById.set(id, { covers: cs });
    for (const x of cs) { if (!obCov.has(x.oid)) obCov.set(x.oid, new Set()); obCov.get(x.oid).add(id); }
  }
  for (const [oid, ob] of F.obligations) { for (const f of ob.forms) if (!formCov.has(`${oid}:${f}`)) fail(`'${oid}': ingen test dækker formen ${f} (covers "${oid}:${f}")`); for (const a of ob.assertions) if (!assertCov.has(`${oid}|${a.id}`)) fail(`'${oid}': delbeviset '${a.id}' er ikke dækket (covers "${oid}|${a.id}")`); }
  for (const nid of F.negatives.keys()) if (!negCov.has(nid)) fail(`negativ '${nid}': ingen test dækker det`);

  // ---- mutanter ----
  const mutants = own(idx, "mutants"); const killsByGuard = new Map(); const ksWithMutant = new Set(); const mutIds = new Set();
  if (!isDense(mutants, isPlain)) fail("mutants skal være et tæt array");
  else for (const m of mutants) {
    const mid = own(m, "mutant_id"); if (!isStr(mid) || !ID_RE.test(mid)) { fail("mutant uden gyldigt mutant_id"); continue; } if (mutIds.has(mid) || testById.has(mid)) { fail(`mutant_id ${mid} dublet/kolliderer m. test-id`); continue; } mutIds.add(mid);
    const g = own(m, "guard_ref"); if (!isStr(g) || !F.guards.has(g)) fail(`${mid}: guard_ref '${String(g)}' ikke deklareret i manifestet`);
    if (!isStr(own(m, "apply")) || !isStr(own(m, "restore"))) fail(`${mid}: apply/restore kræves`);
    const tg = own(m, "target_test_ids"), ct = own(m, "control_test_ids");
    if (!isDense(tg, isStr) || tg.length === 0 || tg.some((x) => !testById.has(x))) fail(`${mid}: target_test_ids skal være ≥1 kendte test-id'er`);
    if (!isDense(ct, isStr) || ct.length === 0 || ct.some((x) => !testById.has(x) || (isDense(tg, isStr) && tg.includes(x)))) fail(`${mid}: control_test_ids skal være ≥1 kendte test-id'er disjunkte fra targets`);
    if (isStr(g) && isDense(tg, isStr)) { const negs = new Set(), oids = new Set(); for (const tid of tg) for (const c of testById.get(tid)?.covers ?? []) { if (c.nid) negs.add(c.nid); oids.add(c.oid); } if (!killsByGuard.has(g)) killsByGuard.set(g, new Set()); for (const n of negs) killsByGuard.get(g).add(n); for (const o of oids) { const k = F.obligations.get(o)?.k_id; if (k) ksWithMutant.add(k); } }
  }
  for (const [g, nids] of F.soleGuards) for (const nid of nids) if (!(killsByGuard.get(g)?.has(nid))) fail(`D10: negativ '${nid}' bæres alene af '${g}' men ingen mutant på det værn har en target-test der dækker netop det negativ`);
  for (const k of F.ks) if (!ksWithMutant.has(k)) fail(`K '${k}' har ingen mutant (mutant-kill-gulv)`);
  return { ok: reasons.length === 0, reasons };
}
