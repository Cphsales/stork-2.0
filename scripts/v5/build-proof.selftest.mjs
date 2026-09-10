#!/usr/bin/env node
// build-proof.selftest.mjs — red-team af verifyBuildProof v2.1 (C1-r1 F-1..F-10): manifestet er GATE-binding; status/kill GENUDLEDES
// fra rå observationer (det grønne bevis produceres af selve motoren mod en mock-runner, så det er konsistent by construction);
// hver plantet falsk-grøn (håndskrevne flag · udeladt form/negativ/assertion · rogue · forkert kontrakt · falsk kill · D10/D12) → rød;
// e2e gennem evaluateGate m. kæde-bundet manifest.
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
import { runBuildProofEngine } from "./build-harness.mjs";

const sha256 = (s) => createHash("sha256").update(s).digest("hex");
let failed = 0, passed = 0;
const ok = (n) => { passed++; console.log(`  ✓ ${n}`); };
const bad = (n, d) => { failed++; console.error(`  ✗ ${n} — ${d}`); };
const expectGreen = (n, r) => (r.ok === true ? ok(n) : bad(n, `rød: ${r.reasons.join(" | ").slice(0, 500)}`));
const expectRed = (n, r, needle) => { const hit = r.reasons.some((x) => new RegExp(needle).test(x)); !r.ok && hit ? ok(n) : bad(n, r.ok ? "GRØN (falsk-grøn slap igennem)" : `rød men uden '${needle}': ${r.reasons.join(" | ").slice(0, 400)}`); };

// ---------- fixture-repo (2 commits: filer → manifest m. deres OID'er) ----------
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
const C0 = git("rev-parse", "HEAD"); const oidAt = (p) => resolveRef(git, C0, p).oid;
const rc = (sqlstate, sted, grund, fase = "wrapper", aktoer = "app_role") => ({ kanal: "sqlstate", sqlstate, grund, afvisningssted: sted, fase, aktoer, observationskanal: "sqlstate", offentlig_signatur: "f(text)" });
const MANIFEST = {
  schema_version: 1, pakke: "pakke-x",
  bindings: { forventningsliste: { path: "plan-build/pakke-x/forventningsliste.md", oid: oidAt("plan-build/pakke-x/forventningsliste.md") }, krav: { path: "docs/krav.md", oid: oidAt("docs/krav.md") }, plan: { path: "plan/plan.md", oid: oidAt("plan/plan.md") } },
  guards: [{ id: "g.navn", beskrivelse: "navn-check" }, { id: "g.min", beskrivelse: "min-én-stand" }, { id: "g.klass", beskrivelse: "klassifikations-tjek i CI" }, { id: "g.pris", beskrivelse: "dato-filter" }],
  obligations: [
    { id: "K-1/ac-1", k_id: "K-1", kind: "ac", proof_forms: ["UT", "MH"], scope: "nu", effekt_bid: "bid-2", kildeankre: ["K:1"], assertions: [{ id: "audit-row", form: "MH" }], negatives: [{ id: "K-1/ac-1/neg-1", beskrivelse: "blank", reject_contract: rc("22023", "f.lokation_opret", "navn_blank"), sole_guard_ref: "g.navn" }] },
    { id: "K-1/ac-3", k_id: "K-1", kind: "ac", proof_forms: ["FS"], scope: "nu", kildeankre: ["K:3"], assertions: [{ id: "hist", form: "FS" }], negatives: [] },
    { id: "K-2/ac-6", k_id: "K-2", kind: "ac", proof_forms: ["SA", "UT"], scope: "nu", kildeankre: ["K:6"], assertions: [{ id: "r1", form: "SA" }], negatives: [{ id: "K-2/ac-6/neg-1", beskrivelse: "sidste stand", reject_contract: rc("P0001", "f.stand_deaktiver", "min_en_stand", "apply"), sole_guard_ref: "g.min" }] },
    { id: "K-7/S", k_id: "K-7", kind: "struktur", proof_forms: ["UT"], scope: "nu", kildeankre: ["K:7"], negatives: [{ id: "K-7/S/neg-1", beskrivelse: "ci", reject_contract: { kanal: "exit", exit_code: 1, klasse: "klassifikation", afvisningssted: "ci", fase: "ci", aktoer: "ci" } }] },
    { id: "K-2/ac-4", k_id: "K-2", kind: "ac", proof_forms: ["FS"], scope: "overdragelse", overdragelse_ref: "trin 24", kildeankre: ["K:4"], negatives: [] },
  ],
};
put("plan-build/pakke-x/forventnings-manifest.json", JSON.stringify(MANIFEST, null, 1) + "\n");
put("plan-build/pakke-x/manifest-ugyldigt.json", JSON.stringify({ ...MANIFEST, obligations: [] }) + "\n");
put("plan-build/pakke-x/manifest-anden-plan.json", JSON.stringify({ ...MANIFEST, bindings: { ...MANIFEST.bindings, plan: { path: "plan/plan-anden.md", oid: oidAt("plan/plan-anden.md") } } }) + "\n");
git("add", "-A"); git("commit", "-qm", "manifest");
const COMMIT = git("rev-parse", "HEAD"); const ref = (p) => resolveRef(git, COMMIT, p);
const plan = ref("plan/plan.md"); const artifact = ref("build/build-proof.json"); const angrebsSpec = ref("recon/angrebs-spec.json"); const manifestRef = ref("plan-build/pakke-x/forventnings-manifest.json");
const ORPHAN = git("commit-tree", `${COMMIT}^{tree}`, "-m", "orphan");
const mkEvidence = (path, start, end) => { const r = resolveRef(git, COMMIT, path); const excerpt = excerptAt(readBlobLines(git, r.oid).lines, [start, end]); return { commit_sha: COMMIT, path, blob_oid: r.oid, line_span: [start, end], excerpt_sha: sha256(excerpt) }; };

