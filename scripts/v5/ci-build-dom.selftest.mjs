#!/usr/bin/env node
// ci-build-dom.selftest.mjs — red-team af C4b's build-dommer: nåethed · input-validering · migrations-STOP · forgænger · måling → bevis →
// ci-produceret artefakt → frisk evaluateGate; ærlig rød ved manglende prover/reviews; grøn kun når ALT er bevist.
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

// ---------- fixture-repo (samme motor-fixture som build-proof.selftest) ----------
const ROOT = mkdtempSync(join(tmpdir(), "v5-cibuild-")); process.on("exit", () => rmSync(ROOT, { recursive: true, force: true }));
execFileSync("git", ["init", "-q", ROOT]); const git = makeGit(ROOT); git("config", "user.name", "t"); git("config", "user.email", "t@l");
const put = (p, c) => { mkdirSync(join(ROOT, dirname(p)), { recursive: true }); writeFileSync(join(ROOT, p), c); };
put("launch/launch.json", JSON.stringify({ pakke: "pk", anker: "x", anker_sha: "a".repeat(40), author: "m" }) + "\n");
put("plan-build/pk/plan.md", "# plan\n"); put("plan-build/pk/forventningsliste.md", "# liste\n"); put("docs/sandhed/krav/pk-krav.md", "# krav\n");
put("plan-build/pk/recon2.md", "# r2\n"); put("plan-build/pk/p8-slutproeve-spec.md", "# p8\n"); put("plan-build/pk/ordbog.md", "# o\n"); put("plan-build/pk/kill-list-udkast.md", "# k\n"); put("recon/recon.md", "# recon\n");
put("supabase/migrations/0001_a.sql", "-- migration a\ncreate table t(x int);\n"); put("supabase/migrations/0002_b.sql", "-- migration b\ncreate table u(y int);\n");
git("add", "-A"); git("commit", "-qm", "filer"); const C0 = git("rev-parse", "HEAD"); const oidAt = (p, c = C0) => resolveRef(git, c, p).oid;
const rc = (sqlstate, sted, grund, fase = "wrapper", aktoer = "app_role") => ({ kanal: "sqlstate", sqlstate, grund, afvisningssted: sted, fase, aktoer, observationskanal: "sqlstate", offentlig_signatur: "f(text)" });
const MANIFEST = { schema_version: 1, pakke: "pk", bindings: { forventningsliste: { path: "plan-build/pk/forventningsliste.md", oid: oidAt("plan-build/pk/forventningsliste.md") }, krav: { path: "docs/sandhed/krav/pk-krav.md", oid: oidAt("docs/sandhed/krav/pk-krav.md") }, plan: { path: "plan-build/pk/plan.md", oid: oidAt("plan-build/pk/plan.md") } },
  guards: [{ id: "g.navn", beskrivelse: "navn" }],
  obligations: [
    { id: "K-1/ac-1", k_id: "K-1", kind: "ac", proof_forms: ["UT", "MH"], scope: "nu", effekt_bid: "bid-2", kildeankre: ["K:1"], assertions: [{ id: "audit-row", form: "MH" }], negatives: [{ id: "K-1/ac-1/neg-1", beskrivelse: "blank", reject_contract: rc("22023", "f.lokation_opret", "navn_blank"), sole_guard_ref: "g.navn" }] },
    { id: "K-1/ac-3", k_id: "K-1", kind: "ac", proof_forms: ["FS"], scope: "nu", kildeankre: ["K:3"], assertions: [{ id: "hist", form: "FS" }], negatives: [] },
  ] };
