#!/usr/bin/env node
// build-proof.selftest.mjs — red-team af verifyBuildProof v3 (hurtigt spor 2026-09-21): beviset er test-runnerens RAPPORT; manifest OG
// angrebs-INDEKS er gate-bindinger @ den pinnede commit; verifieren tjekker struktur + binding: præcis indeksets tests (alle ok) og
// mutanter (alle dræbt efter protokollen, genudledt) · summary · bids/reviews/prover · ci-produceret artefakt. Hver plantet falsk-grøn → rød.
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { evaluateGate } from "./gates.mjs";
import { makeGit, resolveRef } from "./git.mjs";
import { verifyBuildProof } from "./build-proof.mjs";
import { makeProofVerifier } from "./proofs.mjs";
import { runTestSuite } from "./test-runner.mjs";

let failed = 0, passed = 0;
const ok = (n) => { passed++; console.log(`  ✓ ${n}`); };
const bad = (n, d) => { failed++; console.error(`  ✗ ${n} — ${d}`); };
const expectGreen = (n, r) => (r.ok === true ? ok(n) : bad(n, `rød: ${r.reasons.join(" | ").slice(0, 600)}`));
const expectRed = (n, r, needle) => { const hit = r.reasons.some((x) => new RegExp(needle).test(x)); !r.ok && hit ? ok(n) : bad(n, r.ok ? "GRØN (falsk-grøn slap igennem)" : `rød men uden '${needle}': ${r.reasons.join(" | ").slice(0, 400)}`); };

// ---------- fixture-repo: filer + testfiler → manifest → indeks (3 commits) ----------
const ROOT = mkdtempSync(join(tmpdir(), "v5-buildproof-")); process.on("exit", () => rmSync(ROOT, { recursive: true, force: true }));
execFileSync("git", ["init", "-q", ROOT]); const git = makeGit(ROOT); git("config", "user.name", "selftest"); git("config", "user.email", "selftest@local");
const put = (p, c) => { mkdirSync(join(ROOT, dirname(p)), { recursive: true }); writeFileSync(join(ROOT, p), c); };
const oidOf = (p) => execFileSync("git", ["-C", ROOT, "hash-object", p], { encoding: "utf8" }).trim();
put("plan/plan.md", "# plan — pakke-x\n"); put("build/build-proof.json", JSON.stringify({ note: "artefakt-placeholder" }) + "\n"); put("plan-build/pakke-x/forventningsliste.md", "# liste (LÅST)\n"); put("docs/krav.md", "# krav\n");
const F1 = "scripts/v5/pakke-x/tests/k1.test.mjs", F2 = "scripts/v5/pakke-x/tests/k2.test.mjs";
put(F1, `export const tests = [
  { id: "t-k1-neg", covers: ["K-1/ac-1:UT", "K-1/ac-1/neg-1"], run: async (lib) => { const a = lib.som({ role: "app_role" }); lib.forvent.ok(await a.sql("POS")); lib.forvent.afvist(await a.sql("NEG"), "K-1/ac-1/neg-1"); } },
  { id: "t-k1-audit", covers: ["K-1/ac-1:MH", "K-1/ac-1|audit-row"], run: async (lib) => { lib.forvent.ok(await lib.som({ role: "app_role" }).sql("ACT_MH")); lib.forvent.lig((await lib.ejer.sql("AUDIT")).rows, { kind: "count", value: 1 }, "audit-row"); } },
  { id: "t-k1-fs", covers: ["K-1/ac-3:FS", "K-1/ac-3|hist"], run: async (lib) => { lib.forvent.lig((await lib.ejer.sql("OBS")).rows, { kind: "scalar", value: 100 }); lib.forvent.lig((await lib.ejer.sql("OBS_HIST")).rows, { kind: "scalar", value: 80 }); } },
];
`);
put(F2, `export const tests = [
  { id: "t-k2-neg", covers: ["K-2/ac-6:UT", "K-2/ac-6/neg-1"], run: async (lib) => { const a = lib.som({ role: "app_role" }); lib.forvent.ok(await a.sql("POS2")); lib.forvent.afvist(await a.sql("NEG2"), "K-2/ac-6/neg-1"); } },
  { id: "t-k2-sa", covers: ["K-2/ac-6:SA", "K-2/ac-6|r1", "K-2/ac-6/neg-1"], run: async (lib) => { const r = await lib.race({ a: "A", b: "B" }); lib.forvent.sandt(r.protocolOk === true, "race-protokol"); lib.forvent.afvist(r.b, "K-2/ac-6/neg-1"); lib.forvent.lig(r.invariantRows, { kind: "scalar", value: 1 }, "invariant"); } },
];
`);
git("add", "-A"); git("commit", "-qm", "filer"); const C0 = git("rev-parse", "HEAD"); const oidAt = (p, c = C0) => resolveRef(git, c, p).oid;
const rc = (sqlstate, sted, grund, fase = "wrapper", aktoer = "app_role") => ({ kanal: "sqlstate", sqlstate, grund, afvisningssted: sted, fase, aktoer, observationskanal: "sqlstate", offentlig_signatur: "f(text)" });
const MANIFEST = { schema_version: 1, pakke: "pakke-x",
  bindings: { forventningsliste: { path: "plan-build/pakke-x/forventningsliste.md", oid: oidAt("plan-build/pakke-x/forventningsliste.md") }, krav: { path: "docs/krav.md", oid: oidAt("docs/krav.md") }, plan: { path: "plan/plan.md", oid: oidAt("plan/plan.md") } },
  guards: [{ id: "g.navn", beskrivelse: "navn" }, { id: "g.min", beskrivelse: "min" }],
  obligations: [
    { id: "K-1/ac-1", k_id: "K-1", kind: "ac", proof_forms: ["UT", "MH"], scope: "nu", effekt_bid: "bid-2", kildeankre: ["K:1"], assertions: [{ id: "audit-row", form: "MH" }], negatives: [{ id: "K-1/ac-1/neg-1", beskrivelse: "blank", reject_contract: rc("22023", "f.lokation_opret", "navn_blank"), sole_guard_ref: "g.navn" }] },
    { id: "K-1/ac-3", k_id: "K-1", kind: "ac", proof_forms: ["FS"], scope: "nu", kildeankre: ["K:3"], assertions: [{ id: "hist", form: "FS" }], negatives: [] },
    { id: "K-2/ac-6", k_id: "K-2", kind: "ac", proof_forms: ["SA", "UT"], scope: "nu", kildeankre: ["K:6"], assertions: [{ id: "r1", form: "SA" }], negatives: [{ id: "K-2/ac-6/neg-1", beskrivelse: "sidste", reject_contract: rc("P0001", "f.stand_deaktiver", "min_en_stand", "apply"), sole_guard_ref: "g.min" }] },
  ] };
