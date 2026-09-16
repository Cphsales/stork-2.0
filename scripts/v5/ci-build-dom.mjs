#!/usr/bin/env node
// ci-build-dom.mjs — C4b: CI'S PRODUKTIONSRUNNER + BUILD-GATE-DOM (plan 2.A »Autoritet = CI's friske evaluateGate« · 2.C sandheds-motoren ·
// 2.E · DEL V · DEL VIII pkt. 36/38 · GRUNDPLAN-v2 C4). Kør i CI-jobbet m. Postgres-service (contents:read · checks:write):
//   node scripts/v5/ci-build-dom.mjs --commit <sha> --pg env|'<json-argv>' [--emit] [--proof-out <sti>] [--skip-migrations]
//
// Forløbet (fail-closed i hvert led — ingen tavshed, ingen succes uden bevis):
//   1. NÅETHED: plan-approval.json OG angrebs-spec.json findes i commit'en (Fase 4 pkt. 1 er leveret) — ellers intet check-run.
//   2. INPUT: manifest + angrebs-spec @ commit (gate-eval-layout) valideres (validateManifest · validateAngrebsSpec).
//   3. STORE: produktets migrationer (supabase/migrations/*.sql @ commit, sorteret) anvendes som ejer i den friske Postgres-service — en
//      fejlende migration er rød (STOP), ikke »fortsæt«. (--skip-migrations kun lokalt mod en forberedt store — mærkes i beviset.)
//   4. FORGÆNGER: plan-gaten dømmes FRISK ved sin pinnede commit m. evidens @ denne commit (ci-gate-dom.doemGates(gates:["plan"]),
//      inkl. identitetsbinding); predecessor = {gate_id plan, conclusion, artifact_oid = plan-blob @ commit, bindings_oids.manifest}.
//   5. MÅLING: runBuildProofEngine({manifest, run_id, angrebsSpec}, pg-runner) — rå observationer, footprint, SA-overlap, exit-kanal.
//   6. BEVIS (artefakt): body = {run_id, engine, cases, mutants, bid_bindings, async_reviews, prover_result}; bytes → git hash-object →
//      artifact oid (type ci-produced); filen skrives til --proof-out (CI uploader den som workflow-artefakt). Envelope = body + {ok,
//      gate_id, proof_kind, artifact_oid, bindings_oids}. bid_bindings.base_oid = bid'ets basis-commit fra plan-build/<pakke>/bids/<bid>.json
//      @ commit ({bid_id, base_oid} — skrevet når bid'et er bygget; mangler den → den gatede commit, som kun matcher et review af netop den);
//      async_reviews fra plan-build/<pakke>/reviews/<bid>.json @ commit (C3-minimum: {bid_id, conclusion, base_oid} — verifieren kræver
//      review.base_oid == bid'ets base_oid, ellers »stale review«); prover_result fra runProver m. plan-build/<pakke>/prover.json ({cmd, resultRelPath}).
//      Mangler reviews/prover er beviset ÆRLIGT ufuldstændigt → verifieren gør gaten rød med grund.
//   7. DOM: buildSnapshot("build", {…, artifact: ci-produced, proofResult}) + predecessor → evaluateGate("build", snapshot,
//      {verifyProof: makeProofVerifier({git})}) → checkRunFromGateResult → emission v5/gate/build (emitCheckRuns fra ci-gate-dom).
//   Residualer (navngivet): R-RUNNER-UDFØRELSE/R-CI-AUTENTICITET (CI's service-container ER den betroede store; jobbets integritet =
//   måle-lag under ruleset) · R-RUNNER-ATOMARITET · R-SPEC-LEGITIMITET (at angrebs-spec.json er Codex' og frosset før byg: hooks/C4c) ·
//   API-indgange (entrypoint.kind api/ui-flow) måles her via exit-kanalen (check.cmd) — en HTTP-adapter er ikke bygget.

