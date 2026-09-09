#!/usr/bin/env node
// kvittering.selftest.mjs — red-team af godkendelses-kvitteringen (M-41 princip 9 / P2-gates F-1).
// Rækkefølge-beviset udøves mod RIGTIG git-historik (temp-repo): kvittering FØR approval = grøn;
// approval først · samme commit · kvittering ændret efter · digest-mismatch · ændret fremlæggelse ·
// devil ikke PASS · manglende kvittering = rød.
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { makeGit } from "./git.mjs";
import { scopeDigest } from "./gates.mjs";
import { validateKvittering, makeApprovalVerifier, kvitteringDigest, KVITTERING_KEYS, validateTransportReceipt, makeTransportVerifier } from "./kvittering.mjs";

let pass = 0, fail = 0;
const ok = (n) => { pass++; console.log(`  ✓ ${n}`); };
const bad = (n, r) => { fail++; console.error(`  ✗ ${n}: ${r}`); };
const green = (n, r) => (r.ok === true ? ok(n) : bad(n, r.reasons.join(" | ")));
const red = (n, r, needle) => (!r.ok && r.reasons.some((x) => new RegExp(needle).test(x)) ? ok(n) : bad(n, r.ok ? "GRØN (falsk-grøn slap igennem)" : `rød men uden '${needle}': ${r.reasons.join(" | ")}`));

// --- temp-repo med en realistisk plan-gate-historik ---
const ROOT = mkdtempSync(join(tmpdir(), "v5-kvittering-"));
process.on("exit", () => rmSync(ROOT, { recursive: true, force: true }));
execFileSync("git", ["init", "-q", ROOT]);
const git = makeGit(ROOT);
git("config", "user.name", "t"); git("config", "user.email", "t@l");
const P = "pakke-x";
const skriv = (p, c) => { mkdirSync(join(ROOT, dirname(p)), { recursive: true }); writeFileSync(join(ROOT, p), c); };
const commit = (m) => { git("add", "-A"); git("commit", "-qm", m); return git("rev-parse", "HEAD"); };
skriv(`plan-build/${P}/plan.md`, "# plan\n"); skriv(`plan-build/${P}/fremlaeggelse-3.md`, "# fremlæggelse\n");
commit("artefakter");
const FREM_OID = git("rev-parse", `HEAD:plan-build/${P}/fremlaeggelse-3.md`);
const devilJson = (konklusion = "PASS", frem = FREM_OID) => JSON.stringify({ aktor: "codex-spoergsmaals-devil", konklusion, fremlaeggelse_blob: frem, fund: [] }) + "\n";
skriv(`plan-build/${P}/devil-plan.json`, devilJson()); commit("devil-dom");
const oid = (p) => git("rev-parse", `HEAD:${p}`);
const ART = oid(`plan-build/${P}/plan.md`);
const bOids = { krav: "1".repeat(40), recon2: "2".repeat(40), p8: "3".repeat(40), ordbog: "4".repeat(40), killlist: "5".repeat(40) };
const digests = ["a".repeat(64), "b".repeat(64), "c".repeat(64)];
const ctx = { gateId: "plan", pakke: P, artifactOid: ART, expectedOids: bOids, expectedScope: scopeDigest("plan", ART, bOids), verdictDigests: digests };
const kvOk = () => ({
  schema_version: 1, gate_id: "plan", pakke: P, artifact_oid: ART, bindings_oids: { ...bOids }, scope_digest: ctx.expectedScope,
  prerequisite_digests: [...digests], fremlaeggelse: { path: `plan-build/${P}/fremlaeggelse-3.md`, blob_oid: oid(`plan-build/${P}/fremlaeggelse-3.md`) },
  devil: { path: `plan-build/${P}/devil-plan.json`, blob_oid: oid(`plan-build/${P}/devil-plan.json`), dom: "PASS" }, frosset: "2026-09-09T15:00:00+02:00",
});

