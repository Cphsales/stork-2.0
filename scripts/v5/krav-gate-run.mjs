#!/usr/bin/env node
// krav-gate-run.mjs — udfør-siden af krav-gaten (M-40 A1: spejl af recon-gate-run).
//
// Kør: node scripts/v5/krav-gate-run.mjs <pinned-commit-oid>
//
// Læser ALT fra den pinnede commit + committede evidens-filer: launch → pakke,
// verdikt-filer (udvalgt via approval._provenance.verdikt_run_ids) + approval fra plan-build/<pakke>/ (@ HEAD —
// evidens er durabel, dommen fældes FRISK her: verifyProof/verifyVerdict
// re-køres mod rå git, forgængeren (recon) re-dømmes in-memory). Committede
// filer er spor — aldrig autoritet. Exit 0 ⟺ gaten er åben.
import { evaluateGate } from "./gates.mjs";
import { buildSnapshot } from "./gate-eval.mjs";
import { makeProofVerifier } from "./proofs.mjs";
import { makeVerdictVerifier } from "./verdikt.mjs";
import { runReconGate } from "./recon-gate-run.mjs";
import { makeGit } from "./git.mjs";
import { resolveEvidence, makeApprovalVerifier, makeTransportVerifier } from "./kvittering.mjs";
import { DEFAULT_LAYOUT } from "./gate-eval.mjs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { realpathSync } from "node:fs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Ren udvælgelse (testbar uden git): approval._provenance.verdikt_run_ids → præcis
// én verdikt-fil pr. run_id blandt verdikt-*-krav*.json @ evidenceRef. Fail-closed
// på manglende liste · tom liste · ikke-strenge · dubletter · 0 eller >1 match.
export function vaelgVerdikter({ approvalFil, filer, læs, evidenceRef = "?", gate = "krav" }) {
  const runIds = approvalFil?._provenance?.verdikt_run_ids;
  if (!Array.isArray(runIds) || runIds.length === 0 || !runIds.every((r) => typeof r === "string" && r.length > 0))
    throw new Error("approval._provenance.verdikt_run_ids mangler/ugyldig — rundevalg kan ikke afledes (fail-closed)");
  if (new Set(runIds).size !== runIds.length) throw new Error("approval.verdikt_run_ids har dubletter (fail-closed)");
  if (!/^[a-z]+$/.test(gate)) throw new Error("vaelgVerdikter: ugyldig gate");
  const re = new RegExp(`^verdikt-[a-z0-9-]+-${gate}(-[a-z0-9]+)?\\.json$`);
  const kandidater = filer.filter((f) => re.test(f)).map((f) => ({ f, v: læs(f) }));
  const verdicts = [];
  for (const rid of runIds) {
    const hits = kandidater.filter((x) => x?.v?.run?.run_id === rid);
    if (hits.length !== 1) throw new Error(`run_id '${rid}' matcher ${hits.length} verdikt-filer @ ${evidenceRef} (kræver præcis 1; fail-closed)`);
    verdicts.push(hits[0].v);
  }
  return verdicts;
}

export function runKravGate(commitSha, { root = repoRoot, evidenceRef = "HEAD" } = {}) {
  try {
    return runKravGateInner(commitSha, root, evidenceRef);
  } catch (e) {
    return { open: false, gate_id: "krav", reasons: [`gate-run kastede (fail-closed): ${e?.message ?? String(e)}`] };
  }
}

function runKravGateInner(commitSha, root, evidenceRefIn) {
  const git = makeGit(root);
  const evidenceRef = resolveEvidence(git, evidenceRefIn); // P2 F-7: ÉN opløsning
  const launch = JSON.parse(git.bytes("show", `${commitSha}:launch/launch.json`).toString("utf8"));
  const pakke = launch.pakke;
  const snapshot = buildSnapshot("krav", { git, commitSha, pakke });

  // committet evidens (spor): verdikter + approval læses fra evidenceRef
  // (typisk HEAD — de ligger efter gate-committen i historikken)
  const læs = (p) => JSON.parse(git.bytes("show", `${evidenceRef}:plan-build/${pakke}/${p}`).toString("utf8"));
  const approvalFil = læs("krav-approval.json");
  // RUNDEVALG FRA EKSPLICIT LEVERANCEHENVISNING (M-41 Trin A4 / validering V-F3):
  // approval._provenance.verdikt_run_ids navngiver de verdikter Mathias' ok
  // hviler på — aldrig et hardkodet filnavn (r4b). Alle verdikt-*-krav*.json @
  // evidenceRef læses; PRÆCIS dem hvis run.run_id står i listen sendes til
  // kernen. Manglende liste, dublet-run_id eller run_id uden fil → fail-closed.
  const filer = git("ls-tree", "--name-only", `${evidenceRef}:plan-build/${pakke}`).split("\n");
  const verdicts = vaelgVerdikter({ approvalFil, filer, læs, evidenceRef });
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

  const r = evaluateGate(
    "krav",
    { ...snapshot, verdicts, approval, predecessor },
    {
      verifyProof: makeProofVerifier({ git }),
      verifyVerdict: makeVerdictVerifier({ git }),
      // kvittering kræves for alt undtagen den digest-bundne M-38-godkendelse / r4b-verdiktet (gates.mjs)
      verifyApproval: makeApprovalVerifier({ git, pakke, evidenceRef }),
      verifyTransport: makeTransportVerifier({ git, pakke, evidenceRef, gateId: "krav", commitSha, artifactPath: DEFAULT_LAYOUT.krav.replaceAll("<pakke>", pakke) }),
    },
  );
  return { ...r, evidence_commit: evidenceRef };
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