import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { realpathSync, appendFileSync } from "node:fs";
import { GATE_IDS, evaluateGate } from "./gates.mjs";
import { buildSnapshot, DEFAULT_LAYOUT } from "./gate-eval.mjs";
import { makeProofVerifier } from "./proofs.mjs";
import { checkRunFromGateResult } from "./checkrun.mjs";
import { validateManifest } from "./forventnings-manifest.mjs";
import { validateAngrebsSpec } from "./angrebs-spec.mjs";
import { runBuildProofEngine } from "./build-harness.mjs";
import { runProver } from "./prover.mjs";
import { makeGit } from "./git.mjs";
import { doemGates, emitCheckRuns } from "./ci-gate-dom.mjs";
import { makePgRunner } from "./pg-runner.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const isOid = (s) => typeof s === "string" && /^[0-9a-f]{40}$/.test(s);
const lay = (k, pk) => DEFAULT_LAYOUT[k].replaceAll("<pakke>", pk);
void GATE_IDS;

export const BUILD_NAAETHED = Object.freeze(["plan-build/<pakke>/plan-approval.json", "plan-build/<pakke>/angrebs-spec.json"]);

// hashObjectBytes(bytes) → git blob-OID af bytes (samme som hvis filen var committet) — default via `git hash-object --stdin`
export function hashObjectBytes(bytes, root = repoRoot) {
  const r = spawnSync("git", ["-C", root, "hash-object", "--stdin"], { input: bytes, encoding: "utf8" });
  if (r.status !== 0 || !isOid(String(r.stdout).trim())) throw new Error(`git hash-object fejlede: ${String(r.stderr).slice(0, 200)}`);
  return String(r.stdout).trim();
}

