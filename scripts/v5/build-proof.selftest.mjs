#!/usr/bin/env node
// build-proof.selftest.mjs — red-team af verifyBuildProof v2.5 (C1-r2 F-11..19 · C1-r3 F-20..27 · C1-r4 F-31 · vejnings-skæring 2026-09-15): manifest OG angrebs-spec er gate-bindinger;
// det grønne bevis produceres af motoren mod spec'en (konsistent by construction); hver plantet falsk-grøn → rød; e2e via evaluateGate.
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
import { runBuildProofEngine, judgeObservations } from "./build-harness.mjs";

const sha256 = (s) => createHash("sha256").update(s).digest("hex");
let failed = 0, passed = 0;
const ok = (n) => { passed++; console.log(`  ✓ ${n}`); };
const bad = (n, d) => { failed++; console.error(`  ✗ ${n} — ${d}`); };
const expectGreen = (n, r) => (r.ok === true ? ok(n) : bad(n, `rød: ${r.reasons.join(" | ").slice(0, 600)}`));
const expectRed = (n, r, needle) => { const hit = r.reasons.some((x) => new RegExp(needle).test(x)); !r.ok && hit ? ok(n) : bad(n, r.ok ? "GRØN (falsk-grøn slap igennem)" : `rød men uden '${needle}': ${r.reasons.join(" | ").slice(0, 400)}`); };

// ---------- fixture-repo: filer → manifest → angrebs-spec (3 commits) ----------
const ROOT = mkdtempSync(join(tmpdir(), "v5-buildproof-")); process.on("exit", () => rmSync(ROOT, { recursive: true, force: true }));
execFileSync("git", ["init", "-q", ROOT]); const git = makeGit(ROOT); git("config", "user.name", "selftest"); git("config", "user.email", "selftest@local");
const put = (p, c) => { mkdirSync(join(ROOT, dirname(p)), { recursive: true }); writeFileSync(join(ROOT, p), c); };
put("plan/plan.md", "# plan — pakke-x\n\nbid-1 (forudsætning) · bid-2 (effekt) realiserer K-1, K-2, K-7.\n"); put("plan/plan-anden.md", "# anden plan\n");
put("build/build-proof.json", JSON.stringify({ note: "artefakt-placeholder" }) + "\n"); put("plan-build/pakke-x/forventningsliste.md", "# liste (LÅST)\n"); put("docs/krav.md", "# krav\n");
put("supabase/migrations/0001.sql", "create or replace function f.lokation_opret(p_id int, p_navn text) returns int language plpgsql security definer as $$ begin if p_navn is null or btrim(p_navn) = '' then raise exception using errcode = '22023', message = 'navn_blank'; end if; insert into f.lokation values (p_id, p_navn); return p_id; end $$;\n" + "create or replace function f.stand_deaktiver(p_stand int) returns void language plpgsql security definer as $$ begin perform 1 from f.lokation for update; update f.stand set aktiv = false where id = p_stand; if not exists (select 1 from f.stand where aktiv) then raise exception using errcode = 'P0001', message = 'min_en_stand'; end if; end $$;\n" + "-- create or replace function f.lokation_opret(p_id int, p_navn text) — KOMMENTAR, ingen implementering (F-31-lokkemad)\n" + "alter table salg enable row level security;\n");
git("add", "-A"); git("commit", "-qm", "filer"); const C0 = git("rev-parse", "HEAD"); const oidAt = (p, c = C0) => resolveRef(git, c, p).oid;
const rc = (sqlstate, sted, grund, fase = "wrapper", aktoer = "app_role") => ({ kanal: "sqlstate", sqlstate, grund, afvisningssted: sted, fase, aktoer, observationskanal: "sqlstate", offentlig_signatur: "f(text)" });
const MANIFEST = { schema_version: 1, pakke: "pakke-x",
  bindings: { forventningsliste: { path: "plan-build/pakke-x/forventningsliste.md", oid: oidAt("plan-build/pakke-x/forventningsliste.md") }, krav: { path: "docs/krav.md", oid: oidAt("docs/krav.md") }, plan: { path: "plan/plan.md", oid: oidAt("plan/plan.md") } },
  guards: [{ id: "g.navn", beskrivelse: "navn", locus: { path: "supabase/migrations/0001.sql", pattern: "^\\s*create (or replace )?function f\\.lokation_opret\\(" } }, { id: "g.min", beskrivelse: "min", locus: { path: "supabase/migrations/0001.sql", pattern: "^\\s*create (or replace )?function f\\.stand_deaktiver\\(" } }, { id: "g.klass", beskrivelse: "klass" }, { id: "g.laas", beskrivelse: "række-lås (SA-overlap)" }, { id: "g.api", beskrivelse: "execute-grant til authenticated (API-eksponering)" }],
  obligations: [
    { id: "K-1/ac-1", k_id: "K-1", kind: "ac", proof_forms: ["UT", "MH"], scope: "nu", effekt_bid: "bid-2", kildeankre: ["K:1"], assertions: [{ id: "audit-row", form: "MH" }], negatives: [{ id: "K-1/ac-1/neg-1", beskrivelse: "blank", reject_contract: rc("22023", "f.lokation_opret", "navn_blank"), sole_guard_ref: "g.navn" }] },
    { id: "K-1/ac-3", k_id: "K-1", kind: "ac", proof_forms: ["FS"], scope: "nu", kildeankre: ["K:3"], assertions: [{ id: "hist", form: "FS" }], negatives: [] },
    { id: "K-2/ac-6", k_id: "K-2", kind: "ac", proof_forms: ["SA", "UT"], scope: "nu", kildeankre: ["K:6"], assertions: [{ id: "r1", form: "SA" }], negatives: [{ id: "K-2/ac-6/neg-1", beskrivelse: "sidste", reject_contract: rc("P0001", "f.stand_deaktiver", "min_en_stand", "apply"), sole_guard_ref: "g.min" }] },
    { id: "K-7/S", k_id: "K-7", kind: "struktur", proof_forms: ["UT"], scope: "nu", kildeankre: ["K:7"], negatives: [{ id: "K-7/S/neg-1", beskrivelse: "ci", reject_contract: { kanal: "exit", exit_code: 1, klasse: "klassifikation", afvisningssted: "ci", fase: "ci", aktoer: "ci" } }] },
    // H1/H2 (2026-09-21): API-forpligtelse + {id}-grund
    { id: "K-9/ac-1", k_id: "K-9", kind: "ac", proof_forms: ["UT", "MH"], scope: "nu", kildeankre: ["K:170"], assertions: [{ id: "w5-via-api", form: "MH" }], negatives: [{ id: "K-9/ac-1/neg-1", beskrivelse: "R− via API", reject_contract: rc("42501", "f.lokation_opret", "lokation_opret: permission_denied", "wrapper (via API)", "authenticated"), sole_guard_ref: "g.api" }] },
    { id: "K-7/ac-2", k_id: "K-7", kind: "ac", proof_forms: ["UT"], scope: "nu", kildeankre: ["K:140"], negatives: [{ id: "K-7/ac-2/neg-2", beskrivelse: "allerede anonymized", reject_contract: rc("22023", "f.anonymiser", "entity {id} af type gruppe_kontakt findes ikke eller er allerede anonymized", "apply") }] },
  ] };
