#!/usr/bin/env node
// ci-build-dom.mjs — C4b: CI'S PRODUKTIONSRUNNER + BUILD-GATE-DOM (plan 2.A »Autoritet = CI's friske evaluateGate« · 2.C sandheds-motoren ·
// 2.E · DEL V · DEL VIII pkt. 36/38/39 · GRUNDPLAN-v2 C4 · Codex C4b-runde F-C4b-1: ISOLATION).
//
// TO JOBS, TO TILLIDSZONER (F-C4b-1 — produktkode må aldrig nå dommerens emissions-token):
//   MÅLING (job A, contents:read, ingen checks:write, checkout uden persist-credentials, Postgres-service):
//     node scripts/v5/ci-build-dom.mjs --produce --commit <sha> --pg env|'<json-argv>' --proof-out build-proof.json --meta-out build-dom-meta.json
//     → kører PRODUKTKODE (migrationer · Codex' testfiler via test-runner.mjs · mutanter · prover-cmd) m. et RENSET miljø (producentMiljoe: ingen tokens) og
//       skriver bevis-body (bytes) + meta (nåethed · store · run_id). Ingen dom, ingen emission, intet token i jobbet.
//   DOM (job B, checks:write, INGEN produktkode — kun betroet måle-lag mod git + bevis-bytes):
//     node scripts/v5/ci-build-dom.mjs --judge --commit <sha> --proof-in build-proof.json --meta-in build-dom-meta.json [--emit]
//     → oid = hash-object(bytes) · forgænger (plan) frisk · snapshot m. ci-produceret artefakt · evaluateGate(build) · emission v5/gate/build.
//   Lokalt (begge trin i én proces, ingen emission): node scripts/v5/ci-build-dom.mjs --commit <sha> --pg '<json-argv>' [--proof-out …]
//
// Forløbet (fail-closed i hvert led — ingen tavshed, ingen succes uden bevis):
//   1. NÅETHED: plan-approval.json OG angrebs-spec.json findes i commit'en (Fase 4 pkt. 1 er leveret) — ellers intet check-run.
//   2. INPUT: manifest + angrebs-INDEKS (angrebs-spec.json skema 2, hurtigt spor pkt. 42) @ commit valideres (validateManifest · validateAngrebsIndeks).
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
//   API-BEVISFORM (H1, 2026-09-21): entrypoint.kind api måles via PostgREST i måle-jobbet (service `postgrest` mod den friske store);
//   runneren får http-transporten fra V5_PGRST_URL + V5_PGRST_JWT_SECRET (den EFEMERE stores test-secret — ikke en credential) og
//   efter migrationerne sendes `NOTIFY pgrst, 'reload schema'` så PostgREST ser pakkens schema. ui-flow måles fortsat via exit-kanalen.

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
import { validateAngrebsIndeks } from "./angrebs-indeks.mjs";
import { runTestSuite } from "./test-runner.mjs";
import { runProver } from "./prover.mjs";
import { makeGit } from "./git.mjs";
import { doemGates, emitCheckRuns } from "./ci-gate-dom.mjs";
import { makePgRunner } from "./pg-runner.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const isOid = (s) => typeof s === "string" && /^[0-9a-f]{40}$/.test(s);
const lay = (k, pk) => DEFAULT_LAYOUT[k].replaceAll("<pakke>", pk);
void GATE_IDS;

export const BUILD_NAAETHED = Object.freeze(["plan-build/<pakke>/plan-approval.json", "plan-build/<pakke>/angrebs-spec.json"]);
import { producentMiljoe, CREDENTIAL_ENV_RE } from "./pg-runner.mjs";
void CREDENTIAL_ENV_RE;

// hashObjectBytes(bytes) → git blob-OID af de RÅ bytes (samme som hvis filen var committet) — default via `git hash-object --stdin`.
// F-C4b-3: bytes gives som Buffer (rå) eller streng (producentens egen serialisering, UTF-8) — aldrig en tabsfuldt afkodet streng af en fil.
export function hashObjectBytes(bytes, root = repoRoot) {
  const buf = Buffer.isBuffer(bytes) ? bytes : Buffer.from(String(bytes), "utf8");
  const r = spawnSync("git", ["-C", root, "hash-object", "--stdin"], { input: buf, encoding: "utf8" });
  if (r.status !== 0 || !isOid(String(r.stdout).trim())) throw new Error(`git hash-object fejlede: ${String(r.stderr).slice(0, 200)}`);
  return String(r.stdout).trim();
}
// raaTilTekst(buf) → streng KUN hvis bytes er gyldig UTF-8 (fatal decoder) — ellers null (F-C4b-3: ingen tabsfuld erstatning før dom/hash)
export function raaTilTekst(buf) { try { return new TextDecoder("utf-8", { fatal: true }).decode(buf); } catch { return null; } }