// ---------- det grønne bevis PRODUCERES af motoren mod en mock-runner (konsistent by construction) ----------
const RUN = "run-2026-09-10T21";
const R = (ok, code = null, message = null, routine = null, rows) => ({ ok, error: ok ? null : message, code, detail: ok ? null : { message, routine }, ...(rows !== undefined ? { rows } : {}) });
function mkRunner() {
  const st = { navn: true, pris: 100, audit: true, trg: true, klass: true };
  return { st,
    sql(t) { switch (t) {
      case "POS": return R(true); case "NEG": return st.navn ? R(false, "22023", "navn_blank", "f.lokation_opret") : R(true); case "STATE": return R(true, null, null, null, [{ n: 1 }]);
      case "ACT": return R(true); case "OBS": return R(true, null, null, null, [{ pris: st.pris }]); case "OBS_HIST": return R(true, null, null, null, [{ pris: st.pris === 100 ? 80 : 90 }]);
      case "ACT_MH": return R(true); case "AUDIT": return R(true, null, null, null, st.audit ? [{ id: 1 }] : []);
      case "POS2": return R(true); case "NEG2": return st.trg ? R(false, "P0001", "min_en_stand", "f.stand_deaktiver") : R(true); case "STATE2": return R(true, null, null, null, [{ aktive: 1 }]);
      case "M_NAVN_OFF": st.navn = false; return R(true); case "M_NAVN_ON": st.navn = true; return R(true); case "M_TRG_OFF": st.trg = false; return R(true); case "M_TRG_ON": st.trg = true; return R(true);
      case "M_KLASS_OFF": st.klass = false; return R(true); case "M_KLASS_ON": st.klass = true; return R(true); case "M_PRIS_90": st.pris = 90; return R(true); case "M_PRIS_100": st.pris = 100; return R(true);
      default: return R(false, "42601", "ukendt " + t, null); } },
    race() { const a = { pid: 11, ok: true, code: null, detail: null, commit: "commit" }; return st.trg ? { protocolOk: true, a, b: { pid: 12, ok: false, code: "P0001", detail: { message: "min_en_stand", routine: "f.stand_deaktiver" }, commit: "rollback" }, barrier: { observed: true, blocked_pid: 12, blocking_pid: 11 }, invariantRows: [{ aktive: 1 }] } : { protocolOk: true, a, b: { pid: 12, ok: true, code: null, detail: null, commit: "commit" }, barrier: { observed: true, blocked_pid: 12, blocking_pid: 11 }, invariantRows: [{ aktive: 0 }] }; },
    exec() { return st.klass ? { exit_code: 1, stdout: "klasse=klassifikation\n" } : { exit_code: 0, stdout: "" }; },
  };
}
const EP = { kind: "rpc", ref: "lokation_opret" }; const ACT = { role: "app_role" }; const B = "bid-2"; const HE = "db-row";
const CASES = [
  { case_id: "c-k1-ut", obligation_id: "K-1/ac-1", negative_id: "K-1/ac-1/neg-1", proof_form: "UT", fase: "wrapper", bid_id: B, hard_effect: HE, entrypoint: EP, actor: ACT, positive: { sql: "POS" }, negative: { sql: "NEG" }, state: { sql: "STATE" } },
  { case_id: "c-k1-mh", obligation_id: "K-1/ac-1", proof_form: "MH", bid_id: B, hard_effect: HE, entrypoint: EP, actor: ACT, action: { sql: "ACT_MH" }, witnesses: [{ id: "audit-row", observe: { sql: "AUDIT" }, expect: { kind: "count", value: 1 } }] },
  { case_id: "c-k1-fs", obligation_id: "K-1/ac-3", proof_form: "FS", bid_id: B, hard_effect: "state", entrypoint: EP, actor: ACT, action: { sql: "ACT" }, observe: { sql: "OBS" }, expect: { kind: "scalar", value: 100 }, checkpoints: [{ id: "hist", observe: { sql: "OBS_HIST" }, expect: { kind: "scalar", value: 80 } }] },
  { case_id: "c-k2-sa", obligation_id: "K-2/ac-6", proof_form: "SA", bid_id: B, hard_effect: HE, entrypoint: EP, actor: ACT, race: { race_id: "r1", a: { sql: "A" }, b: { sql: "B" }, barrier: "row-lock", invariant: { observe: { sql: "INV" }, expect: { kind: "scalar", value: 1 } }, reject_negative_id: "K-2/ac-6/neg-1" } },
  { case_id: "c-k2-ut", obligation_id: "K-2/ac-6", negative_id: "K-2/ac-6/neg-1", proof_form: "UT", fase: "apply", bid_id: B, hard_effect: HE, entrypoint: EP, actor: ACT, positive: { sql: "POS2" }, negative: { sql: "NEG2" }, state: { sql: "STATE2" } },
  { case_id: "c-k7-ut", obligation_id: "K-7/S", negative_id: "K-7/S/neg-1", proof_form: "UT", bid_id: B, hard_effect: "state", entrypoint: { kind: "ui-flow", ref: "ci" }, actor: { role: "ci" }, check: { cmd: ["node", "klassifikation.mjs"] } },
];
const MUTANTS = [
  { mutant_id: "m-navn", guard_ref: "g.navn", apply: "M_NAVN_OFF", restore: "M_NAVN_ON", target_case_id: "c-k1-ut", target_assertion_id: "negativ-afvist-bundet", controls: ["c-k1-fs"] },
  { mutant_id: "m-min", guard_ref: "g.min", apply: "M_TRG_OFF", restore: "M_TRG_ON", target_case_id: "c-k2-ut", target_assertion_id: "negativ-afvist-bundet", controls: ["c-k1-fs"] },
  { mutant_id: "m-klass", guard_ref: "g.klass", apply: "M_KLASS_OFF", restore: "M_KLASS_ON", target_case_id: "c-k7-ut", target_assertion_id: "exit-klasse", controls: ["c-k1-fs"] },
];
const ENGINE = await runBuildProofEngine({ manifest: MANIFEST, run_id: RUN, cases: CASES, mutants: MUTANTS }, mkRunner());
if (!ENGINE.allOk) { console.error("motoren gav ikke allOk — fixture er brudt:", JSON.stringify(ENGINE.summary), ENGINE.mutants.map((m) => m.detail)); process.exit(1); }
const clone = (v) => JSON.parse(JSON.stringify(v));
const greenProof = () => ({
  ok: true, gate_id: "build", proof_kind: "build-proof", artifact_oid: artifact.oid, bindings_oids: { plan: plan.oid, manifest: manifestRef.oid },
  run_id: RUN, engine: { run_id: RUN, store: "real", summary: clone(ENGINE.summary) },
  cases: clone(ENGINE.cases), mutants: clone(ENGINE.mutants),
  bids: [
    { bid_id: "bid-1", kind: "forudsaetning", depends_on: [], covers: [], angrebs_spec_oid: angrebsSpec.oid, angrebs_spec_path: "recon/angrebs-spec.json", base_oid: COMMIT },
    { bid_id: "bid-2", kind: "effekt", depends_on: ["bid-1"], covers: ["K-1/ac-1", "K-1/ac-3", "K-2/ac-6", "K-7/S"], angrebs_spec_oid: angrebsSpec.oid, angrebs_spec_path: "recon/angrebs-spec.json", base_oid: COMMIT },
  ],
  claim_graph: [{ k_id: "K-1", executed: true, mutant_killed: true, case_ids: ["c-k1-ut", "c-k1-mh"], mutant_ids: ["m-navn"], source_anchor: mkEvidence("supabase/migrations/0001.sql", 1, 2) }],
  async_reviews: [{ bid_id: "bid-1", conclusion: "PASS", base_oid: COMMIT }, { bid_id: "bid-2", conclusion: "PASS", base_oid: COMMIT }],
  prover_result: { ok: true, tests_run: 12, skipped: 0 },
});
const snap = (proof, manifest = manifestRef) => ({ commit_sha: COMMIT, artifact, bindings: { plan, manifest }, proof_result: proof, verdicts: [], approval: null, predecessor: { gate_id: "plan", conclusion: "success", artifact_oid: plan.oid, bindings_oids: { manifest: manifest.oid } } });
const verify = (p, s = snap(p)) => verifyBuildProof(p, s, { git });
const mutated = (f) => { const p = greenProof(); f(p); return p; };
const cas = (p, id) => p.cases.find((c) => c.case_id === id); const mut = (p, id) => p.mutants.find((m) => m.mutant_id === id);

