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
import { validateKvittering, makeApprovalVerifier, kvitteringDigest, KVITTERING_KEYS, validateTransportReceipt, makeTransportVerifier, udtraekVerdiktDraft } from "./kvittering.mjs";

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
  red("fremlaeggelse peger på et TREE (mappe) → rød (F-6: kun blob)", verifier()(approval(d), ctx), "ikke en fil \\(git-type tree\\)");
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
  // gyldig kæde @ H1 → verifier konstrueres (E = H1) → approval SLETTES i H2 → dommen SKAL stadig være grøn (E fastholdt)
  const kv = kvOk(); kv.frosset = "2026-09-09T23:00:00+02:00"; const d = skrivKv(kv); commit("kv H1"); skrivAp(d); commit("ap H1");
  const v = makeApprovalVerifier({ git, pakke: P, evidenceRef: "HEAD" });
  green("sanity @ H1: grøn", v(approval(d), ctx));
  rmSync(join(ROOT, AP)); commit("H2: approval slettet");
  green("verifier pinned @ H1 dømmer stadig grøn efter at HEAD flyttede til H2 (F-7: mutant j — flytbar ref — ville blive rød)", v(approval(d), ctx));
  red("NY verifier @ H2 (approval-fil slettet) → rød (approval mangler @ E — en slettet fil har stadig en berørings-commit)", makeApprovalVerifier({ git, pakke: P, evidenceRef: "HEAD" })(approval(d), ctx), "approval mangler @");
  // approval-objektet afviger fra den committede fil @ E → rød
  skrivAp(d); commit("H3a: approval tilbage");
  red("approval-objekt m. andet indhold end den committede approval → rød (indholds-binding)", makeApprovalVerifier({ git, pakke: P, evidenceRef: "HEAD" })({ ...approval(d), prerequisite_digests: [...digests].reverse() }, ctx), "digest-mismatch|prerequisite");
  // (approval allerede genskabt ovenfor)
  let t2 = false; try { makeApprovalVerifier({ git, pakke: P, evidenceRef: "findes-ikke" }); } catch { t2 = true; }
  t2 ? ok("ukendt evidens-ref kaster ved konstruktion (fail-closed)") : bad("evidens-ref", "kastede ikke");
}
{
  // P2 F-13 via git.mjs (mutant d): `git replace` af devil-blobben med en FAIL-blob må IKKE ændre dommen
  const kv = kvOk(); kv.frosset = "2026-09-09T23:30:00+02:00"; const d = skrivKv(kv); commit("kv rep"); skrivAp(d); commit("ap rep");
  green("sanity før replace: grøn", verifier()(approval(d), ctx));
  skriv(`plan-build/${P}/devil-fail-2.json`, devilJson("FAIL")); commit("fail-blob");
  const failOid = oid(`plan-build/${P}/devil-fail-2.json`);
  execFileSync("git", ["-C", ROOT, "replace", kv.devil.blob_oid, failOid]);
  const rawGit = (...a) => execFileSync("git", ["-C", ROOT, ...a], { encoding: "utf8" }).trim();
  rawGit("show", kv.devil.blob_oid).includes('"FAIL"') ? ok("kontrol: rå git (m. replace) viser nu FAIL-indholdet") : bad("replace-setup", "replace virkede ikke");
  green("verifier læser den ORIGINALE devil-blob trods git replace (--no-replace-objects i git.mjs, F-13)", verifier()(approval(d), ctx));
  execFileSync("git", ["-C", ROOT, "replace", "-d", kv.devil.blob_oid]);
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
red("regel_commit 'HEAD' (flytbar ref) → rød (F-18)", validateTransportReceipt({ ...rcOk(), regel_commit: "HEAD" }, tctx), "fast 40-hex commit-OID");
red("regel_commit 64-hex → rød (præcis 40)", validateTransportReceipt({ ...rcOk(), regel_commit: "a".repeat(64) }, tctx), "fast 40-hex commit-OID");
red("3 forsøg", validateTransportReceipt({ ...rcOk(), attempts: [rcOk().attempts[0], { ...rcOk().attempts[0], attempt: 2 }, { ...rcOk().attempts[0], attempt: 3 }] }, tctx), "antal forsøg");

console.log("\nudtraekVerdiktDraft — fence-parser (F-16):");
{
  const ud = (t) => udtraekVerdiktDraft(t);
  const blok = (o) => "```json verdikt-draft\n" + JSON.stringify(o) + "\n```";
  ud("x\n" + blok({ a: 1 }) + "\ny\n").ok ? ok("én aktiv blok → ok") : bad("aktiv blok", "");
  !ud("Dom: FAIL\n\n````markdown\n" + blok({ a: 1 }) + "\n````\n").ok ? ok("blok citeret i ````-fence → ikke aktiv (F-16)") : bad("citeret", "accepteret");
  !ud("tekst " + blok({ a: 1 }) + "\n").ok ? ok("inline åbner (tekst før backticks) → ikke aktiv") : bad("inline", "accepteret");
  !ud(blok({ a: 1 }) + "\n" + blok({ b: 2 }) + "\n").ok ? ok("to aktive blokke → rød") : bad("to blokke", "accepteret");
  !ud(blok({ a: 1 }) + "\n````markdown\n" + blok({ b: 2 }) + "\n````\n").ok ? ok("én aktiv + én citeret → PRÆCIS én? nej: den citerede ignoreres → ok=true forventes", "") : ok("én aktiv + én citeret → kun den aktive tæller");
  const r = ud(blok({ a: 1 }) + "\n````markdown\n" + blok({ b: 2 }) + "\n````\n"); r.ok && r.draft.a === 1 ? ok("… og det er den aktive (a:1) der udtrækkes") : bad("aktiv vs citeret", JSON.stringify(r));
  !ud("```json verdikt-draft\n{\"a\":1}\n").ok ? ok("uafsluttet fence → rød") : bad("uafsluttet", "accepteret");
  !ud("Dom: FAIL\n~~~markdown\n" + blok({ a: 1 }) + "\n~~~\n").ok ? ok("blok citeret i ~~~-fence → ikke aktiv (rest-F-16)") : bad("tilde-fence", "accepteret");
  !ud("Dom: FAIL\n  ````markdown\n" + blok({ a: 1 }) + "\n  ````\n").ok ? ok("blok citeret i INDRYKKET ````-fence (2 mellemrum) → ikke aktiv (rest-F-16)") : bad("indrykket fence", "accepteret");
  !ud("Dom: FAIL\n   ~~~~\n" + blok({ a: 1 }) + "\n   ~~~~\n").ok ? ok("blok citeret i indrykket ~~~~-fence (3 mellemrum) → ikke aktiv") : bad("indrykket tilde", "accepteret");
  !ud(" ```json verdikt-draft\n{\"a\":1}\n```\n").ok ? ok("indrykket aktiv-åbner (1 mellemrum) → ikke aktiv (kræver uindrykket)") : bad("indrykket aktiv", "accepteret");
  !ud("~~~json verdikt-draft\n{\"a\":1}\n~~~\n").ok ? ok("tilde-åbner m. draft-info → ikke aktiv (kræver backticks)") : bad("tilde aktiv", "accepteret");
  { const r2 = ud("~~~markdown\ntekst\n```\n~~~\n" + blok({ a: 1 }) + "\n"); r2.ok && r2.draft.a === 1 ? ok("``` inde i ~~~-fence lukker den ikke (kun samme tegn lukker) — den ægte blok bagefter findes") : bad("fence-tegn", JSON.stringify(r2)); }
  !ud("Dom: FAIL\n~~~markdown\n~~~\u00a0\n" + blok({ a: 1 }) + "\n~~~\n").ok ? ok("falsk lukker m. NBSP lukker IKKE den ydre fence → blokken forbliver citeret → rød (runde 5)") : bad("NBSP-lukker", "accepteret");
  !ud("Dom: FAIL\n~~~markdown\n~~~\u000b\n" + blok({ a: 1 }) + "\n~~~\n").ok ? ok("falsk lukker m. vertikal tab lukker IKKE → rød") : bad("VT-lukker", "accepteret");
  { const r3 = ud("~~~x\n~~~ \t\n" + blok({ a: 1 }) + "\n"); r3.ok ? ok("lukker m. almindelige mellemrum/tab lukker (CommonMark)") : bad("space-lukker", JSON.stringify(r3)); }
  // runde 6: skjulte ÅBNERE (U+2028/U+2029 i info-strengen, lone CR som linjeskift) skal ses som ydre fence → blokken forbliver citeret
  !ud("Dom: FAIL\n~~~mark\u2028down\n" + blok({ a: 1 }) + "\n~~~\n").ok ? ok("åbner m. U+2028 i info → fence ses, blok citeret → rød") : bad("U+2028-åbner", "accepteret");
  !ud("Dom: FAIL\n~~~mark\u2029down\n" + blok({ a: 1 }) + "\n~~~\n").ok ? ok("åbner m. U+2029 i info → rød") : bad("U+2029-åbner", "accepteret");
  !ud("Dom: FAIL\r~~~markdown\n" + blok({ a: 1 }) + "\n~~~\n").ok ? ok("lone CR som linjeskift før åbner → fence ses → rød") : bad("CR-åbner", "accepteret");
  !ud("Dom: FAIL\r  ````md\r" + blok({ a: 1 }) + "\r  ````\r").ok ? ok("lone-CR-dokument m. indrykket ````-citat → rød") : bad("CR-doc", "accepteret");
  // målehul (runde 6 mutant a): falsk-lukker-cases UDEN afsluttende ydre fence — en `\s*`-lukker ville gøre blokken aktiv (ok:true)
  !ud("Dom: FAIL\n~~~markdown\n~~~\u00a0\n" + blok({ a: 1 })).ok ? ok("NBSP-falsk-lukker uden afsluttende fence → stadig citeret (uafsluttet) → rød [dræber mutant a]") : bad("NBSP uden slut", "accepteret");
  !ud("Dom: FAIL\n~~~markdown\n~~~\u000b\n" + blok({ a: 1 })).ok ? ok("VT-falsk-lukker uden afsluttende fence → rød [dræber mutant a]") : bad("VT uden slut", "accepteret");
  { const r4 = ud("~~~x\n~~~\n" + blok({ a: 1 })); r4.ok ? ok("ægte lukker uden trailing whitespace → blokken efter er aktiv (kontrol)") : bad("ægte lukker", JSON.stringify(r4)); }
  !ud("````json verdikt-draft\n{}\n````\n").ok ? ok("fire backticks som åbner → ikke aktiv (kræver præcis tre)") : bad("4-fence", "accepteret");
  !ud("```json verdikt-draft\nikke json\n```\n").ok ? ok("ugyldig JSON i blokken → rød") : bad("json", "accepteret");
}

console.log("\nmakeTransportVerifier — mod committet provenance-arkiv:");
{
  // realistisk kæde: lås @ HEAD, rolle codex-angreb, leverance m. verdikt-draft-blok committet i provenance/
  const REPO_ROOT0 = new URL("../../", import.meta.url).pathname;
  const realLock = JSON.parse(readFileSync(join(REPO_ROOT0, "scripts/v5/actors.lock.json"), "utf8"));
  skriv("scripts/v5/actors.lock.json", JSON.stringify(realLock)); commit("lås i temp-repo");
  const LOCK_COMMIT = git("rev-parse", "HEAD");
  const draftObj = { aktor: "codex", conclusion: "PASS", negative_cases: ["n1"], claim_graph_refs: [], evidence: [{ path: ARTP, line_span: [1, 1] }] };
  const levTekst = (dr) => `# Analyse\n\nDom: se blok.\n\n\`\`\`json verdikt-draft\n${JSON.stringify(dr)}\n\`\`\`\n`;
  const lev = levTekst(draftObj); const levSha = kvitteringDigest(Buffer.from(lev));
  const receipt = { ...rcOk(), rolle: "codex-angreb", model: realLock["codex-angreb"].model, effort: realLock["codex-angreb"].reasoning, regel_commit: LOCK_COMMIT, skill_oid: realLock["codex-angreb"].skill_oid, attempts: [{ ...rcOk().attempts[0], model: realLock["codex-angreb"].model, effort: realLock["codex-angreb"].reasoning, output_sha256: levSha }] };
  const rb = Buffer.from(JSON.stringify(receipt, null, 1) + "\n"); const rsha = kvitteringDigest(rb);
  skriv(`plan-build/${P}/provenance/r1.receipt.json`, rb); skriv(`plan-build/${P}/provenance/r1.leverance.md`, lev); commit("provenance: kvittering + leverance r1");
  const mk = (over = {}) => makeTransportVerifier({ git, pakke: P, evidenceRef: "HEAD", gateId: "plan", commitSha: GC, artifactPath: ARTP, ...over });
  const vCodex = (run, top = {}) => ({ aktor: "codex", conclusion: "PASS", negative_cases: ["n1"], claim_graph_refs: [], evidence: [{ path: ARTP, line_span: [1, 1], blob_oid: "x", excerpt_sha: "y", commit_sha: GC }], ...top, run: { run_id: "r1", run_attempt: 1, raw_output_sha256: levSha, actor_server_id: "x", effort: realLock["codex-angreb"].reasoning, receipt_sha256: rsha, ...run } });
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
  // F-14: PASS-verdikt bundet til en leverance hvis draft siger noget andet → rød (dommen genudledes fra leverancen)
  red("verdikt.conclusion PASS men leverancens draft ≠ (FAIL) → rød (F-14)", mk()([vCodex({}, { conclusion: "FAIL" })]), "byttet efter kørslen|conclusion");
  red("verdikt.negative_cases ≠ leverancens → rød (F-14)", mk()([vCodex({}, { negative_cases: ["andet"] })]), "negative_cases");
  red("verdikt.evidence ≠ leverancens → rød (F-14)", mk()([vCodex({}, { evidence: [{ path: ARTP, line_span: [2, 2] }] })]), "evidence");
  // F-15: rolle/run-identitet/lås
  red("kvitteringens rolle ≠ gatens codex-rolle → rød (F-15)", (() => { const r2 = { ...receipt, rolle: "codex-forbedring", skill_oid: realLock["codex-forbedring"].skill_oid }; const b2 = Buffer.from(JSON.stringify(r2, null, 1) + "\n"); skriv(`plan-build/${P}/provenance/r-forb.receipt.json`, b2); commit("forbedring-kvittering"); return mk()([vCodex({ receipt_sha256: kvitteringDigest(b2) })]); })(), "gatens codex-rolle");
  red("verdiktets run_id ≠ kvitteringens → rød (F-15)", mk()([vCodex({ run_id: "andet" })]), "run_id");
  red("verdiktets run_attempt ≠ antal forsøg → rød (F-15)", mk()([vCodex({ run_attempt: 2 })]), "run_attempt");
  red("verdiktets effort ≠ kvitteringens → rød (F-15)", mk()([vCodex({ effort: "low" })]), "effort");
  {
    // ældre regel_commit m. ANDEN lås → rød
    const alt = structuredClone(realLock); alt["codex-angreb"].reasoning = "low";
    skriv("scripts/v5/actors.lock.json", JSON.stringify(alt)); commit("anden lås (low)");
    const OLD = git("rev-parse", "HEAD");
    skriv("scripts/v5/actors.lock.json", JSON.stringify(realLock)); commit("lås tilbage");
    const r3 = { ...receipt, regel_commit: OLD, effort: "low", attempts: [{ ...receipt.attempts[0], effort: "low" }] };
    const b3 = Buffer.from(JSON.stringify(r3, null, 1) + "\n"); skriv(`plan-build/${P}/provenance/r-old.receipt.json`, b3); commit("gammel-lås-kvittering");
    red("kvittering kørt under en ældre lås (low) end den gældende → rød (F-15)", mk()([vCodex({ receipt_sha256: kvitteringDigest(b3), effort: "low" })]), "anden lås");
  }
  // F-16: leverance hvor draften kun står som CITERET eksempel i en ````-blok → ingen aktiv blok → rød
  {
    const citeret = "Dom: FAIL\n\n````markdown\neksempel:\n```json verdikt-draft\n" + JSON.stringify(draftObj) + "\n```\n````\n";
    const cSha = kvitteringDigest(Buffer.from(citeret));
    const r4 = { ...receipt, attempts: [{ ...receipt.attempts[0], output_sha256: cSha }] }; const b4 = Buffer.from(JSON.stringify(r4, null, 1) + "\n");
    skriv(`plan-build/${P}/provenance/r-cit.receipt.json`, b4); skriv(`plan-build/${P}/provenance/r-cit.leverance.md`, citeret); commit("citeret draft");
    red("draft kun som citeret eksempel i ````-blok → ingen aktiv blok → rød (F-16)", mk()([vCodex({ receipt_sha256: kvitteringDigest(b4), raw_output_sha256: cSha })]), "PRÆCIS én aktiv");
  }
  {
    // F-18 (runde 5): regel_commit = ROD-TREE-OID (samme lås-blob resolves via <tree>:sti) → rød (skal være commit)
    const treeOid = git("rev-parse", `${LOCK_COMMIT}^{tree}`);
    const r6 = { ...receipt, run_id: "r6", regel_commit: treeOid }; const b6 = Buffer.from(JSON.stringify(r6, null, 1) + "\n");
    skriv(`plan-build/${P}/provenance/r6.receipt.json`, b6); commit("tree-regel_commit");
    red("regel_commit er et TREE-OID (samme lås-blob) → rød (F-18: git-type commit kræves)", mk()([vCodex({ receipt_sha256: kvitteringDigest(b6), run_id: "r6" })]), "ikke en commit");
    // ældre commit m. IDENTISK lås-blob → grøn (legitimt)
    skriv(`plan-build/${P}/støj2.md`, "x\n"); commit("støj efter lås");
    const r7 = { ...receipt, run_id: "r7", regel_commit: LOCK_COMMIT }; const b7 = Buffer.from(JSON.stringify(r7, null, 1) + "\n");
    skriv(`plan-build/${P}/provenance/r7.receipt.json`, b7); commit("ældre-commit-kvittering");
    green("ældre commit m. identisk lås-blob → grøn", mk()([vCodex({ receipt_sha256: kvitteringDigest(b7), run_id: "r7" })]));
  }
  red("ingen committet leverance for kvitteringens output_sha256 → rød (F-14)", (() => { const r5 = { ...receipt, run_id: "r5", attempts: [{ ...receipt.attempts[0], output_sha256: "a".repeat(64) }] }; const b5 = Buffer.from(JSON.stringify(r5, null, 1) + "\n"); skriv(`plan-build/${P}/provenance/r5.receipt.json`, b5); commit("kvittering uden leverance"); return mk()([vCodex({ receipt_sha256: kvitteringDigest(b5), run_id: "r5", raw_output_sha256: "a".repeat(64) })]); })(), "ingen committet leverance");
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
