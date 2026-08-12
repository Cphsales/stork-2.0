#!/usr/bin/env node
// build-proof.selftest.mjs — red-team af verifyBuildProof (plan DEL VI (a)).
// Grøn sti + hver plantet falsk-grøn fanget; claim_graph-ankre mod RIGTIGT
// git-repo; ende-til-ende gennem evaluateGate (build-gaten åbner kun med en
// ægte build-proof + bunden forgænger).

import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { evaluateGate } from "./gates.mjs";
import { makeGit, resolveRef } from "./git.mjs";
import { readBlobLines, excerptAt } from "./verdikt.mjs";
import { verifyBuildProof } from "./build-proof.mjs";
import { makeProofVerifier } from "./proofs.mjs";

const sha256 = (s) => createHash("sha256").update(s).digest("hex");
let failed = 0;
const ok = (n) => console.log(`  ✓ ${n}`);
const bad = (n, d) => {
  console.error(`  ✗ ${n} — ${d}`);
  failed++;
};
const expectGreen = (n, r) => (r.ok === true ? ok(n) : bad(n, `rød: ${r.reasons.join(" | ")}`));
const expectRed = (n, r, needle) => {
  const hit = r.reasons.some((x) => new RegExp(needle).test(x));
  !r.ok && hit
    ? ok(n)
    : bad(n, r.ok ? "GRØN (falsk-grøn slap igennem)" : `rød men uden '${needle}': ${r.reasons.join(" | ")}`);
};

// ---------- fixture: rigtigt repo ----------
const ROOT = mkdtempSync(join(tmpdir(), "v5-buildproof-"));
process.on("exit", () => rmSync(ROOT, { recursive: true, force: true }));
execFileSync("git", ["init", "-q", ROOT]);
const git = makeGit(ROOT);
git("config", "user.name", "selftest");
git("config", "user.email", "selftest@local");

const FILES = {
  "plan/plan.md": "# plan — pakke-x\n\nbid-1 realiserer K-1 + K-2.\n",
  "build/build-proof.json": JSON.stringify({ note: "artefakt-placeholder" }) + "\n",
  "recon/angrebs-spec.json": JSON.stringify({ kill_list: ["WITH CHECK"] }) + "\n",
  "supabase/migrations/0001.sql":
    "alter table salg enable row level security;\n" +
    'create policy "salg_egen_org" on salg for all using (org_id = auth_org()) with check (org_id = auth_org());\n',
};
for (const [p, c] of Object.entries(FILES)) {
  mkdirSync(join(ROOT, dirname(p)), { recursive: true });
  writeFileSync(join(ROOT, p), c);
}
git("add", "-A");
git("commit", "-qm", "fixture");
const COMMIT = git("rev-parse", "HEAD");
const ref = (p) => resolveRef(git, COMMIT, p);

const plan = ref("plan/plan.md");
const artifact = ref("build/build-proof.json");
const angrebsSpec = ref("recon/angrebs-spec.json");

// git-forankret evidens (samme excerpt-beregning som produktionen)
const mkEvidence = (path, start, end) => {
  const r = resolveRef(git, COMMIT, path);
  const excerpt = excerptAt(readBlobLines(git, r.oid).lines, [start, end]);
  return { commit_sha: COMMIT, path, blob_oid: r.oid, line_span: [start, end], excerpt_sha: sha256(excerpt) };
};