console.log("verifyBuildProof v2.1 — grøn sti (bevis produceret af motoren):");
expectGreen("ægte v2.1-bevis: manifest som gate-binding · genudledte statusser/kills · komplethed · D10/D12", verify(greenProof()));

console.log("\nforventningen er gate-binding (F-1):");
expectRed("proof.manifest_ref til stede → rød (beviset vælger ikke sit manifest)", verify(mutated((p) => (p.manifest_ref = { path: "x", oid: manifestRef.oid }))), "manifest_ref er ikke en kilde");
expectRed("proof.ks til stede → rød", verify(mutated((p) => (p.ks = [{ k_id: "K-1" }]))), "ikke en kilde");
expectRed("snapshot uden manifest-binding → rød", verifyBuildProof(greenProof(), { ...snap(greenProof()), bindings: { plan } }, { git }), "manifest-binding mangler");
expectRed("manifest-binding stale (anden blob) → rød", verify(greenProof(), snap(greenProof(), { path: "plan-build/pakke-x/forventnings-manifest.json", oid: plan.oid, type: "blob" })), "matcher ikke stien");
expectRed("committet men UGYLDIGT manifest → rød", verify(greenProof(), snap(greenProof(), ref("plan-build/pakke-x/manifest-ugyldigt.json"))), "manifest ugyldigt");
expectRed("manifest afledt af en ANDEN plan → rød", verify(greenProof(), snap(greenProof(), ref("plan-build/pakke-x/manifest-anden-plan.json"))), "≠ gatens plan");
expectRed("engine.store mock → rød", verify(mutated((p) => (p.engine.store = "mock"))), 'engine.store ikke "real"');
expectRed("engine.summary håndskrevet (99 brud skjult som 0) → rød (F-3)", verify(mutated((p) => (p.engine.summary.opfyldt = 99))), "engine.summary ≠ genudledt");