// fælles kontekst: git-læsere + pakke @ commit
function ctxFor({ commitSha, root, git, exists, readJson, readText, hashObject }) {
  if (!isOid(commitSha)) throw new Error("commitSha skal være en fuld 40-hex commit-OID (pinned)");
  const g = git ?? makeGit(root);
  const findes = exists ?? ((p) => { try { g("cat-file", "-e", `${commitSha}:${p}`); return true; } catch { return false; } });
  const tekst = readText ?? ((p) => g.bytes("show", `${commitSha}:${p}`).toString("utf8"));
  const json = readJson ?? ((p) => JSON.parse(tekst(p)));
  const hashObj = hashObject ?? ((bytes) => hashObjectBytes(bytes, root));
  const pk = json("launch/launch.json").pakke; if (typeof pk !== "string" || !pk) throw new Error("launch.pakke mangler");
  return { g, findes, tekst, json, hashObj, pk };
}
const failRes = (reasons, extra = {}) => { const result = { open: false, gate_id: "build", reasons }; return { naaet: true, result, checkRun: checkRunFromGateResult("build", result), ...extra }; };

// producerBevis(deps) → { naaet, fil? } | { naaet, fejl: reasons, store } | { naaet, proofBytes, body, store, runId }
// JOB A (måling): kører produktkode m. RENSET miljø; ingen dom, ingen emission, intet token.
export async function producerBevis({ commitSha, root = repoRoot, git = null, runner, exists = null, readJson = null, readText = null, listMigrations = null, prover = null, runId = null, skipMigrations = false, env = producentMiljoe(process.env) } = {}) {
  if (!runner || typeof runner.sql !== "function") throw new Error("runner (pg-runner) kræves");
  for (const k of Object.keys(env ?? {})) if (CREDENTIAL_ENV_RE.test(k)) throw new Error(`producerBevis: miljøet til produktkode indeholder credential '${k}' (F-C4b-1)`);
  const { g, findes, tekst, json, pk } = ctxFor({ commitSha, root, git, exists, readJson, readText });
  const fejl = (reasons, store) => ({ naaet: true, fejl: reasons, store });

  // 1) nåethed
  for (const f of BUILD_NAAETHED) { const fil = f.replace("<pakke>", pk); if (!findes(fil)) return { naaet: false, fil }; }

  // 2) input
  let manifest, spec, indexOid = null;
  try { manifest = json(lay("manifest", pk)); } catch (e) { return fejl([`manifest kan ikke læses @ commit: ${e?.message ?? e}`]); }
  try { spec = json(lay("angrebsspec", pk)); indexOid = g("rev-parse", `${commitSha}:${lay("angrebsspec", pk)}`).trim(); } catch (e) { return fejl([`angrebs-indeks kan ikke læses @ commit: ${e?.message ?? e}`]); }
  const vm = validateManifest(manifest); if (!vm.ok) return fejl([`manifest ugyldigt: ${vm.reasons.slice(0, 8).join("; ")}`]);
  const vs = validateAngrebsIndeks(spec, manifest); if (!vs.ok) return fejl([`angrebs-indeks ugyldigt/ukomplet mod manifestet: ${vs.reasons.slice(0, 8).join("; ")}`]);

  // 3) store: migrationer @ commit, i rækkefølge, som ejer — første fejl er STOP
  let store = { anvendt: 0, skipped: skipMigrations };
  if (!skipMigrations) {
    const migs = (listMigrations ?? (() => g("ls-tree", "--name-only", `${commitSha}:supabase/migrations`).split("\n").filter((f) => /\.sql$/.test(f)).sort().map((f) => `supabase/migrations/${f}`)))();
    if (!Array.isArray(migs) || migs.length === 0) return fejl(["ingen migrationer fundet @ commit (supabase/migrations/*.sql) — ingen store at måle mod"], store);
    for (const m of migs) {
      let r; try { r = await runner.sql(tekst(m), {}); } catch (e) { return fejl([`migration ${m} kastede: ${e?.message ?? e}`], store); }
      if (!r || r.ok !== true) return fejl([`migration ${m} fejlede: ${r?.code ?? ""} ${r?.error ?? r?.detail?.message ?? ""}`.trim()], store);
      store.anvendt++;
    }
    if (runner.http) { try { await runner.sql("notify pgrst, 'reload schema'; notify pgrst, 'reload config';", {}); } catch {} }   // H1: PostgREST skal se pakkens schema efter migrationerne
  }

  // 4) måling: Codex' testfiler (kode, frosne via indeksets oids) køres mod den friske store + mutant-loop (test-runner.mjs)
  const rid = runId ?? `ci-${process.env.GITHUB_RUN_ID ?? "lokal"}-${process.env.GITHUB_RUN_ATTEMPT ?? "1"}-${commitSha.slice(0, 12)}`;
  let eng; try { eng = await runTestSuite({ index: spec, indexOid, runner, manifest, root, runId: rid }); } catch (e) { return fejl([`test-runneren afviste kørslen: ${e?.message ?? e}`], store); }

  // 5) bevis-body (artefaktet)
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
    else {
      // runProver merger {...process.env, ...env} (prover.mjs:145, Codex C4b r2) — så credentials i FORÆLDERENS miljø ville komme med igen.
      // Job A har intet token (scriptet afviser --produce m. GITHUB_TOKEN), men vi scrubber alligevel forælderens miljø for varigheden af kaldet.
      const gemt = {}; for (const k of Object.keys(process.env)) if (CREDENTIAL_ENV_RE.test(k)) { gemt[k] = process.env[k]; delete process.env[k]; }
      let pr; try { pr = prover ? await prover(pj, env) : runProver({ repoRoot: root, commitSha, cmd: pj.cmd, resultRelPath: pj.resultRelPath, git: g, env }); } finally { for (const [k, v] of Object.entries(gemt)) process.env[k] = v; }
      const sum = pr?.summary ?? {}; prover_result = { ok: pr?.ok === true, total: sum.total ?? 0, passed: sum.passed ?? 0, failed: sum.failed ?? 0, skipped: sum.skipped ?? 0, ...(pr?.ok === true ? {} : { reason: (pr?.reasons ?? ["prover ikke grøn"]).join("; ") }) }; }
  }
  const allOk = eng.tests.every((t) => t.ok === true) && eng.mutants.every((m) => m.killed === true);
  const body = { schema_version: 3, pakke: pk, commit_sha: commitSha, run_id: rid, index_oid: indexOid, store: { kind: "ci-postgres-service", migrationer_anvendt: store.anvendt, skipped_migrations: skipMigrations }, engine: { run_id: rid, store: "real", summary: eng.summary, allOk }, tests: eng.tests, mutants: eng.mutants, summary: eng.summary, bid_bindings: spec.bids.map((b) => ({ bid_id: b.bid_id, base_oid: bidBase[b.bid_id] })), async_reviews: reviews, prover_result };
  const proofBytes = JSON.stringify(body, null, 1) + "\n";
  return { naaet: true, proofBytes, body, store, runId: rid, engine: eng };
}

