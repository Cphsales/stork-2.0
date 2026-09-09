#!/usr/bin/env node
// kvittering.mjs — godkendelses-KVITTERINGEN (M-41 princip 9 · GRUNDPLAN-v2 3c/B7 · P2-gates F-1, 2026-09-09).
//
// PROBLEMET: approval-filen er data. `orderedApproval` beviser at approval refererer de
// rigtige verdikt-digests (LIGHED) — ikke at Mathias' ord faldt EFTER de endelige verdikter
// og på PRÆCIS den fremlæggelse han så (HÆNDELSEN). M-38 (15:06) lå før r4b (15:10).
// LØSNINGEN: driveren skriver + committer en KVITTERING FØR fremlæggelsen sendes:
//   plan-build/<pakke>/<gate>-kvittering.json = { schema_version, gate_id, pakke, artifact_oid,
//   bindings_oids, scope_digest, prerequisite_digests (de endelige verdikters digests),
//   fremlaeggelse {path, blob_oid}, devil {path, blob_oid, dom:"PASS"}, frosset (ISO) }.
// Approval (senere commit) bærer kvittering_digest = sha256(kvitteringens committede bytes).
// Kernen (gates.mjs, gate.approvalReceipt) kræver frisk verifyApproval, som her beviser:
//   (1) digest: approval.kvittering_digest == sha256 af kvitteringen @ evidenceRef
//   (2) indhold: gate/pakke/artefakt/bindinger/scope/prerequisite_digests == gatens FAKTISKE
//   (3) fremlæggelse + devil-dom er de COMMITTEDE blobs @ evidenceRef (den tekst han så)
//   (4) RÆKKEFØLGE: kvitteringens sidste berørings-commit er ÆGTE forfader til approvalens
//       (aldrig samme commit, aldrig efter) — git-historik = beviset, som ved blindhed.
// Enhver ændring efter kvitteringen (ny tekst, nyt verdikt) → ny kvittering + ny fremlæggelse.
// DEKLARERET RESIDUAL: kvitteringen er ikke signeret af en betroet server (CI-approver-flow,
// plan DEL V/2.F). Lokalt hviler den på git-historik + fabrik-frys — samme tillidsniveau som
// alt andet i den lokale gate-dom, og ærligt stærkere end digests alene.
import { createHash } from "node:crypto";
import { isOid } from "./gates.mjs";

const hasOwn = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
const isPlain = (o) => o !== null && typeof o === "object" && !Array.isArray(o) && (Object.getPrototypeOf(o) === Object.prototype || Object.getPrototypeOf(o) === null);
// egne indeks-felter (ingen iterator/accessor-tricks — samme princip som kernen)
const ownIndexArray = (a) => (Array.isArray(a) ? Array.from({ length: a.length }, (_, i) => Object.getOwnPropertyDescriptor(a, String(i))?.value) : null);
const sameMap = (a, b) => {
  if (!isPlain(a) || !isPlain(b)) return false;
  const ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
  return ka.length === kb.length && ka.every((k, i) => k === kb[i] && a[k] === b[k]);
};
const PAKKE_RE = /^[a-z][a-z0-9-]*$/;
const SHA256_RE = /^[0-9a-f]{64}$/;

export const KVITTERING_KEYS = Object.freeze(["schema_version", "gate_id", "pakke", "artifact_oid", "bindings_oids", "scope_digest", "prerequisite_digests", "fremlaeggelse", "devil", "frosset"]);
export const kvitteringDigest = (bytes) => createHash("sha256").update(bytes).digest("hex");
export const kvitteringPath = (pakke, gateId) => `plan-build/${pakke}/${gateId}-kvittering.json`;
export const approvalPath = (pakke, gateId) => `plan-build/${pakke}/${gateId}-approval.json`;

// validateKvittering(kv, {gateId, pakke, artifactOid, expectedOids, expectedScope, verdictDigests}) → {ok, reasons}
export function validateKvittering(kv, ctx) {
  const reasons = [];
  const fail = (r) => reasons.push(`kvittering: ${r}`);
  if (!isPlain(kv)) return { ok: false, reasons: ["kvittering: ikke et plain object"] };
  for (const k of Object.keys(kv)) if (!KVITTERING_KEYS.includes(k)) fail(`uventet felt '${k}' (fail-closed)`);
  for (const k of KVITTERING_KEYS) if (!hasOwn(kv, k)) fail(`manglende felt '${k}'`);
  if (reasons.length) return { ok: false, reasons };
  if (kv.schema_version !== 1) fail("schema_version ≠ 1");
  if (kv.gate_id !== ctx.gateId) fail(`gate_id '${String(kv.gate_id)}' ≠ gaten '${ctx.gateId}'`);
  if (typeof kv.pakke !== "string" || !PAKKE_RE.test(kv.pakke)) fail("pakke ugyldig");
  else if (ctx.pakke !== undefined && kv.pakke !== ctx.pakke) fail(`pakke '${kv.pakke}' ≠ gatens pakke '${ctx.pakke}'`);
  if (!isOid(kv.artifact_oid) || kv.artifact_oid !== ctx.artifactOid) fail("artifact_oid ≠ gatens artefakt (kvitteringen gælder en anden tekst)");
  if (!sameMap(kv.bindings_oids, ctx.expectedOids)) fail("bindings_oids ≠ gatens bindinger");
  if (typeof kv.scope_digest !== "string" || kv.scope_digest !== ctx.expectedScope) fail("scope_digest ≠ gatens scope");
  const pd = ownIndexArray(kv.prerequisite_digests);
  const want = [...ctx.verdictDigests].sort();
  if (!pd || pd.length !== want.length || !pd.every((x) => typeof x === "string" && SHA256_RE.test(x))) fail(`prerequisite_digests ugyldig/antal (${pd ? pd.length : "?"} ≠ ${want.length})`);
  else {
    const got = [...pd].sort();
    if (!want.every((d, i) => d === got[i])) fail("prerequisite_digests ≠ de endelige verdikter (kvitteringen blev skrevet på andre verdikter)");
  }
  for (const [f, keys] of [["fremlaeggelse", ["path", "blob_oid"]], ["devil", ["path", "blob_oid", "dom"]]]) {
    const o = kv[f];
    if (!isPlain(o)) { fail(`${f}: mangler/ikke et objekt`); continue; }
    for (const k of Object.keys(o)) if (!keys.includes(k)) fail(`${f}: uventet felt '${k}'`);
    if (typeof o.path !== "string" || o.path.length === 0 || o.path.includes("..") || o.path.startsWith("/")) fail(`${f}.path ugyldig`);
    if (!isOid(o.blob_oid)) fail(`${f}.blob_oid er ikke en OID`);
  }
  if (isPlain(kv.devil) && kv.devil.dom !== "PASS") fail(`devil.dom '${String(kv.devil?.dom)}' ≠ PASS — fremlæggelsen var ikke REN da kvitteringen blev skrevet`);
  if (typeof kv.frosset !== "string" || Number.isNaN(Date.parse(kv.frosset))) fail("frosset er ikke et ISO-tidsstempel");
  return { ok: reasons.length === 0, reasons };
}

