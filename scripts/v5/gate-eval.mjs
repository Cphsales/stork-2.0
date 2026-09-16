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

import { GATE_REGISTRY, isOid } from "./gates.mjs";
import { posix } from "node:path";
import { resolveRef } from "./git.mjs";
const hasOwnProp = (o, k) => o !== null && typeof o === "object" && Object.prototype.hasOwnProperty.call(o, k);

// node-navn → sti-skabelon (<pakke> substitueres). Dækker alle artefakter +
// bindinger i registryet. EKSPLICIT (ikke skjult antagelse) + injicerbart.
export const DEFAULT_LAYOUT = Object.freeze({
  anker: "launch/launch.json",
  bundle: "recon/bundle.json",
  recon: "recon/recon.md",
  recon2: "plan-build/<pakke>/recon2.md",
  // M-41 B5: plan-gatens øvrige bindinger (fast layout — driveren skriver dem her)
  p8: "plan-build/<pakke>/p8-slutproeve-spec.md",
  ordbog: "plan-build/<pakke>/ordbog.md",
  killlist: "plan-build/<pakke>/kill-list-udkast.md",
  // M-41 C1: forventnings-manifestet (kanonisk K/ac/S/neg-mængde) — plan-gate-binding + build-gate-binding (samme blob)
  manifest: "plan-build/<pakke>/forventnings-manifest.json",
  // M-41 C1/C2: maskinlæsbar angrebs-/måle-spec (build-gate-binding)
  angrebsspec: "plan-build/<pakke>/angrebs-spec.json",
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
  // pinned commit-OID kræves — IKKE 'HEAD', et branch-navn eller en treeish;
  // ellers er bindingen ikke-deterministisk (samme kald, andet indhold efter
  // en ny commit). "alt bundet til ÉN pinned commit" (planens kerne).
  if (!isOid(commitSha))
    throw new Error(`gate-eval: commitSha skal være en pinned commit-OID (fik '${String(commitSha)}')`);
  if (typeof pakke !== "string" || !PAKKE_RE.test(pakke))
    throw new Error(`gate-eval: ugyldig pakke '${String(pakke)}'`);

  // artefakt resolves fra git; findes den ikke @ commit → null-ref (evaluateGate
  // fail-lukker på manglende artefakt).
  // P2-gates F-2 (2026-09-09): to layout-nøgler må ALDRIG resolve til samme fil for én gate —
  // et layout-alias (killlist → recon2-stien) ville lade fem nøgler dække fire inputroller.
  const noder = [gate.artifact, ...gate.bindings];
  const stier = noder.map((n) => posix.normalize(nodePath(n, pakke, layout)));
  if (new Set(stier).size !== stier.length)
    throw new Error(`gate-eval: sammenfaldende input-stier for gate '${gateId}' (${stier.join(" · ")})`);
  // C4b: ci-produceret artefakt injiceres af kalderen (CI's build-job) for gates m. artifactCiProduced — ref'en SKAL bære layout-stien,
  // en OID og type "ci-produced"; for alle andre gates (og uden override) resolves artefaktet fra git som før.
  let artifact;
  if (hasOwnProp(opts, "artifact") && opts.artifact !== undefined) {
    const a = opts.artifact;
    if (gate.artifactCiProduced !== true) throw new Error(`gate-eval: gate '${gateId}' tillader ikke et injiceret artefakt (kun maskinbevis-gates m. ci-produceret artefakt)`);
    if (a === null || typeof a !== "object" || a.type !== "ci-produced" || !isOid(a.oid) || a.path !== nodePath(gate.artifact, pakke, layout)) throw new Error("gate-eval: injiceret artefakt skal være {path: layout-stien, oid: OID, type: 'ci-produced'}");
    artifact = { path: a.path, oid: a.oid, type: "ci-produced" };
  } else artifact = resolveRef(git, commitSha, nodePath(gate.artifact, pakke, layout));
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