put("plan-build/pakke-x/forventnings-manifest.json", JSON.stringify(MANIFEST, null, 1) + "\n"); put("plan-build/pakke-x/manifest-ugyldigt.json", JSON.stringify({ ...MANIFEST, obligations: [] }) + "\n");
git("add", "-A"); git("commit", "-qm", "manifest"); const C1 = git("rev-parse", "HEAD"); const MOID = oidAt("plan-build/pakke-x/forventnings-manifest.json", C1);
const EP = { kind: "rpc", ref: "lokation_opret" }; const ACT = { role: "app_role" }; const B = "bid-2"; const HE = "db-row";
const SPEC = { schema_version: 1, pakke: "pakke-x", bindings: { manifest: { path: "plan-build/pakke-x/forventnings-manifest.json", oid: MOID }, plan: { path: "plan/plan.md", oid: oidAt("plan/plan.md") } },
  bids: [{ bid_id: "bid-1", kind: "forudsaetning", depends_on: [], covers: [] }, { bid_id: "bid-2", kind: "effekt", depends_on: ["bid-1"], covers: ["K-1/ac-1", "K-1/ac-3", "K-2/ac-6", "K-7/S", "K-9/ac-1", "K-7/ac-2"] }],
  cases: [
    { case_id: "c-k1-ut", obligation_id: "K-1/ac-1", negative_id: "K-1/ac-1/neg-1", proof_form: "UT", fase: "wrapper", bid_id: B, hard_effect: HE, entrypoint: EP, actor: ACT, setup: { sql: "SETUP" }, positive: { sql: "POS" }, negative: { sql: "NEG" }, state: { sql: "STATE" } },
    { case_id: "c-k1-mh", obligation_id: "K-1/ac-1", proof_form: "MH", bid_id: B, hard_effect: HE, entrypoint: EP, actor: ACT, action: { sql: "ACT_MH" }, witnesses: [{ id: "audit-row", observe: { sql: "AUDIT" }, expect: { kind: "count", value: 1 } }] },
    { case_id: "c-k1-fs", obligation_id: "K-1/ac-3", proof_form: "FS", bid_id: B, hard_effect: "state", entrypoint: EP, actor: ACT, action: { sql: "ACT" }, observe: { sql: "OBS" }, expect: { kind: "scalar", value: 100 }, checkpoints: [{ id: "hist", observe: { sql: "OBS_HIST" }, expect: { kind: "scalar", value: 80 } }] },
    { case_id: "c-k2-sa", obligation_id: "K-2/ac-6", proof_form: "SA", fase: "apply", bid_id: B, hard_effect: HE, entrypoint: EP, actor: ACT, race: { race_id: "r1", a: { sql: "A" }, b: { sql: "B" }, barrier: "row-lock", invariant: { observe: { sql: "INV" }, expect: { kind: "scalar", value: 1 } }, reject_negative_id: "K-2/ac-6/neg-1" } },
    { case_id: "c-k2-ut", obligation_id: "K-2/ac-6", negative_id: "K-2/ac-6/neg-1", proof_form: "UT", fase: "apply", bid_id: B, hard_effect: HE, entrypoint: EP, actor: ACT, positive: { sql: "POS2" }, negative: { sql: "NEG2" }, state: { sql: "STATE2" } },
    { case_id: "c-k7-ut", obligation_id: "K-7/S", negative_id: "K-7/S/neg-1", proof_form: "UT", fase: "ci", bid_id: B, hard_effect: "state", entrypoint: { kind: "ui-flow", ref: "ci" }, actor: { role: "ci" }, check: { cmd: ["node", "klassifikation.mjs"] } },
    { case_id: "c-k9-ut", obligation_id: "K-9/ac-1", negative_id: "K-9/ac-1/neg-1", proof_form: "UT", fase: "wrapper (via API)", bid_id: B, hard_effect: HE, entrypoint: { kind: "api", ref: "/rpc/lokation_opret" }, actor: { role: "authenticated", settings: { "request.jwt.claim.sub": "22222222-2222-2222-2222-222222222222" } }, positive: { http: { method: "POST", path: "/rpc/lokation_opret", body: { p_navn: "A" } } }, negative: { http: { method: "POST", path: "/rpc/lokation_opret", body: { p_navn: "R-" } } }, state: { sql: "STATE" } },
    { case_id: "c-k9-mh", obligation_id: "K-9/ac-1", proof_form: "MH", bid_id: B, hard_effect: HE, entrypoint: { kind: "api", ref: "/rpc/lokation_opret" }, actor: { role: "authenticated" }, action: { http: { method: "POST", path: "/rpc/lokation_opret", body: { p_navn: "B" } } }, witnesses: [{ id: "w5-via-api", observe: { sql: "AUDIT" }, expect: { kind: "count", value: 1 } }] },
    { case_id: "c-k7ac2-ut", obligation_id: "K-7/ac-2", negative_id: "K-7/ac-2/neg-2", proof_form: "UT", fase: "apply", bid_id: B, hard_effect: HE, entrypoint: EP, actor: ACT, subst: { id: "11111111-1111-1111-1111-111111111111" }, positive: { sql: "POS" }, negative: { sql: "NEG_ID" }, state: { sql: "STATE" } },
  ],
  mutants: [
    { mutant_id: "m-navn", guard_ref: "g.navn", target_case_id: "c-k1-ut", target_assertion_id: "negativ-afvist-bundet", controls: ["c-k1-fs"], apply: "M_NAVN_OFF", restore: "M_NAVN_ON", footprint: { observe: { sql: "FP" } } },
    { mutant_id: "m-min", guard_ref: "g.min", target_case_id: "c-k2-ut", target_assertion_id: "negativ-afvist-bundet", controls: ["c-k1-fs"], apply: "M_TRG_OFF", restore: "M_TRG_ON", footprint: { observe: { sql: "FP" } } },
    { mutant_id: "m-klass", guard_ref: "g.klass", target_case_id: "c-k7-ut", target_assertion_id: "exit-klasse", controls: ["c-k1-fs"], apply: "M_KLASS_OFF", restore: "M_KLASS_ON", footprint: { observe: { sql: "FP" } } },
    { mutant_id: "m-laas", guard_ref: "g.laas", target_case_id: "c-k2-sa", target_assertion_id: "invariant-efter-commit", controls: ["c-k1-fs"], apply: "M_LAAS_OFF", restore: "M_LAAS_ON", footprint: { observe: { sql: "FP" } } },
    { mutant_id: "m-api", guard_ref: "g.api", target_case_id: "c-k9-ut", target_assertion_id: "negativ-afvist-bundet", controls: ["c-k1-fs"], apply: "M_API_OFF", restore: "M_API_ON", footprint: { observe: { sql: "FP" } } },
  ] };
