#!/usr/bin/env node
// kvittering.selftest.mjs — red-team af godkendelses-kvitteringen (M-41 princip 9 / P2-gates F-1).
// Rækkefølge-beviset udøves mod RIGTIG git-historik (temp-repo): kvittering FØR approval = grøn;
// approval først · samme commit · kvittering ændret efter · digest-mismatch · ændret fremlæggelse ·
// devil ikke PASS · manglende kvittering = rød.
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { makeGit } from "./git.mjs";
import { scopeDigest } from "./gates.mjs";
import { validateKvittering, makeApprovalVerifier, kvitteringDigest, KVITTERING_KEYS } from "./kvittering.mjs";

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
skriv(`plan-build/${P}/plan.md`, "# plan\n"); skriv(`plan-build/${P}/fremlaeggelse-3.md`, "# fremlæggelse\n"); skriv(`plan-build/${P}/devil-plan.md`, "PASS\n");
commit("artefakter");
const oid = (p) => git("rev-parse", `HEAD:${p}`);
const ART = oid(`plan-build/${P}/plan.md`);
const bOids = { krav: "1".repeat(40), recon2: "2".repeat(40), p8: "3".repeat(40), ordbog: "4".repeat(40), killlist: "5".repeat(40) };
const digests = ["a".repeat(64), "b".repeat(64), "c".repeat(64)];
const ctx = { gateId: "plan", pakke: P, artifactOid: ART, expectedOids: bOids, expectedScope: scopeDigest("plan", ART, bOids), verdictDigests: digests };
const kvOk = () => ({
  schema_version: 1, gate_id: "plan", pakke: P, artifact_oid: ART, bindings_oids: { ...bOids }, scope_digest: ctx.expectedScope,
  prerequisite_digests: [...digests], fremlaeggelse: { path: `plan-build/${P}/fremlaeggelse-3.md`, blob_oid: oid(`plan-build/${P}/fremlaeggelse-3.md`) },
  devil: { path: `plan-build/${P}/devil-plan.md`, blob_oid: oid(`plan-build/${P}/devil-plan.md`), dom: "PASS" }, frosset: "2026-09-09T15:00:00+02:00",
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
  skriv(`plan-build/${P}/devil-plan.md`, "FAIL\n"); commit("devil ændret");
  red("devil-fil ændret efter kvittering → rød", verifier()(approval(d), ctx), "devil");
  skriv(`plan-build/${P}/devil-plan.md`, "PASS\n"); commit("devil tilbage");
}
{
  const v = makeApprovalVerifier({ git, pakke: P, evidenceRef: "HEAD", paths: { kvittering: `plan-build/${P}/findes-ikke.json`, approval: AP } });
  red("manglende kvittering @ evidenceRef → rød", v(approval("0".repeat(64)), ctx), "kvittering mangler");
  red("approval uden kvittering_digest → rød", verifier()({ login_server_verified: "mgrubak" }, ctx), "kvittering_digest");
  red("ugyldigt input (null) → rød", verifier()(null, ctx), "ugyldigt input");
}
let threw = false; try { makeApprovalVerifier({ pakke: P }); } catch { threw = true; }
threw ? ok("verifier uden git-dep kaster (fail-closed)") : bad("git-dep", "kastede ikke");

console.log("");
if (fail > 0) { console.error(`kvittering: ${fail} FEJLEDE (${pass} ok)`); process.exit(1); }
console.log(`kvittering: ${pass} ok`);
