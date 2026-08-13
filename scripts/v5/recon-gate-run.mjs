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
  const git = makeGit(root);
  // pakke fra den committede launch (fail-closed: mangler → kast → RØD)
  const launch = JSON.parse(git.bytes("show", `${commitSha}:launch/launch.json`).toString("utf8"));
  const pakke = launch.pakke;

  const snapshot = buildSnapshot("recon", { git, commitSha, pakke });

  // proof-input fra committet spor; bindes til snapshotens OID'er så et
  // genbrugt/generisk bevis aldrig kan åbne gaten.
  let proofResult = null;
  try {
    const raw = JSON.parse(git.bytes("show", `${commitSha}:recon/recon-coverage-proof.json`).toString("utf8"));
    proofResult = {
      ...raw,
      ok: true,
      gate_id: "recon",
      proof_kind: "recon-coverage",
      artifact_oid: snapshot.artifact?.oid ?? null,
      bindings_oids: {
        anker: snapshot.bindings?.anker?.oid ?? null,
        bundle: snapshot.bindings?.bundle?.oid ?? null,
      },
    };
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
