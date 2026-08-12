#!/usr/bin/env node
// gates.mjs — v5 gate-kernen (plan 2.A): registry + PURE evaluateGate.
//
// Autoritet = CI's friske evaluateGate emitteret som required check-run
// `v5/gate/<id>`. Ingen committet fil er autoritet — dette modul re-deriverer
// alt fra snapshottet (bygget fra rå git af CI/driveren) + dette runs friske
// evidens. Fail-closed-by-default: manglende/tomt/forkert-typet felt = RØD.
// Ingen I/O her — verifyProof/verifyVerdict injiceres og RE-KØRES (en
// committet `ok:true` trustes aldrig).

import { createHash } from "node:crypto";

export const APPROVER = "mgrubak";
export const ACTOR_SLUGS = Object.freeze(["code", "codex", "code-reviewer", "claude-ai"]);
export const PROOF_KINDS = Object.freeze(["recon-coverage", "build-proof", "chain-proof"]);
export const PAKKE_RE = /^[a-z][a-z0-9-]*$/;

// Registry = eneste sandhed for gate-topologien. Evidens-typen er EKSPLICIT
// pr. gate: proofKind (maskine) · expectedActors (verdikter) · approver
// (menneske). `predecessorBinding` = den binding-nøgle hvis OID SKAL være
// forgængerens artefakt-OID (indholds-bundet kæde — et {open:true} uden
// indholds-match åbner intet).
// deepFreeze: fryser også de indlejrede arrays (bindings/expectedActors) — en
// shallow freeze ville lade registryet mutere i memory.
const deepFreeze = (o) => {
  if (o !== null && typeof o === "object") {
    for (const v of Object.values(o)) deepFreeze(v);
    Object.freeze(o);
  }
  return o;
};

export const GATE_REGISTRY = deepFreeze([
  {
    id: "recon",
    predecessor: null,
    predecessorBinding: null,
    artifact: "recon",
    bindings: ["anker", "bundle"],
    proofKind: "recon-coverage",
    expectedActors: [],
    approver: null,
    orderedApproval: false,
  },
  {
    id: "krav",
    predecessor: "recon",
    predecessorBinding: "recon",
    artifact: "krav",
    bindings: ["recon", "anker"],
    proofKind: null,
    expectedActors: ["code", "codex"],
    approver: APPROVER,
    orderedApproval: true,
  },
  {
    id: "plan",
    predecessor: "krav",
    predecessorBinding: "krav",
    artifact: "plan",
    bindings: ["krav", "recon2"],
    proofKind: null,
    expectedActors: ["code-reviewer", "codex", "claude-ai"],
    approver: APPROVER,
    orderedApproval: false,
  },
  {
    id: "build",
    predecessor: "plan",
    predecessorBinding: "plan",
    artifact: "build-proof",
    bindings: ["plan"],
    proofKind: "build-proof",
    expectedActors: [],
    approver: null,
    orderedApproval: false,
  },
  {
    id: "slut",
    predecessor: "build",
    predecessorBinding: "build",
    artifact: "chain-proof",
    bindings: ["plan", "krav", "build"],
    proofKind: "chain-proof",
    expectedActors: [],
    approver: APPROVER,
    orderedApproval: false,
  },
]);

export const GATE_IDS = Object.freeze(GATE_REGISTRY.map((g) => g.id));
export const CHECK_RUN_PREFIX = "v5/gate/";
export const checkRunName = (gateId) => `${CHECK_RUN_PREFIX}${gateId}`;

// ---------- kanonisk digest (sorterede nøgler — nøgle-orden kan aldrig ændre digest) ----------