put("plan-build/pakke-x/forventnings-manifest.json", JSON.stringify(MANIFEST, null, 1) + "\n"); put("plan-build/pakke-x/manifest-ugyldigt.json", JSON.stringify({ ...MANIFEST, obligations: [] }) + "\n");
git("add", "-A"); git("commit", "-qm", "manifest"); const C1 = git("rev-parse", "HEAD"); const MOID = oidAt("plan-build/pakke-x/forventnings-manifest.json", C1);
const INDEX = { schema_version: 2, pakke: "pakke-x", bindings: { manifest: { path: "plan-build/pakke-x/forventnings-manifest.json", oid: MOID }, plan: { path: "plan/plan.md", oid: oidAt("plan/plan.md") } },
  bids: [{ bid_id: "bid-1", kind: "forudsaetning", depends_on: [], covers: [] }, { bid_id: "bid-2", kind: "effekt", depends_on: ["bid-1"], covers: ["K-1/ac-1", "K-1/ac-3", "K-2/ac-6"] }],
  tests: [
    { id: "t-k1-neg", file: F1, oid: oidOf(F1), covers: ["K-1/ac-1:UT", "K-1/ac-1/neg-1"] }, { id: "t-k1-audit", file: F1, oid: oidOf(F1), covers: ["K-1/ac-1:MH", "K-1/ac-1|audit-row"] }, { id: "t-k1-fs", file: F1, oid: oidOf(F1), covers: ["K-1/ac-3:FS", "K-1/ac-3|hist"] },
    { id: "t-k2-neg", file: F2, oid: oidOf(F2), covers: ["K-2/ac-6:UT", "K-2/ac-6/neg-1"] }, { id: "t-k2-sa", file: F2, oid: oidOf(F2), covers: ["K-2/ac-6:SA", "K-2/ac-6|r1", "K-2/ac-6/neg-1"] },
  ],
  mutants: [
    { mutant_id: "m-navn", guard_ref: "g.navn", apply: "M_NAVN_OFF", restore: "M_NAVN_ON", target_test_ids: ["t-k1-neg"], control_test_ids: ["t-k1-fs", "t-k2-neg"] },
    { mutant_id: "m-min", guard_ref: "g.min", apply: "M_TRG_OFF", restore: "M_TRG_ON", target_test_ids: ["t-k2-neg", "t-k2-sa"], control_test_ids: ["t-k1-neg"] },
  ] };
