#!/usr/bin/env node
// proofs.selftest.mjs — red-team af verifyProof-laget (plan DEL VI (a)).
// recon-coverage testes mod et RIGTIGT git-repo (ægte flade-derivation) OG
// ende-til-ende gennem evaluateGate (recon-gaten åbner kun med en ægte proof).
// Routeren skal fail-lukke for endnu-ikke-byggede proof-kinds.

import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { evaluateGate } from "./gates.mjs";
import { makeGit, resolveRef } from "./git.mjs";
import { deriveSurface } from "./coverage.mjs";
import { verifyReconCoverageProof, makeProofVerifier } from "./proofs.mjs";

const RECON_ACTORS = ["code", "codex", "claude-ai"];
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

// ---------- fixture: rigtigt repo med migrations (så fladen har punkter) ----------
const ROOT = mkdtempSync(join(tmpdir(), "v5-proofs-"));
process.on("exit", () => rmSync(ROOT, { recursive: true, force: true }));
execFileSync("git", ["init", "-q", ROOT]);
const git = makeGit(ROOT);
git("config", "user.name", "selftest");
git("config", "user.email", "selftest@local");

const FILES = {
  "turbo.json": "{}\n",
  "launch/launch.json": JSON.stringify({ anker: "pakke-x", pakke: "pakke-x" }) + "\n",
  "recon/bundle.json":
    JSON.stringify({
      docs: ["vision.md"],
      // flade_filter er PÅKRÆVET (fravær = rød); fixture-filteret dækker hele
      // den lille fixture-flade, så de generelle cases tester u-filtreret adfærd.
      flade_filter: {
        punkt_ids: ["config:turbo.json", "migration:supabase/migrations/0001.sql", "rls_enabled:salg", "rls_policy:salg:salg_egen_org"],
      },
    }) + "\n",
  "recon/recon.md": "# recon — pakke-x\n\n3 bøtter, konsolideret.\n",
  "supabase/migrations/0001.sql":
    "alter table salg enable row level security;\n" +
    'create policy "salg_egen_org" on salg for select using (org_id = auth_org());\n',
};
for (const [p, c] of Object.entries(FILES)) {
  mkdirSync(join(ROOT, dirname(p)), { recursive: true });
  writeFileSync(join(ROOT, p), c);
}
git("add", "-A");
git("commit", "-qm", "fixture");
const COMMIT = git("rev-parse", "HEAD");
const ref = (p) => resolveRef(git, COMMIT, p);

const recon = ref("recon/recon.md");
const launch = ref("launch/launch.json");
const bundle = ref("recon/bundle.json");

// grøn bucket_map: dækker HVERT deriveret flade-punkt
const fullBucketMap = () => {
  const surface = deriveSurface({ git, commitSha: COMMIT });
  const m = {};
  for (const p of surface.points) m[p.id] = p.kind === "config" ? "dokument" : "nuvaerende-kode";
  return m;
};
const greenProof = () => ({
  ok: true,
  gate_id: "recon",
  proof_kind: "recon-coverage",
  artifact_oid: recon.oid,
  bindings_oids: { anker: launch.oid, bundle: bundle.oid },
  bucket_map: fullBucketMap(),
  independence: {
    bundle_oid: bundle.oid,
    actors: RECON_ACTORS.map((a) => ({
      aktor: a,
      workdir_attest: true,
      web_forbud_attest: true,
      read_forbud_attest: true,
    })),
  },
  conflicts_preserved: true,
  omission_devil: { conclusion: "PASS", filter_angreb: "PASS", pakke_flade_angreb: "PASS" },
});
const snap = (proof) => ({
  commit_sha: COMMIT,
  artifact: recon,
  bindings: { anker: launch, bundle },
  proof_result: proof,
  verdicts: [],
  approval: null,
  predecessor: null,
});
const verify = (proof) => verifyReconCoverageProof(proof, snap(proof), { git });
// muter en grøn proof
const mutated = (fn) => {
  const p = greenProof();
  fn(p);
  return p;
};