// ---------- grøn build-proof ----------
const greenProof = () => ({
  ok: true,
  gate_id: "build",
  proof_kind: "build-proof",
  artifact_oid: artifact.oid,
  bindings_oids: { plan: plan.oid },
  ks: [
    { k_id: "K-1", is_config_k: true },
    { k_id: "K-2", is_config_k: false },
  ],
  bids: [
    {
      bid_id: "bid-1",
      angrebs_spec_oid: angrebsSpec.oid,
      base_oid: COMMIT,
      tests: [
        { k_id: "K-1", entrypoint: "POST /api/salg", store: "real", non_bypass_role: true, hard_effect: "db-row", negative_path_exercised: true },
        { k_id: "K-2", entrypoint: "GET /api/rapport", store: "real", non_bypass_role: true, hard_effect: "state", negative_path_exercised: true },
      ],
      mutants: [{ k_id: "K-1", knob: "WITH CHECK", killed: true }],
    },
  ],
  claim_graph: [
    { k_id: "K-1", executed: true, mutant_killed: true, source_anchor: mkEvidence("supabase/migrations/0001.sql", 1, 2) },
  ],
  async_reviews: [{ bid_id: "bid-1", conclusion: "PASS", base_oid: COMMIT }],
  prover_result: { ok: true, tests_run: 12, skipped: 0 },
});
const snap = (proof) => ({
  commit_sha: COMMIT,
  artifact,
  bindings: { plan },
  proof_result: proof,
  verdicts: [],
  approval: null,
  predecessor: { gate_id: "plan", conclusion: "success", artifact_oid: plan.oid },
});
const verify = (proof) => verifyBuildProof(proof, snap(proof), { git });
const mutated = (fn) => {
  const p = greenProof();
  fn(p);
  return p;
};

console.log("verifyBuildProof — grøn sti:");
expectGreen("fuld bijektion + effect-harness-form + mutant-kill + git-anker + async-PASS + prover grøn", verify(greenProof()));

console.log("\nbijektion (K↔bid↔test):");
expectRed("K uden nogen test", verify(mutated((p) => (p.bids[0].tests = p.bids[0].tests.filter((t) => t.k_id !== "K-2")))), "bijektion brudt");
expectRed("rogue-test (ukendt K)", verify(mutated((p) => (p.bids[0].tests[0].k_id = "K-99"))), "rogue");
expectRed("tomt K-sæt", verify(mutated((p) => (p.ks = []))), "K-sættet mangler");
expectRed("dublet K", verify(mutated((p) => p.ks.push({ k_id: "K-1", is_config_k: true }))), "dublet K");
expectRed("is_config_k ikke eksplicit boolean", verify(mutated((p) => delete p.ks[0].is_config_k)), "is_config_k ikke eksplicit");
expectRed("bid uden test", verify(mutated((p) => (p.bids[0].tests = []))), "beviser intet");

console.log("\neffect-harness-FORM (ingen falsk-grøn helper-return):");
expectRed("hard_effect = helper-return", verify(mutated((p) => (p.bids[0].tests[0].hard_effect = "helper-return"))), "helper-return");
expectRed("non_bypass_role ikke true (bypass omgår RLS)", verify(mutated((p) => (p.bids[0].tests[0].non_bypass_role = false))), "non_bypass_role");
expectRed("store ikke real (fixture/mock)", verify(mutated((p) => (p.bids[0].tests[0].store = "mock"))), "real backing store");
expectRed("negative-sti ikke udøvet", verify(mutated((p) => (p.bids[0].tests[0].negative_path_exercised = false))), "afvisnings-stien");
expectRed("entrypoint mangler (ikke public)", verify(mutated((p) => delete p.bids[0].tests[0].entrypoint)), "public entrypoint");

console.log("\nconfig-mutant-kill (gulv):");
expectRed("opsætnings-K uden dræbt mutant", verify(mutated((p) => (p.bids[0].mutants = []))), "mutant-kill-gulv brudt");
expectRed("overlevende mutant (killed ikke true)", verify(mutated((p) => (p.bids[0].mutants[0].killed = false))), "overlevende mutant");
expectRed("mutant for ukendt K", verify(mutated((p) => (p.bids[0].mutants[0].k_id = "K-77"))), "ukendt K");

console.log("\npr.-bid OID-bindinger:");
expectRed("angrebs_spec_oid mangler (kill-list ikke bundet)", verify(mutated((p) => delete p.bids[0].angrebs_spec_oid)), "angrebs_spec_oid");
expectRed("base_oid ugyldig", verify(mutated((p) => (p.bids[0].base_oid = "ikke-en-oid"))), "base_oid");

