#!/usr/bin/env node
// proofs.mjs — v5's verifyProof-implementeringer (plan 2.C).
//
// Plugges ind i evaluateGate (gates.mjs) som deps.verifyProof. Gate-kernen
// RE-KØRER disse mod rå input hvert run — en committet `ok:true` trustes aldrig.
// Hver proof har en U-FORFALSKELIG mekanisk kerne (re-derivér/re-verificér mod
// rå git) + en ærligt navngiven enforcement-residual (den del der håndhæves af
// driver/sandbox, ikke af en ren funktion).
//
// Bygget nu: recon-coverage (recon-gaten) — hviler på coverage.mjs's
// uafhængige flade-derivation; build-proof (build-gaten) — struktur-gulve +
// git-forankret claim_graph (build-proof.mjs). chain-proof er endnu IKKE bygget
// (held-out reel data efter build kræver en rigtig pakke — anti-tailoring-kernen
// kan ikke bevises uden reel data). Routeren fail-lukker for chain-proof, så
// slut-gaten IKKE kan åbne før den er bygget (ærligt, ikke stub-grønt).

import { deriveSurface, checkBucketCoverage, filterSurface } from "./coverage.mjs";
import { verifyBuildProof } from "./build-proof.mjs";

const RECON_ACTORS = Object.freeze(["code", "codex", "claude-ai"]);
const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
// plain object KUN: en ikke-standard prototype (Object.create(...)) kan maskere
// manglende evidens-felter som arvede — afvis den (fail-closed). JSON-parset
// evidens er altid plain; kun manipuleret/prototype-polluted JS rammes.
const isPlainObject = (v) => {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const p = Object.getPrototypeOf(v);
  return p === Object.prototype || p === null;
};

