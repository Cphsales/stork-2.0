#!/usr/bin/env node
// forventnings-manifest.mjs — B2-manifestet: den KANONISKE, maskinlæsbare K/ac/struktur/negativ-mængde
// (M-41 Trin C1; Codex' adapter-krav-liste B2 2026-09-10 »frit pas«: verifieren skal udlede den
// forventede mængde fra en versionsbundet kilde — ALDRIG fra proof.ks i beviset selv).
//
// Manifestet skrives af driveren/planneren ud fra plan v3's matrix efter forventningslistens
// ID-regler (§5 pkt. 6) og valideres her; build-proof.mjs binder det (path+oid @ gated commit),
// udleder forventningen og afviser udeladelser, dubletter og ukendte referencer.
//
//   manifest = {
//     schema_version: 1, pakke,
//     bindings: { forventningsliste:{path,oid}, krav:{path,oid}, plan:{path,oid} },
//     guards?:  [{ id, beskrivelse, locus? }],                       // værn som D10-mutanter refererer (guard_ref)
//     obligations: [{
//       id: "K-n/ac-m" | "K-n/S", k_id: "K-n", kind: "ac"|"struktur",
//       proof_forms: ["UT"|"FS"|"MH"|"SA", …],                       // formen hentes HERFRA, aldrig fra buildets udfald
//       scope: "nu" | "overdragelse", overdragelse_ref?,             // overdragelse = listet men IKKE forventet bevist nu
//       effekt_bid?, kildeankre: [..], aliases?: ["K-x/ac-y"],       // alias = genbrug af en anden forpligtelse (skrives ud)
//       negatives: [{ id: "K-n/ac-m/neg-k", beskrivelse,
//                     reject_contract: { kanal:"sqlstate", sqlstate, afvisningssted, fase, aktoer, observationskanal, offentlig_signatur }
//                                    | { kanal:"exit", exit_code, klasse, afvisningssted, fase, aktoer },
//                     sole_guard_ref? }]                              // værnet der ALENE bærer negativet (D10)
//     }]
//   }
// Fail-closed overalt: egne data-felter, tætte arrays, kendte klasser, ingen fri fejlliste.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const PROOF_FORMS = Object.freeze(["UT", "FS", "MH", "SA"]);
// reject-KLASSERNE fra kravet/B2 — ejes af frameworket. En harness/planner kan ikke tilføje en klasse.
export const REJECT_SQLSTATES = Object.freeze(["22023", "P0001", "P0002", "42501"]);
export const SCOPES = Object.freeze(["nu", "overdragelse"]);
const ID_K = /^K-[1-9][0-9]*$/;
const ID_AC = /^K-[1-9][0-9]*\/ac-[1-9][0-9]*$/;
const ID_S = /^K-[1-9][0-9]*\/S$/;
const ID_NEG = /^K-[1-9][0-9]*\/(ac-[1-9][0-9]*|S)\/neg-[1-9][0-9]*$/;
const ID_GUARD = /^[a-z0-9][a-z0-9._:-]{0,79}$/;
const PAKKE_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
const OID_RE = /^[0-9a-f]{40}$/;

const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const own = (o, k) => {
  if (o === null || typeof o !== "object") return undefined;
  const d = Object.getOwnPropertyDescriptor(o, k);
  return d && typeof d.get !== "function" && typeof d.set !== "function" ? d.value : undefined;
};
const isPlain = (v) => {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const p = Object.getPrototypeOf(v);
  return p === Object.prototype || p === null;
};
const isStr = (v) => typeof v === "string" && v.trim().length > 0 && !/[\r\n]/.test(v);
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