console.log("\nclaim_graph — git-forankret kerne (u-forfalskelig):");
expectRed("fabrikeret anker (excerpt_sha matcher ikke)", verify(mutated((p) => (p.claim_graph[0].source_anchor.excerpt_sha = sha256("løgn")))), "source-anker ikke git-verificeret");
expectRed("anker fra anden commit end den gatede", verify(mutated((p) => (p.claim_graph[0].source_anchor.commit_sha = "0".repeat(40)))), "source-anker ikke git-verificeret");
expectRed("claim ikke eksekveret", verify(mutated((p) => (p.claim_graph[0].executed = false))), "executed ikke eksplicit true");
expectRed("claim-mutant ikke dræbt", verify(mutated((p) => (p.claim_graph[0].mutant_killed = false))), "mutant_killed ikke eksplicit true");

console.log("\nasync-reviews (PASS pr. bid, bundet til base_oid):");
expectRed("manglende review for bid (anti-tavshed)", verify(mutated((p) => (p.async_reviews = []))), "mangler et PASS async-review");
expectRed("review ikke PASS", verify(mutated((p) => (p.async_reviews[0].conclusion = "FAIL"))), "ikke PASS");
expectRed("stale review (base_oid ≠ bid base_oid)", verify(mutated((p) => (p.async_reviews[0].base_oid = "a".repeat(40)))), "matcher ikke bid'ets base_oid");

console.log("\nprover grøn (skipped/0-tests = rød):");
expectRed("prover ikke grøn", verify(mutated((p) => (p.prover_result.ok = false))), "prover ikke grøn");
expectRed("0 tests kørt", verify(mutated((p) => (p.prover_result.tests_run = 0))), "0-tests");
expectRed("skippede tests", verify(mutated((p) => (p.prover_result.skipped = 3))), "skippede tests");

console.log("\nstruktur-fail-closed (sparse/prototype/typer):");
expectRed("sparse bids-array (hul)", verify(mutated((p) => { const a = p.bids.slice(); delete a[0]; a[1] = greenProof().bids[0]; p.bids = a; })), "tæt array");
expectRed("build-proof på prototype (arvede felter)", verifyBuildProof(Object.create(greenProof()), snap(greenProof()), { git }), "ikke et objekt");
expectRed("git-dep mangler", verifyBuildProof(greenProof(), snap(greenProof()), {}), "git-dep mangler");
expectRed("plan-binding mangler i snapshot", verifyBuildProof(greenProof(), { ...snap(greenProof()), bindings: {} }, { git }), "plan-binding");

console.log("\nrouter (makeProofVerifier) leder build-proof til verifikatoren:");
const route = makeProofVerifier({ git });
expectGreen("router → verifyBuildProof (grøn)", route(greenProof(), snap(greenProof())));
expectRed("router → verifyBuildProof (rød ved falsk-grøn)", route(mutated((p) => (p.bids[0].tests[0].hard_effect = "helper-return")), snap(greenProof())), "helper-return");

console.log("\nende-til-ende gennem evaluateGate (build-gaten):");
{
  const deps = { verifyProof: makeProofVerifier({ git }) };
  const r = evaluateGate("build", snap(greenProof()), deps);
  r.open ? ok("build-gaten ÅBNER med ægte build-proof + bunden forgænger") : bad("e2e-grøn", r.reasons.join(" | "));
}
{
  const deps = { verifyProof: makeProofVerifier({ git }) };
  const r = evaluateGate("build", snap(mutated((p) => (p.bids[0].mutants[0].killed = false))), deps);
  !r.open && r.reasons.some((x) => /verifyProof|overlevende mutant/.test(x))
    ? ok("build-gaten LUKKER når en mutant overlever (frisk re-kør fanger falsk-grøn)")
    : bad("e2e-rød", r.open ? "ÅBNEDE" : r.reasons.join(" | "));
}
{
  // et generisk {ok:true} uden payload kan ikke åbne (kernen binder + re-verificerer)
  const deps = { verifyProof: makeProofVerifier({ git }) };
  const bareEnvelope = { ok: true, gate_id: "build", proof_kind: "build-proof", artifact_oid: artifact.oid, bindings_oids: { plan: plan.oid } };
  const r = evaluateGate("build", snap(bareEnvelope), deps);
  !r.open ? ok("bar envelope uden bevis-payload åbner ikke build-gaten") : bad("e2e-bar", "ÅBNEDE");
}

console.log("");
if (failed > 0) {
  console.error(`build-proof red-team: ${failed} FEJLEDE`);
  process.exit(1);
}
console.log("build-proof red-team: alle cases passed");