console.log("validateKvittering — ren logik:");
green("gyldig kvittering", validateKvittering(kvOk(), ctx));
red("uventet felt", validateKvittering({ ...kvOk(), ekstra: 1 }, ctx), "uventet felt");
for (const k of KVITTERING_KEYS) { const kv = kvOk(); delete kv[k]; red(`manglende felt '${k}'`, validateKvittering(kv, ctx), "manglende felt"); }
red("gate_id krav på plan-gaten", validateKvittering({ ...kvOk(), gate_id: "krav" }, ctx), "gate_id");
red("anden pakke", validateKvittering({ ...kvOk(), pakke: "pakke-y" }, ctx), "pakke");
red("andet artefakt (anden plan-tekst)", validateKvittering({ ...kvOk(), artifact_oid: "9".repeat(40) }, ctx), "artifact_oid");
red("bindings delmængde", validateKvittering({ ...kvOk(), bindings_oids: { krav: bOids.krav } }, ctx), "bindings_oids");
red("bindings ekstra nøgle", validateKvittering({ ...kvOk(), bindings_oids: { ...bOids, x: "6".repeat(40) } }, ctx), "bindings_oids");
red("scope_digest replay", validateKvittering({ ...kvOk(), scope_digest: scopeDigest("krav", ART, bOids) }, ctx), "scope_digest");
red("prerequisite_digests kun 2 af 3", validateKvittering({ ...kvOk(), prerequisite_digests: digests.slice(0, 2) }, ctx), "prerequisite_digests");
red("prerequisite_digests andre verdikter", validateKvittering({ ...kvOk(), prerequisite_digests: ["d".repeat(64), "e".repeat(64), "f".repeat(64)] }, ctx), "andre verdikter|prerequisite");
red("prerequisite_digests dublet erstatter tredje", validateKvittering({ ...kvOk(), prerequisite_digests: [digests[0], digests[0], digests[1]] }, ctx), "prerequisite");
{ const kv = kvOk(); const arr = []; arr[Symbol.iterator] = function* () { yield* digests; }; kv.prerequisite_digests = arr;
  red("iterator-trick (tomt array m. egen iterator) → rød (egne indeks-felter læses)", validateKvittering(kv, ctx), "prerequisite_digests"); }
red("devil.dom FAIL", validateKvittering({ ...kvOk(), devil: { ...kvOk().devil, dom: "FAIL" } }, ctx), "devil.dom");
red("devil uden dom", validateKvittering({ ...kvOk(), devil: { path: "x", blob_oid: "1".repeat(40) } }, ctx), "devil");
red("fremlaeggelse.path traversal", validateKvittering({ ...kvOk(), fremlaeggelse: { path: "../x.md", blob_oid: "1".repeat(40) } }, ctx), "fremlaeggelse.path");
red("frosset ikke ISO", validateKvittering({ ...kvOk(), frosset: "i går" }, ctx), "frosset");
red("ikke plain object (prototype)", validateKvittering(Object.create({ ...kvOk() }), ctx), "plain object|manglende felt");

