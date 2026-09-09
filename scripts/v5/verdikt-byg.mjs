#!/usr/bin/env node
// verdikt-byg.mjs — aktør-hjælper (M-39 pkt. 3, 2026-09-08): udfyld/validér et
// gate-verdikt med AUTOMATISK pakket binding (args/env — aldrig hånd-redigerede
// konstanter, det gav afvigelses-risiko) + TIDLIG kontrol af gate-kernens
// evidens-kontrakt (citat-scope ⊆ artefakt+bindinger, artefakt SKAL citeres)
// FØR gate-eval — r4's fail-closed-afvisning var undgåelig med denne kontrol.
//
// Brug (fra aktør-workdir-roden, som ER repoet @ pinned commit):
//   node <sti>/verdikt-byg.mjs <draft.json|-> <gate_id> <gated_commit> <artifact_path> [receipt.json leverance-fil] > OUT-verdikt.json
//   P2 F-10 (v4): i kvitterings-mode udtrækkes draften FRA LEVERANCEN (præcis ét ```json verdikt-draft-blok)
//   så dommen ikke kan byttes uafhængigt af den leverede tekst; draft.json = "-" eller skal være
//   kanonisk identisk med blokken. Kvitteringen skal bære gate_input == (gate_id, gated_commit,
//   artifact_path), aktivitet=dom, selftest=false, og rollen skal være en codex-rolle i låsen med
//   samme skill_oid. run.receipt_sha256 = sha256(kvitterings-bytes) → gate-runnerens verifyTransport.
// draft.json = { aktor, conclusion, negative_cases, claim_graph_refs?,
//                evidence: [{path, line_span:[a,b]}], raw_output_sha256, run_id?, effort? }
// kvittering (M-41 Trin A3 · P2-pas 2026-09-09 F-1/F-2 → v3): 5. arg = codex-run.sh's
//   $OUT.receipt.json (STRUKTURERET, aldrig fritekst-provenance), 6. arg = den
//   publicerede leverance-fil. Hjælperen kræver status=success · 1-2 sekventielle
//   forsøg m. identisk model/effort/sandbox · sidste forsøg rc=0 og bytes>0 · og
//   BINDER leverancen: sha256(leverance-fil) == receipt.attempts.last.output_sha256
//   == draft.raw_output_sha256 (hashen erklæres ikke — den beregnes her). run_attempt
//   = antal forsøg, run.effort = det kørte niveau; afviger draft.effort → SCHEMA-RØD.
//   Codex-aktører (draft.aktor === "codex") KRÆVER kvittering + leverance — ingen
//   fallback (F-2: en Codex-dom må ikke kunne konstrueres uden et Codex-kald).
//   Claude-Agent-aktører uden transport-kvittering mærkes "SELV-ERKLÆRET" i
//   actor_server_id. DEKLARERET RESIDUAL (plan 2.F / P-1): kvitteringen er ikke
//   signeret af en betroet runner — det er CI-actor-runnerens bord; indtil da hviler
//   den på filsystem-adgang + fabrik-frys (pinnede binærer/lås i wrapperen).
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { validateVerdiktSchema, readBlobLines, excerptAt } from "./verdikt.mjs";
import { GATE_REGISTRY } from "./gates.mjs";
import { DEFAULT_LAYOUT } from "./gate-eval.mjs";
import { makeGit } from "./git.mjs";
import { udtraekVerdiktDraft } from "./kvittering.mjs";