put("plan-build/pakke-x/angrebs-spec.json", JSON.stringify(SPEC, null, 1) + "\n");
const SPEC_UDEN_BID1 = { ...SPEC, bids: [{ bid_id: "bid-2", kind: "effekt", depends_on: [], covers: SPEC.bids[1].covers }] }; put("plan-build/pakke-x/angrebs-spec-uden-bid1.json", JSON.stringify(SPEC_UDEN_BID1, null, 1) + "\n");
put("plan-build/pakke-x/angrebs-spec-andet-manifest.json", JSON.stringify({ ...SPEC, bindings: { ...SPEC.bindings, manifest: { path: "plan-build/pakke-x/manifest-ugyldigt.json", oid: oidAt("plan-build/pakke-x/manifest-ugyldigt.json", C1) } } }, null, 1) + "\n");
git("add", "-A"); git("commit", "-qm", "angrebs-spec"); const COMMIT = git("rev-parse", "HEAD"); const ref = (p) => resolveRef(git, COMMIT, p);
const plan = ref("plan/plan.md"); const artifact = ref("build/build-proof.json"); const manifestRef = ref("plan-build/pakke-x/forventnings-manifest.json"); const specRef = ref("plan-build/pakke-x/angrebs-spec.json");
const ORPHAN = git("commit-tree", `${COMMIT}^{tree}`, "-m", "orphan");
const mkEvidence = (path, start, end) => { const r = resolveRef(git, COMMIT, path); const excerpt = excerptAt(readBlobLines(git, r.oid).lines, [start, end]); return { commit_sha: COMMIT, path, blob_oid: r.oid, line_span: [start, end], excerpt_sha: sha256(excerpt) }; };

