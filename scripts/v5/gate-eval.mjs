#!/usr/bin/env node
// gate-eval.mjs — v5's server-side dommer-entrypoint (plan 2.G/CI-gate).
//
// Broen fra RÅ GIT til evaluateGate: bygger GateSnapshot for én gate ved én
// pinned commit (artefakt + bindinger resolvet fra git via et EKSPLICIT
// layout), og kører evaluateGate + de rette verifikatorer. Dette er det CI
// kalder server-side; resultatet bliver check-run'et `v5/gate/<id>`.
//
// Evidensen (proof-input · verdikter · approval · forgænger-check) INJICERES
// af kalderen — den kommer fra forskellige kilder i en rigtig kørsel (CI's
// in-memory proof-produktion · committede verdikt-filer · approval-metadata ·
// forrige check-run). Her er ansvaret git-resolution + integration; kilde-
// wiring hører til fase-wiring. Kernen (resolve → evaluateGate) er ren og
// testbar lokalt mod et git-fixture.

import { GATE_REGISTRY } from "./gates.mjs";
import { resolveRef } from "./git.mjs";

// node-navn → sti-skabelon (<pakke> substitueres). Dækker alle artefakter +
// bindinger i registryet. EKSPLICIT (ikke skjult antagelse) + injicerbart.
export const DEFAULT_LAYOUT = Object.freeze({
  anker: "launch/launch.json",
  bundle: "recon/bundle.json",
  recon: "recon/recon.md",
  recon2: "plan-build/<pakke>/recon2.md",
  krav: "docs/sandhed/krav/<pakke>-krav.md",
  plan: "plan-build/<pakke>/plan.md",
  build: "plan-build/<pakke>/build-proof.json",
  "build-proof": "plan-build/<pakke>/build-proof.json",
  "chain-proof": "plan-build/<pakke>/chain-proof.json",
});

const PAKKE_RE = /^[a-z][a-z0-9-]*$/; // anti-traversal (samme som launcher)

function nodePath(node, pakke, layout) {
  const tmpl = layout[node];
  if (tmpl === undefined) throw new Error(`gate-eval: intet sti-layout for node '${node}'`);
  return tmpl.replaceAll("<pakke>", pakke);
}

// buildSnapshot(gateId, {git, commitSha, pakke, layout, proofResult, verdicts,
//   approval, predecessor}) → GateSnapshot (til evaluateGate).
// Resolver artefakt + bindinger fra git; evidens fra kalderen (fail-closed
// defaults: proof=null, verdicts=[], approval=null, predecessor=null).
export function buildSnapshot(gateId, opts) {
  const { git, commitSha, pakke, layout = DEFAULT_LAYOUT } = opts;
  const gate = GATE_REGISTRY.find((g) => g.id === gateId);
  if (!gate) throw new Error(`gate-eval: ukendt gate '${String(gateId)}'`);
  if (typeof git !== "function") throw new Error("gate-eval: git-dep mangler");
  if (typeof commitSha !== "string" || commitSha.length === 0) throw new Error("gate-eval: commitSha mangler");
  if (typeof pakke !== "string" || !PAKKE_RE.test(pakke))
    throw new Error(`gate-eval: ugyldig pakke '${String(pakke)}'`);

  // artefakt resolves fra git; findes den ikke @ commit → null-ref (evaluateGate
  // fail-lukker på manglende artefakt).
  const artifact = resolveRef(git, commitSha, nodePath(gate.artifact, pakke, layout));
  const bindings = {};
  for (const b of gate.bindings) bindings[b] = resolveRef(git, commitSha, nodePath(b, pakke, layout));

  return {
    commit_sha: commitSha,
    artifact,
    bindings,
    proof_result: opts.proofResult ?? null,
    verdicts: opts.verdicts ?? [],
    approval: opts.approval ?? null,
    predecessor: opts.predecessor ?? null,
  };
}
