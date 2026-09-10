#!/usr/bin/env node
// build-proof.selftest.mjs — red-team af verifyBuildProof v2 (C1/C2): forventningen kommer fra et COMMITTET manifest;
// grøn sti + hver plantet falsk-grøn (udeladt form/negativ · rogue · brudt case · overlevende/forkert-form mutant ·
// eneste-værn uden kill · D12-cykel/ufuldstændig dækning · proof.ks · stale manifest …) fanget; e2e gennem evaluateGate.
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
let failed = 0, passed = 0;
const ok = (n) => { passed++; console.log(`  ✓ ${n}`); };
const bad = (n, d) => { failed++; console.error(`  ✗ ${n} — ${d}`); };
const expectGreen = (n, r) => (r.ok === true ? ok(n) : bad(n, `rød: ${r.reasons.join(" | ")}`));
const expectRed = (n, r, needle) => { const hit = r.reasons.some((x) => new RegExp(needle).test(x)); !r.ok && hit ? ok(n) : bad(n, r.ok ? "GRØN (falsk-grøn slap igennem)" : `rød men uden '${needle}': ${r.reasons.join(" | ").slice(0, 400)}`); };

// ---------- fixture: rigtigt repo (2 commits: filer → manifest m. deres OID'er) ----------
const ROOT = mkdtempSync(join(tmpdir(), "v5-buildproof-"));
process.on("exit", () => rmSync(ROOT, { recursive: true, force: true }));
execFileSync("git", ["init", "-q", ROOT]);
const git = makeGit(ROOT); git("config", "user.name", "selftest"); git("config", "user.email", "selftest@local");
const put = (p, c) => { mkdirSync(join(ROOT, dirname(p)), { recursive: true }); writeFileSync(join(ROOT, p), c); };
put("plan/plan.md", "# plan — pakke-x\n\nbid-1 (forudsætning: DDL) · bid-2 (effekt) realiserer K-1, K-2, K-7.\n");
put("plan/plan-anden.md", "# en anden plan\n");
put("build/build-proof.json", JSON.stringify({ note: "artefakt-placeholder" }) + "\n");
put("recon/angrebs-spec.json", JSON.stringify({ kill_list: ["g.navn", "g.min", "g.klass"] }) + "\n");
put("plan-build/pakke-x/forventningsliste.md", "# forventningsliste (LÅST)\n");
put("docs/krav.md", "# krav\n");
put("supabase/migrations/0001.sql", "alter table salg enable row level security;\n" + 'create policy "salg_egen_org" on salg for all using (org_id = auth_org()) with check (org_id = auth_org());\n');
git("add", "-A"); git("commit", "-qm", "fixture-filer");
const C0 = git("rev-parse", "HEAD");
const oidAt = (p) => resolveRef(git, C0, p).oid;
const rc = (sqlstate, sted) => ({ kanal: "sqlstate", sqlstate, afvisningssted: sted, fase: "wrapper", aktoer: "rettighedshaver", observationskanal: "sqlstate", offentlig_signatur: "f(text)" });
const MANIFEST = {
  schema_version: 1, pakke: "pakke-x",
  bindings: { forventningsliste: { path: "plan-build/pakke-x/forventningsliste.md", oid: oidAt("plan-build/pakke-x/forventningsliste.md") }, krav: { path: "docs/krav.md", oid: oidAt("docs/krav.md") }, plan: { path: "plan/plan.md", oid: oidAt("plan/plan.md") } },
  guards: [{ id: "g.navn", beskrivelse: "navn-check" }, { id: "g.min", beskrivelse: "min-én-stand" }, { id: "g.klass", beskrivelse: "klassifikations-tjek i CI" }],
  obligations: [
    { id: "K-1/ac-1", k_id: "K-1", kind: "ac", proof_forms: ["UT", "MH"], scope: "nu", kildeankre: ["K:1"], negatives: [{ id: "K-1/ac-1/neg-1", beskrivelse: "blank", reject_contract: rc("22023", "opret"), sole_guard_ref: "g.navn" }] },
    { id: "K-1/ac-3", k_id: "K-1", kind: "ac", proof_forms: ["FS"], scope: "nu", kildeankre: ["K:3"], negatives: [] },
    { id: "K-2/ac-6", k_id: "K-2", kind: "ac", proof_forms: ["SA", "UT"], scope: "nu", kildeankre: ["K:6"], negatives: [{ id: "K-2/ac-6/neg-1", beskrivelse: "sidste stand", reject_contract: rc("P0001", "trg"), sole_guard_ref: "g.min" }] },
    { id: "K-7/S", k_id: "K-7", kind: "struktur", proof_forms: ["UT"], scope: "nu", kildeankre: ["K:7"], negatives: [{ id: "K-7/S/neg-1", beskrivelse: "ci", reject_contract: { kanal: "exit", exit_code: 1, klasse: "klassifikation", afvisningssted: "ci", fase: "ci", aktoer: "ci" } }] },
    { id: "K-2/ac-4", k_id: "K-2", kind: "ac", proof_forms: ["FS"], scope: "overdragelse", overdragelse_ref: "trin 24", kildeankre: ["K:4"], negatives: [] },
  ],
};
put("plan-build/pakke-x/forventnings-manifest.json", JSON.stringify(MANIFEST, null, 1) + "\n");
put("plan-build/pakke-x/manifest-ugyldigt.json", JSON.stringify({ ...MANIFEST, obligations: [] }) + "\n");
put("plan-build/pakke-x/manifest-anden-plan.json", JSON.stringify({ ...MANIFEST, bindings: { ...MANIFEST.bindings, plan: { path: "plan/plan-anden.md", oid: oidAt("plan/plan-anden.md") } } }) + "\n");
git("add", "-A"); git("commit", "-qm", "manifest");
const COMMIT = git("rev-parse", "HEAD");
const ref = (p) => resolveRef(git, COMMIT, p);
const plan = ref("plan/plan.md"); const artifact = ref("build/build-proof.json"); const angrebsSpec = ref("recon/angrebs-spec.json"); const manifestRef = ref("plan-build/pakke-x/forventnings-manifest.json");
// orphan commit (samme tree, ingen parent) — gyldigt commit-objekt men IKKE ancestor
const ORPHAN = git("commit-tree", `${COMMIT}^{tree}`, "-m", "orphan");
const mkEvidence = (path, start, end) => { const r = resolveRef(git, COMMIT, path); const excerpt = excerptAt(readBlobLines(git, r.oid).lines, [start, end]); return { commit_sha: COMMIT, path, blob_oid: r.oid, line_span: [start, end], excerpt_sha: sha256(excerpt) }; };