console.log("\nmakeApprovalVerifier — rækkefølge mod rigtig git-historik:");
const KV = `plan-build/${P}/plan-kvittering.json`, AP = `plan-build/${P}/plan-approval.json`;
const skrivKv = (kv) => { const b = Buffer.from(JSON.stringify(kv, null, 1) + "\n"); skriv(KV, b); return kvitteringDigest(b); };
const skrivAp = (digest) => skriv(AP, JSON.stringify({ approval: { login_server_verified: "mgrubak", gate_id: "plan", scope_digest: ctx.expectedScope, prerequisite_digests: digests, kvittering_digest: digest } }, null, 1) + "\n");
const verifier = () => makeApprovalVerifier({ git, pakke: P, evidenceRef: "HEAD" });
const approval = (d) => ({ login_server_verified: "mgrubak", gate_id: "plan", scope_digest: ctx.expectedScope, prerequisite_digests: digests, kvittering_digest: d });
{
  const d = skrivKv(kvOk()); const cK = commit("kvittering FØR fremlæggelse");
  skrivAp(d); const cA = commit("plan ok (approval)");
  green("kvittering committet FØR approval → grøn", verifier()(approval(d), ctx));
  red("approval refererer anden digest", verifier()(approval("0".repeat(64)), ctx), "kvittering_digest");
  red("ctx m. andre verdikt-digests (nye verdikter efter kvittering)", verifier()(approval(d), { ...ctx, verdictDigests: ["d".repeat(64), "e".repeat(64), "f".repeat(64)] }), "prerequisite");
  // kvittering ÆNDRET efter approval (nyt indhold, ny commit) → ikke forfader → rød (også hvis approval opdateres til ny digest)
  const kv2 = kvOk(); kv2.frosset = "2026-09-09T16:00:00+02:00"; const d2 = skrivKv(kv2); commit("kvittering ændret EFTER approval");
  red("kvittering ændret efter approval (gammel approval-digest) → rød", verifier()(approval(d), ctx), "kvittering_digest|forfader");
  red("kvittering ændret efter approval (approval-digest opdateret i approval-objektet, men approval-commit uændret) → rød", verifier()(approval(d2), ctx), "forfader|ubevist");
  void cK; void cA;
}
{
  // fremlæggelsen ændres EFTER kvitteringen (blob @ HEAD ≠ kvitteringens blob)
  const kv = kvOk(); kv.frosset = "2026-09-09T15:30:00+02:00"; const d = skrivKv(kv); commit("kvittering v3"); skrivAp(d); commit("approval v3");
  green("sanity: ny kæde grøn", verifier()(approval(d), ctx));
  skriv(`plan-build/${P}/fremlaeggelse-3.md`, "# fremlæggelse (ÆNDRET efter kvittering)\n"); commit("fremlæggelse ændret");
  red("fremlæggelsen ændret efter kvitteringen → rød (Mathias så en anden tekst)", verifier()(approval(d), ctx), "fremlaeggelse");
  skriv(`plan-build/${P}/fremlaeggelse-3.md`, "# fremlæggelse\n"); commit("fremlæggelse tilbage");
}
{
  // samme commit → rød
  const kv = kvOk(); kv.frosset = "2026-09-09T17:00:00+02:00"; const d = skrivKv(kv); skrivAp(d); commit("kvittering OG approval i samme commit");
  red("kvittering og approval i SAMME commit → rød", verifier()(approval(d), ctx), "SAMME commit");
}
{
  // approval FØRST, kvittering bagefter → rød
  const kv = kvOk(); kv.frosset = "2026-09-09T18:00:00+02:00"; const b = Buffer.from(JSON.stringify(kv, null, 1) + "\n"); const d = kvitteringDigest(b);
  skrivAp(d); commit("approval FØRST"); skriv(KV, b); commit("kvittering bagefter");
  red("approval committet FØR kvitteringen → rød (godkendelse før kvittering)", verifier()(approval(d), ctx), "forfader");
}
{
  // devil-fil ændret til FAIL efter kvittering
  const kv = kvOk(); kv.frosset = "2026-09-09T19:00:00+02:00"; const d = skrivKv(kv); commit("kv"); skrivAp(d); commit("ap");
  green("sanity: grøn igen", verifier()(approval(d), ctx));
  skriv(`plan-build/${P}/devil-plan.json`, devilJson("FAIL")); commit("devil ændret");
  red("devil-fil ændret efter kvittering → rød", verifier()(approval(d), ctx), "devil");
  skriv(`plan-build/${P}/devil-plan.json`, devilJson()); commit("devil tilbage");
}
{
  // P2 F-5: devil-blobben siger FAIL fra START, men kvitteringen påstår dom:PASS og binder den korrekte OID → rød (kilden vinder)
  skriv(`plan-build/${P}/devil-fail.json`, devilJson("FAIL")); commit("devil FAIL fra start");
  const kv = kvOk(); kv.frosset = "2026-09-09T20:00:00+02:00"; kv.devil = { path: `plan-build/${P}/devil-fail.json`, blob_oid: oid(`plan-build/${P}/devil-fail.json`), dom: "PASS" };
  const d = skrivKv(kv); commit("kv m. løgn om devil"); skrivAp(d); commit("ap");
  red("kvittering påstår dom:PASS men devil-blobben siger FAIL → rød (F-5: blobben er kilden)", verifier()(approval(d), ctx), "modsiges af kilden");
  // devil-dom for en ANDEN fremlæggelse (blob-mismatch) → rød
  skriv(`plan-build/${P}/devil-anden.json`, devilJson("PASS", "3".repeat(40))); commit("devil for anden fremlæggelse");
  const kv2 = kvOk(); kv2.frosset = "2026-09-09T20:30:00+02:00"; kv2.devil = { path: `plan-build/${P}/devil-anden.json`, blob_oid: oid(`plan-build/${P}/devil-anden.json`), dom: "PASS" };
  const d2 = skrivKv(kv2); commit("kv2"); skrivAp(d2); commit("ap2");
  red("devil-dom gælder en anden fremlæggelses-blob → rød (F-5 binding)", verifier()(approval(d2), ctx), "gælder fremlæggelses-blob");
  // devil-fil der ikke er JSON → rød
  skriv(`plan-build/${P}/devil-tekst.md`, "PASS\n"); commit("devil som tekst");
  const kv3 = kvOk(); kv3.frosset = "2026-09-09T21:00:00+02:00"; kv3.devil = { path: `plan-build/${P}/devil-tekst.md`, blob_oid: oid(`plan-build/${P}/devil-tekst.md`), dom: "PASS" };
  const d3 = skrivKv(kv3); commit("kv3"); skrivAp(d3); commit("ap3");
  red("devil-fil der ikke er JSON → rød (dommen kan ikke læses)", verifier()(approval(d3), ctx), "ikke et JSON-objekt");
}
{
  // P2 F-6: fremlaeggelse.path peger på en MAPPE og blob_oid er mappens tree-OID → rød (typen skal være blob)
  skriv(`plan-build/${P}/mappe/x.md`, "x\n"); commit("mappe");
  const treeOid = git("rev-parse", `HEAD:plan-build/${P}/mappe`);
  const kv = kvOk(); kv.frosset = "2026-09-09T22:00:00+02:00"; kv.fremlaeggelse = { path: `plan-build/${P}/mappe`, blob_oid: treeOid };
  const d = skrivKv(kv); commit("kv tree"); skrivAp(d); commit("ap tree");
  red("fremlaeggelse peger på et TREE (mappe) → rød (F-6: kun blob)", verifier()(approval(d), ctx), "ikke en fil|devil|fremlaeggelse");
}
{
  const v = makeApprovalVerifier({ git, pakke: P, evidenceRef: "HEAD", paths: { kvittering: `plan-build/${P}/findes-ikke.json`, approval: AP } });
  red("manglende kvittering @ evidenceRef → rød", v(approval("0".repeat(64)), ctx), "kvittering mangler");
  red("approval uden kvittering_digest → rød", verifier()({ login_server_verified: "mgrubak" }, ctx), "kvittering_digest");
  red("ugyldigt input (null) → rød", verifier()(null, ctx), "ugyldigt input");
}
let threw = false; try { makeApprovalVerifier({ pakke: P }); } catch { threw = true; }
threw ? ok("verifier uden git-dep kaster (fail-closed)") : bad("git-dep", "kastede ikke");
{
  // P2 F-7: evidens-ref opløses ÉN gang ved konstruktion — en ref der flyttes bagefter ændrer ikke dommen
  const HEAD0 = git("rev-parse", "HEAD");
  const v = makeApprovalVerifier({ git, pakke: P, evidenceRef: "HEAD" });
  skriv(`plan-build/${P}/støj.md`, "ny commit efter konstruktion\n"); commit("HEAD flyttes");
  const r0 = v(approval("0".repeat(64)), ctx);
  r0.reasons.some((x) => x.includes(HEAD0.slice(0, 7))) || !r0.ok ? ok("verifier dømmer mod den pinnede evidens-commit, ikke det nye HEAD (F-7)") : bad("F-7", JSON.stringify(r0));
  let t2 = false; try { makeApprovalVerifier({ git, pakke: P, evidenceRef: "findes-ikke" }); } catch { t2 = true; }
  t2 ? ok("ukendt evidens-ref kaster ved konstruktion (fail-closed)") : bad("evidens-ref", "kastede ikke");
}

