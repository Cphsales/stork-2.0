#!/usr/bin/env node
// recon-gate-run.mjs — udfør-siden af recon-gaten (fase-wiring, plan Fase 1).
//
// Kør: node scripts/v5/recon-gate-run.mjs <pinned-commit-oid>
//
// Læser ALT fra den pinnede commit (aldrig arbejdstræet): launch.json → pakke,
// recon/recon-coverage-proof.json → proof-input. Bygger snapshot (gate-eval),
// binder proof_result til artefakt/bindings-OID'er og kører evaluateGate med
// FRISK re-verifikation (makeProofVerifier: fladen re-deriveres fra rå git).
// Committede filer er evidens/spor — dommen fældes her, in-memory, hver gang.
// Exit 0 ⟺ gaten er åben. Dette er hvad CI's gate-dommer-step kalder.

import { evaluateGate } from "./gates.mjs";
import { buildSnapshot } from "./gate-eval.mjs";
import { makeProofVerifier } from "./proofs.mjs";
import { makeGit } from "./git.mjs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function runReconGate(commitSha, { root = repoRoot } = {}) {
  // top-level fail-closed: enhver exception (manglende launch, brudt repo,
  // malformeret JSON) → RØD med begrundelse, aldrig en boblende crash CI
  // kunne fejltolke. (Samme regel som evaluateGate's egen top-guard.)
  try {
    return runReconGateInner(commitSha, root);
  } catch (e) {
    return { open: false, gate_id: "recon", reasons: [`gate-run kastede (fail-closed): ${e?.message ?? String(e)}`] };
  }
}

function runReconGateInner(commitSha, root) {
  const git = makeGit(root);
  // pakke fra den committede launch (fail-closed: mangler → kast → RØD via top-guard)
  const launch = JSON.parse(git.bytes("show", `${commitSha}:launch/launch.json`).toString("utf8"));
  const pakke = launch.pakke;

  const snapshot = buildSnapshot("recon", { git, commitSha, pakke });

  // proof-input fra committet spor — VERBATIM. Binding-felterne (gate_id ·
  // proof_kind · artifact_oid · bindings_oids · ok) SKAL stå i det committede
  // bevis selv; evaluateGate sammenligner dem mod snapshotens friske OID'er.
  // Codex-fund (2026-09-02): runneren må ALDRIG injicere/overskrive dem fra
  // snapshotet — det gjorde binding-checket til en tautologi, så et stale/
  // generisk bevis kunne åbne gaten for et ÆNDRET recon.md. Mangler felterne →
  // evaluateGate fail-lukker (manglende/mismatchede felter = rød).
  let proofResult = null;
  try {
    const raw = JSON.parse(git.bytes("show", `${commitSha}:recon/recon-coverage-proof.json`).toString("utf8"));
    if (raw !== null && typeof raw === "object" && !Array.isArray(raw)) proofResult = raw;
  } catch {
    proofResult = null; // evaluateGate fail-lukker på manglende proof_result
  }

  return evaluateGate("recon", { ...snapshot, proof_result: proofResult }, { verifyProof: makeProofVerifier({ git }) });
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const commitSha = process.argv[2];
  if (!commitSha) {
    console.error("brug: recon-gate-run.mjs <pinned-commit-oid>");
    process.exit(2);
  }
  const result = runReconGate(commitSha);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.open === true ? 0 : 1);
}