const [draftPath, gateId, gatedCommit, artifactPath, receiptPath, leverancePath] = process.argv.slice(2);
if (!draftPath || !gateId || !gatedCommit || !artifactPath) {
  console.error("brug: verdikt-byg.mjs <draft.json> <gate_id> <gated_commit> <artifact_path>");
  process.exit(2);
}
const sha256 = (s) => createHash("sha256").update(s).digest("hex");
const canon = (v) => JSON.stringify(v, Object.keys(flatKeys(v)).sort());
function flatKeys(v, acc = {}) { if (v && typeof v === "object") for (const k of Object.keys(v)) { acc[k] = true; flatKeys(v[k], acc); } return acc; }
if ((receiptPath === undefined) !== (leverancePath === undefined)) {
  console.error("brug: kvittering OG leverance-fil skal gives sammen (eller ingen af dem)"); process.exit(2);
}
let receipt = null, receiptSha = null, draft;
if (receiptPath !== undefined) {
  // fail-closed FØR noget andet, læst PRÆCIS én gang
  const rawReceipt = readFileSync(receiptPath);
  receiptSha = sha256(rawReceipt);
  try { receipt = JSON.parse(rawReceipt.toString("utf8")); } catch { console.error("PROVENANCE-RØD: kvittering er ikke gyldig JSON"); process.exit(1); }
  const fejl = (m) => { console.error(`PROVENANCE-RØD: ${m}`); process.exit(1); };
  const isPlain = (o) => o !== null && typeof o === "object" && !Array.isArray(o) && Object.getPrototypeOf(o) === Object.prototype;
  if (!isPlain(receipt) || receipt.schema_version !== 2) fejl("kvittering: ukendt schema (kræver v2 — codex-run.sh v4)");
  if (receipt.status !== "success") fejl(`transporten leverede ikke (status=${String(receipt.status)}) — der findes intet gyldigt aktør-resultat`);
  if (receipt.selftest !== false) fejl("kørslen var en SELVTEST (eller flaget mangler) — ikke gyldig som gate-evidens (F-11)");
  if (receipt.lock_mode !== "committed") fejl(`kørslen brugte lås-override (${String(receipt.lock_mode)}) — ikke gyldig som gate-evidens`);
  if (receipt.aktivitet !== "dom") fejl(`aktivitet '${String(receipt.aktivitet)}' ≠ dom — en gate-dom kommer kun fra en dom-kørsel (F-10)`);
  const gi = receipt.gate_input;
  if (!isPlain(gi) || gi.gate_id !== gateId || gi.gated_commit !== gatedCommit || gi.artifact_path !== artifactPath)
    fejl(`kvitteringens gate_input (${JSON.stringify(gi)}) ≠ (${gateId}, ${gatedCommit.slice(0, 7)}, ${artifactPath}) — dommen er skrevet på et andet input (F-10)`);
  const at = receipt.attempts;
  if (!Array.isArray(at) || at.length < 1 || at.length > 2) fejl(`ugyldigt antal forsøg (${Array.isArray(at) ? at.length : "?"})`);
  for (const [i, a] of at.entries()) {
    if (!isPlain(a) || a.attempt !== i + 1) fejl(`forsøg ${i + 1} mangler eller er ude af rækkefølge`);
    if (a.model !== receipt.model || a.effort !== receipt.effort || a.sandbox !== receipt.sandbox) fejl(`forsøg ${i + 1} kørte med anden model/effort/sandbox end kvitteringen erklærer`);
  }
  const last = at[at.length - 1];
  if (last.rc !== 0 || !(Number(last.output_bytes) > 0) || typeof last.output_sha256 !== "string") fejl("sidste forsøg leverede ikke (rc≠0 eller tom)");
  for (const k of ["model", "effort", "regel_commit", "skill_oid", "prompt_sha256", "rolle", "run_id"]) if (typeof receipt[k] !== "string" || !receipt[k]) fejl(`kvittering mangler ${k}`);
  // BIND leverancen: bytes her ↔ kvittering (hashen beregnes, erklæres ikke)
  const levBytes = readFileSync(leverancePath);
  const levSha = sha256(levBytes);
  if (levSha !== last.output_sha256) fejl(`leverance-fil (${levSha.slice(0, 12)}) ≠ kvitteringens output_sha256 (${String(last.output_sha256).slice(0, 12)})`);
  // DRAFT FRA LEVERANCEN (F-10/F-16): kun en aktiv top-niveau ```json verdikt-draft-blok tæller — citerede
  // eksempler i en ````-blok eller inline åbnere ignoreres (fence-parser i kvittering.mjs)
  const ud = udtraekVerdiktDraft(levBytes.toString("utf8"));
  if (!ud.ok) fejl(ud.reasons.join("; "));
  draft = ud.draft;
  if (draftPath !== "-") {
    const separat = JSON.parse(readFileSync(draftPath, "utf8"));
    if (canon(separat) !== canon(draft)) fejl("separat draft.json ≠ verdikt-draft-blokken i leverancen (dommen forsøgt byttet)");
  }
  if (draft.raw_output_sha256 !== undefined && draft.raw_output_sha256 !== levSha) fejl("draft.raw_output_sha256 ≠ faktisk leverance");
  draft.raw_output_sha256 = levSha; // hashen ER leverancen — aldrig erklæret
  if (typeof draft.effort === "string" && draft.effort.length > 0 && draft.effort !== receipt.effort) fejl(`draft.effort='${draft.effort}' ≠ kørt effort='${receipt.effort}'`);
  if (draft.aktor !== "codex") fejl(`kvitterings-mode kræver aktor 'codex' (fik '${String(draft.aktor)}')`);
} else {
  if (draftPath === "-") { console.error("brug: draft.json kræves uden kvittering"); process.exit(2); }
  draft = JSON.parse(readFileSync(draftPath, "utf8"));
  if (draft.aktor === "codex") {
    console.error("PROVENANCE-RØD: Codex-verdikt uden transport-kvittering — en Codex-dom kan ikke konstrueres uden et Codex-kald (P2 F-2)"); process.exit(1);
  }
}
const gate = GATE_REGISTRY.find((g) => g.id === gateId);
if (!gate) { console.error(`ukendt gate: ${gateId}`); process.exit(2); }

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