console.log("verifyReconCoverageProof — grøn sti:");
expectGreen("fuld dækning + 3 blinde attester + omission PASS", verify(greenProof()));

console.log("\nmekanisk kerne — frisk flade-re-derivation (kan ikke påstås):");
expectRed(
  "misset flade-punkt (uklassificeret i recon)",
  verify(mutated((p) => delete p.bucket_map["rls_policy:salg:salg_egen_org"])),
  "uklassificeret i recon",
);
expectRed(
  "kode-punkt klassificeret intet-data",
  verify(mutated((p) => (p.bucket_map["rls_enabled:salg"] = "intet-data"))),
  "koden findes",
);
expectRed("bucket_map mangler", verify(mutated((p) => delete p.bucket_map)), "bucket_map mangler");

console.log("\n3-blind struktur:");
expectRed(
  "forkert bundle_oid (ikke samme input)",
  verify(mutated((p) => (p.independence.bundle_oid = recon.oid))),
  "matcher ikke det gatede bundle",
);
expectRed(
  "manglende recon-aktør (kun 2)",
  verify(mutated((p) => (p.independence.actors = p.independence.actors.slice(0, 2)))),
  "manglende recon-aktør",
);
expectRed(
  "attest ikke eksplicit true",
  verify(mutated((p) => (p.independence.actors[0].web_forbud_attest = false))),
  "web_forbud_attest ikke eksplicit true",
);
expectRed(
  "manglende attest-felt (arvet/fraværende)",
  verify(mutated((p) => delete p.independence.actors[1].read_forbud_attest)),
  "read_forbud_attest ikke eksplicit true",
);
expectRed(
  "dublet recon-aktør",
  verify(mutated((p) => (p.independence.actors[1].aktor = "code"))),
  "dublet recon-aktør",
);
expectRed(
  "ukendt recon-aktør",
  verify(mutated((p) => (p.independence.actors[0].aktor = "hacker"))),
  "ukendt/ugyldig recon-aktør",
);

console.log("\nkonflikt-bevaring + omission-devil:");
expectRed(
  "kasseret uenighed (conflicts_preserved ikke true)",
  verify(mutated((p) => (p.conflicts_preserved = false))),
  "kasseret uenighed",
);
expectRed(
  "omission-devil ikke PASS",
  verify(mutated((p) => (p.omission_devil.conclusion = "FAIL"))),
  "omission-devil ikke PASS",
);
expectRed(
  "omission-devil uden filter_angreb-akse (filteret skal dømmes)",
  verify(mutated((p) => delete p.omission_devil.filter_angreb)),
  "aksen 'filter_angreb' ikke eksplicit PASS",
);
expectRed(
  "omission-devil med pakke_flade_angreb ≠ PASS",
  verify(mutated((p) => (p.omission_devil.pakke_flade_angreb = "FAIL"))),
  "aksen 'pakke_flade_angreb' ikke eksplicit PASS",
);

