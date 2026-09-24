#!/usr/bin/env node
// ci-build-dom.selftest.mjs — red-team af C4b's build-dommer (v3, hurtigt spor 2026-09-21): nåethed · input-validering (indeks skema 2) ·
// migrations-STOP · forgænger · måling m. test-runneren (Codex' testfiler + mutanter) → rapport → ci-produceret artefakt → frisk evaluateGate;
// ærlig rød ved manglende prover/reviews; grøn kun når ALT er bevist.
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { doemBuild, producerBevis, doemBevis, hashObjectBytes, raaTilTekst, BUILD_NAAETHED } from "./ci-build-dom.mjs";
import { makeGit, resolveRef } from "./git.mjs";

let pass = 0, fail = 0;
const ok = (n) => { pass++; console.log(`  ✓ ${n}`); };
const bad = (n, r) => { fail++; console.error(`  ✗ ${n}: ${r}`); };
const eq = (n, got, want) => (got === want ? ok(n) : bad(n, `fik ${JSON.stringify(got)}, forventede ${JSON.stringify(want)}`));

// ---------- fixture-repo (samme test-fixture som build-proof.selftest) ----------
const ROOT = mkdtempSync(join(tmpdir(), "v5-cibuild-")); process.on("exit", () => rmSync(ROOT, { recursive: true, force: true }));
execFileSync("git", ["init", "-q", ROOT]); const git = makeGit(ROOT); git("config", "user.name", "t"); git("config", "user.email", "t@l");
const put = (p, c) => { mkdirSync(join(ROOT, dirname(p)), { recursive: true }); writeFileSync(join(ROOT, p), c); };
put("launch/launch.json", JSON.stringify({ pakke: "pk", anker: "x", anker_sha: "a".repeat(40), author: "m" }) + "\n");
put("plan-build/pk/plan.md", "# plan\n"); put("plan-build/pk/forventningsliste.md", "# liste\n"); put("docs/sandhed/krav/pk-krav.md", "# krav\n");
put("plan-build/pk/recon2.md", "# r2\n"); put("plan-build/pk/p8-slutproeve-spec.md", "# p8\n"); put("plan-build/pk/ordbog.md", "# o\n"); put("plan-build/pk/kill-list-udkast.md", "# k\n"); put("recon/recon.md", "# recon\n");
put("supabase/migrations/0001_a.sql", "-- migration a\ncreate table t(x int);\n"); put("supabase/migrations/0002_b.sql", "-- migration b\ncreate table u(y int);\n");
const F1 = "scripts/v5/pk/tests/k1.test.mjs", F2 = "scripts/v5/pk/tests/k1-fs.test.mjs";
put(F1, `export const tests = [
  { id: "t-k1-neg", covers: ["K-1/ac-1:UT", "K-1/ac-1/neg-1"], run: async (lib) => { const a = lib.som({ role: "app_role" }); lib.forvent.ok(await a.sql("POS")); lib.forvent.afvist(await a.sql("NEG"), "K-1/ac-1/neg-1"); } },
  { id: "t-k1-audit", covers: ["K-1/ac-1:MH", "K-1/ac-1|audit-row"], run: async (lib) => { lib.forvent.ok(await lib.som({ role: "app_role" }).sql("ACT_MH")); lib.forvent.lig((await lib.ejer.sql("AUDIT")).rows, { kind: "count", value: 1 }, "audit-row"); } },
];
`);
put(F2, `export const tests = [
  { id: "t-k1-fs", covers: ["K-1/ac-3:FS", "K-1/ac-3|hist"], run: async (lib) => { lib.forvent.ok(await lib.som({ role: "app_role" }).sql("ACT")); lib.forvent.lig((await lib.ejer.sql("OBS")).rows, { kind: "scalar", value: 100 }); lib.forvent.lig((await lib.ejer.sql("OBS_HIST")).rows, { kind: "scalar", value: 80 }); } },
];
`);
const oidOf = (p) => execFileSync("git", ["-C", ROOT, "hash-object", p], { encoding: "utf8" }).trim();
git("add", "-A"); git("commit", "-qm", "filer"); const C0 = git("rev-parse", "HEAD"); const oidAt = (p, c = C0) => resolveRef(git, c, p).oid;
const rc = (sqlstate, sted, grund, fase = "wrapper", aktoer = "app_role") => ({ kanal: "sqlstate", sqlstate, grund, afvisningssted: sted, fase, aktoer, observationskanal: "sqlstate", offentlig_signatur: "f(text)" });
const MANIFEST = { schema_version: 1, pakke: "pk", bindings: { forventningsliste: { path: "plan-build/pk/forventningsliste.md", oid: oidAt("plan-build/pk/forventningsliste.md") }, krav: { path: "docs/sandhed/krav/pk-krav.md", oid: oidAt("docs/sandhed/krav/pk-krav.md") }, plan: { path: "plan-build/pk/plan.md", oid: oidAt("plan-build/pk/plan.md") } },
  guards: [{ id: "g.navn", beskrivelse: "navn" }],
  obligations: [
    { id: "K-1/ac-1", k_id: "K-1", kind: "ac", proof_forms: ["UT", "MH"], scope: "nu", effekt_bid: "bid-2", kildeankre: ["K:1"], assertions: [{ id: "audit-row", form: "MH" }], negatives: [{ id: "K-1/ac-1/neg-1", beskrivelse: "blank", reject_contract: rc("22023", "f.lokation_opret", "navn_blank"), sole_guard_ref: "g.navn" }] },
    { id: "K-1/ac-3", k_id: "K-1", kind: "ac", proof_forms: ["FS"], scope: "nu", kildeankre: ["K:3"], assertions: [{ id: "hist", form: "FS" }], negatives: [] },
  ] };