// doemBuild(deps) → { naaet, fil?, result, checkRun, proofBytes?, artifactOid?, envelope?, store, forgaenger }
export async function doemBuild({ commitSha, root = repoRoot, git = null, runner, exists = null, readJson = null, readText = null, listMigrations = null, prover = null, planDom = null, hashObject = null, runId = null, skipMigrations = false } = {}) {
  if (!isOid(commitSha)) throw new Error("commitSha skal være en fuld 40-hex commit-OID (pinned)");
  if (!runner || typeof runner.sql !== "function") throw new Error("runner (pg-runner) kræves");
  const g = git ?? makeGit(root);
  const findes = exists ?? ((p) => { try { g("cat-file", "-e", `${commitSha}:${p}`); return true; } catch { return false; } });
  const tekst = readText ?? ((p) => g.bytes("show", `${commitSha}:${p}`).toString("utf8"));
  const json = readJson ?? ((p) => JSON.parse(tekst(p)));
  const hashObj = hashObject ?? ((bytes) => hashObjectBytes(bytes, root));
  const pk = json("launch/launch.json").pakke; if (typeof pk !== "string" || !pk) throw new Error("launch.pakke mangler");
  const fail = (reasons, extra = {}) => { const result = { open: false, gate_id: "build", reasons }; return { naaet: true, result, checkRun: checkRunFromGateResult("build", result), ...extra }; };

  // 1) nåethed
  for (const f of BUILD_NAAETHED) { const fil = f.replace("<pakke>", pk); if (!findes(fil)) return { naaet: false, fil, result: null, checkRun: null }; }

  // 2) input
  let manifest, spec;
  try { manifest = json(lay("manifest", pk)); } catch (e) { return fail([`manifest kan ikke læses @ commit: ${e?.message ?? e}`]); }
  try { spec = json(lay("angrebsspec", pk)); } catch (e) { return fail([`angrebs-spec kan ikke læses @ commit: ${e?.message ?? e}`]); }
  const vm = validateManifest(manifest); if (!vm.ok) return fail([`manifest ugyldigt: ${vm.reasons.slice(0, 8).join("; ")}`]);
  const vs = validateAngrebsSpec(spec, manifest); if (!vs.ok) return fail([`angrebs-spec ugyldig/ukomplet mod manifestet: ${vs.reasons.slice(0, 8).join("; ")}`]);

  // 3) store: migrationer @ commit, i rækkefølge, som ejer — første fejl er STOP
  let store = { anvendt: 0, skipped: skipMigrations };
  if (!skipMigrations) {
    const migs = (listMigrations ?? (() => g("ls-tree", "--name-only", `${commitSha}:supabase/migrations`).split("\n").filter((f) => /\.sql$/.test(f)).sort().map((f) => `supabase/migrations/${f}`)))();
    if (!Array.isArray(migs) || migs.length === 0) return fail(["ingen migrationer fundet @ commit (supabase/migrations/*.sql) — ingen store at måle mod"], { store });
    for (const m of migs) {
      let r; try { r = await runner.sql(tekst(m), {}); } catch (e) { return fail([`migration ${m} kastede: ${e?.message ?? e}`], { store }); }
      if (!r || r.ok !== true) return fail([`migration ${m} fejlede: ${r?.code ?? ""} ${r?.error ?? r?.detail?.message ?? ""}`.trim()], { store });
      store.anvendt++;
    }
  }

  // 4) forgænger: plan-gaten frisk (pinned + identitet) m. evidens @ commit
  let forgaenger;
  try { forgaenger = planDom ? await planDom(commitSha) : (await doemGates({ commitSha, root, git: g, gates: ["plan"], pakke: pk }))[0]; } catch (e) { return fail([`plan-gaten kan ikke dømmes: ${e?.message ?? e}`], { store }); }
  const planSnap = buildSnapshot("plan", { git: g, commitSha, pakke: pk });
  const predecessor = { gate_id: "plan", conclusion: forgaenger?.result?.open === true ? "success" : "failure", artifact_oid: planSnap.artifact?.oid ?? null, bindings_oids: { manifest: planSnap.bindings?.manifest?.oid ?? null } };
  if (predecessor.conclusion !== "success") return fail([`forgængeren (plan-gaten) er ikke åben @ ${String(forgaenger?.pinned ?? "?").slice(0, 7)}: ${(forgaenger?.result?.reasons ?? ["ikke nået"]).slice(0, 4).join("; ")}`], { store, forgaenger });

  // 5) måling
  const rid = runId ?? `ci-${process.env.GITHUB_RUN_ID ?? "lokal"}-${process.env.GITHUB_RUN_ATTEMPT ?? "1"}-${commitSha.slice(0, 12)}`;
  const eng = await runBuildProofEngine({ manifest, run_id: rid, angrebsSpec: spec }, runner);
  if (eng.error) return fail([`motoren afviste kørslen: ${eng.error}`], { store, forgaenger });

  // 6) bevis (artefakt)
  const reviews = []; const bidBase = {};
  for (const b of spec.bids) {
    const bp = `plan-build/${pk}/bids/${b.bid_id}.json`; bidBase[b.bid_id] = commitSha;
    if (findes(bp)) { try { const bj = json(bp); if (bj?.bid_id === b.bid_id && isOid(bj?.base_oid)) bidBase[b.bid_id] = bj.base_oid; } catch {} }
    const p = `plan-build/${pk}/reviews/${b.bid_id}.json`; if (findes(p)) { try { const r = json(p); reviews.push({ bid_id: r.bid_id, conclusion: r.conclusion, base_oid: r.base_oid }); } catch {} }
  }
  let prover_result;
  const proverPath = `plan-build/${pk}/prover.json`;
  if (!findes(proverPath)) prover_result = { ok: false, total: 0, passed: 0, failed: 0, skipped: 0, reason: `${proverPath} mangler @ commit — ingen committet testflade kørt` };
  else {
    let pj = null; try { pj = json(proverPath); } catch (e) { pj = null; }
    if (!pj || !Array.isArray(pj.cmd) || typeof pj.resultRelPath !== "string") prover_result = { ok: false, total: 0, passed: 0, failed: 0, skipped: 0, reason: "prover.json malformet ({cmd[], resultRelPath} kræves)" };
    else { const pr = prover ? await prover(pj) : runProver({ repoRoot: root, commitSha, cmd: pj.cmd, resultRelPath: pj.resultRelPath, git: g, env: process.env }); const sum = pr?.summary ?? {}; prover_result = { ok: pr?.ok === true, total: sum.total ?? 0, passed: sum.passed ?? 0, failed: sum.failed ?? 0, skipped: sum.skipped ?? 0, ...(pr?.ok === true ? {} : { reason: (pr?.reasons ?? ["prover ikke grøn"]).join("; ") }) }; }
  }
  const body = { schema_version: 1, pakke: pk, commit_sha: commitSha, run_id: rid, store: { kind: "ci-postgres-service", migrationer_anvendt: store.anvendt, skipped_migrations: skipMigrations }, engine: { run_id: rid, store: "real", summary: eng.summary }, cases: eng.cases, mutants: eng.mutants, bid_bindings: spec.bids.map((b) => ({ bid_id: b.bid_id, base_oid: bidBase[b.bid_id] })), async_reviews: reviews, prover_result };
  const proofBytes = JSON.stringify(body, null, 1) + "\n"; const artifactOid = hashObj(proofBytes);
  const buildLay = lay("build", pk);
  const snapshot = buildSnapshot("build", { git: g, commitSha, pakke: pk, artifact: { path: buildLay, oid: artifactOid, type: "ci-produced" } });
  const envelope = { ...body, ok: eng.allOk === true, gate_id: "build", proof_kind: "build-proof", artifact_oid: artifactOid, bindings_oids: Object.fromEntries(Object.entries(snapshot.bindings).map(([k, v]) => [k, v?.oid ?? null])) };
  const snap = { ...snapshot, proof_result: envelope, verdicts: [], approval: null, predecessor };

  // 7) dom
  const result = evaluateGate("build", snap, { verifyProof: makeProofVerifier({ git: g }) });
  const checkRun = checkRunFromGateResult("build", result);
  if (checkRun?.output) checkRun.output.summary = `bevis-artefakt (ci-produced) ${artifactOid.slice(0, 12)} · run_id ${rid} · store: ${store.anvendt} migrationer${skipMigrations ? " (SKIPPED)" : ""} · motor: ${JSON.stringify(eng.summary)}\n${checkRun.output.summary}`;
  return { naaet: true, result, checkRun, proofBytes, artifactOid, envelope, store, forgaenger, engine: eng };
}