// ---------- grønt bevis produceres af motoren mod spec'en ----------
const RUN = "run-2026-09-10T22";
const R = (ok, code = null, message = null, routine = null, rows) => ({ ok, error: ok ? null : message, code, detail: ok ? null : { message, routine }, ...(rows !== undefined ? { rows } : {}) });
function mkRunner() {
  const st = { navn: true, pris: 100, audit: true, trg: true, klass: true, laas: true, apiPerm: true };
  return { st,
    sql(t) { switch (t) {
      case "SETUP": return R(true); case "POS": return R(true); case "NEG": return st.navn ? R(false, "22023", "navn_blank", "f.lokation_opret") : R(true); case "STATE": return R(true, null, null, null, [{ n: 1 }]);
      case "ACT": return R(true); case "OBS": return R(true, null, null, null, [{ pris: st.pris }]); case "OBS_HIST": return R(true, null, null, null, [{ pris: 80 }]);
      case "ACT_MH": return R(true); case "AUDIT": return R(true, null, null, null, st.audit ? [{ id: 1 }] : []);
      case "POS2": return R(true); case "NEG2": return st.trg ? R(false, "P0001", "min_en_stand", "f.stand_deaktiver") : R(true); case "STATE2": return R(true, null, null, null, [{ aktive: 1 }]);
      case "FP": return R(true, null, null, null, [{ navn: st.navn, trg: st.trg, klass: st.klass, laas: st.laas, apiPerm: st.apiPerm }]);
      case "M_LAAS_OFF": st.laas = false; return R(true); case "M_LAAS_ON": st.laas = true; return R(true);
      case "M_API_OFF": st.apiPerm = false; return R(true); case "M_API_ON": st.apiPerm = true; return R(true);
      case "NEG_ID": return R(false, "22023", "entity 11111111-1111-1111-1111-111111111111 af type gruppe_kontakt findes ikke eller er allerede anonymized", "f.anonymiser");
      case "M_NAVN_OFF": st.navn = false; return R(true); case "M_NAVN_ON": st.navn = true; return R(true); case "M_TRG_OFF": st.trg = false; return R(true); case "M_TRG_ON": st.trg = true; return R(true);
      case "M_KLASS_OFF": st.klass = false; return R(true); case "M_KLASS_ON": st.klass = true; return R(true);
      default: return R(false, "42601", "ukendt " + t, null); } },
    race() { const a = { pid: 11, ok: true, code: null, detail: null, commit: "commit" }; const overlap = { observed: true, witness_pid: 13, a_pid: 11, b_pid: 12 }; return st.trg && st.laas ? { protocolOk: true, a, b: { pid: 12, ok: false, code: "P0001", detail: { message: "min_en_stand", routine: "f.stand_deaktiver" }, commit: "rollback" }, overlap, invariantRows: [{ aktive: 1 }] } : { protocolOk: true, a, b: { pid: 12, ok: true, code: null, detail: null, commit: "commit" }, overlap, invariantRows: [{ aktive: 0 }] }; },
    exec() { return st.klass ? { exit_code: 1, stdout: "klasse=klassifikation\n" } : { exit_code: 0, stdout: "" }; },
    http(req) { if (req.body?.p_navn === "R-") return st.apiPerm ? { ok: false, error: "42501", code: "42501", detail: { message: "lokation_opret: permission_denied", routine: null }, http_status: 403 } : { ok: true, error: null, code: null, detail: null, http_status: 200 }; return { ok: true, error: null, code: null, detail: null, http_status: 200 }; },
  };
}
const ENGINE = await runBuildProofEngine({ manifest: MANIFEST, run_id: RUN, angrebsSpec: SPEC }, mkRunner());
if (!ENGINE.allOk) { console.error("motoren gav ikke allOk — fixture er brudt:", JSON.stringify(ENGINE.summary), ENGINE.mutants.map((m) => m.detail), ENGINE.cases.filter((c) => c.status !== "opfyldt").map((c) => c.case_id + ":" + JSON.stringify(c.assertions))); process.exit(1); }
const clone = (v) => JSON.parse(JSON.stringify(v));
const ALL_IDS = [...SPEC.cases.map((c) => c.case_id), ...SPEC.mutants.map((m) => m.mutant_id)];
const greenProof = () => ({
  ok: true, gate_id: "build", proof_kind: "build-proof", artifact_oid: artifact.oid, bindings_oids: { plan: plan.oid, manifest: manifestRef.oid, angrebsspec: specRef.oid },
  run_id: RUN, engine: { run_id: RUN, store: "real", summary: clone(ENGINE.summary) }, cases: clone(ENGINE.cases), mutants: clone(ENGINE.mutants),
  bid_bindings: [{ bid_id: "bid-1", base_oid: COMMIT }, { bid_id: "bid-2", base_oid: COMMIT }],
  claim_graph: [{ k_id: "K-1", guard_ref: "g.navn", executed: true, mutant_killed: true, case_ids: ["c-k1-ut", "c-k1-mh"], mutant_ids: ["m-navn"], source_anchor: mkEvidence("supabase/migrations/0001.sql", 1, 1) }],
  async_reviews: [{ bid_id: "bid-1", conclusion: "PASS", base_oid: COMMIT }, { bid_id: "bid-2", conclusion: "PASS", base_oid: COMMIT }],
  prover_result: { ok: true, total: ALL_IDS.length, passed: ALL_IDS.length, failed: 0, skipped: 0, executed_ids: [...ALL_IDS] },
});
const snap = (proof, manifest = manifestRef, spec = specRef) => ({ commit_sha: COMMIT, artifact, bindings: { plan, manifest, angrebsspec: spec }, proof_result: proof, verdicts: [], approval: null, predecessor: { gate_id: "plan", conclusion: "success", artifact_oid: plan.oid, bindings_oids: { manifest: manifest.oid } } });
const verify = (p, s = snap(p)) => verifyBuildProof(p, s, { git });
const mutated = (f) => { const p = greenProof(); f(p); return p; };
const cas = (p, id) => p.cases.find((c) => c.case_id === id); const mut = (p, id) => p.mutants.find((m) => m.mutant_id === id);

console.log("verifyBuildProof v2.3 — grøn sti (bevis produceret af motoren mod den gate-bundne spec):");
expectGreen("ægte v2.3-bevis → grøn", verify(greenProof()));
const rejudge = (r) => { const j = judgeObservations(r.proof_form, r.observations); r.status = j.status; r.assertions = j.assertions; };   // selvrapport konsistent med den manipulerede observation — verifieren skal stadig fange det via spec-projektion/kill

console.log("\nmåle-spec + manifest er gate-bindinger (F-1/F-13/F-18):");
expectRed("snapshot uden angrebsspec-binding → rød", verifyBuildProof(greenProof(), { ...snap(greenProof()), bindings: { plan, manifest: manifestRef } }, { git }), "angrebsspec-binding mangler");
expectRed("angrebs-spec skrevet mod et andet manifest → rød", verify(greenProof(), snap(greenProof(), manifestRef, ref("plan-build/pakke-x/angrebs-spec-andet-manifest.json"))), "andet manifest|ugyldig/ukomplet");
expectRed("angrebs-spec uden forudsætnings-bid: proof bærer bid-1 → rød (proof ≠ spec)", verify(greenProof(), snap(greenProof(), manifestRef, ref("plan-build/pakke-x/angrebs-spec-uden-bid1.json"))), "ikke et bid i spec'en");
expectRed("proof.bids (egen graf) → rød (ikke en kilde)", verify(mutated((p) => (p.bids = []))), "ikke en kilde");
expectRed("proof.manifest_ref → rød", verify(mutated((p) => (p.manifest_ref = { path: "x", oid: manifestRef.oid }))), "ikke en kilde");
expectRed("bid fra spec'en udeladt i bid_bindings → rød (F-18)", verify(mutated((p) => (p.bid_bindings = p.bid_bindings.filter((b) => b.bid_id !== "bid-1")))), "mangler i proofen");
expectRed("engine.summary håndskrevet → rød", verify(mutated((p) => (p.engine.summary.opfyldt = 99))), "engine.summary ≠ genudledt");

