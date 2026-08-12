#!/usr/bin/env node
// checkrun.mjs — v5's check-run-emit-mapping (plan 2.E / DEL V, CI som dommer).
//
// evaluateGate (gates.mjs) afgør åben/lukket; gate-eval.mjs bygger snapshottet fra
// rå git og kører evaluateGate. DETTE modul mapper resultatet til den GitHub
// check-run-PAYLOAD som gate-Actions-workflow'en publicerer under det required
// check-navn `v5/gate/<id>`. Selve `checks:write`-API-kaldet er RUNTIME (gate-
// App/CI-token, DEL V, admin) — her bygges kun payload-formen, som er ren og
// fuldt verificerbar nu.
//
// FAIL-CLOSED (kernen): kun et EKSPLICIT `open === true` giver `success`. Et
// malformeret resultat, en ukendt/mismatchet gate, eller `open` der ikke er
// præcist true → `failure`. Et required check der "mangler"/er tvetydigt må
// ALDRIG blive grønt (anti-tavshed: tvivl = rød gate).

import { GATE_IDS, CHECK_RUN_PREFIX, checkRunName } from "./gates.mjs";

const isPlainObject = (v) => {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const p = Object.getPrototypeOf(v);
  return p === Object.prototype || p === null;
};

// checkRunFromGateResult(gateId, result) → {name, conclusion, output:{title, summary}}
//
// gateId = den gate CI PÅTÆNKER at emittere for (kilde-of-truth for check-navnet,
// så en forged/mismatchet `result.gate_id` ikke kan omdirigere til et andet check).
// result = evaluateGate-output {open, gate_id, reasons}.
export function checkRunFromGateResult(gateId, result) {
  // ukendt gate → fail-closed med et sikkert (ikke-gate-spoofbart) navn
  if (!GATE_IDS.includes(gateId))
    return {
      name: `${CHECK_RUN_PREFIX}invalid`,
      conclusion: "failure",
      output: { title: "v5 gate: ukendt gate", summary: `ukendt gate_id '${String(gateId)}' (fail-closed)` },
    };

  const name = checkRunName(gateId);
  const failure = (summary) => ({ name, conclusion: "failure", output: { title: `${name}: lukket`, summary } });

  if (!isPlainObject(result)) return failure("gate-resultat malformeret/ikke et objekt (fail-closed → failure)");
  // resultatet SKAL være for netop den gate CI emitterer — ellers kunne et grønt
  // resultat for gate X publiceres under gate Y's required check.
  if (result.gate_id !== gateId)
    return failure(`gate-resultat er for '${String(result.gate_id)}' ≠ emitteret gate '${gateId}' (mismatch → failure)`);

  // KUN eksplicit open===true → success (truthy/1/"true"/undefined → failure)
  if (result.open === true)
    return { name, conclusion: "success", output: { title: `${name}: åben`, summary: "Gaten er åben — alle beviser/verdikter/kæde-krav opfyldt." } };

  const reasons = Array.isArray(result.reasons) ? result.reasons.filter((r) => typeof r === "string") : [];
  return failure(reasons.length ? reasons.map((r) => `- ${r}`).join("\n") : "Gaten er lukket (ingen begrundelse angivet).");
}
