#!/usr/bin/env node
// verdikt.mjs — v5 aktør-verdikt-kontrakten (plan 2.B).
//
// Et verdikt tæller kun hvis det er (a) schema-validt fail-closed (ukendt/
// manglende felt = rød; kun EGNE data-felter tæller — prototype-/arvede felter
// ignoreres), (b) intern-konsistent (hvert citat kommer fra en OID aktøren
// erklærede at læse), og (c) indholds-afledt: hvert citat verificeres mod RÅ
// git — objektet er en BLOB, blobben ligger reelt på den citerede sti i den
// gatede commit (path-binding FØR span-hash; stale/orphan-blob afvist),
// indholdet er gyldig UTF-8, og excerpt-hashen matcher et IKKE-tomt uddrag af
// de rå blob-bytes. CI producerer verdikterne (server-provenance); dette modul
// verificerer dem frisk pr. evaluering.

import { createHash } from "node:crypto";
import { ACTOR_SLUGS, GATE_IDS, isOid } from "./gates.mjs";

const sha256 = (s) => createHash("sha256").update(s).digest("hex");
const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const isNonEmptyString = (v) => typeof v === "string" && v.length > 0;
const isSha256Hex = (v) => typeof v === "string" && /^[0-9a-f]{64}$/.test(v);
const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
// dense-array: length matcher antal EGNE index-properties → et sparse `new
// Array(1)` (length 1, nul huller-som-egne-props) afvises, så .every()/.forEach()
// aldrig kan springe et hul over og lade et "tomt" felt passere som udfyldt.
const isDenseArray = (a) => {
  if (!Array.isArray(a)) return false;
  for (let i = 0; i < a.length; i++) if (!hasOwn(a, i)) return false;
  return true;
};
const isDenseArrayOf = (a, pred) => isDenseArray(a) && a.every((x) => pred(x));

// ---------- schema (draft-2020-12-ånd, håndhævet i kode: required + additionalProperties:false, EGNE felter) ----------

const VERDIKT_KEYS = Object.freeze([
  "schema_version",
  "gate_id",
  "aktor",
  "artifact_oid",
  "bindings_oids",
  "input_oids_read",
  "conclusion",
  "negative_cases",
  "claim_graph_refs",
  "evidence",
  "run",
]);
const EVIDENCE_KEYS = Object.freeze(["commit_sha", "path", "blob_oid", "line_span", "excerpt_sha"]);
const RUN_KEYS = Object.freeze(["run_id", "run_attempt", "raw_output_sha256", "actor_server_id"]);
export const CONCLUSIONS = Object.freeze(["PASS", "FAIL", "HALT"]);