console.log("\ncases — genudledt fra rå observationer (F-3/F-4/F-5), komplethed (F-2):");
expectRed("håndskrevet case uden observationer m. assertions ok:true → rød", verify(mutated((p) => { const c = cas(p, "c-k1-fs"); c.observations = {}; c.assertions = [{ id: "invented", ok: true }]; })), "observationer mangler|genudledt status");
expectRed("UT-observation viser FORBUDT TILLADT men status/assertions siger grøn → rød", verify(mutated((p) => { cas(p, "c-k1-ut").observations.negative = { ok: true, code: null, detail: null }; })), "genudledt status 'brudt'");
expectRed("assertions manipuleret (ok:false → true) uden observations-ændring → rød", verify(mutated((p) => { const c = cas(p, "c-k1-fs"); c.observations.observe.rows = [{ pris: 90 }]; })), "genudledt status 'brudt'");
expectRed("case-kontrakt lempet ift. manifestet (grund byttet til lokation_nedlagt) → rød (F-4)", verify(mutated((p) => { const c = cas(p, "c-k1-ut"); c.observations.kontrakt.grund = "lokation_nedlagt"; c.observations.negative.detail.message = "lokation_nedlagt"; })), "reject-kontrakt ≠ manifestets");
expectRed("case-kontrakt: aktør byttet → rød", verify(mutated((p) => { const c = cas(p, "c-k1-ut"); c.observations.kontrakt.aktoer = "postgres"; c.observations.aktoer = "postgres"; })), "reject-kontrakt ≠ manifestets");
expectRed("exit-kontrakt lempet (klasse ENOENT) → rød", verify(mutated((p) => { const c = cas(p, "c-k7-ut"); c.observations.kontrakt.klasse = "ENOENT"; c.observations.exit.klasse_observeret = "ENOENT"; })), "exit-kontrakt ≠ manifestets");
expectRed("observations-kald afvist (ok:false, rows:[]) → rød (F-5)", verify(mutated((p) => { const c = cas(p, "c-k1-fs"); c.observations.observe.ok = false; c.observations.observe.rows = []; })), "genudledt status 'protokol-fejl'");
expectRed("udeladt form (MH på K-1/ac-1) → udeladelse", verify(mutated((p) => (p.cases = p.cases.filter((c) => c.case_id !== "c-k1-mh")))), "ingen opfyldt MH-case");
expectRed("udeladt negativ (K-2/ac-6/neg-1's UT-case) → D11 rød", verify(mutated((p) => { p.cases = p.cases.filter((c) => c.case_id !== "c-k2-ut"); p.mutants = p.mutants.filter((m) => m.mutant_id !== "m-min"); })), "negativ 'K-2/ac-6/neg-1'");
expectRed("navngivet checkpoint 'hist' fjernet fra observationerne (checkpoints:[]) → rød (F-2)", verify(mutated((p) => { const c = cas(p, "c-k1-fs"); c.observations.checkpoints = []; c.assertions = c.assertions.filter((a) => !a.id.startsWith("checkpoint:")); })), "navngivet FS-delbevis 'hist'");
expectRed("navngivet vidne 'audit-row' fjernet → rød (F-2)", verify(mutated((p) => { const c = cas(p, "c-k1-mh"); c.observations.witnesses = [{ id: "andet", ok: true, rows: [{ id: 1 }], expect: { kind: "count", value: 1 } }]; c.assertions = c.assertions.map((a) => (a.id === "vidne:audit-row" ? { ...a, id: "vidne:andet" } : a)); })), "navngivet MH-delbevis 'audit-row'");
expectRed("SA race_id ≠ manifestets navngivne race → rød (F-2)", verify(mutated((p) => (cas(p, "c-k2-sa").observations.race_id = "r-andet"))), "navngivet SA-delbevis 'r1'");
expectRed("rogue forpligtelse → rød", verify(mutated((p) => p.cases.push({ ...clone(cas(p, "c-k1-fs")), case_id: "c-rogue", obligation_id: "K-9/ac-1" }))), "ikke forventet");
expectRed("case på overdraget forpligtelse → rød", verify(mutated((p) => p.cases.push({ ...clone(cas(p, "c-k1-fs")), case_id: "c-over", obligation_id: "K-2/ac-4" }))), "ikke forventet");
expectRed("negative_id på FS-case → rød (F-9)", verify(mutated((p) => (cas(p, "c-k1-fs").negative_id = "K-1/ac-1/neg-1"))), "negative_id på FS-case");
expectRed("case fra anden kørsel (run_id) → rød", verify(mutated((p) => (cas(p, "c-k1-fs").run_id = "gammel"))), "run_id ≠ kørslens");
expectRed("case hører til forudsætnings-bid → rød", verify(mutated((p) => (cas(p, "c-k1-fs").bid_id = "bid-1"))), "forudsætnings-bid");
expectRed("dublet case_id → rød", verify(mutated((p) => p.cases.push(clone(cas(p, "c-k1-fs"))))), "dublet case_id");