function erMain() { if (!process.argv[1] || process.argv[1] === "-") return false; try { if (import.meta.url === pathToFileURL(process.argv[1]).href) return true; return import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href; } catch { return false; } }
if (erMain()) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined; };
  const commitSha = arg("--commit"); const pg = arg("--pg") ?? "env"; const emit = process.argv.includes("--emit"); const out = arg("--proof-out"); const skip = process.argv.includes("--skip-migrations");
  const argv = pg === "env" ? ["psql"] : JSON.parse(pg);
  (async () => {
    const runner = makePgRunner({ argv });
    const d = await doemBuild({ commitSha, runner, skipMigrations: skip });
    if (!d.naaet) { console.log(`build-gaten er ikke nået @ ${commitSha.slice(0, 7)} (${d.fil} findes ikke) — intet check-run (ikke nået = ikke grøn)`); return; }
    if (out && d.proofBytes) { writeFileSync(out, d.proofBytes); console.log(`bevis skrevet: ${out} (artefakt-oid ${d.artifactOid})`); }
    let emitted = null;
    if (emit) emitted = await emitCheckRuns({ repo: process.env.GITHUB_REPOSITORY, headSha: commitSha, domme: [{ gate: "build", naaet: true, checkRun: d.checkRun }], token: process.env.GITHUB_TOKEN });
    const md = `# v5/gate/build @ ${commitSha.slice(0, 12)}\n\n**${d.result.open ? "ÅBEN" : "LUKKET"}** → ${d.checkRun.name} = ${d.checkRun.conclusion}${emitted ? " (emitteret)" : " (tør kørsel)"}\n\n${d.checkRun.output.summary}\n\n${d.result.open ? "" : (d.result.reasons ?? []).slice(0, 15).map((r) => `- ${r}`).join("\n")}`;
    console.log(md); if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + "\n");
  })().catch((e) => { console.error(`✗ ci-build-dom: ${e?.message ?? e}`); process.exit(1); });
}