put("plan-build/pakke-x/angrebs-spec.json", JSON.stringify(INDEX, null, 1) + "\n");
put("plan-build/pakke-x/indeks-ukomplet.json", JSON.stringify({ ...INDEX, mutants: [INDEX.mutants[0]] }, null, 1) + "\n");   // K-2 uden mutant
put("plan-build/pakke-x/indeks-andet-manifest.json", JSON.stringify({ ...INDEX, bindings: { ...INDEX.bindings, manifest: { path: "plan-build/pakke-x/forventnings-manifest.json", oid: "a".repeat(40) } } }, null, 1) + "\n");
put("plan-build/pakke-x/dsl-skema-1.json", JSON.stringify({ schema_version: 1, pakke: "pakke-x", bindings: INDEX.bindings, bids: INDEX.bids, cases: [], mutants: [] }, null, 1) + "\n");
git("add", "-A"); git("commit", "-qm", "indeks"); const COMMIT = git("rev-parse", "HEAD");
const ref = (p, c = COMMIT) => ({ path: p, oid: oidAt(p, c), type: "blob" });
const artifact = ref("build/build-proof.json"), plan = ref("plan/plan.md"), manifestRef = ref("plan-build/pakke-x/forventnings-manifest.json"), idxRef = ref("plan-build/pakke-x/angrebs-spec.json");
const ORPHAN = git("commit-tree", `${COMMIT}^{tree}`, "-m", "orphan");

// ---------- grøn rapport produceres af test-runneren mod indekset ----------
const R = (okv, code = null, message = null, routine = null, rows) => ({ ok: okv, error: okv ? null : message, code, detail: okv ? null : { message, routine }, ...(rows !== undefined ? { rows } : {}) });
function mkRunner() {
  const st = { navn: true, trg: true };
  return { st,
    sql(t) { switch (t) {
      case "POS": case "POS2": case "ACT_MH": return R(true); case "NEG": return st.navn ? R(false, "22023", "navn_blank", "f.lokation_opret") : R(true); case "NEG2": return st.trg ? R(false, "P0001", "min_en_stand", "f.stand_deaktiver") : R(true);
      case "AUDIT": return R(true, null, null, null, [{ id: 1 }]); case "OBS": return R(true, null, null, null, [{ pris: 100 }]); case "OBS_HIST": return R(true, null, null, null, [{ pris: 80 }]);
      case "M_NAVN_OFF": st.navn = false; return R(true); case "M_NAVN_ON": st.navn = true; return R(true); case "M_TRG_OFF": st.trg = false; return R(true); case "M_TRG_ON": st.trg = true; return R(true);
      default: return R(false, "42601", "ukendt " + t, null); } },
    race() { return st.trg ? { ok: true, protocolOk: true, b: { ok: false, code: "P0001", detail: { message: "min_en_stand", routine: "f.stand_deaktiver" } }, invariantRows: [{ aktive: 1 }] } : { ok: true, protocolOk: true, b: { ok: true, code: null, detail: null }, invariantRows: [{ aktive: 0 }] }; } };
}
const RUN = "run-2026-09-21T14";
const REPORT = await runTestSuite({ index: INDEX, indexOid: idxRef.oid, runner: mkRunner(), manifest: MANIFEST, root: ROOT, runId: RUN });
if (!(REPORT.tests.every((t) => t.ok) && REPORT.mutants.every((m) => m.killed))) { console.error("fixture brudt — rapporten er ikke grøn:", JSON.stringify(REPORT.summary), JSON.stringify(REPORT.tests.filter((t) => !t.ok)), JSON.stringify(REPORT.mutants.filter((m) => !m.killed))); process.exit(1); }
const clone = (v) => JSON.parse(JSON.stringify(v));
const greenProof = () => ({
  ...clone(REPORT), ok: true, gate_id: "build", proof_kind: "build-proof", artifact_oid: artifact.oid, bindings_oids: { plan: plan.oid, manifest: manifestRef.oid, angrebsspec: idxRef.oid },
  engine: { run_id: RUN, store: "real", summary: clone(REPORT.summary), allOk: true },
  bid_bindings: [{ bid_id: "bid-1", base_oid: COMMIT }, { bid_id: "bid-2", base_oid: COMMIT }],
  async_reviews: [{ bid_id: "bid-1", conclusion: "PASS", base_oid: COMMIT }, { bid_id: "bid-2", conclusion: "PASS", base_oid: COMMIT }],
  prover_result: { ok: true, total: 5, passed: 5, failed: 0, skipped: 0 },
});
const snap = (proof, manifest = manifestRef, idx = idxRef) => ({ commit_sha: COMMIT, artifact, bindings: { plan, manifest, angrebsspec: idx }, proof_result: proof, verdicts: [], approval: null, predecessor: { gate_id: "plan", conclusion: "success", artifact_oid: plan.oid, bindings_oids: { manifest: manifest.oid } } });
const verify = (p, s = snap(p)) => verifyBuildProof(p, s, { git });
const mutated = (f) => { const p = greenProof(); f(p); return p; };
const test = (p, id) => p.tests.find((t) => t.id === id); const mut = (p, id) => p.mutants.find((m) => m.mutant_id === id);