console.log("\nmutanter — genudledt kill (F-6/F-7), målrettet, D10 via UT (F-9), K-gulv:");
expectRed("killed:true men 'under' viser målet opfyldt → rød (håndskrevet kill)", verify(mutated((p) => { const m = mut(p, "m-navn"); m.under = clone(m.baseline); })), "genudledt kill fejler");
expectRed("killed:true men baselineOk falsk (baseline brudt) → rød", verify(mutated((p) => { const m = mut(p, "m-navn"); m.baseline = clone(m.under); })), "genudledt kill fejler|ikke genudledeligt");
expectRed("indlejret delresultat manipuleret (status opfyldt uden observations-belæg) → rød", verify(mutated((p) => { const m = mut(p, "m-navn"); m.under.status = "opfyldt"; })), "ikke genudledeligt");
expectRed("kontrol ødelagt under mutanten (controls_under brudt) → rød (F-6)", verify(mutated((p) => { const m = mut(p, "m-navn"); m.controls_under[0].observations.observe.rows = [{ pris: 90 }]; m.controls_under[0].status = "brudt"; m.controls_under[0].assertions = m.controls_under[0].assertions.map((a) => (a.id === "vaerdi-matcher-orakel" ? { ...a, ok: false, detail: "fik 90, forventet 100" } : a)); })), "genudledt kill fejler");
expectRed("restore efterlader kontrol ødelagt (clean.controls brudt) → rød (F-7)", verify(mutated((p) => { const m = mut(p, "m-navn"); const c = m.clean.controls[0]; c.observations.observe.rows = [{ pris: 90 }]; c.status = "brudt"; c.assertions = c.assertions.map((a) => (a.id === "vaerdi-matcher-orakel" ? { ...a, ok: false, detail: "fik 90, forventet 100" } : a)); })), "ikke ren efter");
expectRed("controls tomme → rød (≥1 nødvendig kontrol)", verify(mutated((p) => { const m = mut(p, "m-navn"); m.controls_baseline = []; m.controls_under = []; m.clean.controls = []; })), "≥1 nødvendig kontrol");
expectRed("target_assertion_id peger på en assertion der IKKE brød → rød (målrettet)", verify(mutated((p) => (mut(p, "m-navn").target_assertion_id = "tilstand-uaendret"))), "genudledt kill fejler");
expectRed("break_form ≠ målets form → rød", verify(mutated((p) => (mut(p, "m-navn").break_form = "FS"))), "kill-flag/break_form ≠ genudledt");
expectRed("guard_ref ikke deklareret → rød", verify(mutated((p) => (mut(p, "m-navn").guard_ref = "g.hemmelig"))), "ikke et deklareret værn");
expectRed("eneste-værn uden dræbt mutant → D10 rød", verify(mutated((p) => (p.mutants = p.mutants.filter((m) => m.mutant_id !== "m-navn")))), "D10: negativ 'K-1/ac-1/neg-1'");
expectRed("D10 via FS-case m. påsat negativ-ID → rød (F-9)", verify(mutated((p) => { const m = mut(p, "m-navn"); m.target_case_id = "c-k1-fs"; const t = cas(p, "c-k1-fs"); t.negative_id = "K-1/ac-1/neg-1"; })), "negative_id på FS-case|D10");
expectRed("K-7 uden dræbt mutant → gulv brudt", verify(mutated((p) => (p.mutants = p.mutants.filter((m) => m.mutant_id !== "m-klass")))), "K 'K-7' mangler");
expectRed("indlejret målresultat for en anden case → rød", verify(mutated((p) => { const m = mut(p, "m-navn"); m.under = clone(mut(p, "m-min").under); })), "anden case end target_case_id|ikke genudledeligt");