put("plan-build/pk/forventnings-manifest.json", JSON.stringify(MANIFEST, null, 1) + "\n"); git("add", "-A"); git("commit", "-qm", "manifest"); const C1 = git("rev-parse", "HEAD");
const EP = { kind: "rpc", ref: "lokation_opret" }; const ACT = { role: "app_role" }; const B = "bid-2"; const HE = "db-row";
const SPEC = { schema_version: 1, pakke: "pk", bindings: { manifest: { path: "plan-build/pk/forventnings-manifest.json", oid: oidAt("plan-build/pk/forventnings-manifest.json", C1) }, plan: { path: "plan-build/pk/plan.md", oid: oidAt("plan-build/pk/plan.md") } },
  bids: [{ bid_id: "bid-1", kind: "forudsaetning", depends_on: [], covers: [] }, { bid_id: "bid-2", kind: "effekt", depends_on: ["bid-1"], covers: ["K-1/ac-1", "K-1/ac-3"] }],
  cases: [
    { case_id: "c-k1-ut", obligation_id: "K-1/ac-1", negative_id: "K-1/ac-1/neg-1", proof_form: "UT", fase: "wrapper", bid_id: B, hard_effect: HE, entrypoint: EP, actor: ACT, positive: { sql: "POS" }, negative: { sql: "NEG" }, state: { sql: "STATE" } },
    { case_id: "c-k1-mh", obligation_id: "K-1/ac-1", proof_form: "MH", bid_id: B, hard_effect: HE, entrypoint: EP, actor: ACT, action: { sql: "ACT_MH" }, witnesses: [{ id: "audit-row", observe: { sql: "AUDIT" }, expect: { kind: "count", value: 1 } }] },
    { case_id: "c-k1-fs", obligation_id: "K-1/ac-3", proof_form: "FS", bid_id: B, hard_effect: "state", entrypoint: EP, actor: ACT, action: { sql: "ACT" }, observe: { sql: "OBS" }, expect: { kind: "scalar", value: 100 }, checkpoints: [{ id: "hist", observe: { sql: "OBS_HIST" }, expect: { kind: "scalar", value: 80 } }] },
  ],
  mutants: [{ mutant_id: "m-navn", guard_ref: "g.navn", target_case_id: "c-k1-ut", target_assertion_id: "negativ-afvist-bundet", controls: ["c-k1-fs"], apply: "M_NAVN_OFF", restore: "M_NAVN_ON", footprint: { observe: { sql: "FP" } } }] };
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
  const st = { navn: true, pris: 100, audit: true, migs: [], ...over };
  return { st,
    sql(t) { if (/^-- migration/.test(t)) { if (st.failMigration && t.includes(st.failMigration)) return R(false, "42601", "syntax error", null); st.migs.push(t.split("\n")[0]); return R(true); }
      switch (t) { case "POS": return R(true); case "NEG": return st.navn ? R(false, "22023", "navn_blank", "f.lokation_opret") : R(true); case "STATE": return R(true, null, null, null, [{ n: 1 }]);
        case "ACT": return R(true); case "OBS": return R(true, null, null, null, [{ pris: st.pris }]); case "OBS_HIST": return R(true, null, null, null, [{ pris: 80 }]);
        case "ACT_MH": return R(true); case "AUDIT": return R(true, null, null, null, st.audit ? [{ id: 1 }] : []); case "FP": return R(true, null, null, null, [{ navn: st.navn }]);
        case "M_NAVN_OFF": st.navn = false; return R(true); case "M_NAVN_ON": st.navn = true; return R(true); default: return R(false, "42601", "ukendt " + t, null); } },
    race() { return { protocolOk: false, error: "ingen race i fixturen" }; }, exec() { return { exit_code: 0, stdout: "" }; } };
}
const planDom = (open = true) => async () => ({ gate: "plan", naaet: true, pinned: C1, result: open ? { open: true, gate_id: "plan", reasons: [] } : { open: false, gate_id: "plan", reasons: ["approval mangler"] } });
const prover = async () => ({ ok: true, summary: { total: 3, passed: 3, failed: 0, skipped: 0 } });
const base = (o = {}) => ({ commitSha: COMMIT2, root: ROOT, git, runner: mkRunner(), planDom: planDom(true), prover, runId: "ci-test-1", ...o });

console.log("doemBuild — nåethed og input:");
eq("BUILD_NAAETHED = plan-approval + angrebs-spec", BUILD_NAAETHED.join(","), "plan-build/<pakke>/plan-approval.json,plan-build/<pakke>/angrebs-spec.json");
{ const d = await doemBuild(base({ commitSha: C1 })); eq("@ C1 (ingen approval/spec) → ikke nået, intet check-run", d.naaet === false && d.checkRun === null, true); }
{ const d = await doemBuild(base({ readJson: (p) => (p.endsWith("angrebs-spec.json") ? { schema_version: 1, pakke: "pk", bindings: {}, bids: [], cases: [], mutants: [] } : JSON.parse(git.bytes("show", `${COMMIT2}:${p}`).toString("utf8"))) })); eq("angrebs-spec ukomplet mod manifestet → failure m. grund", d.checkRun.conclusion === "failure" && /angrebs-spec ugyldig/.test(d.result.reasons[0]), true); }

console.log("\nstore — migrationer @ commit som ejer, STOP ved fejl:");
{ const r = mkRunner(); const d = await doemBuild(base({ runner: r })); eq("begge migrationer anvendt i rækkefølge (0001 før 0002)", r.st.migs.join("|"), "-- migration a|-- migration b"); eq("store.anvendt = 2 i beviset", d.envelope?.store?.migrationer_anvendt, 2); }
{ const r = mkRunner({ failMigration: "migration a" }); const d = await doemBuild(base({ runner: r })); eq("første migration fejler → failure m. 'migration … fejlede', den anden køres IKKE (STOP)", d.checkRun.conclusion === "failure" && /migration supabase\/migrations\/0001_a.sql fejlede/.test(d.result.reasons[0]) && r.st.migs.length === 0, true); }
{ const d = await doemBuild(base({ skipMigrations: true })); eq("--skip-migrations mærkes ærligt i beviset (store.skipped_migrations)", d.envelope?.store?.skipped_migrations, true); }

console.log("\nforgænger — plan-gaten frisk:");
{ const d = await doemBuild(base({ planDom: planDom(false) })); eq("plan-gaten lukket → build failure m. forgængerens grund", d.checkRun.conclusion === "failure" && /forgængeren \(plan-gaten\) er ikke åben/.test(d.result.reasons[0]) && /approval mangler/.test(d.result.reasons[0]), true); }