console.log("grøn sti:");
expectGreen("ægte rapport fra test-runneren mod det gate-bundne indeks → grøn", verify(greenProof()));
{ const r = evaluateGate("build", snap(greenProof()), { verifyProof: makeProofVerifier({ git }) }); r.open ? ok("e2e: build-gaten ÅBNER m. rapport + kæde-bundet manifest + gate-bundet indeks") : bad("e2e-grøn", r.reasons.join(" | ")); }
{ const p = greenProof(); const s = snap(p); const ci = { ...s, artifact: { path: s.artifact.path, oid: "c".repeat(40), type: "ci-produced" }, proof_result: { ...p, artifact_oid: "c".repeat(40) } }; const r = evaluateGate("build", ci, { verifyProof: makeProofVerifier({ git }) }); r.open ? ok("e2e: ci-produceret artefakt (beviset committes ikke) → ÅBEN når proof.artifact_oid = artefakt-oid") : bad("e2e ci-produced", r.reasons.join(" | ")); }
expectGreen("router → verifyBuildProof (grøn)", makeProofVerifier({ git })(greenProof(), snap(greenProof())));

console.log("\nbindinger (fail-closed):");
expectRed("git-dep mangler", verifyBuildProof(greenProof(), snap(greenProof()), {}), "git-dep mangler");
expectRed("snapshot mangler", verifyBuildProof(greenProof(), null, { git }), "snapshot mangler");
expectRed("commit_sha = HEAD (mutable)", verify(greenProof(), { ...snap(greenProof()), commit_sha: "HEAD" }), "pinned OID");
expectRed("angrebsspec-binding mangler i snapshot", verify(greenProof(), (() => { const s = snap(greenProof()); delete s.bindings.angrebsspec; return s; })()), "angrebsspec-binding mangler");
expectRed("manifest-binding m. stale oid", verify(greenProof(), snap(greenProof(), { path: manifestRef.path, oid: "b".repeat(40) })), "stale/orphan");
expectRed("manifest ugyldigt @ commit", verify(greenProof(), snap(greenProof(), ref("plan-build/pakke-x/manifest-ugyldigt.json"))), "manifest ugyldigt");
expectRed("indeks ukomplet mod manifestet (K-2 uden mutant) @ commit → rød", verify(greenProof(), snap(greenProof(), manifestRef, ref("plan-build/pakke-x/indeks-ukomplet.json"))), "ukomplet");
expectRed("indeks m. anden manifest-binding → rød", verify(greenProof(), snap(greenProof(), manifestRef, ref("plan-build/pakke-x/indeks-andet-manifest.json"))), "≠ gatens manifest-binding");
expectRed("DSL skema 1 som gate-binding → rød (kun indeks skema 2 dømmes)", verify(greenProof(), snap(greenProof(), manifestRef, ref("plan-build/pakke-x/dsl-skema-1.json"))), "schema_version ≠ 2");
expectRed("rapportens index_oid ≠ gate-bindingens → rød (rapport fra et andet indeks)", verify(mutated((p) => (p.index_oid = "d".repeat(40)))), "index_oid");
expectRed("rapportens pakke ≠ indeksets", verify(mutated((p) => (p.pakke = "anden"))), "pakke");
expectRed("bevisets schema_version ≠ 3", verify(mutated((p) => (p.schema_version = 1))), "schema_version ≠ 3");
expectRed("proof bærer egen spec (cases) → rød (ikke en kilde)", verify(mutated((p) => (p.cases = []))), "ikke en kilde");
expectRed("ci-produceret artefakt m. ugyldig oid → rød", verifyBuildProof(greenProof(), { ...snap(greenProof()), artifact: { path: artifact.path, oid: "ikke-en-oid", type: "ci-produced" } }, { git }), "ci-produced");