// validateManifest(m) → { ok, reasons }
export function validateManifest(m) {
  const reasons = [];
  const fail = (r) => reasons.push(r);
  if (!isPlain(m)) return { ok: false, reasons: ["manifest er ikke et plain object"] };
  if (own(m, "schema_version") !== 1) fail("schema_version ≠ 1");
  if (!isStr(own(m, "pakke")) || !PAKKE_RE.test(own(m, "pakke"))) fail("pakke mangler/ugyldig");
  // bindinger: præcis de tre, hver {path, oid}
  const b = own(m, "bindings");
  if (!isPlain(b)) fail("bindings mangler/ugyldig");
  else
    for (const key of ["forventningsliste", "krav", "plan"]) {
      const r = own(b, key);
      if (!isPlain(r) || !isStr(own(r, "path")) || !OID_RE.test(String(own(r, "oid")))) fail(`bindings.${key} skal være {path, oid(40 hex)}`);
    }
  // guards
  const guardIds = new Set();
  if (hasOwn(m, "guards")) {
    const g = own(m, "guards");
    if (!isDense(g, isPlain)) fail("guards skal være et tæt array af objekter");
    else
      for (const x of g) {
        const id = own(x, "id");
        if (!isStr(id) || !ID_GUARD.test(id)) fail(`guard uden gyldigt id: ${String(id)}`);
        else if (guardIds.has(id)) fail(`dublet guard-id: ${id}`);
        else guardIds.add(id);
        if (!isStr(own(x, "beskrivelse"))) fail(`guard ${String(id)}: beskrivelse mangler`);
      }
  }
  // obligations
  const ob = own(m, "obligations");
  const ids = new Set();
  const negIds = new Set();
  const byId = new Map();
  if (!isDense(ob, isPlain) || ob.length === 0) {
    fail("obligations skal være et ikke-tomt, tæt array af objekter");
    return { ok: false, reasons };
  }
  for (const o of ob) {
    const id = own(o, "id");
    const label = isStr(id) ? id : "<uden id>";
    const kind = own(o, "kind");
    if (!isStr(id) || !(ID_AC.test(id) || ID_S.test(id))) fail(`${label}: id skal være K-n/ac-m eller K-n/S`);
    else if (ids.has(id)) fail(`dublet forpligtelses-id: ${id}`);
    else ids.add(id);
    if (kind !== "ac" && kind !== "struktur") fail(`${label}: kind skal være ac|struktur`);
    else if (isStr(id) && ((kind === "ac") !== ID_AC.test(id))) fail(`${label}: kind '${kind}' matcher ikke id-formen`);
    const kId = own(o, "k_id");
    if (!isStr(kId) || !ID_K.test(kId)) fail(`${label}: k_id mangler/ugyldig`);
    else if (isStr(id) && !id.startsWith(kId + "/")) fail(`${label}: k_id '${kId}' er ikke id'ets præfiks`);
    const forms = own(o, "proof_forms");
    if (!isDense(forms, (f) => PROOF_FORMS.includes(f)) || forms.length === 0) fail(`${label}: proof_forms skal være et ikke-tomt, tæt array af UT|FS|MH|SA`);
    else if (new Set(forms).size !== forms.length) fail(`${label}: dublet bevisform`);
    const scope = own(o, "scope");
    if (!SCOPES.includes(scope)) fail(`${label}: scope skal være nu|overdragelse`);
    else if (scope === "overdragelse" && !isStr(own(o, "overdragelse_ref"))) fail(`${label}: overdragelse kræver overdragelse_ref (hvortil)`);
    if (hasOwn(o, "effekt_bid") && !isStr(own(o, "effekt_bid"))) fail(`${label}: effekt_bid skal være en streng`);
    const anker = own(o, "kildeankre");
    if (!isDense(anker, isStr) || anker.length === 0) fail(`${label}: kildeankre skal være et ikke-tomt, tæt array af strenge (K:linje · P:linje · T:…)`);
    if (hasOwn(o, "aliases")) {
      const al = own(o, "aliases");
      if (!isDense(al, isStr)) fail(`${label}: aliases skal være et tæt array af strenge`);
    }
    // negatives
    const negs = own(o, "negatives");
    const formsOk = isDense(forms, (f) => PROOF_FORMS.includes(f));
    if (!isDense(negs, isPlain)) fail(`${label}: negatives skal være et tæt array (evt. tomt)`);
    else {
      if (formsOk && forms.includes("UT") && negs.length === 0) fail(`${label}: UT kræver ≥1 negativ (et afvisnings-ac uden negativ kan ikke bevises)`);
      if (formsOk && !forms.includes("UT") && negs.length > 0) fail(`${label}: negativer kræver UT blandt proof_forms`);
      for (const n of negs) {
        const nid = own(n, "id");
        const nl = isStr(nid) ? nid : `${label}/<neg uden id>`;
        if (!isStr(nid) || !ID_NEG.test(nid)) fail(`${nl}: negativ-id skal være ${label}/neg-k`);
        else if (isStr(id) && !nid.startsWith(id + "/neg-")) fail(`${nl}: negativet hører ikke under ${label}`);
        else if (negIds.has(nid)) fail(`dublet negativ-id: ${nid}`);
        else negIds.add(nid);
        if (!isStr(own(n, "beskrivelse"))) fail(`${nl}: beskrivelse mangler`);
        const rc = own(n, "reject_contract");
        if (!isPlain(rc)) fail(`${nl}: reject_contract mangler`);
        else {
          const kanal = own(rc, "kanal");
          for (const k of ["afvisningssted", "fase", "aktoer"]) if (!isStr(own(rc, k))) fail(`${nl}: reject_contract.${k} mangler`);
          if (kanal === "sqlstate") {
            if (!REJECT_SQLSTATES.includes(own(rc, "sqlstate"))) fail(`${nl}: sqlstate '${String(own(rc, "sqlstate"))}' er ikke en anerkendt klasse (${REJECT_SQLSTATES.join("/")})`);
            for (const k of ["observationskanal", "offentlig_signatur"]) if (!isStr(own(rc, k))) fail(`${nl}: reject_contract.${k} mangler`);
          } else if (kanal === "exit") {
            const ec = own(rc, "exit_code");
            if (!Number.isInteger(ec) || ec <= 0 || ec > 255) fail(`${nl}: exit_code skal være 1..255`);
            if (!isStr(own(rc, "klasse"))) fail(`${nl}: exit-kontrakt kræver navngiven klasse`);
          } else fail(`${nl}: reject_contract.kanal skal være sqlstate|exit`);
        }
        if (hasOwn(n, "sole_guard_ref")) {
          const sg = own(n, "sole_guard_ref");
          if (!isStr(sg) || !guardIds.has(sg)) fail(`${nl}: sole_guard_ref '${String(sg)}' refererer ukendt guard`);
        }
      }
    }
    if (isStr(id)) byId.set(id, o);
  }
  // aliaser: eksisterende, ikke selv, ikke kæde, samme scope-krav (nu → nu)
  for (const [id, o] of byId) {
    if (!hasOwn(o, "aliases")) continue;
    const al = own(o, "aliases");
    if (!isDense(al, isStr)) continue;
    for (const a of al) {
      if (a === id) fail(`${id}: alias til sig selv`);
      else if (!byId.has(a)) fail(`${id}: alias '${a}' findes ikke`);
      else {
        const t = byId.get(a);
        const tal = own(t, "aliases");
        if (Array.isArray(tal) && tal.length > 0) fail(`${id}: alias '${a}' er selv et alias (kæder skrives ud)`);
        if (own(o, "scope") === "nu" && own(t, "scope") !== "nu") fail(`${id}: alias '${a}' er overdraget men ${id} er i nu-scope`);
      }
    }
  }
  return { ok: reasons.length === 0, reasons };
}