console.log("\npakke-flade-filter (flade_filter i bundlet — scope er struktur, ikke disciplin):");
// nyt fixture-lag: bundle MED filter → kun det filtrerede sæt kræves dækket
writeFileSync(
  join(ROOT, "recon/bundle.json"),
  JSON.stringify({ docs: ["vision.md"], flade_filter: { punkt_ids: ["rls_enabled:salg", "rls_policy:salg:salg_egen_org"] } }) + "\n",
);
git("add", "-A");
git("commit", "-qm", "fixture: bundle med pakke-flade-filter");
const COMMIT_F = git("rev-parse", "HEAD");
const refF = (p) => resolveRef(git, COMMIT_F, p);
const reconF = refF("recon/recon.md");
const launchF = refF("launch/launch.json");
const bundleF = refF("recon/bundle.json");
const filteredProof = (bucketMap) => ({
  ...greenProof(),
  artifact_oid: reconF.oid,
  bindings_oids: { anker: launchF.oid, bundle: bundleF.oid },
  bucket_map: bucketMap,
  independence: { ...greenProof().independence, bundle_oid: bundleF.oid },
});
const snapF = (proof) => ({
  commit_sha: COMMIT_F,
  artifact: reconF,
  bindings: { anker: launchF, bundle: bundleF },
  proof_result: proof,
  verdicts: [],
  approval: null,
  predecessor: null,
});
const verifyF = (proof) => verifyReconCoverageProof(proof, snapF(proof), { git });
expectGreen(
  "dækning af KUN pakke-fladen er grøn (punkter uden for filteret kræves ikke)",
  verifyF(filteredProof({ "rls_enabled:salg": "nuvaerende-kode", "rls_policy:salg:salg_egen_org": "nuvaerende-kode" })),
);
expectRed(
  "misset punkt INDEN FOR pakke-fladen stadig rød",
  verifyF(filteredProof({ "rls_enabled:salg": "nuvaerende-kode" })),
  "uklassificeret i recon",
);
{
  // malformet filter → rød (aldrig tavst fuld/ingen flade)
  writeFileSync(join(ROOT, "recon/bundle.json"), JSON.stringify({ flade_filter: { punkt_ids: [] } }) + "\n");
  git("add", "-A");
  git("commit", "-qm", "fixture: malformet filter");
  const C = git("rev-parse", "HEAD");
  const rr = (p) => resolveRef(git, C, p);
  const pr = { ...greenProof(), artifact_oid: rr("recon/recon.md").oid, bindings_oids: { anker: rr("launch/launch.json").oid, bundle: rr("recon/bundle.json").oid } };
  pr.independence = { ...pr.independence, bundle_oid: rr("recon/bundle.json").oid };
  const sn = { commit_sha: C, artifact: rr("recon/recon.md"), bindings: { anker: rr("launch/launch.json"), bundle: rr("recon/bundle.json") }, proof_result: pr, verdicts: [], approval: null, predecessor: null };
  expectRed("malformet flade_filter → rød", verifyReconCoverageProof(pr, sn, { git }), "pakke-flade-derivation fejlede");
}
{
  // filter med ukendt punkt-id → rød (typo-værn)
  writeFileSync(join(ROOT, "recon/bundle.json"), JSON.stringify({ flade_filter: { punkt_ids: ["rls_enabled:findes_ikke"] } }) + "\n");
  git("add", "-A");
  git("commit", "-qm", "fixture: ukendt id i filter");
  const C = git("rev-parse", "HEAD");
  const rr = (p) => resolveRef(git, C, p);
  const pr = { ...greenProof(), artifact_oid: rr("recon/recon.md").oid, bindings_oids: { anker: rr("launch/launch.json").oid, bundle: rr("recon/bundle.json").oid } };
  pr.independence = { ...pr.independence, bundle_oid: rr("recon/bundle.json").oid };
  const sn = { commit_sha: C, artifact: rr("recon/recon.md"), bindings: { anker: rr("launch/launch.json"), bundle: rr("recon/bundle.json") }, proof_result: pr, verdicts: [], approval: null, predecessor: null };
  expectRed("ukendt punkt-id i filter → rød (typo-værn)", verifyReconCoverageProof(pr, sn, { git }), "ukendt punkt-id");
}
expectRed(
  "ulæseligt bundle (binding peger på ikke-eksisterende blob) → rød",
  verifyReconCoverageProof(greenProof(), { ...snap(greenProof()), bindings: { anker: launch, bundle: { path: "recon/bundle.json", oid: "0".repeat(40), type: "blob" } } }, { git }),
  "pakke-flade-derivation fejlede",
);
{
  // bundle HELT UDEN flade_filter → rød (fravær = rød, aldrig fuld-flade-default)
  writeFileSync(join(ROOT, "recon/bundle.json"), JSON.stringify({ docs: ["vision.md"] }) + "\n");
  git("add", "-A");
  git("commit", "-qm", "fixture: bundle uden filter");
  const C = git("rev-parse", "HEAD");
  const rr = (p) => resolveRef(git, C, p);
  const pr = { ...greenProof(), artifact_oid: rr("recon/recon.md").oid, bindings_oids: { anker: rr("launch/launch.json").oid, bundle: rr("recon/bundle.json").oid } };
  pr.independence = { ...pr.independence, bundle_oid: rr("recon/bundle.json").oid };
  const sn = { commit_sha: C, artifact: rr("recon/recon.md"), bindings: { anker: rr("launch/launch.json"), bundle: rr("recon/bundle.json") }, proof_result: pr, verdicts: [], approval: null, predecessor: null };
  expectRed("bundle uden flade_filter → rød (eksplicit deklaration påkrævet)", verifyReconCoverageProof(pr, sn, { git }), "flade_filter mangler");
}