console.log("\ncases — spec-afledte felter og genudledning (F-11/F-13/F-14):");
expectRed("orakel ændret i observationerne (expect 100 → 90 m. rows 90) → rød (F-13)", verify(mutated((p) => { const c = cas(p, "c-k1-fs"); c.observations.expect = { kind: "scalar", value: 90 }; c.observations.observe.rows = [{ pris: 90 }]; })), "spec-afledte felter");
expectRed("vidne ændret til forventet fravær (expect empty, rows []) → rød (F-13)", verify(mutated((p) => { const c = cas(p, "c-k1-mh"); c.observations.witnesses[0].expect = { kind: "empty" }; c.observations.witnesses[0].rows = []; })), "spec-afledte felter");
expectRed("kontrakt-grund lempet i observationerne → rød (F-4)", verify(mutated((p) => { const c = cas(p, "c-k1-ut"); c.observations.kontrakt.grund = "lokation_nedlagt"; c.observations.negative.detail.message = "lokation_nedlagt"; })), "spec-afledte felter");
expectRed("SQL-negativ erstattet af exit-resultat → rød (F-11)", verify(mutated((p) => { const c = cas(p, "c-k1-ut"); const o = c.observations; o.kontrakt = { ...o.kontrakt, kanal: "exit", exit_code: 1, klasse: "x" }; o.exit = { exit_code: 1, klasse_observeret: "x" }; delete o.positive; delete o.negative; delete o.state_before; delete o.state_after; })), "spec-afledte felter|blandet");
expectRed("fase i observationerne ≠ kontraktens → rød (F-14)", verify(mutated((p) => (cas(p, "c-k1-ut").observations.fase = "apply"))), "spec-afledte felter|genudledt");
expectRed("actor_role ≠ spec'ens → rød (F-14)", verify(mutated((p) => { const c = cas(p, "c-k1-ut"); c.actor_role = "postgres"; })), "actor_role");
expectRed("SA-observationer uden aktør → rød (F-14)", verify(mutated((p) => delete cas(p, "c-k2-sa").observations.aktoer)), "spec-afledte felter|genudledt");
expectRed("forbudt tilladt i observationerne, status grøn → rød", verify(mutated((p) => (cas(p, "c-k1-ut").observations.negative = { ok: true, code: null, detail: null }))), "≠ genudledt \\(brudt\\)");
expectRed("observations-kald afvist → rød (F-5)", verify(mutated((p) => { const c = cas(p, "c-k1-fs"); c.observations.observe.ok = false; })), "≠ genudledt \\(protokol-fejl\\)");
expectRed("case fra spec'en udeladt → rød", verify(mutated((p) => (p.cases = p.cases.filter((c) => c.case_id !== "c-k1-mh")))), "intet delbevis");
expectRed("rogue case → rød", verify(mutated((p) => p.cases.push({ ...clone(cas(p, "c-k1-fs")), case_id: "c-rogue" }))), "findes ikke i spec'en");
expectRed("case-identitet ommærket (obligation) → rød", verify(mutated((p) => (cas(p, "c-k1-fs").obligation_id = "K-1/ac-1"))), "≠ spec'ens");
expectRed("case fra anden kørsel → rød", verify(mutated((p) => (cas(p, "c-k1-fs").run_id = "gammel"))), "run_id ≠");
expectRed("dublet case-resultat → rød", verify(mutated((p) => p.cases.push(clone(cas(p, "c-k1-fs"))))), "dublet case-resultat");

console.log("\nmutanter — bundne indlejrede resultater, spec'ens kontroller, footprint (F-12/F-15/F-16):");
expectRed("indlejrede resultater fra anden kørsel (run_id OLD) → rød (F-12)", verify(mutated((p) => { const m = mut(p, "m-navn"); for (const r of [m.baseline, m.under, m.clean.target, ...m.controls_baseline, ...m.controls_under, ...m.clean.controls]) r.run_id = "OLD"; })), "run_id ≠");
expectRed("under-resultat fra en anden case (ommærket) → rød (F-12)", verify(mutated((p) => { const m = mut(p, "m-navn"); m.under = { ...clone(mut(p, "m-min").under), case_id: "c-k1-ut" }; })), "≠ spec'ens|spec-afledte");
expectRed("under erstattet m. FS-brud fra anden case (formskift) → rød (F-12)", verify(mutated((p) => { const m = mut(p, "m-navn"); m.under = clone(mut(p, "m-min").under); })), "case_id ≠|≠ spec'ens");
expectRed("break_form ≠ judgeKill's → rød", verify(mutated((p) => (mut(p, "m-navn").break_form = "FS"))), "kill-flag/break_form ≠ genudledt");
expectRed("kontrolmængde skiftet i én fase (FS-kontrol → MH-kontrol under mutant) → rød (F-16)", verify(mutated((p) => { const m = mut(p, "m-navn"); m.controls_under = [clone(cas(p, "c-k1-mh"))]; })), "≠ spec'ens kontroller");
expectRed("kontrol-resultat efter restore manipuleret (checkpoint fjernet) → rød (F-16)", verify(mutated((p) => { const m = mut(p, "m-navn"); const c = m.clean.controls[0]; c.observations.checkpoints = []; c.assertions = c.assertions.filter((a) => !a.id.startsWith("checkpoint:")); })), "spec-afledte felter|genudledt");
expectRed("footprint uændret under mutant (ingen attesteret mutation) → rød (F-13)", verify(mutated((p) => { const m = mut(p, "m-navn"); m.footprint_under = clone(m.footprint_baseline); })), "genudledt kill fejler");
expectRed("footprint ikke gendannet (restore uden effekt) → rød (F-16)", verify(mutated((p) => { const m = mut(p, "m-navn"); m.footprint_restored = clone(m.footprint_under); })), "restore ikke attesteret|genudledt kill fejler");
expectRed("killed:true men under viser målet opfyldt → rød", verify(mutated((p) => { const m = mut(p, "m-navn"); m.under = clone(m.baseline); })), "genudledt kill fejler");
expectRed("mutant fra spec'en udeladt → rød", verify(mutated((p) => (p.mutants = p.mutants.filter((m) => m.mutant_id !== "m-klass")))), "intet resultat");
expectRed("rogue mutant → rød", verify(mutated((p) => p.mutants.push({ ...clone(mut(p, "m-navn")), mutant_id: "m-x" }))), "findes ikke i spec'en");
expectRed("mutantens target_assertion_id ≠ spec'ens → rød", verify(mutated((p) => (mut(p, "m-navn").target_assertion_id = "tilstand-uaendret"))), "≠ spec'ens");