export function canonicalJson(value) {
  if (value === null) return "null";
  const t = typeof value;
  if (t === "number") {
    if (!Number.isFinite(value)) throw new Error("canonicalJson: ikke-finit tal");
    return JSON.stringify(value);
  }
  if (t === "boolean" || t === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (t === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(",")}}`;
  }
  throw new Error(`canonicalJson: utilladt type ${t}`); // undefined/function/symbol → aldrig tavst droppet
}

export const digestOf = (value) => createHash("sha256").update(canonicalJson(value)).digest("hex");

export const scopeDigest = (gateId, artifactOid, bindingsOids) =>
  digestOf({ gate_id: gateId, artifact_oid: artifactOid, bindings_oids: bindingsOids });

// ---------- fail-closed primitiver ----------

const isNonEmptyString = (v) => typeof v === "string" && v.length > 0;
const OID_RE = /^[0-9a-f]{40}(?:[0-9a-f]{24})?$/; // sha1- eller sha256-objectformat
export const isOid = (v) => typeof v === "string" && OID_RE.test(v);
const hasOwn = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
// plain object KUN: en ikke-standard prototype kan bære gyldigt-udseende arvede
// felter — afvis (fail-closed; CI/gate-eval bygger plain objekter).
const isPlainObj = (v) => {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const p = Object.getPrototypeOf(v);
  return p === Object.prototype || p === null;
};
// Kædens artefakter + bindinger er ALTID filer (recon.md · krav.md · plan.md ·
// launch.json · *-proof.json · bundle.json · recon2.md). Kræv derfor BLOB —
// en mappe (tree) på artefakt-/binding-stien må ALDRIG kunne åbne en gate
// (et gyldigt fil-artefakt findes ikke, selvom stien resolver til et tree).
// EGNE felter kræves (Object.prototype-pollution må ikke udfylde en ref).
const isRef = (r) =>
  isPlainObj(r) &&
  hasOwn(r, "path") && isNonEmptyString(r.path) &&
  hasOwn(r, "oid") && isOid(r.oid) &&
  hasOwn(r, "type") && r.type === "blob";

const bindingsOidMap = (snapshotBindings, keys) => {
  const out = {};
  for (const k of keys) out[k] = snapshotBindings?.[k]?.oid;
  return out;
};

const sameOidMap = (claimed, expected) => {
  if (claimed === null || typeof claimed !== "object" || Array.isArray(claimed)) return false;
  const ck = Object.keys(claimed).sort();
  const ek = Object.keys(expected).sort();
  if (ck.length !== ek.length || ck.some((k, i) => k !== ek[i])) return false;
  return ck.every((k) => isOid(claimed[k]) && claimed[k] === expected[k]);
};

// ---------- evaluateGate — PURE · åben ⟺ nul reasons ----------
//
// snapshot (bygget af CI fra rå git ved ÉN pinned commit):
// {
//   commit_sha,                                  // provenance (binding sker på OIDs)
//   artifact: {path, oid, type},
//   bindings: {<nøgle>: {path, oid, type}},      // præcis registryets nøgler
//   proof_result: {ok, gate_id, proof_kind, artifact_oid, bindings_oids, ...payload} | null,
//   verdicts: [<verdikt-objekt, se verdikt.mjs>],
//   approval: {login_server_verified, gate_id, scope_digest, prerequisite_digests?} | null,
//   predecessor: {gate_id, conclusion, artifact_oid} | null,  // forgængerens check-run-resumé
// }
// deps: { verifyProof(proof_result, snapshot) → {ok, reasons},
//         verifyVerdict(verdict, snapshot)   → {ok, reasons} }  — RE-KØRES her.

export function evaluateGate(gateId, snapshot, deps = {}) {
  // Top-level fail-closed: enhver uventet exception (dårligt input, en dep der
  // kaster) → RØD med begrundelse, aldrig en boblende crash CI kunne fejltolke.
  try {
    return evaluateGateInner(gateId, snapshot, deps);
  } catch (e) {
    return { open: false, gate_id: gateId, reasons: [`evaluering kastede (fail-closed): ${e?.message ?? String(e)}`] };
  }
}

function evaluateGateInner(gateId, snapshot, deps = {}) {
  const reasons = [];
  const fail = (r) => reasons.push(r);

  const gate = GATE_REGISTRY.find((g) => g.id === gateId);
  if (!gate) return { open: false, gate_id: gateId, reasons: [`ukendt gate_id: ${String(gateId)}`] };
  if (snapshot === null || typeof snapshot !== "object" || Array.isArray(snapshot))
    return { open: false, gate_id: gateId, reasons: ["snapshot mangler/ugyldig"] };
  // plain object KUN: en ikke-standard prototype (Object.create(...)) kan bære
  // gyldigt-udseende felter arvet — afvis (fail-closed; JSON/gate-eval er plain).
  const sp = Object.getPrototypeOf(snapshot);
  if (sp !== Object.prototype && sp !== null)
    return { open: false, gate_id: gateId, reasons: ["snapshot har ikke-standard prototype (manipuleret)"] };

  // 1) pinned commit + artefakt + bindinger findes (OID + type fra rå git).
  // EGNE felter kræves overalt — Object.prototype-pollution må ikke udfylde et
  // required snapshot-felt (snapshot={} med felter arvet fra en forurenet
  // prototype åbnede ellers gaten).
  // commit_sha SKAL være en pinned OID — en mutable ref (HEAD/branch/tag) ville
  // lade gaten binde til flytbart indhold (falsk-grøn: pin brydes mekanisk).
  if (!hasOwn(snapshot, "commit_sha") || !isOid(snapshot.commit_sha)) fail("commit_sha mangler/ikke en pinned OID (mutable ref som HEAD forbudt)");
  if (!hasOwn(snapshot, "artifact") || !isRef(snapshot.artifact)) fail("artifact-ref mangler/ugyldig (path+oid+type kræves)");
  const bindings = hasOwn(snapshot, "bindings") && isPlainObj(snapshot.bindings) ? snapshot.bindings : null;
  if (!bindings) fail("bindings mangler/ugyldig (eget plain object kræves)");
  const bindingKeys = bindings ? Object.keys(bindings) : [];
  for (const k of gate.bindings) if (!(bindings && hasOwn(bindings, k) && isRef(bindings[k]))) fail(`binding '${k}' mangler/ugyldig`);
  for (const k of bindingKeys)
    if (!gate.bindings.includes(k)) fail(`uventet binding '${k}' (fail-closed: ukendt = rød)`);
  if (reasons.length) return { open: false, gate_id: gateId, reasons };

  const expectedOids = bindingsOidMap(bindings, gate.bindings);
  const artifactOid = snapshot.artifact.oid;

  // 2+3) maskine-bevis: typed binding + frisk re-verifikation
  if (gate.proofKind !== null) {
    const p = hasOwn(snapshot, "proof_result") ? snapshot.proof_result : null;
    if (!isPlainObj(p)) fail(`proof_result mangler (gate kræver ${gate.proofKind})`);
    else {
      if (!hasOwn(p, "ok") || p.ok !== true) fail("proof_result.ok er ikke eksplicit true"); // 'true'/1/undefined/arvet = rød
      if (!hasOwn(p, "gate_id") || p.gate_id !== gateId) fail(`proof gate_id-binding brudt: ${String(p.gate_id)}`);
      if (!hasOwn(p, "proof_kind") || p.proof_kind !== gate.proofKind)
        fail(`proof proof_kind-binding brudt: ${String(p.proof_kind)} ≠ ${gate.proofKind}`);
      if (!hasOwn(p, "artifact_oid") || p.artifact_oid !== artifactOid)
        fail("proof artifact_oid-binding brudt (generisk/genbrugt bevis åbner intet)");
      if (!hasOwn(p, "bindings_oids") || !sameOidMap(p.bindings_oids, expectedOids)) fail("proof bindings_oids-binding brudt");
      if (typeof deps.verifyProof !== "function")
        fail("verifyProof-dep mangler (fail-closed: ingen frisk re-verifikation = rød)");
      else {
        const rv = deps.verifyProof(p, snapshot);
        if (rv?.ok !== true) fail(`frisk verifyProof fejlede: ${(rv?.reasons ?? ["intet resultat"]).join("; ")}`);
      }
    }
  } else if (hasOwn(snapshot, "proof_result") && snapshot.proof_result != null) {
    fail("uventet proof_result på gate uden proofKind (fail-closed)");
  }

  // 4+5) aktør-verdikter: præcis ét PASS pr. forventet aktør, hvert bundet + frisk re-verificeret
  const verdictDigests = [];
  if (gate.expectedActors.length > 0) {
    const vs = hasOwn(snapshot, "verdicts") ? snapshot.verdicts : undefined;
    if (!Array.isArray(vs)) fail("verdicts mangler (anti-tavshed: fuldt sæt kræves)");
    else {
      const byActor = new Map();
      for (const v of vs) {
        const a = v?.aktor;
        if (!gate.expectedActors.includes(a)) {
          fail(`uventet aktør-verdikt: ${String(a)}`);
          continue;
        }
        if (byActor.has(a)) {
          fail(`dublet-verdikt for aktør ${a}`);
          continue;
        }
        byActor.set(a, v);
      }
      const expectedOidSet = [artifactOid, ...Object.values(expectedOids)];
      for (const a of gate.expectedActors) {
        const v = byActor.get(a);
        if (!v) {
          fail(`manglende verdikt fra ${a} (tavshed ≠ ja)`);
          continue;
        }
        if (v.conclusion !== "PASS") {
          fail(`${a}-verdikt er ikke PASS (${String(v.conclusion)}) — FAIL/HALT/mangler blokerer`);
          continue;
        }
        let clean = true;
        const bad = (r) => {
          fail(r);
          clean = false;
        };
        if (v.gate_id !== gateId) bad(`${a}-verdikt gate_id-binding brudt`);
        if (v.artifact_oid !== artifactOid) bad(`${a}-verdikt artifact_oid-binding brudt (stale/forkert artefakt)`);
        if (!sameOidMap(v.bindings_oids, expectedOids)) bad(`${a}-verdikt bindings_oids-binding brudt`);
        // evidens-relevans: aktøren SKAL have erklæret at læse hele det gatede
        // input (artefakt + alle bindinger), og et citat der IKKE hører til
        // en af dem tæller ikke (fund 1: citat af launch.json ≠ læsning af krav).
        if (!Array.isArray(v.input_oids_read) || !expectedOidSet.every((o) => v.input_oids_read.includes(o)))
          bad(`${a}-verdikt input_oids_read dækker ikke artefakt+bindinger (ubevist læsning af gatet input)`);
        if (Array.isArray(v.evidence)) {
          const cited = v.evidence.map((e) => e?.blob_oid);
          if (!cited.includes(artifactOid))
            bad(`${a}-verdikt citerer ikke selve artefaktet (læsebevis mangler for ${gate.artifact})`);
          if (!cited.every((o) => expectedOidSet.includes(o)))
            bad(`${a}-verdikt citerer en OID uden for artefakt+bindinger`);
        }
        if (typeof deps.verifyVerdict !== "function") bad("verifyVerdict-dep mangler (fail-closed)");
        else {
          const rv = deps.verifyVerdict(v, snapshot);
          if (rv?.ok !== true)
            bad(`frisk verifyVerdict(${a}) fejlede: ${(rv?.reasons ?? ["intet resultat"]).join("; ")}`);
        }
        // digest kun RENE verdikter — undgår digestOf-kast på et allerede-forkastet
        // verdikt (fail-crash), og orderedApproval kræver alligevel fuldt rent sæt.
        if (clean) verdictDigests.push(digestOf(v));
      }
    }
  } else if (hasOwn(snapshot, "verdicts") && Array.isArray(snapshot.verdicts) && snapshot.verdicts.length > 0) {
    fail("uventede verdikter på gate uden expectedActors (fail-closed)");
  }

  // 6) approver: server-verificeret login + indholds-bundet scope (anti-replay) + rækkefølge-bevis
  if (gate.approver !== null) {
    const a = hasOwn(snapshot, "approval") ? snapshot.approval : null;
    if (!isPlainObj(a)) fail(`approval mangler (gate kræver ${gate.approver})`);
    else {
      const allowedKeys = ["login_server_verified", "gate_id", "scope_digest", "prerequisite_digests"];
      for (const k of Object.keys(a)) if (!allowedKeys.includes(k)) fail(`approval: uventet felt '${k}' (fail-closed)`);
      // egne felter kræves (arvet login/scope må ikke godkende)
      if (!hasOwn(a, "login_server_verified") || a.login_server_verified !== gate.approver)
        fail(`approval-login er ikke ${gate.approver} (server-verificeret kræves)`);
      if (!hasOwn(a, "gate_id") || a.gate_id !== gateId) fail("approval gate_id-binding brudt");
      const expectedScope = scopeDigest(gateId, artifactOid, expectedOids);
      if (!hasOwn(a, "scope_digest") || a.scope_digest !== expectedScope) fail("approval scope_digest matcher ikke artefakt+bindinger (anti-replay)");
      if (gate.orderedApproval) {
        // krav 5: Mathias SIDST — approval SKAL referere præcis de friske verdikt-digests.
        const pd = hasOwn(a, "prerequisite_digests") ? a.prerequisite_digests : undefined;
        if (!Array.isArray(pd)) fail("orderedApproval: prerequisite_digests mangler (rækkefølge ubevist)");
        else {
          const want = [...verdictDigests].sort();
          const got = [...pd].sort();
          const match =
            verdictDigests.length === gate.expectedActors.length &&
            want.length === got.length &&
            want.every((d, i) => d === got[i]);
          if (!match)
            fail(
              "orderedApproval: prerequisite_digests matcher ikke de faktiske aktør-verdikter (krav OK før/uden verdikter er umuligt)",
            );
        }
      } else if (hasOwn(a, "prerequisite_digests")) {
        fail("approval: prerequisite_digests uventet på ikke-ordered gate (fail-closed)");
      }
    }
  } else if (hasOwn(snapshot, "approval") && snapshot.approval != null) {
    fail("uventet approval på gate uden approver (fail-closed)");
  }

  // 7) kæden: forgængerens check SKAL være success OG indholds-bundet til bindingen
  // (egne felter kræves — en arvet predecessor må ikke kæde gaten videre)
  if (gate.predecessor !== null) {
    const pre = hasOwn(snapshot, "predecessor") ? snapshot.predecessor : null;
    if (!isPlainObj(pre))
      fail(`predecessor-check mangler (kæde: ${gate.predecessor} → ${gateId})`);
    else {
      if (!hasOwn(pre, "gate_id") || pre.gate_id !== gate.predecessor)
        fail(`predecessor gate_id er ${String(pre.gate_id)}, kræver ${gate.predecessor}`);
      if (!hasOwn(pre, "conclusion") || pre.conclusion !== "success") fail(`predecessor-check er ikke success (${String(pre.conclusion)})`);
      const boundOid = bindings && hasOwn(bindings, gate.predecessorBinding) ? bindings[gate.predecessorBinding]?.oid : undefined;
      if (!hasOwn(pre, "artifact_oid") || !isOid(pre.artifact_oid) || pre.artifact_oid !== boundOid)
        fail(
          "predecessor artifact_oid matcher ikke bindingen (indholds-bundet kæde — {open:true} uden indhold åbner intet)",
        );
    }
  } else if (hasOwn(snapshot, "predecessor") && snapshot.predecessor != null) {
    fail("uventet predecessor på rod-gate (fail-closed)");
  }

  return { open: reasons.length === 0, gate_id: gateId, reasons };
}