put("plan-build/pk/forventnings-manifest.json", JSON.stringify(MANIFEST, null, 1) + "\n"); git("add", "-A"); git("commit", "-qm", "manifest"); const C1 = git("rev-parse", "HEAD");
const SPEC = { schema_version: 2, pakke: "pk", bindings: { manifest: { path: "plan-build/pk/forventnings-manifest.json", oid: oidAt("plan-build/pk/forventnings-manifest.json", C1) }, plan: { path: "plan-build/pk/plan.md", oid: oidAt("plan-build/pk/plan.md") } },
  bids: [{ bid_id: "bid-1", kind: "forudsaetning", depends_on: [], covers: [] }, { bid_id: "bid-2", kind: "effekt", depends_on: ["bid-1"], covers: ["K-1/ac-1", "K-1/ac-3"] }],
  tests: [
    { id: "t-k1-neg", file: F1, oid: oidOf(F1), covers: ["K-1/ac-1:UT", "K-1/ac-1/neg-1"] },
    { id: "t-k1-audit", file: F1, oid: oidOf(F1), covers: ["K-1/ac-1:MH", "K-1/ac-1|audit-row"] },
    { id: "t-k1-fs", file: F2, oid: oidOf(F2), covers: ["K-1/ac-3:FS", "K-1/ac-3|hist"] },
  ],
  mutants: [{ mutant_id: "m-navn", guard_ref: "g.navn", apply: "M_NAVN_OFF", restore: "M_NAVN_ON", target_test_ids: ["t-k1-neg"], control_test_ids: ["t-k1-fs"] }] };