// doemBevis(deps) → { naaet, result, checkRun, artifactOid, envelope, forgaenger } — JOB B (dom): KUN betroet måle-lag mod git + bevis-bytes.
// Ingen produktkode kører her; dette job må have checks:write. Bytes'ne er artefaktet: oid = hash-object over de RÅ bytes (Buffer fra fil
// eller producentens UTF-8-streng), body = JSON.parse af den TABSFRIT afkodede tekst — ugyldig UTF-8 er rød, aldrig erstattet (F-C4b-3).
export async function doemBevis({ commitSha, root = repoRoot, git = null, exists = null, readJson = null, readText = null, hashObject = null, planDom = null, proofBytes, fejl = null, store = null } = {}) {
  const { g, json, hashObj, pk } = ctxFor({ commitSha, root, git, exists, readJson, readText, hashObject }); void json;
  if (Array.isArray(fejl) && fejl.length) return failRes(fejl, { store });   // målingen meldte fejl (migration/input/motor) — dømmes rød m. dens grund
  const raw = Buffer.isBuffer(proofBytes) ? proofBytes : typeof proofBytes === "string" && proofBytes.length ? Buffer.from(proofBytes, "utf8") : null;
  if (!raw || raw.length === 0) return failRes(["intet bevis fra målingen (proofBytes mangler) — fail-closed"], { store });
  const tekst = raaTilTekst(raw); if (tekst === null) return failRes(["bevis-bytes er ikke gyldig UTF-8 — artefaktet kan ikke dømmes tabsfrit (F-C4b-3)"], { store });
  let body; try { body = JSON.parse(tekst); } catch { return failRes(["bevis-bytes er ikke JSON"], { store }); }
  if (body?.commit_sha !== commitSha) return failRes([`beviset er produceret for commit ${String(body?.commit_sha).slice(0, 7)} ≠ den dømte ${commitSha.slice(0, 7)}`], { store });
  if (body?.pakke !== pk) return failRes([`beviset er produceret for pakken '${String(body?.pakke)}' ≠ '${pk}'`], { store });
  const artifactOid = hashObj(raw);   // over de RÅ bytes — det er dét tredjeparten hasher i det downloadede artefakt

  // forgænger: plan-gaten frisk (pinned + identitet) m. evidens @ commit
  let forgaenger;
  try { forgaenger = planDom ? await planDom(commitSha) : (await doemGates({ commitSha, root, git: g, gates: ["plan"], pakke: pk }))[0]; } catch (e) { return failRes([`plan-gaten kan ikke dømmes: ${e?.message ?? e}`], { store }); }
  const planSnap = buildSnapshot("plan", { git: g, commitSha, pakke: pk });
  const predecessor = { gate_id: "plan", conclusion: forgaenger?.result?.open === true ? "success" : "failure", artifact_oid: planSnap.artifact?.oid ?? null, bindings_oids: { manifest: planSnap.bindings?.manifest?.oid ?? null } };
  if (predecessor.conclusion !== "success") return failRes([`forgængeren (plan-gaten) er ikke åben @ ${String(forgaenger?.pinned ?? "?").slice(0, 7)}: ${(forgaenger?.result?.reasons ?? ["ikke nået"]).slice(0, 4).join("; ")}`], { store, forgaenger });

  const snapshot = buildSnapshot("build", { git: g, commitSha, pakke: pk, artifact: { path: lay("build", pk), oid: artifactOid, type: "ci-produced" } });
  const envelope = { ...body, ok: body?.engine?.allOk === true, gate_id: "build", proof_kind: "build-proof", artifact_oid: artifactOid, bindings_oids: Object.fromEntries(Object.entries(snapshot.bindings).map(([k, v]) => [k, v?.oid ?? null])) };
  const snap = { ...snapshot, proof_result: envelope, verdicts: [], approval: null, predecessor };
  const result = evaluateGate("build", snap, { verifyProof: makeProofVerifier({ git: g }) });
  const checkRun = checkRunFromGateResult("build", result);
  const st = body?.store ?? {};
  if (checkRun?.output) checkRun.output.summary = `bevis-artefakt (ci-produced) ${artifactOid} · run_id ${String(body?.run_id)} · store: ${st.migrationer_anvendt ?? "?"} migrationer${st.skipped_migrations ? " (SKIPPED)" : ""} · motor: ${JSON.stringify(body?.engine?.summary ?? null)}\n${checkRun.output.summary}`;
  return { naaet: true, result, checkRun, artifactOid, envelope, forgaenger, store: store ?? st };
}