// ---------- grønt v2-bevis afledt af manifestet ----------
const RUN = "run-2026-09-10T20";
const EP = { kind: "rpc", ref: "lokation_opret" };
const cas = (id, obligation_id, form, extra = {}) => ({ case_id: id, obligation_id, proof_form: form, bid_id: "bid-2", hard_effect: "db-row", entrypoint: EP, actor_role: "app_role", status: "opfyldt", assertions: [{ id: "a1", ok: true }, { id: "a2", ok: true }], observations: {}, run_id: RUN, negative_id: null, ...extra });
const mut = (id, guard_ref, target_case_id, break_form) => ({ mutant_id: id, guard_ref, target_case_id, killed: true, break_form, restored: true, cleanAfter: true, run_id: RUN });
const greenProof = () => ({
  ok: true, gate_id: "build", proof_kind: "build-proof", artifact_oid: artifact.oid, bindings_oids: { plan: plan.oid },
  run_id: RUN, manifest_ref: { path: "plan-build/pakke-x/forventnings-manifest.json", oid: manifestRef.oid },
  engine: { run_id: RUN, store: "real", summary: { opfyldt: 6, brudt: 0, protokol_fejl: 0, mutanter: 3, draebt: 3 } },
  cases: [
    cas("c-k1-ut", "K-1/ac-1", "UT", { negative_id: "K-1/ac-1/neg-1" }), cas("c-k1-mh", "K-1/ac-1", "MH"), cas("c-k1-fs", "K-1/ac-3", "FS"),
    cas("c-k2-sa", "K-2/ac-6", "SA"), cas("c-k2-ut", "K-2/ac-6", "UT", { negative_id: "K-2/ac-6/neg-1" }),
    cas("c-k7-ut", "K-7/S", "UT", { negative_id: "K-7/S/neg-1", entrypoint: { kind: "ui-flow", ref: "ci" }, actor_role: "ci", hard_effect: "state" }),
  ],
  mutants: [mut("m-navn", "g.navn", "c-k1-ut", "UT"), mut("m-min", "g.min", "c-k2-ut", "UT"), mut("m-klass", "g.klass", "c-k7-ut", "UT")],
  bids: [
    { bid_id: "bid-1", kind: "forudsaetning", depends_on: [], covers: [], angrebs_spec_oid: angrebsSpec.oid, angrebs_spec_path: "recon/angrebs-spec.json", base_oid: COMMIT },
    { bid_id: "bid-2", kind: "effekt", depends_on: ["bid-1"], covers: ["K-1/ac-1", "K-1/ac-3", "K-2/ac-6", "K-7/S"], angrebs_spec_oid: angrebsSpec.oid, angrebs_spec_path: "recon/angrebs-spec.json", base_oid: COMMIT },
  ],
  claim_graph: [{ k_id: "K-1", executed: true, mutant_killed: true, source_anchor: mkEvidence("supabase/migrations/0001.sql", 1, 2) }],
  async_reviews: [{ bid_id: "bid-1", conclusion: "PASS", base_oid: COMMIT }, { bid_id: "bid-2", conclusion: "PASS", base_oid: COMMIT }],
  prover_result: { ok: true, tests_run: 12, skipped: 0 },
});
const snap = (proof) => ({ commit_sha: COMMIT, artifact, bindings: { plan }, proof_result: proof, verdicts: [], approval: null, predecessor: { gate_id: "plan", conclusion: "success", artifact_oid: plan.oid } });
const verify = (p) => verifyBuildProof(p, snap(p), { git });
const mutated = (f) => { const p = greenProof(); f(p); return p; };
const find = (arr, id, key = "case_id") => arr.find((x) => x[key] === id);