console.log("\nF-20..24 — foreskrevet forløb, footprint-gyldighed, SA-forløb, exit-crash, fase/aktør:");
expectRed("FS: observations.action UDELADT (spec foreskriver handling) m. konsistent selvrapport → rød (F-20)", verify(mutated((p) => { const c = cas(p, "c-k1-fs"); delete c.observations.action; rejudge(c); })), "spec-afledte felter");
expectRed("FS: action {ok:false} m. konsistent selvrapport (brudt) → rød (F-20)", verify(mutated((p) => { const c = cas(p, "c-k1-fs"); c.observations.action = { ok: false, code: "42501", detail: { message: "denied", routine: null } }; rejudge(c); })), "≠ opfyldt");
expectRed("UT: setup-observation UDELADT (spec foreskriver setup) → rød (F-20)", verify(mutated((p) => { const c = cas(p, "c-k1-ut"); delete c.observations.setup; rejudge(c); })), "spec-afledte felter");
expectRed("UT: setup {ok:false} m. konsistent selvrapport (protokol) → rød (F-20)", verify(mutated((p) => { const c = cas(p, "c-k1-ut"); c.observations.setup = { ok: false }; rejudge(c); })), "≠ opfyldt|spec-afledte");
expectRed("indlejret kontrol (clean) uden action m. konsistent selvrapport → rød (F-20)", verify(mutated((p) => { const m = mut(p, "m-navn"); const c = m.clean.controls[0]; delete c.observations.action; rejudge(c); })), "spec-afledte felter");
expectRed("indlejret baseline uden setup m. konsistent selvrapport → rød (F-20)", verify(mutated((p) => { const m = mut(p, "m-navn"); delete m.baseline.observations.setup; rejudge(m.baseline); })), "spec-afledte felter");
expectRed("footprint_under = null (fejlet ejer-kald under mutanten) → rød (F-21)", verify(mutated((p) => (mut(p, "m-navn").footprint_under = null))), "genudledt kill fejler");
expectRed("footprint_under = {error} → rød (F-21)", verify(mutated((p) => (mut(p, "m-navn").footprint_under = { error: "query failed" }))), "genudledt kill fejler");
expectRed("footprint_restored = null → rød (F-21)", verify(mutated((p) => (mut(p, "m-navn").footprint_restored = null))), "restore ikke attesteret|genudledt kill fejler");
expectRed("SA-mutant: under mutanten intet overlap observeret (konsistent selvrapport brudt) → rød (F-22)", verify(mutated((p) => { const m = mut(p, "m-laas"); m.under.observations.overlap.observed = false; rejudge(m.under); })), "genudledt kill fejler");
expectRed("SA-mutant: samme pid for A og B under mutanten → rød (F-22)", verify(mutated((p) => { const m = mut(p, "m-laas"); const o = m.under.observations; o.b.pid = o.a.pid; o.overlap.b_pid = o.a.pid; rejudge(m.under); })), "genudledt kill fejler");
expectRed("SA-mutant: A ok m. commit:'rollback' under mutanten → rød (F-22)", verify(mutated((p) => { const m = mut(p, "m-laas"); m.under.observations.a.commit = "rollback"; rejudge(m.under); })), "genudledt kill fejler");
expectRed("SA-mutant: B afvist m. forkert grund + invariant brudt → rød (F-22)", verify(mutated((p) => { const m = mut(p, "m-laas"); m.under.observations.b = { pid: 12, ok: false, code: "P0001", detail: { message: "andet", routine: "f.stand_deaktiver" }, commit: "rollback" }; rejudge(m.under); })), "genudledt kill fejler");
expectRed("SA: overlap.observed slettet fra observationerne (protokol) → rød (F-22)", verify(mutated((p) => { const c = cas(p, "c-k2-sa"); delete c.observations.overlap.observed; rejudge(c); })), "≠ opfyldt");
expectRed("exit-mutant: under mutanten crash m. rc 1 UDEN klasse-linje (konsistent selvrapport protokol) → rød, ikke kill (F-23)", verify(mutated((p) => { const m = mut(p, "m-klass"); m.under.observations.exit = { exit_code: 1, klasse_observeret: null }; rejudge(m.under); })), "genudledt kill fejler");
expectRed("exit-case: topniveau rc 1 m. ANDEN klasse (protokol) → rød (F-23)", verify(mutated((p) => { const c = cas(p, "c-k7-ut"); c.observations.exit = { exit_code: 1, klasse_observeret: "ENOENT" }; rejudge(c); })), "≠ opfyldt");
expectRed("SA: fase i observationerne ≠ kontraktens (wrapper ≠ apply) → rød (F-24)", verify(mutated((p) => { const c = cas(p, "c-k2-sa"); c.observations.fase = "wrapper"; rejudge(c); })), "spec-afledte felter|≠ opfyldt");
expectRed("SA: kontrakt.fase slettet i observationerne → rød (F-24)", verify(mutated((p) => { const c = cas(p, "c-k2-sa"); delete c.observations.kontrakt.fase; rejudge(c); })), "spec-afledte felter|≠ opfyldt");
expectRed("exit-case: fase i observationerne ≠ kontraktens → rød (F-24)", verify(mutated((p) => { const c = cas(p, "c-k7-ut"); c.observations.fase = "wrapper"; rejudge(c); })), "spec-afledte felter|≠ opfyldt");
expectRed("exit-case: aktør i observationerne ≠ kontraktens (postgres) → rød (F-24)", verify(mutated((p) => { const c = cas(p, "c-k7-ut"); c.observations.aktoer = "postgres"; rejudge(c); })), "spec-afledte felter|≠ opfyldt");