console.log("\nbids — D12 (F-10):");
expectRed("effekt-bid uden cases bærer en forudsætning → rød", verify(mutated((p) => { p.bids.push({ bid_id: "bid-3", kind: "effekt", depends_on: ["bid-1"], covers: ["K-1/ac-3"], angrebs_spec_oid: angrebsSpec.oid, angrebs_spec_path: "recon/angrebs-spec.json", base_oid: COMMIT }); p.bids[1].covers = p.bids[1].covers.filter((o) => o !== "K-1/ac-3"); p.async_reviews.push({ bid_id: "bid-3", conclusion: "PASS", base_oid: COMMIT }); })), "ingen opfyldt case for den|dækker ikke");
expectRed("manifestets effekt_bid (bid-2) ≠ det dækkende bid → rød", verify(mutated((p) => { p.bids[1].bid_id = "bid-9"; p.async_reviews[1].bid_id = "bid-9"; for (const c of p.cases) c.bid_id = "bid-9"; for (const m of p.mutants) for (const r of [m.baseline, m.under, m.clean.target, ...m.controls_baseline, ...m.controls_under, ...m.clean.controls]) r.bid_id = "bid-9"; })), "manifestet binder effekt_bid 'bid-2'");
expectRed("cyklisk afhængighed → rød", verify(mutated((p) => (p.bids[0].depends_on = ["bid-2"]))), "cyklisk");
expectRed("forudsætning ikke båret → rød", verify(mutated((p) => (p.bids[1].depends_on = []))), "intet effekt-bid afhænger af");
expectRed("covers udelader K-7/S → udeladelse", verify(mutated((p) => (p.bids[1].covers = p.bids[1].covers.filter((o) => o !== "K-7/S")))), "dækkes af intet effekt-bid");
expectRed("base_oid orphan → rød", verify(mutated((p) => { p.bids[1].base_oid = ORPHAN; p.async_reviews[1].base_oid = ORPHAN; })), "ikke en ancestor");