export function validateVerdiktSchema(v) {
  const reasons = [];
  const fail = (r) => reasons.push(r);

  if (!isPlainObject(v)) return { ok: false, reasons: ["verdikt er ikke et objekt"] };
  for (const k of Object.keys(v))
    if (!VERDIKT_KEYS.includes(k)) fail(`ukendt felt '${k}' (additionalProperties:false)`);
  // hasOwn (ikke `in`): et felt der kun ligger på prototypen tæller IKKE som til stede.
  for (const k of VERDIKT_KEYS)
    if (!hasOwn(v, k)) fail(`manglende felt '${k}' (required — tomt/manglende/arvet = rød)`);
  if (reasons.length) return { ok: false, reasons };

  if (v.schema_version !== 1) fail(`schema_version skal være 1 (fik ${String(v.schema_version)})`);
  if (!GATE_IDS.includes(v.gate_id)) fail(`gate_id '${String(v.gate_id)}' er ikke en kendt gate`);
  if (!ACTOR_SLUGS.includes(v.aktor)) fail(`aktor '${String(v.aktor)}' er ikke i ACTOR_SLUGS`);
  if (!isOid(v.artifact_oid)) fail("artifact_oid er ikke en gyldig OID");

  if (!isPlainObject(v.bindings_oids) || Object.keys(v.bindings_oids).length === 0)
    fail("bindings_oids skal være et ikke-tomt objekt");
  else
    for (const [k, o] of Object.entries(v.bindings_oids)) {
      if (!isNonEmptyString(k)) fail("bindings_oids: tom nøgle");
      if (!isOid(o)) fail(`bindings_oids['${k}'] er ikke en gyldig OID`);
    }

  if (!isDenseArrayOf(v.input_oids_read, isOid) || v.input_oids_read.length === 0)
    fail("input_oids_read skal være et ikke-tomt, tæt array af gyldige OIDs (aktøren SKAL have læst sit input)");

  if (!CONCLUSIONS.includes(v.conclusion)) fail(`conclusion skal være PASS|FAIL|HALT (fik ${String(v.conclusion)})`);

  if (!isDenseArrayOf(v.negative_cases, isNonEmptyString))
    fail("negative_cases skal være et tæt array af ikke-tomme strenge");
  if (!isDenseArrayOf(v.claim_graph_refs, isNonEmptyString))
    fail("claim_graph_refs skal være et tæt array af ikke-tomme strenge");

  if (!isDenseArray(v.evidence) || v.evidence.length === 0)
    fail("evidence skal være et ikke-tomt, tæt array (læsebevis: et verdikt uden indholds-afledt evidens tæller ikke)");
  else
    v.evidence.forEach((ev, i) => {
      if (!isPlainObject(ev)) return fail(`evidence[${i}] er ikke et objekt`);
      for (const k of Object.keys(ev)) if (!EVIDENCE_KEYS.includes(k)) fail(`evidence[${i}]: ukendt felt '${k}'`);
      for (const k of EVIDENCE_KEYS) if (!hasOwn(ev, k)) fail(`evidence[${i}]: manglende felt '${k}'`);
      if (hasOwn(ev, "commit_sha") && !isNonEmptyString(ev.commit_sha)) fail(`evidence[${i}].commit_sha tom`);
      if (hasOwn(ev, "path") && !isNonEmptyString(ev.path)) fail(`evidence[${i}].path tom`);
      if (hasOwn(ev, "blob_oid") && !isOid(ev.blob_oid)) fail(`evidence[${i}].blob_oid ugyldig`);
      if (hasOwn(ev, "excerpt_sha") && !isSha256Hex(ev.excerpt_sha))
        fail(`evidence[${i}].excerpt_sha er ikke sha256-hex`);
      if (hasOwn(ev, "line_span")) {
        const s = ev.line_span;
        if (
          !isDenseArray(s) ||
          s.length !== 2 ||
          !Number.isInteger(s[0]) ||
          !Number.isInteger(s[1]) ||
          s[0] < 1 ||
          s[1] < s[0]
        )
          fail(`evidence[${i}].line_span skal være [start,end], 1-indekseret, end ≥ start`);
      }
    });

  if (!isPlainObject(v.run)) fail("run mangler/ugyldigt");
  else {
    for (const k of Object.keys(v.run)) if (!RUN_KEYS.includes(k)) fail(`run: ukendt felt '${k}'`);
    for (const k of RUN_KEYS) if (!hasOwn(v.run, k)) fail(`run: manglende felt '${k}'`);
    if (hasOwn(v.run, "run_id") && !isNonEmptyString(v.run.run_id)) fail("run.run_id tom");
    if (hasOwn(v.run, "run_attempt") && (!Number.isInteger(v.run.run_attempt) || v.run.run_attempt < 1))
      fail("run.run_attempt skal være heltal ≥ 1");
    if (hasOwn(v.run, "raw_output_sha256") && !isSha256Hex(v.run.raw_output_sha256))
      fail("run.raw_output_sha256 er ikke sha256-hex");
    if (hasOwn(v.run, "actor_server_id") && !isNonEmptyString(v.run.actor_server_id))
      fail("run.actor_server_id tom (server-provenance kræves)");
  }

  // intern konsistens: du kan kun citere en OID du erklærede at have læst.
  if (reasons.length === 0)
    v.evidence.forEach((ev, i) => {
      if (!v.input_oids_read.includes(ev.blob_oid))
        fail(`evidence[${i}].blob_oid er ikke i input_oids_read (citat af noget aktøren ikke erklærede at læse)`);
    });

  return { ok: reasons.length === 0, reasons };
}

// ---------- læsebevis mod rå git ----------

// readBlobLines(git, oid) → {lines} | {error}. Kræver at objektet er en BLOB
// (tree/commit/tag afvises) og at bytes er gyldig UTF-8 (lossy decode af binær
// blob afvises). Læser RÅ bytes (git.bytes) — ingen trailing-newline-trim, så
// excerpt-hashen er stabil uafhængigt af hvem der producerede citatet.
export function readBlobLines(git, oid) {
  let type;
  try {
    type = git("cat-file", "-t", oid);
  } catch {
    return { error: `objekt ${oid} kan ikke slås op` };
  }
  if (type !== "blob") return { error: `citeret objekt er '${type}', ikke en blob` };
  let bytes;
  try {
    bytes = git.bytes("cat-file", "-p", oid);
  } catch {
    return { error: `blob ${oid} kan ikke læses` };
  }
  let content;
  try {
    // ignoreBOM: behandl en evt. UTF-8 BOM som ALMINDELIGE bytes (strip den
    // IKKE) → excerpt-hash matcher de RÅ blob-bytes eksakt (rå-byte-kontrakt).
    content = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    return { error: `blob ${oid} er ikke gyldig UTF-8 (binært/ikke-tekst citat)` };
  }
  return { lines: content.split("\n") };
}

