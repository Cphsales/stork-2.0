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
// FAIL-CLOSED (kernen): kun et EKSPLICIT eget-data `open === true` (med eget-data
// tomt reasons-array) giver `success`. Et malformeret resultat, en ukendt/
// mismatchet gate, en accessor/arvet open/gate_id, eller open der ikke er præcist
// true → `failure`. Et required check der "mangler"/er tvetydigt må ALDRIG blive
// grønt (anti-tavshed: tvivl = rød gate).
//
// RESIDUAL (ærlig, delt runtime-antagelse): `result` kommer fra evaluateGate's
// plain-object-return. En Proxy (der lyver om descriptors/ownKeys) eller en
// muteret global built-in prototype kan ikke nås af den kilde — begge kræver
// kode-eksekvering i CI, hvorefter en angriber kan emittere et grønt check direkte.
// Object-NIVEAU-arv/accessors ER lukket her (ownData); Proxy/global-mutation er en
// runtime-integritets-antagelse (jf. actors-lock/hooks), ikke en mapper-fejl.

import { GATE_IDS, CHECK_RUN_PREFIX, checkRunName } from "./gates.mjs";

// ownData(o,k): værdien KUN hvis k er en egen DATA-property (ingen getter/setter,
// ikke arvet). En accessor kunne ellers returnere true under checket; en arvet
// (Object.prototype-pollution) property er heller ikke resultatets eget udsagn.
const ownData = (o, k) => {
  const d = Object.getOwnPropertyDescriptor(o, k);
  return d && typeof d.get !== "function" && typeof d.set !== "function" ? { has: true, value: d.value } : { has: false, value: undefined };
};
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
  // resultat for gate X publiceres under gate Y's required check. EGET felt kræves
  // (arvet/accessor gate_id/open må ikke afgøre — prototype-pollution).
  const gid = ownData(result, "gate_id");
  if (!gid.has || gid.value !== gateId)
    return failure(`gate-resultat er for '${String(gid.value)}' ≠ emitteret gate '${gateId}' (mismatch/arvet/accessor → failure)`);

  // reasons SKAL være et eget DATA-array (et manglende/streng/arvet reasons på en
  // open-påstand er malformed — fail-closed). Index-loop, ingen Array-metoder.
  const rd = ownData(result, "reasons");
  const reasonsArr = Array.isArray(rd.value) ? rd.value : null;

  // KUN et eget DATA-felt open===true → success (truthy/1/"true"/arvet/accessor → failure).
  // OG gate-kernens invariant open ⟺ NUL reasons: et open-resultat fra evaluateGate
  // HAR reasons:[]. Manglende/ikke-array/ikke-tom reasons ved open=true → failure.
  const op = ownData(result, "open");
  if (op.has && op.value === true) {
    if (reasonsArr === null)
      return failure("open=true men reasons mangler/er ikke et eget array (malformed → failure)");
    if (reasonsArr.length > 0)
      return failure("inkonsistent resultat: open=true men reasons ikke-tom (invariant open ⟺ nul reasons brudt)");
    return { name, conclusion: "success", output: { title: `${name}: åben`, summary: "Gaten er åben — alle beviser/verdikter/kæde-krav opfyldt." } };
  }
  let summary = "";
  if (reasonsArr) for (let i = 0; i < reasonsArr.length; i++) if (typeof reasonsArr[i] === "string") summary += (summary ? "\n" : "") + "- " + reasonsArr[i];
  return failure(summary || "Gaten er lukket (ingen begrundelse angivet).");
}