console.log("\nrouter (makeProofVerifier) — dispatch + fail-closed:");
const route = makeProofVerifier({ git });
// build-proof er nu BYGGET → routeren leder den til verifyBuildProof; en tom
// payload er stadig rød (her: recon-snapshot har ingen plan-binding). Fuld
// build-proof red-team ligger i build-proof.selftest.mjs.
expectRed(
  "build-proof routes til verifyBuildProof (rød på tom payload)",
  route({ proof_kind: "build-proof" }, snap(greenProof())),
  "plan-binding",
);
expectRed(
  "chain-proof ikke bygget → rød",
  route({ proof_kind: "chain-proof" }, snap(greenProof())),
  "endnu ikke bygget",
);
expectRed("ukendt proof_kind → rød", route({ proof_kind: "vrøvl" }, snap(greenProof())), "ukendt proof_kind");
expectGreen("router leder recon-coverage til den rigtige verifikator", route(greenProof(), snap(greenProof())));

console.log("\nCodex-fund — prototype-proof (arvede evidens-felter) afvises:");
{
  // hele proofet på prototypen → Object.keys(proof) === [] (ingen egne felter)
  const proto = greenProof();
  const protoProof = Object.create(proto);
  const r = verify(protoProof);
  !r.ok
    ? ok("Object.create(proto)-proof afvises (evidens skal være egne felter)")
    : bad("prototype-proof", "GRØN via arvede felter");
  // routeren må heller ikke lede det til grønt
  const rr = makeProofVerifier({ git })(protoProof, snap(greenProof()));
  !rr.ok ? ok("router afviser prototype-proof (ikke plain object)") : bad("router-prototype", "GRØN");
}

console.log("\nende-til-ende gennem evaluateGate (recon-gaten):");
{
  const deps = { verifyProof: makeProofVerifier({ git }) };
  const r = evaluateGate("recon", snap(greenProof()), deps);
  r.open ? ok("recon-gaten ÅBNER med ægte recon-coverage-proof") : bad("e2e-grøn", r.reasons.join(" | "));
}
{
  const deps = { verifyProof: makeProofVerifier({ git }) };
  const p = mutated((x) => delete x.bucket_map["rls_enabled:salg"]);
  const r = evaluateGate("recon", snap(p), deps);
  !r.open && r.reasons.some((x) => /uklassificeret|verifyProof/.test(x))
    ? ok("recon-gaten LUKKER når et flade-punkt mangler i recon (frisk re-kør fanger det)")
    : bad("e2e-rød", r.open ? "ÅBNEDE" : r.reasons.join(" | "));
}
{
  // et generisk {ok:true} uden binding kan ikke åbne (kernen binder proof_kind/oid FØR verifyProof)
  const deps = { verifyProof: makeProofVerifier({ git }) };
  const r = evaluateGate("recon", snap({ ok: true }), deps);
  !r.open
    ? ok("generisk {ok:true} åbner ikke recon-gaten (binding + frisk verifikation)")
    : bad("e2e-generisk", "ÅBNEDE");
}

console.log("");
if (failed > 0) {
  console.error(`proofs red-team: ${failed} FEJLEDE`);
  process.exit(1);
}
console.log("proofs red-team: alle cases passed");