console.log("\nbevis → ci-produceret artefakt → frisk dom:");
{ const d = await doemBuild(base()); const reasons = (d.result.reasons ?? []).join(" | ");
  eq("GRØN STI: motor allOk + reviews PASS + prover grøn → build-gaten ÅBEN, check-run success", d.result.open === true && d.checkRun.conclusion === "success", true); if (d.result.open !== true) console.error("      ", reasons.slice(0, 900));
  eq("artefakt-oid = git hash-object af bevis-bytes (genverificerbart)", d.artifactOid, hashObjectBytes(d.proofBytes, ROOT));
  eq("envelope binder proof_kind build-proof · artifact_oid · bindings_oids {plan, manifest, angrebsspec} @ commit", d.envelope.proof_kind === "build-proof" && d.envelope.artifact_oid === d.artifactOid && d.envelope.bindings_oids.plan === oidAt("plan-build/pk/plan.md", COMMIT2) && d.envelope.bindings_oids.angrebsspec === oidAt("plan-build/pk/angrebs-spec.json", COMMIT2), true);
  eq("bevis-body bærer run_id · store · engine.store real · cases/mutanter fra motoren", d.envelope.run_id === "ci-test-1" && d.envelope.engine.store === "real" && d.envelope.cases.length === 3 && d.envelope.mutants.length === 1, true);
  eq("check-run-summary bærer artefakt-oid + run_id + store", /bevis-artefakt \(ci-produced\)/.test(d.checkRun.output.summary) && /ci-test-1/.test(d.checkRun.output.summary), true); }
{ const d = await doemBuild(base({ prover: async () => ({ ok: false, reasons: ["2 tests fejlede"], summary: { total: 3, passed: 1, failed: 2, skipped: 0 } }) })); eq("prover rød → build-gaten LUKKET (prover ikke grøn)", d.result.open === false && /prover/.test((d.result.reasons ?? []).join(" ")), true); }
{ const d = await doemBuild(base({ exists: (p) => !/prover\.json$/.test(p) && (() => { try { git("cat-file", "-e", `${COMMIT2}:${p}`); return true; } catch { return false; } })() })); eq("prover.json mangler @ commit → ærligt ufuldstændigt bevis → LUKKET m. grund", d.result.open === false && /prover/.test((d.result.reasons ?? []).join(" ")) && /mangler/.test(d.envelope.prover_result.reason), true); }
{ const d = await doemBuild(base({ exists: (p) => !/reviews\//.test(p) && (() => { try { git("cat-file", "-e", `${COMMIT2}:${p}`); return true; } catch { return false; } })() })); eq("reviews mangler @ commit → LUKKET (mangler et PASS async-review)", d.result.open === false && /async-review/.test((d.result.reasons ?? []).join(" ")), true); }
{ const d = await doemBuild(base({ exists: (p) => !/bids\//.test(p) && (() => { try { git("cat-file", "-e", `${COMMIT2}:${p}`); return true; } catch { return false; } })() })); eq("bids/<bid>.json mangler → base_oid = den gatede commit → reviewet (af COMMIT) er STALE → LUKKET", d.result.open === false && /stale review/.test((d.result.reasons ?? []).join(" ")) && d.envelope.bid_bindings[0].base_oid === COMMIT2, true); }
{ const d = await doemBuild(base()); eq("bid_bindings bærer bid'ets basis-commit fra bids/<bid>.json (= reviewets), og basis er forfader til den gatede commit", d.envelope.bid_bindings.every((b) => b.base_oid === COMMIT), true); }
{ const d = await doemBuild(base({ runner: mkRunner({ audit: false }) })); eq("motor: vidne udebliver (audit tom) → case brudt → LUKKET, ok:false i envelope", d.result.open === false && d.envelope.ok === false, true); }
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
{ const p = await producerBevis(base()); const b = JSON.parse(p.proofBytes); b.cases[0].status = "opfyldt"; b.cases[0].observations.negative = { ok: true, code: null, detail: null }; const d = await doemBevis(base({ proofBytes: JSON.stringify(b, null, 1) + "\n" })); eq("doemBevis: manipulerede bytes (forbudt tilladt, status pyntet) → verifieren genudleder → rød", d.result.open === false && /genudledt/.test(d.result.reasons.join(" ")), true); }
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
{ const p = await producerBevis(base()); const b = JSON.parse(p.proofBytes); b.engine.allOk = true; b.cases[1].status = "brudt"; const d = await doemBevis(base({ proofBytes: JSON.stringify(b, null, 1) + "\n" })); eq("doemBevis: engine.allOk pyntet til true m. brudt case → rød (genudledning + summary)", d.result.open === false, true); }
{ let e = null; try { await doemBuild(base({ runner: null })); } catch (x) { e = x.message; } eq("uden runner → kast (ingen måling uden store)", /runner/.test(e ?? ""), true); }

console.log("");
if (fail > 0) { console.error(`ci-build-dom: ${fail} FEJLEDE (${pass} ok)`); process.exit(1); }
console.log(`ci-build-dom red-team: alle ${pass} cases passed`);