// expectedSet(m) → den forventede mængde (kun scope=nu) — verifierens sandhed
//   { obligations: Map(id → {k_id, kind, forms:Set, negatives:[nid], aliases:[id]}),
//     negatives: Map(nid → {obligation_id, reject_contract, sole_guard_ref|null}),
//     ks: Set(k_id), soleGuards: Map(guard_id → [nid]), overdraget: Set(id), guards: Set(guard_id) }
export function expectedSet(m) {
  const v = validateManifest(m);
  if (!v.ok) throw new Error("ugyldigt manifest: " + v.reasons.join("; "));
  const obligations = new Map(), negatives = new Map(), ks = new Set(), soleGuards = new Map(), overdraget = new Set();
  const guards = new Set(Array.isArray(m.guards) ? m.guards.map((g) => g.id) : []);
  for (const o of m.obligations) {
    if (o.scope !== "nu") { overdraget.add(o.id); continue; }
    ks.add(o.k_id);
    obligations.set(o.id, { k_id: o.k_id, kind: o.kind, forms: new Set(o.proof_forms), negatives: o.negatives.map((n) => n.id), aliases: Array.isArray(o.aliases) ? [...o.aliases] : [] });
    for (const n of o.negatives) {
      negatives.set(n.id, { obligation_id: o.id, reject_contract: n.reject_contract, sole_guard_ref: hasOwn(n, "sole_guard_ref") ? n.sole_guard_ref : null });
      if (hasOwn(n, "sole_guard_ref")) { if (!soleGuards.has(n.sole_guard_ref)) soleGuards.set(n.sole_guard_ref, []); soleGuards.get(n.sole_guard_ref).push(n.id); }
    }
  }
  return { obligations, negatives, ks, soleGuards, overdraget, guards };
}

// CLI: node forventnings-manifest.mjs validate <fil>   |   stats <fil>
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [cmd, fil] = process.argv.slice(2);
  if (!cmd || !fil) { console.error("brug: forventnings-manifest.mjs validate|stats <manifest.json>"); process.exit(2); }
  let m;
  try { m = JSON.parse(readFileSync(fil, "utf8")); } catch (e) { console.error(`kan ikke læse/parse ${fil}: ${e.message}`); process.exit(1); }
  const v = validateManifest(m);
  if (!v.ok) { console.error(`✗ manifest UGYLDIGT (${v.reasons.length}):`); for (const r of v.reasons) console.error("  - " + r); process.exit(1); }
  const e = expectedSet(m);
  const forms = {}; for (const o of e.obligations.values()) for (const f of o.forms) forms[f] = (forms[f] ?? 0) + 1;
  console.log(`✓ manifest gyldigt: ${m.pakke} · ${e.ks.size} K · ${e.obligations.size} forpligtelser i nu-scope (${e.overdraget.size} overdraget) · ${e.negatives.size} negativer · pr. form ${JSON.stringify(forms)} · ${e.soleGuards.size} eneste-værn`);
  if (cmd === "stats") for (const [id, o] of e.obligations) console.log(`  ${id}  [${[...o.forms].join(",")}]  neg=${o.negatives.length}${o.aliases.length ? "  alias→" + o.aliases.join(",") : ""}`);
}
