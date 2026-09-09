#!/usr/bin/env node
// plan-gate-run.mjs — udfør-siden af plan-gaten (M-41 B5/B7: spejl af krav-gate-run + kvittering).
//
// Kør: node scripts/v5/plan-gate-run.mjs <pinned-commit-oid>
//
// Læser ALT fra den pinnede commit + committede evidens-filer @ evidenceRef (HEAD):
// launch → pakke · plan + 5 bindinger (krav · recon2 · p8 · ordbog · killlist) fra
// gate-eval-layoutet · verdikter (code-reviewer · codex · claude-ai) udvalgt via
// plan-approval.json._provenance.verdikt_run_ids · approval · KVITTERING (kvittering.mjs:
// digest + indhold + fremlæggelses-/devil-blobs + commit-orden) · forgængeren (krav)
// re-dømmes FRISK. Committede filer er spor — dommen fældes her. Exit 0 ⟺ gaten er åben.
import { evaluateGate } from "./gates.mjs";
import { buildSnapshot } from "./gate-eval.mjs";
import { makeVerdictVerifier } from "./verdikt.mjs";
import { makeApprovalVerifier } from "./kvittering.mjs";
import { runKravGate, vaelgVerdikter } from "./krav-gate-run.mjs";
import { makeGit } from "./git.mjs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { realpathSync } from "node:fs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function runPlanGate(commitSha, { root = repoRoot, evidenceRef = "HEAD" } = {}) {
  try {
    return runPlanGateInner(commitSha, root, evidenceRef);
  } catch (e) {
    return { open: false, gate_id: "plan", reasons: [`gate-run kastede (fail-closed): ${e?.message ?? String(e)}`] };
  }
}

function runPlanGateInner(commitSha, root, evidenceRef) {
  const git = makeGit(root);
  const launch = JSON.parse(git.bytes("show", `${commitSha}:launch/launch.json`).toString("utf8"));
  const pakke = launch.pakke;
  const snapshot = buildSnapshot("plan", { git, commitSha, pakke });

  const læs = (p) => JSON.parse(git.bytes("show", `${evidenceRef}:plan-build/${pakke}/${p}`).toString("utf8"));
  const approvalFil = læs("plan-approval.json");
  const filer = git("ls-tree", "--name-only", `${evidenceRef}:plan-build/${pakke}`).split("\n");
  const verdicts = vaelgVerdikter({ approvalFil, filer, læs, evidenceRef, gate: "plan" });
  // VERBATIM: kun .approval sendes videre, u-rørt (kernen afviser ukendte felter selv)
  const approval = approvalFil.approval ?? approvalFil;

  // forgænger: krav-gaten re-dømmes FRISK ved samme pinnede commit
  const krav = runKravGate(commitSha, { root, evidenceRef });
  const predecessor = {
    gate_id: "krav",
    conclusion: krav.open === true ? "success" : "failure",
    artifact_oid: snapshot.bindings?.krav?.oid ?? null,
  };

  return evaluateGate(
    "plan",
    { ...snapshot, verdicts, approval, predecessor },
    {
      verifyVerdict: makeVerdictVerifier({ git }),
      verifyApproval: makeApprovalVerifier({ git, pakke, evidenceRef }),
    },
  );
}

// symlink-sikker CLI-detektion (samme mønster som krav-gate-run)
const erCliKald = (() => {
  if (!process.argv[1] || process.argv[1] === "-") return false;
  try {
    if (import.meta.url === pathToFileURL(process.argv[1]).href) return true;
    return import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
  } catch (e) {
    console.error(`CLI-entry-identifikation fejlede (fail-closed): ${e?.message ?? e}`);
    process.exit(3);
  }
})();
if (erCliKald) {
  const commitSha = process.argv[2];
  if (!commitSha) { console.error("brug: plan-gate-run.mjs <pinned-commit-oid>"); process.exit(2); }
  const result = runPlanGate(commitSha);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.open === true ? 0 : 1);
}