console.log("verifyBuildProof v2 — grøn sti:");
expectGreen("ægte v2-bevis: manifest-bundet forventning fuldt dækket · mutanter dræbt formbestemt · D12 ok", verify(greenProof()));

console.log("\nforventningen kommer fra manifestet (B2 frit pas):");
expectRed("proof.ks til stede → rød (er ikke en kilde)", verify(mutated((p) => (p.ks = [{ k_id: "K-1" }]))), "ikke en kilde");
expectRed("manifest_ref mangler", verify(mutated((p) => delete p.manifest_ref)), "manifest_ref");
expectRed("manifest_ref oid stale (anden blob)", verify(mutated((p) => (p.manifest_ref.oid = plan.oid))), "matcher ikke stien");
expectRed("manifest_ref sti findes ikke i commit", verify(mutated((p) => (p.manifest_ref.path = "plan-build/pakke-x/findes-ikke.json"))), "findes ikke i den gatede commit");
expectRed("committet men UGYLDIGT manifest → rød", verify(mutated((p) => (p.manifest_ref = { path: "plan-build/pakke-x/manifest-ugyldigt.json", oid: ref("plan-build/pakke-x/manifest-ugyldigt.json").oid }))), "manifest ugyldigt");
expectRed("manifest afledt af en ANDEN plan end gatens → rød", verify(mutated((p) => (p.manifest_ref = { path: "plan-build/pakke-x/manifest-anden-plan.json", oid: ref("plan-build/pakke-x/manifest-anden-plan.json").oid }))), "manifest.bindings.plan ≠ gatens plan");
expectRed("run_id mangler", verify(mutated((p) => delete p.run_id)), "run_id mangler");
expectRed("engine.store ikke real", verify(mutated((p) => (p.engine.store = "mock"))), 'engine.store ikke "real"');
expectRed("engine.run_id ≠ proof.run_id", verify(mutated((p) => (p.engine.run_id = "andet"))), "engine.run_id");