// makeApprovalVerifier({git, pakke, evidenceRef, paths?}) → verifyApproval(approval, ctx) → {ok, reasons}
// git = makeGit(root) · evidenceRef = commit/ref hvor kvittering + approval + fremlæggelse er committet.
export function makeApprovalVerifier({ git, pakke, evidenceRef = "HEAD", paths } = {}) {
  if (typeof git !== "function") throw new Error("makeApprovalVerifier: git-dep mangler");
  if (typeof pakke !== "string" || !PAKKE_RE.test(pakke)) throw new Error("makeApprovalVerifier: ugyldig pakke");
  return (approval, ctx) => {
    try {
      return verifyInner(git, pakke, evidenceRef, paths, approval, ctx);
    } catch (e) {
      return { ok: false, reasons: [`verifyApproval kastede (fail-closed): ${e?.message ?? String(e)}`] };
    }
  };
}

function verifyInner(git, pakke, evidenceRef, paths, approval, ctx) {
  const reasons = [];
  const fail = (r) => reasons.push(r);
  if (!isPlain(approval) || !isPlain(ctx)) return { ok: false, reasons: ["verifyApproval: ugyldigt input"] };
  const kvP = paths?.kvittering ?? kvitteringPath(pakke, ctx.gateId);
  const apP = paths?.approval ?? approvalPath(pakke, ctx.gateId);
  let bytes;
  try { bytes = git.bytes("show", `${evidenceRef}:${kvP}`); } catch { return { ok: false, reasons: [`kvittering mangler @ ${evidenceRef}:${kvP} (hændelseskæden er ubevist)`] }; }
  const digest = kvitteringDigest(bytes);
  if (approval.kvittering_digest !== digest) fail(`approval.kvittering_digest (${String(approval.kvittering_digest).slice(0, 12)}) ≠ sha256 af committet kvittering (${digest.slice(0, 12)}) — approval refererer en anden kvittering`);
  let kv;
  try { kv = JSON.parse(bytes.toString("utf8")); } catch { return { ok: false, reasons: [...reasons, "kvittering er ikke gyldig JSON"] }; }
  const v = validateKvittering(kv, { ...ctx, pakke });
  reasons.push(...v.reasons);
  if (v.ok) {
    // (3) den tekst Mathias så + devilens PASS er de committede blobs @ evidenceRef
    for (const f of ["fremlaeggelse", "devil"]) {
      let oid = null;
      try { oid = git("rev-parse", "--verify", "--quiet", `${evidenceRef}:${kv[f].path}`); } catch { oid = null; }
      if (oid !== kv[f].blob_oid) fail(`${f}: ${kv[f].path} @ ${evidenceRef} er ${oid ? oid.slice(0, 12) : "fraværende"} ≠ kvitteringens blob ${kv[f].blob_oid.slice(0, 12)} (teksten er ændret efter kvitteringen)`);
    }
  }
  // (4) rækkefølge: kvitteringens sidste berøring er ÆGTE forfader til approvalens sidste berøring
  const sidste = (p) => { const c = git("log", "-1", "--format=%H", evidenceRef, "--", p); return isOid(c) ? c : null; };
  const cK = sidste(kvP), cA = sidste(apP);
  if (!cK) fail("kvitteringens commit kan ikke findes i historikken");
  if (!cA) fail(`approvalens commit kan ikke findes (${apP} @ ${evidenceRef})`);
  if (cK && cA) {
    if (cK === cA) fail("kvittering og approval er i SAMME commit — rækkefølgen er ubevist (kvitteringen skal committes FØR fremlæggelsen sendes)");
    else {
      let forfader = false;
      try { git("merge-base", "--is-ancestor", cK, cA); forfader = true; } catch { forfader = false; }
      if (!forfader) fail(`kvitteringens commit (${cK.slice(0, 7)}) er ikke forfader til approvalens (${cA.slice(0, 7)}) — kvitteringen er ændret efter godkendelsen, eller godkendelsen kom først`);
    }
  }
  return { ok: reasons.length === 0, reasons };
}