put("plan-build/pk/angrebs-spec.json", JSON.stringify(SPEC, null, 1) + "\n");
put("plan-build/pk/plan-approval.json", JSON.stringify({ approval: { gate_id: "plan" } }) + "\n"); put("plan-build/pk/plan-gate-resultat.json", JSON.stringify({ open: true, gate_id: "plan", reasons: [], commit_sha: C1 }) + "\n");
put("plan-build/pk/reviews/bid-1.json", JSON.stringify({ bid_id: "bid-1", conclusion: "PASS", base_oid: "PLACEHOLDER" }) + "\n"); put("plan-build/pk/reviews/bid-2.json", JSON.stringify({ bid_id: "bid-2", conclusion: "PASS", base_oid: "PLACEHOLDER" }) + "\n");
put("plan-build/pk/prover.json", JSON.stringify({ cmd: ["node", "-e", "0"], resultRelPath: "x.json" }) + "\n");
git("add", "-A"); git("commit", "-qm", "spec+approval+reviews+prover"); let COMMIT = git("rev-parse", "HEAD");
// reviews' base_oid skal være den gatede commit → skriv dem m. den rigtige commit (base_oid = commit'en beviset dømmes ved i pakke 1)
put("plan-build/pk/reviews/bid-1.json", JSON.stringify({ bid_id: "bid-1", conclusion: "PASS", base_oid: COMMIT }) + "\n"); put("plan-build/pk/reviews/bid-2.json", JSON.stringify({ bid_id: "bid-2", conclusion: "PASS", base_oid: COMMIT }) + "\n");
put("plan-build/pk/bids/bid-1.json", JSON.stringify({ bid_id: "bid-1", base_oid: COMMIT }) + "\n"); put("plan-build/pk/bids/bid-2.json", JSON.stringify({ bid_id: "bid-2", base_oid: COMMIT }) + "\n");   // bid'ets basis-commit (bygget @ COMMIT)
git("add", "-A"); git("commit", "-qm", "reviews + bids m. base"); const COMMIT2 = git("rev-parse", "HEAD");
// reviews peger på COMMIT (forfader) — men bid_bindings sætter base_oid = den gatede commit → skal matche → brug en commit hvor reviews peger på sig selv? umuligt (hash-cirkel).
// Derfor: base_oid i pakke 1 = den commit bid'et er BYGGET ved (forfader), ikke den gatede; testen bruger COMMIT2 hvor reviews peger på COMMIT — og forventer at verifieren binder base_oid == bid_bindings.base_oid == COMMIT.

const R = (okv, code = null, message = null, routine = null, rows) => ({ ok: okv, error: okv ? null : message, code, detail: okv ? null : { message, routine }, ...(rows !== undefined ? { rows } : {}) });
function mkRunner(over = {}) {
  const st = { navn: true, pris: 100, audit: true, mutable: true, migs: [], ...over };
  return { st,
    sql(t) { if (/^insert into auth\.users/.test(t)) { if (st.failBootstrap) return R(false, "42501", "permission denied for table users", null); st.bootAt = st.migs.length; return R(true); }
      if (/^-- migration/.test(t)) { if (st.failMigration && t.includes(st.failMigration)) return R(false, "42601", "syntax error", null); st.migs.push(t.split("\n")[0]); return R(true); }
      switch (t) { case "POS": return R(true); case "NEG": return st.navn ? R(false, "22023", "navn_blank", "f.lokation_opret") : R(true); case "STATE": return R(true, null, null, null, [{ n: 1 }]);
        case "ACT": return R(true); case "OBS": return R(true, null, null, null, [{ pris: st.pris }]); case "OBS_HIST": return R(true, null, null, null, [{ pris: 80 }]);
        case "ACT_MH": return R(true); case "AUDIT": return R(true, null, null, null, st.audit ? [{ id: 1 }] : []); case "FP": return R(true, null, null, null, [{ navn: st.navn }]);
        case "M_NAVN_OFF": if (st.mutable) st.navn = false; return R(true); case "M_NAVN_ON": st.navn = true; return R(true); default: return R(false, "42601", "ukendt " + t, null); } },
    race() { return { protocolOk: false, error: "ingen race i fixturen" }; }, exec() { return { exit_code: 0, stdout: "" }; } };
}
const planDom = (open = true) => async () => ({ gate: "plan", naaet: true, pinned: C1, result: open ? { open: true, gate_id: "plan", reasons: [] } : { open: false, gate_id: "plan", reasons: ["approval mangler"] } });
const prover = async () => ({ ok: true, summary: { total: 3, passed: 3, failed: 0, skipped: 0 } });
const base = (o = {}) => ({ commitSha: COMMIT2, root: ROOT, git, runner: mkRunner(), planDom: planDom(true), prover, runId: "ci-test-1", ...o });