console.log("\ncases — komplethed pr. form og negativ, status, samme kørsel:");
expectRed("udeladt form (MH på K-1/ac-1 fjernet) → udeladelse", verify(mutated((p) => (p.cases = p.cases.filter((c) => c.case_id !== "c-k1-mh")))), "ingen opfyldt MH-case");
expectRed("udeladt negativ (UT-casen for K-2/ac-6/neg-1 fjernet) → D11 rød", verify(mutated((p) => { p.cases = p.cases.filter((c) => c.case_id !== "c-k2-ut"); p.mutants = p.mutants.filter((m) => m.mutant_id !== "m-min"); })), "negativ 'K-2/ac-6/neg-1'");
expectRed("rogue forpligtelse (K-9/ac-1) → rød", verify(mutated((p) => p.cases.push(cas("c-rogue", "K-9/ac-1", "UT", { negative_id: "K-9/ac-1/neg-1" })))), "ikke forventet");
expectRed("case på overdraget forpligtelse → rød", verify(mutated((p) => p.cases.push(cas("c-over", "K-2/ac-4", "FS")))), "ikke forventet");
expectRed("case m. form uden for manifestets former (SA på K-1/ac-3) → rød", verify(mutated((p) => p.cases.push(cas("c-sa-x", "K-1/ac-3", "SA")))), "ikke en af manifestets former");
expectRed("status brudt → rød", verify(mutated((p) => (find(p.cases, "c-k1-fs").status = "brudt"))), "≠ opfyldt");
expectRed("status protokol-fejl → rød (tavshed ≠ grøn)", verify(mutated((p) => (find(p.cases, "c-k1-fs").status = "protokol-fejl"))), "≠ opfyldt");
expectRed("én assertion ok:false trods status opfyldt → rød (inkonsistent)", verify(mutated((p) => (find(p.cases, "c-k1-fs").assertions[1].ok = false))), "alle ok:true");
expectRed("tomme assertions → rød", verify(mutated((p) => (find(p.cases, "c-k1-fs").assertions = []))), "assertions");
expectRed("case fra anden kørsel (run_id) → rød", verify(mutated((p) => (find(p.cases, "c-k1-fs").run_id = "gammel"))), "run_id ≠ kørslens");
expectRed("UT-case uden negative_id → rød", verify(mutated((p) => (find(p.cases, "c-k1-ut").negative_id = null))), "uden gyldigt negative_id");
expectRed("UT-case m. negativ fra anden forpligtelse → rød", verify(mutated((p) => (find(p.cases, "c-k1-ut").negative_id = "K-2/ac-6/neg-1"))), "uden gyldigt negative_id");
expectRed("entrypoint fri streng/helper → rød", verify(mutated((p) => (find(p.cases, "c-k1-fs").entrypoint = { kind: "helper", ref: "x" }))), "entrypoint");
expectRed("hard_effect helper-return → rød", verify(mutated((p) => (find(p.cases, "c-k1-fs").hard_effect = "helper-return"))), "hard_effect");
expectRed("actor_role mangler → rød", verify(mutated((p) => delete find(p.cases, "c-k1-fs").actor_role)), "actor_role");
expectRed("dublet case_id → rød", verify(mutated((p) => p.cases.push({ ...find(p.cases, "c-k1-fs") }))), "dublet case_id");
expectRed("case hører til forudsætnings-bid → rød", verify(mutated((p) => (find(p.cases, "c-k1-fs").bid_id = "bid-1"))), "forudsætnings-bid");
expectRed("case hører til bid der ikke dækker forpligtelsen → rød", verify(mutated((p) => { p.bids.push({ ...p.bids[1], bid_id: "bid-3", covers: ["K-1/ac-1"] }); p.async_reviews.push({ bid_id: "bid-3", conclusion: "PASS", base_oid: COMMIT }); find(p.cases, "c-k1-fs").bid_id = "bid-3"; })), "dækker ikke K-1/ac-3");