// verifyReconCoverageProof(proof, snapshot, {git}) → {ok, reasons}
//
// U-forfalskelig kerne: CI re-deriverer fladen FRISK fra den gatede tree
// (deriveSurface) og kræver at recon klassificerer HVERT deriveret punkt i en
// bøtte (checkBucketCoverage). En aktør kan ikke påstå dækning — fladen
// genberegnes fra rå git.
//
// ENFORCEMENT-RESIDUAL (ærligt): den reelle 3-blind-uafhængighed (separat
// workdir · web-forbud · læse-forbud) håndhæves af driveren/sandboxen (plan
// 2.F/2.E) ved KØRSEL. Her verificeres kun at attesterne er strukturelt til
// stede og bundet til det fælles bundle-OID — ikke at blindheden faktisk holdt.
export function verifyReconCoverageProof(proof, snapshot, { git }) {
  const reasons = [];
  const fail = (r) => reasons.push(r);
  if (typeof git !== "function") return { ok: false, reasons: ["git-dep mangler (fail-closed)"] };
  if (!isPlainObject(proof)) return { ok: false, reasons: ["recon-coverage-proof er ikke et objekt"] };

  // 1) mekanisk kerne: frisk flade-re-derivation + PAKKE-filter + bøtte-dækning
  //
  // Pakke-fladen (Mathias 2026-08-13: recon dækker KUN pakkens flade, som
  // håndhævet STRUKTUR, ikke husket disciplin): filteret læses fra det OID-
  // bundne bundle (snapshot.bindings.bundle.oid) — samme artefakt aktørerne
  // attesterer at have læst. Uforfalskeligt: filteret kan ikke ændres uden at
  // bundle-OID (og dermed aktør-bindingen) brydes. flade_filter er PÅKRÆVET —
  // fravær = rød (eksplicit deklaration > default: en glemt deklaration må
  // aldrig tavst blive til fuld-flade-krav eller intet krav). Ulæseligt
  // bundle/malformet filter → rød (scope må aldrig gættes).
  if (!isPlainObject(proof.bucket_map)) fail("bucket_map mangler/er ikke et objekt");
  else {
    let surface;
    try {
      surface = deriveSurface({ git, commitSha: snapshot?.commit_sha });
      const bundleOid = snapshot?.bindings?.bundle?.oid;
      if (typeof bundleOid !== "string" || bundleOid.length === 0)
        throw new Error("bundle-binding mangler (pakke-fladen kan ikke afgøres)");
      const bundle = JSON.parse(git.bytes("cat-file", "blob", bundleOid).toString("utf8"));
      if (!isPlainObject(bundle)) throw new Error("bundle er ikke et objekt");
      if (!hasOwn(bundle, "flade_filter"))
        throw new Error("flade_filter mangler i bundlet (pakke-scope skal deklareres eksplicit — fravær = rød)");
      surface = filterSurface(surface, bundle.flade_filter);
    } catch (e) {
      return { ok: false, reasons: [`pakke-flade-derivation fejlede (fail-closed): ${e?.message ?? e}`] };
    }
    const cov = checkBucketCoverage(surface, proof.bucket_map);
    if (!cov.ok) fail(...cov.reasons);
  }

  // 2) 3-blind struktur: fælles bundle-OID + fuldt aktør-sæt + attester til stede
  const ind = proof.independence;
  if (!isPlainObject(ind)) fail("independence mangler/er ikke et objekt");
  else {
    const expectedBundle = snapshot?.bindings?.bundle?.oid;
    if (!expectedBundle || ind.bundle_oid !== expectedBundle)
      fail("independence.bundle_oid matcher ikke det gatede bundle (aktørerne læste ikke samme input)");
    if (!Array.isArray(ind.actors)) fail("independence.actors mangler");
    else {
      const seen = new Set();
      for (const a of ind.actors) {
        if (!isPlainObject(a) || !RECON_ACTORS.includes(a.aktor)) {
          fail(`ukendt/ugyldig recon-aktør: ${String(a?.aktor)}`);
          continue;
        }
        if (seen.has(a.aktor)) fail(`dublet recon-aktør: ${a.aktor}`);
        seen.add(a.aktor);
        // attester: egne, eksplicit true (fail-closed — manglende/arvet/falsy = rød)
        for (const attest of ["workdir_attest", "web_forbud_attest", "read_forbud_attest"])
          if (!hasOwn(a, attest) || a[attest] !== true) fail(`${a.aktor}: ${attest} ikke eksplicit true`);
      }
      for (const want of RECON_ACTORS) if (!seen.has(want)) fail(`manglende recon-aktør: ${want} (anti-tavshed)`);
    }
  }

  // 3) konflikt-bevaring + omission-devil (begge eksplicit)
  // Devil'en dømmer på TO akser (filteret HAR en dommer — driver-forfattet
  // scope-krympning må aldrig stå udømt): (a) filter_angreb — flade_filter
  // angrebet mod den FULDE deriverede flade (pakke-relevant punkt udeladt?);
  // (b) pakke_flade_angreb — misset inden for pakke-fladen. Begge attesteres
  // eksplicit med egne felter; manglende/arvet akse = rød.
  if (proof.conflicts_preserved !== true) fail("conflicts_preserved ikke eksplicit true (kasseret uenighed → rød)");
  if (!isPlainObject(proof.omission_devil) || proof.omission_devil.conclusion !== "PASS")
    fail("omission-devil ikke PASS");
  else
    for (const akse of ["filter_angreb", "pakke_flade_angreb"])
      if (!hasOwn(proof.omission_devil, akse) || proof.omission_devil[akse] !== "PASS")
        fail(`omission-devil: aksen '${akse}' ikke eksplicit PASS (filter/pakke-flade skal begge dømmes)`);

  return { ok: reasons.length === 0, reasons };
}

// makeProofVerifier({git}) → (proof, snapshot) => {ok, reasons}
// Router på proof.proof_kind. Ukendt/endnu-ikke-bygget kind = fail-closed rød →
// den gate kan IKKE åbne. (evaluateGate binder allerede proof_kind til gaten;
// dette er defense-in-depth + eksplicit "ikke bygget endnu".)
export function makeProofVerifier({ git }) {
  return (proof, snapshot) => {
    switch (proof?.proof_kind) {
      case "recon-coverage":
        return verifyReconCoverageProof(proof, snapshot, { git });
      case "build-proof":
        return verifyBuildProof(proof, snapshot, { git });
      case "chain-proof":
        return {
          ok: false,
          reasons: [`proof-kind '${proof.proof_kind}' er endnu ikke bygget (fail-closed) — kræver held-out reel data (rigtig pakke)`],
        };
      default:
        return { ok: false, reasons: [`ukendt proof_kind: ${String(proof?.proof_kind)} (fail-closed)`] };
    }
  };
}