console.log("doemBuild — nåethed og input:");
eq("BUILD_NAAETHED = plan-approval + angrebs-spec", BUILD_NAAETHED.join(","), "plan-build/<pakke>/plan-approval.json,plan-build/<pakke>/angrebs-spec.json");
{ const d = await doemBuild(base({ commitSha: C1 })); eq("@ C1 (ingen approval/spec) → ikke nået, intet check-run", d.naaet === false && d.checkRun === null, true); }
{ const d = await doemBuild(base({ readJson: (p) => (p.endsWith("angrebs-spec.json") ? { schema_version: 1, pakke: "pk", bindings: {}, bids: [], cases: [], mutants: [] } : JSON.parse(git.bytes("show", `${COMMIT2}:${p}`).toString("utf8"))) })); eq("angrebs-spec = DSL skema 1 / ukomplet mod manifestet → failure m. grund (kun indeks skema 2)", d.checkRun.conclusion === "failure" && /angrebs-indeks ugyldigt/.test(d.result.reasons[0]), true); }
{ const d = await doemBuild(base({ readJson: (p) => { const j = JSON.parse(git.bytes("show", `${COMMIT2}:${p}`).toString("utf8")); if (p.endsWith("angrebs-spec.json")) j.tests[0].oid = "f".repeat(40); return j; } })); eq("indeksets test-oid ≠ testfilen i checkoutet → test-runneren afviser → failure (frysning)", d.checkRun.conclusion === "failure" && /test-runneren afviste/.test(d.result.reasons[0]) && /ikke den frosne/.test(d.result.reasons[0]), true); }