console.log("\nclaim_graph · reviews · prover:");
expectRed("claim_graph uden case_ids → rød", verify(mutated((p) => (p.claim_graph[0].case_ids = []))), "case_ids skal være");
expectRed("claim_graph case_id fra andet K → rød", verify(mutated((p) => (p.claim_graph[0].case_ids = ["c-k2-ut"]))), "case_ids skal være");
expectRed("claim_graph mutant_id ikke dræbt/ukendt → rød", verify(mutated((p) => (p.claim_graph[0].mutant_ids = ["m-x"]))), "mutant_ids skal være");
expectRed("source_anchor forkert excerpt → rød", verify(mutated((p) => (p.claim_graph[0].source_anchor.excerpt_sha = sha256("x")))), "ikke git-verificeret");
expectRed("manglende review → rød", verify(mutated((p) => (p.async_reviews = p.async_reviews.filter((r) => r.bid_id !== "bid-1")))), "mangler et PASS async-review");
expectRed("prover ikke grøn → rød", verify(mutated((p) => (p.prover_result.ok = false))), "prover ikke grøn");

console.log("\nfail-closed + e2e gennem evaluateGate (kæde-bundet manifest):");
expectRed("git-dep mangler", verifyBuildProof(greenProof(), snap(greenProof()), {}), "git-dep mangler");
{ const p = mutated((x) => delete cas(x, "c-k1-fs").hard_effect); Object.prototype.hard_effect = "db-row"; let r; try { r = verify(p); } finally { delete Object.prototype.hard_effect; } expectRed("arvet hard_effect fanges", r, "hard_effect"); }
{ const p = mutated((x) => Object.defineProperty(mut(x, "m-navn"), "killed", { enumerable: true, get: () => true })); expectRed("killed som getter → rød", verify(p), "kill-flag"); }
const route = makeProofVerifier({ git });
expectGreen("router → verifyBuildProof (grøn)", route(greenProof(), snap(greenProof())));
{ const r = evaluateGate("build", snap(greenProof()), { verifyProof: makeProofVerifier({ git }) }); r.open ? ok("build-gaten ÅBNER med ægte v2.1-bevis + kæde-bundet manifest") : bad("e2e-grøn", r.reasons.join(" | ")); }
{ const s = snap(greenProof()); s.predecessor = { ...s.predecessor, bindings_oids: { manifest: plan.oid } }; const r = evaluateGate("build", s, { verifyProof: makeProofVerifier({ git }) }); !r.open && r.reasons.some((x) => /matcher ikke forgængerens/.test(x)) ? ok("build-gaten LUKKER når manifestet ikke er det plan-gaten dømte (F-1, kerne)") : bad("e2e-manifest-kæde", r.open ? "ÅBNEDE" : r.reasons.join(" | ")); }
{ const r = evaluateGate("build", snap(mutated((p) => (p.cases = p.cases.filter((c) => c.case_id !== "c-k1-mh")))), { verifyProof: makeProofVerifier({ git }) }); !r.open ? ok("build-gaten LUKKER ved udeladt bevisform") : bad("e2e-udeladelse", "ÅBNEDE"); }
{ const r = evaluateGate("build", snap(mutated((p) => { mut(p, "m-navn").under = clone(mut(p, "m-navn").baseline); })), { verifyProof: makeProofVerifier({ git }) }); !r.open ? ok("build-gaten LUKKER ved håndskrevet kill") : bad("e2e-kill", "ÅBNEDE"); }

console.log("");
if (failed > 0) { console.error(`build-proof red-team: ${failed} FEJLEDE (${passed} ok)`); process.exit(1); }
console.log(`build-proof red-team: alle ${passed} cases passed`);