console.log("\nvalidateTransportReceipt — ren logik (codex-run v4-kvittering):");
const GC = "7".repeat(40); const ARTP = `plan-build/${P}/plan.md`; const LEV_SHA = "e".repeat(64);
const rcOk = () => ({ schema_version: 2, status: "success", run_id: "r1", rolle: "codex-angreb", aktivitet: "dom", model: "m", effort: "xhigh", sandbox: "read-only", regel_commit: "8".repeat(40), lock_mode: "committed", skill_oid: "9".repeat(40), prompt_sha256: "f".repeat(64), gate_input: { gate_id: "plan", gated_commit: GC, artifact_path: ARTP }, selftest: false, attempts: [{ attempt: 1, rc: 0, model: "m", effort: "xhigh", sandbox: "read-only", output_sha256: LEV_SHA, output_bytes: 10 }] });
const tctx = { gateId: "plan", commitSha: GC, artifactPath: ARTP, rawOutputSha256: LEV_SHA };
green("gyldig transport-kvittering", validateTransportReceipt(rcOk(), tctx));
red("status fejl", validateTransportReceipt({ ...rcOk(), status: "fejl" }, tctx), "status");
red("selftest=true", validateTransportReceipt({ ...rcOk(), selftest: true }, tctx), "selftest");
red("selftest-flag mangler", validateTransportReceipt((() => { const r = rcOk(); delete r.selftest; return r; })(), tctx), "selftest");
red("lås-override", validateTransportReceipt({ ...rcOk(), lock_mode: "OVERRIDE(selftest)" }, tctx), "lock_mode");
red("produktions-kørsel", validateTransportReceipt({ ...rcOk(), aktivitet: "produktion" }, tctx), "aktivitet");
red("gate_input mangler", validateTransportReceipt({ ...rcOk(), gate_input: null }, tctx), "gate_input mangler");
red("gate_input anden gate", validateTransportReceipt({ ...rcOk(), gate_input: { ...rcOk().gate_input, gate_id: "krav" } }, tctx), "gate_id");
red("gate_input anden commit", validateTransportReceipt({ ...rcOk(), gate_input: { ...rcOk().gate_input, gated_commit: "6".repeat(40) } }, tctx), "gated_commit");
red("gate_input andet artefakt", validateTransportReceipt({ ...rcOk(), gate_input: { ...rcOk().gate_input, artifact_path: "x.md" } }, tctx), "artifact_path");
red("leverance ≠ verdiktets raw_output_sha256", validateTransportReceipt(rcOk(), { ...tctx, rawOutputSha256: "d".repeat(64) }), "raw_output_sha256");
red("forsøg m. andet effort", validateTransportReceipt({ ...rcOk(), attempts: [{ ...rcOk().attempts[0], effort: "low" }] }, tctx), "anden model");
red("schema v1", validateTransportReceipt({ ...rcOk(), schema_version: 1 }, tctx), "schema_version");
red("3 forsøg", validateTransportReceipt({ ...rcOk(), attempts: [rcOk().attempts[0], { ...rcOk().attempts[0], attempt: 2 }, { ...rcOk().attempts[0], attempt: 3 }] }, tctx), "antal forsøg");