console.log("\nmutanter — D10 formbestemt kill, eneste-værn, K-gulv:");
expectRed("mutant overlever (killed:false) → rød", verify(mutated((p) => (find(p.mutants, "m-navn", "mutant_id").killed = false))), "ikke dræbt");
expectRed("dræbt men ikke restored → rød", verify(mutated((p) => (find(p.mutants, "m-navn", "mutant_id").restored = false))), "ikke dræbt\\+restored");
expectRed("break_form ≠ målets form (FS-kill på UT-case) → rød", verify(mutated((p) => (find(p.mutants, "m-navn", "mutant_id").break_form = "FS"))), "kill skal være formbestemt");
expectRed("guard_ref ikke deklareret i manifestet → rød", verify(mutated((p) => (find(p.mutants, "m-navn", "mutant_id").guard_ref = "g.hemmelig"))), "ikke et deklareret værn");
expectRed("target_case_id ukendt → rød", verify(mutated((p) => (find(p.mutants, "m-navn", "mutant_id").target_case_id = "c-x"))), "target_case_id");
expectRed("eneste-værn g.navn uden dræbt mutant → D10 rød", verify(mutated((p) => (p.mutants = p.mutants.filter((m) => m.mutant_id !== "m-navn")))), "D10: negativ 'K-1/ac-1/neg-1'");
expectRed("eneste-værn-mutant rammer et ANDET negativ end værnets → D10 rød", verify(mutated((p) => (find(p.mutants, "m-navn", "mutant_id").target_case_id = "c-k2-ut"))), "D10: negativ 'K-1/ac-1/neg-1'");
expectRed("K-7 uden dræbt mutant → gulv brudt", verify(mutated((p) => (p.mutants = p.mutants.filter((m) => m.mutant_id !== "m-klass")))), "K 'K-7' mangler");
expectRed("mutant fra anden kørsel → rød", verify(mutated((p) => (find(p.mutants, "m-navn", "mutant_id").run_id = "x"))), "run_id");
expectRed("dublet mutant_id → rød", verify(mutated((p) => p.mutants.push({ ...p.mutants[0] }))), "dublet mutant_id");
expectRed("mutants sparse → rød", verify(mutated((p) => { p.mutants.length = 4; })), "tæt array");

console.log("\nbids — D12 forudsætning → effekt:");
expectRed("cyklisk afhængighed → rød", verify(mutated((p) => (p.bids[0].depends_on = ["bid-2"]))), "cyklisk");
expectRed("depends_on på ukendt bid → rød", verify(mutated((p) => (p.bids[1].depends_on = ["bid-9"]))), "findes ikke");
expectRed("forudsætnings-bid som intet effekt-bid afhænger af → rød", verify(mutated((p) => (p.bids[1].depends_on = []))), "intet effekt-bid afhænger af");
expectRed("forudsætnings-bid m. covers → rød", verify(mutated((p) => (p.bids[0].covers = ["K-1/ac-1"]))), "forudsætnings-bid dækker ingen");
expectRed("effekt-bid dækker ikke alle forventede (K-7/S udeladt) → udeladelse", verify(mutated((p) => (p.bids[1].covers = p.bids[1].covers.filter((o) => o !== "K-7/S")))), "dækkes af intet effekt-bid");
expectRed("effekt-bid dækker rogue forpligtelse → rød", verify(mutated((p) => p.bids[1].covers.push("K-9/ac-1"))), "ikke en forventet forpligtelse");
expectRed("bid.kind ukendt → rød", verify(mutated((p) => (p.bids[1].kind = "andet"))), "kind skal være");
expectRed("angrebs-spec oid stale → rød", verify(mutated((p) => (p.bids[1].angrebs_spec_oid = plan.oid))), "matcher ikke stien");
expectRed("base_oid orphan (ikke ancestor) → rød", verify(mutated((p) => { p.bids[1].base_oid = ORPHAN; p.async_reviews[1].base_oid = ORPHAN; })), "ikke en ancestor");
expectRed("base_oid ikke-committet 40-hex → rød", verify(mutated((p) => { p.bids[1].base_oid = "a".repeat(40); p.async_reviews[1].base_oid = "a".repeat(40); })), "ikke en eksisterende commit");
expectRed("tomme bids → rød", verify(mutated((p) => (p.bids = []))), "bids skal være");

console.log("\nclaim_graph · reviews · prover (uændret kerne):");
expectRed("claim_graph tom → rød", verify(mutated((p) => (p.claim_graph = []))), "claim_graph");
expectRed("claim_graph K uden for forventningen → rød", verify(mutated((p) => (p.claim_graph[0].k_id = "K-9"))), "ukendt/manglende K");
expectRed("source_anchor forkert excerpt_sha → rød", verify(mutated((p) => (p.claim_graph[0].source_anchor.excerpt_sha = sha256("x")))), "ikke git-verificeret");
expectRed("manglende review for bid → rød", verify(mutated((p) => (p.async_reviews = p.async_reviews.filter((r) => r.bid_id !== "bid-1")))), "mangler et PASS async-review");
expectRed("review ikke PASS → rød", verify(mutated((p) => (p.async_reviews[1].conclusion = "FAIL"))), "ikke PASS");
expectRed("stale review (base_oid) → rød", verify(mutated((p) => (p.async_reviews[1].base_oid = ORPHAN))), "matcher ikke bid'ets base_oid");
expectRed("prover ikke grøn → rød", verify(mutated((p) => (p.prover_result.ok = false))), "prover ikke grøn");
expectRed("0 tests → rød", verify(mutated((p) => (p.prover_result.tests_run = 0))), "0-tests");
expectRed("skippede tests → rød", verify(mutated((p) => (p.prover_result.skipped = 2))), "skippede");