console.log("\nH1/H2 — via og subst er spec-afledte (producenten kan ikke skifte transport eller substitution):");
expectRed("API-case m. via ændret til 'sql' i observationerne (og http_status fjernet) → rød (spec-projektion)", verify(mutated((p) => { const c = cas(p, "c-k9-ut"); c.observations.via = "sql"; delete c.observations.positive.http_status; delete c.observations.negative.http_status; rejudge(c); })), "spec-afledte felter");
expectRed("SQL-case m. via ændret til 'api' (så sted-tjekket springes over) → rød", verify(mutated((p) => { const c = cas(p, "c-k1-ut"); c.observations.via = "api"; c.observations.positive.http_status = 200; c.observations.negative.http_status = 400; rejudge(c); })), "spec-afledte felter");
expectRed("API-negativ afvist m. rigtig kode men http_status 200 (inkonsistent) → rød", verify(mutated((p) => { const c = cas(p, "c-k9-ut"); c.observations.negative.http_status = 200; rejudge(c); })), "≠ opfyldt");
expectRed("subst fjernet fra observationerne → rød (spec-projektion + protokol)", verify(mutated((p) => { const c = cas(p, "c-k7ac2-ut"); delete c.observations.subst; rejudge(c); })), "spec-afledte felter|≠ opfyldt");
expectRed("subst ændret til en anden uuid (der matcher en manipuleret afvisning) → rød (subst er spec'ens)", verify(mutated((p) => { const c = cas(p, "c-k7ac2-ut"); c.observations.subst = { id: "33333333-3333-3333-3333-333333333333" }; c.observations.negative.detail.message = "entity 33333333-3333-3333-3333-333333333333 af type gruppe_kontakt findes ikke eller er allerede anonymized"; rejudge(c); })), "spec-afledte felter");
expectRed("API-mutant: under mutanten stadig afvist (mutation uden virkning) → kill fejler", verify(mutated((p) => { const m = mut(p, "m-api"); m.under = clone(m.baseline); })), "genudledt kill fejler");

console.log("\nprover · claim_graph · reviews (F-19):");
expectRed("prover_result uden konsistent resumé (failed 99 skjult) → rød", verify(mutated((p) => (p.prover_result = { ok: true, total: ALL_IDS.length, passed: ALL_IDS.length, failed: 99, skipped: 0, executed_ids: ALL_IDS }))), "prover_result");
expectGreen("vejnings-skæring: prover_result som uafhængigt grønt resumé (total 1) uden id-bijektion → grøn", verify(mutated((p) => { p.prover_result = { ok: true, total: 1, passed: 1, failed: 0, skipped: 0 }; })));
expectGreen("vejnings-skæring: prover_result uden executed_ids → grøn", verify(mutated((p) => delete p.prover_result.executed_ids)));
expectRed("prover executed_ids (leveret) m. dublet → rød (F-26)", verify(mutated((p) => (p.prover_result.executed_ids = [...ALL_IDS.filter((x) => x !== "m-klass"), "m-navn"]))), "F-26");
expectRed("prover executed_ids (leveret) m. fantom-id → rød (F-26)", verify(mutated((p) => (p.prover_result.executed_ids = [...ALL_IDS.filter((x) => x !== "m-klass"), "PHANTOM-TEST"]))), "F-26");
expectRed("prover_result.ok false → rød", verify(mutated((p) => (p.prover_result.ok = false))), "prover ikke grøn");
expectGreen("vejnings-skæring: claim_graph udeladt → grøn (mutant-kill + footprint bærer værnsbeviset; ankre hører til C3)", verify(mutated((p) => delete p.claim_graph)));
expectGreen("vejnings-skæring: claim_graph tom → grøn", verify(mutated((p) => (p.claim_graph = []))));
expectRed("claim_graph leveret som ikke-array → rød", verify(mutated((p) => (p.claim_graph = { k_id: "K-1" }))), "tæt array");
expectRed("claim executed:false → rød", verify(mutated((p) => (p.claim_graph[0].executed = false))), "executed/mutant_killed");
expectRed("claim m. mutant fra andet K → rød", verify(mutated((p) => (p.claim_graph[0].mutant_ids = ["m-min"]))), "for netop dette K");
expectRed("claim m. case fra andet K → rød", verify(mutated((p) => (p.claim_graph[0].case_ids = ["c-k2-ut"]))), "for netop dette K");
expectRed("claim: mutanten rammer en case der IKKE er blandt claimets cases (samme K) → rød (F-25)", verify(mutated((p) => (p.claim_graph[0].case_ids = ["c-k1-mh"]))), "ikke er blandt claimets case_ids");
expectRed("claim: guard_ref ≠ mutantens værn → rød (F-25)", verify(mutated((p) => (p.claim_graph[0].guard_ref = "g.min"))), "≠ claimets");
expectRed("claim uden guard_ref → rød (F-25)", verify(mutated((p) => delete p.claim_graph[0].guard_ref)), "guard_ref mangler");
expectRed("claim: source_anchor flyttet til gyldigt git-uddrag i plan.md (anden sti end værnets locus) → rød (F-31)", verify(mutated((p) => (p.claim_graph[0].source_anchor = mkEvidence("plan/plan.md", 1, 1)))), "≠ værnets låste locus-sti");
expectRed("claim: source_anchor på migrationens ANDEN funktion (stand_deaktiver) → rød (F-31: mønstret matcher ikke)", verify(mutated((p) => (p.claim_graph[0].source_anchor = mkEvidence("supabase/migrations/0001.sql", 2, 2)))), "matcher ikke værnets låste locus-mønster");
expectRed("claim: source_anchor på en KOMMENTAR der citerer routinen (linje 3) → rød (F-31: kommentarsubstitution)", verify(mutated((p) => (p.claim_graph[0].source_anchor = mkEvidence("supabase/migrations/0001.sql", 3, 3)))), "matcher ikke værnets låste locus-mønster");
expectRed("claim: source_anchor på et uddrag der spænder kommentar + policy (linje 3-4) → rød (F-31)", verify(mutated((p) => (p.claim_graph[0].source_anchor = mkEvidence("supabase/migrations/0001.sql", 3, 4)))), "matcher ikke værnets låste locus-mønster");
expectRed("claim på et værn UDEN låst locus i manifestet (g.klass) → rød (F-31)", verify(mutated((p) => p.claim_graph.push({ k_id: "K-7", guard_ref: "g.klass", executed: true, mutant_killed: true, case_ids: ["c-k7-ut"], mutant_ids: ["m-klass"], source_anchor: mkEvidence("supabase/migrations/0001.sql", 4, 4) }))), "intet låst locus");
expectGreen("claim m. K-2-værn på dets locus (stand_deaktiver, linje 2) → grøn", verify(mutated((p) => p.claim_graph.push({ k_id: "K-2", guard_ref: "g.min", executed: true, mutant_killed: true, case_ids: ["c-k2-ut", "c-k2-sa"], mutant_ids: ["m-min"], source_anchor: mkEvidence("supabase/migrations/0001.sql", 2, 2) }))));
expectRed("claim m. K-2-værn men anker på K-1's routine (linje 1) → rød (F-31: et andet værns anker)", verify(mutated((p) => p.claim_graph.push({ k_id: "K-2", guard_ref: "g.min", executed: true, mutant_killed: true, case_ids: ["c-k2-ut", "c-k2-sa"], mutant_ids: ["m-min"], source_anchor: mkEvidence("supabase/migrations/0001.sql", 1, 1) }))), "matcher ikke værnets låste locus-mønster");
expectRed("claim m. dublet-case-ids → rød", verify(mutated((p) => (p.claim_graph[0].case_ids = ["c-k1-ut", "c-k1-ut"]))), "distinkte");
expectRed("source_anchor forkert → rød", verify(mutated((p) => (p.claim_graph[0].source_anchor.excerpt_sha = sha256("x")))), "ikke git-verificeret");
expectRed("manglende review → rød", verify(mutated((p) => (p.async_reviews = p.async_reviews.filter((r) => r.bid_id !== "bid-1")))), "mangler et PASS async-review");
expectRed("base_oid orphan → rød", verify(mutated((p) => { p.bid_bindings[1].base_oid = ORPHAN; p.async_reviews[1].base_oid = ORPHAN; })), "ikke en ancestor");

