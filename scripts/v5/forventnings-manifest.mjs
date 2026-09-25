#!/usr/bin/env node
// forventnings-manifest.mjs — manifestet: den maskinlæsbare K/ac/struktur/negativ-mængde en pakke skal
// bevise. Den forventede mængde udledes af manifestet, aldrig af det beviset selv påstår.
//
// Codex skriver manifestet ud fra kravet og planen (målelaget, disciplin.md §2 trin 3); det valideres her
// og bindes af dækningsdommen. Udeladelser, dubletter og ukendte referencer afvises.
//
//   manifest = {
//     schema_version: 1, pakke,
//     bindings: { forventningsliste:{path,oid}, krav:{path,oid}, plan:{path,oid} },
//     guards?:  [{ id, beskrivelse, locus?: {path, pattern} }],     // værn som D10-mutanter refererer (guard_ref); locus = værnets LÅSTE
//                                                                   // definitionssted (repo-sti + regex over uddraget) — build-proofens claim-ankre
//                                                                   // SKAL ligge dér (C1-r4 F-31: producenten kan ikke vælge et andet uddrag)
//     obligations: [{
//       id: "K-n/ac-m" | "K-n/S", k_id: "K-n", kind: "ac"|"struktur",
//       proof_forms: ["UT"|"FS"|"MH"|"SA", …],                       // formen hentes HERFRA, aldrig fra buildets udfald
//       scope: "nu" | "overdragelse", overdragelse_ref?,             // overdragelse = listet men IKKE forventet bevist nu
//       overdraget_former?: ["SA"],                                  // DEL-overdragelse: disse former forventes ikke nu (ref kræves)
//       assertions?: [{ id, form }],                                 // NAVNGIVNE obligatoriske delbeviser (checkpoints · vidner · race) — C1-r1 F-2
//       effekt_bid?, kildeankre: [..],
//       aliases?: [{ id: "K-x/ac-y", former: ["UT","MH"] }],          // EKSPLICIT ekspansion: ejeren forventes bevist i disse former (UT ⇒ egne negativer)
//       negatives: [{ id: "K-n/ac-m/neg-k", beskrivelse,
//                     reject_contract: { kanal:"sqlstate", sqlstate, grund, afvisningssted, fase, aktoer, observationskanal, offentlig_signatur }
//                                    | { kanal:"exit", exit_code, klasse, afvisningssted, fase, aktoer },
//                     sole_guard_ref? }]                              // værnet der ALENE bærer negativet (D10)
//     }]
//   }
//   reject_contract (sqlstate): `grund` = det PRÆCISE fejl-token koden raiser (MESSAGE — lighed, ikke substring) · `afvisningssted` =
//   routinen der raiser (PL/pgSQL-CONTEXT-identitet) eller "-" for afvisninger uden routine (ACL/constraint) · `aktoer` = den DB-rolle
//   forsøget SKAL køre som. Alle tre håndhæves af motoren mod observationen (C1-r1 F-4).
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
const ID_ASSERT = /^[a-z0-9][a-z0-9._:-]{0,79}$/;
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
        if (hasOwn(x, "locus")) {   // F-31: låst anker-locus (plan-gatens dom): relativ repo-sti uden traversal + gyldigt regex (multiline)
          const L = own(x, "locus");
          if (!isPlain(L) || !isStr(own(L, "path")) || !isStr(own(L, "pattern"))) fail(`guard ${String(id)}: locus skal være {path, pattern}`);
          else {
            const lp = own(L, "path");
            if (lp.startsWith("/") || /(^|\/)\.\.(\/|$)/.test(lp) || lp.includes("\\")) fail(`guard ${String(id)}: locus.path skal være en relativ repo-sti uden traversal`);
            try { new RegExp(own(L, "pattern"), "m"); } catch { fail(`guard ${String(id)}: locus.pattern er ikke et gyldigt regex`); }
          }
        }
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
    const formsOkEarly = (f) => isDense(f, (x) => PROOF_FORMS.includes(x)) && f.length > 0;
    if (!formsOkEarly(forms)) fail(`${label}: proof_forms skal være et ikke-tomt, tæt array af UT|FS|MH|SA`);
    else if (new Set(forms).size !== forms.length) fail(`${label}: dublet bevisform`);
    const scope = own(o, "scope");
    if (!SCOPES.includes(scope)) fail(`${label}: scope skal være nu|overdragelse`);
    else if (scope === "overdragelse" && !isStr(own(o, "overdragelse_ref"))) fail(`${label}: overdragelse kræver overdragelse_ref (hvortil)`);
    if (hasOwn(o, "overdraget_former")) {
      const of = own(o, "overdraget_former");
      if (!isDense(of, (f) => PROOF_FORMS.includes(f)) || of.length === 0) fail(`${label}: overdraget_former skal være et ikke-tomt, tæt array af former`);
      else {
        if (scope !== "nu") fail(`${label}: overdraget_former kun på nu-scope (hel overdragelse = scope overdragelse)`);
        if (formsOkEarly(forms) && !of.every((f) => forms.includes(f))) fail(`${label}: overdraget_former ⊄ proof_forms`);
        if (formsOkEarly(forms) && of.length >= forms.length) fail(`${label}: alle former overdraget — brug scope overdragelse`);
        if (!isStr(own(o, "overdragelse_ref"))) fail(`${label}: deloverdragelse kræver overdragelse_ref`);
      }
    }
    if (hasOwn(o, "assertions")) {
      const as = own(o, "assertions");
      if (!isDense(as, isPlain)) fail(`${label}: assertions skal være et tæt array af {id, form}`);
      else {
        const seen = new Set();
        for (const a of as) {
          const aid = own(a, "id"); const af = own(a, "form");
          if (!isStr(aid) || !ID_ASSERT.test(aid)) fail(`${label}: assertion-id ugyldig: ${String(aid)}`);
          else if (seen.has(aid)) fail(`${label}: dublet assertion-id ${aid}`); else seen.add(aid);
          if (af === "UT") fail(`${label}: UT's navngivne delbeviser er negativerne — ikke assertions`);
          else if (!PROOF_FORMS.includes(af) || (formsOkEarly(forms) && !forms.includes(af))) fail(`${label}: assertion '${String(aid)}' har form '${String(af)}' uden for proof_forms`);
        }
      }
    }
    if (hasOwn(o, "effekt_bid") && !isStr(own(o, "effekt_bid"))) fail(`${label}: effekt_bid skal være en streng`);
    const anker = own(o, "kildeankre");
    if (!isDense(anker, isStr) || anker.length === 0) fail(`${label}: kildeankre skal være et ikke-tomt, tæt array af strenge (K:linje · P:linje · T:…)`);
    if (hasOwn(o, "aliases")) {
      const al = own(o, "aliases");
      if (!isDense(al, isPlain)) fail(`${label}: aliases skal være et tæt array af {id, former}`);
      else for (const a of al) {
        if (!isStr(own(a, "id"))) fail(`${label}: alias uden id`);
        const fm = own(a, "former");
        if (!isDense(fm, (f) => PROOF_FORMS.includes(f)) || fm.length === 0) fail(`${label}: alias '${String(own(a, "id"))}' skal angive former (eksplicit ekspansion)`);
        else if (fm.includes("UT") && !(isDense(own(o, "negatives"), isPlain) && own(o, "negatives").length > 0)) fail(`${label}: alias m. UT kræver at ${label} selv deklarerer sit negativ`);
      }
    }
    // negatives
    const negs = own(o, "negatives");
    const formsOk = isDense(forms, (f) => PROOF_FORMS.includes(f));
    // effektive former = proof_forms ∪ alias-former (eksplicit ekspansion) — UT via alias kræver egne negativer
    const aliasForms = hasOwn(o, "aliases") && isDense(own(o, "aliases"), isPlain) ? own(o, "aliases").flatMap((a) => (isDense(own(a, "former"), isStr) ? own(a, "former") : [])) : [];
    const effUT = formsOk && (forms.includes("UT") || aliasForms.includes("UT"));
    if (!isDense(negs, isPlain)) fail(`${label}: negatives skal være et tæt array (evt. tomt)`);
    else {
      if (effUT && negs.length === 0) fail(`${label}: UT kræver ≥1 negativ (et afvisnings-ac uden negativ kan ikke bevises)`);
      if (formsOk && !effUT && negs.length > 0) fail(`${label}: negativer kræver UT blandt proof_forms (eller via alias-ekspansion)`);
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
            for (const k of ["grund", "observationskanal", "offentlig_signatur"]) if (!isStr(own(rc, k))) fail(`${nl}: reject_contract.${k} mangler (grund = det præcise fejl-token koden raiser)`);
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
    if (!isDense(al, isPlain)) continue;
    for (const ax of al) {
      const a = own(ax, "id"); const fm = own(ax, "former");
      if (!isStr(a)) continue;
      if (a === id) fail(`${id}: alias til sig selv`);
      else if (!byId.has(a)) fail(`${id}: alias '${a}' findes ikke`);
      else {
        const t = byId.get(a);
        const tal = own(t, "aliases");
        if (Array.isArray(tal) && tal.length > 0) fail(`${id}: alias '${a}' er selv et alias (kæder skrives ud)`);
        if (own(o, "scope") === "nu" && own(t, "scope") !== "nu") fail(`${id}: alias '${a}' er overdraget men ${id} er i nu-scope`);
        const tf = own(t, "proof_forms");
        if (isDense(fm, isStr) && isDense(tf, isStr) && !fm.every((f) => tf.includes(f))) fail(`${id}: alias '${a}' angiver former uden for målets proof_forms`);
      }
    }
  }
  return { ok: reasons.length === 0, reasons };
}

