#!/usr/bin/env node
// verdikt-byg.mjs — aktør-hjælper (M-39 pkt. 3, 2026-09-08): udfyld/validér et
// gate-verdikt med AUTOMATISK pakket binding (args/env — aldrig hånd-redigerede
// konstanter, det gav afvigelses-risiko) + TIDLIG kontrol af gate-kernens
// evidens-kontrakt (citat-scope ⊆ artefakt+bindinger, artefakt SKAL citeres)
// FØR gate-eval — r4's fail-closed-afvisning var undgåelig med denne kontrol.
//
// Brug (fra aktør-workdir-roden, som ER repoet @ pinned commit):
//   node <sti>/verdikt-byg.mjs <draft.json> <gate_id> <gated_commit> <artifact_path> > OUT-verdikt.json
// draft.json = { aktor, conclusion, negative_cases, claim_graph_refs?,
//                evidence: [{path, line_span:[a,b]}], raw_output_sha256, run_id?, effort? }
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { validateVerdiktSchema, readBlobLines, excerptAt } from "./verdikt.mjs";
import { GATE_REGISTRY } from "./gates.mjs";
import { DEFAULT_LAYOUT } from "./gate-eval.mjs";
import { makeGit } from "./git.mjs";

const [draftPath, gateId, gatedCommit, artifactPath] = process.argv.slice(2);
if (!draftPath || !gateId || !gatedCommit || !artifactPath) {
  console.error("brug: verdikt-byg.mjs <draft.json> <gate_id> <gated_commit> <artifact_path>");
  process.exit(2);
}
const gate = GATE_REGISTRY.find((g) => g.id === gateId);
if (!gate) { console.error(`ukendt gate: ${gateId}`); process.exit(2); }

const sha256 = (s) => createHash("sha256").update(s).digest("hex");
const git = makeGit(process.cwd());
const oidAt = (p) => git("rev-parse", `${gatedCommit}:${p}`);

const artifactOid = oidAt(artifactPath);
const pakke = JSON.parse(git.bytes("show", `${gatedCommit}:launch/launch.json`).toString("utf8")).pakke;
const bindings = {};
const bindingPaths = {};
for (const b of gate.bindings) {
  const p = DEFAULT_LAYOUT[b].replaceAll("<pakke>", pakke);
  bindings[b] = oidAt(p);
  bindingPaths[p] = bindings[b];
}

// TIDLIG evidens-kontrakt-kontrol (gate-kernens regel, gates.mjs:280-285)
const draft = JSON.parse(readFileSync(draftPath, "utf8"));
const lovligeStier = new Set([artifactPath, ...Object.keys(bindingPaths)]);
const udenFor = draft.evidence.filter((e) => !lovligeStier.has(e.path));
if (udenFor.length > 0) {
  console.error(`CITAT-SCOPE-RØD (fang det NU, ikke ved gate-eval): evidence uden for gated input:\n` +
    udenFor.map((e) => `  ${e.path}`).join("\n") +
    `\nLovlige stier: ${[...lovligeStier].join(" · ")}\n(kode-/analyse-citater hører til analyse-sporet, ikke gate-læsebeviset)`);
  process.exit(1);
}
if (!draft.evidence.some((e) => e.path === artifactPath)) {
  console.error(`CITAT-SCOPE-RØD: mindst ét citat SKAL være fra selve artefaktet (${artifactPath})`);
  process.exit(1);
}

const evidence = draft.evidence.map((e) => {
  const blob_oid = oidAt(e.path);
  const blob = readBlobLines(git, blob_oid);
  if (blob.error) throw new Error(`${e.path}: ${blob.error}`);
  const excerpt = excerptAt(blob.lines, e.line_span);
  if (excerpt === null) throw new Error(`${e.path}: line_span ${JSON.stringify(e.line_span)} ugyldig/tom`);
  return { commit_sha: gatedCommit, path: e.path, blob_oid, line_span: e.line_span, excerpt_sha: sha256(excerpt) };
});

const run = {
  run_id: draft.run_id ?? `lokal-${gateId}-${draft.aktor}`,
  run_attempt: 1,
  raw_output_sha256: draft.raw_output_sha256,
  actor_server_id: "local-driver-spawn (server-provenance = residual til CI actor-runner)",
};
if (typeof draft.effort === "string" && draft.effort.length > 0) run.effort = draft.effort; // M-39 pkt. 4

const verdikt = {
  schema_version: 1,
  gate_id: gateId,
  aktor: draft.aktor,
  artifact_oid: artifactOid,
  bindings_oids: bindings,
  input_oids_read: [...new Set([artifactOid, ...Object.values(bindings), ...evidence.map((e) => e.blob_oid)])],
  conclusion: draft.conclusion,
  negative_cases: draft.negative_cases,
  claim_graph_refs: draft.claim_graph_refs ?? [],
  evidence,
  run,
};
const val = validateVerdiktSchema(verdikt);
if (!val.ok) { console.error("SCHEMA-RØD:\n" + val.reasons.join("\n")); process.exit(1); }
console.log(JSON.stringify(verdikt, null, 1));