console.log("\nstore — migrationer @ commit som ejer, STOP ved fejl:");
{ const r = mkRunner(); const d = await doemBuild(base({ runner: r })); eq("begge migrationer anvendt i rækkefølge (0001 før 0002)", r.st.migs.join("|"), "-- migration a|-- migration b"); eq("store.anvendt = 2 i beviset", d.envelope?.store?.migrationer_anvendt, 2); }
{ const r = mkRunner({ failMigration: "migration a" }); const d = await doemBuild(base({ runner: r })); eq("første migration fejler → failure m. 'migration … fejlede', den anden køres IKKE (STOP)", d.checkRun.conclusion === "failure" && /migration supabase\/migrations\/0001_a.sql fejlede/.test(d.result.reasons[0]) && r.st.migs.length === 0, true); }
{ const d = await doemBuild(base({ skipMigrations: true })); eq("--skip-migrations → RØD dom (ikke en frisk store; Codex-dom 1fb55f9)", d.checkRun.conclusion === "failure" && /skipped_migrations ≠ false/.test(d.result.reasons.join(" ")), true); }
console.log("\nfrisk store (trin 0b) — bootstrap + blob-bundet undtagelse:");
{ const r = mkRunner(); const d = await doemBuild(base({ runner: r })); eq("bootstrap (Auth-rækker) kører FØR første migration", r.st.bootAt, 0); eq("bootstrap mærkes i beviset (store.frisk_store_bootstrap)", d.envelope?.store?.frisk_store_bootstrap, true); eq("default-undtagelsen (H024) rammer ikke fixturens migrationer → ingen undtaget", JSON.stringify(d.envelope?.store?.undtagne_migrationer), "[]"); }
{ const r = mkRunner({ failBootstrap: true }); const d = await doemBuild(base({ runner: r })); eq("bootstrap fejler → failure m. 'frisk-store-bootstrap fejlede', ingen migration køres", d.checkRun.conclusion === "failure" && /frisk-store-bootstrap fejlede/.test(d.result.reasons.join(" ")) && r.st.migs.length === 0, true); }
{ const A = "supabase/migrations/0001_a.sql"; const bo = git("rev-parse", `${COMMIT2}:${A}`); const r = mkRunner();
  const d = await doemBuild(base({ runner: r, undtagelser: [{ path: A, blob: bo, grund: "test" }] }));
  eq("undtagelse m. matchende blob springes over (kun b anvendt)", r.st.migs.join("|"), "-- migration b");
  eq("undtagelsen skrives ind i beviset m. path+blob+grund", JSON.stringify(d.envelope?.store?.undtagne_migrationer), JSON.stringify([{ path: A, blob: bo, grund: "test" }])); }
{ const A = "supabase/migrations/0001_a.sql"; const r = mkRunner(); const d = await doemBuild(base({ runner: r, undtagelser: [{ path: A, blob: "f".repeat(40), grund: "test" }] }));
  eq("undtagelse m. ANDEN blob end filen @ commit → failure (STOP), intet anvendt", d.checkRun.conclusion === "failure" && /undtagelsen gælder ikke/.test(d.result.reasons.join(" ")) && r.st.migs.length === 0, true); }
{ const r = mkRunner(); const d = await doemBuild(base({ runner: r, bootstrap: null })); eq("bootstrap: null → ingen bootstrap kørt OG RØD dom (frisk_store_bootstrap ≠ true)", r.st.bootAt === undefined && d.checkRun.conclusion === "failure" && /frisk_store_bootstrap ≠ true/.test(d.result.reasons.join(" ")), true); }
console.log("\nstore-felterne DØMMES (Codex-dom 1fb55f9, P1) — kan ikke skjules i et grønt bevis:");
{ const A = "supabase/migrations/0001_a.sql"; const bo = git("rev-parse", `${COMMIT2}:${A}`); const U = [{ path: A, blob: bo, grund: "test" }];
  const p = await producerBevis(base({ undtagelser: U })); const ok = await doemBevis(base({ proofBytes: p.proofBytes, undtagelser: U }));
  eq("kontrol: bevis m. bootstrap + korrekt undtagelse → ÅBEN", ok.result.open, true);
  const tamp = async (fn) => { const b = JSON.parse(p.proofBytes); fn(b); return doemBevis(base({ proofBytes: JSON.stringify(b, null, 1) + "\n", undtagelser: U })); };
  const rød = async (navn, fn, re) => { const d = await tamp(fn); eq(navn, d.checkRun.conclusion === "failure" && re.test(d.result.reasons.join(" ")), true); };
  await rød("store slettet → rød", (b) => { delete b.store; }, /mangler store/);
  await rød("frisk_store_bootstrap: false → rød", (b) => { b.store.frisk_store_bootstrap = false; }, /frisk_store_bootstrap ≠ true/);
  await rød("bootstrap-feltet slettet → rød", (b) => { delete b.store.frisk_store_bootstrap; }, /frisk_store_bootstrap ≠ true/);
  await rød("undtagelseslisten tømt → rød", (b) => { b.store.undtagne_migrationer = []; }, /undtagne_migrationer ≠ den godkendte liste/);
  await rød("forkert blob i undtagelsen → rød", (b) => { b.store.undtagne_migrationer[0].blob = "f".repeat(40); }, /undtagne_migrationer ≠ den godkendte liste/);
  await rød("en ANDEN migration påstået undtaget → rød", (b) => { b.store.undtagne_migrationer = [{ path: "supabase/migrations/0002_b.sql", blob: bo, grund: "test" }]; }, /undtagne_migrationer ≠ den godkendte liste/);
  await rød("migrationer_anvendt forfalsket → rød", (b) => { b.store.migrationer_anvendt = 2; }, /migrationer_anvendt = 2 ≠ 1/);
  await rød("skipped_migrations: true → rød", (b) => { b.store.skipped_migrations = true; }, /skipped_migrations ≠ false/);
  const d2 = await doemBevis(base({ proofBytes: p.proofBytes, undtagelser: [{ path: A, blob: "e".repeat(40), grund: "test" }] })); eq("godkendt liste m. anden blob end filen @ commit → rød i dommen", d2.checkRun.conclusion === "failure" && /bundet til eeeeeeee/.test(d2.result.reasons.join(" ")), true); }

console.log("\nforgænger — plan-gaten frisk:");
{ const d = await doemBuild(base({ planDom: planDom(false) })); eq("plan-gaten lukket → build failure m. forgængerens grund", d.checkRun.conclusion === "failure" && /forgængeren \(plan-gaten\) er ikke åben/.test(d.result.reasons[0]) && /approval mangler/.test(d.result.reasons[0]), true); }