// expectedSet(m) → den forventede mængde (kun scope=nu) — verifierens sandhed
//   { obligations: Map(id → {k_id, kind, forms:Set (inkl. alias-former, minus overdraget_former), negatives:[nid], assertions:[{id,form}], aliases:[id], effekt_bid}),
//     negatives: Map(nid → {obligation_id, reject_contract, sole_guard_ref|null}),
//     ks: Set(k_id), soleGuards: Map(guard_id → [nid]), overdraget: Set(id), guards: Map(guard_id → {beskrivelse, locus|null}) }
export function expectedSet(m) {
  const v = validateManifest(m);
  if (!v.ok) throw new Error("ugyldigt manifest: " + v.reasons.join("; "));
  const obligations = new Map(), negatives = new Map(), ks = new Set(), soleGuards = new Map(), overdraget = new Set();
  const guards = new Map((Array.isArray(m.guards) ? m.guards : []).map((g) => [g.id, { beskrivelse: g.beskrivelse, locus: hasOwn(g, "locus") ? { path: g.locus.path, pattern: g.locus.pattern } : null }]));
  const overdragetFormer = new Map();
  for (const o of m.obligations) {
    if (o.scope !== "nu") { overdraget.add(o.id); continue; }
    ks.add(o.k_id);
    const forms = new Set(o.proof_forms);
    for (const a of Array.isArray(o.aliases) ? o.aliases : []) for (const f of a.former) forms.add(f);      // eksplicit ekspansion
    const of = Array.isArray(o.overdraget_former) ? o.overdraget_former : [];
    for (const f of of) forms.delete(f);
    if (of.length) overdragetFormer.set(o.id, [...of]);
    const utForventet = forms.has("UT");
    const assertions = (Array.isArray(o.assertions) ? o.assertions : []).filter((a) => forms.has(a.form)).map((a) => ({ id: a.id, form: a.form }));
    obligations.set(o.id, { k_id: o.k_id, kind: o.kind, forms, negatives: utForventet ? o.negatives.map((n) => n.id) : [], assertions, aliases: Array.isArray(o.aliases) ? o.aliases.map((a) => a.id) : [], effekt_bid: hasOwn(o, "effekt_bid") ? o.effekt_bid : null });
    if (!utForventet) continue;   // UT overdraget → negativerne forventes ikke nu (listet, ikke forventet)
    for (const n of o.negatives) {
      negatives.set(n.id, { obligation_id: o.id, reject_contract: n.reject_contract, sole_guard_ref: hasOwn(n, "sole_guard_ref") ? n.sole_guard_ref : null });
      if (hasOwn(n, "sole_guard_ref")) { if (!soleGuards.has(n.sole_guard_ref)) soleGuards.set(n.sole_guard_ref, []); soleGuards.get(n.sole_guard_ref).push(n.id); }
    }
  }
  return { obligations, negatives, ks, soleGuards, overdraget, overdragetFormer, guards };
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