console.log("\nfail-closed (snapshot/prototype/accessors):");
expectRed("git-dep mangler", verifyBuildProof(greenProof(), snap(greenProof()), {}), "git-dep mangler");
expectRed("commit_sha = HEAD (mutable) → rød", verifyBuildProof(greenProof(), { ...snap(greenProof()), commit_sha: "HEAD" }, { git }), "pinned OID");
expectRed("plan-binding mangler i snapshot", verifyBuildProof(greenProof(), { ...snap(greenProof()), bindings: {} }, { git }), "plan-binding");
expectRed("proof på prototype (arvede felter) → rød", verifyBuildProof(Object.create(greenProof()), snap(greenProof()), { git }), "ikke et objekt");
{ const p = mutated((x) => delete find(x.cases, "c-k1-fs").hard_effect); Object.prototype.hard_effect = "db-row"; let r; try { r = verify(p); } finally { delete Object.prototype.hard_effect; } expectRed("arvet hard_effect (prototype-pollution) fanges", r, "hard_effect"); }
{ const p = mutated((x) => Object.defineProperty(find(x.mutants, "m-navn", "mutant_id"), "killed", { enumerable: true, get: () => true })); expectRed("killed som getter → rød", verify(p), "ikke dræbt"); }
{ const p = mutated((x) => { const c = find(x.cases, "c-k1-fs"); Object.defineProperty(c, "status", { enumerable: true, get: () => "opfyldt" }); }); expectRed("status som getter → rød", verify(p), "≠ opfyldt"); }

console.log("\nrouter + ende-til-ende gennem evaluateGate (build-gaten):");
const route = makeProofVerifier({ git });
expectGreen("router → verifyBuildProof (grøn)", route(greenProof(), snap(greenProof())));
expectRed("router → rød ved overlevende mutant", route(mutated((p) => (p.mutants[0].killed = false)), snap(greenProof())), "ikke dræbt");
{ const r = evaluateGate("build", snap(greenProof()), { verifyProof: makeProofVerifier({ git }) }); r.open ? ok("build-gaten ÅBNER med ægte v2-bevis + bunden forgænger") : bad("e2e-grøn", r.reasons.join(" | ")); }
{ const r = evaluateGate("build", snap(mutated((p) => (p.cases = p.cases.filter((c) => c.case_id !== "c-k1-mh")))), { verifyProof: makeProofVerifier({ git }) }); !r.open ? ok("build-gaten LUKKER når en forventet bevisform er udeladt") : bad("e2e-udeladelse", "ÅBNEDE"); }
{ const r = evaluateGate("build", snap({ ok: true, gate_id: "build", proof_kind: "build-proof", artifact_oid: artifact.oid, bindings_oids: { plan: plan.oid } }), { verifyProof: makeProofVerifier({ git }) }); !r.open ? ok("bar envelope uden bevis-payload åbner ikke") : bad("e2e-bar", "ÅBNEDE"); }
{ const g = snap(greenProof()); const keys = ["commit_sha", "artifact", "bindings", "proof_result", "predecessor", "verdicts", "approval"]; for (const k of keys) Object.prototype[k] = g[k]; let r; try { r = evaluateGate("build", {}, { verifyProof: makeProofVerifier({ git }) }); } finally { for (const k of keys) delete Object.prototype[k]; } !r.open ? ok("snapshot={} m. arvede felter åbner IKKE (prototype-pollution)") : bad("e2e-proto", "ÅBNEDE"); }

console.log("");
if (failed > 0) { console.error(`build-proof red-team: ${failed} FEJLEDE (${passed} ok)`); process.exit(1); }
console.log(`build-proof red-team: alle ${passed} cases passed`);