console.log("\ntests — præcis indeksets, alle ok:");
expectRed("en test FEJLET → rød m. detail", verify(mutated((p) => { const t = test(p, "t-k1-audit"); t.ok = false; t.detail = "audit-row: rows=0 (forventet 1)"; })), "t-k1-audit FEJLEDE.*rows=0");
expectRed("test udeladt fra rapporten → rød (udeladelse)", verify(mutated((p) => (p.tests = p.tests.filter((t) => t.id !== "t-k2-sa")))), "intet resultat \\(udeladelse\\)");
expectRed("rogue test (ikke i indekset) → rød", verify(mutated((p) => p.tests.push({ id: "t-egen", file: F1, covers: ["K-1/ac-1:UT"], ok: true, ms: 1, detail: null }))), "rogue");
expectRed("dublet test-resultat → rød", verify(mutated((p) => p.tests.push(clone(test(p, "t-k1-neg"))))), "dublet");
expectRed("covers pyntet i rapporten ≠ indeksets → rød", verify(mutated((p) => test(p, "t-k1-fs").covers.push("K-2/ac-6:UT"))), "covers ≠ indeksets");
expectRed("file ≠ indeksets → rød", verify(mutated((p) => (test(p, "t-k1-fs").file = F2))), "file ≠ indeksets");
expectRed("ok som getter → rød (own-egenskab kræves)", verify(mutated((p) => { const t = test(p, "t-k1-fs"); delete t.ok; Object.defineProperty(t, "ok", { enumerable: true, get: () => true }); })), "FEJLEDE");
expectRed("tests ikke et array → rød", verify(mutated((p) => (p.tests = {}))), "tæt array");

console.log("\nmutanter — kill genudledes fra protokollen:");
expectRed("target overlevede (failed:false) m. killed:true → rød (IKKE dræbt + selvrapporteret ≠ genudledt)", verify(mutated((p) => (mut(p, "m-navn").targets[0].failed = false))), "IKKE dræbt");
expectRed("killed pyntet uden protokol → 'selvrapporteret killed ≠ genudledt'", verify(mutated((p) => (mut(p, "m-navn").targets[0].failed = false))), "selvrapporteret killed ≠ genudledt");
expectRed("applied_ok false → rød", verify(mutated((p) => (mut(p, "m-min").applied_ok = false))), "IKKE dræbt \\(applied=false");
expectRed("control fejlede under mutanten → rød (mutanten rammer bredere end værnet)", verify(mutated((p) => (mut(p, "m-min").controls[0].ok = false))), "controls ok=false");
expectRed("restore_ok false → rød (beskidt store)", verify(mutated((p) => (mut(p, "m-navn").restore_ok = false))), "restore=false");
expectRed("restored: en test ikke grøn igen → rød", verify(mutated((p) => (mut(p, "m-navn").restored[1].ok = false))), "IKKE dræbt");
expectRed("kun én af to targets fejlede → rød (alle targets skal fejle)", verify(mutated((p) => (mut(p, "m-min").targets[1].failed = false))), "targets fejlede=1/2");
expectRed("targets ≠ indeksets target_test_ids → rød", verify(mutated((p) => (mut(p, "m-min").targets = [mut(p, "m-min").targets[0]]))), "targets ≠ indeksets");
expectRed("controls ≠ indeksets → rød", verify(mutated((p) => mut(p, "m-min").controls.push({ id: "t-k1-fs", ok: true }))), "controls ≠ indeksets");
expectRed("restored ≠ targets+controls → rød", verify(mutated((p) => mut(p, "m-min").restored.pop())), "restored ≠");
expectRed("guard_ref ≠ indeksets → rød", verify(mutated((p) => (mut(p, "m-min").guard_ref = "g.navn"))), "guard_ref/locus_ref ≠ indeksets");
expectRed("locus_ref smuglet ind i rapporten → rød", verify(mutated((p) => (mut(p, "m-min").locus_ref = "plan:x"))), "guard_ref/locus_ref ≠ indeksets");
expectRed("mutant udeladt → rød", verify(mutated((p) => (p.mutants = p.mutants.filter((m) => m.mutant_id !== "m-min")))), "mutant 'm-min' fra indekset har intet resultat");
expectRed("rogue mutant → rød", verify(mutated((p) => p.mutants.push({ ...clone(mut(p, "m-min")), mutant_id: "m-egen" }))), "rogue");
expectRed("killed som getter → rød", verify(mutated((p) => { const m = mut(p, "m-navn"); delete m.killed; Object.defineProperty(m, "killed", { enumerable: true, get: () => true }); })), "selvrapporteret");
expectRed("summary pyntet → rød (genudledt)", verify(mutated((p) => (p.summary.draebt = 3))), "summary ≠ genudledt");
expectRed("engine.allOk true m. fejlet test → rød (flaget tæller ikke)", verify(mutated((p) => { test(p, "t-k2-neg").ok = false; p.engine.allOk = true; })), "FEJLEDE");