// rolle-binding (F-10/F-15): kvitteringens rolle skal være GATENS codex-rolle, findes i låsen @ regel_commit med
// samme skill_oid/model/effort — og låsen @ regel_commit skal være den GÆLDENDE (== HEAD's), så en ældre
// regel_commit med anden lås ikke kan bære en dom
if (receipt) {
  if (!gate.codexRolle || receipt.rolle !== gate.codexRolle) { console.error(`PROVENANCE-RØD: kvitteringens rolle '${receipt.rolle}' ≠ gatens codex-rolle '${String(gate.codexRolle)}' (F-15)`); process.exit(1); }
  let lock, lockR, lockH;
  try {
    lockR = git("rev-parse", `${receipt.regel_commit}:scripts/v5/actors.lock.json`);
    lockH = git("rev-parse", "HEAD:scripts/v5/actors.lock.json");
    lock = JSON.parse(git.bytes("show", `${receipt.regel_commit}:scripts/v5/actors.lock.json`).toString("utf8"));
  } catch { console.error(`PROVENANCE-RØD: actors.lock.json findes ikke @ kvitteringens regel_commit ${String(receipt.regel_commit).slice(0, 7)}`); process.exit(1); }
  if (lockR !== lockH) { console.error(`PROVENANCE-RØD: kørt under en anden lås (@${String(receipt.regel_commit).slice(0, 7)}) end den gældende @ HEAD (F-15)`); process.exit(1); }
  const r = Object.prototype.hasOwnProperty.call(lock, receipt.rolle) ? lock[receipt.rolle] : null;
  if (!r || r.aktoer !== "codex" || r.skill_oid !== receipt.skill_oid || r.model !== receipt.model || r.reasoning !== receipt.effort) {
    console.error(`PROVENANCE-RØD: kvitteringens rolle '${receipt.rolle}' matcher ikke låsen @ ${String(receipt.regel_commit).slice(0, 7)} (aktoer/skill_oid/model/effort)`); process.exit(1);
  }
}
// kørsels-fakta fra transportens KVITTERING (aldrig fra aktørens erklæring, når den findes)
const run = {
  run_id: receipt ? receipt.run_id : (draft.run_id ?? `lokal-${gateId}-${draft.aktor}`),
  run_attempt: receipt ? receipt.attempts.length : 1,
  raw_output_sha256: draft.raw_output_sha256,
  actor_server_id: receipt
    ? `local-driver-spawn via codex-run.sh v4 (kvittering ${receipt.run_id}; usigneret = residual til CI actor-runner, DEL I: lokal = candidate)`
    : "local-driver-spawn (SELV-ERKLÆRET run/effort — ingen transport-kvittering; kun tilladt for Claude-Agent-aktører; server-provenance = residual til CI actor-runner)",
};
if (receipt) { run.effort = receipt.effort; run.receipt_sha256 = receiptSha; }
else if (typeof draft.effort === "string" && draft.effort.length > 0) run.effort = draft.effort;
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