console.log("\nbevis → ci-produceret artefakt → frisk dom:");
{ const d = await doemBuild(base()); const reasons = (d.result.reasons ?? []).join(" | ");
  eq("GRØN STI: alle tests ok + alle mutanter dræbt + reviews PASS + prover grøn → build-gaten ÅBEN, check-run success", d.result.open === true && d.checkRun.conclusion === "success", true); if (d.result.open !== true) console.error("      ", reasons.slice(0, 900));
  eq("artefakt-oid = git hash-object af bevis-bytes (genverificerbart)", d.artifactOid, hashObjectBytes(d.proofBytes, ROOT));
  eq("envelope binder proof_kind build-proof · artifact_oid · bindings_oids {plan, manifest, angrebsspec} @ commit", d.envelope.proof_kind === "build-proof" && d.envelope.artifact_oid === d.artifactOid && d.envelope.bindings_oids.plan === oidAt("plan-build/pk/plan.md", COMMIT2) && d.envelope.bindings_oids.angrebsspec === oidAt("plan-build/pk/angrebs-spec.json", COMMIT2), true);
  eq("bevis-body er rapporten (skema 3): run_id · index_oid = indeksets blob @ commit · store · tests/mutanter fra test-runneren", d.envelope.schema_version === 3 && d.envelope.run_id === "ci-test-1" && d.envelope.index_oid === oidAt("plan-build/pk/angrebs-spec.json", COMMIT2) && d.envelope.engine.store === "real" && d.envelope.tests.length === 3 && d.envelope.mutants.length === 1 && d.envelope.mutants[0].killed === true, true);
  eq("check-run-summary bærer artefakt-oid + run_id + store", /bevis-artefakt \(ci-produced\)/.test(d.checkRun.output.summary) && /ci-test-1/.test(d.checkRun.output.summary), true); }
{ const d = await doemBuild(base({ prover: async () => ({ ok: false, reasons: ["2 tests fejlede"], summary: { total: 3, passed: 1, failed: 2, skipped: 0 } }) })); eq("prover rød → build-gaten LUKKET (prover ikke grøn)", d.result.open === false && /prover/.test((d.result.reasons ?? []).join(" ")), true); }
{ const d = await doemBuild(base({ exists: (p) => !/prover\.json$/.test(p) && (() => { try { git("cat-file", "-e", `${COMMIT2}:${p}`); return true; } catch { return false; } })() })); eq("prover.json mangler @ commit → ærligt ufuldstændigt bevis → LUKKET m. grund", d.result.open === false && /prover/.test((d.result.reasons ?? []).join(" ")) && /mangler/.test(d.envelope.prover_result.reason), true); }
{ const d = await doemBuild(base({ exists: (p) => !/reviews\//.test(p) && (() => { try { git("cat-file", "-e", `${COMMIT2}:${p}`); return true; } catch { return false; } })() })); eq("reviews mangler @ commit → LUKKET (mangler et PASS async-review)", d.result.open === false && /async-review/.test((d.result.reasons ?? []).join(" ")), true); }
{ const d = await doemBuild(base({ exists: (p) => !/bids\//.test(p) && (() => { try { git("cat-file", "-e", `${COMMIT2}:${p}`); return true; } catch { return false; } })() })); eq("bids/<bid>.json mangler → base_oid = den gatede commit → reviewet (af COMMIT) er STALE → LUKKET", d.result.open === false && /stale review/.test((d.result.reasons ?? []).join(" ")) && d.envelope.bid_bindings[0].base_oid === COMMIT2, true); }
{ const d = await doemBuild(base()); eq("bid_bindings bærer bid'ets basis-commit fra bids/<bid>.json (= reviewets), og basis er forfader til den gatede commit", d.envelope.bid_bindings.every((b) => b.base_oid === COMMIT), true); }
{ const d = await doemBuild(base({ runner: mkRunner({ audit: false }) })); eq("måling: vidne udebliver (audit tom) → testen fejler → LUKKET, ok:false i envelope, grund nævner testen", d.result.open === false && d.envelope.ok === false && /t-k1-audit FEJLEDE/.test(d.result.reasons.join(" ")), true); }
{ const d = await doemBuild(base({ runner: mkRunner({ mutable: false }) })); eq("måling: mutanten uden effekt (target overlever) → IKKE dræbt → LUKKET", d.result.open === false && /m-navn: IKKE dræbt/.test(d.result.reasons.join(" ")), true); }
{ let e = null; try { await doemBuild(base({ commitSha: "HEAD" })); } catch (x) { e = x.message; } eq("mutable ref som commit → kast", /pinned/.test(e ?? ""), true); }

console.log("\nto tillidszoner (Codex F-C4b-1): måling m. renset miljø → bytes → dom uden produktkode:");
{ process.env.GITHUB_TOKEN = "ghs_hemmelig"; let setEnv = null; const p = await producerBevis(base({ prover: async (pj, env) => { setEnv = env; return { ok: true, summary: { total: 3, passed: 3, failed: 0, skipped: 0 } }; } })); delete process.env.GITHUB_TOKEN;
  eq("producerBevis: prover-cmd får et RENSET miljø — GITHUB_TOKEN er væk, PATH er der", setEnv !== null && !("GITHUB_TOKEN" in setEnv) && "PATH" in setEnv, true);
  eq("producerBevis leverer bytes + body + store + run_id, ingen dom", typeof p.proofBytes === "string" && p.body.run_id === "ci-test-1" && p.store.anvendt === 2 && p.result === undefined, true);
  const d = await doemBevis(base({ proofBytes: p.proofBytes, store: p.store })); eq("doemBevis fra bytes → samme dom (ÅBEN) og oid = hash-object(bytes)", d.result.open === true && d.artifactOid === hashObjectBytes(p.proofBytes, ROOT), true);
  eq("check-run-summary bærer FULD artefakt-oid (40 hex) — tredjepart kan sammenligne uden præfiks", new RegExp(d.artifactOid).test(d.checkRun.output.summary), true); }
{ let e = null; try { await producerBevis(base({ env: { PATH: "/usr/bin", GITHUB_TOKEN: "x" } })); } catch (x) { e = x.message; } eq("producerBevis afviser et miljø m. credential (fail-closed, F-C4b-1)", /F-C4b-1/.test(e ?? ""), true); }
{ const p = await producerBevis(base()); const b = JSON.parse(p.proofBytes); b.commit_sha = "b".repeat(40); const d = await doemBevis(base({ proofBytes: JSON.stringify(b, null, 1) + "\n" })); eq("doemBevis: bevis for en ANDEN commit → rød", d.result.open === false && /produceret for commit/.test(d.result.reasons[0]), true); }
{ const p = await producerBevis(base()); const b = JSON.parse(p.proofBytes); b.pakke = "anden"; const d = await doemBevis(base({ proofBytes: JSON.stringify(b, null, 1) + "\n" })); eq("doemBevis: bevis for en ANDEN pakke → rød", d.result.open === false && /pakken/.test(d.result.reasons[0]), true); }
{ const p = await producerBevis(base()); const b = JSON.parse(p.proofBytes); b.mutants[0].targets[0].failed = false; const d = await doemBevis(base({ proofBytes: JSON.stringify(b, null, 1) + "\n" })); eq("doemBevis: manipulerede bytes (target overlevede, killed pyntet) → verifieren genudleder → rød", d.result.open === false && /genudledt/.test(d.result.reasons.join(" ")), true); }
{ const p = await producerBevis(base()); const b = JSON.parse(p.proofBytes); b.index_oid = "e".repeat(40); const d = await doemBevis(base({ proofBytes: JSON.stringify(b, null, 1) + "\n" })); eq("doemBevis: rapport fra et ANDET indeks (index_oid) → rød", d.result.open === false && /index_oid/.test(d.result.reasons.join(" ")), true); }
{ const d = await doemBevis(base({ proofBytes: "ikke json" })); eq("doemBevis: bytes er ikke JSON → rød", d.result.open === false && /ikke JSON/.test(d.result.reasons[0]), true); }
console.log("\nrå bytes (Codex F-C4b-3): hash over det tredjeparten kan downloade, ingen tabsfuld afkodning:");
{ const p = await producerBevis(base()); const buf = Buffer.from(p.proofBytes, "utf8"); const d = await doemBevis(base({ proofBytes: buf })); eq("doemBevis fra Buffer (som fra fil) → ÅBEN og oid == hash-object(rå bytes) == hash-object(producentens streng)", d.result.open === true && d.artifactOid === hashObjectBytes(buf, ROOT) && d.artifactOid === hashObjectBytes(p.proofBytes, ROOT), true);
  const i = p.proofBytes.indexOf('"pakke": "pk"') + '"pakke": "pk"'.length;   // Codex' modprøve: et ekstra strengfelt m. byte 0xff midt i ellers gyldigt JSON
  const korrupt = Buffer.concat([Buffer.from(p.proofBytes.slice(0, i) + ', "x": "', "utf8"), Buffer.from([0xff]), Buffer.from('"' + p.proofBytes.slice(i), "utf8")]);
  const d2 = await doemBevis(base({ proofBytes: korrupt })); eq("Codex' modprøve: ekstra strengfelt m. byte 0xff (ugyldig UTF-8) → RØD (ikke gyldig UTF-8), aldrig success m. afvigende oid", d2.result.open === false && /ikke gyldig UTF-8/.test(d2.result.reasons[0]), true);
  eq("raaTilTekst: gyldig UTF-8 (æøå) → tekst; 0xff → null", raaTilTekst(Buffer.from("æøå", "utf8")) === "æøå" && raaTilTekst(Buffer.from([0x61, 0xff])) === null, true);
  const lossy = Buffer.from(korrupt.toString("utf8"), "utf8"); eq("den tabsfuldt afkodede streng hasher ANDERLEDES end de rå bytes (det var hullet)", hashObjectBytes(lossy, ROOT) !== hashObjectBytes(korrupt, ROOT), true); }
{ process.env.GITHUB_TOKEN = "ghs_forældre"; let seen = "x"; await producerBevis(base({ prover: async () => { seen = process.env.GITHUB_TOKEN ?? ""; return { ok: true, summary: { total: 1, passed: 1, failed: 0, skipped: 0 } }; } })); const efter = process.env.GITHUB_TOKEN; delete process.env.GITHUB_TOKEN; eq("prover-kaldet: forælderens credential er fjernet fra process.env under kaldet (runProver merger process.env) og genoprettet efter", seen === "" && efter === "ghs_forældre", true); }
{ const d = await doemBevis(base({ proofBytes: null, fejl: ["migration supabase/migrations/0001_a.sql fejlede: 42601 syntax"], store: { anvendt: 0 } })); eq("doemBevis: målingen meldte fejl (migration STOP) → rød m. målingens grund", d.result.open === false && /migration .* fejlede/.test(d.result.reasons[0]), true); }
{ const d = await doemBevis(base({ proofBytes: null })); eq("doemBevis: intet bevis fra målingen → rød (fail-closed)", d.result.open === false && /proofBytes mangler/.test(d.result.reasons[0]), true); }
{ const p = await producerBevis(base()); const b = JSON.parse(p.proofBytes); b.engine.allOk = true; b.tests[1].ok = false; const d = await doemBevis(base({ proofBytes: JSON.stringify(b, null, 1) + "\n" })); eq("doemBevis: engine.allOk pyntet til true m. fejlet test → rød (flaget tæller ikke)", d.result.open === false && /FEJLEDE/.test(d.result.reasons.join(" ")), true); }
{ let e = null; try { await doemBuild(base({ runner: null })); } catch (x) { e = x.message; } eq("uden runner → kast (ingen måling uden store)", /runner/.test(e ?? ""), true); }

console.log("");
if (fail > 0) { console.error(`ci-build-dom: ${fail} FEJLEDE (${pass} ok)`); process.exit(1); }
console.log(`ci-build-dom red-team: alle ${pass} cases passed`);