// excerptAt(lines, line_span) → uddrag-streng | null (span uden for blob / tomt).
export function excerptAt(lines, lineSpan) {
  const [start, end] = isDenseArray(lineSpan) && lineSpan.length === 2 ? lineSpan : [NaN, NaN];
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start || end > lines.length) return null;
  const excerpt = lines.slice(start - 1, end).join("\n");
  return excerpt.length === 0 ? null : excerpt; // tomt uddrag beviser intet
}

// verifyEvidence(ev, snapshot, {git}):
// 1) citatet SKAL ligge i den gatede commit (ev.commit_sha === snapshot.commit_sha).
// 2) path-binding FØR span-hash: git rev-parse <commit>:<path> === blob_oid
//    (orphan-blob der findes i db'en men ikke på stien, afvises).
// 3) objektet er en blob, gyldig UTF-8, og excerpt_sha === sha256 af et
//    ikke-tomt uddrag af de rå blob-bytes ved line_span.
export function verifyEvidence(ev, snapshot, { git }) {
  const reasons = [];
  if (typeof git !== "function" || typeof git.bytes !== "function")
    return { ok: false, reasons: ["git-dep mangler/ufuldstændig (fail-closed)"] };
  if (!isPlainObject(ev)) return { ok: false, reasons: ["evidens-item er ikke et objekt"] };
  // EGNE felter kræves for alle evidens-nøgler — et tomt {} med felter arvet fra
  // Object.prototype må ikke kunne udfylde et citat (prototype-pollution → falsk
  // læsebevis). Gælder også når verifyEvidence kaldes uden for schema-validering
  // (fx claim_graph-ankre i build-proof).
  for (const k of EVIDENCE_KEYS) if (!hasOwn(ev, k)) return { ok: false, reasons: [`evidens-item mangler eget felt '${k}' (arvet/fraværende = fail-closed)`] };

  if (ev.commit_sha !== snapshot?.commit_sha)
    reasons.push(`evidens citerer commit ${String(ev.commit_sha)} ≠ gated commit ${String(snapshot?.commit_sha)}`);

  let atPath = null;
  try {
    atPath = git("rev-parse", `${snapshot.commit_sha}:${ev.path}`);
  } catch {
    reasons.push(`path '${String(ev.path)}' findes ikke i den gatede commit`);
  }
  if (atPath !== null && atPath !== ev.blob_oid)
    reasons.push(
      `blob_oid matcher ikke stien i den gatede commit (citeret ${String(ev.blob_oid)}, reel ${atPath}) — stale/orphan-citat`,
    );
  if (reasons.length) return { ok: false, reasons };

  const blob = readBlobLines(git, ev.blob_oid);
  if (blob.error) return { ok: false, reasons: [blob.error] };
  const excerpt = excerptAt(blob.lines, ev.line_span);
  if (excerpt === null)
    return { ok: false, reasons: [`line_span uden for blob eller tomt uddrag (${blob.lines.length} linjer)`] };
  if (sha256(excerpt) !== ev.excerpt_sha)
    return {
      ok: false,
      reasons: ["excerpt_sha matcher ikke blob-indholdet ved line_span (fabrikeret/forskudt citat)"],
    };

  return { ok: true, reasons: [] };
}

// verifyVerdict(verdict, snapshot, {git}) — schema + intern konsistens + ALLE
// evidens-items frisk mod rå git. Binding til gate/artefakt/bindinger, evidens-
// relevans mod snapshottets OIDs, og PASS-dommen håndhæves af evaluateGate
// (gates.mjs); dette modul afgør om verdiktet overhovedet TÆLLER som ægte læsning.
export function verifyVerdict(verdict, snapshot, { git }) {
  const schema = validateVerdiktSchema(verdict);
  if (!schema.ok) return schema;
  const reasons = [];
  verdict.evidence.forEach((ev, i) => {
    const r = verifyEvidence(ev, snapshot, { git });
    if (!r.ok) reasons.push(...r.reasons.map((x) => `evidence[${i}]: ${x}`));
  });
  return { ok: reasons.length === 0, reasons };
}

// makeVerdictVerifier({git}) → deps-form til evaluateGate.
export const makeVerdictVerifier =
  ({ git }) =>
  (verdict, snapshot) =>
    verifyVerdict(verdict, snapshot, { git });
