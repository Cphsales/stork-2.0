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
// re-dømmes FRISK VED SIN EGEN PIN (driver-fund 2026-09-21 ved første plan-dom: krav-gatens
// verdikter/approval er bundet til krav-gatens pinnede commit (fx efc85d5), ikke planens (P5) —
// at dømme krav ved P5 gav »evidens citerer commit efc85d5 ≠ gated commit« ×14 og lukkede plan-
// gaten på forgængeren). Forgængerens pin læses fra det committede kandidat-resultat
// plan-build/<pakke>/krav-gate-resultat.json.commit_sha @ evidenceRef (samme kilde som CI's
// ci-gate-dom PINNED_KILDE), SKAL være en fuld OID og forfader til/lig planens commit, og krav-
// gatens inputs (artefakt · bindinger · pakke) SKAL være identiske @ pin og @ planens commit
// (F-C4-1-identitet) — ellers fail-closed. Committede filer er spor — dommen fældes her.
// Exit 0 ⟺ gaten er åben.
import { evaluateGate } from "./gates.mjs";
import { buildSnapshot } from "./gate-eval.mjs";
import { makeVerdictVerifier } from "./verdikt.mjs";
import { makeApprovalVerifier, makeTransportVerifier, resolveEvidence } from "./kvittering.mjs";
import { DEFAULT_LAYOUT } from "./gate-eval.mjs";
import { runKravGate, vaelgVerdikter } from "./krav-gate-run.mjs";
import { makeGit } from "./git.mjs";
import { isOid } from "./gates.mjs";
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

function runPlanGateInner(commitSha, root, evidenceRefIn) {
  const git = makeGit(root);
  const evidenceRef = resolveEvidence(git, evidenceRefIn); // P2 F-7: ÉN opløsning, samme E i alle læsninger + forgænger + verifikatorer
  const launch = JSON.parse(git.bytes("show", `${commitSha}:launch/launch.json`).toString("utf8"));
  const pakke = launch.pakke;
  const snapshot = buildSnapshot("plan", { git, commitSha, pakke });

  const læs = (p) => JSON.parse(git.bytes("show", `${evidenceRef}:plan-build/${pakke}/${p}`).toString("utf8"));
  const approvalFil = læs("plan-approval.json");
  const filer = git("ls-tree", "--name-only", `${evidenceRef}:plan-build/${pakke}`).split("\n");
  const verdicts = vaelgVerdikter({ approvalFil, filer, læs, evidenceRef, gate: "plan" });
  // VERBATIM: kun .approval sendes videre, u-rørt (kernen afviser ukendte felter selv)
  const approval = approvalFil.approval ?? approvalFil;

  // forgænger: krav-gaten re-dømmes FRISK ved SIN EGEN pin (forfader til/lig planens commit; krav-inputs identiske) —
  // predecessor.artifact_oid er krav-gatens EGET artefakt @ pin; kernen kræver at det == planens krav-binding @ commitSha
  const fp = forgaengerPin({ git, commitSha, evidenceRef, pakke, forgaenger: "krav" });
  const krav = runKravGate(fp.pin, { root, evidenceRef });
  const predecessor = {
    gate_id: "krav",
    conclusion: krav.open === true ? "success" : "failure",
    artifact_oid: fp.artifact_oid,
  };

  const r = evaluateGate(
    "plan",
    { ...snapshot, verdicts, approval, predecessor },
    {
      verifyVerdict: makeVerdictVerifier({ git }),
      verifyApproval: makeApprovalVerifier({ git, pakke, evidenceRef }),
      verifyTransport: makeTransportVerifier({ git, pakke, evidenceRef, gateId: "plan", commitSha, artifactPath: DEFAULT_LAYOUT.plan.replaceAll("<pakke>", pakke) }),
    },
  );
  return { ...r, evidence_commit: evidenceRef };
}

// forgaengerPin({git, commitSha, evidenceRef, pakke, forgaenger}) → { pin, artifact_oid }  — kaster fail-closed med præcis grund.
// Kilden er det committede kandidat-resultat plan-build/<pakke>/<forgaenger>-gate-resultat.json @ evidenceRef (samme kilde som CI's
// ci-gate-dom). Krav: commit_sha er fuld OID · forfader til/lig commitSha · forgænger-gatens inputs (artefakt + alle bindinger via
// gate-eval-layoutet + launch.pakke) har samme blob-OID @ pin og @ commitSha. En gammel åben forgænger-dom gælder ikke ændret indhold.
export function forgaengerPin({ git, commitSha, evidenceRef, pakke, forgaenger }) {
  const kilde = `plan-build/${pakke}/${forgaenger}-gate-resultat.json`;
  let raw;
  try { raw = git.bytes("show", `${evidenceRef}:${kilde}`).toString("utf8"); }
  catch { throw new Error(`forgænger (${forgaenger}): kandidat-resultatet ${kilde} findes ikke @ evidens ${String(evidenceRef).slice(0, 7)} — forgængerens pin kan ikke afledes (fail-closed)`); }
  let pin; try { pin = JSON.parse(raw)?.commit_sha; } catch { throw new Error(`forgænger (${forgaenger}): ${kilde} er ikke gyldig JSON`); }
  if (!isOid(pin)) throw new Error(`forgænger (${forgaenger}): ${kilde}.commit_sha mangler/ikke en fuld OID (fail-closed)`);
  if (pin !== commitSha) { try { git("merge-base", "--is-ancestor", pin, commitSha); } catch { throw new Error(`forgænger (${forgaenger}): pin ${pin.slice(0, 7)} er ikke forfader til gatens commit ${commitSha.slice(0, 7)} — fremmed historik (fail-closed)`); } }
  const id = (sha) => {
    const launch = JSON.parse(git.bytes("show", `${sha}:launch/launch.json`).toString("utf8"));
    const snap = buildSnapshot(forgaenger, { git, commitSha: sha, pakke });
    return { pakke: launch.pakke, artifact: snap.artifact?.oid ?? null, bindings: Object.fromEntries(Object.entries(snap.bindings ?? {}).map(([k, v]) => [k, v?.oid ?? null])) };
  };
  const a = id(pin); const b = pin === commitSha ? a : id(commitSha);
  const diff = [];
  if (a.pakke !== b.pakke) diff.push(`pakke ${a.pakke} → ${b.pakke}`);
  if (a.artifact !== b.artifact) diff.push(`artefakt ${String(a.artifact).slice(0, 12)} → ${String(b.artifact).slice(0, 12)}`);
  for (const k of new Set([...Object.keys(a.bindings), ...Object.keys(b.bindings)])) if (a.bindings[k] !== b.bindings[k]) diff.push(`binding ${k} ${String(a.bindings[k]).slice(0, 12)} → ${String(b.bindings[k]).slice(0, 12)}`);
  if (diff.length) throw new Error(`forgænger (${forgaenger}): inputs ÆNDRET mellem pin ${pin.slice(0, 7)} og gatens commit ${commitSha.slice(0, 7)}: ${diff.join(" · ")} — en gammel åben dom gælder ikke ændret indhold (F-C4-1)`);
  if (!isOid(a.artifact)) throw new Error(`forgænger (${forgaenger}): artefaktet findes ikke @ pin ${pin.slice(0, 7)}`);
  return { pin, artifact_oid: a.artifact };
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
