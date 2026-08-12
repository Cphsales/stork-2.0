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
// orphan commit (samme tree, ingen parent) — gyldigt commit-objekt, men IKKE en
// ancestor af COMMIT (til base_oid-ancestor-red-team).
const ORPHAN = git("commit-tree", git("rev-parse", `${COMMIT}^{tree}`), "-m", "orphan");

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
  ks: [{ k_id: "K-1" }, { k_id: "K-2" }],
  bids: [
    {
      bid_id: "bid-1",
      angrebs_spec_oid: angrebsSpec.oid,
      angrebs_spec_path: "recon/angrebs-spec.json",
      base_oid: COMMIT,
      tests: [
        { k_id: "K-1", entrypoint: { kind: "api", ref: "POST /api/salg" }, store: "real", non_bypass_role: true, hard_effect: "db-row", negative_path_exercised: true },
        { k_id: "K-2", entrypoint: { kind: "api", ref: "GET /api/rapport" }, store: "real", non_bypass_role: true, hard_effect: "state", negative_path_exercised: true },
      ],
      mutants: [
        { k_id: "K-1", knob: "WITH CHECK", killed: true, restored: true, cleanAfter: true },
        { k_id: "K-2", knob: "tenant-predikat", killed: true, restored: true, cleanAfter: true },
      ],
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
expectRed("dublet K", verify(mutated((p) => p.ks.push({ k_id: "K-1" }))), "dublet K");
expectRed("bid uden test", verify(mutated((p) => (p.bids[0].tests = []))), "beviser intet");

console.log("\neffect-harness-FORM (ingen falsk-grøn helper-return; public-KIND entrypoint):");
expectRed("hard_effect = helper-return", verify(mutated((p) => (p.bids[0].tests[0].hard_effect = "helper-return"))), "helper-return");
expectRed("non_bypass_role ikke true (bypass omgår RLS)", verify(mutated((p) => (p.bids[0].tests[0].non_bypass_role = false))), "non_bypass_role");
expectRed("store ikke real (fixture/mock)", verify(mutated((p) => (p.bids[0].tests[0].store = "mock"))), "real backing store");
expectRed("negative-sti ikke udøvet", verify(mutated((p) => (p.bids[0].tests[0].negative_path_exercised = false))), "afvisnings-stien");
expectRed("entrypoint mangler (ikke public)", verify(mutated((p) => delete p.bids[0].tests[0].entrypoint)), "public indgang");
// Codex-fund #3: fri streng / intern helper som "entrypoint" må ikke passere
expectRed("entrypoint = fri streng (helper)", verify(mutated((p) => (p.bids[0].tests[0].entrypoint = "internalHelper()"))), "public indgang");
expectRed("entrypoint kind ikke public", verify(mutated((p) => (p.bids[0].tests[0].entrypoint = { kind: "internal", ref: "x" }))), "public indgang");
expectRed("entrypoint uden ref", verify(mutated((p) => (p.bids[0].tests[0].entrypoint = { kind: "api" }))), "public indgang");

console.log("\nconfig-mutant-kill (gulv for ALLE K — Codex-fund #1):");
expectRed("intet K har dræbt mutant", verify(mutated((p) => (p.bids[0].mutants = []))), "mutant-kill-gulv brudt");
expectRed("ét K mangler dræbt mutant (kan ikke opt-out)", verify(mutated((p) => (p.bids[0].mutants = p.bids[0].mutants.filter((m) => m.k_id !== "K-2")))), "K-2.*mutant-kill-gulv brudt|mutant-kill-gulv brudt");
expectRed("overlevende mutant (killed ikke true)", verify(mutated((p) => (p.bids[0].mutants[0].killed = false))), "dræbt\\+restored\\+ren");
expectRed("mutant dræbt men ikke restored", verify(mutated((p) => delete p.bids[0].mutants[0].restored)), "dræbt\\+restored\\+ren");
expectRed("mutant dræbt+restored men uren (cleanAfter mangler)", verify(mutated((p) => delete p.bids[0].mutants[0].cleanAfter)), "dræbt\\+restored\\+ren");
expectRed("mutant for ukendt K", verify(mutated((p) => (p.bids[0].mutants[0].k_id = "K-77"))), "ukendt K");

console.log("\npr.-bid OID-bindinger (path-bind + git-eksistens + ancestry — Codex r2/r5):");
expectRed("angrebs_spec_oid mangler (kill-list ikke bundet)", verify(mutated((p) => delete p.bids[0].angrebs_spec_oid)), "angrebs_spec_oid");
expectRed("angrebs_spec_path mangler (kan ikke path-binde)", verify(mutated((p) => delete p.bids[0].angrebs_spec_path)), "angrebs_spec_path mangler");
expectRed("angrebs_spec_oid fake (findes ikke på stien)", verify(mutated((p) => (p.bids[0].angrebs_spec_oid = "a".repeat(40)))), "matcher ikke stien");
// Codex r5 #1: ægte/dangling blob men IKKE på den angivne sti (unreachable)
expectRed("angrebs_spec_oid = anden fils blob (forkert sti)", verify(mutated((p) => (p.bids[0].angrebs_spec_oid = ref("plan/plan.md").oid))), "matcher ikke stien");
expectRed("base_oid ugyldig form", verify(mutated((p) => (p.bids[0].base_oid = "ikke-en-oid"))), "base_oid");
expectRed("base_oid fake (gyldig form, findes ikke i git)", verify(mutated((p) => (p.bids[0].base_oid = "b".repeat(40)))), "eksisterende commit");
// Codex r5 #2: gyldigt commit-objekt men IKKE ancestor af den gatede commit
expectRed(
  "base_oid = orphan-commit (ikke ancestor)",
  verify(mutated((p) => {
    p.bids[0].base_oid = ORPHAN;
    p.async_reviews[0].base_oid = ORPHAN;
  })),
  "ancestor",
);

console.log("\nverifyBuildProof selv-validerer snapshot (Codex-confirm r2 #1 + r3 #2):");
expectRed("arvet snapshot.bindings (Object.create)", verifyBuildProof(greenProof(), { ...snap(greenProof()), bindings: Object.create({ plan }) }, { git }), "plan-binding");
// r3 #2 / r4 #2: fake el. forkert-path-bundet plan/artifact-OID → rød (path-binding)
expectRed(
  "fake plan-OID (gyldig form, findes ikke på stien)",
  verifyBuildProof(greenProof(), { ...snap(greenProof()), bindings: { plan: { path: "plan/plan.md", oid: "a".repeat(40), type: "blob" } } }, { git }),
  "matcher ikke stien",
);
expectRed(
  "fake artifact-OID (gyldig form, findes ikke på stien)",
  verifyBuildProof(greenProof(), { ...snap(greenProof()), artifact: { path: "build/build-proof.json", oid: "c".repeat(40), type: "blob" } }, { git }),
  "matcher ikke stien",
);
// r4 #2: en RIGTIG eksisterende blob men på FORKERT sti (orphan) → rød
expectRed(
  "artifact-OID = ægte blob men forkert sti (orphan)",
  verifyBuildProof(greenProof(), { ...snap(greenProof()), artifact: { path: "build/build-proof.json", oid: angrebsSpec.oid, type: "blob" } }, { git }),
  "matcher ikke stien",
);
// r4 #1: commit_sha som mutable ref (HEAD) må ikke åbne (pinned-OID-kontrakt)
expectRed(
  "commit_sha = 'HEAD' (mutable ref)",
  verifyBuildProof(greenProof(), { ...snap(greenProof()), commit_sha: "HEAD" }, { git }),
  "pinned OID",
);
{
  const s = snap(greenProof());
  delete s.commit_sha;
  Object.prototype.commit_sha = COMMIT;
  let r;
  try {
    r = verifyBuildProof(greenProof(), s, { git });
  } finally {
    delete Object.prototype.commit_sha;
  }
  expectRed("arvet snapshot.commit_sha (prototype) fanges", r, "commit_sha");
}

console.log("\nclaim_graph — git-forankret kerne (u-forfalskelig, OBLIGATORISK):");
// Codex-fund #2: den git-forankrede kerne må ikke kunne droppes
expectRed("claim_graph mangler helt", verify(mutated((p) => delete p.claim_graph)), "må ikke droppes");
expectRed("claim_graph tom ([])", verify(mutated((p) => (p.claim_graph = []))), "må ikke droppes");
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
// Codex r3 #1: array m. egen every-override / custom prototype / Symbol.iterator
expectRed("ks m. egen every-override → rød", verify(mutated((p) => { p.ks.every = () => true; })), "K-sættet mangler");
expectRed("ks m. custom prototype → rød", verify(mutated((p) => { Object.setPrototypeOf(p.ks, { some: () => true }); })), "K-sættet mangler");
expectRed("bids m. egen Symbol.iterator → rød", verify(mutated((p) => { p.bids[Symbol.iterator] = function* () {}; })), "bids skal være");
// Codex r4 #1: accessor (getter) på et required felt må ikke tælle som data-værdi
expectRed("mutant.killed som getter (accessor) → rød", verify(mutated((p) => { Object.defineProperty(p.bids[0].mutants[0], "killed", { enumerable: true, get: () => true }); })), "dræbt\\+restored\\+ren");
expectRed("non_bypass_role som getter (accessor) → rød", verify(mutated((p) => { Object.defineProperty(p.bids[0].tests[0], "non_bypass_role", { enumerable: true, get: () => true }); })), "non_bypass_role");
expectRed("build-proof på prototype (arvede felter)", verifyBuildProof(Object.create(greenProof()), snap(greenProof()), { git }), "ikke et objekt");
expectRed("git-dep mangler", verifyBuildProof(greenProof(), snap(greenProof()), {}), "git-dep mangler");
expectRed("plan-binding mangler i snapshot", verifyBuildProof(greenProof(), { ...snap(greenProof()), bindings: {} }, { git }), "plan-binding");
// Codex-fund #4: Object.prototype-pollution må ikke udfylde et required nested-felt
{
  const p = mutated((x) => delete x.bids[0].tests[0].non_bypass_role);
  Object.prototype.non_bypass_role = true; // forurener prototypen
  let r;
  try {
    r = verify(p);
  } finally {
    delete Object.prototype.non_bypass_role;
  }
  expectRed("arvet non_bypass_role (prototype-pollution) fanges", r, "non_bypass_role");
}
// Codex-confirm #1: tomt source_anchor {} med evidens-felter på Object.prototype
{
  const p = mutated((x) => (x.claim_graph[0].source_anchor = {}));
  Object.prototype.commit_sha = COMMIT;
  Object.prototype.path = "supabase/migrations/0001.sql";
  Object.prototype.blob_oid = ref("supabase/migrations/0001.sql").oid;
  Object.prototype.line_span = [1, 2];
  Object.prototype.excerpt_sha = sha256("x");
  let r;
  try {
    r = verify(p);
  } finally {
    for (const k of ["commit_sha", "path", "blob_oid", "line_span", "excerpt_sha"]) delete Object.prototype[k];
  }
  expectRed("tomt source_anchor m. arvede evidens-felter fanges", r, "eget felt");
}
// Codex-confirm #2 (build-del): arvet ks (ikke eget felt) må ikke tælle
{
  const p = greenProof();
  delete p.ks;
  Object.prototype.ks = [{ k_id: "K-1" }, { k_id: "K-2" }];
  let r;
  try {
    r = verifyBuildProof(p, snap(p), { git });
  } finally {
    delete Object.prototype.ks;
  }
  expectRed("arvet ks (prototype) fanges", r, "K-sættet mangler");
}

console.log("\nclaim_graph proportional dækning (ÆRLIG RESIDUAL — plan-gate-beslutning):");
// build-proof kræver ≥1 git-forankret claim, IKKE én pr. K (plan 2.C: proportional
// — høj-risiko/sikkerheds-K). Per-K-dækning håndhæves ved plan-wiring, ikke her.
expectGreen("claim_graph dækker delmængde af K (K-1, ikke K-2) — tilladt", verify(mutated((p) => (p.claim_graph = [p.claim_graph[0]]))));

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
{
  // Codex-confirm #2 (gate-del): snapshot={} med ALLE required felter på
  // Object.prototype må IKKE åbne build-gaten (arvede snapshot/envelope-felter)
  const deps = { verifyProof: makeProofVerifier({ git }) };
  const g = snap(greenProof());
  const keys = ["commit_sha", "artifact", "bindings", "proof_result", "predecessor", "verdicts", "approval"];
  for (const k of keys) Object.prototype[k] = g[k];
  let r;
  try {
    r = evaluateGate("build", {}, deps);
  } finally {
    for (const k of keys) delete Object.prototype[k];
  }
  !r.open ? ok("snapshot={} m. arvede felter åbner IKKE build-gaten (prototype-pollution)") : bad("e2e-proto", "ÅBNEDE");
}
{
  // r4 #1 e2e: mutable-ref commit_sha må ikke åbne gaten (gates.mjs kræver isOid)
  const deps = { verifyProof: makeProofVerifier({ git }) };
  const r = evaluateGate("build", { ...snap(greenProof()), commit_sha: "HEAD" }, deps);
  !r.open && r.reasons.some((x) => /pinned OID/.test(x))
    ? ok("build-gaten LUKKER ved mutable-ref commit_sha (HEAD)")
    : bad("e2e-head", r.open ? "ÅBNEDE" : r.reasons.join(" | "));
}

console.log("");
if (failed > 0) {
  console.error(`build-proof red-team: ${failed} FEJLEDE`);
  process.exit(1);
}
console.log("build-proof red-team: alle cases passed");