console.log("\nC4b — ci-produceret artefakt (beviset committes ikke):");
{ const p = greenProof(); const s = snap(p); const ci = { ...s, artifact: { path: s.artifact.path, oid: "c".repeat(40), type: "ci-produced" } }; expectGreen("verifier: snapshot m. ci-produceret artefakt (ingen git-sti-binding for artefaktet) → grøn", verifyBuildProof(p, ci, { git })); }
{ const p = greenProof(); const s = snap(p); const ci = { ...s, artifact: { path: s.artifact.path, oid: "ikke-en-oid", type: "ci-produced" } }; expectRed("verifier: ci-produceret artefakt m. ugyldig oid → rød", verifyBuildProof(p, ci, { git }), "ci-produced"); }
{ const p = greenProof(); const s = snap(p); const ci = { ...s, artifact: { path: s.artifact.path, oid: "c".repeat(40), type: "ci-produced" }, proof_result: { ...p, artifact_oid: "c".repeat(40) } }; const r = evaluateGate("build", ci, { verifyProof: makeProofVerifier({ git }) }); r.open ? ok("e2e: build-gaten ÅBNER m. ci-produceret artefakt når proof.artifact_oid = artefakt-oid") : bad("e2e ci-produced", r.reasons.join(" | ")); }

console.log("\nfail-closed + e2e gennem evaluateGate:");
expectRed("git-dep mangler", verifyBuildProof(greenProof(), snap(greenProof()), {}), "git-dep mangler");
{ const p = mutated((x) => Object.defineProperty(mut(x, "m-navn"), "killed", { enumerable: true, get: () => true })); expectRed("killed som getter → rød", verify(p), "kill-flag"); }
expectGreen("router → verifyBuildProof (grøn)", makeProofVerifier({ git })(greenProof(), snap(greenProof())));
{ const r = evaluateGate("build", snap(greenProof()), { verifyProof: makeProofVerifier({ git }) }); r.open ? ok("build-gaten ÅBNER med ægte v2.3-bevis + kæde-bundet manifest + gate-bundet spec") : bad("e2e-grøn", r.reasons.join(" | ")); }
{ const r = evaluateGate("build", snap(mutated((p) => { const c = cas(p, "c-k1-fs"); delete c.observations.action; rejudge(c); })), { verifyProof: makeProofVerifier({ git }) }); !r.open ? ok("build-gaten LUKKER når den foreskrevne handling udelades af beviset (F-20)") : bad("e2e-F20", "ÅBNEDE"); }
{ const r = evaluateGate("build", snap(mutated((p) => (mut(p, "m-navn").footprint_under = null))), { verifyProof: makeProofVerifier({ git }) }); !r.open ? ok("build-gaten LUKKER ved fejlet footprint-måling (F-21)") : bad("e2e-F21", "ÅBNEDE"); }
{ const s = snap(greenProof()); delete s.bindings.angrebsspec; delete s.proof_result.bindings_oids.angrebsspec; const r = evaluateGate("build", s, { verifyProof: makeProofVerifier({ git }) }); !r.open ? ok("build-gaten LUKKER uden angrebsspec-binding (kerne)") : bad("e2e-spec", "ÅBNEDE"); }
{ const r = evaluateGate("build", snap(mutated((p) => { const m = mut(p, "m-navn"); m.footprint_under = clone(m.footprint_baseline); })), { verifyProof: makeProofVerifier({ git }) }); !r.open ? ok("build-gaten LUKKER ved ikke-attesteret mutation") : bad("e2e-fp", "ÅBNEDE"); }

console.log("");
if (failed > 0) { console.error(`build-proof red-team: ${failed} FEJLEDE (${passed} ok)`); process.exit(1); }
console.log(`build-proof red-team: alle ${passed} cases passed`);