// doemBuild(deps) → produkt + dom i én proces (lokal brug / selvtest) — samme to trin som CI's to jobs
export async function doemBuild(deps = {}) {
  const p = await producerBevis(deps);
  if (!p.naaet) return { naaet: false, fil: p.fil, result: null, checkRun: null };
  const d = await doemBevis({ ...deps, proofBytes: p.proofBytes, fejl: p.fejl ?? null, store: p.store ?? null });
  return { ...d, proofBytes: p.proofBytes, engine: p.engine, store: p.store ?? d.store };
}

function erMain() { if (!process.argv[1] || process.argv[1] === "-") return false; try { if (import.meta.url === pathToFileURL(process.argv[1]).href) return true; return import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href; } catch { return false; } }
if (erMain()) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined; };
  const commitSha = arg("--commit"); const pg = arg("--pg") ?? "env"; const emit = process.argv.includes("--emit"); const out = arg("--proof-out"); const metaOut = arg("--meta-out"); const inn = arg("--proof-in"); const metaIn = arg("--meta-in"); const skip = process.argv.includes("--skip-migrations");
  const produce = process.argv.includes("--produce"), judge = process.argv.includes("--judge");
  const skrivMd = (d, emitted) => { const md = `# v5/gate/build @ ${commitSha.slice(0, 12)}\n\n**${d.result.open ? "ÅBEN" : "LUKKET"}** → ${d.checkRun.name} = ${d.checkRun.conclusion}${emitted ? " (emitteret)" : " (tør kørsel)"}\n\n${d.checkRun.output.summary}\n\n${d.result.open ? "" : (d.result.reasons ?? []).slice(0, 15).map((r) => `- ${r}`).join("\n")}`; console.log(md); if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + "\n"); };
  (async () => {
    if (judge && !produce) {   // JOB B: kun betroet dom + emission — ingen produktkode, ingen runner
      const meta = metaIn ? JSON.parse(readFileSync(metaIn, "utf8")) : {};
      if (meta.naaet === false) { console.log(`build-gaten er ikke nået @ ${commitSha.slice(0, 7)} (${meta.fil}) — intet check-run (ikke nået = ikke grøn)`); return; }
      const proofBytes = inn ? readFileSync(inn) : null;   // RÅ Buffer — ingen afkodning før hash/dom (F-C4b-3)
      const d = await doemBevis({ commitSha, proofBytes, fejl: meta.fejl ?? null, store: meta.store ?? null });
      let emitted = null;
      if (emit) emitted = await emitCheckRuns({ repo: process.env.GITHUB_REPOSITORY, headSha: commitSha, domme: [{ gate: "build", naaet: true, checkRun: d.checkRun }], token: process.env.GITHUB_TOKEN });
      skrivMd(d, emitted); return;
    }
    if (emit && produce) throw new Error("--emit er forbudt i --produce (produktkode og emissions-token må aldrig dele job/proces — F-C4b-1)");
    if (process.env.GITHUB_TOKEN && produce) throw new Error("GITHUB_TOKEN er sat i måle-jobbet — produktkode må ikke kunne nå det (F-C4b-1); fjern tokenet fra jobbet");
    const argv = pg === "env" ? ["psql"] : JSON.parse(pg);
    const http = process.env.V5_PGRST_URL ? { baseUrl: process.env.V5_PGRST_URL, jwtSecret: process.env.V5_PGRST_JWT_SECRET ?? "", defaultSchema: process.env.V5_PGRST_SCHEMA || null } : null;   // H1
    const runner = makePgRunner({ argv, http });
    if (produce) {   // JOB A: måling m. renset miljø
      const p = await producerBevis({ commitSha, runner, skipMigrations: skip });
      const meta = { naaet: p.naaet, fil: p.fil ?? null, fejl: p.fejl ?? null, store: p.store ?? null, run_id: p.runId ?? null, commit_sha: commitSha };
      if (metaOut) writeFileSync(metaOut, JSON.stringify(meta, null, 1) + "\n");
      if (!p.naaet) { console.log(`build-gaten er ikke nået @ ${commitSha.slice(0, 7)} (${p.fil} findes ikke) — intet bevis produceret`); return; }
      if (p.fejl) { console.log(`måling fejlede (dommen bliver rød m. grund): ${p.fejl.join("; ")}`); return; }
      if (out) writeFileSync(out, p.proofBytes); console.log(`bevis produceret: ${out ?? "(ikke skrevet)"} · run_id ${p.runId} · store ${p.store.anvendt} migrationer · tests ${JSON.stringify(p.engine.summary)}`); return;
    }
    const d = await doemBuild({ commitSha, runner, skipMigrations: skip });   // lokalt: begge trin, ingen emission
    if (!d.naaet) { console.log(`build-gaten er ikke nået @ ${commitSha.slice(0, 7)} (${d.fil} findes ikke) — intet check-run (ikke nået = ikke grøn)`); return; }
    if (out && d.proofBytes) { writeFileSync(out, d.proofBytes); console.log(`bevis skrevet: ${out} (artefakt-oid ${d.artifactOid})`); }
    skrivMd(d, null);
  })().catch((e) => { console.error(`✗ ci-build-dom: ${e?.message ?? e}`); process.exit(1); });
}