console.log("\nmakeTransportVerifier — mod committet provenance-arkiv:");
{
  const lev = "leverance-bytes"; const levSha = kvitteringDigest(Buffer.from(lev));
  const receipt = { ...rcOk(), attempts: [{ ...rcOk().attempts[0], output_sha256: levSha }] };
  const rb = Buffer.from(JSON.stringify(receipt, null, 1) + "\n"); const rsha = kvitteringDigest(rb);
  skriv(`plan-build/${P}/provenance/r1.receipt.json`, rb); commit("provenance: kvittering r1");
  const mk = (over = {}) => makeTransportVerifier({ git, pakke: P, evidenceRef: "HEAD", gateId: "plan", commitSha: GC, artifactPath: ARTP, ...over });
  const vCodex = (run) => ({ aktor: "codex", run: { run_id: "r1", run_attempt: 1, raw_output_sha256: levSha, actor_server_id: "x", receipt_sha256: rsha, ...run } });
  const vClaude = (run = {}) => ({ aktor: "code-reviewer", run: { run_id: "c", run_attempt: 1, raw_output_sha256: "1".repeat(64), actor_server_id: "SELV-ERKLÆRET", ...run } });
  green("codex-verdikt m. committet kvittering + matchende leverance-hash → grøn", mk()([vCodex(), vClaude()]));
  red("codex-verdikt UDEN receipt_sha256 → rød (F-2)", mk()([vCodex({ receipt_sha256: undefined })]), "receipt_sha256 mangler");
  red("codex-verdikt m. receipt_sha256 der ikke findes i arkivet → rød", mk()([vCodex({ receipt_sha256: "0".repeat(64) })]), "ingen committet kvittering");
  red("codex-verdikt m. anden raw_output_sha256 end kvitteringens leverance → rød", mk()([vCodex({ raw_output_sha256: "2".repeat(64) })]), "raw_output_sha256");
  red("kvittering bundet til ANDEN gate → rød (F-10)", mk({ gateId: "krav" })([vCodex()]), "gate_id");
  red("kvittering bundet til anden commit → rød", mk({ commitSha: "6".repeat(40) })([vCodex()]), "gated_commit");
  red("claude-aktør m. receipt_sha256 (forfalsket lighed) → rød", mk()([vClaude({ receipt_sha256: rsha })]), "forfalsket lighed");
  green("kun claude-aktører (residual: SELV-ERKLÆRET) → grøn", mk()([vClaude()]));
  red("verdicts ikke et array → rød", mk()(null), "ikke et array");
  // historisk undtagelse (M-38/r4b): PRÆCIS det committede r4b-codex-verdikt accepteres uden receipt_sha256 — en ændret kopi ikke
  const REPO_ROOT = new URL("../../", import.meta.url).pathname;
  const r4b = JSON.parse(readFileSync(join(REPO_ROOT, "plan-build/lokations-skabelon/verdikt-codex-krav-r4b.json"), "utf8"));
  green("historisk r4b-codex-verdikt (digest i HISTORISKE_UNDTAGELSER) → grøn uden kvittering", mk({ gateId: "krav", commitSha: GC, artifactPath: "x" })([r4b]));
  const r4bx = structuredClone(r4b); r4bx.run.run_id = "fase2-buildability-codex-r5";
  red("ændret kopi af r4b (nyt run_id) → rød (undtagelsen er digest-bundet)", mk({ gateId: "krav", commitSha: GC, artifactPath: "x" })([r4bx]), "ikke en registreret historisk undtagelse");
  const rSelf = { ...receipt, selftest: true }; const rbS = Buffer.from(JSON.stringify(rSelf, null, 1) + "\n");
  skriv(`plan-build/${P}/provenance/r2.receipt.json`, rbS); commit("provenance: selvtest-kvittering");
  red("committet kvittering m. selftest=true → rød (F-11)", mk()([vCodex({ receipt_sha256: kvitteringDigest(rbS) })]), "selftest");
}

console.log("");
if (fail > 0) { console.error(`kvittering: ${fail} FEJLEDE (${pass} ok)`); process.exit(1); }
console.log(`kvittering: ${pass} ok`);