console.log("\nbids · reviews · prover:");
expectRed("bid mangler i bid_bindings → rød", verify(mutated((p) => (p.bid_bindings = p.bid_bindings.filter((b) => b.bid_id !== "bid-1")))), "kan ikke beskæres");
expectRed("ukendt bid i bid_bindings → rød", verify(mutated((p) => p.bid_bindings.push({ bid_id: "bid-9", base_oid: COMMIT }))), "ikke et bid i indekset");
expectRed("base_oid orphan (ikke ancestor) → rød", verify(mutated((p) => { p.bid_bindings[1].base_oid = ORPHAN; p.async_reviews[1].base_oid = ORPHAN; })), "ikke en ancestor");
expectRed("base_oid ikke en commit → rød", verify(mutated((p) => (p.bid_bindings[1].base_oid = "9".repeat(40)))), "ikke en eksisterende commit");
expectRed("manglende review → rød", verify(mutated((p) => (p.async_reviews = p.async_reviews.filter((r) => r.bid_id !== "bid-1")))), "mangler et PASS async-review");
expectRed("review ikke PASS → rød", verify(mutated((p) => (p.async_reviews[0].conclusion = "FAIL"))), "ikke PASS");
expectRed("review @ anden base end bid'et (stale) → rød", verify(mutated((p) => (p.async_reviews[1].base_oid = C1))), "stale review");
expectRed("prover rød → rød", verify(mutated((p) => (p.prover_result = { ok: false, reason: "2 fejlede", total: 5, passed: 3, failed: 2, skipped: 0 }))), "prover_result.ok ikke true");
expectRed("prover-summary inkonsistent → rød", verify(mutated((p) => (p.prover_result = { ok: true, total: 5, passed: 3, failed: 0, skipped: 0 }))), "prover_result:");
expectRed("prover_result mangler → rød", verify(mutated((p) => delete p.prover_result)), "prover_result mangler");

console.log("\ne2e gennem evaluateGate (lukker):");
{ const r = evaluateGate("build", snap(mutated((p) => (mut(p, "m-navn").targets[0].failed = false))), { verifyProof: makeProofVerifier({ git }) }); !r.open ? ok("build-gaten LUKKER når en mutant ikke er dræbt") : bad("e2e-mutant", "ÅBNEDE"); }
{ const r = evaluateGate("build", snap(mutated((p) => (test(p, "t-k1-neg").ok = false))), { verifyProof: makeProofVerifier({ git }) }); !r.open ? ok("build-gaten LUKKER når en test fejlede") : bad("e2e-test", "ÅBNEDE"); }
{ const s = snap(greenProof()); delete s.bindings.angrebsspec; delete s.proof_result.bindings_oids.angrebsspec; const r = evaluateGate("build", s, { verifyProof: makeProofVerifier({ git }) }); !r.open ? ok("build-gaten LUKKER uden angrebsspec-binding (kerne)") : bad("e2e-spec", "ÅBNEDE"); }

console.log("");
if (failed > 0) { console.error(`build-proof red-team: ${failed} FEJLEDE (${passed} ok)`); process.exit(1); }
console.log(`build-proof red-team: alle ${passed} cases passed`);
