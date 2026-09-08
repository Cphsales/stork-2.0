#!/usr/bin/env node
// krav-gate-run.mjs — udfør-siden af krav-gaten (M-40 A1: spejl af recon-gate-run).
//
// Kør: node scripts/v5/krav-gate-run.mjs <pinned-commit-oid>
//
// Læser ALT fra den pinnede commit + committede evidens-filer: launch → pakke,
// verdikt-filer + approval fra plan-build/<pakke>/ (nyeste committede @ HEAD —
// evidens er durabel, dommen fældes FRISK her: verifyProof/verifyVerdict
// re-køres mod rå git, forgængeren (recon) re-dømmes in-memory). Committede
// filer er spor — aldrig autoritet. Exit 0 ⟺ gaten er åben.
import { evaluateGate } from "./gates.mjs";
import { buildSnapshot } from "./gate-eval.mjs";
import { makeProofVerifier } from "./proofs.mjs";
import { makeVerdictVerifier } from "./verdikt.mjs";
import { runReconGate } from "./recon-gate-run.mjs";
import { makeGit } from "./git.mjs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { realpathSync } from "node:fs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function runKravGate(commitSha, { root = repoRoot, evidenceRef = "HEAD" } = {}) {
  try {
    return runKravGateInner(commitSha, root, evidenceRef);
  } catch (e) {
    return { open: false, gate_id: "krav", reasons: [`gate-run kastede (fail-closed): ${e?.message ?? String(e)}`] };
  }
}

function runKravGateInner(commitSha, root, evidenceRef) {
  const git = makeGit(root);
  const launch = JSON.parse(git.bytes("show", `${commitSha}:launch/launch.json`).toString("utf8"));
  const pakke = launch.pakke;
  const snapshot = buildSnapshot("krav", { git, commitSha, pakke });

  // committet evidens (spor): verdikter + approval læses fra evidenceRef
  // (typisk HEAD — de ligger efter gate-committen i historikken)
  const læs = (p) => JSON.parse(git.bytes("show", `${evidenceRef}:plan-build/${pakke}/${p}`).toString("utf8"));
  const verdicts = [læs("verdikt-code-krav-r4b.json"), læs("verdikt-codex-krav-r4b.json")];
  const approvalFil = læs("krav-approval.json");
  // VERBATIM (batch-pas-fund 2026-09-08): approval-data læses som den er —
  // plukning VASKEDE ukendte felter væk som kernens additionalProperties-værn
  // ellers afviser (fail-open). Format: { approval: {…schema-felter…},
  // _provenance: {…spor…} } — kun .approval sendes videre, U-RØRT; bagud-
  // kompatibelt: fladt format sendes videre i sin HELHED (kernen afviser så
  // selv _provenance som ukendt felt — fail-closed, aldrig laundering).
  const approval = approvalFil.approval ?? approvalFil;

  // forgænger: recon-gaten re-dømmes FRISK ved samme pinnede commit
  const recon = runReconGate(commitSha, { root });
  const predecessor = {
    gate_id: "recon",
    conclusion: recon.open === true ? "success" : "failure",
    artifact_oid: snapshot.bindings?.recon?.oid ?? null,
  };

  return evaluateGate(
    "krav",
    { ...snapshot, verdicts, approval, predecessor },
    { verifyProof: makeProofVerifier({ git }), verifyVerdict: makeVerdictVerifier({ git }) },
  );
}

// symlink-sikker CLI-detektion (batch-pas-fund: import.meta.url ≠ argv[1] gennem
// symlink → hele evalueringen sprunget over m. exit 0 = fail-open)
const erCliKald = (() => {
  if (!process.argv[1] || process.argv[1] === "-") return false; // stdin-import er aldrig CLI
  try {
    // match både rå og realpath'et entry (dækker symlink + --preserve-symlinks-main)
    if (import.meta.url === pathToFileURL(process.argv[1]).href) return true;
    return import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
  } catch (e) {
    // delta-pas-fund F1: identifikations-fejl må ALDRIG blive tavs exit 0 —
    // fail-closed med nonzero (en legitim importør har altid resolverbar argv[1])
    console.error(`CLI-entry-identifikation fejlede (fail-closed): ${e?.message ?? e}`);
    process.exit(3);
  }
})();
if (erCliKald) {
  const commitSha = process.argv[2];
  if (!commitSha) { console.error("brug: krav-gate-run.mjs <pinned-commit-oid>"); process.exit(2); }
  const result = runKravGate(commitSha);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.open === true ? 0 : 1);
}
